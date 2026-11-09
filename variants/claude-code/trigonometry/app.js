'use strict';
// Trigonometry lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every point, curve and readout comes from window.TRIG_MODEL (model.js). Canvas text is limited to
// panel titles (own row, shrink to fit) and axis ticks; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.TRIG_MODEL;
const t = (...a) => window.TRIG_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', ghost: '#55657a' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fmt = (v, d = 3) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; return v.toFixed(d).replace('-', '−'); };
const deg = v => (Number.isInteger(v) ? String(v) : v.toFixed(1)) + '°';
const rad = th => M.piForm(th) || th.toFixed(2);
const PI_TICKS = [[0, '0'], [Math.PI / 2, 'π/2'], [Math.PI, 'π'], [3 * Math.PI / 2, '3π/2'], [2 * Math.PI, '2π']];

const NARROW = 560;
// Circle + graph sharing one vertical scale. Wide: side by side, so a height carries straight across (link = true).
// Narrow: circle on top, graph below at full width (no straight link). lim = half-height of both panels in units.
function cgLayout(W, H, lim) {
  const top = 30, bot = H - 24;
  if (W >= NARROW) {
    const R = Math.min((bot - top) / (2 * lim), (W * 0.3) / (2 * lim)), cx = 10 + lim * R, cy = (top + bot) / 2;
    return { R, cx, cy, P: { l: cx + lim * R + 34, r: W - 14, t: cy - lim * R, b: cy + lim * R }, link: true };
  }
  const ch = (bot - top) * 0.46, R = Math.min(ch / (2 * lim), (W - 20) / (2 * lim)), cy = top + ch / 2;
  return { R, cx: W / 2, cy, P: { l: 34, r: W - 14, t: top + ch + 16, b: bot }, link: false };
}
function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) canvas.dataset.h = canvas.getAttribute('height') || 300;
  // data-aspect: height follows the width on narrow screens; data-hn: taller canvas for the stacked narrow layout
  const base = canvas.dataset.hn && width < NARROW ? Number(canvas.dataset.hn) : Number(canvas.dataset.h);
  const height = canvas.dataset.aspect ? Math.min(base, Math.round(width * Number(canvas.dataset.aspect))) : base;
  if (canvas.style.height !== height + 'px') canvas.style.height = height + 'px';
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
function line(ctx, x0, y0, x1, y1, col, lw = 1.5, dash = null) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.restore(); }
function dot(ctx, X, Y, r, col) { ctx.save(); ctx.fillStyle = col; ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore(); }
function arrow(ctx, x0, y0, x1, y1, col, lw = 2.4) {
  const a = Math.atan2(y1 - y0, x1 - x0), L = Math.hypot(x1 - x0, y1 - y0), h = Math.min(9, L * 0.4);
  ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - h * 0.7 * Math.cos(a), y1 - h * 0.7 * Math.sin(a)); ctx.stroke();
  if (L > 2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - h * Math.cos(a - 0.4), y1 - h * Math.sin(a - 0.4)); ctx.lineTo(x1 - h * Math.cos(a + 0.4), y1 - h * Math.sin(a + 0.4)); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}
