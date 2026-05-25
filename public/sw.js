const CACHE_NAME = 'willynavi-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API 요청은 캐시 없이 네트워크 우선
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request));
    return;
  }

  // HLS 스트림은 캐시 제외
  if (url.pathname.endsWith('.m3u8') || url.pathname.endsWith('.ts')) {
    event.respondWith(fetch(request));
    return;
  }

  // 정적 자산 캐시 우선
  event.respondWith(
    caches.match(request).then((cached) => cached ?? fetch(request))
  );
});
