/**
 * Alaisai Neural Core - شبكة عصبية متقدمة
 * @version 3.0.0
 */

const AlaisaiNeuralCore = {
    version: '3.0.0',
    layers: [],
    weights: [],
    biases: [],
    learningRate: 0.01,
    memory: [],
    
    init(config = {}) {
        console.log('🧠 Neural Core initializing...');
        
        // بناء شبكة عصبية بسيطة
        this.layers = [
            { neurons: 64, activation: 'relu' },    // طبقة الإدخال
            { neurons: 128, activation: 'relu' },   // طبقة مخفية
            { neurons: 256, activation: 'relu' },   // طبقة مخفية
            { neurons: 10, activation: 'softmax' }   // طبقة الإخراج
        ];
        
        this.initializeWeights();
        this.startLearning();
        
        return this;
    },
    
    initializeWeights() {
        for (let i = 0; i < this.layers.length - 1; i++) {
            const rows = this.layers[i].neurons;
            const cols = this.layers[i + 1].neurons;
            
            const layerWeights = [];
            for (let r = 0; r < rows; r++) {
                const row = [];
                for (let c = 0; c < cols; c++) {
                    row.push(Math.random() * 2 - 1); // وزن عشوائي بين -1 و 1
                }
                layerWeights.push(row);
            }
            this.weights.push(layerWeights);
            
            // biases
            const bias = [];
            for (let c = 0; c < cols; c++) {
                bias.push(Math.random() * 2 - 1);
            }
            this.biases.push(bias);
        }
    },
    
    forward(input) {
        let current = input;
        
        for (let i = 0; i < this.weights.length; i++) {
            const weights = this.weights[i];
            const bias = this.biases[i];
            const next = [];
            
            for (let j = 0; j < weights[0].length; j++) {
                let sum = bias[j];
                for (let k = 0; k < weights.length; k++) {
                    sum += current[k] * weights[k][j];
                }
                next.push(this.activate(sum, this.layers[i + 1].activation));
            }
            
            current = next;
        }
        
        return current;
    },
    
    activate(x, type) {
        switch(type) {
            case 'relu':
                return Math.max(0, x);
            case 'sigmoid':
                return 1 / (1 + Math.exp(-x));
            case 'tanh':
                return Math.tanh(x);
            case 'softmax':
                return Math.exp(x) / (1 + Math.exp(x));
            default:
                return x;
        }
    },
    
    predict(input) {
        const vector = this.normalizeInput(input);
        const output = this.forward(vector);
        return this.interpretOutput(output);
    },
    
    normalizeInput(input) {
        if (typeof input === 'string') {
            // تحويل النص إلى متجه
            const vector = new Array(this.layers[0].neurons).fill(0);
            for (let i = 0; i < Math.min(input.length, vector.length); i++) {
                vector[i] = input.charCodeAt(i) / 255;
            }
            return vector;
        }
        
        if (Array.isArray(input)) return input;
        
        return [input];
    },
    
    interpretOutput(output) {
        const maxIndex = output.indexOf(Math.max(...output));
        const confidence = output[maxIndex];
        
        return {
            class: maxIndex,
            confidence,
            probabilities: output
        };
    },
    
    async learn(input, expected) {
        const prediction = this.forward(this.normalizeInput(input));
        const error = this.calculateError(prediction, expected);
        
        // backpropagation بسيط
        this.adjustWeights(error);
        
        // تخزين في الذاكرة
        this.memory.push({
            input,
            prediction,
            expected,
            error,
            timestamp: Date.now()
        });
        
        // الاحتفاظ بآخر 1000 عينة فقط
        if (this.memory.length > 1000) {
            this.memory.shift();
        }
    },
    
    calculateError(prediction, expected) {
        return prediction.map((p, i) => p - (expected[i] || 0));
    },
    
    adjustWeights(error) {
        // تحديث بسيط للأوزان
        for (let i = 0; i < this.weights.length; i++) {
            for (let r = 0; r < this.weights[i].length; r++) {
                for (let c = 0; c < this.weights[i][r].length; c++) {
                    this.weights[i][r][c] -= this.learningRate * error[c] * 0.1;
                }
            }
        }
    },
    
    startLearning() {
        // تعلم مستمر من التفاعلات
        setInterval(() => {
            if (this.memory.length > 10) {
                const sample = this.memory[Math.floor(Math.random() * this.memory.length)];
                this.learn(sample.input, sample.expected);
            }
        }, 5000);
    },
    
    getUserPrediction(userActions) {
        const pattern = this.analyzePattern(userActions);
        return this.predict(pattern);
    },
    
    analyzePattern(actions) {
        // تحليل نمط سلوك المستخدم
        const features = [];
        
        // تكرار الإجراءات
        const freq = {};
        actions.forEach(a => freq[a] = (freq[a] || 0) + 1);
        
        // تحويل إلى متجه
        for (let i = 0; i < 10; i++) {
            features.push(freq[Object.keys(freq)[i]] || 0);
        }
        
        return features;
    }
};

if (window.AlaisaiCore) {
    AlaisaiCore.registerModule('AlaisaiNeuralCore', AlaisaiNeuralCore);
}

window.AlaisaiNeuralCore = AlaisaiNeuralCore.init();
console.log('🧠 Neural Core ready');