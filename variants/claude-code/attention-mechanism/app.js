'use strict';
// Attention lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every score, weight and readout comes from window.ATT_MODEL (model.js). Canvas text is limited to panel
// titles (own row, shrunk to fit), axis ticks and short word/key labels at fixed offsets; numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.ATT_MODEL;
const t = (...a) => window.ATT_I18N.t(...a);
const DEG = M.DEG;
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#1f2c3b', axis: '#3d5068', text: '#e8edf4', bg: '#0d1621', ghost: '#8696aa' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Fixed decimals, trailing zeros trimmed only after a decimal point, −0 shown as 0, true minus sign.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s.replace('-', '−'); };
// Two fixed decimals (matrix entries, coordinates), −0 shown as 0.00.
const f2 = q => (Math.abs(q) < 0.005 ? 0 : q).toFixed(2).replace('-', '−');

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  const maxH = Number(canvas.getAttribute('height')) || 300;
  // CSS height: the authored height, or width × aspect when that is smaller (square world views on phones).
  const height = canvas.dataset.aspect ? Math.min(maxH, Math.round(width * Number(canvas.dataset.aspect))) : maxH;
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

// Panel title in its own row; the font shrinks until it fits.
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 7);
  ctx.fillText(text, X, Y, maxW); ctx.restore(); // last resort: squeeze rather than overflow
}
function niceStep(span, px, minPx, steps) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }

// Equal-aspect world view. The y range is fixed; the x range widens to fill the canvas (or the scale
// shrinks if the x range would not fit). Ticks sit left of and below the plot box.
function world(ctx, W, H, o) {
  const top = 32, bottom = H - 22, left = 34, right = W - 10;
  let s = (bottom - top) / (o.y1 - o.y0);
  if ((o.x1 - o.x0) * s > right - left) s = (right - left) / (o.x1 - o.x0);
  const cx = (o.x0 + o.x1) / 2, cy = (o.y0 + o.y1) / 2, mx = (left + right) / 2, my = (top + bottom) / 2;
  const X = v => mx + (v - cx) * s, Y = v => my - (v - cy) * s;
  const xv0 = cx - (mx - left) / s, xv1 = cx + (right - mx) / s, yv0 = cy - (bottom - my) / s, yv1 = cy + (my - top) / s;
  const step = niceStep(1, s, 34, o.steps || [0.25, 0.5, 1, 2]);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (let v = Math.ceil(xv0 / step) * step; v <= xv1 + 1e-9; v += step) {
    ctx.strokeStyle = Math.abs(v) < 1e-9 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(X(v), Y(yv1)); ctx.lineTo(X(v), Y(yv0)); ctx.stroke();
    const lx = X(v); if (lx > left + 8 && lx < right - 8) { ctx.textAlign = 'center'; ctx.fillText(fmt(v), lx, bottom + 15); }
  }
  for (let v = Math.ceil(yv0 / step) * step; v <= yv1 + 1e-9; v += step) {
    ctx.strokeStyle = Math.abs(v) < 1e-9 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(X(xv0), Y(v)); ctx.lineTo(X(xv1), Y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(fmt(v), left - 5, Y(v) + 4);
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, top - 9, W - 16);
  return { X, Y, s, box: { l: left, r: right, t: top, b: bottom } };
}

// A plain plot panel (x and y scaled independently). yLog: y values are log10.
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 10), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const tk of o.yTicks) {
    const v = typeof tk === 'object' ? tk.v : tk, lab = typeof tk === 'object' ? tk.label : fmt(v);
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(lab, P.l - 5, y(v) + 4);
  }
  if (o.xTicks) {
    ctx.textAlign = 'center';
    for (const v of o.xTicks) {
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.t); ctx.lineTo(x(v), P.b); ctx.stroke();
      if (!o.noXLabels) ctx.fillText(fmt(v, 0), x(v), P.b + 15);
    }
  }
  ctx.strokeStyle = C.axis; ctx.strokeRect(P.l, P.t, P.r - P.l, P.b - P.t);
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 8, W - 16);
  return { x, y, P };
}
function line(ctx, pts, color, lw = 2, dash = null, alpha = 1) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = alpha; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); pts.forEach(([a, b], i) => (i ? ctx.lineTo(a, b) : ctx.moveTo(a, b))); ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, r, color, ring = false) {
  ctx.save(); ctx.beginPath(); ctx.arc(X, Y, r, 0, 7);
  if (ring) { ctx.strokeStyle = color; ctx.lineWidth = 2.2; ctx.stroke(); } else { ctx.fillStyle = color; ctx.fill(); ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5; ctx.stroke(); }
  ctx.restore();
}
function arrow(ctx, x0, y0, x1, y1, color, lw = 2.6) {
  const L = Math.hypot(x1 - x0, y1 - y0); if (L < 0.5) return;
  const ux = (x1 - x0) / L, uy = (y1 - y0) / L, hs = Math.min(10, L * 0.45);
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - ux * hs * 0.7, y1 - uy * hs * 0.7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - ux * hs - uy * hs * 0.5, y1 - uy * hs + ux * hs * 0.5); ctx.lineTo(x1 - ux * hs + uy * hs * 0.5, y1 - uy * hs - ux * hs * 0.5); ctx.closePath(); ctx.fill();
  ctx.restore();
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

