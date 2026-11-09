'use strict';
// Polygon angle sums lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every angle drawn or printed comes from window.POLY_MODEL (model.js), measured from vertex coordinates.
// Canvas text goes through a label placer that keeps labels inside the canvas and apart from each other.
(function () {

const $ = id => document.getElementById(id);
const M = window.POLY_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', yellow: '#f2e27a', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', ghost: '#7d8ca0', edge: '#c9d5e3' };
const PAL = [C.cyan, C.orange, C.green, C.violet, C.pink, C.yellow, '#8fb8ff', '#ffa0d0', '#a8e6cf', '#ffd3a0', '#c0a8ff', '#9ee6f9'];
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fmt = (v, d = 1) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, ''); return s.replace('-', '−'); };
const DEG = Math.PI / 180;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ease = p => p * p * (3 - 2 * p);

/* ---------- canvas kit: fitCanvas, label placer, primitives, animation runner ---------- */
function fitCanvas(canvas, hFor) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  const height = Math.round(hFor ? hFor(width) : Number(canvas.getAttribute('height') || 300));
  if (canvas.style.height !== height + 'px') canvas.style.height = height + 'px';
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}
// Label placer: each label tries its candidate anchors (and smaller sizes) until it fits inside the canvas
// without touching an earlier label; a label that fits nowhere is skipped rather than drawn over another.
function labeler(ctx, W, H) {
  const boxes = [];
  const hit = b => boxes.some(o => b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0);
  return {
    reserve(x0, y0, x1, y1) { boxes.push({ x0, y0, x1, y1 }); },
    put(text, cands, o = {}) {
      const size0 = o.size || 12, minSize = o.minSize || Math.min(size0, 9);
      for (let s = size0; s >= minSize; s -= 0.5) {
        ctx.font = `${o.weight || 600} ${s}px system-ui,"PingFang SC",sans-serif`;
        const w = ctx.measureText(text).width, asc = s * 0.92, desc = s * 0.28;
        for (const [ax, ay, align] of cands) {
          let x0 = align === 'center' ? ax - w / 2 : align === 'right' ? ax - w : ax;
          x0 = clamp(x0, 3, W - 3 - w);
          const y = clamp(ay, asc + 3, H - 3 - desc);
          const b = { x0: x0 - 2, y0: y - asc - 1, x1: x0 + w + 2, y1: y + desc + 1 };
          if (b.x0 < 0 || b.x1 > W || hit(b)) continue;
          boxes.push(b);
          ctx.save();
          if (o.bg !== false) { ctx.fillStyle = 'rgba(13,22,33,0.8)'; ctx.fillRect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0); }
          ctx.fillStyle = o.color || C.text; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText(text, x0, y);
          ctx.restore();
          return b;
        }
      }
      return null;
    }
  };
}
// Panel title in its own row; shrinks until it fits.
function title(ctx, L, text, W) {
  let size = 13;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  do { ctx.font = `600 ${size}px system-ui,"PingFang SC",sans-serif`; if (ctx.measureText(text).width <= W - 16) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, 8, 17, W - 16); ctx.restore();   // maxWidth is a last resort for very narrow canvases
  L.reserve(0, 0, W, 23);
}
// Map a model box (y up) into the canvas below the title row, keeping the aspect ratio.
function frame(W, H, box, top = 28, pad = 12) {
  const s = Math.min((W - 2 * pad) / (box.x1 - box.x0), (H - top - pad) / (box.y1 - box.y0));
  const ox = (W - s * (box.x1 - box.x0)) / 2, oy = top + (H - top - pad - s * (box.y1 - box.y0)) / 2;
  return { s, p: P => ({ x: ox + (P.x - box.x0) * s, y: oy + (box.y1 - P.y) * s }) };
}
function path(ctx, pts, { stroke = null, fill = null, w = 2, dash = null, alpha = 1, close = false } = {}) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); pts.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); if (close) ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.stroke(); } ctx.restore();
}
function dot(ctx, q, r, color) { ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(q.x, q.y, r, 0, 7); ctx.fill(); ctx.restore(); }
// Wedge at screen point q, from math direction start (degrees, anticlockwise) through span degrees.
function wedge(ctx, q, r, start, span, color, alpha = 0.45, lw = 1.6) {
  if (Math.abs(span) < 1e-6 || r <= 0) return;
  const a0 = -start * DEG, a1 = -(start + span) * DEG, anti = span > 0;
  ctx.save(); ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineWidth = lw;
  ctx.globalAlpha = alpha; ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.arc(q.x, q.y, r, a0, a1, anti); ctx.closePath(); ctx.fill();
  ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(q.x, q.y, r, a0, a1, anti); ctx.stroke(); ctx.restore();
}
const along = (q, deg, d) => ({ x: q.x + Math.cos(deg * DEG) * d, y: q.y - Math.sin(deg * DEG) * d });
// Candidate anchors fanned around a direction (math degrees) at several distances from q.
function fan(q, deg, dists, rots = [0, 18, -18, 36, -36]) {
  const out = [];
  for (const d of dists) for (const r of rots) { const a = along(q, deg + r, d); out.push([a.x, a.y + 4, 'center']); }
  return out;
}
function arrowHead(ctx, q, deg, size, color) {
  const tip = along(q, deg, size * 0.6), l = along(q, deg + 140, size * 0.6), r = along(q, deg - 140, size * 0.6);
  ctx.save(); ctx.fillStyle = color; ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(tip.x, tip.y); ctx.lineTo(l.x, l.y); ctx.lineTo(r.x, r.y); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
}

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

