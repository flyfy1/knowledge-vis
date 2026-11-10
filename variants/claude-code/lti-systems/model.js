'use strict';
// LTI lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every stem, curve and readout on the page is computed here; tests/core.cjs pins the claims.
// Conventions: discrete time, every box starts at rest (zero state) at n = 0 and sees the input
// only on the window n = 0..L−1. Outputs are produced by running each box's own rule,
// never by convolving with h; convolution is used only for the *prediction* we compare against.
(function (root) {
  const L = 16;          // display / test window
  const N_IN = 8;        // length of the editable input in steps 0–1
  const PRESETS = [
    [0.5, 1, 1.5, -1, 0.75, 0, -0.5, 1],
    [1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 1.5, 0, 0, -1, 0, 0],
    [1, -1, 1, -1, 1, -1, 1, -1]
  ];
  const SMOOTH_A = 0.6;  // default pole of the smoother y[n] = a·y[n−1] + (1−a)·x[n]

  // The boxes. Each rule maps a finite input array to an output array of the same length.
  const BOXES = {
    echo:   { lti: true,  run: x => x.map((v, n) => v + 0.5 * (n >= 3 ? x[n - 3] : 0)) },
    smooth: { lti: true,  run: (x, a = SMOOTH_A) => { let y = 0; return x.map(v => (y = a * y + (1 - a) * v)); } },
    diff:   { lti: true,  run: x => x.map((v, n) => v - (n >= 1 ? x[n - 1] : 0)) },
    square: { lti: false, run: x => x.map(v => v * v) },
    clip:   { lti: false, run: x => x.map(v => Math.max(-1, Math.min(1, v))) },
    offset: { lti: false, run: x => x.map(v => v + 0.5) },
    warm:   { lti: false, run: x => x.map((v, n) => (1 + n / 8) * v) }
  };
  const IDS = Object.keys(BOXES);
  const LTI_IDS = IDS.filter(id => BOXES[id].lti);
  const run = (id, x, a) => BOXES[id].run(x, a);

  const zeros = n => new Array(n).fill(0);
  const pad = (x, n) => { const y = zeros(n); x.forEach((v, i) => { if (i < n) y[i] = v; }); return y; };
  const delta = (n, k = 0) => { const y = zeros(n); if (k >= 0 && k < n) y[k] = 1; return y; };
  const unitStep = n => new Array(n).fill(1);
  const maxAbsDiff = (a, b, from = 0) => { let m = 0; for (let i = from; i < a.length; i++) m = Math.max(m, Math.abs(a[i] - b[i])); return m; };
  const TOL = 1e-9;      // below this a residual counts as zero (round-off only)

  // Step 0: piece k of the input is x[k]·δ[n−k]; the partial sum of the first c pieces.
  function piece(x, k, n = L) { const y = zeros(n); if (k >= 0 && k < x.length) y[k] = x[k]; return y; }
  function partialSum(x, c, n = L) { const y = zeros(n); for (let k = 0; k < Math.min(c, x.length); k++) y[k] = x[k]; return y; }

  // Step 1: record h by slapping the box, then predict y = x ∗ h on the window (causal, so exact on 0..n−1).
  function recordH(id, n = L, a) { return run(id, delta(n), a); }
  function predict(x, h, n = L) {
    const y = zeros(n);
    for (let i = 0; i < n; i++) { let s = 0; for (let k = 0; k <= i; k++) s += (x[k] || 0) * (h[i - k] || 0); y[i] = s; }
    return y;
  }
  function slapAndPredict(id, x) {
    const xin = pad(x, L), h = recordH(id), pred = predict(xin, h), act = run(id, xin);
    return { x: xin, h, pred, act, err: maxAbsDiff(pred, act) };
  }

  // Step 2: two fixed test bursts; the learner scales x1 by A. Same input for every test of a box.
  const X1 = pad([0, 0.7, 0.5, -0.6, 0.3], L);
  const X2 = pad([0, 0, 0, 0.4, -0.5, 0.6, 0.2], L);
  const mix = A => X1.map((v, i) => A * v + X2[i]);
  function superposition(id, A) {
    const xin = mix(A), r1 = run(id, xin), s1 = run(id, X1), s2 = run(id, X2), r2 = s1.map((v, i) => A * v + s2[i]);
    return { x: xin, r1, r2, res: maxAbsDiff(r1, r2) };
  }
  const delay = (x, d) => x.map((_, i) => (i - d >= 0 ? x[i - d] : 0));
  // Shift test: compare S(x delayed by d) with S(x) delayed by d on n = d..L−1, where both are defined.
  function shift(id, A, d) {
    const xin = mix(A), xs = delay(xin, d), r1 = run(id, xs), y = run(id, xin);
    const r2 = r1.map((_, i) => (i - d >= 0 ? y[i - d] : NaN));
    return { x: xin, xs, r1, r2, d, res: maxAbsDiff(r1, r2, d) };
  }
  function prediction(id, A) {
    const xin = mix(A), h = recordH(id), pred = predict(xin, h), act = run(id, xin);
    return { x: xin, h, r1: act, r2: pred, res: maxAbsDiff(act, pred) };
  }
  const TESTS = { sup: superposition, shift: (id, A, d) => shift(id, A, d), pred: prediction };

  // Step 3: step response. Measured by feeding u[n]; compared with the running sum of h.
  function stepStudy(id, a) {
    const h = recordH(id, L, a), s = run(id, unitStep(L), a);
    const cum = []; h.reduce((acc, v, i) => (cum[i] = acc + v), 0);
    const back = s.map((v, i) => v - (i ? s[i - 1] : 0));
    const dc = id === 'echo' ? 1.5 : id === 'diff' ? 0 : 1; // Σ h over all n (closed form)
    return { h, s, cum, back, errCum: maxAbsDiff(s, cum), errBack: maxAbsDiff(back, h), dc, last: s[L - 1] };
  }

  // Step 4: a box given directly by h[n] = r^(n − n0) for n ≥ n0 (zero before). Window n = −4..30.
  const S4 = { nMin: -4, nMax: 30 };
  function geoH(r, n0) {
    const ns = [], h = [];
    for (let n = S4.nMin; n <= S4.nMax; n++) { ns.push(n); h.push(n >= n0 ? Math.pow(r, n - n0) : 0); }
    return { ns, h };
  }
  // Worst case over all inputs with |x| ≤ 1: |y[n]| ≤ Σ_{k ≤ n} |h[k]|, reached by x[n − k] = sign h[k].
  function worstCase(r, n0) {
    const { ns, h } = geoH(r, n0), acc = []; let s = 0;
    h.forEach((v, i) => { s += Math.abs(v); acc.push(s); });
    const ar = Math.abs(r), bound = ar < 1 ? 1 / (1 - ar) : Infinity;
    let total31 = 0; for (let i = 0; i <= 30; i++) total31 += Math.pow(ar, i); // first 31 terms of h, independent of n0
    return { ns, h, acc, total31, bound, stable: ar < 1, causal: n0 >= 0, early: Math.max(0, -n0) };
  }

  // Step 5: feed A·cos(ωn), ω = 2πm/64, for n = 0..127; analyse the steady window n = 64..127 by DFT.
  const S5 = { total: 128, from: 64, N: 64 };
  const omega = m => 2 * Math.PI * m / S5.N;
  function dft(y) {
    const N = y.length, out = [];
    for (let k = 0; k < N; k++) { let re = 0, im = 0; for (let i = 0; i < N; i++) { re += y[i] * Math.cos(2 * Math.PI * k * i / N); im -= y[i] * Math.sin(2 * Math.PI * k * i / N); } out.push({ re, im }); }
    return out;
  }
  function Hof(h, w) { let re = 0, im = 0; h.forEach((v, k) => { re += v * Math.cos(w * k); im -= v * Math.sin(w * k); }); return { re, im, mag: Math.hypot(re, im), ph: Math.atan2(im, re) }; }
  function Hclosed(id, w) {
    if (id === 'echo') { const re = 1 + 0.5 * Math.cos(3 * w), im = -0.5 * Math.sin(3 * w); return { re, im, mag: Math.hypot(re, im), ph: Math.atan2(im, re) }; }
    if (id === 'diff') { const re = 1 - Math.cos(w), im = Math.sin(w); return { re, im, mag: Math.hypot(re, im), ph: Math.atan2(im, re) }; }
    if (id === 'smooth') { const a = SMOOTH_A, dr = 1 - a * Math.cos(w), di = a * Math.sin(w), d2 = dr * dr + di * di; const re = (1 - a) * dr / d2, im = -(1 - a) * di / d2; return { re, im, mag: Math.hypot(re, im), ph: Math.atan2(im, re) }; }
    return null;
  }
  function sineTest(id, m, A) {
    const w = omega(m), x = Array.from({ length: S5.total }, (_, n) => A * Math.cos(w * n));
    const y = run(id, x), win = y.slice(S5.from), Y = dft(win), N = S5.N;
    // one-sided amplitude spectrum: bins 0..N/2
    const amp = []; for (let k = 0; k <= N / 2; k++) amp.push(Math.hypot(Y[k].re, Y[k].im) / ((k === 0 || k === N / 2) ? N : N / 2));
    const Hm = { re: Y[m].re / (A * N / 2), im: Y[m].im / (A * N / 2) };
    const gain = Math.hypot(Hm.re, Hm.im), phase = Math.atan2(Hm.im, Hm.re);
    let tot = 0; Y.forEach(c => { tot += c.re * c.re + c.im * c.im; });
    const atIn = Y[m].re ** 2 + Y[m].im ** 2 + Y[N - m].re ** 2 + Y[N - m].im ** 2;
    const other = tot > 1e-18 ? Math.max(0, 1 - atIn / tot) : 0;
    const newBins = amp.map((v, k) => k).filter(k => k !== m && amp[k] > 1e-6);
    const h = recordH(id, S5.total), Hh = BOXES[id].lti ? Hof(h, w) : null;
    return { w, x, y, amp, gain, phase, other, newBins, Hh, Hc: Hclosed(id, w) };
  }

  const api = { L, N_IN, PRESETS, SMOOTH_A, BOXES, IDS, LTI_IDS, run, pad, delta, unitStep, maxAbsDiff, TOL,
    piece, partialSum, recordH, predict, slapAndPredict, X1, X2, mix, superposition, delay, shift, prediction, TESTS,
    stepStudy, S4, geoH, worstCase, S5, omega, dft, Hof, Hclosed, sineTest };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.LTI_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
