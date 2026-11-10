'use strict';
// Regression & correlation lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every point, line and readout comes from window.REGRESSION_MODEL (model.js). Canvas text is limited to
// panel titles and axis ticks; axis names, legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.REGRESSION_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', ghost: '#8696aa' };
const num = id => Number($(id).value);
// Fixed decimals, then trim trailing zeros only when there is a decimal point (so 90 stays 90).
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; };

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
// Evenly spaced "nice" ticks covering [lo, hi]; returns the padded range and tick list.
function niceAxis(lo, hi, n = 4) {
  const raw = (hi - lo) / n, mag = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / mag;
  const step = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * mag;
  const min = Math.floor(lo / step) * step, max = Math.ceil(hi / step) * step, ticks = [];
  for (let v = min; v <= max + step * 1e-6; v += step) ticks.push(Number(v.toFixed(10)));
  return { min, max, ticks, step };
}
function lineSeg(ctx, m, a, b, x0, x1, color, { lw = 2, dash = null } = {}) {
  // Clip the line y = a + b·x to the panel rectangle so it never runs over titles or tick labels.
  const yLo = m.yMin, yHi = m.yMax;
  let lo = x0, hi = x1;
  if (b !== 0) { const xa = (yLo - a) / b, xb = (yHi - a) / b; lo = Math.max(lo, Math.min(xa, xb)); hi = Math.min(hi, Math.max(xa, xb)); }
  else if (a < yLo || a > yHi) return;
  if (hi <= lo) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(m.x(lo), m.y(a + b * lo)); ctx.lineTo(m.x(hi), m.y(a + b * hi)); ctx.stroke(); ctx.restore();
}
// Scatter panel helper: nice axes from data ranges, remembers the y range for clipping.
function scatterPanel(ctx, W, o) {
  // x keeps the caller's exact range (already padded); y is rounded out to nice ticks.
  const X = { min: o.xLo, max: o.xHi };
  let Y = niceAxis(o.yLo, o.yHi, o.yn || 4);
  if (o.yExact) Y = { min: o.yLo, max: o.yHi, ticks: Y.ticks.filter(v => v >= o.yLo - 1e-9 && v <= o.yHi + 1e-9) };
  const m = panel(ctx, W, { top: o.top, bottom: o.bottom, left: o.left || 44, xMin: X.min, xMax: X.max, yMin: Y.min, yMax: Y.max, yTicks: Y.ticks, xTicks: true, xSteps: [0.5, 1, 2, 5, 10, 20, 25, 50], minPx: 34, title: o.title });
  m.xMin = X.min; m.xMax = X.max; m.yMin = Y.min; m.yMax = Y.max;
  return m;
}
// Axis captions under each canvas; the chart name is the title up to its first colon.
const axes = (id, rows) => { $(id).textContent = rows.map(r => t('axesFmt', { ...r, c: r.c.split(/：|: /)[0] })).join(' '); };

