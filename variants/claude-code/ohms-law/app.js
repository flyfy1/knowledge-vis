'use strict';
// Ohm's law lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every meter value, curve and readout comes from window.OHM_MODEL (model.js). Canvas text is limited to
// panel titles, axis ticks, component values and meter readings, each in a fixed slot; prose lives in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.OHM_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', ghost: '#8696aa', wire: '#7f91a8', flow: '#ffd27a', comp: '#c9d5e3' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros only after a decimal point (so 90 stays 90); show −0 as 0.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; };
const signed = (v, d = 1) => { const s = Math.abs(v).toFixed(d); return Number(s) === 0 ? s : (v > 0 ? '+' : '−') + s; }; // no “−0.0”

/* ---------- drawing kit ---------- */
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
// Panel title: shrinks the font until it fits (never overflows, never squeezes glyphs).
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 7);
  ctx.fillText(text, X, Y); ctx.restore();
}
function niceStep(span, px, minPx, steps) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }
// Ticks 0, s, 2s, … up to max with about four intervals.
function ticksTo(max) {
  const raw = max / 4, p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p;
  const s = (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * p, out = [];
  for (let v = 0; v <= max + 1e-9; v += s) out.push(Math.round(v * 1e6) / 1e6);
  return out;
}
// A plot panel: title in its own row above, y tick labels to the left, x tick labels below.
function panel(ctx, W, o) {
  const P = { l: o.left == null ? 40 : o.left, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks || []) {
    ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(fmt(v, 2), P.l - 6, y(v) + 4);
  }
  if (o.xTicks) {
    ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.b); ctx.lineTo(P.r, P.b); ctx.stroke();
    const step = niceStep(o.xMax - o.xMin, P.r - P.l, o.minPx || 32, o.xSteps || [1, 2, 5, 10, 20]);
    const first = Math.ceil((o.xMin - 1e-9) / step) * step;
    ctx.textAlign = 'center';
    for (let v = first; v <= o.xMax + 1e-9; v += step) {
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
      ctx.fillText(fmt(v, 2), x(v), P.b + 15);
    }
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 10, W - 16);
  return { x, y, P };
}
function dot(ctx, X, Y, r, color) { ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); ctx.restore(); }
function curve(ctx, m, f, a, b, color, { lw = 2, dash = null, steps = 200, yClip = null, alpha = 1 } = {}) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = alpha; if (dash) ctx.setLineDash(dash); ctx.beginPath();
  let pen = false;
  for (let i = 0; i <= steps; i++) {
    const v = a + (b - a) * i / steps, w = f(v);
    if (!isFinite(w) || (yClip && (w > yClip[1] || w < yClip[0]))) { pen = false; continue; }
    if (!pen) { ctx.moveTo(m.x(v), m.y(w)); pen = true; } else ctx.lineTo(m.x(v), m.y(w));
  }
  ctx.stroke(); ctx.restore();
}
function vline(ctx, m, v, color) { ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = 0.55; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(m.x(v), m.P.t); ctx.lineTo(m.x(v), m.P.b); ctx.stroke(); ctx.restore(); }
function label(ctx, text, X, Y, align = 'center', color = C.text, size = 11) {
  ctx.save(); ctx.font = `${size}px system-ui,sans-serif`; ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(text, X, Y); ctx.restore();
}

