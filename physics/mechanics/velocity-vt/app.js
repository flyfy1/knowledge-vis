'use strict';
/* 速度与 v-t 图 · 面积就是路 — 全部逻辑（无依赖，原生 Canvas 2D）
   依赖 i18n.js 先行加载：t() / getLang() / onLangRefresh()。

   ★ 红线落点：
   1. 全部读数由状态纯渲染：动画与探针共用同一个时钟 t，位置/速度/路程
      都由纯函数从 t 算出，图上、读数、判定三方永远同源。
   2. 面积对账精确自洽：第 2 步左台阶和 = 4 − 4/n（n=4/8/16 → 3 / 3.5 / 3.75），
      与精确值 4 的差 1 / 0.5 / 0.25 随 n 单调减小；第 3 步分段面积
      4 + 12 + 4 = 20 m 整；自测页 9 + 18 + 6 = 33 m 整。断言在自查脚本里跑。
   3. 答题改参清旧判定：探针一动，第 4 步问题 1 的旧判定即作废。
   对账入口：window.VELOCITY（PURE 函数 + state）。 */
const $ = id => document.getElementById(id);
let NOW = 0;

/* PURE-BEGIN —— 纯函数区（无 DOM 依赖，自查脚本抽取本区断言） */
/* 第 0 步赛跑：甲 4 m/s、乙 2 m/s，时长 10 s，全程 40 m */
const RACE0 = { vA: 4, vB: 2, T: 10, L: 40 };
function raceX(v, t) { return v * t; }
/* 第 1 步三车：丙前 4 s 速度 0→4（v = t），之后保持 4 */
const RACE1 = { T: 8 };
function race1Vel(car, t) {
  if (car === 'A') return 4;
  if (car === 'B') return 2;
  return Math.min(Math.max(t, 0), 4); /* C */
}
function race1Pos(car, t) {
  if (car === 'A') return 4 * t;
  if (car === 'B') return 2 * t;
  if (t <= 4) return t * t / 2;       /* C：∫0^t τ dτ = t²/2 */
  return 8 + 4 * (t - 4);
}
/* 第 2 步：匀速块 v=4、T=3 → 面积 12；加速 v=2t（0→4，T=2）→ 三角形面积 4 */
const UNI = { v: 4, T: 3 };
function uniArea() { return UNI.v * UNI.T; }
const ACC = { T: 2, V: 4 };
function accV(t) { return 2 * t; }
function accExact() { return 0.5 * ACC.T * ACC.V; }
function stairs(n) { /* 左台阶和：每条高取左端速度 */
  const dt = ACC.T / n;
  let s = 0;
  for (let i = 0; i < n; i++) s += accV(i * dt) * dt;
  return s;
}
function stairsDiff(n) { return accExact() - stairs(n); }
/* 分段 v-t 剖面通用件 */
function segVAt(seg, t) {
  const u = (t - seg.t0) / (seg.t1 - seg.t0);
  return seg.v0 + (seg.v1 - seg.v0) * u;
}
function segAreaTo(seg, t) { /* 段内从 t0 到 t（t 已钳制在段内）的面积 */
  return (t - seg.t0) * (seg.v0 + segVAt(seg, t)) / 2;
}
function segArea(seg) { return (seg.t1 - seg.t0) * (seg.v0 + seg.v1) / 2; }
function profileVAt(segs, t) {
  for (const s of segs) if (t <= s.t1) return segVAt(s, Math.max(t, s.t0));
  return segs[segs.length - 1].v1;
}
function profileDistTo(segs, t) {
  let d = 0;
  for (const s of segs) {
    if (t <= s.t0) break;
    d += segAreaTo(s, Math.min(t, s.t1));
    if (t <= s.t1) break;
  }
  return d;
}
function profileTotal(segs) { return segs.reduce((a, s) => a + segArea(s), 0); }
/* 第 3 步行程：0–2 加速 0→4，2–5 匀速 4，5–7 减速 4→0 → 4 + 12 + 4 = 20 */
const PROFILE = [
  { t0: 0, t1: 2, v0: 0, v1: 4 },
  { t0: 2, t1: 5, v0: 4, v1: 4 },
  { t0: 5, t1: 7, v0: 4, v1: 0 }
];
/* 第 4 步自测行程：0–3 加速 0→6，3–6 匀速 6，6–8 减速 6→0 → 9 + 18 + 6 = 33 */
const QUIZPROFILE = [
  { t0: 0, t1: 3, v0: 0, v1: 6 },
  { t0: 3, t1: 6, v0: 6, v1: 6 },
  { t0: 6, t1: 8, v0: 6, v1: 0 }
];
function profileV(t) { return profileVAt(PROFILE, t); }
function profileDist(t) { return profileDistTo(PROFILE, t); }
function totalDist() { return profileTotal(PROFILE); }
function quizV(t) { return profileVAt(QUIZPROFILE, t); }
function quizTotal() { return profileTotal(QUIZPROFILE); }
/* PURE-END */

/* ---------- 画布适配（DPR）：沿用站内 fitCanvas 方案 ---------- */
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
function regCanvas(id) { const cv = $(id); if (!allCanvases.includes(cv)) allCanvases.push(cv); return cv; }
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
  NOW = ts;
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
function setRO(id, str) { const el = $(id); if (el && el._v !== str) { el._v = str; el.innerHTML = str; } }
function fmt(x) {
  const r = Math.round(x * 10000) / 10000;
  return String(r === 0 ? 0 : r);
}
/* 按量分类的读数口径（评审 S1）：时间 / 位置 / 速度 / 路程统一 2 位小数，
   同一句里不再混出 4 位；切条步长 dt 最小 0.125 s、需 3 位，单独一档。
   坐标轴刻度是精确标尺值、不是测量读数，仍用 fmt 原样输出。 */
