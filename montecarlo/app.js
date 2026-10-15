'use strict';
/* 蒙特卡洛交互讲解 — 全部逻辑（无依赖，原生 Canvas 2D）
   依赖 i18n.js 先行加载：t() / getLang() / onLangRefresh() / STR。

   ★ 红线（与 BRIEF 一一对应）：
   1. 随机数一律走带种子 mulberry32；同种子点列逐点重现。种子显示在读数里。
   2. π̂ 口径全页唯一：π̂ = 4 · 圆内 / 总数（[0,1]² 内切圆，或第 1 步的外接正方形构型，
      比值同为 π/4）。读数 π̂ 恒由真实计数现算。
   3. 误差带：π ± 2σ，σ = 4√(p̂(1−p̂)/N)，p̂ 为轨迹该点处的圆内率。
   4. 投针：角度 [0,π) 均匀、中心均匀，相交判定 dist ≤ (L/2)|sinθ|，π̂ = 2L·N/(d·相交数)。
   5. 高维真值：π^(d/2)·(0.5)^d / Γ(d/2+1)；估值由真实 d 维点计数。
   6. 计数全量真实；画布显示点数有上限（各步 cap），超出只计数不画点，读数注明抽稀。
   评审对账接口：window.MC（见文件末尾）。 */
const TAU = Math.PI * 2;
const $ = id => document.getElementById(id);

/* ---------- 带种子 PRNG：mulberry32 ---------- */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let tt = Math.imul(a ^ (a >>> 15), 1 | a);
    tt = (tt + Math.imul(tt ^ (tt >>> 7), 61 | tt)) ^ tt;
    return ((tt ^ (tt >>> 14)) >>> 0) / 4294967296;
  };
}
function freshSeed() { return (Date.now() ^ (Math.random() * 0x7fffffff)) >>> 0; }

/* ---------- Γ 函数（整数与半整数精确递推） ---------- */
function gammaFn(z) {
  if (Math.abs(z - Math.round(z)) < 1e-12) {
    let f = 1; for (let i = 2; i < z; i++) f *= i; return f;
  }
  let g = Math.sqrt(Math.PI), x = 0.5;
  while (x < z - 1e-12) { g *= x; x += 1; }
  return g;
}
/* d 维单位超立方体内切超球（半径 0.5）体积比真值 */
function sphereRatioTrue(d) {
  return Math.pow(Math.PI, d / 2) * Math.pow(0.5, d) / gammaFn(d / 2 + 1);
}

/* ---------- π 采样器（单位正方形 + 内切圆） ---------- */
function makePiSampler(seed) {
  const rnd = mulberry32(seed);
  let n = 0, inside = 0;
  const api = {
    seed: seed >>> 0,
    get n() { return n; },
    get inside() { return inside; },
    get phat() { return n ? inside / n : NaN; },
    get pi() { return n ? 4 * inside / n : NaN; },
    next() {
      const x = rnd(), y = rnd();
      const dx = x - 0.5, dy = y - 0.5;
      const inn = dx * dx + dy * dy <= 0.25;
      n++; if (inn) inside++;
      return { x, y, inn };
    },
    batch(k, onPoint) { for (let i = 0; i < k; i++) { const p = api.next(); if (onPoint) onPoint(p); } }
  };
  return api;
}
/* 第 1 步：半径 r 的圆 + 其外接正方形内均匀撒点（比值仍 π/4） */
function makeRadiusSampler(seed, r) {
  const rnd = mulberry32(seed);
  let n = 0, inside = 0;
  const api = {
    seed: seed >>> 0, r,
    get n() { return n; },
    get inside() { return inside; },
    get pi() { return n ? 4 * inside / n : NaN; },
    next() {
      const x = 0.5 + (rnd() * 2 - 1) * r;
      const y = 0.5 + (rnd() * 2 - 1) * r;
      const dx = x - 0.5, dy = y - 0.5;
      const inn = dx * dx + dy * dy <= r * r;
      n++; if (inn) inside++;
      return { x, y, inn };
    },
    batch(k, onPoint) { for (let i = 0; i < k; i++) { const p = api.next(); if (onPoint) onPoint(p); } }
  };
  return api;
}
/* 布丰投针采样器：d = 1，地板 y ∈ [0,6]，线在整数 y 处 */
function makeNeedleSampler(seed, ld) {
  const rnd = mulberry32(seed);
  let n = 0, cross = 0;
  const api = {
    seed: seed >>> 0, ld,
    get n() { return n; },
    get cross() { return cross; },
    get pi() { return cross ? 2 * ld * n / cross : NaN; },
    next() {
      const cx = 0.8 + rnd() * 8.4;
      const cy = rnd() * 6;
      const th = rnd() * Math.PI;
      const dist = Math.abs(cy - Math.round(cy));
      const isCross = dist <= (ld / 2) * Math.abs(Math.sin(th));
      n++; if (isCross) cross++;
      return { cx, cy, th, cross: isCross };
    },
    batch(k, onPoint) { for (let i = 0; i < k; i++) { const p = api.next(); if (onPoint) onPoint(p); } }
  };
  return api;
}
/* 高维超球采样器 */
function makeSphereSampler(seed, d) {
  const rnd = mulberry32(seed);
  let n = 0, inside = 0;
  const api = {
    seed: seed >>> 0, d,
    get n() { return n; },
    get inside() { return inside; },
    get ratio() { return n ? inside / n : NaN; },
    next() {
      let x0 = 0, x1 = 0, s = 0;
      for (let i = 0; i < d; i++) {
        const v = rnd();
        if (i === 0) x0 = v; else if (i === 1) x1 = v;
        const dv = v - 0.5; s += dv * dv;
      }
      const inn = s < 0.25;
      n++; if (inn) inside++;
      return { x: x0, y: x1, inn };
    },
    batch(k, onPoint) { for (let i = 0; i < k; i++) { const p = api.next(); if (onPoint) onPoint(p); } }
  };
  return api;
}

