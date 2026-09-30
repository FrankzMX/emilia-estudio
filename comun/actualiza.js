/* Guarda la página en el iPad para que abra aunque no haya internet (service worker en ../sw.js)
   y la actualiza cuando se publica una versión nueva: si está en una pantalla de inicio se recarga sola;
   si está a mitad de una práctica, solo aparece un aviso (nunca se pierde el avance). */
(function () {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator) || location.protocol === 'file:') return;
  var me = document.querySelector('script[src$="comun/actualiza.js"]');
  if (!me) return; // copias sueltas (sin carpeta comun/) no usan service worker
  var base = new URL('../', me.src);
  var hadController = !!navigator.serviceWorker.controller, done = false;
  try { navigator.serviceWorker.register(new URL('sw.js', base).href, { scope: base.href }).catch(function () {}); } catch (e) {}
  navigator.serviceWorker.addEventListener('controllerchange', function () {
    if (!hadController || done) return; // primera vez: ya está todo al día
    done = true;
    var home = location.pathname === base.pathname || location.pathname === base.pathname + 'index.html' || document.querySelector('.hello');
    if (home) { location.reload(); return; }
    var b = document.createElement('button');
    b.id = 'sw-update';
    b.textContent = '✨ Hay una versión nueva · Actualizar';
    b.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);top:10px;z-index:99;border:none;border-radius:18px;padding:12px 20px;font:bold 18px -apple-system,system-ui,sans-serif;background:#1d4ed8;color:#fff;box-shadow:0 4px 12px rgba(0,0,0,.25)';
    b.onclick = function () { if (!document.querySelector('.qmeta') || confirm('¿Actualizar ahora? Se perderá el avance de esta práctica.')) location.reload(); };
    document.body.appendChild(b);
  });
})();
