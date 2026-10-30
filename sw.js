/* =========================================================
   SERVICE WORKER — o "ajudante" que deixa o jogo funcionar sem internet.

   Na primeira vez que alguém abre o jogo, ele guarda uma cópia dos
   arquivos no celular. Depois, sempre que o jogo pede um arquivo:
     1. entrega a cópia guardada na hora (rápido, e funciona offline)
     2. e, se tiver internet, busca a versão nova pra próxima vez.

   Quando mudar algo grande no jogo, aumente o número da VERSAO
   pra jogar fora as cópias velhas.
   ========================================================= */
const VERSAO = 'tank-wars-v2';
const ARQUIVOS = [
  './',
  './index.html',
  './manifest.json',
  './icone-192.png',
  './icone-512.png',
  './icone-mascara-512.png',
  './apple-touch-icon.png'
];

// instalando: guarda os arquivos principais
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(ARQUIVOS)));
  self.skipWaiting();
});

// ativando: apaga as caixas de versões antigas
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(nomes => Promise.all(
      nomes.filter(n => n !== VERSAO).map(n => caches.delete(n))
    ))
  );
  self.clients.claim();
});

// cada pedido de arquivo passa por aqui
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(VERSAO).then(async caixa => {
      const guardado = await caixa.match(e.request, { ignoreSearch: true });
      const daInternet = fetch(e.request)
        .then(resp => {
          if (resp && (resp.ok || resp.type === 'opaque')) caixa.put(e.request, resp.clone());
          return resp;
        })
        .catch(() => guardado);   // sem internet: fica com o guardado
      return guardado || daInternet;
    })
  );
});
