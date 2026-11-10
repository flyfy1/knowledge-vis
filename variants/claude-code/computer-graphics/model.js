'use strict';
// Rendering-pipeline model (Claude Code edition of computer graphics).
// Author: Claude Code (claude-opus-5-5), 2026-11-09. Pure functions; loads in the browser and in node.
// Screen-space steps use the unit square [0, 1]² with y pointing up; an N × N raster has pixel size 1/N
// and pixel (i, j) has its centre at ((i + 0.5)/N, (j + 0.5)/N).
(function (root) {
  const DEG = Math.PI / 180;

  /* ---------- step 0: 3×3 homogeneous transforms ---------- */
  const mul = (A, B) => A.map((r, i) => B[0].map((_, j) => r[0] * B[0][j] + r[1] * B[1][j] + r[2] * B[2][j]));
  const apply = (A, p) => [A[0][0] * p[0] + A[0][1] * p[1] + A[0][2], A[1][0] * p[0] + A[1][1] * p[1] + A[1][2]];
  const rot = a => [[Math.cos(a), -Math.sin(a), 0], [Math.sin(a), Math.cos(a), 0], [0, 0, 1]];
  const scale = s => [[s, 0, 0], [0, s, 0], [0, 0, 1]];
  const trans = (x, y) => [[1, 0, x], [0, 1, y], [0, 0, 1]];
  // order 'TRS': scale, then rotate, then move (matrix T·R·S). 'RST': move first, then scale and rotate (R·S·T).
  function compose(order, a, s, tx, ty) {
    const T = trans(tx, ty), R = rot(a), S = scale(s);
    return order === 'TRS' ? mul(T, mul(R, S)) : mul(R, mul(S, T));
  }
  const SHAPE = [[0, 0], [1, 0], [1, 0.4], [0.4, 0.4], [0.4, 1.2], [0, 1.2]]; // an "L", model units

  /* ---------- step 1: pinhole perspective ---------- */
  const POSTS = [2, 4, 6]; // distance of each post from the starting eye position (m)
  const POST_H = 1.2;      // post height (m), centred on the eye height
  const project = (f, y, z) => f * y / z; // where a point at height y, depth z lands on the image plane z = f

  /* ---------- rasterization helpers ---------- */
  // Edge function: > 0 when p is to the left of a→b (counter-clockwise interior).
  const edge = (a, b, p) => (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
  const area = tri => 0.5 * edge(tri[0], tri[1], tri[2]); // signed
  const ccw = tri => (area(tri) >= 0 ? tri : [tri[0], tri[2], tri[1]]);
  function inside(tri, p) { const t = ccw(tri); return edge(t[0], t[1], p) >= 0 && edge(t[1], t[2], p) >= 0 && edge(t[2], t[0], p) >= 0; }
  function edgeValues(tri, p) { const t = ccw(tri); return [edge(t[0], t[1], p), edge(t[1], t[2], p), edge(t[2], t[0], p)]; }
  // Pixels whose centre lies inside the triangle; returns a Uint8Array of N×N (index j*N + i, j from the bottom).
  function rasterize(tri, N) {
    const out = new Uint8Array(N * N);
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) if (inside(tri, [(i + 0.5) / N, (j + 0.5) / N])) out[j * N + i] = 1;
    return out;
  }
  const count = a => a.reduce((s, v) => s + v, 0);

  /* ---------- step 3: barycentric weights, depth buffer vs painter ---------- */
  function bary(tri, p) {
    const A = area(tri); if (Math.abs(A) < 1e-15) return null;
    return [0.5 * edge(tri[1], tri[2], p) / A, 0.5 * edge(tri[2], tri[0], p) / A, 0.5 * edge(tri[0], tri[1], p) / A];
  }
  const TRI_A = [[0.08, 0.14], [0.74, 0.22], [0.36, 0.9]];
  const TRI_B = [[0.3, 0.06], [0.95, 0.5], [0.46, 0.82]];
  // Depth (distance from the camera, smaller = nearer) at each vertex. A is flat at 0.5; B tilts about x = 0.6.
  const depthsA = () => [0.5, 0.5, 0.5];
  const depthsB = (tilt, shift) => TRI_B.map(p => 0.5 + shift + tilt * (p[0] - 0.6));
  // Render both triangles on an N × N raster. Returns per-pixel owner (0 none, 1 = A, 2 = B) and depth.
  function renderDepth(N, tilt, shift, method) {
    const tris = [{ id: 1, v: TRI_A, z: depthsA() }, { id: 2, v: TRI_B, z: depthsB(tilt, shift) }];
    const owner = new Uint8Array(N * N), depth = new Float64Array(N * N).fill(Infinity);
    const zAt = (tr, p) => { const w = bary(tr.v, p); return w[0] * tr.z[0] + w[1] * tr.z[1] + w[2] * tr.z[2]; };
    if (method === 'zbuffer') {
      for (const tr of tris) for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
        const p = [(i + 0.5) / N, (j + 0.5) / N]; if (!inside(tr.v, p)) continue;
        const z = zAt(tr, p), k = j * N + i; if (z < depth[k]) { depth[k] = z; owner[k] = tr.id; }
      }
    } else { // painter: whole triangles sorted by mean depth, far first; later ones overwrite
      const order = tris.slice().sort((a, b) => (b.z[0] + b.z[1] + b.z[2]) - (a.z[0] + a.z[1] + a.z[2]));
      for (const tr of order) for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
        const p = [(i + 0.5) / N, (j + 0.5) / N]; if (!inside(tr.v, p)) continue;
        const k = j * N + i; depth[k] = zAt(tr, p); owner[k] = tr.id;
      }
    }
    return { owner, depth };
  }
  function compareMethods(N, tilt, shift) {
    const zb = renderDepth(N, tilt, shift, 'zbuffer'), pa = renderDepth(N, tilt, shift, 'painter');
    let both = 0, wrong = 0, bNear = 0;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const p = [(i + 0.5) / N, (j + 0.5) / N], k = j * N + i;
      if (inside(TRI_A, p) && inside(TRI_B, p)) { both++; if (zb.owner[k] === 2) bNear++; }
      if (zb.owner[k] !== pa.owner[k]) wrong++;
    }
    return { both, wrong, bNear, aNear: both - bNear };
  }

  /* ---------- step 4: shading a sphere ---------- */
  function lightDir(azDeg, elDeg) { const a = azDeg * DEG, e = elDeg * DEG; return [Math.sin(a) * Math.cos(e), Math.sin(e), Math.cos(a) * Math.cos(e)]; }
  const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  // Intensity at a unit normal n: ambient + (1 − ambient)·max(0, n·l) + specular (Blinn–Phong, viewer on +z).
  function shade(n, l, ambient, shininess) {
    const ndl = dot3(n, l);
    let I = ambient + (1 - ambient) * Math.max(0, ndl);
    if (shininess > 0 && ndl > 0) {
      const h = [l[0], l[1], l[2] + 1], hl = Math.hypot(...h);
      if (hl > 1e-12) I += 0.6 * Math.pow(Math.max(0, dot3(n, h) / hl), shininess);
    }
    return { I: Math.min(1, I), ndl };
  }
  // Sphere of radius 1 seen from +z on an N × N raster covering [−1.05, 1.05]².
  function renderSphere(N, l, ambient, shininess) {
    const px = [], ext = 1.05;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const x = -ext + (i + 0.5) * 2 * ext / N, y = -ext + (j + 0.5) * 2 * ext / N, r2 = x * x + y * y;
      if (r2 > 1) continue;
      const n = [x, y, Math.sqrt(1 - r2)], s = shade(n, l, ambient, shininess);
      px.push({ i, j, n, I: s.I, ndl: s.ndl });
    }
    return px;
  }
  const litFraction = px => px.filter(p => p.ndl > 0).length / px.length;

  /* ---------- step 5: coverage and supersampling ---------- */
  // Exact area of triangle ∩ pixel square (Sutherland–Hodgman clipping).
  function clipArea(tri, x0, y0, x1, y1) {
    let poly = ccw(tri).map(p => p.slice());
    const planes = [[p => p[0] - x0, 0, x0], [p => x1 - p[0], 0, x1], [p => p[1] - y0, 1, y0], [p => y1 - p[1], 1, y1]];
    for (const [f, ax, c] of planes) {
      const out = [];
      for (let k = 0; k < poly.length; k++) {
        const P = poly[k], Q = poly[(k + 1) % poly.length], fp = f(P), fq = f(Q);
        if (fp >= 0) out.push(P);
        if ((fp >= 0) !== (fq >= 0)) { const tt = fp / (fp - fq); const R = [P[0] + (Q[0] - P[0]) * tt, P[1] + (Q[1] - P[1]) * tt]; R[ax] = c; out.push(R); }
      }
      poly = out; if (!poly.length) return 0;
    }
    let a = 0; for (let k = 0; k < poly.length; k++) { const P = poly[k], Q = poly[(k + 1) % poly.length]; a += P[0] * Q[1] - Q[0] * P[1]; }
    return Math.abs(a) / 2;
  }
  const SLIVER = [[0.03, 0.31], [0.97, 0.5], [0.08, 0.43]];
  const shiftTri = (tri, dy) => tri.map(p => [p[0], p[1] + dy]);
  // Per-pixel coverage with an n × n grid of samples per pixel (spp = n²).
  function coverage(tri, N, n) {
    const out = new Float64Array(N * N);
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      let c = 0;
      for (let b = 0; b < n; b++) for (let a = 0; a < n; a++) if (inside(tri, [(i + (a + 0.5) / n) / N, (j + (b + 0.5) / n) / N])) c++;
      out[j * N + i] = c / (n * n);
    }
    return out;
  }
  function exactCoverage(tri, N) {
    const out = new Float64Array(N * N), px = 1 / (N * N);
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) out[j * N + i] = clipArea(tri, i / N, j / N, (i + 1) / N, (j + 1) / N) / px;
    return out;
  }
  // Mean |sampled − exact| over the pixels the triangle touches (exact coverage > 0).
  function aaError(tri, N, n) {
    const c = coverage(tri, N, n), e = exactCoverage(tri, N);
    let s = 0, m = 0, worst = 0;
    for (let k = 0; k < c.length; k++) if (e[k] > 0) { const d = Math.abs(c[k] - e[k]); s += d; m++; worst = Math.max(worst, d); }
    return { mean: s / m, worst, touched: m, c, e };
  }
  const SPP_N = [1, 2, 4, 8, 16]; // samples per pixel = n²

  const api = { DEG, mul, apply, rot, scale, trans, compose, SHAPE, POSTS, POST_H, project, edge, area, ccw, inside, edgeValues, rasterize, count, bary, TRI_A, TRI_B, depthsA, depthsB, renderDepth, compareMethods, lightDir, dot3, shade, renderSphere, litFraction, clipArea, SLIVER, shiftTri, coverage, exactCoverage, aaError, SPP_N };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GFX_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
