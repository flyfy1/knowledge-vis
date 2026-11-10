'use strict';
// Sound-waves (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const zh = STRINGS.zh, en = STRINGS.en, both = k => zh[k] + ' || ' + en[k];
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s.replace('-', '−'); };

// ---- formatting rule: trailing zeros only go after a decimal point ----
assert.equal(fmt(90, 0), '90'); assert.equal(fmt(100, 0), '100'); assert.equal(fmt(2.50, 2), '2.5'); assert.equal(fmt(-0.001, 2), '0'); checks += 4;

// ---- speed of sound ----
near(M.vAir(20), 343.42, 1e-9, 'v(20 °C)'); ok(fmt(M.vAir(20), 0) === '343', 'air shows as 343 m/s');
ok(zh.s5e.includes('331.3 + 0.606') && en.s5e.includes('331.3 + 0.606'), 'temperature formula in text matches model');
near(M.vAir(15), 340.39, 1e-9, 'v(15 °C)');

// ---- step 0: the parcel stays, the pattern travels ----
for (let f = 100; f <= 400; f += 10) {
  const v = M.MEDIA[0].v, lam = v / f, A = M.DRAW_AMP * lam, k = 2 * Math.PI / lam;
  ok(k * A < 1, 'drawn parcels never overtake each other (kA < 1) at f=' + f);
  // the compressions really are pressure maxima, and they advance at v
  for (const tt of [0, 0.0013, 0.007]) {
    const cs = M.compressions(tt, f, v, 0, 4);
    cs.forEach(xc => { near(M.pressure(xc, tt, f, v), 1, 1e-9, 'compression is a pressure maximum'); near(M.pressure(xc + 1e-4, tt, f, v), 1, 1e-6, 'smooth max'); });
    const later = M.compressions(tt + 1e-3, f, v, -10, 20).map(x => x - v * 1e-3);
    cs.forEach(xc => ok(later.some(x => Math.abs(x - xc) < 1e-9), 'every compression moves v·Δt'));
    // compressions are where the parcels crowd: neighbours on either side converge (−∂s/∂x maximal)
    cs.forEach(xc => { const ds = (M.displacement(xc + 1e-4, tt, f, v, A) - M.displacement(xc - 1e-4, tt, f, v, A)) / 2e-4; near(-ds, A * k, 1e-6 * A * k + 1e-9, 'compression = parcels squeezed'); });
  }
  // the red parcel never strays more than A from home
  let far = 0; for (let i = 0; i <= 400; i++) far = Math.max(far, Math.abs(M.displacement(2, i / 400 / f, f, v, A))); near(far, A, 1e-3 * A, 'parcel range = A');
  // "enlarged millions of times": drawn amplitude ÷ real amplitude at a conversation-like 60 dB
  const ratio = A / M.realDisplacement(60, f); ok(ratio > 1e6 && ratio < 1e7, 'enlarged millions of times at f=' + f + ': ' + ratio.toExponential(2));
}
near(M.realDisplacement(60, 200) * 1e9, 54.4, 0.1, 'real displacement at 60 dB, 200 Hz ≈ 54 nm');
ok(M.SLOW === 400 && zh.s0hint.includes('400 倍') && en.s0hint.includes('400 times'), 'slow-motion factor stated');
ok(zh.s0hint.includes('几百万倍') && en.s0hint.includes('millions'), 'enlargement stated');

// ---- step 1: frequency and period ----
for (let f = 100; f <= 1000; f += 10) {
  const cr = M.crestTimes(f, 0.02);
  ok(cr.length >= 2, 'at least two crests in 20 ms');
  near(cr[1] - cr[0], 1 / f, 1e-12, 'crest spacing = T');
  near(M.micPressure(cr[0], f), 1, 1e-12, 'crest is a maximum');
  const note = M.nearestNote(f); ok(Math.abs(note.cents) <= 50 + 1e-9, 'nearest note within half a semitone');
}
assert.equal(M.nearestNote(440).name, 'A4'); assert.equal(M.nearestNote(261.63).name, 'C4'); checks += 2;
ok(fmt(1000 / 440, 2) === '2.27' && zh.s1hint.includes('2.27 ms') && en.s1hint.includes('2.27 ms'), '440 Hz period 2.27 ms');

