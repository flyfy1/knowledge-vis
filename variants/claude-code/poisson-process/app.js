'use strict';
// Poisson process lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every mark and readout comes from window.POISSON_MODEL (model.js). Canvas text is limited to panel
// titles, axis ticks and a few row labels laid out in fixed slots; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.POISSON_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', ghost: '#8696aa', band: 'rgba(103,215,249,0.07)' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Fixed decimals, then trim trailing zeros only when there is a decimal point (so 90 stays 90).
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; };
const pct = v => (100 * v).toFixed(1);
const SEEDS = [1, 2, 3, 4, 5];

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) { canvas.dataset.h = canvas.getAttribute('height') || 300; canvas.style.height = canvas.dataset.h + 'px'; }
  const height = Number(canvas.dataset.h);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}

// Panel title in its own row; shrinks until it fits the width.
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 7);
  ctx.fillText(text, X, Y); ctx.restore();
}
function niceStep(span, px, minPx, steps) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }

// opts: top, bottom, left, right, xMin, xMax, yMin, yMax, yTicks, yFmt, xTicks, xSteps, minPx, xFmt, xLabels [{v, s}], title, logY
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const ly = v => (o.logY ? Math.log10(v) : v);
  const y = v => P.b - (ly(v) - ly(o.yMin)) / (ly(o.yMax) - ly(o.yMin)) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks || []) {
    ctx.strokeStyle = v === o.yMin ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(o.yFmt ? o.yFmt(v) : fmt(v, 3), P.l - 6, y(v) + 4);
  }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.b); ctx.lineTo(P.r, P.b); ctx.stroke();
  ctx.textAlign = 'center';
  // Keep edge labels inside the canvas instead of letting them hang over the border.
  const xText = (s, X) => { const hw = ctx.measureText(s).width / 2; ctx.fillText(s, Math.min(W - 2 - hw, Math.max(2 + hw, X)), P.b + 15); };
  if (o.xLabels) {
    for (const q of o.xLabels) xText(q.s, x(q.v));
  } else if (o.xTicks) {
    const step = niceStep(o.xMax - o.xMin, P.r - P.l, o.minPx || 30, o.xSteps || [0.1, 0.2, 0.25, 0.5, 1, 2, 5, 10, 20, 50]);
    const first = Math.ceil((o.xMin - 1e-9) / step) * step;
    for (let v = first; v <= o.xMax + 1e-9; v += step) {
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
      xText(o.xFmt ? o.xFmt(v) : fmt(v, 2), x(v));
    }
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 9, W - 16);
  return { x, y, P };
}
function vline(ctx, X, y0, y1, color, dash = [4, 4], lw = 1.4) { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y1); ctx.stroke(); ctx.restore(); }
function dot(ctx, X, Y, r, color, ring) { ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); if (ring) { ctx.strokeStyle = C.bg; ctx.lineWidth = 1.2; ctx.stroke(); } ctx.restore(); }
function curve(ctx, m, f, x0, x1, color, { lw = 2, dash = null, n = 200 } = {}) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.beginPath();
  for (let i = 0; i <= n; i++) { const v = x0 + (x1 - x0) * i / n, Y = Math.max(m.P.t, Math.min(m.P.b, m.y(f(v)))); if (!i) ctx.moveTo(m.x(v), Y); else ctx.lineTo(m.x(v), Y); }
  ctx.stroke(); ctx.restore();
}
// Bars for a pmf / share array indexed by k (integers).
function bars(ctx, m, arr, color, width = 0.7, alpha = 0.85) {
  ctx.save(); ctx.fillStyle = color; ctx.globalAlpha = alpha;
  const bw = Math.max(1.5, (m.x(1) - m.x(0)) * width);
  arr.forEach((v, k) => { if (v > 0) { const Y = m.y(v); ctx.fillRect(m.x(k) - bw / 2, Y, bw, m.P.b - Y); } });
  ctx.restore();
}
function pmfDots(ctx, m, f, kMax, r = 3.5) { for (let k = 0; k <= kMax; k++) { const v = f(k); if (v > 1e-4) dot(ctx, m.x(k), m.y(v), r, C.text, true); } }
function niceMax(v) { const steps = [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.8, 1, 1.2, 1.5, 2, 3, 4, 5, 6, 8, 10, 12]; for (const s of steps) if (v <= s) return s; return Math.ceil(v); }
function ticks3(max) { return [0, max / 2, max]; }

