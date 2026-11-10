'use strict';
// Feedback-control lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every trace and readout comes from window.PID_MODEL.simulate (model.js). Canvas text is limited to
// panel titles (own row, shrunk to fit) and axis ticks; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.PID_MODEL;
const t = (...a) => window.PID_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', ghost: '#5d6f86', sky: '#101c2a' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros only after a decimal point; show −0 as 0.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d); return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s; };
const fx = (v, d) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; return v.toFixed(d); };
const settleText = s => (Number.isFinite(s) ? t('secs', { v: s.toFixed(2) }) : t('notSettled'));
const N = Math.round(M.T_END / M.DT) + 1;

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
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
// A plot panel with its title in its own row above it; y ticks left of the plot, x ticks below.
function panel(ctx, W, o) {
  const P = { l: o.left, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks) {
    ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(fmt(v, 1), P.l - 5, y(v) + 4);
  }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.t); ctx.lineTo(P.l, P.b); ctx.stroke();
  if (o.xTicks) {
    ctx.textAlign = 'center';
    for (const v of o.xTicks) { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke(); ctx.fillText(fmt(v, 1), x(v), P.b + 15); }
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 9, W - 16);
  return { x, y, P };
}
const TIME_TICKS = [0, 2, 4, 6, 8, 10];
// Horizontal layout shared by every flight canvas: a "sky" strip on the left, then the plots.
function layout(W) { const sw = W < 480 ? 48 : 84; return { sw, left: 8 + sw + 34 }; }

function trace(ctx, m, arr, kEnd, color, lw = 2, opts = {}) {
  ctx.save(); ctx.beginPath(); ctx.rect(m.P.l, m.P.t - 1, m.P.r - m.P.l, m.P.b - m.P.t + 2); ctx.clip();
  ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = opts.alpha || 1; if (opts.dash) ctx.setLineDash(opts.dash);
  ctx.beginPath(); const stride = opts.stride || 1;
  for (let k = 0; k <= kEnd; k += stride) { const X = m.x(k * M.DT), Y = m.y(arr[k]); if (!k) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
  ctx.stroke(); ctx.restore();
}
function hline(ctx, m, v, color, dash) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(m.P.l, m.y(v)); ctx.lineTo(m.P.r, m.y(v)); ctx.stroke(); ctx.restore();
}
function cursorLine(ctx, X, y0, y1) {
  ctx.save(); ctx.strokeStyle = C.text; ctx.globalAlpha = 0.35; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y1); ctx.stroke(); ctx.restore();
}
// Sky strip: ground, target line and the drone(s) at their current altitude (same y scale as the plot).
function sky(ctx, A, sw, r, drones) {
  const x0 = 8, top = A.P.t, bot = A.P.b;
  ctx.save(); ctx.fillStyle = C.sky; ctx.fillRect(x0, top, sw, bot - top);
  ctx.fillStyle = '#26384b'; ctx.fillRect(x0, bot, sw, 3);
  ctx.strokeStyle = C.text; ctx.globalAlpha = 0.7; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(x0, A.y(r)); ctx.lineTo(x0 + sw, A.y(r)); ctx.stroke(); ctx.restore();
  drones.forEach((d, i) => {
    const cx = x0 + sw * (drones.length === 1 ? 0.5 : (i + 0.5) / drones.length), size = Math.min(sw / drones.length - 6, 34);
    const yMaxV = A.yMax, clipped = d.z > yMaxV, Y = clipped ? top + 8 : A.y(d.z) - 4;
    drawDrone(ctx, cx, Y, size, d.color, d.u, clipped);
  });
}
function drawDrone(ctx, cx, cy, size, color, u, clipped) {
  ctx.save();
  // rotor wash: length grows with thrust (0–30 N)
  const wash = Math.max(0, Math.min(1, u / 30)) * size * 0.9;
  if (wash > 0.5) { const g = ctx.createLinearGradient(0, cy, 0, cy + wash); g.addColorStop(0, color + '88'); g.addColorStop(1, color + '00'); ctx.fillStyle = g; ctx.fillRect(cx - size / 2, cy + 2, size * 0.22, wash); ctx.fillRect(cx + size / 2 - size * 0.22, cy + 2, size * 0.22, wash); }
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx - size / 2 + 3, cy); ctx.lineTo(cx + size / 2 - 3, cy); ctx.stroke();
  ctx.fillRect(cx - size * 0.16, cy - 3, size * 0.32, 6);
  [-1, 1].forEach(s => { ctx.beginPath(); ctx.ellipse(cx + s * (size / 2 - size * 0.11), cy - 3, size * 0.15, 2.2, 0, 0, 7); ctx.fill(); });
  if (clipped) { ctx.beginPath(); ctx.moveTo(cx, cy - 12); ctx.lineTo(cx - 5, cy - 6); ctx.lineTo(cx + 5, cy - 6); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}
