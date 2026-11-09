'use strict';
// Quantum basics lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every arrow, bar, curve and simulated count comes from window.QB_MODEL (model.js). Canvas text is limited
// to panel titles (own row), axis ticks, ket labels at fixed sphere/axis ends and the interferometer part names.
(function () {

const $ = id => document.getElementById(id);
const M = window.QB_MODEL;
const t = (...a) => window.QB_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', ghost: '#8696aa' };
const num = id => Number($(id).value);
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (d > 0) s = s.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') || '0'; return s.replace('-', '−'); };
const fx = (v, d = 3) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; return v.toFixed(d).replace('-', '−'); };

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) { canvas.dataset.h = canvas.getAttribute('height') || 300; canvas.style.height = canvas.dataset.h + 'px'; }
  const height = Number(canvas.dataset.h);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height);
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
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks || []) {
    ctx.strokeStyle = Math.abs(v) < 1e-9 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(fmt(v, 2), P.l - 6, y(v) + 4);
  }
  if (o.xTicks) {
    const step = niceStep(o.xMax - o.xMin, P.r - P.l, o.minPx || 32, o.xSteps);
    ctx.textAlign = 'center';
    for (let v = Math.ceil((o.xMin - 1e-9) / step) * step; v <= o.xMax + 1e-9; v += step) {
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
      ctx.fillText(fmt(v, 2) + (o.xUnit || ''), x(v), P.b + 15);
    }
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 12, W - 16);
  return { x, y, P };
}
function dot(ctx, X, Y, r, col, ring) { ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); if (ring) { ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5; ctx.stroke(); } ctx.restore(); }
function line(ctx, x0, y0, x1, y1, col, lw = 1.5, dash = null, alpha = 1) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.globalAlpha = alpha; if (dash) ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.restore(); }
function arrow(ctx, x0, y0, x1, y1, col, lw = 2.4) {
  const L = Math.hypot(x1 - x0, y1 - y0); if (L < 1) return;
  line(ctx, x0, y0, x1, y1, col, lw);
  const ux = (x1 - x0) / L, uy = (y1 - y0) / L, h = Math.min(6.5 + lw, L * 0.4);
  ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - ux * h - uy * h * 0.5, y1 - uy * h + ux * h * 0.5); ctx.lineTo(x1 - ux * h + uy * h * 0.5, y1 - uy * h - ux * h * 0.5); ctx.closePath(); ctx.fill(); ctx.restore();
}
function curve(ctx, m, f, x0, x1, col, lw = 2, dash = null, n = 240) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.beginPath();
  for (let i = 0; i <= n; i++) { const v = x0 + (x1 - x0) * i / n, X = m.x(v), Y = m.y(f(v)); if (!i) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
  ctx.stroke(); ctx.restore();
}
function label(ctx, text, X, Y, align, col = C.text, size = 12) { ctx.save(); ctx.fillStyle = col; ctx.font = `600 ${size}px system-ui,sans-serif`; ctx.textAlign = align; ctx.fillText(text, X, Y); ctx.restore(); }
// Equal-scale square plane centred in the canvas below a title row: maps [−lim, lim]² to pixels.
function plane(ctx, W, H, lim, ttl) {
  title(ctx, ttl, 8, 18, W - 16);
  const size = Math.min(W - 60, H - 64), cx = 30 + (W - 30) / 2, cy = 30 + (H - 30) / 2 - 6, k = size / 2 / lim;
  const X = v => cx + v * k, Y = v => cy - v * k;
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  [-1, 0, 1].forEach(v => {
    ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(X(-lim), Y(v)); ctx.lineTo(X(lim), Y(v)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(X(v), Y(-lim)); ctx.lineTo(X(v), Y(lim)); ctx.stroke();
    ctx.textAlign = 'center'; ctx.fillText(fmt(v), X(v), Y(-lim) + 14);
    if (v !== 0) { ctx.textAlign = 'right'; ctx.fillText(fmt(v), X(-lim) - 5, Y(v) + 4); }
  });
  ctx.restore();
  ctx.save(); ctx.strokeStyle = C.raw; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cx, cy, k, 0, 7); ctx.stroke(); ctx.restore();
  return { X, Y, cx, cy, k };
}

