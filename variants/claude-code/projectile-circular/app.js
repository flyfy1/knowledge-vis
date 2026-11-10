'use strict';
// Projectiles & circular motion lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every path, arrow and readout comes from window.PROJ_MODEL (model.js). Canvas text is limited to
// panel titles (own row) and axis ticks; legends, numbers and explanations live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.PROJ_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', ghost: '#8696aa', ground: '#2a2f38', earth: '#2f5d8a' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros only after a decimal point (so 90 stays 90); show −0 as 0.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; };

/* ---------- drawing kit ---------- */
function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  // CSS height is fixed once from the authored attribute; only the bitmap follows the DPR.
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
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 7);
  ctx.fillText(text, X, Y); ctx.restore();
}
function niceStep(span, px, minPx, steps) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }
function ticksTo(max) {
  const raw = max / 4, p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p;
  const s = (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * p, out = [];
  for (let v = 0; v <= max + 1e-9; v += s) out.push(Math.round(v * 1e6) / 1e6);
  return out;
}
// Draws grid + tick labels for a mapping {x, y, P} and a set of ticks.
function axes(ctx, m, o) {
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  if (o.yTicks) {
    const ys = o.yTicks === 'auto' ? autoTicks(o.yMin, o.yMax, m.P.b - m.P.t, 24) : o.yTicks;
    for (const v of ys) {
      ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(m.P.l, m.y(v)); ctx.lineTo(m.P.r, m.y(v)); ctx.stroke();
      ctx.textAlign = 'right'; ctx.fillText(fmt(v, 2), m.P.l - 6, m.y(v) + 4);
    }
  }
  if (o.xTicks) {
    ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(m.P.l, m.P.b); ctx.lineTo(m.P.r, m.P.b); ctx.stroke();
    const step = niceStep(o.xMax - o.xMin, m.P.r - m.P.l, o.minPx || 32, o.xSteps || [1, 2, 5, 10, 20, 45]);
    const first = Math.ceil((o.xMin - 1e-9) / step) * step;
    ctx.textAlign = 'center';
    for (let v = first; v <= o.xMax + 1e-9; v += step) {
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(m.x(v), m.P.b); ctx.lineTo(m.x(v), m.P.b + 4); ctx.stroke();
      ctx.fillText(fmt(v, 2), m.x(v), m.P.b + 15);
    }
  }
  ctx.restore();
}
function autoTicks(a, b, px, minPx) {
  const step = niceStep(b - a, px, minPx, [0.5, 1, 2, 5, 10, 20, 50]);
  const out = []; for (let v = Math.ceil((a - 1e-9) / step) * step; v <= b + 1e-9; v += step) out.push(Math.round(v * 1e6) / 1e6);
  return out;
}
// Plot panel with independent x/y scales.
function panel(ctx, W, o) {
  const P = { l: o.left == null ? 40 : o.left, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  const m = { x, y, P }; axes(ctx, m, o);
  if (o.title) title(ctx, o.title, 8, P.t - 10, W - 16);
  return m;
}
// Scene panel with one scale for both axes (so angles and arrows are true), centred horizontally.
function scene(ctx, W, o) {
  const L = o.left == null ? 40 : o.left, R = W - (o.right || 12);
  const s = Math.min((R - L) / (o.xMax - o.xMin), (o.bottom - o.top) / (o.yMax - o.yMin));
  const w = s * (o.xMax - o.xMin), h = s * (o.yMax - o.yMin), l = L + (R - L - w) / 2;
  const P = { l, r: l + w, t: o.bottom - h, b: o.bottom };
  const m = { x: v => P.l + (v - o.xMin) * s, y: v => P.b - (v - o.yMin) * s, P, s };
  axes(ctx, m, o);
  if (o.title) title(ctx, o.title, 8, o.top - 10, W - 16);
  return m;
}
function dot(ctx, X, Y, r, color, hollow = false) {
  ctx.save(); ctx.beginPath(); ctx.arc(X, Y, r, 0, 7);
  if (hollow) { ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke(); } else { ctx.fillStyle = color; ctx.fill(); }
  ctx.restore();
}
function curve(ctx, m, f, a, b, color, { lw = 2, dash = null, steps = 200, yClip = null, alpha = 1 } = {}) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = alpha; if (dash) ctx.setLineDash(dash); ctx.beginPath();
  let pen = false;
  for (let i = 0; i <= steps; i++) {
    const v = a + (b - a) * i / steps, w = f(v);
    if (!isFinite(w) || (yClip && (w > yClip[1] || w < yClip[0]))) { pen = false; continue; }
    if (!pen) { ctx.moveTo(m.x(v), m.y(w)); pen = true; } else ctx.lineTo(m.x(v), m.y(w));
  }
  ctx.stroke(); ctx.restore();
}
function poly(ctx, m, pts, color, { lw = 2, dash = null, alpha = 1 } = {}) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = alpha; if (dash) ctx.setLineDash(dash); ctx.beginPath();
  pts.forEach((p, i) => (i ? ctx.lineTo(m.x(p[0]), m.y(p[1])) : ctx.moveTo(m.x(p[0]), m.y(p[1])))); ctx.stroke(); ctx.restore();
}
function arrow(ctx, x0, y0, x1, y1, color, lw = 2.4) {
  const L = Math.hypot(x1 - x0, y1 - y0); if (L < 1.5) return;
  const ux = (x1 - x0) / L, uy = (y1 - y0) / L, hd = Math.min(9, L * 0.5);
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - ux * hd * 0.8, y1 - uy * hd * 0.8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - ux * hd - uy * hd * 0.5, y1 - uy * hd + ux * hd * 0.5); ctx.lineTo(x1 - ux * hd + uy * hd * 0.5, y1 - uy * hd - ux * hd * 0.5); ctx.closePath(); ctx.fill();
  ctx.restore();
}
const warrow = (ctx, m, x0, y0, x1, y1, color, lw) => arrow(ctx, m.x(x0), m.y(y0), m.x(x1), m.y(y1), color, lw);
function clipTo(ctx, m) { ctx.save(); ctx.beginPath(); ctx.rect(m.P.l, m.P.t, m.P.r - m.P.l, m.P.b - m.P.t); ctx.clip(); }
function vline(ctx, m, v, color) { ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = 0.6; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(m.x(v), m.P.t); ctx.lineTo(m.x(v), m.P.b); ctx.stroke(); ctx.restore(); }
function hline(ctx, m, v, color) { ctx.save(); ctx.strokeStyle = color; ctx.setLineDash([6, 4]); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(m.P.l, m.y(v)); ctx.lineTo(m.P.r, m.y(v)); ctx.stroke(); ctx.restore(); }

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

