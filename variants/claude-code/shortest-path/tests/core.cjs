'use strict';
// Shortest-path (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };

// ---- step 0: all routes ----
const ALL = M.allPaths('S', 'T');
ok(ALL.length === 21, '21 simple routes S → T');
ok(ALL[0].path.join('') === 'SACEFT' && ALL[0].cost === 16 && ALL[1].cost > 16, 'unique cheapest SACEFT = 16');
const minLen = Math.min(...ALL.map(p => p.path.length));
const hops = ALL.filter(p => p.path.length === minLen);
ok(hops.length === 1 && hops[0].path.join('') === 'SADT' && hops[0].cost === 18, 'fewest roads: SADT = 18');
const G = M.greedyWalk();
ok(!G.stuck && G.path.join('') === 'SACBEFDT' && G.cost === 23, 'greedy walk = 23');
ALL.forEach(p => ok(M.pathCost(p.path) === p.cost, 'path cost = sum of weights'));
ok(M.EDGES.every(e => e[2] > 0), 'all road weights positive');

// ---- step 1: Dijkstra from S ----
const brute = (s) => { const d = {}; M.NODES.forEach(n => { d[n] = n === s ? 0 : Math.min(...M.allPaths(s, n).map(p => p.cost)); }); return d; };
const TR = M.dijkstraTrace('S'), last = TR[TR.length - 1], bS = brute('S');
ok(TR.length - 1 === 8, '8 rounds');
M.NODES.forEach(n => ok(last.dist[n] === bS[n], 'Dijkstra = brute force for ' + n));
const ds = last.order.map(n => last.dist[n]);
for (let i = 1; i < ds.length; i++) ok(ds[i] >= ds[i - 1], 'settled in non-decreasing order');
assert.deepEqual(last.order, ['S', 'A', 'B', 'C', 'E', 'D', 'F', 'T']); checks++;
assert.deepEqual(ds, [0, 2, 6, 7, 10, 12, 12, 16]); checks++;
ok(TR[3].dist.E === 11 && TR[4].dist.E === 10, 'E: 11 then 10 after C (s1hint)');
ok(last.dist.D === 12 && last.dist.F === 12 && last.order.indexOf('D') < last.order.indexOf('F'), 'D/F tie at 12, D first');
ok(M.pathTo(last.pred, 'T').join('') === 'SACEFT', 'tree route to T');
// settled distances never change afterwards
for (let k = 1; k < TR.length; k++) TR[k].order.forEach(n => ok(TR[k].dist[n] === last.dist[n], 'settled is final'));

// ---- step 5: from T, the next node is always unambiguous; result matches step 1 ----
let st = M.dijkstraTrace('T')[0];
const bT = brute('T');
for (let k = 0; k < 8; k++) {
  const c = M.nextCandidates(st); ok(c.length === 1, 'unique choice in round ' + (k + 1));
  st = M.settle(st, c[0]);
}
M.NODES.forEach(n => ok(st.dist[n] === bT[n], 'from T = brute force ' + n));
ok(st.dist.S === 16 && M.nextCandidates(st).length === 0, 'S at 16, nothing left');
ok(M.nextCandidates(M.dijkstraTrace('T')[0])[0] === 'T', 'round 1 settles T');

// ---- step 2: negative edge ----
for (let w = -4; w <= 4; w++) {
  const r = M.negCase(w);
  // brute force over the four directed simple paths
  const paths = [['S', 'A', 'T'], ['S', 'B', 'A', 'T']], wt = { SA: 2, SB: 4, BA: w, AT: 3 };
  const tTrue = Math.min(...paths.map(p => p.slice(1).reduce((s, v, i) => s + wt[p[i] + v], 0)));
  ok(r.bf.T === tTrue && r.bf.A === Math.min(2, 4 + w), 'Bellman–Ford correct at w=' + w);
  ok(r.dij.T === 5 && r.dij.A === 2, 'Dijkstra stuck at A=2, T=5');
  ok(r.agree === (w >= -2) && r.late === (w < -2), 'disagree exactly when w < −2');
  assert.deepEqual(r.order, ['S', 'A', 'B', 'T']); checks++;
}
ok(M.negCase(-3).bf.T === 4 && M.negCase(-4).bf.T === 3, 'correct T drops below 5');

