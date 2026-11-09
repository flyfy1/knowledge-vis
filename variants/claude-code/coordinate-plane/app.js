'use strict';
// Coordinate plane lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// State is whole-number coordinates only; every address, count and quadrant comes from window.CP_MODEL.
// Canvas labels go through a layout helper that keeps them on the canvas and apart from each other.
(function () {

const $ = id => document.getElementById(id);
const M = window.CP_MODEL;
const t = (...a) => window.PAGE_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#1e2b3a', axis: '#8fa3ba', text: '#e8edf4', bg: '#0d1621', road: '#4a3f2c', ghost: '#8696aa' };
const QCOL = { I: '#67d7f9', II: '#7ee2a8', III: '#ffb454', IV: '#b79cff' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fc = (x, y) => M.fmtCoord(x, y);
const fn = v => M.fmtNum(v);

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  const height = Math.round(Math.min(480, Math.max(330, width * 0.9 + 40)));
  if (canvas.style.height !== height + 'px') canvas.style.height = height + 'px';
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}

// Label layout: measure, keep inside the canvas, try candidate offsets, shrink, otherwise skip
// (everything a label says is also in the DOM readout).
function labeler(ctx, W, H) {
  const boxes = [];
  const hit = b => boxes.some(o => b.x0 < o.x1 + 3 && b.x1 > o.x0 - 3 && b.y0 < o.y1 + 2 && b.y1 > o.y0 - 2);
  const box = (text, X, Y, align) => {
    ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
    const m = ctx.measureText(text);
    return { x0: X - m.actualBoundingBoxLeft, x1: X + m.actualBoundingBoxRight, y0: Y - m.actualBoundingBoxAscent, y1: Y + m.actualBoundingBoxDescent };
  };
  return {
    reserve(x0, y0, x1, y1) { boxes.push({ x0: Math.min(x0, x1), y0: Math.min(y0, y1), x1: Math.max(x0, x1), y1: Math.max(y0, y1) }); },
    put(text, x, y, o = {}) {
      const cands = o.cands || [[0, 0]];
      for (let size = o.size || 12; size >= (o.min || 9); size -= 1) {
        ctx.font = `${o.weight || 500} ${size}px system-ui,-apple-system,"PingFang SC",sans-serif`;
        for (const [dx, dy, al] of cands) {
          const align = al || o.align || 'center';
          let X = x + dx; const Y = y + dy;
          let b = box(text, X, Y, align);
          if (b.x1 - b.x0 > W - 6) continue;
          if (b.x0 < 3) { X += 3 - b.x0; b = box(text, X, Y, align); }
          if (b.x1 > W - 3) { X -= b.x1 - (W - 3); b = box(text, X, Y, align); }
          if (b.y0 < 2 || b.y1 > H - 2 || hit(b)) continue;
          if (o.bg) { ctx.save(); ctx.fillStyle = o.bg; ctx.globalAlpha = 0.88; ctx.fillRect(b.x0 - 3, b.y0 - 2, b.x1 - b.x0 + 6, b.y1 - b.y0 + 4); ctx.restore(); }
          ctx.fillStyle = o.color || C.text; ctx.fillText(text, X, Y);
          boxes.push(b); return b;
        }
      }
      return null;
    }
  };
}
// Candidate offsets around a point: right, upper-right, left, below, …
const AROUND = [[10, -8, 'left'], [10, 16, 'left'], [-10, -8, 'right'], [-10, 16, 'right'], [0, -14], [0, 24], [16, 4, 'left'], [-16, 4, 'right']];

/* ---------- the grid: absolute coordinates −6..6; axes may pass through a moved origin (ox, oy) ---------- */
// Grid geometry for a canvas of CSS size W × H (shared by drawing and by tap-to-pick).
function geom(W, H) {
  const top = 30, size = Math.min(W - 64, H - top - 34), cell = size / (M.HI - M.LO);
  const gx0 = (W - size) / 2, gy0 = top + 6 + (H - top - 34 - size) / 2;
  return { size, cell, gx0, gy0, X: v => gx0 + (v - M.LO) * cell, Y: v => gy0 + (M.HI - v) * cell };
}
function plane(ctx, L, W, H, o = {}) {
  const ox = o.ox || 0, oy = o.oy || 0;
  const { size, cell, gx0, gy0, X, Y } = geom(W, H);
  if (o.title) L.put(o.title, 10, 19, { align: 'left', size: 12, weight: 600 });
  ctx.save(); ctx.lineWidth = 1; ctx.strokeStyle = C.grid;
  for (let v = M.LO; v <= M.HI; v++) {
    ctx.beginPath(); ctx.moveTo(X(v), Y(M.HI)); ctx.lineTo(X(v), Y(M.LO)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(X(M.LO), Y(v)); ctx.lineTo(X(M.HI), Y(v)); ctx.stroke();
  }
  if (o.oldAxes && (ox || oy)) {
    ctx.strokeStyle = C.ghost; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(X(M.LO), Y(0)); ctx.lineTo(X(M.HI), Y(0)); ctx.moveTo(X(0), Y(M.LO)); ctx.lineTo(X(0), Y(M.HI)); ctx.stroke(); ctx.setLineDash([]);
  }
  const axCol = o.axisCol || C.axis;
  ctx.strokeStyle = axCol; ctx.fillStyle = axCol; ctx.lineWidth = 1.8;
  const xe = X(M.HI) + 14, yt = Y(M.HI) - 14;
  ctx.beginPath(); ctx.moveTo(X(M.LO) - 6, Y(oy)); ctx.lineTo(xe, Y(oy)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(xe + 2, Y(oy)); ctx.lineTo(xe - 7, Y(oy) - 4); ctx.lineTo(xe - 7, Y(oy) + 4); ctx.fill();
  if (!o.noY) {
    ctx.beginPath(); ctx.moveTo(X(ox), Y(M.LO) + 6); ctx.lineTo(X(ox), yt); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(X(ox), yt - 2); ctx.lineTo(X(ox) - 4, yt + 7); ctx.lineTo(X(ox) + 4, yt + 7); ctx.fill();
  }
  ctx.restore();
  L.reserve(X(M.LO) - 6, Y(oy) - 2, xe + 2, Y(oy) + 2);
  if (!o.noY) L.reserve(X(ox) - 2, yt - 2, X(ox) + 2, Y(M.LO) + 6);
  // tick labels: relative to the origin; thinned when the cells are small
  const stride = cell >= 26 ? 1 : 2;
  for (let v = M.LO; v <= M.HI; v++) {
    const rx = v - ox; if (rx === 0 || rx % stride) continue;
    L.put(fn(rx), X(v), Y(oy) + 15, { size: 11, color: C.muted, bg: C.bg, min: 10, cands: [[0, 0], [0, 12]] });
  }
  if (!o.noY) for (let v = M.LO; v <= M.HI; v++) {
    const ry = v - oy; if (ry === 0 || ry % stride) continue;
    L.put(fn(ry), X(ox) - 6, Y(v) + 4, { size: 11, color: C.muted, align: 'right', bg: C.bg, min: 10, cands: [[0, 0, 'right'], [12, 0, 'left']] });
  }
  if (!o.noNames) {
    L.put(t('c1x'), xe + 4, Y(oy) - 8, { size: 12, weight: 700, color: axCol, align: 'left', cands: [[0, 0, 'left'], [-8, -12, 'left'], [0, 20, 'left']] });
    if (!o.noY) L.put(t('c1y'), X(ox) + 9, yt + 6, { size: 12, weight: 700, color: axCol, align: 'left', cands: [[0, 0, 'left'], [-18, 0, 'right']] });
    L.put(t('c1o'), X(ox) - 6, Y(oy) + 15, { size: 12, weight: 700, color: axCol, align: 'right', cands: [[0, 0, 'right'], [0, -18, 'right']] });
  }
  return { X, Y, cell, gx0, gy0, size };
}
function dot(ctx, x, y, r, fill, stroke) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); } }
function seg(ctx, a, b, col, w = 3, dash) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; if (dash) ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.restore(); }
function pointLabel(L, G, x, y, text, col, extra = {}) {
  L.reserve(G.X(x) - 7, G.Y(y) - 7, G.X(x) + 7, G.Y(y) + 7);
  return L.put(text, G.X(x), G.Y(y), { size: 12, weight: 700, color: col, bg: C.bg, cands: extra.cands || AROUND });
}

