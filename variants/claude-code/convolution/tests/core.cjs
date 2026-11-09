'use strict';
// Convolution (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };

// ---- discrete convolution: direct definition vs implementation ----
const direct = (x, h) => { const L = x.length + h.length - 1, y = []; for (let n = 0; n < L; n++) { let s = 0; for (let k = 0; k < x.length; k++) { const j = n - k; if (j >= 0 && j < h.length) s += x[k] * h[j]; } y.push(s); } return y; };
let seed = 7; const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648 * 4 - 2; };
for (let trial = 0; trial < 200; trial++) {
  const x = Array.from({ length: 1 + (trial % 7) }, rnd), h = Array.from({ length: 1 + (trial % 4) }, rnd);
  const y = M.conv(x, h), d = direct(x, h);
  ok(y.length === x.length + h.length - 1, 'length N + M − 1');
  y.forEach((v, i) => near(v, d[i], 1e-12, 'conv vs definition'));
  // commutativity and the column view (step 2) agree with the stacked copies (step 1)
  M.conv(h, x).forEach((v, i) => near(v, y[i], 1e-12, 'commutative'));
  const rows = M.copies(x, h);
  for (let n = -3; n < y.length + 3; n++) {
    const col = M.terms(x, h, n), stacked = n >= 0 && n < y.length ? rows.reduce((s, row) => s + row[n], 0) : 0;
    near(col.sum, n >= 0 && n < y.length ? y[n] : 0, 1e-12, 'column sum = y[n]');
    near(col.sum, stacked, 1e-12, 'column = stacked copies');
  }
}

// ---- step 0: shift and scale (linearity + time invariance) ----
for (let k = 0; k <= 6; k++) for (let a = -2; a <= 2; a += 0.5) {
  const x = new Array(k + 1).fill(0); x[k] = a;
  const y = M.conv(x, M.ECHO);
  M.ECHO.forEach((v, j) => near(y[k + j], a * v, 1e-12, 'a·h[n−k]'));
  y.forEach((v, n) => { if (n < k) near(v, 0, 0, 'zero before the clap'); });
}

// ---- step 1/2 defaults; quiz answer (5 + 3 − 1 = 7) and the overlap range n = 0..6 ----
const yDef = M.conv(M.DEFAULT_X, M.ECHO);
assert.equal(yDef.length, 7); checks++;
for (let n = -2; n <= 8; n++) ok((M.terms(M.DEFAULT_X, M.ECHO, n).terms.length > 0) === (n >= 0 && n <= 6), 'overlap exists exactly for n = 0..6');
// the slider range of step 2 (−2..8) and the sweep cover every non-zero output plus two empty ends
ok(M.terms(M.DEFAULT_X, M.ECHO, -1).terms.length === 0 && M.terms(M.DEFAULT_X, M.ECHO, 7).terms.length === 0, 'n = −1 and 7 have no overlap');
// the flipped kernel: h[j] sits at k = n − j
const c3 = M.terms(M.DEFAULT_X, M.ECHO, 3);
assert.deepEqual(c3.terms.map(q => [q.k, q.j]), [[1, 2], [2, 1], [3, 0]]); checks++;
near(c3.sum, 0 * 0.3 + 2 * 0.6 + -1 * 1, 1e-12, 'y[3] example');

// ---- step 3: smoothing ----
ok(M.SEEDS.length === 5, 'five noise sets');
let lo = Infinity, hi = 0;
for (let set = 0; set < 5; set++) {
  const S = M.scene(set);
  // noise is what the text says: σ ≈ 0.3, independent (lag-1 correlation small)
  const sd = M.rms(S.noise); ok(sd > 0.25 && sd < 0.35, 'noise σ ≈ 0.3 for set ' + set);
  for (let w = 1; w <= 15; w += 2) {
    const q = M.smoothing(w, set);
    // the ramp is exactly w − 1 samples (s3hint, s3readout)
    assert.equal(q.ramp, w - 1, `ramp w=${w}`); checks++;
    // linearity: output = smoothed clean + smoothed noise = smoothed raw
    const { h, origin } = M.box(w), yRaw = M.convCentered(S.raw, h, origin);
    yRaw.forEach((v, i) => near(v, q.out[i], 1e-12, 'linearity split'));
    if (w === 1) near(q.noiseRatio, 1, 1e-12, 'w = 1 leaves noise unchanged');
    else { const ratio = q.noiseRatio / q.theory; lo = Math.min(lo, ratio); hi = Math.max(hi, ratio); }
    // centred kernel: no delay; the smoothed clean step is symmetric about the edge (y[UP−1−i] + y[UP+i]... sums to 1)
    for (let i = 0; i < 8; i++) near(q.yClean[S.UP - 1 - i] + q.yClean[S.UP + i], 1, 1e-12, 'centred: no delay');
  }
}
// s3hint quotes 0.91–1.21 for sets 1–5, w = 3..15
ok(lo >= 0.905 && lo < 0.915 && hi > 1.205 && hi < 1.215, `noise ratio / (1/√w) range ${lo}..${hi}`);
for (const l of ['zh', 'en']) ok(STRINGS[l].s3hint.includes('0.91–1.21'), 's3hint quotes the tested range');
// the averaged-noise law itself holds on average (many independent runs, fixed PRNG)
{
  let s = 99; const u = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (const w of [5, 15]) {
    let acc = 0; const R = 300;
    for (let rr = 0; rr < R; rr++) {
      const nz = Array.from({ length: 240 }, () => Math.sqrt(-2 * Math.log(u())) * Math.cos(2 * Math.PI * u()));
      const { h, origin } = M.box(w), y = M.convCentered(nz, h, origin), a = (w - 1) / 2;
      acc += M.rms(y.slice(a, 240 - a)) / M.rms(nz.slice(a, 240 - a));
    }
    near(acc / R, 1 / Math.sqrt(w), 0.01, 'mean ratio ≈ 1/√w for w=' + w);
  }
}

