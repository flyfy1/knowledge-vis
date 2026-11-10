'use strict';
// Multi-armed bandit (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const both = (key, text) => { for (const l of ['zh', 'en']) ok(STRINGS[l][key].includes(text), `${l}.${key} quotes ${text}`); };

// ---- samplers ----
{
  const r = M.rng(3); let s = 0, s2 = 0; const N = 40000;
  for (let i = 0; i < N; i++) { const x = r.beta(3, 7); s += x; s2 += x * x; }
  near(s / N, 0.3, 0.004, 'Beta(3,7) mean'); near(s2 / N - (s / N) ** 2, 3 * 7 / (100 * 11), 0.001, 'Beta(3,7) variance');
  let g = 0; for (let i = 0; i < N; i++) g += r.gamma(0.5); near(g / N, 0.5, 0.02, 'Gamma(0.5) mean');
  near(M.lgamma(5), Math.log(24), 1e-12, 'lgamma'); near(M.lgamma(0.5), Math.log(Math.sqrt(Math.PI)), 1e-12, 'lgamma(1/2)');
  // Beta density integrates to 1
  for (const [a, b] of [[1, 1], [2, 8], [145, 71]]) { let I = 0; for (let k = 0; k < 20000; k++) I += M.betaPdf((k + 0.5) / 20000, a, b) / 20000; near(I, 1, 1e-4, `Beta(${a},${b}) integrates to 1`); }
  checks += 8;
}

// ---- step 0 ----
ok(M.BUDGET === 20, 'budget 20'); both('s0t', '20');
for (let g = 0; g < 50; g++) {
  const G = M.game(g);
  ok(G.P.slice().sort().join() === M.ARMS.slice().sort().join(), 'every round uses the same four rates, reshuffled');
  ok(G.streams.every(s => s.length === M.BUDGET && s.every(v => v === 0 || v === 1)), 'streams long enough for the whole budget');
}
ok(M.game(0).P.join() === M.ARMS.join(), 'first round is A 0.35, B 0.55, C 0.65, D 0.45');
ok(new Set(Array.from({ length: 10 }, (_, g) => M.game(g).P.indexOf(0.65))).size > 1, 'new rounds really move the best machine');

// ---- step 1: explore-then-commit ----
ok(M.ARMS.join() === '0.35,0.55,0.65,0.45', 'arms as quoted'); both('s1e', '0.35'); both('s1e', '0.65');
near(M.gaps(M.ARMS).reduce((s, v) => s + v, 0), 0.6, 1e-12, 'Σ gaps = 0.6 (trying cost 0.6m)'); checks++; both('s1e', '0.6m');
for (let m = 1; m <= 40; m++) near(M.etcCommit(M.ARMS, m).reduce((s, v) => s + v, 0), 1, 1e-12, 'commit probabilities sum to 1, m=' + m);
checks += 40;
near(M.etcCommit(M.ARMS, 1)[2], 0.341, 0.0005, 'm = 1: P(commit C) ≈ 34%'); both('s1hint', '34%');
near(M.etcRegret(M.ARMS, 1), 48.5, 0.05, 'm = 1 regret 48.5'); both('s1hint', '48.5');
{ let bm = 0, br = Infinity; for (let m = 1; m <= 100; m++) { const r = M.etcRegret(M.ARMS, m); if (r < br) { br = r; bm = m; } } ok(bm === 20 && Math.abs(br - 24.4) < 0.05, `argmin m = ${bm}, ${br}`); both('s1hint', 'm = 20'); both('s1hint', '24.4'); }
// exact commit probabilities vs a large simulation (tie-breaking included), and the exact regret vs simulated regret
for (const m of [1, 3, 10]) {
  const tl = M.etcSimulate(M.ARMS, m, 20000, 999), ex = M.etcCommit(M.ARMS, m);
  tl.forEach((c, a) => near(c / 20000, ex[a], 0.012, `ETC commit share m=${m} arm ${a}`)); checks++;
  const g = M.gaps(M.ARMS), sim = m * 0.6 + (M.T_ETC - 4 * m) * tl.reduce((s, c, a) => s + c / 20000 * g[a], 0);
  near(sim, M.etcRegret(M.ARMS, m), 1.2, 'ETC regret simulated vs exact m=' + m); checks++;
}
// a brute-force check of the tie rule on a tiny case
{ const P = [0.5, 0.5], c = M.etcCommit(P, 2); near(c[0], 0.5, 1e-12, 'symmetric arms split evenly'); checks++; }