// Unit-circle frame centred at (cx, cy) with R px per unit: axes, circle, optional ±1 ticks.
function circleFrame(ctx, cx, cy, R, { ext = 1.25, ticks = true, radius = 1 } = {}) {
  line(ctx, cx - ext * R, cy, cx + ext * R, cy, C.axis, 1); line(ctx, cx, cy - ext * R, cx, cy + ext * R, C.axis, 1);
  ctx.save(); ctx.strokeStyle = C.muted; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.arc(cx, cy, radius * R, 0, 7); ctx.stroke(); ctx.restore();
  if (ticks) {
    ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'center';
    ctx.fillText('1', cx + R + 7, cy + 14); ctx.fillText('−1', cx - R - 9, cy + 14);
    ctx.textAlign = 'right'; ctx.fillText('1', cx - 5, cy - R - 3); ctx.fillText('−1', cx - 5, cy + R + 13);
    ctx.restore();
  }
}
// A graph panel: x in [x0, x1] (ticks given as [value, label]), y in [y0, y1] with numeric ticks.
function graph(ctx, P, o) {
  const x = v => P.l + (v - o.x0) / (o.x1 - o.x0) * (P.r - P.l), y = v => P.b - (v - o.y0) / (o.y1 - o.y0) * (P.b - P.t);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.lineWidth = 1;
  ctx.textAlign = 'right';
  for (const v of o.yTicks) { ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); ctx.fillText(fmt(v, 0), P.l - 5, y(v) + 4); }
  ctx.textAlign = 'center';
  for (const [v, lab] of o.xTicks) { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.t); ctx.lineTo(x(v), P.b); ctx.stroke(); ctx.fillText(lab, x(v), P.b + 15); }
  ctx.restore();
  return { x, y, P };
}
function curve(ctx, G, f, a, b, col, lw = 2, dash = null, n = 240) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.beginPath(); let pen = false;
  for (let i = 0; i <= n; i++) { const v = a + (b - a) * i / n, fv = f(v); if (!isFinite(fv)) { pen = false; continue; } const X = G.x(v), Y = G.y(fv); if (!pen) { ctx.moveTo(X, Y); pen = true; } else ctx.lineTo(X, Y); }
  ctx.stroke(); ctx.restore();
}

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

/* ---------- step 0: an angle measured by a length ---------- */
const CHUNK = [C.orange, '#e0913a'];
function draw0() {
  const th = num('th0'), r = num('rad0');
  $('th0v').textContent = th.toFixed(2); $('rad0v').textContent = r.toFixed(2);
  const { ctx, W, H } = fitCanvas($('c0'));
  const wide = W >= 560;
  // circle area and number-line area
  const CA = wide ? { x0: 0, x1: Math.min(W * 0.42, H), y0: 26, y1: H - 6 } : { x0: 0, x1: W, y0: 26, y1: H - 92 };
  const LA = wide ? { x0: CA.x1 + 10, x1: W - 16, y: (H + 26) / 2 + 10 } : { x0: 16, x1: W - 16, y: H - 44 };
  title(ctx, t('c0title'), 8, 17, W - 16);
  const k = Math.min((CA.x1 - CA.x0) / 2 - 10, (CA.y1 - CA.y0) / 2 - 8) / 1.5, cx = (CA.x0 + CA.x1) / 2, cy = (CA.y0 + CA.y1) / 2;
  // reference unit circle (dashed), the actual circle of radius r, radii OA and OB
  ctx.save(); ctx.setLineDash([4, 4]); ctx.strokeStyle = C.ghost; ctx.beginPath(); ctx.arc(cx, cy, k, 0, 7); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.strokeStyle = C.muted; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cx, cy, r * k, 0, 7); ctx.stroke(); ctx.restore();
  // arc split into whole-radius chunks (alternating colours): each chunk subtends exactly 1 radian
  for (let a = 0, i = 0; a < th - 1e-9; a += 1, i++) {
    ctx.save(); ctx.strokeStyle = CHUNK[i % 2]; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(cx, cy, r * k, -a, -Math.min(th, a + 1), true); ctx.stroke(); ctx.restore();
  }
  line(ctx, cx, cy, cx + r * k, cy, C.cyan, 2.4); line(ctx, cx, cy, cx + r * k * Math.cos(th), cy - r * k * Math.sin(th), C.cyan, 2.4);
  dot(ctx, cx, cy, 3, C.text);
  // unrolled arc on a line measured in radii
  const L0 = LA.x0 + 8, L1 = LA.x1 - 8, ux = (L1 - L0) / (2 * Math.PI);
  line(ctx, L0, LA.y, L1, LA.y, C.axis, 1.2);
  for (let a = 0, i = 0; a < th - 1e-9; a += 1, i++) line(ctx, L0 + a * ux, LA.y, L0 + Math.min(th, a + 1) * ux, LA.y, CHUNK[i % 2], 6);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'center';
  for (let n = 0; n <= 6; n++) { line(ctx, L0 + n * ux, LA.y - 4, L0 + n * ux, LA.y + 4, C.muted, 1); ctx.fillText(String(n), L0 + n * ux, LA.y + 18); }
  ctx.fillStyle = C.text;
  for (const [v, lab] of [[Math.PI, 'π'], [2 * Math.PI, '2π']]) { line(ctx, L0 + v * ux, LA.y - 8, L0 + v * ux, LA.y, C.text, 1); ctx.fillText(lab, L0 + v * ux, LA.y - 13); }
  ctx.textAlign = 'left'; ctx.fillStyle = C.muted; ctx.fillText(t('c0line'), L0, LA.y + 36);
  ctx.restore();
  const a = M.arc(th, r);
  $('r0').textContent = t('s0readout', { th: th.toFixed(2), deg: a.deg.toFixed(1), r: r.toFixed(2), s: a.s.toFixed(2), n: a.wholeRadii });
}

