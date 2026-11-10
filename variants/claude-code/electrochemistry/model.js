'use strict';
// Electrochemistry lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every number on the page is computed here; tests/core.cjs pins the claims.
// Conventions: 25 °C (298.15 K), activities taken equal to molar concentrations, 1 L of solution on
// each side, ideal electrodes (no overpotential), a fixed teaching internal resistance.
(function (root) {
  const F = 96485.33212;          // C per mole of electrons
  const R = 8.314462618;          // J/(mol·K)
  const T = 298.15;               // K
  const E_CHARGE = 1.602176634e-19; // C per electron
  const SLOPE = R * T * Math.LN10 / F; // 0.05916 V per decade (for n = 1)
  const VM = R * T / 101325 * 1000; // molar gas volume at 25 °C, 1 atm, in L/mol (≈ 24.47)

  // Standard reduction potentials at 25 °C (V), rounded to textbook two decimals.
  const METALS = {
    Mg: { n: 2, E: -2.37, M: 24.305 },
    Zn: { n: 2, E: -0.76, M: 65.38 },
    Fe: { n: 2, E: -0.44, M: 55.845 },
    Cu: { n: 2, E: 0.34, M: 63.546 },
    Ag: { n: 1, E: 0.80, M: 107.868 }
  };
  const ORDER = ['Mg', 'Zn', 'Fe', 'Cu', 'Ag'];
  const ION = { Mg: 'Mg²⁺', Zn: 'Zn²⁺', Fe: 'Fe²⁺', Cu: 'Cu²⁺', Ag: 'Ag⁺' };

  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const lcm = (a, b) => a / gcd(a, b) * b;
  const coef = c => (c === 1 ? '' : String(c));

  // A galvanic cell built from two metal | metal-ion half-cells at 1 M.
  // The metal with the lower E° is oxidised (anode, negative terminal); electrons run to the other.
  function cell(a, b) {
    if (a === b) return { same: true, anode: a, cathode: b, E0: 0, n: METALS[a].n, dG: 0, logK: 0 };
    const [an, ca] = METALS[a].E < METALS[b].E ? [a, b] : [b, a];
    const nA = METALS[an].n, nC = METALS[ca].n, n = lcm(nA, nC);
    const pA = n / nA, pC = n / nC;
    const E0 = METALS[ca].E - METALS[an].E;
    return {
      same: false, anode: an, cathode: ca, n, pA, pC, E0,
      dG: -n * F * E0 / 1000,           // kJ per mole of reaction as written
      logK: n * E0 / SLOPE,
      oxHalf: `${an} → ${ION[an]} + ${coef(nA)}e⁻`,
      redHalf: `${ION[ca]} + ${coef(nC)}e⁻ → ${ca}`,
      overall: `${coef(pA)}${an} + ${coef(pC)}${ION[ca]} → ${coef(pA)}${ION[an]} + ${coef(pC)}${ca}`
    };
  }

  // The Daniell cell, Zn | Zn²⁺ ‖ Cu²⁺ | Cu, used in steps 0, 2, 3 and 4.
  const DANIELL = cell('Zn', 'Cu');
  const E0D = DANIELL.E0; // 1.10 V

  // Step 0: three set-ups of the same reaction. Bulb 9 Ω + teaching internal resistance 1 Ω.
  const BULB = 9, R_INT = 1;
  function setup(mode) {
    const I = mode === 'bridge' ? E0D / (BULB + R_INT) : 0;
    return { mode, I, perSecond: I / E_CHARGE, Ubulb: I * BULB };
  }

  // Step 2: Nernst equation for the Daniell cell. Q = [Zn²⁺]/[Cu²⁺].
  function nernst(zn, cu) {
    const logQ = Math.log10(zn / cu);
    return { logQ, Q: Math.pow(10, logQ), E: E0D - SLOPE / 2 * logQ };
  }
  const SLOPE_D = SLOPE / 2; // V per decade of Q for n = 2

  // Step 3: discharge through a load. ξ (mol) of Cu²⁺ has turned into Cu; V = 1 L on each side.
  // E(ξ) from Nernst; current I = E/(R + r); time from ∫ dQ / I. Returns a dense grid that keeps the final cliff.
  function discharge(c0, z0, Rload, r = R_INT) {
    const fr = [];
    for (let i = 0; i <= 400; i++) fr.push(0.99 * i / 400);
    for (let k = 0; k <= 60; k++) fr.push(1 - 0.01 * Math.pow(10, -4 * k / 60)); // 0.99 … 1 − 1e-6
    const pts = []; let t = 0;
    fr.forEach((f, i) => {
      const xi = c0 * f, E = E0D - SLOPE_D * Math.log10((z0 + xi) / (c0 - xi));
      const I = E / (Rload + r), Q = 2 * F * xi;
      if (i > 0) { const p = pts[i - 1]; t += (Q - p.Q) * 0.5 * (1 / I + 1 / p.I); }
      pts.push({ f, xi, Q, E, U: I * Rload, I, t, mZn: xi * METALS.Zn.M, mCu: xi * METALS.Cu.M });
    });
    return { c0, z0, Rload, r, Qmax: 2 * F * c0, pts };
  }
  // Charge (fraction of capacity) at which E first drops below a threshold.
  function cliffAt(run, Elim) { const p = run.pts.find(q => q.E < Elim); return p ? p.f : 1; }

  // Step 4: an external source of voltage V pushes against the Daniell cell (both 1 M).
  const R_LOOP = 2; // Ω, wires + internal resistance (teaching value)
  function pushBack(V) {
    const I = (E0D - V) / R_LOOP; // > 0: cell drives electrons Zn → Cu; < 0: source drives them Cu → Zn
    const eps = 1e-9;
    return { V, I, mode: I > eps ? 'galvanic' : I < -eps ? 'electrolytic' : 'balance', Pcell: E0D * I, Psrc: V * I, heat: I * I * R_LOOP };
  }

  // Step 5: Faraday's law. Products per mole of electrons.
  const PRODUCTS = {
    Cu: [{ id: 'Cu', z: 2, M: METALS.Cu.M, gas: false }],
    Ag: [{ id: 'Ag', z: 1, M: METALS.Ag.M, gas: false }],
    H2O: [{ id: 'H₂', z: 2, M: 2.016, gas: true }, { id: 'O₂', z: 4, M: 31.998, gas: true }]
  };
  function faraday(kind, I, minutes) {
    const Q = I * minutes * 60, ne = Q / F;
    return { Q, ne, items: PRODUCTS[kind].map(p => { const mol = ne / p.z; return { ...p, mol, mass: mol * p.M, mL: p.gas ? mol * VM * 1000 : null }; }) };
  }

  const api = { F, R, T, E_CHARGE, SLOPE, SLOPE_D, VM, METALS, ORDER, ION, cell, DANIELL, E0D, BULB, R_INT, setup, nernst, discharge, cliffAt, R_LOOP, pushBack, PRODUCTS, faraday, lcm };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.EC_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
