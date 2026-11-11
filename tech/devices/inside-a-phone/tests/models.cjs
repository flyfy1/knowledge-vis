'use strict';
// Pins every number the essay's prose states to the page's own models (models.js).
// Run: node tech/devices/inside-a-phone/tests/models.cjs
const path = require('path');
const M = require(path.join(__dirname, '..', 'models.js'));
let pass = 0, fail = 0;
function near(name, got, want, tol) {
  const ok = Math.abs(got - want) <= tol;
  (ok ? pass++ : fail++);
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}: ${+got.toFixed(4)} (want ${want} ± ${tol})`);
}
function truth(name, ok) { (ok ? pass++ : fail++); console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}`); }

/* hero: tiny numbers */
near('light travels in 1 ns (m) → "30 厘米"', M.C * 1e-9, 0.30, 0.005);
near('proof-mass displacement at 1 g, 5 kHz (nm) → "约 10 纳米"', M.proofDisplacement(9.81, 5000) * 1e9, 10, 0.5);
near('thermal noise kT at 290 K (dBm/Hz) → "−174"', M.KT_DBM_HZ, -174, 0.05);

/* 01 GPS */
const rel = M.gpsRelativity();
near('signal travel time straight overhead (ms) → "约 67 毫秒"', rel.travelMs, 67, 0.5);
near('1 µs of clock error (m) → "300 米"', M.C * 1e-6, 300, 1);
near('gravitational clock gain (µs/day) → "45.7"', rel.grav, 45.7, 0.05);
near('velocity clock loss (µs/day) → "7.2"', rel.speed, 7.2, 0.05);
near('net clock gain (µs/day) → "38.5"', rel.net, 38.5, 0.05);
near('net gain as distance (km/day) → "11.5 千米"', rel.kmPerDay, 11.5, 0.05);
near('orbital period from a = 26 560 km (h) → "约 12 小时（11 小时 58 分）"', rel.periodH, 11 + 58 / 60, 1 / 60);
const def = { spread: 50, biasNs: 300, noiseNs: 0 };
near('default miss with guess 0 (m) → "约 136 米"', M.gpsMismatch(def, 0).spread, 136, 0.5);
near('solved clock error (ns) → "正好是 300"', M.gpsFix(def).clockNs, 300, 1e-6);
near('solved position error, no noise (m) → "为零"', M.gpsFix(def).posErr, 0, 1e-6);
near('circles meet once the guess is right (m)', M.gpsMismatch(def, 300).spread, 0, 1e-3);
near('10 ns noise, spread ±70° (m) → "约 5.6 米"', M.gpsFix({ spread: 70, biasNs: 300, noiseNs: 10 }).posErr, 5.6, 0.05);
near('10 ns noise, spread ±15° (m) → "约 28 米"', M.gpsFix({ spread: 15, biasNs: 300, noiseNs: 10 }).posErr, 28, 0.5);
near('10 ns of timing noise as distance (m) → "3 米"', M.C * 10e-9, 3, 0.01);
truth('position error does not depend on the clock error itself', Math.abs(M.gpsFix({ spread: 40, biasNs: -800, noiseNs: 10 }).posErr - M.gpsFix({ spread: 40, biasNs: 600, noiseNs: 10 }).posErr) < 1e-6);
truth('crowded satellites amplify the same timing noise', M.gpsFix({ spread: 15, biasNs: 0, noiseNs: 10 }).posErr > 4 * M.gpsFix({ spread: 70, biasNs: 0, noiseNs: 10 }).posErr);

