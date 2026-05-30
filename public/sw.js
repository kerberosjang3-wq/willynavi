const CACHE_NAME = 'willynavi-v3';
const STATIC_ASSETS = [
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // 이전 버전 캐시 전부 삭제
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

  // API 요청 — 항상 네트워크
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request));
    return;
  }

  // Next.js JS/CSS 청크 — 항상 네트워크 (배포마다 해시 바뀜)
  if (url.pathname.startsWith('/_next/')) {
    event.respondWith(fetch(request));
    return;
  }

  // HLS 스트림 — 캐시 제외
  if (url.pathname.endsWith('.m3u8') || url.pathname.endsWith('.ts')) {
    event.respondWith(fetch(request));
    return;
  }

  // 메인 페이지 — 항상 네트워크 우선 (stale-while-revalidate)
  if (url.pathname === '/') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, clone));
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // 나머지 정적 자산 (아이콘, manifest 등)
  event.respondWith(
    caches.match(request).then((cached) => cached ?? fetch(request))
  );
});
