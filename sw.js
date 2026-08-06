const CACHE_NAME = 'delta-prompts-shell-v2';
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
