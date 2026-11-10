'use strict';
// Enzymes lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, count and readout comes from window.ENZ_MODEL (model.js). Canvas text is limited to panel
// titles and axis ticks on fixed rows; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.ENZ_MODEL;
const t = (...a) => window.ENZ_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', yellow: '#ffe26a', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', xs: '#9fb4cc', ghost: '#8696aa', enz: '#5f7894' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros only after a decimal point (90 stays 90).
const fmt = (v, d = 1) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d); return s.indexOf('.') >= 0 ? s.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') : s; };
// Significant-figure formatting for readouts spanning many orders of magnitude.
function sig(v, n = 2) {
  if (v === 0) return '0';
  const e = Math.floor(Math.log10(Math.abs(v)));
  if (e >= -2 && e < 4) return fmt(v, Math.max(0, n - 1 - e));
  const m = v / Math.pow(10, e), sup = String(e).split('').map(c => '⁰¹²³⁴⁵⁶⁷⁸⁹'['0123456789'.indexOf(c)] || '⁻').join('');
  return fmt(m, n - 1) + ' × 10' + sup;
}
const dur = sec => { const u = M.timeUnit(sec); return t('u_' + u.unit, { v: sig(u.v, 2) }); };

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
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
// Plot panel with y ticks on the left and x ticks below; ticks given as [value, label] or values.
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  (o.yTicks || []).forEach(v => {
    ctx.strokeStyle = v === o.yMin ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(o.yFmt ? o.yFmt(v) : fmt(v, 2), P.l - 6, y(v) + 4);
  });
  ctx.textAlign = 'center';
  (o.xTicks || []).forEach(tk => {
    const [v, s] = Array.isArray(tk) ? tk : [tk, fmt(tk, 2)];
    ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
    ctx.fillText(s, x(v), P.b + 15);
  });
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 10, W - 16);
  return { x, y, P };
}
// x ticks spaced at least minPx apart
function ticks(xMin, xMax, px, steps, minPx = 34) {
  const step = steps.find(s => s / (xMax - xMin) * px >= minPx) || steps[steps.length - 1];
  const out = []; for (let v = Math.ceil(xMin / step - 1e-9) * step; v <= xMax + 1e-9; v += step) out.push(+v.toFixed(6));
  return out;
}
function curve(ctx, m, f, x0, x1, color, lw = 2, dash = null, n = 200) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.beginPath();
  for (let i = 0; i <= n; i++) { const v = x0 + (x1 - x0) * i / n, X = m.x(v), Y = m.y(f(v)); if (!i) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
  ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, r, color, ring = false) {
  ctx.save(); ctx.beginPath(); ctx.arc(X, Y, r, 0, 7);
  if (ring) { ctx.fillStyle = C.bg; ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke(); } else { ctx.fillStyle = color; ctx.fill(); }
  ctx.restore();
}
function hline(ctx, m, v, color, dash = [5, 4]) { ctx.save(); ctx.strokeStyle = color; ctx.setLineDash(dash); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(m.P.l, m.y(v)); ctx.lineTo(m.P.r, m.y(v)); ctx.stroke(); ctx.restore(); }
function vline(ctx, X, y0, y1, color, dash = [4, 4], lw = 1.4) { ctx.save(); ctx.strokeStyle = color; ctx.setLineDash(dash); ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y1); ctx.stroke(); ctx.restore(); }

