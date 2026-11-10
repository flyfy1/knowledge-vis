'use strict';
// Bayes lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every square, area, arrow, curve and readout comes from window.BAYES_MODEL (model.js).
// Canvas text is limited to panel titles and axis ticks; tick labels are placed with a collision check.
(function () {

const $ = id => document.getElementById(id);
const M = window.BAYES_MODEL;
const t = (...a) => window.BAYES_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', ghost: '#8696aa', cell: '#1b2737' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros only after a decimal point (so 90 stays 90); show −0 as 0.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d); return (s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s) || '0'; };
// Percent with enough digits to stay distinguishable from 0% and 100%.
function pct(v) {
  const x = v * 100, c = Math.min(x, 100 - x);
  const d = c >= 1 ? 1 : c >= 0.1 ? 2 : c >= 0.01 ? 3 : c >= 0.001 ? 4 : 5;
  return fmt(x, d) + '%';
}
// Three significant figures, no exponent for the ranges used here.
function sig(v) { if (v === 0) return '0'; const d = Math.max(0, 2 - Math.floor(Math.log10(Math.abs(v)))); return fmt(v, Math.min(6, d)); }
// Odds written as a ratio: 1 : 99 when below 1, 9 : 1 when above.
const ratio = o => (o < 1 ? '1 : ' + sig(1 / o) : sig(o) + ' : 1');
const lrText = v => (v < 1 ? sig(v) : fmt(v, 2));

function fitCanvas(canvas, hOf) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  const height = Math.round(hOf(width));
  canvas.style.height = height + 'px';
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}

// Panel title: shrinks the font until it fits (never overflows).
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
// Tick labels placed in priority order; a label that would touch an already placed one is skipped.
function placeLabels(ctx, items, axis, lo, hi) {
  const taken = [];
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const it of items) {
    const w = ctx.measureText(it.text).width;
    let a, b;
    if (axis === 'x') { a = it.pos - w / 2; b = it.pos + w / 2; if (a < lo) { a = lo; b = lo + w; } if (b > hi) { b = hi; a = hi - w; } }
    else { a = it.pos - 7; b = it.pos + 7; }
    if (taken.some(([p, q]) => a < q + 6 && b > p - 6)) continue;
    taken.push([a, b]);
    if (axis === 'x') { ctx.textAlign = 'left'; ctx.fillText(it.text, a, it.y); }
    else { ctx.textAlign = 'right'; ctx.fillText(it.text, it.x, it.pos + 4); }
  }
  ctx.restore();
}
function niceStep(span, px, minPx, steps) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }

// Generic plot panel: title row above, y ticks on the left, x ticks below.
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1;
  for (const v of o.yTicks) { ctx.strokeStyle = v === o.yMin ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.t); ctx.lineTo(P.l, P.b); ctx.stroke();
  ctx.restore();
  placeLabels(ctx, o.yTicks.map(v => ({ text: (o.yFmt || fmt)(v), pos: y(v), x: P.l - 6 })), 'y');
  if (o.xTicks) {
    const xs = [];
    if (Array.isArray(o.xTicks)) o.xTicks.forEach(v => xs.push(v));
    else { const step = niceStep(o.xMax - o.xMin, P.r - P.l, o.minPx || 34, o.xSteps || [0.1, 0.2, 0.25, 0.5, 1, 2, 5, 10, 20, 25, 50, 100, 200]); for (let v = Math.ceil(o.xMin / step - 1e-9) * step; v <= o.xMax + 1e-9; v += step) xs.push(v); }
    ctx.save(); ctx.strokeStyle = C.grid; xs.forEach(v => { ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke(); }); ctx.restore();
    placeLabels(ctx, xs.map(v => ({ text: (o.xFmt || fmt)(v), pos: x(v), y: P.b + 15 })), 'x', 2, W - 2);
  }
  if (o.title) title(ctx, o.title, 8, P.t - 9, W - 16);
  return { x, y, P };
}
function curve(ctx, m, xs, ys, color, lw = 2, dash = null, alpha = 1) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = alpha; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); xs.forEach((v, i) => { const X = m.x(v), Y = Math.max(m.P.t - 2, m.y(ys[i])); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); }); ctx.stroke(); ctx.restore();
}
function vguide(ctx, X, y0, y1, color = C.orange) {
  ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = 0.55; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y1); ctx.stroke(); ctx.restore();
}
function hline(ctx, m, v, color, dash = [5, 4]) {
  ctx.save(); ctx.strokeStyle = color; ctx.setLineDash(dash); ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(m.P.l, m.y(v)); ctx.lineTo(m.P.r, m.y(v)); ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, r, color, ring = false) { ctx.save(); ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); if (ring) { ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.fillStyle = C.bg; ctx.fill(); ctx.stroke(); } else { ctx.fillStyle = color; ctx.fill(); } ctx.restore(); }
