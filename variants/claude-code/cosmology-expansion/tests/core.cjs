'use strict';
// Cosmic expansion (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const both = (key, s, s2 = s) => { ok(STRINGS.zh[key].includes(s), `zh.${key} quotes ${s}`); ok(STRINGS.en[key].includes(s2), `en.${key} quotes ${s2}`); };

// ---- step 0: every distance scales by a, seen from any home galaxy ----
const HOMES = [[0, 0], [3, -1], [-2, 2], [5, 3], [-4, -3]];
for (const home of HOMES) for (let a = 0.5; a <= 2.0001; a += 0.05) {
  for (let i = -6; i <= 6; i++) for (let j = -6; j <= 6; j++) {
    const g = [home[0] + i, home[1] + j], d1 = M.dist(M.separation(1, home, g)), da = M.dist(M.separation(a, home, g));
    if (d1 > 0) near(da / d1, a, 1e-12, 'distance ratio = a');
    // direction unchanged: the dot moves along the line from the centre
    const u = M.separation(1, home, g), v = M.separation(a, home, g); near(u[0] * v[1] - u[1] * v[0], 0, 1e-9, 'radial motion');
  }
}
// the lattice is not a perfect grid, but neighbours sit about 10 Mpc apart (s0hint/legend: spacing)
for (let i = -5; i <= 5; i++) { const d = M.dist(M.separation(1, [i, 0], [i + 1, 0])); ok(d > 5 && d < 15, 'neighbour spacing ≈ 10 Mpc'); }
both('s0e', '326', '3.26');

// ---- step 1: Hubble's law from d = aχ ----
for (const home of HOMES) for (const H of [50, 70, 90]) for (let i = -5; i <= 5; i++) for (let j = -5; j <= 5; j++) {
  const g = [home[0] + i, home[1] + j], d = M.dist(M.separation(1, home, g)); if (!d) continue;
  near(M.dist(M.velocity(H, 1, home, g)) / d, H, 1e-9, 'v/d = H for every galaxy and every home');
}
// numerical derivative of d = aχ with a(t) from the step-4 model reproduces H0·d today
{ const Om = 0.3, t0 = M.age(Om), dt = 1e-5, adot = (M.scaleAt(t0 + dt, Om) - M.scaleAt(t0 - dt, Om)) / (2 * dt);
  near(adot / 1 * M.hubbleTime(70), 1, 1e-6, '(da/dt)/a at a = 1 equals H0'); }
near(M.hubbleTime(70), 13.97, 0.005, 'Hubble time for H0 = 70'); both('s1e', '140 亿年', '14 billion years'); both('s1e', '67–73');
// step 1 shows galaxies within 46 Mpc: v up to 90 × 46 ≤ 5000 km/s fits the 0–5000 axis, d fits 0–50
ok(90 * 46 <= 5000 && 46 <= 50, 'v axis holds the fastest point');

// ---- step 2: measuring H0 with peculiar velocities ----
ok(M.N_SETS === 6 && M.N_CAT === 40 && M.SIG_PEC === 300 && M.H_TRUE === 70, 'simulation settings quoted in s2e');
both('s2e', '40'); both('s2e', '300 km/s'); both('s2e', '70'); both('s2readout', '/6');
const worst = dm => Math.max(...[1, 2, 3, 4, 5, 6].map(s => Math.abs(M.fitH(M.catalogue(s, dm)) - 70) / 70 * 100));
ok(worst(20) > 5.5 && worst(20) < 6.5, 'worst error at 20 Mpc ≈ 6%: ' + worst(20)); both('s2hint', '6%');
ok(worst(200) < 1 && worst(300) < 1 && worst(400) < 1, 'under 1% from 200 Mpc'); both('s2hint', '1%'); both('s2hint', '200 Mpc');
for (let k = 1; k < M.DMAX.length; k++) ok(M.sigmaH(M.DMAX[k]) < M.sigmaH(M.DMAX[k - 1]), 'expected error shrinks with depth');
// fitH is the least-squares slope through the origin
{ const cat = M.catalogue(3, 50), h = M.fitH(cat), sse = s => cat.reduce((q, p) => q + (p.v - s * p.d) ** 2, 0);
  ok(sse(h) <= sse(h + 0.01) && sse(h) <= sse(h - 0.01), 'fit minimises squared misses'); }
// the analytic σ_H matches the scatter of many independent simulations (within 10%)
for (const dm of [20, 100]) {
  let s = 0, s2 = 0; const R = 600;
  for (let seed = 101; seed < 101 + R; seed++) { const h = M.fitH(M.catalogue(seed, dm)); s += h; s2 += h * h; }
  const mean = s / R, sd = Math.sqrt(s2 / R - mean * mean);
  near(mean, 70, 3 * M.sigmaH(dm) / Math.sqrt(R) + 0.05, 'unbiased on average at ' + dm);
  ok(Math.abs(sd / M.sigmaH(dm) - 1) < 0.1, `σ formula vs simulation at ${dm}: ${sd} vs ${M.sigmaH(dm)}`);
}
// every fitted value on the slider stays inside the lower chart's 55–85 range for the six sets
for (const dm of M.DMAX) for (let s = 1; s <= 6; s++) { const h = M.fitH(M.catalogue(s, dm)); ok(h > 55 && h < 85, 'fit inside axis'); }

