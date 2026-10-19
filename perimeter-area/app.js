'use strict';
/* 周长 vs 面积 · 绳子和地砖 — 全部逻辑（无依赖，原生 Canvas 2D）
   依赖 i18n.js 先行加载：t() / getLang() / onLangRefresh()。

   ★ 红线落点：
   1. 同一事实源：第 0/1 步的围法只有一份状态 FENCE.l，宽由 fenceWidth(l)=12−l 派生；
      周长、面积读数一律由纯函数 perimOf/areaOf 现场算出（读数纯渲染），
      拖角、滑杆、账本选行、柱子点击都只写 FENCE.l，不各自维护副本。
   2. 周长恒等式：perimOf(l, 12−l) ≡ 24，对 l=1..11 由 PURE 区函数保证，
      面积序列 11,20,27,32,35,36,35,32,27,20,11 同源（自查脚本直接 eval PURE 区断言）。
   3. 状态一致性：自测判定是状态的纯函数（refresh 从 S3 重算按钮样式与读数），
      改围法、切语言都不会留下与当前状态矛盾的旧判定。
   对账入口：window.PERIMETER_AREA（ops / state / set）。 */
const $ = id => document.getElementById(id);

/* ================= PURE-BEGIN（无 DOM 依赖，自查脚本可直接 eval） ================= */
function perimOf(l, w) { return 2 * (l + w); }
function areaOf(l, w) { return l * w; }
/* 第 0/1 步：绳长固定 24 → 长 + 宽 = 12 */
function fenceWidth(l) { return 12 - l; }
function fenceArea(l) { return areaOf(l, fenceWidth(l)); }
const FENCE_SEQ = [];
for (let fl = 1; fl <= 11; fl++) FENCE_SEQ.push(fenceArea(fl));
const FENCE_MAX = Math.max.apply(null, FENCE_SEQ);
/* 第 2 步：面积固定 24 的四种整数围法（a × b，a 为竖边、b 为横边） */
const S2_COMBOS = [{ a: 1, b: 24 }, { a: 2, b: 12 }, { a: 3, b: 8 }, { a: 4, b: 6 }];
const S2_PERIMS = S2_COMBOS.map(c => perimOf(c.a, c.b));
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
const COL = {
  orange: '#ffb454', cyan: '#6ee7ff', green: '#7ee2a8', red: '#ff7a93',
  ink: '#e8edf4', mut: '#9aa7b8', grid: '#39465e', tile: '#22304a', bar: '#3d5a78', edge: '#8494ab'
};
/* 画一块 l×w 的地砖地：内部方格 + 橙色「绳子」边框 */
function drawTiles(ctx, x, y, cs, l, w) {
  ctx.fillStyle = COL.tile;
  ctx.fillRect(x, y, l * cs, w * cs);
  ctx.strokeStyle = COL.grid; ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 1; i < l; i++) { ctx.moveTo(x + i * cs, y); ctx.lineTo(x + i * cs, y + w * cs); }
  for (let j = 1; j < w; j++) { ctx.moveTo(x, y + j * cs); ctx.lineTo(x + l * cs, y + j * cs); }
  ctx.stroke();
  ctx.strokeStyle = 'rgba(10,14,20,.55)'; ctx.lineWidth = 7.5;
  ctx.strokeRect(x, y, l * cs, w * cs);
  ctx.strokeStyle = COL.orange; ctx.lineWidth = 4.2;
  ctx.strokeRect(x, y, l * cs, w * cs);
}

/* ---------- 全页状态（单一事实源） ---------- */
const FENCE = { l: 9 };            // 第 0/1 步共用：长（宽 = 12 − 长）
const S2 = { idx: 0 };             // 第 2 步：选中的围法下标
const S3 = { q1: null, q1Missed: false, counter: false, q2: null }; // 第 3 步：判断题选择 / 是否曾答错（决定改对文案） / 反例是否已现 / 应用题选择

/* ============================================================
   第 0 步：绳子围地（拖角 / 滑杆改长，周长恒 24，面积变）
   ============================================================ */
