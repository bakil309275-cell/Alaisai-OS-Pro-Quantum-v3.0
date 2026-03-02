/**
 * Alaisai Quantum Formatters - منسقات بيانات متقدمة
 * @version 3.0.0
 */

const AlaisaiQuantumFormatters = {
    version: '3.0.0',
    
    // ========== تنسيق التاريخ والوقت ==========
    
    /**
     * تنسيق التاريخ
     * @param {Date|string|number} date - التاريخ
     * @param {string} format - صيغة التنسيق (short, medium, long, full, time, datetime)
     * @returns {string} التاريخ المنسق
     */
    date(date, format = 'short') {
        const d = new Date(date);
        
        if (isNaN(d.getTime())) {
            return 'تاريخ غير صالح';
        }
        
        const options = {
            short: { year: 'numeric', month: 'numeric', day: 'numeric' },
            medium: { year: 'numeric', month: 'short', day: 'numeric' },
            long: { year: 'numeric', month: 'long', day: 'numeric' },
            full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
            time: { hour: '2-digit', minute: '2-digit' },
            datetime: { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' },
            iso: { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }
        };
        
        try {
            if (format === 'iso') {
                return d.toISOString();
            }
            return d.toLocaleDateString('ar-SA', options[format] || options.short);
        } catch {
            return d.toLocaleDateString();
        }
    },
    
    /**
     * تنسيق الوقت
     * @param {Date|string|number} date - التاريخ
     * @param {boolean} withSeconds - عرض الثواني
     * @param {boolean} use12h - استخدام نظام 12 ساعة
     * @returns {string} الوقت المنسق
     */
    time(date, withSeconds = false, use12h = false) {
        const d = new Date(date);
        
        if (isNaN(d.getTime())) {
            return 'وقت غير صالح';
        }
        
        const options = {
            hour: '2-digit',
            minute: '2-digit',
            ...(withSeconds && { second: '2-digit' }),
            hour12: use12h
        };
        
        try {
            return d.toLocaleTimeString('ar-SA', options);
        } catch {
            return d.toLocaleTimeString();
        }
    },
    
    /**
     * تنسيق الوقت النسبي (منذ ...)
     * @param {Date|string|number} date - التاريخ
     * @returns {string} الوقت النسبي
     */
    relativeTime(date) {
        const now = Date.now();
        const then = new Date(date).getTime();
        const diff = Math.floor((now - then) / 1000);
        
        if (diff < 60) {
            return 'الآن';
        }
        
        if (diff < 3600) {
            const minutes = Math.floor(diff / 60);
            return `منذ ${minutes} ${minutes === 1 ? 'دقيقة' : 'دقائق'}`;
        }
        
        if (diff < 86400) {
            const hours = Math.floor(diff / 3600);
            return `منذ ${hours} ${hours === 1 ? 'ساعة' : 'ساعات'}`;
        }
        
        if (diff < 2592000) {
            const days = Math.floor(diff / 86400);
            return `منذ ${days} ${days === 1 ? 'يوم' : 'أيام'}`;
        }
        
        if (diff < 31536000) {
            const months = Math.floor(diff / 2592000);
            return `منذ ${months} ${months === 1 ? 'شهر' : 'أشهر'}`;
        }
        
        const years = Math.floor(diff / 31536000);
        return `منذ ${years} ${years === 1 ? 'سنة' : 'سنوات'}`;
    },
    
    /**
     * تنسيق الوقت المتبقي
     * @param {Date|string|number} date - التاريخ
     * @returns {string} الوقت المتبقي
     */
    timeUntil(date) {
        const now = Date.now();
        const then = new Date(date).getTime();
        const diff = Math.floor((then - now) / 1000);
        
        if (diff < 0) {
            return 'انتهى';
        }
        
        if (diff < 60) {
            return `بعد ${diff} ${diff === 1 ? 'ثانية' : 'ثواني'}`;
        }
        
        if (diff < 3600) {
            const minutes = Math.floor(diff / 60);
            return `بعد ${minutes} ${minutes === 1 ? 'دقيقة' : 'دقائق'}`;
        }
        
        if (diff < 86400) {
            const hours = Math.floor(diff / 3600);
            return `بعد ${hours} ${hours === 1 ? 'ساعة' : 'ساعات'}`;
        }
        
        if (diff < 2592000) {
            const days = Math.floor(diff / 86400);
            return `بعد ${days} ${days === 1 ? 'يوم' : 'أيام'}`;
        }
        
        const months = Math.floor(diff / 2592000);
        return `بعد ${months} ${months === 1 ? 'شهر' : 'أشهر'}`;
    },
    
    // ========== تنسيق الأرقام ==========
    
    /**
     * تنسيق رقم
     * @param {number} number - الرقم
     * @param {Object} options - خيارات التنسيق
     * @returns {string} الرقم المنسق
     */
    number(number, options = {}) {
        const {
            decimals = 0,
            thousandSeparator = ',',
            decimalSeparator = '.',
            prefix = '',
            suffix = ''
        } = options;
        
        const num = Number(number);
        if (isNaN(num)) return '0';
        
        const fixed = num.toFixed(decimals);
        const parts = fixed.split('.');
        
        // تنسيق الألوف
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);
        
        // التعامل مع الكسور
        const result = parts.length === 1 ? parts[0] : parts.join(decimalSeparator);
        
        return prefix + result + suffix;
    },
    
    /**
     * تنسيق عملة
     * @param {number} amount - المبلغ
     * @param {string} currency - العملة (SAR, USD, EUR, ...)
     * @returns {string} المبلغ المنسق
     */
    currency(amount, currency = 'SAR') {
        const num = Number(amount);
        if (isNaN(num)) return '0 ' + currency;
        
        const symbols = {
            SAR: 'ر.س',
            USD: '$',
            EUR: '€',
            GBP: '£',
            AED: 'د.إ',
            KWD: 'د.ك',
            QAR: 'ر.ق',
            BHD: 'د.ب',
            OMR: 'ر.ع',
            EGP: 'ج.م'
        };
        
        const formatted = this.number(num, { 
            decimals: 2,
            thousandSeparator: ',',
            decimalSeparator: '.'
        });
        
        return `${formatted} ${symbols[currency] || currency}`;
    },
    
    /**
     * تنسيق نسبة مئوية
     * @param {number} value - القيمة
     * @param {number} decimals - عدد الخانات العشرية
     * @returns {string} النسبة المئوية
     */
    percent(value, decimals = 2) {
        const num = Number(value);
        if (isNaN(num)) return '0%';
        
        return this.number(num, { decimals }) + '%';
    },
    
    /**
     * تنسيق حجم ملف
     * @param {number} bytes - الحجم بالبايت
     * @returns {string} الحجم المنسق
     */
    fileSize(bytes) {
        if (bytes === 0) return '0 B';
        
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        
        return this.number(bytes / Math.pow(1024, i), { decimals: 2 }) + ' ' + sizes[i];
    },
    
    /**
     * تنسيق سرعة
     * @param {number} bytesPerSecond - السرعة بالبايت/ثانية
     * @returns {string} السرعة المنسقة
     */
    speed(bytesPerSecond) {
        return this.fileSize(bytesPerSecond) + '/s';
    },
    
    /**
     * تنسيق مسافة
     * @param {number} meters - المسافة بالمتر
     * @param {string} unit - النظام (metric أو imperial)
     * @returns {string} المسافة المنسقة
     */
    distance(meters, unit = 'metric') {
        const num = Number(meters);
        if (isNaN(num)) return '0 م';
        
        if (unit === 'metric') {
            if (num < 1000) {
                return this.number(num, { decimals: 0 }) + ' م';
            }
            return this.number(num / 1000, { decimals: 2 }) + ' كم';
        } else {
            // imperial
            const feet = num * 3.28084;
            if (feet < 5280) {
                return this.number(feet, { decimals: 0 }) + ' قدم';
            }
            return this.number(feet / 5280, { decimals: 2 }) + ' ميل';
        }
    },
    
    /**
     * تنسيق وزن
     * @param {number} grams - الوزن بالجرام
     * @param {string} unit - النظام (metric أو imperial)
     * @returns {string} الوزن المنسق
     */
    weight(grams, unit = 'metric') {
        const num = Number(grams);
        if (isNaN(num)) return '0 جم';
        
        if (unit === 'metric') {
            if (num < 1000) {
                return this.number(num, { decimals: 0 }) + ' جم';
            }
            return this.number(num / 1000, { decimals: 2 }) + ' كجم';
        } else {
            const pounds = num * 0.00220462;
            const ounces = num * 0.035274;
            
            if (pounds < 1) {
                return this.number(ounces, { decimals: 1 }) + ' أونصة';
            }
            return this.number(pounds, { decimals: 1 }) + ' رطل';
        }
    },
    
    /**
     * تنسيق درجة حرارة
     * @param {number} celsius - درجة الحرارة بالمئوية
     * @param {string} unit - الوحدة (C أو F)
     * @returns {string} درجة الحرارة المنسقة
     */
    temperature(celsius, unit = 'C') {
        const num = Number(celsius);
        if (isNaN(num)) return '0°C';
        
        if (unit === 'C') {
            return this.number(num, { decimals: 1 }) + '°C';
        } else {
            const fahrenheit = (num * 9/5) + 32;
            return this.number(fahrenheit, { decimals: 1 }) + '°F';
        }
    },
    
    // ========== تنسيق النصوص ==========
    
    /**
     * تنسيق رقم هاتف
     * @param {string} phone - رقم الهاتف
     * @param {string} country - البلد
     * @returns {string} رقم الهاتف المنسق
     */
    phone(phone, country = 'SA') {
        const cleaned = phone.replace(/\D/g, '');
        
        if (country === 'SA') {
            if (cleaned.length === 10 && cleaned.startsWith('05')) {
                // 05X XXX XXXX
                return cleaned.replace(/(05)(\d{2})(\d{3})(\d{3})/, '$1$2 $3 $4');
            }
            if (cleaned.length === 9 && cleaned.startsWith('5')) {
                // 5XX XXX XXXX
                return '0' + cleaned.replace(/(5)(\d{2})(\d{3})(\d{3})/, '$1$2 $3 $4');
            }
            if (cleaned.length === 12 && cleaned.startsWith('966')) {
                // +966 XX XXX XXXX
                return '+966 ' + cleaned.slice(3).replace(/(\d{2})(\d{3})(\d{4})/, '$1 $2 $3');
            }
        }
        
        if (cleaned.length > 10) {
            // +XXX XXX XXX XXX
            return '+' + cleaned.replace(/(\d{1,3})(\d{3})(\d{3})(\d{4})/, '$1 $2 $3 $4');
        }
        
        if (cleaned.length === 10) {
            // XXX XXX XXXX
            return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
        }
        
        return phone;
    },
    
    /**
     * تنسيق هوية وطنية
     * @param {string} id - رقم الهوية
     * @param {string} country - البلد
     * @returns {string} رقم الهوية المنسق
     */
    nationalId(id, country = 'SA') {
        const cleaned = id.replace(/\D/g, '');
        
        if (country === 'SA' && cleaned.length === 10) {
            // XXXX XXXX XX
            return cleaned.replace(/(\d{4})(\d{4})(\d{2})/, '$1 $2 $3');
        }
        
        return id;
    },
    
    /**
     * تنسيق بطاقة ائتمان
     * @param {string} card - رقم البطاقة
     * @returns {string} رقم البطاقة المنسق
     */
    creditCard(card) {
        const cleaned = card.replace(/\D/g, '');
        
        if (cleaned.length === 16) {
            // XXXX XXXX XXXX XXXX
            return cleaned.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4');
        }
        
        if (cleaned.length === 15) {
            // XXXX XXXXXX XXXXX
            return cleaned.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3');
        }
        
        return card;
    },
    
    /**
     * إخفاء جزئي للنص
     * @param {string} text - النص
     * @param {number} visibleStart - عدد الأحرف الظاهرة في البداية
     * @param {number} visibleEnd - عدد الأحرف الظاهرة في النهاية
     * @param {string} maskChar - رمز الإخفاء
     * @returns {string} النص المخفي جزئياً
     */
    mask(text, visibleStart = 3, visibleEnd = 3, maskChar = '*') {
        if (!text) return '';
        if (text.length <= visibleStart + visibleEnd) {
            return text;
        }
        
        const start = text.substring(0, visibleStart);
        const end = text.substring(text.length - visibleEnd);
        const middle = maskChar.repeat(text.length - visibleStart - visibleEnd);
        
        return start + middle + end;
    },
    
    /**
     * إخفاء بريد إلكتروني
     * @param {string} email - البريد الإلكتروني
     * @returns {string} البريد الإلكتروني المخفي
     */
    maskEmail(email) {
        const [local, domain] = email.split('@');
        
        if (local.length <= 3) {
            return local[0] + '***@' + domain;
        }
        
        return local.substring(0, 3) + '***@' + domain;
    },
    
    /**
     * تنسيق اسم (capitalize)
     * @param {string} name - الاسم
     * @returns {string} الاسم المنسق
     */
    name(name) {
        return name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    },
    
    /**
     * اقتطاع نص
     * @param {string} text - النص
     * @param {number} maxLength - أقصى طول
     * @param {string} suffix - اللاحقة
     * @returns {string} النص المقتطع
     */
    truncate(text, maxLength = 100, suffix = '...') {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        
        return text.substring(0, maxLength) + suffix;
    },
    
    /**
     * تحويل النص إلى Slug
     * @param {string} text - النص
     * @returns {string} الـ Slug
     */
    slug(text) {
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
    
    /**
     * تنسيق عنوان
     * @param {Object} address - بيانات العنوان
     * @returns {string} العنوان المنسق
     */
    address(address) {
        const parts = [];
        
        if (address.street) parts.push(address.street);
        if (address.city) parts.push(address.city);
        if (address.state) parts.push(address.state);
        if (address.zip) parts.push(address.zip);
        if (address.country) parts.push(address.country);
        
        return parts.join('، ');
    },
    
    // ========== تنسيق المصفوفات والكائنات ==========
    
    /**
     * تنسيق JSON
     * @param {Object} obj - الكائن
     * @param {boolean} pretty - تنسيق مقروء
     * @returns {string} JSON المنسق
     */
    json(obj, pretty = true) {
        return JSON.stringify(obj, null, pretty ? 2 : 0);
    },
    
    /**
     * تحويل مصفوفة إلى نص
     * @param {Array} array - المصفوفة
     * @param {string} separator - الفاصل
     * @param {string} lastSeparator - الفاصل الأخير
     * @returns {string} النص المنسق
     */
    arrayToString(array, separator = '، ', lastSeparator = ' و ') {
        if (!array || array.length === 0) return '';
        if (array.length === 1) return array[0];
        if (array.length === 2) return array.join(lastSeparator);
        
        const last = array.pop();
        return array.join(separator) + lastSeparator + last;
    },
    
    /**
     * تحويل نص إلى مصفوفة
     * @param {string} str - النص
     * @param {string} separator - الفاصل
     * @returns {Array} المصفوفة
     */
    stringToArray(str, separator = '،') {
        return str.split(separator).map(s => s.trim()).filter(s => s);
    },
    
    /**
     * تنسيق وقت الفيديو (HH:MM:SS)
     * @param {number} seconds - الوقت بالثواني
     * @returns {string} الوقت المنسق
     */
    videoTime(seconds) {
        const secs = Math.floor(seconds);
        const hours = Math.floor(secs / 3600);
        const minutes = Math.floor((secs % 3600) / 60);
        const remainingSeconds = secs % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
        
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    },
    
    // ========== تنسيق الوحدات العلمية ==========
    
    /**
     * تنسيق طاقة
     * @param {number} joules - الطاقة بالجول
     * @returns {string} الطاقة المنسقة
     */
    energy(joules) {
        const num = Number(joules);
        if (isNaN(num)) return '0 J';
        
        if (num < 1000) {
            return this.number(num, { decimals: 0 }) + ' J';
        }
        if (num < 1000000) {
            return this.number(num / 1000, { decimals: 2 }) + ' kJ';
        }
        if (num < 1000000000) {
            return this.number(num / 1000000, { decimals: 2 }) + ' MJ';
        }
        return this.number(num / 1000000000, { decimals: 2 }) + ' GJ';
    },
    
    /**
     * تنسيق ضغط
     * @param {number} pascals - الضغط بالباسكال
     * @returns {string} الضغط المنسق
     */
    pressure(pascals) {
        const num = Number(pascals);
        if (isNaN(num)) return '0 Pa';
        
        if (num < 1000) {
            return this.number(num, { decimals: 0 }) + ' Pa';
        }
        if (num < 100000) {
            return this.number(num / 1000, { decimals: 2 }) + ' kPa';
        }
        if (num < 10000000) {
            return this.number(num / 100000, { decimals: 2 }) + ' bar';
        }
        return this.number(num / 1000000, { decimals: 2 }) + ' MPa';
    },
    
    /**
     * تنسيق زاوية
     * @param {number} degrees - الزاوية بالدرجات
     * @returns {string} الزاوية المنسقة
     */
    angle(degrees) {
        const num = Number(degrees);
        if (isNaN(num)) return '0°';
        
        return this.number(num, { decimals: 1 }) + '°';
    },
    
    /**
     * تنسيق نسبة
     * @param {number} value - القيمة
     * @param {number} total - المجموع الكلي
     * @returns {string} النسبة المئوية
     */
    ratio(value, total) {
        if (total === 0) return '0%';
        return this.percent((value / total) * 100, 2);
    },
    
    // ========== تنسيق الأرقام الترتيبية ==========
    
    /**
     * تنسيق رقم ترتيبي عربي
     * @param {number} number - الرقم
     * @returns {string} الرقم الترتيبي
     */
    ordinal(number) {
        const num = Number(number);
        if (isNaN(num)) return '';
        
        const ordinals = {
            1: 'الأول',
            2: 'الثاني',
            3: 'الثالث',
            4: 'الرابع',
            5: 'الخامس',
            6: 'السادس',
            7: 'السابع',
            8: 'الثامن',
            9: 'التاسع',
            10: 'العاشر'
        };
        
        if (num <= 10 && ordinals[num]) {
            return ordinals[num];
        }
        
        return num + ' (ترتيبي)';
    },
    
    /**
     * تنسيق رقم ترتيبي إنجليزي
     * @param {number} number - الرقم
     * @returns {string} الرقم الترتيبي
     */
    ordinalEnglish(number) {
        const num = Number(number);
        if (isNaN(num)) return '';
        
        const suffixes = ['th', 'st', 'nd', 'rd'];
        const v = num % 100;
        
        return num + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
    },
    
    // ========== دوال مساعدة ==========
    
    /**
     * تحويل الأرقام العربية إلى إنجليزية
     * @param {string} text - النص
     * @returns {string} النص بعد التحويل
     */
    toEnglishNumbers(text) {
        const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
        return text.replace(/[٠-٩]/g, d => arabicNumbers.indexOf(d));
    },
    
    /**
     * تحويل الأرقام الإنجليزية إلى عربية
     * @param {string} text - النص
     * @returns {string} النص بعد التحويل
     */
    toArabicNumbers(text) {
        const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
        return text.replace(/[0-9]/g, d => arabicNumbers[parseInt(d)]);
    },
    
    /**
     * تنسيق النص حسب اللغة
     * @param {string} text - النص
     * @param {string} locale - اللغة
     * @returns {string} النص المنسق
     */
    localize(text, locale = 'ar') {
        if (locale === 'ar') {
            return this.toArabicNumbers(text);
        }
        return this.toEnglishNumbers(text);
    },
    
    /**
     * الحصول على تنسيق مناسب للقيمة
     * @param {*} value - القيمة
     * @returns {string} القيمة المنسقة
     */
    auto(value) {
        if (value === null || value === undefined) {
            return '-';
        }
        
        if (typeof value === 'number') {
            if (Number.isInteger(value)) {
                return this.number(value, { decimals: 0 });
            }
            return this.number(value, { decimals: 2 });
        }
        
        if (value instanceof Date) {
            return this.date(value, 'datetime');
        }
        
        if (typeof value === 'boolean') {
            return value ? 'نعم' : 'لا';
        }
        
        if (Array.isArray(value)) {
            return this.arrayToString(value);
        }
        
        if (typeof value === 'object') {
            return this.json(value, false);
        }
        
        return String(value);
    },
    
    /**
     * تنسيق حجم البيانات
     * @param {number} bytes - الحجم بالبايت
     * @returns {string} الحجم المنسق
     */
    dataSize(bytes) {
        return this.fileSize(bytes);
    },
    
    /**
     * تنسيق مدة زمنية
     * @param {number} seconds - المدة بالثواني
     * @returns {string} المدة المنسقة
     */
    duration(seconds) {
        const secs = Math.floor(seconds);
        const days = Math.floor(secs / 86400);
        const hours = Math.floor((secs % 86400) / 3600);
        const minutes = Math.floor((secs % 3600) / 60);
        const remainingSeconds = secs % 60;
        
        const parts = [];
        if (days > 0) parts.push(days + ' يوم' + (days > 1 ? 'أيام' : ''));
        if (hours > 0) parts.push(hours + ' ساعة' + (hours > 1 ? 'ات' : ''));
        if (minutes > 0) parts.push(minutes + ' دقيقة' + (minutes > 1 ? 'ق' : ''));
        if (remainingSeconds > 0 || parts.length === 0) {
            parts.push(remainingSeconds + ' ثانية' + (remainingSeconds > 1 ? 'ات' : ''));
        }
        
        return parts.join(' و ');
    },
    
    /**
     * تنسيق عدد كبير (K, M, B)
     * @param {number} number - الرقم
     * @returns {string} الرقم المختصر
     */
    compact(number) {
        const num = Number(number);
        if (isNaN(num)) return '0';
        
        if (num < 1000) {
            return this.number(num, { decimals: 0 });
        }
        
        if (num < 1000000) {
            return this.number(num / 1000, { decimals: 1 }) + 'K';
        }
        
        if (num < 1000000000) {
            return this.number(num / 1000000, { decimals: 1 }) + 'M';
        }
        
        return this.number(num / 1000000000, { decimals: 1 }) + 'B';
    },
    
    /**
     * تنسيق نسبة مئوية مع شريط تقدم
     * @param {number} percent - النسبة المئوية
     * @param {number} width - عرض الشريط
     * @returns {string} شريط التقدم المنسق
     */
    progressBar(percent, width = 20) {
        const num = Number(percent);
        if (isNaN(num)) return '';
        
        const filled = Math.floor((num / 100) * width);
        const empty = width - filled;
        
        return '█'.repeat(filled) + '░'.repeat(empty) + ` ${num.toFixed(1)}%`;
    }
};

if (window.AlaisaiCore) {
    AlaisaiCore.registerModule('AlaisaiQuantumFormatters', AlaisaiQuantumFormatters);
}

window.AlaisaiQuantumFormatters = AlaisaiQuantumFormatters;
console.log('🎨 Quantum Formatters ready');