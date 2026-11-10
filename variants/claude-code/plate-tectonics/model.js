'use strict';
// Plate tectonics lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every stripe, arrow, dot and number on the page comes from here; tests/core.cjs pins the claims.
// Units: distance km, time Ma (million years), plate speed cm/yr (1 cm/yr = 10 km/Myr), depth km (seafloor depth in m).
(function (root) {
  // ---- step 0: geomagnetic polarity (normal intervals, Ma), rounded from the Cande & Kent (1995) timescale ----
  const NORMAL = [[0, 0.78], [0.99, 1.07], [1.77, 1.95], [2.58, 3.04], [3.11, 3.22], [3.33, 3.58], [4.18, 4.29], [4.48, 4.62], [4.80, 4.89], [4.98, 5.23]];
  const T0 = 5.23; // the page starts spreading this long ago
  const polarityAt = age => (NORMAL.some(([a, b]) => age >= a && age < b) ? 1 : -1);
  const kmPerMyr = u => 10 * u;
  // Crust at distance x (km) from the ridge, at simulated time tNow (Ma before present; 0 = today).
  function crustAt(x, u, tNow) {
    const age = Math.abs(x) / kmPerMyr(u);           // Myr since this crust formed
    const formed = tNow + age;                        // when it formed (Ma before present)
    if (formed > T0 + 1e-9) return null;              // not yet created in this simulation
    return { age, formed, pol: polarityAt(formed) };
  }
  const widthAt = (u, tNow) => kmPerMyr(u) * (T0 - tNow); // crust created on each side so far
  const brunhesKm = u => 0.78 * kmPerMyr(u);
  // Stripe list on one side of the ridge at tNow: [{x0, x1, pol}] with x in km (x0 < x1, from the ridge outward).
  function stripes(u, tNow) {
    const k = kmPerMyr(u), out = [];
    const edges = [0]; NORMAL.forEach(([a, b]) => { edges.push(a, b); });
    const ages = [...new Set(edges.filter(a => a >= tNow - 1e-12 && a <= T0).concat([tNow, T0]))].sort((p, q) => p - q);
    for (let i = 0; i < ages.length - 1; i++) {
      const a0 = ages[i], a1 = ages[i + 1]; if (a1 - a0 < 1e-12) continue;
      out.push({ x0: (a0 - tNow) * k, x1: (a1 - tNow) * k, pol: polarityAt((a0 + a1) / 2) });
    }
    return out;
  }
  // Magnetometer profile (dimensionless, ±1 smoothed by a 2w-wide running average to mimic a ship survey).
  function profile(u, tNow, x, w = 4) {
    let s = 0, n = 0;
    for (let i = -20; i <= 20; i++) { const c = crustAt(x + i * w / 20, u, tNow); s += c ? c.pol : 0; n++; }
    return s / n;
  }

  // ---- step 1: relative motion across a north–south boundary (plate A west, fixed; plate B east moves) ----
  // theta: direction of B's velocity, degrees counter-clockwise from east. Normal > 0 opens the boundary.
  const TRANSFORM_DEG = 20; // page convention: within 20° of the boundary direction counts as transform
  function relMotion(v, thetaDeg) {
    const th = thetaDeg * Math.PI / 180, n = v * Math.cos(th), s = v * Math.sin(th);
    const off = Math.atan2(Math.abs(n), Math.abs(s)) * 180 / Math.PI; // angle away from boundary-parallel
    const type = v === 0 ? 'none' : off < TRANSFORM_DEG - 1e-9 ? 'transform' : n > 0 ? 'divergent' : 'convergent';
    return { normal: n, shear: s, off, type, oblique: type !== 'transform' && off < 70 };
  }

  // ---- step 2: who sinks ----
  const RHO = { cont: 2.7, ocean: 2.9, mantle: 3.3 }; // typical crustal / upper-mantle densities, g/cm³
  // Seafloor depth (m) vs age (Ma): Parsons & Sclater (1977) empirical fits.
  // The young-floor fit (stated for < 70 Ma) and the old-floor fit (> 20 Ma) overlap; switch where they cross (~20 Ma)
  // so the curve stays continuous and always deepens with age. In 20–70 Ma the two differ by under 100 m.
  const dYoung = t => 2500 + 350 * Math.sqrt(t), dOld = t => 6400 - 3200 * Math.exp(-t / 62.8);
  const T_SWITCH = (() => { let lo = 10, hi = 40; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (dYoung(m) < dOld(m)) lo = m; else hi = m; } return (lo + hi) / 2; })();
  const seaDepth = t => (t <= T_SWITCH ? dYoung(t) : dOld(t));
  // a, b: { kind: 'ocean' | 'cont', age }. Returns which side goes down.
  function whoSinks(a, b) {
    if (a.kind === 'cont' && b.kind === 'cont') return { sinks: 'none', reason: 'collide' };
    if (a.kind !== b.kind) return { sinks: a.kind === 'ocean' ? 'a' : 'b', reason: 'oceanVsCont' };
    const da = seaDepth(a.age), db = seaDepth(b.age);
    if (Math.abs(da - db) < 50) return { sinks: 'tie', reason: 'sameAge', da, db };
    return { sinks: da > db ? 'a' : 'b', reason: 'older', da, db };
  }

  // ---- seeded randomness ----
  function rng(seed) {
    let s = seed >>> 0;
    return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const gauss = u => () => Math.sqrt(-2 * Math.log(1 - u())) * Math.cos(2 * Math.PI * u());

  // ---- step 3: subduction-zone earthquakes and the volcanic arc ----
  const ARC_DEPTH = 100; // km: slab depth beneath typical volcanic arcs (observed range roughly 70–170 km)
  // Depth distribution: most quakes shallow, fewer intermediate, a tail of deep ones down to ~670 km.
  function slabQuakes(dipDeg, n, seed = 11) {
    const u = rng(seed), g = gauss(rng(seed + 1)), tn = Math.tan(dipDeg * Math.PI / 180), out = [];
    for (let i = 0; i < n; i++) {
      const r = u();
      const z = r < 0.55 ? 5 + 65 * u() : r < 0.85 ? 70 + 230 * u() : 300 + 370 * u();
      const across = 12 * g(); // scatter across the slab, km, perpendicular to it
      const c = Math.cos(dipDeg * Math.PI / 180), s = Math.sin(dipDeg * Math.PI / 180);
      out.push({ x: z / tn + across * s, z: Math.max(1, z - across * c) });
    }
    return out;
  }
  // Least-squares line z = m·x + c through quakes deeper than 40 km → dip estimate.
  function fitDip(q) {
    const d = q.filter(p => p.z > 40); if (d.length < 3) return null;
    const n = d.length, mx = d.reduce((s, p) => s + p.x, 0) / n, mz = d.reduce((s, p) => s + p.z, 0) / n;
    let sxx = 0, sxz = 0; d.forEach(p => { sxx += (p.x - mx) ** 2; sxz += (p.x - mx) * (p.z - mz); });
    return Math.atan(sxz / sxx) * 180 / Math.PI;
  }
  const arcDistance = dipDeg => ARC_DEPTH / Math.tan(dipDeg * Math.PI / 180);

  // ---- step 4: stick-slip on a locked transform fault ----
  // v cm/yr, D m (slip deficit that breaks the fault), irregular: strength varies ±30% per cycle.
  function stickSlip(v, D, years, irregular = false, seed = 5) {
    const u = rng(seed), rate = v / 100, events = []; // m/yr
    let deficit = 0, thr = irregular ? D * (0.7 + 0.6 * u()) : D, t = 0;
    const T = [];
    // exact event times: deficit grows linearly, so the next quake is at t + (thr − deficit)/rate
    while (true) {
      const tq = t + (thr - deficit) / rate;
      if (tq > years + 1e-9) break;
      events.push({ year: tq, slip: thr }); t = tq; deficit = 0;
      thr = irregular ? D * (0.7 + 0.6 * u()) : D;
    }
    const deficitAt = y => { let last = 0; for (const e of events) if (e.year <= y) last = e.year; return rate * (y - last); };
    const releasedAt = y => events.filter(e => e.year <= y).reduce((s, e) => s + e.slip, 0);
    return { events, deficitAt, releasedAt, recurrence: D / rate, rate };
  }

  // ---- step 5: three mystery sites (simulated catalogues) ----
  const SITES = [
    { id: 'A', type: 'divergent' }, { id: 'B', type: 'convergent' }, { id: 'C', type: 'transform' }
  ];
  function siteQuakes(type, n = 140, seed = 31) {
    const u = rng(seed), out = [];
    for (let i = 0; i < n; i++) {
      if (type === 'convergent') { const q = slabQuakes(35, 1, seed + 7 * i)[0]; out.push(q); }
      else if (type === 'divergent') out.push({ x: 300 + 40 * (u() - 0.5), z: 2 + 10 * u() });
      else out.push({ x: 300 + 12 * (u() - 0.5), z: 2 + 16 * u() });
    }
    return out;
  }
  const depthStats = q => { const z = q.map(p => p.z).sort((a, b) => a - b); return { max: z[z.length - 1], deepShare: z.filter(v => v > 70).length / z.length }; };

  const api = { NORMAL, T0, polarityAt, kmPerMyr, crustAt, widthAt, brunhesKm, stripes, profile, TRANSFORM_DEG, relMotion, RHO, seaDepth, dYoung, dOld, T_SWITCH, whoSinks, rng, ARC_DEPTH, slabQuakes, fitDip, arcDistance, stickSlip, SITES, siteQuakes, depthStats };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PLATE_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
