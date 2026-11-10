'use strict';
// Risk pooling lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every mark and readout comes from window.POOL_MODEL (model.js). Canvas text is limited to panel
// titles and axis ticks laid out in fixed slots; legends, axis names and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.POOL_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', ghost: '#8696aa', grey: '#4a5a6e' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Fixed decimals, then trim trailing zeros only when there is a decimal point (so 90 stays 90).
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; };
const money = (v, d = 1) => (Number.isFinite(v) ? t('moneyFmt', { v: fmt(v, d) }) : '—');
const pct = (v, d = 1) => fmt(100 * v, d) + '%';
// Probabilities as percentages with two significant digits for small values.
const pctP = v => { const x = 100 * v; if (x <= 0) return '0%'; const d = x >= 10 ? 1 : x >= 1 ? 2 : Math.min(8, 1 - Math.floor(Math.log10(x))); return fmt(x, d) + '%'; };
const POW = ['1', '10', '100', '1000', '10⁴', '10⁵'];

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
    for (const q of o.xLabels) { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(q.v), P.b); ctx.lineTo(x(q.v), P.b + 4); ctx.stroke(); xText(q.s, x(q.v)); }
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
function hline(ctx, m, v, color, dash = [5, 4], lw = 1.6) { const Y = m.y(v); if (Y < m.P.t - 0.5 || Y > m.P.b + 0.5) return; ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(m.P.l, Y); ctx.lineTo(m.P.r, Y); ctx.stroke(); ctx.restore(); }
function vline(ctx, X, y0, y1, color, dash = [4, 4], lw = 1.6) { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y1); ctx.stroke(); ctx.restore(); }
function dot(ctx, X, Y, r, color, ring) { ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); if (ring) { ctx.strokeStyle = ring === true ? C.bg : ring; ctx.lineWidth = 1.5; ctx.stroke(); } ctx.restore(); }
function curve(ctx, m, f, x0, x1, color, { lw = 2, dash = null, n = 200 } = {}) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.beginPath();
  ctx.rect(m.P.l, m.P.t, m.P.r - m.P.l, m.P.b - m.P.t); ctx.clip(); ctx.beginPath();
  for (let i = 0; i <= n; i++) { const v = x0 + (x1 - x0) * i / n, Y = m.y(f(v)); if (!i) ctx.moveTo(m.x(v), Y); else ctx.lineTo(m.x(v), Y); }
  ctx.stroke(); ctx.restore();
}
function poly(ctx, m, pts, color, { lw = 2, dash = null } = {}) {
  ctx.save(); ctx.rect(m.P.l, m.P.t, m.P.r - m.P.l, m.P.b - m.P.t); ctx.clip();
  ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.beginPath();
  pts.forEach(([a, b], i) => { if (!i) ctx.moveTo(m.x(a), m.y(b)); else ctx.lineTo(m.x(a), m.y(b)); });
  ctx.stroke(); ctx.restore();
}
function niceMax(v) { const steps = [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.8, 1]; for (const s of steps) if (v <= s) return s; return 1; }
function niceUp(v) { const b = Math.pow(10, Math.floor(Math.log10(v))); for (const k of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (v <= k * b + 1e-9) return k * b; return 10 * b; }
const MONEY_STEPS = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 2500, 5000];
function setAxes(id, rows) { $(id).textContent = rows.map(([c, x, y]) => t('axesFmt', { c: t(c), x: t(x), y: t(y) })).join(' '); }

/* ---------- shared animation runner (respects reduced motion and hidden pages) ---------- */
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

