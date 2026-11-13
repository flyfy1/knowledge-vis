/* What decides whether a reaction goes — and how far?
   Plain pure functions (UMD: window.ReactionModels in browser, module.exports in Node).
   No visible UI text here. Every tabulated constant and parameter source is recorded in BRIEF.md. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ReactionModels = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const R = 8.314462618;       // J/(mol K), CODATA 2018 exact
  const F = 96485.33212;       // C/mol, CODATA 2018 exact
  const kB = 1.380649e-23;     // J/K, SI 2019 exact
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ── Math helpers ── */
  function lgamma(z) {
    const g = 7;
    const p = [
      0.99999999999980993, 676.5203681218851, -1259.1392167224028,
      771.32342877765313, -176.61502916214059, 12.507343278686905,
      -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7
    ];
    if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - lgamma(1 - z);
    z -= 1;
    let x = p[0];
    for (let i = 1; i < g + 2; i++) x += p[i] / (z + i);
    const t = z + g + 0.5;
    return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
  }
  function logComb(n, k) {
    if (k < 0 || k > n) return -Infinity;
    if (k === 0 || k === n) return 0;
    return lgamma(n + 1) - lgamma(k + 1) - lgamma(n - k + 1);
  }
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ── Ch1: Enumerable microstates, S = k ln W, Einstein solid & lattice mixing ── */
  function einsteinDist(NA, NB, Q) {
    const logW = [];
    let maxL = -Infinity;
    for (let qA = 0; qA <= Q; qA++) {
      const qB = Q - qA;
      const l = logComb(qA + NA - 1, qA) + logComb(qB + NB - 1, qB);
      logW.push(l);
      if (l > maxL) maxL = l;
    }
    const rel = logW.map(l => Math.exp(l - maxL));
    const sumRel = rel.reduce((a, b) => a + b, 0);
    const logTotal = maxL + Math.log(sumRel);
    const probs = rel.map(v => v / sumRel);
    let peakIdx = 0;
    for (let i = 1; i < probs.length; i++) if (probs[i] > probs[peakIdx]) peakIdx = i;
    return {
      NA, NB, Q,
      logW,
      probs,
      logTotal,
      totalW: Math.exp(logTotal),
      peakQ: peakIdx,
      peakProb: probs[peakIdx],
      peakSoverK: logW[peakIdx],
      edgeProb: probs[0],
      expectedQ: Q * NA / (NA + NB)
    };
  }

  function stepEnergyWalker(state, NA, NB, rng) {
    // Microcanonical Metropolis-style random quantum swap between two Einstein solids:
    // pick a quantum uniformly from box A or B? To sample exact multiplicity uniformly,
    // pick a random oscillator in A+B to lose a quantum (if non-empty) vs detailed balance:
    // P(qA -> qA+1) proportional to W(qA+1)/W(qA) = (qA+NA)*(Q-qA) / ((qA+1)*(Q-qA+NB-1))
    const qA = state.qA, Q = state.Q, qB = Q - qA;
    const goRight = rng() < 0.5;
    if (goRight && qA > 0) {
      // qA -> qA - 1
      const ratio = (qA * (qB + NB)) / ((qA + NA - 1) * (qB + 1));
      if (ratio >= 1 || rng() < ratio) state.qA = qA - 1;
    } else if (!goRight && qB > 0) {
      // qA -> qA + 1
      const ratio = ((qA + NA) * qB) / ((qA + 1) * (qB + NB - 1));
      if (ratio >= 1 || rng() < ratio) state.qA = qA + 1;
    }
    state.steps++;
    state.hist[state.qA] = (state.hist[state.qA] || 0) + 1;
    return state;
  }

  // Lattice mixing: M sites on left (initially all A) and M sites on right (initially all B).
  // When k particles of A sit on the right (and k of B on the left): W(k) = C(M,k)^2.
  function mixingDist(M) {
    const logW = [];
    let maxL = -Infinity;
    for (let k = 0; k <= M; k++) {
      const l = 2 * logComb(M, k);
      logW.push(l);
      if (l > maxL) maxL = l;
    }
    const rel = logW.map(l => Math.exp(l - maxL));
    const sumRel = rel.reduce((a, b) => a + b, 0);
    const logTotal = maxL + Math.log(sumRel); // equals logComb(2*M, M)
    const probs = rel.map(v => v / sumRel);
    const peakK = Math.floor(M / 2);
    return {
      M,
      logW,
      probs,
      logTotal,
      totalW: Math.exp(logTotal),
      peakK,
      peakProb: probs[peakK],
      peakSoverK: logW[peakK],
      unmixedW: 1
    };
  }

  function stepMixingWalker(state, M, rng) {
    // Swap one random site from left half with one random site from right half (or random pair in 2M sites)
    const grid = state.grid;
    const i = Math.floor(rng() * (2 * M));
    const j = Math.floor(rng() * (2 * M));
    if (i !== j) {
      const tmp = grid[i];
      grid[i] = grid[j];
      grid[j] = tmp;
    }
    let k = 0;
    for (let idx = M; idx < 2 * M; idx++) if (grid[idx] === 1) k++;
    state.k = k;
    state.steps++;
    state.hist[k] = (state.hist[k] || 0) + 1;
    return state;
  }

  /* ── Ch2: Boltzmann factor from counting thermal bath states ── */
  // Target system has 4 levels E_m = m * dE (kJ/mol), m = 0,1,2,3.
  // Thermal bath is an Einstein solid of NB oscillators with quantum spacing eps = 1 kJ/mol.
  // At canonical temperature T, average occupation nbar = 1/(exp(eps/(RT)) - 1), so QB = round(NB * nbar).
  function boltzmannVsBath(T, dE, NB) {
    const eps = 1.0; // kJ/mol per bath quantum
    const RT_kJ = R * T / 1000;
    const nbar = 1 / (Math.exp(eps / RT_kJ) - 1);
    const QB = Math.max(Math.round(3 * dE) + 2, Math.round(NB * nbar));
    const levels = [0, 1, 2, 3];

    // Canonical Boltzmann
    const wB = levels.map(m => Math.exp(-(m * dE) / RT_kJ));
    const ZB = wB.reduce((a, b) => a + b, 0);
    const pBoltz = wB.map(w => w / ZB);

    // Exact finite-bath state counting: W_bath(QB - q_m)
    const logWB = levels.map(m => {
      const q = Math.round(m * dE);
      if (q > QB) return -Infinity;
      return logComb(QB - q + NB - 1, QB - q);
    });
    const maxL = Math.max(...logWB);
    const relW = logWB.map(l => Math.exp(l - maxL));
    const ZW = relW.reduce((a, b) => a + b, 0);
    const pBath = relW.map(w => w / ZW);

    // Bath temperature derived from finite bath slope: 1/(kT_eff) ~ ln((QB+NB)/QB)/eps
    const bathGain1 = Math.exp(logWB[1] - logWB[0]); // exact W(QB - dE)/W(QB)
    const boltzFactor1 = Math.exp(-dE / RT_kJ);
    const meanE = levels.reduce((s, m, i) => s + m * dE * pBoltz[i], 0);
    const excitedSum = 1 - pBoltz[0];
    return {
      T, dE, NB, QB, RT_kJ,
      levels,
      pBoltz,
      pBath,
      bathGain1,
      boltzFactor1,
      meanE,
      excitedSum
    };
  }

  /* ── Ch3: dG = dH - T dS and four-quadrant real reactions (OpenStax Appendix G / NIST-JANAF, 298.15 K) ── */
  const REACTIONS = [
    // Q1: dH > 0, dS > 0 (endothermic, entropy-driven)
    { id: 'nh4no3', dH: 28.06, dS: 108.7, q: 1, aq: true },      // NH4NO3(s) -> NH4+(aq) + NO3-(aq)
    { id: 'n2o4',   dH: 57.12, dS: 175.70, q: 1, aq: false },    // N2O4(g) -> 2 NO2(g)
    { id: 'caco3',  dH: 178.5, dS: 160.3, q: 1, aq: false },     // CaCO3(s) -> CaO(s) + CO2(g)
    // Q2: dH < 0, dS > 0 (always spontaneous)
    { id: 'h2o2',   dH: -196.1, dS: 125.8, q: 2, aq: false },    // 2 H2O2(l) -> 2 H2O(l) + O2(g)
    // Q3: dH < 0, dS < 0 (enthalpy-driven at low T)
    { id: 'nh3',    dH: -91.80, dS: -198.11, q: 3, aq: false },  // N2(g) + 3 H2(g) -> 2 NH3(g)
    { id: 'h2o',    dH: -483.64, dS: -88.76, q: 3, aq: false },  // 2 H2(g) + O2(g) -> 2 H2O(g)
    // Q4: dH > 0, dS < 0 (never thermally spontaneous)
    { id: 'o3',     dH: 285.4, dS: -137.4, q: 4, aq: false }     // 3 O2(g) -> 2 O3(g)
  ];

  function evalReaction(id, T) {
    const r = REACTIONS.find(x => x.id === id) || REACTIONS[0];
    const dG = r.dH - T * (r.dS / 1000);         // kJ/mol
    const dS_env = -r.dH * 1000 / T;             // J/(mol K)
    const dS_tot = r.dS + dS_env;                // J/(mol K), equals -dG*1000/T
    const Tcross = (r.dH * r.dS > 0) ? (r.dH * 1000 / r.dS) : null;
    return { ...r, T, dG, dS_env, dS_tot, Tcross, spontaneous: dG < 0 };
  }

  /* ── Ch4: G(xi) vs extent of reaction, Q, K, Le Chatelier, van 't Hoff ── */
  const EQ_SYSTEMS = {
    n2o4: { id: 'n2o4', dH: 57120, dS: 175.70, dN: 1 },  // N2O4(g) <-> 2 NO2(g)
    nh3:  { id: 'nh3',  dH: -91800, dS: -198.11, dN: -2 } // N2(g) + 3 H2(g) <-> 2 NH3(g)
  };

  function eqThermo(sysId, T) {
    const s = EQ_SYSTEMS[sysId] || EQ_SYSTEMS.n2o4;
    const dG0 = s.dH - T * s.dS; // J/mol
    const K = Math.exp(-dG0 / (R * T));
    return { ...s, T, dG0, K };
  }

  // System Gibbs energy G(xi) - G(0) in kJ/mol (for 1 mol initial N2O4, or 1 mol N2 + 3 mol H2)
  function gibbsExtent(sysId, T, P, xi) {
    const th = eqThermo(sysId, T);
    const RT_kJ = R * T / 1000;
    const eps = 1e-6;
    const x = clamp(xi, eps, 1 - eps);
    if (sysId === 'nh3') {
      const nN2 = 1 - x, nH2 = 3 * (1 - x), nNH3 = 2 * x, nTot = 4 - 2 * x;
      const xN2 = nN2 / nTot, xH2 = nH2 / nTot, xNH3 = nNH3 / nTot;
      // Reference G(0) = G_pure(1 N2 + 3 H2 at P) = 4 RT ln(P) + mixing of 1:3
      const gMix0 = RT_kJ * (1 * Math.log(0.25 * P) + 3 * Math.log(0.75 * P));
      const g = x * (th.dG0 / 1000) + RT_kJ * (nN2 * Math.log(xN2 * P) + nH2 * Math.log(xH2 * P) + nNH3 * Math.log(xNH3 * P)) - gMix0;
      const Q = (Math.pow(xNH3 * P, 2)) / (xN2 * P * Math.pow(xH2 * P, 3));
      const dGdxi = th.dG0 / 1000 + RT_kJ * Math.log(Q);
      return { G: g, Q, dGdxi, K: th.K, dG0: th.dG0 / 1000, comp: [xN2, xH2, xNH3] };
    }
    // n2o4: N2O4(g) <-> 2 NO2(g)
    const n1 = 1 - x, n2 = 2 * x, nTot = 1 + x;
    const x1 = n1 / nTot, x2 = n2 / nTot;
    const g0 = RT_kJ * Math.log(P);
    const g = x * (th.dG0 / 1000) + RT_kJ * (n1 * Math.log(x1 * P) + n2 * Math.log(x2 * P)) - g0;
    const Q = Math.pow(x2 * P, 2) / (x1 * P);
    const dGdxi = th.dG0 / 1000 + RT_kJ * Math.log(Q);
    return { G: g, Q, dGdxi, K: th.K, dG0: th.dG0 / 1000, comp: [x1, x2] };
  }

  function eqExtent(sysId, T, P) {
    const th = eqThermo(sysId, T);
    if (sysId === 'n2o4') {
      // K = 4*x^2 / (1-x^2) * P => x = sqrt(K / (K + 4P))
      const xi = Math.sqrt(th.K / (th.K + 4 * P));
      return { xi, K: th.K, dG0: th.dG0 / 1000, xProd: (2 * xi) / (1 + xi) };
    }
    // nh3: K = [4 x^2 (4-2x)^2] / [27 (1-x)^4 P^2]
    let lo = 0, hi = 0.999999;
    for (let i = 0; i < 70; i++) {
      const x = 0.5 * (lo + hi);
      const lhs = (4 * x * x * Math.pow(4 - 2 * x, 2)) / (27 * Math.pow(1 - x, 4) * P * P);
      if (lhs < th.K) lo = x; else hi = x;
    }
    const xi = 0.5 * (lo + hi);
    return { xi, K: th.K, dG0: th.dG0 / 1000, xProd: (2 * xi) / (4 - 2 * xi) };
  }

  /* ── Ch5: Kinetics vs Thermodynamics (A <-> B reversible ODE + Arrhenius) ── */
  // Baseline barrier Ea0 = 60 kJ/mol from A (if dG0 < 0) or from B (if dG0 > 0) so the transition state sits above both.
  // Catalyst lowers Ea by dEcat for BOTH forward and reverse identically => K = kf/kr is invariant!
  function kineticsParams(T, dG0_kJ, dEcat_kJ) {
    const RT_kJ = R * T / 1000;
    const EaBase = 55; // kJ/mol reference barrier above max(G_A, G_B)
    const tsG = Math.max(0, dG0_kJ) + EaBase - dEcat_kJ;
    const EaF = tsG;
    const EaR = tsG - dG0_kJ;
    // Scale pre-exponential A0 so default (T=320K, dEcat=0) settles in ~12 s, catalyst speeds dramatically
    const A0 = 1.6e8;
    const kf = A0 * Math.exp(-EaF / RT_kJ);
    const kr = A0 * Math.exp(-EaR / RT_kJ);
    const K = Math.exp(-dG0_kJ / RT_kJ); // identical to kf/kr
    const Aeq = 1 / (1 + K);
    const Beq = K / (1 + K);
    const tau = 1 / (kf + kr);
    const tHalf = Math.LN2 * tau;
    return { T, dG0_kJ, dEcat_kJ, tsG, EaF, EaR, kf, kr, K, Aeq, Beq, tau, tHalf };
  }

  // Exact analytical solution for A(t) starting from A(0) = 1, B(0) = 0:
  // A(t) = Aeq + (1 - Aeq) * exp(-(kf + kr) * t)
  function kineticsAt(params, t) {
    const A = params.Aeq + (1 - params.Aeq) * Math.exp(-(params.kf + params.kr) * t);
    return { t, A, B: 1 - A };
  }

  /* ── Ch6: Coupling (ATP hydrolysis + Electrochemistry + Ellingham diagram) ── */
  const ATP_STD = {
    dG0_atp: -30.5,  // kJ/mol, biochemical standard state pH 7, 25 C (Lehninger / BioNumbers)
    dG0_g6p: 13.8,   // kJ/mol, Glucose + Pi -> Glucose-6-phosphate + H2O (Lehninger)
    T_cell: 310.15   // K (37 C)
  };

  function atpCoupling(ratioAtpAdp, pi_mM, T = ATP_STD.T_cell) {
    const pi_M = pi_mM / 1000;
    // Q_atp = ([ADP]*[Pi]) / [ATP] = [Pi]_M / ratio
    const Q_atp = pi_M / ratioAtpAdp;
    const RT_kJ = R * T / 1000;
    const dG_atp = ATP_STD.dG0_atp + RT_kJ * Math.log(Q_atp);
    const dG_net = ATP_STD.dG0_g6p + dG_atp;
    const E_equiv = -dG_atp * 1000 / (2 * F); // equivalent 2-electron potential, V
    return {
      ratioAtpAdp, pi_mM, T,
      dG0_atp: ATP_STD.dG0_atp,
      dG_g6p: ATP_STD.dG0_g6p,
      dG_atp,
      dG_net,
      spontaneous: dG_net < 0,
      E_equiv
    };
  }

  // Ellingham diagram lines per mol O2(g) from OpenStax Chemistry 2e Appendix G (298.15 K values, kJ/mol O2 and J/(mol O2 K))
  const ELLINGHAM_LINES = [
    { id: 'co',    dH: 2 * (-110.52),     dS: 2 * 197.67 - (2 * 5.740 + 205.14), isCarbon: true },
    { id: 'co2',   dH: -393.51,           dS: 213.78 - (5.740 + 205.14),         isCarbon: true },
    { id: 'feo',   dH: 2 * (-272.0),      dS: 2 * 60.75 - (2 * 27.3 + 205.14) },
    { id: 'zno',   dH: 2 * (-350.5),      dS: 2 * 43.7 - (2 * 41.6 + 205.14) },
    { id: 'tio2',  dH: -944.0,            dS: 50.6 - (30.7 + 205.14) },
    { id: 'al2o3', dH: (2 / 3) * (-1675.7), dS: (2 / 3) * 50.92 - ((4 / 3) * 28.3 + 205.14) },
    { id: 'mgo',   dH: 2 * (-601.70),     dS: 2 * 26.94 - (2 * 32.68 + 205.14) }
  ];

  function ellinghamDG(id, T) {
    const l = ELLINGHAM_LINES.find(x => x.id === id);
    return l.dH - T * (l.dS / 1000); // kJ per mol O2
  }

  function ellinghamAnalysis(oxideId, T) {
    const ox = ELLINGHAM_LINES.find(x => x.id === oxideId) || ELLINGHAM_LINES[2];
    const co = ELLINGHAM_LINES[0];
    const co2 = ELLINGHAM_LINES[1];
    const dG_ox = ellinghamDG(ox.id, T);
    const dG_co = ellinghamDG('co', T);
    const dG_co2 = ellinghamDG('co2', T);
    // Carbon reducing agent uses the lower of C->CO and C->CO2 at temperature T
    const carbonLine = dG_co < dG_co2 ? 'co' : 'co2';
    const dG_c = Math.min(dG_co, dG_co2);
    // Net reaction: oxide_red + C -> M + CO/CO2 => dG_red = dG_c - dG_ox (per mol O2)
    const dG_red_CO = dG_co - dG_ox;
    // Crossover with 2C + O2 -> 2CO
    const Tcross = (ox.dH - co.dH) / ((ox.dS - co.dS) / 1000);
    // Minimum electrolysis voltage to split oxide directly (O2 evolves -> n = 4 e- per mol O2)
    const E_min_pure = (-dG_ox * 1000) / (4 * F);
    // With carbon anode forming CO2 (Hall-Heroult style): net dG = dG_co2 - dG_ox
    const E_min_carbonAnode = Math.max(0, ((dG_co2 - dG_ox) * 1000) / (4 * F));
    return {
      oxideId: ox.id, T,
      dG_ox, dG_co, dG_co2, dG_c, carbonLine,
      dG_red_CO,
      canSmeltWithCO: dG_red_CO < 0,
      Tcross,
      E_min_pure,
      E_min_carbonAnode
    };
  }

  /* ── Ch7: Haber-Bosch plant simulator (Gillespie-Beattie 1930 + Temkin-inspired kinetics) ── */
  function haberKa(T) {
    // Gillespie & Beattie (1930): log10 Ka for 1/2 N2 + 3/2 H2 <-> NH3 (atm^-1)
    const log10Ka = -2.691122 * Math.log10(T) - 5.519265e-5 * T + 1.848863e-7 * T * T + 2001.6 / T + 2.6899;
    return Math.pow(10, log10Ka);
  }

  function haberEqConversion(T, P_bar) {
    // 1 bar ~ 0.986923 atm; Gillespie-Beattie uses atm
    const P = P_bar / 1.01325;
    const Ka = haberKa(T);
    let lo = 0, hi = 0.999999;
    for (let i = 0; i < 64; i++) {
      const x = 0.5 * (lo + hi);
      const Qa = (2 * x * (4 - 2 * x)) / (3 * Math.sqrt(3) * (1 - x) * (1 - x) * P);
      if (Qa < Ka) lo = x; else hi = x;
    }
    const xi = 0.5 * (lo + hi);
    return { xi, yNH3: (2 * xi) / (4 - 2 * xi), Ka };
  }

  // Tuned k0 = 0.28 at Tref = 723.15 K (450 C) and Ea = 120 kJ/mol so single-pass NH3 yield matches
  // industrial ~10–18% outlet NH3 mole fraction at 450 C, 200 bar, tau = 1. Marked "tuned" in BRIEF.md.
  function haberReactor(T_C, P_bar, tau = 1.0) {
    const T = T_C + 273.15;
    const P = P_bar / 1.01325;
    const Ka = haberKa(T);
    const eq = haberEqConversion(T, P_bar);
    const Ea = 120000;   // J/mol, apparent Ea over promoted Fe catalyst
    const k0 = 0.28;     // tuned pre-factor for residence time tau = 1
    const Tref = 723.15; // 450 C
    const kf = k0 * Math.exp((-Ea / R) * (1 / T - 1 / Tref)) * Math.sqrt(P_bar / 200);
    let x = 0;
    if (kf * tau > 12) {
      x = eq.xi;
    } else {
      const N = Math.max(80, Math.ceil(kf * tau * 40));
      const ds = tau / N;
      for (let i = 0; i < N; i++) {
        const Qa = (2 * x * (4 - 2 * x)) / (3 * Math.sqrt(3) * (1 - x) * (1 - x) * P);
        const rate = kf * (1 - x) * Math.max(0, 1 - Qa / Ka);
        x = Math.min(eq.xi, x + rate * ds);
      }
    }
    const yNH3 = (2 * x) / (4 - 2 * x);
    // Ideal isothermal compression work for 2 mol gas (N2 + 3H2 = 4 mol -> 2 mol NH3, so 2 mol feed per mol NH3)
    // plus recycle loop penalty (assuming ~15 bar loop pressure drop per pass: (1/x - 1) recycle passes)
    const compFresh_kJ_per_molNH3 = (2 * R * 300 * Math.log(Math.max(1, P_bar)) / 1000);
    const loopPasses = x > 0.01 ? (1 / x) : 100;
    const recycleDrop_kJ = x > 0.01 ? 2 * R * 320 * Math.log((P_bar + 15) / P_bar) * (loopPasses - 1) / 1000 : Infinity;
    // Overall loop yield assuming condenser separates 90% of NH3 and 3% purge loss per pass
    const purge = 0.03;
    const loopYield = x > 0 ? clamp(x / (x + purge * (1 - x)), 0, 1) : 0;
    return {
      T_C, T, P_bar, tau,
      eqConv: eq.xi,
      eqYNH3: eq.yNH3,
      singleConv: x,
      singleYNH3: yNH3,
      loopYield,
      compFresh_kJ: compFresh_kJ_per_molNH3,
      recycleDrop_kJ,
      kf
    };
  }

  /* ── Ch8: Regular-solution free energy, common tangent, miscibility gap ── */
  function regG(x, w) {
    const u = clamp(x, 1e-9, 1 - 1e-9);
    return u * Math.log(u) + (1 - u) * Math.log(1 - u) + w * u * (1 - u); // g_mix / RT
  }
  function regD1(x, w) {
    const u = clamp(x, 1e-9, 1 - 1e-9);
    return Math.log(u / (1 - u)) + w * (1 - 2 * u);
  }
  function regD2(x, w) {
    const u = clamp(x, 1e-9, 1 - 1e-9);
    return 1 / (u * (1 - u)) - 2 * w;
  }
  function regSpinodal(w) {
    if (w <= 2) return null;
    const d = 0.5 * Math.sqrt(1 - 2 / w);
    return [0.5 - d, 0.5 + d];
  }
  function regBinodal(w) {
    if (w <= 2) return null;
    // Common tangent of symmetric regular solution sits at dg/dx = 0 in (0, 0.5)
    let lo = 1e-12, hi = 0.5 - 1e-9;
    for (let i = 0; i < 80; i++) {
      const m = 0.5 * (lo + hi);
      if (regD1(m, w) < 0) lo = m; else hi = m;
    }
    const xb = 0.5 * (lo + hi);
    return [xb, 1 - xb];
  }
  function regularSolution(ToverTc, x0) {
    // T/Tc = 2/w  =>  w = 2 / (T/Tc)
    const w = 2 / ToverTc;
    const bin = regBinodal(w);
    const spin = regSpinodal(w);
    const gHom = regG(x0, w);
    let twoPhase = false, gEq = gHom, fracBeta = 0, region = 'single';
    if (bin && x0 > bin[0] && x0 < bin[1]) {
      twoPhase = true;
      gEq = regG(bin[0], w); // symmetric tangent is horizontal at g(xb)
      fracBeta = (x0 - bin[0]) / (bin[1] - bin[0]);
      region = (spin && x0 > spin[0] && x0 < spin[1]) ? 'spinodal' : 'binodal';
    }
    const dGsaved = gHom - gEq; // in units of RT (>= 0)
    return {
      ToverTc, w, x0,
      binodal: bin, spinodal: spin,
      gHom, gEq, dGsaved,
      twoPhase, fracBeta, fracAlpha: 1 - fracBeta,
      region
    };
  }

  /* ── Ch9: Frontier thermodynamic floors & dated 2026 data block ── */
  const THERMO_FLOORS = {
    // H2O(l) -> H2(g) + 1/2 O2(g) at 298.15 K (OpenStax Appendix G)
    h2o_dG: 237.13,   // kJ/mol
    h2o_dH: 285.83,   // kJ/mol (HHV)
    h2_lhv: 241.82,   // kJ/mol (water vapor product)
    M_H2: 2.01588,    // g/mol
    M_CO2: 44.0095,   // g/mol
    M_NH3: 17.0305    // g/mol
  };

  function electrolyserMetrics() {
    const V_rev = (THERMO_FLOORS.h2o_dG * 1000) / (2 * F);
    const V_tn = (THERMO_FLOORS.h2o_dH * 1000) / (2 * F);
    const kwh_dG = (THERMO_FLOORS.h2o_dG / THERMO_FLOORS.M_H2) / 3.6;
    const kwh_LHV = (THERMO_FLOORS.h2_lhv / THERMO_FLOORS.M_H2) / 3.6;
    const kwh_HHV = (THERMO_FLOORS.h2o_dH / THERMO_FLOORS.M_H2) / 3.6;
    return { V_rev, V_tn, kwh_dG, kwh_LHV, kwh_HHV };
  }

  // Exact isothermal ideal mixing minimum work to separate 1 mol CO2 from a binary gas at mole fraction c (T = 298.15 K)
  function dacMinWork(ppmOrFrac, isFrac = false, T = 298.15) {
    const c = clamp(isFrac ? ppmOrFrac : ppmOrFrac * 1e-6, 1e-6, 0.99);
    const w_J_mol = -R * T * (Math.log(c) + ((1 - c) / c) * Math.log(1 - c));
    const w_kJ_mol = w_J_mol / 1000;
    const w_GJ_t = w_kJ_mol / THERMO_FLOORS.M_CO2; // kJ/g == GJ/tonne
    return { c, ppm: c * 1e6, T, w_kJ_mol, w_GJ_t };
  }

  function co2rrEnergyEfficiency(E0_cell_V, V_cell_V, fe_pct) {
    const fe = clamp(fe_pct / 100, 0, 1);
    const voltEff = clamp(E0_cell_V / V_cell_V, 0, 1);
    return { fe, voltEff, ee: fe * voltEff };
  }

  // Dated frontier records (all sourced in BRIEF.md; separated into est / demo / claim)
  const FRONTIER = [
    // Established (thermodynamics & global baselines)
    { id: 'h2oFloor', status: 'est', group: 'electrolysis', asOf: 'established', val: 33.3, unit: 'kWh/kg', v2: 39.4 },
    { id: 'dacFloor', status: 'est', group: 'dac', asOf: 'established', val: 0.49, unit: 'GJ/t', v2: 21.8 },
    { id: 'ieaNh3', status: 'est', group: 'ammonia', asOf: '2021-10', val: 41, unit: 'GJ/t', bat: 28, mt: 185, energyPct: 2, co2Pct: 1.3 },
    { id: 'usgsN', status: 'est', group: 'ammonia', asOf: '2026-01', val: 160, unit: 'Mt N' },
    // Demonstrated (peer-reviewed / IEA / operational)
    { id: 'awePem', status: 'demo', group: 'electrolysis', asOf: '2025-2026', val: 52, lo: 48, hi: 65, unit: 'kWh/kg' },
    { id: 'soec', status: 'demo', group: 'electrolysis', asOf: '2025-2026', val: 40, lo: 35, hi: 45, unit: 'kWh/kg' },
    { id: 'dacReal', status: 'demo', group: 'dac', asOf: '2025-2026', val: 7.2, lo: 5.4, hi: 10.8, unit: 'GJ/t' },
    { id: 'mammoth', status: 'demo', group: 'dac', asOf: '2026-07', designKt: 36, h1_2025_t: 119, h1_2026_t: 675 },
    { id: 'liNrrFlow', status: 'demo', group: 'ammonia', asOf: '2024-03', fe: 64, hours: 300, areaCm2: 25 },
    { id: 'co2rrC2h4', status: 'demo', group: 'co2rr', asOf: '2025-2026', feLo: 50, feHi: 75, eeLo: 20, eeHi: 35, vLo: 2.5, vHi: 3.5 },
    { id: 'ocp25', status: 'demo', group: 'catalyst', asOf: '2025', note: 'OMat24/OC25/GNoME critique' },
    // Claimed / project targets
    { id: 'neom', status: 'claim', group: 'ammonia', asOf: '2026-10', gwElec: 2.2, gwRenew: 4.0, mtNh3: 1.2 },
    { id: 'stratos', status: 'claim', group: 'dac', asOf: '2026-10', ktDesign: 500 },
    { id: 'co2rrTarget', status: 'claim', group: 'co2rr', asOf: '2026', feTarget: 80, vTarget: 2.2 }
  ];

  /* ── Live sentence branch selectors (tested in tests/models.cjs) ── */
  const say = {
    ch1(mode, res) {
      if (mode === 'mixing') return 'ch1.say.mixing';
      return res.NA === res.NB ? 'ch1.say.equal' : 'ch1.say.unequal';
    },
    ch2(res) {
      const ratio = res.pBoltz[1] / res.pBoltz[0];
      if (ratio < 0.05) return 'ch2.say.frozen';
      if (ratio > 0.5) return 'ch2.say.hot';
      return 'ch2.say.mid';
    },
    ch3(res) {
      if (res.q === 2) return 'ch3.say.always';
      if (res.q === 4) return 'ch3.say.never';
      return res.spontaneous ? 'ch3.say.go' : 'ch3.say.stop';
    },
    ch4a(xi, eq) {
      if (Math.abs(xi - eq.xi) < 0.025) return 'ch4.say.atEq';
      return xi < eq.xi ? 'ch4.say.fwd' : 'ch4.say.rev';
    },
    ch4b(sysId) {
      return sysId === 'n2o4' ? 'ch4b.say.endo' : 'ch4b.say.exo';
    },
    ch5(dEcat) {
      return dEcat > 0.5 ? 'ch5.say.cat' : 'ch5.say.nocat';
    },
    ch6a(res) {
      return res.spontaneous ? 'ch6.say.go' : 'ch6.say.fail';
    },
    ch6b(res) {
      return res.canSmeltWithCO ? 'ch6.say.carbon' : 'ch6.say.electro';
    },
    ch7(res) {
      if (res.T_C < 380) return 'ch7.say.slow';
      if (res.singleConv < 0.45 * res.eqConv) return 'ch7.say.kinetic';
      if (res.eqConv < 0.25) return 'ch7.say.thermo';
      return 'ch7.say.window';
    },
    ch8(res) {
      if (!res.twoPhase) return res.w <= 2 ? 'ch8.say.mixed' : 'ch8.say.outside';
      return res.region === 'spinodal' ? 'ch8.say.spinodal' : 'ch8.say.binodal';
    },
    ch9(mode) {
      return 'ch9.say.' + mode;
    }
  };

  return {
    R, F, kB, clamp, lerp,
    lgamma, logComb, mulberry32,
    einsteinDist, stepEnergyWalker, mixingDist, stepMixingWalker,
    boltzmannVsBath,
    REACTIONS, evalReaction,
    EQ_SYSTEMS, eqThermo, gibbsExtent, eqExtent,
    kineticsParams, kineticsAt,
    ATP_STD, atpCoupling,
    ELLINGHAM_LINES, ellinghamDG, ellinghamAnalysis,
    haberKa, haberEqConversion, haberReactor,
    regG, regD1, regD2, regSpinodal, regBinodal, regularSolution,
    THERMO_FLOORS, electrolyserMetrics, dacMinWork, co2rrEnergyEfficiency,
    FRONTIER, say
  };
});