/* ---------- step 0: amplitudes and probabilities ---------- */
function draw0() {
  const psi = num('psi0'), s = M.realState(psi);
  $('psi0v').textContent = psi + '°';
  let { ctx, W, H } = fitCanvas($('c0a'));
  const p = plane(ctx, W, H, 1.2, t('c0a'));
  line(ctx, p.X(s.a.re), p.Y(s.b.re), p.X(s.a.re), p.Y(0), C.ghost, 1.2, [4, 4]);
  line(ctx, p.X(s.a.re), p.Y(s.b.re), p.X(0), p.Y(s.b.re), C.ghost, 1.2, [4, 4]);
  line(ctx, p.X(0), p.Y(0), p.X(s.a.re), p.Y(0), C.cyan, 5); line(ctx, p.X(0), p.Y(0), p.X(0), p.Y(s.b.re), C.orange, 5);
  arrow(ctx, p.X(0), p.Y(0), p.X(s.a.re), p.Y(s.b.re), C.text, 2.6);
  ({ ctx, W, H } = fitCanvas($('c0b')));
  const m = panel(ctx, W, { top: 30, bottom: H - 30, xMin: 0, xMax: 4, yMin: -1.08, yMax: 1.08, yTicks: [-1, -0.5, 0, 0.5, 1], title: t('c0b') });
  const bw = Math.min(40, (m.P.r - m.P.l) / 4 * 0.55);
  [[s.a.re, C.cyan, 'α'], [s.b.re, C.orange, 'β'], [s.p0, C.cyan, '|α|²'], [s.p1, C.orange, '|β|²']].forEach(([v, col, name], i) => {
    const X = m.x(i + 0.5), Y0 = m.y(0), Y1 = m.y(v);
    ctx.save(); ctx.fillStyle = col; ctx.globalAlpha = i < 2 ? 0.45 : 0.9; ctx.fillRect(X - bw / 2, Math.min(Y0, Y1), bw, Math.max(1.5, Math.abs(Y1 - Y0)));
    if (i < 2) { ctx.globalAlpha = 1; ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]); ctx.strokeRect(X - bw / 2, Math.min(Y0, Y1), bw, Math.abs(Y1 - Y0)); }
    ctx.restore();
    label(ctx, name, X, m.P.b + 18, 'center', C.muted, 12);
  });
  line(ctx, m.x(2), m.P.t, m.x(2), m.P.b, C.axis, 1);
  const neg = s.a.re < -1e-9 || s.b.re < -1e-9 ? t('s0neg') : '';
  $('r0').textContent = t('s0readout', { psi, a: fx(s.a.re), b: fx(s.b.re), p0: fx(s.p0), p1: fx(s.p1), sum: fx(s.p0 + s.p1) }) + neg;
}

