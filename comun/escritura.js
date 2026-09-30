/* ============================================================
   ESCRITURA · contestar sin el teclado del iPad
   - ✍️ Escribir: una cajita por letra con renglones de cuaderno.
     Reconocimiento 100% local (sin internet), letra por letra,
     para NO autocorregir la ortografía.
   - 🔤 Letras: teclado grande en orden ABC (ñ, acento, mayúscula).
   - 🔢 Números: teclado numérico grande.
   - ⌨️ Teclado: el teclado normal del iPad (Scribble con Apple Pencil).
   - ✏️ Borrador: hoja flotante para hacer cuentas con el dedo.
   Uso en la página:  Escritura.pad({ q, input, lang, typebox })
   ============================================================ */
(function (root) {
'use strict';

/* ---------- Plantillas de letras ----------
   Marco: y=0 línea de arriba, y=50 línea punteada, y=100 renglón, y=140 colita.
   M x y = empezar · L x y = línea · A cx cy rx ry a0 a1 = arco (grados, 0 = derecha, 90 = abajo)
   O cx cy rx ry = óvalo · | = otro trazo. El orden y la dirección del trazo no importan. */
const TEMPLATES = {
  a: ['O 30 75 20 25 | M 50 50 L 50 100', 'A 30 75 20 25 -20 330 L 50 50 L 50 100'],
  b: ['M 10 0 L 10 100 | O 30 75 20 25', 'M 10 0 L 10 100 L 10 75 A 30 75 20 25 180 540'],
  c: ['A 30 75 20 25 40 320'],
  d: ['O 30 75 20 25 | M 50 0 L 50 100'],
  e: ['M 10 75 L 50 75 A 30 75 20 25 0 -310'],
  f: ['M 25 100 L 25 20 A 37 20 12 15 180 330 | M 12 50 L 42 50'],
  g: ['O 30 75 20 25 | M 50 50 L 50 125 A 30 125 20 15 0 160', 'O 30 75 20 25 | M 50 50 L 50 128 A 38 128 12 12 0 170 L 20 128'],
  h: ['M 10 0 L 10 100 | M 10 70 A 30 70 20 20 180 360 L 50 100'],
  i: ['M 30 50 L 30 100', 'M 30 50 L 30 100 | M 30 30 L 30 33'],
  j: ['M 35 50 L 35 125 A 22 125 13 15 0 160', 'M 35 50 L 35 125 A 22 125 13 15 0 160 | M 35 30 L 35 33'],
  k: ['M 10 0 L 10 100 | M 48 50 L 10 80 L 50 100', 'M 10 0 L 10 100 | M 45 50 L 12 75 | M 22 68 L 50 100'],
  l: ['M 30 0 L 30 100', 'M 25 0 L 25 90 A 35 90 10 10 180 90'],
  m: ['M 8 50 L 8 100 | M 8 68 A 20 68 12 18 180 360 L 32 100 | M 32 68 A 44 68 12 18 180 360 L 56 100'],
  n: ['M 10 50 L 10 100 | M 10 70 A 30 70 20 20 180 360 L 50 100'],
  o: ['O 30 75 20 25'],
  p: ['M 10 50 L 10 140 | O 30 75 20 25', 'M 10 50 L 10 140 | M 10 55 A 30 75 20 25 -120 120 L 10 95'],
  q: ['O 30 75 20 25 | M 50 50 L 50 140'],
  r: ['M 12 50 L 12 100 | M 12 72 A 30 72 18 20 180 300'],
  s: ['A 30 62.5 16 12.5 -20 -270 A 30 87.5 16 12.5 -90 160'],
  t: ['M 28 15 L 28 100 | M 12 50 L 45 50', 'M 28 15 L 28 90 A 38 90 10 10 180 90 | M 12 50 L 45 50'],
  u: ['M 10 50 L 10 80 A 30 80 20 20 180 0 L 50 50 | M 50 50 L 50 100', 'M 10 50 L 10 80 A 30 80 20 20 180 0 L 50 50 L 50 100'],
  v: ['M 8 50 L 30 100 L 52 50'],
  w: ['M 5 50 L 17 100 L 30 60 L 43 100 L 55 50', 'M 5 50 L 15 100 L 30 55 L 45 100 L 55 50'],
  x: ['M 10 50 L 50 100 | M 50 50 L 10 100'],
  y: ['M 10 50 L 30 100 | M 50 50 L 20 140', 'M 10 50 L 10 80 A 30 80 20 20 180 0 | M 50 50 L 50 125 A 30 125 20 15 0 160'],
  z: ['M 10 50 L 50 50 L 10 100 L 50 100'],
  A: ['M 5 100 L 30 0 L 55 100 | M 15 62 L 45 62'],
  B: ['M 10 0 L 10 100 | M 10 0 L 30 0 A 30 25 18 25 -90 90 L 10 50 | M 10 50 L 32 50 A 32 75 20 25 -90 90 L 10 100'],
  C: ['A 35 50 28 50 45 315'],
  D: ['M 10 0 L 10 100 | M 10 0 L 20 0 A 20 50 30 50 -90 90 L 10 100'],
  E: ['M 45 0 L 10 0 L 10 100 L 45 100 | M 10 50 L 40 50', 'M 10 0 L 10 100 | M 10 0 L 45 0 | M 10 50 L 40 50 | M 10 100 L 45 100'],
  F: ['M 45 0 L 10 0 L 10 100 | M 10 50 L 40 50', 'M 10 0 L 10 100 | M 10 0 L 45 0 | M 10 50 L 40 50'],
  G: ['A 35 50 28 50 -40 -360 L 40 50'],
  H: ['M 10 0 L 10 100 | M 50 0 L 50 100 | M 10 50 L 50 50'],
  I: ['M 30 0 L 30 100', 'M 30 0 L 30 100 | M 15 0 L 45 0 | M 15 100 L 45 100'],
  J: ['M 45 0 L 45 75 A 27 75 18 25 0 170', 'M 45 0 L 45 75 A 27 75 18 25 0 170 | M 30 0 L 60 0'],
  K: ['M 10 0 L 10 100 | M 50 0 L 10 55 L 50 100', 'M 10 0 L 10 100 | M 50 0 L 12 52 | M 25 38 L 52 100'],
  L: ['M 10 0 L 10 100 L 48 100'],
  M: ['M 5 100 L 5 0 L 30 60 L 55 0 L 55 100', 'M 5 100 L 12 0 L 30 70 L 48 0 L 55 100'],
  N: ['M 10 100 L 10 0 L 50 100 L 50 0'],
  O: ['O 30 50 25 50'],
  P: ['M 10 100 L 10 0 | M 10 0 L 30 0 A 30 27 20 27 -90 90 L 10 54', 'M 10 100 L 10 0 L 30 0 A 30 27 20 27 -90 90 L 10 54'],
  Q: ['O 30 50 25 50 | M 38 78 L 58 102'],
  R: ['M 10 100 L 10 0 | M 10 0 L 30 0 A 30 27 20 27 -90 90 L 10 54 | M 25 54 L 52 100', 'M 10 100 L 10 0 L 30 0 A 30 27 20 27 -90 90 L 10 54 L 52 100'],
  S: ['A 30 25 20 25 -20 -270 A 30 75 20 25 -90 160'],
  T: ['M 5 0 L 55 0 | M 30 0 L 30 100'],
  U: ['M 10 0 L 10 70 A 30 70 20 30 180 0 L 50 0'],
  V: ['M 5 0 L 30 100 L 55 0'],
  W: ['M 0 0 L 15 100 L 30 30 L 45 100 L 60 0'],
  X: ['M 8 0 L 52 100 | M 52 0 L 8 100'],
  Y: ['M 5 0 L 30 50 L 55 0 | M 30 50 L 30 100', 'M 5 0 L 30 50 | M 55 0 L 15 100'],
  Z: ['M 8 0 L 52 0 L 8 100 L 52 100'],
  0: ['O 30 50 22 50'],
  1: ['M 18 20 L 32 0 L 32 100', 'M 30 0 L 30 100', 'M 18 20 L 32 0 L 32 100 | M 15 100 L 50 100'],
  2: ['A 30 28 22 28 -160 20 L 8 100 L 55 100', 'A 30 26 22 26 -175 0 L 6 100 L 56 100', 'M 10 22 A 30 26 20 24 -150 30 L 10 98 L 54 98'],
  3: ['A 30 25 20 25 -150 90 A 30 75 22 25 -90 150', 'A 28 24 20 24 -165 75 A 28 74 24 26 -75 165', 'M 8 3 L 50 3 L 26 42 A 30 70 22 28 -100 160', 'A 30 23 19 23 -160 90 L 22 50 A 30 76 23 25 -90 165'],
  4: ['M 40 0 L 5 70 L 55 70 | M 40 30 L 40 100', 'M 10 0 L 10 55 L 55 55 | M 45 0 L 45 100'],
  5: ['M 50 0 L 15 0 L 12 45 A 30 68 22 28 -125 150', 'M 15 0 L 12 45 A 30 68 22 28 -125 150 | M 15 0 L 50 0', 'M 52 2 L 16 2 L 14 40 A 31 67 21 29 -135 155'],
  6: ['M 45 0 L 22 35 L 12 70 | O 32 75 20 25', 'M 45 0 L 22 35 L 12 75 A 32 75 20 25 180 540'],
  7: ['M 5 0 L 55 0 L 22 100', 'M 5 0 L 55 0 L 40 40 L 28 100', 'M 5 0 L 55 0 L 25 100 | M 14 50 L 46 50', 'M 5 12 L 5 0 L 55 0 L 28 100', 'M 5 2 L 55 0 L 45 25 L 30 100'],
  8: ['O 30 25 17 25 | O 30 75 22 25'],
  9: ['O 30 25 20 25 | M 50 25 L 45 100', 'O 30 25 20 25 | M 50 25 L 50 100', 'A 30 25 20 25 0 360 L 42 100'],
};
const N = 32; // puntos por figura

function parseDSL(s) {
  const strokes = [];
  for (const part of s.split('|')) {
    const tk = part.trim().split(/\s+/);
    const cur = [];
    let i = 0;
    while (i < tk.length) {
      const c = tk[i++];
      if (c === 'M' || c === 'L') { cur.push({ x: +tk[i++], y: +tk[i++] }); }
      else if (c === 'A' || c === 'O') {
        const cx = +tk[i++], cy = +tk[i++], rx = +tk[i++], ry = +tk[i++];
        const a0 = c === 'O' ? 0 : +tk[i++], a1 = c === 'O' ? 360 : +tk[i++];
        const steps = Math.max(6, Math.ceil(Math.abs(a1 - a0) / 8));
        for (let k = 0; k <= steps; k++) { const a = (a0 + (a1 - a0) * k / steps) * Math.PI / 180; cur.push({ x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a) }); }
      }
    }
    if (cur.length) strokes.push(cur);
  }
  return strokes;
}

/* ---------- Reconocedor de nubes de puntos ($P, Vatavu et al. 2012) ---------- */
function bbox(pts) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const p of pts) { if (p.x < x0) x0 = p.x; if (p.x > x1) x1 = p.x; if (p.y < y0) y0 = p.y; if (p.y > y1) y1 = p.y; }
  return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0 };
}
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const pathLen = s => { let d = 0; for (let i = 1; i < s.length; i++) d += dist(s[i - 1], s[i]); return d; };

