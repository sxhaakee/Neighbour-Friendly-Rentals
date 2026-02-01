// Service Worker for NFR - Push Notifications
const CACHE_NAME = 'nfr-cache-v2';
const urlsToCache = [
    '/',
    '/logo.png',
    '/og-image.png'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
    // Force the waiting service worker to become the active service worker
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // Take control of all clients immediately
    return self.clients.claim();
});

// Fetch event - Network First strategy
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip cross-origin requests (except fonts/images if needed, but keeping simple for now)
    if (!event.request.url.startsWith(self.location.origin)) return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Check if valid response
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                // Clone response to cache
                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                    .then((cache) => {
                        cache.put(event.request, responseToCache);
                    });

                return response;
            })
            .catch(() => {
                // If offline, try cache
                return caches.match(event.request)
                    .then((response) => {
                        if (response) {
                            return response;
                        }
                        // Fallback for navigation requests (e.g. show offline page or home)
                        if (event.request.mode === 'navigate') {
                            return caches.match('/');
                        }
                        return null;
                    });
            })
    );
});

// Push event - handle push notifications
self.addEventListener('push', (event) => {
    console.log('Push notification received:', event);

    const data = event.data ? event.data.json() : {};
    const title = data.title || 'NFR Notification';
    const options = {
        body: data.body || 'You have a new notification',
        icon: data.icon || '/logo.png',
        badge: '/logo.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: data.id || 1,
            url: data.url || '/'
        },
        actions: [
            {
                action: 'open',
                title: 'View',
                icon: '/logo.png'
            },
            {
                action: 'close',
                title: 'Dismiss',
                icon: '/logo.png'
            }
        ],
        requireInteraction: false,
        tag: data.tag || 'nfr-notification'
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    console.log('Notification click received:', event);

    event.notification.close();

    if (event.action === 'close') {
        return;
    }

    // Handle the click - open the app
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // If a window is already open, focus it
                for (let i = 0; i < clientList.length; i++) {
                    const client = clientList[i];
                    if (client.url === '/' && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Otherwise, open a new window
                if (clients.openWindow) {
                    const url = event.notification.data?.url || '/';
                    return clients.openWindow(url);
                }
            })
    );
});

// Background sync event (optional - for offline functionality)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-notifications') {
        event.waitUntil(
            // Sync logic here
            Promise.resolve()
        );
    }
});
