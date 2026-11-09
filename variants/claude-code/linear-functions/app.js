'use strict';
// Linear functions lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every point, slope, intercept, equation and crossing comes from window.LIN_MODEL (model.js). Canvas text
// is limited to one title row per panel and tick numbers outside the plot area; legends live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.LIN_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#1c2836', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', grey: '#55657a', ghost: '#3a4a5e' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const f = v => M.fmt(v);
const par = v => (v < 0 ? '(' + f(v) + ')' : f(v));
const signed = v => (v > 0 ? '+' : '') + f(v);

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
  let size = 13;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
const nice = (px, minPx) => [1, 2, 5, 10, 20, 50].find(s => s * px >= minPx) || 50;

// A coordinate plane. Equal scaling (1 across = 1 up) unless o.xr/o.yr are given. Tick numbers sit outside
// the plot (left and below), so they never meet the lines or points inside it.
function plane(ctx, W, o) {
  const L = 34, R = 10, top = o.top, bottom = o.bottom, availW = W - L - R, availH = bottom - top;
  let xMin, xMax, yMin, yMax, ux, uy, l;
  if (o.xr) { [xMin, xMax] = o.xr; [yMin, yMax] = o.yr; ux = availW / (xMax - xMin); uy = availH / (yMax - yMin); l = L; }
  else {
    const u = Math.min(availW / o.xSpan, availH / o.ySpan), xs = Math.min(availW / u, o.xMaxSpan || 18), ys = availH / u;
    xMin = o.cx - xs / 2; xMax = o.cx + xs / 2; yMin = o.cy - ys / 2; yMax = o.cy + ys / 2; ux = uy = u; l = L + (availW - xs * u) / 2;
  }
  const P = { l, r: l + (xMax - xMin) * ux, t: top, b: bottom };
  const x = v => P.l + (v - xMin) * ux, y = v => P.b - (v - yMin) * uy;
  ctx.save();
  ctx.fillStyle = '#0f1a26'; ctx.fillRect(P.l, P.t, P.r - P.l, P.b - P.t);
  const gx = nice(ux, 9), gy = nice(uy, 9);
  ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
  for (let v = Math.ceil(xMin / gx) * gx; v <= xMax + 1e-9; v += gx) { ctx.beginPath(); ctx.moveTo(x(v), P.t); ctx.lineTo(x(v), P.b); ctx.stroke(); }
  for (let v = Math.ceil(yMin / gy) * gy; v <= yMax + 1e-9; v += gy) { ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); }
  ctx.strokeStyle = C.axis; ctx.lineWidth = 1.6;
  if (xMin <= 0 && xMax >= 0) { ctx.beginPath(); ctx.moveTo(x(0), P.t); ctx.lineTo(x(0), P.b); ctx.stroke(); }
  if (yMin <= 0 && yMax >= 0) { ctx.beginPath(); ctx.moveTo(P.l, y(0)); ctx.lineTo(P.r, y(0)); ctx.stroke(); }
  ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  const lx = nice(ux, 26), ly = nice(uy, 18);
  ctx.textAlign = 'center';
  for (let v = Math.ceil(xMin / lx) * lx; v <= xMax + 1e-9; v += lx) ctx.fillText(f(v), x(v), P.b + 14);
  ctx.textAlign = 'right';
  for (let v = Math.ceil(yMin / ly) * ly; v <= yMax + 1e-9; v += ly) { const Y = y(v); if (Y > P.t + 4 && Y < P.b - 4) ctx.fillText(f(v), P.l - 5, Y + 4); }
  ctx.restore();
  return { x, y, P, xMin, xMax, yMin, yMax, ux, uy };
}
function clip(ctx, m, fn) { ctx.save(); ctx.beginPath(); ctx.rect(m.P.l, m.P.t, m.P.r - m.P.l, m.P.b - m.P.t); ctx.clip(); fn(); ctx.restore(); }
function seg(ctx, x0, y0, x1, y1, color, lw = 2, dash = null, alpha = 1) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.restore();
}
function drawLine(ctx, m, k, b, color, lw = 2.5, dash = null, alpha = 1) {
  clip(ctx, m, () => seg(ctx, m.x(m.xMin), m.y(M.y(k, b, m.xMin)), m.x(m.xMax), m.y(M.y(k, b, m.xMax)), color, lw, dash, alpha));
}
function dot(ctx, X, Y, r, color, ring = false) {
  ctx.save(); ctx.beginPath(); ctx.arc(X, Y, r, 0, Math.PI * 2);
  if (ring) { ctx.fillStyle = C.bg; ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth = 2.4; ctx.stroke(); } else { ctx.fillStyle = color; ctx.fill(); }
  ctx.restore();
}
// A labelled point: the letter sits inside the disc, so it can only meet another letter when two points coincide.
function namedPoint(ctx, X, Y, letter, color) {
  dot(ctx, X, Y, 9, color);
  ctx.save(); ctx.fillStyle = '#07131a'; ctx.font = '700 11px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(letter, X, Y + 0.5); ctx.restore();
}
// A point beyond the plot: an orange arrowhead on the nearest edge.
function edgeArrow(ctx, m, xv, yv, color) {
  const X = Math.max(m.P.l + 6, Math.min(m.P.r - 6, m.x(xv))), up = yv > m.yMax, Y = up ? m.P.t + 2 : m.P.b - 2, s = up ? 1 : -1;
  ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(X, Y); ctx.lineTo(X - 7, Y + 11 * s); ctx.lineTo(X + 7, Y + 11 * s); ctx.closePath(); ctx.fill(); ctx.restore();
}
const inView = (m, xv, yv) => xv >= m.xMin && xv <= m.xMax && yv >= m.yMin && yv <= m.yMax;

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