function resample(strokes, n) {
  const total = strokes.reduce((a, s) => a + pathLen(s), 0);
  const out = [];
  if (total === 0) { const p = strokes[0][0]; for (let i = 0; i < n; i++) out.push({ x: p.x, y: p.y }); return out; }
  const I = total / (n - 1);
  let D = 0;
  out.push({ ...strokes[0][0] });
  for (const s of strokes) {
    for (let i = 1; i < s.length; i++) {
      let prev = s[i - 1];
      let d = dist(prev, s[i]);
      while (D + d >= I && out.length < n) {
        const t = (I - D) / d;
        const q = { x: prev.x + t * (s[i].x - prev.x), y: prev.y + t * (s[i].y - prev.y) };
        out.push(q);
        d -= (I - D); prev = q; D = 0;
      }
      D += d;
    }
  }
  const last = strokes[strokes.length - 1];
  while (out.length < n) out.push({ ...last[last.length - 1] });
  return out;
}
function normalize(strokes) {
  const pts = resample(strokes, N);
  const b = bbox(pts), size = Math.max(b.w, b.h) || 1;
  let cx = 0, cy = 0;
  const sc = pts.map(p => ({ x: (p.x - b.x0) / size, y: (p.y - b.y0) / size }));
  sc.forEach(p => { cx += p.x; cy += p.y; });
  cx /= N; cy /= N;
  return sc.map(p => ({ x: p.x - cx, y: p.y - cy }));
}
function cloudDistance(a, b, start) {
  const matched = new Array(N).fill(false);
  let sum = 0, i = start;
  do {
    let min = Infinity, idx = -1;
    for (let j = 0; j < N; j++) if (!matched[j]) { const d = dist(a[i], b[j]); if (d < min) { min = d; idx = j; } }
    matched[idx] = true;
    sum += (1 - ((i - start + N) % N) / N) * min;
    i = (i + 1) % N;
  } while (i !== start);
  return sum;
}
function greedyMatch(a, b) {
  const step = Math.floor(Math.pow(N, 0.5));
  let min = Infinity;
  for (let i = 0; i < N; i += step) min = Math.min(min, cloudDistance(a, b, i), cloudDistance(b, a, i));
  return min;
}