/* ---------- glyphs: substrate shapes and enzyme icons ---------- */
function shapePath(ctx, shape, X, Y, s) {
  ctx.beginPath();
  if (shape === 'square') ctx.rect(X - s / 2, Y - s / 2, s, s);
  else if (shape === 'circle') ctx.arc(X, Y, s / 2, 0, 7);
  else { ctx.moveTo(X, Y - s / 2); ctx.lineTo(X + s / 2, Y + s / 2); ctx.lineTo(X - s / 2, Y + s / 2); ctx.closePath(); }
}
// Enzyme body with a square pocket in its top edge; `skew` deforms the pocket (non-competitive inhibitor).
function enzyme(ctx, X, Y, w, h, pocket, color = C.enz, skew = 0) {
  ctx.save(); ctx.fillStyle = color; ctx.beginPath();
  const l = X - w / 2, r = X + w / 2, tp = Y - h / 2, b = Y + h / 2, p = pocket / 2;
  ctx.moveTo(l + 8, tp); ctx.lineTo(X - p, tp); ctx.lineTo(X - p + skew, tp + pocket); ctx.lineTo(X + p + skew, tp + pocket); ctx.lineTo(X + p, tp);
  ctx.lineTo(r - 8, tp); ctx.quadraticCurveTo(r, tp, r, tp + 8); ctx.lineTo(r, b - 8); ctx.quadraticCurveTo(r, b, r - 8, b);
  ctx.lineTo(l + 8, b); ctx.quadraticCurveTo(l, b, l, b - 8); ctx.lineTo(l, tp + 8); ctx.quadraticCurveTo(l, tp, l + 8, tp);
  ctx.fill(); ctx.restore();
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
function stopAnim(name) { if (anims[name]) { const a = anims[name]; cancelAnimationFrame(a.id); delete anims[name]; a.frame(1); if (a.done) a.done(); } }
function finishAll() { Object.keys(anims).forEach(stopAnim); }

/* ---------- step 0: how much faster ---------- */
function draw0() {
  const e0 = num('ea0'), d = Math.min(num('dea0'), e0 - 20), e1 = e0 - d, dG = -30;
  $('ea0v').textContent = String(e0); $('dea0v').textContent = String(num('dea0'));
  const { ctx, W, H } = fitCanvas($('c0'));
  const A = panel(ctx, W, { top: 30, bottom: 200, xMin: 0, xMax: 1, yMin: -40, yMax: 140, yTicks: [-40, 0, 40, 80, 120], yFmt: v => String(v), title: t('c0a') });
  curve(ctx, A, x => M.profile(x, e0, dG), 0, 1, C.orange, 2.4);
  curve(ctx, A, x => M.profile(x, e1, dG), 0, 1, C.cyan, 2.4);
  // barrier heights as vertical guides at the peak
  vline(ctx, A.x(0.5) - 6, A.y(0), A.y(M.profile(0.5, e0, dG)), C.orange, [3, 3], 1.2);
  vline(ctx, A.x(0.5) + 6, A.y(0), A.y(M.profile(0.5, e1, dG)), C.cyan, [3, 3], 1.2);
  // log half-life bars
  const t0 = M.halfLife(e0), t1 = M.halfLife(e1);
  const B = panel(ctx, W, { top: 252, bottom: H - 30, xMin: -10, xMax: 10, yMin: 0, yMax: 2, yTicks: [], left: 16, right: 16, title: t('c0b') });
  const tk = [[-9, t('tk_ns')], [-6, t('tk_us')], [-3, t('tk_ms')], [0, t('tk_s')], [Math.log10(3600), t('tk_h')], [Math.log10(3.15576e7), t('tk_y')]];
  // drop labels that would collide (keep the 1 s anchor)
  ctx.save(); ctx.font = '11px system-ui,sans-serif';
  const keep = []; let lastR = -1e9;
  tk.forEach(([v, s]) => { const w = ctx.measureText(s).width, X = B.x(v); if (X - w / 2 > lastR + 6) { keep.push([v, s]); lastR = X + w / 2; } });
  ctx.restore();
  ctx.save(); ctx.strokeStyle = C.grid; for (let v = -9; v <= 9; v += 3) { ctx.beginPath(); ctx.moveTo(B.x(v), B.P.t); ctx.lineTo(B.x(v), B.P.b); ctx.stroke(); } ctx.restore();
  panel(ctx, W, { top: 252, bottom: H - 30, xMin: -10, xMax: 10, yMin: 0, yMax: 2, yTicks: [], left: 16, right: 16, xTicks: keep });
  const bar = (v, row, col) => { const lv = Math.max(-10, Math.min(10, Math.log10(v))), Y = B.y(row + 0.5); ctx.fillStyle = col; ctx.fillRect(B.x(-10), Y - 9, B.x(lv) - B.x(-10), 18); };
  bar(t0, 1, C.orange); bar(t1, 0, C.cyan);
  $('r0').textContent = t('s0readout', { e0, e1, t0: dur(t0), t1: dur(t1), x: sig(M.speedUp(d), 2) });
}

/* ---------- step 1: one shape only ---------- */
const s1 = { shape: 'square', sent: { square: 0, circle: 0, triangle: 0 }, tried: new Set(['square']), cur: null };
const SHAPE_COL = { square: C.cyan, circle: C.pink, triangle: C.violet };
const SHAPE_BTN = { square: 'shapeSquare', circle: 'shapeCircle', triangle: 'shapeTriangle' };
function draw1() {
  Object.keys(SHAPE_BTN).forEach(k => $(SHAPE_BTN[k]).setAttribute('aria-pressed', k === s1.shape ? 'true' : 'false'));
  const { ctx, W, H } = fitCanvas($('c1'));
  title(ctx, t('c1a'), 8, 20, W - 16);
  // scene: enzyme in the middle, substrate falling in from above
  const ex = W / 2, ey = 136, ew = Math.min(190, W * 0.46), eh = 64, pk = 28, pocketY = ey - eh / 2 + pk / 2;
  enzyme(ctx, ex, ey, ew, eh, pk);
  const fits = M.encounters(s1.shape, 1).fits, ph = s1.cur;
  if (ph !== null) {
    ctx.save(); ctx.fillStyle = C.orange;
    if (fits) {
      if (ph < 0.65) { const Y = ph < 0.4 ? 40 + (pocketY - 40) * ph / 0.4 : pocketY; shapePath(ctx, s1.shape, ex, Y, pk - 4); ctx.fill(); if (ph >= 0.4) { ctx.strokeStyle = C.yellow; ctx.lineWidth = 2; ctx.stroke(); } }
      else { const q = (ph - 0.65) / 0.35, hs = (pk - 4) / 2; ctx.fillStyle = C.green; ctx.fillRect(ex - hs - q * 60 - 1, pocketY - hs - q * 70, hs, pk - 4); ctx.fillRect(ex + 1 + q * 60, pocketY - hs - q * 70, hs, pk - 4); }
    } else {
      const stopY = pocketY - pk; const Y = ph < 0.45 ? 40 + (stopY - 40) * ph / 0.45 : stopY - (ph - 0.45) / 0.55 * 70;
      const X = ph < 0.45 ? ex : ex - (ph - 0.45) / 0.55 * 90; ctx.globalAlpha = ph < 0.45 ? 1 : 1 - (ph - 0.45) / 0.55 * 0.8;
      shapePath(ctx, s1.shape, X, Y, pk - 2); ctx.fill();
    }
    ctx.restore();
  } else { ctx.save(); ctx.globalAlpha = 0.5; ctx.fillStyle = C.orange; shapePath(ctx, s1.shape, ex, 46, pk - 4); ctx.fill(); ctx.restore(); }
  // what has accumulated for the current shape: products (right) or turned-away substrates (left), max 40 drawn
  const done = s1.sent[s1.shape], enc = M.encounters(s1.shape, done), side = (W - ew) / 2 - 16, g = 9, per = Math.max(1, Math.floor(side / g));
  ctx.save();
  if (enc.fits) { ctx.fillStyle = C.green; for (let i = 0; i < Math.min(enc.products, 40); i++) ctx.fillRect(ex + ew / 2 + 12 + (i % per) * g, ey + eh / 2 - 7 - Math.floor(i / per) * g, 6, 7); }
  else { ctx.fillStyle = C.orange; ctx.globalAlpha = 0.45; for (let i = 0; i < Math.min(done, 40); i++) { shapePath(ctx, s1.shape, ex - ew / 2 - 16 - (i % per) * g, ey + eh / 2 - 4 - Math.floor(i / per) * g, 7); ctx.fill(); } }
  ctx.restore();
  // running totals
  const maxN = Math.max(10, ...Object.values(s1.sent));
  const B = panel(ctx, W, { top: 216, bottom: H - 30, xMin: 0, xMax: maxN, yMin: 0, yMax: 2 * maxN, yTicks: [0, maxN, 2 * maxN], yFmt: v => String(v), xTicks: ticks(0, maxN, W - 52, [1, 2, 5, 10, 20, 50]), title: t('c1b') });
  [...s1.tried].forEach(sh => {
    const n = s1.sent[sh], p = M.encounters(sh, n).products, col = SHAPE_COL[sh];
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(B.x(0), B.y(0)); ctx.lineTo(B.x(n), B.y(p)); ctx.stroke();
    if (n > 0) { ctx.fillStyle = col; shapePath(ctx, sh, B.x(n), B.y(p), 11); ctx.fill(); } ctx.restore();
  });
  const n = s1.sent[s1.shape], r = M.encounters(s1.shape, n);
  const prog = anims.s1 ? t('s1prog', { k: Math.min(10, s1.k + 1) }) : '';
  $('r1').textContent = t('s1readout', { shape: t('shape_' + s1.shape), n, c: r.converted, p: r.products, e: r.enzymes, prog });
}

/* ---------- step 2: saturation ---------- */
const s2 = { hist: new Set() };
function draw2() {
  const S = num('S2'), Km = num('Km2'), E = num('E2'), Vmax = M.VMAX_PER_E * E, v = M.mm(S, Km, Vmax), occ = M.occupied(S, Km);
  $('S2v').textContent = fmt(S, 1); $('Km2v').textContent = fmt(Km, 1); $('E2v').textContent = fmt(E, 1);
  s2.hist.add(`${S}|${Km}|${E}`);
  const { ctx, W, H } = fitCanvas($('c2'));
  title(ctx, t('c2a'), 8, 20, W - 16);
  const busy = Math.round(20 * occ), perRow = W >= 520 ? 20 : 10, rows = 20 / perRow, slot = (W - 24) / perRow, iw = Math.min(30, slot - 6), ih = iw * 0.62;
  for (let i = 0; i < 20; i++) {
    const X = 12 + slot * (i % perRow + 0.5), Y = 52 + Math.floor(i / perRow) * 40;
    enzyme(ctx, X, Y + 4, iw, ih, iw * 0.34, i < busy ? C.cyan : C.enz);
    if (i < busy) { ctx.fillStyle = C.orange; ctx.fillRect(X - iw * 0.15, Y + 4 - ih / 2 - iw * 0.15 + 1, iw * 0.3, iw * 0.3); }
  }
  const top = 52 + rows * 40 + 18;
  const B = panel(ctx, W, { top, bottom: H - 30, xMin: 0, xMax: 20, yMin: 0, yMax: 330, yTicks: [0, 100, 200, 300], yFmt: v => String(v), xTicks: ticks(0, 20, W - 52, [1, 2, 5, 10]), title: t('c2b') });
  hline(ctx, B, Vmax, C.ghost);
  vline(ctx, B.x(Km), B.y(0), B.y(Vmax / 2), C.ghost); hline(ctx, { P: { l: B.P.l, r: B.x(Km) }, y: B.y }, Vmax / 2, C.ghost, [2, 3]);
  curve(ctx, B, s => M.mm(s, Km, Vmax), 0, 20, C.orange, 2.4);
  [...s2.hist].forEach(k => { const [hs, hk, he] = k.split('|').map(Number); if (hk !== Km || he !== E || hs === S) return; dot(ctx, B.x(hs), B.y(M.mm(hs, Km, Vmax)), 3.5, C.text); });
  dot(ctx, B.x(S), B.y(v), 6, C.cyan);
  const v2 = M.mm(2 * S, Km, Vmax), gain = v > 0 ? (v2 / v - 1) * 100 : 0;
  $('r2').textContent = t('s2readout', { S: fmt(S, 1), Km: fmt(Km, 1), Vmax: fmt(Vmax, 0), v: fmt(v, 1), pct: fmt(occ * 100, 1), busy, S2: fmt(2 * S, 1), v2: fmt(v2, 1), gain: t('gainUp', { p: fmt(gain, 1) }) });
}

/* ---------- step 3: temperature ---------- */
const s3 = { tmax: null, pts: [] };
function draw3() {
  const T = num('T3'), a = M.activity(T), f = M.folded(T), opt = M.optimum().T;
  $('T3v').textContent = String(T);
  const { ctx, W, H } = fitCanvas($('c3'));
  const A = panel(ctx, W, { top: 30, bottom: H - 30, xMin: 0, xMax: 80, yMin: 0, yMax: 1.05, yTicks: [0, 0.25, 0.5, 0.75, 1], yFmt: v => fmt(v * 100, 0) + '%', left: 46, xTicks: ticks(0, 80, W - 58, [5, 10, 20]), title: t('c3') });
  curve(ctx, A, M.folded, 0, 80, C.ghost, 1.6, [5, 4]);
  curve(ctx, A, M.activity, 0, 80, C.cyan, 2.6, null, 400);
  vline(ctx, A.x(T), A.P.t, A.P.b, C.text, [2, 4], 1);
  s3.pts.forEach(p => dot(ctx, A.x(p.T), A.y(p.a), 5, C.orange));
  dot(ctx, A.x(T), A.y(a), 6, C.text);
  const a37 = M.activity(37);
  let msg = t('s3readout', { T, a: fmt(a * 100, 1), f: fmt(f * 100, 1), opt: fmt(opt, 1), q10: fmt(M.q10(20), 2) }) + ' ';
  msg += s3.tmax === null ? t('s3fresh') : t('s3cool', { tmax: s3.tmax, ac: fmt(M.afterCooling(s3.tmax) * 100, 1), a37: fmt(a37 * 100, 1) });
  $('r3').textContent = msg;
}

/* ---------- step 4: pH ---------- */
const PH_COL = { pepsin: C.violet, amylase: C.orange, trypsin: C.cyan };
function draw4() {
  const pH = num('pH4');
  $('pH4v').textContent = pH.toFixed(1);
  const { ctx, W, H } = fitCanvas($('c4'));
  const A = panel(ctx, W, { top: 30, bottom: H - 30, xMin: 0, xMax: 14, yMin: 0, yMax: 1.05, yTicks: [0, 0.5, 1], yFmt: v => fmt(v * 100, 0) + '%', left: 46, xTicks: ticks(0, 14, W - 58, [1, 2]), title: t('c4') });
  Object.values(M.PLACES).forEach(p => vline(ctx, A.x(p), A.P.t, A.P.b, C.ghost, [2, 5], 1.2));
  Object.keys(PH_COL).forEach(n => curve(ctx, A, x => M.phActivity(x, n), 0, 14, PH_COL[n], 2.4, null, 400));
  vline(ctx, A.x(pH), A.P.t, A.P.b, C.text, [], 1.4);
  Object.keys(PH_COL).forEach(n => dot(ctx, A.x(pH), A.y(M.phActivity(pH, n)), 5, PH_COL[n]));
  const pc = n => fmt(M.phActivity(pH, n) * 100, 1);
  $('r4').textContent = t('s4readout', { pH: pH.toFixed(1), p: pc('pepsin'), a: pc('amylase'), t: pc('trypsin') });
}

/* ---------- step 5: inhibitors ---------- */
const s5 = { type: 'comp' };
function draw5() {
  const I = num('I5'), S = num('S5'), type = s5.type, r = M.inhibited(type, S, I), v0 = M.uninhibited(S);
  $('I5v').textContent = fmt(I, 1); $('S5v').textContent = fmt(S, 1);
  $('comp5').setAttribute('aria-pressed', type === 'comp' ? 'true' : 'false'); $('non5').setAttribute('aria-pressed', type === 'non' ? 'true' : 'false');
  let { ctx, W, H } = fitCanvas($('c5'));
  title(ctx, t('c5a'), 8, 20, W - 16);
  const cnt = M.iconCounts(M.states(type, S, I)), seq = [];
  ['ES', 'ESI', 'EI', 'E'].forEach(k => { for (let i = 0; i < cnt[k]; i++) seq.push(k); });
  const cols = 5, rows = 4, cw = (W - 16) / cols, rh = (H - 44) / rows, iw = Math.min(44, cw - 12), ih = iw * 0.6, pk = iw * 0.32;
  seq.forEach((k, i) => {
    const X = 8 + cw * (i % cols + 0.5), Y = 40 + rh * (Math.floor(i / cols) + 0.55), py = Y - ih / 2 + pk / 2;
    const hasI = k === 'EI' || k === 'ESI', hasS = k === 'ES' || k === 'ESI', skew = type === 'non' && hasI ? pk * 0.45 : 0;
    enzyme(ctx, X, Y, iw, ih, pk, k === 'ES' ? C.cyan : C.enz, skew);
    if (hasS) { ctx.fillStyle = C.orange; ctx.fillRect(X - pk / 2 + 2 + (type === 'non' && hasI ? -pk * 0.9 : 0), py - pk / 2 + 2 - (type === 'non' && hasI ? pk * 0.9 : 0), pk - 4, pk - 4); }
    if (hasI) {
      ctx.fillStyle = C.pink;
      if (type === 'comp') { ctx.fillRect(X - pk / 2 + 2, py - pk / 2 + 2, pk - 4, pk - 4); ctx.fillStyle = C.bg; ctx.fillRect(X - 1.5, py - pk / 2 + 2, 3, pk - 4); }
      else { dot(ctx, X + iw / 2, Y + ih * 0.1, pk * 0.42, C.pink); }
    }
  });
  ({ ctx, W, H } = fitCanvas($('c5b')));
  const B = panel(ctx, W, { top: 30, bottom: H - 30, xMin: 0, xMax: 50, yMin: 0, yMax: 110, yTicks: [0, 25, 50, 75, 100], yFmt: v => String(v), xTicks: ticks(0, 50, W - 52, [5, 10, 25]), title: t('c5b') });
  curve(ctx, B, M.uninhibited, 0, 50, C.ghost, 2, [6, 4]);
  hline(ctx, B, r.Vapp, C.cyan, [3, 4]);
  curve(ctx, B, s => M.inhibited(type, s, I).v, 0, 50, C.cyan, 2.6);
  vline(ctx, B.x(S), B.y(r.v), B.y(v0), C.text, [2, 3], 1);
  dot(ctx, B.x(S), B.y(v0), 4.5, C.ghost, true); dot(ctx, B.x(S), B.y(r.v), 6, C.cyan);
  let rescue;
  if (I === 0) rescue = t('s5none');
  else if (type === 'comp') rescue = t('s5rescue', { S90: fmt(M.rescueS('comp', I, 0.9), 1) });
  else rescue = t('s5never', { cap: fmt(100 / (1 + I / M.INH.Ki), 1) });
  $('r5').textContent = t('s5readout', { type: t(type === 'comp' ? 'comp5' : 'non5'), I: fmt(I, 1), S: fmt(S, 1), v: fmt(r.v, 1), v0: fmt(v0, 1), r: v0 > 0 ? fmt(r.v / v0 * 100, 1) : '–', Vapp: fmt(r.Vapp, 1), Kapp: fmt(r.Kapp, 1), rescue });
}

function hints() {
  $('h0').textContent = t('s0hint', { d10: fmt(M.R * M.BODY_K * Math.LN10 / 1000, 1) });
  const kc = M.CARBONIC_ANHYDRASE_KCAT;
  $('h1').textContent = t('s1hint', { kcat: window.ENZ_I18N.getLang() === 'zh' ? fmt(kc / 1e4, 0) + ' 万' : kc.toLocaleString('en-US') });
  $('h3').textContent = t('s3hint', { opt: fmt(M.optimum().T, 0) });
  $('h4').textContent = t('s4hint', { pep8: fmt(M.phActivity(8, 'pepsin') * 100, 3), amy2: fmt(M.phActivity(2, 'amylase') * 100, 2) });
  const rc = s => fmt(M.inhibited('comp', s, 4).v / M.uninhibited(s) * 100, 0);
  $('h5').textContent = t('s5hint', { c5: rc(5), c50: rc(50), n: fmt(100 / (1 + 4 / M.INH.Ki), 0) });
  const fb = $('quizFeedback'); if (fb.dataset.state) showQuiz(fb.dataset.state === 'correct');
}
function showQuiz(ok) {
  const p50 = M.occupied(50, 1) * 100, p100 = M.occupied(100, 1) * 100;
  $('quizFeedback').textContent = ok ? t('correct', { p50: fmt(p50, 1), p100: fmt(p100, 1), gain: fmt((p100 / p50 - 1) * 100, 0) }) : t('wrong');
  $('quizFeedback').style.color = ok ? C.green : C.orange;
  $('quizFeedback').dataset.state = ok ? 'correct' : 'wrong';
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); hints(); }

