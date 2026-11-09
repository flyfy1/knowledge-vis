'use strict';
// Three views lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every view, candidate and count comes from window.TV_MODEL (model.js). Canvas text is limited to view
// names in fixed rows above each view, the Front / Left arrows under the 3D pictures, card letters and bar labels.
(function () {

const $ = id => document.getElementById(id);
const M = window.TV_MODEL;
const t = (...a) => window.PAGE_I18N.t(...a);
const C = { bg: '#0d1621', line: '#2c3b50', muted: '#9aaabd', text: '#e8edf4', cyan: '#67d7f9', orange: '#ffb454', pink: '#ff7a93', hl: 'rgba(255,236,140,0.28)', guide: '#ffe58a', edge: '#0a1118' };
const FACE = { top: '#4fbf8a', front: '#3a9fc4', left: '#d48a33' };
const EXTRA = { top: '#ff9fb2', front: '#ff7a93', left: '#d9536f' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);

function fitCanvas(canvas, hFn) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) canvas.dataset.h = canvas.getAttribute('height') || 300;
  const height = Math.round(hFn ? hFn(width) : Number(canvas.dataset.h));
  canvas.style.height = height + 'px';
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}
// Single-line label that shrinks to fit maxW.
function label(ctx, text, X, Y, maxW, align = 'center', color = C.text, size = 13) {
  ctx.save(); ctx.fillStyle = color; ctx.textAlign = align;
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}

/* ---------- isometric drawing (camera above, front-left) ---------- */
// World: x right (0..3), y back (0..3, y = 0 is the front edge), z up. Visible faces: top (+z), front (−y), left (−x).
function isoProj(rect, margin = 0) {
  const c = 0.866, s = Math.min((rect.w - 2 * margin) / (6 * c), (rect.h - 2 * margin) / 6);
  const ox = rect.x + rect.w / 2, oy = rect.y + rect.h / 2 + 3 * s;
  return { s, P: (x, y, z) => [ox + (x - y) * c * s, oy - ((x + y) * 0.5 + z) * s] };
}
function poly(ctx, pr, pts, fill, stroke = C.edge, alpha = 1, dash = null) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.beginPath();
  pts.forEach((p, i) => { const [X, Y] = pr.P(...p); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); });
  ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.1; if (dash) ctx.setLineDash(dash); ctx.stroke(); }
  ctx.restore();
}
function box(ctx, pr, b, col = FACE, alpha = 1) {
  const { x0, y0, z0, x1, y1, z1 } = b;
  poly(ctx, pr, [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], col.top, C.edge, alpha);
  poly(ctx, pr, [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], col.front, C.edge, alpha);
  poly(ctx, pr, [[x0, y0, z0], [x0, y1, z0], [x0, y1, z1], [x0, y0, z1]], col.left, C.edge, alpha);
}
function floor(ctx, pr) {
  poly(ctx, pr, [[0, 0, 0], [3, 0, 0], [3, 3, 0], [0, 3, 0]], '#132131', C.line);
  ctx.save(); ctx.strokeStyle = C.line; ctx.lineWidth = 1;
  for (let i = 1; i < 3; i++) {
    let a = pr.P(i, 0, 0), b = pr.P(i, 3, 0); ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke();
    a = pr.P(0, i, 0); b = pr.P(3, i, 0); ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke();
  }
  // the front edge in cyan (matches the button grid)
  const a = pr.P(0, 0, 0), b = pr.P(3, 0, 0); ctx.strokeStyle = C.cyan; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke();
  ctx.restore();
}
function arrow(ctx, A, B, color) {
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(...A); ctx.lineTo(...B); ctx.stroke();
  const ang = Math.atan2(B[1] - A[1], B[0] - A[0]);
  ctx.beginPath(); ctx.moveTo(...B); ctx.lineTo(B[0] - 9 * Math.cos(ang - 0.45), B[1] - 9 * Math.sin(ang - 0.45)); ctx.lineTo(B[0] - 9 * Math.cos(ang + 0.45), B[1] - 9 * Math.sin(ang + 0.45)); ctx.closePath(); ctx.fill();
  ctx.restore();
}
// Front / Left arrows below the floor, labels at the arrow tails (they never meet: one is right of centre, one left).
function sideArrows(ctx, pr) {
  const f0 = pr.P(1.5, -1.05, 0), f1 = pr.P(1.5, -0.2, 0), l0 = pr.P(-1.05, 1.5, 0), l1 = pr.P(-0.2, 1.5, 0);
  arrow(ctx, f0, f1, C.cyan); arrow(ctx, l0, l1, C.orange);
  const fs = Math.max(10, Math.min(13, pr.s * 0.3));
  // keep both labels inside the canvas (they hang off the arrow tails)
  const W = ctx.canvas.clientWidth || 300;
  ctx.save(); ctx.font = `600 ${fs}px system-ui,sans-serif`;
  const wf = ctx.measureText(t('sideFront')).width, wl = ctx.measureText(t('sideLeft')).width; ctx.restore();
  label(ctx, t('sideFront'), Math.min(f0[0] + 4, W - 6 - wf), f0[1] + fs + 2, 80, 'left', C.cyan, fs);
  label(ctx, t('sideLeft'), Math.max(l0[0] - 4, 6 + wl), l0[1] + fs + 2, 80, 'right', C.orange, fs);
}
// Boxes for a height map, back-to-front painter order (larger x + y − z is further away).
function stackBoxes(h) {
  const out = [];
  for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) for (let z = 0; z < h[y][x]; z++) out.push({ x, y, z });
  return out;
}
const order = (a, b) => (b.x + b.y - b.z) - (a.x + a.y - a.z) || a.z - b.z;
function drawStack(ctx, pr, h, mine) {
  const list = stackBoxes(h).sort(order);
  for (const q of list) box(ctx, pr, { x0: q.x, y0: q.y, z0: q.z, x1: q.x + 1, y1: q.y + 1, z1: q.z + 1 }, mine && q.z >= mine[q.y][q.x] ? EXTRA : FACE);
  if (mine) {
    // cubes the reference pile has and this one lacks: dashed wireframes on top
    for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) for (let z = h[y][x]; z < mine[y][x]; z++) {
      const b = { x0: x, y0: y, z0: z, x1: x + 1, y1: y + 1, z1: z + 1 }, D = [4, 3];
      poly(ctx, pr, [[b.x0, b.y0, b.z1], [b.x1, b.y0, b.z1], [b.x1, b.y1, b.z1], [b.x0, b.y1, b.z1]], null, C.text, 0.9, D);
      poly(ctx, pr, [[b.x0, b.y0, b.z0], [b.x1, b.y0, b.z0], [b.x1, b.y0, b.z1], [b.x0, b.y0, b.z1]], null, C.text, 0.9, D);
      poly(ctx, pr, [[b.x0, b.y0, b.z0], [b.x0, b.y1, b.z0], [b.x0, b.y1, b.z1], [b.x0, b.y0, b.z1]], null, C.text, 0.9, D);
    }
  }
}

