'use strict';
// Interest rates & bonds lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every bar, curve and readout comes from window.BOND_MODEL (model.js). Canvas text is limited to
// panel titles (own row) and axis ticks / row labels in the margins; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.BOND_MODEL;
const t = (...a) => window.BOND_I18N.t(...a);
const C = { cyan: '#67d7f9', cyan2: '#3fa9cc', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', ghost: '#8696aa' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros only after a decimal point (toFixed(0) "90" stays "90"); show −0 as 0.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d); return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s; };
const sgn = (v, d = 2) => { const s = fmt(Math.abs(v), d); return s === '0' ? '0' : (v > 0 ? '+' : '−') + s; };
const pct = v => fmt(v * 100, 2);

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

// Panel title: shrinks the font until it fits the canvas width (never overflows).
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 7);
  ctx.fillText(text, X, Y); ctx.restore();
}
function niceStep(span, px, minPx, steps) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }

// A plot panel: title in its own row above, y ticks left of the plot, x ticks below.
// opts: top, bottom, left, right, xMin, xMax, yMin, yMax, yTicks, xTicks, xSteps, minPx, xFmt, yFmt, tickGap, title
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  const xF = o.xFmt || (v => fmt(v)), yF = o.yFmt || (v => fmt(v));
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks || []) {
    ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(yF(v), P.l - 6, y(v) + 4);
  }
  if (o.xTicks) {
    const step = niceStep(o.xMax - o.xMin, P.r - P.l, o.minPx || 30, o.xSteps || [1, 2, 5, 10]);
    const first = Math.ceil((o.xMin - 1e-9) / step) * step;
    ctx.textAlign = 'center';
    for (let v = first; v <= o.xMax + 1e-9; v += step) {
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
      ctx.fillText(xF(v), x(v), P.b + (o.tickGap || 15));
    }
  }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.b); ctx.lineTo(P.r, P.b); ctx.stroke();
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 9, W - 16);
  return { x, y, P };
}
function niceTicks(lo, hi, count = 4) {
  const raw = (hi - lo) / count, mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map(s => s * mag).find(s => s >= raw);
  const out = []; for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(Math.round(v * 1e6) / 1e6);
  return { step, ticks: out, lo: Math.floor(lo / step) * step, hi: Math.ceil(hi / step) * step };
}
function dashLine(ctx, X0, Y0, X1, Y1, color, dash = [5, 4], lw = 1.3) {
  ctx.save(); ctx.strokeStyle = color; ctx.setLineDash(dash); ctx.lineWidth = lw;
  ctx.beginPath(); ctx.moveTo(X0, Y0); ctx.lineTo(X1, Y1); ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, color, r = 5, hollow = false) {
  ctx.save(); ctx.beginPath(); ctx.arc(X, Y, r, 0, 7);
  if (hollow) { ctx.fillStyle = C.bg; ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke(); }
  else { ctx.fillStyle = color; ctx.fill(); ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5; ctx.stroke(); }
  ctx.restore();
}
function curve(ctx, m, f, x0, x1, color, lw = 2, steps = 200, dash = null, alpha = 1) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = alpha; if (dash) ctx.setLineDash(dash);
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) { const v = x0 + (x1 - x0) * i / steps, X = m.x(v), Y = m.y(f(v)); if (!i) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
  ctx.stroke(); ctx.restore();
}
// Year bars: outline = contract amount, solid = present value.
function yearBars(ctx, m, rows, colorOf, bw) {
  rows.forEach(q => {
    const X = m.x(q.t) - bw / 2, col = colorOf(q);
    ctx.save();
    ctx.fillStyle = col; ctx.globalAlpha = 0.9;
    const Yv = m.y(q.pv); ctx.fillRect(X, Yv, bw, m.y(0) - Yv);
    ctx.globalAlpha = 1; ctx.strokeStyle = C.ghost; ctx.setLineDash([3, 3]); ctx.lineWidth = 1.2;
    const Ya = m.y(q.amount); ctx.strokeRect(X - 1.5, Ya, bw + 3, m.y(0) - Ya);
    ctx.restore();
  });
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

const bond = () => ({ c: num('cpn') / 100, n: num('yrs') });

/* ---------- step 0: the bond as a stream of promised cash ---------- */
function draw0() {
  const { c, n } = bond();
  $('c0v').textContent = fmt(c * 100, 1) + '%'; $('n0v').textContent = String(n);
  const { ctx, W, H } = fitCanvas($('c0'));
  const m = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0.3, xMax: 10.7, yMin: 0, yMax: 115, yTicks: [0, 25, 50, 75, 100], xTicks: true, xSteps: [1, 2], minPx: 22, title: t('c0') });
  const bw = Math.min(34, (m.x(1) - m.x(0)) * 0.6);
  M.cashflows(c, n).forEach(q => {
    const X = m.x(q.t) - bw / 2;
    if (q.principal) { ctx.fillStyle = C.orange; ctx.fillRect(X, m.y(q.principal), bw, m.y(0) - m.y(q.principal)); }
    if (q.coupon > 0) { const y0 = m.y(q.principal), y1 = m.y(q.principal + q.coupon); ctx.fillStyle = C.cyan; ctx.fillRect(X, y1, bw, Math.max(1.5, y0 - y1)); }
  });
  const cpn = fmt(c * 100, 2);
  $('r0').textContent = t('s0readout', { c: fmt(c * 100, 1), n, cpn, total: fmt(M.totalCash(c, n), 2) });
}

