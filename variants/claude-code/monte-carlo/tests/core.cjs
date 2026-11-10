'use strict';
// Monte Carlo (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };

// ---- step 0: the estimator ----
for (let seed = 1; seed <= 20; seed++) {
  const s = M.scatter(seed, 10000);
  let k = 0; s.pts.forEach(([x, y, hit], i) => { ok(x >= 0 && x < 1 && y >= 0 && y < 1, 'in the square'); if (x * x + y * y <= 1) k++; ok(hit === (x * x + y * y <= 1), 'hit flag'); near(s.est[i], 4 * k / (i + 1), 1e-12, 'running estimate'); });
  // the drawn axis 2.5..3.8 holds the running estimate from N = 30 on
  for (let i = 29; i < 10000; i++) ok(s.est[i] > 2.5 && s.est[i] < 3.8, 'estimate on axis seed ' + seed);
}
near(M.P_IN, Math.PI / 4, 1e-15, 'p = π/4');
near(4 * Math.sqrt(M.P_IN * (1 - M.P_IN)), 1.64, 0.005, 'σ_g ≈ 1.64');

// ---- step 1: SE ∝ 1/√N, 500 replications ----
const reps = M.NS.map(N => M.replicate(N));
reps.forEach((r, i) => {
  near(r.sd / r.se, 1, 0.1, 'measured sd within 10% of SE, N=' + M.NS[i]);
  ok(r.within > 0.93 && r.within < 0.97, 'about 95% within 1.96 SE');
  // the fixed histogram range π ± 0.6 holds every estimate
  r.ests.forEach(v => ok(Math.abs(v - Math.PI) < 0.6, 'histogram range'));
  if (i) near(r.sd / reps[i - 1].sd, 0.5, 0.06, 'N × 4 → sd × 0.5');
  ok(r.sd > 0.01 && r.sd < 0.3, 'log axis range');
});
near(M.seTheory(100) / M.seTheory(10000), 10, 1e-12, '100× points → error /10');

// ---- step 2: integration ----
for (const name of ['gauss', 'circle']) {
  const E = M.exact(name);
  ok(E.sdMean < E.sdHit, 'sample mean has the smaller per-sample sd');
  const R = M.integrateReps(name, 400);
  near(R.sdHit, E.sdHit / 20, 0.15 * E.sdHit / 20, 'hit-or-miss repeat sd ≈ σ/√400');
  near(R.sdMean, E.sdMean / 20, 0.15 * E.sdMean / 20, 'mean repeat sd ≈ σ/√400');
  for (let seed = 1; seed <= 20; seed++) {
    const r = M.integrate(name, seed, 2000);
    // the estimates plot spans I ± 0.25 from 30 points on
    for (let i = 29; i < 2000; i++) { ok(Math.abs(r.hitEst[i] - E.I) < 0.25 && Math.abs(r.meanEst[i] - E.I) < 0.25, 'on axis'); }
  }
}
near(M.exact('gauss').I, 0.746824, 1e-6, '∫e^(−x²)'); near(M.exact('circle').I, Math.PI / 4, 1e-6, '∫√(1−x²) = π/4');
near((M.exact('gauss').sdHit / M.exact('gauss').sdMean) ** 2, 4.7, 0.05, 'gauss: about 4.7× the points');

// ---- step 3: dimensions ----
const T = M.dimTable();
T.forEach(r => {
  ok(r.grid.used <= M.BUDGET, 'grid stays in budget');
  near(M.ballFrac(r.d), [0, 0, Math.PI / 4, Math.PI / 6, Math.PI ** 2 / 32, 8 * Math.PI ** 2 / 15 / 32, Math.PI ** 3 / 6 / 64, 16 * Math.PI ** 3 / 105 / 128, Math.PI ** 4 / 24 / 256, 32 * Math.PI ** 4 / 945 / 512, Math.PI ** 5 / 120 / 1024][r.d], 1e-12, 'ball fraction d=' + r.d);
  ok(r.mcRel < 3 * r.mc.relSe + 1e-3, 'random run within 3 relative SE');
  ok(r.p >= 1e-3 && r.p <= 1, 'p axis range');
  ok(r.mc.relSe > 1e-3 && r.mc.relSe < 1.5, 'relSe axis range');
});
const at = d => T.find(r => r.d === d);
ok(at(2).grid.m === 64 && at(8).grid.m === 2, '64 cells per axis at d=2, 2 at d=8');
for (const d of [2, 3, 4]) ok(at(d).gridRel < 0.05, 'grid fine for d ≤ 4');
for (const d of [8, 9, 10]) { ok(at(d).grid.frac === 0 && at(d).gridRel === 1, 'grid collapses to 0 from d=8'); ok(at(d).mcRel < 0.5 && at(d).mc.frac > 0, 'random survives d=' + d); }
for (let i = 1; i < T.length; i++) { ok(T[i].p < T[i - 1].p, 'p shrinks'); ok(T[i].mc.relSe > T[i - 1].mc.relSe, 'relSe grows'); }
{ const se = T.map(r => r.mc.se); ok(Math.max(...se) <= 0.5 / Math.sqrt(M.BUDGET) + 1e-12, 'absolute SE ≤ 1/(2√N), no explicit d'); }

