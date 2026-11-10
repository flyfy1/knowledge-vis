'use strict';
// Overfitting (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b}`);
const both = (key, s) => { for (const l of ['zh', 'en']) ok(STRINGS[l][key].includes(s), `${l}.${key} quotes ${s}`); };

const TRAIN = M.sample(12, 7), TEST = M.testSet(4242), yT = M.labels(TRAIN, M.SIGMA), yS = M.labels(TEST, M.SIGMA);
const scan = M.degreeScan(TRAIN, TEST, M.SIGMA);
const floor = s => { const y = M.labels(TEST, s); return Math.sqrt(TEST.x.reduce((q, x, i) => q + (M.truth(x) - y[i]) ** 2, 0) / TEST.x.length); };

// ---- least squares is correct: QR solution satisfies the normal equations; Legendre recurrence ----
for (let d = 0; d <= 11; d++) {
  const m = M.fit(TRAIN.x, yT, d), A = TRAIN.x.map(x => M.legendre(x, d)), r = TRAIN.x.map((x, i) => M.predict(m, x) - yT[i]);
  for (let k = 0; k <= d; k++) near(A.reduce((s, row, i) => s + row[k] * r[i], 0), 0, 1e-7, `normal equations d=${d} k=${k}`);
}
for (const x of [-1, -0.3, 0.5, 1]) { const P = M.legendre(x, 4); near(P[2], (3 * x * x - 1) / 2, 1e-12, 'P2'); near(P[3], (5 * x ** 3 - 3 * x) / 2, 1e-12, 'P3'); near(P[4], (35 * x ** 4 - 30 * x * x + 3) / 8, 1e-12, 'P4'); }
ok(TRAIN.x.length === 12 && TRAIN.x.every(x => x > -1 && x < 1), '12 points in (−1, 1)');
ok(TEST.x.length === 400, '400 test points');

// ---- step 0: training RMSE never rises with degree; 0 at d = 11 ----
for (let d = 1; d <= 11; d++) ok(scan[d].train <= scan[d - 1].train + 1e-12, 'training RMSE non-increasing ' + d);
ok(scan[11].train < 1e-9, 'd = 11 passes through all 12 points');
ok(scan.slice(0, 11).every(r => r.train > 0.03), 'only d = 11 reaches 0');
{ const m = M.fit(TRAIN.x, yT, 11); let mx = 0; for (let x = -1; x <= 1; x += 0.002) mx = Math.max(mx, Math.abs(M.predict(m, x))); ok(mx > 2, 'd = 11 swings off the ±2 chart: ' + mx); }

// ---- step 1: U-shaped test RMSE, best d = 3 ≈ 0.29, floor ≈ 0.24, off the 1.2 axis from d = 9 ----
const best = M.best(scan);
ok(best.d === 3, 'best degree 3'); near(best.test, 0.29, 0.005, 'best test ≈ 0.29'); both('s1hint', '0.29'); both('s1hint', 'd = 3');
near(floor(M.SIGMA), 0.24, 0.005, 'noise floor ≈ 0.24'); both('s1e', '0.24'); both('s1hint', '0.24'); both('s3hint', '0.24');
ok(scan[0].test > scan[1].test && scan[1].test > scan[3].test, 'test falls first');
ok(scan[3].test < scan[7].test && scan[7].test < scan[9].test, 'then rises');
ok(scan.every(r => (r.d >= 9) === (r.test > 1.2)), 'test RMSE leaves the 1.2 axis exactly from d = 9'); both('s1hint', '9');
near(floor(1) / 1, 0.96, 0.005, 'floor ≈ 0.96 σ'); both('s2e', '0.96');

// ---- step 2: noise ----
{
  const s0 = M.degreeScan(TRAIN, TEST, 0);
  ok(s0.slice(5).every(r => r.test < 0.02), 'σ = 0: test RMSE near 0 for every high degree');
  for (let d = 1; d <= 11; d++) ok(s0[d].test <= s0[d - 1].test + 0.02, 'σ = 0: no real rise with degree ' + d);
  for (const s of [0.1, 0.25, 0.5]) ok(M.best(M.degreeScan(TRAIN, TEST, s)).d === 3, 'best degree stays 3 at σ = ' + s);
  const a = M.degreeScan(TRAIN, TEST, 0.1), b = M.degreeScan(TRAIN, TEST, 0.25), c = M.degreeScan(TRAIN, TEST, 0.5);
  for (let d = 0; d <= 11; d++) ok(a[d].test < b[d].test && b[d].test < c[d].test, 'larger σ → higher curve at d=' + d);
  ok(c[9].test - c[3].test > b[9].test - b[3].test && b[9].test - b[3].test > a[9].test - a[3].test, 'steeper high-degree end with σ');
  // linear in σ beyond the truth part: residual noise scales with σ
  const yy = M.labels(TRAIN, 0.5); TRAIN.x.forEach((x, i) => near(yy[i] - M.truth(x), 2 * (yT[i] - M.truth(x)), 1e-12, 'points move vertically in proportion'));
}

