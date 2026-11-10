'use strict';
// Public health (Claude Code edition) — model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, count and readout on the page is computed here; tests/core.cjs pins the claims.
// A teaching model: a well-mixed population, fixed parameters, deterministic SIR (fractions of the
// population), integrated with RK4 at 0.1-day steps. Not a forecast, not medical or policy advice.
(function (root) {
  /* ---------- step 0: generations of a branching outbreak ---------- */
  // Expected new cases in generation k, starting from one case: R0^k. Cumulative includes generation 0.
  const generation = (R0, k) => Math.pow(R0, k);
  function cumulative(R0, g) { let s = 0; for (let k = 0; k <= g; k++) s += generation(R0, k); return s; }
  // A deterministic tree for the picture: generation k holds round(R0^k) cases, shared among the previous
  // generation as evenly as possible (child counts differ by at most one).
  function tree(R0, gens) {
    const levels = [[{ parent: -1 }]];
    for (let k = 1; k <= gens; k++) {
      const prev = levels[k - 1], next = [], total = Math.round(generation(R0, k)), n = prev.length;
      if (n === 0) { levels.push(next); continue; }
      prev.forEach((_, j) => { const c = Math.floor((j + 1) * total / n) - Math.floor(j * total / n); for (let q = 0; q < c; q++) next.push({ parent: j }); });
      levels.push(next);
    }
    return levels;
  }

  /* ---------- steps 1–4: SIR ---------- */
  const DEFAULTS = { R0: 2.5, D: 7, I0: 1e-4, days: 720 };
  const DT = 0.1;
  // contact(t) multiplies transmission (1 = normal contact). v = vaccinated fraction × efficacy, immune at t = 0.
  function sir({ R0 = DEFAULTS.R0, D = DEFAULTS.D, I0 = DEFAULTS.I0, days = DEFAULTS.days, contact = () => 1, immune = 0 } = {}) {
    const beta = R0 / D, gamma = 1 / D;
    let S = Math.max(0, 1 - I0 - immune), I = I0, R = 0;
    const f = (s, i, t) => { const inf = beta * contact(t) * s * i; return [-inf, inf - gamma * i]; };
    const out = { t: [0], S: [S], I: [I], R: [R], immune, D, R0 };
    const N = Math.round(days / DT), every = Math.round(1 / DT);
    for (let n = 1; n <= N; n++) {
      const t = (n - 1) * DT;
      const k1 = f(S, I, t), k2 = f(S + DT / 2 * k1[0], I + DT / 2 * k1[1], t + DT / 2);
      const k3 = f(S + DT / 2 * k2[0], I + DT / 2 * k2[1], t + DT / 2), k4 = f(S + DT * k3[0], I + DT * k3[1], t + DT);
      const dS = DT / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]), dI = DT / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
      S += dS; I += dI; R = 1 - immune - S - I;
      if (n % every === 0) { out.t.push(n * DT); out.S.push(S); out.I.push(I); out.R.push(R); }
    }
    return out;
  }
  // Summary of a run (daily samples): peak, its day, final size = everyone ever infected (incl. still infected).
  function summary(run, capacity = CAPACITY) {
    let pk = 0; run.I.forEach((v, i) => { if (v > run.I[pk]) pk = i; });
    const last = run.t.length - 1;
    const ever = 1 - run.immune - run.S[last];
    let above = 0; run.I.forEach(v => { if (v > capacity) above++; });
    return { peak: run.I[pk], peakDay: run.t[pk], final: ever, above, stillInfected: run.I[last] };
  }
  // Final-size relation for a fully susceptible start: z = 1 − exp(−R0 z) (largest root, bisection).
  function finalSize(R0, s0 = 1) {
    if (R0 * s0 <= 1) return 0;
    let lo = 1e-9, hi = s0;
    const g = z => z - s0 * (1 - Math.exp(-R0 * z));
    for (let i = 0; i < 200; i++) { const mid = (lo + hi) / 2; if (g(mid) < 0) lo = mid; else hi = mid; }
    return (lo + hi) / 2;
  }
  const herdThreshold = R0 => Math.max(0, 1 - 1 / R0);
  const peakFormula = R0 => (R0 <= 1 ? 0 : 1 - (1 + Math.log(R0)) / R0); // SIR peak with S0 ≈ 1
  const CAPACITY = 0.05; // schematic care-capacity line: 5 % of people infected at the same time

  /* step 2: effective reproduction number at day t */
  const effectiveR = (run, i, contact = 1) => run.R0 * contact * run.S[i];

  /* step 3: a temporary contact reduction */
  const window = (c, start, len) => t => (t >= start && t < start + len ? 1 - c : 1);

  /* step 4: vaccination before the outbreak */
  const vaccineThreshold = (R0, eff) => herdThreshold(R0) / eff; // may exceed 1 (then unreachable)

  /* ---------- step 5: testing ---------- */
  function testCounts(prev, sens, spec, N = 10000) {
    const sick = N * prev, well = N - sick;
    const TP = sick * sens, FN = sick - TP, TN = well * spec, FP = well - TN;
    return { N, sick, well, TP, FN, TN, FP, PPV: TP / (TP + FP), NPV: TN / (TN + FN), positives: TP + FP };
  }
  // Integer counts for the 10,000-square grid: largest-remainder rounding so the four groups sum to N.
  function testGrid(prev, sens, spec, N = 10000) {
    const c = testCounts(prev, sens, spec, N), keys = ['TP', 'FN', 'FP', 'TN'];
    const base = keys.map(k => Math.floor(c[k] + 1e-9)), rem = keys.map((k, i) => c[k] - base[i]);
    let left = N - base.reduce((a, b) => a + b, 0);
    const order = keys.map((_, i) => i).sort((a, b) => rem[b] - rem[a]);
    for (let i = 0; left > 0; i++, left--) base[order[i % 4]]++;
    const out = {}; keys.forEach((k, i) => { out[k] = base[i]; }); return out;
  }

  const api = { generation, cumulative, tree, DEFAULTS, DT, sir, summary, finalSize, herdThreshold, peakFormula, CAPACITY, effectiveR, window, vaccineThreshold, testCounts, testGrid };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PH_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