/* ---------- step 1: the point (cos θ, sin θ) ---------- */
let geo1 = null;
function draw1() {
  const d = num('d1');
  $('d1v').textContent = deg(d);
  document.querySelectorAll('#special1 .btn').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.deg) === d)));
  const { ctx, W, H } = fitCanvas($('c1'));
  title(ctx, t('c1title'), 8, 17, W - 16);
  const R = Math.min(W / 2 - 30, (H - 26) / 2 - 22), cx = W / 2, cy = 26 + (H - 26) / 2;
  geo1 = { cx, cy, R };
  circleFrame(ctx, cx, cy, R);
  const c = M.cosDeg(d), s = M.sinDeg(d), PX = cx + R * c, PY = cy - R * s;
  // angle arc
  ctx.save(); ctx.strokeStyle = C.muted; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(cx, cy, Math.min(26, R * 0.22), 0, -d * M.DEG, true); ctx.stroke(); ctx.restore();
  line(ctx, cx, cy, PX, PY, C.text, 1.6);
  line(ctx, cx, cy, PX, cy, C.cyan, 4);
  line(ctx, PX, cy, PX, PY, C.orange, 4);
  dot(ctx, PX, PY, 6.5, C.text);
  const ex = v => M.exactOf(v);
  const cs = ex(c) && M.isSpecial(d) ? `${ex(c)} ≈ ${fmt(c)}` : fmt(c), ss = ex(s) && M.isSpecial(d) ? `${ex(s)} ≈ ${fmt(s)}` : fmt(s);
  const q = M.quadrant(d), where = q ? t('quad', { q }) : t('onAxis');
  $('r1').textContent = t('s1readout', { d: deg(d), c: cs, s: ss, where, sum: (c * c + s * s).toFixed(6) });
}

/* ---------- step 2: unrolling the height into a wave ---------- */
const s2 = { cos: false };
function draw2() {
  const th = num('th2');
  $('th2v').textContent = th.toFixed(2);
  $('cos2').setAttribute('aria-pressed', String(s2.cos));
  const { ctx, W, H } = fitCanvas($('c2'));
  title(ctx, t('c2title'), 8, 17, W - 16);
  const { R, cx, cy, P, link } = cgLayout(W, H, 1.25);
  circleFrame(ctx, cx, cy, R, { ticks: false });
  const G = graph(ctx, P, { x0: 0, x1: 2 * Math.PI, y0: -1.25, y1: 1.25, yTicks: [-1, 0, 1], xTicks: PI_TICKS });
  if (s2.cos) curve(ctx, G, Math.cos, 0, th, C.cyan, 2.2);
  curve(ctx, G, Math.sin, 0, th, C.orange, 2.6);
  const PX = cx + R * Math.cos(th), PY = cy - R * Math.sin(th);
  line(ctx, cx, cy, PX, PY, C.text, 1.4);
  line(ctx, PX, cy, PX, PY, C.orange, 3.5);
  if (s2.cos) line(ctx, cx, cy, PX, cy, C.cyan, 3.5);
  if (link) line(ctx, PX, PY, G.x(th), G.y(Math.sin(th)), C.muted, 1, [4, 4]);
  dot(ctx, PX, PY, 5.5, C.text); dot(ctx, G.x(th), G.y(Math.sin(th)), 5.5, C.orange);
  if (s2.cos) dot(ctx, G.x(th), G.y(Math.cos(th)), 5, C.cyan);
  const prog = s2.play ? t('s2progress', { c: s2.play, N: 360 }) : '';
  $('r2').textContent = prog + t('s2readout', { th: th.toFixed(2), deg: (th / M.DEG).toFixed(0), s: fmt(Math.sin(th)), c: fmt(Math.cos(th)), cs: fmt(Math.sin(th + Math.PI / 2)) });
}

