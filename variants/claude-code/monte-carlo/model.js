'use strict';
// Monte Carlo lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every point, curve and readout on the page is computed here; tests/core.cjs pins the claims.
// All randomness is pseudo-random and seeded, so every picture replays exactly.
(function (root) {
  /* ---------- generators ---------- */
  // Good generator: mulberry32 (32-bit state, passes common statistical tests).
  function mulberry(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0; let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  // Deliberately bad generator: linear congruential x ← (a·x + c) mod m with a tiny modulus.
  const BAD = { a: 5, c: 1, m: 256 };
  function badLcg(seed) {
    let x = seed % BAD.m;
    return function () { x = (BAD.a * x + BAD.c) % BAD.m; return (x + 0.5) / BAD.m; };
  }
  const gen = (kind, seed) => (kind === 'bad' ? badLcg(seed) : mulberry(seed));
  function normals(u, n) {
    const out = [];
    while (out.length < n) { const a = Math.max(1e-12, u()), b = u(), r = Math.sqrt(-2 * Math.log(a)); out.push(r * Math.cos(2 * Math.PI * b)); if (out.length < n) out.push(r * Math.sin(2 * Math.PI * b)); }
    return out;
  }

  /* ---------- step 0: scatter points, count those in the quarter circle ---------- */
  const P_IN = Math.PI / 4;
  function scatter(seed, n, kind = 'good') {
    const u = gen(kind, seed), pts = []; let inside = 0;
    const est = [];
    for (let i = 0; i < n; i++) {
      const x = u(), y = u(), hit = x * x + y * y <= 1; if (hit) inside++;
      pts.push([x, y, hit]); est.push(4 * inside / (i + 1));
    }
    return { pts, inside, est };
  }

  /* ---------- step 1: how far off is one estimate of N points? ---------- */
  const NS = [100, 400, 1600, 6400];
  const REPS = 500;
  const seTheory = N => 4 * Math.sqrt(P_IN * (1 - P_IN) / N);
  function replicate(N, reps = REPS, seed = 1000 + N) {
    const u = mulberry(seed), ests = [];
    for (let r = 0; r < reps; r++) { let k = 0; for (let i = 0; i < N; i++) { const x = u(), y = u(); if (x * x + y * y <= 1) k++; } ests.push(4 * k / N); }
    const mean = ests.reduce((s, v) => s + v, 0) / reps, sd = Math.sqrt(ests.reduce((s, v) => s + (v - mean) ** 2, 0) / (reps - 1));
    const within = ests.filter(v => Math.abs(v - Math.PI) <= 1.96 * seTheory(N)).length / reps;
    return { ests, mean, sd, within, se: seTheory(N) };
  }

  /* ---------- step 2: integrating a function two ways ---------- */
  const FUNCS = {
    gauss: { f: x => Math.exp(-x * x), max: 1 },
    circle: { f: x => Math.sqrt(Math.max(0, 1 - x * x)), max: 1 }
  };
  // Composite Simpson on [0, 1] (n even) for the exact values used as references.
  function simpson(g, n = 20000) { let s = g(0) + g(1); for (let i = 1; i < n; i++) s += g(i / n) * (i % 2 ? 4 : 2); return s / (3 * n); }
  function exact(name) {
    const F = FUNCS[name], I = simpson(F.f), I2 = simpson(x => F.f(x) ** 2);
    // per-sample standard deviations: hit-or-miss uses a 0/1 count (×max), sample-mean uses f(U)
    return { I, sdHit: F.max * Math.sqrt((I / F.max) * (1 - I / F.max)), sdMean: Math.sqrt(I2 - I * I) };
  }
  function integrate(name, seed, N) {
    const F = FUNCS[name], u = mulberry(seed), pts = [], hitEst = [], meanEst = [];
    let hits = 0, sum = 0;
    for (let i = 0; i < N; i++) {
      const x = u(), y = u() * F.max, fx = F.f(x), hit = y <= fx;
      if (hit) hits++; sum += fx;
      pts.push({ x, y, fx, hit }); hitEst.push(F.max * hits / (i + 1)); meanEst.push(sum / (i + 1));
    }
    return { pts, hitEst, meanEst };
  }
  function integrateReps(name, N, reps = 400, seed = 77) {
    const F = FUNCS[name], u = mulberry(seed), hs = [], ms = [];
    for (let r = 0; r < reps; r++) {
      let hits = 0, sum = 0;
      for (let i = 0; i < N; i++) { const x = u(), y = u() * F.max, fx = F.f(x); if (y <= fx) hits++; sum += fx; }
      hs.push(F.max * hits / N); ms.push(sum / N);
    }
    const sd = a => { const m = a.reduce((s, v) => s + v, 0) / a.length; return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length - 1)); };
    return { sdHit: sd(hs), sdMean: sd(ms) };
  }

  /* ---------- step 3: volume of a d-dimensional ball, grid vs random ---------- */
  const BUDGET = 4096;
  function gammaHalf(k) { // Γ(k/2) for integer k ≥ 1
    if (k === 1) return Math.sqrt(Math.PI); if (k === 2) return 1;
    return (k / 2 - 1) * gammaHalf(k - 2);
  }
  const ballFrac = d => Math.pow(Math.PI, d / 2) / (gammaHalf(d + 2) * Math.pow(2, d)); // vol(unit ball) / vol([−1,1]^d)
  function gridEstimate(d) {
    const m = Math.floor(Math.pow(BUDGET, 1 / d) + 1e-9), used = Math.pow(m, d);
    // count midpoints of an m^d grid on [−1, 1]^d inside the ball (iterate over index tuples)
    const c = Array.from({ length: m }, (_, i) => -1 + (2 * i + 1) / m);
    let inside = 0; const idx = new Array(d).fill(0);
    for (let n = 0; n < used; n++) {
      let r2 = 0; for (let k = 0; k < d; k++) r2 += c[idx[k]] ** 2;
      if (r2 <= 1) inside++;
      for (let k = 0; k < d; k++) { if (++idx[k] < m) break; idx[k] = 0; }
    }
    return { m, used, frac: inside / used };
  }
  function mcEstimate(d, seed = 4242) {
    const u = mulberry(seed + d); let inside = 0;
    for (let n = 0; n < BUDGET; n++) { let r2 = 0; for (let k = 0; k < d; k++) { const v = 2 * u() - 1; r2 += v * v; } if (r2 <= 1) inside++; }
    const p = ballFrac(d);
    return { frac: inside / BUDGET, se: Math.sqrt(p * (1 - p) / BUDGET), relSe: Math.sqrt((1 - p) / (BUDGET * p)) };
  }
  const DIMS = [2, 3, 4, 5, 6, 7, 8, 9, 10];
  function dimTable() {
    return DIMS.map(d => { const p = ballFrac(d), g = gridEstimate(d), q = mcEstimate(d); return { d, p, grid: g, mc: q, gridRel: Math.abs(g.frac - p) / p, mcRel: Math.abs(q.frac - p) / p }; });
  }

  /* ---------- step 4: stratified (jittered) sampling ---------- */
  const KS = [4, 8, 16, 32, 64];
  function jitter(k, u) {
    const pts = [];
    for (let i = 0; i < k; i++) for (let j = 0; j < k; j++) pts.push([(i + u()) / k, (j + u()) / k]);
    return pts;
  }
  const piOf = pts => 4 * pts.filter(([x, y]) => x * x + y * y <= 1).length / pts.length;
  function stratReps(k, reps = 300, seed = 900) {
    const u = mulberry(seed + k), plain = [], strat = [], N = k * k;
    for (let r = 0; r < reps; r++) {
      strat.push(piOf(jitter(k, u)));
      const pp = []; for (let i = 0; i < N; i++) pp.push([u(), u()]); plain.push(piOf(pp));
    }
    const sd = a => { const m = a.reduce((s, v) => s + v, 0) / a.length; return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length - 1)); };
    return { N, sdPlain: sd(plain), sdStrat: sd(strat), se: seTheory(N) };
  }
  // least-squares slope of log(sd) vs log(N)
  function slope(rows, key) {
    const xs = rows.map(r => Math.log(r.N)), ys = rows.map(r => Math.log(r[key])), n = xs.length;
    const mx = xs.reduce((s, v) => s + v, 0) / n, my = ys.reduce((s, v) => s + v, 0) / n;
    let a = 0, b = 0; xs.forEach((x, i) => { a += (x - mx) * (ys[i] - my); b += (x - mx) ** 2; });
    return a / b;
  }

  /* ---------- step 5: where the random numbers come from ---------- */
  function pairs(kind, seed, n) { const u = gen(kind, seed), out = []; for (let i = 0; i < n; i++) out.push([u(), u()]); return out; }
  function distinctPairs(kind, seed, n) { return new Set(pairs(kind, seed, n).map(p => p[0].toFixed(6) + ',' + p[1].toFixed(6))).size; }
  function firstNumbers(kind, seed, n = 4) { const u = gen(kind, seed); return Array.from({ length: n }, () => u()); }

  const api = { mulberry, BAD, badLcg, gen, normals, P_IN, scatter, NS, REPS, seTheory, replicate, FUNCS, simpson, exact, integrate, integrateReps, BUDGET, ballFrac, gridEstimate, mcEstimate, DIMS, dimTable, KS, jitter, piOf, stratReps, slope, pairs, distinctPairs, firstNumbers };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MC_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