/* ---------- flat views ---------- */
// kind: 'front' (data = column heights), 'left' (column heights, back first), 'top' (rows, back first).
function drawView(ctx, X, Y, u, kind, data, hl) {
  ctx.save();
  ctx.strokeStyle = C.line; ctx.setLineDash([2, 3]); ctx.lineWidth = 1;
  for (let i = 0; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(X + i * u, Y); ctx.lineTo(X + i * u, Y + 3 * u); ctx.stroke(); ctx.beginPath(); ctx.moveTo(X, Y + i * u); ctx.lineTo(X + 3 * u, Y + i * u); ctx.stroke(); }
  ctx.setLineDash([]);
  const col = kind === 'front' ? FACE.front : kind === 'left' ? FACE.left : FACE.top;
  const cell = (cx, cy) => { ctx.fillStyle = col; ctx.fillRect(X + cx * u, Y + cy * u, u, u); ctx.strokeStyle = C.edge; ctx.lineWidth = 1.5; ctx.strokeRect(X + cx * u, Y + cy * u, u, u); };
  if (kind === 'top') data.forEach((row, r) => row.forEach((v, cx) => { if (v) cell(cx, r); }));
  else data.forEach((hgt, cx) => { for (let z = 0; z < hgt; z++) cell(cx, 2 - z); });
  if (hl) { ctx.fillStyle = C.hl; if (hl.col !== undefined) ctx.fillRect(X + hl.col * u, Y, u, 3 * u); if (hl.row !== undefined) ctx.fillRect(X, Y + hl.row * u, 3 * u, u); }
  ctx.strokeStyle = '#4a5f78'; ctx.lineWidth = 1.2; ctx.strokeRect(X, Y, 3 * u, 3 * u);
  ctx.restore();
}
// The standard layout: front top-left, left view to its right, top view below. Returns geometry.
function layoutViews(W, maxU) {
  const m = 14, g = 34, u = Math.max(16, Math.min(maxU, (W - 2 * m - g) / 6));
  const ox = (W - (6 * u + g)) / 2, oy = 26;
  return { u, g, ox, oy, xL: ox + 3 * u + g, yT: oy + 3 * u + g, H: oy + 6 * u + g + 14 };
}
function drawLayout(ctx, L, h, rule, idx) {
  const { u, ox, oy, xL, yT } = L, F = M.front(h), Lv = M.left(h), T = M.top(h);
  // 45° mitre line between the top and left views
  ctx.save(); ctx.strokeStyle = C.line; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(xL, yT); ctx.lineTo(xL + 3 * u, yT + 3 * u); ctx.stroke(); ctx.restore();
  let hlF = null, hlL = null, hlT = null;
  if (rule === 'len') { hlF = { col: idx }; hlT = { col: idx }; }
  else if (rule === 'ht') { hlF = { row: 2 - idx }; hlL = { row: 2 - idx }; }
  else if (rule === 'wd') { hlT = { row: 2 - idx }; hlL = { col: 2 - idx }; }
  drawView(ctx, ox, oy, u, 'front', F, hlF);
  drawView(ctx, xL, oy, u, 'left', Lv, hlL);
  drawView(ctx, ox, yT, u, 'top', T, hlT);
  // alignment lines on top of the views, then the chosen bands outlined
  ctx.save(); ctx.strokeStyle = C.guide; ctx.lineWidth = 1.6; ctx.setLineDash([6, 4]);
  const seg = (x0, y0, x1, y1) => { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); };
  if (rule === 'len') for (const e of [idx, idx + 1]) seg(ox + e * u, oy, ox + e * u, yT + 3 * u);
  else if (rule === 'ht') for (const e of [2 - idx, 3 - idx]) seg(ox, oy + e * u, xL + 3 * u, oy + e * u);
  else if (rule === 'wd') for (const e of [2 - idx, 3 - idx]) { const d = e * u; ctx.beginPath(); ctx.moveTo(ox, yT + d); ctx.lineTo(xL + d, yT + d); ctx.lineTo(xL + d, oy); ctx.stroke(); }
  ctx.setLineDash([]); ctx.lineWidth = 2.4;
  const band = (X, Y, hl) => { if (!hl) return; if (hl.col !== undefined) ctx.strokeRect(X + hl.col * u, Y, u, 3 * u); else ctx.strokeRect(X, Y + hl.row * u, 3 * u, u); };
  band(ox, oy, hlF); band(xL, oy, hlL); band(ox, yT, hlT);
  ctx.restore();
  const lw = 3 * u + 20;
  label(ctx, t('vFront'), ox + 1.5 * u, oy - 9, lw); label(ctx, t('vLeft'), xL + 1.5 * u, oy - 9, lw); label(ctx, t('vTop'), ox + 1.5 * u, yT - 9, lw);
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

