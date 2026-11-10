'use strict';
// Water cycle (Claude Code edition) — pure model shared by the page and tests/core.cjs.
// Author: Claude Code (claude-opus-5-5), 2026-11-09.
(function (root) {

/* ---------- step 0: where Earth's water is (Trenberth et al. 2007, thousand km³) ---------- */
// Stocks rounded as published in Trenberth, Smith, Qian, Dai & Fasullo (2007), J. Hydrometeorology 8, Fig. 1.
const STOCKS = [
  { id: 'ocean', v: 1335040 },
  { id: 'ice', v: 26350 },
  { id: 'ground', v: 15300 },
  { id: 'lakes', v: 178 },   // lakes
  { id: 'soil', v: 122 },    // soil moisture
  { id: 'perma', v: 22 },    // permafrost
  { id: 'air', v: 12.7 },    // atmosphere
  { id: 'rivers', v: 2 },
  { id: 'life', v: 1 }       // biomass
];
const TOTAL = STOCKS.reduce((s, b) => s + b.v, 0);
const DROP_ML = 0.05; // one drop from a dropper ≈ 0.05 mL (20 drops per mL)
// Volume of each store if all of Earth's water were scaled into a container of `litres`.
function shares(litres) {
  return STOCKS.map(b => ({ id: b.id, frac: b.v / TOTAL, ml: b.v / TOTAL * litres * 1000 }));
}
// The zoom chain drawn on the page: each row splits what was "the rest" in the row above.
const ZOOM = [['ocean'], ['ice', 'ground'], ['lakes', 'soil', 'perma', 'air', 'rivers', 'life']];
function zoomRows() {
  let pool = TOTAL;
  return ZOOM.map(ids => {
    const parts = ids.map(id => { const b = STOCKS.find(s => s.id === id); return { id, v: b.v, frac: b.v / pool }; });
    const used = parts.reduce((s, p) => s + p.v, 0);
    const row = { pool, parts, rest: pool - used, restFrac: (pool - used) / pool };
    pool -= used;
    return row;
  });
}

/* ---------- step 1: a puddle drying (aerodynamic evaporation) ---------- */
// Saturation vapour pressure over water (Tetens), hPa, T in °C.
const es = T => 6.1078 * Math.exp(17.27 * T / (T + 237.3));
// Penman (1956) wind function, aerodynamic term only: E = 0.26 (1 + 0.54 u) (es − ea), mm/day, u in m/s at 2 m.
// Sunshine heating the water is not included; this is a teaching model for an open puddle.
function evapRate(T, rh, u) { return 0.26 * (1 + 0.54 * u) * es(T) * (1 - rh); } // mm per day
const PUDDLE_MM = 10;
function dryHours(T, rh, u, depth = PUDDLE_MM) { const r = evapRate(T, rh, u); return r > 0 ? depth / r * 24 : Infinity; }

/* ---------- step 2: lifting a parcel of air until it clouds ---------- */
const EPS = 0.622, LV = 2.501e6, RD = 287, CP = 1005, G = 9.81, GAMMA_D = G / CP; // K per m
const pAt = z => 1013.25 * Math.exp(-z / 8400);          // hPa, fixed 8.4 km scale height
const wsat = (T, p) => { const e = es(T); return EPS * e / (p - e); }; // kg water vapour per kg dry air
// Parcel path from the ground (T0 °C, relative humidity rh) up to zTop metres, every dz metres.
function parcel(T0, rh, zTop = 4000, dz = 10) {
  const w0 = EPS * rh * es(T0) / (1013.25 - rh * es(T0));
  const out = []; let T = T0, base = null;
  for (let z = 0; z <= zTop + 1e-9; z += dz) {
    const p = pAt(z), ws = wsat(T, p), sat = ws <= w0;
    if (sat && base === null) base = z;
    out.push({ z, T, p, ws: ws * 1000, vap: Math.min(w0, ws) * 1000, cloud: Math.max(0, w0 - ws) * 1000 });
    if (!sat) T -= GAMMA_D * dz;
    else { // saturated (pseudo-)adiabatic lapse rate
      const Tk = T + 273.15;
      const gm = G * (1 + LV * ws / (RD * Tk)) / (CP + LV * LV * ws * EPS / (RD * Tk * Tk));
      T -= gm * dz;
    }
  }
  return { w0: w0 * 1000, base, pts: out };
}
// Dew point (°C) from temperature and relative humidity (inverse Tetens).
function dewPoint(T, rh) { const g = Math.log(rh * es(T) / 6.1078); return 237.3 * g / (17.27 - g); }

/* ---------- step 3: why cloud droplets float and raindrops fall ---------- */
// Terminal fall speed in still air near the ground (m/s), radius r in mm.
// Rogers & Yau (1989) three-regime approximations, joined where neighbouring laws cross so the curve is continuous:
// v = k1 r² (Stokes), v = k3 r, v = k2 √r with k1 = 1.19e6 /(cm·s), k3 = 8e3 /s, k2 = 2.2e3 cm^½/s.
const K1 = 1.19e6, K3 = 8e3, K2 = 2.2e3;
const R12 = K3 / K1, R23 = Math.pow(K2 / K3, 2); // cm
function fallSpeed(rmm) {
  const r = rmm / 10; // cm
  const v = r < R12 ? K1 * r * r : r < R23 ? K3 * r : K2 * Math.sqrt(r); // cm/s
  return v / 100;
}
const CLOUD_R = 0.01; // a typical cloud droplet: 10 µm radius
const dropletsPerDrop = rmm => Math.pow(rmm / CLOUD_R, 3);

/* ---------- step 4: rain on the ground ---------- */
// Teaching values: infiltration capacity f (mm/h) and how much the topsoil can hold before water seeps down (mm).
const SURFACES = {
  forest: { f: 40, soil: 25 },
  grass: { f: 15, soil: 15 },
  farm: { f: 8, soil: 12 },
  city: { f: 2, soil: 2 }
};
const STORM_H = 2, KQ = 0.6, KG = 0.02, HOURS = 48, DT = 0.025, FLOW_STEP = 0.25; // flow[] is sampled every FLOW_STEP hours
// Rain falls at `rain` mm/h for STORM_H hours. What cannot soak in runs off through a fast store (rate KQ /h);
// what soaks in first fills the topsoil (stays there, later returns to the air), the rest recharges groundwater,
// which drains to the river slowly (rate KG /h). Output: river flow in mm/h over the catchment, hour by hour.
function storm(surface, rain) {
  const s = SURFACES[surface];
  let Q = 0, Gw = 0, soil = 0, runoff = 0, toRiver = 0, peak = 0, peakT = 0;
  const flow = [];
  const steps = Math.round(HOURS / DT);
  for (let i = 0; i <= steps; i++) {
    const t = i * DT;
    const q = KQ * Q + KG * Gw;
    if (i % Math.round(FLOW_STEP / DT) === 0) flow.push(q);
    if (q > peak + 1e-12) { peak = q; peakT = t; }
    if (i === steps) break;
    const r = t < STORM_H - 1e-9 ? rain : 0;
    const inf = Math.min(r, s.f), over = r - inf;
    const toSoil = Math.min(inf, Math.max(0, (s.soil - soil) / DT)), toGw = inf - toSoil;
    // exact exponential drain over one step keeps the budget closed
    const dq = Q * (1 - Math.exp(-KQ * DT)), dg = Gw * (1 - Math.exp(-KG * DT));
    Q += over * DT - dq; Gw += toGw * DT - dg; soil += toSoil * DT; runoff += over * DT; toRiver += dq + dg;
  }
  const total = rain * STORM_H;
  return { total, runoff, soaked: total - runoff, soil, ground: total - runoff - soil, toRiver, stillGround: Gw, stillQuick: Q, peak, peakT, flow };
}

/* ---------- step 5: one drop's journey between five stores ---------- */
// Flows in thousand km³ per year. Ocean/air/land numbers are Trenberth et al. (2007): ocean evaporation 413,
// rain on ocean 373, rain and snow on land 113, evaporation and transpiration from land 73, runoff 40.
// Our own rounded assumptions (labelled on the page): 2.5 of the land snowfall feeds the ice sheets and the
// same amount returns as melt and icebergs; groundwater recharge ≈ 13, returning to rivers at the same rate.
const BOXES = ['ocean', 'air', 'land', 'ground', 'ice'];
const BOX_STOCK = { ocean: 1335040, air: 12.7, land: 178 + 122 + 2 + 22 + 1, ground: 15300, ice: 26350 };
const FLOWS = [
  ['ocean', 'air', 413], ['air', 'ocean', 373], ['air', 'land', 110.5], ['air', 'ice', 2.5],
  ['land', 'air', 73], ['land', 'ground', 13], ['ground', 'land', 13], ['land', 'ocean', 37.5], ['ice', 'ocean', 2.5]
];
const outFlow = b => FLOWS.filter(f => f[0] === b).reduce((s, f) => s + f[2], 0);
const inFlow = b => FLOWS.filter(f => f[1] === b).reduce((s, f) => s + f[2], 0);
const residenceYears = b => BOX_STOCK[b] / outFlow(b); // how long, on average, a drop stays: stock ÷ outflow
function mulberry32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
// A drop leaves box b after an exponential wait (mean = residence time) and picks an exit in proportion to its flow.
function journey(seed, hops, start = 'ocean') {
  const rnd = mulberry32(seed); const legs = []; let b = start;
  for (let i = 0; i < hops; i++) {
    const outs = FLOWS.filter(f => f[0] === b), tot = outFlow(b);
    const stay = -Math.log(1 - rnd()) * residenceYears(b);
    let pick = rnd() * tot, next = outs[outs.length - 1][1];
    for (const f of outs) { if (pick < f[2]) { next = f[1]; break; } pick -= f[2]; }
    legs.push({ box: b, years: stay, next });
    b = next;
  }
  return legs;
}
// Long-run share of time a drop spends in each box (exact: solves the balance of the Markov chain).
function timeShares() { const tot = BOXES.reduce((s, b) => s + BOX_STOCK[b], 0); const o = {}; BOXES.forEach(b => { o[b] = BOX_STOCK[b] / tot; }); return o; }
// Monte Carlo estimate of the same thing from many simulated drops (used by the page's "1000 drops" readout).
function simulateShares(seed, drops, hops) {
  const time = {}; BOXES.forEach(b => { time[b] = 0; });
  let tot = 0;
  for (let d = 0; d < drops; d++) journey(seed + d, hops).forEach(l => { time[l.box] += l.years; tot += l.years; });
  BOXES.forEach(b => { time[b] /= tot; });
  return time;
}

const API = { STOCKS, TOTAL, DROP_ML, shares, zoomRows, ZOOM, es, evapRate, dryHours, PUDDLE_MM, pAt, wsat, parcel, dewPoint,
  fallSpeed, dropletsPerDrop, CLOUD_R, R12, R23, SURFACES, storm, STORM_H, FLOW_STEP, KQ, KG, HOURS,
  BOXES, BOX_STOCK, FLOWS, outFlow, inFlow, residenceYears, journey, timeShares, simulateShares, mulberry32 };
if (typeof module !== 'undefined' && module.exports) module.exports = API;
if (typeof window !== 'undefined') root.WATER_MODEL = API;
})(typeof window !== 'undefined' ? window : globalThis);
