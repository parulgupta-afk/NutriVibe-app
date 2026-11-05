/* NutriVibe offline PWA — caches the app shell and static assets ONLY.
 * API responses contain private health data (allergies, medications, history)
 * and must never be written to Cache Storage. */
const CACHE = 'nutrivibe-v4';
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

  // API: network only, never cached. Offline -> explicit JSON 503 (never undefined).
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/v1')) {
    e.respondWith(
      fetch(e.request).catch(
        () =>
          new Response(
            JSON.stringify({ success: false, message: 'You appear to be offline.' }),
            { status: 503, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }
          )
      )
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
        fetch(e.request).catch(
          async () => (await caches.match('/index.html')) || new Response('', { status: 504 })
        )
      );
    })
  );
});