/* ---------- shared pile ---------- */
const st = { h: M.parse(M.PRESETS.L) };
const PRESET_KEYS = [['L', 'pL'], ['stairs', 'pStairs'], ['middle', 'pMiddle'], ['valley', 'pValley'], ['towers', 'pTowers'], ['clear', 'pClear']];
function setPile(h) { st.h = h; s3.k = null; drawAll(); }

/* ---------- step 0 ---------- */
function buildEditor() {
  const g = $('grid0'); g.innerHTML = '';
  [2, 1, 0].forEach(y => {
    const nm = document.createElement('span'); nm.className = 'rowname'; nm.dataset.row = y; g.appendChild(nm);
    for (let x = 0; x < 3; x++) {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'cell'; b.dataset.x = x; b.dataset.y = y; b.dataset.step = '0';
      b.addEventListener('click', () => { const h = M.clone(st.h); h[y][x] = (h[y][x] + 1) % 4; setPile(h); });
      g.appendChild(b);
    }
  });
  const edge = document.createElement('span'); edge.style.gridColumn = '1'; g.appendChild(edge);
  const fe = document.createElement('span'); fe.className = 'front-edge'; fe.dataset.fe = '1'; g.appendChild(fe);
  document.querySelectorAll('[data-presets]').forEach(row => {
    PRESET_KEYS.forEach(([k, key]) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'btn'; b.dataset.preset = k; b.dataset.key = key;
      b.addEventListener('click', () => setPile(k === 'clear' ? M.empty() : M.parse(M.PRESETS[k])));
      row.appendChild(b);
    });
  });
}
const ROWKEY = ['rowF', 'rowM', 'rowB'];
function draw0() {
  const h = st.h;
  document.querySelectorAll('.cell').forEach(b => { const x = +b.dataset.x, y = +b.dataset.y, v = h[y][x]; b.textContent = v; b.dataset.v = v; b.setAttribute('aria-label', t('cellAria', { row: t(ROWKEY[y]), x: x + 1, v })); });
  document.querySelectorAll('.rowname').forEach(n => { n.textContent = t(ROWKEY[+n.dataset.row]); });
  document.querySelectorAll('[data-fe]').forEach(n => { n.textContent = t('sideFront'); });
  document.querySelectorAll('[data-preset]').forEach(b => { b.textContent = t(b.dataset.key); b.setAttribute('aria-pressed', String(b.dataset.preset !== 'clear' && M.toStr(h) === M.PRESETS[b.dataset.preset])); });
  const { ctx, W, H } = fitCanvas($('c0'));
  const pr = isoProj({ x: 0, y: 6, w: W, h: H - 30 }, 10);
  floor(ctx, pr); drawStack(ctx, pr, h); sideArrows(ctx, pr);
  const [b, m, f] = M.toStr(h).split('/');
  $('r0').textContent = t('s0readout', { n: M.count(h), rows: t('rowsFmt', { b, m, f }) });
}

