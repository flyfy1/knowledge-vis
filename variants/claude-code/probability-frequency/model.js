'use strict';
// Probability & frequency lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every spin, curve and readout on the page comes from here; tests/core.cjs pins the claims.
// The "wheel" is an ideal spinner simulated with a seeded pseudo-random generator (mulberry32):
// the pointer stops at angle 360°·u with u uniform in [0, 1), and the spin is red when u < p,
// i.e. when the pointer lands inside the red sector that starts at 12 o'clock and runs clockwise.
// Spins are independent by construction. Nothing here is a physical experiment.
(function (root) {
  const SECTORS = 12;                // the wheel is cut into 12 equal sectors (30° each)
  const DEFAULT_RED = 4;             // 4 of 12 sectors red → p = 1/3
  const GROUP = 10;                  // step 1: spins per group
  const PATH_N = 10000;              // steps 2 and 5: length of one long run
  const STEP3_N = [20, 80, 320, 1280, 5120];   // ×4 each time
  const STEP3_GROUPS = 500;
  const BAND = 0.05;                 // step 3: "close" means within ±0.05 of p
  const STREAK_N = 60000;            // step 4: length of the sequence searched for streaks
  const STREAK_MAX = 6;
  const HIDDEN = [0.37, 0.18, 0.62, 0.45, 0.81];   // step 6: secret red shares (not multiples of 1/12)

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

  function gcd(a, b) { while (b) { [a, b] = [b, a % b]; } return a; }
  // k red sectors of 12 → { p, num, den } with the fraction in lowest terms.
  function wheel(k) { const g = gcd(k, SECTORS); return { k, p: k / SECTORS, num: k / g, den: SECTORS / g, deg: 30 * k }; }

  // n uniform numbers from a seed; red = u < p.
  function draws(seed, n) { const r = mulberry32(seed), u = new Float64Array(n); for (let i = 0; i < n; i++) u[i] = r(); return u; }
  const isRed = (u, p) => u < p;

  // Running counts along one sequence: reds[i] = number of reds among the first i + 1 spins.
  function runningReds(u, p) {
    const out = new Uint32Array(u.length); let c = 0;
    for (let i = 0; i < u.length; i++) { if (u[i] < p) c++; out[i] = c; }
    return out;
  }

  // The "funnel": about 95% of runs stay within p ± 2·√(p(1−p)/n) (normal approximation).
  const halfWidth = (p, n) => 2 * Math.sqrt(p * (1 - p) / n);

  // Exact binomial probabilities via log-factorials (stable up to tens of thousands of trials).
  const LF = [0];
  function logFact(n) { for (let i = LF.length; i <= n; i++) LF[i] = LF[i - 1] + Math.log(i); return LF[n]; }
  function binomPmf(n, r, p) {
    if (r < 0 || r > n) return 0;
    if (p === 0) return r === 0 ? 1 : 0;
    if (p === 1) return r === n ? 1 : 0;
    return Math.exp(logFact(n) - logFact(r) - logFact(n - r) + r * Math.log(p) + (n - r) * Math.log(1 - p));
  }
  // Exact probability that the frequency r/n lands within p ± d (inclusive, with a tiny tolerance for rounding).
  function probWithin(n, p, d) {
    let s = 0;
    for (let r = 0; r <= n; r++) if (Math.abs(r / n - p) <= d + 1e-12) s += binomPmf(n, r, p);
    return s;
  }
  const funnelCoverage = (n, p) => probWithin(n, p, halfWidth(p, n));

  // Step 1: can a group of n spins ever show a frequency exactly equal to p?
  const exactPossible = (k, n) => (n * k) % SECTORS === 0;

  // Step 3: G groups of n spins each, from one seed.
  function groups(n, p, G, seed) {
    const r = mulberry32(seed), freq = new Float64Array(G);
    for (let g = 0; g < G; g++) { let c = 0; for (let i = 0; i < n; i++) if (r() < p) c++; freq[g] = c / n; }
    return freq;
  }
  function quantile(sorted, q) { const i = (sorted.length - 1) * q, lo = Math.floor(i), hi = Math.ceil(i); return sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo); }
  // Histogram bins: width 1/20 when n = 20, otherwise 1/80 (every n in STEP3_N ≥ 80 is a multiple of 80,
  // so each bin holds the same number of possible frequencies and no comb artefacts appear).
  const binsFor = n => (n < 80 ? n : 80);
  const binOf = (r, n) => { const B = binsFor(n); return Math.min(B, Math.floor(r * B / n + 0.5)); };
  function groupStats(n, p, seed) {
    const f = groups(n, p, STEP3_GROUPS, seed), B = binsFor(n);
    const sim = new Float64Array(B + 1), exact = new Float64Array(B + 1);
    let inside = 0;
    f.forEach(v => { sim[binOf(Math.round(v * n), n)] += 1 / STEP3_GROUPS; if (Math.abs(v - p) <= BAND + 1e-12) inside++; });
    for (let r = 0; r <= n; r++) exact[binOf(r, n)] += binomPmf(n, r, p);
    const s = Array.from(f).sort((a, b) => a - b);
    const lo = quantile(s, 0.025), hi = quantile(s, 0.975);
    return { n, B, sim, exact, inside, insideShare: inside / STEP3_GROUPS, exactShare: probWithin(n, p, BAND), lo, hi, width: hi - lo, theoryWidth: 2 * halfWidth(p, n) };
  }

  // Step 4: after a streak of exactly-or-more k reds (the last k spins were all red), is the next spin red?
  function streakTable(u, p, kmax = STREAK_MAX) {
    const rows = [];
    for (let k = 0; k <= kmax; k++) rows.push({ k, cases: 0, nextRed: 0 });
    let run = 0; // current number of consecutive reds ending at i − 1
    for (let i = 0; i < u.length; i++) {
      const red = u[i] < p;
      for (let k = 0; k <= Math.min(run, kmax); k++) { rows[k].cases++; if (red) rows[k].nextRed++; }
      run = red ? run + 1 : 0;
    }
    rows.forEach(r => { r.freq = r.cases ? r.nextRed / r.cases : null; });
    return rows;
  }

  // Step 5: gaps along a run. countGap = reds − n·p (in spins), freqGap = reds/n − p.
  function gaps(reds, p, n) { const r = reds[n - 1]; return { n, reds: r, freq: r / n, countGap: r - n * p, freqGap: r / n - p, countBand: 2 * Math.sqrt(n * p * (1 - p)), freqBand: halfWidth(p, n) }; }

  // Step 6: estimate from data; the rough range uses the observed frequency (Wald interval).
  function estimate(reds, n) { const f = reds / n, h = n ? 2 * Math.sqrt(f * (1 - f) / n) : 1; return { f, lo: Math.max(0, f - h), hi: Math.min(1, f + h), h }; }
  // Exact chance (over all possible data) that this rough range covers the true p.
  function waldCoverage(n, p) {
    let s = 0;
    for (let r = 0; r <= n; r++) { const e = estimate(r, n); if (p >= e.lo - 1e-12 && p <= e.hi + 1e-12) s += binomPmf(n, r, p); }
    return s;
  }

  // Log-scale positions for the n slider of steps 2 and 5 (1, 2, 3, 5, 10, 20, 30, 50, … 10000).
  const NSTOPS = (() => { const a = []; for (let d = 1; d <= 1000; d *= 10) [1, 2, 3, 5].forEach(m => a.push(m * d)); a.push(10000); return a; })();

  const api = { SECTORS, DEFAULT_RED, GROUP, PATH_N, STEP3_N, STEP3_GROUPS, BAND, STREAK_N, STREAK_MAX, HIDDEN, NSTOPS,
    mulberry32, wheel, draws, isRed, runningReds, halfWidth, binomPmf, probWithin, funnelCoverage, exactPossible,
    groups, groupStats, binsFor, binOf, quantile, streakTable, gaps, estimate, waldCoverage };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PF_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
