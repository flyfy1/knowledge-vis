'use strict';
// Pressure lesson model (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every number drawn or printed on the page comes from here; tests/core.cjs pins the claims.
// Conventions: SI units inside (N, m, m², Pa, kg/m³); lengths given in cm are converted here.
// g = 10 N/kg throughout (stated on the page; the measured value is about 9.8 N/kg).
(function (root) {
  const G = 10;          // N/kg
  const G_TRUE = 9.8;    // N/kg, only used to show what the more precise value would give
  const P0 = 1.013e5;    // Pa, standard atmospheric pressure
  const RHO_WATER = 1000;

  /* ---------- step 0: one brick, three faces ---------- */
  // Brick 20 cm × 10 cm × 5 cm, 2 kg. Each face is the rectangle that touches the sponge.
  const BRICK = { dims: [20, 10, 5], mass: 2 };
  const FACES = { flat: [20, 10], side: [20, 5], end: [10, 5] }; // [width, depth] in cm of the contact face
  const FACE_HEIGHT = { flat: 5, side: 10, end: 20 };            // how tall one brick stands, cm
  // Sponge dent: a teaching assumption, depth proportional to pressure (1 mm per 400 Pa), not a material law.
  const DENT_MM_PER_PA = 1 / 400;
  function brick(face, n) {
    const [w, d] = FACES[face];
    const Scm2 = w * d, S = Scm2 / 1e4, F = n * BRICK.mass * G, p = F / S;
    return { face, n, w, d, h: FACE_HEIGHT[face], Scm2, S, F, p, perCm2: F / Scm2, dentMM: p * DENT_MM_PER_PA };
  }

  /* ---------- step 1: a ladder of everyday pressures (stated estimates, F and S given) ---------- */
  // Each case: force F (N) and contact area S (m²) as written on the page. p is computed, never typed in.
  const CASES = [
    { id: 'ski', F: 600, S: 2 * 1.6 * 0.1 },          // 60 kg person on two skis 1.6 m × 10 cm
    { id: 'stand', F: 600, S: 2 * 200e-4 },          // same person on two soles of 200 cm²
    { id: 'tank', F: 4e5, S: 2 * 4 * 0.5 },          // 40 t tank on two tracks 4 m × 0.5 m touching the ground
    { id: 'thumb', F: 20, S: 1e-4 },                 // thumb pushing a tack: cap 1 cm²
    { id: 'heel', F: 300, S: 1e-4 },                 // half the person's weight on one heel tip of 1 cm²
    { id: 'knife', F: 50, S: 0.2 * 2e-5 },           // 50 N on an edge 20 cm long, 0.02 mm wide
    { id: 'tip', F: 20, S: 0.05e-6 }                 // same 20 N on the tack's point, 0.05 mm²
  ];
  CASES.forEach(c => { c.p = c.F / c.S; });
  const caseById = id => CASES.find(c => c.id === id);
  const ratio = (a, b) => caseById(a).p / caseById(b).p;

  /* ---------- step 2: pressure inside a liquid ---------- */
  const LIQUIDS = { alcohol: 800, water: 1000, brine: 1200 }; // kg/m³
  // p = ρ g h for a point h metres below the surface (gauge pressure: the air above is not counted).
  const liquidP = (rho, hM) => rho * G * hM;
  // Column argument: liquid above an area S at depth h has weight ρ·S·h·g, so weight ÷ S = ρgh.
  const columnP = (rho, hM, S) => (rho * S * hM * G) / S;
  // Water-filled U-tube gauge: height difference that balances p.
  const gaugeRise = (p, rhoGauge = RHO_WATER) => p / (rhoGauge * G);

  /* ---------- step 3: three containers, same bottom, different shapes ---------- */
  // Each container is 10 cm deep into the page with a 10 cm × 10 cm bottom; width(y) in cm at height y cm.
  const DEPTH_CM = 10;
  const SHAPES = {
    straight: { width: y => 10, top: 10 },
    flared: { width: y => 10 + y, top: 30 },        // walls lean out, 0.5 cm per cm on each side
    narrow: { width: y => 10 - 0.4 * y, top: 2 }    // walls lean in, 0.2 cm per cm on each side
  };
  const H_MAX = 20; // cm
  // Volume by integrating width over height (Simpson, exact for these linear widths).
  function volumeCm3(shape, hCm) {
    const f = SHAPES[shape].width, n = 40, dh = hCm / n;
    let s = 0; for (let i = 0; i <= n; i++) s += f(i * dh) * (i === 0 || i === n ? 1 : i % 2 ? 4 : 2);
    return DEPTH_CM * s * dh / 3;
  }
  function container(shape, hCm) {
    const V = volumeCm3(shape, hCm), weight = RHO_WATER * V * 1e-6 * G;
    const p = liquidP(RHO_WATER, hCm / 100), Sb = 10 * DEPTH_CM * 1e-4, Fb = p * Sb;
    // The walls carry the difference: + means the walls hold some water up, − means they push down on it.
    return { shape, hCm, V, weight, p, Sb, Fb, wall: weight - Fb };
  }

  /* ---------- step 4: air pressure and two hemispheres ---------- */
  // Inside pressure after pumping out a fraction of the air (same temperature): p_in = P0·(1 − frac).
  function hemispheres(Dcm, frac) {
    const r = Dcm / 200, A = Math.PI * r * r, pin = P0 * (1 - frac), F = (P0 - pin) * A;
    return { D: Dcm, A, pin, F, kg: F / G };
  }
  const waterColumn = g => P0 / (RHO_WATER * g);

  /* ---------- step 5: quiz ---------- */
  const diverP = liquidP(RHO_WATER, 10); // 10 m under water

  const api = { G, G_TRUE, P0, RHO_WATER, BRICK, FACES, FACE_HEIGHT, DENT_MM_PER_PA, brick, CASES, caseById, ratio, LIQUIDS, liquidP, columnP, gaugeRise, DEPTH_CM, SHAPES, H_MAX, volumeCm3, container, hemispheres, waterColumn, diverP };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.PRESSURE_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
