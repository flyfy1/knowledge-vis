'use strict';
/* 一次函数 · 直线与它的方程 — 全部逻辑（无依赖，原生 Canvas 2D）
   依赖 i18n.js 先行加载：t() / getLang() / onLangRefresh()。

   ★ 红线落点：
   1. 斜率/交点全程有理数 {n, d} 精确运算：KSET 含 ±1/2，交点用分数解，
      显示与判定同源于纯函数（formatEquation / arithString / intersect）。
   2. 方程书写规范（k=1 省略、k=−1 写 −x、b 的符号与 0、分数斜率 ½）
      只由 formatEquation 一处生成，中英共用，抽样集断言全覆盖。
   3. 所有读数由状态纯渲染：切语言、改参数、答题的任意组合都重算，
      不留旧判定。
   对账入口：window.LINEAR（fmt / intersect / pointsOnLine / fareAt / state / geoms）。 */
const $ = id => document.getElementById(id);

/* PURE-BEGIN —— 纯函数区（无 DOM 依赖，自查脚本抽取本区断言） */
function igcd(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { const r = a % b; a = b; b = r; }
  return a;
}
function rat(n, d) {
  if (d < 0) { n = -n; d = -d; }
  const g = igcd(n, d) || 1;
  return { n: n / g, d: d / g };
}
function rAdd(a, b) { return rat(a.n * b.d + b.n * a.d, a.d * b.d); }
function rMul(a, b) { return rat(a.n * b.n, a.d * b.d); }
function rEq(a, b) { return a.n === b.n && a.d === b.d; }
function fmtInt(v) { return v < 0 ? '−' + (-v) : String(v); }
function fmtRat(r) {
  if (r.d === 1) return fmtInt(r.n);
  const sign = r.n < 0 ? '−' : '';
  const an = Math.abs(r.n);
  if (r.d === 2 && an === 1) return sign + '½';
  return sign + an + '/' + r.d;
}
/* 斜率取值集：−3…3，含 0 与 ±1/2，滑杆以索引取用 */
const KSET = [rat(-3, 1), rat(-2, 1), rat(-1, 1), rat(-1, 2), rat(0, 1), rat(1, 2), rat(1, 1), rat(2, 1), rat(3, 1)];
/* kx 项的书写：k=1 → x；k=−1 → −x；k=0 → 空 */
function kxTerm(k) {
  if (k.n === 0) return '';
  if (k.n === k.d) return 'x';
  if (k.n === -k.d) return '−x';
  return fmtRat(k) + 'x';
}
/* 方程书写规范的唯一生成处：y = kx + b（b 为整数） */
function formatEquation(k, b) {
  const term = kxTerm(k);
  if (!term) return 'y = ' + fmtInt(b);
  let s = 'y = ' + term;
  if (b > 0) s += ' + ' + b;
  else if (b < 0) s += ' − ' + (-b);
  return s;
}
/* 代入验算串：y = k×x ± b = y（x 为整数，负数加括号） */
function arithString(k, x, b) {
  const xs = x < 0 ? '(' + fmtInt(x) + ')' : String(x);
  let s = 'y = ' + fmtRat(k) + '×' + xs;
  if (b > 0) s += ' + ' + b;
  else if (b < 0) s += ' − ' + (-b);
  const y = rAdd(rMul(k, rat(x, 1)), rat(b, 1));
  return s + ' = ' + fmtRat(y);
}
/* 直线上整数 x 处的精确 y（有理数） */
function lineY(k, b, x) { return rAdd(rMul(k, rat(x, 1)), rat(b, 1)); }
/* 范围内的格点（整数坐标且落在 y 范围内） */
function pointsOnLine(k, b, xmin, xmax, ymin, ymax) {
  const pts = [];
  for (let x = xmin; x <= xmax; x++) {
    const y = lineY(k, b, x);
    if (y.d === 1 && y.n >= ymin && y.n <= ymax) pts.push({ x: x, y: y.n });
  }
  return pts;
}
/* 两线关系：k1,b1 与 k2,b2 均为整数。返回 point（有理坐标）/ parallel / coincident */
function intersect(k1, b1, k2, b2) {
  if (k2 === k1) return b2 === b1 ? { type: 'coincident' } : { type: 'parallel' };
  const x = rat(b1 - b2, k2 - k1);
  const y = rAdd(rMul(rat(k1, 1), x), rat(b1, 1));
  return { type: 'point', x: x, y: y };
}
/* 出租车计价：车费 = 3 × 公里 + 8 */
function fareAt(km) { return 3 * km + 8; }
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
const COL = {
  cyan: '#6ee7ff', orange: '#ffb454', red: '#ff7a93', green: '#7ee2a8',
  ink: '#e8edf4', mut: '#9aa7b8', grid: 'rgba(57,70,94,.35)', axis: '#5b6b84'
};

