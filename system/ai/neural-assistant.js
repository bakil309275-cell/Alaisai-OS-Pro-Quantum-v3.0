/**
 * Alaisai Neural Assistant - مساعد ذكي يتعلم من المستخدم
 * @version 3.0.0
 */

const AlaisaiNeuralAssistant = {
    version: '3.0.0',
    context: {},
    history: [],
    patterns: new Map(),
    
    async init() {
        console.log('🤖 Neural Assistant initializing...');
        
        // تحميل سجل التفاعلات السابقة
        await this.loadHistory();
        
        // بدء مراقبة سلوك المستخدم
        this.startMonitoring();
        
        return this;
    },
    
    async loadHistory() {
        try {
            const saved = localStorage.getItem('assistant_history');
            if (saved) {
                this.history = JSON.parse(saved);
            }
        } catch (err) {
            console.warn('⚠️ Could not load history:', err);
        }
    },
    
    startMonitoring() {
        // مراقبة نقرات المستخدم
        document.addEventListener('click', (e) => {
            this.recordInteraction('click', {
                target: e.target.tagName,
                text: e.target.innerText?.substring(0, 50),
                time: Date.now()
            });
        });
        
        // مراقبة فتح التطبيقات
        document.addEventListener('appOpened', (e) => {
            this.recordInteraction('open_app', {
                app: e.detail.app,
                time: Date.now()
            });
        });
        
        // مراقبة البحث
        document.addEventListener('search', (e) => {
            this.recordInteraction('search', {
                query: e.detail.query,
                time: Date.now()
            });
        });
    },
    
    recordInteraction(type, data) {
        const interaction = {
            type,
            data,
            timestamp: Date.now()
        };
        
        this.history.push(interaction);
        
        // الاحتفاظ بآخر 1000 تفاعل
        if (this.history.length > 1000) {
            this.history.shift();
        }
        
        // حفظ دوري
        if (this.history.length % 10 === 0) {
            this.saveHistory();
        }
        
        // تحليل النمط
        this.analyzePatterns();
    },
    
    analyzePatterns() {
        const recent = this.history.slice(-50);
        
        // تحليل تكرار الإجراءات
        const freq = {};
        recent.forEach(i => {
            const key = `${i.type}:${i.data.target || i.data.app || i.data.query}`;
            freq[key] = (freq[key] || 0) + 1;
        });
        
        // تحديد الأنماط المتكررة
        Object.entries(freq).forEach(([pattern, count]) => {
            if (count > 3) {
                this.patterns.set(pattern, {
                    count,
                    lastSeen: Date.now(),
                    confidence: count / recent.length
                });
            }
        });
    },
    
    getSuggestion() {
        // اقتراح الإجراء التالي بناءً على الأنماط
        const now = Date.now();
        const activePatterns = Array.from(this.patterns.entries())
            .filter(([_, p]) => now - p.lastSeen < 3600000) // آخر ساعة
            .sort((a, b) => b[1].confidence - a[1].confidence);
        
        if (activePatterns.length > 0) {
            const [pattern, data] = activePatterns[0];
            return {
                pattern,
                confidence: data.confidence,
                suggestion: this.generateSuggestion(pattern)
            };
        }
        
        return null;
    },
    
    generateSuggestion(pattern) {
        const [type, detail] = pattern.split(':');
        
        switch(type) {
            case 'open_app':
                return `🧠 هل تريد فتح ${detail} مرة أخرى؟`;
            case 'search':
                return `🔍 هل تبحث عن ${detail}؟`;
            default:
                return `💡 هل تحتاج مساعدة؟`;
        }
    },
    
    async predictNextAction() {
        if (this.history.length < 5) return null;
        
        // استخدام الشبكة العصبية للتنبؤ
        if (window.AlaisaiNeuralCore) {
            const lastActions = this.history.slice(-5).map(i => i.type);
            const prediction = AlaisaiNeuralCore.getUserPrediction(lastActions);
            
            if (prediction.confidence > 0.7) {
                return {
                    action: lastActions[prediction.class],
                    confidence: prediction.confidence
                };
            }
        }
        
        return null;
    },
    
    saveHistory() {
        try {
            localStorage.setItem('assistant_history', 
                JSON.stringify(this.history.slice(-500))); // حفظ آخر 500 فقط
        } catch (err) {
            console.warn('⚠️ Could not save history:', err);
        }
    },
    
    renderSuggestion() {
        const suggestion = this.getSuggestion();
        if (!suggestion) return '';
        
        return `
            <div style="position:fixed; bottom:20px; left:20px; background:rgba(76,201,240,0.2); backdrop-filter:blur(10px); padding:15px; border-radius:15px; border:1px solid #4cc9f0; max-width:300px; z-index:9999;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <span style="font-size:24px;">🤖</span>
                    <div>
                        <p style="margin:0; color:#4cc9f0; font-weight:bold;">${suggestion.suggestion}</p>
                        <p style="margin:5px 0 0; font-size:12px; opacity:0.7;">ثقة: ${(suggestion.confidence * 100).toFixed(1)}%</p>
                    </div>
                </div>
                <div style="display:flex; gap:10px; margin-top:10px;">
                    <button onclick="AlaisaiNeuralAssistant.acceptSuggestion()" style="flex:1; padding:8px; background:#4ade80; border:none; border-radius:5px; color:black; cursor:pointer;">✅ نعم</button>
                    <button onclick="AlaisaiNeuralAssistant.dismissSuggestion()" style="flex:1; padding:8px; background:#f72585; border:none; border-radius:5px; color:white; cursor:pointer;">❌ لا</button>
                </div>
            </div>
        `;
    },
    
    acceptSuggestion() {
        const suggestion = this.getSuggestion();
        if (suggestion) {
            const [type, detail] = suggestion.pattern.split(':');
            
            if (type === 'open_app') {
                // فتح التطبيق المقترح
                if (window.AlaisaiQuantum) {
                    const app = AlaisaiQuantum.apps.find(a => a.name === detail);
                    if (app) AlaisaiQuantum.openApp(app.id);
                }
            }
            
            // تسجيل القبول
            this.recordInteraction('accept_suggestion', { pattern: suggestion.pattern });
        }
        
        // إزالة الاقتراح
        const el = document.querySelector('[style*="position:fixed; bottom:20px;"]');
        if (el) el.remove();
    },
    
    dismissSuggestion() {
        const el = document.querySelector('[style*="position:fixed; bottom:20px;"]');
        if (el) el.remove();
        
        // تسجيل الرفض
        this.recordInteraction('dismiss_suggestion', {});
    }
};

if (window.AlaisaiCore) {
    AlaisaiCore.registerModule('AlaisaiNeuralAssistant', AlaisaiNeuralAssistant);
}

window.AlaisaiNeuralAssistant = AlaisaiNeuralAssistant;
console.log('🤖 Neural Assistant ready');