/* ---------- circuit kit ---------- */
// Loop geometry shared by every circuit panel: title row, a row for the voltmeter, then the loop.
function loop(W, H) { return { x0: 34, x1: W - 34, y0: 84, y1: H - 24, yv: 48 }; }
function wire(ctx, pts) { ctx.save(); ctx.strokeStyle = C.wire; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.restore(); }
// Dots spaced evenly along a polyline, moving at a speed proportional to the current (schematic, not drift speed).
const SPACING = 22, PX_PER_A = 60;
function flow(ctx, pts, I, Iref, clock) {
  const seg = []; let L = 0;
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); L += d; }
  if (L <= 0) return;
  const off = ((clock * PX_PER_A * I / Iref) % SPACING + SPACING) % SPACING;
  ctx.save(); ctx.fillStyle = C.flow; ctx.globalAlpha = I > 0 ? 0.95 : 0.25;
  for (let s = off; s < L; s += SPACING) {
    let r = s, i = 0; while (i < seg.length - 1 && r > seg[i]) { r -= seg[i]; i++; }
    const f = seg[i] ? r / seg[i] : 0, X = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, Y = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f;
    ctx.beginPath(); ctx.arc(X, Y, 2.8, 0, 7); ctx.fill();
  }
  ctx.restore();
}
// Battery on a vertical wire, positive plate on top; n cells (n = 0 draws a gap-free wire).
function battery(ctx, X, Yc, n) {
  if (n <= 0) return;
  const gap = 7, h = n * gap * 2 - gap, top = Yc - h / 2;
  ctx.save(); ctx.fillStyle = C.bg; ctx.fillRect(X - 14, top - 3, 28, h + 6);
  for (let k = 0; k < n; k++) {
    const y = top + k * gap * 2;
    ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X - 12, y); ctx.lineTo(X + 12, y); ctx.stroke();
    ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(X - 6, y + gap); ctx.lineTo(X + 6, y + gap); ctx.stroke();
  }
  ctx.restore();
  label(ctx, '+', X - 18, top + 4, 'center', C.muted);
}
// Resistor box (horizontal or vertical) with an optional glow 0..1.
function resistor(ctx, X, Y, vertical = false, glow = 0) {
  const w = vertical ? 14 : 44, h = vertical ? 44 : 14;
  ctx.save();
  if (glow > 0) { ctx.shadowColor = `rgba(255,150,60,${Math.min(1, glow)})`; ctx.shadowBlur = 6 + 22 * glow; }
  ctx.fillStyle = glow > 0 ? heatColor(glow) : C.bg; ctx.fillRect(X - w / 2, Y - h / 2, w, h);
  ctx.shadowBlur = 0; ctx.strokeStyle = C.comp; ctx.lineWidth = 2; ctx.strokeRect(X - w / 2, Y - h / 2, w, h);
  ctx.restore();
}
function heatColor(g) { // dark grey → orange → pale yellow
  const a = [58, 63, 72], b = [255, 154, 60], c = [255, 231, 163], k = Math.max(0, Math.min(1, g));
  const mix = (p, q, f) => p.map((v, i) => Math.round(v + (q[i] - v) * f));
  const rgb = k < 0.6 ? mix(a, b, k / 0.6) : mix(b, c, (k - 0.6) / 0.4);
  return `rgb(${rgb.join(',')})`;
}
function meter(ctx, X, Y, letter) {
  ctx.save(); ctx.fillStyle = C.bg; ctx.strokeStyle = C.cyan; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X, Y, 13, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.font = '600 13px system-ui,sans-serif'; ctx.fillStyle = C.cyan; ctx.textAlign = 'center'; ctx.fillText(letter, X, Y + 5); ctx.restore();
}
function bulbIcon(ctx, X, Y, glow) {
  ctx.save();
  if (glow > 0) { const g = ctx.createRadialGradient(X, Y, 2, X, Y, 14 + 26 * glow); g.addColorStop(0, `rgba(255,236,170,${0.9 * glow})`); g.addColorStop(1, 'rgba(255,200,90,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(X, Y, 14 + 26 * glow, 0, 7); ctx.fill(); }
  ctx.fillStyle = C.bg; ctx.strokeStyle = C.comp; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X, Y, 12, 0, 7); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = glow > 0.05 ? '#ffe7a3' : C.comp; ctx.beginPath(); ctx.moveTo(X - 8.5, Y - 8.5); ctx.lineTo(X + 8.5, Y + 8.5); ctx.moveTo(X + 8.5, Y - 8.5); ctx.lineTo(X - 8.5, Y + 8.5); ctx.stroke();
  ctx.restore();
}
// One loop: source on the left, the component on top (with a voltmeter across it), ammeter on the right.
// o: { n (cells, for the symbol), srcLabel, comp: 'resistor'|'bulb'|'mystery', compLabel, glow, I, Iref, Uread, Iread }
function singleLoop(canvas, ttl, o) {
  const { ctx, W, H } = fitCanvas(canvas), G = loop(W, H), xc = (G.x0 + G.x1) / 2, ym = (G.y0 + G.y1) / 2;
  title(ctx, ttl, 8, 17, W - 16);
  const path = [[G.x0, G.y1], [G.x0, G.y0], [G.x1, G.y0], [G.x1, G.y1], [G.x0, G.y1]];
  wire(ctx, path);
  // voltmeter branch across the component (no current: ideal meter)
  const a = xc - 30, b = xc + 30;
  wire(ctx, [[a, G.y0], [a, G.yv], [xc - 13, G.yv]]); wire(ctx, [[b, G.y0], [b, G.yv], [xc + 13, G.yv]]);
  flow(ctx, path, o.I, o.Iref, flowClock);
  battery(ctx, G.x0, ym, o.n);
  if (o.comp === 'bulb') bulbIcon(ctx, xc, G.y0, o.glow);
  else if (o.comp === 'mystery') { ctx.save(); ctx.fillStyle = '#26303d'; ctx.fillRect(xc - 24, G.y0 - 11, 48, 22); ctx.strokeStyle = C.comp; ctx.lineWidth = 2; ctx.strokeRect(xc - 24, G.y0 - 11, 48, 22); ctx.restore(); label(ctx, 'Rₓ ?', xc, G.y0 + 4, 'center', C.text, 12); }
  else resistor(ctx, xc, G.y0, false, o.glow || 0);
  meter(ctx, xc, G.yv, 'V'); meter(ctx, G.x1, ym, 'A');
  if (o.compLabel) label(ctx, o.compLabel, xc, G.y0 + 34, 'center', C.text, 12);
  if (o.srcLabel) label(ctx, o.srcLabel, G.x0 + 18, ym + 4, 'left', C.text, 12);
  label(ctx, o.Uread, xc + 38, G.yv + 4, 'left', C.cyan, 12);
  label(ctx, o.Iread, G.x1 - 20, ym + 4, 'right', C.cyan, 12);
}

/* ---------- flow clock: one animation loop for every visible circuit ---------- */
let flowClock = 0, lastNow = null, rafId = null;
const circuits = {}, onScreen = new Set();
function tick(now) {
  rafId = null;
  if (document.hidden || reduceMotion() || !onScreen.size) { lastNow = null; return; }
  if (lastNow !== null) flowClock += Math.min(0.1, (now - lastNow) / 1000);
  lastNow = now;
  onScreen.forEach(id => circuits[id]());
  rafId = requestAnimationFrame(tick);
}
function kick() { if (rafId === null && onScreen.size && !document.hidden && !reduceMotion()) rafId = requestAnimationFrame(tick); }
function halt() { if (rafId !== null) cancelAnimationFrame(rafId); rafId = null; lastNow = null; }

/* ---------- step-level animations (sweep) ---------- */
const anims = {};
function animate(name, ms, frame, done) {
  stopAnim(name);
  if (reduceMotion()) { frame(1); if (done) done(); return; }
  const start = performance.now();
  const step = now => {
    const p = Math.min(1, (now - start) / ms);
    frame(p);
    if (p < 1) anims[name] = { id: requestAnimationFrame(step), frame, done };
    else { delete anims[name]; if (done) done(); }
  };
  anims[name] = { id: requestAnimationFrame(step), frame, done };
}
function stopAnim(name) { if (anims[name]) { cancelAnimationFrame(anims[name].id); delete anims[name]; } }
function finishAll() { Object.keys(anims).forEach(k => { const a = anims[k]; cancelAnimationFrame(a.id); delete anims[k]; a.frame(1); if (a.done) a.done(); }); }

/* ---------- step 0: add cells ---------- */
const s0 = { tried: new Set([2]) };
circuits.c0 = () => {
  const r = M.cells(num('n0'));
  singleLoop($('c0'), t('c0a'), { n: r.n, srcLabel: fmt(r.U, 1) + ' V', comp: 'resistor', compLabel: '10 Ω', I: r.I, Iref: 0.6, Uread: r.U.toFixed(1) + ' V', Iread: r.I.toFixed(2) + ' A' });
};
function draw0() {
  const n = num('n0'), r = M.cells(n);
  $('n0v').textContent = String(n);
  circuits.c0();
  const { ctx, W, H } = fitCanvas($('c0b'));
  const B = panel(ctx, W, { top: 30, bottom: H - 26, xMin: 0, xMax: 9.6, yMin: 0, yMax: 1, yTicks: [0, 0.2, 0.4, 0.6, 0.8, 1], xTicks: true, xSteps: [1.5, 3], title: t('c0b') });
  const tried = [...s0.tried];
  if (tried.filter(k => k > 0).length >= 2) curve(ctx, B, u => u / M.R0, 0, 9.6, C.ghost, { dash: [6, 4], lw: 1.5, steps: 2 });
  tried.forEach(k => { if (k !== n) { const q = M.cells(k); dot(ctx, B.x(q.U), B.y(q.I), 3.8, C.text); } });
  dot(ctx, B.x(r.U), B.y(r.I), 6, C.cyan);
  $('r0').textContent = n === 0 ? t('s0readoutZero') : t('s0readout', { n, U: fmt(r.U, 1), I: fmt(r.I, 2), ratio: fmt(r.ratio, 2) });
}

/* ---------- step 1: U and R ---------- */
const s1 = { tried: new Set([10]) };
circuits.c1 = () => {
  const U = num('u1'), R = num('r1s'), r = M.ohm(U, R);
  singleLoop($('c1'), t('c1a'), { n: Math.round(U / M.CELL), srcLabel: fmt(U, 1) + ' V', comp: 'resistor', compLabel: R + ' Ω', I: r.I, Iref: 0.6, Uread: U.toFixed(1) + ' V', Iread: r.I.toFixed(2) + ' A' });
};
function draw1() {
  const U = num('u1'), R = num('r1s'), r = M.ohm(U, R);
  $('u1v').textContent = fmt(U, 1); $('r1v').textContent = String(R);
  circuits.c1();
  const { ctx, W, H } = fitCanvas($('c1b'));
  const yMax = U / 2 * 1.08, yT = ticksTo(U / 2);
  const B = panel(ctx, W, { top: 30, bottom: H - 26, xMin: 0, xMax: 31, yMin: 0, yMax, yTicks: yT, xTicks: true, xSteps: [5, 10], title: t('c1b') });
  curve(ctx, B, v => U / v, 1.8, 31, C.orange, { yClip: [0, yMax], steps: 300 });
  [...s1.tried].forEach(k => { if (k !== R) dot(ctx, B.x(k), B.y(U / k), 3.8, C.text); });
  dot(ctx, B.x(R), B.y(r.I), 6, C.cyan);
  $('r1').textContent = t('s1readout', { U: fmt(U, 1), R, I: fmt(r.I, 3), IR: fmt(r.IR, 2), R2: 2 * R, I2: fmt(U / (2 * R), 3) });
}

/* ---------- step 2: length and cross-section ---------- */
const s2 = { triedS: new Set(['0.5']), triedL: new Set(['1']) };
function draw2() {
  const L = num('L2'), S = num('S2'), R = M.wire(L, S), Rcu = M.wire(L, S, 'copper');
  $('L2v').textContent = fmt(L, 1); $('S2v').textContent = fmt(S, 1);
  let { ctx, W, H } = fitCanvas($('c2'));
  const A = panel(ctx, W, { top: 30, bottom: H - 26, xMin: -0.12, xMax: 2.2, yMin: 0, yMax: 1, xTicks: true, xSteps: [0.25, 0.5, 1], left: 18, right: 22, title: t('c2a') });
  const yc = (A.P.t + A.P.b) / 2, th = 3 + 16 * Math.sqrt(S);
  ctx.save();
  // clips at both ends
  ctx.fillStyle = C.ghost; ctx.fillRect(A.x(0) - 6, yc - 16, 6, 32); ctx.fillRect(A.x(L), yc - 16, 6, 32);
  const g = ctx.createLinearGradient(0, yc - th / 2, 0, yc + th / 2); g.addColorStop(0, '#c9d1db'); g.addColorStop(0.5, '#8e99a8'); g.addColorStop(1, '#5d6776');
  ctx.fillStyle = g; ctx.fillRect(A.x(0), yc - th / 2, A.x(L) - A.x(0), th);
  // the cut face: a disc whose area follows S
  ctx.fillStyle = '#b7c0cc'; ctx.strokeStyle = C.orange; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(A.x(L) + 3, yc, th / 4, th / 2, 0, 0, 7); ctx.fill(); ctx.stroke();
  ctx.restore();

  ({ ctx, W, H } = fitCanvas($('c2b')));
  const B = panel(ctx, W, { top: 30, bottom: H - 26, xMin: 0, xMax: 2.1, yMin: 0, yMax: 10.5, yTicks: [0, 2, 4, 6, 8, 10], xTicks: true, xSteps: [0.25, 0.5, 1], title: t('c2b') });
  [...s2.triedS].map(Number).forEach(s => { if (s !== S) curve(ctx, B, v => M.wire(v, s), 0, 2.1, C.ghost, { dash: [5, 4], lw: 1.2, steps: 2, yClip: [0, 10.5], alpha: 0.8 }); });
  curve(ctx, B, v => M.wire(v, S), 0, 2.1, C.orange, { steps: 300, yClip: [0, 10.5] });
  dot(ctx, B.x(L), B.y(R), 6, C.cyan);

  ({ ctx, W, H } = fitCanvas($('c2c')));
  const D = panel(ctx, W, { top: 30, bottom: H - 26, xMin: 0, xMax: 1.05, yMin: 0, yMax: 10.5, yTicks: [0, 2, 4, 6, 8, 10], xTicks: true, xSteps: [0.1, 0.2, 0.25, 0.5], title: t('c2c') });
  [...s2.triedL].map(Number).forEach(l => { if (l !== L) curve(ctx, D, v => M.wire(l, v), 0.05, 1.05, C.ghost, { dash: [5, 4], lw: 1.2, steps: 300, yClip: [0, 10.5], alpha: 0.8 }); });
  curve(ctx, D, v => M.wire(L, v), 0.05, 1.05, C.orange, { steps: 300, yClip: [0, 10.5] });
  dot(ctx, D.x(S), D.y(R), 6, C.cyan);
  $('r2').textContent = t('s2readout', { L: fmt(L, 1), S: fmt(S, 1), R: fmt(R, 2), Rcu: fmt(Rcu, 4), ratio: (M.WIRE.nichrome / M.WIRE.copper).toFixed(0) });
}

/* ---------- step 3: voltmeter–ammeter method ---------- */
const MAXREC = 12;
const s3 = { idx: 0, pts: [], revealed: false };
circuits.c3 = () => {
  const rd = M.reading(num('u3'), M.MYSTERY[s3.idx]);
  singleLoop($('c3'), t('c3a'), { n: 2, srcLabel: '', comp: 'mystery', I: rd.Itrue, Iref: 0.15, Uread: rd.U.toFixed(1) + ' V', Iread: rd.I.toFixed(2) + ' A' });
};
function draw3() {
  const U = num('u3'), Rt = M.MYSTERY[s3.idx], rd = M.reading(U, Rt);
  $('u3v').textContent = U.toFixed(2);
  circuits.c3();
  const { ctx, W, H } = fitCanvas($('c3b'));
  const B = panel(ctx, W, { top: 30, bottom: H - 26, xMin: 0, xMax: 3.15, yMin: 0, yMax: 0.63, yTicks: [0, 0.2, 0.4, 0.6], xTicks: true, xSteps: [0.5, 1], title: t('c3b') });
  if (s3.revealed) curve(ctx, B, v => v / Rt, 0, 3.15, C.ghost, { dash: [6, 4], lw: 1.5, steps: 2 });
  const Rfit = s3.pts.length ? M.fitR(s3.pts) : NaN;
  if (isFinite(Rfit)) curve(ctx, B, v => v / Rfit, 0, 3.15, C.orange, { steps: 2, yClip: [0, 0.63] });
  s3.pts.forEach(p => dot(ctx, B.x(p.U), B.y(p.I), 3.8, C.text));
  dot(ctx, B.x(rd.U), B.y(rd.I), 6, C.cyan);
  $('rec3').disabled = s3.pts.length >= MAXREC;
  $('reveal3').disabled = s3.revealed;
  const Rone = rd.I > 0 ? rd.U / rd.I : NaN;
  let txt = t('s3readout', { U: rd.U.toFixed(1), du: Math.round(rd.U / M.METER.dU), I: rd.I.toFixed(2), di: Math.round(rd.I / M.METER.dI), Rone: isFinite(Rone) ? fmt(Rone, 2) : '—' });
  txt += ' ' + (s3.pts.length ? t('s3fit', { n: s3.pts.length, Rfit: fmt(Rfit, 2) }) : t('s3fitNone'));
  if (s3.pts.length >= MAXREC) txt += t('s3full', { max: MAXREC });
  if (s3.revealed) {
    const e1 = signed(M.relErr(Rone, Rt) * 100), ef = isFinite(Rfit) ? signed(M.relErr(Rfit, Rt) * 100) : null;
    txt += ' ' + (ef === null ? t('s3trueNoFit', { Rt, e1 }) : t('s3true', { Rt, e1, ef }));
  } else txt += ' ' + t('s3hidden');
  $('r3').textContent = txt;
}

/* ---------- step 4: a small bulb ---------- */
const U4 = { max: 3, d: 0.05 };
const s4 = { visited: new Uint8Array(Math.round(U4.max / U4.d) + 1), last: null };
const uIdx = v => Math.round(v / U4.d);
function markU(v) { const i = uIdx(v), j = s4.last === null ? i : s4.last; for (let q = Math.min(i, j); q <= Math.max(i, j); q++) s4.visited[q] = 1; s4.last = i; }
circuits.c4 = () => {
  const U = num('u4'), b = M.bulb(U);
  singleLoop($('c4'), t('c4a'), { n: 2, srcLabel: fmt(U, 2) + ' V', comp: 'bulb', glow: Math.min(1, b.P / 0.93), I: b.I, Iref: 0.1, Uread: U.toFixed(2) + ' V', Iread: b.I.toFixed(3) + ' A' });
};
function trace(ctx, m, f) {
  ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 2.4; ctx.beginPath(); let pen = false;
  s4.visited.forEach((on, i) => { if (!on) { pen = false; return; } const u = i * U4.d, X = m.x(u), Y = m.y(f(u)); if (!pen) { ctx.moveTo(X, Y); pen = true; } else ctx.lineTo(X, Y); });
  ctx.stroke(); ctx.restore();
}
function draw4() {
  const U = num('u4'), b = M.bulb(U), Rhot = M.BULB.Rhot;
  $('u4v').textContent = U.toFixed(2);
  circuits.c4();
  let { ctx, W, H } = fitCanvas($('c4b'));
  const B = panel(ctx, W, { top: 30, bottom: H - 26, xMin: 0, xMax: 3.1, yMin: 0, yMax: 0.4, yTicks: [0, 0.1, 0.2, 0.3, 0.4], xTicks: true, xSteps: [0.5, 1], title: t('c4b') });
  curve(ctx, B, u => u / Rhot, 0, 3.1, C.ghost, { dash: [6, 4], lw: 1.5, steps: 2 });
  trace(ctx, B, u => M.bulb(u).I);
  dot(ctx, B.x(U), B.y(b.I), 6, C.cyan);
  ({ ctx, W, H } = fitCanvas($('c4c')));
  const D = panel(ctx, W, { top: 30, bottom: H - 26, xMin: 0, xMax: 3.1, yMin: 0, yMax: 10.5, yTicks: [0, 2, 4, 6, 8, 10], xTicks: true, xSteps: [0.25, 0.5, 1], title: t('c4c') });
  curve(ctx, D, () => Rhot, 0, 3.1, C.ghost, { dash: [6, 4], lw: 1.5, steps: 2 });
  trace(ctx, D, u => M.bulb(u).R);
  dot(ctx, D.x(U), D.y(b.R), 6, C.cyan);
  $('r4').textContent = U === 0 ? t('s4readoutZero') : t('s4readout', { U: U.toFixed(2), I: fmt(b.I, 3), R: fmt(b.R, 2), P: fmt(b.P, 3), Ir: fmt(U / Rhot, 3) });
}

/* ---------- step 5: which resistor is hotter ---------- */
const s5 = { mode: 'parallel' };
const PREF = { parallel: 18, series: 2.5 };
circuits.c5 = () => {
  const R2 = num('r5s'), h = M.heat(s5.mode, R2), canvas = $('c5');
  const { ctx, W, H } = fitCanvas(canvas), G = loop(W, H), ym = (G.y0 + G.y1) / 2, Iref = 1.5;
  title(ctx, t(s5.mode === 'parallel' ? 'c5aPar' : 'c5aSer'), 8, 17, W - 16);
  const g1 = Math.sqrt(h.P1 / PREF[s5.mode]), g2 = Math.sqrt(h.P2 / PREF[s5.mode]);
  const two = (txt1, txt2, X, Y, align) => { label(ctx, txt1, X, Y, align, C.text, 12); label(ctx, txt2, X, Y + 15, align, C.muted, 11); };
  if (s5.mode === 'parallel') {
    const xa = G.x0 + (G.x1 - G.x0) * 0.5;
    wire(ctx, [[G.x0, G.y1], [G.x0, G.y0], [G.x1, G.y0], [G.x1, G.y1], [G.x0, G.y1]]); wire(ctx, [[xa, G.y0], [xa, G.y1]]);
    flow(ctx, [[xa, G.y1], [G.x0, G.y1], [G.x0, G.y0], [xa, G.y0]], h.I, Iref, flowClock);
    flow(ctx, [[xa, G.y0], [xa, G.y1]], h.I1, Iref, flowClock);
    flow(ctx, [[xa, G.y0], [G.x1, G.y0], [G.x1, G.y1], [xa, G.y1]], h.I2, Iref, flowClock);
    battery(ctx, G.x0, ym, 4);
    resistor(ctx, xa, ym, true, g1); resistor(ctx, G.x1, ym, true, g2);
    two('R₁', '10 Ω', xa - 14, ym - 4, 'right'); two('R₂', R2 + ' Ω', G.x1 - 14, ym - 4, 'right');
  } else {
    const xa = G.x0 + (G.x1 - G.x0) * 0.32, xb = G.x0 + (G.x1 - G.x0) * 0.72;
    const path = [[G.x0, G.y1], [G.x0, G.y0], [G.x1, G.y0], [G.x1, G.y1], [G.x0, G.y1]];
    wire(ctx, path); flow(ctx, path, h.I, Iref, flowClock);
    battery(ctx, G.x0, ym, 4);
    resistor(ctx, xa, G.y0, false, g1); resistor(ctx, xb, G.y0, false, g2);
    two('R₁', '10 Ω', xa, G.y0 + 30, 'center'); two('R₂', R2 + ' Ω', xb, G.y0 + 30, 'center');
  }
  label(ctx, '6 V', G.x0 + 18, ym + 4, 'left', C.text, 12);
};
function draw5() {
  const R2 = num('r5s'), h = M.heat(s5.mode, R2), par = s5.mode === 'parallel';
  $('r5v').textContent = String(R2);
  $('modePar').setAttribute('aria-pressed', String(par)); $('modeSer').setAttribute('aria-pressed', String(!par));
  circuits.c5();
  const { ctx, W, H } = fitCanvas($('c5b'));
  const yMax = par ? 19 : 2.6, yT = par ? [0, 5, 10, 15] : [0, 0.5, 1, 1.5, 2, 2.5];
  const B = panel(ctx, W, { top: 30, bottom: H - 26, xMin: 0, xMax: 41, yMin: 0, yMax, yTicks: yT, xTicks: true, xSteps: [5, 10, 20], title: t('c5b') });
  curve(ctx, B, v => M.heat(s5.mode, v).P1, 2, 41, C.violet, { steps: 300, lw: 2.2 });
  curve(ctx, B, v => M.heat(s5.mode, v).P2, 2, 41, C.orange, { steps: 300, lw: 2.2, yClip: [0, yMax] });
  vline(ctx, B, R2, C.cyan);
  dot(ctx, B.x(R2), B.y(h.P1), 5.5, C.violet); dot(ctx, B.x(R2), B.y(h.P2), 5.5, C.orange);
  const d = h.P1 - h.P2, hot = Math.abs(d) < 1e-9 ? t('hotEq') : d > 0 ? t('hot1') : t('hot2', { R2 });
  $('r5').textContent = par
    ? t('s5readPar', { I1: fmt(h.I1, 2), I2: fmt(h.I2, 2), P1: fmt(h.P1, 2), P2: fmt(h.P2, 2), hot })
    : t('s5readSer', { I: fmt(h.I, 3), U1: fmt(h.U1, 2), U2: fmt(h.U2, 2), P1: fmt(h.P1, 3), P2: fmt(h.P2, 3), hot });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  $('n0').addEventListener('input', () => { s0.tried.add(num('n0')); draw0(); });
  $('clear0').addEventListener('click', () => { s0.tried = new Set([num('n0')]); draw0(); });

  $('u1').addEventListener('input', () => { s1.tried = new Set([num('r1s')]); draw1(); });
  $('r1s').addEventListener('input', () => { s1.tried.add(num('r1s')); draw1(); });
  $('clear1').addEventListener('click', () => { s1.tried = new Set([num('r1s')]); draw1(); });
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked');
    const ok = !!choice && choice.value === 'a';
    $('quizFeedback').dataset.state = ok ? 'correct' : 'wrong';
    $('quizFeedback').textContent = t(ok ? 'correct' : 'wrong');
    $('quizFeedback').style.color = ok ? C.green : C.orange;
  });

  $('L2').addEventListener('input', () => { s2.triedL.add(String(num('L2'))); draw2(); });
  $('S2').addEventListener('input', () => { s2.triedS.add(String(num('S2'))); draw2(); });

  $('u3').addEventListener('input', draw3);
  $('rec3').addEventListener('click', () => { if (s3.pts.length < MAXREC) { const rd = M.reading(num('u3'), M.MYSTERY[s3.idx]); s3.pts.push({ U: rd.U, I: rd.I }); } draw3(); });
  $('reveal3').addEventListener('click', () => { s3.revealed = true; draw3(); });
  $('new3').addEventListener('click', () => { s3.idx = (s3.idx + 1) % M.MYSTERY.length; s3.pts = []; s3.revealed = false; draw3(); });
  $('clear3').addEventListener('click', () => { s3.pts = []; draw3(); });

  $('u4').addEventListener('input', () => { stopAnim('s4'); markU(num('u4')); draw4(); });
  $('sweep4').addEventListener('click', () => {
    s4.visited.fill(0); s4.last = 0;
    animate('s4', 4000, p => { const v = Math.round(p * U4.max / U4.d) * U4.d; $('u4').value = v.toFixed(2); markU(num('u4')); draw4(); });
  });
  s4.last = 0; markU(num('u4')); // the default trace starts at 0 V so a first stretch of the curve is visible

  $('modePar').addEventListener('click', () => { s5.mode = 'parallel'; draw5(); });
  $('modeSer').addEventListener('click', () => { s5.mode = 'series'; draw5(); });
  $('r5s').addEventListener('input', draw5);

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target)));
    }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
    const seen = new IntersectionObserver(es => { es.forEach(e => { if (e.isIntersecting) onScreen.add(e.target.id); else onScreen.delete(e.target.id); }); kick(); });
    document.querySelectorAll('canvas.circuit').forEach(c => seen.observe(c));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { finishAll(); halt(); } else kick(); });
  window.refreshLesson = () => { refresh(); const fb = $('quizFeedback'); if (fb.dataset.state) fb.textContent = t(fb.dataset.state); };
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
