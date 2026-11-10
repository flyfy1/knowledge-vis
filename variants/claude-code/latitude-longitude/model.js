'use strict';
// Latitude & longitude lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every point, curve and readout on the page is computed here; tests/core.cjs pins the claims.
// Conventions: Earth is a sphere of radius R = 6371 km; latitude φ ∈ [−90°, 90°] (north positive),
// longitude λ ∈ (−180°, 180°] (east positive). Angles in the API are degrees.
(function (root) {
  const R = 6371;
  const D2R = Math.PI / 180, R2D = 180 / Math.PI;
  const KM_PER_DEG = Math.PI * R / 180; // one degree of a great circle (≈ 111.19 km)

  const wrapLon = l => { let v = ((l + 180) % 360 + 360) % 360 - 180; if (v === -180) v = 180; return v; };
  const vec = (lat, lon) => { const p = lat * D2R, l = lon * D2R; return [Math.cos(p) * Math.cos(l), Math.cos(p) * Math.sin(l), Math.sin(p)]; };
  const fromVec = v => { const n = Math.hypot(v[0], v[1], v[2]); return { lat: Math.asin(Math.max(-1, Math.min(1, v[2] / n))) * R2D, lon: Math.atan2(v[1], v[0]) * R2D }; };

  // Orthographic view of the globe centred on (lat0, lon0): x right, y up, z towards the viewer (z ≥ 0 is the near side).
  function ortho(lat, lon, lat0, lon0) {
    const p = lat * D2R, d = (lon - lon0) * D2R, p0 = lat0 * D2R, cp = Math.cos(p);
    return {
      x: cp * Math.sin(d),
      y: Math.cos(p0) * Math.sin(p) - Math.sin(p0) * cp * Math.cos(d),
      z: Math.sin(p0) * Math.sin(p) + Math.cos(p0) * cp * Math.cos(d)
    };
  }
  // A general 3-D point (unit-sphere coordinates, e.g. the centre or a point inside) in the same view.
  function orthoVec(v, lat0, lon0) {
    const p0 = lat0 * D2R, l0 = lon0 * D2R;
    // rotate by −lon0 about z, then tilt by lat0 about the new y axis
    const x1 = v[0] * Math.cos(l0) + v[1] * Math.sin(l0), y1 = -v[0] * Math.sin(l0) + v[1] * Math.cos(l0), z1 = v[2];
    return { x: y1, y: Math.cos(p0) * z1 - Math.sin(p0) * x1, z: Math.sin(p0) * z1 + Math.cos(p0) * x1 };
  }

  // Step 2: lengths along parallels and meridians.
  const parallelRadius = lat => R * Math.cos(lat * D2R);
  const parallelLength = lat => 2 * Math.PI * R * Math.cos(lat * D2R);
  const kmPerDegLon = lat => KM_PER_DEG * Math.cos(lat * D2R);
  const kmPerDegLat = () => KM_PER_DEG;

  // Step 1/4: great-circle distance (haversine) and points along the great circle.
  function distance(lat1, lon1, lat2, lon2) {
    const p1 = lat1 * D2R, p2 = lat2 * D2R, dp = p2 - p1, dl = (lon2 - lon1) * D2R;
    const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
  }
  function greatCirclePoints(lat1, lon1, lat2, lon2, n = 64) {
    const a = vec(lat1, lon1), b = vec(lat2, lon2);
    const w = Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])));
    if (w > Math.PI - 1e-9) { // antipodes: every great circle through them is shortest; draw the one over the North Pole
      const h = Math.ceil(n / 2), first = greatCirclePoints(lat1, lon1, 90, lon1, h), second = greatCirclePoints(90, lon2, lat2, lon2, n - h);
      return first.concat(second.slice(1));
    }
    const out = [];
    for (let i = 0; i <= n; i++) {
      const f = i / n;
      if (w < 1e-9) { out.push({ lat: lat1, lon: lon1 }); continue; }
      const s1 = Math.sin((1 - f) * w) / Math.sin(w), s2 = Math.sin(f * w) / Math.sin(w);
      out.push(fromVec([s1 * a[0] + s2 * b[0], s1 * a[1] + s2 * b[1], s1 * a[2] + s2 * b[2]]));
    }
    return out;
  }
  // Two places on the same parallel φ, Δλ apart: walking along the parallel vs the great circle.
  function routes(lat, dLon) {
    const p = lat * D2R, dl = dLon * D2R;
    const along = R * Math.cos(p) * dl;
    const great = distance(lat, -dLon / 2, lat, dLon / 2); // haversine: accurate also for tiny Δλ
    // highest latitude the great circle reaches (its vertex, half-way along)
    const top = dLon === 0 ? lat : Math.atan2(Math.tan(p), Math.cos(dl / 2)) * R2D;
    return { along, great, saved: along > 0 ? 1 - great / along : 0, top };
  }

  // Destination point: start at (lat, lon), head along bearing (deg from north, clockwise) for dist km.
  function destination(lat, lon, bearing, dist) {
    const p = lat * D2R, l = lon * D2R, b = bearing * D2R, d = dist / R;
    const p2 = Math.asin(Math.sin(p) * Math.cos(d) + Math.cos(p) * Math.sin(d) * Math.cos(b));
    const l2 = l + Math.atan2(Math.sin(b) * Math.sin(d) * Math.cos(p), Math.cos(d) - Math.sin(p) * Math.sin(p2));
    return { lat: p2 * R2D, lon: wrapLon(l2 * R2D) };
  }
  // A circle of equal real size (radius km) on the ground, as a ring of points.
  function groundCircle(lat, lon, radius, n = 72) {
    const out = [];
    for (let i = 0; i <= n; i++) out.push(destination(lat, lon, 360 * i / n, radius));
    return out;
  }

  // Step 3: two ways of flattening the grid. Map units: x in radians of longitude.
  const MERC_MAX = 80; // the Mercator map is cut at ±80°
  const CIRCLE_KM = 800, CIRCLE_LAT_MAX = 70; // step 3: ground circles of radius 800 km, centre up to 70°N
  const PROJ = {
    plate: { x: lon => lon * D2R, y: lat => lat * D2R, yMax: Math.PI / 2 },
    mercator: { x: lon => lon * D2R, y: lat => { const c = Math.max(-MERC_MAX, Math.min(MERC_MAX, lat)); return Math.log(Math.tan(Math.PI / 4 + c * D2R / 2)); }, yMax: Math.log(Math.tan(Math.PI / 4 + MERC_MAX * D2R / 2)) }
  };
  // Point-scale formulas (an infinitely small circle): east–west stretch, north–south stretch, area stretch.
  function stretchFormula(kind, lat) {
    const k = 1 / Math.cos(lat * D2R);
    return kind === 'plate' ? { ew: k, ns: 1, area: k } : { ew: k, ns: k, area: k * k };
  }
  // Measured on the drawn map: width/height of a real ground circle, divided by the same circle at the equator.
  function circleOnMap(kind, lat, lon, radius) {
    const P = PROJ[kind], pts = groundCircle(lat, lon, radius, 180).map(q => ({ x: P.x(q.lon), y: P.y(q.lat) }));
    const xs = pts.map(q => q.x), ys = pts.map(q => q.y);
    let area = 0; for (let i = 0; i < pts.length - 1; i++) area += pts[i].x * pts[i + 1].y - pts[i + 1].x * pts[i].y;
    return { w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys), area: Math.abs(area) / 2 };
  }
  function measuredStretch(kind, lat, radius) {
    const a = circleOnMap(kind, lat, 0, radius), e = circleOnMap(kind, 0, 0, radius);
    return { ew: a.w / e.w, ns: a.h / e.h, area: a.area / e.area };
  }

  // Step 5: longitude and time. Local solar time = UTC + λ/15 h; the Sun is overhead at noon longitude (12 − UTC)·15°.
  const mod24 = h => ((h % 24) + 24) % 24;
  const solarTime = (utc, lon) => mod24(utc + lon / 15);
  const noonLon = utc => wrapLon((12 - utc) * 15);
  // Equinox model: Sun over the equator. A place is in daylight when the Sun is above its horizon.
  const sunHeight = (utc, lat, lon) => Math.cos(lat * D2R) * Math.cos((lon - noonLon(utc)) * D2R); // = sin(solar altitude)
  const isDay = (utc, lat, lon) => sunHeight(utc, lat, lon) > 0;
  const hhmm = h => { const m = Math.round(mod24(h) * 60) % 1440; return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };

  // Beijing time is the local solar time of 120° E; minutes by which Beijing's own solar time lags it.
  const beijingLagMinutes = () => (120 - CITIES.beijing.lon) / 15 * 60;

  // Approximate city coordinates (degrees; ±0.1°).
  const CITIES = {
    beijing: { lat: 39.9, lon: 116.4 }, london: { lat: 51.5, lon: -0.1 }, newyork: { lat: 40.7, lon: -74.0 },
    sydney: { lat: -33.9, lon: 151.2 }, rio: { lat: -22.9, lon: -43.2 }, cairo: { lat: 30.0, lon: 31.2 },
    singapore: { lat: 1.3, lon: 103.8 }, harbin: { lat: 45.8, lon: 126.6 }, madrid: { lat: 40.4, lon: -3.7 },
    capetown: { lat: -33.9, lon: 18.4 }, reykjavik: { lat: 64.1, lon: -21.9 }, quito: { lat: -0.2, lon: -78.5 },
    tokyo: { lat: 35.7, lon: 139.7 }, honolulu: { lat: 21.3, lon: -157.9 }, northpole: { lat: 90, lon: 0 }
  };
  const QUIZ_ORDER = ['cairo', 'newyork', 'sydney', 'singapore', 'reykjavik', 'rio', 'tokyo', 'capetown'];
  const TIME_CITIES = ['london', 'cairo', 'beijing', 'sydney', 'honolulu', 'newyork'];
  function quizGrade(km) { return km <= 300 ? 'great' : km <= 1000 ? 'close' : 'far'; }

  // Rough hand-drawn coastlines ([lon, lat] rings, a few degrees accurate) — orientation only, never measured.
  const LAND = [
    // North America
    [[-168, 66], [-162, 70], [-156, 71], [-140, 70], [-128, 70], [-115, 68], [-100, 68], [-85, 69], [-80, 63], [-94, 59], [-92, 57], [-82, 55], [-78, 62], [-65, 60], [-60, 55], [-56, 52], [-60, 47], [-66, 45], [-70, 42], [-75, 38], [-76, 35], [-81, 31], [-80, 25.5], [-82, 27], [-84, 30], [-90, 29.5], [-95, 29], [-97, 26], [-97, 22], [-95, 18.5], [-91, 19], [-90, 21], [-87, 21], [-88, 16], [-84, 15], [-83, 10], [-79, 9], [-77, 8], [-80, 7], [-85, 10], [-88, 13], [-92, 14.5], [-96, 16], [-105, 20], [-106, 23], [-112, 29], [-110, 23], [-114, 28], [-117, 32], [-121, 35], [-124, 40], [-124, 46], [-123, 49], [-128, 52], [-133, 57], [-138, 59], [-146, 61], [-152, 59], [-158, 57], [-164, 55], [-158, 58], [-162, 60], [-165, 62], [-168, 66]],
    // Greenland
    [[-73, 78], [-60, 82], [-35, 83], [-20, 82], [-18, 77], [-22, 72], [-25, 69], [-35, 66], [-42, 60], [-48, 61], [-52, 65], [-54, 69], [-58, 75], [-68, 77], [-73, 78]],
    // South America
    [[-77, 8], [-72, 12], [-63, 11], [-60, 8], [-52, 5], [-50, 0], [-44, -2], [-35, -5], [-35, -9], [-39, -14], [-41, -22], [-48, -26], [-53, -34], [-58, -38], [-63, -41], [-65, -46], [-68, -51], [-70, -55], [-74, -52], [-75, -46], [-73, -38], [-71, -30], [-70, -18], [-76, -14], [-81, -6], [-80, -1], [-78, 2], [-77, 8]],
    // Africa
    [[-6, 35.8], [0, 35.8], [10, 37], [11, 33.5], [15, 32], [20, 30.5], [25, 32], [32, 31.3], [34, 31.2], [33, 28], [35, 24], [37.5, 18], [39, 15.5], [43, 12], [51, 12], [51, 10.5], [49, 7], [46, 2], [41, -2], [39, -7], [40.5, -11], [40.5, -15], [36, -19], [35.5, -24], [32.5, -26], [32, -29], [28, -33], [25, -34], [20, -35], [18, -33], [15, -27], [12, -18], [13, -12], [12, -5], [9, -1], [9.5, 4], [5, 6], [-2, 5], [-8, 4.5], [-13, 8], [-17, 14], [-17, 21], [-13, 27], [-10, 30], [-9.5, 32], [-6, 35.8]],
    // Madagascar
    [[44, -25], [47, -25], [50, -15], [49, -12], [44, -16], [44, -25]],
    // Eurasia (south coast west → east, then north coast east → west)
    [[-9, 43], [-9, 37], [-5, 36], [0, 38], [3, 43.3], [6, 43], [8, 44], [10, 44], [12, 42], [15.6, 38], [17, 40], [18.5, 40], [16, 41.8], [13, 44], [12.5, 45.5], [14, 45.5], [19, 42], [20, 40], [23, 37], [23, 40.5], [26, 40.5], [27, 38], [28, 37], [30, 36.5], [36, 36.5], [35.5, 34], [35, 32], [34.5, 31.5], [34.5, 29.5], [35, 28], [38, 24], [39, 22], [42.5, 16], [43.5, 12.7], [45, 13], [52, 16], [55, 17], [58, 20], [59.5, 22.5], [56.5, 24.5], [56, 26.3], [54, 24], [51.5, 24.5], [50, 26.5], [48, 29.5], [50, 30], [53, 27], [57, 25.5], [62, 25], [67, 24.5], [70, 21], [73, 17], [77, 8], [80, 13], [80, 16], [87, 21], [91, 22], [94, 17], [98, 10], [100, 6], [103.5, 1.3], [104, 3], [103, 6], [100, 13], [105, 8.6], [109, 12], [108, 16], [106, 20], [110, 21], [114, 22], [117, 23.5], [120, 27], [122, 31], [121, 33], [120, 35], [122, 37], [119, 37], [118, 38], [119, 39.5], [122, 40], [125, 40], [126, 34.5], [129, 35.5], [129.5, 37.5], [128, 39], [130, 42], [135, 44], [140, 48], [141, 52], [137, 54], [141, 59], [150, 59.5], [155, 59], [156.5, 51], [160, 54], [163, 58], [165, 60], [170, 60], [178, 62], [180, 65], [180, 68], [170, 70], [160, 70], [150, 72], [140, 72], [130, 71], [120, 73], [113, 74], [105, 78], [100, 77], [90, 75], [80, 73], [73, 70], [68, 69], [60, 69], [55, 68], [45, 67], [40, 66], [33, 69], [25, 71], [18, 70], [12, 66], [8, 63], [5, 61], [5, 58], [8, 58], [9, 57], [8, 55], [8, 53.5], [4, 52], [2, 51], [-1.5, 49.5], [-4.5, 48.5], [-2, 47], [-1, 44.5], [-2, 43.4], [-9, 43]],
    // Great Britain
    [[-5, 50], [1, 51], [2, 53], [-1, 55], [-2, 57], [-5, 59], [-6, 56], [-3, 54], [-5, 52], [-5, 50]],
    // Japan
    [[130, 31], [132, 34], [135, 34], [140, 35], [141, 38], [142, 42], [145, 44], [141, 45], [140, 41], [139, 38], [136, 36], [132, 35], [130, 33], [130, 31]],
    // Sumatra, Borneo, New Guinea
    [[95, 5], [98, 4], [104, -2], [106, -6], [101, -3], [95, 5]],
    [[109, 2], [113, -3], [116, -4], [119, 1], [117, 7], [113, 3], [109, 2]],
    [[131, -1], [138, -2], [147, -6], [150, -10], [142, -9], [138, -8], [131, -1]],
    // Australia
    [[114, -22], [114, -26], [115, -34], [118, -35], [124, -33], [131, -31], [135, -35], [138, -35], [141, -38], [146, -39], [150, -37], [153, -31], [153, -25], [146, -19], [145, -15], [142, -11], [141, -17], [136, -12], [130, -12], [126, -14], [122, -17], [114, -22]],
    // New Zealand
    [[172, -34], [178, -38], [175, -41], [171, -46], [167, -46], [172, -41], [174, -38], [172, -34]],
    // Antarctica (closed through the pole)
    [[-180, -78], [-150, -78], [-140, -75], [-120, -73], [-100, -73], [-80, -73], [-65, -65], [-58, -63], [-60, -70], [-45, -78], [-30, -77], [-15, -72], [0, -70], [30, -69], [60, -67], [90, -66], [120, -66], [150, -68], [165, -72], [170, -77], [180, -78], [180, -90], [-180, -90], [-180, -78]]
  ];
  // Densify so that no edge is longer than `step` degrees (keeps the globe clipping smooth).
  function densify(ring, step = 2) {
    const out = [];
    for (let i = 0; i < ring.length - 1; i++) {
      const [a, b] = [ring[i], ring[i + 1]], n = Math.max(1, Math.ceil(Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])) / step));
      for (let k = 0; k < n; k++) out.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]);
    }
    out.push(ring[ring.length - 1]);
    return out;
  }
  const LAND_DENSE = LAND.map(r => densify(r));

  const api = { R, KM_PER_DEG, wrapLon, vec, fromVec, ortho, orthoVec, parallelRadius, parallelLength, kmPerDegLon, kmPerDegLat, distance, greatCirclePoints, routes, destination, groundCircle, MERC_MAX, CIRCLE_KM, CIRCLE_LAT_MAX, PROJ, stretchFormula, circleOnMap, measuredStretch, solarTime, noonLon, sunHeight, isDay, hhmm, mod24, beijingLagMinutes, CITIES, QUIZ_ORDER, TIME_CITIES, quizGrade, LAND, LAND_DENSE };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.LATLON_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
