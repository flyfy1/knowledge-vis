'use strict';
// Hypothesis-testing lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Exact two-sided binomial test of a coin: H0 says P(heads) = 0.5.
// "At least as extreme" = at least as far from n/2, measured by D = |2k − n| (an integer).
(function (root) {
  const pmfCache = new Map();
  // P(K = k) for K ~ Bin(n, q), k = 0..n (log-space, then exponentiated).
  function pmf(n, q) {
    const key = n + ':' + q; if (pmfCache.has(key)) return pmfCache.get(key);
    const out = new Array(n + 1); let lc = 0; // log C(n, k)
    for (let k = 0; k <= n; k++) {
      if (k > 0) lc += Math.log(n - k + 1) - Math.log(k);
      out[k] = q === 0 ? (k === 0 ? 1 : 0) : q === 1 ? (k === n ? 1 : 0) : Math.exp(lc + k * Math.log(q) + (n - k) * Math.log(1 - q));
    }
    if (pmfCache.size > 4000) pmfCache.clear();
    pmfCache.set(key, out); return out;
  }
  const dist = (n, k) => Math.abs(2 * k - n);
  // Two-sided p-value: probability under H0 of a head count at least as far from n/2 as k.
  function pValue(n, k) { const P = pmf(n, 0.5), d = dist(n, k); let s = 0; for (let j = 0; j <= n; j++) if (dist(n, j) >= d) s += P[j]; return Math.min(1, s); }
  // P(D ≥ d) under success probability q.
  function tail(n, q, d) { const P = pmf(n, q); let s = 0; for (let j = 0; j <= n; j++) if (dist(n, j) >= d) s += P[j]; return s; }
  // Rejection region decided before the data: smallest D* with P0(D ≥ D*) ≤ α. Reject when D ≥ D*.
  // If even the two most extreme outcomes are too likely, D* = n + 1 (never reject).
  function critical(n, alpha) { for (let d = n % 2; d <= n; d += 2) if (tail(n, 0.5, d) <= alpha + 1e-12) return d; return n + 1; }
  const reject = (n, alpha, k) => dist(n, k) >= critical(n, alpha);
  const size = (n, alpha) => tail(n, 0.5, critical(n, alpha));            // actual type I error rate (≤ α)
  const power = (n, q, alpha) => tail(n, q, critical(n, alpha));           // P(reject | P(heads) = q)
  // Region as head counts: reject k ≤ lo or k ≥ hi.
  function region(n, alpha) { const d = critical(n, alpha); return { d, lo: Math.floor((n - d) / 2), hi: Math.ceil((n + d) / 2) }; }

  // Exact distribution of the p-value in 20 bins of width 0.05 when the truth is q.
  function pBins(n, q, bins = 20) {
    const P = pmf(n, q), out = new Array(bins).fill(0);
    for (let k = 0; k <= n; k++) { const p = pValue(n, k); out[Math.max(0, Math.min(bins - 1, Math.floor(p * bins - 1e-9)))] += P[k]; }
    return out;
  }
  const shareBelow = (n, q, a) => { const P = pmf(n, q); let s = 0; for (let k = 0; k <= n; k++) if (pValue(n, k) <= a + 1e-12) s += P[k]; return s; };

  function rng(seed) {
    let a = seed >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function flips(n, q, rnd) { let k = 0; for (let i = 0; i < n; i++) if (rnd() < q) k++; return k; }

  // Sample size: first n (in [nMin, nMax]) whose power reaches the target; null if none.
  function powerCurve(q, alpha, nMin, nMax) { const out = []; for (let n = nMin; n <= nMax; n++) out.push({ n, pw: power(n, q, alpha) }); return out; }
  function minN(q, alpha, target, nMin, nMax) { for (let n = nMin; n <= nMax; n++) if (power(n, q, alpha) >= target) return n; return null; }
  // Normal-approximation planning formula (for comparison only).
  function zq(p) { // inverse standard normal CDF (Acklam), |error| < 1.2e-9
    const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.383577518672690e2, -3.066479806614716e1, 2.506628277459239];
    const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
    const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
    const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
    const pl = 0.02425;
    if (p < pl) { const q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    if (p > 1 - pl) return -zq(1 - p);
    const q = p - 0.5, r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }
  function approxN(q, alpha, target) { const za = zq(1 - alpha / 2), zb = zq(target); const v = (za * 0.5 + zb * Math.sqrt(q * (1 - q))) / Math.abs(q - 0.5); return v * v; }

  // Step 5: a batch of coins, a share pi of them biased (P(heads) = q); each flipped n times and tested at α.
  function verdicts(pi, n, q, alpha) {
    const s = size(n, alpha), pw = power(n, q, alpha);
    const wrong = (1 - pi) * s, right = pi * pw;               // expected shares of all coins
    return { size: s, power: pw, wrong, right, convicted: wrong + right, fdr: wrong + right > 0 ? wrong / (wrong + right) : 0 };
  }
  function batch(count, pi, n, q, alpha, rnd) {
    const nb = Math.round(pi * count), out = { fairAcq: 0, fairConv: 0, biasConv: 0, biasAcq: 0 };
    for (let i = 0; i < count; i++) {
      const biased = i < nb, k = flips(n, biased ? q : 0.5, rnd), r = reject(n, alpha, k);
      if (biased) { if (r) out.biasConv++; else out.biasAcq++; } else if (r) out.fairConv++; else out.fairAcq++;
    }
    return out;
  }
  const familyWise = (m, n, alpha) => 1 - Math.pow(1 - size(n, alpha), m);

  const api = { pmf, dist, pValue, tail, critical, reject, size, power, region, pBins, shareBelow, rng, flips, powerCurve, minN, zq, approxN, verdicts, batch, familyWise };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.HT_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