/* ---------- 坐标绘图原语 ---------- */
/* 等比模式（equal:true）：两轴同尺度，绘图区居中；分离模式：绘图区带边距 */
function plotGeom(cv, xr, yr, equal) {
  const W = cv._w, H = cv._h;
  let ox, oy, pw, ph, ux, uy;
  if (equal) {
    const u = Math.min(W / (xr[1] - xr[0]), H / (yr[1] - yr[0]));
    ux = u; uy = u;
    pw = u * (xr[1] - xr[0]); ph = u * (yr[1] - yr[0]);
    ox = (W - pw) / 2; oy = (H - ph) / 2;
  } else {
    ox = 42; oy = 12; pw = W - 42 - 14; ph = H - 12 - 28;
    ux = pw / (xr[1] - xr[0]); uy = ph / (yr[1] - yr[0]);
  }
  return {
    xr: xr, yr: yr, ox: ox, oy: oy, pw: pw, ph: ph, ux: ux, uy: uy,
    X: x => ox + (x - xr[0]) * ux,
    Y: y => oy + (yr[1] - y) * uy,
    toDataX: px => xr[0] + (px - ox) / ux,
    toDataY: py => yr[1] - (py - oy) / uy
  };
}
function drawGrid(ctx, g, o) {
  o = o || {};
  const gx = o.gx || 1, gy = o.gy || 1, lx = o.lx || 1, ly = o.ly || 1;
  ctx.lineWidth = 1;
  ctx.strokeStyle = COL.grid;
  ctx.beginPath();
  for (let x = Math.ceil(g.xr[0] / gx) * gx; x <= g.xr[1]; x += gx) {
    if (x === 0) continue;
    ctx.moveTo(g.X(x), g.oy); ctx.lineTo(g.X(x), g.oy + g.ph);
  }
  for (let y = Math.ceil(g.yr[0] / gy) * gy; y <= g.yr[1]; y += gy) {
    if (y === 0) continue;
    ctx.moveTo(g.ox, g.Y(y)); ctx.lineTo(g.ox + g.pw, g.Y(y));
  }
  ctx.stroke();
  /* 坐标轴 */
  ctx.strokeStyle = COL.axis; ctx.lineWidth = 1.6;
  ctx.beginPath();
  if (g.yr[0] < 0 && g.yr[1] > 0) { ctx.moveTo(g.ox, g.Y(0)); ctx.lineTo(g.ox + g.pw, g.Y(0)); }
  if (g.xr[0] < 0 && g.xr[1] > 0) { ctx.moveTo(g.X(0), g.oy); ctx.lineTo(g.X(0), g.oy + g.ph); }
  ctx.stroke();
  /* 刻度数字 */
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillStyle = COL.mut;
  if (g.yr[0] < 0 && g.yr[1] > 0) {
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    for (let x = Math.ceil(g.xr[0] / lx) * lx; x <= g.xr[1]; x += lx) {
      if (x === 0) continue;
      ctx.fillText(String(x), g.X(x), g.Y(0) + 5);
    }
  }
  if (g.xr[0] < 0 && g.xr[1] > 0) {
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    for (let y = Math.ceil(g.yr[0] / ly) * ly; y <= g.yr[1]; y += ly) {
      if (y === 0) continue;
      ctx.fillText(String(y), g.X(0) - 6, g.Y(y));
    }
    ctx.textAlign = 'right'; ctx.textBaseline = 'top';
    ctx.fillText('0', g.X(0) - 5, g.Y(0) + 4);
  }
  /* 轴名 */
  ctx.fillStyle = COL.mut; ctx.font = 'italic 13px system-ui, sans-serif';
  ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
  ctx.fillText(o.xName || 'x', g.ox + g.pw - 2, g.Y(0) - 5);
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillText(o.yName || 'y', g.X(0) + 7, g.oy + 2);
  ctx.textBaseline = 'alphabetic';
}
function drawLineF(ctx, g, kF, bF, color, width, dash) {
  ctx.save();
  ctx.beginPath(); ctx.rect(g.ox, g.oy, g.pw, g.ph); ctx.clip();
  ctx.strokeStyle = color; ctx.lineWidth = width || 2.5;
  ctx.setLineDash(dash || []);
  ctx.beginPath();
  ctx.moveTo(g.X(g.xr[0]), g.Y(kF * g.xr[0] + bF));
  ctx.lineTo(g.X(g.xr[1]), g.Y(kF * g.xr[1] + bF));
  ctx.stroke();
  ctx.restore();
  ctx.setLineDash([]);
}
function drawDot(ctx, px, py, fill, r) {
  ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2);
  ctx.fillStyle = fill; ctx.fill();
  ctx.lineWidth = 1.6; ctx.strokeStyle = '#0d1117'; ctx.stroke();
}
function cText(ctx, text, x, y, color, align, size) {
  ctx.font = (size || 12.5) + 'px system-ui, sans-serif';
  ctx.fillStyle = color || COL.ink;
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
  ctx.textBaseline = 'alphabetic';
}
/* 带深色衬底的标签：压在点/线上也不糊 */
function cTextTag(ctx, text, x, y, color, align, size) {
  const s = size || 13;
  ctx.font = s + 'px system-ui, sans-serif';
  const w = ctx.measureText(text).width;
  const x0 = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x;
  ctx.fillStyle = 'rgba(13,17,23,.78)';
  ctx.fillRect(x0 - 3, y - s / 2 - 3, w + 6, s + 6);
  cText(ctx, text, x, y, color, align, s);
}

