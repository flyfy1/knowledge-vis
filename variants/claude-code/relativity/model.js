'use strict';
// Special relativity model (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Spacetime diagrams use c = 1 (distance in light-seconds or light-years, time in seconds or years).
// Loaded by the page (window.SR_MODEL) and by node (tests/core.cjs).
(function (root) {

const C = 299792458;                 // m/s
const gamma = b => 1 / Math.sqrt(1 - b * b);

/* ---------- step 0: light clock ---------- */
// mirrors L metres apart; one tick = light up and back
function lightClock(beta, L = 0.15) {
  const g = gamma(beta), rest = 2 * L / C;          // s
  return { gamma: g, rest, moving: g * rest, diag: g * L, drift: beta * g * rest * C };   // diag: one leg's path length (m), drift: sideways travel per tick (m)
}

/* ---------- steps 1–2: Lorentz transformation and intervals ---------- */
const lorentz = (x, ct, b) => { const g = gamma(b); return { x: g * (x - b * ct), ct: g * (ct - b * x) }; };
const inverse = (xp, ctp, b) => lorentz(xp, ctp, -b);
const interval = (x, ct) => ct * ct - x * x;
const kind = s2 => (Math.abs(s2) < 1e-9 ? 'light' : s2 > 0 ? 'time' : 'space');

/* ---------- step 2: a lamp in the middle of a train car (proper length L) ---------- */
function carFlash(beta, L = 4) {
  const g = gamma(beta), half = L / (2 * g);         // ground frame: contracted car centred on the lamp at t = 0
  const tA = half / (1 + beta), tB = half / (1 - beta);
  const A = { x: -tA, ct: tA }, B = { x: tB, ct: tB };       // light hits the rear (A) and the front (B)
  return { gamma: g, half, A, B, dt: tB - tA, Ap: lorentz(A.x, A.ct, beta), Bp: lorentz(B.x, B.ct, beta),
    rear: t => -half + beta * t, front: t => half + beta * t, lamp: t => beta * t };
}

/* ---------- step 3: atmospheric muons ---------- */
const MUON = { tau: 2.1969811e-6, h: 15000 };       // mean lifetime at rest (s), production height (m)
function muon(beta, h = MUON.h) {
  const g = gamma(beta), v = beta * C;
  const tGround = h / v;                             // ground-frame flight time
  const tMuon = tGround / g;                         // muon's own clock
  const hMuon = h / g;                               // atmosphere thickness in the muon frame
  return { gamma: g, tGround, tMuon, hMuon,
    classical: Math.exp(-tGround / MUON.tau),        // no time dilation
    relGround: Math.exp(-tGround / (g * MUON.tau)),  // ground view: dilated lifetime
    relMuon: Math.exp(-(hMuon / v) / MUON.tau),      // muon view: contracted distance
    survivalAt: (z, rel) => Math.exp(-(z / v) / ((rel ? g : 1) * MUON.tau)) };
}

/* ---------- step 4: twins (distance D light-years, speed beta) ---------- */
function twins(beta, D) {
  const g = gamma(beta), tEarth = 2 * D / beta, tTrav = tEarth / g;
  const turn = { x: D, ct: D / beta };
  const nowOut = D / beta - beta * D, nowIn = D / beta + beta * D;   // Earth time on the traveller's "now" line just before / after turning
  return { gamma: g, tEarth, tTrav, turn, nowOut, nowIn, jump: nowIn - nowOut, legTrav: D / (beta * g) };
}

/* ---------- step 5: adding velocities ---------- */
const addV = (v, w) => (v + w) / (1 + v * w);

/* ---------- step 6: kinetic energy ---------- */
const ME = 0.51099895;                               // electron rest energy, MeV
const betaFromK = K => Math.sqrt(1 - 1 / ((1 + K) ** 2));   // K in units of mc²
const betaClassical = K => Math.sqrt(2 * K);
const kRel = b => gamma(b) - 1, kClassical = b => 0.5 * b * b;

/* ---------- finale: GPS satellite clock (special-relativity part only) ---------- */
const GPS = { GM: 3.986004418e14, r: 26560e3 };
function gpsLag() { const v = Math.sqrt(GPS.GM / GPS.r), b = v / C; return { v, beta: b, perDay: (1 - 1 / gamma(b)) * 86400 }; }

const api = { C, gamma, lightClock, lorentz, inverse, interval, kind, carFlash, MUON, muon, twins, addV, ME, betaFromK, betaClassical, kRel, kClassical, GPS, gpsLag };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
if (root) root.SR_MODEL = api;
})(typeof window !== 'undefined' ? window : null);
