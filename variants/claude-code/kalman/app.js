'use strict';
// Kalman filter lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, band and readout comes from window.KALMAN_MODEL (model.js). Canvas text is limited to
// panel titles and axis ticks laid out in fixed rows; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.KALMAN_MODEL;
const t = (...a) => window.KALMAN_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', xs: '#9fb4cc', ghost: '#8696aa', gap: '#2a3546' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros only when there is a decimal point; show −0 as 0.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d); return s.indexOf('.') < 0 ? s : s.replace(/0+$/, '').replace(/\.$/, ''); };

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

// Panel title: shrinks the font until it fits (never overflows).
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 7);
  ctx.fillText(text, X, Y); ctx.restore();
}
function niceStep(span, px, minPx, steps) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }
function ticks(lo, hi, px, minPx = 24) {
  const s = niceStep(hi - lo, px, minPx, [0.05, 0.1, 0.2, 0.25, 0.5, 1, 2, 5, 10, 20, 50]);
  const out = []; for (let v = Math.ceil(lo / s - 1e-9) * s; v <= hi + 1e-9; v += s) out.push(Math.round(v / s) * s);
  return out;
}
// A plot panel; o: top, bottom, xMin, xMax, yMin, yMax, yTicks, xTicks, xSteps, minPx, title, left, right, xDigits, logX
function panel(ctx, W, o) {
  const P = { l: o.left || 38, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const lx = v => Math.log10(v);
  const x = o.logX ? v => P.l + (lx(v) - lx(o.xMin)) / (lx(o.xMax) - lx(o.xMin)) * (P.r - P.l) : v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  const yT = o.yTicks || ticks(o.yMin, o.yMax, P.b - P.t, 22);
  for (const v of yT) {
    ctx.strokeStyle = Math.abs(v) < 1e-12 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(fmt(v), P.l - 6, y(v) + 4);
  }
  if (o.xTicks) {
    let list;
    if (o.logX) list = o.xList;
    else { const step = niceStep(o.xMax - o.xMin, P.r - P.l, o.minPx || 28, o.xSteps || [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 40]); list = []; for (let v = Math.ceil((o.xMin - 1e-9) / step) * step; v <= o.xMax + 1e-9; v += step) list.push(v); }
    ctx.textAlign = 'center';
    for (const v of list) {
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
      ctx.fillText(fmt(v, o.xDigits || 2), x(v), P.b + 15);
    }
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 9, W - 16);
  return { x, y, P };
}
function clip(ctx, m) { ctx.save(); ctx.beginPath(); ctx.rect(m.P.l, m.P.t, m.P.r - m.P.l, m.P.b - m.P.t); ctx.clip(); }
function poly(ctx, pts, color, lw = 2, dash = null) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.beginPath();
  pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke(); ctx.restore();
}
function band(ctx, m, ks, lo, hi, color = 'rgba(103,215,249,0.18)') {
  if (!ks.length) return;
  ctx.save(); ctx.fillStyle = color; ctx.beginPath();
  ks.forEach((k, i) => (i ? ctx.lineTo(m.x(k), m.y(hi[i])) : ctx.moveTo(m.x(k), m.y(hi[i]))));
  for (let i = ks.length - 1; i >= 0; i--) ctx.lineTo(m.x(ks[i]), m.y(lo[i]));
  ctx.closePath(); ctx.fill(); ctx.restore();
}
function dot(ctx, X, Y, color, r = 4) { ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); ctx.restore(); }
function vline(ctx, X, y0, y1, color, dash = [4, 4], alpha = 0.8) { ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.setLineDash(dash); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y1); ctx.stroke(); ctx.restore(); }
function hline(ctx, m, v, color, dash = [5, 4]) { ctx.save(); ctx.strokeStyle = color; ctx.setLineDash(dash); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(m.P.l, m.y(v)); ctx.lineTo(m.P.r, m.y(v)); ctx.stroke(); ctx.restore(); }

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

