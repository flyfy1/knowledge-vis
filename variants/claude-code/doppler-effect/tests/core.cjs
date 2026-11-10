'use strict';
// Doppler effect (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const c = M.C_AIR, f0 = M.F0;
const grid = (a, b, s) => { const o = []; for (let v = a; v <= b + 1e-9; v += s) o.push(Math.round(v * 1e6) / 1e6); return o; };

// ---- step 0: still source; arrivals every T, λ = c/f, 20 ms window, slow-motion factor ----
for (const f of grid(220, 880, 10)) {
  const arr = M.arrivals(f, c, 0, 3, 0, 0, 0.020);
  M.intervals(arr).forEach(d => near(d, 1 / f, 1e-12, 'still source: arrivals every T'));
  near(1 / M.meanInterval(arr), f, 1e-6, 'heard = emitted when nothing moves');
  ok(Math.abs(arr.length - 0.020 * f) <= 1, `about f × 20 ms crests in the window (f=${f})`);
}
near(6000 / 1000 / 0.020, 300, 1e-9, 'step 0 slow-motion factor 300');
// rings are λ apart along any ray
{ const r = M.rings(440, c, 0, 0.01, 6); for (let i = 1; i < r.length; i++) near(r[i - 1].r - r[i].r, c / 440, 1e-12, 'ring spacing = λ'); }

// ---- step 1: moving source; A ahead, B behind; measured intervals match f·c/(c ∓ v) ----
const T0 = 1 / f0;
for (const v of grid(0, 200, 10)) {
  const A = M.arrivals(f0, c, v, 5, 0, -8 * T0, 8 * T0), B = M.arrivals(f0, c, v, -5, 0, -8 * T0, 8 * T0);
  M.intervals(A).forEach(d => near(d, (c - v) / c * T0, 1e-12, 'A interval = (c − v)T/c'));
  M.intervals(B).forEach(d => near(d, (c + v) / c * T0, 1e-12, 'B interval = (c + v)T/c'));
  near(1 / M.meanInterval(A), f0 * c / (c - v), 1e-6, 'f ahead');
  near(1 / M.meanInterval(B), f0 * c / (c + v), 1e-6, 'f behind');
  ok(v * 8 * T0 < 5, 'source never reaches the listeners during the run');
  // ring spacing ahead/behind in the picture
  const r = M.rings(f0, c, v, 8 * T0, 20);
  for (let i = 1; i < r.length; i++) {
    const front = (r[i - 1].cx + r[i - 1].r) - (r[i].cx + r[i].r), back = (r[i].cx - r[i].r) - (r[i - 1].cx - r[i - 1].r);
    near(front, (c - v) / f0, 1e-9, 'λ ahead'); near(back, (c + v) / f0, 1e-9, 'λ behind');
  }
}
ok(200 / c > 0.58 && 200 / c < 0.6, 's1hint: 200 m/s ≈ 0.6 c');

// ---- step 2: source moves vs listener moves ----
for (const s of grid(-200, 200, 10)) {
  const T = 1 / f0, mid = 5 * T, xA0 = -3 - s * mid, xB0 = 5 + s * mid;
  const A = M.arrivals(f0, c, s, 5 - xA0, 0, 0, 10 * T), B = M.arrivalsMovingListener(f0, c, s, -3, xB0, 0, 10 * T);
  ok(A.length >= 4 && B.length >= 4, 'enough arrivals in both lanes');
  near(1 / M.meanInterval(A), M.heard(f0, c, 0, s), 1e-6, 'lane A = f c/(c − s)');
  near(1 / M.meanInterval(B), M.heard(f0, c, s, 0), 1e-6, 'lane B = f (c + s)/c');
  ok(s === 0 ? Math.abs(M.heard(f0, c, 0, s) - M.heard(f0, c, s, 0)) < 1e-9 : M.heard(f0, c, 0, s) > M.heard(f0, c, s, 0), 'source-moving is always the higher one (s ≠ 0)');
  // lane B crest spacing is the plain wavelength; lane A crests are (c − s)/f apart
  const cb = M.laneCrests(f0, c, 0, -3, 7 * T, -3, 9); for (let i = 1; i < cb.length; i++) near(cb[i] - cb[i - 1], c / f0, 1e-9, 'lane B spacing = λ');
  const ca = M.laneCrests(f0, c, s, xA0, 7 * T, xA0 + s * 7 * T, 9); for (let i = 1; i < ca.length; i++) near(ca[i] - ca[i - 1], (c - s) / f0, 1e-9, 'lane A spacing');
  // listener and source stay inside the drawn lane x ∈ [−6, 8] and never meet
  for (const tt of [0, 10 * T]) { const xs = -3 + s * (tt - mid), xl = 5 - s * (tt - mid); ok(xs >= -6 && xs < 5 && xl <= 8 && xl > -3, 'lane positions in view'); }
}
// curves nearly coincide for small s, separate for large s (s2hint)
ok(Math.abs(1 / (1 - 10 / c) - (1 + 10 / c)) < 1e-3, 'small s: curves coincide');
ok(Math.abs(1 / (1 - 200 / c) - (1 + 200 / c)) > 0.8, 'large s: curves apart');
// quiz numbers
near(M.heard(500, c, 0, 34), 555.6, 0.05, 'quiz: 555.6 Hz');
near(M.heard(500, c, 34, 0), 550, 1e-9, 'quiz: 550 Hz');
near(c / 500, 0.68, 1e-12, 'quiz: λ = 0.68 m'); near(374 / 0.68, 550, 1e-9, 'quiz: 374 ÷ 0.68');