/* Rejilla de zonas (3 columnas × 5 filas): cuánta tinta cae en cada parte del recuadro.
   Distingue formas que la nube de puntos confunde (3 abierto a la izquierda vs 8 cerrado, 3 vs 5). */
const GC = 3, GR = 5;
function zoneGrid(strokes) {
  const pts = resample(strokes, 64), b = bbox(pts);
  let w = b.w, hh = b.h, x0 = b.x0, y0 = b.y0;
  if (w < hh * 0.35) { x0 -= (hh * 0.35 - w) / 2; w = hh * 0.35; }     // "1" delgadito: al centro
  if (hh < w * 0.35) { y0 -= (w * 0.35 - hh) / 2; hh = w * 0.35; }
  const g = new Array(GC * GR).fill(0);
  for (const p of pts) {
    const fx = Math.min(GC - 1e-6, Math.max(0, (p.x - x0) / (w || 1) * GC)) - 0.5, fy = Math.min(GR - 1e-6, Math.max(0, (p.y - y0) / (hh || 1) * GR)) - 0.5;
    const cx = Math.floor(fx), cy = Math.floor(fy), ax = fx - cx, ay = fy - cy;
    for (const [dx, wx] of [[0, 1 - ax], [1, ax]]) for (const [dy, wy] of [[0, 1 - ay], [1, ay]]) {
      const X = Math.min(GC - 1, Math.max(0, cx + dx)), Y = Math.min(GR - 1, Math.max(0, cy + dy));
      g[Y * GC + X] += wx * wy;
    }
  }
  const sum = g.reduce((a, v) => a + v, 0) || 1;
  return g.map(v => v / sum);
}
const gridDist = (a, b) => { let d = 0; for (let i = 0; i < a.length; i++) d += Math.abs(a[i] - b[i]); return d; };
const GRID_W = 2; // peso de la rejilla frente a la nube de puntos (solo números)

// Plantillas preparadas: { ch, cloud, top, bottom } (top/bottom en unidades de "altura de x": 0 = arriba, 1 = punteada, 2 = renglón)
const PREPARED = [];
for (const [ch, list] of Object.entries(TEMPLATES)) {
  for (const s of list) {
    const strokes = parseDSL(s);
    const b = bbox(strokes.flat());
    // El puntito de i/j no cuenta para la zona
    const body = strokes.filter(st => bbox(st).h > 5 || bbox(st).w > 5);
    const bb = bbox(body.flat());
    PREPARED.push({ ch, cloud: normalize(strokes), grid: zoneGrid(strokes), top: bb.y0 / 50, bottom: b.y1 / 50 });
  }
}

const ZONE_W = 1.4; // peso de la posición en el renglón (alta / baja / con colita)

function rankChars(strokes, allowed, gw) {
  const cloud = normalize(strokes), grid = zoneGrid(strokes);
  const b = bbox(strokes.flat());
  const top = b.y0 / 50, bottom = b.y1 / 50;
  const best = {};
  for (const t of PREPARED) {
    if (!allowed.has(t.ch)) continue;
    const d = greedyMatch(cloud, t.cloud) + (gw || 0) * gridDist(grid, t.grid) + ZONE_W * (Math.abs(top - t.top) + Math.abs(bottom - t.bottom));
    if (best[t.ch] === undefined || d < best[t.ch]) best[t.ch] = d;
  }
  return Object.entries(best).map(([ch, score]) => ({ ch, score })).sort((a, b) => a.score - b.score);
}

