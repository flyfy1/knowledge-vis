'use strict';
// Earth's orbit & the seasons — lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every position, curve and readout on the page is computed here; tests/core.cjs pins the claims.
// Sun position: the Astronomical Almanac low-precision formulas (good to ~0.01°), evaluated at 12:00 UT
// on each day of 2026 (day n = 1 … 365). Geometry only: no atmosphere, no refraction, Sun's centre.
(function (root) {
  const D2R = Math.PI / 180, R2D = 180 / Math.PI;
  const AU_MKM = 149.598;       // 1 astronomical unit in millions of km
  const TILT = 23.44;           // Earth's axial tilt today (degrees)
  const S0 = 1361;              // solar constant at 1 AU, W/m²
  const YEAR_DAYS = 365;
  const D0 = 9497;              // days from J2000.0 to 2026-01-01 12:00 UT
  const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const MONTH_START = MONTH_DAYS.reduce((a, d, i) => { a.push(i ? a[i - 1] + MONTH_DAYS[i - 1] : 1); return a; }, []);

  const norm360 = a => ((a % 360) + 360) % 360;
  function sun(n) {
    const d = D0 + (n - 1);
    const g = norm360(357.529 + 0.98560028 * d) * D2R;
    const q = norm360(280.459 + 0.98564736 * d);
    const L = norm360(q + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)); // Sun's ecliptic longitude
    const r = 1.00014 - 0.01671 * Math.cos(g) - 0.00014 * Math.cos(2 * g); // AU
    return { L, r };
  }
  // Declination of the Sun (latitude where it is overhead at noon) for a given axial tilt.
  const declination = (n, tilt = TILT) => Math.asin(Math.sin(tilt * D2R) * Math.sin(sun(n).L * D2R)) * R2D;
  const distanceMkm = n => sun(n).r * AU_MKM;
  const relIntensity = n => 1 / (sun(n).r ** 2); // top-of-atmosphere sunlight vs its value at 1 AU
  // Earth's position seen from the Sun (ecliptic coordinates, AU): opposite to the Sun's direction.
  function earthPos(n) { const { L, r } = sun(n), a = (L + 180) * D2R; return { x: r * Math.cos(a), y: r * Math.sin(a), lon: norm360(L + 180), r }; }

  // Noon altitude of the Sun (degrees above the horizon; negative = below even at noon).
  const noonAltitude = (lat, dec) => 90 - Math.abs(lat - dec);
  // Hour angle of sunset (degrees) and day length (hours); handles polar day / night.
  function dayLength(lat, dec) {
    const x = -Math.tan(lat * D2R) * Math.tan(dec * D2R);
    if (x <= -1) return { hours: 24, H0: 180, kind: 'polarDay' };
    if (x >= 1) return { hours: 0, H0: 0, kind: 'polarNight' };
    const H0 = Math.acos(x) * R2D;
    return { hours: 2 * H0 / 15, H0, kind: 'normal' };
  }
  // Daily mean sunlight at the top of the atmosphere (W/m², averaged over 24 h).
  function dailyInsolation(lat, n, tilt = TILT) {
    const dec = declination(n, tilt) * D2R, p = lat * D2R, H0 = dayLength(lat, dec * R2D).H0 * D2R;
    const r = sun(n).r;
    return S0 / Math.PI / (r * r) * (H0 * Math.sin(p) * Math.sin(dec) + Math.cos(p) * Math.cos(dec) * Math.sin(H0));
  }
  // Astronomical season in the northern hemisphere from the Sun's longitude.
  const seasonNorth = n => ['spring', 'summer', 'autumn', 'winter'][Math.floor(sun(n).L / 90) % 4];
  const opposite = { spring: 'autumn', summer: 'winter', autumn: 'spring', winter: 'summer' };

  // Calendar helpers.
  function monthDay(n) { let m = 0; while (m < 11 && n >= MONTH_START[m + 1]) m++; return { m, d: n - MONTH_START[m] + 1 }; }
  const dayOf = (m, d) => MONTH_START[m] + d - 1;

  // Key dates of the model year (found by scanning whole days).
  function keyDates() {
    let peri = 1, aph = 1, sMax = 1, sMin = 1; const cross = [];
    for (let n = 1; n <= YEAR_DAYS; n++) {
      if (sun(n).r < sun(peri).r) peri = n; if (sun(n).r > sun(aph).r) aph = n;
      if (declination(n) > declination(sMax)) sMax = n; if (declination(n) < declination(sMin)) sMin = n;
      if (n > 1 && Math.sign(declination(n)) !== Math.sign(declination(n - 1))) cross.push(Math.abs(declination(n)) < Math.abs(declination(n - 1)) ? n : n - 1);
    }
    return { perihelion: peri, aphelion: aph, juneSolstice: sMax, decSolstice: sMin, marchEquinox: cross[0], septEquinox: cross[1] };
  }

  const api = { AU_MKM, TILT, S0, YEAR_DAYS, MONTH_DAYS, MONTH_START, sun, declination, distanceMkm, relIntensity, earthPos, noonAltitude, dayLength, dailyInsolation, seasonNorth, opposite, monthDay, dayOf, keyDates };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SEASONS_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
