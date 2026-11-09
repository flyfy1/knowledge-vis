'use strict';
// Vectors lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every arrow and readout comes from window.VEC_MODEL (model.js). Canvas text: panel titles (own row),
// edge tick labels outside the plot box, and short symbol labels placed by a collision-avoiding labeller.
(function () {

const $ = id => document.getElementById(id);
const M = window.VEC_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#1b2734', grid2: '#2a3a4d', axis: '#4f6580', text: '#e8edf4', bg: '#0d1621', ghost: '#8696aa' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; return v.toFixed(d).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') || '0'; };
const par = v => (v < 0 ? '(' + fmt(v) + ')' : fmt(v));

// ratio (optional) = world height / world width of an equal-scale plane: the canvas then shrinks to fit it
// instead of leaving empty bands, never growing past its authored height.
function fitCanvas(canvas, ratio) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) canvas.dataset.h = canvas.getAttribute('height') || 300;
  const height = ratio ? Math.min(Number(canvas.dataset.h), Math.round((width - 38) * ratio + 48)) : Number(canvas.dataset.h);
  canvas.style.height = height + 'px';
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 7);
  ctx.fillText(text, X, Y); ctx.restore();
}

/* ---------- an equal-scale coordinate plane ---------- */
// o: xr [min,max], yr [min,max], title, step (tick spacing). Tick labels sit outside the plot box.
function plane(ctx, W, H, o) {
  const L = o.left || 30, R = W - 8, T = 26, B = H - 22;
  const u = Math.min((R - L) / (o.xr[1] - o.xr[0]), (B - T) / (o.yr[1] - o.yr[0]));
  const bw = u * (o.xr[1] - o.xr[0]), bh = u * (o.yr[1] - o.yr[0]);
  const l = L + (R - L - bw) / 2, tp = T;
  const X = x => l + (x - o.xr[0]) * u, Y = y => tp + (o.yr[1] - y) * u;
  const box = { l, r: l + bw, t: tp, b: tp + bh };
  const g = o.grid || 1;
  ctx.save(); ctx.lineWidth = 1;
  for (let x = Math.ceil(o.xr[0] / g) * g; x <= o.xr[1] + 1e-9; x += g) { ctx.strokeStyle = x === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(X(x), box.t); ctx.lineTo(X(x), box.b); ctx.stroke(); }
  for (let y = Math.ceil(o.yr[0] / g) * g; y <= o.yr[1] + 1e-9; y += g) { ctx.strokeStyle = y === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(box.l, Y(y)); ctx.lineTo(box.r, Y(y)); ctx.stroke(); }
  ctx.strokeStyle = C.grid2; ctx.strokeRect(box.l, box.t, bw, bh);
  ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  const st = o.step || 2;
  let last = -Infinity; ctx.textAlign = 'center';
  for (let x = Math.ceil(o.xr[0] / st) * st; x <= o.xr[1] + 1e-9; x += st) {
    const s = fmt(x), w = ctx.measureText(s).width, cx = Math.min(Math.max(X(x), w / 2 + 1), W - w / 2 - 1);
    if (cx - w / 2 < last + 6) continue; ctx.fillText(s, cx, box.b + 14); last = cx + w / 2;
  }
  ctx.textAlign = 'right'; last = Infinity;
  for (let y = Math.ceil(o.yr[0] / st) * st; y <= o.yr[1] + 1e-9; y += st) {
    const cy = Y(y) + 4; if (cy > last - 13) continue; ctx.fillText(fmt(y), box.l - 4, cy); last = cy;
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, T - 9, W - 16);
  return { X, Y, u, box, segs: [], labels: [] };
}
function clipBox(ctx, P) { ctx.save(); ctx.beginPath(); ctx.rect(P.box.l, P.box.t, P.box.r - P.box.l, P.box.b - P.box.t); ctx.clip(); }
// Arrow in world coordinates. Registers its segment so labels avoid it.
function arrow(ctx, P, a, b, color, o = {}) {
  const x0 = P.X(a.x), y0 = P.Y(a.y), x1 = P.X(b.x), y1 = P.Y(b.y), len = Math.hypot(x1 - x0, y1 - y0);
  clipBox(ctx, P);
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = o.lw || 3; ctx.globalAlpha = o.alpha || 1; ctx.lineCap = 'round';
  if (len < 1) { ctx.beginPath(); ctx.arc(x0, y0, 4.5, 0, 7); ctx.fill(); ctx.restore(); return; }
  const hl = Math.min(13, len * 0.45), ang = Math.atan2(y1 - y0, x1 - x0);
  const ex = x1 - Math.cos(ang) * hl * 0.8, ey = y1 - Math.sin(ang) * hl * 0.8;
  if (o.dash) ctx.setLineDash(o.dash);
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(ex, ey); ctx.stroke(); ctx.setLineDash([]);
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - hl * Math.cos(ang - 0.42), y1 - hl * Math.sin(ang - 0.42)); ctx.lineTo(x1 - hl * Math.cos(ang + 0.42), y1 - hl * Math.sin(ang + 0.42)); ctx.closePath(); ctx.fill();
  ctx.restore();
  P.segs.push([x0, y0, x1, y1]);
}
function seg(P, a, b) { P.segs.push([P.X(a.x), P.Y(a.y), P.X(b.x), P.Y(b.y)]); }
const hitBox = (A, B) => A.x0 < B.x1 && B.x0 < A.x1 && A.y0 < B.y1 && B.y0 < A.y1;
function segHits(s, bx) {
  const n = Math.max(2, Math.ceil(Math.hypot(s[2] - s[0], s[3] - s[1]) / 3));
  for (let i = 0; i <= n; i++) { const x = s[0] + (s[2] - s[0]) * i / n, y = s[1] + (s[3] - s[1]) * i / n; if (x > bx.x0 - 2 && x < bx.x1 + 2 && y > bx.y0 - 2 && y < bx.y1 + 2) return true; }
  return false;
}
// Label an arrow from a to b (world coords). Tries several spots along it and on both sides; picks the first that
// stays in the plot box, misses other labels and (preferably) misses every drawn segment. Skips if nothing fits.
function label(ctx, P, text, a, b, color) {
  ctx.save(); ctx.font = '600 13px system-ui,sans-serif';
  const w = ctx.measureText(text).width, h = 13;
  const x0 = P.X(a.x), y0 = P.Y(a.y), x1 = P.X(b.x), y1 = P.Y(b.y), len = Math.hypot(x1 - x0, y1 - y0) || 1;
  const nx = -(y1 - y0) / len, ny = (x1 - x0) / len;
  let best = null;
  for (const f of [0.5, 0.35, 0.65, 0.2, 0.8, 1.0]) for (const side of [1, -1]) for (const d of [12, 20]) {
    const cx = x0 + (x1 - x0) * f + side * nx * (d + w / 2 * Math.abs(nx) + h / 2 * Math.abs(ny) * 0.3), cy = y0 + (y1 - y0) * f + side * ny * (d + h / 2 * Math.abs(ny));
    const bx = { x0: cx - w / 2, x1: cx + w / 2, y0: cy - h / 2 - 1, y1: cy + h / 2 + 1 };
    if (bx.x0 < P.box.l + 2 || bx.x1 > P.box.r - 2 || bx.y0 < P.box.t + 2 || bx.y1 > P.box.b - 2) continue;
    if (P.labels.some(o => hitBox(o, { x0: bx.x0 - 3, x1: bx.x1 + 3, y0: bx.y0 - 2, y1: bx.y1 + 2 }))) continue;
    const clean = !P.segs.some(s => segHits(s, bx));
    if (clean) { best = { cx, cy, bx }; break; }
    if (!best) best = { cx, cy, bx, dirty: true };
  }
  if (best && best.dirty) best = null; // never write a label on top of a line
  if (best) {
    ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, best.cx, best.cy); P.labels.push(best.bx);
  }
  ctx.restore();
  return !!best;
}
const dot = (ctx, P, p, color, r = 5, ring = false) => { ctx.save(); ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(P.X(p.x), P.Y(p.y), r, 0, 7); if (ring) ctx.stroke(); else ctx.fill(); ctx.restore(); };

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