/* ---------- step 0: dropped vs pushed sideways ---------- */
const s0 = { time: null };
function draw0() {
  const v0 = num('v0'), T = M.tLand(), frames = M.strobe0(v0), now = s0.time === null ? T : s0.time;
  $('v0v').textContent = String(v0);
  let { ctx, W, H } = fitCanvas($('c0'));
  const A = scene(ctx, W, { top: 30, bottom: H - 26, xMin: -4, xMax: 42, yMin: 0, yMax: 22, xTicks: true, yTicks: [0, 5, 10, 15, 20], xSteps: [5, 10, 20], title: t('c0a') });
  ctx.save(); ctx.fillStyle = C.ground; ctx.fillRect(A.x(-4), A.y(M.S0.h), A.x(0) - A.x(-4), A.y(0) - A.y(M.S0.h)); ctx.restore();
  const shown = frames.filter(f => f.t <= now + 1e-9);
  shown.forEach(f => {
    ctx.save(); ctx.strokeStyle = C.ghost; ctx.setLineDash([3, 3]); ctx.globalAlpha = 0.7; ctx.beginPath(); ctx.moveTo(A.x(0), A.y(f.y)); ctx.lineTo(A.x(f.x), A.y(f.y)); ctx.stroke(); ctx.restore();
    dot(ctx, A.x(0), A.y(f.y), 6, C.orange, true); dot(ctx, A.x(f.x), A.y(f.y), 4.5, C.cyan);
  });
  if (s0.time !== null) { const y = M.height(now); dot(ctx, A.x(0), A.y(y), 7, C.orange, true); dot(ctx, A.x(v0 * now), A.y(y), 6, C.cyan); }

  ({ ctx, W, H } = fitCanvas($('c0b')));
  const B = panel(ctx, W, { top: 30, bottom: H - 26, xMin: 0, xMax: 2.1, yMin: 0, yMax: 21, yTicks: [0, 5, 10, 15, 20], xTicks: true, xSteps: [0.25, 0.5, 1], title: t('c0b') });
  curve(ctx, B, tt => M.height(tt), 0, T, C.ghost, { lw: 1.4 });
  shown.forEach(f => { dot(ctx, B.x(f.t), B.y(f.y), 6, C.orange, true); dot(ctx, B.x(f.t), B.y(f.y), 3.2, C.cyan); });
  ({ ctx, W, H } = fitCanvas($('c0c')));
  const D = panel(ctx, W, { top: 30, bottom: H - 26, xMin: 0, xMax: 2.1, yMin: 0, yMax: 42, yTicks: [0, 10, 20, 30, 40], xTicks: true, xSteps: [0.25, 0.5, 1], title: t('c0c') });
  curve(ctx, D, tt => v0 * tt, 0, T, C.ghost, { lw: 1.4, steps: 2 });
  shown.forEach(f => { dot(ctx, D.x(f.t), D.y(0), 6, C.orange, true); dot(ctx, D.x(f.t), D.y(f.x), 3.8, C.cyan); });
  const prog = s0.time === null ? '' : t('s0progress', { t: now.toFixed(2) });
  $('r0').textContent = prog + t('s0readout', { v: v0, T: fmt(T, 2), x: fmt(v0 * T, 1) });
}

