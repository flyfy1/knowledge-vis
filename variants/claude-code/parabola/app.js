'use strict';
// Parabola lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every dot, curve and readout comes from window.PARA_MODEL (model.js). Canvas text is limited to
// panel titles (own row above the plot) and axis ticks (left of / below the plot); legends live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.PARA_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#1f2c3b', axis: '#4f6580', text: '#e8edf4', bg: '#0d1621', ghost: '#8696aa', faint: '#3d5872', faintDot: '#5a7590' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const val = id => Number($(id).value);
const N = (v, d = 2) => M.num(v, d);
const approx = (v, d = 2) => (M.exactAt(v, d) ? '= ' : '≈ ') + N(v, d);

/* ---------- canvas kit ---------- */
// CSS size and backing store kept apart: the CSS height follows the width by a ratio (clamped); the bitmap follows the DPR.
function fitCanvas(canvas, ratio, min, max) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const W = Math.max(240, canvas.clientWidth || 600);
  const H = Math.round(Math.min(max, Math.max(min, W * ratio)));
  if (canvas.style.height !== H + 'px') canvas.style.height = H + 'px';
  if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) { canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H); ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  return { ctx, W, H };
}
function title(ctx, text, X, Y, maxW) {
  let size = 12.5;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
const STEPS = [0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10, 20];
function niceStep(span, px, minPx) { for (const s of STEPS) if (s / span * px >= minPx) return s; return STEPS[STEPS.length - 1]; }
// A plot frame. o: x0, x1, y0, y1, equal (same px per unit; extends x to the right or both ways), title, l, r, t, b.
function frame(ctx, W, H, o) {
  const P = { l: o.l || 38, r: W - (o.r || 12), t: o.t || 30, b: H - (o.b || 26) };
  let { x0, x1, y0, y1 } = o;
  if (o.equal) {
    const sx = (P.r - P.l) / (x1 - x0), sy = (P.b - P.t) / (y1 - y0);
    if (sx > sy) { const span = (P.r - P.l) / sy; if (o.grow === 'right') x1 = x0 + span; else { const c = (x0 + x1) / 2; x0 = c - span / 2; x1 = c + span / 2; } }
    else { const span = (P.b - P.t) / sx; if (o.grow === 'up') y1 = y0 + span; else { const c = (y0 + y1) / 2; y0 = c - span / 2; y1 = c + span / 2; } }
  }
  const X = v => P.l + (v - x0) / (x1 - x0) * (P.r - P.l);
  const Y = v => P.b - (v - y0) / (y1 - y0) * (P.b - P.t);
  const xs = o.xStep || niceStep(x1 - x0, P.r - P.l, 34), ys = o.yStep || niceStep(y1 - y0, P.b - P.t, 26);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textBaseline = 'alphabetic';
  for (let v = Math.ceil(y0 / ys - 1e-9) * ys; v <= y1 + 1e-9; v += ys) {
    const yy = Y(v); ctx.strokeStyle = Math.abs(v) < 1e-9 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, yy); ctx.lineTo(P.r, yy); ctx.stroke();
    if (yy <= P.b - 9 && yy >= P.t + 4) { ctx.textAlign = 'right'; ctx.fillText(N(v), P.l - 6, yy + 4); }
  }
  ctx.textAlign = 'center';
  for (let v = Math.ceil(x0 / xs - 1e-9) * xs; v <= x1 + 1e-9; v += xs) {
    const xx = X(v); ctx.strokeStyle = Math.abs(v) < 1e-9 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(xx, P.t); ctx.lineTo(xx, P.b); ctx.stroke();
    const s = N(v), w = ctx.measureText(s).width;
    if (xx - w / 2 >= 2 && xx + w / 2 <= W - 2) ctx.fillText(s, xx, P.b + 15);
  }
  ctx.strokeStyle = C.axis; ctx.strokeRect(P.l, P.t, P.r - P.l, P.b - P.t);
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 10, W - 16);
  const clip = () => { ctx.save(); ctx.beginPath(); ctx.rect(P.l, P.t, P.r - P.l, P.b - P.t); ctx.clip(); };
  return { X, Y, P, x0, x1, y0, y1, clip, unclip: () => ctx.restore() };
}
function plotFn(ctx, F, fn, a, b, { color = C.cyan, lw = 2.4, dash = null, alpha = 1 } = {}) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = alpha; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); const n = 240;
  for (let i = 0; i <= n; i++) { const x = a + (b - a) * i / n, y = fn(x), Yc = Math.max(-1e4, Math.min(1e4, F.Y(y))); if (!i) ctx.moveTo(F.X(x), Yc); else ctx.lineTo(F.X(x), Yc); }
  ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, r, color, ring = false) {
  ctx.save(); ctx.beginPath(); ctx.arc(X, Y, r, 0, 7);
  if (ring) { ctx.fillStyle = C.bg; ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth = 2.2; ctx.stroke(); } else { ctx.fillStyle = color; ctx.fill(); }
  ctx.restore();
}
function line(ctx, x0, y0, x1, y1, color, lw = 1.5, dash = null) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.restore();
}

