import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// 3D 呈现层：只读 window.DN 的共享状态（state.theta 等）渲染，绝不反推状态。
// 阳光方向 SUN_DIR 与 app.js 纯函数同一口径：自 +X 向 −X；地轴沿 +Y（北极朝上）。
const DN = window.DN;
const st = DN.state;
const R = 1.6;
const DPR = Math.min(window.devicePixelRatio || 1, 2);

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let x = Math.imul(seed ^ seed >>> 15, 1 | seed);
    x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x;
    return ((x ^ x >>> 14) >>> 0) / 4294967296;
  };
}

// 程序绘制的地球纹理：示意大陆色块（固定种子）+ 经纬网格 + 极冠；不是真地图（页内有明示）
function makeEarthTexture(night) {
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 512;
  const ctx = cv.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  if (night) { g.addColorStop(0, '#0a1526'); g.addColorStop(0.5, '#0d1d33'); g.addColorStop(1, '#0a1526'); }
  else { g.addColorStop(0, '#1b4f82'); g.addColorStop(0.5, '#27679f'); g.addColorStop(1, '#1b4f82'); }
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1024, 512);
  const rnd = mulberry32(20261020);
  ctx.fillStyle = night ? '#17351f' : '#3f9e57';
  for (let c = 0; c < 7; c++) {
    const clon = rnd() * 1024, clat = 90 + rnd() * 330;
    const blobs = 5 + Math.floor(rnd() * 5);
    for (let i = 0; i < blobs; i++) {
      const x = clon + (rnd() - 0.5) * 170, y = clat + (rnd() - 0.5) * 110;
      const rx = 22 + rnd() * 52, ry = 14 + rnd() * 34;
      ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rnd() * Math.PI, 0, 2 * Math.PI); ctx.fill();
    }
  }
  ctx.strokeStyle = night ? 'rgba(160,180,200,.20)' : 'rgba(220,240,255,.28)'; ctx.lineWidth = 1;
  for (let lon = 0; lon <= 12; lon++) { ctx.beginPath(); ctx.moveTo(lon * 1024 / 12, 0); ctx.lineTo(lon * 1024 / 12, 512); ctx.stroke(); }
  for (const lat of [64, 128, 192, 256, 320, 384, 448]) {
    ctx.beginPath(); ctx.moveTo(0, lat); ctx.lineTo(1024, lat);
    ctx.strokeStyle = lat === 256 ? (night ? 'rgba(255,180,84,.35)' : 'rgba(255,200,110,.55)') : (night ? 'rgba(160,180,200,.20)' : 'rgba(220,240,255,.28)');
    ctx.stroke();
  }
  ctx.fillStyle = night ? 'rgba(200,215,230,.5)' : 'rgba(240,248,255,.92)';
  ctx.fillRect(0, 0, 1024, 16); ctx.fillRect(0, 496, 1024, 16);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}
function makeGlowTexture() {
  const cv = document.createElement('canvas'); cv.width = cv.height = 128;
  const ctx = cv.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,220,140,.85)'); g.addColorStop(0.35, 'rgba(255,200,110,.28)'); g.addColorStop(1, 'rgba(255,200,110,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(cv);
}

const dayTex = makeEarthTexture(false), nightTex = makeEarthTexture(true), glowTex = makeGlowTexture();

