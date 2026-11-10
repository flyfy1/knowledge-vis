'use strict';
// Photoelectric effect (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => { assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`); checks++; };
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const NA = M.phiOf('Na');

// ---- constants and photon energy ----
near(M.HC_EVNM, 1239.84, 0.01, 'hc in eV·nm');
near(M.H_EVS * 1e14, 0.4136, 5e-5, 'h in eV per 1e14 Hz (s1hint slope)');
for (let L = 200; L <= 750; L += 5) {
  near(M.photonEV(L), M.H_EVS * M.freq(L), 1e-12, 'hc/λ = hf');
  near(M.photonEV(L) * M.E, M.H * M.freq(L), 1e-30, 'E = hf in joules');
}
// ---- thresholds quoted on the page ----
near(M.threshold(NA).lambda0, 544, 0.5, 'sodium λ₀ ≈ 544 nm (step 0 hint)');
ok(Math.round(M.threshold(M.phiOf('Cu')).lambda0) === 267 && M.threshold(M.phiOf('Cu')).lambda0 < 380, 'copper threshold in the UV (step 1 hint)');
ok(M.threshold(M.phiOf('Pt')).lambda0 > 200, 'platinum is reachable on the 200 nm end of the slider');
ok(M.threshold(M.phiOf('Zn')).lambda0 < 380 && M.threshold(M.phiOf('Cs')).lambda0 > 544, 'Zn UV-only; Cs beyond Na');
for (const m of M.METALS) {
  const { f0, lambda0 } = M.threshold(m.phi);
  near(M.H_EVS * f0, m.phi, 1e-12, 'h f₀ = φ'); near(M.C / f0 * 1e9, lambda0, 1e-9, 'λ₀ = c / f₀');
  // the K_max–f lines are parallel: slope h for every metal
  const s = (M.kmax(150, m.phi) - M.kmax(lambda0 * 0.8, m.phi)) / (M.freq(150) - M.freq(lambda0 * 0.8));
  near(s, M.H_EVS, 1e-20, 'slope = h for ' + m.id);
  // no emission at or below threshold, whatever the power
  for (const P of [1e-6, 1e-3, 1, 1e3]) { ok(M.photocurrent(P, lambda0 + 1, m.phi) === 0, 'below threshold: no current'); ok(M.photocurrent(P, lambda0 - 1, m.phi) > 0, 'above threshold: current'); }
}

// ---- step 0: current ∝ brightness; rises with λ up to λ₀ at fixed power; plot range ----
for (let L = 200; L < 544; L += 5) {
  const I1 = M.photocurrent(M.P_FULL, L, NA);
  for (let pct = 0; pct <= 100; pct += 10) near(M.photocurrent(M.P_FULL * pct / 100, L, NA), I1 * pct / 100, 1e-15, 'I ∝ brightness');
  ok(M.photocurrent(M.P_FULL, L + 5, NA) > I1 || L + 5 > 543, 'I rises with λ below λ₀ at fixed power');
  ok(I1 * 1e6 < 50, 'current fits the 0–50 µA axis');
  near(I1, M.ETA * M.E * M.photonRate(M.P_FULL, L), 1e-18, 'I = η e N');
}
for (let L = 545; L <= 750; L += 5) ok(M.photocurrent(M.P_FULL, L, NA) === 0, 'step 0: zero beyond λ₀ (incl. 600 nm at 100%)');
ok(M.photonEV(600) < NA, 'quiz: 600 nm photon below sodium φ');
near(M.photonEV(600), 2.07, 0.005, 'quiz feedback ev');

// ---- step 1: photon energy fits the 0–7 eV axis; K_max fits 0–5 eV on 3.5–15.5 ×1e14 Hz ----
ok(M.photonEV(200) < 7 && M.freq(200) / 1e14 < 15.5 && M.freq(750) / 1e14 > 3.5, 'step 1 axes');
for (const m of M.METALS) ok(M.H_EVS * (15.5e14 - M.threshold(m.phi).f0) < 5, 'K lines inside 0–5 eV');

// ---- step 2: I–V, stopping voltage ----
for (let L = 200; L <= 540; L += 5) {
  const K = M.kmax(L, NA); ok(K > 0, 'step 2 slider is above sodium threshold');
  const vs = M.findStopping(K);
  ok(vs >= K - 1e-12 && vs < K + 0.005 + 1e-12, 'findStopping within one 5 mV step of K_max');
  ok(vs <= 4, 'V_s fits the −4..+2 V axis');
  for (const pct of [100, 50]) {
    const Is = M.photocurrent(M.P_FULL * pct / 100, L, NA);
    for (let V = -4; V <= 2.0001; V += 0.05) {
      const I = M.iv(V, K, Is);
      if (V >= 0) near(I, Is, 0, 'saturation for V ≥ 0');
      else if (-V >= K) near(I, 0, 0, 'zero beyond −V_s');
      // the electron rows agree with the curve: fraction arriving = I/Isat (N → ∞) and for 10 rows within 1/10
      const rows = M.sampleK(K, 10).filter(k => M.reach(k, V) >= 1).length / 10;
      ok(Math.abs(rows - I / Is) <= 0.1 + 1e-12, 'rows vs I–V');
    }
  }
  // halving brightness halves I_sat but leaves V_s (quiz 2)
  near(M.photocurrent(M.P_FULL / 2, L, NA), M.photocurrent(M.P_FULL, L, NA) / 2, 1e-18, 'half brightness halves I_sat');
}
for (let L = 545; L <= 600; L += 5) ok(M.findStopping(M.kmax(L, NA)) === null, 'no V_s below threshold');

