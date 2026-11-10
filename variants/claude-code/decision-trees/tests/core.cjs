'use strict';
// Decision trees (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);

const TR = M.train(), TE = M.test();
// ---- data as described ----
ok(TR.length === 80 && TE.length === 600, '80 training students, 600 new');
TR.forEach(p => ok(p.x[0] >= 0 && p.x[0] <= 12 && p.x[1] >= 4 && p.x[1] <= 10, 'ranges'));
const flips = TR.filter(p => p.flipped).length;
ok(flips === 2, 'two flipped labels in the training set (s3hint: "the two points whose labels were flipped")');
// flips are nested as the noise rises
for (let a = 0; a <= 30; a += 2) for (let b = a; b <= 30; b += 2) { const A = M.train(a / 100), B = M.train(b / 100); A.forEach((p, i) => { if (p.flipped) ok(B[i].flipped, 'nested flips'); }); }
// test-set flip share ≈ 8 % (s0e "about 8 %")
near(M.test().filter(p => p.flipped).length / 600, 0.08, 0.02, 'test flips ≈ 8 %');

// ---- step 0: best single question ----
let best0 = { e: Infinity };
for (let f = 0; f < 2; f++) for (const thr of M.candidates(TR, f)) { const c = M.cutStats(TR, f, thr); if (c.errors < best0.e) best0 = { e: c.errors, f, thr }; }
ok(best0.f === 0 && best0.e === 10, 'fewest mistakes with one question: study, 10 errors');
// s0hint: dragging study 0 → 12 the error count first falls then rises
{ const errs = []; for (let v = 0; v <= 12; v += 0.5) errs.push(M.cutStats(TR, 0, v).errors); const mi = errs.indexOf(Math.min(...errs)); ok(mi > 0 && mi < errs.length - 1 && errs[0] > errs[mi] && errs[errs.length - 1] > errs[mi], 'falls then rises'); }
// the slider grid of step 0 reaches the best (study at 5.0)
ok(M.cutStats(TR, 0, 5).errors === 10, 'slider value 5 hits the optimum');

// ---- step 1: impurity measures ----
for (let i = 1; i < 100; i++) {
  const p = i / 100;
  near(M.errRate(p), Math.min(p, 1 - p), 1e-15, 'error'); near(M.gini(p), 2 * p * (1 - p), 1e-15, 'gini');
  ok(M.H2(p) <= 1 + 1e-12 && M.gini(p) <= 0.5 + 1e-12, 'max at 1/2');
}
ok(M.H2(0) === 0 && M.H2(1) === 0 && Math.abs(M.H2(0.5) - 1) < 1e-15, 'entropy 0 at ends, 1 at half');
// default (12 left, all pass): error decrease 0, gini/entropy > 0 (s1flat)
const d12 = ['error', 'gini', 'entropy'].map(m => M.decrease(m, 40, 28, 12, 12).gain);
ok(Math.abs(d12[0]) < 1e-12 && d12[1] > 0.05 && d12[2] > 0.15, 'default: error flat, gini and entropy drop');
// (20, 14): all zero (s1hint, s1none)
['error', 'gini', 'entropy'].forEach(m => ok(Math.abs(M.decrease(m, 40, 28, 20, 14).gain) < 1e-12, 'no information ' + m));
// concavity: over the whole slider range gini/entropy decrease ≥ 0 and > 0 whenever the shares differ;
// the error-rate decrease is 0 whenever both children keep a pass majority (≥ 1/2)
for (let nL = 4; nL <= 36; nL++) for (let kL = Math.max(0, nL - 12); kL <= Math.min(nL, 28); kL++) {
  const pL = kL / nL, pR = (28 - kL) / (40 - nL), same = Math.abs(pL - 0.7) < 1e-12;
  for (const m of ['gini', 'entropy']) { const g = M.decrease(m, 40, 28, nL, kL).gain; ok(g >= -1e-12 && (same || g > 1e-9), `${m} decrease ≥ 0 at ${nL},${kL}`); }
  const ge = M.decrease('error', 40, 28, nL, kL).gain;
  ok(ge >= -1e-12, 'error decrease ≥ 0');
  if (pL >= 0.5 && pR >= 0.5) ok(Math.abs(ge) < 1e-12, 'error flat when both keep a pass majority');
  // the weighted average lies on the chord at p = 0.7 (the picture)
  for (const m of ['error', 'gini', 'entropy']) { const f = M.MEASURES[m], d = M.decrease(m, 40, 28, nL, kL); const lam = (0.7 - pR) / ((pL - pR) || 1); if (!same) near(d.after, f(pR) + lam * (f(pL) - f(pR)), 1e-12, 'chord'); }
}

