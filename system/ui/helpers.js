/**
 * Alaisai Quantum Helpers - دوال مساعدة متقدمة
 * @version 3.0.0
 */

const AlaisaiQuantumHelpers = {
    version: '3.0.0',
    
    // إنشاء معرف فريد
    generateId(prefix = 'id') {
        return prefix + '_' + Date.now() + '_' + 
               Math.random().toString(36).substr(2, 9) + '_' +
               Math.random().toString(36).substr(2, 9);
    },
    
    // نسخ إلى الحافظة
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {
            // طريقة بديلة
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            return true;
        }
    },
    
    // لصق من الحافظة
    async pasteFromClipboard() {
        try {
            return await navigator.clipboard.readText();
        } catch {
            return null;
        }
    },
    
    // تحميل ملف
    downloadFile(content, filename, type = 'text/plain') {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    },
    
    // قراءة ملف
    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    },
    
    // قراءة ملف كـ DataURL
    readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },
    
    // تأخير
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    // إزالة التكرار من مصفوفة
    uniqueArray(arr) {
        return [...new Set(arr)];
    },
    
    // دمج كائنات
    mergeObjects(...objects) {
        return Object.assign({}, ...objects);
    },
    
    // نسخ عميق
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },
    
    // اقتطاع نص
    truncateText(text, maxLength = 100, suffix = '...') {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + suffix;
    },
    
    // تحويل إلى Slug
    slugify(text) {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    },
    
    // الحصول على معلمات URL
    getUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    },
    
    // تحديث معلمات URL
    setUrlParams(params) {
        const url = new URL(window.location.href);
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.set(key, value);
        });
        window.history.pushState({}, '', url);
    },
    
    // تخزين مع انتهاء صلاحية
    setWithExpiry(key, value, ttlMinutes) {
        const item = {
            value,
            expiry: Date.now() + ttlMinutes * 60 * 1000
        };
        localStorage.setItem(key, JSON.stringify(item));
    },
    
    getWithExpiry(key) {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) return null;
        
        try {
            const item = JSON.parse(itemStr);
            if (Date.now() > item.expiry) {
                localStorage.removeItem(key);
                return null;
            }
            return item.value;
        } catch {
            return null;
        }
    },
    
    // تجميع مصفوفة
    groupBy(array, key) {
        return array.reduce((result, item) => {
            const groupKey = item[key];
            if (!result[groupKey]) {
                result[groupKey] = [];
            }
            result[groupKey].push(item);
            return result;
        }, {});
    },
    
    // ترتيب مصفوفة
    sortBy(array, key, order = 'asc') {
        return [...array].sort((a, b) => {
            let aVal = a[key];
            let bVal = b[key];
            
            if (typeof aVal === 'string') aVal = aVal.toLowerCase();
            if (typeof bVal === 'string') bVal = bVal.toLowerCase();
            
            if (order === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
    },
    
    // تصفية مصفوفة
    filterBy(array, searchTerm, fields = ['name']) {
        if (!searchTerm) return array;
        
        const term = searchTerm.toLowerCase();
        return array.filter(item => 
            fields.some(field => {
                const value = item[field];
                return value && value.toString().toLowerCase().includes(term);
            })
        );
    },
    
    // تنسيق حجم الملف
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    // تنسيق الوقت
    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        const parts = [];
        if (hours > 0) parts.push(hours + ' ساعة');
        if (minutes > 0) parts.push(minutes + ' دقيقة');
        if (secs > 0 || parts.length === 0) parts.push(secs + ' ثانية');
        
        return parts.join(' ');
    },
    
    // إنشاء عنصر HTML
    createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'style' && typeof value === 'object') {
                Object.assign(element.style, value);
            } else if (key.startsWith('on') && typeof value === 'function') {
                element.addEventListener(key.slice(2).toLowerCase(), value);
            } else {
                element.setAttribute(key, value);
            }
        });
        
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof HTMLElement) {
                element.appendChild(child);
            }
        });
        
        return element;
    },
    
    // إزالة HTML
    stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    },
    
    // تشفير HTML
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        
        return text.replace(/[&<>"']/g, m => map[m]);
    },
    
    // فك تشفير HTML
    unescapeHtml(text) {
        const map = {
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>',
            '&quot;': '"',
            '&#039;': "'"
        };
        
        return text.replace(/&amp;|&lt;|&gt;|&quot;|&#039;/g, m => map[m]);
    },
    
    // تحويل الأرقام إلى العربية
    toArabicNumbers(text) {
        const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
        return text.replace(/[0-9]/g, d => arabicNumbers[parseInt(d)]);
    },
    
    // تحويل الأرقام إلى إنجليزية
    toEnglishNumbers(text) {
        const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
        return text.replace(/[٠-٩]/g, d => arabicNumbers.indexOf(d));
    },
    
    // التحقق من الاتصال بالإنترنت
    isOnline() {
        return navigator.onLine;
    },
    
    // مراقبة الاتصال
    onConnectionChange(callback) {
        window.addEventListener('online', () => callback(true));
        window.addEventListener('offline', () => callback(false));
    },
    
    // الحصول على نوع الجهاز
    getDeviceType() {
        const ua = navigator.userAgent;
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
            return 'tablet';
        }
        if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
            return 'mobile';
        }
        return 'desktop';
    },
    
    // الحصول على نظام التشغيل
    getOS() {
        const ua = navigator.userAgent;
        if (ua.indexOf('Win') !== -1) return 'Windows';
        if (ua.indexOf('Mac') !== -1) return 'MacOS';
        if (ua.indexOf('Linux') !== -1) return 'Linux';
        if (ua.indexOf('Android') !== -1) return 'Android';
        if (ua.indexOf('iOS') !== -1) return 'iOS';
        return 'Unknown';
    },
    
    // الحصول على المتصفح
    getBrowser() {
        const ua = navigator.userAgent;
        if (ua.indexOf('Chrome') !== -1) return 'Chrome';
        if (ua.indexOf('Firefox') !== -1) return 'Firefox';
        if (ua.indexOf('Safari') !== -1) return 'Safari';
        if (ua.indexOf('Edge') !== -1) return 'Edge';
        if (ua.indexOf('Opera') !== -1) return 'Opera';
        return 'Unknown';
    },
    
    // توليد ألوان عشوائية
    randomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    },
    
    // توليد رقم عشوائي
    randomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    // تقريب الأرقام
    round(number, decimals = 2) {
        return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
    },
    
    // تحويل العملة
    formatCurrency(amount, currency = 'SAR') {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency
        }).format(amount);
    },
    
    // تحويل النسبة المئوية
    formatPercent(amount, decimals = 2) {
        return new Intl.NumberFormat('ar-SA', {
            style: 'percent',
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(amount / 100);
    }
};

if (window.AlaisaiCore) {
    AlaisaiCore.registerModule('AlaisaiQuantumHelpers', AlaisaiQuantumHelpers);
}

window.AlaisaiQuantumHelpers = AlaisaiQuantumHelpers;
console.log('🛠️ Quantum Helpers ready');