/* ---------- step 0: blend two reports ---------- */
function draw0() {
  const sp = num('sp0'), sr = num('sr0'), w = num('w0'), b = M.blend(w, sp, sr);
  $('sp0v').textContent = sp.toFixed(1); $('sr0v').textContent = sr.toFixed(1); $('w0v').textContent = w.toFixed(2);
  const { ctx, W, H } = fitCanvas($('c0'));
  const peak = Math.max(M.normPdf(0, 0, sp), M.normPdf(0, 0, sr), M.normPdf(0, 0, b.sd)) * 1.08;
  const A = panel(ctx, W, { top: 26, bottom: 170, xMin: 6, xMax: 15, yMin: 0, yMax: peak, yTicks: [0], xTicks: true, xSteps: [1, 2, 3], title: t('c0a'), left: 14 });
  const curve = (m, sd, col, fill) => {
    const pts = []; for (let i = 0; i <= 240; i++) { const xv = 6 + 9 * i / 240; pts.push([A.x(xv), A.y(M.normPdf(xv, m, sd))]); }
    if (fill) { ctx.save(); ctx.fillStyle = fill; ctx.beginPath(); ctx.moveTo(A.x(6), A.y(0)); pts.forEach(p => ctx.lineTo(p[0], p[1])); ctx.lineTo(A.x(15), A.y(0)); ctx.closePath(); ctx.fill(); ctx.restore(); }
    poly(ctx, pts, col, 2);
    vline(ctx, A.x(m), A.y(M.normPdf(m, m, sd)), A.y(0), col, [3, 3], 0.7);
  };
  clip(ctx, A);
  curve(M.S0.pred, sp, C.orange); curve(M.S0.meas, sr, C.green); curve(b.x, b.sd, C.cyan, 'rgba(103,215,249,0.16)');
  ctx.restore();
  const yMax = Math.max(sp, sr) * 1.1;
  const B = panel(ctx, W, { top: 214, bottom: H - 26, xMin: 0, xMax: 1, yMin: 0, yMax, xTicks: true, xSteps: [0.1, 0.2, 0.25, 0.5], title: t('c0b') });
  const pts = []; for (let i = 0; i <= 200; i++) { const wv = i / 200; pts.push([B.x(wv), B.y(Math.sqrt(M.blendVar(wv, sp * sp, sr * sr)))]); }
  poly(ctx, pts, C.text, 2);
  vline(ctx, B.x(b.K), B.P.t, B.P.b, C.orange, [5, 4], 1);
  dot(ctx, B.x(b.K), B.y(b.bestSd), C.orange, 4);
  dot(ctx, B.x(w), B.y(b.sd), C.cyan, 6); dot(ctx, B.x(w), B.y(b.sd), C.text, 2.5);
  $('r0').textContent = t('s0readout', { w: w.toFixed(2), x: b.x.toFixed(2), sd: b.sd.toFixed(3), ex: (100 * b.excess).toFixed(1), K: b.K.toFixed(3), bx: b.bestX.toFixed(2), bsd: b.bestSd.toFixed(3), sp: sp.toFixed(1), sr: sr.toFixed(1) });
}

/* ---------- step 1: measure the same spot again and again ---------- */
const S0LIST = [0.1, 0.2, 0.5, 1, 2, 5, 10];
const s1 = { k: 30, seed: 0 };
function draw1() {
  const s0 = S0LIST[num('s01')], rows = M.staticRun(s0, M.SEEDS[s1.seed]), k = s1.k, N = M.S1.N;
  $('s01v').textContent = fmt(s0, 1);
  const { ctx, W, H } = fitCanvas($('c1'));
  const A = panel(ctx, W, { top: 26, bottom: 236, xMin: 0, xMax: N, yMin: 2, yMax: 7, yTicks: [2, 3, 4, 5, 6, 7], xTicks: true, xSteps: [5, 10], title: t('c1a') });
  clip(ctx, A);
  const ks = [0], lo = [M.S1.prior - 2 * s0], hi = [M.S1.prior + 2 * s0], est = [[A.x(0), A.y(M.S1.prior)]], mean = [];
  for (let j = 1; j <= k; j++) { const r = rows[j - 1]; ks.push(j); lo.push(r.x - 2 * r.sd); hi.push(r.x + 2 * r.sd); est.push([A.x(j), A.y(r.x)]); mean.push([A.x(j), A.y(r.mean)]); }
  band(ctx, A, ks, lo, hi);
  hline(ctx, A, M.S1.truth, C.orange);
  for (let j = 1; j <= k; j++) dot(ctx, A.x(j), A.y(rows[j - 1].z), C.green, 3);
  if (mean.length > 1) poly(ctx, mean, C.text, 1.6, [4, 3]);
  poly(ctx, est, C.cyan, 2.4); dot(ctx, est[est.length - 1][0], est[est.length - 1][1], C.cyan, 4.5);
  ctx.restore();
  const B = panel(ctx, W, { top: 280, bottom: H - 26, xMin: 0, xMax: N, yMin: 0, yMax: 1.05, yTicks: [0, 0.5, 1], xTicks: true, xSteps: [5, 10], title: t('c1b') });
  const ref = []; for (let j = 1; j <= N; j++) ref.push([B.x(j), B.y(1 / j)]);
  const bw = Math.max(2, (B.x(1) - B.x(0)) * 0.6);
  ctx.save(); ctx.fillStyle = C.cyan;
  for (let j = 1; j <= k; j++) { const Y = B.y(rows[j - 1].K); ctx.fillRect(B.x(j) - bw / 2, Y, bw, B.y(0) - Y); }
  ctx.restore();
  poly(ctx, ref, C.ghost, 1.4, [4, 3]);
  if (!k) { $('r1').textContent = t('s1none', { s0: fmt(s0, 1) }); return; }
  const r = rows[k - 1];
  $('r1').textContent = t('s1readout', { k, K: r.K.toFixed(3), x: r.x.toFixed(2), err: (r.x - M.S1.truth).toFixed(2), sd: r.sd.toFixed(3), mean: r.mean.toFixed(2) });
}