/* ---------- step 0: equal change per hour ---------- */
const B0 = 2, HOURS = 6;
const s0 = { mode: 'equal', shown: Infinity };
function draw0() {
  const k = num('k0'); $('k0v').textContent = f(k);
  $('modeEq').setAttribute('aria-pressed', s0.mode === 'equal' ? 'true' : 'false'); $('modeGrow').setAttribute('aria-pressed', s0.mode === 'growing' ? 'true' : 'false');
  const pts = M.readings(k, B0, HOURS, s0.mode), shown = Math.min(HOURS + 1, s0.shown), whole = Math.floor(shown), part = shown - whole;
  const { ctx, W, H } = fitCanvas($('c0'));
  title(ctx, t('c0title'), 8, 18, W - 16);
  const m = plane(ctx, W, { top: 30, bottom: H - 22, xr: [-0.4, 6.4], yr: [-12, 16] });
  clip(ctx, m, () => {
    for (let i = 1; i < Math.min(whole + (part > 0 ? 1 : 0), HOURS + 1); i++) {
      const a = pts[i - 1], b = pts[i], g = i < whole ? 1 : part, run = Math.min(1, g * 2), rise = Math.max(0, g * 2 - 1);
      seg(ctx, m.x(a.x), m.y(a.y), m.x(a.x + run), m.y(a.y), C.grey, 3);
      if (rise > 0) seg(ctx, m.x(b.x), m.y(a.y), m.x(b.x), m.y(a.y + (b.y - a.y) * rise), C.orange, 3);
    }
    if (whole >= 2) { ctx.save(); ctx.strokeStyle = C.text; ctx.globalAlpha = 0.55; ctx.setLineDash([5, 5]); ctx.lineWidth = 1.5; ctx.beginPath(); pts.slice(0, whole).forEach((p, i) => (i ? ctx.lineTo(m.x(p.x), m.y(p.y)) : ctx.moveTo(m.x(p.x), m.y(p.y)))); ctx.stroke(); ctx.restore(); }
  });
  pts.slice(0, whole).forEach(p => dot(ctx, m.x(p.x), m.y(p.y), 5, C.cyan));
  const f3 = v => M.fmt(v, 3), list = pts.slice(0, whole).map(p => `${p.x}→${f3(p.y)}`).join(', '), d = M.diffs(pts.slice(0, whole)).map(v => (v > 0 ? '+' : '') + f3(v)).join(', ');
  if (whole < HOURS + 1) $('r0').textContent = t('r0prog', { n: whole, list });
  else $('r0').textContent = t(k === 0 ? 'r0flat' : s0.mode === 'equal' ? 'r0eq' : 'r0grow', { list, diffs: d });
}

