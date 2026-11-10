'use strict';
// Overfitting lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every point, curve and readout comes from window.OVERFIT_MODEL (model.js). Canvas text is limited to
// panel titles (own row) and axis ticks; legends and numbers live in the DOM.
(function () {
const $ = id => document.getElementById(id);
const M = window.OVERFIT_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', faint: '#5b6f86', testPt: '#6b7c90' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Fixed decimals; trailing zeros are trimmed only after a decimal point (so 90 stays 90).
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d); return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s; };
const f3 = v => (v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(3));

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
function title(ctx, text, W, Y) {
  let size = 12; ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= W - 16) break; size -= 0.5; } while (size > 7);
  ctx.fillText(text, 8, Y); ctx.restore();
}
// Chart frame; tick labels in fixed rows left of / below the plot. Optional log axes.
function frame(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const tx = v => (o.logX ? Math.log10(v) : v), ty = v => (o.logY ? Math.log10(v) : v);
  const x = v => P.l + (tx(Math.max(o.xMin, Math.min(o.xMax, v))) - tx(o.xMin)) / (tx(o.xMax) - tx(o.xMin)) * (P.r - P.l);
  const yRaw = v => P.b - (ty(v) - ty(o.yMin)) / (ty(o.yMax) - ty(o.yMin)) * (P.b - P.t);
  const y = v => yRaw(Math.max(o.yMin, Math.min(o.yMax, v)));
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks) { ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(o.yFmt ? o.yFmt(v) : fmt(v, 2), P.l - 6, y(v) + 4); }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.t); ctx.lineTo(P.l, P.b); ctx.lineTo(P.r, P.b); ctx.stroke();
  const xt = typeof o.xTicks === 'function' ? o.xTicks(P.r - P.l) : o.xTicks;
  for (const v of xt) { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke(); ctx.textAlign = 'center'; ctx.fillText(o.xFmt ? o.xFmt(v) : fmt(v, 2), x(v), P.b + 16); }
  ctx.restore();
  if (o.title) title(ctx, o.title, W, P.t - 10);
  return { x, y, yRaw, P, o };
}
function clip(ctx, F) { ctx.save(); ctx.beginPath(); ctx.rect(F.P.l, F.P.t, F.P.r - F.P.l, F.P.b - F.P.t); ctx.clip(); }
function line(ctx, F, pts, color, { lw = 2, dash = null, alpha = 1, raw = true } = {}) {
  clip(ctx, F); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = alpha; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); pts.forEach(([a, b], i) => { const X = F.x(a), Y = raw ? F.yRaw(Math.max(-1e4, Math.min(1e4, b))) : F.y(b); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); }); ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, color, r = 4) { ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); ctx.strokeStyle = C.bg; ctx.lineWidth = 1.2; ctx.stroke(); ctx.restore(); }
// A value above the axis is drawn as an upward triangle on the top edge.
function mark(ctx, F, xv, yv, color, r = 4.5) {
  const X = F.x(xv);
  if (yv > F.o.yMax) { ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(X, F.P.t - 1); ctx.lineTo(X - 5.5, F.P.t + 9); ctx.lineTo(X + 5.5, F.P.t + 9); ctx.closePath(); ctx.fill(); ctx.restore(); }
  else dot(ctx, X, F.y(yv), color, r);
}
function vguide(ctx, X, y0, y1, color = C.muted, alpha = 0.6) { ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y1); ctx.stroke(); ctx.restore(); }
function hline(ctx, F, v, color = C.muted) { ctx.save(); ctx.strokeStyle = color; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(F.P.l, F.y(v)); ctx.lineTo(F.P.r, F.y(v)); ctx.stroke(); ctx.restore(); }