/* ---------- animation runner (reduced motion: jump to the end; hidden page: finish and stop) ---------- */
const anims = {};
function animate(name, ms, frameFn, done) {
  stopAnim(name);
  if (reduceMotion()) { frameFn(1); if (done) done(); return; }
  const start = performance.now();
  const tick = now => { const p = Math.min(1, (now - start) / ms); frameFn(p); if (p < 1) anims[name].id = requestAnimationFrame(tick); else { delete anims[name]; if (done) done(); } };
  anims[name] = { id: requestAnimationFrame(tick), frameFn, done };
}
function stopAnim(name) { if (anims[name]) { cancelAnimationFrame(anims[name].id); delete anims[name]; } }
function finishAll() { Object.keys(anims).forEach(k => { const a = anims[k]; cancelAnimationFrame(a.id); delete anims[k]; a.frameFn(1); if (a.done) a.done(); }); }

/* ---------- step 0: the dots of one shot ---------- */
const SHOT = M.DEFAULT_SHOT, DOTS = M.shotDots(SHOT), RISES = M.rises(DOTS), PEAK = M.peak(SHOT);
function draw0() {
  const tt = val('t0'), c = Math.round(tt / M.DT) + 1;
  $('t0v').textContent = tt.toFixed(1) + ' s';
  let { ctx, W, H } = fitCanvas($('c0'), 0.55, 240, 440);
  const F = frame(ctx, W, H, { x0: -0.4, x1: 7, y0: 0, y1: 5, title: t('c0a') });
  F.clip();
  line(ctx, F.X(0), F.Y(0), F.X(0), F.Y(M.RELEASE), C.ghost, 2);
  const shown = DOTS.slice(0, c);
  ctx.save(); ctx.strokeStyle = C.faint; ctx.lineWidth = 1.4; ctx.beginPath(); shown.forEach((d, i) => { if (!i) ctx.moveTo(F.X(d.x), F.Y(d.y)); else ctx.lineTo(F.X(d.x), F.Y(d.y)); }); ctx.stroke(); ctx.restore();
  if (tt >= PEAK.t) { line(ctx, F.X(PEAK.x), F.Y(0), F.X(PEAK.x), F.Y(PEAK.y), C.green, 1.2, [4, 4]); dot(ctx, F.X(PEAK.x), F.Y(PEAK.y), 6, C.green, true); }
  shown.forEach((d, i) => dot(ctx, F.X(d.x), F.Y(d.y), i === c - 1 ? 6 : 4, C.orange));
  F.unclip();

  ({ ctx, W, H } = fitCanvas($('c0b'), 0.28, 170, 240));
  const B = frame(ctx, W, H, { x0: 0, x1: 1.7, y0: -0.9, y1: 0.75, xStep: 0.5, yStep: 0.4, title: t('c0b') });
  B.clip();
  const bw = Math.max(3, (B.X(0.1) - B.X(0)) * 0.7);
  RISES.forEach((r, i) => {
    const X = B.X((i + 0.5) * M.DT), on = i < c - 1;
    ctx.globalAlpha = on ? 1 : 0.12; ctx.fillStyle = r >= 0 ? C.cyan : C.pink;
    ctx.fillRect(X - bw / 2, Math.min(B.Y(0), B.Y(r)), bw, Math.abs(B.Y(r) - B.Y(0)));
  });
  ctx.globalAlpha = 1;
  if (c >= 3) line(ctx, B.X(0.05), B.Y(RISES[0]), B.X((RISES.length - 0.5) * M.DT), B.Y(RISES[RISES.length - 1]), C.text, 1, [3, 4]);
  if (tt >= PEAK.t) line(ctx, B.X(PEAK.t), B.P.t, B.X(PEAK.t), B.P.b, C.green, 1.2, [4, 4]);
  B.unclip();

  const d = shown[c - 1], drop = RISES[0] - RISES[1];
  const last = c >= 3 ? t(RISES[c - 2] >= 0 ? 's0last' : 's0lastDown', { r: N(Math.abs(RISES[c - 2]), 3), d: N(RISES[c - 3] - RISES[c - 2], 3) }) : c === 2 ? t('s0last1', { r: N(RISES[0], 3) }) : t('s0first');
  $('r0').textContent = t('s0readout', { prog: t('s0progress', { c, N: DOTS.length }), t: tt.toFixed(1), x: N(d.x), y: N(d.y), last });
  $('r0b').textContent = c >= 3 ? t('s0rule', { d: N(drop, 3), r0: N(RISES[0], 3) }) : '';
  $('r0c').innerHTML = tt >= PEAK.t ? t('s0peak', { pt: N(PEAK.t), px: N(PEAK.x), py: N(PEAK.y) }) : '';
}