function arrow(ctx, x0, x1, Y, color, lw, alpha = 1) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw;
  ctx.beginPath(); ctx.moveTo(x0, Y); ctx.lineTo(x1, Y); ctx.stroke();
  if (Math.abs(x1 - x0) > 4) { const s = Math.sign(x1 - x0), hs = 4 + lw; ctx.beginPath(); ctx.moveTo(x1, Y); ctx.lineTo(x1 - s * hs * 1.4, Y - hs); ctx.lineTo(x1 - s * hs * 1.4, Y + hs); ctx.closePath(); ctx.fill(); }
  ctx.restore();
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

/* ---------- step 0: 1000 emails ---------- */
const s0 = { only: false };
function draw0() {
  const pctv = num('p0'), c = M.counts(pctv);
  $('p0v').textContent = pctv + '%';
  $('only0').setAttribute('aria-pressed', String(s0.only));
  const COLS = 50, ROWS = 20;
  const lay = W => { const cell = (W - 16) / COLS; return { cell, gTop: 26, gH: ROWS * cell }; };
  const { ctx, W, H } = fitCanvas($('c0'), w => { const L = lay(w); return L.gTop + L.gH + 30 + 10 + 26 + 24; });
  const { cell, gTop, gH } = lay(W);
  title(ctx, t('c0grid'), 8, gTop - 9, W - 16);
  const gap = Math.max(1, cell * 0.16);
  for (let i = 0; i < 1000; i++) {
    const r = Math.floor(i / COLS), q = i % COLS, X = 8 + q * cell, Y = gTop + r * cell;
    const spam = i < c.S, flagged = spam ? i < c.Fs : i < c.S + c.Fh;
    ctx.fillStyle = spam ? C.orange : C.cyan;
    ctx.globalAlpha = flagged ? 1 : (s0.only ? 0.06 : spam ? 0.3 : 0.22);
    ctx.fillRect(X + gap / 2, Y + gap / 2, cell - gap, cell - gap);
  }
  ctx.globalAlpha = 1;
  const bTop = gTop + gH + 40, bH = 26, bx0 = 8, bx1 = W - 8;
  title(ctx, t('c0bar'), 8, bTop - 9, W - 16);
  const split = bx0 + (bx1 - bx0) * c.post;
  ctx.fillStyle = C.orange; ctx.fillRect(bx0, bTop, split - bx0, bH);
  ctx.fillStyle = C.cyan; ctx.fillRect(split, bTop, bx1 - split, bH);
  ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(split, bTop - 4); ctx.lineTo(split, bTop + bH + 4); ctx.stroke();
  placeLabels(ctx, [0, 0.5, 1].map(v => ({ text: fmt(v * 100, 0) + '%', pos: bx0 + (bx1 - bx0) * v, y: bTop + bH + 16 })), 'x', 2, W - 2);
  $('r0').textContent = t('s0readout', { S: c.S, Fs: c.Fs, H: c.H, Fh: c.Fh, F: c.F, post: pct(c.post) });
}