const twinH = W => (window.innerWidth > 640 ? 340 : clamp(W * 0.85, 260, 340));
const wideH = W => clamp(W * 0.5, 290, 380);
function setToggle(id, on) { $(id).setAttribute('aria-pressed', on ? 'true' : 'false'); }
function setKey(id, key) { const el = $(id); el.dataset.i18n = key; el.textContent = t(key); }

/* ---------- step 0: measure, then tear the corners off ---------- */
const s0 = { p: 0, hist: [] };
const BOX0 = { x0: -1.5, x1: 7.5, y0: -2.75, y1: 5.85 };
const T_LINE = -1.95;
function record0() {
  const g = M.triAngles(M.triangle(num('cx0'), num('cy0'))), last = s0.hist[s0.hist.length - 1];
  if (last && Math.abs(last.a - g.a) < 1e-9 && Math.abs(last.b - g.b) < 1e-9) return;
  s0.hist.push(g); if (s0.hist.length > 8) s0.hist.shift();
}
function draw0() {
  const cx = num('cx0'), cy = num('cy0'), T = M.triangle(cx, cy), plan = M.tearPlan(T), g = plan.ang;
  $('cx0v').textContent = fmt(cx, 2); $('cy0v').textContent = fmt(cy, 2);
  const { ctx, W, H } = fitCanvas($('c0'), twinH), L = labeler(ctx, W, H);
  title(ctx, L, t('c0a'), W);
  const F = frame(W, H, BOX0), [A, B, Cc] = T.map(F.p);
  const minSide = Math.min(M.dist(T[0], T[1]), M.dist(T[1], T[2]), M.dist(T[2], T[0]));
  const r = Math.min(1.1, 0.38 * minSide) * F.s, p = ease(s0.p);
  const Tp = F.p({ x: M.BASE / 2, y: T_LINE });
  if (s0.p > 0) path(ctx, [F.p({ x: M.BASE / 2 - 2.2, y: T_LINE }), F.p({ x: M.BASE / 2 + 2.2, y: T_LINE })], { stroke: C.ghost, w: 1.5, dash: [5, 5] });
  path(ctx, [A, B, Cc], { fill: '#1b2a3b', stroke: C.edge, w: 2, close: true });
  const items = [['a', C.cyan, 'α'], ['b', C.orange, 'β'], ['c', C.green, 'γ']];
  // ghost outlines of the holes left behind once the corners move
  if (s0.p > 0) items.forEach(([k, col]) => { const wd = plan[k]; wedge(ctx, F.p(wd.V), r, wd.start, wd.span, col, 0.08, 1); });
  const placed = [];
  items.forEach(([k, col]) => {
    const wd = plan[k], V = F.p(wd.V), rot = M.wrap180(wd.targetStart - wd.start);
    const q = { x: V.x + (Tp.x - V.x) * p, y: V.y + (Tp.y - V.y) * p }, st = wd.start + rot * p;
    wedge(ctx, q, r, st, wd.span, col, 0.55, 2);
    placed.push({ q, mid: st + wd.span / 2, col });
  });
  [A, B, Cc].forEach(q => dot(ctx, q, 3.5, C.text));
  [A, B, Cc].forEach(q => L.reserve(q.x - 4, q.y - 4, q.x + 4, q.y + 4));
  const cen = { x: (A.x + B.x + Cc.x) / 3, y: (A.y + B.y + Cc.y) / 3 };
  ['A', 'B', 'C'].forEach((nm, i) => {
    const q = [A, B, Cc][i], d = Math.atan2(-(q.y - cen.y), q.x - cen.x) / DEG;
    L.put(nm, fan(q, d, [14, 22], [0, 30, -30, 60, -60, 90, -90]), { size: 14, weight: 700, bg: false });
  });
  if (s0.p === 0) {
    items.forEach(([k, col, sym], i) => L.put(`${sym} ${fmt(g[k], 1)}°`, fan(placed[i].q, placed[i].mid, [r + 12, r + 24, r + 38], [0, 15, -15, 30, -30, 50, -50]), { color: col, size: 12 }));
  } else if (s0.p === 1) {
    items.forEach(([, col, sym], i) => L.put(sym, fan(placed[i].q, placed[i].mid, [r * 0.62, r * 0.75], [0, 8, -8]), { color: col, size: 13, weight: 700, bg: false }));
    L.put('180°', [[Tp.x, Tp.y + 18, 'center'], [Tp.x + 40, Tp.y + 18, 'center']], { size: 12, color: C.text });
    L.put(t('straight'), [[Tp.x + r + 8, Tp.y - 4, 'left'], [Tp.x - r - 8, Tp.y - 4, 'right'], [Tp.x, Tp.y + 34, 'center']], { size: 11, color: C.muted });
  }
  draw0b();
  const sums = s0.hist.map(h => h.a + h.b + h.c);
  $('r0').textContent = t('s0readout', { a: fmt(g.a), b: fmt(g.b), c: fmt(g.c), s: fmt(g.a + g.b + g.c) }) + ' ' +
    t('s0hist', { k: s0.hist.length, lo: fmt(Math.min(...sums)), hi: fmt(Math.max(...sums)) }) + (s0.p === 1 ? ' ' + t('s0torn') : '');
}
function draw0b() {
  const { ctx, W, H } = fitCanvas($('c0b'), W => (window.innerWidth > 640 ? 340 : 250)), L = labeler(ctx, W, H);
  title(ctx, L, t('c0b'), W);
  const x0 = 14, x1 = W - 18, top = 36, bottom = H - 30, rows = 8, rh = Math.min(26, (bottom - top) / rows);
  const X = v => x0 + v / 180 * (x1 - x0);
  ctx.save(); ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
  [0, 90, 180].forEach(v => { ctx.beginPath(); ctx.moveTo(X(v), top - 4); ctx.lineTo(X(v), top + rows * rh); ctx.stroke(); });
  ctx.restore();
  path(ctx, [{ x: X(180), y: top - 6 }, { x: X(180), y: top + rows * rh + 2 }], { stroke: C.text, w: 1.5, dash: [4, 3] });
  s0.hist.forEach((h, i) => {
    const y = top + i * rh + 3, hh = rh - 6, last = i === s0.hist.length - 1;
    let acc = 0;
    [[h.a, C.cyan], [h.b, C.orange], [h.c, C.green]].forEach(([v, col]) => {
      ctx.save(); ctx.globalAlpha = last ? 0.95 : 0.5; ctx.fillStyle = col; ctx.fillRect(X(acc), y, X(acc + v) - X(acc), hh); ctx.restore();
      acc += v;
    });
    if (last) { ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 1.5; ctx.strokeRect(X(0), y, X(180) - X(0), hh); ctx.restore(); }
  });
  ['0°', '90°', '180°'].forEach((s, i) => L.put(s, [[X(i * 90), top + rows * rh + 18, i === 0 ? 'left' : i === 2 ? 'right' : 'center']], { size: 11, weight: 400, color: C.muted, bg: false }));
}

