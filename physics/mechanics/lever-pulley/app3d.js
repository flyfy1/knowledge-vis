import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* 杠杆与滑轮 · 支点挪一挪，省力见分晓 — 3D 呈现版（Three.js 自托管 three@0.180.0，页内 vendor/three/）
   依赖 i18n.js 先行加载：t() / getLang() / onLangRefresh()。

   ★ 红线落点（与 2D 逻辑版一致，评审 55/60 必须级 0 的逻辑原样保留）：
   1. 力矩/力/功全部由 PURE 纯函数实算（g = 10 N/kg），3D 姿态、读数、平衡判定同源；
      平衡判定 |M左 − M右| ≤ 1e-9，不放宽。PURE 区与 2D 版逐字节相同（哈希见 lab/build-report-3d.md）。
   2. 跷跷板倾斜角是示意量（θ = ΔM × 0.06°，钳制 ±18°）；撬棍/滑轮的位移是实算量
      （同一转角下弧长 = 力臂 × 转角；滑轮 h = s/n），两口径不混。
   3. 滑轮组图上承重绳段由 pulleyScene 统一产出：段数（bearing 段计数）与公式 n 同源；
      自由端绳段按拉出长度 s 延长（手随绳端移动），图上绳总长恒定 —— 绳长守恒可见。
   4. 功账本两条进度条在同一 rAF 帧里按同一 prog 更新，恒同步。
   5. 自测答案提示（s5hint）走门控：三题全对前 DOM 不渲染。
   对账入口：window.LEVER（PURE 函数 + pulleyScene + state）、window.LEVER3D（3D 场景面）。 */
const $ = id => document.getElementById(id);

/* ================= PURE-BEGIN ================= */
const G_ACC = 10; /* 全页统一 g = 10 N/kg */
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
/* 重力（N）= 质量（kg）× g */
function weightOf(massKg) { return massKg * G_ACC; }
/* 力矩（N·m）= 力 × 力臂 */
function torqueOf(F, L) { return F * L; }
/* 平衡判定：容差只防浮点尾巴，不得放宽成「差不多平」 */
function isBalanced(mL, mR) { return Math.abs(mL - mR) <= 1e-9; }
/* 跷跷板倾斜角（示意量，度）：力矩差越大倾得越多，钳制 ±18°；正值 = 左沉 */
function seesawTiltDeg(mL, mR) { return clamp((mL - mR) * 0.06, -18, 18); }
/* 杠杆平衡条件 F × Ld = G × Lr 解出的动力 */
function leverForce(G, Lr, Ld) { return G * Lr / Ld; }
/* 同一转角下的弧长（实算量）= 力臂 × 转角（rad） */
function arcLen(L, theta) { return L * theta; }
/* 定滑轮：F = G（只改方向） */
function fixedForce(G) { return G; }
/* n 段承重绳滑轮组：F = G/n */
function groupForce(G, n) { return G / n; }
/* 滑轮组重物升距：h = s/n */
function riseOf(s, n) { return s / n; }
/* 功（J）= 力 × 沿力方向的距离 */
function workOf(F, s) { return F * s; }

/* 滑轮组几何（数据坐标：米，y 向下，横梁在 y=0；blockY = 动滑轮轴心高）
   返回：segs 直线段（bearing=承重段）、wheels 轮（fixed=定滑轮）、
   arcs 绕轮弧（canvas 角度，a0→a1，ccw=是否逆时针）、block 动滑轮横担、weightCx 重物中心 x、freeDir 自由端方向。
   绕法（全页统一）：n=2 锚点在横梁→绕动滑轮→自由端向上出绳；
   n=3 锚点在动滑轮横担→上绕定滑轮→下绕动滑轮→上绕定滑轮→自由端向下；
   n=4 锚点在横梁→动→定→动→自由端向上。承重段数恒 == n。 */
function pulleyScene(n, blockY) {
  const RM = 0.16, RF = 0.15, FY = 0.30;         /* 动/定滑轮半径、定滑轮轴心高 */
  const barY = blockY - RM - 0.14;               /* 动滑轮横担高 */
  const arcM = (cx) => ({ cx: cx, cy: blockY, r: RM, a0: Math.PI, a1: 0, ccw: true });   /* 动滑轮：绕底 */
  const arcF = (cx) => ({ cx: cx, cy: FY, r: RF, a0: Math.PI, a1: 0, ccw: false });     /* 定滑轮：绕顶 */
  if (n === 2) {
    return {
      segs: [
        { a: [0.84, 0.02], b: [0.84, blockY], bearing: true },
        { a: [1.16, blockY], b: [1.16, -0.18], bearing: true }
      ],
      wheels: [{ x: 1.00, y: blockY, r: RM, fixed: false }],
      arcs: [arcM(1.00)],
      block: { x0: 0.76, x1: 1.24, y: barY },
      anchor: [0.84, 0.02], weightCx: 1.00, freeDir: 'up', freeTip: [1.16, -0.18]
    };
  }
  if (n === 3) {
    return {
      segs: [
        { a: [0.91, barY], b: [0.91, FY], bearing: true },
        { a: [1.21, FY], b: [1.21, blockY], bearing: true },
        { a: [1.53, blockY], b: [1.53, FY], bearing: true },
        { a: [1.83, FY], b: [1.83, 1.55], bearing: false }
      ],
      wheels: [
        { x: 1.06, y: FY, r: RF, fixed: true },
        { x: 1.37, y: blockY, r: RM, fixed: false },
        { x: 1.68, y: FY, r: RF, fixed: true }
      ],
      arcs: [arcF(1.06), arcM(1.37), arcF(1.68)],
      block: { x0: 0.80, x1: 1.60, y: barY },
      anchor: [0.91, barY], weightCx: 1.20, freeDir: 'down', freeTip: [1.83, 1.55]
    };
  }
  /* n === 4 */
  return {
    segs: [
      { a: [0.84, 0.02], b: [0.84, blockY], bearing: true },
      { a: [1.16, blockY], b: [1.16, FY], bearing: true },
      { a: [1.46, FY], b: [1.46, blockY], bearing: true },
      { a: [1.78, blockY], b: [1.78, -0.18], bearing: true }
    ],
    wheels: [
      { x: 1.00, y: blockY, r: RM, fixed: false },
      { x: 1.31, y: FY, r: RF, fixed: true },
      { x: 1.62, y: blockY, r: RM, fixed: false }
    ],
    arcs: [arcM(1.00), arcF(1.31), arcM(1.62)],
    block: { x0: 0.76, x1: 1.86, y: barY },
    anchor: [0.84, 0.02], weightCx: 1.31, freeDir: 'up', freeTip: [1.78, -0.18]
  };
}
/* 数值显示：两小数内精确 → 原样（整数优先）；否则 ≈ + 一位小数。负号统一 U+2212。 */
function fmtNum(x) {
  if (!isFinite(x)) return '∞';
  const r2 = Math.round(x * 100) / 100;
  let s;
  if (Math.abs(x - r2) < 1e-9) s = String(r2);
  else s = '≈' + (Math.round(x * 10) / 10);
  return s.replace(/-/g, '−');
}
/* ================= PURE-END ================= */

/* 小弧长专用显示（仅图上标注用）：一位小数会舍成 0 时改报两位小数，避免「抬起 ≈0 m」的假象；
   读数与账本仍走 fmtNum 全站口径，此函数不进 PURE、不进对账面。 */
