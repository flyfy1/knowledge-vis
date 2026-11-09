'use strict';
// Patterns lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every table, seat and number comes from window.PATTERN_MODEL (model.js): seats are counted from the
// drawing, never from the formula. Canvas text: panel titles, axis ticks, seat numbers and "+k" labels,
// each kept in its own row or inside its own chair.
(function () {

const $ = id => document.getElementById(id);
const M = window.PATTERN_MODEL;
const t = (...a) => window.PATTERN_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', wood: '#8a6a4a', woodEdge: '#c79a6b', chair: '#55657a' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) canvas.dataset.h = canvas.getAttribute('height') || 300;
  const height = Number(width < 520 && canvas.dataset.narrowH ? canvas.dataset.narrowH : canvas.dataset.h);
  if (canvas.style.height !== height + 'px') canvas.style.height = height + 'px';
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

/* ---------- drawing tables and seats ---------- */
// Fit the model box (with seats) into rect at equal scale (capped), centred; y up.
function fitView(rect, polys, cap = 64) {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  polys.forEach(p => p.forEach(([x, y]) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }));
  x0 -= 0.62; x1 += 0.62; y0 -= 0.62; y1 += 0.62;
  const s = Math.min(cap, (rect.R - rect.L) / (x1 - x0), (rect.B - rect.T) / (y1 - y0));
  const cx = (rect.L + rect.R) / 2, cy = (rect.T + rect.B) / 2, mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
  return { s, X: x => cx + (x - mx) * s, Y: y => cy - (y - my) * s };
}
function drawTables(ctx, v, polys, colorOf) {
  polys.forEach((p, i) => {
    ctx.save(); ctx.beginPath(); p.forEach(([x, y], k) => { if (!k) ctx.moveTo(v.X(x), v.Y(y)); else ctx.lineTo(v.X(x), v.Y(y)); }); ctx.closePath();
    ctx.fillStyle = colorOf ? colorOf(i) : C.wood; ctx.fill(); ctx.strokeStyle = C.woodEdge; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
  });
}
const chairR = v => Math.max(4.5, Math.min(13, v.s * 0.2));
function chair(ctx, v, seat, fill, { label = null, hollow = false, alpha = 1 } = {}) {
  const r = chairR(v), X = v.X(seat.x), Y = v.Y(seat.y);
  ctx.save(); ctx.globalAlpha = alpha; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7);
  if (hollow) { ctx.fillStyle = C.bg; ctx.fill(); ctx.strokeStyle = fill; ctx.lineWidth = 1.8; ctx.stroke(); } else { ctx.fillStyle = fill; ctx.fill(); }
  if (label !== null && r >= 7) {
    ctx.fillStyle = '#081018'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    let size = Math.min(11, r * 1.15); ctx.font = `700 ${size}px system-ui,sans-serif`;
    while (ctx.measureText(String(label)).width > r * 1.8 && size > 7) { size -= 0.5; ctx.font = `700 ${size}px system-ui,sans-serif`; }
    ctx.fillText(String(label), X, Y + 0.5);
  }
  ctx.restore();
}
function cross(ctx, v, seat, color, alpha = 1) {
  const r = chairR(v) * 0.9, X = v.X(seat.x), Y = v.Y(seat.y);
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.moveTo(X - r, Y - r); ctx.lineTo(X + r, Y + r); ctx.moveTo(X + r, Y - r); ctx.lineTo(X - r, Y + r); ctx.stroke(); ctx.restore();
}

/* ---------- small bar chart with a "+k" row ---------- */
// values: array for x = first..; shows bars, a row of increments above, ticks on the left.
function barChart(ctx, rect, values, o) {
  const P = { l: rect.L + 30, r: rect.R - 6, t: rect.T + 34, b: rect.B - 20 }, n = o.slots;
  const step = (P.r - P.l) / n, bw = Math.min(30, step * 0.56), yMax = o.yMax;
  const y = v => P.b - v / yMax * (P.b - P.t), x = i => P.l + step * (i + 0.5);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.lineWidth = 1;
  o.yTicks.forEach(v => { ctx.strokeStyle = v ? C.grid : C.axis; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(String(v), P.l - 6, y(v) + 4); });
  ctx.textAlign = 'center';
  for (let i = 0; i < n; i++) ctx.fillText(String(o.first + i), x(i), P.b + 14);
  values.forEach((v, i) => { ctx.fillStyle = i === values.length - 1 ? o.color : o.dim; ctx.fillRect(x(i) - bw / 2, y(v), bw, P.b - y(v)); });
  // increments: one row, centred between neighbouring bars, with a small arc
  ctx.font = '600 11px system-ui,sans-serif';
  for (let i = 1; i < values.length; i++) {
    const d = values[i] - values[i - 1], xm = (x(i - 1) + x(i)) / 2;
    ctx.strokeStyle = C.orange; ctx.globalAlpha = 0.7; ctx.beginPath(); ctx.moveTo(x(i - 1), P.t - 4); ctx.quadraticCurveTo(xm, P.t - 16, x(i), P.t - 4); ctx.stroke(); ctx.globalAlpha = 1;
    ctx.fillStyle = C.orange; ctx.fillText('+' + d, xm, P.t - 18);
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, rect.L + 6, rect.T + 4, rect.R - rect.L - 12);
}

