'use strict';
// Climate feedback lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// A zero-dimensional, global-mean energy ledger. Every bar, curve and readout on the page is computed
// here; tests/core.cjs pins the claims. Units: W/m² for fluxes, K for temperature change, years, ppm, GtC.
// Sources for the central values: IPCC AR6 WG1 ch.7 (Table 7.10 feedback parameters) and the simplified
// CO₂ forcing expression of Myhre et al. (1998). This is a teaching model, not a forecast.
(function (root) {
  const S0 = 1361;            // solar constant, W/m²
  const ALBEDO = 0.30;        // planetary albedo
  const ABSORBED = S0 / 4 * (1 - ALBEDO); // global-mean absorbed sunlight, W/m²
  const SIGMA = 5.670374e-8;  // Stefan–Boltzmann constant
  const C0 = 280;             // pre-industrial CO₂, ppm
  const NOW_PPM = 420;        // starting concentration for the carbon step
  const LP = 3.22;            // Planck response (magnitude), W/m²/K
  const FB = { wv: 1.30, ice: 0.35, cloud: 0.42 };      // AR6 central feedback parameters, W/m²/K
  const CLOUD_RANGE = [-0.10, 0.94];                    // AR6 very likely range for the cloud feedback
  const GTC_PER_PPM = 2.124;  // 1 ppm of atmospheric CO₂ ≈ 2.124 GtC
  const RHO_CP = 4.18e6;      // J/(m³·K), sea water
  const SEC_YR = 3.156e7;     // seconds per year
  const OCEAN_FRAC = 0.71;    // share of the surface that is ocean

  // Radiative forcing of CO₂ relative to 280 ppm (simplified logarithmic fit).
  const forcing = c => 5.35 * Math.log(c / C0);
  const F2X = forcing(2 * C0);
  // Effective emission temperature and the black-body estimate of the Planck response, 4σT³.
  const T_EMIT = Math.pow(ABSORBED / SIGMA, 0.25);
  const PLANCK_BB = 4 * SIGMA * Math.pow(T_EMIT, 3);

  // Net restoring strength: Planck minus the sum of the positive feedbacks (W/m²/K, > 0 means stable).
  const restoring = fbSum => LP - fbSum;
  // Top-of-atmosphere imbalance after warming dT: N = F − (λP − Σf)·dT.
  const imbalance = (F, dT, fbSum = 0) => F - restoring(fbSum) * dT;
  // Equilibrium warming: the dT that makes N = 0. Only defined while the net restoring strength is positive.
  const equilibrium = (F, fbSum = 0) => (restoring(fbSum) > 0 ? F / restoring(fbSum) : Infinity);
  const gain = fbSum => LP / restoring(fbSum);

  // Ledger entries at warming dT (step 1 and step 3 bars): each entry's W/m² contribution.
  function ledger(F, dT, fb) {
    const rows = [{ key: 'forcing', v: F }, { key: 'planck', v: -LP * dT }];
    ['wv', 'ice', 'cloud'].forEach(k => { if (fb && fb[k] !== undefined) rows.push({ key: k, v: fb[k] * dT }); });
    const net = rows.reduce((s, r) => s + r.v, 0);
    return { rows, net };
  }

  // Step 2: the round-by-round settlement. Round 1 closes F with Planck alone (F/λP); the warming of each
  // round adds f·ΔT of new imbalance, which the next round closes with ΔT·f/λP more warming.
  function rounds(F, f, n) {
    const r = f / LP, out = []; let inc = F / LP, total = 0;
    for (let k = 1; k <= n; k++) { total += inc; out.push({ k, inc, total }); inc *= r; }
    return { r, list: out, limit: equilibrium(F, f) };
  }
  // Number of rounds needed to reach a share p of the limit (1 − r^k ≥ p).
  const roundsTo = (f, p) => (f <= 0 ? 1 : Math.ceil(Math.log(1 - p) / Math.log(f / LP)));

  // Step 3: feedback sum from the toggles and the cloud value.
  function fbSum(useWv, useIce, cloud) { return (useWv ? FB.wv : 0) + (useIce ? FB.ice : 0) + cloud; }

  // Step 4: one-layer ocean. C dT/dt = F − Λ·T. Heat capacity of an ocean mixed layer of depth h (m),
  // averaged over the whole planet, in W·yr/(m²·K).
  const heatCap = h => RHO_CP * h * OCEAN_FRAC / SEC_YR;
  const LAMBDA_C = restoring(FB.wv + FB.ice + FB.cloud); // central net restoring strength
  function oneLayer(F, lam, C, t) {
    const tau = C / lam, e = Math.exp(-t / tau);
    return { tau, T: F / lam * (1 - e), N: F * e };
  }
  // Explicit Euler integration (tests compare it to the closed form).
  function oneLayerEuler(F, lam, C, tEnd, dt = 0.001) {
    let T = 0; for (let s = 0; s < tEnd - 1e-12; s += dt) T += dt * (F - lam * T) / C; return T;
  }

  // Step 5: constant emissions E (GtC/yr) with a fixed sink share s (0..1): ppm after t years.
  const ppmRate = (E, s) => E * (1 - s) / GTC_PER_PPM;
  const ppmAt = (E, s, t) => NOW_PPM + ppmRate(E, s) * t;
  // Equilibrium warming above pre-industrial for a concentration, with the central feedbacks.
  const eqWarming = c => forcing(c) / LAMBDA_C;

  const api = { S0, ALBEDO, ABSORBED, SIGMA, C0, NOW_PPM, LP, FB, CLOUD_RANGE, GTC_PER_PPM, OCEAN_FRAC, forcing, F2X, T_EMIT, PLANCK_BB,
    restoring, imbalance, equilibrium, gain, ledger, rounds, roundsTo, fbSum, heatCap, LAMBDA_C, oneLayer, oneLayerEuler, ppmRate, ppmAt, eqWarming };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CF_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