/* ---------- step 1: the parallel line through C ---------- */
const s1 = { k: 0 };
const BOX1 = { x0: -1.6, x1: 7.6, y0: -0.75, y1: 6.0 };
function draw1() {
  const cx = num('cx1'), cy = num('cy1'), T = M.triangle(cx, cy), g = M.triAngles(T), par = M.parallelAngles(T);
  $('cx1v').textContent = fmt(cx, 2); $('cy1v').textContent = fmt(cy, 2);
  const { ctx, W, H } = fitCanvas($('c1'), wideH), L = labeler(ctx, W, H);
  title(ctx, L, t('c1a'), W);
  const F = frame(W, H, BOX1), [A, B, Cc] = T.map(F.p);
  const minSide = Math.min(M.dist(T[0], T[1]), M.dist(T[1], T[2]), M.dist(T[2], T[0]));
  const r = Math.min(0.95, 0.34 * minSide) * F.s;
  path(ctx, [A, B, Cc], { fill: '#1b2a3b', stroke: C.edge, w: 2, close: true });
  const dCA = M.dirDeg(T[2], T[0]);
  wedge(ctx, A, r, 0, g.a, C.cyan, 0.45); wedge(ctx, B, r, 180 - g.b, g.b, C.orange, 0.45); wedge(ctx, Cc, r, dCA, g.c, C.green, 0.45);
  const lineL = F.p({ x: BOX1.x0 + 0.1, y: cy }), lineR = F.p({ x: BOX1.x1 - 0.1, y: cy });
  if (s1.k >= 2) path(ctx, [F.p({ x: cx - 2.2, y: cy }), Cc, A, F.p({ x: 2.2, y: 0 })], { stroke: C.cyan, w: 7, alpha: 0.28 });
  if (s1.k >= 3) path(ctx, [F.p({ x: cx + 2.2, y: cy }), Cc, B, F.p({ x: M.BASE - 2.2, y: 0 })], { stroke: C.orange, w: 7, alpha: 0.28 });
  if (s1.k >= 1) path(ctx, [lineL, lineR], { stroke: C.text, w: 1.8, dash: [7, 5] });
  if (s1.k >= 2) wedge(ctx, Cc, r, 180, par.left, C.cyan, 0.6, 2);
  if (s1.k >= 3) wedge(ctx, Cc, r, 360 - par.right, par.right, C.orange, 0.6, 2);
  [A, B, Cc].forEach(q => { dot(ctx, q, 3.5, C.text); L.reserve(q.x - 4, q.y - 4, q.x + 4, q.y + 4); });
  L.put('A', [[A.x - 8, A.y + 18, 'right'], [A.x - 10, A.y + 4, 'right'], [A.x, A.y + 20, 'center']], { size: 14, weight: 700, bg: false });
  L.put('B', [[B.x + 8, B.y + 18, 'left'], [B.x + 10, B.y + 4, 'left'], [B.x, B.y + 20, 'center']], { size: 14, weight: 700, bg: false });
  L.put('C', [[Cc.x, Cc.y - 12, 'center'], [Cc.x + 12, Cc.y - 10, 'left'], [Cc.x - 12, Cc.y - 10, 'right']], { size: 14, weight: 700 });
  if (s1.k >= 1) L.put('ℓ', [[lineR.x - 6, lineR.y - 8, 'right'], [lineL.x + 6, lineL.y - 8, 'left'], [lineR.x - 6, lineR.y + 18, 'right']], { size: 15, weight: 700 });
  L.put('α', fan(A, g.a / 2, [r + 12, r + 22]), { color: C.cyan, size: 14, weight: 700 });
  L.put('β', fan(B, 180 - g.b / 2, [r + 12, r + 22]), { color: C.orange, size: 14, weight: 700 });
  L.put('γ', fan(Cc, dCA + g.c / 2, [r + 12, r + 22]), { color: C.green, size: 14, weight: 700 });
  if (s1.k >= 2) L.put('α', fan(Cc, 180 + par.left / 2, [r + 12, r + 22, r + 32]), { color: C.cyan, size: 14, weight: 700 });
  if (s1.k >= 3) L.put('β', fan(Cc, 360 - par.right / 2, [r + 12, r + 22, r + 32]), { color: C.orange, size: 14, weight: 700 });
  const v = { a: fmt(g.a), b: fmt(g.b), c: fmt(g.c), l: fmt(par.left), r: fmt(par.right), s: fmt(par.left + par.mid + par.right) };
  $('r1').textContent = t('s1st' + s1.k, v);
  $('next1').disabled = s1.k >= 3;
}

