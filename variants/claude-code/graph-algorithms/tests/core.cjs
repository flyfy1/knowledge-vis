'use strict';
// Graph traversal (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const eq = (a, b, m) => { assert.deepEqual(a, b, m); checks++; };

// ---- default graph (tagline: 8 places, 10 roads) ----
const A0 = M.adjacency(M.DEFAULT_ON);
eq(M.IDS.length, 8, 'V = 8'); eq(M.edgeCount(A0), 10, 'E = 10');
eq(A0.D, ['B', 'E', 'H'], 'step 0 default selection D: B E H, degree 3');

// ---- every subset of the 13 candidate roads (8192 graphs), every start ----
let subsets = 0, dfsLonger = 0;
for (let mask = 0; mask < (1 << M.CANDIDATES.length); mask++) {
  const on = M.CANDIDATES.map((_, i) => !!(mask >> i & 1)), adj = M.adjacency(on), E = M.edgeCount(adj);
  // handshake: lists hold 2E entries
  ok(M.IDS.reduce((s, id) => s + adj[id].length, 0) === 2 * E, 'sum of list lengths = 2E');
  if (mask % 7 !== 0) continue; // traversal checks on a 1/7 sample (1171 graphs) × 8 starts
  subsets++;
  for (const s of M.IDS) {
    const b = M.bfsTrace(adj, s), B = b[b.length - 1], d = M.dfsTrace(adj, s), D = d[d.length - 1], brute = M.bruteDist(adj, s);
    // BFS distance at first discovery = true shortest edge count; same reachable set as DFS
    eq(B.dist, brute, 'BFS d = brute-force shortest');
    eq([...B.order].sort(), Object.keys(brute).sort(), 'BFS reaches exactly the reachable nodes, once each');
    eq([...D.order].sort(), Object.keys(brute).sort(), 'DFS reaches exactly the reachable nodes, once each');
    // V + 2E accounting on the reachable part
    const reach = Object.keys(brute), Er = reach.reduce((x, id) => x + adj[id].length, 0) / 2;
    ok(B.takes === reach.length && B.scanned === 2 * Er, 'BFS: V takes + 2E scans');
    ok(D.takes === reach.length && D.scanned === 2 * Er, 'DFS: V pushes + 2E scans');
    // queue holds at most two consecutive layers, in non-decreasing d
    for (const st of b) { const ds = st.container.map(v => st.dist[v]); ok(ds.every((x, i) => i === 0 || x >= ds[i - 1]) && (ds.length === 0 || ds[ds.length - 1] - ds[0] <= 1), 'queue layers'); }
    // the DFS stack is always a tree path from the start
    for (const st of d) st.container.forEach((v, i) => ok(i === 0 ? v === s : st.parent[v] === st.container[i - 1], 'stack = current route'));
    // DFS tree routes are never shorter than BFS distances
    for (const v of reach) { const p = M.pathTo(D.parent, v); ok(p.length - 1 >= B.dist[v], 'DFS route ≥ shortest'); if (p.length - 1 > B.dist[v]) dfsLonger++; }
    // step 1: with marks, each reachable node is put in exactly once and the loop ends
    const nm = M.naiveRun(adj, s, true), last = nm.rounds[nm.rounds.length - 1];
    ok(nm.finished && reach.every(v => last.puts[v] === 1) && last.total === reach.length, 'marks: once each');
    // without marks it never finishes when the start has an edge
    const nn = M.naiveRun(adj, s, false);
    ok(nn.finished === (adj[s].length === 0), 'no marks: endless iff start has a neighbour');
  }
}
ok(dfsLonger > 0, 'DFS routes are sometimes longer');

// ---- default walk-through numbers used on the page ----
const b0 = M.bfsTrace(A0, 'A'), B0 = b0[b0.length - 1];
eq(B0.order.join(''), 'ABCDFEHG', 'BFS order from A');
eq(B0.dist, { A: 0, B: 1, C: 1, D: 2, F: 2, E: 2, H: 3, G: 3 }, 'BFS distances from A');
eq(b0.length - 1, 29, 'BFS: 8 takes + 20 reads + done = 29 actions'); eq(B0.scanned, 20, 'reads 2E = 20 entries');
const d0 = M.dfsTrace(A0, 'A'), D0 = d0[d0.length - 1];
eq(D0.order.join(''), 'ABDECHGF', 'DFS order from A');
eq(M.pathTo(D0.parent, 'G'), ['A', 'B', 'D', 'E', 'H', 'G'], 'DFS tree route A→G has 5 edges vs BFS 3');
eq(Math.max(...d0.map(s => s.container.length)), 7, 'DFS stack reaches depth 7');
eq(Math.max(...b0.map(s => s.container.length)), 3, 'BFS queue never above 3');
// step 1 default: no marks capped at 24 rounds with a growing queue
const n0 = M.naiveRun(A0, 'A', false), nl = n0.rounds[n0.rounds.length - 1];
ok(!n0.finished && n0.rounds.length - 1 === 24 && nl.queue.length === 37 && nl.total === 61, 'no-mark demo numbers');
ok(n0.rounds[12].queue.length < nl.queue.length, 'queue keeps growing');
// hint: opening C–D (index 10) changes the DFS order
const onCD = M.DEFAULT_ON.slice(); onCD[10] = true;
ok(M.dfsTrace(M.adjacency(onCD), 'A').pop().order.join('') !== 'ABDECHGF', 'C–D changes DFS');

