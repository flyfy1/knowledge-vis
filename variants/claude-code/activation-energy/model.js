'use strict';
// Activation-energy lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, dot and readout on the page is computed here; tests/core.cjs pins the claims.
// Model (simple collision theory, one-step reaction, stated on the page):
//   • a collision succeeds when its energy along the line of centres E is at least Eₐ;
//   • among collisions at temperature T that energy is exponentially distributed, f(E) = e^(−E/RT)/RT,
//     so the success fraction is exactly p = e^(−Eₐ/RT);
//   • rate constant k = A·e^(−Eₐ/RT) with the same A for both directions and both paths (entropy ignored).
(function (root) {
  const R = 8.314e-3;            // gas constant, kJ/(mol·K)
  const T0 = 300;                // room temperature used in steps 0–2 and 4
  const Z = 5e9;                 // step 2: assumed collisions per molecule per second (gas, ~1 atm, room T; order of magnitude)
  const A = 1e13;                // steps 4–5: assumed pre-exponential factor, s⁻¹
  const YEAR = 365.25 * 86400, UNIVERSE = 13.8e9 * YEAR;

  const RT = T => R * T;
  const fraction = (Ea, T) => Math.exp(-Ea / RT(T));
  const density = (E, T) => (E < 0 ? 0 : Math.exp(-E / RT(T)) / RT(T));
  const rate = (Ea, T, pre = A) => pre * Math.exp(-Ea / RT(T));

  // Energy along the reaction coordinate ξ: half-cosine pieces through knots (monotone between knots,
  // flat slope at every knot), so the maximum is exactly the highest knot.
  function knotCurve(knots, xi) {
    if (xi <= knots[0][0]) return knots[0][1];
    for (let i = 1; i < knots.length; i++) {
      const [x0, y0] = knots[i - 1], [x1, y1] = knots[i];
      if (xi <= x1) { const s = (xi - x0) / (x1 - x0); return y0 + (y1 - y0) * (1 - Math.cos(Math.PI * s)) / 2; }
    }
    return knots[knots.length - 1][1];
  }
  const pathKnots = (Ea, dH) => [[0, 0], [0.5, Ea], [1, dH]];
  // Catalysed path: two smaller hills with an intermediate in between; its highest point is Ea − drop.
  function catKnots(Ea, dH, drop) {
    const P1 = Ea - drop, P2 = Math.max(dH + 6, P1 - 8), I = Math.min(P1, P2) - 18;
    return [[0, 0], [0.3, P1], [0.5, I], [0.7, P2], [1, dH]];
  }
  const profile = (xi, Ea, dH) => knotCurve(pathKnots(Ea, dH), xi);
  const catProfile = (xi, Ea, dH, drop) => knotCurve(catKnots(Ea, dH, drop), xi);

  // Step 0 atoms: A + B–C → A–B + C. Distances in bond lengths; bond order fades from 1 (d = 1) to 0 (d ≥ 2.2).
  function atoms(xi) {
    const s = Math.min(1, Math.max(0, xi));
    const w = (1 - Math.cos(Math.PI * s)) / 2;          // 0 → 1 smoothly
    const dAB = 3 - 2 * Math.min(1, w * 1.6), dBC = 1 + 2 * Math.max(0, w * 1.6 - 0.6);
    const order = d => Math.max(0, Math.min(1, (2.2 - d) / 1.2));
    return { dAB, dBC, bondAB: order(dAB), bondBC: order(dBC) };
  }

  // Seeded PRNG (mulberry32) and collision-energy sampler: E = −RT·ln u is exponential with mean RT.
  function rng(seed) {
    let a = seed >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const sampleEnergy = (u, T) => -RT(T) * Math.log(1 - u); // u ∈ [0, 1) → E ∈ [0, ∞)
  function sample(n, T, seed) { const r = rng(seed), out = []; for (let i = 0; i < n; i++) out.push(sampleEnergy(r(), T)); return out; }
  function histogram(Es, bin, nBins) {
    const h = new Array(nBins).fill(0); let over = 0;
    Es.forEach(E => { const i = Math.floor(E / bin); if (i < nBins) h[i]++; else over++; });
    return { h, over };
  }
  const successes = (Es, Ea) => Es.reduce((s, E) => s + (E >= Ea ? 1 : 0), 0);

  // Step 2: how long one molecule waits, on average, for a hard-enough collision.
  const wait = (Ea, T = T0) => 1 / (Z * fraction(Ea, T));
  const decadeStep = T => RT(T) * Math.LN10;          // extra Eₐ that makes the wait 10× longer
  // Human time scale: picks the largest unit that keeps the value ≥ 1.
  const UNITS = [['ns', 1e-9], ['us', 1e-6], ['ms', 1e-3], ['s', 1], ['min', 60], ['h', 3600], ['d', 86400], ['yr', YEAR], ['kyr', 1e3 * YEAR], ['Myr', 1e6 * YEAR], ['Gyr', 1e9 * YEAR]];
  function humanTime(sec) {
    let u = UNITS[0];
    for (const q of UNITS) if (sec >= q[1]) u = q;
    return { unit: u[0], value: sec / u[1], universes: sec / UNIVERSE };
  }

  // Step 3: heating from T to T + dT multiplies the success fraction (and k) by this factor.
  const heatRatio = (Ea, T, dT) => fraction(Ea, T + dT) / fraction(Ea, T);
  const meanRatio = (T, dT) => (T + dT) / T;   // mean collision energy RT grows only linearly
  // Eₐ for which +dT doubles the rate at T: ln 2 = (Eₐ/R)(1/T − 1/(T + dT)).
  const doublingEa = (T = T0, dT = 10) => Math.LN2 * R / (1 / T - 1 / (T + dT));

  // Steps 4–5: one-step reaction R ⇌ P, first order both ways; product fraction x(t) from x(0) = 0.
  function relax(Ea, dH, T, drop = 0) {
    const kf = rate(Ea - drop, T), kr = rate(Ea - drop - dH, T), s = kf + kr;
    return { kf, kr, K: kf / kr, xeq: kf / s, half: Math.LN2 / s, x: t => (kf / s) * (1 - Math.exp(-s * t)) };
  }
  const speedUp = (drop, T = T0) => Math.exp(drop / RT(T));

  // Step 5: forward/reverse constants and how heating from T0 to T changes each.
  function twoWay(Ea, dH, T) {
    const kf = rate(Ea, T), kr = rate(Ea - dH, T);
    return { kf, kr, K: kf / kr, gainF: kf / rate(Ea, T0), gainR: kr / rate(Ea - dH, T0), EaRev: Ea - dH };
  }

  // Scientific notation with Unicode superscripts: 2.0×10⁻⁹.
  const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
  function sci(v, d = 1) {
    if (v === 0) return '0';
    let e = Math.floor(Math.log10(Math.abs(v))), m = v / Math.pow(10, e);
    if (Math.abs(Number(m.toFixed(d))) >= 10) { m /= 10; e += 1; }
    if (e >= -2 && e <= 3) return trim(v.toFixed(Math.max(0, d + 1 - e)));
    return m.toFixed(d) + '×10' + String(e).split('').map(c => SUP[c]).join('');
  }
  // Trim trailing zeros only after a decimal point (90 stays 90).
  function trim(s) { return s.indexOf('.') < 0 ? s : s.replace(/0+$/, '').replace(/\.$/, ''); }
  const fix = (v, d) => { const s = v.toFixed(d); return Number(s) === 0 ? (0).toFixed(d) : s; };

  const api = { R, T0, Z, A, YEAR, UNIVERSE, RT, fraction, density, rate, knotCurve, pathKnots, catKnots, profile, catProfile, atoms, rng, sampleEnergy, sample, histogram, successes, wait, decadeStep, humanTime, heatRatio, meanRatio, doublingEa, relax, speedUp, twoWay, sci, trim, fix };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.AE_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