const vecA = () => M.v(num('ax0'), num('ay0'));
const vecB = () => M.v(num('bx1'), num('by1'));
const PLANE = { xr: [-12, 12], yr: [-9, 9] }, R0 = 18 / 24;

/* ---------- step 0: arrow and components ---------- */
const STARTS = [M.v(0, 0), M.v(-7, -5), M.v(2, -6), M.v(-8, 2), M.v(4, -2)];
const s0 = { i: 0 };
function draw0() {
  const a = vecA(), p = STARTS[s0.i], q = M.add(p, a);
  $('ax0v').textContent = String(a.x); $('ay0v').textContent = String(a.y);
  const { ctx, W, H } = fitCanvas($('c0'), R0);
  const P = plane(ctx, W, H, { ...PLANE, title: t('c0a') });
  const inside = s => s.x >= PLANE.xr[0] && s.x <= PLANE.xr[1] && s.y >= PLANE.yr[0] && s.y <= PLANE.yr[1];
  STARTS.forEach((s, i) => { if (i !== s0.i && inside(s) && inside(M.add(s, a))) arrow(ctx, P, s, M.add(s, a), C.ghost, { lw: 1.6, dash: [5, 4], alpha: 0.75 }); });
  const corner = M.v(q.x, p.y);
  arrow(ctx, P, p, corner, C.cyan, { lw: 2, dash: [6, 4] }); arrow(ctx, P, corner, q, C.green, { lw: 2, dash: [6, 4] });
  arrow(ctx, P, p, q, C.orange, { lw: 3.4 });
  dot(ctx, P, p, C.text, 4.5);
  label(ctx, P, 'a', p, q, C.orange);
  if (a.x) label(ctx, P, 'aₓ', p, corner, C.cyan);
  if (a.y) label(ctx, P, 'a_y', corner, q, C.green);
  const m = M.mag(a), d = M.dirDeg(a);
  $('r0').textContent = t('s0readout', { px: p.x, py: p.y, qx: q.x, qy: q.y, ax: a.x, ay: a.y, m: fmt(m), dir: d === null ? '—' : t('dirFmt', { d: fmt(d, 1) }) }) + (m === 0 ? ' ' + t('s0zero') : '');
}

