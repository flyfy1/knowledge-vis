'use strict';
// Fire-triangle lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every flame, curve and readout on the page is computed here; tests/core.cjs pins the claims.
// One teaching model runs through steps 1–3: a "heat budget" for a piece of fuel at temperature T (°C).
//   dT/dt = heater + burning·G·(φ/21%) − (T − room)/τ − cooling
// burning ⇔ there is fuel, there is oxygen (φ > 0) and T ≥ the ignition point.
// So the fire keeps itself going only while the heat it releases can hold T above the ignition point:
// the three legs of the triangle are the three things that loop needs. Values are teaching values.
(function (root) {
  const ROOM = 20;               // °C
  const TIGN = 300;              // ignition point of the fuel in steps 1 and 3 (teaching value)
  const PHI_AIR = 0.21;          // oxygen share of air (by volume)
  const PHI_MIN = 0.16;          // teaching value: below this the flame cannot hold T ≥ TIGN
  const TAU = 4;                 // s, how fast the fuel's temperature relaxes toward room temperature
  const G = (TIGN - ROOM) * (PHI_AIR / PHI_MIN) / TAU;   // °C/s released by burning in air (≈ 91.9)
  const MATCH = 500 / TAU;       // °C/s from a match flame: alone it would hold the fuel at room + 500 °C
  const WATER = 130;             // step 3: °C of cooling per gram of water, spread over one second

  // Steady temperature of fuel that keeps burning at oxygen share φ (no heater, no cooling).
  const steadyT = phi => ROOM + G * (phi / PHI_AIR) * TAU;
  const sustains = phi => steadyT(phi) >= TIGN - 1e-9;

  // Step 0: the classic copper-plate experiment (textbook ignition points).
  const SAMPLES = {
    whiteP: { fuel: true, ign: 40, inWater: false },
    redP: { fuel: true, ign: 240, inWater: false },
    whitePWater: { fuel: true, ign: 40, inWater: true },
    copper: { fuel: false, ign: null, inWater: false }
  };
  function plate(id, Twater, oxygenIntoWater) {
    const s = SAMPLES[id], T = Twater;            // the copper plate sits at about the water temperature
    const fuel = s.fuel, oxygen = s.inWater ? oxygenIntoWater : true, hot = s.fuel && T >= s.ign;
    const missing = [];
    if (!fuel) missing.push('fuel');
    if (!oxygen) missing.push('oxygen');
    if (fuel && !hot) missing.push('heat');
    return { burns: missing.length === 0, fuel, oxygen, hot, T, ign: s.ign, missing };
  }

  // Generic heat-budget simulation. opts: T0, burning0, phi(t), fuel(t), heater(t), cool(t), tEnd, dt.
  function simulate(o) {
    const dt = o.dt || 0.005, tEnd = o.tEnd || 20, every = o.every || 0.05;
    let T = o.T0 !== undefined ? o.T0 : ROOM, tIgn = null, tOut = null, Tmax = T, wasBurning = false;
    const out = []; let next = 0;
    for (let i = 0; ; i++) {
      const tt = i * dt;
      const phi = o.phi ? o.phi(tt) : PHI_AIR, fuel = o.fuel ? o.fuel(tt) : true;
      const burning = fuel && phi > 0 && T >= TIGN;
      if (burning && !wasBurning && tIgn === null && tt > 0) tIgn = tt;
      if (!burning && wasBurning && tOut === null) tOut = tt;
      if (i === 0 && burning) { wasBurning = true; }
      wasBurning = burning;
      if (tt >= next - 1e-9) { out.push({ t: tt, T, phi, burning }); next += every; }
      if (tt >= tEnd - 1e-9) break;
      const heat = (o.heater ? o.heater(tt) : 0) + (burning ? G * phi / PHI_AIR : 0) - (T - ROOM) / TAU - (o.cool ? o.cool(tt) : 0);
      T += heat * dt; Tmax = Math.max(Tmax, T);
    }
    return { pts: out, tIgn, tOut, Tmax, Tend: T, burningAtEnd: out[out.length - 1].burning };
  }

  // Step 1: hold a match to cold fuel for `hold` seconds.
  const ignite = (hold, tEnd = 20) => simulate({ heater: tt => (tt < hold ? MATCH : 0), tEnd });
  // Shortest hold that ignites: match alone T(t) = room + 500(1 − e^(−t/τ)) reaches TIGN.
  const minHold = () => -TAU * Math.log(1 - (TIGN - ROOM) / (MATCH * TAU));

  // Step 2: a candle under a jar of V mL. Burning uses oxygen at a rate ∝ φ (4 mL/s in fresh air);
  // the flame reacts fast, so it goes out once φ falls to PHI_MIN.
  const O2_RATE = 4;              // mL of O₂ per second in fresh air (teaching value for a small candle)
  const jarPhi = (V, tt) => PHI_AIR * Math.exp(-O2_RATE * Math.min(tt, jarOut(V)) / (PHI_AIR * V));
  const jarOut = V => (PHI_AIR * V / O2_RATE) * Math.log(PHI_AIR / PHI_MIN);
  const jarUsed = V => V * (PHI_AIR - PHI_MIN);   // mL of O₂ used before the flame dies

  // Step 3: put out fuel that is burning steadily in air; the action starts at t = 4 s.
  const ACT_AT = 4;
  function extinguish(action, water = 1, tEnd = 20) {
    const o = { T0: steadyT(PHI_AIR), tEnd };
    if (action === 'fuel') o.fuel = tt => tt < ACT_AT;
    if (action === 'lid') o.phi = tt => (tt < ACT_AT ? PHI_AIR : PHI_AIR * Math.exp(-(tt - ACT_AT) / 0.5));
    if (action === 'water') o.cool = tt => (tt >= ACT_AT && tt < ACT_AT + 1 ? WATER * water : 0);
    return simulate(o);
  }
  // Least water (g) that puts the fire out (bisection on the simulation).
  function minWater() {
    let lo = 0, hi = 5;
    for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; if (extinguish('water', mid).burningAtEnd) lo = mid; else hi = mid; }
    return hi;
  }

  // Step 4: a 4 cm wood cube cut into n×n×n pieces. Burning is a surface process, so the burn-out time
  // falls as 1/(area) and 1/(oxygen share). One whole cube in air burns out in 600 s (teaching value).
  const CUBE_CM = 4, T_WHOLE = 600;
  function chop(n, phi = PHI_AIR) {
    const area = 6 * CUBE_CM * CUBE_CM * n;          // cm²: n³ pieces × 6 (L/n)²
    const time = T_WHOLE / n * (PHI_AIR / phi);
    return { n, pieces: n * n * n, sizeCm: CUBE_CM / n, area, areaRatio: n, time, powerRatio: T_WHOLE / time };
  }

  const trim = s => (s.indexOf('.') < 0 ? s : s.replace(/0+$/, '').replace(/\.$/, ''));
  const fix = (v, d) => { const s = v.toFixed(d); return Number(s) === 0 ? (0).toFixed(d) : s; };

  const api = { ROOM, TIGN, PHI_AIR, PHI_MIN, TAU, G, MATCH, WATER, steadyT, sustains, SAMPLES, plate, simulate, ignite, minHold, O2_RATE, jarPhi, jarOut, jarUsed, ACT_AT, extinguish, minWater, CUBE_CM, T_WHOLE, chop, trim, fix };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.FIRE_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
