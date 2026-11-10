'use strict';
// Kalman filter (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const grid = (a, b, s) => { const out = []; for (let v = a; v <= b + 1e-9; v += s) out.push(Math.round(v * 1000) / 1000); return out; };

// ---- step 0: K = P/(P+R) minimises (1 − w)²P + w²R; the blend beats both reports ----
for (const sp of grid(0.2, 2, 0.1)) for (const sr of grid(0.2, 2, 0.1)) {
  const P = sp * sp, R = sr * sr, b = M.blend(0, sp, sr);
  near(b.K, P / (P + R), 1e-12, 'K formula');
  for (const w of grid(0, 1, 0.01)) ok(M.blendVar(w, P, R) >= M.blendVar(b.K, P, R) - 1e-12, 'K is the minimum');
  ok(b.bestSd < Math.min(sp, sr), 'fused σ below both');
  near(b.bestSd ** 2, P * R / (P + R), 1e-12, 'fused variance PR/(P+R)');
  // "set w to K" snaps to K rounded to the slider step: within 0.1 % of the best σ
  ok(M.blend(Number(b.K.toFixed(2)), sp, sr).excess < 1e-3, 'snap close to best');
  // w = 0 reproduces the prediction, w = 1 the measurement
  near(M.blend(0, sp, sr).sd, sp, 1e-12, 'w=0'); near(M.blend(1, sp, sr).sd, sr, 1e-12, 'w=1');
}
// the legend values 10.0 and 11.2 are the model's
ok(M.S0.pred === 10 && M.S0.meas === 11.2, 'step 0 numbers');

// ---- step 1: repeated readings of a fixed spot ----
ok(M.S1.truth === 5 && M.S1.prior === 3 && M.S1.sr === 0.5 && M.S1.N === 30, 'step 1 setting');
for (const seed of M.SEEDS) {
  for (const s0 of [0.1, 0.2, 0.5, 1, 2, 5, 10]) {
    const rows = M.staticRun(s0, seed);
    rows.forEach((r, i) => { near(r.sd * r.sd, r.Pclosed, 1e-12, 'P_k = 1/(1/P0 + k/R)'); if (i) ok(r.K < rows[i - 1].K, 'K falls every reading'); });
  }
  // huge prior: K ≈ 1/k and the estimate is the running average
  M.staticRun(10, seed).forEach(r => { near(r.K, 1 / r.k, 0.003, 'K ≈ 1/k'); near(r.x, r.mean, 0.01, 'estimate ≈ running mean'); near(r.sd, 0.5 / Math.sqrt(r.k), 0.001, 'σ ≈ σr/√k'); });
  // tiny prior: still well short of 5 m after 30 readings, and truth outside its ±2σ band
  const last = M.staticRun(0.1, seed)[29];
  ok(last.x < 4.5, 'σ0 = 0.1 stays far from 5 m, seed ' + seed);
  ok(last.x + 2 * last.sd < M.S1.truth, 'truth outside the overconfident band, seed ' + seed);
}

// ---- step 2: predict/update sawtooth, steady state ----
for (const sq of grid(0.05, 1, 0.05)) for (const sr of grid(0.1, 2, 0.1)) {
  const ss = M.steady(sq, sr), run = M.varianceRun(sq, sr, 2, 400);
  near(run[399].sdPrior, ss.sdPrior, 1e-9, 'iteration reaches σ⁻∞'); near(run[399].sdPost, ss.sdPost, 1e-9, 'σ∞'); near(run[399].K, ss.K, 1e-9, 'K∞');
  near(ss.Pm, ss.Pp + sq * sq, 1e-12, 'steady: P⁻ = P + Q'); near(ss.Pp, ss.Pm * sr * sr / (ss.Pm + sr * sr), 1e-12, 'steady: update');
  run.forEach(r => ok(r.sdPrior > r.sdPost, 'predict above update'));
  const n = M.settleStep(sq, sr, 2);
  run.slice(n - 1, 200).forEach(r => ok(Math.abs(r.K - ss.K) <= 0.01 * ss.K, 'settled from step ' + n));
}
for (const sr of grid(0.1, 2, 0.1)) { let prev = 0; for (const sq of grid(0.05, 1, 0.05)) { const K = M.steady(sq, sr).K; ok(K > prev, 'K∞ grows with σ_q'); prev = K; } }
// the plotted sawtooth range: the first prediction tops the y-axis start value 2 m
ok(M.varianceRun(0.05, 2, 2, 1)[0].sdPrior > 2, 'first predict above 2 m');