/* ---------- 任意形状（第 3 步） ---------- */
const STAR_VERTS = (() => {
  const v = [];
  for (let k = 0; k < 10; k++) {
    const ang = Math.PI / 2 + k * Math.PI / 5;
    const R = k % 2 === 0 ? 1 : 0.3819660112501051;
    v.push([R * Math.cos(ang), R * Math.sin(ang)]);
  }
  return v;
})();
function starTest(x, y) {
  let c = false;
  for (let i = 0, j = STAR_VERTS.length - 1; i < STAR_VERTS.length; j = i++) {
    const xi = STAR_VERTS[i][0], yi = STAR_VERTS[i][1];
    const xj = STAR_VERTS[j][0], yj = STAR_VERTS[j][1];
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) c = !c;
  }
  return c;
}
const SHAPES = {
  heart: {
    box: [-1.25, 1.25, -1.1, 1.35], defKey: 's3defHeart',
    test(x, y) { const a = x * x + y * y - 1; return a * a * a - x * x * y * y * y <= 0; }
  },
  star: {
    box: [-1.05, 1.05, -1.05, 1.05], defKey: 's3defStar',
    test: starTest
  },
  blob: {
    box: [-1.1, 1.1, -1.1, 1.1], defKey: 's3defBlob',
    test(x, y) {
      const rho = Math.hypot(x, y);
      if (rho === 0) return true;
      const th = Math.atan2(y, x);
      return rho <= 0.78 + 0.16 * Math.sin(3 * th) + 0.09 * Math.cos(5 * th);
    }
  }
};
const REF_GRID = 1600;
const shapeRefs = {};
function shapeRef(id) {
  if (shapeRefs[id] !== undefined) return shapeRefs[id];
  const sh = SHAPES[id], G = REF_GRID;
  const [x0, x1, y0, y1] = sh.box;
  let cnt = 0;
  for (let i = 0; i < G; i++) {
    const x = x0 + (i + 0.5) * (x1 - x0) / G;
    for (let j = 0; j < G; j++) {
      const y = y0 + (j + 0.5) * (y1 - y0) / G;
      if (sh.test(x, y)) cnt++;
    }
  }
  const area = cnt / (G * G) * (x1 - x0) * (y1 - y0);
  shapeRefs[id] = area;
  return area;
}

/* ---------- 画布适配（DPR）：沿用傅里叶/采样页 fitCanvas 方案 ---------- */
function fitCanvas(cv) {
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  if (cv.dataset.cssH === undefined) {
    const hAttr = parseInt(cv.getAttribute('height'), 10);
    cv.dataset.cssH = hAttr ? String(hAttr) : '';
  }
  if (cv.dataset.cssH) cv.style.height = cv.dataset.cssH + 'px';
  const w = cv.clientWidth;
  const h = cv.clientHeight || parseInt(cv.dataset.cssH || '0', 10);
  const bw = Math.max(2, Math.round(w * dpr));
  const bh = Math.max(2, Math.round(h * dpr));
  if (cv.width !== bw) cv.width = bw;
  if (cv.height !== bh) cv.height = bh;
  const ctx = cv.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  cv._w = w; cv._h = h;
  return ctx;
}
const allCanvases = [];
function ctxOf(id) { const cv = $(id); allCanvases.push(cv); return fitCanvas(cv); }
const refitHooks = [];
function onRefit(fn) { refitHooks.push(fn); }
let refitQueued = false;
window.addEventListener('resize', () => {
  if (refitQueued) return;
  refitQueued = true;
  requestAnimationFrame(() => {
    refitQueued = false;
    allCanvases.forEach(fitCanvas);
    refitHooks.forEach(fn => { try { fn(); } catch (e) { console.error(e); } });
  });
});

/* ---------- 动画调度：只跑视口内的步骤 ---------- */
const animators = [];
const visibleSet = new Set();
const io = new IntersectionObserver(es => {
  es.forEach(e => { if (e.isIntersecting) visibleSet.add(e.target); else visibleSet.delete(e.target); });
}, { threshold: 0.05 });
function animate(el, fn) { animators.push({ el, fn }); io.observe(el); }
let lastTs = 0;
function loop(ts) {
  const dt = Math.min(0.05, lastTs ? (ts - lastTs) / 1000 : 0.016);
  lastTs = ts;
  for (const a of animators) if (visibleSet.has(a.el)) { try { a.fn(dt); } catch (err) { console.error(err); } }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

/* ---------- 导航高亮 ---------- */
(function nav() {
  const links = document.querySelectorAll('.nav-step');
  const nio = new IntersectionObserver(es => {
    es.forEach(e => {
      if (e.isIntersecting) links.forEach(l => l.classList.toggle('active', l.dataset.nav === e.target.dataset.step));
    });
  }, { rootMargin: '-40% 0px -50% 0px' });
  document.querySelectorAll('.step').forEach(s => nio.observe(s));
})();

/* ---------- 小工具 ---------- */
function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
function fmt(v, d) { if (!isFinite(v)) return '—'; return (Math.round(v * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d); }
function fmtInt(v) { return String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function fmtDur(sec) {
  if (!isFinite(sec)) return '—';
  if (sec < 1) return t('durTiny');
  if (sec < 90) return t('durS', { v: Math.round(sec) });
  if (sec < 5400) return t('durM', { v: fmt(sec / 60, 1) });
  if (sec < 129600) return t('durH', { v: fmt(sec / 3600, 1) });
  const years = sec / (86400 * 365.25);
  if (years < 9000) return t('durY', { v: fmt(years, years < 10 ? 1 : 0) });
  return t('durHuge', { v: fmt(years / 10000, 1) });
}
/* 图例（画布左上角：色线 + 文字） */
function drawLegend(ctx, items, x, y) {
  ctx.font = '12.5px system-ui, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  let lx = x;
  for (const [txt, col] of items) {
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(lx, y); ctx.lineTo(lx + 20, y); ctx.stroke();
    ctx.fillText(txt, lx + 25, y + 1);
    lx += 25 + ctx.measureText(txt).width + 18;
  }
}

/* ================================================================
   第 0 步 · 钩子：下雨算 π
   ================================================================ */
const s0 = {
  seed: 20261016, sampler: null, running: true, rate: 1500, acc: 0,
  disp: [], cap: 40000
};
function s0Reset(newSeed) {
  if (newSeed) s0.seed = freshSeed();
  s0.sampler = makePiSampler(s0.seed);
  s0.disp = []; s0.acc = 0;
}
s0Reset(false);
function s0Draw() {
  const cv = $('s0-canvas');
  const ctx = fitCanvas(cv);
  const w = cv._w, h = cv._h;
  if (w < 10) return;
  ctx.clearRect(0, 0, w, h);
  const side = Math.min(w - 24, h - 46);
  const ox = (w - side) / 2, oy = 34 + (h - 46 - side) / 2;
  const X = v => ox + v * side, Y = v => oy + (1 - v) * side;
  drawLegend(ctx, [[t('cIn'), '#6ee7ff'], [t('cOut'), '#5b6b82']], ox, 14);
  /* 点 */
  for (const p of s0.disp) {
    ctx.fillStyle = p.inn ? '#6ee7ff' : '#54637a';
    ctx.fillRect(X(p.x) - 1, Y(p.y) - 1, 2, 2);
  }
  /* 正方形与内切圆 */
  ctx.strokeStyle = '#8494ab'; ctx.lineWidth = 1.4;
  ctx.strokeRect(ox, oy, side, side);
  ctx.strokeStyle = '#ffb454'; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.arc(X(0.5), Y(0.5), side / 2, 0, TAU); ctx.stroke();
}
function s0Readout() {
  const s = s0.sampler;
  if (!s.n) { $('s0-readout').innerHTML = t('s0ro0'); return; }
  let html = t('s0ro', {
    n: fmtInt(s.n), inside: fmtInt(s.inside), pi: fmt(s.pi, 5),
    err: fmt(Math.abs(s.pi - Math.PI), 5), seed: s.seed
  });
  if (s.n > s0.cap) html += ' ' + t('s0thin', { cap: fmtInt(s0.cap) });
  $('s0-readout').innerHTML = html;
}
function s0SyncBtn() { $('s0-play').textContent = s0.running ? t('pause') : t('play'); }
animate($('step0'), dt => {
  if (s0.running) {
    s0.acc += s0.rate * dt;
    let k = Math.floor(s0.acc);
    s0.acc -= k;
    if (k > 0) s0.sampler.batch(k, p => { if (s0.disp.length < s0.cap) s0.disp.push(p); });
  }
  s0Draw(); s0Readout();
});
$('s0-play').addEventListener('click', () => { s0.running = !s0.running; s0SyncBtn(); });
$('s0-seed').addEventListener('click', () => { s0Reset(true); s0Draw(); s0Readout(); });
$('s0-reset').addEventListener('click', () => { s0Reset(false); s0Draw(); s0Readout(); });
document.querySelectorAll('#step0 .spd').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('#step0 .spd').forEach(x => x.classList.toggle('active', x === b));
    s0.rate = parseFloat(b.dataset.rate);
  });
});
$('s0-start').addEventListener('click', () => {
  document.getElementById('step1').scrollIntoView({ behavior: 'smooth' });
});
onLangRefresh(() => { s0Draw(); s0Readout(); s0SyncBtn(); });
onRefit(() => s0Draw());