// ---- step 3: pass-by ----
let slopes = [];
for (const v of grid(10, 80, 5)) for (const d of grid(5, 100, 5)) {
  for (const tr of grid(-3, 3, 0.25)) {
    const pb = M.passBy(f0, c, v, d, tr);
    near(pb.te + pb.r / c, tr, 1e-9, 'emission time solves te + r/c = tr');
    near(pb.f, M.passByNumeric(f0, c, v, d, tr), 1e-3, 'f′ formula = arrival rate of crests');
    ok(pb.f < M.heard(f0, c, 0, v) && pb.f > M.heard(f0, c, 0, -v), 'f′ stays between the two limits');
    ok(pb.f >= 340 && pb.f <= 600, 'curve inside the plotted range 340–600 Hz');
  }
  near(M.passBy(f0, c, v, d, d / c).f, f0, 1e-6, 'exactly 440 Hz at t = d/c');
  ok(M.passBy(f0, c, v, d, 0).f > f0, 'still above 440 Hz at t = 0 (car in front of you)');
  for (const tr of grid(-3, 2.99, 0.01)) ok(M.passBy(f0, c, v, d, tr).f >= M.passBy(f0, c, v, d, tr + 0.01).f - 1e-9, 'pitch only falls');
  if (v === 30) slopes.push(-(M.passBy(f0, c, v, d, d / c + 1e-4).f - M.passBy(f0, c, v, d, d / c - 1e-4).f) / 2e-4);
}
for (let i = 1; i < slopes.length; i++) ok(slopes[i] < slopes[i - 1], 'larger d → gentler slide');

// ---- step 4: echo ----
for (const u of grid(0, 40, 1)) {
  const r = M.reflect(40000, 340, u), twoLeg = M.heard(M.heard(40000, 340, u, 0), 340, 0, u);
  near(r.echo, twoLeg, 1e-6, 'echo = moving listener then moving source');
  near(M.speedFromBeat(40000, 340, r.beat), u, 1e-9, 'u back from Δf');
  if (u > 0) { ok(r.approx < r.beat, 'approximation is low'); near(r.relErr, u / 340, 1e-12, 'relative error = u/c'); }
  near(r.beat, r.echo - 40000, 1e-6, 'Δf = echo − sent'); if (u > 0) near((r.beat - r.approx) / r.beat, r.relErr, 1e-9, 'relErr definition');
  ok(r.beat <= 12000, 'Δf inside the plot (≤ 12000 Hz)');
  const be = u / 340, arr = M.echoArrivals(be, 20, 0, 20);
  M.intervals(arr).forEach(d => near(d, (1 - be) / (1 + be), 1e-9, 'echo crests arrive (1 − β)/(1 + β) T apart'));
  const L = M.echoLane(be, 20, 20); for (let i = 1; i < L.back.length; i++) near(L.back[i - 1] - L.back[i], (1 - be) / (1 + be), 1e-9, 'echo spacing in the lane');
  const rr = M.reflect(24.15e9, 3e8, u); if (u > 0) near(rr.relErr, u / 3e8, 1e-15, 'radar error = u/c');
}
near(M.reflect(24.15e9, 3e8, 30).beat, 4830, 0.01, 'radar 30 m/s → 4830 Hz');
ok(40 / 340 < 0.12 && 40 / 340 > 0.115, 's4hint: u/c up to about 0.12');

// ---- step 5: Mach ----
for (const Mn of grid(0.5, 2.5, 0.05)) {
  if (Mn <= 1 + 1e-9) { ok(M.machAngle(Mn) === null, 'no cone at M ≤ 1'); near(M.aheadSpacing(Mn), 1 - Mn, 1e-12, 'ahead spacing (1 − M)λ'); continue; }
  const a = M.machAngle(Mn); near(Math.sin(a), 1 / Mn, 1e-12, 'sin α = 1/M');
  // the cone line from the source (at 0, time 0) is tangent to every ring (centre −M·age, radius age)
  for (let age = 1; age <= 10; age++) { const dist = Mn * age * Math.sin(a); near(dist, age, 1e-9, 'cone tangent to ring'); }
}
near(M.machAngle(1.5) * 180 / Math.PI, 41.81, 0.01, 'M = 1.5 → 41.8°');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');

// ---- every key referenced in HTML/app exists; controls exist ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['f0', 'play0', 'v1', 'play1', 's2', 'play2', 'v3', 'd3', 't3', 'drive3', 'u4', 'play4', 'm5', 'play5', 'checkQuiz']) ok(html.includes(`id="${id}"`), 'control ' + id);
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
ok(fs.existsSync(path.join(dir, '../../../physics/waves/doppler-effect/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS doppler-effect core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