/* ---------- shared animation runner (reduced motion → final frame; hidden page → finish) ---------- */
const anims = {};
function animate(name, ms, frame, done) {
  stopAnim(name);
  if (reduceMotion()) { frame(1); if (done) done(); return; }
  const start = performance.now();
  const tick = now => {
    const p = Math.min(1, (now - start) / ms);
    frame(p);
    if (p < 1) anims[name] = { id: requestAnimationFrame(tick), frame, done };
    else { delete anims[name]; if (done) done(); }
  };
  anims[name] = { id: requestAnimationFrame(tick), frame, done };
}
function stopAnim(name) { if (anims[name]) { cancelAnimationFrame(anims[name].id); delete anims[name]; } }
function finishAll() { Object.keys(anims).forEach(k => { const a = anims[k]; cancelAnimationFrame(a.id); delete anims[k]; a.frame(1); if (a.done) a.done(); }); }

/* ---------- step 0: is one number enough? ---------- */
const s0 = { mode: 'line' };
const dirX = v => (v > 0 ? t('dirE', { n: v }) : v < 0 ? t('dirW', { n: -v }) : t('dirX0'));
const dirY = v => (v > 0 ? t('dirN', { n: v }) : v < 0 ? t('dirS', { n: -v }) : t('dirY0'));
function draw0() {
  const x = num('x0'), useY = $('useY0').checked && s0.mode === 'plane', y = useY ? num('y0') : null;
  $('x0v').textContent = fn(x); $('y0v').textContent = fn(num('y0'));
  $('y0').disabled = !useY; $('useY0').disabled = s0.mode === 'line';
  $('modeLine').setAttribute('aria-pressed', s0.mode === 'line'); $('modePlane').setAttribute('aria-pressed', s0.mode === 'plane');
  const cand = M.candidates(s0.mode, x, y);
  const { ctx, W, H } = fitCanvas($('c0')); const L = labeler(ctx, W, H);
  // the road is drawn under the grid axes
  const G = plane(ctx, L, W, H, { title: t('c0title', { n: cand.length }), noY: s0.mode === 'line', noNames: true });
  if (s0.mode === 'line') {
    ctx.save(); ctx.globalAlpha = 0.6; ctx.fillStyle = C.road; ctx.fillRect(G.X(M.LO) - 6, G.Y(0) - 7, G.size + 12, 14); ctx.restore();
    seg(ctx, [G.X(M.LO) - 6, G.Y(0)], [G.X(M.HI) + 6, G.Y(0)], C.axis, 1.6);
  } else {
    ctx.save(); ctx.globalAlpha = 0.18; ctx.fillStyle = C.green; ctx.fillRect(G.X(M.LO), G.Y(M.HI), G.size, G.size); ctx.restore();
  }
  dot(ctx, G.X(0), G.Y(0), 5, C.text);
  L.reserve(G.X(0) - 6, G.Y(0) - 6, G.X(0) + 6, G.Y(0) + 6);
  L.put(t('c0start'), G.X(0) - 8, G.Y(0) - 10, { size: 11, color: C.text, align: 'right', bg: C.bg, cands: [[0, 0, 'right'], [0, 26, 'right'], [16, -2, 'left']] });
  const one = cand.length === 1, r = Math.max(5, Math.min(10, G.cell * 0.32));
  cand.forEach(([cx, cy]) => { if (one) { dot(ctx, G.X(cx), G.Y(cy), r + 2, C.orange, C.bg); } else { ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(G.X(cx), G.Y(cy), r, 0, 7); ctx.stroke(); ctx.restore(); } });
  if (s0.mode === 'plane' && !useY) { // bracket the whole column
    ctx.save(); ctx.strokeStyle = C.orange; ctx.globalAlpha = 0.35; ctx.lineWidth = G.cell * 0.7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(G.X(x), G.Y(M.HI)); ctx.lineTo(G.X(x), G.Y(M.LO)); ctx.stroke(); ctx.restore();
  }
  if (one) pointLabel(L, G, cand[0][0], cand[0][1], '★', C.orange, { cands: [[0, -14], [12, 4, 'left'], [-12, 4, 'right']] });
  const key = s0.mode === 'line' ? 's0line' : useY ? 's0planeTwo' : 's0planeOne';
  $('r0').textContent = t(key, { cx: dirX(x), cy: useY ? dirY(y) : '', n: cand.length });
}

