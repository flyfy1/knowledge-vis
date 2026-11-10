'use strict';
// Moon phases lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every position, shape and readout on the page is computed here; tests/core.cjs pins the claims.
// Convention: looking down on the North Pole, the Sun is far away to the right (+x) and its light arrives in
// parallel rays. The Moon goes round Earth anticlockwise; its position angle θ is measured from the Sun's
// direction, so θ = 0° is new moon (Moon between Earth and Sun) and θ = 180° is full moon.
(function (root) {
  const D2R = Math.PI / 180, R2D = 180 / Math.PI;
  const SYNODIC = 29.5306;     // days from one new moon to the next
  const SIDEREAL = 27.3217;    // days for one turn relative to the stars
  const DRACONIC = 27.2122;    // days from one node crossing to the next
  const YEAR = 365.25;
  const MOON_DIST = 384400;    // km, mean Earth–Moon distance
  const SUN_DIST = 149.6e6;    // km
  const R_EARTH = 6371, R_MOON = 1737, R_SUN = 696000; // km
  const INCL = 5.145;          // degrees between the Moon's orbit and Earth's orbit

  const wrap360 = a => ((a % 360) + 360) % 360;
  const wrap180 = a => { const v = wrap360(a + 180) - 180; return v === -180 ? 180 : v; };

  // Fraction of the Moon's disc that looks lit from Earth (area fraction of the projected disc).
  const litFraction = theta => (1 - Math.cos(theta * D2R)) / 2;
  // Which side of the disc is lit for a northern-hemisphere observer: waxing → right, waning → left.
  const litSide = theta => { const a = wrap360(theta); return a < 1e-9 || Math.abs(a - 180) < 1e-9 ? 'none' : a < 180 ? 'right' : 'left'; };
  // Sun direction as seen when looking from Earth at the Moon: [right, up, towards the viewer].
  const viewSun = theta => [Math.sin(theta * D2R), 0, -Math.cos(theta * D2R)];

  // Eight named phases; a phase is called by its exact name within ±HALF_DAY_DEG of its angle.
  const PHASES = ['new', 'waxCres', 'firstQ', 'waxGib', 'full', 'wanGib', 'lastQ', 'wanCres'];
  const HALF_DAY_DEG = 360 / SYNODIC / 2; // ≈ 6.1°: half a day of the Moon's motion against the Sun
  function phaseName(theta) {
    const a = wrap360(theta);
    for (const [k, c] of [['new', 0], ['firstQ', 90], ['full', 180], ['lastQ', 270], ['new', 360]]) if (Math.abs(a - c) <= HALF_DAY_DEG) return k;
    return a < 90 ? 'waxCres' : a < 180 ? 'waxGib' : a < 270 ? 'wanGib' : 'wanCres';
  }
  const ageToTheta = age => wrap360(360 * age / SYNODIC);
  const thetaToAge = theta => wrap360(theta) / 360 * SYNODIC;

  // Rise and set (local solar time, observer on the equator, ignoring the Moon's tilt and parallax).
  // Earth turns anticlockwise; at time τ the observer's zenith points at angle ψ = (τ − 12)·15° from the Sun.
  const zenithAngle = tau => (tau - 12) * 15;
  const altitude = (bodyAngle, tau) => 90 - Math.abs(wrap180(bodyAngle - zenithAngle(tau)));
  // signed offset from the zenith: positive = east of the meridian (still rising), negative = west (setting)
  const skyOffset = (bodyAngle, tau) => wrap180(bodyAngle - zenithAngle(tau));
  const mod24 = h => ((h % 24) + 24) % 24;
  const moonRise = theta => mod24(6 + wrap360(theta) / 15);
  const moonSet = theta => mod24(18 + wrap360(theta) / 15);
  // The Moon gains 360°/29.53 d on the Sun, so it rises later each day by 24 h × (1/29.53) / (1 − 1/29.53).
  const riseDelayMin = () => 24 * 60 * (1 / SYNODIC) / (1 - 1 / SYNODIC);

  // Eclipses at full moon. Earth's umbra radius at the Moon's distance (similar triangles):
  const umbraRadius = () => R_EARTH - MOON_DIST * (R_SUN - R_EARTH) / SUN_DIST;
  // Angle the full moon moves along its orbit relative to the node line each lunation.
  const nodeStep = () => 360 * (SYNODIC / DRACONIC - 1);
  // Height of the full moon above Earth's orbital plane (km) when it is u degrees past the ascending node.
  const fullMoonHeight = u => MOON_DIST * Math.sin(INCL * D2R) * Math.sin(u * D2R);
  function eclipseKind(h) {
    const a = Math.abs(h), U = umbraRadius();
    if (a <= U - R_MOON) return 'total';
    if (a < U + R_MOON) return 'partial';
    return 'none';
  }
  // Full moons of "year" y (y = 0, 1, …): index j counts full moons from the start; u0 = node angle of j = 0.
  const U0 = -61.3; // illustrative: puts year 0's eclipse seasons near March and August–September
  function fullMoonsOfYear(y, u0 = U0) {
    const per = YEAR / SYNODIC, j0 = Math.ceil(y * per - 1e-9), j1 = Math.ceil((y + 1) * per - 1e-9);
    const out = [];
    for (let j = j0; j < j1; j++) { const u = wrap360(u0 + j * nodeStep()), h = fullMoonHeight(u); out.push({ j, day: (j - y * per) * SYNODIC, u, h, kind: eclipseKind(h) }); }
    return out;
  }

  // Step 5 quiz: the eight phases in a fixed, non-sequential order.
  const QUIZ = [180, 90, 315, 45, 270, 135, 0, 225];
  const quizCorrect = (guess, truth) => Math.abs(wrap180(guess - truth)) <= 22.5;

  const api = { SYNODIC, SIDEREAL, DRACONIC, YEAR, MOON_DIST, SUN_DIST, R_EARTH, R_MOON, R_SUN, INCL, wrap360, wrap180, litFraction, litSide, viewSun, PHASES, HALF_DAY_DEG, phaseName, ageToTheta, thetaToAge, zenithAngle, altitude, skyOffset, moonRise, moonSet, riseDelayMin, umbraRadius, nodeStep, fullMoonHeight, eclipseKind, U0, fullMoonsOfYear, QUIZ, quizCorrect };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MOON_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
