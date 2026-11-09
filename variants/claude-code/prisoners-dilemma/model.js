'use strict';
// Prisoner's dilemma lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Payoffs T = 5 > R = 3 > P = 1 > S = 0 (and 2R > T + S). All five strategies are "memory-one":
// the chance to cooperate depends only on the previous round's outcome (my move, their move).
// Every number, curve and readout on the page is computed here; tests/core.cjs pins the claims.
(function (root) {
  const PAY = { R: 3, S: 0, T: 5, P: 1 };
  // payoff to me for (my move, their move); 1 = cooperate, 0 = defect
  const pay = (me, them, p = PAY) => (me ? (them ? p.R : p.S) : (them ? p.T : p.P));

  // q = [after CC, after CD, after DC, after DD] probability of cooperating (outcome = my move, their move); first = opening move.
  const STRATS = {
    allc: { first: 1, q: [1, 1, 1, 1] },
    alld: { first: 0, q: [0, 0, 0, 0] },
    tft: { first: 1, q: [1, 0, 1, 0] },   // copy the opponent's last move
    grim: { first: 1, q: [1, 0, 0, 0] },  // cooperate until anyone defects, then defect for good
    wsls: { first: 1, q: [1, 0, 0, 1] }   // win-stay, lose-shift: repeat after R or T, switch after S or P
  };
  const ORDER = ['allc', 'alld', 'tft', 'grim', 'wsls'];
  const gtft = g => ({ first: 1, q: [1, g, 1, g] }); // generous tit for tat: forgive a defection with probability g
  const strat = k => (typeof k === 'string' ? STRATS[k] : k);
  const idx = (me, them) => (me ? (them ? 0 : 1) : (them ? 2 : 3));

  // Seeded PRNG (mulberry32) so sampled games are reproducible.
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  // Play n rounds. noise e: each intended move is flipped with probability e (needs a seed when e > 0).
  function play(a, b, n, { e = 0, seed = 1 } = {}) {
    const A = strat(a), B = strat(b), r = rng(seed), mA = [], mB = [], sA = [], sB = [], flips = [];
    const decide = (pr) => (pr >= 1 ? 1 : pr <= 0 ? 0 : (r() < pr ? 1 : 0));
    for (let i = 0; i < n; i++) {
      let x = i === 0 ? decide(A.first) : decide(A.q[idx(mA[i - 1], mB[i - 1])]);
      let y = i === 0 ? decide(B.first) : decide(B.q[idx(mB[i - 1], mA[i - 1])]);
      let f = 0;
      if (e > 0) { if (r() < e) { x = 1 - x; f |= 1; } if (r() < e) { y = 1 - y; f |= 2; } }
      mA.push(x); mB.push(y); flips.push(f);
      sA.push((sA[i - 1] || 0) + pay(x, y)); sB.push((sB[i - 1] || 0) + pay(y, x));
    }
    return { a: mA, b: mB, scoreA: sA, scoreB: sB, flips, totalA: sA[n - 1] || 0, totalB: sB[n - 1] || 0 };
  }

  // Round robin: every strategy in `names` meets every one (itself included) for n rounds. Average per round.
  function tournament(names, n) {
    const tot = {}, grid = {};
    names.forEach(a => { tot[a] = 0; grid[a] = {}; names.forEach(b => { const g = play(a, b, n); grid[a][b] = g.totalA / n; tot[a] += g.totalA / n; }); });
    const rank = names.slice().sort((x, y) => tot[y] - tot[x] || ORDER.indexOf(x) - ORDER.indexOf(y));
    return { tot, grid, rank };
  }

  // One-shot defection vs cooperation against Grim, with continuation probability δ.
  // Per expected round (multiplied by 1 − δ): cooperate forever = R; defect now = T(1 − δ) + δP.
  function shadow(delta, T = PAY.T, p = PAY) {
    return { coop: p.R, defect: T * (1 - delta) + delta * p.P, coopTotal: p.R / (1 - delta), defectTotal: T + delta * p.P / (1 - delta), star: (T - p.R) / (T - p.P), rounds: 1 / (1 - delta) };
  }

  // Population of AllD, TFT, AllC meeting in matches of n rounds; per-round payoff matrix (row = me).
  const POP = ['alld', 'tft', 'allc'];
  function popMatrix(n) { return POP.map(a => POP.map(b => play(a, b, n).totalA / n)); }
  // Replicator dynamics: share_i grows at rate (payoff_i − average payoff). RK4, time unit "generation".
  function replicator(x0, n, { T = 60, dt = 0.05 } = {}) {
    const A = popMatrix(n);
    const f = x => { const fit = A.map(row => row[0] * x[0] + row[1] * x[1] + row[2] * x[2]); const avg = fit[0] * x[0] + fit[1] * x[1] + fit[2] * x[2]; return x.map((v, i) => v * (fit[i] - avg)); };
    const xs = [x0.slice()], steps = Math.round(T / dt);
    let x = x0.slice();
    for (let i = 0; i < steps; i++) {
      const k1 = f(x), k2 = f(x.map((v, j) => v + dt / 2 * k1[j])), k3 = f(x.map((v, j) => v + dt / 2 * k2[j])), k4 = f(x.map((v, j) => v + dt * k3[j]));
      x = x.map((v, j) => Math.max(0, v + dt / 6 * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j])));
      const s = x[0] + x[1] + x[2]; x = x.map(v => v / s);
      xs.push(x);
    }
    return { xs, dt, A };
  }
  // On the AllD–TFT edge, TFT takes over iff its share exceeds 1/(2n − 3) (n ≥ 2).
  const tftThreshold = n => (n >= 2 ? 1 / (2 * n - 3) : Infinity);

  // Long-run average payoff per round for two memory-one strategies with execution noise e (exact, via the
  // stationary distribution of the 4-state Markov chain over outcomes CC, CD, DC, DD from A's side).
  function longRun(a, b, e) {
    const A = strat(a), B = strat(b);
    const pure = s => [s.first, ...s.q].every(v => v === 0 || v === 1);
    if (e === 0 && pure(A) && pure(B)) { const g = play(A, B, 400); return (g.scoreA[399] - g.scoreA[199]) / 200; } // deterministic: steady cycle
    const eff = p => p * (1 - e) + (1 - p) * e;
    // B sees the outcome mirrored: (my, their) for B = (b, a)
    const mirror = [0, 2, 1, 3];
    const Pm = [0, 1, 2, 3].map(s => { const pa = eff(A.q[s]), pb = eff(B.q[mirror[s]]); return [pa * pb, pa * (1 - pb), (1 - pa) * pb, (1 - pa) * (1 - pb)]; });
    let v = [0.25, 0.25, 0.25, 0.25];
    for (let it = 0; it < 20000; it++) {
      const w = [0, 1, 2, 3].map(j => v.reduce((acc, vi, i) => acc + vi * Pm[i][j], 0));
      const diff = Math.abs(w[0] - v[0]) + Math.abs(w[1] - v[1]) + Math.abs(w[2] - v[2]) + Math.abs(w[3] - v[3]);
      v = w; if (diff < 1e-15) break;
    }
    return v[0] * PAY.R + v[1] * PAY.S + v[2] * PAY.T + v[3] * PAY.P;
  }

  const api = { PAY, pay, STRATS, ORDER, gtft, rng, play, tournament, shadow, POP, popMatrix, replicator, tftThreshold, longRun };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PD_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
