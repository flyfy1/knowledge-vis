'use strict';
/* 对称与旋转 · 翻一翻，转一转 — 全部逻辑（无依赖，原生 Canvas 2D）
   依赖 i18n.js 先行加载：t() / getLang() / onLangRefresh()。

   ★ 红线落点：
   1. 对称轴不靠「看着像」：PURE 区用反射几何真算——候选线是不是对称轴，
      由 reflectPoint + polygonMatches 判定（isAxis），页面渲染与自查共用同一份判定。
   2. 计数同源：对称轴数（AXIS_COUNTS）、最小重合角（360 ÷ ROT_ORDERS）、
      万花筒复制份数（kaleidoCopies）都是纯函数/纯表，读数一律现场算出（读数纯渲染）。
   3. 状态一致性：每步的判定都是状态的纯函数（refresh 从状态重算），
      答题×改参、切语言×动画都不会留与当前状态矛盾的旧判定；
      动画一律带 token，改参/切语言/换图形先递增 token 作废旧动画。
   对账入口：window.SYMMETRY_ROTATION（ops / state / set）。 */
const $ = id => document.getElementById(id);

/* ================= PURE-BEGIN（无 DOM 依赖，自查脚本可直接 eval） ================= */
/* 折线：{x, y} 为线上一点，ang 为线方向角（度）。反射用单位方向向量做投影。 */
function lineDir(angDeg) { const a = angDeg * Math.PI / 180; return { x: Math.cos(a), y: Math.sin(a) }; }
function reflectPoint(px, py, line) {
  const u = lineDir(line.ang);
  const dx = px - line.x, dy = py - line.y;
  const s = dx * u.x + dy * u.y;
  return { x: 2 * (line.x + s * u.x) - px, y: 2 * (line.y + s * u.y) - py };
}
function polygonMatches(polyA, polyB, eps) {
  if (polyA.length !== polyB.length) return false;
  const used = new Array(polyB.length).fill(false);
  for (const p of polyA) {
    let hit = -1;
    for (let i = 0; i < polyB.length; i++) {
      if (used[i]) continue;
      const q = polyB[i];
      if (Math.abs(p[0] - q[0]) <= eps && Math.abs(p[1] - q[1]) <= eps) { hit = i; break; }
    }
    if (hit < 0) return false;
    used[hit] = true;
  }
  return true;
}
/* 一条候选线是对称轴 ⟺ 图形沿它反射后与原图顶点集完全重合 */
function isAxis(poly, line) {
  const refl = poly.map(p => { const r = reflectPoint(p[0], p[1], line); return [r.x, r.y]; });
  return polygonMatches(refl, poly, 0.75);
}
/* 第 0 步图形（200×200 坐标系）与候选折线（含真轴与假线） */
const FOLD_SHAPES = {
  iso: {
    poly: [[100, 26], [38, 174], [162, 174]],
    lines: [
      { id: 'v', x: 100, y: 100, ang: 90 },
      { id: 'h', x: 100, y: 112, ang: 0 },
      { id: 'd1', x: 100, y: 100, ang: 45 },
      { id: 'voff', x: 78, y: 100, ang: 90 }
    ]
  },
  square: {
    poly: [[52, 52], [148, 52], [148, 148], [52, 148]],
    lines: [
      { id: 'v', x: 100, y: 100, ang: 90 },
      { id: 'h', x: 100, y: 100, ang: 0 },
      { id: 'd1', x: 100, y: 100, ang: 45 },
      { id: 'd2', x: 100, y: 100, ang: 135 },
      { id: 'voff', x: 76, y: 100, ang: 90 }
    ]
  },
  rect: {
    poly: [[34, 64], [166, 64], [166, 136], [34, 136]],
    lines: [
      { id: 'v', x: 100, y: 100, ang: 90 },
      { id: 'h', x: 100, y: 100, ang: 0 },
      { id: 'd1', x: 100, y: 100, ang: 45 },
      { id: 'hoff', x: 100, y: 82, ang: 0 }
    ]
  },
  scalene: {
    poly: [[58, 38], [172, 148], [36, 162]],
    lines: [
      { id: 'v', x: 100, y: 100, ang: 90 },
      { id: 'med', x: 58, y: 38, ang: 68.5 },
      { id: 'd2', x: 100, y: 100, ang: 135 }
    ]
  }
};
function foldAxesOf(shapeId) {
  const sh = FOLD_SHAPES[shapeId];
  return sh.lines.filter(l => isAxis(sh.poly, l)).map(l => l.id);
}
/* 第 1 步账本：对称轴条数（圆为 Infinity） */
const AXIS_COUNTS = { square: 4, rect: 2, equi: 3, iso: 1, para: 0, circle: Infinity, A: 1, H: 2 };
/* 第 2 步账本：重合次数（阶数）；最小重合角 = 360 ÷ 阶数 */
const ROT_ORDERS = { fan2: 2, fan3: 3, fan4: 4, leaf: 1, para: 2 };
function minRotAngle(id) { return 360 / ROT_ORDERS[id]; }
function rotCoincides(id, deg) {
  const d = ((deg % 360) + 360) % 360;
  if (d === 0) return true;
  return d % minRotAngle(id) === 0;
}
/* 第 3 步：一份原件在整幅图案里出现的份数（开镜像 2n，关镜像 n） */
function kaleidoCopies(n, mirror) { return mirror ? 2 * n : n; }
/* ================= PURE-END ================= */

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
function regCanvas(id) { const cv = $(id); if (cv && !allCanvases.includes(cv)) allCanvases.push(cv); return cv; }
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
  orange: '#ffb454', cyan: '#6ee7ff', green: '#7ee2a8', red: '#ff7a93',
  ink: '#e8edf4', mut: '#9aa7b8', grid: '#39465e', fill: '#2b4a6b', fill2: '#3d5a78', edge: '#8494ab'
};
function easeIO(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
function pathOf(ctx, pts, close) {
  ctx.beginPath();
  pts.forEach((p, i) => { if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); });
  if (close !== false) ctx.closePath();
}
/* 半平面裁剪（Sutherland–Hodgman）：保留法线正侧（keepPos=true）或负侧 */
function clipHalf(poly, line, keepPos) {
  const u = lineDir(line.ang);
  const nx = -u.y, ny = u.x;
  const val = p => (p[0] - line.x) * nx + (p[1] - line.y) * ny;
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const va = val(a), vb = val(b);
    const ina = keepPos ? va >= -1e-9 : va <= 1e-9;
    const inb = keepPos ? vb >= -1e-9 : vb <= 1e-9;
    if (ina) out.push(a);
    if (ina !== inb) {
      const tt = va / (va - vb);
      out.push([a[0] + (b[0] - a[0]) * tt, a[1] + (b[1] - a[1]) * tt]);
    }
  }
  return out;
}
/* 折叠中的点：绕折线「翻」——投影点 + cos(θ)·(原点 − 投影点)，θ=π 时恰为镜像 */
function foldPoint(p, line, cosT) {
  const u = lineDir(line.ang);
  const dx = p[0] - line.x, dy = p[1] - line.y;
  const s = dx * u.x + dy * u.y;
  const qx = line.x + s * u.x, qy = line.y + s * u.y;
  return [qx + cosT * (p[0] - qx), qy + cosT * (p[1] - qy)];
}