/* ---------- step 1: across, then up ---------- */
const s1 = { p: null, trail: new Map() }; // p: walk progress 0..1 (null = not walked for the current point)
function hPart(x) { return x > 0 ? t('s1right', { n: x }) : x < 0 ? t('s1left', { n: -x }) : t('s1h0'); }
function vPart(y) { return y > 0 ? t('s1up', { n: y }) : y < 0 ? t('s1down', { n: -y }) : t('s1v0'); }
function draw1() {
  const x = num('x1'), y = num('y1');
  $('x1v').textContent = fn(x); $('y1v').textContent = fn(y);
  const { ctx, W, H } = fitCanvas($('c1')); const L = labeler(ctx, W, H);
  const G = plane(ctx, L, W, H, { title: t('c1title') });
  s1.trail.forEach(([tx, ty]) => { if (tx !== x || ty !== y) dot(ctx, G.X(tx), G.Y(ty), 3.5, C.text); });
  const p = s1.p;
  if (p !== null) {
    const a = Math.min(1, p * 2), b = Math.max(0, p * 2 - 1);
    seg(ctx, [G.X(0), G.Y(0)], [G.X(x * a), G.Y(0)], C.cyan, 4);
    if (b > 0) seg(ctx, [G.X(x), G.Y(0)], [G.X(x), G.Y(y * b)], C.orange, 4);
    const wx = b > 0 ? x : x * a, wy = b > 0 ? y * b : 0;
    if (p < 1) dot(ctx, G.X(wx), G.Y(wy), 6, C.text, C.bg);
    L.reserve(Math.min(G.X(0), G.X(x)), G.Y(0) - 3, Math.max(G.X(0), G.X(x)), G.Y(0) + 3);
    L.reserve(G.X(x) - 3, Math.min(G.Y(0), G.Y(y)), G.X(x) + 3, Math.max(G.Y(0), G.Y(y)));
    if (x !== 0) L.put(fn(x), (G.X(0) + G.X(x)) / 2, G.Y(0) + (y > 0 ? 18 : -8), { size: 12, weight: 700, color: C.cyan, bg: C.bg, cands: [[0, 0], [0, y > 0 ? -26 : 26]] });
    if (b > 0 && y !== 0) L.put(fn(y), G.X(x) + (x >= 0 ? 8 : -8), (G.Y(0) + G.Y(y)) / 2 + 4, { size: 12, weight: 700, color: C.orange, bg: C.bg, align: x >= 0 ? 'left' : 'right', cands: [[0, 0], [x >= 0 ? -16 : 16, 0, x >= 0 ? 'right' : 'left']] });
  }
  if (p === null || p >= 1) { dot(ctx, G.X(x), G.Y(y), 6.5, C.text, C.bg); pointLabel(L, G, x, y, fc(x, y), C.text); }
  const hp = hPart(x), vp = vPart(y);
  if (p === null) $('r1').textContent = t('s1go', { p: fc(x, y), hp, vp });
  else if (p < 1) $('r1').textContent = t('s1walking', { leg: t(p < 0.5 ? 's1leg1' : 's1leg2') });
  else $('r1').textContent = t('s1done', { hp, vp, p: fc(x, y), x: fn(x), y: fn(y) });
}