/* ---------- 对账状态 ---------- */
const LINEAR = {
  fmt: { equation: formatEquation, arith: arithString, rat: fmtRat },
  intersect: intersect, pointsOnLine: pointsOnLine, fareAt: fareAt,
  state: {}, geoms: {}
};
window.LINEAR = LINEAR;

/* ============================================================
   第 0 步：爬坡——落点、台阶、斜率
   ============================================================ */
const S0 = { ki: 6, shown: 6, token: 0 };
LINEAR.state.s0 = S0;
let s0Timer = null;
function s0Points() {
  const k = KSET[S0.ki];
  const pts = [];
  for (let x = 0; x <= 5; x++) pts.push({ x: x, y: rMul(k, rat(x, 1)) });
  return pts;
}
function drawS0() {
  const cv = regCanvas('s0-canvas');
  const ctx = fitCanvas(cv);
  const g = plotGeom(cv, [-0.7, 6.3], [-16.5, 16.5], false);
  LINEAR.geoms.s0 = g;
  ctx.clearRect(0, 0, cv._w, cv._h);
  drawGrid(ctx, g, { gx: 1, gy: 2, lx: 1, ly: 4 });
  const k = KSET[S0.ki];
  const kf = k.n / k.d;
  const pts = s0Points();
  /* 台阶：相邻落点之间先横后竖 */
  if (S0.shown >= 2) {
    ctx.strokeStyle = 'rgba(255,180,84,.45)'; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < S0.shown - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      ctx.moveTo(g.X(a.x), g.Y(a.y.n / a.y.d));
      ctx.lineTo(g.X(b.x), g.Y(a.y.n / a.y.d));
      ctx.lineTo(g.X(b.x), g.Y(b.y.n / b.y.d));
    }
    ctx.stroke();
    /* 第一步的升/降标注（加粗 + 数字） */
    ctx.strokeStyle = COL.orange; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(g.X(0), g.Y(0));
    ctx.lineTo(g.X(1), g.Y(0));
    ctx.lineTo(g.X(1), g.Y(kf));
    ctx.stroke();
    cText(ctx, '+1', (g.X(0) + g.X(1)) / 2, g.Y(0) + (kf < 0 ? -13 : 14), COL.orange, 'center');
    if (kf !== 0) cTextTag(ctx, fmtRat(k), g.X(1) + 10, g.Y(kf / 2), COL.orange, 'left');
    else cText(ctx, '0', g.X(1) + 7, g.Y(0) - 12, COL.orange, 'left');
  }
  /* 全部落下后连成直线 */
  if (S0.shown === 6) {
    ctx.strokeStyle = COL.cyan; ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(g.X(0), g.Y(0));
    ctx.lineTo(g.X(5), g.Y(5 * kf));
    ctx.stroke();
  }
  for (let i = 0; i < S0.shown; i++) {
    drawDot(ctx, g.X(pts[i].x), g.Y(pts[i].y.n / pts[i].y.d), COL.cyan, 4.5);
  }
}
/* 读数里的量词：zh 恒为「格」；EN 按单复数——|k| ≤ 1（1 与 ½）用 unit，其余用 units */
function unitWord(k) {
  if (getLang() === 'zh') return '格';
  return Math.abs(k.n) <= k.d ? 'unit' : 'units';
}
function renderS0() {
  const k = KSET[S0.ki];
  $('s0-k-val').textContent = 'k = ' + fmtRat(k);
  drawS0();
  const pts = s0Points().slice(0, S0.shown);
  if (S0.shown === 0) {
    setRO('s0-pts', t('s0roNone'));
    setRO('s0-ro', '');
    return;
  }
  const list = pts.map(p => '(' + p.x + ', ' + fmtRat(p.y) + ')').join(t('sep'));
  setRO('s0-pts', t('s0roPts', { pts: list }));
  if (S0.shown < 6) { setRO('s0-ro', ''); return; }
  if (k.n > 0) setRO('s0-ro', t('s0roKPos', { k: fmtRat(k), unit: unitWord(k) }));
  else if (k.n < 0) setRO('s0-ro', t('s0roKNeg', { k: fmtRat(k), a: fmtRat(rat(-k.n, k.d)), unit: unitWord(k) }));
  else setRO('s0-ro', t('s0roKZero'));
}
function s0StopAnim() {
  S0.token++;
  if (s0Timer) { clearInterval(s0Timer); s0Timer = null; }
}
function s0Play() {
  s0StopAnim();
  const token = S0.token;
  S0.shown = 0;
  renderS0();
  s0Timer = setInterval(() => {
    if (token !== S0.token) { clearInterval(s0Timer); return; }
    S0.shown++;
    if (S0.shown >= 6) { S0.shown = 6; clearInterval(s0Timer); s0Timer = null; }
    renderS0();
  }, 420);
}

