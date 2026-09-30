/* ============================================================
   COLUMNA · sumas y restas con el algoritmo tradicional
   - De derecha a izquierda: primero unidades, luego decenas, luego centenas.
   - Suma: si la columna da 10 o más, aparece el cuadrito de "llevo" arriba
     de la siguiente columna y hay que escribir el 1 antes de seguir.
   - Resta: si arriba hay menos que abajo, primero se "pide prestado":
     el número de la izquierda se tacha y se escribe uno menos.
   - Teclado numérico propio (no aparece el teclado del iPad).
   Uso: Columna.create({ a, b, op: '+'|'-', speak, onDone })
   ============================================================ */
(function (root) {
'use strict';
const PLACE = ['U', 'D', 'C', 'UM'];
const PLACE_NAME = ['unidades', 'decenas', 'centenas', 'unidades de millar'];
const digit = (n, i) => Math.floor(n / Math.pow(10, i)) % 10;
const len = n => String(n).length;

/* Pasos del algoritmo. Cada paso: { kind: 'res'|'carry'|'borrow', col, expect, say } */
function plan(a, b, op) {
  const r = op === '+' ? a + b : a - b;
  const n = Math.max(len(a), len(b), len(r));
  const steps = [];
  const top = []; for (let i = 0; i < n; i++) top.push(i < len(a) ? digit(a, i) : null);
  const bot = []; for (let i = 0; i < n; i++) bot.push(i < len(b) ? digit(b, i) : null);
  const info = { r, n, top, bot, carry: [], borrow: [], plus10: [], adj: top.slice() };
  if (op === '+') {
    let c = 0;
    for (let i = 0; i < n; i++) {
      if (c) { steps.push({ kind: 'carry', col: i, expect: c }); info.carry[i] = c; }
      const s = (top[i] || 0) + (bot[i] || 0) + c;
      const parts = [top[i], bot[i]].filter(x => x != null);
      if (c) parts.push(c);
      steps.push({ kind: 'res', col: i, expect: s % 10, sum: s, parts, carryIn: c });
      c = s >= 10 ? 1 : 0;
      if (c && i === n - 1) { /* no pasa: n incluye las cifras del resultado */ }
    }
  } else {
    const t = top.slice();
    for (let i = 0; i < n; i++) {
      const bi = bot[i] || 0;
      if ((t[i] || 0) < bi) {
        // Si la columna de al lado es 0, no puede prestar: se pide a la siguiente
        // y el préstamo "baja" en cadena (503 − 128: el 5 se vuelve 4, el 0 se vuelve 10 y luego 9).
        let j = i + 1;
        while (t[j] === 0) j++;
        for (let k = j; k > i; k--) {
          const from = t[k];
          t[k] = from - 1; t[k - 1] = (t[k - 1] || 0) + 10;
          steps.push({ kind: 'borrow', col: k, expect: t[k], from, forCol: k - 1, need: i, chain: j > i + 1 });
          info.borrow[k] = t[k];
          info.plus10[k - 1] = true;
        }
      }
      const d = (t[i] || 0) - bi;
      const leading = i >= len(r) && d === 0;
      steps.push({ kind: 'res', col: i, expect: d, top: t[i], bot: bot[i], leading });
    }
    info.adj = t;
  }
  return { steps, info };
}

/* Texto de la instrucción de cada paso */
function instruction(st, op, info) {
  const P = PLACE_NAME[st.col];
  if (st.kind === 'carry') return `Llevas ${st.expect} a las ${P}. Escríbelo en el cuadrito de arriba ⬆️`;
  if (st.kind === 'borrow' && st.chain && st.from === 10) return `Ahora las ${PLACE_NAME[st.col]} tienen 10. Préstale 1 a las ${PLACE_NAME[st.forCol]}: ¿en cuánto se convierte el 10?`;
  if (st.kind === 'borrow' && st.chain) return `A ${info.top[st.need]} no le puedes quitar ${info.bot[st.need]}, y las ${PLACE_NAME[st.need + 1]} tienen 0: ¡no pueden prestar! Pide 1 a las ${P}: ¿en cuánto se convierte el ${st.from}?`;
  if (st.kind === 'borrow') return `A ${info.top[st.forCol]} no le puedes quitar ${info.bot[st.forCol]}. Pide 1 prestado a las ${P}: ¿en cuánto se convierte el ${st.from}?`;
  if (op === '+' && st.parts.length === 1 && st.carryIn) return `En las ${P} solo está el ${st.carryIn} que llevas: bájalo ⬇️`;
  if (op === '+') return `Suma las ${P}: ${st.parts.join(' + ')}${st.carryIn ? ' (el que llevas)' : ''}`;
  if (st.leading) return `Las ${P}: ${st.top} − ${st.bot || 0} = 0. Escribe 0 o toca ✔ para dejarlo vacío.`;
  return `Resta las ${P}: ${st.top} − ${st.bot == null ? 0 : st.bot}`;
}
function hint(st, op, info) {
  if (st.kind === 'carry') return `La columna anterior dio 10 o más, así que llevas 1. Escribe 1.`;
  if (op === '+' && st.parts.length === 1 && st.carryIn) return `Solo bajas el ${st.carryIn} que llevas.`;
  if (st.kind === 'borrow' && st.from === 10) return `10 − 1 = 9: el 10 presta 1 y se queda en 9.`;
  if (st.kind === 'borrow') return `El ${st.from} presta 1 y se queda en ${st.expect}.`;
  if (op === '+') return st.sum >= 10 ? `${st.parts.join(' + ')} = ${st.sum}. Escribe solo el ${st.sum % 10} (y llevas 1).` : `${st.parts.join(' + ')} = ${st.sum}.`;
  return `${st.top} − ${st.bot || 0} = ${st.expect}.`;
}

/* ---------- Interfaz ---------- */
const CSS = `
.col-wrap{display:flex;flex-wrap:wrap;gap:22px;justify-content:center;align-items:flex-start;margin-top:8px}
.col-say{width:100%;text-align:center;font-size:24px;font-weight:bold;min-height:64px;display:flex;align-items:center;justify-content:center;gap:10px;background:#eef6ff;border-radius:18px;padding:8px 14px;line-height:1.3}
.col-say button{border:none;background:#fde68a;border-radius:50%;width:46px;height:46px;font-size:22px;flex:none}
.col-grid{display:grid;gap:0;background:#fff;border-radius:24px;padding:10px 14px 14px;box-shadow:0 6px 18px rgba(30,60,110,.12)}
.col-grid > div{width:76px;height:76px;display:flex;align-items:center;justify-content:center;font-size:52px;font-weight:bold;position:relative}
.col-grid .lbl{height:40px;font-size:24px;color:#475569}
.col-grid .small{height:54px}
.col-grid .op{width:48px;color:#475569}
.col-grid > .line{width:auto;height:6px;background:#334155;border-radius:4px;margin:4px 0 8px}
.col-bg-0{background:#e0f2fe}.col-bg-1{background:#dcfce7}.col-bg-2{background:#fef3c7}.col-bg-3{background:#fce7f3}
.col-grid .bgtop{border-radius:16px 16px 0 0}.col-grid .bgbot{border-radius:0 0 16px 16px}
.cell{width:64px;height:68px;border:4px dashed #94a3b8;border-radius:16px;background:#fff;display:flex;align-items:center;justify-content:center;font-size:46px;font-weight:bold;color:#1e293b;transition:background .2s,border-color .2s}
.cell.mini{width:46px;height:46px;font-size:30px;border-radius:12px;border-color:#f59e0b;background:#fffbeb;color:#b45309;animation:colpop .35s}
.cell.active{border-style:solid;border-color:#3b82f6;box-shadow:0 0 0 6px rgba(59,130,246,.2);animation:colglow 1.4s infinite}
.cell.mini.active{border-color:#f97316;box-shadow:0 0 0 6px rgba(249,115,22,.25)}
.cell.ok{border-style:solid;border-color:#22c55e;background:#dcfce7;color:#166534;animation:colpop .35s}
.cell.helped{border-style:solid;border-color:#f59e0b;background:#fef3c7}
.cell.bad{border-color:#f87171;background:#fee2e2;animation:colshake .4s}
.cell.wait{opacity:.35}
.dig.lent{color:#94a3b8}
.dig.lent::after{content:'';position:absolute;left:18px;right:18px;top:50%;height:5px;background:#ef4444;transform:rotate(-20deg);border-radius:3px}
.dig .ten{font-size:26px;color:#ea580c;margin-right:2px;align-self:flex-start;margin-top:10px}
@keyframes colglow{50%{box-shadow:0 0 0 12px rgba(59,130,246,.08)}}
@keyframes colpop{0%{transform:scale(.6)}70%{transform:scale(1.12)}100%{transform:scale(1)}}
@keyframes colshake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
.col-pad{display:grid;grid-template-columns:repeat(3,84px);gap:12px}
.col-pad button{height:78px;border:none;border-radius:20px;font-size:38px;font-weight:bold;background:#f1f5f9;color:#1e293b;box-shadow:0 5px 0 rgba(0,0,0,.12);touch-action:manipulation}
.col-pad button:active{transform:translateY(3px);box-shadow:0 2px 0 rgba(0,0,0,.12)}
.col-pad .del{background:#fde68a;font-size:30px}
.col-pad .chk{background:#22c55e;color:#fff}
.col-pad button:disabled{opacity:.35}
.col-msg{width:100%;text-align:center;font-size:21px;min-height:30px;color:#9a3412}
.col-msg.good{color:#166534}
.col-spark{position:absolute;pointer-events:none;font-size:26px;animation:colspark .8s forwards}
@keyframes colspark{to{transform:translateY(-40px) scale(1.4);opacity:0}}
.col-side{display:flex;flex-direction:column;align-items:center;gap:12px}
.col-modes{display:flex;gap:8px}
.col-modes button{border:none;border-radius:16px;padding:8px 14px;min-height:50px;font-size:19px;font-weight:bold;background:#eef2ff;color:#475569;box-shadow:0 3px 0 rgba(0,0,0,.08)}
.col-modes button.on{background:#3b82f6;color:#fff}
.col-wtools{display:flex;flex-direction:column;gap:12px;align-items:stretch;min-width:220px}
.col-wtools button{min-height:72px;border:none;border-radius:20px;font-size:26px;font-weight:bold;box-shadow:0 5px 0 rgba(0,0,0,.12)}
.col-wtools .del{background:#fde68a;color:#1e293b}.col-wtools .chk{background:#22c55e;color:#fff}
.col-wtools .tip{font-size:17px;color:#64748b;text-align:center;max-width:240px}
.demo-next{min-height:80px;min-width:240px;border:none;border-radius:22px;font-size:28px;font-weight:bold;background:#8b5cf6;color:#fff;box-shadow:0 6px 0 rgba(0,0,0,.18)}
.demo-next:active{transform:translateY(4px)}
.col-ink{display:block;background:#fff linear-gradient(transparent calc(50% - 1px),#e2e8f0 calc(50% - 1px),#e2e8f0 calc(50% + 1px),transparent calc(50% + 1px));border:4px solid #3b82f6;border-radius:24px;box-shadow:0 6px 16px rgba(59,130,246,.18);touch-action:none;align-self:center}
.col-inklbl{font-size:20px;font-weight:bold;color:#2563eb;text-align:center}
.col-wrow{display:flex;gap:12px}.col-wrow button{flex:1}
.cell.inked{color:#2563eb}
@media (max-width:560px){.col-say{font-size:19px;min-height:52px}.col-grid > div{width:60px;height:64px;font-size:42px}.cell{width:52px;height:58px;font-size:38px}.col-grid .op{width:36px}.col-pad{grid-template-columns:repeat(3,72px)}.col-pad button{height:66px}}
`;
const MODE_KEY = 'columna-modo-v1';
const pick = a => a[Math.floor(Math.random() * a.length)];
let actx = null;
function ding() { // sonidito de acierto
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    [880, 1175].forEach((f, i) => { const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime + i * 0.08; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15); o.connect(g).connect(actx.destination); o.start(t); o.stop(t + 0.17); });
  } catch (e) {}
}
let cssDone = false;
function css() { if (cssDone) return; cssDone = true; const s = document.createElement('style'); s.textContent = CSS; document.head.append(s); }
function el(tag, cls, ...kids) { const e = document.createElement(tag); if (cls) e.className = cls; kids.flat().forEach(k => k != null && e.append(k)); return e; }

