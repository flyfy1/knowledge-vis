'use strict';
/* 分数 · 把整体切开来数 — 全部逻辑（无依赖，原生 Canvas 2D）
   依赖 i18n.js 先行加载：t() / getLang() / onLangRefresh()。

   ★ 红线落点：
   1. 分数全程整数对 (n, d) 精确运算：gcd/lcm 真算（欧几里得），
      加减乘除与比较一律交叉相乘整数判定，不走浮点冒充。
   2. 条/轴的像素由 boundaries() 按整体宽度逐界取整：等份误差 ≤1px，
      等值演示同比例尺同几何，叠合与对齐由构造保证。
   3. 小数读数：decimalInfo 按长除法判有限/循环，循环者一律 ≈ + …，
      有限者才用 =。
   4. 比大小双通道（交叉相乘 / 通分计数）由同一份整数算出，结论恒一致。
   5. 加法反例的差距按真值 (5/6 − 2/5 = 13/30) 绘制。
   对账入口：window.FRACTIONS（ops / state / pixels / set）。 */
const $ = id => document.getElementById(id);
let NOW = 0;

/* ---------- 精确有理数（整数对） ---------- */
function igcd(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { const r = a % b; a = b; b = r; }
  return a;
}
function ilcm(a, b) { return a / igcd(a, b) * b; }
function mkFrac(n, d) {
  if (d < 0) { n = -n; d = -d; }
  const g = igcd(n, d) || 1;
  return { n: n / g, d: d / g };
}
function fAdd(f, g) { return mkFrac(f.n * g.d + g.n * f.d, f.d * g.d); }
function fSub(f, g) { return mkFrac(f.n * g.d - g.n * f.d, f.d * g.d); }
function fMulInt(f, k) { return mkFrac(f.n * k, f.d); }
function fCmp(f, g) { const l = f.n * g.d, r = g.n * f.d; return l < r ? -1 : l > r ? 1 : 0; }
function fEq(f, g) { return f.n * g.d === g.n * f.d; }
function fStr(f) { return f.n + '/' + f.d; }
/* 约分链：每一步除以 gcd 的最小素因子，直到互质 */
function smallestPrimeFactor(x) {
  for (let p = 2; p * p <= x; p++) if (x % p === 0) return p;
  return x;
}
function reduceChain(n, d) {
  const chain = [{ n, d, by: 0 }];
  let a = n, b = d;
  while (igcd(a, b) > 1) {
    const p = smallestPrimeFactor(igcd(a, b));
    a /= p; b /= p;
    chain.push({ n: a, d: b, by: p });
  }
  return chain;
}
/* 长除法判小数：{exact:true,text} 或 {exact:false,intPart,pre,rep} */
function decimalInfo(n, d) {
  const f = mkFrac(n, d);
  n = f.n; d = f.d;
  const intPart = Math.floor(n / d);
  let rem = n % d;
  if (rem === 0) return { exact: true, text: String(intPart) };
  const digits = [], seen = new Map();
  while (rem !== 0 && !seen.has(rem) && digits.length < 60) {
    seen.set(rem, digits.length);
    rem *= 10;
    digits.push(Math.floor(rem / d));
    rem %= d;
  }
  if (rem === 0) return { exact: true, text: intPart + '.' + digits.join('') };
  const start = seen.get(rem);
  return {
    exact: false, intPart: String(intPart),
    pre: digits.slice(0, start).join(''), rep: digits.slice(start).join('')
  };
}
function decDisplay(info) {
  if (info.exact) return info.text;
  let tail = info.pre + info.rep;
  while (tail.length < 4) tail += info.rep;
  return info.intPart + '.' + tail.slice(0, 7) + '…';
}

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
function ease(t) { return 1 - Math.pow(1 - t, 3); }
/* 量宽绘制：文字超宽时逐级缩字号（最低 9px），保证不溢出给定宽度 */
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
/* 堆叠分数（分子 / 横线 / 分母），以 (cx, cy) 为中心，总高 h；返回宽度 */
function drawFrac(ctx, n, d, cx, cy, h, color) {
  const size = h * 0.40;
  ctx.font = '700 ' + size + 'px system-ui, sans-serif';
  const wn = ctx.measureText(String(n)).width;
  const wd = ctx.measureText(String(d)).width;
  const w = Math.max(wn, wd) + 9;
  ctx.strokeStyle = color; ctx.lineWidth = Math.max(1.3, h * 0.045);
  ctx.beginPath(); ctx.moveTo(cx - w / 2, cy); ctx.lineTo(cx + w / 2, cy); ctx.stroke();
  ctx.fillStyle = color; ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom'; ctx.fillText(String(n), cx, cy - h * 0.07);
  ctx.textBaseline = 'top'; ctx.fillText(String(d), cx, cy + h * 0.07);
  ctx.textBaseline = 'alphabetic';
  return w;
}

/* 只量不画：堆叠分数的宽度 */
function fracWidth(n, d, h) {
  const size = h * 0.40;
  const cv = document.createElement('canvas').getContext('2d');
  cv.font = '700 ' + size + 'px system-ui, sans-serif';
  return Math.max(cv.measureText(String(n)).width, cv.measureText(String(d)).width) + 9;
}

/* ---------- 条形图原语：等份边界逐界取整 ---------- */
function boundaries(x, w, den) {
  const b = [];
  for (let i = 0; i <= den; i++) b.push(Math.round(x + w * i / den));
  return b;
}
const COL = {
  orange: '#ffb454', cyan: '#6ee7ff', green: '#7ee2a8', red: '#ff7a93',
  ink: '#e8edf4', mut: '#9aa7b8', grid: '#39465e', rest: '#1e2735', edge: '#8494ab'
};
/* 画一条等分条。o: {takenColor, restColor, cellColors:{i:color}, hatched:Set(i), ghostGrid:{den,alpha}} */
function drawBar(ctx, x, y, w, h, den, taken, o) {
  o = o || {};
  const b = boundaries(x, w, den);
  for (let i = 0; i < den; i++) {
    let fill = i < taken ? (o.takenColor || COL.orange) : (o.restColor || COL.rest);
    if (o.cellColors && o.cellColors[i]) fill = o.cellColors[i];
    ctx.fillStyle = fill;
    ctx.fillRect(b[i], y, b[i + 1] - b[i], h);
    if (o.hatched && o.hatched.has(i)) {
      ctx.strokeStyle = 'rgba(13,17,23,.75)'; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(b[i] + 2, y + 2); ctx.lineTo(b[i + 1] - 2, y + h - 2);
      ctx.moveTo(b[i + 1] - 2, y + 2); ctx.lineTo(b[i] + 2, y + h - 2);
      ctx.stroke();
    }
  }
  if (o.ghostGrid) {
    const gb = boundaries(x, w, o.ghostGrid.den);
    ctx.strokeStyle = 'rgba(232,237,244,' + o.ghostGrid.alpha + ')';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let i = 1; i < gb.length - 1; i++) { ctx.moveTo(gb[i], y); ctx.lineTo(gb[i], y + h); }
    ctx.stroke();
  }
  ctx.strokeStyle = o.gridColor || COL.grid; ctx.lineWidth = 1.4;
  ctx.beginPath();
  for (let i = 1; i < den; i++) { ctx.moveTo(b[i], y); ctx.lineTo(b[i], y + h); }
  ctx.stroke();
  ctx.strokeStyle = COL.edge; ctx.lineWidth = 1.6;
  ctx.strokeRect(x, y, w, h);
  return b;
}