/* ---------- step 2: cutting into triangles ---------- */
const s2 = { mode: 'v', seed: 1, k: Infinity, visited: new Set([6]) };
const BOX2 = { x0: -1.2, x1: 1.2, y0: -1.2, y1: 1.2 };
const K2 = () => (s2.mode === 'v' ? M.diagonalsFromOneVertex(num('n2')) : num('n2'));
function draw2() {
  const n = num('n2'), poly = M.shape(n, s2.seed), K = K2(), k = Math.min(s2.k, K);
  $('n2v').textContent = String(n);
  setToggle('mode2v', s2.mode === 'v'); setToggle('mode2c', s2.mode === 'c');
  const { ctx, W, H } = fitCanvas($('c2'), twinH), L = labeler(ctx, W, H);
  title(ctx, L, t('c2a', { n }), W);
  const F = frame(W, H, BOX2), P = poly.map(F.p), done = k >= K;
  path(ctx, P, { fill: '#18263a', close: true });
  const ints = M.interiorAngles(poly), cut = M.centreCut(poly), O = F.p(cut.O);
  if (s2.mode === 'v') {
    M.fanTriangles(n).forEach((tri, i) => {
      if (!(i < k || done)) return;
      path(ctx, tri.map(j => P[j]), { fill: PAL[i % PAL.length], alpha: 0.26, close: true });
    });
    for (let i = 0; i < k; i++) path(ctx, [P[0], P[i + 2]], { stroke: C.orange, w: 2 });
  } else {
    for (let i = 0; i < n; i++) if (done || i + 1 < k) path(ctx, [O, P[i], P[(i + 1) % n]], { fill: PAL[i % PAL.length], alpha: 0.26, close: true });
    for (let i = 0; i < k; i++) path(ctx, [O, P[i]], { stroke: C.orange, w: 2 });
    if (done) { ctx.save(); ctx.strokeStyle = C.pink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(O.x, O.y, 13, 0, 7); ctx.stroke(); ctx.restore(); dot(ctx, O, 3, C.pink); }
  }
  path(ctx, P, { stroke: C.edge, w: 2, close: true });
  P.forEach((q, i) => { const nx = poly[(i + 1) % n]; wedge(ctx, q, 11, M.dirDeg(poly[i], nx), ints[i], C.muted, 0.18, 1); });
  P.forEach(q => { dot(ctx, q, 3, C.text); L.reserve(q.x - 4, q.y - 4, q.x + 4, q.y + 4); });
  const c = F.p({ x: 0, y: 0 }), out0 = Math.atan2(-(P[0].y - c.y), P[0].x - c.x) / DEG;
  L.put('1', fan(P[0], out0, [14, 22]), { size: 13, weight: 700, color: C.orange });
  if (s2.mode === 'c' && done) L.put('360°', [[O.x, O.y - 18, 'center'], [O.x, O.y + 28, 'center'], [O.x + 34, O.y + 4, 'center']], { size: 11, color: C.pink });
  const nTri = s2.mode === 'v' ? n - 2 : n;
  for (let i = 0; i < nTri; i++) {
    const tri = s2.mode === 'v' ? M.fanTriangles(n)[i].map(j => P[j]) : [O, P[i], P[(i + 1) % n]];
    const show = s2.mode === 'v' ? (i < k || done) : (done || i + 1 < k);
    if (!show) continue;
    const m = { x: (tri[0].x + tri[1].x + tri[2].x) / 3, y: (tri[0].y + tri[1].y + tri[2].y) / 3 };
    L.put(String(i + 1), [[m.x, m.y + 4, 'center']], { size: 11, weight: 700, bg: false, minSize: 10 });
  }
  s2.visited.add(n);
  draw2b(n);
  const m = M.sum(ints), f = M.formulaSum(n);
  const prog = k < K ? t('s2prog', { k, K }) : '';
  $('r2').textContent = prog + (s2.mode === 'v'
    ? t('s2rV', { d: M.diagonalsFromOneVertex(n), t: n - 2, f: fmt(f), n, m: fmt(m) })
    : t('s2rC', { n, big: fmt(n * 180), o: fmt(cut.around), f: fmt(n * 180 - cut.around), m: fmt(m) }));
}
function draw2b(n) {
  const { ctx, W, H } = fitCanvas($('c2b'), twinH), L = labeler(ctx, W, H);
  title(ctx, L, t('c2b'), W);
  const P = { l: 46, r: W - 14, t: 34, b: H - 30 };
  const x = v => P.l + (v - 2.5) / 10 * (P.r - P.l), y = v => P.b - v / 1900 * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1;
  [0, 360, 720, 1080, 1440, 1800].forEach(v => { ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); });
  ctx.restore();
  [0, 360, 720, 1080, 1440, 1800].forEach(v => L.put(v + '°', [[P.l - 5, y(v) + 4, 'right']], { size: 10.5, weight: 400, color: C.muted, bg: false, minSize: 9 }));
  for (let v = 3; v <= 12; v++) L.put(String(v), [[x(v), P.b + 16, 'center']], { size: 10.5, weight: 400, color: C.muted, bg: false, minSize: 9 });
  path(ctx, [{ x: x(3), y: y(M.formulaSum(3)) }, { x: x(12), y: y(M.formulaSum(12)) }], { stroke: C.orange, w: 1.5, dash: [5, 4] });
  [...s2.visited].forEach(v => dot(ctx, { x: x(v), y: y(M.formulaSum(v)) }, v === n ? 6 : 4, v === n ? C.text : C.cyan));
}