/* ---------- step 1: head to tail ---------- */
const s1 = { other: false };
function draw1() {
  const a = vecA(), b = vecB(), s = M.add(a, b), O = M.v(0, 0);
  $('bx1v').textContent = String(b.x); $('by1v').textContent = String(b.y);
  $('other1').setAttribute('aria-pressed', s1.other ? 'true' : 'false');
  const { ctx, W, H } = fitCanvas($('c1'), R0);
  const P = plane(ctx, W, H, { ...PLANE, title: t('c1a') });
  if (s1.other) { arrow(ctx, P, O, b, C.violet, { lw: 2, dash: [5, 4], alpha: 0.6 }); arrow(ctx, P, b, s, C.orange, { lw: 2, dash: [5, 4], alpha: 0.6 }); }
  arrow(ctx, P, O, a, C.orange); arrow(ctx, P, a, s, C.violet); arrow(ctx, P, O, s, C.cyan, { lw: 3.4 });
  dot(ctx, P, O, C.text, 4);
  label(ctx, P, 'a', O, a, C.orange); label(ctx, P, 'b', a, s, C.violet); label(ctx, P, 'a + b', O, s, C.cyan);
  const ma = M.mag(a), mb = M.mag(b), ms = M.mag(s), eq = Math.abs(ma + mb - ms) < 1e-9;
  $('r1').textContent = t('s1readout', { ax: a.x, ay: a.y, bx: par(b.x), by: par(b.y), sx: s.x, sy: s.y, ms: fmt(ms), ma: fmt(ma), mb: fmt(mb), mab: fmt(ma + mb), rel: t(eq ? 'relEq' : 'relLess') });
}