/* ---------- step 1: discounting one future 100 ---------- */
const s1 = { tried: [] };
function draw1() {
  const r = num('r1') / 100, tt = num('t1');
  $('r1v').textContent = fmt(r * 100, 1) + '%'; $('t1v').textContent = String(tt);
  const { ctx, W, H } = fitCanvas($('c1'));
  const m = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 30, yMin: 0, yMax: 105, yTicks: [0, 25, 50, 75, 100], xTicks: true, xSteps: [5, 10], minPx: 30, title: t('c1') });
  s1.tried.forEach(q => { if (Math.abs(q - r) > 1e-9) curve(ctx, m, v => M.pv(100, q, v), 0, 30, C.ghost, 1.3, 120, [4, 4], 0.75); });
  curve(ctx, m, v => M.pv(100, r, v), 0, 30, C.cyan, 2.4);
  const v = M.pv(100, r, tt);
  dashLine(ctx, m.P.l, m.y(v), m.x(tt), m.y(v), C.text, [3, 4], 1);
  dashLine(ctx, m.x(tt), m.y(v), m.x(tt), m.P.b, C.text, [3, 4], 1);
  dot(ctx, m.x(tt), m.y(v), C.text, 5.5);
  const others = s1.tried.filter(q => Math.abs(q - r) > 1e-9).slice(-8).sort((a, b) => a - b).map(q => fmt(q * 100, 1) + '%');
  $('rd1').textContent = t('s1readout', { r: fmt(r * 100, 1), t: tt, d: M.df(r, tt).toFixed(4), pv: v.toFixed(2), back: M.grow(v, r, tt).toFixed(2), tried: others.length ? t('s1tried', { list: others.join(', ') }) : '' });
}
function markTried1() { const r = num('r1') / 100; s1.tried = s1.tried.filter(q => Math.abs(q - r) > 1e-9); s1.tried.push(r); }

