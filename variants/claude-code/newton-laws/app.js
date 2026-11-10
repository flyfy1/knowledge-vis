'use strict';
// Newton's laws lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every position, arrow and readout comes from window.NEWTON_MODEL (model.js). Canvas text is limited to
// panel titles (own row) and axis ticks; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.NEWTON_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', ghost: '#8696aa', ice: '#16283a', floor: '#2a2f38' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros; show −0 as 0.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; return v.toFixed(d).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') || '0'; };

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
// Panel title: shrinks the font until it fits (never overflows, never squeezes glyphs).
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 7);
  ctx.fillText(text, X, Y); ctx.restore();
}
function niceStep(span, px, minPx, steps) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }
// A plot panel: title in its own row above, y tick labels to the left, x tick labels below.
function panel(ctx, W, o) {
  const P = { l: o.left == null ? 38 : o.left, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks || []) {
    ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(fmt(v, o.yDigits || 2), P.l - 6, y(v) + 4);
  }
  if (o.xTicks) {
    ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.b); ctx.lineTo(P.r, P.b); ctx.stroke();
    const step = niceStep(o.xMax - o.xMin, P.r - P.l, o.minPx || 30, o.xSteps || [1, 2, 5, 10, 20]);
    const first = Math.ceil((o.xMin - 1e-9) / step) * step;
    ctx.textAlign = 'center';
    for (let v = first; v <= o.xMax + 1e-9; v += step) {
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
      ctx.fillText(fmt(v, o.xDigits || 2), x(v), P.b + 15);
    }
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 9, W - 16);
  return { x, y, P };
}
function dot(ctx, X, Y, r, color, hollow = false) {
  ctx.save(); ctx.beginPath(); ctx.arc(X, Y, r, 0, 7);
  if (hollow) { ctx.strokeStyle = color; ctx.lineWidth = 1.6; ctx.stroke(); } else { ctx.fillStyle = color; ctx.fill(); }
  ctx.restore();
}
function arrow(ctx, x0, y0, x1, y1, color, lw = 3) {
  const L = Math.hypot(x1 - x0, y1 - y0); if (L < 1.5) return;
  const ux = (x1 - x0) / L, uy = (y1 - y0) / L, hd = Math.min(10, L * 0.6);
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - ux * hd * 0.8, y1 - uy * hd * 0.8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - ux * hd - uy * hd * 0.5, y1 - uy * hd + ux * hd * 0.5); ctx.lineTo(x1 - ux * hd + uy * hd * 0.5, y1 - uy * hd - ux * hd * 0.5); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function curve(ctx, m, f, a, b, color, { lw = 2, dash = null, steps = 200, yClip = null } = {}) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.beginPath();
  let pen = false;
  for (let i = 0; i <= steps; i++) {
    const v = a + (b - a) * i / steps, w = f(v);
    if (!isFinite(w) || (yClip && (w > yClip[1] || w < yClip[0]))) { pen = false; continue; }
    if (!pen) { ctx.moveTo(m.x(v), m.y(w)); pen = true; } else ctx.lineTo(m.x(v), m.y(w));
  }
  ctx.stroke(); ctx.restore();
}
function hline(ctx, m, v, color, dash = [5, 4]) {
  ctx.save(); ctx.strokeStyle = color; ctx.setLineDash(dash); ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(m.P.l, m.y(v)); ctx.lineTo(m.P.r, m.y(v)); ctx.stroke(); ctx.restore();
}
// Off-scale point: a small triangle pinned to the top edge of the panel.
function capMark(ctx, X, Ytop, color) { ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(X, Ytop - 2); ctx.lineTo(X - 5, Ytop + 7); ctx.lineTo(X + 5, Ytop + 7); ctx.closePath(); ctx.fill(); ctx.restore(); }

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

