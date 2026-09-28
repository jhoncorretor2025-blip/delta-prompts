// DELTA SITE VERSION: V0.5
const CACHE_NAME = 'delta-prompts-shell-v11';
const SHELL_URLS = [
  '/delta-prompts/index.html',
  '/delta-prompts/style.css',
  '/delta-prompts/css/melhoriaspaginas.css',
  '/delta-prompts/icon-192.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS)).catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((chaves) =>
      Promise.all(chaves.filter((c) => c !== CACHE_NAME).map((c) => caches.delete(c)))
    ).then(() => self.clients.claim())
  );
});

// Estratégia: tenta a rede primeiro (site atualiza sempre), cai pro cache só se estiver offline.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.pathname === '/delta-prompts/menu-loader.js') {
    event.respondWith(
      fetch('/delta-prompts/menu-loader.js?v=20260928-v05', { cache: 'no-store' })
        .catch(() => fetch(event.request))
    );
    return;
  }
  event.respondWith(
    fetch(event.request)
      .then((resposta) => {
        const copia = resposta.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copia)).catch(() => {});
        return resposta;
      })
      .catch(() => caches.match(event.request))
  );
});