/* ---------- step 1: the mosaic ---------- */
function draw1() {
  const pi = num('p1') / 100, a = num('a1') / 100, b = num('b1') / 100, J = M.joint(pi, a, b);
  $('p1v').textContent = num('p1') + '%'; $('a1v').textContent = num('a1') + '%'; $('b1v').textContent = num('b1') + '%';
  const { ctx, W } = fitCanvas($('c1'), () => 372);
  const m = panel(ctx, W, { top: 26, bottom: 266, xMin: 0, xMax: 1, yMin: 0, yMax: 1, yTicks: [0, 0.5, 1], yFmt: v => fmt(v * 100, 0) + '%', title: t('c1mosaic') });
  const xs = m.x(pi);
  const col = (x0, x1, h, color) => {
    ctx.fillStyle = C.cell; ctx.fillRect(x0, m.y(1), x1 - x0, m.y(0) - m.y(1));
    ctx.fillStyle = color; ctx.globalAlpha = 0.9; ctx.fillRect(x0, m.y(h), x1 - x0, m.y(0) - m.y(h)); ctx.globalAlpha = 1;
  };
  col(m.x(0), xs, a, C.orange); col(xs, m.x(1), b, C.cyan);
  ctx.strokeStyle = C.text; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(xs, m.y(0)); ctx.lineTo(xs, m.y(1)); ctx.stroke();
  // pool bar: the two lit areas end to end, rescaled to total 1
  const bTop = 306, bH = 26, bx0 = m.P.l, bx1 = m.P.r, split = bx0 + (bx1 - bx0) * J.post;
  title(ctx, t('c1pool'), 8, bTop - 9, W - 16);
  ctx.fillStyle = C.orange; ctx.fillRect(bx0, bTop, split - bx0, bH); ctx.fillStyle = C.cyan; ctx.fillRect(split, bTop, bx1 - split, bH);
  ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(split, bTop - 4); ctx.lineTo(split, bTop + bH + 4); ctx.stroke();
  placeLabels(ctx, [0, 0.5, 1].map(v => ({ text: fmt(v * 100, 0) + '%', pos: bx0 + (bx1 - bx0) * v, y: bTop + bH + 16 })), 'x', 2, W - 2);
  $('r1').textContent = t('s1readout', { a: pct(a), A: sig(J.A), B: sig(J.B), post: pct(J.post), gap: fmt(Math.abs(a - J.post) * 100, 1) });
}

/* ---------- step 2: odds and log-odds ---------- */
const s2 = { hist: [] };
const LO = { min: -5.4, max: 5.4 };
const PROB_TICKS = [0.5, 0.01, 0.99, 0.001, 0.999, 0.1, 0.9, 0.00001, 0.99999];
function draw2() {
  const p = M.PRIORS[num('p2')], lr = M.LRS[num('l2')];
  const q = M.prob(M.odds(p) * lr), lp = M.lo10(p), lq = M.lo10(q);
  $('p2v').textContent = pct(p); $('l2v').textContent = lrText(lr);
  const key = num('p2') + ',' + num('l2');
  s2.hist = s2.hist.filter(h => h.key !== key); s2.hist.push({ key, p, lr }); if (s2.hist.length > 7) s2.hist.shift();
  const { ctx, W, H } = fitCanvas($('c2'), () => 440);
  const L = 16, R = W - 16, X = v => L + (Math.max(LO.min, Math.min(LO.max, v)) - LO.min) / (LO.max - LO.min) * (R - L);
  title(ctx, t('c2line'), 8, 17, W - 16);
  const axisY = 112;
  ctx.strokeStyle = C.axis; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(L, axisY); ctx.lineTo(R, axisY); ctx.stroke();
  PROB_TICKS.forEach(v => { ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(X(M.lo10(v)), axisY - 4); ctx.lineTo(X(M.lo10(v)), axisY + 4); ctx.stroke(); });
  placeLabels(ctx, PROB_TICKS.map(v => ({ text: pct(v), pos: X(M.lo10(v)), y: axisY + 17 })), 'x', 2, W - 2);
  // earlier tries: thin arrows stacked above, oldest on top
  const old = s2.hist.slice(0, -1).reverse();
  old.forEach((h, i) => { const a0 = M.lo10(h.p), a1 = M.lo10(M.prob(M.odds(h.p) * h.lr)); arrow(ctx, X(a0), X(a1), 82 - i * 9, h.lr === lr ? C.orange : C.raw, 1.4, 0.55); });
  arrow(ctx, X(lp), X(lq), 96, C.orange, 3);
  dot(ctx, X(lp), 96, 5, C.text); dot(ctx, X(lq), 96, 5, C.cyan);
  vguide(ctx, X(lp), 96, axisY, C.text); vguide(ctx, X(lq), 96, axisY, C.cyan);
  // bottom: posterior vs prior
  const pc = v => fmt(v * 100, 0) + '%';
  const m = panel(ctx, W, { top: 172, bottom: H - 26, xMin: 0, xMax: 1, yMin: 0, yMax: 1, yTicks: [0, 0.5, 1], yFmt: pc, xTicks: [0, 0.25, 0.5, 0.75, 1], xFmt: pc, left: 44, right: 16, title: t('c2curve') });
  const grid = Array.from({ length: 201 }, (_, i) => i / 200);
  curve(ctx, m, grid, grid, C.ghost, 1.3, [5, 4]);
  curve(ctx, m, grid, grid.map(v => M.posterior(v, lr, 1)), C.orange, 2.2);
  s2.hist.forEach(h => { if (h.lr === lr && h.key !== key) dot(ctx, m.x(h.p), m.y(M.prob(M.odds(h.p) * lr)), 3.5, C.text); });
  vguide(ctx, m.x(p), m.y(q), m.y(0), C.text); dot(ctx, m.x(p), m.y(p), 4, C.text); dot(ctx, m.x(p), m.y(q), 6, C.cyan);
  $('r2').textContent = t('s2readout', { p: pct(p), po: ratio(M.odds(p)), lr: lrText(lr), qo: ratio(M.odds(p) * lr), q: pct(q), lp: fmt(lp, 2), lq: fmt(lq, 2), d: fmt(Math.log10(lr), 2) });
}

