/* Progreso en este dispositivo: días practicados (racha ⭐), tiempo de práctica, temas terminados,
   y el botón A+ (letra grande, se guarda en el iPad).
   Progreso.hecho({ materia, tema, id, pag, score, total, exam })  <- lo llaman las páginas al terminar
   Progreso.datos() · Progreso.racha() · Progreso.calendario(mesOffset) -> nodo */
(function () {
  const KEY = 'mi-examen-progreso-v1', BIG = 'mi-examen-letra-v1';
  const hasDOM = typeof document !== 'undefined';
  const p2 = n => (n < 10 ? '0' : '') + n;
  const dkey = d => d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate());
  const now = () => { try { const m = /[?&]ahora=([\d\-T:]+)/.exec(location.search); if (m) return new Date(m[1]); } catch (e) {} return new Date(); };
  function datos() { try { const d = JSON.parse(localStorage.getItem(KEY)); if (d && d.days) { d.sets = d.sets || []; return d; } } catch (e) {} return { days: {}, sets: [] }; }
  function guardar(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }
  function dia(d, k) { return d.days[k] || (d.days[k] = { n: 0, secs: 0 }); }
  function hecho(o) {
    const d = datos(), k = dkey(now());
    dia(d, k).n++;
    d.sets.push({ d: k, m: o.materia || '', t: o.tema || '', id: o.id || '', pag: o.pag || '', s: o.score | 0, tot: o.total | 0, x: o.exam ? 1 : 0 });
    if (d.sets.length > 800) d.sets.splice(0, d.sets.length - 800);
    guardar(d);
  }
  function racha() {
    const d = datos(); let n = 0; const t = now();
    const c = new Date(t.getFullYear(), t.getMonth(), t.getDate());
    if (!d.days[dkey(c)]) c.setDate(c.getDate() - 1); // si hoy todavía no practica, cuenta hasta ayer
    while (d.days[dkey(c)] && d.days[dkey(c)].n > 0) { n++; c.setDate(c.getDate() - 1); }
    return n;
  }
  // Tiempo de práctica: cada 10 s, si la pantalla está visible, hay una práctica abierta y tocaron algo en el último minuto y medio
  let lastTouch = Date.now();
  if (hasDOM) {
    ['pointerdown', 'keydown', 'touchstart'].forEach(ev => document.addEventListener(ev, () => { lastTouch = Date.now(); }, { passive: true, capture: true }));
    setInterval(() => {
      if (document.visibilityState !== 'visible' || Date.now() - lastTouch > 90000) return;
      if (!document.querySelector('.qmeta, .qz-card, .col-wrap, .rj-play')) return;
      const d = datos(); dia(d, dkey(now())).secs += 10; guardar(d);
    }, 10000);
  }
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const el = (tag, cls, ...kids) => { const e = document.createElement(tag); if (cls) e.className = cls; kids.flat().forEach(k => k != null && e.append(k)); return e; };
  const CSS = `
.pg-cal{background:#fff;border-radius:22px;padding:14px 16px;box-shadow:0 4px 12px rgba(0,0,0,.06);width:min(640px,100%);box-sizing:border-box}
.pg-top{display:flex;align-items:center;justify-content:space-between;gap:8px}
.pg-top b{font-size:1.3em}.pg-top button{border:none;background:#f1f5f9;border-radius:12px;min-width:44px;min-height:44px;font-size:1.1em}
.pg-streak{text-align:center;font-size:1.35em;font-weight:800;margin:4px 0 8px;color:#ea580c}
.pg-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;text-align:center}
.pg-grid .h{font-size:.8em;color:#64748b;font-weight:700}
.pg-grid .c{min-height:44px;border-radius:12px;background:#f8fafc;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:.85em;color:#475569}
.pg-grid .c.on{background:#fef9c3;color:#854d0e;font-weight:700}.pg-grid .c.on::after{content:"⭐";font-size:1.1em;line-height:1}
.pg-grid .c.today{outline:3px solid #0ea5e9}
.pg-grid .c.empty{background:none}
.pg-note{font-size:.85em;color:#64748b;text-align:center;margin-top:6px}
.pg-aplus{position:fixed;top:10px;right:10px;z-index:40;min-width:54px;min-height:48px;border:none;border-radius:16px;background:#fff;box-shadow:0 3px 8px rgba(0,0,0,.15);font:800 20px -apple-system,system-ui,sans-serif;color:#1e293b}
.pg-aplus.on{background:#1e293b;color:#fff}
html.big-text body.landing{font-size:120%}
html.big-text .explain,html.big-text .passage,html.big-text .story,html.big-text .prompt,html.big-text .sub,html.big-text .showsentence,
html.big-text .opts,html.big-text .ask,html.big-text .model,html.big-text .think,html.big-text .feedback,html.big-text .review,
html.big-text .qz-q,html.big-text .intro,html.big-text .err,html.big-text .taps,html.big-text .hello,html.big-text .card>p{zoom:1.2}
@media print{.pg-aplus{display:none}}`;
  let cssDone = false;
  const css = () => { if (cssDone || !hasDOM) return; cssDone = true; const s = document.createElement('style'); s.textContent = CSS; document.head.append(s); };
  function calendario(off) {
    css();
    off = off || 0;
    const d = datos(), t = now();
    const first = new Date(t.getFullYear(), t.getMonth() + off, 1);
    const box = el('div', 'pg-cal');
    const prev = el('button', null, '◀'), next = el('button', null, '▶');
    prev.type = next.type = 'button'; prev.setAttribute('aria-label', 'Mes anterior'); next.setAttribute('aria-label', 'Mes siguiente');
    prev.onclick = () => box.replaceWith(calendario(off - 1)); next.onclick = () => box.replaceWith(calendario(off + 1));
    if (off >= 0) next.style.visibility = 'hidden';
    const r = racha();
    const grid = el('div', 'pg-grid', ['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(x => el('div', 'h', x)));
    const pad = (first.getDay() + 6) % 7;
    for (let i = 0; i < pad; i++) grid.append(el('div', 'c empty'));
    const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    let count = 0;
    for (let n = 1; n <= days; n++) {
      const k = dkey(new Date(first.getFullYear(), first.getMonth(), n)), on = d.days[k] && d.days[k].n > 0;
      if (on) count++;
      grid.append(el('div', 'c' + (on ? ' on' : '') + (k === dkey(t) ? ' today' : ''), String(n)));
    }
    box.append(el('div', 'pg-top', prev, el('b', null, '🗓️ ' + MESES[first.getMonth()] + ' ' + first.getFullYear()), next),
      el('div', 'pg-streak', r ? `🔥 ${r} ${r === 1 ? 'día' : 'días'} seguidos practicando` : '⭐ Practica hoy para empezar tu racha'),
      grid, el('div', 'pg-note', `⭐ = día que terminó al menos una práctica · ${count} ${count === 1 ? 'día' : 'días'} este mes`));
    return box;
  }
  // Botón A+ (letra grande)
  function aplus() {
    css();
    const on = () => { try { return localStorage.getItem(BIG) === '1'; } catch (e) { return false; } };
    const apply = () => { document.documentElement.classList.toggle('big-text', on()); b.classList.toggle('on', on()); b.setAttribute('aria-pressed', on() ? 'true' : 'false'); };
    const b = el('button', 'pg-aplus', 'A+'); b.type = 'button'; b.setAttribute('aria-label', 'Letra grande');
    b.onclick = () => { try { localStorage.setItem(BIG, on() ? '0' : '1'); } catch (e) {} apply(); };
    document.body.append(b); apply();
  }
  if (hasDOM) { if (document.body) aplus(); else document.addEventListener('DOMContentLoaded', aplus); }
  const api = { hecho, datos, racha, calendario, dkey };
  if (typeof window !== 'undefined') window.Progreso = api;
})();
