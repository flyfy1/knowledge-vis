'use strict';
// Quantum tunnelling lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve and readout comes from window.QT_MODEL (model.js). Canvas text is limited to panel titles
// and axis ticks laid out in fixed rows; legends, labels and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.QT_MODEL;
const t = (...a) => window.QT_I18N.t(...a);
const lang = () => window.QT_I18N.getLang();
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', xs: '#9fb4cc', wall: 'rgba(255,180,84,0.16)', wallEdge: 'rgba(255,180,84,0.6)', nucleus: 'rgba(103,215,249,0.10)' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const V = M.V0;

/* ---------- number formatting ---------- */
// Trim trailing zeros only when there is a decimal point (toFixed(0) of 90 stays 90).
const trim = s => (s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s);
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; return trim(v.toFixed(d)); };
const fix = (v, d = 2) => (Math.abs(v) < 0.5 * Math.pow(10, -d) ? 0 : v).toFixed(d);
const SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
const sup = n => String(n).split('').map(ch => SUP[ch] || ch).join('');
const pow10 = n => (n === 0 ? '1' : '10' + sup(n));
// a number given by its log10, written as m × 10ⁿ (or plainly when it is not tiny or huge)
function sciLog(lg, plainFrom = -3, plainTo = 4) {
  if (lg >= plainFrom && lg < plainTo) { const v = Math.pow(10, lg); return v >= 100 ? String(Math.round(v)) : trim(v.toPrecision(3)); }
  let e = Math.floor(lg), m = Math.pow(10, lg - e);
  if (Number(m.toFixed(1)) >= 10) { m /= 10; e += 1; }
  return `${m.toFixed(1)} × 10${sup(e)}`;
}
const prob = v => (v <= 0 ? '0' : sciLog(Math.log10(v)));
const sig = (v, n = 3) => (v >= Math.pow(10, n) ? String(Number(v.toPrecision(n))) : trim(Number(v).toPrecision(n)));
// human-readable duration from log10(seconds)
function duration(lg) {
  const s = Math.pow(10, lg);
  const unit = (v, key) => `${sig(v)} ${t(key)}`;
  if (s < 1e-3) return unit(s * 1e6, 'u_us');
  if (s < 1) return unit(s * 1e3, 'u_ms');
  if (s < 120) return unit(s, 'u_s');
  if (s < 7200) return unit(s / 60, 'u_min');
  if (s < 172800) return unit(s / 3600, 'u_h');
  const yr = s / M.YEAR;
  if (yr < 2) return unit(s / 86400, 'u_d');
  if (t('unitStyle') === 'zh') {
    if (yr < 1e4) return unit(yr, 'u_yr');
    if (yr < 1e8) return unit(yr / 1e4, 'u_kyr');
    return unit(yr / 1e8, 'u_myr');
  }
  if (yr < 1e3) return unit(yr, 'u_yr');
  if (yr < 1e6) return unit(yr / 1e3, 'u_kyr');
  if (yr < 1e9) return unit(yr / 1e6, 'u_myr');
  return unit(yr / 1e9, 'u_gyr');
}