// A horizontal track drawn as a panel with a metre ruler underneath; returns the panel mapping.
function track(ctx, W, top, bottom, xMin, xMax, ttl, fill = C.ice, from = 0) {
  const m = panel(ctx, W, { top, bottom, xMin, xMax, yMin: 0, yMax: 1, xTicks: true, left: 16, right: 16, title: ttl });
  ctx.save(); ctx.fillStyle = fill; ctx.fillRect(m.x(Math.max(from, xMin)), m.P.t, m.x(xMax) - m.x(Math.max(from, xMin)), m.P.b - m.P.t); ctx.restore();
  return m;
}

/* ---------- step 0: the puck on ice ---------- */
const s0 = { time: null, tried: new Set(['0.2']) };
function draw0() {
  const mu = num('mu0'), S = M.glideStrobe(mu), g = M.glide(mu), L = M.S0.track;
  $('mu0v').textContent = mu.toFixed(2);
  const { ctx, W, H } = fitCanvas($('c0'));
  const A = track(ctx, W, 26, 104, -0.3, 12.6, t('c0a'));
  // finish line of the strip
  ctx.save(); ctx.strokeStyle = C.ghost; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(A.x(L), A.P.t); ctx.lineTo(A.x(L), A.P.b); ctx.stroke(); ctx.restore();
  const now = s0.time === null ? S.tEnd : s0.time, yc = A.y(0.5);
  S.pts.forEach(q => { if (q.t <= now + 1e-9) dot(ctx, A.x(q.x), yc, 6, C.ghost, true); });
  const xNow = Math.min(M.glidePos(mu, Math.min(now, S.tEnd)), L);
  dot(ctx, A.x(xNow), yc, 7.5, C.cyan);
  if (!S.stops && now >= S.tEnd - 1e-9) arrow(ctx, A.x(L) + 4, yc, A.x(L) + 18, yc, C.cyan, 2.5);

  const B = panel(ctx, W, { top: 156, bottom: H - 30, xMin: 0, xMax: 0.42, yMin: 0, yMax: 14, yTicks: [0, 4, 8, 12], xTicks: true, xSteps: [0.05, 0.1, 0.2], minPx: 34, title: t('c0b') });
  curve(ctx, B, v => M.glide(v).dStop, 0.02, 0.42, C.orange, { yClip: [0, 14], steps: 300 });
  const plot = (k, col, r) => { const v = Number(k), d = M.glide(v).dStop; if (d > 14) capMark(ctx, B.x(v), B.P.t, col); else dot(ctx, B.x(v), B.y(d), r, col); };
  [...s0.tried].forEach(k => { if (Number(k) !== mu) plot(k, C.text, 3.5); });
  plot(mu.toFixed(2), C.cyan, 5.5);
  let txt;
  if (mu === 0) txt = t('s0readoutZero');
  else if (S.stops) txt = t('s0readout', { mu: mu.toFixed(2), a: fmt(g.a), t: fmt(g.tStop), d: fmt(g.dStop) });
  else { const tx = M.glideExit(mu); txt = t('s0readoutOff', { mu: mu.toFixed(2), a: fmt(g.a), d: fmt(g.dStop, 1), tx: fmt(tx), vx: fmt(M.S0.v0 - g.a * tx) }); }
  $('r0').textContent = txt;
}

