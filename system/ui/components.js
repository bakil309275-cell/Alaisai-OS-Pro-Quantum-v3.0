/**
 * Alaisai Quantum Components - مكتبة المكونات المتكاملة
 * @version 3.0.0
 */

const AlaisaiQuantumComponents = {
    version: '3.0.0',
    registry: new Map(),
    
    register(name, component) {
        this.registry.set(name, component);
        console.log(`🧩 Component registered: ${name}`);
    },
    
    render(name, props = {}) {
        const component = this.registry.get(name);
        if (!component) {
            console.error(`Component ${name} not found`);
            return '';
        }
        
        return component.render(props);
    },
    
    createElement(tag, props = {}, children = []) {
        const element = document.createElement(tag);
        
        // إضافة الخصائص
        Object.entries(props).forEach(([key, value]) => {
            if (key === 'style' && typeof value === 'object') {
                Object.assign(element.style, value);
            } else if (key.startsWith('on') && typeof value === 'function') {
                element.addEventListener(key.slice(2).toLowerCase(), value);
            } else {
                element.setAttribute(key, value);
            }
        });
        
        // إضافة الأطفال
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof HTMLElement) {
                element.appendChild(child);
            }
        });
        
        return element;
    }
};

// ===== المكونات =====

// زر كمومي
AlaisaiQuantumComponents.register('QuantumButton', {
    render: (props = {}) => {
        const {
            text = 'زر',
            icon = '',
            variant = 'primary',
            size = 'medium',
            disabled = false,
            fullWidth = false,
            onClick = ''
        } = props;
        
        const variants = {
            primary: '#4cc9f0',
            success: '#4ade80',
            danger: '#f72585',
            warning: '#fbbf24',
            outline: 'transparent'
        };
        
        const sizes = {
            small: '8px 16px',
            medium: '12px 24px',
            large: '16px 32px'
        };
        
        const style = `
            padding: ${sizes[size]};
            background: ${variants[variant]};
            border: ${variant === 'outline' ? '2px solid #4cc9f0' : 'none'};
            color: ${variant === 'outline' ? '#4cc9f0' : 'white'};
            border-radius: 8px;
            cursor: ${disabled ? 'not-allowed' : 'pointer'};
            opacity: ${disabled ? 0.5 : 1};
            width: ${fullWidth ? '100%' : 'auto'};
            font-size: ${size === 'small' ? '12px' : size === 'medium' ? '14px' : '16px'};
            font-weight: 500;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: all 0.3s;
            box-shadow: ${variant !== 'outline' ? '0 4px 15px rgba(76,201,240,0.3)' : 'none'};
        `;
        
        return `
            <button style="${style}" onclick="${onClick}" ${disabled ? 'disabled' : ''}>
                ${icon ? `<span style="font-size:1.2em;">${icon}</span>` : ''}
                <span>${text}</span>
            </button>
        `;
    }
});

// بطاقة كمومية
AlaisaiQuantumComponents.register('QuantumCard', {
    render: (props = {}) => {
        const {
            title = '',
            subtitle = '',
            content = '',
            footer = '',
            image = '',
            width = '300px',
            gradient = false
        } = props;
        
        const style = `
            background: ${gradient ? 'linear-gradient(135deg, #4cc9f020, #f7258520)' : 'rgba(255,255,255,0.05)'};
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 15px;
            padding: 20px;
            width: ${width};
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            transition: transform 0.3s;
        `;
        
        return `
            <div style="${style}" class="quantum-card">
                ${image ? `<img src="${image}" style="width:100%; border-radius:10px; margin-bottom:15px;">` : ''}
                ${title ? `<h3 style="color:#4cc9f0; margin-bottom:5px;">${title}</h3>` : ''}
                ${subtitle ? `<h4 style="color:#888; margin-bottom:15px;">${subtitle}</h4>` : ''}
                <div style="margin-bottom:${footer ? '15px' : '0'};">${content}</div>
                ${footer ? `<div style="margin-top:15px; padding-top:15px; border-top:1px solid rgba(255,255,255,0.1);">${footer}</div>` : ''}
            </div>
        `;
    }
});

// حقل إدخال كمومي
AlaisaiQuantumComponents.register('QuantumInput', {
    render: (props = {}) => {
        const {
            type = 'text',
            placeholder = '',
            value = '',
            label = '',
            error = '',
            disabled = false,
            required = false,
            onChange = ''
        } = props;
        
        return `
            <div style="margin-bottom:15px;">
                ${label ? `<label style="display:block; margin-bottom:5px; color:#4cc9f0;">${label}</label>` : ''}
                <input
                    type="${type}"
                    placeholder="${placeholder}"
                    value="${value}"
                    ${disabled ? 'disabled' : ''}
                    ${required ? 'required' : ''}
                    onchange="${onChange}"
                    style="
                        width:100%;
                        padding:12px;
                        background:rgba(255,255,255,0.05);
                        border:1px solid ${error ? '#f72585' : 'rgba(255,255,255,0.1)'};
                        border-radius:8px;
                        color:white;
                        font-size:14px;
                        transition:all 0.3s;
                        outline:none;
                    "
                    onfocus="this.style.borderColor='#4cc9f0'"
                    onblur="this.style.borderColor='${error ? '#f72585' : 'rgba(255,255,255,0.1)'}'"
                />
                ${error ? `<span style="color:#f72585; font-size:12px; margin-top:5px; display:block;">${error}</span>` : ''}
            </div>
        `;
    }
});

