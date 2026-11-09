'use strict';
// Circle lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every length, count and ratio comes from window.CIRCLE_MODEL (model.js). All canvas text goes through
// Labels, which keeps each label inside the canvas and skips a label rather than letting it overlap another.
(function () {

const $ = id => document.getElementById(id);
const M = window.CIRCLE_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', blue: '#3f7fb0', muted: '#9aaabd', grid: '#1f2c3b', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a' };
const TRAIL = [C.cyan, C.orange, C.green, C.pink, C.violet];
const FONT = 'system-ui,-apple-system,"PingFang SC","Microsoft YaHei",sans-serif';
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fix = (v, d) => { const s = v.toFixed(d); return /^-0\.?0*$/.test(s) ? s.slice(1) : s; };          // fixed decimals, no "−0"
const fmt = (v, d = 2) => fix(v, d).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');                 // trimmed

// heightFor(width) optionally shrinks a canvas on narrow screens (CSS size and backing store stay separate).
function fitCanvas(canvas, heightFor) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) canvas.dataset.h = canvas.getAttribute('height') || 300;
  const height = Math.round(heightFor ? Math.min(Number(canvas.dataset.h), heightFor(width)) : Number(canvas.dataset.h));
  if (canvas.style.height !== height + 'px') canvas.style.height = height + 'px';
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height, L: new Labels(ctx, width, height) };
}

/* Label layout: every label is a box; a candidate position is used only if it stays inside the canvas and
   clears every box already placed (2 px gap). If no candidate fits, the label is skipped. */
function Labels(ctx, W, H) { this.ctx = ctx; this.W = W; this.H = H; this.boxes = []; }
Labels.prototype.block = function (x0, y0, x1, y1) { this.boxes.push({ x0, y0, x1, y1 }); };
Labels.prototype.free = function (b) { return !this.boxes.some(o => b.x0 < o.x1 + 2 && b.x1 > o.x0 - 2 && b.y0 < o.y1 + 2 && b.y1 > o.y0 - 2); };
Labels.prototype.put = function (text, x, y, o = {}) {
  const ctx = this.ctx, size = o.size || 12;
  ctx.save(); ctx.font = `${o.weight || 400} ${size}px ${FONT}`;
  const w = ctx.measureText(text).width;
  for (const [dx, dy, al] of (o.cands || [[0, 0, o.align || 'left']])) {
    let left = x + dx - (al === 'center' ? w / 2 : al === 'right' ? w : 0);
    if (o.clamp) left = Math.max(3, Math.min(this.W - 3 - w, left));
    const Y = y + dy, b = { x0: left, x1: left + w, y0: Y - size * 0.95, y1: Y + size * 0.3 };
    if (b.x0 < 2 || b.x1 > this.W - 2 || b.y0 < 1 || b.y1 > this.H - 1 || !this.free(b)) continue;
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    if (o.halo !== false) { ctx.lineJoin = 'round'; ctx.lineWidth = 3.5; ctx.strokeStyle = C.bg; ctx.strokeText(text, left, Y); } // dark halo keeps labels legible over marks
    ctx.fillStyle = o.color || C.text; ctx.fillText(text, left, Y);
    this.boxes.push(b); ctx.restore(); return b;
  }
  ctx.restore(); return null;
};
// Panel title: one row of its own, font shrinks until it fits the width.
Labels.prototype.title = function (text, X, Y, maxW) {
  const ctx = this.ctx; let size = 13;
  ctx.save();
  do { ctx.font = `600 ${size}px ${FONT}`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.restore();
  return this.put(text, X, Y, { size, weight: 600 });
};

// A chart panel: grid lines + tick labels (placed through Labels).
function chart(ctx, L, o) {
  const P = { l: o.l, r: o.r, t: o.t, b: o.b };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1;
  for (const v of o.yTicks) { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.t); ctx.lineTo(P.l, P.b); ctx.lineTo(P.r, P.b); ctx.stroke();
  ctx.restore();
  for (const v of o.yTicks) L.put(o.yFmt ? o.yFmt(v) : fmt(v), P.l - 5, y(v) + 4, { size: 11, color: C.muted, cands: [[0, 0, 'right']] });
  for (const v of o.xTicks) {
    ctx.save(); ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke(); ctx.restore();
    L.put(o.xFmt ? o.xFmt(v) : fmt(v), x(v), P.b + 21, { size: 11, color: C.muted, cands: [[0, 0, 'center']] });
  }
  return { x, y, P };
}
function dot(ctx, X, Y, r, color, hollow) {
  ctx.save(); ctx.beginPath(); ctx.arc(X, Y, r, 0, Math.PI * 2);
  if (hollow) { ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke(); } else { ctx.fillStyle = color; ctx.fill(); }
  ctx.restore();
}
function line(ctx, pts, color, lw = 2, dash = null) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); pts.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y))); ctx.stroke(); ctx.restore();
}
// Candidate label spots around a point, starting in the outward direction `deg` (screen: y down, so flip).
function around(deg, gap = 10) {
  const out = [];
  for (const off of [0, 40, -40, 80, -80, 130, -130, 180]) {
    const a = (deg + off) * Math.PI / 180, cx = Math.cos(a), cy = -Math.sin(a);
    out.push([cx * gap + (cx < -0.3 ? -2 : 2), cy * gap + (cy > 0.3 ? 12 : cy < -0.3 ? -2 : 5), cx < -0.3 ? 'right' : cx > 0.3 ? 'left' : 'center']);
  }
  return out;
}