/* ---------- shared animation runner (respects reduced motion and hidden pages) ---------- */
const anims = {};
function animate(name, ms, frame, done) {
  stopAnim(name);
  if (reduceMotion()) { frame(1); if (done) done(); return; }
  const start = performance.now();
  const tick = now => { const p = Math.min(1, (now - start) / ms); frame(p); if (p < 1) anims[name] = { id: requestAnimationFrame(tick), frame, done }; else { delete anims[name]; if (done) done(); } };
  anims[name] = { id: requestAnimationFrame(tick), frame, done };
}
function stopAnim(name) { if (anims[name]) { cancelAnimationFrame(anims[name].id); delete anims[name]; } }
function finishAll() { Object.keys(anims).forEach(k => { const a = anims[k]; cancelAnimationFrame(a.id); delete anims[k]; a.frame(1); if (a.done) a.done(); }); }

/* ---------- step 0: slicing time ---------- */
const s0 = { seed: 1 };
function draw0() {
  const n = M.SLICES[num('n0')], lam = num('l0'), mu = lam * M.T0, d = M.sliceDraw(n, lam, s0.seed);
  $('n0v').textContent = String(n); $('l0v').textContent = fmt(lam, 1);
  let { ctx, W, H } = fitCanvas($('c0'));
  const A = panel(ctx, W, { top: 26, bottom: 84, xMin: 0, xMax: M.T0, yMin: 0, yMax: 1, xTicks: true, xSteps: [1, 2, 5], minPx: 26, left: 14, right: 14, title: t('c0a') });
  ctx.save();
  if (n <= 100) {
    ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
    for (let i = 1; i < n; i++) { const X = A.x(i * d.dt); ctx.beginPath(); ctx.moveTo(X, A.P.t); ctx.lineTo(X, A.P.b); ctx.stroke(); }
    ctx.fillStyle = C.orange; d.hits.forEach(i => ctx.fillRect(A.x(i * d.dt) + 0.5, A.P.t + 2, Math.max(1.5, A.x(d.dt) - A.x(0) - 1), A.P.b - A.P.t - 4));
  } else { ctx.strokeStyle = C.orange; ctx.lineWidth = 2; d.times.forEach(v => { ctx.beginPath(); ctx.moveTo(A.x(v), A.P.t + 2); ctx.lineTo(A.x(v), A.P.b - 2); ctx.stroke(); }); }
  ctx.strokeStyle = C.axis; ctx.strokeRect(A.P.l, A.P.t, A.P.r - A.P.l, A.P.b - A.P.t);
  ctx.restore();
  const kMax = Math.max(10, Math.ceil(mu + 4 * Math.sqrt(mu) + 2));
  let pMax = 0; for (let k = 0; k <= kMax; k++) pMax = Math.max(pMax, M.binomPmf(k, n, d.p), M.poissonPmf(k, mu));
  const yMax = niceMax(pMax * 1.08);
  const B = panel(ctx, W, { top: 130, bottom: H - 26, xMin: -0.6, xMax: kMax + 0.6, yMin: 0, yMax, yTicks: ticks3(yMax), xTicks: true, xSteps: [1, 2, 5], minPx: 22, title: t('c0b') });
  bars(ctx, B, Array.from({ length: kMax + 1 }, (_, k) => M.binomPmf(k, n, d.p)), C.orange);
  pmfDots(ctx, B, k => M.poissonPmf(k, mu), kMax);
  // Outline the bar of the count this draw produced (k in the readout).
  if (d.hits.length <= kMax) { ctx.save(); ctx.strokeStyle = C.cyan; ctx.lineWidth = 2; const k = d.hits.length, bw = Math.max(4, (B.x(1) - B.x(0)) * 0.7) + 4, Y = B.y(M.binomPmf(k, n, d.p)) - 3; ctx.strokeRect(B.x(k) - bw / 2, Y, bw, B.P.b - Y); ctx.restore(); }

  ({ ctx, W, H } = fitCanvas($('c0b')));
  const tv = M.SLICES.map(q => M.tvBinomPoisson(q, mu));
  const G = panel(ctx, W, { top: 26, bottom: H - 26, left: 52, xMin: -0.6, xMax: M.SLICES.length - 0.4, yMin: 1e-5, yMax: 1, logY: true, yTicks: [1e-5, 1e-4, 1e-3, 1e-2, 1e-1, 1], yFmt: v => (v >= 0.1 ? String(v) : v.toFixed(Math.round(-Math.log10(v)))), xLabels: M.SLICES.map((q, i) => ({ v: i, s: String(q) })), title: t('c0c') });
  const cur = num('n0'), bw = Math.min(30, (G.x(1) - G.x(0)) * 0.6);
  tv.forEach((v, i) => { ctx.fillStyle = i === cur ? C.cyan : '#3b5068'; const Y = G.y(Math.max(1e-5, v)); ctx.fillRect(G.x(i) - bw / 2, Y, bw, G.P.b - Y); });
  $('r0').textContent = t('s0readout', { n, dt: fmt(d.dt, 3), p: fmt(d.p, 4), k: d.hits.length, mu: fmt(mu, 1), tv: tv[cur].toFixed(4) });
}

