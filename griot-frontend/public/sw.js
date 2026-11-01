const CACHE_NAME = 'griot-shell-v3';
const APP_SHELL = [
  '/',
  '/index.html',
  '/griot-icon.svg',
  '/griot-icon-192.png',
  '/griot-icon-512.png',
  '/manifest.webmanifest',
];

self.addEventListener('message', (event) => {
  if (event.data?.type === 'GRIOT_OFFLINE_READY') event.ports[0]?.postMessage({ ready: true, version: CACHE_NAME });
});

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const response = await fetch('/', { cache: 'reload' });
    if (!response.ok) throw new Error('App shell unavailable');
    const manifest = await fetch('/offline-assets.json', { cache: 'reload' });
    if (!manifest.ok) throw new Error('Offline manifest unavailable');
    const assets = await manifest.json();
    await cache.addAll([...APP_SHELL.filter((path) => path !== '/' && path !== '/index.html'), ...assets, '/data/world.geojson']);
    await cache.put('/index.html', response.clone());
    await cache.put('/', response);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key.startsWith('griot-shell-') && key !== CACHE_NAME)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', copy));
          }
          return response;
        })
        .catch(async () => (await caches.match('/index.html')) || Response.error()),
    );
    return;
  }

  if (!/\.(?:js|css|svg|png|jpe?g|webmanifest|woff2?)$/i.test(url.pathname) && !['/data/cities.json', '/data/world.geojson'].includes(url.pathname)) return;
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    }),
  );
});