/* ---------- step 2: predict widens, update narrows ---------- */
const s2 = { half: 50 }; // half-steps shown (2 per second)
const N2 = 25, SD0 = 2;
function draw2() {
  const sq = num('sq2'), sr = num('sr2'), run = M.varianceRun(sq, sr, SD0, N2), ss = M.steady(sq, sr);
  $('sq2v').textContent = sq.toFixed(2); $('sr2v').textContent = sr.toFixed(1);
  const { ctx, W, H } = fitCanvas($('c2'));
  const yMax = Math.max(SD0, ...run.map(r => r.sdPrior)) * 1.08;
  const A = panel(ctx, W, { top: 26, bottom: 222, xMin: 0, xMax: N2, yMin: 0, yMax, xTicks: true, xSteps: [5, 10], title: t('c2a') });
  hline(ctx, A, ss.sdPrior, C.orange); hline(ctx, A, ss.sdPost, C.orange);
  let prev = [A.x(0), A.y(SD0)];
  dot(ctx, prev[0], prev[1], C.text, 3.5);
  for (let i = 0; i < s2.half; i++) {
    const r = run[Math.floor(i / 2)];
    if (i % 2 === 0) { const nx = [A.x(r.k), A.y(r.sdPrior)]; poly(ctx, [prev, nx], C.pink, 2); dot(ctx, nx[0], nx[1], C.pink, 3); prev = nx; }
    else { const nx = [A.x(r.k), A.y(r.sdPost)]; poly(ctx, [prev, nx], C.cyan, 2.4); dot(ctx, nx[0], nx[1], C.cyan, 3); prev = nx; }
  }
  const B = panel(ctx, W, { top: 266, bottom: H - 26, xMin: 0, xMax: N2, yMin: 0, yMax: 1.05, yTicks: [0, 0.5, 1], xTicks: true, xSteps: [5, 10], title: t('c2b') });
  hline(ctx, B, ss.K, C.orange);
  const shown = Math.floor(s2.half / 2), kp = [];
  for (let j = 0; j < shown; j++) { kp.push([B.x(run[j].k), B.y(run[j].K)]); }
  if (kp.length > 1) poly(ctx, kp, C.cyan, 1.6);
  kp.forEach(p => dot(ctx, p[0], p[1], C.cyan, 3.5));
  const prog = s2.half < 2 * N2 ? t('s2progress', { c: shown }) : '';
  $('r2').textContent = t('s2readout', { prog, pm: ss.sdPrior.toFixed(3), pp: ss.sdPost.toFixed(3), K: ss.K.toFixed(3), n: M.settleStep(sq, sr, SD0), ratio: (sq / sr).toFixed(2) });
}

