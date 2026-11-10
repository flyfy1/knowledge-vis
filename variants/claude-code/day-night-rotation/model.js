'use strict';
// Day-and-night lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every disc, marker, band cell and readout on the page is computed here; tests/core.cjs pins the claims.
// Geometry (stated on the page): sunlight arrives as parallel rays from the +x side; the Earth's axis is upright
// (no tilt, so every place gets 12 h of day); seen from above the North Pole the Earth turns anticlockwise
// (west to east) once per 24 h (a solar day). Angles in degrees.
(function (root) {
  const DAY = 24, R_KM = 6371;
  const rad = d => d * Math.PI / 180;
  const wrap360 = a => ((a % 360) + 360) % 360;
  const wrap24 = h => ((h % 24) + 24) % 24;

  // Where a place on the equator sits around the Earth (top view, anticlockwise from the sunward +x direction),
  // given its local solar time t (hours) and spin direction dir (+1 real, −1 imaginary reversed spin).
  const spinAngle = (t, dir = 1) => wrap360(dir * (t - 12) * 15);
  // Cosine of the Sun's angle from straight overhead: > 0 day, < 0 night, 0 on the terminator.
  const sunDot = phi => Math.cos(rad(phi));
  const isDay = phi => sunDot(phi) > 1e-12;

  // Phase words: sunrise / sunset within half an hour of 6:00 / 18:00, else day or night.
  function phase(t) {
    const h = wrap24(t);
    if (Math.abs(h - 6) <= 0.5) return 'sunrise';
    if (Math.abs(h - 18) <= 0.5) return 'sunset';
    return h > 6 && h < 18 ? 'day' : 'night';
  }

  // Where the Sun appears in the sky of a person on the equator facing south (east on the left, west on the right).
  // beta = 0 east horizon, 90 overhead, 180 west horizon, 270 straight underfoot. Altitude = 90 − angle from overhead.
  function skySun(t, dir = 1) {
    const phi = spinAngle(t, dir), beta = wrap360(phi + 90);
    return { beta, x: -Math.cos(rad(beta)), y: Math.sin(rad(beta)), altitude: 90 - Math.min(180, Math.abs(((phi + 180) % 360 + 360) % 360 - 180)) };
  }

  // Step 0: is a point on the ball (outward direction at angle a) lit by a lamp in direction theta?
  const litBy = (a, theta) => Math.cos(rad(a - theta)) > 1e-12;

  // Share of the ball's rim lit by a lamp at angle theta (sampled; the page reports it as a percentage).
  function litFraction(theta, n = 3600) { let k = 0; for (let i = 0; i < n; i++) if (litBy((i + 0.5) * 360 / n, theta)) k++; return k / n; }

  // Step 3: local solar time from longitude (east positive): 15° of longitude = 1 hour.
  const CITIES = [{ id: 'beijing', lon: 116.4 }, { id: 'tokyo', lon: 139.7 }, { id: 'london', lon: -0.1 }, { id: 'newyork', lon: -74.0 }];
  const localTime = (refTime, refLon, lon) => wrap24(refTime + (lon - refLon) / 15);

  // Step 4: how fast the ground is carried round by the spin at a given latitude.
  function groundSpeed(lat) { const circ = 2 * Math.PI * R_KM * Math.cos(rad(lat)); return { circ, kmh: circ / DAY, ms: circ * 1000 / (DAY * 3600) }; }
  // Sideways acceleration needed to keep going round (m/s²), compared with gravity 9.8 m/s².
  function turnAccel(lat) { const w = 2 * Math.PI / (DAY * 3600); return w * w * R_KM * 1000 * Math.cos(rad(lat)); }
  const COMPARE = [{ id: 'train', kmh: 350 }, { id: 'plane', kmh: 900 }];

  // 24-hour band in 15-minute cells.
  const CELLS = 96, CELL_H = DAY / CELLS;
  const cellOf = t => Math.min(CELLS - 1, Math.floor(wrap24(t) / CELL_H + 1e-9));
  const cellIsDay = i => isDay(spinAngle((i + 0.5) * CELL_H));

  function clock(t) { const m = Math.round(wrap24(t) * 60) % (24 * 60); return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); }

  const api = { DAY, R_KM, wrap24, wrap360, spinAngle, sunDot, isDay, phase, skySun, litBy, litFraction, CITIES, localTime, groundSpeed, turnAccel, COMPARE, CELLS, CELL_H, cellOf, cellIsDay, clock };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DN_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