// ---- step 2: scan ----
const bc = M.bestCut(TR);
ok(bc.f === 0 && Math.abs(bc.thr - 5) < 1e-9, 'best first cut: study < 5');
near(bc.gain, 0.558, 0.001, 'best gain 0.558');
const sleepBest = Math.max(...M.scan(TR, 1).map(c => c.gain));
ok(sleepBest < bc.gain && Math.abs(M.scan(TR, 1).find(c => c.gain === sleepBest).thr - 6.5) < 1e-9, 'sleep best at 6.5, smaller');
// gain on the 0.05 slider grid (app) attains the same maximum as the midpoint scan (model)
for (let f = 0; f < 2; f++) { const R = M.FEAT[f]; let mx = 0; for (let v = R.min; v <= R.max + 1e-9; v += 0.05) mx = Math.max(mx, M.cutStats(TR, f, Math.round(v * 100) / 100).gain); near(mx, Math.max(...M.scan(TR, f).map(c => c.gain)), 1e-12, 'grid max = scan max ' + f); }
// gain is a staircase that changes only between data values; canonical maps to the midpoint
ok(Math.abs(M.canonical(TR, 0, 4.97) - 5) < 1e-9 || Math.abs(M.canonical(TR, 0, 4.97) - M.canonical(TR, 0, 5)) < 1e-9, 'canonical threshold');
ok(M.cutStats(TR, 0, 5).gain <= 0.6, 'gain axis 0..0.6 holds');
for (let f = 0; f < 2; f++) for (const c of M.scan(TR, f)) ok(c.gain >= -1e-12 && c.gain <= 0.6, 'gain inside the axis');

// ---- step 3: growth ----
const acc = d => M.accuracy(M.grow(TR, d), TR);
near(acc(1), 0.875, 1e-12, 'depth 1: 87.5 %');
near(acc(2), 0.875, 1e-12, 'depth 2: unchanged (s3same, s3hint)');
ok(M.leaves(M.grow(TR, 2)).length > M.leaves(M.grow(TR, 1)).length, 'but a leaf was added');
{ const T2 = M.grow(TR, 2); const r = T2.right; ok(r.cut && r.cut.f === 1 && r.right.k === r.right.n && r.right.n > 0, 'layer 2 makes the "sleeps a lot" group all pass'); }
near(acc(3), 0.975, 1e-12, 'depth 3: 97.5 %');
{ const T3 = M.grow(TR, 3); const wrong = TR.filter(p => M.predict(T3, p.x) !== p.y); ok(wrong.length === 2 && wrong.every(p => p.flipped), 'depth 3 misses exactly the two flipped points'); }
ok(acc(6) === 1, 'depth 6 fits everything');
for (let d = 1; d <= 6; d++) ok(acc(d) >= acc(d - 1) - 1e-12, 'training accuracy never falls with depth');
for (let d = 0; d <= 6; d++) ok(M.depthOf(M.grow(TR, d)) <= d, 'depth limit respected');
// leaf boxes partition the plane: every training point lands in exactly one leaf box
{ const T = M.grow(TR, 6), L = M.leaves(T); TR.forEach(p => ok(L.filter(l => p.x[0] >= l.box[0][0] && p.x[0] < l.box[0][1] && p.x[1] >= l.box[1][0] && p.x[1] < l.box[1][1]).length === 1, 'one box')); }

