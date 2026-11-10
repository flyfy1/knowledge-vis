'use strict';
// Reaction-rates (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`. Simulation checks use fixed seeds.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };

// ---- energy bookkeeping: collisions are elastic, the thermostat sets T exactly ----
{
  const g = M.makeGas({ nA: 30, nB: 30, T: 300, seed: 1 });
  near(M.measuredT(g), 300, 1e-9, 'initial T exact');
  for (let i = 0; i < 1200; i++) M.stepGas(g);
  near(M.measuredT(g), 300, 1e-6, 'elastic: T conserved over 10 s');
  M.thermalise(g, 500); near(M.measuredT(g), 500, 1e-9, 'thermalise sets the readout T');
  near(M.meanSpeed(300), M.SIGMA300 * Math.sqrt(Math.PI / 2), 1e-12, '2-D mean speed');
}

// ---- step 0: success fraction e^(−2) at 300 K; the stochastic count agrees ----
const f300 = M.successFraction(2, 300);
near(f300, Math.exp(-2), 1e-12, 'formula'); near(f300 * 100, 13.5, 0.05, '13.5 %');
{
  const r = M.measureGas({ nA: 30, nB: 30, T: 300, seed: 1 }, 300);
  near(r.frac, f300, 0.015, 'step 0 measured fraction'); ok(r.frac < 0.2, 'most collisions fail');
  near(r.coll / M.collisionRate(30, 30, 300), 1, 0.1, 'step 0 collision rate ≈ formula');
}
// the x-axis of the bar chart holds 20 whole seconds and the log keeps 30 s
ok(120 * 30 >= 20 * Math.round(1 / M.DT), 'tick log covers the 20 bars');
ok(M.collisionRate(30, 30, 300) < 30, 'bar axis floor (30/s) covers step 0');

// ---- step 1: collisions ∝ N_A·N_B, fraction unchanged ----
const zs = {};
for (const n of [10, 20, 30, 40, 50, 60]) {
  const r = M.measureGas({ nA: n, nB: n, T: 300, seed: 100 + n }, n <= 20 ? 400 : 150);
  zs[n] = r.coll / M.collisionRate(n, n, 300);
  ok(zs[n] > 0.85 && zs[n] < 1.15, `measured/formula within 15 % at n = ${n}: ${zs[n]}`);
  near(r.frac, f300, 0.03, 'fraction unchanged at n = ' + n);
  ok(r.coll < 80, 'y axis (80/s) holds n = ' + n);
}
ok(zs[60] > 1, 'crowded box sits above the dilute formula');
near(M.collisionRate(40, 40, 300) / M.collisionRate(20, 20, 300), 4, 1e-12, 'both doubled → ×4');
near(M.collisionRate(40, 20, 300) / M.collisionRate(20, 20, 300), 2, 1e-12, 'quiz: one doubled → ×2');
{
  const a = M.measureGas({ nA: 20, nB: 20, T: 300, seed: 7 }, 400), b = M.measureGas({ nA: 40, nB: 20, T: 300, seed: 8 }, 400);
  near(b.ok / a.ok, 2, 0.45, 'quiz: successes roughly double in the simulation too');
}

// ---- step 2: temperature changes both factors, the fraction much more ----
near(M.collisionRate(30, 30, 600) / M.collisionRate(30, 30, 300), Math.SQRT2, 1e-12, '300→600 K: collisions ×√2 (+41 %)');
for (let T = 325; T <= 600; T += 25) {
  const zr = M.collisionRate(30, 30, T) / M.collisionRate(30, 30, 300), fr = M.successFraction(2, T) / f300;
  ok(fr > zr && fr > 1 && zr > 1, `fraction grows faster than collisions at ${T} K`);
}
for (const T of [200, 400, 600]) { const r = M.measureGas({ nA: 30, nB: 30, T, seed: 2 }, 200); near(r.frac, M.successFraction(2, T), 0.03, 'measured fraction at ' + T + ' K'); }
ok(M.successFraction(2, 600) < 0.4 && M.successFraction(2, 200) > 0, 'fraction axis 0–40 %');
ok(300 / 200 < 1.6, 'histogram y max 1.6 holds the 200 K density at 0');
// theoretical collision-energy density integrates to 1 and its tail above the bar is the success fraction
for (const T of [200, 300, 600]) {
  let s = 0, tail = 0; for (let e = 0.0005; e < 60; e += 0.001) { const p = 300 / T * Math.exp(-e * 300 / T); s += p * 0.001; if (e >= 2) tail += p * 0.001; }
  near(s, 1, 2e-3, 'density normalised'); near(tail, M.successFraction(2, T), 2e-3, 'tail = success fraction');
}

