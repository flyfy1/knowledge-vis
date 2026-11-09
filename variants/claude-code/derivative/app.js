'use strict';
// Derivative lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, secant, tangent and readout comes from window.DERIV_MODEL (model.js). Canvas text is limited to
// panel titles (own row above the plot) and axis ticks (left of / below the plot); legends live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.DERIV_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#1f2c3b', axis: '#4f6580', text: '#e8edf4', bg: '#0d1621', ghost: '#8696aa', faint: '#3d5872' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const val = id => Number($(id).value);
const N = (v, d = 2) => M.num(v, d);
// significant-figure formatting for the zoom readouts
const sig = (v, n = 3) => { if (v === 0) return '0'; const d = Math.max(0, n - 1 - Math.floor(Math.log10(Math.abs(v)))); return N(v, Math.min(8, d)); };

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
  for (let i = Math.ceil(y0 / ys.st - 1e-9); i * ys.st <= y1 + 1e-9; i++) {
    const v = i * ys.st, yy = Y(v); ctx.strokeStyle = i === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, yy); ctx.lineTo(P.r, yy); ctx.stroke();
    if (yy <= P.b - 9 && yy >= P.t + 4) { ctx.textAlign = 'right'; ctx.fillText(N(v, ys.d), P.l - 6, yy + 4); }
  }
  ctx.textAlign = 'center';
  for (let i = Math.ceil(x0 / xs.st - 1e-9); i * xs.st <= x1 + 1e-9; i++) {
    const v = i * xs.st, xx = X(v); ctx.strokeStyle = i === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(xx, P.t); ctx.lineTo(xx, P.b); ctx.stroke();
    const s = N(v, xs.d), w = ctx.measureText(s).width;
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

/* ---------- step 0: average speed over an interval ---------- */
const s0 = { hist: [] };
function record0() {
  const a = Math.min(val('t1'), val('t2')), b = Math.max(val('t1'), val('t2'));
  if (a === b || a > M.T0 || b < M.T0) return;
  const key = `[${N(a, 1)}, ${N(b, 1)}] → ${N(M.avg(a, b))} m/s`;
  s0.hist = s0.hist.filter(k => k !== key); s0.hist.push(key); if (s0.hist.length > 6) s0.hist.shift();
}
function draw0() {
  const t1 = val('t1'), t2 = val('t2'), a = Math.min(t1, t2), b = Math.max(t1, t2);
  $('t1v').textContent = t1.toFixed(1) + ' s'; $('t2v').textContent = t2.toFixed(1) + ' s';
  const { ctx, W, H } = fitCanvas($('c0'), 0.55, 250, 430);
  const F = frame(ctx, W, H, { x0: 0, x1: 4.2, y0: 0, y1: 17.5, title: t('c0') });
  F.clip();
  line(ctx, F.X(M.T0), F.P.t, F.X(M.T0), F.P.b, C.orange, 1.3, [6, 5]);
  plotFn(ctx, F, M.s, F.x0, F.x1, { color: C.cyan, lw: 2.8 });
  if (a !== b) {
    const m = M.avg(a, b);
    ctx.save(); ctx.globalAlpha = 0.35; fullLine(ctx, F, a, M.s(a), m, C.green, 1.4); ctx.restore();
    line(ctx, F.X(a), F.Y(M.s(a)), F.X(b), F.Y(M.s(b)), C.green, 2.6);
    line(ctx, F.X(a), F.Y(M.s(a)), F.X(b), F.Y(M.s(a)), C.text, 1.4, [4, 3]);
    line(ctx, F.X(b), F.Y(M.s(a)), F.X(b), F.Y(M.s(b)), C.text, 1.4, [4, 3]);
  }
  dot(ctx, F.X(a), F.Y(M.s(a)), 5, C.green); dot(ctx, F.X(b), F.Y(M.s(b)), 5, C.green);
  F.unclip();
  $('r0').textContent = a === b ? t('s0same') : t('s0readout', { a: N(a, 1), b: N(b, 1), sa: N(M.s(a)), sb: N(M.s(b)), ds: N(M.s(b) - M.s(a)), dt: N(b - a, 1), v: N(M.avg(a, b)) });
  $('r0b').textContent = s0.hist.length ? t('s0hist', { list: s0.hist.join(t('sep')) }) : t('s0histNone');
}

/* ---------- step 1: squeeze the interval ---------- */
const s1 = { tried: new Map(), lit: false, prog: null };
const SWEEP1 = [1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01];
function draw1() {
  const dt = val('dt');
  $('dtv').textContent = N(dt);
  const zero = Math.abs(dt) < 1e-9;
  if (!zero) { s1.tried.set(dt.toFixed(2), M.secant(M.s, M.T0, dt)); if (Math.abs(dt) <= 0.05 + 1e-9) s1.lit = true; }
  let { ctx, W, H } = fitCanvas($('c1'), 0.62, 250, 400);
  const F = frame(ctx, W, H, { x0: 0, x1: 4, y0: 0, y1: 16.5, title: t('c1a') });
  F.clip();
  plotFn(ctx, F, M.s, F.x0, F.x1, { color: C.cyan, lw: 2.8 });
  if (s1.lit) fullLine(ctx, F, M.T0, M.s(M.T0), 2 * M.T0, C.orange, 2);
  if (!zero) { const m = M.secant(M.s, M.T0, dt); fullLine(ctx, F, M.T0, M.s(M.T0), m, C.green, 1.8); dot(ctx, F.X(M.T0 + dt), F.Y(M.s(M.T0 + dt)), 5.5, C.green); }
  dot(ctx, F.X(M.T0), F.Y(M.s(M.T0)), 5.5, C.text);
  F.unclip();

  const stacked = window.innerWidth <= 640, Hb = parseFloat($('c1').style.height) || H;
  ({ ctx, W, H } = stacked ? fitCanvas($('c1b'), 0.55, 200, 250) : fitCanvas($('c1b'), 0, Hb, Hb));
  const B = frame(ctx, W, H, { x0: -1.1, x1: 1.1, y0: 2.7, y1: 5.3, l: 32, xMin: 34, title: t('c1b') });
  B.clip();
  line(ctx, B.X(-1.1), B.Y(2.9), B.X(1.1), B.Y(5.1), C.faint, 1.6);
  line(ctx, B.P.l, B.Y(4), B.P.r, B.Y(4), C.orange, 1, [4, 4]);
  s1.tried.forEach((m, k) => { if (Number(k) !== dt) dot(ctx, B.X(Number(k)), B.Y(m), 3.4, C.text); });
  dot(ctx, B.X(0), B.Y(4), 5.5, C.orange, true);
  if (!zero) dot(ctx, B.X(dt), B.Y(M.secant(M.s, M.T0, dt)), 5.5, C.green);
  B.unclip();
  if (zero) { $('r1').textContent = t('s1zero'); }
  else {
    const m = M.secant(M.s, M.T0, dt), tq = M.T0 + dt;
    $('r1').textContent = t('s1readout', { prog: s1.prog ? t('s1progress', s1.prog) : '', dt: N(dt), tq: N(tq), sq: N(M.s(tq), 4), m: N(m, 4), gap: N(Math.abs(m - 2 * M.T0), 4) });
  }
  $('r1b').innerHTML = s1.lit ? t('s1concl') : '';
}
function setDt(v) { stopAnim('s1'); s1.prog = null; const sgn = val('dt') < 0 ? -1 : 1; $('dt').value = (sgn * v).toFixed(2); draw1(); }

/* ---------- step 2: zoom in ---------- */
function draw2() {
  const z = M.ZOOMS[val('zoom')], win = M.zoomWindow(z), w = win.w;
  $('zv').textContent = '×' + z;
  const { ctx, W, H } = fitCanvas($('c2'), 0.55, 260, 420);
  const F = frame(ctx, W, H, { x0: M.T0 - w, x1: M.T0 + w, y0: 4 - win.hy, y1: 4 + win.hy, l: 52, xMin: 64, title: t('c2', { z, lo: sig(M.T0 - w, 4), hi: sig(M.T0 + w, 4) }) });
  F.clip();
  const tan = M.tangentAt(M.s, x => 2 * x, M.T0);
  plotFn(ctx, F, tan, F.x0, F.x1, { color: C.orange, lw: 2 });
  plotFn(ctx, F, M.s, F.x0, F.x1, { color: C.cyan, lw: 2.8 });
  for (const e of [F.x0, F.x1]) { const xe = e === F.x0 ? F.X(e) + 3 : F.X(e) - 3; line(ctx, xe, F.Y(M.s(e)), xe, F.Y(tan(e)), C.pink, 4); }
  dot(ctx, F.X(M.T0), F.Y(4), 5, C.text);
  F.unclip();
  const gap = M.maxGap(w);
  $('r2').textContent = t('s2readout', { z, wd: sig(2 * w), ht: sig(10 * w), gap: sig(gap), pct: sig(gap / (10 * w) * 100) });
}

/* ---------- step 3: the derivative function ---------- */
const s3 = { fn: 'sq', pts: { sq: new Map(), cube: new Map() }, rule: false, prog: null };
const RANGE3 = { sq: { y: [-0.6, 4.6], d: [-4.6, 4.6] }, cube: { y: [-8.5, 8.5], d: [-1, 12.8] } };
function draw3() {
  const x = val('x3'), key = s3.fn, Fn = M.FUNCS[key], m = M.measure(key, x), r = Fn.d(x);
  $('xv').textContent = N(x, 1);
  $('fnSq').setAttribute('aria-pressed', String(key === 'sq')); $('fnCube').setAttribute('aria-pressed', String(key === 'cube')); $('rule3').setAttribute('aria-pressed', String(s3.rule));
  s3.pts[key].set(x.toFixed(1), m);
  let { ctx, W, H } = fitCanvas($('c3'), 0.45, 220, 340);
  const R = RANGE3[key];
  const F = frame(ctx, W, H, { x0: -2.2, x1: 2.2, y0: R.y[0], y1: R.y[1], xMin: 60, title: t('c3a', { fn: t(key === 'sq' ? 'fnSq' : 'fnCube') }) });
  F.clip();
  plotFn(ctx, F, Fn.f, F.x0, F.x1, { color: C.cyan, lw: 2.8 });
  fullLine(ctx, F, x, Fn.f(x), r, C.orange, 2);
  dot(ctx, F.X(x), F.Y(Fn.f(x)), 5.5, C.text);
  F.unclip();
  ({ ctx, W, H } = fitCanvas($('c3b'), 0.4, 200, 300));
  const B = frame(ctx, W, H, { x0: -2.2, x1: 2.2, y0: R.d[0], y1: R.d[1], xMin: 60, title: t('c3b') });
  B.clip();
  if (s3.rule) plotFn(ctx, B, Fn.d, B.x0, B.x1, { color: C.orange, lw: 1.8, dash: [6, 5] });
  s3.pts[key].forEach((v, k) => { if (Number(k) !== x) dot(ctx, B.X(Number(k)), B.Y(v), 3.6, C.text); });
  line(ctx, B.X(x), B.P.t, B.X(x), B.P.b, C.faint, 1, [3, 4]);
  dot(ctx, B.X(x), B.Y(m), 6, C.green);
  B.unclip();
  const sign = r > 0 ? t('pos') : r < 0 ? t('neg') : t('zero');
  $('r3').textContent = t('s3readout', { prog: s3.prog ? t('s3progress', s3.prog) : '', x: N(x, 1), m: N(m, 3), rule: t(key === 'sq' ? 'ruleSq' : 'ruleCube'), r: N(r, 3), d: N(Math.abs(m - r), 3), sign });
}

/* ---------- step 4: what the derivative says ---------- */
const s4 = { t: 0.3 };
function draw4() {
  const tt = s4.t, h = M.height(tt), v = M.vspeed(tt), top = M.topTime;
  $('t4v').textContent = N(tt) + ' s';
  let { ctx, W, H } = fitCanvas($('c4'), 0.42, 210, 320);
  const F = frame(ctx, W, H, { x0: 0, x1: 1.75, y0: 0, y1: 5, xMin: 50, title: t('c4a') });
  F.clip();
  plotFn(ctx, F, M.height, 0, top, { color: C.cyan, lw: 2.8 });
  plotFn(ctx, F, M.height, top, 1.75, { color: C.pink, lw: 2.8 });
  fullLine(ctx, F, tt, h, v, C.orange, 2);
  dot(ctx, F.X(tt), F.Y(h), 5.5, C.text);
  F.unclip();
  ({ ctx, W, H } = fitCanvas($('c4b'), 0.32, 180, 250));
  const B = frame(ctx, W, H, { x0: 0, x1: 1.75, y0: -10.5, y1: 8, xMin: 50, title: t('c4b') });
  B.clip();
  line(ctx, B.X(0), B.Y(M.vspeed(0)), B.X(top), B.Y(0), C.cyan, 2.6);
  line(ctx, B.X(top), B.Y(0), B.X(1.75), B.Y(M.vspeed(1.75)), C.pink, 2.6);
  line(ctx, B.X(tt), B.P.t, B.X(tt), B.P.b, C.faint, 1, [3, 4]);
  dot(ctx, B.X(tt), B.Y(v), 5.5, C.text);
  B.unclip();
  const isTop = Math.abs(tt - top) < 1e-9;
  const meaning = isTop ? t('s4top', { h: N(h, 3), tt: N(top, 3) }) : v > 0 ? t('s4up', { a: N(Math.abs(v)) }) : t('s4down', { a: N(Math.abs(v)) });
  $('r4').textContent = t('s4readout', { t: isTop ? N(tt, 3) : N(tt), h: N(h, 3), v: isTop ? '0' : N(v), meaning });
}

/* ---------- step 5: quiz ---------- */
function q1Table() { const Q = M.QUIZ.q1, f = M.FUNCS.sq.f; return Q.dxs.map(d => `Δx = ${N(d)} → ${N(M.secant(f, Q.x0, d), 4)}`).join(t('sep')); }
function radio(name) { const c = document.querySelector(`input[name="${name}"]:checked`); return c ? c.value : null; }
const ANSWERS = { q1: 'c', q2: 'c', q3: 'b' };
function judge(q, show) {
  const v = radio(q), el = $(q + 'fb');
  if (!v) { if (show) { el.textContent = t('pick'); el.style.color = C.orange; delete el.dataset.state; } return; }
  const ok = v === ANSWERS[q], m = N(M.measure(M.QUIZ.q2.key, M.QUIZ.q2.x0), 3);
  el.textContent = t(q + (ok ? 'ok' : 'no'), { m }); el.style.color = ok ? C.green : C.orange; el.dataset.state = ok ? 'correct' : 'wrong';
}

function refresh() {
  draw0(); draw1(); draw2(); draw3(); draw4();
  $('q1p').textContent = t('q1Prompt', { table: q1Table() });
  ['q1', 'q2', 'q3'].forEach(q => { const el = $(q + 'fb'); if (el.dataset.state) judge(q, false); else if (el.textContent) el.textContent = t('pick'); });
}

function setup() {
  ['t1', 't2'].forEach(id => $(id).addEventListener('input', () => { record0(); draw0(); }));
  record0();
  $('dt').addEventListener('input', () => { stopAnim('s1'); s1.prog = null; draw1(); });
  $('dt1').addEventListener('click', () => setDt(1));
  $('dt01').addEventListener('click', () => setDt(0.1));
  $('dt001').addEventListener('click', () => setDt(0.01));
  $('flip1').addEventListener('click', () => { stopAnim('s1'); s1.prog = null; const v = val('dt'); $('dt').value = (v === 0 ? -0.5 : -v).toFixed(2); draw1(); });
  $('sweep1').addEventListener('click', () => {
    const sgn = val('dt') < 0 ? -1 : 1, n = SWEEP1.length;
    animate('s1', n * 700, p => { const i = Math.min(n - 1, Math.floor(p * n)); s1.prog = { c: i + 1, N: n }; $('dt').value = (sgn * SWEEP1[i]).toFixed(2); draw1(); });
  });
  $('zoom').addEventListener('input', draw2);
  $('x3').addEventListener('input', () => { stopAnim('s3'); s3.prog = null; draw3(); });
  $('fnSq').addEventListener('click', () => { stopAnim('s3'); s3.prog = null; s3.fn = 'sq'; draw3(); });
  $('fnCube').addEventListener('click', () => { stopAnim('s3'); s3.prog = null; s3.fn = 'cube'; draw3(); });
  $('rule3').addEventListener('click', () => { s3.rule = !s3.rule; draw3(); });
  $('sweep3').addEventListener('click', () => {
    const n = 41;
    animate('s3', n * 90, p => { const i = Math.min(n - 1, Math.floor(p * n)); for (let j = 0; j <= i; j++) { const x = -2 + j * 0.1; s3.pts[s3.fn].set(x.toFixed(1), M.measure(s3.fn, Number(x.toFixed(1)))); } s3.prog = { c: i + 1, N: n }; $('x3').value = (-2 + i * 0.1).toFixed(1); draw3(); });
  });
  $('t4').addEventListener('input', () => { s4.t = val('t4'); draw4(); });
  $('top4').addEventListener('click', () => { s4.t = M.topTime; $('t4').value = M.topTime.toFixed(2); draw4(); });
  ['q1', 'q2', 'q3'].forEach(q => {
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
