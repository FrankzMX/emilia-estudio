/* 📚 Biblioteca de temas (todo el año): todas las materias → bloques → temas, con sus estrellas.
   Sale sola del catálogo comun/temas.js (que se genera de las páginas con tools/build_temas.js):
   al agregar un tema nuevo en una página y regenerar el catálogo, aparece aquí sin tocar nada más.
   Biblioteca.render() -> nodo */
(function () {
  if (typeof document === 'undefined') return;
  const SUBJ = [
    { pg: 'espanol', n: '🇲🇽 Español', c: '#ef4444' },
    { pg: 'ingles', n: '🇺🇸 Inglés', c: '#3b82f6' },
    { pg: 'matematicas', n: '🧮 Matemáticas', c: '#16a34a' },
  ];
  const el = (tag, cls, ...kids) => { const e = document.createElement(tag); if (cls) e.className = cls; kids.flat().forEach(k => k != null && k !== false && e.append(k)); return e; };
  const CSS = `
.bb{width:min(900px,100%);box-sizing:border-box}
.bb h2{text-align:center;font-size:1.7em;margin:6px 0 4px}.bb .info{text-align:center;color:#555;margin:0 0 12px}
.bb-weak{background:#fff;border-radius:20px;padding:12px 14px;margin-bottom:14px;box-shadow:0 4px 12px rgba(0,0,0,.06)}
.bb-weak b{display:block;margin-bottom:8px;font-size:1.1em}
.bb-chips{display:flex;flex-wrap:wrap;gap:8px}.bb-chips a{background:#fef3c7;border-radius:14px;padding:8px 12px;color:#1e293b;text-decoration:none;font-weight:600}
.bb-subj{background:#fff;border-radius:22px;margin-bottom:14px;box-shadow:0 4px 12px rgba(0,0,0,.06);overflow:hidden}
.bb-subj>h3{margin:0;padding:12px 16px;color:#fff;font-size:1.35em;display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap}
.bb-subj>h3 a{color:#fff;text-decoration:none}.bb-subj>h3 small{font-size:.65em;font-weight:600;opacity:.95}
.bb-sec{border-top:1px solid #f1f5f9}.bb-sec summary{padding:12px 16px;font-weight:700;font-size:1.1em;cursor:pointer;display:flex;justify-content:space-between;gap:8px;min-height:28px}
.bb-sec summary small{font-weight:600;color:#64748b}
.bb-list{padding:0 12px 12px;display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:6px}
.bb-list a{display:flex;justify-content:space-between;gap:8px;background:#f8fafc;border-radius:12px;padding:10px 12px;color:#1e293b;text-decoration:none}
.bb-list .sv{white-space:nowrap}`;
  let cssDone = false;
  const css = () => { if (cssDone) return; cssDone = true; const s = document.createElement('style'); s.textContent = CSS; document.head.append(s); };
  const stars = s => '⭐'.repeat(s) + '☆'.repeat(3 - s);
  function render() {
    css();
    const root = el('section', 'bb', el('h2', null, '📚 Biblioteca de temas'), el('p', 'info', 'Todos los temas del libro, para practicar cuando quieras. Toca una materia o un tema.'));
    if (!window.TEMAS) return root;
    const all = [];
    SUBJ.forEach(S => {
      const topics = (TEMAS[S.pg] || []).filter(t => t.k !== 'reloj');
      let prog = {}; try { prog = JSON.parse(localStorage.getItem(TEMAS_KEYS[S.pg])) || {}; } catch (e) {}
      const secs = (window.TEMAS_SECS && TEMAS_SECS[S.pg]) || [...new Set(topics.map(t => t.sec))].map(id => ({ id, n: id, e: '📘' }));
      const full = topics.filter(t => (prog[t.id] || 0) === 3).length;
      const card = el('div', 'bb-subj');
      const h = el('h3', null, (() => { const a = el('a', null, S.n); a.href = S.pg + '/'; return a; })(), el('small', null, `${full} de ${topics.length} temas con ⭐⭐⭐`));
      h.style.background = S.c;
      card.append(h);
      secs.forEach(sec => {
        const ts = topics.filter(t => t.sec === sec.id);
        if (!ts.length) return;
        const got = ts.reduce((s, t) => s + (prog[t.id] || 0), 0);
        const d = el('details', 'bb-sec', el('summary', null, el('span', null, sec.e + ' ' + sec.n), el('small', null, `${ts.length} temas · ${got}/${ts.length * 3} ⭐`)));
        d.append(el('div', 'bb-list', ts.map(t => { const s = prog[t.id] || 0; all.push({ S, t, s, tried: prog[t.id] != null }); const a = el('a', null, el('span', null, t.e + ' ' + t.t), el('span', 'sv', stars(s))); a.href = S.pg + '/#tema-' + encodeURIComponent(t.id); return a; })));
        card.append(d);
      });
      root.append(card);
    });
    // ⭐ Para mejorar: los que ya intentó con menos estrellas
    const weak = all.filter(x => x.tried && x.s < 3).sort((a, b) => a.s - b.s).slice(0, 6);
    if (weak.length) {
      const box = el('div', 'bb-weak', el('b', null, '🎯 Para mejorar (los temas con menos estrellas)'), el('div', 'bb-chips', weak.map(x => { const a = el('a', null, x.t.e + ' ' + x.t.t + ' ' + stars(x.s)); a.href = x.S.pg + '/#tema-' + encodeURIComponent(x.t.id); return a; })));
      root.insertBefore(box, root.children[2]);
    }
    return root;
  }
  window.Biblioteca = { render };
})();
