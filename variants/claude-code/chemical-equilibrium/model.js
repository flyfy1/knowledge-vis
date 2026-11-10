'use strict';
// Chemical equilibrium lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// A seeded stochastic particle simulation of the reversible reaction A ⇌ B, plus the exact expectation
// of that simulation. Every count, rate, share and time on the page comes from here; tests/core.cjs pins them.
// Rules: one tick = one time step; in each tick every A turns into B with probability pf and every B
// turns into A with probability pr, independently. Particle positions are a random walk for display only:
// in this model the chance to react does not depend on where a particle is (no collisions are simulated).
(function (root) {
  const R = 8.314;            // J/(mol·K)
  const T0 = 300;             // K, reference temperature
  const P0 = { f: 0.02, r: 0.03 };          // per-tick probabilities at T0 without catalyst
  const EA = { f: 30000, r: 20000 };        // J/mol: forward barrier higher → forward is endothermic, ΔH = +10 kJ/mol
  const CAT_DROP = 3500;                    // J/mol: a catalyst lowers both barriers by the same amount
  const T_RANGE = [260, 340];

  // Arrhenius scaling from the reference point: p(T) = p0 · exp(−Ea/R · (1/T − 1/T0)) · exp(ΔEa_cat / (R T)).
  function probs(T = T0, cat = false) {
    const s = Ea => Math.exp(-Ea / R * (1 / T - 1 / T0));
    const c = cat ? Math.exp(CAT_DROP / (R * T)) : 1;
    return { f: P0.f * s(EA.f) * c, r: P0.r * s(EA.r) * c };
  }
  const K = (T = T0) => { const p = probs(T); return p.f / p.r; };          // K = [B]/[A] at balance
  const xEq = (T = T0, cat = false) => { const p = probs(T, cat); return p.f / (p.f + p.r); }; // share of B at balance
  const dH = EA.f - EA.r; // J/mol

  // Exact expected number of B after t ticks (independent particles): the gap to balance shrinks by (1 − pf − pr) per tick.
  function expectedB(N, b0, p, t) { const eq = N * p.f / (p.f + p.r); return eq + (b0 - eq) * Math.pow(1 - p.f - p.r, t); }
  // Ticks until the expected gap to balance is at most `frac` of the starting gap.
  function settleTicks(p, frac = 0.05) { return Math.ceil(Math.log(frac) / Math.log(1 - p.f - p.r)); }

  function mulberry32(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  class Sim {
    constructor(N, nB, seed = 1) {
      this.rng = mulberry32(seed); this.parts = []; this.t = 0;
      this.hist = { b: [], f: [], r: [] }; // per tick: B count after the tick, forward and reverse events in it
      this.total = { f: 0, r: 0 };
      this.add(N - nB, 0); this.add(nB, 1);
      // random order so B particles are not all at the end
      for (let i = this.parts.length - 1; i > 0; i--) { const j = Math.floor(this.rng() * (i + 1)); [this.parts[i], this.parts[j]] = [this.parts[j], this.parts[i]]; }
      this.hist.b.push(this.nB()); this.hist.f.push(0); this.hist.r.push(0);
      this.marks = []; // ticks where material was added
    }
    add(n, s) { for (let i = 0; i < n; i++) { const a = this.rng() * Math.PI * 2; this.parts.push({ x: this.rng(), y: this.rng(), vx: Math.cos(a) * 0.006, vy: Math.sin(a) * 0.006, s, flash: 0, flips: 0 }); } }
    inject(n, s) { this.add(n, s); this.marks.push(this.t); this.hist.b[this.hist.b.length - 1] = this.nB(); }
    nB() { let n = 0; for (const p of this.parts) n += p.s; return n; }
    get N() { return this.parts.length; }
    step(prob) {
      let f = 0, r = 0;
      for (const p of this.parts) {
        const u = this.rng();
        if (p.s === 0 && u < prob.f) { p.s = 1; f++; p.flash = 6; p.flips++; } else if (p.s === 1 && u < prob.r) { p.s = 0; r++; p.flash = 6; p.flips++; } else if (p.flash) p.flash--;
        // display-only random walk with reflecting walls
        const a = (this.rng() - 0.5) * 0.9, c = Math.cos(a), s = Math.sin(a);
        [p.vx, p.vy] = [p.vx * c - p.vy * s, p.vx * s + p.vy * c];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) { p.x = -p.x; p.vx = -p.vx; } if (p.x > 1) { p.x = 2 - p.x; p.vx = -p.vx; }
        if (p.y < 0) { p.y = -p.y; p.vy = -p.vy; } if (p.y > 1) { p.y = 2 - p.y; p.vy = -p.vy; }
      }
      this.t++; this.total.f += f; this.total.r += r;
      this.hist.b.push(this.nB()); this.hist.f.push(f); this.hist.r.push(r);
      return { f, r };
    }
    run(prob, n) { for (let i = 0; i < n; i++) this.step(prob); return this; }
    // Mean events per tick over the last w ticks (measured rates).
    rate(w = 30) { const n = Math.min(w, this.t); if (!n) return { f: 0, r: 0 }; let f = 0, r = 0; for (let i = this.hist.f.length - n; i < this.hist.f.length; i++) { f += this.hist.f[i]; r += this.hist.r[i]; } return { f: f / n, r: r / n }; }
    // Mean B count over ticks [from, to] (inclusive, history index = tick).
    meanB(from, to = this.t) { let s = 0, n = 0; for (let i = Math.max(0, from); i <= Math.min(to, this.t); i++) { s += this.hist.b[i]; n++; } return n ? s / n : NaN; }
  }

  // Step 4 comparison: same seed, same start (all A), with and without catalyst.
  function catalystRun(ticks = 600, seed = 41, N = 200) {
    const out = {};
    for (const cat of [false, true]) {
      const p = probs(T0, cat), sim = new Sim(N, 0, seed).run(p, ticks);
      out[cat ? 'cat' : 'plain'] = { p, sim, settle: settleTicks(p), share: sim.meanB(200, ticks) / N };
    }
    return out;
  }
  // Step 3 measurement: from a state at balance for T0, change to T, wait 5 relaxation times, average the B share for `w` ticks.
  function measureShare(T, seed = 7, N = 200, w = 1200) {
    const p = probs(T), wait = 5 * Math.ceil(1 / (p.f + p.r));
    const sim = new Sim(N, Math.round(N * xEq(T0)), seed).run(p, wait + w);
    return { share: sim.meanB(wait + 1, wait + w) / N, wait, sim };
  }

  const api = { R, T0, P0, EA, CAT_DROP, T_RANGE, dH, probs, K, xEq, expectedB, settleTicks, mulberry32, Sim, catalystRun, measureShare };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.EQ_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