function fmtN(x, dp) {
  const r = Math.round(x * Math.pow(10, dp)) / Math.pow(10, dp);
  return String(r === 0 ? 0 : r);
}
function fmt2(x) { return fmtN(x, 2); }
function fmtDt(x) { return fmtN(x, 3); }
function fitText(ctx, text, x, y, maxW, o) {
  o = o || {};
  let size = o.size || 13;
  const weight = o.weight || '';
  ctx.font = (weight ? weight + ' ' : '') + size + 'px system-ui, sans-serif';
  while (size > 9 && ctx.measureText(text).width > maxW) {
    size -= 0.5;
    ctx.font = (weight ? weight + ' ' : '') + size + 'px system-ui, sans-serif';
  }
  ctx.fillStyle = o.color || '#9aa7b8';
  ctx.textAlign = o.align || 'left';
  ctx.textBaseline = o.baseline || 'alphabetic';
  ctx.fillText(text, x, y);
  return ctx.measureText(text).width;
}
const COL = {
  cyan: '#6ee7ff', orange: '#ffb454', pink: '#ff7a93', green: '#7ee2a8',
  ink: '#e8edf4', mut: '#9aa7b8', grid: '#39465e', axis: '#8494ab', dim: '#232d3f'
};

/* ---------- 图表原语 ---------- */
function makePlot(W, H, xmax, ymax) {
  const x0 = 48, y0 = 24, w = W - x0 - 14, h = H - y0 - 44;
  return {
    x0, y0, w, h, xmax, ymax,
    X: v => x0 + w * v / xmax,
    Y: v => y0 + h - h * v / ymax
  };
}
function drawAxes(ctx, p, xticks, yticks, xlabel, ylabel) {
  ctx.lineWidth = 1;
  ctx.font = '12px system-ui, sans-serif';
  xticks.forEach(v => {
    const x = p.X(v);
    ctx.strokeStyle = COL.grid;
    ctx.beginPath(); ctx.moveTo(x, p.y0); ctx.lineTo(x, p.y0 + p.h); ctx.stroke();
    ctx.fillStyle = COL.mut; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(fmt(v), x, p.y0 + p.h + 5);
  });
  yticks.forEach(v => {
    const y = p.Y(v);
    ctx.strokeStyle = COL.grid;
    ctx.beginPath(); ctx.moveTo(p.x0, y); ctx.lineTo(p.x0 + p.w, y); ctx.stroke();
    if (v === p.ymax) return; /* 顶格刻度与纵轴标题同角，只留网格线不标数，免叠字 */
    ctx.fillStyle = COL.mut; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.fillText(fmt(v), p.x0 - 7, y);
  });
  ctx.strokeStyle = COL.axis; ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(p.x0, p.y0 + p.h); ctx.lineTo(p.x0 + p.w, p.y0 + p.h);
  ctx.moveTo(p.x0, p.y0); ctx.lineTo(p.x0, p.y0 + p.h);
  ctx.stroke();
  ctx.fillStyle = COL.mut; ctx.textAlign = 'right'; ctx.textBaseline = 'top';
  ctx.font = '12.5px system-ui, sans-serif';
  ctx.fillText(xlabel, p.x0 + p.w, p.y0 + p.h + 22);
  ctx.textAlign = 'left';
  /* 纵轴标题整行画在图区上方留白里，不与顶格网格线相贴（评审 S4） */
  ctx.fillText(ylabel, 2, Math.max(1, p.y0 - 19));
  ctx.textBaseline = 'alphabetic';
}
function drawCar(ctx, x, y, color, label, posTxt) {
  /* 车身 */
  ctx.fillStyle = color;
  ctx.beginPath();
  const w = 38, h = 17, r = 5;
  ctx.roundRect(x - w / 2, y - h / 2, w, h, r);
  ctx.fill();
  /* 车轮 */
  ctx.fillStyle = '#0d1117';
  [-11, 11].forEach(dx => {
    ctx.beginPath(); ctx.arc(x + dx, y + h / 2 - 1, 4.2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 1.2; ctx.stroke();
  });
  /* 名称（上方）与位置（下方），横向钳制不溢出 */
  ctx.font = '600 12.5px system-ui, sans-serif';
  const lw = ctx.measureText(label).width;
  const lx = clamp(x - w / 2, 2, Math.max(2, ctx._W - lw - 2));
  ctx.fillStyle = color; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillText(label, lx, y - h / 2 - 7);
  ctx.font = '12px system-ui, sans-serif';
  const pw = ctx.measureText(posTxt).width;
  const px = clamp(x - pw / 2, 2, Math.max(2, ctx._W - pw - 2));
  ctx.fillStyle = COL.mut;
  ctx.fillText(posTxt, px, y + h / 2 + 17);
}
function trackGeom(cv, maxDist) {
  const x0 = 30, x1 = cv._w - 16;
  return { x0, x1, X: d => x0 + (x1 - x0) * d / maxDist };
}
function drawTrackBase(ctx, cv, g, maxDist, ticks, finishAt) {
  /* 跑道面 */
  ctx.fillStyle = '#12161f';
  ctx.fillRect(g.x0 - 8, 18, (g.x1 - g.x0) + 16, cv._h - 62);
  /* 刻度轴 */
  const ay = cv._h - 30;
  ctx.strokeStyle = COL.axis; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(g.x0, ay); ctx.lineTo(g.x1, ay); ctx.stroke();
  ctx.font = '12px system-ui, sans-serif';
  ticks.forEach(d => {
    const x = g.X(d);
    ctx.strokeStyle = COL.grid;
    ctx.beginPath(); ctx.moveTo(x, ay - 4); ctx.lineTo(x, ay + 4); ctx.stroke();
    ctx.fillStyle = COL.mut; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(fmt(d), x, ay + 7);
  });
  if (finishAt !== null && finishAt !== undefined) {
    const fx = g.X(finishAt);
    ctx.strokeStyle = COL.green; ctx.lineWidth = 1.6; ctx.setLineDash([6, 5]);
    ctx.beginPath(); ctx.moveTo(fx, 22); ctx.lineTo(fx, ay - 6); ctx.stroke();
    ctx.setLineDash([]);
    fitText(ctx, t('cFinish'), fx - 5, 16, 110, { align: 'right', color: COL.green, size: 12.5 });
  }
  fitText(ctx, t('cStart'), g.x0 + 2, 16, 110, { color: COL.mut, size: 12.5 });
}

/* ============================================================
   第 0 步：赛跑（甲 4 m/s、乙 2 m/s，10 s / 40 m）
   ============================================================ */
const S0 = { t: 0, playing: false };
function s0PlayLabel() { $('s0-play').textContent = S0.playing ? t('pause') : t('play'); }
function drawS0Track() {
  const cv = regCanvas('s0-track');
  const ctx = fitCanvas(cv);
  ctx._W = cv._w;
  ctx.clearRect(0, 0, cv._w, cv._h);
  const g = trackGeom(cv, 44);
  drawTrackBase(ctx, cv, g, 44, [0, 10, 20, 30, 40], 40);
  const xa = raceX(RACE0.vA, S0.t), xb = raceX(RACE0.vB, S0.t);
  ctx.strokeStyle = 'rgba(110,231,255,.16)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(g.x0, 62); ctx.lineTo(g.x1, 62); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,180,84,.16)';
  ctx.beginPath(); ctx.moveTo(g.x0, 122); ctx.lineTo(g.x1, 122); ctx.stroke();
  drawCar(ctx, g.X(xa), 62, COL.cyan, t('cCarA'), fmt2(xa) + ' m');
  drawCar(ctx, g.X(xb), 122, COL.orange, t('cCarB'), fmt2(xb) + ' m');
}
function drawS0Chart() {
  const cv = regCanvas('s0-chart');
  const ctx = fitCanvas(cv);
  ctx.clearRect(0, 0, cv._w, cv._h);
  const p = makePlot(cv._w, cv._h, 10, 44);
  drawAxes(ctx, p, [0, 2, 4, 6, 8, 10], [0, 10, 20, 30, 40], t('cTimeS'), t('cPosM'));
  const tNow = S0.t;
  const series = [
    { v: RACE0.vA, color: COL.cyan },
    { v: RACE0.vB, color: COL.orange }
  ];
  /* 全程淡线（目的地）+ 已生长实线 */
  series.forEach(s => {
    ctx.strokeStyle = s.color; ctx.globalAlpha = 0.16; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(p.X(0), p.Y(0)); ctx.lineTo(p.X(RACE0.T), p.Y(s.v * RACE0.T)); ctx.stroke();
    ctx.globalAlpha = 1;
    if (tNow > 0) {
      ctx.lineWidth = 2.6;
      ctx.beginPath(); ctx.moveTo(p.X(0), p.Y(0)); ctx.lineTo(p.X(tNow), p.Y(s.v * tNow)); ctx.stroke();
    }
    /* 当前点 + 到两轴的虚线 */
    const cx = p.X(tNow), cy = p.Y(s.v * tNow);
    ctx.strokeStyle = s.color; ctx.lineWidth = 1.1; ctx.setLineDash([4, 4]); ctx.globalAlpha = 0.55;
    ctx.beginPath(); ctx.moveTo(cx, p.y0 + p.h); ctx.lineTo(cx, cy); ctx.lineTo(p.x0, cy); ctx.stroke();
    ctx.setLineDash([]); ctx.globalAlpha = 1;
    ctx.fillStyle = s.color;
    ctx.beginPath(); ctx.arc(cx, cy, 4.4, 0, Math.PI * 2); ctx.fill();
  });
  S0.geom = p;
}
function renderS0() {
  drawS0Track(); drawS0Chart();
  $('s0-probe').value = S0.t;
  $('s0-t-val').textContent = 't = ' + fmt2(S0.t) + ' s';
  const xa = raceX(RACE0.vA, S0.t), xb = raceX(RACE0.vB, S0.t);
  if (S0.t <= 0) setRO('s0-readout', t('s0roStart'));
  else if (S0.t >= RACE0.T) setRO('s0-readout', t('s0roEnd'));
  else setRO('s0-readout', t('s0ro', { t: fmt2(S0.t), xa: fmt2(xa), xb: fmt2(xb), gap: fmt2(xa - xb) }));
  s0PlayLabel();
}
function s0SetT(nt, fromSlider) {
  S0.t = clamp(nt, 0, RACE0.T);
  if (fromSlider) S0.playing = false;
  if (S0.t >= RACE0.T) S0.playing = false;
  renderS0();
}

/* ============================================================
   第 1 步：v-t 登场（甲、乙 + 丙起步加速，8 s）
   ============================================================ */
const S1 = { t: 0, playing: false, mode: 'xt' };
function s1PlayLabel() { $('s1-play').textContent = S1.playing ? t('pause') : t('play'); }
function drawS1Track() {
  const cv = regCanvas('s1-track');
  const ctx = fitCanvas(cv);
  ctx._W = cv._w;
  ctx.clearRect(0, 0, cv._w, cv._h);
  const g = trackGeom(cv, 36);
  drawTrackBase(ctx, cv, g, 36, [0, 8, 16, 24, 32], null);
  const lanes = [['A', 50, COL.cyan, 'cCarA'], ['B', 106, COL.orange, 'cCarB'], ['C', 162, COL.pink, 'cCarC']];
  lanes.forEach(L => {
    const x = race1Pos(L[0], S1.t);
    drawCar(ctx, g.X(x), L[1], L[2], t(L[3]), fmt2(x) + ' m');
  });
}
function s1Series(car, mode) {
  /* 采样折线：返回 [[t, val]...] 覆盖 0..S1.t */
  const pts = [];
  const N = Math.max(1, Math.round(S1.t / 0.1));
  for (let i = 0; i <= N; i++) {
    const tt = Math.min(S1.t, i * 0.1);
    pts.push([tt, mode === 'xt' ? race1Pos(car, tt) : race1Vel(car, tt)]);
  }
  if (pts[pts.length - 1][0] < S1.t) pts.push([S1.t, mode === 'xt' ? race1Pos(car, S1.t) : race1Vel(car, S1.t)]);
  return pts;
}
function drawS1Chart() {
  const cv = regCanvas('s1-chart');
  const ctx = fitCanvas(cv);
  ctx.clearRect(0, 0, cv._w, cv._h);
  const isX = S1.mode === 'xt';
  const p = isX ? makePlot(cv._w, cv._h, 8, 36) : makePlot(cv._w, cv._h, 8, 5);
  drawAxes(ctx, p, [0, 2, 4, 6, 8], isX ? [0, 8, 16, 24, 32] : [0, 1, 2, 3, 4, 5],
    t('cTimeS'), isX ? t('cPosM') : t('cVelV'));
  const cars = [['A', COL.cyan], ['B', COL.orange], ['C', COL.pink]];
  /* 全程淡线 */
  const saveT = S1.t;
  S1.t = RACE1.T;
  cars.forEach(c => {
    const pts = s1Series(c[0], S1.mode);
    ctx.strokeStyle = c[1]; ctx.globalAlpha = 0.15; ctx.lineWidth = 2;
    ctx.beginPath();
    pts.forEach((q, i) => { if (i === 0) ctx.moveTo(p.X(q[0]), p.Y(q[1])); else ctx.lineTo(p.X(q[0]), p.Y(q[1])); });
    ctx.stroke(); ctx.globalAlpha = 1;
  });
  S1.t = saveT;
  /* 已生长部分 + 当前点 */
  cars.forEach(c => {
    const pts = s1Series(c[0], S1.mode);
    if (S1.t > 0) {
      ctx.strokeStyle = c[1]; ctx.lineWidth = 2.6;
      ctx.beginPath();
      pts.forEach((q, i) => { if (i === 0) ctx.moveTo(p.X(q[0]), p.Y(q[1])); else ctx.lineTo(p.X(q[0]), p.Y(q[1])); });
      ctx.stroke();
    }
    const val = isX ? race1Pos(c[0], S1.t) : race1Vel(c[0], S1.t);
    const cx = p.X(S1.t), cy = p.Y(val);
    ctx.strokeStyle = c[1]; ctx.lineWidth = 1.1; ctx.setLineDash([4, 4]); ctx.globalAlpha = 0.5;
    ctx.beginPath(); ctx.moveTo(cx, p.y0 + p.h); ctx.lineTo(cx, cy); ctx.lineTo(p.x0, cy); ctx.stroke();
    ctx.setLineDash([]); ctx.globalAlpha = 1;
    ctx.fillStyle = c[1];
    ctx.beginPath(); ctx.arc(cx, cy, 4.2, 0, Math.PI * 2); ctx.fill();
  });
  S1.geom = p;
}
function renderS1() {
  drawS1Track(); drawS1Chart();
  $('s1-probe').value = S1.t;
  $('s1-t-val').textContent = 't = ' + fmt2(S1.t) + ' s';
  $('s1-m-xt').classList.toggle('active', S1.mode === 'xt');
  $('s1-m-vt').classList.toggle('active', S1.mode === 'vt');
  if (S1.mode === 'xt') {
    setRO('s1-readout', t('s1roX', {
      t: fmt2(S1.t), xa: fmt2(race1Pos('A', S1.t)), xb: fmt2(race1Pos('B', S1.t)), xc: fmt2(race1Pos('C', S1.t))
    }));
  } else if (S1.t >= RACE1.T) {
    setRO('s1-readout', t('s1roVEnd'));
  } else {
    setRO('s1-readout', t('s1roV', {
      t: fmt2(S1.t), va: fmt2(race1Vel('A', S1.t)), vb: fmt2(race1Vel('B', S1.t)), vc: fmt2(race1Vel('C', S1.t))
    }));
  }
  s1PlayLabel();
}
function s1SetT(nt, fromSlider) {
  S1.t = clamp(nt, 0, RACE1.T);
  if (fromSlider) S1.playing = false;
  if (S1.t >= RACE1.T) S1.playing = false;
  renderS1();
}

/* ============================================================
   第 2 步：面积就是路（匀速矩形 + 加速三角形/台阶）
   ============================================================ */
const S2 = { shown: false, mode: 'idle' }; /* mode: idle | tri | 4 | 8 | 16 */
function drawS2A() {
  const cv = regCanvas('s2a-canvas');
  const ctx = fitCanvas(cv);
  ctx.clearRect(0, 0, cv._w, cv._h);
  const H = cv._h, W = cv._w;
  const chartH = H - 108;
  const p = makePlot(W, chartH + 44, 3.6, 5);
  /* makePlot 的 h 按传入高度算，这里手动对齐：图区只占上部（y0 与 makePlot 同口径，底边位置不变） */
  p.h = chartH - 24 - 32; p.y0 = 24;
  p.Y = v => p.y0 + p.h - p.h * v / 5;
  drawAxes(ctx, p, [0, 1, 2, 3], [0, 1, 2, 3, 4, 5], t('cTimeS'), t('cVelV'));
  /* v = 4 水平线 0..3 */
  const y4 = p.Y(UNI.v), x0 = p.X(0), x3 = p.X(UNI.T);
  if (S2.shown) {
    ctx.fillStyle = 'rgba(110,231,255,.26)';
    ctx.fillRect(x0, y4, x3 - x0, (p.y0 + p.h) - y4);
    ctx.strokeStyle = COL.cyan; ctx.lineWidth = 1.4;
    ctx.strokeRect(x0, y4, x3 - x0, (p.y0 + p.h) - y4);
  }
  ctx.strokeStyle = COL.cyan; ctx.lineWidth = 2.8;
  ctx.beginPath(); ctx.moveTo(x0, y4); ctx.lineTo(x3, y4); ctx.stroke();
  /* 3 s 之后速度还在继续，但不在这块面积的计算区内：改虚线淡画，与实线计算区分开（评审 S3） */
  ctx.save();
  ctx.globalAlpha = 0.5; ctx.lineWidth = 2; ctx.setLineDash([5, 5]);
  ctx.beginPath(); ctx.moveTo(x3, y4); ctx.lineTo(p.X(3.6), y4); ctx.stroke();
  ctx.restore();
  ctx.fillStyle = COL.cyan;
  ctx.beginPath(); ctx.arc(x3, y4, 4.2, 0, Math.PI * 2); ctx.fill();
  /* 下方路标尺：0..14 m */
  const sy = H - 62;
  fitText(ctx, t('cRoad'), 2, sy - 12, 220, { color: COL.mut, size: 13 });
  const rx0 = 48, rx1 = W - 14;
  ctx.strokeStyle = COL.axis; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(rx0, sy + 14); ctx.lineTo(rx1, sy + 14); ctx.stroke();
  [0, 4, 8, 12].forEach(d => {
    const x = rx0 + (rx1 - rx0) * d / 14;
    ctx.strokeStyle = COL.grid;
    ctx.beginPath(); ctx.moveTo(x, sy + 10); ctx.lineTo(x, sy + 18); ctx.stroke();
    ctx.fillStyle = COL.mut; ctx.font = '12px system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(fmt(d), x, sy + 21);
  });
  const dist = S2.shown ? uniArea() : 0;
  const ex = rx0 + (rx1 - rx0) * dist / 14;
  if (S2.shown) {
    ctx.fillStyle = 'rgba(126,226,168,.4)';
    ctx.fillRect(rx0, sy + 4, ex - rx0, 8);
  }
  ctx.fillStyle = COL.orange;
  ctx.beginPath(); ctx.arc(rx0 + (rx1 - rx0) * (S2.shown ? dist : 0) / 14, sy + 8, 5, 0, Math.PI * 2); ctx.fill();
  if (S2.shown) {
    fitText(ctx, fmt2(dist) + ' m', ex + 8, sy + 12, 70, { color: COL.green, size: 13.5, weight: '700' });
  }
}
function drawS2B() {
  const cv = regCanvas('s2b-canvas');
  const ctx = fitCanvas(cv);
  ctx.clearRect(0, 0, cv._w, cv._h);
  const p = makePlot(cv._w, cv._h, 2.4, 5);
  drawAxes(ctx, p, [0, 0.5, 1, 1.5, 2], [0, 1, 2, 3, 4, 5], t('cTimeS'), t('cVelV'));
  const base = p.y0 + p.h;
  if (S2.mode === 'tri') {
    ctx.fillStyle = 'rgba(110,231,255,.26)';
    ctx.beginPath();
    ctx.moveTo(p.X(0), base); ctx.lineTo(p.X(ACC.T), p.Y(ACC.V)); ctx.lineTo(p.X(ACC.T), base);
    ctx.closePath(); ctx.fill();
  } else if (typeof S2.mode === 'number') {
    const n = S2.mode, dt = ACC.T / n;
    for (let i = 0; i < n; i++) {
      const xa = p.X(i * dt), xb = p.X((i + 1) * dt), yTop = p.Y(accV(i * dt));
      ctx.fillStyle = 'rgba(255,180,84,.32)';
      ctx.fillRect(xa, yTop, xb - xa, base - yTop);
      ctx.strokeStyle = 'rgba(255,180,84,.75)'; ctx.lineWidth = 1;
      ctx.strokeRect(xa, yTop, xb - xa, base - yTop);
    }
  }
  /* 真实斜线永远在最上层 */
  ctx.strokeStyle = COL.cyan; ctx.lineWidth = 2.8;
  ctx.beginPath(); ctx.moveTo(p.X(0), p.Y(0)); ctx.lineTo(p.X(ACC.T), p.Y(ACC.V)); ctx.stroke();
  ctx.fillStyle = COL.cyan;
  ctx.beginPath(); ctx.arc(p.X(ACC.T), p.Y(ACC.V), 4.2, 0, Math.PI * 2); ctx.fill();
}
function renderS2() {
  drawS2A(); drawS2B();
  setRO('s2a-readout', S2.shown ? t('s2aDone') : t('s2aIdle'));
  [['s2b-tri', 'tri'], ['s2b-4', 4], ['s2b-8', 8], ['s2b-16', 16]].forEach(pair => {
    $(pair[0]).classList.toggle('active', S2.mode === pair[1]);
  });
  if (S2.mode === 'idle') setRO('s2b-readout', t('s2bIdle'));
  else if (S2.mode === 'tri') setRO('s2b-readout', t('s2bTriRo'));
  else {
    const n = S2.mode;
    setRO('s2b-readout', t('s2bCutRo', {
      n: n, dt: fmtDt(ACC.T / n), sum: fmt2(stairs(n)), diff: fmt2(stairsDiff(n))
    }));
  }
}

/* ============================================================
   第 3 步：读图实战（分段行程 20 m）
   ============================================================ */
const S3 = {
  probe: 0,
  lit: [false, false, false],
  q: [null, null, null] /* 每段判定：null | 'acc' | 'uni' | 'dec'（存最近一次选择） */
};
const S3ANS = ['acc', 'uni', 'dec'];
const SEG_COL = [COL.cyan, COL.orange, COL.pink];
function drawProfile(ctx, p, segs, opts) {
  /* opts: {lit:[bool], probeT, tMax} */
  const base = p.y0 + p.h;
  /* 段填充 */
  segs.forEach((s, i) => {
    if (!opts.lit || !opts.lit[i]) return;
    ctx.fillStyle = SEG_COL[i] + '44';
    ctx.beginPath();
    ctx.moveTo(p.X(s.t0), base);
    const steps = 24;
    for (let k = 0; k <= steps; k++) {
      const tt = s.t0 + (s.t1 - s.t0) * k / steps;
      ctx.lineTo(p.X(tt), p.Y(segVAt(s, tt)));
    }
    ctx.lineTo(p.X(s.t1), base);
    ctx.closePath(); ctx.fill();
  });
  /* 曲线 */
  ctx.strokeStyle = COL.ink; ctx.lineWidth = 2.8;
  ctx.beginPath();
  const tEnd = segs[segs.length - 1].t1;
  const N = 140;
  for (let k = 0; k <= N; k++) {
    const tt = tEnd * k / N;
    const x = p.X(tt), y = p.Y(profileVAt(segs, tt));
    if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  /* 段界虚线 */
  ctx.strokeStyle = COL.grid; ctx.lineWidth = 1.2; ctx.setLineDash([5, 5]);
  segs.slice(1).forEach(s => {
    ctx.beginPath(); ctx.moveTo(p.X(s.t0), p.y0); ctx.lineTo(p.X(s.t0), base); ctx.stroke();
  });
  ctx.setLineDash([]);
  /* 探针 */
  if (opts.probeT !== null && opts.probeT !== undefined) {
    const tt = opts.probeT, vv = profileVAt(segs, tt);
    const cx = p.X(tt), cy = p.Y(vv);
    ctx.strokeStyle = COL.orange; ctx.lineWidth = 1.6; ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(cx, base); ctx.lineTo(cx, cy); ctx.lineTo(p.x0, cy); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = COL.orange;
    ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#0d1117'; ctx.lineWidth = 1.4; ctx.stroke();
  }
}
function drawS3() {
  const cv = regCanvas('s3-canvas');
  const ctx = fitCanvas(cv);
  ctx.clearRect(0, 0, cv._w, cv._h);
  const p = makePlot(cv._w, cv._h, 7, 5);
  drawAxes(ctx, p, [0, 1, 2, 3, 4, 5, 6, 7], [0, 1, 2, 3, 4, 5], t('cTimeS'), t('cVelV'));
  drawProfile(ctx, p, PROFILE, { lit: S3.lit, probeT: S3.probe });
  S3.geom = p;
}
function renderS3() {
  drawS3();
  $('s3-probe').value = S3.probe;
  $('s3-t-val').textContent = 't = ' + fmt2(S3.probe) + ' s';
  setRO('s3-readout', t('s3ro', {
    t: fmt2(S3.probe), v: fmt2(profileV(S3.probe)), d: fmt2(profileDist(S3.probe))
  }));
  ['s3-seg1', 's3-seg2', 's3-seg3'].forEach((id, i) => $(id).classList.toggle('lit', S3.lit[i]));
  const litIdx = [0, 1, 2].filter(i => S3.lit[i]);
  if (!litIdx.length) {
    setRO('s3-area1', t('s3areaIdle'));
    setRO('s3-area2', '');
  } else {
    setRO('s3-area1', litIdx.map(i => t('s3segA' + (i + 1))).join('<br>'));
    const sum = litIdx.reduce((a, i) => a + segArea(PROFILE[i]), 0);
    setRO('s3-area2', litIdx.length === 3 ? t('s3areaAll') : t('s3areaSum', { sum: fmt2(sum) }));
  }
  /* 三连问答 */
  [0, 1, 2].forEach(i => {
    const fb = $('s3q-fb-' + i);
    const ans = S3.q[i];
    document.querySelectorAll('[data-q="' + i + '"]').forEach(btn => {
      const v = btn.getAttribute('data-v');
      btn.classList.toggle('correct', ans !== null && v === S3ANS[i] && ans === S3ANS[i]);
      btn.classList.toggle('wrongpick', ans !== null && v === ans && ans !== S3ANS[i]);
    });
    if (ans === null) { fb.textContent = ''; fb.className = 'seg-q-fb'; }
    else if (ans === S3ANS[i]) { fb.textContent = t('qOk'); fb.className = 'seg-q-fb ok'; }
    else { fb.textContent = t('qNo'); fb.className = 'seg-q-fb no'; }
  });
}

/* ============================================================
   第 4 步：自测（新行程 33 m）
   ============================================================ */
const S4 = {
  probe: 0,
  q1: { status: 'idle', wrongT: null }, /* idle | wrong | done */
  q2: { picked: [], done: false },
  q3: { picked: null, done: false }
};
function drawS4() {
  const cv = regCanvas('s4-canvas');
  const ctx = fitCanvas(cv);
  ctx.clearRect(0, 0, cv._w, cv._h);
  const p = makePlot(cv._w, cv._h, 8, 7);
  drawAxes(ctx, p, [0, 1, 2, 3, 4, 5, 6, 7, 8], [0, 1, 2, 3, 4, 5, 6], t('cTimeS'), t('cVelV'));
  drawProfile(ctx, p, QUIZPROFILE, { lit: null, probeT: S4.probe });
  S4.geom = p;
}
function renderS4() {
  drawS4();
  $('s4-probe').value = S4.probe;
  $('s4-t-val').textContent = 't = ' + fmt2(S4.probe) + ' s';
  if (S4.q1.status === 'done') setRO('s4-q1-ro', t('s4q1Ok'));
  else if (S4.q1.status === 'wrong') setRO('s4-q1-ro', t('s4q1NoT', { t: fmt2(S4.q1.wrongT) }));
  else setRO('s4-q1-ro', t('s4probeRo', { t: fmt2(S4.probe), v: fmt2(quizV(S4.probe)) }));
  /* 题 1 答对即锁定（与题 2/3 同策略，评审 S2）：作答钮禁用，避免在别处重答把已对的判定翻掉 */
  $('s4-q1-btn').disabled = S4.q1.status === 'done';
  document.querySelectorAll('[data-q2]').forEach(btn => {
    const v = Number(btn.getAttribute('data-q2'));
    btn.classList.toggle('correct', S4.q2.done && v === 33);
    btn.classList.toggle('wrongpick', S4.q2.picked.includes(v));
    btn.disabled = S4.q2.done || S4.q2.picked.includes(v);
  });
  if (S4.q2.done) setRO('s4-q2-ro', t('s4q2Ok'));
  else if (S4.q2.picked.length) setRO('s4-q2-ro', t('s4q2No'));
  else setRO('s4-q2-ro', '');
  document.querySelectorAll('[data-q3]').forEach(btn => {
    const v = btn.getAttribute('data-q3');
    btn.classList.toggle('correct', S4.q3.done && v === 'false');
    btn.classList.toggle('wrongpick', S4.q3.picked === v && !S4.q3.done);
    btn.disabled = S4.q3.done;
  });
  if (S4.q3.done) setRO('s4-q3-ro', t('s4q3Ok'));
  else if (S4.q3.picked !== null) setRO('s4-q3-ro', t('s4q3No'));
  else setRO('s4-q3-ro', '');
  const n = (S4.q1.status === 'done' ? 1 : 0) + (S4.q2.done ? 1 : 0) + (S4.q3.done ? 1 : 0);
  setRO('s4-score', n === 3 ? t('s4scoreDone') : t('s4score', { n: n }));
}

/* ---------- 画布探针拖动（图上拖时间，与滑杆同一个状态） ---------- */
function bindDrag(cvId, geomFn, xmax, snap, apply) {
  const cv = $(cvId);
  if (!cv) return;
  cv.classList.add('dragc');
  let dragging = false;
  function toT(ev) {
    const p = geomFn();
    if (!p) return null;
    const r = cv.getBoundingClientRect();
    const cx = (ev.touches && ev.touches[0]) ? ev.touches[0].clientX : ev.clientX;
    let tt = (cx - r.left - p.x0) / p.w * xmax;
    tt = clamp(tt, 0, xmax);
    if (snap) tt = Math.round(tt / snap) * snap;
    return clamp(tt, 0, xmax);
  }
  function down(ev) { const tt = toT(ev); if (tt === null) return; dragging = true; apply(tt); if (ev.cancelable) ev.preventDefault(); }
  function move(ev) { if (!dragging) return; const tt = toT(ev); if (tt === null) return; apply(tt); if (ev.cancelable) ev.preventDefault(); }
  function up() { dragging = false; }
  cv.addEventListener('pointerdown', down);
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
  cv.addEventListener('touchstart', down, { passive: false });
  cv.addEventListener('touchmove', move, { passive: false });
  cv.addEventListener('touchend', up);
}

/* ---------- 初始化 ---------- */
function renderAll() { renderS0(); renderS1(); renderS2(); renderS3(); renderS4(); }
function init() {
  ['s0-track', 's0-chart', 's1-track', 's1-chart', 's2a-canvas', 's2b-canvas', 's3-canvas', 's4-canvas'].forEach(regCanvas);

  /* 第 0 步 */
  $('s0-play').addEventListener('click', () => {
    if (S0.t >= RACE0.T) S0.t = 0;
    S0.playing = !S0.playing;
    renderS0();
  });
  $('s0-restart').addEventListener('click', () => s0SetT(0, true));
  $('s0-probe').addEventListener('input', e => s0SetT(parseFloat(e.target.value), true));
  $('s0-start').addEventListener('click', () => {
    document.getElementById('step1').scrollIntoView({ behavior: 'smooth' });
  });
  animate($('step0'), dt => {
    if (S0.playing) {
      S0.t = Math.min(RACE0.T, Math.round((S0.t + dt * 1.5) * 50) / 50);
      if (S0.t >= RACE0.T) S0.playing = false;
    }
    renderS0();
  });

  /* 第 1 步 */
  $('s1-play').addEventListener('click', () => {
    if (S1.t >= RACE1.T) S1.t = 0;
    S1.playing = !S1.playing;
    renderS1();
  });
  $('s1-restart').addEventListener('click', () => s1SetT(0, true));
  $('s1-probe').addEventListener('input', e => s1SetT(parseFloat(e.target.value), true));
  $('s1-m-xt').addEventListener('click', () => { S1.mode = 'xt'; renderS1(); });
  $('s1-m-vt').addEventListener('click', () => { S1.mode = 'vt'; renderS1(); });
  animate($('step1'), dt => {
    if (S1.playing) {
      S1.t = Math.min(RACE1.T, Math.round((S1.t + dt * 1.5) * 50) / 50);
      if (S1.t >= RACE1.T) S1.playing = false;
    }
    renderS1();
  });

  /* 图上拖探针（步骤 0/1 与动画共用时钟，拖动即暂停） */
  bindDrag('s0-chart', () => S0.geom, 10, 0.1, tt => s0SetT(tt, true));
  bindDrag('s1-chart', () => S1.geom, 8, 0.1, tt => s1SetT(tt, true));

  /* 第 2 步 */
  $('s2a-btn').addEventListener('click', () => { S2.shown = true; renderS2(); });
  $('s2b-tri').addEventListener('click', () => { S2.mode = 'tri'; renderS2(); });
  $('s2b-4').addEventListener('click', () => { S2.mode = 4; renderS2(); });
  $('s2b-8').addEventListener('click', () => { S2.mode = 8; renderS2(); });
  $('s2b-16').addEventListener('click', () => { S2.mode = 16; renderS2(); });

  /* 第 3 步 */
  $('s3-probe').addEventListener('input', e => { S3.probe = parseFloat(e.target.value); renderS3(); });
  bindDrag('s3-canvas', () => S3.geom, 7, 0.25, tt => { S3.probe = tt; renderS3(); });
  ['s3-seg1', 's3-seg2', 's3-seg3'].forEach((id, i) => {
    $(id).addEventListener('click', () => { S3.lit[i] = !S3.lit[i]; renderS3(); });
  });
  document.querySelectorAll('[data-q]').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = Number(btn.getAttribute('data-q'));
      S3.q[i] = btn.getAttribute('data-v');
      renderS3();
    });
  });

  /* 第 4 步 */
  $('s4-probe').addEventListener('input', e => {
    S4.probe = parseFloat(e.target.value);
    if (S4.q1.status === 'wrong') S4.q1.status = 'idle'; /* 改参清旧判定 */
    renderS4();
  });
  bindDrag('s4-canvas', () => S4.geom, 8, 0.5, tt => {
    S4.probe = tt;
    if (S4.q1.status === 'wrong') S4.q1.status = 'idle';
    renderS4();
  });
  $('s4-q1-btn').addEventListener('click', () => {
    if (S4.q1.status === 'done') return; /* 已答对锁定（与题 2/3 同策略） */
    if (S4.probe === 7) { S4.q1.status = 'done'; }
    else { S4.q1.status = 'wrong'; S4.q1.wrongT = S4.probe; }
    renderS4();
  });
  document.querySelectorAll('[data-q2]').forEach(btn => {
    btn.addEventListener('click', () => {
      const v = Number(btn.getAttribute('data-q2'));
      if (S4.q2.done || S4.q2.picked.includes(v)) return;
      if (v === 33) S4.q2.done = true;
      else S4.q2.picked.push(v);
      renderS4();
    });
  });
  document.querySelectorAll('[data-q3]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (S4.q3.done) return;
      const v = btn.getAttribute('data-q3');
      S4.q3.picked = v;
      if (v === 'false') S4.q3.done = true;
      renderS4();
    });
  });

  renderAll();
  onLangRefresh(renderAll);
  onRefit(renderAll);
}
document.addEventListener('DOMContentLoaded', init);

/* 对账入口 */
window.VELOCITY = {
  raceX, race1Pos, race1Vel, uniArea, accV, accExact, stairs, stairsDiff,
  profileV, profileDist, totalDist, quizV, quizTotal, segArea,
  PROFILE, QUIZPROFILE, state: { S0, S1, S2, S3, S4 }
};
