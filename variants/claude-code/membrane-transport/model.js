'use strict';
// Membrane transport model (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pure functions shared by the page (window.MEM_MODEL) and node tests (module.exports).
// All parameters are illustrative unless a comment says otherwise; every scene is a simulation.
(function (root) {

/* ---------- seeded random numbers ---------- */
function mulberry32(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function gauss(u) { let a = u(); if (a < 1e-12) a = 1e-12; return Math.sqrt(-2 * Math.log(a)) * Math.cos(2 * Math.PI * u()); }

/* ---------- step 0: random walkers and a porous membrane ---------- */
// Box [0, 2] × [0, 1]; outside x < 1, inside x > 1. The membrane is a slab |x − 1| < HALF_THICK that can be
// entered only through the pores (channels at y = PORES ± PORE_HALF). A crossing is counted when a molecule
// leaves the slab on the side opposite to the one it came from, so jitter inside a pore is not counted.
const PORES = [0.2, 0.4, 0.6, 0.8], PORE_HALF = 0.02, HALF_THICK = 0.04, SIGMA = 0.04;
const inPore = y => PORES.some(c => Math.abs(y - c) <= PORE_HALF);
const poreOf = y => PORES.reduce((best, c) => (Math.abs(y - c) < Math.abs(y - best) ? c : best), PORES[0]);
function makeDiffusion(nOut, nIn, seed = 1) {
  const u = mulberry32(seed), parts = [];
  for (let i = 0; i < nOut; i++) parts.push({ x: 0.02 + u() * (0.96 - HALF_THICK), y: u(), side: 0 });
  for (let i = 0; i < nIn; i++) parts.push({ x: 1 + HALF_THICK + 0.02 + u() * (0.96 - HALF_THICK), y: u(), side: 1 });
  const sim = { parts, steps: 0, inward: 0, outward: 0, hist: [] };
  sim.count = () => { let inn = 0; for (const p of parts) inn += p.side; return { out: parts.length - inn, in: inn }; };
  sim.record = () => { const c = sim.count(); sim.hist.push({ s: sim.steps, in: c.in, out: c.out, inward: sim.inward, outward: sim.outward }); };
  const inSlab = x => Math.abs(x - 1) < HALF_THICK;
  sim.step = (k = 1) => {
    for (let n = 0; n < k; n++) {
      for (const p of parts) {
        let x = p.x + SIGMA * gauss(u), y = p.y + SIGMA * gauss(u);
        if (y < 0) y = -y; if (y > 1) y = 2 - y;
        if (x < 0) x = -x; if (x > 2) x = 4 - x;
        if (inSlab(p.x)) {
          // inside a channel: stay within its walls
          const c = poreOf(p.y); y = Math.min(c + PORE_HALF, Math.max(c - PORE_HALF, y));
        } else if (inSlab(x) || (x - 1) * (p.x - 1) < 0) {
          // entering the slab (or jumping over it): only through a pore mouth
          if (!inPore(y) || !inPore(p.y) || poreOf(y) !== poreOf(p.y)) x = p.x;
        }
        p.x = x; p.y = y;
        if (x < 1 - HALF_THICK && p.side === 1) { p.side = 0; sim.outward++; }
        else if (x > 1 + HALF_THICK && p.side === 0) { p.side = 1; sim.inward++; }
      }
      sim.steps++;
      if (sim.steps % 20 === 0) sim.record();
    }
  };
  sim.record();
  return sim;
}

/* ---------- step 1: simple diffusion vs a saturable carrier (inside kept at 0) ---------- */
const CARRIER = { Km: 5, Jmax: 10, P: 0.1 }; // mM, relative flux units, per mM
const jSimple = (Co, Ci = 0, p = CARRIER) => p.P * (Co - Ci);
const jCarrier = (Co, Ci = 0, mult = 1, p = CARRIER) => mult * p.Jmax * (Co / (p.Km + Co) - Ci / (p.Km + Ci));
const occupancy = (C, p = CARRIER) => C / (p.Km + C);

/* ---------- step 2: cell size and equilibration time ---------- */
const P2 = 1; // µm/s, illustrative permeability
const tau = (R, P = P2) => R / (3 * P);            // V/(P·A) for a sphere: A/V = 3/R
const cInside = (t, R, Co = 1, P = P2) => Co * (1 - Math.exp(-t / tau(R, P)));
const tHalf = (R, P = P2) => Math.LN2 * tau(R, P);
const t90 = (R, P = P2) => Math.LN10 * tau(R, P);

/* ---------- step 3: osmosis and cell volume (Boyle–van ’t Hoff with a non-osmotic part) ---------- */
const OSMO = { cIn0: 300, b: 0.4, burst: 1.6, k: 1, T: 10, dt: 0.01 }; // mOsm/L; b = non-osmotic fraction; k per s (illustrative)
const cInsideOsm = (v, p = OSMO) => p.cIn0 * (1 - p.b) / (v - p.b);
const vEq = (cOut, p = OSMO) => p.b + (1 - p.b) * p.cIn0 / cOut;
const burstCout = (p = OSMO) => p.cIn0 * (1 - p.b) / (p.burst - p.b); // outside level at which vEq = burst
function simVolume(cOut, p = OSMO) {
  const f = v => p.k * (cInsideOsm(v, p) - cOut) / p.cIn0;
  const ts = [0], vs = [1]; let v = 1, burstAt = null;
  const n = Math.round(p.T / p.dt);
  for (let i = 0; i < n; i++) {
    const k1 = f(v), k2 = f(v + p.dt / 2 * k1), k3 = f(v + p.dt / 2 * k2), k4 = f(v + p.dt * k3);
    v += p.dt / 6 * (k1 + 2 * k2 + 2 * k3 + k4);
    ts.push((i + 1) * p.dt); vs.push(v);
    if (v >= p.burst) { burstAt = (i + 1) * p.dt; break; }
  }
  return { ts, vs, burstAt };
}
const tonicity = cOut => (cOut < 290 ? 'hypo' : cOut > 310 ? 'hyper' : 'iso');

/* ---------- step 4: Na⁺ leak in, pump out ---------- */
const PUMP = { Co: 145, Km: 10, J: 244, k: 0.01, T: 300, dt: 0.5 }; // mM, mM, relative, per min, min, min
const leak = (Ci, l = 1, p = PUMP) => p.k * l * (p.Co - Ci);
const pumpFlux = (Ci, s = 1, p = PUMP) => p.k * s * p.J * Ci / (p.Km + Ci);
function steadyNa(s = 1, l = 1, p = PUMP) {
  if (s <= 0) return p.Co;
  const B = l * (p.Co - p.Km) - s * p.J;
  return (B + Math.sqrt(B * B + 4 * l * l * p.Co * p.Km)) / (2 * l);
}
function simNa(ci0, s = 1, l = 1, p = PUMP) {
  const f = c => leak(c, l, p) - pumpFlux(c, s, p);
  const ts = [0], cs = [ci0]; let c = ci0;
  const n = Math.round(p.T / p.dt);
  for (let i = 0; i < n; i++) {
    const k1 = f(c), k2 = f(c + p.dt / 2 * k1), k3 = f(c + p.dt / 2 * k2), k4 = f(c + p.dt * k3);
    c += p.dt / 6 * (k1 + 2 * k2 + 2 * k3 + k4); ts.push((i + 1) * p.dt); cs.push(c);
  }
  return { ts, cs };
}
const NA_PER_ATP = 3, K_PER_ATP = 2;

const API = { mulberry32, gauss, PORES, PORE_HALF, HALF_THICK, SIGMA, inPore, makeDiffusion, CARRIER, jSimple, jCarrier, occupancy, P2, tau, cInside, tHalf, t90, OSMO, cInsideOsm, vEq, burstCout, simVolume, tonicity, PUMP, leak, pumpFlux, steadyNa, simNa, NA_PER_ATP, K_PER_ATP };
if (typeof module !== 'undefined' && module.exports) module.exports = API;
if (typeof window !== 'undefined') root.MEM_MODEL = API;
})(typeof window !== 'undefined' ? window : globalThis);
