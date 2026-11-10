'use strict';
// Molecular shapes (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..'), root = path.resolve(dir, '../../..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b}`);

// ---- step 0: identical domains reach the ideal angles from every start the page can use (seeds 1..97) ----
for (let N = 2; N <= 6; N++) for (let seed = 1; seed <= 97; seed++) {
  const tr = M.relaxTrace(N, seed), K = tr.K, P = tr.frames[K];
  ok(K < M.ITERS, `N=${N} seed=${seed}: stops (nothing moves) before the cap`);
  const groups = M.distinct(M.pairAngles(P)).map(g => +g.deg.toFixed(1));
  ok(JSON.stringify(groups) === JSON.stringify(M.IDEAL[N].map(v => +v.toFixed(1))), `N=${N} seed=${seed}: ${groups} vs ideal`);
  for (let k = 0; k < K; k++) ok(tr.E[k + 1] <= tr.E[k] + 1e-9, 'energy never rises');
  ok(tr.E[0] > tr.E[K], 'energy falls');
}
// the curve visibly flattens: E is within 1% of its final drop well before the run stops
for (let N = 3; N <= 6; N++) { const tr = M.relaxTrace(N, 1), drop = tr.E[0] - tr.E[tr.K]; ok(tr.E.findIndex(e => e - tr.E[tr.K] < 0.01 * drop) < tr.K * 0.5, 'curve flattens'); }
// counts quoted in the hint for N = 5, 6
{ const r5 = M.relaxTrace(5, 1), P5 = r5.frames[r5.K], d5 = M.distinct(M.pairAngles(P5)); ok(d5.find(g => Math.abs(g.deg - 90) < 0.1).count === 6 && d5.find(g => Math.abs(g.deg - 120) < 0.1).count === 3, '5: 90°×6, 120°×3'); }

// ---- step 1: E(θ) on the slider grid bottoms out at 109.5°, where inside = across = 109.47° ----
{ let best = null; for (let th = 60; th <= 180.001; th += 0.5) { const s = M.fourStats(th); if (!best || s.E < best.E) best = { th, ...s }; }
  near(best.th, 109.5, 1e-9, 'grid minimum at 109.5°');
  const s = M.fourStats(M.TETRA); near(s.within, s.across, 1e-9, 'tetrahedron: inside = across'); near(s.across, 109.4712, 1e-3, '109.47°');
  M.pairAngles(s.P).forEach(a => near(a, 109.4712, 1e-3, 'all six angles 109.47°'));
  const f = M.fourStats(180); near(f.min, 90, 1e-9, 'flat cross: neighbours at 90°'); ok(f.E > s.E + 0.1, 'flat cross has more repulsion');
  for (let th = 110; th <= 180; th += 0.5) ok(M.fourStats(th).E > M.fourStats(th - 0.5).E - 1e-12, 'E rises from the minimum to the flat cross');
  for (let th = 60.5; th <= 109.5; th += 0.5) ok(M.fourStats(th).E < M.fourStats(th - 0.5).E + 1e-12, 'E falls toward the minimum'); }

// ---- step 2: λ = 1.25 puts NH3 and H2O within 1° of experiment; the NH3 line is met at λ ≈ 1.25 on the grid ----
{ const nh3 = M.arrange(4, 1, 1.25).minBond, h2o = M.arrange(4, 2, 1.25).minBond;
  near(nh3, 106.7, 1, 'NH3 at λ = 1.25'); near(h2o, 104.5, 1, 'H2O at λ = 1.25'); ok(h2o.toFixed(1) === '104.4', 'H2O model 104.4° as quoted');
  ok(M.LAMBDA === 1.25, 'page fixes λ = 1.25');
  const grid = Array.from({ length: 21 }, (_, i) => 1 + i * 0.05);
  const closest = grid.reduce((b, l) => (Math.abs(M.arrange(4, 1, l).minBond - 106.7) < Math.abs(M.arrange(4, 1, b).minBond - 106.7) ? l : b), 1);
  near(closest, 1.25, 1e-9, 'NH3 crossing on the grid');
  for (const [N, L] of [[4, 1], [4, 2], [3, 1]]) for (let i = 1; i < grid.length; i++) ok(M.arrange(N, L, grid[i]).minBond < M.arrange(N, L, grid[i - 1]).minBond, 'angle shrinks as λ grows');
  for (const L of [1, 2, 3]) for (const l of grid.slice(1)) ok(M.arrange(5, L, l).lonePos.every(p => p === 'equatorial'), `N=5 L=${L} λ=${l}: lone pairs equatorial`);
  for (const l of grid.slice(1)) ok(M.arrange(6, 2, l).loneAngle < 120, 'N=6 L=2: model fails (lone pairs not opposite)');
  for (const l of grid) { const a = M.arrange(4, 0, l); near(a.minBond, M.TETRA, 0.01, 'no lone pair: λ has no effect'); }
  // trigonal bipyramid: an equatorial site has 2 neighbours at 90°, an axial site 3
  const P = M.arrange(5, 0, 1).P, near90 = i => P.filter((q, j) => j !== i && Math.abs(M.angle(P[i], q) - 90) < 1).length;
  ok(P.map((_, i) => near90(i)).sort().join() === '2,2,2,3,3', 'TBP neighbour counts'); }

