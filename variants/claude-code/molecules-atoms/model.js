'use strict';
// Molecules & atoms lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Molecules are lists of atoms; every count, ratio, mass and verdict on the page is computed here
// from those lists (tests/core.cjs pins the claims). Pictures use the 2D layouts in LAYOUT (not to scale).
(function (root) {
  // Relative atomic masses (rounded, as in junior-school tables).
  const MASS = { H: 1, C: 12, N: 14, O: 16, I: 127 };
  // Atoms in one molecule. 'C' (charcoal) is a substance built straight from atoms; one "unit" = one atom.
  const FORMULA = {
    H2O: { H: 2, O: 1 }, H2O2: { H: 2, O: 2 }, H2: { H: 2 }, O2: { O: 2 }, O3: { O: 3 }, CO2: { C: 1, O: 2 },
    CH4: { C: 1, H: 4 }, NH3: { N: 1, H: 3 }, C2H5OH: { C: 2, H: 6, O: 1 }, I2: { I: 2 }, C: { C: 1 }
  };
  // 2D picture of each molecule (unit ≈ one O-atom diameter). Not bond lengths or angles to scale.
  const LAYOUT = {
    H2O: [['O', 0, 0], ['H', -0.62, 0.48], ['H', 0.62, 0.48]],
    H2O2: [['O', -0.42, 0], ['O', 0.42, 0], ['H', -0.85, 0.5], ['H', 0.85, -0.5]],
    H2: [['H', -0.3, 0], ['H', 0.3, 0]],
    O2: [['O', -0.42, 0], ['O', 0.42, 0]],
    O3: [['O', 0, -0.3], ['O', -0.72, 0.25], ['O', 0.72, 0.25]],
    CO2: [['C', 0, 0], ['O', -0.82, 0], ['O', 0.82, 0]],
    CH4: [['C', 0, 0], ['H', -0.55, -0.55], ['H', 0.55, -0.55], ['H', -0.55, 0.55], ['H', 0.55, 0.55]],
    NH3: [['N', 0, 0], ['H', 0, -0.7], ['H', -0.62, 0.42], ['H', 0.62, 0.42]],
    C2H5OH: [['C', -0.8, 0], ['C', 0, 0], ['O', 0.8, 0], ['H', 1.25, 0.45], ['H', -1.25, 0.4], ['H', -1.15, -0.5], ['H', -0.75, 0.62], ['H', 0, -0.62], ['H', 0, 0.62]],
    I2: [['I', -0.5, 0], ['I', 0.5, 0]],
    C: [['C', 0, 0]]
  };
  const atomsIn = (f, n = 1) => { const out = {}; Object.entries(FORMULA[f]).forEach(([e, k]) => { out[e] = k * n; }); return out; };
  const atomTotal = (f, n = 1) => Object.values(atomsIn(f, n)).reduce((s, v) => s + v, 0);
  const molMass = f => Object.entries(FORMULA[f]).reduce((s, [e, k]) => s + MASS[e] * k, 0);
  // Tally a mixture {formula: count} into atoms per element, molecule total and relative mass.
  function tally(mix) {
    const atoms = {}; let molecules = 0, mass = 0;
    Object.entries(mix).forEach(([f, n]) => { molecules += n; mass += molMass(f) * n; Object.entries(atomsIn(f, n)).forEach(([e, k]) => { atoms[e] = (atoms[e] || 0) + k; }); });
    return { atoms, molecules, mass };
  }

  // Step 1: same two elements, different molecules. Boiling points at 1 atm (°C), handbook values.
  const HO_SET = ['H2O', 'H2O2', 'H2', 'O2', 'O3'];
  const BOIL = { H2O: 100, H2O2: 150.2, H2: -252.9, O2: -183.0, O3: -111.9 };
  const MELT = { H2O: 0, H2O2: -0.43, H2: -259.2, O2: -218.8, O3: -192.2 };
  const stateAt = (f, T) => (T < MELT[f] ? 'solid' : T < BOIL[f] ? 'liquid' : 'gas');
  const sameKinds = (a, b) => { const ka = Object.keys(FORMULA[a]).sort().join(), kb = Object.keys(FORMULA[b]).sort().join(); return ka === kb; };
  const sameMolecule = (a, b) => JSON.stringify(Object.entries(FORMULA[a]).sort()) === JSON.stringify(Object.entries(FORMULA[b]).sort());

  // Step 2: heating water at 1 atm. Molecules never change; only the arrangement does.
  const phase = T => (T < 0 ? 'solid' : T < 100 ? 'liquid' : 'gas');
  // How much farther apart molecules are in steam at 100 °C than in liquid water (ideal gas vs 18 cm³/mol).
  function steamSpacingRatio(Tc = 100) {
    const R = 8.314, P = 101325, Vgas = R * (Tc + 273.15) / P * 1e6, Vliq = 18.0 / 0.958; // cm³/mol; water at 100 °C: 0.958 g/cm³
    return { volume: Vgas / Vliq, spacing: Math.cbrt(Vgas / Vliq) };
  }

  // Step 3: electrolysis, one event = 2 H2O → 2 H2 + O2.
  function electrolysis(start, events) {
    const k = Math.min(events, Math.floor(start / 2));
    return { H2O: start - 2 * k, H2: 2 * k, O2: k, done: k, max: Math.floor(start / 2) };
  }

  // Step 4: is it a physical or a chemical change? Compare the kinds of molecule before and after.
  const SCENARIOS = [
    { id: 'melt', before: ['H2O'], after: ['H2O'] },
    { id: 'alcohol', before: ['C2H5OH'], after: ['C2H5OH'] },
    { id: 'iodine', before: ['I2'], after: ['I2'] },
    { id: 'charcoal', before: ['C', 'O2'], after: ['CO2'] },
    { id: 'hydrogen', before: ['H2', 'O2'], after: ['H2O'] },
    { id: 'ozone', before: ['O2'], after: ['O3'] },
    { id: 'electro', before: ['H2O'], after: ['H2', 'O2'] }
  ];
  function classify(sc) {
    const b = [...sc.before].sort().join(), a = [...sc.after].sort().join();
    const newKinds = sc.after.filter(f => !sc.before.includes(f));
    const elB = [...new Set(sc.before.flatMap(f => Object.keys(FORMULA[f])))].sort().join(), elA = [...new Set(sc.after.flatMap(f => Object.keys(FORMULA[f])))].sort().join();
    return { chemical: a !== b, newKinds, sameElements: elA === elB };
  }

  // Step 5: burning hydrogen, one reaction = 2 H2 + O2 → 2 H2O, starting from 8 H2 + 4 O2.
  const BURN_START = { H2: 8, O2: 4 };
  function burn(r) { return { H2: BURN_START.H2 - 2 * r, O2: BURN_START.O2 - r, H2O: 2 * r }; }
  const BURN_MAX = Math.min(BURN_START.H2 / 2, BURN_START.O2);

  const api = { MASS, FORMULA, LAYOUT, atomsIn, atomTotal, molMass, tally, HO_SET, BOIL, MELT, stateAt, sameKinds, sameMolecule,
    phase, steamSpacingRatio, electrolysis, SCENARIOS, classify, BURN_START, burn, BURN_MAX };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MA_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
