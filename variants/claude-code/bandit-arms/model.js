'use strict';
// Multi-armed bandit lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every bar, curve and readout on the page is computed here; tests/core.cjs pins the claims.
// Setting: K independent Bernoulli arms with fixed win probabilities (stationary). Regret is the
// expected (pseudo-)regret: the sum over pulls of (best probability − probability of the arm pulled),
// which only a simulation that knows the true probabilities can compute.
(function (root) {
  const ARMS = [0.35, 0.55, 0.65, 0.45];   // machines A–D in steps 0–4; C is best
  const NAMES = ['A', 'B', 'C', 'D'];
  const BUDGET = 20;                        // step 0 hand-play budget
  const T_ETC = 400;                        // step 1 horizon
  const T_EPS = 1000, RUNS_EPS = 200;       // step 2
  const T_ONE = 300;                        // steps 3–4: one seeded run
  const T_CMP = 2000, RUNS_CMP = 100;       // step 5
  const DELTAS = [0.02, 0.05, 0.1, 0.2, 0.3];

  function rng(seed) {
    let a = seed >>> 0;
    const u = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    let spare = null;
    const normal = () => {
      if (spare !== null) { const s = spare; spare = null; return s; }
      let x = 0; while (x === 0) x = u();
      const r = Math.sqrt(-2 * Math.log(x)), th = 2 * Math.PI * u(); spare = r * Math.sin(th); return r * Math.cos(th);
    };
    // Marsaglia–Tsang gamma(shape ≥ 1); shape < 1 via the boost u^(1/shape)
    const gamma = k => {
      if (k < 1) return gamma(k + 1) * Math.pow(u() || 1e-300, 1 / k);
      const d = k - 1 / 3, c = 1 / Math.sqrt(9 * d);
      for (;;) {
        let x, v; do { x = normal(); v = 1 + c * x; } while (v <= 0);
        v = v * v * v; const w = u();
        if (w < 1 - 0.0331 * x * x * x * x || Math.log(w) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
      }
    };
    const beta = (a, b) => { const x = gamma(a), y = gamma(b); return x / (x + y); };
    return { u, normal, gamma, beta };
  }
  const best = P => Math.max(...P);
  const gaps = P => P.map(p => best(P) - p);

  // ---- step 0: hand play. Each arm has its own fixed outcome stream, so the k-th pull of an arm is reproducible.
  // A "game" g permutes which letter holds which probability.
  function game(g) {
    const r = rng(500 + g), perm = [0, 1, 2, 3];
    if (g > 0) for (let i = 3; i > 0; i--) { const j = Math.floor(r.u() * (i + 1)); [perm[i], perm[j]] = [perm[j], perm[i]]; }
    const P = perm.map(i => ARMS[i]);
    const streams = P.map((p, a) => { const s = rng(900 + 31 * g + a); return Array.from({ length: BUDGET }, () => (s.u() < p ? 1 : 0)); });
    return { P, streams };
  }

  // ---- step 1: explore-then-commit. Exact probability of committing to each arm after m pulls each
  // (ties broken uniformly at random), and the exact expected regret over horizon T.
  function binomPmf(m, p) {
    const out = new Array(m + 1); let c = 1;
    for (let x = 0; x <= m; x++) { out[x] = c * Math.pow(p, x) * Math.pow(1 - p, m - x); c = c * (m - x) / (x + 1); }
    return out;
  }
  function etcCommit(P, m) {
    const pm = P.map(p => binomPmf(m, p)), K = P.length;
    const cdfBelow = pm.map(f => { const c = [0]; for (let x = 0; x < f.length; x++) c.push(c[x] + f[x]); return c; }); // c[x] = P(X < x)
    return P.map((_, j) => {
      let pr = 0; const others = [...Array(K).keys()].filter(i => i !== j);
      for (let x = 0; x <= m; x++) {
        let s = 0;
        for (let mask = 0; mask < 1 << others.length; mask++) {
          let q = 1, ties = 0;
          others.forEach((i, b) => { if (mask >> b & 1) { q *= pm[i][x]; ties++; } else q *= cdfBelow[i][x]; });
          s += q / (1 + ties);
        }
        pr += pm[j][x] * s;
      }
      return pr;
    });
  }
  function etcRegret(P, m, T = T_ETC) {
    const g = gaps(P), c = etcCommit(P, m);
    return m * g.reduce((s, v) => s + v, 0) + (T - P.length * m) * c.reduce((s, v, j) => s + v * g[j], 0);
  }
  // Simulated commits (the tally the reader grows by pressing the button)
  function etcSimulate(P, m, runs, seed = 77) {
    const r = rng(seed + 1009 * m), tally = new Array(P.length).fill(0);
    for (let k = 0; k < runs; k++) {
      const wins = P.map(p => { let w = 0; for (let i = 0; i < m; i++) if (r.u() < p) w++; return w; });
      const top = Math.max(...wins), cand = wins.map((w, i) => (w === top ? i : -1)).filter(i => i >= 0);
      tally[cand[Math.floor(r.u() * cand.length)]]++;
    }
    return tally;
  }

  // ---- generic bandit runner. policy(state, r) returns the arm to pull. state: t (1-based), n[], s[] (wins).
  function run(P, T, policy, seed) {
    const r = rng(seed), K = P.length, n = new Array(K).fill(0), s = new Array(K).fill(0), g = gaps(P);
    const regret = new Float64Array(T), picks = new Uint8Array(T), wins = new Uint8Array(T);
    let acc = 0;
    for (let t = 1; t <= T; t++) {
      const a = policy({ t, n, s, K }, r), win = r.u() < P[a] ? 1 : 0;
      n[a]++; s[a] += win; acc += g[a]; regret[t - 1] = acc; picks[t - 1] = a; wins[t - 1] = win;
    }
    return { regret, picks, wins, n, s };
  }
  const argmaxRand = (vals, r) => { const top = Math.max(...vals); const c = []; vals.forEach((v, i) => { if (v >= top - 1e-12) c.push(i); }); return c.length === 1 ? c[0] : c[Math.floor(r.u() * c.length)]; };
  const est = (st, i) => (st.n[i] ? st.s[i] / st.n[i] : 0);
  // ε-greedy (ε = 0 is greedy): one pull of each arm first, then explore with probability ε.
  const epsGreedy = eps => (st, r) => {
    const un = st.n.indexOf(0); if (un >= 0) return un;
    if (r.u() < eps) return Math.floor(r.u() * st.K);
    return argmaxRand(st.n.map((_, i) => est(st, i)), r);
  };
  // UCB with exploration weight c (c = 1 is UCB1): estimate + c·√(2 ln t / n).
  const ucbBonus = (t, n, c) => c * Math.sqrt(2 * Math.log(t) / n);
  const ucb = c => (st, r) => {
    const un = st.n.indexOf(0); if (un >= 0) return un;
    return argmaxRand(st.n.map((n, i) => est(st, i) + ucbBonus(st.t, n, c)), r);
  };
  // Thompson sampling with uniform Beta(1, 1) priors.
  const thompson = () => (st, r) => argmaxRand(st.n.map((n, i) => r.beta(1 + st.s[i], 1 + n - st.s[i])), r);

  // Average cumulative regret over many seeded runs.
  function meanRegret(P, T, makePolicy, runs, seed) {
    const acc = new Float64Array(T); let bestShareLate = 0;
    for (let k = 0; k < runs; k++) {
      const res = run(P, T, makePolicy(), seed + 7919 * k);
      for (let t = 0; t < T; t++) acc[t] += res.regret[t];
      const ib = P.indexOf(best(P)); let c = 0; for (let t = T - 100; t < T; t++) if (res.picks[t] === ib) c++;
      bestShareLate += c / 100;
    }
    for (let t = 0; t < T; t++) acc[t] /= runs;
    return { curve: acc, final: acc[T - 1], bestShareLate: bestShareLate / runs };
  }
  const epsCurve = (eps, P = ARMS) => meanRegret(P, T_EPS, () => epsGreedy(eps), RUNS_EPS, 31);
  const EPS_GRID = Array.from({ length: 51 }, (_, i) => Math.round(i) / 100);

  // Steps 3–4: one seeded run each, with the state before every pull recorded.
  function trace(P, T, makePolicy, seed) {
    const res = run(P, T, makePolicy(), seed), K = P.length, states = [];
    const n = new Array(K).fill(0), s = new Array(K).fill(0);
    for (let t = 1; t <= T; t++) { states.push({ t, n: n.slice(), s: s.slice(), pick: res.picks[t - 1], win: res.wins[t - 1] }); n[res.picks[t - 1]]++; s[res.picks[t - 1]] += res.wins[t - 1]; }
    states.push({ t: T + 1, n: n.slice(), s: s.slice(), pick: -1, win: 0 });
    return { states, regret: res.regret, picks: res.picks };
  }
  const ucbTrace = c => trace(ARMS, T_ONE, () => ucb(c), 4242);
  const tsTrace = () => trace(ARMS, T_ONE, thompson, 5151);
  // UCB indices at the state before pull t (t ≥ 1). Arms never pulled have an infinite index.
  function ucbIndices(state, c) { return state.n.map((n, i) => (n ? state.s[i] / n + ucbBonus(state.t, n, c) : Infinity)); }

  // Beta density via log-gamma (Lanczos).
  function lgamma(z) {
    const g = 7, cf = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - lgamma(1 - z);
    z -= 1; let x = cf[0]; for (let i = 1; i < g + 2; i++) x += cf[i] / (z + i);
    const tt = z + g + 0.5; return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(tt) - tt + Math.log(x);
  }
  const betaPdf = (x, a, b) => (x <= 0 || x >= 1 ? 0 : Math.exp((a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x) + lgamma(a + b) - lgamma(a) - lgamma(b)));
  // P(arm i has the largest draw) under independent Beta posteriors, by numerical integration on a grid.
  function probBest(ab, G = 2000) {
    const K = ab.length, dens = ab.map(() => new Float64Array(G)), cdf = ab.map(() => new Float64Array(G));
    const h = 1 / G;
    ab.forEach(([a, b], i) => { let c = 0; for (let k = 0; k < G; k++) { const x = (k + 0.5) * h, d = betaPdf(x, a, b); dens[i][k] = d; c += d * h; cdf[i][k] = c - d * h / 2; } });
    return ab.map((_, i) => { let s = 0; for (let k = 0; k < G; k++) { let q = dens[i][k] * h; for (let j = 0; j < K; j++) if (j !== i) q *= Math.min(1, cdf[j][k]); s += q; } return s; });
  }

  // Step 5: four strategies on arms where the best is 0.5 + Δ and the other three are 0.5.
  const cmpArms = d => [0.5, 0.5, 0.5 + d, 0.5];
  const STRATS = { greedy: () => epsGreedy(0), eps: () => epsGreedy(0.1), ucb: () => ucb(1), ts: thompson };
  function compare(d, T = T_CMP, runs = RUNS_CMP) {
    const P = cmpArms(d), out = {};
    for (const [k, mk] of Object.entries(STRATS)) out[k] = meanRegret(P, T, mk, runs, 61);
    return out;
  }

  const api = { ARMS, NAMES, BUDGET, T_ETC, T_EPS, RUNS_EPS, T_ONE, T_CMP, RUNS_CMP, DELTAS, EPS_GRID, rng, best, gaps, game, binomPmf, etcCommit, etcRegret, etcSimulate, run, epsGreedy, ucb, ucbBonus, thompson, meanRegret, epsCurve, trace, ucbTrace, tsTrace, ucbIndices, lgamma, betaPdf, probBest, cmpArms, compare };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.BANDIT_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
