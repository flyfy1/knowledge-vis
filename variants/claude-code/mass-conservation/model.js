'use strict';
// Mass conservation lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Atom counts, masses, balance readings and gas ledgers are all computed here; tests/core.cjs pins them.
// Masses use school relative atomic masses (H 1, C 12, O 16, Mg 24, Cl 35.5, Ca 40); amounts in grams.
(function (root) {
  const AR = { H: 1, C: 12, O: 16, Mg: 24, Cl: 35.5, Ca: 40 };
  // Species: composition (lookup data) and a display formula with subscripts.
  // Species: atoms with a 2-D sketch layout (x, y in atom radii; display data) and a formula with subscripts.
  // Composition is derived from the atom list, so drawing and counting cannot disagree.
  const SPECIES = {
    H2: { f: 'H₂', atoms: [['H', -0.75, 0], ['H', 0.75, 0]] },
    O2: { f: 'O₂', atoms: [['O', -0.9, 0], ['O', 0.9, 0]] },
    H2O: { f: 'H₂O', atoms: [['O', 0, -0.3], ['H', -1.25, 0.65], ['H', 1.25, 0.65]] },
    C: { f: 'C', atoms: [['C', 0, 0]] },
    CO2: { f: 'CO₂', atoms: [['O', -1.8, 0], ['C', 0, 0], ['O', 1.8, 0]] },
    CH4: { f: 'CH₄', atoms: [['C', 0, 0], ['H', -1.25, -1.1], ['H', 1.25, -1.1], ['H', -1.25, 1.1], ['H', 1.25, 1.1]] },
    CaCO3: { f: 'CaCO₃', atoms: [['Ca', -2.3, 0], ['C', 0.5, 0], ['O', 0.5, -1.75], ['O', -0.95, 1.0], ['O', 1.95, 1.0]] },
    HCl: { f: 'HCl', atoms: [['H', -0.95, 0], ['Cl', 0.75, 0]] },
    CaCl2: { f: 'CaCl₂', atoms: [['Cl', -2.2, 0], ['Ca', 0, 0], ['Cl', 2.2, 0]] },
    Mg: { f: 'Mg', atoms: [['Mg', 0, 0]] },
    MgO: { f: 'MgO', atoms: [['Mg', -1.05, 0], ['O', 0.95, 0]] }
  };
  for (const sp of Object.values(SPECIES)) { sp.comp = {}; for (const [el] of sp.atoms) sp.comp[el] = (sp.comp[el] || 0) + 1; }
  // Drawing radius of each element relative to the base radius.
  const RADIUS = { H: 0.7, C: 1, O: 0.95, Mg: 1.15, Cl: 1.15, Ca: 1.25 };

  // Reactions with their balanced coefficients.
  const REACTIONS = {
    carbon: { left: [['C', 1], ['O2', 1]], right: [['CO2', 1]] },
    hydrogen: { left: [['H2', 2], ['O2', 1]], right: [['H2O', 2]] },
    methane: { left: [['CH4', 1], ['O2', 2]], right: [['CO2', 1], ['H2O', 2]] },
    marble: { left: [['CaCO3', 1], ['HCl', 2]], right: [['CaCl2', 1], ['H2O', 1], ['CO2', 1]] },
    magnesium: { left: [['Mg', 2], ['O2', 1]], right: [['MgO', 2]] }
  };

  const molarMass = sp => Object.entries(SPECIES[sp].comp).reduce((s, [el, n]) => s + AR[el] * n, 0);

  // Atom totals of one side: terms = [[species, coefficient], ...].
  function count(terms) {
    const out = {};
    for (const [sp, k] of terms) for (const [el, n] of Object.entries(SPECIES[sp].comp)) out[el] = (out[el] || 0) + k * n;
    return out;
  }
  const sideMass = terms => terms.reduce((s, [sp, k]) => s + k * molarMass(sp), 0);
  function elementsOf(rx) { const set = new Set(); for (const [sp] of [...rx.left, ...rx.right]) Object.keys(SPECIES[sp].comp).forEach(e => set.add(e)); return [...set]; }
  // Ledger for an equation with chosen coefficients: per element left/right, masses, balanced?
  function ledger(left, right) {
    const L = count(left), R = count(right), els = [...new Set([...Object.keys(L), ...Object.keys(R)])];
    const rows = els.map(el => ({ el, left: L[el] || 0, right: R[el] || 0, ok: (L[el] || 0) === (R[el] || 0) }));
    const mL = sideMass(left), mR = sideMass(right);
    return { rows, balanced: rows.every(r => r.ok), mL, mR, massEqual: Math.abs(mL - mR) < 1e-9 };
  }
  // Beam tilt (radians, + = right pan down) for pan masses: proportional to the relative difference, capped.
  function tilt(mL, mR) { const d = (mR - mL) / Math.max(mL, mR, 1e-9); return Math.max(-0.18, Math.min(0.18, d * 0.6)); }

  // Atom-by-atom matching for the step-1 animation: each atom on the left is paired with one atom of the
  // same element on the right (i-th with i-th). Returns lists of {el, mol, slot} for both sides and the pairing.
  function atoms(terms) {
    const list = []; let mol = 0;
    for (const [sp, k] of terms) for (let i = 0; i < k; i++) { SPECIES[sp].atoms.forEach(([el, x, y]) => list.push({ el, mol, sp, x, y })); mol++; }
    return list;
  }
  function pairing(rx) {
    const A = atoms(rx.left), B = atoms(rx.right), used = new Set();
    return A.map(a => { const j = B.findIndex((b, idx) => !used.has(idx) && b.el === a.el); used.add(j); return j; });
  }

  // ---- the marble-chip experiment (steps 0 and 3) ----
  // 10 g CaCO3 chips + 100 g dilute hydrochloric acid holding exactly 7.3 g HCl, in a 150 g flask.
  const MARBLE = { flask: 150, CaCO3: 10, acid: 100, HCl: 7.3 };
  // Contents at reaction progress p ∈ [0, 1] (fraction of the CaCO3 used up). Water = the acid's water + water made.
  function marbleContents(p) {
    const mol = MARBLE.CaCO3 / molarMass('CaCO3') * p; // mol of CaCO3 reacted
    return {
      CaCO3: MARBLE.CaCO3 - mol * molarMass('CaCO3'),
      HCl: Math.max(0, MARBLE.HCl - 2 * mol * molarMass('HCl')),
      water: MARBLE.acid - MARBLE.HCl + mol * molarMass('H2O'),
      CaCl2: mol * molarMass('CaCl2'),
      CO2: mol * molarMass('CO2')
    };
  }
  const sum = o => Object.values(o).reduce((s, v) => s + v, 0);
  // Balance reading: sealed keeps the CO2; open lets all of it leave as soon as it forms (model assumption).
  function marbleReading(p, open) { const c = marbleContents(p); return MARBLE.flask + sum(c) - (open ? c.CO2 : 0); }

  // ---- magnesium burning in air (step 4): 2.4 g ribbon in a 20 g crucible ----
  const MAGNESIUM = { crucible: 20, Mg: 2.4 };
  function magnesium(p) {
    const molMg = MAGNESIUM.Mg / AR.Mg * p;
    const Mg = MAGNESIUM.Mg - molMg * AR.Mg, MgO = molMg * molarMass('MgO'), O2 = molMg / 2 * molarMass('O2');
    return { Mg, MgO, solid: Mg + MgO, O2in: O2, O2total: MAGNESIUM.Mg / AR.Mg / 2 * molarMass('O2'), reading: MAGNESIUM.crucible + Mg + MgO };
  }

  const api = { RADIUS, AR, SPECIES, REACTIONS, molarMass, count, sideMass, elementsOf, ledger, tilt, atoms, pairing, MARBLE, marbleContents, marbleReading, MAGNESIUM, magnesium, sum };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MASS_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