/* ---------- step 2: scaling and subtracting ---------- */
function draw2() {
  const a = vecA(), b = vecB(), k = num('k2'), ka = M.scale(k, a), d = M.sub(a, b), O = M.v(0, 0);
  $('k2v').textContent = fmt(k);
  let { ctx, W, H } = fitCanvas($('c2'), R0);
  let P = plane(ctx, W, H, { ...PLANE, title: t('c2a'), step: 4 });
  if (M.mag(a) > 0) { clipBox(ctx, P); ctx.strokeStyle = C.grid2; ctx.lineWidth = 1.5; ctx.setLineDash([2, 4]); ctx.beginPath(); ctx.moveTo(P.X(-20 * a.x), P.Y(-20 * a.y)); ctx.lineTo(P.X(20 * a.x), P.Y(20 * a.y)); ctx.stroke(); ctx.restore(); }
  arrow(ctx, P, O, a, C.ghost, { lw: 2, dash: [5, 4] });
  arrow(ctx, P, O, ka, C.orange, { lw: 3.4 });
  dot(ctx, P, O, C.text, 4);
  label(ctx, P, 'a', O, a, C.ghost); if (M.mag(ka) > 0) label(ctx, P, 'k·a', O, ka, C.orange);

  ({ ctx, W, H } = fitCanvas($('c2b'), R0));
  P = plane(ctx, W, H, { ...PLANE, title: t('c2b'), step: 4 });
  arrow(ctx, P, O, a, C.orange); arrow(ctx, P, O, b, C.violet);
  arrow(ctx, P, a, M.sub(a, b), C.violet, { lw: 2, dash: [5, 4], alpha: 0.8 });
  arrow(ctx, P, b, a, C.pink, { lw: 3.4 });
  dot(ctx, P, O, C.text, 4);
  label(ctx, P, 'a', O, a, C.orange); label(ctx, P, 'b', O, b, C.violet); label(ctx, P, 'a − b', b, a, C.pink); label(ctx, P, '−b', a, M.sub(a, b), C.violet);
  const dirNote = k > 0 ? t('dirSame') : k < 0 ? t('dirOpp') : t('dirZero');
  $('r2').textContent = t('s2readout', { k: fmt(k), ax: a.x, ay: a.y, kx: fmt(ka.x), ky: fmt(ka.y), ma: fmt(M.mag(a)), mk: fmt(M.mag(ka)), dirNote: M.mag(a) === 0 ? t('dirZero') : dirNote, bx: par(b.x), by: par(b.y), dx: d.x, dy: d.y, md: fmt(M.mag(d)) });
}

/* ---------- step 3: building c from two directions ---------- */
const s3 = { par: false };
function draw3() {
  const c = M.v(num('cx3'), num('cy3')), s = num('s3'), tt = num('t3');
  const e1 = M.BASIS.e1, e2 = s3.par ? M.BASIS.e2par : M.BASIS.e2;
  ['cx3', 'cy3'].forEach(id => { $(id + 'v').textContent = $(id).value; }); $('s3v').textContent = fmt(s); $('t3v').textContent = fmt(tt);
  $('par3').setAttribute('aria-pressed', s3.par ? 'true' : 'false');
  const se1 = M.scale(s, e1), m = M.add(se1, M.scale(tt, e2)), O = M.v(0, 0);
  const { ctx, W, H } = fitCanvas($('c3'), R0);
  const P = plane(ctx, W, H, { ...PLANE, title: t('c3a'), grid: 2 });
  clipBox(ctx, P); ctx.strokeStyle = 'rgba(134,150,170,0.45)'; ctx.lineWidth = 1;
  if (!s3.par) {
    for (let j = -8; j <= 8; j++) { const p0 = M.scale(j, e2); ctx.beginPath(); ctx.moveTo(P.X(p0.x - 40), P.Y(p0.y)); ctx.lineTo(P.X(p0.x + 40), P.Y(p0.y)); ctx.stroke(); }
    for (let i = -12; i <= 12; i++) { const p0 = M.scale(i, e1); ctx.beginPath(); ctx.moveTo(P.X(p0.x - 10 * e2.x), P.Y(p0.y - 10 * e2.y)); ctx.lineTo(P.X(p0.x + 10 * e2.x), P.Y(p0.y + 10 * e2.y)); ctx.stroke(); }
  } else {
    ctx.fillStyle = 'rgba(134,150,170,0.8)'; for (let i = -10; i <= 10; i++) { ctx.beginPath(); ctx.arc(P.X(i), P.Y(0), 2.5, 0, 7); ctx.fill(); }
  }
  ctx.restore();
  arrow(ctx, P, O, se1, C.green); arrow(ctx, P, se1, m, C.violet);
  seg(P, O, m);
  dot(ctx, P, c, C.text, 8, true); dot(ctx, P, m, C.cyan, 4.5); dot(ctx, P, O, C.text, 3.5);
  label(ctx, P, 's·e₁', O, se1, C.green); label(ctx, P, 't·e₂', se1, m, C.violet); label(ctx, P, 'c', O, c, C.text);
  const gap = M.mag(M.sub(c, m)), sol = M.decompose(c, e1, e2);
  let verdict;
  if (gap < 1e-9) verdict = t('hit3', { s: fmt(s), t: fmt(tt) });
  else if (sol) verdict = t('sol3', { s: fmt(sol.s), t: fmt(sol.t) });
  else verdict = c.y === 0 ? t('manySol3', { s: fmt(c.x / e1.x) }) : t('noSol3');
  $('r3').textContent = t('s3readout', { e2: t(s3.par ? 'e2ParName' : 'e2Name'), s: par(s), t: par(tt), e2v: `(${e2.x}, ${e2.y})`, mx: fmt(m.x), my: fmt(m.y), cx: c.x, cy: c.y, gap: fmt(gap), verdict });
}

