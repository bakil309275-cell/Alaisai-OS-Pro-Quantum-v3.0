/**
 * Alaisai Camera API - واجهة الكاميرا
 * @version 3.0.0
 */

const AlaisaiCamera = {
    version: '3.0.0',
    stream: null,
    devices: [],
    active: false,
    
    async init() {
        console.log('📷 Camera API initializing...');
        await this.getDevices();
        return this;
    },
    
    async getDevices() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            this.devices = devices.filter(d => d.kind === 'videoinput');
            return this.devices;
        } catch (err) {
            console.error('Failed to get camera devices:', err);
            return [];
        }
    },
    
    async start(options = {}) {
        const {
            deviceId,
            width = 1280,
            height = 720,
            facingMode = 'user'
        } = options;
        
        try {
            const constraints = {
                video: {
                    width: { ideal: width },
                    height: { ideal: height },
                    facingMode
                }
            };
            
            if (deviceId) {
                constraints.video.deviceId = { exact: deviceId };
            }
            
            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.active = true;
            
            return this.stream;
        } catch (err) {
            console.error('Failed to start camera:', err);
            throw err;
        }
    },
    
    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
            this.active = false;
        }
    },
    
    async takePhoto() {
        if (!this.stream || !this.active) {
            throw new Error('Camera not active');
        }
        
        const video = document.createElement('video');
        video.srcObject = this.stream;
        video.play();
        
        return new Promise((resolve) => {
            video.onloadeddata = () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0);
                
                const photo = canvas.toDataURL('image/jpeg', 0.9);
                resolve(photo);
            };
        });
    },
    
    async startRecording(options = {}) {
        if (!this.stream || !this.active) {
            throw new Error('Camera not active');
        }
        
        const {
            mimeType = 'video/webm',
            timeslice = 1000
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
        
        mediaRecorder.start(timeslice);
        
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
    
    async detectFaces(imageData) {
        // محاكاة كشف الوجوه
        return [
            { x: 100, y: 100, width: 200, height: 200, confidence: 0.95 },
            { x: 400, y: 150, width: 150, height: 150, confidence: 0.85 }
        ];
    },
    
    getCapabilities() {
        if (!this.stream) return null;
        
        const track = this.stream.getVideoTracks()[0];
        return track.getCapabilities ? track.getCapabilities() : null;
    },
    
    getSettings() {
        if (!this.stream) return null;
        
        const track = this.stream.getVideoTracks()[0];
        return track.getSettings();
    },
    
    renderCameraUI() {
        const settings = this.getSettings();
        
        return `
            <div class="camera-api" style="padding:20px; background:rgba(0,0,0,0.3); border-radius:15px;">
                <h3 style="color:#4cc9f0;">📷 Camera API</h3>
                
                <div style="margin-top:15px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="width:10px; height:10px; border-radius:50%; background:${this.active ? '#4ade80' : '#f72585'};"></span>
                        <span>${this.active ? 'نشط' : 'غير نشط'}</span>
                    </div>
                </div>
                
                ${settings ? `
                    <div style="margin-top:15px; background:rgba(255,255,255,0.05); padding:10px; border-radius:8px;">
                        <div>الدقة: ${settings.width} x ${settings.height}</div>
                        <div>معدل الإطارات: ${settings.frameRate || 'N/A'}</div>
                        <div>الكاميرا: ${settings.facingMode || 'user'}</div>
                    </div>
                ` : ''}
                
                <div style="margin-top:15px; display:flex; gap:10px;">
                    <button class="cam-btn" onclick="AlaisaiCamera.start()" style="padding:8px 15px; background:#4cc9f0; border:none; border-radius:5px; color:black; cursor:pointer;">
                        تشغيل
                    </button>
                    <button class="cam-btn" onclick="AlaisaiCamera.stop()" style="padding:8px 15px; background:#f72585; border:none; border-radius:5px; color:white; cursor:pointer;">
                        إيقاف
                    </button>
                    <button class="cam-btn" onclick="AlaisaiCamera.takePhoto().then(photo => window.open(photo))" style="padding:8px 15px; background:#4ade80; border:none; border-radius:5px; color:black; cursor:pointer;">
                        تصوير
                    </button>
                </div>
            </div>
        `;
    }
};

if (window.AlaisaiCore) {
    AlaisaiCore.registerModule('AlaisaiCamera', AlaisaiCamera);
}

window.AlaisaiCamera = AlaisaiCamera;
console.log('📷 Camera API ready');