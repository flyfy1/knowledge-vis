'use strict';
// Clock-hands lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every angle, time and count comes from window.CLOCK_MODEL (model.js). All canvas text goes through
// Labels, which keeps each label inside the canvas and skips a label rather than letting it overlap another.
(function () {

const $ = id => document.getElementById(id);
const M = window.CLOCK_MODEL;
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


/* ---------- clock drawing (angles in degrees, clockwise from the 12) ---------- */
const RAD = d => d * Math.PI / 180;
const onDial = (cx, cy, r, a) => [cx + r * Math.sin(RAD(a)), cy - r * Math.cos(RAD(a))];
const cAng = a => RAD(a - 90);                          // clock angle → canvas arc angle
function face(ctx, L, cx, cy, R) {
  ctx.save();
  ctx.fillStyle = '#111c28'; ctx.strokeStyle = '#3b4f68'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  for (let i = 0; i < 60; i++) {
    const big = i % 5 === 0, [x0, y0] = onDial(cx, cy, R * (big ? 0.88 : 0.93), i * 6), [x1, y1] = onDial(cx, cy, R * 0.98, i * 6);
    ctx.strokeStyle = big ? '#8fa3ba' : '#4a5f78'; ctx.lineWidth = big ? 2 : 1;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  }
  ctx.restore();
  const size = Math.max(9, Math.min(14, R * 0.14));
  for (let n = 1; n <= 12; n++) { const [x, y] = onDial(cx, cy, R * 0.74, n * 30); L.put(String(n), x, y + size * 0.36, { size, color: C.muted, cands: [[0, 0, 'center']], halo: false }); }
}
function hand(ctx, cx, cy, len, a, color, w) {
  const [x, y] = onDial(cx, cy, len, a);
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke(); ctx.restore();
}
function hands(ctx, cx, cy, R, hA, mA) {
  hand(ctx, cx, cy, R * 0.5, hA, C.orange, 6); hand(ctx, cx, cy, R * 0.8, mA, C.cyan, 3.5);
  dot(ctx, cx, cy, 4.5, C.text);
}
// Wedge from clock angle a0 clockwise by `span` degrees.
function wedge(ctx, cx, cy, r, a0, span, fill) {
  ctx.save(); ctx.fillStyle = fill; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, cAng(a0), cAng(a0 + span)); ctx.closePath(); ctx.fill(); ctx.restore();
}
// The smaller angle between two hands as a wedge; returns the clock angle of its middle.
function smallWedge(ctx, cx, cy, r, hA, mA, fill) {
  const d = M.mod(mA - hA, 360);
  if (d <= 180) { wedge(ctx, cx, cy, r, hA, d, fill); return hA + d / 2; }
  wedge(ctx, cx, cy, r, mA, 360 - d, fill); return mA + (360 - d) / 2;
}
function arcLine(ctx, cx, cy, r, a0, span, color, lw) {
  if (span <= 0) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(cx, cy, r, cAng(a0), cAng(a0 + Math.min(span, 359.999))); ctx.stroke(); ctx.restore();
}
// Label for an angle wedge: try along the bisector at a few radii, then the opposite side.
// A narrow wedge (span < 24°) has no room inside, so its label sits beside the hands instead.
function angleLabel(L, cx, cy, R, mid, text, color, span) {
  const cands = [], dirs = span < 24 ? [mid + 32, mid - 32] : [mid];
  for (const d of dirs) for (const k of [0.36, 0.28, 0.46, 0.2]) { const [x, y] = onDial(cx, cy, R * k, d); cands.push([x - cx, y - cy + 5, 'center']); }
  for (const k of [0.3, 0.42]) { const [x, y] = onDial(cx, cy, R * k, mid + 180); cands.push([x - cx, y - cy + 5, 'center']); }
  return L.put(text, cx, cy, { size: 14, weight: 700, color, cands });
}
const hourTicks = { xTicks: [0, 120, 240, 360, 480, 600, 720], xFmt: v => String(v % 720 === 0 ? 12 : v / 60) };

/* ---------- step 0: how fast each hand turns ---------- */
function draw0() {
  const tt = num('t0'), turned = M.turned(tt);
  $('t0v').textContent = String(tt);
  {
    const { ctx, W, H, L } = fitCanvas($('c0'));
    L.title(M.clock(tt), 10, 18, W - 20);
    const R = Math.min(W - 44, H - 56) / 2 - 6, cx = W / 2, cy = 30 + (H - 30) / 2;
    face(ctx, L, cx, cy, R);
    for (let i = 0; 360 * i < turned.minute; i++) arcLine(ctx, cx, cy, R + 6 + 6 * i, 0, turned.minute - 360 * i, C.cyan, 3);
    arcLine(ctx, cx, cy, R * 0.4, 0, turned.hour, C.orange, 4);
    hands(ctx, cx, cy, R, M.hourAngle(tt), M.minuteAngle(tt));
  }
  {
    const { ctx, W, H, L } = fitCanvas($('c0b'));
    L.title(t('c0btitle'), 10, 18, W - 20);
    const m = chart(ctx, L, { l: 40, r: W - 22, t: 34, b: H - 30, xMin: 0, xMax: 120, yMin: 0, yMax: 760, xTicks: [0, 30, 60, 90, 120], yTicks: [0, 180, 360, 540, 720], yFmt: v => v + '°' });
    line(ctx, [[m.x(0), m.y(0)], [m.x(tt), m.y(turned.minute)]], C.cyan, 3);
    line(ctx, [[m.x(0), m.y(0)], [m.x(tt), m.y(turned.hour)]], C.orange, 3);
    dot(ctx, m.x(tt), m.y(turned.minute), 5, C.cyan); dot(ctx, m.x(tt), m.y(turned.hour), 5, C.orange);
  }
  const laps = Math.floor(turned.minute / 360 + 1e-9);
  $('out0').textContent = t('s0readout', { t: tt, clock: M.clock(tt), m: fmt(turned.minute, 1), laps, rest: fmt(turned.minute - 360 * laps, 1), h: fmt(turned.hour, 1) });
}

/* ---------- step 1: read the angle ---------- */
function draw1() {
  const h = num('h1'), mi = num('m1'), tt = M.timeOf(h, mi), q = M.ledger(h, mi);
  $('h1v').textContent = String(h); $('m1v').textContent = String(mi);
  const { ctx, W, H, L } = fitCanvas($('c1'));
  L.title(M.clock(tt), 10, 18, W - 20);
  const R = Math.min(W - 30, H - 44) / 2 - 2, cx = W / 2, cy = 30 + (H - 30) / 2;
  face(ctx, L, cx, cy, R);
  const mid = smallWedge(ctx, cx, cy, R * 0.62, M.hourAngle(tt), M.minuteAngle(tt), 'rgba(183,156,255,.38)');
  arcLine(ctx, cx, cy, R * 0.56, 30 * (h % 12), q.extra, C.pink, 4);
  hands(ctx, cx, cy, R, M.hourAngle(tt), M.minuteAngle(tt));
  angleLabel(L, cx, cy, R, mid, fmt(q.A, 1) + '°', C.violet, q.A);
  const hh = h % 12, P = { h: hh, m: mi, H: fmt(q.H, 1), M: fmt(q.M, 1), D: fmt(q.D, 1), A: fmt(q.A, 1), x: fmt(q.extra, 1) };
  $('ledger1').innerHTML = [t('ledgerH', P) + (h === 12 ? t('noon') : ''), t('ledgerM', P), t(q.D <= 180 ? 'ledgerSmall' : 'ledgerBig', P)].map((s, i) => `<p${i === 2 ? ' class="em"' : ''}>${s}</p>`).join('');
  const D0 = Math.abs(30 * hh - 6 * mi), wrong = Math.min(D0, 360 - D0), e = Math.abs(wrong - q.A);
  $('out1').textContent = t('s1readout', { clock: M.clock(tt), A: fmt(q.A, 1) }) + (e > 1e-9 ? ' ' + t('s1trap', { x: fmt(q.extra, 1), wrong: fmt(wrong, 1), e: fmt(e, 1) }) : '');
}

/* ---------- step 2: the angle over twelve hours ---------- */
const s2 = { max: 0 };
const RIGHT = M.solutions(90);
function draw2() {
  const tt = num('t2'); s2.max = Math.max(s2.max, tt);
  $('t2v').textContent = String(tt);
  {
    const { ctx, W, H, L } = fitCanvas($('c2'));
    L.title(M.clock(tt, true), 10, 18, W - 20);
    const R = Math.min(W - 30, H - 44) / 2 - 2, cx = W / 2, cy = 30 + (H - 30) / 2;
    face(ctx, L, cx, cy, R);
    const mid = smallWedge(ctx, cx, cy, R * 0.62, M.hourAngle(tt), M.minuteAngle(tt), 'rgba(103,215,249,.28)');
    hands(ctx, cx, cy, R, M.hourAngle(tt), M.minuteAngle(tt));
    angleLabel(L, cx, cy, R, mid, fmt(M.between(tt), 1) + '°', C.cyan, M.between(tt));
  }
  {
    const { ctx, W, H, L } = fitCanvas($('c2b'));
    L.title(t('c2btitle'), 10, 18, W - 20);
    const m = chart(ctx, L, { l: 40, r: W - 22, t: 34, b: H - 30, xMin: 0, xMax: 720, yMin: 0, yMax: 360, yTicks: [0, 90, 180, 270, 360], yFmt: v => v + '°', ...hourTicks });
    const lead = [], ang = [];
    for (let u = 0; u <= s2.max + 1e-9; u += 0.5) {
      const l = M.lead(u);
      if (lead.length && l < M.lead(u - 0.5)) { line(ctx, lead.splice(0), C.raw, 1.6); }
      lead.push([m.x(u), m.y(l)]); ang.push([m.x(u), m.y(M.between(u))]);
    }
    if (lead.length > 1) line(ctx, lead, C.raw, 1.6);
    if (ang.length > 1) line(ctx, ang, C.cyan, 2.4);
    for (const s of M.MEETINGS) if (s <= s2.max + 1e-9) dot(ctx, m.x(s), m.y(0), 4, C.text);
    for (const s of RIGHT) if (s <= s2.max + 1e-9) dot(ctx, m.x(s), m.y(90), 3.5, C.orange);
    line(ctx, [[m.x(tt), m.P.t], [m.x(tt), m.P.b]], C.text, 1, [4, 4]);
  }
  $('out2').textContent = t('s2readout', { clock: M.clock(tt, true), L: fmt(M.lead(tt), 1), A: fmt(M.between(tt), 1), c: M.countUpTo(M.MEETINGS, tt), r: M.countUpTo(RIGHT, tt) });
}

/* ---------- step 3: when the hands meet ---------- */
const s3 = { t: M.meeting(1), playing: false };
function draw3() {
  const k = num('k3'), tt = s3.t;
  $('k3v').textContent = String(k);
  {
    const { ctx, W, H, L } = fitCanvas($('c3'));
    L.title(M.clock(tt, true), 10, 18, W - 20);
    const R = Math.min(W - 30, H - 44) / 2 - 2, cx = W / 2, cy = 30 + (H - 30) / 2;
    face(ctx, L, cx, cy, R);
    hands(ctx, cx, cy, R, M.hourAngle(tt), M.minuteAngle(tt));
  }
  {
    const { ctx, W, H, L } = fitCanvas($('c3b'));
    L.title(t('c3btitle'), 10, 18, W - 20);
    const ticks = [0, 2, 4, 6, 8, 10].map(n => 360 * n);
    const m = chart(ctx, L, { l: 58, r: W - 22, t: 34, b: H - 30, xMin: 0, xMax: 720, yMin: 0, yMax: 4000, yTicks: ticks, yFmt: v => t('lapTick', { n: v / 360 }), ...hourTicks });
    ctx.save(); ctx.strokeStyle = '#2a3a4e'; ctx.setLineDash([3, 4]);
    for (let n = 1; n <= 11; n += 2) { ctx.beginPath(); ctx.moveTo(m.P.l, m.y(360 * n)); ctx.lineTo(m.P.r, m.y(360 * n)); ctx.stroke(); }
    ctx.restore();
    line(ctx, [[m.x(0), m.y(0)], [m.x(tt), m.y(M.GAIN * tt)]], C.violet, 2.6);
    for (let j = 0; j <= 11; j++) if (M.meeting(j) <= tt + 1e-9) dot(ctx, m.x(M.meeting(j)), m.y(360 * j), j === k && !s3.playing ? 6 : 4, C.text, j === k && !s3.playing);
  }
  const passed = M.MEETINGS.filter(s => s <= tt + 1e-9).length + (tt >= 720 - 1e-9 ? 1 : 0);
  $('out3').textContent = s3.playing ? t('s3play', { clock: M.clock(tt, true), c: passed })
    : t('s3readout', { k, g: 360 * k, mx: M.mixed11(k).text, clock: M.clock(M.meeting(k), true) }) + (k === 11 ? ' ' + t('s3full') : '');
}

/* ---------- step 4: work backwards from an angle ---------- */
function draw4() {
  const th = num('th4'), h = num('h4'), sol = M.solutions(th), mine = M.inHour(sol, h);
  $('th4v').textContent = th + '°'; $('h4v').textContent = t('hourName', { a: h === 0 ? 12 : h, b: h + 1 });
  {
    const { ctx, W, H, L } = fitCanvas($('c4'));
    const tt = mine.length ? mine[0] : h * 60;
    L.title(mine.length ? M.clock(tt, true) : t('none'), 10, 18, W - 20);
    const R = Math.min(W - 30, H - 44) / 2 - 2, cx = W / 2, cy = 30 + (H - 30) / 2;
    face(ctx, L, cx, cy, R);
    if (mine.length) {
      const mid = smallWedge(ctx, cx, cy, R * 0.62, M.hourAngle(tt), M.minuteAngle(tt), 'rgba(255,180,84,.30)');
      hands(ctx, cx, cy, R, M.hourAngle(tt), M.minuteAngle(tt));
      angleLabel(L, cx, cy, R, mid, th + '°', C.orange, th);
    } else { ctx.save(); ctx.globalAlpha = 0.35; hands(ctx, cx, cy, R, M.hourAngle(tt), M.minuteAngle(tt)); ctx.restore(); }
  }
  {
    const { ctx, W, H, L } = fitCanvas($('c4b'));
    L.title(t('c4btitle'), 10, 18, W - 20);
    const m = chart(ctx, L, { l: 40, r: W - 22, t: 34, b: H - 30, xMin: 0, xMax: 720, yMin: 0, yMax: 190, yTicks: [0, 45, 90, 135, 180], yFmt: v => v + '°', ...hourTicks });
    ctx.save(); ctx.fillStyle = 'rgba(85,101,122,.28)'; ctx.fillRect(m.x(60 * h), m.P.t, m.x(60) - m.x(0), m.P.b - m.P.t); ctx.restore();
    const pts = []; for (let u = 0; u <= 720; u += 0.5) pts.push([m.x(u), m.y(M.between(u))]);
    line(ctx, pts, C.cyan, 2);
    line(ctx, [[m.P.l, m.y(th)], [m.P.r, m.y(th)]], C.orange, 1.6, [6, 4]);
    for (const s of sol) dot(ctx, m.x(s), m.y(th), mine.includes(s) ? 5.5 : 3.5, C.text, mine.includes(s));
  }
  $('out4').textContent = t('s4readout', { th, n: sol.length, hour: t('hourName', { a: h === 0 ? 12 : h, b: h + 1 }), list: mine.length ? mine.map(s => M.clock(s, true)).join(t('sep')) : t('none') });
}

/* ---------- step 5: quiz ---------- */
const s5 = { q: null, done: false };
function draw5() {
  const { ctx, W, H, L } = fitCanvas($('c5'));
  if (!s5.q) { $('q5').textContent = t('q5wait'); L.title(t('q5wait'), 10, 18, W - 20); return; }
  const tt = M.timeOf(s5.q.h, s5.q.m), q = M.ledger(s5.q.h, s5.q.m);
  $('q5').textContent = t('q5', { clock: M.clock(tt) });
  L.title(M.clock(tt), 10, 18, W - 20);
  const R = Math.min(W - 30, H - 44) / 2 - 2, cx = W / 2, cy = 30 + (H - 30) / 2;
  face(ctx, L, cx, cy, R);
  let mid = null;
  if (s5.done) mid = smallWedge(ctx, cx, cy, R * 0.62, M.hourAngle(tt), M.minuteAngle(tt), 'rgba(183,156,255,.38)');
  hands(ctx, cx, cy, R, M.hourAngle(tt), M.minuteAngle(tt));
  if (s5.done) angleLabel(L, cx, cy, R, mid, fmt(q.A, 1) + '°', C.violet, q.A);
}
function check5() {
  if (!s5.q) { $('fb5').textContent = t('q5wait'); return; }
  const raw = $('ans5').value.trim(), u = Number(raw);
  if (raw === '' || !isFinite(u)) { $('fb5').textContent = t('q5empty'); $('fb5').style.color = C.orange; return; }
  const tt = M.timeOf(s5.q.h, s5.q.m), q = M.ledger(s5.q.h, s5.q.m), good = Math.abs(u - q.A) <= 0.5;
  s5.done = true; s5.last = { u, good };
  draw5(); feedback5();
}
function feedback5() {
  if (!s5.q || !s5.last) { $('fb5').textContent = ''; return; }
  const tt = M.timeOf(s5.q.h, s5.q.m), q = M.ledger(s5.q.h, s5.q.m);
  $('fb5').textContent = t(s5.last.good ? 'q5ok' : 'q5no', { clock: M.clock(tt), H: fmt(q.H, 1), M: fmt(q.M, 1), D: fmt(q.D, 1), A: fmt(q.A, 1), u: fmt(s5.last.u, 2) });
  $('fb5').style.color = s5.last.good ? C.green : C.orange; $('fb5').dataset.state = s5.last.good ? 'correct' : 'wrong';
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); feedback5(); }

