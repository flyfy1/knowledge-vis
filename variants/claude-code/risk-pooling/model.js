'use strict';
// Risk pooling lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every bar, curve and readout on the page is computed here; tests/core.cjs pins the claims.
// One policy: in a year the household suffers a loss of L with probability p, otherwise nothing.
(function (root) {
  const L = 10000;
  function rng(seed) {
    let a = seed >>> 0;
    return function () { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const mean = a => a.reduce((s, v) => s + v, 0) / a.length;
  const sd = a => { const m = mean(a); return Math.sqrt(a.reduce((s, v) => s + (v - m) * (v - m), 0) / a.length); };

  /* ---------- exact binomial (log space, works up to N = 100000) ---------- */
  const LF = new Float64Array(100001);
  for (let k = 1; k <= 100000; k++) LF[k] = LF[k - 1] + Math.log(k);
  function binomPmf(k, n, p) { if (k < 0 || k > n) return 0; if (p <= 0) return k === 0 ? 1 : 0; return Math.exp(LF[n] - LF[k] - LF[n - k] + k * Math.log(p) + (n - k) * Math.log(1 - p)); }
  // P(K > k) for K ~ Binomial(n, p), summed from the far side for accuracy.
  function binomTail(k, n, p) { let s = 0; const hi = Math.min(n, Math.ceil(n * p + 40 * Math.sqrt(n * p * (1 - p)) + 40)); for (let j = hi; j > k; j--) s += binomPmf(j, n, p); return Math.min(1, s); }

  // Number of claims in one year for a pool of n, drawn household by household (exact, no approximation).
  function claims(n, p, r) { let k = 0; for (let i = 0; i < n; i++) if (r() < p) k++; return k; }

  /* ---------- step 0: share the bill among N households ---------- */
  const SHARE_N = [1, 10, 100, 1000, 10000], YEARS = 40;
  function shareYears(n, p, seed) {
    const r = rng(seed * 7717 + n), cost = [], k = [];
    for (let y = 0; y < YEARS; y++) { const c = claims(n, p, r); k.push(c); cost.push(c * L / n); }
    return { k, cost };
  }
  const theorySd = (n, p) => L * Math.sqrt(p * (1 - p) / n);

  /* ---------- step 1: the square-root law ---------- */
  const LAW_N = [1, 3, 10, 30, 100, 300, 1000, 3000, 10000], LAW_YEARS = 400, P1 = 0.01;
  const lawCache = new Map();
  function lawRun(n) {
    if (lawCache.has(n)) return lawCache.get(n);
    const r = rng(9001 + n), cost = [];
    for (let y = 0; y < LAW_YEARS; y++) cost.push(claims(n, P1, r) * L / n);
    const out = { cost, sd: sd(cost), mean: mean(cost) };
    lawCache.set(n, out); return out;
  }
  // P(per-person cost > 2 × expected) = P(K > 2np), exact.
  const badYear = (n, p) => binomTail(Math.floor(2 * n * p + 1e-9), n, p);

  /* ---------- step 2: loading needed for a target failure rate ---------- */
  const LOAD_N = [10, 30, 100, 300, 1000, 3000, 10000, 30000, 100000], EPS = [0.05, 0.01, 0.001], P2 = 0.01;
  // Smallest claim count k* the pot must cover so that P(K > k*) ≤ ε; premium per head = k*·L/N.
  function kStar(n, p, eps) { let k = Math.floor(n * p); while (binomTail(k, n, p) > eps) k++; return k; }
  function loading(n, p, eps) { const k = kStar(n, p, eps); return { k, theta: k / (n * p) - 1, premium: k * L / n, ruin: binomTail(k, n, p) }; }
  // Normal approximation of the same loading, for comparison: z·√((1−p)/(np)).
  const Z = { 0.05: 1.6448536269514722, 0.01: 2.3263478740408408, 0.001: 3.090232306167813 };
  const loadingNormal = (n, p, eps) => Z[eps] * Math.sqrt((1 - p) / (n * p));

  /* ---------- step 3: storm years hit everyone at once ---------- */
  const P0 = 0.01, N3 = 10000;
  function stormYears(p1, q, seed) {
    const r = rng(seed * 313 + 7), out = [];
    for (let y = 0; y < YEARS; y++) { const storm = r() < q, p = storm ? p1 : P0; out.push({ storm, cost: claims(N3, p, r) * L / N3 }); }
    return out;
  }
  const pBar = (p1, q) => P0 + q * (p1 - P0);
  // Per-person cost SD with storms: independent part shrinks with N, the common part does not.
  function stormSd(n, p1, q) { const within = (1 - q) * P0 * (1 - P0) + q * p1 * (1 - p1); return L * Math.sqrt(within / n + (p1 - P0) * (p1 - P0) * q * (1 - q)); }
  const stormFloor = (p1, q) => L * (p1 - P0) * Math.sqrt(q * (1 - q));
  const indepSd = (n, p1, q) => theorySd(n, pBar(p1, q));

  /* ---------- step 4: one price for different risks ---------- */
  // 1000 households whose yearly loss probabilities spread evenly on a log scale from 0.2% to 8%.
  const NPEOPLE = 1000, PMIN = 0.002, PMAX = 0.08, THETA4 = 0.1;
  const RISKS = Array.from({ length: NPEOPLE }, (_, i) => PMIN * Math.pow(PMAX / PMIN, (i + 0.5) / NPEOPLE));
  // A household stays if the premium is at most (1 + m) × its own expected loss.
  const stays = (pi, premium, m) => (1 + m) * pi * L >= premium - 1e-9;
  // One round: price = (1 + θ) × average expected loss of the current pool; then everyone re-decides.
  function spiral(m, maxRounds = 60) {
    let pool = RISKS.slice(); const rounds = [];
    for (let k = 0; k < maxRounds; k++) {
      if (!pool.length) { rounds.push({ premium: NaN, share: 0, meanP: NaN }); break; }
      const premium = (1 + THETA4) * mean(pool) * L;
      rounds.push({ premium, share: pool.length / NPEOPLE, meanP: mean(pool) });
      const next = RISKS.filter(pi => stays(pi, premium, m));
      if (next.length === pool.length) break;
      pool = next;
    }
    return rounds;
  }
  // Risk-rated alternative: each household is charged (1 + θ) × its own expected loss.
  const ratedShare = m => RISKS.filter(pi => stays(pi, (1 + THETA4) * pi * L, m)).length / NPEOPLE;

  const api = { L, rng, mean, sd, binomPmf, binomTail, claims, SHARE_N, YEARS, shareYears, theorySd, LAW_N, LAW_YEARS, P1, lawRun, badYear, LOAD_N, EPS, P2, kStar, loading, loadingNormal, P0, N3, stormYears, pBar, stormSd, stormFloor, indepSd, NPEOPLE, PMIN, PMAX, THETA4, RISKS, stays, spiral, ratedShare };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.POOL_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
