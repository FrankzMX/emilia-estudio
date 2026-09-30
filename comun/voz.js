/* ============================================================
   VOZ · lectura en voz alta (Web Speech API)
   - Elige la mejor voz del dispositivo: español de México primero y,
     dentro de cada idioma, las voces "Mejorada / Premium / Natural".
   - Los papás pueden escoger y probar la voz en ⚙️ Ajustes de voz
     (se guarda en este dispositivo y aplica a todas las materias).
   Uso: Voz.speak(texto, { lang: 'es' | 'en', rate })  ·  Voz.panel()
   ============================================================ */
(function (root) {
'use strict';
const KEY = 'voz-ajustes-v1';
const has = typeof window !== 'undefined' && 'speechSynthesis' in window;
let cfg = {};
try { cfg = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch (e) {} };

const L = v => (v.lang || '').replace('_', '-').toLowerCase();
const QUALITY = /(mejorad|enhanced|premium|natural|neural|siri|online)/i;
const LOW = /(eloquence|compact|novelty|grandma|grandpa|abuel|shelley|sandy|rocko|reed|flo\b|bubbles|bad news|bells|boing|cellos|jester|organ|superstar|trinoids|whisper|wobble|zarvox|albert|fred|junior|kathy|ralph)/i;

function score(v, lang) {
  const l = L(v);
  let s = 0;
  if (lang === 'es') {
    if (l === 'es-mx') s += 100; else if (l === 'es-us') s += 70; else if (l === 'es-419') s += 65; else if (l.startsWith('es')) s += 30; else return -1;
    if (/paulina|dalia|jorge|juan|m[oó]nica|sabina|renata/i.test(v.name)) s += 8;
  } else {
    if (l === 'en-us') s += 100; else if (l.startsWith('en')) s += 60; else return -1;
    if (/samantha|ava|jenny|aria|allison|susan|evan|nathan|zoe/i.test(v.name)) s += 8;
  }
  if (QUALITY.test(v.name)) s += 40;
  if (LOW.test(v.name)) s -= 80;
  if (v.localService === false) s += 5; // voces en línea (Edge/Chrome) suelen sonar más naturales
  return s;
}
function voices(lang) {
  if (!has) return [];
  return speechSynthesis.getVoices().map(v => ({ v, s: score(v, lang) })).filter(x => x.s >= 0).sort((a, b) => b.s - a.s).map(x => x.v);
}
function pick(lang) {
  const list = voices(lang);
  const saved = cfg[lang] && list.find(v => v.voiceURI === cfg[lang]);
  return saved || list[0] || null;
}
if (has) speechSynthesis.getVoices(); // iOS/Chrome cargan la lista en segundo plano

function speak(text, opts) {
  opts = opts || {};
  if (!has) return false;
  const lang = opts.lang || 'es';
  const t = String(text || '').trim();
  if (!t) return true;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(t);
  const v = pick(lang);
  if (v) { u.voice = v; u.lang = v.lang; } else u.lang = lang === 'es' ? 'es-MX' : 'en-US';
  const speed = cfg.speed || 1;
  u.rate = Math.max(0.3, Math.min(1.6, (opts.rate || (lang === 'es' ? 0.9 : 0.85)) * speed));
  u.pitch = opts.pitch || 1;
  speechSynthesis.speak(u);
  return true;
}

/* ---------- Panel de ajustes ---------- */
function panel(retry) {
  retry = retry || 0;
  const d = document, el = (t, a, ...k) => { const e = d.createElement(t); Object.entries(a || {}).forEach(([x, y]) => { if (x.startsWith('on')) e.addEventListener(x.slice(2), y); else if (x === 'style') e.style.cssText = y; else e.setAttribute(x, y); }); k.flat().forEach(c => c != null && e.append(c)); return e; };
  const ov = el('div', { style: 'position:fixed;inset:0;z-index:90;background:rgba(20,30,50,.45);display:flex;align-items:center;justify-content:center;padding:16px' });
  const box = el('div', { style: 'background:#fff;border-radius:24px;max-width:620px;width:100%;max-height:90vh;overflow:auto;padding:20px 22px;font:18px -apple-system,system-ui,sans-serif;color:#1e293b' });
  ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
  const sample = { es: '¡Hola! Vamos a estudiar. Siete más ocho son quince.', en: 'Hello! Monday, Tuesday, Wednesday. Great job!' };
  function section(lang, title) {
    const list = voices(lang), cur = pick(lang);
    const sel = el('select', { style: 'font-size:18px;padding:10px;border-radius:12px;border:2px solid #cbd5e1;flex:1;min-width:0' });
    if (!list.length) sel.append(el('option', null, 'No hay voces para este idioma'));
    list.forEach(v => { const o = el('option', { value: v.voiceURI }, `${v.name} (${v.lang})${QUALITY.test(v.name) ? ' ⭐' : ''}`); if (cur && v.voiceURI === cur.voiceURI) o.selected = true; sel.append(o); });
    sel.addEventListener('change', () => { cfg[lang] = sel.value; save(); speak(sample[lang], { lang }); });
    return el('div', { style: 'margin:14px 0' }, el('div', { style: 'font-weight:700;margin-bottom:6px' }, title),
      el('div', { style: 'display:flex;gap:8px' }, sel, el('button', { style: 'border:none;border-radius:12px;background:#fde68a;font-size:22px;padding:0 16px', onclick: () => speak(sample[lang], { lang }) }, '▶')));
  }
  const speed = el('input', { type: 'range', min: '0.7', max: '1.3', step: '0.05', value: String(cfg.speed || 1), style: 'flex:1' });
  speed.addEventListener('change', () => { cfg.speed = +speed.value; save(); speak(sample.es, { lang: 'es' }); });
  box.append(el('h2', { style: 'margin:0 0 4px' }, '🔊 Ajustes de voz'),
    el('div', { style: 'color:#64748b;font-size:16px' }, 'Se guarda en este dispositivo. ⭐ = voz de mejor calidad.'),
    section('es', '🇲🇽 Español'), section('en', '🇺🇸 Inglés'),
    el('div', { style: 'display:flex;gap:10px;align-items:center;margin:10px 0' }, '🐢', speed, '🐇'),
    el('details', { style: 'background:#f1f5f9;border-radius:14px;padding:10px 14px;font-size:16px;margin-top:10px' },
      el('summary', { style: 'font-weight:700' }, '¿Quieres una voz más natural? (iPad / iPhone)'),
      el('p', null, 'Descarga una voz mejorada (gratis) y luego elígela aquí:'),
      el('p', null, 'Ajustes ➜ Accesibilidad ➜ Contenido leído ➜ Voces ➜ Español ➜ ', el('b', null, 'Paulina (México)'), ' ➜ descarga la versión ', el('b', null, 'Mejorada'), ' o ', el('b', null, 'Premium'), '. Para inglés: Inglés ➜ ', el('b', null, 'Samantha / Ava (Mejorada)'), '.'),
      el('p', null, 'Después cierra Safari por completo y vuelve a abrir la app para que aparezca en la lista.')),
    el('div', { style: 'text-align:right;margin-top:14px' }, el('button', { style: 'border:none;border-radius:14px;background:#3b82f6;color:#fff;font-size:20px;font-weight:700;padding:12px 22px', onclick: () => ov.remove() }, 'Listo ✔')));
  ov.append(box);
  d.body.append(ov);
  if (has && !speechSynthesis.getVoices().length && retry < 5) setTimeout(() => { ov.remove(); panel(retry + 1); }, 400);
}

root.Voz = { speak, pick, voices, panel, available: has };
})(typeof window !== 'undefined' ? window : globalThis);