/* ---------- step 1: pull harder, accelerate more ---------- */
const s1 = { time: null, tried: new Set(['2']) };
function cartAt(ctx, X, Yground, w, h, color) {
  ctx.save(); ctx.fillStyle = color; ctx.fillRect(X - w / 2, Yground - h - 5, w, h);
  ctx.fillStyle = C.text; [X - w / 3, X + w / 3].forEach(cx => { ctx.beginPath(); ctx.arc(cx, Yground - 4, 3.5, 0, 7); ctx.fill(); });
  ctx.restore();
}
function draw1() {
  const F = num('f1'), m = M.S1.m, a = F / m, x = M.strobe(a, M.S1.dt, M.S1.n);
  $('f1v').textContent = fmt(F, 1);
  const { ctx, W, H } = fitCanvas($('c1'));
  const A = track(ctx, W, 26, 112, -0.5, 9, t('c1a'));
  const now = s1.time === null ? M.S1.n * M.S1.dt : s1.time, Yg = A.P.b - 6;
  x.forEach((v, k) => { if (k * M.S1.dt <= now + 1e-9) dot(ctx, A.x(v), Yg - 14, 5, C.ghost, true); });
  const xNow = 0.5 * a * now * now;
  cartAt(ctx, A.x(xNow), Yg + 4, 30, 18, C.cyan);
  arrow(ctx, A.x(xNow) + 17, Yg - 10, A.x(xNow) + 17 + F / 8 * 60, Yg - 10, C.orange, 3);

  const B = panel(ctx, W, { top: 166, bottom: H - 30, xMin: 0, xMax: 8.4, yMin: 0, yMax: 4.5, yTicks: [0, 1, 2, 3, 4], xTicks: true, xSteps: [1, 2, 4], title: t('c1b') });
  const pts = [...s1.tried].map(Number).map(f => { const xs = M.strobe(f / m, M.S1.dt, M.S1.n); return [f, M.aFromStrobe(xs, M.S1.dt)]; });
  const nz = pts.filter(p => p[0] > 0), k = M.slopeThroughOrigin(nz);
  if (nz.length >= 2) curve(ctx, B, v => k * v, 0, 8.4, C.ghost, { dash: [6, 4], lw: 1.5, steps: 2 });
  pts.forEach(([f, aa]) => { if (f !== F) dot(ctx, B.x(f), B.y(aa), 3.5, C.text); });
  dot(ctx, B.x(F), B.y(M.aFromStrobe(x, M.S1.dt)), 5.5, C.cyan);
  const gp = M.gaps(x), inc = gp[1] - gp[0];
  let txt = t('s1readout', { F: fmt(F, 1), gaps: gp.map(v => fmt(v, 3)).join(' / '), inc: fmt(inc, 3), a: fmt(M.aFromStrobe(x, M.S1.dt)) });
  txt += ' ' + (nz.length >= 2 ? t('s1fit', { n: pts.length, k: fmt(k, 3), m: fmt(1 / k) }) : t('s1fitOne'));
  $('r1').textContent = txt;
}

/* ---------- step 2: same pull, different mass ---------- */
const s2 = { tried: new Set(['1']) };
function draw2() {
  const m = num('m2'), F = M.S2.F, x = M.strobe(F / m, M.S2.dt, M.S2.n), aMeas = M.aFromStrobe(x, M.S2.dt);
  $('m2v').textContent = fmt(m);
  let { ctx, W, H } = fitCanvas($('c2'));
  const A = track(ctx, W, 26, 112, -0.4, 7, t('c2a'));
  const Yg = A.P.b - 6;
  x.forEach(v => dot(ctx, A.x(v), Yg - 14, 5, C.ghost, true));
  const cw = 22 + 6 * m;
  cartAt(ctx, A.x(x[x.length - 1]), Yg + 4, cw, 14 + 2 * m, C.cyan);
  arrow(ctx, A.x(x[x.length - 1]) + cw / 2 + 2, Yg - 10, A.x(x[x.length - 1]) + cw / 2 + 47, Yg - 10, C.orange, 3);

  ({ ctx, W, H } = fitCanvas($('c2b')));
  const B = panel(ctx, W, { top: 26, bottom: H - 30, xMin: 0, xMax: 4.2, yMin: 0, yMax: 13, yTicks: [0, 4, 8, 12], xTicks: true, xSteps: [0.5, 1, 2], title: t('c2b') });
  curve(ctx, B, v => F / v, 0.45, 4.2, C.orange, { yClip: [0, 13.5] });
  const tried = [...s2.tried].map(Number);
  tried.forEach(v => { if (v !== m) dot(ctx, B.x(v), B.y(F / v), 3.5, C.text); });
  dot(ctx, B.x(m), B.y(aMeas), 5.5, C.cyan);

  ({ ctx, W, H } = fitCanvas($('c2c')));
  const D = panel(ctx, W, { top: 26, bottom: H - 30, xMin: 0, xMax: 2.1, yMin: 0, yMax: 13, yTicks: [0, 4, 8, 12], xTicks: true, xSteps: [0.25, 0.5, 1], title: t('c2c') });
  curve(ctx, D, v => F * v, 0, 2.1, C.orange, { steps: 2 });
  tried.forEach(v => { if (v !== m) dot(ctx, D.x(1 / v), D.y(F / v), 3.5, C.text); });
  dot(ctx, D.x(1 / m), D.y(aMeas), 5.5, C.cyan);
  $('r2').textContent = t('s2readout', { m: fmt(m), a: fmt(aMeas), ma: fmt(m * aMeas), m2: fmt(2 * m), a2: fmt(F / (2 * m)) });
}