function buildScene(canvasId) {
  const canvas = document.getElementById(canvasId);
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(DPR);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(4.4, 2.3, 5.4);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.dampingFactor = 0.08;
  controls.minDistance = 3.2; controls.maxDistance = 11;
  controls.update(); controls.saveState();

  // 星空背景（位置写死种子，不动）
  {
    const rnd = mulberry32(7), pos = new Float32Array(420 * 3);
    for (let i = 0; i < 420; i++) {
      const v = new THREE.Vector3(rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 2 - 1).normalize().multiplyScalar(30);
      pos.set([v.x, v.y, v.z], i * 3);
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: 0x8fa5bd, size: 0.07, sizeAttenuation: true })));
  }

  const earthGroup = new THREE.Group(); scene.add(earthGroup);
  const mat = new THREE.MeshLambertMaterial({ map: dayTex });
  earthGroup.add(new THREE.Mesh(new THREE.SphereGeometry(R, 48, 32), mat));

  // 地轴（沿 Y 穿出南北极）
  const axisMat = new THREE.LineBasicMaterial({ color: 0x9aa7b8 });
  const axisGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -R - 0.55, 0), new THREE.Vector3(0, R + 0.55, 0)]);
  scene.add(new THREE.Line(axisGeo, axisMat));

  // 标记小旗（固定在赤道上、随地球转）：杆沿径向 +X，橙色双面旗，夜间靠 Basic 材质也看得见
  const marker = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.36, 8), new THREE.MeshBasicMaterial({ color: 0xffb454 }));
  pole.rotation.z = Math.PI / 2; pole.position.x = R + 0.16;
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.17), new THREE.MeshBasicMaterial({ color: 0xffb454, side: THREE.DoubleSide }));
  flag.position.set(R + 0.32, 0.1, 0);
  const base = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10), new THREE.MeshBasicMaterial({ color: 0xffb454 }));
  base.position.x = R;
  marker.add(pole, flag, base);
  // 标签锚点：旗尖上方一点。marker 组原点在球心，placeLabel 必须用锚点的世界坐标，
  // 若用组原点则方向向量恒为零向量、标签会被 behind 判据永久隐藏。
  const markerAnchor = new THREE.Object3D(); markerAnchor.position.set(R + 0.32, 0.3, 0); marker.add(markerAnchor);
  earthGroup.add(marker);

  // 太阳：+X 远处圆盘 + 光晕 + 三支平行光箭头 + 定向光
  const sunGroup = new THREE.Group(); scene.add(sunGroup);
  const sunMat = new THREE.MeshBasicMaterial({ color: 0xffd97a });
  const sunDisc = new THREE.Mesh(new THREE.CircleGeometry(0.55, 40), sunMat);
  sunDisc.position.set(7.5, 0, 0); sunDisc.rotation.y = -Math.PI / 2;
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false }));
  glow.position.copy(sunDisc.position); glow.scale.setScalar(3.4);
  sunGroup.add(sunDisc, glow);
  const arrows = [];
  for (const [ay, az] of [[-1.05, 0.5], [0, 0.95], [1.05, 0.5]]) {
    const ar = new THREE.ArrowHelper(new THREE.Vector3(-1, 0, 0), new THREE.Vector3(4.6, ay, az), 1.7, 0xffd97a, 0.3, 0.17);
    arrows.push(ar); sunGroup.add(ar);
  }
  const dirLight = new THREE.DirectionalLight(0xfff2d8, 2.8); dirLight.position.set(6, 0, 0); scene.add(dirLight);
  const amb = new THREE.AmbientLight(0x8899bb, 0.3); scene.add(amb);

  return { canvas: canvas, renderer: renderer, scene: scene, camera: camera, controls: controls,
    earthGroup: earthGroup, marker: marker, markerAnchor: markerAnchor, mat: mat, sunMat: sunMat, glow: glow, arrows: arrows,
    dirLight: dirLight, amb: amb, active: false, w: 0, h: 0 };
}

const scenes = [];
let booted = false;
try {
  scenes.push(buildScene('s0-canvas'), buildScene('s1-canvas'), buildScene('s2-canvas'));
} catch (err) {
  for (const el of document.querySelectorAll('.load-fail')) el.hidden = false;
  console.error('3D init failed:', err);
}
scenes.forEach((S, i) => { S.stepIndex = i; }); // 0/1/2 ↔ 第 0/1/2 步，灯光作用域判定用

const labelEls = [document.getElementById('s0-marker'), document.getElementById('s1-marker'), document.getElementById('s2-marker')];
const _v = new THREE.Vector3(), _c = new THREE.Vector3();
function placeLabel(S, el) {
  if (!el || !S.w) { if (el) el.style.display = 'none'; return; }
  (S.markerAnchor || S.marker).getWorldPosition(_v);
  _c.copy(_v).project(S.camera);
  const behind = _v.clone().normalize().dot(S.camera.position.clone().normalize()) < 0.02;
  if (behind || _c.z > 1) { el.style.display = 'none'; return; }
  el.hidden = false;
  el.style.display = '';
  el.style.left = ((_c.x * 0.5 + 0.5) * S.w) + 'px';
  el.style.top = ((-_c.y * 0.5 + 0.5) * S.h) + 'px';
  const facing = _v.clone().normalize().dot(S.camera.position.clone().normalize());
  el.style.opacity = String(Math.max(0.25, Math.min(1, (facing - 0.02) / 0.3)));
}
function syncLight(S) {
  // 灯光作用域（评审 M1 定版）：关灯只作用于第 1 步场景；第 0/2 步场景的前提是阳光已开，恒为有光
  const on = S.stepIndex === 1 ? st.light : true;
  if (S._light === on) return; // notify 每帧都来，只在真的开关变化时才换纹理
  S._light = on;
  S.dirLight.intensity = on ? 2.8 : 0;
  S.amb.intensity = on ? 0.3 : 0.6;
  S.mat.map = on ? dayTex : nightTex; S.mat.needsUpdate = true;
  S.sunMat.color.set(on ? 0xffd97a : 0x6b5a33);
  S.glow.visible = on;
  for (const ar of S.arrows) ar.visible = on;
}
/* 按需渲染（评审 S2 定版）：静止且无交互时不自续 rAF、不占帧。
   唤醒来源：状态订阅（theta/dir/light 变化）、OrbitControls 的 change（拖动与阻尼未稳）、
   尺寸/可见性变化、视角复位与语言切换；播放中则逐帧渲染（theta 每帧都在变）。 */