function arcFmt(x) {
  if (Math.abs(x) >= 0.095) return fmtNum(x);
  return '≈' + (Math.round(x * 100) / 100);
}

/* ---------- 状态（与 2D 版一致） ---------- */
const S = {
  s0: { a: 1.0, k: 2.0 },                       /* 大人/小孩距支点（m，0.2 格） */
  s1: { Lr: 0.3, prog: 0, playing: false },     /* 撬棍：阻力臂 + 试撬进度 */
  s2: { ratio: 3, prog: 0, playing: false },    /* 功账本：力臂比档 + 撬起进度 */
  s3: { dir: 'down', s: 0 },                    /* 定滑轮：方向 + 拉绳长 */
  s4: { mode: 'single', n: 3, sSingle: 0, sGroup: 0, lit: 0 },
  s5: { picks: {}, wrong: {}, locked: {} }
};
const S4G = { single: 400, group: 600 };        /* 第 4 步两场景重物重力（N） */
const RATIOS = { 2: { Ld: 1.2, Lr: 0.6 }, 3: { Ld: 1.2, Lr: 0.4 }, 4: { Ld: 1.2, Lr: 0.3 } };
const S2_THETA = 0.5, S1_THETA = 0.12;
const S4_BLOCK0 = 2.05;

/* ================= 3D 基础设施（与 space-diagonal 转正版同款式） ================= */
const COL = { cyan: '#6ee7ff', orange: '#ffb454', pink: '#ff7a93', green: '#7ee2a8', muted: '#9aa7b8', paper: '#c9d4e2' };
const HEX = { cyan: 0x6ee7ff, orange: 0xffb454, pink: 0xff7a93, green: 0x7ee2a8, muted: 0x9aa7b8, paper: 0xc9d4e2, wood: 0xc9a05e, rock: 0x8d99ae, panel: 0x1c2330, beam: 0x243044 };
const _matCache = new Map();
function lam(hex, opts) {
  const key = hex + '|' + JSON.stringify(opts || {});
  if (!_matCache.has(key)) {
    const m = new THREE.MeshLambertMaterial(Object.assign({ color: hex }, opts || {}));
    m.userData.shared = true;
    _matCache.set(key, m);
  }
  return _matCache.get(key);
}
const V3 = (x, y, z) => new THREE.Vector3(x, y, z || 0);

function rod(parent, p, q, hex, r, mat) {
  const delta = q.clone().sub(p);
  const len = delta.length();
  if (len < 1e-9) return null;
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 10), mat || lam(hex));
  mesh.position.copy(p).add(q).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(V3(0, 1, 0), delta.normalize());
  parent.add(mesh);
  return mesh;
}
function box(parent, w, h, d, mat, x, y, z) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}
function edges(parent, mesh, hex, opacity) {
  const e = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry),
    new THREE.LineBasicMaterial({ color: hex, transparent: true, opacity: opacity === undefined ? 0.55 : opacity })
  );
  e.position.copy(mesh.position);
  e.rotation.copy(mesh.rotation);
  e.scale.copy(mesh.scale);
  parent.add(e);
  return e;
}
function ball(parent, r, hex, x, y, z, mat) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), mat || lam(hex));
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}
function coneDown(parent, r, h, hex, x, y, z) {
  const mesh = new THREE.Mesh(new THREE.ConeGeometry(r, h, 12), lam(hex));
  mesh.rotation.x = Math.PI; /* 尖朝下 */
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}
function coneUp(parent, r, h, hex, x, y, z) {
  const mesh = new THREE.Mesh(new THREE.ConeGeometry(r, h, 12), lam(hex));
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}
function tube(parent, pts, r, mat, segs) {
  const curve = new THREE.CatmullRomCurve3(pts);
  const geo = new THREE.TubeGeometry(curve, segs || Math.max(8, pts.length * 3), r, 7, false);
  const mesh = new THREE.Mesh(geo, mat);
  parent.add(mesh);
  return mesh;
}
function prism(parent, halfW, h, depth, mat) {
  /* 三角棱柱：底边在 y=0、顶点在 y=h，沿 z 居中 */
  const shape = new THREE.Shape();
  shape.moveTo(-halfW, 0); shape.lineTo(halfW, 0); shape.lineTo(0, h); shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: depth, bevelEnabled: false });
  geo.translate(0, 0, -depth / 2);
  const mesh = new THREE.Mesh(geo, mat);
  parent.add(mesh);
  return mesh;
}

/* ---------- 场景工厂：渲染器/相机/OrbitControls/标签层/视角适配 ---------- */
const scenes = [];
const dirty = new Set();
let rafId = 0;
function schedule(s) {
  if (s) dirty.add(s);
  if (!rafId && !document.hidden) rafId = requestAnimationFrame(frameLoop);
}
function frameLoop() {
  rafId = 0;
  for (const s of dirty) renderScene(s);
  dirty.clear();
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { if (rafId) cancelAnimationFrame(rafId); rafId = 0; }
  else scenes.forEach(schedule);
});

function fitCamera(s, dirOverride) {
  const box3 = s.fitBox;
  if (!box3 || box3.isEmpty()) return;
  const sphere = box3.getBoundingSphere(new THREE.Sphere());
  const center = sphere.center, radius = Math.max(0.6, sphere.radius);
  let dir;
  if (dirOverride) dir = dirOverride.clone().normalize();
  else {
    dir = s.camera.position.clone().sub(s.controls.target);
    if (dir.lengthSq() < 1e-8) dir = s.defaultDir.clone();
    dir.normalize();
  }
  const w = s.canvas.clientWidth || 1, h = s.canvas.clientHeight || 1;
  const aspect = w / h;
  const halfV = THREE.MathUtils.degToRad(s.camera.fov) / 2;
  const halfH = Math.atan(Math.tan(halfV) * aspect);
  const dist = radius / Math.sin(Math.min(halfV, halfH)) * 1.01;
  s.camera.position.copy(center).addScaledVector(dir, dist);
  s.controls.target.copy(center);
  s.camera.near = Math.max(0.05, dist - radius * 3);
  s.camera.far = dist + radius * 5;
  s.camera.updateProjectionMatrix();
}
function renderScene(s) {
  const w = s.canvas.clientWidth, h = s.canvas.clientHeight;
  if (!w || !h) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  s.renderer.setPixelRatio(dpr);
  s.renderer.setSize(w, h, false);
  s.controls.update();
  s.renderer.render(s.scene3, s.camera);
  for (const lab of s.labels) {
    const q = lab.getPos().clone().project(s.camera);
    if (q.z > 1 || q.z < -1) { lab.el.style.display = 'none'; continue; }
    lab.el.style.display = '';
    const x = Math.max(30, Math.min(w - 30, (q.x + 1) * w / 2 + lab.dx));
    const y = Math.max(14, Math.min(h - 14, (1 - q.y) * h / 2 + lab.dy));
    lab.el.style.transform = 'translate(' + x + 'px,' + y + 'px) translate(-50%,-50%)';
  }
  s.frames++;
}
function mkLabel(s, text, color, getPos, opts) {
  opts = opts || {};
  const el = document.createElement('span');
  el.className = 'scene-label' + (opts.cls ? ' ' + opts.cls : '');
  el.textContent = text;
  if (color) el.style.color = color;
  s.labelsHost.appendChild(el);
  const lab = { el: el, getPos: getPos, dx: opts.dx || 0, dy: opts.dy || 0 };
  s.labels.push(lab);
  return lab;
}
const anchorOf = (obj, v) => () => obj.localToWorld(v.clone());
const fixedOf = v => () => v;

