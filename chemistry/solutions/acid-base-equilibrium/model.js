'use strict';
// Acid–base equilibrium model (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every number on the page comes from here; tests/core.cjs pins the claims.
// Conventions: 25 °C, ideal (activity = concentration), mol/L throughout, volume change on mixing ignored.
// The page's quantitative readouts use the weak-acid quadratic (water autoionisation ignored);
// fullH() solves the complete charge balance including Kw so the tests can show where that is safe.
(function (root) {
  const KW = 1e-14;

  // Reference acids (Ka at 25 °C, rounded textbook values).
  const ACIDS = {
    hclo2: { ka: 1.1e-2, formula: 'HClO₂' },
    hf: { ka: 6.8e-4, formula: 'HF' },
    acetic: { ka: 1.8e-5, formula: 'CH₃COOH' },
    hclo: { ka: 2.9e-8, formula: 'HClO' },
    hcn: { ka: 6.2e-10, formula: 'HCN' }
  };

  // HA ⇌ H⁺ + A⁻ with total acid c and extra A⁻ s (from a salt such as NaA).
  // Ka = x(x + s)/(c − x)  →  x² + (Ka + s)x − Ka·c = 0, positive root, written to avoid cancellation.
  function split(ka, c, s = 0) {
    const b = ka + s, disc = b * b + 4 * ka * c;
    return (2 * ka * c) / (b + Math.sqrt(disc));
  }
  function equilibrium(ka, c, s = 0) {
    const x = split(ka, c, s);
    return { x, HA: c - x, H: x, A: x + s, alpha: x / c, pH: -Math.log10(x), Q: (x * (x + s)) / (c - x) };
  }
  // Ostwald dilution law shortcut, valid while α ≪ 1.
  const alphaApprox = (ka, c) => Math.sqrt(ka / c);
  // Same acid, fully dissociated (strong-acid reference).
  const pHStrong = c => -Math.log10(c);

  // Full charge balance with water: [H⁺] = [A⁻] + [OH⁻] − s, [A⁻] = (c + s)·Ka/(Ka + [H⁺]) … solved by bisection
  // on log[H⁺]. Used only by the tests to bound the error of ignoring water.
  function fullH(ka, c, s = 0) {
    const f = h => h + s - (c + s) * ka / (ka + h) - KW / h; // [H⁺] + [Na⁺] = [A⁻] + [OH⁻]; all A totals c + s
    let lo = -14, hi = 1;
    for (let i = 0; i < 200; i++) { const mid = (lo + hi) / 2; if (f(Math.pow(10, mid)) > 0) hi = mid; else lo = mid; }
    return Math.pow(10, (lo + hi) / 2);
  }

  // Q the instant the added A⁻ changes from sOld to sNew, before anything reacts: the old equilibrium
  // concentrations with the new A⁻ total. Q/Ka > 1 exactly when sNew > sOld.
  function qAfterChange(ka, c, sOld, sNew) {
    const e = equilibrium(ka, c, sOld);
    return (e.H * (e.x + sNew)) / e.HA;
  }

  /* ---------- stochastic molecule ledger (steps 0, 3, 4) ----------
     N acid molecules stand for total concentration c, so each molecule is c/N mol/L.
     Forward: every intact HA splits with probability kf·dt per tick.
     Reverse: every H⁺ meets an A⁻ and rejoins with probability kr·[A⁻]·dt, [A⁻] = (split + extra)·c/N.
     Mass action then gives Ka = kf/kr at the stationary point: kf(1 − α) = kr·c·α(α + s/c). */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function makeSim({ N = 200, c = 0.1, ka = 0.01, kf = 0.15, extra = 0, start = 'intact', seed = 1 } = {}) {
    const sim = { N, c, ka, kf, kr: kf / ka, extra, rand: mulberry32(seed), t: 0, split: new Uint8Array(N), events: [] };
    if (start === 'split') sim.split.fill(1);
    return sim;
  }
  const nSplit = sim => sim.split.reduce((a, b) => a + b, 0);
  // One tick of length dt (s). Returns {fwd, rev, idx: [[i, dir]…]}. The ledger is updated in a random order so
  // neither direction is applied first systematically.
  function stepSim(sim, dt) {
    const { N, c } = sim, n0 = nSplit(sim);
    const pf = Math.min(1, sim.kf * dt);
    const pr = Math.min(1, sim.kr * ((n0 + sim.extra) * c / N) * dt);
    let fwd = 0, rev = 0; const idx = [];
    for (let i = 0; i < N; i++) {
      const u = sim.rand();
      if (!sim.split[i]) { if (u < pf) { sim.split[i] = 1; fwd++; idx.push([i, 1]); } }
      else if (u < pr) { sim.split[i] = 0; rev++; idx.push([i, -1]); }
    }
    sim.t += dt;
    return { fwd, rev, idx };
  }
  // Long-run average share split for a seeded run (tests compare it with the analytic α).
  function simAverage(opts, dt, burn, ticks) {
    const sim = makeSim(opts);
    for (let i = 0; i < burn; i++) stepSim(sim, dt);
    let sum = 0, fwd = 0, rev = 0;
    for (let i = 0; i < ticks; i++) { const e = stepSim(sim, dt); sum += nSplit(sim); fwd += e.fwd; rev += e.rev; }
    return { alpha: sum / ticks / sim.N, fwdRate: fwd / (ticks * dt), revRate: rev / (ticks * dt) };
  }
  // Mean time for a deterministic mass-action run to come within 10 % of the remaining gap, from all-intact.
  // dα/dt = kf(1 − α) − kr·c·α(α + s/c). Used for the "speed does not move the end point" claim in step 4.
  function relaxTime(ka, c, kf, s = 0, tol = 0.1, dt = 1e-3) {
    const kr = kf / ka, target = equilibrium(ka, c, s).alpha; let a = 0, t = 0;
    while (Math.abs(a - target) > tol * target && t < 1e4) { a += (kf * (1 - a) - kr * c * a * (a + s / c)) * dt; t += dt; }
    return { t, alpha: a, target };
  }
  function odeAlpha(ka, c, kf, s, T, dt = 1e-3) {
    const kr = kf / ka; let a = 0;
    for (let t = 0; t < T; t += dt) a += (kf * (1 - a) - kr * c * a * (a + s / c)) * dt;
    return a;
  }

  const api = { KW, ACIDS, split, equilibrium, alphaApprox, pHStrong, fullH, qAfterChange, mulberry32, makeSim, nSplit, stepSim, simAverage, relaxTime, odeAlpha };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.ACID_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