// ---- step 2: ε-greedy ----
const grid = M.EPS_GRID.map(e => [e, M.epsCurve(e)]);
ok(grid.length === 51 && grid[0][0] === 0 && grid[50][0] === 0.5, '51 values of ε from 0 to 0.5'); both('s2hint', '51');
const g0 = grid[0][1], g50 = grid[50][1];
near(g0.final, 73.7, 0.05, 'greedy regret 73.7'); both('s2hint', '73.7');
ok((g0.bestShareLate * 100).toFixed(0) === '52', 'greedy last-100 share on C shows as 52%'); both('s2hint', '52%');
near(g50.final, 81.3, 0.05, 'ε = 0.5 regret 81.3'); both('s2hint', '81.3');
{ const mn = grid.reduce((a, b) => (b[1].final < a[1].final ? b : a)); ok(mn[0] === 0.08 && Math.abs(mn[1].final - 30.7) < 0.05, `argmin ε ${mn[0]} ${mn[1].final}`); both('s2hint', '0.08'); both('s2hint', '30.7'); }
ok(grid.every(([, r]) => r.final < 90 && Math.max(...r.curve) < 90), 'all curves inside the 0–90 axis');
// ε = 0.5 is close to a straight line: regret at t ≈ proportional to t after the first few pulls
{ const c = g50.curve, a = (c[499] - c[99]) / 400, b = (c[999] - c[499]) / 500; ok(Math.abs(b / a - 1) < 0.15, 'ε = 0.5 grows linearly (constant slope) ' + a + ' ' + b); }
// ε in 0.05–0.1: the curve bends down early (late slope well below the early slope)
for (const [e, r] of grid) if (e >= 0.05 && e <= 0.1) { const c = r.curve; ok((c[999] - c[499]) / 500 < 0.5 * (c[99] - c[0]) / 99, 'bends for ε=' + e); }
both('s2hint', '0.05');
// the late slope of ε-greedy does not vanish (exploration never stops)
for (const e of [0.05, 0.1, 0.3]) { const c = M.epsCurve(e).curve, slope = (c[999] - c[799]) / 200; ok(slope > e * 0.6 / 4 * 0.8, 'late slope ≥ ~ε·mean gap for ε=' + e); }

// ---- step 3: UCB ----
const u1 = M.ucbTrace(1), u0 = M.ucbTrace(0), u2 = M.ucbTrace(2);
assert.deepEqual(u1.states[300].n, [43, 47, 182, 28]); checks++; both('s3hint', '43/47/182/28');
ok(u0.states[300].n[1] === 297, 'c = 0: B pulled 297 times'); both('s3hint', '297');
ok(u2.states[300].n[2] === 107, 'c = 2: C pulled 107 times'); both('s3hint', '107');
for (const [c, tr] of [[1, u1], [0, u0], [2, u2]]) {
  for (let t = 1; t <= 300; t++) {
    const st = tr.states[t - 1], idx = M.ucbIndices(st, c), top = Math.max(...idx);
    ok(idx[st.pick] >= top - 1e-12, `UCB pick has the highest index c=${c} t=${t}`);
  }
}
// the bonus shrinks with n and grows (slowly) with t
ok(M.ucbBonus(100, 5, 1) > M.ucbBonus(100, 50, 1) && M.ucbBonus(200, 5, 1) > M.ucbBonus(100, 5, 1), 'bonus behaviour');
both('s3e', 'c·√(2 ln t ÷ n)');

