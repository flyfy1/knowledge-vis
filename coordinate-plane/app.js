'use strict';
/* 坐标系与点的位置 · 给每个位置一个地址 — 全部逻辑（无依赖，原生 Canvas 2D）
   依赖 i18n.js 先行加载：t() / getLang() / onLangRefresh()。

   ★ 红线落点（对 BRIEF 判定口径）：
   1. 坐标域全页统一 [−6, 6] 整数格；拖点 = 指针像素 → 最近格 round → 钳制，
      状态只存吸附后的整数，读数/标签全部由整数状态纯渲染，禁止像素反推。
   2. 坐标读数唯一生成处 fmtCoord（U+2212 负号、0 不带 +）；象限判定唯一
      纯函数 quadrant，读数行与着色共用；换位点 swap 由 A 状态交换实算、
      不独立存状态，重合 ⟺ x===y（整数精确）。
   3. step1 候选数由网格行列数实算（seatCandidates），不写死。
   4. 自测全对完成句（s5done）在三题全对前不写入 DOM。
   对账入口：window.COORD（fmtCoord / quadrant / swap / seatCandidates / state / geoms）。 */
const $ = id => document.getElementById(id);

/* PURE-BEGIN —— 纯函数区（无 DOM 依赖，自查脚本抽取本区断言） */
const DOM_MIN = -6, DOM_MAX = 6;
function fmtInt(v) { return v < 0 ? '−' + (-v) : String(v); }
/* step0 一维读数：正数带 +（方向显形），0 不带符号 */
function fmtSigned(v) { return v > 0 ? '+' + v : fmtInt(v); }
/* 坐标读数唯一生成处：(x, y)，半角括号、逗号后一空格，负号 U+2212 */
function fmtCoord(x, y) { return '(' + fmtInt(x) + ', ' + fmtInt(y) + ')'; }
/* 象限判定唯一纯函数：返回 origin / xaxis / yaxis / q1 / q2 / q3 / q4 */
function quadrant(x, y) {
  if (x === 0 && y === 0) return 'origin';
  if (y === 0) return 'xaxis';
  if (x === 0) return 'yaxis';
  if (x > 0) return y > 0 ? 'q1' : 'q4';
  return y > 0 ? 'q2' : 'q3';
}
/* 换位点：交换实算，不独立存状态 */
function swap(p) { return { x: p.y, y: p.x }; }
/* step1 座位网格：cols 列 × rows 行；mode: 'col' 只报列 / 'row' 只报行 / 'both' 都报 */
function seatCandidates(cols, rows, mode) {
  if (mode === 'col') return rows;
  if (mode === 'row') return cols;
  if (mode === 'both') return 1;
  return cols * rows;
}
function seatHit(target, col, row) { return target.c === col && target.r === row; }
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
/* 平面坐标系：整数格网 + 双轴（带箭头）+ fmtInt 刻度。
   o: {quadFills:{q1..q4:bool}, diag:bool, xAxis:bool, yAxis:bool, labels:bool, axisNames:bool} */