function poly(ctx, pts, { fill = null, stroke = null, lw = 2, dash = null, alpha = 1 } = {}) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.beginPath(); pts.forEach(([a, b], i) => (i ? ctx.lineTo(a, b) : ctx.moveTo(a, b))); ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.stroke(); }
  ctx.restore();
}


const KC = ['#ff7a93', '#7ee2a8', '#b79cff', '#f2d36b'];           // keys 1–4 (steps 0, 1)
const TC = ['#ffb454', '#7ee2a8', '#67d7f9', '#ff7a93', '#b79cff']; // tokens / words (steps 2, 3, 5)
const tok = i => t('tok' + i);
// Fixed label offsets for the five token points (pixels): chosen so that "ball" and "it", which sit close
// together, label away from each other. [dx, dy, align]
const TOK_LABEL = [[9, -9, 'left'], [9, 4, 'left'], [10, 5, 'left'], [-10, 5, 'right'], [-10, 4, 'right']];
function tag(ctx, text, X, Y, align, color) {
  ctx.save(); ctx.font = '600 12px system-ui,sans-serif'; ctx.textAlign = align;
  ctx.lineWidth = 3; ctx.strokeStyle = C.bg; ctx.strokeText(text, X, Y); ctx.fillStyle = color; ctx.fillText(text, X, Y); ctx.restore();
}
function badge(ctx, text, X, Y, color) {
  ctx.save(); ctx.beginPath(); ctx.arc(X, Y, 9, 0, 7); ctx.fillStyle = C.bg; ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = color; ctx.font = '700 11px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText(text, X, Y + 4); ctx.restore();
}
// Category labels under bars: shrink to the slot width.
function slotLabel(ctx, text, X, Y, maxW, color = C.muted) {
  let size = 11; ctx.save(); ctx.fillStyle = color; ctx.textAlign = 'center';
  do { ctx.font = `${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 7);
  ctx.fillText(text, X, Y, maxW); ctx.restore();
}
const list = (a, f = f2) => a.map(v => f(v)).join(' · ');

/* ---------- step 0: hard vs soft lookup ---------- */
const s0 = { visited: new Uint8Array(360) };
const REF0 = Array.from({ length: 361 }, (_, a) => M.lookup(a, M.Q0LEN));
const STATS0 = M.sweepStats();
function draw0() {
  const a = num('q0'); s0.visited[a % 360] = 1;
  $('q0v').textContent = a + '°';
  const L = M.lookup(a, M.Q0LEN), K = M.keys();
  {
    const { ctx, W, H } = fitCanvas($('c0a'));
    const v = world(ctx, W, H, { x0: -2.8, x1: 2.8, y0: -2.8, y1: 2.8, title: t('c0a'), steps: [0.5, 1, 2] });
    ctx.save(); ctx.strokeStyle = C.axis; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.arc(v.X(0), v.Y(0), v.s, 0, 7); ctx.stroke(); ctx.restore();
    K.forEach((k, j) => {
      ctx.save(); ctx.globalAlpha = 0.5; ctx.fillStyle = KC[j]; ctx.beginPath(); ctx.arc(v.X(k[0]), v.Y(k[1]), 2 + 0.3 * v.s * Math.sqrt(L.w[j]), 0, 7); ctx.fill(); ctx.restore();
      arrow(ctx, v.X(0), v.Y(0), v.X(k[0]), v.Y(k[1]), KC[j], 2.4);
    });
    const q = M.queryAt(a, M.Q0LEN); arrow(ctx, v.X(0), v.Y(0), v.X(q[0]), v.Y(q[1]), C.text, 2.6);
    K.forEach((k, j) => badge(ctx, String(j + 1), v.X(1.7 * k[0]), v.Y(1.7 * k[1]), KC[j]));
  }
  {
    const { ctx, W, H } = fitCanvas($('c0b'));
    const B = panel(ctx, W, { top: 32, bottom: H - 24, xMin: 0, xMax: 360, yMin: -2.5, yMax: 3.5, yTicks: [-2, -1, 0, 1, 2, 3], xTicks: [0, 90, 180, 270, 360], title: t('c0b') });
    line(ctx, REF0.map((r, d) => [B.x(d), B.y(r.hard)]), C.ghost, 1.2, [4, 4], 0.6);
    line(ctx, REF0.map((r, d) => [B.x(d), B.y(r.soft)]), C.ghost, 1.2, [4, 4], 0.6);
    for (let d = 0; d < 360; d++) {
      const e = (d + 1) % 360; if (!s0.visited[d] || !s0.visited[e]) continue;
      line(ctx, [[B.x(d), B.y(REF0[d].hard)], [B.x(d + 1), B.y(REF0[d + 1].hard)]], C.orange, 2.4);
      line(ctx, [[B.x(d), B.y(REF0[d].soft)], [B.x(d + 1), B.y(REF0[d + 1].soft)]], C.cyan, 2.4);
    }
    ctx.save(); ctx.strokeStyle = C.text; ctx.globalAlpha = 0.5; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(B.x(a), B.P.t); ctx.lineTo(B.x(a), B.P.b); ctx.stroke(); ctx.restore();
    dot(ctx, B.x(a), B.y(L.hard), 5, C.orange); dot(ctx, B.x(a), B.y(L.soft), 5, C.cyan);
  }
  M.MEM.values.forEach((val, j) => { $('lgk' + j).textContent = t('keyName', { k: j + 1, v: fmt(val) }); });
  $('r0').textContent = t('s0readout', { a, s: list(L.scores), w: list(L.w), b: L.best + 1, hard: fmt(L.hard), soft: f2(L.soft) });
  $('h0').innerHTML = t('s0hint', { jmin: fmt(STATS0.jMin), jmax: fmt(STATS0.jMax), slope: fmt(STATS0.maxSlope, 3) });
}

/* ---------- step 1: softmax ---------- */
const Q1 = { deg: 60, len: 2 };
function draw1() {
  const beta = num('beta'), c = num('csh');
  $('betav').textContent = fmt(beta); $('cshv').textContent = fmt(c);
  const L = M.lookup(Q1.deg, Q1.len, beta, c);
  const names = [0, 1, 2, 3].map(j => String(j + 1));
  {
    const { ctx, W, H } = fitCanvas($('c1a'));
    const B = panel(ctx, W, { top: 32, bottom: H - 24, xMin: -0.5, xMax: 3.5, yMin: -4.5, yMax: 4.5, yTicks: [-4, -2, 0, 2, 4], title: t('c1a') });
    ctx.save(); ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(B.P.l, B.y(0)); ctx.lineTo(B.P.r, B.y(0)); ctx.stroke(); ctx.restore();
    const w = (B.x(1) - B.x(0)) * 0.56;
    L.scores.forEach((s, j) => { ctx.save(); ctx.fillStyle = KC[j]; ctx.globalAlpha = 0.85; ctx.fillRect(B.x(j) - w / 2, Math.min(B.y(0), B.y(s)), w, Math.max(1.5, Math.abs(B.y(s) - B.y(0)))); ctx.restore(); });
    names.forEach((nm, j) => slotLabel(ctx, nm, B.x(j), B.P.b + 15, w));
  }
  {
    const { ctx, W, H } = fitCanvas($('c1b'));
    const B = panel(ctx, W, { top: 32, bottom: H - 24, xMin: -0.5, xMax: 3.5, yMin: 0, yMax: 1, yTicks: [0, 0.25, 0.5, 0.75, 1], title: t('c1b') });
    const w = (B.x(1) - B.x(0)) * 0.56;
    L.w.forEach((v, j) => { ctx.save(); ctx.fillStyle = KC[j]; ctx.globalAlpha = 0.85; ctx.fillRect(B.x(j) - w / 2, B.y(v), w, Math.max(1.5, B.y(0) - B.y(v))); ctx.restore(); });
    names.forEach((nm, j) => slotLabel(ctx, nm, B.x(j), B.P.b + 15, w));
  }
  [0, 1, 2, 3].forEach(j => { $('lgb' + j).textContent = t('keyName', { k: j + 1, v: fmt(M.MEM.values[j]) }); });
  const sum = L.w.reduce((x, y) => x + y, 0);
  $('r1').textContent = t('s1readout', { b: fmt(beta), c: fmt(c), s: list(L.scores), w: list(L.w), sum: fmt(sum), eff: f2(M.effCount(L.w)) });
  const L5 = M.lookup(Q1.deg, Q1.len, 5);
  $('h1').textContent = t('s1hint', { w5: f2(L5.w[0]), e5: f2(M.effCount(L5.w)) });
}

/* ---------- steps 2 and 3: a five-word sentence ---------- */
const s2 = { ask: 3 }, s3 = { masked: false };
function tokenPlane(ctx, W, H, ttl) { return world(ctx, W, H, { x0: -1.25, x1: 1.35, y0: -1.3, y1: 1.3, title: ttl, steps: [0.5, 1] }); }
function tokenLabels(ctx, v, P) {
  P.forEach((p, i) => { const [dx, dy, al] = TOK_LABEL[i]; tag(ctx, tok(i), v.X(p[0]) + dx, v.Y(p[1]) + dy, al, TC[i]); });
}
function draw2() {
  const phi = num('phi'), i = s2.ask;
  $('phiv').textContent = fmt(phi) + '°';
  const R = M.attention(phi), w = R.A[i];
  {
    const { ctx, W, H } = fitCanvas($('c2a'));
    const v = tokenPlane(ctx, W, H, t('c2a'));
    R.K.forEach((k, j) => {
      ctx.save(); ctx.strokeStyle = TC[j]; ctx.lineWidth = 2; ctx.globalAlpha = 0.8; ctx.beginPath(); ctx.arc(v.X(k[0]), v.Y(k[1]), 5 + 0.28 * v.s * Math.sqrt(w[j]), 0, 7); ctx.stroke(); ctx.restore();
      dot(ctx, v.X(k[0]), v.Y(k[1]), j === i ? 7 : 5, TC[j]);
    });
    const q = R.Q[i], L = Math.hypot(q[0], q[1]) || 1;
    arrow(ctx, v.X(0), v.Y(0), v.X(1.15 * q[0] / L), v.Y(1.15 * q[1] / L), C.text, 2.6);
    tokenLabels(ctx, v, R.K);
  }
  {
    const { ctx, W, H } = fitCanvas($('c2b'));
    const B = panel(ctx, W, { top: 32, bottom: H - 24, xMin: -0.5, xMax: 4.5, yMin: 0, yMax: 1, yTicks: [0, 0.25, 0.5, 0.75, 1], title: t('c2b') });
    const bw = (B.x(1) - B.x(0)) * 0.6;
    w.forEach((x, j) => {
      ctx.save(); ctx.fillStyle = TC[j]; ctx.globalAlpha = 0.85; ctx.fillRect(B.x(j) - bw / 2, B.y(x), bw, Math.max(1.5, B.y(0) - B.y(x)));
      if (j === i) { ctx.globalAlpha = 1; ctx.strokeStyle = C.text; ctx.lineWidth = 1.5; ctx.strokeRect(B.x(j) - bw / 2, B.y(x), bw, Math.max(1.5, B.y(0) - B.y(x))); }
      ctx.restore();
      slotLabel(ctx, tok(j), B.x(j), B.P.b + 15, (B.x(1) - B.x(0)) - 4, j === i ? C.text : C.muted);
    });
  }
  for (let j = 0; j < 5; j++) $('ask' + j).setAttribute('aria-pressed', j === i ? 'true' : 'false');
  const top = M.argmax(w);
  $('r2').textContent = t('s2readout', { tok: tok(i), phi: fmt(phi), s: list(R.S[i]), w: list(w), top: tok(top), wt: f2(w[top]) });
  const A0 = M.attention(0).A, A90 = M.attention(90).A;
  $('h2').textContent = t('s2hint', { a0: f2(A0[3][2]), a1: f2(A0[3][3]), a2: f2(A90[3][0]), a3: f2(A90[0][3]) });
}
const HULL = M.hull(M.TOK);
function draw3() {
  const phi = num('phi3'), R = M.attention(phi, s3.masked), n = R.n;
  $('phi3v').textContent = fmt(phi) + '°';
  {
    const { ctx, W, H } = fitCanvas($('c3a'));
    title(ctx, t('c3a'), 8, 23, W - 16);
    ctx.save(); ctx.font = '11px system-ui,sans-serif';
    const lw = Math.min(64, Math.max(...[0, 1, 2, 3, 4].map(j => ctx.measureText(tok(j)).width)) + 12);
    ctx.restore();
    const top = 52, cell = Math.min((W - lw - 10) / n, (H - top - 8) / n), x0 = lw + (W - lw - 10 - cell * n) / 2;
    for (let j = 0; j < n; j++) {
      slotLabel(ctx, tok(j), x0 + (j + 0.5) * cell, top - 7, cell - 3, TC[j]);
      ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = TC[j]; ctx.textAlign = 'right';
      ctx.fillText(tok(j), x0 - 6, top + (j + 0.5) * cell + 4, lw - 10); ctx.restore();
    }
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
      const a = R.A[r][c], X = x0 + c * cell, Y = top + r * cell, blocked = s3.masked && c > r;
      ctx.save();
      ctx.fillStyle = blocked ? '#0a0e14' : `rgba(103,215,249,${(0.06 + 0.94 * a).toFixed(3)})`; ctx.fillRect(X + 1, Y + 1, cell - 2, cell - 2);
      ctx.fillStyle = blocked ? C.axis : (a > 0.5 ? '#061118' : C.text);
      ctx.font = `${Math.min(12, Math.max(8, cell * 0.24))}px system-ui,sans-serif`; ctx.textAlign = 'center';
      ctx.fillText(f2(a), X + cell / 2, Y + cell / 2 + 4, cell - 4); ctx.restore();
    }
  }
  {
    const { ctx, W, H } = fitCanvas($('c3b'));
    const v = tokenPlane(ctx, W, H, t('c3b'));
    poly(ctx, HULL.map(p => [v.X(p[0]), v.Y(p[1])]), { fill: 'rgba(134,150,170,.08)', stroke: C.ghost, lw: 1.4, dash: [5, 4] });
    R.V.forEach((p, j) => dot(ctx, v.X(p[0]), v.Y(p[1]), 5, TC[j]));
    R.O.forEach((o, j) => dot(ctx, v.X(o[0]), v.Y(o[1]), 6, TC[j], true));
    tokenLabels(ctx, v, R.V);
  }
  $('mOff').setAttribute('aria-pressed', s3.masked ? 'false' : 'true'); $('mOn').setAttribute('aria-pressed', s3.masked ? 'true' : 'false');
  const inside = R.O.every(o => M.inHull(o, HULL));
  $('r3').textContent = t('s3readout', { phi: fmt(phi), mask: s3.masked ? t('maskOnR') : t('maskOffR'), sums: list(R.A.map(r => r.reduce((x, y) => x + y, 0)), x => fmt(x)), upper: f2(M.upperSum(R.A)), r0: R.A[0].map(f2).join(', '), inside: t(inside ? 'yes' : 'no') });
}

/* ---------- step 4: why divide by √d ---------- */
let STUDY = null;
const study = () => (STUDY = STUDY || M.DIMS.map(d => M.scalingStudy(d)));
function hist(vals, lo, hi, nb) { const h = new Array(nb).fill(0); vals.forEach(x => { const k = Math.floor((x - lo) / (hi - lo) * nb); if (k >= 0 && k < nb) h[k]++; }); return h.map(c => c / vals.length); }
function niceCeil(v) { for (const s of [0.05, 0.1, 0.2, 0.25, 0.4, 0.5, 0.6, 0.8, 1]) if (v <= s) return s; return 1; }
function histPanel(ctx, W, top, bottom, vals, lo, hi, nb, color, sd, ttl, ticks) {
  const h = hist(vals, lo, hi, nb), yMax = niceCeil(Math.max(...h));
  const B = panel(ctx, W, { top, bottom, xMin: lo, xMax: hi, yMin: 0, yMax, yTicks: [0, { v: yMax / 2, label: fmt(yMax / 2, 3) }, { v: yMax, label: fmt(yMax, 2) }], xTicks: ticks, title: ttl });
  const bw = (B.x(hi) - B.x(lo)) / nb;
  ctx.save(); ctx.fillStyle = color; ctx.globalAlpha = 0.8;
  h.forEach((f, k) => { if (f > 0) ctx.fillRect(B.x(lo) + k * bw + 0.5, B.y(f), Math.max(1, bw - 1), B.y(0) - B.y(f)); });
  ctx.restore();
  [-sd, sd].forEach(x => { if (x > lo && x < hi) line(ctx, [[B.x(x), B.P.t], [B.x(x), B.P.b]], C.text, 1.2, [3, 3], 0.7); });
}
function draw4() {
  const k = num('dIdx'), S = study(), r = S[k], d = r.d;
  $('dIdxv').textContent = String(d);
  {
    const { ctx, W, H } = fitCanvas($('c4a'));
    const mid = Math.round(H / 2);
    histPanel(ctx, W, 32, mid - 26, r.raw, -80, 80, 40, C.orange, r.sdRaw, t('c4a'), [-80, -40, 0, 40, 80]);
    histPanel(ctx, W, mid + 26, H - 24, r.sc, -5, 5, 40, C.cyan, r.sdSc, t('c4a2'), [-4, -2, 0, 2, 4]);
  }
  {
    const { ctx, W, H } = fitCanvas($('c4b'));
    const mid = Math.round(H / 2), idx = M.DIMS.map((_, i) => i);
    const curve = (top, bottom, yMax, ticks, kRaw, kSc, ttl, labels) => {
      const B = panel(ctx, W, { top, bottom, xMin: 0, xMax: 9, yMin: 0, yMax, yTicks: ticks, xTicks: idx, noXLabels: true, title: ttl });
      if (labels) { ctx.save(); ctx.fillStyle = C.muted; ctx.font = '11px system-ui,sans-serif'; ctx.textAlign = 'center'; [0, 2, 4, 6, 9].forEach(i => ctx.fillText(String(M.DIMS[i]), B.x(i), B.P.b + 15)); ctx.restore(); }
      line(ctx, [[B.x(k), B.P.t], [B.x(k), B.P.b]], C.text, 1, [2, 3], 0.5);
      [[kRaw, C.orange], [kSc, C.cyan]].forEach(([key, col]) => {
        line(ctx, S.map((s, i) => [B.x(i), B.y(s[key])]), col, 2);
        S.forEach((s, i) => dot(ctx, B.x(i), B.y(s[key]), i === k ? 5.5 : 3, i === k ? C.text : col));
      });
    };
    curve(32, mid - 26, 1, [0, 0.25, 0.5, 0.75, 1], 'maxRaw', 'maxSc', t('c4b'), false);
    curve(mid + 26, H - 24, 0.25, [0, 0.1, 0.2], 'gRaw', 'gSc', t('c4b2'), true);
  }
  $('r4').textContent = t('s4readout', { d, sd: f2(r.sdRaw), rd: f2(Math.sqrt(d)), sds: f2(r.sdSc), mr: f2(r.maxRaw), ms: f2(r.maxSc), gr: fmt(r.gRaw, 3), gs: fmt(r.gSc, 3) });
  const ms = S.map(s => s.maxSc), gs = S.map(s => s.gSc), last = S[S.length - 1];
  $('h4').textContent = t('s4hint', { sd512: f2(last.sdRaw), m1: f2(S[0].maxRaw), m512: f2(last.maxRaw), g1: f2(S[0].gRaw), g512: fmt(last.gRaw, 3), msLo: f2(Math.min(...ms)), msHi: f2(Math.max(...ms)), gsLo: f2(Math.min(...gs)), gsHi: f2(Math.max(...gs)) });
}

/* ---------- step 5: word order ---------- */
const GAP5 = Array.from({ length: 101 }, (_, i) => [i / 100, M.orderGap(i / 100)]);
function draw5() {
  const a = num('pa');
  $('pav').textContent = fmt(a);
  const R1 = M.orderOutputs([0, 1, 2], a), R2 = M.orderOutputs([2, 1, 0], a), gaps = M.orderGap(a);
  {
    const { ctx, W, H } = fitCanvas($('c5a'));
    const v = world(ctx, W, H, { x0: -0.4, x1: 2.0, y0: -1.8, y1: 1.2, title: t('c5a'), steps: [0.5, 1] });
    R1.X.forEach((p, w) => { const X = v.X(p[0]), Y = v.Y(p[1]); ctx.save(); ctx.fillStyle = TC[w]; ctx.globalAlpha = 0.75; ctx.fillRect(X - 4, Y - 4, 8, 8); ctx.restore(); });
    for (let w = 0; w < 3; w++) {
      const o1 = R1.out[w], o2 = R2.out[w];
      line(ctx, [[v.X(o1[0]), v.Y(o1[1])], [v.X(o2[0]), v.Y(o2[1])]], TC[w], 1.2, [3, 3], 0.7);
      dot(ctx, v.X(o1[0]), v.Y(o1[1]), 5.5, TC[w]);
      dot(ctx, v.X(o2[0]), v.Y(o2[1]), 9, TC[w], true);
    }
  }
  {
    const { ctx, W, H } = fitCanvas($('c5b'));
    const B = panel(ctx, W, { top: 32, bottom: H - 24, xMin: 0, xMax: 1, yMin: 0, yMax: 1.2, yTicks: [0, 0.4, 0.8, 1.2], xTicks: [0, 0.25, 0.5, 0.75, 1], noXLabels: true, title: t('c5b') });
    ctx.save(); ctx.fillStyle = C.muted; ctx.font = '11px system-ui,sans-serif'; ctx.textAlign = 'center'; [0, 0.5, 1].forEach(x => ctx.fillText(fmt(x), B.x(x), B.P.b + 15)); ctx.restore();
    line(ctx, [[B.x(a), B.P.t], [B.x(a), B.P.b]], C.text, 1, [2, 3], 0.5);
    for (let w = 0; w < 3; w++) {
      line(ctx, GAP5.map(([x, g]) => [B.x(x), B.y(g[w])]), TC[w], 2);
      dot(ctx, B.x(a), B.y(gaps[w]), 5, TC[w]);
    }
  }
  $('r5').textContent = t('s5readout', { a: fmt(a), gaps: gaps.map((g, w) => `${t('word' + w)} ${f2(g)}`).join(' · ') });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  $('q0').addEventListener('input', () => { stopAnim('s0'); draw0(); });
  $('sweep0').addEventListener('click', () => {
    const start = num('q0');
    animate('s0', 6000, p => { $('q0').value = String((start + Math.round(p * 359)) % 360); draw0(); }, () => { s0.visited.fill(1); draw0(); });
  });
  ['beta', 'csh'].forEach(id => $(id).addEventListener('input', draw1));
  const syncPhi = (from, to) => { $(to).value = $(from).value; draw2(); draw3(); };
  $('phi').addEventListener('input', () => syncPhi('phi', 'phi3'));
  $('phi3').addEventListener('input', () => syncPhi('phi3', 'phi'));
  for (let j = 0; j < 5; j++) $('ask' + j).addEventListener('click', () => { s2.ask = j; draw2(); });
  $('mOff').addEventListener('click', () => { s3.masked = false; draw3(); });
  $('mOn').addEventListener('click', () => { s3.masked = true; draw3(); });
  $('dIdx').addEventListener('input', draw4);
  $('pa').addEventListener('input', draw5);

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
  window.refreshAttention = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