/* ================================================================
   第 1 步 · 比例就是概率：改半径验 π/4 不变
   撒点范围 = 圆的外接正方形 [0.5−r, 0.5+r]²
   ================================================================ */
const s1 = {
  seed: 777, r: 0.5, sampler: null, auto: false, acc: 0, disp: [], cap: 20000
};
function s1Reset() {
  s1.sampler = makeRadiusSampler(s1.seed, s1.r);
  s1.disp = []; s1.acc = 0;
}
s1Reset();
function s1Draw() {
  const cv = $('s1-canvas');
  const ctx = fitCanvas(cv);
  const w = cv._w, h = cv._h;
  if (w < 10) return;
  ctx.clearRect(0, 0, w, h);
  const side = Math.min(w - 24, h - 46);
  const ox = (w - side) / 2, oy = 34 + (h - 46 - side) / 2;
  const X = v => ox + v * side, Y = v => oy + (1 - v) * side;
  drawLegend(ctx, [[t('cIn'), '#6ee7ff'], [t('cOut'), '#5b6b82']], ox, 14);
  /* 全场（单位正方形）淡框 */
  ctx.strokeStyle = '#2b3547'; ctx.lineWidth = 1;
  ctx.strokeRect(ox, oy, side, side);
  /* 外接正方形（撒点范围） */
  const r = s1.r;
  ctx.strokeStyle = '#8494ab'; ctx.lineWidth = 1.4;
  ctx.setLineDash([6, 4]);
  ctx.strokeRect(X(0.5 - r), Y(0.5 + r), 2 * r * side, 2 * r * side);
  ctx.setLineDash([]);
  /* 圆 */
  ctx.strokeStyle = '#ffb454'; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.arc(X(0.5), Y(0.5), r * side, 0, TAU); ctx.stroke();
  /* 点 */
  for (const p of s1.disp) {
    ctx.fillStyle = p.inn ? '#6ee7ff' : '#54637a';
    ctx.fillRect(X(p.x) - 1.2, Y(p.y) - 1.2, 2.4, 2.4);
  }
}
function s1Readout() {
  const s = s1.sampler;
  if (!s.n) { $('s1-readout').innerHTML = t('s1ro0', { r: s1.r }); return; }
  $('s1-readout').innerHTML = t('s1ro', {
    r: s1.r, n: fmtInt(s.n), inside: fmtInt(s.inside),
    rate: fmt(s.inside / s.n, 4), pi: fmt(s.pi, 5)
  });
}
function s1SyncAuto() {
  $('s1-auto').textContent = s1.auto ? t('stopAuto') : t('autoSlow');
  $('s1-auto').classList.toggle('active', s1.auto);
}
animate($('step1'), dt => {
  if (s1.auto) {
    s1.acc += 2.4 * dt;
    const k = Math.floor(s1.acc);
    s1.acc -= k;
    if (k > 0) s1.sampler.batch(k, p => { if (s1.disp.length < s1.cap) s1.disp.push(p); });
  }
  s1Draw(); s1Readout();
});
$('s1-one').addEventListener('click', () => {
  const p = s1.sampler.next();
  if (s1.disp.length < s1.cap) s1.disp.push(p);
  s1Draw(); s1Readout();
});
$('s1-auto').addEventListener('click', () => { s1.auto = !s1.auto; s1SyncAuto(); });
$('s1-reset').addEventListener('click', () => { s1Reset(); s1Draw(); s1Readout(); });
document.querySelectorAll('#step1 .rbtn').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('#step1 .rbtn').forEach(x => x.classList.toggle('active', x === b));
    s1.r = parseFloat(b.dataset.r);
    s1Reset(); s1Draw(); s1Readout();
  });
});
onLangRefresh(() => { s1Draw(); s1Readout(); s1SyncAuto(); });
onRefit(() => s1Draw());

/* ================================================================
   第 2 步 · 收敛铁律：π̂(N) 轨迹 + ±2σ 带 + 里程碑 + 20 种子束
   ================================================================ */