/* ---------- shared animation runner ---------- */
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

/* ---------- step 0: count ---------- */
const s0 = { shown: Infinity, seen: new Map() };
function draw0() {
  const n = num('n0'); $('n0v').textContent = n;
  const polys = M.row('square', n), S = M.seats(polys), order = M.seatOrder(S.free);
  s0.seen.set(n, S.free.length);
  const { ctx, W, H } = fitCanvas($('c0'));
  title(ctx, t('c0', { n }), 10, 20, W - 20);
  const v = fitView({ L: 10, T: 30, R: W - 10, B: H - 10 }, polys);
  drawTables(ctx, v, polys);
  order.forEach((seat, i) => chair(ctx, v, seat, i < s0.shown ? C.cyan : C.chair, { label: i < s0.shown ? i + 1 : null }));
  const counted = Math.min(s0.shown, S.free.length);
  const prog = counted < S.free.length ? t('s0progress', { c: counted, N: S.free.length }) : '';
  const hist = [...s0.seen.entries()].sort((a, b) => a[0] - b[0]).map(([k, s]) => t('pair', { n: k, s })).join(t('sep'));
  $('r0txt').textContent = prog + t('s0readout', { n, s: counted < S.free.length ? '?' : S.free.length, hist });
}

/* ---------- step 1: add one more ---------- */
const s1 = { n: 3, phase: 1 };
function draw1() {
  const n = s1.n, ph = s1.phase;
  const { ctx, W, H } = fitCanvas($('c1'));
  const picH = Math.round(H * 0.44);
  title(ctx, t('c1a', { n }), 10, 20, W - 20);
  const full = M.row('square', 8), v = fitView({ L: 10, T: 30, R: W - 10, B: picH }, full, 56);
  const polys = M.row('square', n), S = M.seats(polys);
  // the newest table slides in during the first half of the animation
  const slide = n > 1 ? Math.max(0, 1 - ph * 2) * 1.2 : 0;
  const shifted = polys.map((p, i) => (i === n - 1 ? p.map(([x, y]) => [x + slide, y]) : p));
  drawTables(ctx, v, shifted, i => (i === n - 1 && n > 1 ? '#a07a52' : C.wood));
  S.free.forEach(seat => chair(ctx, v, seat.table === n - 1 && slide ? { ...seat, x: seat.x + slide } : seat, seat.table === n - 1 && n > 1 ? C.green : C.cyan));
  if (n > 1) {
    // seats lost at the joint: shown before the push, crossed out after it
    const prev = M.seats(M.row('square', n - 1)).free, now = new Set(S.free.map(s => `${s.x.toFixed(3)},${s.y.toFixed(3)}`));
    const lostOld = prev.filter(s => !now.has(`${s.x.toFixed(3)},${s.y.toFixed(3)}`));
    const lostNew = S.hidden.filter(s => s.table === n - 1);
    const alpha = ph < 0.5 ? 1 : Math.max(0.35, 1 - (ph - 0.5) * 1.3);
    lostOld.forEach(s => { chair(ctx, v, s, C.pink, { alpha }); if (ph >= 0.5) cross(ctx, v, s, C.pink); });
    lostNew.forEach(s => { const q = { ...s, x: s.x + slide }; chair(ctx, v, q, C.pink, { alpha }); if (ph >= 0.5) cross(ctx, v, q, C.pink); });
  }
  const vals = []; for (let k = 1; k <= n; k++) vals.push(M.countRow('square', k));
  barChart(ctx, { L: 6, T: picH + 14, R: W - 6, B: H - 4 }, vals, { slots: 8, first: 1, yMax: 20, yTicks: [0, 10, 20], color: C.cyan, dim: 'rgba(103,215,249,0.4)', title: t('c1b') });
  const d = n > 1 ? vals[n - 1] - vals[n - 2] : null;
  $('r1txt').textContent = n === 1 ? t('s1start', { s: vals[0] }) : t('s1readout', { n, s: vals[n - 1], p: vals[n - 2], d, own: M.SHAPES.square, lost: M.SHAPES.square - d, list: vals.join(t('sep')) });
  $('add1').disabled = n >= 8;
}