/* ---------- step 3: tangent as a slope and as a height on x = 1 ---------- */
const CLIP3 = 2.6, CLIPG = 4;
function draw3() {
  const d = num('d3');
  $('d3v').textContent = deg(d);
  let { ctx, W, H } = fitCanvas($('c3'));
  title(ctx, t('c3title'), 8, 17, W - 16);
  const box = { x0: -1.35, x1: 1.75, y0: -CLIP3, y1: CLIP3 }, top = 28;
  const R = Math.min((W - 16) / (box.x1 - box.x0), (H - top - 8) / (box.y1 - box.y0));
  const cx = 8 + (W - 16 - R * (box.x1 - box.x0)) / 2 - box.x0 * R, cy = top + (H - top - 8) / 2;
  circleFrame(ctx, cx, cy, R, { ext: 1.3, ticks: false });
  line(ctx, cx + R, top, cx + R, H - 8, C.muted, 1.3, [5, 5]);
  const c = M.cosDeg(d), s = M.sinDeg(d), tn = M.tanDeg(d), PX = cx + R * c, PY = cy - R * s;
  ctx.save(); ctx.beginPath(); ctx.rect(0, top, W, H - top - 4); ctx.clip();
  // the whole line through O and P (both directions)
  const far = 6; line(ctx, cx - far * R * c, cy + far * R * s, cx + far * R * c, cy - far * R * s, 'rgba(232,237,244,0.35)', 1.2);
  line(ctx, cx, cy, PX, PY, C.text, 2);
  if (tn !== null) {
    const hy = cy - R * tn;
    line(ctx, cx + R, cy, cx + R, hy, C.green, 4);
    if (Math.abs(tn) <= CLIP3) dot(ctx, cx + R, hy, 6, C.green);
    else arrow(ctx, cx + R, cy - R * Math.sign(tn) * (CLIP3 - 0.4), cx + R, cy - R * Math.sign(tn) * CLIP3 + Math.sign(tn) * 2, C.green, 3);
  }
  ctx.restore();
  dot(ctx, PX, PY, 5.5, C.text);
  ({ ctx, W, H } = fitCanvas($('c3b')));
  title(ctx, t('c3btitle'), 8, 17, W - 16);
  const G = graph(ctx, { l: 30, r: W - 20, t: 30, b: H - 24 }, { x0: 0, x1: 360, y0: -CLIPG, y1: CLIPG, yTicks: [-4, -2, 0, 2, 4], xTicks: [[0, '0°'], [90, '90°'], [180, '180°'], [270, '270°'], [360, '360°']].filter((_, i) => W > 260 || i % 2 === 0) });
  for (const pole of [90, 270]) line(ctx, G.x(pole), G.P.t, G.x(pole), G.P.b, C.pink, 1.4, [5, 4]);
  curve(ctx, G, v => { const q = M.tanDeg(v); return q === null || Math.abs(q) > CLIPG ? NaN : q; }, 0, 360, C.green, 2, null, 1440);
  if (tn !== null && Math.abs(tn) <= CLIPG) dot(ctx, G.x(d), G.y(tn), 5.5, C.text);
  else line(ctx, G.x(d), G.P.t, G.x(d), G.P.b, C.text, 1.4, [2, 3]);
  let txt;
  if (tn === null) txt = t('s3undef', { d: deg(d), c: '0', s: fmt(s, 0) });
  else txt = t('s3readout', { d: deg(d), s: fmt(s, 4), c: fmt(c, 4), tn: Math.abs(tn) < 1e4 ? fmt(tn, 3) : tn.toExponential(2).replace('-', '−') }) + (Math.abs(tn) > CLIP3 ? t('s3off') : '');
  $('r3').textContent = txt;
}

