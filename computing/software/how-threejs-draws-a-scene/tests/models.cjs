'use strict';
// Pins the page's models without three.js. Every value marked "r187" was confirmed against three@0.187.0 by
// tools/crosscheck.cjs on 2026-11-20 (BRIEF.md has the run); the rest are hand-worked cases, closed forms and
// independent re-derivations. Also: every number the prose binds ({=…}), the copy keys app.js uses, zh/en parity,
// the English stub mark, language hygiene of index.html and the partials, and the registry.
// Run: node computing/software/how-threejs-draws-a-scene/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const M = require(path.join(DIR, 'models.js'));
const B = require(path.join(DIR, 'bindings.cjs'))(M);
const { unprefill } = require(path.join(DIR, '..', '..', '..', 'scripts', 'lib', 'prefill.cjs'));
const load = l => { const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, `copy.${l}.js`), 'utf8'), ctx); return ctx.window.ESSAY_COPY[l]; };
const Z = load('zh'), E = load('en');
const html = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(DIR, 'app.js'), 'utf8');

let n = 0, fails = 0;
function check(name, got, want) { n++; if (got !== want) { fails++; console.error(`FAIL ${name}: got ${got}, expected ${want}`); } }
function ok(name, cond, info) { n++; if (!cond) { fails++; console.error(`FAIL ${name}${info ? ': ' + info : ''}`); } }
function near(name, got, want, tol) { n++; if (!(Math.abs(got - want) <= tol)) { fails++; console.error(`FAIL ${name}: got ${got}, expected ${want} ± ${tol}`); } }
const arrNear = (a, b, tol) => a.length === b.length && a.every((v, i) => Math.abs(v - b[i]) <= tol);

/* ── 1. matrices and quaternions ── */
{
  // hand-worked: T(1,2,3) · R_y(90°) · S(2): column-major elements
  const m = M.m4compose([1, 2, 3], M.qAxis([0, 1, 0], Math.PI / 2), [2, 2, 2]);
  ok('compose T·R·S, hand-worked', arrNear(m, [0, 0, -2, 0, 0, 2, 0, 0, 2, 0, 0, 0, 1, 2, 3, 1], 1e-15), m.join());
  ok('invert × matrix = identity', arrNear(M.m4mul(M.m4invert(m), m), M.m4(), 1e-15));
  // r187 PerspectiveCamera(50, 16/9, 0.1, 2000).projectionMatrix, normal and reversed depth
  ok('projection matrix (r187)', arrNear(M.cameraProjection({ fov: 50, aspect: 16 / 9, near: 0.1, far: 2000 }), [1.2062851427866268, 0, 0, 0, 0, 2.1445069205095586, 0, 0, 0, 0, -1.00010000500025, -1, 0, 0, -0.200010000500025, 0], 1e-15));
  ok('reversed-depth projection (r187)', arrNear(M.cameraProjection({ fov: 50, aspect: 16 / 9, near: 0.1, far: 2000, reversed: true }), [1.2062851427866268, 0, 0, 0, 0, 2.1445069205095586, 0, 0, 0, 0, 0.00005000250012500625, -1, 0, 0, 0.1000050002500125, 0], 1e-15));
  // closed forms: e[0] = 1/(aspect·tan(fov/2)), e[10] = −(f+n)/(f−n), e[14] = −2fn/(f−n)
  const P = M.cameraProjection({ fov: 50, aspect: 16 / 9, near: 0.1, far: 2000 }), tf = Math.tan(25 * Math.PI / 180);
  near('e[0] = 1/(aspect·tan(fov/2))', P[0], 1 / (16 / 9 * tf), 1e-14);
  near('e[10] = −(f+n)/(f−n)', P[10], -2000.1 / 1999.9, 1e-14);
  // slerp
  const q0 = [0, 0, 0, 1], q1 = M.qAxis([0, 0, 1], Math.PI / 2);
  ok('slerp halfway of 90° is 45°', arrNear(M.qSlerp(q0, q1, 0.5), M.qAxis([0, 0, 1], Math.PI / 4), 1e-15));
  ok('slerp takes the short way (q and −q)', arrNear(M.qSlerp(q0, q1.map(v => -v), 0.5), M.qAxis([0, 0, 1], Math.PI / 4).map(v => -v), 1e-15) || arrNear(M.qSlerp(q0, q1.map(v => -v), 0.5), M.qAxis([0, 0, 1], Math.PI / 4), 1e-15));
  near('slerp t=0.3 angle is 0.3 × total', M.qAngle(q0, M.qSlerp(q0, q1, 0.3)), 0.3 * Math.PI / 2, 1e-14);
  const rp = M.rotationPaths([0.3, 0.2, 0], [3, 0.4, 3], 64);
  check('ch12 lab: total / slerp / Euler path, degrees', [rp.total, rp.slerpLen, rp.eulerLen].map(x => (x * 180 / Math.PI).toFixed(3)).join(), '148.408,148.408,263.179');
}

