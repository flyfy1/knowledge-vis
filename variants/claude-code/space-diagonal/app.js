'use strict';
// Space diagonal lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// A dependency-free 3-D view (rotation + gentle perspective on a 2-D canvas). Every length comes from
// window.SD_MODEL (model.js); canvas labels go through a layout helper that keeps them apart and on-canvas.
(function () {

const $ = id => document.getElementById(id);
const M = window.SD_MODEL;
const t = (...a) => window.PAGE_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#5a6f88', text: '#e8edf4', bg: '#0d1621', edge: '#c9d5e3', ghost: '#8696aa' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Lengths: whole numbers exactly, otherwise two decimals; "=" or "≈" to match.
const isInt = v => Math.abs(v - Math.round(v)) < 1e-9;
const fmtL = v => (isInt(v) ? String(Math.round(v)) : v.toFixed(2));
const eqs = v => (isInt(v) ? '=' : '≈');

function fitCanvas(canvas, height) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
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

// Label layout: measure, keep inside the canvas, try candidate offsets, shrink, otherwise skip
// (every number shown on the canvas is also in the DOM readout).
function labeler(ctx, W, H) {
  const boxes = [];
  const hit = b => boxes.some(o => b.x0 < o.x1 + 3 && b.x1 > o.x0 - 3 && b.y0 < o.y1 + 2 && b.y1 > o.y0 - 2);
  const box = (text, X, Y, align) => {
    ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
    const m = ctx.measureText(text);
    return { x0: X - m.actualBoundingBoxLeft, x1: X + m.actualBoundingBoxRight, y0: Y - m.actualBoundingBoxAscent, y1: Y + m.actualBoundingBoxDescent };
  };
  return {
    reserve(x0, y0, x1, y1) { boxes.push({ x0: Math.min(x0, x1), y0: Math.min(y0, y1), x1: Math.max(x0, x1), y1: Math.max(y0, y1) }); },
    put(text, x, y, o = {}) {
      const cands = o.cands || [[0, 0]];
      const lim = o.clip || { x0: 0, x1: W, y0: 0, y1: H };
      for (let size = o.size || 12; size >= (o.min || 9); size -= 1) {
        ctx.font = `${o.weight || 500} ${size}px system-ui,-apple-system,"PingFang SC",sans-serif`;
        for (const [dx, dy, al] of cands) {
          const align = al || o.align || 'center';
          let X = x + dx; const Y = y + dy;
          let b = box(text, X, Y, align);
          if (b.x1 - b.x0 > lim.x1 - lim.x0 - 6) continue;
          if (b.x0 < lim.x0 + 3) { X += lim.x0 + 3 - b.x0; b = box(text, X, Y, align); }
          if (b.x1 > lim.x1 - 3) { X -= b.x1 - (lim.x1 - 3); b = box(text, X, Y, align); }
          if (b.y0 < lim.y0 + 2 || b.y1 > lim.y1 - 2 || hit(b)) continue;
          if (o.bg) { ctx.save(); ctx.fillStyle = o.bg; ctx.globalAlpha = 0.85; ctx.fillRect(b.x0 - 3, b.y0 - 2, b.x1 - b.x0 + 6, b.y1 - b.y0 + 4); ctx.restore(); }
          ctx.fillStyle = o.color || C.text; ctx.fillText(text, X, Y);
          boxes.push(b); return b;
        }
      }
      return null;
    }
  };
}
// Candidate offsets around a point, nearest first.
const AROUND = [[0, -10], [12, 4, 'left'], [-12, 4, 'right'], [0, 18], [14, -12, 'left'], [-14, -12, 'right'], [14, 18, 'left'], [-14, 18, 'right'], [0, -26], [0, 34]];

/* ---------- layout: 3-D view beside (wide) or above (narrow) a flat panel ---------- */
function layout(canvas, wideH, flat) {
  const w = Math.max(240, canvas.clientWidth || 600);
  if (!flat) { const h = w < 600 ? Math.round(Math.min(wideH, w * 1.05)) : wideH; return { H: h, left: { x0: 0, x1: w, y0: 0, y1: h }, right: null }; }
  if (w >= 600) return { H: wideH, left: { x0: 0, x1: w * 0.56, y0: 0, y1: wideH }, right: { x0: w * 0.56, x1: w, y0: 0, y1: wideH } };
  return { H: 300 + 230, left: { x0: 0, x1: w, y0: 0, y1: 300 }, right: { x0: 0, x1: w, y0: 300, y1: 530 } };
}

/* ---------- 3-D box ---------- */
const views = {};
const START = { c0: [-0.62, 0.42], c1: [-0.62, 1.0], c2: [-0.2, 0.5], c3: [-0.2, 0.5], c4: [-0.35, 0.5], c5: [-0.5, 0.45] };
const viewOf = id => (views[id] = views[id] || { yaw: START[id][0], pitch: START[id][1] });
const FACES = [
  { c: [0, 1, 3, 2], n: [0, 0, -1] }, { c: [4, 5, 7, 6], n: [0, 0, 1] },
  { c: [0, 1, 5, 4], n: [0, -1, 0] }, { c: [2, 3, 7, 6], n: [0, 1, 0] },
  { c: [0, 2, 6, 4], n: [-1, 0, 0] }, { c: [1, 3, 7, 5], n: [1, 0, 0] }
];
// opts: dims {a,b,c}, ref (diagonal used for the scale), segs [{i,j,col,w,dash}] or {p,q (3-D points)},
// polys [{pts:[corner ids], fill, stroke}], labels [{text, at:[x,y,z], col}]
function drawBox(ctx, L, R, id, o) {
  const { a, b, c } = o.dims, v = viewOf(id);
  const P0 = M.corners(a, b, c), mid = [a / 2, b / 2, c / 2];
  const titleH = 24, cx = (R.x0 + R.x1) / 2, cy = (R.y0 + titleH + R.y1) / 2;
  const span = Math.min(R.x1 - R.x0 - 24, R.y1 - R.y0 - titleH - 24);
  const persp = o.ref * 3.2, s = span * 0.86 / o.ref / (persp / (persp - o.ref / 2));
  const proj = p => { const q = M.project([p[0] - mid[0], p[1] - mid[1], p[2] - mid[2]], v.yaw, v.pitch, persp); return { x: cx + q.x * s, y: cy + q.y * s, depth: q.depth }; };
  const P = P0.map(proj);
  const facing = FACES.map(f => M.project(f.n, v.yaw, v.pitch, 0).depth > 1e-9);
  const poly = (pts, fill, stroke, alpha) => { ctx.save(); ctx.globalAlpha = alpha; ctx.beginPath(); pts.forEach((p, k) => (k ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.globalAlpha = 1; ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); } ctx.restore(); };
  // back faces, then hidden edges (dashed)
  FACES.forEach((f, k) => { if (!facing[k]) poly(f.c.map(i => P[i]), '#20344a', null, 0.35); });
  const edges = [];
  for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) if (M.bitsDiffer(i, j) === 1) {
    const vis = FACES.some((f, k) => facing[k] && f.c.includes(i) && f.c.includes(j));
    edges.push({ i, j, vis });
  }
  ctx.save(); ctx.strokeStyle = C.edge; ctx.globalAlpha = 0.35; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
  edges.filter(e => !e.vis).forEach(e => { ctx.beginPath(); ctx.moveTo(P[e.i].x, P[e.i].y); ctx.lineTo(P[e.j].x, P[e.j].y); ctx.stroke(); });
  ctx.restore();
  (o.polys || []).forEach(q => poly(q.pts.map(i => (Array.isArray(i) ? proj(i) : P[i])), q.fill, q.stroke, q.alpha || 0.3));
  (o.segs || []).forEach(sg => {
    const A = sg.p ? proj(sg.p) : P[sg.i], B = sg.q ? proj(sg.q) : P[sg.j];
    ctx.save(); ctx.strokeStyle = sg.col; ctx.lineWidth = sg.w || 3; ctx.lineCap = 'round'; if (sg.dash) ctx.setLineDash(sg.dash); if (sg.alpha) ctx.globalAlpha = sg.alpha;
    ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke(); ctx.restore();
  });
  // front faces: a faint tint so inner lines stay visible, then the visible edges
  FACES.forEach((f, k) => { if (facing[k]) poly(f.c.map(i => P[i]), '#67d7f9', null, 0.05); });
  ctx.save(); ctx.strokeStyle = C.edge; ctx.lineWidth = 1.6;
  edges.filter(e => e.vis).forEach(e => { ctx.beginPath(); ctx.moveTo(P[e.i].x, P[e.i].y); ctx.lineTo(P[e.j].x, P[e.j].y); ctx.stroke(); });
  ctx.restore();
  // right-angle marks: a small square in the plane of two perpendicular directions u, v at a 3-D point
  (o.marks || []).forEach(mk => {
    const k = mk.k || 0.9, at = mk.at, u = mk.u, w = mk.v;
    const q = [at, at.map((x, i) => x + u[i] * k), at.map((x, i) => x + (u[i] + w[i]) * k), at.map((x, i) => x + w[i] * k)].map(proj);
    ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(q[1].x, q[1].y); ctx.lineTo(q[2].x, q[2].y); ctx.lineTo(q[3].x, q[3].y); ctx.stroke(); ctx.restore();
  });
  (o.dots || []).forEach(d => { const p = Array.isArray(d.at) ? proj(d.at) : P[d.at]; ctx.fillStyle = d.col; ctx.beginPath(); ctx.arc(p.x, p.y, d.r || 4.5, 0, 7); ctx.fill(); });
  if (o.title) L.put(o.title, R.x0 + 10, R.y0 + 18, { align: 'left', size: 12, weight: 600, clip: R });
  // reserve the vertices so labels do not sit on corners
  P.forEach(p => L.reserve(p.x - 3, p.y - 3, p.x + 3, p.y + 3));
  (o.labels || []).forEach(lb => { const p = proj(lb.at); L.put(lb.text, p.x, p.y, { size: 12, weight: 700, color: lb.col, bg: C.bg, cands: AROUND, clip: R }); });
  return { proj, P };
}
// The visible edge (if any) of each direction that is nearest the viewer: used for a, b, c labels.
function edgeLabelPoints(a, b, c, id) {
  const v = viewOf(id), P = M.corners(a, b, c), mid = [a / 2, b / 2, c / 2];
  const pick = bit => {
    let best = null;
    for (let i = 0; i < 8; i++) { if (i & bit) continue; const j = i | bit, m = P[i].map((x, k) => (x + P[j][k]) / 2); const dpt = M.project([m[0] - mid[0], m[1] - mid[1], m[2] - mid[2]], v.yaw, v.pitch, 0).depth; if (!best || dpt > best.d) best = { m, d: dpt }; }
    return best.m;
  };
  return { a: pick(1), b: pick(2), c: pick(4) };
}

/* ---------- 2-D right triangle: legs p (horizontal) and q (vertical), right angle bottom-right ---------- */
function drawTri(ctx, L, R, o) {
  if (o.title) L.put(o.title, R.x0 + 10, R.y0 + 18, { align: 'left', size: 12, weight: 600, clip: R });
  const pad = 30, top = R.y0 + 36, bottom = R.y1 - 30, left = R.x0 + pad, right = R.x1 - 64;
  const s = Math.min((right - left) / o.maxP, (bottom - top) / o.maxQ);
  const ox = left + ((right - left) - o.p * s) / 2, oy = bottom - ((bottom - top) - o.q * s) / 2;
  const A = { x: ox, y: oy }, B = { x: ox + o.p * s, y: oy }, Cc = { x: ox + o.p * s, y: oy - o.q * s };
  if (o.fill) { ctx.save(); ctx.globalAlpha = 0.18; ctx.fillStyle = o.fill; ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.lineTo(Cc.x, Cc.y); ctx.closePath(); ctx.fill(); ctx.restore(); }
  const line = (P, Q, col) => { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(P.x, P.y); ctx.lineTo(Q.x, Q.y); ctx.stroke(); ctx.restore(); };
  line(A, B, o.cp); line(B, Cc, o.cq); line(A, Cc, o.ch);
  const k = Math.min(12, o.p * s / 3, o.q * s / 3);
  ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(B.x - k, B.y); ctx.lineTo(B.x - k, B.y - k); ctx.lineTo(B.x, B.y - k); ctx.stroke(); ctx.restore();
  L.reserve(A.x - 2, A.y - 3, B.x + 2, A.y + 3); L.reserve(B.x - 3, Cc.y - 2, B.x + 3, B.y + 2);
  L.put(o.lp, (A.x + B.x) / 2, A.y + 18, { size: 12, weight: 700, color: o.cp, clip: R, cands: [[0, 0], [0, 14]] });
  L.put(o.lq, B.x + 8, (B.y + Cc.y) / 2 + 4, { size: 12, weight: 700, color: o.cq, align: 'left', clip: R, cands: [[0, 0, 'left'], [0, -16, 'left'], [0, 16, 'left'], [-14, -8, 'right']] });
  // hypotenuse label: outside the triangle (up-left of the midpoint)
  const mx = (A.x + Cc.x) / 2, my = (A.y + Cc.y) / 2, len = Math.hypot(Cc.x - A.x, Cc.y - A.y) || 1;
  const nx = -(Cc.y - A.y) / len, ny = (Cc.x - A.x) / len; // normal pointing up-left
  L.put(o.lh, mx - nx * 12, my - ny * 12 + 4, { size: 12, weight: 700, color: o.ch, clip: R, align: 'right', cands: [[0, 0, 'right'], [-10, -10, 'right'], [0, -22, 'center'], [-20, 10, 'right']] });
}

/* ---------- animation of the spinning box in step 0 ---------- */
const spin = { on: !reduceMotion(), visible: false, id: 0, last: 0 };
function spinLoop(now) {
  spin.id = 0;
  if (!spin.on || !spin.visible || document.hidden || reduceMotion()) return;
  const dt = spin.last ? Math.min(60, now - spin.last) : 16; spin.last = now;
  viewOf('c0').yaw += dt * 0.00035; draw0();
  spin.id = requestAnimationFrame(spinLoop);
}
function kickSpin() { if (!spin.id && spin.on && spin.visible && !document.hidden && !reduceMotion()) { spin.last = 0; spin.id = requestAnimationFrame(spinLoop); } }
function stopSpin() { if (spin.id) cancelAnimationFrame(spin.id); spin.id = 0; }

/* ---------- step 0: the 28 segments ---------- */
const s0 = { kind: 'space' };
const KCOL = { edge: C.text, face: C.green, space: C.orange };
function draw0() {
  const D = M.DEFAULT, segs = M.segments(D.a, D.b, D.c), sum = M.summary(D.a, D.b, D.c);
  ['edge', 'face', 'space'].forEach(k => $('k' + k[0].toUpperCase() + k.slice(1)).setAttribute('aria-pressed', s0.kind === k));
  $('spin0').textContent = t(spin.on ? 'spinOn' : 'spinOff'); $('spin0').disabled = reduceMotion();
  const cv = $('c0'), lay = layout(cv, 400, true);
  const { ctx, W, H } = fitCanvas(cv, lay.H); const L = labeler(ctx, W, H);
  const lit = segs.filter(q => q.kind === s0.kind).map(q => ({ i: q.i, j: q.j, col: KCOL[q.kind], w: q.kind === 'edge' ? 2.6 : 3 }));
  const ep = edgeLabelPoints(D.a, D.b, D.c, 'c0');
  drawBox(ctx, L, lay.left, 'c0', {
    dims: D, ref: M.diagonal(D.a, D.b, D.c).d, title: t('c0title'), segs: lit,
    labels: s0.kind === 'edge' ? [{ text: 'a = ' + D.a, at: ep.a, col: C.text }, { text: 'b = ' + D.b, at: ep.b, col: C.text }, { text: 'c = ' + D.c, at: ep.c, col: C.text }] : []
  });
  // strip chart: every segment length as a dot, one row per kind
  const R = lay.right, x0 = R.x0 + 16, x1 = R.x1 - 16, top = R.y0 + 40, rowH = Math.min(80, (R.y1 - 40 - top) / 3);
  L.put(t('c0strip'), R.x0 + 10, R.y0 + 18, { align: 'left', size: 12, weight: 600, clip: R });
  const X = v => x0 + v / 14 * (x1 - x0);
  ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 1;
  const yAxis = top + rowH * 3 - 10;
  ctx.beginPath(); ctx.moveTo(x0, yAxis); ctx.lineTo(x1, yAxis); ctx.stroke();
  for (let v = 0; v <= 14; v += 2) { ctx.beginPath(); ctx.moveTo(X(v), yAxis); ctx.lineTo(X(v), yAxis + 4); ctx.stroke(); }
  ctx.restore();
  L.reserve(x0, yAxis - 1, x1, yAxis + 4);
  for (let v = 0; v <= 14; v += 2) L.put(String(v), X(v), yAxis + 17, { size: 11, color: C.muted, clip: R, min: 10 });
  ['edge', 'face', 'space'].forEach((k, r) => {
    const y = top + r * rowH + rowH * 0.45, on = s0.kind === k;
    ctx.save(); ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); ctx.restore();
    L.put(t(`c0row_${k}`), x0, y - 12, { align: 'left', size: 11, color: on ? KCOL[k] : C.muted, weight: on ? 700 : 500, clip: R });
    // one dot per distinct length (equal lengths coincide; the counts are in the readout)
    segs.filter(q => q.kind === k).forEach(q => { ctx.fillStyle = KCOL[k]; ctx.globalAlpha = on ? 1 : 0.45; ctx.beginPath(); ctx.arc(X(q.len), y, 4.5, 0, 7); ctx.fill(); ctx.globalAlpha = 1; L.reserve(X(q.len) - 5, y - 5, X(q.len) + 5, y + 5); });
    // the longest one in this row, written beside its dot
    L.put(fmtL(sum.longest[k]), X(sum.longest[k]), y + 4, { size: 11, weight: 700, color: on ? KCOL[k] : C.muted, clip: R, cands: [[9, 0, 'left'], [-9, 0, 'right'], [0, 17, 'center']] });
  });
  const lf = sum.longest;
  let extra;
  if (s0.kind === 'edge') extra = t('s0edge');
  else if (s0.kind === 'face') extra = t('s0face', { f1: fmtL(M.diagonal(D.a, D.b, 0).e), f2: fmtL(Math.hypot(D.a, D.c)), f3: fmtL(Math.hypot(D.b, D.c)) });
  else extra = t('s0space', { d: fmtL(lf.space) });
  $('r0').textContent = t('s0readout', { ne: sum.count.edge, le: fmtL(lf.edge), nf: sum.count.face, lf: fmtL(lf.face), ns: sum.count.space, ls: fmtL(lf.space) }) + ' ' + extra;
}