/* ---------- step 1: one outcome at a time ---------- */
const SEED1 = 2026;
const s1 = { r: M.rng(SEED1), res: [], again: null };
const p1now = () => M.realState(num('psi0')).p0;
function draw1() {
  const p = p1now(), n = s1.res.length, c0 = s1.res.filter(v => v === 0).length;
  const { ctx, W, H } = fitCanvas($('c1'));
  title(ctx, t('c1strip', { n }), 8, 18, W - 16);
  const tile = 12, gap = 2, cols = Math.floor((W - 16 + gap) / (tile + gap)), recent = s1.res.slice(-cols);
  recent.forEach((v, i) => { ctx.fillStyle = v === 0 ? C.cyan : C.orange; ctx.fillRect(8 + i * (tile + gap), 30, tile, 22); });
  if (!n) { ctx.strokeStyle = C.grid; ctx.setLineDash([3, 3]); ctx.strokeRect(8, 30, W - 16, 22); ctx.setLineDash([]); }
  const xMax = Math.max(10, n);
  const steps = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000];
  const m = panel(ctx, W, { top: 96, bottom: H - 26, xMin: 0, xMax, yMin: 0, yMax: 1.04, yTicks: [0, 0.25, 0.5, 0.75, 1], xTicks: true, xSteps: steps, minPx: 34, title: t('c1freq') });
  // ±2σ band for the frequency after k shots
  ctx.save(); ctx.fillStyle = 'rgba(232,237,244,0.10)'; ctx.beginPath();
  const K = Math.max(1, xMax), sd = k => 2 * Math.sqrt(p * (1 - p) / k);
  for (let k = 1; k <= K; k += Math.max(1, Math.floor(K / 200))) ctx.lineTo(m.x(k), m.y(Math.min(1, p + sd(k))));
  for (let k = K; k >= 1; k -= Math.max(1, Math.floor(K / 200))) ctx.lineTo(m.x(k), m.y(Math.max(0, p - sd(k))));
  ctx.closePath(); ctx.fill(); ctx.restore();
  line(ctx, m.x(0), m.y(p), m.x(xMax), m.y(p), C.cyan, 1.4, [6, 4]);
  if (n) {
    ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.beginPath(); let c = 0;
    s1.res.forEach((v, i) => { if (v === 0) c++; const X = m.x(i + 1), Y = m.y(c / (i + 1)); if (!i) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); });
    ctx.stroke(); ctx.restore(); dot(ctx, m.x(n), m.y(c0 / n), 4.5, C.text, true);
  }
  let txt = n ? t('s1readout', { p: fx(p), n, c0, c1: n - c0, f: fx(c0 / n), lo: fx(Math.max(0, p - 2 * Math.sqrt(p * (1 - p) / n))), hi: fx(Math.min(1, p + 2 * Math.sqrt(p * (1 - p) / n))) }) : t('s1empty', { p: fx(p) });
  if (s1.again) txt += t('s1again', { k: s1.again.first, list: s1.again.rest.join(' ') });
  $('r1').textContent = txt;
}
function measure(k) { const p = p1now(); s1.res.push(...M.shots(p, k, s1.r)); if (s1.res.length > 5000) s1.res = s1.res.slice(-5000); draw1(); }
function reset1() { s1.r = M.rng(SEED1); s1.res = []; s1.again = null; }

/* ---------- step 2: relative phase ---------- */
const s2 = { hist: new Set() };
function draw2() {
  const th = num('th2'), ph = num('ph2'), s = M.bloch(th, ph);
  $('th2v').textContent = th + '°'; $('ph2v').textContent = ph + '°';
  s2.hist.add(ph);
  let { ctx, W, H } = fitCanvas($('c2a'));
  const p = plane(ctx, W, H, 1.2, t('c2a'));
  ctx.save(); ctx.strokeStyle = C.orange; ctx.globalAlpha = 0.35; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.arc(p.cx, p.cy, p.k * Math.sqrt(M.abs2(s.b)), 0, 7); ctx.stroke(); ctx.restore();
  arrow(ctx, p.X(0), p.Y(0), p.X(s.a.re), p.Y(s.a.im), C.cyan, 6);  // wider underneath so an aligned β stays visible on top
  arrow(ctx, p.X(0), p.Y(0), p.X(s.b.re), p.Y(s.b.im), C.orange, 2.4);
  ({ ctx, W, H } = fitCanvas($('c2b')));
  const m = panel(ctx, W, { top: 30, bottom: H - 26, xMin: 0, xMax: 360, yMin: 0, yMax: 1.04, yTicks: [0, 0.25, 0.5, 0.75, 1], xTicks: true, xSteps: [45, 90, 180], minPx: 36, xUnit: '°', title: t('c2b') });
  curve(ctx, m, () => s.pZ, 0, 360, C.green, 2.2, null, 2);
  curve(ctx, m, q => M.bloch(th, q).pX, 0, 360, C.pink, 2.2);
  [...s2.hist].forEach(q => { if (q === ph) return; dot(ctx, m.x(q), m.y(M.bloch(th, q).pX), 3, C.text); });
  dot(ctx, m.x(ph), m.y(s.pZ), 5, C.green, true); dot(ctx, m.x(ph), m.y(s.pX), 5.5, C.pink, true);
  line(ctx, m.x(ph), m.P.t, m.x(ph), m.P.b, C.ghost, 1, [4, 4], 0.6);
  const bc = `${fx(s.b.re)} ${s.b.im < -5e-4 ? '−' : '+'} ${fx(Math.abs(s.b.im))}i`;
  $('r2').textContent = t('s2readout', { a: fx(s.a.re), bm: fx(Math.sqrt(M.abs2(s.b))), ph, bc, pz: fx(s.pZ), px: fx(s.pX) });
}

