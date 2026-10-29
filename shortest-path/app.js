/* shortest-path: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
const COL = { cyan: '#67d7f9', orange: '#f6a45b', green: '#74dfaa', red: '#e0644e', violet: '#b79cff', ink: '#eaf4f8', muted: '#a8bac4', grid: '#294052', dim: '#1b2d3c' };
const $ = id => document.getElementById(id);
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function setup(c) {
  const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
  const w = Math.max(200, Math.round(c.getBoundingClientRect().width || 300));
  const ratio = (w >= 560 && c.dataset.wide) ? +c.dataset.wide : +c.dataset.ratio;
  const h = Math.round(w * ratio);
  c.style.height = h + 'px';
  const bw = Math.round(w * dpr), bh = Math.round(h * dpr);
  if (c.width !== bw) c.width = bw;
  if (c.height !== bh) c.height = bh;
  const ctx = c.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  return { ctx, w, h, wide: w >= 560 };
}
function text(ctx, s, x, y, o) { o = o || {}; ctx.fillStyle = o.color || COL.muted; ctx.font = (o.bold ? '600 ' : '') + (o.size || 13) + 'px system-ui,sans-serif'; ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.base || 'alphabetic'; ctx.fillText(s, x, y); }
function line(ctx, x1, y1, x2, y2, col, lw, dash) { ctx.strokeStyle = col; ctx.lineWidth = lw || 1; ctx.setLineDash(dash || []); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.setLineDash([]); }
function dot(ctx, x, y, r, col) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill(); }
function slider(id, fn) { const e = $(id); e.addEventListener('input', () => { fn(+e.value); const o = $(id + 'v'); if (o) o.textContent = e.value; }); }
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const NODES = ['A', 'B', 'C', 'D', 'E', 'F'], POS = { A: [0.1, 0.5], B: [0.3, 0.12], C: [0.4, 0.78], D: [0.62, 0.15], E: [0.9, 0.5], F: [0.68, 0.82] };
const EDGES = [['A', 'B', 7], ['A', 'C', 9], ['A', 'F', 14], ['B', 'C', 10], ['B', 'D', 15], ['C', 'D', 11], ['C', 'F', 2], ['D', 'E', 6], ['E', 'F', 9]];
const adj = (edges, directed, nodes) => { const g = {}; (nodes || NODES).forEach(n => g[n] = []); edges.forEach(([a, b, w]) => { g[a].push([b, w]); if (!directed) g[b].push([a, w]); }); return g; };
const G0 = adj(EDGES, false);
/* Dijkstra: repeatedly settle the unsettled node with the smallest tentative distance, then relax its edges. Returns the full step log. */
function dijkstra(g, nodes, src) { const dist = {}, prev = {}, done = {}; nodes.forEach(n => { dist[n] = Infinity; prev[n] = null; done[n] = false; }); dist[src] = 0; const log = [{ settled: null, dist: Object.assign({}, dist), prev: Object.assign({}, prev), done: Object.assign({}, done), relaxed: [] }];
  for (let i = 0; i < nodes.length; i++) { let u = null; nodes.forEach(n => { if (!done[n] && dist[n] < Infinity && (u === null || dist[n] < dist[u])) u = n; }); if (u === null) break; done[u] = true; const rel = []; g[u].forEach(([v, w]) => { if (!done[v] && dist[u] + w < dist[v]) { dist[v] = dist[u] + w; prev[v] = u; rel.push(v); } }); log.push({ settled: u, dist: Object.assign({}, dist), prev: Object.assign({}, prev), done: Object.assign({}, done), relaxed: rel }); } return log; }