function makeStage(step, canvasId, viewBtnId, defaultDir, buildFn, worldFn) {
  const canvas = $(canvasId);
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  } catch (e) {
    const el = $('gl-fail');
    if (el) { el.textContent = t('glFail'); el.hidden = false; }
    throw e;
  }
  const scene3 = new THREE.Scene();
  scene3.add(new THREE.HemisphereLight(0xcceaff, 0x18202c, 2));
  const sun = new THREE.DirectionalLight(0xffffff, 2.2);
  sun.position.set(-4, 9, -6);
  scene3.add(sun);
  const world = new THREE.Group();
  scene3.add(world);
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  const s = {
    step: step, canvas: canvas, renderer: renderer, scene3: scene3, world: world,
    camera: camera, labelsHost: canvas.parentElement.querySelector('.labels'),
    labels: [], frames: 0, model: null, fitBox: null,
    defaultDir: V3(defaultDir[0], defaultDir[1], defaultDir[2]).normalize(),
    build: buildFn, visible: false
  };
  camera.position.copy(s.defaultDir).multiplyScalar(8);
  const controls = new OrbitControls(camera, canvas);
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.enableDamping = false;
  controls.minPolarAngle = 0.12;
  controls.maxPolarAngle = Math.PI - 0.12;
  controls.touches.ONE = THREE.TOUCH.ROTATE;
  s.controls = controls;
  controls.addEventListener('change', () => schedule(s));
  canvas.addEventListener('keydown', ev => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(ev.key)) return;
    ev.preventDefault();
    const sph = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
    sph.theta += ev.key === 'ArrowLeft' ? -0.12 : ev.key === 'ArrowRight' ? 0.12 : 0;
    sph.phi = THREE.MathUtils.clamp(sph.phi + (ev.key === 'ArrowUp' ? -0.12 : ev.key === 'ArrowDown' ? 0.12 : 0), 0.12, Math.PI - 0.12);
    const c = controls.target.clone();
    camera.position.copy(c).add(new THREE.Vector3().setFromSpherical(sph));
    schedule(s);
  });
  if (viewBtnId) $(viewBtnId).addEventListener('click', () => { fitCamera(s, s.defaultDir); schedule(s); });
  if (worldFn) worldFn(s);
  scenes.push(s);
  const io = new IntersectionObserver(es => es.forEach(e => { s.visible = e.isIntersecting; if (s.visible) schedule(s); }));
  io.observe(canvas);
  const ro = new ResizeObserver(() => { fitCamera(s); schedule(s); });
  ro.observe(canvas);
  return s;
}
function addGround(s, y, size, withPlane) {
  if (withPlane) {
    const g = new THREE.Mesh(new THREE.PlaneGeometry(size, size), lam(0x11161f));
    g.rotation.x = -Math.PI / 2;
    g.position.y = y - 0.002;
    s.world.add(g);
  }
  const grid = new THREE.GridHelper(size, size * 2, 0x223349, 0x182335);
  grid.material.transparent = true;
  grid.material.opacity = 0.5;
  grid.position.y = y;
  s.world.add(grid);
}
function rebuild(s) {
  if (s.model) {
    s.model.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material && !o.material.userData.shared) o.material.dispose(); });
    s.scene3.remove(s.model);
  }
  s.labelsHost.replaceChildren();
  s.labels = [];
  s.model = new THREE.Group();
  s.scene3.add(s.model);
  s.build(s);
  s.fitBox = new THREE.Box3().setFromObject(s.model);
  fitCamera(s); /* 同步 fit：相机状态在状态变更返回时即确定，不依赖 rAF 时序 */
  schedule(s);
}

/* ================= 第 0 步：跷跷板 ================= */
const S0REF = { bg: null, handles: [] };
function seesawTorques() {
  const fa = weightOf(60), fk = weightOf(30);
  return { fa: fa, fk: fk, mL: torqueOf(fa, S.s0.a), mR: torqueOf(fk, S.s0.k) };
}
function buildPerson(sc, hex) {
  const g = new THREE.Group();
  const mat = lam(hex);
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.085 * sc, 0.105 * sc, 0.42 * sc, 12), mat);
  torso.position.y = 0.26 * sc;
  g.add(torso);
  ball(g, 0.105 * sc, hex, 0, 0.60 * sc, 0, mat);
  const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.045 * sc, 0.045 * sc, 0.30 * sc, 8), mat);
  thigh.rotation.x = Math.PI / 2;
  thigh.position.set(0, 0.03 * sc, 0.15 * sc);
  g.add(thigh);
  const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.038 * sc, 0.038 * sc, 0.26 * sc, 8), mat);
  shin.position.set(0, -0.08 * sc, 0.30 * sc);
  g.add(shin);
  rod(g, V3(0, 0.40 * sc, 0.01), V3(0, 0.14 * sc, 0.22 * sc), hex, 0.035 * sc, mat);
  return g;
}
function buildSeesaw(s) {
  const { fa, fk, mL, mR } = seesawTorques();
  const tilt = seesawTiltDeg(mL, mR);
  const rad = tilt * Math.PI / 180;
  const bal = isBalanced(mL, mR);
  const PIV = 0.95;
  /* 支点棱柱 + 轴点 */
  const prz = prism(s.model, 0.55, 0.90, 0.5, lam(HEX.panel));
  edges(s.model, prz, HEX.muted, 0.5);
  ball(s.model, 0.04, HEX.paper, 0, PIV, 0);
  mkLabel(s, t('cFulcrum'), COL.muted, fixedOf(V3(0.68, 0.46, 0)));
  /* 板（绕支点转，rotation.z = rad：左沉为正，与 PURE 示意角同源） */
  const bg = new THREE.Group();
  bg.position.set(0, PIV, 0);
  bg.rotation.z = rad;
  s.model.add(bg);
  S0REF.bg = bg;
  const boardMat = new THREE.MeshLambertMaterial({ color: HEX.wood, emissive: bal ? 0x1d5c38 : 0x000000 });
  const board = box(bg, 4.9, 0.09, 0.44, boardMat, 0, 0, 0);
  edges(bg, board, 0x8a6d3b, 0.6);
  S0REF.handles = [{ mesh: board, board: true }];
  const sides = [
    { d: S.s0.a, sgn: -1, F: fa, M: mL, hex: HEX.orange, col: COL.orange, lab: t('cAdult'), sc: 1.12, side: 'a' },
    { d: S.s0.k, sgn: 1, F: fk, M: mR, hex: HEX.cyan, col: COL.cyan, lab: t('cKid'), sc: 0.82, side: 'k' }
  ];
  sides.forEach(cfg => {
    const px = cfg.sgn * cfg.d;
    const person = buildPerson(cfg.sc, cfg.hex);
    person.position.set(px, 0.045, 0);
    bg.add(person);
    const hit = ball(bg, 0.37, cfg.hex, px, 0.34, 0, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false }));
    S0REF.handles.push({ mesh: hit, side: cfg.side });
    /* 力臂标尺（板下，随板转） */
    rod(bg, V3(0, -0.30, 0), V3(px, -0.30, 0), HEX.muted, 0.012);
    rod(bg, V3(0, -0.36, 0), V3(0, -0.24, 0), HEX.muted, 0.012);
    rod(bg, V3(px, -0.36, 0), V3(px, -0.24, 0), HEX.muted, 0.012);
    mkLabel(s, t('cM', { v: fmtNum(cfg.d) }), COL.muted, anchorOf(bg, V3(px / 2, -0.30, 0)), { dy: 17 });
    mkLabel(s, cfg.lab, cfg.col, anchorOf(bg, V3(px, 0.045 + 1.04 * cfg.sc, 0)));
    mkLabel(s, t('cTorque', { v: fmtNum(cfg.M) }), cfg.col, anchorOf(bg, V3(px, 0.045 + 1.52 * cfg.sc, 0)));
    /* 力箭头：世界竖直向下（重力方向），长度 ∝ F，落在座位世界位置 */
    const seatW = bg.localToWorld(V3(px, 0.02, 0));
    const aLen = cfg.F * 0.0011;
    rod(s.model, V3(seatW.x, seatW.y - 0.02, 0), V3(seatW.x, seatW.y - aLen, 0), cfg.hex, 0.02);
    coneDown(s.model, 0.05, 0.13, cfg.hex, seatW.x, seatW.y - aLen - 0.05, 0);
    mkLabel(s, t('cN', { v: fmtNum(cfg.F) }), cfg.col, fixedOf(V3(seatW.x, seatW.y - aLen / 2, 0)), { dx: 14 });
  });
  if (bal) mkLabel(s, t('cBalanced'), COL.green, anchorOf(bg, V3(0, 1.18, 0)));
}
function render0() {
  rebuild(scenes[0]);
  const { fa, fk, mL, mR } = seesawTorques();
  const bal = isBalanced(mL, mR);
  $('s0-a-val').textContent = fmtNum(S.s0.a) + ' m';
  $('s0-k-val').textContent = fmtNum(S.s0.k) + ' m';
  let verdict;
  if (bal) verdict = t('s0vBal');
  else if (mL > mR) verdict = t('s0vLeft', { diff: fmtNum(mL - mR) });
  else verdict = t('s0vRight', { diff: fmtNum(mR - mL) });
  $('s0-readout').innerHTML = t('s0ro', {
    fa: fmtNum(fa), da: fmtNum(S.s0.a), ml: fmtNum(mL),
    fk: fmtNum(fk), dk: fmtNum(S.s0.k), mr: fmtNum(mR), verdict: verdict
  });
}

