'use strict';
// Float & sink lesson model (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Primary-school units: mass in grams (g), volume in cubic centimetres (cm³). Fresh water: 1 cm³ weighs 1 g.
// "The water holds up N grams" means the upward push of the water equals the weight of N grams.
// Every number on the page comes from here; tests/core.cjs pins the claims.
(function (root) {
  const WATER = 1; // g per cm³

  /* ---------- step 0: who floats? ---------- */
  // Typical values (stated on the page as typical, not measured). density = mass ÷ volume.
  const OBJECTS = [
    { id: 'log', mass: 10000, vol: 20000 },
    { id: 'apple', mass: 160, vol: 200 },
    { id: 'ice', mass: 46, vol: 50 },
    { id: 'nail', mass: 7.9, vol: 1 },
    { id: 'eraser', mass: 15, vol: 10 },
    { id: 'stone', mass: 26, vol: 10 }
  ];
  // Result of putting a solid object in a liquid of density rho (g/cm³).
  // fraction = share of the object under the surface; displaced = grams of liquid pushed aside.
  function settle(mass, vol, rho = WATER) {
    const same = vol * rho; // grams of liquid with the same size as the object
    if (mass < same - 1e-12) return { state: 'float', fraction: mass / same, displacedVol: mass / rho, displaced: mass, same };
    if (Math.abs(mass - same) <= 1e-12) return { state: 'hover', fraction: 1, displacedVol: vol, displaced: same, same };
    return { state: 'sink', fraction: 1, displacedVol: vol, displaced: same, same };
  }
  const density = o => o.mass / o.vol;

  /* ---------- step 1: pushing a block down ---------- */
  // Wooden block 10 cm × 10 cm base, 5 cm tall (500 cm³), 300 g. Tank 20 cm × 20 cm.
  const BLOCK = { base: 100, height: 5, mass: 300 };
  const TANK_AREA = 400;
  function push(depthCm) {
    const vol = BLOCK.base * depthCm, up = vol * WATER, hand = up - BLOCK.mass; // hand > 0: push down; < 0: hold up
    return { depth: depthCm, vol, up, hand, rise: vol / TANK_AREA };
  }
  const floatDepth = () => BLOCK.mass / (WATER * BLOCK.base); // where it rests on its own

  /* ---------- step 2: ball or boat ---------- */
  const CLAY = { mass: 90, vol: 60 };
  // outer = the boat's outside size including the air inside it (cm³). outer = 60 is the solid ball.
  function boat(outer) {
    const maxUp = outer * WATER, s = settle(CLAY.mass, outer);
    return { outer, maxUp, state: s.state, fraction: s.fraction, displaced: s.displaced };
  }

  /* ---------- step 3: a bottle submarine ---------- */
  const SUB = { outer: 100, empty: 80, tankMax: 40 };
  function sub(waterIn) {
    const total = SUB.empty + waterIn, s = settle(total, SUB.outer);
    return { waterIn, total, maxUp: SUB.outer * WATER, ...s };
  }

  /* ---------- step 4: fresh water, sea water, very salty water ---------- */
  const LIQUIDS = { fresh: 1.0, sea: 1.025, brine: 1.15 }; // g per cm³
  const SHIP = { base: 100, height: 10, mass: 600 };   // box hull, 10 cm × 10 cm base
  const EGG = { mass: 60, vol: 56 };
  const shipDraft = rho => SHIP.mass / (rho * SHIP.base); // cm under the surface
  const cupWeight = rho => 100 * rho;                     // grams of 100 cm³ of this liquid

  /* ---------- step 5: quiz ---------- */
  const QUIZ = { mass: 30, vol: 50 };

  const api = { WATER, OBJECTS, settle, density, BLOCK, TANK_AREA, push, floatDepth, CLAY, boat, SUB, sub, LIQUIDS, SHIP, EGG, shipDraft, cupWeight, QUIZ };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FLOAT_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