const QUAD_FILL = {
  q1: 'rgba(126,226,168,.10)', q2: 'rgba(110,231,255,.10)',
  q3: 'rgba(255,122,147,.10)', q4: 'rgba(255,180,84,.10)'
};
const QUAD_COL = { q1: COL.green, q2: COL.cyan, q3: COL.red, q4: COL.orange };
function drawPlane(ctx, g, o) {
  o = o || {};
  const xAxis = o.xAxis !== false, yAxis = o.yAxis !== false;
  const labels = o.labels !== false, names = o.axisNames !== false;
  /* 象限着色（已走到的区域留色） */
  if (o.quadFills) {
    const zx = g.X(0), zy = g.Y(0);
    const quads = {
      q1: [zx, g.oy, g.ox + g.pw - zx, zy - g.oy],
      q2: [g.ox, g.oy, zx - g.ox, zy - g.oy],
      q3: [g.ox, zy, zx - g.ox, g.oy + g.ph - zy],
      q4: [zx, zy, g.ox + g.pw - zx, g.oy + g.ph - zy]
    };
    for (const q in quads) {
      if (!o.quadFills[q]) continue;
      const r = quads[q];
      ctx.fillStyle = QUAD_FILL[q];
      ctx.fillRect(r[0], r[1], r[2], r[3]);
    }
  }
  /* 格网 */
  ctx.lineWidth = 1;
  ctx.strokeStyle = COL.grid;
  ctx.beginPath();
  for (let x = DOM_MIN; x <= DOM_MAX; x++) {
    if (x === 0) continue;
    ctx.moveTo(g.X(x), g.oy); ctx.lineTo(g.X(x), g.oy + g.ph);
  }
  for (let y = DOM_MIN; y <= DOM_MAX; y++) {
    if (y === 0) continue;
    ctx.moveTo(g.ox, g.Y(y)); ctx.lineTo(g.ox + g.pw, g.Y(y));
  }
  ctx.stroke();
  /* 对角线（换位实验的镜面） */
  if (o.diag) {
    ctx.strokeStyle = 'rgba(154,167,184,.55)'; ctx.lineWidth = 1.4; ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.moveTo(g.X(DOM_MIN - 0.6), g.Y(DOM_MIN - 0.6));
    ctx.lineTo(g.X(DOM_MAX + 0.6), g.Y(DOM_MAX + 0.6));
    ctx.stroke();
    ctx.setLineDash([]);
    /* 标签锚右下角、远离对角线两端与点标签带（S1）：原锚右上 (5.9, 4.7) 正压 (1, 4) 点标签 */
    cTextTag(ctx, t('s3diag'), g.X(6.45), g.Y(-6.18), COL.mut, 'right', 11.5);
  }
  /* 坐标轴 + 箭头 */
  ctx.strokeStyle = COL.axis; ctx.lineWidth = 1.6;
  ctx.fillStyle = COL.axis;
  if (xAxis) {
    const zy = g.Y(0);
    ctx.beginPath(); ctx.moveTo(g.ox, zy); ctx.lineTo(g.ox + g.pw, zy); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(g.ox + g.pw, zy); ctx.lineTo(g.ox + g.pw - 8, zy - 4); ctx.lineTo(g.ox + g.pw - 8, zy + 4);
    ctx.closePath(); ctx.fill();
  }
  if (yAxis) {
    const zx = g.X(0);
    ctx.beginPath(); ctx.moveTo(zx, g.oy + g.ph); ctx.lineTo(zx, g.oy); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(zx, g.oy); ctx.lineTo(zx - 4, g.oy + 8); ctx.lineTo(zx + 4, g.oy + 8);
    ctx.closePath(); ctx.fill();
  }
  if (labels) {
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillStyle = COL.mut;
    if (xAxis) {
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      for (let x = DOM_MIN; x <= DOM_MAX; x++) {
        if (x === 0) continue;
        ctx.fillText(fmtInt(x), g.X(x), g.Y(0) + 5);
      }
    }
    if (yAxis) {
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      for (let y = DOM_MIN; y <= DOM_MAX; y++) {
        if (y === 0) continue;
        ctx.fillText(fmtInt(y), g.X(0) - 6, g.Y(y));
      }
    }
    if (xAxis && yAxis) {
      ctx.textAlign = 'right'; ctx.textBaseline = 'top';
      ctx.fillText('0', g.X(0) - 5, g.Y(0) + 4);
    }
    ctx.textBaseline = 'alphabetic';
  }
  if (names) {
    ctx.fillStyle = COL.mut; ctx.font = 'italic 13px system-ui, sans-serif';
    if (xAxis) { ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'; ctx.fillText('x', g.ox + g.pw - 2, g.Y(0) - 6); }
    if (yAxis) { ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillText('y', g.X(0) + 7, g.oy + 2); }
    ctx.textBaseline = 'alphabetic';
  }
}
/* 点标签：按点位置选侧，避免出界 */
function pointTag(ctx, g, x, y, text, color) {
  const px = g.X(x), py = g.Y(y);
  const align = x >= 4 ? 'right' : 'left';
  const tx = px + (align === 'right' ? -11 : 11);
  const ty = y >= 5 ? py + 15 : py - 15;
  cTextTag(ctx, text, tx, ty, color, align, 13);
}
/* 指针 → 画布 CSS 像素 */
function canvasPos(cv, ev) {
  const r = cv.getBoundingClientRect();
  return { x: ev.clientX - r.left, y: ev.clientY - r.top };
}
/* 像素 → 最近整数格（round + 域钳制）：全页唯一的吸附实现 */
function snapCell(g, pos) {
  return {
    x: clamp(Math.round(g.toDataX(pos.x)), DOM_MIN, DOM_MAX),
    y: clamp(Math.round(g.toDataY(pos.y)), DOM_MIN, DOM_MAX)
  };
}

/* ---------- 对账状态 ---------- */
const TARGET_SEAT = { c: 3, r: 2 };
const SEAT_COLS = 7, SEAT_ROWS = 5;
const COORD = {
  fmtCoord: fmtCoord, fmtInt: fmtInt, quadrant: quadrant, swap: swap,
  seatCandidates: seatCandidates,
  state: {}, geoms: {}
};
window.COORD = COORD;

/* ============================================================
   第 0 步：一维地址——数轴拖点 + 换原点
   状态 p = 点在轴上的绝对位置（整数）；o = 原点偏移（0 或 2）；读数 = p − o
   ============================================================ */
const S0 = { p: 4, o: 0, drag: false, note: null }; /* note: 被域守卫拦下的换原点目标读数（仅提示，不执行） */
COORD.state.s0 = S0;
function s0Reading() { return S0.p - S0.o; }
function drawS0() {
  const cv = regCanvas('s0-canvas');
  const ctx = fitCanvas(cv);
  const g = plotGeom(cv, [-8.6, 8.6], [-1.9, 1.9], false);
  COORD.geoms.s0 = g;
  ctx.clearRect(0, 0, cv._w, cv._h);
  const zy = g.Y(0);
  /* 轴线 + 箭头 */
  ctx.strokeStyle = COL.axis; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(g.X(-8.5), zy); ctx.lineTo(g.X(8.5), zy); ctx.stroke();
  ctx.fillStyle = COL.axis;
  ctx.beginPath();
  ctx.moveTo(g.X(8.5), zy); ctx.lineTo(g.X(8.5) - 9, zy - 4.5); ctx.lineTo(g.X(8.5) - 9, zy + 4.5);
  ctx.closePath(); ctx.fill();
  /* 刻度：标签 −6…6 相对当前原点 */
  ctx.font = '11.5px system-ui, sans-serif';
  ctx.fillStyle = COL.mut;
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  for (let L = DOM_MIN; L <= DOM_MAX; L++) {
    const ax = g.X(S0.o + L);
    ctx.strokeStyle = L === 0 ? COL.orange : COL.axis;
    ctx.lineWidth = L === 0 ? 2 : 1.2;
    ctx.beginPath(); ctx.moveTo(ax, zy - (L === 0 ? 8 : 5)); ctx.lineTo(ax, zy + (L === 0 ? 8 : 5)); ctx.stroke();
    if (L !== 0) ctx.fillText(fmtInt(L), ax, zy + 12);
  }
  ctx.textBaseline = 'alphabetic';
  /* 原来的原点（换原点后留影） */
  if (S0.o !== 0) {
    const gx = g.X(0);
    ctx.beginPath(); ctx.arc(gx, zy, 5, 0, Math.PI * 2);
    ctx.lineWidth = 1.4; ctx.strokeStyle = COL.mut; ctx.stroke();
    cText(ctx, t('s0oldOrigin'), gx, zy + 36, COL.mut, 'center', 11);
  }
  /* 当前原点 */
  const ox = g.X(S0.o);
  ctx.beginPath(); ctx.arc(ox, zy, 6, 0, Math.PI * 2);
  ctx.lineWidth = 2; ctx.strokeStyle = COL.orange; ctx.stroke();
  cText(ctx, 'O', ox, zy - 20, COL.orange, 'center', 13);
  cText(ctx, '0', ox, zy + 13, COL.orange, 'center', 11.5);
  /* 可拖点 + 读数牌 */
  const px = g.X(S0.p);
  drawDot(ctx, px, zy, COL.cyan, 8);
  cTextTag(ctx, fmtSigned(s0Reading()), px, zy - 26, COL.cyan, 'center', 14.5);
}
function renderS0() {
  drawS0();
  const r = s0Reading();
  let html;
  if (r > 0) html = t('s0roPos', { n: r });
  else if (r < 0) html = t('s0roNeg', { n: -r });
  else html = t('s0roZero');
  if (S0.o !== 0) html += '<br>' + t('s0shiftNote', { o: fmtSigned(S0.o), r: fmtSigned(r) });
  if (S0.note !== null) html += '<br>' + t('s0blocked', { r: fmtSigned(S0.note) });
  setRO('s0-ro', html);
  $('s0-shift').textContent = t(S0.o !== 0 ? 's0unshift' : 's0shift');
}
function s0SetFromEvent(ev) {
  const cv = $('s0-canvas');
  const g = COORD.geoms.s0;
  if (!g) return;
  const pos = canvasPos(cv, ev);
  S0.p = clamp(Math.round(g.toDataX(pos.x)), S0.o + DOM_MIN, S0.o + DOM_MAX);
  S0.note = null; /* 拖动即清掉换原点被拦的提示 */
  renderS0();
}
function bindS0() {
  const cv = $('s0-canvas');
  cv.classList.add('dragc');
  cv.addEventListener('pointerdown', ev => {
    S0.drag = true;
    try { cv.setPointerCapture(ev.pointerId); } catch (e) { /* 忽略 */ }
    s0SetFromEvent(ev);
  });
  cv.addEventListener('pointermove', ev => { if (S0.drag) s0SetFromEvent(ev); });
  cv.addEventListener('pointerup', () => { S0.drag = false; });
  cv.addEventListener('pointercancel', () => { S0.drag = false; });
  $('s0-shift').addEventListener('click', () => {
    const newO = S0.o === 0 ? 2 : 0;
    const nr = S0.p - newO;
    /* 域守卫（M1）：换原点后读数若越出 [−6, 6]（点停在端点时可达 ±8），
       本次不挪原点、点也不挪窝，只在读数行给出提示——读数永不越出同屏刻度标注域 */
    if (nr < DOM_MIN || nr > DOM_MAX) { S0.note = nr; renderS0(); return; }
    S0.o = newO;
    S0.note = null;
    /* 点不挪窝：绝对位置 p 不变，读数随原点变 */
    renderS0();
  });
  $('s0-start').addEventListener('click', () => {
    document.getElementById('step1').scrollIntoView({ behavior: 'smooth' });
  });
}

/* ============================================================
   第 1 步：座位——一个数只定出一条线
   ============================================================ */
const S1 = { col: 3, row: 2, mode: 'none' };
COORD.state.s1 = S1;
function drawS1() {
  const cv = regCanvas('s1-canvas');
  const ctx = fitCanvas(cv);
  const g = plotGeom(cv, [0.2, 7.8], [0.2, 5.8], true);
  COORD.geoms.s1 = g;
  ctx.clearRect(0, 0, cv._w, cv._h);
  const hit = S1.mode === 'both' && seatHit(TARGET_SEAT, S1.col, S1.row);
  for (let c = 1; c <= SEAT_COLS; c++) {
    for (let r = 1; r <= SEAT_ROWS; r++) {
      const x0 = g.X(c - 0.44), x1 = g.X(c + 0.44);
      const y0 = g.Y(r + 0.44), y1 = g.Y(r - 0.44);
      let fill = '#1c2330', line = COL.grid;
      if (S1.mode === 'col' && c === S1.col) { fill = 'rgba(110,231,255,.30)'; line = COL.cyan; }
      if (S1.mode === 'row' && r === S1.row) { fill = 'rgba(110,231,255,.30)'; line = COL.cyan; }
      if (S1.mode === 'both') {
        if (c === S1.col || r === S1.row) fill = 'rgba(110,231,255,.14)';
        if (c === S1.col && r === S1.row) { fill = 'rgba(255,180,84,.40)'; line = COL.orange; }
      }
      ctx.fillStyle = fill;
      ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
      ctx.strokeStyle = line; ctx.lineWidth = 1.2;
      ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
      if (hit && c === TARGET_SEAT.c && r === TARGET_SEAT.r) {
        cText(ctx, '★', g.X(c), g.Y(r) + 1, '#ffd76a', 'center', 24);
      }
    }
  }
  /* 边号与说明 */
  ctx.font = '12.5px system-ui, sans-serif';
  ctx.fillStyle = COL.mut;
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  for (let c = 1; c <= SEAT_COLS; c++) ctx.fillText(String(c), g.X(c), g.Y(0.56) + 6);
  ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  for (let r = 1; r <= SEAT_ROWS; r++) ctx.fillText(String(r), g.X(0.56) - 8, g.Y(r));
  ctx.textBaseline = 'alphabetic';
  cText(ctx, t('s1colsCap'), g.X(7.7), g.Y(0.56) + 7, COL.mut, 'right', 12);
  cText(ctx, t('s1rowsCap'), g.ox + 2, g.oy + 6, COL.mut, 'left', 12);
  if (hit) {
    cTextTag(ctx, t('s1target'), g.X(TARGET_SEAT.c), g.Y(TARGET_SEAT.r) - 26, '#ffd76a', 'center', 13);
  }
}
function renderS1() {
  drawS1();
  $('s1-col-val').textContent = String(S1.col);
  $('s1-row-val').textContent = String(S1.row);
  ['col', 'row', 'both'].forEach(m => {
    $('s1-m' + m).classList.toggle('active', S1.mode === m);
  });
  let html;
  if (S1.mode === 'col') html = t('s1roCol', { c: S1.col, n: seatCandidates(SEAT_COLS, SEAT_ROWS, 'col') });
  else if (S1.mode === 'row') html = t('s1roRow', { r: S1.row, n: seatCandidates(SEAT_COLS, SEAT_ROWS, 'row') });
  else if (S1.mode === 'both') {
    html = seatHit(TARGET_SEAT, S1.col, S1.row)
      ? t('s1roBothHit', { c: S1.col, r: S1.row })
      : t('s1roBothMiss', { c: S1.col, r: S1.row });
  } else html = t('s1roIdle');
  setRO('s1-ro', html);
}
function bindS1() {
  $('s1-col').addEventListener('input', e => { S1.col = parseInt(e.target.value, 10); renderS1(); });
  $('s1-row').addEventListener('input', e => { S1.row = parseInt(e.target.value, 10); renderS1(); });
  ['col', 'row', 'both'].forEach(m => {
    $('s1-m' + m).addEventListener('click', () => { S1.mode = m; renderS1(); });
  });
}

/* ============================================================
   第 2 步：坐标系登场——搭系动画 + 点选路径 + 自由拖点
   ============================================================ */
const S2_PRESETS = [
  { x: 3, y: -2 }, { x: -4, y: 2 }, { x: 2, y: 3 }, { x: -3, y: -4 }
];
const S2 = {
  active: { x: 3, y: -2 },   /* 当前读数对应的点（预置点或自由点，均为整数状态） */
  free: { x: 5, y: 4 },
  pathAnim: null,           /* {x, y, t0} 路径生长动画 */
  buildAnim: null,          /* {t0} 搭系动画 */
  dragFree: false,
  token: 0
};
COORD.state.s2 = S2;
const PATH_DUR = 950, BUILD_DUR = 2100;
function s2PathProgress() {
  if (!S2.pathAnim) return 1;
  return clamp((performance.now() - S2.pathAnim.t0) / PATH_DUR, 0, 1);
}
function s2BuildPhase() {
  if (!S2.buildAnim) return 3;
  const p = (performance.now() - S2.buildAnim.t0) / BUILD_DUR;
  if (p >= 1) return 3;
  return Math.floor(p * 3); /* 0 横轴 / 1 纵轴 / 2 原点对齐 */
}
function drawS2() {
  const cv = regCanvas('s2-canvas');
  const ctx = fitCanvas(cv);
  const g = plotGeom(cv, [-6.6, 6.6], [-6.6, 6.6], true);
  COORD.geoms.s2 = g;
  ctx.clearRect(0, 0, cv._w, cv._h);
  const phase = s2BuildPhase();
  drawPlane(ctx, g, {
    xAxis: true, yAxis: phase >= 1,
    labels: phase >= 2, axisNames: phase >= 2
  });
  if (S2.buildAnim) {
    cTextTag(ctx, t('s2bPh' + (phase + 1)), g.ox + 10, g.oy + 16, COL.cyan, 'left', 13.5);
    if (phase < 2) return; /* 搭系未成：点与路径暂不出现 */
  }
  /* 当前点的路径：先横（青）后纵（橙），按动画进度生长；走完后补虚线投影 */
  const pt = S2.active;
  const pr = s2PathProgress();
  const segX = clamp(pr / 0.55, 0, 1);
  const segY = clamp((pr - 0.55) / 0.45, 0, 1);
  const zx = g.X(0), zy = g.Y(0), px = g.X(pt.x), py = g.Y(pt.y);
  ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.strokeStyle = COL.cyan;
  ctx.beginPath(); ctx.moveTo(zx, zy); ctx.lineTo(zx + (px - zx) * segX, zy); ctx.stroke();
  if (segY > 0) {
    ctx.strokeStyle = COL.orange;
    ctx.beginPath(); ctx.moveTo(px, zy); ctx.lineTo(px, zy + (py - zy) * segY); ctx.stroke();
  }
  ctx.lineCap = 'butt';
  if (pr >= 1) {
    ctx.strokeStyle = 'rgba(154,167,184,.4)'; ctx.lineWidth = 1.2; ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(px, zy); ctx.lineTo(px, py);
    ctx.moveTo(zx, py); ctx.lineTo(px, py);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  /* 预置点（青） */
  S2_PRESETS.forEach(p => {
    drawDot(ctx, g.X(p.x), g.Y(p.y), COL.cyan, 5);
  });
  /* 自由点（橙） */
  drawDot(ctx, g.X(S2.free.x), g.Y(S2.free.y), COL.orange, 7);
  /* 活动点描环 + 坐标牌 */
  ctx.beginPath(); ctx.arc(px, py, 10.5, 0, Math.PI * 2);
  ctx.lineWidth = 1.8; ctx.strokeStyle = COL.ink; ctx.stroke();
  pointTag(ctx, g, pt.x, pt.y, fmtCoord(pt.x, pt.y), COL.ink);
}
function renderS2() {
  drawS2();
  const pt = S2.active;
  setRO('s2-ro', t('s2ro', { xs: fmtInt(pt.x), ys: fmtInt(pt.y), coord: fmtCoord(pt.x, pt.y) }));
}
function s2RunAnims() {
  const token = S2.token;
  function frame() {
    if (token !== S2.token) return;
    drawS2();
    const busy = (S2.pathAnim && s2PathProgress() < 1) || (S2.buildAnim && s2BuildPhase() < 3);
    if (busy) requestAnimationFrame(frame);
    else { S2.pathAnim = null; S2.buildAnim = null; renderS2(); }
  }
  requestAnimationFrame(frame);
}
function s2SelectPreset(p) {
  S2.token++;
  S2.buildAnim = null;
  S2.active = { x: p.x, y: p.y };
  S2.pathAnim = { x: p.x, y: p.y, t0: performance.now() };
  renderS2();
  s2RunAnims();
}
function bindS2() {
  const cv = $('s2-canvas');
  cv.classList.add('dragc');
  cv.addEventListener('pointerdown', ev => {
    const g = COORD.geoms.s2;
    if (!g || s2BuildPhase() < 3) return;
    const pos = canvasPos(cv, ev);
    let best = null, bd = 1e9;
    S2_PRESETS.forEach(p => {
      const d = Math.hypot(g.X(p.x) - pos.x, g.Y(p.y) - pos.y);
      if (d < bd) { bd = d; best = p; }
    });
    if (best && bd <= 42) { s2SelectPreset(best); return; }
    const df = Math.hypot(g.X(S2.free.x) - pos.x, g.Y(S2.free.y) - pos.y);
    if (df <= 36) {
      S2.dragFree = true;
      S2.token++;
      S2.pathAnim = null;
      try { cv.setPointerCapture(ev.pointerId); } catch (e) { /* 忽略 */ }
    }
  });
  cv.addEventListener('pointermove', ev => {
    if (!S2.dragFree) return;
    const g = COORD.geoms.s2;
    if (!g) return;
    const cell = snapCell(g, canvasPos(cv, ev));
    S2.free = cell;
    S2.active = { x: cell.x, y: cell.y };
    renderS2();
  });
  const endDrag = () => { S2.dragFree = false; };
  cv.addEventListener('pointerup', endDrag);
  cv.addEventListener('pointercancel', endDrag);
  $('s2-build').addEventListener('click', () => {
    S2.token++;
    S2.pathAnim = null;
    S2.buildAnim = { t0: performance.now() };
    s2RunAnims();
  });
}

/* ============================================================
   第 3 步：顺序不能反——A 与换位点 A′(swap 实算)
   换位实现选择（报告注明）：点交换钮后 A 与 A′ 同步对换位置（动画互换），
   两点始终同屏、无消隐帧；动画结束时整数状态正式对调。
   ============================================================ */
const S3 = { ax: 3, ay: 2, anim: null, drag: false, token: 0 };
COORD.state.s3 = S3;
const SWAP_DUR = 560;
function s3Positions() {
  /* 当前帧两点坐标（动画中为插值实数，仅供绘制；状态仍是整数） */
  if (S3.anim) {
    const a = S3.anim;
    const p = clamp((performance.now() - a.t0) / SWAP_DUR, 0, 1);
    const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    return {
      A: { x: a.fromA.x + (a.toA.x - a.fromA.x) * e, y: a.fromA.y + (a.toA.y - a.fromA.y) * e },
      B: { x: a.fromB.x + (a.toB.x - a.fromB.x) * e, y: a.fromB.y + (a.toB.y - a.fromB.y) * e },
      done: p >= 1
    };
  }
  return { A: { x: S3.ax, y: S3.ay }, B: swap({ x: S3.ax, y: S3.ay }), done: true };
}
function drawS3() {
  const cv = regCanvas('s3-canvas');
  const ctx = fitCanvas(cv);
  const g = plotGeom(cv, [-6.6, 6.6], [-6.6, 6.6], true);
  COORD.geoms.s3 = g;
  ctx.clearRect(0, 0, cv._w, cv._h);
  drawPlane(ctx, g, { diag: true });
  const pos = s3Positions();
  const A = pos.A, B = pos.B;
  const coincide = S3.ax === S3.ay && !S3.anim;
  /* 连线 A—A′ */
  ctx.strokeStyle = 'rgba(232,237,244,.45)'; ctx.lineWidth = 1.4; ctx.setLineDash([5, 4]);
  ctx.beginPath(); ctx.moveTo(g.X(A.x), g.Y(A.y)); ctx.lineTo(g.X(B.x), g.Y(B.y)); ctx.stroke();
  ctx.setLineDash([]);
  if (coincide) {
    drawDot(ctx, g.X(A.x), g.Y(A.y), COL.green, 7.5);
    pointTag(ctx, g, S3.ax, S3.ay, 'A = A′ ' + fmtCoord(S3.ax, S3.ay), COL.green);
  } else {
    drawDot(ctx, g.X(B.x), g.Y(B.y), COL.orange, 6.5);
    drawDot(ctx, g.X(A.x), g.Y(A.y), COL.cyan, 6.5);
    pointTag(ctx, g, Math.round(A.x), Math.round(A.y), 'A ' + fmtCoord(S3.ax, S3.ay), COL.cyan);
    pointTag(ctx, g, Math.round(B.x), Math.round(B.y), 'A′ ' + fmtCoord(S3.ay, S3.ax), COL.orange);
  }
}
function renderS3() {
  drawS3();
  $('s3-x-val').textContent = 'x = ' + fmtInt(S3.ax);
  $('s3-y-val').textContent = 'y = ' + fmtInt(S3.ay);
  if (document.activeElement !== $('s3-x')) $('s3-x').value = String(S3.ax);
  if (document.activeElement !== $('s3-y')) $('s3-y').value = String(S3.ay);
  if (S3.ax === S3.ay) {
    setRO('s3-ro', t('s3roSame', { a: fmtCoord(S3.ax, S3.ay) }));
  } else {
    setRO('s3-ro', t('s3roDiff', {
      a: fmtCoord(S3.ax, S3.ay), b: fmtCoord(S3.ay, S3.ax),
      dx: Math.abs(S3.ax - S3.ay), dy: Math.abs(S3.ay - S3.ax)
    }));
  }
}
function s3FinishAnim() {
  if (!S3.anim) return;
  const toA = S3.anim.toA;
  S3.anim = null;
  S3.ax = toA.x;
  S3.ay = toA.y;
  renderS3();
}
function s3Swap() {
  if (S3.anim) { s3FinishAnim(); return; }
  if (S3.ax === S3.ay) { renderS3(); return; } /* 对角线上：换位还是自己，无需动画 */
  const token = ++S3.token;
  S3.anim = {
    t0: performance.now(),
    fromA: { x: S3.ax, y: S3.ay }, toA: { x: S3.ay, y: S3.ax },
    fromB: { x: S3.ay, y: S3.ax }, toB: { x: S3.ax, y: S3.ay }
  };
  function frame() {
    if (token !== S3.token) return;
    const pos = s3Positions();
    drawS3();
    if (pos.done) s3FinishAnim();
    else requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
function s3Set(x, y) {
  /* 外部改 A（滑杆/拖动）：动画干净收束——取消动画（状态仍是动画前的整数
     坐标，A 就停在原地），随即应用新值，不留中间态 */
  if (S3.anim) { S3.token++; S3.anim = null; }
  S3.ax = clamp(x, DOM_MIN, DOM_MAX);
  S3.ay = clamp(y, DOM_MIN, DOM_MAX);
  renderS3();
}
function bindS3() {
  const cv = $('s3-canvas');
  cv.classList.add('dragc');
  $('s3-x').addEventListener('input', e => s3Set(parseInt(e.target.value, 10), S3.ay));
  $('s3-y').addEventListener('input', e => s3Set(S3.ax, parseInt(e.target.value, 10)));
  $('s3-swap').addEventListener('click', s3Swap);
  cv.addEventListener('pointerdown', ev => {
    const g = COORD.geoms.s3;
    if (!g) return;
    const pos = canvasPos(cv, ev);
    const cur = s3Positions().A;
    const d = Math.hypot(g.X(cur.x) - pos.x, g.Y(cur.y) - pos.y);
    if (d <= 38) {
      S3.drag = true;
      try { cv.setPointerCapture(ev.pointerId); } catch (e) { /* 忽略 */ }
    }
  });
  cv.addEventListener('pointermove', ev => {
    if (!S3.drag) return;
    const g = COORD.geoms.s3;
    if (!g) return;
    const cell = snapCell(g, canvasPos(cv, ev));
    s3Set(cell.x, cell.y);
  });
  const endDrag = () => { S3.drag = false; };
  cv.addEventListener('pointerup', endDrag);
  cv.addEventListener('pointercancel', endDrag);
}

/* ============================================================
   第 4 步：四象限——拖点集牌 + 只给符号找区域
   ============================================================ */
const QUAD_SIGNS = { q1: '(+, +)', q2: '(−, +)', q3: '(−, −)', q4: '(+, −)' };
const QUAD_KEYS = ['q1', 'q2', 'q3', 'q4'];
const S4 = {
  x: 2, y: -3,
  found: {},                 /* 已走到的象限 {q1:true,...} */
  prac: { q: 'q3', msg: null }, /* msg: {kind:'ok'|'no'|'axis', ...} */
  downPos: null, downCell: null
};
COORD.state.s4 = S4;
function s4NoteVisit() {
  const q = quadrant(S4.x, S4.y);
  if (QUAD_KEYS.includes(q)) S4.found[q] = true;
}
function drawS4() {
  const cv = regCanvas('s4-canvas');
  const ctx = fitCanvas(cv);
  const g = plotGeom(cv, [-6.6, 6.6], [-6.6, 6.6], true);
  COORD.geoms.s4 = g;
  ctx.clearRect(0, 0, cv._w, cv._h);
  drawPlane(ctx, g, { quadFills: S4.found });
  /* 已集齐区域的符号牌 */
  const badgePos = { q1: [5.2, 5.2], q2: [-5.2, 5.2], q3: [-5.2, -5.2], q4: [5.2, -5.2] };
  QUAD_KEYS.forEach(q => {
    if (!S4.found[q]) return;
    const bp = badgePos[q];
    cTextTag(ctx, QUAD_SIGNS[q], g.X(bp[0]), g.Y(bp[1]), QUAD_COL[q], 'center', 15);
  });
  /* 可拖点 */
  drawDot(ctx, g.X(S4.x), g.Y(S4.y), COL.cyan, 7.5);
  pointTag(ctx, g, S4.x, S4.y, fmtCoord(S4.x, S4.y), COL.ink);
}
function renderS4() {
  s4NoteVisit();
  drawS4();
  const q = quadrant(S4.x, S4.y);
  const coord = fmtCoord(S4.x, S4.y);
  let html;
  if (q === 'origin') html = t('s4roOrigin', { coord: coord });
  else if (q === 'xaxis') html = t('s4roXAxis', { coord: coord });
  else if (q === 'yaxis') html = t('s4roYAxis', { coord: coord });
  else {
    html = t('s4ro', {
      coord: coord,
      sx: S4.x > 0 ? '+' : '−', sy: S4.y > 0 ? '+' : '−',
      region: t('qname' + q.slice(1))
    });
  }
  setRO('s4-ro', html);
  const all = QUAD_KEYS.every(k => S4.found[k]);
  setRO('s4-ro2', all ? t('s4ro2') : '');
  renderS4Prac();
}
function renderS4Prac() {
  const prac = S4.prac;
  let html = '';
  if (prac.msg) {
    if (prac.msg.kind === 'ok') {
      html = t('s4pOk', { signs: QUAD_SIGNS[prac.msg.q], region: t('qname' + prac.msg.q.slice(1)) }) + '<br>';
    } else if (prac.msg.kind === 'no') {
      html = t('s4pNo', { got: t('qname' + prac.msg.got.slice(1)) }) + '<br>';
    } else if (prac.msg.kind === 'axis') {
      html = t('s4pAxis') + '<br>';
    }
  }
  html += t('s4pCombo', { signs: QUAD_SIGNS[prac.q] });
  setRO('s4-prac-ro', html);
}
function s4NewCombo() {
  let nq;
  do { nq = QUAD_KEYS[Math.floor(Math.random() * 4)]; } while (nq === S4.prac.q);
  S4.prac.q = nq;
  S4.prac.msg = null;
  renderS4Prac();
}
function s4Judge(cell) {
  const q = quadrant(cell.x, cell.y);
  if (!QUAD_KEYS.includes(q)) {
    S4.prac.msg = { kind: 'axis' };
  } else if (q === S4.prac.q) {
    S4.prac.msg = { kind: 'ok', q: S4.prac.q };
    let nq;
    do { nq = QUAD_KEYS[Math.floor(Math.random() * 4)]; } while (nq === S4.prac.q);
    S4.prac.q = nq; /* 答对自动换下一组合；msg 保留上一题的对勾反馈 */
  } else {
    S4.prac.msg = { kind: 'no', got: q };
  }
  renderS4Prac();
}
function s4Set(x, y) {
  S4.x = clamp(x, DOM_MIN, DOM_MAX);
  S4.y = clamp(y, DOM_MIN, DOM_MAX);
  renderS4();
}
function bindS4() {
  const cv = $('s4-canvas');
  cv.classList.add('dragc');
  cv.addEventListener('pointerdown', ev => {
    const g = COORD.geoms.s4;
    if (!g) return;
    const pos = canvasPos(cv, ev);
    S4.downPos = pos;
    S4.downCell = snapCell(g, pos);
    try { cv.setPointerCapture(ev.pointerId); } catch (e) { /* 忽略 */ }
    s4Set(S4.downCell.x, S4.downCell.y);
  });
  cv.addEventListener('pointermove', ev => {
    if (!S4.downPos) return;
    const g = COORD.geoms.s4;
    if (!g) return;
    const cell = snapCell(g, canvasPos(cv, ev));
    if (cell.x !== S4.x || cell.y !== S4.y) s4Set(cell.x, cell.y);
  });
  cv.addEventListener('pointerup', ev => {
    if (!S4.downPos) return;
    const moved = Math.hypot(ev.clientX - (S4.downPos.x + cv.getBoundingClientRect().left),
      ev.clientY - (S4.downPos.y + cv.getBoundingClientRect().top));
    const wasClick = moved < 6 && S4.downCell &&
      S4.downCell.x === S4.x && S4.downCell.y === S4.y;
    S4.downPos = null;
    if (wasClick) s4Judge(S4.downCell); /* 点格 = 放点 + 反向小练作答；拖动只逛不答 */
  });
  cv.addEventListener('pointercancel', () => { S4.downPos = null; });
  $('s4-new').addEventListener('click', s4NewCombo);
}

/* ============================================================
   第 5 步 · 题 1：读坐标（目标 (−4, −3)，选项含换位干扰项）
   ============================================================ */
const Q1 = { picked: [], done: false };
COORD.state.q1 = Q1;
const Q1_TARGET = { x: -4, y: -3 };
const Q1_OPTS = [
  { x: -4, y: -3 }, { x: -3, y: -4 }, { x: 4, y: -3 }
];
const Q1_ANSWER = 0;
function drawQ1() {
  const cv = regCanvas('s5q1-canvas');
  const ctx = fitCanvas(cv);
  const g = plotGeom(cv, [-6.6, 6.6], [-6.6, 6.6], true);
  COORD.geoms.q1 = g;
  ctx.clearRect(0, 0, cv._w, cv._h);
  drawPlane(ctx, g, {});
  drawDot(ctx, g.X(Q1_TARGET.x), g.Y(Q1_TARGET.y), COL.orange, 7.5);
}
function renderQ1() {
  drawQ1();
  Q1_OPTS.forEach((o, i) => {
    const btn = $('s5q1-o' + i);
    btn.textContent = fmtCoord(o.x, o.y);
    btn.classList.toggle('correct', Q1.done && i === Q1_ANSWER);
    btn.classList.toggle('wrong', Q1.picked.includes(i));
    btn.disabled = Q1.done || Q1.picked.includes(i);
  });
  if (Q1.done) setRO('s5q1-ro', t('q1ok'));
  else if (Q1.picked.length) setRO('s5q1-ro', t('q1no'));
  else setRO('s5q1-ro', '');
  renderS5Done();
}

/* ============================================================
   第 5 步 · 题 2：按坐标放点（目标 (−2, 3)，点格整数精确判定）
   ============================================================ */
const Q2 = { placed: null, done: false };
COORD.state.q2 = Q2;
const Q2_TARGET = { x: -2, y: 3 };
function drawQ2() {
  const cv = regCanvas('s5q2-canvas');
  const ctx = fitCanvas(cv);
  const g = plotGeom(cv, [-6.6, 6.6], [-6.6, 6.6], true);
  COORD.geoms.q2 = g;
  ctx.clearRect(0, 0, cv._w, cv._h);
  drawPlane(ctx, g, {});
  if (Q2.placed) {
    drawDot(ctx, g.X(Q2.placed.x), g.Y(Q2.placed.y), Q2.done ? COL.green : COL.orange, 7.5);
    pointTag(ctx, g, Q2.placed.x, Q2.placed.y, fmtCoord(Q2.placed.x, Q2.placed.y), Q2.done ? COL.green : COL.orange);
  }
}
function renderQ2() {
  drawQ2();
  if (Q2.done) setRO('s5q2-ro', t('q2ok'));
  else if (Q2.placed) {
    setRO('s5q2-ro', t('q2no', {
      placed: fmtCoord(Q2.placed.x, Q2.placed.y),
      target: fmtCoord(Q2_TARGET.x, Q2_TARGET.y)
    }));
  } else setRO('s5q2-ro', t('q2idle'));
  renderS5Done();
}
function bindQ2() {
  const cv = $('s5q2-canvas');
  cv.classList.add('clickc');
  cv.addEventListener('pointerdown', ev => {
    if (Q2.done) return;
    const g = COORD.geoms.q2;
    if (!g) return;
    const cell = snapCell(g, canvasPos(cv, ev));
    Q2.placed = cell;
    if (cell.x === Q2_TARGET.x && cell.y === Q2_TARGET.y) Q2.done = true;
    renderQ2();
  });
}

/* ============================================================
   第 5 步 · 题 3：换位陷阱（(4, 1) 与 (1, 4)）
   ============================================================ */
const Q3 = { picked: null, answered: false, done: false };
COORD.state.q3 = Q3;
function drawQ3() {
  const cv = regCanvas('s5q3-canvas');
  const ctx = fitCanvas(cv);
  const g = plotGeom(cv, [-6.6, 6.6], [-6.6, 6.6], true);
  COORD.geoms.q3 = g;
  ctx.clearRect(0, 0, cv._w, cv._h);
  drawPlane(ctx, g, { diag: Q3.answered });
  if (Q3.answered) {
    drawDot(ctx, g.X(4), g.Y(1), COL.cyan, 7);
    drawDot(ctx, g.X(1), g.Y(4), COL.orange, 7);
    pointTag(ctx, g, 4, 1, fmtCoord(4, 1), COL.cyan);
    pointTag(ctx, g, 1, 4, fmtCoord(1, 4), COL.orange);
  }
}
function renderQ3() {
  drawQ3();
  const yes = $('s5q3-yes'), no = $('s5q3-no');
  yes.classList.toggle('wrong', Q3.picked === 'yes');
  no.classList.toggle('correct', Q3.done);
  yes.disabled = Q3.done || Q3.picked === 'yes';
  no.disabled = Q3.done;
  if (Q3.done) setRO('s5q3-ro', t('q3ok'));
  else if (Q3.picked === 'yes') setRO('s5q3-ro', t('q3noMsg'));
  else setRO('s5q3-ro', '');
  renderS5Done();
}
function bindQ3() {
  $('s5q3-yes').addEventListener('click', () => {
    if (Q3.done || Q3.picked === 'yes') return;
    Q3.picked = 'yes';
    Q3.answered = true; /* 答后亮出双点作证 */
    renderQ3();
  });
  $('s5q3-no').addEventListener('click', () => {
    if (Q3.done) return;
    Q3.picked = 'no';
    Q3.answered = true;
    Q3.done = true;
    renderQ3();
  });
}

/* ---------- 自测完成句：三题全对前不写入 DOM（门控） ---------- */
function renderS5Done() {
  const el = $('s5-done');
  if (!el) return;
  const txt = (Q1.done && Q2.done && Q3.done) ? t('s5done') : '';
  if (el._v !== txt) { el._v = txt; el.textContent = txt; }
}

/* ---------- 初始化 ---------- */
function renderAll() {
  renderS0();
  renderS1();
  renderS2();
  renderS3();
  renderS4();
  renderQ1();
  renderQ2();
  renderQ3();
}
function init() {
  ['s0-canvas', 's1-canvas', 's2-canvas', 's3-canvas', 's4-canvas',
   's5q1-canvas', 's5q2-canvas', 's5q3-canvas'].forEach(regCanvas);
  bindS0();
  bindS1();
  bindS2();
  bindS3();
  bindS4();
  Q1_OPTS.forEach((o, i) => {
    $('s5q1-o' + i).addEventListener('click', () => {
      if (Q1.done || Q1.picked.includes(i)) return;
      if (i === Q1_ANSWER) Q1.done = true;
      else Q1.picked.push(i);
      renderQ1();
    });
  });
  bindQ2();
  bindQ3();
  renderAll();
  onLangRefresh(renderAll);
  onRefit(renderAll);
}
document.addEventListener('DOMContentLoaded', init);
