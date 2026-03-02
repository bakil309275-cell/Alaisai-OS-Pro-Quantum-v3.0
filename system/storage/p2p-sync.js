/**
 * Alaisai P2P Sync - مزامرة ند لند
 * @version 3.0.0
 */

const AlaisaiP2P = {
    version: '3.0.0',
    peers: new Map(),
    connected: false,
    peerId: null,
    channels: new Map(),
    
    async init() {
        console.log('🔄 P2P Sync initializing...');
        
        this.peerId = 'peer_' + Date.now() + '_' + 
                      Math.random().toString(36).substr(2, 8);
        
        // بدء اكتشاف الأقران
        this.startDiscovery();
        
        // محاكاة اتصال
        this.connected = true;
        
        return this;
    },
    
    startDiscovery() {
        // اكتشاف أقران وهميين
        setInterval(() => {
            if (Math.random() < 0.3) {
                const newPeer = {
                    id: 'peer_' + Math.random().toString(36).substr(2, 8),
                    name: 'Peer_' + Math.floor(Math.random() * 1000),
                    latency: Math.floor(Math.random() * 100) + 20,
                    connected: true
                };
                
                this.peers.set(newPeer.id, newPeer);
                console.log('🆕 New peer discovered:', newPeer.id);
            }
        }, 30000);
        
        // فحص الاتصال
        setInterval(() => {
            this.peers.forEach((peer, id) => {
                if (Math.random() < 0.1) {
                    peer.connected = Math.random() > 0.3;
                }
            });
        }, 60000);
    },
    
    async connectToPeer(peerId) {
        const peer = this.peers.get(peerId);
        if (peer) {
            peer.connected = true;
            return true;
        }
        return false;
    },
    
    async disconnectFromPeer(peerId) {
        const peer = this.peers.get(peerId);
        if (peer) {
            peer.connected = false;
            return true;
        }
        return false;
    },
    
    async broadcast(channel, data) {
        const message = {
            from: this.peerId,
            channel,
            data,
            timestamp: Date.now(),
            id: 'msg_' + Date.now() + '_' + Math.random().toString(36)
        };
        
        // إرسال لجميع الأقران المتصلين
        const sentTo = [];
        this.peers.forEach((peer, id) => {
            if (peer.connected) {
                // محاكاة إرسال
                sentTo.push(id);
                this.receiveMessage(peer, message);
            }
        });
        
        return {
            sent: sentTo.length,
            total: this.peers.size
        };
    },
    
    async sendTo(peerId, channel, data) {
        const peer = this.peers.get(peerId);
        if (!peer || !peer.connected) return false;
        
        const message = {
            from: this.peerId,
            channel,
            data,
            timestamp: Date.now()
        };
        
        return this.receiveMessage(peer, message);
    },
    
    receiveMessage(peer, message) {
        // محاكاة استقبال رسالة
        console.log(`📨 Received from ${peer.id}:`, message);
        
        // تخزين في القناة
        if (!this.channels.has(message.channel)) {
            this.channels.set(message.channel, []);
        }
        this.channels.get(message.channel).push(message);
        
        return true;
    },
    
    subscribe(channel, callback) {
        if (!this.channels.has(channel)) {
            this.channels.set(channel, []);
        }
        
        // إضافة مستمع
        if (!this.channelListeners) {
            this.channelListeners = new Map();
        }
        if (!this.channelListeners.has(channel)) {
            this.channelListeners.set(channel, []);
        }
        this.channelListeners.get(channel).push(callback);
    },
    
    unsubscribe(channel, callback) {
        if (this.channelListeners?.has(channel)) {
            const listeners = this.channelListeners.get(channel);
            const index = listeners.indexOf(callback);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }
    },
    
    async sync(data, options = {}) {
        const {
            channel = 'sync',
            consistency = 'eventual',
            timeout = 5000
        } = options;
        
        // نشر التغييرات
        const result = await this.broadcast(channel, {
            type: 'sync',
            data,
            consistency
        });
        
        // انتظار التأكيدات
        await new Promise(resolve => setTimeout(resolve, 100));
        
        return {
            ...result,
            consistency,
            timestamp: Date.now()
        };
    },
    
    getPeers() {
        return Array.from(this.peers.values()).map(peer => ({
            ...peer,
            latency: peer.connected ? peer.latency : null
        }));
    },
    
    getStats() {
        const connected = Array.from(this.peers.values())
            .filter(p => p.connected).length;
        
        return {
            peerId: this.peerId,
            connected: this.connected,
            totalPeers: this.peers.size,
            connectedPeers: connected,
            channels: this.channels.size,
            messages: Array.from(this.channels.values())
                .reduce((sum, msgs) => sum + msgs.length, 0)
        };
    },
    
    renderP2PUI() {
        const stats = this.getStats();
        const peers = this.getPeers();
        
        return `
            <div class="p2p-sync" style="padding:20px; background:rgba(0,0,0,0.3); border-radius:15px;">
                <h3 style="color:#4cc9f0;">🔄 P2P Network</h3>
                
                <div style="display:flex; align-items:center; gap:10px; margin-top:10px;">
                    <span style="width:10px; height:10px; border-radius:50%; background:${this.connected ? '#4ade80' : '#f72585'};"></span>
                    <span>${this.connected ? 'متصل' : 'غير متصل'}</span>
                    <span style="color:#888;">ID: ${this.peerId}</span>
                </div>
                
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-top:15px;">
                    <div style="background:rgba(255,255,255,0.05); padding:10px; border-radius:8px;">
                        <div style="color:#888; font-size:12px;">الأقران الكلي</div>
                        <div style="font-size:24px;">${stats.totalPeers}</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.05); padding:10px; border-radius:8px;">
                        <div style="color:#888; font-size:12px;">المتصلون</div>
                        <div style="font-size:24px; color:#4ade80;">${stats.connectedPeers}</div>
                    </div>
                </div>
                
                <div style="margin-top:20px;">
                    <h4 style="color:#888;">الأقران المتصلون:</h4>
                    <div style="max-height:200px; overflow-y:auto;">
                        ${peers.filter(p => p.connected).map(peer => `
                            <div style="display:flex; align-items:center; gap:10px; padding:10px; background:rgba(255,255,255,0.02); margin:5px 0; border-radius:5px;">
                                <span style="width:8px; height:8px; border-radius:50%; background:#4ade80;"></span>
                                <span style="flex:1;">${peer.id}</span>
                                <span style="color:#4cc9f0;">${peer.latency}ms</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
};

if (window.AlaisaiCore) {
    AlaisaiCore.registerModule('AlaisaiP2P', AlaisaiP2P);
}

window.AlaisaiP2P = AlaisaiP2P;
console.log('🔄 P2P Sync ready');