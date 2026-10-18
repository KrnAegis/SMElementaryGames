#!/usr/bin/env python3
"""Build the portable HTML distribution without third-party dependencies."""
from pathlib import Path
root = Path(__file__).resolve().parent
src = root / 'src'
html = (src / 'index.template.html').read_text(encoding='utf-8')
html = html.replace('<link rel="stylesheet" href="styles.css">', '<style>\n' + (src / 'styles.css').read_text(encoding='utf-8') + '\n</style>')
for name in ['questions.js', 'engine.js', 'app.js']:
    code = (src / name).read_text(encoding='utf-8').replace('</script', '<\\/script')
    html = html.replace(f'<script src="{name}"></script>', '<script>\n' + code + '\n</script>')
(root / 'index.html').write_text(html, encoding='utf-8')
print(f'Built index.html ({len(html.encode("utf-8")):,} bytes)')
