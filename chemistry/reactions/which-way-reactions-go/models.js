/* Which way reactions go: the models. Plain functions, usable from the page (window.RxnModels) and from node.
   Every number in the prose is produced here (bindings.cjs) and pinned in tests/models.cjs.
   Data: NIST Chemistry WebBook / NIST-JANAF 4th ed. (Chase 1998) and CODATA Key Values (Cox, Wagman, Medvedev 1984),
   at 298.15 K and 1 bar; sources and access dates are in BRIEF.md. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RxnModels = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ── constants (CODATA 2018, exact since the 2019 SI) ── */
  const R = 8.314462618;          // J/(mol K)
  const KB = 1.380649e-23;        // J/K
  const NA = 6.02214076e23;
  const QE = 1.602176634e-19;     // C
  const FARADAY = NA * QE;        // 96485.33… C/mol
  const HPLANCK = 6.62607015e-34; // J s
  const T0 = 298.15;
  const KB_EV = KB / QE;          // eV/K
  const M_H2 = 2.01588e-3, M_CO2 = 44.0095e-3, M_NH3 = 17.03052e-3; // kg/mol

  /* ── formatting ── */
  function fmt(x, d, lang) {
    if (!isFinite(x)) return x > 0 ? '∞' : x < 0 ? '−∞' : '—';
    const s = Math.abs(x).toFixed(d == null ? 0 : d);
    let [i, f] = s.split('.');
    i = i.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const neg = x < 0 && Number(s) !== 0;
    return (neg ? '−' : '') + i + (f ? '.' + f : '');
  }
  const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
  const supStr = n => String(n).split('').map(ch => SUP[ch]).join('');
  // 1.5 × 10⁻⁴ style; plain decimals between 0.01 and 10000
  function sci(x, d) {
    d = d == null ? 2 : d;
    if (x === 0) return '0';
    if (!isFinite(x)) return x > 0 ? '∞' : '−∞';
    const a = Math.abs(x);
    if (a >= 0.01 && a < 10000) return fmt(x, a >= 100 ? 0 : a >= 10 ? 1 : a >= 1 ? 2 : 3);
    let e = Math.floor(Math.log10(a)), m = a / Math.pow(10, e);
    if (Number(m.toFixed(d - 1)) >= 10) { m /= 10; e += 1; }
    return (x < 0 ? '−' : '') + m.toFixed(d - 1) + ' × 10' + supStr(e);
  }

  /* ── tabulated data at 298.15 K: ΔfH° in kJ/mol, S° in J/(mol K) ── */
  const SPECIES = {
    H2: { h: 0, s: 130.680 }, N2: { h: 0, s: 191.609 }, O2: { h: 0, s: 205.152 },
    NH3: { h: -45.90, s: 192.77 },
    NO2: { h: 33.10, s: 240.04 }, N2O4: { h: 9.08, s: 304.38 },
    CO: { h: -110.53, s: 197.660 }, CO2: { h: -393.51, s: 213.785 },
    H2Og: { h: -241.826, s: 188.835 }, H2Ol: { h: -285.830, s: 69.95 },
    H2O2g: { h: -136.11, s: 232.95 }, O3: { h: 142.67, s: 238.92 },
    C: { h: 0, s: 5.74 },
    Fe: { h: 0, s: 27.32 }, FeO: { h: -272.04, s: 60.75 },
    Al: { h: 0, s: 28.30 }, Al2O3: { h: -1675.7, s: 50.92 },
    Cu: { h: 0, s: 33.15 }, Cu2O: { h: -170.71, s: 92.37 },
    Si: { h: 0, s: 18.81 }, SiO2: { h: -910.86, s: 41.46 },
    CaO: { h: -634.92, s: 38.1 }, CaCO3: { h: -1207.6, s: 91.7 }
  };
  // reactions: stoichiometric coefficients (products positive)
  const REACTIONS = {
    h2o2: { H2O2g: -2, H2Og: 2, O2: 1 },          // 2 H2O2(g) → 2 H2O(g) + O2
    co: { C: -2, O2: -1, CO: 2 },                 // 2 C + O2 → 2 CO
    nh3: { N2: -1, H2: -3, NH3: 2 },              // N2 + 3 H2 → 2 NH3
    dimer: { NO2: -2, N2O4: 1 },                  // 2 NO2 → N2O4
    water: { H2: -2, O2: -1, H2Ol: 2 },           // 2 H2 + O2 → 2 H2O(l)
    n2o4: { N2O4: -1, NO2: 2 },                   // N2O4 → 2 NO2
    vap: { H2Ol: -1, H2Og: 1 },                   // H2O(l) → H2O(g)
    lime: { CaCO3: -1, CaO: 1, CO2: 1 },          // CaCO3 → CaO + CO2
    ozone: { O2: -3, O3: 2 },                     // 3 O2 → 2 O3
    no2: { N2: -1, O2: -2, NO2: 2 },              // N2 + 2 O2 → 2 NO2
    // oxide lines, each per mole of O2 (Ellingham)
    oxC: { C: -1, O2: -1, CO2: 1 },
    oxCu: { Cu: -4, O2: -1, Cu2O: 2 },
    oxFe: { Fe: -2, O2: -1, FeO: 2 },
    oxSi: { Si: -1, O2: -1, SiO2: 1 },
    oxAl: { Al: -4 / 3, O2: -1, Al2O3: 2 / 3 },
    oxH: { H2: -2, O2: -1, H2Og: 2 }
  };
  function rxn(id) {
    const st = REACTIONS[id]; let dH = 0, dS = 0;
    for (const k in st) { dH += st[k] * SPECIES[k].h; dS += st[k] * SPECIES[k].s; }
    return { id, dH, dS };                         // kJ/mol, J/(mol K)
  }
  // ΔG°(T) with ΔH° and ΔS° held at their 298 K values (the Ellingham approximation), kJ/mol
  const dG = (r, T) => r.dH - T * r.dS / 1000;
  const Kof = (dGkJ, T) => Math.exp(-dGkJ * 1000 / (R * T));
  const crossT = r => (r.dH * r.dS > 0 ? r.dH * 1000 / r.dS : null);   // where ΔG° changes sign, if it does
  function quadrant(r) { return r.dH < 0 ? (r.dS > 0 ? 'always' : 'cold') : (r.dS > 0 ? 'hot' : 'never'); }

  /* ── ch1: the entropy ledger of a process at temperature T ──
     system gains ΔS; the surroundings, at T, lose the heat ΔH and with it ΔH/T of entropy. */
  const PROCESSES = {
    ice: { dH: 6.01, dS: 6010 / 273.15 },            // melting; ΔfusH 6.01 kJ/mol at 273.15 K (CRC), ΔS = ΔH/Tm
    vap: rxn('vap'), lime: rxn('lime')
  };
  function ledger(p, T) {
    const sys = p.dS, surr = -p.dH * 1000 / T, tot = sys + surr;
    return { sys, surr, tot, goes: tot > 0, Tx: p.dH * 1000 / p.dS };
  }

  /* ── ch2: Einstein solids. N oscillators sharing q quanta: Ω = C(q + N − 1, q) ── */
  const LG = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  function lgamma(x) {
    if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lgamma(1 - x);
    x -= 1; let a = LG[0]; const t = x + 7.5;
    for (let i = 1; i < 9; i++) a += LG[i] / (x + i);
    return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
  }
  const lnC = (n, k) => (k < 0 || k > n ? -Infinity : lgamma(n + 1) - lgamma(k + 1) - lgamma(n - k + 1));
  const lnOmega = (N, q) => (q < 0 ? -Infinity : lnC(q + N - 1, q));
  function binom(n, k) { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return Math.round(r); }
  const omega = (N, q) => binom(q + N - 1, q);        // exact for small arguments
  // two solids A and B in contact: the probability that A holds qA of the q quanta
  function split(NA_, NB, q) {
    const ln = [], p = []; let mx = -Infinity;
    for (let a = 0; a <= q; a++) { const v = lnOmega(NA_, a) + lnOmega(NB, q - a); ln.push(v); if (v > mx) mx = v; }
    let sum = 0; for (let a = 0; a <= q; a++) { const e = Math.exp(ln[a] - mx); p.push(e); sum += e; }
    let mean = 0, mode = 0; for (let a = 0; a <= q; a++) { p[a] /= sum; mean += a * p[a]; if (p[a] > p[mode]) mode = a; }
    let v = 0; for (let a = 0; a <= q; a++) v += (a - mean) * (a - mean) * p[a];
    const lnTot = mx + Math.log(sum);
    return { p, ln, mean, mode, sd: Math.sqrt(v), lnTot, pAll: Math.exp(ln[q] - lnTot), lnAll: ln[q] - lnTot, expect: q * NA_ / (NA_ + NB) };
  }
  function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  // random walk over microstates: pick two oscillators, move one quantum from the first to the second if it has one.
  // The move and its reverse are equally likely, so every microstate ends up equally likely.
  function solidSim(NA_, NB, q, seed) {
    const N = NA_ + NB, n = new Array(N).fill(0), rnd = rng(seed || 1);
    for (let i = 0; i < q; i++) n[i % NA_]++;                       // all the energy starts in A
    const sim = { n, NA: NA_, NB, q, moves: 0,
      qA() { let s = 0; for (let i = 0; i < NA_; i++) s += n[i]; return s; },
      step(k) { for (let m = 0; m < k; m++) { const i = Math.floor(rnd() * N); let j = Math.floor(rnd() * (N - 1)); if (j >= i) j++; if (n[i] > 0) { n[i]--; n[j]++; } sim.moves++; } return sim; } };
    return sim;
  }
  // mixing: molar entropy of an ideal mixture at mole fraction x
  const mixS = x => (x <= 0 || x >= 1 ? 0 : -R * (x * Math.log(x) + (1 - x) * Math.log(1 - x)));

  /* ── ch3: a small system in contact with a bath: P(n) ∝ Ω_bath(q − n) ── */
  function bath(NB, q, nmax) {
    const w = []; let sum = 0;
    const base = lnOmega(NB, q);
    for (let n = 0; n <= Math.min(nmax, q); n++) { const e = Math.exp(lnOmega(NB, q - n) - base); w.push(e); sum += e; }
    const exact = w.map(x => x / sum);
    const r = q / (q + NB);                     // e^(−ε/kT) with 1/T = ∂S/∂E = (k/ε) ln(1 + N/q)
    let gs = 0; const geo = []; for (let n = 0; n < exact.length; n++) { geo.push(Math.pow(r, n)); gs += geo[n]; }
    const boltz = geo.map(x => x / gs);
    let err = 0; for (let n = 0; n < exact.length; n++) err = Math.max(err, Math.abs(exact[n] - boltz[n]));
    return { exact, boltz, r, kT: 1 / Math.log(1 + NB / q), ratio1: w.length > 1 ? w[1] / w[0] : 0, err };
  }
  const boltzRatio = (eV, T) => Math.exp(-eV / (KB_EV * T));     // upper / lower population of two levels
  const upperFrac = (eV, T) => { const r = boltzRatio(eV, T); return r / (1 + r); };
  const kT_eV = T => KB_EV * T;
  const RT_kJ = T => R * T / 1000;
  const eVtokJ = eV => eV * QE * NA / 1000;                     // 1 eV per particle = 96.485 kJ/mol

  /* ── ch5: N2O4 ⇌ 2 NO2 from one mole of N2O4; ξ is the extent, p in bar ── */
  const N2O4 = rxn('n2o4');
  function dissoc(T, p) {
    const dG0 = dG(N2O4, T), K = Kof(dG0, T), RT = RT_kJ(T);
    const xiEq = Math.sqrt(K / (K + 4 * p));
    const Q = xi => 4 * xi * xi * p / (1 - xi * xi);
    // G(ξ) − G(pure N2O4 at 1 bar), kJ per mole of N2O4 fed
    const G = xi => {
      const a = (1 - xi) / (1 + xi), b = 2 * xi / (1 + xi);
      return xi * dG0 + RT * ((xi < 1 ? (1 - xi) * Math.log(a * p) : 0) + (xi > 0 ? 2 * xi * Math.log(b * p) : 0));
    };
    const Gpure = xi => xi * dG0 + RT * (1 + xi) * Math.log(p);  // each gas kept separate at pressure p: no mixing term
    const slope = xi => dG0 + RT * Math.log(Q(xi));               // ΔrG = ΔG° + RT ln Q = dG/dξ
    return { T, p, dG0, K, xiEq, Q, G, Gpure, slope, xNO2: 2 * xiEq / (1 + xiEq), Gmin: G(xiEq) };
  }

  /* ── ch6: van 't Hoff: ln K = −ΔH°/RT + ΔS°/R ── */
  const lnK = (r, T) => -dG(r, T) * 1000 / (R * T);
  const vantHoffSlope = r => -r.dH * 1000 / R;                   // d ln K / d(1/T), in K

  /* ── ch7: Eyring rate, a two-state reaction A ⇌ B ── */
  const eyring = (dGact, T) => (KB * T / HPLANCK) * Math.exp(-dGact * 1000 / (R * T));   // s⁻¹, ΔG‡ in kJ/mol
  function twoState(barrier, cat, dG0, T) {
    const kf = eyring(barrier - cat, T), K = Kof(dG0, T), kr = kf / K;
    return { kf, kr, K, xEq: K / (1 + K), tau: 1 / (kf + kr), half: Math.LN2 / (kf + kr), speedup: Math.exp(cat * 1000 / (R * T)) };
  }
  const relax = (ts, t, x0) => ts.xEq + ((x0 || 0) - ts.xEq) * Math.exp(-t / ts.tau);
  // N molecules, each flipping independently; exact transition probabilities over a step dt
  function flipSim(N, seed) {
    const rnd = rng(seed || 7); const s = { N, nB: 0, t: 0,
      step(ts, dt) {
        const g = 1 - Math.exp(-dt / ts.tau), pf = ts.xEq * g, pr = (1 - ts.xEq) * g;
        let toB = 0, toA = 0;
        for (let i = 0; i < s.N - s.nB; i++) if (rnd() < pf) toB++;
        for (let i = 0; i < s.nB; i++) if (rnd() < pr) toA++;
        s.nB += toB - toA; s.t += dt; return s;
      } };
    return s;
  }

  /* ── ch8: coupling ── */
  const ATP = { dG0: -30.5, T: 310.15, glucose: 13.8 };          // kJ/mol, biochemical standard state (pH 7); Lehninger
  const atpDG = (ratio, Pi) => ATP.dG0 + RT_kJ(ATP.T) * Math.log(Pi / ratio);   // ratio = [ATP]/[ADP], Pi in mol/L
  const voltage = (dGkJ, n) => -dGkJ * 1000 / (n * FARADAY);     // ΔG = −nFE
  const WATER = (() => { const r = rxn('water'); return { dG: dG(r, T0) / 2, dH: r.dH / 2, lhv: -rxn('oxH').dH / 2 }; })(); // per mole of H2
  const E_REV = voltage(WATER.dG, 2), E_TN = voltage(WATER.dH, 2), E_LHV = WATER.lhv * 1000 / (2 * FARADAY);
  const kWhPerKgH2 = V => V * 2 * FARADAY / M_H2 / 3.6e6;
  const ELLINGHAM = ['oxCu', 'oxFe', 'oxSi', 'oxAl'];
  const CO_LINE = rxn('co'), CO2_LINE = rxn('oxC');
  function ellingham(id, T) {
    const r = rxn(id), g = dG(r, T), gc = dG(CO_LINE, T);
    const Tx = (r.dH - CO_LINE.dH) * 1000 / (r.dS - CO_LINE.dS);  // where the carbon line crosses below this oxide's line
    return { id, g, gc, Tx, carbonWins: gc < g, net: gc - g,     // net: ΔG° of oxide + 2C → metal + 2CO, per mole O2
      volts: -g * 1000 / (4 * FARADAY), voltsC: (dG(CO2_LINE, T) - g) * 1000 / (4 * FARADAY) };
  }

  /* ── ch9: ammonia. Shomate equations (NIST WebBook, from NIST-JANAF) ── */
  const SHOMATE = {
    NH3: [[298, 1400, 19.99563, 49.77119, -15.37599, 1.921168, 0.189174, -53.30667, 203.8591, -45.89806]],
    N2: [[100, 500, 28.98641, 1.853978, -9.647459, 16.63537, 0.000117, -8.671914, 226.4168, 0], [500, 2000, 19.50583, 19.88705, -8.598535, 1.369784, 0.527601, -4.935202, 212.39, 0]],
    H2: [[298, 1000, 33.066178, -11.363417, 11.432816, -2.772874, -0.158558, -9.980797, 172.707974, 0], [1000, 2500, 18.563083, 12.257357, -2.859786, 0.268238, 1.97799, -1.147438, 156.288133, 0]]
  };
  function shomate(sp, T) {
    const rows = SHOMATE[sp]; let c = rows[rows.length - 1];
    for (const row of rows) if (T <= row[1]) { c = row; break; }
    const t = T / 1000, [, , A, B, C, D, E, F, G, H] = c;
    return { dH: A * t + B * t * t / 2 + C * t * t * t / 3 + D * t * t * t * t / 4 - E / t + F - H,   // H°(T) − H°(298.15), kJ/mol
      S: A * Math.log(t) + B * t + C * t * t / 2 + D * t * t * t / 3 - E / (2 * t * t) + G };        // J/(mol K)
  }
  // ΔG° of N2 + 3 H2 → 2 NH3 at T, kJ/mol, with the heat capacities included
  function ammoniaDG(T) {
    const a = shomate('NH3', T), n = shomate('N2', T), h = shomate('H2', T);
    const dH = 2 * (SPECIES.NH3.h + a.dH) - n.dH - 3 * h.dH, dS = 2 * a.S - n.S - 3 * h.S;
    return { dH, dS, dG: dH - T * dS / 1000 };
  }
  const ammoniaK = T => Kof(ammoniaDG(T).dG, T);
  // mole numbers along the extent ξ for a feed of 1 N2 + 3 H2 + n0 NH3
  function ammoniaMix(xi, p, n0) {
    const tot = 4 + n0 - 2 * xi, n2 = (1 - xi) / tot * p, h2 = (3 - 3 * xi) / tot * p, nh3 = (n0 + 2 * xi) / tot * p;
    return { n2, h2, nh3, y: (n0 + 2 * xi) / tot };
  }
  function ammoniaEq(T, p, y0) {
    const n0 = y0 ? 4 * y0 / (1 - y0) : 0, K = ammoniaK(T);
    let lo = 0, hi = 1;
    for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2, s = ammoniaMix(m, p, n0); if (s.nh3 * s.nh3 / (s.n2 * s.h2 * s.h2 * s.h2) < K) lo = m; else hi = m; }
    const xi = (lo + hi) / 2;
    return { K, xi, y: ammoniaMix(xi, p, n0).y, n0 };
  }
  // Temkin–Pyzhev rate (α = 0.5) in the Dyson–Simon form, ideal gas: r = k2 [K pN2 pH2^1.5 / pNH3 − pNH3 / pH2^1.5]
  const TP = { Ea: 170.56, k0: 6.6e12, y0: 0.02 };    // Ea: Dyson & Simon 1968 (40,765 cal/mol); k0 tuned (see BRIEF)
  const tpK2 = T => TP.k0 * Math.exp(-TP.Ea * 1000 / (R * T));
  function tpRate(xi, T, p, n0, K) { const s = ammoniaMix(xi, p, n0); return tpK2(T) * (K * s.n2 * Math.pow(s.h2, 1.5) / s.nh3 - s.nh3 / Math.pow(s.h2, 1.5)); }
  // one pass through a bed of size tau (catalyst per unit feed, arbitrary units): contact time needed to reach ξ is ∫dξ/r
  function converter(T, p, tau) {
    const eq = ammoniaEq(T, p, TP.y0), n0 = eq.n0, K = eq.K, M_ = 600;
    let t = 0, xi = 0, prev = 1 / tpRate(0, T, p, n0, K), out = null;
    for (let i = 1; i <= M_; i++) {
      const u = i / M_, x = eq.xi * (1 - Math.pow(1 - u, 3)) * (1 - 1e-9);   // points crowd toward equilibrium
      const cur = 1 / tpRate(x, T, p, n0, K), dt = 0.5 * (prev + cur) * (x - xi);
      if (t + dt >= tau) { out = xi + (x - xi) * (tau - t) / dt; break; }
      t += dt; xi = x; prev = cur;
    }
    if (out == null) out = xi;
    const y = ammoniaMix(out, p, n0).y;
    return { T, p, tau, K, yEq: eq.y, y, approach: (y - TP.y0) / (eq.y - TP.y0), xi: out };
  }
  function bestT(p, tau) { let b = null; for (let T = 500; T <= 950; T += 1) { const c = converter(T, p, tau); if (!b || c.y > b.y) b = c; } return b; }

  /* ── ch10: regular solution. g = G_mix / RT per mole, χ = Ω/RT; critical point χ = 2 ── */
  const regG = (x, chi) => (x <= 0 || x >= 1 ? 0 : x * Math.log(x) + (1 - x) * Math.log(1 - x)) + chi * x * (1 - x);
  function binodal(chi) {                      // the lower branch of ln(x/(1−x)) + χ(1 − 2x) = 0
    if (chi <= 2) return null;
    let lo = 1e-12, hi = 0.5 - 1e-9;
    const f = x => Math.log(x / (1 - x)) + chi * (1 - 2 * x);   // negative near 0, positive just below 1/2
    for (let i = 0; i < 100; i++) { const m = (lo + hi) / 2; if (f(m) < 0) lo = m; else hi = m; }
    return (lo + hi) / 2;
  }
  const spinodal = chi => (chi <= 2 ? null : (1 - Math.sqrt(1 - 2 / chi)) / 2);
  function demix(x0, tr) {                     // tr = T / Tc, so χ = 2 / tr
    const chi = 2 / tr, xb = binodal(chi), xs = spinodal(chi), g1 = regG(x0, chi);
    if (xb == null || x0 <= xb || x0 >= 1 - xb) return { chi, xb, xs, split: false, g1, g: g1, state: 'one' };
    const g2 = regG(xb, chi);                  // symmetric model: the common tangent is horizontal
    const fracRich = (x0 - xb) / (1 - 2 * xb);
    return { chi, xb, xs, split: true, g1, g: g2, drop: g1 - g2, fracRich, state: (x0 > xs && x0 < 1 - xs) ? 'spin' : 'meta' };
  }

  /* ── ch11: thermodynamic minimums ── */
  const minWorkCO2 = (x, T) => -R * (T || T0) * Math.log(x) / 1000;      // kJ per mole of CO2 taken from a large reservoir at mole fraction x
  const perTonneKWh = kJmol => kJmol / M_CO2 / 3.6;        // kJ/mol → kWh per tonne of CO2
  const perTonneGJ = kJmol => kJmol / M_CO2 / 1e6 * 1000;
  // frontier facts: one block, each dated; sources in BRIEF.md "Facts that will go stale"
  const FRONTIER = {
    asOf: '2026-11',
    ammonia: { energyEJ: 8.6, sharePct: 2, co2Mt: 450, co2SharePct: 1.3, avgGJt: 41, batGJt: 28, gasSharePct: 70, fertPct: 70, year: 2021 },
    envision: { kt: 320, year: 2025 }, neom: { mt: 1.2 },
    liNRR: { fe: 98, mAcm2: 100, ee: 21, hours: 40, feFlow: 80, year: 2026 },
    electrolysis: { gw: 4, year: 2025, doeSys2022: 55, doeSys2026: 51, doeSysUlt: 46, doeStack2022: 51 },
    dac: { mammothKt: 36, stratosKt: 500, stratosT: 2000, climeworksKWh: 2000, ppm: 425 },
    ocx24: { samples: 572, tested: 441, relax: 685 }
  };
  const lhvNH3 = () => -(3 * SPECIES.H2Og.h - 2 * SPECIES.NH3.h) / 2 / M_NH3 / 1e6;   // GJ per tonne: 2 NH3 + 1.5 O2 → N2 + 3 H2O(g)

  return { R, KB, NA, QE, FARADAY, HPLANCK, T0, KB_EV, M_H2, M_CO2, M_NH3, fmt, sci, supStr,
    SPECIES, REACTIONS, rxn, dG, Kof, crossT, quadrant, PROCESSES, ledger,
    lgamma, lnC, lnOmega, omega, binom, split, rng, solidSim, mixS,
    bath, boltzRatio, upperFrac, kT_eV, RT_kJ, eVtokJ,
    dissoc, lnK, vantHoffSlope, eyring, twoState, relax, flipSim,
    ATP, atpDG, voltage, WATER, E_REV, E_TN, E_LHV, kWhPerKgH2, ELLINGHAM, CO_LINE, CO2_LINE, ellingham,
    SHOMATE, shomate, ammoniaDG, ammoniaK, ammoniaMix, ammoniaEq, TP, tpK2, tpRate, converter, bestT,
    regG, binodal, spinodal, demix, minWorkCO2, perTonneKWh, perTonneGJ, FRONTIER, lhvNH3 };
});