/* ================= 第 1/2 步共用：撬棍场景 ================= */
/* 数据坐标与 2D 版同源：x 向右、groundD=1.34 为地面、barY=0.98 为棍高；3D 映射 X3=x−0.95、Y3=1.34−d */
function buildPry(s, cfg) {
  const handX = 0.18, fulX = handX + cfg.Ld, stoneX = fulX + cfg.Lr;
  const X3 = x => x - 0.95, Y3 = d => 1.34 - d;
  const piv3 = V3(X3(fulX), Y3(0.98), 0);
  /* 支点垫石（不随棍转） */
  const prz = prism(s.model, 0.17, 0.315, 0.34, lam(HEX.rock));
  prz.position.set(piv3.x, 0, 0);
  mkLabel(s, t('cFulcrum'), COL.muted, fixedOf(V3(piv3.x - 0.36, 0.10, 0)), { dy: 20 });
  ball(s.model, 0.032, HEX.paper, piv3.x, piv3.y, 0);
  /* 撬棍组：绕支点转 theta（左端下压、右端抬起） */
  const pg = new THREE.Group();
  pg.position.copy(piv3);
  pg.rotation.z = cfg.theta;
  s.model.add(pg);
  const bar = box(pg, cfg.Ld + cfg.Lr + 0.22, 0.085, 0.30, lam(HEX.wood), (cfg.Lr + 0.12 - cfg.Ld - 0.10) / 2, 0, 0);
  edges(pg, bar, 0x8a6d3b, 0.6);
  /* 大石：刚性随棍抬升 */
  const stone = new THREE.Mesh(new THREE.IcosahedronGeometry(0.44, 0), lam(HEX.rock, { flatShading: true }));
  stone.position.set(cfg.Lr + 0.14, 0.40, 0);
  stone.scale.set(1.1, 0.9, 1.0);
  stone.rotation.set(0.4, 0.7, 0.15);
  pg.add(stone);
  mkLabel(s, t(cfg.stoneKey), COL.paper, anchorOf(pg, V3(cfg.Lr + 0.14, 1.00, 0)));
  /* 手与动力箭头（世界竖直，落在棍左端世界位置） */
  const F = leverForce(cfg.G, cfg.Lr, cfg.Ld);
  const endW = pg.localToWorld(V3(-cfg.Ld, 0, 0));
  rod(s.model, V3(endW.x, endW.y + 0.50, 0), V3(endW.x, endW.y + 0.04, 0), HEX.pink, 0.02);
  coneDown(s.model, 0.05, 0.13, HEX.pink, endW.x, endW.y - 0.02, 0);
  ball(s.model, 0.055, HEX.pink, endW.x, endW.y + 0.56, 0);
  mkLabel(s, t('cHand') + ' F = ' + fmtNum(F) + ' N', COL.pink,
    () => pg.localToWorld(V3(-cfg.Ld, 0, 0)).add(V3(0, 0.80, 0)));
  if (cfg.arcs && cfg.theta > 0.001) {
    /* 弧线标尺：弧长 = 力臂 × 转角（实算），采样点与 2D drawArc 同式 */
    const arcPts = (L, sgn) => {
      const pts = [];
      for (let i = 0; i <= 24; i++) {
        const aa = -cfg.theta * i / 24;
        pts.push(V3(X3(fulX + sgn * L * Math.cos(aa)), Y3(0.98 + sgn * L * Math.sin(aa)), 0));
      }
      return pts;
    };
    tube(s.model, arcPts(cfg.Ld, -1), 0.014, lam(HEX.cyan));
    tube(s.model, arcPts(cfg.Lr, 1), 0.014, lam(HEX.orange));
    const midPt = (L, sgn) => {
      const aa = -cfg.theta / 2;
      return V3(X3(fulX + sgn * L * Math.cos(aa)), Y3(0.98 + sgn * L * Math.sin(aa)), 0);
    };
    mkLabel(s, t('cArcS', { v: fmtNum(arcLen(cfg.Ld, cfg.theta)) }), COL.cyan, fixedOf(midPt(cfg.Ld, -1)), { dx: -8, dy: 14 });
    mkLabel(s, t('cArcH', { v: fmtNum(arcLen(cfg.Lr, cfg.theta)) }), COL.orange, fixedOf(midPt(cfg.Lr, 1)), { dx: 8, dy: -12 });
  }
  if (cfg.liftTag && cfg.theta > 0.001) {
    mkLabel(s, t('cLiftArc', { v: arcFmt(arcLen(cfg.Lr, cfg.theta)) }), COL.orange,
      anchorOf(pg, V3(cfg.Lr + 0.74, 0.42, 0)));
  }
  if (cfg.arms) {
    /* 力臂标尺（棍下静止口径标注两段长度） */
    const ly = 0.10;
    const seg = (x0, x1, str, hex, col) => {
      rod(s.model, V3(X3(x0), ly, 0), V3(X3(x1), ly, 0), hex, 0.012);
      rod(s.model, V3(X3(x0), ly - 0.05, 0), V3(X3(x0), ly + 0.05, 0), hex, 0.012);
      rod(s.model, V3(X3(x1), ly - 0.05, 0), V3(X3(x1), ly + 0.05, 0), hex, 0.012);
      mkLabel(s, str, col, fixedOf(V3((X3(x0) + X3(x1)) / 2, ly, 0)), { dy: 16 });
    };
    seg(handX, fulX, t('cLd', { v: fmtNum(cfg.Ld) }), HEX.cyan, COL.cyan);
    seg(fulX, stoneX, t('cLr', { v: fmtNum(cfg.Lr) }), HEX.orange, COL.orange);
  }
  return { F: F };
}