/* ---------- step 1: squash along the line of sight ---------- */
const s1 = { dir: 'front' };
function draw1() {
  const h = st.h, p = num('p1'), dir = s1.dir;
  $('p1v').textContent = p.toFixed(2);
  ['F', 'L', 'T'].forEach(k => $('dir' + k).setAttribute('aria-pressed', String({ F: 'front', L: 'left', T: 'top' }[k] === dir)));
  let { ctx, W, H } = fitCanvas($('c1'));
  const pr = isoProj({ x: 0, y: 6, w: W, h: H - 30 }, 10);
  // the wall the cubes are pressed onto (first-angle: the far side)
  const wall = dir === 'front' ? [[0, 3, 0], [3, 3, 0], [3, 3, 3], [0, 3, 3]] : dir === 'left' ? [[3, 0, 0], [3, 3, 0], [3, 3, 3], [3, 0, 3]] : null;
  floor(ctx, pr);
  if (wall) poly(ctx, pr, wall, dir === 'front' ? 'rgba(58,159,196,0.13)' : 'rgba(212,138,51,0.13)', dir === 'front' ? FACE.front : FACE.left, 0.9, [4, 3]);
  const e = 0.06, lerp = (a, b) => a + (b - a) * p;
  const boxes = stackBoxes(h).map(q => {
    const b = { x0: q.x, y0: q.y, z0: q.z, x1: q.x + 1, y1: q.y + 1, z1: q.z + 1 };
    if (dir === 'front') { b.y0 = lerp(q.y, 3 - e); b.y1 = lerp(q.y + 1, 3); }
    else if (dir === 'left') { b.x0 = lerp(q.x, 3 - e); b.x1 = lerp(q.x + 1, 3); }
    else { b.z0 = lerp(q.z, 0); b.z1 = lerp(q.z + 1, e); }
    return b;
  });
  boxes.sort((a, b) => ((b.x0 + b.x1 + b.y0 + b.y1 - b.z0 - b.z1) - (a.x0 + a.x1 + a.y0 + a.y1 - a.z0 - a.z1)) || a.z0 - b.z0);
  boxes.forEach(b => box(ctx, pr, b));
  sideArrows(ctx, pr);
  ({ ctx, W, H } = fitCanvas($('c1b')));
  const u = Math.min(64, (W - 40) / 3, (H - 60) / 3), X = (W - 3 * u) / 2, Y = 34 + (H - 34 - 3 * u) / 2 - 8;
  const data = dir === 'front' ? M.front(h) : dir === 'left' ? M.left(h) : M.top(h);
  // the view fades in as the squash completes
  ctx.save(); ctx.globalAlpha = 0.25 + 0.75 * p; drawView(ctx, X, Y, u, dir, data); ctx.restore();
  label(ctx, t({ front: 'vFront', left: 'vLeft', top: 'vTop' }[dir]), W / 2, Y - 10, W - 20);
  const n = M.count(h);
  if (dir === 'top') $('r1').textContent = t('s1readT', { cells: data.flat().reduce((s, v) => s + v, 0), n });
  else $('r1').textContent = t(dir === 'front' ? 's1readF' : 's1readL', { v: data.join(t('viewJoin') === '、' ? '、' : ', '), cells: data.reduce((s, v) => s + v, 0), n });
}

