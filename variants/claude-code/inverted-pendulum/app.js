'use strict';
// Inverted-pendulum lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every trace, pole and readout comes from window.PENDULUM_MODEL (model.js). Canvas text is limited to
// panel titles and axis ticks laid out in fixed rows; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.PENDULUM_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', red: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', dot: '#8ea3bb', ghost: '#8696aa' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Fixed decimals, then trailing zeros dropped only after a decimal point (90 stays 90); −0 shows as 0.
const fmt = (v, d = 2) => {
  if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0;
  let s = v.toFixed(d);
  if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
  return s.replace('-', '−');
};
// Two significant figures, plain decimal notation (no exponent) for the pressure ticks.
const sig = (v, n = 2) => { if (!v) return '0'; const d = Math.max(0, n - 1 - Math.floor(Math.log10(Math.abs(v)))); return fmt(v, d); };

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

// Text that shrinks until it fits maxW (never overflows, never squeezes glyphs).
function fitText(ctx, text, X, Y, maxW, { size = 12, weight = 600, color = C.text, align = 'left' } = {}) {
  ctx.save(); ctx.fillStyle = color; ctx.textAlign = align;
  do { ctx.font = `${weight} ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}

// A plot panel. The title sits in its own row above the plot; tick labels sit left of / below it.
// o: top, bottom, xMin, xMax, yMin, yMax, yTicks [values], yLabel(v), xTicks [values] | null, xLabel(v), title, left, right
function panel(ctx, W, o) {
  const P = { l: o.left || 46, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  ctx.strokeStyle = C.grid; ctx.strokeRect(P.l + 0.5, P.t + 0.5, P.r - P.l - 1, P.b - P.t - 1);
  for (const v of o.yTicks || []) {
    ctx.strokeStyle = v === 0 && o.yMin < 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(o.yLabel ? o.yLabel(v) : fmt(v), P.l - 6, y(v) + 4);
  }
  if (o.xTicks) {
    ctx.textAlign = 'center';
    for (const v of o.xTicks) {
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
      ctx.fillText(o.xLabel ? o.xLabel(v) : fmt(v), x(v), P.b + 15);
    }
  }
  ctx.restore();
  if (o.title) fitText(ctx, o.title, 8, o.titleY || P.t - 9, W - 16);
  return { x, y, P };
}
const range = (a, b, s) => { const out = []; for (let v = a; v <= b + 1e-9; v += s) out.push(Math.round(v * 1e6) / 1e6); return out; };
// Tick spacing that keeps labels at least minPx apart.
function ticks(a, b, px, minPx, steps) { for (const s of steps) if (s / (b - a) * px >= minPx) return range(Math.ceil(a / s) * s, b, s); return [a, b]; }
function clipTo(ctx, m) { ctx.beginPath(); ctx.rect(m.P.l, m.P.t, m.P.r - m.P.l, m.P.b - m.P.t); ctx.clip(); }
function curve(ctx, m, f, x0, x1, n, color, lw = 2, dash = null) {
  ctx.save(); clipTo(ctx, m); ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash);
  ctx.beginPath();
  for (let i = 0; i <= n; i++) { const v = x0 + (x1 - x0) * i / n, X = m.x(v), Y = m.y(f(v)); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); }
  ctx.stroke(); ctx.restore();
}
function vline(ctx, X, y0, y1, color, lw = 1.2, dash = [4, 4], alpha = 0.7) {
  ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y1); ctx.stroke(); ctx.restore();
}

/* ---------- shared one-shot animation runner (reduced motion → final frame; hidden page → final frame) ---------- */
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

const D = M.D2R, toDeg = r => r / D;
const idxAt = (run, p) => Math.min(run.t.length - 1, Math.round(p * (run.t.length - 1)));

// Cart-and-rod picture. The camera follows the cart; ground ticks every 0.5 m show it moving.
function scene(ctx, W, top, bottom, title, run, p, ppm, flag) {
  const m = panel(ctx, W, { top, bottom, xMin: 0, xMax: 1, yMin: 0, yMax: 1, title, left: 12 });
  const i = idxAt(run, p), x = run.x[i], th = run.th[i], gy = m.P.b - 12, cx = (m.P.l + m.P.r) / 2;
  const X = xw => cx + (xw - x) * ppm;
  ctx.save(); clipTo(ctx, m);
  ctx.strokeStyle = C.axis; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(m.P.l, gy); ctx.lineTo(m.P.r, gy); ctx.stroke();
  ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
  const span = (m.P.r - m.P.l) / ppm / 2 + 1;
  for (let g = Math.ceil((x - span) * 2) / 2; g <= x + span; g += 0.5) { ctx.beginPath(); ctx.moveTo(X(g), gy); ctx.lineTo(X(g), gy + 8); ctx.stroke(); }
  if (flag) { const fx = X(0); ctx.strokeStyle = C.cyan; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(fx, gy); ctx.lineTo(fx, gy - 34); ctx.stroke(); ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.moveTo(fx, gy - 34); ctx.lineTo(fx + 14, gy - 29); ctx.lineTo(fx, gy - 24); ctx.closePath(); ctx.fill(); }
  // cart body and wheels
  const cw = 46, ch = 16, wy = gy - 7;
  ctx.fillStyle = '#2d4157'; ctx.fillRect(cx - cw / 2, wy - ch - 2, cw, ch);
  ctx.fillStyle = C.muted; [-14, 14].forEach(dx => { ctx.beginPath(); ctx.arc(cx + dx, wy, 7, 0, 7); ctx.fill(); });
  // rod: pivot on the axle line, leaning right for positive θ
  const px = cx, py = wy - ch / 2 - 2, len = run.L * ppm, tx = px + len * Math.sin(th), ty = py - len * Math.cos(th);
  ctx.strokeStyle = run.fell && i === run.t.length - 1 ? C.red : C.orange; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(tx, ty); ctx.stroke();
  ctx.fillStyle = C.text; ctx.beginPath(); ctx.arc(tx, ty, 6, 0, 7); ctx.fill();
  ctx.strokeStyle = C.ghost; ctx.lineWidth = 1; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py - len); ctx.stroke(); ctx.setLineDash([]);
  ctx.restore();
}
const ppmFor = (top, bottom, Lmax) => Math.max(10, (bottom - top - 42) / Lmax);
// θ trace (degrees) drawn up to fraction p of the run.
function trace(ctx, m, run, p, color, lw = 2.2, key = 'th', scale = toDeg) {
  const n = idxAt(run, p), step = Math.max(1, Math.floor(run.t.length / 900));
  ctx.save(); clipTo(ctx, m); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.beginPath();
  for (let i = 0; i <= n; i += step) { const X = m.x(run.t[i]), Y = m.y(scale(run[key][i])); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); }
  ctx.lineTo(m.x(run.t[n]), m.y(scale(run[key][n]))); ctx.stroke(); ctx.restore();
}
function hline(ctx, m, v, color, dash = [6, 4]) { ctx.save(); clipTo(ctx, m); ctx.strokeStyle = color; ctx.setLineDash(dash); ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(m.P.l, m.y(v)); ctx.lineTo(m.P.r, m.y(v)); ctx.stroke(); ctx.restore(); }
const tTicks = (W, tMax) => ticks(0, tMax, W - 58, 30, [0.5, 1, 2, 5]);

// Per-step playback: the run is computed in full; "Let go" replays it in real time.
const play = {};
function replay(name, run, draw) { animate(name, run.t[run.t.length - 1] * 1000, p => { play[name] = p; draw(); }); }
const cur = name => (play[name] === undefined ? 1 : play[name]);
function settle(name) { stopAnim(name); play[name] = 1; }

/* ---------- step 0: no control ---------- */
const s0 = { ghosts: [], last: null };
const run0 = () => M.simulate({}, { L: num('L0'), th0: num('th0') * D, T: 20 });
function draw0() {
  const L = num('L0'), th0 = num('th0'), run = run0(); s0.cur = { L, th0, run };
  $('L0v').textContent = fmt(L, 2) + ' m'; $('th0v').textContent = fmt(th0, 1) + '°';
  const { ctx, W, H } = fitCanvas($('c0'));
  scene(ctx, W, 26, 170, t('c0a'), run, cur('s0'), ppmFor(26, 170, 2), false);
  const m = panel(ctx, W, { top: 214, bottom: H - 26, xMin: 0, xMax: 2.5, yMin: 0, yMax: 66, yTicks: [0, 20, 40, 60], xTicks: tTicks(W, 2.5), title: t('c0b') });
  hline(ctx, m, 60, C.red);
  s0.ghosts.forEach(g => trace(ctx, m, g.run, 1, C.raw, 1.6));
  trace(ctx, m, run, cur('s0'), C.orange);
  const tau = M.tau(L), g = s0.ghosts.find(q => q.th0 === th0 && q.L !== L);
  const cmp = g ? t('s0cmp', { Lp: fmt(g.L, 2), tp: fmt(g.run.tFall, 2), rL: fmt(L / g.L, 2), rt: fmt(run.tFall / g.run.tFall, 2), sq: fmt(Math.sqrt(L / g.L), 2) }) : '';
  $('r0').textContent = t('s0readout', { L: fmt(L, 2), tau: fmt(tau, 3), th: fmt(th0, 1), tf: fmt(run.tFall, 2), n: fmt(run.tFall / tau, 1), cmp });
}

/* ---------- step 1: P only ---------- */
const s1 = { ghosts: [] };
const run1 = () => M.simulate({ Kp: num('kp1') * M.G }, { L: M.L0, th0: 5 * D, T: 4 });
function draw1() {
  const k = num('kp1'), run = run1(); s1.cur = { k, run };
  $('kp1v').textContent = fmt(k, 1) + ' g';
  const { ctx, W, H } = fitCanvas($('c1'));
  scene(ctx, W, 26, 150, t('c0a'), run, cur('s1'), ppmFor(26, 150, 0.6), false);
  const m = panel(ctx, W, { top: 196, bottom: H - 26, xMin: 0, xMax: 4, yMin: -66, yMax: 66, yTicks: [-60, -30, 0, 30, 60], xTicks: tTicks(W, 4), title: t('c1b') });
  hline(ctx, m, 60, C.red); hline(ctx, m, -60, C.red);
  s1.ghosts.forEach(g => trace(ctx, m, g.run, 1, C.raw, 1.6));
  trace(ctx, m, run, cur('s1'), C.orange);
  let state;
  if (run.fell) state = t('s1fell', { tf: fmt(run.tFall, 2), tf0: fmt(M.fallTime(M.L0, 5 * D), 2) });
  else { const w = M.pOmega(k * M.G, M.L0), per = M.swingPeriod(run); state = t('s1swing', { amp: fmt(toDeg(M.maxAbs(run.th)), 2), per: per ? fmt(per, 3) : '—', perF: fmt(2 * Math.PI / w, 3) }); }
  $('r1').textContent = t('s1readout', { k: fmt(k, 1), kp: fmt(k * M.G, 2), state });
}

/* ---------- step 2: PD and its poles ---------- */
const s2 = { ghosts: [], trail: new Set([0]) };
const KP2 = 2 * M.G;
const run2 = () => M.simulate({ Kp: KP2, Kd: num('kd2') }, { L: M.L0, th0: 5 * D, T: 6 });
const fmtPoles = ps => (Math.abs(ps[0].im) > 1e-9 ? `${fmt(ps[0].re, 2)} ± ${fmt(Math.abs(ps[0].im), 2)}i` : `${fmt(ps[0].re, 2)}, ${fmt(ps[1].re, 2)}`);
function draw2() {
  const kd = num('kd2'), run = run2(); s2.trail.add(kd); s2.cur = { kd, run };
  $('kd2v').textContent = fmt(kd, 1);
  let { ctx, W, H } = fitCanvas($('c2'));
  scene(ctx, W, 26, 140, t('c0a'), run, cur('s2'), ppmFor(26, 140, 0.6), false);
  const m = panel(ctx, W, { top: 186, bottom: H - 26, xMin: 0, xMax: 6, yMin: -6, yMax: 6, yTicks: [-5, 0, 5], xTicks: tTicks(W, 6), title: t('c2a') });
  hline(ctx, m, 0.1, C.ghost, [2, 4]); hline(ctx, m, -0.1, C.ghost, [2, 4]);
  s2.ghosts.forEach(g => trace(ctx, m, g.run, 1, C.raw, 1.5));
  trace(ctx, m, run, cur('s2'), C.orange);
  ({ ctx, W, H } = fitCanvas($('c2b')));
  const B = panel(ctx, W, { top: 26, bottom: H - 26, xMin: -16, xMax: 1.5, yMin: -5.5, yMax: 5.5, yTicks: [-4, 0, 4], xTicks: [-15, -10, -5, 0], xLabel: v => fmt(v, 0), title: t('c2b'), left: 34 });
  ctx.save(); clipTo(ctx, B); ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(B.x(0), B.P.t); ctx.lineTo(B.x(0), B.P.b); ctx.stroke();
  s2.trail.forEach(q => { if (q === kd) return; M.pdPoles(KP2, q, M.L0).forEach(pp => { ctx.fillStyle = C.text; ctx.beginPath(); ctx.arc(B.x(pp.re), B.y(pp.im), 2.8, 0, 7); ctx.fill(); }); });
  const ps = M.pdPoles(KP2, kd, M.L0);
  ps.forEach(pp => { ctx.strokeStyle = C.orange; ctx.lineWidth = 2.5; const X = B.x(pp.re), Y = B.y(pp.im); ctx.beginPath(); ctx.moveTo(X - 6, Y - 6); ctx.lineTo(X + 6, Y + 6); ctx.moveTo(X - 6, Y + 6); ctx.lineTo(X + 6, Y - 6); ctx.stroke(); });
  ctx.restore();
  const sh = M.pdShape(KP2, kd, M.L0), ts = M.settleTime(run, 5 * D);
  $('r2').textContent = t('s2readout', { kd: fmt(kd, 1), z: fmt(sh.zeta, 2), poles: fmtPoles(ps), settle: ts === null ? t('s2never') : t('s2settle', { ts: fmt(ts, 2) }) });
}

/* ---------- step 3: delay ---------- */
const s3 = { dots: new Map() }; let CRIT = null;
const run3 = () => M.simulate({ Kp: M.KP3, Kd: M.KD3 }, { L: M.L0, th0: M.TH3, T: 10, delay: num('d3') / 1000 });
function draw3() {
  const d = num('d3'), run = run3(), pk = toDeg(M.tailPeak(run, 2));
  if (CRIT === null) CRIT = M.criticalDelay();
  s3.dots.set(d, pk);
  $('d3v').textContent = d + ' ms';
  let { ctx, W, H } = fitCanvas($('c3'));
  scene(ctx, W, 26, 140, t('c0a'), run, cur('s3'), ppmFor(26, 140, 0.6), false);
  const m = panel(ctx, W, { top: 186, bottom: H - 26, xMin: 0, xMax: 10, yMin: -20, yMax: 20, yTicks: [-20, -10, 0, 10, 20], xTicks: tTicks(W, 10), title: t('c3a') });
  trace(ctx, m, run, cur('s3'), C.orange);
  ({ ctx, W, H } = fitCanvas($('c3b')));
  const B = panel(ctx, W, { top: 26, bottom: H - 26, xMin: -5, xMax: 205, yMin: 0, yMax: 64, yTicks: [0, 20, 40, 60], xTicks: [0, 50, 100, 150, 200], xLabel: v => String(v), title: t('c3b') });
  vline(ctx, B.x(CRIT * 1000), B.P.t, B.P.b, C.red, 1.4, [6, 4], 0.9);
  ctx.save(); clipTo(ctx, B);
  s3.dots.forEach((v, q) => { ctx.fillStyle = q === d ? C.orange : C.text; ctx.beginPath(); ctx.arc(B.x(q), B.y(v), q === d ? 6 : 3.5, 0, 7); ctx.fill(); });
  ctx.restore();
  const state = run.fell ? t('s3fell', { tf: fmt(run.tFall, 2) }) : M.stable3(d / 1000) ? t('s3ok', { pk: fmt(pk, 2) }) : t('s3bad', { pk: fmt(pk, 2) });
  $('r3').textContent = t('s3readout', { d, state, crit: fmt(CRIT * 1000, 0) });
}

/* ---------- step 4: hold the cart's position too ---------- */
const s4 = { loop: false, sc: 1 };
function run4() {
  const ctrl = s4.loop ? M.placeGains(num('p4'), M.L0) : M.PD4;
  return { ctrl, run: M.simulate(ctrl, s4.sc === 1 ? { L: M.L0, th0: 5 * D, T: 8 } : { L: M.L0, x0: 0.5, T: 8 }) };
}
function niceRange(lo, hi, minSpan) { const span = Math.max(minSpan, hi - lo); const step = span > 2 ? 1 : span > 1 ? 0.5 : span > 0.4 ? 0.2 : 0.1; return { lo: Math.floor(lo / step) * step - step / 2, hi: Math.ceil(hi / step) * step + step / 2, step }; }
function draw4() {
  const p = num('p4'), { ctrl, run } = run4();
  $('p4v').textContent = fmt(p, 1);
  $('loop4').textContent = t(s4.loop ? 'loopOn' : 'loopOff'); $('loop4').setAttribute('aria-pressed', s4.loop ? 'true' : 'false');
  $('sc1').setAttribute('aria-pressed', s4.sc === 1 ? 'true' : 'false'); $('sc2').setAttribute('aria-pressed', s4.sc === 2 ? 'true' : 'false');
  const { ctx, W, H } = fitCanvas($('c4'));
  scene(ctx, W, 26, 150, t('c4a'), run, cur('s4'), ppmFor(26, 150, 0.6), true);
  const thMax = Math.max(5, Math.ceil(toDeg(M.maxAbs(run.th)) / 5) * 5);
  const A = panel(ctx, W, { top: 196, bottom: 300, xMin: 0, xMax: 8, yMin: -thMax * 1.15, yMax: thMax * 1.15, yTicks: [-thMax, 0, thMax], xTicks: tTicks(W, 8), title: t('c4b') });
  trace(ctx, A, run, cur('s4'), C.orange);
  const xr = niceRange(Math.min(0, ...run.x), Math.max(0, ...run.x), 0.6);
  const yt = range(Math.ceil(xr.lo / xr.step) * xr.step, xr.hi, xr.step);
  const B = panel(ctx, W, { top: 346, bottom: H - 26, xMin: 0, xMax: 8, yMin: xr.lo, yMax: xr.hi, yTicks: yt.length > 5 ? yt.filter((_, i) => i % 2 === 0) : yt, xTicks: tTicks(W, 8), title: t('c4c') });
  hline(ctx, B, 0, C.axis, [2, 3]);
  trace(ctx, B, run, cur('s4'), C.cyan, 2.2, 'x', v => v);
  const xEnd = run.x[run.x.length - 1];
  let text;
  if (!s4.loop) text = s4.sc === 1 ? t('s4pd1', { ts: fmt(M.settleTime(run, 5 * D) || 0, 2), x: fmt(xEnd, 2), v: fmt(run.vEnd, 2) }) : t('s4pd2');
  else {
    const xm = Math.max(...run.x);
    const extra = s4.sc === 2 ? t('s4wrong', { xm: fmt(xm, 3), dx: fmt((xm - 0.5) * 100, 1), th: fmt(toDeg(M.maxAbs(run.th)), 2) }) : t('s4back', { xm: fmt(xm, 3) });
    text = t('s4loop', { p: fmt(p, 1), kp: fmt(ctrl.Kp, 1), kd: fmt(ctrl.Kd, 2), kx: fmt(ctrl.Kx, 2), kv: fmt(ctrl.Kv, 2), x: fmt(xEnd, 3), extra });
  }
  $('r4').textContent = text;
}

/* ---------- step 5: motor limit ---------- */
const s5 = { dots: new Map(), meas: null };
const run5 = () => M.simulate(M.PD4, { L: M.L0, om0: num('w5') * D, umax: num('a5'), T: M.T5 });
function measured() { if (!s5.meas) { s5.meas = []; for (let a = 2; a <= 20; a += 2) s5.meas.push([a, toDeg(M.maxPush(M.PD4, a, M.L0, 14))]); } return s5.meas; }
function draw5() {
  const a = num('a5'), w = num('w5'), run = run5(), saved = M.recovers(M.PD4, w * D, a);
  s5.dots.set(a + ',' + w, { a, w, saved });
  $('a5v').textContent = a + ' m/s²'; $('w5v').textContent = w + '°/s';
  let { ctx, W, H } = fitCanvas($('c5'));
  scene(ctx, W, 26, 140, t('c0a'), run, cur('s5'), ppmFor(26, 140, 0.6), false);
  const m = panel(ctx, W, { top: 186, bottom: H - 26, xMin: 0, xMax: 8, yMin: -66, yMax: 66, yTicks: [-60, -30, 0, 30, 60], xTicks: tTicks(W, 8), title: t('c5a') });
  hline(ctx, m, 60, C.red); hline(ctx, m, -60, C.red);
  trace(ctx, m, run, cur('s5'), C.orange);
  ({ ctx, W, H } = fitCanvas($('c5b')));
  const B = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 1, xMax: 21, yMin: 0, yMax: 540, yTicks: [0, 100, 200, 300, 400, 500], xTicks: [5, 10, 15, 20], xLabel: v => String(v), title: t('c5b') });
  curve(ctx, B, aa => toDeg(M.pushBound(aa)), 1, 21, 60, C.ghost, 1.6, [6, 4]);
  ctx.save(); clipTo(ctx, B); ctx.strokeStyle = C.text; ctx.lineWidth = 1.8; ctx.beginPath(); measured().forEach(([aa, ww], i) => { if (i) ctx.lineTo(B.x(aa), B.y(ww)); else ctx.moveTo(B.x(aa), B.y(ww)); }); ctx.stroke();
  s5.dots.forEach(q => { const now = q.a === a && q.w === w; ctx.fillStyle = q.saved ? C.green : C.red; ctx.beginPath(); ctx.arc(B.x(q.a), B.y(q.w), now ? 6 : 3.5, 0, 7); ctx.fill(); if (now) { ctx.strokeStyle = C.text; ctx.lineWidth = 1.5; ctx.stroke(); } });
  ctx.restore();
  const state = saved ? t('s5ok', { pk: fmt(toDeg(M.maxAbs(run.th)), 1), sat: fmt(run.sat / (run.t.length - 1) * 100, 0) }) : run.fell ? t('s5fell', { tf: fmt(run.tFall, 2) }) : t('s5fell', { tf: '—' });
  $('r5').textContent = t('s5readout', { a, w, state, wb: fmt(toDeg(M.pushBound(a)), 0), wm: fmt(toDeg(M.maxPush(M.PD4, a, M.L0, 14)), 0) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  // sliders: dragging shows the finished run at once; letting go files the previous run as a grey ghost
  const ghost = (st, keyOf) => { if (st.cur) { st.ghosts = [st.cur, ...st.ghosts.filter(g => keyOf(g) !== keyOf(st.cur))].slice(0, 4); } };
  ['L0', 'th0'].forEach(id => {
    $(id).addEventListener('pointerdown', () => ghost(s0, g => g.L + '|' + g.th0));
    $(id).addEventListener('keydown', () => ghost(s0, g => g.L + '|' + g.th0));
    $(id).addEventListener('input', () => { settle('s0'); draw0(); });
  });
  $('kp1').addEventListener('pointerdown', () => ghost(s1, g => g.k)); $('kp1').addEventListener('keydown', () => ghost(s1, g => g.k));
  $('kp1').addEventListener('input', () => { settle('s1'); draw1(); });
  $('kd2').addEventListener('pointerdown', () => ghost(s2, g => g.kd)); $('kd2').addEventListener('keydown', () => ghost(s2, g => g.kd));
  $('kd2').addEventListener('input', () => { settle('s2'); draw2(); });
  $('d3').addEventListener('input', () => { settle('s3'); draw3(); });
  $('clear3').addEventListener('click', () => { s3.dots.clear(); draw3(); });
  $('loop4').addEventListener('click', () => { settle('s4'); s4.loop = !s4.loop; draw4(); });
  $('sc1').addEventListener('click', () => { settle('s4'); s4.sc = 1; draw4(); });
  $('sc2').addEventListener('click', () => { settle('s4'); s4.sc = 2; draw4(); });
  $('p4').addEventListener('input', () => { settle('s4'); draw4(); });
  ['a5', 'w5'].forEach(id => $(id).addEventListener('input', () => { settle('s5'); draw5(); }));
  $('clear5').addEventListener('click', () => { s5.dots.clear(); draw5(); });
  $('play0').addEventListener('click', () => replay('s0', run0(), draw0));
  $('play1').addEventListener('click', () => replay('s1', run1(), draw1));
  $('play2').addEventListener('click', () => replay('s2', run2(), draw2));
  $('play3').addEventListener('click', () => replay('s3', run3(), draw3));
  $('play4').addEventListener('click', () => replay('s4', run4().run, draw4));
  $('play5').addEventListener('click', () => replay('s5', run5(), draw5));

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
  window.refreshLesson = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
