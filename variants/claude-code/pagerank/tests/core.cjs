'use strict';
// PageRank (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b}`);
const both = (key, s) => { for (const l of ['zh', 'en']) ok(STRINGS[l][key].includes(s), `${l}.${key} quotes ${s}`); };
const sum = a => a.reduce((s, v) => s + v, 0);

const g = M.build(M.BASE), IN = M.inCounts(g), PR = M.pagerank(g).r, I = g.idx;

// ---- the graph described in s0e ----
ok(g.N === 7 && sum(g.out.map(o => o.length)) === 12, '7 pages, 12 links'); both('s0e', '12');
ok(IN[I.G] === 4 && Math.max(...IN) === 4 && IN.filter(c => c === 4).length === 1, 'G has the most in-links (4)'); both('s0e', '4');
ok(IN[I.B] === 1 && M.BASE.A.length === 1 && M.BASE.A[0] === 'B', 'B has one in-link, from A, and A links only to B');
ok(IN[I.F] === 0 && IN[I.D] === 1 && IN[I.E] === 1, 'G’s voters D, E, F are barely linked');
ok(M.BASE.C.includes('G') && M.BASE.D.includes('G') && M.BASE.E.includes('G') && M.BASE.F.includes('G'), 'G’s votes come from C, D, E, F');
ok(g.out.every(o => o.length > 0), 'no dead ends in the base graph');

// ---- step 0: the vote equation holds at the fixed point; ranking ----
near(sum(PR), 1, 1e-12, 'scores add up to 1');
for (let j = 0; j < 7; j++) { let s = 0.15 / 7; g.out.forEach((o, i) => { if (o.includes(j)) s += 0.85 * PR[i] / o.length; }); near(PR[j], s, 1e-8, 'fixed point ' + g.names[j]); }
ok(PR[I.B] > PR[I.G], 'B above G at d = 0.85');
assert.deepEqual(M.order(PR).map(i => g.names[i]).join(''), 'CABGDEF'); checks++;
ok(PR[I.G] < 1 / 7 + 0.03 && PR[I.B] > 1 / 7, 'G shrinks relative to its in-link rank, B grows');

// ---- step 1: random surfer frequencies → PageRank ----
{
  const u = M.rng(77); let at = 0, jumps = 0; const c = new Array(7).fill(0);
  for (let n = 0; n < 20000; n++) { const mv = M.surf(g, at, 0.85, u); at = mv.to; if (mv.jump) jumps++; c[at]++; }
  const f = c.map(v => v / 20000), tv = sum(f.map((v, i) => Math.abs(v - PR[i]))) / 2;
  ok(tv < 0.02, 'seed 77, 20000 steps: TV < 0.02 (' + tv + ')');
  ok(f[I.B] > f[I.G], 'B’s frequency ends above G’s');
  near(jumps / 20000, 0.15, 0.01, 'random jumps ≈ 15% of steps');
  // long run over many seeds: frequency = PageRank
  const C2 = new Array(7).fill(0); for (let s = 1; s <= 20; s++) { const v = M.rng(s); let a = 0; for (let n = 0; n < 20000; n++) { a = M.surf(g, a, 0.85, v).to; C2[a]++; } }
  C2.forEach((v, i) => near(v / 400000, PR[i], 0.005, 'surfer frequency = PageRank ' + g.names[i]));
}

// ---- step 2: power iteration ----
{
  const H = M.history(g, 0.85, 40), D = H.map(r => M.l1(r, PR));
  H.forEach((r, k) => near(sum(r), 1, 1e-12, 'shares add to 1 at k=' + k));
  D.forEach((v, k) => ok(v <= Math.pow(0.85, k) * D[0] + 1e-15, 'distance ≤ 0.85^k × start at k=' + k));
  for (let k = 1; k <= 40; k++) { const r = D[k] / D[k - 1]; ok(r > 0.4 && r < 0.85, `single-round ratio ${r} at k=${k} within 0.4–0.85`); }
  near(Math.pow(D[40] / D[0], 1 / 40), 0.64, 0.005, 'average ratio over 40 rounds ≈ 0.64');
  both('s2hint', '0.64'); both('s2hint', '0.4'); both('s2hint', '0.85');
  ok(['A', 'B', 'C'].every(n => PR[I[n]] > 1 / 7) && ['D', 'E', 'F'].every(n => PR[I[n]] < 1 / 7), 'C, A, B grow; D, E, F shrink');
}