/* ---------- step 3: assumed process noise ---------- */
const s3 = { seed: 0, cache: {} };
function curve3() { const sd = M.SEEDS[s3.seed]; if (!s3.cache[sd]) s3.cache[sd] = M.tuningCurve(sd); return s3.cache[sd]; }
function draw3() {
  const q = M.QGRID[num('q3')], seed = M.SEEDS[s3.seed], run = M.trackRun(q, seed), cv = curve3();
  $('q3v').textContent = q < 0.1 ? q.toFixed(3) : q.toFixed(2);
  let { ctx, W, H } = fitCanvas($('c3'));
  const all = run.z.concat(run.truth), lo = Math.floor(Math.min(...all)) - 0.5, hi = Math.ceil(Math.max(...all)) + 0.5;
  const N = M.S3.N;
  const A = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: N - 1, yMin: lo, yMax: hi, xTicks: true, xSteps: [20, 40, 60], minPx: 34, title: t('c3a') });
  clip(ctx, A);
  run.z.forEach((v, k) => dot(ctx, A.x(k), A.y(v), C.raw, 1.8));
  poly(ctx, run.truth.map((v, k) => [A.x(k), A.y(v)]), C.orange, 1.6, [5, 3]);
  poly(ctx, run.est.map((v, k) => [A.x(k), A.y(v)]), C.cyan, 2.2);
  ctx.restore();
  ({ ctx, W, H } = fitCanvas($('c3b')));
  const yMax = Math.max(...cv.pts.map(p => Math.max(p.rmse, p.claimed)), run.measRmse) * 1.1;
  const B = panel(ctx, W, { top: 26, bottom: H - 26, xMin: M.QGRID[0], xMax: M.QGRID[M.QGRID.length - 1], yMin: 0, yMax, logX: true, xTicks: true, xList: [0.01, 0.1, 1], title: t('c3b') });
  hline(ctx, B, run.measRmse, C.ghost);
  vline(ctx, B.x(M.S3.sqTrue), B.P.t, B.P.b, C.green, [5, 4], 1);
  poly(ctx, cv.pts.map(p => [B.x(p.q), B.y(p.claimed)]), C.orange, 2);
  poly(ctx, cv.pts.map(p => [B.x(p.q), B.y(p.rmse)]), C.text, 1.6);
  cv.pts.forEach(p => dot(ctx, B.x(p.q), B.y(p.rmse), C.text, 2.4));
  vline(ctx, B.x(q), B.P.t, B.P.b, C.cyan, [3, 3], 0.6);
  dot(ctx, B.x(q), B.y(run.claimed), C.orange, 5);
  dot(ctx, B.x(q), B.y(run.rmse), C.cyan, 6);
  const rel = run.claimed / run.rmse - 1;
  const verdict = Math.abs(rel) <= 0.2 ? t('verdictOk') : rel < 0 ? t('verdictOver') : t('verdictUnder');
  const fq = v => (v < 0.1 ? v.toFixed(3) : v.toFixed(2));
  $('r3').textContent = t('s3readout', { q: fq(q), rmse: run.rmse.toFixed(3), cl: run.claimed.toFixed(3), verdict, mr: run.measRmse.toFixed(3), bq: fq(cv.best.q), br: cv.best.rmse.toFixed(3) });
}