/* ---------- step 1: counts in windows ---------- */
const s1 = { set: 0, shown: M.NWIN };
const data1 = () => M.stream(num('l1'), SEEDS[s1.set]);
function draw1() {
  const lam = num('l1'), w = num('w1'), mu = lam * w, times = data1(), counts = M.windowCounts(times, w);
  $('l1v').textContent = fmt(lam, 1); $('w1v').textContent = fmt(w, 1);
  const { ctx, W, H } = fitCanvas($('c1'));
  const NW = 12;
  const A = panel(ctx, W, { top: 26, bottom: 96, xMin: 0, xMax: NW * w, yMin: 0, yMax: 1, left: 14, right: 14, title: t('c1a') });
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.textAlign = 'center';
  for (let i = 0; i < NW; i++) {
    const X0 = A.x(i * w), X1 = A.x((i + 1) * w);
    ctx.fillStyle = i % 2 ? 'rgba(103,215,249,0.03)' : 'rgba(103,215,249,0.16)';
    if (i < s1.shown) ctx.fillRect(X0, A.P.t, X1 - X0, A.P.b - A.P.t);
    ctx.fillStyle = i < s1.shown ? C.cyan : C.muted; ctx.fillText(i < s1.shown ? String(counts[i]) : '·', (X0 + X1) / 2, A.P.b + 15);
  }
  ctx.strokeStyle = C.text; ctx.lineWidth = 1.2;
  for (const v of times) { if (v >= NW * w) break; ctx.beginPath(); ctx.moveTo(A.x(v), A.P.t + 6); ctx.lineTo(A.x(v), A.P.b - 6); ctx.stroke(); }
  if (s1.shown < NW && s1.shown < M.NWIN) { ctx.strokeStyle = C.orange; ctx.lineWidth = 2; ctx.strokeRect(A.x(s1.shown * w), A.P.t, A.x(w) - A.x(0), A.P.b - A.P.t); }
  ctx.restore();
  const shown = counts.slice(0, s1.shown);
  const kMax = Math.max(8, Math.ceil(mu + 4 * Math.sqrt(mu) + 2));
  const hist = M.histogram(shown, kMax).map(c => (shown.length ? c / shown.length : 0));
  let pMax = 0; for (let k = 0; k <= kMax; k++) pMax = Math.max(pMax, M.poissonPmf(k, mu), hist[k]);
  const yMax = niceMax(pMax * 1.08);
  const B = panel(ctx, W, { top: 146, bottom: H - 26, xMin: -0.6, xMax: kMax + 0.6, yMin: 0, yMax, yTicks: ticks3(yMax), xTicks: true, xSteps: [1, 2, 5], minPx: 22, title: t('c1b') });
  bars(ctx, B, hist, C.cyan);
  pmfDots(ctx, B, k => M.poissonPmf(k, mu), kMax);
  const prog = s1.shown < M.NWIN ? t('s1progress', { c: s1.shown, N: M.NWIN }) : '';
  if (!shown.length) { $('r1').textContent = prog; return; }
  const st = M.countStats(shown);
  $('r1').textContent = t('s1readout', { prog, set: s1.set + 1, m: st.mean.toFixed(2), mu: fmt(mu, 2), v: st.variance.toFixed(2), r: isFinite(st.ratio) ? st.ratio.toFixed(2) : '—' });
}

