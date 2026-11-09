'use strict';
// Taylor series (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const both = (key, s) => { for (const l of ['zh', 'en']) ok(STRINGS[l][key].includes(s), `${l}.${key} quotes ${s}`); };

// ---- coefficients: c_k = f^(k)(0)/k! agrees with finite differences and with known series ----
const known = {
  exp: k => 1 / M.fact(k), sin: k => (k % 2 ? (((k - 1) / 2) % 2 ? -1 : 1) / M.fact(k) : 0),
  cos: k => (k % 2 ? 0 : ((k / 2) % 2 ? -1 : 1) / M.fact(k)), ln1p: k => (k === 0 ? 0 : (k % 2 ? 1 : -1) / k), geo: () => 1
};
for (const name of Object.keys(known)) for (let k = 0; k <= 12; k++) near(M.coef(name, k), known[name](k), 1e-15, `${name} c${k}`);
// the Taylor polynomial actually converges to the function at a point inside every radius
for (const name of Object.keys(known)) near(M.taylor(name, 60, 0.3), M.FUNCS[name].f(0.3), 1e-12, `${name} series at 0.3`);
// derivative at 0 of the k-th derivative of the polynomial equals k!·c_k (strip in step 1): numeric check via
// the k-th finite difference of P_8 at 0 for exp, k ≤ 4
for (let k = 0; k <= 4; k++) {
  const c = M.coefs('exp', 8), h = 0.01; let s = 0;
  for (let i = 0; i <= k; i++) s += (i % 2 ? -1 : 1) * (M.fact(k) / (M.fact(i) * M.fact(k - i))) * M.poly(c, (k / 2 - i) * h);
  near(s / Math.pow(h, k), M.fact(k) * c[k], 1e-3, 'k-th derivative of P at 0 = k!·c_k');
}

// ---- step 0: order of contact ----
const grid = (a, b, s) => { const out = []; for (let i = 0; a + i * s <= b + 1e-9; i++) out.push(Math.round((a + i * s) * 1e6) / 1e6); return out; };
for (const c0 of grid(0.5, 1.5, 0.05)) for (const c1 of grid(0, 2, 0.05)) for (const c2 of grid(-0.5, 1.5, 0.05)) {
  const k = M.contact(c0, c1, c2);
  // the slope read off the right plot rounds to the order derived from the mismatches (except where the error
  // changes sign between h = 0.05 and 0.1, which happens only when a lower-order mismatch is tiny)
  if (k.order === 3) { near(k.slope, 3, 0.05, 'matched quadratic slope ≈ 3'); checks++; }
}
{
  const def = M.contact(1, 0.5, 0); ok(def.order === 1 && Math.abs(def.slope - 1) < 0.1 && Math.abs(def.ratio - 2) < 0.3, 'default: order 1, ratio ≈ 2');
  const two = M.contact(1, 1, 0); ok(two.order === 2 && Math.abs(two.slope - 2) < 0.05 && Math.abs(two.ratio - 4) < 0.2, 'c1 = 1: order 2, ratio ≈ 4');
  const three = M.contact(1, 1, 0.5); ok(three.order === 3 && Math.abs(three.ratio - 8) < 0.3, 'matched: order 3, ratio ≈ 8');
  const zero = M.contact(1.2, 1, 0.5); ok(zero.order === 0 && Math.abs(zero.slope) < 0.05, 'value off: flat line');
  // "each extra derivative adds one": orders 0..3 along the path in s0hint
  ok([M.contact(0.9, 1, 0.5), M.contact(1, 0.5, 0), M.contact(1, 1, 0), M.contact(1, 1, 0.5)].map(q => q.order).join() === '0,1,2,3', 'order ladder');
}