const MILESTONES = [100, 1000, 10000, 100000, 1000000];
const s2 = {
  mode: 'single', baseSeed: 42, running: false, done: false,
  single: null, traj: [], nextChk: 8, miles: {},
  seeds: [], targetSingle: 1000000, targetMulti: 100000
};
function s2NewSingle() {
  s2.single = makePiSampler(s2.baseSeed);
  s2.traj = []; s2.nextChk = 8; s2.miles = {}; s2.done = false;
}
function s2NewMulti() {
  s2.seeds = [];
  for (let i = 0; i < 20; i++) {
    s2.seeds.push({ sampler: makePiSampler(s2.baseSeed + i * 7919), traj: [], nextChk: 8 });
  }
  s2.done = false;
}
function s2ResetAll() { s2NewSingle(); s2NewMulti(); s2.running = false; }
s2ResetAll();
function sigPi(phat, n) { return 4 * Math.sqrt(Math.max(0, phat * (1 - phat)) / n); }
function s2StepSingle(k) {
  const s = s2.single;
  const kk = Math.min(k, s2.targetSingle - s.n); /* 精确截断：到 10⁶ 整停，与 multi 口径一致 */
  if (kk <= 0) { s2.running = false; s2.done = true; return; }
  s.batch(kk, () => {
    if (s.n >= s2.nextChk) {
      s2.traj.push({ n: s.n, pi: s.pi, phat: s.phat });
      s2.nextChk = Math.ceil(s2.nextChk * 1.07) + 1;
    }
    if (MILESTONES.includes(s.n)) s2.miles[s.n] = Math.abs(s.pi - Math.PI);
  });
  if (s.n >= s2.targetSingle) { s2.running = false; s2.done = true; }
}
function s2StepMulti(kEach) {
  let allDone = true;
  for (const sd of s2.seeds) {
    const s = sd.sampler;
    if (s.n < s2.targetMulti) {
      allDone = false;
      const kk = Math.min(kEach, s2.targetMulti - s.n);
      s.batch(kk, () => {
        if (s.n >= sd.nextChk) {
          sd.traj.push({ n: s.n, pi: s.pi, phat: s.phat });
          sd.nextChk = Math.ceil(sd.nextChk * 1.07) + 1;
        }
      });
    }
  }
  if (allDone) { s2.running = false; s2.done = true; }
}
function s2Draw() {
  const cv = $('s2-canvas');
  const ctx = fitCanvas(cv);
  const w = cv._w, h = cv._h;
  if (w < 10) return;
  ctx.clearRect(0, 0, w, h);
  const padL = 46, padR = 14, padT = 30, padB = 30;
  const pw = w - padL - padR, ph = h - padT - padB;
  const yLo = 2.62, yHi = 3.66;
  const X = n => padL + (Math.log10(Math.max(1, n)) / 6) * pw;
  const Y = v => padT + (1 - (clamp(v, yLo, yHi) - yLo) / (yHi - yLo)) * ph;
  /* 图例 */
  drawLegend(ctx, [
    [t('cTrajLab'), '#6ee7ff'], [t('cPiLab'), '#ffb454'], [t('cBandLab'), '#3d5a74']
  ], padL, 14);
  /* 网格：横线（π̂ 值） */
  ctx.font = '11.5px system-ui, sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  for (const gv of [2.8, 3.0, Math.PI, 3.3, 3.5]) {
    const yy = Y(gv);
    ctx.strokeStyle = gv === Math.PI ? '#57452a' : '#1a2230';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(padL, yy); ctx.lineTo(padL + pw, yy); ctx.stroke();
    ctx.fillStyle = '#9aa7b8';
    ctx.fillText(gv === Math.PI ? 'π' : fmt(gv, 1), padL - 6, yy);
  }
  /* 网格：竖线（N 的幂）+ 轴标 */
  ctx.textAlign = 'center';
  const sup = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶'];
  for (let e = 0; e <= 6; e++) {
    const xx = X(Math.pow(10, e));
    ctx.strokeStyle = '#1a2230';
    ctx.beginPath(); ctx.moveTo(xx, padT); ctx.lineTo(xx, padT + ph); ctx.stroke();
    ctx.fillStyle = '#9aa7b8';
    ctx.fillText('10' + sup[e], xx, padT + ph + 14);
  }
  ctx.fillText(t('cAxisN'), padL + pw / 2, padT + ph + 26);
  ctx.strokeStyle = '#2b3547'; ctx.strokeRect(padL, padT, pw, ph);
  if (s2.mode === 'single') {
    const tr = s2.traj;
    if (tr.length > 1) {
      /* ±2σ 带（π 为中心，σ 由轨迹各点 p̂ 算出，见红线 3） */
      ctx.beginPath();
      tr.forEach((p, i) => {
        const yy = Y(Math.PI + 2 * sigPi(p.phat, p.n));
        i ? ctx.lineTo(X(p.n), yy) : ctx.moveTo(X(p.n), yy);
      });
      for (let i = tr.length - 1; i >= 0; i--) {
        const p = tr[i];
        ctx.lineTo(X(p.n), Y(Math.PI - 2 * sigPi(p.phat, p.n)));
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(110,231,255,0.13)';
      ctx.fill();
      /* 轨迹 */
      ctx.strokeStyle = '#6ee7ff'; ctx.lineWidth = 1.8;
      ctx.beginPath();
      tr.forEach((p, i) => { i ? ctx.lineTo(X(p.n), Y(p.pi)) : ctx.moveTo(X(p.n), Y(p.pi)); });
      ctx.stroke();
      /* 里程碑点 */
      for (const m of MILESTONES) {
        if (s2.miles[m] !== undefined) {
          const pm = tr.reduce((best, p) => Math.abs(p.n - m) < Math.abs(best.n - m) ? p : best, tr[0]);
          ctx.fillStyle = '#ffb454';
          ctx.beginPath(); ctx.arc(X(pm.n), Y(pm.pi), 3.6, 0, TAU); ctx.fill();
        }
      }
    }
  } else {
    /* 20 条轨迹成束 */
    s2.seeds.forEach((sd, i) => {
      const tr = sd.traj;
      if (tr.length < 2) return;
      ctx.strokeStyle = 'hsla(' + (i * 47 % 360) + ',75%,68%,0.55)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      tr.forEach((p, j) => { j ? ctx.lineTo(X(p.n), Y(p.pi)) : ctx.moveTo(X(p.n), Y(p.pi)); });
      ctx.stroke();
    });
  }
  /* π 真值线 */
  ctx.strokeStyle = '#ffb454'; ctx.lineWidth = 1.4; ctx.setLineDash([7, 5]);
  ctx.beginPath(); ctx.moveTo(padL, Y(Math.PI)); ctx.lineTo(padL + pw, Y(Math.PI)); ctx.stroke();
  ctx.setLineDash([]);
}
function s2Readout() {
  const el = $('s2-readout'), mel = $('s2-miles');
  if (s2.mode === 'single') {
    const s = s2.single;
    if (!s.n) {
      el.innerHTML = t('s2roS', { n: 0, pi: '—', band: '—', seed: s2.baseSeed });
    } else {
      const band = fmt(2 * sigPi(s.phat, s.n), 4);
      el.innerHTML = t(s2.done ? 's2roSdone' : 's2roS', { n: fmtInt(s.n), pi: fmt(s.pi, 5), band, seed: s2.baseSeed });
    }
    let chips = '<span style="color:var(--muted)">' + t('s2miles') + '</span>';
    const sup = { 100: '10²', 1000: '10³', 10000: '10⁴', 100000: '10⁵', 1000000: '10⁶' };
    for (const m of MILESTONES) {
      const v = s2.miles[m];
      chips += '<span class="mile-chip">N=' + sup[m] + ' · <b>' + (v === undefined ? t('s2milePend') : fmt(v, 4)) + '</b></span>';
    }
    mel.innerHTML = chips;
  } else {
    const n0 = s2.seeds[0].sampler.n;
    if (!n0) {
      el.innerHTML = t('s2roM', { n: 0, emp: '—', theo: '—', seed: s2.baseSeed });
    } else {
      const pis = s2.seeds.map(sd => sd.sampler.pi).filter(v => isFinite(v));
      const mean = pis.reduce((a, b) => a + b, 0) / pis.length;
      const emp = Math.sqrt(pis.reduce((a, b) => a + (b - mean) * (b - mean), 0) / pis.length);
      const theo = 4 * Math.sqrt((Math.PI / 4) * (1 - Math.PI / 4) / n0);
      el.innerHTML = t('s2roM', { n: fmtInt(n0), emp: fmt(emp, 4), theo: fmt(theo, 4), seed: s2.baseSeed });
    }
    mel.innerHTML = '';
  }
}
function s2SyncBtn() {
  const b = $('s2-play');
  const curN = s2.mode === 'single' ? s2.single.n : (s2.seeds.length ? s2.seeds[0].sampler.n : 0);
  b.textContent = s2.done ? t('runDone') : (s2.running ? t('pause') : (curN ? t('resumeLong') : t('runLong')));
  b.disabled = s2.done;
}
animate($('step2'), () => {
  if (s2.running) {
    if (s2.mode === 'single') s2StepSingle(6000);
    else s2StepMulti(500);
  }
  s2Draw(); s2Readout(); s2SyncBtn();
});
$('s2-play').addEventListener('click', () => { if (!s2.done) { s2.running = !s2.running; s2SyncBtn(); } });
$('s2-seed').addEventListener('click', () => { s2.baseSeed = freshSeed(); s2ResetAll(); s2Draw(); s2Readout(); s2SyncBtn(); });
$('s2-reset').addEventListener('click', () => { s2ResetAll(); s2Draw(); s2Readout(); s2SyncBtn(); });
document.querySelectorAll('#step2 .mbtn').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('#step2 .mbtn').forEach(x => x.classList.toggle('active', x === b));
    const newMode = b.dataset.mode;
    if (newMode !== s2.mode) {
      /* 切换模式即把目标模式复位（含 done 状态），按正文引导操作不会被上一模式的完成态锁死 */
      s2.mode = newMode;
      if (newMode === 'single') s2NewSingle(); else s2NewMulti();
      s2.running = false;
    }
    s2Draw(); s2Readout(); s2SyncBtn();
  });
});
onLangRefresh(() => { s2Draw(); s2Readout(); s2SyncBtn(); });
onRefit(() => s2Draw());