/* ---------- step 0: r as the average rectangle ---------- */
const s0 = { prod: 'ice', unitF: false };
const prodKey = { ice: 'prodNameIce', soup: 'prodNameSoup', pens: 'prodNamePens' };
function draw0() {
  const noise = num('n0'), d = M.shop(s0.prod, noise), xs = s0.unitF ? d.x.map(M.toF) : d.x;
  $('n0v').textContent = String(noise);
  ['ice', 'soup', 'pens'].forEach(p => $('prod' + p[0].toUpperCase() + p.slice(1)).setAttribute('aria-pressed', s0.prod === p));
  $('unit0').textContent = t(s0.unitF ? 'unitC' : 'unitF');
  // y range fixed per product (covers every wobble on the slider) so the spread visibly grows.
  const ext = [M.shop(s0.prod, 0), M.shop(s0.prod, 40)].flatMap(q => q.y);
  const xr = s0.unitF ? [M.toF(18), M.toF(36)] : [18, 36];
  const { ctx, W, H } = fitCanvas($('c0'));
  const m = scatterPanel(ctx, W, { top: 26, bottom: H - 28, xLo: xr[0] - 0.5, xHi: xr[1] + 0.5, yLo: Math.min(...ext), yHi: Math.max(...ext), title: t('c0a') });
  axes('ax0', [{ c: t('c0a').split('：')[0].split(':')[0], x: t(s0.unitF ? 'axTempF' : 'axTempC'), y: t('axSales') }]);
  const mx = M.mean(xs), my = M.mean(d.y), sy = M.sd(d.y);
  if (sy > 1e-9) {
    const rp = M.rFromProducts(xs, d.y);
    ctx.save();
    xs.forEach((x, i) => { const pos = rp.prods[i] > 0, col = pos ? '126,226,168' : '255,122,147'; ctx.fillStyle = `rgba(${col},0.10)`; ctx.strokeStyle = `rgba(${col},0.45)`; ctx.lineWidth = 1; const X0 = m.x(mx), Y0 = m.y(my), X1 = m.x(x), Y1 = m.y(d.y[i]); ctx.fillRect(Math.min(X0, X1), Math.min(Y0, Y1), Math.abs(X1 - X0), Math.abs(Y1 - Y0)); ctx.strokeRect(Math.min(X0, X1), Math.min(Y0, Y1), Math.abs(X1 - X0), Math.abs(Y1 - Y0)); });
    ctx.restore();
    vline(ctx, m.x(mx), m.P.t, m.P.b, C.ghost); hline(ctx, m.P.l, m.P.r, m.y(my), C.ghost);
    xs.forEach((x, i) => dot(ctx, m.x(x), m.y(d.y[i]), 4.5, rp.prods[i] > 0 ? C.green : C.pink, true));
    $('r0').textContent = t('s0readout', { prod: t(prodKey[s0.prod]), s: noise, np: rp.nPos, pos: rp.pos.toFixed(2), nn: rp.nNeg, neg: rp.neg.toFixed(2), n: xs.length, r: rp.r.toFixed(3) });
  } else {
    vline(ctx, m.x(mx), m.P.t, m.P.b, C.ghost); hline(ctx, m.P.l, m.P.r, m.y(my), C.ghost);
    xs.forEach((x, i) => dot(ctx, m.x(x), m.y(d.y[i]), 4.5, C.text, true));
    $('r0').textContent = t('s0undef', { prod: t(prodKey[s0.prod]) });
  }
}
function hline(ctx, x0, x1, Y, color) { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 1.4; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(x0, Y); ctx.lineTo(x1, Y); ctx.stroke(); ctx.restore(); }

/* ---------- step 1: least squares ---------- */
const D1 = M.fixedShop(), F1 = M.fit(D1.x, D1.y);
const s1 = { tried: new Map() };
function draw1() {
  const b = num('b1'), d = num('d1'), a = F1.my + d - b * F1.mx;
  $('b1v').textContent = fmt(b, 1); $('d1v').textContent = fmt(d, 0);
  s1.tried.set(b.toFixed(1) + ',' + d, { b, d });
  let { ctx, W, H } = fitCanvas($('c1'));
  const m = scatterPanel(ctx, W, { top: 26, bottom: H - 28, xLo: 17.5, xHi: 34, yLo: 20, yHi: 180, title: t('c1a') });
  ctx.save(); ctx.strokeStyle = C.pink; ctx.lineWidth = 1.6;
  D1.x.forEach((x, i) => { const yh = Math.max(m.yMin, Math.min(m.yMax, a + b * x)); ctx.beginPath(); ctx.moveTo(m.x(x), m.y(D1.y[i])); ctx.lineTo(m.x(x), m.y(yh)); ctx.stroke(); });
  ctx.restore();
  lineSeg(ctx, m, F1.a, F1.b, m.xMin, m.xMax, C.orange, { dash: [6, 4] });
  lineSeg(ctx, m, a, b, m.xMin, m.xMax, C.cyan, { lw: 2.4 });
  D1.x.forEach((x, i) => dot(ctx, m.x(x), m.y(D1.y[i]), 4, C.text, true));
  dot(ctx, m.x(F1.mx), m.y(F1.my), 5, C.orange, true);

  ({ ctx, W, H } = fitCanvas($('c1b')));
  const sseAt = (bb, dd) => M.sseLine(D1.x, D1.y, F1.my + dd - bb * F1.mx, bb);
  let top = Math.max(sseAt(0, 0), sseAt(9, 0)); s1.tried.forEach(q => { top = Math.max(top, sseAt(q.b, q.d)); });
  const Y = niceAxis(0, top, 4);
  const B = panel(ctx, W, { top: 26, bottom: H - 28, left: 52, xMin: 0, xMax: 9, yMin: 0, yMax: Y.max, yTicks: Y.ticks, xTicks: true, xSteps: [1, 2, 3], minPx: 28, title: t('c1b') });
  curve(ctx, B, bb => sseAt(bb, 0), 0, 9, C.orange, { dash: [6, 4] });
  s1.tried.forEach(q => dot(ctx, B.x(q.b), B.y(sseAt(q.b, q.d)), 3.2, C.text));
  dot(ctx, B.x(b), B.y(sseAt(b, d)), 6, C.cyan, true);
  axes('ax1', [{ c: t('c1a'), x: t('axTempC'), y: t('axSales') }, { c: t('c1b'), x: t('axSlope'), y: t('axSSE') }]);
  const sse = sseAt(b, d);
  $('r1').textContent = t('s1readout', { b: fmt(b, 1), d: fmt(d, 0), sse: sse.toFixed(0), bh: F1.b.toFixed(3), min: F1.sse.toFixed(0), extra: (sse - F1.sse).toFixed(0), shiftPart: (F1.n * d * d).toFixed(0) });
}

