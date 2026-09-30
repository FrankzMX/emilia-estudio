/* ============================================================
   ERRORES PARA REPASAR
   Guarda en este dispositivo cada error (materia, tema, pregunta,
   lo que contestó y lo correcto) para que papá/mamá lo revisen con
   la niña/el niño en /repasar/.
   Uso: Errores.log({ materia, tema, pregunta, respuesta, correcta, modo })
   ============================================================ */
(function (root) {
'use strict';
const KEY = 'mi-examen-errores-v1', MAX = 400;
function read() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
function write(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {} }
const clean = s => String(s == null ? '' : s).replace(/\s+/g, ' ').trim().slice(0, 300);
// Datos extra para volver a preguntar en /repasar/ (🎯 Practicar mis errores)
function extra(e) {
  const x = {};
  if (Array.isArray(e.opciones) && e.opciones.length > 1) { x.opciones = e.opciones.slice(0, 8).map(clean); if (e.oi >= 0) x.oi = e.oi; }
  if (Array.isArray(e.answers) && e.answers.length) x.answers = e.answers.slice(0, 12).map(clean);
  if (e.col && typeof e.col.a === 'number') x.col = { a: e.col.a, b: e.col.b, op: e.col.op === '-' ? '-' : '+' };
  if (e.say) x.say = clean(e.say);
  if (e.tipo) x.tipo = clean(e.tipo);
  if (e.numeric) x.numeric = true;
  if (e.cs) x.cs = true;
  if (e.accent) x.accent = true;
  return x;
}
// Se guarda solo la respuesta FINAL equivocada de cada pregunta (la página llama log() una vez).
// Si la misma pregunta ya está pendiente, se actualiza (veces + 1) en lugar de duplicarla.
function log(e) {
  const list = read();
  const item = Object.assign({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), t: Date.now(),
    materia: clean(e.materia), tema: clean(e.tema), pregunta: clean(e.pregunta), respuesta: clean(e.respuesta),
    correcta: clean(e.correcta), modo: e.modo === 'examen' ? 'examen' : 'práctica', visto: false, veces: 1 }, extra(e));
  const i = list.findIndex(x => !x.visto && x.materia === item.materia && x.pregunta === item.pregunta && x.correcta === item.correcta);
  if (i >= 0) {
    const old = list.splice(i, 1)[0];
    item.id = old.id; item.veces = (old.veces || 1) + 1;
  }
  list.push(item);
  // Tope: primero se van los ya repasados más viejos, luego los pendientes más viejos
  while (list.length > MAX) { const j = list.findIndex(x => x.visto); list.splice(j >= 0 ? j : 0, 1); }
  write(list);
}
function mark(id, visto) { const list = read(); const it = list.find(x => x.id === id); if (it) { it.visto = visto; write(list); } }
function remove(pred) { write(read().filter(x => !pred(x))); }
const pending = () => read().filter(x => !x.visto).length;
const get = id => read().find(x => x.id === id);
root.Errores = { log, list: read, mark, remove, pending, get };
})(typeof window !== 'undefined' ? window : globalThis);