/* ---------- step 1: launch angle ---------- */
const s1 = { drag: false, hist: [] }; // hist: [{th, drag}], most recent last
const idealPath = th => { const q = M.ideal(th), out = []; for (let i = 0; i <= 80; i++) { const tt = q.T * i / 80; out.push([q.vx * tt, q.vy * tt - 0.5 * M.G * tt * tt]); } return out; };
const pathOf = (th, drag) => (drag ? M.dragAt(th).path : idealPath(th));
function remember1() {
  const th = num('th1'), last = s1.hist[s1.hist.length - 1];
  if (last && last.th === th && last.drag === s1.drag) return;
  s1.hist.push({ th, drag: s1.drag }); if (s1.hist.length > 7) s1.hist.shift();
}
function draw1() {
  const th = num('th1'), id = M.ideal(th), dr = s1.drag ? M.dragAt(th) : null;
  $('th1v').textContent = String(th); $('drag1').setAttribute('aria-pressed', String(s1.drag));
  let { ctx, W, H } = fitCanvas($('c1'));
  const A = scene(ctx, W, { top: 30, bottom: H - 26, xMin: 0, xMax: 42, yMin: 0, yMax: 21, xTicks: true, yTicks: [0, 5, 10, 15, 20], xSteps: [5, 10, 20], title: t('c1a') });
  s1.hist.slice(0, -1).forEach(h => { if (h.th !== th || h.drag !== s1.drag) poly(ctx, A, pathOf(h.th, h.drag), C.text, { lw: 1.3, alpha: 0.4 }); });
  if (s1.drag) poly(ctx, A, idealPath(th), C.orange, { lw: 1.4, dash: [5, 4], alpha: 0.8 });
  poly(ctx, A, pathOf(th, s1.drag), C.cyan, { lw: 2.6 });
  const Rnow = s1.drag ? dr.R : id.R;
  dot(ctx, A.x(Rnow), A.y(0), 5, C.cyan);

  ({ ctx, W, H } = fitCanvas($('c1b')));
  const B = panel(ctx, W, { top: 30, bottom: H - 26, xMin: 0, xMax: 90, yMin: 0, yMax: 44, yTicks: [0, 10, 20, 30, 40], xTicks: true, xSteps: [15, 30, 45], title: t('c1b') });
  curve(ctx, B, a => M.ideal(a).R, 0, 90, C.orange, { steps: 180 });
  if (s1.drag) curve(ctx, B, a => M.dragAt(Math.round(a)).R, 5, 85, C.green, { steps: 80 });
  vline(ctx, B, 45, C.ghost);
  s1.hist.forEach(h => { if (h.th !== th || h.drag !== s1.drag) dot(ctx, B.x(h.th), B.y(h.drag ? M.dragAt(h.th).R : M.ideal(h.th).R), 3.6, C.text); });
  dot(ctx, B.x(th), B.y(Rnow), 6, C.cyan);
  if (!s1.drag) $('r1').textContent = t('s1readIdeal', { th, T: fmt(id.T, 2), H: fmt(id.H, 1), R: fmt(id.R, 1), c: 90 - th, Rmax: fmt(M.ideal(45).R, 1) });
  else { const opt = M.dragOptimum(); $('r1').textContent = t('s1readDrag', { th, T: fmt(dr.T, 2), H: fmt(dr.H, 1), R: fmt(dr.R, 1), Ri: fmt(id.R, 1), c: 90 - th, Rc: fmt(M.dragAt(90 - th).R, 1), opt: opt.theta.toFixed(0), Ropt: fmt(opt.R, 1) }); }
}