/* ================================================================
   第 3 步 · 没有公式的面积：形状撒点估面积
   ================================================================ */
function makeShapeSampler(seed, shapeId) {
  const sh = SHAPES[shapeId];
  const rnd = mulberry32(seed);
  const [x0, x1, y0, y1] = sh.box;
  const bw = x1 - x0, bh = y1 - y0, boxArea = bw * bh;
  let n = 0, inside = 0;
  const api = {
    seed: seed >>> 0, shape: shapeId, boxArea,
    get n() { return n; },
    get inside() { return inside; },
    get est() { return n ? boxArea * inside / n : NaN; },
    next() {
      const x = x0 + rnd() * bw, y = y0 + rnd() * bh;
      const inn = sh.test(x, y);
      n++; if (inn) inside++;
      return { x, y, inn };
    },
    batch(k, onPoint) { for (let i = 0; i < k; i++) { const p = api.next(); if (onPoint) onPoint(p); } }
  };
  return api;
}
const s3 = {
  shape: 'heart', seed: 31415, sampler: null, running: false, acc: 0,
  disp: [], cap: 30000, maskKey: '', mask: null
};
function s3Reset(newSeed) {
  if (newSeed) s3.seed = freshSeed();
  s3.sampler = makeShapeSampler(s3.seed, s3.shape);
  s3.disp = []; s3.acc = 0;
}
s3Reset(false);
function s3Plot(cv) {
  const sh = SHAPES[s3.shape];
  const [x0, x1, y0, y1] = sh.box;
  const bw = x1 - x0, bh = y1 - y0;
  const aw = cv._w - 24, ah = cv._h - 16;
  const sc = Math.min(aw / bw, ah / bh);
  const pw = bw * sc, ph = bh * sc;
  const ox = (cv._w - pw) / 2, oy = (cv._h - ph) / 2;
  return { x0, y0, bw, bh, sc, pw, ph, ox, oy };
}
function s3Mask(cv, P) {
  const key = s3.shape + '|' + Math.round(P.pw) + 'x' + Math.round(P.ph);
  if (s3.maskKey === key && s3.mask) return s3.mask;
  const sh = SHAPES[s3.shape];
  const mc = document.createElement('canvas');
  mc.width = Math.max(2, Math.round(P.pw));
  mc.height = Math.max(2, Math.round(P.ph));
  const mctx = mc.getContext('2d');
  const img = mctx.createImageData(mc.width, mc.height);
  for (let j = 0; j < mc.height; j++) {
    const y = P.y0 + (1 - (j + 0.5) / mc.height) * P.bh;
    for (let i = 0; i < mc.width; i++) {
      const x = P.x0 + ((i + 0.5) / mc.width) * P.bw;
      if (sh.test(x, y)) {
        const o = (j * mc.width + i) * 4;
        img.data[o] = 110; img.data[o + 1] = 231; img.data[o + 2] = 255; img.data[o + 3] = 30;
      }
    }
  }
  mctx.putImageData(img, 0, 0);
  s3.maskKey = key; s3.mask = mc;
  return mc;
}
function s3Draw() {
  const cv = $('s3-canvas');
  const ctx = fitCanvas(cv);
  const w = cv._w, h = cv._h;
  if (w < 10) return;
  ctx.clearRect(0, 0, w, h);
  const P = s3Plot(cv);
  ctx.drawImage(s3Mask(cv, P), P.ox, P.oy, P.pw, P.ph);
  const X = x => P.ox + (x - P.x0) / P.bw * P.pw;
  const Y = y => P.oy + (1 - (y - P.y0) / P.bh) * P.ph;
  for (const p of s3.disp) {
    ctx.fillStyle = p.inn ? '#6ee7ff' : '#54637a';
    ctx.fillRect(X(p.x) - 1, Y(p.y) - 1, 2, 2);
  }
  ctx.strokeStyle = '#8494ab'; ctx.lineWidth = 1.2;
  ctx.strokeRect(P.ox, P.oy, P.pw, P.ph);
}
function s3Readout() {
  const ref = shapeRef(s3.shape);
  const def = t(SHAPES[s3.shape].defKey);
  const s = s3.sampler;
  if (!s.n) {
    $('s3-readout').innerHTML = t('s3ro0', { def, ref: fmt(ref, 4), seed: s3.seed });
    return;
  }
  const dev = (s.est - ref) / ref * 100;
  $('s3-readout').innerHTML = t('s3ro', {
    def, n: fmtInt(s.n), inside: fmtInt(s.inside), rate: fmt(s.inside / s.n, 4),
    est: fmt(s.est, 4), ref: fmt(ref, 4),
    dev: (dev >= 0 ? '+' : '') + fmt(dev, 2) + '%',
    seed: s3.seed
  });
}
function s3SyncBtn() { $('s3-play').textContent = s3.running ? t('pause') : (s3.sampler.n ? t('resume') : t('runStart')); }
animate($('step3'), dt => {
  if (s3.running) {
    s3.acc += 9000 * dt;
    const k = Math.floor(s3.acc);
    s3.acc -= k;
    if (k > 0) s3.sampler.batch(k, p => { if (s3.disp.length < s3.cap) s3.disp.push(p); });
  }
  s3Draw(); s3Readout(); s3SyncBtn();
});
$('s3-play').addEventListener('click', () => { s3.running = !s3.running; s3SyncBtn(); });
$('s3-seed').addEventListener('click', () => { s3Reset(true); s3Draw(); s3Readout(); s3SyncBtn(); });
$('s3-reset').addEventListener('click', () => { s3Reset(false); s3Draw(); s3Readout(); s3SyncBtn(); });
document.querySelectorAll('#step3 .shbtn').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('#step3 .shbtn').forEach(x => x.classList.toggle('active', x === b));
    s3.shape = b.dataset.shape;
    s3.maskKey = '';
    s3Reset(false);
    s3Draw(); s3Readout(); s3SyncBtn();
  });
});
onLangRefresh(() => { s3Draw(); s3Readout(); s3SyncBtn(); });
onRefit(() => { s3.maskKey = ''; s3Draw(); });

