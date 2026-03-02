/**
 * Alaisai Bluetooth API - واجهة البلوتوث
 * @version 3.0.0
 */

const AlaisaiBluetooth = {
    version: '3.0.0',
    available: false,
    devices: new Map(),
    connected: false,
    
    async init() {
        console.log('📡 Bluetooth API initializing...');
        
        this.available = 'bluetooth' in navigator;
        
        if (this.available) {
            await this.scan();
        }
        
        return this;
    },
    
    async scan() {
        if (!this.available) return [];
        
        try {
            // محاكاة أجهزة بلوتوث
            const mockDevices = [
                { id: 'bt_1', name: 'سماعة سامسونج', rssi: -45 },
                { id: 'bt_2', name: 'ماوس لوجيتك', rssi: -60 },
                { id: 'bt_3', name: 'لوحة مفاتيح', rssi: -55 },
                { id: 'bt_4', name: 'سماعة آبل', rssi: -70 }
            ];
            
            mockDevices.forEach(device => {
                this.devices.set(device.id, {
                    ...device,
                    lastSeen: Date.now()
                });
            });
            
            return Array.from(this.devices.values());
        } catch (err) {
            console.error('Bluetooth scan failed:', err);
            return [];
        }
    },
    
    async connect(deviceId) {
        const device = this.devices.get(deviceId);
        if (!device) return false;
        
        device.connected = true;
        device.connectedAt = Date.now();
        this.connected = true;
        
        return true;
    },
    
    disconnect(deviceId) {
        const device = this.devices.get(deviceId);
        if (device) {
            device.connected = false;
        }
        this.connected = false;
    },
    
    async sendData(deviceId, data) {
        const device = this.devices.get(deviceId);
        if (!device || !device.connected) return false;
        
        console.log(`📤 Sending to ${device.name}:`, data);
        return true;
    },
    
    async receiveData(deviceId) {
        const device = this.devices.get(deviceId);
        if (!device || !device.connected) return null;
        
        // محاكاة استقبال بيانات
        return {
            from: deviceId,
            data: { message: 'Hello from ' + device.name },
            timestamp: Date.now()
        };
    },
    
    getDevices() {
        return Array.from(this.devices.values());
    },
    
    getConnectedDevices() {
        return Array.from(this.devices.values()).filter(d => d.connected);
    },
    
    renderBluetoothUI() {
        const devices = this.getDevices();
        const connected = this.getConnectedDevices();
        
        return `
            <div class="bluetooth-api" style="padding:20px; background:rgba(0,0,0,0.3); border-radius:15px;">
                <h3 style="color:#4cc9f0;">📡 Bluetooth API</h3>
                
                <div style="margin-top:15px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="width:10px; height:10px; border-radius:50%; background:${this.available ? '#4ade80' : '#f72585'};"></span>
                        <span>${this.available ? 'متاح' : 'غير متاح'}</span>
                    </div>
                </div>
                
                <div style="margin-top:20px;">
                    <h4 style="color:#888;">الأجهزة المتاحة:</h4>
                    <div style="max-height:200px; overflow-y:auto;">
                        ${devices.map(device => `
                            <div style="display:flex; align-items:center; gap:10px; padding:10px; background:rgba(255,255,255,0.02); margin:5px 0; border-radius:5px;">
                                <span style="width:8px; height:8px; border-radius:50%; background:${device.connected ? '#4ade80' : '#888'};"></span>
                                <span style="flex:1;">${device.name}</span>
                                <span style="color:${device.rssi > -50 ? '#4ade80' : '#fbbf24'};">${device.rssi} dBm</span>
                                ${!device.connected ? `
                                    <button class="bt-btn" onclick="AlaisaiBluetooth.connect('${device.id}')" style="padding:3px 8px; background:#4cc9f0; border:none; border-radius:3px; color:black; font-size:12px; cursor:pointer;">
                                        اتصال
                                    </button>
                                ` : `
                                    <button class="bt-btn" onclick="AlaisaiBluetooth.disconnect('${device.id}')" style="padding:3px 8px; background:#f72585; border:none; border-radius:3px; color:white; font-size:12px; cursor:pointer;">
                                        قطع
                                    </button>
                                `}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
};

if (window.AlaisaiCore) {
    AlaisaiCore.registerModule('AlaisaiBluetooth', AlaisaiBluetooth);
}

window.AlaisaiBluetooth = AlaisaiBluetooth;
console.log('📡 Bluetooth API ready');