/* ---------- animation runner (respects reduced motion and hidden pages) ---------- */
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

/* ---------- step 0: the taut string ---------- */
const s0 = { trails: new Map() };            // radius → Set of visited directions (degrees)
const R0 = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
function mark0(r, th) { if (!s0.trails.has(r)) s0.trails.set(r, new Set()); s0.trails.get(r).add(((th % 360) + 360) % 360); }
function draw0() {
  const r = num('r0'), th = num('th0');
  $('r0v').textContent = fmt(r, 1); $('th0v').textContent = th + '°';
  const { ctx, W, H, L } = fitCanvas($('c0'));
  L.title(t('c0title'), 10, 18, W - 20);
  const top = 30, bot = H - 8, half = 5.5;
  const s = Math.min((W - 20) / (2 * half), (bot - top) / (2 * half)), cx = W / 2, cy = (top + bot) / 2;
  const X = v => cx + v * s, Y = v => cy - v * s;
  ctx.save(); ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
  for (let g = -5; g <= 5; g++) { ctx.beginPath(); ctx.moveTo(X(g), Y(-half)); ctx.lineTo(X(g), Y(half)); ctx.moveTo(X(-half), Y(g)); ctx.lineTo(X(half), Y(g)); ctx.stroke(); }
  ctx.restore();
  for (const [rr, set] of s0.trails) {
    const col = TRAIL[(R0.indexOf(rr) + 1) % TRAIL.length];   // the default r = 3 cm gets cyan
    for (const a of set) { const p = M.point(rr, a); dot(ctx, X(p.x), Y(p.y), rr === r ? 3.2 : 2.4, col); }
  }
  const p = M.point(r, th);
  line(ctx, [[X(0), Y(0)], [X(p.x), Y(p.y)]], C.orange, 2.6);
  dot(ctx, X(0), Y(0), 4.5, C.text); dot(ctx, X(p.x), Y(p.y), 6, C.text);
  L.block(X(0) - 5, Y(0) - 5, X(0) + 5, Y(0) + 5); L.block(X(p.x) - 6, Y(p.y) - 6, X(p.x) + 6, Y(p.y) + 6);
  L.put('P', X(p.x), Y(p.y), { size: 14, weight: 700, cands: around(th, 11) });
  L.put('O', X(0), Y(0), { size: 14, weight: 700, cands: around(th + 180, 10) });
  const mx = X(p.x / 2), my = Y(p.y / 2);
  L.put('r = ' + fmt(r, 1) + ' cm', mx, my, { size: 12, color: C.orange, cands: around(th + 90, 8).concat(around(th - 90, 8)) });
  const k = s0.trails.has(r) ? s0.trails.get(r).size : 0;
  $('out0').textContent = t('s0readout', { x: fix(p.x, 2), y: fix(p.y, 2), d: fix(M.dist(p), 2), r: fmt(r, 1), k }) + (k === 72 ? ' ' + t('s0done') : '');
}