/* ================================================================
   第 4 步 · 布丰投针
   数据坐标：线距 d = 1，地板 y ∈ [0,6]，横向 x ∈ [0,10]
   ================================================================ */
const s4 = {
  seed: 2718, ld: 0.8, sampler: null, shown: [], cap: 300,
  pending: 0, auto: false, acc: 0
};
function s4Reset(newSeed) {
  if (newSeed) s4.seed = freshSeed();
  s4.sampler = makeNeedleSampler(s4.seed, s4.ld);
  s4.shown = []; s4.pending = 0; s4.acc = 0;
}
s4Reset(false);
function s4Add(k) {
  for (let i = 0; i < k; i++) {
    const nd = s4.sampler.next();
    s4.shown.push(nd);
    if (s4.shown.length > s4.cap) s4.shown.shift();
  }
}
function s4Draw() {
  const cv = $('s4-canvas');
  const ctx = fitCanvas(cv);
  const w = cv._w, h = cv._h;
  if (w < 10) return;
  ctx.clearRect(0, 0, w, h);
  const padL = 14, padR = 14, padT = 30, padB = 12;
  const sc = Math.min((w - padL - padR) / 10, (h - padT - padB) / 6);
  const pw = 10 * sc, ph = 6 * sc;
  const ox = (w - pw) / 2, oy = padT + (h - padT - padB - ph) / 2;
  const X = v => ox + v * sc, Y = v => oy + (1 - v / 6) * ph;
  drawLegend(ctx, [[t('cCross'), '#ff7a93'], [t('cMiss'), '#8494ab']], ox, 14);
  /* 地板 */
  ctx.fillStyle = '#11161f';
  ctx.fillRect(ox, oy, pw, ph);
  /* 平行线 */
  ctx.strokeStyle = '#3d5a74'; ctx.lineWidth = 1.6;
  for (let i = 0; i <= 6; i++) {
    ctx.beginPath(); ctx.moveTo(ox, Y(i)); ctx.lineTo(ox + pw, Y(i)); ctx.stroke();
  }
  /* 针 */
  const L = s4.ld;
  s4.shown.forEach((nd, idx) => {
    const hx = (L / 2) * Math.cos(nd.th), hy = (L / 2) * Math.sin(nd.th);
    const isNew = idx === s4.shown.length - 1;
    ctx.strokeStyle = nd.cross ? '#ff7a93' : '#8494ab';
    ctx.lineWidth = isNew ? 3 : 1.6;
    ctx.beginPath();
    ctx.moveTo(X(nd.cx - hx), Y(nd.cy - hy));
    ctx.lineTo(X(nd.cx + hx), Y(nd.cy + hy));
    ctx.stroke();
  });
  ctx.strokeStyle = '#2b3547'; ctx.lineWidth = 1;
  ctx.strokeRect(ox, oy, pw, ph);
}
function s4Readout() {
  const s = s4.sampler;
  const p = 2 * s4.ld / Math.PI;
  if (!s.cross) {
    $('s4-readout').innerHTML = t('s4roNoCross', { ld: fmt(s4.ld, 2), n: fmtInt(s.n), p: fmt(p, 4) });
    return;
  }
  $('s4-readout').innerHTML = t('s4ro', {
    ld: fmt(s4.ld, 2), n: fmtInt(s.n), cross: fmtInt(s.cross), pi: fmt(s.pi, 5), p: fmt(p, 4)
  });
}
function s4SyncAuto() {
  $('s4-auto').textContent = s4.auto ? t('stopAuto') : t('autoDrop');
  $('s4-auto').classList.toggle('active', s4.auto);
}
animate($('step4'), dt => {
  if (s4.pending > 0) {
    const k = Math.min(s4.pending, 5);
    s4.pending -= k;
    s4Add(k);
  }
  if (s4.auto) {
    s4.acc += 24 * dt;
    const k = Math.floor(s4.acc);
    s4.acc -= k;
    if (k > 0) s4Add(k);
  }
  s4Draw(); s4Readout();
});
$('s4-one').addEventListener('click', () => { s4Add(1); s4Draw(); s4Readout(); });
$('s4-x100').addEventListener('click', () => { s4.pending += 100; });
$('s4-auto').addEventListener('click', () => { s4.auto = !s4.auto; s4SyncAuto(); });
$('s4-reset').addEventListener('click', () => { s4Reset(false); s4Draw(); s4Readout(); });
$('s4-len').addEventListener('input', e => {
  s4.ld = parseFloat(e.target.value);
  $('s4-len-val').textContent = fmt(s4.ld, 2);
  s4Reset(false); /* L 变了，旧计数口径失效，重新计数 */
  s4Draw(); s4Readout();
});
onLangRefresh(() => { s4Draw(); s4Readout(); s4SyncAuto(); $('s4-len-val').textContent = fmt(s4.ld, 2); });
onRefit(() => s4Draw());

/* ================================================================
   第 5 步 · 高维：超球体积比
   ================================================================ */
