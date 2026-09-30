#!/usr/bin/env python3
"""Genera /workspace/site/sw.js: lista de archivos + VERSION = hash del contenido.
Correr después de cualquier cambio (y antes de commit). `--check` sale con 1 si sw.js está desactualizado."""
import hashlib, os, sys
HERE = os.path.dirname(os.path.realpath(__file__))
SITE = os.environ.get('SITE', os.path.dirname(HERE))
SKIP = {'.nojekyll', 'sw.js', 'README.md'}
files = []
for root, dirs, fs in os.walk(SITE):
    dirs[:] = sorted(d for d in dirs if not d.startswith('.') and not (root == SITE and d == 'tools'))
    for f in sorted(fs):
        rel = os.path.relpath(os.path.join(root, f), SITE)
        if f in SKIP or f.startswith('.'): continue
        files.append(rel)
h = hashlib.sha256()
for rel in files:
    h.update(rel.encode()); h.update(open(os.path.join(SITE, rel), 'rb').read())
version = h.hexdigest()[:12]
urls = ['./'] + [('./' + r[:-len('index.html')]) if r.endswith('index.html') else './' + r for r in files if r != 'index.html']
tpl = open(os.path.join(HERE, 'sw.template.js')).read()
out = tpl.replace('__VERSION__', version).replace('__FILES__', ',\n  '.join(repr(u).replace("'", '"') for u in urls))
path = os.path.join(SITE, 'sw.js')
if '--check' in sys.argv:
    cur = open(path).read() if os.path.exists(path) else ''
    print('sw.js up to date' if cur == out else 'sw.js OUTDATED'); sys.exit(0 if cur == out else 1)
open(path, 'w').write(out)
print('sw.js version', version, len(urls), 'files')