/* ---------- step 1: radius, diameter, chord ---------- */
const s1 = { hist: new Set() };
const A1 = 200;                               // where A sits (degrees)
function draw1() {
  const r = num('r1'), phi = num('p1'), c = M.chord(r, phi, A1);
  $('r1v').textContent = fmt(r, 1); $('p1v').textContent = phi + '°';
  // left: the circle
  {
    const { ctx, W, H, L } = fitCanvas($('c1'));
    L.title(t('c1title', { r: fmt(r, 1) }), 10, 18, W - 20);
    const s = Math.min(W - 40, H - 60) / 10, cx = W / 2, cy = 32 + (H - 32) / 2;
    const X = v => cx + v * s, Y = v => cy - v * s;
    ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(cx, cy, r * s, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    const A = M.point(r, A1), B = M.point(r, A1 + phi);
    line(ctx, [[X(A.x), Y(A.y)], [X(0), Y(0)], [X(B.x), Y(B.y)]], C.muted, 1.4, [5, 4]);
    line(ctx, [[X(A.x), Y(A.y)], [X(B.x), Y(B.y)]], phi === 180 ? C.orange : C.cyan, 3);
    dot(ctx, X(0), Y(0), 4, C.text); dot(ctx, X(A.x), Y(A.y), 5.5, C.text); dot(ctx, X(B.x), Y(B.y), 5.5, C.cyan);
    [[0, 0, 4], [A.x, A.y, 6], [B.x, B.y, 6]].forEach(([u, v, q]) => L.block(X(u) - q, Y(v) - q, X(u) + q, Y(v) + q));
    L.put('A', X(A.x), Y(A.y), { size: 14, weight: 700, cands: around(A1, 11) });
    L.put('B', X(B.x), Y(B.y), { size: 14, weight: 700, color: C.cyan, cands: around(A1 + phi, 11) });
    L.put('O', X(0), Y(0), { size: 14, weight: 700, cands: around(A1 + phi / 2 + 180, 10).concat(around(A1 + phi / 2 + 90, 10)) });
  }
  // right: chord length against the angle, every tried angle kept
  {
    const { ctx, W, H, L } = fitCanvas($('c1b'));
    L.title(t('c1btitle'), 10, 18, W - 20);
    const m = chart(ctx, L, { l: 34, r: W - 22, t: 34, b: H - 30, xMin: 0, xMax: 360, yMin: 0, yMax: 10.5, xTicks: [0, 90, 180, 270, 360], yTicks: [0, 2, 4, 6, 8, 10], xFmt: v => v + '°' });
    line(ctx, [[m.x(0), m.y(2 * r)], [m.x(360), m.y(2 * r)]], C.orange, 1.6, [6, 4]);
    for (const a of s1.hist) dot(ctx, m.x(a), m.y(M.chord(r, a, A1)), 3, C.cyan);
    dot(ctx, m.x(phi), m.y(c), 6, phi === 180 ? C.orange : C.cyan, true);
    L.block(m.x(phi) - 7, m.y(c) - 7, m.x(phi) + 7, m.y(c) + 7);
    L.put('d = ' + fmt(2 * r, 1) + ' cm', m.x(360), m.y(2 * r) - 6, { size: 12, color: C.orange, cands: [[0, 0, 'right'], [0, 20, 'right'], [-(m.x(360) - m.x(0)) / 2, 0, 'center'], [-(m.x(360) - m.x(0)) / 2, 20, 'center']] });
  }
  let best = 0; for (const a of s1.hist) best = Math.max(best, M.chord(r, a, A1));
  $('out1').textContent = t('s1readout', { c: fix(c, 2), r: fmt(r, 1), d: fmt(2 * r, 1), p: fix(100 * c / (2 * r), 1), k: s1.hist.size, m: fix(best, 2) }) + (phi === 180 ? ' ' + t('s1diam') : '');
}

/* ---------- step 2: roll a wheel ---------- */
const s2 = { done: [] };                      // diameters that completed a full turn
function record2() { const d = num('d2'); if (num('u2') >= 1 && !s2.done.includes(d)) s2.done.push(d); }
function draw2() {
  const d = num('d2'), u = num('u2'), r = d / 2, Lr = M.rolled(d, u), C2 = M.rimLength(d);
  $('d2v').textContent = fmt(d, 1); $('u2v').textContent = fix(u, 2);
  {
    const { ctx, W, H, L } = fitCanvas($('c2'), w => 150 + 5 * (w - 24) / (Math.PI * 5 + 5.6));
    L.title(t('c2title', { d: fmt(d, 1) }), 10, 18, W - 20);
    const s = Math.min((W - 24) / (Math.PI * 5 + 5.6), (H - 110) / 5), x0 = 12 + 2.6 * s, g = H - 66;
    // ruler in diameters
    const marks = Math.floor((W - 14 - x0) / (d * s));
    for (let i = 0; i < marks; i++) { ctx.fillStyle = i % 2 ? '#2a3a4e' : '#3a4d64'; ctx.fillRect(x0 + i * d * s, g + 10, d * s, 10); }
    line(ctx, [[8, g], [W - 8, g]], C.axis, 1.5);
    line(ctx, [[x0, g], [x0 + Lr * s, g]], C.orange, 4);
    for (let i = 0; i <= marks; i++) {
      line(ctx, [[x0 + i * d * s, g + 8], [x0 + i * d * s, g + 24]], C.muted, 1);
      if (i > 0) L.put(i + 'd', x0 + i * d * s, g + 38, { size: 11, color: C.muted, cands: [[0, 0, 'center']] });
    }
    L.put('0', x0, g + 38, { size: 11, color: C.muted, cands: [[0, 0, 'center']] });
    const cx = x0 + Lr * s, cy = g - r * s, R = r * s, alpha = Lr / r;
    ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    for (let q = 0; q < 4; q++) { const a = Math.PI / 2 + alpha + q * Math.PI / 2; ctx.strokeStyle = C.raw; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + R * Math.cos(a), cy + R * Math.sin(a)); ctx.stroke(); }
    if (alpha > 0) { ctx.strokeStyle = C.orange; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy, R, Math.PI / 2, Math.PI / 2 + Math.min(alpha, Math.PI * 2 - 1e-6)); ctx.stroke(); }
    ctx.restore();
    dot(ctx, cx + R * Math.cos(Math.PI / 2 + alpha), cy + R * Math.sin(Math.PI / 2 + alpha), 4.5, C.pink);
    dot(ctx, cx, cy, 2.5, C.text);
  }
  {
    const { ctx, W, H, L } = fitCanvas($('c2b'));
    L.title(t('c2btitle'), 10, 18, W - 20);
    const m = chart(ctx, L, { l: 32, r: W - 22, t: 34, b: H - 30, xMin: 0, xMax: 5.5, yMin: 0, yMax: 18, xTicks: [0, 1, 2, 3, 4, 5], yTicks: [0, 5, 10, 15] });
    if (s2.done.length >= 2) {
      const q = s2.done.reduce((a, dd) => a + M.rimLength(dd) / dd, 0) / s2.done.length;
      line(ctx, [[m.x(0), m.y(0)], [m.x(5.5), m.y(5.5 * q)]], C.muted, 1.4, [6, 4]);
      L.put('C = ' + fix(q, 2) + ' × d', m.x(1.2), m.y(1.2 * q), { size: 12, color: C.muted, cands: [[-6, -14, 'right'], [8, 14, 'left'], [-6, -34, 'right']] });
    }
    for (const dd of s2.done) dot(ctx, m.x(dd), m.y(M.rimLength(dd)), 4.5, C.cyan);
    line(ctx, [[m.x(d), m.y(0)], [m.x(d), m.y(Lr)]], C.orange, 3);
    dot(ctx, m.x(d), m.y(Lr), 6, C.orange, true);
  }
  let txt = t('s2readout', { u: fix(u, 2), L: fix(Lr, 2), k: fix(Lr / d, 2) });
  if (u >= 1) txt += ' ' + t('s2full', { C: fix(C2, 2), q: fix(C2 / d, 4) });
  if (s2.done.length >= 3) txt += ' ' + t('s2fit', { n: s2.done.length, q: fix(M.rimLength(s2.done[0]) / s2.done[0], 4) });
  $('out2').textContent = txt;
}