/* ---------- step 2: the rule without drawing ---------- */
function n2() { const raw = Math.round(Number($('big2').value)); return raw >= 1 && raw <= 1000 ? raw : num('n2'); }
function draw2() {
  const n = n2(); $('n2v').textContent = num('n2');
  const { ctx, W, H } = fitCanvas($('c2'));
  title(ctx, t('c2', { n }), 10, 20, W - 20);
  const shown = n <= 8 ? n : 4, polys = M.row('square', shown), S = M.seats(polys);
  // for n > 8 the last drawn table stands for table n and sits 0.6 further right, behind a gap of dots
  const drawn = polys.map((p, i) => p.map(([x, y]) => [x + (n > 8 && i === 3 ? 0.6 : 0), y]));
  const v = fitView({ L: 10, T: 30, R: W - 10, B: H - 10 }, n > 8 ? drawn : M.row('square', Math.max(shown, 4)), 60);
  drawTables(ctx, v, drawn, i => (i % 2 ? '#7c5f43' : C.wood));
  S.free.forEach(seat => {
    const end = seat.mx === 0 || seat.mx === shown; // the two end seats sit on the short sides
    const dx = n > 8 && seat.table === 3 ? 0.6 : 0;
    chair(ctx, v, { ...seat, x: seat.x + dx }, end ? C.orange : C.cyan);
  });
  if (n > 8) { // a gap with three dots stands for the tables not drawn
    ctx.save(); ctx.fillStyle = C.muted;
    for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(v.X(3.12 + k * 0.18), v.Y(0.5), 2.6, 0, 7); ctx.fill(); }
    ctx.restore();
  }
  const S2 = 2 * n, total = M.formula('square', n), counted = M.countRow('square', n);
  $('r2txt').textContent = t('s2readout', { n, a: S2, s: total, g: counted, hidden: n > 8 ? t('s2hiddenNote', { m: n - 4 }) : '' });
}