// ---- step 3: counting and the model-vs-experiment table ----
const expect = { BeCl2: [2, 0], CO2: [2, 0], BF3: [3, 0], SO2: [2, 1], CH4: [4, 0], NH3: [3, 1], H2O: [2, 2], PCl5: [5, 0], ClF3: [3, 2], SF6: [6, 0], XeF4: [4, 2] };
ok(M.MOLECULES.length === 11, '11 molecules');
const worst = {};
M.MOLECULES.forEach(m => {
  const c = M.count(m); ok(Number.isInteger(c.L) && c.L >= 0, m.id + ' lone pairs integer'); ok(c.X === expect[m.id][0] && c.L === expect[m.id][1], m.id + ' AXmEn');
  ok(M.shapeKey(c.N, c.L), m.id + ' has a shape name');
  const cmp = M.compare(m.id); worst[m.id] = cmp.reduce((w, q) => (Math.abs(q.diff) > Math.abs(w) ? q.diff : w), 0);
});
['CH4', 'NH3', 'H2O'].forEach(id => ok(Math.abs(worst[id]) <= 1, id + ' within 1°'));
['BeCl2', 'CO2', 'BF3', 'PCl5', 'SF6'].forEach(id => ok(Math.abs(worst[id]) < 0.1, id + ' exact'));
ok(worst.SO2 < -5 && worst.SO2 > -6, 'SO2 about 5° low');
near(M.molecule('XeF4').arr.loneAngle, 95, 0.5, 'XeF4 lone pairs about 95° apart');
{ const bad = Object.keys(worst).filter(id => Math.abs(worst[id]) > 5).sort(); ok(bad.join() === 'SO2,XeF4', 'only SO2 and XeF4 flagged'); 
  const ranked = Object.keys(worst).sort((a, b) => Math.abs(worst[b]) - Math.abs(worst[a])); ok(ranked.slice(0, 2).sort().join() === 'SO2,XeF4', 'they are the two largest diffs'); }
ok(M.molecule('ClF3').arr.lonePos.every(p => p === 'equatorial'), 'ClF3 lone pairs on the waist (T shape)');
ok(M.compare('ClF3').every(c => c.diff < 0), 'ClF3 model angles smaller than measured');

// ---- step 4: dipoles ----
near(M.EN.O - M.EN.H, 1.24, 1e-9, 'O–H ΔEN 1.24'); near(M.bentNet(1.24, 104.5), 1.5, 0.05, 'about 1.5 at 104.5°'); near(M.bentNet(1.24, 180), 0, 1e-12, '0 at 180°');
for (let a = 90.5; a <= 180; a += 0.5) ok(M.bentNet(1.24, a) < M.bentNet(1.24, a - 0.5), 'net grows as θ shrinks');
M.MOLECULES.filter(m => m.id !== 'XeF4').forEach(m => { const z = M.netDipole(m.id).mag < 1e-3; ok(z === (m.dipole === 0), m.id + ': model zero ⇔ measured zero'); ok(z || M.netDipole(m.id).mag > 0.5, m.id + ' clearly non-zero'); });
near(M.bondDipole('B', 'F'), 1.94, 1e-9, 'B–F 1.94'); near(M.bondDipole('N', 'H'), -0.84, 1e-9, 'N–H 0.84 toward N'); ok(M.bondDipole('C', 'H') < 0, 'C–H arrow points to C');
ok(M.netDipole('BF3').mag < 1e-3 && M.netDipole('NH3').mag > 0.5, 'quiz: BF3 non-polar, NH3 polar');

// ---- bilingual strings, html keys, links ----
const zh = STRINGS.zh, en = STRINGS.en, ph = s => (s.match(/\{\w+\}/g) || []).sort().join();
ok(JSON.stringify(Object.keys(zh).sort()) === JSON.stringify(Object.keys(en).sort()), 'same key sets');
Object.keys(zh).forEach(k => ok(ph(zh[k]) === ph(en[k]), 'placeholders ' + k));
Object.keys(zh).forEach(k => { if (!['foot', 'thAxe', 'sep', 'orSep'].includes(k) && /[一-鿿]/.test(zh[k])) ok(zh[k] !== en[k] && !/[一-鿿]/.test(en[k]), 'en translated ' + k); });
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
[...html.matchAll(/data-i18n(?:-html|-aria)?="(\w+)"/g)].forEach(m => ok(m[1] in zh, 'html key ' + m[1]));
[...app.matchAll(/\bt\('(\w+)'[,)]/g)].forEach(m => ok(m[1] in zh, 'app key ' + m[1]));
Object.values(M.SHAPE).forEach(s => ok(('shape_' + s) in zh, 'shape name ' + s));
const links = [...html.matchAll(/href="\.\.\/\.\.\/\.\.\/([^"#]*)(#step(\d+))?"/g)].concat(...Object.values(zh).concat(Object.values(en)).map(s => [...s.matchAll(/href="\.\.\/\.\.\/\.\.\/([^"#]*)(#step(\d+))?"/g)]));
links.filter(m => m[1] === "" || m[1].endsWith("/")).forEach(m => { const f = path.join(root, m[1], 'index.html'); ok(fs.existsSync(f), 'link target ' + m[1]); if (m[3]) ok(fs.readFileSync(f, 'utf8').includes(`id="step${m[3]}"`), 'anchor ' + m[1] + m[2]); });
ok(html.includes('href="../../../chemistry/matter/molecular-shapes/"') && html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'compare link, provenance slot, css');
ok(!html.includes('canvas-label-guard'), 'no label guard');
console.log(`molecular-shapes core: ${checks} checks passed`);
// display orientation is a pure rotation (all angles kept) and puts the lone pairs' mean direction up
M.MOLECULES.forEach(m => { const q = M.molecule(m.id), Q = M.orient(q.arr.P, q.L), a = M.pairAngles(q.arr.P), b = M.pairAngles(Q); a.forEach((v, i) => ok(Math.abs(v - b[i]) < 1e-5, 'orient keeps angles ' + m.id)); });
{ const q = M.molecule('NH3'), Q = M.orient(q.arr.P, q.L); ok(Q[0][2] > 0.999, 'NH3 lone pair up'); }
console.log('orientation checks passed');
