// TEMPORARY: Force unregister broken Service Workers
// This runs on every page load until SW cache is cleared
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
        for (let registration of registrations) {
            console.log('[SW Cleanup] Unregistering broken service worker:', registration.scope);
            registration.unregister();
        }
    });

    // Clear all caches
    if ('caches' in window) {
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.map(function (cacheName) {
                    console.log('[Cache Cleanup] Deleting cache:', cacheName);
                    return caches.delete(cacheName);
                })
            );
        });
    }
}