/* ── 2. the scene graph ── */
{
  const f = M.orreryFrame(0.29, 0.3);
  check('six nodes: six composes and five world products per frame (the root copies; r187 Object3D.updateMatrixWorld)', [f.tree.all.length, f.stats.compose, f.stats.world].join(), '6,6,5');
  near('moon orbit in world = 2 × earth scale 0.5', f.moonOrbitR, 1, 1e-12);
  near('moon orbit with earth scale 1.5', M.orreryFrame(0.29, 0.3, { earthScale: 1.5 }).moonOrbitR, 3, 1e-12);
  // the stale read is last frame's answer: equal to a fresh evaluation at the previous angle
  const prev = M.orrery(0.29); M.updateMatrixWorld(prev.scene, false);
  ok('stale = previous frame', arrNear(f.stale, M.worldPos(prev.moon), 1e-12));
  ok('lag > 0 when the scene moved', f.lag > 0.05, f.lag);
  // a node with matrixAutoUpdate false is not recomposed, but its world product still runs: the Scene root's own
  // updateMatrix sets its flag and forces every descendant (checked against three r187 in the review, 2026-11-20)
  const t = M.orrery(0.3, { staticSun: true }), st = { compose: 0, world: 0 }; M.updateMatrixWorld(t.scene, false, st);
  check('static sun: one compose fewer, world products unchanged', [st.compose, st.world].join(), '5,5');
}

/* ── 3. geometry (r187 BoxGeometry / SphereGeometry arrays) ── */
{
  const b = M.boxGeometry(1, 1, 1, 1, 1, 1);
  check('box first face positions (r187)', b.position.slice(0, 12).join(), '0.5,0.5,0.5,0.5,0.5,-0.5,0.5,-0.5,0.5,0.5,-0.5,-0.5');
  check('box first index entries (r187)', b.index.slice(0, 12).join(), '0,2,1,2,3,1,4,6,5,6,7,5');
  for (const s of [1, 2, 5, 16]) { const g = M.boxGeometry(1, 1, 1, s, s, s), c = M.boxCounts(s, s, s); check(`box ${s} segments: counts = arrays`, [c.vertices, c.triangles].join(), [g.position.length / 3, g.index.length / 3].join()); }
  for (const [w, h] of [[3, 2], [8, 6], [32, 16], [64, 32]]) { const g = M.sphereGeometry(1, w, h), c = M.sphereCounts(w, h); check(`sphere ${w}×${h}: counts = arrays`, [c.vertices, c.triangles].join(), [g.position.length / 3, g.index.length / 3].join()); }
  check('box 24 / 12, sphere(32,16) 561 / 960', [M.boxCounts(1, 1, 1).vertices, M.boxCounts(1, 1, 1).triangles, M.sphereCounts(32, 16).vertices, M.sphereCounts(32, 16).triangles].join(), '24,12,561,960');
  check('index type switches at 65,535 (r187: SphereGeometry(1,256,255) → Uint32)', [M.geomBytes(65535, 10).indexType, M.geomBytes(65536, 10).indexType, M.geomBytes(257 * 256, 10).indexType].join(), 'Uint16,Uint32,Uint32');
  check('32 bytes per vertex', M.geomBytes(1, 0).perVertex, 32);
}