/* 通用动画：token 防取消竞态（切档/改滑杆时令旧帧失效） */
function animateProg(state, dur, render) {
  if (state.playing) return;
  state.playing = true;
  const token = (state._animToken = (state._animToken || 0) + 1);
  const t0 = performance.now();
  const from = state.prog >= 1 ? 0 : state.prog;
  state.prog = from;
  const tick = now => {
    if (token !== state._animToken) return; /* 已被取消 */
    const p = clamp((now - t0) / dur, 0, 1);
    state.prog = from + (1 - from) * p;
    render();
    if (p < 1) requestAnimationFrame(tick);
    else { state.playing = false; state.prog = 1; render(); }
  };
  requestAnimationFrame(tick);
}
function cancelProg(state) {
  state._animToken = (state._animToken || 0) + 1;
  state.playing = false;
}

/* ================= 第 1 步：撬棍对账 ================= */
function render1() {
  const Lr = S.s1.Lr, Ld = 1.5 - Lr, G = 800;
  rebuild(scenes[1]);
  const F = leverForce(G, Lr, Ld);
  $('s1-lr-val').textContent = fmtNum(Lr) + ' m';
  $('s1-try').disabled = S.s1.playing;
  $('s1-readout').innerHTML = t('s1ro', {
    lr: fmtNum(Lr), ld: fmtNum(Ld), f: fmtNum(F),
    ml: fmtNum(torqueOf(F, Ld)), mr: fmtNum(torqueOf(G, Lr)), ratio: fmtNum(Ld / Lr)
  });
}
/* ================= 第 2 步：功的账本 ================= */
function render2() {
  const cfg = RATIOS[S.s2.ratio];
  const G = 600;
  const theta = S2_THETA * S.s2.prog;
  rebuild(scenes[2]);
  const F = leverForce(G, cfg.Lr, cfg.Ld);
  const s = arcLen(cfg.Ld, theta), hgt = arcLen(cfg.Lr, theta);
  const Win = workOf(F, s), Wout = workOf(G, hgt);
  /* 两条账本同一帧按同一 prog 更新：填充比恒同为 prog */
  const pct = (S.s2.prog * 100).toFixed(2) + '%';
  $('s2-fill-in').style.width = pct;
  $('s2-fill-out').style.width = pct;
  $('s2-val-in').textContent = fmtNum(Win) + ' J';
  $('s2-val-out').textContent = fmtNum(Wout) + ' J';
  [2, 3, 4].forEach(r => {
    const b = $('s2-r' + r);
    b.classList.toggle('active', S.s2.ratio === r);
    b.setAttribute('aria-pressed', String(S.s2.ratio === r));
  });
  const play = $('s2-play');
  play.disabled = S.s2.playing;
  play.textContent = S.s2.prog >= 1 ? t('s2replay') : t('s2play');
  $('s2-readout').innerHTML = t('s2ro', {
    ld: fmtNum(cfg.Ld), lr: fmtNum(cfg.Lr), f: fmtNum(F),
    s: fmtNum(s), h: fmtNum(hgt), win: fmtNum(Win), wout: fmtNum(Wout)
  });
}

/* ================= 第 3 步：定滑轮 ================= */
/* 数据坐标同 2D：x 0..3.9、y 向下 0..3.95（地面 3.78）；3D 映射 X3=x−1.95、Y3=3.78−yd */
function buildFixed(s) {
  const G = 200, sv = S.s3.s;
  const X3 = x => x - 1.95, Y3 = d => 3.78 - d;
  const C = [1.55, 0.62], R = 0.30;
  const C3 = V3(X3(C[0]), Y3(C[1]), 0);
  /* 横梁 + 吊架 + 轮 */
  const beam = box(s.model, 3.3, 0.16, 0.34, lam(HEX.panel), X3(1.95), Y3(0.10), 0);
  edges(s.model, beam, HEX.muted, 0.5);
  rod(s.model, V3(C3.x, Y3(0.18), 0), C3, HEX.muted, 0.02);
  const wheel = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 0.075, 28), lam(0x2a3a4d));
  wheel.rotation.x = Math.PI / 2;
  wheel.position.copy(C3);
  s.model.add(wheel);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(R, 0.016, 10, 40), lam(HEX.cyan));
  rim.position.copy(C3);
  s.model.add(rim);
  ball(s.model, 0.045, HEX.cyan, C3.x, C3.y, 0);
  /* 重物（升 h = s）与原位虚影 */
  const wTop = 3.02 - sv, wW = 0.62, wH = 0.55, wx = 1.25;
  if (sv > 0.001) {
    const ghost = new THREE.Mesh(new THREE.BoxGeometry(wW, wH, 0.52), lam(HEX.orange, { transparent: true, opacity: 0.06 }));
    ghost.position.set(X3(wx), Y3(3.02 + wH / 2), 0);
    s.model.add(ghost);
    edges(s.model, ghost, HEX.orange, 0.5);
    rod(s.model, V3(X3(0.52), Y3(3.02 + wH), 0), V3(X3(0.52), Y3(wTop + wH), 0), HEX.green, 0.016);
    coneUp(s.model, 0.05, 0.13, HEX.green, X3(0.52), Y3(wTop + wH) + 0.05, 0);
    mkLabel(s, 'h = ' + fmtNum(sv) + ' m', COL.green, fixedOf(V3(X3(0.52), Y3((3.02 + wTop) / 2 + wH), 0)), { dx: -10 });
  }
  /* 绳：左段 + 绕顶弧 + 自由段，全程同色同粗（张力处处相等）；采样点与 2D 同式 */
  const beta = S.s3.dir === 'diag' ? 50 * Math.PI / 180 : 0;
  const T = [C[0] + R * Math.cos(beta), C[1] - R * Math.sin(beta)];
  const dirv = [Math.sin(beta), Math.cos(beta)];
  const E = [T[0] + dirv[0] * (0.95 + sv), T[1] + dirv[1] * (0.95 + sv)];
  const pts = [V3(X3(wx), Y3(wTop), 0), V3(X3(wx), Y3(C[1]), 0)];
  for (let i = 1; i <= 18; i++) {
    const th = Math.PI + (Math.PI - beta) * i / 18;
    pts.push(V3(X3(C[0] + R * Math.cos(th)), Y3(C[1] + R * Math.sin(th)), 0));
  }
  pts.push(V3(X3(E[0]), Y3(E[1]), 0));
  tube(s.model, pts, 0.016, lam(HEX.cyan), 48);
  /* 重物本体 */
  const wb = box(s.model, wW, wH, 0.52, lam(HEX.orange, { transparent: true, opacity: 0.28 }), X3(wx), Y3(wTop + wH / 2), 0);
  edges(s.model, wb, HEX.orange, 0.9);
  mkLabel(s, t('cWeight200'), COL.orange, fixedOf(V3(X3(wx), Y3(wTop + wH), 0)), { dy: 15 });
  /* 手 */
  const E3 = V3(X3(E[0]), Y3(E[1]), 0);
  ball(s.model, 0.06, HEX.pink, E3.x, E3.y, E3.z);
  mkLabel(s, S.s3.dir === 'diag' ? t('cPullDiag') : t('cPullDown'), COL.pink, fixedOf(E3), { dy: -16 });
  mkLabel(s, 'F = ' + fmtNum(fixedForce(G)) + ' N', COL.pink, fixedOf(E3), { dy: 17 });
}
function render3() {
  rebuild(scenes[3]);
  const G = 200, s = S.s3.s;
  $('s3-s-val').textContent = fmtNum(s) + ' m';
  $('s3-down').classList.toggle('active', S.s3.dir === 'down');
  $('s3-down').setAttribute('aria-pressed', String(S.s3.dir === 'down'));
  $('s3-diag').classList.toggle('active', S.s3.dir === 'diag');
  $('s3-diag').setAttribute('aria-pressed', String(S.s3.dir === 'diag'));
  $('s3-readout').innerHTML = t('s3ro', { f: fmtNum(fixedForce(G)), s: fmtNum(s), h: fmtNum(s) });
}