// ---- step 3: tuning the assumed process noise ----
ok(M.S3.sqTrue === 0.3 && M.S3.sr === 1 && M.S3.N === 120 && M.S3.skip === 20, 'step 3 setting');
near(M.QGRID[0], 0.01, 1e-12, 'grid starts 0.01'); near(M.QGRID[24], 3, 1e-9, 'grid ends 3');
ok(M.QGRID[14].toFixed(2) === '0.28' && M.QGRID[15].toFixed(2) === '0.35', 'grid points 0.28 and 0.35');
for (const seed of M.SEEDS) {
  const cv = M.tuningCurve(seed);
  ok(cv.best.q === M.QGRID[14] || cv.best.q === M.QGRID[15], 'minimum at 0.28 or 0.35, seed ' + seed);
  const lo = M.trackRun(0.01, seed), hi = M.trackRun(3, seed), mid = M.trackRun(M.QGRID[14], seed);
  ok(lo.claimed < lo.rmse * 0.8, 'σ_q too small → overconfident, seed ' + seed);
  for (const i of [14, 15]) { const q = M.trackRun(M.QGRID[i], seed); ok(Math.abs(q.claimed / q.rmse - 1) <= 0.2, 'near the truth the self-report is within 20%, seed ' + seed); }
  for (let i = 0; i <= 4; i++) { const q = M.trackRun(M.QGRID[i], seed); ok(q.claimed < 0.25 * q.rmse, 'too-small σ_q understates error several times, seed ' + seed); }
  ok(hi.rmse > 0.85 * hi.measRmse, 'σ_q = 3 nearly follows the readings, seed ' + seed);
  ok(mid.rmse < 0.65 * mid.measRmse, 'well-tuned filter beats the raw readings, seed ' + seed);
}
for (const l of ['zh', 'en']) ok(STRINGS[l].s3e.includes('20%') && STRINGS[l].verdictOk.includes('20%'), 'quoted 20%');
for (const l of ['zh', 'en']) ok(STRINGS[l].s3hint.includes('0.28') && STRINGS[l].s3hint.includes('0.35'), 's3hint quotes the tested grid points');

// ---- step 4: position and velocity ----
for (const seed of M.SEEDS) {
  const run = M.cvRun(seed, M.S4.N), r = run.rows;
  ok(M.corr(r[1].P) > 0.2 && M.corr(r[2].P) > M.corr(r[1].P), 'ρ turns positive in seconds 1–2');
  for (let k = 1; k <= M.S4.N; k++) { ok(Math.sqrt(r[k].P[1][1]) < Math.sqrt(r[k - 1].P[1][1]) + 1e-12, 'σ_v never grows while measured'); ok(r[k].Kv > 0, 'K_v > 0'); }
  // ellipse axes: unzoomed fits the k = 0 ellipse, zoomed ×5 fits the k = 40 one (2σ extents)
  const ext = P => [2 * Math.sqrt(P[0][0]), 2 * Math.sqrt(P[1][1])];
  const e0 = ext(r[0].P), e40 = ext(r[40].P);
  ok(e0[0] < 7 && e0[1] < 4.5 && e40[0] < 7 / 5 && e40[1] < 4.5 / 5, 'ellipses fit their axes');
  // velocity panel −2..4: truth and the estimate stay inside after k = 3
  run.vel.forEach(v => ok(v > -2 && v < 4, 'velocity truth on axis'));
  r.slice(3).forEach(q => ok(q.x[1] > -2 && q.x[1] < 4, 'velocity estimate on axis'));
}
{ // default run: velocity estimate near 1.2 within 10 s
  const run = M.cvRun(M.SEEDS[0], M.S4.N);
  for (let k = 10; k <= 40; k++) ok(Math.abs(run.rows[k].x[1] - run.vel[k]) < 0.25, 'default run tracks v from second 10');
}
near(1 - Math.exp(-2), 0.8647, 1e-4, '2σ ellipse holds 86%');
for (const l of ['zh', 'en']) ok(STRINGS[l].s4e.includes('86%'), 's4e quotes 86%');
// the covariance update agrees with the general matrix form P = (I − KH)P⁻
{
  const run = M.cvRun(11, 5);
  for (let k = 1; k <= 5; k++) {
    const pr = run.rows[k].prior.P, Kp = run.rows[k].Kp, Kv = run.rows[k].Kv, P = run.rows[k].P;
    const want = [[(1 - Kp) * pr[0][0], (1 - Kp) * pr[0][1]], [-Kv * pr[0][0] + pr[1][0], -Kv * pr[0][1] + pr[1][1]]];
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) near(P[i][j], want[i][j], 1e-12, '(I − KH)P⁻');
    near(P[0][1], P[1][0], 1e-12, 'P symmetric');
  }
}

// ---- step 5: dropout ----
for (let from = 5; from <= 32; from++) for (let len = 1; len <= 15; len++) {
  const run = M.gapRun(from, len), r = run.rows, g = M.gapStats(from, len), sp = j => Math.sqrt(r[j].P[0][0]);
  ok(g.ratio > 1, 'σ_p grows in a gap');
  // growth accelerates: successive increases of σ_p² get larger (it curves upward)
  for (let j = from + 1; j < from + len; j++) ok(r[j].P[0][0] - r[j - 1].P[0][0] > r[j - 1].P[0][0] - r[j - 2].P[0][0], 'accelerating');
  ok(g.rec === null || g.rec >= 1, 'recovery count');
  // the drawn σ_p axis covers every prior peak from k = 3 on, and the error panel ±5 m covers the 2σ band in the gap
  for (let j = 3; j <= 50; j++) ok(2 * sp(j) < 5 || j >= from, 'band on axis outside the gap');
}
{ // earlier gap → velocity less certain → faster growth (hint claim), for every length
  for (let len = 2; len <= 15; len++) ok(M.gapStats(5, len).ratio > M.gapStats(20, len).ratio && M.gapStats(5, len).svBefore > 3 * M.gapStats(20, len).svBefore, 'early gap grows faster, len ' + len);
}

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set([]);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['sp0', 'sr0', 'w0', 'snap0', 's01', 'next1', 'play1', 'reset1', 'reroll1', 'sq2', 'sr2', 'play2', 'all2', 'q3', 'reroll3', 'k4', 'play4', 'reroll4', 'zoom4', 'g5a', 'g5b']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!/canvas-label-guard/.test(html), 'no label guard');
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
ok(fs.existsSync(path.join(dir, '../../../signal/control/kalman/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS kalman core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