/* ── 4. the camera chain and depth ── */
{
  const c = M.chain({ fov: 50, aspect: 16 / 9, near: 0.1, far: 2000, point: [1, 0.5, -10], width: 1280, height: 720 });
  ok('clip (r187 Vector4.applyMatrix4)', arrNear(c.clip, [1.2062851427866268, 1.0722534602547793, 9.800990049502474, 10], 1e-12), c.clip.join());
  ok('ndc', arrNear(c.ndc, [0.12062851427866268, 0.10722534602547792, 0.9800990049502474], 1e-15));
  check('window depth as 24-bit integer', c.depthInt, 16610273);
  near('window z = 0.5·ndc + 0.5', c.win[2], 0.9900495024751237, 1e-15);
  // depth step: the standard closed form against a numeric derivative of the window depth
  const D = 100, h = 1e-4, dz = (M.depthStd(D + h, 0.1, 2000) - M.depthStd(D - h, 0.1, 2000)) / (2 * h);
  near('standard depth step = 1/(2²⁴−1) ÷ dz/dD', M.depthStep(D, 0.1, 2000, 'standard', 24), 1 / (Math.pow(2, 24) - 1) / dz, 1e-9);
  check('z-fighting from (sep 0.01; near 0.1 / 1 / 0.01)', ['standard'].map(s => [0.1, 1, 0.01].map(nn => M.zFightFrom(0.01, nn, 2000, s, 24).toFixed(1)).join()).join(), '129.5,409.7,41.0');
  check('log and reversed: no z-fighting before far (sep 0.01)', [M.zFightFrom(0.01, 0.1, 2000, 'log', 24), M.zFightFrom(0.01, 0.1, 2000, 'reversed')].join(), 'Infinity,Infinity');
  near('90% of depth before 1 unit', M.depthStd(1, 0.1, 2000), 0.9000450022501125, 1e-15);
  check('ulp of 1 in float32', M.ulp32(1), Math.pow(2, -23));
}

/* ── 5. culling and sorting (decisions and orders confirmed against r187 Frustum and WebGLRenderList) ── */
{
  const f = M.cullFrame({ yaw: -0.3, far: 18, fov: 50 });
  check('default: opaque order (r187 painterSortStable)', f.opaque.map(i => i.id).join(' '), '18 4 8 11 2 5 10 17 3 6');
  check('default: transparent order (r187 reversePainterSortStable)', f.transparent.map(i => i.id).join(' '), '9 7');
  check('default: culled', f.culled.map(o => o.id).join(' '), '1 12 13 14 15 16');
  check('default: the one false positive', f.falsePos.map(o => o.id).join(), '11');
  check('material switches sorted / unsorted', [f.switches, M.cullFrame({ yaw: -0.3, far: 18, fov: 50, sort: false }).switches].join(), '3,10');
  const vis = (y, fa, fo) => { const g = M.cullFrame({ yaw: y, far: fa, fov: fo }); return g.opaque.concat(g.transparent).map(i => i.id).sort((a, b) => a - b).join(' '); };
  check('visible set yaw 0.4 (r187)', vis(0.4, 25, 60), '1 2 3 4 6 7 8 9 11 12 13 14 16 18');
  check('visible set yaw −0.75 (r187)', vis(-0.75, 14, 75), '3 4 5 7 8 12 17 18');
  // the sphere test is conservative: everything the exact test keeps, it keeps
  let missed = 0;
  for (let y = -0.8; y <= 0.8; y += 0.1) for (const fa of [8, 14, 20, 30]) { const g = M.cullFrame({ yaw: y, far: fa, fov: 50 }); for (const ob of g.culled) if (M.circleMeetsPolygon([ob.x, ob.z], ob.r, g.poly)) missed++; }
  check('sphere test never culls a visible object', missed, 0);
}

