'use strict';
// Backpropagation lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every value, slope, bar and curve comes from window.BP_MODEL (model.js). Canvas text is limited to
// panel titles, node names/values and axis ticks laid out in fixed slots; legends and readouts live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.BP_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', node: '#182433', curve: '#9fb4cc', ghost: '#55657a' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros only after a decimal point (toFixed(0) = "90" stays "90"); show −0 as 0.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; };
const fixed = (v, d) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; return v.toFixed(d); };
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const sup = n => String(n).split('').map(ch => SUP[ch] || ch).join('');
const sci = v => { if (!Number.isFinite(v)) return '∞'; if (v === 0) return '0'; const e = Math.floor(Math.log10(Math.abs(v))); if (e >= -2 && e < 6) return fmt(v, e >= 3 ? 0 : 4); const m = v / Math.pow(10, e); return fmt(m, 1) + '×10' + sup(e); };
const SUB = { 1: '₁', 2: '₂', 3: '₃' };
const pretty = name => name[0] + name.slice(1).split('').map(ch => SUB[ch] || ch).join('');

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) { canvas.dataset.h = canvas.getAttribute('height') || 300; canvas.style.height = canvas.dataset.h + 'px'; }
  const height = Number(canvas.dataset.h);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}

// Panel title in its own row; the font shrinks until the text fits.
function title(ctx, text, X, Y, maxW, base = 12) {
  let size = base;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 7.5);
  ctx.fillText(text, X, Y); ctx.restore();
}
function fitFont(ctx, text, maxW, base, weight = '') {
  let size = base;
  do { ctx.font = `${weight} ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 7);
  return size;
}
function niceTicks(lo, hi, maxCount) {
  const span = hi - lo, raw = span / Math.max(1, maxCount), mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => s >= raw) || 10 * mag;
  const out = []; for (let v = Math.ceil(lo / step - 1e-9) * step; v <= hi + 1e-9; v += step) out.push(Math.abs(v) < 1e-12 ? 0 : v);
  return out;
}

// A plot frame: title row above, y ticks on the left, optional x ticks below.
function frame(ctx, W, o) {
  const P = { l: o.left ?? 40, r: o.right ?? W - 12, t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = `${o.tickFont || 11}px system-ui,sans-serif`; ctx.fillStyle = C.muted; ctx.textBaseline = 'alphabetic';
  for (const v of o.yTicks || []) {
    ctx.strokeStyle = v === 0 && !o.noZeroAxis ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(o.yLabel ? o.yLabel(v) : fmt(v), P.l - 5, y(v) + 4);
  }
  for (const v of o.xTicks || []) {
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
    ctx.textAlign = 'center'; ctx.fillText(o.xLabel ? o.xLabel(v) : fmt(v), x(v), P.b + 15);
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, o.titleX ?? 8, P.t - 10, (o.titleW ?? W - 16));
  return { x, y, P };
}
function dot(ctx, X, Y, r, fill, stroke) {
  ctx.beginPath(); ctx.arc(X, Y, r, 0, 7);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
}

/* ---------- network diagram (steps 0, 3, 4) ---------- */
// Columns: inputs x, hidden h, outputs ŷ, loss L. Returns node positions so callers can add overlays.
function netGeom(W, top, bottom) {
  const l = 34, r = W - 34, colX = [0, 1, 2, 3].map(i => l + i * (r - l) / 3);
  const R = Math.max(14, Math.min(21, (r - l) / 3 * 0.2));
  const rowY = [top + (bottom - top) * 0.22, top + (bottom - top) * 0.72];
  const mid = (rowY[0] + rowY[1]) / 2;
  return { R, x: [[colX[0], rowY[0]], [colX[0], rowY[1]]], h: [[colX[1], rowY[0]], [colX[1], rowY[1]]], o: [[colX[2], rowY[0]], [colX[2], rowY[1]]], L: [colX[3], mid] };
}
// Edge list in parameter order (w_jk: x_k → h_j; v_oj: h_j → ŷ_o).
const EDGES = [
  { i: 0, from: ['x', 0], to: ['h', 0] }, { i: 1, from: ['x', 1], to: ['h', 0] },
  { i: 2, from: ['x', 0], to: ['h', 1] }, { i: 3, from: ['x', 1], to: ['h', 1] },
  { i: 6, from: ['h', 0], to: ['o', 0] }, { i: 7, from: ['h', 1], to: ['o', 0] },
  { i: 8, from: ['h', 0], to: ['o', 1] }, { i: 9, from: ['h', 1], to: ['o', 1] }
];
function drawEdge(ctx, G, e, color, width, alpha = 1, dash = null) {
  const [a, b] = [G[e.from[0]][e.from[1]], G[e.to[0]][e.to[1]]];
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = width; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(a[0] + G.R, a[1]); ctx.lineTo(b[0] - G.R, b[1]); ctx.stroke(); ctx.restore();
}
function lossEdges(ctx, G, color = C.ghost) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]);
  G.o.forEach(p => { ctx.beginPath(); ctx.moveTo(p[0] + G.R, p[1]); ctx.lineTo(G.L[0] - G.R, G.L[1]); ctx.stroke(); });
  ctx.restore();
}
// Node: name inside the circle, value (if any) in a small box below it.
function node(ctx, G, pos, name, value, { ring = C.axis, valueColor = C.muted, fill = C.node } = {}) {
  const [X, Y] = pos;
  ctx.save();
  dot(ctx, X, Y, G.R, fill, ring);
  ctx.fillStyle = C.text; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  fitFont(ctx, name, G.R * 1.7, 13, '600'); ctx.fillText(name, X, Y + 0.5);
  if (value !== null && value !== undefined) {
    ctx.font = '600 11px system-ui,sans-serif';
    const w = ctx.measureText(value).width + 8, yv = Y + G.R + 11;
    ctx.fillStyle = C.bg; ctx.globalAlpha = 0.92; ctx.fillRect(X - w / 2, yv - 8, w, 16); ctx.globalAlpha = 1;
    ctx.fillStyle = valueColor; ctx.fillText(value, X, yv);
  }
  ctx.restore();
}
const NODE_NAMES = { x: ['x₁', 'x₂'], h: ['h₁', 'h₂'], o: ['ŷ₁', 'ŷ₂'] };

/* ---------- bar chart (steps 1, 3, 4) ---------- */
function bars(ctx, W, o) {
  const n = o.items.length;
  const F = frame(ctx, W, { top: o.top, bottom: o.bottom, xMin: 0, xMax: n, yMin: o.yMin, yMax: o.yMax, yTicks: o.yTicks, title: o.title, left: 40 });
  const slot = (F.P.r - F.P.l) / n, bw = Math.min(34, slot * 0.6);
  ctx.save();
  o.items.forEach((it, k) => {
    const cx = F.x(k + 0.5);
    if (it.value !== null && it.value !== undefined && Number.isFinite(it.value)) {
      const v = Math.max(o.yMin, Math.min(o.yMax, it.value)), Y0 = F.y(0), Y1 = F.y(v);
      ctx.fillStyle = it.color; ctx.globalAlpha = 0.9; ctx.fillRect(cx - bw / 2, Math.min(Y0, Y1), bw, Math.max(1.5, Math.abs(Y1 - Y0))); ctx.globalAlpha = 1;
    }
    if (it.tick !== undefined && it.tick !== null) {
      const Y = F.y(Math.max(o.yMin, Math.min(o.yMax, it.tick)));
      ctx.strokeStyle = C.text; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(cx - bw / 2 - 4, Y); ctx.lineTo(cx + bw / 2 + 4, Y); ctx.stroke();
    }
  });
  // category labels: one row; font shrinks to fit the slot
  ctx.fillStyle = C.muted; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  let size = 11; for (const it of o.items) size = Math.min(size, fitFont(ctx, it.label, slot - 3, 11));
  ctx.font = `${size}px system-ui,sans-serif`;
  o.items.forEach((it, k) => { ctx.fillStyle = it.labelColor || C.muted; ctx.fillText(it.label, F.x(k + 0.5), F.P.b + 15); });
  ctx.restore();
  return F;
}

/* ---------- shared animation runner (reduced motion, hidden pages) ---------- */
const anims = {};
function animate(name, ms, frameFn, done) {
  stopAnim(name);
  if (reduceMotion()) { frameFn(1); if (done) done(); return; }
  const start = performance.now();
  const tick = now => {
    const p = Math.min(1, (now - start) / ms);
    frameFn(p);
    if (p < 1) anims[name] = { id: requestAnimationFrame(tick), frameFn, done };
    else { delete anims[name]; if (done) done(); }
  };
  anims[name] = { id: requestAnimationFrame(tick), frameFn, done };
}
function stopAnim(name) { if (anims[name]) { cancelAnimationFrame(anims[name].id); delete anims[name]; } }
function finishAll() { Object.keys(anims).forEach(k => { const a = anims[k]; cancelAnimationFrame(a.id); delete anims[k]; a.frameFn(1); if (a.done) a.done(); }); }

/* ---------- step 0: forward pass, one parameter at a time ---------- */
const s0 = { p: M.P0.slice(), sel: 0 };
const L0 = M.loss(M.P0);
function draw0() {
  const i = s0.sel, val = s0.p[i];
  $('v0v').textContent = fmt(val, 2);
  const f = M.forward(s0.p);
  const { ctx, W, H } = fitCanvas($('c0'));
  title(ctx, t('c0net'), 8, 18, W - 16);
  const G = netGeom(W, 30, 236);
  EDGES.forEach(e => { const w = s0.p[e.i]; drawEdge(ctx, G, e, e.i === i ? C.orange : (w >= 0 ? C.cyan : C.pink), 1 + 2.6 * Math.min(2, Math.abs(w)), e.i === i ? 1 : 0.7); });
  lossEdges(ctx, G);
  const biasNode = i === 4 || i === 5 ? ['h', i - 4] : i === 10 || i === 11 ? ['o', i - 10] : null;
  ['x', 'h', 'o'].forEach(col => [0, 1].forEach(j => {
    const v = col === 'x' ? f.x[j] : col === 'h' ? f.h[j] : f.yh[j];
    const isBias = biasNode && biasNode[0] === col && biasNode[1] === j;
    node(ctx, G, G[col][j], NODE_NAMES[col][j], fmt(v, 2), { ring: isBias ? C.orange : C.axis, valueColor: col === 'x' ? C.muted : C.text });
  }));
  node(ctx, G, G.L, 'L', fmt(f.L, 3), { ring: C.orange, valueColor: C.orange });
  // loss curve for the chosen parameter
  const xs = [], ys = [];
  for (let k = 0; k <= 120; k++) { const v = -3 + 6 * k / 120; xs.push(v); ys.push(M.loss(M.withParam(s0.p, i, v))); }
  const yMax = Math.max(0.5, ...ys) * 1.08;
  const F = frame(ctx, W, { top: 290, bottom: H - 26, xMin: -3, xMax: 3, yMin: 0, yMax, yTicks: niceTicks(0, yMax, 3), xTicks: [-3, -2, -1, 0, 1, 2, 3], title: t('c0curve') + ' · ' + pretty(M.NAMES[i]) });
  ctx.save(); ctx.strokeStyle = C.curve; ctx.lineWidth = 2; ctx.beginPath();
  xs.forEach((v, k) => { if (!k) ctx.moveTo(F.x(v), F.y(ys[k])); else ctx.lineTo(F.x(v), F.y(ys[k])); }); ctx.stroke();
  dot(ctx, F.x(M.P0[i]), F.y(M.loss(M.withParam(s0.p, i, M.P0[i]))), 5, null, C.muted);
  dot(ctx, F.x(val), F.y(f.L), 6, C.orange);
  ctx.restore();
  $('r0').textContent = t('s0readout', { z1: fmt(f.z[0]), z2: fmt(f.z[1]), h1: fmt(f.h[0], 3), h2: fmt(f.h[1], 3), y1: fmt(f.yh[0], 3), y2: fmt(f.yh[1], 3), L: fixed(f.L, 4), L0: fixed(L0, 4) });
}

/* ---------- step 1: nudge every parameter ---------- */
const s1 = { done: 0 };
const exact = M.backward(M.P0).grad;
function draw1() {
  const eps = Math.pow(10, num('e1'));
  $('e1v').textContent = sci(eps);
  const { ctx, W, H } = fitCanvas($('c1'));
  const items = M.NAMES.map((nm, i) => ({ label: pretty(nm), value: i < s1.done ? M.nudge(M.P0, i, eps) : null, color: C.orange, tick: exact[i] }));
  bars(ctx, W, { top: 30, bottom: H - 28, yMin: -1, yMax: 2, yTicks: [-1, -0.5, 0, 0.5, 1, 1.5, 2], items, title: t('c1bars') });
  let err = 0; for (let i = 0; i < s1.done; i++) err = Math.max(err, Math.abs(M.nudge(M.P0, i, eps) - exact[i]));
  const prog = s1.done < 12 ? t('s1progress', { c: s1.done, p: s1.done ? s1.done + 1 : 0 }) : t('s1done', { p: 13 });
  $('r1').textContent = t('s1readout', { prog, eps: sci(eps), err: s1.done ? sci(err) : '—' });
}

/* ---------- step 2: local slopes along one path ---------- */
function miniPlot(ctx, box, fn, xMin, xMax, x0, slope, label) {
  const xs = [], ys = [];
  for (let k = 0; k <= 80; k++) { const v = xMin + (xMax - xMin) * k / 80; xs.push(v); ys.push(fn(v)); }
  const y0 = fn(x0);
  let lo = Math.min(...ys, y0), hi = Math.max(...ys, y0); if (hi - lo < 1e-6) { lo -= 0.5; hi += 0.5; }
  const pad = (hi - lo) * 0.08; lo -= pad; hi += pad;
  const yt = niceTicks(lo, hi, 3), xt = niceTicks(xMin, xMax, box.right - box.left > 220 ? 6 : 4);
  const F = frame(ctx, box.W, { top: box.top, bottom: box.bottom, left: box.left + 34, right: box.right, xMin, xMax, yMin: lo, yMax: hi, yTicks: yt, xTicks: xt, tickFont: 10, noZeroAxis: true, title: label, titleX: box.left + 4, titleW: box.right - box.left - 4 });
  ctx.save(); ctx.beginPath(); ctx.rect(F.P.l, F.P.t, F.P.r - F.P.l, F.P.b - F.P.t); ctx.clip();
  ctx.strokeStyle = C.curve; ctx.lineWidth = 1.8; ctx.beginPath(); xs.forEach((v, k) => { if (!k) ctx.moveTo(F.x(v), F.y(ys[k])); else ctx.lineTo(F.x(v), F.y(ys[k])); }); ctx.stroke();
  // tangent: ±36 px along the direction (1, slope) in screen space
  const sx = (F.P.r - F.P.l) / (xMax - xMin), sy = (F.P.b - F.P.t) / (hi - lo);
  const dx = 1 * sx, dy = -slope * sy, len = Math.hypot(dx, dy) || 1, ux = dx / len * 36, uy = dy / len * 36;
  const X = F.x(x0), Y = F.y(y0);
  ctx.strokeStyle = C.cyan; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(X - ux, Y - uy); ctx.lineTo(X + ux, Y + uy); ctx.stroke();
  dot(ctx, X, Y, 4.5, C.orange);
  ctx.restore();
}
function draw2() {
  const w = num('w2'); $('w2v').textContent = fmt(w, 2);
  const p = M.withParam(M.P0, 0, w), f = M.forward(p), V = M.unpack(p).V, x = M.X0, y = M.Y0;
  const r = M.routes(p)[0], [a, b, c, d] = r.factors;
  const { ctx, W, H } = fitCanvas($('c2'));
  const half = W / 2, rowH = H / 2;
  const boxes = [[0, 0], [1, 0], [0, 1], [1, 1]].map(([cx, cy]) => ({ W, left: cx * half + 2, right: cx * half + half - 10, top: cy * rowH + 30, bottom: cy * rowH + rowH - 26 }));
  const rest1 = p[1] * x[1] + p[4];
  miniPlot(ctx, boxes[0], v => v * x[0] + rest1, -3, 3, w, a, t('p2a', { s: fmt(a, 3) }));
  miniPlot(ctx, boxes[1], M.sig, -6, 6, f.z[0], b, t('p2b', { s: fmt(b, 3) }));
  const rest3 = V[0][1] * f.h[1] + p[10];
  miniPlot(ctx, boxes[2], v => V[0][0] * v + rest3, 0, 1, f.h[0], c, t('p2c', { s: fmt(c, 3) }));
  const e2 = f.yh[1] - y[1];
  const lo = Math.min(-1, f.yh[0] - 1), hi = Math.max(3, f.yh[0] + 1);
  miniPlot(ctx, boxes[3], v => 0.5 * (v - y[0]) ** 2 + 0.5 * e2 * e2, lo, hi, f.yh[0], d, t('p2d', { s: fmt(d, 3) }));
  const n = M.nudge(p, 0, 1e-5, 'central'), gap = n - r.product;
  const verdict = Math.abs(gap) < 1e-6 ? t('s2match') : t('s2nomatch', { gap: fmt(gap, 4) });
  $('r2').textContent = t('s2readout', { a: fmt(a, 3), b: fmt(b, 3), c: fmt(c, 3), d: fmt(d, 3), p: fmt(r.product, 4), n: fmt(n, 4), verdict });
}

/* ---------- step 3: two paths, added ---------- */
function draw3() {
  const w = num('w3'), u = num('u3'); $('w3v').textContent = fmt(w, 2); $('u3v').textContent = fmt(u, 2);
  const p = M.withParam(M.withParam(M.P0, 0, w), 8, u), f = M.forward(p);
  const [r1, r2] = M.routes(p), sum = r1.product + r2.product, n = M.nudge(p, 0, 1e-5, 'central');
  const { ctx, W, H } = fitCanvas($('c3'));
  title(ctx, t('c3net'), 8, 18, W - 16);
  const G = netGeom(W, 30, 226);
  EDGES.forEach(e => drawEdge(ctx, G, e, C.ghost, 1.5, 0.6));
  lossEdges(ctx, G);
  const thick = v => 1.5 + 5 * Math.min(1, Math.abs(v) / 0.3);
  // path 1 (orange) and path 2 (green), drawn with a small offset so both stay visible on the shared links
  const seg = (A, B, col, wd, off, dash) => { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = wd; if (dash) ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(A[0], A[1] + off); ctx.lineTo(B[0], B[1] + off); ctx.stroke(); ctx.restore(); };
  const x1 = G.x[0], h1 = G.h[0], o1 = G.o[0], o2 = G.o[1], Lp = G.L;
  const ed = (A, B) => { const dx = B[0] - A[0], dy = B[1] - A[1], l = Math.hypot(dx, dy); return [[A[0] + dx / l * G.R, A[1] + dy / l * G.R], [B[0] - dx / l * G.R, B[1] - dy / l * G.R]]; };
  const w1 = thick(r1.product), w2 = thick(r2.product);
  [[x1, h1], [h1, o1], [o1, Lp]].forEach(([A, B]) => { const [a, b] = ed(A, B); seg(a, b, C.orange, w1, -3); });
  if (Math.abs(r2.product) > 1e-12) [[x1, h1], [h1, o2], [o2, Lp]].forEach(([A, B]) => { const [a, b] = ed(A, B); seg(a, b, C.green, w2, 3); });
  ['x', 'h', 'o'].forEach(col => [0, 1].forEach(j => {
    const v = col === 'x' ? f.x[j] : col === 'h' ? f.h[j] : f.yh[j];
    node(ctx, G, G[col][j], NODE_NAMES[col][j], fmt(v, 2), { valueColor: C.muted });
  }));
  node(ctx, G, G.L, 'L', fmt(f.L, 3), { ring: C.orange, valueColor: C.orange });
  const vals = [r1.product, r2.product, sum, n], m = Math.max(0.2, ...vals.map(Math.abs)) * 1.15;
  bars(ctx, W, { top: 290, bottom: H - 28, yMin: -m, yMax: m, yTicks: niceTicks(-m, m, 4), title: t('c3bars'), items: [
    { label: t('b3r1'), value: r1.product, color: C.orange },
    { label: t('b3r2'), value: r2.product, color: C.green },
    { label: t('b3sum'), value: sum, color: C.cyan },
    { label: t('b3num'), value: n, color: C.text }
  ] });
  const note = Math.abs(u) < 1e-9 ? t('s3zero') : r1.product * r2.product < 0 ? t('s3cancel') : t('s3same');
  $('r3').textContent = t('s3readout', { r1: fmt(r1.product, 4), r2: fmt(r2.product, 4), s: fmt(sum, 4), n: fmt(n, 4), d: sci(Math.abs(sum - n)), note });
}

/* ---------- step 4: the backward sweep ---------- */
const s4 = { stage: 0 };
const B4 = M.backward(M.P0);
const NUM4 = M.NAMES.map((_, i) => M.nudge(M.P0, i, 1e-5, 'central'));
function draw4() {
  const st = s4.stage, f = B4.f;
  $('back4').disabled = st >= 4;
  const { ctx, W, H } = fitCanvas($('c4'));
  title(ctx, t('c4net'), 8, 18, W - 16);
  const G = netGeom(W, 30, 236);
  const gradDone = i => (i >= 6 ? st >= 2 : st >= 4);
  EDGES.forEach(e => drawEdge(ctx, G, e, gradDone(e.i) ? C.cyan : C.ghost, gradDone(e.i) ? 1.5 + 4 * Math.min(1, Math.abs(B4.grad[e.i]) / 0.7) : 1.5, gradDone(e.i) ? 0.9 : 0.6));
  lossEdges(ctx, G, st >= 1 ? C.orange : C.ghost);
  [0, 1].forEach(j => node(ctx, G, G.x[j], NODE_NAMES.x[j], fmt(f.x[j], 2), { valueColor: C.muted }));
  [0, 1].forEach(j => node(ctx, G, G.h[j], NODE_NAMES.h[j], st >= 3 ? 'δ ' + fmt(B4.dZ[j], 3) : fmt(f.h[j], 2), { ring: st >= 3 ? C.orange : C.axis, valueColor: st >= 3 ? C.orange : C.muted }));
  [0, 1].forEach(j => node(ctx, G, G.o[j], NODE_NAMES.o[j], st >= 1 ? 'δ ' + fmt(B4.dOut[j], 3) : fmt(f.yh[j], 2), { ring: st >= 1 ? C.orange : C.axis, valueColor: st >= 1 ? C.orange : C.muted }));
  node(ctx, G, G.L, 'L', fmt(f.L, 3), { ring: C.orange, valueColor: C.orange });
  const items = M.NAMES.map((nm, i) => ({ label: pretty(nm), value: gradDone(i) ? B4.grad[i] : null, color: C.cyan, tick: NUM4[i] }));
  bars(ctx, W, { top: 290, bottom: H - 28, yMin: -0.6, yMax: 1.2, yTicks: [-0.5, 0, 0.5, 1], items, title: t('c4bars') });
  const err = Math.max(...B4.grad.map((g, i) => Math.abs(g - NUM4[i])));
  const msg = [
    t('s4stage0'),
    t('s4stage1', { d1: fmt(B4.dOut[0], 3), d2: fmt(B4.dOut[1], 3) }),
    t('s4stage2', { g: fmt(B4.gV[0][0], 4) }),
    t('s4stage3', { d1: fmt(B4.dZ[0], 4), d2: fmt(B4.dZ[1], 4) }),
    t('s4stage4', { g: fmt(B4.gW[0][0], 4), err: sci(err) })
  ][st];
  $('r4').textContent = msg;
}

/* ---------- step 5: work counts ---------- */
function draw5() {
  const D = num('d5'), n = num('n5'); $('d5v').textContent = String(D); $('n5v').textContent = String(n);
  const series = [{ k: 'nudgeWork', col: C.orange }, { k: 'pathWork', col: C.pink }, { k: 'backWork', col: C.cyan }];
  const rows = []; for (let d = 1; d <= 12; d++) rows.push(M.costs(d, n));
  const top = Math.ceil(Math.max(...rows.map(r => Math.log10(r.pathWork)), ...rows.map(r => Math.log10(r.nudgeWork))));
  const { ctx, W, H } = fitCanvas($('c5'));
  const plotH = H - 40 - 28, stepDec = [1, 2, 3, 4, 5].find(s => plotH / (top / s) >= 24) || 5;
  const yt = []; for (let v = 0; v <= top; v += stepDec) yt.push(v);
  const yMax = yt[yt.length - 1] < top ? yt[yt.length - 1] + stepDec : top;
  if (yt[yt.length - 1] < yMax) yt.push(yMax);
  const F = frame(ctx, W, { top: 40, bottom: H - 28, left: 44, xMin: 0.5, xMax: 12.5, yMin: 0, yMax, yTicks: yt, yLabel: v => '10' + sup(v), xTicks: W < 420 ? [1, 3, 5, 7, 9, 11] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], xLabel: v => String(v), title: t('c5') });
  ctx.save();
  series.forEach(s => {
    ctx.strokeStyle = s.col; ctx.lineWidth = 2.2; ctx.beginPath();
    rows.forEach((r, k) => { const X = F.x(k + 1), Y = F.y(Math.log10(r[s.k])); if (!k) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }); ctx.stroke();
    rows.forEach((r, k) => dot(ctx, F.x(k + 1), F.y(Math.log10(r[s.k])), k + 1 === D ? 6 : 2.5, s.col));
  });
  ctx.strokeStyle = C.text; ctx.globalAlpha = 0.35; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(F.x(D), F.P.t); ctx.lineTo(F.x(D), F.P.b); ctx.stroke();
  ctx.restore();
  const c = M.costs(D, n);
  $('r5').textContent = t('s5readout', { D, n, P: c.P, a: sci(c.nudgeWork), b: sci(c.pathWork), r: sci(c.routesFirst), c: sci(c.backWork), k: fmt(c.backWork / c.F, 1) });
}

/* ---------- step 6: training on XOR ---------- */
const MAX6 = 3000;
const s6 = { idx: 0, net: null, hist: [], playing: false, raf: 0 };
function reset6() { pause6(); s6.net = M.initXor(M.SEEDS6[s6.idx]); s6.hist = [M.xorLoss(s6.net)]; }
function epoch6(k) {
  const eta = num('eta6');
  for (let i = 0; i < k && s6.hist.length - 1 < MAX6; i++) {
    s6.net = M.xorStep(s6.net, eta); const L = M.xorLoss(s6.net);
    s6.hist.push(Number.isFinite(L) ? L : Infinity); if (!Number.isFinite(L)) break;
  }
}
const stalled6 = () => s6.hist.length - 1 >= MAX6 || !Number.isFinite(s6.hist[s6.hist.length - 1]);
function pause6() { s6.playing = false; cancelAnimationFrame(s6.raf); if ($('train6')) $('train6').textContent = t('train'); }
function play6() {
  if (stalled6()) return;
  if (reduceMotion()) { epoch6(MAX6); draw6(); return; }
  s6.playing = true; $('train6').textContent = t('pause');
  const tick = () => { if (!s6.playing) return; epoch6(8); draw6(); if (stalled6()) { pause6(); draw6(); return; } s6.raf = requestAnimationFrame(tick); };
  s6.raf = requestAnimationFrame(tick);
}
function draw6() {
  const eta = num('eta6'); $('eta6v').textContent = fmt(eta, 1);
  $('train6').textContent = t(s6.playing ? 'pause' : 'train');
  $('train6').disabled = stalled6(); $('one6').disabled = stalled6();
  let { ctx, W, H } = fitCanvas($('c6'));
  title(ctx, t('c6map'), 8, 18, W - 16);
  const side = Math.min(W - 52, H - 62), l = 36 + Math.max(0, (W - 52 - side) / 2), top = 30;
  const span = [-0.25, 1.25], G = 40, cell = side / G;
  for (let a = 0; a < G; a++) for (let b = 0; b < G; b++) {
    const x1 = span[0] + (a + 0.5) / G * 1.5, x2 = span[1] - (b + 0.5) / G * 1.5;
    const v = Math.max(0, Math.min(1, M.xorOut(s6.net, x1, x2)));
    ctx.fillStyle = `rgb(${Math.round(13 + v * 90)},${Math.round(22 + v * 193)},${Math.round(33 + v * 216)})`;
    const X0 = Math.floor(l + a * cell), Y0 = Math.floor(top + b * cell);
    ctx.fillRect(X0, Y0, Math.ceil(l + (a + 1) * cell) - X0, Math.ceil(top + (b + 1) * cell) - Y0);
  }
  const px = v => l + (v - span[0]) / 1.5 * side, py = v => top + (span[1] - v) / 1.5 * side;
  ctx.save(); ctx.strokeStyle = C.axis; ctx.strokeRect(l, top, side, side);
  ctx.fillStyle = C.muted; ctx.font = '11px system-ui,sans-serif'; ctx.textAlign = 'center';
  [0, 1].forEach(v => ctx.fillText(String(v), px(v), top + side + 15));
  ctx.fillText('x₁', px(0.5), top + side + 15);
  ctx.textAlign = 'right'; [0, 1].forEach(v => ctx.fillText(String(v), l - 6, py(v) + 4));
  ctx.fillText('x₂', l - 6, py(0.5) + 4);
  M.XOR.forEach(([a, b, y]) => { if (y) { dot(ctx, px(a), py(b), 9, C.bg, null); dot(ctx, px(a), py(b), 6.5, C.text, null); } else { dot(ctx, px(a), py(b), 9, C.bg, null); dot(ctx, px(a), py(b), 6.5, null, C.orange); } });
  ctx.restore();

  ({ ctx, W, H } = fitCanvas($('c6b')));
  const ep = s6.hist.length - 1, xMax = Math.max(100, Math.ceil(ep / 100) * 100);
  const F = frame(ctx, W, { top: 30, bottom: H - 28, left: 40, right: W - 24, xMin: 0, xMax, yMin: -6, yMax: 2, yTicks: [-6, -4, -2, 0, 2], noZeroAxis: true, yLabel: v => '10' + sup(v), xTicks: niceTicks(0, xMax, W < 300 ? 3 : 4), xLabel: v => String(Math.round(v)), title: t('c6loss') });
  ctx.save();
  ctx.strokeStyle = C.muted; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(F.P.l, F.y(-2)); ctx.lineTo(F.P.r, F.y(-2)); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.beginPath();
  const ly = v => F.y(Math.max(-6, Math.min(2, Math.log10(Math.max(1e-12, Number.isFinite(v) ? v : 1e3)))));
  const stride = Math.max(1, Math.floor(s6.hist.length / 600));
  for (let k = 0; k < s6.hist.length; k += stride) { const X = F.x(k), Y = ly(s6.hist[k]); if (!k) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
  ctx.lineTo(F.x(ep), ly(s6.hist[ep])); ctx.stroke();
  dot(ctx, F.x(ep), ly(s6.hist[ep]), 5, C.orange);
  ctx.restore();
  const L = s6.hist[ep], first = s6.hist.findIndex(v => v < 0.01);
  const status = first >= 0 ? t('s6ok', { k: first }) : (L > 1 && L > 3 * s6.hist[0]) ? t('s6diverge') : t('s6slow');
  const o = M.XOR.map(([a, b]) => fmt(M.xorOut(s6.net, a, b), 2));
  $('r6').textContent = t('s6readout', { seed: s6.idx + 1, ep, max: MAX6, eta: fmt(eta, 1), L: Number.isFinite(L) ? sci(L) : '∞', o00: o[0], o01: o[1], o10: o[2], o11: o[3], status });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); draw6(); }

function setup() {
  const sel = $('p0');
  M.NAMES.forEach((nm, i) => { const op = document.createElement('option'); op.value = String(i); op.textContent = pretty(nm); sel.appendChild(op); });
  sel.addEventListener('change', () => { s0.sel = Number(sel.value); $('v0').value = s0.p[s0.sel]; draw0(); });
  $('v0').addEventListener('input', () => { s0.p[s0.sel] = num('v0'); draw0(); });

  $('e1').addEventListener('input', draw1);
  $('nudge1').addEventListener('click', () => { s1.done = 0; draw1(); animate('s1', 12 * 320, p => { s1.done = Math.min(12, Math.floor(p * 12.999)); if (p >= 1) s1.done = 12; draw1(); }); });
  $('clear1').addEventListener('click', () => { stopAnim('s1'); s1.done = 0; draw1(); });

  $('w2').addEventListener('input', draw2);
  $('w3').addEventListener('input', draw3); $('u3').addEventListener('input', draw3);

  $('back4').addEventListener('click', () => { stopAnim('s4'); s4.stage = Math.min(4, s4.stage + 1); draw4(); });
  $('auto4').addEventListener('click', () => { s4.stage = 0; draw4(); animate('s4', 4 * 800, p => { s4.stage = Math.min(4, Math.floor(p * 4.999)); if (p >= 1) s4.stage = 4; draw4(); }); });
  $('reset4').addEventListener('click', () => { stopAnim('s4'); s4.stage = 0; draw4(); });

  $('d5').addEventListener('input', draw5); $('n5').addEventListener('input', draw5);

  $('eta6').addEventListener('input', draw6);
  $('train6').addEventListener('click', () => { if (s6.playing) { pause6(); draw6(); } else play6(); });
  $('one6').addEventListener('click', () => { pause6(); epoch6(1); draw6(); });
  $('reset6').addEventListener('click', () => { reset6(); draw6(); });
  $('seed6').addEventListener('click', () => { s6.idx = (s6.idx + 1) % M.SEEDS6.length; reset6(); draw6(); });
  reset6();

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target)));
    }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { finishAll(); if (s6.playing) { pause6(); draw6(); } } });
  window.refreshLesson = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
