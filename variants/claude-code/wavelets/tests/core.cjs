'use strict';
// Wavelets (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };

// ---- FFT against a direct DFT ----
{
  const x = Array.from({ length: 64 }, (_, n) => Math.sin(n * 0.7) + 0.3 * Math.cos(n * 2.1) + (n % 5) * 0.1);
  const re = x.slice(), im = new Array(64).fill(0); M.fft(re, im);
  for (let k = 0; k < 64; k++) { let a = 0, b = 0; for (let n = 0; n < 64; n++) { a += x[n] * Math.cos(2 * Math.PI * k * n / 64); b -= x[n] * Math.sin(2 * Math.PI * k * n / 64); } near(re[k], a, 1e-9, 'fft re'); near(im[k], b, 1e-9, 'fft im'); }
}

// ---- step 0: magnitude spectrum blind to timing; phase moves ----
let maxd = 0; const phases = new Set();
for (let i = 10; i <= 90; i++) {
  const t0 = i / 100, S = M.burstSpectrum(t0);
  S.mag.forEach((v, k) => { maxd = Math.max(maxd, Math.abs(v - M.burstSpectrum(0.3).mag[k])); });
  let pk = 0; S.mag.forEach((v, k) => { if (v > S.mag[pk]) pk = k; }); ok(pk === 32, 'peak at 32 Hz');
  phases.add(Math.round(S.phase * 180 / Math.PI));
}
ok(maxd < 1e-12, 'magnitude spectra identical to rounding: ' + maxd);
ok(phases.size > 20, 'phase changes with time');
// the spectrum panel 0..0.12 holds the peak; the burst lasts about 0.1 s (±σ·√(2 ln 2)·... : width 0.04 s σ → FWHM ≈ 0.094 s)
{ const p = Math.max(...M.burstSpectrum(0.5).mag); ok(p < 0.12 && p > 0.05, 'peak inside axis'); near(2.3548 * M.S0.width, 0.094, 0.001, 'FWHM ≈ 0.1 s'); }

// ---- step 1: uncertainty product and the resolution table ----
const res = M.LENS.map(L => M.stftResolution(L));
M.LENS.forEach((L, i) => {
  const s = M.winSpread(L);
  near(s.prod, 1 / (4 * Math.PI), 0.0008, 'σt·σf ≈ 1/(4π) for L=' + L);
  near(s.st, M.winSigmaT(L), 0.02 * M.winSigmaT(L), 'σt as drawn');
  near(s.sf, M.winSigmaF(L), 0.02 * M.winSigmaF(L), 'σf as drawn');
  ok(!(res[i].tones.ok && res[i].clicks.ok), 'no window separates both, L=' + L);
});
ok(res[0].clicks.ok && !res[0].tones.ok && res[1].clicks.ok && !res[1].tones.ok, 'short windows: clicks only');
ok(res[3].tones.ok && !res[3].clicks.ok && res[4].tones.ok && !res[4].clicks.ok, 'long windows: tones only');
ok(!res[2].tones.ok && !res[2].clicks.ok, '64 samples: neither');
// a unit cosine reads ≈ 0.5·… : each tone has amplitude 0.5, so the STFT shows ≈ 0.5 at 12 Hz with a long window
{ const S = res[4].S, j = Math.round(0.5 * M.FS / M.HOP); near(S.frames[j][Math.round(12 / S.df)], 0.5, 0.03, 'calibrated magnitude'); }
// the drawn boxes stay inside the 0..2 s × 0..100 Hz plot (clamped in app; check the centres)
ok(M.SIG.clickF < 100 && M.SIG.tones[1] < 100, 'features on the plotted band');

// ---- step 2: Morlet scaling ----
for (let i = 0; i <= 40; i++) {
  const f = 4 * Math.pow(24, i / 40);
  near(M.morletSigmaT(f, 8) * M.morletSigmaF(f, 8), 1 / (4 * Math.PI), 1e-12, 'Morlet σt·σf = 1/(4π)');
  near(M.cyclesInside(f, 8), 8 / (Math.SQRT2 * Math.PI), 1e-12, 'cycles = ω0/(√2π)');
}
near(8 / (Math.SQRT2 * Math.PI), 1.80, 0.005, 'ω0 = 8 → 1.80 cycles');
// measured energy spreads of the sampled Morlet envelope match the formulas
for (const f of [8, 32]) { const s = M.morletS(f, 8) * M.FS, h = Math.ceil(5 * s); let e = 0, m2 = 0; for (let i = -h; i <= h; i++) { const g = Math.exp(-0.5 * (i / s) ** 2) ** 2; e += g; m2 += g * i * i; } near(Math.sqrt(m2 / e) / M.FS, M.morletSigmaT(f, 8), 1e-6, 'Morlet σt measured'); }
// the fixed 64-sample window: from under one cycle (4 Hz) to many (96 Hz) within ±σt
ok(2 * M.winSigmaT(64) * 4 < 1 && 2 * M.winSigmaT(64) * 96 > 5, 'fixed window cycle count range');
// tiles in the plane fit: the widest wavelet tile (4 Hz) centred at 0.65 s stays inside 0..1 s
ok(0.65 - M.morletSigmaT(4, 8) > 0 && 0.65 + M.morletSigmaT(4, 8) < 1, 'tile fits');