// ---- step 3: a catalyst moves the bar; trajectories and speeds are untouched ----
{
  const a = M.makeGas({ nA: 30, nB: 30, T: 300, e0: 2, seed: 3 }), b = M.makeGas({ nA: 30, nB: 30, T: 300, e0: 1, seed: 3 });
  for (let i = 0; i < 2400; i++) { M.stepGas(a); M.stepGas(b); }
  ok(a.x.every((v, i) => v === b.x[i]) && a.vx.every((v, i) => v === b.vx[i]), 'same motion with or without the catalyst');
  ok(a.coll === b.coll && b.ok > a.ok, 'same collisions, more successes');
  near(M.meanSpeedOf(a), M.meanSpeed(300), 0.05 * M.meanSpeed(300), 'mean speed ≈ 300 K value');
}
near(M.successFraction(1, 300) / f300, Math.E, 1e-12, 'bar 2 → 1 multiplies successes by e');
ok(M.successFraction(0.5, 300) < 0.7, 'fraction axis 0–70 % holds bar 0.5');
for (const e0 of [0.5, 1, 3, 4]) { const r = M.measureGas({ nA: 30, nB: 30, T: 300, e0, seed: 3 }, 200); near(r.frac, M.successFraction(e0, 300), 0.03, 'measured fraction at bar ' + e0); }
ok(300 / 300 < 1.2, 'histogram y max 1.2 holds the 300 K density at 0 (= 1)');

// ---- step 4: only the surface is hit; hits grow with the exposed edge; fraction unchanged ----
const hits = {};
for (const piece of M.PIECES) {
  ok(M.solidSites(piece).length === 36, 'always 36 molecules');
  let c = 0, f = 0;
  for (const seed of [40 + piece, 50 + piece]) { const r = M.measureSolid({ piece, nA: 60, T: 300, seed }, 250); c += r.coll / 2; f += r.frac / 2; ok(r.interiorHits === 0, 'inner molecules never hit'); }
  hits[piece] = c; near(f, f300, 0.03, 'fraction unchanged for piece ' + piece);
  ok(c < 60, 'y axis (60/s) holds piece ' + piece);
}
assert.deepEqual(M.PIECES.map(M.perimeter), [24, 48, 72, 144]); checks++;
assert.deepEqual(M.PIECES.map(M.exposedCount), [20, 32, 36, 36]); checks++;
for (let i = 1; i < M.PIECES.length; i++) ok(hits[M.PIECES[i]] > hits[M.PIECES[i - 1]], 'more edge → more hits');
{ const ratio = hits[1] / hits[6]; ok(ratio > 6 && ratio < 10, 'powder vs block: hits grow a little faster than the 6× edge: ' + ratio); }
ok(M.pieceLayout(1).every(P => P.cx - P.L / 2 > M.RG && P.cy - P.L / 2 > M.RG), 'pieces inside the box');

// ---- step 5: real units ----
near(M.e0ToKJ(2), 5.0, 0.02, 'bar 2.0 ≈ 5.0 kJ/mol');
{ const f50 = Math.exp(-50000 / (M.R_GAS * 298)); ok(f50 * 1e9 > 1 && f50 * 1e9 < 2, 'one or two per billion at 50 kJ/mol: ' + f50); }
near(M.rateRatio(50, 298, 308), 2, 0.06, '10 K at 50 kJ/mol ≈ ×2');
near(M.collisionRatio(298, 308), 1.017, 0.0005, 'collisions only ×1.017');
for (let ea = 25; ea <= 100; ea += 5) ok(M.rateRatio(ea, 298, 308) > M.rateRatio(ea - 5, 298, 308), 'larger Ea → steeper');
ok(M.rateRatio(40, 298, 308) > 1.6 && M.rateRatio(60, 298, 308) < 2.3, '“roughly doubles” holds near 50 kJ/mol only');
for (let ea = 20; ea <= 100; ea += 5) for (let T = 273; T <= 348; T++) { const r = M.rateRatio(ea, 298, T); ok(r > 0.01 && r < 1000, `log axis 0.01–1000 holds Ea ${ea}, T ${T}`); }

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5') && STRINGS[l].foot.includes(l === 'zh' ? '反应速率 · 数一数成功碰撞' : 'Reaction Rates · Counting Successful Collisions'), 'footer names the model and the original');
for (const l of ['zh', 'en']) for (const k of zk) ok(!/左图|右图|left chart|right chart|left panel|right panel/i.test(STRINGS[l][k]), 'no left/right chart references: ' + k);

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const k of ['c2hist', 'c3frac', 'quizRight', 'quizWrong', 'quizNone', 'pause', 'resume', 'advance']) ok(app.includes(`'${k}'`), 'app uses ' + k);
for (const id of ['pause0', 'reset0', 'n1', 'pause1', 'checkQuiz', 't2', 'pause2', 'e3', 'noCat', 'withCat', 'pause3', 'p4', 'pause4', 'ea5', 't5', 's5e']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder + stylesheet');
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
ok(fs.existsSync(path.join(dir, '../../../chemistry/reactions/reaction-rates/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS reaction-rates core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · Z ratio n=10..60 ${Object.values(zs).map(v => v.toFixed(2)).join('/')} · powder/block ${(hits[1] / hits[6]).toFixed(2)}`);