function setup() {
  ['ea0', 'dea0'].forEach(id => $(id).addEventListener('input', draw0));

  Object.keys(SHAPE_BTN).forEach(k => $(SHAPE_BTN[k]).addEventListener('click', () => { if (anims.s1) stopAnim('s1'); s1.shape = k; s1.tried.add(k); draw1(); }));
  $('feed1').addEventListener('click', () => {
    if (anims.s1) stopAnim('s1');
    const sh = s1.shape, base = s1.sent[sh]; s1.tried.add(sh); s1.k = 0;
    animate('s1', 10 * 900, p => {
      const k = Math.min(10, Math.floor(p * 10)); s1.k = k; s1.sent[sh] = base + k; s1.cur = p < 1 ? p * 10 - k : null; draw1();
    }, () => { s1.sent[sh] = base + 10; s1.cur = null; draw1(); });
  });
  $('clear1').addEventListener('click', () => { if (anims.s1) stopAnim('s1'); s1.sent = { square: 0, circle: 0, triangle: 0 }; s1.tried = new Set([s1.shape]); draw1(); });

  ['S2', 'Km2', 'E2'].forEach(id => $(id).addEventListener('input', draw2));
  $('T3').addEventListener('input', draw3);
  $('heat3').addEventListener('click', () => { const T = num('T3'); s3.tmax = s3.tmax === null ? T : Math.max(s3.tmax, T); s3.pts.push({ T: s3.tmax, a: M.afterCooling(s3.tmax) }); draw3(); });
  $('fresh3').addEventListener('click', () => { s3.tmax = null; draw3(); });
  $('pH4').addEventListener('input', draw4);
  $('comp5').addEventListener('click', () => { s5.type = 'comp'; draw5(); });
  $('non5').addEventListener('click', () => { s5.type = 'non'; draw5(); });
  ['I5', 'S5'].forEach(id => $(id).addEventListener('input', draw5));

  $('checkQuiz').addEventListener('click', () => { const c = document.querySelector('input[name="quiz"]:checked'); showQuiz(!!c && c.value === 'b'); });

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
  window.refreshEnzymes = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