// ---- step 4: stratified ----
const rows = M.KS.map(k => M.stratReps(k));
rows.forEach(r => { ok(r.sdStrat < r.sdPlain, 'stratified beats plain N=' + r.N); near(r.sdPlain / r.se, 1, 0.15, 'plain matches SE'); ok(r.sdStrat > 0.002 && r.sdPlain < 0.6, 'axis'); });
for (let i = 1; i < rows.length; i++) ok(rows[i].sdStrat / rows[i].sdPlain < rows[i - 1].sdStrat / rows[i - 1].sdPlain, 'gap widens');
const a = M.slope(rows, 'sdPlain'), b = M.slope(rows, 'sdStrat');
near(a, -0.5, 0.03, 'plain slope ≈ −0.5'); near(b, -0.73, 0.02, 'stratified slope ≈ −0.73'); near(b, -0.75, 0.04, 'near the −3/4 theory');
{ const p = M.jitter(8, M.mulberry(3)); const cells = new Set(p.map(([x, y]) => Math.floor(x * 8) + ',' + Math.floor(y * 8))); ok(p.length === 64 && cells.size === 64, 'one point per cell'); }
for (const l of ['zh', 'en']) ok(STRINGS[l].s4hint.includes('−0.73') && STRINGS[l].s4hint.includes('−0.5'), 's4hint quotes slopes');

// ---- step 5: generators ----
for (let seed = 1; seed <= 20; seed++) {
  ok(M.distinctPairs('bad', seed, 5000) <= 128, 'bad: at most 128 distinct pairs');
  ok(M.distinctPairs('good', seed, 5000) === 5000, 'good: all distinct');
  const eb = M.scatter(seed, 10000, 'bad').est, d = Math.abs(eb[9999] - Math.PI);
  ok(d >= 0.04 && d <= 0.085, 'bad stuck 0.05–0.08 from π (seed ' + seed + ': ' + d.toFixed(3) + ')');
  ok(Math.abs(eb[9999] - eb[499]) < 0.03, 'bad stops changing after a few hundred points');
  // reproducibility: same seed, same numbers
  assert.deepEqual(M.firstNumbers('good', seed), M.firstNumbers('good', seed)); checks++;
  assert.deepEqual(M.firstNumbers('bad', seed), M.firstNumbers('bad', seed)); checks++;
  // the bad generator's pairs lie on few lines: u2 − 5·u1 takes few distinct values mod 1
  const lines = new Set(M.pairs('bad', seed, 2000).map(([u, v]) => (((v - 5 * u) % 1) + 1).toFixed(4) % 1));
  ok(lines.size <= 6, 'pairs on ≤ 6 parallel lines');
}
// the bad generator has period 256 and only 256 values
{ const u = M.badLcg(7), seen = new Set(); for (let i = 0; i < 1000; i++) seen.add(u()); ok(seen.size === 256, 'period 256'); }

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['fGauss']); // formula only
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['add1', 'add100', 'add1000', 'play0', 'reset0', 'reroll0', 'N1', 'N2', 'fGauss', 'fCircle', 'reroll2', 'd3', 'k4', 'genGood', 'genBad', 'seed5']) ok(html.includes(`id="${id}"`), 'control ' + id);
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
ok(fs.existsSync(path.join(dir, '../../../probability/stochastic/monte-carlo/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS monte-carlo core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