/* ---------- step 2: move the origin ---------- */
function landmark(ctx, id, X, Y, s) {
  ctx.save();
  if (id === 'house') { ctx.fillStyle = C.orange; ctx.fillRect(X - s * 0.6, Y - s * 0.2, s * 1.2, s * 0.8); ctx.beginPath(); ctx.moveTo(X - s * 0.8, Y - s * 0.2); ctx.lineTo(X, Y - s); ctx.lineTo(X + s * 0.8, Y - s * 0.2); ctx.fill(); }
  else if (id === 'tree') { ctx.fillStyle = '#8a6a43'; ctx.fillRect(X - 2, Y - s * 0.1, 4, s * 0.7); ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(X, Y - s * 0.4, s * 0.55, 0, 7); ctx.fill(); }
  else { ctx.strokeStyle = C.cyan; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(X, Y, s * 0.55, 0, 7); ctx.stroke(); ctx.fillStyle = '#1d4f6e'; ctx.fill(); }
  ctx.restore();
}
function draw2() {
  const ox = num('ox2'), oy = num('oy2');
  $('ox2v').textContent = fn(ox); $('oy2v').textContent = fn(oy);
  const { ctx, W, H } = fitCanvas($('c2')); const L = labeler(ctx, W, H);
  const G = plane(ctx, L, W, H, { ox, oy, oldAxes: true, axisCol: C.green });
  dot(ctx, G.X(ox), G.Y(oy), 5, C.green);
  const s = Math.max(9, Math.min(15, G.cell * 0.5)), names = { house: t('lmHouse'), tree: t('lmTree'), well: t('lmWell') };
  const addr = {};
  M.LANDMARKS.forEach(lm => { const [X, Y] = [G.X(lm.p[0]), G.Y(lm.p[1])]; landmark(ctx, lm.id, X, Y, s); L.reserve(X - s, Y - s, X + s, Y + s * 0.6); addr[lm.id] = M.address(lm.p, ox, oy); });
  M.LANDMARKS.forEach(lm => { const a = addr[lm.id]; L.put(names[lm.id] + ' ' + fc(a[0], a[1]), G.X(lm.p[0]), G.Y(lm.p[1]), { size: 12, weight: 700, color: C.text, bg: C.bg, cands: [[s + 4, 4, 'left'], [-s - 4, 4, 'right'], [0, -s - 6], [0, s + 16], [s + 2, s + 14, 'left'], [-s - 2, s + 14, 'right'], [s + 2, -s - 4, 'left'], [-s - 2, -s - 4, 'right'], [0, s + 32], [0, -s - 22]], min: 9 }); });
  const h = addr.house, w = addr.well;
  $('r2').textContent = t('s2readout', { o: fc(ox, oy), h: fc(h[0], h[1]), t: fc(addr.tree[0], addr.tree[1]), w: fc(w[0], w[1]) }) + ' ' + t('s2diff', { dx: h[0] - w[0], dy: h[1] - w[1] });
}