/* ---------- step 2: price = sum of present values ---------- */
const s2 = { tried: new Set() };
function draw2() {
  const { c, n } = bond(), r = num('r2') / 100;
  $('r2v').textContent = fmt(r * 100, 2) + '%';
  s2.tried.add(r.toFixed(4));
  const rows = M.pvFlows(c, n, r), P = M.price(c, n, r);
  const { ctx, W, H } = fitCanvas($('c2'));
  // Each payment as a share of its contract amount (the discount factor), so small coupons stay visible.
  const A = panel(ctx, W, { top: 26, bottom: 170, xMin: 0.3, xMax: 10.7, yMin: 0, yMax: 108, yTicks: [0, 50, 100], xTicks: true, xSteps: [1, 2], minPx: 22, yFmt: v => fmt(v) + '%', title: t('c2a') });
  yearBars(ctx, A, rows.filter(q => q.amount > 0).map(q => ({ t: q.t, amount: 100, pv: 100 * q.pv / q.amount })), q => (q.t === n ? C.orange : C.cyan), Math.min(30, (A.x(1) - A.x(0)) * 0.56));

  const pMax = M.price(c, n, 0), pMin = M.price(c, n, 0.12);
  const xMaxB = Math.max(120, Math.ceil(pMax / 20) * 20);
  const B = panel(ctx, W, { top: 216, bottom: 250, xMin: 0, xMax: xMaxB, yMin: 0, yMax: 1, yTicks: [], xTicks: true, xSteps: [20, 40, 50, 100], minPx: 34, title: t('c2b') });
  let acc = 0;
  rows.forEach((q, i) => {
    const X0 = B.x(acc), X1 = B.x(acc + q.pv);
    ctx.fillStyle = q.t === n ? C.orange : (i % 2 ? C.cyan2 : C.cyan);
    ctx.fillRect(X0, B.P.t + 4, Math.max(0.8, X1 - X0), B.P.b - B.P.t - 8);
    ctx.strokeStyle = C.bg; ctx.lineWidth = 1; ctx.strokeRect(X0, B.P.t + 4, X1 - X0, B.P.b - B.P.t - 8);
    acc += q.pv;
  });
  dashLine(ctx, B.x(100), B.P.t - 2, B.x(100), B.P.b + 2, C.text, [4, 3], 1.6);

  const yt = niceTicks(Math.min(pMin, 100) - 5, Math.max(pMax, 100) + 5, 4);
  const Cp = panel(ctx, W, { top: 300, bottom: H - 26, left: 44, xMin: 0, xMax: 12, yMin: yt.lo, yMax: yt.hi, yTicks: yt.ticks, xTicks: true, xSteps: [1, 2, 3, 4, 6], minPx: 34, xFmt: v => fmt(v) + '%', title: t('c2c') });
  dashLine(ctx, Cp.P.l, Cp.y(100), Cp.P.r, Cp.y(100), C.ghost, [5, 4], 1.2);
  if (c <= 0.12) dashLine(ctx, Cp.x(c * 100), Cp.P.t, Cp.x(c * 100), Cp.P.b, C.ghost, [2, 4], 1);
  curve(ctx, Cp, v => M.price(c, n, v / 100), 0, 12, C.cyan, 2.2);
  [...s2.tried].forEach(k => { const q = Number(k); if (Math.abs(q - r) > 1e-9) dot(ctx, Cp.x(q * 100), Cp.y(M.price(c, n, q)), C.text, 3); });
  dot(ctx, Cp.x(r * 100), Cp.y(P), C.green, 6);

  const pvs = rows.map(q => q.pv.toFixed(2));
  const terms = n <= 4 ? pvs.join(' + ') : `${pvs[0]} + ${pvs[1]} + … + ${pvs[n - 1]}${t('s2more', { n })}`;
  const gap = P - 100;
  const verdict = Math.abs(gap) < 0.005 ? t('s2par') : gap < 0 ? t('s2discount', { gap: fmt(-gap, 2), c: fmt(c * 100, 1) }) : t('s2premium', { gap: fmt(gap, 2), c: fmt(c * 100, 1) });
  $('rd2').textContent = t('s2bond', { c: fmt(c * 100, 1), n }) + t('s2readout', { r: fmt(r * 100, 2), terms, p: P.toFixed(2), verdict });
}