/* ── 6. program cache keys (string format confirmed identical to r187 getProgramCacheKey) ── */
{
  const P = M.programs({ dir: 1, point: 0 });
  check('six materials, five programs; floor and wood share', [P.distinct, P.keys[0] === P.keys[1]].join(), '5,true');
  check('brass key (r187 format)', P.keys[2], 'physical,STANDARD,,highp,srgb,false,false,,,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,,false,false,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,8388608,8519682,srgb,');
  const base = { dir: 1, point: 0, shadows: false, fog: false, toneMapping: false };
  // after one frame in `base`, what the next frame compiles. Expected values measured with three r187 in Chromium for
  // all 16 combinations of the four switches (review 2026-11-20): a light, shadows or fog re-key the five lit materials
  // (4 new programs, the sky's Basic material keeps its program); tone mapping re-keys all six (5 new).
  const T = ['point', 'shadows', 'fog', 'toneMapping'], got = [];
  for (let m = 0; m < 16; m++) { const s = Object.assign({}, base); T.forEach((k, i) => { if (m >> i & 1) s[k] = k === 'point' ? 1 : true; }); const r = M.programsAfter(base, s); got.push(r.fresh + '/' + r.distinct + '/' + r.refetched.map(Number).join('')); }
  check('16 switch combinations as measured in r187', got.join(' '), '0/5/000000 ' + Array(7).fill('4/5/111101').join(' ') + ' ' + Array(8).fill('5/5/111111').join(' '));
  check('one more light: four new programs, Basic keeps its own', M.newPrograms(base, Object.assign({}, base, { point: 1 })), 4);
  ok('the Basic material key holds the light counts', M.programs({ dir: 1, point: 1 }).keys[4].includes(',1,1,0,0,'));
}

/* ── 7. BRDF ── */
{
  // prose: the 16 × 16 table's last cell is centred at roughness 0.96875, so the shader reads about 65% lost at roughness 1
  { const d = M.dfgLookup(1, 1); check('table read at roughness 1, head-on: about 65% lost', Math.round((1 - d[0] - d[1]) * 100), 65); }
  near('D_GGX at α = 1 is 1/π for any N·H', M.D_GGX(1, 0.3), 1 / Math.PI, 1e-15);
  near('D_GGX peak = 1/(π α²)', M.D_GGX(0.25, 1), 1 / (Math.PI * 0.0625), 1e-12);
  near('V at N·L = N·V = 1 is 1/4 (the 4·NL·NV denominator)', M.V_GGX_SmithCorrelated(0.3, 1, 1), 0.25, 1e-15);
  near('F_Schlick(V·H = 1) = F0', M.F_Schlick(0.04, 1, 1), 0.04, 1e-3);
  near('F_Schlick(V·H = 0) = F90 (Epic exp2 form: 2^0 = 1)', M.F_Schlick(0.04, 1, 0), 1, 1e-15);
  // three's DFGLUTData.js (r187) half floats at three texels; the page integrates its own table
  const T = M.dfgTable(), h = (x, bits) => { const v = M.halfToFloat(bits); return Math.abs(x - v) <= Math.max(Math.abs(v) * 2 ** -11, 2 ** -25); };
  ok('DFG texel (0,0) = 0x30b5, 0x3ad1 (r187)', h(T[0][0], 0x30b5) && h(T[0][1], 0x3ad1), T[0].join());
  ok('DFG texel (15,7) = 0x37c7, 0x1c1e (r187)', h(T[127][0], 0x37c7) && h(T[127][1], 0x1c1e), T[127].join());
  ok('DFG texel (15,15) = 0x3586, 0x049f (r187)', h(T[255][0], 0x3586) && h(T[255][1], 0x049f), T[255].join());
  // white furnace by brute force (a uniform grid over the hemisphere, independent of the importance sampler)
  const furnace = (r, mu) => { const a = r * r, V = [Math.sqrt(1 - mu * mu), 0, mu], N = 300; let s = 0; for (let i = 0; i < N; i++) for (let j = 0; j < 4 * N; j++) { const ct = (i + 0.5) / N, st = Math.sqrt(1 - ct * ct), ph = (j + 0.5) / (4 * N) * 2 * Math.PI, L = [st * Math.cos(ph), st * Math.sin(ph), ct], H = M.norm(M.add(L, V)); s += M.D_GGX(a, H[2]) * M.V_GGX_SmithCorrelated(a, ct, mu) * ct / N * (2 * Math.PI / (4 * N)); } return s; };
  near('energy lost, roughness 1, head-on = 1 − brute-force albedo', M.energyLost(1, 1), 1 - furnace(1, 1), 1e-3);
  near('energy lost, roughness 0.5, head-on', M.energyLost(0.5, 1), 1 - furnace(0.5, 1), 1e-3);
  const s = M.shade({ N: [0, 0, 1], V: [0, 0, 1], L: [0, 0, 1], roughness: 1, metalness: 1, color: [1, 1, 1] });
  near('compensation restores a white metal: spec × (1/E) with F0 = 1', s.spec[0] / M.shade({ N: [0, 0, 1], V: [0, 0, 1], L: [0, 0, 1], roughness: 1, metalness: 1, color: [1, 1, 1], noMS: true }).spec[0], 1 / s.Ess, 1e-12);
  near('sRGB: linear 0.5 → 0.735 (r187 ColorManagement)', M.linearToSRGB(0.5), 0.7353606352856508, 1e-12);
}