// Thrust gauge in the strip below the sky: vertical bar(s) on the thrust panel's scale.
function gauge(ctx, Tp, sw, bars) {
  const x0 = 8; ctx.save(); ctx.fillStyle = C.sky; ctx.fillRect(x0, Tp.P.t, sw, Tp.P.b - Tp.P.t);
  bars.forEach((b, i) => {
    const w = Math.min(14, sw / bars.length - 10), cx = x0 + sw * (bars.length === 1 ? 0.5 : (i + 0.5) / bars.length);
    const y0 = Tp.y(Math.max(Tp.yMin, 0)), y1 = Tp.y(Math.max(Tp.yMin, Math.min(Tp.yMax, b.u)));
    ctx.fillStyle = b.color; ctx.globalAlpha = 0.85; ctx.fillRect(cx - w / 2, Math.min(y0, y1), w, Math.abs(y0 - y1));
  });
  ctx.restore();
}

/* ---------- animation runner (respects reduced motion and hidden pages) ---------- */
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
const cursor = { 0: N - 1, 1: N - 1, 2: N - 1, 3: N - 1, 4: N - 1, 5: N - 1 };
function play(step, draw) { animate('s' + step, 5000, p => { cursor[step] = Math.round(p * (N - 1)); draw(); }); }
function still(step) { stopAnim('s' + step); cursor[step] = N - 1; }
const progress = step => (cursor[step] < N - 1 ? t('playing', { t: (cursor[step] * M.DT).toFixed(1) }) : '');

// Altitude + thrust canvas used by steps 0, 1, 2 and 5.
function flightCanvas(canvas, o) {
  const { ctx, W, H } = fitCanvas(canvas), L = layout(W), k = o.k;
  const split = Math.round(H * 0.58);
  const A = panel(ctx, W, { left: L.left, top: 26, bottom: split - 24, xMin: 0, xMax: 10, yMin: 0, yMax: 12, yTicks: [0, 4, 8, 12], xTicks: TIME_TICKS, title: t('cAlt') }); A.yMax = 12;
  const Tp = panel(ctx, W, { left: L.left, top: split + 22, bottom: H - 24, xMin: 0, xMax: 10, yMin: 0, yMax: 30, yTicks: [0, 10, 20, 30], xTicks: TIME_TICKS, title: t('cThrust') }); Tp.yMin = 0; Tp.yMax = 30;
  hline(ctx, A, o.r, C.text, [5, 4]);
  (o.weights || [M.PLANT.m * M.PLANT.g]).forEach(w => hline(ctx, Tp, w, C.pink, [2, 3]));
  (o.ghosts || []).forEach(g => { trace(ctx, A, g.z, N - 1, C.ghost, 1.5, { alpha: 0.8 }); trace(ctx, Tp, g.u, N - 1, C.ghost, 1, { alpha: 0.5 }); });
  o.runs.forEach(rn => { trace(ctx, Tp, rn.s.u, k, rn.color, rn.noisy ? 1 : 1.8, { alpha: rn.noisy ? 0.85 : 1 }); });
  o.runs.forEach(rn => { trace(ctx, A, rn.s.z, k, rn.color, 2.4); });
  sky(ctx, A, L.sw, o.r, o.runs.map(rn => ({ z: rn.s.z[k], u: rn.s.u[k], color: rn.color })));
  gauge(ctx, Tp, L.sw, o.runs.map(rn => ({ u: rn.s.u[k], color: rn.color })));
  if (k < N - 1) cursorLine(ctx, A.x(k * M.DT), A.P.t, Tp.P.b);
}