const s5 = {
  d: 5, seed: 1618, sampler: null, running: false, acc: 0, disp: [], cap: 20000
};
function s5Reset(newSeed) {
  if (newSeed) s5.seed = freshSeed();
  s5.sampler = makeSphereSampler(s5.seed, s5.d);
  s5.disp = []; s5.acc = 0;
}
s5Reset(false);
function s5Draw() {
  const cv = $('s5-canvas');
  const ctx = fitCanvas(cv);
  const w = cv._w, h = cv._h;
  if (w < 10) return;
  ctx.clearRect(0, 0, w, h);
  /* 左：前两维投影 */
  const side = Math.min(h - 52, (w - 30) * 0.52);
  const ox = 12, oy = 36 + (h - 52 - side) / 2;
  const X = v => ox + v * side, Y = v => oy + (1 - v) * side;
  ctx.font = '12.5px system-ui, sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#9aa7b8';
  ctx.fillText(t('cProj'), ox, 14);
  for (const p of s5.disp) {
    ctx.fillStyle = p.inn ? '#6ee7ff' : '#54637a';
    ctx.fillRect(X(p.x) - 1, Y(p.y) - 1, 2, 2);
  }
  ctx.strokeStyle = '#8494ab'; ctx.lineWidth = 1.2;
  ctx.strokeRect(ox, oy, side, side);
  ctx.strokeStyle = '#ffb454'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.arc(X(0.5), Y(0.5), side / 2, 0, TAU); ctx.stroke();
  /* 右：各维真值条（对数）+ 当前估值标记 */
  const bx = ox + side + 26, bw = w - bx - 14;
  const by = 36, bh = h - 52;
  ctx.fillStyle = '#9aa7b8';
  ctx.fillText(t('cTrue'), bx, 14);
  const dMin = 2, dMax = 10;
  const bwEach = bw / (dMax - dMin + 1);
  const logLo = -3, logHi = 0;
  const LY = v => by + (1 - (Math.log10(Math.max(v, 1e-3)) - logLo) / (logHi - logLo)) * bh;
  for (let d = dMin; d <= dMax; d++) {
    const tv = sphereRatioTrue(d);
    const x0 = bx + (d - dMin) * bwEach + 3, x1 = bx + (d - dMin + 1) * bwEach - 3;
    const cur = d === s5.d;
    ctx.fillStyle = cur ? 'rgba(110,231,255,0.55)' : 'rgba(110,160,190,0.28)';
    ctx.fillRect(x0, LY(tv), x1 - x0, by + bh - LY(tv));
    ctx.fillStyle = cur ? '#6ee7ff' : '#9aa7b8';
    ctx.font = '11.5px system-ui, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('d=' + d, (x0 + x1) / 2, by + bh + 12);
    if (cur && s5.sampler.n) {
      const ey = LY(s5.sampler.ratio);
      ctx.strokeStyle = '#ffb454'; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.moveTo(x0 - 2, ey); ctx.lineTo(x1 + 2, ey); ctx.stroke();
      ctx.fillStyle = '#ffb454';
      const lab = t('cEstMk');
      if (x1 + 6 + ctx.measureText(lab).width <= w - 2) {
        ctx.textAlign = 'left';
        ctx.fillText(lab, x1 + 6, ey);
      } else {
        ctx.textAlign = 'right';
        ctx.fillText(lab, x0 - 6, ey);
      }
    }
  }
  ctx.textAlign = 'left';
  ctx.strokeStyle = '#2b3547'; ctx.strokeRect(bx, by, bw, bh);
}
function s5Readout() {
  const s = s5.sampler, tru = sphereRatioTrue(s5.d);
  const rel = s.n ? (s.ratio - tru) / tru * 100 : NaN;
  let html = t('s5ro', {
    d: s5.d, n: fmtInt(s.n), hits: fmtInt(s.inside),
    est: s.n ? fmt(s.ratio, 5) : '—', tru: fmt(tru, 5),
    rel: s.n ? ((rel >= 0 ? '+' : '') + fmt(rel, 1) + '%') : '—',
    seed: s5.seed
  });
  /* 低命中主动警告：命中数 <30 时相对 σ = 1/√命中数 > 18%，估值还很飘，不许读者把噪声当结论 */
  if (s.n && s.inside < 30) html += '<br><span class="warn">' + t('s5warnLow', { hits: fmtInt(s.inside) }) + '</span>';
  $('s5-readout').innerHTML = html;
  const grid = Math.pow(10, s5.d);
  $('s5-grid').innerHTML = t('s5grid', {
    d: s5.d, grid: fmtInt(grid),
    t10: fmtDur(grid / 1e8), e100: 2 * s5.d, t100: fmtDur(Math.pow(10, 2 * s5.d) / 1e8)
  });
}
function s5SyncBtn() { $('s5-play').textContent = s5.running ? t('pause') : (s5.sampler.n ? t('resume') : t('runStart')); }
animate($('step5'), dt => {
  if (s5.running) {
    s5.acc += 5000 * dt;
    const k = Math.floor(s5.acc);
    s5.acc -= k;
    if (k > 0) s5.sampler.batch(k, p => { if (s5.disp.length < s5.cap) s5.disp.push(p); });
  }
  s5Draw(); s5Readout(); s5SyncBtn();
});
$('s5-play').addEventListener('click', () => { s5.running = !s5.running; s5SyncBtn(); });
$('s5-seed').addEventListener('click', () => { s5Reset(true); s5Draw(); s5Readout(); s5SyncBtn(); });
$('s5-reset').addEventListener('click', () => { s5Reset(false); s5Draw(); s5Readout(); s5SyncBtn(); });
$('s5-dim').addEventListener('input', e => {
  s5.d = parseInt(e.target.value, 10);
  $('s5-dim-val').textContent = s5.d;
  s5Reset(false); /* 维度变了，计数口径重来 */
  s5Draw(); s5Readout(); s5SyncBtn();
});
onLangRefresh(() => { s5Draw(); s5Readout(); s5SyncBtn(); $('s5-dim-val').textContent = s5.d; });
onRefit(() => s5Draw());

/* ================================================================
   第 6 步 · 终章：种子可复现 + 最少点数挑战
   ================================================================ */
