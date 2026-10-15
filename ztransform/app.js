'use strict';
/* Z 变换交互讲解 — 全部逻辑（无依赖，原生 Canvas 2D）
   依赖 i18n.js 先行加载：t() / getLang() / onLangRefresh() / STR。

   ★ 红线（与 BRIEF 一一对应）：
   1. 映射真算：z = e^{sT} 复数指数逐点算（|z| = e^{σT}、∠z = ωT mod 2π），T 在页面明示。
   2. 求和现场真算：第 2 步部分和 S_N 由 JS 逐项真加（复数乘加），不用闭式冒充；
      误差 |S_N − 极限| 与 |q|^{N+1}/|1−q|（q = a/z）并排给读数对账。
   3. 同式异 ROC：第 3 步判定走比值判据解析口径——因果 |z|>|a|、左边 |z|<|a|，
      边界 |z|=|a| 明示不收敛；稳定性 = ROC 包含单位圆（a=1 时边界即圆本身、不包含）。
   4. 时域闭式：第 4/6 步 H(z) = 1/((1−pz⁻¹)(1−p̄z⁻¹))，h[n] = rⁿ·sin((n+1)θ)/sin θ，
      包络 E[n] = rⁿ/|sin θ|（峰值恰贴）；实轴重根改走 (n+1)·pⁿ、包络 (n+1)·rⁿ。
   5. 频响即圆周求值：|H(e^{jΩ})| 把 z = e^{jΩ} 代入 H(z) 复数真算；峰位在细网格上
      真算 argmax，与极点角 θ 的偏差如实呈现。
   6. 别名口径：第 1 步序列用原始 Ω 计算 x[n] = rⁿcos(Ωn)；Ω、Ω+2π、2π−Ω 三个
      序列逐点差由 ZT.aliasMaxDiff 给出（浮点下 ~1e-13 量级，非构造相等）。
   评审对账接口：window.ZT（见文件末尾）。 */
const TAU = Math.PI * 2;
const $ = id => document.getElementById(id);

/* ================================================================
   数学核心（页面与 window.ZT 共用同一批实现）
   ================================================================ */
function wrapPi(a) { let x = (a + Math.PI) % TAU; if (x < 0) x += TAU; return x - Math.PI; }
/* z = e^{sT}：s = σ + jω → {re, im, mod = e^{σT}, ang = ωT 收进 (−π, π], angRaw = ωT} */
function mapSToZ(sig, om, T) {
  const mod = Math.exp(sig * T), angRaw = om * T;
  return { re: mod * Math.cos(angRaw), im: mod * Math.sin(angRaw), mod, ang: wrapPi(angRaw), angRaw };
}
/* 第 1 步序列：x[n] = rⁿ·cos(Ωn)（用原始 Ω，不先收角） */
function seqPoint(r, Om, n) { return Math.pow(r, n) * Math.cos(Om * n); }
function seqArray(r, Om, N) { const out = []; for (let n = 0; n < N; n++) out.push(seqPoint(r, Om, n)); return out; }
/* 别名三序列逐点最大差：Ω vs Ω+2π、Ω vs 2π−Ω */
function aliasMaxDiff(r, Om, N) {
  let dPlus = 0, dMir = 0;
  for (let n = 0; n < N; n++) {
    const v = seqPoint(r, Om, n);
    dPlus = Math.max(dPlus, Math.abs(v - seqPoint(r, Om + TAU, n)));
    dMir = Math.max(dMir, Math.abs(v - seqPoint(r, TAU - Om, n)));
  }
  return { plus2pi: dPlus, mirror: dMir };
}
/* 第 2 步：q = a/z（复数）；z = 0 时返回 null */
function ratioQ(a, zre, zim) {
  const d = zre * zre + zim * zim;
  if (d === 0) return null;
  return { re: a * zre / d, im: -a * zim / d, mod: Math.abs(a) / Math.sqrt(d) };
}
/* 部分和逐项真加：返回 [S_0, S_1, …, S_N]（S_k = Σ_{n=0}^{k} qⁿ） */
function partialSumList(a, zre, zim, N) {
  const q = ratioQ(a, zre, zim);
  const out = [];
  if (!q) return out;
  let sr = 0, si = 0, tr = 1, ti = 0;
  for (let n = 0; n <= N; n++) {
    sr += tr; si += ti;
    out.push({ re: sr, im: si });
    const nr = tr * q.re - ti * q.im, ni = tr * q.im + ti * q.re;
    tr = nr; ti = ni;
  }
  return out;
}
function partialSum(a, zre, zim, N) {
  const L = partialSumList(a, zre, zim, N);
  return L.length ? L[L.length - 1] : null;
}
/* 极限 1/(1−q) = z/(z−a)；q = 1（z = a）时返回 null */
function sumLimit(a, zre, zim) {
  const q = ratioQ(a, zre, zim);
  if (!q) return null;
  const dr = 1 - q.re, di = -q.im, d = dr * dr + di * di;
  if (d === 0) return null;
  return { re: dr / d, im: -di / d };
}
/* 第 3 步 ROC 判定（a > 0）：side 'causal' → |z|>|a|；'left' → |z|<|a|；边界如实报 */
function rocVerdict(a, zmod, side) {
  const eps = 1e-9 * Math.max(1, a);
  if (Math.abs(zmod - a) <= eps) return 'boundary';
  if (side === 'causal') return zmod > a ? 'in' : 'out';
  return zmod < a ? 'in' : 'out';
}
/* 稳定性：ROC 包含单位圆（开集——a = 1 时边界即圆本身，不算包含） */
function stableFor(a, side) { return side === 'causal' ? a < 1 : a > 1; }
/* 第 4/6 步：H(z) = 1/((1−pz⁻¹)(1−p̄z⁻¹))，p = r·e^{jθ}，在任意 z 处复数真算 */
function Heval(r, th, zre, zim) {
  const pr = r * Math.cos(th), pi = r * Math.sin(th);
  const d = zre * zre + zim * zim;
  if (d === 0) return null;
  /* p/z 与 p̄/z（注意：p̄/z ≠ conj(p/z)） */
  const ar = (pr * zre + pi * zim) / d, ai = (pi * zre - pr * zim) / d;
  const br = (pr * zre - pi * zim) / d, bi = (-pi * zre - pr * zim) / d;
  /* (1 − p/z)(1 − p̄/z) */
  const ur = 1 - ar, ui = -ai, vr = 1 - br, vi = -bi;
  const wr = ur * vr - ui * vi, wi = ur * vi + ui * vr;
  const wd = wr * wr + wi * wi;
  if (wd === 0) return { re: Infinity, im: NaN, mod: Infinity };
  return { re: wr / wd, im: -wi / wd, mod: 1 / Math.sqrt(wd) };
}
function respAt(r, th, Om) {
  const h = Heval(r, th, Math.cos(Om), Math.sin(Om));
  return h ? h.mod : NaN;
}
/* 频响峰位：Ω ∈ [0, π] 细网格真算 argmax（1440 格）+ 邻域三分细化求真峰 */
function respPeak(r, th) {
  let best = { Om: 0, val: -1 };
  const M = 1440;
  for (let i = 0; i <= M; i++) {
    const Om = i / M * Math.PI, v = respAt(r, th, Om);
    if (isFinite(v) && v > best.val) best = { Om, val: v };
  }
  /* 三分细化：在格点峰 ±1 格内继续真算，尖峰（r→1）也不漏真值 */
  let lo = Math.max(0, best.Om - Math.PI / M), hi = Math.min(Math.PI, best.Om + Math.PI / M);
  for (let k = 0; k < 48; k++) {
    const m1 = lo + (hi - lo) / 3, m2 = hi - (hi - lo) / 3;
    const v1 = respAt(r, th, m1), v2 = respAt(r, th, m2);
    if (isFinite(v1) && v1 > best.val) best = { Om: m1, val: v1 };
    if (isFinite(v2) && v2 > best.val) best = { Om: m2, val: v2 };
    if (v1 < v2) lo = m1; else hi = m2;
  }
  return best;
}
/* 冲激响应闭式：h[n] = rⁿ·sin((n+1)θ)/sin θ；实轴重根 (n+1)·pⁿ */
function impulse(n, r, th) {
  const s = Math.sin(th);
  if (Math.abs(s) < 1e-9) { const p = r * Math.cos(th); return (n + 1) * Math.pow(p, n); }
  return Math.pow(r, n) * Math.sin((n + 1) * th) / s;
}
/* 包络 E[n]：rⁿ/|sin θ|（重根时 (n+1)·rⁿ），|h[n]| ≤ E[n] 且峰值贴合 */
function envelope(n, r, th) {
  const s = Math.sin(th);
  if (Math.abs(s) < 1e-9) return (n + 1) * Math.pow(r, n);
  return Math.pow(r, n) / Math.abs(s);
}
/* 第 6 步：差分方程逐样点真滤波 y[n] = x[n] + 2r·cosθ·y[n−1] − r²·y[n−2] */
function filterRun(r, th, xs) {
  const b = 2 * r * Math.cos(th), c = r * r;
  const ys = new Float64Array(xs.length);
  let y1 = 0, y2 = 0;
  for (let n = 0; n < xs.length; n++) {
    const y = xs[n] + b * y1 - c * y2;
    ys[n] = y; y2 = y1; y1 = y;
  }
  return ys;
}
const FS6 = 8000, TONES6 = [300, 700, 1200, 1900, 2700];
function toneOm(f) { return TAU * f / FS6; }
function buildInput6() {
  const N = Math.floor(FS6 * 1.6), xs = new Float64Array(N);
  for (let n = 0; n < N; n++) {
    let v = 0;
    for (const f of TONES6) v += Math.sin(TAU * f * n / FS6);
    xs[n] = v * 0.2;
  }
  return xs;
}