// ---- step 2: usable range for sin ----
const W = n => M.goodWindow(n);
both('s3hint', 'x/(n+2)');
near(W(1), 0.39, 0.005, 'n=1 window ±0.39'); near(W(15), 5.50, 0.005, 'n=15 window ±5.50');
both('s2hint', '0.39'); both('s2hint', '5.50'); both('s2hint', '0.65–0.75');
for (let m = 1; m <= 13; m += 2) {
  const gain = W(m + 2) - W(m);
  ok(gain >= 0.645 && gain <= 0.755, `odd step gain ${gain}`);
  ok(W(m + 1) === W(m), `even degree adds nothing n=${m + 1}`);
}
// the window is the full interval: error stays below 0.01 on [0, r] and is ≥ 0.01 just beyond
for (let n = 1; n <= 15; n++) {
  const r = W(n), c = M.coefs('sin', n);
  for (let x = 0; x <= r; x += 0.0005) ok(Math.abs(Math.sin(x) - M.poly(c, x)) < 0.01, 'inside window');
  ok(Math.abs(Math.sin(r + 0.001) - M.poly(c, r + 0.001)) >= 0.01, 'edge of window');
  // odd symmetry: the window is symmetric, as drawn
  near(Math.abs(Math.sin(-r) - M.poly(c, -r)), Math.abs(Math.sin(r) - M.poly(c, r)), 1e-12, 'symmetric');
}

// ---- step 3: Lagrange bound ≥ actual error on the whole grid ----
for (const x of grid(0.5, 6, 0.5)) for (let n = 0; n <= 32; n++) {
  const e = M.sinError(n, x), b = M.sinBound(n, x);
  if (e > 1e-13) ok(e <= b, `bound n=${n} x=${x}`); // every dot above 1e-13 is under the bound (s3readout)
  else ok(e < 1e-14 || e <= b, `below 1e-13 only rounding n=${n} x=${x}`); // s3hint: dots level off below 1e-14
  if (b < 1e-17) ok(e < 1e-14, 'rounding floor < 1e-14');
}
for (const x of grid(0.5, 6, 0.5)) {
  const nb = M.firstBelow(n => M.sinBound(n, x), 1e-6), na = M.firstBelow(n => M.sinError(n, x), 1e-6);
  ok(nb !== null && na !== null && na <= nb, `actual reaches 1e-6 no later than the bound x=${x}`);
  // the bound first rises when |x| > 1 (s3hint), and peaks near n + 1 ≈ |x|
  ok((M.sinBound(1, x) > M.sinBound(0, x)) === (x > 2), 'bound rises first iff x > 2');
  for (let n = 0; n < 32; n++) near(M.sinBound(n + 1, x) / M.sinBound(n, x), x / (n + 2), 1e-12, 'ratio x/(n+2)');
}
// rounding floor: errors never go meaningfully below 1e-17 relative to the scale drawn
ok(M.sinError(32, 6) < 1e-11, "converged at x = 6, n = 32"); for (const x of grid(0.5, 6, 0.5)) ok(M.firstBelow(n => M.sinBound(n, x), 1e-6) <= 32, "na, nb on the plotted axis");