function bellmanFord(edgesDir, nodes, src) { const d = {}; nodes.forEach(n => d[n] = Infinity); d[src] = 0; for (let i = 0; i < nodes.length - 1; i++) edgesDir.forEach(([a, b, w]) => { if (d[a] + w < d[b]) d[b] = d[a] + w; }); return d; }
const pathTo = (prev, t) => { const p = []; for (let n = t; n; n = prev[n]) p.unshift(n); return p; };
const pathCost = (path, edges) => { let c = 0; for (let i = 0; i + 1 < path.length; i++) { const e = edges.find(([a, b]) => (a === path[i] && b === path[i + 1]) || (b === path[i] && a === path[i + 1])); if (!e) return null; c += e[2]; } return c; };
/* Grid map: cell cost is 1 (road), mud cost m inside a vertical band with a gap, 0 = wall. */
const GW = 14, GH = 8;
function gridCosts(m) { const c = []; for (let y = 0; y < GH; y++) { c.push([]); for (let x = 0; x < GW; x++) { let v = 1; if (x >= 5 && x <= 8 && y >= 1) v = m;  c[y].push(v); } } return c; }
/* Dijkstra or A* (Manhattan heuristic, admissible because every step costs at least 1) on the grid; counts cells settled. */
function gridSearch(costs, s, t, useA) { const key = (x, y) => y * GW + x, dist = new Array(GW * GH).fill(Infinity), prev = new Array(GW * GH).fill(-1), done = new Array(GW * GH).fill(false), h = (x, y) => useA ? Math.abs(x - t[0]) + Math.abs(y - t[1]) : 0; dist[key(...s)] = 0; let settled = 0; const order = [];
  for (;;) { let u = -1, best = Infinity; for (let i = 0; i < dist.length; i++) if (!done[i] && dist[i] < Infinity) { const f = dist[i] + h(i % GW, Math.floor(i / GW)); if (f < best) { best = f; u = i; } } if (u < 0) break; done[u] = true; settled++; order.push(u); if (u === key(...t)) break; const ux = u % GW, uy = Math.floor(u / GW); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const x = ux + dx, y = uy + dy; if (x < 0 || y < 0 || x >= GW || y >= GH || costs[y][x] === 0) return; const v = key(x, y); if (!done[v] && dist[u] + costs[y][x] < dist[v]) { dist[v] = dist[u] + costs[y][x]; prev[v] = u; } }); }
  const path = []; for (let n = key(...t); n >= 0; n = prev[n]) path.unshift(n); return { dist, prev, path, settled, cost: dist[key(...t)], done, order }; }
const NEG = { nodes: ['S', 'A', 'B', 'C'], edges: w => [['S', 'A', 1], ['S', 'B', 2], ['B', 'A', w], ['A', 'C', 1]] };
const f1 = v => v === Infinity ? '∞' : String(Math.round(v * 10) / 10);
const S = { path0: ['A'], k1: 0, run1: 0, timer1: 0, w2: -2, mud3: 6, a4: false, k5: 1, pick5: '', chk5: false, seq5: null, score5: 0, tot5: 0 };
const SRC = [0, 6], DST = [13, 6];
function graphDraw(ctx, w, h, o) { const X = n => 30 + POS[n][0] * (w - 60), Y = n => 24 + POS[n][1] * (h - 48); EDGES.forEach(([a, b, wt]) => { const on = o.pathEdges && o.pathEdges.some(([p, q]) => (p === a && q === b) || (p === b && q === a)); line(ctx, X(a), Y(a), X(b), Y(b), on ? COL.orange : COL.grid, on ? 4 : 2); text(ctx, String(wt), (X(a) + X(b)) / 2 + 6, (Y(a) + Y(b)) / 2 - 4, { size: 12, color: on ? COL.orange : COL.muted, bold: on }); });
  NODES.forEach(n => { const st = o.state ? o.state(n) : 'plain', col = st === 'done' ? COL.green : st === 'front' ? COL.orange : st === 'cur' ? COL.red : COL.ink; ctx.fillStyle = '#0d1520'; ctx.beginPath(); ctx.arc(X(n), Y(n), 19, 0, 6.2832); ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = st === 'plain' ? 2 : 4; ctx.beginPath(); ctx.arc(X(n), Y(n), 19, 0, 6.2832); ctx.stroke(); text(ctx, n, X(n), Y(n) + 5, { align: 'center', size: 14, color: col, bold: true }); if (o.label) text(ctx, o.label(n), X(n), Y(n) + 34, { align: 'center', size: 11, color: col }); }); }