/* ============================================================
   第 0 步：对折试一试（候选线逐条试折，判定由反射几何真算）
   ============================================================ */
const S0 = {
  shape: 'iso',
  tried: { iso: {}, square: {}, rect: {}, scalene: {} }, // shapeId -> { lineId: bool }
  current: null,        // 正在/最后试折的线 id
  foldT: null,          // null = 未折叠；0..1 = 折叠进度
  folding: false,
  lastVerdict: null,    // { lineId, ok }
  token: 0
};
const S0_SHAPE_KEYS = { iso: 'shIso', square: 'shSquare', rect: 'shRect', scalene: 'shScalene' };
const S0_LINE_KEYS = { v: 'lnV', h: 'lnH', d1: 'lnD1', d2: 'lnD2', voff: 'lnVOff', hoff: 'lnHOff', med: 'lnMed' };
function s0Geom() {
  const cv = $('s0-canvas');
  const W = cv._w || cv.clientWidth, H = cv._h || 400;
  const k = Math.min((H - 84) / 200, (W - 40) / 200);
  return { k, ox: (W - 200 * k) / 2, oy: (H - 200 * k) / 2 + 4, W, H };
}
function s0Draw() {
  const cv = $('s0-canvas'); if (!cv) return;
  const ctx = fitCanvas(cv);
  const W = cv._w, H = cv._h;
  if (W < 10) return;
  ctx.clearRect(0, 0, W, H);
  const g = s0Geom();
  const X = x => g.ox + x * g.k, Y = y => g.oy + y * g.k;
  const sh = FOLD_SHAPES[S0.shape];
  const poly = sh.poly.map(p => [X(p[0]), Y(p[1])]);
  const curLine = S0.current ? sh.lines.find(l => l.id === S0.current) : null;
  /* 候选折线（在图形下层先画虚线，当前线加粗） */
  sh.lines.forEach(L => {
    const u = lineDir(L.ang);
    const x1 = X(L.x - u.x * 118), y1 = Y(L.y - u.y * 118);
    const x2 = X(L.x + u.x * 118), y2 = Y(L.y + u.y * 118);
    const res = S0.tried[S0.shape][L.id];
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
    if (L.id === S0.current) { ctx.setLineDash([]); ctx.lineWidth = 2.6; ctx.strokeStyle = COL.cyan; }
    else if (res === true) { ctx.setLineDash([7, 5]); ctx.lineWidth = 2.2; ctx.strokeStyle = COL.green; }
    else if (res === false) { ctx.setLineDash([7, 5]); ctx.lineWidth = 1.6; ctx.strokeStyle = 'rgba(255,122,147,.55)'; }
    else { ctx.setLineDash([7, 5]); ctx.lineWidth = 1.6; ctx.strokeStyle = 'rgba(132,148,171,.75)'; }
    ctx.stroke(); ctx.setLineDash([]);
  });
  if (S0.foldT === null || !curLine) {
    /* 未折叠：整图实心 */
    pathOf(ctx, poly);
    ctx.fillStyle = COL.fill; ctx.fill();
    ctx.lineWidth = 2.2; ctx.strokeStyle = COL.edge; ctx.stroke();
  } else {
    /* 目标轮廓（原图虚线）：翻过去应该落在这里 */
    pathOf(ctx, poly);
    ctx.setLineDash([5, 4]); ctx.lineWidth = 1.6; ctx.strokeStyle = COL.mut; ctx.stroke(); ctx.setLineDash([]);
    const lineS = { x: X(curLine.x), y: Y(curLine.y), ang: curLine.ang };
    const cosT = Math.cos(Math.PI * easeIO(S0.foldT));
    /* 静止半边（法线负侧） */
    const still = clipHalf(poly, lineS, false);
    if (still.length >= 3) {
      pathOf(ctx, still);
      ctx.fillStyle = COL.fill; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = COL.edge; ctx.stroke();
    }
    /* 活动半边（法线正侧绕线翻转） */
    const moving = clipHalf(poly, lineS, true).map(p => foldPoint(p, lineS, cosT));
    if (moving.length >= 3) {
      const done = S0.foldT >= 1;
      const ok = S0.lastVerdict && S0.lastVerdict.ok;
      pathOf(ctx, moving);
      ctx.fillStyle = done ? (ok ? 'rgba(126,226,168,.55)' : 'rgba(255,122,147,.5)') : 'rgba(110,231,255,.5)';
      ctx.fill();
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = done ? (ok ? COL.green : COL.red) : COL.cyan;
      ctx.stroke();
    }
  }
}
function s0Readouts() {
  const sh = FOLD_SHAPES[S0.shape];
  const triedMap = S0.tried[S0.shape];
  const triedN = Object.keys(triedMap).length;
  const found = Object.values(triedMap).filter(Boolean).length;
  if (S0.folding && S0.current) {
    setRO('s0-verdict', t('s0folding', { line: t(S0_LINE_KEYS[S0.current]) }));
  } else if (S0.lastVerdict) {
    const lv = S0.lastVerdict;
    setRO('s0-verdict', t(lv.ok ? 's0yes' : 's0no', { line: t(S0_LINE_KEYS[lv.lineId]) }));
  } else {
    setRO('s0-verdict', t('s0idle'));
  }
  setRO('s0-prog', t('s0prog', { tried: triedN, total: sh.lines.length, found }));
  setRO('s0-done', triedN === sh.lines.length
    ? (found === 0 ? t('s0done0') : t(found === 1 ? 's0done1' : 's0doneN', { found }))
    : '');
}
function s0BuildButtons() {
  const sw = $('s0-shapes');
  sw.innerHTML = '';
  Object.keys(S0_SHAPE_KEYS).forEach(id => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn big' + (id === S0.shape ? ' active' : '');
    b.textContent = t(S0_SHAPE_KEYS[id]);
    b.addEventListener('click', () => s0SetShape(id));
    sw.appendChild(b);
  });
  const lw = $('s0-lines');
  lw.innerHTML = '';
  FOLD_SHAPES[S0.shape].lines.forEach(L => {
    const b = document.createElement('button');
    b.type = 'button';
    const res = S0.tried[S0.shape][L.id];
    b.className = 'btn big' + (res === true ? ' found' : res === false ? ' missed' : '') + (L.id === S0.current ? ' active' : '');
    b.textContent = t(S0_LINE_KEYS[L.id]) + (res === true ? ' ✓' : res === false ? ' ✗' : '');
    b.addEventListener('click', () => s0FoldTo(L.id));
    lw.appendChild(b);
  });
}
function s0SetShape(id) {
  S0.token++;                       // 作废进行中的折叠动画
  S0.shape = id;
  S0.current = null; S0.foldT = null; S0.folding = false; S0.lastVerdict = null;
  s0BuildButtons(); s0Draw(); s0Readouts();
}
function s0FoldTo(lineId) {
  const sh = FOLD_SHAPES[S0.shape];
  const L = sh.lines.find(l => l.id === lineId);
  if (!L) return;
  S0.token++;
  const tk = S0.token;
  const ok = isAxis(sh.poly, L);    // 真判定：反射几何
  S0.current = lineId; S0.folding = true; S0.foldT = 0;
  S0.lastVerdict = null;
  s0BuildButtons(); s0Readouts(); s0Draw();
  const t0 = performance.now(), DUR = 720;
  (function frame(now) {
    if (tk !== S0.token) return;    // 已被改参/切语言/换图形作废
    const tt = Math.min(1, (now - t0) / DUR);
    S0.foldT = tt;
    s0Draw();
    if (tt < 1) { requestAnimationFrame(frame); return; }
    S0.folding = false;
    S0.tried[S0.shape][lineId] = ok;
    S0.lastVerdict = { lineId, ok };
    s0BuildButtons(); s0Readouts(); s0Draw();
  })(t0);
}
function initS0() {
  const cv = regCanvas('s0-canvas');
  $('s0-start').addEventListener('click', () => {
    const el = $('step1');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  });
  /* 画布点线：点中某条候选线（换算到图形坐标后取最近线）等价于点按钮 */
  cv.addEventListener('click', e => {
    const r = cv.getBoundingClientRect();
    const g = s0Geom();
    const px = (e.clientX - r.left - g.ox) / g.k, py = (e.clientY - r.top - g.oy) / g.k;
    let best = null, bestD = 14 / g.k;
    FOLD_SHAPES[S0.shape].lines.forEach(L => {
      const u = lineDir(L.ang);
      const d = Math.abs((px - L.x) * (-u.y) + (py - L.y) * u.x);
      if (d < bestD) { bestD = d; best = L.id; }
    });
    if (best) s0FoldTo(best);
  });
  onLangRefresh(() => {
    S0.token++;                     // 切语言先作废动画，回到未折叠态，避免悬空帧
    S0.folding = false; S0.foldT = null;
    s0BuildButtons(); s0Draw(); s0Readouts();
  });
  onRefit(() => { s0Draw(); });
  s0BuildButtons(); s0Draw(); s0Readouts();
}

