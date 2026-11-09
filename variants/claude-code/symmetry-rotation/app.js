'use strict';
// Symmetry & rotation lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every axis, matching angle, fold mismatch and kaleidoscope copy comes from window.SYM_MODEL (model.js).
// The only canvas text is one title row per canvas; all other labels live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.SYM_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', grey: '#8696aa', wedge: '#18283a' };
const RAD = Math.PI / 180;
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const deg = v => `${Math.round(v * 10) / 10}°`;
const list = arr => (arr.length ? t('foundList', { angles: arr.map(deg).join(t('sep')) }) : '');

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) { canvas.dataset.h = canvas.getAttribute('height') || 300; canvas.style.height = canvas.dataset.h + 'px'; }
  const height = Number(canvas.dataset.h);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height); ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}
function title(ctx, text, X, Y, maxW) {
  let size = 13; ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
// Shape coordinates (y up, |p| ≲ 1.9) → canvas pixels, centred below the title row.
function view(W, H, R = 1.95) { const u = Math.min(W - 16, H - 36) / (2 * R), cx = W / 2, cy = 30 + (H - 30) / 2; return { u, cx, cy, X: ([x, y]) => [cx + x * u, cy - y * u] }; }
function poly(ctx, v, P, { fill = null, stroke = null, lw = 2, dash = null, alpha = 1 } = {}) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.beginPath(); P.forEach((p, i) => { const [x, y] = v.X(p); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.stroke(); }
  ctx.restore();
}
function circle(ctx, v, r, opts) { const pts = []; for (let i = 0; i < 120; i++) pts.push([r * Math.cos(i * 3 * RAD), r * Math.sin(i * 3 * RAD)]); poly(ctx, v, pts, opts); }
function lineAt(ctx, v, a, len, color, lw = 2, dash = null, alpha = 1) {
  const d = [Math.cos(a * RAD) * len, Math.sin(a * RAD) * len], [x0, y0] = v.X([-d[0], -d[1]]), [x1, y1] = v.X(d);
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.restore();
}
function dotAt(ctx, v, p, r, color, ring = false) { const [x, y] = v.X(p); ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); if (ring) { ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke(); } else { ctx.fillStyle = color; ctx.fill(); } ctx.restore(); }
// A partial flip across the line at angle a: the normal component is scaled by cos(πs), s ∈ [0, 1].
const flipStep = (p, a, s) => { const q = M.rot(p, -a); return M.rot([q[0], q[1] * Math.cos(Math.PI * s)], a); };

/* ---------- animation runner ---------- */
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

function shapeButtons(boxId, names, state, onPick) {
  const box = $(boxId);
  box.innerHTML = names.map(n => `<button class="btn toggle" type="button" data-shape="${n}" data-step="${boxId.slice(-1)}"></button>`).join('');
  box.querySelectorAll('button').forEach(b => b.addEventListener('click', () => onPick(b.dataset.shape)));
}
function labelShapeButtons(boxId, current) {
  $(boxId).querySelectorAll('button').forEach(b => { b.textContent = t('shp_' + b.dataset.shape); b.setAttribute('aria-pressed', b.dataset.shape === current ? 'true' : 'false'); });
}