/* ---------- step 1: slope as rise over run ---------- */
const B1 = 1;
const s1 = { pairs: new Map() };
function tri(ctx, m, k, b, xA, xB, alpha) {
  const yA = M.y(k, b, xA), yB = M.y(k, b, xB);
  seg(ctx, m.x(xA), m.y(yA), m.x(xB), m.y(yA), C.muted, 3, null, alpha);
  seg(ctx, m.x(xB), m.y(yA), m.x(xB), m.y(yB), C.orange, 3, null, alpha);
}
function draw1() {
  const k = num('k1'), xA = num('xA1'), xB = num('xB1'), rr = M.riseRun(k, B1, xA, xB);
  $('k1v').textContent = f(k); $('xA1v').textContent = f(xA); $('xB1v').textContent = f(xB);
  if (rr.ratio !== null) s1.pairs.set(Math.min(xA, xB) + ',' + Math.max(xA, xB), [xA, xB]);
  const { ctx, W, H } = fitCanvas($('c1'));
  title(ctx, rr.ratio === null ? t('c1same') : t('c1title', { run: f(rr.run), rise: f(rr.rise) }), 8, 18, W - 16);
  const m = plane(ctx, W, { top: 30, bottom: H - 22, cx: 0, cy: 1, xSpan: 8, ySpan: 21, xMaxSpan: 18 });
  clip(ctx, m, () => { for (const [a, b] of s1.pairs.values()) if (!((a === xA && b === xB) || (a === xB && b === xA))) tri(ctx, m, k, B1, a, b, 0.28); });
  drawLine(ctx, m, k, B1, C.cyan);
  if (rr.ratio !== null) clip(ctx, m, () => tri(ctx, m, k, B1, xA, xB, 1));
  if (xA === xB) namedPoint(ctx, m.x(xA), m.y(M.y(k, B1, xA)), 'A', C.text);
  else { namedPoint(ctx, m.x(xA), m.y(M.y(k, B1, xA)), 'A', C.text); namedPoint(ctx, m.x(xB), m.y(M.y(k, B1, xB)), 'B', C.text); }
  if (rr.ratio === null) $('r1').textContent = t('r1same');
  else {
    let s = t('r1', { xA: f(xA), yA: f(M.y(k, B1, xA)), xB: f(xB), yB: f(M.y(k, B1, xB)), rise: f(rr.rise), run: f(rr.run), ratio: f(rr.ratio) });
    if (s1.pairs.size >= 2) s += ' ' + t('r1count', { n: s1.pairs.size, k: f(k) });
    $('r1').textContent = s;
  }
}

/* ---------- step 2: the intercept slides the line ---------- */
const s2 = { ghosts: [], prev: null, last: null, rot: false };
const SHIFT_X = [-4, 0, 4];
function draw2() {
  const b = num('b2'), k = num('k2');
  $('b2v').textContent = f(b); $('k2v').textContent = f(k);
  const { ctx, W, H } = fitCanvas($('c2'));
  title(ctx, t('c2title', { b: f(b), k: f(k) }), 8, 18, W - 16);
  const m = plane(ctx, W, { top: 30, bottom: H - 22, cx: 0, cy: 0, xSpan: 12, ySpan: 16, xMaxSpan: 18 });
  s2.ghosts.forEach((g, i) => drawLine(ctx, m, k, g, C.ghost, 2, null, 0.4 + 0.5 * (i + 1) / s2.ghosts.length));
  if (s2.prev !== null && s2.prev !== b) clip(ctx, m, () => SHIFT_X.forEach(xv => { seg(ctx, m.x(xv), m.y(M.y(k, s2.prev, xv)), m.x(xv), m.y(M.y(k, b, xv)), C.orange, 4); dot(ctx, m.x(xv), m.y(M.y(k, b, xv)), 3.5, C.orange); }));
  drawLine(ctx, m, k, b, C.cyan, 3);
  if (inView(m, 0, b)) dot(ctx, m.x(0), m.y(b), 6.5, C.green);
  if (s2.rot) $('r2').textContent = t('r2rot', { b: f(b), k: f(k) });
  else if (s2.prev === null || s2.prev === b) $('r2').textContent = t('r2first', { b: f(b), k: f(k) });
  else $('r2').textContent = t('r2', { b: f(b), db: signed(b - s2.prev), k: f(k) });
}