// ---- step 4: continuous convolution ----
for (const sh of ['box', 'ramp']) for (let b = 0.25; b <= 2; b += 0.25) {
  for (let tt = -0.5; tt <= 3.5 + 1e-9; tt += 0.02) near(M.contY(sh, b, tt), M.contYNumeric(sh, b, tt), 2e-3, `exact vs Riemann ${sh} b=${b} t=${tt}`);
  const st = M.contStats(sh, b);
  near(st.end, 1 + b, 1e-12, 'support width 1 + b');
  near(st.total, 1 * st.gArea, 2e-3, 'total area = area(f) × area(g)');
  ok(M.contY(sh, b, -1e-9) === 0 && M.contY(sh, b, 1 + b + 1e-9) === 0, 'zero outside 0 < t < 1 + b');
  if (sh === 'box') {
    near(st.peak, Math.min(1, b), 1e-9, 'box peak = min(1, b)');
    near(st.flat, Math.abs(1 - b), 2e-3, 'box plateau = |1 − b|');
    // closed form for rect * rect
    for (let tt = -0.5; tt <= 3.5; tt += 0.05) near(M.contY('box', b, tt), Math.max(0, Math.min(1, tt) - Math.max(0, tt - b)), 1e-12, 'rect*rect closed form');
  }
}
// b = 1 box gives a symmetric triangle; the ramp gives an asymmetric curve (the flip is visible)
for (let d = 0; d <= 1; d += 0.05) near(M.contY('box', 1, 1 - d), M.contY('box', 1, 1 + d), 1e-12, 'triangle symmetric');
ok(Math.abs(M.contY('ramp', 1, 0.5) - M.contY('ramp', 1, 1.5)) > 0.1, 'ramp output asymmetric');
// slider ranges keep g(t − τ) inside the drawn τ axis [−2.6, 4.1]
ok(-0.5 - 2 >= -2.6 && 3.5 <= 4.1, 'g support inside axis');

// ---- step 5: frequency response ----
for (let w = 1; w <= 11; w += 2) for (let i = 0; i <= 100; i++) {
  const f = i * 0.005, m = M.measureGain(w, f), Hf = M.HboxFormula(w, f), Hd = M.Hbox(w, f);
  near(m.amp, Math.abs(Hf), 1e-9, `measured gain w=${w} f=${f}`);
  near(Hd.re, Hf, 1e-9, 'DTFT sum = closed form'); near(Hd.im, 0, 1e-9, 'centred kernel is real');
  if (Math.abs(Hf) > 1e-3) ok((m.a < 0) === (Hf < 0), 'sign of fitted cosine = sign of H (flipNote)');
  // zeroNote fires exactly at whole multiples of 1/w on the slider grid
  const isZero = w > 1 && Math.abs(f * w - Math.round(f * w)) < 1e-9 && Math.round(f * w) > 0;
  ok((m.amp < 1e-3) === isZero, `zero note w=${w} f=${f}`);
}
near(M.measureGain(5, 0.2).amp, 0, 1e-9, 'w=5 wipes f=0.2'); near(M.measureGain(5, 0.4).amp, 0, 1e-9, 'w=5 wipes f=0.4');
near(M.measureGain(5, 0).amp, 1, 1e-12, 'DC passes unchanged');
// the displayed window n = 100..163 is outside the zero-padding transient for every w (≤ 11)
ok(100 - 5 >= 0 && 163 + 5 < M.SINE.L, 'display window in steady state');
// convolution theorem: DFT of the linear convolution = product of zero-padded DFTs
for (let trial = 0; trial < 20; trial++) {
  const x = Array.from({ length: 6 }, rnd), h = Array.from({ length: 4 }, rnd), y = M.conv(x, h), L = 9;
  const X = M.dft(x, L), Hh = M.dft(h, L), Y = M.dft(y, L);
  Y.forEach((v, q) => { near(v.re, X[q].re * Hh[q].re - X[q].im * Hh[q].im, 1e-9, 'Y = XH re'); near(v.im, X[q].re * Hh[q].im + X[q].im * Hh[q].re, 1e-9, 'Y = XH im'); });
}

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['xk', 's2lgY', 's2readout', 's4lgF', 's4lgG', 's3lgTheory', 'formula']); // symbols only
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['k0', 'a0', 'n2', 'w3', 't4', 'b4', 'f5', 'w5', 'add1', 'all1', 'sweep2', 'reroll3', 'clear3', 'shapeBox', 'shapeRamp', 'sweep4', 'checkQuiz']) ok(html.includes(`id="${id}"`), 'control ' + id);

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../signal/systems/convolution/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS convolution core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · noise ratio ${lo.toFixed(3)}–${hi.toFixed(3)}`);