/* ---------- 对账状态 ---------- */
const FRACTIONS = {
  ops: {
    gcd: igcd, lcm: ilcm, frac: mkFrac, add: fAdd, sub: fSub, mulInt: fMulInt,
    cmp: fCmp, eq: fEq, reduceChain, decimalInfo, decDisplay
  },
  state: {},
  pixels: {}
};
window.FRACTIONS = FRACTIONS;

/* ============================================================
   第 0 步：钩子——一块巧克力，两种切法（1/2 与 2/4 叠合）
   ============================================================ */
const S0 = { guess: null, revealed: false, revealStart: 0 };
FRACTIONS.state.s0 = S0;
function s0Geom(cv) {
  const W = cv._w;
  const x = 30, w = W - 60;
  return { x, w, y1: 56, y2: 168, h: 56 };
}
function s0Draw() {
  const cv = $('s0-canvas'); if (!cv) return;
  const ctx = fitCanvas(cv);
  const W = cv._w, H = cv._h;
  if (W < 10) return;
  ctx.clearRect(0, 0, W, H);
  const g = s0Geom(cv);
  const choc = { takenColor: '#eda93f', restColor: '#5d3a1a', gridColor: '#2a1a0c' };
  fitText(ctx, t('cLeft'), g.x, 38, g.w, { size: 14, color: COL.mut });
  const b1 = drawBar(ctx, g.x, g.y1, g.w, g.h, 2, 1, choc);
  drawFrac(ctx, 1, 2, g.x + (b1[1] - g.x) / 2, g.y1 + g.h + 26, 30, COL.ink);
  fitText(ctx, t('cRight'), g.x, 150, g.w, { size: 14, color: COL.mut });
  const b2 = drawBar(ctx, g.x, g.y2, g.w, g.h, 4, 2, choc);
  drawFrac(ctx, 2, 4, g.x + (b2[2] - g.x) / 2, g.y2 + g.h + 26, 30, COL.ink);
  FRACTIONS.pixels.s0 = {
    unit: g.w, leftTakenPx: b1[1] - g.x, rightTakenPx: b2[2] - g.x,
    leftBounds: b1, rightBounds: b2
  };
  if (S0.revealed) {
    const t01 = clamp((NOW - S0.revealStart) / 900, 0, 1);
    const yy = g.y2 + (g.y1 - g.y2) * ease(t01);
    /* 右边取走的那块，整体上移叠到左边 */
    ctx.fillStyle = 'rgba(237,169,63,.55)';
    ctx.fillRect(g.x, yy, b2[2] - g.x, g.h);
    ctx.strokeStyle = COL.green; ctx.lineWidth = 2.4;
    ctx.strokeRect(g.x, yy, b2[2] - g.x, g.h);
    ctx.strokeStyle = 'rgba(126,226,168,.8)'; ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(b2[1], yy); ctx.lineTo(b2[1], yy + g.h);
    ctx.stroke();
    if (t01 >= 1) {
      fitText(ctx, t('cSame'), W / 2, g.y1 - 14, W - 20, { size: 16, weight: '700', color: COL.green, align: 'center' });
    }
  }
}
function s0Readout() {
  if (S0.revealed) {
    setRO('s0-readout', S0.guess === 'same' ? t('s0roWin') : S0.guess ? t('s0roLose') : t('s0roReveal'));
  } else if (S0.guess) {
    setRO('s0-readout', t('s0roGuess', { g: t('s0guess' + (S0.guess === 'left' ? 'Left' : S0.guess === 'right' ? 'Right' : 'Same')) }));
  } else {
    setRO('s0-readout', t('s0roIdle'));
  }
}
function initS0() {
  regCanvas('s0-canvas');
  const pick = g => {
    S0.guess = g;
    ['left', 'same', 'right'].forEach(k => $('s0-g-' + k).classList.toggle('active', k === g));
    s0Readout();
  };
  $('s0-g-left').addEventListener('click', () => pick('left'));
  $('s0-g-same').addEventListener('click', () => pick('same'));
  $('s0-g-right').addEventListener('click', () => pick('right'));
  $('s0-reveal').addEventListener('click', () => {
    if (!S0.revealed) { S0.revealed = true; S0.revealStart = NOW; }
    s0Readout();
  });
  $('s0-start').addEventListener('click', () => {
    document.getElementById('step1').scrollIntoView({ behavior: 'smooth' });
  });
  animate($('step0'), () => s0Draw());
  onLangRefresh(() => { s0Readout(); s0Draw(); });
  onRefit(s0Draw);
  s0Readout(); s0Draw();
}

/* ============================================================
   第 1 步：分数是一个数（切分滑杆 + 点选取份 + 0–1 定位）
   ============================================================ */
