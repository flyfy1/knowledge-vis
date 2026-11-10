'use strict';
// Backpropagation (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);

// ---- step 0: forward pass matches the formulas written in s0e ----
const f0 = M.forward(M.P0);
near(f0.z[0], 0.8 * 1 + -0.5 * 0.5 + 0.1, 1e-12, 'z1');
near(f0.h[0], 1 / (1 + Math.exp(-f0.z[0])), 1e-15, 'h1 = σ(z1)');
near(f0.yh[1], 0.6 * f0.h[0] + 1.2 * f0.h[1] - 0.1, 1e-12, 'ŷ2');
near(f0.L, 0.5 * ((f0.yh[0] - 1) ** 2 + f0.yh[1] ** 2), 1e-12, 'L');
ok(M.X0[0] === 1 && M.X0[1] === 0.5 && M.Y0[0] === 1 && M.Y0[1] === 0, 'x = (1, 0.5), y = (1, 0) as stated');
ok(f0.z[0] !== f0.z[1], 'the two hidden nodes differ at the default');
// s0hint: the per-parameter loss curves have their minima in different places
const argmin = i => { let best = Infinity, at = 0; for (let k = 0; k <= 600; k++) { const v = -3 + k / 100, L = M.loss(M.withParam(M.P0, i, v)); if (L < best) { best = L; at = v; } } return at; };
ok(new Set(M.NAMES.map((_, i) => argmin(i).toFixed(2))).size >= 8, 'curve minima differ across parameters');

// ---- backward sweep = central differences, at the default and at random points ----
let seed = 11; const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648 * 4 - 2; };
for (let trial = 0; trial < 300; trial++) {
  const p = trial === 0 ? M.P0 : M.NAMES.map(rnd), x = trial === 0 ? M.X0 : [rnd(), rnd()], y = trial === 0 ? M.Y0 : [rnd(), rnd()];
  const g = M.backward(p, x, y).grad;
  g.forEach((v, i) => near(v, M.nudge(p, i, 1e-5, 'central', x, y), 2e-8, `grad ${M.NAMES[i]} trial ${trial}`));
}
// s4stage4: the largest gap shown on the page is tiny
const B = M.backward(M.P0);
const gap4 = Math.max(...B.grad.map((v, i) => Math.abs(v - M.nudge(M.P0, i, 1e-5, 'central'))));
ok(gap4 < 1e-9, 'step 4 max gap < 1e-9 (' + gap4 + ')');
// stage formulas
near(B.gV[0][0], B.dOut[0] * f0.h[0], 1e-15, '∂L/∂v11 = δ(ŷ1)·h1');
near(B.dZ[0], M.dsig(f0.z[0]) * (0.6 * B.dOut[1] + 1.3 * B.dOut[0]), 1e-15, 'δ(h1) = σ′·(v11 δ1 + v21 δ2)');
near(B.gW[0][0], B.dZ[0] * 1, 1e-15, '∂L/∂w11 = δ(h1)·x1');
// bar chart ranges used by app.js (step 1: [−1, 2] with ε ≤ 1; step 4: [−0.6, 1.2])
B.grad.forEach(v => ok(v > -0.6 && v < 1.2, 'step 4 bars inside the axis'));
for (let e = -3; e <= 0; e += 0.25) M.NAMES.forEach((_, i) => { const v = M.nudge(M.P0, i, Math.pow(10, e)); ok(v > -1 && v < 2, 'step 1 bar inside the axis'); });

// ---- step 1: forward difference error shrinks roughly in proportion to ε; 12 + 1 passes ----
const err = eps => Math.max(...M.NAMES.map((_, i) => Math.abs(M.nudge(M.P0, i, eps) - B.grad[i])));
const r1 = err(1) / err(0.1), r2 = err(0.1) / err(0.01), r3 = err(0.01) / err(0.001);
[r1, r2, r3].forEach(r => ok(r > 4 && r < 25, 'error ratio per decade of ε ≈ 10: ' + r));
ok(M.NAMES.length === 12, '12 parameters');

// ---- steps 2–3: one path is not the slope; the sum of both paths is ----
const R = M.routes(M.P0), n0 = M.nudge(M.P0, 0, 1e-5, 'central');
ok(Math.sign(R[0].product) !== Math.sign(n0), 's2hint: at the default, path 1 even has the opposite sign');
ok(Math.abs(R[0].product - n0) > 0.1, 'path 1 alone is far off');
ok(R[0].product * R[1].product < 0, 'default: the two paths cancel (s3cancel)');
near(R[0].factors[0], 1, 0, 'factor x1');
for (let w = -3; w <= 3.0001; w += 0.25) for (let u = -2; u <= 2.0001; u += 0.25) {
  const p = M.withParam(M.withParam(M.P0, 0, w), 8, u), [a, b] = M.routes(p), n = M.nudge(p, 0, 1e-5, 'central');
  near(a.product + b.product, n, 1e-9, `sum of paths = nudge at w=${w} u=${u}`);
  if (Math.abs(u) < 1e-9) near(a.product, n, 1e-9, 'v21 = 0: one path is everything');
  near(a.factors[1], M.dsig(M.forward(p).z[0]), 1e-15, 'σ′ factor');
}
// σ saturates: local slope near 0 far from z = 0 (s2hint)
ok(M.dsig(6) < 0.003 && M.dsig(-6) < 0.003 && Math.abs(M.dsig(0) - 0.25) < 1e-15, 'σ′ max 0.25 at 0, ≈ 0 at |z| = 6');

