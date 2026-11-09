'use strict';
// Definite-integral lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every square, strip, sum and readout comes from window.INTEG_MODEL (model.js). Canvas text is limited to
// panel titles (own row above the plot) and axis ticks (left of / below the plot); legends live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.INTEG_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#1f2c3b', axis: '#4f6580', text: '#e8edf4', bg: '#0d1621', ghost: '#8696aa', faint: '#3d5872' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const val = id => Number($(id).value);
const N = (v, d = 2) => M.num(v, d);

/* ---------- canvas kit ---------- */
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
// Nice tick step (1, 2, 2.5, 5 × 10^k) at least minPx apart, and the decimals it needs.
function nice(span, px, minPx) {
  const raw = span * minPx / px, p = Math.pow(10, Math.floor(Math.log10(raw)));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= raw - 1e-12) { const st = m * p; return { st, d: Math.max(0, Math.ceil(-Math.log10(st) - 1e-9) + (m === 2.5 ? 1 : 0)) }; }
  return { st: 10 * p, d: 0 };
}
function frame(ctx, W, H, o) {
  const P = { l: o.l || 40, r: W - (o.r || 12), t: o.t || 30, b: H - (o.b || 26) };
  const { x0, x1, y0, y1 } = o;
  const X = v => P.l + (v - x0) / (x1 - x0) * (P.r - P.l);
  const Y = v => P.b - (v - y0) / (y1 - y0) * (P.b - P.t);
  const xs = nice(x1 - x0, P.r - P.l, o.xMin || 40), ys = nice(y1 - y0, P.b - P.t, 26);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textBaseline = 'alphabetic';
  if (!o.noY) for (let i = Math.ceil(y0 / ys.st - 1e-9); i * ys.st <= y1 + 1e-9; i++) {
    const v = i * ys.st, yy = Y(v); ctx.strokeStyle = i === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, yy); ctx.lineTo(P.r, yy); ctx.stroke();
    if (yy <= P.b - 9 && yy >= P.t + 4) { ctx.textAlign = 'right'; ctx.fillText(N(v, ys.d), P.l - 6, yy + 4); }
  }
  ctx.textAlign = 'center';
  // Ticks: automatic, or o.xLabels = [{ v, s }] for category / log axes.
  const xt = o.xLabels || []; if (!o.xLabels) for (let i = Math.ceil(x0 / xs.st - 1e-9); i * xs.st <= x1 + 1e-9; i++) xt.push({ v: i * xs.st, s: N(i * xs.st, xs.d), axis: i === 0 });
  let lastRight = -Infinity;
  for (const q of xt) {
    const xx = X(q.v); ctx.strokeStyle = q.axis ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(xx, P.t); ctx.lineTo(xx, P.b); ctx.stroke();
    const w = ctx.measureText(q.s).width;
    if (xx - w / 2 >= 2 && xx + w / 2 <= W - 2 && xx - w / 2 > lastRight + 4) { ctx.fillText(q.s, xx, P.b + 15); lastRight = xx + w / 2; }
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
  for (let i = 0; i <= n; i++) { const x = a + (b - a) * i / n, Yc = Math.max(-1e4, Math.min(1e4, F.Y(fn(x)))); if (!i) ctx.moveTo(F.X(x), Yc); else ctx.lineTo(F.X(x), Yc); }
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
// A straight line through (xa, ya) with slope m, across the whole frame.
function fullLine(ctx, F, xa, ya, m, color, lw) { line(ctx, F.X(F.x0), F.Y(ya + m * (F.x0 - xa)), F.X(F.x1), F.Y(ya + m * (F.x1 - xa)), color, lw); }

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

/* ---------- step 0: count squares ---------- */
const s0 = { tried: new Set() };
function draw0() {
  const idx = val('g0'), Ng = M.GRID_NS[idx], gb = M.gridBounds(Ng), cols = M.gridColumns(Ng);
  s0.tried.add(idx);
  $('g0v').textContent = String(Ng);
  let { ctx, W, H } = fitCanvas($('c0'), 0.8, 260, 420);
  const F = frame(ctx, W, H, { x0: -0.03, x1: 1.03, y0: -0.03, y1: 1.03, xMin: 44, title: t('c0a', { N: Ng }) });
  F.clip();
  const cell = 1 / Ng, px = F.X(cell) - F.X(0);
  cols.forEach((c, i) => {
    for (let j = 0; j < c.touch; j++) {
      const X0 = F.X(i * cell), Y0 = F.Y((j + 1) * cell);
      if (j < c.inside) { ctx.fillStyle = 'rgba(126,226,168,0.55)'; ctx.fillRect(X0 + 0.5, Y0 + 0.5, px - 1, px - 1); }
      ctx.strokeStyle = C.orange; ctx.lineWidth = px > 12 ? 1.5 : 1; ctx.strokeRect(X0 + 1, Y0 + 1, px - 2, px - 2);
    }
  });
  ctx.strokeStyle = C.axis; ctx.lineWidth = 1; ctx.strokeRect(F.X(0), F.Y(1), F.X(1) - F.X(0), F.Y(0) - F.Y(1));
  plotFn(ctx, F, M.sq, 0, 1, { color: C.cyan, lw: 2.8 });
  F.unclip();

  const stacked = window.innerWidth <= 640, Hb = parseFloat($('c0').style.height) || H;
  ({ ctx, W, H } = stacked ? fitCanvas($('c0b'), 0.55, 200, 250) : fitCanvas($('c0b'), 0, Hb, Hb));
  const B = frame(ctx, W, H, { x0: -0.6, x1: 4.6, y0: 0, y1: 0.7, l: 36, xLabels: M.GRID_NS.map((n, i) => ({ v: i, s: String(n) })), title: t('c0b') });
  B.clip();
  [...s0.tried].sort().forEach(i => {
    const q = M.gridBounds(M.GRID_NS[i]), col = i === idx ? C.orange : C.text, X = B.X(i);
    line(ctx, X, B.Y(q.lower), X, B.Y(q.upper), col, i === idx ? 4 : 2.5);
    line(ctx, X - 7, B.Y(q.lower), X + 7, B.Y(q.lower), col, 2); line(ctx, X - 7, B.Y(q.upper), X + 7, B.Y(q.upper), col, 2);
  });
  B.unclip();
  $('r0').textContent = t('s0readout', { N: Ng, NN: Ng * Ng, inside: gb.inside, touch: gb.touch, lo: N(gb.lower, 5), hi: N(gb.upper, 5), gap: N(gb.upper - gb.lower, 5) });
}

/* ---------- step 1: Riemann sums ---------- */
const s1 = { mode: 'left', tried: new Set(), maxN: 0 };
const MODE_KEY = { left: 'modeNameL', right: 'modeNameR', mid: 'modeNameM' };
function draw1() {
  const idx = val('n1'), n = M.NS[idx], r = M.riemann(M.sq, 0, 1, n, s1.mode);
  s1.tried.add(idx); s1.maxN = Math.max(s1.maxN, n);
  $('n1v').textContent = String(n);
  ['left', 'right', 'mid'].forEach((m, i) => $(['modeL', 'modeR', 'modeM'][i]).setAttribute('aria-pressed', String(s1.mode === m)));
  let { ctx, W, H } = fitCanvas($('c1'), 0.8, 260, 420);
  const F = frame(ctx, W, H, { x0: -0.03, x1: 1.03, y0: -0.03, y1: 1.03, xMin: 44, title: t('c1a', { n, mode: t(MODE_KEY[s1.mode]) }) });
  F.clip();
  r.strips.forEach(q => {
    ctx.fillStyle = 'rgba(103,215,249,0.28)'; ctx.fillRect(F.X(q.x0), F.Y(q.h), F.X(q.x1) - F.X(q.x0), F.Y(0) - F.Y(q.h));
    ctx.strokeStyle = C.cyan; ctx.lineWidth = n > 32 ? 0.6 : 1; ctx.strokeRect(F.X(q.x0), F.Y(q.h), F.X(q.x1) - F.X(q.x0), F.Y(0) - F.Y(q.h));
  });
  plotFn(ctx, F, M.sq, 0, 1, { color: C.text, lw: 2.4 });
  F.unclip();
  const stacked = window.innerWidth <= 640, Hb = parseFloat($('c1').style.height) || H;
  ({ ctx, W, H } = stacked ? fitCanvas($('c1b'), 0.55, 200, 250) : fitCanvas($('c1b'), 0, Hb, Hb));
  const B = frame(ctx, W, H, { x0: -0.5, x1: 6.5, y0: -0.03, y1: 1.03, l: 36, xLabels: M.NS.map((v, i) => ({ v: i, s: String(v) })), title: t('c1b') });
  B.clip();
  line(ctx, B.P.l, B.Y(1 / 3), B.P.r, B.Y(1 / 3), C.ghost, 1.4, [5, 5]);
  [...s1.tried].forEach(i => { const m = M.NS[i], big = i === idx; dot(ctx, B.X(i), B.Y(M.Lsq(m)), big ? 5.5 : 3.8, C.green); dot(ctx, B.X(i), B.Y(M.Rsq(m)), big ? 5.5 : 3.8, C.orange); });
  B.unclip();
  $('r1').textContent = t('s1readout', { n, L: N(M.Lsq(n), 6), R: N(M.Rsq(n), 6), Mm: N(M.Msq(n), 6), gap: N(M.Rsq(n) - M.Lsq(n), 6), mode: t(MODE_KEY[s1.mode]), sum: N(r.sum, 6) });
  $('r1b').innerHTML = s1.maxN >= 16 ? t('s1concl') : t('s1more');
}

/* ---------- step 2: distance from a speed graph ---------- */
const s2 = { reveal: null, prog: null };
function draw2() {
  const n = M.NS2[val('n2')], cum = M.cumulative(n), shown = s2.reveal === null ? n : s2.reveal, w = M.T_END / n;
  $('n2v').textContent = String(n);
  let { ctx, W, H } = fitCanvas($('c2'), 0.45, 220, 340);
  const F = frame(ctx, W, H, { x0: 0, x1: 4.2, y0: 0, y1: 13, xMin: 60, title: t('c2a') });
  F.clip();
  cum.forEach((q, i) => {
    const X0 = F.X(q.t - w), X1 = F.X(q.t), on = i < shown, last = i === shown - 1 && s2.reveal !== null;
    ctx.globalAlpha = on ? 1 : 0.15; ctx.fillStyle = last ? 'rgba(255,180,84,0.55)' : 'rgba(103,215,249,0.28)'; ctx.fillRect(X0, F.Y(q.h), X1 - X0, F.Y(0) - F.Y(q.h));
    ctx.strokeStyle = last ? C.orange : C.cyan; ctx.lineWidth = 1; ctx.strokeRect(X0, F.Y(q.h), X1 - X0, F.Y(0) - F.Y(q.h)); ctx.globalAlpha = 1;
  });
  plotFn(ctx, F, M.V, 0, M.T_END, { color: C.text, lw: 2.4 });
  F.unclip();
  ({ ctx, W, H } = fitCanvas($('c2b'), 0.16, 96, 120));
  const R = frame(ctx, W, H, { x0: 0, x1: 50, y0: 0, y1: 1, noY: true, xMin: 44, title: t('c2b') });
  R.clip();
  let prev = 0;
  cum.slice(0, shown).forEach((q, i) => { ctx.fillStyle = i % 2 ? '#c9853a' : C.orange; ctx.fillRect(R.X(prev), R.Y(0.68), R.X(q.total) - R.X(prev), R.Y(0.32) - R.Y(0.68)); prev = q.total; });
  line(ctx, R.X(M.DIST), R.P.t, R.X(M.DIST), R.P.b, C.ghost, 1.6, [5, 4]);
  ctx.fillStyle = C.text; ctx.fillRect(R.X(prev) - 6, R.Y(0.85), 12, R.Y(0.15) - R.Y(0.85));
  R.unclip();
  const total = shown ? cum[shown - 1].total : 0;
  const prog = s2.prog ? t('s2progress', s2.prog) : '';
  $('r2').textContent = t('s2readout', { prog, n, w: N(w, 3), sum: N(total, 3), e: N(total - M.DIST, 3) });
}

/* ---------- step 3: signed accumulation ---------- */
const s3 = { b: 1.5 };
function draw3() {
  const b = s3.b, p = M.signedParts(b), exactZero = Math.abs(b - M.ZERO_NET) < 1e-12;
  $('b3v').textContent = exactZero ? '√3 ≈ 1.732' : N(b);
  const { ctx, W, H } = fitCanvas($('c3'), 0.5, 240, 380);
  const F = frame(ctx, W, H, { x0: 0, x1: 2.1, y0: -1.2, y1: 3.2, xMin: 44, title: t('c3', { b: exactZero ? '√3' : N(b) }) });
  F.clip();
  for (let x = 0; x < b - 1e-9; x += 0.05) {
    const x1 = Math.min(b, x + 0.05), h = M.g((x + x1) / 2), pos = h >= 0;
    ctx.fillStyle = pos ? 'rgba(103,215,249,0.35)' : 'rgba(255,122,147,0.4)'; ctx.fillRect(F.X(x), Math.min(F.Y(0), F.Y(h)), F.X(x1) - F.X(x), Math.abs(F.Y(h) - F.Y(0)));
    ctx.strokeStyle = pos ? C.cyan : C.pink; ctx.lineWidth = 0.8; ctx.strokeRect(F.X(x), Math.min(F.Y(0), F.Y(h)), F.X(x1) - F.X(x), Math.abs(F.Y(h) - F.Y(0)));
  }
  line(ctx, F.X(b), F.P.t, F.X(b), F.P.b, C.orange, 1.4, [5, 4]);
  plotFn(ctx, F, M.g, 0, 2.1, { color: C.text, lw: 2.4 });
  F.unclip();
  const zero = Math.abs(p.net) < 1e-9;
  const note = zero ? t('s3noteZero') : p.net < 0 ? t('s3noteNeg') : t('s3notePos', { abs: N(p.pos - p.neg, 4) });
  $('r3').textContent = t('s3readout', { b: exactZero ? '√3' : N(b), pos: N(p.pos, 4), neg: N(p.neg, 4), net: N(p.net, 4), note });
}

/* ---------- step 4: accumulation function ---------- */
function draw4() {
  const x = val('x4'), dx = M.DXS[val('dx4')], gr = M.growth(x, dx);
  $('x4v').textContent = N(x); $('dx4v').textContent = N(dx);
  let { ctx, W, H } = fitCanvas($('c4'), 0.42, 210, 320);
  const F = frame(ctx, W, H, { x0: 0, x1: 2.05, y0: 0, y1: 4.2, xMin: 44, title: t('c4a') });
  F.clip();
  const shade = (a, b, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(F.X(a), F.Y(0)); for (let i = 0; i <= 80; i++) { const u = a + (b - a) * i / 80; ctx.lineTo(F.X(u), F.Y(M.sq(u))); } ctx.lineTo(F.X(b), F.Y(0)); ctx.closePath(); ctx.fill(); };
  if (x > 0) shade(0, x, 'rgba(103,215,249,0.28)');
  shade(x, x + dx, 'rgba(255,180,84,0.6)');
  plotFn(ctx, F, M.sq, 0, 2.05, { color: C.text, lw: 2.4 });
  F.unclip();
  ({ ctx, W, H } = fitCanvas($('c4b'), 0.32, 180, 250));
  const B = frame(ctx, W, H, { x0: 0, x1: 2.05, y0: 0, y1: 2.9, xMin: 44, title: t('c4b') });
  B.clip();
  plotFn(ctx, B, M.A, 0, 2.05, { color: C.ghost, lw: 1.6, dash: [6, 5] });
  if (x > 0) plotFn(ctx, B, M.Atrace, 0, x, { color: C.cyan, lw: 2.8 });
  line(ctx, B.X(x), B.Y(M.A(x)), B.X(x + dx), B.Y(M.A(x)), C.text, 1.2, [3, 3]);
  line(ctx, B.X(x + dx), B.Y(M.A(x)), B.X(x + dx), B.Y(M.A(x + dx)), C.orange, 3);
  dot(ctx, B.X(x), B.Y(M.A(x)), 5, C.text); dot(ctx, B.X(x + dx), B.Y(M.A(x + dx)), 5, C.orange);
  B.unclip();
  $('r4').textContent = t('s4readout', { x: N(x), A: N(M.A(x), 4), Ad: N(M.Atrace(x), 4), dx: N(dx), dA: N(gr.dA, 4), rate: N(gr.rate, 4), f: N(gr.f, 4), ex: N(gr.excess, 4) });
}

/* ---------- step 5: quiz ---------- */
const ANSWERS = { q1: 'b', q2: 'b', q3: 'b', q4: 'a' };
function radio(name) { const c = document.querySelector(`input[name="${name}"]:checked`); return c ? c.value : null; }
function judge(q, show) {
  const v = radio(q), el = $(q + 'fb');
  if (!v) { if (show) { el.textContent = t('pick'); el.style.color = C.orange; delete el.dataset.state; } return; }
  const ok = v === ANSWERS[q];
  el.textContent = t(q + (ok ? 'ok' : 'no')); el.style.color = ok ? C.green : C.orange; el.dataset.state = ok ? 'correct' : 'wrong';
}

function refresh() {
  draw0(); draw1(); draw2(); draw3(); draw4();
  ['q1', 'q2', 'q3', 'q4'].forEach(q => { const el = $(q + 'fb'); if (el.dataset.state) judge(q, false); else if (el.textContent) el.textContent = t('pick'); });
}

function setup() {
  $('g0').addEventListener('input', draw0);
  $('n1').addEventListener('input', draw1);
  [['modeL', 'left'], ['modeR', 'right'], ['modeM', 'mid']].forEach(([id, m]) => $(id).addEventListener('click', () => { s1.mode = m; draw1(); }));
  $('n2').addEventListener('input', () => { stopAnim('s2'); s2.reveal = null; s2.prog = null; draw2(); });
  $('drive2').addEventListener('click', () => {
    const n = M.NS2[val('n2')];
    s2.reveal = 0; s2.prog = { c: 0, N: n }; draw2();
    animate('s2', Math.min(6000, 400 + n * 450), p => { const c = Math.min(n, Math.floor(p * n + 1e-9)); s2.reveal = c; s2.prog = { c, N: n }; draw2(); }, () => { s2.reveal = null; draw2(); });
  });
  $('b3').addEventListener('input', () => { s3.b = val('b3'); draw3(); });
  $('zero3').addEventListener('click', () => { s3.b = M.ZERO_NET; $('b3').value = M.ZERO_NET.toFixed(2); draw3(); });
  ['x4', 'dx4'].forEach(id => $(id).addEventListener('input', draw4));
  ['q1', 'q2', 'q3', 'q4'].forEach(q => {
    $(q + 'check').addEventListener('click', () => judge(q, true));
    document.querySelectorAll(`input[name="${q}"]`).forEach(r => r.addEventListener('change', () => { const el = $(q + 'fb'); el.textContent = ''; delete el.dataset.state; }));
  });

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
