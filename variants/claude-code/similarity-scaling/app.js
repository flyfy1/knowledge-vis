'use strict';
// Similarity & scaling (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every length, angle, area and count shown comes from window.SIM_MODEL (model.js), measured from coordinates.
// Canvas text goes through a label placer that keeps labels inside the canvas and apart from each other.
(function () {

const $ = id => document.getElementById(id);
const M = window.SIM_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', yellow: '#f2e27a', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', ghost: '#7d8ca0', edge: '#c9d5e3' };
const PAL = [C.cyan, C.orange, C.green, C.violet, C.pink, C.yellow, '#8fb8ff', '#ffa0d0', '#a8e6cf', '#ffd3a0', '#c0a8ff', '#9ee6f9'];
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fmt = (v, d = 1) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/\.?0+$/, ''); return s.replace('-', '−'); };
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

const tickLabel = (L, text, x, y, align = 'center') => L.put(text, [[x, y, align]], { size: 11, weight: 400, color: C.muted, bg: false, minSize: 9 });
const NAMES = ['A', 'B', 'C', 'D'];
const angList = a => a.map(v => fmt(v) + '°').join(t('sep'));
// Vertex label pushed away from the polygon's centre.
function vLabel(L, q, cen, text, color, size = 13) {
  const d = Math.atan2(-(q.y - cen.y), q.x - cen.x) / DEG;
  return L.put(text, fan(q, d, [13, 22], [0, 30, -30, 60, -60, 100, -100]), { size, weight: 700, color, bg: false });
}
const centre = pts => ({ x: pts.reduce((s, p) => s + p.x, 0) / pts.length, y: pts.reduce((s, p) => s + p.y, 0) / pts.length });

/* ---------- step 0: enlarge from O ---------- */
function draw0() {
  const k = num('k0'), ox = num('o0'), O = { x: ox, y: 0 }, img = M.dilatePoly(M.QUAD, O, k), r = M.ratios(img, M.QUAD);
  $('k0v').textContent = fmt(k, 2); $('o0v').textContent = fmt(ox, 1);
  const { ctx, W, H } = fitCanvas($('c0'), W => clamp(W * 0.5, 280, 380)), L = labeler(ctx, W, H);
  title(ctx, L, t('c0a'), W);
  const F = frame(W, H, { x0: -1.3, x1: 6.9, y0: -0.4, y1: 5.0 }), Oq = F.p(O);
  const P0 = M.QUAD.map(F.p), P1 = img.map(F.p);
  M.QUAD.forEach((P, i) => { const far = k >= 1 ? img[i] : P; path(ctx, [Oq, F.p(far)], { stroke: C.orange, w: 1.2, dash: [4, 4], alpha: 0.7 }); });
  path(ctx, P1, { fill: C.cyan, alpha: 0.16, close: true }); path(ctx, P1, { stroke: C.cyan, w: 2.2, close: true });
  path(ctx, P0, { stroke: C.ghost, w: 1.8, dash: [6, 4], close: true });
  [...P0, ...P1].forEach(q => { dot(ctx, q, 3, C.text); L.reserve(q.x - 4, q.y - 4, q.x + 4, q.y + 4); });
  dot(ctx, Oq, 4.5, C.orange); L.reserve(Oq.x - 5, Oq.y - 5, Oq.x + 5, Oq.y + 5);
  L.put('O', [[Oq.x, Oq.y + 18, 'center'], [Oq.x - 10, Oq.y + 4, 'right'], [Oq.x + 10, Oq.y + 4, 'left']], { size: 14, weight: 700, color: C.orange, bg: false });
  const c1 = centre(P1), c0 = centre(P0);
  P1.forEach((q, i) => vLabel(L, q, c1, NAMES[i] + '′', C.cyan));
  P0.forEach((q, i) => vLabel(L, q, c0, NAMES[i], C.muted, 12));
  $('r0').textContent = t('s0readout', { k: fmt(k, 2), r: fmt(r[0], 3), d: fmt(M.spread(r), 3), a0: angList(M.angles(M.QUAD)), a1: angList(M.angles(img)) });
}

