'use strict';
// Convolution lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every stem, curve and readout on the page is computed here; tests/core.cjs pins the claims.
// Conventions: finite real sequences indexed from 0, zero outside their range (zero extension),
// full linear convolution (length N + M − 1). Not circular convolution, not correlation.
(function (root) {
  // The system used in steps 0–2: a decaying echo.
  const ECHO = [1, 0.6, 0.3];
  // Step 1/2 default input (five "claps").
  const DEFAULT_X = [1, 0, 2, -1, 0.5];

  function conv(x, h) {
    const N = x.length, M = h.length, y = new Array(N + M - 1).fill(0);
    for (let k = 0; k < N; k++) for (let j = 0; j < M; j++) y[k + j] += x[k] * h[j];
    return y;
  }

  // One output sample read as a column: the terms x[k]·h[n − k] that overlap at n.
  function terms(x, h, n) {
    const out = [];
    for (let k = 0; k < x.length; k++) {
      const j = n - k;
      if (j >= 0 && j < h.length) out.push({ k, j, xk: x[k], hj: h[j], prod: x[k] * h[j] });
    }
    return { n, terms: out, sum: out.reduce((s, q) => s + q.prod, 0) };
  }

  // The k-th scaled, shifted copy x[k]·h[n − k] laid out on 0..N+M−2.
  function copies(x, h) {
    const L = x.length + h.length - 1;
    return x.map((xk, k) => { const row = new Array(L).fill(0); h.forEach((hj, j) => { row[k + j] = xk * hj; }); return row; });
  }

  // Kernel whose sample m sits at offset m − origin (origin = index of the kernel's zero).
  // y[n] = Σ_m h[m] · x[n − (m − origin)], same length as x, zero outside x.
  function convCentered(x, h, origin) {
    const N = x.length, y = new Array(N).fill(0);
    for (let n = 0; n < N; n++) {
      let s = 0;
      for (let m = 0; m < h.length; m++) { const i = n - (m - origin); if (i >= 0 && i < N) s += h[m] * x[i]; }
      y[n] = s;
    }
    return y;
  }

  // Centred moving-average kernel, odd width w.
  function box(w) { return { h: new Array(w).fill(1 / w), origin: (w - 1) / 2 }; }

  // Seeded PRNG (mulberry32) + Box–Muller, so the simulated noise is identical on every load.
  function rng(seed) {
    let a = seed >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function gaussian(n, sigma, seed) {
    const r = rng(seed), out = [];
    while (out.length < n) {
      const u = Math.max(r(), 1e-12), v = r(), m = Math.sqrt(-2 * Math.log(u));
      out.push(sigma * m * Math.cos(2 * Math.PI * v)); if (out.length < n) out.push(sigma * m * Math.sin(2 * Math.PI * v));
    }
    return out;
  }

  // Step 3 scene: a clean step up at n = 60, down at n = 180, plus independent Gaussian noise (σ = 0.3).
  // Five fixed noise sets (seeds 1–5, not hand-picked) so the learner can see how one run scatters.
  const SEEDS = [1, 2, 3, 4, 5];
  const sceneCache = {};
  function scene(set = 0) {
    if (sceneCache[set]) return sceneCache[set];
    const L = 240, UP = 60, DOWN = 180, SIGMA = 0.3, seed = SEEDS[set];
    const clean = Array.from({ length: L }, (_, n) => (n >= UP && n < DOWN ? 1 : 0));
    const noise = gaussian(L, SIGMA, seed);
    return (sceneCache[set] = { L, UP, DOWN, SIGMA, seed, clean, noise, raw: clean.map((c, i) => c + noise[i]) });
  }

  const rms = a => Math.sqrt(a.reduce((s, v) => s + v * v, 0) / a.length);

  // Smoothing metrics, measured on the simulated data (linearity lets the two parts be smoothed separately).
  // noiseRatio: RMS(smoothed noise) / RMS(raw noise) over samples whose window lies wholly inside the data.
  // ramp: number of smoothed-step samples that are more than 0.02 away from both 0 and 1, around the up edge.
  function smoothing(w, set = 0) {
    const { h, origin } = box(w), S = scene(set);
    const yClean = convCentered(S.clean, h, origin), yNoise = convCentered(S.noise, h, origin);
    const out = yClean.map((c, i) => c + yNoise[i]);
    const lo = (w - 1) / 2, hi = S.L - 1 - (w - 1) / 2;
    const a = [], b = [];
    for (let i = lo; i <= hi; i++) { a.push(yNoise[i]); b.push(S.noise[i]); }
    let ramp = 0;
    for (let i = 0; i < (S.UP + S.DOWN) / 2; i++) if (yClean[i] > 0.02 && yClean[i] < 0.98) ramp++;
    return { w, out, yClean, noiseRatio: rms(a) / rms(b), theory: 1 / Math.sqrt(w), ramp };
  }

  // Step 4: continuous convolution of f = rectangle on [0, 1] with g on [0, b] (box or falling ramp).
  const A = 1;
  function g(shape, b, u) { if (u < 0 || u > b) return 0; return shape === 'ramp' ? 1 - u / b : 1; }
  function overlap(b, t) { const lo = Math.max(0, t - b), hi = Math.min(A, t); return hi > lo ? { lo, hi } : null; }
  // Exact area: ∫_{lo}^{hi} g(t − τ) dτ, with u = t − τ running from t − hi to t − lo.
  function contY(shape, b, t) {
    const o = overlap(b, t); if (!o) return 0;
    const u0 = t - o.hi, u1 = t - o.lo;
    if (shape === 'ramp') return (u1 - u0) - (u1 * u1 - u0 * u0) / (2 * b);
    return u1 - u0;
  }
  // Independent check: midpoint Riemann sum of f(τ)·g(t − τ).
  function contYNumeric(shape, b, t, steps = 20000) {
    const lo = -3, hi = 5, d = (hi - lo) / steps; let s = 0;
    for (let i = 0; i < steps; i++) { const tau = lo + (i + 0.5) * d; if (tau >= 0 && tau <= A) s += g(shape, b, t - tau) * d; }
    return s;
  }
  function contStats(shape, b) {
    let peak = 0, total = 0, flat = 0; const d = 0.0005;
    for (let t = 0; t <= A + b + 1e-9; t += d) { const y = contY(shape, b, t); peak = Math.max(peak, y); total += y * d; }
    for (let t = 0; t <= A + b + 1e-9; t += d) if (contY(shape, b, t) > peak - 1e-9) flat += d;
    return { end: A + b, peak, total, gArea: shape === 'ramp' ? b / 2 : b, flat };
  }

  // Step 5: frequency response of the centred box, measured by feeding a long cosine and fitting
  // a·cos + c·sin to the steady-state middle of the output (no formula involved), next to the closed form.
  function Hbox(w, f) {
    const { h, origin } = box(w); let re = 0, im = 0;
    h.forEach((v, m) => { re += v * Math.cos(2 * Math.PI * f * (m - origin)); im -= v * Math.sin(2 * Math.PI * f * (m - origin)); });
    return { re, im };
  }
  function HboxFormula(w, f) {
    const s = Math.sin(Math.PI * f);
    return Math.abs(s) < 1e-12 ? 1 : Math.sin(Math.PI * f * w) / (w * s);
  }
  const SINE = { L: 400, from: 100, to: 300 };
  function sineRun(w, f) {
    const x = Array.from({ length: SINE.L }, (_, n) => Math.cos(2 * Math.PI * f * n));
    const { h, origin } = box(w);
    return { x, y: convCentered(x, h, origin) };
  }
  function measureGain(w, f) {
    const { y } = sineRun(w, f);
    let cc = 0, ss = 0, cs = 0, yc = 0, ys = 0;
    for (let n = SINE.from; n < SINE.to; n++) {
      const c = Math.cos(2 * Math.PI * f * n), s = Math.sin(2 * Math.PI * f * n);
      cc += c * c; ss += s * s; cs += c * s; yc += y[n] * c; ys += y[n] * s;
    }
    let a, b;
    const det = cc * ss - cs * cs;
    if (ss < 1e-9 * cc || Math.abs(det) < 1e-9 * cc * cc) { a = yc / cc; b = 0; } // f = 0 or 0.5: sin column vanishes
    else { a = (yc * ss - ys * cs) / det; b = (ys * cc - yc * cs) / det; }
    // y ≈ a·cos(2πfn) + b·sin(2πfn); a carries the sign for the real (centred) kernel.
    return { amp: Math.hypot(a, b), a, b };
  }

  // DFT (for the convolution-theorem check in tests).
  function dft(x, L) {
    const out = [];
    for (let q = 0; q < L; q++) { let re = 0, im = 0; for (let n = 0; n < x.length; n++) { re += x[n] * Math.cos(2 * Math.PI * q * n / L); im -= x[n] * Math.sin(2 * Math.PI * q * n / L); } out.push({ re, im }); }
    return out;
  }

  const api = { ECHO, DEFAULT_X, conv, terms, copies, convCentered, box, SEEDS, scene, smoothing, A, g, overlap, contY, contYNumeric, contStats, Hbox, HboxFormula, SINE, sineRun, measureGain, dft, rms };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CONV_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