/* ---------- shared box for steps 1–4 ---------- */
const box = { a: M.DEFAULT.a, b: M.DEFAULT.b, c: M.DEFAULT.c };
function syncSliders() {
  document.querySelectorAll('input[data-dim]').forEach(inp => { inp.value = box[inp.dataset.dim]; });
  [['a1v', 'a'], ['b1v', 'b'], ['c2v', 'c'], ['a3v', 'a'], ['b3v', 'b'], ['c3v', 'c']].forEach(([id, k]) => { $(id).textContent = String(box[k]); });
}

const unit = v => { const n = Math.hypot(...v) || 1; return v.map(x => x / n); };
/* ---------- step 1: the floor ---------- */
function draw1() {
  const { a, b, c } = box, g = M.diagonal(a, b, c);
  const cv = $('c1'), lay = layout(cv, 380, true);
  const { ctx, W, H } = fitCanvas(cv, lay.H); const L = labeler(ctx, W, H);
  const ep = edgeLabelPoints(a, b, c, 'c1');
  drawBox(ctx, L, lay.left, 'c1', {
    dims: box, ref: Math.max(9, Math.hypot(a, b, 0.75 * c)), // pitch ≥ 0.8 here, so the box stays inside
    title: t('c1left'),
    polys: [{ pts: [0, 1, 3, 2], fill: C.cyan, stroke: C.cyan, alpha: 0.28 }],
    segs: [{ i: 0, j: 3, col: C.green, w: 3.5 }],
    marks: [{ at: [a, 0, 0], u: [-1, 0, 0], v: [0, 1, 0], k: Math.min(0.8, a / 3, b / 3) }],
    labels: [{ text: 'e ' + eqs(g.e) + ' ' + fmtL(g.e), at: [a / 2, b / 2, 0], col: C.green }, { text: 'a = ' + a, at: ep.a[2] === 0 ? ep.a : [a / 2, 0, 0], col: C.cyan }, { text: 'b = ' + b, at: ep.b[2] === 0 ? ep.b : [a, b / 2, 0], col: C.cyan }]
  });
  drawTri(ctx, L, lay.right, { title: t('c1right'), p: a, q: b, maxP: 12, maxQ: 12, cp: C.cyan, cq: C.cyan, ch: C.green, fill: C.cyan, lp: 'a = ' + a, lq: 'b = ' + b, lh: 'e ' + eqs(g.e) + ' ' + fmtL(g.e) });
  $('r1').textContent = t('s1readout', { a, b, a2: g.a2, b2: g.b2, e2: g.e2, eq: eqs(g.e), e: fmtL(g.e) });
}

