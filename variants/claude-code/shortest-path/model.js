'use strict';
// Shortest-path lesson model (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pure functions shared by the page and tests/core.cjs: a small road graph (steps 0, 1, 5), a directed
// graph with one adjustable edge (step 2) and a weighted grid map (steps 3, 4).
(function (root) {

/* ---------- the road graph: 8 places, undirected, non-negative weights ---------- */
const NODES = ['S', 'A', 'B', 'C', 'D', 'E', 'F', 'T'];
// positions in a unit box (x right, y down); laid out so edge labels never sit on a node
const POS = { S: [0.05, 0.5], A: [0.3, 0.14], B: [0.3, 0.86], C: [0.47, 0.5], D: [0.68, 0.14], E: [0.68, 0.86], F: [0.8, 0.5], T: [0.96, 0.5] };
const EDGES = [['S', 'A', 2], ['S', 'B', 6], ['A', 'C', 5], ['A', 'D', 10], ['B', 'C', 2], ['B', 'E', 5], ['C', 'E', 3], ['C', 'F', 7], ['D', 'F', 1], ['D', 'T', 6], ['E', 'F', 2], ['F', 'T', 4]];
function adjacency(edges, directed = false) {
  const adj = {};
  edges.forEach(([u, v, w]) => { (adj[u] = adj[u] || []).push([v, w]); if (!directed) (adj[v] = adj[v] || []).push([u, w]); });
  Object.values(adj).forEach(list => list.sort((a, b) => (a[0] < b[0] ? -1 : 1)));
  return adj;
}
const ADJ = adjacency(EDGES);
const weight = (u, v) => { const e = (ADJ[u] || []).find(x => x[0] === v); return e ? e[1] : null; };

// Every simple path from s to t (used in step 0 to show how many routes brute force would face).
function allPaths(s, t, adj = ADJ) {
  const out = [], seen = new Set([s]);
  (function walk(u, path, cost) {
    if (u === t) { out.push({ path: path.slice(), cost }); return; }
    for (const [v, w] of adj[u] || []) if (!seen.has(v)) { seen.add(v); path.push(v); walk(v, path, cost + w); path.pop(); seen.delete(v); }
  })(s, [s], 0);
  return out.sort((a, b) => a.cost - b.cost || a.path.length - b.path.length);
}
const pathCost = path => { let c = 0; for (let i = 1; i < path.length; i++) { const w = weight(path[i - 1], path[i]); if (w === null) return null; c += w; } return c; };

// Dijkstra as a list of snapshots: snapshot k is the state after k nodes are settled.
// Ties in tentative distance are broken alphabetically (so the trace is deterministic).
function dijkstraTrace(s, nodes = NODES, adj = ADJ) {
  const dist = {}, pred = {}, done = {};
  nodes.forEach(n => { dist[n] = Infinity; pred[n] = null; done[n] = false; });
  dist[s] = 0;
  const snap = (settled, relaxed) => ({ dist: { ...dist }, pred: { ...pred }, done: { ...done }, settled, relaxed, order: nodes.filter(n => done[n]) });
  const steps = [snap(null, [])], order = [];
  for (;;) {
    let u = null;
    nodes.forEach(n => { if (!done[n] && dist[n] < Infinity && (u === null || dist[n] < dist[u])) u = n; });
    if (u === null) break;
    done[u] = true; order.push(u);
    const relaxed = [];
    for (const [v, w] of adj[u] || []) {
      if (done[v]) continue;
      if (dist[u] + w < dist[v]) { relaxed.push({ v, from: dist[v], to: dist[u] + w }); dist[v] = dist[u] + w; pred[v] = u; }
    }
    const sn = snap(u, relaxed); sn.order = order.slice(); steps.push(sn);
  }
  return steps;
}
const pathTo = (pred, t) => { const p = []; for (let v = t; v; v = pred[v]) p.unshift(v); return p; };
// Nodes whose tentative distance is the minimum among the unsettled ones (step 5 accepts any of them).
function nextCandidates(state, nodes = NODES) {
  let best = Infinity; nodes.forEach(n => { if (!state.done[n] && state.dist[n] < best) best = state.dist[n]; });
  return best === Infinity ? [] : nodes.filter(n => !state.done[n] && state.dist[n] === best);
}
// One settle step from an arbitrary state (step 5: the learner chooses u).
function settle(state, u, adj = ADJ) {
  const dist = { ...state.dist }, pred = { ...state.pred }, done = { ...state.done }; done[u] = true;
  const relaxed = [];
  for (const [v, w] of adj[u] || []) if (!done[v] && dist[u] + w < dist[v]) { relaxed.push({ v, from: dist[v], to: dist[u] + w }); dist[v] = dist[u] + w; pred[v] = u; }
  return { dist, pred, done, settled: u, relaxed };
}

/* ---------- step 2: one negative edge ---------- */
const NEG_NODES = ['S', 'A', 'B', 'T'];
const NEG_POS = { S: [0.08, 0.5], A: [0.5, 0.16], B: [0.5, 0.84], T: [0.92, 0.5] };
const negEdges = w => [['S', 'A', 2], ['S', 'B', 4], ['B', 'A', w], ['A', 'T', 3]];
function bellmanFord(nodes, edges, s) {
  const dist = {}; nodes.forEach(n => (dist[n] = Infinity)); dist[s] = 0;
  let rounds = 0;
  for (let i = 0; i < nodes.length - 1; i++) {
    let changed = false; rounds++;
    for (const [u, v, w] of edges) if (dist[u] + w < dist[v]) { dist[v] = dist[u] + w; changed = true; }
    if (!changed) break;
  }
  return { dist, rounds };
}
function negCase(w) {
  const edges = negEdges(w), adj = adjacency(edges, true);
  const tr = dijkstraTrace('S', NEG_NODES, adj), last = tr[tr.length - 1];
  const bf = bellmanFord(NEG_NODES, edges, 'S');
  // the moment the B→A edge is looked at, A is already settled; would it have helped?
  const late = last.dist.B + w < last.dist.A;
  return { w, dij: last.dist, bf: bf.dist, order: last.order, late, agree: NEG_NODES.every(n => last.dist[n] === bf.dist[n]) };
}

/* ---------- steps 3–4: a grid map ---------- */
const GW = 16, GH = 10, START = [1, 5], GOAL = [14, 5];
// cell kinds: 0 open (cost 1), 1 mud (cost m), 2 rock (impassable)
const GRID = (() => {
  const g = [];
  for (let y = 0; y < GH; y++) { const row = []; for (let x = 0; x < GW; x++) row.push(0); g.push(row); }
  for (let y = 2; y <= 8; y++) for (let x = 5; x <= 9; x++) g[y][x] = 1;     // the mud field
  for (let y = 0; y <= 3; y++) g[y][12] = 2; for (let y = 7; y <= 9; y++) g[y][12] = 2; // a gap in a rock wall
  g[0][3] = 2; g[1][3] = 2; g[9][3] = 2;                                   // a few boulders
  return g;
})();
const cellCost = (kind, mud) => (kind === 1 ? mud : 1);
// Weighted best-first search: priority = g + w·h (w = 0 is Dijkstra, w = 1 is A*). Entering a cell costs its cost.
function gridSearch(mud, w = 0) {
  const N = GW * GH, id = (x, y) => y * GW + x, g = new Array(N).fill(Infinity), done = new Uint8Array(N), pred = new Int32Array(N).fill(-1);
  const h = i => Math.abs((i % GW) - GOAL[0]) + Math.abs(Math.floor(i / GW) - GOAL[1]);
  const s = id(...START), t = id(...GOAL); g[s] = 0;
  const open = new Set([s]), order = [];
  let seq = 0; const born = new Int32Array(N); born[s] = seq++;
  while (open.size) {
    let u = -1, best = Infinity;
    for (const i of open) { const f = g[i] + w * h(i); if (f < best - 1e-12 || (Math.abs(f - best) <= 1e-12 && (h(i) < h(u) || (h(i) === h(u) && born[i] < born[u])))) { best = f; u = i; } }
    open.delete(u); done[u] = 1; order.push(u);
    if (u === t) break;
    const ux = u % GW, uy = Math.floor(u / GW);
    for (const [dx, dy] of [[1, 0], [0, -1], [-1, 0], [0, 1]]) {
      const x = ux + dx, y = uy + dy; if (x < 0 || y < 0 || x >= GW || y >= GH) continue;
      const k = GRID[y][x]; if (k === 2) continue;
      const v = id(x, y); if (done[v]) continue;
      const ng = g[u] + cellCost(k, mud);
      if (ng < g[v]) { g[v] = ng; pred[v] = u; if (!open.has(v)) { open.add(v); born[v] = seq++; } }
    }
  }
  const path = []; for (let v = t; v !== -1; v = pred[v]) path.unshift(v);
  const mudCells = path.filter(i => GRID[Math.floor(i / GW)][i % GW] === 1).length;
  return { order, settled: order.length, cost: g[t], path, mudCells, g };
}
// Best route that must cross at least one mud square / must avoid mud entirely (for the step-3 note).
function gridCostVia(mud, needMud) {
  const N = GW * GH, S = GW * GH * 2, dist = new Array(S).fill(Infinity), done = new Uint8Array(S);
  const s = START[1] * GW + START[0], t = GOAL[1] * GW + GOAL[0];
  dist[s] = 0;
  for (;;) {
    let u = -1; for (let i = 0; i < S; i++) if (!done[i] && dist[i] < Infinity && (u < 0 || dist[i] < dist[u])) u = i;
    if (u < 0) break; done[u] = 1;
    const used = u >= N ? 1 : 0, c = u % N, ux = c % GW, uy = Math.floor(c / GW);
    for (const [dx, dy] of [[1, 0], [0, -1], [-1, 0], [0, 1]]) {
      const x = ux + dx, y = uy + dy; if (x < 0 || y < 0 || x >= GW || y >= GH) continue;
      const k = GRID[y][x]; if (k === 2 || (!needMud && k === 1)) continue;
      const v = (used || k === 1 ? N : 0) + y * GW + x, nd = dist[u] + cellCost(k, mud);
      if (nd < dist[v]) dist[v] = nd;
    }
  }
  return needMud ? dist[N + t] : dist[t];
}
// Always take the cheapest road to a node not yet visited (step 0 comparison).
function greedyWalk(s = 'S', t = 'T') {
  const path = [s], seen = new Set([s]); let u = s, cost = 0;
  while (u !== t) {
    const nxt = (ADJ[u] || []).filter(([v]) => !seen.has(v)).sort((a, b) => a[1] - b[1] || (a[0] < b[0] ? -1 : 1))[0];
    if (!nxt) return { path, cost, stuck: true };
    u = nxt[0]; cost += nxt[1]; seen.add(u); path.push(u);
  }
  return { path, cost, stuck: false };
}
// Exact optimum by plain Dijkstra (reference for tests).
const gridOptimum = mud => gridSearch(mud, 0).cost;

const api = { NODES, POS, EDGES, ADJ, adjacency, weight, allPaths, pathCost, dijkstraTrace, pathTo, nextCandidates, settle, NEG_NODES, NEG_POS, negEdges, bellmanFord, negCase, GW, GH, START, GOAL, GRID, cellCost, gridSearch, gridOptimum, gridCostVia, greedyWalk };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
if (typeof window !== 'undefined') root.SP_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
