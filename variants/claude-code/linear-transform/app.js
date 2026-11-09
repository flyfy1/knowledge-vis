'use strict';
// 2D linear maps lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every arrow, grid, area and readout comes from window.LT_MODEL (model.js).
// Canvas text: one title row per canvas (shrinks to fit), axis ticks of the step-3 chart in fixed rows,
// and short symbol tags (e₁, Ae₂, p …) placed by a placer that never overlaps an earlier tag.
(function () {

const $ = id => document.getElementById(id);
const M = window.LT_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#1f2c3b', axis: '#3d5068', text: '#e8edf4', bg: '#0d1621', ghost: '#6f8097' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d); return s.includes('.') ? s.replace(/\.?0+$/, '') : s; };

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
function fitText(ctx, text, X, Y, maxW, align = 'left', color = C.text, size = 12, weight = '600') {
  ctx.save(); ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  let s = size;
  do { ctx.font = `${weight} ${s}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; s -= 0.5; } while (s > 7.5);
  ctx.fillText(text, X, Y); ctx.restore();
}

// Places short tags near an anchor inside a rectangle, never overlapping an earlier tag.
function tagPlacer(ctx, P) {
  const boxes = [];
  const hit = b => boxes.some(q => b.x0 < q.x1 + 3 && b.x1 > q.x0 - 3 && b.y0 < q.y1 + 3 && b.y1 > q.y0 - 3);
  return {
    // Keep tags off a marker of radius r centred at (x, y).
    reserve(x, y, r) { if (isFinite(x) && isFinite(y)) boxes.push({ x0: x - r, x1: x + r, y0: y - r, y1: y + r }); },
    put(text, ax, ay, color, prefs = ['ne', 'se', 'nw', 'sw', 'e', 'w', 'n', 's']) {
      if (!isFinite(ax) || !isFinite(ay)) return false;
      ctx.save(); ctx.font = '600 13px system-ui,sans-serif';
      const w = ctx.measureText(text).width, h = 13;
      for (const d of [6, 12, 20, 32]) for (const p of prefs) {
        const dx = p.includes('e') ? d : p.includes('w') ? -d - w : -w / 2;
        const dy = p.includes('n') ? -d : p.includes('s') ? d + h : h / 2 - 1;
        const X = ax + dx, Y = ay + dy, b = { x0: X - 2, x1: X + w + 2, y0: Y - h, y1: Y + 3 };
        if (b.x0 < P.l + 2 || b.x1 > P.r - 2 || b.y0 < P.t + 2 || b.y1 > P.b - 2 || hit(b)) continue;
        boxes.push(b);
        ctx.fillStyle = 'rgba(13,22,33,0.8)'; ctx.fillRect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0);
        ctx.fillStyle = color; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText(text, X, Y);
        ctx.restore(); return true;
      }
      ctx.restore(); return false;
    }
  };
}

// A square-unit view of the plane, centred on the origin, showing [−R, R] along the shorter side.
function plane(ctx, W, H, R, title) {
  const top = 26, P = { l: 4, r: W - 4, t: top, b: H - 4 };
  const unit = Math.min((P.r - P.l) / (2 * R), (P.b - P.t) / (2 * R));
  const cx = (P.l + P.r) / 2, cy = (P.t + P.b) / 2;
  const X = x => cx + x * unit, Y = y => cy - y * unit;
  const xr = (P.r - cx) / unit, yr = (cy - P.t) / unit;
  ctx.save(); ctx.lineWidth = 1;
  for (let i = -Math.ceil(xr); i <= Math.ceil(xr); i++) { ctx.strokeStyle = i ? C.grid : C.axis; ctx.beginPath(); ctx.moveTo(X(i), P.t); ctx.lineTo(X(i), P.b); ctx.stroke(); }
  for (let j = -Math.ceil(yr); j <= Math.ceil(yr); j++) { ctx.strokeStyle = j ? C.grid : C.axis; ctx.beginPath(); ctx.moveTo(P.l, Y(j)); ctx.lineTo(P.r, Y(j)); ctx.stroke(); }
  ctx.restore();
  if (title) fitText(ctx, title, 8, 18, W - 16);
  const pl = { X, Y, unit, P, xr, yr, pt: ([x, y]) => [X(x), Y(y)] };
  pl.clip = () => { ctx.save(); ctx.beginPath(); ctx.rect(P.l, P.t, P.r - P.l, P.b - P.t); ctx.clip(); };
  pl.unclip = () => ctx.restore();
  pl.tags = tagPlacer(ctx, P);
  return pl;
}
// Smallest R that keeps the given points (plus a margin) in view.
const fitR = (pts, min) => Math.max(min, ...pts.map(([x, y]) => 1.15 * Math.max(Math.abs(x), Math.abs(y)) + 0.4));

function arrow(ctx, pl, from, to, color, lw = 3, alpha = 1) {
  const [x0, y0] = pl.pt(from), [x1, y1] = pl.pt(to), L = Math.hypot(x1 - x0, y1 - y0);
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round';
  if (L < 2) { ctx.beginPath(); ctx.arc(x0, y0, lw + 1, 0, 7); ctx.fill(); ctx.restore(); return; }
  const ux = (x1 - x0) / L, uy = (y1 - y0) / L, hl = Math.min(12, L * 0.45);
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - ux * hl * 0.8, y1 - uy * hl * 0.8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - ux * hl - uy * hl * 0.45, y1 - uy * hl + ux * hl * 0.45); ctx.lineTo(x1 - ux * hl + uy * hl * 0.45, y1 - uy * hl - ux * hl * 0.45); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function dot(ctx, pl, p, color, r = 5, hollow = false) {
  const [x, y] = pl.pt(p); ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 7);
  if (hollow) { ctx.strokeStyle = color; ctx.lineWidth = 2.2; ctx.stroke(); } else { ctx.fillStyle = color; ctx.fill(); }
  ctx.restore();
}
function polygon(ctx, pl, pts, fill, stroke, lw = 1.6, dash = null) {
  ctx.save(); ctx.beginPath(); pts.forEach((p, i) => { const [x, y] = pl.pt(p); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }); ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.stroke(); }
  ctx.restore();
}
// Image of the integer grid under a map T (sampled, so bent maps bend). N = half-width in grid lines.
function gridImage(ctx, pl, T, N, colA, colB, alpha = 0.55, samples = 2) {
  ctx.save(); ctx.lineWidth = 1.1; ctx.globalAlpha = alpha;
  const line = (f, col) => { ctx.strokeStyle = col; ctx.beginPath(); for (let k = 0; k <= samples; k++) { const s = -N + 2 * N * k / samples, [x, y] = pl.pt(T(f(s))); if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y); } ctx.stroke(); };
  for (let i = -N; i <= N; i++) { line(s => [s, i], colA); line(s => [i, s], colB); }
  ctx.restore();
}
const linMap = A => p => M.apply(A, p);
const gridN = (A, R) => { const s = M.stretches(A).min; return Math.min(40, Math.ceil(R / Math.max(0.15, s)) + 2); };

/* ---------- animation runner ---------- */
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

/* ---------- step 0: the two columns carry the grid ---------- */
const s0 = { morph: 1 };
const A0 = () => M.M(num('a0'), num('b0'), num('c0s'), num('d0'));
function draw0() {
  const A = A0(), Am = M.lerp(M.I, A, s0.morph);
  ['a0', 'b0', 'd0'].forEach(id => { $(id + 'v').textContent = fmt(num(id), 2); }); $('c0v').textContent = fmt(num('c0s'), 2);
  const { ctx, W, H } = fitCanvas($('c0')), pl = plane(ctx, W, H, 3.2, t('c0title'));
  pl.clip();
  // original F (ghost) and its image
  polygon(ctx, pl, M.F_SHAPE, null, C.ghost, 1.4, [4, 3]);
  gridImage(ctx, pl, linMap(Am), gridN(Am, Math.max(pl.xr, pl.yr)), 'rgba(255,180,84,0.9)', 'rgba(126,226,168,0.9)', 0.38);
  polygon(ctx, pl, M.F_SHAPE.map(p => M.apply(Am, p)), 'rgba(183,156,255,0.35)', C.violet, 1.8);
  arrow(ctx, pl, [0, 0], [1, 0], C.ghost, 2, 0.9); arrow(ctx, pl, [0, 0], [0, 1], C.ghost, 2, 0.9);
  const e1 = M.apply(Am, [1, 0]), e2 = M.apply(Am, [0, 1]), q = M.apply(Am, [2, 1]);
  dot(ctx, pl, [2, 1], C.ghost, 3.5, true); dot(ctx, pl, q, C.text, 4.5);
  arrow(ctx, pl, [0, 0], e1, C.orange, 3.4); arrow(ctx, pl, [0, 0], e2, C.green, 3.4);
  pl.unclip();
  pl.tags.put('Ae₁', ...pl.pt(e1), C.orange); pl.tags.put('Ae₂', ...pl.pt(e2), C.green);
  pl.tags.put('e₁', ...pl.pt([1, 0]), C.ghost, ['se', 's', 'sw', 'ne']); pl.tags.put('e₂', ...pl.pt([0, 1]), C.ghost, ['nw', 'w', 'ne', 'sw']);
  pl.tags.reserve(...pl.pt([2, 1]), 5); pl.tags.reserve(...pl.pt(q), 6);
  pl.tags.put('(2, 1)', ...pl.pt([2, 1]), C.ghost, ['se', 'e', 'ne', 's']); pl.tags.put(t('s0tagQ'), ...pl.pt(q), C.text, ['ne', 'e', 'nw', 'n']);
  const f = v => fmt(v, 2);
  let text = t('s0readout', { a: f(A.a), b: f(A.b), c: f(A.c), d: f(A.d), x: f(2 * A.a + A.b), y: f(2 * A.c + A.d) });
  if (s0.morph < 1) text = t('s0morph', { p: Math.round(s0.morph * 100) }) + ' ' + text;
  $('r0').textContent = text;
}

/* ---------- step 1: same coordinates, new basis ---------- */
function draw1() {
  const A = A0(), x = num('x1'), y = num('y1');
  $('x1v').textContent = fmt(x, 1); $('y1v').textContent = fmt(y, 1);
  const e1 = M.apply(A, [1, 0]), e2 = M.apply(A, [0, 1]), mid = [x * e1[0], x * e1[1]], Ap = M.apply(A, [x, y]);
  // one zoom for both panels so the two routes compare at the same scale
  const R = fitR([[x, 0], [x, y], mid, Ap, e1, e2], 3.5);
  const panel = (id, title, b1, b2, end, tag1, tag2, tagP, gridA) => {
    const { ctx, W, H } = fitCanvas($(id)), pl = plane(ctx, W, H, R, title);
    pl.clip();
    if (gridA) gridImage(ctx, pl, linMap(gridA), gridN(gridA, Math.max(pl.xr, pl.yr)), C.cyan, C.cyan, 0.22);
    arrow(ctx, pl, [0, 0], b1, C.orange, 2, 0.45); arrow(ctx, pl, [0, 0], b2, C.green, 2, 0.45);
    const m1 = [x * b1[0], x * b1[1]];
    arrow(ctx, pl, [0, 0], m1, C.orange, 3.2); arrow(ctx, pl, m1, end, C.green, 3.2);
    dot(ctx, pl, end, C.text, 5.5);
    pl.unclip();
    pl.tags.put(tagP, ...pl.pt(end), C.text, ['ne', 'nw', 'se', 'sw', 'e', 'w']);
    pl.tags.put(tag1, ...pl.pt(b1), C.orange, ['se', 'sw', 's', 'ne']); pl.tags.put(tag2, ...pl.pt(b2), C.green, ['nw', 'w', 'ne', 'sw']);
  };
  panel('c1', t('c1a'), [1, 0], [0, 1], [x, y], 'e₁', 'e₂', 'p', null);
  panel('c1b', t('c1b'), e1, e2, Ap, 'Ae₁', 'Ae₂', 'Ap', A);
  const f = v => fmt(v, 2);
  $('r1').textContent = t('s1readout', { x: f(x), y: f(y), a: f(A.a), b: f(A.b), c: f(A.c), d: f(A.d), px: f(Ap[0]), py: f(Ap[1]) });
}

/* ---------- step 2: what counts as linear ---------- */
const s2 = { map: 'linear' };
const MAP_KEYS = { linear: 'mapL', shifted: 'mapT', bent: 'mapN' };
function draw2() {
  const T = M.MAPS[s2.map], lam = num('lam2'), u = M.S2.u, v = M.S2.v;
  $('lam2v').textContent = fmt(lam, 2);
  Object.entries(MAP_KEYS).forEach(([k, id]) => $(id).setAttribute('aria-pressed', String(k === s2.map)));
  const Tu = T(u), Tv = T(v), Tuv = T([u[0] + v[0], u[1] + v[1]]), sum = [Tu[0] + Tv[0], Tu[1] + Tv[1]];
  const Tl = T([lam * u[0], lam * u[1]]), lT = [lam * Tu[0], lam * Tu[1]], O = T([0, 0]);
  const R = fitR([Tu, Tv, Tuv, sum, Tl, lT, O], 3);
  const { ctx, W, H } = fitCanvas($('c2')), pl = plane(ctx, W, H, R, t('c2title'));
  pl.clip();
  gridImage(ctx, pl, T, Math.ceil(R / 0.7) + 2, C.cyan, C.cyan, 0.3, 40);
  // origin and where it went
  ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 1.6; const [ox, oy] = pl.pt([0, 0]);
  ctx.beginPath(); ctx.moveTo(ox - 6, oy); ctx.lineTo(ox + 6, oy); ctx.moveTo(ox, oy - 6); ctx.lineTo(ox, oy + 6); ctx.stroke();
  ctx.strokeStyle = C.orange; const [tx, ty] = pl.pt(O); ctx.beginPath(); ctx.moveTo(tx - 6, ty - 6); ctx.lineTo(tx + 6, ty + 6); ctx.moveTo(tx - 6, ty + 6); ctx.lineTo(tx + 6, ty - 6); ctx.stroke(); ctx.restore();
  // T(u), T(v) as arrows from the origin; their parallelogram corner T(u)+T(v)
  arrow(ctx, pl, [0, 0], Tu, C.cyan, 2.6); arrow(ctx, pl, [0, 0], Tv, C.cyan, 2.6);
  ctx.save(); ctx.setLineDash([4, 4]); ctx.strokeStyle = C.cyan; ctx.globalAlpha = 0.6; ctx.lineWidth = 1.3;
  ctx.beginPath(); ctx.moveTo(...pl.pt(Tu)); ctx.lineTo(...pl.pt(sum)); ctx.lineTo(...pl.pt(Tv)); ctx.stroke(); ctx.restore();
  dot(ctx, pl, Tl, C.pink, 5); dot(ctx, pl, lT, C.pink, 8, true);
  dot(ctx, pl, Tuv, C.text, 5); dot(ctx, pl, sum, C.text, 9, true);
  pl.unclip();
  [[Tl, 5], [lT, 8], [Tuv, 5], [sum, 9]].forEach(([q, r]) => pl.tags.reserve(...pl.pt(q), r));
  pl.tags.put('T(u+v)', ...pl.pt(Tuv), C.text, ['ne', 'e', 'se', 'n']);
  pl.tags.put('T(u)+T(v)', ...pl.pt(sum), C.text, ['sw', 'w', 'nw', 's']);
  pl.tags.put('T(u)', ...pl.pt(Tu), C.cyan, ['se', 'e', 's', 'ne']); pl.tags.put('T(v)', ...pl.pt(Tv), C.cyan, ['nw', 'w', 'n', 'sw']);
  pl.tags.put('T(λu)', ...pl.pt(Tl), C.pink, ['ne', 'e', 'n', 'se']); pl.tags.put('λ·T(u)', ...pl.pt(lT), C.pink, ['sw', 's', 'w', 'nw']);
  const g = M.linearityGaps(T, u, v, lam);
  const vk = { linear: 'vLinear', shifted: 'vShift', bent: 'vBent' }[s2.map];
  $('r2').textContent = t('s2readout', { name: t(MAP_KEYS[s2.map]), ox: fmt(O[0]), oy: fmt(O[1]), g1: fmt(g.sum, 3), lam: fmt(lam), g2: fmt(g.scale, 3), verdict: t(vk) });
}

/* ---------- step 3: determinant as signed area ---------- */
const s3 = { seen: new Set([80]) };
function chart(ctx, W, H, o) {
  const P = { l: o.left || 40, r: W - 12, t: o.top || 30, b: H - 42 };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l), y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textBaseline = 'alphabetic';
  o.yTicks.forEach(v => { ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(fmt(v), P.l - 6, y(v) + 4); });
  o.xTicks.forEach(v => { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.t); ctx.lineTo(x(v), P.b + 4); ctx.stroke(); ctx.textAlign = 'center'; ctx.fillText(fmt(v) + (o.xUnit || ''), x(v), P.b + 16); });
  ctx.restore();
  if (o.title) fitText(ctx, o.title, 8, 18, W - 16);
  return { x, y, P };
}
function draw3() {
  const th = num('th3'), A = M.step3Matrix(th), D = M.det(A); s3.seen.add(th);
  $('th3v').textContent = th + '°';
  let { ctx, W, H } = fitCanvas($('c3'));
  const pl = plane(ctx, W, H, 3.3, t('c3a'));
  const neg = D < -1e-9, zero = Math.abs(D) < 1e-9, col = zero ? C.text : neg ? C.pink : C.cyan;
  pl.clip();
  polygon(ctx, pl, M.F_SHAPE, null, C.ghost, 1.2, [4, 3]);
  polygon(ctx, pl, M.UNIT_SQUARE, null, C.ghost, 1.2, [4, 3]);
  polygon(ctx, pl, M.UNIT_SQUARE.map(p => M.apply(A, p)), neg ? 'rgba(255,122,147,0.35)' : 'rgba(103,215,249,0.32)', col, 2);
  polygon(ctx, pl, M.F_SHAPE.map(p => M.apply(A, p)), 'rgba(183,156,255,0.3)', C.violet, 1.6);
  const e1 = M.apply(A, [1, 0]), e2 = M.apply(A, [0, 1]);
  arrow(ctx, pl, [0, 0], e1, C.orange, 3.2); arrow(ctx, pl, [0, 0], e2, C.green, 3.2);
  // the turn from Ae₁ to Ae₂: anticlockwise when det > 0, clockwise when det < 0
  if (!zero) {
    const a1 = Math.atan2(e1[1], e1[0]), a2 = Math.atan2(e2[1], e2[0]);
    let d = a2 - a1; while (d <= -Math.PI) d += 2 * Math.PI; while (d > Math.PI) d -= 2 * Math.PI;
    const r = 0.55 * pl.unit, [ox, oy] = pl.pt([0, 0]);
    ctx.save(); ctx.strokeStyle = C.text; ctx.fillStyle = C.text; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.arc(ox, oy, r, -a1, -(a1 + d), d > 0); ctx.stroke();
    const ae = a1 + d, hx = ox + r * Math.cos(ae), hy = oy - r * Math.sin(ae), tx = -Math.sin(ae) * Math.sign(d), ty = -Math.cos(ae) * Math.sign(d);
    ctx.beginPath(); ctx.moveTo(hx + tx * 7, hy + ty * 7); ctx.lineTo(hx - ty * 4, hy + tx * 4); ctx.lineTo(hx + ty * 4, hy - tx * 4); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  pl.unclip();
  pl.tags.put('Ae₁', ...pl.pt(e1), C.orange); pl.tags.put('Ae₂', ...pl.pt(e2), C.green);

  ({ ctx, W, H } = fitCanvas($('c3b')));
  const ch = chart(ctx, W, H, { xMin: 0, xMax: 360, yMin: -2, yMax: 2, xTicks: [0, 90, 180, 270, 360], yTicks: [-2, -1, 0, 1, 2], title: t('c3b'), xUnit: '°' });
  ctx.save(); ctx.strokeStyle = C.muted; ctx.globalAlpha = 0.35; ctx.lineWidth = 1.4; ctx.beginPath();
  for (let i = 0; i <= 360; i += 2) { const Y = ch.y(M.det(M.step3Matrix(i))); if (!i) ctx.moveTo(ch.x(i), Y); else ctx.lineTo(ch.x(i), Y); } ctx.stroke(); ctx.restore();
  [...s3.seen].sort((p, q) => p - q).forEach(v => { const d = M.det(M.step3Matrix(v)); ctx.fillStyle = d < -1e-9 ? C.pink : d > 1e-9 ? C.cyan : C.text; ctx.beginPath(); ctx.arc(ch.x(v), ch.y(d), 3, 0, 7); ctx.fill(); });
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(ch.x(th), ch.y(D), 6, 0, 7); ctx.fill();
  const sq = Math.abs(M.area(M.UNIT_SQUARE.map(p => M.apply(A, p)))), fa = M.area(M.F_SHAPE.map(p => M.apply(A, p)));
  $('r3').textContent = t('s3readout', { th, det: fmt(D, 3), abs: fmt(Math.abs(D), 3), sq: fmt(sq, 3), f: fmt(Math.abs(fa), 3), ratio: fmt(Math.abs(fa) / M.area(M.F_SHAPE), 3), orient: t(zero ? 'oZero' : neg ? 'oNeg' : 'oPos') });
}

/* ---------- step 4: inverse ---------- */
function ellipsePts(center, B, r, n = 72) { return Array.from({ length: n }, (_, i) => { const a = 2 * Math.PI * i / n, q = M.apply(B, [r * Math.cos(a), r * Math.sin(a)]); return [center[0] + q[0], center[1] + q[1]]; }); }
function draw4() {
  const s = num('s4'), A = M.step4Matrix(s), D = M.det(A), inv = M.inverse(A), p = M.S4.p, Ap = M.apply(A, p), r = M.S4.err;
  $('s4v').textContent = fmt(s, 1);
  let { ctx, W, H } = fitCanvas($('c4'));
  let pl = plane(ctx, W, H, 2.6, t('c4a'));
  pl.clip();
  if (inv) {
    polygon(ctx, pl, ellipsePts(p, inv, r), 'rgba(255,180,84,0.28)', C.orange, 1.8);
  } else {
    const n = M.nullDir(A);
    ctx.save(); ctx.strokeStyle = C.pink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(...pl.pt([p[0] - 20 * n[0], p[1] - 20 * n[1]])); ctx.lineTo(...pl.pt([p[0] + 20 * n[0], p[1] + 20 * n[1]])); ctx.stroke(); ctx.restore();
  }
  dot(ctx, pl, p, C.text, 5.5);
  pl.unclip();
  pl.tags.put('p', ...pl.pt(p), C.text, ['nw', 'ne', 'sw', 'se', 'w', 'e']);
  ({ ctx, W, H } = fitCanvas($('c4b')));
  pl = plane(ctx, W, H, 3.2, t('c4b'));
  pl.clip();
  gridImage(ctx, pl, linMap(A), gridN(A, 3.5), C.cyan, C.cyan, 0.3);
  polygon(ctx, pl, ellipsePts(Ap, M.I, r), 'rgba(255,180,84,0.28)', C.orange, 1.8);
  dot(ctx, pl, Ap, C.text, 5.5);
  pl.unclip();
  pl.tags.put('Ap', ...pl.pt(Ap), C.text, ['nw', 'ne', 'sw', 'se', 'w', 'e']);
  const f = v => fmt(v, 2);
  if (!inv) { const n = M.nullDir(A); $('r4').textContent = t('s4singular', { s: f(s), nx: f(n[0]), ny: f(n[1]) }); return; }
  const back = M.apply(inv, Ap), g = 1 / M.stretches(A).min;
  $('r4').textContent = t('s4readout', { s: f(s), det: fmt(D, 3), ia: f(inv.a), ib: f(inv.b), ic: f(inv.c), id: f(inv.d), ax: f(Ap[0]), ay: f(Ap[1]), bx: f(back[0]), by: f(back[1]), far: f(r * g), g: f(g) });
}

/* ---------- step 5: order of composition ---------- */
function draw5() {
  const th = num('th5'), k = num('k5'), R = M.rot(th), S = M.shearX(k), SR = M.mul(S, R), RS = M.mul(R, S);
  $('th5v').textContent = th + '°'; $('k5v').textContent = fmt(k, 2);
  const F1 = M.F_SHAPE.map(p => M.apply(SR, p)), F2 = M.F_SHAPE.map(p => M.apply(RS, p));
  const Rv = fitR([...F1, ...F2, ...M.F_SHAPE], 2.6);
  const { ctx, W, H } = fitCanvas($('c5')), pl = plane(ctx, W, H, Rv, t('c5title'));
  pl.clip();
  polygon(ctx, pl, M.F_SHAPE, 'rgba(111,128,151,0.18)', C.ghost, 1.4, [4, 3]);
  polygon(ctx, pl, F2, 'rgba(126,226,168,0.3)', C.green, 2);
  polygon(ctx, pl, F1, 'rgba(255,180,84,0.22)', C.orange, 2, [6, 4]);
  pl.unclip();
  const cen = pts => [pts.reduce((s, q) => s + q[0], 0) / pts.length, pts.reduce((s, q) => s + q[1], 0) / pts.length];
  const same = M.same(SR, RS);
  pl.tags.put(same ? 'S·R = R·S' : 'S·R', ...pl.pt(cen(F1)), C.orange, ['e', 'ne', 'se', 'w']);
  if (!same) pl.tags.put('R·S', ...pl.pt(cen(F2)), C.green, ['e', 'ne', 'se', 'w']);
  const f = v => fmt(v, 2);
  $('r5').textContent = t('s5readout', { a1: f(SR.a), b1: f(SR.b), c1: f(SR.c), d1: f(SR.d), a2: f(RS.a), b2: f(RS.b), c2: f(RS.c), d2: f(RS.d), same: t(same ? 'sSame' : 'sDiff'), d: fmt(M.det(SR), 3) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  ['a0', 'b0', 'c0s', 'd0'].forEach(id => $(id).addEventListener('input', () => { stopAnim('s0'); s0.morph = 1; draw0(); draw1(); }));
  document.querySelectorAll('[data-preset]').forEach(btn => btn.addEventListener('click', () => {
    const P = M.PRESETS[btn.dataset.preset];
    const r1 = v => Math.round(v * 100) / 100; // sliders move in steps of 0.01 (rotate 45° → 0.71)
    $('a0').value = r1(P.a); $('b0').value = r1(P.b); $('c0s').value = r1(P.c); $('d0').value = r1(P.d);
    stopAnim('s0'); s0.morph = 1; draw0(); draw1();
  }));
  $('morph0').addEventListener('click', () => { animate('s0', 2200, p => { s0.morph = p; draw0(); }, () => { s0.morph = 1; draw0(); }); });
  ['x1', 'y1'].forEach(id => $(id).addEventListener('input', draw1));
  Object.entries(MAP_KEYS).forEach(([k, id]) => $(id).addEventListener('click', () => { s2.map = k; draw2(); }));
  $('lam2').addEventListener('input', draw2);
  $('th3').addEventListener('input', () => { stopAnim('s3'); draw3(); });
  $('sweep3').addEventListener('click', () => {
    s3.seen.clear();
    animate('s3', 5000, p => { const v = Math.round(p * 360 / 5) * 5; for (let a = 0; a <= v; a += 5) s3.seen.add(a); $('th3').value = v; draw3(); });
  });
  $('s4').addEventListener('input', draw4);
  ['th5', 'k5'].forEach(id => $(id).addEventListener('input', draw5));

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
