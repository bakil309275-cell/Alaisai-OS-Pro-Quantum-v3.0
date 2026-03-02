/**
 * Alaisai IPFS Bridge - بوابة التخزين اللامركزي
 * @version 3.0.0
 */

const AlaisaiIPFS = {
    version: '3.0.0',
    connected: false,
    node: null,
    pins: new Map(),
    
    async init() {
        console.log('🌍 IPFS Bridge initializing...');
        
        try {
            // محاولة الاتصال بـ IPFS
            await this.connect();
        } catch (err) {
            console.warn('IPFS connection failed, using simulation:', err);
            this.connected = false;
        }
        
        return this;
    },
    
    async connect() {
        // محاكاة اتصال IPFS
        this.connected = true;
        this.node = {
            id: 'Qm' + Math.random().toString(36).substring(2, 15),
            peerCount: Math.floor(Math.random() * 50) + 10
        };
        
        console.log('✅ IPFS connected:', this.node.id);
        return true;
    },
    
    async add(data) {
        if (!this.connected) await this.connect();
        
        // محاكاة إضافة ملف لـ IPFS
        const content = typeof data === 'string' ? data : JSON.stringify(data);
        const hash = 'Qm' + this.generateHash(content);
        
        // تخزين محلي مؤقت
        this.pins.set(hash, {
            content,
            size: content.length,
            timestamp: Date.now()
        });
        
        return {
            hash,
            size: content.length,
            pins: this.node?.peerCount || 0
        };
    },
    
    async get(hash) {
        const pinned = this.pins.get(hash);
        if (pinned) return pinned.content;
        
        // محاكاة استرجاع من الشبكة
        return null;
    },
    
    async pin(hash) {
        const content = await this.get(hash);
        if (content) {
            this.pins.set(hash, {
                ...this.pins.get(hash),
                pinned: true,
                pinnedAt: Date.now()
            });
            return true;
        }
        return false;
    },
    
    async unpin(hash) {
        return this.pins.delete(hash);
    },
    
    async list() {
        return Array.from(this.pins.entries()).map(([hash, data]) => ({
            hash,
            size: data.size,
            pinned: data.pinned || false,
            timestamp: data.timestamp
        }));
    },
    
    generateHash(content) {
        // توليد هاش بسيط للمحاكاة
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            hash = ((hash << 5) - hash) + content.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash).toString(36) + Date.now().toString(36);
    },
    
    async publish(data) {
        const result = await this.add(data);
        
        // نشر للشبكة
        if (this.node) {
            console.log(`📡 Publishing to ${this.node.peerCount} peers...`);
        }
        
        return result;
    },
    
    async resolve(path) {
        // حل مسار IPNS
        return path.replace('ipns://', 'ipfs://');
    },
    
    getStats() {
        return {
            connected: this.connected,
            nodeId: this.node?.id,
            peers: this.node?.peerCount || 0,
            pinned: this.pins.size,
            totalSize: Array.from(this.pins.values())
                .reduce((sum, p) => sum + p.size, 0)
        };
    },
    
    renderIPFSUI() {
        const stats = this.getStats();
        
        return `
            <div class="ipfs-bridge" style="padding:20px; background:rgba(0,0,0,0.3); border-radius:15px;">
                <h3 style="color:#4cc9f0;">🌍 IPFS Bridge</h3>
                
                <div style="margin-top:15px; display:flex; align-items:center; gap:10px;">
                    <span style="width:10px; height:10px; border-radius:50%; background:${this.connected ? '#4ade80' : '#f72585'};"></span>
                    <span>${this.connected ? 'متصل' : 'غير متصل'}</span>
                </div>
                
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-top:15px;">
                    <div style="background:rgba(255,255,255,0.05); padding:10px; border-radius:8px;">
                        <div style="color:#888; font-size:12px;">العقدة</div>
                        <div style="font-size:14px;">${this.node?.id || 'N/A'}</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.05); padding:10px; border-radius:8px;">
                        <div style="color:#888; font-size:12px;">الأقران</div>
                        <div style="font-size:24px;">${stats.peers}</div>
                    </div>
                </div>
                
                <div style="margin-top:15px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                        <span>الملفات المثبتة:</span>
                        <span style="color:#4cc9f0;">${stats.pinned}</span>
                    </div>
                    <div style="background:rgba(255,255,255,0.1); height:8px; border-radius:4px;">
                        <div style="width:${Math.min(stats.pinned * 10, 100)}%; height:100%; background:#4cc9f0;"></div>
                    </div>
                </div>
            </div>
        `;
    }
};

if (window.AlaisaiCore) {
    AlaisaiCore.registerModule('AlaisaiIPFS', AlaisaiIPFS);
}

window.AlaisaiIPFS = AlaisaiIPFS;
console.log('🌍 IPFS Bridge ready');