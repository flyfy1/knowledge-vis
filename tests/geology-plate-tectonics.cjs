const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..', 'geology-plate-tectonics');
for (const file of ['index.html', 'style.css', 'i18n.js', 'app.js', 'BRIEF.md']) {
  if (!fs.existsSync(path.join(root, file))) throw new Error(`missing ${file}`);
}
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const id of ['map', 'boundary', 'profile', 'time', 'speed', 'heat', 'evidence']) {
  if (!html.includes(`id="${id}"`)) throw new Error(`missing control ${id}`);
}
const js = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
for (const token of ['divergent', 'convergent', 'transform', 'spreadVal', 'shuffle']) {
  if (!js.includes(token)) throw new Error(`missing interaction token ${token}`);
}
console.log('geology plate tectonics: structural checks passed');