/* ================= 第 4 步：动滑轮与滑轮组 ================= */
/* 数据坐标同 2D（pulleyScene 产出，y 向下）；3D 映射 X3=x−1.05、Y3=2.87−yd（重物底边初始贴地） */
let s4RopeData = null;
function s4Numbers() {
  const mode = S.s4.mode;
  const G = S4G[mode];
  const n = mode === 'single' ? 2 : S.s4.n;
  const s = mode === 'single' ? S.s4.sSingle : S.s4.sGroup;
  const F = groupForce(G, n), h = riseOf(s, n);
  return { G: G, n: n, s: s, F: F, h: h, Win: workOf(F, s), Wout: workOf(G, h) };
}
function buildGroup(s) {
  const { G, n, s: sVal, F, h } = s4Numbers();
  const blockY = S4_BLOCK0 - h;
  const scene = pulleyScene(n, blockY);
  const X3 = x => x - 1.05, Y3 = d => 2.87 - d;
  const P3 = p => V3(X3(p[0]), Y3(p[1]), 0);
  /* 横梁 */
  const beam = box(s.model, 2.0, 0.16, 0.34, lam(HEX.panel), X3(1.10), Y3(-0.08), 0);
  edges(s.model, beam, HEX.muted, 0.5);
  /* 自由端按拉出长度 s 延长：手随绳端移动，绳总长守恒（O2 的 3D 解法） */
  const tip = scene.freeTip;
  const tipE = [tip[0], tip[1] + (scene.freeDir === 'up' ? -sVal : sVal)];
  const isFree = sg => Math.abs(sg.b[0] - tip[0]) < 1e-12 && Math.abs(sg.b[1] - tip[1]) < 1e-12;
  /* 绳段：承重段青色（点亮更亮 + 序号牌），非承重段灰；长度按数据坐标精确记账 */
  let bearingCount = 0, totalLen = 0, freeLen = 0;
  scene.segs.forEach(sg => {
    const b = isFree(sg) ? tipE : sg.b;
    const len = Math.hypot(b[0] - sg.a[0], b[1] - sg.a[1]);
    totalLen += len;
    if (isFree(sg)) freeLen = len;
    let lit = false, idx = 0;
    if (sg.bearing) { bearingCount++; idx = bearingCount; lit = bearingCount <= S.s4.lit; }
    const mat = !sg.bearing ? lam(HEX.muted, { transparent: true, opacity: 0.8 })
      : lit ? lam(HEX.cyan, { emissive: 0x2a7d94 }) : lam(HEX.cyan, { transparent: true, opacity: 0.5 });
    rod(s.model, P3(sg.a), P3(b), 0, 0.016, mat);
    if (lit) {
      const mid = [(sg.a[0] + b[0]) / 2, (sg.a[1] + b[1]) / 2];
      mkLabel(s, String(idx), COL.cyan, fixedOf(P3(mid)), { cls: 'badge-num', dx: 15 });
    }
  });
  /* 绕轮弧（长度 r·π，恒定） */
  scene.arcs.forEach(ar => {
    const end = ar.ccw ? ar.a1 : (ar.a1 <= ar.a0 ? ar.a1 + Math.PI * 2 : ar.a1);
    totalLen += ar.r * Math.abs(end - ar.a0);
    const pts = [];
    for (let i = 0; i <= 16; i++) {
      const th = ar.a0 + (end - ar.a0) * i / 16;
      pts.push(V3(X3(ar.cx + ar.r * Math.cos(th)), Y3(ar.cy + ar.r * Math.sin(th)), 0));
    }
    tube(s.model, pts, 0.016, lam(HEX.cyan, { transparent: true, opacity: 0.5 }), 24);
  });
  /* 轮子 */
  scene.wheels.forEach(wh => {
    if (wh.fixed) rod(s.model, V3(X3(wh.x), Y3(0), 0), V3(X3(wh.x), Y3(wh.y), 0), HEX.muted, 0.018);
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(wh.r, wh.r, 0.07, 24), lam(0x46607a));
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(X3(wh.x), Y3(wh.y), 0);
    s.model.add(wheel);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(wh.r, 0.011, 8, 32), lam(HEX.paper));
    rim.position.copy(wheel.position);
    s.model.add(rim);
    ball(s.model, 0.028, HEX.paper, X3(wh.x), Y3(wh.y), 0);
  });
  /* 动滑轮横担 + 与轮心的连杆 */
  const blk = scene.block;
  const bar = box(s.model, blk.x1 - blk.x0, 0.09, 0.26, lam(HEX.beam), X3((blk.x0 + blk.x1) / 2), Y3(blk.y), 0);
  edges(s.model, bar, HEX.muted, 0.5);
  scene.wheels.filter(wh => !wh.fixed).forEach(wh => rod(s.model, V3(X3(wh.x), Y3(blk.y), 0), V3(X3(wh.x), Y3(wh.y), 0), HEX.muted, 0.014));
  /* 固定端标记 */
  ball(s.model, 0.045, HEX.orange, X3(scene.anchor[0]), Y3(scene.anchor[1]), 0);
  mkLabel(s, t('cAnchor'), COL.orange, fixedOf(P3(scene.anchor)), { dx: -38, dy: (S.s4.mode === 'group' && n === 3) ? 13 : -4 });
  /* 重物 */
  const wW = 0.66, wH = 0.5, wTopD = blockY + 0.16 + 0.16;
  rod(s.model, V3(X3(scene.weightCx), Y3(blk.y), 0), V3(X3(scene.weightCx), Y3(wTopD), 0), HEX.muted, 0.016);
  const wb = box(s.model, wW, wH, 0.52, lam(HEX.orange, { transparent: true, opacity: 0.28 }), X3(scene.weightCx), Y3(wTopD + wH / 2), 0);
  edges(s.model, wb, HEX.orange, 0.9);
  mkLabel(s, t(S.s4.mode === 'single' ? 'cWeight400' : 'cWeight600'), COL.orange, fixedOf(V3(X3(scene.weightCx), Y3(wTopD + wH), 0)), { dy: 15 });
  /* 自由端：手 + 拉力方向 */
  const tipE3 = P3(tipE);
  ball(s.model, 0.06, HEX.pink, tipE3.x, tipE3.y, tipE3.z);
  if (scene.freeDir === 'up') {
    rod(s.model, V3(tipE3.x, tipE3.y + 0.03, 0), V3(tipE3.x, tipE3.y + 0.30, 0), HEX.pink, 0.018);
    coneUp(s.model, 0.05, 0.13, HEX.pink, tipE3.x, tipE3.y + 0.36, 0);
    mkLabel(s, t('cFreeUp') + ' = ' + fmtNum(F) + ' N', COL.pink, fixedOf(tipE3), { dx: 12, dy: 18 });
  } else {
    rod(s.model, V3(tipE3.x, tipE3.y - 0.03, 0), V3(tipE3.x, tipE3.y - 0.30, 0), HEX.pink, 0.018);
    coneDown(s.model, 0.05, 0.13, HEX.pink, tipE3.x, tipE3.y - 0.36, 0);
    mkLabel(s, t('cFreeDown') + ' = ' + fmtNum(F) + ' N', COL.pink, fixedOf(tipE3), { dx: 12, dy: 18 });
  }
  s4RopeData = {
    n: n, bearing: bearingCount, total: totalLen, freeLen: freeLen,
    blockY: blockY, h: h, s: sVal, tipE: tipE.slice()
  };
  void G;
}
function render4() {
  rebuild(scenes[4]);
  const { n, s } = s4Numbers();
  $('s4-m-single').classList.toggle('active', S.s4.mode === 'single');
  $('s4-m-single').setAttribute('aria-pressed', String(S.s4.mode === 'single'));
  $('s4-m-group').classList.toggle('active', S.s4.mode === 'group');
  $('s4-m-group').setAttribute('aria-pressed', String(S.s4.mode === 'group'));
  $('s4-group-ctl').hidden = S.s4.mode !== 'group';
  [2, 3, 4].forEach(nn => {
    const b = $('s4-n' + nn);
    b.classList.toggle('active', S.s4.n === nn);
    b.setAttribute('aria-pressed', String(S.s4.n === nn));
  });
  $('s4-s-val').textContent = fmtNum(s) + ' m';
  $('s4-count-ro').innerHTML = S.s4.lit >= n ? t('s4countRo', { n: n }) : '';
  const nums = s4Numbers();
  $('s4-readout').innerHTML = S.s4.mode === 'single'
    ? t('s4roA', { f: fmtNum(nums.F), s: fmtNum(nums.s), h: fmtNum(nums.h), win: fmtNum(nums.Win), wout: fmtNum(nums.Wout) })
    : t('s4roB', { n: nums.n, f: fmtNum(nums.F), s: fmtNum(nums.s), h: fmtNum(nums.h), win: fmtNum(nums.Win), wout: fmtNum(nums.Wout) });
}

