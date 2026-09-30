/* Service worker: la página abre aunque no haya internet (o esté lento).
   Generado por tools/build_sw.py — VERSION cambia solo cuando cambia algún archivo. */
const VERSION = '4d5978f1cbc6';
const CACHE = 'estudio-' + VERSION;
const FILES = [
  "./",
  "./apple-touch-icon.png",
  "./icon.svg",
  "./comun/actualiza.js",
  "./comun/columna.js",
  "./comun/errores.js",
  "./comun/escritura.js",
  "./comun/temas.js",
  "./comun/voz.js",
  "./espanol/",
  "./ingles/icono-180.png",
  "./ingles/",
  "./matematicas/",
  "./repasar/"
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => Promise.all(FILES.map(u => fetch(new Request(u + '?v=' + VERSION, { cache: 'reload' })).then(r => { if (r.ok) return c.put(u, r); }).catch(() => {}))))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('estudio-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// Todo sale de la copia de ESTA versión (así nunca se mezclan archivos viejos y nuevos).
// Cuando se publica algo nuevo, cambia VERSION: el navegador baja la versión nueva completa y la página se actualiza.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  const nav = req.mode === 'navigate';
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(req, { ignoreSearch: nav || !url.search }) ||
      (nav ? await c.match(url.pathname.replace(/index\.html$/, ''), { ignoreSearch: true }) : null);
    if (hit) return hit;
    return fetch(req).catch(async () => (nav && await c.match('./')) || Response.error());
  }));
});
