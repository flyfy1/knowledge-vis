/* Why can't a battery just hold more? — the page's models as plain functions.
   UMD: window.BatteryModels in the page, module.exports in node. No visible text here.
   Every model names its source in BRIEF.md; parameters that are assumptions are marked "assumption". */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.BatteryModels = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const F = 96485.33212;        // C/mol, Faraday constant (CODATA 2018, exact)
  const R = 8.314462618;        // J/(mol K)
  const SIGMA = 5.670374419e-8; // W/(m2 K4)
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ───────── atomic masses (IUPAC 2021 abridged) and formula masses ───────── */
  const A = { Li: 6.94, C: 12.011, Si: 28.085, O: 15.999, Co: 58.933, Ni: 58.693, Mn: 54.938, Fe: 55.845, P: 30.974, Na: 22.990 };
  const molar = {
    Li: A.Li,
    C6: 6 * A.C,
    Si: A.Si,
    LiCoO2: A.Li + A.Co + 2 * A.O,
    NMC811: A.Li + 0.8 * A.Ni + 0.1 * A.Mn + 0.1 * A.Co + 2 * A.O,
    LiFePO4: A.Li + A.Fe + A.P + 4 * A.O
  };
  // theoretical specific capacity in mAh/g: n·F / (3.6·M)
  const capacity = (n, M) => n * F / (3.6 * M);

  /* ───────── OCV fits from published data (PyBaMM parameter sets) ───────── */
  // graphite, LG M50: Chen et al., J. Electrochem. Soc. 167 (2020) 080534
  const Ugr = x => 1.9793 * Math.exp(-39.3631 * x) + 0.2482 - 0.0909 * Math.tanh(29.8538 * (x - 0.1234))
    - 0.04478 * Math.tanh(14.9159 * (x - 0.2769)) - 0.0205 * Math.tanh(30.4444 * (x - 0.6103));
  // NMC811, LG M50: same source
  const Unmc = y => -0.8090 * y + 4.4875 - 0.0428 * Math.tanh(18.5138 * (y - 0.5542))
    - 17.7326 * Math.tanh(15.7890 * (y - 0.3117)) + 17.5842 * Math.tanh(15.9308 * (y - 0.3120));
  // LFP: Afshar, Morris & Khajepour (2017), arXiv:1709.03970, as used in PyBaMM's Prada2013 set
  const Ulfp = y => 3.4077 - 0.020269 * y + 0.5 * Math.exp(-150 * y) - 0.9 * Math.exp(-30 * (1 - y));
  // stoichiometry windows (0% → 100% state of charge)
  const WIN = {
    nmcCell: { x0: 0.0279, x1: 0.9014, y0: 0.9084, y1: 0.2661 },      // Chen 2020 (LG M50)
    lfpCell: { x0: 0.81 - 2.3 / 2.9147, x1: 0.81, y0: 0.0038 + 2.3 / 3.2925, y1: 0.0038 } // PyBaMM Prada2013 set, 2.3 Ah balance
  };
  const meanOf = (f, a, b, n = 2000) => { let s = 0; for (let i = 0; i < n; i++) s += f(a + (b - a) * (i + 0.5) / n); return s / n; };
  const ocv = {
    Ugr, Unmc, Ulfp,
    nmcCell(s) { const w = WIN.nmcCell; return Unmc(lerp(w.y0, w.y1, s)) - Ugr(lerp(w.x0, w.x1, s)); },
    lfpCell(s) { const w = WIN.lfpCell; return Ulfp(lerp(w.y0, w.y1, s)) - Ugr(lerp(w.x0, w.x1, s)); },
    // average electrode potentials vs Li/Li+ over the cell's working window
    avgGraphite: () => meanOf(Ugr, WIN.nmcCell.x0, WIN.nmcCell.x1),
    avgNmc: () => meanOf(Unmc, WIN.nmcCell.y1, WIN.nmcCell.y0),
    avgLfp: () => meanOf(Ulfp, 0.02, 0.98),
    slope(cell, s, h = 0.005) { const a = clamp(s - h, 0, 1), b = clamp(s + h, 0, 1); return (ocv[cell](b) - ocv[cell](a)) / (b - a); } // V per unit SoC
  };

  /* ───────── ch1 electrochemical series ───────── */
  // E° vs SHE, V. Aqueous couples: OpenStax Chemistry 2e, Appendix L. Insertion electrodes: average potential vs Li/Li+
  // (from the OCV fits above, or ~3.9 V for LiCoO2) converted with E(Li+/Li) = −3.04 V.
  const E_LI = -3.04;
  const electrodes = [
    { id: 'li', E: E_LI, n: 1 },
    { id: 'graphite', E: E_LI + ocv.avgGraphite(), n: 1, insertion: true },
    { id: 'zn', E: -0.7618, n: 2 },
    { id: 'pb', E: -0.3505, n: 2 },        // PbSO4 + 2e- → Pb + SO4^2-
    { id: 'h2', E: 0.00, n: 2 },
    { id: 'cu', E: 0.337, n: 2 },
    { id: 'lfp', E: E_LI + ocv.avgLfp(), n: 1, insertion: true },
    { id: 'nmc', E: E_LI + ocv.avgNmc(), n: 1, insertion: true },
    { id: 'ag', E: 0.7996, n: 1 },
    { id: 'lco', E: E_LI + 3.9, n: 1, insertion: true },
    { id: 'o2', E: 1.229, n: 4 },
    { id: 'pbo2', E: 1.69, n: 2 }          // PbO2 + SO4^2- + 4H+ + 2e- → PbSO4 + 2H2O
  ];
  const WATER = { h2: -0.414, o2: 0.815 }; // water stability at pH 7: E(H+/H2) and E(O2/H2O) shifted by −0.0592·7
  function cell(anodeId, cathodeId) {
    const a = electrodes.find(e => e.id === anodeId), c = electrodes.find(e => e.id === cathodeId);
    const E = c.E - a.E;
    return {
      E, dG: -F * E / 1000,               // kJ per mole of electrons transferred
      reducesWater: a.E < WATER.h2, oxidisesWater: c.E > WATER.o2,
      reversed: E < 0
    };
  }

  /* ───────── ch2 capacity ladder: theory → cell ───────── */
  // practical capacities (mAh/g) and potentials vs Li/Li+ (V)
  const CATHODES = {
    lco: { th: capacity(1, molar.LiCoO2), pr: 140, V: 3.9 },                 // practical ~140 (Manthiram 2020); ~4 V
    nmc: { th: capacity(1, molar.NMC811), pr: 200, V: ocv.avgNmc() },         // ~200 (Frith 2023, NCA); NMC811 175–205 (Micromachines 2025)
    lfp: { th: capacity(1, molar.LiFePO4), pr: 160, V: ocv.avgLfp() }         // ~160 (Frith 2023)
  };
  const ANODES = {
    graphite: { th: capacity(1, molar.C6), pr: 350, V: ocv.avgGraphite(), np: 1.04, fAct: 0.96 },   // ~350 reversible (Frith 2023); N/P of an ID.3 cell
    blend: { th: 0.9 * capacity(1, molar.C6) + 0.1 * capacity(3.75, molar.Si), pr: 0.9 * 350 + 0.1 * 2000, V: ocv.avgGraphite(), np: 1.04, fAct: 0.96 }, // 10 wt% Si; V assumption
    silicon: { th: capacity(3.75, molar.Si), pr: 2000, V: 0.4, np: 1.04, fAct: 0.96 },              // Li15Si4; ~2000 reversible (Frith 2023); V ≈ 0.4: assumption
    li: { th: capacity(1, molar.Li), pr: capacity(1, molar.Li), V: 0, np: 2.0, fAct: 1.0 }           // N/P 2 for a lithium-metal foil: assumption
  };
  const STACK = {
    fActCathode: 0.96,      // active material share of the coating (assumption, typical 94–97 %)
    alFoil: 16e-4, cuFoil: 12e-4, // cm; LG M50 (Chen 2020)
    sep: 12e-4, sepPorosity: 0.47, rhoPE: 0.95, // cm, –, g/cm3; LG M50 separator (Chen 2020), polyethylene density
    rhoAl: 2.70, rhoCu: 8.96,
    electrolyte: 1.0,       // g per Ah: VW ID.3 pouch cell teardown (Frith 2023, Table 1)
    housing: 0.20           // can, tabs, insulators and everything else, share of cell mass: tuned so NMC/graphite lands at the top of 245–270 Wh/kg (Frith 2023)
  };
  // returns the waterfall: each step's cumulative mass (g/Ah) and specific energy (Wh/kg)
  function ladder(cathodeId, anodeId, areal = 5) {
    const c = CATHODES[cathodeId], a = ANODES[anodeId], S = STACK;
    const Vth = c.V - a.V;
    const steps = [];
    const push = (key, m, V) => steps.push({ key, m, V, whkg: 1000 * V / m });
    let m = 1000 / c.th + 1000 / a.th; push('theory', m, Vth);
    const mc = 1000 / c.pr, ma = 1000 / a.pr;
    m = mc + ma; push('usable', m, Vth);
    m = mc / S.fActCathode + ma / a.fAct; push('binder', m, Vth);
    m = mc / S.fActCathode + a.np * ma / a.fAct; push('excess', m, Vth);
    const area = 1000 / areal;            // cm² of cathode face per Ah
    m += area / 2 * (S.alFoil * S.rhoAl + S.cuFoil * S.rhoCu); push('foils', m, Vth);
    m += area * S.sep * (1 - S.sepPorosity) * S.rhoPE; push('separator', m, Vth);
    m += S.electrolyte; push('electrolyte', m, Vth);
    m = m / (1 - S.housing); push('housing', m, Vth);
    return steps;
  }
  const finalWhkg = (c, a, areal) => { const s = ladder(c, a, areal); return s[s.length - 1].whkg; };

  /* ───────── ch3 lattice gas (regular solution) and real OCV curves ───────── */
  // E(x) = E0 − (RT/F)·ln(x/(1−x)) − (Ω/F)(1−2x), x = filled fraction of host sites, w = Ω/RT
  const T25 = 298.15;
  function latticeE(x, w, E0 = 0) { return E0 - (R * T25 / F) * (Math.log(x / (1 - x)) + w * (1 - 2 * x)); }
  // equilibrium (Maxwell / common-tangent) curve: for w > 2 a flat plateau at E0 between the binodal points
  function binodal(w) {
    if (w <= 2) return null;
    // solve ln(x/(1−x)) + w(1−2x) = 0 for x in (0, 0.5)
    let lo = 1e-12, hi = 0.5 - 1e-9;
    const g = x => Math.log(x / (1 - x)) + w * (1 - 2 * x);
    for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (g(lo) * g(m) <= 0) hi = m; else lo = m; }
    const xb = (lo + hi) / 2;
    return [xb, 1 - xb];
  }
  function latticeEq(x, w, E0 = 0) { const b = binodal(w); if (b && x > b[0] && x < b[1]) return E0; return latticeE(x, w, E0); }
  const latticeSlopeMid = w => -(R * T25 / F) * (4 - 2 * w); // dE/dx at x = 1/2 of the single-phase curve (V per unit x)
  // SoC uncertainty from a voltage error σ (V) on a cell OCV curve: σ / |dV/dSoC|
  function socError(cellId, s, sigma) { const k = Math.abs(ocv.slope(cellId, s)); return k > 0 ? sigma / k : Infinity; }

  /* ───────── tridiagonal solver and spherical diffusion (finite volume, backward Euler) ───────── */
  function thomas(a, b, c, d) {
    const n = d.length, cp = new Float64Array(n), dp = new Float64Array(n), x = new Float64Array(n);
    cp[0] = c[0] / b[0]; dp[0] = d[0] / b[0];
    for (let i = 1; i < n; i++) { const m = b[i] - a[i] * cp[i - 1]; cp[i] = c[i] / m; dp[i] = (d[i] - a[i] * dp[i - 1]) / m; }
    x[n - 1] = dp[n - 1];
    for (let i = n - 2; i >= 0; i--) x[i] = dp[i] - cp[i] * x[i + 1];
    return x;
  }
  // a sphere of radius Rp split into N equal-thickness shells; c = stoichiometry (0..1) per shell
  function makeSphere(N) {
    const dr = 1 / N, V = new Float64Array(N), Af = new Float64Array(N + 1);
    for (let i = 0; i < N; i++) V[i] = ((i + 1) ** 3 - i ** 3) * dr ** 3 / 3; // per unit radius³, ×4π dropped
    for (let i = 0; i <= N; i++) Af[i] = (i * dr) ** 2;
    return { N, dr, V, Af };
  }
  // one implicit step: dc/dt = D ∇²c, inward surface flux q (stoichiometry per second per unit dimensionless radius area)
  // in dimensionless radius ρ = r/Rp, the time constant is τ = Rp²/D; dt in s
  function sphereStep(sp, c, D, Rp, dt, surfFlux) {
    const N = sp.N, k = D * dt / (Rp * Rp), a = new Float64Array(N), b = new Float64Array(N), cc = new Float64Array(N), d = new Float64Array(N);
    for (let i = 0; i < N; i++) {
      const gin = i > 0 ? k * sp.Af[i] / sp.dr : 0, gout = i < N - 1 ? k * sp.Af[i + 1] / sp.dr : 0;
      a[i] = -gin; cc[i] = -gout; b[i] = sp.V[i] + gin + gout; d[i] = sp.V[i] * c[i];
    }
    d[N - 1] += surfFlux * dt * sp.Af[N];
    return thomas(a, b, cc, d);
  }
  const sphereMean = (sp, c) => { let s = 0, v = 0; for (let i = 0; i < sp.N; i++) { s += sp.V[i] * c[i]; v += sp.V[i]; } return s / v; };
  // surface value by linear extrapolation of the last two shells' centres to ρ = 1
  const sphereSurf = (sp, c) => { const n = sp.N; if (n < 2) return c[0]; const r1 = (n - 0.5) * sp.dr, r0 = (n - 1.5) * sp.dr; return c[n - 1] + (c[n - 1] - c[n - 2]) * (1 - r1) / (r1 - r0); };

  /* ───────── ch4 one particle charged at constant current ───────── */
  const PARTICLES = {
    graphite: { R: 5.86e-6, D: 3.3e-14, x0: 0.0279, x1: 0.9014 },   // Chen 2020
    nmc: { R: 5.22e-6, D: 4.0e-15, x0: 0.2661, x1: 0.9084 },        // Chen 2020 (filled on discharge)
    lfp: { R: 5.0e-8, D: 5.9e-18, x0: 0.0038, x1: 0.70 }             // Prada 2013 set in PyBaMM (nanoparticles)
  };
  // charge a particle from x0 at C-rate until its surface reaches x = 1 (full) or the window is filled.
  // particleSim is the stepper (the page advances it frame by frame); particleCharge runs it to the end.
  function particleSim(p, Rp, Crate, N = 40) {
    const sp = makeSphere(N), span = p.x1 - p.x0, tFull = 3600 / Crate;
    const flux = span / tFull / 3; // mean stoichiometry rises by span in tFull; (A·q)/V = 3q for the unit sphere
    const h = Math.min(tFull / 400, 0.2 * Rp * Rp / p.D / N + 1e-9);
    const st = { sp, c: new Float64Array(N).fill(p.x0), t: 0, h, tFull, tau: Rp * Rp / p.D, done: false, full: true, span, x0: p.x0 };
    st.advance = tTarget => {
      while (!st.done && st.t < tTarget) {
        st.c = sphereStep(sp, st.c, p.D, Rp, h, flux); st.t += h;
        if (sphereSurf(sp, st.c) >= 1) { st.done = true; st.full = false; }
        else if (st.t >= tFull * 1.0001) st.done = true;
      }
      return st;
    };
    st.filled = () => (sphereMean(sp, st.c) - p.x0) / span;
    st.surf = () => sphereSurf(sp, st.c);
    return st;
  }
  function particleCharge(p, Rp, Crate, N = 40) {
    const st = particleSim(p, Rp, Crate, N).advance(Infinity);
    return { t: st.t, filled: st.filled(), full: st.full, c: Array.from(st.c), sp: st.sp, tau: st.tau, tFull: st.tFull };
  }

  /* ───────── ch5 single particle model (SPM) of an LG M50 cell, CC-CV charge ───────── */
  const SPM = {
    area: 0.065 * 1.58, Ln: 85.2e-6, Lp: 75.6e-6, en: 0.75, ep: 0.665, Rn: 5.86e-6, Rp: 5.22e-6,
    Dn: 3.3e-14, Dp: 4.0e-15, cnMax: 33133, cpMax: 63104, ce: 1000, kn: 6.48e-7, kp: 3.42e-6,
    EaKn: 35000, EaKp: 17800, EaDn: 30300, EaDp: 25000, EaR: 17000,   // Chen 2020; O'Kane 2022 (diffusion); electrolyte (O'Kane 2022)
    Rohm: 0.020, // Ω, lumped electrolyte + contact resistance at 25 °C: assumption (tuned order of magnitude)
    Q: 5.0, Vmax: 4.2, x0: 0.0279, x1: 0.9014, y0: 0.9084, y1: 0.2661, Tref: 298.15
  };
  // usable charge of the anode window (C): cmax·Δx·εs·L·area·F — SoC is counted against this, so 100 % is OCV = 4.19 V
  SPM.Qwin = SPM.cnMax * (SPM.x1 - SPM.x0) * SPM.en * SPM.Ln * SPM.area * F;
  // Chen 2020's positive εs (0.665) with cmax = 63104 holds 10 % more charge over its published window than the negative does;
  // scale it so both published windows hold the same charge (0 % ↔ 100 % consistent): εp ≈ 0.603
  SPM.ep = SPM.Qwin / (SPM.cpMax * (SPM.y0 - SPM.y1) * SPM.Lp * SPM.area * F);
  const arr = (Ea, T) => Math.exp(Ea / R * (1 / SPM.Tref - 1 / T));
  function spmCreate(N = 20, soc0 = 0) {
    return { N, sp: makeSphere(N), cn: new Float64Array(N).fill(lerp(SPM.x0, SPM.x1, soc0)), cp: new Float64Array(N).fill(lerp(SPM.y0, SPM.y1, soc0)), t: 0, q: soc0 * SPM.Qwin };
  }
  // voltage and anode potential for a trial current I (A, + = charge), after a step dt from state st, temperature T (K)
  function spmTrial(st, I, dt, T, rScale = 1) {
    const P = SPM, S = st.sp;
    const an = 3 * P.en / (P.Rn * rScale), ap = 3 * P.ep / (P.Rp * rScale);
    const Jn = I / (an * P.Ln * P.area), Jp = -I / (ap * P.Lp * P.area); // A/m² of interface; + = lithium going in
    const Dn = P.Dn * arr(P.EaDn, T), Dp = P.Dp * arr(P.EaDp, T);
    // stoichiometry flux into the sphere per unit dimensionless area: J/(F·cmax) · Rp (dimensionless radius)
    // inward molar flux N = J/F at r = Rp becomes N/(cmax·Rp) per unit dimensionless surface
    const cn = sphereStep(S, st.cn, Dn, P.Rn * rScale, dt, Jn / (F * P.cnMax * P.Rn * rScale));
    const cp = sphereStep(S, st.cp, Dp, P.Rp * rScale, dt, Jp / (F * P.cpMax * P.Rp * rScale));
    return { cn, cp, ...spmVolt(cn, cp, I, T, S, an, ap) };
  }
  function spmVolt(cn, cp, I, T, S, an, ap) {
    const P = SPM;
    const xs = clamp(sphereSurf(S, cn), 1e-6, 1 - 1e-6), ys = clamp(sphereSurf(S, cp), 1e-6, 1 - 1e-6);
    const j0n = P.kn * arr(P.EaKn, T) * Math.sqrt(P.ce * xs * P.cnMax * (1 - xs) * P.cnMax);
    const j0p = P.kp * arr(P.EaKp, T) * Math.sqrt(P.ce * ys * P.cpMax * (1 - ys) * P.cpMax);
    const Jn = I / (an * P.Ln * P.area), Jp = I / (ap * P.Lp * P.area);
    const etaN = 2 * R * T / F * Math.asinh(Jn / (2 * j0n)), etaP = 2 * R * T / F * Math.asinh(Jp / (2 * j0p)); // magnitudes, + on charge
    const Rt = P.Rohm * arr(-P.EaR, T);
    const Un = Ugr(xs), Up = Unmc(ys);
    const V = Up - Un + etaP + etaN + I * Rt;
    return { V, Un, Up, xs, ys, etaN, etaP, Rt, phiN: Un - etaN }; // phiN: anode surface potential vs Li/Li+ (plating if < 0)
  }
  // full CC-CV charge from soc0; returns time series and key times
  function ccCv(Crate, Tc = 25, opts = {}) {
    const T = Tc + 273.15, I0 = Crate * SPM.Q, Icut = SPM.Q / 20, dt = opts.dt || clamp(30 / Crate, 2, 30), rScale = opts.rScale || 1;
    const st = spmCreate(opts.N || 20, opts.soc0 || 0);
    st.q = (opts.soc0 || 0) * SPM.Qwin;
    const P = SPM, an = 3 * P.en / (P.Rn * rScale), ap = 3 * P.ep / (P.Rp * rScale);
    const out = { t: [], V: [], I: [], soc: [], phiN: [], heat: [], heatAll: [] };
    let peakHeatAll = 0, mode = 'cc', tSwitch = null, socSwitch = null, t80 = null, minPhi = Infinity, peakHeat = 0, maxStep = opts.maxSteps || 20000;
    // heat: I²R (ohmic) and I·(V − OCV of the particle averages) (all irreversible losses: ohmic, kinetic, concentration)
    const ocvBulk = () => Unmc(sphereMean(st.sp, st.cp)) - Ugr(sphereMean(st.sp, st.cn));
    const record = (r, I) => { out.t.push(st.t); out.V.push(r.V); out.I.push(I); out.soc.push(st.q / P.Qwin); out.phiN.push(r.phiN); out.heat.push(I * I * r.Rt); out.heatAll.push(Math.max(0, I * (r.V - ocvBulk()))); };
    record(spmVolt(st.cn, st.cp, 0, T, st.sp, an, ap), 0);
    for (let k = 0; k < maxStep; k++) {
      let I = I0, r = spmTrial(st, I, dt, T, rScale);
      if (mode === 'cc' && r.V >= P.Vmax) { mode = 'cv'; tSwitch = st.t; socSwitch = st.q / P.Qwin; }
      if (mode === 'cv') {
        let lo = 0, hi = I0;
        for (let it = 0; it < 40; it++) { const m = (lo + hi) / 2, rr = spmTrial(st, m, dt, T, rScale); if (rr.V > P.Vmax) hi = m; else lo = m; }
        I = lo; r = spmTrial(st, I, dt, T, rScale);
      }
      st.cn = r.cn; st.cp = r.cp; st.t += dt; st.q += I * dt;
      record(r, I);
      minPhi = Math.min(minPhi, r.phiN); peakHeat = Math.max(peakHeat, I * I * r.Rt); peakHeatAll = Math.max(peakHeatAll, out.heatAll[out.heatAll.length - 1]);
      const soc = st.q / P.Qwin;
      if (t80 == null && soc >= 0.8) t80 = st.t;
      if (mode === 'cv' && I < Icut) break;
      if (soc >= 1.02) break;
    }
    const n = out.t.length;
    return { ...out, tEnd: out.t[n - 1], socEnd: out.soc[n - 1], tSwitch, socSwitch, t80, minPhi, peakHeat, peakHeatAll, plating: minPhi < 0 };
  }

  /* ───────── ch6 heating-induced thermal runaway (lumped, two Arrhenius stages) ───────── */
  // Chen H. et al., "A simplified mathematical model for heating-induced thermal runaway of lithium-ion batteries",
  // J. Electrochem. Soc. (2021); 21700 cell, 5 Ah, 3.63 V. Stage I = SEI + anode–electrolyte; stage II = cathode, electrolyte.
  const TR = {
    m: 68.74e-3, cp: 928, A: 4.9645e-3, H: 0.07, eps: 0.8,
    A1: 1.124e14, E1: 1.351e5, dT1: 55,                    // stage I: H_I = cp·55 K
    A2: 6.387e11, E2: 1.316e5, n2: 7.5, dT2: 1.136 * (762.1 - 143), // stage II: H_II = 1.136·cp·(Tmax − T2)
  };
  const hNat = (T, Tamb) => 1.485088 * Math.pow(Math.abs(T - Tamb) / TR.H, 0.25); // laminar natural convection, vertical cylinder
  // heat terms in W at temperature T (K) with remaining reactant c and conversion α
  function trGen(T, c = 1, alpha = 0) {
    const r1 = TR.A1 * Math.exp(-TR.E1 / (R * T)) * c, r2 = TR.A2 * Math.exp(-TR.E2 / (R * T)) * Math.pow(Math.max(0, 1 - alpha), TR.n2);
    return { q1: TR.m * TR.cp * TR.dT1 * r1, q2: TR.m * TR.cp * TR.dT2 * r2, r1, r2 };
  }
  function trLoss(T, Tamb, coolMul = 1) { return TR.A * (coolMul * hNat(T, Tamb) * (T - Tamb) + TR.eps * SIGMA * (T ** 4 - Tamb ** 4)); }
  function trRun(TambC, opts = {}) {
    const Tamb = TambC + 273.15, coolMul = opts.cool || 1, Pext = opts.Pext || 0, tMax = opts.tMax || 6 * 3600;
    let T = (opts.T0C != null ? opts.T0C : 20) + 273.15, c = 1, alpha = 0, t = 0, dt = 0.5, Tpeak = T, tRun = null;
    const series = [[0, T - 273.15, 1, 0]];
    while (t < tMax) {
      const g = trGen(T, c, alpha), loss = trLoss(T, Tamb, coolMul);
      const dTdt = (g.q1 + g.q2 + Pext - loss) / (TR.m * TR.cp);
      const h = dTdt > 1 ? Math.min(0.5, 0.5 / dTdt) : dt; // keep each step under ~0.5 K
      c = Math.max(0, c - g.r1 * h); // dc/dt = −A1 e^{−E1/RT} c (r1 already carries c)
      alpha = Math.min(1, alpha + g.r2 * h);
      T += dTdt * h; t += h;
      if (T > Tpeak) Tpeak = T;
      if (tRun == null && T - 273.15 > 300) tRun = t;
      if (series.length < 4000 && (series.length === 0 || t - series[series.length - 1][0] >= (tRun ? 0.5 : 20))) series.push([t, T - 273.15, c, alpha]);
      if (tRun != null && t > tRun + 120) break;
    }
    return { runaway: tRun != null, tRun, Tpeak: Tpeak - 273.15, series, Tend: T - 273.15 };
  }
  // the critical ambient temperature (°C) by bisection on trRun
  function trCritical(opts = {}) {
    let lo = 80, hi = 200;
    if (trRun(lo, opts).runaway) return lo;
    if (!trRun(hi, opts).runaway) return null;
    for (let i = 0; i < 14; i++) { const m = (lo + hi) / 2; if (trRun(m, opts).runaway) hi = m; else lo = m; }
    return (lo + hi) / 2;
  }

  /* ───────── ch7 ageing: Schmalstieg et al. 2014 (NMC/graphite 18650), as implemented in NREL BLAST-Lite ───────── */
  const AGE = {
    cap: 2.15, // Ah
    fitFloor: 0.7, // below 70 % remaining the page draws the curve as extrapolation (the paper's tests end in the 70–80 % region: assumption, see BRIEF)
    soc: [0, 0.008637153, 0.026779514, 0.044921875, 0.063064236, 0.081206597, 0.099348958, 0.117491319, 0.135633681, 0.153776042, 0.171918403, 0.190060764, 0.208203125, 0.226345486, 0.244487847, 0.262630208, 0.280772569, 0.298914931, 0.317057292, 0.335199653, 0.353342014, 0.371484375, 0.389626736, 0.407769097, 0.425911458, 0.444053819, 0.462196181, 0.480338542, 0.498480903, 0.516623264, 0.534765625, 0.552907986, 0.571050347, 0.589192708, 0.607335069, 0.625477431, 0.643619792, 0.661762153, 0.679904514, 0.698046875, 0.716189236, 0.734331597, 0.752473958, 0.770616319, 0.788758681, 0.806901042, 0.825043403, 0.843185764, 0.861328125, 0.879470486, 0.897612847, 0.915755208, 0.933897569, 0.952039931, 0.970182292, 0.988324653, 0.998220486, 1],
    ocv: [3.331, 3.345014187, 3.37917149, 3.411603677, 3.440585632, 3.466289865, 3.490268982, 3.511315401, 3.529946658, 3.547197821, 3.561688798, 3.574972194, 3.586357962, 3.597053683, 3.605506753, 3.613442288, 3.620342753, 3.626380661, 3.632073544, 3.63690387, 3.642079219, 3.646909545, 3.652084894, 3.657605266, 3.663470662, 3.670198615, 3.677444104, 3.686759732, 3.696420384, 3.708323686, 3.720572012, 3.734372943, 3.749553967, 3.765252525, 3.781123596, 3.797857224, 3.814590852, 3.832532062, 3.849783226, 3.866861877, 3.884458064, 3.900846669, 3.917752809, 3.934831461, 3.953462717, 3.971921462, 3.991415276, 4.011771649, 4.03195551, 4.05196686, 4.070770628, 4.087849279, 4.104237884, 4.120108955, 4.135980025, 4.152541142, 4.160649189, 4.162]
  };
  function ageV(s) { const S = AGE.soc, O = AGE.ocv; s = clamp(s, 0, 1); let i = 1; while (i < S.length - 1 && S[i] < s) i++; const f = (s - S[i - 1]) / (S[i] - S[i - 1] || 1); return O[i - 1] + f * (O[i] - O[i - 1]); }
  // one usage pattern held constant: mean SoC, depth of each cycle, cycles per day, temperature
  function ageRates(meanSoc, dod, Tc) {
    const T = Tc + 273.15, lo = clamp(meanSoc - dod / 2, 0, 1), hi = clamp(meanSoc + dod / 2, 0, 1);
    let sa = 0, sv2 = 0; const n = 200;
    for (let i = 0; i < n; i++) { const s = lerp(lo, hi, (i + 0.5) / n), V = ageV(s); sa += Math.max(0, 7.543 * V - 23.75) * 1e6 * Math.exp(-6976 / T); sv2 += V * V; }
    const alpha = sa / n, Vrms = Math.sqrt(sv2 / n);
    const beta = 7.348e-3 * (Vrms - 3.667) ** 2 + 7.6e-4 + 4.081e-3 * (hi - lo);
    return { alpha, beta, Vrms };
  }
  // remaining capacity after `days`: 1 − α·t^0.75 − β·√(Ah throughput); throughput = cycles·DoD·2·cap per day
  function ageCapacity(days, p) {
    const r = ageRates(p.meanSoc, p.dod, p.Tc), efc = p.cyclesPerDay * (p.dod) * days, ah = efc * 2 * AGE.cap;
    const cal = r.alpha * Math.pow(days, 0.75), cyc = r.beta * Math.sqrt(ah);
    const raw = 1 - cal - cyc;
    // Schmalstieg's tests: calendar at 35–50 °C, cycling at 35 °C; the page marks anything else as extrapolation
    return { q: Math.max(0, raw), raw, cal, cyc, efc, tempFitted: p.Tc >= 35 && p.Tc <= 50, beyondFit: raw < AGE.fitFloor };
  }
  function ageDaysTo(target, p) { let lo = 0, hi = 365 * 60; if (ageCapacity(hi, p).q > target) return null; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (ageCapacity(m, p).q > target) lo = m; else hi = m; } return (lo + hi) / 2; }
  // diffusion-limited SEI: thickness grows as √t, so loss in each successive year shrinks
  const seiSqrt = years => Math.sqrt(years);

  /* ───────── ch8 learning curve: Wright's law on real data ───────── */
  // price: real 2024 US$/kWh, battery cells; cumulative production, GWh. Rupert Way (2026), based on Ziegler & Trancik (2021),
  // BloombergNEF and Avicenne Energy, via Our World in Data (downloaded 2026-11-11).
  const PRICE = { 1991: 9210.23, 1992: 7388.138, 1993: 5881.7812, 1994: 6714.4497, 1995: 6301.8833, 1996: 5307.834, 1997: 4545.2925, 1998: 3656.8633, 1999: 2769.8726, 2000: 2690.6272, 2001: 1878.0293, 2002: 1345.5295, 2003: 1040.3679, 2004: 930.90393, 2005: 802.5369, 2006: 687.29584, 2007: 655.836, 2008: 687.6569, 2009: 612.57623, 2010: 550.72064, 2011: 524.59796, 2012: 539.6925, 2013: 490.8935, 2014: 434.2699, 2015: 331.94275, 2016: 259, 2017: 187, 2018: 157, 2019: 132, 2020: 123, 2021: 119, 2022: 132, 2023: 111, 2024: 78 };
  const CUM = { 1991: 0.00013, 1992: 0.00168, 1993: 0.01455, 1994: 0.05354857, 1995: 0.17667577, 1996: 0.67420655, 1997: 1.3907108, 1998: 2.3999145, 1999: 3.8941147, 2000: 6.1116147, 2001: 8.764615, 2002: 12.478815, 2003: 17.928314, 2004: 25.257515, 2005: 34.225716, 2006: 46.036415, 2007: 60.063816, 2008: 77.31892, 2009: 95.635216, 2010: 118.81602, 2011: 147.86942, 2012: 182.27672, 2013: 224.90512, 2014: 278.06042, 2015: 361.55508, 2016: 468.48975, 2017: 599.8168, 2018: 790.15704, 2019: 1003.9874, 2020: 1277.6542, 2021: 1740.6592, 2022: 2457.4656, 2023: 3511.4656 };
  function wright(from = 1998, to = 2023) {
    const xs = [], ys = [];
    for (let y = from; y <= to; y++) if (CUM[y] != null && PRICE[y] != null) { xs.push(Math.log2(CUM[y])); ys.push(Math.log2(PRICE[y])); }
    const n = xs.length, mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
    let sxy = 0, sxx = 0, syy = 0; for (let i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; syy += (ys[i] - my) ** 2; }
    const b = sxy / sxx, a = my - b * mx;
    return { b, a, n, r2: sxy * sxy / (sxx * syy), lr: 1 - Math.pow(2, b), price: q => Math.pow(2, a + b * Math.log2(q)), doublings: Math.log2(CUM[to] / CUM[from]) };
  }

  /* ───────── ch9 lithium floor: the least lithium one kWh can contain ───────── */
  const liPerKwh = V => 3.6e6 / (V * F) * A.Li / 1000; // kg of Li per kWh at cell voltage V, one Li per electron, 100 % use
  // upper bound on battery energy (TWh) one year's mined lithium could make if every atom carried charge
  const liBoundTWh = (tonnes, share, V) => tonnes * 1000 * share / liPerKwh(V) / 1e9;

  /* ───────── frontier facts (dated, sourced in BRIEF.md "Facts that will go stale") ───────── */
  // status: 'est' = established/measured by an independent party, 'demo' = demonstrated (by whom, when), 'claim' = claim by an interested party
  const FRONTIER = [
    { id: 'pack2025', status: 'est', asOf: '2025-12', price: 108, priceLfp: 81, priceNmc: 128, priceStationary: 70, cell: 74 },
    { id: 'iea2026', status: 'est', asOf: '2026', evTWh: 1.2, lfpShare: 55, capacityTWh: 4, cathodeShareNmc: [40, 50], cathodeShareLfp: [25, 30] },
    { id: 'tesla4680', status: 'est', asOf: '2023-12', whkg: 232.5, whl: 622.4 },
    { id: 'm50', status: 'est', asOf: 'spec', whkg: 267, whl: 740 },
    { id: 'ctpLfp', status: 'est', asOf: '2023-01', whkg: 160, whl: 330, packWhkg: 135, packWhl: 210 },
    { id: 'lfpSafety', status: 'est', asOf: '2023-04', lfpTR: 256.3, nmcTR: 198.0, lfpOnset: 124.4, nmcOnset: 85.5 },
    { id: 'usgs2026', status: 'est', asOf: '2026-02', liProd: 290000, liReserves: 37e6, batteryShare: 88 },
    { id: 'euReg', status: 'est', asOf: '2023-07', li2027: 50, li2031: 80 },
    { id: 'prologium', status: 'demo', asOf: '2026-09', whkg: 381, whl: 903, gwh: 0.5 },
    { id: 'qs', status: 'demo', asOf: '2026-02', whl: 844 },
    { id: 'amprius450', status: 'demo', asOf: '2025-07', whkg: 450 },
    { id: 'form', status: 'demo', asOf: '2026-10', mw: 1.5, mwh: 150, hours: 100 },
    { id: 'shenxing3', status: 'claim', asOf: '2026-04', minutes: 6.45, from: 10, to: 98 },
    { id: 'blade2', status: 'claim', asOf: '2026-03', minutes: 9, from: 10, to: 97, kw: 1500 },
    { id: 'amprius500', status: 'claim', asOf: '2026-09', whkg: 500 },
    { id: 'naxtra', status: 'claim', asOf: '2025-04', whkg: 175 },
    { id: 'ssbPlans', status: 'claim', asOf: '2026' },
    { id: 'bnef2026', status: 'claim', asOf: '2025-12', price: 105 }
  ];

  /* ───────── which live sentence each figure shows (keys into copy.*.js; the page formats the numbers) ───────── */
  const say = {
    ch1(a, k) { const r = cell(a, k); if (a === k) return 'ch1.say.same'; if (r.reversed) return 'ch1.say.rev';
      return r.reducesWater && r.oxidisesWater ? 'ch1.say.both' : r.reducesWater ? 'ch1.say.low' : r.oxidisesWater ? 'ch1.say.high' : 'ch1.say.inside'; },
    water(a, k) { const r = cell(a, k); return r.reducesWater && r.oxidisesWater ? 'both' : r.reducesWater ? 'low' : r.oxidisesWater ? 'high' : 'ok'; },
    ch2(c, a, q) { return q <= 2 ? 'ch2.say.thin' : a === 'graphite' ? 'ch2.say.graphite' : 'ch2.say.newanode'; },
    ch2big(S) { let big = 1; for (let i = 2; i < S.length; i++) if (S[i - 1].whkg - S[i].whkg > S[big - 1].whkg - S[big].whkg) big = i; return big; },
    ch3a(w) { if (w >= 1.85 && w <= 2.0) return 'ch3.say.critical'; return binodal(w) ? 'ch3.say.split' : 'ch3.say.single'; },
    ch3b(s, mv) { const en = socError('nmcCell', s, mv / 1000), el = socError('lfpCell', s, mv / 1000); return el / en > 3 ? 'ch3.say.lfpworse' : 'ch3.say.similar'; },
    ch4(st) { return !st.done ? 'ch4.say.run' : !st.full ? 'ch4.say.cut' : st.tau < st.tFull ? 'ch4.say.full' : 'ch4.say.fullslow'; },
    ch5(r, done = true) { return !done ? 'ch5.say.run' : r.plating ? 'ch5.say.plating' : r.t80 == null ? 'ch5.say.noeighty' : (r.socSwitch || 0) < 0.01 ? 'ch5.say.instant' : r.socSwitch < 0.3 ? 'ch5.say.cvmost' : 'ch5.say.normal'; },
    ch6(r, crit, amb, done = true) { const gap = crit != null ? crit - amb : Infinity; return !done ? 'ch6.say.run' : r.runaway ? 'ch6.say.runaway' : gap <= 3 ? 'ch6.say.close' : 'ch6.say.safe'; },
    ch7(P) { const a = ageCapacity(3650, P), d80 = ageDaysTo(0.8, P), keys = [];
      keys.push(d80 == null ? 'ch7.say.never' : a.cyc === 0 ? 'ch7.say.storage' : a.cal >= a.cyc ? 'ch7.say.cal' : 'ch7.say.cyc');
      if (!a.tempFitted) keys.push('ch7.note.temp'); if (a.beyondFit && d80 != null) keys.push('ch7.note.floor'); return keys; },
    ch8(from, ex) { const W = wright(from, 2023), keys = [from <= 1993 ? 'ch8.say.all' : W.r2 < 0.85 ? 'ch8.say.weak' : 'ch8.say.normal']; if (ex > 0) keys.push('ch8.say.ext'); return keys; }
  };

  return { F, R, A, molar, capacity, ocv, WIN, electrodes, WATER, cell, CATHODES, ANODES, STACK, ladder, finalWhkg,
    latticeE, latticeEq, binodal, latticeSlopeMid, socError, makeSphere, sphereStep, sphereMean, sphereSurf, thomas,
    PARTICLES, particleSim, particleCharge, SPM, spmCreate, spmVolt, ccCv, TR, trGen, trLoss, trRun, trCritical, hNat,
    say, AGE, ageV, ageRates, ageCapacity, ageDaysTo, seiSqrt, PRICE, CUM, wright, liPerKwh, liBoundTWh, FRONTIER, clamp, lerp };
});
