'use strict';
// Overfitting lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every point, curve and readout on the page is computed here; tests/core.cjs pins the claims.
// Simulated data: y = f(x) + Gaussian noise on x in [−1, 1]; models are polynomials in the Legendre basis.
(function (root) {
  const truth = x => 0.8 * Math.sin(2.5 * x) + 0.3 * x;
  const SIGMA = 0.25, N_TRAIN = 12, N_TEST = 400, MAX_DEG = 11;

  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function gauss(u) { let a = u(); while (a <= 1e-12) a = u(); return Math.sqrt(-2 * Math.log(a)) * Math.cos(2 * Math.PI * u()); }
  // n points: x jittered around an even grid (so no big gaps), standard-normal noise kept separately so σ can be rescaled.
  function sample(n, seed, { jitter = true } = {}) {
    const u = rng(seed), xs = [], z = [];
    for (let i = 0; i < n; i++) { const x = -1 + (2 * (i + (jitter ? 0.15 + 0.7 * u() : 0.5))) / n; xs.push(x); }
    for (let i = 0; i < n; i++) z.push(gauss(u));
    return { x: xs, z };
  }
  function testSet(seed = 4242, n = N_TEST) { const u = rng(seed), x = [], z = []; for (let i = 0; i < n; i++) x.push(-1 + 2 * u()); for (let i = 0; i < n; i++) z.push(gauss(u)); return { x, z }; }
  const labels = (S, sigma) => S.x.map((x, i) => truth(x) + sigma * S.z[i]);

  // Legendre polynomials P_0..P_d at x (well conditioned on [−1, 1]).
  function legendre(x, d) { const P = [1]; if (d >= 1) P.push(x); for (let k = 2; k <= d; k++) P.push(((2 * k - 1) * x * P[k - 1] - (k - 1) * P[k - 2]) / k); return P; }
  // Least squares by Householder QR (no normal equations).
  function lstsq(A, b) {
    const m = A.length, n = A[0].length, R = A.map(r => r.slice()), y = b.slice();
    for (let k = 0; k < n; k++) {
      let norm = 0; for (let i = k; i < m; i++) norm += R[i][k] * R[i][k]; norm = Math.sqrt(norm);
      if (norm < 1e-300) continue;
      const alpha = R[k][k] > 0 ? -norm : norm, v = new Array(m).fill(0);
      v[k] = R[k][k] - alpha; for (let i = k + 1; i < m; i++) v[i] = R[i][k];
      let vv = 0; for (let i = k; i < m; i++) vv += v[i] * v[i]; if (vv < 1e-300) continue;
      for (let j = k; j < n; j++) { let s = 0; for (let i = k; i < m; i++) s += v[i] * R[i][j]; s = 2 * s / vv; for (let i = k; i < m; i++) R[i][j] -= s * v[i]; }
      let s = 0; for (let i = k; i < m; i++) s += v[i] * y[i]; s = 2 * s / vv; for (let i = k; i < m; i++) y[i] -= s * v[i];
    }
    const w = new Array(n).fill(0);
    for (let k = n - 1; k >= 0; k--) { let s = y[k]; for (let j = k + 1; j < n; j++) s -= R[k][j] * w[j]; w[k] = s / R[k][k]; }
    return w;
  }
  function fit(x, y, d) { return { d, w: lstsq(x.map(v => legendre(v, d)), y) }; }
  function predict(m, x) { const P = legendre(x, m.d); let s = 0; for (let k = 0; k <= m.d; k++) s += m.w[k] * P[k]; return s; }
  function rmse(m, x, y) { let s = 0; for (let i = 0; i < x.length; i++) { const e = predict(m, x[i]) - y[i]; s += e * e; } return Math.sqrt(s / x.length); }

  // Train/test RMSE for every degree on one data set.
  function degreeScan(train, test, sigma, maxDeg = MAX_DEG) {
    const yt = labels(train, sigma), ys = labels(test, sigma), out = [];
    for (let d = 0; d <= Math.min(maxDeg, train.x.length - 1); d++) { const m = fit(train.x, yt, d); out.push({ d, train: rmse(m, train.x, yt), test: rmse(m, test.x, ys) }); }
    return out;
  }
  const best = scan => scan.reduce((a, b) => (b.test < a.test ? b : a));

  // Bias² and variance of degree-d fits over many training sets (seeds), measured on a grid.
  const GRID = []; for (let i = 0; i <= 40; i++) GRID.push(-1 + i / 20);
  function fan(d, seeds, sigma = SIGMA, n = N_TRAIN) {
    const curves = seeds.map(s => { const S = sample(n, s); return GRID.map(x => predict(fit(S.x, labels(S, sigma), d), x)); });
    const mean = GRID.map((_, j) => curves.reduce((a, c) => a + c[j], 0) / curves.length);
    let b2 = 0, v = 0;
    GRID.forEach((x, j) => { b2 += (mean[j] - truth(x)) ** 2; v += curves.reduce((a, c) => a + (c[j] - mean[j]) ** 2, 0) / Math.max(1, curves.length - 1); });
    return { curves, mean, bias2: b2 / GRID.length, variance: v / GRID.length };
  }

  // Early stopping: plain gradient descent on the mean squared error of a degree-D model, started at w = 0.
  // Returns RMSE checkpoints at log-spaced step counts.
  function gdRun({ D = MAX_DEG, seed = 7, sigma = SIGMA, n = N_TRAIN, steps = 100000, valSeed = 777, nVal = 40 } = {}) {
    const S = sample(n, seed), y = labels(S, sigma), X = S.x.map(v => legendre(v, D));
    const V = testSet(valSeed, nVal), yv = labels(V, sigma), XV = V.x.map(v => legendre(v, D));
    const T = testSet(4242), yT = labels(T, sigma), XT = T.x.map(v => legendre(v, D));
    // step size 1/L with L the largest eigenvalue of (2/n) XᵀX (power iteration)
    const G = []; for (let a = 0; a <= D; a++) { G.push([]); for (let b = 0; b <= D; b++) { let s = 0; for (let i = 0; i < n; i++) s += X[i][a] * X[i][b]; G[a].push(2 * s / n); } }
    let v = new Array(D + 1).fill(1), L = 0;
    for (let it = 0; it < 500; it++) { const w2 = G.map(r => r.reduce((s, g, j) => s + g * v[j], 0)); L = Math.sqrt(w2.reduce((s, q) => s + q * q, 0)); v = w2.map(q => q / L); }
    const eta = 1 / L, w = new Array(D + 1).fill(0);
    const err = (XX, yy) => { let s = 0; for (let i = 0; i < XX.length; i++) { let p = 0; for (let k = 0; k <= D; k++) p += XX[i][k] * w[k]; s += (p - yy[i]) ** 2; } return Math.sqrt(s / XX.length); };
    const marks = new Set(); for (let e = 0; e <= Math.log10(steps) + 1e-9; e += 0.05) marks.add(Math.round(Math.pow(10, e)));
    const out = [{ step: 0, train: err(X, y), val: err(XV, yv), test: err(XT, yT), w: w.slice() }];
    for (let st = 1; st <= steps; st++) {
      const r = X.map((row, i) => row.reduce((s, q, k) => s + q * w[k], 0) - y[i]);
      for (let k = 0; k <= D; k++) { let g = 0; for (let i = 0; i < n; i++) g += r[i] * X[i][k]; w[k] -= eta * 2 * g / n; }
      if (marks.has(st)) out.push({ step: st, train: err(X, y), val: err(XV, yv), test: err(XT, yT), w: w.slice() });
    }
    return { S, y, D, eta, L, checkpoints: out };
  }

  const api = { truth, SIGMA, N_TRAIN, N_TEST, MAX_DEG, rng, gauss, sample, testSet, labels, legendre, lstsq, fit, predict, rmse, degreeScan, best, GRID, fan, gdRun };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.OVERFIT_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
