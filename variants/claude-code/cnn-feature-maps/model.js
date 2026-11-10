'use strict';
// CNN feature-map model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every pixel, map, kernel value and readout on the page is computed here; tests/core.cjs pins the claims.
// Convention (as in CNN libraries): "convolution" is cross-correlation — the kernel is NOT flipped:
// out[i][j] = Σ_a Σ_b k[a][b] · in[i·s + a − p][j·s + b − p], zero outside the image (zero padding p, stride s).
(function (root) {
  const N = 14;
  const grid = (n, m, f) => Array.from({ length: n }, (_, i) => Array.from({ length: m }, (_, j) => f(i, j)));
  function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  // Synthetic 14×14 grey images, 0 = black, 1 = white.
  const IMAGES = {
    square: grid(N, N, (i, j) => (i >= 4 && i <= 9 && j >= 4 && j <= 9 ? 1 : 0)),
    disc: grid(N, N, (i, j) => ((i - 6.5) ** 2 + (j - 6.5) ** 2 <= 4.6 ** 2 ? 1 : 0)),
    diagonal: grid(N, N, (i, j) => (Math.abs(i - j) <= 1 ? 1 : 0)),
    letterT: grid(N, N, (i, j) => ((i >= 3 && i <= 4 && j >= 2 && j <= 11) || (i >= 5 && i <= 11 && j >= 6 && j <= 7) ? 1 : 0)),
  };
  // Training picture for step 5: the T letter plus a fixed random speckle, so every kernel weight is exercised.
  const TRAIN = (() => { const r = mulberry32(2026); return grid(N, N, (i, j) => Math.min(1, 0.7 * IMAGES.letterT[i][j] + 0.5 * r())); })();
  IMAGES.texture = TRAIN;
  const IMAGE_KEYS = ['square', 'disc', 'diagonal', 'letterT'];

  // Kernels (3×3). Edge kernels are Sobel-style: "vertical" responds to left→right brightness changes.
  const SOBEL_X = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
  const SOBEL_Y = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];
  const edgeAt = deg => { const t = deg * Math.PI / 180, c = Math.cos(t), s = Math.sin(t); return grid(3, 3, (a, b) => c * SOBEL_X[a][b] + s * SOBEL_Y[a][b]); };
  const KERNELS = {
    edge: edgeAt, // depends on the angle
    blur: () => grid(3, 3, () => 1 / 9),
    sharpen: () => [[0, -1, 0], [-1, 5, -1], [0, -1, 0]],
    identity: () => [[0, 0, 0], [0, 1, 0], [0, 0, 0]],
  };

  const outSize = (n, k, p, s) => Math.floor((n + 2 * p - k) / s) + 1;
  function conv(img, k, p = 0, s = 1) {
    const n = img.length, K = k.length, o = outSize(n, K, p, s);
    return grid(o, o, (i, j) => {
      let sum = 0;
      for (let a = 0; a < K; a++) for (let b = 0; b < K; b++) {
        const r = i * s + a - p, c = j * s + b - p;
        if (r >= 0 && r < n && c >= 0 && c < n) sum += k[a][b] * img[r][c];
      }
      return sum;
    });
  }
  // The nine products behind one output pixel (step 0), valid convolution.
  function products(img, k, i, j) { const out = []; for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) out.push({ a, b, x: img[i + a][j + b], w: k[a][b], p: k[a][b] * img[i + a][j + b] }); return { terms: out, sum: out.reduce((s, q) => s + q.p, 0) }; }

  const relu = m => m.map(r => r.map(v => Math.max(0, v)));
  function maxpool(m, size = 2) { const o = Math.floor(m.length / size); return grid(o, o, (i, j) => { let v = -Infinity; for (let a = 0; a < size; a++) for (let b = 0; b < size; b++) v = Math.max(v, m[i * size + a][j * size + b]); return v; }); }
  const shiftRight = (img, d) => img.map(r => r.map((_, j) => (j - d >= 0 ? r[j - d] : 0)));
  const maxAbs = m => Math.max(1e-12, ...m.flat().map(Math.abs));
  const argmax = m => { let best = -Infinity, at = [0, 0]; m.forEach((r, i) => r.forEach((v, j) => { if (v > best) { best = v; at = [i, j]; } })); return { v: best, i: at[0], j: at[1] }; };

  /* ---------- step 3: ReLU + pooling under a small shift ---------- */
  // Compare the map of the original image with the map of the image shifted right by d pixels,
  // cell by cell at the same position (what a later layer would see). A cell "changed" if it moved by more than 0.05.
  function shiftCompare(imgKey, d) {
    const img = IMAGES[imgKey], k = edgeAt(0);
    const f0 = relu(conv(img, k)), f1 = relu(conv(shiftRight(img, d), k));
    const p0 = maxpool(f0), p1 = maxpool(f1);
    const diff = (A, B) => A.flat().filter((v, i) => Math.abs(v - B.flat()[i]) > 0.05).length;
    return { f0, f1, p0, p1, featChanged: diff(f0, f1), featCells: f0.length ** 2, poolChanged: diff(p0, p1), poolCells: p0.length ** 2 };
  }

  /* ---------- step 4: a second layer that ANDs two edge maps ---------- */
  // V = ReLU(vertical edge), H = ReLU(horizontal edge), each divided by its own maximum (so both peak at 1).
  // Layer 2 (a 1×1 convolution over the two channels, weights 1 and 1, bias −c): out = ReLU(V + H − c).
  function corner(imgKey, c) {
    const img = IMAGES[imgKey];
    const V0 = relu(conv(img, edgeAt(0))), H0 = relu(conv(img, edgeAt(90)));
    const mv = maxAbs(V0), mh = maxAbs(H0);
    const V = V0.map(r => r.map(v => v / mv)), H = H0.map(r => r.map(v => v / mh));
    const out = V.map((r, i) => r.map((v, j) => Math.max(0, v + H[i][j] - c)));
    const on = []; out.forEach((r, i) => r.forEach((v, j) => { if (v > 1e-9) on.push([i, j]); }));
    return { V, H, out, on };
  }
  // The band of thresholds c for which exactly the strongest position survives: [second-largest V+H, largest V+H).
  function cornerRange(imgKey) {
    const q = corner(imgKey, -1), vals = [];
    q.V.forEach((r, i) => r.forEach((v, j) => vals.push(v + q.H[i][j])));
    const u = [...new Set(vals.map(v => Math.round(v * 1e9) / 1e9))].sort((x, y) => y - x);
    const best = argmax(q.V.map((r, i) => r.map((v, j) => v + q.H[i][j])));
    return { lo: u[1], hi: u[0], at: [best.i, best.j] };
  }

  /* ---------- step 5: learning a kernel by gradient descent ---------- */
  const TARGET_KERNEL = edgeAt(0);
  const target = () => conv(TRAIN, TARGET_KERNEL);
  // Mean squared error over the 12×12 output and its gradient with respect to the nine weights.
  function lossGrad(k) {
    const y = conv(TRAIN, k), t = target(), o = y.length, M = o * o;
    let loss = 0; const g = grid(3, 3, () => 0);
    for (let i = 0; i < o; i++) for (let j = 0; j < o; j++) {
      const e = y[i][j] - t[i][j]; loss += e * e / M;
      for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) g[a][b] += 2 * e * TRAIN[i + a][j + b] / M;
    }
    return { loss, g, y, t };
  }
  const step = (k, lr) => { const { g } = lossGrad(k); return k.map((r, a) => r.map((v, b) => v - lr * g[a][b])); };
  const zeroKernel = () => grid(3, 3, () => 0);
  // The loss is a quadratic bowl; its curvature (Hessian = 2/M · XᵀX over the nine patch values) sets the largest stable learning rate 2/λmax.
  function hessianEig() {
    const o = N - 2, M = o * o, Hm = grid(9, 9, () => 0);
    for (let i = 0; i < o; i++) for (let j = 0; j < o; j++) { const x = []; for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) x.push(TRAIN[i + a][j + b]); for (let u = 0; u < 9; u++) for (let v = 0; v < 9; v++) Hm[u][v] += 2 * x[u] * x[v] / M; }
    // Jacobi eigenvalue iteration (symmetric 9×9)
    const A = Hm.map(r => r.slice());
    for (let sweep = 0; sweep < 100; sweep++) {
      let off = 0; for (let p = 0; p < 9; p++) for (let q = p + 1; q < 9; q++) off += A[p][q] ** 2;
      if (off < 1e-24) break;
      for (let p = 0; p < 9; p++) for (let q = p + 1; q < 9; q++) {
        if (Math.abs(A[p][q]) < 1e-30) continue;
        const th = (A[q][q] - A[p][p]) / (2 * A[p][q]), tt = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1)), c = 1 / Math.sqrt(tt * tt + 1), s = tt * c;
        for (let r = 0; r < 9; r++) { const arp = A[r][p], arq = A[r][q]; A[r][p] = c * arp - s * arq; A[r][q] = s * arp + c * arq; }
        for (let r = 0; r < 9; r++) { const apr = A[p][r], aqr = A[q][r]; A[p][r] = c * apr - s * aqr; A[q][r] = s * apr + c * aqr; }
      }
    }
    const eig = A.map((r, i) => r[i]).sort((x, y) => x - y);
    return { min: eig[0], max: eig[8], lrMax: 2 / eig[8], eig };
  }
  function train(lr, steps, k0 = zeroKernel()) { let k = k0; const losses = [lossGrad(k).loss]; for (let s = 0; s < steps; s++) { k = step(k, lr); losses.push(lossGrad(k).loss); } return { k, losses }; }
  const maxErr = k => Math.max(...k.flat().map((v, i) => Math.abs(v - TARGET_KERNEL.flat()[i])));

  const api = { N, IMAGES, IMAGE_KEYS, TRAIN, SOBEL_X, SOBEL_Y, edgeAt, KERNELS, outSize, conv, products, relu, maxpool, shiftRight, maxAbs, argmax, shiftCompare, corner, cornerRange, TARGET_KERNEL, target, lossGrad, step, zeroKernel, hessianEig, train, maxErr };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.CNN_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