// ---- step 3: mercury lines, simulated readings, fits ----
ok(M.HG_LINES.length === 7, 'seven lines');
const missNa = M.HG_LINES.filter((L, i) => M.measureVs(i, 'Na') === null);
assert.deepEqual(missNa, [546.1, 577.0]); checks++;
const ptsZn = M.measuredPoints('Zn'); ok(ptsZn.length === 1 && ptsZn[0].lam === 253.7, 'zinc: only 253.7 nm qualifies');
ok(M.measuredPoints('Cs').length === 7, 'caesium: all seven lines give a reading');
for (const id of ['Cs', 'Na', 'Zn']) M.HG_LINES.forEach((L, i) => {
  const v = M.measureVs(i, id); if (v === null) return;
  const truth = M.findStopping(M.kmax(L, M.phiOf(id)));
  ok(Math.abs(v - Math.max(0, truth)) <= M.NOISE + 1e-12 && v >= 0, 'reading within ±0.03 V and ≥ 0');
  ok(v === M.measureVs(i, id), 'readings are deterministic');
  ok(v >= -5 && v <= 4, 'reading inside the plot');
});
const fNa = M.fit(M.measuredPoints('Na')), fCs = M.fit(M.measuredPoints('Cs'));
for (const F of [fNa, fCs]) { ok(Math.abs(F.h / M.H - 1) < 0.015, 'all-line fit within 1.5% of h: ' + F.h); ok(F.intercept > -5, 'intercept visible'); }
ok(Math.abs(fCs.slope / fNa.slope - 1) < 0.02, 'Cs and Na lines nearly parallel');
ok(fCs.phi < fNa.phi && Math.abs(fNa.phi - NA) < 0.05 && Math.abs(fCs.phi - M.phiOf('Cs')) < 0.05, 'fitted φ near the model values, Cs lower');
// Cs line sits higher than Na's across the plotted range (hint ②)
for (let f = 0; f <= 13; f += 0.5) ok(fCs.slope * f * 1e14 + fCs.intercept > fNa.slope * f * 1e14 + fNa.intercept, 'Cs line above Na');
const pair = M.fit(M.measuredPoints('Na').filter(q => q.lam === 404.7 || q.lam === 435.8));
ok(Math.abs(pair.h / M.H - 1) > 3 * Math.abs(fNa.h / M.H - 1), 'close pair gives a much larger error (hint ④)');
// least squares recovers an exact line
const exact = [1, 2, 3, 4].map(k => ({ f: k * 1e14, V: 0.4 * k - 1 })); const fe = M.fit(exact); near(fe.slope * 1e14, 0.4, 1e-12, 'fit slope'); near(fe.intercept, -1, 1e-12, 'fit intercept'); near(fe.f0, 2.5e14, 1e-3, 'fit f0');
ok(M.fit([{ f: 1, V: 1 }]) === null, 'one point: no fit');

// ---- step 4: dim light ----
const ratio0 = M.classicalWait(1, NA) * M.electronRate(1, 400, NA);
for (let e = -6; e <= 0; e += 0.25) {
  const I = Math.pow(10, e), tw = M.classicalWait(I, NA), rate = M.electronRate(I, 400, NA);
  near(tw * rate / ratio0, 1, 1e-9, 'both waits ∝ 1/I: constant ratio');
  ok(Math.log10(tw) < 8 && Math.log10(1 / rate) > -15, 'inside the log-time axis');
  // the first of the ten electrons stays under 1 µs for many random draws
  let seed = 7; for (let k = 0; k < 400; k++) { seed = (seed * 48271) % 2147483647; const ts = M.emissionTimes(rate, 10, seed); ok(ts[0] < 1e-6 && ts.every((v, j) => j === 0 || v > ts[j - 1]), 'first electron < 1 µs, times increasing'); }
}
ok(ratio0 > 1e14 && ratio0 < 1e15, 'about 7 × 10¹⁴ apart');
ok(M.classicalWait(1e-6, NA) > M.UNITS[0][1], 'at 1e-6 W/m² the wave picture waits over a year');
near(M.classicalWait(1, NA), NA * M.E / M.A_ATOM, 1e-9, 'classical formula');
// mean of exponential gaps ≈ 1/rate
{ const ts = M.emissionTimes(1, 20000, 99); near(ts[ts.length - 1] / 20000, 1, 0.03, 'Poisson mean gap'); }
assert.deepEqual(M.human(90), { v: 1.5, unit: 'min' }); checks++;
ok(M.human(3 * 365.25 * 86400).unit === 'yr' && M.human(2e-8).unit === 'ns', 'human units');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['lbPhi', 'lbK', 'lbVs', 'intFull', 'intHalf', 'formula', 's3item']); // symbols only
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const k of zk) ok(!/[左右]图|left chart|right chart|chart on the (left|right)/i.test(STRINGS[l][k]), 'no left/right chart wording in ' + k);

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'[,)]/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of M.METALS.map(m => m.id)) ok(STRINGS.zh['mt_' + id] !== undefined, 'metal name ' + id);
for (const u of ['yr', 'd', 'h', 'min', 's']) ok(STRINGS.zh['u_' + u] !== undefined, 'unit ' + u);
for (const id of ['lam0', 'int0', 'clear0', 'lam1', 'v2', 'lam2', 'int2Full', 'int2Half', 'sweep2', 'clear2', 'check2', 'all3', 'clear3', 'i4', 'reseed4', 'check5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no canvas-label-guard');
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
ok(fs.existsSync(path.join(dir, '../../../physics/modern/photoelectric-effect/index.html')), 'comparison link target exists');
for (let i = 0; i <= 5; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS photoelectric-effect core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · h from Na fit ${(fNa.h * 1e34).toFixed(3)}e-34 · wave/photon ratio ${ratio0.toExponential(2)}`);