/* ---------- step 2: velocity arrows and the velocity diagram ---------- */
const AR = 0.35; // metres of arrow per m/s of velocity in the path panel
function draw2() {
  const th = num('th2'), q = M.ideal(th, M.S2.v0), T = q.T, tt = num('t2') * T, dt = M.S2.dt;
  $('th2v').textContent = String(th); $('t2v').textContent = num('t2').toFixed(2);
  const ks = []; for (let k = 0; k * dt <= T + 1e-9; k++) ks.push(k * dt);
  let { ctx, W, H } = fitCanvas($('c2'));
  const A2 = scene(ctx, W, { top: 30, bottom: H - 26, xMin: -2, xMax: 47, yMin: -8, yMax: 27, xTicks: true, yTicks: [0, 10, 20], xSteps: [10, 20], title: t('c2a') });
  clipTo(ctx, A2);
  const pts = []; for (let i = 0; i <= 80; i++) { const p = M.pos(th, T * i / 80); pts.push([p.x, p.y]); }
  poly(ctx, A2, pts, C.ghost, { lw: 1.4 });
  ks.forEach(s => { const p = M.pos(th, s), v = M.vel(th, s); dot(ctx, A2.x(p.x), A2.y(p.y), 3, C.cyan); warrow(ctx, A2, p.x, p.y, p.x + v.vx * AR, p.y + v.vy * AR, C.cyan, 1.6); });
  const pn = M.pos(th, tt), vn = M.vel(th, tt);
  dot(ctx, A2.x(pn.x), A2.y(pn.y), 5.5, C.text); warrow(ctx, A2, pn.x, pn.y, pn.x + vn.vx * AR, pn.y + vn.vy * AR, C.text, 2.6);
  ctx.restore();

  ({ ctx, W, H } = fitCanvas($('c2b')));
  const B = scene(ctx, W, { top: 30, bottom: H - 26, xMin: -2, xMax: 22, yMin: -21, yMax: 21, xTicks: true, yTicks: [-20, -10, 0, 10, 20], xSteps: [5, 10, 20], minPx: 26, title: t('c2b') });
  ctx.save(); ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(B.x(0), B.P.t); ctx.lineTo(B.x(0), B.P.b); ctx.stroke(); ctx.restore();
  ks.forEach((s, i) => {
    const v = M.vel(th, s); warrow(ctx, B, 0, 0, v.vx, v.vy, C.cyan, 1.3);
    if (i) { const u = M.vel(th, ks[i - 1]); warrow(ctx, B, u.vx, u.vy, v.vx, v.vy, C.pink, 2.2); }
  });
  warrow(ctx, B, 0, 0, vn.vx, vn.vy, C.text, 2.6);
  const d = M.dv(th, tt);
  $('r2').textContent = t('s2readout', { t: tt.toFixed(2), T: fmt(T, 2), vx: fmt(vn.vx, 2), vy: fmt(vn.vy, 2), s: fmt(vn.speed, 2), dir: fmt(vn.dir, 1), dvx: fmt(d.x, 2), dvy: fmt(d.y, 2) });
}