/* ---------- step 0: share the bill ---------- */
const s0 = { seed: 7 };
function draw0() {
  const n = M.SHARE_N[num('n0')], p = num('p0') / 100, d = M.shareYears(n, p, s0.seed);
  $('n0v').textContent = String(n); $('p0v').textContent = pct(p, 1);
  const { ctx, W, H } = fitCanvas($('c0'));
  const yMax = 1000;
  const A = panel(ctx, W, { top: 30, bottom: H - 28, left: 44, right: 14, xMin: 0.3, xMax: M.YEARS + 0.7, yMin: 0, yMax, yTicks: [0, 250, 500, 750, 1000], yFmt: v => String(v), xLabels: [1, 10, 20, 30, 40].map(v => ({ v, s: String(v) })), title: t('c0a') });
  const bw = Math.max(2, (A.x(1) - A.x(0)) * 0.7);
  d.cost.forEach((v, i) => {
    if (v <= 0) return;
    const clipped = v > yMax, Y = A.y(Math.min(v, yMax));
    ctx.fillStyle = clipped ? C.pink : C.cyan; ctx.fillRect(A.x(i + 1) - bw / 2, Y, bw, A.P.b - Y);
    if (clipped) { ctx.fillStyle = C.bg; ctx.fillRect(A.x(i + 1) - bw / 2 - 1, A.P.t + 6, bw + 2, 3); }
  });
  hline(ctx, A, p * M.L, C.orange);
  setAxes('ax0', [['c0a', 'axYear', 'axCost']]);
  $('r0').textContent = t('s0readout', { n, yl: d.k.filter(k => k > 0).length, avg: money(M.mean(d.cost)), exp: money(p * M.L), max: money(Math.max(...d.cost)), sd: money(M.sd(d.cost)), sdth: money(M.theorySd(n, p)) });
}

/* ---------- step 1: the square-root law ---------- */
function histogram(cost, n, xMax, px) {
  const unit = M.L / n, target = niceStep(xMax, px, 7, [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500]);
  const w = Math.max(unit, target), bins = new Map();
  cost.forEach(v => { const j = Math.round(v / w); bins.set(j, (bins.get(j) || 0) + 1); });
  return { w, bins };
}
function draw1() {
  const n = M.LAW_N[num('n1')], run = M.lawRun(n), p = M.P1;
  $('n1v').textContent = String(n);
  let { ctx, W, H } = fitCanvas($('c1'));
  const A = panel(ctx, W, { top: 30, bottom: H - 28, left: 46, right: 16, xMin: -0.2, xMax: 4.2, yMin: 5, yMax: 2000, logY: true, yTicks: [10, 100, 1000], yFmt: v => String(v), xLabels: [0, 1, 2, 3, 4].map(v => ({ v, s: POW[v] })), title: t('c1a') });
  curve(ctx, A, lx => M.theorySd(Math.pow(10, lx), p), -0.2, 4.2, C.text, { lw: 1.8 });
  M.LAW_N.forEach(q => { const r = M.lawRun(q); if (q !== n) dot(ctx, A.x(Math.log10(q)), A.y(Math.max(5, r.sd)), 4, C.cyan, true); });
  dot(ctx, A.x(Math.log10(n)), A.y(Math.max(5, run.sd)), 7, C.cyan, C.text);

  ({ ctx, W, H } = fitCanvas($('c1b')));
  const xMax = niceUp(Math.max(300, Math.max(...run.cost) * 1.05));
  const P0 = { l: 44, r: W - 16 };
  const h = histogram(run.cost, n, xMax, P0.r - P0.l);
  let fMax = 0; h.bins.forEach(c => { fMax = Math.max(fMax, c / M.LAW_YEARS); });
  const yMax = niceMax(fMax * 1.1);
  const B = panel(ctx, W, { top: 30, bottom: H - 28, left: 44, right: 16, xMin: -h.w * 0.6, xMax: xMax + h.w * 0.6, yMin: 0, yMax, yTicks: [0, yMax / 2, yMax], yFmt: v => fmt(v, 3), xTicks: true, xSteps: MONEY_STEPS, minPx: 46, xFmt: v => fmt(v, 0), title: t('c1b') });
  const bw = Math.max(2, (B.x(h.w) - B.x(0)) * 0.8);
  ctx.fillStyle = C.cyan; h.bins.forEach((c, j) => { const Y = B.y(c / M.LAW_YEARS); ctx.fillRect(B.x(j * h.w) - bw / 2, Y, bw, B.P.b - Y); });
  vline(ctx, B.x(p * M.L), B.P.t, B.P.b, C.orange, [5, 4], 1.8);
  setAxes('ax1', [['c1a', 'axN', 'axSd'], ['c1b', 'axCost', 'axFreq']]);
  $('r1').textContent = t('s1readout', { n, m: money(run.mean), sd: money(run.sd), th: money(M.theorySd(n, p)), bad: pctP(M.badYear(n, p)) });
}