function render0() { const { ctx, w, h } = setup($('cv0')), p = S.path0, pe = p.slice(1).map((n, i) => [p[i], n]), cost = pathCost(p, EDGES), best = dijkstra(G0, NODES, 'A'), bd = best[best.length - 1].dist.E; graphDraw(ctx, w, h, { pathEdges: pe, state: n => n === p[p.length - 1] ? 'cur' : p.includes(n) ? 'done' : 'plain', label: n => (n === 'A' ? t('startLab') : n === 'E' ? t('goalLab') : '') });
  NODES.forEach(n => { const b = $('p0_' + n), last = p[p.length - 1], ok = G0[last].some(([v]) => v === n) && !p.includes(n); b.disabled = !ok; }); const done = p[p.length - 1] === 'E'; $('ro0').textContent = t('s0ro', { path: p.join(' → '), cost: cost === null ? 0 : cost, best: bd, bp: pathTo(best[best.length - 1].prev, 'E').join(' → '), verdict: done ? t(cost === bd ? 'vBest' : 'vLonger', { d: cost - bd }) : t('vKeep') }); }
function render1() { const { ctx, w, h } = setup($('cv1')), log = dijkstra(G0, NODES, 'A'), k = Math.min(S.k1, log.length - 1), L = log[k]; graphDraw(ctx, w, h, { state: n => L.settled === n ? 'cur' : L.done[n] ? 'done' : L.dist[n] < Infinity ? 'front' : 'plain', label: n => f1(L.dist[n]), pathEdges: k === log.length - 1 ? pathTo(L.prev, 'E').slice(1).map((n, i, a) => [pathTo(L.prev, 'E')[i], n]) : [] });
  text(ctx, t('stepCount', { k, n: log.length - 1 }), 10, 16, { size: 12, color: COL.orange }); $('run1').textContent = t(S.run1 ? 'pause' : 'run'); const fr = NODES.filter(n => !L.done[n] && L.dist[n] < Infinity).map(n => n + '=' + f1(L.dist[n])).join(', ') || '—';
  $('ro1').textContent = k === 0 ? t('s1ro0') : t('s1ro', { u: L.settled, d: f1(L.dist[L.settled]), front: fr, rel: L.relaxed.length ? L.relaxed.join(', ') : t('none'), done: NODES.filter(n => L.done[n]).join(', ') }); }
function render2() { const { ctx, w, h } = setup($('cv2')), wv = S.w2, edges = NEG.edges(wv), g = adj(edges, true, NEG.nodes), log = dijkstra(g, NEG.nodes, 'S'), dj = log[log.length - 1].dist, bf = bellmanFord(edges, NEG.nodes, 'S'), pos = { S: [0.1, 0.5], A: [0.4, 0.2], B: [0.4, 0.8], C: [0.85, 0.2] }; const X = n => 40 + pos[n][0] * (w - 80), Y = n => 30 + pos[n][1] * (h - 110);
  const arr = (a, b, wt, col) => { const x1 = X(a), y1 = Y(a), x2 = X(b), y2 = Y(b), an = Math.atan2(y2 - y1, x2 - x1), sx = x1 + 22 * Math.cos(an), sy = y1 + 22 * Math.sin(an), ex = x2 - 22 * Math.cos(an), ey = y2 - 22 * Math.sin(an); line(ctx, sx, sy, ex, ey, col, 3); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - 10 * Math.cos(an - 0.4), ey - 10 * Math.sin(an - 0.4)); ctx.lineTo(ex - 10 * Math.cos(an + 0.4), ey - 10 * Math.sin(an + 0.4)); ctx.closePath(); ctx.fill(); text(ctx, String(wt), (sx + ex) / 2 + 8, (sy + ey) / 2 - 6, { size: 12, color: col, bold: true }); };
  edges.forEach(([a, b, wt]) => arr(a, b, wt, wt < 0 ? COL.red : COL.muted)); NEG.nodes.forEach(n => { ctx.fillStyle = '#0d1520'; ctx.beginPath(); ctx.arc(X(n), Y(n), 20, 0, 6.2832); ctx.fill(); const bad = dj[n] !== bf[n]; ctx.strokeStyle = bad ? COL.red : COL.green; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(X(n), Y(n), 20, 0, 6.2832); ctx.stroke(); text(ctx, n, X(n), Y(n) + 5, { align: 'center', size: 14, color: COL.ink, bold: true }); });
  const y0 = h - 70; text(ctx, t('rowDj') + ': ' + NEG.nodes.map(n => n + '=' + f1(dj[n])).join('  '), 14, y0, { size: 12, color: COL.cyan }); text(ctx, t('rowBf') + ': ' + NEG.nodes.map(n => n + '=' + f1(bf[n])).join('  '), 14, y0 + 20, { size: 12, color: COL.green }); const wrong = NEG.nodes.some(n => dj[n] !== bf[n]); text(ctx, t(wrong ? 'wrongTag' : 'rightTag'), 14, y0 + 42, { size: 13, color: wrong ? COL.red : COL.green, bold: true });
  $('w2v').textContent = wv; $('ro2').textContent = t('s2ro', { w: wv, dj: f1(dj.C), bf: f1(bf.C), verdict: t(wrong ? 'vWrong' : 'vRight'), crit: -1 }); }