/* ---------- step 3: trap π between polygons ---------- */
const s3 = { hist: new Set([3]) };
const Y3 = { min: 2.5, max: 3.7 };
function draw3() {
  const idx = num('n3'), n = M.N_LIST[idx], q = M.polyRatios(n);
  $('n3v').textContent = String(n);
  {
    const { ctx, W, H, L } = fitCanvas($('c3'));
    L.title(t('c3title', { n }), 10, 18, W - 20);
    const top = 30, R = Math.min(W - 20, H - top - 10) / 2 / 1.42, cx = W / 2, cy = top + (H - top) / 2;
    ctx.save(); ctx.beginPath(); ctx.rect(0, top, W, H - top); ctx.clip();
    const poly = (Rr, col, fill) => {
      const v = M.polygon(n, Rr); ctx.beginPath(); v.forEach((p, i) => (i ? ctx.lineTo(cx + p.x, cy - p.y) : ctx.moveTo(cx + p.x, cy - p.y))); ctx.closePath();
      ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke();
    };
    poly(R / Math.cos(Math.PI / n), C.orange, 'rgba(255,180,84,.10)');
    ctx.strokeStyle = C.text; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    poly(R, C.cyan, 'rgba(103,215,249,.12)');
    ctx.restore();
  }
  {
    const { ctx, W, H, L } = fitCanvas($('c3b'));
    L.title(t('c3btitle'), 10, 18, W - 20);
    const m = chart(ctx, L, { l: 36, r: W - 22, t: 34, b: H - 30, xMin: -0.4, xMax: 12.4, yMin: Y3.min, yMax: Y3.max, xTicks: [0, 3, 6, 8, 10, 12], yTicks: [2.6, 2.8, 3, 3.2, 3.4, 3.6], xFmt: i => String(M.N_LIST[i]), yFmt: v => fix(v, 1) });
    line(ctx, [[m.x(-0.4), m.y(Math.PI)], [m.x(12.4), m.y(Math.PI)]], C.text, 1.2, [6, 4]);
    L.put('π', m.x(12.4) - 2, m.y(Math.PI) - 5, { size: 13, weight: 700, cands: [[0, 0, 'right'], [0, 20, 'right']] });
    const pt = (i, v, col, big) => {
      const X = m.x(i);
      if (v > Y3.max) { ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(X, m.P.t - 2); ctx.lineTo(X - 5, m.P.t + 7); ctx.lineTo(X + 5, m.P.t + 7); ctx.closePath(); ctx.fill(); ctx.restore(); return; }
      dot(ctx, X, m.y(v), big ? 6 : 3.5, col, big);
    };
    for (const i of s3.hist) { const r = M.polyRatios(M.N_LIST[i]); pt(i, r.inner, C.cyan); pt(i, r.outer, C.orange); }
    pt(idx, q.inner, C.cyan, true); pt(idx, q.outer, C.orange, true);
  }
  $('out3').textContent = t('s3readout', { n, a: fix(q.inner, 4), b: fix(q.outer, 4), g: fix(q.gap, 4) }) + (q.outer > Y3.max ? ' ' + t('s3off', { b: fix(q.outer, 4) }) : '');
}

