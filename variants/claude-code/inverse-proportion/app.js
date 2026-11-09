'use strict';
// Inverse proportion lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, rectangle, bar and readout comes from window.IP_MODEL (model.js).
// Canvas text goes through a per-draw label layout (labels()) that keeps labels inside the canvas and
// drops optional labels (tick numbers, point tags) that would touch another label.
(function () {

const $ = id => document.getElementById(id);
const M = window.IP_MODEL;
const t = (...a) => window.IP_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#1f2c3b', axis: '#5a6f88', text: '#e8edf4', bg: '#0d1621', dash: '#8696aa' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; return v.toFixed(d).replace(/\.?0+$/, '') || '0'; };
// Small positive numbers keep their significant digits (0.006, 0.0006).
const fmtSmall = v => (Math.abs(v) >= 0.01 ? fmt(v, 3) : String(Number(v.toPrecision(3))));

function fitCanvas(canvas, hOverride) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) { canvas.dataset.h = canvas.getAttribute('height') || 300; canvas.style.height = canvas.dataset.h + 'px'; }
  let height = Number(canvas.dataset.h);
  if (hOverride) { height = Math.min(height, hOverride); canvas.style.height = height + 'px'; }
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}

// Label layout for one draw (same contract as the other Claude editions in this batch).
function labels(ctx, W, H) {
  const boxes = [];
  const hit = b => boxes.some(o => b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0);
  function put(text, x, y, o = {}) {
    const align = o.align || 'center';
    for (let size = o.size || 12; size >= 8; size -= 0.5) {
      ctx.font = `${o.weight || 400} ${size}px system-ui,sans-serif`;
      const m = ctx.measureText(text), w = m.width;
      if (w > W - 8 && size > 8) continue;
      const asc = m.actualBoundingBoxAscent, desc = m.actualBoundingBoxDescent;
      let x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
      x0 = Math.max(4, Math.min(W - 4 - w, x0));
      const shifts = o.optional ? [0] : (o.shifts || [0, 1, -1, 2, -2]);
      for (const s of shifts) {
        const yy = y + s * (asc + desc + 4);
        const b = { x0: x0 - 2, x1: x0 + w + 2, y0: yy - asc - 2, y1: yy + desc + 2 };
        if (b.y0 < 0 || b.y1 > H) continue;
        if (!hit(b)) {
          boxes.push(b);
          ctx.save(); ctx.textAlign = 'left'; ctx.fillStyle = o.color || C.text; ctx.fillText(text, x0, yy); ctx.restore();
          return true;
        }
      }
      if (o.optional) return false;
    }
    return false;
  }
  return { put };
}
const titleOf = (L, text, y = 17) => L.put(text, 8, y, { align: 'left', weight: 600, size: 13, shifts: [0] });

// Cartesian panel: grid at the ticks, axes through 0 when in range, tick labels optional.
function plot(ctx, L, W, H, o) {
  const P = { l: o.l || 40, r: W - (o.r || 16), t: o.t || 30, b: H - (o.b || 30) };
  const X = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const Y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1;
  for (const v of o.xTicks) { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(X(v), P.t); ctx.lineTo(X(v), P.b); ctx.stroke(); }
  for (const v of o.yTicks) { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(P.l, Y(v)); ctx.lineTo(P.r, Y(v)); ctx.stroke(); }
  ctx.strokeStyle = C.axis; ctx.lineWidth = 1.5;
  const ax = o.xMin <= 0 && o.xMax >= 0 ? X(0) : P.l, ay = o.yMin <= 0 && o.yMax >= 0 ? Y(0) : P.b;
  ctx.beginPath(); ctx.moveTo(P.l, ay); ctx.lineTo(P.r, ay); ctx.moveTo(ax, P.t); ctx.lineTo(ax, P.b); ctx.stroke();
  ctx.restore();
  for (const v of o.xTicks) if (v !== 0 || !o.skipZero) L.put(o.xFmt ? o.xFmt(v) : fmt(v), X(v), ay + 15, { optional: true, size: 11, color: C.muted });
  for (const v of o.yTicks) if (v !== 0) L.put(o.yFmt ? o.yFmt(v) : fmt(v), ax - 6, Y(v) + 4, { optional: true, size: 11, color: C.muted, align: 'right' });
  if (o.xName) L.put(o.xName, P.r, ay - 8, { align: 'right', size: 12, color: C.muted, optional: true });
  if (o.yName) L.put(o.yName, ax + 8, P.t + 10, { align: 'left', size: 12, color: C.muted, optional: true });
  return { X, Y, P };
}
function curve(ctx, pts, m, color, { lw = 2.5, dash = null } = {}) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); pts.forEach(([x, y], i) => { const px = m.X(x), py = m.Y(y); if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); }); ctx.stroke(); ctx.restore();
}
function dot(ctx, x, y, color, r = 5) { ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.restore(); }
// y = k/x on one side, x from a to b (a, b same sign), log-spaced so the steep part is smooth.
function hyper(k, a, b, n = 240) {
  const s = Math.sign(a), la = Math.log(Math.abs(a)), lb = Math.log(Math.abs(b)), out = [];
  for (let i = 0; i <= n; i++) { const x = s * Math.exp(la + (lb - la) * i / n); out.push([x, k / x]); }
  return out;
}
const ticks = (lo, hi, st) => { const a = []; for (let v = Math.ceil(lo / st) * st; v <= hi + 1e-9; v += st) a.push(+v.toFixed(6)); return a; };