/* ---------- walking round a closed path (steps 3 and 4) ---------- */
// pos runs from 0 to n: the integer part counts sides finished; within a side, the first 60 % is walking
// and the last 40 % is turning at the far corner.
function walkState(poly, turns, pos) {
  const n = poly.length, e = Math.min(n - 1, Math.floor(pos)), f = pos - e;
  const V = poly[e], N = poly[(e + 1) % n], h0 = M.dirDeg(V, N), vtx = (e + 1) % n;
  const segs = [];
  for (let j = 0; j < e; j++) segs.push({ v: (j + 1) % n, turn: turns[(j + 1) % n], frac: 1 });
  let at, heading;
  if (f < 0.6) { const u = f / 0.6; at = { x: V.x + (N.x - V.x) * u, y: V.y + (N.y - V.y) * u }; heading = h0; }
  else { const u = Math.min(1, (f - 0.6) / 0.4); at = N; heading = h0 + turns[vtx] * u; segs.push({ v: vtx, turn: turns[vtx], frac: u }); }
  const total = segs.reduce((s, g) => s + g.turn * g.frac, 0);
  return { at, heading, segs, total, edgesDone: e, onEdge: f < 0.6 ? e : -1, k: Math.floor(pos + 1e-9) };
}
function drawWalk(ctx, F, poly, turns, st, colorOf) {
  const n = poly.length, P = poly.map(F.p);
  for (let j = 0; j < st.edgesDone; j++) path(ctx, [P[j], P[(j + 1) % n]], { stroke: C.cyan, w: 4, alpha: 0.75 });
  if (st.onEdge >= 0) path(ctx, [P[st.onEdge], F.p(st.at)], { stroke: C.cyan, w: 4, alpha: 0.75 });
  else path(ctx, [P[st.edgesDone], P[(st.edgesDone + 1) % n]], { stroke: C.cyan, w: 4, alpha: 0.75 });
  st.segs.forEach(g => {
    const v = g.v, prev = poly[(v - 1 + n) % n], hin = M.dirDeg(prev, poly[v]), q = P[v];
    path(ctx, [q, along(q, hin, 0.42 * F.s)], { stroke: C.text, w: 1.4, dash: [4, 4], alpha: 0.8 });
    const span = g.turn * g.frac;
    wedge(ctx, q, 0.3 * F.s, hin, span, colorOf(g), 0.6, 2);
  });
  arrowHead(ctx, F.p(st.at), st.heading, 18, C.text);
}
// Turn dial: each turn is laid after the previous one, starting from the first heading. A second lap moves
// to an inner track; right turns (negative) are drawn on a thin inner band in pink, running backwards.
function drawDial(canvas, titleText, startHeading, st, colorOf) {
  const { ctx, W, H } = fitCanvas(canvas, twinH), L = labeler(ctx, W, H);
  title(ctx, L, titleText, W);
  const cx = W / 2, cy = 28 + (H - 28) / 2, R = Math.min(W / 2 - 16, (H - 28) / 2 - 14);
  ctx.save(); ctx.strokeStyle = C.grid; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(cx, cy, R - 7, 0, 7); ctx.stroke(); ctx.restore();
  const q = { x: cx, y: cy };
  let cum = 0;
  st.segs.forEach(g => {
    const span = g.turn * g.frac;
    if (span >= 0) {
      let a = cum; const b = cum + span;
      while (a < b - 1e-9) {
        const lap = Math.floor(a / 360 + 1e-9), end = Math.min(b, (lap + 1) * 360), rr = R - lap * 22;
        ctx.save(); ctx.strokeStyle = colorOf(g); ctx.lineWidth = 14; ctx.beginPath();
        ctx.arc(cx, cy, rr - 7, -(startHeading + a) * DEG, -(startHeading + end) * DEG, true); ctx.stroke(); ctx.restore();
        a = end;
      }
    } else {
      const lap = Math.max(0, Math.floor((cum + span) / 360)), rr = R - lap * 22 - 20;
      ctx.save(); ctx.strokeStyle = C.pink; ctx.lineWidth = 6; ctx.beginPath();
      ctx.arc(cx, cy, rr, -(startHeading + cum) * DEG, -(startHeading + cum + span) * DEG, false); ctx.stroke(); ctx.restore();
    }
    cum += span;
  });
  const z = along(q, startHeading, R + 2), z0 = along(q, startHeading, R - 18);
  path(ctx, [z0, z], { stroke: C.text, w: 2 });
  path(ctx, [q, along(q, startHeading + cum, R - 30)], { stroke: C.text, w: 2.5 });
  arrowHead(ctx, along(q, startHeading + cum, R - 30), startHeading + cum, 14, C.text);
  dot(ctx, q, 4, C.text);
  L.reserve(cx - 5, cy - 5, cx + 5, cy + 5);
  L.put(`Σ = ${fmt(cum)}°`, [[10, 44, 'left'], [W - 10, 44, 'right']], { size: 15, weight: 700 });
  return cum;
}