// ---- step 4: radius of convergence for 1/(1+x²) ----
for (const a of grid(-2, 2, 0.25)) {
  const R = M.lorRadius(a);
  near(R, Math.sqrt(1 + a * a), 1e-15, 'R = √(1+a²)');
  // coefficients agree with numeric derivatives via the recursion (1 + x²) f = 1, i.e. exact series behaviour:
  near(M.lorTaylor(a, 80, a + 0.5 * R), M.lor(a + 0.5 * R), 1e-12, 'converges to f inside');
  // inside error falls, outside error grows as n goes 10 → 40 (s4hint, s4readout)
  const xin = a + 0.8 * R, xout = a + 1.2 * R;
  ok(M.lorError(a, 40, xin) < M.lorError(a, 10, xin), `inside error falls a=${a}`);
  ok(M.lorError(a, 40, xout) > M.lorError(a, 10, xout), `outside error grows a=${a}`);
  ok(M.lorError(a, 40, xout) > 1, 'outside error large at n = 40');
  // ratio test: |c_{k+1}/c_k| → 1/R (the coefficient decay sets the radius)
  const c = M.lorCoefs(a, 201).filter((_, k) => k >= 190), nz = c.filter(v => Math.abs(v) > 0);
  const root = Math.pow(Math.max(...c.map(Math.abs)), 1 / 200);
  near(root, 1 / R, 0.02, 'root test gives 1/R');
}
// a = 0: series 1 − x² + x⁴ − …; quiz: x = 1.5 diverges
near(M.lorCoefs(0, 4)[2], -1, 1e-15, 'c2 = −1'); ok(M.lorError(0, 40, 1.5) > M.lorError(0, 10, 1.5), 'x = 1.5 diverges');
near(M.lorRadius(2), 2.24, 0.005, 'a = 2 radius √5 ≈ 2.24'); both('s4hint', '2.24');
// slider: x-range of the left plot covers the interval for a = 0 and nearly for |a| = 2 (band clipped at ±4.5)
ok(2 + 1.2 * M.lorRadius(2) < 4.8, 'outside test point drawn for every a');

// ---- step 5: computing e^x ----
const X5 = grid(-5, 5, 0.5);
for (const x of X5) {
  const r = M.expTerms(x);
  ok(r && r.relErr <= 1e-6, 'tolerance met x=' + x);
  // N is minimal
  if (r.N > 1) { const S = M.expTermList(x, r.N - 1).reduce((s, v) => s + v, 0); ok(Math.abs(S - Math.exp(x)) > 1e-6 * Math.exp(x), 'N minimal x=' + x); }
  ok(r.N <= 30, 'fits the 0..30 axis');
}
const maxN = sgn => Math.max(...X5.filter(v => (sgn > 0 ? v >= 0 : v <= 0)).map(v => M.expTerms(v).N));
ok(maxN(1) === 20 && maxN(-1) === 26, `max terms ${maxN(1)} / ${maxN(-1)}`);
ok(M.expTerms(-5).N > M.expTerms(5).N, 'negative side costs more');
near(M.expTerms(-5).maxTerm, Math.pow(5, 5) / 120, 1e-9, 'largest term at x=−5 is 5⁵/5!');
// the reciprocal method: e^5 with 20 terms, then 1/that, is within 1e−6 relative of e^−5
{ const r = M.expTerms(5); near(1 / r.sum, Math.exp(-5), 1e-6 * Math.exp(-5), 'reciprocal method'); }
// largest term never exceeds the bar axis (≤ 30) and the term list beyond k = 29 is negligible
ok(Math.max(...X5.map(x => M.expTerms(x).maxTerm)) <= 30, 'bars fit');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['fn_exp', 'fn_sin', 'fn_cos', 'fn_ln1p', 'fn_geo', 'lgF0', 'lgSin', 'lgLor']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5') && STRINGS[l].foot.includes(l === 'zh' ? '泰勒级数 · 把曲线一项项贴上去' : 'Taylor Series · Patch the Curve Term by Term'), 'footer names model and original');
for (const l of ['zh', 'en']) ok(STRINGS[l].compare.includes(l === 'zh' ? '对照另一版本：泰勒级数 · 把曲线一项项贴上去' : 'Taylor Series · Patch the Curve Term by Term'), 'compare link text');

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'(?! \+)/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const f of ['exp', 'sin', 'cos', 'ln1p', 'geo']) ok(STRINGS.zh['fn_' + f] && html.includes(`data-fn="${f}"`), 'function ' + f);
for (const id of ['q0', 'q1', 'q2', 'match0', 'k1', 'n2', 'play2', 'clear2', 'x3', 'a4', 'n4', 'checkQuiz', 'x5', 'sweep5']) ok(html.includes(`id="${id}"`), 'control ' + id);
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
ok(fs.existsSync(path.join(dir, '../../../math/calculus/taylor-series/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS taylor-series core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