/* ---------- step 4: count squares ---------- */
const s4 = { hist: new Set([4]) };
function draw4() {
  const r = num('r4'), g = M.gridCells(r);
  $('r4v').textContent = String(r);
  {
    const { ctx, W, H, L } = fitCanvas($('c4'));
    L.title(t('c4title', { r }), 10, 18, W - 20);
    const top = 30, side = Math.min(W - 20, H - top - 10), u = side / (2 * r), cx = W / 2, cy = top + (H - top) / 2;
    for (const c of g.cells) {
      const X = cx + c.i * u, Y = cy - (c.j + 1) * u;
      if (c.state) { ctx.fillStyle = c.state === 2 ? 'rgba(126,226,168,.55)' : 'rgba(255,180,84,.55)'; ctx.fillRect(X, Y, u, u); }
    }
    ctx.save(); ctx.strokeStyle = '#2f4157'; ctx.lineWidth = u > 8 ? 1 : 0.6;
    for (let k = -r; k <= r; k++) { ctx.beginPath(); ctx.moveTo(cx + k * u, cy - r * u); ctx.lineTo(cx + k * u, cy + r * u); ctx.moveTo(cx - r * u, cy + k * u); ctx.lineTo(cx + r * u, cy + k * u); ctx.stroke(); }
    ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, r * u, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    line(ctx, [[cx, cy], [cx + r * u, cy], [cx + r * u, cy - r * u], [cx, cy - r * u], [cx, cy]], C.text, 2, [6, 4]);
    L.put('r × r', cx + r * u / 2, cy - r * u / 2 + 5, { size: 13, weight: 700, cands: [[0, 0, 'center']] });
  }
  {
    const { ctx, W, H, L } = fitCanvas($('c4b'));
    L.title(t('c4btitle'), 10, 18, W - 20);
    const m = chart(ctx, L, { l: 30, r: W - 22, t: 34, b: H - 30, xMin: 1, xMax: 21, yMin: 0.8, yMax: 4.2, xTicks: [2, 5, 10, 15, 20], yTicks: [1, 2, 3, 4] });
    line(ctx, [[m.x(1), m.y(Math.PI)], [m.x(21), m.y(Math.PI)]], C.text, 1.2, [6, 4]);
    L.put('π', m.x(21) - 2, m.y(Math.PI) - 5, { size: 13, weight: 700, cands: [[0, 0, 'right'], [0, 20, 'right']] });
    for (const rr of s4.hist) { const q = M.gridCells(rr); dot(ctx, m.x(rr), m.y(q.lo), 3.5, C.green); dot(ctx, m.x(rr), m.y(q.hi), 3.5, C.orange); }
    line(ctx, [[m.x(r), m.y(g.lo)], [m.x(r), m.y(g.hi)]], C.muted, 1.2);
    dot(ctx, m.x(r), m.y(g.lo), 6, C.green, true); dot(ctx, m.x(r), m.y(g.hi), 6, C.orange, true);
  }
  $('out4').textContent = t('s4readout', { r, i: g.inside, p: g.partial, o: g.touch, lo: fix(g.lo, 2), hi: fix(g.hi, 2), rr: r * r, A: fix(Math.PI * r * r, 2) });
}