/* ---------- canvas helpers ---------- */
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
// Panel title in its own row; shrinks the font until it fits the width.
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 7.5);
  ctx.fillText(text, X, Y); ctx.restore();
}
function niceStep(span, px, minPx, steps) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }
// opts: top, bottom, xMin, xMax, yMin, yMax, yTicks, yFmt, xTicks (bool), xSteps, title, left, right, xDigits
function panel(ctx, W, o) {
  const P = { l: o.left || 38, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks) {
    ctx.strokeStyle = v === 0 && o.yMin < 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(o.yFmt ? o.yFmt(v) : fmt(v), P.l - 6, y(v) + 4);
  }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.b); ctx.lineTo(P.r, P.b); ctx.stroke();
  if (o.xTicks) {
    const step = niceStep(o.xMax - o.xMin, P.r - P.l, o.minPx || 44, o.xSteps || [0.25, 0.5, 1, 2, 5, 10, 20, 50]);
    const first = Math.ceil((o.xMin - 1e-9) / step) * step;
    ctx.textAlign = 'center';
    for (let v = first; v <= o.xMax + 1e-9; v += step) {
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
      ctx.fillText(fmt(v, o.xDigits || 2), x(v), P.b + 15);
    }
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 12, W - 16);
  return { x, y, P };
}
function clipTo(ctx, m) { ctx.save(); ctx.beginPath(); ctx.rect(m.P.l, m.P.t - 1, m.P.r - m.P.l, m.P.b - m.P.t + 2); ctx.clip(); }
function curve(ctx, m, xs, ys, color, lw = 2, dash = null, alpha = 1) {
  clipTo(ctx, m); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = alpha; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); let pen = false;
  for (let i = 0; i < xs.length; i++) { const Y = ys[i]; if (!Number.isFinite(Y)) { pen = false; continue; } const X = m.x(xs[i]), YY = m.y(Y); if (pen) ctx.lineTo(X, YY); else { ctx.moveTo(X, YY); pen = true; } }
  ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, r, color, hollow = false) { ctx.save(); ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); if (hollow) { ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke(); } else { ctx.fillStyle = color; ctx.fill(); } ctx.restore(); }
function vline(ctx, X, y0, y1, color, dash = [4, 4], alpha = 0.7, lw = 1.2) { ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.setLineDash(dash); ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y1); ctx.stroke(); ctx.restore(); }
function hline(ctx, m, x0, x1, yv, color, dash = [5, 4], lw = 1.6) { clipTo(ctx, m); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(m.x(x0), m.y(yv)); ctx.lineTo(m.x(x1), m.y(yv)); ctx.stroke(); ctx.restore(); }
// a wall block [x0, x1] drawn from 0 up to height h (or the whole panel when h is null)
function wall(ctx, m, x0, x1, h, open = false) {
  const X0 = m.x(x0), X1 = Math.max(m.x(x1), X0 + 3), Yt = h == null ? m.P.t : m.y(h);
  ctx.save(); ctx.fillStyle = C.wall; ctx.fillRect(X0, Yt, X1 - X0, m.P.b - Yt);
  ctx.strokeStyle = C.wallEdge; ctx.lineWidth = 1.2; ctx.beginPath();
  if (h == null) { ctx.moveTo(X0, m.P.t); ctx.lineTo(X0, m.P.b); if (!open) { ctx.moveTo(X1, m.P.t); ctx.lineTo(X1, m.P.b); } }
  else { ctx.moveTo(X0, m.P.b); ctx.lineTo(X0, Yt); ctx.lineTo(X1, Yt); if (!open) ctx.lineTo(X1, m.P.b); }
  ctx.stroke(); ctx.restore();
}
const linspace = (a, b, n) => Array.from({ length: n }, (_, i) => a + (b - a) * i / (n - 1));
const niceTicks = (max, target = 4) => { const raw = max / target, p = Math.pow(10, Math.floor(Math.log10(raw))); const s = [1, 2, 5, 10].map(k => k * p).find(k => k >= raw); const out = []; for (let v = 0; v <= max + 1e-9; v += s) out.push(Number(v.toFixed(6))); return out; };

/* ---------- animation runner (respects hidden pages) ---------- */
const anims = {};
function stopAnim(name) { if (anims[name]) { cancelAnimationFrame(anims[name]); delete anims[name]; } }

/* ---------- shared energy panel ---------- */
function energyPanel(ctx, W, top, bottom, xMin, xMax, x0, x1, E, ttl) {
  const m = panel(ctx, W, { top, bottom, xMin, xMax, yMin: 0, yMax: 1.3, yTicks: [0, 0.5, 1], title: ttl });
  wall(ctx, m, x0, Math.min(x1, xMax), V, x1 >= xMax);
  hline(ctx, m, xMin, xMax, E, C.orange, [6, 4], 2);
  return m;
}