/* ---------- step 2: the upright slice ---------- */
function draw2() {
  const { a, b, c } = box, g = M.diagonal(a, b, c);
  const cv = $('c2'), lay = layout(cv, 380, true);
  const { ctx, W, H } = fitCanvas(cv, lay.H); const L = labeler(ctx, W, H);
  drawBox(ctx, L, lay.left, 'c2', {
    dims: box, ref: Math.max(14, M.diagonal(box.a, box.b, box.c).d), title: t('c2left'),
    polys: [{ pts: [0, 3, 7, 4], fill: C.violet, stroke: null, alpha: 0.22 }],
    segs: [{ i: 0, j: 3, col: C.green, w: 3.5 }, { i: 3, j: 7, col: C.violet, w: 3.5 }, { i: 0, j: 7, col: C.orange, w: 3.5 }],
    marks: [{ at: [a, b, 0], u: unit([-a, -b, 0]), v: [0, 0, 1], k: Math.min(0.9, g.e / 3, c / 3) }],
    labels: [{ text: 'd ' + eqs(g.d) + ' ' + fmtL(g.d), at: [a / 2, b / 2, c / 2], col: C.orange }, { text: 'e ' + eqs(g.e) + ' ' + fmtL(g.e), at: [a / 2, b / 2, 0], col: C.green }, { text: 'c = ' + c, at: [a, b, c / 2], col: C.violet }]
  });
  drawTri(ctx, L, lay.right, { title: t('c2right'), p: g.e, q: c, maxP: Math.sqrt(288), maxQ: 12, cp: C.green, cq: C.violet, ch: C.orange, fill: C.violet, lp: 'e ' + eqs(g.e) + ' ' + fmtL(g.e), lq: 'c = ' + c, lh: 'd ' + eqs(g.d) + ' ' + fmtL(g.d) });
  $('r2').textContent = t('s2readout', { e2: g.e2, c, c2: g.c2, d2: g.d2, eq: eqs(g.d), d: fmtL(g.d) });
}

