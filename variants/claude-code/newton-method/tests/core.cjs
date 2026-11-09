'use strict';
// Newton's method (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const range = (a, b, s) => { const out = []; for (let v = a; v <= b + 1e-9; v += s) out.push(+v.toFixed(6)); return out; };

// ---- roots of the page's functions (independent of Newton) ----
near(M.FUNCS.sq2.root, Math.SQRT2, 0, 'sqrt 2'); near(M.FUNCS.exp3.root, Math.log(3), 0, 'ln 3');
near(Math.cos(M.FUNCS.cosx.root), M.FUNCS.cosx.root, 1e-15, 'cos r = r'); near(M.FUNCS.cosx.root, 0.7390851332151607, 1e-15, 'Dottie number');
near(M.FAIL.f(M.FAIL_ROOT), 0, 1e-13, 'x³ − 2x + 2 root'); near(M.FAIL_ROOT, -1.7693, 5e-5, 'root ≈ −1.7693');
near(M.FLAT, 0.8165, 5e-5, 'flat tangent at ±0.8165'); near(M.FAIL.df(M.FLAT), 0, 1e-12, "f′ = 0 at √(2/3)");

// ---- step 0: one tangent step for x² − 2 ----
const F = M.FUNCS.sq2, r2 = Math.SQRT2;
for (const x0 of range(0.3, 3.5, 0.01)) {
  const x1 = M.step(F, x0);
  near(x1, (x0 + 2 / x0) / 2, 1e-12, 'Newton for x² − 2 = Babylonian average');
  near(x1 - r2, (x0 - r2) ** 2 / (2 * x0), 1e-12, 'e₁ = e₀² / (2x₀) exactly');
  ok(x1 >= r2 - 1e-12, 'x₁ is never below √2');
  if (x0 > r2) ok(x1 < x0, 'from the right, x₁ moves closer');
  const worse = Math.abs(x1 - r2) > Math.abs(x0 - r2) + 1e-12;
  ok(worse === (x0 < r2 / 3 - 1e-9), 'one step makes the error worse exactly below √2/3 ≈ 0.47');
}
near(r2 / 3, 0.47, 0.005, 'hint: 0.47');
{ const x0 = r2 + 0.1, e1 = Math.abs(M.step(F, x0) - r2); ok(e1 > 0.003 && e1 < 0.0035, 'hint: error 0.1 → about 0.003 (from the right): ' + e1); }

// ---- step 1: digits for the three functions; the quoted sequence for x² − 2 from 3 ----
{ const d = M.iterate(F, 3, 8).map(x => +M.digits(x, r2).toFixed(1)); assert.deepEqual(d.slice(1, 6), [0.5, 1.5, 3.3, 6.8, 13.9]); checks++; }
for (const key of Object.keys(M.FUNCS)) {
  const fn = M.FUNCS[key];
  for (const x0 of range(fn.x0.min, fn.x0.max, 0.01)) {
    const xs = M.iterate(fn, x0, 8);
    ok(xs.length === 9, `8 steps exist (${key}, ${x0})`);
    ok(fn.x0.def >= fn.x0.min && fn.x0.def <= fn.x0.max, 'default inside range');
  }
  const xs = M.iterate(fn, fn.x0.def, 8); ok(M.digits(xs[8], fn.root) >= 15, `default start reaches ≥ 15 digits in 8 steps (${key})`);
}

// ---- step 2: √a, Newton vs bisection; quoted ranges ----
const n10 = [], b10 = [];
for (let a = 2; a <= 100; a++) {
  const r = Math.sqrt(a), N = M.newtonSqrt(a, 12), B = M.bisectSqrt(a, 61);
  near(N[0], a, 0, 'Newton starts at a');
  ok(B.every(x => x >= 0 && x <= a), 'bisection stays in [0, a]');
  n10.push(M.stepsTo(N, r, 10)); ok(M.stepsTo(N, r, 15) >= 0 && M.stepsTo(N, r, 15) <= 12, 'Newton reaches 15 digits within the plotted 12 steps');
  if (![4, 16, 64].includes(a)) b10.push(M.stepsTo(B, r, 10)); else ok(M.stepsTo(B, r, 10) <= 2, 'coincidence: a midpoint lands on √a exactly');
  ok(M.stepsTo(B, r, 15) <= 60, 'bisection reaches 15 digits on the 0–60 axis');
  // quadratic constant: near the root e₁/e₀² → 1/(2√a)
  for (let i = 0; i < N.length - 1; i++) { const e0 = Math.abs(N[i] - r), e1 = Math.abs(N[i + 1] - r); if (e0 < 1e-3 && e1 > 1e-13) near(e1 / e0 ** 2, M.quadConst(a), 0.01 * M.quadConst(a) + 1e-3, 'e₁/e₀² → 1/(2√a)'); }
}
ok(Math.min(...n10) === 4 && Math.max(...n10) === 7, 'Newton: 4–7 steps to 10 digits');
ok(Math.min(...b10) === 27 && Math.max(...b10) === 35, 'bisection: 27–35 steps to 10 digits');
{ const r = Math.SQRT2; ok(M.stepsTo(M.newtonSqrt(2, 12), r, 10) === 4 && M.stepsTo(M.bisectSqrt(2, 61), r, 10) === 29, 'a = 2: 4 vs 29'); }