// ---- step 3: traps and dead ends ----
{
  const gt = M.build(M.VARIANTS.trap), gd = M.build(M.VARIANTS.deadend);
  ok(M.VARIANTS.trap.F.join() === 'G' && M.VARIANTS.trap.G.join() === 'F', 'trap: F and G only link to each other');
  ok(gd.out[I.G].length === 0, 'dead end: G has no links');
  const fg = d => { const r = M.pagerank(gt, d).r; return r[5] + r[6]; };
  near(fg(0.85), 0.64, 0.005, 'trap share ≈ 64% at d = 0.85'); both('s3hint', '64%');
  near(fg(0.5), 0.42, 0.005, 'trap share ≈ 42% at d = 0.5'); both('s3hint', '42%');
  const h1 = M.history(gt, 1, 60); ok(h1[40][5] + h1[40][6] > 0.99, 'd = 1: F + G hold > 99% by round 40');
  ok([0, 1, 2, 3, 4].every(i => h1[60][i] < 1e-3), 'd = 1: other pages → 0');
  for (let k = 1; k <= 60; k++) ok(h1[k][5] + h1[k][6] >= h1[k - 1][5] + h1[k - 1][6] - 1e-12, 'trap share only grows at d = 1');
  // dead end: fixed rule keeps sum 1; leaky version drains
  for (const d of [0.5, 0.85, 1]) M.history(gd, d, 60).forEach(r => near(sum(r), 1, 1e-12, 'jump-anywhere keeps sum 1'));
  const leak = d => { let r = M.uniform(7); for (let k = 0; k < 60; k++) r = M.stepLeaky(gd, r, d); return sum(r); };
  near(leak(0.85), 0.49, 0.005, 'leaky total ≈ 49% at d = 0.85'); both('s3hint', '49%');
  ok(leak(1) < 0.01, 'leaky total → 0 at d = 1');
  // the dead-end rule equals "G links to every page"
  const gAll = M.build({ ...M.BASE, G: M.NAMES.slice() }); const a = M.pagerank(gd).r, b = M.pagerank(gAll).r; a.forEach((v, i) => near(v, b[i], 1e-7, 'dead end = links to all'));
}

// ---- step 4: damping ----
{
  M.pagerank(g, 0).r.forEach(v => near(v, 1 / 7, 1e-12, 'd = 0: all 1/7'));
  let cross = null; for (let i = 0; i <= 99; i++) { const r = M.pagerank(g, i / 100).r; if (r[I.B] > r[I.G]) { cross = i / 100; break; } }
  ok(cross >= 0.64 && cross <= 0.66, 'B overtakes G near d = 0.65: ' + cross); both('s4hint', '0.65');
  { const r = M.pagerank(g, 0.3).r; ok(r[I.G] > r[I.B], 'small d: G above B'); }
  let prev = 0; for (let i = 0; i <= 99; i++) { const it = M.pagerank(g, i / 100).iterations; ok(it >= prev, 'iterations grow with d at ' + i / 100); prev = it; }
}

// ---- step 5: link farms ----
{
  const farm = (m, extra) => { const gf = M.build(M.withFarm(M.BASE, 'D', m, extra ? { from: 'A', to: 'D' } : null)); return M.pagerank(gf).r; };
  const r0 = farm(0), rA = farm(0, true);
  ok(M.order(r0.slice(0, 7)).indexOf(I.D) + 1 === 5, 'D is 5th'); both('s5e', '5');
  near(farm(40)[I.D], 0.114, 0.0006, 'm = 40 → ≈ 0.114'); both('s5hint', '0.114');
  near(rA[I.D], 0.135, 0.0006, 'A → D → ≈ 0.135'); both('s5hint', '0.135');
  ok(M.order(rA.slice(0, 7)).indexOf(I.D) + 1 === 4 && rA[I.D] > rA[I.B], 'A → D lifts D past B to 4th');
  const r1000 = farm(1000)[I.D]; near(r1000, 0.127, 0.0006, 'm = 1000 → ≈ 0.127'); ok(r1000 < rA[I.D], '1000 fakes still below one A link'); both('s5hint', '1000'); both('s5hint', '0.127');
  let last = Infinity; for (let m = 1; m <= 40; m++) { const inc = farm(m)[I.D] - farm(m - 1)[I.D]; ok(inc > 0 && inc < last + 1e-12, 'diminishing returns m=' + m); last = inc; }
  for (let m = 0; m <= 40; m += 8) near(sum(farm(m)), 1, 1e-9, 'farm scores sum to 1');
  for (let m = 0; m <= 40; m++) ok(farm(m, true)[I.D] < 0.25 && farm(m)[I.D] < 0.25, 'D stays inside the 0–0.25 chart axis');
}

// ---- bilingual strings ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join(',');
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['metricPr']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');

const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'[,)]/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['byIn', 'byPr', 'pick0', 'w1', 'w100', 'wAuto', 'reset1', 'k2', 'play2', 'vNormal', 'vTrap', 'vDead', 'd3', 'd4', 'm5', 'aLink']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder + css');

const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../computing/algorithms/pagerank/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS pagerank core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