// قائمة منسدلة كمومية
AlaisaiQuantumComponents.register('QuantumSelect', {
    render: (props = {}) => {
        const {
            options = [],
            value = '',
            label = '',
            onChange = ''
        } = props;
        
        return `
            <div style="margin-bottom:15px;">
                ${label ? `<label style="display:block; margin-bottom:5px; color:#4cc9f0;">${label}</label>` : ''}
                <select
                    onchange="${onChange}"
                    style="
                        width:100%;
                        padding:12px;
                        background:rgba(255,255,255,0.05);
                        border:1px solid rgba(255,255,255,0.1);
                        border-radius:8px;
                        color:white;
                        font-size:14px;
                        cursor:pointer;
                        outline:none;
                    "
                >
                    ${options.map(opt => `
                        <option value="${opt.value}" ${opt.value === value ? 'selected' : ''} 
                                style="background:#1a1a2a;">
                            ${opt.label}
                        </option>
                    `).join('')}
                </select>
            </div>
        `;
    }
});

// مربع اختيار كمومي
AlaisaiQuantumComponents.register('QuantumCheckbox', {
    render: (props = {}) => {
        const {
            label = '',
            checked = false,
            onChange = ''
        } = props;
        
        return `
            <label style="display:flex; align-items:center; gap:10px; cursor:pointer; margin-bottom:10px;">
                <input
                    type="checkbox"
                    ${checked ? 'checked' : ''}
                    onchange="${onChange}"
                    style="
                        width:18px;
                        height:18px;
                        cursor:pointer;
                        accent-color:#4cc9f0;
                    "
                />
                <span>${label}</span>
            </label>
        `;
    }
});

// زر اختيار كمومي
AlaisaiQuantumComponents.register('QuantumRadio', {
    render: (props = {}) => {
        const {
            name = 'radio',
            options = [],
            value = '',
            onChange = ''
        } = props;
        
        return `
            <div style="display:flex; flex-direction:column; gap:10px;">
                ${options.map(opt => `
                    <label style="display:flex; align-items:center; gap:10px; cursor:pointer;">
                        <input
                            type="radio"
                            name="${name}"
                            value="${opt.value}"
                            ${opt.value === value ? 'checked' : ''}
                            onchange="${onChange}"
                            style="
                                width:18px;
                                height:18px;
                                cursor:pointer;
                                accent-color:#4cc9f0;
                            "
                        />
                        <span>${opt.label}</span>
                    </label>
                `).join('')}
            </div>
        `;
    }
});

// شريط تقدم كمومي
AlaisaiQuantumComponents.register('QuantumProgress', {
    render: (props = {}) => {
        const {
            value = 0,
            max = 100,
            showLabel = true,
            color = '#4cc9f0'
        } = props;
        
        const percent = (value / max) * 100;
        
        return `
            <div style="width:100%;">
                <div style="
                    width:100%;
                    height:8px;
                    background:rgba(255,255,255,0.1);
                    border-radius:4px;
                    overflow:hidden;
                ">
                    <div style="
                        width:${percent}%;
                        height:100%;
                        background:${color};
                        transition:width 0.3s;
                    "></div>
                </div>
                ${showLabel ? `
                    <div style="text-align:center; margin-top:5px; font-size:12px; color:#888;">
                        ${value} / ${max}
                    </div>
                ` : ''}
            </div>
        `;
    }
});

// مؤشر كمومي
AlaisaiQuantumComponents.register('QuantumBadge', {
    render: (props = {}) => {
        const {
            text = '',
            variant = 'primary',
            size = 'medium'
        } = props;
        
        const variants = {
            primary: '#4cc9f0',
            success: '#4ade80',
            danger: '#f72585',
            warning: '#fbbf24',
            info: '#888'
        };
        
        const sizes = {
            small: '4px 8px',
            medium: '6px 12px',
            large: '8px 16px'
        };
        
        return `
            <span style="
                display:inline-block;
                padding:${sizes[size]};
                background:${variants[variant]}20;
                border:1px solid ${variants[variant]};
                color:${variants[variant]};
                border-radius:20px;
                font-size:${size === 'small' ? '10px' : size === 'medium' ? '12px' : '14px'};
                font-weight:500;
            ">
                ${text}
            </span>
        `;
    }
});

