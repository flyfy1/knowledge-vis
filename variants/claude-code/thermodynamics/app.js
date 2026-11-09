'use strict';
// Thermodynamics lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, bar and readout comes from window.THERMO_MODEL (model.js). Canvas text is limited to
// panel titles (own row), axis ticks, the state letters A/B and the bar symbols Qh/Qc/W/①②③.
(function () {

const $ = id => document.getElementById(id);
const M = window.THERMO_MODEL;
const t = (...a) => window.THERMO_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', ghost: '#8696aa' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (d > 0) s = s.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') || '0'; return s.replace('-', '−'); };
const fx = (v, d) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; return v.toFixed(d).replace('-', '−'); }; // fixed decimals

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
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 7);
  ctx.fillText(text, X, Y); ctx.restore();
}
function niceStep(span, px, minPx, steps) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }
// "Nice" ticks: step 1, 2, 2.5 or 5 × 10^k with at most `max` intervals.
function niceTicks(lo, hi, max = 5) {
  const raw = (hi - lo) / max, p = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map(m => m * p).find(s => s >= raw - 1e-12);
  const out = [], a = Math.floor(lo / step + 1e-9), b = Math.ceil(hi / step - 1e-9); // ticks enclose [lo, hi]
  for (let i = a; i <= b; i++) out.push(i * step);
  return out;
}
const xStepsFor = span => [0.25, 0.5, 1, 2, 2.5, 5, 10, 20, 25, 50, 100].filter(s => s >= span / 40);

function panel(ctx, W, o) {
  const P = { l: o.left || 44, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks || []) {
    ctx.strokeStyle = Math.abs(v) < 1e-9 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(fmt(v, o.yDigits ?? 2), P.l - 6, y(v) + 4);
  }
  if (o.xTicks) {
    const step = niceStep(o.xMax - o.xMin, P.r - P.l, o.minPx || 32, o.xSteps || xStepsFor(o.xMax - o.xMin));
    const first = Math.ceil((o.xMin - 1e-9) / step) * step;
    ctx.textAlign = 'center';
    for (let v = first; v <= o.xMax + 1e-9; v += step) {
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
      ctx.fillText(fmt(v, o.xDigits ?? 2), x(v), P.b + 15);
    }
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 12, W - 16);
  return { x, y, P };
}
function dot(ctx, X, Y, r, col, ring) { ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); if (ring) { ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5; ctx.stroke(); } ctx.restore(); }
function curve(ctx, m, f, x0, x1, col, lw = 2, dash = null, n = 200) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.beginPath();
  for (let i = 0; i <= n; i++) { const v = x0 + (x1 - x0) * i / n, X = m.x(v), Y = m.y(f(v)); if (!i) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
  ctx.stroke(); ctx.restore();
}
function poly(ctx, m, pts, col, lw = 2, dash = null) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.beginPath();
  pts.forEach((p, i) => { const X = m.x(p.V), Y = m.y(p.P); if (!i) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }); ctx.stroke(); ctx.restore();
}
// Fill the area between a curve (list of {V, P}) and the V axis.
function areaUnder(ctx, m, pts, fill) {
  if (pts.length < 2) return;
  ctx.save(); ctx.fillStyle = fill; ctx.beginPath(); ctx.moveTo(m.x(pts[0].V), m.y(0));
  pts.forEach(p => ctx.lineTo(m.x(p.V), m.y(p.P))); ctx.lineTo(m.x(pts[pts.length - 1].V), m.y(0)); ctx.closePath(); ctx.fill(); ctx.restore();
}
function label(ctx, text, X, Y, align, col = C.text) { ctx.save(); ctx.fillStyle = col; ctx.font = '700 12px system-ui,sans-serif'; ctx.textAlign = align; ctx.fillText(text, X, Y); ctx.restore(); }
const sample = (f, a, b, n = 120) => Array.from({ length: n + 1 }, (_, i) => { const V = a + (b - a) * i / n; return { V, P: f(V) }; });

/* ---------- animation runner ---------- */
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