/* ── 8. rasterisation ── */
{
  check('two triangles of a square: each centre once', JSON.stringify(M.sharedEdgeCoverage(16, 16, [[2, 2], [14, 2], [14, 14], [2, 14]])), '{"once":144,"twice":0}');
  check('…also off the pixel grid', JSON.stringify(M.sharedEdgeCoverage(16, 16, [[2.5, 2.5], [13.5, 2.5], [13.5, 13.5], [2.5, 13.5]])), '{"once":121,"twice":0}');
  check('opaque pair: draw order changes no pixel', M.orderDiff('pair', { tilt: 0.6 }), 0);
  check('crossing glass: both orders wrong in 317 pixels', [M.glassWrong('gc'), M.glassWrong('cg'), M.glassWrong('gc', { depthWrite: false })].join(), '317,317,317');
  check('separate glass: back to front right, front to back 455 wrong', [M.glassWrong('gc', { cross: false }), M.glassWrong('cg', { cross: false })].join(), '0,455');
  const c1 = M.rasterScene('checker', { perspective: true }), c2 = M.rasterScene('checker', { perspective: false }); let d = 0;
  for (let i = 0; i < c1.w * c1.h; i++) if (Math.abs(c1.color[i * 3] - c2.color[i * 3]) > 1e-6) d++;
  check('checker without perspective correction: pixels that differ', d, 707);
  // perspective-correct interpolation of u along a segment: eq. 3.7 against the true point
  const fb = M.framebuffer(1, 1); M.rasterTriangle(fb, [[0, 0, 0.5, 1], [4, 0, 0.5, 4], [0, 4, 0.5, 1]], [[0], [1], [0]], v => { fb.u = v[0]; return [1, 1, 1, 1]; }, {});
  near('eq. 3.7 at pixel (0.5, 0.5)', fb.u, (0.125 / 4) / (0.75 + 0.125 / 4 + 0.125), 1e-12);
}

/* ── 9. textures ── */
{
  check('mip levels of 1024² (r187 getMipLevels)', M.mipLevels(1024), 11);
  near('mip chain = 4/3 of the base', M.textureBytes(1024, 4, true) / M.textureBytes(1024, 4, false), 4 / 3, 1e-6);
  check('λ for an 8 × 1 footprint, isotropic: log₂ 8 = 3', M.lod(8, 0, 0, 1, 1).lambda, 3);
  check('…anisotropic 8×: N = 8, λ′ = 0', [M.lod(8, 0, 0, 1, 8).N, M.lod(8, 0, 0, 1, 8).lambda].join(), '8,0');
  check('…anisotropic 4×: N = 4, λ′ = 1', [M.lod(8, 0, 0, 1, 4).N, M.lod(8, 0, 0, 1, 4).lambda].join(), '4,1');
  check('checker mips: levels 0–3 crisp, level 4 grey', [3, 4].map(l => [...new Set(M.MIPS[l])].sort().join('/')).join(' '), '0/1 0.5');
  const fe = f => M.floorView({ w: 96, h: 56, filter: f, maxAniso: 8, pitch: 12 });
  check('floor far error / mid contrast (nearest, linear, trilinear, aniso)', ['nearest', 'linear', 'trilinear', 'aniso'].map(f => { const v = fe(f); return v.farError.toFixed(3) + '/' + v.midContrast.toFixed(3); }).join(' '), '0.500/0.500 0.420/0.437 0.027/0.293 0.105/0.383');
}