const S0 = { geom: null, dragging: false, seen: new Set([FENCE.l]), step1Seen: false };
/* 差值/峰值读数解锁：亲自试过 ≥3 种长，或已到达第 1 步账本——在此之前不剧透最大值 */
function s0Unlocked() { return S0.seen.size >= 3 || S0.step1Seen; }
function s0Draw() {
  const cv = $('s0-canvas'); if (!cv) return;
  const ctx = fitCanvas(cv);
  const W = cv._w, H = cv._h;
  if (W < 10) return;
  ctx.clearRect(0, 0, W, H);
  const l = FENCE.l, w = fenceWidth(l), a = areaOf(l, w);
  const cs = clamp(Math.floor(Math.min((W - 120) / 11, (H - 104) / 11)), 10, 30);
  const x0 = Math.round((W - l * cs) / 2);
  const y0 = Math.round((H - w * cs) / 2) + 12;
  S0.geom = { x0, y0, cs };
  fitText(ctx, t('c0title', { a }), 14, 27, W - 28, { size: 15, weight: '700', color: COL.ink });
  drawTiles(ctx, x0, y0, cs, l, w);
  /* 宽标签（左侧竖排） */
  ctx.save();
  ctx.translate(x0 - 15, y0 + w * cs / 2);
  ctx.rotate(-Math.PI / 2);
  fitText(ctx, t('cWid', { v: w }), 0, 4, w * cs, { size: 13, color: COL.mut, align: 'center' });
  ctx.restore();
  /* 长标签（下方居中） */
  fitText(ctx, t('cLen', { v: l }), x0 + l * cs / 2, y0 + w * cs + 26, l * cs + 60, { size: 13, color: COL.mut, align: 'center' });
  /* 拖拽圆点（右下角） */
  const hx = x0 + l * cs, hy = y0 + w * cs;
  ctx.beginPath(); ctx.arc(hx, hy, 11, 0, Math.PI * 2);
  ctx.fillStyle = COL.cyan; ctx.fill();
  ctx.lineWidth = 2.4; ctx.strokeStyle = '#08131a'; ctx.stroke();
  ctx.beginPath(); ctx.arc(hx, hy, 3.4, 0, Math.PI * 2);
  ctx.fillStyle = '#08131a'; ctx.fill();
  fitText(ctx, t('cDrag'), hx, (w * cs < 70 ? hy + 32 : hy - 20), 70, { size: 11.5, color: COL.cyan, align: 'center' });
}
function s0Readouts() {
  const l = FENCE.l, w = fenceWidth(l);
  const p = perimOf(l, w), a = areaOf(l, w);
  setRO('s0-rope', t('s0rope', { l, w, p }));
  setRO('s0-area', t('s0area', { l, w, a }));
  setRO('s0-vs', a >= FENCE_MAX
    ? t('s0square', { max: FENCE_MAX })
    : s0Unlocked()
      ? t('s0vs', { max: FENCE_MAX, d: FENCE_MAX - a })
      : t('s0explore'));
}
function setFence(l) {
  l = clamp(Math.round(l), 1, 11);
  FENCE.l = l;
  S0.seen.add(l);
  const sl = $('s0-len');
  if (sl && +sl.value !== l) sl.value = l;
  const val = $('s0-len-val');
  if (val) val.textContent = l;
  s0Draw(); s0Readouts();
  s1Draw(); s1TableHighlight(); s1Readout();
}
function initS0() {
  const cv = regCanvas('s0-canvas');
  /* 到达第 1 步账本即解锁差值读数（账本本身就是设计内的峰值收口） */
  const step1El = $('step1');
  if (step1El && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => {
      if (!S0.step1Seen && es.some(e => e.isIntersecting)) {
        S0.step1Seen = true;
        s0Readouts();
        io.disconnect();
      }
    }, { threshold: 0.12 });
    io.observe(step1El);
  }
  $('s0-len').addEventListener('input', e => setFence(+e.target.value));
  $('s0-start').addEventListener('click', () => {
    const el = $('step1');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  });
  function pointL(e) {
    const g = S0.geom; if (!g) return null;
    const r = cv.getBoundingClientRect();
    return clamp(Math.round((e.clientX - r.left - g.x0) / g.cs), 1, 11);
  }
  cv.addEventListener('pointerdown', e => {
    const g = S0.geom; if (!g) return;
    const r = cv.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const w = fenceWidth(FENCE.l);
    if (x >= g.x0 - 16 && x <= g.x0 + FENCE.l * g.cs + 18 && y >= g.y0 - 16 && y <= g.y0 + w * g.cs + 18) {
      S0.dragging = true;
      try { cv.setPointerCapture(e.pointerId); } catch (err) { /* 忽略 */ }
      const nl = pointL(e);
      if (nl !== null) setFence(nl);
      e.preventDefault();
    }
  });
  window.addEventListener('pointermove', e => {
    if (!S0.dragging) return;
    const nl = pointL(e);
    if (nl !== null && nl !== FENCE.l) setFence(nl);
  });
  window.addEventListener('pointerup', () => { S0.dragging = false; });
  onLangRefresh(() => { s0Draw(); s0Readouts(); });
  onRefit(() => { s0Draw(); });
  s0Draw(); s0Readouts();
}