/* ---------- step 3: one formula, and who moves what ---------- */
const s3 = { move: null, ghostE: null, committedE: M.diagonal(box.a, box.b, 0).e, rows: [] };
function pushRow(move) {
  const g = M.diagonal(box.a, box.b, box.c), prev = s3.rows[0];
  const row = { move, a: box.a, b: box.b, c: box.c, e: g.e, d: g.d };
  row.changed = prev ? ['a', 'b', 'c', 'e', 'd'].filter(k => Math.abs(row[k] - prev[k]) > 1e-9) : [];
  if (prev && !row.changed.length) return;
  s3.rows.unshift(row); s3.rows = s3.rows.slice(0, 6);
}
function drawLedger() {
  $('ledger').querySelector('tbody').innerHTML = s3.rows.map(r => `<tr><td>${r.move ? r.move : t('rowStart')}</td>${['a', 'b', 'c', 'e', 'd'].map(k => `<td class="${r.changed.includes(k) ? 'chg' : ''}">${fmtL(r[k])}</td>`).join('')}</tr>`).join('');
}
function draw3() {
  const { a, b, c } = box, g = M.diagonal(a, b, c);
  const cv = $('c3'), lay = layout(cv, 380, true);
  const { ctx, W, H } = fitCanvas(cv, lay.H); const L = labeler(ctx, W, H);
  drawBox(ctx, L, lay.left, 'c3', {
    dims: box, ref: Math.max(14, M.diagonal(box.a, box.b, box.c).d), title: t('c3left'),
    segs: [{ i: 0, j: 3, col: C.green, w: 3 }, { i: 3, j: 7, col: C.violet, w: 3 }, { i: 0, j: 7, col: C.orange, w: 3.5 }],
    labels: [{ text: 'd ' + eqs(g.d) + ' ' + fmtL(g.d), at: [a / 2, b / 2, c / 2], col: C.orange }]
  });
  // chart: d against c for the current e
  const R = lay.right;
  L.put(t('c3right', { e: fmtL(g.e) }), R.x0 + 10, R.y0 + 18, { align: 'left', size: 12, weight: 600, clip: R });
  const x0 = R.x0 + 40, x1 = R.x1 - 18, y0 = R.y0 + 40, y1 = R.y1 - 42;
  const X = v => x0 + v / 12 * (x1 - x0), Y = v => y1 - v / 21 * (y1 - y0);
  ctx.save(); ctx.lineWidth = 1;
  for (let v = 0; v <= 20; v += 5) { ctx.strokeStyle = v ? C.grid : C.axis; ctx.beginPath(); ctx.moveTo(x0, Y(v)); ctx.lineTo(x1, Y(v)); ctx.stroke(); }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.stroke();
  for (let v = 0; v <= 12; v += 2) { ctx.beginPath(); ctx.moveTo(X(v), y1); ctx.lineTo(X(v), y1 + 4); ctx.stroke(); }
  ctx.restore();
  L.reserve(x0 - 2, y0, x0 + 2, y1 + 4); L.reserve(x0, y1 - 1, x1, y1 + 4);
  for (let v = 0; v <= 20; v += 5) L.put(String(v), x0 - 6, Y(v) + 4, { align: 'right', size: 11, color: C.muted, clip: R, min: 10 });
  for (let v = 0; v <= 12; v += 2) L.put(String(v), X(v), y1 + 17, { size: 11, color: C.muted, clip: R, min: 10 });
  L.put(t('c3x'), x1, y1 + 33, { align: 'right', size: 11, color: C.muted, clip: R });
  const curve = (e, col, dash, w) => { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; if (dash) ctx.setLineDash(dash); ctx.beginPath(); for (let i = 0; i <= 60; i++) { const cc = 12 * i / 60, yy = Y(Math.sqrt(e * e + cc * cc)); if (!i) ctx.moveTo(X(cc), yy); else ctx.lineTo(X(cc), yy); } ctx.stroke(); ctx.restore(); };
  // guides d = e (flat box) and d = c (thin box)
  ctx.save(); ctx.setLineDash([3, 4]); ctx.lineWidth = 1.2;
  ctx.strokeStyle = C.green; ctx.beginPath(); ctx.moveTo(X(0), Y(g.e)); ctx.lineTo(X(12), Y(g.e)); ctx.stroke();
  ctx.strokeStyle = C.violet; ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(12), Y(12)); ctx.stroke(); ctx.restore();
  if (s3.ghostE !== null && Math.abs(s3.ghostE - g.e) > 1e-9) curve(s3.ghostE, C.ghost, [5, 4], 1.5);
  curve(g.e, C.orange, null, 2.4);
  ctx.save(); ctx.strokeStyle = C.text; ctx.globalAlpha = 0.5; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(X(c), y1); ctx.lineTo(X(c), Y(g.d)); ctx.stroke(); ctx.restore();
  ctx.fillStyle = C.text; ctx.beginPath(); ctx.arc(X(c), Y(g.d), 5.5, 0, 7); ctx.fill();
  L.reserve(X(c) - 6, Y(g.d) - 6, X(c) + 6, Y(g.d) + 6);
  L.put('d ' + eqs(g.d) + ' ' + fmtL(g.d), X(c), Y(g.d), { size: 12, weight: 700, color: C.text, bg: C.bg, clip: R, cands: [[0, -12], [-10, 4, 'right'], [10, 16, 'left'], [0, 20]] });
  L.put(t('c3de'), X(0) + 4, Y(g.e) + 15, { align: 'left', size: 11, color: C.green, bg: C.bg, clip: R, cands: [[0, 0], [0, -20], [30, 0]] });
  L.put(t('c3dc'), X(Math.min(12, 19)) - 2, Y(12) + 16, { align: 'right', size: 11, color: C.violet, bg: C.bg, clip: R, cands: [[0, 0], [0, 16], [-40, 30]] });
  const move = s3.move === 'c' ? t('s3moveC') : s3.move ? t('s3moveAB', { k: s3.move }) : '';
  const cube = a === b && b === c ? t('s3cube', { k: fmtL(g.d) }) : '';
  $('r3').textContent = t('s3readout', { a, b, c, a2: g.a2, b2: g.b2, c2: g.c2, d2: g.d2, eq: eqs(g.d), d: fmtL(g.d), move: move ? move + ' ' : '', cube });
  drawLedger();
}

