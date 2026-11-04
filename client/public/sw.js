/* NutriVibe offline PWA — cache shell + recent API GETs (Phase 7 Option D) */
const CACHE = 'nutrivibe-v3';
const PRECACHE = ['/', '/index.html', '/manifest.json', '/favicon.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (!e.request.url.startsWith('http')) return;

  const url = new URL(e.request.url);

  // Network-first for API; cache-first for static
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/v1')) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          if (e.request.method === 'GET' && res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Navigation requests: try network, fall back to cached /index.html (SPA routing)
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(async () => {
        return (await caches.match('/index.html')) || (await caches.match('/'));
      })
    );
    return;
  }

  // Static assets: cache-first with network fallback and catch handler
  e.respondWith(
    caches.match(e.request).then((hit) => {
      return (
        hit ||
        fetch(e.request).catch(() => {
          return caches.match('/index.html');
        })
      );
    })
  );
});
