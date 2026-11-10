'use strict';
// Population ecology model (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pure functions shared by the page (window.POP_MODEL) and node tests (module.exports).
// Units: N in fish, t in years, rates per year. All scenarios are simulations, not field data.
(function (root) {

const LN2 = Math.log(2);
const DEFAULT = { N0: 20, r: 0.5, K: 1000 };
// Step 1 split of the net rate into a birth line and a death line: b(N) = B0 − 0.6·r·N/K, d(N) = D0 + 0.4·r·N/K.
const B0 = 0.6, D0 = 0.1; // B0 − D0 = r = 0.5

/* ---------- step 0: no limits ---------- */
const expo = (N0, r, t) => N0 * Math.exp(r * t);
// time for N to double (r > 0) or halve (r < 0); Infinity when r = 0
const doublingTime = r => (Math.abs(r) < 1e-12 ? Infinity : LN2 / Math.abs(r));

/* ---------- steps 1–2: crowding feedback ---------- */
const birthRate = (N, K, r = DEFAULT.r) => B0 - 0.6 * r * N / K;
const deathRate = (N, K, r = DEFAULT.r) => D0 + 0.4 * r * N / K;
const perCapita = (N, r, K) => r * (1 - N / K);
const growth = (N, r, K) => r * N * (1 - N / K);
const peakGrowth = (r, K) => ({ N: K / 2, g: r * K / 4 });

/* ---------- step 3: the S curve ---------- */
const logistic = (N0, r, K, t) => K / (1 + (K - N0) / N0 * Math.exp(-r * t));
// time for the logistic curve to reach N = p·K (null if it starts at or above that level)
function tReach(N0, r, K, p) {
  const target = p * K;
  if (N0 >= target) return null;
  return Math.log((K - N0) / N0 * p / (1 - p)) / r;
}
// time of the steepest point (N = K/2); null when N0 ≥ K/2
const tInflection = (N0, r, K) => (N0 >= K / 2 ? null : Math.log((K - N0) / N0) / r);

/* ---------- generic RK4 ---------- */
function rk4(f, y0, T, dt) {
  const n = Math.round(T / dt), ts = [0], ys = [y0.slice()];
  let y = y0.slice();
  for (let i = 0; i < n; i++) {
    const k1 = f(y), k2 = f(y.map((v, j) => v + dt / 2 * k1[j])), k3 = f(y.map((v, j) => v + dt / 2 * k2[j])), k4 = f(y.map((v, j) => v + dt * k3[j]));
    y = y.map((v, j) => Math.max(0, v + dt / 6 * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j])));
    ts.push((i + 1) * dt); ys.push(y.slice());
  }
  return { ts, ys };
}

/* ---------- step 4: constant harvest ---------- */
// equilibria of rN(1 − N/K) − H = 0
function harvestEq(r, K, H) {
  const disc = 1 - 4 * H / (r * K);
  if (disc < 0) return { exists: false, msy: r * K / 4 };
  const s = Math.sqrt(disc);
  return { exists: true, lo: K / 2 * (1 - s), hi: K / 2 * (1 + s), msy: r * K / 4 };
}
// start at N0 = K; the boat keeps taking H per year while fish remain
function simHarvest(r, K, H, N0 = K, T = 40, dt = 0.02) {
  const sim = rk4(([N]) => [N > 0 ? growth(N, r, K) - H : 0], [N0], T, dt);
  const N = sim.ys.map(y => y[0]);
  const i0 = N.findIndex(v => v <= 0);
  return { ts: sim.ts, N, collapse: i0 < 0 ? null : sim.ts[i0] };
}

/* ---------- step 5: predators ---------- */
const PP = { r: 0.5, K: 1000, b: 0.05, N0: 600, P0: 10, T: 80, dt: 0.02 };
// dN/dt = rN(1 − N/K) − aNP ; dP/dt = b·a·N·P − mP
function ppEq(a, m, p = PP) {
  const N = m / (p.b * a); // prey level at which predator births balance predator deaths
  if (N >= p.K) return { coexist: false, need: N, N: p.K, P: 0 };
  return { coexist: true, need: N, N, P: p.r * (1 - N / p.K) / a };
}
function simPP(a, m, p = PP) {
  const sim = rk4(([N, P]) => [p.r * N * (1 - N / p.K) - a * N * P, p.b * a * N * P - m * P], [p.N0, p.P0], p.T, p.dt);
  return { ts: sim.ts, N: sim.ys.map(y => y[0]), P: sim.ys.map(y => y[1]) };
}
// local maxima (strict on the left, ≥ on the right) whose height stands out from the neighbouring troughs
function peaks(ts, v) {
  const out = [];
  for (let i = 1; i < v.length - 1; i++) if (v[i] > v[i - 1] && v[i] >= v[i + 1]) out.push({ t: ts[i], v: v[i], i });
  return out;
}
// first prey peak and the first predator peak after it
function ppLag(a, m, p = PP) {
  const s = simPP(a, m, p), pn = peaks(s.ts, s.N), pp = peaks(s.ts, s.P);
  if (!pn.length) return { sim: s, prey: null, pred: null, lag: null };
  const prey = pn[0], pred = pp.find(q => q.t > prey.t) || null;
  return { sim: s, prey, pred, lag: pred ? pred.t - prey.t : null, preyPeaks: pn, predPeaks: pp };
}

const API = { LN2, DEFAULT, B0, D0, PP, expo, doublingTime, birthRate, deathRate, perCapita, growth, peakGrowth, logistic, tReach, tInflection, rk4, harvestEq, simHarvest, ppEq, simPP, peaks, ppLag };
if (typeof module !== 'undefined' && module.exports) module.exports = API;
if (typeof window !== 'undefined') root.POP_MODEL = API;
})(typeof window !== 'undefined' ? window : globalThis);
