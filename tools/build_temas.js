// Generates /workspace/site/comun/temas.js (topic catalog for the landing's stars summary).
// Re-run after adding/removing topics:  cd /workspace/pwtest && node /workspace/tools/build_temas.js
// Needs Playwright + Chrome (npm i playwright).
const path = require('path');
let pw; try { pw = require('playwright'); } catch (e) { pw = require('/workspace/pwtest/node_modules/playwright'); }
const SITE = path.resolve(__dirname, '..');
const fs = require('fs');
(async () => {
  const b = await pw.chromium.launch(fs.existsSync('/usr/bin/google-chrome') ? { executablePath: '/usr/bin/google-chrome' } : {});
  const p = await b.newPage();
  const out = {}, secs = {};
  for (const sub of ['ingles', 'espanol', 'matematicas']) {
    await p.goto('file://' + SITE + '/' + sub + '/index.html');
    out[sub] = await p.evaluate(sub => sub === 'matematicas'
      ? TOPICS.filter(t => t.kind !== 'demo').map(t => ({ id: t.id, sec: t.sec, t: t.t, e: t.e, k: t.kind === 'reloj' ? 'reloj' : undefined }))
      : TOPICS.map(t => ({ id: t.id, sec: t.section, t: t.title, e: t.emoji })), sub);
    secs[sub] = await p.evaluate(() => SECTIONS.map(s => { const m = /^(\S+)\s+(.*)$/.exec(s.name); return s.emoji ? { id: s.id, n: s.name, e: s.emoji } : { id: s.id, n: m ? m[2] : s.name, e: m ? m[1] : '📘' }; }));
  }
  await b.close();
  const js = '/* Generado por tools/build_temas.js: catálogo de temas para las estrellas del inicio. No editar a mano. */\n' +
    'window.TEMAS = ' + JSON.stringify(out) + ';\n' +
    'window.TEMAS_SECS = ' + JSON.stringify(secs) + ';\n' +
    "window.TEMAS_KEYS = { ingles: 'mi-examen-ingles-v1', espanol: 'mi-examen-espanol-v1', matematicas: 'mi-examen-mate-v1' };\n";
  fs.writeFileSync(SITE + '/comun/temas.js', js);
  console.log(Object.entries(out).map(([k, v]) => k + ':' + v.length).join(' '), js.length + ' bytes');
})();
