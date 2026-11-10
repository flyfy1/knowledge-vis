'use strict';
// Periodic trends lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Data: main-group elements of periods 1–5. Covalent radii (pm, Cordero et al. 2008; noble gases left out
// because they form no ordinary covalent bonds), first ionisation energies (kJ/mol, NIST rounded),
// Pauling electronegativities (noble gases left out). Models: Slater screening and r ∝ n*²/Zeff.
// Every number on the page is read or computed here; tests/core.cjs pins the claims.
(function (root) {
  const GROUPS = [1, 2, 13, 14, 15, 16, 17, 18];
  // [symbol, Z, period, group, radius, IE1, EN]
  const RAW = [
    ['H', 1, 1, 1, 31, 1312, 2.20], ['He', 2, 1, 18, null, 2372, null],
    ['Li', 3, 2, 1, 128, 520, 0.98], ['Be', 4, 2, 2, 96, 900, 1.57], ['B', 5, 2, 13, 84, 801, 2.04], ['C', 6, 2, 14, 76, 1086, 2.55],
    ['N', 7, 2, 15, 71, 1402, 3.04], ['O', 8, 2, 16, 66, 1314, 3.44], ['F', 9, 2, 17, 57, 1681, 3.98], ['Ne', 10, 2, 18, null, 2081, null],
    ['Na', 11, 3, 1, 166, 496, 0.93], ['Mg', 12, 3, 2, 141, 738, 1.31], ['Al', 13, 3, 13, 121, 578, 1.61], ['Si', 14, 3, 14, 111, 787, 1.90],
    ['P', 15, 3, 15, 107, 1012, 2.19], ['S', 16, 3, 16, 105, 1000, 2.58], ['Cl', 17, 3, 17, 102, 1251, 3.16], ['Ar', 18, 3, 18, null, 1521, null],
    ['K', 19, 4, 1, 203, 419, 0.82], ['Ca', 20, 4, 2, 176, 590, 1.00], ['Ga', 31, 4, 13, 122, 579, 1.81], ['Ge', 32, 4, 14, 120, 762, 2.01],
    ['As', 33, 4, 15, 119, 947, 2.18], ['Se', 34, 4, 16, 120, 941, 2.55], ['Br', 35, 4, 17, 120, 1140, 2.96], ['Kr', 36, 4, 18, null, 1351, null],
    ['Rb', 37, 5, 1, 220, 403, 0.82], ['Sr', 38, 5, 2, 195, 550, 0.95], ['In', 49, 5, 13, 142, 558, 1.78], ['Sn', 50, 5, 14, 139, 709, 1.96],
    ['Sb', 51, 5, 15, 139, 834, 2.05], ['Te', 52, 5, 16, 138, 869, 2.10], ['I', 53, 5, 17, 139, 1008, 2.66], ['Xe', 54, 5, 18, null, 1170, null]
  ];
  const ELEMENTS = RAW.map(([sym, Z, period, group, r, ie, en]) => ({ sym, Z, period, group, r, ie, en }));
  const bySym = Object.fromEntries(ELEMENTS.map(e => [e.sym, e]));
  const PROPS = ['r', 'ie', 'en'];

  // Aufbau filling (no exceptions occur among these main-group elements).
  const ORBITALS = [[1, 's', 2], [2, 's', 2], [2, 'p', 6], [3, 's', 2], [3, 'p', 6], [4, 's', 2], [3, 'd', 10], [4, 'p', 6], [5, 's', 2], [4, 'd', 10], [5, 'p', 6]];
  function config(Z) {
    const out = []; let left = Z;
    for (const [n, l, cap] of ORBITALS) { if (left <= 0) break; const k = Math.min(cap, left); out.push({ n, l, k }); left -= k; }
    return out;
  }
  function shells(Z) { const s = {}; config(Z).forEach(o => { s[o.n] = (s[o.n] || 0) + o.k; }); return s; }
  // Slater's rules for an outermost s/p electron: others in the same (ns, np) group 0.35 (0.30 in 1s),
  // every electron of shell n − 1 (s, p and d) 0.85, deeper shells 1.00.
  const NSTAR = { 1: 1, 2: 2, 3: 3, 4: 3.7, 5: 4.0 };
  function slater(Z) {
    const cfg = config(Z), n = Math.max(...cfg.map(o => o.n));
    let same = 0, prev = 0, deep = 0;
    cfg.forEach(o => { if (o.n === n && (o.l === 's' || o.l === 'p')) same += o.k; else if (o.n === n - 1) prev += o.k; else if (o.n < n - 1) deep += o.k; });
    const S = (same - 1) * (n === 1 ? 0.30 : 0.35) + prev * 0.85 + deep * 1.0;
    return { n, nstar: NSTAR[n], valence: same, S, zeff: Z - S, size: NSTAR[n] * NSTAR[n] / (Z - S) };
  }
  // r ≈ k · n*²/Zeff with one constant k fitted (least squares through the origin) to every element with a radius.
  const WITH_R = ELEMENTS.filter(e => e.r != null);
  const K_FIT = (() => { let sxy = 0, sxx = 0; WITH_R.forEach(e => { const x = slater(e.Z).size; sxy += x * e.r; sxx += x * x; }); return sxy / sxx; })();
  function pearson(xs, ys) {
    const n = xs.length, mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
    let sxy = 0, sxx = 0, syy = 0; for (let i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; syy += (ys[i] - my) ** 2; }
    return sxy / Math.sqrt(sxx * syy);
  }
  const R_CORR = pearson(WITH_R.map(e => slater(e.Z).size), WITH_R.map(e => e.r));
  const predictR = Z => K_FIT * slater(Z).size;

  const period = p => ELEMENTS.filter(e => e.period === p).sort((a, b) => GROUPS.indexOf(a.group) - GROUPS.indexOf(b.group));
  const group = g => ELEMENTS.filter(e => e.group === g && !(g === 1 && e.sym === 'H')).sort((a, b) => a.period - b.period);

  // Step 2: the valence s/p boxes (Hund: p electrons spread one per box before pairing).
  function valenceBoxes(Z) {
    const s = slater(Z), cfg = config(Z), n = s.n;
    const ns = (cfg.find(o => o.n === n && o.l === 's') || { k: 0 }).k, np = (cfg.find(o => o.n === n && o.l === 'p') || { k: 0 }).k;
    const p = [0, 0, 0]; for (let i = 0; i < np; i++) p[i % 3]++;
    return { n, s: ns, p };
  }
  // Why IE1 changes from the previous element of the same period: which electron is removed now.
  function ieStep(sym) {
    const e = bySym[sym], row = period(e.period), i = row.indexOf(e);
    if (i <= 0) return null;
    const prev = row[i - 1], b = valenceBoxes(e.Z), np = b.p.reduce((a, c) => a + c, 0);
    const kind = e.group === 13 ? 'newP' : (e.group === 16 ? 'firstPair' : 'normal');
    return { prev, delta: e.ie - prev.ie, kind, np };
  }
  // Step 4: the trend rule (same period: further right → smaller r, larger IE and EN; same group: lower → larger r, smaller IE and EN).
  function rulePredicts(prop, a, b) {
    const A = bySym[a], B = bySym[b];
    let bigger;
    if (A.period === B.period) { const right = GROUPS.indexOf(A.group) > GROUPS.indexOf(B.group) ? a : b, left = right === a ? b : a; bigger = prop === 'r' ? left : right; }
    else if (A.group === B.group) { const lower = A.period > B.period ? a : b, upper = lower === a ? b : a; bigger = prop === 'r' ? lower : upper; }
    else return null;
    return bigger;
  }
  const truth = (prop, a, b) => (bySym[a][prop] > bySym[b][prop] ? a : b);
  const QUESTIONS = [
    ['r', 'Na', 'Cl'], ['ie', 'N', 'O'], ['en', 'F', 'Cl'], ['r', 'K', 'Na'], ['ie', 'Be', 'B'], ['en', 'Ga', 'Al'],
    ['r', 'S', 'O'], ['ie', 'Mg', 'Al'], ['en', 'Br', 'Se'], ['ie', 'Kr', 'Br'], ['r', 'C', 'Si'], ['ie', 'P', 'S']
  ];

  const api = { GROUPS, ELEMENTS, bySym, PROPS, config, shells, slater, NSTAR, K_FIT, R_CORR, pearson, predictR, period, group, valenceBoxes, ieStep, rulePredicts, truth, QUESTIONS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PT_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