// ---- steps 3–4: grid ----
const opt = {};
for (let m = 1; m <= 9; m++) {
  const r = M.gridSearch(m, 0); opt[m] = r.cost;
  ok(r.cost === Math.min(M.gridCostVia(m, true), M.gridCostVia(m, false)), 'grid optimum = best of through / around');
  ok(r.settled >= 100, '100+ squares settled at m=' + m);
  ok(r.path[0] === M.START[1] * M.GW + M.START[0] && r.path[r.path.length - 1] === M.GOAL[1] * M.GW + M.GOAL[0], 'path ends');
  // path cost = sum of entered squares
  const sum = r.path.slice(1).reduce((s, i) => s + M.cellCost(M.GRID[Math.floor(i / M.GW)][i % M.GW], m), 0);
  ok(sum === r.cost, 'path cost consistent');
  for (const w of [0, 0.5, 1]) ok(M.gridSearch(m, w).cost === r.cost, `w=${w} stays optimal at m=${m}`);
  for (const w of [0.5, 1, 1.5, 2, 3]) ok(M.gridSearch(m, w).settled <= r.settled, 'heuristic never settles more here');
  if (m >= 3) ok(r.cost === 21 && r.mudCells === 0 && M.gridCostVia(m, true) > 21, 'detour at m ≥ 3');
}
ok(opt[1] === 13 && M.gridSearch(1, 0).path.every(i => Math.floor(i / M.GW) === 5), 'm=1: straight line, 13');
ok(opt[2] === 18 && M.gridSearch(2, 0).mudCells === 5 && M.gridCostVia(2, false) === 21, 'm=2: through mud 18 (around 21)');
const m3 = W => M.gridSearch(3, W);
ok(m3(0).settled === 128 && m3(1).settled === 64 && m3(1).cost === 21, 'm=3: 128 → 64 squares, cost 21');
ok(m3(2).cost === 23 && m3(3).cost === 23 && m3(2).settled < 64 && m3(3).settled < m3(2).settled, 'm=3: w=2,3 cost 23 with fewer squares');
ok([1.5, 2, 3].some(w => [1, 2, 3, 4, 5, 6, 7, 8, 9].some(m => M.gridSearch(m, w).cost > opt[m])), 'weighted A* can lose optimality');
// the Manhattan heuristic never overestimates: h ≤ true remaining cost from every open cell (reverse Dijkstra)
for (const m of [1, 2, 3, 9]) {
  const N = M.GW * M.GH, rem = new Array(N).fill(Infinity), done = new Uint8Array(N), goal = M.GOAL[1] * M.GW + M.GOAL[0];
  const kind = i => M.GRID[Math.floor(i / M.GW)][i % M.GW];
  rem[goal] = 0;
  for (;;) {
    let v = -1; for (let i = 0; i < N; i++) if (!done[i] && rem[i] < Infinity && (v < 0 || rem[i] < rem[v])) v = i;
    if (v < 0) break; done[v] = 1;
    const vx = v % M.GW, vy = Math.floor(v / M.GW);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const x = vx + dx, y = vy + dy; if (x < 0 || y < 0 || x >= M.GW || y >= M.GH || M.GRID[y][x] === 2) continue;
      const u = y * M.GW + x, c = rem[v] + M.cellCost(kind(v), m); if (c < rem[u]) rem[u] = c;
    }
  }
  for (let i = 0; i < N; i++) if (kind(i) !== 2) ok(Math.abs(i % M.GW - M.GOAL[0]) + Math.abs(Math.floor(i / M.GW) - M.GOAL[1]) <= rem[i], 'h never overestimates');
  ok(rem[M.START[1] * M.GW + M.START[0]] === opt[m], 'reverse search agrees on the optimum');
}
ok(M.GRID.flat().every(k => M.cellCost(k, 1) >= 1), 'every enterable square costs at least 1');

// ---- quiz ----
ok(12 - 5 < 10 && 12 + 1 >= 10, 'quiz arithmetic');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/左图|右图|left chart|right chart|left-hand|right-hand/i.test(v), 'no left/right chart wording ' + k);
for (const l of ['zh', 'en']) for (const k of ['correct', 'wrong']) ok(!/&[a-z]+;/.test(STRINGS[l][k]), 'plain-text strings carry no HTML entities');

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const m of app.matchAll(/t\(([a-z]+) \? '([A-Za-z0-9]+)' : '([A-Za-z0-9]+)'/g)) { ok(STRINGS.zh[m[2]] !== undefined && STRINGS.zh[m[3]] !== undefined, 'ternary keys'); }
for (const id of ['undo0', 'reset0', 'next1', 'auto1', 'restart1', 'w2', 'm3', 'play3', 'w4', 'play4', 'restart5', 'checkQuiz']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(/max="5"/.test(html.match(/id="w4"[^>]*/)[0]) && app.includes('const W_LIST = [0, 0.5, 1, 1.5, 2, 3]'), 'w slider indexes six weights');

// ---- deep links ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../computing/algorithms/shortest-path/index.html')), 'comparison link target exists');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS shortest-path core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
