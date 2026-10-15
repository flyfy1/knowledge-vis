'use strict';
/* 拉普拉斯与 ROC 交互讲解 — 全部逻辑（无依赖，原生 Canvas 2D）
   依赖 i18n.js 先行加载：t() / getLang() / onLangRefresh() / STR。

   ★ 红线（与 BRIEF 一一对应）：
   1. 复数运算真做：X(s) = 1/(s+a) 闭式逐点算（实部/虚部/模值）；探针读数绝不使用
      渲染网格插值。地形只是把同一闭式画在低分辨率离屏网格上（log10(1+|X|) 色标
      再经 γ=0.6 幂次提亮显示——单调映射、只改颜色不改数值，上限钳制 |X|=99，
      图注与图例均注明）。
   2. 切片曲线 = 闭式 |X(σ0+jω)|；σ0=0 且 a>0 时即傅里叶幅度谱 1/√(a²+ω²)；
      切片不在 ROC（σ0 ≤ −a）时不画曲线、如实标注不存在。
   3. ROC 一律解析判据：右边信号 σ>−a、左边信号 σ<−a（与 ω 无关），无数值积分。
   4. 第 4 步时域波形全闭式：欠阻尼 e^{σp·t}sin(ωd·t)/ωd；临界 t·e^{pt}；
      过阻尼 (e^{p1 t}−e^{p2 t})/(p1−p2)；包络按图注定义同为闭式。
   5. 极点参数口径：ζ、ω0 由极点位置反算（osc：ω0=|极点|，ζ=−σp/ω0；
      实极点同号：ω0=√(p1·p2)，ζ=−(p1+p2)/(2ω0)；异号时 ζ/ω0 无定义，显示 —）。
   6. 判读：因果 ⟺ ROC 为最右极点之右（idx=0）；稳定 ⟺ ROC 含虚轴（lo<0<hi）；
      h(t) 由部分分式闭式逐项按 ROC 取边求和。
   评审对账接口：window.LAP（见文件末尾）。 */
const TAU = Math.PI * 2;
const $ = id => document.getElementById(id);

/* ================================================================
   闭式数学核心（页面与 window.LAP 共用同一批实现）
   ================================================================ */
/* X(s) = 1/(s+a)，s = σ + jω → {re, im, mod} */
function X1(a, sig, om) {
  const dr = sig + a, di = om;
  const d = dr * dr + di * di;
  if (d === 0) return { re: Infinity, im: NaN, mod: Infinity };
  return { re: dr / d, im: -di / d, mod: 1 / Math.sqrt(d) };
}
/* 傅里叶幅度谱（a>0 时 σ=0 切片）：|X(jω)| = 1/√(a²+ω²) */
function fourierMag(a, om) { return 1 / Math.sqrt(a * a + om * om); }
/* 切片幅度闭式 |X(σ0+jω)|（代数式本身；是否存在由 inROC1 判定） */
function sliceMag(a, s0, om) { return X1(a, s0, om).mod; }
/* ROC 解析判据：side 'R' 右边信号 σ>−a；'L' 左边信号 σ<−a（边界 = 极点线，不收敛） */
function inROC1(a, sig, side) { return side === 'R' ? sig > -a : sig < -a; }

/* ---------- 第 4 步：二阶系统（状态在 s4，函数取显式参数便于对账） ---------- */
/* st: {mode:'osc', pr, wd} 或 {mode:'real', p1, p2}（p1≤p2 不强制，内部排序） */
function params4(st) {
  if (st.mode === 'osc') {
    const w0 = Math.hypot(st.pr, st.wd);
    return { w0, zeta: w0 > 0 ? -st.pr / w0 : NaN, sigP: st.pr };
  }
  const p1 = Math.min(st.p1, st.p2), p2 = Math.max(st.p1, st.p2);
  let w0 = NaN, zeta = NaN;
  if (p1 * p2 > 0) { w0 = Math.sqrt(p1 * p2); zeta = -(p1 + p2) / (2 * w0); }
  else if (p1 === p2 && p1 !== 0) { w0 = Math.abs(p1); zeta = p1 < 0 ? 1 : -1; }
  return { w0, zeta, sigP: p2 };
}
function impulse4(st, tt) {
  if (tt < 0) return 0;
  if (st.mode === 'osc') {
    if (st.wd < 1e-12) return tt * Math.exp(st.pr * tt); /* 退化：双重实极点 */
    return Math.exp(st.pr * tt) * Math.sin(st.wd * tt) / st.wd;
  }
  const p1 = Math.min(st.p1, st.p2), p2 = Math.max(st.p1, st.p2);
  if (Math.abs(p1 - p2) < 1e-9) return tt * Math.exp(p1 * tt);
  return (Math.exp(p1 * tt) - Math.exp(p2 * tt)) / (p1 - p2);
}
/* 包络 E(t)：欠阻尼 e^{σp t}/ωd；临界 = 曲线本身 t·e^{pt}；过阻尼 = 两分量绝对值之和 */
function envelope4(st, tt) {
  if (tt < 0) return 0;
  if (st.mode === 'osc') {
    if (st.wd < 1e-12) return tt * Math.exp(st.pr * tt);
    return Math.exp(st.pr * tt) / st.wd;
  }
  const p1 = Math.min(st.p1, st.p2), p2 = Math.max(st.p1, st.p2);
  if (Math.abs(p1 - p2) < 1e-9) return tt * Math.exp(p1 * tt);
  return (Math.exp(p1 * tt) + Math.exp(p2 * tt)) / Math.abs(p1 - p2);
}
function verdict4(st) {
  const { sigP } = params4(st);
  if (sigP < -1e-9) return 'stable';
  if (sigP > 1e-9) return 'unstable';
  if (st.mode === 'real' && st.p1 === 0 && st.p2 === 0) return 'unstable'; /* h(t)=t 无界 */
  return 'marginal';
}

/* ---------- 第 5 步：H(s) + ROC 判读（部分分式闭式） ---------- */
const SYS5 = {
  H1: { poles: [-1, -2] },
  H2: { poles: [1, -2] }
};
/* roc idx：0 = 最右极点之右；1 = 两极点之间；2 = 最左极点之左 → [lo, hi] */
function rocBounds5(sys, idx) {
  const ps = SYS5[sys].poles;
  const mx = Math.max.apply(null, ps), mn = Math.min.apply(null, ps);
  if (idx === 0) return [mx, Infinity];
  if (idx === 1) return [mn, mx];
  return [-Infinity, mn];
}
function judge5(sys, idx) {
  const poles = SYS5[sys].poles;
  const bd = rocBounds5(sys, idx), lo = bd[0], hi = bd[1];
  const terms = poles.map((p, i) => {
    let denom = 1;
    poles.forEach((q, j) => { if (j !== i) denom *= (p - q); });
    return { p, A: 1 / denom, side: p <= lo ? 'R' : 'L' };
  });
  const form = terms.every(x => x.side === 'R') ? 'right'
    : terms.every(x => x.side === 'L') ? 'left' : 'two';
  return {
    lo, hi, terms, form,
    causal: idx === 0,
    stable: lo < 0 && hi > 0
  };
}
function impulse5(sys, idx, tt) {
  const j = judge5(sys, idx);
  let s = 0;
  for (const tm of j.terms) {
    if (tm.side === 'R') { if (tt >= 0) s += tm.A * Math.exp(tm.p * tt); }
    else if (tt < 0) s += -tm.A * Math.exp(tm.p * tt);
  }
  return s;
}