/* ---------- shared animation runner ---------- */
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

/* ---------- step 0: fixed area, corners leave a trail ---------- */
const s0 = { trail: new Set([2, 3, 4, 6, 8]) };
function draw0() {
  const x = num('x0'), r = M.rect(x);
  $('x0v').textContent = fmt(x);
  const { ctx, W, H } = fitCanvas($('c0')), L = labels(ctx, W, H);
  titleOf(L, t('c0title'));
  const m = plot(ctx, L, W, H, { t: 34, xMin: 0, xMax: 12.6, yMin: 0, yMax: 25.5, xTicks: ticks(0, 12, 2), yTicks: ticks(0, 24, 4), xName: t('xWidth'), yName: t('yHeight'), skipZero: true });
  ctx.save(); ctx.fillStyle = 'rgba(103,215,249,.18)'; ctx.strokeStyle = C.cyan; ctx.lineWidth = 2;
  ctx.fillRect(m.X(0), m.Y(r.y), m.X(x) - m.X(0), m.Y(0) - m.Y(r.y)); ctx.strokeRect(m.X(0), m.Y(r.y), m.X(x) - m.X(0), m.Y(0) - m.Y(r.y)); ctx.restore();
  // unit squares inside the rectangle (only when big enough to see)
  if (Number.isInteger(x) && Number.isInteger(r.y) && (m.X(1) - m.X(0)) > 9) {
    ctx.save(); ctx.strokeStyle = 'rgba(103,215,249,.28)'; ctx.lineWidth = 1;
    for (let i = 1; i < x; i++) { ctx.beginPath(); ctx.moveTo(m.X(i), m.Y(0)); ctx.lineTo(m.X(i), m.Y(r.y)); ctx.stroke(); }
    for (let j = 1; j < r.y; j++) { ctx.beginPath(); ctx.moveTo(m.X(0), m.Y(j)); ctx.lineTo(m.X(x), m.Y(j)); ctx.stroke(); }
    ctx.restore();
  }
  [...s0.trail].forEach(v => dot(ctx, m.X(v), m.Y(M.AREA / v), C.text, 3.2));
  dot(ctx, m.X(x), m.Y(r.y), C.orange, 6);
  L.put(`(${fmt(x)}, ${fmt(r.y)})`, m.X(x) + 8, m.Y(r.y) - 8, { align: 'left', color: C.orange, optional: true });
  $('r0').textContent = t('s0readout', { x: fmt(x), y: fmt(r.y), a: fmt(r.area), n: s0.trail.size });
}