/* ============================================================
   第 1 步：对称轴数一数（画廊：先猜，再亮出全部对称轴核对）
   ============================================================ */
const GAL_IDS = ['square', 'rect', 'equi', 'iso', 'para', 'circle', 'A', 'H'];
const GAL_NAME_KEYS = { square: 'gSquare', rect: 'gRect', equi: 'gEqui', iso: 'gIso', para: 'gPara', circle: 'gCircle', A: 'gA', H: 'gH' };
const PRED_VALS = ['0', '1', '2', '3', '4', 'inf'];
const PRED_KEYS = { '0': 'p0', '1': 'p1', '2': 'p2', '3': 'p3', '4': 'p4', 'inf': 'pInf' };
const S1 = { cards: {} };
GAL_IDS.forEach(id => { S1.cards[id] = { pred: null, revealed: false }; });
/* 画廊小图（200×150 坐标系） */
const GAL_POLYS = {
  square: [[58, 33], [142, 33], [142, 117], [58, 117]],
  rect: [[26, 48], [174, 48], [174, 102], [26, 102]],
  equi: [[100, 22], [38, 128], [162, 128]],
  iso: [[100, 22], [48, 128], [152, 128]],
  para: [[62, 42], [168, 42], [138, 108], [32, 108]]
};
/* 每条对称轴画成一条线段（200×150 坐标系）；para 为空——一条都没有 */
const GAL_AXES = {
  square: [[[100, 25], [100, 125]], [[50, 75], [150, 75]], [[56, 31], [144, 119]], [[144, 31], [56, 119]]],
  rect: [[[100, 40], [100, 110]], [[18, 75], [182, 75]]],
  equi: [[[100, 14], [100, 136]], [[38, 128], [131, 75]], [[162, 128], [69, 75]]],
  iso: [[[100, 14], [100, 136]]],
  para: [],
  circle: [[[100, 17], [100, 133]], [[42, 75], [158, 75]], [[59, 34], [141, 116]], [[141, 34], [59, 116]]],
  A: [[[100, 16], [100, 134]]],
  H: [[[100, 16], [100, 134]], [[38, 75], [162, 75]]]
};
function cntKey(id) {
  const n = AXIS_COUNTS[id];
  return n === Infinity ? 'cntInf' : 'cnt' + n;
}
function s1DrawCard(id) {
  const cv = $('g-' + id); if (!cv) return;
  const ctx = fitCanvas(cv);
  const W = cv._w, H = cv._h;
  if (W < 10) return;
  ctx.clearRect(0, 0, W, H);
  /* 等比映射（与第 0 步 s0Geom 同款）：统一比例 k + 居中，图形不变形；
     圆半径随 k 取，恒完整落在画布内 */
  const k = Math.min(W / 200, H / 150);
  const ox = (W - 200 * k) / 2, oy = (H - 150 * k) / 2;
  const X = x => ox + x * k, Y = y => oy + y * k;
  if (id === 'circle') {
    ctx.beginPath(); ctx.arc(X(100), Y(75), 50 * k, 0, Math.PI * 2);
    ctx.fillStyle = COL.fill; ctx.fill();
    ctx.lineWidth = 2.2; ctx.strokeStyle = COL.edge; ctx.stroke();
  } else if (id === 'A' || id === 'H') {
    ctx.font = '700 ' + Math.round(88 * k) + 'px Georgia, "Times New Roman", serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = COL.fill2;
    ctx.fillText(id, X(100), Y(78));
    ctx.lineWidth = 2.2; ctx.strokeStyle = COL.edge;
    ctx.strokeStyle = 'rgba(232,237,244,.35)';
    ctx.font = '700 ' + Math.round(88 * k) + 'px Georgia, "Times New Roman", serif';
    ctx.fillText(id, X(100), Y(78));
  } else {
    pathOf(ctx, GAL_POLYS[id].map(p => [X(p[0]), Y(p[1])]));
    ctx.fillStyle = COL.fill; ctx.fill();
    ctx.lineWidth = 2.2; ctx.strokeStyle = COL.edge; ctx.stroke();
  }
  if (S1.cards[id].revealed) {
    ctx.strokeStyle = COL.orange; ctx.lineWidth = 2.2; ctx.setLineDash([7, 5]);
    GAL_AXES[id].forEach(seg => {
      ctx.beginPath();
      ctx.moveTo(X(seg[0][0]), Y(seg[0][1]));
      ctx.lineTo(X(seg[1][0]), Y(seg[1][1]));
      ctx.stroke();
    });
    ctx.setLineDash([]);
    if (id === 'circle') {
      fitText(ctx, '∞', X(100), Y(75), 40, { size: 26, weight: '700', color: COL.orange, align: 'center', baseline: 'middle' });
    }
  }
}
function s1CardReadout(id) {
  const el = $('gal-ro-' + id);
  if (!el) return;
  const st = S1.cards[id];
  let html = '';
  if (st.revealed) {
    const name = t(GAL_NAME_KEYS[id]);
    const nStr = t(cntKey(id));
    const guessStr = st.pred === null ? '' : t(PRED_KEYS[st.pred] === undefined ? 'p0' : (st.pred === 'inf' ? 'pInf' : 'p' + st.pred));
    const actualVal = AXIS_COUNTS[id] === Infinity ? 'inf' : String(AXIS_COUNTS[id]);
    html = (st.pred === actualVal)
      ? t('s1right', { name, n: nStr })
      : t('s1wrong', { name, n: nStr, guess: guessStr });
    if (id === 'para') html += '<br>' + t('s1paraNote');
    if (id === 'circle') html += '<br>' + t('s1circleNote');
  }
  if (el._v !== html) { el._v = html; el.innerHTML = html; }
}
function s1BuildGallery() {
  const wrap = $('s1-gallery');
  wrap.innerHTML = '';
  GAL_IDS.forEach(id => {
    const st = S1.cards[id];
    const card = document.createElement('div');
    card.className = 'gal-card';
    const h3 = document.createElement('h3');
    h3.textContent = t(GAL_NAME_KEYS[id]);
    card.appendChild(h3);
    const cv = document.createElement('canvas');
    cv.id = 'g-' + id;
    cv.setAttribute('height', '150');
    card.appendChild(cv);
    const prow = document.createElement('div');
    prow.className = 'pred-row';
    const lab = document.createElement('span');
    lab.className = 'row-label';
    lab.textContent = t('s1predLab');
    prow.appendChild(lab);
    PRED_VALS.forEach(v => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn' + (st.pred === v ? ' active' : '');
      b.textContent = t(PRED_KEYS[v]);
      b.addEventListener('click', () => {
        S1.cards[id].pred = v;
        s1BuildGallery(); s1CardReadout(id);
      });
      prow.appendChild(b);
    });
    card.appendChild(prow);
    const rb = document.createElement('button');
    rb.type = 'button';
    rb.className = 'btn big primary';
    rb.textContent = t('s1reveal');
    rb.addEventListener('click', () => {
      if (S1.cards[id].pred === null) {
        const el = $('gal-ro-' + id);
        if (el) { el._v = null; el.innerHTML = t('s1norev'); }
        return;
      }
      S1.cards[id].revealed = true;
      s1DrawCard(id); s1CardReadout(id);
    });
    card.appendChild(rb);
    const ro = document.createElement('p');
    ro.className = 'gal-ro';
    ro.id = 'gal-ro-' + id;
    card.appendChild(ro);
    wrap.appendChild(card);
    regCanvas('g-' + id);
  });
  GAL_IDS.forEach(id => { s1DrawCard(id); s1CardReadout(id); });
}
function initS1() {
  onLangRefresh(() => { s1BuildGallery(); });
  onRefit(() => { GAL_IDS.forEach(s1DrawCard); });
  s1BuildGallery();
}