/* ── 10. shadows ── */
{
  const r = b => M.shadowRun({ theta: 0.6, res: 64, bias: b });
  check('acne at bias 0 / −0.003 / −0.03 (θ 0.6, 64 texels)', [0, -0.003, -0.03].map(b => r(b).acne.toFixed(3)).join(), '0.508,0.053,0.006');
  check('leak at the same biases', [0, -0.003, -0.03].map(b => r(b).leak.toFixed(3)).join(), '0.015,0.030,0.554');
  check('peter-panning: gap under the post at bias −0.03', M.contactGap({ theta: 0.6, res: 64, bias: -0.03 }).toFixed(3), '0.280');
  ok('more texels, less acne at a small bias', M.shadowRun({ theta: 0.6, res: 256, bias: -0.001 }).acne < r(-0.001).acne);
  check('texel width = 14 / res', r(0).texel, 14 / 64);
}

/* ── 11. draw calls ── */
{
  const f = o => M.frameCost(Object.assign({ n: 1000 }, o));
  check('separate: N calls, N × cost', [f({ strategy: 'separate' }).calls, f({ strategy: 'separate' }).cpuMs].join(), '1000,1');
  check('instanced: one call; moving re-uploads 64 bytes each', [f({ strategy: 'instanced' }).calls, f({ strategy: 'instanced', moving: true }).upload].join(), '1,64000');
  check('merged cannot move', f({ strategy: 'merged', moving: true }).na, true);
  check('calls per 60 Hz frame at 1 µs', M.callsPerFrame(1), 16666);
  check('fable-flight: 24 vertices, 30 triangles a page; 720,000 triangles; 864,000 bytes of instance data', JSON.stringify(M.fableStats()), '{"vertsPerPage":24,"trisPerPage":30,"triangles":720000,"instanceBytes":864000}');
  ok('measured values carry machine and date', /Apple M6/.test(M.MEASURED.machine) && M.MEASURED.date === '2026-11-20');
  check('default per-call cost is the labelled parameter', M.CALL_DEFAULTS.usPerCall, 1);
}

/* ── 12. picking ── */
{
  const r = M.intersectTriangle([0.2, 0.3, 5], [0, 0, -1], [0, 0, 0], [1, 0, 0], [0, 1, 0], true);
  ok('watertight test: hit at t = 5, barycentrics (0.5, 0.2, 0.3)', r && Math.abs(r.t - 5) < 1e-15 && arrNear(r.bary, [0.5, 0.2, 0.3], 1e-15), JSON.stringify(r));
  check('back face culled', M.intersectTriangle([0.2, 0.3, -5], [0, 0, 1], [0, 0, 0], [1, 0, 0], [0, 1, 0], true), null);
  // a ray through the shared edge of two triangles hits at least one of them (no crack)
  const e = M.intersectTriangle([0.5, 0.5, 5], [0, 0, -1], [0, 0, 0], [1, 0, 0], [0, 1, 0], true), e2 = M.intersectTriangle([0.5, 0.5, 5], [0, 0, -1], [1, 0, 0], [1, 1, 0], [0, 1, 0], true);
  ok('shared edge is watertight', !!(e || e2));
  const GEO = M.sphereGeometry(1, 16, 12), BS = M.boundingSphere(GEO.position), W = M.m4compose([0, 0, 0], M.qEuler(0, 0.5, 0.25), [1.5, 0.8, 1]);
  const camW = M.lookAtWorld([0, 0.6, 4.2], [0, 0, 0]), proj = M.cameraProjection({ fov: 50, aspect: 16 / 9, near: 0.1, far: 100 });
  const ray = (x, y) => M.raycastMesh(GEO, W, M.rayFromCamera(x, y, camW, proj), BS);
  const a = ray(0.12, 0.08), b = ray(0.9, 0.9), c = ray(0, 0.42);
  check('ch12 default: sphere hit, 352 triangles tested, face 118', [a.sphere, a.tested, a.hits[0].face, a.hits[0].distance.toFixed(6)].join(), 'true,352,118,3.364221');
  check('outside the bounding sphere: nothing tested', [b.sphere, b.tested].join(), 'false,0');
  check('inside the sphere, outside the mesh: all tested, no hit', [c.sphere, c.tested, c.hits.length].join(), 'true,352,0');
}