/* ---------- step 1: stretch one way ---------- */
function draw1() {
  const kx = num('kx1'), ky = num('ky1'), S = M.stretch(M.QUAD, kx, ky), r = M.ratios(S, M.QUAD), a0 = M.angles(M.QUAD), a1 = M.angles(S);
  $('kx1v').textContent = fmt(kx, 1); $('ky1v').textContent = fmt(ky, 1);
  let { ctx, W, H } = fitCanvas($('c1'), twinH), L = labeler(ctx, W, H);
  title(ctx, L, t('c1a'), W);
  const F = frame(W, H, { x0: 0.7, x1: 4.1, y0: 0.25, y1: 3.45 });
  const P0 = M.QUAD.map(F.p), P1 = S.map(F.p), cen = centre(P1);
  path(ctx, P1, { fill: C.cyan, alpha: 0.16, close: true }); path(ctx, P1, { stroke: C.cyan, w: 2.2, close: true });
  path(ctx, P0, { stroke: C.ghost, w: 1.8, dash: [6, 4], close: true });
  [...P0, ...P1].forEach(q => { dot(ctx, q, 3, C.text); L.reserve(q.x - 4, q.y - 4, q.x + 4, q.y + 4); });
  P1.forEach((q, i) => {
    const d = Math.atan2(-(q.y - cen.y), q.x - cen.x) / DEG;
    L.put(`${NAMES[i]} ${fmt(a1[i])}°`, fan(q, d, [16, 28, 40], [0, 30, -30, 60, -60, 100, -100]), { size: 12, color: Math.abs(a1[i] - a0[i]) < 0.05 ? C.green : C.orange });
  });
  ({ ctx, W, H } = fitCanvas($('c1b'), twinH)); L = labeler(ctx, W, H);
  title(ctx, L, t('c1b'), W);
  const P = { l: 40, r: W - 14, t: 40, b: H - 32 }, Y = v => P.b - v / 2.8 * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1;
  [0, 0.5, 1, 1.5, 2, 2.5].forEach(v => { ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, Y(v)); ctx.lineTo(P.r, Y(v)); ctx.stroke(); });
  ctx.restore();
  [0, 0.5, 1, 1.5, 2, 2.5].forEach(v => tickLabel(L, fmt(v, 1), P.l - 6, Y(v) + 4, 'right'));
  const sim = M.spread(r) < 1e-9, bw = (P.r - P.l) / 4;
  r.forEach((v, i) => {
    const x = P.l + i * bw + bw * 0.2;
    ctx.save(); ctx.fillStyle = sim ? C.green : C.orange; ctx.globalAlpha = 0.8; ctx.fillRect(x, Y(v), bw * 0.6, Y(0) - Y(v)); ctx.restore();
    L.reserve(x, Y(v), x + bw * 0.6, Y(0));
    tickLabel(L, NAMES[i] + NAMES[(i + 1) % 4], x + bw * 0.3, P.b + 16);
    L.put(fmt(v, 2), [[x + bw * 0.3, Y(v) - 6, 'center'], [x + bw * 0.3, Y(v) + 16, 'center']], { size: 11, color: C.text, bg: false });
  });
  $('r1').textContent = sim ? t('s1yes', { r: fmt(r[0], 2), a1: angList(a1) })
    : t('s1no', { list: r.map(v => fmt(v, 2)).join(t('sep')), d: fmt(M.spread(r), 2), a0: angList(a0), a1: angList(a1) });
}