/* ============================================================
   第 2 步：转一转（绕旋转中心转，转到某些角度与原图重合）
   ============================================================ */
const S2 = { shape: 'fan3', angle: 0, token: 0 };
const S2_NAME_KEYS = { fan2: 'rFan2', fan3: 'rFan3', fan4: 'rFan4', leaf: 'rLeaf', para: 'rPara' };
/* 旋转图形的局部多边形（100 单位半径坐标系），可多片（风车叶片） */
function rotPolys(id) {
  if (id === 'fan2' || id === 'fan3' || id === 'fan4') {
    const n = ROT_ORDERS[id];
    const blade = [[0, -13], [19, -30], [11, -78], [0, -92], [-17, -38]];
    const out = [];
    for (let k = 0; k < n; k++) {
      const a = k * 2 * Math.PI / n, c = Math.cos(a), s = Math.sin(a);
      out.push(blade.map(p => [p[0] * c - p[1] * s, p[0] * s + p[1] * c]));
    }
    return out;
  }
  if (id === 'leaf') return [[[0, -80], [40, -34], [34, 28], [2, 74], [-36, 18], [-20, -38]]];
  return [[[-42, -32], [74, -32], [42, 32], [-74, 32]]]; // para
}
function drawRotShape(ctx, id, angleDeg, cx, cy, R, mode) {
  const polys = rotPolys(id);
  const a = angleDeg * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a);
  const k = R / 100;
  polys.forEach(poly => {
    const pts = poly.map(p => [cx + (p[0] * ca - p[1] * sa) * k, cy + (p[0] * sa + p[1] * ca) * k]);
    pathOf(ctx, pts);
    if (mode === 'ghost') {
      ctx.setLineDash([5, 4]); ctx.lineWidth = 1.6; ctx.strokeStyle = 'rgba(154,167,184,.8)'; ctx.stroke(); ctx.setLineDash([]);
    } else if (mode === 'hit') {
      ctx.fillStyle = 'rgba(126,226,168,.75)'; ctx.fill();
      ctx.lineWidth = 2.6; ctx.strokeStyle = COL.green; ctx.stroke();
    } else {
      ctx.fillStyle = 'rgba(110,231,255,.55)'; ctx.fill();
      ctx.lineWidth = 2.2; ctx.strokeStyle = COL.cyan; ctx.stroke();
    }
  });
}
function s2Draw() {
  const cv = $('s2-canvas'); if (!cv) return;
  const ctx = fitCanvas(cv);
  const W = cv._w, H = cv._h;
  if (W < 10) return;
  ctx.clearRect(0, 0, W, H);
  const cx = W / 2, cy = H / 2 + 6;
  const R = Math.min(W, H) / 2 - 52;
  const hit = S2.angle > 0 && rotCoincides(S2.shape, S2.angle);
  /* 0° 刻度线（顶部） */
  ctx.beginPath(); ctx.moveTo(cx, cy - R - 26); ctx.lineTo(cx, cy - R - 10);
  ctx.lineWidth = 2.4; ctx.strokeStyle = COL.orange; ctx.stroke();
  drawRotShape(ctx, S2.shape, 0, cx, cy, R, 'ghost');
  drawRotShape(ctx, S2.shape, S2.angle, cx, cy, R, hit ? 'hit' : 'solid');
  if (hit) {
    ctx.beginPath(); ctx.arc(cx, cy, R + 20, 0, Math.PI * 2);
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(126,226,168,.65)'; ctx.stroke();
  }
  /* 旋转中心 */
  ctx.beginPath(); ctx.arc(cx, cy, 5.5, 0, Math.PI * 2);
  ctx.fillStyle = COL.orange; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = '#08131a'; ctx.stroke();
  fitText(ctx, t('c2center'), cx, cy + R + 40, 150, { size: 12.5, color: COL.orange, align: 'center' });
}
function s2Readouts() {
  const name = t(S2_NAME_KEYS[S2.shape]);
  if (S2.angle === 0) setRO('s2-ro', t('s2roZero'));
  else if (rotCoincides(S2.shape, S2.angle)) setRO('s2-ro', t('s2roYes', { deg: S2.angle }));
  else setRO('s2-ro', t('s2roNo', { deg: S2.angle }));
  setRO('s2-ledger', S2.shape === 'leaf'
    ? t('s2ledgerLeaf')
    : t('s2ledger', { name, min: minRotAngle(S2.shape), n: ROT_ORDERS[S2.shape] }));
  const para = $('s2-para');
  if (para) {
    para.style.display = S2.shape === 'para' ? '' : 'none';
    if (S2.shape === 'para') setRO('s2-para', t('s2paraBack'));
  }
  const val = $('s2-ang-val');
  if (val) val.textContent = S2.angle + '°';
  const sl = $('s2-ang');
  if (sl && +sl.value !== S2.angle) sl.value = S2.angle;
}
function s2SetAngle(deg) {
  S2.angle = clamp(Math.round(deg), 0, 360);
  s2Draw(); s2Readouts();
}
function s2SetShape(id) {
  S2.token++;
  S2.shape = id;
  S2.angle = 0;
  document.querySelectorAll('#s2-shapes .btn').forEach(b => {
    b.classList.toggle('active', b.dataset.shape === id);
  });
  s2Draw(); s2Readouts();
}
function s2Find() {
  const min = minRotAngle(S2.shape);
  const cur = S2.angle;
  let target = min;
  let bestD = Infinity;
  for (let m = min; m <= 360; m += min) {
    const d = Math.abs(m - cur);
    if (d < bestD) { bestD = d; target = m; }
  }
  if (target === cur) { s2Draw(); s2Readouts(); return; }
  S2.token++;
  const tk = S2.token;
  const from = cur, t0 = performance.now(), DUR = 480;
  (function frame(now) {
    if (tk !== S2.token) return;
    const tt = Math.min(1, (now - t0) / DUR);
    S2.angle = Math.round(from + (target - from) * easeIO(tt));
    s2Draw(); s2Readouts();
    if (tt < 1) requestAnimationFrame(frame);
  })(t0);
}
function initS2() {
  regCanvas('s2-canvas');
  const wrap = $('s2-shapes');
  Object.keys(S2_NAME_KEYS).forEach(id => {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.shape = id;
    b.className = 'btn big' + (id === S2.shape ? ' active' : '');
    b.textContent = t(S2_NAME_KEYS[id]);
    b.addEventListener('click', () => s2SetShape(id));
    wrap.appendChild(b);
  });
  $('s2-ang').addEventListener('input', e => { S2.token++; s2SetAngle(+e.target.value); });
  $('s2-find').addEventListener('click', s2Find);
  onLangRefresh(() => {
    S2.token++;
    document.querySelectorAll('#s2-shapes .btn').forEach(b => { b.textContent = t(S2_NAME_KEYS[b.dataset.shape]); });
    s2Draw(); s2Readouts();
  });
  onRefit(() => { s2Draw(); });
  s2Draw(); s2Readouts();
}