/* ---------- step 3: the equation and the function idea ---------- */
const s3 = { pts: new Set() };
function eqHTML(k, b) {
  // colour the slope term and the constant inside the model-built equation text
  const body = M.eq(k, b).slice(4), esc = v => v.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  if (k === 0) return 'y = <span class="b">' + esc(body) + '</span>';
  const i = body.indexOf('x') + 1, xs = body.slice(0, i), rest = body.slice(i);
  const m = rest.match(/^( [+−] )(.+)$/);
  return 'y = <span class="k">' + esc(xs) + '</span>' + (m ? m[1] + '<span class="b">' + esc(m[2]) + '</span>' : '');
}
function draw3() {
  const k = num('k3'), b = num('b3'), x = num('x3'), yv = M.y(k, b, x);
  $('k3v').textContent = f(k); $('b3v').textContent = f(b); $('x3v').textContent = f(x);
  s3.pts.add(x);
  $('eq3').innerHTML = eqHTML(k, b);
  const { ctx, W, H } = fitCanvas($('c3'));
  title(ctx, M.eq(k, b), 8, 18, W - 16);
  const m = plane(ctx, W, { top: 30, bottom: H - 22, cx: 0, cy: 0, xSpan: 13, ySpan: 18, xMaxSpan: 18 });
  clip(ctx, m, () => seg(ctx, m.x(x), m.P.t, m.x(x), m.P.b, C.muted, 1.4, [5, 5], 0.8));
  drawLine(ctx, m, k, b, C.cyan, 3);
  for (const xv of s3.pts) if (xv !== x && inView(m, xv, M.y(k, b, xv))) dot(ctx, m.x(xv), m.y(M.y(k, b, xv)), 4, C.grey);
  const vis = inView(m, x, yv);
  if (vis) {
    clip(ctx, m, () => { seg(ctx, m.x(x), m.y(yv), m.x(0), m.y(yv), C.orange, 1.4, [3, 4], 0.8); });
    dot(ctx, m.x(x), m.y(yv), 7, C.orange);
  } else edgeArrow(ctx, m, x, yv, C.orange);
  let s = t('r3', { k: f(k), x: par(x), px: f(x), b: par(b), kx: par(k * x), y: f(yv) });
  if (s3.pts.size >= 2) s += ' ' + t('r3count', { n: s3.pts.size });
  if (!vis) s += ' ' + t('r3off');
  $('r3').textContent = s;
}

/* ---------- step 4: a line through two points ---------- */
function draw4() {
  const x1 = num('x14'), y1 = num('y14'), x2 = num('x24'), y2 = num('y24'), L = M.through(x1, y1, x2, y2);
  ['x14', 'y14', 'x24', 'y24'].forEach(id => { $(id + 'v').textContent = f(num(id)); });
  const { ctx, W, H } = fitCanvas($('c4'));
  title(ctx, t('c4title', { x1: f(x1), y1: f(y1), x2: f(x2), y2: f(y2) }), 8, 18, W - 16);
  const m = plane(ctx, W, { top: 30, bottom: H - 22, cx: 0, cy: 0, xSpan: 12.5, ySpan: 12.5, xMaxSpan: 18 });
  if (L.kind === 'line') {
    drawLine(ctx, m, L.kv, L.bv, C.cyan, 3);
    clip(ctx, m, () => { seg(ctx, m.x(x1), m.y(y1), m.x(x2), m.y(y1), C.muted, 3); seg(ctx, m.x(x2), m.y(y1), m.x(x2), m.y(y2), C.orange, 3); });
    if (inView(m, 0, L.bv)) dot(ctx, m.x(0), m.y(L.bv), 6, C.green);
    $('eq4').textContent = M.eq(L.k, L.b);
    const kS = M.fstr(L.k), bS = M.fstr(L.b), kP = L.kv < 0 ? `(${kS})` : kS;
    $('r4').textContent = t('r4', { y2: f(y2), y1: par(y1), x2: par(x2), x1: par(x1), dy: f(y2 - y1), dx: f(x2 - x1), k: kS, kp: kP, b: bS, bp: L.bv < 0 ? `(${bS})` : bS, y2v: f(y2) });
  } else if (L.kind === 'vertical') {
    clip(ctx, m, () => seg(ctx, m.x(x1), m.P.t, m.x(x1), m.P.b, C.pink, 3));
    $('eq4').textContent = 'x = ' + f(x1);
    $('r4').textContent = t('r4vert', { x: f(x1) });
  } else { $('eq4').textContent = '—'; $('r4').textContent = t('r4same'); }
  if (L.kind === 'same') namedPoint(ctx, m.x(x1), m.y(y1), 'P', C.text);
  else { namedPoint(ctx, m.x(x1), m.y(y1), 'P', C.text); namedPoint(ctx, m.x(x2), m.y(y2), 'Q', C.text); }
}