// ---- step 5: work counts ----
for (let n = 2; n <= 16; n++) {
  const c1 = M.costs(1, n);
  ok(c1.pathWork < c1.backWork, `D = 1: enumerating paths slightly cheaper (n=${n})`);
  ok(c1.backWork < 1.6 * c1.pathWork, 'only slightly');
  for (let D = 2; D <= 12; D++) {
    const c = M.costs(D, n);
    ok(c.backWork < c.pathWork && c.backWork < c.nudgeWork, `D=${D} n=${n}: sweep cheapest`);
    ok(c.backWork / c.F <= 3 && c.backWork / c.F >= 2, 'sweep ≈ 2–3 forward passes');
    ok(c.P === D * n * n + n, 'weight count');
    ok(c.nudgeWork === (c.P + 1) * c.P, 'nudging = (P + 1) passes');
    ok(c.routesFirst === Math.pow(n, D - 1), 'first-layer routes n^(D−1)');
    // path work grows by roughly ×n per layer (straight line on a log axis)
    const prev = M.costs(D - 1, n), ratio = c.pathWork / prev.pathWork;
    if (D >= 4) ok(ratio > n && ratio < n * 1.7, `path work ratio per layer ≈ n (${ratio})`);
  }
}
const c12 = M.costs(12, 4);
ok(c12.pathWork > 1e9 && c12.backWork < 600, 'D = 12, n = 4: ~1.1e9 vs 572');

// ---- step 6: XOR training ----
ok(M.SEEDS6.length >= 2, 'several initial weight sets');
const def = M.SEEDS6[0];
const kDef = M.xorEpochsTo(def, 1, 0.01, 3000);
ok(kDef > 0 && kDef < 400, '#1 at η = 1 gets below 0.01 (' + kDef + ')');
const runDef = M.xorRun(def, 1, 3000);
M.XOR.forEach(([a, b, y]) => near(M.xorOut(runDef.net, a, b), y, 0.01, 'XOR learned'));
// η = 2: loss jumps up within a few epochs and stays far above the start
const big = M.xorRun(def, 2, 3000);
ok(big.hist.slice(1, 6).some(v => v > 10 * big.hist[0]) && big.hist[3000] > 3 * big.hist[0] && big.hist[3000] > 1, 'η = 2 overshoots and stays high');
ok(M.xorEpochsTo(def, 2, 0.01, 3000) === -1, 'η = 2 never reaches 0.01');
// #2 at η = 0.5 stalls with two examples near 0.5
const stuck = M.xorRun(M.SEEDS6[1], 0.5, 3000);
ok(stuck.hist[3000] > 0.05, '#2 at η = 0.5 stalls (' + stuck.hist[3000] + ')');
ok(M.XOR.filter(([a, b]) => Math.abs(M.xorOut(stuck.net, a, b) - 0.5) < 0.05).length === 2, 'two outputs ≈ 0.5');
// training gradient = numerical gradient of the mean loss
{
  const net = M.initXor(def), g = M.xorGrad(net), flat = M.xorFlat(net), gf = [...g.W.flat(), ...g.b, ...g.v, g.c];
  flat.forEach((_, i) => { const a = flat.slice(), b = flat.slice(); a[i] += 1e-6; b[i] -= 1e-6; near(gf[i], (M.xorLoss(M.xorFromFlat(a)) - M.xorLoss(M.xorFromFlat(b))) / 2e-6, 1e-7, 'xor grad ' + i); });
}
// the loss plot clamps at 10^−6..10^2; the start is inside it
ok(runDef.hist[0] < 100 && runDef.hist[0] > 1e-6, 'start inside the loss axis');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['w11Slider', 's6lgTol']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');

// ---- every key referenced in HTML/app exists; controls present ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['p0', 'v0', 'e1', 'nudge1', 'clear1', 'w2', 'w3', 'u3', 'back4', 'auto4', 'reset4', 'd5', 'n5', 'eta6', 'train6', 'one6', 'reset6', 'seed6']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../computing/ml/backpropagation/index.html')), 'comparison link target exists');
for (let i = 0; i <= 7; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS backpropagation core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · XOR #1 at η=1 in ${kDef} epochs · step-4 gap ${gap4.toExponential(1)}`);
