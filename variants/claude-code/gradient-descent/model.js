'use strict';
// Gradient descent lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every point, curve and readout on the page is computed here; tests/core.cjs pins the claims.
// Update rule throughout: x ← x − η·∇f(x), fixed learning rate η, no momentum.
(function (root) {
  /* ---------- step 0: one step on f(x) = ½(x − 1)² ---------- */
  const f0 = x => 0.5 * (x - 1) * (x - 1);
  const d0 = x => x - 1;
  // One update from x: slope g, new point, the tangent's predicted change −η g², the actual change.
  function step0(x, eta) {
    const g = d0(x), xn = x - eta * g;
    return { g, xn, f: f0(x), fn: f0(xn), pred: -eta * g * g, actual: f0(xn) - f0(x) };
  }

  /* ---------- step 1: f(x) = ½ a x², start x0 ---------- */
  const X1 = 4;          // start point used in step 1
  const K1 = 30;         // number of updates the run shows
  // x_k = (1 − ηa)^k · x0 — computed by iterating the update, not by the closed form.
  function run1D(a, eta, x0 = X1, K = K1) {
    const xs = [x0];
    for (let k = 0; k < K; k++) { const x = xs[k]; xs.push(x - eta * a * x); }
    return xs;
  }
  const factor1 = (a, eta) => 1 - eta * a;
  function regime(a, eta) {
    const r = factor1(a, eta), e = 1e-9;
    if (Math.abs(r) < e) return 'one';
    if (r > 0) return 'mono';
    if (Math.abs(r + 1) < e) return 'bounce';
    return r > -1 ? 'osc' : 'diverge';
  }
  // Updates until |x_k| ≤ tol·|x0|. Infinity when |r| ≥ 1.
  function stepsTo(r, tol) {
    const m = Math.abs(r);
    if (m < 1e-12) return 1;
    if (m >= 1 - 1e-12) return Infinity;
    return Math.ceil(Math.log(tol) / Math.log(m) - 1e-9);
  }

  /* ---------- steps 2–3: f(x, y) = ½(x² + κ y²) ---------- */
  const P2 = [-4.5, 1.8];   // start point in steps 2 and 3
  const TOL2 = 0.01;        // "arrived" = within 0.01 of the minimum (0, 0)
  const MAXK = 2000;
  const f2 = (k, x, y) => 0.5 * (x * x + k * y * y);
  const grad2 = (k, x, y) => [x, k * y];
  function run2D(k, eta, p0 = P2, K = 200) {
    const pts = [p0.slice()];
    for (let i = 0; i < K; i++) {
      const [x, y] = pts[i], g = grad2(k, x, y);
      const nx = x - eta * g[0], ny = y - eta * g[1];
      pts.push([nx, ny]);
      if (!isFinite(nx) || !isFinite(ny) || Math.hypot(nx, ny) > 1e6) break;
    }
    return pts;
  }
  // Number of updates until the point is within TOL2 of the minimum (iterated, capped at MAXK).
  function arrive2D(k, eta, p0 = P2) {
    let x = p0[0], y = p0[1];
    for (let i = 0; i <= MAXK; i++) {
      if (Math.hypot(x, y) <= TOL2) return i;
      if (Math.hypot(x, y) > 1e6) return Infinity;
      const g = grad2(k, x, y); x -= eta * g[0]; y -= eta * g[1];
    }
    return Infinity;
  }
  const limit2 = k => 2 / Math.max(1, k);           // stable iff η < 2/λmax, λmax = max(1, κ)
  const best2 = k => 2 / (1 + k);                   // balances |1 − η| and |1 − ηκ|
  const rateBest = k => (k - 1) / (k + 1);
  // Angle between −∇f and the straight line to the minimum, in degrees.
  function angleToMin(k, p = P2) {
    const g = grad2(k, p[0], p[1]), d = [-p[0], -p[1]];
    const c = (-g[0] * d[0] - g[1] * d[1]) / (Math.hypot(...g) * Math.hypot(...d));
    return Math.acos(Math.max(-1, Math.min(1, c))) * 180 / Math.PI;
  }
  // Best arrival count over a fine η grid (used by step 3's lower panel and the tests).
  function bestOnGrid(k, n = 400) {
    let best = { eta: 0, steps: Infinity };
    const lim = limit2(k);
    for (let i = 1; i <= n; i++) {
      const eta = lim * i / (n + 1), s = arrive2D(k, eta);
      if (s < best.steps) best = { eta, steps: s };
    }
    return best;
  }

  /* ---------- step 4: a landscape with two valleys ---------- */
  const f4 = x => 0.04 * x ** 4 - 0.5 * x * x + 0.35 * x;
  const d4 = x => 0.16 * x ** 3 - x + 0.35;
  const dd4 = x => 0.48 * x * x - 1;
  const X4 = { min: -4, max: 4 };
  // Stationary points by Newton from three seeds (left min, hump, right min).
  function root4(x) { for (let i = 0; i < 60; i++) x -= d4(x) / dd4(x); return x; }
  const MINS4 = { left: root4(-2.7), hump: root4(0.35), right: root4(2.3) };
  function run4(x0, eta, K = 400) {
    const xs = [x0];
    for (let i = 0; i < K; i++) {
      const x = xs[i], nx = x - eta * d4(x);
      xs.push(nx);
      if (!isFinite(nx) || Math.abs(nx) > 1e3) break;
    }
    return xs;
  }
  // Where a run ends: 'left' | 'right' | 'none' (diverged or still moving after K updates).
  function outcome4(x0, eta, K = 400) {
    const xs = run4(x0, eta, K), x = xs[xs.length - 1];
    if (!isFinite(x) || Math.abs(x) > 1e3) return 'none';
    if (Math.abs(x - MINS4.left) < 1e-3) return 'left';
    if (Math.abs(x - MINS4.right) < 1e-3) return 'right';
    return 'none';
  }
  const GRID4 = Array.from({ length: 161 }, (_, i) => X4.min + i * 0.05);
  function basins(eta) {
    const out = GRID4.map(x => outcome4(x, eta));
    return { out, left: out.filter(v => v === 'left').length, right: out.filter(v => v === 'right').length, none: out.filter(v => v === 'none').length };
  }

  /* ---------- step 5: fitting a line to data, full batch vs mini-batch ---------- */
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const DATA = (() => {
    const r = mulberry32(2026), pts = [];
    for (let i = 0; i < 24; i++) {
      const x = 0.5 + 9 * (i + r()) / 24;
      const n = Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());
      pts.push({ x, y: 0.8 * x + 2 + 1.0 * n });
    }
    return pts;
  })();
  const meanX = DATA.reduce((s, p) => s + p.x, 0) / DATA.length;
  // Feature used by the model: raw x, or x − mean(x) when "centred".
  const feat = (p, centred) => centred ? p.x - meanX : p.x;
  // Mean squared error of the line ŷ = w·u + c on a subset of points.
  function loss5(w, c, centred, idx) {
    const S = idx || DATA.map((_, i) => i);
    let s = 0; for (const i of S) { const p = DATA[i], e = w * feat(p, centred) + c - p.y; s += e * e; }
    return s / S.length;
  }
  function grad5(w, c, centred, idx) {
    let gw = 0, gc = 0;
    for (const i of idx) { const p = DATA[i], u = feat(p, centred), e = w * u + c - p.y; gw += 2 * e * u; gc += 2 * e; }
    return [gw / idx.length, gc / idx.length];
  }
  // Least-squares optimum and the Hessian 2·[[E u², E u], [E u, 1]] with its eigenvalues.
  function optimum5(centred) {
    const n = DATA.length; let su = 0, suu = 0, sy = 0, suy = 0;
    for (const p of DATA) { const u = feat(p, centred); su += u; suu += u * u; sy += p.y; suy += u * p.y; }
    const Eu = su / n, Euu = suu / n, Ey = sy / n, Euy = suy / n;
    const w = (Euy - Eu * Ey) / (Euu - Eu * Eu), c = Ey - w * Eu;
    const a = 2 * Euu, b = 2 * Eu, d = 2, tr = a + d, det = a * d - b * b, disc = Math.sqrt(tr * tr / 4 - det);
    const lmax = tr / 2 + disc, lmin = tr / 2 - disc;
    return { w, c, loss: loss5(w, c, centred), lmax, lmin, kappa: lmax / lmin };
  }
  const START5 = [-0.2, 0];
  const K5 = 300;
  // Run K5 updates with batch size B. Each epoch visits the points in a fresh shuffled order (seeded).
  function run5(centred, B, ratio, seed = 1) {
    const opt = optimum5(centred), eta = ratio * 2 / opt.lmax, rnd = mulberry32(seed * 7919 + B);
    const n = DATA.length, path = [START5.slice()], losses = [loss5(START5[0], START5[1], centred)];
    let order = [], pos = n;
    for (let k = 0; k < K5; k++) {
      const idx = [];
      while (idx.length < B) {
        if (pos >= n) { order = DATA.map((_, i) => i); for (let i = n - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; } pos = 0; }
        idx.push(order[pos++]);
      }
      const [w, c] = path[k], g = grad5(w, c, centred, idx), nw = w - eta * g[0], nc = c - eta * g[1];
      path.push([nw, nc]); losses.push(loss5(nw, nc, centred));
      if (!isFinite(nw) || !isFinite(nc) || Math.abs(nw) > 1e6) break;
    }
    const tail = losses.slice(-100);
    return { eta, opt, path, losses, final: losses[losses.length - 1], tailMean: tail.reduce((s, v) => s + v, 0) / tail.length, tailMax: Math.max(...tail) };
  }

  const api = { f0, d0, step0, X1, K1, run1D, factor1, regime, stepsTo, P2, TOL2, MAXK, f2, grad2, run2D, arrive2D, limit2, best2, rateBest, angleToMin, bestOnGrid, f4, d4, dd4, X4, MINS4, run4, outcome4, GRID4, basins, DATA, meanX, feat, loss5, grad5, optimum5, START5, K5, run5, mulberry32 };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GD_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