/* 02 accelerometer */
near('reading magnitude when still (m/s²) → "9.81"', M.accelReading(37, false).mag, 9.81, 1e-9);
near('reading at 30°: x → 4.90', M.accelReading(30, false).x, 4.905, 0.001);
near('reading at 30°: y → 8.50', M.accelReading(30, false).y, 8.496, 0.001);
near('free fall reads (m/s²) → "0"', M.accelReading(30, true).mag, 0, 0);
near('bias 0.02: ½bt² at 10 s (m) → "1 米"', M.driftBias(0.02, 10), 1, 1e-9);
near('bias 0.02: ½bt² at 60 s (m) → "36 米"', M.driftBias(0.02, 60), 36, 1e-9);
near('bias 0.02 m/s² in g → "千分之二个 g"', 0.02 / 9.81, 0.002, 0.0001);
{
  const o = { bias: 0.02, noise: 0.05, tMax: 60 };
  const a = M.driftStep(M.driftInit(), 60, o), b = M.driftInit();
  for (let i = 0; i < 3600; i++) M.driftStep(b, 1 / 60, o);
  near('drift sim is frame-rate independent (60 s in one step vs 3600 steps)', a.x - b.x, 0, 1e-9);
  near('drift sim with default noise lands near ½bt² at 60 s', a.x, 36, 3 * M.driftNoiseRms(0.05, 60));
  const g = M.driftStep(M.driftInit(), 60, Object.assign({ gps: true }, o));
  truth('with one GPS fix per second the error stays at a few metres (|x| < 5 m) → "停在几米"', Math.abs(g.x) < 5);
}

/* 03 touch */
const tw = M.touchWorstError(2.5);
near('peak-only worst error, width 2.5 (mm) → "2.5 毫米"', tw.peak, 2.5, 0.01);
near('centroid worst error, width 2.5 (mm) → "约 0.13 毫米"', tw.centroid, 0.13, 0.005);
near('centroid worst error as a fraction of the 5 mm pitch → "四十分之一"', tw.centroid / M.TOUCH.pitch, 1 / 40, 0.002);
near('centroid RMS error with default noise 0.02 (mm) → "约 0.16 毫米"', M.touchNoiseRms(2.5, 0.02), 0.16, 0.01);
near('centroid worst error, stylus width 0.8 (mm) → "约 1.9 毫米"', M.touchWorstError(0.8).centroid, 1.9, 0.05);
{ // "最靠边的那一段误差要大得多": near the panel edge the centroid has no outer neighbour
  const edge = x => Math.abs(M.touchEstimate(M.touchSignals(x, 2.5, 0)).centroid - x);
  truth('centroid error at the panel edge (x = 0.5 mm) is over 10× the mid-panel worst → "最靠边…大得多"', edge(0.5) > 10 * tw.centroid);
}

/* 04 camera */
const grey = M.camGreyPixels();
near('photons per pixel per frame, 20/µm², 0.8 µm → "约 13 个"', M.photonsPerPixel(20, 0.8), 12.8, 1e-9);
near('…on the grey card → "约 6.4 个"', 0.5 * M.photonsPerPixel(20, 0.8), 6.4, 1e-9);
near('single-frame noise on the grey card → "约 39.5%"', M.camTheoryNoise(12.8, 1), 0.395, 0.001);
near('16 frames → "约 9.9%"', M.camTheoryNoise(12.8, 16), 0.099, 0.001);
near('1.6 µm pixel, single frame → "约 19.8%"', M.camTheoryNoise(M.photonsPerPixel(20, 1.6), 1), 0.198, 0.001);
near('0.8 µm pixel, 4 frames equals the 1.6 µm pixel', M.camTheoryNoise(12.8, 4) - M.camTheoryNoise(M.photonsPerPixel(20, 1.6), 1), 0, 1e-12);
{
  const R = M.rng(1), st = M.camStackInit();
  for (let i = 0; i < 16; i++) M.camAddFrame(st, 12.8, R);
  near('measured noise after 16 frames agrees with 1/√N (seed 1)', M.camMeasuredNoise(st, grey), 0.099, 0.01);
}