/* ---------- step 2: gaps ---------- */
function tValue() { const lam = num('l1'); return num('t2') / 100 * 5 / lam; }
function draw2() {
  const lam = num('l1'), g = M.gaps(data1()), tt = tValue(), xMax = 5 / lam;
  $('t2v').textContent = fmt(tt, 2);
  const { ctx, W, H } = fitCanvas($('c2'));
  const steps = [0.05, 0.1, 0.2, 0.25, 0.5, 1, 2, 5];
  const A = panel(ctx, W, { top: 26, bottom: 186, xMin: 0, xMax, yMin: 0, yMax: 1, yTicks: [0, 0.5, 1], xTicks: true, xSteps: steps, title: t('c2a') });
  const sorted = g.slice().sort((a, b) => a - b), N = sorted.length;
  ctx.save(); ctx.strokeStyle = C.cyan; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(A.x(0), A.y(1));
  sorted.forEach((v, i) => { if (v > xMax) return; ctx.lineTo(A.x(v), A.y((N - i) / N)); ctx.lineTo(A.x(v), A.y((N - i - 1) / N)); });
  ctx.lineTo(A.x(xMax), A.y(M.survival(g, xMax))); ctx.stroke(); ctx.restore();
  curve(ctx, A, v => Math.exp(-lam * v), 0, xMax, C.orange, { dash: [6, 4] });
  vline(ctx, A.x(tt), A.P.t, A.P.b, C.ghost);
  const e = M.survival(g, tt), th = Math.exp(-lam * tt);
  dot(ctx, A.x(tt), A.y(e), 5, C.cyan, true); dot(ctx, A.x(tt), A.y(th), 4, C.orange, true);
  const NB = 25, bw = xMax / NB, h = new Array(NB).fill(0);
  g.forEach(v => { const i = Math.floor(v / bw); if (i < NB) h[i]++; });
  const dens = h.map(c => c / N / bw), yMax = niceMax(Math.max(lam, ...dens) * 1.05);
  const B = panel(ctx, W, { top: 232, bottom: H - 26, xMin: 0, xMax, yMin: 0, yMax, yTicks: ticks3(yMax), xTicks: true, xSteps: steps, title: t('c2b') });
  ctx.save(); ctx.fillStyle = C.cyan; ctx.globalAlpha = 0.75;
  dens.forEach((v, i) => { const X0 = B.x(i * bw) + 0.5, X1 = B.x((i + 1) * bw) - 0.5, Y = B.y(Math.min(v, yMax)); ctx.fillRect(X0, Y, X1 - X0, B.P.b - Y); });
  ctx.restore();
  curve(ctx, B, v => lam * Math.exp(-lam * v), 0, xMax, C.orange, { dash: [6, 4] });
  vline(ctx, B.x(tt), B.P.t, B.P.b, C.ghost);
  $('r2').textContent = t('s2readout', { lam: fmt(lam, 1), m: M.mean(g).toFixed(3), inv: fmt(1 / lam, 3), t: fmt(tt, 2), e: pct(e), th: pct(th) });
}