/* ── 13. bindings: every prose number ── */
{
  const want = { 'ch2.nodes': '6', 'ch2.compose': '6', 'ch2.world': '5', 'ch2.orbit': '1.0', 'ch3.boxV': '24', 'ch3.boxT': '12', 'ch3.sphV': '561', 'ch3.sphT': '960', 'ch3.sphBytes': '17,952 + 5,760 = 23,712 B',
    'ch4.clip': '1.2063, 1.0723, 9.8010, 10.0000', 'ch4.ndc': '0.1206, 0.1072, 0.9801', 'ch4.px': '(717.2, 398.6)', 'ch4.win': '0.99005', 'ch4.int': '16,610,273', 'ch4.first1': '90%', 'ch4.zf': '130', 'ch4.zf1': '410', 'ch4.zf001': '41',
    'ch6.first': '96', 'ch6.ten': '36', 'ch6.each': '3.6', 'ch7.lost05': '8%', 'ch7.lost10': '69%', 'ch8.sq': '144',
    'ch9.base': '4.00 MiB', 'ch9.mip': '5.33 MiB', 'ch9.lin': '0.214', 'ch9.srgb': '0.735', 'ch9.srgb8': '188',
    'ch11.k1': '0.32', 'ch11.per': '0.32', 'ch11.perOwn': '0.61', 'ch11.cap': '16,666', 'ch11.fv': '24', 'ch11.ft': '30', 'ch11.fb': '843.8 KiB', 'ch11.ftot': '720,000', 'ch11.fpages': '24,000', 'ch11.flo': '7.7', 'ch11.fhi': '24' };
  check('binding names', Object.keys(B).sort().join(), Object.keys(want).sort().join());
  for (const k in want) check('binding ' + k, B[k], want[k]);
}