// تنبيه كمومي
AlaisaiQuantumComponents.register('QuantumAlert', {
    render: (props = {}) => {
        const {
            message = '',
            type = 'info',
            dismissible = false
        } = props;
        
        const types = {
            success: { bg: '#4ade8020', border: '#4ade80', icon: '✅' },
            error: { bg: '#f7258520', border: '#f72585', icon: '❌' },
            warning: { bg: '#fbbf2420', border: '#fbbf24', icon: '⚠️' },
            info: { bg: '#4cc9f020', border: '#4cc9f0', icon: 'ℹ️' }
        };
        
        const typeConfig = types[type] || types.info;
        
        return `
            <div style="
                padding:15px;
                background:${typeConfig.bg};
                border-right:4px solid ${typeConfig.border};
                border-radius:8px;
                display:flex;
                align-items:center;
                gap:10px;
                margin-bottom:15px;
            ">
                <span style="font-size:20px;">${typeConfig.icon}</span>
                <span style="flex:1;">${message}</span>
                ${dismissible ? `
                    <button style="background:none; border:none; color:white; cursor:pointer; font-size:18px;">&times;</button>
                ` : ''}
            </div>
        `;
    }
});

// قائمة كمومية
AlaisaiQuantumComponents.register('QuantumList', {
    render: (props = {}) => {
        const {
            items = [],
            ordered = false
        } = props;
        
        const tag = ordered ? 'ol' : 'ul';
        
        return `
            <${tag} style="
                list-style:${ordered ? 'decimal' : 'none'};
                padding:0;
                margin:0;
            ">
                ${items.map(item => `
                    <li style="
                        padding:10px;
                        border-bottom:1px solid rgba(255,255,255,0.05);
                        display:flex;
                        align-items:center;
                        gap:10px;
                    ">
                        ${!ordered ? `<span style="color:#4cc9f0;">•</span>` : ''}
                        <span>${item}</span>
                    </li>
                `).join('')}
            </${tag}>
        `;
    }
});

// جدول كمومي
AlaisaiQuantumComponents.register('QuantumTable', {
    render: (props = {}) => {
        const {
            headers = [],
            rows = []
        } = props;
        
        return `
            <table style="
                width:100%;
                border-collapse:collapse;
                background:rgba(255,255,255,0.02);
                border-radius:10px;
                overflow:hidden;
            ">
                <thead>
                    <tr style="background:rgba(76,201,240,0.1);">
                        ${headers.map(header => `
                            <th style="padding:12px; text-align:left; color:#4cc9f0;">${header}</th>
                        `).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${rows.map(row => `
                        <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                            ${headers.map(header => `
                                <td style="padding:12px;">${row[header] || ''}</td>
                            `).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
});

// تبويبات كمومية
AlaisaiQuantumComponents.register('QuantumTabs', {
    render: (props = {}) => {
        const {
            tabs = [],
            activeTab = 0
        } = props;
        
        return `
            <div>
                <div style="
                    display:flex;
                    gap:10px;
                    border-bottom:1px solid rgba(255,255,255,0.1);
                    margin-bottom:20px;
                ">
                    ${tabs.map((tab, index) => `
                        <button style="
                            padding:10px 20px;
                            background:${index === activeTab ? '#4cc9f0' : 'transparent'};
                            border:none;
                            color:${index === activeTab ? 'black' : 'white'};
                            cursor:pointer;
                            border-radius:5px 5px 0 0;
                            transition:all 0.3s;
                        ">
                            ${tab.title}
                        </button>
                    `).join('')}
                </div>
                <div>
                    ${tabs[activeTab]?.content || ''}
                </div>
            </div>
        `;
    }
});

// نموذج كمومي
AlaisaiQuantumComponents.register('QuantumForm', {
    render: (props = {}) => {
        const {
            fields = [],
            onSubmit = ''
        } = props;
        
        return `
            <form onsubmit="${onSubmit}; return false;">
                ${fields.map(field => {
                    switch(field.type) {
                        case 'text':
                        case 'email':
                        case 'password':
                            return AlaisaiQuantumComponents.render('QuantumInput', field);
                        case 'select':
                            return AlaisaiQuantumComponents.render('QuantumSelect', field);
                        case 'checkbox':
                            return AlaisaiQuantumComponents.render('QuantumCheckbox', field);
                        case 'radio':
                            return AlaisaiQuantumComponents.render('QuantumRadio', field);
                        default:
                            return '';
                    }
                }).join('')}
                <button type="submit" style="
                    padding:12px 24px;
                    background:#4cc9f0;
                    border:none;
                    border-radius:8px;
                    color:black;
                    font-weight:bold;
                    cursor:pointer;
                    width:100%;
                    margin-top:10px;
                ">
                    إرسال
                </button>
            </form>
        `;
    }
});

if (window.AlaisaiCore) {
    AlaisaiCore.registerModule('AlaisaiQuantumComponents', AlaisaiQuantumComponents);
}

window.AlaisaiQuantumComponents = AlaisaiQuantumComponents;
console.log('🧩 Quantum Components ready');