/* ---------- step 1: width × m ⇒ height ÷ m ---------- */
function draw1() {
  const x0 = num('w1'), m = num('m1'), s = M.scale(x0, m);
  $('w1v').textContent = fmt(x0); $('m1v').textContent = '× ' + m;
  const { ctx, W, H } = fitCanvas($('c1')), L = labels(ctx, W, H);
  titleOf(L, t('c1title'));
  const p = plot(ctx, L, W, H, { t: 34, xMin: 0, xMax: 25.5, yMin: 0, yMax: 25.5, xTicks: ticks(0, 24, 4), yTicks: ticks(0, 24, 4), xName: t('xWidth'), yName: t('yHeight'), skipZero: true });
  ctx.save(); ctx.fillStyle = 'rgba(103,215,249,.2)'; ctx.strokeStyle = C.cyan; ctx.lineWidth = 2;
  ctx.fillRect(p.X(0), p.Y(s.y1), p.X(s.x1) - p.X(0), p.Y(0) - p.Y(s.y1)); ctx.strokeRect(p.X(0), p.Y(s.y1), p.X(s.x1) - p.X(0), p.Y(0) - p.Y(s.y1));
  ctx.strokeStyle = C.dash; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.8; ctx.strokeRect(p.X(0), p.Y(s.y0), p.X(x0) - p.X(0), p.Y(0) - p.Y(s.y0)); ctx.restore();
  // faint fixed-area curve for reference: every rectangle of area 24 has its corner on it
  curve(ctx, hyper(M.AREA, 24 / 25.5, 25.5), p, 'rgba(255,180,84,.65)', { lw: 1.5, dash: [3, 4] });
  dot(ctx, p.X(x0), p.Y(s.y0), C.dash, 4.5); dot(ctx, p.X(s.x1), p.Y(s.y1), C.orange, 6);
  L.put(`(${fmt(s.x1)}, ${fmt(s.y1)})`, p.X(s.x1) + 8, p.Y(s.y1) - 8, { align: 'left', color: C.orange, optional: true });
  if (m > 1) L.put(`(${fmt(x0)}, ${fmt(s.y0)})`, p.X(x0) + 8, p.Y(s.y0) - 8, { align: 'left', color: C.dash, optional: true });
  $('r1').textContent = t('s1readout', { x0: fmt(x0), y0: fmt(s.y0), m, x1: fmt(s.x1), y1: fmt(s.y1), p: fmt(s.prod1) });
}

/* ---------- step 2: the graph of y = k/x ---------- */
function draw2() {
  const k = num('k2'), x = num('x2'), y = M.f(k, x), R = 8;
  $('k2v').textContent = String(k); $('x2v').textContent = fmt(x);
  const c2 = $('c2'), { ctx, W, H } = fitCanvas(c2, Math.round((c2.clientWidth || 600) + 22)), L = labels(ctx, W, H);
  titleOf(L, k === 0 ? t('c2titleZero') : t('c2title', { k }));
  const side = Math.min(W - 24, H - 46), ox = (W - side) / 2;
  const p = plot(ctx, L, W, H, { l: ox, r: ox, t: 34, b: Math.max(1, H - 34 - side), xMin: -R, xMax: R, yMin: -R, yMax: R, xTicks: ticks(-R, R, 2), yTicks: ticks(-R, R, 2), xName: 'x', yName: 'y', skipZero: true });
  const qs = M.quadrants(k), QP = { 1: [5.5, 6.6], 2: [-5.5, 6.6], 3: [-5.5, -6.6], 4: [5.5, -6.6] };
  [1, 2, 3, 4].forEach(q => L.put(t('quad' + q), p.X(QP[q][0]), p.Y(QP[q][1]) + 4, { optional: true, size: 12, weight: qs.includes(q) ? 700 : 400, color: qs.includes(q) ? C.cyan : '#4f6074' }));
  if (k !== 0) M.branches(k, R, R).forEach(b => curve(ctx, b, p, C.cyan));
  else curve(ctx, [[-R, 0], [-0.05, 0]], p, C.pink, { dash: [6, 4] }), curve(ctx, [[0.05, 0], [R, 0]], p, C.pink, { dash: [6, 4] });
  if (y !== null && k !== 0) {
    const yy = Math.max(-R, Math.min(R, y));
    ctx.save(); ctx.fillStyle = 'rgba(126,226,168,.22)'; ctx.strokeStyle = C.green; ctx.lineWidth = 1.5;
    const rx = Math.min(p.X(0), p.X(x)), ry = Math.min(p.Y(0), p.Y(yy));
    ctx.fillRect(rx, ry, Math.abs(p.X(x) - p.X(0)), Math.abs(p.Y(yy) - p.Y(0))); ctx.strokeRect(rx, ry, Math.abs(p.X(x) - p.X(0)), Math.abs(p.Y(yy) - p.Y(0))); ctx.restore();
    if (Math.abs(y) <= R) dot(ctx, p.X(x), p.Y(y), C.orange, 6);
  } else if (y === null) {
    ctx.save(); ctx.strokeStyle = C.pink; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(p.X(0), p.P.t); ctx.lineTo(p.X(0), p.P.b); ctx.stroke(); ctx.restore();
  }
  let msg;
  if (k === 0) msg = t('s2zero');
  else if (y === null) msg = t('s2x0', { k });
  else msg = t('s2readout', { k, x: fmt(x), y: fmt(y, 3), q: t('quad' + (x > 0 ? (y > 0 ? 1 : 4) : (y > 0 ? 2 : 3))), out: Math.abs(y) > R ? t('s2out') : '' });
  $('r2').textContent = msg;
}