/* 05 screen */
const m580 = M.colourMatch(580), m500 = M.colourMatch(500);
near('580 nm match: red → "0.90"', m580.w[0], 0.90, 0.005);
near('580 nm match: green → "0.16"', m580.w[1], 0.16, 0.005);
near('580 nm match: blue → "−0.002"', m580.w[2], -0.002, 0.0006);
const w580 = m580.w.map(v => Math.max(0, v));
{ const sw = M.swatchRGB(M.colourMatch(580).w); truth('580 nm swatch on a white-balanced screen is yellow (R = 1, G > 0.6, B ≈ 0), not orange', sw[0] === 1 && sw[1] > 0.6 && sw[2] < 0.05); }
truth('580 nm: clipped mix differs from the target by under 1% → "相差不到 1%"', M.colourMismatch(w580, m580.target) < 0.01);
near('580 nm: mix power at 580 nm, share of a sub-pixel peak → "约 0.4%"', M.mixPowerAt(w580, 580), 0.004, 0.0005);
near('500 nm match: red → "−0.89"', m500.w[0], -0.89, 0.005);
truth('every tested spectral colour lies (at least slightly) outside the gamut', [460, 480, 500, 520, 550, 580, 600, 620].every(l => !M.colourMatch(l).inGamut));
near('cone peaks used (nm): S 420.3', M.CONE_PEAKS.S, 420.3, 0); near('M 533.8', M.CONE_PEAKS.M, 533.8, 0); near('L 562.8', M.CONE_PEAKS.L, 562.8, 0);

/* 06 compression */
const sky0 = M.compressStats('sky', 0), sky4 = M.compressStats('sky', 4), grass = M.compressStats('grass', 0);
near('clean sky bits/pixel → "约 0.47"', sky0.bits, 0.47, 0.005);
near('clean sky, 12 MP channel (MB) → "约 0.7 MB"', M.MP12_MB(sky0.bits), 0.7, 0.05);
near('uncompressed 12 MP channel (MB) → "12 MB"', M.MP12_MB(8), 12, 1e-9);
near('sky with noise σ = 4 (bits/pixel) → "约 4.5"', sky4.bits, 4.54, 0.05);
near('…as MB → "6.8 MB"', M.MP12_MB(sky4.bits), 6.8, 0.05);
near('noise theory log2(σ√2√(2πe)) at σ = 4 matches the model', M.noiseBitsTheory(4) - sky4.bits, 0, 0.05);
near('grass (bits/pixel) → "约 7.2"', grass.bits, 7.2, 0.05);
near('clean sky ratio vs 8 bits → "17 倍"', 8 / sky0.bits, 17, 0.5);

/* 07 radio */
const r1 = M.radioLink(1000, 3.5, 20e6), r2 = M.radioLink(2000, 3.5, 20e6);
near('1 km: received power (dBm) → "约 −55.5"', r1.pr, -55.5, 0.05);
near('1 km: SNR (dB) → "约 38.5"', r1.snrDb, 38.5, 0.05);
near('1 km, 20 MHz: Shannon cap (Mbit/s) → "约 256"', r1.cap / 1e6, 256, 0.5);
near('1 km → 2 km loss (dB) → "约 10.5"', r1.pr - r2.pr, 10.5, 0.05);
near('2 km cap (Mbit/s) → "约 186"', r2.cap / 1e6, 186, 0.5);
near('free space: doubling distance costs (dB) → "6"', M.pathLoss(2000, 2) - M.pathLoss(1000, 2), 6, 0.03);
const r16 = M.radioLink(16000, 3.5, 20e6), r16w = M.radioLink(16000, 3.5, 100e6), r1w = M.radioLink(1000, 3.5, 100e6);
near('16 km SNR (dB) → "约 −3.6"', r16.snrDb, -3.6, 0.05);
near('16 km, 20 MHz cap → "约 10.4"', r16.cap / 1e6, 10.4, 0.05);
near('16 km, 100 MHz cap → "约 11.9"', r16w.cap / 1e6, 11.9, 0.05);
near('1 km, 100 MHz cap → "约 1047"', r1w.cap / 1e6, 1047, 1);
near('1 km: 100 vs 20 MHz → "四倍"', r1w.cap / r1.cap, 4, 0.15);