/* ---------- step 5: peel the onion ---------- */
const s5 = { k: 6 };
const RING = ['#67d7f9', '#3f88b4'];
function draw5() {
  const n = num('n5'), r = M.R_ONION, st = M.strips(r, n), k = Math.min(s5.k, n);
  $('n5v').textContent = String(n);
  {
    const { ctx, W, H, L } = fitCanvas($('c5'));
    L.title(t('c5title', { n }), 10, 18, W - 20);
    const top = 28, R = (Math.min(W - 20, H - top - 8)) / 2, cx = W / 2, cy = top + (H - top) / 2;
    for (let q = n; q >= 1; q--) {                                  // ring q has outer radius q·r/n; peeled from the outside in
      const peeled = q > n - k;
      ctx.beginPath(); ctx.arc(cx, cy, R * q / n, 0, Math.PI * 2);
      ctx.globalAlpha = peeled ? 0.18 : 1; ctx.fillStyle = RING[q % 2]; ctx.fill(); ctx.globalAlpha = 1;
      ctx.strokeStyle = C.bg; ctx.lineWidth = 1; ctx.stroke();
    }
  }
  {
    const { ctx, W, H, L } = fitCanvas($('c5b'), w => 70 + M.R_ONION * (w - 30) / (2 * Math.PI * M.R_ONION));
    L.title(t('c5btitle'), 10, 18, W - 20);
    const s = Math.min((W - 30) / (2 * Math.PI * r), (H - 58) / r), x0 = 16, base = H - 26, dr = r / n;
    for (let j = 0; j < k; j++) {                                    // j = 0 is the outermost ring, at the bottom
      const q = n - j; ctx.fillStyle = RING[q % 2];
      ctx.fillRect(x0, base - (j + 1) * dr * s, st.list[j].len * s, dr * s);
    }
    line(ctx, [[x0, base], [x0 + 2 * Math.PI * r * s, base], [x0, base - r * s], [x0, base]], C.text, 1.6, [6, 4]);
    L.put('2πr', x0 + Math.PI * r * s, base + 16, { size: 12, cands: [[0, 0, 'center']] });
    L.put('r', x0 - 4, base - r * s / 2 + 4, { size: 12, cands: [[0, 0, 'right'], [8, -r * s / 2 - 4, 'left']] });
  }
  $('out5').textContent = t('s5readout', { k, n, S: fix(st.area, 2), b: fix(M.rimLength(2 * r), 2), h: r, T: fix(st.triangle, 2), E: fix(st.extra, 2) });
}

