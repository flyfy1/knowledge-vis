/* How three.js draws a scene: the page's models.
   Each function below reimplements, at small scale, what three.js r187 (npm three@0.187.0, tag r187, commit
   7e89746a687bb88271253698fa108b1dd59825d0, released 2026-10-30) does in the file named beside it. Where the code is
   copied in substance the comment says "as in <file>"; where it is simplified the comment says what is left out.
   tools/crosscheck.cjs runs the same inputs through three.js itself and compares. BRIEF.md lists file and line.
   Nothing here loads three.js or any other library.
   Anything chosen for a model rather than read from a source is marked TUNED.
   UMD: window.ThreeSceneModels in the browser, module.exports in node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ThreeSceneModels = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const SRC = { release: 'r187', npm: '0.187.0', commit: '7e89746a687bb88271253698fa108b1dd59825d0', date: '2026-10-30' };

  /* ───────── small vector helpers ───────── */
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const scale = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const len = a => Math.sqrt(dot(a, a));
  const norm = a => { const l = len(a); return l > 0 ? scale(a, 1 / l) : [0, 0, 0]; };
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const saturate = x => clamp(x, 0, 1);

  /* ───────── Matrix4: 16 numbers, column-major, as Matrix4.elements ───────── */
  const m4 = () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  // as Matrix4.multiplyMatrices(a, b): the result is a·b
  function m4mul(a, b) {
    const r = new Array(16);
    for (let c = 0; c < 4; c++) for (let row = 0; row < 4; row++) {
      let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + row] * b[c * 4 + k]; r[c * 4 + row] = s;
    }
    return r;
  }
  // as Matrix4.compose(position, quaternion, scale)
  function m4compose(p, q, s) {
    const [x, y, z, w] = q, x2 = x + x, y2 = y + y, z2 = z + z;
    const xx = x * x2, xy = x * y2, xz = x * z2, yy = y * y2, yz = y * z2, zz = z * z2, wx = w * x2, wy = w * y2, wz = w * z2;
    return [
      (1 - (yy + zz)) * s[0], (xy + wz) * s[0], (xz - wy) * s[0], 0,
      (xy - wz) * s[1], (1 - (xx + zz)) * s[1], (yz + wx) * s[1], 0,
      (xz + wy) * s[2], (yz - wx) * s[2], (1 - (xx + yy)) * s[2], 0,
      p[0], p[1], p[2], 1];
  }
  // as Matrix4.invert (gl-matrix cofactors)
  function m4invert(te) {
    const n11 = te[0], n21 = te[1], n31 = te[2], n41 = te[3], n12 = te[4], n22 = te[5], n32 = te[6], n42 = te[7];
    const n13 = te[8], n23 = te[9], n33 = te[10], n43 = te[11], n14 = te[12], n24 = te[13], n34 = te[14], n44 = te[15];
    const t1 = n11 * n22 - n21 * n12, t2 = n11 * n32 - n31 * n12, t3 = n11 * n42 - n41 * n12, t4 = n21 * n32 - n31 * n22;
    const t5 = n21 * n42 - n41 * n22, t6 = n31 * n42 - n41 * n32, t7 = n13 * n24 - n23 * n14, t8 = n13 * n34 - n33 * n14;
    const t9 = n13 * n44 - n43 * n14, t10 = n23 * n34 - n33 * n24, t11 = n23 * n44 - n43 * n24, t12 = n33 * n44 - n43 * n34;
    const det = t1 * t12 - t2 * t11 + t3 * t10 + t4 * t9 - t5 * t8 + t6 * t7;
    if (det === 0) return new Array(16).fill(0);
    const d = 1 / det;
    return [
      (n22 * t12 - n32 * t11 + n42 * t10) * d, (n31 * t11 - n21 * t12 - n41 * t10) * d, (n24 * t6 - n34 * t5 + n44 * t4) * d, (n33 * t5 - n23 * t6 - n43 * t4) * d,
      (n32 * t9 - n12 * t12 - n42 * t8) * d, (n11 * t12 - n31 * t9 + n41 * t8) * d, (n34 * t3 - n14 * t6 - n44 * t2) * d, (n13 * t6 - n33 * t3 + n43 * t2) * d,
      (n12 * t11 - n22 * t9 + n42 * t7) * d, (n21 * t9 - n11 * t11 - n41 * t7) * d, (n14 * t5 - n24 * t3 + n44 * t1) * d, (n23 * t3 - n13 * t5 - n43 * t1) * d,
      (n22 * t8 - n12 * t10 - n32 * t7) * d, (n11 * t10 - n21 * t8 + n31 * t7) * d, (n24 * t2 - n14 * t4 - n34 * t1) * d, (n13 * t4 - n23 * t2 + n33 * t1) * d];
  }
  // as Matrix4.makePerspective (WebGL coordinate system; reversed depth when asked)
  function m4perspective(l, r, t, b, n, f, reversed) {
    const x = 2 * n / (r - l), y = 2 * n / (t - b), a = (r + l) / (r - l), bb = (t + b) / (t - b);
    const c = reversed ? n / (f - n) : -(f + n) / (f - n);
    const d = reversed ? (f * n) / (f - n) : (-2 * f * n) / (f - n);
    return [x, 0, 0, 0, 0, y, 0, 0, a, bb, c, -1, 0, 0, d, 0];
  }
  // as PerspectiveCamera.updateProjectionMatrix (no view offset, no film offset)
  function cameraProjection(cam) {
    const near = cam.near, top = near * Math.tan(Math.PI / 180 * 0.5 * cam.fov) / (cam.zoom || 1);
    const height = 2 * top, width = cam.aspect * height, left = -0.5 * width;
    return m4perspective(left, left + width, top, top - height, near, cam.far, !!cam.reversed);
  }
  // as Vector4.applyMatrix4 (no divide)
  const m4v4 = (e, v) => [
    e[0] * v[0] + e[4] * v[1] + e[8] * v[2] + e[12] * v[3], e[1] * v[0] + e[5] * v[1] + e[9] * v[2] + e[13] * v[3],
    e[2] * v[0] + e[6] * v[1] + e[10] * v[2] + e[14] * v[3], e[3] * v[0] + e[7] * v[1] + e[11] * v[2] + e[15] * v[3]];
  // as Vector3.applyMatrix4 (divides by w)
  function m4point(e, p) { const v = m4v4(e, [p[0], p[1], p[2], 1]); const w = 1 / v[3]; return [v[0] * w, v[1] * w, v[2] * w]; }
  // as Vector3.transformDirection
  function m4dir(e, d) { return norm([e[0] * d[0] + e[4] * d[1] + e[8] * d[2], e[1] * d[0] + e[5] * d[1] + e[9] * d[2], e[2] * d[0] + e[6] * d[1] + e[10] * d[2]]); }
  // as Matrix4.getMaxScaleOnAxis
  const maxScaleOnAxis = te => Math.sqrt(Math.max(te[0] * te[0] + te[1] * te[1] + te[2] * te[2], te[4] * te[4] + te[5] * te[5] + te[6] * te[6], te[8] * te[8] + te[9] * te[9] + te[10] * te[10]));
  // a look-at camera world matrix (as Object3D.lookAt for a camera: −z toward the target, up = +y)
  function lookAtWorld(eye, target, up) {
    up = up || [0, 1, 0];
    let z = norm(sub(eye, target)); if (len(z) === 0) z = [0, 0, 1];
    let x = cross(up, z); if (len(x) === 0) x = cross([0, 0, 1], z); x = norm(x);
    const y = cross(z, x);
    return [x[0], x[1], x[2], 0, y[0], y[1], y[2], 0, z[0], z[1], z[2], 0, eye[0], eye[1], eye[2], 1];
  }

  /* ───────── Quaternion ───────── */
  // as Quaternion.setFromAxisAngle (axis normalised)
  const qAxis = (axis, ang) => { const s = Math.sin(ang / 2), a = norm(axis); return [a[0] * s, a[1] * s, a[2] * s, Math.cos(ang / 2)]; };
  // as Quaternion.setFromEuler, order 'XYZ' (Euler's default)
  function qEuler(x, y, z) {
    const c1 = Math.cos(x / 2), c2 = Math.cos(y / 2), c3 = Math.cos(z / 2), s1 = Math.sin(x / 2), s2 = Math.sin(y / 2), s3 = Math.sin(z / 2);
    return [s1 * c2 * c3 + c1 * s2 * s3, c1 * s2 * c3 - s1 * c2 * s3, c1 * c2 * s3 + s1 * s2 * c3, c1 * c2 * c3 - s1 * s2 * s3];
  }
  // as Quaternion.multiplyQuaternions(a, b)
  function qMul(a, b) {
    const [ax, ay, az, aw] = a, [bx, by, bz, bw] = b;
    return [ax * bw + aw * bx + ay * bz - az * by, ay * bw + aw * by + az * bx - ax * bz, az * bw + aw * bz + ax * by - ay * bx, aw * bw - ax * bx - ay * by - az * bz];
  }
  const qDot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
  // as Quaternion.slerp / slerpFlat: shortest arc, lerp + normalise when dot ≥ 0.9995
  function qSlerp(a, b, t) {
    let [x, y, z, w] = b, d = qDot(a, b);
    if (d < 0) { x = -x; y = -y; z = -z; w = -w; d = -d; }
    let s = 1 - t;
    if (d < 0.9995) {
      const th = Math.acos(d), sn = Math.sin(th);
      s = Math.sin(s * th) / sn; t = Math.sin(t * th) / sn;
      return [a[0] * s + x * t, a[1] * s + y * t, a[2] * s + z * t, a[3] * s + w * t];
    }
    const r = [a[0] * s + x * t, a[1] * s + y * t, a[2] * s + z * t, a[3] * s + w * t], l = Math.hypot(...r);
    return r.map(v => v / l);
  }
  // rotation angle between two orientations (radians, 0…π)
  const qAngle = (a, b) => 2 * Math.acos(Math.min(1, Math.abs(qDot(a, b))));
  // rotate a vector by a unit quaternion
  function qRotate(q, v) { const m = m4compose([0, 0, 0], q, [1, 1, 1]); return [m[0] * v[0] + m[4] * v[1] + m[8] * v[2], m[1] * v[0] + m[5] * v[1] + m[9] * v[2], m[2] * v[0] + m[6] * v[1] + m[10] * v[2]]; }

  /* ═════════ ch2: the scene graph ═════════
     as Object3D.updateMatrix / updateMatrixWorld: every frame, renderer.render() calls scene.updateMatrixWorld(); a node
     with matrixAutoUpdate (default true) recomposes its local matrix from position, quaternion and scale, which sets
     matrixWorldNeedsUpdate, so its world matrix and every descendant's are recomputed. */
  function node(name, o) {
    o = o || {};
    return { name, position: o.position || [0, 0, 0], quaternion: o.quaternion || [0, 0, 0, 1], scale: o.scale || [1, 1, 1],
      matrix: m4(), matrixWorld: m4(), children: [], parent: null, matrixAutoUpdate: o.matrixAutoUpdate !== false,
      matrixWorldAutoUpdate: true, matrixWorldNeedsUpdate: false };
  }
  function addChild(p, c) { c.parent = p; p.children.push(c); return c; }
  function updateMatrix(n, stats) { n.matrix = m4compose(n.position, n.quaternion, n.scale); n.matrixWorldNeedsUpdate = true; if (stats) stats.compose++; }
  function updateMatrixWorld(n, force, stats) {
    if (n.matrixAutoUpdate) updateMatrix(n, stats);
    if (n.matrixWorldNeedsUpdate || force) {
      if (n.matrixWorldAutoUpdate === true) { n.matrixWorld = n.parent === null ? n.matrix.slice() : m4mul(n.parent.matrixWorld, n.matrix); if (stats && n.parent !== null) stats.world++; }   // the root copies, every other node multiplies
      n.matrixWorldNeedsUpdate = false; force = true;
    }
    for (const c of n.children) updateMatrixWorld(c, force, stats);
  }
  const worldPos = n => [n.matrixWorld[12], n.matrixWorld[13], n.matrixWorld[14]];
  /* The ch2 tree: scene → sun; sun → earthOrbit (a pivot that turns) → earth (5 units out, scaled) → moonOrbit → moon (2 out).
     TUNED: the distances, the earth's scale and the 12:1 orbit ratio are chosen for the picture, not astronomy. */
  const ORRERY = { earthR: 5, moonR: 2, moonRate: 12 };
  function orrery(day, o) {
    o = o || {};
    const es = o.earthScale == null ? 0.5 : o.earthScale, statics = !!o.staticSun;
    const scene = node('scene'), sun = addChild(scene, node('sun', { matrixAutoUpdate: !statics }));
    const eo = addChild(sun, node('earthOrbit', { quaternion: qAxis([0, 1, 0], day) }));
    const earth = addChild(eo, node('earth', { position: [ORRERY.earthR, 0, 0], scale: [es, es, es] }));
    const mo = addChild(earth, node('moonOrbit', { quaternion: qAxis([0, 1, 0], day * ORRERY.moonRate) }));
    const moon = addChild(mo, node('moon', { position: [ORRERY.moonR, 0, 0], scale: [0.5, 0.5, 0.5] }));
    return { scene, sun, eo, earth, mo, moon, all: [scene, sun, eo, earth, mo, moon] };
  }
  // one frame: set the angle, (optionally read before the update), then render's updateMatrixWorld
  function orreryFrame(dayPrev, day, o) {
    const t = orrery(dayPrev, o), stats = { compose: 0, world: 0 };
    updateMatrixWorld(t.scene, false, null);              // the previous frame left matrices up to date
    t.eo.quaternion = qAxis([0, 1, 0], day); t.mo.quaternion = qAxis([0, 1, 0], day * ORRERY.moonRate);
    const stale = worldPos(t.moon);                        // reading matrixWorld now gives last frame's answer
    updateMatrixWorld(t.scene, false, stats);              // what renderer.render() does first
    const fresh = worldPos(t.moon);
    return { tree: t, stale, fresh, lag: len(sub(fresh, stale)), stats, moonOrbitR: len(sub(fresh, worldPos(t.earth))) };
  }

  /* ═════════ ch3: geometry ═════════ */
  // as BoxGeometry (buildPlane × 6, faces px nx py ny pz nz)
  function boxGeometry(width, height, depth, ws, hs, ds) {
    width = width || 1; height = height || 1; depth = depth || 1;
    ws = Math.floor(ws || 1); hs = Math.floor(hs || 1); ds = Math.floor(ds || 1);
    const pos = [], nor = [], uv = [], idx = []; let nv = 0;
    function plane(u, v, w, udir, vdir, W, H, D, gx, gy) {
      const sw = W / gx, sh = H / gy, gx1 = gx + 1, gy1 = gy + 1; let cnt = 0;
      const K = { x: 0, y: 1, z: 2 };
      for (let iy = 0; iy < gy1; iy++) {
        const y = iy * sh - H / 2;
        for (let ix = 0; ix < gx1; ix++) {
          const x = ix * sw - W / 2, vec = [0, 0, 0];
          vec[K[u]] = x * udir; vec[K[v]] = y * vdir; vec[K[w]] = D / 2; pos.push(...vec);
          const n = [0, 0, 0]; n[K[w]] = D > 0 ? 1 : -1; nor.push(...n);
          uv.push(ix / gx, 1 - iy / gy); cnt++;
        }
      }
      for (let iy = 0; iy < gy; iy++) for (let ix = 0; ix < gx; ix++) {
        const a = nv + ix + gx1 * iy, b = nv + ix + gx1 * (iy + 1), c = nv + (ix + 1) + gx1 * (iy + 1), d = nv + (ix + 1) + gx1 * iy;
        idx.push(a, b, d, b, c, d);
      }
      nv += cnt;
    }
    plane('z', 'y', 'x', -1, -1, depth, height, width, ds, hs);
    plane('z', 'y', 'x', 1, -1, depth, height, -width, ds, hs);
    plane('x', 'z', 'y', 1, 1, width, depth, height, ws, ds);
    plane('x', 'z', 'y', 1, -1, width, depth, -height, ws, ds);
    plane('x', 'y', 'z', 1, -1, width, height, depth, ws, hs);
    plane('x', 'y', 'z', -1, -1, width, height, -depth, ws, hs);
    return { position: pos, normal: nor, uv, index: idx };
  }
  // as SphereGeometry (full sphere: no triangles at the two poles' degenerate halves)
  function sphereGeometry(radius, ws, hs) {
    radius = radius || 1; ws = Math.max(3, Math.floor(ws || 32)); hs = Math.max(2, Math.floor(hs || 16));
    const pos = [], nor = [], uv = [], idx = [], grid = []; let index = 0;
    for (let iy = 0; iy <= hs; iy++) {
      const row = [], v = iy / hs, theta = v * Math.PI, y = radius * Math.cos(theta), rr = Math.sqrt(radius * radius - y * y);
      const uOff = iy === 0 ? 0.5 / ws : iy === hs ? -0.5 / ws : 0;
      for (let ix = 0; ix <= ws; ix++) {
        const u = ix / ws, phi = u * Math.PI * 2, p = [-rr * Math.cos(phi), y, rr * Math.sin(phi)];
        pos.push(...p); nor.push(...norm(p)); uv.push(u + uOff, 1 - v); row.push(index++);
      }
      grid.push(row);
    }
    for (let iy = 0; iy < hs; iy++) for (let ix = 0; ix < ws; ix++) {
      const a = grid[iy][ix + 1], b = grid[iy][ix], c = grid[iy + 1][ix], d = grid[iy + 1][ix + 1];
      if (iy !== 0) idx.push(a, b, d);
      if (iy !== hs - 1) idx.push(b, c, d);
    }
    return { position: pos, normal: nor, uv, index: idx };
  }
  // closed forms of the two builders above (tests check them against the arrays)
  const boxCounts = (ws, hs, ds) => ({ vertices: 2 * ((ds + 1) * (hs + 1) + (ws + 1) * (ds + 1) + (ws + 1) * (hs + 1)), triangles: 4 * (ds * hs + ws * ds + ws * hs) });
  const sphereCounts = (ws, hs) => ({ vertices: (ws + 1) * (hs + 1), triangles: 2 * ws * (hs - 1) });
  // bytes on the GPU: Float32 position (3), normal (3), uv (2) = 32 bytes per vertex; the index is Uint16 unless a
  // value reaches 65535 (as utils.js arrayNeedsUint32, kept below the primitive-restart index), then Uint32.
  function geomBytes(vertices, triangles) {
    const u32 = vertices - 1 >= 65535, ib = u32 ? 4 : 2;
    return { perVertex: 32, vertexBytes: vertices * 32, indexType: u32 ? 'Uint32' : 'Uint16', indexBytes: triangles * 3 * ib, total: vertices * 32 + triangles * 3 * ib };
  }

  /* ═════════ ch4: the camera chain ═════════ */
  const DEFAULT_CAM = { fov: 50, aspect: 16 / 9, near: 0.1, far: 2000 };   // PerspectiveCamera defaults (fov 50, near 0.1, far 2000); aspect TUNED
  // carry a view-space point through projection, divide, viewport (OpenGL ES 3.0 §2.13, §2.13.1 with depth range 0…1)
  function chain(o) {
    const P = cameraProjection(o), v = o.point, clip = m4v4(P, [v[0], v[1], v[2], 1]);
    const ndc = [clip[0] / clip[3], clip[1] / clip[3], clip[2] / clip[3]];
    const W = o.width || 1280, H = o.height || 720;
    const win = [W / 2 * ndc[0] + W / 2, H / 2 * ndc[1] + H / 2, 0.5 * ndc[2] + 0.5];
    const bits = o.depthBits || 24, q = Math.round(win[2] * (Math.pow(2, bits) - 1));
    const inside = Math.abs(clip[0]) <= clip[3] && Math.abs(clip[1]) <= clip[3] && Math.abs(clip[2]) <= clip[3];
    return { P, clip, ndc, win, depthInt: q, inside };
  }
  /* Depth precision: the smallest separation two surfaces at distance D can have and still get different stored depths.
     standard: WebGL's −1…1 clip depth mapped to 0…1, stored as a b-bit integer (Δ = (f−n)D² / (f n (2^b − 1)));
     reversed: three's reversed projection (near → 1, far → 0, needs EXT_clip_control) into a 32-bit float depth buffer
       (Δ = ulp of the stored value / |dz/dD|);
     log: three's logarithmicDepthBuffer, gl_FragDepth = log2(1 + D) / log2(far + 1), stored as a b-bit integer.
     The model uses the derivative at D; it ignores the float error of computing z itself. */
  function ulp32(x) { if (x <= 0) return Math.pow(2, -149); const e = Math.floor(Math.log2(x)); return Math.pow(2, Math.max(e, -126) - 23); }
  function depthStep(D, near, far, scheme, bits) {
    bits = bits || 24; const Q = Math.pow(2, bits) - 1;
    if (scheme === 'reversed') { const z = near * (far - D) / (D * (far - near)), dz = far * near / ((far - near) * D * D); return ulp32(z) / dz; }
    if (scheme === 'log') return (1 + D) * Math.log(far + 1) / Q;
    return (far - near) * D * D / (far * near * Q);
  }
  // the distance at which two surfaces `sep` apart start sharing a depth value (bisection on depthStep = sep)
  function zFightFrom(sep, near, far, scheme, bits) {
    let lo = near, hi = far;
    if (depthStep(hi, near, far, scheme, bits) < sep) return Infinity;
    if (depthStep(lo, near, far, scheme, bits) >= sep) return lo;
    for (let i = 0; i < 200; i++) { const m = Math.sqrt(lo * hi); if (depthStep(m, near, far, scheme, bits) < sep) lo = m; else hi = m; }
    return Math.sqrt(lo * hi);
  }
  // window depth of view distance D under the standard mapping (fraction of the 0…1 range)
  const depthStd = (D, near, far) => 0.5 * ((far + near) / (far - near) - 2 * far * near / ((far - near) * D)) + 0.5;

  /* ═════════ ch5: culling and the render lists ═════════ */
  // as Frustum.setFromProjectionMatrix (WebGL coordinate system): planes right, left, bottom, top, far, near; normalised
  function frustumPlanes(m, reversed) {
    const me = m, P = (a, b, c, d) => { const l = Math.hypot(a, b, c); return { n: [a / l, b / l, c / l], c: d / l }; };
    const pl = [
      P(me[3] - me[0], me[7] - me[4], me[11] - me[8], me[15] - me[12]),
      P(me[3] + me[0], me[7] + me[4], me[11] + me[8], me[15] + me[12]),
      P(me[3] + me[1], me[7] + me[5], me[11] + me[9], me[15] + me[13]),
      P(me[3] - me[1], me[7] - me[5], me[11] - me[9], me[15] - me[13])];
    if (reversed) { pl.push(P(me[2], me[6], me[10], me[14]), P(me[3] - me[2], me[7] - me[6], me[11] - me[10], me[15] - me[14])); }
    else { pl.push(P(me[3] - me[2], me[7] - me[6], me[11] - me[10], me[15] - me[14]), P(me[3] + me[2], me[7] + me[6], me[11] + me[10], me[15] + me[14])); }
    return pl;
  }
  // as Frustum.intersectsSphere: false only if the centre is more than r behind one plane
  function intersectsSphere(planes, c, r) { for (const p of planes) if (dot(p.n, c) + p.c < -r) return false; return true; }
  // as painterSortStable / reversePainterSortStable in WebGLRenderLists.js
  function painterSortStable(a, b) {
    if (a.groupOrder !== b.groupOrder) return a.groupOrder - b.groupOrder;
    if (a.renderOrder !== b.renderOrder) return a.renderOrder - b.renderOrder;
    if (a.material.id !== b.material.id) return a.material.id - b.material.id;
    if (a.materialVariant !== b.materialVariant) return a.materialVariant - b.materialVariant;
    if (a.z !== b.z) return a.z - b.z;
    return a.id - b.id;
  }
  function reversePainterSortStable(a, b) {
    if (a.groupOrder !== b.groupOrder) return a.groupOrder - b.groupOrder;
    if (a.renderOrder !== b.renderOrder) return a.renderOrder - b.renderOrder;
    if (a.z !== b.z) return b.z - a.z;
    return a.id - b.id;
  }
  /* The ch5 scene, seen from above: 18 objects on the floor, all centred at the camera's height, so the 3D sphere test
     and the exact test reduce to the floor plane (see BRIEF). Material ids 0–2 are opaque (stone, wood, brass), 3 is
     glass (transparent). TUNED: positions and radii. Object ids follow scene order, as Object3D.id does. */
  const CULL_SCENE = [
    [-6, -4, 0.8, 0], [-3, -6, 0.7, 1], [0, -5, 0.9, 2], [3, -7, 0.8, 0], [6, -5, 0.7, 1],
    [-8, -11, 1.0, 2], [-4, -12, 0.8, 3], [0, -10, 0.9, 0], [4, -12, 0.8, 3], [8, -10, 1.0, 1],
    [-10, -17, 1.1, 0], [-5, -18, 0.9, 1], [1, -16, 1.0, 3], [6, -18, 0.9, 2], [11, -16, 1.2, 0],
    [-13, -2, 0.9, 1], [12, -1, 0.9, 2], [0, 3, 0.8, 0]
  ].map(([x, z, r, m], i) => ({ id: i + 1, x, z, r, mat: m, transparent: m === 3 }));
  const CULL_MATS = [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3, transparent: true }];
  // exact: does a circle meet the convex polygon (the frustum's horizontal slice)?
  function circleMeetsPolygon(c, r, poly) {
    let pos = 0, neg = 0;
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length], e = [b[0] - a[0], b[1] - a[1]];
      const cr = e[0] * (c[1] - a[1]) - e[1] * (c[0] - a[0]); if (cr > 0) pos++; else if (cr < 0) neg++;
      const L = e[0] * e[0] + e[1] * e[1], t = clamp(((c[0] - a[0]) * e[0] + (c[1] - a[1]) * e[1]) / L, 0, 1);
      const dx = a[0] + t * e[0] - c[0], dy = a[1] + t * e[1] - c[1];
      if (dx * dx + dy * dy <= r * r) return true;
    }
    return pos === 0 || neg === 0;
  }
  // one frame of projectObject + sort for the floor scene; camera at (cx, 0, cz) turned by yaw (radians, 0 = looking −z)
  function cullFrame(o) {
    const cam = { fov: o.fov, aspect: o.aspect || 16 / 9, near: o.near || 0.5, far: o.far };
    const eye = [o.cx || 0, 0, o.cz || 6], fwd = [-Math.sin(o.yaw), 0, -Math.cos(o.yaw)];
    const world = lookAtWorld(eye, add(eye, fwd)), view = m4invert(world), proj = cameraProjection(cam);
    const pv = m4mul(proj, view), planes = frustumPlanes(pv, false);
    // the frustum's slice at camera height, as a quadrilateral (ccw seen from above in x/z → clockwise in x/−z)
    const hx = Math.tan(Math.PI / 180 * cam.fov / 2) * cam.aspect, right = [Math.cos(o.yaw), 0, -Math.sin(o.yaw)];
    const at = (d, s) => { const p = add(add(eye, scale(fwd, d)), scale(right, s * d * hx)); return [p[0], p[2]]; };
    const poly = [at(cam.near, -1), at(cam.near, 1), at(cam.far, 1), at(cam.far, -1)];
    const items = [], culled = [], falsePos = [];
    for (const ob of o.scene || CULL_SCENE) {
      const c = [ob.x, 0, ob.z], pass = intersectsSphere(planes, c, ob.r);
      const exact = circleMeetsPolygon([ob.x, ob.z], ob.r, poly);
      if (!pass) { culled.push(ob); continue; }
      if (!exact) falsePos.push(ob);
      const v = m4v4(pv, [c[0], c[1], c[2], 1]);
      items.push({ id: ob.id, ob, groupOrder: 0, renderOrder: 0, material: CULL_MATS[ob.mat], materialVariant: 0, z: v[2] });
    }
    const opaque = items.filter(i => !i.material.transparent), transparent = items.filter(i => i.material.transparent);
    if (o.sort !== false) { opaque.sort(painterSortStable); transparent.sort(reversePainterSortStable); }
    const order = opaque.concat(transparent);
    let switches = 0; for (let i = 1; i < order.length; i++) if (order[i].material.id !== order[i - 1].material.id) switches++;
    // opaque pairs drawn far-before-near within a material (overdraw the depth test cannot save)
    let backToFront = 0;
    for (let i = 0; i < opaque.length; i++) for (let j = i + 1; j < opaque.length; j++) if (opaque[j].z < opaque[i].z) backToFront++;
    return { planes, poly, eye, fwd, opaque, transparent, culled, falsePos, switches, backToFront, visible: items.length, pv };
  }

  /* ═════════ ch6: program cache keys ═════════
     as WebGLPrograms.getProgramCacheKey: the key is the comma-joined list of shaderID, defines, ~50 parameters in a fixed
     order, two 32-bit masks of booleans and the output colour space. getParameters (material + scene → parameters) is
     simplified here to the features the lab toggles; every other parameter keeps the value it has for a plain mesh. */
  const KEY_PARAMS = ['precision', 'outputColorSpace', 'envMapMode', 'envMapPMREM', 'envMapMaxLod', 'envMapSize', 'mapUv', 'alphaMapUv', 'lightMapUv', 'aoMapUv', 'bumpMapUv', 'normalMapUv', 'displacementMapUv', 'emissiveMapUv', 'metalnessMapUv', 'roughnessMapUv', 'anisotropyMapUv', 'clearcoatMapUv', 'clearcoatNormalMapUv', 'clearcoatRoughnessMapUv', 'diffuseRoughnessMapUv', 'iridescenceMapUv', 'iridescenceThicknessMapUv', 'sheenColorMapUv', 'sheenRoughnessMapUv', 'specularMapUv', 'specularColorMapUv', 'specularIntensityMapUv', 'transmissionMapUv', 'thicknessMapUv', 'combine', 'fogExp2', 'sizeAttenuation', 'morphTargetsCount', 'numSunLights', 'numDirLights', 'numPointLights', 'numSpotLights', 'numSpotLightMaps', 'numHemiLights', 'numRectAreaLights', 'numSunLightShadows', 'numDirLightShadows', 'numPointLightShadows', 'numSpotLightShadows', 'numSpotLightShadowsWithMaps', 'numLightProbes', 'numLightProbeGrids', 'shadowMapType', 'toneMapping', 'numClippingPlanes', 'numClipIntersection', 'depthPacking'];
  const MASK1 = ['instancing', 'instancingColor', 'instancingMorph', 'matcap', 'envMap', 'normalMapObjectSpace', 'normalMapTangentSpace', 'clearcoat', 'iridescence', 'alphaTest', 'vertexColors', 'vertexAlphas', 'vertexUv1s', 'vertexUv2s', 'vertexUv3s', 'vertexTangents', 'anisotropy', 'alphaHash', 'batching', 'dispersion', 'batchingColor', 'gradientMap', 'packedNormalMap', 'vertexNormals', 'retroreflection', 'diffuseRoughness'];
  const MASK1_BIT = { instancing: 0, instancingColor: 1, instancingMorph: 2, matcap: 3, envMap: 4, normalMapObjectSpace: 5, normalMapTangentSpace: 6, clearcoat: 7, iridescence: 8, alphaTest: 9, vertexColors: 10, vertexAlphas: 11, vertexUv1s: 12, vertexUv2s: 13, vertexUv3s: 14, vertexTangents: 15, anisotropy: 16, alphaHash: 17, batching: 18, dispersion: 19, batchingColor: 20, gradientMap: 21, packedNormalMap: 22, vertexNormals: 23, retroreflection: 24, diffuseRoughness: 25 };
  const MASK2_BIT = { fog: 0, useFog: 1, flatShading: 2, logarithmicDepthBuffer: 3, reversedDepthBuffer: 4, skinning: 5, morphTargets: 6, morphNormals: 7, morphColors: 8, premultipliedAlpha: 9, shadowMapEnabled: 10, doubleSided: 11, flipSided: 12, useDepthPacking: 13, dithering: 14, transmission: 15, sheen: 16, opaque: 17, pointsUvs: 18, decodeVideoTexture: 19, decodeVideoTextureEmissive: 20, alphaToCoverage: 21, hasPositionAttribute: 23 };
  const SHADER_IDS = { MeshBasicMaterial: 'basic', MeshLambertMaterial: 'lambert', MeshPhongMaterial: 'phong', MeshStandardMaterial: 'physical', MeshPhysicalMaterial: 'physical' };
  // the parameters a material gets in a scene (simplified getParameters)
  function programParameters(mat, s) {
    const p = { shaderID: SHADER_IDS[mat.type], isRawShaderMaterial: false, defines: mat.type === 'MeshPhysicalMaterial' ? { STANDARD: '', PHYSICAL: '' } : mat.type === 'MeshStandardMaterial' ? { STANDARD: '' } : undefined, customProgramCacheKey: '' };
    for (const k of KEY_PARAMS) p[k] = undefined;
    Object.assign(p, { precision: 'highp', outputColorSpace: 'srgb', envMapMode: false, envMapPMREM: false, envMapMaxLod: undefined, envMapSize: undefined,
      mapUv: mat.map ? 'uv' : false, alphaMapUv: false, lightMapUv: false, aoMapUv: false, bumpMapUv: false, normalMapUv: false, displacementMapUv: false, emissiveMapUv: false, metalnessMapUv: false, roughnessMapUv: false, anisotropyMapUv: false, clearcoatMapUv: false, clearcoatNormalMapUv: false, clearcoatRoughnessMapUv: false, diffuseRoughnessMapUv: false, iridescenceMapUv: false, iridescenceThicknessMapUv: false, sheenColorMapUv: false, sheenRoughnessMapUv: false, specularMapUv: false, specularColorMapUv: false, specularIntensityMapUv: false, transmissionMapUv: false, thicknessMapUv: false,
      combine: mat.type === 'MeshBasicMaterial' || mat.type === 'MeshLambertMaterial' || mat.type === 'MeshPhongMaterial' ? 0 : undefined,
      fogExp2: false, sizeAttenuation: false, morphTargetsCount: 0,
      numSunLights: 0, numDirLights: s.dir, numPointLights: s.point, numSpotLights: 0, numSpotLightMaps: 0, numHemiLights: 0, numRectAreaLights: 0,
      numSunLightShadows: 0, numDirLightShadows: s.shadows ? s.dir : 0, numPointLightShadows: 0, numSpotLightShadows: 0, numSpotLightShadowsWithMaps: 0,
      numLightProbes: 0, numLightProbeGrids: 0, shadowMapType: 1, toneMapping: s.toneMapping ? 4 : 0, numClippingPlanes: 0, numClipIntersection: 0, depthPacking: 0 });
    for (const k of MASK1) p[k] = false;
    for (const k in MASK2_BIT) p[k] = false;
    p.vertexNormals = true; p.hasPositionAttribute = true; p.vertexUv1s = false;
    p.fog = !!s.fog; p.useFog = mat.fog !== false; p.shadowMapEnabled = !!s.shadows && s.dir > 0;
    p.opaque = mat.transparent !== true; p.instancing = !!mat.instanced;
    return p;
  }
  // as getProgramCacheKey; outputColorSpace of the renderer appended as in the source
  function programCacheKey(p, rendererOutputColorSpace) {
    const arr = [];
    if (p.shaderID) arr.push(p.shaderID); else { arr.push(p.customVertexShaderID); arr.push(p.customFragmentShaderID); }
    if (p.defines !== undefined) for (const name in p.defines) { arr.push(name); arr.push(p.defines[name]); }
    if (p.isRawShaderMaterial === false) {
      for (const k of KEY_PARAMS) arr.push(p[k]);
      let m = 0; for (const k in MASK1_BIT) if (p[k]) m |= 1 << MASK1_BIT[k]; arr.push(m);
      m = 0; if (p.fog) m |= 1; if (p.useFog) m |= 2;
      for (const k in MASK2_BIT) if (k !== 'fog' && k !== 'useFog' && p[k]) m |= 1 << MASK2_BIT[k];
      if (p.numLightProbeGrids > 0) m |= 1 << 22;
      arr.push(m); arr.push(rendererOutputColorSpace || 'srgb');
    }
    arr.push(p.customProgramCacheKey);
    return arr.join();
  }
  // TUNED: the lab's six materials (two share a configuration on purpose)
  const LAB_MATERIALS = [
    { name: 'floor', type: 'MeshStandardMaterial', map: true },
    { name: 'wood', type: 'MeshStandardMaterial', map: true },
    { name: 'brass', type: 'MeshStandardMaterial' },
    { name: 'glass', type: 'MeshPhysicalMaterial', transparent: true },
    { name: 'sky', type: 'MeshBasicMaterial', fog: false },
    { name: 'leaves', type: 'MeshStandardMaterial', map: true, instanced: true }];
  function programs(state, mats) {
    mats = mats || LAB_MATERIALS;
    const keys = mats.map(m => programCacheKey(programParameters(m, state), 'srgb'));
    const distinct = [...new Set(keys)];
    return { keys, distinct: distinct.length, groups: distinct.map(k => mats.filter((m, i) => keys[i] === k).map(m => m.name)) };
  }
  /* A scene rendered in state a, then switched to state b: which materials does WebGLRenderer.setProgram (r187,
     renderers/WebGLRenderer.js ~2452-2556) send back to getProgram? Not every material whose key would differ. Only:
     a material that needs lights (materialNeedsLights: Lambert, Phong, Standard/Physical, ...) when the lights state
     changed (light counts, shadow-casting lights); a material with fog === true when scene.fog changed; and every
     tone-mapped material when renderer.toneMapping changed (needsProgramVariant). So a MeshBasicMaterial keeps its old
     program when a light is added, although a fresh key for it would hold the new light count. "shadows" here means
     turning on light.castShadow together with renderer.shadowMap.enabled (changing only shadowMap.enabled after the
     first frame recompiles nothing until material.needsUpdate). Measured with three r187 in Chromium for all 16
     combinations of the lab's switches (review 2026-11-20, specs/reviews/how-threejs-draws-a-scene-review-20261120.md). */
  function refetches(mat, a, b) {
    const lit = mat.type !== 'MeshBasicMaterial';
    const lights = a.dir !== b.dir || a.point !== b.point || (!!a.shadows && a.dir > 0) !== (!!b.shadows && b.dir > 0);
    const fog = mat.fog !== false && !!a.fog !== !!b.fog;
    const tone = !!a.toneMapping !== !!b.toneMapping;
    return (lit && lights) || fog || tone;
  }
  function programsAfter(a, b, mats) {
    mats = mats || LAB_MATERIALS;
    const ka = programs(a, mats).keys, kb = programs(b, mats).keys, old = new Set(ka);
    const keys = mats.map((m, i) => (refetches(m, a, b) ? kb[i] : ka[i])), distinct = [...new Set(keys)];
    return { keys, distinct: distinct.length, fresh: distinct.filter(k => !old.has(k)).length, refetched: mats.map(m => refetches(m, a, b)) };
  }
  // compare two states: how many programs have to be compiled when the scene switches from a to b
  function newPrograms(a, b, mats) { return programsAfter(a, b, mats).fresh; }

  /* ═════════ ch7: the colour of one pixel ═════════
     as bsdfs / common / lights_physical_pars_fragment / lights_fragment_begin / lights_physical_fragment (r187):
     specular = irradiance · F·V·D · multiScatteringCompensation, diffuse = irradiance · (color·(1−metalness))/π · (1 − F₀.₀₄),
     irradiance = (N·L) · light colour·intensity. No clearcoat, sheen, iridescence, anisotropy, environment or ambient. */
  const RECIPROCAL_PI = 0.3183098861837907, EPS = 1e-6;
  const F_Schlick = (f0, f90, dotVH) => { const fr = Math.pow(2, (-5.55473 * dotVH - 6.98316) * dotVH); return f0 * (1 - fr) + f90 * fr; };
  function V_GGX_SmithCorrelated(alpha, dotNL, dotNV) {
    const a2 = alpha * alpha, gv = dotNL * Math.sqrt(a2 + (1 - a2) * dotNV * dotNV), gl = dotNV * Math.sqrt(a2 + (1 - a2) * dotNL * dotNL);
    return 0.5 / Math.max(gv + gl, EPS);
  }
  function D_GGX(alpha, dotNH) { const a2 = alpha * alpha, den = dotNH * dotNH * (a2 - 1) + 1; return RECIPROCAL_PI * a2 / (den * den); }
  // as utils/generateDFGLUT.js integrateBRDF: Hammersley points, GGX importance sampling, Schlick (1 − v·h)^5
  function radicalInverse(bits) {
    bits = (bits << 16) | (bits >>> 16);
    bits = ((bits & 0x55555555) << 1) | ((bits & 0xAAAAAAAA) >>> 1);
    bits = ((bits & 0x33333333) << 2) | ((bits & 0xCCCCCCCC) >>> 2);
    bits = ((bits & 0x0F0F0F0F) << 4) | ((bits & 0xF0F0F0F0) >>> 4);
    bits = ((bits & 0x00FF00FF) << 8) | ((bits & 0xFF00FF00) >>> 8);
    return (bits >>> 0) * 2.3283064365386963e-10;
  }
  function integrateBRDF(NdotV, roughness, samples) {
    samples = samples || 4096;
    const V = [Math.sqrt(1 - NdotV * NdotV), 0, NdotV], a = roughness * roughness, a2r = Math.pow(roughness, 4);
    let A = 0, B = 0;
    for (let i = 0; i < samples; i++) {
      const x0 = i / samples, x1 = radicalInverse(i), phi = 2 * Math.PI * x0;
      const ct = Math.sqrt((1 - x1) / (1 + (a * a - 1) * x1)), st = Math.sqrt(1 - ct * ct);
      const H = norm([Math.sin(phi) * st, -Math.cos(phi) * st, ct]);       // N = +z: the generator's frame is tangent (0,−1,0), bitangent (1,0,0)
      const vh = dot(V, H), L = norm(sub(scale(H, 2 * vh), V));
      const NdotL = Math.max(L[2], 0), NdotH = Math.max(H[2], 0), VdotH = Math.max(vh, 0);
      if (NdotL > 0) {
        const gv = NdotL * Math.sqrt(NdotV * NdotV * (1 - a2r) + a2r), gl = NdotV * Math.sqrt(NdotL * NdotL * (1 - a2r) + a2r);
        const Vpdf = 0.5 / (gv + gl) * VdotH * NdotL / NdotH, Fc = Math.pow(1 - VdotH, 5);
        A += (1 - Fc) * Vpdf; B += Fc * Vpdf;
      }
    }
    return [4 * A / samples, 4 * B / samples];
  }
  // 16 × 16 table, texel (x, y) at roughness (x + ½)/16, N·V (y + ½)/16 (as the generator); built once
  let DFG = null, DFG_SAMPLES = 4096;
  function dfgTable(samples) {
    if (DFG && (!samples || samples === DFG_SAMPLES)) return DFG;
    DFG_SAMPLES = samples || 4096; DFG = [];
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) DFG.push(integrateBRDF((y + 0.5) / 16, (x + 0.5) / 16, DFG_SAMPLES));
    return DFG;
  }
  // texture2D(dfgLUT, vec2(roughness, dotNV)) with LinearFilter and ClampToEdge
  function dfgLookup(roughness, dotNV) {
    const T = dfgTable(), fx = clamp(roughness * 16 - 0.5, 0, 15), fy = clamp(dotNV * 16 - 0.5, 0, 15);
    const x0 = Math.floor(fx), y0 = Math.floor(fy), x1 = Math.min(15, x0 + 1), y1 = Math.min(15, y0 + 1), tx = fx - x0, ty = fy - y0;
    const g = (x, y, k) => T[y * 16 + x][k];
    const lerp2 = k => (g(x0, y0, k) * (1 - tx) + g(x1, y0, k) * tx) * (1 - ty) + (g(x0, y1, k) * (1 - tx) + g(x1, y1, k) * tx) * ty;
    return [lerp2(0), lerp2(1)];
  }
  // decode three's half-float table (tools/crosscheck.cjs compares with it)
  function halfToFloat(h) { const s = h >> 15 ? -1 : 1, e = (h >> 10) & 31, m = h & 1023; return e === 0 ? s * m * Math.pow(2, -24) : e === 31 ? (m ? NaN : s * Infinity) : s * (1 + m / 1024) * Math.pow(2, e - 15); }
  /* One directional light on a MeshStandardMaterial. color is linear RGB; returns linear outgoing radiance per channel
     and the terms at that point. geometryRoughness is the screen-space normal change added in lights_physical_fragment. */
  function shade(o) {
    const N = o.N, V = o.V, L = o.L, rough0 = o.roughness, metal = o.metalness, col = o.color, lc = o.light == null ? 1 : o.light;
    const roughness = Math.min(Math.max(rough0, 0.045) + (o.geometryRoughness || 0), 1);    // lights_physical_fragment
    const dotNL = saturate(dot(N, L)), dotNV = saturate(dot(N, V)), H = norm(add(L, V)), dotNH = saturate(dot(N, H)), dotVH = saturate(dot(V, H));
    const alpha = Math.pow(Math.max(roughness, 0.045), 2);                                   // BRDF_GGX
    const Dv = D_GGX(alpha, dotNH), Vv = V_GGX_SmithCorrelated(alpha, dotNL, dotNV);
    const fab = dfgLookup(roughness, dotNV), Ess = fab[0] + fab[1];                          // lights_fragment_begin
    const out = [0, 0, 0], F = [0, 0, 0], spec = [0, 0, 0], diff = [0, 0, 0];
    for (let k = 0; k < 3; k++) {
      const f0 = 0.04 * (1 - metal) + col[k] * metal;                                         // specularColorBlended
      const msc = o.noMS ? 1 : 1 + f0 * (1 / Ess - 1);
      F[k] = F_Schlick(f0, 1, dotVH);
      spec[k] = dotNL * lc * F[k] * Vv * Dv * msc;
      const Fd = F_Schlick(0.04, 1, dotVH);                                                   // diffuse uses specularColor (0.04)
      diff[k] = dotNL * lc * RECIPROCAL_PI * col[k] * (1 - metal) * (1 - Fd);
      out[k] = spec[k] + diff[k];
    }
    return { out, spec, diff, D: Dv, V: Vv, F, Ess, msc: 1 + (0.04 * (1 - metal) + col[0] * metal) * (1 / Ess - 1), dotNL, dotNV, dotNH, roughness };
  }
  // white-furnace check of the single-scattering lobe: E(μ) = ∫ F V D (n·l) dω with F₀ = F₉₀ = 1 is dfg.x + dfg.y
  const energyLost = (roughness, dotNV) => { const f = integrateBRDF(dotNV, roughness, 4096); return 1 - (f[0] + f[1]); };
  // as ColorManagement LinearToSRGB / SRGBToLinear and the shader's sRGBTransferOETF (0.41666 ≈ 1/2.4)
  const linearToSRGB = c => (c < 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 0.41666) - 0.055);
  const sRGBToLinear = c => (c < 0.04045 ? c * 0.0773993808 : Math.pow(c * 0.9478672986 + 0.0521327014, 2.4));

  /* ═════════ ch8: rasterisation (OpenGL ES 3.0 §3.6.1) ═════════
     Fragments are produced where a pixel centre lies inside the triangle (edge functions); a centre exactly on a shared
     edge goes to one triangle only (the top-left rule, one common way to meet the spec's requirement). Varyings use
     eq. 3.7 (divide by clip w), depth eq. 3.8 (linear in screen space). The depth test is LEQUAL, three's default
     (Material.depthFunc = LessEqualDepth). No clipping: the scenes keep every vertex in front of the near plane. */
  function framebuffer(w, h) { const n = w * h; return { w, h, color: new Float32Array(n * 3), depth: new Float32Array(n).fill(1), cover: new Uint16Array(n), stats: { fragments: 0, passed: 0, failed: 0, tris: 0 } }; }
  function clearFB(fb, bg) { fb.depth.fill(1); fb.cover.fill(0); for (let i = 0; i < fb.w * fb.h; i++) { fb.color[i * 3] = bg[0]; fb.color[i * 3 + 1] = bg[1]; fb.color[i * 3 + 2] = bg[2]; } fb.stats = { fragments: 0, passed: 0, failed: 0, tris: 0 }; }
  const edgeFn = (a, b, px, py) => (b[0] - a[0]) * (py - a[1]) - (b[1] - a[1]) * (px - a[0]);
  // window coordinates for a clip-space vertex (y down for the canvas: row 0 at the top)
  function toWindow(clip, w, h) { const iw = 1 / clip[3]; return [w / 2 * clip[0] * iw + w / 2, h / 2 - h / 2 * clip[1] * iw, 0.5 * clip[2] * iw + 0.5, clip[3]]; }
  /* draw one triangle. v = three window vertices [x, y, z, wclip]; attr = per-vertex arrays; frag(attr, x, y) → [r, g, b, a];
     o.perspective (default true), o.depthWrite (default true), o.blend (normal blending with straight alpha). */
  function rasterTriangle(fb, v, attr, frag, o) {
    o = o || {};
    let [a, b, c] = v, [A, B, Cc] = attr;
    let area = edgeFn(a, b, c[0], c[1]);
    if (area === 0) return;
    if (area < 0) { [b, c] = [c, b]; [B, Cc] = [Cc, B]; area = -area; }   // both windings are drawn (DoubleSide)
    fb.stats.tris++;
    const minX = Math.max(0, Math.floor(Math.min(a[0], b[0], c[0]))), maxX = Math.min(fb.w - 1, Math.ceil(Math.max(a[0], b[0], c[0])));
    const minY = Math.max(0, Math.floor(Math.min(a[1], b[1], c[1]))), maxY = Math.min(fb.h - 1, Math.ceil(Math.max(a[1], b[1], c[1])));
    // top-left rule for y-down screens: an edge owns its boundary if it is a top edge or a left edge
    const owns = (p, q) => { const dy = q[1] - p[1], dx = q[0] - p[0]; return (dy === 0 && dx > 0) || dy < 0; };
    const ownBC = owns(b, c), ownCA = owns(c, a), ownAB = owns(a, b);
    const persp = o.perspective !== false, n = A.length, val = new Array(n);
    for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
      const px = x + 0.5, py = y + 0.5;
      const w0 = edgeFn(b, c, px, py), w1 = edgeFn(c, a, px, py), w2 = edgeFn(a, b, px, py);
      if (w0 < 0 || w1 < 0 || w2 < 0) continue;
      if ((w0 === 0 && !ownBC) || (w1 === 0 && !ownCA) || (w2 === 0 && !ownAB)) continue;
      const l0 = w0 / area, l1 = w1 / area, l2 = w2 / area;                  // barycentric in window space
      const z = l0 * a[2] + l1 * b[2] + l2 * c[2];                          // eq. 3.8
      const i = y * fb.w + x;
      fb.stats.fragments++; fb.cover[i]++;
      if (!(z <= fb.depth[i])) { fb.stats.failed++; continue; }               // LEQUAL
      fb.stats.passed++;
      if (persp) { const q0 = l0 / a[3], q1 = l1 / b[3], q2 = l2 / c[3], s = q0 + q1 + q2; for (let k = 0; k < n; k++) val[k] = (q0 * A[k] + q1 * B[k] + q2 * Cc[k]) / s; }  // eq. 3.7
      else for (let k = 0; k < n; k++) val[k] = l0 * A[k] + l1 * B[k] + l2 * Cc[k];
      const col = frag(val, x, y);
      if (o.collect) { (o.collect[i] || (o.collect[i] = [])).push({ z, col }); continue; }
      if (o.blend) { const al = col[3]; for (let k = 0; k < 3; k++) fb.color[i * 3 + k] = col[k] * al + fb.color[i * 3 + k] * (1 - al); }
      else { fb.color[i * 3] = col[0]; fb.color[i * 3 + 1] = col[1]; fb.color[i * 3 + 2] = col[2]; }
      if (o.depthWrite !== false) fb.depth[i] = z;
    }
  }
  // draw an indexed mesh: positions in world space are transformed by mvp; attrFn(i) gives the per-vertex attribute array
  function drawMesh(fb, mvp, pos, index, attrFn, frag, o) {
    for (let t = 0; t < index.length; t += 3) {
      const ids = [index[t], index[t + 1], index[t + 2]];
      const clips = ids.map(i => m4v4(mvp, [pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2], 1]));
      if (clips.some(c => c[3] <= 1e-6)) continue;
      rasterTriangle(fb, clips.map(c => toWindow(c, fb.w, fb.h)), ids.map(attrFn), frag, o);
    }
  }
  /* The ch8 scenes (TUNED geometry): 'pair' two triangles that pass through each other; 'checker' a floor quad with a
     checkerboard in uv, seen at a slant; 'glass' two half-transparent panels that cross, drawn in a chosen order. */
  const RASTER = { w: 64, h: 40, fov: 50 };
  function rasterScene(kind, o) {
    o = o || {};
    const W = o.w || RASTER.w, H = o.h || RASTER.h, fb = framebuffer(W, H);
    clearFB(fb, [0.06, 0.07, 0.1]);
    const proj = cameraProjection({ fov: RASTER.fov, aspect: W / H, near: 0.5, far: 50 });
    const view = m4invert(lookAtWorld([0, 1.2, 4], [0, 0.3, 0])), vp = m4mul(proj, view);
    const solid = col => v => [col[0] * (0.55 + 0.45 * v[0]), col[1] * (0.55 + 0.45 * v[0]), col[2] * (0.55 + 0.45 * v[0]), 1];
    if (kind === 'pair') {
      const t = o.tilt == null ? 0.6 : o.tilt;
      // gold triangle stands upright; cyan triangle leans through it by angle t
      const g = [[-1.4, -0.4, 0], [1.4, -0.4, 0], [0, 1.6, 0]];
      const c = [[-1.2, 1.3, -0.9 * Math.cos(t) - 0.2], [1.2, 1.3, -0.9 * Math.cos(t) - 0.2], [0, -0.6, 1.2 * Math.sin(t) + 0.3]];
      const tri = (P, col, shadeV) => drawMesh(fb, vp, P.flat(), [0, 1, 2], i => [shadeV[i]], solid(col), {});
      if (o.order === 'cg') { tri(c, [0.39, 0.78, 0.9], [1, 0.6, 0.2]); tri(g, [0.91, 0.73, 0.29], [0.3, 0.6, 1]); }
      else { tri(g, [0.91, 0.73, 0.29], [0.3, 0.6, 1]); tri(c, [0.39, 0.78, 0.9], [1, 0.6, 0.2]); }
    } else if (kind === 'checker') {
      const P = [[-3, 0, 2.5], [3, 0, 2.5], [3, 0, -12], [-3, 0, -12]], uv = [[0, 0], [6, 0], [6, 14.5], [0, 14.5]];
      const fr = v => { const ch = (Math.floor(v[0]) + Math.floor(v[1])) & 1; return ch ? [0.91, 0.73, 0.29, 1] : [0.12, 0.14, 0.2, 1]; };
      drawMesh(fb, vp, P.flat(), [0, 1, 2, 0, 2, 3], i => uv[i], fr, { perspective: o.perspective !== false });
    } else if (kind === 'glass') {
      // an opaque back wall, then two crossing panels at half alpha, in the order given; depthWrite on (three's default)
      drawMesh(fb, vp, [-3, -0.6, -2.5, 3, -0.6, -2.5, 3, 2.2, -2.5, -3, 2.2, -2.5], [0, 1, 2, 0, 2, 3], () => [0.5], solid([0.35, 0.38, 0.45]), {});
      // crossing (default): two panels that pass through each other; o.cross === false: parallel, gold behind cyan
      const p1 = o.cross === false ? [-1.8, -0.5, -1.4, 1.2, -0.5, -1.4, 1.2, 1.8, -1.4, -1.8, 1.8, -1.4] : [-1.8, -0.5, -1.2, 1.4, -0.5, 0.8, 1.4, 1.8, 0.8, -1.8, 1.8, -1.2];
      const p2 = o.cross === false ? [-1.2, -0.5, 0.4, 1.8, -0.5, 0.4, 1.8, 1.8, 0.4, -1.2, 1.8, 0.4] : [-1.4, -0.5, 0.8, 1.8, -0.5, -1.2, 1.8, 1.8, -1.2, -1.4, 1.8, 0.8];
      const pan = (p, col, collect) => drawMesh(fb, vp, p, [0, 1, 2, 0, 2, 3], () => [1], v => [col[0], col[1], col[2], 0.5], { blend: true, depthWrite: o.depthWrite !== false, collect });
      const P1 = [p1, [0.91, 0.73, 0.29]], P2 = [p2, [0.39, 0.78, 0.9]];
      if (o.order === 'exact') {
        // reference: every fragment kept, sorted far to near per pixel, then blended (what no object order can give)
        const frags = []; pan(P1[0], P1[1], frags); pan(P2[0], P2[1], frags);
        frags.forEach((L, i) => { if (!L) return; L.sort((a, b) => b.z - a.z); for (const f of L) for (let k = 0; k < 3; k++) fb.color[i * 3 + k] = f.col[k] * 0.5 + fb.color[i * 3 + k] * 0.5; });
      } else if (o.order === 'cg') { pan(P2[0], P2[1]); pan(P1[0], P1[1]); } else { pan(P1[0], P1[1]); pan(P2[0], P2[1]); }
    }
    return fb;
  }
  // how many pixels show a different colour for two draw orders (the part sorting decides)
  function orderDiff(kind, o) {
    const A = rasterScene(kind, Object.assign({}, o, { order: 'gc' })), B = rasterScene(kind, Object.assign({}, o, { order: 'cg' }));
    let d = 0; for (let i = 0; i < A.w * A.h; i++) { const e = Math.abs(A.color[i * 3] - B.color[i * 3]) + Math.abs(A.color[i * 3 + 1] - B.color[i * 3 + 1]) + Math.abs(A.color[i * 3 + 2] - B.color[i * 3 + 2]); if (e > 1e-6) d++; }
    return d;
  }
  // pixels where a draw order differs from the per-fragment sorted reference
  function glassWrong(order, o) {
    const A = rasterScene('glass', Object.assign({}, o, { order })), R = rasterScene('glass', Object.assign({}, o, { order: 'exact' }));
    let d = 0; for (let i = 0; i < A.w * A.h; i++) { let e = 0; for (let k = 0; k < 3; k++) e += Math.abs(A.color[i * 3 + k] - R.color[i * 3 + k]); if (e > 1e-6) d++; }
    return d;
  }
  // shared edge check: two triangles of a square cover each pixel centre exactly once
  function sharedEdgeCoverage(W, H, P) {
    const fb = framebuffer(W, H);
    const t1 = [P[0], P[1], P[2]], t2 = [P[0], P[2], P[3]];
    for (const t of [t1, t2]) rasterTriangle(fb, t.map(p => [p[0], p[1], 0.5, 1]), [[0], [0], [0]], () => [1, 1, 1, 1], { depthWrite: false });
    let twice = 0, once = 0; for (let i = 0; i < W * H; i++) { if (fb.cover[i] > 1) twice++; else if (fb.cover[i] === 1) once++; }
    return { once, twice };
  }

  /* ═════════ ch9: textures ═════════ */
  const mipLevels = size => Math.log2(size) + 1;                         // as WebGLTextures getMipLevels (square power of two)
  function textureBytes(size, bpp, mips) { let b = 0, s = size; do { b += s * s * bpp; s = Math.floor(s / 2); } while (mips && s >= 1); return b; }
  // OpenGL ES 3.0 §3.8.10.1 eq. 3.16, 3.20; EXT_texture_filter_anisotropic for N and λ′
  function lod(dudx, dvdx, dudy, dvdy, maxAniso) {
    const Px = Math.hypot(dudx, dvdx), Py = Math.hypot(dudy, dvdy), rho = Math.max(Px, Py);
    const base = Math.log2(rho);
    if (!maxAniso || maxAniso <= 1) return { lambda: base, N: 1, Px, Py };
    const Pmax = Math.max(Px, Py), Pmin = Math.min(Px, Py), N = Math.min(Math.ceil(Pmax / Pmin), maxAniso);
    return { lambda: Math.log2(Pmax / N), N, Px, Py };
  }
  // a 64 × 64 checker (8 × 8 texel squares) and its box-filtered mip chain
  function checkerMips(size, sq) {
    size = size || 64; sq = sq || 8;
    const lv = [new Float32Array(size * size)];
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) lv[0][y * size + x] = ((Math.floor(x / sq) + Math.floor(y / sq)) & 1) ? 1 : 0;
    let s = size;
    while (s > 1) {
      const p = lv[lv.length - 1], n = s / 2, q = new Float32Array(n * n);
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) q[y * n + x] = (p[2 * y * s + 2 * x] + p[2 * y * s + 2 * x + 1] + p[(2 * y + 1) * s + 2 * x] + p[(2 * y + 1) * s + 2 * x + 1]) / 4;
      lv.push(q); s = n;
    }
    return lv;
  }
  const MIPS = checkerMips(64, 8);
  function texel(L, x, y) { const s = Math.round(Math.sqrt(L.length)); x = ((x % s) + s) % s; y = ((y % s) + s) % s; return L[y * s + x]; }   // RepeatWrapping
  function bilinear(L, u, v) {
    const s = Math.round(Math.sqrt(L.length)), x = u * s - 0.5, y = v * s - 0.5, x0 = Math.floor(x), y0 = Math.floor(y), tx = x - x0, ty = y - y0;
    return (texel(L, x0, y0) * (1 - tx) + texel(L, x0 + 1, y0) * tx) * (1 - ty) + (texel(L, x0, y0 + 1) * (1 - tx) + texel(L, x0 + 1, y0 + 1) * tx) * ty;
  }
  // sample with a filter: 'nearest' (level 0, no mips), 'linear' (level 0 bilinear), 'trilinear', 'aniso'
  function sampleTex(u, v, d, filter, maxAniso) {
    if (filter === 'nearest') { const s = 64; return texel(MIPS[0], Math.floor(u * s), Math.floor(v * s)); }
    if (filter === 'linear') return bilinear(MIPS[0], u, v);
    const tex = d.map(x => x * 64);   // derivatives in texels of level 0
    const L = lod(tex[0], tex[1], tex[2], tex[3], filter === 'aniso' ? maxAniso : 1);
    const tri = (uu, vv) => { const lam = clamp(L.lambda, 0, MIPS.length - 1); const l0 = Math.floor(lam), l1 = Math.min(MIPS.length - 1, l0 + 1), f = lam - l0; return bilinear(MIPS[l0], uu, vv) * (1 - f) + bilinear(MIPS[l1], uu, vv) * f; };
    if (L.N <= 1) return tri(u, v);
    const alongX = L.Px > L.Py; let s = 0;
    for (let i = 1; i <= L.N; i++) { const k = i / (L.N + 1) - 0.5; s += alongX ? tri(u + d[0] * k, v + d[1] * k) : tri(u + d[2] * k, v + d[3] * k); }
    return s / L.N;
  }
  /* ch9 floor: a camera at height h looks at an infinite floor; uv = world x/z × repeat. For each pixel centre the floor
     point and its uv derivatives come from the neighbouring pixel centres (finite differences, as a GPU's 2×2 quad does). */
  function floorView(o) {
    const W = o.w || 96, H = o.h || 56, rep = o.repeat || 0.25, cam = { fov: 50, aspect: W / H, near: 0.1, far: 100 };
    const eye = [0, o.height || 1.6, 0], world = lookAtWorld(eye, [0, (o.height || 1.6) - Math.tan((o.pitch || 12) * Math.PI / 180), -1]);
    const pinv = m4invert(cameraProjection(cam));
    const uvAt = (px, py) => {
      const ndc = [px / W * 2 - 1, 1 - py / H * 2, 0.5], p = m4point(world, m4point(pinv, ndc)), dir = sub(p, eye);
      if (dir[1] >= -1e-9) return null; const t = -eye[1] / dir[1]; const q = add(eye, scale(dir, t)); return [q[0] * rep, -q[2] * rep, t];
    };
    const px = [], lvl = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const c = uvAt(x + 0.5, y + 0.5), r = uvAt(x + 1.5, y + 0.5), b = uvAt(x + 0.5, y + 1.5);
      if (!c || !r || !b) { px.push(-1); lvl.push(-1); continue; }
      const d = [r[0] - c[0], r[1] - c[1], b[0] - c[0], b[1] - c[1]];
      const L = lod(d[0] * 64, d[1] * 64, d[2] * 64, d[3] * 64, o.filter === 'aniso' ? o.maxAniso : 1);
      px.push(sampleTex(c[0], c[1], d, o.filter, o.maxAniso)); lvl.push(L.lambda);
    }
    // per pixel the isotropic level (eq. 3.20) as well, so the two filters are scored on the same pixels
    const iso = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const c = uvAt(x + 0.5, y + 0.5), r = uvAt(x + 1.5, y + 0.5), b = uvAt(x + 0.5, y + 1.5);
      iso.push(!c || !r || !b ? -1 : lod((r[0] - c[0]) * 64, (r[1] - c[1]) * 64, (b[0] - c[0]) * 64, (b[1] - c[1]) * 64, 1).lambda);
    }
    // far: pixels whose footprint spans > 8 texels (λ > 3, the 8-texel squares are under a pixel): ideal colour is 0.5
    // grey, so the error is the mean |value − 0.5|; mid: 1 < λ ≤ 3, where the squares are 1–8 pixels: mean |value − 0.5|
    // is the contrast that survives (higher = sharper)
    let fe = 0, fn = 0, mc = 0, mn = 0;
    for (let i = 0; i < px.length; i++) { if (px[i] < 0) continue; if (iso[i] > 3) { fe += Math.abs(px[i] - 0.5); fn++; } else if (iso[i] > 1) { mc += Math.abs(px[i] - 0.5); mn++; } }
    return { w: W, h: H, px, lvl, iso, farError: fn ? fe / fn : 0, midContrast: mn ? mc / mn : 0 };
  }

  /* ═════════ ch10: a shadow map, seen from the side ═════════
     A 2D slice: the ground y = 0 from x = −6 to 6, a thin post (x −2.6…−2.4, height 2), a box (x 0.5…2, height 1.2) and
     a ramp. A directional light shines
     at angle θ from vertical; its shadow camera is orthographic (as DirectionalLightShadow), W wide, with `res` texels.
     Each texel stores the depth of the first surface along the light ray through its centre; a receiver point is lit if
     its own depth + bias ≤ the stored depth (shadowmap_pars_fragment: shadowCoord.z += shadowBias; LessEqual compare),
     after moving it along its normal by normalBias (shadowmap_vertex). 'pcf' averages five compares spread over
     shadowRadius texels, a 1D stand-in for three's five-tap Vogel disk on hardware-filtered compares. TUNED: the scene. */
  const SHADOW_SCENE = {
    segs: [ // [x0, y0, x1, y1, normal]
      [-6, 0, -2.6, 0], [-2.6, 0, -2.6, 2], [-2.6, 2, -2.4, 2], [-2.4, 2, -2.4, 0], [-2.4, 0, 0.5, 0],
      [0.5, 0, 0.5, 1.2], [0.5, 1.2, 2, 1.2], [2, 1.2, 2, 0], [2, 0, 3.2, 0], [3.2, 0, 6, 1.4]
    ], W: 14, near: 0.5, far: 30
  };
  function segNormal(s) { const d = norm([s[2] - s[0], s[3] - s[1], 0]); return [-d[1], d[0], 0]; }
  function rayHit(o, d, segs) { // first hit distance of ray o + t d with segments
    let best = Infinity, which = -1;
    segs.forEach((s, i) => {
      const e = [s[2] - s[0], s[3] - s[1]], den = d[0] * e[1] - d[1] * e[0]; if (Math.abs(den) < 1e-12) return;
      const w = [s[0] - o[0], s[1] - o[1]], t = (w[0] * e[1] - w[1] * e[0]) / den, u = (w[0] * d[1] - w[1] * d[0]) / den;
      if (t > 1e-9 && u >= -1e-9 && u <= 1 + 1e-9 && t < best) { best = t; which = i; }
    });
    return { t: best, seg: which };
  }
  function shadowSetup(theta) {
    const dir = [Math.sin(theta), -Math.cos(theta)], right = [Math.cos(theta), Math.sin(theta)];
    const origin = [-dir[0] * 15, -dir[1] * 15];   // the light sits 15 units back along −dir from the scene centre
    return { dir, right, origin };
  }
  function shadowMap(theta, res) {
    const S = SHADOW_SCENE, L = shadowSetup(theta), map = new Float32Array(res);
    for (let i = 0; i < res; i++) {
      const s = ((i + 0.5) / res - 0.5) * S.W, o = [L.origin[0] + L.right[0] * s, L.origin[1] + L.right[1] * s];
      const h = rayHit(o, L.dir, S.segs);
      map[i] = h.t === Infinity ? 1 : clamp((h.t - S.near) / (S.far - S.near), 0, 1);
    }
    return { map, L };
  }
  // receiver test for a world point p on surface normal n; returns {lit, truth}
  function shadowTest(sm, p, n, o) {
    const S = SHADOW_SCENE, L = sm.L, res = sm.map.length;
    const q = [p[0] + n[0] * (o.normalBias || 0), p[1] + n[1] * (o.normalBias || 0)];
    const rel = [q[0] - L.origin[0], q[1] - L.origin[1]];
    const s = rel[0] * L.right[0] + rel[1] * L.right[1], depth = rel[0] * L.dir[0] + rel[1] * L.dir[1];
    const u = s / S.W + 0.5, z = (depth - S.near) / (S.far - S.near) + (o.bias || 0);
    const cmp = uu => { if (uu < 0 || uu >= 1) return 1; const i = Math.floor(uu * res); return z <= sm.map[i] ? 1 : 0; };
    let lit;
    if (o.pcf) { const r = (o.radius || 1) / res; lit = (cmp(u - r) + cmp(u - r / 2) + cmp(u) + cmp(u + r / 2) + cmp(u + r)) / 5; }
    else lit = cmp(u);
    // truth: is p itself reached by the light (no other surface between)?
    const back = [p[0] - L.dir[0] * 40, p[1] - L.dir[1] * 40], h = rayHit(back, L.dir, S.segs);
    const truth = h.t >= 40 - 1e-6 && dot([n[0], n[1], 0], [-L.dir[0], -L.dir[1], 0]) > 0 ? 1 : 0;
    return { lit, truth };
  }
  // sample every surface the camera sees (all segments, step 0.02) and score the result
  function shadowRun(o) {
    const sm = shadowMap(o.theta, o.res), S = SHADOW_SCENE, samples = [];
    let acne = 0, litTruth = 0, missing = 0, shadowTruth = 0;
    S.segs.forEach((s, si) => {
      const n = segNormal(s), Ls = Math.hypot(s[2] - s[0], s[3] - s[1]), k = Math.max(2, Math.round(Ls / 0.02));
      for (let j = 0; j <= k; j++) {
        const t = j / k, p = [s[0] + (s[2] - s[0]) * t, s[1] + (s[3] - s[1]) * t];
        if (j === 0 || j === k) continue;
        const r = shadowTest(sm, p, n, o); samples.push({ p, si, lit: r.lit, truth: r.truth });
        if (r.truth) { litTruth++; if (r.lit < 0.5) acne++; } else { shadowTruth++; if (r.lit >= 0.5) missing++; }
      }
    });
    // peter-panning on the ground right of the box (light from the left): where the shadow really ends vs where the test starts it
    return { sm, samples, acne: acne / Math.max(1, litTruth), leak: missing / Math.max(1, shadowTruth), texel: S.W / o.res };
  }
  // peter-panning: light from the left (θ > 0), the post's shadow should start at its right foot (x = −2.4); how far
  // right of the foot the first shadowed ground sample lies
  const POST_FOOT = -2.4;
  function contactGap(o) {
    const sm = shadowMap(o.theta, o.res);
    for (let x = POST_FOOT + 0.002; x < 0.5; x += 0.002) { const r = shadowTest(sm, [x, 0], [0, 1, 0], o); if (r.lit < 0.5) return x - POST_FOOT; }
    return Infinity;
  }

  /* ═════════ ch11: what a draw call costs ═════════
     A frame-time model with labelled parameters. The defaults are from tools/measure-calls.cjs on one machine
     (Apple M6, Chromium 151 headless with ANGLE on Metal, three r187, 2026-11-20; BRIEF.md has the table):
       one Mesh, one draw call: 0.3–0.5 µs of main-thread time when all meshes share a geometry and a material,
         0.6–1.5 µs when each has its own (more state changes);
       an InstancedMesh whose instances all move: about 0.015 µs per instance (setMatrixAt + re-upload);
       a BatchedMesh: about 0.035 µs per instance (per-object culling and sorting on the CPU).
     separate: N meshes, N calls; instanced: one call, all-or-nothing culling, moving instances re-upload 64 bytes each;
     batched: one multi-draw call, per-object culling; merged: one call, one static geometry. */
  // one run of tools/measure-calls.cjs (the last of four on 2026-11-20; the others agree within about ±30%): main-thread ms
  // per render() call, averaged over 60 frames; compile = ms for the first frame that needs new MeshStandardMaterial programs
  const MEASURED = { machine: 'Apple M6, macOS 27.2.1, Chromium 151.0.7922.34 headless, ANGLE Metal, three r187', date: '2026-11-20',
    separate: { 100: 0.047, 1000: 0.320, 4000: 1.198 }, calls4000: 3648, own: { 100: 0.063, 1000: 0.610, 4000: 3.810 },
    instanced: { 1000: 0.002, 4000: 0.000 }, instancedMoving: { 1000: 0.022, 4000: 0.060 }, batched: { 1000: 0.047, 4000: 0.140 },
    compileFirst: 96.1, compileTen: 35.6 };
  const CALL_DEFAULTS = { usPerCall: 1.0, usPerInstanceMove: 0.015, usPerBatchItem: 0.035, budgetMs: 1000 / 60 };
  function frameCost(o) {
    const n = o.n, P = Object.assign({}, CALL_DEFAULTS, o.params || {}), moving = !!o.moving;
    let calls, us, upload, cull;
    if (o.strategy === 'separate') { calls = n; us = n * P.usPerCall; upload = 0; cull = 'each'; }
    else if (o.strategy === 'merged') { calls = 1; us = P.usPerCall; upload = 0; cull = 'all'; if (moving) return { calls: 1, cpuMs: NaN, upload: NaN, cull, fits: false, na: true }; }
    else if (o.strategy === 'instanced') { calls = 1; us = P.usPerCall + (moving ? n * P.usPerInstanceMove : 0); upload = moving ? n * 64 : 0; cull = 'all'; }
    else { calls = 1; us = P.usPerCall + n * P.usPerBatchItem + (moving ? n * P.usPerInstanceMove : 0); upload = moving ? n * 64 : 0; cull = 'each'; }
    const cpuMs = us / 1000;
    return { calls, cpuMs, upload, cull, share: cpuMs / P.budgetMs, fits: cpuMs <= P.budgetMs };
  }
  // the N at which separate meshes alone fill the frame budget
  const callsPerFrame = usPerCall => Math.floor(CALL_DEFAULTS.budgetMs * 1000 / usPerCall);
  // the fable-flight pages (demos/fable-flight, three r170): PlaneGeometry(1, 1, 3, 5) instanced 24,000 times
  const FABLE = { pages: 24000, gx: 3, gy: 5, perInstanceFloats: 4 + 4 + 1 };
  function fableStats() {
    const v = (FABLE.gx + 1) * (FABLE.gy + 1), tris = FABLE.gx * FABLE.gy * 2;
    return { vertsPerPage: v, trisPerPage: tris, triangles: tris * FABLE.pages, instanceBytes: FABLE.pages * FABLE.perInstanceFloats * 4 };
  }

  /* ═════════ ch12: picking and rotations ═════════ */
  // as Ray.intersectTriangle (r186+): Woop, Benthin & Wald 2013 watertight test; returns t or null
  function intersectTriangle(origin, dir, a, b, c, backfaceCulling) {
    const [dx, dy, dz] = dir;
    const ao = sub(a, origin), bo = sub(b, origin), co = sub(c, origin);
    const adx = Math.abs(dx), ady = Math.abs(dy), adz = Math.abs(dz);
    let kx, ky, kz;
    if (adx >= ady && adx >= adz) { kz = 0; if (dx >= 0) { kx = 1; ky = 2; } else { kx = 2; ky = 1; } }
    else if (ady >= adz) { kz = 1; if (dy >= 0) { kx = 2; ky = 0; } else { kx = 0; ky = 2; } }
    else { kz = 2; if (dz >= 0) { kx = 0; ky = 1; } else { kx = 1; ky = 0; } }
    const dkx = dir[kx], dky = dir[ky], dkz = dir[kz];
    if (dkz === 0) return null;
    const sx = dkx / dkz, sy = dky / dkz, sz = 1 / dkz;
    const ax = ao[kx] - sx * ao[kz], ay = ao[ky] - sy * ao[kz], bx = bo[kx] - sx * bo[kz], by = bo[ky] - sy * bo[kz], cx = co[kx] - sx * co[kz], cy = co[ky] - sy * co[kz];
    const u = cx * by - cy * bx, v = ax * cy - ay * cx, w = bx * ay - by * ax;
    if (backfaceCulling) { if (u < 0 || v < 0 || w < 0) return null; }
    else if ((u < 0 || v < 0 || w < 0) && (u > 0 || v > 0 || w > 0)) return null;
    const det = u + v + w; if (det === 0) return null;
    const ts = sz * (u * ao[kz] + v * bo[kz] + w * co[kz]);
    if (det > 0 ? ts < 0 : ts > 0) return null;
    return { t: ts / det, bary: [u / det, v / det, w / det] };
  }
  // as Raycaster.setFromCamera for a perspective camera
  function rayFromCamera(ndcX, ndcY, camWorld, proj) {
    const origin = [camWorld[12], camWorld[13], camWorld[14]];
    const p = m4point(camWorld, m4point(m4invert(proj), [ndcX, ndcY, 0.5]));
    return { origin, dir: norm(sub(p, origin)) };
  }
  // the bounding sphere three computes (Box3 centre, then max distance): as BufferGeometry.computeBoundingSphere
  function boundingSphere(pos) {
    const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < pos.length; i += 3) for (let k = 0; k < 3; k++) { mn[k] = Math.min(mn[k], pos[i + k]); mx[k] = Math.max(mx[k], pos[i + k]); }
    const c = scale(add(mn, mx), 0.5); let r2 = 0;
    for (let i = 0; i < pos.length; i += 3) { const d = [pos[i] - c[0], pos[i + 1] - c[1], pos[i + 2] - c[2]]; r2 = Math.max(r2, dot(d, d)); }
    return { c, r: Math.sqrt(r2) };
  }
  // as Ray.intersectSphere (returns entry distance or null) and Sphere.containsPoint
  function raySphere(o, d, c, r) {
    const v = sub(c, o), tca = dot(v, d), d2 = dot(v, v) - tca * tca, r2 = r * r;
    if (d2 > r2) return null; const thc = Math.sqrt(r2 - d2), t0 = tca - thc, t1 = tca + thc;
    if (t1 < 0) return null; return t0 < 0 ? t1 : t0;
  }
  // as Mesh.raycast + _computeIntersections for an indexed geometry with FrontSide material; matrixWorld given
  function raycastMesh(geom, matrixWorld, ray, bs) {
    bs = bs || boundingSphere(geom.position);
    const wc = m4point(matrixWorld, bs.c), wr = bs.r * maxScaleOnAxis(matrixWorld);
    const inside = len(sub(ray.origin, wc)) <= wr;
    if (!inside && raySphere(ray.origin, ray.dir, wc, wr) === null) return { sphere: false, tested: 0, hits: [] };
    const inv = m4invert(matrixWorld), lo = m4point(inv, ray.origin), ld = m4dir(inv, ray.dir);
    const P = geom.position, I = geom.index, hits = []; let tested = 0;
    for (let j = 0; j < I.length; j += 3) {
      tested++;
      const v = k => [P[I[j + k] * 3], P[I[j + k] * 3 + 1], P[I[j + k] * 3 + 2]];
      const r = intersectTriangle(lo, ld, v(0), v(1), v(2), true);
      if (!r) continue;
      const pl = add(lo, scale(ld, r.t)), pw = m4point(matrixWorld, pl);
      hits.push({ face: j / 3, distance: len(sub(pw, ray.origin)), point: pw });
    }
    hits.sort((a, b) => a.distance - b.distance);
    return { sphere: true, tested, hits };
  }
  // Euler-angle lerp against slerp between two orientations: rotation angle travelled from the start at each t
  function rotationPaths(e0, e1, steps) {
    const q0 = qEuler(...e0), q1 = qEuler(...e1), out = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps, qe = qEuler(e0[0] + (e1[0] - e0[0]) * t, e0[1] + (e1[1] - e0[1]) * t, e0[2] + (e1[2] - e0[2]) * t);
      out.push({ t, slerp: qAngle(q0, qSlerp(q0, q1, t)), euler: qAngle(q0, qe) });
    }
    // path length (sum of small rotations) for each method
    let ls = 0, le = 0;
    for (let i = 1; i <= steps; i++) {
      const t0 = (i - 1) / steps, t1 = i / steps;
      ls += qAngle(qSlerp(q0, q1, t0), qSlerp(q0, q1, t1));
      const a = qEuler(...e0.map((v, k) => v + (e1[k] - v) * t0)), b = qEuler(...e0.map((v, k) => v + (e1[k] - v) * t1));
      le += qAngle(a, b);
    }
    return { pts: out, total: qAngle(q0, q1), slerpLen: ls, eulerLen: le };
  }

  /* ───────── number formatting ───────── */
  function fmt(x, d, lang) {
    if (!isFinite(x)) return x > 0 ? '∞' : '−∞';
    const s = Math.abs(x).toFixed(d == null ? 0 : d), [i, f] = s.split('.');
    const g = i.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (x < 0 && Number(s) !== 0 ? '−' : '') + g + (f ? '.' + f : '');
  }
  function sig(x, n) { if (x === 0) return '0'; const d = Math.max(0, n - 1 - Math.floor(Math.log10(Math.abs(x)))); return fmt(x, d); }
  function bytesStr(b, lang) {
    if (b >= 1024 * 1024) return fmt(b / 1048576, 2) + ' MiB';
    if (b >= 1024) return fmt(b / 1024, 1) + ' KiB';
    return fmt(b, 0) + ' B';
  }

  return {
    SRC, sub, add, scale, dot, cross, len, norm, clamp, saturate,
    m4, m4mul, m4compose, m4invert, m4perspective, cameraProjection, m4v4, m4point, m4dir, maxScaleOnAxis, lookAtWorld,
    qAxis, qEuler, qMul, qDot, qSlerp, qAngle, qRotate,
    node, addChild, updateMatrix, updateMatrixWorld, worldPos, ORRERY, orrery, orreryFrame,
    boxGeometry, sphereGeometry, boxCounts, sphereCounts, geomBytes,
    DEFAULT_CAM, chain, ulp32, depthStep, zFightFrom, depthStd,
    frustumPlanes, intersectsSphere, painterSortStable, reversePainterSortStable, CULL_SCENE, CULL_MATS, circleMeetsPolygon, cullFrame,
    KEY_PARAMS, programParameters, programCacheKey, LAB_MATERIALS, programs, newPrograms, programsAfter, refetches,
    F_Schlick, V_GGX_SmithCorrelated, D_GGX, radicalInverse, integrateBRDF, dfgTable, dfgLookup, halfToFloat, shade, energyLost, linearToSRGB, sRGBToLinear,
    framebuffer, clearFB, edgeFn, toWindow, rasterTriangle, drawMesh, RASTER, rasterScene, orderDiff, glassWrong, sharedEdgeCoverage,
    mipLevels, textureBytes, lod, checkerMips, MIPS, sampleTex, floorView,
    SHADOW_SCENE, segNormal, shadowMap, shadowTest, shadowRun, contactGap,
    MEASURED, CALL_DEFAULTS, frameCost, callsPerFrame, FABLE, fableStats,
    intersectTriangle, rayFromCamera, boundingSphere, raySphere, raycastMesh, rotationPaths,
    fmt, sig, bytesStr
  };
});