/* ---------- step 2: the standard layout ---------- */
const s2 = { rule: 'len' };
function draw2() {
  const h = st.h, i = num('i2') - 1, rule = s2.rule, ex = M.extents(h);
  $('i2v').textContent = String(i + 1);
  $('i2name').textContent = t({ len: 'i2Len', ht: 'i2Ht', wd: 'i2Wd' }[rule]);
  ['Len', 'Ht', 'Wd'].forEach(k => $('r' + k).setAttribute('aria-pressed', String(k.toLowerCase() === rule)));
  const c = $('c2'); let L = null;
  const { ctx } = fitCanvas(c, w => (L = layoutViews(w, 64)).H);
  drawLayout(ctx, L, h, rule, i);
  const F = M.front(h), Lv = M.left(h), T = M.top(h);
  if (rule === 'len') $('r2').textContent = t('s2readLen', { i: i + 1, f: F[i], t: T.reduce((s, row) => s + row[i], 0), L: ex.length });
  else if (rule === 'ht') $('r2').textContent = t('s2readHt', { i: i + 1, f: F.filter(v => v > i).length, l: Lv.filter(v => v > i).length, H: ex.height });
  else {
    const row = t(ROWKEY[i]);
    $('r2').textContent = t('s2readWd', { row: window.PAGE_I18N.getLang() === 'en' ? row.toLowerCase() : row, i: i + 1, t: T[2 - i].reduce((s, v) => s + v, 0), l: Lv[2 - i], D: ex.width });
  }
}

/* ---------- step 3: how many piles share the views ---------- */
const s3 = { withTop: false, k: null, cache: {} };
function amb() { const key = M.toStr(st.h) + (s3.withTop ? 'T' : ''); return s3.cache[key] || (s3.cache[key] = M.ambiguity(st.h, s3.withTop)); }
function mineIndex(a) { return a.list.findIndex(q => M.sameArr(q, st.h)); }
function draw3() {
  const a = amb(); if (s3.k === null || s3.k >= a.n) s3.k = mineIndex(a);
  const cand = a.list[s3.k];
  $('top3').textContent = t(s3.withTop ? 'top3On' : 'top3Off'); $('top3').setAttribute('aria-pressed', String(s3.withTop));
  draw0Presets();
  let { ctx, W, H } = fitCanvas($('c3'));
  const pr = isoProj({ x: 0, y: 6, w: W, h: H - 30 }, 10);
  floor(ctx, pr); drawStack(ctx, pr, cand, st.h); sideArrows(ctx, pr);
  const views = s3.withTop ? ['front', 'left', 'top'] : ['front', 'left'];
  const cv = $('c3b'); let geo = null;
  ({ ctx, W, H } = fitCanvas(cv, w => { const u = Math.min(46, (w - 28 - (views.length - 1) * 20) / (3 * views.length)); geo = { u }; return window.innerWidth > 640 ? 320 : Math.max(150, 3 * u + 70); }));
  const u = geo.u, total = views.length * 3 * u + (views.length - 1) * 20, X0 = (W - total) / 2, Y = (H - 3 * u) / 2 + 10;
  views.forEach((v, j) => {
    const X = X0 + j * (3 * u + 20);
    drawView(ctx, X, Y, u, v, M[v](st.h));
    label(ctx, t({ front: 'vFront', left: 'vLeft', top: 'vTop' }[v]), X + 1.5 * u, Y - 10, 3 * u + 16);
  });
  $('r3').textContent = t('s3readout', { given: t(s3.withTop ? 'given3' : 'given2'), n: a.n, min: a.min, max: a.max, you: M.count(st.h), k: s3.k + 1, c: M.count(cand), mine: s3.k === mineIndex(a) ? t('mineNote') : '' });
}
function draw0Presets() { document.querySelectorAll('[data-preset]').forEach(b => { b.textContent = t(b.dataset.key); b.setAttribute('aria-pressed', String(b.dataset.preset !== 'clear' && M.toStr(st.h) === M.PRESETS[b.dataset.preset])); }); }