/* ---------- step 4: one quadrant gives all four ---------- */
function draw4() {
  const d = num('d4');
  $('d4v').textContent = deg(d);
  const { ctx, W, H } = fitCanvas($('c4'));
  title(ctx, t('c4title'), 8, 17, W - 16);
  const R = Math.min(W / 2 - 30, (H - 26) / 2 - 22), cx = W / 2, cy = 26 + (H - 26) / 2;
  circleFrame(ctx, cx, cy, R);
  const a = M.reference(d), pts = M.mirrors(a).map(v => [cx + R * M.cosDeg(v), cy - R * M.sinDeg(v)]);
  // mirror rectangle joining the four images
  ctx.save(); ctx.strokeStyle = C.ghost; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2; ctx.beginPath(); pts.forEach(([x, y], i) => { if (!i) ctx.moveTo(x, y); else ctx.lineTo(x, y); }); ctx.closePath(); ctx.stroke(); ctx.restore();
  pts.forEach(([x, y]) => { line(ctx, cx, cy, x, y, C.ghost, 1.2); dot(ctx, x, y, 4.5, C.ghost); });
  // reference angle: between OP and the nearest part of the x-axis
  const PX = cx + R * M.cosDeg(d), PY = cy - R * M.sinDeg(d), side = M.cosDeg(d) >= 0 ? 0 : 180; // reference angle is measured from the nearer half of the x-axis
  const rr = Math.min(34, R * 0.3);
  ctx.save(); ctx.strokeStyle = C.cyan; ctx.lineWidth = 3; ctx.beginPath();
  const n0 = M.norm360(d), base = side === 0 ? (n0 > 180 ? 360 : 0) : 180;
  ctx.arc(cx, cy, rr, -base * M.DEG, -n0 * M.DEG, n0 > base); ctx.stroke(); ctx.restore();
  line(ctx, cx, cy, PX, PY, C.orange, 2.4); dot(ctx, PX, PY, 6.5, C.orange);
  const q = M.quadrant(d), s = M.sinDeg(d), c = M.cosDeg(d);
  const sgn = v => (v > 0 ? '+' : v < 0 ? '−' : '0');
  const head = q ? t('quad', { q }) : t('onAxis');
  $('r4').textContent = t('s4readout', { d: deg(d), where: head, a: deg(a), ss: sgn(s), cs: sgn(c), s: fmt(s), c: fmt(c), sa: fmt(M.sinDeg(a)), ca: fmt(M.cosDeg(a)) });
}

