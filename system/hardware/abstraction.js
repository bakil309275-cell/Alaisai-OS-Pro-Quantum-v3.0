/**
 * Alaisai Hardware Abstraction - توافق مع جميع الأجهزة
 * @version 3.0.0
 */

const AlaisaiHardware = {
    version: '3.0.0',
    devices: {},
    permissions: new Map(),
    
    async init() {
        console.log('🔌 Hardware Abstraction initializing...');
        
        // اكتشاف الأجهزة المتاحة
        await this.detectDevices();
        
        // طلب الصلاحيات للأجهزة الأساسية
        await this.requestPermissions();
        
        return this;
    },
    
    async detectDevices() {
        const checks = {
            camera: this.checkCamera(),
            microphone: this.checkMicrophone(),
            bluetooth: this.checkBluetooth(),
            usb: this.checkUSB(),
            serial: this.checkSerial(),
            gamepad: this.checkGamepad(),
            battery: this.checkBattery(),
            vibration: this.checkVibration(),
            geolocation: this.checkGeolocation(),
            accelerometer: this.checkAccelerometer()
        };
        
        const results = await Promise.allSettled(
            Object.entries(checks).map(async ([name, promise]) => {
                try {
                    const available = await promise;
                    this.devices[name] = { available, features: [] };
                    return { name, available };
                } catch {
                    this.devices[name] = { available: false };
                    return { name, available: false };
                }
            })
        );
        
        console.log('📱 Detected devices:', 
            Object.entries(this.devices)
                .filter(([_, d]) => d.available)
                .map(([name]) => name)
        );
    },
    
    async checkCamera() {
        if (!navigator.mediaDevices?.enumerateDevices) return false;
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.some(d => d.kind === 'videoinput');
    },
    
    async checkMicrophone() {
        if (!navigator.mediaDevices?.enumerateDevices) return false;
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.some(d => d.kind === 'audioinput');
    },
    
    async checkBluetooth() {
        return 'bluetooth' in navigator;
    },
    
    async checkUSB() {
        return 'usb' in navigator;
    },
    
    async checkSerial() {
        return 'serial' in navigator;
    },
    
    async checkGamepad() {
        return 'getGamepads' in navigator;
    },
    
    async checkBattery() {
        return 'getBattery' in navigator;
    },
    
    async checkVibration() {
        return 'vibrate' in navigator;
    },
    
    async checkGeolocation() {
        return 'geolocation' in navigator;
    },
    
    async checkAccelerometer() {
        return 'Accelerometer' in window;
    },
    
    async requestPermissions() {
        const neededPermissions = [];
        
        if (this.devices.camera?.available) {
            neededPermissions.push('camera');
        }
        if (this.devices.microphone?.available) {
            neededPermissions.push('microphone');
        }
        if (this.devices.geolocation?.available) {
            neededPermissions.push('geolocation');
        }
        
        for (const perm of neededPermissions) {
            try {
                const granted = await this.requestPermission(perm);
                this.permissions.set(perm, granted);
            } catch (err) {
                console.warn(`⚠️ Could not request ${perm}:`, err);
            }
        }
    },
    
    async requestPermission(permission) {
        switch(permission) {
            case 'camera':
            case 'microphone':
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: permission === 'camera',
                        audio: permission === 'microphone'
                    });
                    stream.getTracks().forEach(t => t.stop());
                    return true;
                } catch {
                    return false;
                }
                
            case 'geolocation':
                return new Promise(resolve => {
                    navigator.geolocation.getCurrentPosition(
                        () => resolve(true),
                        () => resolve(false)
                    );
                });
                
            default:
                return false;
        }
    },
    
    async useCamera(options = {}) {
        if (!this.permissions.get('camera')) {
            throw new Error('Camera permission not granted');
        }
        
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: options.width || 1280,
                height: options.height || 720,
                facingMode: options.facingMode || 'user'
            }
        });
        
        return stream;
    },
    
    async useMicrophone(options = {}) {
        if (!this.permissions.get('microphone')) {
            throw new Error('Microphone permission not granted');
        }
        
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: options.echoCancellation ?? true,
                noiseSuppression: options.noiseSuppression ?? true
            }
        });
        
        return stream;
    },
    
    async vibrate(pattern) {
        if (!this.devices.vibration?.available) return false;
        
        if (Array.isArray(pattern)) {
            return navigator.vibrate(pattern);
        } else {
            return navigator.vibrate([pattern || 200]);
        }
    },
    
    getBatteryInfo() {
        if (!this.devices.battery?.available) return null;
        
        return navigator.getBattery().then(battery => ({
            level: battery.level * 100,
            charging: battery.charging,
            chargingTime: battery.chargingTime,
            dischargingTime: battery.dischargingTime
        }));
    },
    
    getLocation() {
        if (!this.permissions.get('geolocation')) return null;
        
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                pos => resolve({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                    accuracy: pos.coords.accuracy
                }),
                reject,
                { enableHighAccuracy: true }
            );
        });
    },
    
    renderDeviceStatus() {
        const available = Object.entries(this.devices)
            .filter(([_, d]) => d.available)
            .map(([name]) => name);
        
        const permissions = Array.from(this.permissions.entries())
            .filter(([_, granted]) => granted)
            .map(([name]) => name);
        
        return `
            <div style="padding:20px; background:rgba(0,0,0,0.3); border-radius:15px;">
                <h3 style="color:#4cc9f0; margin-bottom:15px;">🔌 الأجهزة المتصلة</h3>
                <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(150px,1fr)); gap:10px;">
                    ${available.map(device => `
                        <div style="display:flex; align-items:center; gap:10px; background:rgba(255,255,255,0.05); padding:10px; border-radius:8px;">
                            <span style="font-size:20px;">${this.getDeviceIcon(device)}</span>
                            <span>${this.getDeviceName(device)}</span>
                            <span style="color:#4ade80; margin-right:auto;">✓</span>
                        </div>
                    `).join('')}
                </div>
                
                <h3 style="color:#4cc9f0; margin:20px 0 15px;">🔑 الصلاحيات الممنوحة</h3>
                <div style="display:flex; gap:10px; flex-wrap:wrap;">
                    ${permissions.map(perm => `
                        <span style="background:#4ade80; color:black; padding:5px 15px; border-radius:20px;">
                            ${this.getDeviceName(perm)}
                        </span>
                    `).join('')}
                </div>
            </div>
        `;
    },
    
    getDeviceIcon(device) {
        const icons = {
            camera: '📷',
            microphone: '🎤',
            bluetooth: '📡',
            usb: '🔌',
            serial: '🔧',
            gamepad: '🎮',
            battery: '🔋',
            vibration: '📳',
            geolocation: '📍',
            accelerometer: '📊'
        };
        return icons[device] || '📱';
    },
    
    getDeviceName(device) {
        const names = {
            camera: 'كاميرا',
            microphone: 'ميكروفون',
            bluetooth: 'بلوتوث',
            usb: 'USB',
            serial: 'منفذ تسلسلي',
            gamepad: 'يد تحكم',
            battery: 'بطارية',
            vibration: 'اهتزاز',
            geolocation: 'موقع',
            accelerometer: 'مقياس تسارع'
        };
        return names[device] || device;
    }
};

if (window.AlaisaiCore) {
    AlaisaiCore.registerModule('AlaisaiHardware', AlaisaiHardware);
}

window.AlaisaiHardware = AlaisaiHardware;
console.log('🔌 Hardware Abstraction ready');