/* ---------- step 3: push a crate against friction ---------- */
const s3 = { tried: new Set(['15']) };
function draw3() {
  const F = num('f3'), r = M.crate(F), S = M.S3;
  $('f3v').textContent = fmt(F, 1);
  let { ctx, W, H } = fitCanvas($('c3'));
  const A = track(ctx, W, 26, 150, -2.4, 9, t('c3a'), C.floor);
  // one force scale for all three arrows, chosen so a 40 N push still fits left of the crate at x = 0
  const Yg = A.P.b, x = M.strobe(r.a, S.dt, S.n), xe = x[x.length - 1], bw = 34, bh = 30, sc = Math.min(80, A.x(0) - bw / 2 - 10) / 40;
  if (r.moving) x.slice(0, -1).forEach(v => { ctx.save(); ctx.strokeStyle = C.ghost; ctx.setLineDash([3, 3]); ctx.strokeRect(A.x(v) - bw / 2, Yg - bh, bw, bh); ctx.restore(); });
  const X = A.x(xe);
  ctx.save(); ctx.fillStyle = '#a67c52'; ctx.fillRect(X - bw / 2, Yg - bh, bw, bh); ctx.strokeStyle = '#d4a373'; ctx.strokeRect(X - bw / 2, Yg - bh, bw, bh); ctx.restore();
  arrow(ctx, X - bw / 2 - 4 - F * sc, Yg - bh / 2, X - bw / 2 - 4, Yg - bh / 2, C.orange, 3); // push, applied at the back face
  arrow(ctx, X, Yg - 3, X - r.f * sc, Yg - 3, C.pink, 3); // friction along the floor, pointing back
  if (r.net > 0) arrow(ctx, X, Yg - bh - 12, X + r.net * sc, Yg - bh - 12, C.green, 3);

  ({ ctx, W, H } = fitCanvas($('c3b')));
  const B = panel(ctx, W, { top: 26, bottom: H - 30, xMin: 0, xMax: 41, yMin: 0, yMax: 30, yTicks: [0, 10, 20, 30], xTicks: true, xSteps: [5, 10, 20], title: t('c3b') });
  curve(ctx, B, v => M.crate(v).f, 0, S.muS * S.m * M.G, C.orange, { steps: 2 });
  curve(ctx, B, () => r.fk, S.muS * S.m * M.G + 1e-6, 41, C.orange, { steps: 2 });
  ctx.save(); ctx.strokeStyle = C.orange; ctx.globalAlpha = 0.5; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(B.x(r.fsMax), B.y(r.fsMax)); ctx.lineTo(B.x(r.fsMax), B.y(r.fk)); ctx.stroke(); ctx.restore();
  const tried = [...s3.tried].map(Number);
  tried.forEach(v => { if (v !== F) dot(ctx, B.x(v), B.y(M.crate(v).f), 3.5, C.text); });
  dot(ctx, B.x(F), B.y(r.f), 5.5, C.pink);

  ({ ctx, W, H } = fitCanvas($('c3c')));
  const D = panel(ctx, W, { top: 26, bottom: H - 30, xMin: 0, xMax: 41, yMin: 0, yMax: 4.5, yTicks: [0, 1, 2, 3, 4], xTicks: true, xSteps: [5, 10, 20], title: t('c3c') });
  curve(ctx, D, () => 0, 0, r.fsMax, C.orange, { steps: 2 });
  curve(ctx, D, v => M.crate(v).a, r.fsMax + 1e-6, 41, C.orange, { steps: 2 });
  tried.forEach(v => { if (v !== F) dot(ctx, D.x(v), D.y(M.crate(v).a), 3.5, C.text); });
  dot(ctx, D.x(F), D.y(r.a), 5.5, C.green);
  $('r3').textContent = r.moving ? t('s3readMove', { F: fmt(F, 1), f: fmt(r.f, 1), net: fmt(r.net), a: fmt(r.a) }) : t('s3readStill', { F: fmt(F, 1), f: fmt(r.f, 1) });
}