/* ---------- Acentos, puntito, tilde y diéresis ---------- */
function classifyMark(s) {
  const b = bbox(s), len = pathLen(s);
  if (Math.max(b.w, b.h) < 12 || len < 14) return 'dot';
  const a = s[0], z = s[s.length - 1], chord = dist(a, z) || 1;
  const L = a.x <= z.x ? a : z, R = a.x <= z.x ? z : a;
  const ang = Math.atan2(L.y - R.y, R.x - L.x) * 180 / Math.PI; // >0 si sube hacia la derecha
  if (b.w > b.h * 1.4) {
    // ¿ondulada? cuenta cambios de dirección vertical
    let turns = 0, dir = 0;
    for (let i = 1; i < s.length; i++) { const dy = s[i].y - s[i - 1].y; if (Math.abs(dy) < 0.8) continue; const nd = Math.sign(dy); if (dir && nd !== dir) turns++; dir = nd; }
    if (turns >= 1 && len > chord * 1.12) return 'tilde';
  }
  if (len < chord * 1.35 && Math.abs(ang) >= 15 && Math.abs(ang) <= 88) return 'acute'; // (también aceptamos el acento al revés)
  return null;
}
const COMBOS = {
  acute: { a: 'á', e: 'é', i: 'í', j: 'í', l: 'í', o: 'ó', u: 'ú', A: 'Á', E: 'É', I: 'Í', O: 'Ó', U: 'Ú' },
  tilde: { n: 'ñ', N: 'Ñ', r: 'ñ', h: 'ñ' },
  dieresis: { u: 'ü', U: 'Ü' },
  dot: { i: 'i', j: 'j', l: 'i', I: 'i' },
};

/* recognize(strokes, allowedChars) -> [{ch, score}] ordenado (mejor primero).
   strokes en el marco de plantillas (y: 0 arriba, 50 punteada, 100 renglón). */
function recognize(strokes, allowedChars) {
  strokes = strokes.filter(s => s.length);
  if (!strokes.length) return [];
  const allowed = new Set(allowedChars);
  const base = new Set([...allowed].map(c => c.normalize('NFD').replace(/[̀-ͯ]/g, '')));
  const digitsOnly = [...allowed].every(c => /\d/.test(c));
  if (base.has('i')) base.add('l'); // una "i" sin puntito se parece a una "l" corta
  const baseAllowed = new Set([...base].filter(c => TEMPLATES[c]));

  if (strokes.length > 1 && !digitsOnly) {
    const bb = strokes.map(bbox);
    const isMark = strokes.map((s, k) => {
      const small = bb[k].w < 55 && bb[k].h < 35;
      if (!small) return false;
      const others = bb.filter((_, j) => j !== k);
      const othersTop = Math.min(...others.map(o => o.y0));
      const bigger = others.some(o => o.h > bb[k].h);
      return bigger && bb[k].y1 <= othersTop + 10;
    });
    const marks = strokes.filter((_, k) => isMark[k]);
    const body = strokes.filter((_, k) => !isMark[k]);
    if (marks.length && body.length) {
      const kinds = marks.map(classifyMark);
      let kind = null;
      if (kinds.length === 1) kind = kinds[0];
      else if (kinds.length === 2 && kinds.every(k => k === 'dot')) kind = 'dieresis';
      if (kind) {
        const ranked = rankChars(body, baseAllowed, digitsOnly ? GRID_W : 0);
        const out = [];
        for (const r of ranked) {
          const c = COMBOS[kind][r.ch];
          if (c && allowed.has(c)) out.push({ ch: c, score: r.score });
          else if (kind === 'dot' || allowed.has(r.ch)) out.push({ ch: r.ch === 'l' && !allowed.has('l') ? 'i' : r.ch, score: r.score + (kind === 'dot' ? 0.3 : 1.2) });
        }
        return dedupe(out);
      }
    }
  }
  const ranked = rankChars(strokes, baseAllowed, digitsOnly ? GRID_W : 0).map(r => (r.ch === 'l' && !allowed.has('l') ? { ch: 'i', score: r.score } : r));
  return dedupe(ranked.filter(r => allowed.has(r.ch)));
}
function dedupe(list) {
  const seen = new Set(), out = [];
  for (const r of list.sort((a, b) => a.score - b.score)) if (!seen.has(r.ch)) { seen.add(r.ch); out.push(r); }
  return out;
}

/* Decide qué letra mostrar. Si la letra esperada está entre las 3 mejores y casi empata,
   la aceptamos (la letra de una niña de 6 años no es perfecta). Mayúscula/minúscula y
   acentos se juzgan con más cuidado. */
function decide(ranked, expected, o) {
  o = o || {};
  if (!ranked.length) return '';
  const best = ranked[0];
  if (!expected || best.ch === expected) return best.ch;
  const k = ranked.findIndex(r => r.ch === expected);
  if (k < 0 || k > (o.top != null ? o.top : 2)) return best.ch;
  const e = ranked[k];
  const fold = c => c.normalize('NFD').replace(/[̀-ͯ]/g, '');
  const onlyCase = fold(best.ch).toLowerCase() === fold(expected).toLowerCase() && fold(best.ch) !== fold(expected);
  const onlyAccent = fold(best.ch) === fold(expected);
  if (onlyCase) return e.score <= best.score + 0.25 ? expected : best.ch;
  if (onlyAccent) return best.ch; // el acento lo decide el trazo, no la tolerancia
  return e.score <= best.score * (o.ratio || 1.25) + (o.add != null ? o.add : 0.4) ? expected : best.ch;
}

/* ============================================================
   INTERFAZ (solo en el navegador)
   ============================================================ */
const hasDOM = typeof document !== 'undefined';
const LETTERS_EN = 'abcdefghijklmnopqrstuvwxyz'.split('');
const LETTERS_ES = 'abcdefghijklmnñopqrstuvwxyz'.split('');
const ACCENTED = 'áéíóúü'.split('');

