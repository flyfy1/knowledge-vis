'use strict';
// Graph traversal lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every node colour, count and readout comes from window.GRAPH_MODEL (model.js). Canvas text is
// limited to panel titles, node letters, one badge per node (fixed side), maze numbers and axis ticks.
(function () {

const $ = id => document.getElementById(id);
const M = window.GRAPH_MODEL;
const t = (...a) => window.GRAPH_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', edge: '#8fa3ba', off: '#4d5d72', node: '#1b2736', done: '#3d5068', wall: '#3a4a5e', raw: '#6b7b90' };
const LAYER = ['#67d7f9', '#7ee2a8', '#e5d36b', '#ff9a76', '#d79bff', '#9fb4cc'];
const layerColor = d => LAYER[Math.min(d, LAYER.length - 1)];
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros only when there is a decimal point (so 90 stays 90).
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; };
const sep = () => (window.GRAPH_I18N.getLang() === 'zh' ? '、' : ', ');

function fitCanvas(canvas, hOverride) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) canvas.dataset.h = canvas.getAttribute('height') || 300;
  const height = hOverride || Number(canvas.dataset.h);
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

// Panel title in its own row; shrinks until it fits the width.
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}

/* ---------- shared graph state ---------- */
const G = { on: M.DEFAULT_ON.slice(), sel: 'D' };
const adj = () => M.adjacency(G.on);
const BADGE_BELOW = new Set(['C', 'E', 'H']);

