'use strict';
// Expected-value lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every bar, curve and readout on the page is computed here; tests/core.cjs pins the claims.
// A distribution is an array of { x, p } with p summing to 1.
(function (root) {
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

  // Step 0/1 games: what you receive (yuan) for one play.
  const GAMES = {
    die: range(1, 6).map(x => ({ x, p: 1 / 6 })),                       // receive the face value
    six: [{ x: 0, p: 5 / 6 }, { x: 12, p: 1 / 6 }],                      // 12 yuan on a six, else nothing
    max2: range(1, 6).map(m => ({ x: m, p: (2 * m - 1) / 36 }))          // the larger of two dice
  };

  // Step 2 tickets: price you pay and what you may receive.
  const SCRATCH = [
    { x: 0, p: 1 - (0.1 + 0.02 + 0.001 + 0.00001) },
    { x: 10, p: 0.1 }, { x: 50, p: 0.02 }, { x: 1000, p: 0.001 }, { x: 100000, p: 0.00001 }
  ];
  const TICKETS = {
    roulette: { dist: [{ x: 0, p: 19 / 37 }, { x: 20, p: 18 / 37 }], price: 10 },   // 10 on red, single-zero wheel
    dice: { dist: GAMES.die, price: 4 },
    scratch: { dist: SCRATCH, price: 10 }                                            // made-up prize table
  };

  const mean = d => d.reduce((s, o) => s + o.p * o.x, 0);
  const variance = d => { const m = mean(d); return d.reduce((s, o) => s + o.p * (o.x - m) * (o.x - m), 0); };
  const sd = d => Math.sqrt(variance(d));
  const total = d => d.reduce((s, o) => s + o.p, 0);
  // Net turning effect about a pivot g: Σ p·(x − g) = E − g. Positive = the right side is heavier.
  const torque = (d, g) => d.reduce((s, o) => s + o.p * (o.x - g), 0);
  const torqueSides = (d, g) => {
    let left = 0, right = 0;
    d.forEach(o => { if (o.x < g) left += o.p * (g - o.x); else right += o.p * (o.x - g); });
    return { left, right };
  };

  // Seeded PRNG (mulberry32) so every "replay" button is reproducible.
  function rng(seed) {
    let a = seed >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function sampler(d) {
    const cum = []; let s = 0; d.forEach(o => { s += o.p; cum.push(s); });
    return u => { for (let i = 0; i < cum.length; i++) if (u < cum[i]) return i; return cum.length - 1; };
  }
  // Running average after each of n plays; also counts per outcome index.
  function play(d, n, rnd, state) {
    const pick = sampler(d), st = state || { n: 0, sum: 0, counts: new Array(d.length).fill(0), avg: [] };
    for (let i = 0; i < n; i++) { const j = pick(rnd()); st.n++; st.sum += d[j].x; st.counts[j]++; st.avg.push(st.sum / st.n); }
    return st;
  }
  // E ± 2σ/√n, the band that holds the running average in about 95% of replays (normal approximation).
  const band = (d, n) => 2 * sd(d) / Math.sqrt(n);
  // Share of independent replays whose average after n plays lies inside the band (used by tests).
  function coverage(d, n, runs, seed) {
    const r = rng(seed), E = mean(d), w = band(d, n); let inside = 0;
    for (let k = 0; k < runs; k++) { const st = play(d, n, r); if (Math.abs(st.sum / n - E) <= w) inside++; }
    return inside / runs;
  }

  // Step 2: fair price and house edge.
  function fairness(d, price) {
    const E = mean(d);
    return { E, net: E - price, edge: price > 0 ? (price - E) / price : 0, returnRate: price > 0 ? E / price : Infinity, loss1000: 1000 * (price - E), contributions: d.map(o => ({ x: o.x, p: o.p, c: o.p * o.x })) };
  }
  // Cumulative net winnings of one player over n plays.
  function netPath(d, price, n, rnd) {
    const pick = sampler(d), path = [0]; let s = 0;
    for (let i = 0; i < n; i++) { s += d[pick(rnd())].x - price; path.push(s); }
    return path;
  }

  // Step 3: the sum of n dice under three couplings.
  function convolve(a, b) {
    const m = new Map();
    a.forEach(u => b.forEach(v => { const x = u.x + v.x; m.set(x, (m.get(x) || 0) + u.p * v.p); }));
    return [...m.entries()].sort((p, q) => p[0] - q[0]).map(([x, p]) => ({ x, p }));
  }
  function sumDist(n, mode) {
    const die = GAMES.die;
    if (mode === 'same') return die.map(o => ({ x: n * o.x, p: o.p }));                 // one roll copied n times
    if (mode === 'mirror') {                                                               // pairs (x, 7 − x)
      const pairs = Math.floor(n / 2);
      return n % 2 ? die.map(o => ({ x: 7 * pairs + o.x, p: o.p })) : [{ x: 7 * pairs, p: 1 }];
    }
    let d = die; for (let i = 1; i < n; i++) d = convolve(d, die); return d;               // independent
  }

  // Step 4: one household's yearly loss vs an insurer holding N such policies.
  const LOSS = 200000;
  function logChoose(n, k) { return lgamma(n + 1) - lgamma(k + 1) - lgamma(n - k + 1); }
  function lgamma(z) { // Lanczos, accurate to ~1e-13 for z > 0.5
    const g = 7, c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - lgamma(1 - z);
    z -= 1; let x = c[0]; for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
    const t = z + g + 0.5; return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
  }
  function binomPmf(N, p, k) {
    if (k < 0 || k > N) return 0;
    if (p === 0) return k === 0 ? 1 : 0;
    return Math.exp(logChoose(N, k) + k * Math.log(p) + (N - k) * Math.log(1 - p));
  }
  // P(K > c) for K ~ Bin(N, p), summed exactly (terms below 1e-300 are dropped).
  function binomUpper(N, p, c) {
    const k0 = Math.floor(c) + 1; if (k0 > N) return 0; if (k0 <= 0) return 1;
    let s = 0; for (let k = k0; k <= N; k++) { const v = binomPmf(N, p, k); s += v; if (k > N * p && v < 1e-18 * s) break; }
    return Math.min(1, s);
  }
  function insurance(p, loading, N) {
    const pL = p * LOSS, premium = (1 + loading) * pL;
    const k = premium * N / LOSS;                               // claims the premiums can cover
    const mean = pL, sdOne = LOSS * Math.sqrt(p * (1 - p)), sdAvg = sdOne / Math.sqrt(N);
    return { pL, premium, extra: premium - pL, sdOne, sdAvg, coverClaims: k, probLoss: binomUpper(N, p, k), profitPerPolicy: premium - pL, mean };
  }
  // Average payout per policy: distribution of LOSS·K/N, restricted to k in [lo, hi].
  function avgClaimDist(N, p) {
    const mu = N * p, s = Math.sqrt(N * p * (1 - p));
    const lo = Math.max(0, Math.floor(mu - 8 * s - 2)), hi = Math.min(N, Math.ceil(mu + 8 * s + 2));
    const out = []; for (let k = lo; k <= hi; k++) out.push({ k, x: LOSS * k / N, p: binomPmf(N, p, k) });
    return out;
  }

  // Step 5: St Petersburg — first head on flip k pays 2^k yuan, capped at 2^K (what the casino holds).
  const stPeteMean = K => K + 1;                                 // Σ_{k≤K} 2^-k·2^k + Σ_{k>K} 2^-k·2^K = K + 1
  function stPetePlay(K, rnd) { let k = 1; while (rnd() < 0.5 && k < 200) k++; return { k, pay: Math.pow(2, Math.min(k, K)) }; }

  const api = { GAMES, TICKETS, SCRATCH, mean, variance, sd, total, torque, torqueSides, rng, sampler, play, band, coverage, fairness, netPath, convolve, sumDist, LOSS, lgamma, binomPmf, binomUpper, insurance, avgClaimDist, stPeteMean, stPetePlay };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.EV_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