/* ============================================================
   第 1 步：起点——截距与平移
   ============================================================ */
const S1 = { b: 1, animB: 1, token: 0 };
LINEAR.state.s1 = S1;
function drawS1() {
  const cv = regCanvas('s1-canvas');
  const ctx = fitCanvas(cv);
  const g = plotGeom(cv, [-9.5, 9.5], [-9.5, 9.5], true);
  LINEAR.geoms.s1 = g;
  ctx.clearRect(0, 0, cv._w, cv._h);
  drawGrid(ctx, g, { gx: 1, gy: 1, lx: 1, ly: 1 });
  drawLineF(ctx, g, 1, S1.animB, COL.cyan, 2.5);
  /* 截距标记：(0, b) 点 + 到原点的虚线 */
  const px = g.X(0), py = g.Y(S1.animB);
  ctx.strokeStyle = COL.orange; ctx.lineWidth = 1.6; ctx.setLineDash([5, 4]);
  ctx.beginPath(); ctx.moveTo(px, g.Y(0)); ctx.lineTo(px, py); ctx.stroke();
  ctx.setLineDash([]);
  drawDot(ctx, px, py, COL.orange, 5.5);
  cTextTag(ctx, '(0, ' + fmtInt(S1.b) + ')', px + 10, py - 10, COL.orange, 'left', 13);
}
function renderS1RO() {
  $('s1-b-val').textContent = 'b = ' + fmtInt(S1.b);
  setRO('s1-ro', t('s1ro', { b: fmtInt(S1.b) }));
}
function s1SetB(nb) {
  const from = S1.animB;
  const token = ++S1.token;
  S1.b = nb;
  renderS1RO();
  const t0 = performance.now();
  function frame(now) {
    if (token !== S1.token) return; /* 改滑杆：旧动画干净作废 */
    const p = Math.min(1, (now - t0) / 260);
    const e = 1 - Math.pow(1 - p, 3);
    S1.animB = from + (nb - from) * e;
    drawS1();
    if (p < 1) requestAnimationFrame(frame);
    else { S1.animB = nb; drawS1(); }
  }
  requestAnimationFrame(frame);
}

/* ============================================================
   第 2 步：方程长出来——双滑杆 + 点探针验算
   ============================================================ */
const S2 = { ki: 6, b: 1, sel: null, msg: null };
LINEAR.state.s2 = S2;
const S2XR = [-6, 6], S2YR = [-9, 9];
function s2Pts() { return pointsOnLine(KSET[S2.ki], S2.b, S2XR[0], S2XR[1], S2YR[0], S2YR[1]); }
function s2DefaultSel(pts) {
  let best = null;
  pts.forEach(p => { if (!best || Math.abs(p.x) < Math.abs(best.x)) best = p; });
  return best;
}
/* 改 k/b 后挑探针点：原选中点的 x 在新线上仍有格点，就保持选中同一个 x（验算随新线重算）；
   确实没有（该 x 在新线上的 y 不是整数格点）才回落到默认点 */
