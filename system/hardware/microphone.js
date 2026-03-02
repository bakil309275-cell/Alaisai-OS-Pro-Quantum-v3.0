/**
 * Alaisai Microphone API - واجهة الميكروفون
 * @version 3.0.0
 */

const AlaisaiMicrophone = {
    version: '3.0.0',
    stream: null,
    analyser: null,
    active: false,
    volume: 0,
    
    async init() {
        console.log('🎤 Microphone API initializing...');
        return this;
    },
    
    async start(options = {}) {
        const {
            echoCancellation = true,
            noiseSuppression = true,
            autoGainControl = true,
            sampleRate = 48000
        } = options;
        
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation,
                    noiseSuppression,
                    autoGainControl,
                    sampleRate
                }
            });
            
            this.active = true;
            
            // إعداد المحلل
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(this.stream);
            source.connect(this.analyser);
            
            this.analyser.fftSize = 256;
            
            // بدء مراقبة الصوت
            this.startMonitoring();
            
            return this.stream;
        } catch (err) {
            console.error('Failed to start microphone:', err);
            throw err;
        }
    },
    
    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
            this.analyser = null;
            this.active = false;
        }
    },
    
    startMonitoring() {
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const updateVolume = () => {
            if (!this.active || !this.analyser) return;
            
            this.analyser.getByteFrequencyData(dataArray);
            
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
            }
            
            this.volume = sum / bufferLength / 255;
            
            requestAnimationFrame(updateVolume);
        };
        
        updateVolume();
    },
    
    async startRecording(options = {}) {
        if (!this.stream || !this.active) {
            throw new Error('Microphone not active');
        }
        
        const {
            mimeType = 'audio/webm'
        } = options;
        
        const mediaRecorder = new MediaRecorder(this.stream, {
            mimeType
        });
        
        const chunks = [];
        
        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                chunks.push(e.data);
            }
        };
        
        mediaRecorder.start(1000);
        
        return {
            mediaRecorder,
            stop: () => new Promise((resolve) => {
                mediaRecorder.onstop = () => {
                    const blob = new Blob(chunks, { type: mimeType });
                    resolve(URL.createObjectURL(blob));
                };
                mediaRecorder.stop();
            })
        };
    },
    
    async detectSpeech() {
        return this.volume > 0.1;
    },
    
    async speechToText(audioBlob) {
        // محاكاة تحويل الصوت إلى نص
        const phrases = [
            "مرحباً بالعالم",
            "كيف حالك؟",
            "النظام الكمومي يعمل",
            "أهلاً بك في العيسائي"
        ];
        
        return phrases[Math.floor(Math.random() * phrases.length)];
    },
    
    getVolumeLevel() {
        return this.volume;
    },
    
    getSettings() {
        if (!this.stream) return null;
        
        const track = this.stream.getAudioTracks()[0];
        return track.getSettings();
    },
    
    renderMicrophoneUI() {
        const settings = this.getSettings();
        
        return `
            <div class="microphone-api" style="padding:20px; background:rgba(0,0,0,0.3); border-radius:15px;">
                <h3 style="color:#4cc9f0;">🎤 Microphone API</h3>
                
                <div style="margin-top:15px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="width:10px; height:10px; border-radius:50%; background:${this.active ? '#4ade80' : '#f72585'};"></span>
                        <span>${this.active ? 'نشط' : 'غير نشط'}</span>
                    </div>
                </div>
                
                ${this.active ? `
                    <div style="margin-top:15px;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                            <span>مستوى الصوت:</span>
                            <span style="color:#4cc9f0;">${(this.volume * 100).toFixed(0)}%</span>
                        </div>
                        <div style="background:rgba(255,255,255,0.1); height:20px; border-radius:10px; overflow:hidden;">
                            <div style="width:${this.volume * 100}%; height:100%; background:#4cc9f0;"></div>
                        </div>
                    </div>
                    
                    ${this.detectSpeech() ? `
                        <div style="margin-top:10px; padding:10px; background:rgba(74,222,128,0.1); border-radius:5px; color:#4ade80;">
                            🗣️ كشف كلام
                        </div>
                    ` : ''}
                ` : ''}
                
                <div style="margin-top:15px; display:flex; gap:10px;">
                    <button class="mic-btn" onclick="AlaisaiMicrophone.start()" style="padding:8px 15px; background:#4cc9f0; border:none; border-radius:5px; color:black; cursor:pointer;">
                        تشغيل
                    </button>
                    <button class="mic-btn" onclick="AlaisaiMicrophone.stop()" style="padding:8px 15px; background:#f72585; border:none; border-radius:5px; color:white; cursor:pointer;">
                        إيقاف
                    </button>
                </div>
            </div>
        `;
    }
};

if (window.AlaisaiCore) {
    AlaisaiCore.registerModule('AlaisaiMicrophone', AlaisaiMicrophone);
}

window.AlaisaiMicrophone = AlaisaiMicrophone;
console.log('🎤 Microphone API ready');