/* ---------- step 4: pick the solid ---------- */
const s4 = { q: 0, answered: null };
function draw4() {
  const Q = M.QUIZ[s4.q], ans = M.parse(Q.cards[Q.answer]);
  $('q4n').textContent = t('q4', { i: s4.q + 1, N: M.QUIZ.length });
  let L = null;
  let { ctx, W, H } = fitCanvas($('c4'), w => (L = layoutViews(w, 44)).H);
  drawLayout(ctx, L, ans, null, 0);
  const sel = document.querySelector('input[name="q4"]:checked');
  // three cards side by side; on narrow screens one per row so the cubes stay readable
  const narrow = w => w < 520;
  ({ ctx, W, H } = fitCanvas($('c4b'), w => (narrow(w) ? 3 * 176 : Math.min(250, (w / 3) * 1.05 + 34))));
  const stacked = narrow(W), cw = stacked ? W : W / 3, ch = stacked ? 176 : H;
  Q.cards.forEach((s, j) => {
    const X = stacked ? 0 : j * cw, Y = stacked ? j * ch : 0;
    const pr = stacked ? isoProj({ x: X + 30, y: Y + 6, w: cw - 60, h: ch - 12 }, 4) : isoProj({ x: X, y: Y + 26, w: cw, h: ch - 30 }, 8);
    if (sel && +sel.value === j) { ctx.save(); ctx.strokeStyle = C.cyan; ctx.lineWidth = 2; ctx.strokeRect(X + 3, Y + 3, cw - 6, ch - 6); ctx.restore(); }
    else if (stacked && j) { ctx.save(); ctx.strokeStyle = C.line; ctx.beginPath(); ctx.moveTo(10, Y); ctx.lineTo(W - 10, Y); ctx.stroke(); ctx.restore(); }
    floor(ctx, pr); drawStack(ctx, pr, M.parse(s));
    if (stacked) label(ctx, 'ABC'[j], X + 16, Y + 26, 30, 'left', C.text, 16);
    else label(ctx, 'ABC'[j], X + cw / 2, 19, 30, 'center', C.text, 15);
  });
  if (s4.answered !== null) feedback4();
}
function feedback4() {
  const Q = M.QUIZ[s4.q], fb = $('fb4');
  if (s4.answered === -1) { fb.textContent = t('s4pick'); fb.style.color = C.orange; return; }
  const j = s4.answered, letter = 'ABC'[j];
  const diff = M.diffViews(M.parse(Q.cards[j]), M.parse(Q.cards[Q.answer]));
  if (!diff.length) { fb.textContent = t('s4ok', { c: letter }); fb.style.color = '#7ee2a8'; fb.dataset.state = 'correct'; }
  else { fb.textContent = t('s4bad', { c: letter, views: diff.map(v => t({ front: 'vFront', left: 'vLeft', top: 'vTop' }[v])).join(t('viewJoin')) }); fb.style.color = C.orange; fb.dataset.state = 'wrong'; }
}

