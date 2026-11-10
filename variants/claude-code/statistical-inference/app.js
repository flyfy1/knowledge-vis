'use strict';
// Statistical inference lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every dot, bar, curve and readout comes from window.SI_MODEL (model.js). Canvas text is limited to
// panel titles and axis ticks laid out in fixed rows; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.SI_MODEL;
const t = (...a) => window.SI_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', soft: '#8696aa' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros only when there is a decimal point; show −0 as 0; use a true minus sign.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s.replace('-', '−'); };
const fix = (v, d) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; return v.toFixed(d).replace('-', '−'); };
const fmtP = p => (p < 0.0001 ? '< 0.0001' : p.toFixed(4));
const pct = v => fmt(v * 100, 0) + '%';

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

// Panel title: shrinks the font until it fits the canvas width.
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
function niceStep(span, px, minPx, steps) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }

// A plot panel: title in its own row above, y tick labels to the left, x tick labels below.
// o: top, bottom, left, right, xMin, xMax, yMin, yMax, yTicks, yFmt, xTicks (bool), xSteps, xFmt, xList (explicit [value, label]), title
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 14), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks || []) {
    ctx.strokeStyle = v === o.yMin ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText((o.yFmt || fmt)(v), P.l - 6, y(v) + 4);
  }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.b); ctx.lineTo(P.r, P.b); ctx.stroke();
  let ticks = [];
  if (o.xList) ticks = o.xList;
  else if (o.xTicks) {
    const step = niceStep(o.xMax - o.xMin, P.r - P.l, o.minPx || 34, o.xSteps || [1, 2, 5, 10, 20, 50]);
    const first = Math.ceil((o.xMin - 1e-9) / step) * step;
    for (let v = first; v <= o.xMax + 1e-9; v += step) ticks.push([v, (o.xFmt || fmt)(v)]);
  }
  ctx.textAlign = 'center';
  for (const [v, lab] of ticks) {
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
    ctx.fillText(lab, x(v), P.b + 15);
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 13, W - 16);
  return { x, y, P };
}
function vline(ctx, X, y0, y1, color, { dash = null, lw = 1.6, alpha = 1 } = {}) {
  ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y1); ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, r, color, ring = false) {
  ctx.save(); ctx.beginPath(); ctx.arc(X, Y, r, 0, 7);
  if (ring) { ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke(); } else { ctx.fillStyle = color; ctx.fill(); }
  ctx.restore();
}
function curve(ctx, pts, color, lw = 2) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.beginPath();
  pts.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y))); ctx.stroke(); ctx.restore();
}

/* ---------- shared animation runner (respects reduced motion and hidden pages) ---------- */
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

// Stack dots in 1 mL bins (dot plots in step 0).
function stackDots(ctx, m, values, color, { r, highlight = -1, hiColor = C.orange } = {}) {
  const bins = new Map();
  values.forEach(v => { const b = Math.round(v); bins.set(b, (bins.get(b) || 0) + 1); });
  const maxStack = Math.max(1, ...bins.values());
  const gap = Math.min(2 * r + 1.5, (m.P.b - m.P.t - r - 4) / maxStack);
  const seen = new Map();
  values.forEach((v, i) => {
    const b = Math.round(v), row = seen.get(b) || 0; seen.set(b, row + 1);
    const X = m.x(v), Y = m.P.b - r - 2 - row * gap;
    if (i === highlight) dot(ctx, X, Y, r + 1.5, hiColor, true); else dot(ctx, X, Y, r, color);
  });
}

