'use strict';
// Density lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every number on the page is computed here; tests/core.cjs pins the claims.
// Units: g, cm, cm³, g/cm³ unless stated; room air in m³, kg, kg/m³. Densities are typical room-temperature values.
(function (root) {
  const RHO = { pine: 0.5, ice: 0.92, al: 2.7, iron: 7.9, copper: 8.9, lead: 11.3, gold: 19.3, silver: 10.5 };

  // ---- step 0: the same mass, different volumes ----
  const EQUAL = ['pine', 'ice', 'al', 'iron'];
  const equalMass = m => EQUAL.map(k => { const V = m / RHO[k]; return { key: k, V, side: Math.cbrt(V) }; });

  // ---- step 1: cut pieces, weigh them (scale reads to 0.1 g), measure the sides (cm) ----
  const PIECES = [[2, 2, 2], [3, 2, 2], [4, 3, 2], [5, 4, 2], [5, 5, 3], [6, 5, 4]];
  const CUT = ['al', 'iron', 'pine'];
  function piece(k, i) {
    const [a, b, c] = PIECES[i], V = a * b * c, m = Math.round(RHO[k] * V * 10) / 10;
    return { key: k, i, dims: [a, b, c], V, m, ratio: m / V };
  }
  // least-squares slope through the origin for the recorded points of one material
  const slope = pts => pts.reduce((s, p) => s + p.V * p.m, 0) / pts.reduce((s, p) => s + p.V * p.V, 0);

  // ---- step 2: the air in a room ----
  const AIR = 1.2;          // kg/m³ at about 20 °C, sea level
  const STUDENT = 50;       // kg
  function room(L, Wd, H) { const V = L * Wd * H, m = AIR * V; return { V, m, students: m / STUDENT, gcm3: AIR / 1000 }; }

  // ---- step 3: displacement with a 1 mL measuring cylinder ----
  const START = 50;         // mL of water before the object goes in
  const READ = 0.5;         // each reading can be off by half a division
  const OBJECTS = { A: { key: 'al', V: 20 }, B: { key: 'iron', V: 5 }, C: { key: 'lead', V: 8 }, D: { key: 'copper', V: 10 } };
  for (const o of Object.values(OBJECTS)) o.m = Math.round(RHO[o.key] * o.V * 10) / 10;
  const REF = ['al', 'iron', 'copper', 'lead'];
  function measure(id) {
    const o = OBJECTS[id], dV = o.V, rho = o.m / dV;
    const lo = o.m / (dV + 2 * READ), hi = o.m / (dV - 2 * READ);   // both readings off in the worst direction
    const fits = REF.filter(k => RHO[k] >= lo - 1e-12 && RHO[k] <= hi + 1e-12);
    return { m: o.m, before: START, after: START + dV, dV, rho, lo, hi, fits };
  }

  // ---- step 4: a 1000 g crown, part silver ----
  const CROWN = 1000;
  function crown(fs) { // fs = silver fraction by mass
    const mg = CROWN * (1 - fs), msv = CROWN * fs, V = mg / RHO.gold + msv / RHO.silver;
    return { V, rho: CROWN / V, naive: (1 - fs) * RHO.gold + fs * RHO.silver, pureV: CROWN / RHO.gold, extra: V - CROWN / RHO.gold };
  }

  // ---- step 5: a density tower (top to bottom), each layer 4 cm thick; a 2 cm cube settles in it ----
  const LAYERS = [{ key: 'oil', rho: 0.92 }, { key: 'water', rho: 1.0 }, { key: 'soap', rho: 1.06 }, { key: 'honey', rho: 1.42 }];
  const LAYER_H = 4, CUBE = 2, TOWER = LAYERS.length * LAYER_H;
  // Returns the height of the cube's bottom above the floor (cm) and where it rests.
  function settle(r) {
    // find the first layer from the top that is denser than the cube
    let i = LAYERS.findIndex(L => L.rho > r);
    if (i === -1) return { bottom: 0, where: 'floor', below: null, above: LAYERS[LAYERS.length - 1].key, frac: 1 };
    const lower = LAYERS[i], upper = i === 0 ? null : LAYERS[i - 1];
    const rUp = upper ? upper.rho : 0;            // air above the top layer (≈ 0)
    const f = (r - rUp) / (lower.rho - rUp);       // fraction of the cube inside the lower layer
    const iface = TOWER - i * LAYER_H;              // height of the top of layer i
    return { bottom: iface - f * CUBE, where: upper ? 'interface' : 'surface', below: lower.key, above: upper ? upper.key : null, frac: f };
  }

  const api = { RHO, EQUAL, equalMass, PIECES, CUT, piece, slope, AIR, STUDENT, room, START, READ, OBJECTS, REF, measure, CROWN, crown, LAYERS, LAYER_H, CUBE, TOWER, settle };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DENS_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