// ---- step 3: redshift ----
for (let ae = 0.1; ae <= 1.0001; ae += 0.01) {
  near(1 + M.redshift(ae), 1 / ae, 1e-12, '1 + z = 1/a');
  near(M.observed(656.3, ae) / 656.3, 1 + M.redshift(ae), 1e-12, 'λ ratio = 1 + z');
  ok(M.observed(656.3, ae) <= 8000, 'observed line inside the log axis');
}
near(M.observed(656.3, 0.5), 1312.6, 1e-9, 'a = 0.5 → 1312.6 nm'); both('s3hint', '1313'); both('s3hint', '656');
near(M.redshift(0.1), 9, 1e-12, 'a = 0.1 → z = 9'); both('s3hint', 'z = 9');
ok(M.observed(656.3, 0.88) < 750 && M.observed(656.3, 0.87) > 750, 'Hα leaves the visible band near a ≈ 0.875');
// light-travel time in the animation's model equals the lookback time
near(M.lookback(1), M.age(0.3) - M.timeAt(0.5, 0.3), 1e-12, 'lookback at z = 1');

// ---- step 4: expansion history ----
for (let Om = 0.05; Om <= 1.0001; Om += 0.05) {
  near(M.timeAtNumeric(1, Om), M.age(Om), 1e-4, 'closed-form age vs integral, Ωm=' + Om.toFixed(2));
  for (const tt of [0.5, 3, 10, 20, 30]) near(M.timeAt(M.scaleAt(tt, Om), Om), tt, 1e-9, 'scaleAt inverts timeAt');
  // every curve has slope H0 at a = 1 (s4hint)
  const t0 = M.age(Om), dt = 1e-5; near((M.scaleAt(t0 + dt, Om) - M.scaleAt(t0 - dt, Om)) / (2 * dt) * M.hubbleTime(70), 1, 1e-5, 'slope at today = H0');
  // acceleration switch: second derivative changes sign at accelA
  const aA = M.accelA(Om);
  if (isFinite(aA) && aA < 2.5) {
    const tA = M.timeAt(aA, Om), h = 0.05, dd = tt => M.scaleAt(tt + h, Om) - 2 * M.scaleAt(tt, Om) + M.scaleAt(tt - h, Om);
    ok(dd(tA - 0.5) < 0 && dd(tA + 0.5) > 0, 'deceleration → acceleration at accelA, Ωm=' + Om.toFixed(2));
  }
  near(M.q0(Om) < 0, Om < 2 / 3, 0, 'q0 < 0 exactly when Ωm < 2/3');
}
near(M.age(0.3), 13.47, 0.005, 'age at Ωm = 0.3'); both('s6fin', '13.5');
near(M.age(1), 2 / 3 * M.hubbleTime(70), 1e-12, 'Einstein–de Sitter age = (2/3)/H0'); near(M.age(1), 9.31, 0.005, '9.3 Gyr'); both('s4hint', '9.3'); both('s4hint', '2/3');
ok(!isFinite(M.accelA(1)), 'no acceleration without dark energy');
near(M.accelA(0.3), 0.598, 0.001, 'switch at a ≈ 0.60 for Ωm = 0.3');

// ---- step 5: three distances ----
const d1 = M.distances(1);
near(d1.chiGly, 10.8, 0.05, 'comoving at z = 1'); near(d1.travelGly, 7.7, 0.05, 'light travel at z = 1'); near(d1.chiGly / d1.travelGly, 1.4, 0.05, 'ratio 1.4');
both('s5hint', '10.8'); both('s5hint', '7.7'); both('s5hint', '1.4');
near(M.zEmitPeak(), 1.6, 0.05, 'emission distance peaks at z ≈ 1.6'); near(M.distances(M.zEmitPeak()).emitGly, 5.7, 0.05, 'peak ≈ 5.7 Gly'); both('s5hint', '1.6'); both('s5hint', '5.7');
near(M.zAtHubbleDistance(), 1.46, 0.005, 'v = c today at z ≈ 1.46'); both('s5hint', '1.46');
near(M.hubbleDist(70) * M.GLY_PER_MPC, 13.97, 0.01, 'Hubble distance ≈ 14 Gly'); both('s5e', '140 亿光年', '14 billion light-years');
for (let z = 0.05; z <= 10; z += 0.05) {
  const d = M.distances(z);
  ok(d.chiGly > d.travelGly && d.travelGly > d.emitGly, 'ordering comoving > light-travel > emission at z=' + z.toFixed(2));
  ok(d.chiGly < 35, 'inside the 35 Gly axis');
  ok((d.vOverC > 1) === (z > M.zAtHubbleDistance()), 'superluminal note exactly beyond z_H');
}
// small z: all three agree with cz/H0 (Hubble's law limit)
{ const d = M.distances(0.01), cz = 0.01 * M.hubbleDist(70) * M.GLY_PER_MPC; ok(Math.abs(d.chiGly / cz - 1) < 0.01 && Math.abs(d.travelGly / cz - 1) < 0.02, 'curves coincide near z = 0'); }
// neglecting radiation changes nothing visible (boundary note: < 0.1%)
ok(Math.abs(M.comoving(10, 0.3, 70, 9e-5) / M.comoving(10) - 1) < 1e-3, 'radiation: comoving distance');
ok(Math.abs(M.timeAtNumeric(1, 0.3, 70, 9e-5) / M.age(0.3) - 1) < 1e-3, 'radiation: age');
both('boundary', '0.1%');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['s1lgLine']); // symbols only
for (const k of zk) if (!NEUTRAL.has(k)) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const k of zk) ok(!/左图|右图|left chart|right chart|on the left|on the right/i.test(STRINGS[l][k]), 'no left/right chart wording in ' + k);

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['a0', 'home0', 'h1', 'home1', 'd2', 'reroll2', 'clear2', 'ae3', 'play3', 'om4', 'z5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder and stylesheet');
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
ok(fs.existsSync(path.join(dir, '../../../earth/astronomy/cosmology-expansion/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS cosmology-expansion core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · age ${M.age(0.3).toFixed(2)} Gyr · z_H ${M.zAtHubbleDistance().toFixed(3)}`);
