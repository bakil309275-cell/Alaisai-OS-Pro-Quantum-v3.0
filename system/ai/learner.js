/**
 * Alaisai Quantum Learner - نظام التعلم الذاتي
 * @version 3.0.0
 */

const AlaisaiLearner = {
    version: '3.0.0',
    knowledge: new Map(),
    experiences: [],
    learningRate: 0.1,
    
    init() {
        console.log('📚 Quantum Learner initializing...');
        this.loadKnowledge();
        this.startLearning();
        return this;
    },
    
    loadKnowledge() {
        try {
            const saved = localStorage.getItem('quantum_knowledge');
            if (saved) {
                const data = JSON.parse(saved);
                this.knowledge = new Map(data.knowledge);
                this.experiences = data.experiences || [];
            }
        } catch (err) {
            console.warn('Could not load knowledge:', err);
        }
    },
    
    saveKnowledge() {
        try {
            localStorage.setItem('quantum_knowledge', JSON.stringify({
                knowledge: Array.from(this.knowledge.entries()),
                experiences: this.experiences.slice(-1000)
            }));
        } catch (err) {
            console.warn('Could not save knowledge:', err);
        }
    },
    
    learn(experience) {
        const {
            type,
            input,
            output,
            reward = 1,
            context = {}
        } = experience;
        
        // تخزين التجربة
        this.experiences.push({
            ...experience,
            timestamp: Date.now()
        });
        
        // تحديث المعرفة
        const key = `${type}:${input}`;
        const current = this.knowledge.get(key) || { count: 0, value: null, confidence: 0 };
        
        current.count++;
        current.value = output;
        current.confidence = Math.min(1, current.confidence + this.learningRate * reward);
        current.lastSeen = Date.now();
        
        this.knowledge.set(key, current);
        
        // حفظ المعرفة
        if (this.experiences.length % 10 === 0) {
            this.saveKnowledge();
        }
        
        return current;
    },
    
    recall(type, input, threshold = 0.5) {
        const key = `${type}:${input}`;
        const knowledge = this.knowledge.get(key);
        
        if (knowledge && knowledge.confidence >= threshold) {
            return {
                value: knowledge.value,
                confidence: knowledge.confidence,
                frequency: knowledge.count
            };
        }
        
        // بحث عن معرفة مشابهة
        const similar = this.findSimilar(type, input);
        if (similar) return similar;
        
        return null;
    },
    
    findSimilar(type, input) {
        const candidates = [];
        
        for (const [key, value] of this.knowledge) {
            if (key.startsWith(`${type}:`)) {
                const similarity = this.calculateSimilarity(
                    input,
                    key.split(':')[1]
                );
                
                if (similarity > 0.7) {
                    candidates.push({
                        ...value,
                        similarity,
                        key
                    });
                }
            }
        }
        
        if (candidates.length === 0) return null;
        
        // اختيار الأكثر تشابهاً
        const best = candidates.reduce((a, b) => 
            a.similarity * a.confidence > b.similarity * b.confidence ? a : b
        );
        
        return {
            value: best.value,
            confidence: best.confidence * best.similarity,
            frequency: best.count
        };
    },
    
    calculateSimilarity(a, b) {
        if (typeof a === 'string' && typeof b === 'string') {
            // مسافة ليفنشتاين مبسطة
            const longer = a.length > b.length ? a : b;
            const shorter = a.length > b.length ? b : a;
            
            if (longer.length === 0) return 1.0;
            
            return (longer.length - this.levenshteinDistance(a, b)) / longer.length;
        }
        
        if (typeof a === 'number' && typeof b === 'number') {
            return 1 - Math.abs(a - b) / Math.max(a, b);
        }
        
        return a === b ? 1 : 0;
    },
    
    levenshteinDistance(a, b) {
        const matrix = [];
        
        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[b.length][a.length];
    },
    
    reinforce(type, input, success) {
        const key = `${type}:${input}`;
        const knowledge = this.knowledge.get(key);
        
        if (knowledge) {
            knowledge.confidence += success ? 0.1 : -0.1;
            knowledge.confidence = Math.max(0, Math.min(1, knowledge.confidence));
            this.knowledge.set(key, knowledge);
        }
    },
    
    forget(threshold = 0.1) {
        const now = Date.now();
        const month = 30 * 24 * 60 * 60 * 1000;
        
        for (const [key, value] of this.knowledge) {
            // نسيان المعرفة القديمة
            if (now - value.lastSeen > month) {
                value.confidence *= 0.9;
            }
            
            // حذف المعرفة ضعيفة الثقة
            if (value.confidence < threshold) {
                this.knowledge.delete(key);
            }
        }
    },
    
    startLearning() {
        // تعلم مستمر
        setInterval(() => {
            this.forget();
        }, 24 * 60 * 60 * 1000); // كل يوم
    },
    
    getStatistics() {
        return {
            totalKnowledge: this.knowledge.size,
            totalExperiences: this.experiences.length,
            averageConfidence: Array.from(this.knowledge.values())
                .reduce((sum, k) => sum + k.confidence, 0) / this.knowledge.size || 0,
            topKnowledge: Array.from(this.knowledge.entries())
                .sort((a, b) => b[1].confidence - a[1].confidence)
                .slice(0, 5)
        };
    },
    
    renderLearnerUI() {
        const stats = this.getStatistics();
        
        return `
            <div class="quantum-learner" style="padding:20px; background:rgba(0,0,0,0.3); border-radius:15px;">
                <h3 style="color:#4cc9f0;">📚 المتعلم الذاتي</h3>
                
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-top:15px;">
                    <div style="background:rgba(255,255,255,0.05); padding:10px; border-radius:8px;">
                        <div style="color:#888; font-size:12px;">قطع المعرفة</div>
                        <div style="font-size:24px;">${stats.totalKnowledge}</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.05); padding:10px; border-radius:8px;">
                        <div style="color:#888; font-size:12px;">التجارب</div>
                        <div style="font-size:24px;">${stats.totalExperiences}</div>
                    </div>
                </div>
                
                <div style="margin-top:15px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                        <span>متوسط الثقة:</span>
                        <span style="color:#4cc9f0;">${(stats.averageConfidence * 100).toFixed(1)}%</span>
                    </div>
                    <div style="background:rgba(255,255,255,0.1); height:8px; border-radius:4px; overflow:hidden;">
                        <div style="width:${stats.averageConfidence * 100}%; height:100%; background:#4cc9f0;"></div>
                    </div>
                </div>
                
                <div style="margin-top:20px;">
                    <h4 style="color:#888;">أهم المعارف:</h4>
                    <ul style="list-style:none; padding:0;">
                        ${stats.topKnowledge.map(([key, value]) => `
                            <li style="margin:5px 0; display:flex; align-items:center; gap:10px;">
                                <span style="color:${value.confidence > 0.8 ? '#4ade80' : '#fbbf24'};">●</span>
                                <span style="flex:1;">${key}</span>
                                <span style="color:#4cc9f0;">${(value.confidence * 100).toFixed(0)}%</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        `;
    }
};

if (window.AlaisaiCore) {
    AlaisaiCore.registerModule('AlaisaiLearner', AlaisaiLearner);
}

window.AlaisaiLearner = AlaisaiLearner.init();
console.log('📚 Quantum Learner ready');