/* ---------- step 3: the market pushes the old bond's price to the new rate ---------- */
const O = M.OLD, S = M.SEARCH;
const s3 = { ask: 100, trail: [], round: 0 };
const yCache = {};
function yieldAt(P) { const k = P.toFixed(3); if (!(k in yCache)) yCache[k] = M.ytm(O.c, O.n, P); return yCache[k]; }
function verdict3(y, rn) { return Math.abs(y - rn) < 5e-5 ? 'fair' : y > rn ? 'cheap' : 'dear'; }
function draw3() {
  const rn = num('rn3') / 100, ask = s3.ask, fair = M.price(O.c, O.n, rn), y = yieldAt(ask);
  $('rn3v').textContent = fmt(rn * 100, 2) + '%'; $('p3v').textContent = fmt(ask, 2);
  const { ctx, W, H } = fitCanvas($('c3'));
  const A = panel(ctx, W, { top: 26, bottom: 250, xMin: S.lo, xMax: S.hi, yMin: 0, yMax: 11, yTicks: [0, 2, 4, 6, 8, 10], xTicks: true, xSteps: [5, 10, 15, 25], minPx: 34, yFmt: v => fmt(v) + '%', title: t('c3a') });
  dashLine(ctx, A.x(fair), A.P.t, A.x(fair), A.P.b, C.ghost, [3, 4], 1);
  ctx.save(); ctx.strokeStyle = C.pink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(A.P.l, A.y(rn * 100)); ctx.lineTo(A.P.r, A.y(rn * 100)); ctx.stroke(); ctx.restore();
  curve(ctx, A, P => yieldAt(P) * 100, S.lo, S.hi, C.cyan, 2.2, 150);
  s3.trail.forEach((q, i) => dot(ctx, A.x(q.price), A.y(q.y * 100), C.orange, i === s3.trail.length - 1 ? 5 : 3.5, true));
  dashLine(ctx, A.x(ask), A.y(y * 100), A.x(ask), A.P.b, C.text, [3, 4], 1);
  dot(ctx, A.x(ask), A.y(y * 100), C.text, 6);

  const sf = M.shortfall(O.c, O.n, rn), extra = rn < O.c;
  const B = panel(ctx, W, { top: 300, bottom: H - 26, xMin: 0.3, xMax: 10.7, yMin: 0, yMax: 4.5, yTicks: [0, 1, 2, 3, 4], xTicks: true, xSteps: [1, 2], minPx: 22, title: t('c3b') });
  yearBars(ctx, B, sf.rows.map(q => ({ t: q.t, amount: Math.abs(q.gap), pv: Math.abs(q.pv) })), () => (extra ? C.green : C.orange), Math.min(30, (B.x(1) - B.x(0)) * 0.56));

  const v = verdict3(y, rn);
  const prog = s3.round && s3.round < S.rounds ? t('s3progress', { k: s3.round, N: S.rounds }) : '';
  const gap = fmt(Math.abs(rn - O.c) * 100, 2), sfs = Math.abs(sf.total).toFixed(2);
  const fairLine = Math.abs(rn - O.c) < 1e-12 ? t('s3same', { fair: fair.toFixed(2) }) : extra ? t('s3above', { fair: fair.toFixed(2), sf: sfs, gap }) : t('s3below', { fair: fair.toFixed(2), sf: sfs, gap });
  $('rd3').textContent = prog + t('s3readout', { p: fmt(ask, 2), y: (y * 100).toFixed(2), rn: (rn * 100).toFixed(2), verdict: t(v === 'fair' ? 's3fair' : v === 'cheap' ? 's3cheap' : 's3dear'), market: fairLine });
}
function runSearch3() {
  const rn = num('rn3') / 100, trace = M.marketSearch(O.c, O.n, rn, S.lo, S.hi, S.rounds);
  s3.trail = []; s3.round = 0;
  animate('s3', S.rounds * 550, p => {
    const k = Math.min(S.rounds, Math.floor(p * S.rounds) + 1);
    s3.round = k; s3.trail = trace.slice(0, k); s3.ask = trace[k - 1].price; $('p3').value = s3.ask;
    if (p >= 1) s3.round = S.rounds;
    draw3();
  });
}

