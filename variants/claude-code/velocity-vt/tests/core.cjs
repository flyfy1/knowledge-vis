'use strict';
// Velocity–time (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const nearC = (a, b, tol, msg) => { near(a, b, tol, msg); checks++; };

// distanceAt really is the area under speedAt (fine midpoint sum), for every profile used on the page.
const numeric = (P, T, n = 20000) => { let s = 0; const d = T / n; for (let i = 0; i < n; i++) s += M.speedAt(P, (i + 0.5) * d) * d; return s; };
for (const P of [M.constant(3), M.RUNNER_C, M.TRIP, M.QUIZ]) for (const T of [0.5, 2, 4, 6.3, 8, 9, 12.7, 15]) nearC(M.distanceAt(P, T), numeric(P, T), 1e-6, 'area = distance');

// Step 0: uniform motion, s = v·t, equal gaps of v between per-second marks.
for (let v = 1; v <= 6; v++) for (let k = 0; k <= 16; k++) {
  const tt = k / 2; nearC(M.distanceAt(M.constant(v), tt), v * tt, 1e-12, 's = v t');
  if (tt >= 1) nearC(M.distanceAt(M.constant(v), Math.floor(tt)) - M.distanceAt(M.constant(v), Math.floor(tt) - 1), v, 1e-12, 'gap between marks = v');
}
// Track axes hold the farthest point: 6 m/s × 8 s = 48 m (steps 0, 1, 3); the bus's 115 m fits the 120 m track.
ok(6 * 8 <= 48, 'track length 48 m');

// Step 1: slope of the x–t line = speed; gap = |va − vb|·t; equal speeds → zero gap.
for (let va = 1; va <= 6; va++) for (let vb = 1; vb <= 6; vb++) for (let k = 0; k <= 80; k++) {
  const tt = k / 10, A = M.constant(va), B = M.constant(vb);
  nearC(Math.abs(M.distanceAt(A, tt) - M.distanceAt(B, tt)), Math.abs(va - vb) * tt, 1e-9, 'gap');
  if (k < 80) nearC(M.slope(A, tt, tt + 0.1), va, 1e-9, 'slope = speed');
}

// Step 2: runner C. Speeds up 1 m/s per second for 4 s, then holds 4 m/s; ends at 24 m; lag behind A is 8 m once level.
nearC(M.speedAt(M.RUNNER_C, 4), 4, 0, 'C reaches 4 m/s at 4 s'); nearC(M.distanceAt(M.RUNNER_C, 8), 24, 1e-12, 'C at 8 s');
for (let k = 0; k <= 80; k++) {
  const tt = k / 10, lag = M.distanceAt(M.constant(4), tt) - M.distanceAt(M.RUNNER_C, tt);
  if (tt >= 4) nearC(lag, 8, 1e-9, 'lag stays 8 m after 4 s');
  ok((M.speedAt(M.RUNNER_C, tt) < 4 - 1e-9) === (tt < 4), 's2noteUp exactly while t < 4');
}
for (let k = 0; k < 39; k++) ok(M.slope(M.RUNNER_C, (k + 1) / 10, (k + 2) / 10) > M.slope(M.RUNNER_C, k / 10, (k + 1) / 10), 'C x–t line keeps steepening before 4 s');
// x–t / v–t panel ranges hold the data: x ≤ 32 m, v ≤ 5 m/s.
ok(M.distanceAt(M.constant(4), 8) <= 32 && M.speedAt(M.RUNNER_C, 8) <= 5, 'step 2 axes');

// Step 3: rectangle area = v × t = number of 1 m cells.
for (let v = 1; v <= 6; v++) for (let d = 1; d <= 8; d++) { const a = M.distanceAt(M.constant(v), d); ok(Number.isInteger(a) && a === v * d, 'cells = v t'); }