/* ---------- step 3: order matters ---------- */
const s3 = { move: null }; // swap animation progress 0..1 (null = idle)
function draw3() {
  const ax = num('ax3'), ay = num('ay3'), [bx, by] = M.swap(ax, ay), same = M.sameAfterSwap(ax, ay);
  $('ax3v').textContent = fn(ax); $('ay3v').textContent = fn(ay);
  const { ctx, W, H } = fitCanvas($('c3')); const L = labeler(ctx, W, H);
  const G = plane(ctx, L, W, H, {});
  seg(ctx, [G.X(M.LO), G.Y(M.LO)], [G.X(M.HI), G.Y(M.HI)], C.violet, 2);
  if (!same) seg(ctx, [G.X(ax), G.Y(ay)], [G.X(bx), G.Y(by)], C.text, 1.4, [4, 4]);
  const k = s3.move === null ? 0 : s3.move, e = k * k * (3 - 2 * k);
  const Ax = ax + (bx - ax) * e, Ay = ay + (by - ay) * e;
  dot(ctx, G.X(bx), G.Y(by), 7, C.pink, C.bg);
  dot(ctx, G.X(Ax), G.Y(Ay), same ? 4 : 7, C.cyan, C.bg);
  if (s3.move === null) {
    pointLabel(L, G, ax, ay, 'A ' + fc(ax, ay), C.cyan, { cands: [[10, 16, 'left'], [10, -8, 'left'], [-10, 16, 'right'], [-10, -8, 'right'], [0, 26], [0, -16]] });
    pointLabel(L, G, bx, by, 'A′ ' + fc(bx, by), C.pink, { cands: [[-10, -8, 'right'], [-10, 16, 'right'], [10, -8, 'left'], [10, 16, 'left'], [0, -16], [0, 26]] });
    $('r3').textContent = same ? t('s3same', { a: fc(ax, ay) }) : t('s3diff', { a: fc(ax, ay), b: fc(bx, by), dx: Math.abs(ax - bx), dy: Math.abs(ay - by) });
  } else $('r3').textContent = t('s3moving', { b: fc(bx, by) });
}

