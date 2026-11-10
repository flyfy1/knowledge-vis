'use strict';
// Atomic structure lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every count, share, arrangement and verdict on the page is computed here; tests/core.cjs pins the claims.
// Scope: neutral atoms and simple ions with Z = 1…20 (H to Ca) and at most 20 electrons,
// the junior-school shell rule (2, 8, 8, then the 4th shell), qualitative gain/lose tendencies.
(function (root) {
  // Lookup data (not logic): symbol, names, neutrons in the most abundant isotope.
  const ELEMENTS = [
    null,
    { sym: 'H', zh: '氢', en: 'hydrogen', N: 0 }, { sym: 'He', zh: '氦', en: 'helium', N: 2 },
    { sym: 'Li', zh: '锂', en: 'lithium', N: 4 }, { sym: 'Be', zh: '铍', en: 'beryllium', N: 5 },
    { sym: 'B', zh: '硼', en: 'boron', N: 6 }, { sym: 'C', zh: '碳', en: 'carbon', N: 6 },
    { sym: 'N', zh: '氮', en: 'nitrogen', N: 7 }, { sym: 'O', zh: '氧', en: 'oxygen', N: 8 },
    { sym: 'F', zh: '氟', en: 'fluorine', N: 10 }, { sym: 'Ne', zh: '氖', en: 'neon', N: 10 },
    { sym: 'Na', zh: '钠', en: 'sodium', N: 12 }, { sym: 'Mg', zh: '镁', en: 'magnesium', N: 12 },
    { sym: 'Al', zh: '铝', en: 'aluminium', N: 14 }, { sym: 'Si', zh: '硅', en: 'silicon', N: 14 },
    { sym: 'P', zh: '磷', en: 'phosphorus', N: 16 }, { sym: 'S', zh: '硫', en: 'sulfur', N: 16 },
    { sym: 'Cl', zh: '氯', en: 'chlorine', N: 18 }, { sym: 'Ar', zh: '氩', en: 'argon', N: 22 },
    { sym: 'K', zh: '钾', en: 'potassium', N: 20 }, { sym: 'Ca', zh: '钙', en: 'calcium', N: 20 }
  ];
  const ZMAX = 20, EMAX = 20;

  // Particle masses (kg, CODATA 2018, rounded to 6 significant figures).
  const MASS = { p: 1.67262e-27, n: 1.67493e-27, e: 9.10938e-31 };
  // Sizes for the zoom in step 0 (carbon-12).
  // Atom: carbon covalent radius 77 pm (the textbook value). Nucleus: empirical R = 1.2 fm × A^(1/3).
  const R_ATOM_C = 77e-12;
  const nucleusRadius = A => 1.2e-15 * Math.cbrt(A);

  function element(Z) { return ELEMENTS[Z] || null; }

  // Junior-school shell rule: shells take 2, 8, 8 electrons in order; anything beyond goes to shell 4.
  // (Only K and Ca in this range reach shell 4, with 1 and 2 electrons.)
  const FILL = [2, 8, 8, Infinity];
  function shells(e) {
    if (!(e >= 0 && e <= EMAX && Number.isInteger(e))) throw new RangeError('electrons must be 0…' + EMAX);
    const out = []; let left = e;
    for (const cap of FILL) { if (left <= 0) break; const k = Math.min(cap, left); out.push(k); left -= k; }
    return out;
  }
  // The outermost shell can hold at most 8 (2 when it is the first shell).
  const outerCap = index => (index === 0 ? 2 : 8);
  function outer(e) {
    const s = shells(e);
    if (!s.length) return { index: -1, count: 0, cap: 0, full: false };
    const index = s.length - 1, count = s[index], cap = outerCap(index);
    return { index, count, cap, full: count === cap };
  }
  // Textbook rule of thumb ("一般"): full → stable; < 4 → tends to lose them; > 4 → tends to gain
  // the missing ones; exactly 4 → neither comes easily (tends to share).
  function tendency(Z) {
    const o = outer(Z);
    if (o.full) return { kind: 'stable', n: 0, o };
    if (o.count < 4) return { kind: 'lose', n: o.count, o };
    if (o.count > 4) return { kind: 'gain', n: o.cap - o.count, o };
    return { kind: 'share', n: 0, o };
  }
  // Noble-gas arrangements in range: He (2), Ne (2, 8), Ar (2, 8, 8).
  const NOBLE = [2, 10, 18];
  // The noble gas with the same arrangement has Z = e (He, Ne, Ar); 0 when there is none.
  function nobleMatch(e) { return NOBLE.includes(e) ? e : 0; }

  // Ion: protons fixed, electrons changed.
  function ion(Z, e) {
    const charge = Z - e, s = shells(e), o = outer(e), el = element(Z);
    const mag = Math.abs(charge);
    const SUP = { 1: '', 2: '²', 3: '³' };
    const sup = charge === 0 ? '' : SUP[mag] + (charge > 0 ? '⁺' : '⁻');
    return { Z, e, charge, shells: s, outer: o, sym: el.sym, sup, label: el.sym + sup, noble: nobleMatch(e) };
  }

  // Step 4 button range for the electron count: at most 3 either side of neutral, never past the
  // neighbouring noble-gas arrangements (0 / He 2 / Ne 10 / Ar 18 below; He / Ne / Ar or 20 above).
  function eRange(Z) {
    const below = [0, ...NOBLE].filter(v => v <= Z).pop();
    const above = [...NOBLE, EMAX].find(v => v >= Z);
    return [Math.max(0, Z - 3, below), Math.min(EMAX, Z + 3, above)];
  }

  // Mass and volume shares of an atom (nucleus vs electrons); volume uses spheres of the two radii.
  function shares(Z, N, rAtom = R_ATOM_C) {
    const mNuc = Z * MASS.p + N * MASS.n, mEl = Z * MASS.e, A = Z + N;
    const rN = nucleusRadius(A);
    return { mNuc, mEl, massNuc: mNuc / (mNuc + mEl), massEl: mEl / (mNuc + mEl), rN, rA: rAtom, ratio: rAtom / rN, volNuc: Math.pow(rN / rAtom, 3) };
  }

  // Step 0 zoom: view width (m) for a slider position s ∈ [0, 1] on a log scale from 6e-10 m to 2e-14 m.
  const VIEW = { wide: 6e-10, narrow: 2e-14 };
  function viewWidth(s) { return Math.exp(Math.log(VIEW.wide) + s * (Math.log(VIEW.narrow) - Math.log(VIEW.wide))); }
  // Pixel diameters of atom and nucleus when a canvas W px wide shows a view `v` metres wide.
  function pixels(v, W, Z = 6, N = 6) { const q = shares(Z, N); return { atom: 2 * q.rA / v * W, nucleus: 2 * q.rN / v * W }; }
  // A round scale-bar length (m) at most `maxM` long: 1, 2 or 5 × 10^k.
  function niceLength(maxM) { const p = Math.pow(10, Math.floor(Math.log10(maxM))); for (const m of [5, 2, 1]) if (m * p <= maxM) return m * p; return p; }
  // Format a length in pm or fm (both are used on the page).
  function lengthUnit(m) { return m >= 1e-12 ? { v: m / 1e-12, u: 'pm' } : { v: m / 1e-15, u: 'fm' }; }

  // How many electrons weigh as much as one proton (≈ 1836).
  const PROTON_PER_ELECTRON = MASS.p / MASS.e;

  const api = { eRange, PROTON_PER_ELECTRON, ELEMENTS, ZMAX, EMAX, MASS, R_ATOM_C, nucleusRadius, element, shells, outer, outerCap, tendency, NOBLE, nobleMatch, ion, shares, VIEW, viewWidth, pixels, niceLength, lengthUnit };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ATOM_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