function s2KeepSel() {
  const pts = s2Pts();
  if (S2.sel) {
    const p = pts.find(q => q.x === S2.sel.x);
    if (p) { S2.sel = p; return; }
  }
  S2.sel = s2DefaultSel(pts);
}
function drawS2() {
  const cv = regCanvas('s2-canvas');
  const ctx = fitCanvas(cv);
  const g = plotGeom(cv, [-9.5, 9.5], [-9.5, 9.5], true);
  LINEAR.geoms.s2 = g;
  ctx.clearRect(0, 0, cv._w, cv._h);
  drawGrid(ctx, g, { gx: 1, gy: 1, lx: 1, ly: 1 });
  const k = KSET[S2.ki];
  drawLineF(ctx, g, k.n / k.d, S2.b, COL.cyan, 2.5);
  const pts = s2Pts();
  pts.forEach(p => {
    const sel = S2.sel && p.x === S2.sel.x;
    if (!sel) drawDot(ctx, g.X(p.x), g.Y(p.y), COL.cyan, 3.5);
  });
  /* 选中点：虚线到两轴 + 坐标标注 */
  if (S2.sel) {
    const p = S2.sel;
    const px = g.X(p.x), py = g.Y(p.y);
    ctx.strokeStyle = COL.orange; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(px, g.Y(0)); ctx.lineTo(px, py);
    ctx.moveTo(g.X(0), py); ctx.lineTo(px, py);
    ctx.stroke();
    ctx.setLineDash([]);
    drawDot(ctx, px, py, COL.orange, 6);
    const lx = p.x >= 4 ? px - 10 : px + 10;
    cTextTag(ctx, '(' + p.x + ', ' + p.y + ')', lx, py - 12, COL.orange, p.x >= 4 ? 'right' : 'left', 13);
  }
  /* 格点描边（未选中点画在选中虚线之上重描一遍，保证可见） */
  if (S2.sel) {
    pts.forEach(p => {
      if (p.x !== S2.sel.x) return;
      ctx.beginPath(); ctx.arc(g.X(p.x), g.Y(p.y), 6, 0, Math.PI * 2);
      ctx.lineWidth = 1.6; ctx.strokeStyle = '#0d1117'; ctx.stroke();
    });
  }
}
function renderS2() {
  const k = KSET[S2.ki];
  $('s2-k').value=S2.ki;$('s2-b').value=S2.b;
  $('s2-k-val').textContent = 'k = ' + fmtRat(k);
  $('s2-b-val').textContent = 'b = ' + fmtInt(S2.b);
  $('s2-eq').textContent = formatEquation(k, S2.b);
  drawS2();
  if (S2.msg === 'far') setRO('s2-probe', t('s2probeFar'));
  else if (S2.sel) {
    setRO('s2-probe', t('s2probe', {
      x: S2.sel.x, y: S2.sel.y,
      arith: arithString(k, S2.sel.x, S2.b)
    }));
  } else setRO('s2-probe', t('s2probeIdle'));
  queueLinearGeometryReading();
}
function s2SetSel(p) { S2.sel = p; S2.msg = null; renderS2(); }
function s2Cycle(dir) {
  const pts = s2Pts();
  if (!pts.length) return;
  let idx = S2.sel ? pts.findIndex(p => p.x === S2.sel.x) : -1;
  idx = idx < 0 ? 0 : (idx + dir + pts.length) % pts.length;
  s2SetSel(pts[idx]);
}

/* ============================================================
   第 3 步：两条线相遇
   ============================================================ */
