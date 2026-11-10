'use strict';
// Gradient descent lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every point, curve and readout comes from window.GD_MODEL (model.js). Canvas text is limited to
// panel titles and axis ticks laid out in fixed rows; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.GD_MODEL;
const t = (...a) => window.GD_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', ghost: '#8696aa', contour: '#2f4760' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros only after a decimal point (toFixed(0) "90" stays "90"); show −0 as 0.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d); return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s; };
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const pow10 = p => p === 0 ? '1' : p === 1 ? '10' : '10' + String(p).split('').map(c => SUP[c]).join('');

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

// Panel title in its own row; the font shrinks until the text fits the canvas width.
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
function niceStep(span, px, minPx, steps) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }

// A plot panel. yTicks: [{v, label}] or numbers. xTicks: true for automatic ticks, or [{v, label}].
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const q of o.yTicks) {
    const v = typeof q === 'number' ? q : q.v, lab = typeof q === 'number' ? fmt(q) : q.label;
    ctx.strokeStyle = v === 0 && !o.noZero ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(lab, P.l - 6, y(v) + 4);
  }
  ctx.textAlign = 'center';
  let xt = [];
  if (Array.isArray(o.xTicks)) xt = o.xTicks;
  else if (o.xTicks) {
    const step = niceStep(o.xMax - o.xMin, P.r - P.l, o.minPx || 28, o.xSteps || [0.5, 1, 2, 5, 10, 20, 50, 100]);
    const first = Math.ceil((o.xMin - 1e-9) / step) * step;
    for (let v = first; v <= o.xMax + 1e-9; v += step) xt.push({ v, label: fmt(v, o.xDigits || 2) });
  }
  for (const q of xt) { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(q.v), P.b); ctx.lineTo(x(q.v), P.b + 4); ctx.stroke(); ctx.fillText(q.label, x(q.v), P.b + 15); }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.t); ctx.lineTo(P.l, P.b); ctx.stroke();
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 9, W - 16);
  return { x, y, P };
}
function clip(ctx, P) { ctx.save(); ctx.beginPath(); ctx.rect(P.l, P.t - 1, P.r - P.l, P.b - P.t + 2); ctx.clip(); }
function curve(ctx, m, f, x0, x1, color, lw = 2, n = 240) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.beginPath();
  for (let i = 0; i <= n; i++) { const v = x0 + (x1 - x0) * i / n, X = m.x(v), Y = m.y(f(v)); if (!i) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
  ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, r, color, hollow = false) {
  ctx.save(); ctx.beginPath(); ctx.arc(X, Y, r, 0, 7);
  if (hollow) { ctx.fillStyle = C.bg; ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke(); } else { ctx.fillStyle = color; ctx.fill(); }
  ctx.restore();
}
function arrow(ctx, X0, Y0, X1, Y1, color, lw = 2.2) {
  const L = Math.hypot(X1 - X0, Y1 - Y0); if (L < 2) return;
  const ux = (X1 - X0) / L, uy = (Y1 - Y0) / L, hd = Math.min(10, L * 0.45);
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw;
  ctx.beginPath(); ctx.moveTo(X0, Y0); ctx.lineTo(X1 - ux * hd * 0.8, Y1 - uy * hd * 0.8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(X1, Y1); ctx.lineTo(X1 - ux * hd - uy * hd * 0.5, Y1 - uy * hd + ux * hd * 0.5); ctx.lineTo(X1 - ux * hd + uy * hd * 0.5, Y1 - uy * hd - ux * hd * 0.5); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function dashed(ctx, X0, Y0, X1, Y1, color, lw = 1.3) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(X0, Y0); ctx.lineTo(X1, Y1); ctx.stroke(); ctx.restore();
}
// Log-scale y ticks from 10^p0 to 10^p1.
const logTicks = (p0, p1, every = 1) => { const out = []; for (let p = p0; p <= p1; p += every) out.push({ v: p, label: pow10(p) }); return out; };
// Readable number for any size: plain when moderate, a × 10ⁿ otherwise.
const sci = v => { if (v === 0) return '0'; if (!isFinite(v)) return '∞'; const a = Math.abs(v); if (a >= 1e-3 && a < 1e5) return fmt(v, 4); const p = Math.floor(Math.log10(a)), m = v / Math.pow(10, p); return fmt(m, 2) + '×' + pow10(p); };
const lg = v => Math.log10(Math.max(1e-300, Math.abs(v)));

/* ---------- shared animation runner (respects reduced motion and hidden pages) ---------- */
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

/* ---------- step 0: one step from the local slope ---------- */
function draw0() {
  const x = num('x0'), eta = num('e0'), s = M.step0(x, eta);
  $('x0v').textContent = fmt(x, 1); $('e0v').textContent = fmt(eta, 1);
  const { ctx, W, H } = fitCanvas($('c0'));
  const m = panel(ctx, W, { top: 26, bottom: H - 26, xMin: -3.6, xMax: 5.6, yMin: -1, yMax: 9, yTicks: [0, 2, 4, 6, 8], xTicks: true, title: t('c0') });
  clip(ctx, m.P);
  curve(ctx, m, M.f0, -3.6, 5.6, C.cyan, 2.2);
  // tangent line at x: the only thing the walker can feel
  const tan = v => s.f + s.g * (v - x), span = 1.6;
  ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(m.x(x - span), m.y(tan(x - span))); ctx.lineTo(m.x(x + span), m.y(tan(x + span))); ctx.stroke(); ctx.restore();
  // the step along x, the tangent's prediction at x_new, and the true value there
  const yb = m.y(-0.5);
  arrow(ctx, m.x(x), yb, m.x(s.xn), yb, C.green);
  dashed(ctx, m.x(s.xn), m.y(Math.min(tan(s.xn), s.fn)), m.x(s.xn), m.y(Math.max(tan(s.xn), s.fn)), C.pink, 1.6);
  dashed(ctx, m.x(s.xn), yb, m.x(s.xn), m.y(Math.min(tan(s.xn), s.fn)), C.ghost, 1);
  dashed(ctx, m.x(x), yb, m.x(x), m.y(s.f), C.ghost, 1);
  dot(ctx, m.x(s.xn), m.y(tan(s.xn)), 4.5, C.orange, true);
  dot(ctx, m.x(s.xn), m.y(s.fn), 5.5, C.green);
  dot(ctx, m.x(x), m.y(s.f), 6, C.text);
  ctx.restore();
  const dir = Math.abs(s.g) < 1e-9 ? t('dirFlat') : s.g > 0 ? t('dirLeft') : t('dirRight');
  const verdict = s.actual < -1e-12 ? t('s0down') : s.actual > 1e-12 ? t('s0up') : t('s0same');
  $('r0').textContent = t('s0readout', { x: fmt(x, 1), g: fmt(s.g, 2), dir, step: fmt(-eta * s.g, 2), xn: fmt(s.xn, 2), pred: fmt(s.pred, 3), act: fmt(s.actual, 3), verdict });
}

/* ---------- step 1: the same rule, repeated, on a parabola ---------- */
const s1 = { reveal: M.K1 };
function draw1() {
  const a = num('a1'), eta = num('e1'), xs = M.run1D(a, eta), r = M.factor1(a, eta), reg = M.regime(a, eta), K = s1.reveal;
  $('a1v').textContent = fmt(a, 1); $('e1v').textContent = fmt(eta, 2);
  const { ctx, W, H } = fitCanvas($('c1'));
  const yTop = 0.5 * a * 42.25, yStep = yTop > 40 ? 20 : yTop > 16 ? 10 : 5;
  const yt = []; for (let v = 0; v <= yTop; v += yStep) yt.push(v);
  const A = panel(ctx, W, { top: 26, bottom: 196, xMin: -6.5, xMax: 6.5, yMin: -0.06 * yTop, yMax: yTop, yTicks: yt, xTicks: true, xSteps: [1, 2, 5], minPx: 34, title: t('c1a') });
  clip(ctx, A.P);
  curve(ctx, A, v => 0.5 * a * v * v, -6.5, 6.5, C.cyan, 2);
  ctx.strokeStyle = C.orange; ctx.lineWidth = 1.4; ctx.globalAlpha = 0.85; ctx.beginPath();
  for (let k = 0; k <= K && k < xs.length; k++) { const X = A.x(xs[k]), Y = A.y(0.5 * a * xs[k] * xs[k]); if (!k) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
  ctx.stroke(); ctx.globalAlpha = 1;
  for (let k = 0; k <= K && k < xs.length; k++) dot(ctx, A.x(xs[k]), A.y(0.5 * a * xs[k] * xs[k]), k === K ? 5.5 : 3, k === K ? C.text : C.orange);
  ctx.restore();
  const B = panel(ctx, W, { top: 240, bottom: H - 26, xMin: -0.5, xMax: M.K1 + 0.5, yMin: -9.4, yMax: 3.4, yTicks: logTicks(-9, 3, 3), noZero: true, xTicks: true, xSteps: [5, 10], title: t('c1b') });
  clip(ctx, B.P);
  dashed(ctx, B.P.l, B.y(lg(M.X1 * 1e-3)), B.P.r, B.y(lg(M.X1 * 1e-3)), C.ghost, 1.2);
  ctx.strokeStyle = C.orange; ctx.lineWidth = 1.6; ctx.beginPath();
  const yv = v => Math.max(-9.4, Math.min(3.4, lg(v)));
  for (let k = 0; k <= K; k++) { const X = B.x(k), Y = B.y(yv(xs[k])); if (!k) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
  ctx.stroke();
  for (let k = 0; k <= K; k++) dot(ctx, B.x(k), B.y(yv(xs[k])), 3, xs[k] >= 0 ? C.orange : C.pink, Math.abs(xs[k]) < 1e-9);
  ctx.restore();
  const n = M.stepsTo(r, 1e-3);
  const prog = K < M.K1 ? t('progress', { c: K, N: M.K1 }) : '';
  $('r1').textContent = prog + t('s1readout', { a: fmt(a, 1), eta: fmt(eta, 2), r: fmt(r, 2), lim: fmt(2 / a, 2), reg: t('reg_' + reg), n: isFinite(n) ? t('s1steps', { n }) : t('s1never'), xk: sci(xs[M.K1]) });
}

/* ---------- step 2: a long narrow bowl ---------- */
const s2 = { reveal: 200 };
function bowlView(ctx, W, H, ttl) {
  const P = { l: 34, r: W - 10, t: 26, b: H - 26 };
  const s = Math.min((P.r - P.l) / 10.4, (P.b - P.t) / 4.4), cx = (P.l + P.r) / 2, cy = (P.t + P.b) / 2;
  const m = { P, x: v => cx + s * v, y: v => cy - s * v, s };
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.lineWidth = 1;
  const xr = (P.r - P.l) / 2 / s, yr = (P.b - P.t) / 2 / s;
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, m.y(0)); ctx.lineTo(P.r, m.y(0)); ctx.moveTo(m.x(0), P.t); ctx.lineTo(m.x(0), P.b); ctx.stroke();
  const stepX = niceStep(2 * xr, P.r - P.l, 26, [1, 2, 5]);
  ctx.textAlign = 'center';
  for (let v = -Math.floor(xr / stepX) * stepX; v <= xr; v += stepX) { ctx.fillText(fmt(v), m.x(v), P.b + 15); }
  ctx.textAlign = 'right';
  const stepY = niceStep(2 * yr, P.b - P.t, 22, [1, 2, 5]);
  for (let v = -Math.floor(yr / stepY) * stepY; v <= yr; v += stepY) ctx.fillText(fmt(v), P.l - 6, m.y(v) + 4);
  ctx.restore();
  title(ctx, ttl, 8, P.t - 9, W - 16);
  return m;
}
function draw2() {
  const k = num('k2'), eta = num('e2'), pts = M.run2D(k, eta), K = Math.min(s2.reveal, pts.length - 1);
  $('k2v').textContent = String(k); $('e2v').textContent = fmt(eta, 3);
  let { ctx, W, H } = fitCanvas($('c2'));
  const m = bowlView(ctx, W, H, t('c2a'));
  clip(ctx, m.P);
  const f0 = M.f2(k, ...M.P2);
  for (let i = 0; i < 9; i++) { const L = f0 * Math.pow(0.45, i); ctx.strokeStyle = C.contour; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(m.x(0), m.y(0), Math.sqrt(2 * L) * m.s, Math.sqrt(2 * L / k) * m.s, 0, 0, 7); ctx.stroke(); }
  // at the start: downhill direction (−∇f) vs the straight line to the bottom
  const g = M.grad2(k, ...M.P2), gl = Math.hypot(...g), p0 = M.P2;
  dashed(ctx, m.x(p0[0]), m.y(p0[1]), m.x(0), m.y(0), C.ghost, 1.3);
  arrow(ctx, m.x(p0[0]), m.y(p0[1]), m.x(p0[0] - 1.6 * g[0] / gl), m.y(p0[1] - 1.6 * g[1] / gl), C.green, 2.4);
  ctx.strokeStyle = C.orange; ctx.lineWidth = 1.5; ctx.beginPath();
  for (let i = 0; i <= K; i++) { const X = m.x(pts[i][0]), Y = m.y(pts[i][1]); if (!i) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
  ctx.stroke();
  for (let i = 0; i <= K; i++) if (i < 60 || i === K) dot(ctx, m.x(pts[i][0]), m.y(pts[i][1]), i === K ? 5 : 2.6, i === K ? C.text : C.orange);
  dot(ctx, m.x(0), m.y(0), 4, C.cyan);
  ctx.restore();

  ({ ctx, W, H } = fitCanvas($('c2b')));
  const B = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 200, yMin: -3.3, yMax: 3.3, yTicks: logTicks(-3, 3, 1), noZero: true, xTicks: true, xSteps: [50, 100], minPx: 34, title: t('c2b') });
  clip(ctx, B.P);
  dashed(ctx, B.P.l, B.y(lg(M.TOL2)), B.P.r, B.y(lg(M.TOL2)), C.ghost, 1.2);
  ctx.strokeStyle = C.orange; ctx.lineWidth = 1.8; ctx.beginPath();
  // stop the line once the distance falls below the axis floor (10⁻³·³) instead of flattening it
  for (let i = 0; i <= K; i++) { const v = lg(Math.hypot(...pts[i])), Y = B.y(Math.max(-3.3, Math.min(3.4, v))); if (!i) ctx.moveTo(B.x(i), Y); else ctx.lineTo(B.x(i), Y); if (v < -3.3) break; }
  ctx.stroke(); ctx.restore();

  const rG = 1 - eta, rS = 1 - eta * k, n = M.arrive2D(k, eta), e = 1e-9;
  const state = Math.abs(rS) > 1 + e ? t('s2div') : Math.abs(Math.abs(rS) - 1) <= e ? t('s2bounce') : t('s2arrive', { n });
  const prog = s2.reveal < 200 ? t('progress', { c: Math.min(s2.reveal, 200), N: 200 }) : '';
  $('r2').textContent = prog + t('s2readout', { k, eta: fmt(eta, 3), ang: M.angleToMin(k).toFixed(0), rg: fmt(rG, 3), rs: fmt(rS, 3), lim: fmt(M.limit2(k), 3), state });
}

/* ---------- step 3: choosing η ---------- */
function draw3() {
  const k = num('k3'), q = num('q3'), lim = M.limit2(k), eta = q * lim, n = M.arrive2D(k, eta), eb = M.best2(k), nb = M.arrive2D(k, eb);
  $('k3v').textContent = String(k); $('q3v').textContent = fmt(q, 2);
  const { ctx, W, H } = fitCanvas($('c3'));
  const A = panel(ctx, W, { top: 26, bottom: 196, xMin: 0, xMax: 1.12, yMin: 0, yMax: 3.4, yTicks: logTicks(0, 3), noZero: true, xTicks: true, xSteps: [0.1, 0.2, 0.25, 0.5], minPx: 36, title: t('c3a') });
  ctx.fillStyle = 'rgba(255,122,147,0.12)'; ctx.fillRect(A.x(1), A.P.t, A.P.r - A.x(1), A.P.b - A.P.t);
  clip(ctx, A.P);
  ctx.strokeStyle = C.cyan; ctx.lineWidth = 2; ctx.beginPath(); let pen = false;
  for (let i = 1; i <= 224; i++) { const qq = i * 0.005, s = M.arrive2D(k, qq * lim); if (!isFinite(s)) { pen = false; continue; } const X = A.x(qq), Y = A.y(lg(Math.max(1, s))); if (!pen) { ctx.moveTo(X, Y); pen = true; } else ctx.lineTo(X, Y); }
  ctx.stroke();
  dashed(ctx, A.x(eb / lim), A.P.t, A.x(eb / lim), A.P.b, C.orange, 1.6);
  dashed(ctx, A.x(1), A.P.t, A.x(1), A.P.b, C.pink, 1.6);
  if (isFinite(n)) dot(ctx, A.x(q), A.y(lg(Math.max(1, n))), 6, C.text); else dot(ctx, A.x(Math.min(q, 1.11)), A.y(3.3), 6, C.pink, true);
  ctx.restore();
  const B = panel(ctx, W, { top: 240, bottom: H - 26, xMin: 0, xMax: 51, yMin: 0, yMax: 170, yTicks: [0, 50, 100, 150], xTicks: true, xSteps: [5, 10, 25], minPx: 30, title: t('c3b') });
  ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 2; ctx.beginPath();
  for (let kk = 1; kk <= 50; kk++) { const X = B.x(kk), Y = B.y(M.arrive2D(kk, M.best2(kk))); if (kk === 1) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
  ctx.stroke(); ctx.restore();
  dashed(ctx, B.x(0), B.y(0), B.x(50), B.y(3.1 * 50), C.ghost, 1.2);
  dot(ctx, B.x(k), B.y(nb), 6, C.text);
  $('r3').textContent = t('s3readout', { k, lim: fmt(lim, 4), q: fmt(q, 2), eta: fmt(eta, 4), n: isFinite(n) ? String(n) : t('never'), eb: fmt(eb, 4), qb: fmt(eb / lim, 3), nb, rate: fmt(M.rateBest(k), 3) });
}

/* ---------- step 4: two valleys ---------- */
const s4 = { reveal: 40 };
const K4SHOW = 40;
function draw4() {
  const x0 = num('x4'), eta = num('e4'), xs = M.run4(x0, eta), K = Math.min(s4.reveal, K4SHOW, xs.length - 1), bas = M.basins(eta), end = M.outcome4(x0, eta);
  $('x4v').textContent = fmt(x0, 2); $('e4v').textContent = fmt(eta, 2);
  const { ctx, W, H } = fitCanvas($('c4'));
  const A = panel(ctx, W, { top: 26, bottom: H - 86, xMin: -4.2, xMax: 4.2, yMin: -3, yMax: 3.5, yTicks: [-2, 0, 2], xTicks: true, title: t('c4a') });
  clip(ctx, A.P);
  curve(ctx, A, M.f4, -4.2, 4.2, C.cyan, 2.2);
  dashed(ctx, A.x(M.MINS4.hump), A.P.t, A.x(M.MINS4.hump), A.P.b, C.ghost, 1);
  ctx.strokeStyle = C.orange; ctx.lineWidth = 1.4; ctx.beginPath();
  for (let i = 0; i <= K; i++) { const X = A.x(xs[i]), Y = A.y(M.f4(xs[i])); if (!i) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
  ctx.stroke();
  for (let i = 0; i <= K; i++) dot(ctx, A.x(xs[i]), A.y(M.f4(xs[i])), i === K ? 5.5 : i === 0 ? 4.5 : 2.8, i === K ? C.text : C.orange, i === 0);
  ctx.restore();
  // basin strip: where each start on the grid ends after 400 updates with this η
  const top = H - 30, bh = 12;
  title(ctx, t('c4b'), 8, top - 8, W - 16);
  const cw = (A.P.r - A.P.l) / (M.GRID4.length - 1);
  M.GRID4.forEach((g, i) => { ctx.fillStyle = bas.out[i] === 'left' ? C.green : bas.out[i] === 'right' ? C.orange : C.pink; ctx.fillRect(A.x(g) - cw / 2, top, cw + 0.5, bh); });
  ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(A.x(x0), top - 3); ctx.lineTo(A.x(x0), top + bh + 3); ctx.stroke();
  const xe = xs[xs.length - 1];
  const where = end === 'left' ? t('s4left') : end === 'right' ? t('s4right') : t('s4none');
  const prog = s4.reveal < K4SHOW ? t('progress', { c: s4.reveal, N: K4SHOW }) : '';
  $('r4').textContent = prog + t('s4readout', { x0: fmt(x0, 2), eta: fmt(eta, 2), xe: isFinite(xe) ? fmt(xe, 3) : '∞', fe: isFinite(xe) ? fmt(M.f4(xe), 3) : '∞', where, L: bas.left, R: bas.right, N: M.GRID4.length });
}

/* ---------- step 5: fitting a line, full batch vs mini-batch ---------- */
const s5 = { centred: false, B: 24, seed: 1, reveal: M.K5 };
const V5 = { w0: -0.6, w1: 1.8, c0: -1.5, c1: 8.5 };
const levelsCache = {};
function contourSegs(centred) {
  const key = String(centred); if (levelsCache[key]) return levelsCache[key];
  const opt = M.optimum5(centred), nx = 90, ny = 90, grid = [];
  for (let j = 0; j <= ny; j++) { const row = []; for (let i = 0; i <= nx; i++) row.push(M.loss5(V5.w0 + (V5.w1 - V5.w0) * i / nx, V5.c0 + (V5.c1 - V5.c0) * j / ny, centred)); grid.push(row); }
  const levels = [1.05, 1.3, 2, 4, 8, 16, 32, 64].map(r => opt.loss * r), segs = [];
  const P = (i, j) => [V5.w0 + (V5.w1 - V5.w0) * i / nx, V5.c0 + (V5.c1 - V5.c0) * j / ny];
  for (const L of levels) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const v = [grid[j][i], grid[j][i + 1], grid[j + 1][i + 1], grid[j + 1][i]], c = [P(i, j), P(i + 1, j), P(i + 1, j + 1), P(i, j + 1)], hits = [];
    for (let e = 0; e < 4; e++) { const a = v[e], b = v[(e + 1) % 4]; if ((a - L) * (b - L) < 0) { const s = (L - a) / (b - a), p = c[e], q = c[(e + 1) % 4]; hits.push([p[0] + s * (q[0] - p[0]), p[1] + s * (q[1] - p[1])]); } }
    if (hits.length >= 2) segs.push([hits[0], hits[1]]); if (hits.length === 4) segs.push([hits[2], hits[3]]);
  }
  return (levelsCache[key] = segs);
}
function draw5() {
  const ratio = num('q5'), run = M.run5(s5.centred, s5.B, ratio, s5.seed), K = Math.min(s5.reveal, run.path.length - 1), opt = run.opt;
  $('q5v').textContent = fmt(ratio, 2);
  document.querySelectorAll('[data-centred]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.centred === String(s5.centred))));
  document.querySelectorAll('[data-batch]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.batch) === s5.B)));
  const [w, c] = run.path[K], line = u => w * u + c;
  let { ctx, W, H } = fitCanvas($('c5'));
  const A = panel(ctx, W, { top: 26, bottom: 186, xMin: 0, xMax: 10, yMin: 0, yMax: 13, yTicks: [0, 4, 8, 12], xTicks: true, xSteps: [1, 2, 5], title: t('c5a') });
  clip(ctx, A.P);
  const toU = x => s5.centred ? x - M.meanX : x;
  ctx.strokeStyle = C.ghost; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(A.x(0), A.y(opt.w * toU(0) + opt.c)); ctx.lineTo(A.x(10), A.y(opt.w * toU(10) + opt.c)); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = C.orange; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(A.x(0), A.y(line(toU(0)))); ctx.lineTo(A.x(10), A.y(line(toU(10)))); ctx.stroke();
  M.DATA.forEach(p => dot(ctx, A.x(p.x), A.y(p.y), 3.6, C.cyan));
  if (s5.centred) dashed(ctx, A.x(M.meanX), A.P.t, A.x(M.meanX), A.P.b, C.violet, 1.2);
  ctx.restore();
  const Bp = panel(ctx, W, { top: 230, bottom: H - 26, xMin: 0, xMax: M.K5, yMin: -0.4, yMax: 2.2, yTicks: [{ v: lg(0.5), label: '0.5' }, { v: 0, label: '1' }, { v: 1, label: '10' }, { v: 2, label: '100' }], noZero: true, xTicks: true, xSteps: [50, 100, 150], minPx: 34, title: t('c5b') });
  clip(ctx, Bp.P);
  dashed(ctx, Bp.P.l, Bp.y(lg(opt.loss)), Bp.P.r, Bp.y(lg(opt.loss)), C.ghost, 1.3);
  ctx.strokeStyle = C.orange; ctx.lineWidth = 1.4; ctx.beginPath();
  for (let i = 0; i <= K; i++) { const Y = Bp.y(Math.min(2.3, lg(run.losses[i]))); if (!i) ctx.moveTo(Bp.x(i), Y); else ctx.lineTo(Bp.x(i), Y); }
  ctx.stroke(); ctx.restore();

  ({ ctx, W, H } = fitCanvas($('c5b')));
  const Cp = panel(ctx, W, { top: 26, bottom: H - 26, left: 36, xMin: V5.w0, xMax: V5.w1, yMin: V5.c0, yMax: V5.c1, yTicks: [0, 2, 4, 6, 8], xTicks: true, xSteps: [0.5, 1], minPx: 30, title: t(s5.centred ? 'c5cC' : 'c5cR') });
  clip(ctx, Cp.P);
  ctx.strokeStyle = C.contour; ctx.lineWidth = 1.2; ctx.beginPath();
  for (const [p, q] of contourSegs(s5.centred)) { ctx.moveTo(Cp.x(p[0]), Cp.y(p[1])); ctx.lineTo(Cp.x(q[0]), Cp.y(q[1])); }
  ctx.stroke();
  ctx.strokeStyle = C.orange; ctx.lineWidth = 1.3; ctx.globalAlpha = 0.9; ctx.beginPath();
  for (let i = 0; i <= K; i++) { const X = Cp.x(run.path[i][0]), Y = Cp.y(run.path[i][1]); if (!i) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
  ctx.stroke(); ctx.globalAlpha = 1;
  dot(ctx, Cp.x(opt.w), Cp.y(opt.c), 5, C.cyan);
  dot(ctx, Cp.x(M.START5[0]), Cp.y(M.START5[1]), 4.5, C.orange, true);
  dot(ctx, Cp.x(w), Cp.y(c), 5.5, C.text);
  ctx.restore();

  const prog = s5.reveal < M.K5 ? t('progress', { c: K, N: M.K5 }) : '';
  const lossK = run.losses[K];
  $('r5').textContent = prog + t('s5readout', { feat: t(s5.centred ? 'featC' : 'featR'), kappa: fmt(opt.kappa, 1), eta: fmt(run.eta, 4), B: s5.B, k: K, L: isFinite(lossK) && lossK < 1e5 ? fmt(lossK, 3) : '∞', Lopt: fmt(opt.loss, 3), tail: run.tailMean < 1e5 ? fmt(run.tailMean, 3) : '∞', w: fmt(w, 3), c: fmt(c, 2), wo: fmt(opt.w, 3), co: fmt(opt.c, 2) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  ['x0', 'e0'].forEach(id => $(id).addEventListener('input', draw0));
  $('next0').addEventListener('click', () => { const s = M.step0(num('x0'), num('e0')); const lo = Number($('x0').min), hi = Number($('x0').max); $('x0').value = Math.max(lo, Math.min(hi, Math.round(s.xn * 10) / 10)); draw0(); });

  ['a1', 'e1'].forEach(id => $(id).addEventListener('input', () => { stopAnim('s1'); s1.reveal = M.K1; draw1(); }));
  $('run1').addEventListener('click', () => { s1.reveal = 0; draw1(); animate('s1', M.K1 * 140, p => { s1.reveal = Math.round(p * M.K1); draw1(); }); });
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked');
    const ok = !!choice && choice.value === 'b';
    $('quizFeedback').textContent = t(choice ? (ok ? 'correct' : 'wrong') : 'pick');
    $('quizFeedback').style.color = ok ? C.green : C.orange;
    $('quizFeedback').dataset.state = ok ? 'correct' : 'wrong';
  });

  ['k2', 'e2'].forEach(id => $(id).addEventListener('input', () => { stopAnim('s2'); s2.reveal = 200; draw2(); }));
  $('run2').addEventListener('click', () => { s2.reveal = 0; draw2(); animate('s2', 5000, p => { s2.reveal = Math.round(p * 200); draw2(); }); });

  ['k3', 'q3'].forEach(id => $(id).addEventListener('input', draw3));
  $('best3').addEventListener('click', () => { const k = num('k3'); $('q3').value = (Math.round(k / (1 + k) * 100) / 100).toFixed(2); draw3(); });

  ['x4', 'e4'].forEach(id => $(id).addEventListener('input', () => { stopAnim('s4'); s4.reveal = K4SHOW; draw4(); }));
  $('run4').addEventListener('click', () => { s4.reveal = 0; draw4(); animate('s4', K4SHOW * 120, p => { s4.reveal = Math.round(p * K4SHOW); draw4(); }); });

  const rerun5 = () => { stopAnim('s5'); s5.reveal = M.K5; draw5(); };
  document.querySelectorAll('[data-centred]').forEach(b => b.addEventListener('click', () => { s5.centred = b.dataset.centred === 'true'; rerun5(); }));
  document.querySelectorAll('[data-batch]').forEach(b => b.addEventListener('click', () => { s5.B = Number(b.dataset.batch); rerun5(); }));
  $('q5').addEventListener('input', rerun5);
  $('seed5').addEventListener('click', () => { s5.seed = s5.seed % 5 + 1; rerun5(); });
  $('run5').addEventListener('click', () => { s5.reveal = 0; draw5(); animate('s5', 6000, p => { s5.reveal = Math.round(p * M.K5); draw5(); }); });

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
  window.refreshGradientDescent = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
