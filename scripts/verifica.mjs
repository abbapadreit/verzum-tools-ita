import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
const base = new URL('../public/', import.meta.url);
const html = readFileSync(new URL('index.html', base), 'utf8');
assert.match(html, /lang="it"/, 'Lingua italiana');
for (const file of ['style.css', 'app.js', 'advanced.js', 'release.js', 'robots.txt']) {
  const path = new URL(file, base);
  assert.ok(existsSync(path), `File mancante: ${file}`);
  if (file.endsWith('.js')) execFileSync(process.execPath, ['--check', path.pathname]);
}
for (const attr of ['href="style.css"','src="release.js"','src="app.js"','src="advanced.js"']) {
  assert.ok(html.includes(attr), `Riferimento HTML mancante: ${attr}`);
}
for (const page of ['upgrade','gaya','pet','mount','costume','skills','passive','planner','prices','catalog']) {
  assert.ok(html.includes(`data-nav="${page}"`), `Pulsante mancante: ${page}`);
}
console.log('OK: 6 file pubblici; JavaScript valido; 10 sezioni presenti; collegamenti HTML verificati.');