/* ---------- step 3: memorylessness ---------- */
const s3 = { kind: 'exp', hist: { exp: new Set(), unif: new Set() } };
const samples3 = { exp: M.waitSample('exp', 1), unif: M.waitSample('unif', 1) };
function draw3() {
  const s = num('s3'), kind = s3.kind, rest = M.remaining(samples3[kind], s);
  $('s3v').textContent = fmt(s, 1);
  $('kindExp').setAttribute('aria-pressed', kind === 'exp'); $('kindUnif').setAttribute('aria-pressed', kind === 'unif');
  s3.hist[kind].add(s.toFixed(1));
  let { ctx, W, H } = fitCanvas($('c3'));
  const NB = 40, xMax = 4, bw = xMax / NB, h = new Array(NB).fill(0);
  rest.forEach(v => { const i = Math.floor(v / bw); if (i < NB) h[i]++; });
  const dens = h.map(c => c / rest.length / bw);
  const yMax = kind === 'exp' ? 1.2 : niceMax(Math.max(0.6, ...dens) * 1.05);
  const A = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax, yMin: 0, yMax, yTicks: ticks3(yMax), xTicks: true, xSteps: [0.5, 1, 2], title: t('c3a') });
  ctx.save(); ctx.fillStyle = C.cyan; ctx.globalAlpha = 0.75;
  dens.forEach((v, i) => { const X0 = A.x(i * bw) + 0.5, X1 = A.x((i + 1) * bw) - 0.5, Y = A.y(Math.min(v, yMax)); ctx.fillRect(X0, Y, X1 - X0, A.P.b - Y); });
  ctx.restore();
  if (kind === 'exp') curve(ctx, A, v => Math.exp(-v), 0, xMax, C.text, { dash: [5, 4], lw: 1.6 });
  else { ctx.save(); ctx.strokeStyle = C.text; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(A.x(0), A.y(0.5)); ctx.lineTo(A.x(2), A.y(0.5)); ctx.lineTo(A.x(2), A.y(0)); ctx.stroke(); ctx.restore(); }

  ({ ctx, W, H } = fitCanvas($('c3b')));
  const B = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 2, yMin: 0, yMax: 1.2, yTicks: [0, 0.5, 1], xTicks: true, xSteps: [0.5, 1], title: t('c3b') });
  curve(ctx, B, () => 1, 0, 2, C.cyan, { lw: 2 });
  curve(ctx, B, v => (2 - v) / 2, 0, 2, C.orange, { dash: [6, 4] });
  for (const k of ['exp', 'unif']) for (const key of s3.hist[k]) {
    const sv = Number(key), r = M.remaining(samples3[k], sv); if (!r.length) continue;
    const isNow = k === kind && Math.abs(sv - s) < 1e-9;
    dot(ctx, B.x(sv), B.y(M.mean(r)), isNow ? 6 : 3.5, isNow ? C.text : (k === 'exp' ? C.cyan : C.orange), true);
  }
  $('r3').textContent = t('s3readout', { kind: t(kind === 'exp' ? 'kindNameExp' : 'kindNameUnif'), n: rest.length, s: fmt(s, 1), m: M.mean(rest).toFixed(3), th: fmt(M.remainingTheory(kind, s), 3) });
}

