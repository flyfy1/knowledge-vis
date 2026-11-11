// Review test (Claude Code, 2026-11-11): page pipeline vs plain definition, snapshots, source parity, copy keys.
const assert = require('assert'), path = require('path'), fs = require('fs');
const M = require('../core.js'), R = path.resolve(__dirname, '..');
let seed = 1159; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
let cases = 0;
for (let k = 0; k < 3000; k++) {
  const nu = 1 + Math.floor(rnd() * 6), users = Array.from({length: nu}, (_, i) => [i + 1, M.BRANDS[Math.floor(rnd() * 3)]]), orders = [];
  for (let u = 1; u <= nu + 1; u++) { const days = [...Array(20).keys()].sort(() => rnd() - .5).slice(0, Math.floor(rnd() * 5)); days.forEach(d => orders.push([0, `2024-01-${String(d + 1).padStart(2, '0')}`, 10 + Math.floor(rnd() * 3), 1, u])); }
  orders.sort(() => rnd() - .5); orders.forEach((o, i) => { o[0] = i + 1; });
  const d = {users, items: [[10, 'Kiwi'], [11, 'Lumo'], [12, 'Nova']], orders};
  const r = M.pipeline(d);
  assert.deepStrictEqual(r.output, M.answer(d));
  // snapshot independence
  const s = JSON.stringify(r.frames[1]); if (r.frames.at(-1).ranked[0]) r.frames.at(-1).ranked[0].sale_rank = 99; assert.equal(JSON.stringify(r.frames[1]), s);
  cases++;
}
assert.deepStrictEqual(M.answer(M.MAIN), [[1, 'yes'], [2, 'no'], [3, 'yes'], [4, 'no']]);
assert.deepStrictEqual(M.answer(M.PREDICT), [[7, 'no']]);
assert.deepStrictEqual(M.pipeline(M.MAIN, {order: 'id', join: 'left', filter: 'on'}).output.find(x => x[0] === 3), [3, 'no']);
assert.equal(M.pipeline(M.MAIN, {order: 'date', join: 'inner', filter: 'on'}).output.length, 2);
assert.equal(M.pipeline(M.MAIN, {order: 'date', join: 'left', filter: 'where'}).output.length, 2);
assert.equal(M.variantSql(M.CORRECT), fs.readFileSync(path.join(R, 'solution.sql'), 'utf8'));
global.window = {}; require(path.join(R, 'sql-code.js'));
assert.equal(window.SQL_SOURCE, fs.readFileSync(path.join(R, 'solution.sql'), 'utf8'));
require(path.join(R, 'copy.js'));
for (const [k, v] of Object.entries(window.COPY)) assert(Array.isArray(v) && v.length === 2 && v[0] && v[1], k);
const html = fs.readFileSync(path.join(R, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(R, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n="(\w+)"/g)) assert(m[1] in window.COPY, 'missing ' + m[1]);
for (const m of app.matchAll(/(?<![\w.])t\('(\w+)'(?!\s*\+)/g)) assert(m[1] in window.COPY, 'missing ' + m[1]);
console.log(`page pipeline vs plain definition: ${cases} random markets; wrong-variant outputs, source parity and copy keys pass`);
