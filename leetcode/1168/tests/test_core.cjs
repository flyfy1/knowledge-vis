// Review test (Claude Code, 2026-11-11): the browser's Kruskal trace against the brute-force plan oracle.
const assert = require('assert'), path = require('path'), fs = require('fs');
const W = require('../core.js');

// Independent oracle written without evaluatePlan: enumerate edge subsets on the source graph
// and check every house reaches node 0.
function oracle(x) {
  const edges = x.wells.map((c, i) => [0, i + 1, c]).concat(x.pipes);
  let best = Infinity;
  for (let mask = 0; mask < 1 << edges.length; mask++) {
    let cost = 0; const adj = Array.from({length: x.n + 1}, () => []);
    edges.forEach(([a, b, c], i) => { if (mask >> i & 1) { cost += c; adj[a].push(b); adj[b].push(a); } });
    if (cost >= best) continue;
    const seen = new Set([0]), st = [0];
    while (st.length) for (const v of adj[st.pop()]) if (!seen.has(v)) { seen.add(v); st.push(v); }
    if (seen.size === x.n + 1) best = cost;
  }
  return best;
}
let cases = 0, frames = 0;
function check(x) {
  const r = W.trace(x), exp = oracle(x);
  assert.equal(r.result, exp, JSON.stringify(x));
  assert.equal(W.bruteBest(x).best, exp);
  // trace invariants: kept edges = n at the end, groups shrink by one per laid edge, one group at the end
  const last = r.frames.at(-1);
  assert.equal(last.kept, x.n); assert.equal(new Set(last.group).size, 1);
  r.frames.forEach((f, i) => { frames++; if (i) { const prev = r.frames[i - 1]; assert.equal(new Set(f.group).size, new Set(prev.group).size - (f.event.type === 'take' ? 1 : 0)); assert.equal(f.cost, prev.cost + (f.event.type === 'take' ? f.event.w : 0)); assert(f.event.w >= prev.event.w || i === 1); } });
  // deep snapshots
  if (r.frames.length > 2) { const s = JSON.stringify(r.frames[1]); r.frames.at(-1).decisions[0] = 'x'; r.frames.at(-1).group[0] = 99; assert.equal(JSON.stringify(r.frames[1]), s); }
  cases++;
}
// exhaustive small: n ≤ 3, up to 2 pipes over all pairs (parallel allowed), costs 0..2
for (let n = 1; n <= 3; n++) {
  const pairs = []; for (let a = 1; a <= n; a++) for (let b = a + 1; b <= n; b++) pairs.push([a, b]);
  const wellSets = []; (function rec(p) { if (p.length === n) return wellSets.push(p); for (let c = 0; c < 3; c++) rec(p.concat(c)); })([]);
  for (const wells of wellSets) {
    check({n, wells, pipes: []});
    for (const p1 of pairs) for (let c1 = 0; c1 < 3; c1++) {
      check({n, wells, pipes: [[...p1, c1]]});
      for (const p2 of pairs) for (let c2 = 0; c2 < 3; c2++) check({n, wells, pipes: [[...p1, c1], [...p2, c2]]});
    }
  }
}
let seed = 1168; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
for (let k = 0; k < 2000; k++) {
  const n = 1 + Math.floor(rnd() * 5), wells = Array.from({length: n}, () => Math.floor(rnd() * 11)), pipes = [];
  if (n > 1) for (let j = Math.floor(rnd() * 7); j > 0; j--) { const a = 1 + Math.floor(rnd() * n); let b = 1 + Math.floor(rnd() * (n - 1)); if (b >= a) b++; pipes.push([a, b, Math.floor(rnd() * 11)]); }
  check({n, wells, pipes});
}
// numbers quoted in the copy
const M = W.MAIN;
assert.deepStrictEqual(W.trace(M).edges.map(e => e.kind + e.u + e.v + ':' + e.w), ['pipe12:1', 'pipe23:1', 'well02:2', 'pipe13:3', 'well01:4', 'well03:5']);
assert.deepStrictEqual(W.trace(M).frames.at(-1).decisions, [true, true, true, false, false, false]);
assert.deepStrictEqual(W.bruteBest(M), {best: 4, plans: 64});
const g = W.perHouseGreedy(M);
assert.deepStrictEqual(g.pipeOn, [true, true, false]); assert.deepStrictEqual(g.wellOn, [false, false, false]); assert.equal(g.cost, 2); assert(g.water.every(w => !w));
assert.equal(W.trace(W.presets[1]).result, 8); assert.equal(W.trace(W.presets[2]).result, 6);
const P = W.trace(W.PREDICT);
assert.equal(P.result, 8); assert.equal(P.edges.filter((e, i) => e.kind === 'well' && P.frames.at(-1).decisions[i]).length, 2);
// source parity and copy keys
const R = path.resolve(__dirname, '..');
global.window = {}; require(path.join(R, 'python-code.js'));
assert.equal(window.PYTHON_SOURCE, fs.readFileSync(path.join(R, 'solution.py'), 'utf8'));
require(path.join(R, 'copy.js'));
for (const [k, v] of Object.entries(window.COPY)) assert(Array.isArray(v) && v.length === 2 && v[0] && v[1], k);
const html = fs.readFileSync(path.join(R, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(R, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n="(\w+)"/g)) assert(m[1] in window.COPY, 'missing ' + m[1]);
for (const m of app.matchAll(/(?<![\w.])t\('(\w+)'(?!\s*\+)/g)) assert(m[1] in window.COPY, 'missing ' + m[1]);
console.log(`Kruskal trace vs edge-subset oracle: ${cases} cases (exhaustive n≤3 with ≤2 pipes, plus 2000 random n≤5), ${frames} frames checked; quoted numbers, source parity and copy keys pass`);