/* ---------- step 4: three routes ---------- */
const s4 = { route: 'base' };
const RCOL = { face: C.green, last: C.violet };
function draw4() {
  const { a, b, c } = box, r = M.route(s4.route, a, b, c), R0 = M.ROUTES[s4.route];
  ['Base', 'Front', 'Side'].forEach(k => $('rt' + k).setAttribute('aria-pressed', s4.route === k.toLowerCase()));
  const name = t(`n${s4.route[0].toUpperCase()}${s4.route.slice(1)}`);
  const cv = $('c4'), lay = layout(cv, 380, true);
  const { ctx, W, H } = fitCanvas(cv, lay.H); const L = labeler(ctx, W, H);
  const faceOf = { base: [0, 1, 3, 2], front: [0, 1, 5, 4], side: [0, 2, 6, 4] }[s4.route];
  const P = M.corners(a, b, c), mid = (i, j) => P[i].map((x, k) => (x + P[j][k]) / 2);
  drawBox(ctx, L, lay.left, 'c4', {
    dims: box, ref: Math.max(14, M.diagonal(box.a, box.b, box.c).d), title: t('c4left', { name }),
    polys: [{ pts: faceOf, fill: C.green, stroke: null, alpha: 0.18 }],
    segs: [{ i: R0.face[0], j: R0.face[1], col: RCOL.face, w: 3.5 }, { i: R0.edge[0], j: R0.edge[1], col: RCOL.last, w: 3.5 }, { i: 0, j: 7, col: C.orange, w: 3.5 }],
    marks: [{ at: P[R0.face[1]], u: unit(P[R0.face[1]].map(x => -x)), v: unit(P[7].map((x, i) => x - P[R0.face[1]][i])), k: Math.min(0.9, r.f / 3, r.r / 3) }],
    labels: [{ text: 'f ' + eqs(r.f) + ' ' + fmtL(r.f), at: mid(R0.face[0], R0.face[1]), col: C.green }, { text: r.last + ' = ' + r.r, at: mid(R0.edge[0], R0.edge[1]), col: C.violet }, { text: 'd ' + eqs(r.d) + ' ' + fmtL(r.d), at: mid(0, 7), col: C.orange }]
  });
  drawTri(ctx, L, lay.right, { title: t('c4right'), p: r.f, q: r.r, maxP: Math.sqrt(288), maxQ: 12, cp: C.green, cq: C.violet, ch: C.orange, fill: C.green, lp: 'f ' + eqs(r.f) + ' ' + fmtL(r.f), lq: r.last + ' = ' + r.r, lh: 'd ' + eqs(r.d) + ' ' + fmtL(r.d) });
  $('r4').textContent = t('s4readout', { name, p: r.p, q: r.q, f2: r.f2, eq1: eqs(r.f), f: fmtL(r.f), r: r.r, r2: r.r * r.r, d2: r.d2, eq2: eqs(r.d), d: fmtL(r.d) });
  const all = ['base', 'front', 'side'].map(k => fmtL(M.route(k, a, b, c).d));
  $('r4b').textContent = t('s4all', { d1: all[0], d2: all[1], d3: all[2] });
}