/* ---------- step 3: zoom out ---------- */
const s3 = { seen: new Set([0]) };
function draw3() {
  const z = num('z3'), Xmax = M.ZOOMS[z], k = M.K3, yEdge = k / Xmax;
  $('z3v').textContent = '0 – ' + Xmax.toLocaleString('en-US');
  const { ctx, W, H } = fitCanvas($('c3')), L = labels(ctx, W, H);
  titleOf(L, t('c3title', { X: Xmax.toLocaleString('en-US') }));
  const p = plot(ctx, L, W, H, { l: 34, t: 34, xMin: 0, xMax: Xmax * 1.02, yMin: 0, yMax: 6.6, xTicks: ticks(0, Xmax, Xmax / 5), yTicks: [0, 2, 4, 6], xName: 'x', yName: 'y', skipZero: true, xFmt: v => v.toLocaleString('en-US') });
  curve(ctx, hyper(k, k / 6.6, Xmax * 1.02, 400), p, C.cyan);
  dot(ctx, p.X(Xmax), p.Y(yEdge), C.orange, 5.5);
  L.put('y = ' + fmtSmall(yEdge), p.X(Xmax), p.Y(yEdge) - 26, { align: 'right', color: C.orange, shifts: [0, -1, -2] });
  $('r3').textContent = t('s3readout', { X: Xmax.toLocaleString('en-US'), y: fmtSmall(yEdge), px: fmt(Math.max(0, p.Y(0) - p.Y(yEdge)), 2) });
  const body = $('tbl3').tBodies[0]; body.innerHTML = '';
  [...s3.seen].sort((a, b) => a - b).forEach(i => {
    const X = M.ZOOMS[i], tr = document.createElement('tr'); if (i === z) tr.className = 'cur';
    [X.toLocaleString('en-US'), fmtSmall(k / X), fmt(X * (k / X))].forEach(c => { const td = document.createElement('td'); td.textContent = c; tr.appendChild(td); });
    body.appendChild(tr);
  });
}

/* ---------- step 4: ratio or product? ---------- */
const s4 = { sc: 'trip' };
function draw4() {
  const rows = M.table(s4.sc), kind = M.classify(s4.sc);
  M.SCEN_KEYS.forEach(s => $('sc4' + s).setAttribute('aria-pressed', String(s === s4.sc)));
  $('th4x').textContent = t('x_' + s4.sc); $('th4y').textContent = t('y_' + s4.sc);
  const body = $('tbl4').tBodies[0]; body.innerHTML = '';
  rows.forEach(r => { const tr = document.createElement('tr'); [fmt(r.x), fmt(r.y), fmt(r.ratio), fmt(r.prod)].forEach(c => { const td = document.createElement('td'); td.textContent = c; tr.appendChild(td); }); body.appendChild(tr); });
  const { ctx, W, H } = fitCanvas($('c4')), L = labels(ctx, W, H);
  const panel = (top, bottom, key, color, title) => {
    titleOf(L, title, top - 8);
    const vals = rows.map(r => r[key]), max = Math.max(...vals), l = 16, r = W - 16, n = rows.length, slot = (r - l) / n, bw = Math.min(46, slot * 0.6);
    ctx.save(); ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(l, bottom); ctx.lineTo(r, bottom); ctx.stroke(); ctx.restore();
    rows.forEach((row, i) => {
      const cx = l + slot * (i + 0.5), h = (bottom - top - 22) * vals[i] / max;
      ctx.save(); ctx.fillStyle = color; ctx.globalAlpha = 0.85; ctx.fillRect(cx - bw / 2, bottom - h, bw, h); ctx.restore();
      L.put(fmt(vals[i], 2), cx, bottom - h - 5, { optional: true, size: 11, color: C.text });
      L.put('x=' + fmt(row.x), cx, bottom + 14, { optional: true, size: 11, color: C.muted });
    });
  };
  panel(36, 150, 'ratio', C.green, t('c4ratio'));
  panel(196, 310, 'prod', C.orange, t('c4prod'));
  $('r4').textContent = t('s4readout_' + kind, { sc: t('sc_' + s4.sc) });
}

