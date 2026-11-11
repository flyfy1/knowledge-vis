// Review test (Claude Code, 2026-11-11): the browser trace core against an independent cut-every-edge oracle.
const assert = require('assert'), path = require('path'), fs = require('fs');
const C = require('../core.js');

// Independent oracle: remove each edge, count pieces with a fresh union-find.
function pieces(n, edges) {
  const p = Array.from({length: n}, (_, i) => i), f = x => (p[x] === x ? x : (p[x] = f(p[x])));
  edges.forEach(([a, b]) => { p[f(a)] = f(b); });
  return new Set(p.map((_, i) => f(i))).size;
}
function oracle(n, edges) {
  const base = pieces(n, edges);
  return edges.filter((_, i) => pieces(n, edges.filter((__, j) => j !== i)) > base)
    .map(([a, b]) => (a < b ? [a, b] : [b, a])).sort((x, y) => x[0] - y[0] || x[1] - y[1]);
}

let exhaustive = 0, random = 0, frames = 0;
function checkTrace(n, edges) {
  const tr = C.trace(n, edges);
  frames += tr.length;
  // Invariants on every frame: low ≤ tin; tree edges = n − pieces at the end; each back edge joins ancestor/descendant.
  tr.forEach(f => f.tin.forEach((t, u) => { if (t >= 0) assert(f.low[u] <= t); }));
  const last = tr.at(-1);
  assert.equal(last.kind.filter(k => k === 'tree').length, n - pieces(n, edges));
  assert(last.kind.every(k => k !== 'unseen'));
  // Every return event compares exactly low[child] with tin[parent], and agrees with the cut test.
  const cuts = C.cutTest(n, edges);
  tr.forEach(f => { if (f.event.type === 'return') { assert.equal(f.event.critical, f.event.lowChild > f.event.tinParent); assert.equal(f.event.critical, cuts[f.event.edge].critical); } });
  // Deep snapshots: mutating a later frame must not change an earlier one.
  if (tr.length > 2) { const before = JSON.stringify(tr[1]); tr.at(-1).tin[0] = 99; tr.at(-1).bridges.push([9, 9]); assert.equal(JSON.stringify(tr[1]), before); }
  // detour exists exactly for the safe cables
  edges.forEach((_, id) => assert.equal(C.detour(n, edges, id) === null, cuts[id].critical));
}

// Exhaustive: every simple connected graph on 2..6 nodes (n=6 has 2^15 edge sets), both edge orders.
for (let n = 2; n <= 6; n++) {
  const pairs = []; for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) pairs.push([a, b]);
  for (let mask = 1; mask < 1 << pairs.length; mask++) {
    const edges = pairs.filter((_, i) => mask >> i & 1);
    if (edges.length < n - 1 || pieces(n, edges) !== 1) continue;
    for (const variant of [edges, edges.slice().reverse().map(([a, b]) => [b, a])]) {
      assert.deepStrictEqual(C.bridgesOf(n, variant), oracle(n, variant));
      if (n <= 5) checkTrace(n, variant);
      exhaustive++;
    }
  }
}
// Seeded random connected graphs up to 40 nodes.
let seed = 1192; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
for (let k = 0; k < 3000; k++) {
  const n = 2 + Math.floor(rnd() * 39), order = [...Array(n).keys()].sort(() => rnd() - 0.5), set = new Set(), edges = [];
  const add = (a, b) => { const key = Math.min(a, b) + ',' + Math.max(a, b); if (a !== b && !set.has(key)) { set.add(key); edges.push(rnd() < 0.5 ? [a, b] : [b, a]); } };
  for (let i = 1; i < n; i++) add(order[i], order[Math.floor(rnd() * i)]);
  const extra = Math.floor(rnd() * n); for (let i = 0; i < extra; i++) add(Math.floor(rnd() * n), Math.floor(rnd() * n));
  assert.deepStrictEqual(C.bridgesOf(n, edges), oracle(n, edges));
  checkTrace(n, edges); random++;
}

// The numbers the copy quotes.
const main = C.trace(C.MAIN.n, C.MAIN.edges).at(-1);
assert.deepStrictEqual(main.tin, [0, 1, 2, 3, 4, 5, 6]);
assert.deepStrictEqual(main.low, [0, 0, 0, 3, 3, 3, 6]);
assert.deepStrictEqual(C.bridgesOf(C.MAIN.n, C.MAIN.edges), [[1, 3], [5, 6]]);
assert.deepStrictEqual(C.detour(C.MAIN.n, C.MAIN.edges, 0), [0, 2, 1]);
assert.equal(C.cutTest(C.MAIN.n, C.MAIN.edges).reduce((t, x) => t + x.visits, 0), 168); // quoted in baselineCost
assert.deepStrictEqual(main.kind.map((k, i) => k === 'back' ? C.MAIN.edges[i].join('-') : null).filter(Boolean), ['2-0', '5-3']);
const bow = C.trace(C.BOWTIE.n, C.BOWTIE.edges).at(-1);
assert.deepStrictEqual(bow.tin, [0, 1, 2, 3, 4]);
assert.equal(bow.low[3], 2); assert.equal(bow.low[4], 2);
assert.deepStrictEqual(C.bridgesOf(C.BOWTIE.n, C.BOWTIE.edges), []);
assert.deepStrictEqual(C.bridgesOf(4, C.presets[1].edges), [[0, 1], [1, 2], [2, 3]]);
assert.deepStrictEqual(C.bridgesOf(6, C.presets[2].edges), [[2, 4], [4, 5]]);
// Wrong turn from step 2: treating the arrival cable as a back edge hides every bridge.
function naive(n, edges) {
  const adj = Array.from({length: n}, () => []); edges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });
  const tin = Array(n).fill(-1), low = Array(n).fill(-1), out = []; let timer = 0;
  (function dfs(u, p) { tin[u] = low[u] = timer++; for (const v of adj[u]) { if (tin[v] >= 0) low[u] = Math.min(low[u], tin[v]); else { dfs(v, u); low[u] = Math.min(low[u], low[v]); if (low[v] > tin[u]) out.push([u, v]); } } })(0, -1);
  return out;
}
assert.deepStrictEqual(naive(C.MAIN.n, C.MAIN.edges), []);

// Source mirror parity.
const R = path.resolve(__dirname, '..');
global.window = {}; require(path.join(R, 'python-code.js'));
assert.equal(window.PYTHON_SOURCE, fs.readFileSync(path.join(R, 'solution.py'), 'utf8'));
// Every copy key used exists in both languages.
require(path.join(R, 'copy.js'));
for (const [k, v] of Object.entries(window.COPY)) assert(Array.isArray(v) && v.length === 2 && v[0] && v[1], k);
const html = fs.readFileSync(path.join(R, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(R, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n="(\w+)"/g)) assert(m[1] in window.COPY, 'missing ' + m[1]);
for (const m of app.matchAll(/(?<![\w.])t\('(\w+)'(?!\s*\+)/g)) assert(m[1] in window.COPY, 'missing ' + m[1]);
console.log(`core vs cut-every-edge oracle: ${exhaustive} exhaustive connected graphs (n≤6, two edge orders), ${random} random graphs (n≤40), ${frames} trace frames checked; source parity and copy keys pass`);
