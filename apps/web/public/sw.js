self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
// Minimal fetch handler so Chrome counts it as a PWA service worker
self.addEventListener('fetch', () => {});