/* ---------- step 3: walk the edge ---------- */
const s3 = { seed: 2, pos: 0 };
function draw3() {
  const n = num('n3'), poly = M.shape(n, s3.seed), turns = M.turns(poly);
  $('n3v').textContent = String(n);
  const st = walkState(poly, turns, s3.pos), colorOf = g => PAL[g.v % PAL.length];
  const { ctx, W, H } = fitCanvas($('c3'), twinH), L = labeler(ctx, W, H);
  title(ctx, L, t('c3a'), W);
  const F = frame(W, H, { x0: -1.3, x1: 1.3, y0: -1.3, y1: 1.3 }), P = poly.map(F.p);
  path(ctx, P, { fill: '#18263a', stroke: C.ghost, w: 2, close: true });
  drawWalk(ctx, F, poly, turns, st, colorOf);
  P.forEach(q => { dot(ctx, q, 3, C.text); L.reserve(q.x - 4, q.y - 4, q.x + 4, q.y + 4); });
  const c = F.p({ x: 0, y: 0 }), out0 = Math.atan2(-(P[0].y - c.y), P[0].x - c.x) / DEG;
  L.put(t('start'), fan(P[0], out0, [16, 26], [0, 35, -35, 70, -70]), { size: 11, color: C.muted });
  st.segs.filter(g => g.frac === 1).forEach(g => {
    const prev = poly[(g.v - 1 + n) % n], hin = M.dirDeg(prev, poly[g.v]);
    L.put(fmt(g.turn) + '°', fan(P[g.v], hin + g.turn / 2, [0.3 * F.s + 12, 0.3 * F.s + 24]), { size: 11, color: colorOf(g) });
  });
  const sum = drawDial($('c3b'), t('c3b'), M.dirDeg(poly[0], poly[1]), st, colorOf);
  const ints = M.interiorAngles(poly);
  $('r3').textContent = st.k >= n
    ? t('s3done', { n, s: fmt(sum), f: fmt(n * 180 - sum), m: fmt(M.sum(ints)) })
    : t('s3readout', { k: st.k, n, s: fmt(sum) });
  $('one3').disabled = s3.pos >= n;
}
function walk3(to) {
  const from = s3.pos, n = num('n3'); to = Math.min(n, to);
  animate('s3', Math.max(1, to - from) * 1000, p => { s3.pos = from + (to - from) * p; draw3(); }, () => { s3.pos = to; draw3(); });
}

