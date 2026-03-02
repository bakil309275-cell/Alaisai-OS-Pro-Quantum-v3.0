/**
 * Alaisai Evolution - نظام تطور ذاتي مستمر
 * @version 3.0.0
 */

const AlaisaiEvolution = {
    version: '3.0.0',
    generation: 0,
    mutations: 0,
    fitness: 1.0,
    genome: {},
    
    async init() {
        console.log('🧬 Evolution Core initializing...');
        
        // تحميل الجينوم السابق
        await this.loadGenome();
        
        // بدء دورة التطور
        this.startEvolution();
        
        return this;
    },
    
    async loadGenome() {
        try {
            const saved = localStorage.getItem('evolution_genome');
            if (saved) {
                this.genome = JSON.parse(saved);
                this.generation = this.genome.generation || 0;
                this.fitness = this.genome.fitness || 1.0;
            } else {
                this.genome = this.createBaseGenome();
            }
        } catch (err) {
            console.warn('⚠️ Could not load genome:', err);
            this.genome = this.createBaseGenome();
        }
    },
    
    createBaseGenome() {
        return {
            generation: 0,
            fitness: 1.0,
            parameters: {
                learningRate: 0.01,
                cacheSize: 100,
                prefetchDistance: 50,
                compressionLevel: 5,
                syncInterval: 30000,
                maxConnections: 10,
                retryAttempts: 3,
                timeoutMs: 5000
            },
            adaptations: [],
            mutations: []
        };
    },
    
    startEvolution() {
        // تقييم اللياقة كل دقيقة
        setInterval(() => {
            this.evaluateFitness();
        }, 60000);
        
        // محاولة التحسين كل 5 دقائق
        setInterval(() => {
            if (Math.random() < 0.3) {
                this.mutate();
            }
        }, 300000);
        
        // دورة تطور كاملة كل ساعة
        setInterval(() => {
            this.evolve();
        }, 3600000);
    },
    
    evaluateFitness() {
        let fitness = 1.0;
        
        // قياس سرعة التحميل
        const loadTime = performance.now() - window.performance.timing.navigationStart;
        if (loadTime < 1000) fitness *= 1.1;
        else if (loadTime > 3000) fitness *= 0.9;
        
        // قياس استخدام الذاكرة
        if (performance.memory) {
            const memUsed = performance.memory.usedJSHeapSize;
            const memTotal = performance.memory.jsHeapSizeLimit;
            const memRatio = memUsed / memTotal;
            
            if (memRatio < 0.5) fitness *= 1.05;
            else if (memRatio > 0.8) fitness *= 0.95;
        }
        
        // قياس استجابة واجهة المستخدم
        const interactionLatency = this.measureInteractionLatency();
        if (interactionLatency < 50) fitness *= 1.05;
        else if (interactionLatency > 150) fitness *= 0.95;
        
        this.fitness = fitness;
        
        // حفظ أفضل جينوم
        if (fitness > (this.genome.fitness || 1.0)) {
            this.genome.fitness = fitness;
            this.genome.generation = this.generation;
            this.saveGenome();
        }
        
        return fitness;
    },
    
    measureInteractionLatency() {
        // متوسط زمن استجابة التفاعلات الأخيرة
        let total = 0;
        let count = 0;
        
        // يمكن تحسين هذا بقياس حقيقي
        return Math.random() * 100 + 50; // محاكاة
    },
    
    mutate() {
        this.mutations++;
        
        // اختيار معلمة للتغيير
        const params = Object.keys(this.genome.parameters);
        const param = params[Math.floor(Math.random() * params.length)];
        
        // تطبيق تحوير عشوائي
        const oldValue = this.genome.parameters[param];
        const mutation = (Math.random() * 2 - 1) * 0.2; // -20% إلى +20%
        let newValue = oldValue * (1 + mutation);
        
        // تقييد القيم
        const constraints = {
            learningRate: { min: 0.001, max: 0.1 },
            cacheSize: { min: 10, max: 1000 },
            prefetchDistance: { min: 10, max: 200 },
            compressionLevel: { min: 0, max: 9 },
            syncInterval: { min: 1000, max: 3600000 },
            maxConnections: { min: 1, max: 50 },
            retryAttempts: { min: 0, max: 10 },
            timeoutMs: { min: 100, max: 30000 }
        };
        
        if (constraints[param]) {
            newValue = Math.max(constraints[param].min, 
                               Math.min(constraints[param].max, newValue));
        }
        
        // تطبيق التحوير
        this.genome.parameters[param] = newValue;
        
        // تسجيل التحوير
        this.genome.mutations.push({
            param,
            oldValue,
            newValue,
            timestamp: Date.now(),
            generation: this.generation
        });
        
        console.log(`🧬 Mutation: ${param} ${oldValue.toFixed(3)} → ${newValue.toFixed(3)}`);
        
        // تطبيق التغيير على النظام
        this.applyMutation(param, newValue);
    },
    
    applyMutation(param, value) {
        switch(param) {
            case 'learningRate':
                if (window.AlaisaiNeuralCore) {
                    AlaisaiNeuralCore.learningRate = value;
                }
                break;
                
            case 'cacheSize':
                // تعديل حجم الكاش
                break;
                
            case 'syncInterval':
                // تعديل فترة المزامنة
                break;
        }
    },
    
    evolve() {
        this.generation++;
        
        // إذا كانت اللياقة منخفضة، جرب تحويرات متعددة
        if (this.fitness < 1.0) {
            const mutationsCount = Math.floor(3 * (1 - this.fitness)) + 1;
            for (let i = 0; i < mutationsCount; i++) {
                this.mutate();
            }
        }
        
        // تسجيل التطور
        this.genome.generation = this.generation;
        this.genome.fitness = this.fitness;
        
        // حفظ الجينوم
        this.saveGenome();
        
        console.log(`🧬 Generation ${this.generation} - Fitness: ${this.fitness.toFixed(3)}`);
        
        // إرسال إحصاءات
        this.reportEvolution();
    },
    
    saveGenome() {
        try {
            // الاحتفاظ بآخر 10 أجيال فقط
            const toSave = {
                ...this.genome,
                mutations: this.genome.mutations.slice(-50)
            };
            localStorage.setItem('evolution_genome', JSON.stringify(toSave));
        } catch (err) {
            console.warn('⚠️ Could not save genome:', err);
        }
    },
    
    reportEvolution() {
        // إرسال تقرير إلى لوحة التحكم
        const report = {
            generation: this.generation,
            fitness: this.fitness,
            mutations: this.mutations,
            parameters: this.genome.parameters,
            timestamp: Date.now()
        };
        
        if (window.AlaisaiAPI) {
            AlaisaiAPI.call('evolution.report', report).catch(() => {});
        }
    },
    
    getOptimalParameters() {
        return this.genome.parameters;
    },
    
    renderEvolutionStatus() {
        return `
            <div style="padding:15px; background:rgba(0,0,0,0.3); border-radius:10px;">
                <h3 style="color:#4cc9f0;">🧬 حالة التطور</h3>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:15px;">
                    <div style="background:rgba(255,255,255,0.05); padding:10px; border-radius:8px;">
                        <div style="color:#888; font-size:12px;">الجيل</div>
                        <div style="font-size:24px; font-weight:bold;">${this.generation}</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.05); padding:10px; border-radius:8px;">
                        <div style="color:#888; font-size:12px;">اللياقة</div>
                        <div style="font-size:24px; font-weight:bold; color:${this.fitness > 1 ? '#4ade80' : '#f72585'}">
                            ${(this.fitness * 100).toFixed(1)}%
                        </div>
                    </div>
                </div>
                
                <div style="margin-top:15px;">
                    <div style="color:#888; margin-bottom:5px;">المعلمات المثلى:</div>
                    <div style="display:grid; grid-template-columns:repeat(2,1fr); gap:5px;">
                        ${Object.entries(this.genome.parameters).map(([key, value]) => `
                            <div style="background:rgba(255,255,255,0.02); padding:5px; border-radius:5px; font-size:12px;">
                                <span style="color:#4cc9f0;">${key}:</span> 
                                ${typeof value === 'number' ? value.toFixed(3) : value}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
};

if (window.AlaisaiCore) {
    AlaisaiCore.registerModule('AlaisaiEvolution', AlaisaiEvolution);
}

window.AlaisaiEvolution = AlaisaiEvolution;
console.log('🧬 Evolution Core ready');