const CSS = `
.ew{margin-top:10px}
.ew-modes{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:12px}
.ew-modes button{border:none;border-radius:16px;padding:8px 16px;min-height:50px;font-size:20px;font-weight:bold;background:#eef2ff;color:#475569;box-shadow:0 3px 0 rgba(0,0,0,.08)}
.ew-modes button.on{background:#3b82f6;color:#fff}
.ew-boxes{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.ew-cell{display:flex;flex-direction:column;align-items:center;gap:4px}
.ew-cell canvas{display:block;background:#fff;border:3px solid #bfdbfe;border-radius:14px;touch-action:none;-webkit-user-select:none;user-select:none}
.ew-cell.active canvas{border-color:#3b82f6}
.ew-cell .ew-read{height:40px;min-width:40px;display:flex;align-items:center;justify-content:center;gap:4px;font-size:28px;font-weight:bold;color:#3b82f6}
.ew-cell .ew-read button{border:none;background:#f1f5f9;border-radius:10px;width:34px;height:34px;font-size:16px;color:#888}
.ew-gap{width:24px}
.ew-tools{display:flex;gap:10px;justify-content:center;margin-top:10px;flex-wrap:wrap}
.ew-tools button,.ew-key{border:none;border-radius:16px;min-height:56px;padding:0 18px;font-size:22px;font-weight:bold;background:#fff3c4;color:#1e293b;box-shadow:0 4px 0 rgba(0,0,0,.12)}
.ew-tools button:active,.ew-key:active{transform:translateY(3px);box-shadow:0 1px 0 rgba(0,0,0,.12)}
.ew-show{min-height:80px;display:flex;align-items:center;justify-content:center;font-size:44px;font-weight:bold;letter-spacing:4px;background:#fff;border:4px solid #bfdbfe;border-radius:20px;padding:6px 16px;margin:0 auto 12px;max-width:760px;word-break:break-all}
.ew-show .cur{display:inline-block;width:3px;height:44px;background:#3b82f6;margin-left:4px;animation:ewblink 1s steps(1) infinite}
@keyframes ewblink{50%{opacity:0}}
.ew-kb{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;max-width:820px;margin:0 auto}
.ew-kb .ew-key{min-width:66px;height:66px;padding:0;font-size:30px;background:#f1f5f9}
.ew-kb .ew-key.vowel{color:#14b8a6}
.ew-kb .ew-key.wide{min-width:120px;font-size:22px;background:#fff3c4}
.ew-kb .ew-key.on{background:#3b82f6;color:#fff}
.ew-np{display:grid;grid-template-columns:repeat(3,96px);gap:12px;justify-content:center}
.ew-np .ew-key{height:84px;font-size:40px;background:#f1f5f9}
.ew-np .ew-key.del{font-size:28px;background:#fff3c4}
.ew-note{text-align:center;color:#64748b;font-size:17px;margin-top:8px}
.ew.ew-nudge .ew-body{animation:ewshake .4s}
@keyframes ewshake{0%,100%{transform:translateX(0)}25%{transform:translateX(-10px)}75%{transform:translateX(10px)}}
.ew-empty{color:#c2410c;font-size:20px;font-weight:bold}
.ew.locked .ew-body,.ew.locked .ew-modes,.ew.locked .ew-tools{pointer-events:none;opacity:.6}
.ew-fab{position:fixed;left:12px;bottom:12px;z-index:40;border:none;border-radius:16px;padding:10px 16px;font:bold 18px -apple-system,system-ui,sans-serif;background:#fff3c4;color:#1e293b;box-shadow:0 3px 8px rgba(0,0,0,.2)}
@media (max-width:560px){.ew-fab{font-size:14px;padding:6px 10px;opacity:.9}}
.ew-sheet{position:fixed;inset:0;z-index:70;background:#fffef6;display:none;flex-direction:column}
.ew-sheet.open{display:flex}
.ew-sheet .bar{display:flex;gap:10px;align-items:center;padding:10px 14px;padding-top:max(10px,env(safe-area-inset-top));background:#fff3c4;flex-wrap:wrap}
.ew-sheet .bar b{flex:1;font-size:22px}
.ew-sheet .bar button{border:none;border-radius:14px;min-width:56px;height:56px;font-size:26px;background:#fff;box-shadow:0 3px 0 rgba(0,0,0,.12)}
.ew-sheet .bar button.on{outline:4px solid #3b82f6}
.ew-sheet canvas{flex:1;touch-action:none;display:block;width:100%;background-color:#fffef6;background-image:linear-gradient(#dbe7ff 1px,transparent 1px),linear-gradient(90deg,#dbe7ff 1px,transparent 1px);background-size:40px 40px}
`;

const PREF_KEY = 'escritura-modo-v2'; // v2: ✍️ Escribir vuelve a ser la opción inicial
const prefs = (() => { try { return JSON.parse(localStorage.getItem(PREF_KEY)) || {}; } catch (e) { return {}; } })();
const savePref = (k, v) => { prefs[k] = v; try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch (e) {} };

function el(tag, attrs, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(c));
  return e;
}
let cssDone = false;
function injectCSS() { if (cssDone || !hasDOM) return; cssDone = true; document.head.append(el('style', null, CSS)); }

/* ---------- Cajitas para escribir ---------- */
const BOX_H = 150, ASC = 28, BASE = 108; // renglón: arriba 28px, punteada 68px, abajo 108px
const toFrame = (y) => (y - ASC) / (BASE - ASC) * 100;
let penSeen = false; // si se usa Apple Pencil, ignoramos la palma de la mano