/* ---------- step 2: pricing for a target ruin probability ---------- */
const loadCache = new Map();
function load(n, eps) { const key = n + ':' + eps; if (!loadCache.has(key)) loadCache.set(key, M.loading(n, M.P2, eps)); return loadCache.get(key); }
function draw2() {
  const n = M.LOAD_N[num('n2')], ei = num('e2'), eps = M.EPS[ei], p = M.P2, Ld = load(n, eps);
  $('n2v').textContent = String(n); $('e2v').textContent = t('epsName' + ei);
  let { ctx, W, H } = fitCanvas($('c2'));
  const mu = n * p, s = Math.sqrt(mu * (1 - p));
  const kLo = Math.max(0, Math.floor(mu - 4.5 * s)), kHi = Math.max(Ld.k + 2, Math.ceil(mu + 5.5 * s), 4);
  let pMax = 0; for (let k = kLo; k <= kHi; k++) pMax = Math.max(pMax, M.binomPmf(k, n, p));
  const yMax = niceMax(pMax * 1.1);
  const A = panel(ctx, W, { top: 30, bottom: H - 28, left: 46, right: 16, xMin: kLo - 0.6, xMax: kHi + 0.6, yMin: 0, yMax, yTicks: [0, yMax / 2, yMax], yFmt: v => fmt(v, 3), xTicks: true, xSteps: [1, 2, 5, 10, 20, 25, 50, 100], minPx: 34, xFmt: v => fmt(v, 0), title: t('c2a') });
  const bw = Math.max(1.2, (A.x(1) - A.x(0)) * 0.75);
  for (let k = kLo; k <= kHi; k++) { const v = M.binomPmf(k, n, p); if (v <= 0) continue; const Y = A.y(v); ctx.fillStyle = k > Ld.k ? C.pink : C.cyan; ctx.fillRect(A.x(k) - bw / 2, Y, bw, Math.max(1, A.P.b - Y)); }
  vline(ctx, A.x(Ld.k + 0.5), A.P.t, A.P.b, C.orange, [5, 4], 2);

  ({ ctx, W, H } = fitCanvas($('c2b')));
  const B = panel(ctx, W, { top: 30, bottom: H - 28, left: 50, right: 16, xMin: 0.85, xMax: 5.15, yMin: 0.02, yMax: 40, logY: true, yTicks: [0.1, 1, 10], yFmt: v => fmt(v * 100, 0) + '%', xLabels: [1, 2, 3, 4, 5].map(v => ({ v, s: POW[v] })), title: t('c2b') });
  M.EPS.forEach((e, i) => { if (i !== ei) poly(ctx, B, M.LOAD_N.map(q => [Math.log10(q), load(q, e).theta]), C.ghost, { lw: 1.2 }); });
  curve(ctx, B, lx => M.loadingNormal(Math.pow(10, lx), p, eps), 0.85, 5.15, C.ghost, { lw: 1.6, dash: [5, 4] });
  poly(ctx, B, M.LOAD_N.map(q => [Math.log10(q), load(q, eps).theta]), C.text, { lw: 2.6 });
  M.LOAD_N.forEach(q => dot(ctx, B.x(Math.log10(q)), B.y(load(q, eps).theta), 2.6, C.text));
  dot(ctx, B.x(Math.log10(n)), B.y(Ld.theta), 6.5, C.cyan, C.text);
  setAxes('ax2', [['c2a', 'axK', 'axProb'], ['c2b', 'axN', 'axTheta']]);
  $('r2').textContent = t('s2readout', { n, eps: t('epsName' + ei), k: Ld.k, mean: fmt(mu, 1), prem: money(Ld.premium), theta: pct(Ld.theta, 1), ruin: pctP(Ld.ruin), norm: pct(M.loadingNormal(n, p, eps), 1) });
}