/* ---------- step 3: other table shapes ---------- */
const s3 = { shape: 'square' };
const SHAPE_COL = { triangle: C.green, square: C.cyan, hexagon: C.violet };
function draw3() {
  const n = num('n3'), sh = s3.shape; $('n3v').textContent = n;
  ['triangle', 'square', 'hexagon'].forEach(k => $('sh3' + k).setAttribute('aria-pressed', k === sh));
  const { ctx, W, H } = fitCanvas($('c3'));
  const picH = Math.round(H * 0.42);
  title(ctx, t('c3a', { n, shape: t('shape_' + sh) }), 10, 20, W - 20);
  const polys = M.row(sh, n), S = M.seats(polys);
  const v = fitView({ L: 10, T: 30, R: W - 10, B: picH }, M.row('hexagon', 8).map(p => p.map(([x, y]) => [x * 0.98, y])), 46);
  // use the hexagon row (the widest) for the scale so the three shapes are comparable; left-align
  drawTables(ctx, v, polys);
  S.free.forEach(seat => chair(ctx, v, seat, SHAPE_COL[sh]));
  // chart: seats vs n for all three shapes
  const R = { L: 6, T: picH + 14, R: W - 6, B: H - 4 }, P = { l: R.L + 30, r: R.R - 10, t: R.T + 22, b: R.B - 20 };
  const x = k => P.l + (k - 1) / 7 * (P.r - P.l), y = s => P.b - s / 40 * (P.b - P.t);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  [0, 10, 20, 30, 40].forEach(s => { ctx.strokeStyle = s ? C.grid : C.axis; ctx.beginPath(); ctx.moveTo(P.l, y(s)); ctx.lineTo(P.r, y(s)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(String(s), P.l - 6, y(s) + 4); });
  ctx.textAlign = 'center'; for (let k = 1; k <= 8; k++) ctx.fillText(String(k), x(k), P.b + 14);
  ['triangle', 'square', 'hexagon'].forEach(k => {
    const on = k === sh; ctx.strokeStyle = SHAPE_COL[k]; ctx.fillStyle = SHAPE_COL[k]; ctx.globalAlpha = on ? 1 : 0.3; ctx.lineWidth = on ? 2.4 : 1.4;
    ctx.beginPath(); for (let q = 1; q <= 8; q++) { const Y = y(M.countRow(k, q)); if (q === 1) ctx.moveTo(x(q), Y); else ctx.lineTo(x(q), Y); } ctx.stroke();
    for (let q = 1; q <= 8; q++) { ctx.beginPath(); ctx.arc(x(q), y(M.countRow(k, q)), on && q === n ? 6 : on ? 3.5 : 2.5, 0, 7); ctx.fill(); }
  });
  ctx.restore();
  title(ctx, t('c3b'), R.L + 6, R.T + 4, R.R - R.L - 12);
  const s = S.free.length, own = M.SHAPES[sh], d = M.perTable(sh);
  $('r3txt').textContent = t('s3readout', { shape: t('shape_' + sh), n, s, own, d, f: M.formula(sh, n) });
}

/* ---------- step 4: work backwards ---------- */
function draw4() {
  const S = num('g4'); $('g4v').textContent = S;
  const n = M.tablesNeeded(S), polys = M.row('square', n), seats = M.seatOrder(M.seats(polys).free);
  const { ctx, W, H } = fitCanvas($('c4'));
  title(ctx, t('c4', { S, n }), 10, 20, W - 20);
  const v = fitView({ L: 10, T: 30, R: W - 10, B: H - 10 }, polys, 60);
  drawTables(ctx, v, polys);
  seats.forEach((seat, i) => chair(ctx, v, seat, i < S ? C.orange : C.muted, { hollow: i >= S }));
  const q = (S - 2) / 2, exact = Number.isInteger(q);
  $('r4txt').textContent = t('s4readout', { S, q: exact ? String(q) : q.toFixed(1), round: exact ? t('s4exact') : t('s4up'), n, seats: seats.length, empty: seats.length - S, less: n > 1 ? M.formula('square', n - 1) : 0 });
}

/* ---------- step 5: when the increment changes ---------- */
function draw5() {
  const k = num('k5'); $('k5v').textContent = k;
  const polys = M.block(k), S = M.seats(polys);
  const { ctx, W, H } = fitCanvas($('c5'));
  const wide = W >= 560, picR = wide ? { L: 10, T: 30, R: W * 0.42, B: H - 10 } : { L: 10, T: 30, R: W - 10, B: Math.round(H * 0.42) };
  title(ctx, t('c5a', { k }), 10, 20, (wide ? W * 0.42 : W) - 20);
  const v = fitView(picR, polys, 40);
  drawTables(ctx, v, polys, i => ((Math.floor(i / k) + i) % 2 ? '#7c5f43' : C.wood));
  S.free.forEach(seat => chair(ctx, v, seat, C.cyan));
  const tables = [], seats = [];
  for (let q = 1; q <= k; q++) { tables.push(q * q); seats.push(M.seats(M.block(q)).free.length); }
  const area = wide ? { L: W * 0.44, T: 8, R: W - 6, B: H - 4 } : { L: 6, T: Math.round(H * 0.42) + 12, R: W - 6, B: H - 4 };
  const mid = (area.T + area.B) / 2;
  barChart(ctx, { L: area.L, T: area.T, R: area.R, B: mid - 6 }, tables, { slots: 6, first: 1, yMax: 36, yTicks: [0, 18, 36], color: C.orange, dim: 'rgba(255,180,84,0.45)', title: t('c5b') });
  barChart(ctx, { L: area.L, T: mid + 6, R: area.R, B: area.B }, seats, { slots: 6, first: 1, yMax: 24, yTicks: [0, 12, 24], color: C.cyan, dim: 'rgba(103,215,249,0.4)', title: t('c5c') });
  const sep = t('sep');
  $('r5txt').textContent = t('s5readout', { k, T: k * k, S: S.free.length, tl: tables.join(sep), td: M.diffs(tables).join(sep) || '—', sl: seats.join(sep), sd: M.diffs(seats).join(sep) || '—' });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  $('n0').addEventListener('input', () => { stopAnim('s0'); s0.shown = Infinity; draw0(); });
  $('count0').addEventListener('click', () => {
    const N = M.countRow('square', num('n0'));
    s0.shown = 0; draw0();
    animate('s0', N * 380, p => { s0.shown = Math.min(N, Math.floor(p * (N + 0.999))); draw0(); }, () => { s0.shown = Infinity; draw0(); });
  });
  $('add1').addEventListener('click', () => { if (s1.n >= 8) return; s1.n++; s1.phase = 0; draw1(); animate('s1', 1600, p => { s1.phase = p; draw1(); }); });
  $('reset1').addEventListener('click', () => { stopAnim('s1'); s1.n = 1; s1.phase = 1; draw1(); });
  $('n2').addEventListener('input', () => { $('big2').value = ''; draw2(); });
  $('big2').addEventListener('input', draw2);
  $('checkQuiz').addEventListener('click', () => {
    const v = Number($('quiz2').value), right = M.formula('square', 25), okA = $('quiz2').value.trim() !== '' && v === right;
    $('quizFeedback').textContent = $('quiz2').value.trim() === '' ? t('quizEmpty') : okA ? t('quizRight', { s: right }) : t('quizWrong', { v: $('quiz2').value.trim() });
    $('quizFeedback').style.color = okA ? C.green : C.orange;
  });
  ['triangle', 'square', 'hexagon'].forEach(k => $('sh3' + k).addEventListener('click', () => { s3.shape = k; draw3(); }));
  $('n3').addEventListener('input', draw3);
  $('g4').addEventListener('input', draw4);
  $('k5').addEventListener('input', draw5);

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
  window.refreshPatterns = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
