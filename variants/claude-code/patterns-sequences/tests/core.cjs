'use strict';
// Patterns (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0;
const ok = (c, m) => { assert.ok(c, m); checks++; };
const eq = (a, b, m) => { assert.equal(a, b, m); checks++; };

// ---- the geometry: tables are proper polygons that share exactly one edge with the next ----
for (const sh of Object.keys(M.SHAPES)) {
  const polys = M.row(sh, 6);
  polys.forEach(p => { eq(p.length, M.SHAPES[sh], 'sides of ' + sh); p.forEach((v, i) => { const q = p[(i + 1) % p.length]; assert.ok(Math.abs(Math.hypot(q[0] - v[0], q[1] - v[1]) - 1) < 1e-9, 'unit side'); checks++; }); });
  for (let n = 1; n <= 6; n++) { const S = M.seats(M.row(sh, n)); eq(S.hidden.length, 2 * (n - 1), `${sh}: every join hides exactly 2 seats (n=${n})`); }
}

// ---- steps 0–3: counted seats = formula (s − 2)·n + 2, n = 1..1000 for squares ----
for (let n = 1; n <= 1000; n++) eq(M.countRow('square', n), 2 * n + 2, 'square count n=' + n);
for (const sh of ['triangle', 'hexagon']) for (let n = 1; n <= 300; n++) eq(M.countRow(sh, n), (M.SHAPES[sh] - 2) * n + 2, `${sh} count n=${n}`);
for (const sh of Object.keys(M.SHAPES)) for (let n = 1; n <= 50; n++) eq(M.formula(sh, n), M.countRow(sh, n), 'formula = count');
// step 0 history: 1 → 4, 2 → 6, 3 → 8 (s6fin)
eq(M.countRow('square', 1), 4, '1 table'); eq(M.countRow('square', 2), 6, '2 tables'); eq(M.countRow('square', 3), 8, '3 tables');
// step 1: step +2 each time; the new table brings 4 and the join loses 2 (1 old seat, 1 new seat)
{
  const vals = Array.from({ length: 8 }, (_, i) => M.countRow('square', i + 1));
  ok(M.diffs(vals).every(d => d === 2), 'step is +2');
  for (let n = 2; n <= 8; n++) {
    const prev = M.seats(M.row('square', n - 1)).free, now = M.seats(M.row('square', n));
    const nowKeys = new Set(now.free.map(s => `${s.x.toFixed(3)},${s.y.toFixed(3)}`));
    eq(prev.filter(s => !nowKeys.has(`${s.x.toFixed(3)},${s.y.toFixed(3)}`)).length, 1, 'one old seat lost');
    eq(now.hidden.filter(s => s.table === n - 1).length, 1, 'one new seat lost');
    eq(now.free.filter(s => s.table === n - 1).length + 1, 4, 'the new table brings 4 seats (one of them lost)');
  }
  ok(vals[7] <= 20, 'step 1 chart y-axis (0..20) holds 8 tables');
}
// step 2: 100 → 202 (s2hint); quiz 25 → 52; end seats are the two on the short sides
eq(M.formula('square', 100), 202, '100 tables'); eq(M.countRow('square', 100), 202, '100 tables counted');
eq(M.formula('square', 25), 52, 'quiz answer');
for (let n = 1; n <= 8; n++) { const f = M.seats(M.row('square', n)).free; eq(f.filter(s => s.mx === 0 || s.mx === n).length, 2, 'two end seats'); eq(f.filter(s => s.mx !== 0 && s.mx !== n).length, 2 * n, 'top and bottom: 2 per table'); }
for (const l of ['zh', 'en']) ok(STRINGS[l].s2hint.includes('202') && STRINGS[l].quizRight.includes('25'), 'texts quote the tested values');
// step 3: per-table step = sides − 2 (1, 2, 4); hexagon is steepest; chart y-axis 0..40 holds all
eq(M.perTable('triangle'), 1, 'triangle +1'); eq(M.perTable('square'), 2, 'square +2'); eq(M.perTable('hexagon'), 4, 'hexagon +4');
for (const sh of Object.keys(M.SHAPES)) { const v = Array.from({ length: 8 }, (_, i) => M.countRow(sh, i + 1)); ok(M.diffs(v).every(d => d === M.perTable(sh)), 'constant step for ' + sh); ok(v[7] <= 40, 'chart holds ' + sh); }

// ---- step 4: backwards ----
for (let S = 3; S <= 30; S++) {
  const n = M.tablesNeeded(S), seats = M.countRow('square', n);
  ok(seats >= S, `enough seats for ${S}`);
  ok(n === 1 || M.countRow('square', n - 1) < S, `one table fewer is not enough for ${S}`);
  eq(seats - S, S % 2 === 0 ? 0 : 1, `even fills exactly, odd leaves 1 empty (S=${S})`);
}
eq(M.tablesNeeded(15), 7, '15 guests → 7 tables');
eq(M.seatOrder(M.seats(M.row('square', 7)).free).length, 16, '7 tables have 16 seats');

// ---- step 5: square block ----
const tbl = [], st = [];
for (let k = 1; k <= 6; k++) { const S = M.seats(M.block(k)); tbl.push(S.tables); st.push(S.free.length); eq(S.tables, k * k, 'k × k tables'); eq(S.free.length, 4 * k, '4k seats'); }
assert.deepEqual(M.diffs(tbl), [3, 5, 7, 9, 11]); checks++;
ok(M.diffs(st).every(d => d === 4), 'seats step +4');
ok(tbl[5] <= 36 && st[5] <= 24, 'step 5 chart axes hold k = 6');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');

// ---- keys, controls, provenance ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'[,)]/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const sh of Object.keys(M.SHAPES)) ok(STRINGS.zh['shape_' + sh] && STRINGS.en['shape_' + sh], 'shape name ' + sh);
for (const m of app.matchAll(/\$\('([A-Za-z0-9_]+)'\)/g)) ok(html.includes(`id="${m[1]}"`), 'element ' + m[1]);
for (const sh of Object.keys(M.SHAPES)) ok(html.includes(`id="sh3${sh}"`), 'shape button ' + sh);
{ const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]); ok(new Set(ids).size === ids.length, 'element ids are unique'); }
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder');

// ---- deep links ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../math/algebra/patterns-sequences/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS patterns-sequences core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