const S1 = { den: 4, take: 3 };
FRACTIONS.state.s1 = S1;
function s1Geom(cv) {
  const W = cv._w;
  return { x: 28, w: W - 56, barY: 66, barH: 74, lineY: 216 };
}
function s1Draw() {
  const cv = $('s1-canvas'); if (!cv) return;
  const ctx = fitCanvas(cv);
  const W = cv._w;
  if (W < 10) return;
  ctx.clearRect(0, 0, W, cv._h);
  const g = s1Geom(cv);
  fitText(ctx, t('cOne'), g.x + g.w, 30, g.w, { size: 13.5, color: COL.mut, align: 'right' });
  drawFrac(ctx, S1.take, S1.den, g.x + 20, 32, 34, COL.orange);
  const b = drawBar(ctx, g.x, g.barY, g.w, g.barH, S1.den, S1.take, {});
  /* 0–1 细数轴：与条同宽同起点，标记恰落在已取部分的右端 */
  fitText(ctx, t('cPos'), g.x, g.lineY - 26, g.w, { size: 13.5, color: COL.mut });
  ctx.strokeStyle = COL.edge; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(g.x, g.lineY); ctx.lineTo(g.x + g.w, g.lineY); ctx.stroke();
  for (const fx of [0, 1]) {
    const tx = g.x + fx * g.w;
    ctx.beginPath(); ctx.moveTo(tx, g.lineY - 6); ctx.lineTo(tx, g.lineY + 6); ctx.stroke();
    ctx.fillStyle = COL.mut; ctx.font = '13px system-ui, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(String(fx), tx, g.lineY + 24);
  }
  const mx = b[S1.take];
  ctx.strokeStyle = COL.orange; ctx.lineWidth = 1.4; ctx.setLineDash([4, 4]);
  ctx.beginPath(); ctx.moveTo(mx, g.barY + g.barH); ctx.lineTo(mx, g.lineY); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = COL.orange;
  ctx.beginPath();
  ctx.moveTo(mx, g.lineY + 1); ctx.lineTo(mx - 7, g.lineY - 9); ctx.lineTo(mx + 7, g.lineY - 9);
  ctx.closePath(); ctx.fill();
  drawFrac(ctx, S1.take, S1.den, clamp(mx, g.x + 22, g.x + g.w - 22), g.lineY + 52, 32, COL.orange);
  FRACTIONS.pixels.s1 = { unit: g.w, bounds: b, markerX: mx, lineX0: g.x, lineX1: g.x + g.w };
  /* 读数 */
  if (S1.take === 0) setRO('s1-readout', t('s1roZero', { b: S1.den }));
  else if (S1.take === S1.den) setRO('s1-readout', t('s1roFull', { b: S1.den }));
  else setRO('s1-readout', t('s1ro', { a: S1.take, b: S1.den }));
  const info = decimalInfo(S1.take, S1.den);
  const fs = S1.take + '/' + S1.den;
  setRO('s1-dec', info.exact
    ? t('s1decEq', { f: fs, dec: info.text })
    : t('s1decAp', { f: fs, dec: decDisplay(info) }));
}
function s1Set(den, take) {
  S1.den = clamp(den, 2, 12);
  S1.take = clamp(take, 0, S1.den);
  $('s1-den').value = String(S1.den);
  $('s1-den-val').textContent = String(S1.den);
  s1Draw();
}
function initS1() {
  const cv = regCanvas('s1-canvas');
  $('s1-den').addEventListener('input', e => s1Set(+e.target.value, Math.min(S1.take, +e.target.value)));
  $('s1-minus').addEventListener('click', () => s1Set(S1.den, S1.take - 1));
  $('s1-plus').addEventListener('click', () => s1Set(S1.den, S1.take + 1));
  $('s1-clear').addEventListener('click', () => s1Set(S1.den, 0));
  $('s1-full').addEventListener('click', () => s1Set(S1.den, S1.den));
  cv.addEventListener('click', e => {
    const r = cv.getBoundingClientRect();
    const px = e.clientX - r.left, py = e.clientY - r.top;
    const g = s1Geom(cv);
    if (py < g.barY - 6 || py > g.barY + g.barH + 6 || px < g.x - 4 || px > g.x + g.w + 4) return;
    const b = boundaries(g.x, g.w, S1.den);
    for (let i = 0; i < S1.den; i++) {
      if (px >= b[i] && px < b[i + 1]) {
        s1Set(S1.den, i === S1.take - 1 ? i : i + 1);
        return;
      }
    }
  });
  onLangRefresh(s1Draw);
  onRefit(s1Draw);
  s1Draw();
}

/* ============================================================
   第 2 步：等值分数（三行对照 / 扩分 / 约分链）
   ============================================================ */
const S2 = {
  exp: { n: 1, d: 2 }, expPrev: null, expStart: 0,
  chain: reduceChain(12, 18), redShown: 1, viaGcd: false,
  expRo: null, roSide: 'red'
};
FRACTIONS.state.s2 = S2;
function s2Draw() {
  const cv = $('s2-canvas'); if (!cv) return;
  const ctx = fitCanvas(cv);
  const W = cv._w;
  if (W < 10) return;
  ctx.clearRect(0, 0, W, cv._h);
  const x = 82, w = W - 108;
  /* 三行对照 */
  fitText(ctx, t('cRows'), x, 24, w, { size: 13.5, color: COL.mut });
  const rows = [[1, 2], [2, 4], [4, 8]];
  const alignX = x + Math.round(w / 2);
  rows.forEach((r, i) => {
    const y = 40 + i * 54;
    drawBar(ctx, x, y, w, 40, r[1], r[0], {});
    drawFrac(ctx, r[0], r[1], 40, y + 20, 32, COL.ink);
  });
  ctx.strokeStyle = COL.green; ctx.lineWidth = 1.6; ctx.setLineDash([5, 4]);
  ctx.beginPath(); ctx.moveTo(alignX, 32); ctx.lineTo(alignX, 40 + 2 * 54 + 48); ctx.stroke();
  ctx.setLineDash([]);
  /* 扩分演示条 */
  const ey = 224;
  fitText(ctx, t('cExp'), x, ey - 8, w, { size: 13.5, color: COL.mut });
  const animating = S2.expPrev && (NOW - S2.expStart) / 650 < 1;
  const ghost = animating
    ? { den: S2.expPrev, alpha: 0.55 * (1 - (NOW - S2.expStart) / 650) }
    : null;
  drawBar(ctx, x, ey, w, 46, S2.exp.d, S2.exp.n, { ghostGrid: ghost });
  drawFrac(ctx, S2.exp.n, S2.exp.d, 40, ey + 23, 34, COL.orange);
  /* 约分链 */
  const cy = 330;
  fitText(ctx, t('cRed'), x, cy - 12, w, { size: 13.5, color: COL.mut });
  const shown = S2.viaGcd ? [S2.chain[0], S2.chain[S2.chain.length - 1]] : S2.chain.slice(0, S2.redShown);
  const chipH = 44, arrowW = 52;
  const fw = fracWidth(12, 18, chipH);
  const totalW = shown.length * (fw + 6) + (shown.length - 1) * arrowW;
  let cxp = Math.max(x, x + (w - totalW) / 2);
  shown.forEach((it, i) => {
    const ccx = cxp + (fw + 6) / 2;
    drawFrac(ctx, it.n, it.d, ccx, cy + 26, chipH, i === shown.length - 1 && shown.length > 1 ? COL.green : COL.ink);
    cxp += fw + 6;
    if (i < shown.length - 1) {
      const div = S2.viaGcd ? igcd(12, 18) : shown[i + 1].by;
      ctx.strokeStyle = COL.mut; ctx.lineWidth = 1.8;
      const ax0 = cxp + 4, ax1 = cxp + arrowW - 4, ay = cy + 26;
      ctx.beginPath(); ctx.moveTo(ax0, ay); ctx.lineTo(ax1, ay); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ax1, ay); ctx.lineTo(ax1 - 7, ay - 4.5); ctx.lineTo(ax1 - 7, ay + 4.5); ctx.closePath();
      ctx.fillStyle = COL.mut; ctx.fill();
      fitText(ctx, '÷' + div, (ax0 + ax1) / 2, ay - 10, arrowW, { size: 14, weight: '700', color: COL.orange, align: 'center' });
      cxp += arrowW;
    }
  });
  FRACTIONS.pixels.s2 = { unit: w, alignX, chainLast: S2.chain[S2.chain.length - 1] };
}
/* 约分侧按当前状态推导读数（初始态返回 null）；扩分侧的读数存在 S2.expRo。
   共用读数行由 S2.roSide 标明归属，s2Readouts 是状态的纯渲染——
   任一侧重置后读数自动回落到另一侧仍有效的消息，两侧都初始则回到初始态（空）。 */