// ---- step 3: wavelet resolves both for ω0 = 8–10 ----
const cw = {}; for (let w = 3; w <= 12; w++) cw[w] = M.cwtResolution(w);
for (const w of [7, 8, 9, 10]) ok(cw[w].tones.ok && cw[w].clicks.ok, 'ω0 ' + w + ' separates both');
for (const w of [3, 4, 5, 6, 11, 12]) ok(!(cw[w].tones.ok && cw[w].clicks.ok), 'ω0 ' + w + ' misses one');
ok(cw[3].tones.dip > 0.9, 'ω0 = 3 merges the notes'); ok(!cw[12].clicks.ok, 'ω0 = 12 joins the clicks');
for (const l of ['zh', 'en']) ok(STRINGS[l].s3hint.includes('7') && STRINGS[l].s3hint.includes('10'), 's3hint quotes 7–10');

// ---- step 4: Haar sparsity vs cosine ----
let d5lo = 99, d5hi = 0;
for (let j = 1; j < 64; j++) {
  const s = M.stepStats(j);
  ok(s.nz <= 7, 'at most 7 non-zero Haar coefficients (1 average + 1 per level)');
  ok(s.haarExact === s.nz, 'Haar exact with exactly its non-zeros');
  ok(s.nzD > 30, 'cosine needs many non-zeros');
  ok(s.dct5 > 3 * s.nz, 'cosine far behind at RMSE 0.05');
  // one non-zero per level at most
  s.h.details.forEach(d => ok(d.filter(c => Math.abs(c) > 1e-9).length <= 1, 'one per level'));
  // perfect reconstruction and orthonormality
  const back = M.ihaar(s.h); back.forEach((v, n) => near(v, s.x[n], 1e-12, 'ihaar'));
  M.idct(s.dc).forEach((v, n) => near(v, s.x[n], 1e-9, 'idct'));
  const e = s.x.reduce((a, v) => a + v * v, 0); near(s.hc.reduce((a, v) => a + v * v, 0), e, 1e-9, 'Haar energy'); near(s.dc.reduce((a, v) => a + v * v, 0), e, 1e-9, 'DCT energy');
  d5lo = Math.min(d5lo, s.dct5); d5hi = Math.max(d5hi, s.dct5);
  // the RMSE curve equals the real rebuild error
  for (const K of [1, 3, 7, 20]) { const r = M.stepRecon(j, K); near(M.rmse(r.dctRec, r.x), r.dctCurve[K - 1], 1e-9, 'dct curve'); near(M.rmse(r.haarRec, r.x), Math.max(0, r.haarCurve[K - 1]), 1e-6, 'haar curve'); }
}
// powers-of-two positions need fewer
ok(M.stepStats(32).nz === 2 && M.stepStats(16).nz === 3, 'jump at multiples of powers of 2 → fewer');

// ---- step 5: denoising ----
const bestTs = [];
for (const seed of [5, 1, 2, 3, 4]) {
  const c = M.denoiseCurve(seed);
  ok(c.best.T >= 0.5 - 1e-9 && c.best.T <= 0.7 + 1e-9, 'best T in 0.5–0.7, seed ' + seed);
  ok(c.best.rmse < 0.65 * c.raw, 'denoising helps, seed ' + seed);
  near(c.pts[0].rmse, c.raw, 1e-9, 'T = 0 changes nothing');
  ok(c.pts[60].rmse > c.best.rmse * 1.5, 'T too large hurts, seed ' + seed);
  bestTs.push(c.best.T);
  near(M.rmse(M.noisy(seed), M.blocks()), 0.5, 0.05, 'noise σ ≈ 0.5');
}
for (const l of ['zh', 'en']) ok(STRINGS[l].s5hint.includes('0.5–0.7'), 's5hint quotes 0.5–0.7');
// y axis −4..5 covers the noisy data
for (const seed of [5, 1, 2, 3, 4]) M.noisy(seed).forEach(v => ok(v > -4 && v < 5, 'data on axis'));

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set([]);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['t0', 'L1', 'f2', 'w3', 'L3', 'j4', 'K4', 'T5', 'reroll5']) ok(html.includes(`id="${id}"`), 'control ' + id);
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
ok(fs.existsSync(path.join(dir, '../../../signal/transforms/wavelets/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS wavelets core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