/* ---------- step 2: prediction ---------- */
const s2 = { std: false };
function draw2() {
  const x0 = num('x2'), yh = F1.a + F1.b * x0, f = F1, std = s2.std;
  $('x2v').textContent = fmt(x0, 1);
  $('std2').textContent = t(std ? 'raw2' : 'std2');
  $('lgDiag2').style.display = std ? '' : 'none';
  const { ctx, W, H } = fitCanvas($('c2'));
  const zx = v => (v - f.mx) / f.sx, zy = v => (v - f.my) / f.sy;
  let m;
  if (!std) {
    m = scatterPanel(ctx, W, { top: 26, bottom: H - 28, xLo: 10, xHi: 42, yLo: 20, yHi: 180, title: t('c2a') });
    band(ctx, m, f.a, f.b, f.rmse);
    lineSeg(ctx, m, f.a, f.b, m.xMin, m.xMax, C.cyan, { lw: 2.4 });
    D1.x.forEach((x, i) => dot(ctx, m.x(x), m.y(D1.y[i]), 4, C.text, true));
    vline(ctx, m.x(x0), m.P.t, m.P.b, C.ghost);
    dot(ctx, m.x(x0), m.y(yh), 6.5, C.orange, true);
    axes('ax2', [{ c: t('c2a'), x: t('axTempC'), y: t('axSales') }]);
  } else {
    m = scatterPanel(ctx, W, { top: 26, bottom: H - 28, xLo: -4, xHi: 4.5, yLo: -3.5, yHi: 3.5, title: t('c2aStd') });
    const s = Math.sqrt(1 - f.r * f.r);
    band(ctx, m, 0, f.r, s);
    lineSeg(ctx, m, 0, 1, m.xMin, m.xMax, C.ghost, { lw: 1.5, dash: [5, 4] });
    lineSeg(ctx, m, 0, f.r, m.xMin, m.xMax, C.cyan, { lw: 2.4 });
    D1.x.forEach((x, i) => dot(ctx, m.x(zx(x)), m.y(zy(D1.y[i])), 4, C.text, true));
    vline(ctx, m.x(zx(x0)), m.P.t, m.P.b, C.ghost);
    dot(ctx, m.x(zx(x0)), m.y(zy(yh)), 6.5, C.orange, true);
    axes('ax2', [{ c: t('c2aStd'), x: t('axZx'), y: t('axZy') }]);
  }
  const k = D1.x.filter((x, i) => Math.abs(D1.y[i] - (f.a + f.b * x)) <= f.rmse).length;
  const lo = Math.min(...D1.x), hi = Math.max(...D1.x);
  let txt = t('s2readout', { x: fmt(x0, 1), a: f.a.toFixed(2), b: f.b.toFixed(3), y: yh.toFixed(1), e: f.rmse.toFixed(1), k, sse: f.sse.toFixed(0), sst: f.sst.toFixed(0), r2: f.r2.toFixed(3), r: f.r.toFixed(3) });
  if (x0 < lo || x0 > hi) txt += ' ' + t('s2extrap', { lo: fmt(lo, 1), hi: fmt(hi, 1) });
  if (std) txt += ' ' + t('s2std', { r: f.r.toFixed(3) });
  $('r2').textContent = txt;
}
function band(ctx, m, a, b, e) {
  ctx.save(); ctx.fillStyle = 'rgba(103,215,249,0.13)'; ctx.beginPath();
  ctx.rect(m.P.l, m.P.t, m.P.r - m.P.l, m.P.b - m.P.t); ctx.clip(); ctx.beginPath();
  ctx.moveTo(m.x(m.xMin), m.y(a + b * m.xMin + e)); ctx.lineTo(m.x(m.xMax), m.y(a + b * m.xMax + e)); ctx.lineTo(m.x(m.xMax), m.y(a + b * m.xMax - e)); ctx.lineTo(m.x(m.xMin), m.y(a + b * m.xMin - e)); ctx.closePath(); ctx.fill(); ctx.restore();
}

