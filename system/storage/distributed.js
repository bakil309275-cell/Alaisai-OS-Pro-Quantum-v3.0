/**
 * Alaisai Distributed Storage - تخزين موزع لامركزي
 * @version 3.0.0
 */

const AlaisaiDistributedStorage = {
    version: '3.0.0',
    providers: new Map(),
    peers: new Set(),
    replicationFactor: 3,
    
    async init() {
        console.log('🌐 Distributed Storage initializing...');
        
        // تسجيل مزودي التخزين
        this.registerProvider('local', new LocalStorageProvider());
        this.registerProvider('ipfs', new IPFSProvider());
        this.registerProvider('p2p', new P2PProvider());
        this.registerProvider('blockchain', new BlockchainProvider());
        
        // بدء اكتشاف الأقران
        this.startPeerDiscovery();
        
        return this;
    },
    
    registerProvider(name, provider) {
        this.providers.set(name, {
            instance: provider,
            status: 'active',
            latency: 0,
            reliability: 1.0
        });
    },
    
    async store(data, options = {}) {
        const {
            redundancy = 2,
            providers = ['local', 'ipfs', 'p2p'],
            encrypt = true,
            compress = true
        } = options;
        
        const results = [];
        const dataId = this.generateId();
        
        // تشفير إذا لزم
        let processedData = data;
        if (encrypt && window.AlaisaiSecurity) {
            processedData = await window.AlaisaiSecurity.encrypt(data, 'quantum-key');
        }
        
        // ضغط إذا لزم
        if (compress) {
            processedData = this.compress(processedData);
        }
        
        // تخزين في مزودين متعددين
        for (const providerName of providers) {
            const provider = this.providers.get(providerName);
            if (provider && provider.status === 'active') {
                try {
                    const start = Date.now();
                    const result = await provider.instance.store(dataId, processedData);
                    const latency = Date.now() - start;
                    
                    provider.latency = (provider.latency * 0.7 + latency * 0.3);
                    
                    results.push({
                        provider: providerName,
                        id: result,
                        latency
                    });
                } catch (err) {
                    console.error(`❌ Failed to store in ${providerName}:`, err);
                    provider.reliability *= 0.9;
                }
            }
        }
        
        // تحديث دفتر الأستاذ الموزع
        await this.updateLedger(dataId, results);
        
        return {
            id: dataId,
            copies: results.length,
            providers: results.map(r => r.provider)
        };
    },
    
    async retrieve(id, options = {}) {
        const {
            preferFastest = true,
            timeout = 5000
        } = options;
        
        // ترتيب المزودين حسب السرعة والموثوقية
        const available = Array.from(this.providers.entries())
            .filter(([_, p]) => p.status === 'active')
            .sort((a, b) => {
                if (preferFastest) {
                    return a[1].latency - b[1].latency;
                } else {
                    return b[1].reliability - a[1].reliability;
                }
            });
        
        // محاولة القراءة من كل مزود
        for (const [name, provider] of available) {
            try {
                const result = await Promise.race([
                    provider.instance.retrieve(id),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Timeout')), timeout)
                    )
                ]);
                
                if (result) {
                    return result;
                }
            } catch (err) {
                console.warn(`⚠️ Failed to retrieve from ${name}:`, err);
                continue;
            }
        }
        
        throw new Error(`❌ Failed to retrieve ${id} from any provider`);
    },
    
    generateId() {
        return 'data_' + Date.now() + '_' + 
               Math.random().toString(36).substr(2, 16) + 
               '_' + Math.random().toString(36).substr(2, 16);
    },
    
    compress(data) {
        // ضغط بسيط (في الحقيقة استخدم مكتبة حقيقية)
        const str = JSON.stringify(data);
        return btoa(str);
    },
    
    decompress(data) {
        try {
            const str = atob(data);
            return JSON.parse(str);
        } catch {
            return data;
        }
    },
    
    async updateLedger(id, results) {
        // تحديث سجل موزع (بسيط)
        const ledger = await this.retrieve('ledger') || [];
        ledger.push({ id, results, timestamp: Date.now() });
        
        // حفظ السجل في عدة أماكن
        await this.store(ledger, {
            providers: ['ipfs', 'p2p'],
            encrypt: false
        });
    },
    
    startPeerDiscovery() {
        // اكتشاف أقران P2P
        setInterval(() => {
            // محاكاة اكتشاف أقران جدد
            if (Math.random() < 0.3) {
                const newPeer = `peer_${Math.random().toString(36).substr(2, 8)}`;
                this.peers.add(newPeer);
                console.log(`🔄 New peer discovered: ${newPeer}`);
            }
        }, 30000);
    }
};

// ===== مزودات التخزين =====
class LocalStorageProvider {
    async store(id, data) {
        localStorage.setItem(id, JSON.stringify(data));
        return id;
    }
    
    async retrieve(id) {
        const data = localStorage.getItem(id);
        return data ? JSON.parse(data) : null;
    }
}

class IPFSProvider {
    async store(id, data) {
        // محاكاة تخزين IPFS
        return `ipfs://${id}`;
    }
    
    async retrieve(id) {
        // محاكاة استرجاع من IPFS
        return null;
    }
}

class P2PProvider {
    constructor() {
        this.storage = new Map();
    }
    
    async store(id, data) {
        this.storage.set(id, data);
        
        // نشر للأقران (محاكاة)
        AlaisaiDistributedStorage.peers.forEach(peer => {
            console.log(`📡 Broadcasting to ${peer}`);
        });
        
        return id;
    }
    
    async retrieve(id) {
        return this.storage.get(id) || null;
    }
}

class BlockchainProvider {
    async store(id, data) {
        // محاكاة تخزين في بلوكشين
        return `blockchain://${id}`;
    }
    
    async retrieve(id) {
        return null;
    }
}

// تهيئة
if (window.AlaisaiCore) {
    AlaisaiCore.registerModule('AlaisaiDistributedStorage', AlaisaiDistributedStorage);
}

window.AlaisaiDistributedStorage = AlaisaiDistributedStorage;
console.log('🌐 Distributed Storage ready');