/* ---------- step 4: the bus-stop paradox ---------- */
const s4 = { mode: 'regular', seed: 1, shown: 0 };
function data4() { const b = M.buses(s4.mode, s4.seed); return { b, pax: M.passengers(b, s4.seed) }; }
function draw4() {
  const { b, pax } = data4(), vis = pax.slice(0, s4.shown), TV = 120;
  $('modeReg').setAttribute('aria-pressed', s4.mode === 'regular'); $('modePoi').setAttribute('aria-pressed', s4.mode === 'poisson');
  const { ctx, W, H } = fitCanvas($('c4'));
  const A = panel(ctx, W, { top: 26, bottom: 176, xMin: 0, xMax: TV, yMin: 0, yMax: 1, left: 14, right: 14, xTicks: true, xSteps: [10, 20, 30, 60], minPx: 30, title: t('c4a') });
  ctx.save(); ctx.strokeStyle = C.cyan; ctx.lineWidth = 2.5;
  b.forEach(v => { if (v <= TV) { ctx.beginPath(); ctx.moveTo(A.x(v), A.P.t); ctx.lineTo(A.x(v), A.P.b); ctx.stroke(); } });
  const lanes = 7;
  vis.forEach((p, i) => {
    if (p.t > TV) return;
    const Y = A.P.t + 12 + (i % lanes) * (A.P.b - A.P.t - 24) / (lanes - 1);
    ctx.strokeStyle = 'rgba(232,237,244,0.45)'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(A.x(p.t), Y); ctx.lineTo(A.x(Math.min(TV, p.bus)), Y); ctx.stroke(); ctx.setLineDash([]);
    dot(ctx, A.x(p.t), Y, 3.2, C.text);
  });
  ctx.restore();
  const maxW = Math.max(30, Math.ceil(Math.max(...pax.map(p => p.wait)) / 10) * 10), bw = 2, NB = maxW / bw, h = new Array(NB).fill(0);
  vis.forEach(p => { h[Math.min(NB - 1, Math.floor(p.wait / bw))]++; });
  const sh = h.map(c => (vis.length ? c / vis.length : 0)), yMax = niceMax(Math.max(0.1, ...sh) * 1.08);
  const B = panel(ctx, W, { top: 222, bottom: H - 26, xMin: 0, xMax: maxW, yMin: 0, yMax, yTicks: ticks3(yMax), xTicks: true, xSteps: [5, 10, 20], minPx: 30, title: t('c4b') });
  ctx.save(); ctx.fillStyle = C.cyan; ctx.globalAlpha = 0.75;
  sh.forEach((v, i) => { if (!v) return; const X0 = B.x(i * bw) + 0.5, X1 = B.x((i + 1) * bw) - 0.5, Y = B.y(v); ctx.fillRect(X0, Y, X1 - X0, B.P.b - Y); });
  ctx.restore();
  const th = M.busTheory(s4.mode);
  vline(ctx, B.x(th.wait), B.P.t, B.P.b, C.orange, [6, 4], 2);
  const mode = t(s4.mode === 'regular' ? 'modeNameReg' : 'modeNamePoi');
  const head = M.busStats(b, pax);
  if (!vis.length) { $('r4').textContent = t('s4idle', { mode, b: b.length, h: head.meanHead.toFixed(2) }); return; }
  const st = M.busStats(b, vis);
  vline(ctx, B.x(st.meanWait), B.P.t, B.P.b, C.text, [], 2);
  const prog = s4.shown < M.PASS ? t('s4progress', { c: s4.shown, N: M.PASS }) : '';
  $('r4').textContent = t('s4readout', { prog, mode, w: st.meanWait.toFixed(2), tw: th.wait, h: st.meanHead.toFixed(2), g: st.meanGap.toFixed(2), x: (st.meanGap / st.meanHead).toFixed(2), hl: pct(st.headLong), pl: pct(st.long) });
}

