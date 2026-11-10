'use strict';
// Atmospheric circulation (Claude Code edition) — pure model shared by the page and tests/core.cjs.
// Author: Claude Code (claude-opus-5-5), 2026-11-09.
(function (root) {

const OMEGA = 7.292e-5, R_EARTH = 6.371e6, G = 9.81, RD = 287, DEG = Math.PI / 180;
const P2 = x => 0.5 * (3 * x * x - 1);

/* ---------- step 0: a diffusive energy-balance model (one hemisphere, x = sin latitude) ---------- */
// −D d/dx[(1 − x²) dT/dx] + A + B T = Q S(x) a(x).  T in °C, fluxes in W/m².
// A, B, Q and the insolation shape S(x) = 1 − 0.482 P2(x) are the textbook values of North-type models;
// the co-albedo a(x) = 0.68 − 0.20 P2(x) (no ice switch) is this page's choice.
const EBM = { A: 203.3, B: 2.09, Q: 334.4, s2: -0.482, a0: 0.68, a2: -0.20, N: 180 };
const insol = x => EBM.Q * (1 + EBM.s2 * P2(x));            // annual-mean sunlight reaching the top, W/m²
const absorbed = x => insol(x) * (EBM.a0 + EBM.a2 * P2(x)); // what the surface–atmosphere system keeps
function ebm(D) {
  const N = EBM.N, dx = 1 / N, xs = [], a = [], b = [], c = [], d = [];
  for (let i = 0; i < N; i++) {
    const x = (i + 0.5) * dx, xl = i * dx, xr = (i + 1) * dx;
    const kl = i === 0 ? 0 : D * (1 - xl * xl) / (dx * dx), kr = i === N - 1 ? 0 : D * (1 - xr * xr) / (dx * dx);
    xs.push(x); a.push(-kl); b.push(EBM.B + kl + kr); c.push(-kr); d.push(absorbed(x) - EBM.A);
  }
  // Thomas algorithm
  for (let i = 1; i < N; i++) { const m = a[i] / b[i - 1]; b[i] -= m * c[i - 1]; d[i] -= m * d[i - 1]; }
  const T = new Array(N); T[N - 1] = d[N - 1] / b[N - 1];
  for (let i = N - 2; i >= 0; i--) T[i] = (d[i] - c[i] * T[i + 1]) / b[i];
  // Poleward transport through the face at x (W): F = −2π R² D (1 − x²) dT/dx
  const F = [0];
  for (let i = 0; i < N - 1; i++) { const xf = (i + 1) * dx; F.push(-2 * Math.PI * R_EARTH * R_EARTH * D * (1 - xf * xf) * (T[i + 1] - T[i]) / dx); }
  F.push(0);
  const at = phiDeg => { const x = Math.sin(phiDeg * DEG), k = Math.min(N - 1, Math.max(0, x / dx - 0.5)), i = Math.floor(k), f = k - i; return i >= N - 1 ? T[N - 1] : T[i] * (1 - f) + T[i + 1] * f; };
  let peak = 0, peakLat = 0; F.forEach((v, i) => { if (v > peak) { peak = v; peakLat = Math.asin(i * dx) / DEG; } });
  const mean = T.reduce((s, v) => s + v, 0) / N; // area-weighted: cells are equal in x = sin φ, i.e. equal area
  // latitude where absorbed sunshine equals outgoing heat: surplus equatorward of it, deficit poleward
  let cross = null; for (let i = 0; i < N - 1; i++) { const g0 = absorbed(xs[i]) - (EBM.A + EBM.B * T[i]), g1 = absorbed(xs[i + 1]) - (EBM.A + EBM.B * T[i + 1]); if (g0 > 0 && g1 <= 0) { const xc = xs[i] + (xs[i + 1] - xs[i]) * g0 / (g0 - g1); cross = Math.asin(xc) / DEG; } }
  return { xs, T, F, at, eq: at(0), pole: at(90), mean, peakPW: peak / 1e15, peakLat, cross };
}

/* ---------- step 1: warm and cold columns (hypsometric equation) ---------- */
// Both columns start with 1000 hPa at the ground. Pressure at height z in a column of mean temperature Tk:
const pAt = (z, Tk, p0 = 1000) => p0 * Math.exp(-G * z / (RD * Tk));
const zOf = (p, Tk, p0 = 1000) => RD * Tk / G * Math.log(p0 / p);
// Tmean is the average over the whole column (the upper air is cold, so it sits well below freezing).
function columns(dT, Tmean = 260) {
  const Tland = Tmean + dT / 2, Tsea = Tmean - dT / 2;
  return { Tland, Tsea, z500land: zOf(500, Tland), z500sea: zOf(500, Tsea), dp5km: pAt(5000, Tland) - pAt(5000, Tsea) };
}

/* ---------- step 2: a ring of air keeps its angular momentum ---------- */
// Air starting at rest on the equator and moving to latitude φ keeps M = (ΩR cosφ + u) R cosφ = Ω R².
const uAM = phiDeg => { const c = Math.cos(phiDeg * DEG); return OMEGA * R_EARTH * (1 - c * c) / c; }; // m/s, eastward
const groundSpeed = phiDeg => OMEGA * R_EARTH * Math.cos(phiDeg * DEG);  // the ground's own eastward speed
const coriolisF = phiDeg => 2 * OMEGA * Math.sin(phiDeg * DEG);         // 1/s
const uAMat = (phiDeg, Om) => { const c = Math.cos(phiDeg * DEG); return Om * R_EARTH * (1 - c * c) / c; }; // same, any spin rate

/* ---------- step 3: how far does the Hadley cell reach? (Held & Hou 1980) ---------- */
// φH ≈ sqrt( 5/3 · g H ΔH / (Ω² a²) ) radians, small-angle estimate; ΔH = (equator − pole temperature) / θ0.
const HH = { H: 10000, theta0: 300 };
function hadleyEdge(dayHours, dT) {
  const Om = OMEGA * 24 / dayHours, dH = dT / HH.theta0;
  const rad = Math.sqrt(5 / 3 * G * HH.H * dH / (Om * Om * R_EARTH * R_EARTH));
  return { deg: rad / DEG, valid: rad / DEG <= 45, omega: Om };
}

/* ---------- step 4: idealised three-cell surface winds ---------- */
// Surface wind components (arbitrary units, east and north positive) for an Earth-like 30°/60° cell layout.
function surfaceWind(phiDeg) {
  const s = Math.sin(6 * Math.abs(phiDeg) * DEG);
  return { u: -s, v: -Math.sin(6 * phiDeg * DEG) };
}
// Band and vertical motion at the surface-side of the cells.
function band(phiDeg) {
  const a = Math.abs(phiDeg);
  const belt = a < 30 ? 'trade' : a < 60 ? 'westerly' : 'polar';
  const cell = a < 30 ? 'hadley' : a < 60 ? 'ferrel' : 'polarCell';
  const near = (v, w) => Math.abs(a - v) <= w;
  const motion = near(0, 5) || near(60, 5) ? 'rise' : near(30, 5) || near(90, 5) ? 'sink' : 'flat';
  return { belt, cell, motion };
}
// 8-point compass name of where the wind blows FROM (0 = from north, clockwise).
const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
function fromDir(u, v) { const toward = Math.atan2(u, v), from = (toward + Math.PI) % (2 * Math.PI); const k = Math.round(((from + 2 * Math.PI) % (2 * Math.PI)) / (Math.PI / 4)) % 8; return COMPASS[k]; }

/* ---------- step 5: land and sea warming through the year at 20° N ---------- */
const S0 = 1361, OBLIQ = 23.44;
function declination(day) { return OBLIQ * Math.sin(2 * Math.PI * (day - 80) / 365) ; } // degrees; day 80 ≈ 21 March
// Daily-mean sunlight at the top of the atmosphere (W/m²), circular orbit.
function dailyInsolation(phiDeg, day) {
  const ph = phiDeg * DEG, de = declination(day) * DEG;
  const cosH = -Math.tan(ph) * Math.tan(de), h0 = cosH >= 1 ? 0 : cosH <= -1 ? Math.PI : Math.acos(cosH);
  return S0 / Math.PI * (h0 * Math.sin(ph) * Math.sin(de) + Math.cos(ph) * Math.cos(de) * Math.sin(h0));
}
const MONSOON = { lat: 20, landDepth: 1, albedo: 0.3, B: 2.09 };
const CW = 4.18e6; // heat capacity of water, J m⁻³ K⁻¹
// Temperature departure from its own annual mean (K) for a surface layer equivalent to `depth` metres of water,
// forced by the seasonal sunshine and losing B W/m² per K. Daily steps, spun up for 8 years.
function seasonalAnomaly(depth, lat = MONSOON.lat) {
  const C = CW * depth, dt = 86400, mean = Array.from({ length: 365 }, (_, d) => dailyInsolation(lat, d)).reduce((s, v) => s + v, 0) / 365;
  let T = 0; const out = new Array(365);
  for (let y = 0; y < 8; y++) for (let d = 0; d < 365; d++) {
    const Q = (dailyInsolation(lat, d) - mean) * (1 - MONSOON.albedo);
    // exact step for C dT/dt = Q − B T with Q held for one day
    const k = Math.exp(-MONSOON.B * dt / C); T = Q / MONSOON.B + (T - Q / MONSOON.B) * k;
    if (y === 7) out[d] = T;
  }
  return out;
}
const MONTH_DAY = [15, 46, 74, 105, 135, 166, 196, 227, 258, 288, 319, 349];
function monsoon(oceanDepth) {
  const land = seasonalAnomaly(MONSOON.landDepth), sea = seasonalAnomaly(oceanDepth);
  const amp = a => (Math.max(...a) - Math.min(...a)) / 2;
  const argmax = a => a.indexOf(Math.max(...a));
  const diff = land.map((v, i) => v - sea[i]);
  return { land, sea, diff, landAmp: amp(land), seaAmp: amp(sea), landPeak: argmax(land), seaPeak: argmax(sea) };
}
const monthOfDay = d => { let m = 0; for (let i = 0; i < 12; i++) if (d >= MONTH_DAY[i] - 15) m = i; return m; };

const API = { OMEGA, R_EARTH, G, RD, DEG, EBM, insol, absorbed, ebm, pAt, zOf, columns, uAM, groundSpeed, coriolisF, uAMat,
  HH, hadleyEdge, surfaceWind, band, fromDir, COMPASS, S0, declination, dailyInsolation, MONSOON, seasonalAnomaly, monsoon, MONTH_DAY, monthOfDay };
if (typeof module !== 'undefined' && module.exports) module.exports = API;
if (typeof window !== 'undefined') root.CIRC_MODEL = API;
})(typeof window !== 'undefined' ? window : globalThis);