// o.h: alto (por defecto con renglones de cuaderno) · o.lines=false: sin renglones (casillas de números)
// o.onStart: se llama al empezar cada trazo
function makeBox(w, onChange, o) {
  o = o || {};
  const H = o.h || BOX_H, lines = o.lines !== false;
  const cv = el('canvas', { width: w, height: H });
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  cv.width = w * dpr; cv.height = H * dpr; cv.style.width = w + 'px'; cv.style.height = H + 'px';
  const ctx = cv.getContext('2d');
  ctx.scale(dpr, dpr);
  const box = { cv, strokes: [], ch: '', ranked: [] };
  let cur = null, pid = null;
  function redraw() {
    ctx.clearRect(0, 0, w, H);
    const line = (y, color, dash, lw) => { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(4, y); ctx.lineTo(w - 4, y); ctx.stroke(); ctx.restore(); };
    if (lines) {
      line(ASC, '#b9d4ff', [], 2);
      line((ASC + BASE) / 2, '#bfdbfe', [6, 6], 2);
      line(BASE, '#f87171', [], 3);
      line(BASE + (BASE - ASC) * 0.4, '#e3e3ee', [], 1.5);
    }
    ctx.strokeStyle = '#1e293b'; ctx.lineWidth = lines ? 5 : 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const s of box.strokes) {
      ctx.beginPath(); ctx.moveTo(s[0].x, s[0].y);
      if (s.length === 1) ctx.lineTo(s[0].x + 0.1, s[0].y);
      for (const p of s) ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
  }
  const pos = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * w / r.width, y: (e.clientY - r.top) * H / r.height }; };
  cv.addEventListener('pointerdown', e => {
    if (e.pointerType === 'pen') penSeen = true;
    else if (penSeen && e.pointerType === 'touch') return;
    if (pid !== null) return;
    e.preventDefault();
    pid = e.pointerId;
    try { cv.setPointerCapture(pid); } catch (err) {}
    if (o.onStart) o.onStart(box);
    cur = [pos(e)]; box.strokes.push(cur); redraw();
  });
  cv.addEventListener('pointermove', e => {
    if (e.pointerId !== pid || !cur) return;
    e.preventDefault();
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    for (const ev of (evs.length ? evs : [e])) cur.push(pos(ev));
    redraw();
  });
  const end = e => { if (e.pointerId !== pid) return; pid = null; cur = null; onChange(box); };
  cv.addEventListener('pointerup', end);
  cv.addEventListener('pointercancel', end);
  box.clear = () => { box.strokes = []; box.ch = ''; box.ranked = []; redraw(); };
  box.undo = () => { box.strokes.pop(); redraw(); };
  box.frameStrokes = lines
    ? () => box.strokes.map(s => s.map(p => ({ x: p.x * 100 / (BASE - ASC), y: toFrame(p.y) })))
    : () => box.strokes.map(s => s.map(p => ({ x: p.x * 100 / (H * 0.8), y: (p.y - H * 0.1) * 100 / (H * 0.8) })));
  redraw();
  return box;
}

// layout: palabra para dibujar las cajitas (con huecos en los espacios) o null = boxesN cajitas libres.
// expected: letras esperadas (sin espacios) para la tolerancia, o null.
// isRight(valor): ¿la respuesta ya es correcta? · submit(): revisar (como tocar Comprobar)
function writeMode({ layout, expected, allowed, setValue, boxesN, isRight, submit, exam }) {
  let autoTimer = null;
  const cancelAuto = () => { clearTimeout(autoTimer); autoTimer = null; };
  const target = layout;
  const chars = layout ? [...layout] : Array(boxesN).fill('?');
  const wrap = el('div', { class: 'ew-boxes' });
  const avail = Math.min((hasDOM ? window.innerWidth : 900) - 90, 860);
  const letters = chars.filter(c => c !== ' ').length;
  let bw = Math.floor((avail - letters * 10) / Math.max(letters, 1));
  bw = Math.max(64, Math.min(92, bw));
  const boxes = [];
  let last = null;
  function refresh() {
    // Se arma la respuesta con las cajitas que tienen algo, en orden
    const filled = boxes.filter(b => b.strokes.length);
    let k = 0;
    const exp = expected ? [...expected].filter(c => c !== ' ') : [];
    for (const b of boxes) {
      if (!b.strokes.length) { b.ch = ''; continue; }
      b.ch = decide(b.ranked, exp[k] || null);
      k++;
    }
    boxes.forEach(b => { b.readEl.firstChild.textContent = b.ch || ' '; b.readEl.lastChild.style.visibility = b.strokes.length ? 'visible' : 'hidden'; });
    // reconstruye con espacios donde el objetivo tiene espacios
    let out = '';
    if (target && filled.length === boxes.length) {
      let j = 0;
      for (const c of chars) out += c === ' ' ? ' ' : boxes[j++].ch;
    } else out = boxes.map(b => b.ch).join('');
    setValue(out);
    // Si ya está correcta, se revisa sola (sin tocar Comprobar). Si no, esperamos: puede corregir.
    // En EXAMEN no: revisarse sola le diría que ya está bien; tiene que tocar Comprobar.
    cancelAuto();
    if (!exam && out && isRight && submit && isRight(out)) autoTimer = setTimeout(() => { autoTimer = null; submit(); }, 650);
  }
  chars.forEach(c => {
    if (c === ' ') { wrap.append(el('div', { class: 'ew-gap' })); return; }
    const cell = el('div', { class: 'ew-cell' });
    const box = makeBox(bw, b => {
      last = b;
      boxes.forEach(x => x.cell.classList.toggle('active', x === b));
      b.ranked = recognize(b.frameStrokes(), allowed);
      refresh();
    }, { onStart: cancelAuto });
    box.cell = cell;
    box.readEl = el('div', { class: 'ew-read' }, el('span', null, ' '),
      el('button', { 'aria-label': 'Borrar esta letra', onclick: () => { box.clear(); refresh(); } }, '✖'));
    cell.append(box.cv, box.readEl);
    boxes.push(box);
    wrap.append(cell);
  });
  const tools = el('div', { class: 'ew-tools' },
    el('button', { onclick: () => { const b = last && last.strokes.length ? last : [...boxes].reverse().find(x => x.strokes.length); if (b) { b.undo(); b.ranked = recognize(b.frameStrokes(), allowed); refresh(); } } }, '↶ Deshacer'),
    el('button', { onclick: () => { boxes.forEach(b => b.clear()); refresh(); } }, '🧽 Borrar todo'));
  const note = el('div', { class: 'ew-note' }, expected && /^\d+$/.test(expected) ? 'Un número en cada cajita ✍️ · Si está bien, se revisa solito ✨' : 'Una letra en cada cajita ✍️ · Las minúsculas llegan a la línea punteada; las MAYÚSCULAS, hasta arriba. Si está bien, se revisa solito ✨');
  refresh();
  return el('div', null, wrap, tools, note);
}

