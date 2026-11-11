'use strict';
(function (root) {
  // Node positions are diagram coordinates only (viewBox 400 x 230).
  const LAYOUT7 = [[40, 55], [130, 115], [40, 180], [220, 115], [295, 50], [295, 180], [370, 180]];
  // Step 1 / step 2 network: two loops joined by 1–3, plus a tail 5–6.
  const MAIN = {n: 7, pos: LAYOUT7, edges: [[0, 1], [1, 2], [2, 0], [1, 3], [3, 4], [4, 5], [5, 3], [5, 6]]};
  // Step 3 presets. `extra` lists cables the reader may add; they start absent.
  const presets = [
    {key: 'main', n: 7, pos: LAYOUT7, edges: MAIN.edges, extra: [[2, 3], [4, 6], [0, 6]]},
    {key: 'path', n: 4, pos: [[40, 115], [150, 115], [260, 115], [370, 115]], edges: [[0, 1], [1, 2], [2, 3]], extra: [[0, 2], [1, 3], [0, 3]]},
    {key: 'square', n: 6, pos: [[40, 50], [160, 50], [160, 180], [40, 180], [270, 115], [370, 115]], edges: [[0, 1], [1, 2], [2, 3], [3, 0], [1, 3], [2, 4], [4, 5]], extra: [[1, 4], [2, 5]]}
  ];
  // Step 4 prediction graph: a "bowtie" whose middle server is shared by two loops.
  const BOWTIE = {n: 5, pos: [[40, 50], [40, 180], [200, 115], [360, 50], [360, 180]], edges: [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 2]]};

  // Components of the graph after ignoring the cable with index `skip` (-1: ignore none).
  function components(n, edges, skip = -1) {
    const comp = Array(n).fill(-1); let count = 0; let visits = 0;
    const adj = Array.from({length: n}, () => []);
    edges.forEach(([a, b], id) => { if (id !== skip) { adj[a].push(b); adj[b].push(a); } });
    for (let s = 0; s < n; s++) {
      if (comp[s] !== -1) continue;
      comp[s] = count; const stack = [s];
      while (stack.length) {
        const u = stack.pop(); visits++;
        for (const v of adj[u]) { visits++; if (comp[v] === -1) { comp[v] = count; stack.push(v); } }
      }
      count++;
    }
    return {comp, count, visits};
  }

  // Brute force: cut each cable, search again, and see whether the number of pieces grows.
  function cutTest(n, edges) {
    const base = components(n, edges).count;
    return edges.map((e, id) => {
      const after = components(n, edges, id);
      return {id, edge: e, critical: after.count > base, comp: after.comp, visits: after.visits};
    });
  }

  // One DFS with arrival times (tin) and low values. Every frame is a deep snapshot.
  function trace(n, edges) {
    const adj = Array.from({length: n}, () => []);
    edges.forEach(([a, b], id) => { adj[a].push([b, id]); adj[b].push([a, id]); });
    const tin = Array(n).fill(-1), low = Array(n).fill(-1), parentEdge = Array(n).fill(-1), parent = Array(n).fill(-1);
    const kind = Array(edges.length).fill('unseen'); // unseen | tree | back
    const bridges = [], frames = [];
    let timer = 0, current = null;
    const snap = (event) => frames.push({event, tin: tin.slice(), low: low.slice(), kind: kind.slice(), bridges: bridges.map(b => b.slice()), current});
    snap({type: 'start'});
    for (let root = 0; root < n; root++) {
      if (tin[root] !== -1) continue;
      tin[root] = low[root] = timer++; current = root;
      snap({type: 'root', u: root, t: tin[root]});
      const stack = [[root, 0]];
      while (stack.length) {
        const top = stack[stack.length - 1], u = top[0];
        if (top[1] === adj[u].length) {
          stack.pop();
          const p = parent[u];
          if (p !== -1) {
            const before = low[p];
            low[p] = Math.min(low[p], low[u]);
            const critical = low[u] > tin[p];
            if (critical) bridges.push([p, u]);
            current = p;
            snap({type: 'return', u: p, v: u, edge: parentEdge[u], before, after: low[p], lowChild: low[u], tinParent: tin[p], critical});
          }
          continue;
        }
        const [v, id] = adj[u][top[1]++];
        if (id === parentEdge[u]) { current = u; snap({type: 'skipParent', u, v, edge: id}); continue; }
        if (tin[v] !== -1) {
          if (kind[id] === 'back') continue; // the same leftover cable seen again from its upper end
          kind[id] = 'back';
          const before = low[u]; low[u] = Math.min(low[u], tin[v]); current = u;
          snap({type: 'back', u, v, edge: id, before, after: low[u], tinV: tin[v]});
          continue;
        }
        kind[id] = 'tree'; parent[v] = u; parentEdge[v] = id;
        tin[v] = low[v] = timer++; current = v;
        stack.push([v, 0]);
        snap({type: 'tree', u, v, edge: id, t: tin[v]});
      }
    }
    current = null;
    snap({type: 'done'});
    return frames;
  }

  // Shortest detour between the two ends of cable `id` that does not use that cable (null if none).
  function detour(n, edges, id) {
    const [s, goal] = edges[id], adj = Array.from({length: n}, () => []);
    edges.forEach(([a, b], j) => { if (j !== id) { adj[a].push(b); adj[b].push(a); } });
    const prev = Array(n).fill(-2); prev[s] = -1; const queue = [s];
    for (let h = 0; h < queue.length; h++) {
      const u = queue[h];
      if (u === goal) break;
      for (const v of adj[u]) if (prev[v] === -2) { prev[v] = u; queue.push(v); }
    }
    if (prev[goal] === -2) return null;
    const path = []; for (let u = goal; u !== -1; u = prev[u]) path.push(u);
    return path.reverse();
  }

  function bridgesOf(n, edges) {
    return trace(n, edges).at(-1).bridges.map(([a, b]) => a < b ? [a, b] : [b, a]).sort((x, y) => x[0] - y[0] || x[1] - y[1]);
  }

  const api = {MAIN, presets, BOWTIE, components, cutTest, detour, trace, bridgesOf};
  root.BridgeCore = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window === 'undefined' ? globalThis : window);
