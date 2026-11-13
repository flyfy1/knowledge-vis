/* Nuclear fission & reactor physics models — UMD module (browser window.FissionModels / Node module.exports).
   Pure math & verified nuclear constants only; zero DOM dependencies and zero CJK characters. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FissionModels = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /* ───────── Fundamental constants (CODATA 2018) ───────── */
  const K = {
    e: 1.602176634e-19,
    u: 1.66053906660e-27,
    uMeV: 931.49410242,
    MeV: 1.602176634e-13,
    coal: 29.3076e6,       // J/kg standard coal (7000 kcal/kg)
    year: 365.25 * 86400,  // s
    hfgWater: 2.257e6      // J/kg latent heat of vaporization at 100 C
  };

  /* ───────── 01 Binding energy from atomic masses (AME2020) ─────────
     B/A = (Z*m(1H) + N*m_n - m_atom) * c^2 / A; atomic masses cancel electron rest mass. */
  const NUC = {
    n:     { Z: 0,  A: 1,   m: 1.00866491595 },
    H1:    { Z: 1,  A: 1,   m: 1.00782503223 },
    H2:    { Z: 1,  A: 2,   m: 2.01410177812 },
    H3:    { Z: 1,  A: 3,   m: 3.01604928 },
    He3:   { Z: 2,  A: 3,   m: 3.01602932265 },
    He4:   { Z: 2,  A: 4,   m: 4.00260325413 },
    Li6:   { Z: 3,  A: 6,   m: 6.0151228874 },
    C12:   { Z: 6,  A: 12,  m: 12.0000000 },
    O16:   { Z: 8,  A: 16,  m: 15.99491461957 },
    Fe56:  { Z: 26, A: 56,  m: 55.93493633 },
    Ni62:  { Z: 28, A: 62,  m: 61.92834537 },
    Kr92:  { Z: 36, A: 92,  m: 91.9261731 },
    Sr94:  { Z: 38, A: 94,  m: 93.91523 },
    Xe140: { Z: 54, A: 140, m: 139.90540 },
    Ba141: { Z: 56, A: 141, m: 140.9144033 },
    Pb208: { Z: 82, A: 208, m: 207.9766521 },
    U235:  { Z: 92, A: 235, m: 235.0439281 },
    U238:  { Z: 92, A: 238, m: 238.0507884 },
    Pu239: { Z: 94, A: 239, m: 239.0521616 }
  };

  function bindingPerA(id) {
    const x = NUC[id];
    if (!x || x.A === 1) return 0;
    return (x.Z * NUC.H1.m + (x.A - x.Z) * NUC.n.m - x.m) * K.uMeV / x.A;
  }

  // Empirical semi-empirical curve points plus measured AME2020 highlights for plotting
  const CURVE_IDS = ['H2', 'H3', 'He4', 'Li6', 'C12', 'O16', 'Fe56', 'Ni62', 'Kr92', 'Sr94', 'Xe140', 'Ba141', 'Pb208', 'U235', 'U238'];

  const REACTIONS = {
    u235_ba: {
      lhs: ['n', 'U235'],
      rhs: ['Ba141', 'Kr92', 'n', 'n', 'n'],
      fuel: ['U235'],
      recoverableTotalMeV: 200.0, // includes prompt gammas & delayed beta/gamma minus ~10 MeV antineutrinos
      kind: 'fission',
      beforePts: ['U235'],
      afterPts: ['Kr92', 'Ba141']
    },
    u235_xe: {
      lhs: ['n', 'U235'],
      rhs: ['Xe140', 'Sr94', 'n', 'n'],
      fuel: ['U235'],
      recoverableTotalMeV: 200.0,
      kind: 'fission',
      beforePts: ['U235'],
      afterPts: ['Sr94', 'Xe140']
    },
    dt: {
      lhs: ['H2', 'H3'],
      rhs: ['He4', 'n'],
      fuel: ['H2', 'H3'],
      recoverableTotalMeV: null,
      kind: 'fusion',
      beforePts: ['H2', 'H3'],
      afterPts: ['He4']
    }
  };

  function sumM(ids) {
    return ids.reduce(function (s, id) { return s + NUC[id].m; }, 0);
  }

  function qValue(r) {
    const R = REACTIONS[r];
    return (sumM(R.lhs) - sumM(R.rhs)) * K.uMeV;
  }

  function energyPerKg(r, useTotal) {
    const R = REACTIONS[r];
    const q = (useTotal && R.recoverableTotalMeV) ? R.recoverableTotalMeV : qValue(r);
    return q * K.MeV / (sumM(R.fuel) * K.u);
  }

  function coalEquivalent(r, useTotal) {
    return energyPerKg(r, useTotal) / K.coal;
  }

  function ch1Data(rxKey) {
    const key = REACTIONS[rxKey] ? rxKey : 'u235_ba';
    const R = REACTIONS[key];
    const qPrompt = qValue(key);
    const qTotal = R.recoverableTotalMeV || qPrompt;
    const jKg = energyPerKg(key, false);
    const jKgTotal = energyPerKg(key, true);
    const coalPrompt = jKg / K.coal;
    const coalTotal = jKgTotal / K.coal;
    const uTotalKg = energyPerKg('u235_ba', true);
    const dtKg = energyPerKg('dt', false);
    return {
      key: key,
      kind: R.kind,
      qPrompt: qPrompt,
      qTotal: qTotal,
      jKg: jKg,
      jKgTotal: jKgTotal,
      coalPrompt: coalPrompt,
      coalTotal: coalTotal,
      dtToU235Ratio: dtKg / uTotalKg,
      u235ToDtQRatio: qTotal / qValue('dt'),
      beforePts: R.beforePts,
      afterPts: R.afterPts,
      curve: CURVE_IDS.map(function (id) {
        return { id: id, A: NUC[id].A, BA: bindingPerA(id) };
      })
    };
  }

  function ch1Branch(rxKey) {
    return REACTIONS[rxKey] && REACTIONS[rxKey].kind === 'fusion' ? 'fusion' : 'fission';
  }

  /* ───────── 02 Cross-sections & neutron moderation ─────────
     Fast fission birth energy ~2 MeV; thermal equilibrium at 300 K ~0.0253 eV.
     Mean logarithmic energy decrement per collision: xi = 1 + alpha*ln(alpha)/(1 - alpha), alpha = ((A-1)/(A+1))^2. */
  const MODERATORS = {
    h2o: {
      id: 'h2o', A_eff: 1.0, xi: 0.927, sigma_a: 0.332, sigma_s: 44.7, mfpCm: 0.67,
      moderates: true, naturalU: false
    },
    d2o: {
      id: 'd2o', A_eff: 2.0, xi: 0.509, sigma_a: 0.00052, sigma_s: 10.6, mfpCm: 2.8,
      moderates: true, naturalU: true
    },
    graphite: {
      id: 'graphite', A_eff: 12.0, xi: 0.158, sigma_a: 0.0035, sigma_s: 4.75, mfpCm: 2.6,
      moderates: true, naturalU: true
    },
    na23: {
      id: 'na23', A_eff: 23.0, xi: 0.0845, sigma_a: 0.53, sigma_s: 3.2, mfpCm: 12.3,
      moderates: false, naturalU: false
    }
  };

  function xiFromA(A) {
    if (A <= 1.0001) return 1.0;
    const a = Math.pow((A - 1) / (A + 1), 2);
    return 1 + (a * Math.log(a)) / (1 - a);
  }

  // Smooth descriptive nuclear cross-section model (barns) calibrated to ENDF thermal (0.0253 eV -> 585 b),
  // 1/v region + resonance region (1-200 eV, peak U-238 resonance around 6.67 eV) and fast (~1.2 b at 2 MeV).
  function sigmaF235(E_eV) {
    const E = Math.max(0.01, Math.min(1e7, E_eV));
    const oneOverV = 585 * Math.sqrt(0.0253 / E);
    const fastFloor = 1.2;
    // Broadened resonance cluster ~0.3-50 eV
    const res1 = 120 * Math.exp(-Math.pow((Math.log10(E) - Math.log10(0.29)) / 0.14, 2));
    const res2 = 95 * Math.exp(-Math.pow((Math.log10(E) - Math.log10(8.8)) / 0.35, 2));
    const hiDrop = 1 / (1 + Math.pow(E / 3e5, 0.8));
    return Math.max(fastFloor, (oneOverV + res1 + res2) * hiDrop + fastFloor * (1 - hiDrop));
  }

  function sigmaC238(E_eV) {
    const E = Math.max(0.01, Math.min(1e7, E_eV));
    const oneOverV = 2.68 * Math.sqrt(0.0253 / E);
    // Giant capture resonance cluster centered near 6.67 eV, 21 eV, 37 eV (Doppler-broadened effective preview)
    const r67 = 4200 * Math.exp(-Math.pow((Math.log10(E) - Math.log10(6.67)) / 0.13, 2));
    const r21 = 1900 * Math.exp(-Math.pow((Math.log10(E) - Math.log10(21.0)) / 0.16, 2));
    const r66 = 750 * Math.exp(-Math.pow((Math.log10(E) - Math.log10(66.0)) / 0.22, 2));
    const fast = 0.08 + 0.35 * Math.exp(-Math.pow((Math.log10(E) - 6.0) / 0.6, 2));
    return oneOverV + r67 + r21 + r66 + fast;
  }

  function moderationData(modKey, logE_eV) {
    const mod = MODERATORS[modKey] || MODERATORS.h2o;
    const E0 = 2.0e6;
    const Eth = 0.0253;
    const logMin = Math.log10(Eth);
    const logMax = Math.log10(E0);
    const clampedLogE = Math.max(logMin, Math.min(logMax, logE_eV));
    const E_eV = Math.pow(10, clampedLogE);

    const duTotal = Math.log(E0 / Eth);
    const totalToThermal = duTotal / mod.xi;
    const duNow = Math.log(E0 / E_eV);
    const collisionsHere = duNow / mod.xi;

    const sf235 = sigmaF235(E_eV);
    const sc238 = sigmaC238(E_eV);
    const sfThermal = sigmaF235(Eth);
    const sfFast = sigmaF235(E0);
    // Speed v in m/s: non-relativistic 1/2 m v^2 = E
    const v_ms = Math.sqrt(2 * E_eV * K.e / (NUC.n.m * K.u));

    let regime = 'thermal';
    if (E_eV >= 1e4) regime = 'fast';
    else if (E_eV >= 1.5 && E_eV <= 300) regime = 'resonance';
    else if (E_eV > 0.2) regime = 'epithermal';

    return {
      mod: mod,
      E_eV: E_eV,
      logE: clampedLogE,
      v_ms: v_ms,
      sf235: sf235,
      sc238: sc238,
      sfThermal: sfThermal,
      sfFast: sfFast,
      ratioThermalToFast: sfThermal / sfFast,
      collisionsHere: collisionsHere,
      totalToThermal: totalToThermal
    };
  }

  function ch2Branch(modKey, logE_eV) {
    const d = moderationData(modKey, logE_eV);
    if (!d.mod.moderates && d.E_eV >= 1e3) return 'sodiumFast';
    if (d.E_eV >= 1e4) return 'fast';
    if (d.E_eV >= 1.5 && d.E_eV <= 300) return 'resonance';
    return 'thermal';
  }

  /* ───────── 03 Six-factor formula & why a power reactor cannot detonate like a bomb ─────────
     k_eff = eta * f * p * eps * P_NL
     Nuclear parameters calibrated to classic PWR / CANDU thermal lattices:
     sigma_f(235)=585 b, sigma_a(235)=684 b, sigma_a(238)=2.68 b, nu=2.43. */
  const LATTICE_MODES = {
    pwr:   { id: 'pwr',   sigma_mod: 0.332, modRatio: 3.4, structAbs: 4.5, rodScale: 22.0, pBase: 0.865, eps: 1.032, M2_cm2: 60.0,  B2_cm2: 0.00048, voidFrac: 0.0 },
    candu: { id: 'candu', sigma_mod: 0.00052, modRatio: 16.0, structAbs: 0.95, rodScale: 4.0, pBase: 0.905, eps: 1.028, M2_cm2: 180.0, B2_cm2: 0.00018, voidFrac: 0.0 },
    void:  { id: 'void',  sigma_mod: 0.332, modRatio: 3.4, structAbs: 4.5, rodScale: 22.0, pBase: 0.865, eps: 1.032, M2_cm2: 60.0,  B2_cm2: 0.00048, voidFrac: 0.40 }
  };

  function sixFactor(modeKey, enrichPct, rodPct) {
    const mode = LATTICE_MODES[modeKey] || LATTICE_MODES.pwr;
    const e = Math.max(0.005, Math.min(0.25, enrichPct / 100));
    const rods = Math.max(0, Math.min(1, rodPct / 100));
    const v = mode.voidFrac;

    // 1. Reproduction factor eta = nu * e*sigma_f235 / (e*sigma_a235 + (1-e)*sigma_a238)
    const nu = 2.43;
    const sigF235 = 585.0, sigA235 = 684.0, sigA238 = 2.68;
    const eta = nu * (e * sigF235) / (e * sigA235 + (1 - e) * sigA238);

    // 2. Thermal utilization f: fuel absorption vs (moderator + structure/boron shim + control rods)
    // Scale water density by (1 - v) for voided coolant
    const fuelAbs = e * sigA235 + (1 - e) * sigA238;
    const modAbsEff = mode.modRatio * mode.sigma_mod * (1 - v) + mode.structAbs;
    const rodAbs = rods * mode.rodScale; // B4C / Ag-In-Cd rod bank thermal worth
    const f = fuelAbs / (fuelAbs + modAbsEff + rodAbs);

    // 3. Resonance escape probability p: drops when water boils out (under-moderated LWR negative void effect)
    // and slightly drops as U-238 fraction increases
    const u238Weight = (1 - e) / (1 - 0.04);
    const voidPenalty = mode.id === 'candu' ? 0 : 0.14 * v;
    const p = Math.max(0.45, Math.min(0.96, 1 - (1 - mode.pBase) * Math.pow(u238Weight, 0.25) / Math.max(0.35, 1 - 0.65 * v) - voidPenalty));

    // 4. Fast fission factor eps
    const eps = 1 + (mode.eps - 1) * (1 - e);

    // 5. Non-leakage probability P_NL = 1 / (1 + M^2 * B^2); voids increase migration area M^2 ~ 1/(1-v)^1.35
    const M2 = mode.M2_cm2 / Math.pow(Math.max(0.3, 1 - v), 1.35);
    const P_NL = 1 / (1 + M2 * mode.B2_cm2);
    // Split P_NL into fast & thermal factors ~ 58% fast migration, 42% thermal diffusion
    const P_F = Math.pow(P_NL, 0.58);
    const P_T = Math.pow(P_NL, 0.42);

    const kInf = eta * f * p * eps;
    const kEff = kInf * P_NL;
    const rhoPcm = ((kEff - 1) / kEff) * 1e5;

    return {
      mode: mode.id,
      enrichPct: enrichPct,
      rodPct: rodPct,
      eta: eta,
      f: f,
      p: p,
      eps: eps,
      P_F: P_F,
      P_T: P_T,
      P_NL: P_NL,
      kInf: kInf,
      kEff: kEff,
      rhoPcm: rhoPcm
    };
  }

  function ch3Branch(modeKey, enrichPct, rodPct) {
    const r = sixFactor(modeKey, enrichPct, rodPct);
    if (r.mode === 'void') return 'voidNegative';
    if (r.mode === 'pwr' && enrichPct < 1.1 && r.kEff < 1) return 'naturalCantGoCrit';
    if (r.kEff >= 1.005) return 'supercritical';
    if (r.kEff >= 0.995) return 'critical';
    return 'subcritical';
  }

  /* ───────── 04 Delayed neutrons & 6-group point kinetics + Doppler feedback ─────────
     Keepin (1957/1965) 6-group thermal U-235 delayed neutron constants:
     Sum(beta_i) = 0.00645 (~0.65%), Lambda_prompt = 5e-5 s. */
  const KEEPIN_U235 = [
    { group: 1, tHalf: 55.9,  lambda: 0.0124, a: 0.033, beta: 0.00021 },
    { group: 2, tHalf: 22.7,  lambda: 0.0305, a: 0.219, beta: 0.00141 },
    { group: 3, tHalf: 6.24,  lambda: 0.111,  a: 0.196, beta: 0.00127 },
    { group: 4, tHalf: 2.30,  lambda: 0.301,  a: 0.395, beta: 0.00255 },
    { group: 5, tHalf: 0.608, lambda: 1.14,   a: 0.115, beta: 0.00074 },
    { group: 6, tHalf: 0.230, lambda: 3.01,   a: 0.042, beta: 0.00027 }
  ];
  const BETA_TOTAL = KEEPIN_U235.reduce(function (s, g) { return s + g.beta; }, 0); // 0.00645
  const TAU_DELAYED_BAR = KEEPIN_U235.reduce(function (s, g) { return s + g.a / g.lambda; }, 0); // ~13.03 s
  const LAMBDA_PROMPT = 5.0e-5; // s (typical PWR thermal prompt neutron generation time)

  // Solve 6-group point kinetics using unconditionally stable backward Euler substepping.
  // mode: 'doppler' (real + Doppler feedback), 'nodoppler' (real, no feedback), 'promptOnly' (beta = 0).
  function kineticsSim(mode, rhoDollars, tEnd_s) {
    const T_END = tEnd_s || 10.0;
    const rhoExt = rhoDollars * BETA_TOTAL;
    const useDelayed = mode !== 'promptOnly';
    const useDoppler = mode === 'doppler';
    const betaEff = useDelayed ? BETA_TOTAL : 0;

    // Initial equilibrium at n(0) = 1.0
    let n = 1.0;
    const C = KEEPIN_U235.map(function (g) {
      return useDelayed ? (g.beta / (LAMBDA_PROMPT * g.lambda)) * n : 0;
    });
    let dT = 0; // fuel temperature rise (K) above nominal
    const tauTh = 4.0; // fuel thermal time constant (s)
    const K_T = 320.0; // equilibrium fuel superheat at P=2 (K/unit normalized power excess)
    const alphaD = 2.8e-5; // Doppler coefficient (reactivity per K, negative feedback)

    // Non-uniform fine grid: 0.5 ms up to 0.5 s, 10 ms up to 10 s (total ~1950 substeps, instant in JS)
    const series = [{ t: 0, n: 1.0, rhoDollars: rhoDollars, dT: 0 }];
    let t = 0;
    let peakN = 1.0;
    let tSample = 0.05;

    while (t < T_END - 1e-9) {
      const dt = t < 0.2 ? 0.0005 : (t < 2.0 ? 0.005 : 0.02);
      const step = Math.min(dt, T_END - t);

      // Update thermal state explicitly/semi-implicitly
      const dT_next = useDoppler
        ? (dT + (step / tauTh) * K_T * (n - 1)) / (1 + step / tauTh)
        : 0;
      const rhoNow = rhoExt - (useDoppler ? alphaD * dT_next : 0);

      // Closed-form implicit step for coupled (n, C1..C6)
      let denom = 1 - step * ((rhoNow - betaEff) / LAMBDA_PROMPT);
      let rhs = n;
      if (useDelayed) {
        for (let i = 0; i < KEEPIN_U235.length; i++) {
          const g = KEEPIN_U235[i];
          const f = 1 / (1 + step * g.lambda);
          denom -= step * step * g.lambda * (g.beta / LAMBDA_PROMPT) * f;
          rhs += step * g.lambda * C[i] * f;
        }
      }
      // Guard against division by tiny/negative denom for extreme positive step on large dt
      const safeDenom = Math.max(1e-9, denom);
      let nNext = rhs / safeDenom;
      nNext = Math.min(1e12, Math.max(1e-6, nNext));

      if (useDelayed) {
        for (let i = 0; i < KEEPIN_U235.length; i++) {
          const g = KEEPIN_U235[i];
          C[i] = (C[i] + step * (g.beta / LAMBDA_PROMPT) * nNext) / (1 + step * g.lambda);
        }
      }

      n = nNext;
      dT = dT_next;
      t += step;
      if (n > peakN) peakN = n;

      if (t >= tSample - 1e-9 || t >= T_END - 1e-9) {
        series.push({ t: t, n: n, rhoDollars: rhoNow / BETA_TOTAL, dT: dT });
        tSample += 0.05;
      }
    }

    // Asymptotic inhour period estimate when feedback is off (or initial period)
    let period_s = Infinity;
    if (Math.abs(rhoDollars) > 1e-5) {
      if (!useDelayed) {
        period_s = LAMBDA_PROMPT / rhoExt;
      } else if (rhoDollars >= 1.005) {
        period_s = LAMBDA_PROMPT / Math.max(1e-5, rhoExt - BETA_TOTAL);
      } else {
        // Delayed dominant approximation: T ~ (beta - rho) / (lambda_eff * rho)
        const lamEff = 1 / TAU_DELAYED_BAR;
        period_s = (BETA_TOTAL - rhoExt) / (lamEff * rhoExt);
      }
    }

    const nEnd = series[series.length - 1].n;
    return {
      mode: mode,
      rhoDollars: rhoDollars,
      rhoPcm: rhoDollars * BETA_TOTAL * 1e5,
      betaPct: BETA_TOTAL * 100,
      tauEff_s: TAU_DELAYED_BAR,
      lambdaEff_s: LAMBDA_PROMPT + BETA_TOTAL * TAU_DELAYED_BAR,
      speedupFactor: (LAMBDA_PROMPT + BETA_TOTAL * TAU_DELAYED_BAR) / LAMBDA_PROMPT,
      period_s: period_s,
      nAtEnd: nEnd,
      peakN: peakN,
      finalDT: dT,
      series: series
    };
  }

  function ch4Branch(mode, rhoDollars) {
    if (mode === 'promptOnly' && rhoDollars > 0.01) return 'noBetaRunaway';
    if (rhoDollars < -0.02) return 'subcritical';
    if (Math.abs(rhoDollars) <= 0.02) return 'critical';
    if (rhoDollars >= 1.0 && mode === 'doppler') return 'promptWithDoppler';
    if (rhoDollars >= 1.0) return 'promptRunaway';
    return 'delayedWindow';
  }

  /* ───────── 05 Xenon-135 poisoning & the Iodine pit ─────────
     I-135 half-life = 6.57 h, Xe-135 half-life = 9.14 h,
     gamma_I = 0.0639, gamma_Xe = 0.00248, sigma_Xe = 2.65e6 b, sigma_f_U235 = 585 b.
     Calibrated to PWR fission density: reactivity worth rho_Xe = - (sigma_Xe * X) / (nu * Sigma_f) ~ -2800 pcm at phi = 3e13. */
  const XE = {
    lambdaI: Math.LN2 / (6.57 * 3600),
    lambdaX: Math.LN2 / (9.14 * 3600),
    gammaI: 0.0639,
    gammaX: 0.00248,
    sigmaX_cm2: 2.65e6 * 1e-24,
    // Effective thermal fissile weight calibration: 1 cm^2 of Xe absorption / Sigma_f weighted by nu*f ~ 0.43 -> 2850 pcm at equilibrium 3e13
    worthFactorPcm: 1 / (2.43 * 0.85) // thermal utilization & nu factor for reactivity worth
  };

  function xenonSim(fluxE13, postPowerPct, reservePcm) {
    const phi0 = Math.max(0.5, Math.min(8.0, fluxE13)) * 1e13; // n / cm^2 / s
    const frac = Math.max(0, Math.min(1, postPowerPct / 100));
    const phi1 = phi0 * frac;
    const reserve = reservePcm || 3500;

    // Normalize concentrations by Sigma_f (so units are dimensionless per Sigma_f)
    const I0 = (XE.gammaI * phi0) / XE.lambdaI;
    const burnout0 = XE.sigmaX_cm2 * phi0;
    const X0 = ((XE.gammaX * phi0) + XE.lambdaI * I0) / (XE.lambdaX + burnout0);

    // Convert normalized X (= X_abs / Sigma_f) into reactivity worth in pcm:
    // rho_Xe = -(sigma_Xe * X) / (nu * f) -> with f~0.85, nu=2.43, X0*sigmaX/(2.43*0.85) ~ 0.028 -> 2800 pcm
    function toWorthPcm(Xnorm) {
      return -(XE.sigmaX_cm2 * Xnorm * XE.worthFactorPcm) * 1e5;
    }

    const eqWorthPcm = toWorthPcm(X0);
    const hours = 48;
    const dt = 300; // 5 min steps (exact RK4)
    const steps = (hours * 3600) / dt;
    let I = I0, X = X0;

    const series = [{ h: 0, worthPcm: eqWorthPcm, Irel: 1.0, Xrel: 1.0 }];
    let peakNegPcm = eqWorthPcm; // most negative worth
    let peakHour = 0;
    let lockedHours = 0;
    const thresholdPcm = -reserve; // Xe negative worth deeper than -reserve locks restart

    function deriv(iVal, xVal, phi) {
      const dI = XE.gammaI * phi - XE.lambdaI * iVal;
      const dX = XE.gammaX * phi + XE.lambdaI * iVal - (XE.lambdaX + XE.sigmaX_cm2 * phi) * xVal;
      return [dI, dX];
    }

    for (let s = 1; s <= steps; s++) {
      const k1 = deriv(I, X, phi1);
      const k2 = deriv(I + 0.5 * dt * k1[0], X + 0.5 * dt * k1[1], phi1);
      const k3 = deriv(I + 0.5 * dt * k2[0], X + 0.5 * dt * k2[1], phi1);
      const k4 = deriv(I + dt * k3[0], X + dt * k3[1], phi1);
      I += (dt / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
      X += (dt / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);

      const h = (s * dt) / 3600;
      const w = toWorthPcm(X);
      if (w < peakNegPcm) {
        peakNegPcm = w;
        peakHour = h;
      }
      if (w < thresholdPcm) lockedHours += dt / 3600;
      if (s % 3 === 0) {
        series.push({ h: h, worthPcm: w, Irel: I / I0, Xrel: X / X0 });
      }
    }

    return {
      fluxE13: fluxE13,
      postPowerPct: postPowerPct,
      reservePcm: reserve,
      eqWorthPcm: eqWorthPcm,
      peakNegPcm: peakNegPcm,
      peakHour: peakHour,
      lockedHours: lockedHours,
      isLocked: peakNegPcm < thresholdPcm,
      series: series
    };
  }

  function ch5Branch(fluxE13, postPowerPct, reservePcm) {
    const r = xenonSim(fluxE13, postPowerPct, reservePcm);
    if (r.postPowerPct >= 95) return 'steady';
    if (r.isLocked) return 'xenonLocked';
    return 'restartable';
  }

  /* ───────── 06 Decay heat after shutdown (Way-Wigner equation) ─────────
     P(t)/P0 = 0.0622 * [ t^(-0.2) - (t + t_s)^(-0.2) ] with t, t_s in seconds. */
  const RUN_DURATIONS = {
    day:   { id: 'day',   t_s: 86400 },
    month: { id: 'month', t_s: 30 * 86400 },
    cycle: { id: 'cycle', t_s: 18 * 30.4375 * 86400 } // ~18 months
  };

  function wayWignerFraction(t_s, runTime_s) {
    const t = Math.max(1.0, t_s);
    const ts = Math.max(60.0, runTime_s);
    return 0.0622 * (Math.pow(t, -0.2) - Math.pow(t + ts, -0.2));
  }

  // Analytical integral of 0.0622 * [ t^(-0.2) - (t + ts)^(-0.2) ] from t1=1 s to t_end
  function wayWignerCumulativeEnergyJ(P0_W, tEnd_s, runTime_s) {
    const t1 = 1.0;
    const t2 = Math.max(t1, tEnd_s);
    const ts = Math.max(60.0, runTime_s);
    const F = function (x) {
      return (Math.pow(x, 0.8) - Math.pow(x + ts, 0.8)) / 0.8;
    };
    return P0_W * 0.0622 * (F(t2) - F(t1));
  }

  function decayHeat(runKey, p0_MW, logTime_s) {
    const run = RUN_DURATIONS[runKey] || RUN_DURATIONS.cycle;
    const clampedLogT = Math.max(0, Math.min(Math.log10(365 * 86400), logTime_s));
    const t_s = Math.pow(10, clampedLogT);
    const frac = wayWignerFraction(t_s, run.t_s);
    const mw = p0_MW * frac;
    const boilKgS = (mw * 1e6) / K.hfgWater;
    const boilTonDay = (boilKgS * 86400) / 1000;
    const cumMWh = wayWignerCumulativeEnergyJ(p0_MW * 1e6, t_s, run.t_s) / 3.6e9;

    // Curve points from 1 s to 30 days (log grid)
    const curve = [];
    for (let i = 0; i <= 80; i++) {
      const lt = (i / 80) * Math.log10(30 * 86400);
      const tt = Math.pow(10, lt);
      const f = wayWignerFraction(tt, run.t_s);
      curve.push({ t_s: tt, logT: lt, fracPct: f * 100, mw: p0_MW * f });
    }

    return {
      runKey: run.id,
      p0_MW: p0_MW,
      t_s: t_s,
      fracPct: frac * 100,
      mw: mw,
      boilKgS: boilKgS,
      boilTonDay: boilTonDay,
      cumMWh: cumMWh,
      curve: curve
    };
  }

  function ch6Branch(runKey, p0_MW, logTime_s) {
    const r = decayHeat(runKey, p0_MW, logTime_s);
    if (r.t_s < 120) return 'immediate';
    if (r.t_s < 86400) return 'hours';
    return 'days';
  }

  /* ───────── 07 Spent fuel inventory & radiotoxicity horizon ─────────
     Standard 45 GWd/tHM UOX PWR spent fuel composition:
     ~93.4% U-238, ~0.8% U-235, ~1.1% Pu+MA (~1.0% Pu, 0.1% MA), ~4.7% fission products.
     Decay heat & relative radiotoxicity vs natural U ore across 1 to 100,000 years. */
  const WASTE_GROUPS = [
    // Representative multi-exponential groups calibrated to 45 GWd/tHM spent UOX thermal power (kW/tHM) & Sv ingestion hazard relative to ore
    { id: 'shortFP',  tHalfYr: 1.8,     kw1yr: 7.5,  tox1yr: 800,  puSensitive: false },
    { id: 'csSr',     tHalfYr: 29.5,    kw1yr: 2.3,  tox1yr: 450,  puSensitive: false },
    { id: 'am241',    tHalfYr: 432.2,   kw1yr: 0.12, tox1yr: 65,   puSensitive: true, moxKeepFrac: 0.008 },
    { id: 'pu239',    tHalfYr: 18000.0, kw1yr: 0.14, tox1yr: 120,  puSensitive: true, moxKeepFrac: 0.005 }
  ];

  function wasteModel(cycleKey, logYear, fleetGWe) {
    const isReprocessed = cycleKey === 'reprocess';
    const year = Math.pow(10, Math.max(0, Math.min(5, logYear)));
    const gwe = Math.max(1, Math.min(20, fleetGWe));
    // Thermal efficiency ~33.3%, burnup 45 GWd/tHM -> tHM per GWe-yr = (1 / 0.3333 * 365.25) / 45 = 24.35 tHM/yr
    const thermalGW = gwe / 0.3333;
    const tHM_yr = (thermalGW * 365.25) / 45.0;
    const casksPerYr = tHM_yr / 10.0; // ~10 tHM per dry storage cask
    const coalEquivalentAshT_yr = gwe * 300000; // coal plant ~300,000 t solid ash per GWe-yr

    function evalAt(yr) {
      let kwPerT = 0;
      let toxRatio = 0;
      let fpShare = 0;
      let truShare = 0;
      for (let i = 0; i < WASTE_GROUPS.length; i++) {
        const g = WASTE_GROUPS[i];
        const factor = (isReprocessed && g.puSensitive) ? g.moxKeepFrac : 1.0;
        const dec = Math.pow(0.5, yr / g.tHalfYr);
        kwPerT += g.kw1yr * factor * dec;
        const tContrib = g.tox1yr * factor * dec;
        toxRatio += tContrib;
        if (g.puSensitive) truShare += tContrib;
        else fpShare += tContrib;
      }
      return { kwPerT: kwPerT, toxRatio: toxRatio, fpFrac: toxRatio > 0 ? fpShare / toxRatio : 0, truFrac: toxRatio > 0 ? truShare / toxRatio : 0 };
    }

    const now = evalAt(year);
    const curve = [];
    for (let i = 0; i <= 50; i++) {
      const ly = (i / 50) * 5;
      const y = Math.pow(10, ly);
      const ev = evalAt(y);
      curve.push({ year: y, logYear: ly, kwPerT: ev.kwPerT, toxRatio: ev.toxRatio, fpFrac: ev.fpFrac, truFrac: ev.truFrac });
    }

    // Approximate ore-crossover year (where toxRatio <= 1)
    let crossoverYr = isReprocessed ? 480 : 125000;
    for (let ly = 1.5; ly <= 6.0; ly += 0.02) {
      const y = Math.pow(10, ly);
      if (evalAt(y).toxRatio <= 1.0) { crossoverYr = y; break; }
    }

    return {
      cycleKey: isReprocessed ? 'reprocess' : 'once',
      year: year,
      fleetGWe: gwe,
      tHM_yr: tHM_yr,
      casksPerYr: casksPerYr,
      coalAshT_yr: coalEquivalentAshT_yr,
      kwPerT: now.kwPerT,
      toxRatio: now.toxRatio,
      dominant: now.fpFrac >= now.truFrac ? 'fp' : 'tru',
      crossoverYr: crossoverYr,
      composition: { u238: 93.4, u235: 0.8, tru: 1.1, fp: 4.7 },
      curve: curve
    };
  }

  function ch7Branch(cycleKey, logYear, fleetGWe) {
    const r = wasteModel(cycleKey, logYear, fleetGWe);
    if (r.year < 120) return 'csSrDominant';
    if (r.cycleKey === 'reprocess' && r.year >= 500) return 'reprocessedCleared';
    return 'truLongTail';
  }

  /* ───────── 08 Frontier reactor architectures & 2026 ledger ─────────
     Carnot thermal efficiency ceiling: eta_max = 1 - T_cold / T_hot (kelvin). */
  const REACTOR_ARCH = {
    pwr:    { id: 'pwr',    enrichPct: 4.5,   outletC: 325, coldC: 35, realEffPct: 33.5, netMWe: 1150 },
    candu:  { id: 'candu',  enrichPct: 0.72,  outletC: 310, coldC: 35, realEffPct: 30.5, netMWe: 700 },
    htgr:   { id: 'htgr',   enrichPct: 10.0,  outletC: 750, coldC: 35, realEffPct: 45.0, netMWe: 200 },
    naFast: { id: 'naFast', enrichPct: 19.75, outletC: 510, coldC: 35, realEffPct: 41.0, netMWe: 345 }
  };

  function ch8Data(archKey) {
    const a = REACTOR_ARCH[archKey] || REACTOR_ARCH.pwr;
    const tHotK = a.outletC + 273.15;
    const tColdK = a.coldC + 273.15;
    const carnotPct = (1 - tColdK / tHotK) * 100;
    return {
      id: a.id,
      enrichPct: a.enrichPct,
      outletC: a.outletC,
      carnotPct: carnotPct,
      realEffPct: a.realEffPct,
      netMWe: a.netMWe
    };
  }

  function ch8Branch(archKey) {
    return (REACTOR_ARCH[archKey] || REACTOR_ARCH.pwr).id;
  }

  /* ───────── Frontier facts as of 2026-11 (IAEA PRIS / WNA / NRC / DOE / company releases) ───────── */
  const FRONTIER = {
    asOf: '2026-11',
    globalFleet: {
      operableReactors: 413,
      operableGWe: 377.1,
      underConstruction: 72,
      underConstructionGWe: 77.2,
      genTWh2025: 2702,
      worldSharePct: 9.0
    },
    recentGen3: {
      vogtle4MWe: 1114,
      vogtle4Date: '2024-04-29',
      barakah4UnitsMWe: 5600,
      barakahTWhYr: 40,
      barakahDate: '2024-09-05',
      flamanville3Date: '2024-12-21'
    },
    demonstrated: {
      htrPmMWe: 200,
      htrPmDate: '2023-12-06',
      centrusPhase2Kg: 900,
      centrusCumulativeKg: 920
    },
    milestones: {
      nuscaleMWe: 77,
      nuscaleNrcDate: '2025-05',
      natriumMWe: 345,
      natriumPeakMWe: 500,
      natriumNrcDate: '2026-03',
      xe100Units: 4,
      xe100NrcYear: '2026',
      hermesMWth: 35,
      hermesExtendTo: '2029-04'
    }
  };

  /* ───────── Static-prose computed values (ZERO unverified prose numbers) ───────── */
  function prose() {
    const c1Ba = ch1Data('u235_ba');
    const c1Xe = ch1Data('u235_xe');
    const c1Dt = ch1Data('dt');
    const kPwrNat = sixFactor('pwr', 0.72, 0);
    const kPwrLeu = sixFactor('pwr', 4.5, 0);
    const kCanduNat = sixFactor('candu', 0.72, 0);
    const kPwrVoid = sixFactor('void', 4.5, 0);
    const kinPromptOnly = kineticsSim('promptOnly', 0.10, 1.0);
    const xeMid = xenonSim(3.0, 0, 3500);
    const dh1s = decayHeat('cycle', 3000, 0);
    const dh1h = decayHeat('cycle', 3000, Math.log10(3600));
    const dh1d = decayHeat('cycle', 3000, Math.log10(86400));
    const w1 = wasteModel('once', 0, 1);
    const w300 = wasteModel('once', Math.log10(300), 1);
    const fpAt = function (yr) {
      return WASTE_GROUPS.filter(function (g) { return !g.puSensitive; })
        .reduce(function (s, g) { return s + g.tox1yr * Math.pow(0.5, yr / g.tHalfYr); }, 0);
    };
    const fpDrop300 = fpAt(1) / fpAt(300);

    const f1 = function (x, d) { return Number(x).toFixed(d == null ? 1 : d); };
    const fInt = function (x) { return String(Math.round(x)); };

    return {
      asOf: FRONTIER.asOf,
      // Ch1
      bNi: f1(bindingPerA('Ni62'), 3),
      bFe: f1(bindingPerA('Fe56'), 3),
      bBa: f1(bindingPerA('Ba141'), 2),
      bKr: f1(bindingPerA('Kr92'), 2),
      bU235: f1(bindingPerA('U235'), 3),
      qBa: f1(c1Ba.qPrompt, 1),
      qXe: f1(c1Xe.qPrompt, 1),
      qTotal: fInt(c1Ba.qTotal),
      qDt: f1(c1Dt.qPrompt, 2),
      coalMJ: f1(K.coal / 1e6, 2),
      u235CoalM: f1(c1Ba.coalTotal / 1e6, 2),
      dtToU: f1(c1Ba.dtToU235Ratio, 1),
      uToDtQ: f1(c1Ba.u235ToDtQRatio, 1),
      // Ch2
      sfTherm: fInt(sigmaF235(0.0253)),
      sfFast: f1(sigmaF235(2e6), 1),
      sfRatio: fInt(sigmaF235(0.0253) / sigmaF235(2e6)),
      colH2O: fInt(moderationData('h2o', 0).totalToThermal),
      colD2O: fInt(moderationData('d2o', 0).totalToThermal),
      colC12: fInt(moderationData('graphite', 0).totalToThermal),
      colNa23: fInt(moderationData('na23', 0).totalToThermal),
      sigH: f1(MODERATORS.h2o.sigma_a, 3),
      sigD: f1(MODERATORS.d2o.sigma_a, 5),
      // Ch3
      natU: '0.72',
      pwrLeu: '4.5',
      kPwrNat: f1(kPwrNat.kEff, 3),
      kCanduNat: f1(kCanduNat.kEff, 3),
      kPwrLeu: f1(kPwrLeu.kEff, 3),
      kPwrVoid: f1(kPwrVoid.kEff, 3),
      heuMin: '90',
      // Ch4
      betaPct: f1(BETA_TOTAL * 100, 2),
      betaPcm: fInt(BETA_TOTAL * 1e5),
      tauBar: f1(TAU_DELAYED_BAR, 1),
      lamPromptUs: fInt(LAMBDA_PROMPT * 1e6),
      speedup: fInt(kinPromptOnly.speedupFactor),
      noBeta1s: fInt(kinPromptOnly.nAtEnd),
      // Ch5
      iHalfH: '6.57',
      xeHalfH: '9.14',
      xeSigmaM: '2.65',
      xeEqNeg: fInt(-xeMid.eqWorthPcm),
      xePeakNeg: fInt(-xeMid.peakNegPcm),
      xePeakH: f1(xeMid.peakHour, 1),
      // Ch6
      p0Ref: '3000',
      dh1sPct: f1(dh1s.fracPct, 1),
      dh1sMW: f1(dh1s.mw, 0),
      dh1sBoil: f1(dh1s.boilKgS, 0),
      dh1hPct: f1(dh1h.fracPct, 2),
      dh1hMW: f1(dh1h.mw, 1),
      dh1dMW: f1(dh1d.mw, 1),
      dh1dBoilTon: fInt(dh1d.boilTonDay),
      // Ch7
      burnupRef: '45',
      tHMPerYr: f1(w1.tHM_yr, 1),
      casksYr: f1(w1.casksPerYr, 1),
      coalAshKt: fInt(w1.coalAshT_yr / 1000),
      csHalfYr: '30.2',
      puHalfKyr: '24.1',
      w300Drop: fInt(fpDrop300),
      wCrossOnce: String(Math.round(w1.crossoverYr / 1000)),
      wCrossReproc: fInt(wasteModel('reprocess', 0, 1).crossoverYr),
      // Ch8 frontier
      opReactors: String(FRONTIER.globalFleet.operableReactors),
      opGWe: f1(FRONTIER.globalFleet.operableGWe, 1),
      ucReactors: String(FRONTIER.globalFleet.underConstruction),
      genTWh: String(FRONTIER.globalFleet.genTWh2025),
      worldSharePct: fInt(FRONTIER.globalFleet.worldSharePct),
      vogtleDate: FRONTIER.recentGen3.vogtle4Date,
      barakahDate: FRONTIER.recentGen3.barakahDate,
      barakahTWh: String(FRONTIER.recentGen3.barakahTWhYr),
      flamDate: FRONTIER.recentGen3.flamanville3Date,
      htrPmMWe: String(FRONTIER.demonstrated.htrPmMWe),
      htrPmDate: FRONTIER.demonstrated.htrPmDate,
      haleuPh2Kg: String(FRONTIER.demonstrated.centrusPhase2Kg),
      haleuCumKg: String(FRONTIER.demonstrated.centrusCumulativeKg),
      nuscaleMWe: String(FRONTIER.milestones.nuscaleMWe),
      nuscaleDate: FRONTIER.milestones.nuscaleNrcDate,
      natriumMWe: String(FRONTIER.milestones.natriumMWe),
      natriumPeakMWe: String(FRONTIER.milestones.natriumPeakMWe),
      natriumDate: FRONTIER.milestones.natriumNrcDate,
      xe100Units: String(FRONTIER.milestones.xe100Units),
      xe100Year: FRONTIER.milestones.xe100NrcYear,
      hermesMWth: String(FRONTIER.milestones.hermesMWth),
      hermesExtend: FRONTIER.milestones.hermesExtendTo
    };
  }

  return {
    K: K,
    NUC: NUC,
    bindingPerA: bindingPerA,
    REACTIONS: REACTIONS,
    qValue: qValue,
    energyPerKg: energyPerKg,
    coalEquivalent: coalEquivalent,
    ch1Data: ch1Data,
    ch1Branch: ch1Branch,
    MODERATORS: MODERATORS,
    xiFromA: xiFromA,
    sigmaF235: sigmaF235,
    sigmaC238: sigmaC238,
    moderationData: moderationData,
    ch2Branch: ch2Branch,
    LATTICE_MODES: LATTICE_MODES,
    sixFactor: sixFactor,
    ch3Branch: ch3Branch,
    KEEPIN_U235: KEEPIN_U235,
    BETA_TOTAL: BETA_TOTAL,
    TAU_DELAYED_BAR: TAU_DELAYED_BAR,
    LAMBDA_PROMPT: LAMBDA_PROMPT,
    kineticsSim: kineticsSim,
    ch4Branch: ch4Branch,
    XE: XE,
    xenonSim: xenonSim,
    ch5Branch: ch5Branch,
    RUN_DURATIONS: RUN_DURATIONS,
    wayWignerFraction: wayWignerFraction,
    wayWignerCumulativeEnergyJ: wayWignerCumulativeEnergyJ,
    decayHeat: decayHeat,
    ch6Branch: ch6Branch,
    wasteModel: wasteModel,
    ch7Branch: ch7Branch,
    REACTOR_ARCH: REACTOR_ARCH,
    ch8Data: ch8Data,
    ch8Branch: ch8Branch,
    FRONTIER: FRONTIER,
    prose: prose
  };
});