/* ---------- step 0: one batch, then many ---------- */
const s0 = { stream: M.batchStream(200), k: 1 };
function draw0() {
  const { ctx, W, H } = fitCanvas($('c0'));
  const rows = s0.stream.slice(0, s0.k), cur = rows[s0.k - 1];
  const opt = { xMin: 474, xMax: 522, yMin: 0, yMax: 1, xTicks: true, xSteps: [2, 4, 5, 10] };
  const top = panel(ctx, W, { ...opt, top: 28, bottom: 140, title: t('c0top') });
  const bot = panel(ctx, W, { ...opt, top: 186, bottom: H - 30, title: t('c0bot') });
  const r = Math.max(2.4, Math.min(4.5, (top.x(1) - top.x(0)) / 2 - 0.5));
  vline(ctx, top.x(M.CLAIM), top.P.t, top.P.b, C.orange, { dash: [5, 4], alpha: 0.8 });
  vline(ctx, bot.x(M.CLAIM), bot.P.t, bot.P.b, C.orange, { dash: [5, 4], alpha: 0.8 });
  stackDots(ctx, top, cur.bottles.map(v => Math.max(474.5, Math.min(521.5, v))), C.soft, { r });
  vline(ctx, top.x(cur.mean), top.P.t, top.P.b, C.orange, { lw: 2.6 });
  stackDots(ctx, bot, rows.map(b => b.mean), C.cyan, { r, highlight: rows.length - 1 });
  // a faint guide shows where the latest batch average lands in the lower row
  vline(ctx, top.x(cur.mean), top.P.b, bot.P.b, C.orange, { dash: [2, 4], alpha: 0.45, lw: 1.2 });
  const means = rows.map(b => b.mean);
  $('r0').textContent = (s0.prog || '') + t('s0readout', {
    k: s0.k, min: fix(Math.min(...cur.bottles), 1), max: fix(Math.max(...cur.bottles), 1), m: fix(cur.mean, 1),
    lo: fix(Math.min(...means), 1), hi: fix(Math.max(...means), 1), below: means.filter(v => v < M.CLAIM).length
  });
  $('draw0').disabled = $('run0').disabled = s0.k >= s0.stream.length;
}

/* ---------- step 1: sampling distribution ---------- */
const s1 = { show: 1000, visited: new Map(), cache: new Map() };
const means1 = n => { if (!s1.cache.has(n)) s1.cache.set(n, M.truthMeans(n)); return s1.cache.get(n); };
function draw1() {
  const n = M.N_OPTIONS[num('n1')], se = M.se(n), all = means1(n), shown = all.slice(0, s1.show);
  $('n1v').textContent = String(n);
  if (s1.show >= all.length) s1.visited.set(n, M.sd(all));
  // left: histogram
  {
    const { ctx, W, H } = fitCanvas($('c1'));
    const m = panel(ctx, W, { top: 36, bottom: H - 28, left: 42, xMin: 486, xMax: 510, yMin: 0, yMax: 0.36, yTicks: [0, 0.1, 0.2, 0.3], yFmt: pct, xTicks: true, xSteps: [2, 4, 6, 12], title: t('c1a') });
    const bins = M.histogram(shown, 486, 510, 0.5);
    ctx.fillStyle = C.raw;
    bins.forEach((c, i) => { if (!c) return; const x0 = m.x(486 + i * 0.5), x1 = m.x(486 + (i + 1) * 0.5), Y = m.y(c / all.length); ctx.fillRect(x0 + 0.5, Y, Math.max(1, x1 - x0 - 1), m.P.b - Y); });
    const pts = []; for (let v = 486; v <= 510.001; v += 0.05) pts.push([m.x(v), m.y(Math.min(0.36, M.normPdf((v - M.MU_TRUE) / se) / se * 0.5))]);
    curve(ctx, pts, C.orange, 2);
    vline(ctx, m.x(M.MU_TRUE), m.P.t, m.P.b, C.green, { lw: 2 });
    vline(ctx, m.x(M.CLAIM), m.P.t, m.P.b, C.orange, { dash: [5, 4], alpha: 0.8 });
  }
  // right: standard deviation of the batch averages vs n
  {
    const { ctx, W, H } = fitCanvas($('c1b'));
    const m = panel(ctx, W, { top: 36, bottom: H - 28, left: 34, xMin: 0, xMax: 105, yMin: 0, yMax: 3.4, yTicks: [0, 1, 2, 3], xTicks: true, xSteps: [25, 50], title: t('c1b') });
    const pts = []; for (let q = 3; q <= 105; q += 0.5) pts.push([m.x(q), m.y(Math.min(3.4, M.SIGMA / Math.sqrt(q)))]);
    curve(ctx, pts, C.orange, 2);
    s1.visited.forEach((s, q) => dot(ctx, m.x(q), m.y(s), 4.5, C.cyan));
    dot(ctx, m.x(n), m.y(se), 7, C.text, true);
  }
  const sh = shown.length ? shown : [M.MU_TRUE];
  const within = shown.filter(v => Math.abs(v - M.MU_TRUE) <= 1.96 * se).length;
  $('r1').textContent = t('s1readout', {
    prog: s1.show < all.length ? t('s1progress', { c: s1.show, N: all.length }) : '',
    n, N: shown.length, mm: fix(M.mean(sh), 2), s: shown.length > 1 ? fix(M.sd(shown), 2) : '—', se: fix(se, 2), w: within, wp: shown.length ? fix(100 * within / shown.length, 1) : '0'
  });
}

