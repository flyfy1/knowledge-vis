'use strict';
// Conic sections lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, point and readout comes from window.CONIC_MODEL (model.js). Canvas text is limited to
// one title row per panel; point names, colours and numbers live in the DOM legends and readouts.
(function () {

const $ = id => document.getElementById(id);
const M = window.CONIC_MODEL;
const t = (...a) => window.CONIC_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#1d2938', axis: '#3a4d63', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', cone: '#8fa3bb', fill: 'rgba(143,163,187,0.10)' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const f2 = v => (Math.abs(v) < 0.005 ? 0 : v).toFixed(2);
const f3 = v => (Math.abs(v) < 0.0005 ? 0 : v).toFixed(3);

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  // CSS height comes from the authored attribute (or data-narrow-h below 520 px, where the two views stack).
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
// Equal-scale view of the box [x0,x1]×[y0,y1] inside the rectangle (L, T, R, B); y points up. Clips drawing to the box.
function view(ctx, rect, box) {
  const sx = (rect.R - rect.L) / (box.x1 - box.x0), sy = (rect.B - rect.T) / (box.y1 - box.y0), s = Math.min(sx, sy);
  const cx = (rect.L + rect.R) / 2, cy = (rect.T + rect.B) / 2, mx = (box.x0 + box.x1) / 2, my = (box.y0 + box.y1) / 2;
  const X = v => cx + (v - mx) * s, Y = v => cy - (v - my) * s;
  return { X, Y, s, clip() { ctx.save(); ctx.beginPath(); ctx.rect(rect.L, rect.T, rect.R - rect.L, rect.B - rect.T); ctx.clip(); }, unclip() { ctx.restore(); }, rect };
}
function frame(ctx, rect) { ctx.save(); ctx.strokeStyle = '#1c2836'; ctx.lineWidth = 1; ctx.strokeRect(rect.L + 0.5, rect.T + 0.5, rect.R - rect.L - 1, rect.B - rect.T - 1); ctx.restore(); }
function axes(ctx, v, color = C.axis) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(v.rect.L, v.Y(0)); ctx.lineTo(v.rect.R, v.Y(0)); ctx.moveTo(v.X(0), v.rect.T); ctx.lineTo(v.X(0), v.rect.B); ctx.stroke(); ctx.restore();
}
function grid(ctx, v, stepU = 1) {
  ctx.save(); ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
  const x0 = Math.ceil((v.rect.L - v.X(0)) / v.s / stepU) * stepU, x1 = (v.rect.R - v.X(0)) / v.s;
  for (let x = x0; x <= x1; x += stepU) { ctx.beginPath(); ctx.moveTo(v.X(x), v.rect.T); ctx.lineTo(v.X(x), v.rect.B); ctx.stroke(); }
  const y0 = Math.ceil((v.Y(0) - v.rect.B) / v.s / stepU) * stepU, y1 = (v.Y(0) - v.rect.T) / v.s;
  for (let y = y0; y <= y1; y += stepU) { ctx.beginPath(); ctx.moveTo(v.rect.L, v.Y(y)); ctx.lineTo(v.rect.R, v.Y(y)); ctx.stroke(); }
  ctx.restore();
}
function seg(ctx, v, a, b, color, lw = 2, dash = []) { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(v.X(a[0]), v.Y(a[1])); ctx.lineTo(v.X(b[0]), v.Y(b[1])); ctx.stroke(); ctx.restore(); }
function pt(ctx, v, p, r, color, hollow = false) {
  ctx.save(); ctx.beginPath(); ctx.arc(v.X(p[0]), v.Y(p[1]), r, 0, 7);
  if (hollow) { ctx.fillStyle = C.bg; ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke(); } else { ctx.fillStyle = color; ctx.fill(); ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5; ctx.stroke(); }
  ctx.restore();
}
function poly(ctx, v, pts, color, lw = 2.4, dash = [], alpha = 1, close = false) {
  if (pts.length < 2) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.setLineDash(dash); ctx.globalAlpha = alpha; ctx.beginPath();
  pts.forEach((p, i) => { if (!i) ctx.moveTo(v.X(p[0]), v.Y(p[1])); else ctx.lineTo(v.X(p[0]), v.Y(p[1])); });
  if (close) ctx.closePath(); ctx.stroke(); ctx.restore();
}
function circle(ctx, v, c, r, color, fill) { ctx.save(); ctx.beginPath(); ctx.arc(v.X(c[0]), v.Y(c[1]), r * v.s, 0, 7); if (fill) { ctx.fillStyle = fill; ctx.fill(); } ctx.strokeStyle = color; ctx.lineWidth = 1.6; ctx.stroke(); ctx.restore(); }
const twoRects = (W, H, top = 28) => W >= 520
  ? [{ L: 8, T: top, R: W / 2 - 5, B: H - 8 }, { L: W / 2 + 5, T: top, R: W - 8, B: H - 8 }]
  : [{ L: 8, T: top, R: W - 8, B: (H + top) / 2 - 18 }, { L: 8, T: (H + top) / 2 + 18, R: W - 8, B: H - 8 }];

/* ---------- shared animation runner ---------- */
const anims = {};
function animate(name, ms, frameFn, done) {
  stopAnim(name);
  if (reduceMotion()) { frameFn(1); if (done) done(); return; }
  const start = performance.now();
  const tick = now => { const p = Math.min(1, (now - start) / ms); frameFn(p); if (p < 1) anims[name] = { id: requestAnimationFrame(tick), frame: frameFn, done }; else { delete anims[name]; if (done) done(); } };
  anims[name] = { id: requestAnimationFrame(tick), frame: frameFn, done };
}
function stopAnim(name) { if (anims[name]) { cancelAnimationFrame(anims[name].id); delete anims[name]; } }
function finishAll() { Object.keys(anims).forEach(k => { const a = anims[k]; cancelAnimationFrame(a.id); delete anims[k]; a.frame(1); if (a.done) a.done(); }); }

// Side view of the double cone and the plane's trace; returns the view.
function sideView(ctx, rect, box, beta, showPlane = true) {
  const v = view(ctx, rect, box), k = Math.tan(M.ALPHA * M.D2R);
  v.clip();
  const zt = box.y1 + 1, zb = box.y0 - 1;
  ctx.save(); ctx.fillStyle = C.fill; ctx.beginPath(); ctx.moveTo(v.X(0), v.Y(0)); ctx.lineTo(v.X(k * zt), v.Y(zt)); ctx.lineTo(v.X(-k * zt), v.Y(zt)); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(v.X(0), v.Y(0)); ctx.lineTo(v.X(k * zb), v.Y(zb)); ctx.lineTo(v.X(-k * zb), v.Y(zb)); ctx.closePath(); ctx.fill(); ctx.restore();
  seg(ctx, v, [k * zb, zb], [k * zt, zt], C.cone, 1.6);
  seg(ctx, v, [-k * zb, zb], [-k * zt, zt], C.cone, 1.6);
  seg(ctx, v, [0, zb], [0, zt], C.axis, 1, [3, 4]);
  if (showPlane) {
    const b = beta * M.D2R, far = 30;
    seg(ctx, v, [-far * Math.cos(b), M.H - far * Math.sin(b)], [far * Math.cos(b), M.H + far * Math.sin(b)], C.violet, 1.6, [6, 4]);
    // the part of the trace that lies inside the cone (the section's long axis) in orange
    const hits = M.sideHits(beta).sort((p, q) => p - q), P = u => [u * Math.cos(b), M.H + u * Math.sin(b)];
    if (hits.length === 2) {
      const kd = M.kind(beta);
      if (kd === 'hyperbola') { seg(ctx, v, P(hits[1]), P(hits[1] + far), C.orange, 3); seg(ctx, v, P(hits[0]), P(hits[0] - far), C.orange, 3); }
      else seg(ctx, v, P(hits[0]), P(hits[1]), C.orange, 3);
      hits.forEach(u => pt(ctx, v, P(u), 4, C.orange));
    } else if (hits.length === 1) { seg(ctx, v, P(hits[0]), P(hits[0] + far), C.orange, 3); pt(ctx, v, P(hits[0]), 4, C.orange); }
    pt(ctx, v, [0, M.H], 3.5, C.violet);
  }
  v.unclip();
  return v;
}

/* ---------- step 0: tilt the plane ---------- */
const s0 = { seen: new Set([0]) };
function draw0() {
  const beta = num('b0');
  $('b0v').textContent = beta + '°';
  const { ctx, W, H } = fitCanvas($('c0'));
  const [R1, R2] = twoRects(W, H);
  frame(ctx, R1); frame(ctx, R2);
  title(ctx, t('c0a'), R1.L + 6, R1.T - 9, R1.R - R1.L - 6); title(ctx, t('c0b'), R2.L + 6, R2.T - 9, R2.R - R2.L - 6);
  sideView(ctx, R1, { x0: -3.4, x1: 3.4, y0: -3, y1: 4.4 }, beta);
  const v = view(ctx, R2, { x0: -4.6, x1: 4.6, y0: -3, y1: 3 });
  v.clip(); grid(ctx, v); axes(ctx, v, C.violet);
  // earlier tilts stay as faint traces
  [...s0.seen].forEach(b => { if (b !== beta) M.sectionCurve(b, 14, 240).forEach(r => poly(ctx, v, r, C.cyan, 1.2, [], 0.18)); });
  M.sectionCurve(beta).forEach(r => poly(ctx, v, r, C.cyan, 2.6));
  M.sideHits(beta).forEach(u => pt(ctx, v, [u, 0], 4, C.orange));
  pt(ctx, v, [0, 0], 3.5, C.violet);
  v.unclip();
  const sh = M.sectionShape(beta), kd = M.kind(beta), e = M.ecc(beta), side = 90 - M.ALPHA;
  const cmp = beta < side ? t('cmpLess', { b: beta, s: side }) : beta === side ? t('cmpEq', { s: side }) : t('cmpMore', { b: beta, s: side });
  let shape = '';
  if (kd === 'circle' || kd === 'ellipse') shape = t('shapeEll', { a: f2(sh.a), b: f2(sh.b) });
  else if (kd === 'hyperbola') shape = t('shapeHyp');
  else shape = t('shapePar');
  $('r0txt').textContent = t('s0readout', { b: beta, cmp, kind: t('k_' + kd), e: f3(e), shape });
}

/* ---------- step 1: Dandelin spheres ---------- */
const s1 = { trail: [] };
function draw1() {
  const beta = num('b1'), tp = num('p1');
  $('b1v').textContent = beta + '°'; $('p1v').textContent = tp + '°';
  const { ctx, W, H } = fitCanvas($('c1'));
  const [R1, R2] = twoRects(W, H);
  frame(ctx, R1); frame(ctx, R2);
  title(ctx, t('c1a'), R1.L + 6, R1.T - 9, R1.R - R1.L - 6); title(ctx, t('c1b'), R2.L + 6, R2.T - 9, R2.R - R2.L - 6);
  const v = sideView(ctx, R1, { x0: -3.6, x1: 3.6, y0: -0.4, y1: 6.8 }, beta);
  const D = M.dandelin(beta), b = beta * M.D2R, k = Math.tan(M.ALPHA * M.D2R), sa = Math.sin(M.ALPHA * M.D2R), ca = Math.cos(M.ALPHA * M.D2R);
  v.clip();
  D.forEach((s, i) => {
    circle(ctx, v, [0, s.zc], s.r, i ? C.green : C.pink, i ? 'rgba(126,226,168,0.10)' : 'rgba(255,122,147,0.12)');
    seg(ctx, v, [-k * s.contactZ, s.contactZ], [k * s.contactZ, s.contactZ], i ? C.green : C.pink, 1.4, [4, 3]);
    pt(ctx, v, [s.focusU * Math.cos(b), M.H + s.focusU * Math.sin(b)], 4.5, i ? C.green : C.pink);
  });
  // the generator piece between the two contact circles (length L = 2a), on the right-hand side
  seg(ctx, v, [D[0].slant * sa, D[0].slant * ca], [D[1].slant * sa, D[1].slant * ca], C.text, 3.4);
  v.unclip();

  const sh = M.sectionShape(beta), P = M.ellipsePoint(beta, tp), q = M.focalCheck(beta, P[0], P[1]);
  const ext = Math.max(sh.a + Math.abs(sh.uc), sh.b) * 1.15 + 0.2;
  const R2top = { ...R2, B: R2.B - 34 };
  const w = view(ctx, R2top, { x0: -ext, x1: ext, y0: -ext * 0.75, y1: ext * 0.75 });
  w.clip(); axes(ctx, w, C.violet);
  M.sectionCurve(beta).forEach(r => poly(ctx, w, r, C.cyan, 2.4));
  s1.trail.forEach(p => pt(ctx, w, M.ellipsePoint(beta, p), 2, C.text));
  const F1 = [D[0].focusU, 0], F2 = [D[1].focusU, 0];
  seg(ctx, w, P, F1, C.pink, 2.6); seg(ctx, w, P, F2, C.green, 2.6);
  pt(ctx, w, F1, 4.5, C.pink); pt(ctx, w, F2, 4.5, C.green); pt(ctx, w, P, 6, C.text);
  w.unclip();
  // bar: PF1 + PF2 against the generator length L (same scale)
  const bx0 = R2.L + 14, bx1 = R2.R - 14, by = R2.B - 22, sc = (bx1 - bx0) / q.L;
  ctx.save();
  ctx.fillStyle = C.pink; ctx.fillRect(bx0, by, q.d1 * sc, 9);
  ctx.fillStyle = C.green; ctx.fillRect(bx0 + q.d1 * sc, by, q.d2 * sc, 9);
  ctx.fillStyle = C.text; ctx.fillRect(bx0, by + 13, q.L * sc, 4);
  ctx.restore();
  const kd = beta === 0 ? 'circleNote' : 'ellNote';
  $('r1txt').textContent = t('s1readout', { d1: f3(q.d1), d2: f3(q.d2), sum: f3(q.sum), L: f3(q.L), a2: f3(2 * sh.a), c1: f3(q.toC1), c2: f3(q.toC2), note: t(kd) });
}

/* ---------- step 2: pins and string ---------- */
const s2 = { mode: 'sum', trail: new Set() };
function draw2() {
  const a = num('a2'), c = num('cs2'), p = num('p2');
  $('a2v').textContent = a.toFixed(1); $('cs2v').textContent = c.toFixed(1); $('p2v').textContent = Math.round(p * 100) + '%';
  $('mode2sum').setAttribute('aria-pressed', s2.mode === 'sum'); $('mode2diff').setAttribute('aria-pressed', s2.mode === 'diff');
  const { ctx, W, H } = fitCanvas($('c2'));
  const R = { L: 8, T: 28, R: W - 8, B: H - 8 };
  frame(ctx, R); title(ctx, t(s2.mode === 'sum' ? 'c2sum' : 'c2diff'), R.L + 6, R.T - 9, R.R - R.L - 6);
  const v = view(ctx, R, { x0: -6.2, x1: 6.2, y0: -3.9, y1: 3.9 });
  v.clip(); grid(ctx, v); axes(ctx, v);
  const cur = M.pinCurve(s2.mode, a, c), F1 = [-c, 0], F2 = [c, 0];
  if (cur) {
    [...s2.trail].forEach(k => pt(ctx, v, M.pencil(cur, k / 200), 2.1, C.cyan));
    const P = M.pencil(cur, p);
    seg(ctx, v, F1, P, C.pink, 2.6); seg(ctx, v, F2, P, C.green, 2.6);
    pt(ctx, v, P, 6, C.text);
  }
  pt(ctx, v, F1, 5, C.pink); pt(ctx, v, F2, 5, C.green);
  v.unclip();
  if (!cur) { $('r2txt').textContent = t(s2.mode === 'sum' ? 's2badSum' : 's2badDiff', { a: a.toFixed(1), c: c.toFixed(1) }); return; }
  const P = M.pencil(cur, p), d = M.pinDistances(cur, P);
  const prog = t('s2progress', { c: s2.trail.size, N: 200 });
  const eq = s2.mode === 'sum' ? t('eqEll', { a2: f2(a * a), b2: f2(cur.b * cur.b) }) : t('eqHyp', { a2: f2(a * a), b2: f2(cur.b * cur.b) });
  $('r2txt').textContent = prog + t(s2.mode === 'sum' ? 's2readSum' : 's2readDiff', { d1: f2(d.d1), d2: f2(d.d2), s: f2(s2.mode === 'sum' ? d.sum : d.diff), a2: f2(2 * a), b: f2(cur.b), e: f2(cur.e), eq });
}
function mark2(p) { s2.trail.add(Math.round(p * 200) % 200); }

/* ---------- step 3: focus and directrix ---------- */
const s3 = { seen: new Set() };
function curveE(e) {
  const runs = []; let cur = [];
  for (let i = 0; i <= 1440; i++) {
    const th = -180 + i * 0.25, P = M.fdPoint(e, th);
    if (!isFinite(P[0]) || Math.hypot(P[0], P[1]) > 40) { if (cur.length) runs.push(cur); cur = []; continue; }
    cur.push(P);
  }
  if (cur.length) runs.push(cur);
  return runs;
}
function draw3() {
  const e = num('e3'), th = num('t3');
  $('e3v').textContent = e.toFixed(2); $('t3v').textContent = th + '°';
  const { ctx, W, H } = fitCanvas($('c3'));
  const R = { L: 8, T: 28, R: W - 8, B: H - 8 };
  frame(ctx, R); title(ctx, t('c3'), R.L + 6, R.T - 9, R.R - R.L - 6);
  const v = view(ctx, R, { x0: -4.8, x1: 6.2, y0: -3.6, y1: 3.6 });
  v.clip(); grid(ctx, v); axes(ctx, v);
  [...s3.seen].forEach(k => { const ee = Number(k); if (Math.abs(ee - e) > 1e-9) curveE(ee).forEach(r => poly(ctx, v, r, Math.abs(ee - 1) < 1e-9 ? C.orange : C.cyan, 1.2, [], 0.22)); });
  const dx = e > 0 ? -M.LR / e : -Infinity;
  if (isFinite(dx)) seg(ctx, v, [dx, -50], [dx, 50], C.violet, 2, [7, 5]);
  curveE(e).forEach(r => poly(ctx, v, r, C.cyan, 2.6));
  const P = M.fdPoint(e, th), F = [0, 0], q = M.fdCheck(e, P), inView = isFinite(P[0]) && Math.hypot(P[0], P[1]) < 40;
  if (inView) { seg(ctx, v, F, P, C.pink, 2.4); if (isFinite(dx)) seg(ctx, v, P, [dx, P[1]], C.orange, 2.4); pt(ctx, v, P, 6, C.text); }
  pt(ctx, v, F, 5, C.pink);
  v.unclip();
  const kd = M.kindOfE(Math.round(e * 100) / 100);
  let line;
  if (!inView) line = t('s3inf');
  else if (e === 0) line = t('s3circle', { pf: f2(q.pf) });
  else line = t('s3readout', { pf: f2(q.pf), pd: f2(q.pd), ratio: f3(q.ratio), branch: M.polarR(e, th) < 0 ? t('farBranch') : '' });
  $('r3txt').textContent = t('s3kind', { e: e.toFixed(2), kind: t('k_' + kd), d: isFinite(dx) ? f2(-dx) : '∞' }) + line;
}

/* ---------- step 4: reflection ---------- */
const s4 = { mirror: 'parabola', pulse: null };
const PAR = { f: 1, Y0: 5.2, X: 3.6 }, ELL = { a: 3, b: 2 };
function rays4() {
  const n = num('n4'), out = [];
  if (s4.mirror === 'parabola') for (let i = 0; i < n; i++) { const x0 = -PAR.X + 2 * PAR.X * (i + 0.5) / n; out.push(M.parabolaRay(PAR.f, x0, PAR.Y0)); }
  else for (let i = 0; i < n; i++) out.push(M.ellipseRay(ELL.a, ELL.b, 360 * (i + 0.5) / n));
  return out;
}
function along(r, s) { // point at distance s along the ray's two legs
  const start = s4.mirror === 'parabola' ? [r.P[0], PAR.Y0] : r.F1, end = s4.mirror === 'parabola' ? r.F : r.F2;
  if (s <= r.leg1) { const q = s / r.leg1; return [start[0] + (r.P[0] - start[0]) * q, start[1] + (r.P[1] - start[1]) * q]; }
  const q = Math.min(1, (s - r.leg1) / r.leg2); return [r.P[0] + (end[0] - r.P[0]) * q, r.P[1] + (end[1] - r.P[1]) * q];
}
function draw4() {
  const n = num('n4'); $('n4v').textContent = n;
  $('mir4par').setAttribute('aria-pressed', s4.mirror === 'parabola'); $('mir4ell').setAttribute('aria-pressed', s4.mirror === 'ellipse');
  const { ctx, W, H } = fitCanvas($('c4'));
  const R = { L: 8, T: 28, R: W - 8, B: H - 8 };
  frame(ctx, R); title(ctx, t(s4.mirror === 'parabola' ? 'c4par' : 'c4ell'), R.L + 6, R.T - 9, R.R - R.L - 6);
  const box = s4.mirror === 'parabola' ? { x0: -4.2, x1: 4.2, y0: -0.6, y1: 5.6 } : { x0: -3.5, x1: 3.5, y0: -2.4, y1: 2.4 };
  const v = view(ctx, R, box), rays = rays4();
  v.clip(); grid(ctx, v);
  // mirror
  const mir = [];
  if (s4.mirror === 'parabola') for (let i = 0; i <= 200; i++) { const x = -4.2 + 8.4 * i / 200; mir.push([x, x * x / (4 * PAR.f)]); }
  else for (let i = 0; i <= 240; i++) { const a = 2 * Math.PI * i / 240; mir.push([ELL.a * Math.cos(a), ELL.b * Math.sin(a)]); }
  poly(ctx, v, mir, C.cyan, 3);
  const pulse = s4.pulse;
  rays.forEach(r => {
    const start = s4.mirror === 'parabola' ? [r.P[0], PAR.Y0] : r.F1, end = s4.mirror === 'parabola' ? r.F : r.F2;
    ctx.save(); ctx.globalAlpha = pulse === null ? 0.85 : 0.3;
    seg(ctx, v, start, r.P, C.green, 1.5); seg(ctx, v, r.P, end, C.orange, 1.5); ctx.restore();
    if (pulse !== null) pt(ctx, v, along(r, pulse * r.path), 4, C.text);
  });
  if (s4.mirror === 'parabola') seg(ctx, v, [-4.2, PAR.Y0], [4.2, PAR.Y0], C.violet, 1.4, [6, 4]);
  else pt(ctx, v, [-Math.sqrt(ELL.a ** 2 - ELL.b ** 2), 0], 5, C.pink);
  pt(ctx, v, s4.mirror === 'parabola' ? [0, PAR.f] : [Math.sqrt(ELL.a ** 2 - ELL.b ** 2), 0], 6, C.pink);
  v.unclip();
  const miss = Math.max(...rays.map(r => r.miss)), lo = Math.min(...rays.map(r => r.path)), hi = Math.max(...rays.map(r => r.path));
  const prog = pulse !== null && pulse < 1 ? t('s4progress', { p: Math.round(pulse * 100) }) : '';
  $('r4txt').textContent = prog + t(s4.mirror === 'parabola' ? 's4readPar' : 's4readEll', { n, miss: f3(miss), lo: f3(lo), hi: f3(hi), f: PAR.f, Y0: PAR.Y0, a2: 2 * ELL.a });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); }