/* ============================================================
   第 1 步：面积账本（柱子 + 表格，与第 0 步同一状态）
   ============================================================ */
const S1 = { bars: [] };
function s1Draw() {
  const cv = $('s1-canvas'); if (!cv) return;
  const ctx = fitCanvas(cv);
  const W = cv._w, H = cv._h;
  if (W < 10) return;
  ctx.clearRect(0, 0, W, H);
  fitText(ctx, t('c1title'), 14, 25, W - 28, { size: 13.5, color: COL.mut });
  const x0 = 40, x1 = W - 14, baseY = H - 32, topY = 44;
  const slot = (x1 - x0) / 11, barW = Math.max(8, slot * 0.6);
  ctx.strokeStyle = COL.edge; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(x0 - 6, baseY); ctx.lineTo(x1 + 4, baseY); ctx.stroke();
  S1.bars = [];
  for (let l = 1; l <= 11; l++) {
    const a = FENCE_SEQ[l - 1];
    const bh = (a / FENCE_MAX) * (baseY - topY);
    const bx = x0 + slot * (l - 1) + (slot - barW) / 2;
    const by = baseY - bh;
    const isSel = l === FENCE.l, isPeak = a === FENCE_MAX;
    ctx.fillStyle = isSel ? COL.cyan : isPeak ? COL.green : COL.bar;
    ctx.fillRect(bx, by, barW, bh);
    ctx.strokeStyle = COL.grid; ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, barW, bh);
    fitText(ctx, String(a), bx + barW / 2, by - 6, slot, {
      size: 12.5, weight: '700', align: 'center',
      color: isSel ? COL.cyan : isPeak ? COL.green : COL.mut
    });
    fitText(ctx, String(l), bx + barW / 2, baseY + 20, slot, { size: 12, align: 'center', color: isSel ? COL.cyan : COL.mut });
    S1.bars.push({ x: bx, y: by, w: barW, h: bh, l });
  }
}
function s1Readout() {
  const l = FENCE.l, w = fenceWidth(l), p = perimOf(l, w), a = areaOf(l, w);
  setRO('s1-readout', a >= FENCE_MAX ? t('s1roPeak', { p, a }) : t('s1ro', { l, w, p, a }));
}
function buildS1Table() {
  const tb = $('s1-tbody'); if (!tb) return;
  tb.innerHTML = '';
  for (let l = 1; l <= 11; l++) {
    const w = fenceWidth(l);
    const tr = document.createElement('tr');
    tr.dataset.l = l;
    if (areaOf(l, w) === FENCE_MAX) tr.className = 'peak';
    [l, w, perimOf(l, w)].forEach(v => {
      const td = document.createElement('td');
      td.textContent = v;
      tr.appendChild(td);
    });
    const tdA = document.createElement('td');
    tdA.className = 'area-cell';
    tdA.textContent = areaOf(l, w);
    tr.appendChild(tdA);
    tr.addEventListener('click', () => setFence(l));
    tb.appendChild(tr);
  }
}
function s1TableHighlight() {
  document.querySelectorAll('#s1-tbody tr').forEach(tr => {
    tr.classList.toggle('sel', +tr.dataset.l === FENCE.l);
  });
}
function initS1() {
  const cv = regCanvas('s1-canvas');
  buildS1Table();
  cv.addEventListener('click', e => {
    const r = cv.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    for (const b of S1.bars) {
      if (x >= b.x - 3 && x <= b.x + b.w + 3 && y >= b.y - 16 && y <= b.y + b.h + 22) { setFence(b.l); return; }
    }
  });
  onLangRefresh(() => { s1Draw(); s1Readout(); });
  onRefit(() => { s1Draw(); });
  s1TableHighlight();
  s1Draw(); s1Readout();
}