const S3 = { k2: 2, b2: -1 };
LINEAR.state.s3 = S3;
function drawS3() {
  const cv = regCanvas('s3-canvas');
  const ctx = fitCanvas(cv);
  const g = plotGeom(cv, [-9.5, 9.5], [-9.5, 9.5], true);
  LINEAR.geoms.s3 = g;
  ctx.clearRect(0, 0, cv._w, cv._h);
  drawGrid(ctx, g, { gx: 1, gy: 1, lx: 1, ly: 1 });
  const inter = intersect(1, 1, S3.k2, S3.b2);
  if (inter.type === 'coincident') {
    drawLineF(ctx, g, 1, 1, COL.green, 3.5);
  } else {
    drawLineF(ctx, g, 1, 1, COL.cyan, 2.5);
    drawLineF(ctx, g, S3.k2, S3.b2, COL.orange, 2.5);
  }
  if (inter.type === 'point') {
    const fx = inter.x.n / inter.x.d, fy = inter.y.n / inter.y.d;
    const px = g.X(fx), py = g.Y(fy);
    ctx.beginPath(); ctx.arc(px, py, 9, 0, Math.PI * 2);
    ctx.lineWidth = 2; ctx.strokeStyle = COL.green; ctx.stroke();
    drawDot(ctx, px, py, COL.green, 5);
    const label = '(' + fmtRat(inter.x) + ', ' + fmtRat(inter.y) + ')';
    const align = fx > 3.5 ? 'right' : 'left';
    cTextTag(ctx, label, px + (align === 'left' ? 13 : -13), py - 13, COL.green, align, 13.5);
  }
}
function renderS3() {
  $('s3-k2-val').textContent = 'k₂ = ' + fmtInt(S3.k2);
  $('s3-b2-val').textContent = 'b₂ = ' + fmtInt(S3.b2);
  drawS3();
  setRO('s3-l1', t('s3l1', { eq: formatEquation(rat(1, 1), 1) }));
  setRO('s3-l2', t('s3l2', { eq: formatEquation(rat(S3.k2, 1), S3.b2) }));
  const inter = intersect(1, 1, S3.k2, S3.b2);
  if (inter.type === 'point') {
    setRO('s3-ro', t('s3roPoint', { x: fmtRat(inter.x), y: fmtRat(inter.y) }));
  } else if (inter.type === 'parallel') setRO('s3-ro', t('s3roParallel'));
  else setRO('s3-ro', t('s3roCoincident'));
}

/* ============================================================
   第 4 步 · 题 1：看图选方程
   ============================================================ */
const Q1 = { picked: [], done: false };
LINEAR.state.q1 = Q1;
const Q1OPTS = [
  { k: rat(1, 1), b: 2 },
  { k: rat(-1, 1), b: 2 },
  { k: rat(-1, 1), b: -2 }
];
const Q1ANSWER = 1;
function drawQ1() {
  const cv = regCanvas('s4q1-canvas');
  const ctx = fitCanvas(cv);
  const g = plotGeom(cv, [-5.5, 5.5], [-6.5, 6.5], true);
  LINEAR.geoms.q1 = g;
  ctx.clearRect(0, 0, cv._w, cv._h);
  drawGrid(ctx, g, { gx: 1, gy: 1, lx: 1, ly: 1 });
  drawLineF(ctx, g, -1, 2, COL.cyan, 2.5);
  drawDot(ctx, g.X(0), g.Y(2), COL.orange, 5.5);
  cTextTag(ctx, '(0, 2)', g.X(0) + 10, g.Y(2) - 11, COL.orange, 'left', 13);
}
function renderQ1() {
  drawQ1();
  Q1OPTS.forEach((o, i) => {
    const btn = $('s4q1-o' + i);
    btn.textContent = formatEquation(o.k, o.b);
    btn.classList.toggle('correct', Q1.done && i === Q1ANSWER);
    btn.classList.toggle('wrong', Q1.picked.includes(i));
    btn.disabled = Q1.done || Q1.picked.includes(i);
  });
  if (Q1.done) setRO('s4q1-ro', t('q1ok'));
  else if (Q1.picked.length) setRO('s4q1-ro', t('q1no'));
  else setRO('s4q1-ro', '');
}

/* ============================================================
   第 4 步 · 题 2：把线摆出来（目标 y = 2x − 1，整数精确判定）
   ============================================================ */
const Q2 = { k: 0, b: 0 };
LINEAR.state.q2 = Q2;
const Q2TARGET = { k: 2, b: -1 };
function q2Matched() { return Q2.k === Q2TARGET.k && Q2.b === Q2TARGET.b; }
function drawQ2() {
  const cv = regCanvas('s4q2-canvas');
  const ctx = fitCanvas(cv);
  const g = plotGeom(cv, [-9.5, 9.5], [-9.5, 9.5], true);
  LINEAR.geoms.q2 = g;
  ctx.clearRect(0, 0, cv._w, cv._h);
  drawGrid(ctx, g, { gx: 1, gy: 1, lx: 1, ly: 1 });
  drawLineF(ctx, g, Q2TARGET.k, Q2TARGET.b, COL.orange, 2.5, [7, 5]);
  drawLineF(ctx, g, Q2.k, Q2.b, q2Matched() ? COL.green : COL.cyan, 2.5);
}
function renderQ2() {
  $('s4q2-k-val').textContent = 'k = ' + fmtInt(Q2.k);
  $('s4q2-b-val').textContent = 'b = ' + fmtInt(Q2.b);
  drawQ2();
  setRO('s4q2-cur', t('q2cur', { eq: formatEquation(rat(Q2.k, 1), Q2.b) }));
  setRO('s4q2-ro', q2Matched() ? t('q2ok') : t('q2hint'));
}