/* ---------- step 5: surface area ---------- */
function draw5() {
  const h = st.h, s = M.surface(h);
  let { ctx, W, H } = fitCanvas($('c5'));
  const pr = isoProj({ x: 0, y: 6, w: W, h: H - 30 }, 10);
  floor(ctx, pr); drawStack(ctx, pr, h); sideArrows(ctx, pr);
  ({ ctx, W, H } = fitCanvas($('c5b'), () => (window.innerWidth > 640 ? 300 : 232)));
  const l = 14, r = W - 16, maxV = Math.max(60, Math.ceil(s.S / 10) * 10), x = v => l + v / maxV * (r - l);
  const rows = [
    { name: t('bar1'), y: 52, segs: [[s.tb, FACE.top], [s.fb, FACE.front], [s.lr, FACE.left]] },
    { name: t('bar2'), y: 142, segs: [[s.tb, FACE.top], [s.fbView, FACE.front], [s.lrView, FACE.left]] }
  ];
  rows.forEach(row => {
    label(ctx, row.name, l, row.y - 12, r - l, 'left', C.text, 13);
    let acc = 0;
    row.segs.forEach(([v, col]) => { ctx.fillStyle = col; ctx.fillRect(x(acc), row.y, x(acc + v) - x(acc), 38); ctx.strokeStyle = C.edge; ctx.lineWidth = 1.5; ctx.strokeRect(x(acc), row.y, x(acc + v) - x(acc), 38); acc += v; });
  });
  // the hidden faces: hatch the part of the S bar beyond the bound
  if (s.hidden > 0) {
    ctx.save(); ctx.strokeStyle = C.pink; ctx.lineWidth = 2; ctx.strokeRect(x(s.bound), 142, x(s.S) - x(s.bound), 38);
    ctx.beginPath(); ctx.rect(x(s.bound), 142, x(s.S) - x(s.bound), 38); ctx.clip();
    for (let X = x(s.bound) - 40; X < x(s.S) + 40; X += 7) { ctx.beginPath(); ctx.moveTo(X, 180); ctx.lineTo(X + 38, 142); ctx.stroke(); }
    ctx.restore();
  }
  // axis
  ctx.save(); ctx.strokeStyle = '#4a5f78'; ctx.fillStyle = C.muted; ctx.font = '11px system-ui,sans-serif'; ctx.textAlign = 'center';
  ctx.beginPath(); ctx.moveTo(l, 196); ctx.lineTo(r, 196); ctx.stroke();
  const step = (r - l) / maxV * 10 >= 30 ? 10 : 20;
  for (let v = 0; v <= maxV; v += step) { ctx.beginPath(); ctx.moveTo(x(v), 196); ctx.lineTo(x(v), 201); ctx.stroke(); ctx.fillText(String(v), x(v), 214); }
  ctx.restore();
  const sum = s.F + s.L + s.T;
  $('r5').textContent = t('s5readout', { n: s.n, j: s.j, S: s.S, tb: s.tb, fb: s.fb, lr: s.lr, F: s.F, L: s.L, T: s.T, sum, bound: s.bound, note: s.hidden > 0 ? t('s5gap', { h: s.hidden }) : t('s5eq') });
}

function drawAll() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  buildEditor();
  [['dirF', 'front'], ['dirL', 'left'], ['dirT', 'top']].forEach(([id, d]) => $(id).addEventListener('click', () => { stopAnim('s1'); s1.dir = d; $('p1').value = 0; draw1(); }));
  $('p1').addEventListener('input', () => { stopAnim('s1'); draw1(); });
  $('play1').addEventListener('click', () => { animate('s1', 2200, p => { $('p1').value = (Math.round(p * 20) / 20).toFixed(2); if (p >= 1) $('p1').value = 1; draw1(); }); });
  [['rLen', 'len'], ['rHt', 'ht'], ['rWd', 'wd']].forEach(([id, r]) => $(id).addEventListener('click', () => { s2.rule = r; draw2(); }));
  $('i2').addEventListener('input', draw2);
  $('top3').addEventListener('click', () => { s3.withTop = !s3.withTop; s3.k = null; draw3(); });
  $('min3').addEventListener('click', () => { s3.k = 0; draw3(); });
  $('max3').addEventListener('click', () => { s3.k = amb().n - 1; draw3(); });
  $('next3').addEventListener('click', () => { s3.k = (s3.k + 1) % amb().n; draw3(); });
  $('mine3').addEventListener('click', () => { s3.k = null; draw3(); });
  document.querySelectorAll('input[name="q4"]').forEach(r => r.addEventListener('change', () => { s4.answered = null; $('fb4').textContent = ''; draw4(); }));
  $('check4').addEventListener('click', () => { const sel = document.querySelector('input[name="q4"]:checked'); s4.answered = sel ? +sel.value : -1; feedback4(); });
  $('next4').addEventListener('click', () => { s4.q = (s4.q + 1) % M.QUIZ.length; s4.answered = null; $('fb4').textContent = ''; document.querySelectorAll('input[name="q4"]').forEach(r => { r.checked = false; }); draw4(); });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(drawAll); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshPage = drawAll;
  drawAll();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
