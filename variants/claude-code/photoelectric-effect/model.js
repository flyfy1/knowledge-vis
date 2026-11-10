'use strict';
// Photoelectric-effect lesson model (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every bar, curve, dot and readout on the page is computed here; tests/core.cjs pins the claims.
// SI constants (exact since 2019). Work functions are rounded textbook values for clean surfaces; real values
// shift with surface preparation. Assumptions shared by the page: quantum efficiency η = 10% (electrons per
// absorbed photon, the same at every wavelength above threshold), light power 1 mW at 100% brightness, plane
// electrodes, and emitted kinetic energies spread evenly between 0 and K_max (this sets the shape of the I–V
// curve, not where it ends).
(function (root) {
  const H = 6.62607015e-34, E = 1.602176634e-19, C = 299792458;
  const HC_EVNM = H * C / E * 1e9; // 1239.84 eV·nm
  const H_EVS = H / E;             // 4.1357e-15 eV·s
  const ETA = 0.1, P_FULL = 1e-3;
  const METALS = [
    { id: 'Cs', phi: 2.14 }, { id: 'Na', phi: 2.28 }, { id: 'Zn', phi: 4.33 }, { id: 'Cu', phi: 4.65 }, { id: 'Pt', phi: 5.65 }
  ];
  const phiOf = id => METALS.find(m => m.id === id).phi;

  const photonEV = lambdaNm => HC_EVNM / lambdaNm;
  const freq = lambdaNm => C / (lambdaNm * 1e-9);
  const kmax = (lambdaNm, phi) => Math.max(0, photonEV(lambdaNm) - phi);
  const emits = (lambdaNm, phi) => photonEV(lambdaNm) > phi;
  function threshold(phi) { return { f0: phi / H_EVS, lambda0: HC_EVNM / phi }; }
  // photons per second carried by power P (W) at this wavelength
  const photonRate = (P, lambdaNm) => P / (photonEV(lambdaNm) * E);
  const electronRateP = (P, lambdaNm, phi, eta = ETA) => (emits(lambdaNm, phi) ? eta * photonRate(P, lambdaNm) : 0);
  function photocurrent(P, lambdaNm, phi, eta = ETA) { return E * electronRateP(P, lambdaNm, phi, eta); }

  // I–V for plane electrodes. V > 0 pulls electrons to the anode (all collected); V < 0 opposes them, and only
  // electrons with K > e|V| arrive. With K spread evenly over [0, K_max]: I = I_sat · (1 − |V|/K_max).
  function iv(V, kmaxEV, Isat) {
    if (kmaxEV <= 0) return 0;
    if (V >= 0) return Isat;
    return Isat * Math.max(0, 1 - (-V) / kmaxEV);
  }
  // The stopping voltage as an experimenter finds it: lower V in 5 mV steps until the current is gone.
  function findStopping(kmaxEV) {
    if (kmaxEV <= 0) return null;
    let n = 0; while (iv(-n * 0.005, kmaxEV, 1) > 1e-12) n++;
    return n * 0.005;
  }
  // Step 2 picture: N sample electrons with K evenly spread over (0, K_max]; how far each gets against V.
  // Returns the fraction of the gap reached (1 = arrives at the anode).
  function reach(K, V) { if (V >= 0) return 1; return Math.min(1, K / (-V)); }
  function sampleK(kmaxEV, n) { const out = []; for (let i = 0; i < n; i++) out.push(kmaxEV * (i + 0.5) / n); return out; }

  // Seeded PRNG (mulberry32)
  function rng(seed) {
    let a = seed >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  // Step 3: mercury-lamp lines (nm, standard wavelengths) and a simulated reading error, fixed pseudo-random, within ±0.03 V.
  const HG_LINES = [253.7, 312.6, 365.0, 404.7, 435.8, 546.1, 577.0];
  const NOISE = 0.03;
  function measureVs(lineIdx, metalId) {
    const lam = HG_LINES[lineIdx], v = findStopping(kmax(lam, phiOf(metalId))); if (v === null) return null;
    const mi = METALS.findIndex(m => m.id === metalId);
    const r = rng(1000 + lineIdx * 7 + mi * 101)(); return Math.max(0, v + (2 * r - 1) * NOISE); // a reading cannot go below 0 V
  }
  // Least squares V = a·f + b
  function fit(points) {
    const n = points.length; if (n < 2) return null;
    let sx = 0, sy = 0, sxx = 0, sxy = 0;
    points.forEach(p => { sx += p.f; sy += p.V; sxx += p.f * p.f; sxy += p.f * p.V; });
    const d = n * sxx - sx * sx; if (Math.abs(d) < 1e-6 * sxx) return null;
    const a = (n * sxy - sx * sy) / d, b = (sy - a * sx) / n;
    return { slope: a, intercept: b, h: a * E, phi: -b, f0: -b / a };
  }
  function measuredPoints(metalId) {
    const pts = [];
    HG_LINES.forEach((lam, i) => { const V = measureVs(i, metalId); if (V !== null) pts.push({ i, lam, f: freq(lam), V }); });
    return pts;
  }

  // Step 4: dim light. A continuous wave spreads power evenly; one atom intercepts I·A_atom.
  const A_ATOM = 1e-20, A_PLATE = 1e-4; // m²: (0.1 nm)², 1 cm²
  const classicalWait = (I, phi) => phi * E / (I * A_ATOM);
  const electronRate = (I, lambdaNm, phi, eta = ETA) => electronRateP(I * A_PLATE, lambdaNm, phi, eta);
  // Emission times (Poisson process): exponential gaps with mean 1/rate.
  function emissionTimes(rate, n, seed) { const r = rng(seed), out = []; let t = 0; for (let i = 0; i < n; i++) { t += -Math.log(1 - r()) / rate; out.push(t); } return out; }
  // Human-scale unit for a duration in seconds.
  const UNITS = [['yr', 365.25 * 86400], ['d', 86400], ['h', 3600], ['min', 60], ['s', 1], ['ms', 1e-3], ['us', 1e-6], ['ns', 1e-9], ['ps', 1e-12], ['fs', 1e-15]];
  function human(sec) { for (const [u, s] of UNITS) if (sec >= s) return { v: sec / s, unit: u }; return { v: sec / 1e-15, unit: 'fs' }; }

  // Approximate visible colour of a wavelength (for drawing only).
  function colour(lambdaNm) {
    const l = lambdaNm; let r = 0, g = 0, b = 0;
    if (l < 380) return 'rgb(176,140,255)';
    if (l < 440) { r = (440 - l) / 60; b = 1; } else if (l < 490) { g = (l - 440) / 50; b = 1; } else if (l < 510) { g = 1; b = (510 - l) / 20; }
    else if (l < 580) { r = (l - 510) / 70; g = 1; } else if (l < 645) { r = 1; g = (645 - l) / 65; } else r = 1;
    const f = l > 700 ? 0.5 : l < 420 ? 0.4 + 0.6 * (l - 380) / 40 : 1;
    const c = v => Math.round(255 * Math.pow(Math.max(0, v * f), 0.8));
    return `rgb(${Math.max(60, c(r))},${Math.max(60, c(g))},${Math.max(60, c(b))})`;
  }

  const api = { H, E, C, HC_EVNM, H_EVS, ETA, P_FULL, METALS, phiOf, photonEV, freq, kmax, emits, threshold, photonRate, electronRateP, photocurrent, iv, findStopping, reach, sampleK, rng, HG_LINES, NOISE, measureVs, fit, measuredPoints, A_ATOM, A_PLATE, classicalWait, electronRate, emissionTimes, UNITS, human, colour };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.PE_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