/* 逐段点亮：每 480ms 亮一段，亮满 n 段停 */
let s4Timer = null;
function countSegments() {
  if (s4Timer) { clearInterval(s4Timer); s4Timer = null; }
  S.s4.lit = 0;
  render4();
  const { n } = s4Numbers();
  s4Timer = setInterval(() => {
    S.s4.lit += 1;
    render4();
    if (S.s4.lit >= n) { clearInterval(s4Timer); s4Timer = null; }
  }, 480);
}
function resetLit() {
  if (s4Timer) { clearInterval(s4Timer); s4Timer = null; }
  S.s4.lit = 0;
}

/* ================= 第 5 步：自测 ================= */
const QUIZ = {
  q1: { answer: 2, why: 's5q1why', hint: 's5q1hint' },
  q2: { answer: 1, why: 's5q2why', hint: 's5q2hint' },
  q3: { answer: 0, why: 's5q3why', hint: 's5q3hint' }
};
function renderQuiz() {
  Object.keys(QUIZ).forEach(q => {
    const st = S.s5;
    document.querySelectorAll('button[data-q="' + q + '"]').forEach(b => {
      const opt = Number(b.dataset.opt);
      b.classList.toggle('opt-correct', !!st.locked[q] && opt === QUIZ[q].answer);
      b.classList.toggle('opt-wrong', (st.wrong[q] || []).includes(opt));
      b.disabled = !!st.locked[q] && opt !== QUIZ[q].answer;
    });
    const ro = $('s5-' + q + '-ro');
    if (!ro) return;
    if (st.locked[q]) ro.innerHTML = '<span class="pos">' + t('s5ok') + '</span>' + t(QUIZ[q].why);
    else if (st.picks[q] !== undefined) ro.innerHTML = '<span class="neg">' + t('s5no') + '</span>' + t(QUIZ[q].hint);
    else ro.innerHTML = t('s5idle');
  });
  /* 门控总提示：三题全对前不渲染（DOM 保持为空） */
  const allLocked = Object.keys(QUIZ).every(q => S.s5.locked[q]);
  $('s5-allhint').innerHTML = allLocked ? t('s5hint') : '';
}
function answer(q, opt) {
  const st = S.s5;
  if (st.locked[q]) return;
  st.picks[q] = opt;
  if (opt === QUIZ[q].answer) st.locked[q] = true;
  else { st.wrong[q] = st.wrong[q] || []; if (!st.wrong[q].includes(opt)) st.wrong[q].push(opt); }
  renderQuiz();
}

/* ---------- 渲染总入口 ---------- */
function renderAll() { render0(); render1(); render2(); render3(); render4(); renderQuiz(); badges(); }
function badges() {
  try {
    const c = (window.KNOWLEDGE_CATEGORIES || []).find(x => x.id === 'physics');
    const st = (window.KNOWLEDGE_STAGES || []).find(x => x.id === 'junior');
    if (c) $('categoryBadge').textContent = c.name[getLang()];
    if (st) $('stageBadge').textContent = st.name[getLang()];
  } catch (e) { /* 配置缺失时徽标留空，不报错 */ }
}

