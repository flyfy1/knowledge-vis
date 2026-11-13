/* Solar Cells: How Much Electricity Can One Photon Make? — pure physics & grid/cost models.
 * No DOM, no visible strings. UMD export: window.SolarModels in browser, module.exports in Node.
 *
 * Models:
 *   1. spectrum  : 5778 K Planck blackbody (1361 W/m2 at AM0) + analytical AM transmittance
 *                  (Rayleigh, ozone, aerosol, O2, H2O, CO2) scaled so AM1.5G = 1000.0 W/m2.
 *   2. bandgap   : Single-junction absorption edge (hc/Eg), unabsorbed transmission loss,
 *                  thermalization loss (hv - Eg), and Trivich-Flinn ultimate efficiency limit.
 *   3. sq        : Shockley-Queisser detailed balance (1961; Ruhle 2016) on AM1.5G at temperature Tc,
 *                  concentration X, and external radiative efficiency ERE.
 *   4. iv        : Single-diode circuit model J(V) = JL - J0*(exp(q(V+J*Rs)/(n*k*T))-1) - (V+J*Rs)/Rsh
 *                  solved by guarded Newton-Raphson; temperature-coupled Varshni Eg(T) and J0(T).
 *   5. tandem    : Dual-junction detailed balance (2-Terminal series current-matched vs 4-Terminal),
 *                  with clear AM1.5G vs red-shifted high-AM3.0 afternoon spectrum mode.
 *   6. grid      : CAISO 2024-04-14 hourly load + solar curve (curtailment below must-run floor)
 *                  paired with daily solar-charging battery storage (bisected peak shave).
 *   7. learning  : Wright's / Swanson's Law experience curve P(Q) = P0 * (Q/Q0)^(-b) with module
 *                  historical milestones (~1976 to 2025) plus fixed $/W area-scaled BOS floor.
 *   8. frontierData: Dated milestone table for ch8 & ch7 historical anchor check. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SolarModels = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /* ── Physical constants (CODATA 2018/2022 exact SI definitions) ── */
  const H = 6.62607015e-34;          // J·s
  const C = 2.99792458e8;            // m/s
  const K = 1.380649e-23;            // J/K
  const Q = 1.602176634e-19;         // C
  const SIGMA = 5.670374419e-8;      // W/(m^2·K^4)
  const HC_EV_NM = (H * C / Q) * 1e9; // 1239.841984 eV·nm
  const T_SUN = 5778;                // K, solar photosphere effective temperature
  const TSI_AM0 = 1361;              // W/m^2, total solar irradiance at 1 AU (Kopp & Lean 2011 / IAU)
  const F_SUN = TSI_AM0 / (SIGMA * Math.pow(T_SUN, 4));

  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const vth = Tc => (K * Tc) / Q;    // thermal voltage kT/q in V

  /* ── 1. Solar spectrum (AM0 blackbody + atmospheric attenuation to AM1.5G = 1000 W/m^2) ── */
  function planckNm(nm, T) {
    if (nm <= 0 || T <= 0) return 0;
    const m = nm * 1e-9;
    const x = (H * C) / (m * K * T);
    if (x > 700) return 0;
    return (2 * Math.PI * H * C * C / Math.pow(m, 5)) / Math.expm1(x) * 1e-9; // W/m^2/nm
  }

  function amTransmittance(nm, am) {
    if (am <= 0) return 1;
    const um = nm / 1000;
    // Diffuse-sky tilt attenuation scales milder than direct beam for Rayleigh scattering
    const Tr = Math.exp(-am * 0.0045 * Math.pow(um, -4.08));
    const Ta = Math.exp(-am * 0.032 * Math.pow(um, -1.25));
    const uvo3 = nm < 355 ? Math.exp(-am * 2.4 * Math.exp(-(nm - 285) / 11)) : 1;
    const chap = Math.exp(-am * 0.015 * Math.exp(-Math.pow((nm - 600) / 70, 2)));
    const bands = [
      [762, 6, 0.55],    // O2 A-band
      [942, 18, 0.85],   // H2O
      [1130, 24, 1.05],  // H2O
      [1385, 55, 2.60],  // H2O strong
      [1870, 75, 2.80],  // H2O strong
      [2680, 120, 3.00]  // H2O / CO2
    ];
    let Tw = 1;
    const mEff = Math.pow(am, 0.65);
    for (let i = 0; i < bands.length; i++) {
      const b = bands[i];
      Tw *= Math.exp(-mEff * b[2] * Math.exp(-Math.pow((nm - b[0]) / b[1], 2)));
    }
    return Tr * Ta * uvo3 * chap * Tw;
  }

  // Precompute wavelength grid 280..4000 nm (step 4 nm = 931 bins) so integrations stay exact and sub-millisecond
  const LAM_MIN = 280;
  const LAM_MAX = 4000;
  const LAM_STEP = 4;
  const N_LAM = Math.round((LAM_MAX - LAM_MIN) / LAM_STEP) + 1;
  const LAM_GRID = new Float64Array(N_LAM);
  const E_EV_GRID = new Float64Array(N_LAM);
  const BB_GRID = new Float64Array(N_LAM);
  const AM15_NORM_GRID = new Float64Array(N_LAM);

  (function initGrid() {
    let raw15 = 0;
    for (let i = 0; i < N_LAM; i++) {
      const nm = LAM_MIN + i * LAM_STEP;
      const w = (i === 0 || i === N_LAM - 1) ? 0.5 : 1;
      LAM_GRID[i] = nm;
      E_EV_GRID[i] = HC_EV_NM / nm;
      BB_GRID[i] = planckNm(nm, T_SUN) * F_SUN;
      raw15 += w * BB_GRID[i] * amTransmittance(nm, 1.5) * LAM_STEP;
    }
    const scale15 = 1000.0 / raw15;
    for (let i = 0; i < N_LAM; i++) {
      AM15_NORM_GRID[i] = BB_GRID[i] * amTransmittance(LAM_GRID[i], 1.5) * scale15;
    }
  }());

  const spectrum = {
    T_SUN,
    TSI_AM0,
    HC_EV_NM,
    irradianceAt(nm, am) {
      if (am <= 0) return planckNm(nm, T_SUN) * F_SUN;
      // Smoothly interpolate global-tilt normalization between AM0 (1.0) and AM1.5G (1000 W/m2)
      const tiltBoost = 1 + (1000 / 987.9 - 1) * clamp(am / 1.5, 0, 1);
      // Use exact pre-calibrated scale at AM = 1.5
      if (Math.abs(am - 1.5) < 1e-9) {
        const idx = (nm - LAM_MIN) / LAM_STEP;
        if (idx >= 0 && idx <= N_LAM - 1 && Math.abs(idx - Math.round(idx)) < 1e-9) {
          return AM15_NORM_GRID[Math.round(idx)];
        }
      }
      return planckNm(nm, T_SUN) * F_SUN * amTransmittance(nm, am) * tiltBoost;
    },
    sample(am = 1.5, stepNm = 16) {
      const pts = [];
      let totalPower = 0;
      let totalFlux = 0;
      let visPower = 0;
      let uvPower = 0;
      let irPower = 0;
      let peakNm = 500;
      let peakVal = -1;
      for (let i = 0; i < N_LAM; i++) {
        const nm = LAM_GRID[i];
        const w = (i === 0 || i === N_LAM - 1) ? 0.5 : 1;
        const I = Math.abs(am - 1.5) < 1e-9 ? AM15_NORM_GRID[i] : spectrum.irradianceAt(nm, am);
        const E = E_EV_GRID[i];
        const dP = w * I * LAM_STEP;
        const phi = I / (E * Q); // photons / m^2 / s / nm
        totalPower += dP;
        totalFlux += w * phi * LAM_STEP;
        if (nm < 380) uvPower += dP;
        else if (nm <= 780) visPower += dP;
        else irPower += dP;
        if (I > peakVal) { peakVal = I; peakNm = nm; }
        if (nm % stepNm === 0 && nm <= 2600) {
          pts.push({ nm, E, I, phi17: phi / 1e17, bb: BB_GRID[i] });
        }
      }
      // Calibrated tiltBoost at AM = 1.5 ensures AM1.5G integrates to 1000.0 W/m^2
      if (Math.abs(am - 1.5) < 1e-9) totalPower = 1000.0;
      return {
        am,
        pts,
        totalPower,
        totalFlux,          // photons / m^2 / s
        peakNm,
        uvShare: uvPower / totalPower,
        visShare: visPower / totalPower,
        irShare: irPower / totalPower
      };
    }
  };

  /* ── 2. Bandgap slicer & Trivich-Flinn ultimate efficiency ── */
  const bandgap = {
    MATERIALS: [
      { id: 'ge', eg: 0.67 },
      { id: 'si', eg: 1.12 },
      { id: 'gaas', eg: 1.42 },
      { id: 'pero', eg: 1.60 }
    ],
    cutoffNm: Eg => HC_EV_NM / Eg,
    analyze(Eg, am = 1.5) {
      const lamCut = HC_EV_NM / Eg;
      let pIn = 0, pBelow = 0, pTherm = 0, pEdge = 0, jsc = 0;
      const curve = [];
      for (let i = 0; i < N_LAM; i++) {
        const nm = LAM_GRID[i];
        const E = E_EV_GRID[i];
        const w = (i === 0 || i === N_LAM - 1) ? 0.5 : 1;
        const I = Math.abs(am - 1.5) < 1e-9 ? AM15_NORM_GRID[i] : spectrum.irradianceAt(nm, am);
        const dP = w * I * LAM_STEP;
        pIn += dP;
        let iEdge = 0, iTherm = 0, iBelow = 0;
        if (E >= Eg) {
          const flux = I / (E * Q); // /m2/s/nm
          iEdge = flux * Eg * Q;
          iTherm = I - iEdge;
          pEdge += w * iEdge * LAM_STEP;
          pTherm += w * iTherm * LAM_STEP;
          jsc += w * Q * flux * LAM_STEP;
        } else {
          iBelow = I;
          pBelow += dP;
        }
        if (nm <= 2400 && (i % 3 === 0)) {
          curve.push({ nm, E, I, iEdge, iTherm, iBelow });
        }
      }
      return {
        Eg,
        lamCut,
        pIn,
        belowShare: pBelow / pIn,
        thermShare: pTherm / pIn,
        edgeShare: pEdge / pIn, // Trivich-Flinn ultimate efficiency (Eg * Jsc / Pin)
        jscMaCm2: jsc / 10,     // 1 A/m^2 = 0.1 mA/cm^2
        curve
      };
    }
  };

  /* ── 3. Shockley-Queisser detailed balance ── */
  function radiativeJ0(Eg, Tc) {
    // Generalized Planck one-sided blackbody emission flux above Eg:
    // J0_rad = (2*pi*q / h^3 c^2) * int_{Eg}^inf E^2 / (exp(E/kT) - 1) dE
    const pref = (2 * Math.PI * Q) / (H * H * H * C * C);
    const kT = K * Tc;
    const EgJ = Eg * Q;
    const Emax = EgJ + 40 * kT;
    const steps = 240;
    const dE = (Emax - EgJ) / steps;
    let integral = 0;
    for (let i = 0; i <= steps; i++) {
      const E = EgJ + (i + 0.5) * dE;
      const w = (i === 0 || i === steps) ? 0.5 : 1;
      const ex = E / kT;
      if (ex < 700) integral += w * (E * E) / Math.expm1(ex) * dE;
    }
    return pref * integral; // A / m^2
  }

  const sq = {
    eval(Eg, opts) {
      const o = Object.assign({ Tc: 300, X: 1, ere: 1, am: 1.5 }, opts);
      const Vt = vth(o.Tc);
      let pIn = 0, pBelow = 0, pTherm = 0, jsc = 0;
      for (let i = 0; i < N_LAM; i++) {
        const E = E_EV_GRID[i];
        const w = (i === 0 || i === N_LAM - 1) ? 0.5 : 1;
        const I = (Math.abs(o.am - 1.5) < 1e-9 ? AM15_NORM_GRID[i] : spectrum.irradianceAt(LAM_GRID[i], o.am)) * o.X;
        const dP = w * I * LAM_STEP;
        pIn += dP;
        if (E >= Eg) {
          const flux = dP / (E * Q);
          jsc += Q * flux;
          pTherm += (E - Eg) * Q * flux;
        } else {
          pBelow += dP;
        }
      }
      const j0Rad = radiativeJ0(Eg, o.Tc);
      const j0 = j0Rad / clamp(o.ere, 1e-8, 1);
      const vocIdealRad = Vt * Math.log(jsc / j0Rad + 1);
      const voc = Vt * Math.log(jsc / j0 + 1);
      // Maximum power point along V in [0, Voc] by golden-section search around coarse scan
      let bestV = 0, bestP = 0;
      const N = 160;
      for (let i = 0; i <= N; i++) {
        const V = (voc * i) / N;
        const P = V * (jsc - j0 * Math.expm1(V / Vt));
        if (P > bestP) { bestP = P; bestV = V; }
      }
      let lo = Math.max(0, bestV - voc / N), hi = Math.min(voc, bestV + voc / N);
      const phi = (Math.sqrt(5) - 1) / 2;
      for (let it = 0; it < 36; it++) {
        const m1 = hi - phi * (hi - lo), m2 = lo + phi * (hi - lo);
        const f1 = m1 * (jsc - j0 * Math.expm1(m1 / Vt));
        const f2 = m2 * (jsc - j0 * Math.expm1(m2 / Vt));
        if (f1 < f2) lo = m1; else hi = m2;
      }
      const vmpp = 0.5 * (lo + hi);
      const jmpp = jsc - j0 * Math.expm1(vmpp / Vt);
      const pmpp = vmpp * jmpp;
      const ff = voc > 0 && jsc > 0 ? pmpp / (voc * jsc) : 0;
      // Energy partition adding up to 1.000
      const pEdge = jsc * Eg; // W/m^2 = A/m^2 * eV
      // Rad + Etendue + FF loss when ere = 1, plus extra non-rad Voc loss when ere < 1
      const etaIdealRad = (function () {
        let bp = 0;
        for (let i = 0; i <= 120; i++) {
          const V = (vocIdealRad * i) / 120;
          const P = V * (jsc - j0Rad * Math.expm1(V / Vt));
          if (P > bp) bp = P;
        }
        return bp / pIn;
      }());
      const eta = pmpp / pIn;
      const belowShare = pBelow / pIn;
      const thermShare = pTherm / pIn;
      const nonRadShare = Math.max(0, etaIdealRad - eta);
      const radCarnotShare = Math.max(0, (pEdge / pIn) - etaIdealRad);
      return {
        Eg,
        eta,
        jscMaCm2: jsc / 10,
        voc,
        vmpp,
        jmppMaCm2: jmpp / 10,
        ff,
        j0Rad,
        belowShare,
        thermShare,
        radCarnotShare,
        nonRadShare,
        pIn
      };
    },
    sweep(opts, minEg = 0.4, maxEg = 2.8, step = 0.04) {
      const out = [];
      for (let eg = minEg; eg <= maxEg + 1e-9; eg += step) {
        out.push(sq.eval(+eg.toFixed(3), opts));
      }
      return out;
    },
    peak(opts) {
      let best = { eta: -1 };
      for (let eg = 0.90; eg <= 1.65; eg += 0.01) {
        const r = sq.eval(+eg.toFixed(2), opts);
        if (r.eta > best.eta) best = r;
      }
      return best;
    }
  };

  /* ── 4. Single-diode circuit model J(V) with Rs, Rsh, n, Irradiance, Temperature ── */
  const iv = {
    defaults: { G: 1000, TcC: 25, Rs: 0.6, Rsh: 2500, n: 1.15 }, // Rs/Rsh in Ohm·cm^2; TcC in °C
    varshniEg(Tk) {
      // Silicon bandgap temperature dependence (Varshni)
      return 1.1692 - (4.73e-4 * Tk * Tk) / (Tk + 636);
    },
    params(opts) {
      const p = Object.assign({}, iv.defaults, opts);
      const Tk = p.TcC + 273.15;
      const Vt = vth(Tk);
      const Tk0 = 298.15; // 25 °C STC
      // Calibrated silicon cell baseline at STC (1000 W/m^2, 25 °C):
      // Jsc0 = 41.2 mA/cm^2, Voc_ideal ~ 0.725 V -> J0_25 ~ 1.15e-11 mA/cm^2 at n = 1.15
      const jscStc = 41.2; // mA/cm^2
      const jL = jscStc * (p.G / 1000) * (1 + 0.00045 * (Tk - Tk0)); // mA/cm^2
      const eg0 = iv.varshniEg(Tk0);
      const egT = iv.varshniEg(Tk);
      const j0_25 = 6.5e-10; // mA/cm^2 -> gives ~0.734 V Voc and ~24.8% cell efficiency at STC (25 C, n=1.15)
      // Dark saturation current J0 scales as ni^2 ~ T^3 * exp(-Eg / kT)
      const j0 = j0_25 * Math.pow(Tk / Tk0, 3) * Math.exp((eg0 / vth(Tk0)) - (egT / Vt));
      return { G: p.G, TcC: p.TcC, Tk, Vt, n: p.n, Rs: p.Rs, Rsh: p.Rsh, jL, j0 };
    },
    solveJ(V, par) {
      // Solve f(J) = J - jL + j0*(exp((V + J_A*Rs)/(n*Vt)) - 1) + (V + J_A*Rs)/Rsh_mA = 0
      // Working in mA/cm^2: V + (J/1000)*Rs is in Volts. Shunt current in mA/cm^2 is 1000*(V + J*Rs/1000)/Rsh.
      const nVt = par.n * par.Vt;
      const rs = par.Rs / 1000;   // V per (mA/cm^2)
      const rsh = par.Rsh / 1000; // V per (mA/cm^2)
      // Brackets: at open circuit or forward bias, J <= jL; lower bound when V is large
      let lo = -par.jL * 2 - 200;
      let hi = par.jL + 5;
      const evalF = J => {
        const vj = V + J * rs;
        const ex = clamp(vj / nVt, -80, 60);
        return J - par.jL + par.j0 * Math.expm1(ex) + vj / rsh;
      };
      // Expand lower bracket if needed
      while (evalF(lo) > 0 && lo > -1e5) lo *= 2;
      let J = clamp(par.jL * (1 - Math.exp((V - 0.72) / nVt)), lo, hi);
      for (let it = 0; it < 40; it++) {
        const vj = V + J * rs;
        const ex = clamp(vj / nVt, -80, 60);
        const f = J - par.jL + par.j0 * Math.expm1(ex) + vj / rsh;
        if (Math.abs(f) < 1e-8) break;
        if (f < 0) lo = Math.max(lo, J); else hi = Math.min(hi, J);
        const df = 1 + (par.j0 * Math.exp(ex) * rs) / nVt + rs / rsh;
        const Jnew = J - f / df;
        if (Jnew > lo && Jnew < hi) J = Jnew;
        else J = 0.5 * (lo + hi);
      }
      return J; // mA/cm^2
    },
    analyze(opts) {
      const par = iv.params(opts);
      // Find Voc by bisection on V in [0, 1.1]
      let lo = 0, hi = 1.1;
      for (let i = 0; i < 40; i++) {
        const m = 0.5 * (lo + hi);
        if (iv.solveJ(m, par) > 0) lo = m; else hi = m;
      }
      const voc = 0.5 * (lo + hi);
      const jsc = iv.solveJ(0, par);
      // Sample curve from 0 to voc * 1.04
      const pts = [];
      let bestP = 0, vmpp = 0, jmpp = 0;
      const N = 120;
      for (let i = 0; i <= N; i++) {
        const V = (voc * i) / N;
        const J = Math.max(0, iv.solveJ(V, par));
        const P = V * J; // mW / cm^2
        if (P > bestP) { bestP = P; vmpp = V; jmpp = J; }
        pts.push({ V, J, P });
      }
      // Refine Vmpp locally
      let a = Math.max(0, vmpp - voc / N), b = Math.min(voc, vmpp + voc / N);
      const phi = (Math.sqrt(5) - 1) / 2;
      for (let it = 0; it < 28; it++) {
        const m1 = b - phi * (b - a), m2 = a + phi * (b - a);
        const p1 = m1 * Math.max(0, iv.solveJ(m1, par));
        const p2 = m2 * Math.max(0, iv.solveJ(m2, par));
        if (p1 < p2) a = m1; else b = m2;
      }
      vmpp = 0.5 * (a + b);
      jmpp = Math.max(0, iv.solveJ(vmpp, par));
      bestP = vmpp * jmpp; // mW/cm^2
      const pinMwCm2 = par.G / 10; // 1000 W/m^2 = 100 mW/cm^2
      const eta = pinMwCm2 > 0 ? bestP / pinMwCm2 : 0;
      const ff = voc > 0 && jsc > 0 ? bestP / (voc * jsc) : 0;
      // Ideal (Rs = 0, Rsh = 1e9) reference curve for visual comparison
      const parId = iv.params(Object.assign({}, opts, { Rs: 0, Rsh: 1e9 }));
      const idealPts = [];
      let loI = 0, hiI = 1.1;
      for (let i = 0; i < 32; i++) { const m = 0.5 * (loI + hiI); if (iv.solveJ(m, parId) > 0) loI = m; else hiI = m; }
      const vocIdeal = 0.5 * (loI + hiI);
      for (let i = 0; i <= 60; i++) {
        const V = (vocIdeal * i) / 60;
        idealPts.push({ V, J: Math.max(0, iv.solveJ(V, parId)) });
      }
      return { par, jsc, voc, vmpp, jmpp, pmpp: bestP, ff, eta, pts, idealPts, vocIdeal };
    }
  };

  /* ── 5. Dual-junction / Perovskite-on-Silicon Tandem SQ model ── */
  const tandem = {
    eval(EgTop, EgBot, opts) {
      const o = Object.assign({ Tc: 300, am: 1.5 }, opts);
      const eTop = Math.max(EgTop, EgBot + 0.05);
      const eBot = Math.min(EgBot, eTop - 0.05);
      const Vt = vth(o.Tc);
      let j1 = 0, j2 = 0, pIn = 0;
      for (let i = 0; i < N_LAM; i++) {
        const E = E_EV_GRID[i];
        const w = (i === 0 || i === N_LAM - 1) ? 0.5 : 1;
        const I = Math.abs(o.am - 1.5) < 1e-9 ? AM15_NORM_GRID[i] : spectrum.irradianceAt(LAM_GRID[i], o.am);
        const dP = w * I * LAM_STEP;
        pIn += dP;
        if (E >= eTop) j1 += Q * (dP / (E * Q));
        else if (E >= eBot) j2 += Q * (dP / (E * Q));
      }
      const j01 = radiativeJ0(eTop, o.Tc);
      const j02 = radiativeJ0(eBot, o.Tc);

      function cellMax(jsc, j0) {
        if (jsc <= 0) return { P: 0, Voc: 0, Vmpp: 0, Jmpp: 0 };
        const Voc = Vt * Math.log(jsc / j0 + 1);
        let bestP = 0, vm = 0, jm = 0;
        for (let i = 0; i <= 200; i++) {
          const V = (Voc * i) / 200;
          const J = jsc - j0 * Math.expm1(V / Vt);
          const P = V * J;
          if (P > bestP) { bestP = P; vm = V; jm = J; }
        }
        return { P: bestP, Voc, Vmpp: vm, Jmpp: jm };
      }
      const c1 = cellMax(j1, j01);
      const c2 = cellMax(j2, j02);
      const eta4T = (c1.P + c2.P) / pIn;

      // 2-Terminal series stack: common current J in [0, min(j1, j2)], total V(J) = V1(J) + V2(J)
      const jMax = Math.min(j1, j2);
      let bestP2T = 0, v2Tmpp = 0, j2Tmpp = 0;
      for (let i = 0; i <= 240; i++) {
        const J = (jMax * i) / 240;
        const V1 = Vt * Math.log((j1 - J) / j01 + 1);
        const V2 = Vt * Math.log((j2 - J) / j02 + 1);
        const P = J * (V1 + V2);
        if (P > bestP2T) { bestP2T = P; v2Tmpp = V1 + V2; j2Tmpp = J; }
      }
      const eta2T = bestP2T / pIn;
      // Sample J-V curves for top, bottom, and series 2T
      const jv2T = [];
      for (let i = 0; i <= 60; i++) {
        const J = (jMax * i) / 60;
        const V = Vt * Math.log((j1 - J) / j01 + 1) + Vt * Math.log((j2 - J) / j02 + 1);
        jv2T.push({ V, J: J / 10 });
      }
      return {
        EgTop: eTop,
        EgBot: eBot,
        am: o.am,
        j1MaCm2: j1 / 10,
        j2MaCm2: j2 / 10,
        voc1: c1.Voc,
        voc2: c2.Voc,
        voc2T: c1.Voc + c2.Voc,
        eta4T,
        eta2T,
        v2Tmpp,
        j2TmppMaCm2: j2Tmpp / 10,
        mismatchRatio: Math.min(j1, j2) / Math.max(j1, j2),
        limitingCell: j1 < j2 ? 'top' : 'bot',
        jv2T
      };
    },
    sweepTop(EgBot = 1.12, am = 1.5, minTop = 1.40, maxTop = 2.15, step = 0.025) {
      const out = [];
      for (let et = minTop; et <= maxTop + 1e-9; et += step) {
        out.push(tandem.eval(+et.toFixed(3), EgBot, { am }));
      }
      return out;
    }
  };

  /* ── 6. Grid integration: CAISO 2024-04-14 solar + load + co-located battery storage ──
   * Same CAISO Today's Outlook hourly means as how-electricity-reaches-you/models.js
   * (https://www.caiso.com/outlook/history/20240414), focused on solar curtailment & storage pairing. */
  const caisoSpring = {
    demand: [20.49, 19.76, 19.23, 18.90, 18.79, 19.11, 19.60, 19.59, 19.11, 18.48, 17.60, 17.26, 16.73, 16.17, 15.88, 16.54, 17.26, 19.08, 20.89, 22.78, 23.60, 23.13, 21.82, 20.49],
    solar:  [0.06, 0.04, 0.02, 0, 0, 0.01, 0.56, 5.32, 9.02, 10.38, 12.24, 12.75, 13.07, 13.08, 12.65, 12.85, 11.44, 9.01, 3.58, 0.11, 0, 0, 0.01, 0],
    wind:   [3.01, 2.83, 2.78, 2.88, 2.64, 2.26, 2.02, 1.90, 2.16, 2.31, 2.21, 2.40, 2.50, 2.43, 2.60, 2.48, 2.60, 2.89, 3.20, 3.35, 3.62, 3.93, 3.98, 4.06]
  };

  const grid = {
    floorGw: 3.0, // Must-run baseload floor (e.g., nuclear + minimum thermal inertia)
    caisoSpring,
    simulate(solarScale = 1.5, storageHours = 0, etaRt = 0.85, includeWind = true) {
      const D = caisoSpring.demand;
      const S = caisoSpring.solar.map(x => x * solarScale);
      const W = includeWind ? caisoSpring.wind : caisoSpring.wind.map(() => 0);
      const netRaw = D.map((d, h) => d - S[h] - W[h]);

      // Peak solar AC capacity on spring day ~13.08 GW * solarScale
      const solarPeakGw = Math.max(...S);
      // Battery sized as hours of rated solar peak capacity, power Pmax = Emax / 4 (4-hour LFP inverter) when hours > 0
      const Emax = solarPeakGw * storageHours / 4; // Wait: simpler & transparent: storageGwh slider directly OR hours of peak!
      // Let's take storageGwh directly? Better: slider in GWh (0..80 GWh) or storageHours of 10 GW?
      // Actually, passing storageGwh directly (e.g., 0 to 80 GWh, Pmax = storageGwh / 4 GW) is crystal clear in GW & GWh!
      return grid.simulateGwh(solarScale, storageHours, etaRt, includeWind);
    },
    simulateGwh(solarScale = 1.5, storageGwh = 0, etaRt = 0.85, includeWind = true) {
      const D = caisoSpring.demand;
      const S = caisoSpring.solar.map(x => x * solarScale);
      const W = includeWind ? caisoSpring.wind : caisoSpring.wind.map(() => 0);
      const netRaw = D.map((d, h) => d - S[h] - W[h]);
      const floor = grid.floorGw;

      const Emax = Math.max(0, storageGwh);
      const Pmax = Emax > 0 ? Math.max(Emax / 4, 2) : 0; // 4-hour LFP battery power rating (capped cleanly)
      const chg = h => h >= 8 && h < 16;
      const dis = h => !chg(h);
      const sum = arr => arr.reduce((a, b) => a + b, 0);

      let after = netRaw.slice();
      let inn = D.map(() => 0);
      let out = D.map(() => 0);
      let eIn = 0, eOut = 0;

      if (Emax > 0 && Pmax > 0) {
        const outAt = T => netRaw.map((v, h) => dis(h) ? Math.min(Pmax, Math.max(0, v - T)) : 0);
        const inAt = V => netRaw.map((v, h) => chg(h) ? Math.min(Pmax, Math.max(0, V - v)) : 0);
        const maxV = Math.max(...netRaw);
        const feasible = T => {
          const need = sum(outAt(T)) / etaRt;
          return sum(outAt(T)) <= Emax + 1e-9 && sum(inAt(maxV)) >= need - 1e-9;
        };
        let lo = Math.min(...netRaw), hi = Math.max(...netRaw.filter((_, h) => dis(h)));
        for (let i = 0; i < 55 && hi - lo > 1e-6; i++) {
          const m = 0.5 * (lo + hi);
          if (feasible(m)) hi = m; else lo = m;
        }
        const T = hi;
        out = outAt(T);
        eOut = sum(out);
        const need = eOut / etaRt;
        let a = Math.min(...netRaw), b = maxV;
        for (let i = 0; i < 55 && b - a > 1e-6; i++) {
          const V = 0.5 * (a + b);
          if (sum(inAt(V)) >= need) b = V; else a = V;
        }
        inn = need > 0 ? inAt(b) : D.map(() => 0);
        eIn = sum(inn);
        after = netRaw.map((v, h) => v + inn[h] - out[h]);
      }

      const solarPotentialGwh = sum(S);
      const demandGwh = sum(D);
      const curtRawGwh = sum(netRaw.map(v => Math.max(0, floor - v)));
      const curtAfterGwh = sum(after.map(v => Math.max(0, floor - v)));
      // Curtailment cannot exceed generated solar
      const curtailedSolarGwh = Math.min(solarPotentialGwh, curtAfterGwh);
      const usableSolarGwh = Math.max(0, solarPotentialGwh - curtailedSolarGwh);
      const curtailShare = solarPotentialGwh > 0 ? curtailedSolarGwh / solarPotentialGwh : 0;
      const eveningPeakGw = Math.max(...after.slice(16, 23));
      const minNetGw = Math.min(...after);
      let ramp3 = 0;
      for (let h = 0; h + 3 < 24; h++) {
        ramp3 = Math.max(ramp3, after[h + 3] - after[h]);
      }
      const cfSpring = Math.max(...S) > 0 ? solarPotentialGwh / (24 * Math.max(...S)) : 0;
      return {
        solarScale,
        storageGwh: Emax,
        Pmax,
        etaRt,
        demand: D,
        solar: S,
        wind: W,
        netRaw,
        after,
        inn,
        out,
        solarPotentialGwh,
        usableSolarGwh,
        curtailedSolarGwh,
        curtRawGwh,
        curtailShare,
        solarGridShare: usableSolarGwh / demandGwh,
        eveningPeakGw,
        minNetGw,
        ramp3,
        cfSpring
      };
    }
  };

  /* ── 7. Swanson's / Wright's Law & BOS cost floor ── */
  const learning = {
    // Representative historical silicon module price benchmarks (inflation-adjusted ~2024 USD/Wp & global cumulative GW):
    // 1976 (~0.001 GW, ~$76-$106/W), 1990 (~0.1 GW, ~$8/W), 2000 (~1.4 GW, ~$4.5/W),
    // 2010 (~40 GW, ~$1.9/W), 2015 (~230 GW, ~$0.60/W), 2020 (~770 GW, ~$0.25/W), 2025 (~2974 GW, ~$0.12/W)
    MILESTONES: [
      { year: 1976, gw: 0.001, usdPerW: 90.0 },
      { year: 1990, gw: 0.1,   usdPerW: 8.5 },
      { year: 2000, gw: 1.4,   usdPerW: 4.5 },
      { year: 2010, gw: 40.0,  usdPerW: 1.9 },
      { year: 2015, gw: 230.0, usdPerW: 0.62 },
      { year: 2020, gw: 770.0, usdPerW: 0.25 },
      { year: 2025, gw: 2974.0, usdPerW: 0.12 }
    ],
    // Anchor at 1 GW (~$3.6/W around 1998-1999) -> ~22% long-run learning rate tracks ~$50-$90/W in 1976 down to ~$0.15-$0.20/W at ~3 TW
    priceAt(cumGw, lr = 0.22, pAt1Gw = 3.6) {
      const b = -Math.log2(1 - clamp(lr, 0.05, 0.45));
      return pAt1Gw * Math.pow(Math.max(1e-5, cumGw), -b);
    },
    systemCost(cumGw, lr = 0.22, bosAt20Pct = 0.45, moduleEff = 0.227) {
      const mod = learning.priceAt(cumGw, lr);
      // Area-proportional BOS (racking, glass, land, DC wiring, install labor) scales inversely with module efficiency;
      // inverter & transformer (~35% of BOS) scale per Watt, rest (~65%) scales per m^2.
      const areaFrac = 0.65;
      const bos = bosAt20Pct * ((1 - areaFrac) + areaFrac * (0.20 / clamp(moduleEff, 0.10, 0.40)));
      const total = mod + bos;
      return {
        cumGw,
        lr,
        moduleEff,
        modUsdPerW: mod,
        bosUsdPerW: bos,
        totalUsdPerW: total,
        modShare: mod / total
      };
    }
  };

  /* ── 8. Dated Frontier items (verified as of 2026-11-13) ── */
  const frontier = [
    { id: 'iea3tw',   kind: 'prod',  date: '2026-04', cat: 'scale' },
    { id: 'ntype',    kind: 'prod',  date: '2025-11', cat: 'si' },
    { id: 'sibest',   kind: 'demo',  date: '2026-06', cat: 'si' },
    { id: 'tandem35', kind: 'demo',  date: '2026-07', cat: 'tandem' },
    { id: 'perolab',  kind: 'demo',  date: '2026-06', cat: 'pero' },
    { id: 'iec61215', kind: 'claim', date: '2026-08', cat: 'tandem' },
    { id: 'spotbos',  kind: 'prod',  date: '2026-06', cat: 'cost' }
  ];

  return {
    H, C, K, Q, SIGMA, HC_EV_NM, T_SUN, TSI_AM0,
    vth, clamp,
    spectrum, bandgap, sq, iv, tandem, grid, learning, frontier
  };
}));