function drawGrid(ctx, w, h, res, costs, useA) { const cw = Math.min((w - 20) / GW, (h - 40) / GH), ox = (w - cw * GW) / 2, oy = 14, maxd = Math.max(...res.dist.filter(v => v < Infinity), 1); for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) { const c = costs[y][x], i = y * GW + x; if (c === 0) { ctx.fillStyle = '#05080c'; } else if (res.done[i]) { const f = Math.min(1, res.dist[i] / maxd); ctx.fillStyle = 'rgba(103,215,249,' + (0.18 + 0.55 * (1 - f)) + ')'; } else ctx.fillStyle = c > 1 ? 'rgba(150,100,60,' + (0.15 + 0.07 * Math.min(c, 9)) + ')' : '#101d2a'; ctx.fillRect(ox + x * cw + 1, oy + y * cw + 1, cw - 2, cw - 2); if (c > 1 && !res.done[i]) text(ctx, String(c), ox + x * cw + cw / 2, oy + y * cw + cw / 2 + 4, { align: 'center', size: Math.min(11, cw * 0.4), color: COL.muted }); }
  ctx.strokeStyle = COL.orange; ctx.lineWidth = 3; ctx.beginPath(); res.path.forEach((n, i) => { const px = ox + (n % GW) * cw + cw / 2, py = oy + Math.floor(n / GW) * cw + cw / 2; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }); ctx.stroke(); [[SRC, COL.green, 'S'], [DST, COL.red, 'T']].forEach(([p, col, lab]) => { dot(ctx, ox + p[0] * cw + cw / 2, oy + p[1] * cw + cw / 2, cw * 0.32, col); text(ctx, lab, ox + p[0] * cw + cw / 2, oy + p[1] * cw + cw / 2 + 4, { align: 'center', size: 11, color: '#0a0e14', bold: true }); }); }
function render3() { const { ctx, w, h } = setup($('cv3')), costs = gridCosts(S.mud3), res = gridSearch(costs, SRC, DST, false), base = gridSearch(gridCosts(1), SRC, DST, false); drawGrid(ctx, w, h, res, costs, false); text(ctx, t('legGrid'), 10, h - 6, { size: 11, color: COL.muted }); $('mud3v').textContent = S.mud3; $('mud4v').textContent = S.mud3; const through = res.path.some(n => costs[Math.floor(n / GW)][n % GW] > 1);
  $('ro3').textContent = t('s3ro', { m: S.mud3, cost: res.cost, len: res.path.length - 1, mudCells: res.path.filter(n => costs[Math.floor(n / GW)][n % GW] > 1).length, free: base.cost, kind: t(through ? 'throughMud' : 'aroundMud') }); }
function render4() { const { ctx, w, h } = setup($('cv4')), costs = gridCosts(S.mud3), dj = gridSearch(costs, SRC, DST, false), as = gridSearch(costs, SRC, DST, true), res = S.a4 ? as : dj; drawGrid(ctx, w, h, res, costs, S.a4); $('a4d').classList.toggle('active', !S.a4); $('a4a').classList.toggle('active', S.a4); text(ctx, t(S.a4 ? 'nameA' : 'nameD') + ': ' + t('explored', { n: res.settled }), 10, h - 6, { size: 12, color: COL.orange });
  $('ro4').textContent = t('s4ro', { algo: t(S.a4 ? 'nameA' : 'nameD'), n: res.settled, nd: dj.settled, na: as.settled, cd: dj.cost, ca: as.cost, same: t(dj.cost === as.cost ? 'yes' : 'no'), tot: GW * GH }); }