/* ---------- step 3: uniform circular motion ---------- */
const s3 = { phi: Math.PI * 0.15, spinning: false, raf: null, last: null, tried: new Set(['0.6']) };
const VA = 0.3; // metres of arrow per m/s in the circle panel
function draw3() {
  const r = num('r3s'), v = num('v3'), dt = num('dt3'), c = M.circle(v, r), am = M.chordAccel(v, r, dt);
  $('r3v').textContent = fmt(r, 1); $('v3v').textContent = fmt(v, 1); $('dt3v').textContent = dt.toFixed(2);
  const p1 = s3.phi, p2 = s3.phi + c.w * dt, v1 = M.circVel(v, p1), v2 = M.circVel(v, p2), dvx = v2.x - v1.x, dvy = v2.y - v1.y;
  // direction from the midpoint position towards the centre, and the angle Δv makes with it
  const pm = (p1 + p2) / 2, cx = -Math.cos(pm), cy = -Math.sin(pm), dl = Math.hypot(dvx, dvy);
  const off = dl > 1e-12 ? Math.acos(Math.max(-1, Math.min(1, (dvx * cx + dvy * cy) / dl))) * 180 / Math.PI : 0;
  let { ctx, W, H } = fitCanvas($('c3'));
  const A = scene(ctx, W, { top: 30, bottom: H - 26, xMin: -5.8, xMax: 5.8, yMin: -5.8, yMax: 5.8, xTicks: true, yTicks: [-5, 0, 5], xSteps: [5], title: t('c3a') });
  ctx.save(); ctx.strokeStyle = C.ghost; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(A.x(0), A.y(0), r * A.s, 0, 7); ctx.stroke(); ctx.restore();
  dot(ctx, A.x(0), A.y(0), 3, C.muted);
  const P1 = [r * Math.cos(p1), r * Math.sin(p1)], P2 = [r * Math.cos(p2), r * Math.sin(p2)];
  poly(ctx, A, [[0, 0], P1], C.muted, { lw: 1, dash: [3, 3] }); poly(ctx, A, [[0, 0], P2], C.muted, { lw: 1, dash: [3, 3] });
  dot(ctx, A.x(P2[0]), A.y(P2[1]), 5, C.violet); dot(ctx, A.x(P1[0]), A.y(P1[1]), 6, C.cyan);
  warrow(ctx, A, P2[0], P2[1], P2[0] + v2.x * VA, P2[1] + v2.y * VA, C.violet, 2.2);
  warrow(ctx, A, P1[0], P1[1], P1[0] + v1.x * VA, P1[1] + v1.y * VA, C.cyan, 2.4);
  const Pm = [r * Math.cos(pm), r * Math.sin(pm)];
  warrow(ctx, A, Pm[0], Pm[1], Pm[0] + dvx * VA, Pm[1] + dvy * VA, C.pink, 2.4);

  ({ ctx, W, H } = fitCanvas($('c3b')));
  const B = scene(ctx, W, { top: 30, bottom: H - 26, xMin: -9, xMax: 9, yMin: -9, yMax: 9, xTicks: true, yTicks: [-8, -4, 0, 4, 8], xSteps: [4, 8], title: t('c3b') });
  ctx.save(); ctx.strokeStyle = C.ghost; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.arc(B.x(0), B.y(0), v * B.s, 0, 7); ctx.stroke(); ctx.restore();
  warrow(ctx, B, 0, 0, v1.x, v1.y, C.cyan, 2.4); warrow(ctx, B, 0, 0, v2.x, v2.y, C.violet, 2.4); warrow(ctx, B, v1.x, v1.y, v2.x, v2.y, C.pink, 2.4);

  ({ ctx, W, H } = fitCanvas($('c3c')));
  const D = panel(ctx, W, { top: 30, bottom: H - 26, xMin: 0, xMax: 1.02, yMin: 0, yMax: c.a * 1.15, yTicks: ticksTo(c.a), xTicks: true, xSteps: [0.1, 0.2, 0.25, 0.5], title: t('c3c') });
  hline(ctx, D, c.a, C.ghost);
  curve(ctx, D, s => M.chordAccel(v, r, s), 0.005, 1.02, C.orange, { steps: 300 });
  [...s3.tried].map(Number).forEach(s => { if (Math.abs(s - dt) > 1e-9) dot(ctx, D.x(s), D.y(M.chordAccel(v, r, s)), 3.6, C.text); });
  dot(ctx, D.x(dt), D.y(am), 6, C.cyan);
  const ang = c.w * dt * 180 / Math.PI;
  const P3 = { r: fmt(r, 1), v: fmt(v, 1), T: fmt(c.T, 2), dt: dt.toFixed(2), ang: fmt(ang, 1), am: fmt(am, 2), a: fmt(c.a, 2) };
  // beyond half a turn the chord no longer stands for one instant, so the direction claim is not made
  $('r3').textContent = ang > 180 ? t('s3wide', P3) : t('s3readout', { ...P3, off: fmt(off, 1) });
}
function spinFrame(now) {
  s3.raf = null;
  if (!s3.spinning || document.hidden || reduceMotion()) { s3.last = null; return; }
  if (s3.last !== null) s3.phi = (s3.phi + M.circle(num('v3'), num('r3s')).w * Math.min(0.1, (now - s3.last) / 1000)) % (2 * Math.PI);
  s3.last = now; draw3();
  s3.raf = requestAnimationFrame(spinFrame);
}
function stopSpin() { if (s3.raf !== null) cancelAnimationFrame(s3.raf); s3.raf = null; s3.last = null; }

