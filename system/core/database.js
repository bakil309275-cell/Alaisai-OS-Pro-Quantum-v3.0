/**
 * Alaisai Distributed Database - قاعدة بيانات موزعة مع IndexedDB
 * @version 3.0.0
 */

const AlaisaiDistributedDB = {
    version: '3.0.0',
    name: 'AlaisaiQuantumDB',
    version: 2,
    db: null,
    stores: ['settings', 'users', 'sessions', 'addons', 'backups', 'files', 'analytics'],
    
    async init() {
        console.log('🗄️ Distributed Database initializing...');
        
        await this.openDatabase();
        await this.createIndexes();
        await this.syncWithPeers();
        
        return this;
    },
    
    async openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.name, this.version);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                console.log('✅ Database opened');
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // إنشاء المخازن
                this.stores.forEach(storeName => {
                    if (!db.objectStoreNames.contains(storeName)) {
                        const store = db.createObjectStore(storeName, { 
                            keyPath: 'id', 
                            autoIncrement: true 
                        });
                        
                        // إنشاء فهارس
                        if (storeName === 'users') {
                            store.createIndex('username', 'username', { unique: true });
                            store.createIndex('email', 'email', { unique: true });
                        }
                        if (storeName === 'files') {
                            store.createIndex('path', 'path', { unique: true });
                            store.createIndex('type', 'type');
                        }
                        if (storeName === 'analytics') {
                            store.createIndex('timestamp', 'timestamp');
                        }
                    }
                });
            };
        });
    },
    
    async createIndexes() {
        // فهارس إضافية للمخازن
        const transactions = this.stores.map(storeName => {
            if (!this.db.objectStoreNames.contains(storeName)) return;
            
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            
            return transaction;
        });
        
        await Promise.all(transactions.map(t => 
            new Promise((resolve, reject) => {
                if (!t) return resolve();
                t.oncomplete = resolve;
                t.onerror = reject;
            })
        ));
    },
    
    async put(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            
            // إضافة طابع زمني
            data.updatedAt = Date.now();
            if (!data.id) {
                data.id = this.generateId();
                data.createdAt = Date.now();
            }
            
            const request = store.put(data);
            
            request.onsuccess = () => {
                resolve(data.id);
                
                // مزامنة مع الأقران
                this.broadcastChange(storeName, data);
            };
            request.onerror = () => reject(request.error);
        });
    },
    
    async get(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },
    
    async getAll(storeName, query = {}) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            
            request.onsuccess = () => {
                let results = request.result;
                
                // تطبيق الاستعلام إذا وجد
                if (Object.keys(query).length > 0) {
                    results = results.filter(item => {
                        return Object.entries(query).every(([key, value]) => 
                            item[key] === value
                        );
                    });
                }
                
                resolve(results);
            };
            request.onerror = () => reject(request.error);
        });
    },
    
    async delete(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);
            
            request.onsuccess = () => {
                resolve(true);
                
                // إعلام الأقران بالحذف
                this.broadcastDelete(storeName, id);
            };
            request.onerror = () => reject(request.error);
        });
    },
    
    async query(storeName, indexName, value) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.getAll(value);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },
    
    async search(storeName, field, searchTerm) {
        const all = await this.getAll(storeName);
        const term = searchTerm.toLowerCase();
        
        return all.filter(item => 
            item[field] && item[field].toString().toLowerCase().includes(term)
        );
    },
    
    async backup() {
        const backup = {
            timestamp: Date.now(),
            stores: {}
        };
        
        for (const storeName of this.stores) {
            backup.stores[storeName] = await this.getAll(storeName);
        }
        
        // حفظ النسخة
        await this.put('backups', {
            id: `backup_${backup.timestamp}`,
            ...backup
        });
        
        // تخزين في نظام الملفات الموزع
        if (window.AlaisaiDistributedStorage) {
            await window.AlaisaiDistributedStorage.store(backup, {
                providers: ['ipfs', 'p2p']
            });
        }
        
        return backup;
    },
    
    async restore(backupId) {
        const backup = await this.get('backups', backupId);
        if (!backup) throw new Error('Backup not found');
        
        for (const [storeName, items] of Object.entries(backup.stores)) {
            // مسح المخزن
            await this.clear(storeName);
            
            // إعادة البيانات
            for (const item of items) {
                await this.put(storeName, item);
            }
        }
        
        return true;
    },
    
    async clear(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();
            
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    },
    
    generateId() {
        return 'db_' + Date.now() + '_' + 
               Math.random().toString(36).substr(2, 9) + 
               '_' + Math.random().toString(36).substr(2, 9);
    },
    
    async syncWithPeers() {
        // مزامنة مع الأقران عبر P2P
        if (window.AlaisaiDistributedStorage) {
            try {
                const peerData = await window.AlaisaiDistributedStorage.retrieve('db_sync');
                if (peerData) {
                    // دمج البيانات
                    await this.mergeWithPeer(peerData);
                }
            } catch (err) {
                console.warn('⚠️ Peer sync failed:', err);
            }
        }
    },
    
    async mergeWithPeer(peerData) {
        // دمج البيانات من الأقران
        for (const [storeName, items] of Object.entries(peerData)) {
            const localItems = await this.getAll(storeName);
            const localMap = new Map(localItems.map(i => [i.id, i]));
            
            for (const item of items) {
                const local = localMap.get(item.id);
                if (!local || (item.updatedAt > local.updatedAt)) {
                    await this.put(storeName, item);
                }
            }
        }
    },
    
    broadcastChange(storeName, data) {
        // إرسال التغيير للأقران
        if (window.AlaisaiDistributedStorage) {
            window.AlaisaiDistributedStorage.store({
                type: 'db_change',
                store: storeName,
                data,
                timestamp: Date.now()
            }, { providers: ['p2p'] }).catch(() => {});
        }
    },
    
    broadcastDelete(storeName, id) {
        if (window.AlaisaiDistributedStorage) {
            window.AlaisaiDistributedStorage.store({
                type: 'db_delete',
                store: storeName,
                id,
                timestamp: Date.now()
            }, { providers: ['p2p'] }).catch(() => {});
        }
    },
    
    async stats() {
        const stats = {};
        
        for (const storeName of this.stores) {
            const items = await this.getAll(storeName);
            stats[storeName] = {
                count: items.length,
                lastUpdated: Math.max(...items.map(i => i.updatedAt || 0), 0)
            };
        }
        
        return stats;
    }
};

if (window.AlaisaiCore) {
    AlaisaiCore.registerModule('AlaisaiDistributedDB', AlaisaiDistributedDB);
}

window.AlaisaiDistributedDB = AlaisaiDistributedDB;
console.log('🗄️ Distributed Database ready');