function s2RedRo() {
  if (S2.viaGcd || S2.redShown >= S2.chain.length) return { key: 's2roRedDone', params: {} };
  if (S2.redShown > 1) {
    const prev = S2.chain[S2.redShown - 2], cur = S2.chain[S2.redShown - 1];
    return { key: 's2roRed', params: { f0: prev.n + '/' + prev.d, p: cur.by, f1: cur.n + '/' + cur.d } };
  }
  return null;
}
function s2Readouts() {
  setRO('s2-gcd', t('s2gcd', { g: igcd(12, 18) }));
  const ro = S2.roSide === 'exp' ? S2.expRo : s2RedRo();
  setRO('s2-readout', ro ? t(ro.key, ro.params) : '');
}
function s2Multiply(k) {
  const nd = S2.exp.d * k;
  S2.roSide = 'exp';
  if (nd > 72) { S2.expRo = { key: 's2roExpMax', params: { d: S2.exp.d } }; s2Readouts(); return; }
  const f0 = S2.exp.n + '/' + S2.exp.d;
  S2.expPrev = S2.exp.d;
  S2.exp = { n: S2.exp.n * k, d: nd };
  S2.expStart = NOW;
  S2.expRo = { key: 's2roExp', params: { f0, k, f1: S2.exp.n + '/' + S2.exp.d } };
  s2Readouts();
  s2Draw();
}
function initS2() {
  regCanvas('s2-canvas');
  $('s2-mul2').addEventListener('click', () => s2Multiply(2));
  $('s2-mul3').addEventListener('click', () => s2Multiply(3));
  $('s2-mul4').addEventListener('click', () => s2Multiply(4));
  $('s2-exp-reset').addEventListener('click', () => {
    S2.exp = { n: 1, d: 2 }; S2.expPrev = null; S2.expRo = null; S2.roSide = 'red'; s2Readouts(); s2Draw();
  });
  $('s2-red-step').addEventListener('click', () => {
    S2.viaGcd = false;
    if (S2.redShown < S2.chain.length) S2.redShown++;
    S2.roSide = 'red';
    s2Readouts(); s2Draw();
  });
  $('s2-red-gcd').addEventListener('click', () => { S2.viaGcd = true; S2.roSide = 'red'; s2Readouts(); s2Draw(); });
  $('s2-red-reset').addEventListener('click', () => {
    S2.redShown = 1; S2.viaGcd = false; S2.roSide = 'exp'; s2Readouts(); s2Draw();
  });
  animate($('step2'), () => { if (S2.expPrev) s2Draw(); });
  onLangRefresh(() => { s2Readouts(); s2Draw(); });
  onRefit(s2Draw);
  s2Readouts(); s2Draw();
}

/* ============================================================
   第 3 步：比大小（交叉相乘 + 通分 双通道）
   ============================================================ */