/* ---------- step 0: a wall with no far side ---------- */
const s0 = { hist: [] };
const X0 = [-2, 1.2];
function draw0() {
  const E = num('e0'), d = num('d0'), st = M.step(E, V);
  $('e0v').textContent = fix(E) + ' eV'; $('d0v').textContent = fix(d) + ' nm';
  const { ctx, W, H } = fitCanvas($('c0'));
  energyPanel(ctx, W, 32, 116, X0[0], X0[1], 0, X0[1], E, t('c0top'));
  const m = panel(ctx, W, { top: 170, bottom: H - 28, xMin: X0[0], xMax: X0[1], yMin: 0, yMax: 4.3, yTicks: [0, 1, 2, 3, 4], xTicks: true, title: t('c0bot') });
  wall(ctx, m, 0, X0[1], null, true);
  const xs = linspace(X0[0], X0[1], 700);
  s0.hist.forEach(e => { if (Math.abs(e - E) > 1e-9) { const q = M.step(e, V); curve(ctx, m, xs, xs.map(q.density), C.raw, 1.3); } });
  curve(ctx, m, xs, xs.map(st.density), C.cyan, 2.2);
  const dd = st.density(d);
  vline(ctx, m.x(d), m.P.t, m.P.b, C.pink, [3, 3], 0.8);
  dot(ctx, m.x(d), m.y(dd), 5, C.pink);
  $('r0').textContent = t('s0readout', { E: fix(E), V: fix(V, 0), R: fix(st.R, 3), edge: fix(st.edge), k: fix(st.kappa), delta: fix(M.densityDepth(V, E), 3), d: fix(d), dd: sig(dd, 3), pct: sig(dd / st.edge * 100, 2) });
}
function remember(list, v, max) { const i = list.findIndex(u => JSON.stringify(u) === JSON.stringify(v)); if (i >= 0) list.splice(i, 1); list.push(v); while (list.length > max) list.shift(); }

/* ---------- step 1: a thin wall ---------- */
const s1 = { hist: [] };
const X1 = [-2.5, 4.5];
function draw1() {
  const a = num('a1'), E = num('e1'), b = M.barrier(E, V, a);
  $('a1v').textContent = fix(a) + ' nm'; $('e1v').textContent = fix(E) + ' eV';
  const { ctx, W, H } = fitCanvas($('c1'));
  energyPanel(ctx, W, 32, 116, X1[0], X1[1], 0, a, E, t('c1top'));
  const m = panel(ctx, W, { top: 170, bottom: H - 28, xMin: X1[0], xMax: X1[1], yMin: 0, yMax: 4.3, yTicks: [0, 1, 2, 3, 4], xTicks: true, title: t('c1bot') });
  wall(ctx, m, 0, a, null);
  const xs = linspace(X1[0], X1[1], 900);
  s1.hist.forEach(([ha, he]) => { if (ha !== a || he !== E) { const q = M.barrier(he, V, ha); curve(ctx, m, xs, xs.map(q.density), C.raw, 1.3); } });
  hline(ctx, m, a, X1[1], b.T, C.green, [6, 4], 1.6);
  curve(ctx, m, xs, xs.map(b.density), C.cyan, 2.2);
  $('r1').textContent = t('s1readout', { a: fix(a), E: fix(E), T: prob(b.T), inv: b.T > 0 ? sig(1 / b.T, 2) : '∞', R: prob(b.R), sum: fix(b.T + b.R, 3) });
}