/* ============================================================
   第 2 步：面积固定 24，周长各不同（绳子条对比）
   ============================================================ */
function s2Draw() {
  const cv = $('s2-canvas'); if (!cv) return;
  const ctx = fitCanvas(cv);
  const W = cv._w, H = cv._h;
  if (W < 10) return;
  ctx.clearRect(0, 0, W, H);
  const c = S2_COMBOS[S2.idx];
  const cs = clamp(Math.floor(Math.min((W - 130) / 24, 30)), 6, 30);
  const rx = 56, ry = 52;
  fitText(ctx, t('c2area'), 14, 28, W - 28, { size: 15, weight: '700', color: COL.ink });
  drawTiles(ctx, rx, ry, cs, c.b, c.a);
  fitText(ctx, c.a + ' × ' + c.b, rx + c.b * cs / 2, ry + c.a * cs + 24, c.b * cs + 60, { size: 13.5, color: COL.mut, align: 'center' });
  /* 绳子条：四根按周长成比例，选中点亮 */
  const maxP = Math.max.apply(null, S2_PERIMS);
  const bx = 66, bwMax = W - bx - 118;
  const barY0 = H - 148;
  for (let i = 0; i < S2_COMBOS.length; i++) {
    const cc = S2_COMBOS[i], p = S2_PERIMS[i];
    const y = barY0 + i * 34;
    const sel = i === S2.idx;
    fitText(ctx, cc.a + '×' + cc.b, bx - 8, y + 13, 52, { size: 12.5, align: 'right', color: sel ? COL.cyan : COL.mut });
    const bw = Math.max(6, bwMax * p / maxP);
    ctx.fillStyle = sel ? COL.orange : COL.bar;
    ctx.fillRect(bx, y, bw, 17);
    fitText(ctx, t('c2rope', { p }), bx + bw + 8, y + 13.5, 112, { size: 12.5, color: sel ? COL.orange : COL.mut });
  }
}
function s2Readouts() {
  const c = S2_COMBOS[S2.idx], p = S2_PERIMS[S2.idx];
  setRO('s2-readout', t('s2ro', { l: c.a, w: c.b, p }));
  const mn = Math.min.apply(null, S2_PERIMS), mx = Math.max.apply(null, S2_PERIMS);
  setRO('s2-diff', t('s2roDiff', { min: mn, max: mx, d: mx - mn }));
}
function setS2(i) {
  S2.idx = clamp(i, 0, S2_COMBOS.length - 1);
  for (let k = 0; k < S2_COMBOS.length; k++) {
    const b = $('s2-b' + k);
    if (b) b.classList.toggle('active', k === S2.idx);
  }
  s2Draw(); s2Readouts();
}
function initS2() {
  regCanvas('s2-canvas');
  for (let k = 0; k < S2_COMBOS.length; k++) {
    $('s2-b' + k).addEventListener('click', () => setS2(k));
  }
  onLangRefresh(() => { s2Draw(); s2Readouts(); });
  onRefit(() => { s2Draw(); });
  setS2(0);
}

/* ============================================================
   第 3 步：自测（判断题 + 反例 + 应用题；判定由状态纯渲染）
   ============================================================ */