/* ---------- step 4: humpback bridge ---------- */
const s4 = { tried: new Set(['12']) };
function draw4() {
  const v = num('v4'), b = M.bridge(v), r = M.S4.r;
  $('v4v').textContent = fmt(v, 1);
  let { ctx, W, H } = fitCanvas($('c4'));
  const A = scene(ctx, W, { top: 30, bottom: H - 26, xMin: -42, xMax: 42, yMin: -24, yMax: 6, xTicks: true, yTicks: [-20, -10, 0], xSteps: [10, 20, 40], title: t('c4a') });
  clipTo(ctx, A);
  // bridge body and surface
  ctx.save(); ctx.fillStyle = C.ground; ctx.beginPath(); ctx.moveTo(A.x(-42), A.y(-24));
  for (let i = 0; i <= 120; i++) { const x = -40 + 80 * i / 120; ctx.lineTo(A.x(x), A.y(-M.fallBridge(x))); }
  ctx.lineTo(A.x(42), A.y(-24)); ctx.closePath(); ctx.fill(); ctx.restore();
  curve(ctx, A, x => -M.fallBridge(x), -40, 40, C.text, { lw: 2.2, steps: 160 });
  if (v > 0) curve(ctx, A, x => -M.fallParabola(v, x), 0, 42, C.orange, { lw: 2.2, dash: [6, 4], steps: 160, yClip: [-30, 10] });
  else poly(ctx, A, [[0, 0], [0, -24]], C.orange, { lw: 2.2, dash: [6, 4] });
  // car at the top, with weight (down) and normal force (up) to one scale
  const cw = 4.4 * A.s, ch = 1.8 * A.s, X = A.x(0), Y = A.y(0);
  ctx.save(); ctx.fillStyle = C.cyan; ctx.fillRect(X - cw / 2, Y - ch - 2, cw, ch); ctx.fillStyle = C.text; [-1, 1].forEach(sx => { ctx.beginPath(); ctx.arc(X + sx * cw / 3, Y - 2, Math.max(2, 0.45 * A.s), 0, 7); ctx.fill(); }); ctx.restore();
  ctx.restore();
  const Lw = Math.min(46, (A.P.b - Y) - 6);
  arrow(ctx, X + cw / 2 + 8, Y - ch / 2, X + cw / 2 + 8, Y - ch / 2 + Lw, C.violet, 2.6);
  if (b.N > 0) arrow(ctx, X - cw / 2 - 8, Y - ch / 2 + Lw * b.ratio, X - cw / 2 - 8, Y - ch / 2, C.green, 2.6);

  ({ ctx, W, H } = fitCanvas($('c4b')));
  const B = panel(ctx, W, { top: 30, bottom: H - 26, xMin: 0, xMax: 31, yMin: 0, yMax: 1.1, yTicks: [0, 0.25, 0.5, 0.75, 1], xTicks: true, xSteps: [5, 10], title: t('c4b') });
  curve(ctx, B, u => M.bridge(u).ratio, 0, 31, C.orange, { steps: 310 });
  vline(ctx, B, M.vCrit(), C.ghost);
  [...s4.tried].map(Number).forEach(u => { if (u !== v) dot(ctx, B.x(u), B.y(M.bridge(u).ratio), 3.6, C.text); });
  dot(ctx, B.x(v), B.y(b.ratio), 6, C.cyan);
  $('r4').textContent = b.airborne ? t('s4readOff', { v: fmt(v, 1), need: fmt(b.need, 2) }) : t('s4readOn', { v: fmt(v, 1), need: fmt(b.need, 2), N: fmt(b.N, 0), pct: fmt(b.ratio * 100, 1) });
}