function setup() {
  $('t0').addEventListener('input', () => { stopAnim('s0'); draw0(); });
  $('plus0').addEventListener('click', () => { stopAnim('s0'); $('t0').value = Math.min(120, num('t0') + 1); draw0(); });
  $('play0').addEventListener('click', () => animate('s0', 6000, p => { $('t0').value = Math.round(120 * p); draw0(); }));

  ['h1', 'm1'].forEach(id => $(id).addEventListener('input', draw1));

  $('t2').addEventListener('input', () => { stopAnim('s2'); draw2(); });
  $('play2').addEventListener('click', () => { s2.max = 0; animate('s2', 9000, p => { $('t2').value = Math.round(720 * p); s2.max = 720 * p; draw2(); }); });

  $('k3').addEventListener('input', () => { stopAnim('s3'); s3.playing = false; s3.t = M.meeting(num('k3')); draw3(); });
  $('play3').addEventListener('click', () => {
    s3.playing = true;
    animate('s3', 10000, p => {
      s3.t = 720 * p;
      $('k3').value = Math.min(11, M.MEETINGS.filter(s => s <= s3.t + 1e-9).length - 1 + (p >= 1 ? 1 : 0));
      draw3();
    }, () => { s3.playing = false; s3.t = M.meeting(num('k3')); draw3(); });
  });

  ['th4', 'h4'].forEach(id => $(id).addEventListener('input', draw4));

  const newQuestion = () => {
    let h, m; do { h = 1 + Math.floor(Math.random() * 12); m = Math.floor(Math.random() * 60); } while (s5.q && s5.q.h === h && s5.q.m === m);
    s5.q = { h, m }; s5.done = false; s5.last = null; $('ans5').value = ''; $('fb5').textContent = ''; draw5();
  };
  $('new5').addEventListener('click', newQuestion);
  newQuestion();                                    // a first question is ready on arrival
  $('check5').addEventListener('click', check5);

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
