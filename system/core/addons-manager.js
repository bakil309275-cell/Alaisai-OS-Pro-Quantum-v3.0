/**
 * Alaisai Quantum Addons Manager - مدير إضافات كمومي
 * @version 3.0.0
 */

const AlaisaiQuantumAddons = {
    version: '3.0.0',
    addons: new Map(),
    sandboxes: new Map(),
    permissions: new Map(),
    
    async init() {
        console.log('🔌 Quantum Addons Manager initializing...');
        
        // تحميل الإضافات المخزنة
        await this.loadStoredAddons();
        
        // إنشاء مجلد الإضافات
        await this.ensureAddonsFolder();
        
        return this;
    },
    
    async loadStoredAddons() {
        // من IndexedDB
        if (window.AlaisaiDistributedDB) {
            const stored = await window.AlaisaiDistributedDB.getAll('addons');
            stored.forEach(addon => this.addons.set(addon.id, addon));
        }
        
        // من OPFS
        if (window.AlaisaiFileManager) {
            try {
                const files = await window.AlaisaiFileManager.readOPFSDirectory('addons');
                for (const file of files) {
                    if (file.type === 'file' && file.name.endsWith('.json')) {
                        const content = await window.AlaisaiFileManager.readOPFSFile(file.path);
                        if (content) {
                            try {
                                const addon = JSON.parse(content.content);
                                if (!this.addons.has(addon.id)) {
                                    this.addons.set(addon.id, addon);
                                }
                            } catch (e) {}
                        }
                    }
                }
            } catch (err) {
                console.warn('⚠️ Could not load from OPFS:', err);
            }
        }
        
        console.log(`📦 Loaded ${this.addons.size} addons`);
    },
    
    async ensureAddonsFolder() {
        if (window.AlaisaiFileManager) {
            await window.AlaisaiFileManager.createOPFSDirectory('addons');
        }
    },
    
    async install(addonSource, type = 'url') {
        let addonData;
        
        try {
            if (type === 'url') {
                const response = await fetch(addonSource);
                addonData = await response.json();
            } else if (type === 'file') {
                addonData = addonSource;
            } else if (type === 'github') {
                // تحميل من GitHub
                const [owner, repo, path] = addonSource.split('/');
                const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
                const response = await fetch(url);
                const data = await response.json();
                const content = atob(data.content.replace(/\n/g, ''));
                addonData = JSON.parse(content);
            }
            
            if (!addonData || !addonData.id) {
                throw new Error('Invalid addon format');
            }
            
            // التحقق من الأمان
            await this.securityCheck(addonData);
            
            // تثبيت الإضافة
            const addon = {
                ...addonData,
                installedAt: Date.now(),
                enabled: true,
                permissions: addonData.permissions || []
            };
            
            this.addons.set(addon.id, addon);
            
            // حفظ في قاعدة البيانات
            if (window.AlaisaiDistributedDB) {
                await window.AlaisaiDistributedDB.put('addons', addon);
            }
            
            // حفظ في OPFS
            if (window.AlaisaiFileManager) {
                const fileName = `addons/${addon.id}.json`;
                await window.AlaisaiFileManager.writeOPFSFile(
                    fileName, 
                    JSON.stringify(addon, null, 2)
                );
            }
            
            // إنشاء صندوق معزول
            await this.createSandbox(addon);
            
            console.log(`✅ Addon installed: ${addon.name}`);
            return addon;
            
        } catch (err) {
            console.error('❌ Failed to install addon:', err);
            throw err;
        }
    },
    
    async securityCheck(addonData) {
        // قائمة بالأكواد الخطيرة
        const dangerousPatterns = [
            /eval\s*\(/,
            /Function\s*\(/,
            /document\.write/,
            /localStorage\.clear/,
            /indexedDB\.deleteDatabase/,
            /navigator\.sendBeacon/
        ];
        
        if (addonData.script) {
            for (const pattern of dangerousPatterns) {
                if (pattern.test(addonData.script)) {
                    throw new Error(`Dangerous code detected: ${pattern}`);
                }
            }
        }
        
        // التحقق من الصلاحيات المطلوبة
        const dangerousPermissions = ['filesystem:all', 'network:all', 'system:admin'];
        if (addonData.permissions) {
            for (const perm of dangerousPermissions) {
                if (addonData.permissions.includes(perm)) {
                    // طلب موافقة المستخدم
                    const confirmed = confirm(
                        `⚠️ الإضافة ${addonData.name} تطلب صلاحية خطيرة: ${perm}\nهل توافق؟`
                    );
                    if (!confirmed) {
                        throw new Error('Permission denied by user');
                    }
                }
            }
        }
    },
    
    async createSandbox(addon) {
        // إنشاء iframe معزول
        const iframe = document.createElement('iframe');
        iframe.sandbox = 'allow-scripts allow-same-origin';
        iframe.style.display = 'none';
        
        // إنشاء API آمن للإضافة
        const secureAPI = {
            storage: {
                get: (key) => this.getAddonStorage(addon.id, key),
                set: (key, value) => this.setAddonStorage(addon.id, key, value)
            },
            ui: {
                notify: (message, type) => {
                    if (window.AlaisaiUI) {
                        window.AlaisaiUI.notifications.show(message, type);
                    }
                }
            },
            system: {
                getInfo: () => ({
                    version: AlaisaiQuantumAddons.version,
                    addonId: addon.id
                })
            }
        };
        
        // تحميل الإضافة في الصندوق
        const blob = new Blob([`
            window.secureAPI = ${JSON.stringify(secureAPI)};
            ${addon.script || ''}
            if (typeof init === 'function') init();
        `], { type: 'application/javascript' });
        
        iframe.src = URL.createObjectURL(blob);
        document.body.appendChild(iframe);
        
        this.sandboxes.set(addon.id, {
            iframe,
            api: secureAPI,
            storage: new Map()
        });
    },
    
    getAddonStorage(addonId, key) {
        const sandbox = this.sandboxes.get(addonId);
        return sandbox?.storage.get(key);
    },
    
    setAddonStorage(addonId, key, value) {
        const sandbox = this.sandboxes.get(addonId);
        if (sandbox) {
            sandbox.storage.set(key, value);
            
            // حفظ في التخزين الدائم
            if (window.AlaisaiDistributedDB) {
                window.AlaisaiDistributedDB.put('addons_storage', {
                    id: `${addonId}_${key}`,
                    addonId,
                    key,
                    value
                }).catch(() => {});
            }
        }
    },
    
    async uninstall(addonId) {
        const addon = this.addons.get(addonId);
        if (!addon) return false;
        
        // إزالة الصندوق
        const sandbox = this.sandboxes.get(addonId);
        if (sandbox) {
            sandbox.iframe.remove();
            this.sandboxes.delete(addonId);
        }
        
        // حذف من الذاكرة
        this.addons.delete(addonId);
        
        // حذف من قاعدة البيانات
        if (window.AlaisaiDistributedDB) {
            await window.AlaisaiDistributedDB.delete('addons', addonId);
        }
        
        // حذف من OPFS
        if (window.AlaisaiFileManager) {
            const fileName = `addons/${addonId}.json`;
            await window.AlaisaiFileManager.deleteOPFSFile(fileName).catch(() => {});
        }
        
        console.log(`🗑️ Addon uninstalled: ${addon.name}`);
        return true;
    },
    
    async enable(addonId) {
        const addon = this.addons.get(addonId);
        if (addon) {
            addon.enabled = true;
            await this.createSandbox(addon);
            
            if (window.AlaisaiDistributedDB) {
                await window.AlaisaiDistributedDB.put('addons', addon);
            }
        }
    },
    
    async disable(addonId) {
        const addon = this.addons.get(addonId);
        if (addon) {
            addon.enabled = false;
            
            const sandbox = this.sandboxes.get(addonId);
            if (sandbox) {
                sandbox.iframe.remove();
                this.sandboxes.delete(addonId);
            }
            
            if (window.AlaisaiDistributedDB) {
                await window.AlaisaiDistributedDB.put('addons', addon);
            }
        }
    },
    
    listAddons() {
        return Array.from(this.addons.values());
    },
    
    getAddon(id) {
        return this.addons.get(id);
    },
    
    renderAddonsManager() {
        const addons = this.listAddons();
        
        return `
            <div style="padding:20px; background:rgba(0,0,0,0.3); border-radius:15px;">
                <h3 style="color:#4cc9f0; margin-bottom:20px;">📦 مدير الإضافات الكمومي</h3>
                
                <div style="display:grid; gap:15px;">
                    ${addons.map(addon => `
                        <div style="display:flex; align-items:center; gap:15px; background:rgba(255,255,255,0.05); padding:15px; border-radius:10px;">
                            <span style="font-size:32px;">${addon.icon || '📦'}</span>
                            <div style="flex:1;">
                                <div style="font-weight:bold;">${addon.name}</div>
                                <div style="font-size:12px; color:#888;">الإصدار: ${addon.version || '1.0.0'}</div>
                                <div style="font-size:12px; color:#888;">بواسطة: ${addon.author || 'غير معروف'}</div>
                            </div>
                            <div>
                                <button class="file-btn" onclick="AlaisaiQuantumAddons.toggleAddon('${addon.id}')" 
                                        style="background:${addon.enabled ? '#4ade80' : '#f72585'};">
                                    ${addon.enabled ? '✅ مفعل' : '❌ معطل'}
                                </button>
                                <button class="file-btn" onclick="AlaisaiQuantumAddons.uninstall('${addon.id}')" 
                                        style="background:#f72585;">🗑️</button>
                            </div>
                        </div>
                    `).join('')}
                    
                    ${addons.length === 0 ? `
                        <div style="text-align:center; padding:40px; color:#888;">
                            📭 لا توجد إضافات مثبتة
                        </div>
                    ` : ''}
                </div>
                
                <div style="margin-top:20px; display:flex; gap:10px;">
                    <button class="adm-btn" onclick="AlaisaiQuantumAddons.installFromFile()" style="background:#4cc9f0;">
                        📁 تثبيت من ملف
                    </button>
                    <button class="adm-btn" onclick="AlaisaiQuantumAddons.installFromURL()" style="background:#4ade80;">
                        🌐 تثبيت من رابط
                    </button>
                </div>
            </div>
        `;
    },
    
    async installFromFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                try {
                    const addonData = JSON.parse(e.target.result);
                    await this.install(addonData, 'file');
                    alert('✅ تم تثبيت الإضافة بنجاح');
                    location.reload();
                } catch (err) {
                    alert('❌ فشل التثبيت: ' + err.message);
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    },
    
    async installFromURL() {
        const url = prompt('أدخل رابط الإضافة (JSON):');
        if (!url) return;
        
        try {
            await this.install(url, 'url');
            alert('✅ تم تثبيت الإضافة بنجاح');
            location.reload();
        } catch (err) {
            alert('❌ فشل التثبيت: ' + err.message);
        }
    },
    
    async toggleAddon(id) {
        const addon = this.addons.get(id);
        if (addon) {
            if (addon.enabled) {
                await this.disable(id);
            } else {
                await this.enable(id);
            }
            // تحديث الواجهة
            const container = document.getElementById('addons-container');
            if (container) {
                container.innerHTML = this.renderAddonsManager();
            }
        }
    }
};

if (window.AlaisaiCore) {
    AlaisaiCore.registerModule('AlaisaiQuantumAddons', AlaisaiQuantumAddons);
}

window.AlaisaiQuantumAddons = AlaisaiQuantumAddons;
console.log('🔌 Quantum Addons Manager ready');