/* ---------- step 5: merging and thinning ---------- */
const s5 = { set: 0 };
function draw5() {
  const l1 = num('a5'), l2 = num('b5'), p = num('p5'), sum = l1 + l2, r = M.mergeThin(l1, l2, p, SEEDS[s5.set]);
  $('a5v').textContent = fmt(l1, 1); $('b5v').textContent = fmt(l2, 1); $('p5v').textContent = fmt(p, 2);
  const { ctx, W, H } = fitCanvas($('c5'));
  const TV = W < 500 ? 10 : 15, left = 56, rDot = W < 500 ? 3.2 : 4;
  const A = panel(ctx, W, { top: 26, bottom: 190, left, xMin: 0, xMax: TV, yMin: 0, yMax: 4, xTicks: true, xSteps: [1, 2, 5], minPx: 26, title: t('c5a', { m: TV }) });
  const rows = [['rowA', r.A.map(v => ({ t: v, c: C.cyan }))], ['rowB', r.B.map(v => ({ t: v, c: C.orange }))], ['rowM', r.merged.map(e => ({ t: e.t, c: e.src === 'A' ? C.cyan : C.orange }))], ['rowK', r.kept.map(e => ({ t: e.t, c: C.green }))]];
  ctx.save();
  rows.forEach(([key, pts], i) => {
    const Y = A.y(3.5 - i);
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(A.P.l, Y); ctx.lineTo(A.P.r, Y); ctx.stroke();
    let size = 11; ctx.fillStyle = C.muted; ctx.textAlign = 'right';
    do { ctx.font = `${size}px system-ui,sans-serif`; if (ctx.measureText(t(key)).width <= left - 10) break; size -= 0.5; } while (size > 8);
    ctx.fillText(t(key), left - 6, Y + 4);
    pts.forEach(q => { if (q.t <= TV) dot(ctx, A.x(q.t), Y, rDot, q.c, true); });
  });
  ctx.restore();
  const xMax = 5 / sum;
  const B = panel(ctx, W, { top: 236, bottom: H - 26, left, xMin: 0, xMax, yMin: 0, yMax: 1, yTicks: [0, 0.5, 1], xTicks: true, xSteps: [0.05, 0.1, 0.2, 0.25, 0.5, 1, 2], title: t('c5b') });
  const sorted = r.gaps.slice().sort((a, b) => a - b), N = sorted.length;
  ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(B.x(0), B.y(1));
  sorted.forEach((v, i) => { if (v > xMax) return; ctx.lineTo(B.x(v), B.y((N - i) / N)); ctx.lineTo(B.x(v), B.y((N - i - 1) / N)); });
  ctx.lineTo(B.x(xMax), B.y(M.survival(r.gaps, xMax))); ctx.stroke(); ctx.restore();
  curve(ctx, B, v => Math.exp(-sum * v), 0, xMax, C.orange, { dash: [6, 4] });
  $('r5').textContent = t('s5readout', { m: r.mergedRate.toFixed(3), ms: fmt(sum, 2), sa: pct(r.shareA), sth: pct(l1 / sum), g: r.meanGap.toFixed(3), gth: (1 / sum).toFixed(3), k: r.keptRate.toFixed(3), kth: fmt(p * sum, 3), r: isFinite(r.keptRatio) ? r.keptRatio.toFixed(2) : t('s5none') });
}

