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
function write(list) { try { localStorage.setItem(KEY, JSON.stringify(list.slice(-MAX))); } catch (e) {} }
const clean = s => String(s == null ? '' : s).replace(/\s+/g, ' ').trim().slice(0, 300);
function log(e) {
  const list = read();
  const item = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), t: Date.now(),
    materia: clean(e.materia), tema: clean(e.tema), pregunta: clean(e.pregunta), respuesta: clean(e.respuesta),
    correcta: clean(e.correcta), modo: e.modo === 'examen' ? 'examen' : 'práctica', visto: false };
  // Evita duplicar exactamente el mismo error seguido (p. ej. dos toques rápidos)
  const last = list[list.length - 1];
  if (last && last.pregunta === item.pregunta && last.respuesta === item.respuesta && item.t - last.t < 3000) return;
  list.push(item); write(list);
}
function mark(id, visto) { const list = read(); const it = list.find(x => x.id === id); if (it) { it.visto = visto; write(list); } }
function remove(pred) { write(read().filter(x => !pred(x))); }
const pending = () => read().filter(x => !x.visto).length;
root.Errores = { log, list: read, mark, remove, pending };
})(typeof window !== 'undefined' ? window : globalThis);
