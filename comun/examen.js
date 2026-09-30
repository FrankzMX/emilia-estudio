/* Examen "de verdad" (como en el salón): sin pistas, sin 🔊 (salvo lo que es de escuchar),
   no dice si está bien en cada pregunta, reloj opcional y la calificación sale al final.
   Uso: Examen.elegir({ onStart: ({ real, mins }) => ... }) -> nodo con las opciones.
        Examen.reloj(mins, onEnd) -> { el, stop }   ·   Examen.columna(a, b, op) -> nodo con la cuenta
        Examen.calif(score, total) -> "8.5"          ·   Examen.resumen(review) -> nodo con todas las respuestas */
(function () {
  const KEY = 'mi-examen-modo-v1';
  const hasDOM = typeof document !== 'undefined';
  const el = (tag, cls, ...kids) => { const e = document.createElement(tag); if (cls) e.className = cls; kids.flat().forEach(k => k != null && e.append(k)); return e; };
  const CSS = `
.xm-choose{display:grid;gap:16px;max-width:680px;margin:0 auto}
.xm-opt{border:4px solid transparent;border-radius:24px;padding:18px 20px;text-align:left;background:#fff;box-shadow:0 6px 0 rgba(0,0,0,.1);font:inherit;color:#1e293b}
.xm-opt .t{font-size:28px;font-weight:bold}.xm-opt .s{font-size:19px;color:#475569;margin-top:4px}
.xm-opt.real{background:#eef2ff;border-color:#818cf8}
.xm-time{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:6px}
.xm-time button{min-height:56px;padding:0 18px;border-radius:18px;border:3px solid #c7d2fe;background:#fff;font-size:20px;font-weight:bold;color:#3730a3}
.xm-time button.on{background:#4f46e5;border-color:#4f46e5;color:#fff}
.xm-lbl{font-size:19px;text-align:center;color:#3730a3;font-weight:bold;margin-top:4px}
.xm-clock{font-weight:bold;font-variant-numeric:tabular-nums}.xm-clock.low{color:#dc2626}
.xm-col{display:inline-grid;font:bold 56px/1.15 ui-monospace,Menlo,monospace;text-align:right;background:#fff;border-radius:20px;padding:10px 24px;box-shadow:0 4px 0 rgba(0,0,0,.08);margin:6px auto}
.xm-col .ln{border-top:5px solid #1e293b;height:4px;margin-top:4px}
.xm-colwrap{text-align:center}
.xm-sum{text-align:left;margin-top:10px}.xm-sum li{margin:6px 0;font-size:19px;list-style:none}
.xm-sum .g{color:#b91c1c}.xm-sum .c{color:#166534;font-weight:bold}
.xm-grade{font-size:30px;font-weight:bold;color:#3730a3;margin:6px 0}
.xm-nospeak .speak,.xm-nospeak .passage-head .row{display:none!important}`;
  let cssDone = false;
  const css = () => { if (cssDone || !hasDOM) return; cssDone = true; const s = document.createElement('style'); s.textContent = CSS; document.head.append(s); };
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const save = o => { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} };

  function elegir({ onStart }) {
    css();
    const pref = load();
    let mins = pref.mins || 0;
    const times = el('div', 'xm-time');
    [[0, 'Sin reloj'], [10, '⏱️ 10 min'], [15, '⏱️ 15 min'], [20, '⏱️ 20 min']].forEach(([m, label]) => {
      const b = el('button', m === mins ? 'on' : null, label); b.type = 'button';
      b.addEventListener('click', () => { mins = m; [...times.children].forEach(x => x.classList.toggle('on', x === b)); });
      times.append(b);
    });
    const go = real => { save({ real, mins }); onStart({ real, mins: real ? mins : 0 }); };
    const normal = el('button', 'xm-opt', el('div', 't', '📝 Examen con ayuda'), el('div', 's', 'Te dice si está bien en cada pregunta y te enseña la respuesta.'));
    normal.type = 'button'; normal.addEventListener('click', () => go(false));
    const real = el('button', 'xm-opt real', el('div', 't', '🎓 Examen de verdad'), el('div', 's', 'Como en el salón: sin pistas ni 🔊, no te dice si está bien, y la calificación sale al final.'));
    real.type = 'button'; real.addEventListener('click', () => go(true));
    return el('div', 'xm-choose', normal, real, el('div', 'xm-lbl', 'Reloj para el examen de verdad:'), times);
  }
  function reloj(mins, onEnd) {
    css();
    const span = el('span', 'xm-clock');
    if (!mins) return { el: null, stop() {}, left: () => Infinity };
    const end = Date.now() + mins * 60000;
    let t = null;
    const tick = () => {
      const s = Math.max(0, Math.round((end - Date.now()) / 1000));
      span.textContent = '⏱️ ' + Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
      span.classList.toggle('low', s <= 60);
      if (s <= 0) { clearInterval(t); t = null; onEnd(); }
    };
    tick(); t = setInterval(tick, 500);
    return { el: span, stop() { if (t) clearInterval(t); t = null; }, left: () => end - Date.now() };
  }
  function columna(a, b, op) {
    css();
    const w = Math.max(String(a).length, String(b).length) + 1;
    const pad = s => s.padStart(w, '\u2007');
    return el('div', 'xm-colwrap', el('div', 'xm-col', el('div', null, pad(String(a))), el('div', null, (op === '+' ? '+' : '−') + pad(String(b)).slice(1)), el('div', 'ln')));
  }
  const calif = (score, total) => { const g = Math.round(score / Math.max(1, total) * 100) / 10; return (g % 1 ? g.toFixed(1) : String(g)); };
  function resumen(review) {
    css();
    return el('ul', 'xm-sum', review.map((r, i) => el('li', null, (r.ok ? '✅ ' : '❌ ') + (i + 1) + '. ' + r.prompt + ' ',
      r.ok ? el('span', 'c', '➜ ' + r.answer) : [el('span', 'g', '➜ Pusiste: ' + (r.given || '(sin contestar)')), ' · ', el('span', 'c', 'Correcta: ' + r.answer)])));
  }
  const setReal = on => { if (hasDOM) { css(); document.body.classList.toggle('xm-real', !!on); } };
  const api = { elegir, reloj, columna, calif, resumen, setReal };
  if (typeof window !== 'undefined') window.Examen = api;
  if (typeof module !== 'undefined') module.exports = api;
})();
