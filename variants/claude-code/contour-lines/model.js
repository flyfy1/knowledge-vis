'use strict';
// Contour lines lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Two made-up landscapes on a 1000 m × 1000 m map (coordinates x east, y north, both 0..1; heights in m),
// contour extraction by marching squares, slopes by central differences, and a steepest-descent water path.
// Every line, number and readout on the page comes from here; tests/core.cjs pins the claims.
(function (root) {
  const MAP_M = 1000;                     // map width in metres
  const g2 = (dx, dy, sx, sy) => Math.exp(-(dx * dx) / (sx * sx) - (dy * dy) / (sy * sy));

  /* ---- landscape A: one lopsided hill (steep east, gentle west) and a small knoll ---- */
  const A = { base: 12, peak: [0.56, 0.5], top: 110, sxE: 0.13, sxW: 0.30, sy: 0.24, knoll: [0.13, 0.15], knollH: 9, knollR: 0.045 };
  function hillA(x, y) {
    const dx = x - A.peak[0], sx = dx > 0 ? A.sxE : A.sxW;
    return A.base + A.top * g2(dx, y - A.peak[1], sx, A.sy) + A.knollH * g2(x - A.knoll[0], y - A.knoll[1], A.knollR, A.knollR);
  }

  /* ---- landscape B: two summits, a saddle, a ridge, a valley and a closed basin ---- */
  // Rotated elongated bump: centre (cx, cy), unit direction (ux, uy), half-lengths along / across.
  const rot = (x, y, c, u, la, lc) => { const dx = x - c[0], dy = y - c[1], al = dx * u[0] + dy * u[1], ac = -dx * u[1] + dy * u[0]; return Math.exp(-(al * al) / (la * la) - (ac * ac) / (lc * lc)); };
  const norm = v => { const L = Math.hypot(v[0], v[1]); return [v[0] / L, v[1] / L]; };
  const B = {
    p1: [0.30, 0.64], p2: [0.68, 0.70],
    ridgeC: [0.17, 0.40], ridgeU: norm([-0.45, -1]),
    valleyC: [0.50, 0.30], valleyU: norm([0.12, -1]),
    basin: [0.80, 0.24]
  };
  function hillB(x, y) {
    return 36
      + 40 * g2(x - 0.48, y - 0.62, 0.38, 0.30)                    // broad upland
      + 95 * g2(x - B.p1[0], y - B.p1[1], 0.11, 0.11)               // main summit
      + 70 * g2(x - B.p2[0], y - B.p2[1], 0.10, 0.10)               // second summit
      + 55 * rot(x, y, [0.24, 0.52], B.ridgeU, 0.20, 0.055)          // ridge running south-west from the main summit
      - 34 * rot(x, y, [0.545, -0.06], B.valleyU, 0.5, 0.05)          // valley draining south (deepest at the map edge)
      + 60 * g2(x - B.basin[0], y - B.basin[1], 0.12, 0.12)          // rim of the basin
      - 45 * g2(x - B.basin[0], y - B.basin[1], 0.05, 0.05);         // hollow in the middle of the rim
  }
  const LAND = { A: hillA, B: hillB };

  // Gradient (m per map unit) by central differences; slope as rise per horizontal metre and as an angle.
  function grad(f, x, y, h = 1e-4) { return [(f(x + h, y) - f(x - h, y)) / (2 * h), (f(x, y + h) - f(x, y - h)) / (2 * h)]; }
  function slope(f, x, y) { const g = grad(f, x, y), r = Math.hypot(g[0], g[1]) / MAP_M; return { rise: r, deg: Math.atan(r) * 180 / Math.PI, g }; }
  // Horizontal gap between neighbouring contours near (x, y), in metres: interval ÷ rise.
  const spacing = (f, x, y, interval) => interval / slope(f, x, y).rise;

  // Height grid on n × n cells (n + 1 samples per side).
  function grid(f, n) { const z = []; for (let j = 0; j <= n; j++) { const row = []; for (let i = 0; i <= n; i++) row.push(f(i / n, j / n)); z.push(row); } return { n, z }; }
  // Marching squares for one cell: corner values v (SW, SE, NE, NW) on [x0, x1] × [y0, y1].
  function cellSegs(v, x0, x1, y0, y1, level) {
    const lerp = (a, b, va, vb) => a + (b - a) * (level - va) / (vb - va), pts = [], out = [];
    if ((v[0] < level) !== (v[1] < level)) pts.push([lerp(x0, x1, v[0], v[1]), y0]);
    if ((v[1] < level) !== (v[2] < level)) pts.push([x1, lerp(y0, y1, v[1], v[2])]);
    if ((v[2] < level) !== (v[3] < level)) pts.push([lerp(x1, x0, v[2], v[3]), y1]);
    if ((v[3] < level) !== (v[0] < level)) pts.push([x0, lerp(y1, y0, v[3], v[0])]);
    if (pts.length === 2) out.push([pts[0], pts[1]]);
    else if (pts.length === 4) { const c = (v[0] + v[1] + v[2] + v[3]) / 4; if ((c < level) === (v[0] < level)) out.push([pts[0], pts[1]], [pts[2], pts[3]]); else out.push([pts[0], pts[3]], [pts[1], pts[2]]); }
    return out;
  }
  // Marching squares over a grid: line segments [[x1, y1], [x2, y2]] (map units) where the surface crosses `level`.
  function contour(G, level) {
    const { n, z } = G, segs = [];
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) segs.push(...cellSegs([z[j][i], z[j][i + 1], z[j + 1][i + 1], z[j + 1][i]], i / n, (i + 1) / n, j / n, (j + 1) / n, level));
    return segs;
  }
  // Join segments into polylines; returns how many separate pieces there are and whether each is closed.
  function pieces(segs) {
    const key = p => Math.round(p[0] * 1e6) + ',' + Math.round(p[1] * 1e6), adj = new Map();
    segs.forEach(([p, q], k) => { [key(p), key(q)].forEach(K => { if (!adj.has(K)) adj.set(K, []); adj.get(K).push(k); }); });
    const used = new Uint8Array(segs.length), out = [];
    for (let s0 = 0; s0 < segs.length; s0++) {
      if (used[s0]) continue;
      const stack = [s0]; used[s0] = 1; let count = 0; const ends = new Map();
      while (stack.length) { const k = stack.pop(); count++; for (const p of segs[k]) { const K = key(p); ends.set(K, (ends.get(K) || 0) + 1); for (const m of adj.get(K)) if (!used[m]) { used[m] = 1; stack.push(m); } } }
      out.push({ count, closed: [...ends.values()].every(c => c % 2 === 0) });
    }
    return out;
  }
  const segLength = segs => segs.reduce((s, [p, q]) => s + Math.hypot(q[0] - p[0], q[1] - p[1]), 0) * MAP_M;
  // Levels drawn for an interval: every multiple of the interval between the lowest and highest point.
  function levels(G, interval) {
    let lo = Infinity, hi = -Infinity; G.z.forEach(r => r.forEach(v => { lo = Math.min(lo, v); hi = Math.max(hi, v); }));
    const out = []; for (let L = Math.ceil(lo / interval) * interval; L < hi; L += interval) if (L > lo) out.push(L);
    return { lo, hi, list: out };
  }
  // The contour lines just below and just above a height (step 1 bracket).
  const bracket = (h, interval) => { const below = Math.floor(h / interval) * interval; return [below, below + interval]; };

  // Landscape A's knoll forms its own closed ring at level L only if L lies between its top and the saddle
  // that joins it to the main hill (the highest level at which the two are still connected on high ground).
  function regionFrom(f, start, L, n = 120) {
    const seen = new Uint8Array((n + 1) * (n + 1)), q = [], id = (i, j) => j * (n + 1) + i;
    const i0 = Math.round(start[0] * n), j0 = Math.round(start[1] * n); if (f(i0 / n, j0 / n) < L) return { seen, n, edge: false };
    let edge = false; seen[id(i0, j0)] = 1; q.push([i0, j0]);
    while (q.length) {
      const [i, j] = q.pop(); if (i === 0 || j === 0 || i === n || j === n) edge = true;
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const a = i + di, b = j + dj; if (a < 0 || b < 0 || a > n || b > n || seen[id(a, b)]) continue; if (f(a / n, b / n) >= L) { seen[id(a, b)] = 1; q.push([a, b]); } }
    }
    return { seen, n, edge, has: p => seen[id(Math.round(p[0] * n), Math.round(p[1] * n))] === 1 };
  }
  function knollInfo() {
    const topAt = climb(hillA, A.knoll[0], A.knoll[1], 1), top = hillA(topAt[0], topAt[1]);
    let lo = A.base, hi = top;
    for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if (regionFrom(hillA, topAt, m).has(A.peak)) lo = m; else hi = m; }
    return { top, saddle: (lo + hi) / 2, at: topAt };
  }
  const knollVisible = interval => { const k = knollInfo(); return Math.floor(k.top / interval) * interval > k.saddle; };
  const INTERVALS = [5, 10, 20, 25, 50];

  // Saddle of landscape B: the lowest point on the highest path between the summits, refined to ∇h = 0.
  function saddleB() {
    // start from the minimum along the straight line between the summits, then Newton on the gradient
    let best = null, bh = Infinity;
    for (let k = 0; k <= 200; k++) { const s = k / 200, x = B.p1[0] + (B.p2[0] - B.p1[0]) * s, y = B.p1[1] + (B.p2[1] - B.p1[1]) * s, h = hillB(x, y); if (s > 0.15 && s < 0.85 && h < bh) { bh = h; best = [x, y]; } }
    let [x, y] = best; const e = 1e-4;
    for (let it = 0; it < 40; it++) {
      const g = grad(hillB, x, y), gx1 = grad(hillB, x + e, y), gy1 = grad(hillB, x, y + e);
      const hxx = (gx1[0] - g[0]) / e, hxy = (gy1[0] - g[0]) / e, hyy = (gy1[1] - g[1]) / e, det = hxx * hyy - hxy * hxy;
      x -= (hyy * g[0] - hxy * g[1]) / det; y -= (-hxy * g[0] + hxx * g[1]) / det;
    }
    return [x, y];
  }
  // Local summit / hollow by gradient ascent / descent from a start point.
  function climb(f, x, y, dir = 1) { for (let k = 0; k < 4000; k++) { const g = grad(f, x, y), L = Math.hypot(g[0], g[1]); if (L < 1e-6) break; const s = Math.min(0.002, L * 1e-6); x += dir * g[0] / L * s; y += dir * g[1] / L * s; } return [x, y]; }

  // The five landform features of step 4: a point and a cross-section line through it.
  function features() {
    const s = saddleB(), pk = climb(hillB, B.p1[0], B.p1[1], 1), bs = climb(hillB, B.basin[0] + 0.01, B.basin[1] + 0.01, -1);
    const across = (c, u, half) => [[c[0] + u[1] * half, c[1] - u[0] * half], [c[0] - u[1] * half, c[1] + u[0] * half]];
    const along = (c, u, half) => [[c[0] - u[0] * half, c[1] - u[1] * half], [c[0] + u[0] * half, c[1] + u[1] * half]];
    const su = norm([B.p2[0] - B.p1[0], B.p2[1] - B.p1[1]]);
    // the crest of the ridge / floor of the valley on the line across it through the reference point
    const extreme = (c, u, dir) => { let best = c, bh = -Infinity; for (let k = -400; k <= 400; k++) { const s = k / 400 * 0.08, p = [c[0] + u[1] * s, c[1] - u[0] * s], h = dir * hillB(p[0], p[1]); if (h > bh) { bh = h; best = p; } } return best; };
    const rc = extreme(B.ridgeC, B.ridgeU, 1), vc = extreme(B.valleyC, B.valleyU, -1);
    return {
      peak: { at: pk, cut: [[pk[0] - 0.2, pk[1]], [pk[0] + 0.2, pk[1]]] },
      ridge: { at: rc, cut: across(rc, B.ridgeU, 0.17), axis: along(rc, B.ridgeU, 0.12) },
      valley: { at: vc, cut: across(vc, B.valleyU, 0.17), axis: along(vc, B.valleyU, 0.12) },
      saddle: { at: s, cut: along(s, su, 0.24), cross: across(s, su, 0.16) },
      basin: { at: bs, cut: [[bs[0] - 0.18, bs[1]], [bs[0] + 0.18, bs[1]]] }
    };
  }
  // Heights along a straight cut (n + 1 samples), with horizontal distance in metres.
  function profile(f, p, q, n = 160) { const out = []; for (let k = 0; k <= n; k++) { const s = k / n, x = p[0] + (q[0] - p[0]) * s, y = p[1] + (q[1] - p[1]) * s; out.push({ s, d: s * Math.hypot(q[0] - p[0], q[1] - p[1]) * MAP_M, x, y, h: f(x, y) }); } return out; }

  // Water: steepest descent with a fixed step, stopping at a hollow, at the map edge or after maxSteps.
  function flow(f, x, y, step = 0.004, maxSteps = 900) {
    const path = [[x, y]]; let end = 'edge';
    for (let k = 0; k < maxSteps; k++) {
      const g = grad(f, x, y), L = Math.hypot(g[0], g[1]);
      if (L < 1e-3) { end = 'hollow'; break; }
      const nx = x - g[0] / L * step, ny = y - g[1] / L * step;
      if (f(nx, ny) >= f(x, y)) { end = 'hollow'; break; }   // overshooting the bottom of a hollow
      x = nx; y = ny; path.push([x, y]);
      if (x < 0 || x > 1 || y < 0 || y > 1) { end = 'edge'; break; }
      if (k === maxSteps - 1) end = 'hollow';
    }
    return { path, end, h0: f(path[0][0], path[0][1]), h1: f(x, y), length: (path.length - 1) * step * MAP_M };
  }

  const api = { MAP_M, A, B, hillA, hillB, LAND, grad, slope, spacing, grid, cellSegs, contour, pieces, segLength, levels, bracket, knollInfo, knollVisible, regionFrom, INTERVALS, saddleB, climb, features, profile, flow };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CONTOUR_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