/* ---------- step 0: open loop vs closed loop ---------- */
const base0 = M.simulate({ ...M.PRESETS.step0 });
const recorded = Array.from(base0.u);
const tailMean = (arr, sec = 1) => { const n = arr.length, w = Math.round(sec / M.DT); let s = 0; for (let k = n - w; k < n; k++) s += arr[k]; return s / w; };
function draw0() {
  const m = num('m0'); $('m0v').textContent = m.toFixed(2);
  const ol = M.simulate({ openLoop: recorded, m, r: 5 }), cl = M.simulate({ ...M.PRESETS.step0, m });
  flightCanvas($('c0'), { k: cursor[0], r: 5, runs: [{ s: ol, color: C.orange }, { s: cl, color: C.cyan }], weights: [m * M.PLANT.g] });
  let olText; const zEnd = ol.z[N - 1];
  const kTop = ol.z.findIndex(v => v > 12);
  let kGround = -1; for (let q = 100; q < N; q++) if (ol.z[q] === 0) { kGround = q; break; }
  if (kTop >= 0) olText = t('olTop', { t: (kTop * M.DT).toFixed(1) });
  else if (kGround >= 0) olText = t('olGround', { t: (kGround * M.DT).toFixed(1) });
  else olText = t('olEnd', { z: zEnd.toFixed(2) });
  const mc = M.metrics(cl);
  $('r0').textContent = progress(0) + t('s0readout', { m: m.toFixed(2), ol: olText, cl: mc.finalZ.toFixed(2), peak: mc.peak.toFixed(2), w: (m * M.PLANT.g).toFixed(2), rec: tailMean(recorded).toFixed(2) });
}

/* ---------- steps 1–2: P, then PD (with ghost history) ---------- */
const ghosts = { 1: new Map(), 2: new Map(), 3: new Map() };
function remember(step, key, s) { const g = ghosts[step]; g.delete(key); g.set(key, s); while (g.size > 7) g.delete(g.keys().next().value); }
const others = (step, key) => [...ghosts[step]].filter(([q]) => q !== key).map(([, s]) => s);

function draw1() {
  const kp = num('kp1'); $('kp1v').textContent = String(kp);
  const s = M.simulate({ kp, r: 5 }), mt = M.metrics(s); remember(1, kp, s);
  flightCanvas($('c1'), { k: cursor[1], r: 5, runs: [{ s, color: C.cyan }], ghosts: others(1, kp) });
  $('r1').textContent = progress(1) + t('s1readout', { kp, fz: mt.finalZ.toFixed(2), sag: fx(mt.sag, 2), th: (M.PLANT.m * M.PLANT.g / kp).toFixed(2), peak: mt.peak.toFixed(2), os: mt.overshoot.toFixed(1), cross: M.crossings(s) });
}
const s2 = { noise: false };
function draw2() {
  const kd = num('kd2'); $('kd2v').textContent = fmt(kd, 1);
  $('noise2').setAttribute('aria-pressed', String(s2.noise));
  const opts = { kp: 20, kd, r: 5, noise: s2.noise ? 0.005 : 0, seed: 3 };
  const s = M.simulate(opts), mt = M.metrics(s), key = kd + (s2.noise ? 'n' : ''); remember(2, key, s);
  flightCanvas($('c2'), { k: cursor[2], r: 5, runs: [{ s, color: C.cyan, noisy: s2.noise }], ghosts: others(2, key) });
  const j = M.thrustJitter(s);
  const noise = t(s2.noise ? 's2noiseOn' : 's2noiseOff', { j: j.toFixed(2) });
  $('r2').textContent = progress(2) + t('s2readout', { kd: fmt(kd, 1), peak: mt.peak.toFixed(2), os: mt.overshoot.toFixed(1), cross: M.crossings(s), fz: mt.finalZ.toFixed(2), sag: fx(mt.sag, 2), noise });
}