/* ---------- step 3: Mach–Zehnder interferometer ---------- */
const s3 = { which: false, r: M.rng(7), runs: new Map() };
function draw3() {
  const ph = num('ph3'), q = M.mz(ph, s3.which), key = ph + (s3.which ? 'w' : 'q'), run = s3.runs.get(key);
  $('ph3v').textContent = ph + '°';
  $('whichOff').setAttribute('aria-pressed', !s3.which); $('whichOn').setAttribute('aria-pressed', s3.which);
  let { ctx, W, H } = fitCanvas($('c3a'));
  title(ctx, t('c3a'), 8, 18, W - 16);
  const x0 = Math.round(W * 0.22), x1 = Math.round(W * 0.66), y0 = 88, y1 = H - 66, xd = W - 34, yd = 40, xm = (x0 + x1) / 2;
  const beam = (a, b, c, d, w, col = C.cyan) => line(ctx, a, b, c, d, col, Math.max(0.6, w), null, w > 0.05 ? 0.9 : 0.25);
  beam(14, y1, x0, y1, 4);                          // source → BS1
  beam(x0, y1, x1, y1, 2.8); beam(x0, y1, x0, y0, 2.8);   // the two arms after BS1 (amplitude 1/√2 each)
  beam(x0, y0, x1, y0, 2.8); beam(x1, y1, x1, y0, 2.8);
  beam(x1, y0, xd - 12, y0, 0.3 + 4 * q.p0); beam(x1, y0, x1, yd + 12, 0.3 + 4 * q.p1); // outputs: width ∝ probability
  const bs = (X, Y) => line(ctx, X - 11, Y + 11, X + 11, Y - 11, C.text, 3, null, 0.9);
  const mirror = (X, Y) => line(ctx, X - 11, Y + 11, X + 11, Y - 11, C.ghost, 5);
  bs(x0, y1); bs(x1, y0); mirror(x0, y0); mirror(x1, y1);
  ctx.save(); ctx.fillStyle = C.orange; ctx.globalAlpha = 0.85; ctx.fillRect(xm - 9, y0 - 9, 18, 18); ctx.restore();
  if (s3.which) { ctx.save(); ctx.strokeStyle = C.pink; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(xm, y1, 10, 0, 7); ctx.stroke(); ctx.restore(); }
  const det = (X, Y, p) => { ctx.save(); ctx.fillStyle = C.green; ctx.globalAlpha = 0.15 + 0.85 * p; ctx.fillRect(X - 11, Y - 11, 22, 22); ctx.globalAlpha = 1; ctx.strokeStyle = C.green; ctx.strokeRect(X - 11, Y - 11, 22, 22); ctx.restore(); };
  det(xd, y0, q.p0); det(x1, yd, q.p1);
  dot(ctx, 14, y1, 5, C.cyan);
  label(ctx, 'BS1', x0, y1 + 30, 'center', C.muted, 11); label(ctx, 'BS2', x1 - 14, y0 + 26, 'right', C.muted, 11);
  label(ctx, 'φ', xm, y0 - 16, 'center', C.orange, 13);
  label(ctx, 'D0', xd, y0 + 30, 'center', C.green, 11); label(ctx, 'D1', x1 - 18, yd + 4, 'right', C.green, 11);
  if (s3.which) label(ctx, t('marker'), xm, y1 + 30, 'center', C.pink, 11);
  ({ ctx, W, H } = fitCanvas($('c3b')));
  const m = panel(ctx, W, { top: 30, bottom: H - 26, xMin: 0, xMax: 360, yMin: 0, yMax: 1.04, yTicks: [0, 0.25, 0.5, 0.75, 1], xTicks: true, xSteps: [45, 90, 180], minPx: 36, xUnit: '°', title: t('c3b') });
  curve(ctx, m, v => M.mz(v, false).pQuantum, 0, 360, C.cyan, s3.which ? 1.2 : 2.4, s3.which ? [4, 4] : null);
  curve(ctx, m, () => 0.5, 0, 360, C.ghost, s3.which ? 2.4 : 1.2, [6, 4], 2);
  for (const [k, v] of s3.runs) { const phk = parseFloat(k), w = k.endsWith('w'); dot(ctx, m.x(phk), m.y(v.c0 / v.n), 3.4, w ? C.pink : C.text); }
  dot(ctx, m.x(ph), m.y(q.p0), 5.5, s3.which ? C.ghost : C.cyan, true);
  const counts = run ? t('s3counts', { n: run.n, c0: run.c0, c1: run.n - run.c0, f: fx(run.c0 / run.n) }) : '';
  $('r3').textContent = t(s3.which ? 's3which' : 's3open', { ph, p0: fx(q.p0), p1: fx(q.p1), pq: fx(q.pQuantum) }) + counts;
}