/* ── 14. copy, parity, language hygiene ── */
{
  const keys = [...app.matchAll(/\bt\('([\w.]+)'/g)].map(m => m[1]).filter(k => !k.endsWith('.'));
  const missing = [...new Set(keys)].filter(k => Z[k] == null);
  check('every literal key app.js reads exists', missing.join(), '');
  const PJ = JSON.parse(fs.readFileSync(path.join(DIR, 'page.json'), 'utf8'));
  const dyn = Object.entries(PJ.dynamicKeys).flatMap(([p, vs]) => vs.map(v => p + '.' + v));
  check('dynamic keys exist', dyn.filter(k => Z[k] == null).join(), '');
  check('dynamic keys cover the models', [M.LAB_MATERIALS.map(m => m.name).join(), PJ.dynamicKeys['ch6.mat'].join()].join('|'), [PJ.dynamicKeys['ch6.mat'].join(), PJ.dynamicKeys['ch6.mat'].join()].join('|'));
  check('zh and en have the same keys', Object.keys(Z).sort().join(), Object.keys(E).sort().join());
  const ph = s => (String(s).match(/\{[a-zA-Z_]\w*\}/g) || []).sort().join();
  check('runtime placeholders match in zh and en', Object.keys(Z).filter(k => ph(Z[k]) !== ph(E[k])).join(), '');
  // English was translated and reviewed (2026-11-20): no stub flag in page.json or on <html>, and no Chinese in the English copy
  check('English is complete, not a stub (page.json and <html>)', [String((PJ.languages || {}).en), /data-lang-en="stub"/.test(html)].join(), 'undefined,false');
  check('no Chinese in the English copy', Object.keys(E).filter(k => /[㐀-鿿]/.test(E[k])).join(), '');
  check('page.json has no registry fields (unregistered draft)', ['status', 'category', 'subtopic', 'path', 'order'].filter(k => k in PJ).join(), '');
  let h = unprefill(html, Z).replace(/<div[^>]*id="langToggle"[\s\S]*?<\/div>/, '').replace(/<title>[\s\S]*?<\/title>/, '').replace(/<meta[^>]*>/g, '').replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
  const cjk = h.match(/[^\n]{0,30}[㐀-鿿][^\n]{0,30}/g) || [];
  check('no Chinese in index.html outside pre-filled copy', cjk.slice(0, 3).join(' | '), '');
  for (const f of fs.readdirSync(path.join(DIR, 'figures'))) { const s = fs.readFileSync(path.join(DIR, 'figures', f), 'utf8'); ok(`figures/${f} has no Chinese`, !/[㐀-鿿]/.test(s)); }
  const raw = [...fs.readdirSync(path.join(DIR, 'figures')).filter(f => f.startsWith('dg-')).map(f => fs.readFileSync(path.join(DIR, 'figures', f), 'utf8')).join('').matchAll(/<text [^>]*>([^<]+)<\/text>/g)].map(m => m[1]);
  const neutral = s => /^([0-9²]+|GPU)$/.test(s);
  ok('literal diagram text is only digits, sizes and GPU', raw.every(neutral), raw.filter(s => !neutral(s)).join(' | '));
  ok('every diagram text has explicit x, y, font-size ≥ 14', [...fs.readdirSync(path.join(DIR, 'figures')).filter(f => f.startsWith('dg-')).map(f => fs.readFileSync(path.join(DIR, 'figures', f), 'utf8')).join('').matchAll(/<text ([^>]*)>/g)].every(m => /\bx="/.test(m[1]) && /\by="/.test(m[1]) && +(m[1].match(/font-size="([\d.]+)"/) || [0, 0])[1] >= 14));
  check('eleven diagrams', fs.readdirSync(path.join(DIR, 'figures')).filter(f => f.startsWith('dg-')).length, 11);
  ok('the pinned release is on the page', /r187/.test(Z['hero.note'] || Object.values(Z).join(' ')) && /three@0\.187\.0/.test(Object.values(Z).join(' ')));
}

/* ── 15. registry ── */
{
  const R = JSON.parse(fs.readFileSync(path.join(DIR, 'REGISTRY.json'), 'utf8'));
  check('registry title = zh hero', R.title.zh, 'Three.js 是怎么把一个场景画出来的');
  check('registry desc = doc.desc', R.desc.zh, Z['doc.desc']);
  check('registry en desc = en doc.desc', R.desc.en, E['doc.desc']);
  check('registry en title = en hero', R.title.en, E['hero.title']);
  check('subtopic', [R.category, R.subtopic, R.path].join(), 'computing,software,computing/software/how-threejs-draws-a-scene/');
  for (const c of R.concepts) ok(`concept ${c.id} anchor ${c.anchor} exists`, html.includes(`id="${c.anchor.slice(1)}"`));
  const sq = s => s.normalize('NFKC').toLowerCase().replace(/[\s\-‐-―_·・'’]/gu, '');
  const all = R.concepts.flatMap(c => [...new Set([...c.aliases.zh, ...c.aliases.en].map(sq))]);
  check('no alias owned by two concepts of this page', all.filter((a, i) => all.indexOf(a) !== i).join(), '');
  // how-pixels-reach-a-screen #framebuffer owns these (checked against every REGISTRY.json and atlas/graph/aliases.json, 2026-11-20)
  check('no alias a sibling owns', all.filter(a => ['srgb和线性', 'srgbvslinear'].includes(a)).join(), '');
}

console.log(`${n - fails}/${n} checks passed`);
if (fails) process.exit(1);
