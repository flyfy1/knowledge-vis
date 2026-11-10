'use strict';
// Binomial-to-normal lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every bar, curve and readout on the page is computed here; tests/core.cjs pins the claims.
// X ~ Binomial(n, p): n independent rows of pegs, the ball goes right with probability p at each,
// X = number of rights = landing bin (0 … n). The pegboard balls are simulated with a seeded
// pseudo-random generator (mulberry32); they are not a physical experiment.
(function (root) {
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Pascal's triangle rows 0..N as exact integers (N ≤ 50 stays below 2^53).
  function pascal(N) { const rows = [[1]]; for (let n = 1; n <= N; n++) { const r = [1]; for (let k = 1; k < n; k++) r.push(rows[n - 1][k - 1] + rows[n - 1][k]); r.push(1); rows.push(r); } return rows; }
  const LF = [0];
  function logFact(n) { for (let i = LF.length; i <= n; i++) LF[i] = LF[i - 1] + Math.log(i); return LF[n]; }
  const choose = (n, k) => (k < 0 || k > n ? 0 : Math.round(Math.exp(logFact(n) - logFact(k) - logFact(n - k))));
  function pmf(n, k, p) {
    if (k < 0 || k > n) return 0;
    if (p <= 0) return k === 0 ? 1 : 0;
    if (p >= 1) return k === n ? 1 : 0;
    return Math.exp(logFact(n) - logFact(k) - logFact(n - k) + k * Math.log(p) + (n - k) * Math.log(1 - p));
  }
  const pmfAll = (n, p) => Array.from({ length: n + 1 }, (_, k) => pmf(n, k, p));
  const mean = (n, p) => n * p, variance = (n, p) => n * p * (1 - p), sd = (n, p) => Math.sqrt(n * p * (1 - p));

  // Standard normal density and CDF (West 2005 double-precision rational approximation of Hart's algorithm).
  const phi = z => Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI);
  function Phi(x) {
    const a = Math.abs(x); let c;
    if (a > 37) c = 0;
    else {
      const e = Math.exp(-a * a / 2);
      if (a < 7.07106781186547) {
        let b = 3.52624965998911e-02 * a + 0.700383064443688; b = b * a + 6.37396220353165; b = b * a + 33.912866078383; b = b * a + 112.079291497871; b = b * a + 221.213596169931; b = b * a + 220.206867912376;
        c = e * b;
        b = 8.83883476483184e-02 * a + 1.75566716318264; b = b * a + 16.064177579207; b = b * a + 86.7807322029461; b = b * a + 296.564248779674; b = b * a + 637.333633378831; b = b * a + 793.826512519948; b = b * a + 440.413735824752;
        c /= b;
      } else { let b = a + 0.65; b = a + 4 / b; b = a + 3 / b; b = a + 2 / b; b = a + 1 / b; c = e / b / 2.506628274631; }
    }
    return x > 0 ? 1 - c : c;
  }
  // Normal density with the binomial's mean and spread, evaluated at x (same units as k).
  const normalDensity = (n, p, x) => { const s = sd(n, p); return phi((x - mean(n, p)) / s) / s; };

  // Step 0: every path to bin k, as strings of L/R, in lexicographic order with L < R.
  function paths(n, k) {
    const out = [];
    (function rec(pre, r) { if (pre.length === n) { if (r === k) out.push(pre); return; } if (n - pre.length > k - r) rec(pre + 'L', r); if (r < k) rec(pre + 'R', r + 1); })('', 0);
    return out;
  }

  // Step 1: one ball → its path (array of 0 = left, 1 = right) and its bin.
  function drop(n, p, rng) { const steps = []; let k = 0; for (let i = 0; i < n; i++) { const r = rng() < p ? 1 : 0; steps.push(r); k += r; } return { steps, k }; }

  // Step 2: probability mass within one standard deviation of the mean.
  function within1sd(n, p) { const m = mean(n, p), s = sd(n, p); let t = 0; for (let k = 0; k <= n; k++) if (Math.abs(k - m) <= s + 1e-12) t += pmf(n, k, p); return t; }

  // Steps 3 and 4: the largest gap between the bars and the bell, at whole numbers k.
  function fit(n, p) {
    const s = sd(n, p); let gap = 0, at = 0, peak = 0;
    for (let k = 0; k <= n; k++) { const q = pmf(n, k, p), d = Math.abs(q - normalDensity(n, p, k)); if (d > gap) { gap = d; at = k; } peak = Math.max(peak, q); }
    return { gap, at, peak, bellPeak: 1 / (s * Math.sqrt(2 * Math.PI)), zGap: gap * s, skew: (1 - 2 * p) / s, rule: n * p >= 10 && n * (1 - p) >= 10 };
  }

  // Step 5: P(X ≥ k) exactly and by the bell curve, without and with the half-unit correction.
  function tail(n, p, k) {
    let exact = 0; for (let j = Math.max(0, k); j <= n; j++) exact += pmf(n, j, p);
    const m = mean(n, p), s = sd(n, p);
    const raw = 1 - Phi((k - m) / s), cc = 1 - Phi((k - 0.5 - m) / s);
    return { exact, raw, cc, errRaw: raw - exact, errCc: cc - exact, zRaw: (k - m) / s, zCc: (k - 0.5 - m) / s };
  }

  const P_STEPS = Array.from({ length: 17 }, (_, i) => Number((0.1 + 0.05 * i).toFixed(2)));   // 0.10 … 0.90
  const N4 = [4, 9, 16, 25, 36, 64, 100, 144, 256, 400];                                      // step 4: square numbers, so √n is whole

  const api = { mulberry32, pascal, logFact, choose, pmf, pmfAll, mean, variance, sd, phi, Phi, normalDensity, paths, drop, within1sd, fit, tail, P_STEPS, N4 };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.BN_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
