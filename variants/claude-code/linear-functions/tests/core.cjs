'use strict';
// Linear functions (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b}`);
const both = (key, ...needles) => { for (const l of ['zh', 'en']) for (const n of needles) ok(STRINGS[l][key].includes(n), `${l}.${key} quotes ${n}`); };
const appConst = name => Number((app.match(new RegExp(`\\b${name} = (-?[\\d.]+)`)) || [])[1]);
const sliders = id => { const m = html.match(new RegExp(`id="${id}"[^>]*min="(-?[\\d.]+)" max="(-?[\\d.]+)" step="([\\d.]+)" value="(-?[\\d.]+)"`)); assert.ok(m, 'slider ' + id); const [mn, mx, st] = m.slice(1, 4).map(Number), out = []; for (let v = mn; v <= mx + 1e-9; v += st) out.push(Math.round(v * 1e6) / 1e6); return { values: out, value: Number(m[4]) }; };

// ---- step 0: equal steps line up; growing steps do not ----
ok(appConst('B0') === 2 && appConst('HOURS') === 6, 'greenhouse starts at 2 °C, hours 0..6');
both('s0e', '2 °C', '0', '6');
for (const k of sliders('k0').values) {
  const eqPts = M.readings(k, 2, 6, 'equal'), grPts = M.readings(k, 2, 6, 'growing');
  ok(M.onOneLine(eqPts), 'equal steps are collinear for k = ' + k);
  eqPts.forEach(p => near(p.y, k * p.x + 2, 1e-12, 'equal readings = kx + 2'));
  ok(M.onOneLine(grPts) === (k === 0), 'growing steps bend unless k = 0, k = ' + k);
  // the plot range of step 0 (y from −12 to 16) holds every reading
  [...eqPts, ...grPts].forEach(p => ok(p.y >= -12 && p.y <= 16, 'reading inside the y range'));
  M.diffs(grPts).forEach(v => ok(Math.abs(v * 1000 - Math.round(v * 1000)) < 1e-9, 'growing changes show exactly with 3 decimals'));
  const d = M.diffs(grPts); for (let i = 1; i < d.length; i++) if (k > 0) ok(d[i] > d[i - 1], 'change grows'); else if (k < 0) ok(Math.abs(d[i]) > Math.abs(d[i - 1]), 'change grows in size');
}

// ---- step 1: rise ÷ run is the same for every pair (the slope) ----
ok(appConst('B1') === 1, 'step-1 line passes through (0, 1)'); both('s1e', '(0, 1)');
const xs1 = sliders('xA1').values;
for (const k of sliders('k1').values) for (const a of xs1) for (const b of xs1) {
  const rr = M.riseRun(k, 1, a, b);
  if (a === b) ok(rr.ratio === null, 'same point: no ratio'); else near(rr.ratio, k, 1e-12, 'rise/run = k');
  // the step-1 view (y span 21 around 1) holds both points for every slider value
  ok(Math.abs(M.y(k, 1, a) - 1) <= 10.5, 'point A inside the step-1 view');
}

// ---- step 2: changing b moves every point by the same amount ----
for (const k of sliders('k2').values) for (const b1 of [-5, -1.5, 0, 2.5, 5]) for (const b2 of [-4.5, 0, 1, 5]) for (const x of [-4, 0, 4, 1.7]) near(M.y(k, b2, x) - M.y(k, b1, x), b2 - b1, 1e-12, 'vertical shift = Δb');
for (const k of [-3, 0.5, 2]) near(M.y(k, 3, 0), 3, 0, 'b is y at x = 0');

// ---- step 3: equation text conventions (zh and en share it) ----
const E = (k, b, s) => { assert.equal(M.eq(k, b), s); checks++; };
E(1, 0, 'y = x'); E(-1, 0, 'y = −x'); E(-1, 3, 'y = −x + 3'); E(2, 1, 'y = 2x + 1'); E(0.5, -2, 'y = 0.5x − 2');
E(-0.5, 3, 'y = −0.5x + 3'); E(0, 0, 'y = 0'); E(0, -2, 'y = −2'); E(0, 3, 'y = 3'); E(-3, -2, 'y = −3x − 2'); E(3, 0, 'y = 3x');
E(M.frac(2, 3), M.frac(1, 3), 'y = (2/3)x + 1/3'); E(M.frac(-4, 6), M.frac(-5, 3), 'y = −(2/3)x − 5/3'); E(M.frac(-3, 3), M.frac(0, 2), 'y = −x'); E(M.frac(4, 2), M.frac(1, 1), 'y = 2x + 1');
for (const k of [-3, -1, -0.5, 0, 0.5, 1, 2, 3]) for (const b of [-2, 0, 3]) {
  const s = M.eq(k, b);
  ok(!/\+ −|− −|1x|\+ 0$|− 0$/.test(s), 'no awkward signs in ' + s);
  // the text, read back as a formula, gives the same values
  const expr = s.slice(4).replace(/−/g, '-').replace(/\((\d+)\/(\d+)\)x/g, '($1/$2)*x').replace(/(\d)x/g, '$1*x');
  const fn = new Function('x', 'return ' + expr);
  for (const x of [-2, 0, 1.5]) near(fn(x), k * x + b, 1e-12, 'equation text evaluates to kx + b: ' + s);
}
for (const k of sliders('k3').values) for (const b of sliders('b3').values) for (const x of sliders('x3').values) near(M.y(k, b, x), k * x + b, 0, 'probe');
near(M.y(2, 1, -3), -5, 0, 'default probe: y = 2 × (−3) + 1 = −5'); both('s3e', 'x = −3');