/* ---------- step 3: the I term (altitude, error area, thrust components) ---------- */
function draw3() {
  const ki = num('ki3'); $('ki3v').textContent = fmt(ki, 1);
  const s = M.simulate({ ...M.PRESETS.step3, ki }), mt = M.metrics(s), k = cursor[3]; remember(3, ki, s);
  const { ctx, W, H } = fitCanvas($('c3')), L = layout(W);
  const A = panel(ctx, W, { left: L.left, top: 26, bottom: 176, xMin: 0, xMax: 10, yMin: 0, yMax: 12, yTicks: [0, 4, 8, 12], xTicks: TIME_TICKS, title: t('cAlt') }); A.yMax = 12;
  const E = panel(ctx, W, { left: L.left, top: 222, bottom: 330, xMin: 0, xMax: 10, yMin: -2, yMax: 5.5, yTicks: [-2, 0, 2, 4], xTicks: TIME_TICKS, title: t('cErr') });
  const Tp = panel(ctx, W, { left: L.left, top: 376, bottom: H - 24, xMin: 0, xMax: 10, yMin: -10, yMax: 30, yTicks: [-10, 0, 10, 20, 30], xTicks: TIME_TICKS, title: t('cComp') }); Tp.yMin = -10; Tp.yMax = 30;
  hline(ctx, A, 5, C.text, [5, 4]); hline(ctx, Tp, 9.8, C.pink, [2, 3]);
  others(3, ki).forEach(g => trace(ctx, A, g.z, N - 1, C.ghost, 1.5, { alpha: 0.8 }));
  // error area, positive (below target) and negative (above target)
  ctx.save(); ctx.beginPath(); ctx.rect(E.P.l, E.P.t, E.P.r - E.P.l, E.P.b - E.P.t); ctx.clip();
  for (const sign of [1, -1]) {
    ctx.fillStyle = sign > 0 ? 'rgba(255,180,84,0.38)' : 'rgba(255,122,147,0.38)'; ctx.beginPath(); ctx.moveTo(E.x(0), E.y(0));
    for (let q = 0; q <= k; q++) ctx.lineTo(E.x(q * M.DT), E.y(sign > 0 ? Math.max(0, s.e[q]) : Math.min(0, s.e[q])));
    ctx.lineTo(E.x(k * M.DT), E.y(0)); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  trace(ctx, E, s.e, k, C.text, 1.4);
  trace(ctx, Tp, s.uP, k, C.cyan, 1.6); trace(ctx, Tp, s.uD, k, C.green, 1.6); trace(ctx, Tp, s.uI, k, C.orange, 2.2); trace(ctx, Tp, s.u, k, C.text, 1.4, { dash: [5, 3] });
  trace(ctx, A, s.z, k, C.cyan, 2.4);
  sky(ctx, A, L.sw, 5, [{ z: s.z[k], u: s.u[k], color: C.cyan }]);
  ctx.fillStyle = C.sky; ctx.fillRect(8, E.P.t, L.sw, E.P.b - E.P.t);
  gauge(ctx, Tp, L.sw, [{ u: s.uI[k], color: C.orange }]);
  if (k < N - 1) cursorLine(ctx, A.x(k * M.DT), A.P.t, Tp.P.b);
  const e = N - 1;
  $('r3').textContent = progress(3) + t('s3readout', { ki: fmt(ki, 1), fz: mt.finalZ.toFixed(2), sag: fx(mt.sag, 3), os: mt.overshoot.toFixed(1), st: settleText(mt.settle), ui: fx(s.uI[e], 2), up: fx(s.uP[e], 2), ud: fx(s.uD[e], 2), u: fx(s.u[e], 2) });
}

/* ---------- step 4: thrust limit and integrator windup ---------- */
function draw4() {
  const r = num('r4'); $('r4v').textContent = r.toFixed(1);
  const g = M.PRESETS.step4, sp = M.simulate({ ...g, r }), sc = M.simulate({ ...g, r, antiWindup: true }), mp = M.metrics(sp), mc = M.metrics(sc), k = cursor[4];
  const { ctx, W, H } = fitCanvas($('c4')), L = layout(W);
  const A = panel(ctx, W, { left: L.left, top: 26, bottom: 176, xMin: 0, xMax: 10, yMin: 0, yMax: 12, yTicks: [0, 4, 8, 12], xTicks: TIME_TICKS, title: t('cAlt') }); A.yMax = 12;
  const maxI = Math.max(2, ...sp.integ, ...sc.integ), iTop = Math.ceil(maxI / 2) * 2;
  const I = panel(ctx, W, { left: L.left, top: 222, bottom: 330, xMin: 0, xMax: 10, yMin: -1, yMax: iTop, yTicks: [0, iTop / 2, iTop], xTicks: TIME_TICKS, title: t('cInteg') });
  const Tp = panel(ctx, W, { left: L.left, top: 376, bottom: H - 24, xMin: 0, xMax: 10, yMin: 0, yMax: 30, yTicks: [0, 10, 20, 30], xTicks: TIME_TICKS, title: t('cThrust') }); Tp.yMin = 0; Tp.yMax = 30;
  // saturated stretches of the plain integrator, shaded on all three panels
  ctx.save(); ctx.fillStyle = 'rgba(255,122,147,0.16)';
  for (let q = 0; q <= k; q++) if (sp.sat[q] && sp.u[q] >= M.PLANT.uMax - 1e-9) for (const m of [A, I, Tp]) ctx.fillRect(m.x(q * M.DT), m.P.t, Math.max(1, m.x(M.DT) - m.x(0)) + 0.5, m.P.b - m.P.t);
  ctx.restore();
  hline(ctx, A, r, C.text, [5, 4]); hline(ctx, Tp, 9.8, C.pink, [2, 3]);
  trace(ctx, I, sp.integ, k, C.orange, 2); trace(ctx, I, sc.integ, k, C.cyan, 2);
  trace(ctx, Tp, sp.u, k, C.orange, 1.8); trace(ctx, Tp, sc.u, k, C.cyan, 1.6, { dash: [5, 3] });
  trace(ctx, A, sp.z, k, C.orange, 2.4); trace(ctx, A, sc.z, k, C.cyan, 2.2, { dash: [6, 3] });
  sky(ctx, A, L.sw, r, [{ z: sp.z[k], u: sp.u[k], color: C.orange }, { z: sc.z[k], u: sc.u[k], color: C.cyan }]);
  ctx.fillStyle = C.sky; ctx.fillRect(8, I.P.t, L.sw, I.P.b - I.P.t);
  gauge(ctx, Tp, L.sw, [{ u: sp.u[k], color: C.orange }, { u: sc.u[k], color: C.cyan }]);
  if (k < N - 1) cursorLine(ctx, A.x(k * M.DT), A.P.t, Tp.P.b);
  const peakI = s => Math.max(...s.integ);
  $('r4o').textContent = progress(4) + t('s4readout', { r: r.toFixed(1), sat: mp.satT.toFixed(2), osP: mp.overshoot.toFixed(1), iP: peakI(sp).toFixed(2), stP: settleText(mp.settle), osC: mc.overshoot.toFixed(1), iC: peakI(sc).toFixed(2), stC: settleText(mc.settle) });
}

/* ---------- step 5: tuning lab ---------- */
const s5 = { aw: true, tries: new Map() };
function run5() {
  const o = { kp: num('kp5'), ki: num('ki5'), kd: num('kd5'), r: 5, noise: 0.005, seed: 3, antiWindup: s5.aw };
  const s = M.simulate(o), mt = M.metrics(s), j = M.thrustJitter(s), ok = M.meetsSpec(mt, j);
  return { o, s, mt, j, ok, pass: ok.os && ok.st && ok.ss && ok.j };
}
function addTry() { const q = run5(); s5.tries.set([q.o.kp, q.o.ki, q.o.kd, s5.aw].join(','), { settle: q.mt.settle, os: q.mt.overshoot, pass: q.pass }); }
function draw5() {
  const q = run5();
  $('kp5v').textContent = String(q.o.kp); $('ki5v').textContent = fmt(q.o.ki, 1); $('kd5v').textContent = fmt(q.o.kd, 1);
  $('aw5').setAttribute('aria-pressed', String(s5.aw));
  flightCanvas($('c5'), { k: cursor[5], r: 5, runs: [{ s: q.s, color: C.cyan, noisy: true }] });
  const { ctx, W, H } = fitCanvas($('c5b'));
  const B = panel(ctx, W, { left: 40, top: 26, bottom: H - 24, xMin: 0, xMax: 10.5, yMin: 0, yMax: 30, yTicks: [0, 5, 10, 20, 30], xTicks: [0, 3, 6, 10], title: t('cTries') });
  ctx.save(); ctx.fillStyle = 'rgba(126,226,168,0.14)'; ctx.strokeStyle = C.green; ctx.lineWidth = 1.2;
  ctx.fillRect(B.x(0), B.y(5), B.x(3) - B.x(0), B.y(0) - B.y(5)); ctx.strokeRect(B.x(0), B.y(5), B.x(3) - B.x(0), B.y(0) - B.y(5));
  const pt = (st, os) => ({ X: B.x(Number.isFinite(st) ? Math.min(st, 10) : 10.3), Y: B.y(Math.min(os, 30)) });
  const curKey = [q.o.kp, q.o.ki, q.o.kd, s5.aw].join(',');
  [...s5.tries].forEach(([key, tr]) => { if (key === curKey) return; const p = pt(tr.settle, tr.os); ctx.fillStyle = tr.pass ? C.green : '#8696aa'; ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.arc(p.X, p.Y, 3.6, 0, 7); ctx.fill(); });
  ctx.globalAlpha = 1; const p = pt(q.mt.settle, q.mt.overshoot);
  ctx.strokeStyle = C.cyan; ctx.lineWidth = 2.5; ctx.fillStyle = q.pass ? C.green : C.bg; ctx.beginPath(); ctx.arc(p.X, p.Y, 6.5, 0, 7); ctx.fill(); ctx.stroke();
  ctx.restore();
  const items = [['os', 'chkOs', q.mt.overshoot.toFixed(1)], ['st', 'chkSt', settleText(q.mt.settle)], ['ss', 'chkSs', Math.abs(q.mt.sag).toFixed(3)], ['j', 'chkJ', q.j.toFixed(2)]];
  $('checks5').innerHTML = items.map(([k2, key, v]) => `<li class="${q.ok[k2] ? 'ok' : 'no'}">${q.ok[k2] ? '✓' : '✗'} ${t(key, { v })}</li>`).join('');
  const missed = items.filter(([k2]) => !q.ok[k2]).length;
  const passCount = [...s5.tries.values()].filter(v => v.pass).length;
  $('r5').textContent = progress(5) + t('s5readout', { kp: q.o.kp, ki: fmt(q.o.ki, 1), kd: fmt(q.o.kd, 1), aw: t(s5.aw ? 'awOn' : 'awOff'), verdict: missed ? t('verdictFail', { n: missed }) : t('verdictPass'), c: s5.tries.size, p: passCount });
}
function setPreset(p) { $('kp5').value = p.kp; $('ki5').value = p.ki; $('kd5').value = p.kd; still(5); addTry(); draw5(); }

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  $('m0').addEventListener('input', () => { still(0); draw0(); });
  $('fly0').addEventListener('click', () => play(0, draw0));
  $('kp1').addEventListener('input', () => { still(1); draw1(); });
  $('fly1').addEventListener('click', () => play(1, draw1));
  $('clear1').addEventListener('click', () => { ghosts[1].clear(); draw1(); });
  $('kd2').addEventListener('input', () => { still(2); draw2(); });
  $('noise2').addEventListener('click', () => { s2.noise = !s2.noise; ghosts[2].clear(); still(2); draw2(); });
  $('fly2').addEventListener('click', () => play(2, draw2));
  $('clear2').addEventListener('click', () => { ghosts[2].clear(); draw2(); });
  $('ki3').addEventListener('input', () => { still(3); draw3(); });
  $('fly3').addEventListener('click', () => play(3, draw3));
  $('clear3').addEventListener('click', () => { ghosts[3].clear(); draw3(); });
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked'), ok = !!choice && choice.value === 'b';
    $('quizFeedback').textContent = t(ok ? 'correct' : 'wrong'); $('quizFeedback').style.color = ok ? C.green : C.orange; $('quizFeedback').dataset.state = ok ? 'correct' : 'wrong';
  });
  $('r4').addEventListener('input', () => { still(4); draw4(); });
  $('fly4').addEventListener('click', () => play(4, draw4));
  ['kp5', 'ki5', 'kd5'].forEach(id => { $(id).addEventListener('input', () => { still(5); draw5(); }); $(id).addEventListener('change', () => { addTry(); draw5(); }); });
  $('preGentle').addEventListener('click', () => setPreset(M.PRESETS.gentle));
  $('preStep3').addEventListener('click', () => setPreset({ ...M.PRESETS.step3, ki: 5 }));
  $('preAggr').addEventListener('click', () => setPreset(M.PRESETS.aggressive));
  $('aw5').addEventListener('click', () => { s5.aw = !s5.aw; still(5); addTry(); draw5(); });
  $('clear5').addEventListener('click', () => { s5.tries.clear(); addTry(); draw5(); });
  addTry();

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshPid = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
