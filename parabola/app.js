'use strict';
/* 二次函数与抛物线 — 全部逻辑（无依赖，原生 Canvas 2D）
   依赖 i18n.js 先行加载：t() / getLang() / onLangRefresh()。

   ★ 红线落点：
   1. 方程书写规范（a=1 省略、a=−1 写 −、h 负写 (x + |h|)、k 的符号与 0、
      分数系数 ½）只由纯函数 fmtVertex 一处生成，中英共用，抽样集断言覆盖。
   2. 交点由纯函数 xIntercepts 求解：恰一交点 ⟺ 顶点在轴上（k = 0）；
      显示与判定同源。
   3. 所有读数由状态纯渲染：切语言、改参数、答题的任意组合都重算，
      不留旧判定；动画（投篮落点）改参即停、呈现新状态全图。
   对账入口：window.PARABOLA（fmt / intercepts / yAt / shotPoint / q3Y / state / geoms）。 */
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
function rSub(a, b) { return rat(a.n * b.d - b.n * a.d, a.d * b.d); }
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
/* 小数显示：分母能整除 100 时给十进制（去尾零），否则退回分数 */
function fmtDec(r) {
  if (r.d === 1) return fmtInt(r.n);
  const scaled = r.n * 100;
  if (scaled % r.d === 0) {
    const v = scaled / r.d;
    const sign = v < 0 ? '−' : '';
    const av = Math.abs(v);
    const ip = Math.floor(av / 100);
    const fp = av % 100;
    if (fp === 0) return sign + ip;
    const fs = fp % 10 === 0 ? '.' + (fp / 10) : '.' + (fp < 10 ? '0' + fp : '' + fp);
    return sign + ip + fs;
  }
  return fmtRat(r);
}
function isqrt(n) { const s = Math.round(Math.sqrt(n)); return s * s === n ? s : -1; }
/* 顶点式书写规范的唯一生成处：y = a(x − h)² + k（a 为有理数，h、k 为整数）
   a=1 省略系数；a=−1 只写 −；h=0 写 x²；h<0 写 (x + |h|)；k=0 不写，k<0 写 − |k| */
function fmtVertex(a, h, k) {
  let base;
  if (h === 0) base = 'x²';
  else if (h > 0) base = '(x − ' + h + ')²';
  else base = '(x + ' + (-h) + ')²';
  let coef;
  if (a.n === a.d) coef = '';
  else if (a.n === -a.d) coef = '−';
  else coef = fmtRat(a);
  let s = 'y = ' + coef + base;
  if (k > 0) s += ' + ' + k;
  else if (k < 0) s += ' − ' + (-k);
  return s;
}
/* 顶点式在整数 x 处的精确 y（有理数） */
function vertexYAt(a, h, k, x) {
  const dx = x - h;
  return rAdd(rMul(a, rat(dx * dx, 1)), rat(k, 1));
}
/* 与 x 轴交点：解 a(x−h)² + k = 0。a 为有理数（非 0），h、k 为整数。
   返回 {count, roots:[{exact: 有理数|null, val: 浮点, approx: bool}]}，roots 升序。 */
function xIntercepts(a, h, k) {
  const v = rat(-k * a.d, a.n); /* (x−h)² = −k/a */
  if (v.n < 0) return { count: 0, roots: [] };
  if (v.n === 0) return { count: 1, roots: [{ exact: rat(h, 1), val: h, approx: false }] };
  const sn = isqrt(v.n), sd = isqrt(v.d);
  if (sn >= 0 && sd >= 0) {
    const off = rat(sn, sd);
    return {
      count: 2, roots: [
        { exact: rSub(rat(h, 1), off), val: h - sn / sd, approx: false },
        { exact: rAdd(rat(h, 1), off), val: h + sn / sd, approx: false }
      ]
    };
  }
  const s = Math.sqrt(v.n / v.d);
  return {
    count: 2, roots: [
      { exact: null, val: h - s, approx: true },
      { exact: null, val: h + s, approx: true }
    ]
  };
}
function fmtApprox1(v) {
  const r = Math.round(v * 10) / 10;
  return (r < 0 ? '−' : '') + Math.abs(r).toFixed(1);
}
function fmtRoot(rt) { return rt.approx ? '≈' + fmtApprox1(rt.val) : fmtRat(rt.exact); }
/* 第 0 步投篮：第 j 个落点（j=0..13），t = j/10 秒，d = 4t 米，y = (−j² + 10j + 40)/20 米 */
function shotPoint(j) {
  return { t: rat(j, 10), d: rat(2 * j, 5), y: rat(-j * j + 10 * j + 40, 20) };
}
function shotX(mode, j) { return mode === 't' ? j / 10 : j * 0.4; }
function shotY(mode, x) { return mode === 't' ? -5 * x * x + 5 * x + 2 : -(5 / 16) * x * x + (5 / 4) * x + 2; }
/* 第 4 步题 3 的弧线：y = −½(x − 4)² + 8，整数 x 处精确 y */
function q3Y(x) { return vertexYAt(rat(-1, 2), 4, 8, x); }
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
/* 轴刻度数字：负号统一 U+2212，与全页读数一致 */
function tickTxt(v) { return String(Math.round(v * 100) / 100).replace('-', '−'); }
function setRO(id, str) { const el = $(id); if (el && el._v !== str) { el._v = str; el.innerHTML = str; } }
const COL = {
  cyan: '#6ee7ff', orange: '#ffb454', red: '#ff7a93', green: '#7ee2a8',
  ink: '#e8edf4', mut: '#9aa7b8', grid: 'rgba(57,70,94,.35)', axis: '#5b6b84'
};

