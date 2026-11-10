'use strict';
// Particles & states model (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// A real (if simplified) 2-D particle simulation shared by the page and tests/core.cjs:
// 96 equal discs, pairwise Morse attraction/repulsion, weak gravity, hard walls, and a "heater"
// (Berendsen thermostat) that nudges the mean kinetic energy towards its setting. States are not
// scripted: solid / liquid / gas are read off the simulated positions by classify().
// Units are reduced (particle size 1, bond energy 1, mass 1). The page's "temperature (schematic)"
// is 100 × mean kinetic energy per particle; it is a schematic scale, not °C.
(function (root) {

const P = { N: 96, BW: 16, BH: 22, alpha: 3.5, rc: 2.6, g: 0.04, dt: 0.004, tau: 0.3, link: 1.45, clusterLink: 1.5 };
const SCALE = 100;                 // displayed temperature = SCALE × mean kinetic energy per particle
const EC = Math.exp(-P.alpha * (P.rc - 1)), VC = (1 - EC) * (1 - EC) - 1;

function rng(seed) { let s = seed | 0; return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function gauss(R) { let u = 0; while (u === 0) u = R(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * R()); }

function createSim(opt = {}) {
  const N = P.N, R = rng(opt.seed || 1);
  const s = {
    N, R, t: 0, heater: opt.heater == null ? 0.1 : opt.heater, lid: opt.lid !== false, power: 0,
    x: new Float64Array(N), y: new Float64Array(N), vx: new Float64Array(N), vy: new Float64Array(N), fx: new Float64Array(N), fy: new Float64Array(N),
    alive: new Uint8Array(N).fill(1), sx: new Float64Array(N), sy: new Float64Array(N),
    pe: 0, escaped: 0, inCluster: new Uint8Array(N), keEma: 0, psiEma: 0, cluEma: 1, sub: 0, measured: null, energyIn: 0
  };
  // hexagonal crystal, 12 per row, 8 rows, resting on the floor
  let k = 0;
  for (let r = 0; r < 8; r++) for (let c = 0; c < 12; c++) { s.x[k] = 2.0 + c * 0.99 + (r % 2 ? 0.495 : 0); s.y[k] = 0.55 + r * 0.857; k++; }
  const T0 = s.heater;
  for (let i = 0; i < N; i++) { s.vx[i] = gauss(R) * Math.sqrt(T0); s.vy[i] = gauss(R) * Math.sqrt(T0); s.sx[i] = s.x[i]; s.sy[i] = s.y[i]; }
  forces(s); s.keEma = kineticPer(s); measure(s, true);
  return s;
}
function forces(s) {
  const { N, x, y, fx, fy, alive } = s, a = P.alpha, rc2 = P.rc * P.rc;
  let pe = 0;
  for (let i = 0; i < N; i++) { fx[i] = 0; fy[i] = alive[i] ? -P.g : 0; }
  for (let i = 0; i < N; i++) {
    if (!alive[i]) continue;
    const xi = x[i], yi = y[i];
    for (let j = i + 1; j < N; j++) {
      if (!alive[j]) continue;
      const dx = xi - x[j], dy = yi - y[j], r2 = dx * dx + dy * dy;
      if (r2 > rc2) continue;
      const r = Math.sqrt(r2), e = Math.exp(-a * (r - 1));
      pe += (1 - e) * (1 - e) - 1 - VC;
      const F = -2 * a * e * (1 - e) / r;           // −dV/dr ÷ r
      fx[i] += F * dx; fy[i] += F * dy; fx[j] -= F * dx; fy[j] -= F * dy;
    }
  }
  s.pe = pe;
}
function kineticSum(s) { let k = 0; for (let i = 0; i < s.N; i++) if (s.alive[i]) k += (s.vx[i] * s.vx[i] + s.vy[i] * s.vy[i]) / 2; return k; }
function aliveCount(s) { let n = 0; for (let i = 0; i < s.N; i++) n += s.alive[i]; return n; }
function kineticPer(s) { const n = aliveCount(s); return n ? kineticSum(s) / n : 0; }

// One velocity-Verlet step + walls + heater.
function step(s) {
  const { N, x, y, vx, vy, fx, fy, alive } = s, dt = P.dt, lo = 0.5, hiX = P.BW - 0.5, hiY = P.BH - 0.5;
  for (let i = 0; i < N; i++) {
    if (!alive[i]) continue;
    vx[i] += fx[i] * dt / 2; vy[i] += fy[i] * dt / 2; x[i] += vx[i] * dt; y[i] += vy[i] * dt;
    if (x[i] < lo) { x[i] = 2 * lo - x[i]; vx[i] = -vx[i]; } else if (x[i] > hiX) { x[i] = 2 * hiX - x[i]; vx[i] = -vx[i]; }
    if (y[i] < lo) { y[i] = 2 * lo - y[i]; vy[i] = -vy[i]; }
    else if (y[i] > hiY) {
      if (s.lid) { y[i] = 2 * hiY - y[i]; vy[i] = -vy[i]; }
      else { alive[i] = 0; s.escaped++; vx[i] = vy[i] = 0; }   // left through the open top: gone into the room
    }
  }
  forces(s);
  for (let i = 0; i < N; i++) if (alive[i]) { vx[i] += fx[i] * dt / 2; vy[i] += fy[i] * dt / 2; }
  // heater: Berendsen rescaling of all speeds towards the set mean kinetic energy
  const K = kineticPer(s);
  if (K > 1e-9) {
    const lam = Math.sqrt(Math.max(0.6, Math.min(1.6, 1 + dt / P.tau * (s.heater / K - 1))));
    const n = aliveCount(s); s.energyIn += (lam * lam - 1) * K * n;
    for (let i = 0; i < N; i++) if (alive[i]) { vx[i] *= lam; vy[i] *= lam; }
  }
  // slow-moving "seat" of each particle (average position over ~2 time units)
  const w = dt / 2;
  for (let i = 0; i < N; i++) if (alive[i]) { s.sx[i] += (x[i] - s.sx[i]) * w; s.sy[i] += (y[i] - s.sy[i]) * w; }
  s.t += dt; s.sub++;
  s.keEma += (kineticPer(s) - s.keEma) * (dt / 0.5);
  if (s.sub % 10 === 0) measure(s, false);
}
function run(s, n) { for (let i = 0; i < n; i++) step(s); return s; }

// ---- measurements (all computed from positions / velocities) ----
function clusterOf(s) {
  const { N, x, y, alive } = s, p = new Int32Array(N); for (let i = 0; i < N; i++) p[i] = i;
  const f = i => { while (p[i] !== i) { p[i] = p[p[i]]; i = p[i]; } return i; };
  const L2 = P.clusterLink * P.clusterLink;
  for (let i = 0; i < N; i++) if (alive[i]) for (let j = i + 1; j < N; j++) if (alive[j]) { const dx = x[i] - x[j], dy = y[i] - y[j]; if (dx * dx + dy * dy < L2) p[f(i)] = f(j); }
  const count = {}; for (let i = 0; i < N; i++) if (alive[i]) { const r = f(i); count[r] = (count[r] || 0) + 1; }
  let best = -1, size = 0; for (const r in count) if (count[r] > size) { size = count[r]; best = +r; }
  const member = new Uint8Array(N); for (let i = 0; i < N; i++) if (alive[i] && f(i) === best) member[i] = 1;
  return { member, size };
}
// Bond-orientational order ψ6: 1 for a perfect hexagonal neighbourhood, small for a disordered one.
function psi6(s, member) {
  const { N, x, y, alive } = s, L2 = P.link * P.link; let tot = 0, cnt = 0;
  for (let i = 0; i < N; i++) {
    if (!alive[i] || (member && !member[i])) continue;
    let re = 0, im = 0, n = 0;
    for (let j = 0; j < N; j++) { if (j === i || !alive[j]) continue; const dx = x[j] - x[i], dy = y[j] - y[i]; if (dx * dx + dy * dy < L2) { const a = 6 * Math.atan2(dy, dx); re += Math.cos(a); im += Math.sin(a); n++; } }
    if (n >= 2) { tot += Math.hypot(re, im) / n; cnt++; }
  }
  return cnt ? tot / cnt : 0;
}
function measure(s, first) {
  const c = clusterOf(s), n = aliveCount(s);
  // liquid level: 85th percentile height of the main clump (robust to a few bumps on the surface)
  const top = (() => { const ys = []; for (let i = 0; i < s.N; i++) if (c.member[i]) ys.push(s.y[i]); ys.sort((a, b) => a - b); return ys.length ? ys[Math.floor(0.85 * (ys.length - 1))] : 0; })();
  s.inCluster = c.member;
  const ps = psi6(s, c.member), frac = n ? c.size / s.N : 0;
  const a = first ? 1 : 0.03;   // ≈ 1.3 time-unit average
  s.psiEma += (ps - s.psiEma) * a; s.cluEma += (frac - s.cluEma) * a;
  s.state = nextState(s.state || classify(s.psiEma, s.cluEma), s.psiEma, s.cluEma);
  s.measured = { liquid: c.size, air: n - c.size, escaped: s.escaped, alive: n, top, psi: ps, clusterFrac: frac };
}
// State read off the simulation (never from the slider): gas when most particles are not in one
// connected clump; otherwise solid when the clump is orderly (ψ6 high), else liquid.
const PSI_SOLID = 0.68, GAS_CLUSTER = 0.5;
function classify(psi, clusterFrac) { return clusterFrac < GAS_CLUSTER ? 'gas' : psi >= PSI_SOLID ? 'solid' : 'liquid'; }
// With a little hysteresis so the name does not flicker while a quantity hovers at a threshold.
const HYST = 0.04;
function nextState(prev, psi, clu) {
  const raw = classify(psi, clu);
  if (prev === 'gas' && raw !== 'gas' && clu < GAS_CLUSTER + 2 * HYST) return 'gas';
  if (prev !== 'gas' && raw === 'gas' && clu > GAS_CLUSTER - 2 * HYST) return prev;
  if (prev === 'solid' && raw === 'liquid' && psi > PSI_SOLID - HYST) return 'solid';
  if (prev === 'liquid' && raw === 'solid' && psi < PSI_SOLID + HYST) return 'liquid';
  return raw;
}
const stateOf = s => s.state;
const tempReading = s => SCALE * s.keEma;        // schematic temperature from particle speeds
const tempNow = s => SCALE * kineticPer(s);
function jiggle(s) { let a = 0, n = 0; for (let i = 0; i < s.N; i++) if (s.alive[i]) { a += (s.x[i] - s.sx[i]) ** 2 + (s.y[i] - s.sy[i]) ** 2; n++; } return n ? Math.sqrt(a / n) : 0; }
function height90(s) { const ys = []; for (let i = 0; i < s.N; i++) if (s.alive[i]) ys.push(s.y[i]); ys.sort((a, b) => a - b); return ys.length ? ys[Math.floor(0.9 * (ys.length - 1))] : 0; }

// Step 5 "full cycle": heater setting (mean kinetic energy) as a function of simulated time.
const CYCLE = [[0, 0.1], [8, 0.1], [58, 2.2], [76, 2.2], [126, 0.1], [150, 0.1]];
function cycleHeater(t) {
  for (let i = 1; i < CYCLE.length; i++) { const [t0, h0] = CYCLE[i - 1], [t1, h1] = CYCLE[i]; if (t <= t1) return h0 + (h1 - h0) * (t - t0) / (t1 - t0); }
  return CYCLE[CYCLE.length - 1][1];
}
const CYCLE_END = CYCLE[CYCLE.length - 1][0];

/* ---------- step 3: heating curve of water (macroscopic, textbook constants) ---------- */
const WATER = { m: 100, T0: -20, T1: 120, cIce: 2.1, cWater: 4.18, cSteam: 2.0, Lf: 334, Lv: 2257, P: 1000 }; // g, °C, J/(g·K), J/g, W
function heatingSegments(w = WATER) {
  const segs = [];
  let E = 0;
  const add = (kind, J, Ta, Tb) => { segs.push({ kind, E0: E, E1: E + J, Ta, Tb }); E += J; };
  add('ice', w.m * w.cIce * (0 - w.T0), w.T0, 0);
  add('melt', w.m * w.Lf, 0, 0);
  add('water', w.m * w.cWater * 100, 0, 100);
  add('boil', w.m * w.Lv, 100, 100);
  add('steam', w.m * w.cSteam * (w.T1 - 100), 100, w.T1);
  return segs;
}
// state at a heating time (s): temperature, phase segment, energy into warming vs into pulling particles apart
function heatingAt(time, w = WATER) {
  const segs = heatingSegments(w), E = Math.max(0, Math.min(segs[segs.length - 1].E1, time * w.P));
  let warm = 0, apart = 0, cur = segs[segs.length - 1], T = w.T1;
  for (const sg of segs) {
    const used = Math.max(0, Math.min(E, sg.E1) - sg.E0);
    if (sg.kind === 'melt' || sg.kind === 'boil') apart += used; else warm += used;
    if (E >= sg.E0 && E <= sg.E1) { cur = sg; T = sg.Ta + (sg.Tb - sg.Ta) * (sg.E1 > sg.E0 ? (E - sg.E0) / (sg.E1 - sg.E0) : 0); break; }
  }
  return { E, T, kind: cur.kind, warm, apart, total: segs[segs.length - 1].E1 };
}

const api = { CYCLE, cycleHeater, CYCLE_END, P, SCALE, rng, createSim, step, run, forces, kineticPer, aliveCount, clusterOf, psi6, measure, classify, nextState, HYST, stateOf, tempReading, tempNow, jiggle, height90, PSI_SOLID, GAS_CLUSTER, WATER, heatingSegments, heatingAt };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
if (typeof window !== 'undefined') root.PS_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
