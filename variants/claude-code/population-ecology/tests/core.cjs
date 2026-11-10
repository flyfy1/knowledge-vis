'use strict';
// Population ecology (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const both = (key, s) => { for (const l of ['zh', 'en']) ok(STRINGS[l][key].includes(s), `${l}.${key} quotes ${s}`); };

// ---- step 0: exponential growth, doubling time, default readout ----
for (let r = -1; r <= 1.0001; r += 0.05) {
  if (Math.abs(r) < 1e-9) { ok(M.doublingTime(r) === Infinity, 'r = 0 never doubles'); continue; }
  const td = M.doublingTime(r), f = M.expo(20, r, td) / 20;
  near(f, r > 0 ? 2 : 0.5, 1e-12, 'one doubling / halving time');
  // equal spacing: the k-th doubling happens at k·td
  for (let k = 1; k <= 5; k++) near(M.expo(20, r, k * td) / 20, Math.pow(f, k), 1e-9, 'equal spacing');
}
near(M.doublingTime(0.5), 1.386, 1e-3, 'default doubling time ≈ 1.39 yr');
near(M.expo(20, 0.5, 10), 2968.3, 0.1, 'default N(10) ≈ 2,968');
// dN/dt = rN: numerical derivative
for (const r of [-0.4, 0.3, 0.9]) { const h = 1e-6, tt = 3; near((M.expo(20, r, tt + h) - M.expo(20, r, tt - h)) / (2 * h), r * M.expo(20, r, tt), 1e-4, 'dN/dt = rN'); }

// ---- step 1: birth and death lines cross at K; net = r(1 − N/K); rates stay ≥ 0 on the slider ranges ----
ok(Math.abs(M.B0 - M.D0 - M.DEFAULT.r) < 1e-12, 'B0 − D0 = r');
for (let K = 800; K <= 1600; K += 100) for (let N = 0; N <= 1600; N += 10) {
  const b = M.birthRate(N, K), d = M.deathRate(N, K);
  near(b - d, M.perCapita(N, M.DEFAULT.r, K), 1e-12, 'net = r(1 − N/K)');
  ok(b >= -1e-12 && d > 0, 'rates non-negative for N ≤ 1600, K ≥ 800');
  ok((b - d > 1e-12) === (N < K) || Math.abs(N - K) < 1e-9, 'sign of net rate flips exactly at K');
}
near(M.birthRate(1000, 1000), 0.3, 1e-12, 'b(K) = 0.3'); near(M.deathRate(1000, 1000), 0.3, 1e-12, 'd(K) = 0.3 (quiz feedback)');
for (const l of ['zh', 'en']) ok(STRINGS[l].s1readout.includes('0.5 × (1 − {N}/{K})'), 'readout formula uses r = 0.5');

// ---- step 2: the hump, its maximum and the stable point ----
const pk = M.peakGrowth(0.5, 1000);
assert.equal(pk.N, 500); assert.equal(pk.g, 125); checks += 2;
let best = { N: 0, g: -Infinity };
for (let N = 0; N <= 1400; N += 1) { const g = M.growth(N, 0.5, 1000); if (g > best.g) best = { N, g }; near(g, N * M.perCapita(N, 0.5, 1000), 1e-9, 'growth = N × per-capita (rectangle area)'); }
ok(best.N === 500 && Math.abs(best.g - 125) < 1e-9, 'scan finds the peak at K/2');
ok(M.growth(1400, 0.5, 1000) >= -300 && M.growth(1400, 0.5, 1000) < -250, 'hump bottom inside the plot (−280)');
for (const N of [150, 400, 650, 850]) ok(M.growth(N, 0.5, 1000) > 0, 'right arrows where growth > 0');
for (const N of [1150, 1300]) ok(M.growth(N, 0.5, 1000) < 0, 'left arrows where growth < 0');

