/* 👨‍👩‍👧 Modo papá/mamá: tiempo de práctica, días, temas terminados y los temas más débiles.
   Protegido con un PIN de 4 números que pone papá/mamá (o, si no hay PIN, una multiplicación
   que un niño de 2° todavía no sabe). Todo se lee de este dispositivo. */
(function () {
  if (typeof document === 'undefined') return;
  const PIN_KEY = 'mi-examen-pin-v1';
  const NAME = { matematicas: 'Matemáticas', ingles: 'Inglés', espanol: 'Español' };
  const el = (tag, cls, ...kids) => { const e = document.createElement(tag); if (cls) e.className = cls; kids.flat().forEach(k => k != null && k !== false && e.append(k)); return e; };
  const btn = (label, cls, fn) => { const b = el('button', cls, label); b.type = 'button'; b.addEventListener('click', fn); return b; };
  const CSS = `
.pp-wrap{position:fixed;inset:0;z-index:70;background:rgba(15,23,42,.55);overflow:auto;-webkit-overflow-scrolling:touch;padding:20px 12px;box-sizing:border-box}
.pp-box{background:#fff;max-width:720px;margin:0 auto;border-radius:24px;padding:18px 20px;box-shadow:0 10px 30px rgba(0,0,0,.25);font-size:18px;color:#1e293b}
.pp-box h2{margin:0 0 8px;font-size:26px}.pp-box h3{margin:18px 0 8px;font-size:20px}
.pp-top{display:flex;justify-content:space-between;align-items:center;gap:10px}
.pp-x{border:none;background:#f1f5f9;border-radius:14px;min-width:48px;min-height:48px;font-size:20px}
.pp-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}
.pp-kpi{background:#f8fafc;border-radius:16px;padding:10px 12px;text-align:center}.pp-kpi b{display:block;font-size:28px;color:#0f766e}
.pp-bars{display:flex;align-items:flex-end;gap:4px;height:120px;border-bottom:2px solid #cbd5e1;padding-top:6px}
.pp-bars div{flex:1;background:#38bdf8;border-radius:6px 6px 0 0;position:relative;min-height:2px}
.pp-bars span{position:absolute;bottom:-22px;left:50%;transform:translateX(-50%);font-size:11px;color:#64748b;white-space:nowrap}
.pp-list{list-style:none;padding:0;margin:0}.pp-list li{display:flex;justify-content:space-between;gap:10px;padding:8px 10px;border-radius:12px;background:#f8fafc;margin-bottom:6px}
.pp-list a{color:inherit;text-decoration:none}.pp-list small{color:#64748b}
.pp-pin{display:flex;flex-direction:column;align-items:center;gap:12px}
.pp-dots{font-size:40px;letter-spacing:12px;min-height:50px}
.pp-np{display:grid;grid-template-columns:repeat(3,76px);gap:10px}.pp-np button{min-height:68px;border:none;border-radius:18px;background:#f1f5f9;font-size:28px;font-weight:bold}
.pp-q{font-size:30px;font-weight:bold}.pp-msg{min-height:26px;color:#b91c1c}
.pp-link{border:none;background:none;color:#2563eb;font-size:17px;text-decoration:underline;min-height:44px}
.pp-row{display:flex;gap:10px;flex-wrap:wrap;margin:8px 0}
.pp-code{width:100%;box-sizing:border-box;min-height:90px;font:13px ui-monospace,Menlo,monospace;border:2px solid #cbd5e1;border-radius:12px;padding:8px;word-break:break-all}
.pp-qr{max-width:480px;margin:6px auto;background:#fff}.pp-qr svg{width:100%;height:auto;display:block}
.pp-btn{border:none;border-radius:16px;min-height:52px;padding:0 18px;font-size:18px;font-weight:bold;background:#e0f2fe;color:#075985}`;
  let cssDone = false;
  const css = () => { if (cssDone) return; cssDone = true; const s = document.createElement('style'); s.textContent = CSS; document.head.append(s); };
  const getPin = () => { try { return localStorage.getItem(PIN_KEY) || ''; } catch (e) { return ''; } };
  const setPin = p => { try { p ? localStorage.setItem(PIN_KEY, p) : localStorage.removeItem(PIN_KEY); } catch (e) {} };
  function overlay() { css(); const w = el('div', 'pp-wrap'), box = el('div', 'pp-box'); w.append(box); document.body.append(w); document.documentElement.style.overflow = 'hidden'; w.close = () => { w.remove(); document.documentElement.style.overflow = ''; }; w.box = box; return w; }
  const header = (w, title) => el('div', 'pp-top', el('h2', null, title), btn('✖', 'pp-x', w.close));

  // Teclado para PIN o respuesta
  function keypad(len, onDone) {
    let v = '';
    const dots = el('div', 'pp-dots'), np = el('div', 'pp-np');
    const draw = () => { dots.textContent = len ? '●'.repeat(v.length) + '○'.repeat(len - v.length) : (v || ' '); };
    const press = d => { if (len && v.length >= len) return; if (!len && v.length >= 4) return; v += d; draw(); if (len && v.length === len) { const x = v; v = ''; setTimeout(() => { draw(); onDone(x); }, 150); } };
    '123456789'.split('').forEach(d => np.append(btn(d, null, () => press(d))));
    np.append(btn('⌫', null, () => { v = v.slice(0, -1); draw(); }), btn('0', null, () => press('0')), len ? el('span') : btn('✔', null, () => { const x = v; v = ''; draw(); onDone(x); }));
    draw();
    return el('div', 'pp-pin', dots, np);
  }
  function mathGate(w, onOk, why) {
    const a = 6 + Math.floor(Math.random() * 7), b = 6 + Math.floor(Math.random() * 7);
    const msg = el('div', 'pp-msg');
    w.box.innerHTML = '';
    w.box.append(header(w, '👨‍👩‍👧 Solo para papá o mamá'), el('p', null, why || 'Para entrar, contesta:'), el('div', 'pp-pin', el('div', 'pp-q', `${a} × ${b} = ?`), msg,
      keypad(0, x => { if (+x === a * b) onOk(); else { msg.textContent = 'Esa no es 🙂'; } })));
  }
  function pinGate(w, onOk) {
    const msg = el('div', 'pp-msg');
    w.box.innerHTML = '';
    w.box.append(header(w, '👨‍👩‍👧 Solo para papá o mamá'), el('p', null, 'Escribe tu PIN de 4 números:'), msg,
      keypad(4, x => { if (x === getPin()) onOk(); else msg.textContent = 'PIN incorrecto'; }),
      el('div', null, btn('¿Olvidaste el PIN?', 'pp-link', () => mathGate(w, () => { setPin(''); newPin(w, onOk); }, 'Para borrar el PIN, contesta:'))));
  }
  function newPin(w, then) {
    let first = null;
    const msg = el('div', 'pp-msg'), p = el('p', null, 'Elige un PIN de 4 números (que no lo sepa el niño/la niña):');
    w.box.innerHTML = '';
    w.box.append(header(w, '🔐 Nuevo PIN'), p, msg, keypad(4, x => {
      if (!first) { first = x; p.textContent = 'Escríbelo otra vez para confirmar:'; msg.textContent = ''; return; }
      if (x !== first) { first = null; p.textContent = 'No coincidieron. Elige un PIN de 4 números:'; msg.textContent = '❌'; return; }
      setPin(x); then();
    }), el('div', null, btn('Ahora no (usar la multiplicación)', 'pp-link', then)));
  }
  const fmtMin = s => { const m = Math.round(s / 60); return m < 60 ? m + ' min' : Math.floor(m / 60) + ' h ' + (m % 60) + ' min'; };
  function panel(w) {
    const P = window.Progreso ? Progreso.datos() : { days: {}, sets: [] };
    const today = new Date(); const k = d => Progreso.dkey(d);
    const back = n => { const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - n); return d; };
    const secsOf = d => (P.days[k(d)] || {}).secs || 0;
    let week = 0; for (let i = 0; i < 7; i++) week += secsOf(back(i));
    const total = Object.values(P.days).reduce((s, d) => s + (d.secs || 0), 0);
    const daysOn = Object.values(P.days).filter(d => d.n > 0).length;
    // barras de los últimos 14 días
    const vals = []; for (let i = 13; i >= 0; i--) { const d = back(i); vals.push({ d, s: secsOf(d), n: (P.days[k(d)] || {}).n || 0 }); }
    const max = Math.max(600, ...vals.map(v => v.s));
    const bars = el('div', 'pp-bars', vals.map(v => { const b = el('div', null, el('span', null, v.d.getDate() + '')); b.style.height = Math.max(2, v.s / max * 100) + '%'; b.title = fmtMin(v.s) + ' · ' + v.n + ' prácticas'; if (!v.s && v.n) b.style.background = '#fde68a'; return b; }));
    // temas terminados (por materia) y los últimos
    const done = {}; P.sets.forEach(s => { if (s.pag && s.id) (done[s.pag] = done[s.pag] || new Set()).add(s.id); });
    const recent = P.sets.slice(-12).reverse();
    // temas más débiles: pocas estrellas entre los que ya intentó + temas con más errores pendientes
    const weak = [];
    if (window.TEMAS) Object.keys(TEMAS).forEach(pg => {
      let prog = {}; try { prog = JSON.parse(localStorage.getItem(TEMAS_KEYS[pg])) || {}; } catch (e) {}
      TEMAS[pg].forEach(t => { if (t.k === 'reloj') return; const tried = done[pg] && done[pg].has(t.id); if (tried || prog[t.id] != null) weak.push({ pg, t, s: prog[t.id] || 0 }); });
    });
    weak.sort((a, b) => a.s - b.s);
    const errs = {}; try { Errores.list().filter(e => !e.visto).forEach(e => { const key = e.materia + ' · ' + e.tema; errs[key] = (errs[key] || 0) + (e.veces || 1); }); } catch (e) {}
    const topErr = Object.entries(errs).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const catalogCount = pg => window.TEMAS && TEMAS[pg] ? TEMAS[pg].filter(t => t.k !== 'reloj').length : 0;
    w.box.innerHTML = '';
    const add = (...k) => k.flat().forEach(x => x != null && x !== false && w.box.append(x));
    add(header(w, '👨‍👩‍👧 Modo papá / mamá'),
      el('div', 'pp-kpis',
        el('div', 'pp-kpi', el('b', null, fmtMin(secsOf(today))), 'hoy'),
        el('div', 'pp-kpi', el('b', null, fmtMin(week)), 'últimos 7 días'),
        el('div', 'pp-kpi', el('b', null, fmtMin(total)), 'en total'),
        el('div', 'pp-kpi', el('b', null, String(window.Progreso ? Progreso.racha() : 0)), 'días seguidos'),
        el('div', 'pp-kpi', el('b', null, String(daysOn)), 'días practicados')),
      el('h3', null, '⏱️ Tiempo de práctica (últimos 14 días)'), bars,
      el('p', null, el('small', null, 'Cuenta el tiempo con una práctica abierta y el iPad en uso (se pausa si no tocan nada en 1½ minutos).')),
      el('h3', null, '✅ Temas terminados'),
      el('ul', 'pp-list', Object.keys(NAME).map(pg => el('li', null, el('span', null, NAME[pg]), el('b', null, `${done[pg] ? done[pg].size : 0} de ${catalogCount(pg)}`)))),
      recent.length ? el('ul', 'pp-list', recent.map(s => el('li', null, el('span', null, s.t + ' ', el('small', null, `${s.m} · ${s.d}${s.x ? ' · examen' : ''}`)), el('b', null, `${s.s}/${s.tot}`)))) : el('p', null, 'Todavía no hay prácticas terminadas en este dispositivo.'),
      el('h3', null, '🎯 Temas que más necesitan práctica'),
      weak.length ? el('ul', 'pp-list', weak.slice(0, 8).map(x => { const a = el('a', null, x.t.e + ' ' + x.t.t + ' ', el('small', null, NAME[x.pg])); a.href = x.pg + '/#tema-' + encodeURIComponent(x.t.id); return el('li', null, a, el('span', null, '⭐'.repeat(x.s) + '☆'.repeat(3 - x.s))); })) : el('p', null, 'Aún no hay suficientes prácticas para saberlo.'),
      topErr.length ? el('h3', null, '📋 Donde tiene más errores pendientes') : null,
      topErr.length ? el('ul', 'pp-list', topErr.map(([t, n]) => el('li', null, el('span', null, t), el('b', null, String(n))))) : null,
      window.Respaldo ? respaldoUI() : null,
      el('div', null, el('p', null, btn(getPin() ? '🔐 Cambiar PIN' : '🔐 Poner un PIN', 'pp-btn', () => newPin(w, () => panel(w))), ' ', getPin() ? btn('Quitar PIN', 'pp-link', () => { setPin(''); panel(w); }) : null)));
  }
  // 💾 Respaldo: exportar a código/QR e importar
  function respaldoUI() {
    const box = el('div', 'pp-bk');
    const area = el('div');
    const out = el('div');
    const mk = () => {
      area.innerHTML = '';
      area.append(el('p', null, 'Guarda las estrellas, errores, récords, racha y tiempo de este dispositivo para pasarlos a otro iPad.'),
        el('div', 'pp-row', btn('📤 Crear código de respaldo', 'pp-btn', crear), btn('📥 Cargar un respaldo', 'pp-btn', cargar)), out);
    };
    async function crear() {
      out.innerHTML = '⏳';
      const code = await Respaldo.exportar();
      const ta = el('textarea', 'pp-code'); ta.readOnly = true; ta.value = code;
      const copy = btn('📋 Copiar código', 'pp-btn', async () => { try { await navigator.clipboard.writeText(code); copy.textContent = '✅ Copiado'; } catch (e) { ta.focus(); ta.select(); document.execCommand && document.execCommand('copy'); copy.textContent = '✅ Copiado'; } });
      const share = navigator.share ? btn('📨 Enviar', 'pp-btn', () => navigator.share({ title: 'Respaldo de Mi Examen', text: 'Ábrelo en el otro iPad: ' + Respaldo.link(code) }).catch(() => {})) : null;
      out.innerHTML = '';
      out.append(el('p', null, `Código listo (${code.length.toLocaleString('es-MX')} caracteres). Cópialo y pégalo en el otro iPad en Modo papá → 📥 Cargar un respaldo.`), ta, el('div', 'pp-row', copy, share));
      // QR: abre la página de respaldo en el otro iPad con la cámara (si cabe; si no, sin la lista de errores)
      let qrCode = code, note = '';
      if (Respaldo.link(qrCode).length > 2900) { qrCode = await Respaldo.exportar({ sinErrores: true }); note = ' (sin la lista de errores: es muy larga para un QR; para pasarla usa el código)'; }
      if (Respaldo.link(qrCode).length <= 2900) {
        try { const svg = await Respaldo.qrSvg(Respaldo.link(qrCode)); const q = el('div', 'pp-qr'); q.innerHTML = svg; out.append(el('p', null, '📷 O escanea este QR con la cámara del otro iPad' + note + ':'), q); } catch (e) {}
      } else out.append(el('p', null, el('small', null, 'El respaldo es muy grande para un QR: usa el código.')));
    }
    function cargar() {
      out.innerHTML = '';
      const ta = el('textarea', 'pp-code'); ta.placeholder = 'Pega aquí el código de respaldo (empieza con R1)';
      const msg = el('div', 'pp-msg');
      out.append(ta, msg, el('div', 'pp-row', btn('Revisar respaldo', 'pp-btn', async () => {
        try {
          const obj = await Respaldo.leer(ta.value);
          msg.textContent = '';
          out.append(el('ul', 'pp-list', Respaldo.resumen(obj).map(t => el('li', null, t))),
            el('p', null, '⚠️ Esto reemplaza lo que hay en este dispositivo con lo del respaldo.'),
            btn('✅ Sí, cargar el respaldo', 'pp-btn', () => { const n = Respaldo.aplicar(obj); out.innerHTML = ''; out.append(el('p', null, `✅ Listo: se cargaron ${n} datos. La página se va a recargar.`)); setTimeout(() => location.reload(), 1200); }));
        } catch (e) { msg.textContent = e.message; }
      })));
    }
    mk();
    box.append(el('h3', null, '💾 Respaldo del progreso'), area);
    return box;
  }
  function abrir() {
    const w = overlay();
    const go = () => panel(w);
    if (getPin()) pinGate(w, go); else mathGate(w, go, 'Para entrar, contesta (o pon un PIN adentro):');
  }
  window.Papa = { abrir };
})();