/* ---------- step 1: y = a·x² ---------- */
const s1 = { hist: new Set([1]) };
const a1 = () => M.A1_CHOICES[val('a1')];
function draw1() {
  const a = a1(); s1.hist.add(a);
  $('a1v').textContent = N(a);
  const eq = M.equation(a, 0, 0);
  const { ctx, W, H } = fitCanvas($('c1'), 0.6, 280, 470);
  const F = frame(ctx, W, H, { x0: -3.5, x1: 3.5, y0: -10, y1: 10, title: t('c1', { eq }) });
  F.clip();
  [...s1.hist].forEach(v => { if (v !== a && v !== 0) plotFn(ctx, F, x => v * x * x, F.x0, F.x1, { color: C.faint, lw: 1.5 }); });
  plotFn(ctx, F, x => x * x, F.x0, F.x1, { color: C.ghost, lw: 1.5, dash: [5, 5] });
  plotFn(ctx, F, x => a * x * x, F.x0, F.x1, { color: C.cyan, lw: 2.8 });
  // staircase: one unit right, then the climb
  ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(F.X(0), F.Y(0));
  for (let i = 1; i <= 3; i++) { ctx.lineTo(F.X(i), F.Y(a * (i - 1) * (i - 1))); ctx.lineTo(F.X(i), F.Y(a * i * i)); }
  ctx.stroke(); ctx.restore();
  for (let i = 1; i <= 3; i++) dot(ctx, F.X(i), F.Y(a * i * i), 4, C.orange);
  dot(ctx, F.X(0), F.Y(0), 5.5, C.green, true);
  F.unclip();
  if (a === 0) { $('r1').textContent = t('s1zero'); return; }
  const r = M.stepRises(a), open = t(a > 0 ? 'up' : 'down');
  const shape = t(Math.abs(a) < 1 ? 'fatter' : Math.abs(a) > 1 ? 'thinner' : 'same', { open });
  $('r1').textContent = t('s1readout', { eq, y1: N(a), y2: N(4 * a), y3: N(9 * a), r1: N(r[0]), r2: N(r[1]), r3: N(r[2]), dd: N(2 * a), shape });
}