/* ---------- step 3: shapes ---------- */
const s3 = { kind: 'line' };
const SHAPE_INFO = { line: { name: 'shapeNameLine', v: 'vLine', x: 'axTempC', y: 'axSales' }, ushape: { name: 'shapeNameU', v: 'vU', x: 'axSpeed', y: 'axFuel' }, saturate: { name: 'shapeNameSat', v: 'vSat', x: 'axFert', y: 'axGain' } };
function draw3() {
  const d = M.shape(s3.kind), f = M.fit(d.x, d.y), res = M.residuals(d), info = SHAPE_INFO[s3.kind];
  $('shapeLine').setAttribute('aria-pressed', s3.kind === 'line'); $('shapeU').setAttribute('aria-pressed', s3.kind === 'ushape'); $('shapeSat').setAttribute('aria-pressed', s3.kind === 'saturate');
  const { ctx, W, H } = fitCanvas($('c3'));
  const pad = (Math.max(...d.x) - Math.min(...d.x)) * 0.04, xLo = Math.min(...d.x) - pad, xHi = Math.max(...d.x) + pad;
  const m = scatterPanel(ctx, W, { top: 26, bottom: 236, xLo, xHi, yLo: Math.min(...d.y), yHi: Math.max(...d.y), title: t('c3a') });
  lineSeg(ctx, m, f.a, f.b, m.xMin, m.xMax, C.cyan, { lw: 2.4 });
  d.x.forEach((x, i) => dot(ctx, m.x(x), m.y(d.y[i]), 3.8, C.text, true));
  const rMax = Math.max(...res.map(Math.abs));
  const R = scatterPanel(ctx, W, { top: 284, bottom: H - 28, xLo, xHi, yLo: -rMax, yHi: rMax, yn: 2, title: t('c3b') });
  hline(ctx, R.P.l, R.P.r, R.y(0), C.ghost);
  ctx.save(); ctx.strokeStyle = C.pink; ctx.lineWidth = 1.6;
  res.forEach((e, i) => { ctx.beginPath(); ctx.moveTo(R.x(d.x[i]), R.y(0)); ctx.lineTo(R.x(d.x[i]), R.y(e)); ctx.stroke(); });
  ctx.restore();
  res.forEach((e, i) => dot(ctx, R.x(d.x[i]), R.y(e), 3, C.pink));
  axes('ax3', [{ c: t('c3a'), x: t(info.x), y: t(info.y) }, { c: t('c3b').split('：')[0].split(':')[0], x: t(info.x), y: t('axRes') }]);
  $('r3').textContent = t('s3readout', { name: t(info.name), r: f.r.toFixed(3), r2: f.r2.toFixed(3), verdict: t(info.v) });
}