/* ---------- step 5: real situations restrict x ---------- */
const s5 = { sc: 'fare' };
function setup5() {
  const q = $('q5');
  if (s5.sc === 'fare') { q.min = 1; q.max = 12; q.step = 1; q.value = 4; } else { q.min = 20; q.max = 120; q.step = 5; q.value = 60; }
}
function draw5() {
  const fare = s5.sc === 'fare', q = num('q5');
  ['fare', 'trip'].forEach(s => $('sc5' + s).setAttribute('aria-pressed', String(s === s5.sc)));
  $('q5lab').textContent = t(fare ? 'q5fare' : 'q5trip');
  $('q5v').textContent = fare ? t('people', { v: q }) : t('kmh', { v: q });
  const { ctx, W, H } = fitCanvas($('c5')), L = labels(ctx, W, H);
  titleOf(L, t(fare ? 'c5fare' : 'c5trip'));
  if (fare) {
    const p = plot(ctx, L, W, H, { l: 44, t: 34, xMin: 0, xMax: 12.8, yMin: 0, yMax: 132, xTicks: ticks(0, 12, 2), yTicks: ticks(0, 120, 30), xName: t('axPeople'), yName: t('axYuan'), skipZero: true });
    curve(ctx, hyper(M.FARE, M.FARE / 132, 12.8), p, C.dash, { lw: 1.5, dash: [5, 4] });
    for (let n = 1; n <= 12; n++) dot(ctx, p.X(n), p.Y(M.share(n)), n === q ? C.orange : C.cyan, n === q ? 6.5 : 4.5);
    L.put('¥' + fmt(M.share(q)), p.X(q) + 9, p.Y(M.share(q)) - 9, { align: 'left', color: C.orange, optional: true });
    $('r5').textContent = t(M.exactCents(q) ? 's5fareExact' : 's5fareRound', { n: q, y: fmt(M.share(q), 4), c: M.share(q).toFixed(2) });
  } else {
    const p = plot(ctx, L, W, H, { l: 36, t: 34, xMin: 0, xMax: 132, yMin: 0, yMax: 7.2, xTicks: ticks(0, 120, 20), yTicks: ticks(0, 7, 1), xName: t('axKmh'), yName: t('axHours'), skipZero: true });
    curve(ctx, hyper(M.TRIP, M.TRIP / 7.2, 132), p, C.dash, { lw: 1.5, dash: [5, 4] });
    curve(ctx, hyper(M.TRIP, 20, 120), p, C.cyan, { lw: 3 });
    dot(ctx, p.X(q), p.Y(M.hours(q)), C.orange, 6);
    L.put(fmt(M.hours(q)) + ' h', p.X(q) + 9, p.Y(M.hours(q)) - 9, { align: 'left', color: C.orange, optional: true });
    $('r5').textContent = t('s5trip', { v: q, h: fmt(M.hours(q), 3), min: fmt(M.hours(q) * 60, 1) });
  }
}