/* ---------- step 3: storm years ---------- */
const s3 = { seed: 2 };
function draw3() {
  const p1 = num('p3') / 100, q = num('q3') / 100, ys = M.stormYears(p1, q, s3.seed);
  $('p3v').textContent = pct(p1, 1); $('q3v').textContent = pct(q, 0);
  let { ctx, W, H } = fitCanvas($('c3'));
  const top = Math.max(...ys.map(o => o.cost)), yMax = [200, 500, 1000, 1500].find(v => v >= top * 1.08) || 1500;
  const A = panel(ctx, W, { top: 30, bottom: H - 28, left: 44, right: 14, xMin: 0.3, xMax: M.YEARS + 0.7, yMin: 0, yMax, yTicks: [0, yMax / 2, yMax], yFmt: v => String(v), xLabels: [1, 10, 20, 30, 40].map(v => ({ v, s: String(v) })), title: t('c3a') });
  const bw = Math.max(2, (A.x(1) - A.x(0)) * 0.7);
  ys.forEach((o, i) => { const Y = A.y(Math.min(o.cost, yMax)); ctx.fillStyle = o.storm ? C.orange : C.cyan; ctx.fillRect(A.x(i + 1) - bw / 2, Y, bw, A.P.b - Y); });

  ({ ctx, W, H } = fitCanvas($('c3b')));
  const B = panel(ctx, W, { top: 30, bottom: H - 28, left: 46, right: 16, xMin: 0.85, xMax: 5.15, yMin: 1, yMax: 2000, logY: true, yTicks: [1, 10, 100, 1000], yFmt: v => String(v), xLabels: [1, 2, 3, 4, 5].map(v => ({ v, s: POW[v] })), title: t('c3b') });
  const floor = M.stormFloor(p1, q);
  if (floor >= 1) hline(ctx, B, floor, C.ghost, [5, 4], 1.4);
  curve(ctx, B, lx => M.indepSd(Math.pow(10, lx), p1, q), 0.85, 5.15, C.cyan, { lw: 2, dash: [6, 4] });
  curve(ctx, B, lx => M.stormSd(Math.pow(10, lx), p1, q), 0.85, 5.15, C.orange, { lw: 2.6 });
  const X = B.x(Math.log10(M.N3));
  dot(ctx, X, B.y(M.indepSd(M.N3, p1, q)), 5, C.cyan, true); dot(ctx, X, B.y(M.stormSd(M.N3, p1, q)), 5.5, C.orange, true);
  setAxes('ax3', [['c3a', 'axYear', 'axCost'], ['c3b', 'axN', 'axSd']]);
  const within = (1 - q) * M.P0 * (1 - M.P0) + q * p1 * (1 - p1), common = (p1 - M.P0) * (p1 - M.P0) * q * (1 - q);
  const nstar = common > 1e-12 ? t('s3nstar', { n: Number((within / common).toPrecision(2)) }) : t('s3nofloor');
  $('r3').textContent = t('s3readout', { p1: pct(p1, 1), q: pct(q, 0), pbar: pct(M.pBar(p1, q), 2), sd: money(M.stormSd(M.N3, p1, q)), ind: money(M.indepSd(M.N3, p1, q)), floor: money(floor), nstar, ns: ys.filter(o => o.storm).length });
}