// ---- step 4: the line through two lattice points ----
const xs4 = sliders('x14').values;
let lines = 0;
for (const x1 of xs4) for (const y1 of xs4) for (const x2 of xs4) for (const y2 of xs4) {
  const L = M.through(x1, y1, x2, y2);
  if (x1 === x2 && y1 === y2) { ok(L.kind === 'same', 'same point'); continue; }
  if (x1 === x2) { ok(L.kind === 'vertical' && L.x === x1, 'vertical'); continue; }
  lines++;
  near(L.kv * x1 + L.bv, y1, 1e-12, 'passes P'); near(L.kv * x2 + L.bv, y2, 1e-12, 'passes Q');
  ok(M.gcd(L.k.n, L.k.d) === 1 && L.k.d > 0 && M.gcd(L.b.n, L.b.d) === 1 && L.b.d > 0, 'fractions reduced');
}
ok(lines > 10000, 'many lattice lines checked');
{ const L = M.through(-2, -1, 4, 3); ok(M.fstr(L.k) === '2/3' && M.fstr(L.b) === '1/3' && M.eq(L.k, L.b) === 'y = (2/3)x + 1/3', 'default P, Q give y = (2/3)x + 1/3'); }
{ const L = M.through(0, 1, 2, 5); ok(L.kv === 2 && L.bv === 1, 's4hint: (0, 1) and (2, 5) give k = 2, b = 1'); }
both('s4hint', '(0, 1)', '(2, 5)', 'k = 2', 'b = 1');
ok(sliders('x14').value === -2 && sliders('y14').value === -1 && sliders('x24').value === 4 && sliders('y24').value === 3, 'step-4 defaults');

// ---- step 5: crossings, parallel, coincident ----
ok(appConst('K1') === 0.5 && appConst('B1L') === 2 && M.eq(0.5, 2) === 'y = 0.5x + 2', 'line ① is y = 0.5x + 2');
both('s5e', 'y = 0.5x + 2', '0.5 − k₂', '(b₂ − 2) ÷ (0.5 − k₂)'); both('s5lg1', 'y = 0.5x + 2');
for (const k2 of sliders('k5').values) for (const b2 of sliders('b5').values) {
  const mt = M.meet(0.5, 2, k2, b2);
  if (k2 === 0.5) { ok(mt.kind === (b2 === 2 ? 'same' : 'parallel'), 'equal slopes'); for (const x of [-6, 0, 6]) near(M.gap(0.5, 2, k2, b2, x), 2 - b2, 1e-12, 'constant gap'); continue; }
  ok(mt.kind === 'one', 'one crossing');
  near(mt.x, (b2 - 2) / (0.5 - k2), 1e-12, 'x = (b₂ − 2) ÷ (0.5 − k₂)');
  near(M.y(0.5, 2, mt.x), M.y(k2, b2, mt.x), 1e-9, 'both equations hold');
  near(M.gap(0.5, 2, k2, b2, mt.x), 0, 1e-9, 'gap is 0 at the crossing');
  for (const x of [-6, -1, 0, 3]) near(M.gap(0.5, 2, k2, b2, x + 1) - M.gap(0.5, 2, k2, b2, x), 0.5 - k2, 1e-12, 'gap changes by k₁ − k₂ per step');
}
{ const mt = M.meet(0.5, 2, -1, -1); ok(mt.kind === 'one' && mt.x === -2 && mt.y === 1, 'default crossing (−2, 1)'); }
ok(sliders('k5').value === -1 && sliders('b5').value === -1, 'step-5 defaults');

// ---- step 6: quiz ----
const A = M.quizAnswers(), Q = M.QUIZ;
ok(A.every(a => a >= 0), 'every quiz has its right option');
ok(M.eq(...Q.q1.options[A[0]]) === 'y = −x + 2', 'q1: y = −x + 2');
ok(new Set(Q.q1.options.map(o => M.eq(...o))).size === Q.q1.options.length, 'q1 options distinct');
ok(Q.q2.options[A[1]] === 18 && 2 * 5 + 8 === 18, 'q2: 18');
both('qz2p', '8', '2', '5');
const m3 = M.meet(3, 10, 5, 0); ok(m3.x === 5 && m3.y === 25 && Q.q3.options[A[2]] === 5, 'q3: 5 GB, 25 yuan');
both('qz3p', '10', '3', '5');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['c4title', 'opGB']); // symbols only
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
ok(STRINGS.zh.foot.includes('一次函数 · 斜率是陡缓，截距是起点') && STRINGS.en.foot.includes('Linear Functions · Slope Is Steepness, Intercept Is the Start'), 'footer names the original');
ok(STRINGS.zh.compare.includes('对照另一版本：一次函数 · 斜率是陡缓，截距是起点'), 'compare link text');

// ---- every key referenced in HTML/app exists ----
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'(?!\s*\+)/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const n of [1, 2, 3]) for (const s of ['ok', 'no']) ok(STRINGS.zh['qz' + n + s] !== undefined, 'quiz feedback key');
for (const id of ['k0', 'rec0', 'modeEq', 'modeGrow', 'k1', 'xA1', 'xB1', 'b2', 'k2', 'k3', 'b3', 'x3', 'x14', 'y14', 'x24', 'y24', 'k5', 'b5', 'qz1c', 'qz2c', 'qz3c']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css') && !html.includes('canvas-label-guard'), 'provenance placeholder, css, no label guard');
ok(/<meta name="stage" content="junior">/.test(html) && /<meta name="category" content="math">/.test(html), 'stage and category match the original');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../math/algebra/linear-functions/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS linear-functions core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
