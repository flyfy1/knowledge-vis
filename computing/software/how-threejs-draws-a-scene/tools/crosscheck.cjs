#!/usr/bin/env node
'use strict';
/* Compares the page's models (models.js) with three.js itself on the same inputs.
   Usage: node tools/crosscheck.cjs <dir where `npm install three@0.187.0` was run>
   e.g.   node computing/software/how-threejs-draws-a-scene/tools/crosscheck.cjs /tmp/agent-tasks/software/how-threejs-draws-a-scene/three-install
   Nothing is installed into the repository. Exit code 1 if any comparison fails. The results are recorded in BRIEF.md;
   tests/models.cjs pins the numbers this run confirmed, without needing three.js. */
const path = require('path'), fs = require('fs'), { pathToFileURL } = require('url');
const M = require(path.join(__dirname, '..', 'models.js'));
const dir = process.argv[2];
if (!dir) { console.error('usage: node tools/crosscheck.cjs <install dir containing node_modules/three>'); process.exit(2); }
const T3 = path.join(path.resolve(dir), 'node_modules', 'three');
const imp = p => import(pathToFileURL(path.join(T3, p)).href);

let n = 0, bad = 0;
const rows = [];
function cmp(name, got, want, tol) {
  n++;
  const a = [].concat(got), b = [].concat(want);
  let err = 0, okLen = a.length === b.length;
  if (okLen) for (let i = 0; i < a.length; i++) err = Math.max(err, typeof a[i] === 'number' ? Math.abs(a[i] - b[i]) : (a[i] === b[i] ? 0 : Infinity));
  const ok = okLen && err <= (tol || 0);
  if (!ok) bad++;
  rows.push(`${ok ? 'ok  ' : 'FAIL'} ${name}${typeof a[0] === 'number' ? `  (max |diff| ${okLen ? err.toExponential(2) : 'length ' + a.length + ' vs ' + b.length}, tol ${tol || 0})` : okLen && err === 0 ? '' : `  got ${String(a).slice(0, 80)} want ${String(b).slice(0, 80)}`}`);
}