// ---- step 4: maze ----
const W0 = new Set(M.MAZE_WALLS), g = M.gridBfs(W0), gd = M.gridDfs(W0);
eq(g.path.length - 1, 16, 'default maze shortest = 16'); eq(gd.path.length - 1, 30, 'DFS route = 30');
eq(g.dist.size, 57, 'flood reaches 57 squares'); eq(Math.max(...g.dist.values()), 17, 'farthest square 17');
eq(gd.visited, 31, 'DFS saw 31 squares');
// BFS grid distance = brute-force Bellman relaxation, and path is valid; for random walls too
let rs = 3; const rnd = () => { rs = (rs * 16807) % 2147483647; return rs / 2147483647; };
for (let trial = 0; trial < 300; trial++) {
  const w = new Set(); for (let k = 1; k < 76; k++) if (rnd() < 0.3) w.add(k);
  const r = M.gridBfs(w), dd = new Map([[0, 0]]);
  for (let it = 0; it < 80; it++) for (const [u, du] of [...dd]) for (const v of M.gridNbrs(u, w)) if (!dd.has(v) || dd.get(v) > du + 1) dd.set(v, du + 1);
  eq([...r.dist.entries()].sort((a, b) => a[0] - b[0]), [...dd.entries()].sort((a, b) => a[0] - b[0]), 'grid BFS = relaxation');
  const p = r.path, q = M.gridDfs(w).path;
  ok((p === null) === (q === null), 'BFS and DFS agree on reachability');
  if (p) { ok(p.length - 1 === r.dist.get(M.MAZE.goal), 'path length = d(T)'); ok(q.length >= p.length, 'DFS route ≥ shortest'); for (let i = 1; i < p.length; i++) ok(M.gridNbrs(p[i - 1], w).includes(p[i]), 'path steps are edges'); }
}
eq(M.gridBfs(new Set()).path.length - 1, 16, 'no walls: shortest is still 6 + 10 = 16');

// ---- step 5: work count V + 2E vs V + V² on every slider setting ----
for (let V = M.COST.vMin; V <= M.COST.vMax; V += M.COST.vStep) for (let d = M.COST.dMin; d <= M.COST.dMax; d++) {
  const gr = M.randomGraph(V, d), c = M.bfsCost(gr);
  ok(gr.E === V * d / 2, 'E = V·d/2');
  ok(gr.adj.reduce((s, l) => s + l.length, 0) === 2 * gr.E, 'simple graph, no duplicates');
  ok(c.takes === V, 'connected: every node taken once');
  ok(c.listWork === V + 2 * gr.E && c.listWork === V + V * d, 'list work = V + 2E');
  ok(c.matrixWork === V + V * V, 'matrix work = V + V²');
}
const c100 = M.bfsCost(M.randomGraph(100, 2));
ok(c100.listWork === 300 && c100.matrixWork === 10100, 'default V=100,d=2');
ok(M.bfsCost(M.randomGraph(400, 2)).matrixWork / 1200 > 133, 'ratio at V=400,d=2 ≈ 133.7');
ok(M.bfsCost(M.randomGraph(20, 8)).matrixWork / 180 < 2.5, 'ratio small at V=20,d=8');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const k of zk) ok(!/左图|右图|left (chart|panel|plot)|right (chart|panel|plot)/i.test(STRINGS[l][k]), 'no left/right figure references: ' + k);

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const m of app.matchAll(/t\(([a-z.]+) \? '([A-Za-z0-9]+)' : '([A-Za-z0-9]+)'/g)) { ok(STRINGS.zh[m[2]] !== undefined && STRINGS.zh[m[3]] !== undefined, 'ternary keys'); }
for (const id of ['c0', 'edge0', 'toggle0', 'resetE0', 'markOn', 'markOff', 'round1', 'auto1', 'again1', 'start2', 'step2b', 'play2', 'reset2', 'start3', 'edge3', 'step3b', 'play3', 'reset3', 'toggle3', 'flood4', 'dfs4', 'walls4', 'clear4', 'v5', 'd5', 'clear5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder');
ok(!html.includes('canvas-label-guard'), 'no label guard');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../computing/algorithms/graph-algorithms/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS graph-algorithms core: ${checks} checks · ${subsets} sampled graphs × 8 starts · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