// Step 4: strip sums. Low = 18(1 − 1/N), high = 18(1 + 1/N); gap = 36/N shrinks every time N grows; the exact 18 m stays between.
nearC(M.RAMP_EXACT, 18, 0, 'triangle ½·6·6');
let prevGap = Infinity;
for (const N of M.STRIPS) {
  const s = M.stripSums(N);
  nearC(s.low, 18 * (1 - 1 / N), 1e-9, 'low sum N=' + N); nearC(s.high, 18 * (1 + 1 / N), 1e-9, 'high sum N=' + N);
  ok(s.low < s.exact && s.exact < s.high, 'exact squeezed N=' + N);
  ok(s.gap < prevGap, 'gap shrinks'); prevGap = s.gap;
  ok(s.high <= 36 && s.low >= 0, 'step 4 right-panel axis 0–36');
}
nearC(M.stripSums(24).gap, 1.5, 1e-9, 'gap at 24 strips');

// Step 5: bus 20 + 80 + 15 = 115 m over 15 s, average 115/15 ≈ 7.67 m/s; triangles share the cruise height used in s5segs.
const trip = M.tripSummary(M.TRIP);
assert.deepEqual(trip.segs.map(s => s.area), [20, 80, 15]); checks++;
assert.deepEqual(trip.segs.map(s => s.kind), ['up', 'flat', 'down']); checks++;
nearC(trip.total, 115, 0, 'trip total'); nearC(trip.T, 15, 0, 'trip time'); nearC(trip.avg, 115 / 15, 1e-12, 'average');
ok(trip.avg.toFixed(2) === '7.67', 'average shown as 7.67');
ok(trip.segs[0].v1 === trip.segs[1].v0 && trip.segs[2].v0 === trip.segs[1].v0 && trip.segs[0].v0 === 0 && trip.segs[2].v1 === 0, 's5segs uses one height');
nearC(M.distanceAt(M.TRIP, 15), 115, 1e-12, 'x(15) = 115'); ok(115 <= 120 && 10 <= 12, 'step 5 axes');

// Step 6: self-check answers and distinct options (same rules app.js uses).
const Q = M.QUIZ, qs = M.tripSummary(Q), vAt = M.speedAt(Q, M.QUIZ_T), vmax = Math.max(...Q.map(p => p[1]));
nearC(vAt, 4, 0, 'v(2) = 4'); nearC(qs.total, 48, 0, 'quiz distance 48');
assert.deepEqual(qs.segs.map(s => s.area), [16, 24, 8]); checks++;
const q1 = [...new Set([vAt, M.QUIZ_T, vmax])], q2 = [...new Set([qs.total, vmax * qs.T, qs.segs.find(s => s.kind === 'flat').area])];
ok(q1.length === 3 && q2.length === 3, 'three distinct options each');
ok(qs.segs[0].v1 === vmax && qs.segs[1].v0 === vmax && qs.segs[2].v0 === vmax && qs.segs[0].v0 === 0 && qs.segs[2].v1 === 0, 'work line uses vmax as every height');
ok(M.QUIZ_T > qs.segs[0].t0 && M.QUIZ_T < qs.segs[0].t1, 'quiz time falls in the speeding-up part (work text)');
ok(vmax <= 10, 'step 6 axis');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['optV', 'optM']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
// numbers quoted in prose match the model
for (const l of ['zh', 'en']) {
  ok(STRINGS[l].s4e.includes('18 m') && STRINGS[l].s4lgExact.includes('18 m'), 'triangle 18 m quoted');
  ok(STRINGS[l].s5e.includes('10 m/s') && STRINGS[l].s5e.includes('15 s'), 'bus numbers quoted');
  ok(STRINGS[l].s2e.includes('4 m/s') && STRINGS[l].s2e.includes('2 m/s'), 'race numbers quoted');
}

// ---- every key referenced in HTML/app exists; controls present ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['v0', 't0', 'vA', 'vB', 't1', 'play1', 't2', 'play2', 'check2', 'v3', 't3', 'count3', 'n4', 'refine4', 't5', 'play5', 'avg5', 'check6', 'reveal6']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder');

// ---- deep links land on existing step anchors; comparison link exists ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../physics/mechanics/velocity-vt/index.html')), 'comparison link target exists');
for (let i = 0; i <= 7; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS velocity-vt core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