/* ---------- 第 0 步拖拽：射线拾取板上的人（或板面），沿板轴量化到 0.2 格 ---------- */
function bindSeesawDrag(s) {
  const wrap = s.canvas.parentElement;
  const ray = new THREE.Raycaster();
  const plane = new THREE.Plane(V3(0, 0, 1), 0);
  let dragSide = null;
  const setRay = e => {
    const r = s.canvas.getBoundingClientRect();
    ray.setFromCamera({
      x: ((e.clientX - r.left) / r.width) * 2 - 1,
      y: -((e.clientY - r.top) / r.height) * 2 + 1
    }, s.camera);
  };
  const planeLocal = () => {
    const p = new THREE.Vector3();
    if (!ray.ray.intersectPlane(plane, p)) return null;
    return S0REF.bg.worldToLocal(p);
  };
  wrap.addEventListener('pointerdown', e => {
    setRay(e);
    const hits = ray.intersectObjects(S0REF.handles.map(hh => hh.mesh), false);
    if (!hits.length) return;
    const h = S0REF.handles.find(hh => hh.mesh === hits[0].object);
    if (h.board) {
      const local = planeLocal();
      if (!local) return;
      dragSide = local.x < 0 ? 'a' : 'k';
    } else dragSide = h.side;
    s.controls.enabled = false;
    applyDrag(e);
  }, true);
  function applyDrag(e) {
    setRay(e);
    const local = planeLocal();
    if (!local) return;
    const q = clamp(Math.round(Math.abs(local.x) / 0.2) * 0.2, 0.4, 2.0);
    const qFix = Math.round(q * 5) / 5;
    if (dragSide === 'a') { S.s0.a = qFix; $('s0-a').value = qFix; }
    else { S.s0.k = qFix; $('s0-k').value = qFix; }
    render0();
  }
  window.addEventListener('pointermove', e => { if (dragSide) applyDrag(e); });
  ['pointerup', 'pointercancel'].forEach(ev => window.addEventListener(ev, () => {
    if (dragSide) { dragSide = null; s.controls.enabled = true; }
  }));
}

/* ---------- 撬棍两步的当前构型（供场景工厂初建与重建共用） ---------- */
function pryCfg1() {
  return { Ld: 1.5 - S.s1.Lr, Lr: S.s1.Lr, G: 800, theta: S1_THETA * S.s1.prog, stoneKey: 'cStone800', liftTag: true, arms: true };
}
function pryCfg2() {
  const c = RATIOS[S.s2.ratio];
  return { Ld: c.Ld, Lr: c.Lr, G: 600, theta: S2_THETA * S.s2.prog, stoneKey: 'cStone600', arcs: true, arms: false };
}

function init() {
  makeStage(0, 's0-canvas', 's0-view', [0.34, 0.30, 1], sc => buildSeesaw(sc), sc => addGround(sc, 0, 26, true));
  makeStage(1, 's1-canvas', 's1-view', [0.30, 0.32, 1], sc => buildPry(sc, pryCfg1()), sc => addGround(sc, 0, 26, true));
  makeStage(2, 's2-canvas', 's2-view', [0.30, 0.32, 1], sc => buildPry(sc, pryCfg2()), sc => addGround(sc, 0, 26, true));
  makeStage(3, 's3-canvas', 's3-view', [0.42, 0.30, 1], sc => buildFixed(sc), sc => addGround(sc, 0, 26, true));
  makeStage(4, 's4-canvas', 's4-view', [0.42, 0.30, 1], sc => buildGroup(sc), sc => addGround(sc, -1.18, 26, false));
  /* 第 0 步 */
  $('s0-a').addEventListener('input', e => { S.s0.a = Number(e.target.value); render0(); });
  $('s0-k').addEventListener('input', e => { S.s0.k = Number(e.target.value); render0(); });
  $('s0-start').addEventListener('click', () => document.getElementById('step1').scrollIntoView({ behavior: 'smooth' }));
  bindSeesawDrag(scenes[0]);
  /* 第 1 步 */
  $('s1-lr').addEventListener('input', e => { cancelProg(S.s1); S.s1.Lr = Number(e.target.value); S.s1.prog = 0; render1(); });
  $('s1-try').addEventListener('click', () => animateProg(S.s1, 1100, render1));
  /* 第 2 步 */
  [2, 3, 4].forEach(r => $('s2-r' + r).addEventListener('click', () => {
    cancelProg(S.s2); S.s2.ratio = r; S.s2.prog = 0; render2();
  }));
  $('s2-play').addEventListener('click', () => animateProg(S.s2, 1600, render2));
  /* 第 3 步 */
  $('s3-down').addEventListener('click', () => { S.s3.dir = 'down'; render3(); });
  $('s3-diag').addEventListener('click', () => { S.s3.dir = 'diag'; render3(); });
  $('s3-s').addEventListener('input', e => { S.s3.s = Number(e.target.value); render3(); });
  /* 第 4 步 */
  $('s4-m-single').addEventListener('click', () => {
    S.s4.mode = 'single'; resetLit();
    $('s4-s').value = S.s4.sSingle; render4();
  });
  $('s4-m-group').addEventListener('click', () => {
    S.s4.mode = 'group'; resetLit();
    $('s4-s').value = S.s4.sGroup; render4();
  });
  [2, 3, 4].forEach(nn => $('s4-n' + nn).addEventListener('click', () => { S.s4.n = nn; resetLit(); render4(); }));
  $('s4-s').addEventListener('input', e => {
    if (S.s4.mode === 'single') S.s4.sSingle = Number(e.target.value);
    else S.s4.sGroup = Number(e.target.value);
    render4();
  });
  $('s4-count').addEventListener('click', countSegments);
  /* 第 5 步 */
  document.querySelectorAll('button[data-q]').forEach(b => {
    b.addEventListener('click', () => answer(b.dataset.q, Number(b.dataset.opt)));
  });
  /* 步骤导航高亮 */
  const observer = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) document.querySelectorAll('.nav-step').forEach(a2 => {
      const active = a2.dataset.nav === e.target.dataset.step;
      a2.classList.toggle('active', active);
      if (active) a2.setAttribute('aria-current', 'step'); else a2.removeAttribute('aria-current');
    });
  }), { rootMargin: '-25% 0px -50% 0px' });
  document.querySelectorAll('.step').forEach(el => observer.observe(el));

  renderAll();
  onLangRefresh(renderAll);
  window.__LP3D_OK = true;
}
document.addEventListener('DOMContentLoaded', init);

/* 只读对账面：评审/自查用，UI 仍是唯一的修改路径 */
window.LEVER = {
  weightOf: weightOf, torqueOf: torqueOf, isBalanced: isBalanced, seesawTiltDeg: seesawTiltDeg,
  leverForce: leverForce, arcLen: arcLen, fixedForce: fixedForce, groupForce: groupForce,
  riseOf: riseOf, workOf: workOf, pulleyScene: pulleyScene, fmtNum: fmtNum,
  get state() { return JSON.parse(JSON.stringify(S)); }
};
window.LEVER3D = {
  revision: THREE.REVISION,
  get scenes() {
    return scenes.map(s => ({
      step: s.step, frames: s.frames, labels: s.labels.length,
      camera: s.camera.position.toArray(), target: s.controls.target.toArray()
    }));
  },
  project(idx, arr) {
    const s = scenes[idx];
    const v = V3(arr[0], arr[1], arr[2]).project(s.camera);
    return { x: (v.x + 1) / 2 * s.canvas.clientWidth, y: (1 - v.y) / 2 * s.canvas.clientHeight };
  },
  personPoint(side) { return this.personPointAt(side, side === 'a' ? S.s0.a : S.s0.k); },
  personPointAt(side, dist) {
    const s = scenes[0];
    const w = S0REF.bg.localToWorld(V3(side === 'a' ? -dist : dist, 0.40, 0));
    const v = w.project(s.camera);
    return { x: (v.x + 1) / 2 * s.canvas.clientWidth, y: (1 - v.y) / 2 * s.canvas.clientHeight };
  },
  pulleyRope() { return s4RopeData; }
};
