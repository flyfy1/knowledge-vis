'use strict';
// Decision-tree lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every point, cut, curve and readout comes from window.DT_MODEL (model.js). Canvas text is limited to panel
// titles, group labels and axis ticks in fixed slots; legends, rules and readouts live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.DT_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', red: '#ff5c6c', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', curve: '#9fb4cc', ghost: '#55657a' };
const SHADE = { 1: 'rgba(103,215,249,0.16)', 0: 'rgba(255,180,84,0.13)' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros only after a decimal point (toFixed(0) = "90" stays "90"); show −0 as 0.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; };
const fixed = (v, d) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; return v.toFixed(d); };
const pct = v => (v * 100).toFixed(0);
const FKEY = ['study', 'sleep'];
const cls = c => t(c ? 'pass' : 'fail');

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
function fitFont(ctx, text, maxW, base, weight = '') {
  let size = base;
  do { ctx.font = `${weight} ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 7);
  return size;
}
function title(ctx, text, X, Y, maxW) {
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  fitFont(ctx, text, maxW, 12, '600'); ctx.fillText(text, X, Y); ctx.restore();
}
function frame(ctx, W, o) {
  const P = { l: o.left ?? 40, r: o.right ?? W - 14, t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textBaseline = 'alphabetic';
  for (const v of o.yTicks || []) {
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(o.yLabel ? o.yLabel(v) : fmt(v), P.l - 5, y(v) + 4);
  }
  for (const v of o.xTicks || []) {
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
    ctx.textAlign = 'center'; ctx.fillText(o.xLabel ? o.xLabel(v) : fmt(v), x(v), P.b + 15);
  }
  ctx.strokeStyle = C.axis; ctx.strokeRect(P.l, P.t, P.r - P.l, P.b - P.t);
  ctx.restore();
  if (o.title) title(ctx, o.title, o.titleX ?? 8, P.t - 10, o.titleW ?? W - 16);
  return { x, y, P };
}
function dot(ctx, X, Y, r, fill, stroke, lw = 2) {
  ctx.beginPath(); ctx.arc(X, Y, r, 0, 7);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}

/* ---------- student scatter (steps 0, 2, 3, 4) ---------- */
// rects: [{x0, x1, y0, y1, pred}] in data units (±Infinity allowed); wrong: Set of point indices to ring.
function scatter(ctx, W, top, bottom, pts, { rects = [], cut = null, wrong = null, ttl = '' } = {}) {
  const [fx, fy] = M.FEAT;
  const F = frame(ctx, W, { top, bottom, left: 34, xMin: fx.min, xMax: fx.max, yMin: fy.min, yMax: fy.max, xTicks: [0, 2, 4, 6, 8, 10, 12], yTicks: [4, 6, 8, 10], title: ttl });
  const cx = v => F.x(Math.max(fx.min, Math.min(fx.max, v))), cy = v => F.y(Math.max(fy.min, Math.min(fy.max, v)));
  rects.forEach(r => { ctx.fillStyle = SHADE[r.pred]; const X0 = cx(r.x0), X1 = cx(r.x1), Y0 = cy(r.y1), Y1 = cy(r.y0); ctx.fillRect(X0, Y0, X1 - X0, Y1 - Y0); ctx.strokeStyle = 'rgba(232,237,244,0.35)'; ctx.lineWidth = 1; ctx.strokeRect(X0, Y0, X1 - X0, Y1 - Y0); });
  pts.forEach((p, i) => {
    const X = F.x(p.x[0]), Y = F.y(p.x[1]);
    if (wrong && wrong.has(i)) dot(ctx, X, Y, 8, null, C.red, 2);
    if (p.y) dot(ctx, X, Y, 4.2, C.cyan, C.bg, 1); else dot(ctx, X, Y, 3.6, C.bg, C.orange, 2);
  });
  if (cut) {
    ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 2.4;
    ctx.beginPath(); if (cut.f === 0) { ctx.moveTo(cx(cut.thr), F.P.t); ctx.lineTo(cx(cut.thr), F.P.b); } else { ctx.moveTo(F.P.l, cy(cut.thr)); ctx.lineTo(F.P.r, cy(cut.thr)); } ctx.stroke(); ctx.restore();
  }
  return F;
}
const leafRects = tree => M.leaves(tree).map(l => ({ x0: l.box[0][0], x1: l.box[0][1], y0: l.box[1][0], y1: l.box[1][1], pred: l.pred }));
const halfRects = (f, thr, majL, majR) => f === 0
  ? [{ x0: -Infinity, x1: thr, y0: -Infinity, y1: Infinity, pred: majL }, { x0: thr, x1: Infinity, y0: -Infinity, y1: Infinity, pred: majR }]
  : [{ x0: -Infinity, x1: Infinity, y0: -Infinity, y1: thr, pred: majL }, { x0: -Infinity, x1: Infinity, y0: thr, y1: Infinity, pred: majR }];
const wrongSet = (tree, pts) => new Set(pts.map((p, i) => (M.predict(tree, p.x) !== p.y ? i : -1)).filter(i => i >= 0));

/* ---------- animation runner ---------- */
const anims = {};
function animate(name, ms, frameFn, done) {
  stopAnim(name);
  if (reduceMotion()) { frameFn(1); if (done) done(); return; }
  const start = performance.now();
  const tick = now => { const p = Math.min(1, (now - start) / ms); frameFn(p); if (p < 1) anims[name] = { id: requestAnimationFrame(tick), frameFn, done }; else { delete anims[name]; if (done) done(); } };
  anims[name] = { id: requestAnimationFrame(tick), frameFn, done };
}
function stopAnim(name) { if (anims[name]) { cancelAnimationFrame(anims[name].id); delete anims[name]; } }
function finishAll() { Object.keys(anims).forEach(k => { const a = anims[k]; cancelAnimationFrame(a.id); delete anims[k]; a.frameFn(1); if (a.done) a.done(); }); }

const TRAIN = M.train();

/* ---------- step 0: one question by hand ---------- */
const s0 = { f: 0 };
function setRange(input, f, step) { const R = M.FEAT[f]; input.min = R.min; input.max = R.max; input.step = step; }
function draw0() {
  const f = s0.f, thr = num('t0');
  $('f0a').setAttribute('aria-pressed', f === 0); $('f0b').setAttribute('aria-pressed', f === 1);
  $('t0v').textContent = fmt(thr, 2);
  const cs = M.cutStats(TRAIN, f, thr);
  const { ctx, W, H } = fitCanvas($('c0'));
  scatter(ctx, W, 30, H - 26, TRAIN, { rects: halfRects(f, thr, cs.majL, cs.majR), cut: { f, thr }, ttl: t('c0') });
  $('r0').textContent = t('s0readout', { feat: t(FKEY[f]), thr: fmt(thr, 2), nl: cs.left.n, kl: cs.left.k, gl: cls(cs.majL), nr: cs.right.n, kr: cs.right.k, gr: cls(cs.majR), e: cs.errors, acc: pct(cs.acc) });
}

/* ---------- step 1: impurity measures ---------- */
const s1 = { m: 'error' };
const N1 = 40, K1 = 28;
const MKEY = { error: 'mError', gini: 'mGini', entropy: 'mEntropy' };
function clampK1() {
  const nL = num('nl1'), k = $('kl1'), lo = Math.max(0, nL - (N1 - K1)), hi = Math.min(nL, K1);
  k.min = lo; k.max = hi; k.value = Math.max(lo, Math.min(hi, Number(k.value)));
}
function groupDots(ctx, cx, top, n, k, label, maxW) {
  const cols = 8, sp = Math.min(14, (maxW - 4) / cols), w = (cols - 1) * sp;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'center'; fitFont(ctx, label, maxW, 12, '600'); ctx.fillText(label, cx, top); ctx.restore();
  for (let i = 0; i < n; i++) {
    const X = cx - w / 2 + (i % cols) * sp, Y = top + 14 + Math.floor(i / cols) * sp;
    if (i < k) dot(ctx, X, Y, sp * 0.36, C.cyan); else dot(ctx, X, Y, sp * 0.3, C.bg, C.orange, 1.5);
  }
}
function draw1() {
  const nL = num('nl1'), kL = num('kl1'), nR = N1 - nL, kR = K1 - kL, m = s1.m;
  ['e', 'g', 'h'].forEach((c, i) => $('m1' + c).setAttribute('aria-pressed', ['error', 'gini', 'entropy'][i] === m));
  $('nl1v').textContent = String(nL); $('kl1v').textContent = String(kL);
  const { ctx, W, H } = fitCanvas($('c1'));
  title(ctx, t('c1groups'), 8, 18, W - 16);
  const colW = (W - 16) / 3;
  groupDots(ctx, 8 + colW * 0.5, 44, N1, K1, t('gParent', { k: K1, n: N1 }), colW - 8);
  groupDots(ctx, 8 + colW * 1.5, 44, nL, kL, t('gLeft', { k: kL, n: nL }), colW - 8);
  groupDots(ctx, 8 + colW * 2.5, 44, nR, kR, t('gRight', { k: kR, n: nR }), colW - 8);
  const F = frame(ctx, W, { top: 190, bottom: H - 28, xMin: 0, xMax: 1, yMin: 0, yMax: 1.05, xTicks: [0, 0.25, 0.5, 0.75, 1], yTicks: [0, 0.25, 0.5, 0.75, 1], title: t('c1curve', { m: t(MKEY[m]) }) });
  ctx.save();
  ['error', 'gini', 'entropy'].forEach(key => {
    const f = M.MEASURES[key], sel = key === m;
    ctx.strokeStyle = sel ? C.text : C.ghost; ctx.lineWidth = sel ? 2.4 : 1.4; ctx.beginPath();
    for (let i = 0; i <= 200; i++) { const p = i / 200; if (!i) ctx.moveTo(F.x(p), F.y(f(p))); else ctx.lineTo(F.x(p), F.y(f(p))); }
    ctx.stroke();
  });
  const f = M.MEASURES[m], pL = kL / nL, pR = kR / nR, p0 = K1 / N1, d = M.decrease(m, N1, K1, nL, kL);
  ctx.strokeStyle = C.green; ctx.lineWidth = 1.6; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(F.x(pL), F.y(f(pL))); ctx.lineTo(F.x(pR), F.y(f(pR))); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = C.orange; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(F.x(p0), F.y(d.before)); ctx.lineTo(F.x(p0), F.y(d.after)); ctx.stroke();
  dot(ctx, F.x(pL), F.y(f(pL)), 6, C.green); dot(ctx, F.x(pR), F.y(f(pR)), 6, C.green);
  dot(ctx, F.x(p0), F.y(d.before), 6, C.bg, C.text, 2.2);
  dot(ctx, F.x(p0), F.y(d.after), 5, C.orange);
  ctx.restore();
  const dE = M.decrease('error', N1, K1, nL, kL).gain, dG = M.decrease('gini', N1, K1, nL, kL).gain, dH = M.decrease('entropy', N1, K1, nL, kL).gain;
  const note = Math.abs(pL - p0) < 1e-12 ? t('s1none') : dE < 1e-12 ? t('s1flat') : t('s1allup');
  $('r1').textContent = t('s1readout', { kl: kL, nl: nL, kr: kR, nr: nR, de: fixed(dE, 3), dg: fixed(dG, 3), dh: fixed(dH, 3), note });
}

/* ---------- step 2: scan for the best cut ---------- */
const s2 = { f: 0, seen: [new Set(), new Set()] };
const STEP2 = 0.05;
const idx2 = (f, v) => Math.round((v - M.FEAT[f].min) / STEP2);
const val2 = (f, i) => M.FEAT[f].min + i * STEP2;
const N2 = f => Math.round((M.FEAT[f].max - M.FEAT[f].min) / STEP2) + 1;
const GAIN2 = [0, 1].map(f => Array.from({ length: N2(f) }, (_, i) => M.cutStats(TRAIN, f, val2(f, i)).gain));
function bestSeen(f) { let b = -1; s2.seen[f].forEach(i => { if (b < 0 || GAIN2[f][i] > GAIN2[f][b] + 1e-12 || (Math.abs(GAIN2[f][i] - GAIN2[f][b]) < 1e-12 && i < b)) b = i; }); return b; }
function draw2() {
  const f = s2.f, thr = num('t2'), i0 = idx2(f, thr);
  s2.seen[f].add(i0);
  $('f2a').setAttribute('aria-pressed', f === 0); $('f2b').setAttribute('aria-pressed', f === 1);
  $('t2v').textContent = fmt(thr, 2);
  const cs = M.cutStats(TRAIN, f, thr);
  const { ctx, W, H } = fitCanvas($('c2'));
  scatter(ctx, W, 30, 290, TRAIN, { rects: halfRects(f, thr, cs.majL, cs.majR), cut: { f, thr }, ttl: t('c2scatter') });
  const R = M.FEAT[f], xt = f === 0 ? [0, 2, 4, 6, 8, 10, 12] : [4, 5, 6, 7, 8, 9, 10];
  const G = frame(ctx, W, { top: 340, bottom: H - 26, left: 40, xMin: R.min, xMax: R.max, yMin: 0, yMax: 0.6, xTicks: xt, yTicks: [0, 0.2, 0.4, 0.6], title: t('c2gain', { feat: t(FKEY[f]) }) });
  ctx.save(); ctx.strokeStyle = C.cyan; ctx.lineWidth = 2;
  const seen = [...s2.seen[f]].sort((a, b) => a - b);
  for (let k = 0; k < seen.length; k++) {
    const i = seen[k], X = G.x(val2(f, i)), Y = G.y(GAIN2[f][i]);
    if (k && seen[k - 1] === i - 1) { ctx.beginPath(); ctx.moveTo(G.x(val2(f, i - 1)), G.y(GAIN2[f][i - 1])); ctx.lineTo(X, Y); ctx.stroke(); }
    else dot(ctx, X, Y, 1.8, C.cyan);
  }
  const b = bestSeen(f);
  if (b >= 0) dot(ctx, G.x(val2(f, b)), G.y(GAIN2[f][b]), 5.5, C.text, C.bg, 1.5);
  dot(ctx, G.x(thr), G.y(cs.gain), 6, C.orange, C.bg, 1.5);
  ctx.restore();
  let best = '';
  const full = [0, 1].every(g => s2.seen[g].size === N2(g));
  if (full) { const bc = M.bestCut(TRAIN); best = t('s2both', { feat: t(FKEY[bc.f]), thr: fmt(bc.thr, 2), g: fixed(bc.gain, 3) }); }
  else if (b >= 0) best = t('s2best', { feat: t(FKEY[f]), thr: fmt(M.canonical(TRAIN, f, val2(f, b)), 2), g: fixed(GAIN2[f][b], 3) });
  $('r2').textContent = t('s2readout', { feat: t(FKEY[f]), thr: fmt(thr, 2), nl: cs.left.n, kl: cs.left.k, nr: cs.right.n, kr: cs.right.k, h0: fixed(cs.Hbefore, 3), h1: fixed(cs.Hafter, 3), g: fixed(cs.gain, 3), best });
}

/* ---------- step 3: grow a tree ---------- */
const TREES3 = Array.from({ length: 7 }, (_, d) => M.grow(TRAIN, d));
function ruleHTML(node) {
  if (!node.cut) return `<span class="${node.pred ? 'leaf-p' : 'leaf-f'}">${t('ruleLeaf', { c: cls(node.pred), k: node.k, n: node.n })}</span>`;
  const q = `<span class="q">${t('ruleQ', { feat: t(FKEY[node.cut.f]), thr: fmt(node.cut.thr, 2) })}</span>`;
  return `${q}<ul><li><span class="br">${t('ruleYes')} →</span>${ruleHTML(node.left)}</li><li><span class="br">${t('ruleNo')} →</span>${ruleHTML(node.right)}</li></ul>`;
}
function draw3() {
  const d = num('d3'), T = TREES3[d];
  $('d3v').textContent = String(d);
  const { ctx, W, H } = fitCanvas($('c3'));
  scatter(ctx, W, 30, H - 26, TRAIN, { rects: leafRects(T), wrong: wrongSet(T, TRAIN), ttl: t('c3') });
  $('tree3').innerHTML = `<p class="tree-title">${t('treeTitle')}</p><ul><li>${ruleHTML(T)}</li></ul>`;
  const acc = M.accuracy(T, TRAIN), e = Math.round((1 - acc) * TRAIN.length), nl = M.leaves(T).length;
  const prev = d > 0 ? TREES3[d - 1] : null;
  const note = prev && Math.abs(M.accuracy(prev, TRAIN) - acc) < 1e-12 && M.leaves(prev).length < nl ? t('s3same') : '';
  $('r3').textContent = t('s3readout', { d, real: M.depthOf(T), leaves: nl, acc: fixed(acc * 100, 1), e, note });
}

/* ---------- step 4: depth vs accuracy on new data ---------- */
const cache4 = {};
function data4(nz) {
  if (!cache4[nz]) { const noise = nz / 100, tr = M.train(noise); cache4[nz] = { tr, curve: M.depthCurve(noise), ceil: M.ruleAccuracy(noise), trees: Array.from({ length: 11 }, (_, d) => M.grow(tr, d)) }; }
  return cache4[nz];
}
function draw4() {
  const d = num('d4'), nz = num('z4'), D = data4(nz), c = D.curve;
  $('d4v').textContent = String(d); $('z4v').textContent = nz + '%';
  let { ctx, W, H } = fitCanvas($('c4'));
  const F = frame(ctx, W, { top: 30, bottom: H - 28, left: 42, xMin: 0, xMax: 10, yMin: 0.3, yMax: 1.02, xTicks: W < 330 ? [0, 2, 4, 6, 8, 10] : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], yTicks: [0.4, 0.6, 0.8, 1], yLabel: v => pct(v) + '%', title: t('c4curve') });
  ctx.save();
  ctx.strokeStyle = C.orange; ctx.setLineDash([6, 4]); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(F.P.l, F.y(D.ceil)); ctx.lineTo(F.P.r, F.y(D.ceil)); ctx.stroke(); ctx.setLineDash([]);
  [['train', C.text], ['test', C.cyan]].forEach(([k, col]) => {
    ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.beginPath(); c.forEach((r, i) => { if (!i) ctx.moveTo(F.x(r.d), F.y(r[k])); else ctx.lineTo(F.x(r.d), F.y(r[k])); }); ctx.stroke();
    c.forEach(r => dot(ctx, F.x(r.d), F.y(r[k]), r.d === d ? 6 : 2.6, col, r.d === d ? C.bg : null, 1.5));
  });
  ctx.strokeStyle = C.text; ctx.globalAlpha = 0.3; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(F.x(d), F.P.t); ctx.lineTo(F.x(d), F.P.b); ctx.stroke();
  ctx.restore();
  ({ ctx, W, H } = fitCanvas($('c4b')));
  const T = D.trees[d];
  scatter(ctx, W, 30, H - 26, D.tr, { rects: leafRects(T), wrong: wrongSet(T, D.tr), ttl: t('c4part') });
  const bt = Math.max(...c.map(r => r.test)), bd = c.findIndex(r => r.test === bt);
  $('r4').textContent = t('s4readout', { nz, d, leaves: c[d].leaves, tr: pct(c[d].train), te: pct(c[d].test), bd, bt: pct(bt), ceil: pct(D.ceil) });
}

/* ---------- step 5: XOR, greedy vs forced first cut ---------- */
const s5 = { force: false };
const SCAN5 = [0, 1].map(f => { const out = []; for (let i = 1; i < 100; i++) { const thr = i / 100; out.push({ thr, gain: M.cutStats(M.XOR_PTS, f, thr).gain }); } return out; });
function draw5() {
  const d = num('d5'), force = s5.force;
  $('d5v').textContent = String(d);
  $('g5').setAttribute('aria-pressed', !force); $('h5').setAttribute('aria-pressed', force);
  const T = M.grow(M.XOR_PTS, d, 0, force ? { f: 0, thr: 0.5 } : null);
  const { ctx, W, H } = fitCanvas($('c5'));
  const side = Math.min(W - 54, 330), l = 36 + Math.max(0, (W - 54 - side) / 2);
  const F = frame(ctx, W, { top: 30, bottom: 30 + side, left: l, right: l + side, xMin: 0, xMax: 1, yMin: 0, yMax: 1, xTicks: [0, 0.5, 1], yTicks: [0, 0.5, 1], title: t('c5part') });
  M.leaves(T).forEach(lf => { const b = lf.box, X0 = F.x(Math.max(0, b[0][0])), X1 = F.x(Math.min(1, b[0][1])), Y0 = F.y(Math.min(1, b[1][1])), Y1 = F.y(Math.max(0, b[1][0])); ctx.fillStyle = SHADE[lf.pred]; ctx.fillRect(X0, Y0, X1 - X0, Y1 - Y0); ctx.strokeStyle = 'rgba(232,237,244,0.35)'; ctx.strokeRect(X0, Y0, X1 - X0, Y1 - Y0); });
  const wrong = wrongSet(T, M.XOR_PTS);
  M.XOR_PTS.forEach((p, i) => { const X = F.x(p.x[0]), Y = F.y(p.x[1]); if (wrong.has(i)) dot(ctx, X, Y, 7.5, null, C.red, 2); if (p.y) dot(ctx, X, Y, 4.2, C.cyan, C.bg, 1); else dot(ctx, X, Y, 3.6, C.bg, C.orange, 2); });
  const G = frame(ctx, W, { top: 30 + side + 64, bottom: H - 26, left: 44, xMin: 0, xMax: 1, yMin: 0, yMax: 0.05, xTicks: [0, 0.25, 0.5, 0.75, 1], yTicks: [0, 0.025, 0.05], yLabel: v => fmt(v, 3), title: t('c5gain') });
  ctx.save();
  [[0, C.cyan], [1, C.pink]].forEach(([f, col]) => { ctx.strokeStyle = col; ctx.lineWidth = 1.8; ctx.beginPath(); SCAN5[f].forEach((c, i) => { const X = G.x(c.thr), Y = G.y(c.gain); if (!i) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }); ctx.stroke(); });
  const root = T.cut;
  if (root) dot(ctx, G.x(root.thr), G.y(root.gain), 6, C.text, C.bg, 1.5);
  ctx.restore();
  const tr = M.accuracy(T, M.XOR_PTS), te = M.accuracy(T, M.XOR_TEST);
  $('r5').textContent = t('s5readout', { feat: root.f === 0 ? 'a' : 'b', thr: fmt(root.thr, 3), g: fixed(root.gain, 4), d, leaves: M.leaves(T).length, tr: pct(tr), te: pct(te) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  // step 0
  const pick0 = f => { s0.f = f; setRange($('t0'), f, f === 0 ? 0.5 : 0.25); $('t0').value = f === 0 ? 3 : 6; draw0(); };
  $('f0a').addEventListener('click', () => pick0(0)); $('f0b').addEventListener('click', () => pick0(1));
  $('t0').addEventListener('input', draw0);
  // step 1
  [['m1e', 'error'], ['m1g', 'gini'], ['m1h', 'entropy']].forEach(([id, m]) => $(id).addEventListener('click', () => { s1.m = m; draw1(); }));
  $('nl1').addEventListener('input', () => { clampK1(); draw1(); });
  $('kl1').addEventListener('input', draw1);
  clampK1();
  // step 2
  const pick2 = f => { stopAnim('s2'); s2.f = f; setRange($('t2'), f, STEP2); $('t2').value = f === 0 ? 3 : 6; draw2(); };
  $('f2a').addEventListener('click', () => pick2(0)); $('f2b').addEventListener('click', () => pick2(1));
  $('t2').addEventListener('input', () => { stopAnim('s2'); draw2(); });
  $('scan2').addEventListener('click', () => {
    const f = s2.f, n = N2(f);
    animate('s2', 4000, p => { const last = Math.min(n - 1, Math.floor(p * (n - 1) + 1e-9)); for (let i = 0; i <= last; i++) s2.seen[f].add(i); $('t2').value = val2(f, last).toFixed(2); draw2(); });
  });
  $('clear2').addEventListener('click', () => { stopAnim('s2'); s2.seen = [new Set(), new Set()]; draw2(); });
  // step 3
  $('d3').addEventListener('input', () => { stopAnim('s3'); draw3(); });
  $('grow3').addEventListener('click', () => { $('d3').value = 0; draw3(); animate('s3', 6 * 800, p => { $('d3').value = Math.min(6, Math.floor(p * 6.999)); draw3(); }); });
  $('reset3').addEventListener('click', () => { stopAnim('s3'); $('d3').value = 0; draw3(); });
  // step 4
  $('d4').addEventListener('input', draw4); $('z4').addEventListener('input', draw4);
  // step 5
  $('g5').addEventListener('click', () => { s5.force = false; draw5(); }); $('h5').addEventListener('click', () => { s5.force = true; draw5(); });
  $('d5').addEventListener('input', draw5);

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