/* ---------- step 5: amplitude, speed and starting angle ---------- */
const T5 = 4 * Math.PI, s5 = { t: T5 };
function draw5() {
  const A = num('A5'), w = num('w5'), pd = num('p5'), phi = pd * M.DEG, wv = M.wave(A, w, phi);
  $('A5v').textContent = A.toFixed(2); $('w5v').textContent = w.toFixed(2); $('p5v').textContent = deg(pd);
  const { ctx, W, H } = fitCanvas($('c5'));
  title(ctx, t('c5title'), 8, 17, W - 16);
  const { R, cx, cy, P, link } = cgLayout(W, H, 1.7);
  circleFrame(ctx, cx, cy, R, { ext: 1.6, ticks: false, radius: A });
  const ticks = [[0, '0'], [Math.PI, 'π'], [2 * Math.PI, '2π'], [3 * Math.PI, '3π'], [4 * Math.PI, '4π']];
  const G = graph(ctx, P, { x0: 0, x1: T5, y0: -1.7, y1: 1.7, yTicks: [-1, 0, 1], xTicks: ticks });
  curve(ctx, G, Math.sin, 0, T5, C.ghost, 1.4, [5, 5]);
  curve(ctx, G, wv.y, 0, s5.t, C.orange, 2.6, null, 480);
  for (let tp = wv.peak; tp <= T5 + 1e-9; tp += wv.T) dot(ctx, G.x(tp), G.y(A), 4.5, C.green);
  const ang = w * s5.t + phi, PX = cx + R * A * Math.cos(ang), PY = cy - R * A * Math.sin(ang);
  ctx.save(); ctx.strokeStyle = C.muted; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cx, cy, Math.min(18, R * A * 0.5), 0, -phi, phi > 0); ctx.stroke(); ctx.restore();
  line(ctx, cx, cy, cx + R * A * Math.cos(phi), cy - R * A * Math.sin(phi), C.ghost, 1.4, [3, 3]);
  line(ctx, cx, cy, PX, PY, C.text, 1.6); dot(ctx, PX, PY, 5.5, C.orange);
  if (link) line(ctx, PX, PY, G.x(s5.t), G.y(wv.y(s5.t)), C.muted, 1, [4, 4]);
  dot(ctx, G.x(s5.t), G.y(wv.y(s5.t)), 5, C.orange);
  $('r5').textContent = t('s5readout', { A: A.toFixed(2), w: w.toFixed(2), phi: rad(phi), T: wv.T.toFixed(3), Tpi: rad(wv.T), pk: wv.peak.toFixed(3), n: Math.floor((T5 - wv.peak) / wv.T + 1e-9) + 1 });
}