/* ============================================================
   第 3 步：万花筒（一份原件 = 旋转复制 ×（镜像时再翻一份））
   ============================================================ */
const S3 = {
  n: 6, mirror: true,
  motifs: [{ type: 'dot', rFrac: 0.55, aFrac: 0.5 }, { type: 'tri', rFrac: 0.42, aFrac: 0.66 }]
};
function s3DrawMotif(ctx, type) {
  if (type === 'dot') {
    ctx.beginPath(); ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
    ctx.fillStyle = COL.orange; ctx.fill();
    ctx.lineWidth = 1.6; ctx.strokeStyle = '#08131a'; ctx.stroke();
  } else if (type === 'seg') {
    ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(0, 16);
    ctx.lineWidth = 4.6; ctx.lineCap = 'round'; ctx.strokeStyle = COL.cyan; ctx.stroke();
    ctx.lineCap = 'butt';
  } else {
    pathOf(ctx, [[13, 0], [-10, -11], [-10, 11]]);
    ctx.fillStyle = COL.green; ctx.fill();
    ctx.lineWidth = 1.6; ctx.strokeStyle = '#08131a'; ctx.stroke();
  }
}
function s3Draw() {
  const cv = $('s3-canvas'); if (!cv) return;
  const ctx = fitCanvas(cv);
  const W = cv._w, H = cv._h;
  if (W < 10) return;
  ctx.clearRect(0, 0, W, H);
  const cx = W / 2, cy = H / 2;
  const R = Math.min(W, H) / 2 - 18;
  const th = 2 * Math.PI / S3.n;
  const start = -Math.PI / 2;
  /* 盘面 */
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fillStyle = '#131a26'; ctx.fill();
  ctx.lineWidth = 1.6; ctx.strokeStyle = COL.grid; ctx.stroke();
  /* 原件区（扇区 0）高亮 */
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, R, start, start + th);
  ctx.closePath();
  ctx.fillStyle = 'rgba(110,231,255,.09)'; ctx.fill();
  /* 扇区分界 */
  ctx.strokeStyle = 'rgba(132,148,171,.5)'; ctx.lineWidth = 1.2;
  for (let k = 0; k < S3.n; k++) {
    const a = start + k * th;
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.lineTo(cx + R * Math.cos(a), cy + R * Math.sin(a));
    ctx.stroke();
  }
  /* 复制每份原件：每扇区一份旋转拷贝；开镜像再加一份翻转拷贝 */
  S3.motifs.forEach(m => {
    for (let k = 0; k < S3.n; k++) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + k * th);
      ctx.rotate(m.aFrac * th);
      ctx.translate(m.rFrac * R, 0);
      s3DrawMotif(ctx, m.type);
      ctx.restore();
      if (S3.mirror) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(start + k * th + th);
        ctx.scale(1, -1);
        ctx.rotate(m.aFrac * th);
        ctx.translate(m.rFrac * R, 0);
        s3DrawMotif(ctx, m.type);
        ctx.restore();
      }
    }
  });
  ctx.beginPath(); ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
  ctx.fillStyle = COL.mut; ctx.fill();
}
function s3Readouts() {
  const m = S3.motifs.length;
  const c = kaleidoCopies(S3.n, S3.mirror);
  if (m === 0) {
    setRO('s3-ro', t('s3empty'));
    setRO('s3-why', '');
  } else {
    setRO('s3-ro', t('s3ro', { m, c, tot: m * c }));
    setRO('s3-why', t(S3.mirror ? 's3roWhyOn' : 's3roWhyOff', { n: S3.n, c }));
  }
  [4, 6, 8].forEach(n => {
    const b = $('s3-sec-' + n);
    if (b) b.classList.toggle('active', S3.n === n);
  });
  const on = $('s3-mir-on'), off = $('s3-mir-off');
  if (on) on.classList.toggle('active', S3.mirror);
  if (off) off.classList.toggle('active', !S3.mirror);
}
function s3Add(type, rFrac, aFrac) {
  S3.motifs.push({ type, rFrac, aFrac });
  s3Draw(); s3Readouts();
}
function initS3() {
  const cv = regCanvas('s3-canvas');
  [4, 6, 8].forEach(n => {
    $('s3-sec-' + n).addEventListener('click', () => { S3.n = n; s3Draw(); s3Readouts(); });
  });
  $('s3-mir-on').addEventListener('click', () => { S3.mirror = true; s3Draw(); s3Readouts(); });
  $('s3-mir-off').addEventListener('click', () => { S3.mirror = false; s3Draw(); s3Readouts(); });
  $('s3-m-dot').addEventListener('click', () => s3Add('dot', 0.55, 0.5));
  $('s3-m-seg').addEventListener('click', () => s3Add('seg', 0.68, 0.36));
  $('s3-m-tri').addEventListener('click', () => s3Add('tri', 0.45, 0.64));
  $('s3-clear').addEventListener('click', () => { S3.motifs = []; s3Draw(); s3Readouts(); });
  /* 点发亮扇区（或任意扇区，自动折回原件区坐标）放圆点 */
  cv.addEventListener('click', e => {
    const r = cv.getBoundingClientRect();
    const W = cv._w, H = cv._h;
    const cx = W / 2, cy = H / 2;
    const R = Math.min(W, H) / 2 - 18;
    const dx = e.clientX - r.left - cx, dy = e.clientY - r.top - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > R || dist < 10) return;
    const th = 2 * Math.PI / S3.n;
    let rel = Math.atan2(dy, dx) - (-Math.PI / 2);
    rel = ((rel % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const aFrac = (rel % th) / th;
    s3Add('dot', dist / R, aFrac);
  });
  onLangRefresh(() => { s3Draw(); s3Readouts(); });
  onRefit(() => { s3Draw(); });
  s3Draw(); s3Readouts();
}

/* ============================================================
   第 4 步：自测（判断 / 选择 / 操作）+ 终章
   判定都是状态的纯函数：refresh 从 S4 重算，改参/切语言不留旧判定。
   ============================================================ */
const S4 = { q1: null, q2: null, q3angle: 0, q3verdict: null };
function s4Draw() {
  const cv = $('s4-canvas'); if (!cv) return;
  const ctx = fitCanvas(cv);
  const W = cv._w, H = cv._h;
  if (W < 10) return;
  ctx.clearRect(0, 0, W, H);
  const cx = W / 2, cy = H / 2;
  const R = Math.min(W, H) / 2 - 34;
  drawRotShape(ctx, 'fan3', 0, cx, cy, R, 'ghost');
  const hit = S4.q3angle > 0 && rotCoincides('fan3', S4.q3angle);
  drawRotShape(ctx, 'fan3', S4.q3angle, cx, cy, R, hit ? 'hit' : 'solid');
  ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2);
  ctx.fillStyle = COL.orange; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = '#08131a'; ctx.stroke();
}
function s4Refresh() {
  const bt = $('s4-q1-t'), bf = $('s4-q1-f');
  if (bt && bf) {
    bt.classList.toggle('wrong', S4.q1 === 't');
    bf.classList.toggle('correct', S4.q1 === 'f');
  }
  setRO('s4-q1-ro', S4.q1 === null ? '' : S4.q1 === 'f' ? t('s4q1win') : t('s4q1lose'));
  ['para', 'rect', 'equi'].forEach(id => {
    const b = $('s4-q2-' + id);
    if (!b) return;
    b.classList.toggle('correct', S4.q2 === id && id === 'para');
    b.classList.toggle('wrong', S4.q2 === id && id !== 'para');
  });
  setRO('s4-q2-ro', S4.q2 === null ? ''
    : S4.q2 === 'para' ? t('s4q2win')
    : t('s4q2lose', { name: t(GAL_NAME_KEYS[S4.q2]) }));
  let q3 = '';
  if (S4.q3verdict === 'win') q3 = t('s4q3win');
  else if (S4.q3verdict === 'again') q3 = t('s4q3again', { deg: S4.q3angle });
  else if (S4.q3verdict === 'zero') q3 = t('s4q3zero');
  else if (S4.q3verdict === 'no') q3 = t('s4q3no', { deg: S4.q3angle });
  setRO('s4-q3-ro', q3);
  const val = $('s4-q3-val');
  if (val) val.textContent = S4.q3angle + '°';
}
function s4Q3Submit() {
  const v = S4.q3angle;
  if (v === 120) S4.q3verdict = 'win';
  else if (v === 0) S4.q3verdict = 'zero';
  else if (v % 120 === 0) S4.q3verdict = 'again';
  else S4.q3verdict = 'no';
  s4Refresh();
}
function initS4() {
  regCanvas('s4-canvas');
  $('s4-q1-t').addEventListener('click', () => { S4.q1 = 't'; s4Refresh(); });
  $('s4-q1-f').addEventListener('click', () => { S4.q1 = 'f'; s4Refresh(); });
  ['para', 'rect', 'equi'].forEach(id => {
    $('s4-q2-' + id).addEventListener('click', () => { S4.q2 = id; s4Refresh(); });
  });
  $('s4-q3-ang').addEventListener('input', e => {
    S4.q3angle = +e.target.value;
    S4.q3verdict = null;      // 改角度即作废旧判定，避免读数与当前角度矛盾
    s4Draw(); s4Refresh();
  });
  $('s4-q3-submit').addEventListener('click', s4Q3Submit);
  onLangRefresh(() => { s4Draw(); s4Refresh(); });
  onRefit(() => { s4Draw(); });
  s4Draw(); s4Refresh();
}