/* ---------- Teclado ABC ---------- */
function lettersMode({ lang, needsSpace, setValue, initial }) {
  let text = initial || '', shift = false;
  const show = el('div', { class: 'ew-show' });
  const kb = el('div', { class: 'ew-kb' });
  const letters = lang === 'es' ? LETTERS_ES : LETTERS_EN;
  function draw() {
    show.innerHTML = ''; show.append(text, el('span', { class: 'cur' }));
    kb.querySelectorAll('[data-l]').forEach(k => { k.textContent = shift ? k.dataset.l.toUpperCase() : k.dataset.l; });
    shiftKey.classList.toggle('on', shift);
    setValue(text);
  }
  const type = c => { text += shift ? c.toUpperCase() : c; shift = false; draw(); };
  letters.forEach(l => kb.append(el('button', { class: 'ew-key' + ('aeiou'.includes(l) ? ' vowel' : ''), 'data-l': l, onclick: () => type(l) }, l)));
  const shiftKey = el('button', { class: 'ew-key wide', onclick: () => { shift = !shift; draw(); } }, '⇧ Mayúscula');
  kb.append(shiftKey);
  if (lang === 'es') kb.append(el('button', { class: 'ew-key wide', onclick: () => {
    const c = text.slice(-1); if (!c) return;
    const plain = c.normalize('NFD').replace(/[́]/g, '').normalize('NFC');
    const acc = { a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú', A: 'Á', E: 'É', I: 'Í', O: 'Ó', U: 'Ú' }[plain];
    if (!acc) return;
    text = text.slice(0, -1) + (c === acc ? plain : acc); draw();
  } }, '´ Acento'));
  if (needsSpace) kb.append(el('button', { class: 'ew-key wide', onclick: () => { text += ' '; draw(); } }, '␣ Espacio'));
  kb.append(el('button', { class: 'ew-key wide', onclick: () => { text = [...text].slice(0, -1).join(''); draw(); } }, '⌫ Borrar'));
  draw();
  return el('div', null, show, kb);
}

/* ---------- Teclado numérico ---------- */
function numbersMode({ setValue, initial }) {
  let text = initial || '';
  const show = el('div', { class: 'ew-show' });
  const draw = () => { show.innerHTML = ''; show.append(text, el('span', { class: 'cur' })); setValue(text); };
  const np = el('div', { class: 'ew-np' });
  '123456789'.split('').forEach(d => np.append(el('button', { class: 'ew-key', onclick: () => { if (text.length < 7) { text += d; draw(); } } }, d)));
  np.append(el('button', { class: 'ew-key del', onclick: () => { text = text.slice(0, -1); draw(); } }, '⌫'),
    el('button', { class: 'ew-key', onclick: () => { if (text.length < 7) { text += '0'; draw(); } } }, '0'),
    el('button', { class: 'ew-key del', onclick: () => { text = ''; draw(); } }, '🧽'));
  draw();
  return el('div', null, show, np);
}

/* ---------- Pad principal ---------- */
const MODE_LABEL = { write: '✍️ Escribir', letters: '🔤 Letras', numbers: '🔢 Números', keyboard: '⌨️ Teclado' };

function pad({ q, input, lang, typebox, submit, exam }) {
  injectCSS();
  const answers = (q.answer || []).map(String);
  const numeric = !!(q.numeric || q.inputmode === 'numeric');
  const target = numeric ? (answers.find(a => /^\d+$/.test(a)) || null) : (q.anyOf ? null : answers[0]);
  const long = !numeric && (q.sentence || answers.some(a => a.length > 16 || (a.match(/ /g) || []).length > 1));
  if (long) return typebox;

  const sameLen = answers.every(a => a.length === answers[0].length);
  const kind = numeric ? 'number' : 'word';
  const modes = numeric ? ['write', 'numbers', 'keyboard'] : ['write', 'letters', 'keyboard'];
  let mode = modes.includes(prefs[kind]) ? prefs[kind] : modes[0];

  const langChars = numeric ? '0123456789'.split('')
    : [...(lang === 'es' ? LETTERS_ES : LETTERS_EN), ...(lang === 'es' ? ACCENTED : [])];
  const allowed = new Set([...langChars, ...(numeric ? [] : langChars.map(c => c.toUpperCase()))]);
  if (target) for (const c of target) if (c !== ' ') allowed.add(c);

  const root = el('div', { class: 'ew' });
  const bar = el('div', { class: 'ew-modes' });
  const body = el('div', { class: 'ew-body' });
  const setValue = v => { input.value = v; };

  function render() {
    bar.innerHTML = '';
    modes.forEach(m => bar.append(el('button', { class: m === mode ? 'on' : '', onclick: () => { if (m === mode) return; mode = m; savePref(kind, m); input.value = ''; render(); } }, MODE_LABEL[m])));
    body.innerHTML = '';
    if (mode === 'keyboard') {
      body.append(typebox, el('div', { class: 'ew-note' }, '✏️ Con Apple Pencil también puedes escribir directo en la cajita.'));
      setTimeout(() => { try { input.focus({ preventScroll: true }); } catch (e) {} }, 50);
    } else {
      try { input.blur(); } catch (e) {}
      if (mode === 'write') body.append(writeMode({
        layout: !numeric && target && sameLen ? target : null,
        expected: target && (numeric || sameLen) ? target : null,
        boxesN: numeric ? Math.max((target || '').length, 3) : Math.max(...answers.map(a => a.length), 4),
        allowed, setValue, exam: !!exam, submit: submit && (() => { if (!input.disabled) submit(); }),
        // Solo coincidencia exacta (mayúsculas y acentos incluidos) se revisa sola
        isRight: v => (numeric ? [target] : answers).some(a => a != null && a.trim() === v.trim()),
      }));
      if (mode === 'letters') body.append(lettersMode({ lang, needsSpace: !!q.anyOf || answers.some(a => a.includes(' ')), setValue }));
      if (mode === 'numbers') body.append(numbersMode({ setValue }));
    }
  }
  root.append(bar, body);
  render();
  // Si tocan "Comprobar" sin escribir nada, la página intenta enfocar el input: en vez de eso avisamos
  const born = Date.now();
  input.focus = function (o) {
    if (mode === 'keyboard') return HTMLInputElement.prototype.focus.call(this, o);
    if (!input.value && Date.now() - born > 600) {
      root.classList.remove('ew-nudge'); void root.offsetWidth; root.classList.add('ew-nudge');
      let n = root.querySelector('.ew-empty');
      if (!n) { n = el('div', { class: 'ew-note ew-empty' }, mode === 'numbers' ? 'Primero toca los números de tu respuesta 👆' : 'Primero escribe tu respuesta ✍️'); root.append(n); }
      setTimeout(() => n.remove(), 2200);
    }
  };
  // Cuando la página desactiva el input (pregunta terminada), bloqueamos el pad
  new MutationObserver(() => root.classList.toggle('locked', input.disabled)).observe(input, { attributes: true, attributeFilter: ['disabled'] });
  return root;
}

/* ---------- Borrador flotante ---------- */
function borrador() {
  if (!hasDOM) return;
  injectCSS();
  const sheet = el('div', { class: 'ew-sheet' });
  const cv = el('canvas');
  let color = '#1e293b', erasing = false, ctx, pid = null, lastP = null;
  function size() {
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const r = cv.getBoundingClientRect();
    const old = cv.width ? cv.toDataURL() : null;
    cv.width = r.width * dpr; cv.height = r.height * dpr;
    ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);
    grid(r.width, r.height);
    if (old) { const im = new Image(); im.onload = () => ctx.drawImage(im, 0, 0, r.width, r.height); im.src = old; }
  }
  // La cuadrícula es el fondo (CSS) de la hoja: el canvas solo guarda lo dibujado,
  // así la goma borra de verdad y la cuadrícula se sigue viendo.
  function grid(w, h) { ctx.clearRect(0, 0, w, h); }
  const pos = e => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  cv.addEventListener('pointerdown', e => { if (e.pointerType === 'pen') penSeen = true; else if (penSeen && e.pointerType === 'touch') return; if (pid !== null) return; e.preventDefault(); pid = e.pointerId; try { cv.setPointerCapture(pid); } catch (err) {} lastP = pos(e); });
  cv.addEventListener('pointermove', e => {
    if (e.pointerId !== pid) return; e.preventDefault();
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    for (const ev of (evs.length ? evs : [e])) {
      const p = pos(ev);
      ctx.save();
      if (erasing) { ctx.globalCompositeOperation = 'destination-out'; ctx.strokeStyle = '#000'; ctx.lineWidth = 36; } else { ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = color; ctx.lineWidth = 5; }
      ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(lastP.x, lastP.y); ctx.lineTo(p.x, p.y); ctx.stroke(); ctx.restore();
      lastP = p;
    }
  });
  const end = e => { if (e.pointerId === pid) pid = null; };
  cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
  const tools = [];
  const tool = (label, fn, aria) => { const b = el('button', { 'aria-label': aria, onclick: () => fn(b) }, label); tools.push(b); return b; };
  const pick = (b) => { tools.forEach(t => t.classList.remove('on')); b.classList.add('on'); };
  const black = tool('✏️', b => { color = '#1e293b'; erasing = false; pick(b); }, 'Lápiz');
  const bar = el('div', { class: 'bar' }, el('b', null, '✏️ Mi borrador'),
    black,
    tool('🔴', b => { color = '#ef4444'; erasing = false; pick(b); }, 'Rojo'),
    tool('🔵', b => { color = '#2196f3'; erasing = false; pick(b); }, 'Azul'),
    tool('🧽', b => { erasing = true; pick(b); }, 'Goma'),
    el('button', { 'aria-label': 'Borrar todo', onclick: () => { const r = cv.getBoundingClientRect(); grid(r.width, r.height); } }, '🗑️'),
    el('button', { 'aria-label': 'Cerrar', onclick: () => sheet.classList.remove('open') }, '✖'));
  black.classList.add('on');
  sheet.append(bar, cv);
  const fab = el('button', { class: 'ew-fab', onclick: () => { sheet.classList.add('open'); if (!ctx || Math.abs(cv.getBoundingClientRect().width * Math.min(window.devicePixelRatio || 1, 3) - cv.width) > 2) size(); } }, '✏️ Borrador');
  window.addEventListener('resize', () => { if (sheet.classList.contains('open')) size(); });
  const add = () => document.body.append(fab, sheet);
  if (document.body) add(); else document.addEventListener('DOMContentLoaded', add);
}