(async () => {
  const THREE = await imp('build/three.module.js');
  const pkg = JSON.parse(fs.readFileSync(path.join(T3, 'package.json'), 'utf8'));
  rows.push(`three ${pkg.version} (REVISION ${THREE.REVISION}) from ${T3}`);
  const r = M.rng ? M.rng : null; void r;
  let seed = 7; const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };

  /* 1. Matrix4.compose, invert, multiply */
  for (let i = 0; i < 200; i++) {
    const p = [rnd() * 20 - 10, rnd() * 20 - 10, rnd() * 20 - 10], e = [rnd() * 6 - 3, rnd() * 6 - 3, rnd() * 6 - 3], s = [0.2 + rnd() * 3, 0.2 + rnd() * 3, 0.2 + rnd() * 3];
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(...e));
    const m = new THREE.Matrix4().compose(new THREE.Vector3(...p), q, new THREE.Vector3(...s));
    const mine = M.m4compose(p, M.qEuler(...e), s);
    if (i < 3 || i === 199) cmp(`Matrix4.compose #${i}`, mine, m.elements, 1e-12);
    if (i === 199) cmp('Matrix4.invert', M.m4invert(mine), m.clone().invert().elements, 1e-12);
  }
  cmp('Quaternion.setFromEuler (XYZ)', M.qEuler(0.3, -1.1, 2.0), new THREE.Quaternion().setFromEuler(new THREE.Euler(0.3, -1.1, 2.0)).toArray(), 1e-15);

  /* 2. world-matrix propagation through a tree (orrery) */
  for (const day of [0, 0.7, 2.3]) {
    const scene = new THREE.Scene(), sun = new THREE.Object3D(), eo = new THREE.Object3D(), earth = new THREE.Object3D(), mo = new THREE.Object3D(), moon = new THREE.Object3D();
    scene.add(sun); sun.add(eo); eo.add(earth); earth.add(mo); mo.add(moon);
    eo.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), day); earth.position.set(M.ORRERY.earthR, 0, 0); earth.scale.setScalar(0.5);
    mo.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), day * M.ORRERY.moonRate); moon.position.set(M.ORRERY.moonR, 0, 0); moon.scale.setScalar(0.5);
    scene.updateMatrixWorld();
    const t = M.orrery(day); M.updateMatrixWorld(t.scene, false);
    cmp(`orrery day ${day}: moon.matrixWorld`, t.moon.matrixWorld, moon.matrixWorld.elements, 1e-12);
  }
  // stale read: matrixWorld before updateMatrixWorld is the previous frame's
  {
    const a = new THREE.Object3D(), b = new THREE.Object3D(); a.add(b); b.position.set(2, 0, 0); a.updateMatrixWorld();
    a.rotation.y = 1; const stale = new THREE.Vector3().setFromMatrixPosition(b.matrixWorld).toArray(); a.updateMatrixWorld();
    const fresh = new THREE.Vector3().setFromMatrixPosition(b.matrixWorld).toArray();
    cmp('stale matrixWorld before update (child keeps old world position)', stale, [2, 0, 0], 1e-12);
    cmp('fresh matrixWorld after update', fresh, [2 * Math.cos(1), 0, -2 * Math.sin(1)], 1e-12);
  }

  /* 3. geometry counts and arrays */
  for (const [ws, hs, ds] of [[1, 1, 1], [2, 3, 4], [10, 10, 10]]) {
    const g = new THREE.BoxGeometry(1, 1, 1, ws, hs, ds), mine = M.boxGeometry(1, 1, 1, ws, hs, ds);
    cmp(`BoxGeometry(${ws},${hs},${ds}) position`, mine.position, Array.from(g.attributes.position.array), 1e-7);
    cmp(`BoxGeometry(${ws},${hs},${ds}) index`, mine.index, Array.from(g.index.array), 0);
    cmp(`BoxGeometry(${ws},${hs},${ds}) counts`, [M.boxCounts(ws, hs, ds).vertices, M.boxCounts(ws, hs, ds).triangles], [g.attributes.position.count, g.index.count / 3], 0);
  }
  for (const [ws, hs] of [[8, 6], [32, 16], [256, 255]]) {
    const g = new THREE.SphereGeometry(1, ws, hs), mine = M.sphereGeometry(1, ws, hs);
    cmp(`SphereGeometry(1,${ws},${hs}) position`, mine.position, Array.from(g.attributes.position.array), 1e-6);
    cmp(`SphereGeometry(1,${ws},${hs}) index`, mine.index, Array.from(g.index.array), 0);
    cmp(`SphereGeometry(1,${ws},${hs}) index type`, M.geomBytes(M.sphereCounts(ws, hs).vertices, M.sphereCounts(ws, hs).triangles).indexType, g.index.array.constructor.name.replace('Array', ''), 0);
  }

  /* 4. makePerspective and the point through the chain */
  for (const rev of [false, true]) {
    const cam = new THREE.PerspectiveCamera(50, 16 / 9, 0.1, 2000);
    if (rev) { cam._reversedDepth = true; cam.updateProjectionMatrix(); }
    cmp(`PerspectiveCamera.projectionMatrix${rev ? ' (reversed depth)' : ''}`, M.cameraProjection({ fov: 50, aspect: 16 / 9, near: 0.1, far: 2000, reversed: rev }), cam.projectionMatrix.elements, 1e-12);
  }
  {
    const cam = new THREE.PerspectiveCamera(50, 16 / 9, 0.1, 2000); cam.position.set(1, 2, 8); cam.lookAt(0, 0.5, 0); cam.updateMatrixWorld();
    const pw = new THREE.Vector3(1.2, 0.4, -3), ndc = pw.clone().project(cam).toArray();
    const view = M.m4invert(M.lookAtWorld([1, 2, 8], [0, 0.5, 0])), pv = M.m4point(view, [1.2, 0.4, -3]);
    const c = M.chain({ fov: 50, aspect: 16 / 9, near: 0.1, far: 2000, point: pv });
    cmp('camera.lookAt world matrix', M.lookAtWorld([1, 2, 8], [0, 0.5, 0]), cam.matrixWorld.elements, 1e-12);
    cmp('Vector3.project (world → NDC)', c.ndc, ndc, 1e-12);
  }

  /* 5. Frustum.intersectsSphere decisions */
  {
    let agree = 0, total = 0;
    for (const [yaw, far, fov] of [[-0.3, 18, 50], [0, 16, 30], [0.4, 25, 60], [-0.75, 14, 75]]) {
      const f = M.cullFrame({ yaw, far, fov });
      const cam = new THREE.PerspectiveCamera(fov, 16 / 9, 0.5, far); cam.position.set(0, 0, 6); cam.rotation.set(0, yaw, 0); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
      const fr = new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
      cmp(`Frustum planes yaw ${yaw}`, f.planes.flatMap(p => [...p.n, p.c]), fr.planes.flatMap(p => [p.normal.x, p.normal.y, p.normal.z, p.constant]), 1e-12);
      for (const ob of M.CULL_SCENE) { total++; const t = fr.intersectsSphere(new THREE.Sphere(new THREE.Vector3(ob.x, 0, ob.z), ob.r)); if (t === M.intersectsSphere(f.planes, [ob.x, 0, ob.z], ob.r)) agree++; }
    }
    cmp(`Frustum.intersectsSphere decisions (${total} spheres × cameras)`, agree, total, 0);
  }

  /* 6. render-list sort order on a fixed scene (the real WebGLRenderList from src/) */
  {
    const { WebGLRenderList } = await imp('src/renderers/webgl/WebGLRenderLists.js');
    for (const [yaw, far, fov] of [[-0.3, 18, 50], [0.4, 25, 60]]) {
      const f = M.cullFrame({ yaw, far, fov });
      const list = new WebGLRenderList(); list.init();
      const mats = M.CULL_MATS.map(m => ({ id: m.id, transparent: !!m.transparent, transmission: 0 }));
      const cam = { reversedDepth: false };
      // push in scene order, with the same z the renderer computes (clip z of the bounding-sphere centre)
      for (const it of f.opaque.concat(f.transparent).sort((a, b) => a.id - b.id)) list.push({ id: it.id, renderOrder: 0 }, null, mats[it.material.id], 0, it.z, null, cam);
      list.sort();
      cmp(`WebGLRenderList opaque order (yaw ${yaw})`, list.opaque.map(i => i.id), f.opaque.map(i => i.id), 0);
      cmp(`WebGLRenderList transparent order (yaw ${yaw})`, list.transparent.map(i => i.id), f.transparent.map(i => i.id), 0);
    }
    // and the z itself: projectObject's _vector4 for a mesh at (x, 0, z)
    const f = M.cullFrame({ yaw: -0.3, far: 18, fov: 50 }), it = f.opaque[0];
    const cam = new THREE.PerspectiveCamera(50, 16 / 9, 0.5, 18); cam.position.set(0, 0, 6); cam.rotation.set(0, -0.3, 0); cam.updateMatrixWorld();
    const ps = new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
    const v4 = new THREE.Vector4(it.ob.x, 0, it.ob.z, 1).applyMatrix4(ps);
    cmp('sort key z = clip-space z of the centre (no divide)', it.z, v4.z, 1e-12);
  }

  /* 7. program cache keys: the page's key builder against WebGLPrograms.getProgramCacheKey on the same parameters */
  {
    const { WebGLPrograms } = await imp('src/renderers/webgl/WebGLPrograms.js');
    const P = WebGLPrograms({ outputColorSpace: 'srgb' }, null, null, { logarithmicDepthBuffer: false }, null, null);
    let same = 0, total = 0;
    for (const st of [{ dir: 1, point: 0 }, { dir: 1, point: 1, fog: true }, { dir: 2, point: 0, shadows: true, toneMapping: true }]) for (const m of M.LAB_MATERIALS) {
      const params = M.programParameters(m, st); total++;
      if (P.getProgramCacheKey(params) === M.programCacheKey(params, 'srgb')) same++;
    }
    cmp(`getProgramCacheKey strings identical (${total} material × state)`, same, total, 0);
  }

  /* 8. the DFG table: the page integrates it; three ships it as half floats */
  {
    const src = fs.readFileSync(path.join(T3, 'src/renderers/shaders/DFGLUTData.js'), 'utf8');
    const hex = src.slice(src.indexOf('new Uint16Array( ['), src.indexOf('] );')).match(/0x[0-9a-f]{4}/g).map(h => parseInt(h, 16));
    const T = M.dfgTable(4096), mine = T.flat(), theirs = hex.map(M.halfToFloat);
    // the generator's floatToHalf (utils/generateDFGLUT.js at r187), copied: my value must encode to three's stored bits
    const floatToHalf = x0 => { const fv = new Float32Array(1), iv = new Int32Array(fv.buffer); fv[0] = x0; const x = iv[0];
      let bits = (x >> 16) & 0x8000, m = (x >> 12) & 0x07ff; const e = (x >> 23) & 0xff;
      if (e < 103) return bits; if (e > 142) { bits |= 0x7c00; bits |= ((e == 255) ? 0 : (x & 0x007fffff)) >> 13; return bits; }
      if (e < 113) { m |= 0x0800; bits |= (m >> (114 - e)) + ((m >> (113 - e)) & 1); return bits; }
      bits |= ((e - 112) << 10) | (m >> 1); bits += m & 1; return bits; };
    let maxAbs = 0, sameBits = 0;
    for (let i = 0; i < mine.length; i++) { maxAbs = Math.max(maxAbs, Math.abs(mine[i] - theirs[i])); if (floatToHalf(mine[i]) === hex[i]) sameBits++; }
    cmp(`DFG LUT: my integration encodes to three's half-float bits (${mine.length} values)`, sameBits, mine.length, 0);
    rows.push(`     DFG max |diff| ${maxAbs.toExponential(2)} against the decoded halves`);
  }

  /* 9. Raycaster hits on a mesh */
  {
    const geo = new THREE.SphereGeometry(1, 16, 12), mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial());
    mesh.position.set(0.3, 0.2, -0.5); mesh.rotation.set(0.4, 0.7, 0); mesh.scale.set(1.2, 0.9, 1.1); mesh.updateMatrixWorld();
    const cam = new THREE.PerspectiveCamera(50, 16 / 9, 0.1, 100); cam.position.set(0, 0.5, 4); cam.lookAt(0, 0, 0); cam.updateMatrixWorld();
    const rc = new THREE.Raycaster(), mine = M.sphereGeometry(1, 16, 12);
    let same = 0, total = 0, dmax = 0;
    for (let i = 0; i < 400; i++) {
      const x = rnd() * 2 - 1, y = rnd() * 2 - 1;
      rc.setFromCamera(new THREE.Vector2(x, y), cam);
      const hit = rc.intersectObject(mesh)[0];
      const ray = M.rayFromCamera(x, y, cam.matrixWorld.elements, cam.projectionMatrix.elements);
      const r2 = M.raycastMesh(mine, mesh.matrixWorld.elements, ray).hits[0];
      total++;
      if (!hit && !r2) same++;
      else if (hit && r2 && hit.faceIndex === r2.face) { same++; dmax = Math.max(dmax, Math.abs(hit.distance - r2.distance)); }
    }
    cmp(`Raycaster first hit (face index) on 400 rays`, same, total, 0);
    cmp('Raycaster hit distance', dmax, 0, 1e-6);
  }

  /* 10. slerp */
  {
    const a = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.2, 1.4, -0.5)), b = new THREE.Quaternion().setFromEuler(new THREE.Euler(2.5, -0.3, 1.1));
    for (const t of [0, 0.25, 0.5, 0.9, 1]) cmp(`Quaternion.slerp t=${t}`, M.qSlerp(a.toArray(), b.toArray(), t), a.clone().slerp(b, t).toArray(), 1e-12);
    const c = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.2, 1.4001, -0.5));
    cmp('Quaternion.slerp near-identical (lerp branch)', M.qSlerp(a.toArray(), c.toArray(), 0.3), a.clone().slerp(c, 0.3).toArray(), 1e-12);
  }

  /* 11. colour */
  {
    const c = new THREE.Color(); c.setRGB(0.5, 0.5, 0.5, THREE.LinearSRGBColorSpace); const s = {}; c.getRGB(s, THREE.SRGBColorSpace);
    cmp('ColorManagement linear 0.5 → sRGB', M.linearToSRGB(0.5), s.r, 1e-12);
  }

  console.log(rows.join('\n'));
  console.log(`${n - bad}/${n} comparisons agree`);
  process.exit(bad ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
