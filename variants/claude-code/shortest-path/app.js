'use strict';
// Shortest-path lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every distance, route and count comes from window.SP_MODEL (model.js). Canvas text is limited to panel
// titles, axis ticks, node letters, edge weights and distance tags; the tags are placed by a small
// collision-avoiding placer so they never overlap one another.
(function () {

const $ = id => document.getElementById(id);
const M = window.SP_MODEL;
const t = (...a) => window.SP_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', xs: '#9fb4cc', ghost: '#8696aa', edge: '#3d5068' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; };
const dstr = v => (v === Infinity ? '∞' : String(v));
const W_LIST = [0, 0.5, 1, 1.5, 2, 3];

function fitCanvas(canvas, hOverride) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (hOverride) { canvas.dataset.h = hOverride; canvas.style.height = hOverride + 'px'; }
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
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
function panel(ctx, W, o) {
  const P = { l: o.left || 36, r: W - (o.right || 14), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks) {
    ctx.strokeStyle = v === o.yMin ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(fmt(v), P.l - 6, y(v) + 4);
  }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.b); ctx.lineTo(P.r, P.b); ctx.stroke();
  if (o.xTicks) {
    ctx.textAlign = 'center';
    o.xTicks.forEach(v => { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke(); ctx.fillText(fmt(v), x(v), P.b + 15); });
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - (o.titleGap || 9), W - 16);
  return { x, y, P };
}
const ticksEvery = (lo, hi, step) => { const out = []; for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(+v.toFixed(6)); return out; };
function dot(ctx, X, Y, r, fill, stroke, lw = 1.6) {
  ctx.beginPath(); ctx.arc(X, Y, r, 0, 7);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}
function dashed(ctx, x0, y0, x1, y1, color, alpha = 0.8) {
  ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.3;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.restore();
}

/* ---------- label placer: tries candidate spots until a tag overlaps nothing already placed ---------- */
function makePlacer(W, H) {
  const boxes = [];
  const hit = b => b.x0 < 2 || b.y0 < 2 || b.x1 > W - 2 || b.y1 > H - 2 || boxes.some(o => b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0);
  return {
    block(x0, y0, x1, y1) { boxes.push({ x0, y0, x1, y1 }); },
    // candidates: list of [cx, cy] centres; returns the chosen centre (or the first one if all collide)
    place(w, h, candidates) {
      for (const [cx, cy] of candidates) { const b = { x0: cx - w / 2 - 1, y0: cy - h / 2 - 1, x1: cx + w / 2 + 1, y1: cy + h / 2 + 1 }; if (!hit(b)) { boxes.push(b); return [cx, cy]; } }
      const [cx, cy] = candidates[0]; boxes.push({ x0: cx - w / 2, y0: cy - h / 2, x1: cx + w / 2, y1: cy + h / 2 }); return [cx, cy];
    }
  };
}
function tag(ctx, placer, text, candidates, color, bg = C.bg, size = 11, weight = 600) {
  ctx.save(); ctx.font = `${weight} ${size}px system-ui,sans-serif`;
  const w = ctx.measureText(text).width + 6, h = size + 4;
  const [cx, cy] = placer.place(w, h, candidates);
  ctx.fillStyle = bg; ctx.globalAlpha = 0.92; ctx.fillRect(cx - w / 2, cy - h / 2, w, h); ctx.globalAlpha = 1;
  ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, cx, cy + 0.5); ctx.restore();
}