/* ---------- step 6: a rate that changes ---------- */
const s6 = { set: 0 };
const clock = h => { const tot = Math.round((8 + h) * 60); return Math.floor(tot / 60) + ':' + String(tot % 60).padStart(2, '0'); };
function draw6() {
  const a = num('a6'), w = num('w6'), b = Math.min(M.DAY, a + w), dd = M.days(SEEDS[s6.set]), L = M.Lambda(a, b);
  $('a6v').textContent = clock(a); $('w6v').textContent = fmt(w, 1) + (b - a < w ? ' → ' + fmt(b - a, 1) : '');
  const { ctx, W, H } = fitCanvas($('c6'));
  const A = panel(ctx, W, { top: 26, bottom: 168, xMin: 0, xMax: M.DAY, yMin: 0, yMax: 16, yTicks: [0, 5, 10, 15], title: t('c6a') });
  ctx.save(); ctx.fillStyle = 'rgba(255,180,84,0.3)'; ctx.beginPath(); ctx.moveTo(A.x(a), A.y(0));
  for (let i = 0; i <= 60; i++) { const v = a + (b - a) * i / 60; ctx.lineTo(A.x(v), A.y(M.rate(v))); }
  ctx.lineTo(A.x(b), A.y(0)); ctx.closePath(); ctx.fill(); ctx.restore();
  curve(ctx, A, M.rate, 0, M.DAY, C.orange, { lw: 2.2, n: 240 });
  // Day 1's calls in a strip under the rate panel; the clock labels sit under the strip.
  const S = panel(ctx, W, { top: 176, bottom: 196, xMin: 0, xMax: M.DAY, yMin: 0, yMax: 1, xLabels: [0, 2, 4, 6, 8, 10, 12].map(v => ({ v, s: clock(v) })) });
  ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 1;
  dd[0].forEach(v => { ctx.beginPath(); ctx.moveTo(S.x(v), S.P.t + 2); ctx.lineTo(S.x(v), S.P.b - 2); ctx.stroke(); });
  ctx.strokeStyle = C.orange; ctx.strokeRect(S.x(a), S.P.t, S.x(b) - S.x(a), S.P.b - S.P.t);
  ctx.restore();
  const counts = M.windowAcrossDays(dd, a, b), st = M.countStats(counts);
  const kMax = Math.max(8, Math.ceil(L + 4 * Math.sqrt(L) + 2));
  const hist = M.histogram(counts, kMax).map(c => c / counts.length);
  let pMax = 0; for (let k = 0; k <= kMax; k++) pMax = Math.max(pMax, M.poissonPmf(k, L), hist[k]);
  const yMax = niceMax(pMax * 1.08);
  const B = panel(ctx, W, { top: 246, bottom: H - 26, xMin: -0.6, xMax: kMax + 0.6, yMin: 0, yMax, yTicks: ticks3(yMax), xTicks: true, xSteps: [1, 2, 5, 10], minPx: 22, title: t('c6b') });
  bars(ctx, B, hist, C.cyan);
  pmfDots(ctx, B, k => M.poissonPmf(k, L), kMax);
  $('r6').textContent = t('s6readout', { a: clock(a), b: clock(b), L: L.toFixed(2), m: st.mean.toFixed(2), v: st.variance.toFixed(2), r: st.ratio.toFixed(2) });
  const pool = M.pooledHourly(dd);
  $('r6b').textContent = t('s6pooled', { m: pool.mean.toFixed(2), v: pool.variance.toFixed(2), r: pool.ratio.toFixed(2), rt: pool.theoryRatio.toFixed(2) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); draw6(); }

function setup() {
  ['n0', 'l0'].forEach(id => $(id).addEventListener('input', draw0));
  $('redraw0').addEventListener('click', () => { s0.seed++; draw0(); });

  const re12 = () => { stopAnim('s1'); s1.shown = M.NWIN; draw1(); draw2(); };
  ['l1', 'w1'].forEach(id => $(id).addEventListener('input', re12));
  $('reroll1').addEventListener('click', () => { s1.set = (s1.set + 1) % SEEDS.length; re12(); });
  $('count1').addEventListener('click', () => { s1.shown = 0; draw1(); animate('s1', 5000, p => { s1.shown = Math.round(p * M.NWIN); draw1(); }); });

  $('t2').addEventListener('input', draw2);

  $('s3').addEventListener('input', draw3);
  $('kindExp').addEventListener('click', () => { s3.kind = 'exp'; draw3(); });
  $('kindUnif').addEventListener('click', () => { s3.kind = 'unif'; draw3(); });
  $('clear3').addEventListener('click', () => { s3.hist = { exp: new Set(), unif: new Set() }; draw3(); });

  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked'), ok = !!choice && choice.value === 'b';
    $('quizFeedback').textContent = t(ok ? 'correct' : 'wrong'); $('quizFeedback').style.color = ok ? C.green : C.orange; $('quizFeedback').dataset.state = ok ? 'correct' : 'wrong';
  });
  const setMode = m => { stopAnim('s4'); const had = s4.shown > 0; s4.mode = m; s4.shown = had ? M.PASS : 0; draw4(); };
  $('modeReg').addEventListener('click', () => setMode('regular'));
  $('modePoi').addEventListener('click', () => setMode('poisson'));
  $('pax4').addEventListener('click', () => { s4.shown = 0; animate('s4', 5000, p => { s4.shown = Math.round(p * M.PASS); draw4(); }); });
  $('reroll4').addEventListener('click', () => { stopAnim('s4'); s4.seed = s4.seed % SEEDS.length + 1; s4.shown = s4.shown > 0 ? M.PASS : 0; draw4(); });

  ['a5', 'b5', 'p5'].forEach(id => $(id).addEventListener('input', draw5));
  $('reroll5').addEventListener('click', () => { s5.set = (s5.set + 1) % SEEDS.length; draw5(); });

  ['a6', 'w6'].forEach(id => $(id).addEventListener('input', draw6));
  $('reroll6').addEventListener('click', () => { s6.set = (s6.set + 1) % SEEDS.length; draw6(); });

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
