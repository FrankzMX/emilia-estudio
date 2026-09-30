/* 💾 Respaldo del progreso: guarda todo lo de este dispositivo (estrellas, errores, récords, racha,
   tiempo, ajustes) en un código para copiar o un QR, y lo carga en otro iPad.
   El código: "R1" + (z = comprimido | p = sin comprimir) + base64url. El PIN de papá NO se copia. */
(function () {
  const PREFIXES = ['mi-examen-', 'voz-ajustes-'];
  const SKIP = ['mi-examen-pin-v1'];
  const SITE = (document.currentScript && document.currentScript.src ? new URL('../', document.currentScript.src) : new URL('./', location.href)).href;
  const ours = k => PREFIXES.some(p => k.indexOf(p) === 0) && SKIP.indexOf(k) < 0;
  const b64u = bytes => { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
  const unb64u = str => { const s = atob(str.replace(/-/g, '+').replace(/_/g, '/')); const b = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i); return b; };
  const canZip = () => typeof CompressionStream !== 'undefined' && typeof DecompressionStream !== 'undefined';
  async function pipe(bytes, stream) { const r = new Response(new Blob([bytes]).stream().pipeThrough(stream)); return new Uint8Array(await r.arrayBuffer()); }
  function recolectar(opts) {
    const k = {};
    for (let i = 0; i < localStorage.length; i++) { const key = localStorage.key(i); if (ours(key) && !(opts && opts.sinErrores && key === 'mi-examen-errores-v1')) k[key] = localStorage.getItem(key); }
    return k;
  }
  async function exportar(opts) {
    const data = JSON.stringify({ v: 1, t: Date.now(), k: recolectar(opts) });
    const raw = new TextEncoder().encode(data);
    if (canZip()) { try { return 'R1z' + b64u(await pipe(raw, new CompressionStream('deflate-raw'))); } catch (e) {} }
    return 'R1p' + b64u(raw);
  }
  async function leer(code) {
    code = String(code || '').trim().replace(/^.*#/, '').replace(/\s+/g, '');
    if (!/^R1[zp][A-Za-z0-9_-]+$/.test(code)) throw new Error('Ese código no es un respaldo válido.');
    let bytes = unb64u(code.slice(3));
    if (code[2] === 'z') { if (!canZip()) throw new Error('Este navegador no puede abrir respaldos comprimidos. Actualiza el iPad.'); bytes = await pipe(bytes, new DecompressionStream('deflate-raw')); }
    const obj = JSON.parse(new TextDecoder().decode(bytes));
    if (!obj || obj.v !== 1 || typeof obj.k !== 'object') throw new Error('Ese código no es un respaldo válido.');
    Object.keys(obj.k).forEach(key => { if (!ours(key) || typeof obj.k[key] !== 'string') delete obj.k[key]; });
    return obj;
  }
  function resumen(obj) {
    const k = obj.k, out = [];
    const cnt = (key, f) => { try { return f(JSON.parse(k[key])); } catch (e) { return 0; } };
    const stars = ['mi-examen-mate-v1', 'mi-examen-ingles-v1', 'mi-examen-espanol-v1'].reduce((s, key) => s + (k[key] ? cnt(key, o => Object.keys(o).length) : 0), 0);
    out.push(`⭐ ${stars} temas/exámenes con estrellas`);
    if (k['mi-examen-errores-v1']) out.push(`📋 ${cnt('mi-examen-errores-v1', a => a.length)} errores guardados`);
    if (k['mi-examen-progreso-v1']) out.push(`🗓️ ${cnt('mi-examen-progreso-v1', o => Object.keys(o.days || {}).length)} días de práctica`);
    if (k['mi-examen-mate-reloj-v1']) out.push(`⏱️ Récord contra reloj: ${cnt('mi-examen-mate-reloj-v1', o => o.best)}`);
    out.push('Guardado: ' + new Date(obj.t).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' }));
    return out;
  }
  // Reemplaza en este dispositivo lo que trae el respaldo (lo demás se queda igual)
  function aplicar(obj) { Object.keys(obj.k).forEach(key => { try { localStorage.setItem(key, obj.k[key]); } catch (e) {} }); return Object.keys(obj.k).length; }
  const link = code => SITE + 'respaldo/#' + code;
  function cargarQR() {
    return new Promise((res, rej) => {
      if (window.qrcode) return res(window.qrcode);
      const me = document.querySelector('script[src$="comun/respaldo.js"]');
      const s = document.createElement('script'); s.src = me ? me.src.replace(/respaldo\.js$/, 'qrcode.js') : 'comun/qrcode.js';
      s.onload = () => res(window.qrcode); s.onerror = rej; document.head.append(s);
    });
  }
  async function qrSvg(text) {
    const q = await cargarQR();
    const c = q(0, 'L'); c.addData(text); c.make();
    return c.createSvgTag({ cellSize: 3, margin: 4, scalable: true });
  }
  window.Respaldo = { exportar, leer, resumen, aplicar, link, qrSvg, recolectar };
})();