// The x–y data panel shared by several steps.
const XS = []; for (let i = 0; i <= 240; i++) XS.push(-1 + i / 120);
function dataPanel(ctx, W, H, titleText) {
  return frame(ctx, W, { top: 30, bottom: H - 28, left: 34, xMin: -1, xMax: 1, yMin: -2, yMax: 2, yTicks: [-2, -1, 0, 1, 2], yFmt: v => String(v),
    xTicks: w => (w < 220 ? [-1, 0, 1] : [-1, -0.5, 0, 0.5, 1]), xFmt: v => fmt(v, 1), title: titleText });
}
function points(ctx, F, xs, ys, color, r) { clip(ctx, F); ctx.fillStyle = color; xs.forEach((x, i) => { ctx.beginPath(); ctx.arc(F.x(x), F.yRaw(ys[i]), r, 0, 7); ctx.fill(); }); ctx.restore(); }
const curveOf = m => XS.map(x => [x, M.predict(m, x)]);
const truthPts = XS.map(x => [x, M.truth(x)]);
const degTicks = w => (w / 11.8 < 26 ? [0, 3, 6, 9, 11] : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
function errPanel(ctx, W, H, titleText, yMax = 1.2) {
  return frame(ctx, W, { top: 30, bottom: H - 28, left: 38, xMin: -0.4, xMax: 11.4, yMin: 0, yMax, yTicks: [0, 0.4, 0.8, 1.2], yFmt: v => fmt(v, 1), xTicks: degTicks, xFmt: v => 'd' + v, title: titleText });
}

/* ---------- shared data: the 12 training points (seed 7), 400 test points (seed 4242) ---------- */
const TRAIN = M.sample(M.N_TRAIN, 7), TEST = M.testSet(4242);
const yTrain = M.labels(TRAIN, M.SIGMA), yTest = M.labels(TEST, M.SIGMA);
const scan = M.degreeScan(TRAIN, TEST, M.SIGMA), bestRow = M.best(scan);
const floorAt = s => { const yy = M.labels(TEST, s); let q = 0; TEST.x.forEach((x, i) => { q += (M.truth(x) - yy[i]) ** 2; }); return Math.sqrt(q / TEST.x.length); };

/* ---------- animation runner ---------- */
const anims = {};
function animate(name, ms, frameFn, done) {
  stopAnim(name);
  if (reduceMotion()) { frameFn(1); if (done) done(); return; }
  const start = performance.now();
  const tick = now => { const p = Math.min(1, (now - start) / ms); frameFn(p); if (p < 1) anims[name].id = requestAnimationFrame(tick); else { delete anims[name]; if (done) done(); } };
  anims[name] = { id: requestAnimationFrame(tick), frameFn, done };
}
function stopAnim(name) { if (anims[name]) { cancelAnimationFrame(anims[name].id); delete anims[name]; } }
function finishAll() { Object.keys(anims).forEach(k => { const a = anims[k]; cancelAnimationFrame(a.id); delete anims[k]; a.frameFn(1); if (a.done) a.done(); }); }

/* ---------- step 0: fit, training error only ---------- */
const s0 = { truth: false, tried: new Set([1]) };
function draw0() {
  const d = num('d0'), m = M.fit(TRAIN.x, yTrain, d), tr = scan[d].train;
  $('d0v').textContent = String(d);
  $('truth0').textContent = t(s0.truth ? 'hideTruth' : 'showTruth'); $('truth0').setAttribute('aria-pressed', String(s0.truth));
  let { ctx, W, H } = fitCanvas($('c0a'));
  let F = dataPanel(ctx, W, H, t('c0a'));
  if (s0.truth) line(ctx, F, truthPts, C.text, { lw: 1.6, dash: [6, 5] });
  line(ctx, F, curveOf(m), C.cyan, { lw: 2.4 });
  points(ctx, F, TRAIN.x, yTrain, C.text, 4.5);
  ({ ctx, W, H } = fitCanvas($('c0b')));
  F = errPanel(ctx, W, H, t('c0b'));
  const tried = [...s0.tried].sort((a, b) => a - b);
  line(ctx, F, tried.map(k => [k, scan[k].train]), C.cyan, { lw: 1.6, raw: false, alpha: 0.7 });
  tried.forEach(k => dot(ctx, F.x(k), F.y(scan[k].train), k === d ? C.text : C.cyan, k === d ? 5.5 : 4));
  $('r0').textContent = t('s0readout', { d, k: d + 1, train: f3(tr), note: d === TRAIN.x.length - 1 ? t('s0interp') : '' });
}

/* ---------- step 1: test error ---------- */
function draw1() {
  const d = num('d1'), m = M.fit(TRAIN.x, yTrain, d), row = scan[d], floor = floorAt(M.SIGMA);
  $('d1v').textContent = String(d);
  let { ctx, W, H } = fitCanvas($('c1a'));
  let F = dataPanel(ctx, W, H, t('c1a'));
  points(ctx, F, TEST.x, yTest, C.testPt, 1.8);
  line(ctx, F, curveOf(m), C.cyan, { lw: 2.4 });
  points(ctx, F, TRAIN.x, yTrain, C.text, 4.5);
  ({ ctx, W, H } = fitCanvas($('c1b')));
  F = errPanel(ctx, W, H, t('c1b'));
  hline(ctx, F, floor);
  line(ctx, F, scan.map(r => [r.d, r.train]), C.cyan, { lw: 2, raw: false });
  line(ctx, F, scan.map(r => [r.d, r.test]), C.orange, { lw: 2, raw: false });
  scan.forEach(r => { mark(ctx, F, r.d, r.train, C.cyan, r.d === d ? 5.5 : 3); mark(ctx, F, r.d, r.test, C.orange, r.d === d ? 5.5 : 3); });
  vguide(ctx, F.x(d), F.P.t, F.P.b);
  $('r1').textContent = t('s1readout', { d, train: f3(row.train), test: f3(row.test), gap: f3(row.test - row.train), best: bestRow.d, bestTest: f3(bestRow.test), floor: f3(floor) });
}

/* ---------- step 2: noise level ---------- */
const s2 = { hist: new Set(['0.25']) };
const scanCache = {};
const scanAt = s => { const k = s.toFixed(2); if (!scanCache[k]) scanCache[k] = M.degreeScan(TRAIN, TEST, s); return scanCache[k]; };
function draw2() {
  const s = num('s2'), d = num('d2'), sc = scanAt(s), b = M.best(sc), y = M.labels(TRAIN, s), m = M.fit(TRAIN.x, y, d), floor = floorAt(s);
  $('s2v').textContent = fmt(s, 2); $('d2v').textContent = String(d);
  let { ctx, W, H } = fitCanvas($('c2a'));
  let F = dataPanel(ctx, W, H, t('c2a', { s: fmt(s, 2) }));
  line(ctx, F, truthPts, C.text, { lw: 1.4, dash: [6, 5], alpha: 0.7 });
  line(ctx, F, curveOf(m), C.cyan, { lw: 2.4 });
  points(ctx, F, TRAIN.x, y, C.text, 4.5);
  ({ ctx, W, H } = fitCanvas($('c2b')));
  F = errPanel(ctx, W, H, t('c2b'));
  [...s2.hist].forEach(k => { if (Math.abs(Number(k) - s) > 1e-9) line(ctx, F, scanAt(Number(k)).map(r => [r.d, r.test]), C.faint, { lw: 1.4, raw: false }); });
  hline(ctx, F, floor);
  line(ctx, F, sc.map(r => [r.d, r.test]), C.orange, { lw: 2.6, raw: false });
  sc.forEach(r => mark(ctx, F, r.d, r.test, C.orange, r.d === d ? 5.5 : 3));
  vguide(ctx, F.x(d), F.P.t, F.P.b);
  $('r2').textContent = t('s2readout', { s: fmt(s, 2), best: b.d, bt: f3(b.test), floor: f3(floor), d, train: f3(sc[d].train), test: f3(sc[d].test) });
}

/* ---------- step 3: more data (nested pool of 120 points, degree 9) ---------- */
const POOL = M.testSet(99, 120), D3 = 9, NS = []; for (let n = 10; n <= 120; n += 2) NS.push(n);
const learn = NS.map(n => { const x = POOL.x.slice(0, n), y = M.labels({ x, z: POOL.z.slice(0, n) }, M.SIGMA), m = M.fit(x, y, D3); return { n, x, y, m, train: M.rmse(m, x, y), test: M.rmse(m, TEST.x, yTest) }; });
function draw3() {
  const n = num('n3'), r = learn.find(q => q.n === n), floor = floorAt(M.SIGMA);
  $('n3v').textContent = String(n);
  let { ctx, W, H } = fitCanvas($('c3a'));
  let F = dataPanel(ctx, W, H, t('c3a', { n }));
  line(ctx, F, truthPts, C.text, { lw: 1.4, dash: [6, 5], alpha: 0.7 });
  line(ctx, F, curveOf(r.m), C.cyan, { lw: 2.4 });
  points(ctx, F, r.x, r.y, C.text, n > 60 ? 3 : 4);
  ({ ctx, W, H } = fitCanvas($('c3b')));
  F = frame(ctx, W, { top: 30, bottom: H - 28, left: 38, xMin: 10, xMax: 120, yMin: 0, yMax: 1.2, yTicks: [0, 0.4, 0.8, 1.2], yFmt: v => fmt(v, 1),
    xTicks: w => (w < 220 ? [10, 40, 80, 120] : [10, 20, 40, 60, 80, 100, 120]), xFmt: v => 'n' + v, title: t('c3b') });
  hline(ctx, F, floor);
  line(ctx, F, learn.map(q => [q.n, q.train]), C.cyan, { lw: 2, raw: false });
  line(ctx, F, learn.map(q => [q.n, q.test]), C.orange, { lw: 2, raw: false });
  vguide(ctx, F.x(n), F.P.t, F.P.b);
  mark(ctx, F, n, r.train, C.cyan, 5.5); mark(ctx, F, n, r.test, C.orange, 5.5);
  $('r3').textContent = t('s3readout', { n, train: f3(r.train), test: f3(r.test), floor: f3(floor) });
}

/* ---------- step 4: batches, bias² and variance ---------- */
const s4 = { seeds: [], next: 5000 };
const BV = []; for (let d = 0; d <= 9; d++) { const f = M.fan(d, Array.from({ length: 200 }, (_, i) => 1000 + i)); BV.push({ d, bias2: f.bias2, variance: f.variance }); }
function draw4() {
  const d = num('d4'), b = s4.seeds.length, bv = BV[d];
  $('d4v').textContent = String(d);
  const fan = b ? M.fan(d, s4.seeds) : null;
  let { ctx, W, H } = fitCanvas($('c4a'));
  let F = dataPanel(ctx, W, H, t('c4a', { b }));
  if (fan) fan.curves.forEach(c => line(ctx, F, M.GRID.map((x, j) => [x, c[j]]), C.faint, { lw: 1.2, alpha: 0.85 }));
  line(ctx, F, truthPts, C.text, { lw: 1.6, dash: [6, 5] });
  if (fan) line(ctx, F, M.GRID.map((x, j) => [x, fan.mean[j]]), C.orange, { lw: 2.6 });
  ({ ctx, W, H } = fitCanvas($('c4b')));
  const sup = { '-4': '10⁻⁴', '-3': '10⁻³', '-2': '0.01', '-1': '0.1', '0': '1', '1': '10' };
  F = frame(ctx, W, { top: 30, bottom: H - 28, left: 42, xMin: -0.4, xMax: 9.4, yMin: 1e-4, yMax: 10, logY: true, yTicks: [1e-4, 1e-3, 1e-2, 0.1, 1, 10], yFmt: v => sup[String(Math.round(Math.log10(v)))],
    xTicks: w => (w / 9.8 < 26 ? [0, 3, 6, 9] : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]), xFmt: v => 'd' + v, title: t('c4b') });
  line(ctx, F, BV.map(r => [r.d, r.bias2]), C.cyan, { lw: 2.2, raw: false }); line(ctx, F, BV.map(r => [r.d, r.variance]), C.pink, { lw: 2.2, raw: false });
  BV.forEach(r => { dot(ctx, F.x(r.d), F.y(r.bias2), C.cyan, 3); dot(ctx, F.x(r.d), F.y(r.variance), C.pink, 3); });
  vguide(ctx, F.x(d), F.P.t, F.P.b);
  if (fan && b >= 2) { dot(ctx, F.x(d), F.y(Math.max(1e-4, fan.bias2)), C.text, 5); dot(ctx, F.x(d), F.y(Math.max(1e-4, fan.variance)), C.text, 5); }
  const common = { d, b, B2: f3(bv.bias2), V: f3(bv.variance) };
  $('r4').textContent = b >= 2 ? t('s4readout', { ...common, b2: f3(fan.bias2), v: f3(fan.variance), sum: f3(bv.bias2 + bv.variance + M.SIGMA * M.SIGMA) }) : t('s4need', common);
}
function addBatches(k) { for (let i = 0; i < k && s4.seeds.length < 60; i++) s4.seeds.push(s4.next++); draw4(); }