/* ---------- step 6: find a missing value ---------- */
const s6 = { i: 0, revealed: false, last: null };
function draw6() {
  const q = M.QUIZ[s6.i], sol = M.solve(q);
  $('q6').textContent = t('q6', { a: fmt(q.a), b: fmt(q.b), c: fmt(q.c), i: s6.i + 1, n: M.QUIZ.length });
  const fb = $('fb6');
  if (s6.last === null) { fb.textContent = ''; delete fb.dataset.state; }
  else if (s6.last === 'empty') { fb.textContent = t('needNumber'); fb.dataset.state = 'none'; fb.style.color = C.orange; }
  else { const okk = s6.last === 'ok'; fb.textContent = t(okk ? 'right6' : 'wrong6', { a: fmt(q.a), b: fmt(q.b), k: fmt(sol.k), c: fmt(q.c), y: fmt(sol.y, 3) }); fb.dataset.state = okk ? 'correct' : 'wrong'; fb.style.color = okk ? C.green : C.orange; }
  const { ctx, W, H } = fitCanvas($('c6')), L = labels(ctx, W, H);
  titleOf(L, s6.revealed ? t('c6titleK', { k: fmt(sol.k) }) : t('c6title'));
  const XR = Math.ceil(Math.max(Math.abs(q.a), Math.abs(q.c)) * 1.3), YR = Math.ceil(Math.max(Math.abs(q.b), Math.abs(sol.y)) * 1.3);
  const st = v => (v > 12 ? 4 : v > 6 ? 2 : 1);
  const p = plot(ctx, L, W, H, { l: 30, t: 34, xMin: -XR, xMax: XR, yMin: -YR, yMax: YR, xTicks: ticks(-XR, XR, st(XR)), yTicks: ticks(-YR, YR, st(YR)), xName: 'x', yName: 'y', skipZero: true });
  if (s6.revealed) M.branches(sol.k, XR, YR).forEach(b => curve(ctx, b, p, C.cyan));
  ctx.save(); ctx.strokeStyle = C.orange; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(p.X(q.c), p.P.t); ctx.lineTo(p.X(q.c), p.P.b); ctx.stroke(); ctx.restore();
  dot(ctx, p.X(q.a), p.Y(q.b), C.text, 5.5);
  L.put(`(${fmt(q.a)}, ${fmt(q.b)})`, p.X(q.a) + 8, p.Y(q.b) - 8, { align: 'left', color: C.text });
  if (s6.revealed) { dot(ctx, p.X(q.c), p.Y(sol.y), C.orange, 6); L.put(`(${fmt(q.c)}, ${fmt(sol.y, 3)})`, p.X(q.c) + 8, p.Y(sol.y) + 18, { align: 'left', color: C.orange }); }
  else L.put('x = ' + fmt(q.c), p.X(q.c) + 6, p.P.t + 12, { align: 'left', color: C.orange });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); draw6(); }

function setup() {
  $('x0').addEventListener('input', () => { stopAnim('s0'); s0.trail.add(num('x0')); draw0(); });
  $('sweep0').addEventListener('click', () => {
    s0.trail.clear(); const steps = 22; // x = 1, 1.5, …, 12
    animate('s0', 4400, p => { const i = Math.min(steps, Math.floor(p * (steps + 1))); for (let j = 0; j <= i; j++) s0.trail.add(1 + j * 0.5); $('x0').value = 1 + i * 0.5; draw0(); });
  });
  $('clear0').addEventListener('click', () => { stopAnim('s0'); s0.trail = new Set([num('x0')]); draw0(); });
  ['w1', 'm1'].forEach(id => $(id).addEventListener('input', draw1));
  ['k2', 'x2'].forEach(id => $(id).addEventListener('input', draw2));
  $('z3').addEventListener('input', () => { s3.seen.add(num('z3')); draw3(); });
  M.SCEN_KEYS.forEach(s => $('sc4' + s).addEventListener('click', () => { s4.sc = s; draw4(); }));
  ['fare', 'trip'].forEach(s => $('sc5' + s).addEventListener('click', () => { if (s5.sc !== s) { s5.sc = s; setup5(); } draw5(); }));
  $('q5').addEventListener('input', draw5);
  $('check6').addEventListener('click', () => {
    const raw = $('ans6').value.trim(), v = Number(raw);
    if (raw === '' || !Number.isFinite(v)) s6.last = 'empty';
    else { s6.last = M.check(M.QUIZ[s6.i], v) ? 'ok' : 'bad'; s6.revealed = true; }
    draw6();
  });
  $('ans6').addEventListener('keydown', e => { if (e.key === 'Enter') $('check6').click(); });
  $('next6').addEventListener('click', () => { s6.i = (s6.i + 1) % M.QUIZ.length; s6.revealed = false; s6.last = null; $('ans6').value = ''; draw6(); });

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
  window.refreshInverse = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