/* ---------- step 6: adding a cosine and a sine of the same frequency ---------- */
function draw6() {
  const a = num('a6'), b = num('b6'), tt = num('t6'), ps = M.phasorSum(a, b);
  $('a6v').textContent = fmt(a, 1); $('b6v').textContent = fmt(b, 1); $('t6v').textContent = tt.toFixed(2);
  const { ctx, W, H } = fitCanvas($('c6'));
  title(ctx, t('c6title'), 8, 17, W - 16);
  const LIM = 2.2, { R, cx, cy, P, link } = cgLayout(W, H, LIM);
  line(ctx, cx - LIM * R, cy, cx + LIM * R, cy, C.axis, 1); line(ctx, cx, cy - LIM * R, cx, cy + LIM * R, C.axis, 1);
  ctx.save(); ctx.strokeStyle = C.muted; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.arc(cx, cy, ps.R * R, 0, 7); ctx.stroke(); ctx.restore();
  // b sin t: arrow of length b at angle t; a cos t: arrow of length a at angle t + 90°, drawn tip to tail
  const bx = b * Math.cos(tt), by = b * Math.sin(tt), ax = a * Math.cos(tt + Math.PI / 2), ay = a * Math.sin(tt + Math.PI / 2);
  arrow(ctx, cx, cy, cx + R * bx, cy - R * by, C.green);
  arrow(ctx, cx + R * bx, cy - R * by, cx + R * (bx + ax), cy - R * (by + ay), C.cyan);
  arrow(ctx, cx, cy, cx + R * (bx + ax), cy - R * (by + ay), C.text, 2);
  const G = graph(ctx, P, { x0: 0, x1: 2 * Math.PI, y0: -LIM, y1: LIM, yTicks: [-2, -1, 0, 1, 2], xTicks: PI_TICKS });
  curve(ctx, G, v => a * Math.cos(v), 0, 2 * Math.PI, C.cyan, 1.6);
  curve(ctx, G, v => b * Math.sin(v), 0, 2 * Math.PI, C.green, 1.6);
  curve(ctx, G, v => a * Math.cos(v) + b * Math.sin(v), 0, 2 * Math.PI, C.text, 3);
  curve(ctx, G, v => ps.R * Math.sin(v + ps.phi), 0, 2 * Math.PI, C.orange, 1.6, [6, 6]);
  const y = a * Math.cos(tt) + b * Math.sin(tt);
  if (link) line(ctx, cx + R * (bx + ax), cy - R * (by + ay), G.x(tt), G.y(y), C.muted, 1, [4, 4]);
  dot(ctx, G.x(tt), G.y(y), 5, C.text);
  // numeric maximum of the sum over a fine grid (compared with R in the readout)
  let mx = -Infinity, at = 0; for (let i = 0; i < 3600; i++) { const v = 2 * Math.PI * i / 3600, f = a * Math.cos(v) + b * Math.sin(v); if (f > mx) { mx = f; at = v; } }
  $('r6').textContent = t('s6readout', { a: fmt(a, 1), b: fmt(b, 1), R: ps.R.toFixed(3), phi: (ps.phi / M.DEG).toFixed(1), mx: mx.toFixed(3), at: at.toFixed(2), t: tt.toFixed(2), y: fmt(y), yr: fmt(ps.R * Math.sin(tt + ps.phi)) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); draw6(); }

function addButtons(box, list, label, onPick) {
  list.forEach(v => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn small toggle'; b.dataset.step = box.closest('.step').dataset.step; b.dataset.deg = v; b.textContent = label(v); b.addEventListener('click', () => onPick(v)); box.appendChild(b); });
}

function setup() {
  $('th0').addEventListener('input', () => { stopAnim('s0'); draw0(); }); $('rad0').addEventListener('input', draw0);
  $('play0').addEventListener('click', () => animate('s0', 5000, p => { $('th0').value = (p * 6.28).toFixed(2); draw0(); }));

  $('d1').addEventListener('input', draw1);
  addButtons($('special1'), [30, 45, 60, 90, 135, 210, 300], v => v + '°', v => { $('d1').value = v; draw1(); });
  let down = false;
  const pick = e => { const r = $('c1').getBoundingClientRect(), g = geo1; if (!g) return; const a = Math.atan2(g.cy - (e.clientY - r.top), e.clientX - r.left - g.cx); $('d1').value = String(Math.round(M.norm360(a / M.DEG))); draw1(); };
  $('c1').addEventListener('pointerdown', e => { down = true; $('c1').setPointerCapture(e.pointerId); pick(e); });
  $('c1').addEventListener('pointermove', e => { if (down) pick(e); });
  ['pointerup', 'pointercancel'].forEach(ev => $('c1').addEventListener(ev, () => { down = false; }));

  $('th2').addEventListener('input', () => { stopAnim('s2'); s2.play = 0; draw2(); });
  $('cos2').addEventListener('click', () => { s2.cos = !s2.cos; draw2(); });
  $('play2').addEventListener('click', () => animate('s2', 6000, p => { s2.play = Math.round(p * 360); $('th2').value = (p * 6.28).toFixed(2); draw2(); }, () => { s2.play = 0; draw2(); }));

  $('d3').addEventListener('input', draw3);
  addButtons($('presets3'), [45, 89.9, 90, 90.1, 135, 270], v => deg(v), v => { $('d3').value = String(v); draw3(); });

  $('d4').addEventListener('input', draw4);

  ['A5', 'w5', 'p5'].forEach(id => $(id).addEventListener('input', () => { stopAnim('s5'); s5.t = T5; draw5(); }));
  $('play5').addEventListener('click', () => animate('s5', 7000, p => { s5.t = p * T5; draw5(); }));

  ['a6', 'b6'].forEach(id => $(id).addEventListener('input', draw6));
  $('t6').addEventListener('input', () => { stopAnim('s6'); draw6(); });
  $('play6').addEventListener('click', () => animate('s6', 6000, p => { $('t6').value = (p * 6.28).toFixed(2); draw6(); }));

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshTrig = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