/* ---------- step 2: thickness and mass on a log scale ---------- */
const s2 = { trail: new Set(), E: null };
const MASSES = () => [{ m: 1, col: C.cyan }, { m: M.MMU_ME, col: C.green }, { m: M.MP_ME, col: C.orange }];
function draw2() {
  const a = num('a2'), E = num('e2');
  if (s2.E !== E) { s2.trail.clear(); s2.E = E; }
  s2.trail.add(a);
  $('a2v').textContent = fix(a) + ' nm'; $('e2v').textContent = fix(E) + ' eV';
  const { ctx, W, H } = fitCanvas($('c2'));
  const e = panel(ctx, W, { top: 32, bottom: 196, left: 44, xMin: 0, xMax: 2, yMin: -8, yMax: 0, yTicks: [-8, -6, -4, -2, 0], yFmt: v => pow10(v), xTicks: true, title: t('c2top') });
  const xs = linspace(0.002, 2, 600);
  curve(ctx, e, xs, xs.map(x => Math.log10(M.Tthick(E, V, x))), C.text, 1.4, [5, 4], 0.9);
  curve(ctx, e, xs, xs.map(x => M.log10T(E, V, x)), C.cyan, 2.4);
  s2.trail.forEach(v => dot(ctx, e.x(v), e.y(M.log10T(E, V, v)), 2.6, C.text));
  vline(ctx, e.x(a), e.P.t, e.P.b, C.muted, [3, 4], 0.6);
  if (M.log10T(E, V, a) >= -8) dot(ctx, e.x(a), e.y(M.log10T(E, V, a)), 5, C.cyan);
  const m = panel(ctx, W, { top: 256, bottom: H - 30, left: 44, xMin: 0, xMax: 2, yMin: -30, yMax: 0, yTicks: [-30, -20, -10, 0], yFmt: v => pow10(v), xTicks: true, title: t('c2bot') });
  MASSES().forEach(({ m: mass, col }, i) => curve(ctx, m, xs, xs.map(x => M.log10T(E, V, x, mass)), col, i === 0 ? 2.4 : 2));
  vline(ctx, m.x(a), m.P.t, m.P.b, C.muted, [3, 4], 0.6);
  MASSES().forEach(({ m: mass, col }) => { const lg = M.log10T(E, V, a, mass); if (lg >= -30) dot(ctx, m.x(a), m.y(lg), 5, col); });
  const lg = MASSES().map(q => M.log10T(E, V, a, q.m));
  $('r2').textContent = t('s2readout', { a: fix(a), E: fix(E), Te: sciLog(lg[0]), Tm: sciLog(lg[1]), Tp: sciLog(lg[2]), f: fix(M.perSlice(V, E), 3) });
}
function quizParams() {
  const T1 = M.Tformula(0.5, V, 0.5), T2 = M.Tformula(0.5, V, 1), r = Math.round(T1 / T2);
  return { T1: prob(T1), T2: prob(T2), r, wrong: sig(r * r, 2) };
}

/* ---------- step 3: above the top ---------- */
const s3 = { trail: new Set(), a: null };
const X3 = [-2.5, 4.5];
function draw3() {
  const E = num('e3'), a = num('a3'), b = M.barrier(E, V, a);
  if (s3.a !== a) { s3.trail.clear(); s3.a = a; }
  s3.trail.add(E);
  $('e3v').textContent = fix(E) + ' eV'; $('a3v').textContent = fix(a) + ' nm';
  const { ctx, W, H } = fitCanvas($('c3'));
  const top = panel(ctx, W, { top: 32, bottom: 188, xMin: 0, xMax: 4, yMin: 0, yMax: 1.05, yTicks: [0, 0.5, 1], xTicks: true, xSteps: [0.5, 1, 2], title: t('c3top') });
  const res = M.resonances(V, a, 4);
  res.forEach(er => vline(ctx, top.x(er), top.P.t, top.P.b, C.green, [5, 4], 0.85, 1.4));
  curve(ctx, top, [0, V, V, 4], [0, 0, 1, 1], C.raw, 2.4);
  const es = linspace(0.003, 4, 900);
  curve(ctx, top, es, es.map(e => M.Tformula(e, V, a)), C.cyan, 2.2);
  s3.trail.forEach(e => dot(ctx, top.x(e), top.y(M.Tformula(e, V, a)), 2.6, C.text));
  vline(ctx, top.x(E), top.P.t, top.P.b, C.orange, [3, 3], 0.8);
  dot(ctx, top.x(E), top.y(b.T), 5.5, C.orange);
  const xs = linspace(X3[0], X3[1], 900), ds = xs.map(b.density), mx = Math.max(4, ...ds);
  const yMax = mx * 1.08, ticks = niceTicks(yMax, 4);
  const bot = panel(ctx, W, { top: 246, bottom: H - 28, xMin: X3[0], xMax: X3[1], yMin: 0, yMax, yTicks: ticks, xTicks: true, title: t('c3bot') });
  wall(ctx, bot, 0, a, null);
  curve(ctx, bot, xs, ds, C.cyan, 2.2);
  const inside = E < V ? t('insideBelow', { k: fix(M.kappa(V, E)) }) : t('insideAbove', { lam: fix(M.lambdaIn(E, V), 3), n: fix(a / (M.lambdaIn(E, V) / 2)) });
  const list = res.length ? res.map(e => fix(e) + ' eV').join(lang() === 'zh' ? '、' : ', ') : t('resNone');
  $('r3').textContent = t('s3readout', { E: fix(E), a: fix(a), T: prob(b.T), R: prob(b.R), cl: t(E > V ? 'clPass' : 'clBlock'), inside, list });
}