/* ---------- 对账入口（供评审/自测程序化设置状态） ---------- */
window.SYMMETRY_ROTATION = {
  ops: { reflectPoint, isAxis, foldAxesOf, FOLD_SHAPES, AXIS_COUNTS, ROT_ORDERS, minRotAngle, rotCoincides, kaleidoCopies },
  state: { S0, S1, S2, S3, S4 },
  set: {
    s0Shape: id => s0SetShape(id),
    s0Line: id => s0FoldTo(id),
    s1Pred: (id, v) => { S1.cards[id].pred = v; s1BuildGallery(); s1CardReadout(id); },
    s1Reveal: id => { S1.cards[id].revealed = true; s1DrawCard(id); s1CardReadout(id); },
    s2Shape: id => s2SetShape(id),
    s2Angle: deg => { S2.token++; s2SetAngle(deg); },
    s2Find: () => s2Find(),
    s3Sectors: n => { S3.n = n; s3Draw(); s3Readouts(); },
    s3Mirror: m => { S3.mirror = !!m; s3Draw(); s3Readouts(); },
    s3Add: type => s3Add(type, 0.55, 0.5),
    s3Clear: () => { S3.motifs = []; s3Draw(); s3Readouts(); },
    q1: v => { S4.q1 = v; s4Refresh(); },
    q2: id => { S4.q2 = id; s4Refresh(); },
    q3Angle: deg => { S4.q3angle = deg; S4.q3verdict = null; s4Draw(); s4Refresh(); },
    q3Submit: () => s4Q3Submit()
  }
};

/* ---------- 启动（i18n 的 applyLang 已先行运行） ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initS0(); initS1(); initS2(); initS3(); initS4();
});