/* ================================================================
   画布适配（DPR）：沿用傅里叶/采样/蒙特卡洛页 fitCanvas 方案
   ================================================================ */
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
function fmtS(v, d) { return fmt(v, d === undefined ? 2 : d).replace('-', '−'); }
function fmtX(v, d) { return isFinite(v) ? fmt(v, d) : '∞'; }
/* 截断标注小牌：曲线被画框截断时才由调用方画出（橙字 + 深色底，压在曲线上也读得清） */
function drawClipNote(ctx, xRight, yTop, text) {
  ctx.font = '11.5px system-ui, sans-serif';
  const tw = ctx.measureText(text).width;
  const x0 = xRight - tw - 12;
  ctx.fillStyle = 'rgba(10,14,20,0.88)';
  ctx.fillRect(x0, yTop, tw + 12, 21);
  ctx.strokeStyle = 'rgba(255,180,84,0.5)'; ctx.lineWidth = 1;
  ctx.strokeRect(x0, yTop, tw + 12, 21);
  ctx.fillStyle = '#ffb454'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(text, x0 + 6, yTop + 11);
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
/* s 平面坐标视图：把数据坐标 (σ, ω) 映射到画布像素 */
function planeView(w, h, sigMin, sigMax, omMin, omMax, padL, padR, padT, padB) {
  const pw = w - padL - padR, ph = h - padT - padB;
  return {
    ox: padL, oy: padT, pw, ph, sigMin, sigMax, omMin, omMax,
    X: s => padL + (s - sigMin) / (sigMax - sigMin) * pw,
    Y: o => padT + (omMax - o) / (omMax - omMin) * ph,
    invX: px => sigMin + (px - padL) / pw * (sigMax - sigMin),
    invY: py => omMax - (py - padT) / ph * (omMax - omMin)
  };
}
/* s 平面底图：网格、实轴、虚轴（σ=0 加亮）、刻度 */
function drawPlaneBase(ctx, v, opts) {
  opts = opts || {};
  if (!opts.noFill) { ctx.fillStyle = '#11161f'; ctx.fillRect(v.ox, v.oy, v.pw, v.ph); }
  ctx.font = '10.5px system-ui, sans-serif';
  ctx.lineWidth = 1;
  for (let s = Math.ceil(v.sigMin); s <= Math.floor(v.sigMax); s++) {
    if (s === 0) continue;
    ctx.strokeStyle = 'rgba(120,140,165,0.13)';
    ctx.beginPath(); ctx.moveTo(v.X(s), v.oy); ctx.lineTo(v.X(s), v.oy + v.ph); ctx.stroke();
    ctx.fillStyle = '#5f7089'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(String(s).replace('-', '−'), v.X(s), v.oy + v.ph + 4);
  }
  for (let o = Math.ceil(v.omMin); o <= Math.floor(v.omMax); o++) {
    if (o === 0) continue;
    ctx.strokeStyle = 'rgba(120,140,165,0.13)';
    ctx.beginPath(); ctx.moveTo(v.ox, v.Y(o)); ctx.lineTo(v.ox + v.pw, v.Y(o)); ctx.stroke();
    ctx.fillStyle = '#5f7089'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.fillText(String(o).replace('-', '−'), v.ox - 4, v.Y(o));
  }
  /* 实轴（ω=0） */
  ctx.strokeStyle = 'rgba(200,215,235,0.4)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(v.ox, v.Y(0)); ctx.lineTo(v.ox + v.pw, v.Y(0)); ctx.stroke();
  /* 虚轴（σ=0）——傅里叶的住所，特意加亮 */
  ctx.strokeStyle = opts.axisColor || 'rgba(110,231,255,0.75)'; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(v.X(0), v.oy); ctx.lineTo(v.X(0), v.oy + v.ph); ctx.stroke();
  ctx.strokeStyle = '#2b3547'; ctx.lineWidth = 1;
  ctx.strokeRect(v.ox, v.oy, v.pw, v.ph);
  ctx.fillStyle = '#9aa7b8'; ctx.font = '12px system-ui, sans-serif';
  ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
  ctx.fillText('σ →', v.ox + v.pw - 4, v.oy + v.ph - 4);
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillText('jω', v.X(0) + 5, v.oy + 4);
}
/* 极点标记：✕ */
function drawPole(ctx, x, y, col) {
  ctx.strokeStyle = col || '#ff7a93'; ctx.lineWidth = 2.4;
  const r = 6;
  ctx.beginPath();
  ctx.moveTo(x - r, y - r); ctx.lineTo(x + r, y + r);
  ctx.moveTo(x + r, y - r); ctx.lineTo(x - r, y + r);
  ctx.stroke();
}
/* ---------- 地形图：离屏低分辨率闭式渲染（log10(1+|X|) 色标 + γ 提亮显示，上限 |X|=99） ---------- */
const HEAT_GAMMA = 0.6; /* 显示提亮指数：对 log 值做幂次映射，单调、只改颜色不改数值（图注/图例注明） */
const HEAT_STOPS = [
  [0.00, [10, 16, 28]], [0.30, [16, 57, 94]], [0.52, [13, 110, 153]],
  [0.72, [55, 182, 217]], [0.88, [255, 180, 84]], [1.00, [255, 241, 207]]
];
function heatColor(tv) {
  const x = clamp(tv, 0, 1);
  for (let i = 1; i < HEAT_STOPS.length; i++) {
    if (x <= HEAT_STOPS[i][0]) {
      const [x0, c0] = HEAT_STOPS[i - 1], [x1, c1] = HEAT_STOPS[i];
      const f = (x - x0) / (x1 - x0);
      return [0, 1, 2].map(k => Math.round(c0[k] + (c1[k] - c0[k]) * f));
    }
  }
  return HEAT_STOPS[HEAT_STOPS.length - 1][1];
}
function renderHeat(off, a, sigMin, sigMax, omMin, omMax) {
  const ctx = off.getContext('2d');
  const W = off.width, H = off.height;
  const img = ctx.createImageData(W, H);
  for (let j = 0; j < H; j++) {
    const om = omMax - (j + 0.5) / H * (omMax - omMin);
    for (let i = 0; i < W; i++) {
      const sig = sigMin + (i + 0.5) / W * (sigMax - sigMin);
      const m = X1(a, sig, om).mod;
      const tv = clamp(Math.pow(Math.log10(1 + m) / 2, HEAT_GAMMA), 0, 1);
      const c = heatColor(tv);
      const k = (j * W + i) * 4;
      img.data[k] = c[0]; img.data[k + 1] = c[1]; img.data[k + 2] = c[2]; img.data[k + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}
/* ---------- 指针拖动挂载 ---------- */
function attachDrag(cv, onDown, onMove) {
  let drag = false;
  const pos = e => {
    const r = cv.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  cv.addEventListener('pointerdown', e => {
    if (onDown(pos(e))) {
      drag = true;
      try { cv.setPointerCapture(e.pointerId); } catch (err) { /* 忽略 */ }
      e.preventDefault();
    }
  });
  cv.addEventListener('pointermove', e => { if (drag) onMove(pos(e)); });
  const end = () => { drag = false; };
  cv.addEventListener('pointerup', end);
  cv.addEventListener('pointercancel', end);
}

/* ================================================================
   第 0 步 · 钩子：会死的波 e^{σt}·cos(ωt)
   ================================================================ */
const s0 = { sig: -0.35, om: 3, time: 0 };
function s0Draw() {
  const cv = $('s0-canvas');
  const ctx = fitCanvas(cv);
  const w = cv._w, h = cv._h;
  if (w < 10) return;
  ctx.clearRect(0, 0, w, h);
  const padL = 16, padR = 16, padT = 30, padB = 24;
  const pw = w - padL - padR, ph = h - padT - padB;
  const T = 6, YM = 2.3;
  const X = tt => padL + tt / T * pw;
  const Y = vv => padT + (YM - clamp(vv, -YM, YM)) / (2 * YM) * ph;
  drawLegend(ctx, [[t('cvWave'), '#6ee7ff'], [t('cvEnv'), '#ffb454']], padL, 14);
  ctx.fillStyle = '#11161f'; ctx.fillRect(padL, padT, pw, ph);
  /* 网格 + 零线 + t 刻度 */
  ctx.strokeStyle = 'rgba(120,140,165,0.13)'; ctx.lineWidth = 1;
  for (let tt = 1; tt < T; tt++) { ctx.beginPath(); ctx.moveTo(X(tt), padT); ctx.lineTo(X(tt), padT + ph); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(200,215,235,0.4)';
  ctx.beginPath(); ctx.moveTo(padL, Y(0)); ctx.lineTo(padL + pw, Y(0)); ctx.stroke();
  ctx.fillStyle = '#5f7089'; ctx.font = '10.5px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  for (let tt = 0; tt <= T; tt++) ctx.fillText('t=' + tt, X(tt), padT + ph + 5);
  /* 包络 ±e^{σt}（虚线） */
  ctx.strokeStyle = '#ffb454'; ctx.lineWidth = 1.4; ctx.setLineDash([6, 5]);
  for (const sgn of [1, -1]) {
    ctx.beginPath();
    for (let i = 0; i <= 240; i++) {
      const tt = i / 240 * T, vv = sgn * Math.exp(s0.sig * tt);
      if (i === 0) ctx.moveTo(X(tt), Y(vv)); else ctx.lineTo(X(tt), Y(vv));
    }
    ctx.stroke();
  }
  ctx.setLineDash([]);
  /* 波形全程（暗）+ 已唱部分（亮）+ 游标点 */
  const tau = s0.time % (T + 0.8);
  ctx.lineWidth = 2.2;
  for (const pass of [0, 1]) {
    ctx.strokeStyle = pass ? '#6ee7ff' : 'rgba(110,231,255,0.28)';
    ctx.beginPath();
    let started = false;
    for (let i = 0; i <= 360; i++) {
      const tt = i / 360 * T;
      if (pass && tt > tau) break;
      const vv = Math.exp(s0.sig * tt) * Math.cos(s0.om * tt);
      if (!started) { ctx.moveTo(X(tt), Y(vv)); started = true; } else ctx.lineTo(X(tt), Y(vv));
    }
    ctx.stroke();
  }
  if (tau <= T) {
    const vv = Math.exp(s0.sig * tau) * Math.cos(s0.om * tau);
    ctx.fillStyle = '#ffb454';
    ctx.beginPath(); ctx.arc(X(tau), Y(vv), 4.5, 0, TAU); ctx.fill();
  }
  ctx.strokeStyle = '#2b3547'; ctx.strokeRect(padL, padT, pw, ph);
}
function s0Readout() {
  $('s0-sig-val').textContent = fmtS(s0.sig, 2);
  $('s0-om-val').textContent = fmt(s0.om, 1);
  const verdict = s0.sig < -1e-9 ? t('s0vDecay') : s0.sig > 1e-9 ? t('s0vGrow') : t('s0vEqual');
  $('s0-readout').innerHTML = t('s0ro', {
    sig: fmtS(s0.sig, 2), om: fmt(s0.om, 1), verdict,
    env: fmtX(Math.exp(s0.sig * 6), 3)
  });
}
animate($('step0'), dt => { s0.time += dt; s0Draw(); });
$('s0-sig').addEventListener('input', e => { s0.sig = parseFloat(e.target.value); s0Draw(); s0Readout(); });
$('s0-om').addEventListener('input', e => { s0.om = parseFloat(e.target.value); s0Draw(); s0Readout(); });
$('s0-start').addEventListener('click', () => { $('step1').scrollIntoView({ behavior: 'smooth' }); });
onLangRefresh(() => { s0Draw(); s0Readout(); });
onRefit(() => s0Draw());
s0Draw(); s0Readout();

/* ================================================================
   第 1 步 · s 平面地形 + 探针（X(s) = 1/(s+a) 闭式）
   ================================================================ */
const s1 = {
  a: 1, probe: { sig: 0.7, om: 1.6 }, view: null,
  heat: document.createElement('canvas'), heatA: NaN
};
s1.heat.width = 168; s1.heat.height = 126;
function s1Draw() {
  const cv = $('s1-canvas');
  const ctx = fitCanvas(cv);
  const w = cv._w, h = cv._h;
  if (w < 10) return;
  ctx.clearRect(0, 0, w, h);
  const barH = 34;
  const v = planeView(w, h - barH, -3, 3, -4.5, 4.5, 30, 14, 12, 20);
  s1.view = v;
  if (s1.heatA !== s1.a) { renderHeat(s1.heat, s1.a, -3, 3, -4.5, 4.5); s1.heatA = s1.a; }
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(s1.heat, v.ox, v.oy, v.pw, v.ph);
  drawPlaneBase(ctx, v, { noFill: true });
  /* 极点 */
  const px = v.X(-s1.a), py = v.Y(0);
  drawPole(ctx, px, py, '#ffffff');
  ctx.font = '12.5px system-ui, sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(t('cvPole') + ' s = ' + fmtS(-s1.a, 2), px + 10, py - 6);
  /* 探针：十字虚线 + 圆点 */
  const qx = v.X(s1.probe.sig), qy = v.Y(s1.probe.om);
  ctx.strokeStyle = 'rgba(255,180,84,0.55)'; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(v.ox, qy); ctx.lineTo(v.ox + v.pw, qy);
  ctx.moveTo(qx, v.oy); ctx.lineTo(qx, v.oy + v.ph);
  ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = '#ffb454';
  ctx.beginPath(); ctx.arc(qx, qy, 5, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#0d1117'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.arc(qx, qy, 5, 0, TAU); ctx.stroke();
  ctx.fillStyle = '#ffb454'; ctx.textAlign = qx > v.ox + v.pw - 90 ? 'right' : 'left'; ctx.textBaseline = 'bottom';
  ctx.fillText(t('cvProbe'), qx + (ctx.textAlign === 'right' ? -9 : 9), qy - 5);
  /* 色标条 */
  const by = h - barH + 8, bh = 10, bw = Math.min(w - 28, 460);
  for (let i = 0; i < 72; i++) {
    const c = heatColor(i / 71);
    ctx.fillStyle = 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
    ctx.fillRect(14 + i * bw / 72, by, bw / 72 + 1, bh);
  }
  ctx.strokeStyle = '#2b3547'; ctx.strokeRect(14, by, bw, bh);
  ctx.fillStyle = '#9aa7b8'; ctx.font = '11.5px system-ui, sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillText(t('cvLog'), 14, by + bh + 3);
}
function s1Readout() {
  $('s1-a-val').textContent = fmt(s1.a, 2);
  const { sig, om } = s1.probe;
  const x = X1(s1.a, sig, om);
  const dist = Math.hypot(sig + s1.a, om);
  $('s1-readout').innerHTML = t('s1ro', {
    a: fmt(s1.a, 2),
    pole: fmtS(-s1.a, 2),
    s: fmtS(sig, 2) + (om >= 0 ? ' + j' : ' − j') + fmt(Math.abs(om), 2),
    re: fmtS(x.re, 3),
    imSign: x.im >= 0 ? '+' : '−',
    im: fmt(Math.abs(x.im), 3),
    mod: fmtX(x.mod, 3),
    dist: fmt(dist, 3),
    inv: fmtX(dist > 0 ? 1 / dist : Infinity, 3)
  });
}
attachDrag($('s1-canvas'),
  p => { if (s1.view) { s1.probe.sig = clamp(s1.view.invX(p.x), -3, 3); s1.probe.om = clamp(s1.view.invY(p.y), -4.5, 4.5); s1Draw(); s1Readout(); return true; } return false; },
  p => { if (s1.view) { s1.probe.sig = clamp(s1.view.invX(p.x), -3, 3); s1.probe.om = clamp(s1.view.invY(p.y), -4.5, 4.5); s1Draw(); s1Readout(); } });
$('s1-canvas').classList.add('drag');
$('s1-a').addEventListener('input', e => { s1.a = parseFloat(e.target.value); s1Draw(); s1Readout(); });
animate($('step1'), () => { s1Draw(); });
onLangRefresh(() => { s1Draw(); s1Readout(); });
onRefit(() => s1Draw());
s1Draw(); s1Readout();

/* ================================================================
   第 2 步 · 切片：σ0 那一刀 = |X(σ0+jω)|，σ0=0 即傅里叶
   ================================================================ */
const s2 = {
  a: 0.8, s0: 0, view: null,
  heat: document.createElement('canvas'), heatA: NaN
};
s2.heat.width = 150; s2.heat.height = 150;
function s2InRoc() { return s2.s0 > -s2.a; }
function s2DrawPlane() {
  const cv = $('s2-plane');
  const ctx = fitCanvas(cv);
  const w = cv._w, h = cv._h;
  if (w < 10) return;
  ctx.clearRect(0, 0, w, h);
  const v = planeView(w, h, -3, 3, -6, 6, 30, 14, 12, 20);
  s2.view = v;
  if (s2.heatA !== s2.a) { renderHeat(s2.heat, s2.a, -3, 3, -6, 6); s2.heatA = s2.a; }
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(s2.heat, v.ox, v.oy, v.pw, v.ph);
  /* ROC 半平面（σ > −a） */
  const bx = v.X(-s2.a);
  ctx.fillStyle = 'rgba(126,226,168,0.13)';
  ctx.fillRect(bx, v.oy, v.ox + v.pw - bx, v.ph);
  ctx.strokeStyle = 'rgba(126,226,168,0.7)'; ctx.lineWidth = 1.4; ctx.setLineDash([6, 5]);
  ctx.beginPath(); ctx.moveTo(bx, v.oy); ctx.lineTo(bx, v.oy + v.ph); ctx.stroke(); ctx.setLineDash([]);
  drawPlaneBase(ctx, v, { noFill: true });
  ctx.fillStyle = '#7ee2a8'; ctx.font = '12px system-ui, sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'top';
  ctx.fillText(t('cvRocIn'), v.ox + v.pw - 6, v.oy + 6);
  /* 极点 */
  drawPole(ctx, bx, v.Y(0), '#ffffff');
  /* 切片线 */
  const sx = v.X(s2.s0), inR = s2InRoc();
  ctx.strokeStyle = inR ? '#6ee7ff' : '#ff7a93'; ctx.lineWidth = 2.6;
  ctx.beginPath(); ctx.moveTo(sx, v.oy); ctx.lineTo(sx, v.oy + v.ph); ctx.stroke();
  ctx.fillStyle = inR ? '#6ee7ff' : '#ff7a93';
  ctx.font = '12.5px system-ui, sans-serif'; ctx.textAlign = sx > v.ox + v.pw - 80 ? 'right' : 'left'; ctx.textBaseline = 'top';
  ctx.fillText(t('cvSlice') + ' = ' + fmtS(s2.s0, 2), sx + (ctx.textAlign === 'right' ? -6 : 6), v.oy + 6);
}
function s2DrawSlice() {
  const cv = $('s2-slice');
  const ctx = fitCanvas(cv);
  const w = cv._w, h = cv._h;
  if (w < 10) return;
  ctx.clearRect(0, 0, w, h);
  const padL = 44, padR = 14, padT = 30, padB = 24;
  const pw = w - padL - padR, ph = h - padT - padB;
  const inR = s2InRoc();
  const peak = inR ? sliceMag(s2.a, s2.s0, 0) : 0;
  const yMax = inR ? clamp(peak * 1.25, 1.4, 9) : 2;
  const X = om => padL + (om + 6) / 12 * pw;
  const Y = m => padT + (yMax - m) / yMax * ph;
  ctx.fillStyle = '#11161f'; ctx.fillRect(padL, padT, pw, ph);
  ctx.fillStyle = '#9aa7b8'; ctx.font = '12.5px system-ui, sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(t('cvMag'), padL, 14);
  ctx.strokeStyle = 'rgba(120,140,165,0.13)'; ctx.lineWidth = 1;
  for (let g = 1; g <= 3; g++) {
    const yy = padT + ph * g / 4;
    ctx.beginPath(); ctx.moveTo(padL, yy); ctx.lineTo(padL + pw, yy); ctx.stroke();
    ctx.fillStyle = '#5f7089'; ctx.font = '10.5px system-ui, sans-serif'; ctx.textAlign = 'right';
    ctx.fillText(fmt(yMax * (4 - g) / 4, 1), padL - 5, yy);
  }
  ctx.fillStyle = '#5f7089'; ctx.font = '10.5px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  for (let om = -6; om <= 6; om += 2) ctx.fillText('ω=' + String(om).replace('-', '−'), X(om), padT + ph + 5);
  ctx.strokeStyle = 'rgba(200,215,235,0.35)';
  ctx.beginPath(); ctx.moveTo(X(0), padT); ctx.lineTo(X(0), padT + ph); ctx.stroke();
  if (inR) {
    const path = () => {
      ctx.beginPath();
      for (let i = 0; i <= 240; i++) {
        const om = -6 + i / 240 * 12;
        const m = sliceMag(s2.a, s2.s0, om);
        if (i === 0) ctx.moveTo(X(om), Y(m)); else ctx.lineTo(X(om), Y(m));
      }
    };
    ctx.strokeStyle = '#6ee7ff'; ctx.lineWidth = 2.4; path(); ctx.stroke();
    if (s2.s0 === 0 && s2.a > 0) {
      /* 与傅里叶闭式逐点同值：以白色虚线同路重描，肉眼验证重合 */
      ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 1.3; ctx.setLineDash([5, 5]);
      path(); ctx.stroke(); ctx.setLineDash([]);
    }
    /* 峰值超出纵轴上限（yMax 钳在 9）时曲线顶部被画框截平——必须明示，读数 peak 仍为真值 */
    if (peak > yMax) drawClipNote(ctx, padL + pw - 8, padT + 8, t('cvClip2', { peak: fmt(peak, 2) }));
  } else {
    ctx.fillStyle = '#ff7a93'; ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const msg = t('cvOut');
    const words = msg.split(' ');
    let lines = [], line = '';
    for (const wd of words) {
      if (ctx.measureText(line + ' ' + wd).width > pw - 30 && line) { lines.push(line); line = wd; }
      else line = line ? line + ' ' + wd : wd;
    }
    if (line) lines.push(line);
    if (getLang() === 'zh') lines = [msg]; /* 中文整句不拆 */
    lines.forEach((ln, i) => ctx.fillText(ln, padL + pw / 2, padT + ph / 2 + (i - (lines.length - 1) / 2) * 24));
  }
  ctx.strokeStyle = '#2b3547'; ctx.strokeRect(padL, padT, pw, ph);
}
function s2Draw() { s2DrawPlane(); s2DrawSlice(); }
function s2Readout() {
  $('s2-a-val').textContent = fmt(s2.a, 2);
  $('s2-s0-val').textContent = fmtS(s2.s0, 2);
  if (s2InRoc()) {
    $('s2-readout').innerHTML = t('s2roIn', {
      a: fmt(s2.a, 2), s0: fmtS(s2.s0, 2), bd: fmtS(-s2.a, 2),
      peak: fmt(sliceMag(s2.a, s2.s0, 0), 3),
      fNote: (s2.s0 === 0 && s2.a > 0) ? t('s2fNote') : ''
    });
  } else {
    $('s2-readout').innerHTML = t('s2roOut', { a: fmt(s2.a, 2), s0: fmtS(s2.s0, 2), bd: fmtS(-s2.a, 2) });
  }
}
function s2SetS0(v) {
  s2.s0 = clamp(Math.round(v / 0.05) * 0.05, -2.5, 2.5);
  $('s2-s0').value = String(s2.s0);
  s2Draw(); s2Readout();
}
attachDrag($('s2-plane'),
  p => { if (s2.view) { s2SetS0(s2.view.invX(p.x)); return true; } return false; },
  p => { if (s2.view) s2SetS0(s2.view.invX(p.x)); });
$('s2-plane').classList.add('drag');
$('s2-a').addEventListener('input', e => { s2.a = parseFloat(e.target.value); s2Draw(); s2Readout(); });
$('s2-s0').addEventListener('input', e => { s2.s0 = parseFloat(e.target.value); s2Draw(); s2Readout(); });
$('s2-to0').addEventListener('click', () => s2SetS0(0));
animate($('step2'), () => { s2Draw(); });
onLangRefresh(() => { s2Draw(); s2Readout(); });
onRefit(() => s2Draw());
s2Draw(); s2Readout();

/* ================================================================
   第 3 步 · 同式异 ROC：A 右边信号 σ>−a / B 左边信号 σ<−a
   ================================================================ */
const s3 = { a: 1, side: 'A', probe: { sig: 0, om: 1 }, view: null };
function s3DrawPlane() {
  const cv = $('s3-plane');
  const ctx = fitCanvas(cv);
  const w = cv._w, h = cv._h;
  if (w < 10) return;
  ctx.clearRect(0, 0, w, h);
  const v = planeView(w, h, -3, 3, -4, 4, 30, 14, 12, 20);
  s3.view = v;
  ctx.fillStyle = '#11161f'; ctx.fillRect(v.ox, v.oy, v.pw, v.ph);
  /* ROC 阴影（按当前信号翻面） */
  const bx = v.X(-s3.a);
  ctx.fillStyle = 'rgba(126,226,168,0.14)';
  if (s3.side === 'A') ctx.fillRect(bx, v.oy, v.ox + v.pw - bx, v.ph);
  else ctx.fillRect(v.ox, v.oy, bx - v.ox, v.ph);
  ctx.strokeStyle = 'rgba(126,226,168,0.7)'; ctx.lineWidth = 1.4; ctx.setLineDash([6, 5]);
  ctx.beginPath(); ctx.moveTo(bx, v.oy); ctx.lineTo(bx, v.oy + v.ph); ctx.stroke(); ctx.setLineDash([]);
  drawPlaneBase(ctx, v, { noFill: true });
  ctx.fillStyle = '#7ee2a8'; ctx.font = '12px system-ui, sans-serif'; ctx.textBaseline = 'top';
  ctx.textAlign = s3.side === 'A' ? 'right' : 'left';
  ctx.fillText(t('cvRoc') + (s3.side === 'A' ? ' σ > ' : ' σ < ') + fmtS(-s3.a, 2),
    s3.side === 'A' ? v.ox + v.pw - 6 : v.ox + 6, v.oy + 6);
  drawPole(ctx, bx, v.Y(0), '#ffffff');
  /* 探针 */
  const qx = v.X(s3.probe.sig), qy = v.Y(s3.probe.om);
  ctx.strokeStyle = 'rgba(255,180,84,0.55)'; ctx.setLineDash([4, 4]); ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(v.ox, qy); ctx.lineTo(v.ox + v.pw, qy);
  ctx.moveTo(qx, v.oy); ctx.lineTo(qx, v.oy + v.ph);
  ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = '#ffb454';
  ctx.beginPath(); ctx.arc(qx, qy, 5, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#0d1117'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.arc(qx, qy, 5, 0, TAU); ctx.stroke();
  ctx.fillStyle = '#ffb454'; ctx.font = '12.5px system-ui, sans-serif';
  ctx.textAlign = qx > v.ox + v.pw - 90 ? 'right' : 'left'; ctx.textBaseline = 'bottom';
  ctx.fillText(t('cvProbe'), qx + (ctx.textAlign === 'right' ? -9 : 9), qy - 5);
}
function s3DrawTime() {
  const cv = $('s3-time');
  const ctx = fitCanvas(cv);
  const w = cv._w, h = cv._h;
  if (w < 10) return;
  ctx.clearRect(0, 0, w, h);
  const padL = 16, padR = 16, padT = 30, padB = 24;
  const pw = w - padL - padR, ph = h - padT - padB;
  const val = tt => {
    if (s3.side === 'A') return tt >= 0 ? Math.exp(-s3.a * tt) : 0;
    return tt <= 0 ? -Math.exp(-s3.a * tt) : 0;
  };
  let mx = 1;
  for (let i = 0; i <= 320; i++) mx = Math.max(mx, Math.abs(val(-4 + i / 320 * 8)));
  const yM = clamp(mx * 1.15, 1.2, 8);
  const X = tt => padL + (tt + 4) / 8 * pw;
  const Y = vv => padT + (yM - clamp(vv, -yM, yM)) / (2 * yM) * ph;
  ctx.fillStyle = '#9aa7b8'; ctx.font = '12.5px system-ui, sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(s3.side === 'A' ? t('cvTimeA') : t('cvTimeB'), padL, 14);
  ctx.fillStyle = '#11161f'; ctx.fillRect(padL, padT, pw, ph);
  ctx.strokeStyle = 'rgba(120,140,165,0.13)';
  for (let tt = -3; tt <= 3; tt++) { if (tt) { ctx.beginPath(); ctx.moveTo(X(tt), padT); ctx.lineTo(X(tt), padT + ph); ctx.stroke(); } }
  ctx.strokeStyle = 'rgba(200,215,235,0.4)';
  ctx.beginPath(); ctx.moveTo(padL, Y(0)); ctx.lineTo(padL + pw, Y(0)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(X(0), padT); ctx.lineTo(X(0), padT + ph); ctx.stroke();
  ctx.fillStyle = '#5f7089'; ctx.font = '10.5px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  for (let tt = -4; tt <= 4; tt += 2) ctx.fillText('t=' + String(tt).replace('-', '−'), X(tt), padT + ph + 5);
  ctx.strokeStyle = '#6ee7ff'; ctx.lineWidth = 2.4;
  ctx.beginPath();
  for (let i = 0; i <= 320; i++) {
    const tt = -4 + i / 320 * 8, vv = val(tt);
    if (i === 0) ctx.moveTo(X(tt), Y(vv)); else ctx.lineTo(X(tt), Y(vv));
  }
  ctx.stroke();
  ctx.strokeStyle = '#2b3547'; ctx.strokeRect(padL, padT, pw, ph);
}
function s3Draw() { s3DrawPlane(); s3DrawTime(); }
function s3Readout() {
  $('s3-a-val').textContent = fmt(s3.a, 2);
  const sig = s3.probe.sig;
  const va = inROC1(s3.a, sig, 'R') ? t('s3conv') : t('s3div');
  const vb = inROC1(s3.a, sig, 'L') ? t('s3conv') : t('s3div');
  $('s3-readout').innerHTML = t('s3ro', {
    cur: s3.side === 'A' ? t('s3curA') : t('s3curB'),
    sig: fmtS(sig, 2), om: fmt(s3.probe.om, 2),
    bd: fmtS(-s3.a, 2), va, vb
  });
  $('s3-A').classList.toggle('active', s3.side === 'A');
  $('s3-B').classList.toggle('active', s3.side === 'B');
}
attachDrag($('s3-plane'),
  p => { if (s3.view) { s3.probe.sig = clamp(s3.view.invX(p.x), -3, 3); s3.probe.om = clamp(s3.view.invY(p.y), -4, 4); s3Draw(); s3Readout(); return true; } return false; },
  p => { if (s3.view) { s3.probe.sig = clamp(s3.view.invX(p.x), -3, 3); s3.probe.om = clamp(s3.view.invY(p.y), -4, 4); s3Draw(); s3Readout(); } });
$('s3-plane').classList.add('drag');
$('s3-A').addEventListener('click', () => { s3.side = 'A'; s3Draw(); s3Readout(); });
$('s3-B').addEventListener('click', () => { s3.side = 'B'; s3Draw(); s3Readout(); });
$('s3-a').addEventListener('input', e => { s3.a = parseFloat(e.target.value); s3Draw(); s3Readout(); });
animate($('step3'), () => { s3Draw(); });
onLangRefresh(() => { s3Draw(); s3Readout(); });
onRefit(() => s3Draw());
s3Draw(); s3Readout();

/* ================================================================
   第 4 步 · 拖极点：二阶系统性格（全闭式）
   ================================================================ */
const PRESETS4 = [
  { mode: 'osc', pr: -0.8, wd: 2.4 },
  { mode: 'real', pA: -1.2, pB: -1.2 },
  { mode: 'real', pA: -2.4, pB: -0.6 },
  { mode: 'osc', pr: 0, wd: 2.2 },
  { mode: 'osc', pr: 0.55, wd: 2.0 }
];
const s4 = { mode: 'osc', pr: -0.8, wd: 2.4, pA: -1.2, pB: -1.2, te: 1, drag: null, view: null, preset: 0 };
function s4State() {
  return s4.mode === 'osc' ? { mode: 'osc', pr: s4.pr, wd: s4.wd } : { mode: 'real', p1: s4.pA, p2: s4.pB };
}
function s4DrawPlane() {
  const cv = $('s4-plane');
  const ctx = fitCanvas(cv);
  const w = cv._w, h = cv._h;
  if (w < 10) return;
  ctx.clearRect(0, 0, w, h);
  const v = planeView(w, h, -3.2, 3.2, -3.4, 3.4, 30, 14, 12, 20);
  s4.view = v;
  ctx.fillStyle = '#11161f'; ctx.fillRect(v.ox, v.oy, v.pw, v.ph);
  /* 左半平面（稳定的家）淡染 */
  ctx.fillStyle = 'rgba(126,226,168,0.06)';
  ctx.fillRect(v.ox, v.oy, v.X(0) - v.ox, v.ph);
  drawPlaneBase(ctx, v, { noFill: true });
  const dot = (sx, sy, main) => {
    ctx.fillStyle = main ? '#6ee7ff' : 'rgba(110,231,255,0.45)';
    ctx.beginPath(); ctx.arc(v.X(sx), v.Y(sy), main ? 7 : 6, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#0d1117'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(v.X(sx), v.Y(sy), main ? 7 : 6, 0, TAU); ctx.stroke();
    if (main) {
      ctx.strokeStyle = 'rgba(110,231,255,0.8)'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(v.X(sx), v.Y(sy), 11, 0, TAU); ctx.stroke();
    }
  };
  if (s4.mode === 'osc') {
    dot(s4.pr, -s4.wd, false);
    dot(s4.pr, s4.wd, true);
    ctx.strokeStyle = 'rgba(110,231,255,0.4)'; ctx.setLineDash([3, 4]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(v.X(s4.pr), v.Y(-s4.wd)); ctx.lineTo(v.X(s4.pr), v.Y(s4.wd)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#6ee7ff'; ctx.font = '12px system-ui, sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
    ctx.fillText(t('cvDrag'), v.X(s4.pr) + 13, v.Y(s4.wd) - 4);
  } else {
    const same = Math.abs(s4.pA - s4.pB) < 1e-9;
    dot(s4.pA, 0, true);
    if (!same) dot(s4.pB, 0, true);
    else {
      ctx.strokeStyle = 'rgba(110,231,255,0.8)'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(v.X(s4.pA), v.Y(0), 15, 0, TAU); ctx.stroke();
    }
    ctx.fillStyle = '#6ee7ff'; ctx.font = '12px system-ui, sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
    ctx.fillText(t('cvDrag'), v.X(Math.max(s4.pA, s4.pB)) + 13, v.Y(0) - 8);
  }
}
function s4DrawWave() {
  const cv = $('s4-wave');
  const ctx = fitCanvas(cv);
  const w = cv._w, h = cv._h;
  if (w < 10) return;
  ctx.clearRect(0, 0, w, h);
  const padL = 16, padR = 16, padT = 30, padB = 24;
  const pw = w - padL - padR, ph = h - padT - padB;
  const T = 6, YM = 1.7;
  const X = tt => padL + tt / T * pw;
  const Y = vv => padT + (YM - clamp(vv, -YM, YM)) / (2 * YM) * ph;
  const st = s4State();
  drawLegend(ctx, [[t('cvImp'), '#6ee7ff'], [t('cvEnv'), '#ffb454']], padL, 14);
  ctx.fillStyle = '#11161f'; ctx.fillRect(padL, padT, pw, ph);
  ctx.strokeStyle = 'rgba(120,140,165,0.13)'; ctx.lineWidth = 1;
  for (let tt = 1; tt < T; tt++) { ctx.beginPath(); ctx.moveTo(X(tt), padT); ctx.lineTo(X(tt), padT + ph); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(200,215,235,0.4)';
  ctx.beginPath(); ctx.moveTo(padL, Y(0)); ctx.lineTo(padL + pw, Y(0)); ctx.stroke();
  ctx.fillStyle = '#5f7089'; ctx.font = '10.5px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  for (let tt = 0; tt <= T; tt++) ctx.fillText('t=' + tt, X(tt), padT + ph + 5);
  /* 包络 ±E(t) */
  ctx.strokeStyle = '#ffb454'; ctx.lineWidth = 1.4; ctx.setLineDash([6, 5]);
  for (const sgn of [1, -1]) {
    ctx.beginPath();
    for (let i = 0; i <= 240; i++) {
      const tt = i / 240 * T, vv = sgn * envelope4(st, tt);
      if (i === 0) ctx.moveTo(X(tt), Y(vv)); else ctx.lineTo(X(tt), Y(vv));
    }
    ctx.stroke();
  }
  ctx.setLineDash([]);
  /* h(t) 闭式 */
  ctx.strokeStyle = '#6ee7ff'; ctx.lineWidth = 2.4;
  ctx.beginPath();
  for (let i = 0; i <= 360; i++) {
    const tt = i / 360 * T, vv = impulse4(st, tt);
    if (i === 0) ctx.moveTo(X(tt), Y(vv)); else ctx.lineTo(X(tt), Y(vv));
  }
  ctx.stroke();
  /* 包络探针 */
  const te = s4.te, env = envelope4(st, te);
  ctx.strokeStyle = 'rgba(255,180,84,0.5)'; ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
  ctx.beginPath(); ctx.moveTo(X(te), padT); ctx.lineTo(X(te), padT + ph); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = '#ffb454';
  ctx.beginPath(); ctx.arc(X(te), Y(env), 4, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(X(te), Y(-env), 4, 0, TAU); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(X(te), Y(impulse4(st, te)), 3.4, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#2b3547'; ctx.strokeRect(padL, padT, pw, ph);
}
function s4Draw() { s4DrawPlane(); s4DrawWave(); }
function s4Readout() {
  $('s4-te-val').textContent = fmt(s4.te, 1);
  const st = s4State();
  const prm = params4(st);
  let poles;
  if (st.mode === 'osc') poles = fmtS(st.pr, 2) + ' ± j' + fmt(st.wd, 2);
  else {
    const p1 = Math.min(st.p1, st.p2), p2 = Math.max(st.p1, st.p2);
    poles = Math.abs(p1 - p2) < 1e-9
      ? 'p₁ = p₂ = ' + fmtS(p1, 2)
      : 'p₁ = ' + fmtS(p1, 2) + ', p₂ = ' + fmtS(p2, 2);
  }
  const vd = verdict4(st);
  const env = envelope4(st, s4.te);
  $('s4-readout').innerHTML = t('s4ro', {
    poles,
    zeta: fmt(prm.zeta, 3), w0: fmt(prm.w0, 3),
    verdict: t(vd === 'stable' ? 's4vStable' : vd === 'marginal' ? 's4vMarginal' : 's4vUnstable'),
    te: fmt(s4.te, 1),
    env: isFinite(env) ? (env > 9999 ? env.toExponential(2) : fmt(env, 3)) : '∞'
  });
}
function s4ClearPreset() {
  s4.preset = -1;
  document.querySelectorAll('#s4-presets .btn').forEach(b => b.classList.remove('active'));
}
function s4SetFromDrag(sig, om) {
  if (s4.drag === 'osc') {
    const pr = clamp(sig, -3.1, 3.1);
    if (Math.abs(om) < 0.16) { s4.mode = 'real'; s4.pA = pr; s4.pB = pr; s4.drag = 'realBoth'; }
    else { s4.pr = pr; s4.wd = clamp(Math.abs(om), 0.16, 3.35); }
  } else if (s4.drag === 'realBoth') {
    if (Math.abs(om) > 0.35) { s4.mode = 'osc'; s4.pr = clamp(sig, -3.1, 3.1); s4.wd = clamp(Math.abs(om), 0.16, 3.35); s4.drag = 'osc'; }
    else { s4.pA = clamp(sig, -3.15, 3.15); s4.pB = s4.pA; }
  } else if (s4.drag === 'realA' || s4.drag === 'realB') {
    if (Math.abs(om) > 0.35) { s4.mode = 'osc'; s4.pr = clamp(sig, -3.1, 3.1); s4.wd = clamp(Math.abs(om), 0.16, 3.35); s4.drag = 'osc'; }
    else if (s4.drag === 'realA') s4.pA = clamp(sig, -3.15, 3.15);
    else s4.pB = clamp(sig, -3.15, 3.15);
  }
  s4ClearPreset();
  s4Draw(); s4Readout();
}
attachDrag($('s4-plane'),
  p => {
    if (!s4.view) return false;
    const v = s4.view;
    let best = null, bd = 30;
    const cand = s4.mode === 'osc'
      ? [['osc', s4.pr, s4.wd], ['osc', s4.pr, -s4.wd]]
      : [['realA', s4.pA, 0], ['realB', s4.pB, 0]];
    for (const [kind, sx, sy] of cand) {
      const d = Math.hypot(v.X(sx) - p.x, v.Y(sy) - p.y);
      if (d < bd) { bd = d; best = kind; }
    }
    if (!best) return false;
    s4.drag = (s4.mode === 'real' && Math.abs(s4.pA - s4.pB) < 1e-9) ? 'realBoth' : best;
    s4SetFromDrag(v.invX(p.x), v.invY(p.y));
    return true;
  },
  p => { if (s4.view && s4.drag) s4SetFromDrag(s4.view.invX(p.x), s4.view.invY(p.y)); });
$('s4-plane').classList.add('drag');
$('s4-plane').addEventListener('keydown', e => {
  const big = e.shiftKey ? 0.2 : 0.05;
  let used = true;
  if (s4.mode === 'osc') {
    if (e.key === 'ArrowLeft') s4.pr = clamp(s4.pr - big, -3.1, 3.1);
    else if (e.key === 'ArrowRight') s4.pr = clamp(s4.pr + big, -3.1, 3.1);
    else if (e.key === 'ArrowUp') s4.wd = clamp(s4.wd + big, 0.16, 3.35);
    else if (e.key === 'ArrowDown') {
      s4.wd -= big;
      if (s4.wd < 0.16) { s4.mode = 'real'; s4.pA = s4.pr; s4.pB = s4.pr; }
    } else used = false;
  } else {
    if (e.key === 'ArrowLeft') { s4.pA = clamp(s4.pA - big, -3.15, 3.15); s4.pB = clamp(s4.pB - big, -3.15, 3.15); }
    else if (e.key === 'ArrowRight') { s4.pA = clamp(s4.pA + big, -3.15, 3.15); s4.pB = clamp(s4.pB + big, -3.15, 3.15); }
    else if (e.key === 'ArrowUp') { s4.mode = 'osc'; s4.pr = (s4.pA + s4.pB) / 2; s4.wd = 0.6; }
    else used = false;
  }
  if (used) { s4ClearPreset(); s4Draw(); s4Readout(); e.preventDefault(); }
});
document.querySelectorAll('#s4-presets .btn').forEach(b => {
  b.addEventListener('click', () => {
    const i = parseInt(b.dataset.preset, 10);
    const P = PRESETS4[i];
    s4.mode = P.mode; s4.preset = i;
    if (P.mode === 'osc') { s4.pr = P.pr; s4.wd = P.wd; } else { s4.pA = P.pA; s4.pB = P.pB; }
    document.querySelectorAll('#s4-presets .btn').forEach(x => x.classList.toggle('active', x === b));
    s4Draw(); s4Readout();
  });
});
$('s4-te').addEventListener('input', e => { s4.te = parseFloat(e.target.value); s4Draw(); s4Readout(); });
animate($('step4'), () => { s4Draw(); });
onLangRefresh(() => { s4Draw(); s4Readout(); });
onRefit(() => s4Draw());
s4Draw(); s4Readout();

/* ================================================================
   第 5 步 · 判读台：H(s) + ROC → 形态 / 因果 / 稳定（解析判据）
   ================================================================ */
const s5 = { sys: 'H1', roc: 0, judge: null, quiz: null };
function fmtSI(v) { return isFinite(v) ? fmtS(v, Number.isInteger(v) ? 0 : 2) : (v > 0 ? '+∞' : '−∞'); }
function s5RocRange() {
  const [lo, hi] = rocBounds5(s5.sys, s5.roc);
  if (s5.roc === 0) return 'σ > ' + fmtSI(lo);
  if (s5.roc === 1) return fmtSI(lo) + ' < σ < ' + fmtSI(hi);
  return 'σ < ' + fmtSI(hi);
}
function s5DrawPlane() {
  const cv = $('s5-plane');
  const ctx = fitCanvas(cv);
  const w = cv._w, h = cv._h;
  if (w < 10) return;
  ctx.clearRect(0, 0, w, h);
  const v = planeView(w, h, -3, 3, -2.6, 2.6, 30, 14, 12, 20);
  ctx.fillStyle = '#11161f'; ctx.fillRect(v.ox, v.oy, v.pw, v.ph);
  const [lo, hi] = rocBounds5(s5.sys, s5.roc);
  const x0 = v.X(Math.max(lo, -3)), x1 = v.X(Math.min(hi, 3));
  ctx.fillStyle = 'rgba(110,231,255,0.12)';
  ctx.fillRect(x0, v.oy, x1 - x0, v.ph);
  ctx.strokeStyle = 'rgba(110,231,255,0.65)'; ctx.lineWidth = 1.3; ctx.setLineDash([6, 5]);
  if (isFinite(lo)) { ctx.beginPath(); ctx.moveTo(v.X(lo), v.oy); ctx.lineTo(v.X(lo), v.oy + v.ph); ctx.stroke(); }
  if (isFinite(hi)) { ctx.beginPath(); ctx.moveTo(v.X(hi), v.oy); ctx.lineTo(v.X(hi), v.oy + v.ph); ctx.stroke(); }
  ctx.setLineDash([]);
  drawPlaneBase(ctx, v, { noFill: true });
  ctx.fillStyle = '#6ee7ff'; ctx.font = 'bold 13px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.fillText('ROC', (x0 + x1) / 2, v.oy + 6);
  for (const p of SYS5[s5.sys].poles) {
    drawPole(ctx, v.X(p), v.Y(0), '#ff7a93');
    ctx.fillStyle = '#ff7a93'; ctx.font = '12px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('s = ' + fmtS(p, 0), v.X(p), v.Y(0) + 10);
  }
}
function s5DrawWave() {
  const cv = $('s5-wave');
  const ctx = fitCanvas(cv);
  const w = cv._w, h = cv._h;
  if (w < 10) return;
  ctx.clearRect(0, 0, w, h);
  const padL = 16, padR = 16, padT = 30, padB = 24;
  const pw = w - padL - padR, ph = h - padT - padB;
  const YM = 2.5;
  const X = tt => padL + (tt + 4) / 8 * pw;
  const Y = vv => padT + (YM - clamp(vv, -YM, YM)) / (2 * YM) * ph;
  ctx.fillStyle = '#9aa7b8'; ctx.font = '12.5px system-ui, sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(t('cvHt') + '  ·  H(s) = 1/(s − p₁)(s − p₂) ' + (s5.sys === 'H1' ? '[p = −1, −2]' : '[p = +1, −2]'), padL, 14);
  ctx.fillStyle = '#11161f'; ctx.fillRect(padL, padT, pw, ph);
  ctx.strokeStyle = 'rgba(120,140,165,0.13)'; ctx.lineWidth = 1;
  for (let tt = -3; tt <= 3; tt++) { if (tt) { ctx.beginPath(); ctx.moveTo(X(tt), padT); ctx.lineTo(X(tt), padT + ph); ctx.stroke(); } }
  ctx.strokeStyle = 'rgba(200,215,235,0.4)';
  ctx.beginPath(); ctx.moveTo(padL, Y(0)); ctx.lineTo(padL + pw, Y(0)); ctx.stroke();
  ctx.strokeStyle = 'rgba(110,231,255,0.5)';
  ctx.beginPath(); ctx.moveTo(X(0), padT); ctx.lineTo(X(0), padT + ph); ctx.stroke();
  ctx.fillStyle = '#5f7089'; ctx.font = '10.5px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  for (let tt = -4; tt <= 4; tt += 2) ctx.fillText('t=' + String(tt).replace('-', '−'), X(tt), padT + ph + 5);
  ctx.strokeStyle = '#6ee7ff'; ctx.lineWidth = 2.4;
  ctx.beginPath();
  let maxAbs = 0; /* 全程最大 |h(t)|：超过画框 YM 即说明曲线被截断显示，必须标注（见循环后） */
  for (let i = 0; i <= 400; i++) {
    const tt = -4 + i / 400 * 8, vv = impulse5(s5.sys, s5.roc, tt);
    if (Math.abs(vv) > maxAbs) maxAbs = Math.abs(vv);
    if (i === 0) ctx.moveTo(X(tt), Y(vv)); else ctx.lineTo(X(tt), Y(vv));
  }
  ctx.stroke();
  ctx.strokeStyle = '#2b3547'; ctx.strokeRect(padL, padT, pw, ph);
  /* 冲框标注：任一组合只要真值超出 ±YM 就明示截断（H₂ 因果、H₁ 中间/左侧带等都会冲框） */
  if (maxAbs > YM) drawClipNote(ctx, padL + pw - 8, padT + 8, t('cvClip5'));
}
function s5Draw() { s5DrawPlane(); s5DrawWave(); }
function s5VerdictHTML(prefix) {
  const j = s5.judge;
  const form = j.form === 'right' ? t('s5formR') : j.form === 'left' ? t('s5formL') : t('s5formT');
  return (prefix || '') + t('s5ro', {
    roc: s5RocRange(), form,
    causal: j.causal ? t('s5yes') : t('s5no'),
    stable: j.stable ? t('s5yes') : t('s5no')
  });
}
function s5WhyText() {
  const j = s5.judge;
  const sep = getLang() === 'zh' ? '；' : '; ';
  return t('s5why', {
    why: (j.causal ? t('s5whyCausal') : t('s5whyNotCausal')) + sep +
         (j.stable ? t('s5whyStable') : t('s5whyNotStable'))
  });
}
function s5Refresh() {
  s5.judge = judge5(s5.sys, s5.roc);
  $('s5-sys1').classList.toggle('active', s5.sys === 'H1');
  $('s5-sys2').classList.toggle('active', s5.sys === 'H2');
  document.querySelectorAll('[data-roc]').forEach(b => b.classList.toggle('active', parseInt(b.dataset.roc, 10) === s5.roc));
  s5Draw();
  if (s5.quiz && !s5.quiz.answered) {
    $('s5-readout').innerHTML = '';
    $('s5-why').textContent = '';
  } else {
    $('s5-readout').innerHTML = s5VerdictHTML(s5.quiz && s5.quiz.answered ? t(s5.quiz.feedbackKey || 's5qRight') : '');
    $('s5-why').textContent = s5WhyText();
  }
}
$('s5-sys1').addEventListener('click', () => { s5.sys = 'H1'; s5.quiz = null; s5HideQuiz(); s5Refresh(); });
$('s5-sys2').addEventListener('click', () => { s5.sys = 'H2'; s5.quiz = null; s5HideQuiz(); s5Refresh(); });
document.querySelectorAll('[data-roc]').forEach(b => {
  b.addEventListener('click', () => { s5.roc = parseInt(b.dataset.roc, 10); s5.quiz = null; s5HideQuiz(); s5Refresh(); });
});
function s5HideQuiz() {
  $('s5-quizq').style.display = 'none';
  $('s5-answers').style.display = 'none';
}
$('s5-quiz').addEventListener('click', () => {
  const sys = Math.random() < 0.5 ? 'H1' : 'H2';
  const roc = Math.floor(Math.random() * 3);
  s5.sys = sys; s5.roc = roc;
  s5.quiz = { answered: false, feedbackKey: '' };
  $('s5-quizq').innerHTML = t('s5quizQ', {
    sys: t(sys === 'H1' ? 's5sys1' : 's5sys2'),
    roc: t(roc === 0 ? 's5rocRs' : roc === 1 ? 's5rocMs' : 's5rocLs')
  });
  $('s5-quizq').style.display = '';
  $('s5-answers').style.display = '';
  s5Refresh();
});
function s5Answer(saidStable) {
  if (!s5.quiz || s5.quiz.answered) return;
  const correct = saidStable === judge5(s5.sys, s5.roc).stable;
  s5.quiz.answered = true;
  s5.quiz.feedbackKey = correct ? 's5qRight' : 's5qWrong';
  $('s5-answers').style.display = 'none';
  s5Refresh();
}
$('s5-qa-y').addEventListener('click', () => s5Answer(true));
$('s5-qa-n').addEventListener('click', () => s5Answer(false));
animate($('step5'), () => { s5Draw(); });
onLangRefresh(() => { if (s5.quiz) { $('s5-quizq').innerHTML = t('s5quizQ', { sys: t(s5.sys === 'H1' ? 's5sys1' : 's5sys2'), roc: t(s5.roc === 0 ? 's5rocRs' : s5.roc === 1 ? 's5rocMs' : 's5rocLs') }); } s5Refresh(); });
onRefit(() => s5Draw());
s5Refresh();

/* ================================================================
   第 6 步 · 终章全家福：s 平面 + 卷起来的 z 平面（预告）
   ================================================================ */
const s6 = { time: 0 };
function s6Draw() {
  const cv = $('s6-canvas');
  const ctx = fitCanvas(cv);
  const w = cv._w, h = cv._h;
  if (w < 10) return;
  ctx.clearRect(0, 0, w, h);
  const om = 2.8 * Math.sin(s6.time * 0.55);      /* 扫点在 s 平面的 ω */
  const SIG0 = -0.5, T = 0.5;                      /* z = e^{sT}，T = 0.5 */
  const zr = Math.exp(SIG0 * T);                   /* |z| = e^{−0.25} ≈ 0.779 < 1 */
  const za = om * T;
  const narrow = w < 560;
  let px, py, pw, ph, cx, cy, R;
  if (!narrow) {
    px = 14; py = 12; pw = Math.round(w * 0.56); ph = h - 24;
    cx = px + pw + (w - 14 - (px + pw)) / 2 + 8; cy = h / 2 + 6;
    R = Math.min((w - 14 - (px + pw)) / 2 - 6, h / 2 - 56);
  } else {
    px = 14; py = 10; pw = w - 28; ph = 218;
    cx = w / 2; cy = 330; R = 76;
  }
  /* ---- 左：s 平面示意 ---- */
  const X = s => px + (s + 3.4) / 5 * pw;
  const Y = o => py + (3.2 - o) / 6.4 * ph;
  ctx.fillStyle = '#11161f'; ctx.fillRect(px, py, pw, ph);
  ctx.fillStyle = 'rgba(126,226,168,0.07)';
  ctx.fillRect(px, py, X(0) - px, ph);
  ctx.strokeStyle = 'rgba(120,140,165,0.15)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(px, Y(0)); ctx.lineTo(px + pw, Y(0)); ctx.stroke();
  ctx.strokeStyle = 'rgba(110,231,255,0.8)'; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(X(0), py); ctx.lineTo(X(0), py + ph); ctx.stroke();
  ctx.strokeStyle = '#2b3547'; ctx.strokeRect(px, py, pw, ph);
  /* 几个静止极点（示意） */
  for (const [sx, sy] of [[-1.8, 1.4], [-1.8, -1.4], [-0.9, 0]]) drawPole(ctx, X(sx), Y(sy), 'rgba(255,122,147,0.75)');
  /* σ = −0.5 扫线与扫点 */
  ctx.strokeStyle = 'rgba(255,180,84,0.35)'; ctx.setLineDash([4, 4]); ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(X(SIG0), py); ctx.lineTo(X(SIG0), py + ph); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = '#ffb454';
  ctx.beginPath(); ctx.arc(X(SIG0), Y(om), 5.5, 0, TAU); ctx.fill();
  ctx.font = 'bold 12px system-ui, sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
  ctx.fillText('s', X(SIG0) + 8, Y(om) - 4);
  ctx.font = '11.5px system-ui, sans-serif'; ctx.fillStyle = '#9aa7b8';
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillText('jω', X(0) + 5, py + 4);
  ctx.fillStyle = 'rgba(110,231,255,0.9)';
  const axLab = t('cvAxis');
  ctx.fillText(axLab, Math.min(X(0) + 5, px + pw - ctx.measureText(axLab).width - 4), py + ph - 18);
  ctx.fillStyle = 'rgba(126,226,168,0.9)';
  const lhLab = t('cvLHP');
  ctx.fillText(lhLab, Math.max(px + 6, X(0) - 6 - ctx.measureText(lhLab).width), py + 6);
  /* ---- 卷起来的箭头 ---- */
  if (!narrow) {
    ctx.strokeStyle = 'rgba(154,167,184,0.8)'; ctx.lineWidth = 2.2;
    const ax0 = px + pw + 6, ax1 = cx - R - 16, ay = cy - R * 0.55;
    ctx.beginPath(); ctx.moveTo(ax0, ay + 26); ctx.quadraticCurveTo((ax0 + ax1) / 2, ay - 26, ax1, ay + 20); ctx.stroke();
    ctx.fillStyle = 'rgba(154,167,184,0.95)';
    ctx.beginPath(); ctx.moveTo(ax1 + 9, ay + 21); ctx.lineTo(ax1 - 3, ay + 12); ctx.lineTo(ax1 - 1, ay + 29); ctx.closePath(); ctx.fill();
  }
  /* ---- 右：z 平面（单位圆） ---- */
  ctx.fillStyle = '#9aa7b8'; ctx.font = '12.5px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
  ctx.fillText(t('cvZ'), cx, cy - R - 8);
  ctx.strokeStyle = 'rgba(120,140,165,0.25)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cx - R - 12, cy); ctx.lineTo(cx + R + 12, cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, cy - R - 12); ctx.lineTo(cx, cy + R + 12); ctx.stroke();
  ctx.fillStyle = 'rgba(110,231,255,0.07)';
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#6ee7ff'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
  /* 像的轨迹：半径 e^{−0.25} 的圆弧（虚线）+ 当前像点 */
  ctx.strokeStyle = 'rgba(255,180,84,0.45)'; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(cx, cy, zr * R, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
  const zx = cx + zr * R * Math.cos(za), zy = cy - zr * R * Math.sin(za);
  ctx.fillStyle = '#ffb454';
  ctx.beginPath(); ctx.arc(zx, zy, 5.5, 0, TAU); ctx.fill();
  ctx.font = 'bold 12px system-ui, sans-serif'; ctx.textBaseline = 'bottom';
  const zLab = 'z = e^{sT}, T = 0.5';
  if (zx + 8 + ctx.measureText(zLab).width > w - 16) { /* 点扫到右端时标签翻到左侧，防出画布 */
    ctx.textAlign = 'right'; ctx.fillText(zLab, zx - 8, zy - 4);
  } else {
    ctx.textAlign = 'left'; ctx.fillText(zLab, zx + 8, zy - 4);
  }
  ctx.fillStyle = '#9aa7b8'; ctx.font = '11.5px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.fillText(t('cvUnit'), cx, cy + R + 6);
  /* 半径自验标注：像点所在虚线圆的半径 |z| = e^{σT}（σ = −0.5、T = 0.5 → e^{−0.25}） */
  ctx.fillStyle = 'rgba(255,180,84,0.85)'; ctx.font = '11px system-ui, sans-serif';
  ctx.fillText('|z| = e^{σT} = e^{−0.25} ≈ 0.78', cx, cy + zr * R + 5);
}
animate($('step6'), dt => { s6.time += dt; s6Draw(); });
onLangRefresh(() => { s6Draw(); });
onRefit(() => s6Draw());
s6Draw();

/* ================================================================
   window.LAP — 评审对账接口（全部走与页面相同的闭式实现）
   ================================================================ */
window.LAP = {
  X1, fourierMag, sliceMag, inROC1,
  params4, impulse4, envelope4, verdict4,
  SYS5, rocBounds5, judge5, impulse5,
  getState() {
    return {
      s0: { sig: s0.sig, om: s0.om },
      s1: { a: s1.a, probe: { sig: s1.probe.sig, om: s1.probe.om } },
      s2: { a: s2.a, s0: s2.s0, inRoc: s2InRoc() },
      s3: { a: s3.a, side: s3.side, probe: { sig: s3.probe.sig, om: s3.probe.om } },
      s4: {
        state: s4State(), params: params4(s4State()), verdict: verdict4(s4State()),
        te: s4.te, envAtTe: envelope4(s4State(), s4.te)
      },
      s5: { sys: s5.sys, roc: s5.roc, judge: judge5(s5.sys, s5.roc) }
    };
  }
};
