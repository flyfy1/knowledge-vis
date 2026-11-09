'use strict';
// Inequalities lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every truth value, bound and count comes from window.INEQ_MODEL (model.js). All canvas text goes through
// Labels, which keeps each label inside the canvas and skips a label rather than letting it overlap another.
(function () {

const $ = id => document.getElementById(id);
const M = window.INEQ_MODEL;
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


/* ---------- number-line helpers ---------- */
const MINUS = '−';
const sgn = s => String(s).replace(/^-/, MINUS);                       // typographic minus
const num1 = (v, d = 2) => sgn(fmt(v, d));
const par = v => (v < 0 ? '(' + num1(v) + ')' : num1(v));
function niceStep(span, px, minPx) { for (const s of [0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20]) if (s / span * px >= minPx) return s; return 50; }
// A horizontal number line. o: l, r, y, min, max, labels: 'below' | 'above', minPx (label spacing)
function numLine(ctx, L, o) {
  const x = v => o.l + (v - o.min) / (o.max - o.min) * (o.r - o.l);
  line(ctx, [[o.l - 6, o.y], [o.r + 6, o.y]], C.axis, 1.6);
  const tick = o.tick || niceStep(o.max - o.min, o.r - o.l, 9), lab = o.lab || niceStep(o.max - o.min, o.r - o.l, o.minPx || 30);
  const digits = Math.max(0, -Math.floor(Math.log10(lab) + 1e-9));
  for (let k = Math.ceil(o.min / tick - 1e-9); k * tick <= o.max + 1e-9; k++) {
    const v = k * tick, major = Math.abs(v / lab - Math.round(v / lab)) < 1e-6;
    line(ctx, [[x(v), o.y - (major ? 5 : 3)], [x(v), o.y + (major ? 5 : 3)]], major ? C.muted : C.axis, 1);
    if (major && !o.noLabels) L.put(sgn(fix(v, digits)), x(v), o.labels === 'above' ? o.y - 10 : o.y + 19, { size: 11, color: C.muted, cands: [[0, 0, 'center']] });
  }
  return x;
}
// Solution shading along a number line between u0 and u1 (clipped to the visible range); arrow if it runs off.
function shade(ctx, x, o, u0, u1, color) {
  const a = Math.max(o.min, u0), b = Math.min(o.max, u1);
  if (b < a) return;
  ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = 0.75; ctx.lineWidth = 7; ctx.lineCap = 'butt';
  ctx.beginPath(); ctx.moveTo(x(a), o.y); ctx.lineTo(x(b), o.y); ctx.stroke();
  ctx.fillStyle = color; ctx.globalAlpha = 0.9;
  if (u1 > o.max) { ctx.beginPath(); ctx.moveTo(x(o.max) + 10, o.y); ctx.lineTo(x(o.max) - 1, o.y - 7); ctx.lineTo(x(o.max) - 1, o.y + 7); ctx.fill(); }
  if (u0 < o.min) { ctx.beginPath(); ctx.moveTo(x(o.min) - 10, o.y); ctx.lineTo(x(o.min) + 1, o.y - 7); ctx.lineTo(x(o.min) + 1, o.y + 7); ctx.fill(); }
  ctx.restore();
}
function endDot(ctx, X, Y, closed, color) {
  ctx.save(); ctx.beginPath(); ctx.arc(X, Y, 6.5, 0, Math.PI * 2);
  ctx.fillStyle = closed ? color : C.bg; ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth = 2.4; ctx.stroke(); ctx.restore();
}
const leftSide = op => op === '<' || op === '≤';

/* ---------- step 0: the suitcase ---------- */
const s0 = { tried: new Map() };
function try0(x) { s0.tried.set(x, M.luggageOk(x)); }
function draw0() {
  const x = num('x0'), s = M.BASE + x, ok = M.luggageOk(x);
  $('x0v').textContent = fmt(x, 1);
  const { ctx, W, H, L } = fitCanvas($('c0'));
  L.title(t('c0top'), 10, 18, W - 20);
  const l = 20, r = W - 24, kg = v => l + v / 15 * (r - l), y0 = 44, y1 = 72;
  ctx.fillStyle = '#1a2636'; ctx.fillRect(l, y0, r - l, y1 - y0);
  ctx.fillStyle = C.raw; ctx.fillRect(kg(0), y0, kg(M.BASE) - kg(0), y1 - y0);
  ctx.fillStyle = ok ? C.cyan : C.pink; ctx.fillRect(kg(M.BASE), y0, kg(s) - kg(M.BASE), y1 - y0);
  line(ctx, [[kg(M.LIMIT), y0 - 6], [kg(M.LIMIT), y1 + 6]], C.orange, 3);
  for (const v of [0, 5, 10, 15]) L.put(v + ' kg', kg(v), y1 + 20, { size: 11, color: v === 10 ? C.orange : C.muted, cands: [[0, 0, 'center']] });
  L.put('3', kg(M.BASE / 2), y0 + 19, { size: 12, weight: 700, color: C.text, cands: [[0, 0, 'center']] });
  if (x >= 1) L.put('x', kg(M.BASE + x / 2), y0 + 19, { size: 12, weight: 700, color: '#061118', halo: false, cands: [[0, 0, 'center']] });
  L.title(t('c0bot'), 10, 128, W - 20);
  const o = { l: 20, r: W - 24, y: 192, min: 0, max: 12 };
  const X = numLine(ctx, L, { ...o, tick: 0.5, lab: (o.r - o.l) / 12 >= 30 ? 1 : 2 });
  for (const [v, good] of s0.tried) dot(ctx, X(v), o.y - 16, 4.5, good ? C.green : C.pink);
  ctx.save(); ctx.fillStyle = C.text; ctx.beginPath(); ctx.moveTo(X(x), o.y - 6); ctx.lineTo(X(x) - 6, o.y - 30); ctx.lineTo(X(x) + 6, o.y - 30); ctx.closePath(); ctx.globalAlpha = 0.35; ctx.fill(); ctx.restore();
  const k = s0.tried.size, g = [...s0.tried.values()].filter(Boolean).length;
  let txt = t('s0readout', { x: fmt(x, 1), s: fmt(s, 1), rel: M.rel(s, M.LIMIT) === '>' ? '>' : M.rel(s, M.LIMIT), verdict: t(ok ? 'yes' : 'no'), k, g, r: k - g });
  if (k === 25) txt += ' ' + t('s0all', { m: fmt(Math.max(...[...s0.tried].filter(e => e[1]).map(e => e[0])), 1) });
  $('out0').textContent = txt;
}

/* ---------- step 1: end points and zoom ---------- */
const s1 = { op: '<' };
function draw1() {
  document.querySelectorAll('[data-op1]').forEach(b => b.setAttribute('aria-pressed', b.dataset.op1 === s1.op ? 'true' : 'false'));
  const a = num('a1'), zk = num('z1'), z = Math.pow(10, zk), op = s1.op, closed = !M.strict(op), left = leftSide(op);
  $('a1v').textContent = num1(a, 1); $('z1v').textContent = z + '×';
  const { ctx, W, H, L } = fitCanvas($('c1'));
  L.title(t('c1top', { op, a: num1(a, 1) }), 10, 18, W - 20);
  const o = { l: 22, r: W - 26, y: 62, min: -8, max: 8 };
  const X = numLine(ctx, L, o);
  shade(ctx, X, o, left ? -Infinity : a, left ? a : Infinity, C.green);
  endDot(ctx, X(a), o.y, closed, C.text);
  // zoomed window: a ± 5 ticks of 1/z
  L.title(t('c1bot', { z }), 10, 120, W - 20);
  const h = 5 / z, oz = { l: 22, r: W - 26, y: 176, min: a - h, max: a + h };
  const Xz = numLine(ctx, L, { ...oz, tick: 1 / z, lab: 1 / z * 5, noLabels: true });
  shade(ctx, Xz, oz, left ? -Infinity : a, left ? a : Infinity, C.green);
  const p = M.probe(a, op, z), d = zk;
  L.put(sgn(fix(a, d)), Xz(a), oz.y + 22, { size: 12, weight: 700, cands: [[0, 0, 'center']] });
  for (const v of [a - h, a + h]) L.put(sgn(fix(v, d)), Xz(v), oz.y + 22, { size: 11, color: C.muted, cands: [[0, 0, 'center']] });
  dot(ctx, Xz(p), oz.y, 4.5, C.green);
  L.put(sgn(fix(p, d)), Xz(p), oz.y - 14, { size: 12, color: C.green, cands: [[0, 0, 'center'], [0, -14, 'center']] });
  endDot(ctx, Xz(a), oz.y, closed, C.text);
  const P = { a: num1(a, 1), op, z, p: sgn(fix(p, d)), is: t(closed ? 'isYes' : 'isNo'), shape: t(closed ? 'solid' : 'hollow'), p2: sgn(fix(M.probe(a, op, 10 * z), d + 1)) };
  $('out1').textContent = t('s1readout', P) + ' ' + t(closed ? (left ? 's1hasMax' : 's1hasMin') : (left ? 's1noMax' : 's1noMin'), P);
}

/* ---------- step 2 / 3: two parallel number lines with links ---------- */
function linkPair(ctx, L, W, o, before, after, trail) {
  const top = { l: 22, r: W - 26, y: o.yTop, min: o.min, max: o.max, labels: 'above' }, bot = { l: 22, r: W - 26, y: o.yBot, min: o.min, max: o.max };
  const X = numLine(ctx, L, top); numLine(ctx, L, bot);
  for (const [pp, qq] of trail) { dot(ctx, X(pp), bot.y, 3, C.raw); dot(ctx, X(qq), bot.y, 3, C.raw); }
  const cols = [C.violet, C.cyan];
  before.forEach((v, i) => line(ctx, [[X(v), top.y + 7], [X(after[i]), bot.y - 7]], cols[i], 2, [5, 4]));
  before.forEach((v, i) => dot(ctx, X(v), top.y, 6, cols[i]));
  after.forEach((v, i) => dot(ctx, X(v), bot.y, 6, cols[i]));
}
const s2 = { trail: new Set([3]) };
function draw2() {
  const c = num('c2s'), q = M.shifted(M.P2, M.Q2, c);
  $('c2v').textContent = num1(c, 1);
  const { ctx, W, H, L } = fitCanvas($('c2'));
  L.title(t('c2top'), 10, 18, W - 20);
  L.title(t('c2bot', { c: num1(c, 1) }), 10, H - 8, W - 20);
  const trail = [...s2.trail].filter(v => v !== c).map(v => [M.P2 + v, M.Q2 + v]);
  linkPair(ctx, L, W, { yTop: 64, yBot: 150, min: -5, max: 12 }, [M.P2, M.Q2], [q.p, q.q], trail);
  $('out2').textContent = t('s2readout', { cp: par(c), p: num1(q.p, 1), q: num1(q.q, 1), rel: q.rel, gap: fmt(q.gap, 1) });
}
const s3 = { hist: new Set([2]) };
function draw3() {
  const m = num('m3'), q = M.scaled(M.P, M.Q, m);
  $('m3v').textContent = num1(m, 2);
  {
    const { ctx, W, H, L } = fitCanvas($('c3'));
    L.title(t('c3top'), 10, 18, W - 20);
    L.title(t('c3bot', { m: num1(m, 2) }), 10, H - 8, W - 20);
    linkPair(ctx, L, W, { yTop: 64, yBot: H - 62, min: -7, max: 7 }, [M.P, M.Q], [q.p, q.q], []);
  }
  {
    const { ctx, W, H, L } = fitCanvas($('c3b'));
    L.title(t('c3chart'), 10, 18, W - 20);
    const g = chart(ctx, L, { l: 32, r: W - 22, t: 34, b: H - 30, xMin: -3, xMax: 3, yMin: -9.5, yMax: 9.5, xTicks: [-3, -2, -1, 0, 1, 2, 3], yTicks: [-9, -6, -3, 0, 3, 6, 9], xFmt: v => sgn(v), yFmt: v => sgn(v) });
    ctx.save(); ctx.globalAlpha = 0.08; ctx.fillStyle = C.green; ctx.fillRect(g.P.l, g.P.t, g.P.r - g.P.l, g.y(0) - g.P.t); ctx.fillStyle = C.pink; ctx.fillRect(g.P.l, g.y(0), g.P.r - g.P.l, g.P.b - g.y(0)); ctx.restore();
    line(ctx, [[g.P.l, g.y(0)], [g.P.r, g.y(0)]], C.muted, 1.2);
    for (const v of s3.hist) { const d = M.scaled(M.P, M.Q, v).gap; dot(ctx, g.x(v), g.y(d), 3.5, d > 1e-9 ? C.green : d < -1e-9 ? C.pink : C.text); }
    dot(ctx, g.x(m), g.y(q.gap), 6.5, q.gap > 1e-9 ? C.green : q.gap < -1e-9 ? C.pink : C.text, true);
  }
  $('out3').textContent = t('s3readout', { mp: par(m), p: num1(q.p, 2), q: num1(q.q, 2), rel: q.rel }) + ' ' + t(m > 0 ? 's3keep' : m < 0 ? 's3flip' : 's3zero');
}

/* ---------- step 4: solve a·x + b ? c ---------- */
const s4 = { op: '<' };
function term(a) { if (a === 0) return '0'; if (a === 1) return 'x'; if (a === -1) return MINUS + 'x'; return num1(a, 1) + 'x'; }
function lhsText(a, b) { if (a === 0) return num1(b); const tx = term(a); return b === 0 ? tx : tx + (b > 0 ? ' + ' : ' ' + MINUS + ' ') + fmt(Math.abs(b)); }
function boundText(f) { return f.den === 1 ? sgn(f.num) : sgn(f.num) + '/' + f.den + ' (≈ ' + num1(f.value, 2) + ')'; }
function draw4() {
  document.querySelectorAll('[data-op4]').forEach(b => b.setAttribute('aria-pressed', b.dataset.op4 === s4.op ? 'true' : 'false'));
  const a = num('a4'), b = num('b4'), c = num('c4s'), x0 = num('x4'), op = s4.op, sol = M.solve(a, b, op, c);
  $('a4v').textContent = num1(a, 1); $('b4v').textContent = num1(b); $('c4v').textContent = num1(c); $('x4v').textContent = num1(x0, 1);
  const lhs = lhsText(a, b), good = u => M.holds(a * u + b, op, c);
  {
    const { ctx, W, H, L } = fitCanvas($('c4'));
    L.title(t('c4top', { lhs, c: num1(c) }), 10, 18, W - 20);
    const g = chart(ctx, L, { l: 32, r: W - 22, t: 34, b: H - 30, xMin: -8, xMax: 8, yMin: -12, yMax: 12, xTicks: [-8, -4, 0, 4, 8], yTicks: [-10, -5, 0, 5, 10], xFmt: v => sgn(v), yFmt: v => sgn(v) });
    line(ctx, [[g.x(0), g.P.t], [g.x(0), g.P.b]], C.axis, 1); line(ctx, [[g.P.l, g.y(0)], [g.P.r, g.y(0)]], C.axis, 1);
    ctx.save(); ctx.beginPath(); ctx.rect(g.P.l, g.P.t, g.P.r - g.P.l, g.P.b - g.P.t); ctx.clip();
    line(ctx, [[g.x(-8), g.y(c)], [g.x(8), g.y(c)]], C.orange, 1.8, [7, 5]);
    line(ctx, [[g.x(-8), g.y(-8 * a + b)], [g.x(8), g.y(8 * a + b)]], C.cyan, 2.2);
    // the part of the line that satisfies the inequality, and its shadow on the x-axis
    let run = null; const runs = [];
    for (let u = -8; u <= 8.0001; u += 0.02) { if (good(u)) { if (!run) run = [u, u]; run[1] = u; } else if (run) { runs.push(run); run = null; } }
    if (run) runs.push(run);
    for (const [u0, u1] of runs) {
      line(ctx, [[g.x(u0), g.y(a * u0 + b)], [g.x(u1), g.y(a * u1 + b)]], C.green, 5);
      ctx.save(); ctx.globalAlpha = 0.18; ctx.fillStyle = C.green; ctx.fillRect(g.x(u0), g.P.t, g.x(u1) - g.x(u0), g.P.b - g.P.t); ctx.restore();
    }
    const yv = a * x0 + b;
    line(ctx, [[g.x(x0), g.y(Math.max(-12, Math.min(12, yv)))], [g.x(x0), g.P.b]], C.violet, 1.4, [3, 3]);
    dot(ctx, g.x(x0), g.y(Math.max(-12, Math.min(12, yv))), 5.5, C.violet);
    ctx.restore();
  }
  {
    const { ctx, W, H, L } = fitCanvas($('c4b'));
    L.title(t('c4bot'), 10, 18, W - 20);
    const o = { l: 22, r: W - 26, y: 60, min: -8, max: 8 };
    const X = numLine(ctx, L, o);
    if (sol.type === 'all') shade(ctx, X, o, -Infinity, Infinity, C.green);
    if (sol.type === 'ray') {
      const left = leftSide(sol.op2);
      shade(ctx, X, o, left ? -Infinity : sol.bound, left ? sol.bound : Infinity, C.green);
      if (sol.bound >= o.min && sol.bound <= o.max) endDot(ctx, X(sol.bound), o.y, sol.closed, C.text);
    }
    ctx.save(); ctx.fillStyle = C.violet; ctx.beginPath(); ctx.moveTo(X(x0), o.y - 9); ctx.lineTo(X(x0) - 6, o.y - 21); ctx.lineTo(X(x0) + 6, o.y - 21); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  const P = { lhs, op, c: num1(c), b: num1(b), bp: par(b), ax: term(a), r: num1(c - b), a: num1(a, 1) };
  let rows;
  if (sol.type === 'ray') rows = [t('s4L1', P), t('s4L2', P), t(sol.flipped ? 's4L3neg' : 's4L3pos', { ...P, op2: sol.op2, bound: boundText(sol.frac) })];
  else rows = [t('s4L1', P), t(sol.type === 'all' ? 's4zeroAll' : 's4zeroNone', P)];
  $('ledger4').innerHTML = rows.map((s, i) => `<p${i === rows.length - 1 ? ' class="em"' : ''}>${s}</p>`).join('');
  const v = a * x0 + b, tf = M.holds(v, op, c), inside = M.inSolution(sol, x0);
  $('out4').textContent = t('s4test', { x: num1(x0, 1), lhsx: `${num1(a, 1)} × ${par(x0)} ${b < 0 ? MINUS : '+'} ${fmt(Math.abs(b))}`, v: num1(v, 2), op, c: num1(c), tf: t(tf ? 'yes' : 'no'), io: t(inside ? 'inYes' : 'inNo') });
}

/* ---------- step 5: whole-number budget ---------- */
function draw5() {
  const Mb = num('M5'), p = num('p5'), s = num('s5'), q = M.budget(Mb, p, s);
  $('M5v').textContent = String(Mb); $('p5v').textContent = String(p); $('s5v').textContent = String(s);
  {
    const { ctx, W, H, L } = fitCanvas($('c5'));
    L.title(t('c5top'), 10, 18, W - 20);
    const top = Math.max(Mb, s) + p + 4, l = 20, r = W - 24, X = v => l + v / top * (r - l), y0 = 40, y1 = 66;
    ctx.fillStyle = '#1a2636'; ctx.fillRect(l, y0, r - l, y1 - y0);
    ctx.fillStyle = C.raw; ctx.fillRect(X(0), y0, X(s) - X(0), y1 - y0);
    const n = Math.max(0, q.n);
    for (let i = 0; i < n; i++) { ctx.fillStyle = i % 2 ? '#4bb4d6' : C.cyan; ctx.fillRect(X(s + p * i), y0, X(s + p * (i + 1)) - X(s + p * i), y1 - y0); }
    ctx.save(); ctx.strokeStyle = C.pink; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.5; ctx.strokeRect(X(s + p * n), y0 + 2, X(s + p * (n + 1)) - X(s + p * n), y1 - y0 - 4); ctx.restore();
    line(ctx, [[X(Mb), y0 - 6], [X(Mb), y1 + 6]], C.orange, 3);
    L.put('M = ' + Mb, X(Mb), y1 + 22, { size: 12, color: C.orange, cands: [[0, 0, 'center'], [0, 0, 'right'], [0, 0, 'left']] });
    L.put('0', X(0), y1 + 22, { size: 11, color: C.muted, cands: [[0, 0, 'left']] });
    if (q.n >= 0) L.put(String(q.cost), X(q.cost), y0 - 8, { size: 11, color: C.cyan, cands: [[0, 0, 'center'], [0, 0, 'right']] });
  }
  {
    const { ctx, W, H, L } = fitCanvas($('c5b'));
    L.title(t('c5bot'), 10, 18, W - 20);
    const o = { l: 22, r: W - 26, y: 70, min: 0, max: 34 };
    const X = numLine(ctx, L, { ...o, tick: 1, lab: (o.r - o.l) / 34 * 5 >= 30 ? 5 : 10 });
    if (q.bound >= 0) { shade(ctx, X, o, 0, q.bound, C.green); endDot(ctx, X(q.bound), o.y, true, C.text); }
    for (let k = 0; k <= 34; k++) dot(ctx, X(k), o.y - 16, 3.2, k <= q.bound + 1e-9 ? C.green : C.pink);
  }
  if (q.n < 0) { $('out5').textContent = t('s5none', { M: Mb, s }); return; }
  let txt = t('s5readout', { p, s, M: Mb, b: fmt(q.bound, 2), n: q.n, cost: q.cost, left: q.left });
  const rn = Math.round(q.bound);
  if (rn > q.n) txt += ' ' + t('s5round', { b: fmt(q.bound, 2), r: rn, rc: s + p * rn });
  $('out5').textContent = txt;
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  try0(num('x0'));
  $('x0').addEventListener('input', () => { stopAnim('s0'); try0(num('x0')); draw0(); });
  $('try0').addEventListener('click', () => animate('s0', 5000, p => {
    const upto = Math.min(24, Math.floor(p * 25));
    for (let k = 0; k <= upto; k++) try0(k / 2);
    $('x0').value = upto / 2; draw0();
  }));
  $('clr0').addEventListener('click', () => { stopAnim('s0'); s0.tried.clear(); try0(num('x0')); draw0(); });

  document.querySelectorAll('[data-op1]').forEach(b => b.addEventListener('click', () => { s1.op = b.dataset.op1; draw1(); }));
  ['a1', 'z1'].forEach(id => $(id).addEventListener('input', draw1));

  $('c2s').addEventListener('input', () => { s2.trail.add(num('c2s')); draw2(); });
  $('m3').addEventListener('input', () => { s3.hist.add(num('m3')); draw3(); });

  document.querySelectorAll('[data-op4]').forEach(b => b.addEventListener('click', () => { s4.op = b.dataset.op4; draw4(); }));
  ['a4', 'b4', 'c4s', 'x4'].forEach(id => $(id).addEventListener('input', draw4));
  ['M5', 'p5', 's5'].forEach(id => $(id).addEventListener('input', draw5));

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