/* ---------- step 4: the Bloch sphere ---------- */
const s4 = { trail: [] };
const A = 30 * M.DEG, E = 18 * M.DEG;
const proj = (x, y, z) => ({ sx: -x * Math.sin(A) + y * Math.cos(A), sy: z * Math.cos(E) - (x * Math.cos(A) + y * Math.sin(A)) * Math.sin(E) });
function draw4() {
  const th = num('th4'), ph = num('ph4'), s = M.bloch(th, ph);
  $('th4v').textContent = th + '°'; $('ph4v').textContent = ph + '°';
  let { ctx, W, H } = fitCanvas($('c4a'));
  title(ctx, t('c4a'), 8, 18, W - 16);
  const R = Math.min(W / 2 - 44, (H - 84) / 2), cx = W / 2, cy = 30 + (H - 30) / 2;
  const P = (x, y, z) => { const q = proj(x, y, z); return [cx + R * q.sx, cy - R * q.sy]; };
  ctx.save(); ctx.strokeStyle = C.raw; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
  ctx.beginPath(); for (let i = 0; i <= 120; i++) { const a = i / 120 * 2 * Math.PI, [X, Y] = P(Math.cos(a), Math.sin(a), 0); if (!i) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); } ctx.setLineDash([3, 4]); ctx.stroke(); ctx.restore();
  [[[0, 0, -1], [0, 0, 1], C.green], [[-1, 0, 0], [1, 0, 0], C.pink], [[0, -1, 0], [0, 1, 0], C.violet]].forEach(([a, b, col]) => { const p0 = P(...a), p1 = P(...b); line(ctx, p0[0], p0[1], p1[0], p1[1], col, 1.2, [2, 3], 0.8); });
  const lab = (v, text, col, dx, dy, al) => { const [X, Y] = P(...v); label(ctx, text, X + dx, Y + dy, al, col, 12); };
  lab([0, 0, 1], '|0⟩', C.green, 0, -8, 'center'); lab([0, 0, -1], '|1⟩', C.green, 0, 18, 'center');
  lab([1, 0, 0], '|+⟩', C.pink, -6, 14, 'right'); lab([0, 1, 0], '|+i⟩', C.violet, 8, 4, 'left');
  s4.trail.forEach(q => { const [X, Y] = P(q.x, q.y, q.z); dot(ctx, X, Y, 2, C.text); });
  const [vx, vy] = P(s.v.x, s.v.y, s.v.z), [hx, hy] = P(0, 0, s.v.z);
  line(ctx, vx, vy, hx, hy, C.ghost, 1, [3, 3]);
  arrow(ctx, cx, cy, vx, vy, C.text, 2.6); dot(ctx, vx, vy, 5, C.text, true);
  ({ ctx, W, H } = fitCanvas($('c4b')));
  const m = panel(ctx, W, { top: 30, bottom: H - 26, xMin: 0, xMax: 1, yMin: 0, yMax: 3, xTicks: true, xSteps: [0.25, 0.5], minPx: 34, left: 34, title: t('c4b') });
  [['Z', s.pZ, C.green], ['X', s.pX, C.pink], ['Y', s.pY, C.violet]].forEach(([name, v, col], i) => {
    const yc = m.y(2.5 - i), h = Math.min(32, (m.P.b - m.P.t) / 5);
    ctx.save(); ctx.strokeStyle = C.grid; ctx.strokeRect(m.x(0), yc - h / 2, m.x(1) - m.x(0), h); ctx.fillStyle = col; ctx.globalAlpha = 0.85; ctx.fillRect(m.x(0), yc - h / 2, Math.max(1.5, m.x(v) - m.x(0)), h); ctx.restore();
    label(ctx, name, m.P.l - 8, yc + 4, 'right', C.muted, 12);
  });
  line(ctx, m.x(0.5), m.P.t, m.x(0.5), m.P.b, C.ghost, 1, [4, 4], 0.7);
  $('r4').textContent = t('s4readout', { th, ph, x: fx(s.v.x), y: fx(s.v.y), z: fx(s.v.z), pz: fx(s.pZ), px: fx(s.pX), py: fx(s.pY) });
}