/* ---------- step 4: a wave packet ---------- */
const s4 = { pk: null, key: '', state: 'idle', hist: [], det: { n: 0, k: 0 }, rng: null, runs: 0, done: null, preview: null };
const X4 = [10, 90];
const key4 = () => num('e4') + '|' + num('a4');
function preview4() { if (!s4.preview || s4.preview.key !== key4()) s4.preview = { key: key4(), pk: M.packet(num('e4'), V, num('a4')) }; return s4.preview.pk; }
function reset4() {
  stopAnim('s4'); s4.pk = null; s4.state = 'idle'; s4.hist = []; s4.det = { n: 0, k: 0 }; s4.done = null; s4.key = key4();
}
function record4(pk, i) { const q = pk.parts(); s4.hist.push({ t: i * pk.dt, L: q.left, W: q.inside, R: q.right, S: q.total }); }
function finish4() {
  const pk = s4.pk, last = s4.hist[s4.hist.length - 1];
  s4.state = 'done'; s4.done = { R: last.R, T0: M.Tformula(num('e4'), V, num('a4')), Tav: M.averagedT(num('e4'), V, num('a4')) };
  s4.rng = M.mulberry32(1000 + (++s4.runs)); stopAnim('s4'); void pk;
}
function run4() {
  if (s4.state === 'running') { stopAnim('s4'); s4.state = 'paused'; draw4(); return; }
  if (s4.state === 'idle' || s4.state === 'done' || s4.key !== key4()) {
    reset4(); s4.pk = M.packet(num('e4'), V, num('a4')); s4.pk.i = 0; record4(s4.pk, 0);
  }
  const pk = s4.pk;
  if (reduceMotion()) {
    const every = Math.max(1, Math.round(pk.steps / 300));
    while (pk.i < pk.steps) { pk.stepOnce(); pk.i++; if (pk.i % every === 0 || pk.i === pk.steps) record4(pk, pk.i); }
    finish4(); draw4(); return;
  }
  s4.state = 'running';
  const perFrame = Math.max(1, Math.ceil(pk.steps / (7 * 60)));
  const tick = () => {
    for (let j = 0; j < perFrame && pk.i < pk.steps; j++) { pk.stepOnce(); pk.i++; }
    record4(pk, pk.i);
    if (pk.i >= pk.steps) { finish4(); draw4(); return; }
    draw4(); anims.s4 = requestAnimationFrame(tick);
  };
  anims.s4 = requestAnimationFrame(tick);
  draw4();
}
function detect4(n) {
  if (s4.state !== 'done') return;
  for (let i = 0; i < n; i++) if (s4.rng() < s4.done.R) s4.det.k++;
  s4.det.n += n; draw4();
}
function draw4() {
  const E0 = num('e4'), a = num('a4');
  $('e4v').textContent = fix(E0) + ' eV'; $('a4v').textContent = fix(a, 1) + ' nm';
  const pk = s4.pk || preview4();
  const { ctx, W, H } = fitCanvas($('c4'));
  const top = panel(ctx, W, { top: 32, bottom: 200, xMin: X4[0], xMax: X4[1], yMin: 0, yMax: 0.6, yTicks: [0, 0.2, 0.4, 0.6], xTicks: true, xSteps: [5, 10, 20], title: t('c4top') });
  wall(ctx, top, pk.P.xb, pk.P.xb + a, null);
  const xs = [], ys = [];
  for (let j = 0; j < pk.N; j++) { const x = pk.xs[j]; if (x < X4[0] || x > X4[1]) continue; xs.push(x); ys.push(pk.re[j] * pk.re[j] + pk.im[j] * pk.im[j]); }
  curve(ctx, top, xs, ys, C.cyan, 1.6);
  const tEnd = pk.steps * pk.dt;
  const bot = panel(ctx, W, { top: 258, bottom: H - 28, xMin: 0, xMax: tEnd, yMin: 0, yMax: 1, yTicks: [0, 0.5, 1], xTicks: true, xSteps: [10, 20, 25, 50, 100], title: t('c4bot') });
  if (s4.done) hline(ctx, bot, 0, tEnd, s4.done.Tav, C.orange, [6, 4], 1.4);
  if (s4.hist.length) {
    const ts = s4.hist.map(h => h.t);
    curve(ctx, bot, ts, s4.hist.map(h => h.L), C.xs, 2);
    curve(ctx, bot, ts, s4.hist.map(h => h.W), C.pink, 2);
    curve(ctx, bot, ts, s4.hist.map(h => h.R), C.cyan, 2.4);
    const last = s4.hist[s4.hist.length - 1];
    vline(ctx, bot.x(last.t), bot.P.t, bot.P.b, C.muted, [3, 4], 0.6);
  }
  const L = s4.hist.length ? s4.hist[s4.hist.length - 1] : null;
  if (s4.state === 'idle') $('r4').textContent = t('s4ready', { a: fix(a, 1), E: fix(E0), tEnd: fix(tEnd, 0) });
  else if (s4.state === 'done') $('r4').textContent = t('s4done', { tEnd: fix(tEnd, 0), R: fix(s4.done.R, 4), T0: fix(s4.done.T0, 4), Tav: fix(s4.done.Tav, 4), dE: fix(M.packetSpread(E0), 3), diff: Math.abs(s4.done.R - s4.done.Tav) < 5e-5 ? '< 0.0001' : fix(Math.abs(s4.done.R - s4.done.Tav), 4) });
  else $('r4').textContent = t('s4run', { t: fix(L.t, 0), tEnd: fix(tEnd, 0), pct: fix(L.t / tEnd * 100, 0), L: fix(L.L, 3), W: fix(L.W, 3), R: fix(L.R, 3), S: fix(L.S, 3) });
  $('r4d').textContent = s4.state === 'done' ? t('s4det', { n: s4.det.n, k: s4.det.k, f: s4.det.n ? fix(s4.det.k / s4.det.n, 3) : '—', p: fix(s4.done.R, 3) }) : t('s4detWait');
  $('run4').textContent = t(s4.state === 'running' ? 'pause' : s4.state === 'paused' ? 'resume' : 'launch');
  $('det1').disabled = $('det100').disabled = s4.state !== 'done';
}