/* ---------- step 2: z-score ---------- */
function draw2() {
  const x = num('x2'), n = M.N_OPTIONS[num('n2')], se = M.se(n), z = M.zScore(x, n);
  $('x2v').textContent = fix(x, 1); $('n2v').textContent = String(n);
  const { ctx, W, H } = fitCanvas($('c2'));
  const m = panel(ctx, W, { top: 28, bottom: H - 56, left: 48, right: 18, xMin: 490, xMax: 510, yMin: 0, yMax: 0.7, xTicks: true, xSteps: [1, 2, 5, 10], title: t('c2') });
  // ±2 SE band
  ctx.save(); ctx.fillStyle = 'rgba(126,226,168,.14)'; const b0 = m.x(Math.max(490, 500 - 2 * se)), b1 = m.x(Math.min(510, 500 + 2 * se)); ctx.fillRect(b0, m.P.t, b1 - b0, m.P.b - m.P.t); ctx.restore();
  const pts = []; for (let v = 490; v <= 510.001; v += 0.04) pts.push([m.x(v), m.y(Math.min(0.7, M.normPdf((v - 500) / se) / se))]);
  curve(ctx, pts, C.text, 2);
  vline(ctx, m.x(500), m.P.t, m.P.b, C.soft, { dash: [3, 3] });
  vline(ctx, m.x(x), m.P.t, m.P.b, C.orange, { lw: 2.4 });
  // arrow from 500 to x̄
  if (Math.abs(x - 500) > 0.05) {
    const Y = m.P.t + 14, X0 = m.x(500), X1 = m.x(x), dir = Math.sign(X1 - X0);
    ctx.save(); ctx.strokeStyle = C.orange; ctx.fillStyle = C.orange; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(X0, Y); ctx.lineTo(X1 - dir * 6, Y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(X1, Y); ctx.lineTo(X1 - dir * 8, Y - 5); ctx.lineTo(X1 - dir * 8, Y + 5); ctx.fill(); ctx.restore();
  }
  // second tick row: z units
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  const pxPerZ = (m.x(500 + se) - m.x(500));
  const zs = niceStep(1, pxPerZ, 30, [1, 2, 5, 10, 20]);
  const zMin = (490 - 500) / se, zMax = (510 - 500) / se, Yz = m.P.b + 36;
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(m.P.l, Yz - 12); ctx.lineTo(m.P.r, Yz - 12); ctx.stroke();
  ctx.textAlign = 'center';
  for (let k = Math.ceil(zMin / zs) * zs; k <= zMax + 1e-9; k += zs) {
    const X = m.x(500 + k * se);
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(X, Yz - 12); ctx.lineTo(X, Yz - 8); ctx.stroke();
    ctx.fillText(fmt(k, 0), X, Yz + 3);
  }
  ctx.textAlign = 'left'; ctx.fillStyle = C.soft;
  ctx.fillText(t('unitML'), 6, m.P.b + 15); ctx.fillText(t('unitZ'), 6, Yz + 3);
  ctx.restore();
  // x̄ on the z scale: a marker on the z axis instead of a line through the tick labels
  ctx.save(); ctx.fillStyle = C.orange; const Xz = m.x(x); ctx.beginPath(); ctx.moveTo(Xz, Yz - 12); ctx.lineTo(Xz - 5, Yz - 20); ctx.lineTo(Xz + 5, Yz - 20); ctx.closePath(); ctx.fill(); ctx.restore();
  const d = Math.abs(x - 500);
  const dir = d < 0.05 ? t('dirEq') : t(x < 500 ? 'dirLow' : 'dirHigh', { d: fix(d, 1), az: fix(Math.abs(z), 2) });
  $('r2').textContent = t('s2readout', { x: fix(x, 1), n, se: fix(se, 2), z: fix(z, 2), dir });
}

/* ---------- step 3: p-value, formula and simulation ---------- */
const s3 = { show: 4000, cache: new Map() };
const means3 = n => { if (!s3.cache.has(n)) s3.cache.set(n, M.nullMeans(n)); return s3.cache.get(n); };
function draw3() {
  const x = num('x3'), n = M.N_OPTIONS[num('n3')], se = M.se(n), z = M.zScore(x, n), p = M.pTwo(z);
  $('x3v').textContent = fix(x, 1); $('n3v').textContent = String(n);
  const all = means3(n), shown = all.slice(0, s3.show), d = Math.abs(x - 500);
  const ext = shown.filter(v => Math.abs(v - 500) >= d - 1e-12), mid = shown.filter(v => Math.abs(v - 500) < d - 1e-12);
  const peak = M.normPdf(0) / se * 0.5;
  const ys = niceStep(peak * 1.15, 1, 0.28, [0.01, 0.02, 0.05, 0.1]);
  const yMax = Math.ceil(peak * 1.15 / ys) * ys, yt = []; for (let v = 0; v <= yMax + 1e-9; v += ys) yt.push(v);
  const { ctx, W, H } = fitCanvas($('c3'));
  const m = panel(ctx, W, { top: 36, bottom: H - 28, left: 42, xMin: 488, xMax: 512, yMin: 0, yMax, yTicks: yt, yFmt: pct, xTicks: true, xSteps: [1, 2, 5, 10], title: t('c3') });
  // tails under the curve
  const tail = (a, b) => { if (b <= a) return; ctx.beginPath(); ctx.moveTo(m.x(a), m.y(0)); for (let v = a; v <= b + 1e-9; v += 0.04) ctx.lineTo(m.x(v), m.y(Math.min(yMax, M.normPdf((v - 500) / se) / se * 0.5))); ctx.lineTo(m.x(b), m.y(0)); ctx.closePath(); ctx.fill(); };
  ctx.save(); ctx.fillStyle = 'rgba(255,122,147,.22)'; tail(488, 500 - d); tail(500 + d, 512); ctx.restore();
  // stacked bars: not-extreme (grey) then extreme (pink)
  const bm = M.histogram(mid, 488, 512, 0.5), be = M.histogram(ext, 488, 512, 0.5);
  bm.forEach((c, i) => {
    const x0 = m.x(488 + i * 0.5), x1 = m.x(488 + (i + 1) * 0.5), w = Math.max(1, x1 - x0 - 1);
    const h1 = c / all.length, h2 = be[i] / all.length;
    if (h1) { ctx.fillStyle = C.raw; ctx.fillRect(x0 + 0.5, m.y(Math.min(yMax, h1)), w, m.P.b - m.y(Math.min(yMax, h1))); }
    if (h2) { ctx.fillStyle = C.pink; ctx.fillRect(x0 + 0.5, m.y(Math.min(yMax, h1 + h2)), w, m.y(h1) - m.y(Math.min(yMax, h1 + h2))); }
  });
  const pts = []; for (let v = 488; v <= 512.001; v += 0.04) pts.push([m.x(v), m.y(Math.min(yMax, M.normPdf((v - 500) / se) / se * 0.5))]);
  curve(ctx, pts, C.text, 1.8);
  vline(ctx, m.x(x), m.P.t, m.P.b, C.orange, { lw: 2.4 });
  if (d > 0.05) vline(ctx, m.x(1000 - x), m.P.t, m.P.b, C.orange, { lw: 1.8, dash: [5, 4] });
  const sim = M.simulatedP(x, n, shown.length ? shown : [500]);
  $('r3').textContent = t('s3readout', {
    prog: s3.show < all.length ? t('s3progress', { c: s3.show, N: all.length }) : '',
    z: fix(z, 2), p: fmtP(p), N: shown.length, k: shown.length ? sim.k : 0, d: fix(d, 1), f: shown.length ? fmtP(sim.frac) : '—',
    verdict: s3.show < all.length ? '' : t(p < 0.05 ? 's3sig' : 's3ns')
  });
}

/* ---------- step 4: confidence intervals ---------- */
const s4 = { level: 0.95, sets: 1, rows: 50 };
function draw4() {
  const n = M.N_OPTIONS[num('n4')], se = M.se(n), zs = M.zStar(s4.level), set = M.intervalSet(s4.sets - 1, n, s4.level);
  $('n4v').textContent = String(n);
  document.querySelectorAll('[data-level]').forEach(b => b.setAttribute('aria-pressed', Number(b.dataset.level) === s4.level ? 'true' : 'false'));
  const { ctx, W, H } = fitCanvas($('c4'));
  const m = panel(ctx, W, { top: 28, bottom: H - 104, left: 18, right: 18, xMin: 480, xMax: 516, yMin: 0, yMax: 50, xTicks: true, xSteps: [2, 4, 6, 12], title: t('c4a') });
  vline(ctx, m.x(M.MU_TRUE), m.P.t, m.P.b, C.green, { lw: 2 });
  vline(ctx, m.x(M.CLAIM), m.P.t, m.P.b, C.orange, { dash: [5, 4], alpha: 0.8 });
  const rowH = (m.P.b - m.P.t - 4) / 50;
  set.slice(0, s4.rows).forEach((iv, i) => {
    const Y = m.P.t + 2 + rowH * (i + 0.5), col = iv.cover ? C.cyan : C.pink;
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = Math.max(1.6, Math.min(2.6, rowH * 0.45));
    ctx.beginPath(); ctx.moveTo(m.x(Math.max(480, iv.lo)), Y); ctx.lineTo(m.x(Math.min(516, iv.hi)), Y); ctx.stroke(); ctx.restore();
    dot(ctx, m.x(iv.mean), Y, Math.max(1.6, Math.min(2.6, rowH * 0.38)), C.text);
  });
  // running tally over all sets drawn so far (current set only up to the revealed rows)
  let c = 0, N = 0;
  for (let s = 0; s < s4.sets; s++) {
    const ivs = s === s4.sets - 1 ? set.slice(0, s4.rows) : M.intervalSet(s, n, s4.level);
    ivs.forEach(iv => { N++; if (iv.cover) c++; });
  }
  const frac = N ? c / N : 0;
  const L = 18, R = W - 18, T0 = H - 58, T1 = H - 44;
  title(ctx, t('c4b'), 8, H - 68, W - 16);
  ctx.save(); ctx.fillStyle = C.grid; ctx.fillRect(L, T0, R - L, T1 - T0);
  ctx.fillStyle = C.cyan; ctx.fillRect(L, T0, (R - L) * frac, T1 - T0);
  vline(ctx, L + (R - L) * s4.level, T0 - 5, T1 + 5, C.text, { lw: 2.5 });
  ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  ctx.textAlign = 'left'; ctx.fillText('0%', L, H - 28); ctx.textAlign = 'center'; ctx.fillText('50%', (L + R) / 2, H - 28); ctx.textAlign = 'right'; ctx.fillText('100%', R, H - 28);
  ctx.restore();
  const shown = set.slice(0, s4.rows);
  $('r4').textContent = t('s4readout', {
    s: s4.sets, c: shown.filter(iv => iv.cover).length, m: shown.filter(iv => iv.hasClaim).length,
    h: fix(zs * se, 2), zs: fix(zs, 3), se: fix(se, 2), S: s4.sets, N, cp: fix(100 * frac, 1), lv: fmt(s4.level * 100, 0)
  });
  $('more4').disabled = s4.sets >= 40;
}

/* ---------- step 5: significance vs size ---------- */
function draw5() {
  const mu = num('mu5'), n = M.nFromSlider(num('n5')), ty = M.typical(mu, n), ns = M.nStar(mu);
  $('mu5v').textContent = fix(mu, 1); $('n5v').textContent = String(n);
  const lx = Math.log10, xList = [[1, '10'], [2, '100'], [3, '1000'], [4, '10⁴']];
  {
    const { ctx, W, H } = fitCanvas($('c5'));
    const m = panel(ctx, W, { top: 36, bottom: H - 28, left: 36, xMin: lx(4), xMax: 4, yMin: 490, yMax: 507, yTicks: [490, 495, 500, 505], xList, title: t('c5a') });
    ctx.save(); ctx.fillStyle = 'rgba(103,215,249,.2)'; ctx.beginPath();
    const up = [], dn = [];
    for (let e = lx(4); e <= 4 + 1e-9; e += 0.01) { const q = M.typical(mu, Math.pow(10, e)); up.push([m.x(e), m.y(Math.min(507, q.hi))]); dn.push([m.x(e), m.y(Math.max(490, q.lo))]); }
    up.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y))); dn.reverse().forEach(([X, Y]) => ctx.lineTo(X, Y)); ctx.closePath(); ctx.fill(); ctx.restore();
    curve(ctx, up, C.cyan, 1.2); curve(ctx, dn, C.cyan, 1.2);
    ctx.save(); ctx.strokeStyle = C.green; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(m.P.l, m.y(mu)); ctx.lineTo(m.P.r, m.y(mu)); ctx.stroke();
    ctx.strokeStyle = C.orange; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(m.P.l, m.y(500)); ctx.lineTo(m.P.r, m.y(500)); ctx.stroke(); ctx.restore();
    const X = m.x(lx(n));
    vline(ctx, X, m.P.t, m.P.b, C.soft, { dash: [3, 3] });
    ctx.save(); ctx.strokeStyle = ty.excludes ? C.pink : C.cyan; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(X, m.y(Math.min(507, ty.hi))); ctx.lineTo(X, m.y(Math.max(490, ty.lo))); ctx.stroke(); ctx.restore();
    dot(ctx, X, m.y(mu), 4, C.text);
    if (ns <= 10000) tri(ctx, m.x(lx(ns)), m.P.b);
  }
  {
    const { ctx, W, H } = fitCanvas($('c5b'));
    const yl = { '0': '1', '-1': '0.1', '-2': '0.01', '-3': '0.001', '-4': '10⁻⁴', '-5': '10⁻⁵', '-6': '≤10⁻⁶' };
    const m = panel(ctx, W, { top: 36, bottom: H - 28, left: 48, xMin: lx(4), xMax: 4, yMin: -6, yMax: 0, yTicks: [-6, -5, -4, -3, -2, -1, 0], yFmt: v => yl[String(Math.round(v))], xList, title: t('c5b') });
    ctx.save(); ctx.strokeStyle = C.pink; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(m.P.l, m.y(lx(0.05))); ctx.lineTo(m.P.r, m.y(lx(0.05))); ctx.stroke(); ctx.restore();
    const pts = []; for (let e = lx(4); e <= 4 + 1e-9; e += 0.01) pts.push([m.x(e), m.y(Math.max(-6, lx(Math.max(1e-300, M.typical(mu, Math.pow(10, e)).p))))]);
    curve(ctx, pts, C.text, 2);
    const X = m.x(lx(n));
    vline(ctx, X, m.P.t, m.P.b, C.soft, { dash: [3, 3] });
    dot(ctx, X, m.y(Math.max(-6, lx(Math.max(1e-300, ty.p)))), 5.5, ty.p < 0.05 ? C.pink : C.cyan);
    if (ns <= 10000) tri(ctx, m.x(lx(ns)), m.P.b);
  }
  const d = 500 - mu;
  $('r5').textContent = t('s5readout', {
    mu: fix(mu, 1), d: fix(d, 1), n, lo: fix(ty.lo, 2), hi: fix(ty.hi, 2), p: fmtP(ty.p), verdict: t(ty.p < 0.05 ? 's5sig' : 's5ns'),
    star: Number.isFinite(ns) ? t('s5star', { ns, d: fix(d, 1) }) : t('s5never')
  });
}
function tri(ctx, X, Y) { ctx.save(); ctx.fillStyle = C.violet; ctx.beginPath(); ctx.moveTo(X, Y - 9); ctx.lineTo(X - 6, Y + 1); ctx.lineTo(X + 6, Y + 1); ctx.closePath(); ctx.fill(); ctx.restore(); }

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  $('draw0').addEventListener('click', () => { stopAnim('s0'); s0.prog = ''; s0.k = Math.min(s0.stream.length, s0.k + 1); draw0(); });
  $('run0').addEventListener('click', () => {
    const start = s0.k, end = Math.min(s0.stream.length, start + 20);
    animate('s0', (end - start) * 160, p => {
      s0.k = start + Math.round(p * (end - start));
      s0.prog = p < 1 ? t('s0progress', { c: s0.k - start, N: end - start }) : '';
      draw0();
    });
  });
  $('clear0').addEventListener('click', () => { stopAnim('s0'); s0.prog = ''; s0.k = 1; draw0(); });

  $('n1').addEventListener('input', () => { stopAnim('s1'); s1.show = 1000; draw1(); });
  $('replay1').addEventListener('click', () => { s1.show = 0; draw1(); animate('s1', 3000, p => { s1.show = Math.round(p * 1000); draw1(); }); });

  ['x2', 'n2'].forEach(id => $(id).addEventListener('input', draw2));
  $('x3').addEventListener('input', draw3);
  $('n3').addEventListener('input', () => { stopAnim('s3'); s3.show = 4000; draw3(); });
  $('replay3').addEventListener('click', () => { s3.show = 0; draw3(); animate('s3', 3500, p => { s3.show = Math.round(p * 4000); draw3(); }); });
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked');
    const ok = !!choice && choice.value === 'b';
    $('quizFeedback').textContent = t(ok ? 'correct' : 'wrong');
    $('quizFeedback').style.color = ok ? C.green : C.orange;
    $('quizFeedback').dataset.state = ok ? 'correct' : 'wrong';
  });

  document.querySelectorAll('[data-level]').forEach(b => b.addEventListener('click', () => { s4.level = Number(b.dataset.level); draw4(); }));
  $('n4').addEventListener('input', () => { stopAnim('s4'); s4.sets = 1; s4.rows = 50; draw4(); });
  $('more4').addEventListener('click', () => {
    if (s4.sets >= 40) return;
    stopAnim('s4'); s4.sets++; s4.rows = 0; draw4();
    animate('s4', 1500, p => { s4.rows = Math.round(p * 50); draw4(); });
  });
  $('clear4').addEventListener('click', () => { stopAnim('s4'); s4.sets = 1; s4.rows = 50; draw4(); });

  ['mu5', 'n5'].forEach(id => $(id).addEventListener('input', draw5));

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
  window.refreshInference = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
