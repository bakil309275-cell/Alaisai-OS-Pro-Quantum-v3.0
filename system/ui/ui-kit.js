/**
 * Alaisai Quantum UI Kit - مكتبة واجهات متكاملة
 * @version 3.0.0
 */

const AlaisaiQuantumUI = {
    version: '3.0.0',
    notifications: {
        container: null,
        
        init() {
            if (!this.container) {
                this.container = document.createElement('div');
                this.container.className = 'quantum-notifications';
                this.container.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 9999;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                `;
                document.body.appendChild(this.container);
            }
            return this;
        },
        
        show(message, type = 'info', duration = 3000) {
            this.init();
            
            const id = 'notif_' + Date.now();
            const colors = {
                success: '#4ade80',
                error: '#f72585',
                warning: '#fbbf24',
                info: '#4cc9f0'
            };
            
            const notification = document.createElement('div');
            notification.id = id;
            notification.style.cssText = `
                background: rgba(0,0,0,0.8);
                backdrop-filter: blur(10px);
                border-right: 4px solid ${colors[type]};
                color: white;
                padding: 15px 25px;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                gap: 15px;
                transform: translateX(100%);
                animation: slideIn 0.3s forwards;
            `;
            
            notification.innerHTML = `
                <span style="font-size:20px;">${this.getIcon(type)}</span>
                <span>${message}</span>
                <button onclick="AlaisaiQuantumUI.notifications.close('${id}')" 
                        style="background:none; border:none; color:white; cursor:pointer; font-size:18px;">&times;</button>
            `;
            
            this.container.appendChild(notification);
            
            if (duration > 0) {
                setTimeout(() => this.close(id), duration);
            }
            
            return id;
        },
        
        close(id) {
            const notif = document.getElementById(id);
            if (notif) {
                notif.style.animation = 'slideOut 0.3s forwards';
                setTimeout(() => notif.remove(), 300);
            }
        },
        
        getIcon(type) {
            const icons = {
                success: '✅',
                error: '❌',
                warning: '⚠️',
                info: 'ℹ️'
            };
            return icons[type] || '📢';
        },
        
        success(message, duration) {
            return this.show(message, 'success', duration);
        },
        
        error(message, duration) {
            return this.show(message, 'error', duration);
        },
        
        warning(message, duration) {
            return this.show(message, 'warning', duration);
        },
        
        info(message, duration) {
            return this.show(message, 'info', duration);
        }
    },
    
    dialog: {
        show(options = {}) {
            const {
                title = 'تأكيد',
                message = '',
                type = 'confirm',
                confirmText = 'تأكيد',
                cancelText = 'إلغاء',
                onConfirm = () => {},
                onCancel = () => {}
            } = options;
            
            const id = 'dialog_' + Date.now();
            
            const dialog = document.createElement('div');
            dialog.id = id;
            dialog.style.cssText = `
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.8);
                backdrop-filter: blur(10px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: fadeIn 0.3s;
            `;
            
            dialog.innerHTML = `
                <div style="
                    background: linear-gradient(135deg, #1a1a2a, #16213e);
                    border: 1px solid #4cc9f0;
                    border-radius: 20px;
                    padding: 30px;
                    max-width: 400px;
                    width: 90%;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
                    animation: scaleIn 0.3s;
                ">
                    <h3 style="color:#4cc9f0; margin-bottom:20px;">${title}</h3>
                    <p style="margin-bottom:30px;">${message}</p>
                    <div style="display:flex; gap:10px; justify-content:flex-end;">
                        ${type !== 'alert' ? `
                            <button class="dialog-btn cancel" onclick="AlaisaiQuantumUI.dialog.close('${id}'); (${onCancel})()">
                                ${cancelText}
                            </button>
                        ` : ''}
                        <button class="dialog-btn confirm" onclick="AlaisaiQuantumUI.dialog.close('${id}'); (${onConfirm})()">
                            ${confirmText}
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(dialog);
            return id;
        },
        
        close(id) {
            const dialog = document.getElementById(id);
            if (dialog) {
                dialog.style.animation = 'fadeOut 0.3s';
                setTimeout(() => dialog.remove(), 300);
            }
        },
        
        alert(message, title = 'تنبيه') {
            return this.show({ title, message, type: 'alert' });
        },
        
        confirm(message, onConfirm, onCancel, title = 'تأكيد') {
            return this.show({ title, message, onConfirm, onCancel });
        },
        
        prompt(message, defaultValue = '', callback) {
            const id = 'prompt_' + Date.now();
            
            const dialog = document.createElement('div');
            dialog.id = id;
            dialog.style.cssText = `
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.8);
                backdrop-filter: blur(10px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            `;
            
            dialog.innerHTML = `
                <div style="
                    background: linear-gradient(135deg, #1a1a2a, #16213e);
                    border: 1px solid #4cc9f0;
                    border-radius: 20px;
                    padding: 30px;
                    max-width: 400px;
                    width: 90%;
                ">
                    <h3 style="color:#4cc9f0; margin-bottom:20px;">إدخال</h3>
                    <p style="margin-bottom:20px;">${message}</p>
                    <input type="text" id="${id}_input" value="${defaultValue}" 
                           style="width:100%; padding:10px; margin-bottom:20px; background:#0f0f1f; border:1px solid #4cc9f0; border-radius:5px; color:white;">
                    <div style="display:flex; gap:10px; justify-content:flex-end;">
                        <button class="dialog-btn cancel" onclick="AlaisaiQuantumUI.dialog.close('${id}')">إلغاء</button>
                        <button class="dialog-btn confirm" onclick="AlaisaiQuantumUI.dialog.handlePrompt('${id}', ${callback})">موافق</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(dialog);
            document.getElementById(`${id}_input`).focus();
        },
        
        handlePrompt(id, callback) {
            const value = document.getElementById(`${id}_input`).value;
            this.close(id);
            if (callback) callback(value);
        }
    },
    
    loader: {
        show(message = 'جاري التحميل...') {
            const id = 'loader_' + Date.now();
            
            const loader = document.createElement('div');
            loader.id = id;
            loader.style.cssText = `
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.7);
                backdrop-filter: blur(5px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10001;
            `;
            
            loader.innerHTML = `
                <div style="text-align:center;">
                    <div class="quantum-spinner" style="
                        width: 60px;
                        height: 60px;
                        margin: 0 auto 20px;
                        border: 4px solid rgba(76,201,240,0.3);
                        border-top-color: #4cc9f0;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    "></div>
                    <p style="color:white;">${message}</p>
                </div>
            `;
            
            document.body.appendChild(loader);
            return id;
        },
        
        hide(id) {
            const loader = document.getElementById(id);
            if (loader) {
                loader.style.animation = 'fadeOut 0.3s';
                setTimeout(() => loader.remove(), 300);
            }
        }
    },
    
    toast: {
        show(message, type = 'info', duration = 2000) {
            const toast = document.createElement('div');
            const colors = {
                success: '#4ade80',
                error: '#f72585',
                warning: '#fbbf24',
                info: '#4cc9f0'
            };
            
            toast.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0,0,0,0.9);
                backdrop-filter: blur(10px);
                border-bottom: 3px solid ${colors[type]};
                color: white;
                padding: 12px 30px;
                border-radius: 50px;
                font-size: 14px;
                z-index: 10002;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                animation: slideUp 0.3s;
            `;
            
            toast.innerHTML = message;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.style.animation = 'slideDown 0.3s';
                setTimeout(() => toast.remove(), 300);
            }, duration);
        },
        
        success(message) {
            this.show(message, 'success');
        },
        
        error(message) {
            this.show(message, 'error');
        },
        
        warning(message) {
            this.show(message, 'warning');
        },
        
        info(message) {
            this.show(message, 'info');
        }
    },
    
    progress: {
        show() {
            const id = 'progress_' + Date.now();
            
            const bar = document.createElement('div');
            bar.id = id;
            bar.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 0%;
                height: 3px;
                background: linear-gradient(90deg, #4cc9f0, #f72585);
                z-index: 10003;
                transition: width 0.3s;
                box-shadow: 0 0 20px #4cc9f0;
            `;
            
            document.body.appendChild(bar);
            
            return {
                set: (percent) => {
                    bar.style.width = percent + '%';
                },
                hide: () => {
                    bar.style.opacity = '0';
                    setTimeout(() => bar.remove(), 300);
                }
            };
        }
    },
    
    tooltip: {
        show(element, text) {
            const tooltip = document.createElement('div');
            tooltip.className = 'quantum-tooltip';
            tooltip.textContent = text;
            
            const rect = element.getBoundingClientRect();
            tooltip.style.cssText = `
                position: fixed;
                top: ${rect.top - 30}px;
                left: ${rect.left + rect.width/2}px;
                transform: translateX(-50%);
                background: rgba(0,0,0,0.9);
                color: white;
                padding: 5px 10px;
                border-radius: 5px;
                font-size: 12px;
                z-index: 10004;
                pointer-events: none;
                animation: fadeIn 0.2s;
            `;
            
            document.body.appendChild(tooltip);
            
            element.addEventListener('mouseleave', () => {
                tooltip.remove();
            }, { once: true });
        }
    },
    
    createButton(options = {}) {
        const {
            text = 'زر',
            icon = '',
            variant = 'primary',
            size = 'medium',
            onClick = () => {}
        } = options;
        
        const button = document.createElement('button');
        button.className = `quantum-btn quantum-btn-${variant} quantum-btn-${size}`;
        
        const variants = {
            primary: 'background: linear-gradient(135deg, #4cc9f0, #3aa8d0);',
            success: 'background: linear-gradient(135deg, #4ade80, #3bc46a);',
            danger: 'background: linear-gradient(135deg, #f72585, #d41e6e);',
            warning: 'background: linear-gradient(135deg, #fbbf24, #f59e0b);',
            outline: 'background: transparent; border: 2px solid #4cc9f0; color: #4cc9f0;'
        };
        
        const sizes = {
            small: 'padding: 5px 10px; font-size: 12px;',
            medium: 'padding: 10px 20px; font-size: 14px;',
            large: 'padding: 15px 30px; font-size: 16px;'
        };
        
        button.style.cssText = `
            ${variants[variant] || variants.primary}
            ${sizes[size] || sizes.medium}
            border: none;
            border-radius: 8px;
            color: white;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s;
            font-weight: 500;
        `;
        
        if (icon) {
            button.innerHTML = `<span>${icon}</span> <span>${text}</span>`;
        } else {
            button.textContent = text;
        }
        
        button.addEventListener('click', onClick);
        
        return button;
    },
    
    createCard(options = {}) {
        const {
            title = '',
            content = '',
            footer = '',
            image = '',
            width = '300px'
        } = options;
        
        const card = document.createElement('div');
        card.style.cssText = `
            background: rgba(255,255,255,0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 15px;
            padding: 20px;
            width: ${width};
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            transition: transform 0.3s;
        `;
        
        card.onmouseover = () => card.style.transform = 'translateY(-5px)';
        card.onmouseout = () => card.style.transform = 'none';
        
        if (image) {
            const img = document.createElement('img');
            img.src = image;
            img.style.cssText = 'width:100%; border-radius:10px; margin-bottom:15px;';
            card.appendChild(img);
        }
        
        if (title) {
            const titleEl = document.createElement('h3');
            titleEl.style.cssText = 'color:#4cc9f0; margin-bottom:10px;';
            titleEl.textContent = title;
            card.appendChild(titleEl);
        }
        
        const contentEl = document.createElement('div');
        contentEl.innerHTML = content;
        card.appendChild(contentEl);
        
        if (footer) {
            const footerEl = document.createElement('div');
            footerEl.style.cssText = 'margin-top:15px; padding-top:15px; border-top:1px solid rgba(255,255,255,0.1);';
            footerEl.innerHTML = footer;
            card.appendChild(footerEl);
        }
        
        return card;
    },
    
    createModal(options = {}) {
        const {
            title = '',
            content = '',
            width = '500px'
        } = options;
        
        const id = 'modal_' + Date.now();
        
        const modal = document.createElement('div');
        modal.id = id;
        modal.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.8);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10005;
            opacity: 0;
            transition: opacity 0.3s;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: linear-gradient(135deg, #1a1a2a, #16213e);
            border: 1px solid #4cc9f0;
            border-radius: 20px;
            padding: 30px;
            width: ${width};
            max-width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            transform: scale(0.9);
            transition: transform 0.3s;
        `;
        
        modalContent.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h3 style="color:#4cc9f0;">${title}</h3>
                <button onclick="AlaisaiQuantumUI.closeModal('${id}')" 
                        style="background:none; border:none; color:white; font-size:24px; cursor:pointer;">&times;</button>
            </div>
            <div>${content}</div>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        setTimeout(() => {
            modal.style.opacity = '1';
            modalContent.style.transform = 'scale(1)';
        }, 10);
        
        return {
            id,
            close: () => this.closeModal(id)
        };
    },
    
    closeModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.style.opacity = '0';
            modal.firstChild.style.transform = 'scale(0.9)';
            setTimeout(() => modal.remove(), 300);
        }
    },
    
    createTabs(options = {}) {
        const {
            tabs = [],
            activeTab = 0,
            onChange = () => {}
        } = options;
        
        const container = document.createElement('div');
        
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            gap: 10px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            margin-bottom: 20px;
        `;
        
        const contents = document.createElement('div');
        
        tabs.forEach((tab, index) => {
            const tabBtn = document.createElement('button');
            tabBtn.textContent = tab.title;
            tabBtn.style.cssText = `
                padding: 10px 20px;
                background: ${index === activeTab ? '#4cc9f0' : 'transparent'};
                border: none;
                color: ${index === activeTab ? 'black' : 'white'};
                cursor: pointer;
                border-radius: 5px 5px 0 0;
                transition: all 0.3s;
            `;
            
            tabBtn.onclick = () => {
                // تحديث الأزرار
                header.querySelectorAll('button').forEach((btn, i) => {
                    btn.style.background = i === index ? '#4cc9f0' : 'transparent';
                    btn.style.color = i === index ? 'black' : 'white';
                });
                
                // تحديث المحتوى
                contents.innerHTML = tabs[index].content;
                
                onChange(index);
            };
            
            header.appendChild(tabBtn);
        });
        
        contents.innerHTML = tabs[activeTab]?.content || '';
        
        container.appendChild(header);
        container.appendChild(contents);
        
        return container;
    },
    
    createTable(options = {}) {
        const {
            headers = [],
            data = [],
            onRowClick = () => {}
        } = options;
        
        const table = document.createElement('table');
        table.style.cssText = `
            width: 100%;
            border-collapse: collapse;
            background: rgba(255,255,255,0.02);
            border-radius: 10px;
            overflow: hidden;
        `;
        
        // الرأس
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headerRow.style.cssText = 'background: rgba(76,201,240,0.1);';
        
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            th.style.cssText = 'padding: 12px; text-align: left; color: #4cc9f0;';
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // الجسم
        const tbody = document.createElement('tbody');
        
        data.forEach((row, index) => {
            const tr = document.createElement('tr');
            tr.style.cssText = `
                border-bottom: 1px solid rgba(255,255,255,0.05);
                cursor: pointer;
                transition: background 0.2s;
            `;
            
            tr.onmouseover = () => tr.style.background = 'rgba(255,255,255,0.05)';
            tr.onmouseout = () => tr.style.background = 'none';
            tr.onclick = () => onRowClick(row, index);
            
            headers.forEach(header => {
                const td = document.createElement('td');
                td.style.cssText = 'padding: 12px;';
                td.textContent = row[header] || '';
                tr.appendChild(td);
            });
            
            tbody.appendChild(tr);
        });
        
        table.appendChild(tbody);
        
        return table;
    },
    
    initAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            
            @keyframes slideUp {
                from { transform: translate(-50%, 100%); opacity: 0; }
                to { transform: translate(-50%, 0); opacity: 1; }
            }
            
            @keyframes slideDown {
                from { transform: translate(-50%, 0); opacity: 1; }
                to { transform: translate(-50%, 100%); opacity: 0; }
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            
            @keyframes scaleIn {
                from { transform: scale(0.9); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-10px); }
                75% { transform: translateX(10px); }
            }
        `;
        
        document.head.appendChild(style);
    }
};

// تهيئة التأثيرات
AlaisaiQuantumUI.initAnimations();

if (window.AlaisaiCore) {
    AlaisaiCore.registerModule('AlaisaiQuantumUI', AlaisaiQuantumUI);
}

window.AlaisaiQuantumUI = AlaisaiQuantumUI;
console.log('🎨 Quantum UI Kit ready');