// Draw the eight-node graph in [top, bottom]. opts: edge(a,b,i) → style|null, fill(id), ring(id), badge(id) → {text,color}|null
function drawGraph(ctx, W, top, bottom, o) {
  const R = W < 420 ? 12 : 14, padX = R + 10, y0 = top + R + 18, y1 = bottom - R - 18;
  const P = {}; M.NODES.forEach(n => { P[n.id] = { x: padX + n.x * (W - 2 * padX), y: y0 + n.y * (y1 - y0) }; });
  ctx.save(); ctx.lineCap = 'round';
  M.CANDIDATES.forEach(([a, b], i) => {
    const s = o.edge(a, b, i); if (!s) return;
    ctx.strokeStyle = s.color; ctx.lineWidth = s.width || 2; ctx.globalAlpha = s.alpha == null ? 1 : s.alpha; ctx.setLineDash(s.dash || []);
    ctx.beginPath(); ctx.moveTo(P[a].x, P[a].y); ctx.lineTo(P[b].x, P[b].y); ctx.stroke();
  });
  ctx.setLineDash([]); ctx.globalAlpha = 1;
  M.NODES.forEach(({ id }) => {
    const p = P[id], ring = o.ring && o.ring(id);
    ctx.beginPath(); ctx.arc(p.x, p.y, R, 0, 7); ctx.fillStyle = o.fill(id); ctx.fill();
    ctx.lineWidth = ring ? 3 : 1.5; ctx.strokeStyle = ring || C.edge; ctx.stroke();
    ctx.fillStyle = o.letter ? o.letter(id) : C.text; ctx.font = `700 ${R}px system-ui,sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(id, p.x, p.y + 0.5);
    const b = o.badge && o.badge(id);
    if (b) {
      ctx.font = '600 11px system-ui,sans-serif'; ctx.fillStyle = b.color || C.text; ctx.textBaseline = 'alphabetic';
      const by = BADGE_BELOW.has(id) ? p.y + R + 14 : p.y - R - 6;
      ctx.fillText(b.text, p.x, by);
    }
  });
  ctx.restore();
  return { P, R };
}

/* ---------- step 0: adjacency lists ---------- */
let geo0 = null;
function edgeOptions(sel) {
  const cur = sel.value;
  sel.innerHTML = M.CANDIDATES.map(([a, b], i) => `<option value="${i}">${a}–${b} (${t(G.on[i] ? 'edgeOpen' : 'edgeClosed')})</option>`).join('');
  sel.value = cur || '10';
}
function draw0() {
  const A = adj();
  const { ctx, W, H } = fitCanvas($('c0'));
  title(ctx, t('c0'), 8, 16, W - 16);
  geo0 = drawGraph(ctx, W, 24, H - 4, {
    edge: (a, b, i) => G.on[i] ? ((a === G.sel || b === G.sel) ? { color: C.orange, width: 3.5 } : { color: C.edge, width: 2.2 }) : { color: C.off, width: 1.6, dash: [5, 5] },
    fill: id => id === G.sel ? C.orange : C.node,
    letter: id => id === G.sel ? '#07131a' : C.text,
    ring: id => id === G.sel ? C.orange : null
  });
  $('adj0').innerHTML = M.IDS.map(id => `<button type="button" data-node="${id}" class="${id === G.sel ? 'sel' : ''}" aria-pressed="${id === G.sel}"><b>${id}:</b>${A[id].length ? A[id].join(' ') : '—'}</button>`).join('');
  const E = M.edgeCount(A), sum = M.IDS.reduce((s, id) => s + A[id].length, 0);
  $('r0').textContent = t('s0readout', { V: M.IDS.length, E, sum, u: G.sel, list: A[G.sel].length ? A[G.sel].join(sep()) : '—', deg: A[G.sel].length });
  edgeOptions($('edge0')); edgeOptions($('edge3'));
}
function hit0(ev) {
  if (!geo0) return;
  const rect = $('c0').getBoundingClientRect(), x = ev.clientX - rect.left, y = ev.clientY - rect.top;
  for (const id of M.IDS) { const p = geo0.P[id]; if (Math.hypot(x - p.x, y - p.y) <= geo0.R + 6) { G.sel = id; draw0(); return; } }
  let best = -1, bd = 12;
  M.CANDIDATES.forEach(([a, b], i) => {
    const p = geo0.P[a], q = geo0.P[b], dx = q.x - p.x, dy = q.y - p.y, L2 = dx * dx + dy * dy;
    const u = Math.max(0, Math.min(1, ((x - p.x) * dx + (y - p.y) * dy) / L2)), d = Math.hypot(x - p.x - u * dx, y - p.y - u * dy);
    if (d < bd) { bd = d; best = i; }
  });
  if (best >= 0) { $('edge0').value = String(best); toggleEdge(best); }
}
function toggleEdge(i) { G.on[i] = !G.on[i]; graphChanged(); }
function graphChanged() { s1.prev = null; resetRun1(); s2.k = 0; s3.k = 0; stopAnim('s2'); stopAnim('s3'); stopAnim('s1'); rebuild(); refreshGraphSteps(); }

/* ---------- step 1: marks ---------- */
const s1 = { mark: false, r: 0, run: null, prev: null };
function resetRun1() { s1.r = 0; s1.run = M.naiveRun(adj(), 'A', s1.mark); }
function draw1() {
  const run = s1.run, cur = run.rounds[s1.r];
  $('markOn').setAttribute('aria-pressed', String(s1.mark)); $('markOff').setAttribute('aria-pressed', String(!s1.mark));
  const { ctx, W, H } = fitCanvas($('c1'));
  title(ctx, t('c1top'), 8, 16, W - 16);
  const A = adj();
  drawGraph(ctx, W, 24, 262, {
    edge: (a, b, i) => G.on[i] ? { color: C.edge, width: 2 } : null,
    fill: id => cur.puts[id] === 0 ? C.node : cur.puts[id] === 1 ? '#1f5f74' : cur.puts[id] <= 4 ? '#8a5a1e' : '#9b3446',
    ring: id => (cur.taken === id ? C.orange : null),
    badge: id => cur.puts[id] ? { text: '×' + cur.puts[id], color: cur.puts[id] > 1 ? C.orange : C.cyan } : null
  });
  // queue length per round: this run (cyan) and the previous run of the other setting (grey)
  const lens = run.rounds.slice(0, s1.r + 1).map(q => q.queue.length);
  const prev = s1.prev || [];
  const cap = 24, yMax = Math.max(10, Math.ceil(Math.max(...run.rounds.map(q => q.queue.length), ...prev, 1) / 10) * 10);
  const top = 300, bot = H - 24, L = 36, Rr = W - 12;
  title(ctx, t('c1bot'), 8, top - 10, W - 16);
  const X = v => L + v / cap * (Rr - L), Y = v => bot - v / yMax * (bot - top);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.lineWidth = 1;
  [0, yMax / 2, yMax].forEach(v => { ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(L, Y(v)); ctx.lineTo(Rr, Y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(fmt(v, 0), L - 6, Y(v) + 4); });
  ctx.textAlign = 'center'; const xs = W < 420 ? 6 : 4;
  for (let v = 0; v <= cap; v += xs) ctx.fillText(String(v), X(v), bot + 15);
  const line = (arr, color, w) => { if (arr.length < 1) return; ctx.strokeStyle = color; ctx.lineWidth = w; ctx.beginPath(); arr.forEach((v, i) => { if (i === 0) ctx.moveTo(X(i), Y(v)); else ctx.lineTo(X(i), Y(v)); }); ctx.stroke(); arr.forEach((v, i) => { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(X(i), Y(v), w > 2 ? 3 : 2, 0, 7); ctx.fill(); }); };
  line(prev, C.raw, 1.6); line(lens, C.cyan, 2.4);
  ctx.restore();
  let text = t('s1readout', { r: s1.r, total: cur.total, q: cur.queue.length });
  if (s1.r > 0) {
    const before = run.rounds[s1.r - 1].puts, put = M.IDS.filter(id => cur.puts[id] > before[id]).flatMap(id => Array(cur.puts[id] - before[id]).fill(id));
    text = t('s1took', { r: s1.r, u: cur.taken, put: put.length ? put.join(sep()) : t('s1none') }) + ' ' + text;
  }
  if (s1.r === run.rounds.length - 1) {
    if (run.finished) text += ' ' + t('s1doneMark', { n: Object.values(cur.puts).filter(v => v > 0).length });
    else { const top1 = M.IDS.reduce((a, b) => (cur.puts[b] > cur.puts[a] ? b : a)); text += ' ' + t('s1capped', { r: s1.r, q: cur.queue.length, u: top1, c: cur.puts[top1] }); }
  }
  $('r1').textContent = text;
  $('round1').disabled = s1.r >= run.rounds.length - 1;
}
function setMark(on) {
  if (on === s1.mark) return;
  stopAnim('s1');
  s1.prev = s1.r > 0 ? s1.run.rounds.slice(0, s1.r + 1).map(q => q.queue.length) : s1.prev;
  s1.mark = on; resetRun1(); draw1();
}

/* ---------- steps 2 and 3: BFS queue, DFS stack ---------- */
const s2 = { start: 'A', k: 0, tr: null };
const s3 = { start: 'A', k: 0, tr: null, bfs: null };
function rebuild() {
  const A = adj();
  s2.tr = M.bfsTrace(A, s2.start); s2.k = Math.min(s2.k, s2.tr.length - 1);
  s3.tr = M.dfsTrace(A, s3.start); s3.bfs = M.bfsTrace(A, s3.start); s3.k = Math.min(s3.k, s3.tr.length - 1);
}
function chips(list, colorOf) { return list.length ? `<span class="chips">${list.map(id => `<span class="chip" style="background:${colorOf(id)}">${id}</span>`).join('')}</span>` : `<span class="empty">${t('emptyBox')}</span>`; }
function draw2() {
  const S = s2.tr[s2.k], N = s2.tr.length - 1, a = S.action;
  $('box2').innerHTML = `<span class="box-name">${t('queueLabel')}</span><span class="end">${t('queueOut')} ←</span>${chips(S.container, id => layerColor(S.dist[id]))}<span class="end">← ${t('queueIn')}</span>`;
  const { ctx, W, H } = fitCanvas($('c2'));
  title(ctx, t('c2'), 8, 16, W - 16);
  const tree = new Set(S.tree.map(([u, v]) => u + v + ' ' + v + u));
  drawGraph(ctx, W, 24, H - 4, {
    edge: (x, y, i) => {
      if (!G.on[i]) return null;
      if (a.type === 'scan' && ((a.u === x && a.v === y) || (a.u === y && a.v === x))) return { color: C.orange, width: 4 };
      if (tree.has(x + y + ' ' + y + x) || tree.has(y + x + ' ' + x + y)) return { color: C.cyan, width: 3.5 };
      return { color: C.edge, width: 1.6, alpha: 0.55 };
    },
    fill: id => (id in S.dist ? layerColor(S.dist[id]) : C.node),
    letter: id => (id in S.dist ? '#07131a' : C.text),
    ring: id => (id === S.current ? C.orange : null),
    badge: id => (id in S.dist ? { text: 'd=' + S.dist[id], color: layerColor(S.dist[id]) } : null)
  });
  const act = a.type === 'init' ? t('actInit', { u: s2.start }) : a.type === 'take' ? t('actTake', { u: a.u }) : a.type === 'scan' ? (a.found ? t('actScanNew', { u: a.u, v: a.v, d: S.dist[a.v] }) : t('actScanOld', { u: a.u, v: a.v })) : t('actDone');
  const E2 = M.IDS.reduce((s, id) => s + adj()[id].length, 0);
  let text = t('s2readout', { k: s2.k, N, act, order: S.order.join(' '), s: S.scanned, s2: E2 });
  if (a.type === 'done') text += ' ' + t('s2final', { dists: M.IDS.filter(id => id in S.dist).map(id => `${id}=${S.dist[id]}`).join(sep()) });
  $('r2').textContent = text;
  $('step2b').disabled = s2.k >= N;
  $('play2').textContent = anims.s2 ? t('pause') : t('play');
}
function draw3() {
  const S = s3.tr[s3.k], N = s3.tr.length - 1, a = S.action, B = s3.bfs;
  const onStack = new Set(S.container), fin = new Set(S.finished);
  $('box3').innerHTML = `<span class="box-name">${t('stackLabel')}</span><span class="end">${t('stackBottom')} →</span>${chips(S.container, () => C.orange)}<span class="end">← ${t('stackTop')}</span>`;
  const { ctx, W, H } = fitCanvas($('c3'));
  title(ctx, t('c3top'), 8, 16, W - 16);
  const tree = new Set(S.tree.map(([u, v]) => [u, v].sort().join('')));
  drawGraph(ctx, W, 24, 278, {
    edge: (x, y, i) => {
      if (!G.on[i]) return null;
      if (a.type === 'scan' && [a.u, a.v].sort().join('') === [x, y].sort().join('')) return { color: C.text, width: 4 };
      if (tree.has([x, y].sort().join(''))) return { color: C.orange, width: 3.5 };
      return { color: C.edge, width: 1.6, alpha: 0.55 };
    },
    fill: id => (onStack.has(id) ? C.orange : fin.has(id) ? C.done : C.node),
    letter: id => (onStack.has(id) ? '#07131a' : C.text),
    ring: id => (id === S.current ? C.text : null),
    badge: id => { const k = S.order.indexOf(id); return k >= 0 ? { text: '#' + (k + 1), color: onStack.has(id) ? C.orange : C.muted } : null; }
  });
  // frontier size per action: BFS whole run vs DFS so far
  const top = 318, bot = H - 24, L = 30, Rr = W - 12;
  title(ctx, t('c3bot'), 8, top - 10, W - 16);
  const bl = B.map(s => s.container.length), dl = s3.tr.map(s => s.container.length);
  const xMax = Math.max(bl.length, dl.length) - 1, yMax = Math.max(4, Math.ceil(Math.max(...bl, ...dl) / 2) * 2);
  const X = v => L + v / xMax * (Rr - L), Y = v => bot - v / yMax * (bot - top);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.lineWidth = 1;
  const yStep = yMax > 6 ? 2 : 1;
  for (let v = 0; v <= yMax; v += yStep) { ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(L, Y(v)); ctx.lineTo(Rr, Y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(String(v), L - 6, Y(v) + 4); }
  ctx.textAlign = 'center'; const xs = W < 420 ? 10 : 5;
  for (let v = 0; v <= xMax; v += xs) ctx.fillText(String(v), X(v), bot + 15);
  const stepLine = (arr, n, color, w) => { ctx.strokeStyle = color; ctx.lineWidth = w; ctx.beginPath(); for (let i = 0; i <= n; i++) { if (i === 0) ctx.moveTo(X(0), Y(arr[0])); else { ctx.lineTo(X(i), Y(arr[i - 1])); ctx.lineTo(X(i), Y(arr[i])); } } ctx.stroke(); };
  stepLine(bl, bl.length - 1, C.cyan, 1.8); stepLine(dl, s3.k, C.orange, 2.8);
  ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(X(s3.k), Y(dl[s3.k]), 4.5, 0, 7); ctx.fill();
  ctx.restore();
  const act = a.type === 'init' ? t('actInitDfs', { u: s3.start }) : a.type === 'scan' ? (a.found ? t('actPush', { u: a.u, v: a.v }) : t('actScanOld', { u: a.u, v: a.v })) : a.type === 'pop' ? t('actPop', { u: a.u }) : t('actDoneDfs');
  $('r3').textContent = t('s3readout', { k: s3.k, N, act, order: S.order.join(' ') });
  let extra = '';
  if (a.type === 'done') {
    const tgt = s3.start === M.TARGET ? 'A' : M.TARGET, path = M.pathTo(S.parent, tgt), bd = B[B.length - 1].dist[tgt];
    if (!path) extra = t('s3noPath', { s: s3.start, t: tgt });
    else extra = t(path.length - 1 === bd ? 's3same' : 's3path', { s: s3.start, t: tgt, path: path.join('–'), len: path.length - 1, bfs: bd });
  }
  $('r3b').textContent = extra;
  $('step3b').disabled = s3.k >= N;
  $('play3').textContent = anims.s3 ? t('pause') : t('play');
}
function refreshGraphSteps() { draw0(); draw1(); draw2(); draw3(); }

/* ---------- step 4: maze ---------- */
const s4 = { walls: new Set(M.MAZE_WALLS), layer: Infinity, dfs: false, res: null, dres: null, geo: null };
function solve4() { s4.res = M.gridBfs(s4.walls); s4.dres = M.gridDfs(s4.walls); }
function draw4() {
  const m = M.MAZE, c = $('c4'), W0 = Math.max(240, c.clientWidth || 600);
  const cell = Math.min(46, Math.floor((W0 - 16) / m.cols)), gw = cell * m.cols, gh = cell * m.rows;
  const { ctx, W, H } = fitCanvas(c, gh + 40);
  title(ctx, t('c4'), 8, 16, W - 16);
  const ox = Math.round((W - gw) / 2), oy = 28, res = s4.res, K = res.layers, shown = Math.min(s4.layer, K);
  s4.geo = { ox, oy, cell };
  const cx = k => ox + (k % m.cols + 0.5) * cell, cy = k => oy + (Math.floor(k / m.cols) + 0.5) * cell;
  ctx.save();
  for (let k = 0; k < m.cols * m.rows; k++) {
    const x = ox + (k % m.cols) * cell, y = oy + Math.floor(k / m.cols) * cell;
    if (s4.walls.has(k)) ctx.fillStyle = C.wall;
    else if (res.dist.has(k) && res.dist.get(k) <= shown) { const d = res.dist.get(k); ctx.fillStyle = `rgba(103,215,249,${0.42 - 0.3 * d / Math.max(1, K)})`; }
    else ctx.fillStyle = '#121c28';
    ctx.fillRect(x + 1, y + 1, cell - 2, cell - 2);
    if (s4.walls.has(k)) { // hatch so walls never read as unreached floor
      ctx.save(); ctx.beginPath(); ctx.rect(x + 1, y + 1, cell - 2, cell - 2); ctx.clip(); ctx.strokeStyle = '#6d7f96'; ctx.lineWidth = 1.2;
      for (let q = -cell; q < cell; q += 7) { ctx.beginPath(); ctx.moveTo(x + q, y + cell); ctx.lineTo(x + q + cell, y); ctx.stroke(); }
      ctx.restore();
    }
  }
  const poly = (path, color, off) => { ctx.strokeStyle = color; ctx.lineWidth = Math.max(2.5, cell * 0.1); ctx.lineJoin = 'round'; ctx.globalAlpha = 0.9; ctx.beginPath(); path.forEach((k, i) => { const X = cx(k) + off, Y = cy(k) + off; if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }); ctx.stroke(); ctx.globalAlpha = 1; };
  if (s4.dfs && s4.dres.path) poly(s4.dres.path, C.orange, cell * 0.16);
  if (res.path && shown >= res.dist.get(m.goal)) poly(res.path, C.cyan, -cell * 0.16);
  const fs = Math.max(9, Math.min(13, Math.floor(cell * 0.42)));
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  for (let k = 0; k < m.cols * m.rows; k++) {
    let txt = null, col = C.text;
    if (k === m.start) { txt = 'S'; col = C.text; } else if (k === m.goal) { txt = 'T'; col = C.orange; }
    else if (res.dist.has(k) && res.dist.get(k) <= shown) { txt = String(res.dist.get(k)); col = '#cfe9f5'; }
    if (!txt) continue;
    ctx.font = `${k === m.start || k === m.goal ? 800 : 600} ${k === m.start || k === m.goal ? fs + 2 : fs}px system-ui,sans-serif`;
    ctx.lineWidth = 3; ctx.strokeStyle = C.bg; ctx.strokeText(txt, cx(k), cy(k)); ctx.fillStyle = col; ctx.fillText(txt, cx(k), cy(k));
  }
  ctx.restore();
  let text = shown < K ? t('s4progress', { k: shown, K }) : '';
  if (!res.path) text += t('s4none', { reach: res.dist.size });
  else {
    const len = res.path.length - 1, far = Math.max(...res.dist.values());
    text += t('s4readout', { len, reach: res.dist.size, far });
    if (s4.dfs) text += ' ' + t('s4dfs', { len: s4.dres.path.length - 1, extra: s4.dres.path.length - 1 - len, seen: s4.dres.visited });
  }
  $('r4').textContent = text;
  $('dfs4').setAttribute('aria-pressed', String(s4.dfs)); $('dfs4').disabled = !res.path;
}
function hit4(ev) {
  const g = s4.geo, m = M.MAZE; if (!g) return;
  const rect = $('c4').getBoundingClientRect(), x = ev.clientX - rect.left - g.ox, y = ev.clientY - rect.top - g.oy;
  const c = Math.floor(x / g.cell), r = Math.floor(y / g.cell);
  if (c < 0 || c >= m.cols || r < 0 || r >= m.rows) return;
  const k = r * m.cols + c; if (k === m.start || k === m.goal) return;
  if (s4.walls.has(k)) s4.walls.delete(k); else s4.walls.add(k);
  stopAnim('s4'); solve4(); s4.layer = Infinity; draw4();
}

/* ---------- step 5: work count ---------- */
const s5 = { pts: new Map() };
function draw5() {
  const V = num('v5'), d = num('d5'), g = M.randomGraph(V, d), c = M.bfsCost(g);
  s5.pts.set(V + ':' + d, { V, d, list: c.listWork, mat: c.matrixWork });
  $('v5v').textContent = String(V); $('d5v').textContent = String(d);
  const { ctx, W, H } = fitCanvas($('c5'));
  title(ctx, t('c5'), 8, 16, W - 16);
  const L = 44, Rr = W - 14, top = 30, bot = H - 26, lyMin = 1, lyMax = 5.5;
  const X = v => L + v / 400 * (Rr - L), Y = v => bot - (Math.log10(v) - lyMin) / (lyMax - lyMin) * (bot - top);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.lineWidth = 1;
  [[10, '10'], [100, '100'], [1000, '1k'], [10000, '10k'], [100000, '100k']].forEach(([v, s]) => { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(L, Y(v)); ctx.lineTo(Rr, Y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(s, L - 6, Y(v) + 4); });
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(L, bot); ctx.lineTo(Rr, bot); ctx.stroke();
  ctx.textAlign = 'center'; const xs = W < 420 ? 100 : 50;
  for (let v = 0; v <= 400; v += xs) ctx.fillText(String(v), X(v), bot + 15);
  const curve = (f, color) => { ctx.strokeStyle = color; ctx.setLineDash([5, 5]); ctx.lineWidth = 1.4; ctx.beginPath(); for (let v = 10; v <= 400; v += 2) { if (v === 10) ctx.moveTo(X(v), Y(f(v))); else ctx.lineTo(X(v), Y(f(v))); } ctx.stroke(); ctx.setLineDash([]); };
  curve(v => v + v * d, C.cyan); curve(v => v + v * v, C.orange);
  for (const p of s5.pts.values()) {
    const cur = p.V === V && p.d === d;
    [[p.list, C.cyan], [p.mat, C.orange]].forEach(([y, col]) => { ctx.fillStyle = col; ctx.globalAlpha = cur ? 1 : 0.55; ctx.beginPath(); ctx.arc(X(p.V), Y(y), cur ? 6 : 3.5, 0, 7); ctx.fill(); if (cur) { ctx.strokeStyle = C.text; ctx.lineWidth = 1.5; ctx.stroke(); } });
  }
  ctx.restore();
  $('r5').textContent = t('s5readout', { V, E: g.E, d, scan: c.listScans, list: c.listWork, mat: c.matrixScans, mtot: c.matrixWork, ratio: fmt(c.matrixWork / c.listWork, 1) });
}

/* ---------- shared animation runner (respects reduced motion and hidden pages) ---------- */
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

function playTrace(name, st, draw, msPer) {
  if (anims[name]) { stopAnim(name); draw(); return; }
  if (st.k >= st.tr.length - 1) st.k = 0;
  const from = st.k, N = st.tr.length - 1;
  animate(name, (N - from) * msPer, p => { st.k = from + Math.round(p * (N - from)); draw(); }, () => draw());
  draw();
}

function refresh() { refreshGraphSteps(); draw4(); draw5(); }

function setup() {
  const startOpts = M.IDS.map(id => `<option value="${id}">${id}</option>`).join('');
  $('start2').innerHTML = startOpts; $('start3').innerHTML = startOpts;
  $('edge0').value = '10';
  resetRun1(); rebuild(); solve4();

  $('c0').addEventListener('click', hit0);
  $('adj0').addEventListener('click', e => { const b = e.target.closest('button[data-node]'); if (b) { G.sel = b.dataset.node; draw0(); const nb = $('adj0').querySelector(`[data-node="${G.sel}"]`); if (nb) nb.focus(); } });
  $('toggle0').addEventListener('click', () => toggleEdge(num('edge0')));
  $('resetE0').addEventListener('click', () => { G.on = M.DEFAULT_ON.slice(); graphChanged(); });

  $('markOn').addEventListener('click', () => setMark(true));
  $('markOff').addEventListener('click', () => setMark(false));
  $('round1').addEventListener('click', () => { stopAnim('s1'); s1.r = Math.min(s1.r + 1, s1.run.rounds.length - 1); draw1(); });
  $('auto1').addEventListener('click', () => {
    if (s1.r >= s1.run.rounds.length - 1) s1.r = 0;
    const from = s1.r, N = s1.run.rounds.length - 1;
    animate('s1', (N - from) * 380, p => { s1.r = from + Math.round(p * (N - from)); draw1(); });
  });
  $('again1').addEventListener('click', () => { stopAnim('s1'); s1.r = 0; draw1(); });

  $('start2').addEventListener('change', () => { stopAnim('s2'); s2.start = $('start2').value; s2.k = 0; rebuild(); draw2(); });
  $('step2b').addEventListener('click', () => { stopAnim('s2'); s2.k = Math.min(s2.k + 1, s2.tr.length - 1); draw2(); });
  $('play2').addEventListener('click', () => playTrace('s2', s2, draw2, 650));
  $('reset2').addEventListener('click', () => { stopAnim('s2'); s2.k = 0; draw2(); });

  $('start3').addEventListener('change', () => { stopAnim('s3'); s3.start = $('start3').value; s3.k = 0; rebuild(); draw3(); });
  $('step3b').addEventListener('click', () => { stopAnim('s3'); s3.k = Math.min(s3.k + 1, s3.tr.length - 1); draw3(); });
  $('play3').addEventListener('click', () => playTrace('s3', s3, draw3, 600));
  $('reset3').addEventListener('click', () => { stopAnim('s3'); s3.k = 0; draw3(); });
  $('toggle3').addEventListener('click', () => { const i = num('edge3'); $('edge0').value = String(i); toggleEdge(i); });

  $('c4').addEventListener('click', hit4);
  $('flood4').addEventListener('click', () => { const K = s4.res.layers; s4.layer = 0; draw4(); animate('s4', (K + 1) * 260, p => { s4.layer = Math.round(p * K); draw4(); }, () => { s4.layer = Infinity; draw4(); }); });
  $('dfs4').addEventListener('click', () => { s4.dfs = !s4.dfs; draw4(); });
  $('walls4').addEventListener('click', () => { stopAnim('s4'); s4.walls = new Set(M.MAZE_WALLS); solve4(); s4.layer = Infinity; draw4(); });
  $('clear4').addEventListener('click', () => { stopAnim('s4'); s4.walls = new Set(); solve4(); s4.layer = Infinity; draw4(); });

  ['v5', 'd5'].forEach(id => $(id).addEventListener('input', draw5));
  $('clear5').addEventListener('click', () => { s5.pts.clear(); draw5(); });

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
  window.refreshGraphLesson = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
