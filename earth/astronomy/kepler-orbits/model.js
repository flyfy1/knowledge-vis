'use strict';
// Kepler orbits lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every point, curve and number on the page comes from here; tests/core.cjs pins the claims.
// Two-body Kepler problem around a Sun-mass star (planet mass neglected). Orbits are drawn in their own plane
// with the star at the origin (one focus) and perihelion on the +x axis.
(function (root) {
  const GM = 1.32712440018e20;     // m³/s², Sun
  const AU = 1.495978707e11;       // m
  const DAY = 86400, YEAR = 365.25 * DAY;
  const R_SUN = 6.957e8, R_EARTH = 6.371e6, R_JUP = 7.1492e7; // m (IAU nominal / equatorial)

  // Semi-major axis a (AU), period in seconds / years / days.
  const periodSec = a => 2 * Math.PI * Math.sqrt(Math.pow(a * AU, 3) / GM);
  const periodYears = a => periodSec(a) / YEAR;
  const periodDays = a => periodSec(a) / DAY;

  // Kepler's equation M = E − e·sin E (Newton iteration, robust start for high e).
  function solveKepler(M, e) {
    const TWO_PI = 2 * Math.PI;
    let m = ((M % TWO_PI) + TWO_PI) % TWO_PI;
    let E = e < 0.8 ? m : Math.PI;
    for (let i = 0; i < 60; i++) {
      const f = E - e * Math.sin(E) - m, d = 1 - e * Math.cos(E);
      const step = f / d; E -= step;
      if (Math.abs(step) < 1e-14) break;
    }
    return E + (M - m); // keep the same winding as M
  }

  // Position from the eccentric anomaly E (geometry only; any a).
  function pointE(a, e, E) {
    const b = a * Math.sqrt(1 - e * e);
    const x = a * (Math.cos(E) - e), y = b * Math.sin(E);
    return { x, y, r: Math.hypot(x, y), nu: Math.atan2(y, x), E };
  }

  // State at time fraction q = t/T after perihelion (a in AU). Speed from vis-viva, km/s.
  function state(a, e, q) {
    const E = solveKepler(2 * Math.PI * q, e), p = pointE(a, e, E);
    const v = Math.sqrt(GM * (2 / (p.r * AU) - 1 / (a * AU))) / 1000;
    // velocity direction: d/dE of (x, y)
    const b = a * Math.sqrt(1 - e * e), dx = -a * Math.sin(E), dy = b * Math.cos(E), n = Math.hypot(dx, dy);
    return { ...p, q, v, ux: dx / n, uy: dy / n };
  }
  const speedAt = (a, r) => Math.sqrt(GM * (2 / (r * AU) - 1 / (a * AU))) / 1000; // km/s
  const vCirc = a => speedAt(a, a);

  // Ellipse geometry (step 0).
  function shape(a, e) {
    const b = a * Math.sqrt(1 - e * e), c = a * e;
    return { a, e, b, c, rp: a * (1 - e), ra: a * (1 + e), ratio: (1 + e) / (1 - e) };
  }
  // Distances from a point at eccentric anomaly E to the star (origin) and to the empty focus (−2c, 0).
  function focalDistances(a, e, E) {
    const p = pointE(a, e, E), c = a * e;
    return { r1: p.r, r2: Math.hypot(p.x + 2 * c, p.y), x: p.x, y: p.y };
  }

  // Area swept from the star between time fractions q0 and q1: analytic (ab/2)·ΔM and a polygon fan for checking.
  const sectorArea = (a, e, q0, q1) => 0.5 * a * a * Math.sqrt(1 - e * e) * 2 * Math.PI * (q1 - q0);
  function sectorAreaNumeric(a, e, q0, q1, n = 4000) {
    let s = 0, prev = state(a, e, q0);
    for (let i = 1; i <= n; i++) { const cur = state(a, e, q0 + (q1 - q0) * i / n); s += 0.5 * (prev.x * cur.y - cur.x * prev.y); prev = cur; }
    return s;
  }
  function arcLength(a, e, q0, q1, n = 2000) {
    let s = 0, prev = state(a, e, q0);
    for (let i = 1; i <= n; i++) { const cur = state(a, e, q0 + (q1 - q0) * i / n); s += Math.hypot(cur.x - prev.x, cur.y - prev.y); prev = cur; }
    return s;
  }
  // Step 1: N equal time slices; arc lengths and areas.
  function slices(e, N = 12) {
    const out = [];
    for (let k = 0; k < N; k++) out.push({ k, area: sectorArea(1, e, k / N, (k + 1) / N), arc: arcLength(1, e, k / N, (k + 1) / N, 400) });
    const arcs = out.map(s => s.arc), total = Math.PI * Math.sqrt(1 - e * e);
    return { list: out, total, longest: Math.max(...arcs), shortest: Math.min(...arcs), areaShare: out[0].area / total };
  }

  // Solar-system bodies: a (AU), e, observed sidereal period (years). Standard reference values (J2000-era).
  const BODIES = [
    { id: 'mercury', a: 0.387, e: 0.206, T: 0.241 },
    { id: 'venus', a: 0.723, e: 0.007, T: 0.615 },
    { id: 'earth', a: 1.000, e: 0.017, T: 1.000 },
    { id: 'mars', a: 1.524, e: 0.093, T: 1.881 },
    { id: 'jupiter', a: 5.203, e: 0.048, T: 11.86 },
    { id: 'saturn', a: 9.537, e: 0.054, T: 29.46 },
    { id: 'uranus', a: 19.19, e: 0.047, T: 84.01 },
    { id: 'neptune', a: 30.07, e: 0.009, T: 164.8 },
    { id: 'halley', a: 17.83, e: 0.967, T: 75.3 }
  ];

  // ---- transits (circular orbit, uniform stellar disc, Sun-like star) ----
  // Area of overlap between the unit disc (star) and a disc of radius k at centre distance d.
  function overlap(d, k) {
    d = Math.abs(d);
    if (d >= 1 + k) return 0;
    if (d <= 1 - k) return Math.PI * k * k;
    if (d <= k - 1) return Math.PI; // planet larger than star (not used)
    const k2 = k * k, d2 = d * d;
    const a1 = k2 * Math.acos(Math.max(-1, Math.min(1, (d2 + k2 - 1) / (2 * d * k))));
    const a2 = Math.acos(Math.max(-1, Math.min(1, (d2 + 1 - k2) / (2 * d))));
    const tri = 0.5 * Math.sqrt(Math.max(0, (-d + k + 1) * (d + k - 1) * (d - k + 1) * (d + k + 1)));
    return a1 + a2 - tri;
  }
  const flux = (d, k) => 1 - overlap(d, k) / Math.PI;
  const kOf = rpEarth => rpEarth * R_EARTH / R_SUN;
  const aR = a => a * AU / R_SUN; // a in stellar radii
  // Transit of a planet with radius rpEarth (Earth radii) at a (AU), inclination i (deg).
  function transit(rpEarth, a, iDeg) {
    const k = kOf(rpEarth), A = aR(a), ci = Math.cos(iDeg * Math.PI / 180), si = Math.sin(iDeg * Math.PI / 180);
    const b = A * ci, T = periodSec(a) / 3600; // hours
    const hits = b < 1 + k, full = b <= 1 - k;
    const durH = hits ? T / Math.PI * Math.asin(Math.min(1, Math.sqrt((1 + k) ** 2 - b * b) / (A * si))) : 0;
    const iMin = Math.acos(Math.min(1, (1 + k) / A)) * 180 / Math.PI;
    return { k, A, b, T, hits, full, depth: hits ? 1 - flux(b, k) : 0, maxDepth: k * k, durH, iMin, prob: (1 + k) / A };
  }
  // Sky-projected separation (stellar radii) at orbital phase φ (rad) from mid-transit; in front when cos φ > 0.
  function sep(A, iDeg, phi) {
    const x = A * Math.sin(phi), y = A * Math.cos(iDeg * Math.PI / 180) * Math.cos(phi);
    return { x, y, d: Math.hypot(x, y), front: Math.cos(phi) > 0 };
  }
  // Step 4: planet x position (stellar radii, b = 0) → hours from mid-transit.
  const hoursAtX = (a, x) => periodSec(a) / 3600 / (2 * Math.PI) * Math.asin(x / aR(a));

  // Seeded PRNG (mulberry32) for the random-orientation experiment.
  function rng(seed) {
    let s = seed >>> 0;
    return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  // Isotropic orientations: cos i uniform on [0, 1]. Returns the list of cos i values.
  function orientations(n, seed = 2026) { const u = rng(seed); return Array.from({ length: n }, () => u()); }

  const api = { GM, AU, DAY, YEAR, R_SUN, R_EARTH, R_JUP, periodSec, periodYears, periodDays, solveKepler, pointE, state, speedAt, vCirc, shape, focalDistances, sectorArea, sectorAreaNumeric, arcLength, slices, BODIES, overlap, flux, kOf, aR, transit, sep, hoursAtX, rng, orientations };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.KEPLER_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