/* ================================================================
   画布适配（DPR）：沿用站内 fitCanvas 方案
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
/* 大/小数值：普通定点或科学计数 */
function fmtSmart(v) {
  if (!isFinite(v)) return '∞';
  const a = Math.abs(v);
  if (a !== 0 && (a >= 1e6 || a < 1e-3)) return v.toExponential(2).replace('-', '−');
  return fmtS(v, 3);
}
function signOf(v) { return v < 0 ? '−' : '+'; }
/* 截断标注小牌：曲线被画框截断时才由调用方画出；xLeft 给定时左置（避让右侧峰标签） */
function drawClipNote(ctx, xRight, yTop, text, xLeft) {
  ctx.font = '11.5px system-ui, sans-serif';
  const tw = ctx.measureText(text).width;
  const x0 = xLeft != null ? xLeft : Math.max(2, xRight - tw - 12);
  ctx.fillStyle = 'rgba(10,14,20,0.88)';
  ctx.fillRect(x0, yTop, tw + 12, 21);
  ctx.strokeStyle = 'rgba(255,180,84,0.5)'; ctx.lineWidth = 1;
  ctx.strokeRect(x0, yTop, tw + 12, 21);
  ctx.fillStyle = '#ffb454'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(text, x0 + 6, yTop + 11);
}
/* 点旁标签（R2 全页同类修复）：先量宽选边——优选侧放不下就换另一侧，再不行夹取锚点，整串必落画布内。
   调用方先设好 font / fillStyle / textBaseline（本助手接管 textAlign 与落点） */