/* ---------- step 5: two lines meet ---------- */
const K1 = 0.5, B1L = 2;
function draw5() {
  const k2 = num('k5'), b2 = num('b5'), mt = M.meet(K1, B1L, k2, b2);
  $('k5v').textContent = f(k2); $('b5v').textContent = f(b2);
  const { ctx, W, H } = fitCanvas($('c5'));
  title(ctx, t('c5top', { eq1: M.eq(K1, B1L), eq2: M.eq(k2, b2) }), 8, 18, W - 16);
  const split = Math.round(H * 0.6);
  const m = plane(ctx, W, { top: 30, bottom: split - 22, cx: 0, cy: 1, xSpan: 13, ySpan: 12, xMaxSpan: 16 });
  drawLine(ctx, m, K1, B1L, C.cyan, 3);
  drawLine(ctx, m, k2, b2, C.orange, 3, mt.kind === 'same' ? [8, 6] : null);
  const vis = mt.kind === 'one' && inView(m, mt.x, mt.y);
  if (vis) { dot(ctx, m.x(mt.x), m.y(mt.y), 8, C.text, true); dot(ctx, m.x(mt.x), m.y(mt.y), 3, C.text); }
  // gap bars at each whole x in view, on the same x positions as the plane above
  title(ctx, t('c5bot'), 8, split + 4, W - 16);
  const top = split + 16, bot = H - 8, xs = [];
  for (let v = Math.ceil(m.xMin); v <= Math.floor(m.xMax); v++) xs.push(v);
  const gaps = xs.map(v => M.gap(K1, B1L, k2, b2, v)), gmax = Math.max(2, ...gaps.map(Math.abs)), mid = (top + bot) / 2, sc = (bot - top) / 2 / gmax;
  ctx.save(); ctx.fillStyle = '#0f1a26'; ctx.fillRect(m.P.l, top, m.P.r - m.P.l, bot - top);
  ctx.strokeStyle = C.axis; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(m.P.l, mid); ctx.lineTo(m.P.r, mid); ctx.stroke();
  ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'right';
  ctx.fillText('0', m.P.l - 5, mid + 4); ctx.fillText(f(Math.round(gmax * 10) / 10), m.P.l - 5, top + 10); ctx.fillText(f(-Math.round(gmax * 10) / 10), m.P.l - 5, bot - 2);
  const bw = Math.max(3, Math.min(16, m.ux * 0.5));
  xs.forEach((v, i) => { const g = gaps[i]; ctx.fillStyle = g >= 0 ? C.green : C.pink; ctx.fillRect(m.x(v) - bw / 2, g >= 0 ? mid - g * sc : mid, bw, Math.abs(g) * sc); });
  if (mt.kind === 'one' && mt.x >= m.xMin && mt.x <= m.xMax) { ctx.strokeStyle = C.text; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(m.x(mt.x), top); ctx.lineTo(m.x(mt.x), bot); ctx.stroke(); }
  ctx.restore();
  if (vis) clip(ctx, m, () => seg(ctx, m.x(mt.x), m.y(mt.y), m.x(mt.x), m.P.b, C.text, 1, [4, 4], 0.6));
  // readout
  if (mt.kind === 'one') {
    const ap = v => (Math.abs(Math.round(v * 100) / 100 - v) > 1e-9 ? '≈' : '') + f(v);
    let s = t('r5one', { x: ap(mt.x), y: ap(mt.y), xp: mt.x < 0 ? `(${ap(mt.x)})` : ap(mt.x), k2: f(k2), b2p: par(b2), step: signed(mt.gapStep) });
    if (!vis) s += ' ' + t('r5off');
    $('r5').textContent = s;
  } else $('r5').textContent = mt.kind === 'parallel' ? t('r5par', { gap: f(mt.gap0) }) : t('r5same');
}