/* ---------- step 5: alpha decay ---------- */
const s5 = { iso: M.ISOTOPES.findIndex(i => i.id === 'U238') };
const iso5 = () => M.ISOTOPES[s5.iso];
const GAM = () => M.ISOTOPES.map(i => ({ i, g: M.gamow(i.Zd, i.Ad, i.Q), lm: Math.log10(i.half) }));
function stats5() {
  const all = GAM(), qs = all.map(o => o.i.Q), lms = all.map(o => o.lm), tops = all.map(o => o.g.Vtop), diffs = all.map(o => Math.abs(o.g.log10Half - o.lm));
  const worst = all[diffs.indexOf(Math.max(...diffs))].i.name;
  return { qlo: fix(Math.min(...qs)), qhi: fix(Math.max(...qs)), qratio: fix(Math.max(...qs) / Math.min(...qs)), span: fix(Math.max(...lms) - Math.min(...lms), 0), maxdiff: fix(Math.ceil(Math.max(...diffs)), 0), vlo: fix(Math.min(...tops), 0), vhi: fix(Math.max(...tops), 0), worst };
}
function buildIso() {
  const row = $('isoRow');
  M.ISOTOPES.forEach((iso, k) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'btn toggle'; b.dataset.step = '5'; b.textContent = iso.name; b.id = 'iso' + iso.id;
    b.addEventListener('click', () => { s5.iso = k; $('q5').value = iso.Q; draw5(); });
    row.appendChild(b);
  });
}
function draw5() {
  const iso = iso5(), Q = num('q5'), g = M.gamow(iso.Zd, iso.Ad, Q);
  $('q5v').textContent = fix(Q) + ' MeV';
  M.ISOTOPES.forEach((i, k) => $('iso' + i.id).setAttribute('aria-pressed', k === s5.iso ? 'true' : 'false'));
  const { ctx, W, H } = fitCanvas($('c5'));
  const top = panel(ctx, W, { top: 32, bottom: 204, xMin: 0, xMax: 80, yMin: 0, yMax: 32, yTicks: [0, 10, 20, 30], xTicks: true, xSteps: [10, 20], title: t('c5top') });
  ctx.save(); ctx.fillStyle = C.nucleus; ctx.fillRect(top.P.l, top.P.t, top.x(g.R) - top.P.l, top.P.b - top.P.t); ctx.restore();
  const rs = linspace(g.R, 80, 400), Vr = r => 2 * iso.Zd * M.NUC.e2 / r;
  // tunnelling stretch: between the Q line and the wall, R..b
  clipTo(ctx, top); ctx.fillStyle = 'rgba(255,180,84,0.42)'; ctx.beginPath(); ctx.moveTo(top.x(g.R), top.y(Q));
  linspace(g.R, Math.min(g.b, 80), 200).forEach(r => ctx.lineTo(top.x(r), top.y(Vr(r))));
  ctx.lineTo(top.x(Math.min(g.b, 80)), top.y(Q)); ctx.closePath(); ctx.fill(); ctx.restore();
  curve(ctx, top, [g.R, g.R], [0, g.Vtop], C.text, 2);
  curve(ctx, top, rs, rs.map(Vr), C.text, 2);
  hline(ctx, top, 0, 80, Q, C.orange, [6, 4], 2);
  vline(ctx, top.x(g.b), top.P.t, top.P.b, C.orange, [2, 4], 0.6);
  // half-life against Q
  const bot = panel(ctx, W, { top: 262, bottom: H - 28, left: 44, xMin: 3.8, xMax: 9.2, yMin: -9, yMax: 21, yTicks: [-6, 0, 6, 12, 18], yFmt: v => pow10(v), xTicks: true, xSteps: [0.5, 1, 2], title: t('c5bot') });
  const qs = linspace(3.8, 9.2, 300);
  curve(ctx, bot, qs, qs.map(q => M.gamow(iso.Zd, iso.Ad, q).log10Half), C.cyan, 2.2);
  GAM().forEach(({ i, g: gi, lm }) => {
    const X = bot.x(i.Q);
    curve(ctx, bot, [i.Q, i.Q], [lm, gi.log10Half], C.muted, 1, null, 0.7);
    dot(ctx, X, bot.y(gi.log10Half), 4.5, C.cyan, true);
    dot(ctx, X, bot.y(lm), 4, C.text);
    if (i === iso) dot(ctx, X, bot.y(lm), 8.5, C.orange, true);
  });
  dot(ctx, bot.x(Q), bot.y(g.log10Half), 5.5, C.orange);
  vline(ctx, bot.x(Q), bot.P.t, bot.P.b, C.orange, [3, 3], 0.6);
  const same = Math.abs(Q - iso.Q) < 0.005;
  const meas = same ? t('measSame', { meas: duration(Math.log10(iso.half)), ratio: Math.pow(10, g.log10Half - Math.log10(iso.half)).toPrecision(2) })
    : t('measOther', { meas: duration(Math.log10(iso.half)), Q0: fix(iso.Q, 3) });
  $('r5').textContent = t('s5readout', { name: iso.name, Z: iso.Zd, Q: fix(Q), R: fix(g.R, 1), b: fix(g.b, 1), th: fix(g.b - g.R, 1), top: fix(g.Vtop, 1), P: sciLog(g.log10P), nu: sciLog(Math.log10(g.nu)), pred: duration(g.log10Half), meas });
  $('isoTable').innerHTML = `<thead><tr><th>${t('thIso')}</th><th>${t('thQ')}</th><th>${t('thMeas')}</th><th>${t('thPred')}</th></tr></thead><tbody>` +
    GAM().map(({ i, g: gi }) => `<tr class="${i === iso ? 'on' : ''}"><td>${i.name}</td><td>${fix(i.Q, 3)}</td><td>${duration(Math.log10(i.half))}</td><td>${duration(gi.log10Half)}</td></tr>`).join('') + '</tbody>';
  $('h5').textContent = t('s5hint', stats5());
}

