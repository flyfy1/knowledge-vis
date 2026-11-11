/* Why the planet warms: the models behind every chart on the page.
 * Pure functions only (no DOM). Loaded by index.html as window.ClimateModels and by tests/models.cjs via require().
 * All are zero-dimensional textbook models (one global average number per quantity), not climate projections.
 * Live simulations advance in whole fixed internal steps (`advance`), so results do not depend on frame rate. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ClimateModels = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const SIGMA = 5.670374419e-8;      // Stefan–Boltzmann constant, W m⁻² K⁻⁴
  const YEAR = 365.25 * 86400;       // s
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

  /* Real-world inputs (sources in BRIEF.md). */
  const EARTH = {
    S: 1361,          // total solar irradiance, W m⁻² (NASA Earth fact sheet; AR6 WG1 ch7)
    albedo: 0.29,     // planetary albedo, AR6 WG1 ch7 §7.3.4.4 ("usually taken to be 0.29"); NASA Bond albedo 0.294
    Tobs: 288,        // observed global mean surface temperature, K (NASA Earth fact sheet: 288 K, 15 °C)
    C0: 278.3,        // CO₂ in 1750, ppm (AR6 WG1 Table 7.5)
    C2019: 409.9,     // CO₂ in 2019, ppm (AR6 WG1 Table 7.5)
    Cnow: 425.62,     // CO₂ 2025 global annual mean, ppm (NOAA GML co2_annmean_gl.txt)
    F2x: 3.93,        // ERF for doubled CO₂, W m⁻², AR6 assessed (±0.47, 5–95 %)
    lambdaP: 3.22,    // Planck response, W m⁻² K⁻¹, AR6 assessed (very likely 3.0–3.4), sign dropped
    oceanFrac: 0.7,   // the ocean covers "more than 70 %" of the surface (NOAA Ocean Service)
    rhoC: 1025 * 3990 // seawater density × specific heat, J m⁻³ K⁻¹ (textbook values)
  };

  /* Assessed and observed values quoted in the prose but not computed by any model (sources in BRIEF.md).
   * Ranges are [low, high]; "likely" = 66–100 %, "very likely" = 90–100 % in IPCC language. */
  const SOURCED = {
    nitrogenOxygenPct: 78.08 + 20.95,              // NASA Earth fact sheet, dry air by volume
    tsiCycle: 1,                                   // W m⁻², peak-to-trough TSI over the 11-year cycle (AR6 ch7 §7.3.4.4)
    lapse: 6.49, surfaceC: 15.04, stratT: 216.65,  // NASA Glenn standard atmosphere (K/km, °C, K)
    F2xRange: [3.46, 4.40],                        // AR6 2×CO₂ ERF 3.93 ± 0.47 (5–95 %)
    myhre2x: 3.71,                                 // AR5 2×CO₂ forcing, as listed in AR6 Table 7.4
    planckVeryLikely: [3.0, 3.4],                  // AR6 Table 7.10
    netFeedback: -1.16, netFeedbackVeryLikely: [-1.81, -0.51], // AR6 Table 7.10
    ecsProcessMedian: 3.4, ecsProcessVeryLikely: [2.1, 7.7],   // AR6 ch7 §7.5.1.1 (forcing and feedback only)
    ecsBest: 3, ecsLikely: [2.5, 4], ecsVeryLikely: [2, 5],    // AR6 SPM A.4.4
    tcrBest: 1.8, tcrLikely: [1.4, 2.2],                       // AR6 ch7 §7.5.5
    co2Erf2019: 2.16, co2Erf2019Range: [1.90, 2.41],           // AR6 Table 7.5 / TS
    totalErf2019: 2.72, totalErf2019Range: [1.96, 3.48],       // AR6 SPM A.4.1
    warming2011_2020: 1.09, warmingRange: [0.95, 1.20],        // AR6 SPM A.1.2
    eei2006_2018: 0.79, eeiRange: [0.52, 1.06],                // AR6 SPM A.4.2
    oceanHeatShare: 91,                                         // AR6 SPM A.4.2, %
    rompsRange: [4, 4096],                                      // Romps et al. 2022: log forcing holds ~4–4096 ppmv
    rompsF2x: [4, 5]                                            // Romps et al. 2022 §7: their simple CO₂-only model gives F2× "around 4–5 W m⁻²"
  };

  /* Run `stepFn(state, h)` in whole steps of h covering `span` model time; leftover time is carried. */
  function advance(state, span, h, stepFn, maxSteps = 200000) {
    state._acc = (state._acc || 0) + span;
    let n = 0;
    while (state._acc >= h - 1e-12 && n < maxSteps) { stepFn(state, h); state._acc -= h; n++; }
    if (n >= maxSteps) state._acc = 0;
    return n;
  }

  /* heat capacity of an ocean layer h metres deep spread over the whole planet, in W·yr m⁻² K⁻¹ */
  const oceanC = h => EARTH.rhoC * h * EARTH.oceanFrac / YEAR;
  const K2C = T => T - 273.15;

  /* ───────── 1 · Energy balance of a bare planet ─────────
   * C dT/dt = S(1−α)/4 − σT⁴ ; equilibrium Te = (S(1−α)/(4σ))^¼ */
  const balance = {
    H: 0.01, // yr
    C: oceanC(50),
    absorbed: (S, a) => S * (1 - a) / 4,
    emitted: T => SIGMA * Math.pow(T, 4),
    Te: (S, a) => Math.pow(S * (1 - a) / (4 * SIGMA), 0.25),
    create(T) { return { t: 0, T }; },
    step(s, h, p) { s.T += h * (balance.absorbed(p.S, p.albedo) - balance.emitted(s.T)) / balance.C; s.t += h; },
    // no-feedback warming per W m⁻² of absorbed sunlight: dTe/dA = Te/(4A)
    sens: (S, a) => balance.Te(S, a) / (4 * balance.absorbed(S, a))
  };

  /* ───────── 2–3 · Grey layers ─────────
   * N layers, each absorbing a fraction eps of the infrared passing through it (and emitting eps·σT⁴ up and down),
   * all transparent to sunlight. Surface heat capacity = 50 m of ocean; each layer gets a share of the air's 1.0e7 J m⁻² K⁻¹. */
  const layers = {
    H: 0.0005, // yr
    Cs: oceanC(50),
    Ca: 1.0e7 / YEAR,
    create(n, Ts, Ta) { const T = []; for (let i = 0; i < n; i++) T.push(Ta == null ? Ts : Ta); return { t: 0, Ts, T }; },
    // fluxes for the current temperatures: returns {up (to space), down (to the surface), net per layer}
    fluxes(s, eps) {
      const n = s.T.length, net = new Array(n).fill(0);
      let U = SIGMA * Math.pow(s.Ts, 4);
      for (let j = 0; j < n; j++) { net[j] += eps * U; U = (1 - eps) * U + eps * SIGMA * Math.pow(s.T[j], 4); }
      let D = 0;
      for (let j = n - 1; j >= 0; j--) { net[j] += eps * D; D = (1 - eps) * D + eps * SIGMA * Math.pow(s.T[j], 4); }
      for (let j = 0; j < n; j++) net[j] -= 2 * eps * SIGMA * Math.pow(s.T[j], 4);
      return { up: U, down: D, net };
    },
    step(s, h, p) {
      const A = balance.absorbed(p.S, p.albedo), f = layers.fluxes(s, p.eps), Ca = layers.Ca / Math.max(1, s.T.length);
      s.Ts += h * (A + f.down - SIGMA * Math.pow(s.Ts, 4)) / layers.Cs;
      for (let j = 0; j < s.T.length; j++) s.T[j] += h * f.net[j] / Ca;
      s.t += h;
    },
    // exact steady states
    oneLayer(eps, Te) { return { Ts: Te * Math.pow(2 / (2 - eps), 0.25), Ta: Te * Math.pow(1 / (2 - eps), 0.25) }; },
    epsFor(Ts, Te) { return 2 - 2 * Math.pow(Te / Ts, 4); },          // one layer: eps that puts the surface at Ts
    stack(n, Te) { const T = []; for (let j = 0; j < n; j++) T.push(Te * Math.pow(n - j, 0.25)); return { Ts: Te * Math.pow(n + 1, 0.25), T }; } // T[0] = bottom
  };

  /* ───────── 4 · The 15-micron band of CO₂ ─────────
   * After Romps, Seeley & Edman (2022, J. Climate): absorption coefficient decays exponentially from the band centre
   * (Romps eq. 3: sorted κ = κ0·e^{bν̃} for ν̃ = 467…867 cm⁻¹, κ0 = 8.4e-15 m² mol⁻¹, b = 0.04 cm, at 1e5 Pa; folded symmetrically this is
   * κ ≈ 9.8 m² mol⁻¹ at 667 cm⁻¹ falling one e-fold per l = 12.5 cm⁻¹ to ≈ 1.1e-6 at the band edges), linear in pressure; optical depth τ(p) = f p² q κ /(2 g p0 m0) with diffusivity f = 5/3.
   * Fixed atmosphere: surface 288.15 K, 6.49 K/km lapse rate up to 216.65 K (US Standard Atmosphere, NASA Glenn), isothermal above.
   * Upwelling flux in each wavenumber: πB(Ts)·e^{−τs} + ∫ πB(T) dt (Schwarzschild, no scattering).
   * Only CO₂ absorbs; no water vapour, clouds or other bands. Instantaneous top-of-atmosphere forcing, temperatures held fixed. */
  const band = (() => {
    const h = 6.62607015e-34, c = 2.99792458e8, kB = 1.380649e-23;
    // Romps et al. eq. (3): sorted κ(ν̃) = κ0·e^{bν̃} on 467–867 cm⁻¹, κ0 = 8.4e-15 m² mol⁻¹, b = 0.04 cm. Folded symmetrically
    // about 667 cm⁻¹ (same distribution of κ values), the peak is κ0·e^{0.04·867} and the decay length is 1/(2b) = 12.5 cm⁻¹.
    const nu0 = 667, nu1 = 467, nu2 = 867, l = 12.5, kMax = 8.4e-15 * Math.exp(0.04 * 867);
    const ps = 1e5, g = 9.81, m0 = 0.029, fD = 5 / 3, Ts = 288.15, Tstrat = 216.65, gamma = 0.00649, Rd = 287.05;
    const expo = Rd * gamma / g;
    const Tof = p => Math.max(Tstrat, Ts * Math.pow(p / ps, expo));
    // πB per cm⁻¹ (W m⁻² per cm⁻¹)
    const piB = (nu, T) => { const nm = nu * 100; return Math.PI * 2 * h * c * c * nm * nm * nm / (Math.exp(h * c * nm / (kB * T)) - 1) * 100; };
    const NU = []; for (let v = nu1; v <= nu2; v++) NU.push(v);
    const LV = 260, P = []; for (let i = 0; i <= LV; i++) P.push(ps * Math.pow(10, -6 + 6 * i / LV)); // 0.1 Pa … 1e5 Pa
    const Bmid = NU.map(v => { const r = []; for (let i = 0; i < LV; i++) r.push(piB(v, Tof(Math.sqrt(P[i] * P[i + 1])))); return r; });
    const Bsurf = NU.map(v => piB(v, Ts)), Btop = NU.map(v => piB(v, Tstrat));
    const kappa = (nu, shape) => shape === 'box'
      ? (Math.abs(nu - nu0) <= 50 ? kMax * Math.exp(-50 / (2 * l)) : 0)
      : kMax * Math.exp(-Math.abs(nu - nu0) / l);
    const tauSurf = (nu, ppm, shape) => fD * ps * ps * ppm * 1e-6 * kappa(nu, shape) / (2 * g * ps * m0);
    function spectrum(ppm, shape = 'exp') {
      const out = new Array(NU.length);
      for (let k = 0; k < NU.length; k++) {
        const ts = tauSurf(NU[k], ppm, shape);
        if (ts < 1e-9) { out[k] = Bsurf[k]; continue; }
        let F = Bsurf[k] * Math.exp(-ts), tPrev = 1;
        for (let i = 0; i < LV; i++) { const tNext = Math.exp(-ts * (P[i + 1] / ps) * (P[i + 1] / ps)); F += Bmid[k][i] * (tPrev - tNext); tPrev = tNext; }
        out[k] = F;
      }
      return out;
    }
    const total = sp => sp.reduce((a, b) => a + b, 0); // 1 cm⁻¹ grid
    const cache = {};
    const olr = (ppm, shape = 'exp') => { const key = shape + ':' + ppm.toFixed(4); if (!(key in cache)) cache[key] = total(spectrum(ppm, shape)); return cache[key]; };
    const forcing = (ppm, ref = 280, shape = 'exp') => olr(ref, shape) - olr(ppm, shape);
    // half-width of the "saturated trench": |ν − ν0| where τ at the surface equals 1 (exp shape)
    const halfWidth = ppm => { const t0 = tauSurf(nu0, ppm, 'exp'); return t0 > 1 ? l * Math.log(t0) : 0; };
    // pressure where τ = 1 at a given wavenumber, and the temperature there (≈ where that colour leaves for space)
    const emitP = (nu, ppm, shape = 'exp') => { const ts = tauSurf(nu, ppm, shape); return ts > 1 ? ps / Math.sqrt(ts) : ps; };
    return { NU, nu0, nu1, nu2, l, Ts, Tstrat, piB, spectrum, olr, forcing, halfWidth, tauSurf, emitP, Tof, total,
      Bsurf, Btop, widthPerDoubling: 2 * l * Math.log(2) };
  })();

  /* Myhre et al. (1998) simplified expression used by IPCC TAR–AR5: ΔF = 5.35 ln(C/C0) W m⁻² (5.35 ln 2 = 3.71 = AR5's 2×CO₂ value). */
  const myhre = (C, C0 = EARTH.C0) => 5.35 * Math.log(C / C0);

  /* ───────── 5 · Feedbacks ─────────
   * Linear feedback analysis: ΔT = ΔF/(λP − Σαᵢ) = ΔT0/(1 − f), f = Σαᵢ/λP, ΔT0 = ΔF/λP.
   * AR6 WG1 Table 7.10 central values, W m⁻² K⁻¹. Round k of the loop adds ΔT0·fᵏ. */
  const feedback = {
    AR6: { wvlr: 1.30, albedo: 0.35, cloud: 0.42, other: -0.01, cloudLikely: [0.12, 0.72], cloudVeryLikely: [-0.10, 0.94] },
    dT0: (F = EARTH.F2x, lp = EARTH.lambdaP) => F / lp,
    sum(on) { const A = feedback.AR6; return (on.wvlr ? A.wvlr : 0) + (on.albedo ? A.albedo : 0) + (on.cloud ? on.cloudVal : 0) + A.other; },
    f(on) { return feedback.sum(on) / EARTH.lambdaP; },
    ecs(on) { const f = feedback.f(on); return f < 1 ? feedback.dT0() / (1 - f) : Infinity; },
    net(on) { return EARTH.lambdaP - feedback.sum(on); }, // net feedback parameter (positive = stabilising)
    // temperature after k rounds of the loop
    rounds(f, k, dT0 = feedback.dT0()) { return f === 1 ? dT0 * (k + 1) : dT0 * (1 - Math.pow(f, k + 1)) / (1 - f); },
    // rounds needed to reach `share` of the final value
    roundsTo(f, share) { return f <= 0 ? 0 : Math.ceil(Math.log(1 - share) / Math.log(f) - 1); }
  };

  /* ───────── 6 · Why the range is wide: f uncertain ⇒ ECS = ΔT0/(1 − f) skewed ─────────
   * f ~ Normal(mu, sd) (Roe & Baker 2007 argument). Exact pdf and quantiles; seeded Monte Carlo for the animation. */
  function erf(x) { // Abramowitz–Stegun 7.1.26, |error| < 1.5e-7
    const s = Math.sign(x); x = Math.abs(x);
    const t = 1 / (1 + 0.3275911 * x), y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return s * y;
  }
  const Phi = z => 0.5 * (1 + erf(z / Math.SQRT2));
  function PhiInv(p) { // Acklam's rational approximation, then one Newton step
    const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
    const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
    const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
    const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
    const pl = 0.02425; let q, r, x;
    if (p < pl) { q = Math.sqrt(-2 * Math.log(p)); x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    else if (p <= 1 - pl) { q = p - 0.5; r = q * q; x = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1); }
    else { q = Math.sqrt(-2 * Math.log(1 - p)); x = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    const e = Phi(x) - p, u = e * Math.sqrt(2 * Math.PI) * Math.exp(x * x / 2);
    return x - u / (1 + x * u / 2);
  }
  function mulberry32(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const spread = {
    dT0: () => feedback.dT0(),
    ecsOf: f => f < 1 ? feedback.dT0() / (1 - f) : Infinity,
    // pdf of ECS at T given f ~ N(mu, sd)
    pdf(T, mu, sd) { if (T <= 0) return 0; const d0 = feedback.dT0(), f = 1 - d0 / T, z = (f - mu) / sd; return Math.exp(-z * z / 2) / (sd * Math.sqrt(2 * Math.PI)) * d0 / (T * T); },
    quantile(p, mu, sd) { return spread.ecsOf(mu + sd * PhiInv(p)); },
    probAbove(T, mu, sd) { return 1 - Phi((1 - feedback.dT0() / T - mu) / sd); },        // includes f ≥ 1
    probBelow(T, mu, sd) { return Phi((1 - feedback.dT0() / T - mu) / sd); },
    probRunaway(mu, sd) { return 1 - Phi((1 - mu) / sd); },
    // AR6 net feedback −1.16, very likely (5–95 %) −1.81 to −0.51 ⇒ f mean and sd
    fromAR6() { const lp = EARTH.lambdaP, mu = 1 - 1.16 / lp, hi = 1 - 0.51 / lp, lo = 1 - 1.81 / lp; return { mu, sd: (hi - lo) / 2 / PhiInv(0.95) }; },
    rng: mulberry32,
    draw(rand, mu, sd) { // Box–Muller
      const u = Math.max(1e-12, rand()), v = rand();
      return mu + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    },
    Phi, PhiInv
  };

  /* ───────── 7 · Ocean lag: one box ─────────
   * C dT/dt = F(t) − λT, λ = F2x/ECS, C = ocean layer h metres deep × ocean fraction. τ = C/λ.
   * Scenarios: 'step' (CO₂ doubled at t = 0) and 'ramp' (+1 %/yr, doubled after ln2/ln1.01 ≈ 69.7 yr, then held). */
  const ocean = {
    H: 0.02, // yr
    C: oceanC,
    lambda: ecs => EARTH.F2x / ecs,
    tau: (h, ecs) => oceanC(h) / ocean.lambda(ecs),
    tDouble: Math.log(2) / Math.log(1.01),
    forcing(t, scen) { if (t < 0) return 0; if (scen === 'step') return EARTH.F2x; return EARTH.F2x * Math.min(1, t / ocean.tDouble); },
    create() { return { t: 0, T: 0 }; },
    step(s, h, p) { // exact over h for forcing held at its mid-step value
      const F = ocean.forcing(s.t + h / 2, p.scen), lam = ocean.lambda(p.ecs), Teq = F / lam, tau = oceanC(p.h) / lam;
      s.T = Teq + (s.T - Teq) * Math.exp(-h / tau); s.t += h;
    },
    run(p, until) { const s = ocean.create(); const out = [[0, 0]]; let k = 0; while (s.t < until - 1e-9) { ocean.step(s, ocean.H, p); if (++k % 10 === 0) out.push([s.t, s.T]); } return { series: out, T: s.T }; },
    at(p, t) { const s = ocean.create(); while (s.t < t - 1e-9) ocean.step(s, Math.min(ocean.H, t - s.t), p); return s.T; },
    // step scenario closed form
    stepExact: (t, h, ecs) => ecs * (1 - Math.exp(-t / ocean.tau(h, ecs)))
  };

  return { SIGMA, YEAR, EARTH, SOURCED, clamp, advance, oceanC, K2C, balance, layers, band, myhre, feedback, spread, ocean };
}));
