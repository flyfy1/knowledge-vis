'use strict';
// Fourier (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const zh = STRINGS.zh, en = STRINGS.en;
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s.replace('-', '−'); };
assert.equal(fmt(90, 0), '90'); assert.equal(fmt(0.500, 3), '0.5'); checks += 2;
const X = tt => M.mix(M.TARGET, tt);

// ---- step 0: the hidden mixture; RMS error of a guess ----
assert.deepEqual(M.TARGET.map(c => c.f), [2, 5, 9]); checks++;
ok(zh.s0e.includes('2、5、9 Hz') && en.s0e.includes('2, 5 and 9 Hz'), 'frequencies in the text match the model');
ok(M.TARGET.every(c => c.a >= 0 && c.a <= 1 && Math.abs(c.a * 20 - Math.round(c.a * 20)) < 1e-9), 'answers sit on the 0.05 slider grid');
for (let trial = 0; trial < 30; trial++) {
  const g = M.TARGET.map((c, i) => ((trial * (i + 3)) % 21) / 20), gx = tt => M.mix(M.TARGET.map((c, i) => ({ f: c.f, a: g[i] })), tt);
  const expect = Math.sqrt(M.TARGET.reduce((s, c, i) => s + (c.a - g[i]) ** 2 / 2, 0));
  near(M.rmsDiff(X, gx), expect, 1e-9, 'RMS error = √(Σ Δa²/2)');
}
near(M.rmsDiff(X, X), 0, 1e-12, 'exact guess has zero error');
let peakX = 0; for (let i = 0; i <= 4000; i++) peakX = Math.max(peakX, Math.abs(X(i / 4000))); ok(peakX < 2, 'signal inside the ±2 axis');

// ---- step 1: the sine probe reads the amplitude or 0 (orthogonality) ----
for (let k = 1; k <= 12; k++) {
  const hit = M.TARGET.find(c => c.f === k);
  near(M.sinProbe(X, k), hit ? hit.a : 0, 1e-9, 'b_k at k=' + k);
  for (let m = 1; m <= 12; m++) {
    near(2 * M.mean(tt => Math.sin(M.TWO_PI * m * tt) * Math.sin(M.TWO_PI * k * tt)), m === k ? 1 : 0, 1e-9, 'sin ⟂ sin');
    near(2 * M.mean(tt => Math.cos(M.TWO_PI * m * tt) * Math.sin(M.TWO_PI * k * tt)), 0, 1e-9, 'cos ⟂ sin');
  }
}
// matching layer × probe is never negative (the "almost all green" claim comes from a·sin² ≥ 0)
for (let i = 0; i <= 1000; i++) ok(0.5 * Math.sin(M.TWO_PI * 5 * i / 1000) ** 2 >= 0, 'a·sin² ≥ 0');
// at k = 5 the product is mostly positive; at k = 6 the positive and negative areas cancel
{ let pos = 0, neg = 0; for (let i = 0; i < 2000; i++) { const tt = (i + 0.5) / 2000, v = X(tt) * Math.sin(M.TWO_PI * 5 * tt); if (v > 0) pos += v; else neg -= v; } ok(pos > 2 * neg, 'k = 5 product mostly green'); }
{ let pos = 0, neg = 0; for (let i = 0; i < 2000; i++) { const tt = (i + 0.5) / 2000, v = X(tt) * Math.sin(M.TWO_PI * 6 * tt); if (v > 0) pos += v; else neg -= v; } near(pos, neg, 1e-9, 'k = 6 areas cancel'); }

// ---- step 2: phase; sine + cosine probes ----
for (let d = -180; d <= 180; d += 5) {
  const ph = d * Math.PI / 180, x = tt => M.mix(M.TARGET.map(c => (c.f === 5 ? { ...c, ph } : c)), tt), p = M.probePair(x, 5);
  near(p.s, 0.5 * Math.cos(ph), 1e-9, 'sine reading = 0.5 cos φ'); near(p.c, 0.5 * Math.sin(ph), 1e-9, 'cosine reading = 0.5 sin φ');
  near(p.mag, 0.5, 1e-9, 'magnitude stays 0.5');
  const angDiff = Math.abs(((p.ang * 180 / Math.PI - d) % 360 + 540) % 360 - 180); ok(angDiff < 1e-6, 'direction = φ at ' + d);
  // the warning shows exactly near ±90° on the 5° grid
  ok((Math.abs(p.s) < 0.1) === (Math.abs(Math.abs(d) - 90) <= 10), 'sine-only warning near ±90° (' + d + ')');
}
near(M.probePair(tt => M.mix(M.TARGET.map(c => (c.f === 5 ? { ...c, ph: Math.PI / 2 } : c)), tt), 5).s, 0, 1e-9, 'φ = 90° sine probe reads 0');

