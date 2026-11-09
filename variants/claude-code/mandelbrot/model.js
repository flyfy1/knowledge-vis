'use strict';
// Mandelbrot lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every orbit, picture, period and readout on the page is computed here; tests/core.cjs pins the claims.
// Convention: f_c(z) = z² + c, orbit of the critical point z₀ = 0, escape when |z| > 2.
// All arithmetic is IEEE double precision; nothing here is exact real arithmetic.
(function (root) {
  const R = 2, R2 = 4;

  // Orbit z₀ = 0, z₁ = c, … up to N steps; stops two steps after escaping (the page shows the jump out).
  function orbit(cr, ci, N, z0r = 0, z0i = 0) {
    const pts = [[z0r, z0i]]; let x = z0r, y = z0i, esc = -1;
    for (let n = 1; n <= N; n++) {
      const nx = x * x - y * y + cr; y = 2 * x * y + ci; x = nx;
      pts.push([x, y]);
      if (esc < 0 && x * x + y * y > R2) esc = n;
      if (esc >= 0 && n >= esc + 2) break;
      if (!isFinite(x) || !isFinite(y)) break;
    }
    return { pts, esc };
  }

  // Escape time: first n with |z_n| > 2, or -1 if still inside after N steps.
  function escapeTime(cr, ci, N) {
    let x = 0, y = 0, x2 = 0, y2 = 0;
    for (let n = 1; n <= N; n++) {
      y = 2 * x * y + ci; x = x2 - y2 + cr; x2 = x * x; y2 = y * y;
      if (x2 + y2 > R2) return n;
    }
    return -1;
  }

  // Same, but returns a smooth (continuous) escape count for colouring, -1 if bounded.
  // Runs to a larger radius (2^8) so the log-log correction is accurate; the integer escape time is unchanged.
  function smoothEscape(cr, ci, N, z0r = 0, z0i = 0) {
    let x = z0r, y = z0i, x2 = x * x, y2 = y * y, n = 0, first = -1;
    for (; n < N + 40; n++) {
      if (first < 0 && x2 + y2 > R2) first = n;
      if (x2 + y2 > 65536) break;
      if (first < 0 && n >= N) return -1;
      y = 2 * x * y + ci; x = x2 - y2 + cr; x2 = x * x; y2 = y * y;
    }
    if (first < 0) return -1;
    const s = n + 1 - Math.log2(Math.log2(x2 + y2) / 2);
    return Math.max(first, s - 4);
  }

  // Interior shortcuts: main cardioid and the period-2 disc (exact closed forms).
  function inCardioid(cr, ci) { const xq = cr - 0.25, q = xq * xq + ci * ci; return q * (q + xq) <= 0.25 * ci * ci; }
  function inDisc2(cr, ci) { return (cr + 1) * (cr + 1) + ci * ci <= 1 / 16; }
  // Cardioid boundary: c = e^{iθ}/2 − e^{2iθ}/4 (where the fixed point's multiplier 2z has modulus 1).
  function cardioidPoint(th) { return [Math.cos(th) / 2 - Math.cos(2 * th) / 4, Math.sin(th) / 2 - Math.sin(2 * th) / 4]; }

  // Escape time with interior shortcuts and cycle detection (Brent-style checkpoints). Same answer as escapeTime
  // except that orbits proven periodic return -1 earlier; tests check both agree on grids.
  function escapeFast(cr, ci, N) {
    if (inCardioid(cr, ci) || inDisc2(cr, ci)) return -1;
    let x = 0, y = 0, x2 = 0, y2 = 0, sx = 0, sy = 0, lim = 8;
    for (let n = 1; n <= N; n++) {
      y = 2 * x * y + ci; x = x2 - y2 + cr; x2 = x * x; y2 = y * y;
      if (x2 + y2 > R2) return n;
      if (x === sx && y === sy) return -1;
      if (n === lim) { sx = x; sy = y; lim *= 2; }
    }
    return -1;
  }

  // Area of the "still inside after N steps" set, counted on a grid of cell centres over the frame
  // FRAME (which contains the whole Mandelbrot set). Uses the real-axis mirror symmetry.
  const FRAME = { x0: -2.25, x1: 0.75, y0: -1.5, y1: 1.5 };
  function areaEstimate(N, res) {
    const nx = res, ny = res, dx = (FRAME.x1 - FRAME.x0) / nx, dy = (FRAME.y1 - FRAME.y0) / ny;
    let inside = 0;
    for (let j = 0; j < ny / 2; j++) {
      const ci = FRAME.y1 - (j + 0.5) * dy;
      for (let i = 0; i < nx; i++) if (escapeTime(FRAME.x0 + (i + 0.5) * dx, ci, N) < 0) inside++;
    }
    return 2 * inside * dx * dy;
  }

  // Long-run behaviour of the orbit of 0: after a transient, look for the smallest period p ≤ pMax.
  function attractor(cr, ci, transient = 4000, pMax = 32, tol = 1e-7) {
    let x = 0, y = 0;
    for (let n = 0; n < transient; n++) { const nx = x * x - y * y + cr; y = 2 * x * y + ci; x = nx; if (x * x + y * y > R2) return { escaped: true, n: n + 1 }; }
    const cyc = [[x, y]]; let px = x, py = y;
    for (let p = 1; p <= pMax; p++) {
      const nx = px * px - py * py + cr; py = 2 * px * py + ci; px = nx;
      if (Math.hypot(px - x, py - y) < tol) return { escaped: false, period: p, cycle: cyc };
      cyc.push([px, py]);
    }
    return { escaped: false, period: null, cycle: [] };
  }

  // Multiplier of a q-cycle: product of 2z over the cycle. |multiplier| < 1 means attracting.
  function multiplier(cycle) {
    let mr = 1, mi = 0;
    for (const [x, y] of cycle) { const a = 2 * x, b = 2 * y, nr = mr * a - mi * b; mi = mr * b + mi * a; mr = nr; }
    return [mr, mi];
  }

  // Centre of the p/q bulb hanging on the main cardioid: Newton's method on f_c^q(0) = 0, started just
  // outside the tangency point c(θ), θ = 2πp/q. Tests verify the period is exactly q.
  function bulbCenter(p, q) {
    const th = 2 * Math.PI * p / q, [tx, ty] = cardioidPoint(th);
    // outward normal of the cardioid at θ: derivative i e^{iθ}/2 − i e^{2iθ}/2, rotated by −90°
    let nx = Math.cos(th) / 2 - Math.cos(2 * th) / 2, ny = Math.sin(th) / 2 - Math.sin(2 * th) / 2;
    const L = Math.hypot(nx, ny); nx /= L; ny /= L;
    const r = Math.sin(Math.PI * p / q) / (q * q);
    let cr = tx + nx * r, ci = ty + ny * r;
    for (let it = 0; it < 60; it++) {
      let x = 0, y = 0, dx = 0, dy = 0;
      for (let k = 0; k < q; k++) { const ndx = 2 * (x * dx - y * dy) + 1; dy = 2 * (x * dy + y * dx); dx = ndx; const nx2 = x * x - y * y + cr; y = 2 * x * y + ci; x = nx2; }
      const den = dx * dx + dy * dy; if (den === 0) break;
      const sr = (x * dx + y * dy) / den, si = (y * dx - x * dy) / den;
      cr -= sr; ci -= si;
      if (Math.hypot(sr, si) < 1e-15) break;
    }
    return [cr, ci];
  }

  // α fixed point (the one continued from the attracting fixed point of the main cardioid).
  function alphaFixed(cr, ci) {
    // z = (1 − √(1 − 4c)) / 2 with the principal square root
    const ar = 1 - 4 * cr, ai = -4 * ci, m = Math.hypot(ar, ai);
    let sr = Math.sqrt((m + ar) / 2), si = Math.sqrt(Math.max(0, (m - ar) / 2)); if (ai < 0) si = -si;
    return [(1 - sr) / 2, -si / 2];
  }

  // Rotation of a cycle around α: number of positions each step advances in the angular order.
  function rotationAround(cycle, alpha) {
    const q = cycle.length, ang = cycle.map(([x, y]) => Math.atan2(y - alpha[1], x - alpha[0]));
    const order = ang.map((a, i) => i).sort((i, j) => ang[i] - ang[j]);
    const rank = new Array(q); order.forEach((idx, r) => { rank[idx] = r; });
    const shifts = new Set(); for (let i = 0; i < q; i++) shifts.add((rank[(i + 1) % q] - rank[i] + q) % q);
    return shifts.size === 1 ? [...shifts][0] : null;
  }

  // Zoom targets: a border point deep in seahorse valley, and the centre of the period-3 mini copy.
  const TARGETS = [
    { id: 'seahorse', c: [-0.743643887037151, 0.131825904205330] },
    { id: 'minibrot', c: [-1.7548776662466927, 0] }
  ];
  // Share of a view (sampled on a g × g grid of cell centres) that survives N steps.
  function insideShare(box, N, g = 24) {
    let k = 0;
    for (let j = 0; j < g; j++) for (let i = 0; i < g; i++) if (escapeFast(box.x0 + (i + 0.5) / g * (box.x1 - box.x0), box.y0 + (j + 0.5) / g * (box.y1 - box.y0), N) < 0) k++;
    return k / (g * g);
  }
  const BASE_W = 3.2;                       // width of the view at magnification 1
  const iterFor = z => Math.round(160 + 140 * z); // iteration cap grows with log10(magnification)

  // Julia set for fixed c: escape time of z₀ under the same map.
  function juliaEscape(cr, ci, zr, zi, N) {
    let x = zr, y = zi, x2 = x * x, y2 = y * y;
    if (x2 + y2 > R2) return 0;
    for (let n = 1; n <= N; n++) { y = 2 * x * y + ci; x = x2 - y2 + cr; x2 = x * x; y2 = y * y; if (x2 + y2 > R2) return n; }
    return -1;
  }
  const JULIA = [
    { id: 'basilica', c: [-1, 0] },
    { id: 'rabbit', c: [-0.12256116687665, 0.74486176661974] },
    { id: 'dendrite', c: [0, 1] },
    { id: 'dust', c: [0.3, 0.6] }
  ];

  // Orbit presets for step 0.
  const ORBITS = [
    { id: 'zero', c: [0, 0] }, { id: 'minus1', c: [-1, 0] }, { id: 'i', c: [0, 1] }, { id: 'swirl', c: [-0.5, 0.5] },
    { id: 'quarter', c: [0.25, 0] }, { id: 'p03', c: [0.3, 0] }, { id: 'slow', c: [-0.1, 0.65] }
  ];

  // |z_n| for n = 0..N, continued up to `extra` steps past the first escape (or until |z| > 1e12).
  function modSeq(cr, ci, N, extra = 6) {
    const out = [0]; let x = 0, y = 0, esc = -1;
    for (let n = 1; n <= N; n++) {
      const nx = x * x - y * y + cr; y = 2 * x * y + ci; x = nx;
      const m = Math.hypot(x, y); out.push(m);
      if (esc < 0 && m > R) esc = n;
      if (esc >= 0 && (n >= esc + extra || m > 1e12)) break;
    }
    return { mods: out, esc };
  }
  // Spacing between neighbouring doubles near x (one unit in the last place).
  function ulp(x) { const a = Math.abs(x); return a === 0 ? Number.MIN_VALUE : Math.pow(2, Math.floor(Math.log2(a)) - 52); }

  const api = { modSeq, ulp, R, orbit, escapeTime, smoothEscape, escapeFast, inCardioid, inDisc2, cardioidPoint, FRAME, areaEstimate, attractor, multiplier, bulbCenter, alphaFixed, rotationAround, TARGETS, insideShare, BASE_W, iterFor, juliaEscape, JULIA, ORBITS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MANDEL_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
