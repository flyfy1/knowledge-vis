const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
for (const file of ['index.html', 'style.css', 'i18n.js', 'app.js', 'BRIEF.md']) {
  if (!fs.existsSync(path.join(root, file))) throw new Error(`missing ${file}`);
}
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const id of ['latitudeCanvas', 'latitude', 'albedoCanvas', 'albedo', 'greenhouseCanvas', 'greenhouse', 'evidence']) {
  if (!html.includes(`id="${id}"`)) throw new Error(`missing control ${id}`);
}
const js = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
for (const token of ['Math.cos', 'reflected', 'absorbed', 'greenhouse', 'effectiveTemp', 'shuffle']) {
  if (!js.includes(token)) throw new Error(`missing interaction token ${token}`);
}
const i18n = fs.readFileSync(path.join(root, 'i18n.js'), 'utf8');
for (const token of ['knowledge-lang', "window.setLang", 'latitude', 'greenhouse']) {
  if (!i18n.includes(token)) throw new Error(`missing bilingual token ${token}`);
}
console.log('climate energy: structural checks passed');