/* ---------- step 4: adverse selection ---------- */
const s4 = { k: 0 };
const spiralCache = new Map();
const mNow = () => Math.round(num('m4') * 10) / 10;
function rounds4() { const m = mNow(); if (!spiralCache.has(m)) spiralCache.set(m, M.spiral(m)); return spiralCache.get(m); }
function draw4() {
  const m = mNow(), R = rounds4(), last = R.length - 1, k = Math.min(s4.k, last), cur = R[k];
  $('m4v').textContent = pct(m, 0);
  const inPool = pi => k === 0 || M.stays(pi, R[k - 1].premium, m);
  let { ctx, W, H } = fitCanvas($('c4'));
  const lo = Math.log10(M.PMIN), hi = Math.log10(M.PMAX), pad = 0.06;
  const A = panel(ctx, W, { top: 30, bottom: H - 28, left: 48, right: 16, xMin: lo - pad, xMax: hi + pad, yMin: 10, yMax: 10000, logY: true, yTicks: [10, 100, 1000, 10000], yFmt: v => String(v), xLabels: [0.002, 0.005, 0.01, 0.02, 0.05, 0.08].map(v => ({ v: Math.log10(v), s: fmt(v * 100, 1) + '%' })), title: t('c4a') });
  curve(ctx, A, lx => Math.pow(10, lx) * M.L, lo - pad, hi + pad, C.ghost, { lw: 1.4, dash: [5, 4] });
  M.RISKS.forEach((pi, i) => { if (i % 10 !== 5) return; dot(ctx, A.x(Math.log10(pi)), A.y((1 + m) * pi * M.L), 3, inPool(pi) ? C.cyan : C.grey); });
  if (Number.isFinite(cur.premium)) hline(ctx, A, cur.premium, C.orange, [], 2.4);

  ({ ctx, W, H } = fitCanvas($('c4b')));
  const nR = Math.max(5, last), mid = Math.round(H / 2);
  const pMax = niceUp(Math.max(...R.filter(o => Number.isFinite(o.premium)).map(o => o.premium)) * 1.1);
  const xl = Array.from({ length: nR + 1 }, (_, i) => ({ v: i, s: String(i) })).filter(o => nR <= 12 || o.v % 2 === 0);
  const B = panel(ctx, W, { top: 30, bottom: mid - 26, left: 46, right: 16, xMin: -0.6, xMax: nR + 0.6, yMin: 0, yMax: pMax, yTicks: [0, pMax / 2, pMax], yFmt: v => fmt(v, 0), xLabels: xl, title: t('axPrem') });
  const D = panel(ctx, W, { top: mid + 24, bottom: H - 28, left: 46, right: 16, xMin: -0.6, xMax: nR + 0.6, yMin: 0, yMax: 1, yTicks: [0, 0.5, 1], yFmt: v => pct(v, 0), xLabels: xl, title: t('axShare') });
  const bw = Math.max(3, (B.x(1) - B.x(0)) * 0.6);
  for (let i = 0; i <= k; i++) {
    const o = R[i], col = i === k ? C.orange : C.cyan;
    if (Number.isFinite(o.premium)) { const Y = B.y(o.premium); ctx.fillStyle = col; ctx.fillRect(B.x(i) - bw / 2, Y, bw, B.P.b - Y); }
    const Y2 = D.y(o.share); ctx.fillStyle = col; ctx.fillRect(D.x(i) - bw / 2, Y2, bw, Math.max(1, D.P.b - Y2));
  }
  setAxes('ax4', [['c4a', 'axRisk', 'axWtp'], ['c4b', 'axRound', 'axPremShare']]);
  const state = k < last ? t('s4going') : cur.share === 0 ? t('s4empty') : t('s4stable');
  $('r4').textContent = t('s4readout', { k, prem: money(cur.premium, 0), share: fmt(100 * cur.share, 1), mp: Number.isFinite(cur.meanP) ? pct(cur.meanP, 2) : '—', state });
  $('r4b').textContent = t('s4rated', { m: pct(m, 0), share: fmt(100 * M.ratedShare(m), 1) });
  $('next4').disabled = k >= last; $('run4').disabled = k >= last; $('reset4').disabled = k === 0;
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); }

function setup() {
  ['n0', 'p0'].forEach(id => $(id).addEventListener('input', draw0));
  $('reroll0').addEventListener('click', () => { s0.seed++; draw0(); });
  $('n1').addEventListener('input', draw1);
  ['n2', 'e2'].forEach(id => $(id).addEventListener('input', draw2));
  ['p3', 'q3'].forEach(id => $(id).addEventListener('input', draw3));
  $('reroll3').addEventListener('click', () => { s3.seed++; draw3(); });
  $('m4').addEventListener('input', () => { stopAnim('s4'); s4.k = 0; draw4(); });
  $('next4').addEventListener('click', () => { stopAnim('s4'); s4.k = Math.min(s4.k + 1, rounds4().length - 1); draw4(); });
  $('reset4').addEventListener('click', () => { stopAnim('s4'); s4.k = 0; draw4(); });
  $('run4').addEventListener('click', () => {
    const start = s4.k, last = rounds4().length - 1;
    if (start >= last) return;
    animate('s4', 650 * (last - start), p => { s4.k = start + Math.round(p * (last - start)); draw4(); });
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
