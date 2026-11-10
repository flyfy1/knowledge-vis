'use strict';
// Backpropagation lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every node value, slope, gradient, cost count and training curve on the page is computed here;
// tests/core.cjs pins the claims. Loads in the browser (window.BP_MODEL) and in node (module.exports).
//
// The network of steps 0–4 (one training example):
//   z_j = w_j1·x1 + w_j2·x2 + b_j        (hidden pre-activation, j = 1, 2)
//   h_j = σ(z_j),  σ(z) = 1 / (1 + e^(−z))
//   ŷ_o = v_o1·h1 + v_o2·h2 + c_o        (output, o = 1, 2; linear)
//   L   = ½·[(ŷ1 − y1)² + (ŷ2 − y2)²]
// Weight names: w_jk goes INTO hidden j FROM input k; v_oj goes INTO output o FROM hidden j.
(function (root) {
  const sig = z => 1 / (1 + Math.exp(-z));
  const dsig = z => { const s = sig(z); return s * (1 - s); };

  const NAMES = ['w11', 'w12', 'w21', 'w22', 'b1', 'b2', 'v11', 'v12', 'v21', 'v22', 'c1', 'c2'];
  // Default parameters (flat vector in NAMES order), the example x and its target y.
  const P0 = [0.8, -0.5, 0.2, 1.1, 0.1, -0.3, 1.3, -0.8, 0.6, 1.2, 0.2, -0.1];
  const X0 = [1.0, 0.5];
  const Y0 = [1.0, 0.0];

  const unpack = p => ({
    W: [[p[0], p[1]], [p[2], p[3]]], b: [p[4], p[5]],
    V: [[p[6], p[7]], [p[8], p[9]]], c: [p[10], p[11]]
  });

  function forward(p, x = X0, y = Y0) {
    const { W, b, V, c } = unpack(p);
    const z = [0, 1].map(j => W[j][0] * x[0] + W[j][1] * x[1] + b[j]);
    const h = z.map(sig);
    const yh = [0, 1].map(o => V[o][0] * h[0] + V[o][1] * h[1] + c[o]);
    const e = yh.map((v, o) => v - y[o]);
    const L = 0.5 * (e[0] * e[0] + e[1] * e[1]);
    return { x, y, z, h, yh, e, L };
  }
  const loss = (p, x, y) => forward(p, x, y).L;
  const withParam = (p, i, v) => { const q = p.slice(); q[i] = v; return q; };

  // The backward sweep in stages (step 4): δ at outputs → gradients of v, c → δ at hidden → gradients of w, b.
  function backward(p, x = X0, y = Y0) {
    const f = forward(p, x, y), { V } = unpack(p);
    const dOut = f.e.slice();                                       // ∂L/∂ŷ_o = ŷ_o − y_o
    const gV = [0, 1].map(o => [0, 1].map(j => dOut[o] * f.h[j])); // ∂L/∂v_oj = δ_o · h_j
    const gc = dOut.slice();                                        // ∂L/∂c_o = δ_o
    const dH = [0, 1].map(j => V[0][j] * dOut[0] + V[1][j] * dOut[1]); // ∂L/∂h_j: sum over both outputs
    const dZ = dH.map((v, j) => v * dsig(f.z[j]));                 // ∂L/∂z_j = ∂L/∂h_j · σ'(z_j)
    const gW = [0, 1].map(j => [0, 1].map(k => dZ[j] * x[k]));     // ∂L/∂w_jk = δ_j · x_k
    const gb = dZ.slice();
    const grad = [gW[0][0], gW[0][1], gW[1][0], gW[1][1], gb[0], gb[1], gV[0][0], gV[0][1], gV[1][0], gV[1][1], gc[0], gc[1]];
    return { f, dOut, gV, gc, dH, dZ, gW, gb, grad };
  }

  // Slope by nudging: forward difference (step 1, one extra pass per parameter) or central difference (checks).
  function nudge(p, i, eps, mode = 'forward', x = X0, y = Y0) {
    if (mode === 'central') return (loss(withParam(p, i, p[i] + eps), x, y) - loss(withParam(p, i, p[i] - eps), x, y)) / (2 * eps);
    return (loss(withParam(p, i, p[i] + eps), x, y) - loss(p, x, y)) / eps;
  }

  // Step 2/3: the two routes from w11 to the loss. Route o goes w11 → z1 → h1 → ŷ_o → L.
  // Factors: ∂z1/∂w11 = x1, ∂h1/∂z1 = σ'(z1), ∂ŷ_o/∂h1 = v_o1, ∂L/∂ŷ_o = ŷ_o − y_o.
  function routes(p, x = X0, y = Y0) {
    const f = forward(p, x, y), { V } = unpack(p);
    const s = dsig(f.z[0]);
    return [0, 1].map(o => {
      const factors = [x[0], s, V[o][0], f.e[o]];
      return { o, factors, product: factors.reduce((a, b) => a * b, 1) };
    });
  }

  // Step 5: rough work counts for a fully connected chain: n inputs, D hidden layers of width n, 1 output,
  // no biases. Work unit = one multiply-add (one per edge used).
  function costs(D, n) {
    const P = D * n * n + n;                       // weights
    const F = P;                                   // one forward pass touches every edge once
    const nudgeWork = (P + 1) * F;                 // P + 1 forward passes
    // Enumerating routes: a weight entering hidden layer l (1..D) reaches the output by n^(D−l) routes,
    // each route crosses D − l + 1 more edges. Output weights: one route of length 1.
    let pathWork = n; // output weights
    let routeCount = 0;
    for (let l = 1; l <= D; l++) { pathWork += n * n * Math.pow(n, D - l) * (D - l + 2); routeCount += n * n * Math.pow(n, D - l); }
    routeCount += n;
    const backWork = F + (P + n + (D - 1) * n * n); // forward + (weight gradients + δ through output and hidden-to-hidden edges)
    return { P, F, nudgeWork, pathWork, backWork, routeCount, routesFirst: Math.pow(n, D - 1) };
  }

  // Step 6: XOR with a 2–H–1 network (sigmoid hidden, linear output, L = ½·mean of squared errors over 4 points).
  const XOR = [[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 0]];
  const H6 = 3;
  // Initial weight sets shown as #1, #2, …; #1 is the default, #2 stalls at η = 0.5 (tests pin both).
  const SEEDS6 = [3, 2, 10, 4, 5, 6, 7, 1];
  function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function initXor(seed, H = H6) {
    const r = mulberry32(seed * 7919 + 13), u = () => (r() * 2 - 1) * 1.5;
    return { H, W: Array.from({ length: H }, () => [u(), u()]), b: Array.from({ length: H }, u), v: Array.from({ length: H }, u), c: u() };
  }
  function xorOut(net, x1, x2) {
    let s = net.c;
    for (let j = 0; j < net.H; j++) s += net.v[j] * sig(net.W[j][0] * x1 + net.W[j][1] * x2 + net.b[j]);
    return s;
  }
  function xorLoss(net) { let s = 0; for (const [a, b, y] of XOR) { const e = xorOut(net, a, b) - y; s += 0.5 * e * e; } return s / XOR.length; }
  // Full-batch gradient: the backward sweep run once per example, gradients averaged.
  function xorGrad(net) {
    const H = net.H, g = { W: Array.from({ length: H }, () => [0, 0]), b: new Array(H).fill(0), v: new Array(H).fill(0), c: 0 };
    for (const [x1, x2, y] of XOR) {
      const z = net.W.map((w, j) => w[0] * x1 + w[1] * x2 + net.b[j]), h = z.map(sig);
      let out = net.c; for (let j = 0; j < H; j++) out += net.v[j] * h[j];
      const d = (out - y) / XOR.length;
      g.c += d;
      for (let j = 0; j < H; j++) {
        g.v[j] += d * h[j];
        const dz = d * net.v[j] * h[j] * (1 - h[j]);
        g.W[j][0] += dz * x1; g.W[j][1] += dz * x2; g.b[j] += dz;
      }
    }
    return g;
  }
  function xorStep(net, eta) {
    const g = xorGrad(net);
    return { H: net.H, W: net.W.map((w, j) => [w[0] - eta * g.W[j][0], w[1] - eta * g.W[j][1]]), b: net.b.map((v, j) => v - eta * g.b[j]), v: net.v.map((v, j) => v - eta * g.v[j]), c: net.c - eta * g.c };
  }
  const xorFlat = net => [...net.W.flat(), ...net.b, ...net.v, net.c];
  function xorFromFlat(f, H = H6) { return { H, W: Array.from({ length: H }, (_, j) => [f[2 * j], f[2 * j + 1]]), b: f.slice(2 * H, 3 * H), v: f.slice(3 * H, 4 * H), c: f[4 * H] }; }
  // Run `epochs` steps from seed; returns the loss history (index 0 = before training).
  function xorRun(seed, eta, epochs) {
    let net = initXor(seed); const hist = [xorLoss(net)];
    for (let e = 0; e < epochs; e++) { net = xorStep(net, eta); const L = xorLoss(net); hist.push(Number.isFinite(L) ? L : Infinity); if (!Number.isFinite(L)) break; }
    return { net, hist };
  }
  // First epoch at which the loss drops below `tol` (−1 if never within `max`).
  function xorEpochsTo(seed, eta, tol, max) { const r = xorRun(seed, eta, max); return r.hist.findIndex(v => v < tol); }

  const api = { sig, dsig, NAMES, P0, X0, Y0, unpack, forward, loss, withParam, backward, nudge, routes, costs, XOR, H6, SEEDS6, initXor, xorOut, xorLoss, xorGrad, xorStep, xorFlat, xorFromFlat, xorRun, xorEpochsTo };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.BP_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
