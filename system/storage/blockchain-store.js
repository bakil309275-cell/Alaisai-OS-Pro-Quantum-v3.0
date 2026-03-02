/**
 * Alaisai Blockchain Store - تخزين لامركزي على بلوكشين
 * @version 3.0.0
 */

const AlaisaiBlockchain = {
    version: '3.0.0',
    chain: [],
    pending: [],
    difficulty: 4,
    miningReward: 100,
    
    init() {
        console.log('⛓️ Blockchain Store initializing...');
        
        // إنشاء كتلة التكوين
        this.createGenesisBlock();
        
        // بدء التعدين
        this.startMining();
        
        return this;
    },
    
    createGenesisBlock() {
        const genesis = {
            index: 0,
            timestamp: Date.now(),
            transactions: [],
            previousHash: '0'.repeat(64),
            hash: this.calculateHash(0, Date.now(), [], '0'.repeat(64), 0),
            nonce: 0
        };
        
        this.chain.push(genesis);
    },
    
    createBlock(transactions) {
        const previousBlock = this.chain[this.chain.length - 1];
        
        return {
            index: this.chain.length,
            timestamp: Date.now(),
            transactions,
            previousHash: previousBlock.hash,
            hash: '',
            nonce: 0
        };
    },
    
    calculateHash(index, timestamp, transactions, previousHash, nonce) {
        const data = index + timestamp + JSON.stringify(transactions) + previousHash + nonce;
        let hash = 0;
        
        for (let i = 0; i < data.length; i++) {
            hash = ((hash << 5) - hash) + data.charCodeAt(i);
            hash |= 0;
        }
        
        return Math.abs(hash).toString(16).padStart(64, '0');
    },
    
    mineBlock(block) {
        const start = Date.now();
        
        while (block.hash.substring(0, this.difficulty) !== '0'.repeat(this.difficulty)) {
            block.nonce++;
            block.hash = this.calculateHash(
                block.index,
                block.timestamp,
                block.transactions,
                block.previousHash,
                block.nonce
            );
        }
        
        const duration = Date.now() - start;
        
        return {
            block,
            duration,
            hashes: block.nonce
        };
    },
    
    addTransaction(transaction) {
        this.pending.push({
            ...transaction,
            id: 'tx_' + Date.now() + '_' + Math.random().toString(36),
            timestamp: Date.now()
        });
        
        return true;
    },
    
    async addData(key, value, owner = 'anonymous') {
        const transaction = {
            type: 'data',
            key,
            value,
            owner,
            signature: this.sign(key + value + owner)
        };
        
        this.addTransaction(transaction);
        
        // إذا كان هناك 5 معاملات معلقة، قم بتعدينها
        if (this.pending.length >= 5) {
            await this.mine();
        }
        
        return transaction.id;
    },
    
    async getData(key) {
        // البحث في السلسلة
        for (let i = this.chain.length - 1; i >= 0; i--) {
            const block = this.chain[i];
            for (const tx of block.transactions) {
                if (tx.type === 'data' && tx.key === key) {
                    return tx.value;
                }
            }
        }
        
        return null;
    },
    
    async mine() {
        if (this.pending.length === 0) return null;
        
        const newBlock = this.createBlock([...this.pending]);
        const result = this.mineBlock(newBlock);
        
        this.chain.push(result.block);
        this.pending = [];
        
        console.log(`⛏️ Mined block #${result.block.index} in ${result.duration}ms`);
        
        return result;
    },
    
    sign(data) {
        // توقيع بسيط للمحاكاة
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            hash = ((hash << 5) - hash) + data.charCodeAt(i);
            hash |= 0;
        }
        return 'sig_' + Math.abs(hash).toString(36);
    },
    
    verifyChain() {
        for (let i = 1; i < this.chain.length; i++) {
            const current = this.chain[i];
            const previous = this.chain[i - 1];
            
            // التحقق من الهاش
            const hash = this.calculateHash(
                current.index,
                current.timestamp,
                current.transactions,
                current.previousHash,
                current.nonce
            );
            
            if (current.hash !== hash) {
                return false;
            }
            
            // التحقق من الإشارة للسابق
            if (current.previousHash !== previous.hash) {
                return false;
            }
        }
        
        return true;
    },
    
    getBalance(address) {
        let balance = 0;
        
        for (const block of this.chain) {
            for (const tx of block.transactions) {
                if (tx.type === 'reward' && tx.address === address) {
                    balance += tx.amount;
                }
                if (tx.type === 'transfer') {
                    if (tx.from === address) balance -= tx.amount;
                    if (tx.to === address) balance += tx.amount;
                }
            }
        }
        
        return balance;
    },
    
    getStats() {
        return {
            blocks: this.chain.length,
            transactions: this.chain.reduce((sum, b) => sum + b.transactions.length, 0),
            pending: this.pending.length,
            difficulty: this.difficulty,
            valid: this.verifyChain(),
            lastBlock: this.chain[this.chain.length - 1]
        };
    },
    
    startMining() {
        // تعدين تلقائي كل دقيقة إذا وجدت معاملات
        setInterval(() => {
            if (this.pending.length > 0) {
                this.mine();
            }
        }, 60000);
    },
    
    renderBlockchainUI() {
        const stats = this.getStats();
        const lastBlock = stats.lastBlock;
        
        return `
            <div class="blockchain-store" style="padding:20px; background:rgba(0,0,0,0.3); border-radius:15px;">
                <h3 style="color:#4cc9f0;">⛓️ Blockchain Store</h3>
                
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-top:15px;">
                    <div style="background:rgba(255,255,255,0.05); padding:10px; border-radius:8px;">
                        <div style="color:#888; font-size:12px;">الكتل</div>
                        <div style="font-size:24px;">${stats.blocks}</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.05); padding:10px; border-radius:8px;">
                        <div style="color:#888; font-size:12px;">المعاملات</div>
                        <div style="font-size:24px;">${stats.transactions}</div>
                    </div>
                </div>
                
                <div style="margin-top:15px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="width:10px; height:10px; border-radius:50%; background:${stats.valid ? '#4ade80' : '#f72585'};"></span>
                        <span>${stats.valid ? 'سلسلة صالحة' : 'سلسلة تالفة'}</span>
                    </div>
                </div>
                
                <div style="margin-top:20px;">
                    <h4 style="color:#888;">آخر كتلة:</h4>
                    <div style="background:rgba(255,255,255,0.02); padding:10px; border-radius:8px; font-family:monospace; font-size:12px;">
                        <div>Index: ${lastBlock?.index}</div>
                        <div>Hash: ${lastBlock?.hash.substring(0, 20)}...</div>
                        <div>Time: ${new Date(lastBlock?.timestamp).toLocaleString()}</div>
                        <div>Nonce: ${lastBlock?.nonce}</div>
                    </div>
                </div>
                
                ${this.pending.length > 0 ? `
                    <div style="margin-top:15px; padding:10px; background:rgba(251,191,36,0.1); border-radius:8px;">
                        <span style="color:#fbbf24;">⏳ معاملات معلقة: ${this.pending.length}</span>
                    </div>
                ` : ''}
            </div>
        `;
    }
};

if (window.AlaisaiCore) {
    AlaisaiCore.registerModule('AlaisaiBlockchain', AlaisaiBlockchain);
}

window.AlaisaiBlockchain = AlaisaiBlockchain.init();
console.log('⛓️ Blockchain Store ready');