// ---- step 3: logistic curve ----
const rk = (N0, r, K, T) => M.rk4(([N]) => [M.growth(N, r, K)], [N0], T, 0.01).ys.at(-1)[0];
for (const [N0, r, K] of [[20, 0.5, 1000], [10, 1, 400], [1500, 0.3, 800], [700, 0.2, 1500]]) {
  for (const T of [3, 8, 20]) near(M.logistic(N0, r, K, T), rk(N0, r, K, T), 1e-6 * K, 'closed form = integration');
  // r doubled: same curve in half the time (s3hint)
  for (const T of [2, 7, 15]) near(M.logistic(N0, 2 * r, K, T / 2), M.logistic(N0, r, K, T), 1e-9, 'r×2 compresses time by 2');
  const t90 = M.tReach(N0, r, K, 0.9);
  if (t90 !== null) near(M.logistic(N0, r, K, t90), 0.9 * K, 1e-6, 't90 lands on 0.9K');
  const ti = M.tInflection(N0, r, K);
  if (ti !== null) {
    near(M.logistic(N0, r, K, ti), K / 2, 1e-6, 'inflection at K/2');
    let bt = 0, bs = -Infinity; for (let u = 0; u <= 60; u += 0.01) { const s = M.growth(M.logistic(N0, r, K, u), r, K); if (s > bs) { bs = s; bt = u; } }
    near(bt, ti, 0.011, 'steepest point found by scan');
  }
}
// default readout: steepest at ≈ 7.8 yr, 90% K at ≈ 12.2 yr
near(M.tInflection(20, 0.5, 1000), 7.78, 0.01, 'default inflection'); near(M.tReach(20, 0.5, 1000, 0.9), 12.18, 0.01, 'default t90');
// starting above K the curve falls monotonically to K
{ let prev = Infinity; for (let u = 0; u <= 30; u += 0.5) { const v = M.logistic(1500, 0.5, 1000, u); ok(v <= prev + 1e-9 && v >= 1000, 'from above K: falls to K'); prev = v; } }

// ---- step 4: harvesting ----
const msy = M.harvestEq(0.5, 1000, 0).msy;
assert.equal(msy, 125); checks++;
both('s4e', '125'); both('s4stable', '125'); both('s4crash', '125');
for (let H = 0; H <= 200; H += 5) {
  const e = M.harvestEq(0.5, 1000, H);
  ok(e.exists === (H <= 125), 'equilibria exist exactly for H ≤ MSY (H=' + H + ')');
  if (e.exists) {
    near(M.growth(e.hi, 0.5, 1000) - H, 0, 1e-9, 'upper root'); near(M.growth(e.lo, 0.5, 1000) - H, 0, 1e-9, 'lower root');
    const s = M.simHarvest(0.5, 1000, H, 1000, 300);
    ok(s.collapse === null, 'no collapse when H ≤ MSY');
    if (H < 125) near(s.N.at(-1), e.hi, 0.5, 'settles at the upper root');
    // starting just below the lower root collapses even with H unchanged
    if (H > 0 && H < 125) ok(M.simHarvest(0.5, 1000, H, e.lo - 5, 300).collapse !== null, 'below the unstable root: collapse');
    if (H === 125) { const sl = M.simHarvest(0.5, 1000, H, 495, 300); ok(sl.N.at(-1) < 495 && sl.collapse === null, 'at MSY a loss below 500 keeps sliding (slowly)'); ok(M.simHarvest(0.5, 1000, H, 495, 500).collapse !== null, 'at MSY a loss below 500 eventually collapses'); }
  } else {
    const s = M.simHarvest(0.5, 1000, H, 1000, 300);
    ok(s.collapse !== null, 'collapse when H > MSY (H=' + H + ')');
  }
}
{ const e = M.harvestEq(0.5, 1000, 120); near(e.hi, 600, 1e-9, 'H=120 → 600'); near(e.lo, 400, 1e-9, 'H=120 → 400'); }
{ const s = M.simHarvest(0.5, 1000, 130, 1000, 300); ok(s.collapse > 54.5 && s.collapse < 55.5, 'H=130 → fished out in year 55 (' + s.collapse + ')'); }
for (const l of ['zh', 'en']) ok(STRINGS[l].s4hint.includes('600') && STRINGS[l].s4hint.includes('55'), 's4hint quotes 600 and 55');
{ const s = M.simHarvest(0.5, 1000, 125, 1000, 300); const n60 = s.N[Math.round(60 / 0.02)]; ok(n60 > 500 && n60 < 540, 'H=125 still above 500 after 60 yr (' + n60.toFixed(1) + ')'); }
// which crashes fall beyond the 60-year chart (s4crashLate) — the slider steps are 5 fish
for (let H = 130; H <= 200; H += 5) { const s = M.simHarvest(0.5, 1000, H, 1000, 300); ok(s.collapse !== null && s.collapse < 300, 'collapse inside the 300-yr horizon'); }