/* ---------- step 4: dot product ---------- */
const A4 = 4;
const s4 = { seen: new Map(), prog: '' };
function vec4() { return { a: M.polar(A4, num('al4')), b: M.polar(num('bl4'), num('be4')) }; }
function draw4() {
  const { a, b } = vec4(), O = M.v(0, 0), al = num('al4'), be = num('be4'), bl = num('bl4');
  $('al4v').textContent = al + '°'; $('be4v').textContent = be + '°'; $('bl4v').textContent = fmt(bl);
  const th = M.between(a, b), d1 = M.dot(a, b), d2 = A4 * bl * Math.cos(th * M.DEG), pr = M.projLen(b, a), pv = M.projVec(b, a);
  s4.seen.set(Math.round(th * 10) / 10, d1);
  let { ctx, W, H } = fitCanvas($('c4'), 11 / 12);
  const P = plane(ctx, W, H, { xr: [-6, 6], yr: [-5.5, 5.5], title: t('c4a') });
  clipBox(ctx, P); ctx.strokeStyle = C.grid2; ctx.lineWidth = 1.5; ctx.setLineDash([2, 4]); ctx.beginPath(); ctx.moveTo(P.X(-3 * a.x), P.Y(-3 * a.y)); ctx.lineTo(P.X(3 * a.x), P.Y(3 * a.y)); ctx.stroke(); ctx.setLineDash([]);
  // perpendicular from b's tip to the line of a
  ctx.strokeStyle = C.ghost; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(P.X(b.x), P.Y(b.y)); ctx.lineTo(P.X(pv.x), P.Y(pv.y)); ctx.stroke(); ctx.setLineDash([]);
  // angle arc
  const r = 26, a0 = Math.atan2(-a.y, a.x), a1 = Math.atan2(-b.y, b.x);
  let dlt = a1 - a0; while (dlt > Math.PI) dlt -= 2 * Math.PI; while (dlt < -Math.PI) dlt += 2 * Math.PI;
  ctx.strokeStyle = C.text; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(P.X(0), P.Y(0), r, a0, a0 + dlt, dlt < 0); ctx.stroke();
  ctx.restore();
  seg(P, M.v(-3 * a.x, -3 * a.y), M.v(3 * a.x, 3 * a.y)); seg(P, b, pv);
  ctx.save(); ctx.strokeStyle = C.green; ctx.lineWidth = 7; ctx.globalAlpha = 0.75; ctx.lineCap = 'butt'; ctx.beginPath(); ctx.moveTo(P.X(0), P.Y(0)); ctx.lineTo(P.X(pv.x), P.Y(pv.y)); ctx.stroke(); ctx.restore();
  arrow(ctx, P, O, a, C.orange); arrow(ctx, P, O, b, C.violet);
  label(ctx, P, 'a', O, a, C.orange); label(ctx, P, 'b', O, b, C.violet);
  // θ label on the bisector, outside the arc
  { const mid = a0 + dlt / 2, cx = P.X(0) + Math.cos(mid) * (r + 12), cy = P.Y(0) + Math.sin(mid) * (r + 12), bx = { x0: cx - 5, x1: cx + 5, y0: cy - 8, y1: cy + 8 };
    if (Math.abs(dlt) > 0.35 && !P.labels.some(o => hitBox(o, bx)) && !P.segs.some(s => segHits(s, bx))) { ctx.save(); ctx.font = '600 13px system-ui,sans-serif'; ctx.fillStyle = C.text; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('θ', cx, cy); ctx.restore(); P.labels.push(bx); } }

  ({ ctx, W, H } = fitCanvas($('c4b')));
  const L = 40, R = W - 12, T = 26, B = H - 24, X = v => L + v / 180 * (R - L), Y = v => T + (20 - v) / 40 * (B - T);
  title(ctx, t('c4b'), 8, T - 9, W - 16);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.lineWidth = 1;
  [-20, -10, 0, 10, 20].forEach(v => { ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(L, Y(v)); ctx.lineTo(R, Y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(String(v), L - 5, Y(v) + 4); });
  let last = -Infinity; ctx.textAlign = 'center';
  [0, 45, 90, 135, 180].forEach(v => { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(X(v), T); ctx.lineTo(X(v), B); ctx.stroke(); const s = v + '°', w = ctx.measureText(s).width, cx = Math.min(X(v), W - w / 2 - 1); if (cx - w / 2 > last + 6) { ctx.fillText(s, cx, B + 15); last = cx + w / 2; } });
  ctx.strokeStyle = C.grid2; ctx.strokeRect(L, T, R - L, B - T);
  ctx.strokeStyle = C.orange; ctx.lineWidth = 2; ctx.beginPath();
  for (let i = 0; i <= 180; i++) { const yv = A4 * bl * Math.cos(i * M.DEG); if (!i) ctx.moveTo(X(i), Y(yv)); else ctx.lineTo(X(i), Y(yv)); } ctx.stroke();
  s4.seen.forEach((v, k) => { ctx.fillStyle = C.text; ctx.beginPath(); ctx.arc(X(k), Y(v), 3.4, 0, 7); ctx.fill(); });
  ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.arc(X(th), Y(d1), 6, 0, 7); ctx.fill();
  ctx.restore();
  const sign = Math.abs(d1) < 1e-9 ? t('signZero') : d1 > 0 ? t('signPos') : t('signNeg');
  $('r4').textContent = t('s4readout', { prog: s4.prog, ax: fmt(a.x), ay: fmt(a.y), bx: par(b.x), by: par(b.y), d1: fmt(d1), mb: fmt(bl), th: fmt(th, 1), d2: fmt(d2), pr: fmt(pr), sign });
}

/* ---------- step 5: crosswind ---------- */
const s5 = { phi: 0 };
function draw5() {
  const w = num('w5'), phi = s5.phi, f = M.flight(phi, w), O = M.v(0, 0);
  $('w5v').textContent = String(w); $('ph5v').textContent = fmt(phi) + '°';
  let { ctx, W, H } = fitCanvas($('c5'), 240 / 260);
  let P = plane(ctx, W, H, { xr: [-130, 130], yr: [-20, 220], grid: 20, step: 40, left: 34, title: t('c5a') });
  arrow(ctx, P, O, f.air, C.orange); arrow(ctx, P, f.air, f.ground, C.violet); arrow(ctx, P, O, f.ground, C.cyan, { lw: 3.4 });
  dot(ctx, P, O, C.text, 4);

  ({ ctx, W, H } = fitCanvas($('c5b'), 350 / 380));
  P = plane(ctx, W, H, { xr: [-190, 190], yr: [-20, 330], grid: 50, step: 100, left: 34, title: t('c5b') });
  clipBox(ctx, P); ctx.strokeStyle = C.ghost; ctx.lineWidth = 1.6; ctx.setLineDash([6, 5]); ctx.beginPath(); ctx.moveTo(P.X(0), P.Y(0)); ctx.lineTo(P.X(0), P.Y(300)); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = C.cyan; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(P.X(0), P.Y(0)); ctx.lineTo(P.X(f.drift), P.Y(300)); ctx.stroke();
  // half-hour marks along the track
  ctx.fillStyle = C.cyan; for (let h = 0.5; h < f.hours; h += 0.5) { ctx.beginPath(); ctx.arc(P.X(f.ground.x * h), P.Y(f.ground.y * h), 3, 0, 7); ctx.fill(); }
  ctx.restore();
  dot(ctx, P, M.v(0, 300), C.green, 8, true); dot(ctx, P, O, C.text, 4.5); dot(ctx, P, M.v(f.drift, 300), C.cyan, 5);

  const east = f.track >= 0, de = f.drift >= 0;
  const aimed = Math.abs(f.drift) < 0.5;
  const verdict = aimed ? t('aimOk', { ph: fmt(Math.abs(phi), 2), gs: fmt(f.speed, 1) }) : t('aimNeed', { ph: fmt(M.aimHeading(w), 2), w });
  $('r5').textContent = t('s5readout', { gx: fmt(f.ground.x, 1), gy: fmt(f.ground.y, 1), gs: fmt(f.speed, 1), side: t(east ? 'east' : 'west'), tr: fmt(Math.abs(f.track), 2), h: fmt(f.hours, 3), side2: t(de ? 'east' : 'west'), dr: fmt(Math.abs(f.drift), 1), verdict });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  ['ax0', 'ay0'].forEach(id => $(id).addEventListener('input', () => { draw0(); draw1(); draw2(); }));
  $('move0').addEventListener('click', () => { s0.i = (s0.i + 1) % STARTS.length; draw0(); });
  ['bx1', 'by1'].forEach(id => $(id).addEventListener('input', () => { draw1(); draw2(); }));
  $('other1').addEventListener('click', () => { s1.other = !s1.other; draw1(); });
  $('k2').addEventListener('input', draw2);

  ['cx3', 'cy3', 's3', 't3'].forEach(id => $(id).addEventListener('input', () => { stopAnim('s3'); draw3(); }));
  $('par3').addEventListener('click', () => { s3.par = !s3.par; draw3(); });
  $('solve3').addEventListener('click', () => {
    const c = M.v(num('cx3'), num('cy3')), e2 = s3.par ? M.BASIS.e2par : M.BASIS.e2;
    let sol = M.decompose(c, M.BASIS.e1, e2);
    if (!sol && c.y === 0) sol = { s: c.x / M.BASIS.e1.x, t: 0 };
    if (!sol) { draw3(); return; }
    const s0v = num('s3'), t0v = num('t3'), q = v => Math.round(v * 4) / 4;
    animate('s3', 700, p => { $('s3').value = p < 1 ? q(s0v + (sol.s - s0v) * p) : sol.s; $('t3').value = p < 1 ? q(t0v + (sol.t - t0v) * p) : sol.t; draw3(); });
  });
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked');
    const ok = !!choice && choice.value === 'b';
    $('quizFeedback').textContent = t(ok ? 'correct' : 'wrong');
    $('quizFeedback').style.color = ok ? C.green : C.orange;
  });

  ['al4', 'be4'].forEach(id => $(id).addEventListener('input', () => { stopAnim('s4'); s4.prog = ''; draw4(); }));
  $('bl4').addEventListener('input', () => { stopAnim('s4'); s4.prog = ''; s4.seen.clear(); draw4(); });
  $('sweep4').addEventListener('click', () => {
    s4.seen.clear(); const b0 = num('be4'), N = 72;
    animate('s4', 6500, p => {
      const i = Math.min(N, Math.floor(p * N + 1e-9));
      for (let j = 0; j <= i; j++) { const bb = (b0 + 5 * j) % 360; $('be4').value = bb; const { a, b } = vec4(); s4.seen.set(Math.round(M.between(a, b) * 10) / 10, M.dot(a, b)); }
      $('be4').value = (b0 + 5 * i) % 360; s4.prog = i < N ? t('s4progress', { c: i, N }) : ''; draw4();
    });
  });

  $('w5').addEventListener('input', draw5);
  $('ph5').addEventListener('input', () => { s5.phi = num('ph5'); draw5(); });
  $('aim5').addEventListener('click', () => { s5.phi = M.aimHeading(num('w5')); $('ph5').value = s5.phi; draw5(); });

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