const S3_PRESETS = [[2, 3, 3, 4], [3, 5, 5, 8], [4, 6, 6, 9], [5, 8, 2, 3], [3, 4, 6, 8]];
const S3 = { a: 2, b: 3, c: 3, d: 4, guess: null, revealed: false, presetIdx: 0 };
FRACTIONS.state.s3 = S3;
function s3Compute() {
  const ad = S3.a * S3.d, cb = S3.c * S3.b;
  const l = ilcm(S3.b, S3.d);
  return {
    ad, cb, l,
    A: S3.a * (l / S3.b), C: S3.c * (l / S3.d),
    rel: ad > cb ? 1 : ad < cb ? -1 : 0
  };
}
FRACTIONS.computeCompare = s3Compute;
function s3Draw() {
  const cv = $('s3-canvas'); if (!cv) return;
  const ctx = fitCanvas(cv);
  const W = cv._w;
  if (W < 10) return;
  ctx.clearRect(0, 0, W, cv._h);
  const x = 66, w = W - 66 - 62;
  const cmp = s3Compute();
  drawBar(ctx, x, 46, w, 46, S3.b, S3.a, { takenColor: COL.orange });
  drawFrac(ctx, S3.a, S3.b, 32, 69, 36, COL.orange);
  drawBar(ctx, x, 116, w, 46, S3.d, S3.c, { takenColor: COL.cyan });
  drawFrac(ctx, S3.c, S3.d, 32, 139, 36, COL.cyan);
  if (S3.revealed) {
    fitText(ctx, t('cLcmRow', { l: cmp.l }), x, 198, w + 56, { size: 13.5, color: COL.mut });
    const bA = drawBar(ctx, x, 212, w, 44, cmp.l, cmp.A, { takenColor: COL.orange });
    const bC = drawBar(ctx, x, 282, w, 44, cmp.l, cmp.C, { takenColor: COL.cyan });
    fitText(ctx, '= ' + cmp.A + '/' + cmp.l, bA[cmp.A] + 8, 212 + 29, 60, { size: 13.5, color: COL.orange });
    fitText(ctx, '= ' + cmp.C + '/' + cmp.l, bC[cmp.C] + 8, 282 + 29, 60, { size: 13.5, color: COL.cyan });
    const ex = Math.max(bA[cmp.A], bC[cmp.C]);
    ctx.strokeStyle = COL.green; ctx.lineWidth = 1.4; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(ex, 206); ctx.lineTo(ex, 332); ctx.stroke(); ctx.setLineDash([]);
    FRACTIONS.pixels.s3 = { unit: w, Apx: bA[cmp.A] - x, Cpx: bC[cmp.C] - x, lcm: cmp.l };
  } else {
    FRACTIONS.pixels.s3 = { unit: w };
  }
  /* 读数 */
  const relSym = cmp.rel > 0 ? t('relGt') : cmp.rel < 0 ? t('relLt') : t('relEq');
  if (!S3.revealed) {
    setRO('s3-cross', t('s3roIdle', { a: S3.a, b: S3.b, c: S3.c, d: S3.d }));
    setRO('s3-lcm', '');
    setRO('s3-verdict', '');
  } else {
    setRO('s3-cross', t('s3roCross', {
      a: S3.a, d: S3.d, ad: cmp.ad, c: S3.c, b: S3.b, cb: cmp.cb, rel: relSym
    }));
    setRO('s3-lcm', t('s3roLcm', {
      b: S3.b, d: S3.d, l: cmp.l, a: S3.a, A: cmp.A, c: S3.c, C: cmp.C, rel: relSym
    }));
    const truth = cmp.rel > 0 ? 'left' : cmp.rel < 0 ? 'right' : 'same';
    const params = { a: S3.a, b: S3.b, c: S3.c, d: S3.d, rel: relSym };
    setRO('s3-verdict', !S3.guess ? t('s3verdictNone', params)
      : S3.guess === truth ? t('s3verdictWin', params) : t('s3verdictLose', params));
  }
}
function s3SyncSteppers() {
  $('s3-an-v').textContent = S3.a; $('s3-ad-v').textContent = S3.b;
  $('s3-cn-v').textContent = S3.c; $('s3-cd-v').textContent = S3.d;
}
function s3Set(which, delta) {
  if (which === 'a') S3.a = clamp(S3.a + delta, 1, S3.b);
  if (which === 'b') { S3.b = clamp(S3.b + delta, 1, 12); if (S3.a > S3.b) S3.a = S3.b; }
  if (which === 'c') S3.c = clamp(S3.c + delta, 1, S3.d);
  if (which === 'd') { S3.d = clamp(S3.d + delta, 1, 12); if (S3.c > S3.d) S3.c = S3.d; }
  S3.revealed = false; S3.guess = null;
  ['left', 'same', 'right'].forEach(k => $('s3-g-' + k).classList.remove('active'));
  s3SyncSteppers(); s3Draw();
}
function initS3() {
  regCanvas('s3-canvas');
  [['an', 'a', -1], ['an', 'a', 1], ['ad', 'b', -1], ['ad', 'b', 1],
   ['cn', 'c', -1], ['cn', 'c', 1], ['cd', 'd', -1], ['cd', 'd', 1]].forEach(([id, which, dl], i) => {
    const suffix = i % 2 === 0 ? '-m' : '-p';
    $(('s3-' + id + suffix)).addEventListener('click', () => s3Set(which, dl));
  });
  $('s3-next').addEventListener('click', () => {
    S3.presetIdx = (S3.presetIdx + 1) % S3_PRESETS.length;
    const p = S3_PRESETS[S3.presetIdx];
    S3.a = p[0]; S3.b = p[1]; S3.c = p[2]; S3.d = p[3];
    S3.revealed = false; S3.guess = null;
    ['left', 'same', 'right'].forEach(k => $('s3-g-' + k).classList.remove('active'));
    s3SyncSteppers(); s3Draw();
  });
  const pick = g => {
    S3.guess = g;
    ['left', 'same', 'right'].forEach(k => $('s3-g-' + k).classList.toggle('active', k === g));
  };
  $('s3-g-left').addEventListener('click', () => pick('left'));
  $('s3-g-same').addEventListener('click', () => pick('same'));
  $('s3-g-right').addEventListener('click', () => pick('right'));
  $('s3-verify').addEventListener('click', () => { S3.revealed = true; s3Draw(); });
  onLangRefresh(s3Draw);
  onRefit(s3Draw);
  s3SyncSteppers(); s3Draw();
}

/* ============================================================
   第 4 步：加法先通分（错误 2/5 与真长度 5/6 同屏；重切对齐）
   ============================================================ */