/* ---------- step 6: know one, find the rest ---------- */
const s6 = { kind: 'r' };
function draw6() {
  document.querySelectorAll('[data-kind]').forEach(b => b.setAttribute('aria-pressed', b.dataset.kind === s6.kind ? 'true' : 'false'));
  const v = Number($('v6').value);
  const { ctx, W, H, L } = fitCanvas($('c6'));
  L.title(t('c6title'), 10, 18, W - 20);
  if (!(v > 0) || !isFinite(v)) { $('out6').textContent = t('s6bad'); return; }
  const q = M.fromKnown(s6.kind, v), R = (H - 50) / 2, cx = W / 2, cy = 30 + (H - 30) / 2;
  ctx.save(); ctx.fillStyle = 'rgba(103,215,249,.10)'; ctx.strokeStyle = C.cyan; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore();
  line(ctx, [[cx - R, cy], [cx + R, cy]], C.orange, 2);
  line(ctx, [[cx, cy], [cx + R * Math.cos(-Math.PI / 3), cy + R * Math.sin(-Math.PI / 3)]], C.green, 2);
  dot(ctx, cx, cy, 3.5, C.text);
  L.put('r = ' + fmt(q.r, 2), cx + R * 0.32, cy - R * 0.5, { size: 12, color: C.green, cands: [[8, 0, 'left'], [8, -14, 'left']] });
  L.put('d = ' + fmt(q.d, 2), cx, cy + 18, { size: 12, color: C.orange, cands: [[0, 0, 'center'], [0, 14, 'center']] });
  L.put('C = ' + fmt(q.C, 2), cx + R + 8, cy + R * 0.7, { size: 12, color: C.cyan, cands: [[0, 0, 'left'], [-2 * R - 16, 0, 'right'], [-R - 8, R * 0.3 + 6, 'center']] });
  $('out6').textContent = t('s6readout', { r: fix(q.r, 2), d: fix(q.d, 2), C: fix(q.C, 2), A: fix(q.A, 2), ...(e => ({ r2: fix(e.r, 2), d2: fix(e.d, 2), C2: fix(e.C, 2), A2: fix(e.A, 2) }))(M.fromKnown(s6.kind, v, 3.14)) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); draw6(); }

function setup() {
  for (let a = 0; a <= num('th0'); a += 5) mark0(num('r0'), a);   // the first few footprints, up to the starting direction
  $('r0').addEventListener('input', () => { stopAnim('s0'); mark0(num('r0'), num('th0')); draw0(); });
  $('th0').addEventListener('input', () => { stopAnim('s0'); mark0(num('r0'), num('th0')); draw0(); });
  $('go0').addEventListener('click', () => {
    const r = num('r0'), start = num('th0');
    animate('s0', 3600, p => {
      const steps = Math.floor(p * 72);
      for (let q = 0; q <= steps; q++) mark0(r, start + 5 * q);
      $('th0').value = (start + 5 * Math.min(71, steps)) % 360; draw0();
    });
  });
  $('clr0').addEventListener('click', () => { stopAnim('s0'); s0.trails.clear(); mark0(num('r0'), num('th0')); draw0(); });

  s1.hist.add(num('p1'));
  $('r1').addEventListener('input', () => { s1.hist = new Set([num('p1')]); draw1(); });
  $('p1').addEventListener('input', () => { s1.hist.add(num('p1')); draw1(); });

  $('d2').addEventListener('input', () => { stopAnim('s2'); $('u2').value = 0; draw2(); });
  $('u2').addEventListener('input', () => { stopAnim('s2'); record2(); draw2(); });
  $('roll2').addEventListener('click', () => {
    animate('s2', 3000, p => { $('u2').value = (Math.round(p * 100) / 100).toFixed(2); if (p >= 1) record2(); draw2(); });
  });
  $('clr2').addEventListener('click', () => { s2.done = []; draw2(); });

  $('n3').addEventListener('input', () => { stopAnim('s3'); s3.hist.add(num('n3')); draw3(); });
  $('dbl3').addEventListener('click', () => {
    const seq = [6, 12, 24, 48, 96].map(n => M.N_LIST.indexOf(n));
    animate('s3', seq.length * 800, p => {
      const upto = Math.min(seq.length - 1, Math.floor(p * seq.length));
      for (let q = 0; q <= upto; q++) s3.hist.add(seq[q]);
      $('n3').value = seq[upto]; draw3();
    });
  });

  $('r4').addEventListener('input', () => { s4.hist.add(num('r4')); draw4(); });

  s5.k = num('n5');
  $('n5').addEventListener('input', () => { stopAnim('s5'); s5.k = num('n5'); draw5(); });
  $('peel5').addEventListener('click', () => {
    const n = num('n5');
    s5.k = 0; draw5();
    animate('s5', Math.min(4500, 450 * n), p => { s5.k = Math.min(n, Math.floor(p * (n + 1))); draw5(); });
  });

  document.querySelectorAll('[data-kind]').forEach(b => b.addEventListener('click', () => { s6.kind = b.dataset.kind; draw6(); }));
  $('v6').addEventListener('input', draw6);

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
  window.refreshLesson = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