/* ---------- step 0: try a fold ---------- */
const S0 = ['rect', 'isosceles', 'parallelogram', 'scalene'];
const s0 = { shape: 'rect', fold: 0, tried: {} };
function draw0() {
  const name = s0.shape, P = M.SHAPES[name], a = num('a0');
  labelShapeButtons('shapes0', name); $('a0v').textContent = deg(a);
  const tried = s0.tried[name] || (s0.tried[name] = new Map());
  const { ctx, W, H } = fitCanvas($('c0'));
  title(ctx, t('shp_' + name), 8, 18, W - 16);
  const v = view(W, H);
  // history marks: both ends of every tried fold line
  for (let b = 0; b < 180; b += 15) for (const e of [b, b + 180]) {
    const st = tried.get(b), c = st === undefined ? C.grid : st ? C.green : C.pink, p0 = [1.72 * Math.cos(e * RAD), 1.72 * Math.sin(e * RAD)], p1 = [1.9 * Math.cos(e * RAD), 1.9 * Math.sin(e * RAD)];
    const [x0, y0] = v.X(p0), [x1, y1] = v.X(p1); ctx.save(); ctx.strokeStyle = c; ctx.lineWidth = st === undefined ? 2 : 4; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.restore();
  }
  // halves: the side with n·p ≥ 0 stays (cyan); the other flips by s0.fold
  const half = (sign, s) => {
    ctx.save();
    const nx = -Math.sin(a * RAD), ny = Math.cos(a * RAD), far = 6, d = [Math.cos(a * RAD) * far, Math.sin(a * RAD) * far];
    const region = sign > 0 ? [[-d[0], -d[1]], d, [d[0] + nx * far, d[1] + ny * far], [-d[0] + nx * far, -d[1] + ny * far]] : [[-d[0], -d[1]], d, [d[0] - nx * far, d[1] - ny * far], [-d[0] - nx * far, -d[1] - ny * far]];
    const R = region.map(p => flipStep(p, a, s));
    ctx.beginPath(); R.forEach((p, i) => { const [x, y] = v.X(p); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); ctx.clip();
    const Q = P.map(p => flipStep(p, a, s));
    poly(ctx, v, Q, sign > 0 ? { fill: 'rgba(103,215,249,.55)', stroke: C.cyan } : { fill: 'rgba(255,180,84,.55)', stroke: C.orange });
    ctx.restore();
  };
  half(1, 0);
  if (Math.abs(Math.cos(Math.PI * s0.fold)) > 0.02) half(-1, s0.fold);
  lineAt(ctx, v, a, 1.7, C.text, 1.6, [6, 5]);
  dotAt(ctx, v, [0, 0], 3, C.text);
  const found = [...tried.entries()].filter(e => e[1]).map(e => e[0]).sort((x, y) => x - y);
  const base = { a, tried: tried.size, found: found.length, list: list(found) };
  if (anims.s0) $('r0').textContent = t('r0mid');
  else if (s0.fold < 1) $('r0').textContent = t('r0open', base);
  else { const mis = M.foldMismatch(name, a); $('r0').textContent = M.isAxis(name, a) ? t('r0yes', base) : t('r0no', { ...base, pct: Math.max(1, Math.round(mis * 100)) }); }
}
function doFold() {
  const name = s0.shape, a = num('a0');
  animate('s0', 1100, p => { s0.fold = p; draw0(); }, () => {
    s0.fold = 1; (s0.tried[name] || (s0.tried[name] = new Map())).set(a, M.isAxis(name, a)); draw0();
  });
}

/* ---------- step 1: count lines of symmetry ---------- */
const S1 = ['square', 'rect', 'equilateral', 'isosceles', 'pentagon', 'hexagon', 'parallelogram', 'circle'];
const PRED = ['0', '1', '2', '3', '4', '5', '6', 'inf'];
const s1 = { shape: 'square', sweep: null, done: {}, pred: null };
function draw1() {
  const name = s1.shape, P = M.SHAPES[name], ax = M.axes(name);
  labelShapeButtons('shapes1', name);
  $('pred1').querySelectorAll('.pv').forEach(sp => { sp.textContent = sp.dataset.v === 'inf' ? t('predInf') : sp.dataset.v; });
  const { ctx, W, H } = fitCanvas($('c1'));
  title(ctx, t('shp_' + name), 8, 18, W - 16);
  const v = view(W, H, 1.8);
  if (P) poly(ctx, v, P, { fill: 'rgba(103,215,249,.35)', stroke: C.cyan }); else circle(ctx, v, M.CIRCLE_R, { fill: 'rgba(103,215,249,.35)', stroke: C.cyan });
  const upto = s1.sweep === null ? (s1.done[name] ? 180 : -1) : s1.sweep;
  const shown = P ? ax.filter(a => a <= upto) : (upto >= 0 ? Array.from({ length: Math.floor(upto / 6) + 1 }, (_, i) => i * 6) : []);
  shown.forEach(a => lineAt(ctx, v, a, 1.75, C.green, P ? 2.6 : 1.2, null, P ? 1 : 0.7));
  if (s1.sweep !== null) lineAt(ctx, v, s1.sweep, 1.75, C.text, 1.6, [6, 5]);
  dotAt(ctx, v, [0, 0], 3, C.text);
  const shapeName = t('shp_' + name);
  if (s1.sweep !== null) $('r1').textContent = t('r1prog', { a: Math.round(s1.sweep), n: P ? shown.length : shown.length });
  else if (!s1.done[name]) $('r1').textContent = t('r1idle', { shape: shapeName });
  else {
    const n = P ? ax.length : Infinity;
    let s = !P ? t('r1inf') : n === 0 ? t('r1none', { shape: shapeName }) : t('r1done', { shape: shapeName, n, angles: list(ax) });
    const g = s1.done[name].pred;
    if (g === null) s += ' ' + t('r1nopred');
    else { const gv = g === 'inf' ? Infinity : Number(g); s += ' ' + (gv === n ? t('r1right') : t('r1wrong', { g: g === 'inf' ? t('predInf') : g })); }
    $('r1').textContent = s;
  }
  $('hist1').innerHTML = S1.filter(n => s1.done[n]).map(n => `<span class="chip good">${M.SHAPES[n] ? t('chip1', { shape: t('shp_' + n), n: M.axes(n).length }) : t('chip1inf', { shape: t('shp_' + n) })}</span>`).join('');
}

/* ---------- step 2: turning ---------- */
const S2 = ['square', 'rect', 'equilateral', 'parallelogram', 'pinwheel3', 'pinwheel4', 'isosceles'];
const s2 = { shape: 'square', found: {}, full: {} };
function draw2() {
  const name = s2.shape, P = M.SHAPES[name], a = num('r2');
  labelShapeButtons('shapes2', name); $('r2v').textContent = deg(a);
  const found = s2.found[name] || (s2.found[name] = new Set());
  const hit = a > 0 && M.turnsOnto(name, a);
  if (hit) found.add(a);
  const { ctx, W, H } = fitCanvas($('c2'));
  title(ctx, t('shp_' + name), 8, 18, W - 16);
  const v = view(W, H);
  // dial: 0° at the top of the ring (turning starts there), clockwise not needed — angles go anticlockwise like the shape
  ctx.save(); ctx.strokeStyle = C.grid; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(v.cx, v.cy, 1.82 * v.u, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  // the swept arc so far
  if (a > 0) { ctx.save(); ctx.strokeStyle = 'rgba(103,215,249,.55)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(v.cx, v.cy, 1.82 * v.u, 0, -a * RAD, true); ctx.stroke(); ctx.restore(); }
  for (const b of found) { const [x, y] = v.X([1.82 * Math.cos(b * RAD), 1.82 * Math.sin(b * RAD)]); ctx.save(); ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(x, y, 6.5, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
  poly(ctx, v, P, { stroke: C.grey, lw: 1.6, dash: [6, 5] });
  dotAt(ctx, v, P[1], 6, C.pink, true);
  const Q = P.map(p => M.rot(p, a));
  poly(ctx, v, Q, { fill: hit ? 'rgba(126,226,168,.45)' : 'rgba(103,215,249,.4)', stroke: hit ? C.green : C.cyan, lw: 2.4 });
  dotAt(ctx, v, Q[1], 6, C.pink);
  dotAt(ctx, v, [0, 0], 4, C.text);
  let s = a === 0 ? '' : t(hit ? 'r2hit' : 'r2miss', { a }) + ' ';
  const arr = [...found].sort((x, y) => x - y);
  s += arr.length ? t('r2found', { angles: list(arr) }) : t('r2none');
  if (s2.full[name]) { const n = M.order(name); s += ' ' + (n > 1 ? t('r2order', { n, min: 360 / n }) : t('r2only')); }
  $('rr2').textContent = s;
}

/* ---------- step 3: two flips make a turn ---------- */
const s3 = { p: 1 };
function draw3() {
  const th = num('th3'); $('th3v').textContent = deg(th);
  const T = M.twoMirrors(th), p = s3.p;
  const { ctx, W, H } = fitCanvas($('c3'));
  title(ctx, `θ = ${th}°　2θ = ${2 * th}°`, 8, 18, W - 16);
  const v = view(W, H, 1.75);
  lineAt(ctx, v, 0, 1.7, C.muted, 1.6, [6, 5]); lineAt(ctx, v, th, 1.7, C.muted, 1.6, [6, 5]);
  // angle marks: θ between the mirrors (small arc), 2θ from start to result (outer arc)
  const sa = Math.atan2(T.start[0][1], T.start[0][0]) / RAD;
  ctx.save(); ctx.strokeStyle = C.muted; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(v.cx, v.cy, 0.32 * v.u, 0, -th * RAD, true); ctx.stroke();
  if (p >= 1) { ctx.strokeStyle = C.text; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.arc(v.cx, v.cy, 1.62 * v.u, -sa * RAD, -(sa + 2 * th) * RAD, true); ctx.stroke(); }
  ctx.restore();
  poly(ctx, v, T.start, { fill: 'rgba(103,215,249,.6)', stroke: C.cyan });
  if (p >= 1) poly(ctx, v, T.turned, { stroke: C.text, lw: 2, dash: [5, 4] });
  if (p < 0.5) poly(ctx, v, T.start.map(q => flipStep(q, 0, p * 2)), { fill: 'rgba(134,150,170,.6)', stroke: C.grey });
  else {
    poly(ctx, v, T.once, { fill: 'rgba(134,150,170,.45)', stroke: C.grey });
    poly(ctx, v, T.once.map(q => flipStep(q, th, (p - 0.5) * 2)), { fill: 'rgba(255,180,84,.6)', stroke: C.orange });
  }
  dotAt(ctx, v, [0, 0], 3.5, C.text);
  $('r3').textContent = p < 0.5 ? t('r3p1') : p < 1 ? t('r3p2') : t('r3', { th, two: T.angle });
}

/* ---------- step 4: kaleidoscope ---------- */
const s4 = { stamps: M.STAMPS.map(s => ({ ...s })), mirror: true };
const wedgeAngle = () => (s4.mirror ? 180 : 360) / num('n4');
function flagPath(ctx, v, c) { poly(ctx, v, M.copyOutline(c), {}); }
function draw4() {
  const n = num('n4'); $('n4v').textContent = n; $('sr4v').textContent = num('sr4').toFixed(2); $('sa4v').textContent = num('sa4') + '%';
  $('mirror4').setAttribute('aria-pressed', s4.mirror ? 'true' : 'false'); $('mirror4').textContent = t(s4.mirror ? 'mirrorOn' : 'mirrorOff');
  const { ctx, W, H } = fitCanvas($('c4'));
  title(ctx, `n = ${n}　360° ÷ ${n} = ${deg(360 / n)}`, 8, 18, W - 16);
  const v = view(W, H, 1.75); s4.view = v;
  circle(ctx, v, 1.7, { fill: '#101b28', stroke: C.axis, lw: 1.5 });
  // drawing area: one wedge
  const wa = wedgeAngle(); ctx.save(); ctx.fillStyle = C.wedge; ctx.beginPath(); ctx.moveTo(v.cx, v.cy); ctx.arc(v.cx, v.cy, 1.7 * v.u, 0, -wa * RAD, true); ctx.closePath(); ctx.fill(); ctx.restore();
  if (s4.mirror) for (let k = 0; k < n; k++) lineAt(ctx, v, 180 * k / n, 1.7, C.grey, 1.2, [5, 5], 0.8);
  else for (let k = 0; k < n; k++) { const [x, y] = v.X([1.7 * Math.cos(360 * k / n * RAD), 1.7 * Math.sin(360 * k / n * RAD)]); ctx.save(); ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(v.cx, v.cy); ctx.lineTo(x, y); ctx.stroke(); ctx.restore(); }
  const copies = M.kaleido(s4.stamps, n, s4.mirror);
  for (const c of copies) {
    const own = c.k === 0 && !c.flip, col = own ? C.text : c.flip ? C.orange : C.cyan;
    poly(ctx, v, M.copyOutline(c), { fill: col, stroke: own ? '#ffffff' : null, lw: 1, alpha: own ? 1 : 0.85 });
  }
  dotAt(ctx, v, [0, 0], 3, C.text);
  const s = s4.stamps.length, m = s4.mirror ? 2 : 1;
  $('r4').textContent = s ? t('r4', { s, n, m: s4.mirror ? `${m} × ${n}` : `${n}`, total: copies.length, mstate: t(s4.mirror ? 'mOn' : 'mOff'), sym: t(s4.mirror ? 'symOn' : 'symOff', { deg: Number.isInteger(360 / n) ? 360 / n : '≈' + Math.round(3600 / n) / 10, n }) }) : t('r4empty');
}
function addStamp(r, a) { if (s4.stamps.length >= 12) s4.stamps.shift(); s4.stamps.push({ r, a }); draw4(); }

/* ---------- step 5: quiz ---------- */
const s5 = { state: [null, null, null] };
function quizParams() {
  const Q = M.QUIZ, rt = M.turns('rect'), sh = Q.q2.options[M.quizAnswers()[1]], n6 = M.order(Q.q3.shape);
  return [{ angles: list(rt).replace(/^[：:]\s?/, ''), min: rt[0] }, { shape: t('shp_' + sh), min: M.turns(sh)[0] }, { n: n6, min: 360 / n6 }];
}
function buildQuiz() {
  const Q = M.QUIZ, counts = [2, Q.q2.options.length, Q.q3.options.length];
  counts.forEach((c, qi) => { $('qz' + (qi + 1) + 'o').innerHTML = Array.from({ length: c }, (_, oi) => `<label><input type="radio" name="qz${qi + 1}" value="${oi}" data-step="5"><span id="qz${qi + 1}o${oi}"></span></label>`).join(''); });
}
function draw5() {
  const Q = M.QUIZ, p = quizParams();
  $('qz1o0').textContent = t('qz1a'); $('qz1o1').textContent = t('qz1b');
  Q.q2.options.forEach((s, i) => { $('qz2o' + i).textContent = t('shp_' + s); });
  Q.q3.options.forEach((d, i) => { $('qz3o' + i).textContent = t('opDeg', { v: d }); });
  s5.state.forEach((st, i) => {
    const fb = $('qz' + (i + 1) + 'f');
    fb.textContent = st === null ? '' : st === 'pick' ? t('pick') : t('qz' + (i + 1) + (st === 'ok' ? 'ok' : 'no'), p[i]);
    fb.style.color = st === 'ok' ? C.green : C.orange; fb.dataset.state = st || '';
  });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  shapeButtons('shapes0', S0, s0, n => { stopAnim('s0'); s0.shape = n; s0.fold = 0; draw0(); });
  $('a0').addEventListener('input', () => { stopAnim('s0'); s0.fold = 0; draw0(); });
  $('fold0').addEventListener('click', doFold);
  $('unfold0').addEventListener('click', () => { stopAnim('s0'); s0.fold = 0; draw0(); });

  $('pred1').insertAdjacentHTML('beforeend', PRED.map(p => `<label><input type="radio" name="pred1" value="${p}" data-step="1"><span class="pv" data-v="${p}"></span></label>`).join(''));
  $('pred1').querySelectorAll('input').forEach(i => i.addEventListener('change', () => { s1.pred = i.value; }));
  const clearPred = () => { s1.pred = null; $('pred1').querySelectorAll('input').forEach(i => { i.checked = false; }); };
  shapeButtons('shapes1', S1, s1, n => { stopAnim('s1'); s1.sweep = null; s1.shape = n; clearPred(); draw1(); });
  $('sweep1').addEventListener('click', () => {
    const name = s1.shape, pred = s1.pred; s1.sweep = 0;
    animate('s1', 3600, p => { s1.sweep = p >= 1 ? null : p * 180; if (p >= 1) s1.done[name] = { pred }; draw1(); });
  });

  shapeButtons('shapes2', S2, s2, n => { stopAnim('s2'); s2.shape = n; $('r2').value = 0; draw2(); });
  $('r2').addEventListener('input', () => { stopAnim('s2'); draw2(); });
  $('spin2').addEventListener('click', () => {
    const name = s2.shape;
    animate('s2', 6000, p => { const a = Math.round(p * 360); M.turns(name).filter(x => x <= a).forEach(x => s2.found[name].add(x)); $('r2').value = a; if (p >= 1) s2.full[name] = true; draw2(); });
  });

  $('th3').addEventListener('input', () => { stopAnim('s3'); s3.p = 1; draw3(); });
  $('play3').addEventListener('click', () => animate('s3', 3000, p => { s3.p = p; draw3(); }));

  ['n4', 'sr4', 'sa4'].forEach(id => $(id).addEventListener('input', draw4));
  $('mirror4').addEventListener('click', () => { s4.mirror = !s4.mirror; draw4(); });
  $('stamp4').addEventListener('click', () => addStamp(num('sr4'), wedgeAngle() * num('sa4') / 100));
  $('clear4').addEventListener('click', () => { s4.stamps = []; draw4(); });
  $('c4').addEventListener('click', e => {
    const v = s4.view, r = $('c4').getBoundingClientRect(), x = (e.clientX - r.left - v.cx) / v.u, y = -(e.clientY - r.top - v.cy) / v.u, d = Math.hypot(x, y);
    if (d > 1.6 || d < 0.15) return;
    addStamp(d - 0.15, Math.atan2(y, x) / RAD);
  });

  buildQuiz();
  [1, 2, 3].forEach(n => {
    $('qz' + n + 'c').addEventListener('click', () => { const ch = document.querySelector(`input[name="qz${n}"]:checked`), A = M.quizAnswers(); s5.state[n - 1] = !ch ? 'pick' : Number(ch.value) === A[n - 1] ? 'ok' : 'no'; draw5(); });
    document.querySelectorAll(`input[name="qz${n}"]`).forEach(inp => inp.addEventListener('change', () => { s5.state[n - 1] = null; draw5(); }));
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