const S4 = { mode: 'add', phase: 'idle', animStart: 0 };
FRACTIONS.state.s4 = S4;
function s4Draw() {
  const cv = $('s4-canvas'); if (!cv) return;
  const ctx = fitCanvas(cv);
  const W = cv._w;
  if (W < 10) return;
  ctx.clearRect(0, 0, W, cv._h);
  const x = 118, w = W - 118 - 20;
  const bHalf = boundaries(x, w, 2), bThird = boundaries(x, w, 3),
        bSix = boundaries(x, w, 6), bFive = boundaries(x, w, 5);
  const animT = S4.phase === 'right' ? clamp((NOW - S4.animStart) / 650, 0, 1) : 1;
  const ghostFor = den => S4.phase === 'right' && animT < 1 ? { den, alpha: 0.55 * (1 - animT) } : null;
  FRACTIONS.pixels.s4 = {
    unit: w, halfPx: bHalf[1] - x, thirdPx: bThird[1] - x,
    sumPx: (bHalf[1] - x) + (bThird[1] - x), resultPx: bSix[5] - x, wrongPx: bFive[2] - x
  };
  FRACTIONS.pixels.s4.gapPx = FRACTIONS.pixels.s4.sumPx - FRACTIONS.pixels.s4.wrongPx;
  if (S4.mode === 'add') {
    if (S4.phase === 'right') {
      drawBar(ctx, x, 44, w, 44, 6, 3, { ghostGrid: ghostFor(2) });
      drawBar(ctx, x, 104, w, 44, 6, 2, { takenColor: COL.cyan, ghostGrid: ghostFor(3) });
    } else {
      drawBar(ctx, x, 44, w, 44, 2, 1, {});
      drawBar(ctx, x, 104, w, 44, 3, 1, { takenColor: COL.cyan });
    }
    drawFrac(ctx, 1, 2, 56, 66, 36, COL.orange);
    drawFrac(ctx, 1, 3, 56, 126, 36, COL.cyan);
    if (S4.phase === 'wrong') {
      fitText(ctx, t('cTrueTag'), x, 182, w, { size: 13.5, color: COL.mut });
      const y3 = 192;
      ctx.fillStyle = COL.orange; ctx.fillRect(x, y3, bHalf[1] - x, 44);
      ctx.fillStyle = COL.cyan; ctx.fillRect(bHalf[1], y3, bThird[1] - x, 44);
      ctx.strokeStyle = COL.grid; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(bHalf[1], y3); ctx.lineTo(bHalf[1], y3 + 44); ctx.stroke();
      ctx.strokeStyle = COL.edge; ctx.setLineDash([5, 4]);
      ctx.strokeRect(x, y3, w, 44); ctx.setLineDash([]);
      fitText(ctx, t('cWrongTag'), x, 272, w, { size: 13.5, color: COL.red });
      drawBar(ctx, x, 282, w, 44, 5, 2, { takenColor: COL.red });
      const wrongEnd = bFive[2], trueEnd = x + FRACTIONS.pixels.s4.sumPx;
      ctx.strokeStyle = COL.red; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(wrongEnd, 348); ctx.lineTo(trueEnd, 348);
      ctx.moveTo(wrongEnd, 341); ctx.lineTo(wrongEnd, 355);
      ctx.moveTo(trueEnd, 341); ctx.lineTo(trueEnd, 355);
      ctx.stroke();
      fitText(ctx, t('cGapTag'), (wrongEnd + trueEnd) / 2, 374, Math.abs(trueEnd - wrongEnd) + 130, { size: 14, weight: '700', color: COL.red, align: 'center' });
    }
    if (S4.phase === 'right') {
      fitText(ctx, t('cJoinTag'), x, 182, w, { size: 13.5, color: COL.mut });
      const cc = { 0: COL.orange, 1: COL.orange, 2: COL.orange, 3: COL.cyan, 4: COL.cyan };
      drawBar(ctx, x, 192, w, 44, 6, 5, { cellColors: cc });
      fitText(ctx, t('cResTag'), x, 272, w, { size: 13.5, color: COL.green });
      drawBar(ctx, x, 282, w, 44, 6, 5, { takenColor: COL.green });
      ctx.strokeStyle = COL.green; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.moveTo(bSix[5], 186); ctx.lineTo(bSix[5], 332); ctx.stroke(); ctx.setLineDash([]);
    }
  } else {
    /* 减法：5/6 − 1/3 */
    drawBar(ctx, x, 44, w, 44, 6, 5, {});
    drawFrac(ctx, 5, 6, 56, 66, 36, COL.orange);
    if (S4.phase === 'right') {
      drawBar(ctx, x, 104, w, 44, 6, 2, { takenColor: COL.cyan, ghostGrid: ghostFor(3) });
      fitText(ctx, t('cCutTag'), x, 182, w, { size: 13.5, color: COL.mut });
      drawBar(ctx, x, 192, w, 44, 6, 5, { hatched: new Set([3, 4]) });
      fitText(ctx, t('cResTag'), x, 272, w, { size: 13.5, color: COL.green });
      drawBar(ctx, x, 282, w, 44, 6, 3, { takenColor: COL.green });
      fitText(ctx, '= 1/2', bSix[3] + 12, 282 + 29, 70, { size: 16, weight: '700', color: COL.green });
      ctx.strokeStyle = COL.green; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.moveTo(bSix[3], 186); ctx.lineTo(bSix[3], 332); ctx.stroke(); ctx.setLineDash([]);
    } else {
      drawBar(ctx, x, 104, w, 44, 3, 1, { takenColor: COL.cyan });
    }
    drawFrac(ctx, 1, 3, 56, 126, 36, COL.cyan);
  }
  /* 读数 */
  if (S4.mode === 'add') {
    setRO('s4-readout', S4.phase === 'wrong' ? t('s4roWrong')
      : S4.phase === 'right' ? t('s4roRightAdd') : t('s4roIdleAdd'));
  } else {
    setRO('s4-readout', S4.phase === 'right' ? t('s4roRightSub') : t('s4roIdleSub'));
  }
}
function s4SetPhase(p) {
  S4.phase = p;
  if (p === 'right') S4.animStart = NOW;
  s4Draw();
}
function initS4() {
  regCanvas('s4-canvas');
  $('s4-m-add').addEventListener('click', () => {
    S4.mode = 'add'; S4.phase = 'idle';
    $('s4-m-add').classList.add('active'); $('s4-m-sub').classList.remove('active');
    $('s4-wrong').style.display = '';
    s4Draw();
  });
  $('s4-m-sub').addEventListener('click', () => {
    S4.mode = 'sub'; S4.phase = 'idle';
    $('s4-m-sub').classList.add('active'); $('s4-m-add').classList.remove('active');
    $('s4-wrong').style.display = 'none';
    s4Draw();
  });
  $('s4-wrong').addEventListener('click', () => s4SetPhase('wrong'));
  $('s4-right').addEventListener('click', () => s4SetPhase('right'));
  $('s4-reset').addEventListener('click', () => s4SetPhase('idle'));
  animate($('step4'), () => { if (S4.phase === 'right') s4Draw(); });
  onLangRefresh(s4Draw);
  onRefit(s4Draw);
  s4Draw();
}

/* ============================================================
   第 5 步：假分数与带分数 + 分数作用于一个量（12 颗糖）
   ============================================================ */