// ---- step 4: Thompson sampling ----
const ts = M.tsTrace();
assert.deepEqual(ts.states[300].n, [8, 70, 213, 9]); checks++; both('s4hint', '8/70/213/9');
{
  const st = ts.states[300], ab = st.n.map((n, i) => [1 + st.s[i], 1 + n - st.s[i]]), pb = M.probBest(ab);
  near(pb.reduce((s, v) => s + v, 0), 1, 2e-3, 'probBest sums to 1');
  near(pb[2], 0.954, 0.0005, 'P(C best) at t = 301 ≈ 0.954'); both('s4hint', '0.954');
  // the draw tally converges to these probabilities (what the 1000-draw button shows)
  const r = M.rng(1), tally = [0, 0, 0, 0], N = 40000;
  for (let k = 0; k < N; k++) { const v = ab.map(([a, b]) => r.beta(a, b)); tally[v.indexOf(Math.max(...v))]++; }
  tally.forEach((c, i) => near(c / N, pb[i], 0.006, 'draw share ≈ P(best) arm ' + i)); checks += 2;
}
near(M.probBest([[1, 1], [1, 1], [1, 1], [1, 1]])[0], 0.25, 1e-3, 'flat priors: each 1/4'); checks++;
// in mid-run the probabilities are not degenerate (step 4 hint: "any point")
{ const st = ts.states[50], ab = st.n.map((n, i) => [1 + st.s[i], 1 + n - st.s[i]]), pb = M.probBest(ab); ok(pb[1] > 0.1 && pb[2] > 0.5, 'mid-run: B and C both plausible'); }
// the trace really is Thompson: replay with the same seed and check the policy reproduces every pick
{ const again = M.trace(M.ARMS, M.T_ONE, M.thompson, 5151); ok(again.picks.join() === ts.picks.join(), 'trace reproducible'); }

// ---- step 5: four strategies ----
const R = {}; for (const d of M.DELTAS) R[d] = M.compare(d);
const at = (d, k, t = 2000) => R[d][k].curve[t - 1];
const lowest = (d, t = 2000) => ['greedy', 'eps', 'ucb', 'ts'].reduce((a, b) => (at(d, b, t) < at(d, a, t) ? b : a));
ok(Math.round(at(0.1, 'greedy')) === 107 && ['eps', 'ucb', 'ts'].every(k => at(0.1, k) < at(0.1, 'greedy')), 'Δ = 0.1: greedy highest, 107'); both('s5hint', '107');
ok(Math.round(at(0.1, 'ts')) === 44 && lowest(0.1) === 'ts', 'Δ = 0.1: Thompson lowest, 44'); both('s5hint', '44');
ok(Math.round(at(0.1, 'ucb')) === 96 && at(0.1, 'ucb') > at(0.1, 'eps'), 'Δ = 0.1: UCB1 96 above ε-greedy'); both('s5hint', '96');
near(R[0.1].greedy.bestShareLate, 0.5, 0.1, 'greedy ends on the best machine in about half the rounds');
for (const d of [0.1, 0.2, 0.3]) ok(lowest(d) === 'ts', 'Thompson lowest at Δ = ' + d);
for (const d of [0.02, 0.05]) ok(lowest(d) === 'eps', 'ε-greedy lowest at Δ = ' + d);
both('s5hint', 'Δ ≥ 0.1');
// shapes: ε-greedy's tail stays a slope; Thompson flattens
for (const d of [0.1, 0.2, 0.3]) {
  const e = R[d].eps.curve, s = R[d].ts.curve;
  const eLate = (e[1999] - e[1499]) / 500, eMid = (e[999] - e[499]) / 500, sLate = (s[1999] - s[1499]) / 500, sEarly = (s[499] - s[0]) / 499;
  ok(eLate > 0.6 * eMid, `ε-greedy keeps its slope Δ=${d}`);
  ok(sLate < 0.5 * sEarly, `Thompson flattens Δ=${d}`);
}
ok(M.DELTAS.join() === '0.02,0.05,0.1,0.2,0.3', 'Δ buttons');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => [...new Set(s.match(/\{[a-zA-Z0-9]+\}/g) || [])].sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['d002', 'd005', 'd01', 'd02', 'd03', 's1nosim', 's4nodraw', 'sUcb', 'nav3', 's2lgTen', 's4arm']); // numbers / empty / acronym
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const k of ['sGreedy', 'sEps', 'sUcb', 'sTs']) ok(STRINGS.zh[k] !== undefined, 'strategy name ' + k);
for (const id of ['pull0', 'pull1', 'pull2', 'pull3', 'reveal0', 'newGame0', 'm1', 'sim1', 'clear1', 'e2', 'cc3', 't3', 'play3', 't4', 'play4', 'draw4', 'draw4x', 't5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder and stylesheet');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../probability/stochastic/bandit-arms/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS bandit-arms core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