/* ---------- step 4: a dent and a star ---------- */
const s4 = { mode: 'dent', pos: 0 };
function poly4() { return s4.mode === 'star' ? M.star() : M.dented(num('p4')); }
function draw4() {
  const p = num('p4'), poly = poly4(), turns = M.turns(poly), n = 5;
  $('p4v').textContent = fmt(p, 2);
  setToggle('dent4', s4.mode === 'dent'); setToggle('star4', s4.mode === 'star'); $('p4').disabled = s4.mode === 'star';
  const st = walkState(poly, turns, s4.pos), colorOf = g => (g.turn < 0 ? C.pink : C.green);
  const { ctx, W, H } = fitCanvas($('c4'), twinH), L = labeler(ctx, W, H);
  title(ctx, L, t(s4.mode === 'star' ? 'c4star' : 'c4dent'), W);
  const F = frame(W, H, { x0: -1.3, x1: 1.3, y0: -1.3, y1: 1.3 }), P = poly.map(F.p);
  path(ctx, P, { fill: s4.mode === 'star' ? null : '#18263a', stroke: C.ghost, w: 2, close: true });
  const ints = turns.map(tu => 180 - tu);
  P.forEach((q, i) => {
    const big = ints[i] > 180 + 1e-9, col = big ? C.pink : C.violet;
    wedge(ctx, q, (s4.mode === 'star' ? 0.22 : 0.2) * F.s, M.dirDeg(poly[i], poly[(i + 1) % n]), ints[i], col, big ? 0.4 : 0.25, 1.5);
  });
  drawWalk(ctx, F, poly, turns, st, colorOf);
  P.forEach(q => { dot(ctx, q, 3, C.text); L.reserve(q.x - 4, q.y - 4, q.x + 4, q.y + 4); });
  P.forEach((q, i) => {
    const mid = M.dirDeg(poly[i], poly[(i + 1) % n]) + ints[i] / 2, rr = (s4.mode === 'star' ? 0.22 : 0.2) * F.s;
    L.put(fmt(ints[i]) + '°', fan(q, mid, [rr + 12, rr + 24, rr + 36], [0, 20, -20, 40, -40]), { size: 11, color: ints[i] > 180 + 1e-9 ? C.pink : C.violet });
  });
  if (s4.mode === 'dent') {
    const c = F.p({ x: 0, y: 0 }), up = p < 1 ? 90 : -90;
    L.put('1', fan(P[0], up, [14, 24], [0, 40, -40, 80, -80]), { size: 13, weight: 700, color: C.orange });
    void c;
  }
  const sum = drawDial($('c4b'), t('c4b'), M.dirDeg(poly[0], poly[1]), st, colorOf);
  const s = M.sum(ints), prog = st.k < n ? t('s4prog', { k: st.k }) : '';
  const fullTurn = M.sum(turns);
  let txt;
  if (s4.mode === 'star') txt = t('s4rStar', { e: fmt(turns[0]), t: fmt(fullTurn), s: fmt(M.sum(M.starTips(poly))) });
  else {
    const list = ints.map(v => fmt(v) + '°').join(t('sep'));
    txt = ints[0] > 180 + 1e-9 ? t('s4rDent', { list, s: fmt(s), r: fmt(ints[0]), x: fmt(-turns[0]), t: fmt(fullTurn) }) : t('s4rConvex', { list, s: fmt(s), t: fmt(fullTurn) });
  }
  $('r4').textContent = prog + txt;
  void sum;
}

/* ---------- step 5: regular tiles round one point ---------- */
const s5 = { k: Infinity };
function tile(O, d1, n, side) {
  const e = 360 / n, pts = [O]; let q = O;
  for (let i = 0; i < n - 1; i++) { q = { x: q.x + Math.cos((d1 + i * e) * DEG) * side, y: q.y + Math.sin((d1 + i * e) * DEG) * side }; pts.push(q); }
  return pts;
}
function draw5() {
  const n = num('n5'), info = M.aroundPoint(n), a = info.a;
  $('n5v').textContent = String(n);
  const { ctx, W, H } = fitCanvas($('c5'), wideH), L = labeler(ctx, W, H);
  title(ctx, L, t('c5a', { n }), W);
  const reach = 1 / Math.sin(Math.PI / n);                      // farthest corner from O, in side lengths (≤ 2R)
  const side = Math.min((W / 2 - 14) / reach, ((H - 30) / 2 - 10) / reach);
  const O = { x: 0, y: 0 }, cx = W / 2, cy = 30 + (H - 30) / 2;
  const toS = P => ({ x: cx + P.x * side, y: cy - P.y * side });
  const startDir = 270 + info.gap / 2, K = info.fit, k = Math.min(s5.k, K);
  for (let j = 0; j < k; j++) {
    const pts = tile(O, startDir + j * a, n, 1).map(toS);
    path(ctx, pts, { fill: PAL[j % 3], alpha: 0.22, close: true });
    path(ctx, pts, { stroke: PAL[j % 3], w: 2, close: true });
  }
  const q0 = toS(O);
  if (k >= K && !info.exact) {
    wedge(ctx, q0, side * 0.75, 270 - info.gap / 2, info.gap, C.pink, 0.45, 2);
    path(ctx, tile(O, startDir + K * a, n, 1).map(toS), { stroke: C.pink, w: 1.6, dash: [6, 5], close: true });
  }
  dot(ctx, q0, 4, C.text); L.reserve(q0.x - 5, q0.y - 5, q0.x + 5, q0.y + 5);
  for (let j = 0; j < k; j++) L.put(fmt(a) + '°', fan(q0, startDir + j * a + a / 2, [side * 0.42, side * 0.3, side * 0.55], [0, 10, -10]), { size: 11, color: PAL[j % 3] });
  if (k >= K && !info.exact) L.put(t('gapLbl', { g: fmt(info.gap) }), fan(q0, 270, [side * 0.75 + 14, side * 0.75 + 28, side * 0.4], [0, 15, -15, 30, -30]), { size: 12, color: C.pink });
  const prog = k < K ? t('s5prog', { k, K }) : '';
  $('r5').textContent = prog + t('s5readout', { n, a: fmt(a), q: fmt(info.q, 2), fit: info.fit }) + (info.exact ? t('s5fit') : t('s5gap', { g: fmt(info.gap), o: fmt(a - info.gap) }));
}