/* ---------- step 3: chained evidence ---------- */
const s3 = { ids: [], ghost: null, shufSeed: 1, reveal: 1, note: false };
const RANGE_TICKS = [0.0001, 0.001, 0.01, 0.1, 0.5, 0.9, 0.99, 0.999, 0.9999, 0.99999, 0.999999, 0.9999999];
function buildWords() {
  $('wordTable').innerHTML = M.WORDS.map(w => `<div class="wcard"><b data-w="${w.id}"></b><span class="wp" data-w="${w.id}"></span><br><span class="lr${w.lr < 1 ? ' down' : ''}" data-w="${w.id}"></span></div>`).join('');
  $('wordBtns').innerHTML = M.WORDS.map(w => `<button class="btn word" type="button" data-step="3" data-word="${w.id}"></button>`).join('');
  $('wordBtns').querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    if (s3.ids.includes(b.dataset.word)) return;
    s3.ids.push(b.dataset.word); s3.ghost = null; s3.note = false; s3.reveal = 1; stopAnim('s3'); draw3();
  }));
}
function draw3() {
  const p0 = M.PRIORS[num('p3')];
  $('p3v').textContent = pct(p0);
  M.WORDS.forEach(w => {
    $('wordTable').querySelector(`b[data-w="${w.id}"]`).textContent = t('w_' + w.id);
    $('wordTable').querySelector(`.wp[data-w="${w.id}"]`).textContent = t('wcard', { s: fmt(w.s * 100, 1) + '%', h: fmt(w.h * 100, 1) + '%' });
    $('wordTable').querySelector(`.lr[data-w="${w.id}"]`).textContent = t('wlr', { lr: lrText(w.lr) });
    const btn = $('wordBtns').querySelector(`[data-word="${w.id}"]`); btn.textContent = '+ ' + t('w_' + w.id); btn.disabled = s3.ids.includes(w.id);
  });
  $('undo3').disabled = !s3.ids.length; $('shuffle3').disabled = s3.ids.length < 2; $('clear3').disabled = !s3.ids.length;
  const path = M.chain(p0, s3.ids), gpath = s3.ghost ? M.chain(p0, s3.ghost) : null;
  const los = path.map(s => Math.log10(s.odds)).concat(gpath ? gpath.map(s => Math.log10(s.odds)) : []);
  const yMin = Math.min(-2.6, Math.min(...los) - 0.5), yMax = Math.max(2.6, Math.max(...los) + 0.5);
  const { ctx, W, H } = fitCanvas($('c3'), () => 330);
  const ticks = RANGE_TICKS.map(M.lo10).filter(v => v >= yMin && v <= yMax);
  const m = panel(ctx, W, { top: 26, bottom: H - 28, xMin: -0.4, xMax: M.WORDS.length + 0.4, yMin, yMax, yTicks: ticks, yFmt: v => pct(M.fromLo(v)), xTicks: Array.from({ length: M.WORDS.length + 1 }, (_, i) => i), left: 62, right: 14, title: t('c3title') });
  const drawPath = (pp, upTo, ghost) => {
    ctx.save();
    for (let i = 1; i < pp.length && i <= upTo; i++) {
      const a = Math.log10(pp[i - 1].odds), b = Math.log10(pp[i].odds), up = b > a;
      ctx.strokeStyle = ghost ? C.ghost : C.raw; ctx.lineWidth = 1.4; ctx.setLineDash(ghost ? [4, 4] : []);
      ctx.beginPath(); ctx.moveTo(m.x(i - 1), m.y(a)); ctx.lineTo(m.x(i), m.y(a)); ctx.stroke();
      if (ghost) { ctx.beginPath(); ctx.moveTo(m.x(i), m.y(a)); ctx.lineTo(m.x(i), m.y(b)); ctx.stroke(); continue; }
      ctx.setLineDash([]); ctx.strokeStyle = up ? C.orange : C.cyan; ctx.fillStyle = ctx.strokeStyle; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(m.x(i), m.y(a)); ctx.lineTo(m.x(i), m.y(b) + (up ? 7 : -7)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(m.x(i), m.y(b)); ctx.lineTo(m.x(i) - 6, m.y(b) + (up ? 9 : -9)); ctx.lineTo(m.x(i) + 6, m.y(b) + (up ? 9 : -9)); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  };
  if (gpath) drawPath(gpath, gpath.length, true);
  const shown = Math.max(0, Math.round(s3.reveal * s3.ids.length));
  drawPath(path, shown, false);
  dot(ctx, m.x(0), m.y(Math.log10(path[0].odds)), 5, C.text);
  for (let i = 1; i <= shown; i++) dot(ctx, m.x(i), m.y(Math.log10(path[i].odds)), 4, C.text);
  hline(ctx, m, 0, C.axis, [2, 4]);
  const last = path[path.length - 1];
  if (!s3.ids.length) { $('r3').textContent = t('s3empty', { p: pct(p0) }); return; }
  const ledger = ratio(M.odds(p0)) + s3.ids.map(id => ` × ${lrText(M.wordById(id).lr)} (${t('w_' + id)})`).join('') + ' = ' + ratio(last.odds);
  $('r3').textContent = (s3.note ? t('s3shuf') + ' ' : '') + t('s3readout', { ledger, p: pct(last.p), n: s3.ids.length });
}

/* ---------- step 4: grid posterior for an unknown rate ---------- */
const s4 = { n: 0, hist: [] };
function draw4() {
  const n = s4.n, k = M.clicksUpTo(n), dens = M.gridPosterior('flat', n, k), S = M.track('flat')[n];
  const { ctx, W, H } = fitCanvas($('c4'), () => 440);
  const peak = Math.max(1.2, S.peak * 1.12), yStep = niceStep(peak, 150, 26, [0.5, 1, 2, 5, 10, 20]);
  const yt = []; for (let v = 0; v <= peak + 1e-9; v += yStep) yt.push(v);
  const A = panel(ctx, W, { top: 26, bottom: 196, xMin: 0, xMax: 1, yMin: 0, yMax: peak, yTicks: yt, xTicks: true, title: t('c4top') });
  // 90% band under the current curve
  ctx.save(); ctx.fillStyle = 'rgba(103,215,249,0.18)'; ctx.beginPath(); ctx.moveTo(A.x(S.lo), A.y(0));
  M.THETA.forEach((th, i) => { if (th >= S.lo && th <= S.hi) ctx.lineTo(A.x(th), A.y(dens[i])); });
  ctx.lineTo(A.x(S.hi), A.y(0)); ctx.closePath(); ctx.fill(); ctx.restore();
  s4.hist.forEach((hn, i) => { const d = M.gridPosterior('flat', hn, M.clicksUpTo(hn)); curve(ctx, A, M.THETA, d, C.raw, 1.3, null, 0.35 + 0.5 * (i + 1) / s4.hist.length); });
  curve(ctx, A, M.THETA, dens, C.cyan, 2.4);
  vguide(ctx, A.x(M.TRUE_THETA), A.P.t, A.P.b, C.ghost);
  const tr = M.track('flat');
  const B = panel(ctx, W, { top: 240, bottom: H - 26, xMin: 0, xMax: M.NMAX, yMin: 0, yMax: 1, yTicks: [0, 0.5, 1], xTicks: true, title: t('c4bot') });
  hline(ctx, B, M.TRUE_THETA, C.ghost);
  if (n > 0) {
    ctx.save(); ctx.fillStyle = 'rgba(103,215,249,0.28)'; ctx.beginPath();
    for (let i = 0; i <= n; i++) { const X = B.x(i), Y = B.y(tr[i].hi); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); }
    for (let i = n; i >= 0; i--) ctx.lineTo(B.x(i), B.y(tr[i].lo));
    ctx.closePath(); ctx.fill(); ctx.restore();
    curve(ctx, B, tr.slice(0, n + 1).map(s => s.n), tr.slice(0, n + 1).map(s => s.mean), C.cyan, 2);
  }
  dot(ctx, B.x(n), B.y(S.mean), 5, C.cyan);
  vguide(ctx, B.x(n), B.P.t, B.P.b, C.cyan);
  ['add1', 'add10', 'add100'].forEach(id => { $(id).disabled = n >= M.NMAX; });
  if (n === 0) { $('r4').textContent = t('s4zero'); return; }
  $('r4').textContent = t('s4readout', { n, k, m: S.mean.toFixed(3), lo: S.lo.toFixed(3), hi: S.hi.toFixed(3), w: S.width.toFixed(3), ws: (S.width * Math.sqrt(n)).toFixed(2) }) + (n >= M.NMAX ? ' ' + t('s4full') : '');
}
function add4(d) {
  const from = s4.n, to = Math.min(M.NMAX, from + d);
  if (to === from) return;
  s4.hist.push(from); if (s4.hist.length > 8) s4.hist.shift();
  if (d === 1) { s4.n = to; draw4(); return; }
  animate('s4', d === 10 ? 700 : 2200, p => { s4.n = Math.round(from + (to - from) * p); draw4(); });
}

/* ---------- step 5: two priors, same data ---------- */
const s5 = { b: 'low' };
function draw5() {
  const n = num('n5'), k = M.clicksUpTo(n), bs = s5.b;
  $('n5v').textContent = String(n);
  $('bLow').setAttribute('aria-pressed', String(bs === 'low')); $('bCap').setAttribute('aria-pressed', String(bs === 'capped'));
  $('lg5B').textContent = t(bs === 'low' ? 'lg5Blow' : 'lg5Bcap');
  const dA = M.gridPosterior('high', n, k), dB = M.gridPosterior(bs, n, k), pA = M.gridPosterior('high', 0, 0), pB = M.gridPosterior(bs, 0, 0);
  const tA = M.track('high'), tB = M.track(bs);
  const { ctx, W, H } = fitCanvas($('c5'), () => 440);
  const peak = Math.max(...dA, ...dB, ...pA, ...pB) * 1.1, yStep = niceStep(peak, 150, 26, [1, 2, 5, 10, 20, 50, 100]);
  const yt = []; for (let v = 0; v <= peak + 1e-9; v += yStep) yt.push(v);
  const A = panel(ctx, W, { top: 26, bottom: 196, xMin: 0, xMax: 1, yMin: 0, yMax: peak, yTicks: yt, xTicks: true, title: t('c5top') });
  vguide(ctx, A.x(M.TRUE_THETA), A.P.t, A.P.b, C.ghost);
  curve(ctx, A, M.THETA, pA, C.orange, 1.4, [5, 4], 0.7); curve(ctx, A, M.THETA, pB, C.cyan, 1.4, [5, 4], 0.7);
  curve(ctx, A, M.THETA, dA, C.orange, 2.4); curve(ctx, A, M.THETA, dB, C.cyan, 2.4);
  const B = panel(ctx, W, { top: 240, bottom: H - 26, xMin: 0, xMax: M.NMAX, yMin: 0, yMax: 1, yTicks: [0, 0.5, 1], xTicks: true, title: t('c5bot') });
  hline(ctx, B, M.TRUE_THETA, C.ghost);
  if (bs === 'capped') hline(ctx, B, 0.2, C.cyan, [2, 5]);
  const ns = tA.slice(0, n + 1).map(s => s.n);
  curve(ctx, B, ns, tA.slice(0, n + 1).map(s => s.mean), C.orange, 2); curve(ctx, B, ns, tB.slice(0, n + 1).map(s => s.mean), C.cyan, 2);
  dot(ctx, B.x(n), B.y(tA[n].mean), 5, C.orange); dot(ctx, B.x(n), B.y(tB[n].mean), 5, C.cyan);
  vguide(ctx, B.x(n), B.P.t, B.P.b, C.text);
  $('r5').textContent = t('s5readout', { n, k, a: tA[n].mean.toFixed(3), b: tB[n].mean.toFixed(3), gap: Math.abs(tA[n].mean - tB[n].mean).toFixed(3) }) + (bs === 'capped' ? ' ' + t('s5capNote') : '');
}

const quiz = { state: null };
function paintQuiz() {
  if (!quiz.state) return;
  $('quizFeedback').textContent = t(quiz.state);
  $('quizFeedback').style.color = quiz.state === 'correct' ? C.green : C.orange;
}
function refresh() { paintQuiz(); draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  buildWords();
  $('p0').addEventListener('input', draw0);
  $('only0').addEventListener('click', () => { s0.only = !s0.only; draw0(); });
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked');
    quiz.state = !!choice && choice.value === 'c' ? 'correct' : 'wrong'; paintQuiz();
  });
  ['p1', 'a1', 'b1'].forEach(id => $(id).addEventListener('input', draw1));
  ['p2', 'l2'].forEach(id => $(id).addEventListener('input', draw2));
  $('clear2').addEventListener('click', () => { s2.hist = []; draw2(); });
  $('p3').addEventListener('input', () => { stopAnim('s3'); s3.reveal = 1; draw3(); });
  $('undo3').addEventListener('click', () => { stopAnim('s3'); s3.ids.pop(); s3.ghost = null; s3.note = false; s3.reveal = 1; draw3(); });
  $('clear3').addEventListener('click', () => { stopAnim('s3'); s3.ids = []; s3.ghost = null; s3.note = false; s3.reveal = 1; draw3(); });
  $('shuffle3').addEventListener('click', () => {
    if (s3.ids.length < 2) return;
    const old = s3.ids.slice(); let next = old;
    for (let tries = 0; tries < 20 && next.join() === old.join(); tries++) next = M.shuffled(old, s3.shufSeed++);
    s3.ghost = old; s3.ids = next; s3.note = true;
    animate('s3', 300 * next.length, p => { s3.reveal = p; draw3(); });
  });
  $('add1').addEventListener('click', () => { finishAll(); add4(1); });
  $('add10').addEventListener('click', () => { finishAll(); add4(10); });
  $('add100').addEventListener('click', () => { finishAll(); add4(100); });
  $('reset4').addEventListener('click', () => { stopAnim('s4'); s4.n = 0; s4.hist = []; draw4(); });
  $('n5').addEventListener('input', () => { stopAnim('s5'); draw5(); });
  $('bLow').addEventListener('click', () => { s5.b = 'low'; draw5(); });
  $('bCap').addEventListener('click', () => { s5.b = 'capped'; draw5(); });
  $('play5').addEventListener('click', () => { animate('s5', 6000, p => { $('n5').value = Math.round(p * M.NMAX); draw5(); }); });

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
  window.refreshBayes = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
