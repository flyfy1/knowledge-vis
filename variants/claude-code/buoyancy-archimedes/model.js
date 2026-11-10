'use strict';
// Buoyancy lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every number on the page is computed here; tests/core.cjs pins the claims.
// Units: lengths in cm, volumes in cm³, masses in g, densities in g/cm³, forces in N, g = 9.8 N/kg.
// Liquids are still and incompressible; pressures are gauge pressures (the air pushes equally everywhere and cancels).
(function (root) {
  const G = 9.8;
  const N = grams => grams / 1000 * G;            // weight in N of a mass in g
  const MATS = { al: 2.7, iron: 7.9, copper: 8.9, stone: 2.5 };
  const LIQ = { oil: 0.92, water: 1.0, brine: 1.1 };

  // ---- step 0 / 1: a 5 cm × 5 cm × 8 cm aluminium block lowered on a spring scale ----
  const BLOCK = { a: 5, h: 8, rho: MATS.al };
  BLOCK.base = BLOCK.a * BLOCK.a; BLOCK.V = BLOCK.base * BLOCK.h; BLOCK.m = BLOCK.V * BLOCK.rho; BLOCK.W = N(BLOCK.m);
  // z = how deep the bottom face is below the surface (cm)
  function lowered(z, rhoL = 1) {
    const hs = Math.max(0, Math.min(BLOCK.h, z)), Vs = BLOCK.base * hs, Fb = N(Vs * rhoL);
    return { hs, Vs, Fb, reading: BLOCK.W - Fb, full: z >= BLOCK.h };
  }
  // Gauge pressure (Pa) at depth d cm, and the forces on the top/bottom faces (N). 1 cm² = 1e-4 m².
  const pressure = (d, rhoL = 1) => rhoL * 1000 * G * Math.max(0, d) / 100;
  function faces(z, rhoL = 1) {
    const top = z - BLOCK.h, Ftop = pressure(top, rhoL) * BLOCK.base * 1e-4, Fbot = pressure(z, rhoL) * BLOCK.base * 1e-4;
    // side faces: at every depth left and right feel the same pressure, so their forces cancel
    return { Ftop, Fbot, net: Fbot - Ftop };
  }

  // ---- step 2: overflow can ----
  // Object of material k and volume V cm³ fully under water in a brim-full can.
  function overflow(k, V, rhoL = 1) {
    const m = MATS[k] * V, W = N(m), spilled = V * rhoL, Fb = N(spilled);
    return { m, W, reading: W - Fb, Fb, spilledMass: spilled, spilledWeight: N(spilled) };
  }

  // ---- step 3: let go — float, hover or sink ----
  const OBJ_V = 200;
  function settle(rhoO, rhoL) {
    const W = N(rhoO * OBJ_V), FbMax = N(rhoL * OBJ_V);
    if (Math.abs(rhoO - rhoL) < 1e-9) return { state: 'hover', frac: 1, W, Fb: W, support: 0, FbMax };
    if (rhoO < rhoL) return { state: 'float', frac: rhoO / rhoL, W, Fb: W, support: 0, FbMax };
    return { state: 'sink', frac: 1, W, Fb: FbMax, support: W - FbMax, FbMax };
  }

  // ---- step 4: a steel boat ----
  const BOAT = { L: 20, B: 10, steel: 600, rhoSteel: 7.9 };
  BOAT.base = BOAT.L * BOAT.B;
  function boat(H, cargo) {
    const mass = BOAT.steel + cargo, draft = mass / (1 * BOAT.base); // water 1 g/cm³; hull steel volume neglected
    const maxCargo = BOAT.base * H * 1 - BOAT.steel, avg = mass / (BOAT.base * H);
    return { mass, draft, sinks: draft > H, freeboard: H - draft, maxCargo, avg, lumpV: BOAT.steel / BOAT.rhoSteel, lumpFb: N(BOAT.steel / BOAT.rhoSteel), lumpW: N(BOAT.steel) };
  }

  // ---- step 5: a hydrometer ----
  const HYD = { m: 18, bulb: 14, stem: 0.5 }; // g, cm³, cm² (stem cross-section)
  // How far up the stem the liquid surface sits (cm above the top of the bulb).
  const hydLevel = rhoL => (HYD.m / rhoL - HYD.bulb) / HYD.stem;

  const api = { G, N, MATS, LIQ, BLOCK, lowered, pressure, faces, overflow, OBJ_V, settle, BOAT, boat, HYD, hydLevel };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.BUOY_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
