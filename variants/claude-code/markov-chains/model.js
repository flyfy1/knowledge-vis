'use strict';
// Markov-chain lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Convention: P[i][j] = P(tomorrow at j | today at i); rows sum to 1; a distribution is a row vector.
(function (root) {
  // Bike-share stations: 0 metro, 1 campus, 2 park (made-up teaching numbers).
  const P0 = [
    [0.5, 0.3, 0.2],
    [0.1, 0.7, 0.2],
    [0.4, 0.1, 0.5]
  ];
  const PRESETS = {
    normal: P0,
    cycle: [[0, 1, 0], [0, 0, 1], [1, 0, 0]],           // metro → campus → park → metro, every day
    split: [[0.5, 0.5, 0], [0.5, 0.5, 0], [0, 0, 1]]    // the park is cut off from the other two
  };

  const step = (d, P) => P[0].map((_, j) => d.reduce((s, di, i) => s + di * P[i][j], 0));
  function evolve(d, P, n) { const out = [d.slice()]; for (let t = 0; t < n; t++) out.push(step(out[t], P)); return out; }
  const tv = (a, b) => 0.5 * a.reduce((s, v, i) => s + Math.abs(v - b[i]), 0);
  const unit = i => [0, 1, 2].map(j => (j === i ? 1 : 0));

  // Solve A x = b (small dense systems, partial pivoting).
  function solve(A, b) {
    const n = b.length, M = A.map((r, i) => r.concat([b[i]]));
    for (let c = 0; c < n; c++) {
      let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
      [M[c], M[p]] = [M[p], M[c]];
      for (let r = 0; r < n; r++) if (r !== c) { const f = M[r][c] / M[c][c]; for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]; }
    }
    return M.map((r, i) => r[n] / r[i]);
  }
  // Stationary distribution: π(P − I) = 0 with Σπ = 1 (replace the last balance equation by the sum).
  function stationary(P) {
    const n = P.length, A = [], b = [];
    for (let j = 0; j < n - 1; j++) { A.push(P.map((row, i) => row[j] - (i === j ? 1 : 0))); b.push(0); }
    A.push(new Array(n).fill(1)); b.push(1);
    return solve(A, b);
  }
  // Balance at each station for a distribution d: outflow d_i(1 − P_ii), inflow Σ_{k≠i} d_k P_ki.
  function flows(d, P) { return d.map((di, i) => ({ out: di * (1 - P[i][i]), inn: d.reduce((s, dk, k) => s + (k === i ? 0 : dk * P[k][i]), 0) })); }

  // Eigenvalues of a 3×3 stochastic matrix other than 1: roots of λ² + (1 − tr)λ + det = 0.
  function det3(P) { return P[0][0] * (P[1][1] * P[2][2] - P[1][2] * P[2][1]) - P[0][1] * (P[1][0] * P[2][2] - P[1][2] * P[2][0]) + P[0][2] * (P[1][0] * P[2][1] - P[1][1] * P[2][0]); }
  function eigOthers(P) {
    const tr = P[0][0] + P[1][1] + P[2][2], b = 1 - tr, c = det3(P), disc = b * b - 4 * c;
    if (disc >= 0) { const r1 = (-b + Math.sqrt(disc)) / 2, r2 = (-b - Math.sqrt(disc)) / 2; return { re: [r1, r2], im: [0, 0], mod: Math.max(Math.abs(r1), Math.abs(r2)), complex: false }; }
    const re = -b / 2, im = Math.sqrt(-disc) / 2; return { re: [re, re], im: [im, -im], mod: Math.hypot(re, im), complex: true };
  }
  // Lazy ("sticky") version: each day a bike stays put with extra probability s.
  const sticky = (P, s) => P.map((row, i) => row.map((v, j) => (1 - s) * v + (i === j ? s : 0)));
  // First day on which the TV distance to π stays below eps from every start (checked up to tMax).
  function mixDays(P, eps, tMax = 2000) {
    const pi = stationary(P); let worst = 0;
    for (let i = 0; i < 3; i++) { const tr = evolve(unit(i), P, tMax); let last = tMax + 1; for (let t = tMax; t >= 0; t--) { if (tv(tr[t], pi) >= eps) { last = t + 1; break; } if (t === 0) last = 0; } worst = Math.max(worst, last); }
    return worst;
  }

  function rng(seed) {
    let a = seed >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function next(P, i, u) { let s = 0; for (let j = 0; j < P[i].length; j++) { s += P[i][j]; if (u < s) return j; } return P[i].length - 1; }
  // Walk n days from i; returns the list of stations including the start.
  function walk(P, i, n, rnd) { const out = [i]; for (let t = 0; t < n; t++) out.push(next(P, out[out.length - 1], rnd())); return out; }
  // Memorylessness check: for each yesterday y, where does a bike that is at `today` go next?
  function conditional(path, today) {
    const c = [0, 1, 2].map(() => [0, 0, 0]);
    for (let t = 1; t + 1 < path.length; t++) if (path[t] === today) c[path[t - 1]][path[t + 1]]++;
    return c;
  }

  // Step 5: waiting for a pattern of coin tosses. States 0..L = how much of the pattern has been matched.
  function automaton(pattern) {
    const L = pattern.length, tr = [];
    for (let s = 0; s < L; s++) {
      const row = {};
      for (const ch of ['H', 'T']) { const w = pattern.slice(0, s) + ch; let k = Math.min(L, w.length); while (k > 0 && w.slice(w.length - k) !== pattern.slice(0, k)) k--; row[ch] = k; }
      tr.push(row);
    }
    return tr;
  }
  // Expected tosses until the pattern appears: first-step analysis E_s = 1 + ½E_{δ(s,H)} + ½E_{δ(s,T)}, E_L = 0.
  function expectedWait(pattern) {
    const L = pattern.length, tr = automaton(pattern), A = [], b = [];
    for (let s = 0; s < L; s++) { const row = new Array(L).fill(0); row[s] += 1; for (const ch of ['H', 'T']) { const k = tr[s][ch]; if (k < L) row[k] -= 0.5; } A.push(row); b.push(1); }
    return solve(A, b)[0];
  }
  // P(T = t) for t = 1..tMax by pushing the distribution over unfinished states.
  function waitPmf(pattern, tMax) {
    const L = pattern.length, tr = automaton(pattern); let d = new Array(L).fill(0); d[0] = 1; const out = [0];
    for (let t = 1; t <= tMax; t++) { const nd = new Array(L).fill(0); let done = 0; d.forEach((v, s) => { for (const ch of ['H', 'T']) { const k = tr[s][ch]; if (k === L) done += v / 2; else nd[k] += v / 2; } }); out.push(done); d = nd; }
    return out;
  }
  function waitSample(pattern, rnd) { const tr = automaton(pattern), L = pattern.length; let s = 0, t = 0; while (s < L && t < 100000) { s = tr[s][rnd() < 0.5 ? 'H' : 'T']; t++; } return t; }

  const api = { P0, PRESETS, step, evolve, tv, unit, solve, stationary, flows, det3, eigOthers, sticky, mixDays, rng, next, walk, conditional, automaton, expectedWait, waitPmf, waitSample };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MC_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
