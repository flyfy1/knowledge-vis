'use strict';
// Graph traversal lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Everything the page draws or prints is computed here; tests/core.cjs pins the claims.
// Conventions: undirected simple graphs, neighbours scanned in alphabetical order (grid: fixed
// direction order), one "action" = take a node from the to-do list, or scan one adjacency entry.
(function (root) {
  // Steps 0–3: eight places on a small map. x, y are fractions of the drawing area.
  const NODES = [
    { id: 'A', x: 0.05, y: 0.5 }, { id: 'B', x: 0.29, y: 0.12 }, { id: 'C', x: 0.29, y: 0.88 },
    { id: 'D', x: 0.52, y: 0.42 }, { id: 'E', x: 0.55, y: 0.82 }, { id: 'F', x: 0.74, y: 0.12 },
    { id: 'G', x: 0.95, y: 0.48 }, { id: 'H', x: 0.77, y: 0.68 }
  ];
  const IDS = NODES.map(n => n.id);
  // Roads that can exist. The first ten are open at start; the last three start closed.
  const CANDIDATES = [['A', 'B'], ['A', 'C'], ['B', 'D'], ['B', 'F'], ['C', 'E'], ['D', 'E'], ['D', 'H'], ['E', 'H'], ['F', 'G'], ['G', 'H'], ['C', 'D'], ['D', 'F'], ['B', 'C']];
  const DEFAULT_ON = CANDIDATES.map((_, i) => i < 10);
  const TARGET = 'G';

  function adjacency(on, ids = IDS, cand = CANDIDATES) {
    const adj = {}; ids.forEach(id => { adj[id] = []; });
    cand.forEach(([a, b], i) => { if (on[i]) { adj[a].push(b); adj[b].push(a); } });
    Object.keys(adj).forEach(id => adj[id].sort());
    return adj;
  }
  const edgeCount = adj => Object.values(adj).reduce((s, l) => s + l.length, 0) / 2;

  const snap = (o) => JSON.parse(JSON.stringify(o));

  // Breadth-first: FIFO queue, a node is marked when it is first put into the queue.
  function bfsTrace(adj, start) {
    const st = { action: { type: 'init' }, container: [start], order: [start], current: null, ptr: 0, scanned: 0, takes: 0, dist: { [start]: 0 }, parent: { [start]: null }, tree: [] };
    const out = [snap(st)];
    for (;;) {
      if (st.current !== null && st.ptr < adj[st.current].length) {
        const u = st.current, v = adj[u][st.ptr++]; st.scanned++;
        const found = !(v in st.dist);
        if (found) { st.dist[v] = st.dist[u] + 1; st.parent[v] = u; st.order.push(v); st.container.push(v); st.tree.push([u, v]); }
        st.action = { type: 'scan', u, v, found };
      } else if (st.container.length) {
        st.current = st.container.shift(); st.ptr = 0; st.takes++;
        st.action = { type: 'take', u: st.current };
      } else { st.current = null; st.action = { type: 'done' }; out.push(snap(st)); break; }
      out.push(snap(st));
    }
    return out;
  }

  // Depth-first: LIFO stack. The stack holds the current path; the top scans its next neighbour,
  // goes deeper on an unmarked one, and is popped (finished) when its list is used up.
  function dfsTrace(adj, start) {
    const st = { action: { type: 'init' }, container: [start], ptrs: { [start]: 0 }, order: [start], current: start, scanned: 0, takes: 0, depth: { [start]: 0 }, parent: { [start]: null }, tree: [], finished: [] };
    st.takes = 1;
    const out = [snap(st)];
    while (st.container.length) {
      const u = st.container[st.container.length - 1];
      if (st.ptrs[u] < adj[u].length) {
        const v = adj[u][st.ptrs[u]++]; st.scanned++;
        const found = !(v in st.depth);
        if (found) { st.depth[v] = st.depth[u] + 1; st.parent[v] = u; st.ptrs[v] = 0; st.order.push(v); st.container.push(v); st.tree.push([u, v]); st.takes++; }
        st.action = { type: 'scan', u, v, found };
      } else { st.container.pop(); st.finished.push(u); st.action = { type: 'pop', u }; }
      st.current = st.container.length ? st.container[st.container.length - 1] : null;
      out.push(snap(st));
    }
    out[out.length - 1].action = { type: 'done', u: out[out.length - 1].action.u };
    return out;
  }

  function pathTo(parent, t) {
    if (!(t in parent)) return null;
    const p = []; for (let v = t; v !== null; v = parent[v]) p.unshift(v);
    return p;
  }

  // Brute force check for tests: shortest edge counts by trying every simple path.
  function bruteDist(adj, s) {
    const best = { [s]: 0 };
    (function walk(u, seen, d) {
      for (const v of adj[u]) if (!seen.has(v)) { if (!(v in best) || d + 1 < best[v]) best[v] = d + 1; seen.add(v); walk(v, seen, d + 1); seen.delete(v); }
    })(s, new Set([s]), 0);
    return best;
  }

  // Step 1: the same loop with and without "mark when put". Each round takes one node from the
  // queue and puts its neighbours in. Without marks it never stops once there is an edge, so it is cut at `cap` rounds.
  function naiveRun(adj, start, mark, cap = 24) {
    const puts = {}; Object.keys(adj).forEach(id => { puts[id] = 0; });
    const marked = new Set([start]); const q = [start]; puts[start] = 1;
    const rounds = [{ taken: null, queue: q.slice(), puts: { ...puts }, total: 1 }];
    let total = 1;
    while (q.length && rounds.length - 1 < cap) {
      const u = q.shift();
      for (const v of adj[u]) {
        if (mark && marked.has(v)) continue;
        marked.add(v); q.push(v); puts[v]++; total++;
      }
      rounds.push({ taken: u, queue: q.slice(), puts: { ...puts }, total });
    }
    return { rounds, finished: q.length === 0 };
  }

  // Step 4: a grid maze. Cells are r*COLS + c. Walls is a Set of blocked cells.
  const MAZE = { cols: 11, rows: 7, start: 0, goal: 7 * 11 - 1 };
  // Default walls (row, col).
  const MAZE_WALLS = [[0, 1], [0, 2], [0, 6], [0, 10], [1, 2], [1, 10], [2, 2], [2, 8], [2, 10], [3, 8], [4, 2], [4, 7], [5, 4], [5, 5], [5, 10], [6, 0], [6, 3], [6, 6]].map(([r, c]) => r * 11 + c);
  // Neighbour order: right, down, left, up (DFS follows it literally).
  const DIRS = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  function gridNbrs(cell, walls, m = MAZE) {
    const r = Math.floor(cell / m.cols), c = cell % m.cols, out = [];
    for (const [dr, dc] of DIRS) { const rr = r + dr, cc = c + dc; if (rr >= 0 && rr < m.rows && cc >= 0 && cc < m.cols && !walls.has(rr * m.cols + cc)) out.push(rr * m.cols + cc); }
    return out;
  }
  function gridBfs(walls, m = MAZE) {
    const dist = new Map([[m.start, 0]]), parent = new Map([[m.start, -1]]), q = [m.start];
    while (q.length) { const u = q.shift(); for (const v of gridNbrs(u, walls, m)) if (!dist.has(v)) { dist.set(v, dist.get(u) + 1); parent.set(v, u); q.push(v); } }
    return { dist, parent, path: gridPath(parent, m.goal), layers: dist.size ? Math.max(...dist.values()) : 0 };
  }
  function gridDfs(walls, m = MAZE) {
    const seen = new Set([m.start]), parent = new Map([[m.start, -1]]), stack = [[m.start, 0]];
    const visitOrder = [m.start];
    while (stack.length) {
      const top = stack[stack.length - 1], nb = gridNbrs(top[0], walls, m);
      if (top[1] < nb.length) { const v = nb[top[1]++]; if (!seen.has(v)) { seen.add(v); parent.set(v, top[0]); visitOrder.push(v); if (v === m.goal) break; stack.push([v, 0]); } }
      else stack.pop();
    }
    return { parent, path: gridPath(parent, m.goal), visited: visitOrder.length };
  }
  function gridPath(parent, goal) {
    if (!parent.has(goal)) return null;
    const p = []; for (let v = goal; v !== -1; v = parent.get(v)) p.unshift(v);
    return p;
  }

  // Step 5: a connected random graph with V nodes and average degree d (E = V·d/2):
  // a random spanning tree first, then extra random edges. Deterministic per (V, d, seed).
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function randomGraph(V, d, seed = 1) {
    const rnd = mulberry32(seed * 7919 + V * 31 + d), E = Math.round(V * d / 2), adj = Array.from({ length: V }, () => []), have = new Set();
    const add = (a, b) => { const k = a < b ? a * V + b : b * V + a; if (a === b || have.has(k)) return false; have.add(k); adj[a].push(b); adj[b].push(a); return true; };
    for (let v = 1; v < V; v++) add(v, Math.floor(rnd() * v));
    let e = V - 1; while (e < E) if (add(Math.floor(rnd() * V), Math.floor(rnd() * V))) e++;
    return { V, E, adj };
  }
  // Count the work of BFS with an adjacency list and with an adjacency matrix.
  function bfsCost(g) {
    const seen = new Uint8Array(g.V), q = [0]; seen[0] = 1; let takes = 0, listScans = 0, matrixScans = 0;
    while (q.length) {
      const u = q.shift(); takes++;
      matrixScans += g.V; // a matrix row has V cells, whether or not they are roads
      for (const v of g.adj[u]) { listScans++; if (!seen[v]) { seen[v] = 1; q.push(v); } }
    }
    return { takes, listScans, matrixScans, listWork: takes + listScans, matrixWork: takes + matrixScans };
  }
  const COST = { vMin: 20, vMax: 400, vStep: 20, dMin: 2, dMax: 8 };

  const api = { NODES, IDS, CANDIDATES, DEFAULT_ON, TARGET, adjacency, edgeCount, bfsTrace, dfsTrace, pathTo, bruteDist, naiveRun, MAZE, MAZE_WALLS, DIRS, gridNbrs, gridBfs, gridDfs, randomGraph, bfsCost, COST };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GRAPH_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