/* ---------- step 2: area ---------- */
const s2 = { seen: new Set([2]) };
function draw2() {
  const k = num('k2'), S = M.scale(M.ELL, k), p = M.perimeter(S), a = M.area(S);
  $('k2v').textContent = fmt(k, 1); s2.seen.add(k);
  let { ctx, W, H } = fitCanvas($('c2'), twinH), L = labeler(ctx, W, H);
  title(ctx, L, t('c2a'), W);
  const F = frame(W, H, { x0: -0.3, x1: 6.3, y0: -0.3, y1: 6.3 });
  ctx.save(); ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
  for (let i = 0; i <= 6; i++) { const a0 = F.p({ x: i, y: 0 }), a1 = F.p({ x: i, y: 6 }), b0 = F.p({ x: 0, y: i }), b1 = F.p({ x: 6, y: i }); ctx.beginPath(); ctx.moveTo(a0.x, a0.y); ctx.lineTo(a1.x, a1.y); ctx.moveTo(b0.x, b0.y); ctx.lineTo(b1.x, b1.y); ctx.stroke(); }
  ctx.restore();
  M.ELL_CELLS.forEach(([cx, cy], i) => {
    const q = [{ x: cx * k, y: cy * k }, { x: (cx + 1) * k, y: cy * k }, { x: (cx + 1) * k, y: (cy + 1) * k }, { x: cx * k, y: (cy + 1) * k }].map(F.p);
    path(ctx, q, { fill: [C.cyan, C.orange, C.green][i], alpha: 0.32, close: true });
  });
  path(ctx, S.map(F.p), { stroke: C.text, w: 2.2, close: true });
  path(ctx, M.ELL.map(F.p), { stroke: C.ghost, w: 1.5, dash: [5, 4], close: true });
  [0, 2, 4, 6].forEach(v => { const q = F.p({ x: v, y: 0 }); tickLabel(L, String(v), q.x, q.y + 14); });
  ({ ctx, W, H } = fitCanvas($('c2b'), twinH)); L = labeler(ctx, W, H);
  title(ctx, L, t('c2b'), W);
  const P = { l: 36, r: W - 14, t: 36, b: H - 30 }, X = v => P.l + v / 3.2 * (P.r - P.l), Y = v => P.b - v / 9.6 * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1;
  [0, 3, 6, 9].forEach(v => { ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, Y(v)); ctx.lineTo(P.r, Y(v)); ctx.stroke(); });
  ctx.restore();
  [0, 3, 6, 9].forEach(v => tickLabel(L, String(v), P.l - 6, Y(v) + 4, 'right'));
  [0, 1, 2, 3].forEach(v => tickLabel(L, String(v), X(v), P.b + 16));
  const c1 = [], c2 = []; for (let x = 0; x <= 3.1; x += 0.05) { c1.push({ x: X(x), y: Y(x) }); c2.push({ x: X(x), y: Y(x * x) }); }
  path(ctx, c1, { stroke: C.cyan, w: 1.4, dash: [5, 4], alpha: 0.8 }); path(ctx, c2, { stroke: C.orange, w: 1.4, dash: [5, 4], alpha: 0.8 });
  [...s2.seen].forEach(v => {
    const S2 = M.scale(M.ELL, v);
    dot(ctx, { x: X(v), y: Y(M.perimeter(S2) / 8) }, v === k ? 6 : 4, C.cyan);
    dot(ctx, { x: X(v), y: Y(M.area(S2) / 3) }, v === k ? 6 : 4, C.orange);
  });
  L.put('k', [[P.r - 4, P.b - 6, 'right']], { size: 12, color: C.muted, bg: false });
  const kk = k * k;
  $('r2').textContent = t('s2readout', { k: fmt(k, 1), p: fmt(p, 2), pr: fmt(p / 8, 2), a: fmt(a, 2), ar: fmt(a / 3, 2) }) + (Number.isInteger(k) && k > 1 ? ' ' + t('s2cells', { k, kk }) : '');
}

/* ---------- isometric cubes (steps 3 and 5) ---------- */
function isoCube(ctx, o, u, x, y, z, s, hue) {
  const P = (a, b, c) => ({ x: o.x + (a - b) * 0.866 * u, y: o.y + (a + b) * 0.5 * u - c * u });
  const top = [P(x, y, z + s), P(x + s, y, z + s), P(x + s, y + s, z + s), P(x, y + s, z + s)];
  const right = [P(x + s, y, z), P(x + s, y + s, z), P(x + s, y + s, z + s), P(x + s, y, z + s)];
  const left = [P(x, y + s, z), P(x + s, y + s, z), P(x + s, y + s, z + s), P(x, y + s, z + s)];
  [[left, 0.55], [right, 0.75], [top, 1]].forEach(([f, l]) => {
    ctx.save(); ctx.fillStyle = hue; ctx.globalAlpha = 1; ctx.beginPath(); f.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.closePath(); ctx.fill();
    ctx.fillStyle = `rgba(13,22,33,${(1 - l).toFixed(2)})`; ctx.fill(); ctx.strokeStyle = '#0d1621'; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
  });
}
function cubeList(n) { const out = []; for (let z = 0; z < n; z++) for (let x = 0; x < n; x++) for (let y = 0; y < n; y++) out.push([x, y, z]); return out.sort((a, b) => (a[0] + a[1] + a[2]) - (b[0] + b[1] + b[2]) || a[2] - b[2]); }