/* ---------- step 2: vertex form ---------- */
const s2 = { trail: [] };
function draw2() {
  const h = val('h2'), k = val('k2'), a = M.A_CHOICES[val('a2')];
  $('h2v').textContent = N(h); $('k2v').textContent = N(k); $('a2v').textContent = N(a);
  const key = h + ',' + k; if (!s2.trail.includes(key)) { s2.trail.push(key); if (s2.trail.length > 40) s2.trail.shift(); }
  const eq = M.equation(a, h, k);
  const { ctx, W, H } = fitCanvas($('c2'), 0.6, 290, 470);
  const F = frame(ctx, W, H, { x0: -7, x1: 7, y0: -7, y1: 9, title: t('c2', { eq }) });
  F.clip();
  s2.trail.forEach(s => { const [th, tk] = s.split(',').map(Number); if (th !== h || tk !== k) dot(ctx, F.X(th), F.Y(tk), 3, C.faintDot); });
  plotFn(ctx, F, x => a * x * x, F.x0, F.x1, { color: C.ghost, lw: 1.5, dash: [5, 5] });
  line(ctx, F.X(h), F.P.t, F.X(h), F.P.b, C.orange, 1.4, [6, 5]);
  plotFn(ctx, F, x => M.f(a, h, k, x), F.x0, F.x1, { color: C.cyan, lw: 2.8 });
  if (h !== 0 || k !== 0) {
    const X0 = F.X(0), Y0 = F.Y(0), X1 = F.X(h), Y1 = F.Y(k), ang = Math.atan2(Y1 - Y0, X1 - X0), L = Math.hypot(X1 - X0, Y1 - Y0);
    if (L > 16) { line(ctx, X0, Y0, X1 - 9 * Math.cos(ang), Y1 - 9 * Math.sin(ang), C.text, 1.6); ctx.save(); ctx.fillStyle = C.text; ctx.translate(X1 - 7 * Math.cos(ang), Y1 - 7 * Math.sin(ang)); ctx.rotate(ang); ctx.beginPath(); ctx.moveTo(2, 0); ctx.lineTo(-8, -5); ctx.lineTo(-8, 5); ctx.closePath(); ctx.fill(); ctx.restore(); }
  }
  const ym = M.f(a, h, k, h + 2);
  line(ctx, F.X(h - 2), F.Y(ym), F.X(h + 2), F.Y(ym), C.green, 1.2, [3, 4]);
  dot(ctx, F.X(h - 2), F.Y(ym), 5, C.green); dot(ctx, F.X(h + 2), F.Y(ym), 5, C.green);
  dot(ctx, F.X(h), F.Y(k), 6, C.green, true);
  F.unclip();
  $('r2').textContent = t('s2readout', { eq, h: N(h), k: N(k), xl: N(h - 2), xr: N(h + 2), ym: N(ym), open: t(a > 0 ? 'up' : 'down'), ext: t(a > 0 ? 'lowest' : 'highest') });
}

/* ---------- step 3: crossings ---------- */
const s3 = { sign: 1, tried: new Set([-2]) };
function draw3() {
  const h = val('h3'), k = val('k3'), a = M.A_CHOICES[val('a3')];
  $('h3v').textContent = N(h); $('k3v').textContent = N(k); $('a3v').textContent = N(a);
  if (Math.sign(a) !== s3.sign) { s3.sign = Math.sign(a); s3.tried = new Set(); }
  s3.tried.add(k);
  const eq = M.equation(a, h, k), cr = M.crossings(a, h, k);
  let { ctx, W, H } = fitCanvas($('c3'), 0.75, 260, 430);
  const F = frame(ctx, W, H, { x0: -6, x1: 6, y0: -6, y1: 6, title: t('c3a', { eq }) });
  F.clip();
  line(ctx, F.P.l, F.Y(0), F.P.r, F.Y(0), C.text, 1.6);
  plotFn(ctx, F, x => M.f(a, h, k, x), F.x0, F.x1, { color: C.cyan, lw: 2.8 });
  dot(ctx, F.X(h), F.Y(k), 6, C.green, true);
  cr.xs.forEach(x => dot(ctx, F.X(x), F.Y(0), 6, C.orange));
  F.unclip();

  const stacked = window.innerWidth <= 640, Hb = parseFloat($('c3').style.height) || H;
  ({ ctx, W, H } = stacked ? fitCanvas($('c3b'), 0.5, 190, 240) : fitCanvas($('c3b'), 0, Hb, Hb));
  const B = frame(ctx, W, H, { x0: -4.5, x1: 4.5, y0: -0.4, y1: 2.6, yStep: 1, xStep: 2, l: 26, title: t('c3b') });
  B.clip();
  const cnt = kk => M.crossings(a, h, kk).count;
  ctx.save(); ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.beginPath();
  const kz = 0, left = cnt(-1), right = cnt(1);
  ctx.moveTo(B.X(-4.5), B.Y(left)); ctx.lineTo(B.X(kz), B.Y(left)); ctx.moveTo(B.X(kz), B.Y(right)); ctx.lineTo(B.X(4.5), B.Y(right)); ctx.stroke(); ctx.restore();
  dot(ctx, B.X(0), B.Y(1), 4, C.faint);
  [...s3.tried].forEach(kk => { if (kk !== k) dot(ctx, B.X(kk), B.Y(cnt(kk)), 3.6, C.text); });
  dot(ctx, B.X(k), B.Y(cr.count), 6, C.orange);
  B.unclip();

  const side = t(k > 0 ? 'above' : 'below'), open = t(a > 0 ? 'up' : 'down');
  let html;
  if (cr.count === 2) html = t('s3two', { x1: approx(cr.xs[0]), x2: approx(cr.xs[1]), side, k: N(k), open, h: N(h) });
  else if (cr.count === 1) html = t('s3one', { x1: N(cr.xs[0]) });
  else html = t('s3zero', { side, k: N(k), open });
  $('r3').innerHTML = html;
}

