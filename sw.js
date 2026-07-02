const CACHE = 'atre-v2';

self.addEventListener('install', e => {
  // Cacheia apenas o app shell (mesmo origin)
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['/'])));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Ignora tudo que não é do mesmo origin (CDN, Google Sheets, etc.)
  if (!e.request.url.startsWith(self.location.origin)) return;

  // App shell: network-first, cache como fallback offline
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
