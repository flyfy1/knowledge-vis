/* What Travels Through Empty Space: pure physics models (no DOM).
 * Loaded by index.html as window.EmptySpaceModels and by tests/models.cjs via require().
 * Every live simulation advances with fixed internal steps / real dt so behaviour does not depend on frame rate. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.EmptySpaceModels = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const PI = Math.PI;

  /* ───────── Fundamental physical constants (2019 SI / CODATA 2022) ───────── */
  const CONST = {
    c: 299792458,               // m/s (exact)
    h: 6.62607015e-34,          // J·s (exact)
    e: 1.602176634e-19,         // C (exact)
    kB: 1.380649e-23,           // J/K (exact)
    mu0: 1.25663706127e-6,      // N/A^2 (CODATA 2022)
    eps0: 8.8541878188e-12,     // F/m (CODATA 2022)
    solar1AU: 1361,             // W/m^2 (TSI at 1 AU, Kopp & Lean / IAU)
    AU: 149597870700            // m (exact IAU 2012)
  };
  CONST.cFromMaxwell = 1 / Math.sqrt(CONST.mu0 * CONST.eps0);
  CONST.Z0 = Math.sqrt(CONST.mu0 / CONST.eps0); // ~376.7303 ohm

  /* ═════════ FRONTIER DATA BLOCK (as of November 2026) — update here; sources in BRIEF.md ═════════ */
  const FRONTIER = {
    asOf: '2026-11',
    wireless: {
      wifi7MaxGbps: 46,               // IEEE 802.11be theoretical max PHY (320 MHz, 4096-QAM, MLO)
      wifi7ChannelMHz: 320,
      fr3MinGHz: 7.125,               // 3GPP Rel-19/20 & WRC-23 upper mid-band candidate
      fr3MaxGHz: 24.25,
      subTHzMinGHz: 100,
      subTHzMaxGHz: 300,
      d2cStarlinkLaunch: '2025-07-23', // T-Mobile T-Satellite commercial launch
      astBlueBirdAreaM2: 223          // ~2400 sq ft Block 2 BlueBird phased array
    },
    fibre: {
      smfStdLossDbKm: 0.18,           // Standard ITU-T G.652.D SMF at 1550 nm
      silicaRayleighFloorDbKm: 0.14,  // Pure-silica-core fundamental Rayleigh floor (~0.14 dB/km)
      hollowCoreRecordDbKm: 0.091,    // Southampton / Microsoft Azure Fiber DNANF at 1550 nm (Nature Photonics 2025)
      hollowCoreSpeedRatio: 1.45,     // ~30-45% lower latency / faster group velocity (n ~ 1.0 vs 1.468)
      nictLegacyFieldTbps: 450,       // NICT 450 Tbps over 39 km field SMF (2026, 42.4 THz O/E/S/C/L)
      nictLegacySpanKm: 39,
      nictMultiCorePbps: 1.02,        // NICT/Sumitomo 1.02 Pbps over 1808 km, 19-core 0.125 mm fibre (2025-2026)
      nictMultiCoreSpanKm: 1808
    },
    fso: {
      dsocPeakMbps: 267,              // NASA DSOC Psyche peak downlink at 31M km (Dec 2023)
      dsocPeakDistMkm: 31,
      dsocMidMbps: 25,                // 25 Mbps at 226M km (~1.5 AU, Apr 2024)
      dsocMidDistMkm: 226,
      dsocMaxDistMkm: 494,            // 307M miles = 494M km record distance (Dec 2024; demo ended Sep 2025)
      voyager1DistAU: 173,            // ~173 AU (~25.9B km, ~1 light-day) as of late 2026
      voyager1BitrateBps: 160
    },
    shortWave: {
      euvWavelengthNm: 13.5,          // ASML Twinscan EXE:5000 / EXE:5200B High-NA EUV
      euvLowNA: 0.33,
      euvHighNA: 0.55,
      euvHalfPitchNm: 8,              // single-exposure half-pitch resolution
      thzGapMinTHz: 0.1,
      thzGapMaxTHz: 10,
      thermalFreq300KTHz: CONST.kB * 300 / CONST.h / 1e12 // ~6.251 THz
    }
  };
  /* ═════════ end of frontier data block ═════════ */

  /* ───────── 01: Delayed field kink of an accelerated charge (Thomson / Purcell) ───────── */
  const ch1 = {
    // Normalized units: c = 1, pulse duration tau0 = 1 -> 1 unit distance = c * tau0
    // Charge starts at origin, accelerates over duration tau to speed beta*c along +x.
    // Inside the kink shell r in [t - tau, t], transverse / radial field ratio at angle theta:
    // E_perp / E_r = (r * a * sin(theta)) / c^2 = (r / (c * tau)) * beta * sin(theta)
    kinkRatio(r, beta, tau, thetaRad) {
      const th = thetaRad == null ? PI / 2 : thetaRad;
      return (r / Math.max(0.2, tau)) * beta * Math.abs(Math.sin(th));
    },
    // Relative magnitudes normalized to r = 1: E_r ~ 1/r^2, E_perp ~ beta * sin(theta) / (tau * r)
    fieldsAt(r, beta, tau, thetaRad) {
      const th = thetaRad == null ? PI / 2 : thetaRad;
      const rr = Math.max(0.5, r);
      const Er = 1 / (rr * rr);
      const Eperp = (beta * Math.abs(Math.sin(th))) / (Math.max(0.2, tau) * rr);
      return { r: rr, Er, Eperp, ratio: Eperp / Er, erPowerDecay: 1 / Math.pow(rr, 4), epowerDecay: 1 / (rr * rr) };
    },
    // Field line path for angle theta0 (rad) at simulation time t (units of tau0)
    fieldLinePoints(theta0, t, beta, tau, mode, rMax) {
      const pts = [];
      const steps = 40;
      const vx = beta; // c = 1
      const rOut = Math.max(0.4, t);
      const rIn = Math.max(0.2, t - tau);
      const originX = Math.min(2.2, vx * Math.max(0, t - 0.5 * tau));
      for (let i = 0; i <= steps; i++) {
        const frac = i / steps;
        const r = 0.25 + frac * (rMax - 0.25);
        if (mode === 'instant') {
          pts.push([originX + r * Math.cos(theta0), r * Math.sin(theta0)]);
        } else {
          if (r >= rOut) {
            pts.push([r * Math.cos(theta0), r * Math.sin(theta0)]);
          } else if (r <= rIn) {
            pts.push([originX + r * Math.cos(theta0), r * Math.sin(theta0)]);
          } else {
            const w = (rOut - r) / Math.max(1e-6, rOut - rIn);
            pts.push([w * originX + r * Math.cos(theta0), r * Math.sin(theta0)]);
          }
        }
      }
      return pts;
    }
  };

  /* ───────── 02: Faraday + Displacement Current in a circular capacitor gap ───────── */
  const ch2 = {
    V0: 100, // V peak drive
    // R in meters (0.02..0.10), d in meters (0.005 default), freqMHz (1..1000), epsR (1..4.5)
    compute(freqMHz, radiusCm, epsR, dMm) {
      const f = freqMHz * 1e6;
      const omega = 2 * PI * f;
      const R = radiusCm / 100;
      const d = (dMm || 5) / 1000;
      const er = epsR || 1;
      const A = PI * R * R;
      const C = CONST.eps0 * er * A / d;            // F
      const Ipeak = omega * C * ch2.V0;              // A (both conduction & displacement peak)
      const Epeak = ch2.V0 / d;                      // V/m
      const dEdtPeak = omega * Epeak;                // V/(m·s)
      const BrimTesla = (CONST.mu0 * Ipeak) / (2 * PI * R);
      // High-frequency Faraday feedback correction inside circular gap: J0(k R) ~ 1 - (kR)^2 / 4
      const k = omega * Math.sqrt(er) / CONST.c;
      const kR = k * R;
      const waveCorrection = 1 - Math.cos(Math.min(PI / 2, kR)); // or exact (kR)^2/4 perturbative ratio
      const faradayRatio = (kR * kR) / 4;
      const lambdaM = CONST.c / f;
      return {
        freqMHz, radiusCm, epsR: er, dMm: dMm || 5,
        C_pF: C * 1e12,
        IcondPeak: Ipeak,
        IdispPeak: Ipeak,
        Epeak,
        dEdtPeak,
        Brim_uT: BrimTesla * 1e6,
        kR,
        faradayPct: Math.min(100, faradayRatio * 100),
        faradayPctRaw: faradayRatio * 100,
        lambdaM,
        nonQuasiStatic: kR > 0.2
      };
    },
    waveforms(freqMHz, radiusCm, epsR) {
      const m = ch2.compute(freqMHz, radiusCm, epsR);
      const pts = [];
      for (let i = 0; i <= 120; i++) {
        const ph = (i / 120) * 2 * PI;
        pts.push({
          ph,
          V: Math.sin(ph),
          E: Math.sin(ph),
          Icond: Math.cos(ph),
          Idisp: Math.cos(ph),
          Brim: Math.cos(ph)
        });
      }
      return { ...m, pts };
    }
  };

  /* ───────── 03: 1-D Yee FDTD Leapfrog Solver (E_y, H_z = c B_z) ───────── */
  const ch3 = {
    N: 240,
    ISLAB: 130,
    fresnel(n) {
      const R = Math.pow((n - 1) / (n + 1), 2);
      const T = (4 * n) / Math.pow(n + 1, 2);
      return { R, T, sum: R + T, speedFrac: 1 / n };
    },
    create(opts = {}) {
      const N = opts.N || ch3.N;
      const iSlab = opts.iSlab || ch3.ISLAB;
      const n = opts.n != null ? opts.n : 1.5;
      const S = opts.S != null ? opts.S : 0.98;
      const mode = opts.mode || 'pulse';
      const E = new Float64Array(N);
      const H = new Float64Array(N - 1);
      const epsR = new Float64Array(N);
      for (let i = 0; i < N; i++) epsR[i] = i >= iSlab ? n * n : 1;

      if (mode === 'pulse') {
        const i0 = opts.i0 || 55;
        const sig = opts.sigma || 8;
        for (let i = 0; i < N; i++) {
          const zE = (i - i0) / sig;
          E[i] = Math.exp(-zE * zE);
        }
        for (let i = 0; i < N - 1; i++) {
          // H_z sits at (i + 0.5)*dx and t = -0.5*dt -> x - c*t = (i + 0.5 + S/2)*dx
          const zH = (i + 0.5 + 0.5 * S - i0) / sig;
          H[i] = Math.exp(-zH * zH);
        }
      }
      if (S > 1.0001) {
        // Seed tiny grid-scale Nyquist perturbation so Courant blow-up appears promptly above S = 1
        for (let i = 2; i < N - 2; i++) E[i] += (i % 2 === 0 ? 3e-3 : -3e-3);
      }
      return {
        N, iSlab, n, S, mode, stepCount: 0,
        E, H, epsR,
        ePrevLeft: 0, ePrevRight: 0,
        initEnergy: ch3.energy({ N, E, H, epsR })
      };
    },
    energy(st) {
      let u = 0;
      for (let i = 0; i < st.N; i++) u += 0.5 * st.epsR[i] * st.E[i] * st.E[i];
      for (let i = 0; i < st.N - 1; i++) u += 0.5 * st.H[i] * st.H[i];
      return u;
    },
    peakAbsE(st) {
      let m = 0;
      for (let i = 0; i < st.N; i++) if (Math.abs(st.E[i]) > m) m = Math.abs(st.E[i]);
      return m;
    },
    step(st, steps = 1) {
      const { N, E, H, epsR, S, n } = st;
      const Sn = S / n;
      const cL = (S - 1) / (S + 1);
      const cR = (Sn - 1) / (Sn + 1);
      for (let k = 0; k < steps; k++) {
        // 1. Update magnetic field H_z^{m+1/2} from curl of E^m
        for (let i = 0; i < N - 1; i++) {
          H[i] -= S * (E[i + 1] - E[i]);
        }
        if (st.mode === 'cw') {
          // TFSF soft-hard unidirectional source at iSrc = 20
          const iSrc = 20;
          const tH = (st.stepCount + 0.5) * S;
          const ramp = Math.min(1, st.stepCount / 30);
          H[iSrc - 1] += S * ramp * Math.sin(2 * PI * (tH / 26));
        }

        // Store boundary neighbours for 1st-order Mur ABC
        const e1Old = E[1];
        const eN2Old = E[N - 2];
        const e0Old = E[0];
        const eN1Old = E[N - 1];

        // 2. Update electric field E_y^{m+1} from curl of H^{m+1/2}
        for (let i = 1; i < N - 1; i++) {
          E[i] -= (S / epsR[i]) * (H[i] - H[i - 1]);
        }
        if (st.mode === 'cw') {
          const iSrc = 20;
          const tE = (st.stepCount + 1) * S;
          const ramp = Math.min(1, (st.stepCount + 1) / 30);
          E[iSrc] += S * ramp * Math.sin(2 * PI * (tE / 26));
        }

        // Mur ABC (only valid when S <= 1; for S > 1 instability tests we clamp boundary cleanly or let interior blow up)
        if (S <= 1.0001) {
          E[0] = e1Old + cL * (E[1] - e0Old);
          E[N - 1] = eN2Old + cR * (E[N - 2] - eN1Old);
        } else {
          E[0] = 0;
          E[N - 1] = 0;
        }
        st.stepCount++;
      }
      return st;
    },
    // Measure reflected & transmitted energy after pulse splits at iSlab
    measureSplit(st) {
      let uLeft = 0, uRight = 0;
      for (let i = 0; i < st.iSlab; i++) uLeft += 0.5 * st.epsR[i] * st.E[i] * st.E[i];
      for (let i = 0; i < st.iSlab - 1; i++) uLeft += 0.5 * st.H[i] * st.H[i];
      for (let i = st.iSlab; i < st.N; i++) uRight += 0.5 * st.epsR[i] * st.E[i] * st.E[i];
      for (let i = st.iSlab - 1; i < st.N - 1; i++) uRight += 0.5 * st.H[i] * st.H[i];
      const uTot = uLeft + uRight;
      return {
        uInit: st.initEnergy,
        uTot,
        R_meas: uTot > 0 ? uLeft / uTot : 0,
        T_meas: uTot > 0 ? uRight / uTot : 0,
        energyRatio: st.initEnergy > 0 ? uTot / st.initEnergy : 1
      };
    }
  };

  /* ───────── 04: Accelerating Charge (Larmor) & Linear Dipole Antenna ───────── */
  const ch4 = {
    // Larmor radiated power P = q^2 a^2 / (6 pi eps0 c^3)
    larmorPower(qCoulomb, accelMs2) {
      return (qCoulomb * qCoulomb * accelMs2 * accelMs2) / (6 * PI * CONST.eps0 * Math.pow(CONST.c, 3));
    },
    // Rayleigh relative scattering scale (f / fRef)^4 = (lambdaRef / lambda)^4
    rayleighRatio(lambda1Nm, lambda2Nm) {
      return Math.pow(lambda2Nm / lambda1Nm, 4);
    },
    // Exact center-fed thin dipole field pattern F(theta), normalized at peak in dipoleMetrics
    dipoleField(thetaRad, lOverLam) {
      const s = Math.sin(thetaRad);
      if (Math.abs(s) < 1e-7) return 0;
      const u = PI * lOverLam;
      if (u < 0.03) return Math.abs(s);
      return Math.abs((Math.cos(u * Math.cos(thetaRad)) - Math.cos(u)) / s);
    },
    dipoleMetrics(lOverLam) {
      const M = 720;
      const dTh = PI / M;
      let uMax = 0, intVal = 0;
      const vals = new Float64Array(M + 1);
      for (let i = 0; i <= M; i++) {
        const th = i * dTh;
        const f = ch4.dipoleField(th, lOverLam);
        const u = f * f;
        vals[i] = u;
        if (u > uMax) uMax = u;
        const w = (i === 0 || i === M) ? 0.5 : 1;
        intVal += w * u * Math.sin(th) * dTh;
      }
      // Directivity D = 2 * uMax / integral_0^pi U(theta) sin(theta) dtheta
      const D = intVal > 0 ? (2 * uMax) / intVal : 1.5;
      const dBi = 10 * Math.log10(D);
      // Radiation resistance referenced to current antinode I_max:
      // For Hertzian uniform current, R_rad = 80 pi^2 (L/lam)^2; for sinusoidal triangular (short), R_rad_max = (Z0/(2*pi)) * intVal
      const u = PI * lOverLam;
      const RradMax = u < 0.03
        ? 20 * PI * PI * lOverLam * lOverLam
        : (CONST.Z0 / (2 * PI)) * intVal;

      // Half-power beamwidth around theta = 90 deg (or main lobe)
      let peakIdx = M / 2, peakV = 0;
      for (let i = 0; i <= M; i++) if (vals[i] > peakV) { peakV = vals[i]; peakIdx = i; }
      const half = 0.5 * peakV;
      let iLo = peakIdx, iHi = peakIdx;
      while (iLo > 0 && vals[iLo] >= half) iLo--;
      while (iHi < M && vals[iHi] >= half) iHi++;
      const hpbwDeg = ((iHi - iLo) * dTh * 180) / PI;
      const lobeCount = lOverLam > 1.02 ? 3 : 1;
      return { lOverLam, D, dBi, RradMax, hpbwDeg, lobeCount, uMax };
    },
    patternAtAngle(thetaDeg, lOverLam) {
      const m = ch4.dipoleMetrics(lOverLam);
      const f = ch4.dipoleField((thetaDeg * PI) / 180, lOverLam);
      const relPower = m.uMax > 0 ? (f * f) / m.uMax : 0;
      return { ...m, thetaDeg, relPower };
    }
  };

  /* ───────── 05: Poynting Vector, Radiation Pressure & 3-Polariser Malus's Law ───────── */
  const ch5 = {
    sailAreaM2: 10000,    // 100 m x 100 m
    sailMassKg: 50,       // 5 g/m^2 -> 50 kg
    poyntingSail(distAU, reflectivity) {
      const r = Math.max(0.2, distAU);
      const R = clamp(reflectivity, 0, 1);
      const S = CONST.solar1AU / (r * r);             // W/m^2 (reuses 1/r^2 spreading)
      const Erms = Math.sqrt(S * CONST.Z0);           // V/m
      const Brms = Erms / CONST.c;                    // T
      const pressurePa = ((1 + R) * S) / CONST.c;     // Pa = N/m^2
      const forceN = pressurePa * ch5.sailAreaM2;
      const accelMmS2 = (forceN / ch5.sailMassKg) * 1000;
      const dvPerDayMs = (forceN / ch5.sailMassKg) * 86400;
      return {
        distAU: r, reflectivity: R, S, Erms, Brms_uT: Brms * 1e6,
        pressure_uPa: pressurePa * 1e6, forceN, accelMmS2, dvPerDayMs
      };
    },
    malusThree(theta2Deg, hasMiddle) {
      const I1 = 0.5; // unpolarised -> vertical P1 passes 50%
      if (!hasMiddle) {
        return { I0: 1, I1, I2: null, I3: 0, pctOut: 0, theta2Deg, hasMiddle: false };
      }
      const rad = (theta2Deg * PI) / 180;
      const I2 = I1 * Math.cos(rad) * Math.cos(rad);
      const I3 = I2 * Math.sin(rad) * Math.sin(rad); // angle to 90 deg P3 is (90 - theta2)
      return { I0: 1, I1, I2, I3, pctOut: I3 * 100, theta2Deg, hasMiddle: true };
    }
  };

  /* ───────── 06: EM Spectrum, Classical-to-Photon Boundary & Water Dielectric Loss ───────── */
  const ch6 = {
    BANDS: [
      { id: 'radio', fMin: 1e4, fMax: 3e8 },
      { id: 'mw', fMin: 3e8, fMax: 3e11 },
      { id: 'thz', fMin: 3e11, fMax: 1e13 },
      { id: 'ir', fMin: 1e13, fMax: 4e14 },
      { id: 'vis', fMin: 4e14, fMax: 7.9e14 },
      { id: 'uv', fMin: 7.9e14, fMax: 3e16 },
      { id: 'xray', fMin: 3e16, fMax: 3e19 },
      { id: 'gamma', fMin: 3e19, fMax: 1e21 }
    ],
    PRESETS: {
      phone: 1.8e9,
      oven: 2.45e9,
      thz: 3e12,
      earthIR: 3e13,      // 10 um
      green: 5.45e14,     // 550 nm
      euv: 2.22e16,       // 13.5 nm
      xray: 3e18          // 0.1 nm
    },
    IONISATION_EV: 10,
    ICNIRP_SAR_10G: 2.0,  // W/kg (ICNIRP 2020, 100 kHz - 6 GHz)
    FCC_SAR_1G: 1.6,      // W/kg
    // Debye model for pure liquid water at 25 C (Kaatze / Liebe): eps_s=78.36, eps_inf=5.2, f_r=19.6 GHz
    waterDebye(freqGHz) {
      const epsS = 78.36, epsInf = 5.2, fr = 19.6;
      const x = freqGHz / fr;
      const epsPrime = epsInf + (epsS - epsInf) / (1 + x * x);
      const epsDoublePrime = ((epsS - epsInf) * x) / (1 + x * x);
      const tanDelta = epsDoublePrime / epsPrime;
      const fHz = freqGHz * 1e9;
      // Power penetration depth dp = 1 / (2 * alpha)
      const nIm = Math.sqrt(0.5 * epsPrime * (Math.sqrt(1 + tanDelta * tanDelta) - 1));
      const alpha = (2 * PI * fHz / CONST.c) * nIm;
      const depthCm = alpha > 0 ? (1 / (2 * alpha)) * 100 : Infinity;
      return { freqGHz, epsPrime, epsDoublePrime, tanDelta, depthCm, relaxPeakGHz: fr, vaporLineGHz: 22.235 };
    },
    inspect(log10Freq) {
      const f = Math.pow(10, log10Freq);
      const lam = CONST.c / f;
      const E_J = CONST.h * f;
      const E_eV = E_J / CONST.e;
      const kBT_eV = (CONST.kB * 300) / CONST.e;
      const thermalRatio = E_eV / kBT_eV;
      // Photon flux at reference intensity 1 W/m^2
      const photonsPerM2s = 1 / E_J;
      // Classical mode occupancy indicator: photons passing through lambda^2 area in one wave period 1/f at 1 W/m^2
      const photonsPerModeAt1Wm2 = (lam * lam) / (f * E_J);
      let band = 'gamma';
      for (const b of ch6.BANDS) if (f >= b.fMin && f <= b.fMax) { band = b.id; break; }
      const ionising = E_eV >= ch6.IONISATION_EV;
      const quantumDom = thermalRatio >= 1;
      return {
        log10Freq, f, lam, E_eV, kBT_eV, thermalRatio,
        photonsPerM2s, photonsPerModeAt1Wm2, band, ionising, quantumDom
      };
    }
  };

  /* ───────── 07: Atmospheric Transmission Windows (ITU-R P.676 + HITRAN/Ozone/Ionosphere) ───────── */
  const ch7 = {
    // Anchored attenuation/transmission features across log10(f) in [6, 20] (1 MHz to 10^20 Hz)
    // Water vapor density rhoW in g/m^3 (1 dry mountain .. 7.5 ITU sea level .. 20 humid), foF2 in MHz (3..12)
    zenithTransmission(log10Freq, rhoW = 7.5, foF2MHz = 7) {
      const f = Math.pow(10, log10Freq);
      const wScale = rhoW / 7.5;
      // 1. Radio ionosphere cutoff (plasma frequency foF2)
      if (f < 2e8) {
        const fMHz = f / 1e6;
        if (fMHz <= foF2MHz) return Math.max(0.001, 0.02 * Math.pow(fMHz / foF2MHz, 4));
        const x = fMHz / foF2MHz;
        return clamp(1 - Math.exp(-3.2 * (x - 1)), 0.02, 0.999);
      }
      // 2. Microwave / mmWave / sub-THz (ITU-R P.676 anchored O2 + H2O lines)
      if (f <= 3e12) {
        const fGHz = f / 1e9;
        // Baseline dry continuum + Lorentzian/van Vleck lines anchored to ITU-R P.676 zenith dB
        const dryBase = 0.003 * Math.pow(fGHz / 10, 1.3);
        const h2o22 = 0.27 * wScale / (1 + Math.pow((fGHz - 22.235) / 1.2, 2));
        const o2_60 = 13.5 / (1 + Math.pow((fGHz - 60.0) / 1.8, 2));
        const o2_118 = 6.5 / (1 + Math.pow((fGHz - 118.75) / 1.5, 2));
        const h2o183 = 25.0 * wScale / (1 + Math.pow((fGHz - 183.31) / 2.2, 2));
        const h2o325 = 28.0 * wScale / (1 + Math.pow((fGHz - 325.15) / 5.0, 2));
        const subTHzWall = fGHz > 250 ? 12 * wScale * Math.pow((fGHz - 250) / 150, 1.6) : 0;
        const attenDb = dryBase + h2o22 + o2_60 + o2_118 + h2o183 + h2o325 + subTHzWall;
        return Math.pow(10, -attenDb / 10);
      }
      // 3. Far-IR to Optical to X-ray (parameterized by wavelength um)
      const lamUm = (CONST.c / f) * 1e6;
      if (lamUm >= 20) {
        // Pure rotational H2O band 20-100 um: largely opaque from sea level, slightly opens at ultra-dry
        return clamp(0.08 / Math.max(0.15, wScale), 0.001, 0.25);
      }
      if (lamUm >= 1.0) {
        // Thermal & near-IR windows: 8-14 um (LWIR), 3-5 um (MWIR), 1.6 & 2.2 um
        const co2_15 = 8.0 * Math.exp(-Math.pow((lamUm - 15.0) / 1.5, 2));
        const h2o_63 = 14.0 * wScale * Math.exp(-Math.pow((lamUm - 6.3) / 1.1, 2));
        const h2o_27 = 7.0 * wScale * Math.exp(-Math.pow((lamUm - 2.7) / 0.35, 2));
        const h2o_19 = 3.5 * wScale * Math.exp(-Math.pow((lamUm - 1.88) / 0.14, 2));
        const h2o_14 = 3.0 * wScale * Math.exp(-Math.pow((lamUm - 1.38) / 0.12, 2));
        const wing = lamUm > 16 ? 5 * Math.pow((lamUm - 16) / 4, 1.5) * wScale : 0;
        const base = 0.25 + 0.15 * wScale;
        return Math.pow(10, -(base + co2_15 + h2o_63 + h2o_27 + h2o_19 + h2o_14 + wing) / 10);
      }
      if (lamUm >= 0.32) {
        // Visible & near-UV: Rayleigh tau ~ 0.08 * (0.55 / lamUm)^4 + ozone Chappuis minor
        const tauR = 0.095 * Math.pow(0.55 / lamUm, 4);
        const o3UV = lamUm < 0.35 ? 1.8 * Math.exp(-Math.pow((lamUm - 0.255) / 0.042, 2)) : 0;
        return Math.exp(-(tauR + o3UV));
      }
      if (lamUm >= 0.10) {
        // UV-B/C ozone Hartley-Huggins & O2 Schumann-Runge cutoff (< 300 nm)
        const tauO3 = 40 * Math.exp(-Math.pow((lamUm - 0.255) / 0.032, 2));
        const tauO2 = lamUm < 0.20 ? 60 : 0;
        return Math.max(1e-6, Math.exp(-(tauO3 + tauO2 + 0.5)));
      }
      // EUV / X-ray / soft gamma: blocked by upper-atmosphere N2/O2 photoabsorption
      return 1e-6;
    },
    curve(rhoW = 7.5, foF2MHz = 7) {
      const pts = [];
      for (let i = 0; i <= 280; i++) {
        const lg = 6 + (i / 280) * 14; // 1 MHz to 10^20 Hz
        pts.push([lg, ch7.zenithTransmission(lg, rhoW, foF2MHz)]);
      }
      return pts;
    }
  };

  /* ───────── 08: Modulation, Shannon Capacity & Friis Link Budget ───────── */
  const ch8 = {
    PRESETS: {
      wifi: {
        id: 'wifi', freqMHz: 5180, distM: 10, bwHz: 80e6,
        txPowerDbm: 20, gTxDbi: 3, gRxDbi: 0, atmLossDb: 0, tSysK: 600, nfDb: 5
      },
      cell: {
        id: 'cell', freqMHz: 1800, distM: 1000, bwHz: 20e6,
        txPowerDbm: 43, gTxDbi: 17, gRxDbi: 0, atmLossDb: 15, tSysK: 500, nfDb: 5
      },
      gps: {
        id: 'gps', freqMHz: 1575.42, distM: 20200000, bwHz: 2.046e6,
        txPowerDbm: 44.3, gTxDbi: 13.0, gRxDbi: 0, atmLossDb: 2.0, tSysK: 290, nfDb: 2
      },
      voyager: {
        id: 'voyager', freqMHz: 8415, distM: 173 * CONST.AU, bwHz: 160,
        // 22.4 W = 43.50 dBm; 3.7 m dish (~55% eff) = 47.7 dBi; DSN 70 m dish (~55% eff) = 73.2 dBi
        txPowerDbm: 43.5, gTxDbi: 47.7, gRxDbi: 73.2, atmLossDb: 0.3, tSysK: 20, nfDb: 0
      }
    },
    friis(opts) {
      const fHz = opts.freqMHz * 1e6;
      const lam = CONST.c / fHz;
      const d = Math.max(0.1, opts.distM);
      const fsplDb = 20 * Math.log10((4 * PI * d) / lam);
      const prxDbm = opts.txPowerDbm + opts.gTxDbi + opts.gRxDbi - fsplDb - (opts.atmLossDb || 0);
      const prxWatts = Math.pow(10, (prxDbm - 30) / 10);
      const bw = Math.max(1, opts.bwHz);
      const tSys = opts.tSysK || 290;
      const noiseWatts = CONST.kB * tSys * bw * Math.pow(10, (opts.nfDb || 0) / 10);
      const noiseDbm = 10 * Math.log10(noiseWatts) + 30;
      const snrDb = prxDbm - noiseDbm;
      const snrLin = Math.pow(10, snrDb / 10);
      const shannonMbps = (bw * Math.log2(1 + snrLin)) / 1e6;
      const lightTimeS = d / CONST.c;
      return {
        ...opts, lam, fsplDb, prxDbm, prxWatts, noiseDbm, snrDb, shannonMbps, lightTimeS
      };
    },
    // Sample modulated waveforms for visualization ('AM', 'FM', 'QAM16')
    modulationTrace(kind) {
      const pts = [];
      for (let i = 0; i <= 240; i++) {
        const t = i / 240; // 0..1
        const msg = Math.sin(2 * PI * 2 * t);
        let y;
        if (kind === 'AM') {
          y = (0.55 + 0.45 * msg) * Math.sin(2 * PI * 22 * t);
        } else if (kind === 'FM') {
          y = Math.sin(2 * PI * 22 * t + 4.0 * (-Math.cos(2 * PI * 2 * t)));
        } else {
          // 16-QAM symbol segments (4 symbols across window)
          const sym = Math.min(3, Math.floor(t * 4));
          const I = [-0.9, 0.3, -0.3, 0.9][sym];
          const Q = [0.3, 0.9, -0.9, -0.3][sym];
          y = (I * Math.cos(2 * PI * 22 * t) - Q * Math.sin(2 * PI * 22 * t)) / 1.3;
        }
        pts.push([t, y, msg]);
      }
      return pts;
    }
  };

  /* ───────── 09: Guiding & Shaping (Optical Fibre TIR/Loss + Diffraction + Phased Array) ───────── */
  const ch9 = {
    // Standard silica SMF-28e+ / ITU-T G.652.D parameters
    nCore: 1.4682,
    nClad: 1.4629,
    criticalAngleDeg(n1 = ch9.nCore, n2 = ch9.nClad) {
      return (Math.asin(Math.min(1, n2 / n1)) * 180) / PI;
    },
    numericalAperture(n1 = ch9.nCore, n2 = ch9.nClad) {
      return Math.sqrt(Math.max(0, n1 * n1 - n2 * n2));
    },
    // Silica fibre loss (dB/km) vs wavelength (nm in [800, 1750])
    // Anchored to G.652.D: ~2.2 dB/km @ 850 nm, ~0.34 dB/km @ 1310 nm, ~0.18 dB/km @ 1550 nm
    fibreLossDbKm(lambdaNm) {
      const lamUm = lambdaNm / 1000;
      const rayleigh = 0.87 / Math.pow(lamUm, 4); // ~0.151 at 1.55 um, ~0.295 at 1.31 um, ~1.67 at 0.85 um
      const oh1383 = 0.35 * Math.exp(-Math.pow((lambdaNm - 1383) / 18, 2));
      const oh1244 = 0.07 * Math.exp(-Math.pow((lambdaNm - 1244) / 16, 2));
      const irEdge = 0.025 * Math.exp((lamUm - 1.55) / 0.085);
      const uvAndImperf = 0.012 + (lambdaNm < 950 ? 0.5 * Math.pow((950 - lambdaNm) / 150, 2) : 0);
      return rayleigh + oh1383 + oh1244 + irEdge + uvAndImperf;
    },
    // Rayleigh diffraction limit: theta = 1.22 * lambda / D (rad)
    diffractionLimit(lambdaM, diameterM) {
      const thetaRad = (1.22 * lambdaM) / diameterM;
      return {
        thetaRad,
        thetaDeg: (thetaRad * 180) / PI,
        thetaArcsec: (thetaRad * 180 * 3600) / PI
      };
    },
    // Phased array factor AF(theta) for N elements, spacing d/lambda, steering theta0Deg
    arrayFactor(thetaDeg, N, dOverLam, theta0Deg) {
      const th = (thetaDeg * PI) / 180;
      const th0 = (theta0Deg * PI) / 180;
      const psi = 2 * PI * dOverLam * (Math.sin(th) - Math.sin(th0));
      if (Math.abs(Math.sin(psi / 2)) < 1e-8) return 1;
      return Math.abs(Math.sin((N * psi) / 2) / (N * Math.sin(psi / 2)));
    },
    phasedArrayStats(N, dOverLam, theta0Deg) {
      // Check for grating lobes in [-90, 90]: |sin(theta) - sin(theta0)| = m / (d/lam) <= 1 + |sin(theta0)|
      const s0 = Math.sin((theta0Deg * PI) / 180);
      const gratingMax = dOverLam * (1 + Math.abs(s0));
      const hasGratingLobe = gratingMax >= 1.0;
      // Approximate 3-dB beamwidth near broadside: ~50.8 / (N * d/lam * cos(theta0)) deg
      const cos0 = Math.max(0.25, Math.cos((theta0Deg * PI) / 180));
      const hpbwDeg = 50.8 / (N * dOverLam * cos0);
      return { N, dOverLam, theta0Deg, hasGratingLobe, gratingCondition: gratingMax, hpbwDeg };
    }
  };

  /* ───────── 10: Frontier comparisons derived from FRONTIER block ───────── */
  const ch10 = {
    fibreSpeedVsGlass() {
      // Hollow-core delay per km ~ 1/(c) = 3.336 us/km vs silica n=1.468 -> 4.897 us/km
      const vacUsKm = (1000 / CONST.c) * 1e6;
      const silicaUsKm = (1000 * ch9.nCore / CONST.c) * 1e6;
      const lossRatio = FRONTIER.fibre.smfStdLossDbKm / FRONTIER.fibre.hollowCoreRecordDbKm;
      const floorRatio = FRONTIER.fibre.silicaRayleighFloorDbKm / FRONTIER.fibre.hollowCoreRecordDbKm;
      return { vacUsKm, silicaUsKm, savingPct: ((silicaUsKm - vacUsKm) / silicaUsKm) * 100, lossRatio, floorRatio };
    },
    fr3VsSubThzPathDeltaDb() {
      // Extra FSPL at 150 GHz vs 15 GHz (10x frequency -> 20 dB)
      return 20 * Math.log10(150 / 15);
    },
    dsocVsVoyagerBitrateRatio() {
      return (FRONTIER.fso.dsocPeakMbps * 1e6) / FRONTIER.fso.voyager1BitrateBps;
    }
  };

  return { clamp, CONST, FRONTIER, ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8, ch9, ch10 };
}));
