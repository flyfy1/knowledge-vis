'use strict';
// Inverse proportion (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node variants/claude-code/inverse-proportion/tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, m, tol = 1e-9) => ok(Math.abs(a - b) < tol, `${m}: ${a} vs ${b}`);
const slider = id => { const m = html.match(new RegExp(`id="${id}"[^>]*min="([-\\d.]+)" max="([-\\d.]+)" step="([-\\d.]+)" value="([-\\d.]+)"`)); assert.ok(m, 'slider ' + id); return { min: +m[1], max: +m[2], step: +m[3], value: +m[4] }; };
const range = s => { const out = []; for (let v = s.min; v <= s.max + 1e-9; v += s.step) out.push(+v.toFixed(6)); return out; };

// ---- step 0: x × y = 24 everywhere; the corners are not on one straight line ----
const x0 = slider('x0');
for (const x of range(x0)) near(M.rect(x).area, 24, 'area 24 at x=' + x);
ok(x0.value === 4 && M.rect(4).y === 6, 'default rectangle 4 × 6');
const c = range(x0).map(x => [x, 24 / x]);
const slope = (p, q) => (q[1] - p[1]) / (q[0] - p[0]);
ok(Math.abs(slope(c[0], c[1]) - slope(c[c.length - 2], c[c.length - 1])) > 1, 's0readout: corners lie on a curve, not a line');
ok(slope(c[0], c[1]) < slope(c[c.length - 2], c[c.length - 1]), 'steep on the left, flat on the right');
// unit squares are drawn only for whole-number sides; there are exactly 24 of them
for (const x of range(x0)) if (Number.isInteger(x) && Number.isInteger(24 / x)) ok(x * (24 / x) === 24, 'unit squares count 24');

// ---- step 1: width × m ⇒ height ÷ m; the product stays 24; all in the 0..25.5 window ----
const w1 = slider('w1'), m1 = slider('m1');
for (const a of range(w1)) for (const m of range(m1)) {
  const s = M.scale(a, m);
  near(s.heightRatio, 1 / m, 'height ÷ m'); near(s.prod1, 24, 'product kept');
  ok(s.x1 <= 25.5 && s.y0 <= 25.5 && s.y1 >= 1, 'step 1 rectangles fit the chart');
}
ok(M.scale(2, 3).y1 === 4 && M.scale(2, 3).y0 === 12, 's1t default: width 2 → 6, height 12 → 4');

// ---- step 2: quadrants by sign of k, |x·y| = |k|, x = 0 undefined ----
const k2 = slider('k2'), x2 = slider('x2');
for (const k of range(k2)) for (const x of range(x2)) {
  const y = M.f(k, x);
  if (x === 0) { ok(y === null, 'x = 0 undefined'); continue; }
  near(Math.abs(x * y), Math.abs(k), '|x·y| = |k|');
  if (k !== 0) { const q = x > 0 ? (y > 0 ? 1 : 4) : (y > 0 ? 2 : 3); ok(M.quadrants(k).includes(q), `k=${k} x=${x} in quadrant ${q}`); }
}
ok(M.quadrants(0).length === 0, 'k = 0 has no branches');
for (const k of [-12, -3, 1, 8]) M.branches(k, 8, 8).forEach(b => b.forEach(([x, y]) => ok(Math.abs(y) <= 8 + 1e-9 && Math.abs(x) <= 8 + 1e-9, 'branch inside window')));
ok(k2.value === 8 && x2.value === 2 && M.f(8, 2) === 4, 'step 2 default (2, 4)');

// ---- step 3: y = 6/X at the window edge is positive; x·y = 6 ----
const z3 = slider('z3'); ok(z3.min === 0 && z3.max === M.ZOOMS.length - 1, 'zoom slider indexes ZOOMS');
const shown = M.ZOOMS.map(X => M.K3 / X);
assert.deepEqual(shown.map(v => Number(v.toPrecision(3))), [0.6, 0.06, 0.006, 0.0006]); checks++;
shown.forEach((v, i) => { ok(v > 0, 'never 0'); near(v * M.ZOOMS[i], 6, 'product 6'); });
for (const l of ['zh', 'en']) ok(['0.6', '0.06', '0.006'].every(s => STRINGS[l].s3hint.includes(s)), 's3hint quotes the table values');

// ---- step 4: classification ----
const want = { apple: 'direct', trip: 'inverse', rope: 'neither', square: 'neither' };
for (const k of M.SCEN_KEYS) ok(M.classify(k) === want[k], 'classify ' + k);
M.table('rope').forEach(r => ok(r.x + r.y === 10 && r.y > 0, 'rope: sum x + y = 10 (perimeter 20)'));
M.table('trip').forEach(r => near(r.prod, 120, 'trip product 120'));
M.table('apple').forEach(r => near(r.ratio, 5, 'apple ratio 5'));
const ropeP = M.table('rope').map(r => r.prod); ok(new Set(ropeP).size > 1 && ropeP.some((v, i) => i && v !== ropeP[i - 1]), 'rope product changes');
ok(M.table('rope').every((r, i, a) => !i || r.y < a[i - 1].y), 'rope: one side shrinks as the other grows');

// ---- step 5: fare split and trip ----
for (const n of [7, 9]) ok(!M.exactCents(n), 's5hint: 7 and 9 people do not split evenly: ' + n);
for (const n of [1, 2, 3, 4, 5, 6, 8, 10, 12]) ok(M.exactCents(n), 'even split for ' + n);
ok(!M.exactCents(11), '11 does not split evenly');
ok(app.includes('q.min = 1; q.max = 12') && app.includes('q.min = 20; q.max = 120'), 'slider ranges match the text (1–12 people, 20–120 km/h)');
for (let v = 20; v <= 120; v += 5) near(M.hours(v) * v, 120, 'trip 120 km');

// ---- step 6: quiz ----
const answers = M.QUIZ.map(q => M.solve(q).y);
assert.deepEqual(answers, [4, 2, -2.5, 2, 3, 1.25]); checks++;
M.QUIZ.forEach(q => { const y = M.solve(q).y; ok(M.check(q, y) && M.check(q, y + 0.009) && !M.check(q, y + 0.011) && !M.check(q, NaN), 'tolerance 0.01'); near(q.a * q.b, M.solve(q).k, 'k = a·b'); });

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['c2title', 'th3xy', 'th3y']); // symbols only
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');

// ---- keys referenced in HTML/app exist ----
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) if (!m[1].endsWith('_') && m[1] !== 'quad') ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const k of M.SCEN_KEYS) for (const p of ['x_', 'y_', 'sc_']) ok(STRINGS.zh[p + k] !== undefined, 'dynamic key ' + p + k);
for (const k of ['direct', 'inverse', 'neither']) ok(STRINGS.zh['s4readout_' + k] !== undefined, 'verdict key ' + k);
for (let q = 1; q <= 4; q++) ok(STRINGS.zh['quad' + q] !== undefined, 'quad' + q);
for (const id of ['x0', 'sweep0', 'clear0', 'w1', 'm1', 'k2', 'x2', 'z3', 'q5', 'sc5fare', 'sc5trip', 'ans6', 'check6', 'next6', ...M.SCEN_KEYS.map(s => 'sc4' + s)]) ok(html.includes(`id="${id}"`), 'control ' + id);

// ---- links ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../math/algebra/inverse-proportion/index.html')), 'comparison link target exists');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder and stylesheet');
ok(!html.includes('canvas-label-guard'), 'no canvas-label-guard');
for (let i = 0; i <= 7; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS inverse-proportion core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