function setup() {
  $('b0').addEventListener('input', () => { s0.seen.add(num('b0')); draw0(); });
  $('sweep0').addEventListener('click', () => {
    s0.seen = new Set([0]);
    animate('s0', 6000, p => { const b = Math.round(p * 85); for (let q = 0; q <= b; q += 5) s0.seen.add(q); $('b0').value = b; draw0(); });
  });
  $('b1').addEventListener('input', () => { s1.trail = []; draw1(); });
  $('p1').addEventListener('input', () => { stopAnim('s1'); s1.trail.push(num('p1')); if (s1.trail.length > 400) s1.trail.shift(); draw1(); });
  $('walk1').addEventListener('click', () => {
    s1.trail = [];
    animate('s1', 5000, p => { const v = Math.round(p * 359); s1.trail = []; for (let q = 0; q <= v; q += 3) s1.trail.push(q); $('p1').value = v; draw1(); });
  });
  ['a2', 'cs2'].forEach(id => $(id).addEventListener('input', () => { stopAnim('s2'); s2.trail.clear(); mark2(num('p2')); draw2(); }));
  $('p2').addEventListener('input', () => { stopAnim('s2'); mark2(num('p2')); draw2(); });
  $('mode2sum').addEventListener('click', () => { stopAnim('s2'); s2.mode = 'sum'; $('a2').value = 4; $('cs2').value = 2.4; s2.trail.clear(); mark2(num('p2')); draw2(); });
  $('mode2diff').addEventListener('click', () => { stopAnim('s2'); s2.mode = 'diff'; $('a2').value = 1.6; $('cs2').value = 2.6; s2.trail.clear(); mark2(num('p2')); draw2(); });
  $('draw2').addEventListener('click', () => {
    s2.trail.clear();
    animate('s2', 6000, p => { const k = Math.min(199, Math.floor(p * 200)); for (let q = 0; q <= k; q++) s2.trail.add(q); $('p2').value = (k / 200).toFixed(3); draw2(); });
  });
  $('clear2').addEventListener('click', () => { stopAnim('s2'); s2.trail.clear(); mark2(num('p2')); draw2(); });
  mark2(num('p2'));
  $('e3').addEventListener('input', () => { stopAnim('s3'); s3.seen.add(num('e3').toFixed(2)); draw3(); });
  $('t3').addEventListener('input', draw3);
  $('sweep3').addEventListener('click', () => {
    s3.seen.clear();
    animate('s3', 6000, p => { const e = Math.round((0.2 + p * 1.8) * 20) / 20; for (let q = 0.2; q <= e + 1e-9; q += 0.2) s3.seen.add(q.toFixed(2)); s3.seen.add('1.00'); $('e3').value = e.toFixed(2); draw3(); });
  });
  $('clear3').addEventListener('click', () => { stopAnim('s3'); s3.seen.clear(); draw3(); });
  $('n4').addEventListener('input', () => { stopAnim('s4'); s4.pulse = null; draw4(); });
  $('mir4par').addEventListener('click', () => { stopAnim('s4'); s4.pulse = null; s4.mirror = 'parabola'; draw4(); });
  $('mir4ell').addEventListener('click', () => { stopAnim('s4'); s4.pulse = null; s4.mirror = 'ellipse'; draw4(); });
  $('fire4').addEventListener('click', () => { animate('s4', 3500, p => { s4.pulse = p; draw4(); }); });

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
  window.refreshConic = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