// ---- step 3: repeated roots ----
for (const x0 of range(1.2, 3, 0.05)) for (const k of [1, 2, 3]) {
  const e = M.errors(M.multi(k), x0, 60);
  let i = -1; for (let j = 0; j < e.length - 1; j++) if (e[j] > 1e-7 && e[j + 1] > 0) i = j;
  ok(i >= 0, 'a measurable step exists');
  if (k > 1) near(e[i + 1] / e[i], M.multiRatio(k), 0.01, `ratio → (k − 1)/k, k = ${k}`);
  else near(e[i + 1] / e[i] ** 2, 0.5, 0.05, 'k = 1: e₁/e₀² → f″/(2f′) = 0.5');
  const floor = Math.min(...e.filter(v => v > 0));
  if (k === 3) ok(floor > 1e-8 && floor < 1e-7, 'k = 3 stalls near 1e-8: ' + floor);
  if (k === 2) ok(floor < 1e-14, 'k = 2 reaches rounding level');
  ok(e.findIndex(v => v < 1e-6) > 0 && e.findIndex(v => v < 1e-6) <= 40, 'reaches 1e-6 on the 0–40 axis');
}
near(Math.log10(2), 0.3, 0.002, 'k = 2: 0.3 decade per step');

// ---- step 4: failure presets ----
{ const c = M.classify(0); ok(c.kind === 'cycle' && c.pair[0] === 0 && c.pair[1] === 1, 'x₀ = 0 cycles 0 ↔ 1'); }
{ const c = M.classify(0.1); ok(c.kind === 'cycle' && Math.abs(c.pair[0]) < 1e-9 && Math.abs(c.pair[1] - 1) < 1e-9, 'x₀ = 0.1 falls into the same cycle'); }
{ const c = M.classify(0.8165); ok(c.kind === 'root' && c.at === 31 && Math.round(c.xs[1]) === -54407, 'x₀ = 0.8165: thrown to −54407, root at step 31'); }
{ const c = M.classify(-2); ok(c.kind === 'root' && c.at === 4, 'x₀ = −2: 4 steps'); }
{ const c = M.classify(0.5); ok(c.kind === 'root' && c.at === 8 && c.xs[1] > 0 && c.xs[3] < 0, 'x₀ = 0.5: right then left, 8 steps'); }
{ const c = M.classify(M.FLAT); ok(c.kind === 'flat', 'exactly flat: stops'); }
let kinds = new Set(); for (const x0 of range(-2.5, 2.5, 0.0005)) { const c = M.classify(x0); kinds.add(c.kind); ok(['root', 'cycle', 'flat', 'wander'].includes(c.kind), 'classified'); }
ok(kinds.has('root') && kinds.has('cycle'), 'slider range shows roots and cycles');

// ---- step 5: basins ----
for (const x of range(0, 0.447, 0.001)) ok(M.basin(x) === 1, 'below 1/√5 → 0');
for (const x of range(0.578, 2, 0.001)) ok(M.basin(x) === 2, 'above 1/√3 → 1');
for (const x of range(-0.447, 0, 0.001)) ok(M.basin(x) === 1, 'symmetric: → 0');
for (const x of range(-2, -0.578, 0.001)) ok(M.basin(x) === 0, 'below −1/√3 → −1');
near(M.BASIN_EDGES.inner, 0.447, 0.001, '1/√5'); near(M.BASIN_EDGES.flat, 0.577, 0.001, '1/√3');
{ let sw = 0, prev = null; const seen = new Set(); for (let i = 0; i < 4000; i++) { const b = M.basin(0.4473 + (0.5773 - 0.4473) * i / 4000); seen.add(b); if (prev !== null && b !== prev) sw++; prev = b; } ok(seen.has(0) && seen.has(2) && !seen.has(1) && sw >= 3, 'pink and cyan alternate between 1/√5 and 1/√3'); }
for (const z of [1, 2, 3]) { // the hint: windows ×10, ×100, ×1000 at 0.447 each show all three colours and several switches
  for (const px of [250, 330, 900]) { // strip widths at 320 / 390 / 1280
    const w = 2 / 10 ** z; let sw = 0, prev = null; const seen = new Set();
    for (let i = 0; i < px; i++) { const b = M.basin(0.447 - w + 2 * w * (i + 0.5) / px); seen.add(b); if (prev !== null && b !== prev) sw++; prev = b; }
    ok(seen.has(0) && seen.has(1) && seen.has(2) && sw >= 3, `zoom 10^${z} at ${px}px: three colours, ${sw} switches`);
  }
}
{ const odd = M.iterate(M.BASIN, M.BASIN_EDGES.inner, 3); near(odd[1], -M.BASIN_EDGES.inner, 1e-12, '±1/√5 is a 2-cycle'); }

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['fnSq2', 'fnCos', 'fnExp', 'fnNameSq2', 'fnNameCos', 'fnNameExp', 's3lgK']); // formulas only
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');

// ---- every key referenced in HTML/app exists; controls exist ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const k of ['fnNameSq2', 'fnNameCos', 'fnNameExp']) ok(app.includes(`'${k}'`), 'used ' + k);
for (const id of ['x00', 'clear0', 'fnSq2', 'fnCos', 'fnExp', 'x10', 'step1b', 'play1', 'reset1', 'a2', 'k1', 'k2', 'k3', 'x30', 'pr0', 'pr01', 'prFlat', 'prM2', 'pr05', 'x40', 'x50', 'z5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder');
ok(!html.includes('canvas-label-guard'), 'no label guard');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../math/calculus/newton-method/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS newton-method core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
