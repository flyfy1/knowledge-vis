'use strict';
// Seismic waves model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every wavefront, ray, travel time and readout on the page comes from here; tests/core.cjs pins the claims.
// Scope: straight rays at constant crustal speeds (steps 0–1), flat layers (step 2), and a spherically
// symmetric Earth built from thin constant-speed shells (steps 3–5). Transmitted rays only: no reflections,
// no diffraction, no P↔S conversions.
(function (root) {
  /* ---------- steps 0–1: S − P in the crust ---------- */
  const VP = 6.0, VS = 3.5; // km/s, typical upper-crust speeds
  const lagPerKm = 1 / VS - 1 / VP;          // s of S − P per km of distance
  const kmPerSecond = 1 / lagPerKm;           // ≈ 8.4 km per second of S − P
  const arrivals = d => ({ tP: d / VP, tS: d / VS, sp: d * lagPerKm });
  const distFromSP = sp => sp * kmPerSecond;
  // Synthetic seismogram (illustrative shape only, not a recording): a small P wavelet, then a larger, slower S wavelet.
  function seismo(d, tt) {
    const a = arrivals(d), w = (t0, amp, f, dec) => (tt < t0 ? 0 : amp * Math.exp(-(tt - t0) / dec) * Math.sin(2 * Math.PI * f * (tt - t0)));
    return w(a.tP, 0.35, 0.5, 4) + w(a.tS, 1, 0.3, 7);
  }

  // Step 1: three stations on a 400 km × 400 km map (km). One station's clock can be off by δ seconds.
  const STATIONS = [{ x: 60, y: 320 }, { x: 330, y: 300 }, { x: 200, y: 60 }];
  function locate(ex, ey, delta = 0, bad = 1) {
    const sp = STATIONS.map((s, i) => Math.hypot(ex - s.x, ey - s.y) * lagPerKm + (i === bad ? delta : 0));
    const radii = sp.map(distFromSP);
    // least-squares point: minimise Σ (distance to station − radius)², coarse grid then refine
    const cost = (x, y) => STATIONS.reduce((c, s, i) => c + Math.pow(Math.hypot(x - s.x, y - s.y) - radii[i], 2), 0);
    let bx = 0, by = 0, bc = Infinity;
    for (let x = -100; x <= 500; x += 5) for (let y = -100; y <= 500; y += 5) { const c = cost(x, y); if (c < bc) { bc = c; bx = x; by = y; } }
    for (let h = 2.5; h > 1e-4; h /= 2) { let moved = true; while (moved) { moved = false; for (const [dx, dy] of [[h, 0], [-h, 0], [0, h], [0, -h]]) { const c = cost(bx + dx, by + dy); if (c < bc) { bc = c; bx += dx; by += dy; moved = true; } } } }
    return { sp, radii, x: bx, y: by, miss: Math.hypot(bx - ex, by - ey), rms: Math.sqrt(bc / 3) };
  }

  /* ---------- step 2: flat layers, speed rising with depth ---------- */
  const LAYERS = [{ h: 8, v: 4.0 }, { h: 8, v: 4.8 }, { h: 8, v: 5.6 }, { h: 8, v: 6.4 }, { h: 8, v: 7.2 }, { h: 8, v: 8.0 }];
  // Ray leaves the surface at angle i0 from vertical. Snell: sin i / v is the same in every layer.
  // If the next layer would need sin i > 1, the ray cannot enter and turns back up at that boundary.
  function layerRay(i0deg) {
    const q = Math.sin(i0deg * Math.PI / 180) / LAYERS[0].v, down = [{ x: 0, z: 0 }], angles = [];
    let x = 0, z = 0, turnLayer = null;
    for (let k = 0; k < LAYERS.length; k++) {
      const s = q * LAYERS[k].v;
      if (s >= 1 - 1e-9) { turnLayer = k; break; } // grazing counts as turning back
      const i = Math.asin(s); angles.push(i * 180 / Math.PI);
      x += LAYERS[k].h * Math.tan(i); z += LAYERS[k].h; down.push({ x, z });
    }
    const half = x, path = turnLayer === null ? down : down.concat(down.slice(0, -1).reverse().map(p => ({ x: 2 * half - p.x, z: p.z })));
    return { q, angles, turnLayer, depth: z, X: turnLayer === null ? null : 2 * half, path };
  }

  /* ---------- steps 3–5: the whole Earth ---------- */
  const RE = 6371, RCMB = 3480, RICB = 1221;
  // Simplified PREM-like nodes (radius km → speed km/s); breaks at 400 km, 670 km, the CMB and the ICB.
  const MANTLE = { P: [[6371, 8.11], [5971, 8.90], [5971, 9.13], [5701, 10.27], [5701, 10.75], [3630, 13.68], [3480, 13.72]],
                   S: [[6371, 4.49], [5971, 4.77], [5971, 4.93], [5701, 5.57], [5701, 5.95], [3630, 7.27], [3480, 7.26]] };
  // Interpolate inside a node list (piecewise linear, extrapolating the last segment below its end).
  function interp(nodes, r) {
    for (let i = 0; i < nodes.length - 1; i++) { const [r0, v0] = nodes[i], [r1, v1] = nodes[i + 1]; if (r <= r0 && r >= r1 && r0 !== r1) return v0 + (v1 - v0) * (r0 - r) / (r0 - r1); }
    const [r0, v0] = nodes[nodes.length - 2], [r1, v1] = nodes[nodes.length - 1];
    return v1 + (v1 - v0) / (r0 - r1) * (r1 - r);
  }
  // Build thin shells (≈ dr km) for a given core radius. Outer core: P 8.06 → 10.36, S = 0 (liquid).
  // Inner core radius scales with the core (real ratio 1221/3480). noCore: mantle speeds all the way down.
  function shells(wave, rc = RCMB, opts = {}) {
    const dr = opts.dr || 10, out = [], ri = RICB * rc / RCMB;
    const seg = (top, bot, f) => { const n = Math.max(1, Math.round((top - bot) / dr)); for (let k = 0; k < n; k++) { const ro = top - (top - bot) * k / n, rin = top - (top - bot) * (k + 1) / n; out.push({ ro, ri: rin, v: f((ro + rin) / 2) }); } };
    const m = MANTLE[wave];
    if (opts.noCore) { seg(RE, 5971, r => interp(m.slice(0, 2), r)); seg(5971, 5701, r => interp(m.slice(2, 4), r)); seg(5701, 1, r => interp(m.slice(4), r)); out.noCore = true; return out; }
    seg(RE, Math.max(rc, 5971), r => interp(m.slice(0, 2), r));
    if (rc < 5971) seg(5971, Math.max(rc, 5701), r => interp(m.slice(2, 4), r));
    if (rc < 5701) seg(5701, rc, r => interp(m.slice(4), r));
    const core = r => 8.06 + (10.36 - 8.06) * (rc - r) / (rc - ri);
    seg(rc, ri, r => (wave === 'S' ? 0 : core(r)));
    if (opts.noInner) seg(ri, 1, r => (wave === 'S' ? 0 : core(r)));
    else seg(ri, 1, r => (wave === 'S' ? 3.5 + 0.17 * (ri - r) / ri : 11.03 + 0.23 * (ri - r) / ri));
    return out;
  }
  // Trace a ray with ray parameter p (s/rad, p = r·sin i / v) through the shells.
  // Returns epicentral distance Δ (deg), travel time (s), turning radius, whether it entered the core,
  // whether it was stopped (S at the liquid core), and the down-going path (r, φ) for drawing.
  function trace(sh, p, rc = RCMB) {
    let phi = 0, time = 0, core = false;
    const down = [{ r: RE, phi: 0 }];
    for (const s of sh) {
      if (s.v === 0) return { stopped: true, p, path: down, core: false, delta: null };
      const d = p * s.v;
      if (d >= s.ro) { return finish(); }
      if (!sh.noCore && s.ri < rc - 1e-9 && s.ro <= rc + 1e-9) core = true;
      if (d > s.ri) { phi += Math.acos(d / s.ro); time += Math.sqrt(s.ro * s.ro - d * d) / s.v; down.push({ r: d, phi }); return finish(d); }
      phi += Math.acos(d / s.ro) - Math.acos(d / s.ri); time += (Math.sqrt(s.ro * s.ro - d * d) - Math.sqrt(s.ri * s.ri - d * d)) / s.v;
      down.push({ r: s.ri, phi });
    }
    phi += Math.PI / 2; return finish(0); // p = 0: straight through the centre, Δ = 180°
    function finish(turn) {
      const half = phi, path = down.concat(down.slice(0, -1).reverse().map(q => ({ r: q.r, phi: 2 * half - q.phi })));
      return { stopped: false, p, delta: 2 * half * 180 / Math.PI, time: 2 * time, turn: turn === undefined ? down[down.length - 1].r : turn, core, path };
    }
  }
  const takeoffToP = (sh, i0deg) => RE * Math.sin(i0deg * Math.PI / 180) / sh[0].v;
  // Fan of rays by take-off angle; summary of where direct (mantle-only) and core rays land.
  function fan(wave, rc = RCMB, opts = {}) {
    const sh = shells(wave, rc, opts), n = opts.n || 360, rays = [];
    for (let k = 0; k <= n; k++) { const i0 = 90 * k / (n + 1); /* k = 0: straight down, Δ = 180° */ rays.push({ i0, ...trace(sh, takeoffToP(sh, i0), rc) }); }
    const mantle = rays.filter(r => !r.stopped && !r.core), coreRays = rays.filter(r => !r.stopped && r.core);
    const maxDirect = mantle.length ? Math.max(...mantle.map(r => r.delta)) : null;
    const minCore = coreRays.length ? Math.min(...coreRays.map(r => r.delta)) : null;
    return { sh, rays, maxDirect, minCore };
  }
  // Edge of the direct-P (or S) shadow: the ray that just grazes the core, found by bisection on p.
  function shadowStart(wave, rc = RCMB) {
    const sh = shells(wave, rc); let lo = 0, hi = RE / sh[0].v; // lo enters core, hi stays shallow
    for (let k = 0; k < 60; k++) { const mid = (lo + hi) / 2, tr = trace(sh, mid, rc); if (tr.stopped || tr.core) lo = mid; else hi = mid; }
    return trace(sh, hi, rc).delta;
  }
  // Gaps in coverage: Δ ranges (deg) that no transmitted ray reaches, from a dense fan.
  function gaps(wave, rc = RCMB, opts = {}) {
    const F = fan(wave, rc, { ...opts, n: opts.n || 3000 }), ds = F.rays.filter(r => !r.stopped).map(r => r.delta).sort((x, y) => x - y), out = [];
    for (let k = 0; k < ds.length - 1; k++) if (ds[k + 1] - ds[k] > 2) out.push([ds[k], ds[k + 1]]);
    if (ds.length && 180 - ds[ds.length - 1] > 2) out.push([ds[ds.length - 1], 180]);
    return out;
  }
  // Arrivals at a station Δ degrees away: for each family (mantle-only, through the core), every ray pair that
  // brackets Δ gives an arrival time; the earliest per family is reported (thin-shell wiggles add near-duplicates).
  function arrivalsAt(wave, deltaDeg, rc = RCMB, F = null) {
    F = F || fan(wave, rc, { n: 1500 }); const out = [];
    for (const fam of [false, true]) {
      const rs = F.rays.filter(r => !r.stopped && r.core === fam);
      let best = null;
      for (let k = 0; k < rs.length - 1; k++) {
        const a = rs[k], b = rs[k + 1];
        if ((a.delta - deltaDeg) * (b.delta - deltaDeg) <= 0 && a.delta !== b.delta) { const f = (deltaDeg - a.delta) / (b.delta - a.delta), tt = a.time + f * (b.time - a.time); if (best === null || tt < best) best = tt; }
      }
      if (best !== null) out.push({ core: fam, time: best });
    }
    return out;
  }
  function firstArrivals(deltaDeg, FP = null, FS = null) {
    const p = arrivalsAt('P', deltaDeg, RCMB, FP), sArr = arrivalsAt('S', deltaDeg, RCMB, FS);
    const P = p.find(q => !q.core), PKP = p.find(q => q.core), S = sArr.find(q => !q.core);
    return { P: P ? P.time : null, PKP: PKP ? PKP.time : null, S: S ? S.time : null };
  }
  const OBSERVED_RC = RCMB; // the "observation" in step 5 is this same model with the real core radius

  const api = { VP, VS, lagPerKm, kmPerSecond, arrivals, distFromSP, seismo, STATIONS, locate, LAYERS, layerRay,
    RE, RCMB, RICB, MANTLE, interp, shells, rayTrace: trace, takeoffToP, fan, gaps, shadowStart, arrivalsAt, firstArrivals, OBSERVED_RC };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SEIS_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