// ---- step 3: learning curve at d = 9 ----
{
  const POOL = M.testSet(99, 120), rows = [];
  for (let n = 10; n <= 120; n += 2) { const x = POOL.x.slice(0, n), y = M.labels({ x, z: POOL.z.slice(0, n) }, M.SIGMA), m = M.fit(x, y, 9); rows.push({ n, train: M.rmse(m, x, y), test: M.rmse(m, TEST.x, yS) }); }
  const at = n => rows.find(r => r.n === n);
  ok(at(10).train < 1e-9 && at(10).test > 1.2, 'n = 10: interpolates, test off the chart');
  ok(rows.filter(r => r.n <= 20).every(r => r.test > 1.2) && at(30).test < 0.4, 'collapse between n = 20 and 30'); both('s3hint', '20'); both('s3hint', '30');
  ok(rows.filter(r => r.n >= 40).every(r => r.test < 0.3 && r.train > 0.19 && r.train < 0.3), 'n ≥ 40: both lines near the 0.24 floor'); both('s3hint', '40');
  ok(at(12).train < at(40).train && at(40).train < at(120).train + 0.02, 'training RMSE creeps up');
  ok(POOL.x.slice(0, 10).every((x, i) => x === POOL.x[i]), 'nested pool');
}

// ---- step 4: bias² and variance (200 batches) ----
{
  const seeds = Array.from({ length: 200 }, (_, i) => 1000 + i), bv = d => M.fan(d, seeds);
  const b1 = bv(1), b3 = bv(3), b9 = bv(9);
  near(b1.variance, 0.011, 0.001, 'd = 1 variance ≈ 0.011'); near(b1.bias2, 0.055, 0.002, 'd = 1 bias² ≈ 0.055');
  near(b9.variance, 3.7, 0.1, 'd = 9 variance ≈ 3.7'); near(b3.bias2, 0.001, 0.0006, 'd = 3 bias² ≈ 0.001'); near(b3.variance, 0.024, 0.001, 'd = 3 variance ≈ 0.024');
  for (const s of ['0.011', '0.055', '3.7', '0.001', '0.024']) both('s4hint', s);
  ok(b9.bias2 < 0.01, 'd = 9 average stays near the truth');
  const all = []; for (let d = 0; d <= 9; d++) all.push(bv(d));
  for (let d = 1; d <= 9; d++) ok(all[d].variance > all[d - 1].variance, 'variance rises with d ' + d);
  ok(all[0].bias2 > all[1].bias2 && all[1].bias2 > all[3].bias2, 'bias² falls with d (0 → 1 → 3)');
  // decomposition (s4e, s4readout): over the 41 grid x, mean squared distance of the batch fits from the true rule
  // = bias² + variance·(B−1)/B exactly; adding fresh noise of variance σ² gives the expected squared error on new data.
  for (const d of [1, 3, 5, 8]) {
    const f = all[d], B = seeds.length; let mse = 0;
    f.curves.forEach(c => M.GRID.forEach((x, j) => { mse += (c[j] - M.truth(x)) ** 2; }));
    mse /= B * M.GRID.length;
    near(mse, f.bias2 + f.variance * (B - 1) / B, 1e-9, 'bias–variance identity d=' + d);
  }
  // and the noise term: new noisy labels add σ² on average (Monte Carlo over the 400 test points' noise)
  near(TEST.z.reduce((q, z) => q + z * z, 0) / TEST.z.length * M.SIGMA ** 2, M.SIGMA ** 2, 0.1 * M.SIGMA ** 2, 'noise adds ≈ σ²');
}

// ---- step 5: early stopping ----
{
  const g = M.gdRun({ seed: 7 }), C = g.checkpoints, last = C[C.length - 1];
  let bi = 0; C.forEach((c, i) => { if (c.val < C[bi].val) bi = i; });
  ok(C[bi].step === 6, 'validation lowest at step 6'); both('s5hint', '6');
  ok(last.val > 2.6 && last.step === 100000, 'validation climbs past 2.6 by step 100000'); both('s5hint', '2.6');
  ok(C[bi].test < 0.3 && last.test > 2, 'stopping beats training to the end on the test set');
  for (let i = 1; i < C.length; i++) ok(C[i].train <= C[i - 1].train + 1e-12, 'training RMSE falls monotonically under GD (step 1/L)');
  for (let i = bi + 1; i < C.length; i++) ok(C[i].val >= C[i - 1].val - 1e-9, 'validation rises after the stopping point');
  ok(C.length - 1 === 90, 'slider covers 91 checkpoints');
  // GD heads to the least-squares interpolant: final fit close to the d = 11 solution's training error
  ok(last.train < 0.02, 'end of training nearly interpolates');
  const V = M.testSet(777, 40); ok(V.x.length === 40, '40 validation points'); both('s5e', '40'); both('s5e', '400');
}

// ---- bilingual strings ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join(',');
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');

const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'[,)]/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['d0', 'truth0', 'd1', 's2', 'd2', 'clear2', 'n3', 'd4', 'add1', 'add5', 'clear4', 'k5', 'play5', 'stop5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder + css');

const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../computing/ml/overfitting/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS overfitting core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