/* ---------- step 4: quadrants ---------- */
const s4 = { seen: new Set() };
function draw4() {
  const x = num('x4'), y = num('y4'), q = M.quadrant(x, y);
  $('x4v').textContent = fn(x); $('y4v').textContent = fn(y);
  if (M.SIGNS[q]) s4.seen.add(q);
  const { ctx, W, H } = fitCanvas($('c4')); const L = labeler(ctx, W, H);
  // shade visited quadrants first, then the grid on top
  const Gp = geom(W, H);
  const rect = { I: [0, M.HI, M.HI, 0], II: [M.LO, M.HI, 0, 0], III: [M.LO, 0, 0, M.LO], IV: [0, 0, M.HI, M.LO] };
  s4.seen.forEach(k => { const [x0, y0, x1, y1] = rect[k]; ctx.save(); ctx.globalAlpha = 0.16; ctx.fillStyle = QCOL[k]; ctx.fillRect(Gp.X(x0), Gp.Y(y0), Gp.X(x1) - Gp.X(x0), Gp.Y(y1) - Gp.Y(y0)); ctx.restore(); });
  const G = plane(ctx, L, W, H, {});
  dot(ctx, G.X(x), G.Y(y), 7, M.SIGNS[q] ? QCOL[q] : C.text, C.bg);
  pointLabel(L, G, x, y, fc(x, y), C.text);
  const names = { I: t('qI'), II: t('qII'), III: t('qIII'), IV: t('qIV') }, centre = { I: [3, 3], II: [-3, 3], III: [-3, -3], IV: [3, -3] };
  s4.seen.forEach(k => {
    const [cx, cy] = centre[k], sg = M.SIGNS[k];
    L.put(t('c4q', { n: names[k] }), G.X(cx), G.Y(cy + 0.5), { size: 12, weight: 700, color: QCOL[k], cands: [[0, 0], [0, -G.cell], [0, G.cell * 2]] });
    L.put(`(${sg[0]}, ${sg[1]})`, G.X(cx), G.Y(cy - 0.6), { size: 13, weight: 700, color: QCOL[k], cands: [[0, 0], [0, G.cell], [0, -G.cell * 2]] });
  });
  const k = s4.seen.size, p = fc(x, y);
  let txt;
  if (M.SIGNS[q]) txt = t('s4quad', { p, sx: M.sign(x), sy: M.sign(y), n: names[q], k });
  else txt = t(q === 'origin' ? 's4origin' : q === 'xAxis' ? 's4xAxis' : 's4yAxis', { p, k });
  if (k === 4) txt += ' ' + t('s4all');
  $('r4').textContent = txt;
}