// ---- step 4: depth vs test accuracy ----
const c8 = M.depthCurve(0.08);
near(c8[3].test, 0.92, 0.0005, 'depth 3 test 92 %');
near(M.ruleAccuracy(0.08), 0.92, 0.0005, 'ceiling 92 % at 8 %');
ok(c8.findIndex(r => r.test === Math.max(...c8.map(q => q.test))) === 3, 'peak at depth 3');
ok((c8[10].test * 100).toFixed(0) === '84' && c8[10].train === 1, 'depth 10: train 100 %, test 84 %');
const c0 = M.depthCurve(0);
for (let d = 1; d <= 10; d++) ok(c0[d].test >= c0[d - 1].test - 1e-12, 'no noise: test never falls');
for (const nz of [0, 0.04, 0.08, 0.12, 0.16, 0.2, 0.24, 0.28]) { const c = M.depthCurve(nz); ok(c[10].train >= 0.98, 'deep trees fit training ' + nz); c.forEach(r => ok(r.test >= 0.3 && r.test <= 1, 'axis 30–100 %')); ok(M.ruleAccuracy(nz) >= 0.3, 'ceiling in axis'); }
// raising the flips: lower peak and a bigger drop from peak to depth 10
const drop = c => Math.max(...c.map(r => r.test)) - c[10].test, peak = c => Math.max(...c.map(r => r.test));
const c20 = M.depthCurve(0.2);
ok(peak(c20) < peak(c8) && drop(c20) > drop(c8), 'more flips: lower peak, larger drop');
// the ceiling really is the best any classifier can do on average here: test peak never exceeds it by much
for (const nz of [0.04, 0.08, 0.16, 0.24]) ok(peak(M.depthCurve(nz)) <= M.ruleAccuracy(nz) + 0.01, 'peak ≤ ceiling ' + nz);

// ---- step 5: XOR ----
const X = M.XOR_PTS, XT = M.XOR_TEST;
const xr = M.bestCut(X);
ok(xr.gain < 0.05 && xr.f === 0 && Math.abs(xr.thr - 0.925) < 1e-9, 'greedy root: a < 0.925, gain < 0.05');
for (let f = 0; f < 2; f++) for (let i = 1; i < 100; i++) ok(M.cutStats(X, f, i / 100).gain < 0.05, 'all single-cut gains below 0.05');
{ const tes = [1, 2, 3, 4].map(d => (M.accuracy(M.grow(X, d), XT) * 100).toFixed(0)); ok(Math.min(...tes) === 47 && Math.max(...tes) === 58, 'greedy depth 1–4: new data 47–58 % ' + tes); }
const F2 = M.grow(X, 2, 0, { f: 0, thr: 0.5 });
ok(M.accuracy(F2, X) === 1, 'forced: 100 % training at depth 2');
ok((M.accuracy(F2, XT) * 100).toFixed(0) === '99', 'forced: 99 % new data');
ok(M.accuracy(M.grow(X, 1, 0, { f: 0, thr: 0.5 }), XT) < 0.6, 'forced depth 1 alone is useless');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) ok(!/左图|右图|上图左|left plot|right plot|left chart|right chart/.test(v), 'no left/right chart references');

// ---- HTML/app keys and controls ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['f0a', 'f0b', 't0', 'm1e', 'm1g', 'm1h', 'nl1', 'kl1', 'f2a', 'f2b', 't2', 'scan2', 'clear2', 'd3', 'grow3', 'reset3', 'd4', 'z4', 'g5', 'h5', 'd5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder');

// ---- deep links ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../computing/ml/decision-trees/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS decision-trees core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · best cut study<${bc.thr} gain ${bc.gain.toFixed(3)} · depth-3 test ${(c8[3].test * 100).toFixed(1)}%`);