/* ============================================================
   第 4 步 · 题 3：出租车计价（探针答题）
   ============================================================ */
const Q3 = { mode: 'a', sel: null };
LINEAR.state.q3 = Q3;
function drawQ3() {
  const cv = regCanvas('s4q3-canvas');
  const ctx = fitCanvas(cv);
  const g = plotGeom(cv, [-0.6, 6.6], [-2, 30], false);
  LINEAR.geoms.q3 = g;
  ctx.clearRect(0, 0, cv._w, cv._h);
  drawGrid(ctx, g, { gx: 1, gy: 5, lx: 1, ly: 5, xName: t('cKm'), yName: t('cFare') });
  /* 点列连线 */
  ctx.strokeStyle = 'rgba(110,231,255,.5)'; ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x <= 6; x++) {
    const px = g.X(x), py = g.Y(fareAt(x));
    if (x === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.stroke();
  for (let x = 0; x <= 6; x++) {
    const px = g.X(x), py = g.Y(fareAt(x));
    const sel = Q3.sel === x;
    if (sel) {
      ctx.beginPath(); ctx.arc(px, py, 11, 0, Math.PI * 2);
      ctx.lineWidth = 2; ctx.strokeStyle = COL.orange; ctx.stroke();
    }
    drawDot(ctx, px, py, sel ? COL.orange : COL.cyan, 6);
    cText(ctx, String(fareAt(x)), px, py - 15, sel ? COL.orange : COL.mut, 'center', 12);
  }
}
function renderQ3() {
  drawQ3();
  $('s4q3-ma').classList.toggle('active', Q3.mode === 'a');
  $('s4q3-mb').classList.toggle('active', Q3.mode === 'b');
  let html;
  if (Q3.mode === 'a') {
    if (Q3.sel === null) html = t('q3aIdle');
    else if (Q3.sel === 3) html = t('q3aOk');
    else html = t('q3aWrong', { x: Q3.sel, fare: fareAt(Q3.sel) });
  } else {
    if (Q3.sel === null) html = t('q3bIdle');
    else if (fareAt(Q3.sel) === 20) html = t('q3bOk');
    else html = t('q3bWrong', { x: Q3.sel, fare: fareAt(Q3.sel) });
  }
  setRO('s4q3-ro', html);
}

/* ---------- 画布点击：探针 ---------- */
function canvasPos(cv, ev) {
  const r = cv.getBoundingClientRect();
  const cx = (ev.touches && ev.touches[0]) ? ev.touches[0].clientX : ev.clientX;
  const cy = (ev.touches && ev.touches[0]) ? ev.touches[0].clientY : ev.clientY;
  return { x: cx - r.left, y: cy - r.top };
}
function bindProbe() {
  const cv2 = $('s2-canvas');
  cv2.classList.add('clickc');
  cv2.addEventListener('click', ev => {
    const g = LINEAR.geoms.s2;
    if (!g) return;
    const pos = canvasPos(cv2, ev);
    let best = null, bd = 1e9;
    s2Pts().forEach(p => {
      const d = Math.hypot(g.X(p.x) - pos.x, g.Y(p.y) - pos.y);
      if (d < bd) { bd = d; best = p; }
    });
    if (best && bd <= 48) s2SetSel(best);
    else { S2.msg = 'far'; renderS2(); }
  });
  const cv3 = $('s4q3-canvas');
  cv3.classList.add('clickc');
  cv3.addEventListener('click', ev => {
    const g = LINEAR.geoms.q3;
    if (!g) return;
    const pos = canvasPos(cv3, ev);
    let best = null, bd = 1e9;
    for (let x = 0; x <= 6; x++) {
      const d = Math.hypot(g.X(x) - pos.x, g.Y(fareAt(x)) - pos.y);
      if (d < bd) { bd = d; best = x; }
    }
    if (best !== null && bd <= 48) { Q3.sel = best; renderQ3(); }
  });
}

/* Reading context for the new geometry connection, not learner progress. */
let linearReadingTimer=null;
function queueLinearGeometryReading(){clearTimeout(linearReadingTimer);linearReadingTimer=setTimeout(saveLinearGeometryReading,180);}
function validLinearGeometryReading(value){
  if(!value||typeof value!=='object'||Array.isArray(value))return false;
  return value.version===1 && value.lesson==='linear-functions' && Number.isInteger(value.ki) && value.ki>=0 && value.ki<KSET.length && Number.isInteger(value.b) && value.b>=-4 && value.b<=4 && (value.x===null || (Number.isInteger(value.x)&&value.x>=S2XR[0]&&value.x<=S2XR[1]));
}
function saveLinearGeometryReading(){
  clearTimeout(linearReadingTimer);linearReadingTimer=null;
  try {const prior=history.state;history.replaceState({...((prior&&typeof prior==='object'&&!Array.isArray(prior))?prior:{}),knowledgeGeometryReading:{version:1,lesson:'linear-functions',ki:S2.ki,b:S2.b,x:S2.sel?S2.sel.x:null}},'');}catch(_){}
}
function restoreLinearGeometryReading(){
  try {const value=history.state&&history.state.knowledgeGeometryReading;if(validLinearGeometryReading(value)){S2.ki=value.ki;S2.b=value.b;S2.sel=value.x===null?null:(s2Pts().find(p=>p.x===value.x)||null);return true;}}catch(_){}return false;
}
/* ---------- 初始化 ---------- */
function renderAll() {
  renderS0();
  drawS1(); renderS1RO();
  renderS2();
  renderS3();
  renderQ1();
  renderQ2();
  renderQ3();
}
function init() {
  ['s0-canvas', 's1-canvas', 's2-canvas', 's3-canvas', 's4q1-canvas', 's4q2-canvas', 's4q3-canvas'].forEach(regCanvas);
  /* 第 0 步 */
  $('s0-k').addEventListener('input', e => {
    s0StopAnim(); /* 动画中改滑杆：停掉落点序列，直接呈现新 k 的完整状态 */
    S0.ki = parseInt(e.target.value, 10);
    S0.shown = 6;
    renderS0();
  });
  $('s0-play').addEventListener('click', s0Play);
  $('s0-start').addEventListener('click', () => {
    document.getElementById('step1').scrollIntoView({ behavior: 'smooth' });
  });
  /* 第 1 步 */
  $('s1-b').addEventListener('input', e => s1SetB(parseInt(e.target.value, 10)));
  /* 第 2 步 */
  $('linear-pinhole-link').addEventListener('click',saveLinearGeometryReading);
  $('s2-k').addEventListener('input', e => {
    S2.ki = parseInt(e.target.value, 10);
    s2KeepSel();
    S2.msg = null;
    renderS2();
  });
  $('s2-b').addEventListener('input', e => {
    S2.b = parseInt(e.target.value, 10);
    s2KeepSel();
    S2.msg = null;
    renderS2();
  });
  $('s2-prev').addEventListener('click', () => s2Cycle(-1));
  $('s2-next').addEventListener('click', () => s2Cycle(1));
  /* 第 3 步 */
  $('s3-k2').addEventListener('input', e => { S3.k2 = parseInt(e.target.value, 10); renderS3(); });
  $('s3-b2').addEventListener('input', e => { S3.b2 = parseInt(e.target.value, 10); renderS3(); });
  /* 第 4 步 */
  Q1OPTS.forEach((o, i) => {
    $('s4q1-o' + i).addEventListener('click', () => {
      if (Q1.done || Q1.picked.includes(i)) return;
      if (i === Q1ANSWER) Q1.done = true;
      else Q1.picked.push(i);
      renderQ1();
    });
  });
  $('s4q2-k').addEventListener('input', e => { Q2.k = parseInt(e.target.value, 10); renderQ2(); });
  $('s4q2-b').addEventListener('input', e => { Q2.b = parseInt(e.target.value, 10); renderQ2(); });
  $('s4q3-ma').addEventListener('click', () => { Q3.mode = 'a'; renderQ3(); });
  $('s4q3-mb').addEventListener('click', () => { Q3.mode = 'b'; renderQ3(); });
  bindProbe();
  if(!restoreLinearGeometryReading())S2.sel = s2DefaultSel(s2Pts());
  renderAll();
  window.addEventListener('pagehide',saveLinearGeometryReading);
  window.addEventListener('pageshow',()=>requestAnimationFrame(()=>{
    // Native form restoration must not leave any control disagreeing with its model.
    $('s0-k').value=S0.ki;$('s1-b').value=S1.b;$('s3-k2').value=S3.k2;$('s3-b2').value=S3.b2;
    $('s4q2-k').value=Q2.k;$('s4q2-b').value=Q2.b;renderS2();
  }));
  onLangRefresh(renderAll);
  onRefit(renderAll);
}
document.addEventListener('DOMContentLoaded', init);