/* ---------- step 5: quiz ---------- */
const quiz = { q1: { locked: false, fb: null }, q2: { locked: false, fb: null, placed: null }, q3: { locked: false, fb: null } };
function draw5() {
  const qx = num('qx'), qy = num('qy'), Q = M.QUIZ;
  const { ctx, W, H } = fitCanvas($('c5')); const L = labeler(ctx, W, H);
  const G = plane(ctx, L, W, H, { title: t('c5title') });
  dot(ctx, G.X(Q.q1.p[0]), G.Y(Q.q1.p[1]), 7, C.violet, C.bg);
  pointLabel(L, G, Q.q1.p[0], Q.q1.p[1], t('c5p'), C.violet, { cands: [[0, -14], [12, 4, 'left'], [-12, 4, 'right'], [0, 24]] });
  if (quiz.q3.locked) {
    seg(ctx, [G.X(Q.q3.a[0]), G.Y(Q.q3.a[1])], [G.X(Q.q3.b[0]), G.Y(Q.q3.b[1])], C.text, 1.2, [4, 4]);
    [Q.q3.a, Q.q3.b].forEach((p, i) => { dot(ctx, G.X(p[0]), G.Y(p[1]), 6, i ? C.pink : C.green, C.bg); pointLabel(L, G, p[0], p[1], fc(p[0], p[1]), i ? C.pink : C.green); });
  }
  // the cross for question 2 (no coordinate shown: reading the grid is the task)
  const cx = G.X(qx), cy = G.Y(qy), r = 9;
  ctx.save(); ctx.strokeStyle = quiz.q2.locked ? C.green : C.cyan; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy); ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r); ctx.stroke(); ctx.restore();
  L.reserve(cx - r, cy - r, cx + r, cy + r);
  L.put(t('c5you'), cx, cy, { size: 11, color: quiz.q2.locked ? C.green : C.cyan, bg: C.bg, cands: [[0, -14], [0, 24], [14, 4, 'left'], [-14, 4, 'right']] });
  ['q1', 'q2', 'q3'].forEach(q => {
    const st = quiz[q], fb = $(q + 'fb');
    fb.textContent = st.fb ? t(st.fb, st.fb === 'wrong2' && st.placed ? { p: fc(st.placed[0], st.placed[1]) } : {}) : '';
    fb.style.color = st.locked ? C.green : C.orange;
    fb.closest('.quiz').dataset.locked = st.locked ? 'true' : 'false';
    $(q + 'check').disabled = st.locked;
    document.querySelectorAll(`input[name="${q}"]`).forEach(inp => { inp.disabled = st.locked; });
  });
  $('qx').disabled = $('qy').disabled = quiz.q2.locked;
  $('r5').textContent = t('s5score', { c: ['q1', 'q2', 'q3'].filter(q => quiz[q].locked).length });
}
function buildQuiz() {
  const Q = M.QUIZ;
  $('q1opts').innerHTML = Q.q1.options.map((p, i) => `<label><input type="radio" name="q1" value="${i}"><span>${fc(p[0], p[1])}</span></label>`).join('');
  $('q3opts').innerHTML = `<label><input type="radio" name="q3" value="same"><span data-i18n="q3same">${t('q3same')}</span></label><label><input type="radio" name="q3" value="different"><span data-i18n="q3diff">${t('q3diff')}</span></label>`;
  const mark = q => { const st = quiz[q]; if (st.locked) document.querySelectorAll(`input[name="${q}"]`).forEach(inp => inp.closest('label').classList.toggle('right', inp.checked)); };
  $('q1check').addEventListener('click', () => {
    const ch = document.querySelector('input[name="q1"]:checked'), st = quiz.q1;
    if (!ch) st.fb = 'noChoice'; else if (Number(ch.value) === Q.q1.answer && M.samePoint(Q.q1.options[Number(ch.value)], Q.q1.p)) { st.locked = true; st.fb = 'right1'; } else st.fb = 'wrong1';
    mark('q1'); draw5();
  });
  $('q2check').addEventListener('click', () => {
    const st = quiz.q2, p = [num('qx'), num('qy')]; st.placed = p;
    if (M.samePoint(p, Q.q2.target)) { st.locked = true; st.fb = 'right2'; } else st.fb = 'wrong2';
    draw5();
  });
  $('q3check').addEventListener('click', () => {
    const ch = document.querySelector('input[name="q3"]:checked'), st = quiz.q3;
    if (!ch) st.fb = 'noChoice'; else if (ch.value === Q.q3.answer) { st.locked = true; st.fb = 'right3'; } else st.fb = 'wrong3';
    mark('q3'); draw5();
  });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

/* ---------- tap / click a grid point to set the sliders (mouse can also drag) ---------- */
function bindGrid(canvasId, xId, yId, after, enabled = () => true) {
  const cv = $(canvasId); let down = null;
  const pick = e => {
    const r = cv.getBoundingClientRect(), g = geom(r.width, r.height);
    return [M.clamp(M.LO + (e.clientX - r.left - g.gx0) / g.cell), M.clamp(M.HI - (e.clientY - r.top - g.gy0) / g.cell)];
  };
  const apply = e => { if (!enabled()) return; const [x, y] = pick(e); if (num(xId) === x && num(yId) === y) return; $(xId).value = x; $(yId).value = y; after(); };
  cv.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, mouse: e.pointerType === 'mouse' }; if (down.mouse) apply(e); });
  cv.addEventListener('pointermove', e => { if (down && down.mouse && e.buttons) apply(e); });
  cv.addEventListener('pointerup', e => { if (down && !down.mouse && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 8) apply(e); down = null; });
  cv.addEventListener('pointercancel', () => { down = null; });
}