/* ---------- step 5: measuring disturbs ---------- */
const s5 = { mid: true, r: M.rng(11), runs: new Map() };
const key5 = () => num('chi5') + (s5.mid ? 'm' : 'n');
function draw5() {
  const chi = num('chi5'), run = s5.runs.get(key5()), pf = M.pFinalZero(chi, s5.mid), pm = (1 + Math.cos(chi * M.DEG)) / 2;
  $('chi5v').textContent = chi + '°';
  $('midOff').setAttribute('aria-pressed', !s5.mid); $('midOn').setAttribute('aria-pressed', s5.mid);
  let { ctx, W, H } = fitCanvas($('c5a'));
  const m = panel(ctx, W, { top: 30, bottom: H - 30, xMin: 0, xMax: 3, yMin: 0, yMax: 1.04, yTicks: [0, 0.5, 1], title: t('c5a', { n: run ? run.n : 0 }) });
  const stages = [['first', 'Z'], ['mid', 'χ'], ['last', 'Z']], bw = Math.min(26, (m.P.r - m.P.l) / 3 / 3);
  stages.forEach(([k, name], i) => {
    const cx = m.x(i + 0.5), off = i === 1 && !s5.mid;
    const exp = i === 0 ? [1, 0] : i === 1 ? [pm, 1 - pm] : [pf, 1 - pf];
    [0, 1].forEach(j => {
      const X = cx + (j ? 3 : -3 - bw), val = run && !off ? run[k][j] / run.n : 0;
      ctx.save(); ctx.strokeStyle = j ? C.orange : C.cyan; ctx.globalAlpha = off ? 0.25 : 0.8; ctx.setLineDash([3, 3]); ctx.strokeRect(X, m.y(exp[j]), bw, m.y(0) - m.y(exp[j])); ctx.restore();
      if (val > 0) { ctx.save(); ctx.fillStyle = j ? C.orange : C.cyan; ctx.globalAlpha = 0.9; ctx.fillRect(X, m.y(val), bw, m.y(0) - m.y(val)); ctx.restore(); }
    });
    label(ctx, `${i + 1}·${name}`, cx, m.P.b + 18, 'center', off ? C.raw : C.muted, 12);
  });
  ({ ctx, W, H } = fitCanvas($('c5b')));
  const n = panel(ctx, W, { top: 30, bottom: H - 26, xMin: 0, xMax: 180, yMin: 0, yMax: 1.04, yTicks: [0, 0.25, 0.5, 0.75, 1], xTicks: true, xSteps: [45, 90], minPx: 36, xUnit: '°', title: t('c5b') });
  curve(ctx, n, c => M.pFinalZero(c, true), 0, 180, C.text, s5.mid ? 2.4 : 1.2);
  curve(ctx, n, () => 1, 0, 180, C.ghost, s5.mid ? 1.2 : 2.4, [6, 4], 2);
  for (const [k, v] of s5.runs) dot(ctx, n.x(parseFloat(k)), n.y(v.last[0] / v.n), 3.4, k.endsWith('m') ? C.cyan : C.ghost);
  dot(ctx, n.x(chi), n.y(pf), 5.5, C.text, true);
  line(ctx, n.x(chi), n.P.t, n.x(chi), n.P.b, C.ghost, 1, [4, 4], 0.6);
  const mid = s5.mid ? t('s5midOn', { chi, m0: run ? run.mid[0] : 0, m1: run ? run.mid[1] : 0, pm: fx(pm) }) : t('s5midOff');
  $('r5').textContent = run ? t('s5readout', { n: run.n, f1: run.first[0], mid, c0: run.last[0], f: fx(run.last[0] / run.n), p: fx(pf) }) : t('s5empty', { p: fx(pf), mid: s5.mid ? t('s5modeOn', { chi }) : t('s5modeOff') });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  $('psi0').addEventListener('input', () => { draw0(); reset1(); draw1(); });
  $('m1').addEventListener('click', () => measure(1)); $('m10').addEventListener('click', () => measure(10)); $('m100').addEventListener('click', () => measure(100));
  $('again1').addEventListener('click', () => { const first = M.shots(p1now(), 1, s1.r)[0]; s1.again = { first, rest: Array.from({ length: 10 }, () => first) }; draw1(); });
  $('reset1').addEventListener('click', () => { reset1(); draw1(); });

  $('th2').addEventListener('input', () => { s2.hist.clear(); draw2(); });
  $('ph2').addEventListener('input', draw2);

  $('ph3').addEventListener('input', draw3);
  $('whichOff').addEventListener('click', () => { s3.which = false; draw3(); });
  $('whichOn').addEventListener('click', () => { s3.which = true; draw3(); });
  $('fire3').addEventListener('click', () => {
    const ph = num('ph3'), q = M.mz(ph, s3.which), key = ph + (s3.which ? 'w' : 'q'), got = M.shots(q.p0, 100, s3.r);
    const v = s3.runs.get(key) || { n: 0, c0: 0 }; v.n += 100; v.c0 += got.filter(x => x === 0).length; s3.runs.set(key, v); draw3();
  });
  $('clear3').addEventListener('click', () => { s3.runs.clear(); s3.r = M.rng(7); draw3(); });

  const addTrail = () => { const s = M.bloch(num('th4'), num('ph4')); s4.trail.push(s.v); if (s4.trail.length > 600) s4.trail.shift(); };
  addTrail();
  ['th4', 'ph4'].forEach(id => $(id).addEventListener('input', () => { addTrail(); draw4(); }));
  $('clear4').addEventListener('click', () => { s4.trail = []; addTrail(); draw4(); });

  $('chi5').addEventListener('input', draw5);
  $('midOff').addEventListener('click', () => { s5.mid = false; draw5(); });
  $('midOn').addEventListener('click', () => { s5.mid = true; draw5(); });
  $('run5').addEventListener('click', () => {
    const k = key5(), got = M.chain(num('chi5'), s5.mid, 200, s5.r), v = s5.runs.get(k) || { n: 0, first: [0, 0], mid: [0, 0], last: [0, 0] };
    v.n += 200; ['first', 'mid', 'last'].forEach(s => { v[s][0] += got[s][0]; v[s][1] += got[s][1]; }); s5.runs.set(k, v); draw5();
  });
  $('clear5').addEventListener('click', () => { s5.runs.clear(); s5.r = M.rng(11); draw5(); });

  document.querySelectorAll('.quiz').forEach(q => q.querySelector('.check-quiz').addEventListener('click', () => {
    const name = q.dataset.quiz, choice = q.querySelector(`input[name="${name}"]:checked`), fb = q.querySelector('.quiz-feedback');
    const ok = !!choice && choice.value === q.dataset.answer;
    fb.textContent = t(choice ? name + (ok ? 'Right' : 'Wrong') : 'pick'); fb.style.color = ok ? C.green : C.orange;
  }));

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  window.refreshQuantum = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
