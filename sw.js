/**
 * Alaisai Quantum Service Worker
 * @version 3.0.0
 */

const CACHE_NAME = 'alaisai-quantum-v3';
const API_CACHE = 'alaisai-api-v3';
const DYNAMIC_CACHE = 'alaisai-dynamic-v3';

const STATIC_ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './assets/css/themes.css',
    './assets/css/animations.css',
    './system/core/quantum-core.js',
    './system/core/neural-core.js',
    './system/core/evolution.js',
    './system/core/security.js',
    './system/core/database.js',
    './system/core/api.js',
    './system/core/addons-manager.js',
    './system/ai/neural-assistant.js',
    './system/storage/distributed.js',
    './system/ui/file-manager.js',
    './system/ui/i18n.js',
    './system/ui/ui-kit.js',
    './system/ui/components.js',
    './system/ui/validators.js',
    './system/ui/helpers.js',
    './system/ui/formatters.js',
    './system/hardware/abstraction.js'
];

// التثبيت
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('📦 Caching static assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// التنشيط
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME && 
                                 key !== API_CACHE && 
                                 key !== DYNAMIC_CACHE)
                    .map(key => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// استراتيجية التخزين المؤقت
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // API calls - Network first
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(networkFirst(event.request));
        return;
    }
    
    // Static assets - Cache first
    if (STATIC_ASSETS.includes(url.pathname)) {
        event.respondWith(cacheFirst(event.request));
        return;
    }
    
    // Dynamic content - Stale while revalidate
    event.respondWith(staleWhileRevalidate(event.request));
});

async function cacheFirst(request) {
    const cached = await caches.match(request);
    return cached || fetch(request);
}

async function networkFirst(request) {
    try {
        const response = await fetch(request);
        const cache = await caches.open(API_CACHE);
        cache.put(request, response.clone());
        return response;
    } catch (err) {
        const cached = await caches.match(request);
        if (cached) return cached;
        throw err;
    }
}

async function staleWhileRevalidate(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cached = await cache.match(request);
    
    const networkPromise = fetch(request).then(response => {
        cache.put(request, response.clone());
        return response;
    });
    
    return cached || networkPromise;
}

// مزامنة في الخلفية
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-files') {
        event.waitUntil(syncFiles());
    } else if (event.tag === 'sync-addons') {
        event.waitUntil(syncAddons());
    }
});

async function syncFiles() {
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
        client.postMessage({
            type: 'SYNC_COMPLETE',
            timestamp: Date.now()
        });
    });
}

async function syncAddons() {
    // مزامنة الإضافات
}

// إشعارات
self.addEventListener('push', (event) => {
    const data = event.data.json();
    
    const options = {
        body: data.body,
        icon: 'assets/images/icon-192.png',
        badge: 'assets/images/icon-72.png',
        data: data.data
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow(event.notification.data.url || '/')
    );
});