function s3Draw() {
  const cv = $('s3-canvas'); if (!cv) return;
  const ctx = fitCanvas(cv);
  const W = cv._w, H = cv._h;
  if (W < 10) return;
  ctx.clearRect(0, 0, W, H);
  if (!S3.counter) {
    fitText(ctx, t('c3idle'), W / 2, H / 2 + 5, W - 36, { size: 14, color: COL.mut, align: 'center' });
    return;
  }
  const cs = clamp(Math.floor((W - 120) / 20), 8, 22);
  const totalW = 20 * cs;
  const xA = Math.round((W - totalW) / 2);
  const xB = xA + 14 * cs;
  const baseY = H - 62;
  drawTiles(ctx, xA, baseY - cs, cs, 11, 1);
  drawTiles(ctx, xB, baseY - 6 * cs, cs, 6, 6);
  fitText(ctx, t('c3a'), xA + 11 * cs / 2, baseY + 24, 11 * cs + 26, { size: 12.5, align: 'center', color: COL.orange });
  fitText(ctx, t('c3b'), xB + 3 * cs, baseY + 24, 6 * cs + 44, { size: 12.5, align: 'center', color: COL.orange });
}
function s3CounterLabel() {
  const btn = $('s3-counter');
  if (btn) btn.textContent = t(S3.counter ? 's3counterAgain' : 's3counterShow');
}
function s3Q1Refresh() {
  const a = $('s3-q1-a'), b = $('s3-q1-b');
  if (a && b) {
    a.classList.toggle('wrong', S3.q1 === 'a');
    b.classList.toggle('correct', S3.q1 === 'b');
    b.classList.toggle('wrong', false);
  }
  setRO('s3-q1-ro', S3.q1 === null ? '' : S3.q1 === 'b' ? t(S3.q1Missed ? 's3q1winFixed' : 's3q1win') : t('s3q1lose'));
  s3CounterLabel();
}
function s3Q2Refresh() {
  for (let i = 0; i < 4; i++) {
    const btn = $('s3-q2-' + i);
    if (!btn) continue;
    btn.classList.toggle('correct', S3.q2 === i && i === 2);
    btn.classList.toggle('wrong', S3.q2 === i && i !== 2);
  }
  setRO('s3-q2-ro', S3.q2 === null ? '' : S3.q2 === 2 ? t('s3q2win') : t('s3q2lose'));
  const note = $('s3-q2-note');
  if (note) note.style.display = S3.q2 === null ? 'none' : '';
}
function initS3() {
  regCanvas('s3-canvas');
  $('s3-q1-a').addEventListener('click', () => { S3.q1 = 'a'; S3.q1Missed = true; S3.counter = true; s3Q1Refresh(); s3Draw(); });
  $('s3-q1-b').addEventListener('click', () => { S3.q1 = 'b'; S3.counter = true; s3Q1Refresh(); s3Draw(); });
  $('s3-counter').addEventListener('click', () => { S3.counter = true; s3Draw(); s3CounterLabel(); });
  for (let i = 0; i < 4; i++) {
    $('s3-q2-' + i).addEventListener('click', () => { S3.q2 = i; s3Q2Refresh(); });
  }
  onLangRefresh(() => { s3Draw(); s3Q1Refresh(); s3Q2Refresh(); });
  onRefit(() => { s3Draw(); });
  s3Draw(); s3Q1Refresh(); s3Q2Refresh();
}

/* ============================================================
   第 4 步：终章（三块同周长的地并排）
   ============================================================ */
function s4Draw() {
  const cv = $('s4-canvas'); if (!cv) return;
  const ctx = fitCanvas(cv);
  const W = cv._w, H = cv._h;
  if (W < 10) return;
  ctx.clearRect(0, 0, W, H);
  const shapes = [{ l: 11, w: 1 }, { l: 8, w: 4 }, { l: 6, w: 6 }];
  const cs = clamp(Math.floor((W - 120) / 29), 7, 18);
  let x = Math.round((W - 29 * cs) / 2);
  const baseY = H - 58;
  for (const s of shapes) {
    drawTiles(ctx, x, baseY - s.w * cs, cs, s.l, s.w);
    fitText(ctx, t('c4p'), x + s.l * cs / 2, baseY + 21, s.l * cs + 34, { size: 12, align: 'center', color: COL.mut });
    fitText(ctx, t('c4a', { a: areaOf(s.l, s.w) }), x + s.l * cs / 2, baseY + 39, s.l * cs + 34, { size: 12.5, weight: '700', align: 'center', color: COL.orange });
    x += (s.l + 2) * cs;
  }
}
function initS4() {
  regCanvas('s4-canvas');
  onLangRefresh(() => { s4Draw(); });
  onRefit(() => { s4Draw(); });
  s4Draw();
}

/* ---------- 对账入口（供评审/自测程序化设置状态） ---------- */
window.PERIMETER_AREA = {
  ops: { perimOf, areaOf, fenceWidth, fenceArea, FENCE_SEQ, FENCE_MAX, S2_COMBOS, S2_PERIMS },
  state: { FENCE, S2, S3 },
  set: {
    fence: l => setFence(l),
    s2: i => setS2(i),
    q1: v => { S3.q1 = v; if (v === 'a') S3.q1Missed = true; S3.counter = true; s3Q1Refresh(); s3Draw(); },
    q2: i => { S3.q2 = i; s3Q2Refresh(); }
  }
};

/* ---------- 启动（i18n 的 applyLang 已先行运行） ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initS0(); initS1(); initS2(); initS3(); initS4();
});
