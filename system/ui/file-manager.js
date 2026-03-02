/**
 * Alaisai Legendary File Manager - مدير ملفات أسطوري مع كل الميزات
 * @version 3.0.0
 */

const AlaisaiLegendaryFileManager = {
    version: '3.0.0',
    currentPath: '',
    currentSource: 'local',
    selectedItems: new Set(),
    clipboardItems: [],
    providers: {
        local: null,
        github: null,
        webdav: null,
        ipfs: null
    },
    
    async init() {
        console.log('📁 Legendary File Manager initializing...');
        
        // تهيئة OPFS
        await this.initOPFS();
        
        // استعادة الجلسات
        this.restoreSessions();
        
        return this;
    },
    
    async initOPFS() {
        try {
            this.providers.local = await navigator.storage.getDirectory();
            console.log('✅ OPFS initialized');
            
            // إنشاء المجلدات الأساسية
            await this.createDirectory('system');
            await this.createDirectory('addons');
            await this.createDirectory('backups');
            await this.createDirectory('documents');
            await this.createDirectory('images');
            
            return true;
        } catch (err) {
            console.error('❌ OPFS initialization failed:', err);
            return false;
        }
    },
    
    async createDirectory(path) {
        if (!this.providers.local) return false;
        
        try {
            const parts = path.split('/');
            let current = this.providers.local;
            
            for (const part of parts) {
                current = await current.getDirectoryHandle(part, { create: true });
            }
            
            return true;
        } catch (err) {
            console.error(`❌ Failed to create directory ${path}:`, err);
            return false;
        }
    },
    
    async readDirectory(path = '') {
        if (!this.providers.local) return [];
        
        try {
            const parts = path.split('/').filter(p => p);
            let current = this.providers.local;
            
            for (const part of parts) {
                current = await current.getDirectoryHandle(part);
            }
            
            const entries = [];
            for await (const entry of current.values()) {
                const file = entry.kind === 'file' ? await entry.getFile() : null;
                
                entries.push({
                    name: entry.name,
                    path: path ? `${path}/${entry.name}` : entry.name,
                    type: entry.kind,
                    size: file?.size || 0,
                    modified: file?.lastModified || Date.now(),
                    isDirectory: entry.kind === 'directory',
                    handle: entry
                });
            }
            
            // ترتيب: المجلدات أولاً ثم الملفات
            return entries.sort((a, b) => {
                if (a.isDirectory !== b.isDirectory) {
                    return a.isDirectory ? -1 : 1;
                }
                return a.name.localeCompare(b.name, 'ar');
            });
            
        } catch (err) {
            console.error(`❌ Failed to read directory ${path}:`, err);
            return [];
        }
    },
    
    async readFile(path) {
        if (!this.providers.local) return null;
        
        try {
            const parts = path.split('/');
            const fileName = parts.pop();
            let current = this.providers.local;
            
            for (const part of parts) {
                current = await current.getDirectoryHandle(part);
            }
            
            const fileHandle = await current.getFileHandle(fileName);
            const file = await fileHandle.getFile();
            const content = await file.text();
            
            return {
                content,
                name: fileName,
                path,
                size: file.size,
                modified: file.lastModified,
                handle: fileHandle
            };
        } catch (err) {
            console.error(`❌ Failed to read file ${path}:`, err);
            return null;
        }
    },
    
    async writeFile(path, content) {
        if (!this.providers.local) return false;
        
        try {
            const parts = path.split('/');
            const fileName = parts.pop();
            let current = this.providers.local;
            
            for (const part of parts) {
                current = await current.getDirectoryHandle(part, { create: true });
            }
            
            const fileHandle = await current.getFileHandle(fileName, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(content);
            await writable.close();
            
            return true;
        } catch (err) {
            console.error(`❌ Failed to write file ${path}:`, err);
            return false;
        }
    },
    
    async deleteFile(path) {
        if (!this.providers.local) return false;
        
        try {
            const parts = path.split('/');
            const fileName = parts.pop();
            let current = this.providers.local;
            
            for (const part of parts) {
                current = await current.getDirectoryHandle(part);
            }
            
            await current.removeEntry(fileName);
            return true;
        } catch (err) {
            console.error(`❌ Failed to delete file ${path}:`, err);
            return false;
        }
    },
    
    async copyFile(sourcePath, destPath) {
        const content = await this.readFile(sourcePath);
        if (!content) return false;
        
        return await this.writeFile(destPath, content.content);
    },
    
    async moveFile(sourcePath, destPath) {
        const copied = await this.copyFile(sourcePath, destPath);
        if (!copied) return false;
        
        return await this.deleteFile(sourcePath);
    },
    
    // ========== GitHub Integration ==========
    setGitHubToken(token, repo, branch = 'main') {
        this.providers.github = {
            token,
            repo,
            branch
        };
        
        sessionStorage.setItem('github_token', token);
        sessionStorage.setItem('github_repo', repo);
        sessionStorage.setItem('github_branch', branch);
    },
    
    async listGitHubContents(path = '') {
        if (!this.providers.github) {
            throw new Error('GitHub not configured');
        }
        
        const { token, repo, branch } = this.providers.github;
        const url = `https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`;
        
        const response = await fetch(url, {
            headers: token ? { Authorization: `token ${token}` } : {}
        });
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        return data.map(item => ({
            name: item.name,
            path: item.path,
            type: item.type,
            size: item.size,
            sha: item.sha,
            download_url: item.download_url,
            isDirectory: item.type === 'dir'
        })).sort((a, b) => {
            if (a.isDirectory !== b.isDirectory) {
                return a.isDirectory ? -1 : 1;
            }
            return a.name.localeCompare(b.name);
        });
    },
    
    async getGitHubFile(path) {
        if (!this.providers.github) return null;
        
        const { token, repo, branch } = this.providers.github;
        const url = `https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`;
        
        const response = await fetch(url, {
            headers: token ? { Authorization: `token ${token}` } : {}
        });
        
        if (!response.ok) return null;
        
        const data = await response.json();
        if (data.type !== 'file') return null;
        
        // فك تشفير base64
        const content = atob(data.content.replace(/\n/g, ''));
        
        return {
            content,
            sha: data.sha,
            size: data.size,
            name: data.name,
            path: data.path
        };
    },
    
    async saveGitHubFile(path, content, message = 'Update via Alaisai') {
        if (!this.providers.github) return false;
        
        const { token, repo, branch } = this.providers.github;
        
        // الحصول على sha إذا كان الملف موجوداً
        let sha;
        try {
            const existing = await this.getGitHubFile(path);
            sha = existing?.sha;
        } catch {}
        
        const url = `https://api.github.com/repos/${repo}/contents/${path}`;
        const encodedContent = btoa(unescape(encodeURIComponent(content)));
        
        const body = {
            message,
            content: encodedContent,
            branch
        };
        
        if (sha) body.sha = sha;
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                Authorization: `token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        
        return response.ok;
    },
    
    // ========== WebDAV Integration ==========
    setWebDAVCredentials(url, user, pass) {
        this.providers.webdav = { url, user, pass };
        
        sessionStorage.setItem('webdav_url', url);
        sessionStorage.setItem('webdav_user', user);
        if (pass) {
            sessionStorage.setItem('webdav_pass', btoa(pass));
        }
    },
    
    async webdavRequest(path, options = {}) {
        if (!this.providers.webdav) {
            throw new Error('WebDAV not configured');
        }
        
        const { url, user, pass } = this.providers.webdav;
        const fullUrl = url.endsWith('/') ? url + path : url + '/' + path;
        
        return await fetch(fullUrl, {
            ...options,
            headers: {
                'Authorization': 'Basic ' + btoa(user + ':' + pass),
                ...options.headers
            }
        });
    },
    
    async listWebDAVContents(path = '') {
        try {
            const response = await this.webdavRequest(path, {
                method: 'PROPFIND',
                headers: { 'Depth': '1' }
            });
            
            if (!response.ok) return [];
            
            const text = await response.text();
            const parser = new DOMParser();
            const xml = parser.parseFromString(text, 'application/xml');
            const responses = xml.querySelectorAll('response');
            
            const entries = [];
            for (const resp of responses) {
                const href = resp.querySelector('href')?.textContent;
                if (!href) continue;
                
                const name = decodeURIComponent(href.split('/').pop() || '');
                if (!name) continue;
                
                const isCollection = resp.querySelector('resourcetype collection') !== null;
                const size = resp.querySelector('getcontentlength')?.textContent;
                
                entries.push({
                    name,
                    path: path ? `${path}/${name}` : name,
                    type: isCollection ? 'dir' : 'file',
                    size: parseInt(size) || 0,
                    isDirectory: isCollection
                });
            }
            
            return entries.sort((a, b) => {
                if (a.isDirectory !== b.isDirectory) {
                    return a.isDirectory ? -1 : 1;
                }
                return a.name.localeCompare(b.name);
            });
            
        } catch (err) {
            console.error('❌ WebDAV list error:', err);
            return [];
        }
    },
    
    async getWebDAVFile(path) {
        try {
            const response = await this.webdavRequest(path, { method: 'GET' });
            if (!response.ok) return null;
            
            const content = await response.text();
            return { content };
        } catch (err) {
            console.error('❌ WebDAV read error:', err);
            return null;
        }
    },
    
    async saveWebDAVFile(path, content) {
        try {
            const response = await this.webdavRequest(path, {
                method: 'PUT',
                headers: { 'Content-Type': 'text/plain' },
                body: content
            });
            
            return response.ok;
        } catch (err) {
            console.error('❌ WebDAV write error:', err);
            return false;
        }
    },
    
    // ========== Selection Operations ==========
    selectItem(path, multi = false) {
        if (!multi) {
            this.selectedItems.clear();
        }
        
        if (this.selectedItems.has(path)) {
            this.selectedItems.delete(path);
        } else {
            this.selectedItems.add(path);
        }
    },
    
    selectAll() {
        // سيتم تنفيذها مع واجهة المستخدم
    },
    
    clearSelection() {
        this.selectedItems.clear();
    },
    
    copyToClipboard(cut = false) {
        this.clipboardItems = Array.from(this.selectedItems).map(path => ({
            path,
            source: this.currentSource,
            operation: cut ? 'cut' : 'copy'
        }));
    },
    
    async pasteFromClipboard() {
        for (const item of this.clipboardItems) {
            if (item.source !== this.currentSource) continue;
            
            const fileName = item.path.split('/').pop();
            const destPath = this.currentPath ? `${this.currentPath}/${fileName}` : fileName;
            
            if (item.operation === 'cut') {
                await this.moveFile(item.path, destPath);
            } else {
                await this.copyFile(item.path, destPath);
            }
        }
        
        this.clipboardItems = [];
    },
    
    // ========== UI Rendering ==========
    async renderExplorer(container, path = '', source = 'local') {
        this.currentPath = path;
        this.currentSource = source;
        
        let files = [];
        try {
            if (source === 'github') {
                files = await this.listGitHubContents(path);
            } else if (source === 'webdav') {
                files = await this.listWebDAVContents(path);
            } else {
                files = await this.readDirectory(path);
            }
        } catch (err) {
            console.error('Failed to load files:', err);
        }
        
        const pathParts = path.split('/').filter(p => p);
        
        const html = `
            <div class="file-manager" style="direction:ltr; text-align:left; height:100%; display:flex; flex-direction:column;">
                <div style="padding:15px; background:rgba(0,0,0,0.2); border-radius:10px; margin-bottom:15px;">
                    <div style="display:flex; gap:10px; margin-bottom:10px; flex-wrap:wrap;">
                        <button class="fm-btn" onclick="AlaisaiLegendaryFileManager.navigateTo('')">🏠</button>
                        ${pathParts.map((p, i) => {
                            const fullPath = pathParts.slice(0, i+1).join('/');
                            return `<button class="fm-btn" onclick="AlaisaiLegendaryFileManager.navigateTo('${fullPath}')">${p}</button>`;
                        }).join('')}
                        <span style="flex:1;"></span>
                        <button class="fm-btn" onclick="AlaisaiLegendaryFileManager.newFile()">📄 جديد</button>
                        <button class="fm-btn" onclick="AlaisaiLegendaryFileManager.newFolder()">📁 مجلد</button>
                        <button class="fm-btn" onclick="AlaisaiLegendaryFileManager.copyToClipboard(false)">📋 نسخ</button>
                        <button class="fm-btn" onclick="AlaisaiLegendaryFileManager.pasteFromClipboard()">📌 لصق</button>
                    </div>
                    
                    <div style="display:flex; gap:10px;">
                        <button class="fm-btn ${source === 'local' ? 'active' : ''}" 
                                onclick="AlaisaiLegendaryFileManager.switchSource('local')">💾 محلي</button>
                        <button class="fm-btn ${source === 'github' ? 'active' : ''}" 
                                onclick="AlaisaiLegendaryFileManager.switchSource('github')">🐙 GitHub</button>
                        <button class="fm-btn ${source === 'webdav' ? 'active' : ''}" 
                                onclick="AlaisaiLegendaryFileManager.switchSource('webdav')">☁️ WebDAV</button>
                    </div>
                </div>
                
                <div style="flex:1; overflow-y:auto; background:rgba(0,0,0,0.1); border-radius:10px; padding:10px;">
                    <table style="width:100%; border-collapse:collapse;">
                        <thead>
                            <tr style="background:rgba(255,255,255,0.05);">
                                <th style="padding:10px; text-align:left;">الاسم</th>
                                <th style="padding:10px; text-align:left;">الحجم</th>
                                <th style="padding:10px; text-align:left;">آخر تعديل</th>
                                <th style="padding:10px; text-align:left;">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${files.map(file => `
                                <tr style="border-bottom:1px solid rgba(255,255,255,0.05);" 
                                    ondblclick="AlaisaiLegendaryFileManager.openFile('${file.path}', ${file.isDirectory})">
                                    <td style="padding:10px;">
                                        <span style="font-size:20px; margin-right:10px;">${file.isDirectory ? '📁' : '📄'}</span>
                                        ${file.name}
                                    </td>
                                    <td style="padding:10px;">${file.isDirectory ? '—' : this.formatSize(file.size)}</td>
                                    <td style="padding:10px;">${new Date(file.modified).toLocaleString()}</td>
                                    <td style="padding:10px;">
                                        ${!file.isDirectory ? `
                                            <button class="fm-btn-small" onclick="AlaisaiLegendaryFileManager.viewFile('${file.path}')">👁️</button>
                                            <button class="fm-btn-small" onclick="AlaisaiLegendaryFileManager.editFile('${file.path}')">✏️</button>
                                        ` : ''}
                                        <button class="fm-btn-small" onclick="AlaisaiLegendaryFileManager.downloadFile('${file.path}')">⬇️</button>
                                        <button class="fm-btn-small" onclick="AlaisaiLegendaryFileManager.deleteFile('${file.path}')">🗑️</button>
                                    </td>
                                </tr>
                            `).join('')}
                            
                            ${files.length === 0 ? `
                                <tr>
                                    <td colspan="4" style="padding:40px; text-align:center; color:#888;">
                                        📭 المجلد فارغ
                                    </td>
                                </tr>
                            ` : ''}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        if (container) {
            container.innerHTML = html;
        }
        
        return html;
    },
    
    formatSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    async navigateTo(path) {
        this.currentPath = path;
        await this.renderExplorer(
            document.getElementById('file-manager-container'), 
            path, 
            this.currentSource
        );
    },
    
    async switchSource(source) {
        this.currentSource = source;
        this.currentPath = '';
        await this.renderExplorer(
            document.getElementById('file-manager-container'),
            '',
            source
        );
    },
    
    async openFile(path, isDirectory) {
        if (isDirectory) {
            await this.navigateTo(path);
        } else {
            await this.viewFile(path);
        }
    },
    
    async viewFile(path) {
        const file = await this.readFile(path);
        if (!file) return;
        
        const content = `
            <div style="padding:20px; background:rgba(0,0,0,0.3); border-radius:10px;">
                <h3 style="color:#4cc9f0;">📄 ${file.name}</h3>
                <pre style="background:#1a1a2a; padding:20px; border-radius:8px; overflow-x:auto;">${this.escapeHtml(file.content)}</pre>
                <button onclick="AlaisaiLegendaryFileManager.editFile('${path}')" style="margin-top:10px; padding:10px 20px; background:#4cc9f0; border:none; border-radius:5px; cursor:pointer;">✏️ تعديل</button>
            </div>
        `;
        
        if (window.AlaisaiQuantum) {
            window.AlaisaiQuantum.openApp({
                id: 'viewer',
                name: file.name,
                content
            });
        }
    },
    
    async editFile(path) {
        const file = await this.readFile(path);
        if (!file) return;
        
        const content = `
            <div style="padding:20px; background:rgba(0,0,0,0.3); border-radius:10px;">
                <h3 style="color:#4cc9f0;">✏️ ${file.name}</h3>
                <textarea id="file-editor" style="width:100%; height:400px; background:#1a1a2a; color:#fff; border:1px solid #4cc9f0; padding:15px; border-radius:8px; font-family:monospace;">${this.escapeHtml(file.content)}</textarea>
                <div style="margin-top:10px; display:flex; gap:10px;">
                    <button onclick="AlaisaiLegendaryFileManager.saveFile('${path}')" style="padding:10px 20px; background:#4ade80; border:none; border-radius:5px; cursor:pointer;">💾 حفظ</button>
                    <button onclick="AlaisaiLegendaryFileManager.cancelEdit()" style="padding:10px 20px; background:#f72585; border:none; border-radius:5px; cursor:pointer;">❌ إلغاء</button>
                </div>
            </div>
        `;
        
        if (window.AlaisaiQuantum) {
            window.AlaisaiQuantum.openApp({
                id: 'editor',
                name: `تعديل ${file.name}`,
                content
            });
        }
    },
    
    async saveFile(path) {
        const editor = document.getElementById('file-editor');
        if (!editor) return;
        
        const success = await this.writeFile(path, editor.value);
        if (success) {
            alert('✅ تم الحفظ بنجاح');
            window.AlaisaiQuantum.closeStage();
        } else {
            alert('❌ فشل الحفظ');
        }
    },
    
    cancelEdit() {
        window.AlaisaiQuantum.closeStage();
    },
    
    async newFile() {
        const name = prompt('اسم الملف الجديد:');
        if (!name) return;
        
        const path = this.currentPath ? `${this.currentPath}/${name}` : name;
        const success = await this.writeFile(path, '');
        
        if (success) {
            await this.renderExplorer(
                document.getElementById('file-manager-container'),
                this.currentPath,
                this.currentSource
            );
        }
    },
    
    async newFolder() {
        const name = prompt('اسم المجلد الجديد:');
        if (!name) return;
        
        const path = this.currentPath ? `${this.currentPath}/${name}` : name;
        const success = await this.createDirectory(path);
        
        if (success) {
            await this.renderExplorer(
                document.getElementById('file-manager-container'),
                this.currentPath,
                this.currentSource
            );
        }
    },
    
    async downloadFile(path) {
        const file = await this.readFile(path);
        if (!file) return;
        
        const blob = new Blob([file.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
    },
    
    escapeHtml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },
    
    restoreSessions() {
        // استعادة GitHub
        const token = sessionStorage.getItem('github_token');
        const repo = sessionStorage.getItem('github_repo');
        const branch = sessionStorage.getItem('github_branch');
        if (token && repo) {
            this.setGitHubToken(token, repo, branch);
        }
        
        // استعادة WebDAV
        const url = sessionStorage.getItem('webdav_url');
        const user = sessionStorage.getItem('webdav_user');
        const pass = sessionStorage.getItem('webdav_pass');
        if (url && user && pass) {
            this.setWebDAVCredentials(url, user, atob(pass));
        }
    }
};

if (window.AlaisaiCore) {
    AlaisaiCore.registerModule('AlaisaiLegendaryFileManager', AlaisaiLegendaryFileManager);
}

window.AlaisaiLegendaryFileManager = AlaisaiLegendaryFileManager;
console.log('📁 Legendary File Manager ready');