/* ---------- step 4: position and velocity ---------- */
const s4 = { seed: 0, zoom: false };
function draw4() {
  const k = num('k4'), run = M.cvRun(M.SEEDS[s4.seed], M.S4.N), N = M.S4.N, rows = run.rows;
  $('k4v').textContent = String(k);
  $('zoom4').setAttribute('aria-pressed', String(s4.zoom));
  let { ctx, W, H } = fitCanvas($('c4'));
  const pmax = Math.ceil((Math.max(...run.z, ...run.pos) + 3) / 10) * 10;
  const A = panel(ctx, W, { top: 26, bottom: 164, xMin: 0, xMax: N, yMin: -10, yMax: pmax, xTicks: true, xSteps: [5, 10, 20], title: t('c4a') });
  clip(ctx, A);
  const ks = [], lo = [], hi = [], vlo = [], vhi = [];
  for (let j = 0; j <= k; j++) { const r = rows[j], sp = Math.sqrt(r.P[0][0]), sv = Math.sqrt(r.P[1][1]); ks.push(j); lo.push(r.x[0] - 2 * sp); hi.push(r.x[0] + 2 * sp); vlo.push(r.x[1] - 2 * sv); vhi.push(r.x[1] + 2 * sv); }
  band(ctx, A, ks, lo, hi);
  poly(ctx, run.pos.map((v, j) => [A.x(j), A.y(v)]), C.orange, 1.5, [5, 3]);
  for (let j = 1; j <= k; j++) dot(ctx, A.x(j), A.y(run.z[j]), C.xs, 2.4);
  poly(ctx, ks.map(j => [A.x(j), A.y(rows[j].x[0])]), C.cyan, 2.2);
  ctx.restore();
  const B = panel(ctx, W, { top: 206, bottom: H - 26, xMin: 0, xMax: N, yMin: -2, yMax: 4, yTicks: [-2, 0, 2, 4], xTicks: true, xSteps: [5, 10, 20], title: t('c4b') });
  clip(ctx, B);
  band(ctx, B, ks, vlo, vhi);
  poly(ctx, run.vel.map((v, j) => [B.x(j), B.y(v)]), C.orange, 1.5, [5, 3]);
  poly(ctx, ks.map(j => [B.x(j), B.y(rows[j].x[1])]), C.cyan, 2.2);
  dot(ctx, B.x(k), B.y(rows[k].x[1]), C.cyan, 4.5);
  ctx.restore();

  ({ ctx, W, H } = fitCanvas($('c4b')));
  const z = s4.zoom ? 5 : 1, ex = 7 / z, ev = 4.5 / z;
  const E = panel(ctx, W, { top: 26, bottom: H - 26, xMin: -ex, xMax: ex, yMin: -ev, yMax: ev, xTicks: true, xSteps: s4.zoom ? [0.2, 0.5, 1] : [1, 2, 5], minPx: 30, title: t('c4c'), left: 40 });
  vline(ctx, E.x(0), E.P.t, E.P.b, C.axis, [], 1);
  const ell = (P, col, lw, alpha, dash) => {
    const e = M.ellipse(P), a = 2 * Math.sqrt(e.l1), b = 2 * Math.sqrt(e.l2), c = Math.cos(e.ang), s = Math.sin(e.ang), pts = [];
    for (let i = 0; i <= 72; i++) { const th = i / 72 * 2 * Math.PI, u = a * Math.cos(th), v = b * Math.sin(th); pts.push([E.x(u * c - v * s), E.y(u * s + v * c)]); }
    ctx.save(); ctx.globalAlpha = alpha; poly(ctx, pts, col, lw, dash); ctx.restore();
  };
  clip(ctx, E);
  for (let j = 0; j < k; j++) ell(rows[j].P, C.xs, 1, 0.25 + 0.45 * (j + 1) / Math.max(1, k));
  ell(rows[k].P, C.cyan, 2.6, 1);
  ctx.restore();
  const r = rows[k];
  if (!k) { $('r4').textContent = t('s4start', { sp0: M.S4.sp0, sv0: M.S4.sv0 }) + (s4.zoom ? t('zoomOn') : ''); return; }
  let cov = 0; for (let j = 1; j <= k; j++) if (Math.abs(rows[j].x[1] - run.vel[j]) < 2 * Math.sqrt(rows[j].P[1][1])) cov++;
  $('r4').textContent = t('s4readout', { k, v: r.x[1].toFixed(2), sv: (2 * Math.sqrt(r.P[1][1])).toFixed(2), vt: run.vel[k].toFixed(2), sp: Math.sqrt(r.P[0][0]).toFixed(3), rho: M.corr(r.P).toFixed(2), kp: r.Kp.toFixed(3), kv: r.Kv.toFixed(3), cov }) + (s4.zoom ? t('zoomOn') : '');
}