/* ---------- step 5: will the rod fit? ---------- */
const quiz = { fb: null, ok: false };
function draw5() {
  const K = M.CASE, Lr = num('L5'), f = M.fits(Lr, K.a, K.b, K.c);
  $('L5v').textContent = Lr + ' cm';
  const cv = $('c5'), lay = layout(cv, 420, false);
  const { ctx, W, H } = fitCanvas(cv, lay.H); const L = labeler(ctx, W, H);
  const P = M.corners(K.a, K.b, K.c), u = P[7].map(x => x / f.d); // unit vector along the diagonal
  const inside = Math.min(Lr, f.d), tip = u.map(x => x * Lr), end = u.map(x => x * inside);
  const ep = edgeLabelPoints(K.a, K.b, K.c, 'c5');
  const segs = [{ i: 0, j: 7, col: C.orange, w: 1.6, dash: [5, 4] }, { p: [0, 0, 0], q: end, col: C.green, w: 5 }];
  if (Lr > f.d) segs.push({ p: P[7], q: tip, col: C.pink, w: 5 });
  // the box is scaled to the longest rod so the part sticking out stays on the canvas
  drawBox(ctx, L, lay.left, 'c5', {
    dims: K, ref: K.L[1] * 1.05, title: t('c5title'), segs,
    dots: [{ at: 0, col: C.text }, { at: 7, col: C.text }],
    labels: [{ text: '50', at: ep.a, col: C.muted }, { text: '40', at: ep.b, col: C.muted }, { text: '30', at: ep.c, col: C.muted }, { text: 'L = ' + Lr, at: u.map(x => x * inside / 2), col: Lr > f.d ? C.pink : C.green }]
  });
  const s = Math.abs(f.spare);
  $('r5').textContent = t(f.fits ? 's5in' : 's5out', { L: Lr, d: f.d.toFixed(2), s: s.toFixed(2) });
  $('quizFeedback').textContent = quiz.fb ? t(quiz.fb) : '';
  $('quizFeedback').style.color = quiz.ok ? C.green : C.orange;
}