/* ---------- step 4: cart pulled by a hanging mass ---------- */
const s4 = { slide: 0, tried: new Set(['0.2']) };
function draw4() {
  const m1 = num('m14'), m2 = num('m24'), h = M.hanger(m1, m2);
  $('m14v').textContent = fmt(m1, 1); $('m24v').textContent = fmt(m2);
  let { ctx, W, H } = fitCanvas($('c4'));
  title(ctx, t('c4a'), 8, 17, W - 16);
  const tableY = 96, px = W - 84, pr = 11, travel = 50, d = s4.slide * travel;
  ctx.save(); ctx.fillStyle = C.floor; ctx.fillRect(10, tableY, px - 10, 12); ctx.restore();
  // pulley
  ctx.save(); ctx.strokeStyle = C.ghost; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(px, tableY - pr + 2, pr, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(px, tableY - pr + 2); ctx.lineTo(px - 4, tableY + 12); ctx.stroke(); ctx.restore();
  const cw = 48 + 8 * m1, ch = 26, cx = Math.max(16 + cw / 2, px - 70 - travel - cw / 2) + d;
  cartAt(ctx, cx, tableY, cw, ch, C.cyan);
  const sy = tableY - pr * 2 + 2, hx = px + pr, hy = 124 + d, hs = 14 + 10 * Math.sqrt(m2);
  ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(cx + cw / 2, sy); ctx.lineTo(px, sy); ctx.arc(px, tableY - pr + 2, pr, -Math.PI / 2, 0); ctx.lineTo(hx, hy); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.fillStyle = C.orange; ctx.globalAlpha = 0.85; ctx.fillRect(hx - hs / 2, hy, hs, hs); ctx.restore();
  const L = 72; // m₂g arrow length; the others are scaled to it
  arrow(ctx, hx, hy + hs + 2, hx, hy + hs + 2 + L, C.orange, 3);
  // forces on the hanging mass, drawn beside it (right of the rope) so they never cross the pulley
  arrow(ctx, hx + hs / 2 + 9, hy + hs / 2, hx + hs / 2 + 9, hy + hs / 2 - L * h.ratio, C.violet, 3);
  arrow(ctx, hx + hs / 2 + 24, hy + hs / 2, hx + hs / 2 + 24, hy + hs / 2 + L * (1 - h.ratio), C.green, 3);
  arrow(ctx, cx + cw / 2 + 2, sy - 9, cx + cw / 2 + 2 + L * h.ratio, sy - 9, C.violet, 3);

  ({ ctx, W, H } = fitCanvas($('c4b')));
  const B = panel(ctx, W, { top: 26, bottom: H - 30, xMin: 0, xMax: 2.1, yMin: 0, yMax: 10.5, yTicks: [0, 2, 4, 6, 8, 10], xTicks: true, xSteps: [0.25, 0.5, 1], title: t('c4b') });
  hline(ctx, B, M.G, C.ghost);
  curve(ctx, B, v => M.hanger(m1, v).a, 0, 2.1, C.orange);
  [...s4.tried].map(Number).forEach(v => { if (v !== m2) dot(ctx, B.x(v), B.y(M.hanger(m1, v).a), 3.5, C.text); });
  dot(ctx, B.x(m2), B.y(h.a), 5.5, C.cyan);
  $('r4').textContent = t('s4readout', { W: fmt(h.W2), M: fmt(m1 + m2), a: fmt(h.a), T: fmt(h.T), pct: fmt(h.ratio * 100, 1), net: fmt(h.netHanger) });
}

/* ---------- step 5: a spring pushes two carts apart ---------- */
const s5 = { time: null };
function draw5() {
  const m1 = num('m15'), m2 = num('m25'), s = M.springApart(m1, m2), T = M.S5.tMax;
  $('m15v').textContent = fmt(m1); $('m25v').textContent = fmt(m2);
  const now = s5.time === null ? T : s5.time, st = s.at(now);
  let { ctx, W, H } = fitCanvas($('c5'));
  const A = track(ctx, W, 26, 104, -1.2, 1.2, t('c5a'), C.ice, -1.2);
  const Yg = A.P.b - 4, w1 = 24 + 6 * m1, w2 = 24 + 6 * m2, h1 = 16 + 2 * m1, h2 = 16 + 2 * m2;
  const face1 = x1 => A.x(x1 - 0.05), face2 = x2 => A.x(x2 + 0.05);
  for (let tg = 0.05; tg < now - 1e-9; tg += 0.05) { // faint strobe outlines every 0.05 s
    const q = s.at(tg);
    ctx.save(); ctx.globalAlpha = 0.35; ctx.strokeStyle = C.cyan; ctx.strokeRect(face1(q.x1) - w1, Yg - h1, w1, h1); ctx.strokeStyle = C.orange; ctx.strokeRect(face2(q.x2), Yg - h2, w2, h2); ctx.restore();
  }
  ctx.save(); ctx.fillStyle = C.cyan; ctx.fillRect(face1(st.x1) - w1, Yg - h1, w1, h1); ctx.fillStyle = C.orange; ctx.fillRect(face2(st.x2), Yg - h2, w2, h2); ctx.restore();
  // spring: between the faces while compressed, then riding on the left cart at natural length 0.2 m
  const sx0 = face1(st.x1), sx1 = now < s.tRel ? face2(st.x2) : A.x(st.x1 - 0.05 + 0.2), sy = Yg - 8;
  ctx.save(); ctx.strokeStyle = C.ghost; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(sx0, sy);
  for (let i = 1; i <= 8; i++) ctx.lineTo(sx0 + (sx1 - sx0) * i / 8, sy + (i === 8 ? 0 : (i % 2 ? -5 : 5)));
  ctx.stroke(); ctx.restore();

  ({ ctx, W, H } = fitCanvas($('c5b')));
  const B = panel(ctx, W, { top: 26, bottom: H - 30, xMin: 0, xMax: T, yMin: -45, yMax: 45, yTicks: [-40, -20, 0, 20, 40], xTicks: true, xSteps: [0.05, 0.1], minPx: 36, title: t('c5b') });
  curve(ctx, B, v => s.at(v).F2, 0, Math.min(now, T), C.orange, { steps: 300, lw: 2.2 });
  curve(ctx, B, v => s.at(v).F1, 0, Math.min(now, T), C.cyan, { steps: 300, lw: 2.2 });
  ({ ctx, W, H } = fitCanvas($('c5c')));
  const D = panel(ctx, W, { top: 26, bottom: H - 30, xMin: 0, xMax: T, yMin: -3.2, yMax: 3.2, yTicks: [-3, -2, -1, 0, 1, 2, 3], xTicks: true, xSteps: [0.05, 0.1], minPx: 36, title: t('c5c') });
  curve(ctx, D, v => s.at(v).v2, 0, Math.min(now, T), C.orange, { steps: 300, lw: 2.2 });
  curve(ctx, D, v => s.at(v).v1, 0, Math.min(now, T), C.cyan, { steps: 300, lw: 2.2 });
  const prog = s5.time === null || now >= T ? '' : t('s5progress', { t: now.toFixed(2) });
  $('r5').textContent = t('s5readout', { prog, tr: fmt(s.tRel, 3), Fp: fmt(s.Fpeak), v1: fmt(s.v1), v2: fmt(s.v2), ratio: fmt(Math.abs(s.v1 / s.v2)), p1: fmt(s.p1), p2: fmt(s.p2), ptot: fmt(s.p1 + s.p2) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  $('mu0').addEventListener('input', () => { stopAnim('s0'); s0.time = null; s0.tried.add(num('mu0').toFixed(2)); draw0(); });
  $('go0').addEventListener('click', () => {
    const S = M.glideStrobe(num('mu0'));
    animate('s0', S.tEnd * 1000, p => { s0.time = p * S.tEnd; draw0(); }, () => { s0.time = null; draw0(); });
  });
  $('clear0').addEventListener('click', () => { s0.tried = new Set([num('mu0').toFixed(2)]); draw0(); });

  $('f1').addEventListener('input', () => { stopAnim('s1'); s1.time = null; s1.tried.add(String(num('f1'))); draw1(); });
  $('go1').addEventListener('click', () => {
    const T = M.S1.n * M.S1.dt;
    animate('s1', T * 1000, p => { s1.time = p * T; draw1(); }, () => { s1.time = null; draw1(); });
  });
  $('clear1').addEventListener('click', () => { s1.tried = new Set([String(num('f1'))]); draw1(); });

  $('m2').addEventListener('input', () => { s2.tried.add(String(num('m2'))); draw2(); });
  $('clear2').addEventListener('click', () => { s2.tried = new Set([String(num('m2'))]); draw2(); });

  $('f3').addEventListener('input', () => { s3.tried.add(String(num('f3'))); draw3(); });
  $('clear3').addEventListener('click', () => { s3.tried = new Set([String(num('f3'))]); draw3(); });

  $('m14').addEventListener('input', () => { stopAnim('s4'); s4.slide = 0; s4.tried = new Set([String(num('m24'))]); draw4(); });
  $('m24').addEventListener('input', () => { stopAnim('s4'); s4.slide = 0; s4.tried.add(String(num('m24'))); draw4(); });
  $('go4').addEventListener('click', () => {
    const a = M.hanger(num('m14'), num('m24')).a, T = Math.sqrt(2 * 0.4 / a); // 0.4 m of travel, real time
    animate('s4', T * 1000, p => { const tt = p * T; s4.slide = 0.5 * a * tt * tt / 0.4; draw4(); });
  });
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked');
    const ok = !!choice && choice.value === 'b';
    $('quizFeedback').textContent = t(ok ? 'correct' : 'wrong');
    $('quizFeedback').style.color = ok ? C.green : C.orange;
    $('quizFeedback').dataset.state = ok ? 'correct' : 'wrong';
  });

  ['m15', 'm25'].forEach(id => $(id).addEventListener('input', () => { stopAnim('s5'); s5.time = null; draw5(); }));
  $('go5').addEventListener('click', () => {
    const T = M.S5.tMax;
    animate('s5', T * 10 * 1000, p => { s5.time = p * T; draw5(); }, () => { s5.time = null; draw5(); });
  });

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
  window.refreshLesson = () => { refresh(); const fb = $('quizFeedback'); if (fb.dataset.state) fb.textContent = t(fb.dataset.state); };
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