function create({ a, b, op, speak, onDone, onStep, exam, demo }) {
  css();
  const { steps, info } = plan(a, b, op);
  const n = info.n;
  let k = 0, value = '', errors = 0, mistakes = 0, helped = 0, finished = false, busy = false;
  const errs = []; // detalle de errores para "Errores para repasar"
  // ✍️ Escribir (con el dedo en la casilla) o 🔢 Números (teclado). Escribir es la opción inicial.
  const E = root.Escritura, canWrite = !!(E && E.inkBox);
  let mode = 'pad';
  try { mode = canWrite ? (localStorage.getItem(MODE_KEY) || 'write') : 'pad'; } catch (e) { mode = canWrite ? 'write' : 'pad'; }
  const say = el('div', 'col-say');
  const msg = el('div', 'col-msg');
  const grid = el('div', 'col-grid');
  grid.style.gridTemplateColumns = `48px repeat(${n}, auto)`;
  const cells = {}; // 'res-i', 'carry-i', 'borrow-i'
  const digs = {};  // dígitos de arriba
  // Fila de etiquetas
  const colOf = x => n - 1 - x; // posición visual -> columna (0 = unidades)
  grid.append(el('div', 'op lbl'));
  for (let x = 0; x < n; x++) { const c = colOf(x); grid.append(el('div', `lbl col-bg-${c} bgtop`, PLACE[c])); }
  // Fila de cuadritos pequeños (llevo / préstamo)
  grid.append(el('div', 'op small'));
  for (let x = 0; x < n; x++) {
    const c = colOf(x), slot = el('div', `small col-bg-${c}`);
    const need = steps.find(s => (s.kind === 'carry' || s.kind === 'borrow') && s.col === c);
    if (need) { const m = el('div', 'cell mini'); m.style.visibility = 'hidden'; cells[need.kind + '-' + c] = m; slot.append(m); }
    grid.append(slot);
  }
  // Número de arriba
  grid.append(el('div', 'op'));
  for (let x = 0; x < n; x++) { const c = colOf(x), d = el('div', `dig col-bg-${c}`, info.top[c] == null ? '' : String(info.top[c])); digs[c] = d; grid.append(d); }
  // Número de abajo con el signo
  grid.append(el('div', 'op', op === '+' ? '+' : '−'));
  for (let x = 0; x < n; x++) { const c = colOf(x); grid.append(el('div', `dig col-bg-${c}`, info.bot[c] == null ? '' : String(info.bot[c]))); }
  // Raya
  const line = el('div', 'line'); line.style.gridColumn = `1 / span ${n + 1}`; grid.append(line);
  // Resultado
  grid.append(el('div', 'op'));
  for (let x = 0; x < n; x++) { const c = colOf(x), slot = el('div', `col-bg-${c} bgbot`), cell = el('div', 'cell wait'); cells['res-' + c] = cell; slot.append(cell); grid.append(slot); }

  // Teclado
  const pad = el('div', 'col-pad');
  const btn = (label, cls, fn) => { const b2 = el('button', cls, label); b2.type = 'button'; b2.addEventListener('click', fn); pad.append(b2); return b2; };
  '123456789'.split('').forEach(d => btn(d, null, () => type(d)));
  btn('⌫', 'del', () => { if (finished || busy) return; value = ''; draw(); });
  btn('0', null, () => type('0'));
  const chk = btn('✔', 'chk', check);

  // ✍️ Recuadro grande para escribir: el número que escribe aparece en la casilla que toca
  const wtools = el('div', 'col-wtools');
  const PAD = typeof window !== 'undefined' ? Math.max(190, Math.min(250, window.innerWidth - 80)) : 240;
  let ink = null, inkTimer = null;
  const DIGITS = '0123456789'.split('');
  if (canWrite) {
    ink = E.inkBox(PAD, () => { clearTimeout(inkTimer); inkTimer = setTimeout(autoRead, 600); }, { h: PAD, lines: false, onStart: () => clearTimeout(inkTimer) });
    ink.cv.classList.add('col-ink');
    const wbtn = (label, cls, fn) => { const b2 = el('button', cls, label); b2.type = 'button'; b2.addEventListener('click', fn); return b2; };
    wtools.append(el('div', 'col-inklbl', 'Escribe aquí ✍️'), ink.cv,
      el('div', 'col-wrow',
        wbtn('🧽 Borrar', 'del', () => { if (finished || busy) return; clearInk(); msg.textContent = ''; }),
        wbtn('✔', 'chk', () => { if (finished || busy) return; clearTimeout(inkTimer); if (ink.strokes.length) readInk(); check(); })),
      el('div', 'tip', 'Si está bien, se revisa solito ✨'));
  }
  const modes = el('div', 'col-modes');
  const side = el('div', 'col-side');
  function setMode(m) {
    mode = m; try { localStorage.setItem(MODE_KEY, m); } catch (e) {}
    value = ''; clearInk();
    wrap.classList.toggle('col-write', m === 'write');
    modes.innerHTML = '';
    if (canWrite) [['write', '✍️ Escribir'], ['pad', '🔢 Números']].forEach(([id, label]) => { const b2 = el('button', id === mode ? 'on' : null, label); b2.type = 'button'; b2.addEventListener('click', () => { if (!finished && !busy && id !== mode) setMode(id); }); modes.append(b2); });
    side.innerHTML = ''; side.append(modes, m === 'write' ? wtools : pad);
    const st = cur(); if (st && !finished) { cellOf(st).textContent = ''; draw(); }
  }
  function clearInk() { clearTimeout(inkTimer); if (ink) ink.clear(); value = ''; const st = cur(); if (st && !finished && mode === 'write') cellOf(st).textContent = ''; }
  // Lee lo escrito: si es correcto se queda fijo; si no, esperamos (puede corregir o tocar ✔)
  function readInk() {
    const st = cur();
    if (!ink || !ink.strokes.length || !st) { value = ''; return; }
    const ranked = E.recognize(ink.frameStrokes(), DIGITS);
    value = E.decide(ranked, String(st.expect), { top: 1, ratio: 1.12, add: 0.2 }) || '';
    cellOf(st).textContent = value; // se ve en la casilla
  }
  function autoRead() {
    if (finished || busy || mode !== 'write') return;
    readInk();
    const st = cur();
    if (st && value !== '' && +value === st.expect) { check(); return; }
    if (value !== '') { msg.className = 'col-msg'; msg.textContent = `Leí un ${value} 🤔 Si ya terminaste toca ✔; si no, bórralo con 🧽`; }
  }

  const cur = () => steps[k];
  const cellOf = st => cells[st.kind + '-' + st.col];
  function type(d) { if (finished || busy) return; value = d; draw(); }
  function draw() {
    const st = cur();
    Object.values(cells).forEach(c => c.classList.remove('active'));
    if (st) {
      const c = cellOf(st); c.classList.remove('wait', 'bad'); c.classList.add('active'); c.style.visibility = 'visible';
      c.textContent = value; c.classList.toggle('inked', mode === 'write');
    }
    chk.disabled = finished;
  }
  function sparkle(c) { const s = el('div', 'col-spark', '✨'); c.parentElement.style.position = 'relative'; c.parentElement.append(s); setTimeout(() => s.remove(), 800); }
  function setSay(t) {
    say.innerHTML = '';
    const b2 = el('button', null, '🔊'); b2.type = 'button'; b2.addEventListener('click', () => speak && speak(t.replace(/[⬆️✔]/gu, '')));
    say.append(el('span', null, t)); if (speak) say.append(b2);
  }
  function advance() {
    k++;
    value = ''; errors = 0;
    const st = cur();
    if (!st) {
      finished = true; clearInk();
      Object.values(cells).forEach(c => c.classList.remove('active'));
      chk.disabled = true;
      setSay(`¡Listo! ${a} ${op === '+' ? '+' : '−'} ${b} = ${info.r} 🎉`);
      msg.className = 'col-msg good'; msg.textContent = mistakes ? '¡Muy bien! Lo corregiste 💪' : '¡Perfecto, sin errores! 🌟';
      if (onDone) onDone({ mistakes, helped, result: info.r, side, errs });
      return;
    }
    if (st.kind === 'carry' || st.kind === 'borrow') cellOf(st).style.visibility = 'visible';
    setSay(instruction(st, op, info));
    if (onStep) onStep(st);
    draw();
  }
  // Al pedir prestado: se tacha el número que presta y aparece el 1 (diez) junto a las unidades
  function afterOk(st) {
    if (st.kind !== 'borrow') return;
    digs[st.col].classList.add('lent');
    const to = digs[st.forCol]; to.innerHTML = ''; to.append(el('span', 'ten', '1'), String(info.top[st.forCol]));
  }
  function check() {
    if (finished || busy) return;
    const st = cur(), c = cellOf(st);
    if (value === '' && !(st.kind === 'res' && st.leading)) { msg.className = 'col-msg'; msg.textContent = mode === 'write' ? 'Primero escribe un número en la casilla ✍️' : 'Primero toca un número 👉'; return; }
    if (mode === 'write') { clearTimeout(inkTimer); if (ink) ink.clear(); }
    const v = value === '' ? 0 : +value;
    if (v === st.expect) {
      c.classList.remove('active', 'bad'); c.classList.add(errors >= 3 ? 'helped' : 'ok');
      c.textContent = st.kind === 'res' && st.leading && value === '' ? '' : String(v);
      ding();
      sparkle(c);
      msg.className = 'col-msg good'; msg.textContent = st.kind === 'carry' ? '¡Muy bien! Ya llevas el 1 ✅' : st.kind === 'borrow' ? '¡Muy bien! Ya pediste prestado ✅' : pick(['¡Muy bien! ✅', '¡Excelente! ✅', '¡Eso es! ✅', '¡Súper! ✅']);
      afterOk(st);
      advance();
      return;
    }
    errors++; if (errors === 1) mistakes++;
    errs.push(`${PLACE_NAME[st.col]}${st.kind === 'carry' ? ' (cuadrito de llevar)' : st.kind === 'borrow' ? ' (cuadrito de pedir prestado)' : ''}: escribió ${value === '' ? '(nada)' : value}, era ${st.expect}`);
    c.classList.remove('bad'); void c.offsetWidth; c.classList.add('bad');
    msg.className = 'col-msg';
    if (exam) errors = 3; // examen: un solo intento por casilla, se muestra el correcto y seguimos
    if (errors === 1) msg.textContent = 'Mmm… revisa otra vez 🤔';
    else if (errors === 2) msg.textContent = '💡 ' + hint(st, op, info);
    else { // al tercer intento lo escribimos por ella/él y seguimos
      helped++; value = String(st.expect); c.textContent = value;
      msg.textContent = exam ? `Era ${st.expect} 🙂` : '💡 ' + hint(st, op, info);
      c.classList.remove('bad', 'active'); c.classList.add('helped');
      busy = true;
      setTimeout(() => { busy = false; afterOk(st); advance(); }, 1400);
      return;
    }
    if (mode === 'write') { c.textContent = value; value = ''; if (ink) ink.clear(); setTimeout(() => { if (cur() === st && !finished && !busy) { c.textContent = ''; draw(); } }, 700); return; }
    value = ''; setTimeout(() => { if (cur() === st && !c.classList.contains('ok')) c.textContent = ''; }, 500);
  }
  const wrap = el('div', 'col-wrap', say, grid, side, msg);
  k = -1; advance();
  if (demo) {
    // Modo "Mira cómo se hace": cada toque resuelve el siguiente paso y lo explica (para que papá/mamá lo expliquen)
    mode = 'pad';
    side.innerHTML = '';
    const nb = el('button', 'demo-next', '▶ Siguiente paso'); nb.type = 'button';
    nb.addEventListener('click', () => {
      if (finished || busy) return;
      const st = cur(); value = String(st.expect); draw();
      const why = hint(st, op, info);
      setTimeout(() => { check(); if (!finished) msg.textContent = '✅ ' + why; else nb.remove(); }, 450);
    });
    side.append(nb, el('div', 'tip', 'Lee cada paso en voz alta con tu hija/o y luego toca ▶'));
    wrap.classList.add('col-demo');
    return wrap;
  }
  setMode(mode);
  return wrap;
}

const api = { create, plan };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
root.Columna = api;
})(typeof window !== 'undefined' ? window : globalThis);