/* ---------- text with model-computed numbers ---------- */
function htmlParams() {
  const st = stats5();
  return {
    s2e: { mm: fix(M.MMU_ME, 0), sm: fix(Math.sqrt(M.MMU_ME), 1), mp: fix(M.MP_ME, 0), sp: fix(Math.sqrt(M.MP_ME), 1) },
    s5e: st,
    stm: { phi: '4.5', f1: fix(M.stmFactor(4.5, 0.1), 1), f2: fix(M.stmFactor(4.5, 0.02), 1) }
  };
}
function fillText() {
  const P = htmlParams();
  document.querySelectorAll('[data-i18n-html]').forEach(node => { const k = node.dataset.i18nHtml; node.innerHTML = t(k, P[k] || {}); });
  const q = quizParams();
  $('qa').textContent = t('quizA'); $('qb').textContent = t('quizB', q); $('qc').textContent = t('quizC', q);
  const fb = $('quizFeedback'); if (fb.dataset.state) fb.textContent = t(fb.dataset.state === 'correct' ? 'correct' : 'wrong', q);
}

function refresh() { fillText(); draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  buildIso();
  ['e0', 'd0'].forEach(id => $(id).addEventListener('input', draw0));
  $('e0').addEventListener('change', () => { remember(s0.hist, num('e0'), 6); draw0(); });
  remember(s0.hist, num('e0'), 6);
  ['a1', 'e1'].forEach(id => { $(id).addEventListener('input', draw1); $(id).addEventListener('change', () => { remember(s1.hist, [num('a1'), num('e1')], 4); draw1(); }); });
  remember(s1.hist, [num('a1'), num('e1')], 4);
  ['a2', 'e2'].forEach(id => $(id).addEventListener('input', draw2));
  ['e3', 'a3'].forEach(id => $(id).addEventListener('input', draw3));
  ['e4', 'a4'].forEach(id => $(id).addEventListener('input', () => { reset4(); draw4(); }));
  $('run4').addEventListener('click', run4);
  $('reset4').addEventListener('click', () => { reset4(); draw4(); });
  $('det1').addEventListener('click', () => detect4(1));
  $('det100').addEventListener('click', () => detect4(100));
  $('q5').addEventListener('input', draw5);
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked');
    const ok = !!choice && choice.value === 'b', fb = $('quizFeedback');
    fb.dataset.state = ok ? 'correct' : 'wrong'; fb.textContent = t(ok ? 'correct' : 'wrong', quizParams()); fb.style.color = ok ? C.green : C.orange;
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
  document.addEventListener('visibilitychange', () => { if (document.hidden && s4.state === 'running') { stopAnim('s4'); s4.state = 'paused'; draw4(); } });
  window.refreshTunnelling = refresh;
  reset4();
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