/* ---------- step 5: early stopping ---------- */
const GD = M.gdRun({ seed: 7 }), CK = GD.checkpoints;
const STOP = CK.reduce((bi, c, i) => (c.val < CK[bi].val ? i : bi), 0);
const xStep = s => Math.max(0.5, s);
function draw5() {
  const i = num('k5'), c = CK[i], m = { d: GD.D, w: c.w }, last = CK[CK.length - 1];
  $('k5v').textContent = String(c.step);
  let { ctx, W, H } = fitCanvas($('c5a'));
  let F = dataPanel(ctx, W, H, t('c5a', { k: c.step }));
  line(ctx, F, truthPts, C.text, { lw: 1.4, dash: [6, 5], alpha: 0.7 });
  line(ctx, F, curveOf(m), C.cyan, { lw: 2.4 });
  points(ctx, F, TRAIN.x, yTrain, C.text, 4.5);
  ({ ctx, W, H } = fitCanvas($('c5b')));
  F = frame(ctx, W, { top: 30, bottom: H - 28, left: 38, xMin: 0.5, xMax: 1e5, logX: true, yMin: 0, yMax: 3, yTicks: [0, 1, 2, 3], yFmt: v => String(v),
    xTicks: w => (w < 220 ? [1, 100, 1e4] : [1, 10, 100, 1e3, 1e4, 1e5]), xFmt: v => (v >= 1000 ? (v / 1000) + 'k' : String(v)), title: t('c5b') });
  const upto = CK.slice(0, i + 1);
  line(ctx, F, upto.map(q => [xStep(q.step), q.test]), C.faint, { lw: 2, raw: false });
  line(ctx, F, upto.map(q => [xStep(q.step), q.val]), C.orange, { lw: 2.4, raw: false });
  line(ctx, F, upto.map(q => [xStep(q.step), q.train]), C.cyan, { lw: 2.4, raw: false });
  ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(F.x(CK[STOP].step), F.P.t); ctx.lineTo(F.x(CK[STOP].step), F.P.b); ctx.stroke(); ctx.restore();
  vguide(ctx, F.x(xStep(c.step)), F.P.t, F.P.b);
  dot(ctx, F.x(xStep(c.step)), F.y(c.train), C.cyan, 5); dot(ctx, F.x(xStep(c.step)), F.y(c.val), C.orange, 5);
  $('r5').textContent = t('s5readout', { k: c.step, train: f3(c.train), val: f3(c.val), test: f3(c.test), stop: CK[STOP].step, vstop: f3(CK[STOP].val), tstop: f3(CK[STOP].test), last: last.step, tend: f3(last.test), prog: anims.s5 ? t('s5prog') : '' });
}
function play5() {
  const n = CK.length - 1;
  animate('s5', 7000, p => { $('k5').value = String(Math.round(p * n)); draw5(); }, draw5);
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  $('d0').addEventListener('input', () => { s0.tried.add(num('d0')); draw0(); });
  $('truth0').addEventListener('click', () => { s0.truth = !s0.truth; draw0(); });
  $('d1').addEventListener('input', draw1);
  $('s2').addEventListener('input', () => { s2.hist.add(num('s2').toFixed(2)); draw2(); });
  $('d2').addEventListener('input', draw2);
  $('clear2').addEventListener('click', () => { s2.hist = new Set([num('s2').toFixed(2)]); draw2(); });
  $('n3').addEventListener('input', draw3);
  $('d4').addEventListener('input', () => { s4.seeds = []; draw4(); });
  $('add1').addEventListener('click', () => addBatches(1));
  $('add5').addEventListener('click', () => addBatches(5));
  $('clear4').addEventListener('click', () => { s4.seeds = []; draw4(); });
  $('k5').max = String(CK.length - 1);
  $('k5').addEventListener('input', () => { stopAnim('s5'); draw5(); });
  $('play5').addEventListener('click', play5);
  $('stop5').addEventListener('click', () => { stopAnim('s5'); $('k5').value = String(STOP); draw5(); });

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