/* ---------- step 4: influence ---------- */
function draw4() {
  const k = num('k4'), farY = num('f4'), d = M.practice(farY), full = M.fit(d.x, d.y), inf = M.influence(d);
  $('k4v').textContent = String(k); $('f4v').textContent = String(farY);
  let { ctx, W, H } = fitCanvas($('c4'));
  const m = scatterPanel(ctx, W, { top: 26, bottom: H - 28, xLo: 0, xHi: 21, yLo: 20, yHi: 150, title: t('c4a') });
  lineSeg(ctx, m, full.a, full.b, m.xMin, m.xMax, C.ghost, { lw: 1.8, dash: [6, 4] });
  if (k > 0) { const w = M.without(d, k - 1), fw = M.fit(w.x, w.y); lineSeg(ctx, m, fw.a, fw.b, m.xMin, m.xMax, C.cyan, { lw: 2.4 }); }
  d.x.forEach((x, i) => {
    const out = k === i + 1, col = i === 15 ? C.orange : C.text;
    if (out) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(m.x(x), m.y(d.y[i]), 6, 0, 7); ctx.stroke(); ctx.restore(); }
    else dot(ctx, m.x(x), m.y(d.y[i]), 4.5, col, true);
  });
  ({ ctx, W, H } = fitCanvas($('c4b')));
  const big = Math.max(...inf.map(q => Math.abs(q.db))), Y = niceAxis(-big, big, 2);
  const B = panel(ctx, W, { top: 26, bottom: H - 28, left: 44, xMin: 0.4, xMax: 16.6, yMin: Y.min, yMax: Y.max, yTicks: Y.ticks, xTicks: true, xSteps: [1, 3, 5], minPx: 18, title: t('c4b') });
  hline(ctx, B.P.l, B.P.r, B.y(0), C.axis);
  const bw = Math.max(3, (B.x(1) - B.x(0)) * 0.6);
  inf.forEach((q, i) => { ctx.fillStyle = i + 1 === k ? C.cyan : i === 15 ? C.orange : '#3b5068'; const Y0 = B.y(0), Y1 = B.y(q.db); ctx.fillRect(B.x(i + 1) - bw / 2, Math.min(Y0, Y1), bw, Math.max(1.5, Math.abs(Y1 - Y0))); });
  axes('ax4', [{ c: t('s3lgPts'), x: t('axHours'), y: t('axScore') }, { c: t('c4b').split('：')[0].split(':')[0], x: t('axPoint'), y: t('axDb') }]);
  const rest = M.fit(d.x.slice(0, 15), d.y.slice(0, 15));
  let drop = t('s4none');
  if (k > 0) { const q = inf[k - 1]; drop = t('s4drop', { k, x: fmt(d.x[k - 1], 1), y: d.y[k - 1].toFixed(0), b2: q.b.toFixed(2), r2: q.r.toFixed(2), db: (q.db >= 0 ? '+' : '') + q.db.toFixed(2) }); }
  $('r4').textContent = t('s4readout', { b: full.b.toFixed(2), r: full.r.toFixed(2), p: (rest.a + rest.b * 20).toFixed(0), drop });
}

/* ---------- step 5: confounding ---------- */
const P5 = M.pupils(), F5 = M.pupilsFit(P5);
const ageCol = age => { const q = (age - 6) / 6, c0 = [207, 238, 252], c1 = [47, 135, 181]; return `rgb(${c0.map((v, i) => Math.round(v + (c1[i] - v) * q)).join(',')})`; };
function draw5() {
  const age = num('a5'), all = age < 6;
  $('a5v').textContent = all ? t('ageAll') : t('ageN', { a: age });
  const { ctx, W, H } = fitCanvas($('c5'));
  const m = scatterPanel(ctx, W, { top: 26, bottom: H - 28, xLo: 13.5, xHi: 24.5, yLo: 10, yHi: 110, title: t('c5a') });
  P5.forEach(p => { if (!all && p.age !== age) dot(ctx, m.x(p.foot), m.y(p.read), 2.6, 'rgba(134,150,170,0.22)'); });
  P5.forEach(p => { if (all || p.age === age) dot(ctx, m.x(p.foot), m.y(p.read), all ? 3.4 : 4.4, ageCol(p.age), !all); });
  lineSeg(ctx, m, F5.a, F5.b, m.xMin, m.xMax, C.ghost, { lw: 1.8, dash: [6, 4] });
  let grp = '';
  if (!all) { const g = M.pupilsFit(P5.filter(p => p.age === age)); const gx = P5.filter(p => p.age === age).map(p => p.foot); lineSeg(ctx, m, g.a, g.b, Math.min(...gx) - 0.5, Math.max(...gx) + 0.5, C.orange, { lw: 2.6 }); grp = t('s5grp', { age, r: g.r.toFixed(2), b: g.b.toFixed(2) }); }
  axes('ax5', [{ c: t('c5a').split('（')[0].split(' (')[0], x: t('axFoot'), y: t('axRead') }]);
  $('r5').textContent = t('s5readout', { rall: F5.r.toFixed(2), ball: F5.b.toFixed(2), grp });
}