/* 08 Hamming */
truth('every single flip is corrected', [0, 1, 2, 3].every(seed => { const R = M.rng(seed); for (let k = 0; k < 16; k++) { const d = [k & 1, k >> 1 & 1, k >> 2 & 1, k >> 3 & 1], c = M.hammingEncode(d); for (let i = 0; i < 7; i++) { const r = c.slice(); r[i] ^= 1; const o = M.hammingDecode(r); if (o.pos !== i + 1 || o.data.join() !== d.join()) return false; } } void R; return true; }));
truth('every double flip is decoded wrongly', (() => { for (let k = 0; k < 16; k++) { const d = [k & 1, k >> 1 & 1, k >> 2 & 1, k >> 3 & 1], c = M.hammingEncode(d); for (let i = 0; i < 7; i++) for (let j = i + 1; j < 7; j++) { const r = c.slice(); r[i] ^= 1; r[j] ^= 1; if (M.hammingDecode(r).data.join() === d.join()) return false; } } return true; })());
near('p = 1%: uncoded block error → "3.94%"', M.blockErrUncoded(0.01) * 100, 3.94, 0.005);
near('p = 1%: Hamming block error → "0.20%"', M.blockErrHamming(0.01) * 100, 0.20, 0.005);
near('p = 1%: ratio → "约二十倍"', M.blockErrUncoded(0.01) / M.blockErrHamming(0.01), 20, 1);
near('p = 10%: uncoded → "34.4%"', M.blockErrUncoded(0.1) * 100, 34.4, 0.05);
near('p = 10%: Hamming → "15.0%"', M.blockErrHamming(0.1) * 100, 15.0, 0.05);
near('extra bits → "多传 75%"', 7 / 4 - 1, 0.75, 0);
{ const st = { sent: 0, badRaw: 0, badCoded: 0 }; M.hammingTally(st, 100000, 0.01, M.rng(2)); near('simulated tally agrees with 0.20% (100 000 blocks)', st.badCoded / st.sent * 100, 0.20, 0.05); }

/* 09 handover (default road, seed 17) */
const road = M.handoverRoad(17), trip = h => M.handoverTrip(road, h);
near('hysteresis 0 → "35 次"', trip(0).count, 35, 0);
near('hysteresis 3 dB → "7 次"', trip(3).count, 7, 0);
near('hysteresis 5 dB → "1 次"', trip(5).count, 1, 0);
near('hysteresis 5 dB: metres on the weaker tower → "28 米"', trip(5).worseM, 28, 0);
near('hysteresis 15 dB → "还是 1 次"', trip(15).count, 1, 0);
near('hysteresis 15 dB: metres on the weaker tower → "198 米"', trip(15).worseM, 198, 0);

/* 10 battery */
const b0 = M.battery(0.5, 1, -10), b2 = M.battery(0.5, 2, -10), bw = M.battery(0.5, 2, 25);
near('default: −10 °C, 1 A, 50% → shown "约 38%"', b0.shown * 100, 38, 0.5);
near('−10 °C, 2 A: I·R drop (V) → "约 0.68"', b2.drop, 0.68, 0.005);
near('−10 °C, 2 A: terminal voltage (V) → "约 3.16"', b2.v, 3.16, 0.005);
truth('−10 °C, 2 A: below the 3.3 V cutoff → "手机关机"', b2.off);
near('25 °C, 2 A: shown → "约 46%"', bw.shown * 100, 46, 0.5);
near('25 °C, 1 A heat (W) → "约 0.12"', M.battery(0.5, 1, 25).heat, 0.12, 0.001);
near('25 °C, 3 A heat (W) → "约 1.08"', M.battery(0.5, 3, 25).heat, 1.08, 0.001);
near('assumed cold factor: R(−20 °C)/R(25 °C) → "约 4 倍"', M.rInt(-20) / M.rInt(25), 4, 0.01);
near('OCV at full (V) → "约 4.2 伏"', M.ocv(1), 4.2, 0.005);
near('OCV at empty (V) → "3 伏左右"', M.ocv(0), 3.0, 0.005);
near('cutoff voltage (V) → "3.3 伏"', M.BAT.vcut, 3.3, 0);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