function setup() {
  $('modeLine').addEventListener('click', () => { s0.mode = 'line'; draw0(); });
  $('modePlane').addEventListener('click', () => { s0.mode = 'plane'; draw0(); });
  ['x0', 'y0', 'useY0'].forEach(id => $(id).addEventListener('input', draw0));
  $('useY0').addEventListener('change', draw0);

  const change1 = () => { stopAnim('s1'); s1.p = null; draw1(); };
  ['x1', 'y1'].forEach(id => $(id).addEventListener('input', change1));
  bindGrid('c1', 'x1', 'y1', change1);
  $('walk1').addEventListener('click', () => {
    const x = num('x1'), y = num('y1');
    s1.p = 0; draw1();
    animate('s1', 600 + 180 * (Math.abs(x) + Math.abs(y)), p => { s1.p = p; draw1(); }, () => { s1.trail.set(x + ',' + y, [x, y]); s1.p = 1; draw1(); });
  });
  $('clear1').addEventListener('click', () => { s1.trail.clear(); draw1(); });

  ['ox2', 'oy2'].forEach(id => $(id).addEventListener('input', draw2));

  const change3 = () => { stopAnim('s3'); s3.move = null; draw3(); };
  ['ax3', 'ay3'].forEach(id => $(id).addEventListener('input', change3));
  $('swap3').addEventListener('click', () => {
    const ax = num('ax3'), ay = num('ay3');
    if (ax === ay) { draw3(); return; }
    s3.move = 0;
    animate('s3', 900, p => { s3.move = p; draw3(); }, () => { $('ax3').value = ay; $('ay3').value = ax; s3.move = null; draw3(); });
  });

  ['x4', 'y4'].forEach(id => $(id).addEventListener('input', draw4));
  bindGrid('c4', 'x4', 'y4', draw4);
  $('clear4').addEventListener('click', () => { s4.seen.clear(); draw4(); });

  buildQuiz();
  ['qx', 'qy'].forEach(id => $(id).addEventListener('input', draw5));
  bindGrid('c5', 'qx', 'qy', draw5, () => !quiz.q2.locked);

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target)));
    }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshPage = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
