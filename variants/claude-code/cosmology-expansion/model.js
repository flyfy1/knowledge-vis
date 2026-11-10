'use strict';
// Cosmic expansion lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// A homogeneous, isotropic, spatially flat universe (FLRW) with matter and a cosmological constant;
// radiation is neglected (tests check that this changes nothing visible for z ≤ 10).
// Units: Mpc, km/s, Gyr, Gly. Every point, curve and readout on the page is computed here.
(function (root) {
  const C_KMS = 299792.458;           // speed of light, km/s
  const MPC_KM = 3.0856776e19;        // km per Mpc
  const GYR_S = 3.15576e16;           // seconds per Gyr
  const GLY_PER_MPC = 3.26156e-3;     // 1 Mpc = 3.26156 million light-years
  const LAMBDA_HA = 656.3;            // hydrogen-alpha rest wavelength, nm

  // 1/H0 in Gyr for H0 in km/s/Mpc (≈ 977.8 / H0).
  const hubbleTime = H0 => MPC_KM / H0 / GYR_S;
  const hubbleDist = H0 => C_KMS / H0; // c/H0 in Mpc

  /* ---- a toy galaxy lattice in comoving coordinates (Mpc at a = 1) ---- */
  const SPACING = 10;
  // Deterministic jitter so the lattice is not a perfect grid; same galaxy (i, j) → same offset.
  function hash(i, j, s) { let h = (i * 374761393 + j * 668265263 + s * 1442695041) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; }
  const chi = (i, j) => [i * SPACING + (hash(i, j, 1) - 0.5) * 5, j * SPACING + (hash(i, j, 2) - 0.5) * 5];
  // Proper (physical) separation of galaxy (i, j) from galaxy (hi, hj) at scale factor a: d = a·Δχ.
  function separation(a, home, g) { const p = chi(g[0], g[1]), q = chi(home[0], home[1]); return [a * (p[0] - q[0]), a * (p[1] - q[1])]; }
  const dist = v => Math.hypot(v[0], v[1]);
  // Velocity of g seen from home: v = H·d (vector), H in km/s/Mpc.
  function velocity(H, a, home, g) { const d = separation(a, home, g); return [H * d[0], H * d[1]]; }

  /* ---- step 2: a simulated Hubble diagram with peculiar velocities ---- */
  function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const SIG_PEC = 300, N_CAT = 40, H_TRUE = 70, D_MIN = 2, N_SETS = 6;
  const DMAX = [10, 20, 30, 50, 75, 100, 150, 200, 300, 400]; // slider positions of step 2
  function catalogue(seed, dmax) {
    const u = rng(seed * 7919 + 13), out = [];
    for (let i = 0; i < N_CAT; i++) {
      const f = u(), g = Math.sqrt(-2 * Math.log(1 - u())) * Math.cos(2 * Math.PI * u());
      const d = D_MIN + f * (dmax - D_MIN);
      out.push({ d, v: H_TRUE * d + SIG_PEC * g });
    }
    return out;
  }
  // Least-squares slope through the origin.
  function fitH(cat) { let sv = 0, sd = 0; cat.forEach(p => { sv += p.v * p.d; sd += p.d * p.d; }); return sv / sd; }
  // Expected scatter of that slope for distances uniform on [D_MIN, dmax]: σ / √(N·E[d²]).
  function sigmaH(dmax) { const e2 = (Math.pow(dmax, 3) - Math.pow(D_MIN, 3)) / (3 * (dmax - D_MIN)); return SIG_PEC / Math.sqrt(N_CAT * e2); }

  /* ---- background expansion: flat matter + Λ ---- */
  const E = (a, Om, Or = 0) => Math.sqrt(Om / (a * a * a) + Or / (a * a * a * a) + (1 - Om - Or));
  // Cosmic time at scale factor a, in Gyr (closed form for flat matter + Λ).
  function timeAt(a, Om, H0 = H_TRUE) {
    const th = hubbleTime(H0), OL = 1 - Om;
    if (OL < 1e-12) return 2 / 3 * th * Math.pow(a, 1.5);
    return 2 / (3 * Math.sqrt(OL)) * th * Math.asinh(Math.sqrt(OL / Om) * Math.pow(a, 1.5));
  }
  // Inverse: scale factor at cosmic time t (Gyr).
  function scaleAt(t, Om, H0 = H_TRUE) {
    const th = hubbleTime(H0), OL = 1 - Om;
    if (OL < 1e-12) return Math.pow(1.5 * t / th, 2 / 3);
    return Math.pow(Om / OL, 1 / 3) * Math.pow(Math.sinh(1.5 * Math.sqrt(OL) * t / th), 2 / 3);
  }
  // Numerical time integral (tests compare with the closed form; also allows radiation).
  function timeAtNumeric(a, Om, H0 = H_TRUE, Or = 0) {
    const n = 4000, th = hubbleTime(H0); let s = 0;
    // substitute a = x², da = 2x dx, which removes the endpoint singularity
    const f = x => { if (x === 0) return 0; const aa = x * x; return 2 * x / (aa * E(aa, Om, Or)); };
    const X = Math.sqrt(a), h = X / n;
    for (let k = 0; k <= n; k++) s += f(k * h) * (k === 0 || k === n ? 1 : k % 2 ? 4 : 2);
    return th * s * h / 3;
  }
  const age = (Om, H0 = H_TRUE) => timeAt(1, Om, H0);
  // Deceleration: ä = 0 where Ωm/a³ = 2ΩΛ.
  const accelA = Om => (Om >= 1 ? Infinity : Math.cbrt(Om / (2 * (1 - Om))));
  const q0 = Om => Om / 2 - (1 - Om);

  /* ---- distances to a source at redshift z ---- */
  // Comoving distance today, Mpc: (c/H0)·∫ dz/E(z) (Simpson).
  function comoving(z, Om = 0.3, H0 = H_TRUE, Or = 0) {
    if (z <= 0) return 0;
    const n = 2000, h = z / n, f = zz => 1 / E(1 / (1 + zz), Om, Or); let s = 0;
    for (let k = 0; k <= n; k++) s += f(k * h) * (k === 0 || k === n ? 1 : k % 2 ? 4 : 2);
    return hubbleDist(H0) * s * h / 3;
  }
  // Light-travel (lookback) time in Gyr; numerically the light-travel distance in Gly.
  const lookback = (z, Om = 0.3, H0 = H_TRUE) => age(Om, H0) - timeAt(1 / (1 + z), Om, H0);
  const distances = (z, Om = 0.3, H0 = H_TRUE) => {
    const chiMpc = comoving(z, Om, H0);
    return { z, chiMpc, chiGly: chiMpc * GLY_PER_MPC, emitGly: chiMpc * GLY_PER_MPC / (1 + z), travelGly: lookback(z, Om, H0), vOverC: chiMpc / hubbleDist(H0) };
  };
  // Redshift whose comoving distance equals c/H0 (recession speed today = c), by bisection.
  function zAtHubbleDistance(Om = 0.3, H0 = H_TRUE) { let lo = 0, hi = 10; for (let k = 0; k < 60; k++) { const m = (lo + hi) / 2; if (comoving(m, Om, H0) < hubbleDist(H0)) lo = m; else hi = m; } return (lo + hi) / 2; }
  // Redshift where the distance at emission χ/(1+z) peaks (golden-section search).
  function zEmitPeak(Om = 0.3, H0 = H_TRUE) {
    let a = 0.2, b = 5; const g = (Math.sqrt(5) - 1) / 2, f = z => -comoving(z, Om, H0) / (1 + z);
    for (let k = 0; k < 80; k++) { const c = b - g * (b - a), d = a + g * (b - a); if (f(c) < f(d)) b = d; else a = c; }
    return (a + b) / 2;
  }

  /* ---- redshift of light ---- */
  const redshift = aEmit => 1 / aEmit - 1;
  const observed = (lambda0, aEmit) => lambda0 / aEmit;

  const api = { C_KMS, GLY_PER_MPC, LAMBDA_HA, SPACING, hubbleTime, hubbleDist, chi, separation, dist, velocity,
    SIG_PEC, N_CAT, H_TRUE, D_MIN, N_SETS, DMAX, catalogue, fitH, sigmaH, E, timeAt, scaleAt, timeAtNumeric, age, accelA, q0,
    comoving, lookback, distances, zAtHubbleDistance, zEmitPeak, redshift, observed };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.COSMO_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