function seqNext(k) { const log = dijkstra(G0, NODES, 'A'); return log[k + 1] ? log[k + 1].settled : null; }
function render5() { const { ctx, w, h } = setup($('cv5')), log = dijkstra(G0, NODES, 'A'), k = Math.min(S.k5, log.length - 2), L = log[k], next = log[k + 1].settled; graphDraw(ctx, w, h, { state: n => L.done[n] ? 'done' : L.dist[n] < Infinity ? 'front' : 'plain', label: n => f1(L.dist[n]) });
  NODES.forEach(n => { const b = $('g5_' + n); b.disabled = L.done[n]; b.classList.toggle('active', S.pick5 === n); }); const ok = S.pick5 === next; $('ro5').textContent = !S.chk5 || !S.pick5 ? t('s5ro', { k, score: S.score5, tot: S.tot5 }) : t(ok ? 's5roOk' : 's5roNo', { pick: S.pick5, next, d: f1(L.dist[next]), score: S.score5, tot: S.tot5 }); }
function runTick() { if (!S.run1) return; const n = dijkstra(G0, NODES, 'A').length - 1; if (S.k1 >= n) { S.run1 = 0; render1(); return; } S.k1++; render1(); S.timer1 = setTimeout(runTick, reduceMotion() ? 0 : 800); }
function onHide() { S.run1 = 0; clearTimeout(S.timer1); render1(); }
function wire() {
  NODES.forEach(n => $('p0_' + n).addEventListener('click', () => { S.path0.push(n); render0(); })); $('rs0').addEventListener('click', () => { S.path0 = ['A']; render0(); }); $('bk0').addEventListener('click', () => { if (S.path0.length > 1) S.path0.pop(); render0(); });
  $('st1').addEventListener('click', () => { S.run1 = 0; clearTimeout(S.timer1); S.k1 = Math.min(S.k1 + 1, dijkstra(G0, NODES, 'A').length - 1); render1(); }); $('run1').addEventListener('click', () => { if (S.run1) { S.run1 = 0; clearTimeout(S.timer1); render1(); return; } S.run1 = 1; runTick(); }); $('rs1').addEventListener('click', () => { S.run1 = 0; clearTimeout(S.timer1); S.k1 = 0; render1(); });
  slider('w2', v => { S.w2 = v; render2(); }); ['mud3', 'mud4'].forEach(id => slider(id, v => { S.mud3 = v; $('mud3').value = v; $('mud4').value = v; $('mud3v').textContent = v; $('mud4v').textContent = v; render3(); render4(); })); $('a4d').addEventListener('click', () => { S.a4 = false; render4(); }); $('a4a').addEventListener('click', () => { S.a4 = true; render4(); });
  NODES.forEach(n => $('g5_' + n).addEventListener('click', () => { S.pick5 = n; S.chk5 = false; render5(); })); $('chk5').addEventListener('click', () => { if (!S.pick5) return; S.chk5 = true; S.tot5++; if (S.pick5 === seqNext(Math.min(S.k5, dijkstra(G0, NODES, 'A').length - 2))) S.score5++; render5(); }); $('nx5').addEventListener('click', () => { const n = dijkstra(G0, NODES, 'A').length - 2; S.k5 = S.k5 >= n ? 1 : S.k5 + 1; S.pick5 = ''; S.chk5 = false; render5(); }); $('rs5').addEventListener('click', () => { S.k5 = 1; S.pick5 = ''; S.chk5 = false; S.score5 = 0; S.tot5 = 0; render5(); });
}

const RENDERS = [typeof render0 === 'function' && render0, typeof render1 === 'function' && render1, typeof render2 === 'function' && render2, typeof render3 === 'function' && render3, typeof render4 === 'function' && render4, typeof render5 === 'function' && render5].filter(Boolean);
function renderAll() { RENDERS.forEach(f => f()); }
function boot() {
  initLang();
  document.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
  wire();
  window.addEventListener('langchange', renderAll);
  let raf = 0; window.addEventListener('resize', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(renderAll); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && typeof onHide === 'function') onHide(); });
  const links = [...document.querySelectorAll('.step-nav a')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) { const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id)); }), { rootMargin: '-30% 0px -60%' }); steps.forEach(s => io.observe(s)); }
  renderAll();
}
if (typeof document !== 'undefined' && document.getElementById('ro0')) boot();
if (typeof module !== 'undefined') module.exports = { NODES, EDGES, G0, adj, dijkstra, bellmanFord, pathTo, pathCost, gridCosts, gridSearch, NEG, SRC, DST, GW, GH };