const S5_LIST = [{ n: 7, d: 4 }, { n: 11, d: 4 }, { n: 5, d: 2 }, { n: 9, d: 3 }];
const S5 = { idx: 0, mode: 'imp' };
const S5B = { n: 3, d: 4 };
FRACTIONS.state.s5 = S5;
FRACTIONS.state.s5b = S5B;
function s5Draw() {
  const cv = $('s5-canvas'); if (!cv) return;
  const ctx = fitCanvas(cv);
  const W = cv._w;
  if (W < 10) return;
  ctx.clearRect(0, 0, W, cv._h);
  const f = S5_LIST[S5.idx];
  const q = Math.floor(f.n / f.d), r = f.n - q * f.d;
  const wholes = Math.ceil(f.n / f.d);
  const x = 78, w = W - 104, bh = 50, gap = 20, y0 = 36;
  for (let bi = 0; bi < wholes; bi++) {
    const y = y0 + bi * (bh + gap);
    fitText(ctx, t('cWhole', { i: bi + 1 }), 6, y + bh / 2 + 5, 66, { size: 13, color: COL.mut });
    drawBar(ctx, x, y, w, bh, f.d, clamp(f.n - bi * f.d, 0, f.d), {});
  }
  if (S5.mode === 'mix' && q >= 1) {
    ctx.strokeStyle = COL.green; ctx.lineWidth = 2.2;
    ctx.strokeRect(x - 7, y0 - 7, w + 14, q * bh + (q - 1) * gap + 14);
  }
  /* 右上角写法标签 */
  if (S5.mode === 'imp') {
    drawFrac(ctx, f.n, f.d, W - 40, 20, 34, COL.orange);
  } else if (r > 0) {
    ctx.fillStyle = COL.green; ctx.font = '700 27px system-ui, sans-serif'; ctx.textAlign = 'right';
    ctx.fillText(String(q), W - 52, 32);
    drawFrac(ctx, r, f.d, W - 24, 20, 30, COL.green);
  } else {
    ctx.fillStyle = COL.green; ctx.font = '700 27px system-ui, sans-serif'; ctx.textAlign = 'right';
    ctx.fillText(String(q), W - 14, 32);
  }
  FRACTIONS.state.s5.q = q; FRACTIONS.state.s5.r = r;
  if (S5.mode === 'imp') {
    setRO('s5-readout', r > 0
      ? t('s5roImp', { n: f.n, d: f.d, q, r })
      : t('s5roInt', { n: f.n, d: f.d, q }));
  } else {
    setRO('s5-readout', r > 0
      ? t('s5roMix', { q, r, d: f.d, qd: q * f.d, n: f.n })
      : t('s5roMixInt', { q, qd: q * f.d, d: f.d }));
  }
}
function s5bDraw() {
  const cv = $('s5b-canvas'); if (!cv) return;
  const ctx = fitCanvas(cv);
  const W = cv._w;
  if (W < 10) return;
  ctx.clearRect(0, 0, W, cv._h);
  const total = 12;
  const taken = (total * S5B.n) / S5B.d;
  const cell = Math.min((W - 56) / 4, 82);
  const gx = (W - cell * 4) / 2, gy = 22;
  ctx.strokeStyle = COL.grid; ctx.lineWidth = 1.4;
  ctx.strokeRect(gx - 10, gy - 10, cell * 4 + 20, cell * 3 + 20);
  for (let i = 0; i < total; i++) {
    const cxp = gx + cell * (i % 4) + cell / 2;
    const cyp = gy + cell * Math.floor(i / 4) + cell / 2;
    const rad = cell * 0.335;
    ctx.beginPath(); ctx.arc(cxp, cyp, rad, 0, Math.PI * 2);
    if (i < taken) {
      ctx.fillStyle = '#eda93f'; ctx.fill();
      ctx.strokeStyle = COL.orange; ctx.lineWidth = 3; ctx.stroke();
      ctx.beginPath(); ctx.arc(cxp, cyp, rad * 0.34, 0, Math.PI * 2);
      ctx.fillStyle = '#fff3d6'; ctx.fill();
    } else {
      ctx.fillStyle = '#232c3d'; ctx.fill();
      ctx.strokeStyle = COL.grid; ctx.lineWidth = 1.6; ctx.stroke();
    }
  }
  FRACTIONS.state.s5b.taken = taken;
  FRACTIONS.pixels.s5b = { taken, cell };
  setRO('s5b-readout', t('s5bro', {
    n: S5B.n, d: S5B.d, per: total / S5B.d, taken
  }));
}
function initS5() {
  regCanvas('s5-canvas'); regCanvas('s5b-canvas');
  $('s5-m-imp').addEventListener('click', () => {
    S5.mode = 'imp';
    $('s5-m-imp').classList.add('active'); $('s5-m-mix').classList.remove('active');
    s5Draw();
  });
  $('s5-m-mix').addEventListener('click', () => {
    S5.mode = 'mix';
    $('s5-m-mix').classList.add('active'); $('s5-m-imp').classList.remove('active');
    s5Draw();
  });
  $('s5-next').addEventListener('click', () => {
    S5.idx = (S5.idx + 1) % S5_LIST.length;
    s5Draw();
  });
  document.querySelectorAll('#s5b-btns button[data-cf]').forEach(btn => {
    btn.addEventListener('click', () => {
      const parts = btn.dataset.cf.split('/');
      S5B.n = +parts[0]; S5B.d = +parts[1];
      document.querySelectorAll('#s5b-btns button[data-cf]').forEach(b2 => b2.classList.toggle('active', b2 === btn));
      s5bDraw();
    });
  });
  onLangRefresh(() => { s5Draw(); s5bDraw(); });
  onRefit(() => { s5Draw(); s5bDraw(); });
  s5Draw(); s5bDraw();
}

/* ============================================================
   第 6 步：终章——数轴上的一家人（分数 / 小数 / 百分数同点落位）
   ============================================================ */