/* ---------- step 4: maturity sets the sensitivity ---------- */
const MC = { 2: C.green, 10: C.cyan, 30: C.orange };
function draw4() {
  const r = num('r4') / 100, { c, r0 } = M.CMP;
  $('r4v').textContent = fmt(r * 100, 2) + '%';
  const { ctx, W, H } = fitCanvas($('c4'));
  const A = panel(ctx, W, { top: 26, bottom: 290, left: 44, xMin: 1, xMax: 8, yMin: 40, yMax: 190, yTicks: [50, 100, 150], xTicks: true, xSteps: [1, 2], minPx: 34, xFmt: v => fmt(v) + '%', title: t('c4a') });
  dashLine(ctx, A.P.l, A.y(100), A.P.r, A.y(100), C.ghost, [5, 4], 1.1);
  dashLine(ctx, A.x(r0 * 100), A.P.t, A.x(r0 * 100), A.P.b, C.ghost, [2, 4], 1);
  dashLine(ctx, A.x(r * 100), A.P.t, A.x(r * 100), A.P.b, C.text, [3, 4], 1);
  M.MATS.forEach(n => curve(ctx, A, v => M.price(c, n, v / 100), 1, 8, MC[n], 2.2, 140));
  dot(ctx, A.x(r0 * 100), A.y(100), C.text, 5);
  M.MATS.forEach(n => dot(ctx, A.x(r * 100), A.y(M.price(c, n, r)), MC[n], 5.5));

  const B = panel(ctx, W, { top: 330, bottom: H - 26, left: 52, right: 24, xMin: -50, xMax: 80, yMin: 0, yMax: 3, yTicks: [], xTicks: true, xSteps: [10, 20, 25, 50], minPx: 36, xFmt: v => (v > 0 ? '+' : '') + fmt(v) + '%', title: t('c4b') });
  ctx.save(); ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(B.x(0), B.P.t); ctx.lineTo(B.x(0), B.P.b); ctx.stroke();
  ctx.font = '11px system-ui,sans-serif'; ctx.textAlign = 'right'; ctx.fillStyle = C.muted;
  M.MATS.forEach((n, i) => {
    const yc = B.y(2.5 - i), d = M.pctChange(c, n, r0, r), bh = Math.min(22, (B.P.b - B.P.t) / 3 * 0.6);
    ctx.fillStyle = MC[n]; const X0 = B.x(0), X1 = B.x(Math.max(-50, Math.min(80, d)));
    ctx.fillRect(Math.min(X0, X1), yc - bh / 2, Math.max(1.5, Math.abs(X1 - X0)), bh);
    ctx.fillStyle = C.muted; ctx.fillText(t('yrShort', { n }), B.P.l - 6, yc + 4);
  });
  ctx.restore();
  const p = n => M.price(c, n, r), d = n => sgn(M.pctChange(c, n, r0, r)) + '%';
  $('rd4').textContent = t('s4readout', { r: fmt(r * 100, 2), p2: p(2).toFixed(2), d2: d(2), p10: p(10).toFixed(2), d10: d(10), p30: p(30).toFixed(2), d30: d(30) });
}
function quizNumbers() {
  const { c, r0 } = M.CMP;
  return { d: fmt(-M.pctChange(c, 30, r0, r0 + 0.01), 2), up: fmt(M.pctChange(c, 30, r0, r0 - 0.01), 2) };
}
function drawQuiz() {
  const q = quizNumbers();
  $('quizPrompt').textContent = t('quizPrompt', q); $('quizA').textContent = t('quizA', q); $('quizB').textContent = t('quizB', q); $('quizC').textContent = t('quizC', q);
  const st = $('quizFeedback').dataset.state;
  if (st) $('quizFeedback').textContent = t(st === 'correct' ? 'correct' : 'wrong', q);
}