/* ---------- step 5: Newton's cannon ---------- */
const s5 = { time: null, hist: [] };
const flights = {};
const flightOf = v => flights[v.toFixed(2)] || (flights[v.toFixed(2)] = M.flight(v));
let box5 = null;
function draw5() {
  const v = num('v5'), fl = flightOf(v), o = M.orbit(v), E = M.E;
  $('v5v').textContent = v.toFixed(2);
  if (!box5) { // frame fixed by the fastest shot so the scale never jumps
    const f = flightOf(9); let x0 = -E.R, x1 = E.R, y0 = -E.R, y1 = E.r0;
    f.path.forEach(p => { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); });
    box5 = { x0: x0 - 400, x1: x1 + 400, y0: y0 - 400, y1: y1 + 400 };
  }
  let { ctx, W, H } = fitCanvas($('c5'));
  const A = scene(ctx, W, { top: 30, bottom: H - 10, left: 10, right: 10, xMin: box5.x0, xMax: box5.x1, yMin: box5.y0, yMax: box5.y1, title: t('c5a') });
  ctx.save(); ctx.fillStyle = C.earth; ctx.beginPath(); ctx.arc(A.x(0), A.y(0), E.R * A.s, 0, 7); ctx.fill(); ctx.restore();
  ctx.save(); ctx.fillStyle = C.ground; ctx.strokeStyle = C.text; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(A.x(-350), A.y(E.R - 30)); ctx.lineTo(A.x(0), A.y(E.r0)); ctx.lineTo(A.x(350), A.y(E.R - 30)); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  s5.hist.forEach(h => { if (h !== v) poly(ctx, A, flightOf(h).path, C.text, { lw: 1.2, alpha: 0.4 }); });
  const now = s5.time === null ? fl.t : s5.time;
  const shown = fl.path.filter(p => p[2] <= now + 1e-9);
  if (shown.length > 1) poly(ctx, A, shown, C.cyan, { lw: 2.2 });
  const tip = shown[shown.length - 1] || fl.path[0];
  dot(ctx, A.x(tip[0]), A.y(tip[1]), 4.5, C.text);

  ({ ctx, W, H } = fitCanvas($('c5b')));
  const one = M.oneSecond(v);
  const B = panel(ctx, W, { top: 30, bottom: H - 26, xMin: 0, xMax: 9.2, yMin: 0, yMax: 7, yTicks: [0, 1, 2, 3, 4, 5, 6, 7], xTicks: true, xSteps: [1, 2, 3], title: t('c5b') });
  hline(ctx, B, one.fall, C.orange);
  curve(ctx, B, u => M.oneSecond(u).drop, 0, 9.2, C.green, { steps: 200, lw: 2.2 });
  vline(ctx, B, v, C.cyan);
  dot(ctx, B.x(v), B.y(one.fall), 5, C.orange); dot(ctx, B.x(v), B.y(one.drop), 5.5, C.green);

  const prog = s5.time === null || s5.time >= fl.t ? '' : t('s5progress', { t: (now / 60).toFixed(1) });
  const P = { v: v.toFixed(2), drop: fmt(one.drop, 2), fall: fmt(one.fall, 2) };
  let txt;
  if (v === 0) txt = t('s5readZero', { t: fmt(fl.t / 60, 1) });
  else if (o.kind === 'crash') txt = t('s5readCrash', { ...P, t: fmt(fl.t / 60, 1), deg: fmt(fl.swept * 180 / Math.PI, 0) });
  else if (o.kind === 'circle') txt = t('s5readCircle', { ...P, T: fmt(o.T / 60, 1) });
  else txt = t('s5readEllipse', { ...P, T: fmt(o.T / 60, 1), hmax: fmt(o.rMax - E.R, 0) });
  $('r5').textContent = prog + txt;
}
function remember5(v) { if (!s5.hist.includes(v)) { s5.hist.push(v); if (s5.hist.length > 8) s5.hist.shift(); } }

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  $('v0').addEventListener('input', () => { stopAnim('s0'); s0.time = null; draw0(); });
  $('go0').addEventListener('click', () => { const T = M.tLand(); animate('s0', T * 1000, p => { s0.time = p * T; draw0(); }, () => { s0.time = null; draw0(); }); });

  $('th1').addEventListener('input', () => { remember1(); draw1(); });
  $('drag1').addEventListener('click', () => { s1.drag = !s1.drag; remember1(); draw1(); });
  $('clear1').addEventListener('click', () => { s1.hist = []; remember1(); draw1(); });
  remember1();

  ['th2', 't2'].forEach(id => $(id).addEventListener('input', draw2));

  ['r3s', 'v3'].forEach(id => $(id).addEventListener('input', () => { s3.tried = new Set([String(num('dt3'))]); draw3(); }));
  $('dt3').addEventListener('input', () => { s3.tried.add(String(num('dt3'))); draw3(); });
  $('spin3').addEventListener('click', () => { s3.spinning = !s3.spinning; $('spin3').setAttribute('aria-pressed', String(s3.spinning)); if (s3.spinning) { if (s3.raf === null) s3.raf = requestAnimationFrame(spinFrame); } else stopSpin(); });

  $('v4').addEventListener('input', () => { s4.tried.add(String(num('v4'))); draw4(); });
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked');
    const ok = !!choice && choice.value === 'b';
    $('quizFeedback').dataset.state = ok ? 'correct' : 'wrong';
    $('quizFeedback').textContent = t(ok ? 'correct' : 'wrong');
    $('quizFeedback').style.color = ok ? C.green : C.orange;
  });

  $('v5').addEventListener('input', () => { stopAnim('s5'); s5.time = null; draw5(); });
  $('fire5').addEventListener('click', () => {
    const v = num('v5'), fl = flightOf(v);
    animate('s5', fl.t, p => { s5.time = p * fl.t; draw5(); }, () => { s5.time = null; remember5(v); draw5(); });
  });
  $('clear5').addEventListener('click', () => { s5.hist = []; draw5(); });
  remember5(num('v5'));

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target)));
    }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { finishAll(); stopSpin(); } else if (s3.spinning && s3.raf === null) s3.raf = requestAnimationFrame(spinFrame); });
  window.refreshLesson = () => { refresh(); const fb = $('quizFeedback'); if (fb.dataset.state) fb.textContent = t(fb.dataset.state); };
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
