/* Hoja para imprimir: arma una hoja de ejercicios de un tema (y la hoja de respuestas en otra página).
   Hoja.mostrar({ titulo, materia, items: [{ q: Node|string, a: string, lines, big }] })
   Hoja.desdePreguntas(preguntas) -> items (convierte las preguntas de Inglés/Español: opciones, escribir, ordenar…) */
(function () {
  if (typeof document === 'undefined') return;
  const el = (tag, cls, ...kids) => { const e = document.createElement(tag); if (cls) e.className = cls; kids.flat().forEach(k => k != null && k !== false && e.append(k)); return e; };
  const CSS = `
.hj-print{position:fixed;inset:0;z-index:60;background:#e2e8f0;overflow:auto;-webkit-overflow-scrolling:touch}
.hj-bar{position:sticky;top:0;display:flex;gap:12px;justify-content:center;padding:12px;background:#1e293b;z-index:2}
.hj-bar button{min-height:56px;padding:0 22px;border:none;border-radius:18px;font:bold 20px -apple-system,system-ui,sans-serif}
.hj-bar .p{background:#22c55e;color:#fff}.hj-bar .x{background:#fff;color:#1e293b}.hj-bar .o{background:#fde68a;color:#1e293b}
.hj-page{background:#fff;color:#111;max-width:760px;margin:16px auto;padding:36px 44px;box-shadow:0 4px 16px rgba(0,0,0,.15);font:17px/1.45 -apple-system,system-ui,"Segoe UI",sans-serif}
.hj-head{display:flex;justify-content:space-between;gap:20px;font-size:16px;border-bottom:2px solid #111;padding-bottom:8px;margin-bottom:10px}
.hj-title{font-size:24px;font-weight:bold;margin:6px 0 2px}.hj-sub{font-size:15px;color:#444;margin-bottom:12px}
.hj-list{margin:0;padding-left:0;list-style:none;counter-reset:hj}
.hj-list>li{counter-increment:hj;margin:0 0 16px;padding-left:34px;position:relative;break-inside:avoid;page-break-inside:avoid}
.hj-list>li::before{content:counter(hj) ".";position:absolute;left:0;font-weight:bold}
.hj-opts{display:flex;flex-wrap:wrap;gap:6px 22px;margin-top:4px}.hj-opts span::before{content:"◯ ";color:#555}
.hj-line{border-bottom:1.5px solid #555;height:30px}
.hj-col{display:inline-block;font:bold 30px/1.2 ui-monospace,Menlo,monospace;text-align:right;margin:4px 0 0}
.hj-col .ln{border-top:3px solid #111;height:44px;margin-top:3px}
.hj-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px 20px}.hj-grid>li{margin-bottom:22px}
.hj-show{font-style:italic;margin-top:2px}.hj-visual svg{max-width:150px;height:auto}
.hj-passage{border:1.5px solid #999;border-radius:10px;padding:10px 14px;margin:0 0 14px;white-space:pre-line}
.hj-key{break-before:page;page-break-before:always}
.hj-key li{margin-bottom:6px}
@media print{
  @page{margin:14mm}
  html,body{background:#fff!important}
  body>*:not(.hj-print){display:none!important}
  .hj-print{position:static;background:#fff;overflow:visible}
  .hj-bar{display:none}
  .hj-page{box-shadow:none;margin:0;padding:0;max-width:none}
}`;
  let cssDone = false;
  const css = () => { if (cssDone) return; cssDone = true; const s = document.createElement('style'); s.textContent = CSS; document.head.append(s); };
  const lines = n => Array.from({ length: n || 1 }, () => el('div', 'hj-line'));
  function col(a, b, op) {
    const w = Math.max(String(a).length, String(b).length) + 1;
    const pad = s => s.padStart(w, '\u2007');
    return el('div', 'hj-col', el('div', null, pad(String(a))), el('div', null, (op === '+' ? '+' : '−') + pad(String(b)).slice(1)), el('div', 'ln'));
  }
  function mostrar({ titulo, materia, items, grid, passage, rehacer }) {
    css();
    const old = document.querySelector('.hj-print'); if (old) old.remove();
    const wrap = el('div', 'hj-print');
    const close = () => { wrap.remove(); document.documentElement.style.overflow = ''; };
    const bar = el('div', 'hj-bar');
    const bp = el('button', 'p', '🖨️ Imprimir'); bp.type = 'button'; bp.onclick = () => window.print();
    bar.append(bp);
    if (rehacer) { const bo = el('button', 'o', '🔄 Otros ejercicios'); bo.type = 'button'; bo.onclick = rehacer; bar.append(bo); }
    const bx = el('button', 'x', '✖ Cerrar'); bx.type = 'button'; bx.onclick = close; bar.append(bx);
    const head = () => el('div', 'hj-head', el('span', null, 'Nombre: ____________________________'), el('span', null, 'Fecha: ______________'));
    const hoja = el('div', 'hj-page', head(), el('div', 'hj-title', titulo), el('div', 'hj-sub', (materia ? materia + ' · ' : '') + '2° de primaria'),
      passage ? el('div', 'hj-passage', passage) : null,
      el('ol', 'hj-list' + (grid ? ' hj-grid' : ''), items.map(it => el('li', null, it.q, it.lines === 0 ? null : it.col ? null : lines(it.lines)))));
    const key = el('div', 'hj-page hj-key', el('div', 'hj-title', '✅ Respuestas · ' + titulo), el('div', 'hj-sub', 'Hoja para papá o mamá'),
      el('ol', 'hj-list', items.map(it => el('li', null, it.a))));
    wrap.append(bar, hoja, key);
    document.body.append(wrap);
    document.documentElement.style.overflow = 'hidden';
    return wrap;
  }
  const label = o => [o.emoji, o.label].filter(Boolean).join(' ') || String(o.value);
  // Preguntas de Inglés/Español -> renglones de la hoja
  function desdePreguntas(qs, max) {
    const out = [], seen = new Set();
    let passage = null;
    for (const q of qs) {
      if (out.length >= (max || 12)) break;
      if (q.type === 'say') continue; // se practica en voz alta
      const ctx = [q.word ? (q.big && !q.bigIsWord ? q.big + ' ' : '') + q.word : q.big || null].filter(Boolean).join(' ');
      const k = q.prompt + '|' + ctx + '|' + (q.show || '') + '|' + JSON.stringify(q.answer);
      if (seen.has(k)) continue; seen.add(k);
      if (q.passage && !passage) passage = q.passage.title + '\n\n' + q.passage.text;
      const parts = [el('div', null, el('b', null, q.prompt), ctx ? ' ' + ctx : '')];
      if (q.sub && !/^Es "/.test(q.sub)) parts.push(el('div', 'hj-show', q.sub));
      if (q.show) parts.push(el('div', 'hj-show', q.show));
      if (q.wrongSentence) parts.push(el('div', 'hj-show', '❌ ' + q.wrongSentence));
      if (q.visual) { const v = el('div', 'hj-visual'); v.innerHTML = q.visual; parts.push(v); }
      let a = '', ln = 1;
      if (q.type === 'mc') { parts.push(el('div', 'hj-opts', q.options.map(o => el('span', null, label(o))))); const co = q.options.find(o => o.value === q.answer); a = co ? label(co) : String(q.answer); ln = 0; }
      else if (q.type === 'type') { a = Array.isArray(q.answer) ? String(q.answer[0]) : String(q.answer); }
      else if (q.type === 'order') { parts.push(el('div', 'hj-opts', q.items.slice().sort(() => Math.random() - 0.5).map(t => el('span', null, t)))); a = q.answer.join(q.sep != null ? q.sep : ', ') + (q.suffix || ''); }
      else if (q.type === 'tap') { parts.push(el('div', 'hj-show', 'Subraya: ' + q.tokens.map(t => t.t).join(' '))); a = q.tokens.filter(t => t.ok).map(t => t.t.replace(/[.,;:¡!¿?"]/g, '')).join(', '); ln = 0; }
      else if (q.type === 'think') { a = 'Ejemplo: ' + q.model; ln = 3; }
      else if (q.type === 'column') { parts.push(col(q.a, q.b, q.op)); a = String(q.answer[0]); ln = 0; }
      else continue;
      out.push({ q: parts, a: (ctx ? ctx + ' ➜ ' : '') + a, lines: ln });
    }
    return { items: out, passage };
  }
  function boton(fn, label) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'big-btn hj-btn'; b.textContent = label || '🖨️ Hoja para imprimir';
    b.style.background = '#64748b'; b.style.color = '#fff';
    b.addEventListener('click', fn);
    return b;
  }
  window.Hoja = { mostrar, desdePreguntas, boton, col };
})();