const S6_ITEMS = [
  { label: '1/2', n: 1, d: 2 },
  { label: '50%', n: 50, d: 100 },
  { label: '0.5', n: 1, d: 2 },
  { label: '5/4', n: 5, d: 4 },
  { label: '125%', n: 125, d: 100 },
  { label: '1.25', n: 5, d: 4 },
  { label: '7/3', n: 7, d: 3 },
  { label: '2/3', n: 2, d: 3 }
];
const S6 = { count: 0, dropStart: 0 };
FRACTIONS.state.s6 = S6;
function s6Value(it) { return mkFrac(it.n, it.d); }
function s6Lane(idx) {
  const v = s6Value(S6_ITEMS[idx]);
  let lane = 0;
  for (let j = 0; j < idx; j++) if (fEq(s6Value(S6_ITEMS[j]), v)) lane++;
  return lane;
}
function s6GroupSize(idx, upto) {
  const v = s6Value(S6_ITEMS[idx]);
  let c = 0;
  for (let j = 0; j < upto; j++) if (fEq(s6Value(S6_ITEMS[j]), v)) c++;
  return c;
}
function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function s6Draw() {
  const cv = $('s6-canvas'); if (!cv) return;
  const ctx = fitCanvas(cv);
  const W = cv._w;
  if (W < 10) return;
  ctx.clearRect(0, 0, W, cv._h);
  const x0 = 42, x1 = W - 26, lineY = 276, unit = (x1 - x0) / 3;
  /* 数轴 */
  ctx.strokeStyle = COL.edge; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(x0 - 8, lineY); ctx.lineTo(x1 + 6, lineY); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x1 + 6, lineY); ctx.lineTo(x1 - 3, lineY - 5); ctx.lineTo(x1 - 3, lineY + 5);
  ctx.closePath(); ctx.fillStyle = COL.edge; ctx.fill();
  for (let k = 0; k <= 12; k++) {
    const tx = x0 + unit * k / 4;
    const big = k % 4 === 0;
    ctx.strokeStyle = big ? COL.edge : COL.grid; ctx.lineWidth = big ? 1.8 : 1.1;
    ctx.beginPath(); ctx.moveTo(tx, lineY - (big ? 8 : 5)); ctx.lineTo(tx, lineY + (big ? 8 : 5)); ctx.stroke();
    if (big) {
      ctx.fillStyle = COL.mut; ctx.font = '14px system-ui, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(String(k / 4), tx, lineY + 28);
    }
  }
  const pos = {};
  /* 同值虚线（组内 ≥2 个已落） */
  for (let i = 0; i < S6.count; i++) {
    const it = S6_ITEMS[i], v = s6Value(it);
    const px = x0 + (v.n / v.d) * unit;
    pos[it.label] = px;
    if (s6GroupSize(i, S6.count) >= 2 && s6Lane(i) === 0) {
      ctx.strokeStyle = 'rgba(126,226,168,.65)'; ctx.lineWidth = 1.4; ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.moveTo(px, lineY - 46 - (s6GroupSize(i, S6.count) - 1) * 40 - 22); ctx.lineTo(px, lineY); ctx.stroke();
      ctx.setLineDash([]);
    }
  }
  /* 已落的牌 */
  for (let i = 0; i < S6.count; i++) {
    const it = S6_ITEMS[i], v = s6Value(it);
    const px = pos[it.label];
    const finalY = lineY - 46 - s6Lane(i) * 40;
    let cy = finalY;
    if (i === S6.count - 1 && NOW - S6.dropStart < 550) {
      cy = 26 + (finalY - 26) * ease(clamp((NOW - S6.dropStart) / 550, 0, 1));
    }
    const same = s6GroupSize(i, S6.count) >= 2;
    rrect(ctx, px - 30, cy - 15, 60, 30, 9);
    ctx.fillStyle = '#1c2330'; ctx.fill();
    ctx.strokeStyle = same ? COL.green : COL.grid; ctx.lineWidth = same ? 2 : 1.3;
    ctx.stroke();
    fitText(ctx, it.label, px, cy + 5.5, 54, { size: 15, weight: '700', color: COL.ink, align: 'center' });
    ctx.fillStyle = same ? COL.green : COL.mut;
    ctx.beginPath(); ctx.arc(px, lineY, 4, 0, Math.PI * 2); ctx.fill();
  }
  FRACTIONS.pixels.s6 = { x0, unit, pos };
}
function s6ReadoutFor(idx) {
  const it = S6_ITEMS[idx], v = s6Value(it);
  const val = fStr(v);
  if (idx === S6_ITEMS.length - 1) { setRO('s6-readout', t('s6roDone')); return; }
  const others = [];
  for (let j = 0; j < idx; j++) if (fEq(s6Value(S6_ITEMS[j]), v)) others.push(S6_ITEMS[j].label);
  if (others.length) {
    setRO('s6-readout', t('s6roSame', { label: it.label, val, others: others.join('、') }));
    return;
  }
  const info = decimalInfo(v.n, v.d);
  if (!info.exact) {
    setRO('s6-readout', t('s6roRep', { label: it.label, val, dec: decDisplay(info) }));
    return;
  }
  setRO('s6-readout', t('s6roItem', { label: it.label, val }));
}
function initS6() {
  regCanvas('s6-canvas');
  $('s6-next').addEventListener('click', () => {
    if (S6.count >= S6_ITEMS.length) return;
    S6.count++;
    S6.dropStart = NOW;
    s6ReadoutFor(S6.count - 1);
    if (S6.count >= S6_ITEMS.length) $('s6-next').disabled = true;
    s6Draw();
  });
  $('s6-reset').addEventListener('click', () => {
    S6.count = 0;
    $('s6-next').disabled = false;
    setRO('s6-readout', t('s6roIdle'));
    s6Draw();
  });
  animate($('step6'), () => { if (S6.count > 0 && NOW - S6.dropStart < 600) s6Draw(); });
  onLangRefresh(() => {
    if (S6.count > 0) s6ReadoutFor(S6.count - 1);
    else setRO('s6-readout', t('s6roIdle'));
    s6Draw();
  });
  onRefit(s6Draw);
  setRO('s6-readout', t('s6roIdle'));
  s6Draw();
}

/* ---------- 对账入口（供评审/自测程序化设置状态） ---------- */
FRACTIONS.set = {
  s1: (den, take) => s1Set(den, take),
  s3: (a, b, c, d) => {
    S3.a = a; S3.b = b; S3.c = c; S3.d = d;
    S3.revealed = false; S3.guess = null;
    s3SyncSteppers(); s3Draw();
  },
  s3verify: () => { S3.revealed = true; s3Draw(); },
  s5: idx => { S5.idx = ((idx % S5_LIST.length) + S5_LIST.length) % S5_LIST.length; s5Draw(); },
  s5b: (n, d) => { S5B.n = n; S5B.d = d; s5bDraw(); },
  s6all: () => {
    S6.count = S6_ITEMS.length; S6.dropStart = 0;
    const nb = $('s6-next'); if (nb) nb.disabled = true;
    setRO('s6-readout', t('s6roDone'));
    s6Draw();
  }
};

/* ---------- 启动（i18n 的 applyLang 已先行运行） ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initS0(); initS1(); initS2(); initS3(); initS4(); initS5(); initS6();
});