/* ---------- wiring ---------- */
function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  ['cx0', 'cy0'].forEach(id => {
    $(id).addEventListener('input', draw0);
    $(id).addEventListener('change', () => { record0(); draw0(); });
  });
  $('tear0').addEventListener('click', () => {
    const from = s0.p, to = s0.p < 0.5 ? 1 : 0;
    setKey('tear0', to === 1 ? 'untear' : 'tear');
    animate('s0', 1300, p => { s0.p = p >= 1 ? to : from + (to - from) * p; draw0(); });
  });
  record0();

  ['cx1', 'cy1'].forEach(id => $(id).addEventListener('input', draw1));
  $('next1').addEventListener('click', () => { s1.k = Math.min(3, s1.k + 1); draw1(); });
  $('restart1').addEventListener('click', () => { s1.k = 0; draw1(); });

  $('n2').addEventListener('input', () => { stopAnim('s2'); s2.k = Infinity; draw2(); });
  $('mode2v').addEventListener('click', () => { stopAnim('s2'); s2.mode = 'v'; s2.k = Infinity; draw2(); });
  $('mode2c').addEventListener('click', () => { stopAnim('s2'); s2.mode = 'c'; s2.k = Infinity; draw2(); });
  $('shape2').addEventListener('click', () => { s2.seed = s2.seed % 9 + 1; draw2(); });
  $('cut2').addEventListener('click', () => {
    const K = K2(); s2.k = 0; draw2();
    animate('s2', Math.max(1, K) * 600 + 300, p => { s2.k = p >= 1 ? Infinity : Math.floor(p * (K + 0.5)); draw2(); });
  });

  $('n3').addEventListener('input', () => { stopAnim('s3'); s3.pos = 0; draw3(); });
  $('one3').addEventListener('click', () => { if (anims.s3) return; walk3(Math.floor(s3.pos + 1e-9) + 1); });
  $('all3').addEventListener('click', () => { stopAnim('s3'); if (s3.pos >= num('n3')) s3.pos = 0; walk3(num('n3')); });
  $('reset3').addEventListener('click', () => { stopAnim('s3'); s3.pos = 0; draw3(); });
  $('shape3').addEventListener('click', () => { stopAnim('s3'); s3.seed = s3.seed % 9 + 1; s3.pos = 0; draw3(); });

  $('p4').addEventListener('input', draw4);
  $('dent4').addEventListener('click', () => { stopAnim('s4'); s4.mode = 'dent'; s4.pos = 0; draw4(); });
  $('star4').addEventListener('click', () => { stopAnim('s4'); s4.mode = 'star'; s4.pos = 0; draw4(); });
  $('walk4').addEventListener('click', () => {
    s4.pos = 0;
    animate('s4', 5 * 1000, p => { s4.pos = 5 * p; draw4(); }, () => { s4.pos = 5; draw4(); });
  });

  $('n5').addEventListener('input', () => { stopAnim('s5'); s5.k = Infinity; draw5(); });
  $('place5').addEventListener('click', () => {
    const K = M.aroundPoint(num('n5')).fit; s5.k = 0; draw5();
    animate('s5', K * 550 + 400, p => { s5.k = p >= 1 ? Infinity : Math.floor(p * (K + 0.6)); draw5(); });
  });
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked');
    const ok = !!choice && choice.value === 'b';
    $('quizFeedback').textContent = t(ok ? 'correct' : 'wrong');
    $('quizFeedback').style.color = ok ? C.green : C.orange;
    $('quizFeedback').dataset.state = ok ? 'correct' : 'wrong';
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
  window.refreshLesson = () => {
    const fb = $('quizFeedback'); if (fb.dataset.state) fb.textContent = t(fb.dataset.state);
    refresh();
  };
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