/* ---------- step 5: duration as a balance point ---------- */
function draw5() {
  const c = num('c5c') / 100, n = num('n5'), r = M.R5;
  $('c5v').textContent = fmt(c * 100, 1) + '%'; $('n5v').textContent = String(n);
  const rows = M.pvFlows(c, n, r), D = M.duration(c, n, r);
  const { ctx, W, H } = fitCanvas($('c5'));
  const A = panel(ctx, W, { top: 26, bottom: 210, xMin: 0, xMax: 30.8, yMin: 0, yMax: 110, yTicks: [0, 50, 100], xTicks: true, xSteps: [5, 10], minPx: 30, tickGap: 28, title: t('c5a') });
  const bw = Math.max(2, Math.min(16, (A.x(1) - A.x(0)) * 0.62));
  rows.forEach(q => { ctx.fillStyle = q.t === n ? C.orange : C.cyan; const Y = A.y(q.pv); ctx.fillRect(A.x(q.t) - bw / 2, Y, bw, Math.max(1, A.P.b - Y)); });
  // the beam and its fulcrum (below the axis, above the tick labels)
  ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(A.x(0), A.P.b); ctx.lineTo(A.x(n) + bw / 2 + 2, A.P.b); ctx.stroke();
  ctx.fillStyle = C.text; ctx.beginPath(); ctx.moveTo(A.x(D), A.P.b + 2); ctx.lineTo(A.x(D) - 7, A.P.b + 14); ctx.lineTo(A.x(D) + 7, A.P.b + 14); ctx.closePath(); ctx.fill(); ctx.restore();
  dashLine(ctx, A.x(D), A.P.t, A.x(D), A.P.b, C.text, [3, 4], 1);

  const B = panel(ctx, W, { top: 270, bottom: H - 26, xMin: 0, xMax: 30.8, yMin: 0, yMax: 31, yTicks: [0, 10, 20, 30], xTicks: true, xSteps: [5, 10], minPx: 30, title: t('c5b') });
  dashLine(ctx, B.x(0), B.y(0), B.x(30), B.y(30), C.ghost, [5, 4], 1.4);
  ctx.save(); ctx.strokeStyle = C.green; ctx.lineWidth = 2.2; ctx.beginPath();
  for (let k = 1; k <= 30; k++) { const X = B.x(k), Y = B.y(M.duration(c, k, r)); if (k === 1) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
  ctx.stroke(); ctx.restore();
  dashLine(ctx, B.x(n), B.y(D), B.x(n), B.P.b, C.text, [3, 4], 1);
  dot(ctx, B.x(n), B.y(D), C.text, 5.5);

  $('rd5').textContent = t('s5readout', { c: fmt(c * 100, 1), n, D: D.toFixed(2),
    a1: sgn(M.approxPct(c, n, r, 0.01)), e1: sgn(M.pctChange(c, n, r, r + 0.01)), a2: sgn(M.approxPct(c, n, r, -0.01)), e2: sgn(M.pctChange(c, n, r, r - 0.01)) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); drawQuiz(); draw5(); }

function setup() {
  ['cpn', 'yrs'].forEach(id => $(id).addEventListener('input', () => { s2.tried.clear(); draw0(); draw2(); }));
  ['r1', 't1'].forEach(id => $(id).addEventListener('input', () => { markTried1(); draw1(); }));
  markTried1();
  $('r2').addEventListener('input', draw2);
  $('rn3').addEventListener('input', () => { stopAnim('s3'); s3.trail = []; s3.round = 0; draw3(); });
  $('p3').addEventListener('input', () => { stopAnim('s3'); s3.round = 0; s3.ask = num('p3'); draw3(); });
  $('search3').addEventListener('click', runSearch3);
  $('r4').addEventListener('input', () => { stopAnim('s4'); draw4(); });
  $('sweep4').addEventListener('click', () => {
    const lo = 1, hi = 8, st = 0.25;
    animate('s4', 4200, p => { $('r4').value = (Math.round((lo + p * (hi - lo)) / st) * st).toFixed(2); draw4(); });
  });
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked');
    const ok = !!choice && choice.value === 'b';
    $('quizFeedback').dataset.state = ok ? 'correct' : 'wrong';
    $('quizFeedback').style.color = ok ? C.green : C.orange;
    drawQuiz();
  });
  ['c5c', 'n5'].forEach(id => $(id).addEventListener('input', draw5));

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
  window.refreshBonds = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