function drawSideLabel(ctx, text, px, py, w, preferLeft, gap) {
  gap = gap || 10;
  const tw = ctx.measureText(text).width;
  const fitsL = px + gap + tw <= w - 4, fitsR = px - gap - tw >= 4;
  let x;
  if (preferLeft && fitsL) { ctx.textAlign = 'left'; x = px + gap; }
  else if (!preferLeft && fitsR) { ctx.textAlign = 'right'; x = px - gap; }
  else if (fitsL) { ctx.textAlign = 'left'; x = px + gap; }
  else if (fitsR) { ctx.textAlign = 'right'; x = px - gap; }
  else if (preferLeft) { ctx.textAlign = 'left'; x = Math.max(4, w - 4 - tw); }
  else { ctx.textAlign = 'right'; x = Math.min(w - 4, 4 + tw); }
  ctx.fillText(text, x, py - 8);
}
/* 图例助手（窄屏自适应）：量宽 → 贪心分行 → 逐行绘制（沿用贝叶斯页做法） */
const LEG_FONT = '12.5px system-ui, sans-serif';
function legendRows(ctx, items, maxW) {
  ctx.font = LEG_FONT;
  const rows = [];
  let row = [], rowW = 0;
  for (const [txt, col] of items) {
    const w = 21 + ctx.measureText(txt).width;
    if (row.length && rowW + 18 + w > maxW) { rows.push(row); row = []; rowW = 0; }
    if (row.length) rowW += 18;
    row.push([txt, col]); rowW += w;
  }
  if (row.length) rows.push(row);
  return rows;
}
function drawLegendRows(ctx, rows, x, y) {
  ctx.font = LEG_FONT;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  rows.forEach((row, ri) => {
    let lx = x;
    const yy = y + ri * 16;
    for (const [txt, col] of row) {
      ctx.fillStyle = col;
      ctx.fillRect(lx, yy - 5, 16, 10);
      ctx.fillText(txt, lx + 21, yy + 1);
      lx += 21 + ctx.measureText(txt).width + 18;
    }
  });
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
/* z 平面视图：等比例（圆不变形），绘图区为居中正方形 */
function zView(w, h, R, padT, padB) {
  const size = Math.min(w - 16, h - padT - padB);
  const cx = w / 2, cy = padT + (h - padT - padB) / 2;
  const sc = size / 2 / R;
  return {
    cx, cy, sc, R,
    X: re => cx + re * sc,
    Y: im => cy - im * sc,
    invX: px => (px - cx) / sc,
    invY: py => (cy - py) / sc,
    box: { x: cx - size / 2, y: cy - size / 2, s: size }
  };
}
/* z 平面底图：背景、整数网格、坐标轴、单位圆（加亮）、刻度 */
function drawZBase(ctx, v, opts) {
  opts = opts || {};
  const b = v.box;
  if (!opts.noFill) { ctx.fillStyle = '#11161f'; ctx.fillRect(b.x, b.y, b.s, b.s); }
  ctx.font = '10.5px system-ui, sans-serif';
  ctx.lineWidth = 1;
  const R = v.R;
  for (let g = Math.ceil(-R); g <= Math.floor(R); g++) {
    if (g === 0) continue;
    ctx.strokeStyle = 'rgba(120,140,165,0.13)';
    ctx.beginPath(); ctx.moveTo(v.X(g), b.y); ctx.lineTo(v.X(g), b.y + b.s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(b.x, v.Y(g)); ctx.lineTo(b.x + b.s, v.Y(g)); ctx.stroke();
    ctx.fillStyle = '#5f7089'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(String(g).replace('-', '−'), v.X(g), v.Y(0) + 4);
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.fillText(String(g).replace('-', '−'), v.X(0) - 4, v.Y(g));
  }
  /* 坐标轴 */
  ctx.strokeStyle = 'rgba(200,215,235,0.4)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(b.x, v.Y(0)); ctx.lineTo(b.x + b.s, v.Y(0)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(v.X(0), b.y); ctx.lineTo(v.X(0), b.y + b.s); ctx.stroke();
  /* 单位圆——全页主角，加亮 */
  ctx.strokeStyle = opts.unitColor || 'rgba(110,231,255,0.8)'; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.arc(v.cx, v.cy, v.sc, 0, TAU); ctx.stroke();
  ctx.strokeStyle = '#2b3547'; ctx.lineWidth = 1;
  ctx.strokeRect(b.x, b.y, b.s, b.s);
  ctx.fillStyle = '#9aa7b8'; ctx.font = '12px system-ui, sans-serif';
  ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
  ctx.fillText('Re z →', b.x + b.s - 4, b.y + b.s - 4);
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillText('Im z', v.X(0) + 5, b.y + 4);
}
/* 画布标题（左上角小字） */
function drawTitle(ctx, x, y, text, col) {
  ctx.fillStyle = col || '#9aa7b8'; ctx.font = '12.5px system-ui, sans-serif';
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}
/* 茎状图：ys 数组（或函数）画在 [x0,x1]×[yBot,yTop] 盒内，y 范围 [−yMax, yMax] */
function drawStems(ctx, box, ys, yMax, col, dotCol) {
  const { x0, x1, yBot, yTop } = box;
  const N = ys.length;
  const X = n => x0 + (N <= 1 ? 0.5 : n / (N - 1)) * (x1 - x0);
  const Y = vv => yBot - (clamp(vv, -yMax, yMax) + yMax) / (2 * yMax) * (yBot - yTop);
  ctx.strokeStyle = 'rgba(200,215,235,0.35)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x0, Y(0)); ctx.lineTo(x1, Y(0)); ctx.stroke();
  ctx.strokeStyle = col; ctx.fillStyle = dotCol || col; ctx.lineWidth = 1.4;
  for (let n = 0; n < N; n++) {
    ctx.beginPath(); ctx.moveTo(X(n), Y(0)); ctx.lineTo(X(n), Y(ys[n])); ctx.stroke();
    ctx.beginPath(); ctx.arc(X(n), Y(ys[n]), 2.4, 0, TAU); ctx.fill();
  }
  return { X, Y };
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
   第 0 步 · 钩子：把平面卷起来（点族沿 z = e^{sT} 飞落）
   ================================================================ */
const s0 = { T: 0.5, playing: true, trails: true, time: 0 };
const S0_FAMS = [
  { sig: 0, col: '#6ee7ff', key: 'cvFamAxis', oms: [] },
  { sig: -1.2, col: '#7ee2a8', key: 'cvFamL', oms: [] },
  { sig: 0.8, col: '#ff7a93', key: 'cvFamR', oms: [] }
];
for (let om = -6.5; om <= 6.51; om += 0.65) S0_FAMS[0].oms.push(om);
for (let om = -6.5; om <= 6.51; om += 1.3) { S0_FAMS[1].oms.push(om); S0_FAMS[2].oms.push(om); }
function s0Draw() {
  const cv = $('s0-canvas');
  const ctx = fitCanvas(cv);
  const w = cv._w, h = cv._h;
  if (w < 10) return;
  ctx.clearRect(0, 0, w, h);
  const legItems = S0_FAMS.map(f => [t(f.key), f.col]);
  const rows = legendRows(ctx, legItems, w - 24);
  const legH = rows.length * 16 + 8;
  const plotT = 30, plotB = h - legH - 16, plotH = plotB - plotT;
  const midX = w / 2;
  const pL = { x: 8, w: midX - 14 }, pR = { x: midX + 6, w: w - midX - 14 };
  /* 左：s 平面视图 σ∈[−2.6,1.6]、ω∈[−7,7] */
  const sX = s => pL.x + (s + 2.6) / 4.2 * pL.w;
  const sY = o => plotT + (7 - o) / 14 * plotH;
  /* 右：z 平面视图 R = 2.5（等比例居中） */
  const zc = { x: pR.x + pR.w / 2, y: plotT + plotH / 2 };
  const zsc = Math.min(pR.w, plotH) / 2 / 2.5;
  const zX = re => zc.x + re * zsc, zY = im => zc.y - im * zsc;
  drawTitle(ctx, pL.x + 2, 15, t('cvSPlane'), '#9aa7b8');
  drawTitle(ctx, pR.x + 2, 15, t('cvZPlane'), '#9aa7b8');
  /* s 侧底图 */
  ctx.fillStyle = '#11161f'; ctx.fillRect(pL.x, plotT, pL.w, plotH);
  ctx.font = '10.5px system-ui, sans-serif'; ctx.lineWidth = 1;
  for (let s = -2; s <= 1; s++) {
    if (s === 0) continue;
    ctx.strokeStyle = 'rgba(120,140,165,0.13)';
    ctx.beginPath(); ctx.moveTo(sX(s), plotT); ctx.lineTo(sX(s), plotB); ctx.stroke();
    ctx.fillStyle = '#5f7089'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(String(s).replace('-', '−'), sX(s), plotB + 3);
  }
  for (let o = -6; o <= 6; o += 2) {
    if (o === 0) continue;
    ctx.strokeStyle = 'rgba(120,140,165,0.13)';
    ctx.beginPath(); ctx.moveTo(pL.x, sY(o)); ctx.lineTo(pL.x + pL.w, sY(o)); ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(200,215,235,0.4)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(pL.x, sY(0)); ctx.lineTo(pL.x + pL.w, sY(0)); ctx.stroke();
  ctx.strokeStyle = 'rgba(110,231,255,0.75)'; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(sX(0), plotT); ctx.lineTo(sX(0), plotB); ctx.stroke();
  ctx.setLineDash([5, 5]); ctx.lineWidth = 1.2;
  ctx.strokeStyle = 'rgba(126,226,168,0.5)';
  ctx.beginPath(); ctx.moveTo(sX(-1.2), plotT); ctx.lineTo(sX(-1.2), plotB); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,122,147,0.5)';
  ctx.beginPath(); ctx.moveTo(sX(0.8), plotT); ctx.lineTo(sX(0.8), plotB); ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = '#2b3547'; ctx.lineWidth = 1;
  ctx.strokeRect(pL.x, plotT, pL.w, plotH);
  ctx.fillStyle = '#9aa7b8'; ctx.font = '12px system-ui, sans-serif';
  ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
  ctx.fillText('σ →', pL.x + pL.w - 4, plotB - 4);
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillText('jω', sX(0) + 5, plotT + 4);
  /* z 侧底图 */
  ctx.fillStyle = '#11161f'; ctx.fillRect(pR.x, plotT, pR.w, plotH);
  ctx.strokeStyle = 'rgba(200,215,235,0.4)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(pR.x, zY(0)); ctx.lineTo(pR.x + pR.w, zY(0)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(zX(0), plotT); ctx.lineTo(zX(0), plotB); ctx.stroke();
  ctx.setLineDash([5, 5]); ctx.lineWidth = 1.2;
  ctx.strokeStyle = 'rgba(126,226,168,0.55)';
  ctx.beginPath(); ctx.arc(zc.x, zc.y, Math.exp(-1.2 * s0.T) * zsc, 0, TAU); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,122,147,0.55)';
  ctx.beginPath(); ctx.arc(zc.x, zc.y, Math.exp(0.8 * s0.T) * zsc, 0, TAU); ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = 'rgba(110,231,255,0.85)'; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.arc(zc.x, zc.y, zsc, 0, TAU); ctx.stroke();
  ctx.strokeStyle = '#2b3547'; ctx.lineWidth = 1;
  ctx.strokeRect(pR.x, plotT, pR.w, plotH);
  /* 单位圆标签：先量宽再落笔——放不下先收字号、再不行贴右界内移（EN 390 曾被右缘裁掉末尾「1」，R2 修 M1） */
  ctx.fillStyle = '#6ee7ff'; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
  const unitTxt = t('cvUnit');
  let ufs = 11.5;
  ctx.font = ufs + 'px system-ui, sans-serif';
  let ux = zX(0) + 6;
  const uRight = pR.x + pR.w - 4;
  while (ux + ctx.measureText(unitTxt).width > uRight && ufs > 8.5) {
    ufs -= 0.5;
    ctx.font = ufs + 'px system-ui, sans-serif';
  }
  if (ux + ctx.measureText(unitTxt).width > uRight) ux = Math.max(pR.x + 4, uRight - ctx.measureText(unitTxt).width);
  ctx.fillText(unitTxt, ux, zY(1) - 3);
  /* 动画相位 */
  const cyc = s0.time % 3.6;
  let u = clamp(cyc / 2.3, 0, 1);
  u = u * u * (3 - 2 * u);
  if (!s0.playing) u = 1;
  for (const fam of S0_FAMS) {
    for (const om of fam.oms) {
      const z = mapSToZ(fam.sig, om, s0.T);
      const sx = sX(fam.sig), sy = sY(om);
      const zx = zX(z.re), zy = zY(z.im);
      const px = sx + (zx - sx) * u;
      const py = sy + (zy - sy) * u - Math.sin(Math.PI * u) * 10;
      if (s0.trails) {
        ctx.strokeStyle = fam.col + '2e'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(px, py); ctx.stroke();
      }
      ctx.globalAlpha = 0.45;
      ctx.fillStyle = fam.col;
      ctx.beginPath(); ctx.arc(sx, sy, 3, 0, TAU); ctx.fill();
      ctx.globalAlpha = 0.35 + 0.65 * u;
      ctx.beginPath(); ctx.arc(px, py, 3.6, 0, TAU); ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
  drawLegendRows(ctx, rows, 12, h - legH + 8);
}
function s0Readout() {
  $('s0-T-val').textContent = fmt(s0.T, 2);
  $('s0-readout').innerHTML = t('s0ro', {
    T: fmt(s0.T, 2), rL: fmt(Math.exp(-1.2 * s0.T), 3), rR: fmt(Math.exp(0.8 * s0.T), 3)
  });
}
animate($('step0'), dt => { if (s0.playing) { s0.time += dt; s0Draw(); } });
$('s0-T').addEventListener('input', e => { s0.T = parseFloat(e.target.value); s0Draw(); s0Readout(); });
$('s0-play').addEventListener('click', () => {
  s0.playing = !s0.playing;
  $('s0-play').textContent = t(s0.playing ? 's0pause' : 's0play');
  if (!s0.playing) s0Draw();
});
$('s0-trails').addEventListener('change', e => { s0.trails = e.target.checked; s0Draw(); });
$('s0-start').addEventListener('click', () => { $('step1').scrollIntoView({ behavior: 'smooth' }); });
onLangRefresh(() => { $('s0-play').textContent = t(s0.playing ? 's0pause' : 's0play'); s0Draw(); s0Readout(); });
onRefit(() => s0Draw());
s0Draw(); s0Readout();

/* ================================================================
   第 1 步 · 一个点就是一段序列：z = r·e^{jΩ} → x[n] = rⁿcos(Ωn)
   ================================================================ */
const s1 = { r: 0.85, om: 1.0 };
function s1Point() { return { re: s1.r * Math.cos(s1.om), im: s1.r * Math.sin(s1.om) }; }
function s1DrawPlane() {
  const cv = $('s1-plane');
  const ctx = fitCanvas(cv);
  const w = cv._w, h = cv._h;
  if (w < 10) return;
  ctx.clearRect(0, 0, w, h);
  const v = zView(w, h, 1.75, 30, 10);
  drawTitle(ctx, 10, 14, t('cvZPlane'));
  drawZBase(ctx, v);
  const p = s1Point();
  const px = v.X(p.re), py = v.Y(p.im);
  /* 角度弧 + 半径虚线 */
  ctx.strokeStyle = 'rgba(255,180,84,0.8)'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.arc(v.cx, v.cy, 0.45 * v.sc, 0, -wrapPi(s1.om), wrapPi(s1.om) < 0); ctx.stroke();
  ctx.setLineDash([5, 5]);
  ctx.beginPath(); ctx.moveTo(v.cx, v.cy); ctx.lineTo(px, py); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#ffb454';
  ctx.beginPath(); ctx.arc(px, py, 7, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#0d1117'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(px, py, 7, 0, TAU); ctx.stroke();
  ctx.fillStyle = '#ffb454'; ctx.font = '12.5px system-ui, sans-serif';
  ctx.textBaseline = 'bottom';
  drawSideLabel(ctx, 'z · ' + t('cvDrag'), px, py, w, px > v.cx);
  s1.view = v;
}
function s1DrawSeq() {
  const cv = $('s1-seq');
  const ctx = fitCanvas(cv);
  const w = cv._w, h = cv._h;
  if (w < 10) return;
  ctx.clearRect(0, 0, w, h);
  const rows = legendRows(ctx, [[t('cvSeq'), '#6ee7ff']], w - 24);
  drawLegendRows(ctx, rows, 12, 14);
  const ys = seqArray(s1.r, s1.om, 32);
  const yMax = 3.2;
  drawStems(ctx, { x0: 18, x1: w - 14, yBot: h - 30, yTop: 44 }, ys, yMax, '#6ee7ff');
  ctx.fillStyle = '#5f7089'; ctx.font = '10.5px system-ui, sans-serif';
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillText('n = 0', 18, h - 20);
  ctx.textAlign = 'right';
  ctx.fillText('n = 31', w - 14, h - 20);
  if (ys.some(v => Math.abs(v) > yMax)) drawClipNote(ctx, w - 8, 40, t('cvClip'));
}
function s1Draw() { s1DrawPlane(); s1DrawSeq(); }
function s1Readout() {
  $('s1-r-val').textContent = fmt(s1.r, 2);
  $('s1-om-val').textContent = fmt(s1.om, 2);
  const p = s1Point();
  const verdict = s1.r < 1 - 1e-9 ? t('s1vDecay') : s1.r > 1 + 1e-9 ? t('s1vGrow') : t('s1vEqual');
  let html = t('s1ro', {
    r: fmt(s1.r, 2), om: fmt(s1.om, 2), omPi: fmt(s1.om / Math.PI, 2),
    re: fmtS(p.re, 3), imSign: signOf(p.im), im: fmt(Math.abs(p.im), 3),
    eff: fmtS(wrapPi(s1.om), 2), verdict,
    x0: fmt(seqPoint(s1.r, s1.om, 0), 2), x1: fmtS(seqPoint(s1.r, s1.om, 1), 2), x10: fmtS(seqPoint(s1.r, s1.om, 10), 3)
  });
  if (s1.om > Math.PI + 1e-12) {
    html += '<br>' + t('s1alias', { om: fmt(s1.om, 2), alias: fmt(TAU - s1.om, 2) });
  }
  $('s1-readout').innerHTML = html;
}
function s1Sync() { $('s1-r').value = s1.r; $('s1-om').value = s1.om; s1Draw(); s1Readout(); }
attachDrag($('s1-plane'),
  () => true,
  pos => {
    if (!s1.view) return;
    const re = s1.view.invX(pos.x), im = s1.view.invY(pos.y);
    s1.r = clamp(Math.hypot(re, im), 0, 1.6);
    let ang = Math.atan2(im, re);
    s1.om = ang < 0 ? ang + TAU : ang;
    s1Sync();
  });
$('s1-plane').addEventListener('keydown', e => {
  if (e.key === 'ArrowUp') { s1.r = clamp(s1.r + 0.05, 0, 1.6); s1Sync(); e.preventDefault(); }
  if (e.key === 'ArrowDown') { s1.r = clamp(s1.r - 0.05, 0, 1.6); s1Sync(); e.preventDefault(); }
  if (e.key === 'ArrowRight') { s1.om = (s1.om + 0.05) % TAU; s1Sync(); e.preventDefault(); }
  if (e.key === 'ArrowLeft') { s1.om = (s1.om - 0.05 + TAU) % TAU; s1Sync(); e.preventDefault(); }
});
$('s1-r').addEventListener('input', e => { s1.r = parseFloat(e.target.value); s1Draw(); s1Readout(); });
$('s1-om').addEventListener('input', e => { s1.om = parseFloat(e.target.value); s1Draw(); s1Readout(); });
onLangRefresh(() => { s1Draw(); s1Readout(); });
onRefit(() => s1Draw());
s1Draw(); s1Readout();

/* ================================================================
   第 2 步 · 求和现场：部分和逐项真加
   ================================================================ */
const s2 = { a: 0.7, z: { re: 1.2, im: 0.9 }, N: 0, running: false };
function s2DrawPlane() {
  const cv = $('s2-plane');
  const ctx = fitCanvas(cv);
  const w = cv._w, h = cv._h;
  if (w < 10) return;
  ctx.clearRect(0, 0, w, h);
  const rows = legendRows(ctx, [[t('cvBnd'), '#ffb454'], [t('cvProbe'), '#ffb454']], w - 24);
  drawLegendRows(ctx, rows, 12, 14);
  const v = zView(w, h, 2.2, 56, 10);
  drawZBase(ctx, v);
  /* ROC 边界圆 |z| = |a|（虚线） */
  ctx.setLineDash([6, 5]);
  ctx.strokeStyle = 'rgba(255,180,84,0.75)'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.arc(v.cx, v.cy, Math.abs(s2.a) * v.sc, 0, TAU); ctx.stroke();
  ctx.setLineDash([]);
  drawPole(ctx, v.X(s2.a), v.Y(0));
  ctx.fillStyle = '#ff7a93'; ctx.font = '12px system-ui, sans-serif';
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillText('a', v.X(s2.a) + 9, v.Y(0) + 6);
  /* 探针 */
  const px = v.X(s2.z.re), py = v.Y(s2.z.im);
  ctx.fillStyle = '#ffb454';
  ctx.beginPath(); ctx.arc(px, py, 6.5, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#0d1117'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(px, py, 6.5, 0, TAU); ctx.stroke();
  s2.view = v;
}
function s2DrawSums() {
  const cv = $('s2-sums');
  const ctx = fitCanvas(cv);
  const w = cv._w, h = cv._h;
  if (w < 10) return;
  ctx.clearRect(0, 0, w, h);
  const rows = legendRows(ctx, [[t('cvSumsT'), '#6ee7ff'], [t('cvLimit'), '#7ee2a8']], w - 24);
  drawLegendRows(ctx, rows, 12, 14);
  ctx.fillStyle = '#11161f';
  const sums = partialSumList(s2.a, s2.z.re, s2.z.im, s2.N);
  const lim = sumLimit(s2.a, s2.z.re, s2.z.im);
  let maxMod = 1.6;
  for (const p of sums) maxMod = Math.max(maxMod, Math.hypot(p.re, p.im));
  if (lim) maxMod = Math.max(maxMod, Math.hypot(lim.re, lim.im));
  maxMod *= 1.12;
  const v = zView(w, h, maxMod, 56, 10);
  ctx.fillRect(v.box.x, v.box.y, v.box.s, v.box.s);
  ctx.strokeStyle = 'rgba(200,215,235,0.35)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(v.box.x, v.Y(0)); ctx.lineTo(v.box.x + v.box.s, v.Y(0)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(v.X(0), v.box.y); ctx.lineTo(v.X(0), v.box.y + v.box.s); ctx.stroke();
  ctx.strokeStyle = '#2b3547'; ctx.strokeRect(v.box.x, v.box.y, v.box.s, v.box.s);
  /* 轨迹 */
  if (sums.length > 1) {
    ctx.strokeStyle = 'rgba(110,231,255,0.4)'; ctx.lineWidth = 1.2;
    ctx.beginPath();
    sums.forEach((p, i) => { const x = v.X(p.re), y = v.Y(p.im); if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
    ctx.stroke();
  }
  sums.forEach((p, i) => {
    ctx.fillStyle = i === sums.length - 1 ? '#ffb454' : 'rgba(110,231,255,0.75)';
    ctx.beginPath(); ctx.arc(v.X(p.re), v.Y(p.im), i === sums.length - 1 ? 5 : 2.2, 0, TAU); ctx.fill();
  });
  if (lim) {
    const lx = v.X(lim.re), ly = v.Y(lim.im);
    ctx.strokeStyle = '#7ee2a8'; ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(lx - 6, ly - 6); ctx.lineTo(lx + 6, ly + 6);
    ctx.moveTo(lx + 6, ly - 6); ctx.lineTo(lx - 6, ly + 6);
    ctx.stroke();
  }
  ctx.fillStyle = '#5f7089'; ctx.font = '10.5px system-ui, sans-serif';
  ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
  ctx.fillText('±' + fmt(maxMod, 1), v.box.x + v.box.s - 4, v.box.y + v.box.s - 4);
}
function s2Draw() { s2DrawPlane(); s2DrawSums(); }
function s2Readout() {
  $('s2-a-val').textContent = fmtS(s2.a, 2);
  const q = ratioQ(s2.a, s2.z.re, s2.z.im);
  const S = partialSum(s2.a, s2.z.re, s2.z.im, s2.N);
  const base = {
    a: fmtS(s2.a, 2), zre: fmtS(s2.z.re, 2), imSign: signOf(s2.z.im), zim: fmt(Math.abs(s2.z.im), 2),
    qmod: fmt(q.mod, 3), N: s2.N,
    sre: fmtSmart(S.re), sImSign: signOf(S.im), sim: fmtSmart(Math.abs(S.im))
  };
  let html;
  if (Math.abs(q.re - 1) < 1e-9 && Math.abs(q.im) < 1e-9) {
    html = t('s2roSing', Object.assign({}, base, { sn: s2.N + 1 }));
  } else if (Math.abs(q.mod - 1) < 1e-9) {
    html = t('s2roBnd', base);
  } else if (q.mod < 1) {
    const lim = sumLimit(s2.a, s2.z.re, s2.z.im);
    const err = Math.hypot(S.re - lim.re, S.im - lim.im);
    const errPred = Math.pow(q.mod, s2.N + 1) / Math.hypot(1 - q.re, q.im);
    html = t('s2roConv', Object.assign({}, base, {
      lre: fmtSmart(lim.re), lImSign: signOf(lim.im), lim: fmtSmart(Math.abs(lim.im)),
      err: fmtSmart(err), errPred: fmtSmart(errPred)
    }));
  } else {
    html = t('s2roDiv', base);
  }
  $('s2-readout').innerHTML = html;
}
function s2Sync() { s2Draw(); s2Readout(); }
attachDrag($('s2-plane'),
  () => true,
  pos => {
    if (!s2.view) return;
    let re = s2.view.invX(pos.x), im = s2.view.invY(pos.y);
    const m = Math.hypot(re, im);
    if (m < 0.2) { const f = m < 1e-9 ? 0 : 0.2 / m; re = m < 1e-9 ? 0.2 : re * f; im = m < 1e-9 ? 0 : im * f; }
    if (m > 2.15) { re *= 2.15 / m; im *= 2.15 / m; }
    s2.z = { re, im };
    s2.running = false;
    s2Sync();
  });
$('s2-a').addEventListener('input', e => { s2.a = parseFloat(e.target.value); s2Sync(); });
$('s2-add1').addEventListener('click', () => { s2.N = Math.min(400, s2.N + 1); s2Sync(); });
$('s2-add20').addEventListener('click', () => { s2.N = Math.min(400, s2.N + 20); s2Sync(); });
$('s2-reset').addEventListener('click', () => { s2.N = 0; s2.running = false; s2Sync(); });
$('s2-run').addEventListener('click', () => { if (s2.N >= 300) s2.N = 0; s2.running = true; s2Sync(); });
animate($('step2'), () => {
  if (!s2.running) return;
  s2.N = Math.min(300, s2.N + 3);
  if (s2.N >= 300) s2.running = false;
  s2Sync();
});
onLangRefresh(() => { s2Draw(); s2Readout(); });
onRefit(() => s2Draw());
s2Draw(); s2Readout();

/* ================================================================
   第 3 步 · 圆环 ROC：同式异域
   ================================================================ */
const s3 = { side: 'causal', a: 0.8, probe: { re: 1.3, im: 0.6 } };
function s3SeqVal(n) {
  if (s3.side === 'causal') return n >= 0 ? Math.pow(s3.a, n) : 0;
  return n <= -1 ? -Math.pow(s3.a, n) : 0;
}
function s3DrawPlane() {
  const cv = $('s3-plane');
  const ctx = fitCanvas(cv);
  const w = cv._w, h = cv._h;
  if (w < 10) return;
  ctx.clearRect(0, 0, w, h);
  const rows = legendRows(ctx, [[s3.side === 'causal' ? t('cvRocOut') : t('cvRocIn'), '#6ee7ff']], w - 24);
  drawLegendRows(ctx, rows, 12, 14);
  const padT = 14 + rows.length * 16 + 8;
  const v = zView(w, h, 2.2, padT, 10);
  /* ROC 阴影（先于网格） */
  ctx.fillStyle = '#11161f'; ctx.fillRect(v.box.x, v.box.y, v.box.s, v.box.s);
  ctx.fillStyle = 'rgba(110,231,255,0.09)';
  ctx.beginPath();
  if (s3.side === 'causal') {
    ctx.rect(v.box.x, v.box.y, v.box.s, v.box.s);
    ctx.arc(v.cx, v.cy, s3.a * v.sc, 0, TAU, true);
  } else {
    ctx.arc(v.cx, v.cy, s3.a * v.sc, 0, TAU);
  }
  ctx.fill('evenodd');
  drawZBase(ctx, v, { noFill: true });
  /* 边界圆 |z| = a */
  ctx.setLineDash([6, 5]);
  ctx.strokeStyle = 'rgba(255,180,84,0.8)'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.arc(v.cx, v.cy, s3.a * v.sc, 0, TAU); ctx.stroke();
  ctx.setLineDash([]);
  drawPole(ctx, v.X(s3.a), v.Y(0));
  ctx.fillStyle = '#ff7a93'; ctx.font = '12px system-ui, sans-serif';
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillText('a', v.X(s3.a) + 9, v.Y(0) + 6);
  const px = v.X(s3.probe.re), py = v.Y(s3.probe.im);
  ctx.fillStyle = '#ffb454';
  ctx.beginPath(); ctx.arc(px, py, 6.5, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#0d1117'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(px, py, 6.5, 0, TAU); ctx.stroke();
  ctx.fillStyle = '#ffb454'; ctx.font = '12px system-ui, sans-serif';
  ctx.textBaseline = 'bottom';
  drawSideLabel(ctx, t('cvProbe'), px, py, w, px > v.cx);
  s3.view = v;
}
function s3DrawTime() {
  const cv = $('s3-time');
  const ctx = fitCanvas(cv);
  const w = cv._w, h = cv._h;
  if (w < 10) return;
  ctx.clearRect(0, 0, w, h);
  const rows = legendRows(ctx, [[t(s3.side === 'causal' ? 'cvTimeC' : 'cvTimeL'), '#6ee7ff']], w - 24);
  drawLegendRows(ctx, rows, 12, 14);
  const ys = [];
  let maxAbs = 1;
  for (let n = -14; n <= 14; n++) { const v = s3SeqVal(n); ys.push(v); maxAbs = Math.max(maxAbs, Math.abs(v)); }
  drawStems(ctx, { x0: 18, x1: w - 14, yBot: h - 30, yTop: 44 }, ys, maxAbs * 1.06, '#6ee7ff');
  ctx.fillStyle = '#5f7089'; ctx.font = '10.5px system-ui, sans-serif';
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillText('n = −14', 18, h - 20);
  ctx.textAlign = 'center';
  ctx.fillText('n = 0', (18 + w - 14) / 2, h - 20);
  ctx.textAlign = 'right';
  ctx.fillText('n = 14', w - 14, h - 20);
}
function s3Draw() { s3DrawPlane(); s3DrawTime(); }
function s3Readout() {
  $('s3-a-val').textContent = fmt(s3.a, 2);
  const zmod = Math.hypot(s3.probe.re, s3.probe.im);
  const vd = rocVerdict(s3.a, zmod, s3.side);
  const verdict = vd === 'in' ? t('s3in') : vd === 'out' ? t('s3out') : t('s3bnd');
  const contains = s3.side === 'causal' ? s3.a < 1 : s3.a > 1;
  $('s3-readout').innerHTML = t('s3ro', {
    cur: t(s3.side === 'causal' ? 's3curC' : 's3curL'), a: fmt(s3.a, 2),
    zmod: fmt(zmod, 3), verdict,
    rocTxt: t(contains ? 's3rocHas' : 's3rocMiss'),
    stable: t(stableFor(s3.a, s3.side) ? 's3stable' : 's3unstable')
  });
}
function s3Sync() { s3Draw(); s3Readout(); }
attachDrag($('s3-plane'),
  () => true,
  pos => {
    if (!s3.view) return;
    let re = s3.view.invX(pos.x), im = s3.view.invY(pos.y);
    const m = Math.hypot(re, im);
    if (m > 2.15) { re *= 2.15 / m; im *= 2.15 / m; }
    s3.probe = { re, im };
    s3Sync();
  });
$('s3-a').addEventListener('input', e => { s3.a = parseFloat(e.target.value); s3Sync(); });
$('s3-causal').addEventListener('click', () => {
  s3.side = 'causal';
  $('s3-causal').classList.add('active'); $('s3-left').classList.remove('active');
  s3Sync();
});
$('s3-left').addEventListener('click', () => {
  s3.side = 'left';
  $('s3-left').classList.add('active'); $('s3-causal').classList.remove('active');
  s3Sync();
});
onLangRefresh(() => { s3Draw(); s3Readout(); });
onRefit(() => s3Draw());
s3Draw(); s3Readout();

/* ================================================================
   第 4 步 · 极点与单位圆：h[n] 闭式 + 频响圆周求值
   ================================================================ */
const s4 = { r: 0.97, th: 1.10 };
const S4_PRESETS = [{ r: 0.45, th: 1.10 }, { r: 0.97, th: 1.10 }, { r: 1.25, th: 1.10 }];
function s4DrawPlane() {
  const cv = $('s4-plane');
  const ctx = fitCanvas(cv);
  const w = cv._w, h = cv._h;
  if (w < 10) return;
  ctx.clearRect(0, 0, w, h);
  const v = zView(w, h, 1.8, 30, 10);
  drawTitle(ctx, 10, 14, t('cvZPlane'));
  drawZBase(ctx, v);
  const pr = s4.r * Math.cos(s4.th), pi = s4.r * Math.sin(s4.th);
  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = 'rgba(255,180,84,0.55)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(v.cx, v.cy); ctx.lineTo(v.X(pr), v.Y(pi)); ctx.stroke();
  ctx.setLineDash([]);
  drawPole(ctx, v.X(pr), v.Y(pi));
  drawPole(ctx, v.X(pr), v.Y(-pi));
  ctx.fillStyle = '#ffb454'; ctx.font = '12.5px system-ui, sans-serif';
  ctx.textBaseline = 'bottom';
  drawSideLabel(ctx, 'p · ' + t('cvDrag'), v.X(pr), v.Y(pi), w, v.X(pr) > v.cx);
  s4.view = v;
}
function s4DrawH() {
  const cv = $('s4-h');
  const ctx = fitCanvas(cv);
  const w = cv._w, h = cv._h;
  if (w < 10) return;
  ctx.clearRect(0, 0, w, h);
  const rows = legendRows(ctx, [[t('cvImp'), '#6ee7ff'], [t('cvEnv'), '#ffb454']], w - 24);
  drawLegendRows(ctx, rows, 12, 14);
  const N = 41;
  const hs = [], es = [];
  let yMax = 1;
  for (let n = 0; n < N; n++) { hs.push(impulse(n, s4.r, s4.th)); es.push(envelope(n, s4.r, s4.th)); yMax = Math.max(yMax, es[n]); }
  yMax *= 1.08;
  const box = { x0: 18, x1: w - 14, yBot: h - 30, yTop: 44 };
  const { X, Y } = drawStems(ctx, box, hs, yMax, '#6ee7ff');
  /* 包络 ±E[n]（虚线） */
  ctx.strokeStyle = 'rgba(255,180,84,0.75)'; ctx.lineWidth = 1.3; ctx.setLineDash([6, 5]);
  for (const sgn of [1, -1]) {
    ctx.beginPath();
    for (let n = 0; n < N; n++) { const x = X(n), y = Y(sgn * es[n]); if (n === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.fillStyle = '#5f7089'; ctx.font = '10.5px system-ui, sans-serif';
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillText('n = 0', 18, h - 20);
  ctx.textAlign = 'right';
  ctx.fillText('n = 40', w - 14, h - 20);
}
function s4DrawResp() {
  const cv = $('s4-resp');
  const ctx = fitCanvas(cv);
  const w = cv._w, h = cv._h;
  if (w < 10) return;
  ctx.clearRect(0, 0, w, h);
  const rows = legendRows(ctx, [[t('cvResp'), '#6ee7ff']], w - 24);
  drawLegendRows(ctx, rows, 12, 14);
  const peak = respPeak(s4.r, s4.th);
  const yMax = Math.max(3, peak.val * 1.15);
  const x0 = 46, x1 = w - 14, yBot = h - 28, yTop = 40;
  const X = Om => x0 + Om / Math.PI * (x1 - x0);
  const Y = vv => yBot - vv / yMax * (yBot - yTop);
  ctx.strokeStyle = 'rgba(200,215,235,0.35)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x0, Y(0)); ctx.lineTo(x1, Y(0)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x0, yTop); ctx.lineTo(x0, yBot); ctx.stroke();
  ctx.fillStyle = '#5f7089'; ctx.font = '10.5px system-ui, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  for (let k = 0; k <= 4; k++) ctx.fillText(k === 0 ? '0' : (k === 4 ? 'π' : String(k * 0.25).replace('0.', '.') + 'π'), X(k * Math.PI / 4), yBot + 5);
  ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  /* 纵轴上限是自动缩放值（max(3, 峰值×1.15)）：非整数时给一位小数，免得峰顶贴着取整后的刻度被误读成截断（R2）；
     r 扫过 1 时峰值可达 1e11 量级——大数用指数简写，量宽后仍放不下就改画轴右侧，绝不越出左缘（R2 探针发现） */
  const yLab = yMax >= 10000 ? yMax.toExponential(1).replace('e+', 'e') : (Number.isInteger(yMax) ? fmt(yMax, 0) : fmt(yMax, 1));
  if (x0 - 5 - ctx.measureText(yLab).width < 4) {
    ctx.textAlign = 'left'; ctx.fillText(yLab, x0 + 6, Y(yMax) + 6); ctx.textAlign = 'right';
  } else ctx.fillText(yLab, x0 - 5, Y(yMax) + 6);
  /* θ 参考虚线 */
  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = 'rgba(255,180,84,0.55)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(X(s4.th), yTop); ctx.lineTo(X(s4.th), yBot); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#ffb454'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
  ctx.fillText('θ', X(s4.th), yTop - 2);
  /* 曲线：z = e^{jΩ} 代入 H(z) 逐点真算 */
  ctx.strokeStyle = '#6ee7ff'; ctx.lineWidth = 2.2;
  ctx.beginPath();
  for (let i = 0; i <= 360; i++) {
    const Om = i / 360 * Math.PI, vv = respAt(s4.r, s4.th, Om);
    const x = X(Om), y = Y(isFinite(vv) ? vv : yMax);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  /* 峰顶进入纵轴上限 15% 带内时挂小牌：曲线从不被截断（纵轴按峰值自动缩放），但贴顶时目测读不准，精确值在读数里（R2 加，与拉普拉斯页截断小牌同款）。
     峰在右半时小牌改置左上（放得下才置左），避开峰标签与 θ 标签 */
  if (peak.val >= 0.85 * yMax) {
    const note = t('cvClipResp');
    ctx.font = '11.5px system-ui, sans-serif';
    const nw = ctx.measureText(note).width + 12;
    if (peak.Om > Math.PI / 2 && 54 + nw <= w - 4) drawClipNote(ctx, 0, 40, note, 54);
    else drawClipNote(ctx, w - 8, 40, note);
  }
  /* 峰标记 */
  ctx.fillStyle = '#7ee2a8';
  ctx.beginPath(); ctx.arc(X(peak.Om), Y(peak.val), 4.5, 0, TAU); ctx.fill();
  ctx.font = '12px system-ui, sans-serif'; ctx.textAlign = peak.Om > Math.PI * 0.6 ? 'right' : 'left'; ctx.textBaseline = 'bottom';
  ctx.fillText(t('cvPeak') + ' Ω = ' + fmt(peak.Om, 2), X(peak.Om) + (peak.Om > Math.PI * 0.6 ? -8 : 8), Y(peak.val) - 4);
  s4.peak = peak;
}
function s4Draw() { s4DrawPlane(); s4DrawH(); s4DrawResp(); }
function s4Readout() {
  const pr = s4.r * Math.cos(s4.th), pi = s4.r * Math.sin(s4.th);
  const verdict = s4.r < 1 - 1e-9 ? t('s4vStable') : s4.r > 1 + 1e-9 ? t('s4vUnstable') : t('s4vMarginal');
  const peak = s4.peak || respPeak(s4.r, s4.th);
  $('s4-readout').innerHTML = t('s4ro', {
    pre: fmtS(pr, 3), imSign: signOf(pi), pim: fmt(Math.abs(pi), 3),
    r: fmt(s4.r, 2), th: fmt(s4.th, 2), verdict,
    peakOm: fmt(peak.Om, 2), peakVal: fmt(peak.val, 1),
    h10: fmtS(impulse(10, s4.r, s4.th), 4), e10: fmt(envelope(10, s4.r, s4.th), 4)
  });
}
function s4Sync() { s4Draw(); s4Readout(); }
function s4ClearPresets() { document.querySelectorAll('#s4-presets .btn').forEach(b => b.classList.remove('active')); }
attachDrag($('s4-plane'),
  () => true,
  pos => {
    if (!s4.view) return;
    const re = s4.view.invX(pos.x), im = s4.view.invY(pos.y);
    s4.r = clamp(Math.hypot(re, im), 0.05, 1.6);
    s4.th = Math.atan2(Math.abs(im), re);
    s4ClearPresets();
    s4Sync();
  });
$('s4-plane').addEventListener('keydown', e => {
  if (e.key === 'ArrowUp') { s4.r = clamp(s4.r + 0.03, 0.05, 1.6); s4ClearPresets(); s4Sync(); e.preventDefault(); }
  if (e.key === 'ArrowDown') { s4.r = clamp(s4.r - 0.03, 0.05, 1.6); s4ClearPresets(); s4Sync(); e.preventDefault(); }
  if (e.key === 'ArrowRight') { s4.th = clamp(s4.th + 0.04, 0, Math.PI); s4ClearPresets(); s4Sync(); e.preventDefault(); }
  if (e.key === 'ArrowLeft') { s4.th = clamp(s4.th - 0.04, 0, Math.PI); s4ClearPresets(); s4Sync(); e.preventDefault(); }
});
document.querySelectorAll('#s4-presets .btn').forEach(b => {
  b.addEventListener('click', () => {
    const p = S4_PRESETS[parseInt(b.dataset.preset, 10)];
    s4.r = p.r; s4.th = p.th;
    document.querySelectorAll('#s4-presets .btn').forEach(x => x.classList.toggle('active', x === b));
    s4Sync();
  });
});
onLangRefresh(() => { s4Draw(); s4Readout(); });
onRefit(() => s4Draw());
s4Draw(); s4Readout();

/* ================================================================
   第 5 步 · 与拉普拉斯对表：z = e^{sT}、条带与孪生点
   ================================================================ */
const s5 = { sig: -0.8, om: -3.0, T: 0.5, twin: false };
function s5DrawS() {
  const cv = $('s5-s');
  const ctx = fitCanvas(cv);
  const w = cv._w, h = cv._h;
  if (w < 10) return;
  ctx.clearRect(0, 0, w, h);
  const rows = legendRows(ctx, [[t('cvStrip'), '#6ee7ff'], [t('cvSPole'), '#ffb454'], [t('cvTwin'), '#ff7a93']], w - 24);
  drawLegendRows(ctx, rows, 12, 14);
  const x0 = 36, x1 = w - 10, y0 = 14 + rows.length * 16 + 8, y1 = h - 24;
  const sigMin = -3.4, sigMax = 0.6, omMin = -15, omMax = 15;
  const X = s => x0 + (s - sigMin) / (sigMax - sigMin) * (x1 - x0);
  const Y = o => y0 + (omMax - o) / (omMax - omMin) * (y1 - y0);
  ctx.fillStyle = '#11161f'; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
  /* 主条带 |ω| ≤ π/T */
  const half = Math.PI / s5.T;
  ctx.fillStyle = 'rgba(110,231,255,0.06)';
  ctx.fillRect(x0, Y(Math.min(half, omMax)), x1 - x0, Y(Math.max(-half, omMin)) - Y(Math.min(half, omMax)));
  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = 'rgba(110,231,255,0.5)'; ctx.lineWidth = 1.2;
  for (const oo of [half, -half]) {
    if (oo >= omMin && oo <= omMax) { ctx.beginPath(); ctx.moveTo(x0, Y(oo)); ctx.lineTo(x1, Y(oo)); ctx.stroke(); }
  }
  ctx.setLineDash([]);
  /* 网格 */
  ctx.font = '10.5px system-ui, sans-serif'; ctx.lineWidth = 1;
  for (let s = -3; s <= 0; s++) {
    if (s === 0) continue;
    ctx.strokeStyle = 'rgba(120,140,165,0.13)';
    ctx.beginPath(); ctx.moveTo(X(s), y0); ctx.lineTo(X(s), y1); ctx.stroke();
    ctx.fillStyle = '#5f7089'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(String(s).replace('-', '−'), X(s), y1 + 4);
  }
  for (let o = -12; o <= 12; o += 3) {
    if (o === 0) continue;
    ctx.strokeStyle = 'rgba(120,140,165,0.13)';
    ctx.beginPath(); ctx.moveTo(x0, Y(o)); ctx.lineTo(x1, Y(o)); ctx.stroke();
    ctx.fillStyle = '#5f7089'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.fillText(String(o).replace('-', '−'), x0 - 4, Y(o));
  }
  ctx.strokeStyle = 'rgba(200,215,235,0.4)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(x0, Y(0)); ctx.lineTo(x1, Y(0)); ctx.stroke();
  ctx.strokeStyle = 'rgba(110,231,255,0.75)'; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(X(0), y0); ctx.lineTo(X(0), y1); ctx.stroke();
  ctx.strokeStyle = '#2b3547'; ctx.lineWidth = 1;
  ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
  ctx.fillStyle = '#9aa7b8'; ctx.font = '12px system-ui, sans-serif';
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillText('jω', X(0) + 5, y0 + 4);
  ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
  ctx.fillText('σ →', x1 - 4, y1 - 4);
  /* 孪生点（ω ± 2π/T 成对：上下两条带各一个，R2 补 −2π/T 对称点） */
  if (s5.twin) {
    ctx.font = '12px system-ui, sans-serif';
    for (const sgn of [1, -1]) {
      const omT = s5.om + sgn * TAU / s5.T;
      if (omT > omMax || omT < omMin) continue;
      ctx.fillStyle = '#ff7a93';
      ctx.beginPath(); ctx.arc(X(s5.sig), Y(omT), 5.5, 0, TAU); ctx.fill();
      ctx.textAlign = 'left';
      if (sgn > 0) { ctx.textBaseline = 'bottom'; ctx.fillText(t('cvTwin'), X(s5.sig) + 9, Y(omT) - 6); }
      else { ctx.textBaseline = 'top'; ctx.fillText(t('cvTwin'), X(s5.sig) + 9, Y(omT) + 6); }
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(255,122,147,0.45)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(X(s5.sig), Y(s5.om)); ctx.lineTo(X(s5.sig), Y(omT)); ctx.stroke();
      ctx.setLineDash([]);
    }
  }
  /* 共轭镜像（淡）+ 主极点 */
  ctx.fillStyle = 'rgba(255,180,84,0.4)';
  ctx.beginPath(); ctx.arc(X(s5.sig), Y(-s5.om), 5, 0, TAU); ctx.fill();
  ctx.fillStyle = '#ffb454';
  ctx.beginPath(); ctx.arc(X(s5.sig), Y(s5.om), 6.5, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#0d1117'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(X(s5.sig), Y(s5.om), 6.5, 0, TAU); ctx.stroke();
  s5.view = { X, Y, invS: px => sigMin + (px - x0) / (x1 - x0) * (sigMax - sigMin), invO: py => omMax - (py - y0) / (y1 - y0) * (omMax - omMin) };
}
function s5DrawZ() {
  const cv = $('s5-z');
  const ctx = fitCanvas(cv);
  const w = cv._w, h = cv._h;
  if (w < 10) return;
  ctx.clearRect(0, 0, w, h);
  const v = zView(w, h, 1.45, 30, 10);
  drawTitle(ctx, 10, 14, t('cvZPlane'));
  drawZBase(ctx, v);
  const z = mapSToZ(s5.sig, s5.om, s5.T);
  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = 'rgba(255,180,84,0.5)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(v.cx, v.cy, z.mod * v.sc, 0, TAU); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(v.cx, v.cy); ctx.lineTo(v.X(z.re), v.Y(z.im)); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(255,180,84,0.4)';
  ctx.beginPath(); ctx.arc(v.X(z.re), v.Y(-z.im), 5, 0, TAU); ctx.fill();
  ctx.fillStyle = '#ffb454';
  ctx.beginPath(); ctx.arc(v.X(z.re), v.Y(z.im), 6.5, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#0d1117'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(v.X(z.re), v.Y(z.im), 6.5, 0, TAU); ctx.stroke();
  if (s5.twin) {
    ctx.strokeStyle = '#ff7a93'; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.arc(v.X(z.re), v.Y(z.im), 11, 0, TAU); ctx.stroke();
  }
  ctx.fillStyle = '#ffb454'; ctx.font = '12.5px system-ui, sans-serif';
  ctx.textBaseline = 'bottom';
  drawSideLabel(ctx, t('cvImage'), v.X(z.re), v.Y(z.im), w, v.X(z.re) > v.cx, 12);
  s5.z = z;
}
function s5Draw() { s5DrawS(); s5DrawZ(); }
function s5Readout() {
  $('s5-T-val').textContent = fmt(s5.T, 2);
  const z = mapSToZ(s5.sig, s5.om, s5.T);
  let twinTxt = '';
  if (s5.twin) {
    const om2 = s5.om + TAU / s5.T, om3 = s5.om - TAU / s5.T;
    const parts = [];
    if (om2 <= 15) {
      parts.push(t('s5twinTxt', {
        sre: fmtS(s5.sig, 2), imSign: signOf(om2), sim2: fmt(Math.abs(om2), 2),
        zmod: fmt(z.mod, 3), ang2: fmtS(om2 * s5.T, 2), ang: fmtS(wrapPi(s5.om * s5.T), 2)
      }));
    }
    if (om3 >= -15) {
      parts.push(t('s5twinTxtM', {
        sre: fmtS(s5.sig, 2), imSign: signOf(om3), sim3: fmt(Math.abs(om3), 2),
        zmod: fmt(z.mod, 3), ang3: fmtS(om3 * s5.T, 2), ang: fmtS(wrapPi(s5.om * s5.T), 2)
      }));
    }
    twinTxt = parts.length ? parts.join('') : t('s5twinOff');
  }
  $('s5-readout').innerHTML = t('s5ro', {
    sre: fmtS(s5.sig, 2), imSign: signOf(s5.om), sim: fmt(Math.abs(s5.om), 2),
    T: fmt(s5.T, 2),
    zre: fmtS(z.re, 3), zImSign: signOf(z.im), zim: fmt(Math.abs(z.im), 3),
    zmod: fmt(z.mod, 3), ang: fmtS(s5.om * s5.T, 2), twinTxt
  });
}
function s5Sync() { s5Draw(); s5Readout(); }
attachDrag($('s5-s'),
  () => true,
  pos => {
    if (!s5.view) return;
    s5.sig = clamp(s5.view.invS(pos.x), -3.2, -0.05);
    s5.om = clamp(s5.view.invO(pos.y), -14.6, 14.6);
    s5Sync();
  });
$('s5-T').addEventListener('input', e => { s5.T = parseFloat(e.target.value); s5Sync(); });
$('s5-twin').addEventListener('click', () => {
  s5.twin = !s5.twin;
  $('s5-twin').classList.toggle('active', s5.twin);
  $('s5-twin').textContent = t(s5.twin ? 's5twinBtnOff' : 's5twinBtn');
  s5Sync();
});
onLangRefresh(() => { $('s5-twin').textContent = t(s5.twin ? 's5twinBtnOff' : 's5twinBtn'); s5Draw(); s5Readout(); });
onRefit(() => s5Draw());
s5Draw(); s5Readout();

/* ================================================================
   第 6 步 · 终章：对照图 + 可拖共振器（差分方程真滤波 + 可选音频）
   ================================================================ */
const s6 = { r: 0.92, th: 1.0 };
function s6DrawMap() {
  const cv = $('s6-map');
  const ctx = fitCanvas(cv);
  const w = cv._w, h = cv._h;
  if (w < 10) return;
  ctx.clearRect(0, 0, w, h);
  const rows = legendRows(ctx, [[t('cvStableIn'), '#7ee2a8'], [t('cvOnCirc'), '#6ee7ff']], w - 24);
  const v = zView(w, h, 1.6, 30, 14 + rows.length * 16 + 6);
  ctx.fillStyle = '#11161f'; ctx.fillRect(v.box.x, v.box.y, v.box.s, v.box.s);
  ctx.fillStyle = 'rgba(126,226,168,0.07)';
  ctx.beginPath(); ctx.arc(v.cx, v.cy, v.sc, 0, TAU); ctx.fill();
  drawZBase(ctx, v, { noFill: true });
  /* 例：一对圆内极点 + 其半径圈 */
  const pr = 0.65 * Math.cos(0.95), pi = 0.65 * Math.sin(0.95);
  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = 'rgba(255,122,147,0.4)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(v.cx, v.cy, 0.65 * v.sc, 0, TAU); ctx.stroke();
  ctx.setLineDash([]);
  drawPole(ctx, v.X(pr), v.Y(pi));
  drawPole(ctx, v.X(pr), v.Y(-pi));
  ctx.fillStyle = '#7ee2a8'; ctx.font = '12.5px system-ui, sans-serif';
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(t('cvStableIn'), v.box.x + 12, v.cy + v.sc * 0.55);
  ctx.fillStyle = '#6ee7ff'; ctx.textAlign = 'center';
  ctx.fillText(t('cvOnCirc'), v.cx, v.cy - v.sc - 12);
  drawLegendRows(ctx, rows, 12, h - 10 - rows.length * 16);
}
function s6DrawPlane() {
  const cv = $('s6-plane');
  const ctx = fitCanvas(cv);
  const w = cv._w, h = cv._h;
  if (w < 10) return;
  ctx.clearRect(0, 0, w, h);
  const v = zView(w, h, 1.35, 30, 10);
  drawTitle(ctx, 10, 14, t('cvZPlane'));
  drawZBase(ctx, v);
  /* 五个输入音在单位圆上的角度（小点） */
  ctx.fillStyle = 'rgba(110,231,255,0.85)';
  for (const f of TONES6) {
    const Om = toneOm(f);
    ctx.beginPath(); ctx.arc(v.X(Math.cos(Om)), v.Y(Math.sin(Om)), 3.4, 0, TAU); ctx.fill();
  }
  const pr = s6.r * Math.cos(s6.th), pi = s6.r * Math.sin(s6.th);
  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = 'rgba(255,180,84,0.55)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(v.cx, v.cy); ctx.lineTo(v.X(pr), v.Y(pi)); ctx.stroke();
  ctx.setLineDash([]);
  drawPole(ctx, v.X(pr), v.Y(pi));
  drawPole(ctx, v.X(pr), v.Y(-pi));
  ctx.fillStyle = '#ffb454'; ctx.font = '12.5px system-ui, sans-serif';
  ctx.textBaseline = 'bottom';
  drawSideLabel(ctx, 'p · ' + t('cvDrag'), v.X(pr), v.Y(pi), w, v.X(pr) > v.cx);
  s6.view = v;
}
function s6DrawSpec() {
  const cv = $('s6-spec');
  const ctx = fitCanvas(cv);
  const w = cv._w, h = cv._h;
  if (w < 10) return;
  ctx.clearRect(0, 0, w, h);
  const rows = legendRows(ctx, [[t('cvResp6'), '#9aa7b8'], [t('cvIn6'), '#6ee7ff'], [t('cvOut6'), '#ffb454']], w - 24);
  drawLegendRows(ctx, rows, 12, 14);
  const x0 = 46, x1 = w - 14, yBot = h - 28, yTop = 44;
  const dbMin = -30, dbMax = 42;
  const X = Om => x0 + Om / Math.PI * (x1 - x0);
  const Y = db => yBot - (clamp(db, dbMin, dbMax) - dbMin) / (dbMax - dbMin) * (yBot - yTop);
  const toDb = v => 20 * Math.log10(Math.max(v, 1e-4));
  ctx.strokeStyle = 'rgba(200,215,235,0.3)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x0, yTop); ctx.lineTo(x0, yBot); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x0, Y(0)); ctx.lineTo(x1, Y(0)); ctx.stroke();
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = 'rgba(110,231,255,0.4)';
  ctx.beginPath(); ctx.moveTo(x0, Y(0)); ctx.lineTo(x1, Y(0)); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#5f7089'; ctx.font = '10.5px system-ui, sans-serif';
  ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  ctx.fillText('0 dB', x0 - 5, Y(0));
  ctx.fillText('+40', x0 - 5, Y(40) + 4);
  ctx.fillText('−30', x0 - 5, Y(-30) - 4);
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  for (let k = 0; k <= 4; k++) ctx.fillText(k === 0 ? 'Ω=0' : (k === 4 ? 'π' : String(k * 0.25).replace('0.', '.') + 'π'), X(k * Math.PI / 4), yBot + 5);
  /* |H| 曲线（dB） */
  ctx.strokeStyle = '#9aa7b8'; ctx.lineWidth = 1.8;
  ctx.beginPath();
  for (let i = 0; i <= 320; i++) {
    const Om = i / 320 * Math.PI, vv = respAt(s6.r, s6.th, Om);
    const x = X(Om), y = Y(isFinite(vv) ? toDb(vv) : dbMax);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  /* 五个音：输入点（0 dB 青）→ 输出增益（橙） */
  for (const f of TONES6) {
    const Om = toneOm(f), g = respAt(s6.r, s6.th, Om), gdb = toDb(g);
    ctx.strokeStyle = 'rgba(110,231,255,0.25)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(X(Om), yTop); ctx.lineTo(X(Om), yBot); ctx.stroke();
    ctx.strokeStyle = '#ffb454'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(X(Om), Y(0)); ctx.lineTo(X(Om), Y(gdb)); ctx.stroke();
    ctx.fillStyle = '#6ee7ff';
    ctx.beginPath(); ctx.arc(X(Om), Y(0), 3.4, 0, TAU); ctx.fill();
    ctx.fillStyle = '#ffb454';
    ctx.beginPath(); ctx.arc(X(Om), Y(gdb), 4, 0, TAU); ctx.fill();
  }
  /* θ 参考虚线 */
  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = 'rgba(255,180,84,0.5)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(X(s6.th), yTop); ctx.lineTo(X(s6.th), yBot); ctx.stroke();
  ctx.setLineDash([]);
}
function s6Draw() { s6DrawMap(); s6DrawPlane(); s6DrawSpec(); }
function s6Readout() {
  $('s6-r-val').textContent = fmt(s6.r, 2);
  const gains = TONES6.map(f => t('s6tone', { f, g: fmt(respAt(s6.r, s6.th, toneOm(f)), 1) })).join(' · ');
  const peak = respPeak(s6.r, s6.th);
  $('s6-readout').innerHTML = t('s6ro', {
    th: fmt(s6.th, 2), fres: fmt(s6.th * FS6 / TAU, 0), r: fmt(s6.r, 2),
    gains, peakOm: fmt(peak.Om, 2), peakVal: fmt(peak.val, 1)
  });
}
function s6Sync() { $('s6-r').value = s6.r; s6Draw(); s6Readout(); }
attachDrag($('s6-plane'),
  () => true,
  pos => {
    if (!s6.view) return;
    const re = s6.view.invX(pos.x), im = s6.view.invY(pos.y);
    s6.r = clamp(Math.hypot(re, im), 0.3, 0.99);
    s6.th = clamp(Math.atan2(Math.abs(im), re), 0.05, Math.PI - 0.05);
    s6Sync();
  });
$('s6-r').addEventListener('input', e => { s6.r = parseFloat(e.target.value); s6Draw(); s6Readout(); });
/* ---------- 音频（礼仪：默认静默、点击才建 AudioContext、峰值归一、增益保守） ---------- */
let AC6 = null, src6 = null;
function ac6() {
  if (!AC6) AC6 = new (window.AudioContext || window.webkitAudioContext)();
  if (AC6.state === 'suspended') AC6.resume();
  return AC6;
}
function playSamples6(samples) {
  const ctx = ac6();
  if (src6) { try { src6.stop(); } catch (e) { /* 忽略 */ } }
  let peak = 0;
  for (let i = 0; i < samples.length; i++) peak = Math.max(peak, Math.abs(samples[i]));
  const g = peak > 0 ? 0.5 / peak : 1;
  const buf = ctx.createBuffer(1, samples.length, FS6);
  const ch = buf.getChannelData(0);
  for (let i = 0; i < samples.length; i++) ch[i] = samples[i] * g;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const gain = ctx.createGain();
  /* 淡入 15 ms / 淡出 20 ms（R2 加）：0.8 s 短音起止不再咔哒；中段平台增益仍为 0.8 */
  const t0 = ctx.currentTime, dur = samples.length / FS6;
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(0.8, t0 + 0.015);
  gain.gain.setValueAtTime(0.8, Math.max(t0 + 0.015, t0 + dur - 0.02));
  gain.gain.linearRampToValueAtTime(0, t0 + dur);
  src.connect(gain); gain.connect(ctx.destination);
  src.start();
  src6 = src;
}
$('s6-play-dry').addEventListener('click', () => { playSamples6(buildInput6()); });
$('s6-play-wet').addEventListener('click', () => { playSamples6(filterRun(s6.r, s6.th, buildInput6())); });
onLangRefresh(() => { s6Draw(); s6Readout(); });
onRefit(() => s6Draw());
s6Draw(); s6Readout();

/* ================================================================
   window.ZT — 评审对账接口（全部走与页面相同的实现）
   ================================================================ */
window.ZT = {
  mapSToZ, wrapPi,
  seqPoint, seqArray, aliasMaxDiff,
  ratioQ, partialSum, partialSumList, sumLimit,
  rocVerdict, stableFor,
  Heval, respAt, respPeak, impulse, envelope,
  filterRun, toneOm, buildInput6,
  FS: FS6, TONES: TONES6,
  getState() {
    return {
      s0: { T: s0.T, playing: s0.playing },
      s1: { r: s1.r, om: s1.om, point: s1Point() },
      s2: { a: s2.a, z: { re: s2.z.re, im: s2.z.im }, N: s2.N },
      s3: { side: s3.side, a: s3.a, probe: { re: s3.probe.re, im: s3.probe.im } },
      s4: { r: s4.r, th: s4.th, peak: s4.peak || respPeak(s4.r, s4.th) },
      s5: { sig: s5.sig, om: s5.om, T: s5.T, twin: s5.twin, z: mapSToZ(s5.sig, s5.om, s5.T) },
      s6: { r: s6.r, th: s6.th }
    };
  }
};