// ---- step 3: windowed spectrum, leakage, resolution ----
let seed = 11; const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
for (let trial = 0; trial < 40; trial++) {
  const comps = [{ f: 1 + 8 * rnd(), a: rnd(), ph: 6 * rnd() - 3 }, { f: 1 + 8 * rnd(), a: rnd(), ph: 6 * rnd() - 3 }], T = Math.round((0.5 + 3.5 * rnd()) * 2000) / 2000, f = 1 + 8 * rnd();
  const x = tt => M.mix(comps, tt);
  near(M.windowSpectrum(comps, f, T), Math.hypot(M.sinProbe(x, f, T), M.cosProbe(x, f, T)), 1e-5, 'closed form = sine/cosine probe magnitude');
}
for (let T = 0.5; T <= 4; T += 0.25) {
  const one = [{ f: 5, a: 1 }], pk = M.windowSpectrum(one, 5, T);
  near(pk, 1, 0.07, 'single tone peak ≈ amplitude at T=' + T);
  ok(M.windowSpectrum(one, 5 + 1 / T, T) < 0.07 && M.windowSpectrum(one, 5 - 1 / T, T) < 0.07, 'lobe zeros at ±1/T (width 2/T) T=' + T);
  ok(M.windowSpectrum(one, 5 + 1.5 / T, T) > 0.1, 'leakage side lobe exists T=' + T);
  const thr = M.threshold(T); ok(thr * T > 0.715 && thr * T < 0.755, 'boundary Δ·T within 0.72–0.75 at T=' + T + ': ' + (thr * T).toFixed(4));
  near(M.lobeWidth(T), 2 / T, 1e-12, 'lobe width');
  // on the slider grid the verdict is monotone in Δ and matches the boundary
  let seen = false;
  for (let i = 0; i <= 38; i++) {
    const d = Math.round((0.1 + 0.05 * i) * 100) / 100, r = M.resolved(d, T);
    if (seen) ok(r, `monotone: resolved stays resolved T=${T} d=${d}`);
    if (r) seen = true;
    ok(r === (d >= thr - 1e-9), `verdict matches boundary T=${T} d=${d}`);
    let mx = 0; for (let j = 0; j <= 140; j++) mx = Math.max(mx, M.windowSpectrum([{ f: 5, a: 1 }, { f: 5 + d, a: 1 }], 2 + j * 0.05, T)); ok(mx < 2.15, 'spectrum inside the axis');
  }
}
ok(!M.resolved(0.5, 0.5) && !M.resolved(0.5, 1) && M.resolved(0.5, 1.5) && M.resolved(0.5, 4), 'hint path: Δ = 0.5 separates once T ≥ 1.5 s');
ok(zh.lg3Line.includes('0.72–0.75') && en.lg3Line.includes('0.72–0.75') && zh.s3hint.includes('0.75/T') && en.s3hint.includes('0.75/T') && zh.boundary.includes('0.75/T') && en.boundary.includes('0.75/T'), '0.72–0.75 stated');
ok(M.DIP === 0.8 && zh.s3e.includes('80%') && en.s3e.includes('80%'), '80% rule stated');

// ---- step 4: square wave, partial sums, Gibbs ----
for (let k = 1; k <= 11; k++) near(M.sinProbe(M.square, k), M.squareCoef(k), 2e-3, 'square-wave reading b_k = 4/(πk) (odd), 0 (even), k=' + k);
let prevRms = Infinity;
for (let n = 1; n <= 40; n++) {
  const s = M.squareStats(n);
  ok(s.kMax === 2 * n - 1, 'highest harmonic 2N−1');
  ok(s.rms < prevRms, 'RMS error keeps falling'); prevRms = s.rms;
  // RMS via Parseval agrees with direct integration
  if (n % 7 === 1) near(s.rms, M.rmsDiff(M.square, tt => M.partialSquare(n, tt)), 2e-3, 'Parseval RMS n=' + n);
  if (n >= 5) ok(s.overshoot > 0.178 && s.overshoot < 0.19, 'overshoot stays near 0.18 n=' + n);
  ok(s.peak < 1.45 && s.overshoot < 0.5 && s.rms < 0.5, 'inside the axes');
}
const gl = M.gibbsLimit(); near(gl, 0.17898, 1e-4, 'Gibbs limit'); near(gl / 2 * 100, 9, 0.06, 'about 9% of the jump');
ok(M.squareStats(40).rms < 0.08, 'RMS error heads to 0');
ok(zh.s4hint.includes('0.18') && zh.s4hint.includes('9%') && en.s4hint.includes('0.18') && en.s4hint.includes('9%'), 'Gibbs numbers stated');

// ---- step 5: DFT ----
for (const N of [16, 32]) for (let f = 0; f <= N; f++) {
  const Xk = M.dft(M.cosSamples(f, N)), pk = M.dftPeaks(f, N);
  Xk.forEach((q, k) => { if (pk.includes(k)) near(q.mag / N, pk.length === 1 ? 1 : 0.5, 1e-9, `peak height N=${N} f=${f}`); else near(q.mag / N, 0, 1e-9, `no energy elsewhere N=${N} f=${f} k=${k}`); });
  // samples of f and N−f are identical (aliasing)
  M.cosSamples(f, N).forEach((v, n) => near(v, M.cosSamples(N - f, N)[n], 1e-9, 'f and N−f give the same samples'));
  ok(M.alias(f, N) <= N / 2, 'alias folds into 0..N/2');
  if (f > N / 2 && f < N) ok(pk.includes(N - f), 'peak lands at N−f');
}
for (let trial = 0; trial < 20; trial++) { const x = Array.from({ length: 16 }, rnd), Xk = M.dft(x); for (let k = 1; k < 16; k++) near(Xk[k].mag, Xk[16 - k].mag, 1e-9, 'real signal: |X[k]| = |X[N−k]|'); }

// ---- bilingual parity ----
const zk = Object.keys(zh).sort(), ek = Object.keys(en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(zh[k]), ph(en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['formula']);
for (const k of zk) ok(NEUTRAL.has(k) || zh[k] !== en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
ok(!/左图|右图/.test(Object.values(zh).join('')) && !/left plot|right plot|left panel|right panel/i.test(Object.values(en).join('')), 'no left/right picture references');

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['reveal0', 'gControls', 'k1', 'sweep1', 'clear1', 'ph2', 'clear2', 'T3', 'd3', 'clear3', 'n4', 'clear4', 'f5', 'n16', 'n32']) ok(html.includes(`id="${id}"`), 'control ' + id);
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
ok(fs.existsSync(path.join(dir, '../../../signal/transforms/fourier/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS fourier core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
