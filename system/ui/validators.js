/**
 * Alaisai Quantum Validators - مدققات بيانات متقدمة
 * @version 3.0.0
 */

const AlaisaiQuantumValidators = {
    version: '3.0.0',
    
    // بريد إلكتروني
    email(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return {
            valid: re.test(email),
            message: 'البريد الإلكتروني غير صالح'
        };
    },
    
    // رقم هاتف
    phone(phone, country = 'SA') {
        const cleaned = phone.replace(/\D/g, '');
        
        if (country === 'SA') {
            // رقم سعودي
            const valid = /^(05|5)[0-9]{8}$/.test(cleaned) || 
                         /^9665[0-9]{8}$/.test(cleaned);
            return {
                valid,
                message: 'رقم الهاتف غير صالح (يجب أن يكون رقم سعودي صحيح)'
            };
        }
        
        // دولي
        const valid = /^[0-9]{10,15}$/.test(cleaned);
        return {
            valid,
            message: 'رقم الهاتف غير صالح'
        };
    },
    
    // رابط
    url(url) {
        try {
            new URL(url);
            return {
                valid: true,
                message: 'رابط صالح'
            };
        } catch {
            return {
                valid: false,
                message: 'الرابط غير صالح'
            };
        }
    },
    
    // كلمة مرور
    password(password, options = {}) {
        const {
            minLength = 8,
            requireUppercase = true,
            requireLowercase = true,
            requireNumbers = true,
            requireSpecial = true
        } = options;
        
        const errors = [];
        
        if (password.length < minLength) {
            errors.push(`يجب أن تكون ${minLength} أحرف على الأقل`);
        }
        
        if (requireUppercase && !/[A-Z]/.test(password)) {
            errors.push('يجب أن تحتوي على حرف كبير');
        }
        
        if (requireLowercase && !/[a-z]/.test(password)) {
            errors.push('يجب أن تحتوي على حرف صغير');
        }
        
        if (requireNumbers && !/[0-9]/.test(password)) {
            errors.push('يجب أن تحتوي على رقم');
        }
        
        if (requireSpecial && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            errors.push('يجب أن تحتوي على رمز خاص');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    },
    
    // اسم مستخدم
    username(username) {
        const errors = [];
        
        if (username.length < 3) {
            errors.push('يجب أن يكون 3 أحرف على الأقل');
        }
        
        if (username.length > 30) {
            errors.push('يجب أن يكون أقل من 30 حرف');
        }
        
        if (!/^[a-zA-Z0-9_\u0600-\u06FF]+$/.test(username)) {
            errors.push('يسمح فقط بالأحرف والأرقام والشرطة السفلية');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    },
    
    // نص
    text(text, options = {}) {
        const {
            minLength = 1,
            maxLength = 1000,
            required = true
        } = options;
        
        const errors = [];
        
        if (required && (!text || text.trim().length === 0)) {
            errors.push('هذا الحقل مطلوب');
        }
        
        if (text && text.length < minLength) {
            errors.push(`يجب أن يكون النص ${minLength} أحرف على الأقل`);
        }
        
        if (text && text.length > maxLength) {
            errors.push(`يجب أن يكون النص أقل من ${maxLength} حرف`);
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    },
    
    // رقم
    number(num, options = {}) {
        const {
            min,
            max,
            integer = false,
            positive = false
        } = options;
        
        const errors = [];
        const value = Number(num);
        
        if (isNaN(value)) {
            errors.push('يجب أن يكون رقماً');
        }
        
        if (positive && value <= 0) {
            errors.push('يجب أن يكون الرقم موجباً');
        }
        
        if (min !== undefined && value < min) {
            errors.push(`يجب أن يكون أكبر من أو يساوي ${min}`);
        }
        
        if (max !== undefined && value > max) {
            errors.push(`يجب أن يكون أقل من أو يساوي ${max}`);
        }
        
        if (integer && !Number.isInteger(value)) {
            errors.push('يجب أن يكون رقماً صحيحاً');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    },
    
    // تاريخ
    date(date) {
        const d = new Date(date);
        const valid = d instanceof Date && !isNaN(d);
        
        return {
            valid,
            message: valid ? 'تاريخ صالح' : 'تاريخ غير صالح'
        };
    },
    
    // عمر
    age(dateOfBirth, minAge = 18) {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return {
            valid: age >= minAge,
            age,
            message: age >= minAge ? 'عمر صالح' : `يجب أن يكون العمر ${minAge} سنة أو أكثر`
        };
    },
    
    // هوية وطنية
    nationalId(id, country = 'SA') {
        const cleaned = id.replace(/\D/g, '');
        
        if (country === 'SA') {
            // هوية سعودية: 10 أرقام تبدأ بـ 1 أو 2
            const valid = /^[1-2][0-9]{9}$/.test(cleaned);
            return {
                valid,
                message: 'رقم الهوية غير صالح (يجب أن يكون 10 أرقام ويبدأ بـ 1 أو 2)'
            };
        }
        
        return {
            valid: false,
            message: 'لم يتم التعرف على البلد'
        };
    },
    
    // رمز بريدي
    postalCode(code, country = 'SA') {
        const cleaned = code.replace(/\D/g, '');
        
        if (country === 'SA') {
            // رمز بريدي سعودي: 5 أرقام
            const valid = /^[0-9]{5}$/.test(cleaned);
            return {
                valid,
                message: 'الرمز البريدي غير صالح (يجب أن يكون 5 أرقام)'
            };
        }
        
        return {
            valid: false,
            message: 'لم يتم التعرف على البلد'
        };
    },
    
    // صورة
    image(file, options = {}) {
        const {
            maxSize = 5 * 1024 * 1024,
            allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        } = options;
        
        const errors = [];
        
        if (!file) {
            errors.push('الملف مطلوب');
        } else {
            if (!allowedTypes.includes(file.type)) {
                errors.push('نوع الملف غير مسموح');
            }
            
            if (file.size > maxSize) {
                errors.push(`حجم الملف كبير جداً (الحد الأقصى ${maxSize / 1024 / 1024}MB)`);
            }
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    },
    
    // ملف
    file(file, options = {}) {
        const {
            maxSize = 10 * 1024 * 1024,
            allowedExtensions = []
        } = options;
        
        const errors = [];
        
        if (!file) {
            errors.push('الملف مطلوب');
        } else {
            if (file.size > maxSize) {
                errors.push(`حجم الملف كبير جداً (الحد الأقصى ${maxSize / 1024 / 1024}MB)`);
            }
            
            if (allowedExtensions.length > 0) {
                const ext = '.' + file.name.split('.').pop().toLowerCase();
                if (!allowedExtensions.includes(ext)) {
                    errors.push(`نوع الملف غير مسموح. الأنواع المسموحة: ${allowedExtensions.join(', ')}`);
                }
            }
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    },
    
    // التحقق من نموذج كامل
    validateForm(data, rules) {
        const errors = {};
        let isValid = true;
        
        for (const [field, fieldRules] of Object.entries(rules)) {
            const value = data[field];
            
            for (const rule of fieldRules) {
                let result;
                
                if (typeof rule === 'function') {
                    result = rule(value);
                } else if (typeof rule === 'object') {
                    const { validator, options = {}, message } = rule;
                    result = this[validator] ? this[validator](value, options) : { valid: false };
                    
                    if (!result.valid) {
                        errors[field] = message || result.message || result.errors?.join(', ');
                        isValid = false;
                        break;
                    }
                } else if (typeof this[rule] === 'function') {
                    result = this[rule](value);
                    
                    if (!result.valid) {
                        errors[field] = result.message;
                        isValid = false;
                        break;
                    }
                }
            }
        }
        
        return {
            valid: isValid,
            errors
        };
    },
    
    // التحقق المتزامن
    async validateAsync(value, validator, options = {}) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const result = this[validator](value, options);
                resolve(result);
            }, 100);
        });
    },
    
    // التحقق من وجود قيمة
    required(value) {
        return {
            valid: value !== undefined && value !== null && value !== '',
            message: 'هذا الحقل مطلوب'
        };
    },
    
    // التحقق من التطابق
    match(value, matchValue, fieldName = 'الحقل') {
        return {
            valid: value === matchValue,
            message: `${fieldName} غير متطابق`
        };
    },
    
    // التحقق من الطول
    length(value, min, max) {
        const len = String(value).length;
        const valid = len >= min && len <= max;
        
        return {
            valid,
            message: valid ? '' : `يجب أن يكون الطول بين ${min} و ${max}`
        };
    },
    
    // التحقق من النمط
    pattern(value, regex, message = 'القيمة غير صالحة') {
        return {
            valid: regex.test(value),
            message
        };
    },
    
    // التحقق من القيمة الفريدة (محاكاة)
    async unique(value, field, collection) {
        // محاكاة التحقق من الخادم
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return {
            valid: true,
            message: 'القيمة متاحة'
        };
    }
};

if (window.AlaisaiCore) {
    AlaisaiCore.registerModule('AlaisaiQuantumValidators', AlaisaiQuantumValidators);
}

window.AlaisaiQuantumValidators = AlaisaiQuantumValidators;
console.log('✅ Quantum Validators ready');