/* ---------- a graph drawing shared by steps 0, 1, 2, 5 ---------- */
const NODE_FILL = { none: '#1b2533', open: '#3a2c14', done: '#163828', new: '#7ee2a8', start: '#16384a' };
const NODE_LINE = { none: '#4a5f78', open: C.orange, done: C.green, new: C.green, start: C.cyan };
function drawGraph(ctx, W, box, g) {
  const r = W < 420 ? 12 : 15, pad = r + 18, padX = r + (W < 420 ? 8 : 18);
  const P = {}; g.nodes.forEach(n => { const [px, py] = g.pos[n]; P[n] = [box.x0 + padX + px * (box.x1 - box.x0 - 2 * padX), box.y0 + pad * 0.7 + py * (box.y1 - box.y0 - 1.4 * pad)]; });
  const placer = makePlacer(W, box.y1 + 4);
  g.nodes.forEach(n => placer.block(P[n][0] - r - 2, P[n][1] - r - 2, P[n][0] + r + 2, P[n][1] + r + 2));
  // edges
  g.edges.forEach(([u, v, w]) => {
    const st = (g.edgeStyle && g.edgeStyle(u, v)) || {};
    const [x0, y0] = P[u], [x1, y1] = P[v], L = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / L, uy = (y1 - y0) / L;
    ctx.save(); ctx.strokeStyle = st.color || C.edge; ctx.lineWidth = st.lw || 2; if (st.dash) ctx.setLineDash(st.dash);
    ctx.beginPath(); ctx.moveTo(x0 + ux * r, y0 + uy * r); ctx.lineTo(x1 - ux * (r + (g.directed ? 3 : 0)), y1 - uy * (r + (g.directed ? 3 : 0))); ctx.stroke(); ctx.setLineDash([]);
    if (g.directed) {
      const ax = x1 - ux * (r + 2), ay = y1 - uy * (r + 2), a = Math.atan2(uy, ux);
      ctx.fillStyle = st.color || C.edge; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax - 10 * Math.cos(a - 0.4), ay - 10 * Math.sin(a - 0.4)); ctx.lineTo(ax - 10 * Math.cos(a + 0.4), ay - 10 * Math.sin(a + 0.4)); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  });
  // edge weights at midpoints (shifted along the normal if the midpoint is taken)
  g.edges.forEach(([u, v, w]) => {
    const st = (g.edgeStyle && g.edgeStyle(u, v)) || {};
    const [x0, y0] = P[u], [x1, y1] = P[v], mx = (x0 + x1) / 2, my = (y0 + y1) / 2, L = Math.hypot(x1 - x0, y1 - y0), nx = -(y1 - y0) / L, ny = (x1 - x0) / L;
    tag(ctx, placer, String(w).replace('-', '−'), [[mx, my], [mx + nx * 12, my + ny * 12], [mx - nx * 12, my - ny * 12], [mx + nx * 22, my + ny * 22], [mx - nx * 22, my - ny * 22]], st.labelColor || C.xs, C.bg, 11, 600);
  });
  // nodes
  g.nodes.forEach(n => {
    const s = g.state(n), [X, Y] = P[n];
    dot(ctx, X, Y, r, NODE_FILL[s], NODE_LINE[s], s === 'new' ? 3 : 2);
    if (g.ring && g.ring(n)) dot(ctx, X, Y, r + 5, null, C.orange, 2.4);
    ctx.save(); ctx.fillStyle = s === 'new' ? '#062014' : C.text; ctx.font = `700 ${r > 12 ? 13 : 11}px system-ui,sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(n, X, Y + 0.5); ctx.restore();
  });
  // distance tags: below the node first, then above, right, left
  if (g.tags) g.nodes.forEach(n => {
    const list = g.tags(n); if (!list) return;
    const [X, Y] = P[n];
    list.forEach(([text, color]) => tag(ctx, placer, text, g.tagAbove ? [[X, Y - r - 13], [X + r + 14, Y - r + 2], [X - r - 14, Y - r + 2], [X, Y + r + 13]] : [[X, Y + r + 13], [X, Y - r - 13], [X + r + 14, Y], [X - r - 14, Y], [X + r + 12, Y + r + 6], [X - r - 12, Y + r + 6], [X, Y + r + 24]], color, '#101b28', 11, 700));
  });
  return P;
}

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

/* ---------- step 0: walk a route yourself ---------- */
const ALL = M.allPaths('S', 'T'), BEST = ALL[0];
const MINHOP = ALL.reduce((a, b) => (b.path.length < a.path.length ? b : a));
const GREEDY = M.greedyWalk();
const s0 = { path: ['S'] };
const onPath = (path, u, v) => { for (let i = 1; i < path.length; i++) if ((path[i - 1] === u && path[i] === v) || (path[i - 1] === v && path[i] === u)) return true; return false; };
function draw0() {
  const path = s0.path, u = path[path.length - 1], cost = M.pathCost(path), done = u === 'T';
  const { ctx, W, H } = fitCanvas($('c0'));
  title(ctx, t('c0a'), 8, 17, W - 16);
  drawGraph(ctx, W, { x0: 0, y0: 26, x1: W, y1: 292 }, {
    nodes: M.NODES, pos: M.POS, edges: M.EDGES,
    state: n => (n === u ? 'open' : path.includes(n) ? 'done' : 'none'),
    ring: n => n === u,
    edgeStyle: (a, b) => (onPath(path, a, b) ? { color: C.orange, lw: 4, labelColor: C.orange } : null)
  });
  // all routes ordered by cost; stacked when equal
  const lo = ALL[0].cost, hi = ALL[ALL.length - 1].cost;
  const A = panel(ctx, W, { top: 340, bottom: H - 30, xMin: lo - 1, xMax: hi + 1, yMin: 0, yMax: 1, yTicks: [], xTicks: ticksEvery(lo - 1, hi + 1, W < 420 ? 4 : 2), left: 16, title: t('c0b', { N: ALL.length }) });
  const stack = {}, rr = W < 420 ? 3.8 : 5.5, gap = rr * 2 + 2;
  const mine = done ? ALL.findIndex(p => p.path.join() === path.join()) : -1;
  ALL.forEach((p, i) => {
    const k = stack[p.cost] = (stack[p.cost] || 0) + 1, X = A.x(p.cost), Y = A.P.b - 4 - rr - (k - 1) * gap;
    if (i === mine) dot(ctx, X, Y, rr + 1.5, C.orange, C.bg);
    else if (i === 0) dot(ctx, X, Y, rr, C.green);
    else dot(ctx, X, Y, rr, C.xs);
  });
  if (!done && path.length > 1) dashed(ctx, A.x(cost), A.P.t, A.x(cost), A.P.b, C.orange, 0.9);
  // move buttons
  const box = $('moves0'), opts = (M.ADJ[u] || []).filter(([v]) => !path.includes(v));
  box.innerHTML = '';
  if (!done) opts.forEach(([v, w]) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'btn move'; b.dataset.step = '0';
    b.textContent = t('moveTo', { v, w }); b.addEventListener('click', () => { s0.path.push(v); draw0(); }); box.appendChild(b);
  });
  $('undo0').disabled = path.length <= 1;
  const ps = path.join(' → ');
  if (done) {
    const d = cost - BEST.cost;
    $('r0').textContent = t('s0done', { path: ps, cost, N: ALL.length, best: BEST.path.join(' → '), bc: BEST.cost, verdict: d === 0 ? t('s0best') : t('s0worse', { d }) });
    $('r0b').textContent = t('s0facts', { hop: MINHOP.path.join(' → '), hc: MINHOP.cost, gr: GREEDY.path.join(' → '), gc: GREEDY.cost });
  } else {
    $('r0').textContent = t(opts.length ? 's0at' : 's0stuck', { u, path: ps, cost });
    $('r0b').textContent = '';
  }
}

/* ---------- step 1: Dijkstra round by round ---------- */
const TRACE = M.dijkstraTrace('S'), N1 = TRACE.length - 1;
const s1 = { k: 0 };
function treeEdge(st, a, b) { return (st.pred[b] === a && st.done[b]) || (st.pred[a] === b && st.done[a]); }
function candEdge(st, a, b) { return (st.pred[b] === a && !st.done[b]) || (st.pred[a] === b && !st.done[a]); }
function drawSettling(canvasId, st, nodes, titleKey, rulerKey, start) {
  const { ctx, W, H } = fitCanvas($(canvasId));
  title(ctx, t(titleKey), 8, 17, W - 16);
  drawGraph(ctx, W, { x0: 0, y0: 26, x1: W, y1: rulerKey ? 292 : H - 6 }, {
    nodes, pos: M.POS, edges: M.EDGES,
    state: n => (n === st.settled ? 'new' : st.done[n] ? 'done' : st.dist[n] < Infinity ? 'open' : 'none'),
    ring: n => n === start && !st.done[n],
    edgeStyle: (a, b) => (treeEdge(st, a, b) ? { color: C.green, lw: 4, labelColor: C.green } : candEdge(st, a, b) ? { color: C.orange, lw: 2, dash: [5, 4] } : null),
    tags: n => [[dstr(st.dist[n]), st.done[n] ? C.green : st.dist[n] < Infinity ? C.orange : C.muted]]
  });
  if (!rulerKey) return;
  const maxD = Math.max(...Object.values(TRACE[N1].dist));
  const A = panel(ctx, W, { top: 352, bottom: H - 30, xMin: -0.5, xMax: maxD + 1, yMin: 0, yMax: 1, yTicks: [], xTicks: ticksEvery(0, maxD, W < 420 ? 4 : 2), left: 16, titleGap: 50, title: t(rulerKey) });
  const placer = makePlacer(W, H);
  st.order.forEach((n, i) => {
    const X = A.x(st.dist[n]);
    dot(ctx, X, A.P.b, n === st.settled ? 6 : 4.5, n === st.settled ? C.green : C.text);
    tag(ctx, placer, `${i + 1}·${n}`, [[X, A.P.b - 16], [X, A.P.b - 32], [X, A.P.b - 48]], n === st.settled ? C.green : C.text, C.bg, 11, 700);
  });
}
function draw1() {
  const st = TRACE[s1.k];
  drawSettling('c1', st, M.NODES, 'c1a', 'c1b', 'S');
  $('next1').disabled = s1.k >= N1;
  if (s1.k === 0) { $('r1').textContent = t('s1start'); return; }
  const rel = st.relaxed.length ? t('s1relax', { list: st.relaxed.map(r => `${r.v} ${dstr(r.from)} → ${r.to}`).join(', ') }) : t('s1norelax');
  let txt = t('s1step', { k: s1.k, N: N1, u: st.settled, d: st.dist[st.settled], relax: rel });
  if (s1.k === N1) txt += ' ' + t('s1end', { order: st.order.join(' → '), dists: st.order.map(n => st.dist[n]).join(', '), path: M.pathTo(st.pred, 'T').join(' → '), dT: st.dist.T });
  $('r1').textContent = txt;
}

/* ---------- step 2: a negative edge ---------- */
function draw2() {
  const w = num('w2'), r = M.negCase(w);
  $('w2v').textContent = String(w).replace('-', '−');
  const { ctx, W, H } = fitCanvas($('c2'));
  title(ctx, t('c2a'), 8, 17, W - 16);
  drawGraph(ctx, W, { x0: 0, y0: 30, x1: W, y1: H - 8 }, {
    nodes: M.NEG_NODES, pos: M.NEG_POS, edges: M.negEdges(w), directed: true, tagAbove: true,
    state: () => 'done',
    edgeStyle: (a, b) => (a === 'B' && b === 'A' ? (r.late ? { color: C.pink, lw: 3.5, labelColor: C.pink } : { color: C.ghost, lw: 2.5, labelColor: C.text }) : null),
    tags: n => (r.dij[n] === r.bf[n] ? [[String(r.dij[n]), C.green]] : [[String(r.dij[n]), C.cyan], [String(r.bf[n]), C.green]])
  });
  const via = r.dij.B + w;
  $('r2').textContent = r.agree
    ? t('s2ok', { w, a: r.dij.A, t: r.dij.T, order: r.order.join(' → '), via })
    : t('s2bad', { w, a: r.dij.A, t: r.dij.T, ba: r.bf.A, bt: r.bf.T, order: r.order.join(' → '), via });
}

/* ---------- steps 3–4: the grid ---------- */
const HEAT = v => { // 0 → deep teal, 1 → warm yellow
  const a = [36, 120, 140], b = [255, 214, 120];
  return `rgb(${a.map((c, i) => Math.round(c + (b[i] - c) * v)).join(',')})`;
};
function drawGrid(ctx, W, top, cell, res, shown, x0) {
  const GW = M.GW, GH = M.GH, maxG = Math.max(...res.order.map(i => res.g[i]));
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
    const k = M.GRID[y][x];
    ctx.fillStyle = k === 2 ? '#3b4250' : k === 1 ? '#7a5a32' : '#18222f';
    ctx.fillRect(x0 + x * cell, top + y * cell, cell - 1, cell - 1);
    if (k === 2) { ctx.strokeStyle = '#596173'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0 + x * cell + 2, top + y * cell + cell - 3); ctx.lineTo(x0 + x * cell + cell - 3, top + y * cell + 2); ctx.stroke(); }
  }
  const n = Math.min(shown, res.order.length);
  for (let j = 0; j < n; j++) {
    const i = res.order[j], x = i % GW, y = Math.floor(i / GW);
    // inset tint: the terrain colour stays visible as a frame (mud remains recognisable once searched)
    const ins = Math.max(2, Math.round(cell * 0.17));
    ctx.fillStyle = HEAT(res.g[i] / Math.max(1, maxG)); ctx.globalAlpha = 0.75;
    ctx.fillRect(x0 + x * cell + ins, top + y * cell + ins, cell - 1 - 2 * ins, cell - 1 - 2 * ins); ctx.globalAlpha = 1;
  }
  if (n >= res.order.length) {
    ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = Math.max(2.5, cell * 0.18); ctx.lineJoin = 'round'; ctx.beginPath();
    res.path.forEach((i, j) => { const X = x0 + (i % GW + 0.5) * cell - 0.5, Y = top + (Math.floor(i / GW) + 0.5) * cell - 0.5; if (j) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); });
    ctx.stroke(); ctx.restore();
  } else if (n > 0) {
    const i = res.order[n - 1]; ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.strokeRect(x0 + (i % GW) * cell + 1, top + Math.floor(i / GW) * cell + 1, cell - 3, cell - 3);
  }
  ctx.save(); ctx.font = `700 ${Math.max(9, Math.min(13, cell * 0.5))}px system-ui,sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  [[M.START, 'S'], [M.GOAL, 'T']].forEach(([[x, y], s]) => { ctx.fillStyle = C.cyan; ctx.fillRect(x0 + x * cell + 2, top + y * cell + 2, cell - 5, cell - 5); ctx.fillStyle = '#061118'; ctx.fillText(s, x0 + (x + 0.5) * cell - 0.5, top + (y + 0.5) * cell); });
  ctx.restore();
}
const s3 = { shown: Infinity };
function draw3() {
  const m = num('m3'), res = M.gridSearch(m, 0);
  $('m3v').textContent = String(m);
  const c = $('c3'), W0 = Math.max(240, c.clientWidth || 600), cell = Math.floor(Math.min((W0 - 16) / M.GW, 30));
  const { ctx, W } = fitCanvas(c, cell * M.GH + 40);
  title(ctx, t('c3a'), 8, 17, W - 16);
  drawGrid(ctx, W, 28, cell, res, s3.shown, Math.round((W - cell * M.GW) / 2));
  const N = res.order.length, prog = s3.shown < N ? t('s3prog', { c: Math.min(s3.shown, N), N }) : '';
  const det = M.gridCostVia(m, false), thr = M.gridCostVia(m, true);
  const note = res.mudCells > 0 ? (m > 1 ? t('s3through', { det }) : '') : t('s3around', { thr });
  $('r3').textContent = t('s3readout', { prog, m, cost: res.cost, mud: res.mudCells, len: res.path.length - 1, done: N, note });
}
const s4 = { shown: Infinity, hist: new Map(), mud: null };
function draw4() {
  const m = num('m3'), wi = num('w4'), w = W_LIST[wi], res = M.gridSearch(m, w), dij = M.gridSearch(m, 0), opt = dij.cost;
  if (s4.mud !== m) { s4.hist = new Map(); s4.mud = m; }
  s4.hist.set(w, res);
  $('w4v').textContent = fmt(w, 1);
  const c4 = $('c4'), stacked = window.innerWidth <= 640, W4 = Math.max(240, c4.clientWidth || 600);
  const cell = Math.floor(Math.min((W4 - 12) / M.GW, stacked ? 30 : 26));
  let { ctx, W, H } = fitCanvas(c4, stacked ? cell * M.GH + 40 : 300);
  title(ctx, t('c4a'), 8, 17, W - 16);
  drawGrid(ctx, W, 28 + Math.max(0, Math.floor((H - 36 - cell * M.GH) / 2)), cell, res, s4.shown, Math.round((W - cell * M.GW) / 2));
  ({ ctx, W, H } = fitCanvas($('c4b')));
  const xT = W_LIST;
  const A = panel(ctx, W, { top: 26, bottom: 128, xMin: -0.2, xMax: 3.2, yMin: 0, yMax: 140, yTicks: [0, 70, 140], xTicks: xT.filter(v => W >= 330 || Number.isInteger(v)), title: t('c4b') });
  const maxC = Math.max(opt + 4, ...[...s4.hist.values()].map(r => r.cost)) + 1;
  const B = panel(ctx, W, { top: 176, bottom: H - 30, xMin: -0.2, xMax: 3.2, yMin: opt - 2, yMax: maxC, yTicks: [opt - 2, opt, maxC].filter((v, i, a) => a.indexOf(v) === i), xTicks: xT.filter(v => W >= 330 || Number.isInteger(v)), title: t('c4c') });
  dashed(ctx, B.P.l, B.y(opt), B.P.r, B.y(opt), C.ghost, 0.95);
  [...s4.hist.entries()].forEach(([hw, r]) => {
    const cur = hw === w;
    dot(ctx, A.x(hw), A.y(r.settled), cur ? 6 : 4.5, cur ? C.orange : C.text, cur ? C.bg : null);
    dot(ctx, B.x(hw), B.y(r.cost), cur ? 6 : 4.5, cur ? C.orange : C.text, cur ? C.bg : null);
  });
  const N = res.order.length, prog = s4.shown < N ? t('s4prog', { c: Math.min(s4.shown, N), N }) : '';
  const d = res.cost - opt;
  $('r4').textContent = t('s4readout', { prog, m, w: fmt(w, 1), done: res.settled, dij: dij.settled, cost: res.cost, opt, verdict: d === 0 ? t('s4opt') : t('s4sub', { d }) });
}

/* ---------- step 5: you settle the nodes ---------- */
const s5 = {};
function reset5() { s5.st = M.dijkstraTrace('T')[0]; s5.st.settled = null; s5.ok = 0; s5.bad = 0; s5.order = []; s5.msg = ''; }
function pick5(v) {
  const cands = M.nextCandidates(s5.st);
  if (!cands.length) return;
  if (cands.includes(v)) {
    const d = s5.st.dist[v]; s5.st = M.settle(s5.st, v); s5.order.push(v); s5.ok++;
    const rel = s5.st.relaxed.length ? t('s1relax', { list: s5.st.relaxed.map(r => `${r.v} ${dstr(r.from)} → ${r.to}`).join(', ') }) : t('s1norelax');
    s5.msg = t('s5right', { v, d, relax: rel });
  } else {
    s5.bad++;
    const best = cands[0], d = s5.st.dist[best];
    s5.msg = s5.st.dist[v] === Infinity ? t('s5inf', { v, best, d }) : t('s5wrong', { v, dv: s5.st.dist[v], best, d });
  }
  draw5();
}
function draw5() {
  const st = s5.st;
  drawSettling('c5', { ...st, order: s5.order }, M.NODES, 'c5a', null, 'T');
  const box = $('picks5'); box.innerHTML = '';
  M.NODES.filter(n => !st.done[n]).forEach(n => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'btn move'; b.dataset.step = '5';
    b.textContent = t('s5pick', { v: n }); b.addEventListener('click', () => pick5(n)); box.appendChild(b);
  });
  const N = M.NODES.length, k = s5.order.length;
  $('r5').textContent = k >= N ? t('s5end', { order: s5.order.join(' → '), dS: st.dist.S, bad: s5.bad }) : t('s5ask', { k: k + 1, N, ok: s5.ok, bad: s5.bad });
  $('r5b').textContent = s5.msg;
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  $('undo0').addEventListener('click', () => { if (s0.path.length > 1) s0.path.pop(); draw0(); });
  $('reset0').addEventListener('click', () => { s0.path = ['S']; draw0(); });

  $('next1').addEventListener('click', () => { stopAnim('s1'); s1.k = Math.min(N1, s1.k + 1); draw1(); });
  $('restart1').addEventListener('click', () => { stopAnim('s1'); s1.k = 0; draw1(); });
  $('auto1').addEventListener('click', () => {
    const from = s1.k >= N1 ? 0 : s1.k, n = N1 - from;
    animate('s1', n * 900, p => { s1.k = Math.min(N1, from + Math.floor(p * n + 1e-9)); if (p >= 1) s1.k = N1; draw1(); });
  });

  $('w2').addEventListener('input', draw2);

  $('m3').addEventListener('input', () => { stopAnim('s3'); stopAnim('s4'); s3.shown = Infinity; s4.shown = Infinity; draw3(); draw4(); });
  $('play3').addEventListener('click', () => {
    const N = M.gridSearch(num('m3'), 0).order.length; s3.shown = 0; draw3();
    animate('s3', 4500, p => { s3.shown = Math.floor(p * N); if (p >= 1) s3.shown = Infinity; draw3(); });
  });
  $('w4').addEventListener('input', () => { stopAnim('s4'); s4.shown = Infinity; draw4(); });
  $('play4').addEventListener('click', () => {
    const N = M.gridSearch(num('m3'), W_LIST[num('w4')]).order.length; s4.shown = 0; draw4();
    animate('s4', Math.max(1200, N * 35), p => { s4.shown = Math.floor(p * N); if (p >= 1) s4.shown = Infinity; draw4(); });
  });

  $('restart5').addEventListener('click', () => { reset5(); draw5(); });
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked');
    const ok = !!choice && choice.value === 'c';
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
  reset5();
  window.refreshShortestPath = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
