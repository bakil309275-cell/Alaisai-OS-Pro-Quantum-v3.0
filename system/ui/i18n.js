/**
 * Alaisai Quantum i18n - نظام ترجمة ذكي متعدد اللغات
 * @version 3.0.0
 */

const AlaisaiQuantumI18n = {
    version: '3.0.0',
    locale: 'ar',
    fallback: 'en',
    translations: new Map(),
    rtlLanguages: ['ar', 'he', 'fa', 'ur'],
    
    async init() {
        console.log('🌐 Quantum i18n initializing...');
        
        // تحميل اللغة المحفوظة
        this.locale = localStorage.getItem('alaisai_locale') || 'ar';
        
        // تحميل الترجمات الافتراضية
        await this.loadDefaultTranslations();
        
        // تطبيق الاتجاه
        this.applyDirection();
        
        return this;
    },
    
    async loadDefaultTranslations() {
        // العربية
        this.addTranslations('ar', {
            // عام
            'welcome': 'مرحباً بك في النظام الكمومي',
            'loading': 'جاري التحميل...',
            'save': 'حفظ',
            'cancel': 'إلغاء',
            'delete': 'حذف',
            'edit': 'تعديل',
            'add': 'إضافة',
            'search': 'بحث',
            'settings': 'الإعدادات',
            'language': 'اللغة',
            'theme': 'المظهر',
            'dark': 'داكن',
            'light': 'فاتح',
            'system': 'النظام',
            'confirm': 'تأكيد',
            'success': 'نجاح',
            'error': 'خطأ',
            'warning': 'تحذير',
            'info': 'معلومات',
            'close': 'إغلاق',
            'open': 'فتح',
            'back': 'رجوع',
            'next': 'التالي',
            'previous': 'السابق',
            'submit': 'إرسال',
            'reset': 'إعادة ضبط',
            
            // الوقت
            'now': 'الآن',
            'today': 'اليوم',
            'yesterday': 'أمس',
            'tomorrow': 'غداً',
            'days': '{count} يوم | {count} أيام',
            'hours': '{count} ساعة | {count} ساعات',
            'minutes': '{count} دقيقة | {count} دقائق',
            'seconds': '{count} ثانية | {count} ثواني',
            
            // النظام
            'system.name': 'العيسائي الكمومي',
            'system.version': 'الإصدار 3.0.0',
            'system.status': 'حالة النظام',
            'system.uptime': 'مدة التشغيل',
            'system.memory': 'الذاكرة المستخدمة',
            'system.quantum': 'الحالة الكمومية',
            'system.ai': 'الذكاء الاصطناعي',
            
            // الملفات
            'files.manager': 'مدير الملفات',
            'files.new': 'ملف جديد',
            'files.folder': 'مجلد جديد',
            'files.copy': 'نسخ',
            'files.cut': 'قص',
            'files.paste': 'لصق',
            'files.delete': 'حذف',
            'files.rename': 'إعادة تسمية',
            'files.download': 'تحميل',
            'files.upload': 'رفع',
            'files.size': 'الحجم',
            'files.modified': 'آخر تعديل',
            
            // الإضافات
            'addons.manager': 'مدير الإضافات',
            'addons.install': 'تثبيت إضافة',
            'addons.uninstall': 'إلغاء التثبيت',
            'addons.enable': 'تفعيل',
            'addons.disable': 'تعطيل',
            'addons.version': 'الإصدار',
            'addons.author': 'المطور',
            
            // الأجهزة
            'hardware.camera': 'كاميرا',
            'hardware.microphone': 'ميكروفون',
            'hardware.bluetooth': 'بلوتوث',
            'hardware.usb': 'USB',
            'hardware.battery': 'بطارية',
            'hardware.location': 'موقع',
            
            // الأمان
            'security.encryption': 'التشفير',
            'security.session': 'الجلسة',
            'security.token': 'الرمز',
            'security.permissions': 'الصلاحيات',
            'security.threats': 'التهديدات',
            
            // الأخطاء
            'error.404': 'الصفحة غير موجودة',
            'error.500': 'خطأ داخلي في النظام',
            'error.403': 'غير مصرح بالوصول',
            'error.timeout': 'انتهت المهلة',
            'error.network': 'خطأ في الشبكة'
        });
        
        // الإنجليزية
        this.addTranslations('en', {
            'welcome': 'Welcome to Quantum System',
            'loading': 'Loading...',
            'save': 'Save',
            'cancel': 'Cancel',
            'delete': 'Delete',
            'edit': 'Edit',
            'add': 'Add',
            'search': 'Search',
            'settings': 'Settings',
            'language': 'Language',
            'theme': 'Theme',
            'dark': 'Dark',
            'light': 'Light',
            'system': 'System',
            'confirm': 'Confirm',
            'success': 'Success',
            'error': 'Error',
            'warning': 'Warning',
            'info': 'Info',
            'close': 'Close',
            'open': 'Open',
            'back': 'Back',
            'next': 'Next',
            'previous': 'Previous',
            'submit': 'Submit',
            'reset': 'Reset',
            
            'now': 'Now',
            'today': 'Today',
            'yesterday': 'Yesterday',
            'tomorrow': 'Tomorrow',
            'days': '{count} day | {count} days',
            'hours': '{count} hour | {count} hours',
            'minutes': '{count} minute | {count} minutes',
            'seconds': '{count} second | {count} seconds',
            
            'system.name': 'Alaisai Quantum',
            'system.version': 'Version 3.0.0',
            'system.status': 'System Status',
            'system.uptime': 'Uptime',
            'system.memory': 'Memory Usage',
            'system.quantum': 'Quantum State',
            'system.ai': 'AI Status',
            
            'files.manager': 'File Manager',
            'files.new': 'New File',
            'files.folder': 'New Folder',
            'files.copy': 'Copy',
            'files.cut': 'Cut',
            'files.paste': 'Paste',
            'files.delete': 'Delete',
            'files.rename': 'Rename',
            'files.download': 'Download',
            'files.upload': 'Upload',
            'files.size': 'Size',
            'files.modified': 'Modified',
            
            'addons.manager': 'Addons Manager',
            'addons.install': 'Install Addon',
            'addons.uninstall': 'Uninstall',
            'addons.enable': 'Enable',
            'addons.disable': 'Disable',
            'addons.version': 'Version',
            'addons.author': 'Author',
            
            'hardware.camera': 'Camera',
            'hardware.microphone': 'Microphone',
            'hardware.bluetooth': 'Bluetooth',
            'hardware.usb': 'USB',
            'hardware.battery': 'Battery',
            'hardware.location': 'Location',
            
            'security.encryption': 'Encryption',
            'security.session': 'Session',
            'security.token': 'Token',
            'security.permissions': 'Permissions',
            'security.threats': 'Threats',
            
            'error.404': 'Page Not Found',
            'error.500': 'Internal System Error',
            'error.403': 'Access Denied',
            'error.timeout': 'Timeout',
            'error.network': 'Network Error'
        });
    },
    
    addTranslations(locale, translations) {
        if (!this.translations.has(locale)) {
            this.translations.set(locale, {});
        }
        Object.assign(this.translations.get(locale), translations);
    },
    
    t(key, params = {}) {
        let translation = this.translations.get(this.locale)?.[key];
        
        if (translation === undefined && this.locale !== this.fallback) {
            translation = this.translations.get(this.fallback)?.[key];
        }
        
        if (translation === undefined) return key;
        
        // دعم الجمع
        if (translation.includes('|')) {
            const forms = translation.split('|');
            const count = params.count || 0;
            translation = count === 1 ? forms[0] : (forms[1] || forms[0]);
        }
        
        // استبدال المتغيرات
        return translation.replace(/\{(\w+)\}/g, (match, key) => {
            return params[key] !== undefined ? params[key] : match;
        });
    },
    
    setLocale(locale) {
        if (!this.translations.has(locale)) return false;
        
        this.locale = locale;
        localStorage.setItem('alaisai_locale', locale);
        this.applyDirection();
        
        // إطلاق حدث
        window.dispatchEvent(new CustomEvent('localeChanged', { detail: { locale } }));
        
        return true;
    },
    
    applyDirection() {
        const dir = this.isRTL() ? 'rtl' : 'ltr';
        document.documentElement.dir = dir;
        document.documentElement.lang = this.locale;
    },
    
    isRTL(locale = this.locale) {
        return this.rtlLanguages.includes(locale);
    },
    
    formatNumber(number, options = {}) {
        try {
            return new Intl.NumberFormat(this.locale, options).format(number);
        } catch {
            return number.toString();
        }
    },
    
    formatDate(date, options = {}) {
        try {
            const d = date instanceof Date ? date : new Date(date);
            return new Intl.DateTimeFormat(this.locale, options).format(d);
        } catch {
            return String(date);
        }
    },
    
    formatRelativeTime(date) {
        const now = Date.now();
        const then = new Date(date).getTime();
        const diff = Math.floor((now - then) / 1000);
        
        if (diff < 60) return this.t('seconds', { count: diff });
        if (diff < 3600) return this.t('minutes', { count: Math.floor(diff / 60) });
        if (diff < 86400) return this.t('hours', { count: Math.floor(diff / 3600) });
        if (diff < 2592000) return this.t('days', { count: Math.floor(diff / 86400) });
        
        return this.formatDate(date);
    },
    
    translateElement(element) {
        // ترجمة عنصر HTML
        const key = element.getAttribute('data-i18n');
        if (key) {
            element.textContent = this.t(key);
        }
        
        // ترجمة placeholder
        const placeholder = element.getAttribute('data-i18n-placeholder');
        if (placeholder) {
            element.placeholder = this.t(placeholder);
        }
        
        // ترجمة title
        const title = element.getAttribute('data-i18n-title');
        if (title) {
            element.title = this.t(title);
        }
    },
    
    translateDocument() {
        // ترجمة كل العناصر في الصفحة
        document.querySelectorAll('[data-i18n]').forEach(el => this.translateElement(el));
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => this.translateElement(el));
        document.querySelectorAll('[data-i18n-title]').forEach(el => this.translateElement(el));
    },
    
    getCurrentLocale() {
        return {
            code: this.locale,
            name: this.locale === 'ar' ? 'العربية' : 'English',
            dir: this.isRTL() ? 'rtl' : 'ltr'
        };
    },
    
    getAvailableLocales() {
        return Array.from(this.translations.keys()).map(code => ({
            code,
            name: code === 'ar' ? 'العربية' : 'English',
            dir: this.isRTL(code) ? 'rtl' : 'ltr'
        }));
    },
    
    renderLanguageSelector() {
        const locales = this.getAvailableLocales();
        
        return `
            <div class="language-selector" style="display:flex; gap:10px;">
                ${locales.map(loc => `
                    <button class="lang-btn ${loc.code === this.locale ? 'active' : ''}" 
                            onclick="AlaisaiQuantumI18n.setLocale('${loc.code}')"
                            style="padding:8px 15px; background:${loc.code === this.locale ? '#4cc9f0' : 'rgba(255,255,255,0.1)'}; border:none; border-radius:5px; color:white; cursor:pointer;">
                        ${loc.name}
                    </button>
                `).join('')}
            </div>
        `;
    }
};

if (window.AlaisaiCore) {
    AlaisaiCore.registerModule('AlaisaiQuantumI18n', AlaisaiQuantumI18n);
}

window.AlaisaiQuantumI18n = AlaisaiQuantumI18n;
console.log('🌐 Quantum i18n ready');