// ---- step 2: v = fλ, one period = one wavelength ----
for (let f = 100; f <= 500; f += 10) {
  M.MEDIA.forEach(med => {
    const lam = M.wavelength(med.v, f), T = M.period(f);
    near(f * lam, med.v, 1e-9, 'v = fλ');
    // the followed compression starts at 1 m and is a maximum after a fraction p of a period at 1 + pλ
    for (const p of [0, 0.3, 1]) near(M.pressureFrom(1 + p * lam, p * T, f, med.v, 1), 1, 1e-9, 'followed compression at 1 + pλ');
    // after one period the whole pattern looks the same again
    for (const x of [0, 2.5, 7]) near(M.pressureFrom(x, T, f, med.v, 1), M.pressureFrom(x, 0, f, med.v, 1), 1e-9, 'periodic in time');
  });
  // ratio of wavelengths = ratio of speeds (s2hint)
  near(M.wavelength(M.MEDIA[2].v, f) / M.wavelength(M.MEDIA[0].v, f), M.MEDIA[2].v / M.MEDIA[0].v, 1e-12, 'λ ratio = v ratio');
  // s2outSteel/s2out: steel always leaves the 10 m strip from 1 m; water does below ~164 Hz; air never does
  ok(M.wavelength(M.MEDIA[2].v, f) > 9, 'steel dot leaves the strip');
  ok(M.wavelength(M.MEDIA[0].v, f) <= 9, 'air dot stays in the strip');
}
ok(M.wavelength(1480, 160) > 9 && M.wavelength(1480, 170) <= 9, 'water switches message near 164 Hz');
ok(M.MEDIA[0].v < M.MEDIA[1].v && M.MEDIA[1].v < M.MEDIA[2].v, 'shortest in air, longest in steel');
near(M.MEDIA[0].v / 20, 17.17, 0.01, '20 Hz → 17.2 m'); near(M.MEDIA[0].v / 20000 * 100, 1.72, 0.01, '20 kHz → 1.7 cm');
ok(M.MEDIA[0].v / 20 > 3 && M.MEDIA[0].v / 20000 < 0.02, 'taller than a storey / under two centimetres');

// ---- step 3: decibels ----
for (let L1 = 60; L1 <= 100; L1++) {
  near(M.levelOf(M.prms(L1)), L1, 1e-9, 'levelOf ∘ prms');
  for (let r = 1; r <= 16; r += 0.5) {
    near(M.levelAt(L1, 2 * r) - M.levelAt(L1, r), -6.02, 0.005, 'doubling distance costs ~6 dB');
    near(M.prms(M.levelAt(L1, r)) * r, M.prms(L1), 1e-9 * M.prms(L1), 'p ∝ 1/r');
  }
  for (let r = 1; r <= 32; r += 0.5) { const L = M.levelAt(L1, r); ok(L >= 20 && L <= 110, 'level inside plotted 20–110 dB'); }
}
near(M.levelOf(10 * M.prms(70)) - 70, 20, 1e-9, '×10 pressure = +20 dB'); near(M.levelOf(2 * M.prms(70)) - 70, 6.02, 0.005, '×2 pressure = +6 dB');
near(M.prms(0), 20e-6, 1e-15, 'reference pressure 0.00002 Pa');
near(Math.SQRT2 * M.prms(100), 2.83, 0.005, '100 dB peak 2.83 Pa (largest tick)');