/* ---------- iPhone/iPad: botones al primer toque con el teclado abierto ----------
   Con el teclado del iPad/iPhone abierto, el primer toque en un botón solo cerraba el
   teclado, la página brincaba hacia arriba y había que tocar otra vez. Si el toque fue
   un "tap" (no un deslizamiento), lo ejecutamos directamente sin quitar el foco. */
if (hasDOM && 'ontouchstart' in window) {
  let sx = 0, sy = 0, moved = false;
  document.addEventListener('touchstart', e => { const t = e.touches[0]; sx = t.clientX; sy = t.clientY; moved = false; }, { passive: true, capture: true });
  document.addEventListener('touchmove', e => { const t = e.touches[0]; if (Math.abs(t.clientX - sx) > 10 || Math.abs(t.clientY - sy) > 10) moved = true; }, { passive: true, capture: true });
  document.addEventListener('touchend', e => {
    const a = document.activeElement;
    if (moved || !a || !/^(INPUT|TEXTAREA)$/.test(a.tagName)) return;
    const b = e.target.closest && e.target.closest('button');
    if (!b || b.disabled || e.changedTouches.length !== 1) return;
    e.preventDefault();
    b.click();
  }, { passive: false, capture: true });
}

const api = { pad, borrador, recognize, decide, parseDSL, TEMPLATES, inkBox: makeBox, css: injectCSS };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
root.Escritura = api;
})(typeof window !== 'undefined' ? window : globalThis);
