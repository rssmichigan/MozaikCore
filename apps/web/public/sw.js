self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
// optional: basic offline fallback later
self.addEventListener('fetch', () => {}); // required so Chrome counts it as a PWA