const s6 = {
  demoSeed: 12345, firstList: null, shownList: null,
  chSeed: freshSeed(), ch: null, chieved: null, best: null
};
try {
  const b = window.localStorage.getItem('mc-challenge-best');
  if (b && isFinite(parseInt(b, 10))) s6.best = parseInt(b, 10);
} catch (e) { /* 退化为内存 */ }
function firstPoints(seed, k) {
  const s = makePiSampler(seed);
  const out = [];
  s.batch(k, p => out.push(p));
  return out;
}
function s6NewChallenge() {
  s6.ch = makePiSampler(s6.chSeed);
  s6.chieved = null;
}
s6NewChallenge();
function s6Draw() {
  const cv = $('s6-canvas');
  const ctx = fitCanvas(cv);
  const w = cv._w, h = cv._h;
  if (w < 10) return;
  ctx.clearRect(0, 0, w, h);
  const side = Math.min(w - 24, h - 20);
  const ox = (w - side) / 2, oy = (h - side) / 2;
  const X = v => ox + v * side, Y = v => oy + (1 - v) * side;
  ctx.strokeStyle = '#2b3547'; ctx.lineWidth = 1;
  ctx.strokeRect(ox, oy, side, side);
  ctx.strokeStyle = '#57452a'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(X(0.5), Y(0.5), side / 2, 0, TAU); ctx.stroke();
  if (s6.shownList) {
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    s6.shownList.forEach((p, i) => {
      ctx.fillStyle = p.inn ? '#6ee7ff' : '#8494ab';
      ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), 8, 0, TAU); ctx.fill();
      ctx.fillStyle = '#08131a';
      ctx.fillText(String(i + 1), X(p.x), Y(p.y) + 0.5);
    });
  }
  ctx.textAlign = 'left';
}
function s6DemoReadout(mode) {
  const el = $('s6-readout');
  if (mode === 'none') { el.textContent = t('s6roNone'); return; }
  const list = s6.firstList || [];
  const coords = list.map((p, i) =>
    '#' + (i + 1) + ' (' + fmt(p.x, 4) + ', ' + fmt(p.y, 4) + ')').join(' · ');
  if (mode === 'first') {
    el.innerHTML = t('s6roFirst', { seed: s6.demoSeed }) +
      '<br><span class="coord-list">' + coords + '</span>';
  } else if (mode === 'match') {
    el.innerHTML = t('s6roMatch') + '<br><span class="coord-list">' + coords + '</span>';
  }
}
function s6ChReadout() {
  const s = s6.ch;
  let state;
  if (s6.chieved) state = t('s6chIn', { n: fmtInt(s6.chieved) });
  else state = t('s6chOut');
  const bestPart = s6.best ? t('s6chBest', { best: fmtInt(s6.best) }) : t('s6chBestNone');
  $('s6-challenge').innerHTML = t('s6ch', {
    seed: s6.chSeed, n: fmtInt(s.n),
    pi: s.n ? fmt(s.pi, 5) : '—', state
  }) + bestPart;
}
function s6ChAdd(k) {
  s6.ch.batch(k);
  const s = s6.ch;
  if (!s6.chieved && s.n && s.pi >= 3.135 && s.pi <= 3.145) {
    s6.chieved = s.n;
    if (!s6.best || s.n < s6.best) {
      s6.best = s.n;
      try { window.localStorage.setItem('mc-challenge-best', String(s.n)); } catch (e) { /* 忽略 */ }
    }
  }
  s6ChReadout();
}
$('s6-first').addEventListener('click', () => {
  const v = parseInt($('s6-seed').value, 10);
  s6.demoSeed = isFinite(v) ? (v >>> 0) : 0;
  s6.firstList = firstPoints(s6.demoSeed, 10);
  s6.shownList = s6.firstList;
  s6Draw(); s6DemoReadout('first');
});
$('s6-replay').addEventListener('click', () => {
  if (!s6.firstList) { s6DemoReadout('none'); return; }
  const again = firstPoints(s6.demoSeed, 10);
  let match = again.length === s6.firstList.length;
  for (let i = 0; i < again.length && match; i++) {
    if (again[i].x !== s6.firstList[i].x || again[i].y !== s6.firstList[i].y) match = false;
  }
  s6.shownList = again;
  s6Draw();
  if (match) s6DemoReadout('match');
  else $('s6-readout').textContent = t('s6roDiff');
});
$('s6-a10').addEventListener('click', () => s6ChAdd(10));
$('s6-a100').addEventListener('click', () => s6ChAdd(100));
$('s6-a1000').addEventListener('click', () => s6ChAdd(1000));
$('s6-retry').addEventListener('click', () => {
  s6.chSeed = freshSeed();
  s6NewChallenge();
  s6ChReadout();
});
animate($('step6'), () => { s6Draw(); });
onLangRefresh(() => {
  s6Draw();
  if (s6.firstList) s6DemoReadout(s6.shownList === s6.firstList ? 'first' : 'match');
  else s6DemoReadout('none');
  s6ChReadout();
});
onRefit(() => s6Draw());
s6DemoReadout('none');
s6ChReadout();

/* ================================================================
   window.MC — 评审对账接口（全部走与页面相同的实现）
   ================================================================ */
window.MC = {
  mulberry32, gamma: gammaFn, sphereRatioTrue,
  makePiSampler, makeRadiusSampler, makeNeedleSampler, makeSphereSampler, makeShapeSampler,
  firstPoints,
  piEstimate(seed, N) { const s = makePiSampler(seed); s.batch(N); return { n: s.n, inside: s.inside, pi: s.pi }; },
  needleEstimate(seed, N, ld) { const s = makeNeedleSampler(seed, ld); s.batch(N); return { n: s.n, cross: s.cross, pi: s.pi }; },
  sphereEstimate(seed, N, d) { const s = makeSphereSampler(seed, d); s.batch(N); return { n: s.n, inside: s.inside, ratio: s.ratio, tru: sphereRatioTrue(d) }; },
  shapeRef, shapeTest(id, x, y) { return SHAPES[id].test(x, y); },
  shapeBox(id) { return SHAPES[id].box.slice(); },
  sigmaPi(phat, n) { return sigPi(phat, n); },
  getState() {
    return {
      s0: { seed: s0.seed, n: s0.sampler.n, inside: s0.sampler.inside, pi: s0.sampler.pi, running: s0.running, rate: s0.rate, shown: s0.disp.length, cap: s0.cap },
      s1: { seed: s1.seed, r: s1.r, n: s1.sampler.n, inside: s1.sampler.inside, pi: s1.sampler.pi },
      s2: {
        mode: s2.mode, baseSeed: s2.baseSeed,
        single: { n: s2.single.n, inside: s2.single.inside, pi: s2.single.pi, miles: Object.assign({}, s2.miles), trajPts: s2.traj.length },
        multiN: s2.seeds.length ? s2.seeds[0].sampler.n : 0,
        multiPis: s2.seeds.map(sd => sd.sampler.pi)
      },
      s3: { shape: s3.shape, seed: s3.seed, n: s3.sampler.n, inside: s3.sampler.inside, est: s3.sampler.est, ref: shapeRefs[s3.shape] },
      s4: { seed: s4.seed, ld: s4.ld, n: s4.sampler.n, cross: s4.sampler.cross, pi: s4.sampler.pi },
      s5: { d: s5.d, seed: s5.seed, n: s5.sampler.n, hits: s5.sampler.inside, ratio: s5.sampler.ratio, tru: sphereRatioTrue(s5.d) },
      s6: {
        demoSeed: s6.demoSeed,
        firstList: s6.firstList ? s6.firstList.map(p => ({ x: p.x, y: p.y, inn: p.inn })) : null,
        challenge: { seed: s6.chSeed, n: s6.ch.n, inside: s6.ch.inside, pi: s6.ch.pi, achievedAt: s6.chieved, best: s6.best }
      }
    };
  }
};