function refresh() { syncSliders(); draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

/* ---------- pointer rotation (mouse: yaw + pitch; touch: sideways only, so the page still scrolls) ---------- */
const DRAWERS = { c0: () => draw0(), c1: () => draw1(), c2: () => draw2(), c3: () => draw3(), c4: () => draw4(), c5: () => draw5() };
function bindOrbit(cv) {
  let drag = null;
  cv.addEventListener('pointerdown', e => {
    drag = { x: e.clientX, y: e.clientY, touch: e.pointerType === 'touch' };
    if (cv.id === 'c0' && spin.on) { spin.on = false; stopSpin(); }
    try { cv.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
  });
  cv.addEventListener('pointermove', e => {
    if (!drag) return;
    const v = viewOf(cv.id), dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    drag.x = e.clientX; drag.y = e.clientY;
    v.yaw += dx * 0.01;
    if (!drag.touch) v.pitch = Math.max(cv.id === 'c1' ? 0.8 : 0.05, Math.min(1.35, v.pitch + dy * 0.01));
    DRAWERS[cv.id]();
  });
  const end = () => { drag = null; };
  cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
}

function setup() {
  $('kEdge').addEventListener('click', () => { s0.kind = 'edge'; draw0(); });
  $('kFace').addEventListener('click', () => { s0.kind = 'face'; draw0(); });
  $('kSpace').addEventListener('click', () => { s0.kind = 'space'; draw0(); });
  $('spin0').addEventListener('click', () => { spin.on = !spin.on; if (spin.on) kickSpin(); else stopSpin(); draw0(); });

  document.querySelectorAll('input[data-dim]').forEach(inp => {
    inp.addEventListener('input', () => {
      const k = inp.dataset.dim, v = Number(inp.value);
      if (box[k] === v) return;
      if (k !== 'c') { s3.ghostE = s3.committedE; }
      box[k] = v; s3.move = k;
      syncSliders(); draw1(); draw2(); draw3(); draw4();
    });
    inp.addEventListener('change', () => {
      pushRow(inp.dataset.dim); s3.committedE = M.diagonal(box.a, box.b, 0).e; drawLedger();
    });
  });
  $('clear3').addEventListener('click', () => { s3.rows = []; s3.move = null; s3.ghostE = null; pushRow(null); draw3(); });
  pushRow(null);

  $('rtBase').addEventListener('click', () => { s4.route = 'base'; draw4(); });
  $('rtFront').addEventListener('click', () => { s4.route = 'front'; draw4(); });
  $('rtSide').addEventListener('click', () => { s4.route = 'side'; draw4(); });

  $('L5').addEventListener('input', draw5);
  $('quizOpts').innerHTML = M.QUIZ.options.map(v => `<label><input type="radio" name="quiz" value="${v}"><span>${v}</span></label>`).join('');
  $('checkQuiz').addEventListener('click', () => {
    const ch = document.querySelector('input[name="quiz"]:checked');
    if (!ch) { quiz.fb = 'noChoice'; quiz.ok = false; }
    else { quiz.ok = ch.value === M.QUIZ.answer; quiz.fb = quiz.ok ? 'quizRight' : 'quizWrong'; }
    if (quiz.ok) { document.querySelectorAll('input[name="quiz"]').forEach(i => { i.disabled = true; i.closest('label').classList.toggle('right', i.value === M.QUIZ.answer); }); $('checkQuiz').disabled = true; }
    draw5();
  });

  document.querySelectorAll('canvas.orbit').forEach(bindOrbit);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(es => es.forEach(e => { spin.visible = e.isIntersecting; if (spin.visible) kickSpin(); else stopSpin(); })).observe($('c0'));
  }
  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target)));
    }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopSpin(); else kickSpin(); });
  window.refreshPage = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