/* ---------- step 6: quiz ---------- */
const s6 = { state: [null, null, null] };
function quizParams() {
  const Q = M.QUIZ, mt = M.meet(Q.q3.a[0], Q.q3.a[1], Q.q3.b[0], Q.q3.b[1]);
  return [
    { b: f(Q.q1.b), k: f(Q.q1.k), eq: M.eq(Q.q1.k, Q.q1.b) },
    { k: f(Q.q2.perKm), b: f(Q.q2.start), x: f(Q.q2.km), y: f(M.y(Q.q2.perKm, Q.q2.start, Q.q2.km)) },
    { k1: f(Q.q3.a[0]), b1: f(Q.q3.a[1]), k2: f(Q.q3.b[0]), x: f(mt.x), y: f(mt.y), gap0: f(Q.q3.a[1] - Q.q3.b[1]), step: f(Q.q3.b[0] - Q.q3.a[0]) }
  ];
}
function buildQuiz() {
  const Q = M.QUIZ;
  [Q.q1.options, Q.q2.options, Q.q3.options].forEach((opts, qi) => {
    $('qz' + (qi + 1) + 'o').innerHTML = opts.map((_, oi) => `<label><input type="radio" name="qz${qi + 1}" value="${oi}" data-step="6"><span id="qz${qi + 1}o${oi}"></span></label>`).join('');
  });
}
function draw6() {
  const Q = M.QUIZ, p = quizParams();
  Q.q1.options.forEach(([k, b], i) => { $('qz1o' + i).textContent = M.eq(k, b); });
  Q.q2.options.forEach((v, i) => { $('qz2o' + i).textContent = t('opYuan', { v }); });
  Q.q3.options.forEach((v, i) => { $('qz3o' + i).textContent = t('opGB', { v }); });
  const { ctx, W, H } = fitCanvas($('c6'));
  const m = plane(ctx, W, { top: 10, bottom: H - 22, cx: 0, cy: 0, xSpan: 9, ySpan: 8, xMaxSpan: 10 });
  drawLine(ctx, m, Q.q1.k, Q.q1.b, C.cyan, 3);
  [[0, 2], [1, 1], [2, 0]].forEach(([a, b]) => dot(ctx, m.x(a), m.y(b), 4.5, C.text));
  s6.state.forEach((st, i) => {
    const fb = $('qz' + (i + 1) + 'f');
    fb.textContent = st === null ? '' : st === 'pick' ? t('pick') : t('qz' + (i + 1) + (st === 'ok' ? 'ok' : 'no'), p[i]);
    fb.style.color = st === 'ok' ? C.green : C.orange; fb.dataset.state = st || '';
  });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); draw6(); }

function setup() {
  const record = () => { s0.shown = 0; animate('s0', 7 * 520, p => { s0.shown = p >= 1 ? Infinity : p * (HOURS + 1); draw0(); }); };
  $('rec0').addEventListener('click', record);
  $('k0').addEventListener('input', () => { stopAnim('s0'); s0.shown = Infinity; draw0(); });
  $('modeEq').addEventListener('click', () => { s0.mode = 'equal'; record(); });
  $('modeGrow').addEventListener('click', () => { s0.mode = 'growing'; record(); });

  $('k1').addEventListener('input', () => { s1.pairs.clear(); draw1(); });
  ['xA1', 'xB1'].forEach(id => $(id).addEventListener('input', draw1));

  s2.last = num('b2');
  $('b2').addEventListener('input', () => {
    const b = num('b2'); if (b === s2.last) return;
    s2.ghosts.push(s2.last); if (s2.ghosts.length > 6) s2.ghosts.shift();
    s2.prev = s2.last; s2.last = b; s2.rot = false; draw2();
  });
  $('k2').addEventListener('input', () => { s2.ghosts = []; s2.prev = null; s2.last = num('b2'); s2.rot = true; draw2(); });

  ['k3', 'b3'].forEach(id => $(id).addEventListener('input', () => { s3.pts.clear(); draw3(); }));
  $('x3').addEventListener('input', draw3);

  ['x14', 'y14', 'x24', 'y24'].forEach(id => $(id).addEventListener('input', draw4));
  ['k5', 'b5'].forEach(id => $(id).addEventListener('input', draw5));

  buildQuiz();
  [1, 2, 3].forEach(n => {
    $('qz' + n + 'c').addEventListener('click', () => {
      const ch = document.querySelector(`input[name="qz${n}"]:checked`), A = M.quizAnswers();
      s6.state[n - 1] = !ch ? 'pick' : Number(ch.value) === A[n - 1] ? 'ok' : 'no';
      draw6();
    });
    document.querySelectorAll(`input[name="qz${n}"]`).forEach(inp => inp.addEventListener('change', () => { s6.state[n - 1] = null; draw6(); }));
  });

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
  window.refreshLesson = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