/* ---------- step 4: the shot in vertex form ---------- */
const s4 = { old: [], last: null };
function draw4() {
  const s = { vx: val('vx'), vy: val('vy') };
  $('vxv').textContent = s.vx.toFixed(1); $('vyv').textContent = s.vy.toFixed(1);
  const key = s.vx.toFixed(1) + ',' + s.vy.toFixed(1);
  if (s4.last && s4.last !== key && !s4.old.includes(s4.last)) { s4.old.push(s4.last); if (s4.old.length > 6) s4.old.shift(); }
  s4.last = key;
  const vf = M.shotVertexForm(s), cr = M.crossings(vf.a, vf.h, vf.k), land = cr.xs[1], back = cr.xs[0], j = M.judgeShot(s);
  const { ctx, W, H } = fitCanvas($('c4'), 0.55, 250, 440);
  const F = frame(ctx, W, H, { x0: -1.6, x1: 10, y0: -0.3, y1: 6, title: t('c4') });
  F.clip();
  s4.old.forEach(k => { if (k === key) return; const [vx, vy] = k.split(',').map(Number); const o = { vx, vy }, L = M.crossings(M.shotVertexForm(o).a, M.shotVertexForm(o).h, M.shotVertexForm(o).k).xs[1]; plotFn(ctx, F, x => M.heightAtX(o, x), 0, L, { color: C.faint, lw: 1.6 }); });
  plotFn(ctx, F, x => M.f(vf.a, vf.h, vf.k, x), F.x0, 0, { color: C.ghost, lw: 1.4, dash: [5, 5] });
  plotFn(ctx, F, x => M.f(vf.a, vf.h, vf.k, x), land, F.x1, { color: C.ghost, lw: 1.4, dash: [5, 5] });
  line(ctx, F.X(0), F.Y(0), F.X(0), F.Y(M.RELEASE), C.ghost, 2);
  // hoop: rim seen from the side, plus backboard
  const hx = M.HOOP_X;
  line(ctx, F.X(hx + 0.23), F.Y(M.RIM - 0.15), F.X(hx + 0.23), F.Y(M.RIM + 0.9), C.muted, 2.4);
  line(ctx, F.X(hx - 0.23), F.Y(M.RIM), F.X(hx + 0.23), F.Y(M.RIM), C.pink, 3);
  plotFn(ctx, F, x => M.heightAtX(s, x), 0, land, { color: C.cyan, lw: 2.8 });
  line(ctx, F.X(vf.h), F.Y(0), F.X(vf.h), F.Y(vf.k), C.green, 1.2, [4, 4]);
  dot(ctx, F.X(vf.h), F.Y(vf.k), 6, C.green, true);
  dot(ctx, F.X(land), F.Y(0), 6, C.orange);
  dot(ctx, F.X(hx), F.Y(j.y), 4, j.made ? C.green : C.text);
  F.unclip();
  let verdict;
  if (!j.falling) verdict = t('rising', { y: N(j.y) });
  else if (j.made) verdict = t('made', { hx: N(hx), y: N(j.y) });
  else verdict = t(j.miss > 0 ? 'high' : 'low', { y: N(j.y), d: N(Math.abs(j.miss)) });
  $('r4').textContent = t('s4readout', { eq: M.equation(vf.a, vf.h, vf.k, 2, 3), px: N(vf.h), py: N(vf.k), land: N(land), back: N(back), verdict });
}

