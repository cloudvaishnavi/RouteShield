const CACHE_NAME = 'routeshield-offline-v1';
const TILE_CACHE = 'routeshield-tiles-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json' // if it exists
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(err => console.log('Static asset caching failed', err));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== TILE_CACHE) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Handle tile requests
  if (url.hostname.includes('tile.openstreetmap.org') || url.hostname.includes('arcgisonline.com') || url.pathname.endsWith('.png')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).catch(() => {
          return new Response(null, { status: 404, statusText: 'Offline missing tile' });
        });
      })
    );
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch((err) => {
        // Return a custom offline response or just let it fail
        return new Response(JSON.stringify({ error: 'Offline', isOffline: true }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Default network-first for other requests (React app)
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