let rafOn = false, settle = 0;
function wake(frames) {
  settle = Math.max(settle, frames == null ? 30 : frames);
  if (!rafOn) { rafOn = true; requestAnimationFrame(render); }
}
function render() {
  const thetaRad = THREE.MathUtils.degToRad(st.theta);
  for (let i = 0; i < scenes.length; i++) {
    const S = scenes[i];
    S.earthGroup.rotation.y = thetaRad;
    // 首帧不受可见性门控：窄屏上首个 3D 画布常在首屏之下，若等可见才画，
    // __DN3D_READY 永不置位、看门狗会误报加载失败；每场景先画一帧，之后才按可见性省帧
    if (!S.active && S.bootedOnce) continue;
    S.controls.update();
    S.renderer.render(S.scene, S.camera);
    placeLabel(S, labelEls[i]);
    S.bootedOnce = true;
    if (!booted) {
      booted = true;
      window.__DN3D_READY = true;
      window.DAY_NIGHT = { // 只读验收证据面
        ready: true,
        revision: THREE.REVISION,
        scenes: scenes.map((s, i) => ({ step: [0, 1, 2][i], canvas: s.canvas.id })),
        pure: { localTime: DN.localTime, phaseOf: DN.phaseOf, sunDot: DN.sunDot, apparentSun: DN.apparentSun },
        state: () => ({ theta: st.theta, dir: st.dir, playing: st.playing, light: st.light })
      };
      const wd = document.getElementById('dn-3d-watchdog'); if (wd) wd.remove();
      if (window.__dnBootTimer) { clearTimeout(window.__dnBootTimer); window.__dnBootTimer = 0; }
    }
  }
  // 续帧判定：播放中不停帧；否则消费唤醒预算（阻尼与交互的余帧），耗尽即停
  if (st.playing || settle > 0) {
    if (settle > 0) settle--;
    requestAnimationFrame(render);
  } else rafOn = false;
}
if (scenes.length) {
  // 尺寸与可见性（口径同 space-diagonal：ResizeObserver + IntersectionObserver）；变化即唤醒渲染
  for (const S of scenes) {
    const wrap = S.canvas.parentElement;
    new ResizeObserver(() => {
      const w = wrap.clientWidth, h = wrap.clientHeight;
      if (!w || !h) return;
      S.w = w; S.h = h;
      S.renderer.setSize(w, h, false);
      S.camera.aspect = w / h; S.camera.updateProjectionMatrix();
      wake(10);
    }).observe(wrap);
    new IntersectionObserver(es => { S.active = es[0].isIntersecting; if (S.active) wake(10); }, { threshold: 0.02 }).observe(wrap);
    S.controls.addEventListener('change', () => wake(8)); // 相机在动时 change 逐帧派发，小预算即可续帧，停后尾巴短
  }
  DN.subscribe(() => { for (const S of scenes) syncLight(S); wake(6); });
  syncLight(scenes[0]); scenes.forEach(syncLight);
  // 第 0 步口径（BRIEF + 评审 S1 定版）：载入默认不自转——读数不是移动目标、时间带不预涂；
  // 若学习者在别步已开始播放，在第 0 步画布上拖动视角先停播放（视角与自转是两个动作）
  scenes[0].canvas.addEventListener('pointerdown', () => { if (st.playing) DN.setPlaying(false); }, { passive: true });
  wake(45); // 首帧：各场景（含离屏的）各画一帧、置位 __DN3D_READY、放好标记标签，之后静止即停
}
window.DN3D = {
  resetView: i => { const S = scenes[i]; if (S) { S.controls.reset(); wake(30); } },
  refreshLanguage: () => {
    const label = window.t ? window.t('markerHere') : '';
    for (const el of labelEls) if (el) el.textContent = label;
    wake(5); // 标签位置随新一帧重算
  }
};
window.DN3D.refreshLanguage();
