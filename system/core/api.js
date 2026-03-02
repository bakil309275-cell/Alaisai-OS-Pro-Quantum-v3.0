/**
 * Alaisai Quantum API - واجهة برمجة تطبيقات كمومية
 * @version 3.0.0
 */

const AlaisaiQuantumAPI = {
    version: '3.0.0',
    endpoints: new Map(),
    middleware: [],
    cache: new Map(),
    
    init() {
        console.log('🔌 Quantum API initializing...');
        
        // تسجيل النقاط الأساسية
        this.registerDefaultEndpoints();
        
        return this;
    },
    
    registerDefaultEndpoints() {
        // نظام
        this.register('system.info', async () => ({
            version: '3.0.0',
            quantum: true,
            ai: true,
            uptime: Date.now() - window._startTime
        }));
        
        this.register('system.health', async () => ({
            status: 'healthy',
            memory: performance.memory ? {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.jsHeapSizeLimit
            } : null,
            timestamp: Date.now()
        }));
        
        // الأمان
        this.register('security.status', async () => {
            if (window.AlaisaiQuantumSecurity) {
                return window.AlaisaiQuantumSecurity.getSecurityStatus();
            }
            return { error: 'Security module not available' };
        });
        
        // قاعدة البيانات
        this.register('db.stats', async () => {
            if (window.AlaisaiDistributedDB) {
                return await window.AlaisaiDistributedDB.stats();
            }
            return { error: 'Database not available' };
        });
        
        // التخزين الموزع
        this.register('storage.status', async () => {
            if (window.AlaisaiDistributedStorage) {
                return {
                    providers: Array.from(window.AlaisaiDistributedStorage.providers.keys()),
                    peers: Array.from(window.AlaisaiDistributedStorage.peers)
                };
            }
            return { error: 'Storage not available' };
        });
        
        // الذكاء الاصطناعي
        this.register('ai.predict', async ({ input }) => {
            if (window.AlaisaiNeuralCore) {
                return window.AlaisaiNeuralCore.predict(input);
            }
            return { error: 'AI not available' };
        });
        
        // الأجهزة
        this.register('hardware.devices', async () => {
            if (window.AlaisaiHardware) {
                return window.AlaisaiHardware.devices;
            }
            return { error: 'Hardware module not available' };
        });
        
        // الملفات
        this.register('files.list', async ({ path, source = 'local' }) => {
            if (window.AlaisaiFileManager) {
                if (source === 'github') {
                    return await window.AlaisaiFileManager.listGitHubContents(path);
                } else {
                    return await window.AlaisaiFileManager.readOPFSDirectory(path);
                }
            }
            return { error: 'File manager not available' };
        });
        
        // الإضافات
        this.register('addons.list', async () => {
            if (window.AlaisaiAddons) {
                return window.AlaisaiAddons.listAddons();
            }
            return { error: 'Addons manager not available' };
        });
    },
    
    register(endpoint, handler, options = {}) {
        this.endpoints.set(endpoint, {
            handler,
            options: {
                auth: options.auth || false,
                rateLimit: options.rateLimit || 0,
                cache: options.cache || false,
                cacheTTL: options.cacheTTL || 60000,
                ...options
            },
            hits: 0,
            createdAt: Date.now()
        });
        
        console.log(`📡 API endpoint registered: ${endpoint}`);
    },
    
    async call(endpoint, params = {}, context = {}) {
        const api = this.endpoints.get(endpoint);
        if (!api) {
            return {
                success: false,
                error: 'ENDPOINT_NOT_FOUND',
                message: `Endpoint ${endpoint} not found`
            };
        }
        
        // التحقق من الكاش
        if (api.options.cache) {
            const cacheKey = `${endpoint}:${JSON.stringify(params)}`;
            const cached = this.cache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < api.options.cacheTTL) {
                return {
                    success: true,
                    data: cached.data,
                    fromCache: true
                };
            }
        }
        
        // تنفيذ middleware
        for (const mw of this.middleware) {
            const result = await mw({ endpoint, params, context });
            if (result === false) {
                return {
                    success: false,
                    error: 'MIDDLEWARE_BLOCKED',
                    message: 'Request blocked by middleware'
                };
            }
        }
        
        // التحقق من المصادقة
        if (api.options.auth) {
            if (!context.token) {
                return {
                    success: false,
                    error: 'UNAUTHORIZED',
                    message: 'Authentication required'
                };
            }
            
            if (window.AlaisaiQuantumSecurity) {
                const session = window.AlaisaiQuantumSecurity.verifySession(context.token);
                if (!session) {
                    return {
                        success: false,
                        error: 'INVALID_TOKEN',
                        message: 'Invalid or expired token'
                    };
                }
                context.user = session;
            }
        }
        
        // تحديد معدل الطلبات
        if (api.options.rateLimit > 0) {
            const key = `rate:${endpoint}:${context.user?.userId || context.ip || 'anonymous'}`;
            const rateCheck = window.AlaisaiQuantumSecurity?.checkRateLimit(
                key, 
                api.options.rateLimit, 
                60000
            );
            
            if (rateCheck && !rateCheck.allowed) {
                return {
                    success: false,
                    error: 'RATE_LIMITED',
                    message: 'Rate limit exceeded',
                    resetAt: rateCheck.resetAt
                };
            }
        }
        
        try {
            api.hits++;
            const start = Date.now();
            const data = await api.handler(params, context);
            const duration = Date.now() - start;
            
            const result = {
                success: true,
                data,
                meta: {
                    endpoint,
                    duration,
                    timestamp: Date.now()
                }
            };
            
            // تخزين في الكاش
            if (api.options.cache) {
                const cacheKey = `${endpoint}:${JSON.stringify(params)}`;
                this.cache.set(cacheKey, {
                    data,
                    timestamp: Date.now()
                });
                
                // تنظيف الكاش القديم
                if (this.cache.size > 100) {
                    const oldest = Date.now() - 3600000;
                    for (const [key, value] of this.cache) {
                        if (value.timestamp < oldest) {
                            this.cache.delete(key);
                        }
                    }
                }
            }
            
            return result;
        } catch (error) {
            return {
                success: false,
                error: 'HANDLER_ERROR',
                message: error.message
            };
        }
    },
    
    use(middleware) {
        this.middleware.push(middleware);
        return this;
    },
    
    async batch(calls) {
        const results = {};
        
        for (const [key, { endpoint, params }] of Object.entries(calls)) {
            results[key] = await this.call(endpoint, params);
        }
        
        return results;
    },
    
    getStats() {
        return {
            totalEndpoints: this.endpoints.size,
            totalHits: Array.from(this.endpoints.values()).reduce((sum, api) => sum + api.hits, 0),
            cacheSize: this.cache.size,
            endpoints: Array.from(this.endpoints.entries()).map(([name, api]) => ({
                name,
                hits: api.hits,
                options: api.options
            }))
        };
    }
};

if (window.AlaisaiCore) {
    AlaisaiCore.registerModule('AlaisaiQuantumAPI', AlaisaiQuantumAPI);
}

window.AlaisaiQuantumAPI = AlaisaiQuantumAPI.init();
window._startTime = Date.now();
console.log('🔌 Quantum API ready');