/* ---------- 坐标绘图原语（与一次函数页同源） ---------- */
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
  ctx.strokeStyle = COL.axis; ctx.lineWidth = 1.6;
  ctx.beginPath();
  if (g.yr[0] < 0 && g.yr[1] > 0) { ctx.moveTo(g.ox, g.Y(0)); ctx.lineTo(g.ox + g.pw, g.Y(0)); }
  if (g.xr[0] < 0 && g.xr[1] > 0) { ctx.moveTo(g.X(0), g.oy); ctx.lineTo(g.X(0), g.oy + g.ph); }
  ctx.stroke();
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillStyle = COL.mut;
  if (g.yr[0] < 0 && g.yr[1] > 0) {
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    for (let x = Math.ceil(g.xr[0] / lx) * lx; x <= g.xr[1]; x += lx) {
      if (x === 0) continue;
      ctx.fillText(tickTxt(x), g.X(x), g.Y(0) + 5);
    }
  }
  if (g.xr[0] < 0 && g.xr[1] > 0) {
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    for (let y = Math.ceil(g.yr[0] / ly) * ly; y <= g.yr[1]; y += ly) {
      if (y === 0) continue;
      ctx.fillText(tickTxt(y), g.X(0) - 6, g.Y(y));
    }
    ctx.textAlign = 'right'; ctx.textBaseline = 'top';
    ctx.fillText('0', g.X(0) - 5, g.Y(0) + 4);
  }
  ctx.fillStyle = COL.mut; ctx.font = 'italic 13px system-ui, sans-serif';
  ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
  ctx.fillText(o.xName || 'x', g.ox + g.pw - 2, g.Y(0) - 5);
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillText(o.yName || 'y', g.X(0) + 7, g.oy + 2);
  ctx.textBaseline = 'alphabetic';
}
function drawCurve(ctx, g, fn, color, width, dash) {
  ctx.save();
  ctx.beginPath(); ctx.rect(g.ox, g.oy, g.pw, g.ph); ctx.clip();
  ctx.strokeStyle = color; ctx.lineWidth = width || 2.5;
  ctx.setLineDash(dash || []);
  ctx.beginPath();
  const N = 140;
  for (let i = 0; i <= N; i++) {
    const x = g.xr[0] + (g.xr[1] - g.xr[0]) * i / N;
    const px = g.X(x), py = g.Y(fn(x));
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
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
const PARABOLA = {
  fmt: { vertex: fmtVertex, dec: fmtDec, rat: fmtRat, root: fmtRoot },
  intercepts: xIntercepts, yAt: vertexYAt,
  shotPoint: shotPoint, q3Y: q3Y,
  state: {}, geoms: {}
};
window.PARABOLA = PARABOLA;

/* ============================================================
   第 0 步：投篮——点列落下成弧
   ============================================================ */
const S0 = { mode: 't', shown: 0, playing: false, token: 0 };
PARABOLA.state.s0 = S0;
let s0Timer = null;
function s0Geom(cv) {
  return S0.mode === 't'
    ? plotGeom(cv, [-0.12, 1.55], [-0.55, 4.3], false)
    : plotGeom(cv, [-0.3, 6.2], [-0.55, 4.3], false);
}
function s0StopAnim() {
  S0.token++;
  if (s0Timer) { clearInterval(s0Timer); s0Timer = null; }
  S0.playing = false;
}
function drawS0() {
  const cv = regCanvas('s0-canvas');
  const ctx = fitCanvas(cv);
  const g = s0Geom(cv);
  PARABOLA.geoms.s0 = g;
  ctx.clearRect(0, 0, cv._w, cv._h);
  drawGrid(ctx, g, S0.mode === 't'
    ? { gx: 0.5, gy: 1, lx: 0.5, ly: 1, xName: t('cTime'), yName: t('cHeight') }
    : { gx: 1, gy: 1, lx: 1, ly: 1, xName: t('cDist'), yName: t('cHeight') });
  const xf = j => shotX(S0.mode, j);
  const yf = j => shotPoint(j).y.n / shotPoint(j).y.d;
  /* 已落点之间的连线（历史累积，可见） */
  if (S0.shown >= 2) {
    ctx.strokeStyle = 'rgba(110,231,255,.45)'; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let j = 0; j < S0.shown; j++) {
      const px = g.X(xf(j)), py = g.Y(yf(j));
      if (j === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  /* 全部落下：完整弧线 */
  if (S0.shown >= 14) {
    drawCurve(ctx, g, x => shotY(S0.mode, x), COL.cyan, 2.5);
  }
  for (let j = 0; j < S0.shown; j++) {
    const px = g.X(xf(j)), py = g.Y(yf(j));
    if (j === 5) {
      drawDot(ctx, px, py, COL.orange, 6);
      const p5 = shotPoint(5);
      const vx = S0.mode === 't' ? p5.t : p5.d;
      cTextTag(ctx, t('cVertex') + ' (' + fmtDec(vx) + ', ' + fmtDec(p5.y) + ')', px, py - 16, COL.orange, 'center', 12.5);
    } else if (j === S0.shown - 1 && S0.shown < 14) {
      drawDot(ctx, px, py, COL.orange, 5.5);
    } else {
      drawDot(ctx, px, py, COL.cyan, 4);
    }
  }
}
function renderS0() {
  drawS0();
  $('s0-mode-t').classList.toggle('active', S0.mode === 't');
  $('s0-mode-d').classList.toggle('active', S0.mode === 'd');
  $('s0-play').textContent = S0.playing ? t('s0pause')
    : S0.shown >= 14 ? t('s0replay')
    : S0.shown > 0 ? t('s0resume') : t('s0play');
  $('s0-prog').textContent = S0.shown > 0 ? t('s0prog', { n: S0.shown }) : '';
  if (S0.shown === 0) {
    setRO('s0-pt', '');
    setRO('s0-ro', t('s0roIdle'));
    return;
  }
  const p = shotPoint(S0.shown - 1);
  if (S0.mode === 't') setRO('s0-pt', t('s0ptT', { n: S0.shown, x: fmtDec(p.t), y: fmtDec(p.y) }));
  else setRO('s0-pt', t('s0ptD', { n: S0.shown, x: fmtDec(p.d), y: fmtDec(p.y) }));
  if (S0.shown >= 14) setRO('s0-ro', S0.mode === 't' ? t('s0roDoneT') : t('s0roDoneD'));
  else setRO('s0-ro', '');
}
function s0StartAnim() {
  s0StopAnim();
  const token = S0.token;
  S0.playing = true;
  renderS0();
  s0Timer = setInterval(() => {
    if (token !== S0.token) { clearInterval(s0Timer); return; }
    S0.shown++;
    if (S0.shown >= 14) { S0.shown = 14; s0StopAnim(); }
    renderS0();
  }, 400);
}
function s0TogglePlay() {
  if (S0.playing) { s0StopAnim(); renderS0(); return; }
  if (S0.shown >= 14) S0.shown = 0;
  s0StartAnim();
}

/* ============================================================
   第 1 步：a 管胖瘦
   ============================================================ */
const ASET = [rat(-2, 1), rat(-1, 1), rat(-1, 2), rat(1, 2), rat(1, 1), rat(2, 1)];
const S1 = { ai: 4, zero: false };
PARABOLA.state.s1 = S1;
function drawS1() {
  const cv = regCanvas('s1-canvas');
  const ctx = fitCanvas(cv);
  const g = plotGeom(cv, [-5.5, 5.5], [-10.5, 10.5], false);
  PARABOLA.geoms.s1 = g;
  ctx.clearRect(0, 0, cv._w, cv._h);
  drawGrid(ctx, g, { gx: 1, gy: 2, lx: 1, ly: 2 });
  if (S1.zero) {
    drawCurve(ctx, g, () => 0, COL.orange, 3);
    drawDot(ctx, g.X(0), g.Y(0), COL.orange, 5.5);
    return;
  }
  const a = ASET[S1.ai];
  const af = a.n / a.d;
  if (af !== 1) drawCurve(ctx, g, x => x * x, 'rgba(154,167,184,.55)', 2, [6, 5]);
  drawCurve(ctx, g, x => af * x * x, COL.cyan, 2.5);
  for (let x = -3; x <= 3; x++) {
    const y = af * x * x;
    if (y < g.yr[0] || y > g.yr[1]) continue;
    drawDot(ctx, g.X(x), g.Y(y), x === 0 ? COL.orange : COL.cyan, x === 0 ? 5.5 : 3.5);
  }
  cTextTag(ctx, '(0, 0)', g.X(0) + 9, g.Y(0) + (af > 0 ? 13 : -13), COL.orange, 'left', 12.5);
}
function renderS1() {
  const a = ASET[S1.ai];
  $('s1-a-val').textContent = S1.zero ? 'a = 0' : 'a = ' + fmtRat(a);
  $('s1-eq').textContent = S1.zero ? 'y = 0' : fmtVertex(a, 0, 0);
  $('s1-zero').textContent = S1.zero ? t('s1zeroBack') : t('s1zeroBtn');
  drawS1();
  if (S1.zero) { setRO('s1-ro', t('s1roZero')); return; }
  let key;
  if (a.n > 0) key = a.n === a.d ? 's1roOne' : (a.n > a.d ? 's1roThin' : 's1roFat');
  else key = a.n === -a.d ? 's1roNegOne' : (a.n < -a.d ? 's1roNegThin' : 's1roNegFat');
  const abs = fmtRat(rat(Math.abs(a.n), a.d));
  setRO('s1-ro', t(key, { a: fmtRat(a), abs: abs }));
}

/* ============================================================
   第 2 步：顶点搬家
   ============================================================ */
const S2 = { a: 1, h: 0, k: 0 };
PARABOLA.state.s2 = S2;
function drawS2() {
  const cv = regCanvas('s2-canvas');
  const ctx = fitCanvas(cv);
  const g = plotGeom(cv, [-9.5, 9.5], [-9.5, 9.5], true);
  PARABOLA.geoms.s2 = g;
  ctx.clearRect(0, 0, cv._w, cv._h);
  drawGrid(ctx, g, { gx: 1, gy: 1, lx: 1, ly: 1 });
  /* 对称轴 */
  ctx.strokeStyle = COL.orange; ctx.lineWidth = 1.6; ctx.setLineDash([5, 4]);
  ctx.beginPath(); ctx.moveTo(g.X(S2.h), g.oy); ctx.lineTo(g.X(S2.h), g.oy + g.ph); ctx.stroke();
  ctx.setLineDash([]);
  cTextTag(ctx, t('cAxisLab', { h: fmtInt(S2.h) }), g.X(S2.h), g.oy + 12, COL.orange, 'center', 12);
  drawCurve(ctx, g, x => S2.a * (x - S2.h) * (x - S2.h) + S2.k, COL.cyan, 2.5);
  /* 对称点对：(h±2, 4a+k) */
  const py = 4 * S2.a + S2.k;
  ctx.strokeStyle = 'rgba(126,226,168,.6)'; ctx.lineWidth = 1.6; ctx.setLineDash([4, 4]);
  ctx.beginPath(); ctx.moveTo(g.X(S2.h - 2), g.Y(py)); ctx.lineTo(g.X(S2.h + 2), g.Y(py)); ctx.stroke();
  ctx.setLineDash([]);
  drawDot(ctx, g.X(S2.h - 2), g.Y(py), COL.green, 4.5);
  drawDot(ctx, g.X(S2.h + 2), g.Y(py), COL.green, 4.5);
  /* 顶点 */
  drawDot(ctx, g.X(S2.h), g.Y(S2.k), COL.orange, 6);
  const vx = g.X(S2.h), vy = g.Y(S2.k);
  const align = S2.h >= 5 ? 'right' : 'left';
  cTextTag(ctx, t('cVertex') + ' (' + fmtInt(S2.h) + ', ' + fmtInt(S2.k) + ')',
    vx + (align === 'left' ? 10 : -10), vy + (S2.a > 0 ? 14 : -14), COL.orange, align, 13);
}
function renderS2() {
  $('s2-a-up').classList.toggle('active', S2.a === 1);
  $('s2-a-down').classList.toggle('active', S2.a === -1);
  $('s2-h-val').textContent = 'h = ' + fmtInt(S2.h);
  $('s2-k-val').textContent = 'k = ' + fmtInt(S2.k);
  $('s2-eq').textContent = fmtVertex(rat(S2.a, 1), S2.h, S2.k);
  drawS2();
  setRO('s2-ro', t('s2ro', {
    h: fmtInt(S2.h), k: fmtInt(S2.k),
    lx: fmtInt(S2.h - 2), rx: fmtInt(S2.h + 2), y: fmtInt(4 * S2.a + S2.k)
  }));
}

/* ============================================================
   第 3 步：落点与交点
   ============================================================ */
const S3 = { a: -1, h: 1, k: 2, probe: null };
PARABOLA.state.s3 = S3;
/* 交点标签在画布上的占用区间（与 drawS3 里 cTextTag 的 13px 画法同口径：文字宽 + 衬底 6） */
function s3RootSpan(ctx, g, rt) {
  ctx.font = '13px system-ui, sans-serif';
  const w = ctx.measureText(fmtRoot(rt)).width + 6;
  const px = g.X(rt.val);
  return [px - w / 2, px + w / 2];
}
/* 「地面」标签选位：与交点标签同在轴线上一行，优先右端、次左端，两端都被占时用短标签居中
   （390 宽下右端曾与 ≈2.4 交点标签轻微相压，见评审 S4） */
function drawGroundLabel(ctx, g, inter) {
  const y = g.Y(0) - 12;
  const spans = inter.roots.map(rt => s3RootSpan(ctx, g, rt));
  const blocked = s => spans.some(r => s[0] < r[1] && r[0] < s[1]);
  ctx.font = '12px system-ui, sans-serif';
  const full = t('cGround');
  const fw = ctx.measureText(full).width + 6;
  const right = [g.ox + g.pw - 20 - fw, g.ox + g.pw - 20];
  const left = [g.ox + 6, g.ox + 6 + fw];
  if (!blocked(right)) { cTextTag(ctx, full, right[1], y, COL.mut, 'right', 12); return; }
  if (!blocked(left)) { cTextTag(ctx, full, left[0], y, COL.mut, 'left', 12); return; }
  const short = t('cGroundS');
  const sw = ctx.measureText(short).width + 6;
  const cx = g.ox + g.pw / 2;
  if (!blocked([cx - sw / 2, cx + sw / 2])) { cTextTag(ctx, short, cx, y, COL.mut, 'center', 12); return; }
  cTextTag(ctx, short, right[1], y - 20, COL.mut, 'right', 12);
}
function drawS3() {
  const cv = regCanvas('s3-canvas');
  const ctx = fitCanvas(cv);
  const g = plotGeom(cv, [-7.5, 7.5], [-6.5, 6.5], true);
  PARABOLA.geoms.s3 = g;
  ctx.clearRect(0, 0, cv._w, cv._h);
  drawGrid(ctx, g, { gx: 1, gy: 1, lx: 1, ly: 1 });
  /* 交点先算：地面标签选位要避开交点标签 */
  const inter = xIntercepts(rat(S3.a, 1), S3.h, S3.k);
  /* 地面（x 轴）加重 + 标注 */
  ctx.strokeStyle = COL.ink; ctx.lineWidth = 2.2;
  ctx.beginPath(); ctx.moveTo(g.ox, g.Y(0)); ctx.lineTo(g.ox + g.pw, g.Y(0)); ctx.stroke();
  drawGroundLabel(ctx, g, inter);
  drawCurve(ctx, g, x => S3.a * (x - S3.h) * (x - S3.h) + S3.k, COL.cyan, 2.5);
  /* 交点 */
  inter.roots.forEach(rt => {
    const px = g.X(rt.val), py = g.Y(0);
    drawDot(ctx, px, py, COL.green, 6);
    cTextTag(ctx, fmtRoot(rt), px, py - 15, COL.green, 'center', 13);
  });
  /* 顶点 */
  drawDot(ctx, g.X(S3.h), g.Y(S3.k), COL.orange, 5);
  cTextTag(ctx, t('cVertex') + ' (' + fmtInt(S3.h) + ', ' + fmtInt(S3.k) + ')',
    g.X(S3.h) + 9, g.Y(S3.k) + (S3.a > 0 ? 13 : -13), COL.orange, 'left', 12.5);
  /* 探针 */
  if (S3.probe !== null) {
    const x = S3.probe;
    const y = vertexYAt(rat(S3.a, 1), S3.h, S3.k, x).n;
    const px = g.X(x), py = g.Y(y);
    ctx.strokeStyle = COL.orange; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(px, g.Y(0)); ctx.lineTo(px, py); ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(px, py, 10, 0, Math.PI * 2);
    ctx.lineWidth = 2; ctx.strokeStyle = COL.orange; ctx.stroke();
    drawDot(ctx, px, py, COL.orange, 5.5);
    cTextTag(ctx, '(' + fmtInt(x) + ', ' + fmtInt(y) + ')', px + 12, py - 12, COL.orange, 'left', 13);
  }
}
function renderS3() {
  $('s3-a-up').classList.toggle('active', S3.a === 1);
  $('s3-a-down').classList.toggle('active', S3.a === -1);
  $('s3-h-val').textContent = 'h = ' + fmtInt(S3.h);
  $('s3-k-val').textContent = 'k = ' + fmtInt(S3.k);
  $('s3-eq').textContent = fmtVertex(rat(S3.a, 1), S3.h, S3.k);
  drawS3();
  const inter = xIntercepts(rat(S3.a, 1), S3.h, S3.k);
  if (inter.count === 2) {
    setRO('s3-ro', t('s3roTwo', { x1: fmtRoot(inter.roots[0]), x2: fmtRoot(inter.roots[1]) }));
  } else if (inter.count === 1) {
    setRO('s3-ro', t('s3roOne', { x: fmtRoot(inter.roots[0]) }));
  } else {
    setRO('s3-ro', S3.a > 0 ? t('s3roNoneAbove') : t('s3roNoneBelow'));
  }
  if (S3.probe === null) setRO('s3-probe', t('s3probeIdle'));
  else {
    const y = vertexYAt(rat(S3.a, 1), S3.h, S3.k, S3.probe);
    const tail = y.n === 0 ? t('s3tailZero') : y.n > 0 ? t('s3tailPos') : t('s3tailNeg');
    setRO('s3-probe', t('s3probe', { x: fmtInt(S3.probe), y: fmtRat(y), tail: tail }));
  }
}

/* ============================================================
   第 4 步 · 题 1：看图选式子
   ============================================================ */
const Q1 = { picked: [], done: false };
PARABOLA.state.q1 = Q1;
const Q1OPTS = [
  { a: rat(1, 1), h: 2, k: 1 },
  { a: rat(-1, 1), h: 2, k: 1 },
  { a: rat(-1, 1), h: -2, k: 1 }
];
const Q1ANSWER = 1;
function drawQ1() {
  const cv = regCanvas('s4q1-canvas');
  const ctx = fitCanvas(cv);
  const g = plotGeom(cv, [-5.5, 5.5], [-6.5, 6.5], true);
  PARABOLA.geoms.q1 = g;
  ctx.clearRect(0, 0, cv._w, cv._h);
  drawGrid(ctx, g, { gx: 1, gy: 1, lx: 1, ly: 1 });
  drawCurve(ctx, g, x => -((x - 2) * (x - 2)) + 1, COL.cyan, 2.5);
  drawDot(ctx, g.X(1), g.Y(0), COL.green, 4.5);
  drawDot(ctx, g.X(3), g.Y(0), COL.green, 4.5);
  drawDot(ctx, g.X(2), g.Y(1), COL.orange, 6);
  cTextTag(ctx, t('cVertex') + ' (2, 1)', g.X(2) + 10, g.Y(1) - 12, COL.orange, 'left', 13);
}
function renderQ1() {
  drawQ1();
  Q1OPTS.forEach((o, i) => {
    const btn = $('s4q1-o' + i);
    btn.textContent = fmtVertex(o.a, o.h, o.k);
    btn.classList.toggle('correct', Q1.done && i === Q1ANSWER);
    btn.classList.toggle('wrong', Q1.picked.includes(i));
    btn.disabled = Q1.done || Q1.picked.includes(i);
  });
  if (Q1.done) setRO('s4q1-ro', t('q1ok'));
  else if (Q1.picked.length) setRO('s4q1-ro', t('q1no'));
  else setRO('s4q1-ro', '');
}

/* ============================================================
   第 4 步 · 题 2：把弧线摆出来（目标顶点 (−1, 3)、开口向下）
   ============================================================ */
const Q2 = { a: 1, h: 0, k: 0 };
PARABOLA.state.q2 = Q2;
const Q2TARGET = { a: -1, h: -1, k: 3 };
function q2Matched() { return Q2.a === Q2TARGET.a && Q2.h === Q2TARGET.h && Q2.k === Q2TARGET.k; }
/* 未命中时按第一个不符的量（a 符号 → h → k）选诊断提示；判定本身仍只看 q2Matched */
function q2HintKey() {
  if (Q2.a !== Q2TARGET.a) return 'q2hintA';
  if (Q2.h !== Q2TARGET.h) return 'q2hintH';
  return 'q2hintK';
}
function drawQ2() {
  const cv = regCanvas('s4q2-canvas');
  const ctx = fitCanvas(cv);
  const g = plotGeom(cv, [-8.5, 8.5], [-8.5, 8.5], true);
  PARABOLA.geoms.q2 = g;
  ctx.clearRect(0, 0, cv._w, cv._h);
  drawGrid(ctx, g, { gx: 1, gy: 1, lx: 1, ly: 1 });
  drawCurve(ctx, g, x => Q2TARGET.a * (x - Q2TARGET.h) * (x - Q2TARGET.h) + Q2TARGET.k, COL.orange, 2.5, [7, 5]);
  drawCurve(ctx, g, x => Q2.a * (x - Q2.h) * (x - Q2.h) + Q2.k, q2Matched() ? COL.green : COL.cyan, 2.5);
  drawDot(ctx, g.X(Q2TARGET.h), g.Y(Q2TARGET.k), COL.orange, 5);
  cTextTag(ctx, t('cVertex') + ' (−1, 3)', g.X(Q2TARGET.h) - 10, g.Y(Q2TARGET.k) - 12, COL.orange, 'right', 12.5);
}
function renderQ2() {
  $('s4q2-a-up').classList.toggle('active', Q2.a === 1);
  $('s4q2-a-down').classList.toggle('active', Q2.a === -1);
  $('s4q2-h-val').textContent = 'h = ' + fmtInt(Q2.h);
  $('s4q2-k-val').textContent = 'k = ' + fmtInt(Q2.k);
  drawQ2();
  setRO('s4q2-cur', t('q2cur', { eq: fmtVertex(rat(Q2.a, 1), Q2.h, Q2.k) }));
  setRO('s4q2-ro', q2Matched() ? t('q2ok') : t(q2HintKey()));
}

/* ============================================================
   第 4 步 · 题 3：投篮读图（探针答题）
   ============================================================ */
const Q3 = { mode: 'a', sel: null };
PARABOLA.state.q3 = Q3;
function drawQ3() {
  const cv = regCanvas('s4q3-canvas');
  const ctx = fitCanvas(cv);
  const g = plotGeom(cv, [-0.6, 9.2], [-1.2, 9.8], false);
  PARABOLA.geoms.q3 = g;
  ctx.clearRect(0, 0, cv._w, cv._h);
  drawGrid(ctx, g, { gx: 1, gy: 1, lx: 1, ly: 1, xName: t('cDist'), yName: t('cHeight') });
  drawCurve(ctx, g, x => -0.5 * (x - 4) * (x - 4) + 8, 'rgba(110,231,255,.5)', 2);
  for (let x = 0; x <= 8; x++) {
    const y = q3Y(x).n / q3Y(x).d;
    const px = g.X(x), py = g.Y(y);
    const sel = Q3.sel === x;
    if (sel) {
      ctx.beginPath(); ctx.arc(px, py, 11, 0, Math.PI * 2);
      ctx.lineWidth = 2; ctx.strokeStyle = COL.orange; ctx.stroke();
    }
    drawDot(ctx, px, py, sel ? COL.orange : COL.cyan, 6);
    cText(ctx, fmtDec(q3Y(x)), px, py - 15, sel ? COL.orange : COL.mut, 'center', 12);
  }
  /* 顶点标记 */
  cTextTag(ctx, t('cVertex') + ' (4, 8)', g.X(4), g.Y(8) - 26, COL.orange, 'center', 12);
}
function renderQ3() {
  drawQ3();
  $('s4q3-ma').classList.toggle('active', Q3.mode === 'a');
  $('s4q3-mb').classList.toggle('active', Q3.mode === 'b');
  let html;
  if (Q3.mode === 'a') {
    if (Q3.sel === null) html = t('q3aIdle');
    else if (Q3.sel === 4) html = t('q3aOk');
    else html = t('q3aWrong', { x: Q3.sel, y: fmtDec(q3Y(Q3.sel)) });
  } else {
    if (Q3.sel === null) html = t('q3bIdle');
    else if (Q3.sel === 8) html = t('q3bOk');
    else if (Q3.sel === 0) html = t('q3bStart');
    else html = t('q3bWrong', { x: Q3.sel, y: fmtDec(q3Y(Q3.sel)) });
  }
  setRO('s4q3-ro', html);
}

/* ---------- 画布探针（点击 + 拖动） ---------- */
function canvasPos(cv, ev) {
  const r = cv.getBoundingClientRect();
  return { x: ev.clientX - r.left, y: ev.clientY - r.top };
}
function s3ProbeFromEvent(cv, ev) {
  const g = PARABOLA.geoms.s3;
  if (!g) return;
  const pos = canvasPos(cv, ev);
  const x = clamp(Math.round(g.toDataX(pos.x)), -6, 6);
  const y = vertexYAt(rat(S3.a, 1), S3.h, S3.k, x).n;
  const d = Math.hypot(g.X(x) - pos.x, g.Y(y) - pos.y);
  if (d <= 64) { S3.probe = x; renderS3(); }
}
function bindProbes() {
  const cv3 = $('s3-canvas');
  cv3.classList.add('dragc');
  let dragging = false;
  cv3.addEventListener('pointerdown', ev => { dragging = true; try { cv3.setPointerCapture(ev.pointerId); } catch (e) {} s3ProbeFromEvent(cv3, ev); });
  cv3.addEventListener('pointermove', ev => { if (dragging) s3ProbeFromEvent(cv3, ev); });
  cv3.addEventListener('pointerup', () => { dragging = false; });
  cv3.addEventListener('pointercancel', () => { dragging = false; });
  const cvq = $('s4q3-canvas');
  cvq.classList.add('clickc');
  cvq.addEventListener('click', ev => {
    const g = PARABOLA.geoms.q3;
    if (!g) return;
    const pos = canvasPos(cvq, ev);
    let best = null, bd = 1e9;
    for (let x = 0; x <= 8; x++) {
      const y = q3Y(x).n / q3Y(x).d;
      const d = Math.hypot(g.X(x) - pos.x, g.Y(y) - pos.y);
      if (d < bd) { bd = d; best = x; }
    }
    if (best !== null && bd <= 48) { Q3.sel = best; renderQ3(); }
  });
}

/* ---------- 初始化 ---------- */
function renderAll() {
  renderS0();
  renderS1();
  renderS2();
  renderS3();
  renderQ1();
  renderQ2();
  renderQ3();
}
function init() {
  ['s0-canvas', 's1-canvas', 's2-canvas', 's3-canvas', 's4q1-canvas', 's4q2-canvas', 's4q3-canvas'].forEach(regCanvas);
  /* 第 0 步 */
  $('s0-play').addEventListener('click', s0TogglePlay);
  $('s0-mode-t').addEventListener('click', () => {
    if (S0.mode === 't') return;
    s0StopAnim(); S0.mode = 't'; S0.shown = 14; renderS0();
  });
  $('s0-mode-d').addEventListener('click', () => {
    if (S0.mode === 'd') return;
    s0StopAnim(); S0.mode = 'd'; S0.shown = 14; renderS0();
  });
  $('s0-start').addEventListener('click', () => {
    document.getElementById('step1').scrollIntoView({ behavior: 'smooth' });
  });
  /* 第 1 步 */
  $('s1-a').addEventListener('input', e => {
    S1.ai = parseInt(e.target.value, 10);
    S1.zero = false;
    renderS1();
  });
  $('s1-zero').addEventListener('click', () => { S1.zero = !S1.zero; renderS1(); });
  /* 第 2 步 */
  $('s2-a-up').addEventListener('click', () => { S2.a = 1; renderS2(); });
  $('s2-a-down').addEventListener('click', () => { S2.a = -1; renderS2(); });
  $('s2-h').addEventListener('input', e => { S2.h = parseInt(e.target.value, 10); renderS2(); });
  $('s2-k').addEventListener('input', e => { S2.k = parseInt(e.target.value, 10); renderS2(); });
  /* 第 3 步 */
  $('s3-a-up').addEventListener('click', () => { S3.a = 1; S3.probe = null; renderS3(); });
  $('s3-a-down').addEventListener('click', () => { S3.a = -1; S3.probe = null; renderS3(); });
  $('s3-h').addEventListener('input', e => { S3.h = parseInt(e.target.value, 10); renderS3(); });
  $('s3-k').addEventListener('input', e => { S3.k = parseInt(e.target.value, 10); renderS3(); });
  /* 第 4 步 */
  Q1OPTS.forEach((o, i) => {
    $('s4q1-o' + i).addEventListener('click', () => {
      if (Q1.done || Q1.picked.includes(i)) return;
      if (i === Q1ANSWER) Q1.done = true;
      else Q1.picked.push(i);
      renderQ1();
    });
  });
  $('s4q2-a-up').addEventListener('click', () => { Q2.a = 1; renderQ2(); });
  $('s4q2-a-down').addEventListener('click', () => { Q2.a = -1; renderQ2(); });
  $('s4q2-h').addEventListener('input', e => { Q2.h = parseInt(e.target.value, 10); renderQ2(); });
  $('s4q2-k').addEventListener('input', e => { Q2.k = parseInt(e.target.value, 10); renderQ2(); });
  $('s4q3-ma').addEventListener('click', () => { Q3.mode = 'a'; renderQ3(); });
  $('s4q3-mb').addEventListener('click', () => { Q3.mode = 'b'; renderQ3(); });
  bindProbes();
  renderAll();
  onLangRefresh(renderAll);
  onRefit(renderAll);
}
document.addEventListener('DOMContentLoaded', init);