/* ---------- step 5: quiz ---------- */
const s5 = { down: false };
function drawQuiz() {
  const Q = M.QUIZ.q1;
  let { ctx, W, H } = fitCanvas($('c5'), 0.5, 230, 360);
  let F = frame(ctx, W, H, { x0: -5, x1: 5, y0: -5, y1: 4, xStep: 1, yStep: 1, title: t('c5a') });
  F.clip(); plotFn(ctx, F, x => M.f(Q.a, Q.h, Q.k, x), F.x0, F.x1, { color: C.cyan, lw: 2.8 }); dot(ctx, F.X(Q.h), F.Y(Q.k), 5.5, C.green, true); F.unclip();
  const h = val('h5'), k = val('k5'), a = s5.down ? -1 : 1;
  $('h5v').textContent = N(h); $('k5v').textContent = N(k);
  $('up5').setAttribute('aria-pressed', String(!s5.down)); $('down5').setAttribute('aria-pressed', String(s5.down));
  ({ ctx, W, H } = fitCanvas($('c5b'), 0.5, 220, 340));
  F = frame(ctx, W, H, { x0: -5, x1: 5, y0: -5, y1: 5, xStep: 1, yStep: 1, title: t('c5b') + '　' + M.equation(a, h, k) });
  F.clip(); plotFn(ctx, F, x => M.f(a, h, k, x), F.x0, F.x1, { color: C.orange, lw: 2.6 }); dot(ctx, F.X(h), F.Y(k), 5.5, C.green, true); F.unclip();
}
function feedback(id, ok, text) { const el = $(id); el.textContent = text; el.style.color = ok ? C.green : C.orange; el.dataset.state = ok ? 'correct' : 'wrong'; }
function clearFb(id) { const el = $(id); el.textContent = ''; delete el.dataset.state; }
function radio(name) { const c = document.querySelector(`input[name="${name}"]:checked`); return c ? c.value : null; }
function checkQ2() {
  const h = val('h5'), k = val('k5'), a = s5.down ? -1 : 1, T = M.QUIZ.q2, eq = M.equation(a, h, k);
  const ok = h === T.h && k === T.k && s5.down === T.down;
  feedback('q2fb', ok, ok ? t('q2ok', { eq }) : t('q2no', { eq, h: N(h), k: N(k), open: t(s5.down ? 'down' : 'up') }));
}

function refresh() {
  draw0(); draw1(); draw2(); draw3(); draw4(); drawQuiz();
  // keep any shown quiz feedback in the current language
  [['q1fb', () => (radio('q1') ? feedback('q1fb', radio('q1') === 'a', t(radio('q1') === 'a' ? 'q1ok' : 'q1no')) : null)],
   ['q2fb', checkQ2],
   ['q3fb', () => (radio('q3') ? feedback('q3fb', radio('q3') === 'b', t(radio('q3') === 'b' ? 'q3ok' : 'q3no')) : null)]]
    .forEach(([id, fn]) => { if ($(id).dataset.state) fn(); else if ($(id).textContent) $(id).textContent = t('pick'); });
}

function setup() {
  $('t0').addEventListener('input', () => { stopAnim('s0'); draw0(); });
  $('play0').addEventListener('click', () => {
    const n = DOTS.length;
    $('t0').value = '0'; draw0();
    animate('s0', n * 320, p => { const i = Math.min(n - 1, Math.floor(p * n)); $('t0').value = (i * M.DT).toFixed(1); draw0(); });
  });
  $('a1').addEventListener('input', draw1);
  ['h2', 'k2', 'a2'].forEach(id => $(id).addEventListener('input', draw2));
  ['h3', 'k3', 'a3'].forEach(id => $(id).addEventListener('input', draw3));
  ['vx', 'vy'].forEach(id => $(id).addEventListener('input', draw4));
  $('reset4').addEventListener('click', () => { $('vx').value = M.DEFAULT_SHOT.vx; $('vy').value = M.DEFAULT_SHOT.vy; draw4(); });
  ['h5', 'k5'].forEach(id => $(id).addEventListener('input', () => { clearFb('q2fb'); drawQuiz(); }));
  $('up5').addEventListener('click', () => { s5.down = false; clearFb('q2fb'); drawQuiz(); });
  $('down5').addEventListener('click', () => { s5.down = true; clearFb('q2fb'); drawQuiz(); });
  $('q1check').addEventListener('click', () => { const v = radio('q1'); if (!v) { clearFb('q1fb'); $('q1fb').textContent = t('pick'); return; } feedback('q1fb', v === 'a', t(v === 'a' ? 'q1ok' : 'q1no')); });
  $('q2check').addEventListener('click', checkQ2);
  $('q3check').addEventListener('click', () => { const v = radio('q3'); if (!v) { clearFb('q3fb'); $('q3fb').textContent = t('pick'); return; } feedback('q3fb', v === 'b', t(v === 'b' ? 'q3ok' : 'q3no')); });
  document.querySelectorAll('input[name="q1"]').forEach(r => r.addEventListener('change', () => clearFb('q1fb')));
  document.querySelectorAll('input[name="q3"]').forEach(r => r.addEventListener('change', () => clearFb('q3fb')));

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
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