/* ---------- step 3: volume ---------- */
const s3 = { layers: Infinity };
function draw3() {
  const k = num('k3'), shown = Math.min(k, s3.layers);
  $('k3v').textContent = String(k);
  let { ctx, W, H } = fitCanvas($('c3'), twinH), L = labeler(ctx, W, H);
  title(ctx, L, t('c3a', { k }), W);
  const u = Math.min((W - 30) / (2 * 5 * 0.866), (H - 50) / (2 * 5));   // fixed for k = 5, so a bigger k really looks bigger
  // place the cube so its bottom corner sits at a fixed spot: bigger k grows up and outwards
  const base = { x: W / 2, y: H - 14 - (2 * k) * 0.5 * u };
  cubeList(k).filter(c => c[2] < shown).forEach(([x, y, z]) => isoCube(ctx, base, u, x, y, z, 1, z % 2 ? '#4fb6d6' : '#67d7f9'));
  ({ ctx, W, H } = fitCanvas($('c3b'), twinH)); L = labeler(ctx, W, H);
  title(ctx, L, t('c3b'), W);
  const rows = [[t('barLen'), k, C.cyan], [t('barArea'), k * k, C.green], [t('barVol'), k * k * k, C.orange]];
  const x0 = 12, x1 = W - 48, rh = (H - 60) / 3;
  rows.forEach(([name, v, col], i) => {
    const y = 44 + i * rh;
    L.put(name, [[x0, y + 6, 'left']], { size: 12, color: C.muted, bg: false });
    const wbar = Math.max(2, v / 125 * (x1 - x0));
    ctx.save(); ctx.fillStyle = col; ctx.globalAlpha = 0.85; ctx.fillRect(x0, y + 14, wbar, Math.min(26, rh - 30)); ctx.restore();
    L.reserve(x0, y + 14, x0 + wbar, y + 14 + Math.min(26, rh - 30));
    L.put('× ' + v, [[x0 + wbar + 6, y + 14 + Math.min(26, rh - 30) * 0.7, 'left']], { size: 13, weight: 700, color: col, bg: false });
  });
  const v = M.cubeCount(k), s = M.cubeSurface(k), prog = shown < k ? t('s3prog', { l: shown, k, c: shown * k * k }) : '';
  $('r3').textContent = prog + t('s3readout', { k, v, s, k2: k * k, r: fmt(s / v, 2) });
}

/* ---------- step 4: sighting ---------- */
function draw4() {
  const D = num('d4'), h = num('h4'), Hm = M.heightFromSighting(h, D), k = D / M.ARM;
  $('d4v').textContent = String(D); $('h4v').textContent = fmt(h, 1);
  const { ctx, W, H } = fitCanvas($('c4'), W => clamp(W * 0.42, 300, 360)), L = labeler(ctx, W, H);
  title(ctx, L, t('c4a'), W);
  const ground = H - 44, E = { x: 30, y: ground }, xb = W - 60, xr = E.x + (xb - E.x) * 0.2;
  const Hd = Math.max(3, Hm / 30 * (ground - 60)), hd = Hd * (xr - E.x) / (xb - E.x);
  const B0 = { x: xb, y: ground }, B1 = { x: xb, y: ground - Hd }, R0 = { x: xr, y: ground }, R1 = { x: xr, y: ground - hd };
  path(ctx, [{ x: 8, y: ground }, { x: W - 8, y: ground }], { stroke: C.ghost, w: 1.5 });
  path(ctx, [E, B0, B1], { fill: C.cyan, alpha: 0.12, close: true });
  path(ctx, [E, R0, R1], { fill: C.orange, alpha: 0.4, close: true });
  path(ctx, [E, B1], { stroke: C.text, w: 1.3, dash: [6, 4] });
  ctx.save(); ctx.fillStyle = '#2a3a50'; ctx.fillRect(xb, ground - Hd, 34, Hd); ctx.strokeStyle = C.cyan; ctx.lineWidth = 2; ctx.strokeRect(xb, ground - Hd, 34, Hd); ctx.restore();
  path(ctx, [R0, R1], { stroke: C.orange, w: 4 });
  dot(ctx, E, 5, C.text);
  [E, R0, R1, B0, B1].forEach(q => L.reserve(q.x - 4, q.y - 4, q.x + 4, q.y + 4));
  L.reserve(xb, ground - Hd, xb + 34, ground);
  L.put(t('eye'), [[E.x, ground + 18, 'center'], [E.x + 8, ground - 10, 'left']], { size: 12, color: C.text });
  L.put(t('ruler'), [[xr, ground + 18, 'center']], { size: 12, color: C.orange });
  L.put(t('building'), [[xb + 17, ground + 18, 'center']], { size: 12, color: C.cyan });
  L.put(`d = 0.6 m`, [[(E.x + xr) / 2, ground + 34, 'center'], [(E.x + xr) / 2, ground - 6, 'center']], { size: 11, color: C.muted });
  L.put(`D = ${D} m`, [[(E.x + xb) / 2 + 30, ground + 34, 'center'], [(E.x + xb) / 2 + 30, ground + 18, 'center']], { size: 11, color: C.muted });
  L.put(`h = ${fmt(h, 1)} cm`, [[xr + 8, ground - hd / 2 + 4, 'left'], [xr + 8, ground - hd - 8, 'left'], [xr - 8, ground - hd - 8, 'right']], { size: 12, color: C.orange });
  L.put(`H = ${fmt(Hm, 2)} m`, [[xb - 8, ground - Hd / 2 + 4, 'right'], [xb - 8, ground - Hd - 8, 'right'], [xb - 8, ground - 24, 'right']], { size: 12, color: C.cyan });
  $('r4').textContent = t('s4readout', { D, k: fmt(k, 1), h: fmt(h, 1), H: fmt(Hm, 2) });
}

