'use strict';
// Frozen-bubble lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every number, shape and curve on the page is computed here; tests/core.cjs pins the claims.
// Two kinds of content, kept apart:
//  * physical estimates with textbook constants (film/air mass, latent-heat budget, surface-tension trend);
//  * teaching sketches with stated, simplified rules (crystal growth speed ∝ undercooling, Marangoni drift ∝ tension
//    gradient, exponential temperature profile up the bubble). Their time and length units are diagram units, not data.
(function (root) {
  // ---- constants (water values; the film is mostly water) ----
  const K = {
    Lf: 334,        // J/g, latent heat of fusion of water
    c: 4.18,        // J/(g·°C), specific heat of liquid water
    rhoFilm: 1.0,   // g/cm³, film liquid (≈ water; glycerol makes it slightly denser — ignored)
    rhoAir: 0.00129,// g/cm³, air near 0 °C
    Tm: -6.5,       // °C, freezing point of the water/glycerol/soap recipe used by Ahmadi et al. (2019)
    hair: 70,       // µm, a typical human hair diameter (for scale)
    drop: 0.05,     // g, a typical drop of water (for scale)
    N2: -210, O2: -218, // °C, freezing points of nitrogen and oxygen
    dGamma: -0.15   // mN/(m·°C), how water's surface tension changes per degree near 0 °C
  };

  // ---- step 0: what can freeze? (thin spherical shell vs the air inside) ----
  function bubble(Dcm, hum) {
    const area = Math.PI * Dcm * Dcm;              // cm²
    const filmVol = area * hum * 1e-4;              // cm³ (h in µm → cm)
    const airVol = Math.PI * Dcm * Dcm * Dcm / 6;   // cm³
    const filmMass = filmVol * K.rhoFilm, airMass = airVol * K.rhoAir;
    return { area, filmVol, airVol, filmMass, airMass, ratio: airMass / filmMass, hairRatio: K.hair / hum };
  }

  // ---- steps 1–2: teaching sketch of six-armed ice crystals in a flat patch of film (radius 1) ----
  const GROW_K = 0.004;           // diagram units per diagram second per °C of undercooling
  const undercool = Tair => K.Tm - Tair;            // ΔT = Tm − T (°C); > 0 means colder than the freezing point
  const tipSpeed = dT => (dT > 0 ? GROW_K * dT : 0);
  // Side-branch spacing shrinks as undercooling grows (sketch rule: plates when barely undercooled, feathery when very cold).
  const branchGap = dT => Math.min(0.3, 1 / Math.max(dT, 0.5));
  const SEED_SLOTS = [[0, 0], [-0.5, 0.35], [0.55, -0.3], [0.2, 0.62], [-0.35, -0.6], [0.7, 0.35]];
  const SEED_TURNS = [0.1, 0.35, 0.0, 0.5, 0.22, 0.8]; // orientation of arm 0, in radians
  const MAX_SEEDS = 6, T_END = 30;
  // Hexagonal "distance": point p lies inside a crystal of arm length L iff hexDist(p) ≤ L.
  function hexDist(px, py, s) {
    const dx = px - s.x, dy = py - s.y; let m = 0;
    for (let k = 0; k < 6; k++) { const a = s.th + Math.PI / 6 + k * Math.PI / 3; m = Math.max(m, (dx * Math.cos(a) + dy * Math.sin(a)) / Math.cos(Math.PI / 6)); }
    return m;
  }
  // Arm length of crystal s at time t (diagram units), before any clipping.
  const armLen = (s, t, dT) => Math.max(0, t - s.born) * tipSpeed(dT);
  // A point belongs to whichever crystal reaches it first; returns that arrival time (Infinity if none).
  function arrival(px, py, seeds, dT) {
    const v = tipSpeed(dT); if (!(v > 0)) return Infinity;
    let best = Infinity; for (const s of seeds) best = Math.min(best, s.born + hexDist(px, py, s) / v);
    return best;
  }
  // Visible arm of crystal i along direction ang: stops where another crystal got there first or at the patch edge.
  function armReach(i, ang, seeds, t, dT) {
    const s = seeds[i], L = armLen(s, t, dT), v = tipSpeed(dT), step = 0.005;
    let r = 0;
    while (r + step <= L) {
      const px = s.x + (r + step) * Math.cos(ang), py = s.y + (r + step) * Math.sin(ang);
      if (px * px + py * py > 1) break;
      const mine = s.born + (r + step) / v;
      let lost = false; for (let j = 0; j < seeds.length; j++) if (j !== i && seeds[j].born + hexDist(px, py, seeds[j]) / v < mine - 1e-9) { lost = true; break; }
      if (lost) break;
      r += step;
    }
    return r;
  }
  // Fraction of the patch that some crystal has reached by time t (grid sample, deterministic).
  const GRID = 90;
  function coverage(seeds, t, dT) {
    let inside = 0, hit = 0;
    for (let i = 0; i < GRID; i++) for (let j = 0; j < GRID; j++) {
      const x = -1 + (i + 0.5) * 2 / GRID, y = -1 + (j + 0.5) * 2 / GRID;
      if (x * x + y * y > 1) continue; inside++;
      if (arrival(x, y, seeds, dT) <= t) hit++;
    }
    return hit / inside;
  }
  const makeSeed = (k, born, x, y) => ({ x: x !== undefined ? x : SEED_SLOTS[k % SEED_SLOTS.length][0], y: y !== undefined ? y : SEED_SLOTS[k % SEED_SLOTS.length][1], th: SEED_TURNS[k % SEED_TURNS.length], born });

  // ---- step 3: latent-heat budget for a film that starts at the air temperature ----
  // Freezing a fraction f releases f·Lf per gram; with no heat lost, it warms the whole film by f·Lf/c,
  // until the film reaches Tm (ice and liquid then coexist at Tm and freezing stalls).
  const fStall = dT => (dT > 0 ? K.c * dT / K.Lf : 0);
  function filmTemp(Tair, f) { const dT = undercool(Tair); if (dT <= 0) return Tair; return Math.min(K.Tm, Tair + f * K.Lf / K.c); }
  function heatBudget(Dcm, hum, Tair) {
    const m = bubble(Dcm, hum).filmMass, dT = undercool(Tair), fs = Math.min(1, fStall(dT));
    return { m, dT, fs, qFree: fs * m * K.Lf, qRest: (1 - fs) * m * K.Lf, qAll: m * K.Lf };
  }

  // ---- step 4: Marangoni sketch on a 1-D strip of liquid film (x ∈ [−1, 1]) ----
  const WARM_W = 0.22, STRIP_BASE = -8; // °C, the rest of the film strip (sketch setting)
  const stripT = (x, x0, dTw, Tbase) => Tbase + dTw * Math.exp(-((x - x0) * (x - x0)) / (2 * WARM_W * WARM_W));
  const gammaW0 = 75.6; // mN/m, water at 0 °C
  const gamma = T => gammaW0 + K.dGamma * T;
  // Surface flow runs toward higher tension: u ∝ dγ/dx (sketch scale MU, diagram units per diagram second).
  const MU = 0.9;
  function flowU(x, x0, dTw) {
    const dTdx = -dTw * (x - x0) / (WARM_W * WARM_W) * Math.exp(-((x - x0) * (x - x0)) / (2 * WARM_W * WARM_W));
    return MU * K.dGamma * dTdx;
  }
  // Position of a small ice crystal carried by the flow, integrated with RK4; walls at ±1 stop it.
  function advect(xStart, x0, dTw, t, dt = 0.01) {
    let x = xStart; const n = Math.round(t / dt);
    for (let i = 0; i < n; i++) {
      const k1 = flowU(x, x0, dTw), k2 = flowU(x + dt * k1 / 2, x0, dTw), k3 = flowU(x + dt * k2 / 2, x0, dTw), k4 = flowU(x + dt * k3, x0, dTw);
      x += dt * (k1 + 2 * k2 + 2 * k3 + k4) / 6; x = Math.max(-0.98, Math.min(0.98, x));
    }
    return x;
  }
  const CRYSTALS = [-0.75, -0.5, -0.3, -0.12, 0.05, 0.22, 0.4, 0.62, 0.8];
  const FLOW_T = 6;

  // ---- step 5: where can the film stay below Tm? Sketch profile up the bubble from a cold base ----
  // T(z) = Tair + (Tbase − Tair)·exp(−z/λ), z = height above the base as a fraction of the bubble height.
  const BASE_T = -20, LAMBDA = 0.35;
  const profileT = (z, Tair, lam = LAMBDA) => Tair + (BASE_T - Tair) * Math.exp(-z / lam);
  function frontStop(Tair, lam = LAMBDA) {
    if (Tair <= K.Tm) return 1;                          // the whole film is below the freezing point
    const z = lam * Math.log((BASE_T - Tair) / (K.Tm - Tair));
    return Math.max(0, Math.min(1, z));
  }

  const api = { K, bubble, GROW_K, undercool, tipSpeed, branchGap, SEED_SLOTS, MAX_SEEDS, T_END, makeSeed, hexDist, armLen, arrival, armReach, coverage, GRID,
    fStall, filmTemp, heatBudget, WARM_W, stripT, gamma, flowU, advect, CRYSTALS, STRIP_BASE, FLOW_T, MU, BASE_T, LAMBDA, profileT, frontStop };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.FB_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
