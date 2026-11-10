'use strict';
// Carbon cycle (Claude Code edition) — pure model shared by the page and tests/core.cjs.
// Author: Claude Code (claude-opus-5-5), 2026-11-09.
(function (root) {

/* ---------- the ledger: five reservoirs before industrialisation (GtC) and gross yearly flows (GtC/yr) ---------- */
// Rounded values in the style of the IPCC AR6 WG1 Figure 5.12 carbon-cycle diagram; the split of plant respiration
// (53 back to the air, 60 to the soil as litter) and the 100/100 surface–deep exchange are this page's round choices.
const STOCK0 = { air: 590, plants: 450, soil: 1700, surf: 900, deep: 37100 };
const BOXES = ['air', 'plants', 'soil', 'surf', 'deep'];
const GROSS = [
  ['air', 'plants', 113],  // photosynthesis
  ['plants', 'air', 53],   // plant respiration
  ['plants', 'soil', 60],  // litter fall
  ['soil', 'air', 60],     // soil respiration (microbes)
  ['air', 'surf', 60],     // CO₂ dissolving into the surface ocean
  ['surf', 'air', 60],     // CO₂ leaving the surface ocean
  ['surf', 'deep', 100],   // sinking water and particles
  ['deep', 'surf', 100]    // upwelling
];
const GTC_PER_PPM = 2.124;
const ppm = gtc => gtc / GTC_PER_PPM;
const grossOut = b => GROSS.filter(f => f[0] === b).reduce((s, f) => s + f[2], 0);
const grossIn = b => GROSS.filter(f => f[1] === b).reduce((s, f) => s + f[2], 0);
const turnover = b => STOCK0[b] / grossOut(b); // years an average carbon atom stays

/* ---------- the dynamic model ---------- */
// Excess carbon is not passed on in proportion to stocks:
//  • photosynthesis grows with CO₂ as 113 (1 + β ln(air/air₀))  (CO₂ fertilisation, β default 0.3);
//  • the surface ocean's CO₂ pressure rises ξ times faster than its carbon content (Revelle buffer factor ξ ≈ 10).
// Everything else is first order: out-flow = gross₀ × stock / stock₀.
const DEFAULTS = { beta: 0.3, xi: 10 };
function rates(S, p, emit) {
  const r = S.air / STOCK0.air;
  const gpp = 113 * (1 + p.beta * Math.log(r));
  const pRes = 53 * S.plants / STOCK0.plants, litter = 60 * S.plants / STOCK0.plants, sRes = 60 * S.soil / STOCK0.soil;
  const inSea = 60 * r, outSea = 60 * (1 + p.xi * (S.surf - STOCK0.surf) / STOCK0.surf);
  const down = 100 * S.surf / STOCK0.surf, up = 100 * S.deep / STOCK0.deep;
  return {
    air: emit - gpp + pRes + sRes - inSea + outSea,
    plants: gpp - pRes - litter, soil: litter - sRes,
    surf: inSea - outSea - down + up, deep: down - up,
    land: gpp - pRes - sRes, ocean: inSea - outSea
  };
}
// Integrate with 4th-order Runge–Kutta, dt in years. emission(t) gives GtC/yr. Records every `every` years.
function run(emission, years, opt = {}) {
  const p = { ...DEFAULTS, ...opt }, dt = opt.dt || 0.25, every = opt.every || 1;
  let S = { ...STOCK0, ...(opt.start || {}) }; const out = [];
  let cum = 0, landCum = 0, oceanCum = 0;
  const add = (A, k, h) => { const o = {}; BOXES.forEach(b => { o[b] = A[b] + k[b] * h; }); return o; };
  const record = t => out.push({ t, ...S, ppm: ppm(S.air), cum, landCum, oceanCum, emit: emission(t) });
  record(0);
  const n = Math.round(years / dt), rec = Math.round(every / dt);
  for (let i = 0; i < n; i++) {
    const t = i * dt;
    const k1 = rates(S, p, emission(t)), k2 = rates(add(S, k1, dt / 2), p, emission(t + dt / 2)), k3 = rates(add(S, k2, dt / 2), p, emission(t + dt / 2)), k4 = rates(add(S, k3, dt), p, emission(t + dt));
    const step = {}; BOXES.forEach(b => { step[b] = (k1[b] + 2 * k2[b] + 2 * k3[b] + k4[b]) / 6 * dt; });
    cum += (emission(t) + 4 * emission(t + dt / 2) + emission(t + dt)) / 6 * dt;
    landCum += step.plants + step.soil; oceanCum += step.surf + step.deep;
    BOXES.forEach(b => { S[b] += step[b]; });
    if ((i + 1) % rec === 0) record((i + 1) * dt);
  }
  return out;
}
const excess = rec => rec.air - STOCK0.air;

/* ---------- step 1: one molecule vs. the extra carbon ---------- */
// A pulse of P GtC is added to the air of the pre-industrial system.
//  • excess: how much more carbon the air holds than before (uses the buffered, fertilised model above);
//  • tagged: how many of the very same atoms are still in the air. Tagged atoms ride the gross flows, which carry
//    them out at their full size whatever the buffer factor, so they leave far faster than the excess.
function pulse(P, years = 200, opt = {}) {
  const ex = run(() => 0, years, { ...opt, start: { air: STOCK0.air + P }, every: opt.every || 1 });
  // tagged atoms: linear exchange at the pre-industrial gross rates
  const T = { air: P, plants: 0, soil: 0, surf: 0, deep: 0 }, dt = 0.05, tag = [{ t: 0, air: P }];
  const k = {}; GROSS.forEach(([a, b, f]) => { k[a + '>' + b] = f / STOCK0[a]; });
  const n = Math.round(years / dt), rec = Math.round((opt.every || 1) / dt);
  for (let i = 0; i < n; i++) {
    const d = { air: 0, plants: 0, soil: 0, surf: 0, deep: 0 };
    GROSS.forEach(([a, b]) => { const f = k[a + '>' + b] * T[a]; d[a] -= f; d[b] += f; });
    BOXES.forEach(b => { T[b] += d[b] * dt; });
    if ((i + 1) % rec === 0) tag.push({ t: (i + 1) * dt, air: T.air });
  }
  return ex.map((r, i) => ({ t: r.t, excess: excess(r) / P, tagged: tag[i].air / P }));
}

/* ---------- step 2/3/4/5 scenarios ---------- */
const growing = (E0, g) => t => E0 * Math.exp(g * t);
const stopAt = (E, T) => t => (t < T ? E : 0);
// Airborne fraction after `years` of constant emission E: extra carbon in the air ÷ carbon emitted.
function airborne(E, years, opt = {}) { const r = run(() => E, years, { ...opt, every: years }); const last = r[r.length - 1]; return excess(last) / last.cum; }
// Hold the air at `target` ppm: emit E until it gets there, then emit exactly what the sinks take up.
function stabilise(target, E = 10, years = 300, opt = {}) {
  const p = { ...DEFAULTS, ...opt }, dt = 0.05, goal = target * GTC_PER_PPM;
  let S = { ...STOCK0 }, held = null, e0 = null; const out = [];
  for (let i = 0; i <= Math.round(years / dt); i++) {
    const t = i * dt;
    if (held === null && S.air >= goal) held = t;
    const sink = rates(S, p, 0); // with zero emission, rates().air = −(net uptake by land and ocean)
    const e = held === null ? E : Math.max(0, -sink.air);
    if (held !== null && e0 === null) e0 = e; // allowed emission at the moment the target is reached
    if (i % Math.round(1 / dt) === 0) out.push({ t, emit: e, ppm: ppm(S.air) });
    const k = rates(S, p, e); BOXES.forEach(b => { S[b] += k[b] * dt; });
  }
  return { held, e0, out };
}

const API = { STOCK0, BOXES, GROSS, GTC_PER_PPM, ppm, grossOut, grossIn, turnover, DEFAULTS, rates, run, excess, pulse, growing, stopAt, airborne, stabilise };
if (typeof module !== 'undefined' && module.exports) module.exports = API;
if (typeof window !== 'undefined') root.CARBON_MODEL = API;
})(typeof window !== 'undefined' ? window : globalThis);