/* ---------- step 5: sensor dropout ---------- */
function draw5() {
  const from = num('g5a'), len = num('g5b'), run = M.gapRun(from, len), rows = run.rows, N = M.S5.N;
  $('g5av').textContent = String(from); $('g5bv').textContent = String(len);
  const { ctx, W, H } = fitCanvas($('c5'));
  const sp = j => Math.sqrt(rows[j].P[0][0]);
  const A = panel(ctx, W, { top: 26, bottom: 196, xMin: 0, xMax: N, yMin: -5, yMax: 5, yTicks: [-4, -2, 0, 2, 4], xTicks: true, xSteps: [5, 10, 25], title: t('c5a') });
  const shade = m => { if (len) { ctx.save(); ctx.fillStyle = C.gap; ctx.globalAlpha = 0.85; ctx.fillRect(m.x(from - 0.5), m.P.t, m.x(from + len - 0.5) - m.x(from - 0.5), m.P.b - m.P.t); ctx.restore(); } };
  shade(A);
  clip(ctx, A);
  const ks = [], lo = [], hi = [], err = [];
  for (let j = 1; j <= N; j++) { const e = rows[j].x[0] - run.pos[j]; ks.push(j); lo.push(-2 * sp(j)); hi.push(2 * sp(j)); err.push([A.x(j), A.y(e)]); }
  band(ctx, A, ks, lo, hi);
  hline(ctx, A, 0, C.axis, []);
  poly(ctx, err, C.cyan, 2.2);
  ctx.restore();
  const peakAll = Math.max(...ks.filter(j => j >= 3).map(j => Math.sqrt(rows[j].prior.P[0][0])));
  const B = panel(ctx, W, { top: 240, bottom: H - 26, xMin: 0, xMax: N, yMin: 0, yMax: Math.max(1.6, peakAll * 1.1), xTicks: true, xSteps: [5, 10, 25], title: t('c5b') });
  shade(B);
  clip(ctx, B);
  const saw = [];
  for (let j = 1; j <= N; j++) { saw.push([B.x(j), B.y(Math.sqrt(rows[j].prior.P[0][0]))]); saw.push([B.x(j), B.y(sp(j))]); }
  poly(ctx, saw, C.cyan, 1.8);
  ctx.restore();
  if (!len) { $('r5').textContent = t('s5none', { ss: sp(N).toFixed(2) }); return; }
  const g = M.gapStats(from, len), rec = g.rec === null ? t('s5norec') : t('s5rec', { n: g.rec });
  $('r5').textContent = t('s5readout', { before: g.before.toFixed(2), sv: g.svBefore.toFixed(3), peak: g.peak.toFixed(2), ratio: g.ratio.toFixed(2), rec, maxerr: g.maxerr.toFixed(2) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  ['sp0', 'sr0', 'w0'].forEach(id => $(id).addEventListener('input', draw0));
  $('snap0').addEventListener('click', () => { $('w0').value = M.blend(0, num('sp0'), num('sr0')).K.toFixed(2); draw0(); });

  $('s01').addEventListener('input', draw1);
  $('next1').addEventListener('click', () => { stopAnim('s1'); s1.k = Math.min(M.S1.N, s1.k + 1); draw1(); });
  $('play1').addEventListener('click', () => {
    if (s1.k >= M.S1.N) s1.k = 0;
    const k0 = s1.k, n = M.S1.N - k0;
    animate('s1', n * 180, p => { s1.k = k0 + Math.round(p * n); draw1(); });
  });
  $('reset1').addEventListener('click', () => { stopAnim('s1'); s1.k = 0; draw1(); });
  $('reroll1').addEventListener('click', () => { stopAnim('s1'); s1.seed = (s1.seed + 1) % M.SEEDS.length; s1.k = 0; draw1(); });

  ['sq2', 'sr2'].forEach(id => $(id).addEventListener('input', draw2));
  $('play2').addEventListener('click', () => { s2.half = 0; animate('s2', 2 * N2 * 160, p => { s2.half = Math.round(p * 2 * N2); draw2(); }); });
  $('all2').addEventListener('click', () => { stopAnim('s2'); s2.half = 2 * N2; draw2(); });

  $('q3').addEventListener('input', draw3);
  $('reroll3').addEventListener('click', () => { s3.seed = (s3.seed + 1) % M.SEEDS.length; draw3(); });

  $('k4').addEventListener('input', () => { stopAnim('s4'); draw4(); });
  $('play4').addEventListener('click', () => { animate('s4', M.S4.N * 220, p => { $('k4').value = Math.round(p * M.S4.N); draw4(); }); });
  $('reroll4').addEventListener('click', () => { s4.seed = (s4.seed + 1) % M.SEEDS.length; draw4(); });
  $('zoom4').addEventListener('click', () => { s4.zoom = !s4.zoom; draw4(); });

  ['g5a', 'g5b'].forEach(id => $(id).addEventListener('input', draw5));

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
  window.refreshKalman = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