// ---- step 4: timbre ----
const F0 = 220;
for (const [name, a] of Object.entries(M.PRESETS)) {
  near(M.repeatPeriod(a, F0), 1 / F0, 1e-15, 'preset repeats at 1/220 s: ' + name);
  for (const q of [0.0003, 0.0021]) near(M.harmonicWave(a, F0, q + 1 / F0), M.harmonicWave(a, F0, q), 1e-9, 'periodic: ' + name);
  ok(a.length === 6 && a.every(v => v >= 0 && v <= 1), 'preset fits the sliders: ' + name);
}
near(M.repeatPeriod([0, 1, 1, 0, 0, 0], F0), 1 / F0, 1e-15, 'fundamental off, 2 and 3 on: period unchanged');
near(M.repeatPeriod([0, 1, 0, 1, 0, 1], F0), 1 / (2 * F0), 1e-15, 'only 2, 4, 6: period halves (octave up)');
near(M.repeatPeriod([0, 0, 1, 0, 0, 1], F0), 1 / (3 * F0), 1e-15, 'only 3, 6: period a third');
ok(M.repeatPeriod([0, 0, 0, 0, 0, 0], F0) === Infinity, 'silence has no period');
// the wave really repeats at repeatPeriod and not sooner, on a slider-grid sample
let seed = 3; const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return Math.round(seed / 2147483648 * 20) / 20; };
for (let trial = 0; trial < 300; trial++) {
  const a = Array.from({ length: 6 }, rnd), Tr = M.repeatPeriod(a, F0); if (!isFinite(Tr)) continue;
  for (const q of [0.0001, 0.0009, 0.0017]) near(M.harmonicWave(a, F0, q + Tr), M.harmonicWave(a, F0, q), 1e-9, 'repeats at Tr');
  if (Tr > 1 / (6 * F0) + 1e-12) { let diff = 0; for (let i = 0; i < 200; i++) diff = Math.max(diff, Math.abs(M.harmonicWave(a, F0, i / 200 * Tr + Tr / 2) - M.harmonicWave(a, F0, i / 200 * Tr))); ok(diff > 1e-6, 'does not repeat at Tr/2'); }
  ok(M.peakOf(a, F0) <= 6, 'peak bounded');
}
// odd 1/n tends to a square wave (flat top), all 1/n to a sawtooth (asymmetric)
{ const spread = a => { let lo = Infinity, hi = -Infinity; for (let p = 0.1; p <= 0.4; p += 0.01) { const v = M.harmonicWave(a, F0, p / F0); lo = Math.min(lo, v); hi = Math.max(hi, v); } return hi - lo; };
  ok(spread(M.PRESETS.odd) < 0.25 && spread(M.PRESETS.pure) > 0.4, 'odd preset has a flatter top than the pure tone (nearly square)'); }
ok(Math.abs(M.harmonicWave(M.PRESETS.all, F0, 0.1 / F0) + M.harmonicWave(M.PRESETS.all, F0, 0.9 / F0)) < 1e-9, 'sawtooth odd symmetry');

// ---- step 5: echo ----
for (let Tc = -10; Tc <= 40; Tc++) {
  const dmin = M.minEchoDistance(Tc); ok(dmin > 16 && dmin < 18, 'echo needs about 17 m');
  near(M.echoDelay(dmin, Tc), 0.1, 1e-12, 'minimum distance gives 0.1 s');
  for (let d = 5; d <= 200; d += 5) {
    const dt = M.echoDelay(d, Tc);
    near(M.distanceFromDelay(dt, Tc), d, 1e-9, 'd = vΔt/2 inverts Δt = 2d/v');
    ok(dt <= 1.3, 'echo inside the 1.3 s time axis');
    near(M.pulseDistance(dt / 2, d, Tc), d, 1e-9, 'pulse reaches the wall half-way'); near(M.pulseDistance(dt, d, Tc), 0, 1e-9, 'back at you at Δt');
  }
}
ok(M.vAir(40) / M.vAir(-10) < 1.1, 'speed changes by less than 10% over the slider');
const qd = M.distanceFromDelay(0.6, 15);
near(qd, 102.1, 0.05, 'quiz answer'); ok(new Set([fmt(2 * qd, 0), fmt(qd / 2, 0), fmt(qd, 0)]).size === 3, 'quiz options distinct');
ok(M.QUIZ.Tc === 15 && M.QUIZ.dt === 0.6 && zh.quizPrompt.includes('15 ℃') && zh.quizPrompt.includes('0.6 s') && en.quizPrompt.includes('15 °C'), 'quiz prompt matches model');

// ---- bilingual parity ----
const zk = Object.keys(zh).sort(), ek = Object.keys(en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(zh[k]), ph(en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['stripTitle', 's2line']);
for (const k of zk) ok(NEUTRAL.has(k) || zh[k] !== en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
ok(!/左图|右图/.test(Object.values(zh).join('')) && !/left plot|right plot|left panel|right panel/i.test(Object.values(en).join('')), 'no left/right picture references');

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['f0', 'play0', 'quarter0', 'clear0', 'f1', 'f2', 'run2', 'r3s', 'L3', 'clear3', 'pPure', 'pOdd', 'pAll', 'pBright', 'd5', 'T5', 'clap5', 'checkQuiz']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder');
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
ok(fs.existsSync(path.join(dir, '../../../physics/waves/sound-waves/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS sound-waves core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