/* ---------- step 5: crush the cube ---------- */
const s5 = { seen: new Set([2]) };
function draw5() {
  const m = num('m5'), c = M.cut(m);
  $('m5v').textContent = String(m); s5.seen.add(m);
  let { ctx, W, H } = fitCanvas($('c5'), twinH), L = labeler(ctx, W, H);
  title(ctx, L, t('c5a', { n: c.pieces }), W);
  const span = 1 + (m > 1 ? 0.45 : 0), u = Math.min((W - 30) / (2 * span * 0.866), (H - 50) / (2 * span));
  const base = { x: W / 2, y: H - 12 - span * u };
  const e = 1 / m, gap = m > 1 ? 0.45 / (m - 1) : 0;
  cubeList(m).forEach(([x, y, z]) => isoCube(ctx, base, u, x * (e + gap), y * (e + gap), z * (e + gap), e, '#9ee6f9'));
  ({ ctx, W, H } = fitCanvas($('c5b'), twinH)); L = labeler(ctx, W, H);
  title(ctx, L, t('c5b'), W);
  const P = { l: 48, r: W - 14, t: 36, b: H - 30 }, X = v => P.l + (v - 0.5) / 6 * (P.r - P.l), Y = v => P.b - v / 1400 * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1;
  [0, 400, 800, 1200].forEach(v => { ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, Y(v)); ctx.lineTo(P.r, Y(v)); ctx.stroke(); });
  ctx.restore();
  [0, 400, 800, 1200].forEach(v => tickLabel(L, String(v), P.l - 6, Y(v) + 4, 'right'));
  for (let v = 1; v <= 6; v++) tickLabel(L, String(v), X(v), P.b + 16);
  path(ctx, [{ x: X(1), y: Y(216) }, { x: X(6), y: Y(1296) }], { stroke: C.orange, w: 1.4, dash: [5, 4] });
  [...s5.seen].forEach(v => dot(ctx, { x: X(v), y: Y(M.cut(v).total) }, v === m ? 6 : 4, v === m ? C.text : C.cyan));
  L.put('m', [[P.r - 4, P.b - 6, 'right']], { size: 12, color: C.muted, bg: false });
  $('r5').textContent = t('s5readout', { n: c.pieces, e: fmt(c.edge, 2), s: fmt(c.eachSurface, 2), v: fmt(c.volume, 2), t: fmt(c.total, 2), m });
}

/* ---------- wiring ---------- */
function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  ['k0', 'o0'].forEach(id => $(id).addEventListener('input', draw0));
  ['kx1', 'ky1'].forEach(id => $(id).addEventListener('input', draw1));
  $('k2').addEventListener('input', draw2);
  $('k3').addEventListener('input', () => { stopAnim('s3'); s3.layers = Infinity; draw3(); });
  $('stack3').addEventListener('click', () => {
    const k = num('k3'); s3.layers = 0; draw3();
    animate('s3', k * 700 + 300, p => { s3.layers = p >= 1 ? Infinity : Math.floor(p * (k + 0.4)); draw3(); });
  });
  ['d4', 'h4'].forEach(id => $(id).addEventListener('input', draw4));
  $('m5').addEventListener('input', draw5);

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
