/**
 * Alaisai USB API - واجهة USB
 * @version 3.0.0
 */

const AlaisaiUSB = {
    version: '3.0.0',
    available: false,
    devices: new Map(),
    
    async init() {
        console.log('🔌 USB API initializing...');
        
        this.available = 'usb' in navigator;
        
        if (this.available) {
            await this.scan();
        }
        
        return this;
    },
    
    async scan() {
        if (!this.available) return [];
        
        try {
            // محاكاة أجهزة USB
            const mockDevices = [
                { id: 'usb_1', name: 'فلاش ميموري 32GB', vendorId: '0x0781', productId: '0x5583' },
                { id: 'usb_2', name: 'قرص صلب خارجي 1TB', vendorId: '0x0bc2', productId: '0x231a' },
                { id: 'usb_3', name: 'ماوس USB', vendorId: '0x046d', productId: '0xc077' }
            ];
            
            mockDevices.forEach(device => {
                this.devices.set(device.id, {
                    ...device,
                    connected: true,
                    lastSeen: Date.now()
                });
            });
            
            return Array.from(this.devices.values());
        } catch (err) {
            console.error('USB scan failed:', err);
            return [];
        }
    },
    
    async requestDevice(options = {}) {
        if (!this.available) return null;
        
        try {
            // محاكاة طلب جهاز
            const device = {
                id: 'usb_' + Date.now(),
                name: 'جهاز USB جديد',
                vendorId: '0x1234',
                productId: '0x5678',
                connected: true
            };
            
            this.devices.set(device.id, device);
            return device;
        } catch (err) {
            console.error('USB request failed:', err);
            return null;
        }
    },
    
    async read(deviceId) {
        const device = this.devices.get(deviceId);
        if (!device || !device.connected) return null;
        
        // محاكاة قراءة بيانات
        return {
            from: deviceId,
            data: new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]),
            size: 5,
            timestamp: Date.now()
        };
    },
    
    async write(deviceId, data) {
        const device = this.devices.get(deviceId);
        if (!device || !device.connected) return false;
        
        console.log(`📝 Writing to ${device.name}:`, data);
        return true;
    },
    
    async transfer(deviceId, endpoint, data) {
        const device = this.devices.get(deviceId);
        if (!device || !device.connected) return null;
        
        return {
            transferred: data.length,
            data: new Uint8Array(data),
            timestamp: Date.now()
        };
    },
    
    getDevices() {
        return Array.from(this.devices.values());
    },
    
    renderUSBUI() {
        const devices = this.getDevices();
        
        return `
            <div class="usb-api" style="padding:20px; background:rgba(0,0,0,0.3); border-radius:15px;">
                <h3 style="color:#4cc9f0;">🔌 USB API</h3>
                
                <div style="margin-top:15px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="width:10px; height:10px; border-radius:50%; background:${this.available ? '#4ade80' : '#f72585'};"></span>
                        <span>${this.available ? 'متاح' : 'غير متاح'}</span>
                    </div>
                </div>
                
                <div style="margin-top:20px;">
                    <h4 style="color:#888;">الأجهزة المتصلة:</h4>
                    <div style="max-height:200px; overflow-y:auto;">
                        ${devices.map(device => `
                            <div style="display:flex; align-items:center; gap:10px; padding:10px; background:rgba(255,255,255,0.02); margin:5px 0; border-radius:5px;">
                                <span style="width:8px; height:8px; border-radius:50%; background:#4ade80;"></span>
                                <span style="flex:1;">${device.name}</span>
                                <span style="color:#888; font-size:12px;">${device.vendorId}:${device.productId}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div style="margin-top:15px;">
                    <button class="usb-btn" onclick="AlaisaiUSB.requestDevice()" style="padding:8px 15px; background:#4cc9f0; border:none; border-radius:5px; color:black; cursor:pointer;">
                        🔍 طلب جهاز جديد
                    </button>
                </div>
            </div>
        `;
    }
};

if (window.AlaisaiCore) {
    AlaisaiCore.registerModule('AlaisaiUSB', AlaisaiUSB);
}

window.AlaisaiUSB = AlaisaiUSB;
console.log('🔌 USB API ready');