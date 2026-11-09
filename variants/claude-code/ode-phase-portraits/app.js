'use strict';
// ODE phase-portrait lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, dot and readout comes from window.ODE_MODEL (model.js). Canvas text is limited to panel
// titles, bar-row labels in a fixed left column and axis ticks; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.ODE_MODEL;
const t = (...a) => window.PAGE_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', ghost: '#8696aa' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; return v.toFixed(d).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') || '0'; };
const sci = v => { const a = Math.abs(v); if (a === 0) return '0'; if (a >= 0.01 && a < 1000) return fmt(v, a < 0.1 ? 3 : 2); return v.toExponential(1).replace('e', '×10^').replace(/\^\+?(-?\d+)/, (_, e) => toSup(e)); };
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const toSup = e => String(e).split('').map(ch => SUP[ch]).join('');
const niceCeil = v => { const steps = [1, 2, 2.5, 4, 5, 8, 10, 12, 15, 16, 20, 25, 30, 40, 50]; for (const s of steps) if (v <= s) return s; return Math.ceil(v / 50) * 50; };

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
// Text that shrinks until it fits maxW (never overflows the canvas).
function fitText(ctx, text, X, Y, maxW, { size = 12, weight = 600, color = C.text, align = 'left' } = {}) {
  ctx.save(); ctx.fillStyle = color; ctx.textAlign = align;
  do { ctx.font = `${weight} ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 7);
  ctx.fillText(text, X, Y); ctx.restore();
}
function ticks(lo, hi, px, minPx) {
  const span = hi - lo; let step = 1;
  for (const s of [0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10, 20, 25, 50, 100]) { step = s; if (s / span * px >= minPx) break; }
  const out = []; for (let v = Math.ceil(lo / step - 1e-9) * step; v <= hi + 1e-9; v += step) out.push(Math.round(v * 1e6) / 1e6);
  return out;
}
// A plot panel: title row above, y ticks left, x ticks below. yTicks may be given explicitly (with labels).
function panel(ctx, W, o) {
  const P = { l: o.left || 34, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  const yt = o.yTicks || ticks(o.yMin, o.yMax, P.b - P.t, 26).map(v => ({ v, s: fmt(v) }));
  for (const q of yt) {
    const v = typeof q === 'number' ? q : q.v, s = typeof q === 'number' ? fmt(q) : q.s;
    ctx.strokeStyle = Math.abs(v) < 1e-12 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(s, P.l - 5, y(v) + 4);
  }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.t); ctx.lineTo(P.l, P.b); ctx.stroke();
  ctx.textAlign = 'center';
  for (const v of ticks(o.xMin, o.xMax, P.r - P.l, o.minPx || 30)) {
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
    ctx.fillText(fmt(v), x(v), P.b + 15);
  }
  ctx.restore();
  if (o.title) fitText(ctx, o.title, 6, P.t - 9, W - 12);
  return { x, y, P };
}
const clip = (ctx, m) => { ctx.save(); ctx.beginPath(); ctx.rect(m.P.l, m.P.t, m.P.r - m.P.l, m.P.b - m.P.t); ctx.clip(); };
function polyline(ctx, m, xs, ys, i0, i1, color, lw, alpha = 1, dash = null) {
  if (i1 - i0 < 1) return;
  clip(ctx, m); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = alpha; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); const stride = Math.max(1, Math.floor((i1 - i0) / 1500));
  for (let i = i0; i <= i1; i += stride) { const X = m.x(xs[i]), Y = m.y(ys[i]); if (i === i0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
  ctx.lineTo(m.x(xs[i1]), m.y(ys[i1])); ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, r, color, ring = true) { ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); if (ring) { ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5; ctx.stroke(); } ctx.restore(); }
function arrow(ctx, X0, Y0, X1, Y1, color, lw = 2, head = 7, alpha = 1) {
  const L = Math.hypot(X1 - X0, Y1 - Y0); if (L < 1) return;
  const ux = (X1 - X0) / L, uy = (Y1 - Y0) / L, hh = Math.min(head, L * 0.6);
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw;
  ctx.beginPath(); ctx.moveTo(X0, Y0); ctx.lineTo(X1 - ux * hh * 0.7, Y1 - uy * hh * 0.7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(X1, Y1); ctx.lineTo(X1 - ux * hh - uy * hh * 0.5, Y1 - uy * hh + ux * hh * 0.5); ctx.lineTo(X1 - ux * hh + uy * hh * 0.5, Y1 - uy * hh - ux * hh * 0.5); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function vline(ctx, X, y0, y1, color, alpha = 0.6, dash = [4, 4], lw = 1.3) { ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.setLineDash(dash); ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y1); ctx.stroke(); ctx.restore(); }
function hline(ctx, Y, x0, x1, color, alpha = 0.6, dash = [4, 4], lw = 1.3) { ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.setLineDash(dash); ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(x0, Y); ctx.lineTo(x1, Y); ctx.stroke(); ctx.restore(); }
function field(ctx, m, xMax, yMax, K = Infinity) {
  const nx = Math.max(6, Math.round((m.P.r - m.P.l) / 34)), ny = Math.max(5, Math.round((m.P.b - m.P.t) / 34));
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
    const xv = (i + 0.5) / nx * xMax, yv = (j + 0.5) / ny * yMax, [u, v] = M.rates(xv, yv, M.P, K);
    const X = m.x(xv), Y = m.y(yv), px = u * (m.x(1) - m.x(0)), py = -v * (m.y(0) - m.y(1)), L = Math.hypot(px, py);
    if (L < 1e-9) continue;
    arrow(ctx, X - px / L * 6, Y - py / L * 6, X + px / L * 6, Y + py / L * 6, C.raw, 1.2, 4.5, 0.9);
  }
}
function dirText(dx, dy) {
  const h = Math.abs(dx) < 1e-9 ? '' : t(dx > 0 ? 'dirR' : 'dirL'), v = Math.abs(dy) < 1e-9 ? '' : t(dy > 0 ? 'dirU' : 'dirD');
  return h && v ? t('dirBoth', { h, v }) : (h || v);
}

/* ---------- animation runner (reduced motion → final frame; hidden page → finish) ---------- */
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

/* ---------- step 0: rates as bars ---------- */
function barPanel(ctx, W, top, bottom, rows, ttl, range) {
  fitText(ctx, ttl, 6, top - 9, W - 12);
  const labW = Math.min(76, Math.max(46, W * 0.16)), l = labW + 8, r = W - 14;
  const x = v => l + (v + range) / (2 * range) * (r - l), rowH = (bottom - top) / rows.length;
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'center';
  for (const v of ticks(-range, range, r - l, 34)) { ctx.strokeStyle = Math.abs(v) < 1e-9 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(x(v), top); ctx.lineTo(x(v), bottom); ctx.stroke(); ctx.fillText(fmt(v), x(v), bottom + 14); }
  ctx.restore();
  rows.forEach((q, i) => {
    const cy = top + rowH * (i + 0.5), bh = Math.min(22, rowH * 0.6);
    fitText(ctx, q.label, labW, cy + 4, labW - 4, { size: 12, weight: q.bold ? 700 : 500, color: q.bold ? C.text : C.muted, align: 'right' });
    const x0 = x(0), x1 = x(Math.max(-range, Math.min(range, q.v)));
    ctx.fillStyle = q.color; ctx.fillRect(Math.min(x0, x1), cy - bh / 2, Math.max(1.5, Math.abs(x1 - x0)), bh);
  });
}
const s0 = { x: 6, y: 1 };
function draw0() {
  const x = s0.x, y = s0.y, q = M.terms(x, y);
  $('x0nv').textContent = fmt(x); $('y0nv').textContent = fmt(y);
  const { ctx, W, H } = fitCanvas($('c0'));
  const rR = niceCeil(Math.max(2, q.birth, q.eaten)), rF = niceCeil(Math.max(2, q.die, q.gain));
  barPanel(ctx, W, 28, 140, [{ label: t('bBirth'), v: q.birth, color: C.green }, { label: t('bEaten'), v: -q.eaten, color: C.pink }, { label: t('bNet'), v: q.dx, color: C.cyan, bold: true }], t('c0a'), rR);
  barPanel(ctx, W, 196, H - 26, [{ label: t('bGain'), v: q.gain, color: C.green }, { label: t('bDie'), v: -q.die, color: C.pink }, { label: t('bNet'), v: q.dy, color: C.cyan, bold: true }], t('c0b'), rF);
  const sgn = v => t(Math.abs(v) < 1e-12 ? 'flat' : v > 0 ? 'up' : 'down');
  $('r0').textContent = t('s0readout', { x: fmt(x), y: fmt(y), xa: Math.round(x * 100), ya: Math.round(y * 10), birth: fmt(q.birth), eaten: fmt(q.eaten), dx: fmt(q.dx), die: fmt(q.die), gain: fmt(q.gain), dy: fmt(q.dy), xs: sgn(q.dx), ys: sgn(q.dy) });
}

/* ---------- step 1: time curves ---------- */
const s1 = { p: 1 };
const cache = new Map();
function storyFor(x0, y0) { const k = x0 + ',' + y0; if (!cache.has(k)) cache.set(k, M.story(x0, y0)); return cache.get(k); }
const isEq = (x0, y0) => Math.abs(x0 - M.eq().x) < 1e-9 && Math.abs(y0 - M.eq().y) < 1e-9;
function draw1() {
  const x0 = num('x1'), y0 = num('y1'), S = storyFor(x0, y0), r = S.run;
  $('x1v').textContent = fmt(x0); $('y1v').textContent = fmt(y0);
  const { ctx, W, H } = fitCanvas($('c1'));
  const top = niceCeil(Math.max(S.xMax, S.yMax) * 1.05);
  const m = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 30, yMin: 0, yMax: top, title: t('c1') });
  const iEnd = Math.round(s1.p * (r.t.length - 1));
  polyline(ctx, m, r.t, r.x, 0, iEnd, C.cyan, 2.2); polyline(ctx, m, r.t, r.y, 0, iEnd, C.orange, 2.2);
  const eq = isEq(x0, y0);
  if (!eq && r.t[iEnd] >= S.tRabbit) vline(ctx, m.x(S.tRabbit), m.P.t, m.P.b, C.cyan);
  if (!eq && r.t[iEnd] >= S.tFox) vline(ctx, m.x(S.tFox), m.P.t, m.P.b, C.orange);
  dot(ctx, m.x(r.t[iEnd]), m.y(r.x[iEnd]), 4, C.cyan); dot(ctx, m.x(r.t[iEnd]), m.y(r.y[iEnd]), 4, C.orange);
  if (eq) { $('r1').textContent = t('s1eq'); return; }
  const prog = s1.p < 1 ? t('s1progress', { t: r.t[iEnd].toFixed(1) }) : '';
  $('r1').textContent = t('s1readout', { prog, xMin: fmt(S.xMin), xMax: fmt(S.xMax), yMin: fmt(S.yMin), yMax: fmt(S.yMax), tR: S.tRabbit.toFixed(2), tF: S.tFox.toFixed(2), lag: S.lag.toFixed(2), per: S.period.toFixed(2) });
}

/* ---------- step 2: phase plane with a time cursor ---------- */
function draw2() {
  const x0 = num('x1'), y0 = num('y1'), S = storyFor(x0, y0), r = S.run, tc = num('t2');
  $('t2v').textContent = tc.toFixed(2);
  const i = Math.min(r.t.length - 1, Math.round(tc / r.dt));
  let { ctx, W, H } = fitCanvas($('c2'));
  const top = niceCeil(Math.max(S.xMax, S.yMax) * 1.05);
  const A = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 30, yMin: 0, yMax: top, title: t('c2a') });
  polyline(ctx, A, r.t, r.x, 0, r.t.length - 1, C.cyan, 1.4, 0.35); polyline(ctx, A, r.t, r.y, 0, r.t.length - 1, C.orange, 1.4, 0.35);
  polyline(ctx, A, r.t, r.x, 0, i, C.cyan, 2.2); polyline(ctx, A, r.t, r.y, 0, i, C.orange, 2.2);
  vline(ctx, A.x(r.t[i]), A.P.t, A.P.b, C.text, 0.7, [], 1);
  dot(ctx, A.x(r.t[i]), A.y(r.x[i]), 4.5, C.cyan); dot(ctx, A.x(r.t[i]), A.y(r.y[i]), 4.5, C.orange);

  ({ ctx, W, H } = fitCanvas($('c2b')));
  const xM = niceCeil(S.xMax * 1.08), yM = niceCeil(S.yMax * 1.08);
  const B = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: xM, yMin: 0, yMax: yM, title: t('c2b') });
  field(ctx, B, xM, yM);
  const eq = M.eq();
  polyline(ctx, B, r.x, r.y, 0, r.t.length - 1, C.text, 1.4, 0.3);
  const iStart = Math.max(0, i - Math.round(S.period / r.dt || 0));
  polyline(ctx, B, r.x, r.y, iStart, i, C.text, 2.4);
  dot(ctx, B.x(eq.x), B.y(eq.y), 5, C.green);
  dot(ctx, B.x(r.x[i]), B.y(r.y[i]), 6, C.text);
  if (isEq(x0, y0)) { $('r2').textContent = t('s2eqr'); return; }
  const [u, v] = M.rates(r.x[i], r.y[i]);
  if (S.gap === undefined) S.gap = M.returnGap(x0, y0);
  const gap = S.gap;
  $('r2').textContent = t('s2readout', { t: r.t[i].toFixed(2), x: fmt(r.x[i]), y: fmt(r.y[i]), dir: dirText(u, v), per: S.period.toFixed(2), gap: gap < 0.01 ? '< 0.01' : fmt(gap) });
}

/* ---------- step 3: nullclines and a probe ---------- */
const P3 = { xM: 10.5, yM: 5.25 };
let m3 = null;
function draw3() {
  const x = num('px'), y = num('py'), [u, v] = M.rates(x, y), eq = M.eq();
  $('pxv').textContent = fmt(x); $('pyv').textContent = fmt(y);
  const { ctx, W, H } = fitCanvas($('c3'));
  const m = m3 = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: P3.xM, yMin: 0, yMax: P3.yM, title: t('c3') });
  // region flow glyphs at the centre of each region
  const regions = [[(eq.x + P3.xM) / 2, (eq.y + P3.yM) / 2], [eq.x / 2, (eq.y + P3.yM) / 2], [eq.x / 2, eq.y / 2], [(eq.x + P3.xM) / 2, eq.y / 2]];
  regions.forEach(([rx, ry]) => { const [a, b] = M.rates(rx, ry), sx = Math.sign(a) * 22, sy = -Math.sign(b) * 22; arrow(ctx, m.x(rx) - sx, m.y(ry) - sy, m.x(rx) + sx, m.y(ry) + sy, C.raw, 5, 13, 0.55); });
  hline(ctx, m.y(eq.y), m.P.l, m.P.r, C.cyan, 0.9, [7, 5], 2);
  vline(ctx, m.x(eq.x), m.P.t, m.P.b, C.orange, 0.9, [7, 5], 2);
  dot(ctx, m.x(eq.x), m.y(eq.y), 6, C.green);
  const X = m.x(x), Y = m.y(y);
  const px = u * (m.x(1) - m.x(0)), py = -v * (m.y(0) - m.y(1)), L = Math.hypot(px, py);
  if (L > 1e-9) {
    const s = 64 / L;
    arrow(ctx, X, Y, X + px * s, Y, C.cyan, 2.4, 8); arrow(ctx, X, Y, X, Y + py * s, C.orange, 2.4, 8);
    arrow(ctx, X, Y, X + px * s, Y + py * s, C.text, 2.6, 10);
  }
  dot(ctx, X, Y, 6, C.text);
  const sg = val => t(Math.abs(val) < 1e-12 ? 'flat' : val > 0 ? 'up' : 'down');
  let where;
  if (Math.abs(u) < 1e-12 && Math.abs(v) < 1e-12) where = t('s3eqNote');
  else if (Math.abs(u) < 1e-12) where = t('s3onNx');
  else if (Math.abs(v) < 1e-12) where = t('s3onNy');
  else where = t('s3inQ', { q: t((x > eq.x ? 'qR' : 'qL') + (y > eq.y ? 'U' : 'D')), dir: dirText(u, v) });
  $('r3').textContent = t('s3readout', { x: fmt(x), y: fmt(y), dx: fmt(u), dy: fmt(v), xs: sg(u), ys: sg(v), where });
}

/* ---------- step 4: conserved H, nested loops and their periods ---------- */
const s4 = { hist: new Set([1.8, 1.5, 1]) };
const loopCache = new Map();
function loop(y0) {
  const k = y0.toFixed(1);
  if (!loopCache.has(k)) {
    const per = M.period(4, y0), r = M.integrate(4, y0, { dt: 0.01, T: per + 0.02 });
    const hs = r.x.map((x, i) => M.H(x, r.y[i]));
    loopCache.set(k, { per, r, spread: Math.max(...hs) - Math.min(...hs) });
  }
  return loopCache.get(k);
}
function draw4() {
  const y0 = Math.round(num('y4') * 10) / 10, cur = loop(y0), eq = M.eq();
  $('y4v').textContent = y0.toFixed(1);
  let { ctx, W, H } = fitCanvas($('c4'));
  const A = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 16, yMin: 0, yMax: 8, title: t('c4a') });
  [...s4.hist].forEach(v => { if (Math.abs(v - y0) < 1e-9) return; const q = loop(v); polyline(ctx, A, q.r.x, q.r.y, 0, q.r.x.length - 1, C.ghost, 1.3, 0.75); });
  polyline(ctx, A, cur.r.x, cur.r.y, 0, cur.r.x.length - 1, C.cyan, 2.4);
  dot(ctx, A.x(eq.x), A.y(eq.y), 5, C.green); dot(ctx, A.x(4), A.y(y0), 4.5, C.cyan);

  ({ ctx, W, H } = fitCanvas($('c4b')));
  const B = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 1.9, yMin: 6, yMax: 8, left: 30, title: t('c4b') });
  hline(ctx, B.y(2 * Math.PI), B.P.l, B.P.r, C.orange, 0.9, [6, 4], 1.6);
  [...s4.hist].forEach(v => { if (Math.abs(v - y0) < 1e-9) return; dot(ctx, B.x(2 - v), B.y(loop(v).per), 3.6, C.text); });
  dot(ctx, B.x(2 - y0), B.y(cur.per), 6, C.cyan);
  $('r4').textContent = t('s4readout', { y0: y0.toFixed(1), h: M.H(4, y0).toFixed(4), hs: M.H(eq.x, eq.y).toFixed(4), spread: sci(cur.spread), per: cur.per.toFixed(3), ratio: (cur.per / (2 * Math.PI)).toFixed(3) });
}

/* ---------- step 5: Euler vs RK4 ---------- */
const s5 = { method: 'euler' };
const driftCache = new Map();
function driftFor(m, dt) { const k = m + dt; if (!driftCache.has(k)) driftCache.set(k, M.drift(m, dt)); return driftCache.get(k); }
let exact5 = null;
function draw5() {
  const dt = M.DTS[num('dt5')], d = driftFor(s5.method, dt), r = d.run;
  $('dt5v').textContent = String(dt);
  $('mEuler').setAttribute('aria-pressed', s5.method === 'euler'); $('mRK4').setAttribute('aria-pressed', s5.method === 'rk4');
  if (!exact5) { const per = M.period(4, 1); exact5 = M.integrate(4, 1, { dt: 0.002, T: per + 0.01 }); }
  let { ctx, W, H } = fitCanvas($('c5'));
  const A = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 16, yMin: 0, yMax: 8, title: t('c5a') });
  polyline(ctx, A, r.x, r.y, 0, r.x.length - 1, C.pink, 1.6);
  polyline(ctx, A, exact5.x, exact5.y, 0, exact5.x.length - 1, C.text, 2, 0.9, [6, 4]);
  dot(ctx, A.x(4), A.y(1), 4.5, C.text);
  const li = r.x.length - 1; if (A.x(r.x[li]) <= A.P.r && A.y(r.y[li]) >= A.P.t) dot(ctx, A.x(r.x[li]), A.y(r.y[li]), 4.5, C.pink);

  ({ ctx, W, H } = fitCanvas($('c5b')));
  const mx = Math.max(...d.hs.map(Math.abs)) || 1e-12, lim = mx * 1.15;
  const B = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 30, yMin: -lim, yMax: lim, left: 52, yTicks: [-mx, 0, mx].map(v => ({ v, s: sci(v) })), title: t('c5b') });
  polyline(ctx, B, r.t, d.hs, 0, d.hs.length - 1, C.orange, 2.2);
  const m = t(s5.method === 'euler' ? 'mEuler' : 'mRK4');
  let tail;
  if (d.escaped) tail = t('s5esc', { t: d.tEnd.toFixed(1), d: sci(d.end) });
  else { const half = driftFor(s5.method, dt / 2); tail = t('s5ok', { d: sci(d.end), pct: Math.abs(d.end / d.gap0 * 100) >= 10 ? (d.end / d.gap0 * 100).toFixed(0) : sci(d.end / d.gap0 * 100), ratio: (d.end / half.end).toFixed(1) }); }
  $('r5').textContent = t('s5readout', { m, dt: String(dt), tail });
}

/* ---------- step 6: crowding ---------- */
const s6 = { inf: false };
const crowdCache = new Map();
function crowdFor(K) { const k = String(K); if (!crowdCache.has(k)) crowdCache.set(k, M.crowdRun(K)); return crowdCache.get(k); }
const cplx = l => (Math.abs(l.im) < 1e-12 ? fmt(l.re, 3) : `${fmt(l.re, 3)} ${l.im < 0 ? '−' : '+'} ${fmt(Math.abs(l.im), 3)}i`).replace(/^-/, '−');
function draw6() {
  const K = s6.inf ? Infinity : Math.round(num('K6') * 10) / 10, c = crowdFor(K), r = c.run, e = c.eq;
  $('K6v').textContent = s6.inf ? '∞' : K.toFixed(1);
  $('Kinf').setAttribute('aria-pressed', s6.inf);
  let { ctx, W, H } = fitCanvas($('c6'));
  const A = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 10, yMin: 0, yMax: 5, title: t('c6a') });
  field(ctx, A, 10, 5, K);
  // rabbit nullcline y = (a/b)(1 − x/K); fox nullcline x = c/d
  clip(ctx, A); ctx.strokeStyle = C.cyan; ctx.lineWidth = 2; ctx.setLineDash([7, 5]); ctx.globalAlpha = 0.9; ctx.beginPath();
  const xEnd = Number.isFinite(K) ? Math.min(10, K) : 10, yAt = xv => M.P.a / M.P.b * (Number.isFinite(K) ? 1 - xv / K : 1);
  ctx.moveTo(A.x(0), A.y(yAt(0))); ctx.lineTo(A.x(xEnd), A.y(yAt(xEnd))); ctx.stroke(); ctx.restore();
  vline(ctx, A.x(M.eq().x), A.P.t, A.P.b, C.orange, 0.9, [7, 5], 2);
  polyline(ctx, A, r.x, r.y, 0, r.x.length - 1, C.text, 1.8);
  dot(ctx, A.x(r.x[0]), A.y(r.y[0]), 4.5, C.text);
  dot(ctx, A.x(e.x), A.y(e.y), 6, C.green);

  ({ ctx, W, H } = fitCanvas($('c6b')));
  const B = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 60, yMin: 0, yMax: 10, title: t('c6b') });
  polyline(ctx, B, r.t, r.x, 0, r.t.length - 1, C.cyan, 2); polyline(ctx, B, r.t, r.y, 0, r.t.length - 1, C.orange, 2);
  const key = { spiral: 'kSpiral', node: 'kNode', center: 'kCenter', extinct: 'kExtinct' }[e.kind];
  const vr = c.vRatio < 0.001 ? sci(c.vRatio) : c.vRatio.toFixed(3);
  $('r6').textContent = t('s6readout', { K: s6.inf ? t('KlabelInf') : t('Klabel', { K: K.toFixed(1) }), kind: t(key, { x: fmt(e.x), y: fmt(e.y, 3) }), l1: cplx(e.l1), l2: cplx(e.l2), dist: c.dist < 0.001 ? sci(c.dist) : c.dist.toFixed(3), vr });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); draw6(); }

function setup() {
  $('xn').addEventListener('input', () => { s0.x = num('xn'); draw0(); });
  $('yn').addEventListener('input', () => { s0.y = num('yn'); draw0(); });
  $('step0btn').addEventListener('click', () => {
    // exact Euler step of 0.1 yr held in s0 (the sliders only show the nearest notch)
    const [u, v] = M.rates(s0.x, s0.y);
    s0.x = Math.min(10, Math.max(0.5, s0.x + 0.1 * u)); s0.y = Math.min(5, Math.max(0.25, s0.y + 0.1 * v));
    $('xn').value = s0.x; $('yn').value = s0.y; draw0();
  });
  $('reset0').addEventListener('click', () => { s0.x = 6; s0.y = 1; $('xn').value = 6; $('yn').value = 1; draw0(); });

  const on1 = () => { stopAnim('s1'); s1.p = 1; draw1(); $('t2').value = 0; draw2(); };
  ['x1', 'y1'].forEach(id => $(id).addEventListener('input', on1));
  $('play1').addEventListener('click', () => { s1.p = 0; animate('s1', 6000, p => { s1.p = p; draw1(); }); });

  $('t2').addEventListener('input', () => { stopAnim('s2'); draw2(); });
  $('play2').addEventListener('click', () => { animate('s2', 9000, p => { $('t2').value = (30 * p).toFixed(2); draw2(); }); });

  ['px', 'py'].forEach(id => $(id).addEventListener('input', draw3));
  $('c3').addEventListener('click', ev => {
    if (!m3) return;
    const rc = $('c3').getBoundingClientRect(), X = ev.clientX - rc.left, Y = ev.clientY - rc.top;
    const xv = (X - m3.P.l) / (m3.P.r - m3.P.l) * P3.xM, yv = (m3.P.b - Y) / (m3.P.b - m3.P.t) * P3.yM;
    $('px').value = Math.round(xv * 4) / 4; $('py').value = Math.round(yv * 4) / 4; draw3();
  });
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked'), ok = !!choice && choice.value === 'b';
    $('quizFeedback').textContent = t(ok ? 'correct' : 'wrong'); $('quizFeedback').style.color = ok ? C.green : C.orange; $('quizFeedback').dataset.state = ok ? 'correct' : 'wrong';
  });

  $('y4').addEventListener('input', () => { s4.hist.add(Math.round(num('y4') * 10) / 10); draw4(); });
  $('clear4').addEventListener('click', () => { s4.hist = new Set([Math.round(num('y4') * 10) / 10]); draw4(); });

  $('mEuler').addEventListener('click', () => { s5.method = 'euler'; draw5(); });
  $('mRK4').addEventListener('click', () => { s5.method = 'rk4'; draw5(); });
  $('dt5').addEventListener('input', draw5);

  $('K6').addEventListener('input', () => { s6.inf = false; draw6(); });
  $('Kinf').addEventListener('click', () => { s6.inf = !s6.inf; draw6(); });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshPage = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