/* ---------- step 6: regression to the mean ---------- */
function draw6() {
  const rho = num('p6'), R = M.retest(rho), f = R.f;
  $('p6v').textContent = fmt(rho, 2);
  let { ctx, W, H } = fitCanvas($('c6'));
  const m = scatterPanel(ctx, W, { top: 26, bottom: H - 28, xLo: 35, xHi: 105, yLo: 35, yHi: 105, yExact: true, title: t('c6a') });
  const top = new Set(R.top), bot = new Set(R.bottom);
  R.t1.forEach((v, i) => { if (!top.has(i) && !bot.has(i)) dot(ctx, m.x(clamp(v, m)), m.y(clampY(R.t2[i], m)), 2.2, 'rgba(154,170,189,0.45)'); });
  R.t1.forEach((v, i) => { if (top.has(i)) dot(ctx, m.x(clamp(v, m)), m.y(clampY(R.t2[i], m)), 3, C.orange); else if (bot.has(i)) dot(ctx, m.x(clamp(v, m)), m.y(clampY(R.t2[i], m)), 3, C.violet); });
  lineSeg(ctx, m, 0, 1, m.xMin, m.xMax, C.ghost, { lw: 1.5, dash: [5, 4] });
  lineSeg(ctx, m, f.a, f.b, m.xMin, m.xMax, C.cyan, { lw: 2.4 });
  dot(ctx, m.x(R.topM.t1), m.y(R.topM.t2), 7, C.orange, true); dot(ctx, m.x(R.botM.t1), m.y(R.botM.t2), 7, C.violet, true);

  ({ ctx, W, H } = fitCanvas($('c6b')));
  const Y = niceAxis(40, 100, 3);
  const B = panel(ctx, W, { top: 26, bottom: H - 28, left: 44, right: 30, xMin: -0.35, xMax: 1.35, yMin: Y.min, yMax: Y.max, yTicks: Y.ticks, xLabels: [{ v: 0, s: t('tick1') }, { v: 1, s: t('tick2') }], title: t('c6b') });
  const pair = (g, col) => { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(B.x(0), B.y(g.t1)); ctx.lineTo(B.x(1), B.y(g.t2)); ctx.stroke(); ctx.restore(); dot(ctx, B.x(0), B.y(g.t1), 6, col, true); dot(ctx, B.x(1), B.y(g.t2), 6, col, true); };
  pair(R.topM, C.orange); pair(R.all, C.text); pair(R.botM, C.violet);
  axes('ax6', [{ c: t('c6a'), x: t('axT1'), y: t('axT2') }, { c: t('c6b').split('：')[0].split(':')[0], x: t('axTest'), y: t('axScore') }]);
  $('r6').textContent = t('s6readout', { rho: fmt(rho, 2), r: f.r.toFixed(3), b: f.b.toFixed(3), t1: R.topM.t1.toFixed(1), t2: R.topM.t2.toFixed(1), b1: R.botM.t1.toFixed(1), b2: R.botM.t2.toFixed(1), m1: R.all.t1.toFixed(1), m2: R.all.t2.toFixed(1) });
}
const clamp = (v, m) => Math.max(m.xMin, Math.min(m.xMax, v)), clampY = (v, m) => Math.max(m.yMin, Math.min(m.yMax, v));

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); draw6(); }

function setup() {
  [['prodIce', 'ice'], ['prodSoup', 'soup'], ['prodPens', 'pens']].forEach(([id, p]) => $(id).addEventListener('click', () => { s0.prod = p; draw0(); }));
  $('n0').addEventListener('input', draw0);
  $('unit0').addEventListener('click', () => { s0.unitF = !s0.unitF; draw0(); });

  ['b1', 'd1'].forEach(id => $(id).addEventListener('input', draw1));
  $('best1').addEventListener('click', () => { $('b1').value = (Math.round(F1.b * 10) / 10).toFixed(1); $('d1').value = 0; draw1(); });
  $('clear1').addEventListener('click', () => { s1.tried.clear(); draw1(); });

  $('x2').addEventListener('input', draw2);
  $('std2').addEventListener('click', () => { s2.std = !s2.std; draw2(); });

  [['shapeLine', 'line'], ['shapeU', 'ushape'], ['shapeSat', 'saturate']].forEach(([id, k]) => $(id).addEventListener('click', () => { s3.kind = k; draw3(); }));
  ['k4', 'f4'].forEach(id => $(id).addEventListener('input', draw4));
  $('a5').addEventListener('input', draw5);
  $('p6').addEventListener('input', draw6);

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  window.refreshLesson = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