// ---- step 5: predators ----
const PP5 = { ...M.PP, N0: 100, P0: 5 };
ok(M.PP.b === 0.05, 'conversion 0.05 = one predator per 20 fish'); both('s5e', '0.05');
let lagMin = Infinity, lagMax = 0, grid = 0;
for (let a = 0.01; a <= 0.05 + 1e-9; a += 0.005) for (let m = 0.2; m <= 0.6 + 1e-9; m += 0.05) {
  const A = Math.round(a * 1000) / 1000, Mm = Math.round(m * 100) / 100, L = M.ppLag(A, Mm, PP5), eq = M.ppEq(A, Mm, PP5);
  ok(eq.coexist === (Mm / (0.05 * A) < 1000), 'coexistence iff m/(0.05a) < K');
  if (eq.coexist) {
    // the equilibrium makes both derivatives zero
    near(0.5 * eq.N * (1 - eq.N / 1000) - A * eq.N * eq.P, 0, 1e-9, 'prey still at equilibrium');
    near(0.05 * A * eq.N * eq.P - Mm * eq.P, 0, 1e-9, 'predators still at equilibrium');
    // the long-run simulation approaches it (run 400 years)
    const long = M.simPP(A, Mm, { ...PP5, T: 400 });
    near(long.N.at(-1), eq.N, 0.02 * 1000, 'prey → N* for a=' + A + ' m=' + Mm); near(long.P.at(-1), eq.P, 0.5, 'predators → P*');
    ok(L.prey !== null, 'prey has a first peak');
    if (L.pred) { ok(L.pred.t > L.prey.t, 'predator peak after prey peak'); lagMin = Math.min(lagMin, L.lag); lagMax = Math.max(lagMax, L.lag); grid++; }
  } else {
    const long = M.simPP(A, Mm, { ...PP5, T: 400 });
    ok(long.P.at(-1) < 0.5 && long.N.at(-1) > 990, 'predators die out, prey → K');
  }
}
ok(grid > 30, 'most slider combinations show both peaks');
// default numbers in the readout
{ const L = M.ppLag(0.03, 0.3, PP5), eq = M.ppEq(0.03, 0.3, PP5);
  near(eq.N, 200, 1e-9, 'N* = 200'); near(eq.P, 13.33, 0.01, 'P* ≈ 13.3');
  near(L.prey.t, 6.84, 0.05, 'prey peak ≈ 6.8 yr'); near(L.pred.t, 11.08, 0.05, 'predator peak ≈ 11.1 yr');
  // swings shrink: successive prey peaks get lower
  const hs = L.preyPeaks.map(q => q.v); for (let i = 1; i < hs.length; i++) ok(hs[i] < hs[i - 1], 'prey peaks shrink');
  // counter-clockwise in the (N across, P up) plane: positive signed area of the first loop
  let area = 0; const s = L.sim; for (let i = 1; i < s.ts.length && s.ts[i] < 25; i++) area += (s.N[i - 1] * s.P[i] - s.N[i] * s.P[i - 1]) / 2;
  ok(area > 0, 'trajectory turns counter-clockwise');
}
// larger m → equilibrium prey moves right
for (let m = 0.2; m < 0.55; m += 0.05) ok(M.ppEq(0.03, m + 0.05, PP5).need > M.ppEq(0.03, m, PP5).need, 'N* grows with m');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['foot']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const k of zk) ok(!/左图|右图|left chart|right chart|left panel|right panel/i.test(STRINGS[l][k]), 'no left/right figure references in ' + k);

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['b0', 'd0', 'n1', 'k1', 'n2', 'sweep2', 'checkQuiz', 'n03', 'r3', 'k3', 't3', 'play3', 'h4', 'a5', 'm5', 'play5']) ok(html.includes(`id="${id}"`), 'control ' + id);
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
ok(fs.existsSync(path.join(dir, '../../../biology/ecology/population-ecology/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS population-ecology core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · predator lag ${lagMin.toFixed(1)}–${lagMax.toFixed(1)} yr`);