const state = { gas: 'mono' };
const gamma = () => M.GAS[state.gas];
const gasName = () => t(state.gas === 'mono' ? 'gasMonoShort' : 'gasDiShort');

/* ---------- step 0: one state, three variables ---------- */
const s0 = { trail: [] };
function heat(T) { const q = Math.max(0, Math.min(1, (T - 200) / 400)); const a = [79, 123, 217], b = [255, 122, 92]; return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * q)).join(',')})`; }
function draw0() {
  const V = num('v0'), T = num('t0'), P = M.pressure(T, V);
  $('v0v').textContent = fmt(V, 1) + ' L'; $('t0v').textContent = fmt(T, 0) + ' K';
  let { ctx, W, H } = fitCanvas($('c0a'));
  const cyl = panel(ctx, W, { top: 30, bottom: H - 14, xMin: 0, xMax: 1, yMin: 0, yMax: 6.6, yTicks: [0, 1, 2, 3, 4, 5, 6], yDigits: 0, left: 34, title: t('c0a') });
  const x0 = cyl.P.l + 10, x1 = Math.min(cyl.P.r - 4, x0 + 150), yb = cyl.y(0), yp = cyl.y(V);
  ctx.save();
  ctx.fillStyle = heat(T); ctx.globalAlpha = 0.5; ctx.fillRect(x0, yp, x1 - x0, yb - yp); ctx.globalAlpha = 1;
  ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, cyl.y(6.6)); ctx.lineTo(x0, yb); ctx.lineTo(x1, yb); ctx.lineTo(x1, cyl.y(6.6)); ctx.stroke();
  ctx.fillStyle = '#9fb4cc'; ctx.fillRect(x0 + 2, yp - 8, x1 - x0 - 4, 8);
  ctx.fillRect((x0 + x1) / 2 - 3, cyl.y(6.6), 6, yp - 8 - cyl.y(6.6));
  ctx.restore();

  ({ ctx, W, H } = fitCanvas($('c0b')));
  const m = panel(ctx, W, { top: 30, bottom: H - 26, xMin: 0, xMax: 6.5, yMin: 0, yMax: 1080, yTicks: [0, 250, 500, 750, 1000], xTicks: true, xSteps: [1, 2], title: t('c0b') });
  for (let T2 = 200; T2 <= 600; T2 += 100) curve(ctx, m, v => M.pressure(T2, v), Math.max(0.3, M.N * M.R * T2 / 1080), 6.5, C.raw, 1.2, null, 160);
  curve(ctx, m, v => M.pressure(T, v), Math.max(0.3, M.N * M.R * T / 1080), 6.5, C.cyan, 2.2, null, 200);
  s0.trail.forEach(q => dot(ctx, m.x(q.V), m.y(q.P), 2.6, C.text));
  dot(ctx, m.x(V), m.y(P), 6, heat(T), true);
  $('r0').textContent = t('s0readout', { T: fmt(T, 0), V: fmt(V, 1), P: fx(P, 1), pv: fx(P * V, 1), n: M.N, R: M.R });
}

/* ---------- step 1: work is area ---------- */
const s1 = { path: 'pv', f: 1 };
const B1 = () => ({ V: num('vb1'), P: num('pb1') });
const pathName = k => t({ pv: 'pathPVShort', vp: 'pathVPShort', line: 'pathLineShort' }[k]);
function draw1() {
  const B = B1(), all = M.paths(B, gamma()), cur = all[s1.path];
  $('vb1v').textContent = fmt(B.V, 1) + ' L'; $('pb1v').textContent = fmt(B.P, 0) + ' kPa';
  ['pv', 'vp', 'line'].forEach(k => $({ pv: 'pathPV', vp: 'pathVP', line: 'pathLine' }[k]).setAttribute('aria-pressed', s1.path === k));
  const { ctx, W, H } = fitCanvas($('c1'));
  const m = panel(ctx, W, { top: 30, bottom: H - 26, xMin: 0, xMax: 6.5, yMin: 0, yMax: 330, yTicks: [0, 100, 200, 300], xTicks: true, xSteps: [1, 2], title: t('c1') });
  // the part of the chosen path walked so far, and the area under it
  const end = M.along(cur.pts, s1.f), walked = [cur.pts[0]];
  const segLen = (a, b) => Math.hypot(b.V - a.V, (b.P - a.P) / 100);
  let total = 0; for (let i = 1; i < cur.pts.length; i++) total += segLen(cur.pts[i - 1], cur.pts[i]);
  let acc = 0; for (let i = 1; i < cur.pts.length; i++) { acc += segLen(cur.pts[i - 1], cur.pts[i]); if (acc <= s1.f * total + 1e-9) walked.push(cur.pts[i]); }
  if (walked[walked.length - 1] !== end) walked.push(end);
  const Wnow = M.workAlong(cur.pts, s1.f);
  areaUnder(ctx, m, walked, Wnow >= 0 ? 'rgba(103,215,249,0.28)' : 'rgba(255,122,147,0.3)');
  ['pv', 'vp', 'line'].forEach(k => { if (k !== s1.path) poly(ctx, m, all[k].pts, C.ghost, 1.4, [5, 4]); });
  poly(ctx, m, cur.pts, C.raw, 2); poly(ctx, m, walked, C.cyan, 2.8);
  dot(ctx, m.x(M.A.V), m.y(M.A.P), 5, C.text, true); dot(ctx, m.x(B.V), m.y(B.P), 5, C.text, true);
  dot(ctx, m.x(end.V), m.y(end.P), 4.5, C.cyan, true);
  label(ctx, 'A', m.x(M.A.V) - 8, m.y(M.A.P) - 8, 'right'); label(ctx, 'B', m.x(B.V) + 8, m.y(B.P) + 16, 'left');
  const dir = Math.abs(cur.W) < 1e-9 ? t('dirZero') : cur.W > 0 ? t('dirOut') : t('dirIn');
  const prog = s1.f < 1 ? t('s1prog', { pct: Math.round(s1.f * 100), w: fx(Wnow, 1) }) : '';
  $('r1').textContent = prog + t('s1readout', { va: fmt(M.A.V), pa: fmt(M.A.P, 0), vb: fmt(B.V, 1), pb: fmt(B.P, 0), name: pathName(s1.path), w: fx(cur.W, 1), dir, w1: fx(all.pv.W, 1), w2: fx(all.vp.W, 1), w3: fx(all.line.W, 1) });
}

/* ---------- step 2: the first-law ledger for the three paths ---------- */
function draw2() {
  const B = B1(), g = gamma(), all = M.paths(B, g), keys = ['pv', 'vp', 'line'];
  const vals = keys.flatMap(k => [all[k].Q, all[k].W, all[k].dU]).concat([0]);
  const ticks = niceTicks(Math.min(...vals), Math.max(...vals), 4);
  const lo = Math.min(ticks[0], ...vals), hi = Math.max(ticks[ticks.length - 1], ...vals), pad = (hi - lo) * 0.06;
  const { ctx, W, H } = fitCanvas($('c2'));
  const m = panel(ctx, W, { top: 30, bottom: H - 30, xMin: 0, xMax: 3, yMin: lo - pad, yMax: hi + pad, yTicks: ticks, yDigits: 0, left: 50, title: t('c2', { gas: gasName() }) });
  const gw = (m.P.r - m.P.l) / 3, bw = Math.min(34, gw / 4.2);
  keys.forEach((k, i) => {
    const cx = m.x(i + 0.5);
    [[all[k].Q, C.orange], [all[k].W, C.cyan], [all[k].dU, C.green]].forEach(([v, col], j) => {
      const X = cx + (j - 1) * (bw + 6) - bw / 2, Y0 = m.y(0), Y1 = m.y(v);
      ctx.fillStyle = col; ctx.globalAlpha = 0.9; ctx.fillRect(X, Math.min(Y0, Y1), bw, Math.max(1.5, Math.abs(Y1 - Y0))); ctx.globalAlpha = 1;
    });
    ctx.save(); ctx.strokeStyle = C.muted; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cx, m.P.b + 14, 8.5, 0, 7); ctx.stroke(); ctx.restore();
    label(ctx, String(i + 1), cx, m.P.b + 18, 'center', C.muted);
  });
  ctx.save(); ctx.strokeStyle = C.green; ctx.setLineDash([6, 4]); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(m.P.l, m.y(all.pv.dU)); ctx.lineTo(m.P.r, m.y(all.pv.dU)); ctx.stroke(); ctx.restore();
  const ta = M.temp(M.A.P, M.A.V), tb = M.temp(B.P, B.V);
  $('r2').textContent = t('s2readout', { gas: gasName(), cv: fx(M.cv(g), 2), ta: fx(ta, 1), tb: fx(tb, 1), du: fx(all.pv.dU, 1), q1: fx(all.pv.Q, 1), q2: fx(all.vp.Q, 1), q3: fx(all.line.Q, 1), w1: fx(all.pv.W, 1), w2: fx(all.vp.W, 1), w3: fx(all.line.W, 1) });
}

/* ---------- step 3: isothermal vs adiabatic ---------- */
function draw3() {
  const V2 = num('v3'), g = gamma(), r = M.isoAdia(V2, g);
  $('v3v').textContent = fmt(V2, 1) + ' L';
  const pmax = Math.max(r.Padia(1), r.Piso(1));
  const yt = niceTicks(0, pmax), ytop = Math.max(pmax, yt[yt.length - 1]) * 1.04;
  let { ctx, W, H } = fitCanvas($('c3a'));
  const m = panel(ctx, W, { top: 30, bottom: H - 26, xMin: 0, xMax: 6.5, yMin: 0, yMax: ytop, yTicks: yt, yDigits: 0, xTicks: true, xSteps: [1, 2], title: t('c3a') });
  const a = Math.min(r.V1, V2), b = Math.max(r.V1, V2);
  areaUnder(ctx, m, sample(r.Piso, a, b), 'rgba(103,215,249,0.16)'); areaUnder(ctx, m, sample(r.Padia, a, b), 'rgba(255,180,84,0.22)');
  curve(ctx, m, r.Piso, 1, 6, C.cyan, 1, [3, 4]); curve(ctx, m, r.Padia, 1, 6, C.orange, 1, [3, 4]);
  if (b > a) { curve(ctx, m, r.Piso, a, b, C.cyan, 2.6); curve(ctx, m, r.Padia, a, b, C.orange, 2.6); }
  dot(ctx, m.x(r.V1), m.y(r.P1), 5.5, C.text, true); dot(ctx, m.x(V2), m.y(r.iso.P2), 5, C.cyan, true); dot(ctx, m.x(V2), m.y(r.adia.P2), 5, C.orange, true);
  ({ ctx, W, H } = fitCanvas($('c3b')));
  const n = panel(ctx, W, { top: 30, bottom: H - 26, xMin: 0, xMax: 6.5, yMin: 0, yMax: 640, yTicks: [0, 200, 400, 600], yDigits: 0, xTicks: true, xSteps: [1, 2], title: t('c3b') });
  curve(ctx, n, r.Tiso, 1, 6, C.cyan, 1, [3, 4], 2); curve(ctx, n, r.Tadia, 1, 6, C.orange, 1, [3, 4]);
  if (b > a) { curve(ctx, n, r.Tiso, a, b, C.cyan, 2.6, null, 2); curve(ctx, n, r.Tadia, a, b, C.orange, 2.6); }
  dot(ctx, n.x(r.V1), n.y(r.T1), 5.5, C.text, true); dot(ctx, n.x(V2), n.y(r.iso.T2), 5, C.cyan, true); dot(ctx, n.x(V2), n.y(r.adia.T2), 5, C.orange, true);
  const note = V2 < r.V1 - 1e-9 ? t('s3compress') : Math.abs(V2 - r.V1) < 1e-9 ? t('s3same') : '';
  $('r3').textContent = t('s3readout', { gas: gasName(), g: fx(g, 3), v1: fmt(r.V1), v2: fmt(V2, 1), t1: fmt(r.T1, 0), pi: fx(r.iso.P2, 1), wi: fx(r.iso.W, 1), ta: fx(r.adia.T2, 1), pa: fx(r.adia.P2, 1), wa: fx(r.adia.W, 1), du: fx(r.adia.dU, 1), note });
}

/* ---------- step 4: Carnot cycle and its ledger ---------- */
const s4 = { s: 4, tried: new Set() };
const LEGCOL = { hot: C.pink, cold: C.cyan, adia: C.ghost };
function cyc() { return M.carnot(num('th4'), num('tc4'), num('ratio4'), gamma()); }
function cycleBox(c) { return { vmax: c.V[2], pmax: M.pressure(c.Th, c.V[0]) }; }
function drawCycle(ctx, m, c, sNow, opts = {}) {
  const pts = []; for (let i = 0; i <= 400; i++) pts.push(c.at(4 * i / 400));
  ctx.save(); ctx.fillStyle = opts.fill || 'rgba(103,215,249,0.26)'; ctx.beginPath(); pts.forEach((p, i) => { if (!i) ctx.moveTo(m.x(p.V), m.y(p.P)); else ctx.lineTo(m.x(p.V), m.y(p.P)); }); ctx.closePath(); ctx.fill(); ctx.restore();
  for (let leg = 0; leg < 4; leg++) {
    const seg = []; for (let i = 0; i <= 100; i++) seg.push(c.at(leg + i / 100));
    poly(ctx, m, seg, opts.color || LEGCOL[c.legs[leg].kind], opts.lw || 1.4, opts.dash || (opts.color ? null : [4, 3]));
    if (sNow !== undefined && sNow > leg) { const done = seg.filter((_, i) => leg + i / 100 <= sNow + 1e-9); if (done.length > 1) poly(ctx, m, done, LEGCOL[c.legs[leg].kind], 3); }
  }
}
function draw4() {
  const c = cyc(), s = s4.s, L = c.ledger(s), p = c.at(Math.min(s, 3.9999));
  $('th4v').textContent = fmt(c.Th, 0) + ' K'; $('tc4v').textContent = fmt(c.Tc, 0) + ' K'; $('ratio4v').textContent = fmt(c.r, 1);
  s4.tried.add(c.r.toFixed(1) + state.gas);
  let { ctx, W, H } = fitCanvas($('c4a'));
  const box = cycleBox(c), xt = niceTicks(0, box.vmax * 1.05, 4), yt = niceTicks(0, box.pmax * 1.05);
  const m = panel(ctx, W, { top: 30, bottom: H - 26, xMin: 0, xMax: Math.max(box.vmax * 1.08, xt[xt.length - 1]), yMin: 0, yMax: Math.max(box.pmax * 1.1, yt[yt.length - 1] * 1.04), yTicks: yt, yDigits: 0, xTicks: true, xSteps: [xt[1] - xt[0]], minPx: 1, title: t('c4a') });
  drawCycle(ctx, m, c, s);
  dot(ctx, m.x(p.V), m.y(p.P), 5.5, C.text, true);
  ({ ctx, W, H } = fitCanvas($('c4b')));
  const xmax = c.Qh * 1.08, bt = niceTicks(0, xmax, 3);
  const pct = Math.round(Math.min(1, s / 4) * 100);
  const B = panel(ctx, W, { top: 30, bottom: H - 26, xMin: 0, xMax: Math.max(xmax, bt[bt.length - 1] * 1.04), yMin: 0, yMax: 3, xTicks: true, xSteps: [bt[1] - bt[0]], minPx: 1, xDigits: 0, left: 36, title: t('c4b', { pct }) });
  [['Qh', c.Qh, L.qin, C.pink], ['Qc', c.Qc, L.qout, C.cyan], ['W', c.W, L.W, C.green]].forEach(([name, fin, now, col], i) => {
    const yc = B.y(2.5 - i), h = Math.min(30, (B.P.b - B.P.t) / 5);
    ctx.save(); ctx.strokeStyle = col; ctx.globalAlpha = 0.6; ctx.setLineDash([4, 3]); ctx.strokeRect(B.x(0), yc - h / 2, B.x(fin) - B.x(0), h); ctx.restore();
    ctx.save(); ctx.fillStyle = col; ctx.globalAlpha = 0.85; const x0 = B.x(Math.min(0, now)), x1 = B.x(Math.max(0, now)); ctx.fillRect(x0, yc - h / 2, Math.max(1.5, x1 - x0), h); ctx.restore();
    label(ctx, name, B.P.l - 6, yc + 4, 'right', C.muted);
  });
  ctx.save(); ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(B.x(0), B.P.t); ctx.lineTo(B.x(0), B.P.b); ctx.stroke(); ctx.restore();
  const legName = t(['leg0', 'leg1', 'leg2', 'leg3'][p.leg]);
  const prog = s < 4 ? t('s4prog', { pct, leg: legName, qin: fx(L.qin, 1), qout: fx(L.qout, 1), w: fx(L.W, 1) }) : '';
  $('r4').textContent = prog + t('s4readout', { gas: gasName(), th: fmt(c.Th, 0), tc: fmt(c.Tc, 0), r: fmt(c.r, 1), qh: fx(c.Qh, 1), qc: fx(c.Qc, 1), w: fx(c.W, 1), eta: fx(c.eta, 3), etac: fx(c.etaC, 3), k: s4.tried.size });
}

/* ---------- step 5: a real cycle under the ceiling ---------- */
const s5 = { regen: false };
function draw5() {
  const Th = num('th4'), Tc = num('tc4'), r = num('ratio4'), g = gamma(), st = M.stirling(Th, Tc, r, g, s5.regen), c = M.carnot(Th, Tc, r, g);
  $('regenOff').setAttribute('aria-pressed', !s5.regen); $('regenOn').setAttribute('aria-pressed', s5.regen);
  let { ctx, W, H } = fitCanvas($('c5a'));
  const box = cycleBox(c), xt = niceTicks(0, box.vmax * 1.05, 4), yt = niceTicks(0, box.pmax * 1.05);
  const m = panel(ctx, W, { top: 30, bottom: H - 26, xMin: 0, xMax: Math.max(box.vmax * 1.08, xt[xt.length - 1]), yMin: 0, yMax: Math.max(box.pmax * 1.1, yt[yt.length - 1] * 1.04), yTicks: yt, yDigits: 0, xTicks: true, xSteps: [xt[1] - xt[0]], minPx: 1, title: t('c5a') });
  drawCycle(ctx, m, c, undefined, { color: C.ghost, dash: [5, 4], fill: 'rgba(134,150,170,0.08)' });
  // Stirling: isotherm Th (1→2), constant volume (2→3), isotherm Tc (3→4), constant volume (4→1)
  const iso = (T, a, b) => sample(v => M.pressure(T, v), a, b, 80);
  const loop = [...iso(Th, st.pts[0].V, st.pts[1].V), ...iso(Tc, st.pts[2].V, st.pts[3].V)];
  ctx.save(); ctx.fillStyle = 'rgba(255,180,84,0.22)'; ctx.beginPath(); loop.forEach((q, i) => { if (!i) ctx.moveTo(m.x(q.V), m.y(q.P)); else ctx.lineTo(m.x(q.V), m.y(q.P)); }); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = C.orange; ctx.lineWidth = 2.4; ctx.stroke(); ctx.restore();
  ({ ctx, W, H } = fitCanvas($('c5b')));
  const n = panel(ctx, W, { top: 30, bottom: H - 26, xMin: 1.5, xMax: 4, yMin: 0, yMax: 1.04, yTicks: [0, 0.25, 0.5, 0.75, 1], xTicks: true, xSteps: [0.5, 1], title: t('c5b') });
  curve(ctx, n, () => c.etaC, 1.5, 4, C.text, 2, null, 2);
  curve(ctx, n, q => M.stirling(Th, Tc, q, g, false).eta, 1.5, 4, C.orange, s5.regen ? 1.2 : 2.4, s5.regen ? [4, 4] : null);
  if (s5.regen) curve(ctx, n, q => M.stirling(Th, Tc, q, g, true).eta, 1.5, 4, C.orange, 2.4, [8, 5], 2);
  dot(ctx, n.x(r), n.y(st.eta), 6, C.orange, true);
  const plus = s5.regen ? t('s5regenOn', { qv: fx(st.Qv, 1) }) : t('s5regenOff', { qv: fx(st.Qv, 1) });
  $('r5').textContent = t('s5readout', { gas: gasName(), th: fmt(Th, 0), tc: fmt(Tc, 0), r: fmt(r, 1), w: fx(st.W, 1), qiso: fx(st.Qiso, 1), plus, qin: fx(st.Qin, 1), eta: fx(st.eta, 3), etac: fx(st.etaC, 3), gap: fx(st.etaC - st.eta, 3) });
}

function syncGas() { document.querySelectorAll('.gas-mono').forEach(b => b.setAttribute('aria-pressed', state.gas === 'mono')); document.querySelectorAll('.gas-di').forEach(b => b.setAttribute('aria-pressed', state.gas === 'di')); }
function refresh() { syncGas(); draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  const addTrail = () => { s0.trail.push({ V: num('v0'), P: M.pressure(num('t0'), num('v0')) }); if (s0.trail.length > 400) s0.trail.shift(); };
  addTrail();
  ['v0', 't0'].forEach(id => $(id).addEventListener('input', () => { addTrail(); draw0(); }));
  $('clear0').addEventListener('click', () => { s0.trail = []; addTrail(); draw0(); });

  const setPath = k => { stopAnim('s1'); s1.path = k; s1.f = 1; draw1(); };
  $('pathPV').addEventListener('click', () => setPath('pv')); $('pathVP').addEventListener('click', () => setPath('vp')); $('pathLine').addEventListener('click', () => setPath('line'));
  ['vb1', 'pb1'].forEach(id => $(id).addEventListener('input', () => { stopAnim('s1'); s1.f = 1; draw1(); draw2(); }));
  $('play1').addEventListener('click', () => animate('s1', 3000, p => { s1.f = p; draw1(); }));

  document.querySelectorAll('.gas-mono').forEach(b => b.addEventListener('click', () => { state.gas = 'mono'; syncGas(); draw2(); draw3(); draw4(); draw5(); }));
  document.querySelectorAll('.gas-di').forEach(b => b.addEventListener('click', () => { state.gas = 'di'; syncGas(); draw2(); draw3(); draw4(); draw5(); }));
  document.querySelectorAll('.quiz').forEach(q => q.querySelector('.check-quiz').addEventListener('click', () => {
    const name = q.dataset.quiz, choice = q.querySelector(`input[name="${name}"]:checked`), fb = q.querySelector('.quiz-feedback');
    const ok = !!choice && choice.value === q.dataset.answer;
    fb.textContent = t(choice ? name + (ok ? 'Right' : 'Wrong') : 'pick'); fb.style.color = ok ? C.green : C.orange;
  }));

  $('v3').addEventListener('input', draw3);

  ['th4', 'tc4'].forEach(id => $(id).addEventListener('input', () => { stopAnim('s4'); s4.s = 4; s4.tried.clear(); draw4(); draw5(); }));
  $('ratio4').addEventListener('input', () => { stopAnim('s4'); s4.s = 4; draw4(); draw5(); });
  $('play4').addEventListener('click', () => animate('s4', 6000, p => { s4.s = 4 * p; draw4(); }));
  $('regenOff').addEventListener('click', () => { s5.regen = false; draw5(); });
  $('regenOn').addEventListener('click', () => { s5.regen = true; draw5(); });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshThermo = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
