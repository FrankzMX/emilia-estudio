# Mi Examen · 2° (study site)

A static site (plain HTML + JS, no build step) for practicing 2nd-grade AMCO topics on an iPad.
Published with GitHub Pages from the `main` branch.

## Structure
- `index.html`: home page (exam calendar, 📅 Repaso, ⭐ stars, 🗓️ streak, 👨‍👩‍👧 Modo papá, 📚 Biblioteca).
- `matematicas/`, `ingles/`, `espanol/`: one page per subject. Each has a `SECTIONS` list (blocks) and a `TOPICS` list (topics).
- `repasar/`: "Errores para repasar". `respaldo/`: loads a progress backup (opened from the QR).
- `comun/`: shared code (voice, column arithmetic, handwriting, errors, exam mode, printable sheets, progress, backup, library, service worker registration).
- `sw.js`: offline service worker (generated).

## Adding a book topic
1. In the subject page, add an entry to `TOPICS` with a new unique `id` and the `section`/`sec` of an existing block (or add a block to `SECTIONS`).
   - Inglés/Español: `{ id, section, title, emoji, es, pages, explain: () => …, practice: () => [questions], exam: () => [questions] }`.
     Question types: `mc` (options), `type` (write), `order` (tiles), `tap` (pick words), `say`, `think`, `column`.
   - Matemáticas: `{ id, sec, t, s, e, c, kind: 'col' | 'mental' | 'razon', gen: () => … }`.
2. Regenerate the catalog (home stars + library): `node tools/build_temas.js` (it writes `comun/temas.js`).
3. Regenerate the service worker: `python3 tools/build_sw.py` (changes the version so iPads update).
4. Test on an iPad-sized browser and publish.

The 📚 Biblioteca, ⭐ stars, 🖨️ printable sheets, exams, and Modo papá all read from `TOPICS`/`temas.js`, so a new topic shows up everywhere automatically.
When the next exam dates are known, update the calendar days (`.day[data-date]`) in `index.html`. Once every date has passed, the home page switches to the Biblioteca on its own.

Progress (stars, errors, streak, time) is stored only on each device (localStorage). To move it to another device, use Modo papá → 💾 Respaldo.
