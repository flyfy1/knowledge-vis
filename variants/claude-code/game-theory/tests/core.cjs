'use strict';
// Game theory (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const eq = (a, b, m) => { assert.deepEqual(a, b, m); checks++; };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b}`);
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
const P = M.PRESETS;

// ---- independent brute-force checks of the core definitions ----
// Pure NE by definition; mixed NE by a fine grid search over (p, q) using isNE.
function bruteNE(g) { const out = []; for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) if (g.A[i][j] >= g.A[1 - i][j] && g.B[i][j] >= g.B[i][1 - j]) out.push([i, j]); return out; }
function checkGame(g, label) {
  eq(M.pureNE(g), bruteNE(g), 'pure NE ' + label);
  M.allNE(g).forEach(e => ok(M.isNE(g, e.p, e.q, 1e-9), 'listed profile is an equilibrium ' + label));
  const m = M.mixedNE(g);
  if (m) {
    near(M.rowEU(g, 0, m.q), M.rowEU(g, 1, m.q), 1e-9, 'q* makes Row indifferent ' + label);
    near(M.colEU(g, 0, m.p), M.colEU(g, 1, m.p), 1e-9, 'p* makes Column indifferent ' + label);
  }
  // no other interior equilibria on a grid — only for non-degenerate games (no payoff ties); games with ties
  // can have whole segments of equilibria, which the page never draws as curves (step 5 uses presets only)
  const degenerate = [0, 1].some(k => g.A[0][k] === g.A[1][k] || g.B[k][0] === g.B[k][1]);
  if (degenerate) return;
  const all = M.allNE(g);
  for (let a = 1; a < 50; a++) for (let b = 1; b < 50; b++) {
    const p = a / 50, q = b / 50;
    if (M.isNE(g, p, q, 1e-9)) ok(all.some(e => Math.abs(e.p - p) < 1e-6 && Math.abs(e.q - q) < 1e-6), `grid NE (${p},${q}) is listed ` + label);
  }
}
for (const k of Object.keys(P)) checkGame(P[k], k);
for (let s = 1; s <= 300; s++) checkGame(M.randomGame(s), 'random ' + s);

// ---- presets: the facts the text relies on ----
eq(M.pureNE(P.pd), [[1, 1]], 'PD: (Defect, Defect) only');
ok(M.rowDominant(P.pd) === 1 && M.colDominant(P.pd) === 1, 'PD: defect strictly dominant');
ok(M.bothBetter(P.pd, 1, 1, 0, 0), 'PD: (C,C) better for both than the equilibrium');
eq(M.pureNE(P.stag), [[0, 0], [1, 1]], 'stag hunt: two pure equilibria (s3hint)');
eq(M.pureNE(P.pennies), [], 'pennies: no pure equilibrium (s3hint)');
eq(M.pureNE(P.concert), [[0, 0], [1, 1]], 'date night: two pure');
eq(M.pureNE(P.chicken), [[0, 1], [1, 0]], 'chicken: two pure');
// s1hint: best response flips with the opponent in pennies, never in PD
ok(M.rowBR(P.pennies, 0)[0] !== M.rowBR(P.pennies, 1)[0] && M.colBR(P.pennies, 0)[0] !== M.colBR(P.pennies, 1)[0], 'pennies: BR flips');
ok(M.rowBR(P.pd, 0)[0] === M.rowBR(P.pd, 1)[0] && M.colBR(P.pd, 0)[0] === M.colBR(P.pd, 1)[0], 'PD: BR never flips');
// s3hint: pennies arrows form a loop — every cell has some player wanting to leave
for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { const d = M.deviation(P.pennies, i, j); ok(d.rowWants !== d.colWants, 'pennies: exactly one arrow leaves each cell'); }
// stories match payoffs: pennies zero-sum, stag (stag, stag) best, concert prefs
for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) ok(P.pennies.A[i][j] === -P.pennies.B[i][j], 'pennies zero-sum');
ok(P.stag.A[0][0] > Math.max(P.stag.A[1][0], P.stag.A[1][1]) && P.stag.A[1][0] === P.stag.A[1][1], 'stag: hare is safe, stag together best');
ok(P.concert.A[0][0] > P.concert.A[1][1] && P.concert.B[1][1] > P.concert.B[0][0] && P.concert.A[0][1] === 0 && P.concert.A[1][0] === 0, 'date night preferences');
ok(P.chicken.A[1][1] < P.chicken.A[0][1], 'chicken: both straight is worst');

// ---- step 2: the T–S family on the slider grid ----
const T2 = html.match(/id="T2"[^>]*min="([\d.-]+)" max="([\d.-]+)" step="([\d.]+)" value="([\d.-]+)"/).slice(1).map(Number);
const S2 = html.match(/id="S2"[^>]*min="([\d.-]+)" max="([\d.-]+)" step="([\d.]+)" value="([\d.-]+)"/).slice(1).map(Number);
for (let T = T2[0]; T <= T2[1] + 1e-9; T += T2[2]) for (let S = S2[0]; S <= S2[1] + 1e-9; S += S2[2]) {
  const g = M.family(T, S), name = M.familyName(T, S), ne = M.pureNE(g);
  ok((M.rowDominant(g) === 1 && M.colDominant(g) === 1) === (T > 3 && S < 1), 'defect dominant ⇔ T > 3 and S < 1');
  ok((M.rowDominant(g) === 0 && M.colDominant(g) === 0) === (T < 3 && S > 1), 'cooperate dominant ⇔ T < 3 and S > 1');
  const worse = ne.some(([i, j]) => [0, 1].some(k => [0, 1].some(l => M.bothBetter(g, i, j, k, l) && g.A[k][l] === g.B[k][l] && g.A[i][j] === g.B[i][j])));
  if (name === 'pd') { eq(ne, [[1, 1]], 'PD region: only (D,D)'); ok(worse, 'PD region: both-worse remark appears'); }
  if (name === 'stag') { eq(ne, [[0, 0], [1, 1]], 'stag region: (C,C) and (D,D)'); ok(worse, 'stag region: remark appears too'); }
  if (name === 'harmony') { eq(ne, [[0, 0]], 'harmony: (C,C)'); ok(!worse, 'harmony: no remark'); }
  if (name === 'chicken') { eq(ne, [[0, 1], [1, 0]], 'chicken region'); ok(!worse, 'chicken: no remark for symmetric cells'); }
  checkGame(g, `family ${T},${S}`);
}
ok(T2[3] === 5 && S2[3] === 0 && M.familyName(5, 0) === 'pd', 'default (5, 0) is a PD');

// ---- step 4: indifference lines ----
for (const k of ['pennies', 'stag', 'concert', 'chicken']) {
  const base = P[k], ind0 = M.indifference(base);
  ok(ind0.p !== null && ind0.q !== null, k + ' has an interior mixed equilibrium');
  for (let a = -2; a <= 6; a += 0.5) {
    const g = M.clone(base); g.A[0][0] = a; const ind = M.indifference(g);
    // p* depends only on Column's payoffs: unchanged by Row's top-left payoff (s4hint)
    near(ind.p, ind0.p, 1e-12, `${k}: p* unchanged by A[0][0] = ${a}`);
    if (ind.q !== null) { near(M.rowEU(g, 0, ind.q), M.rowEU(g, 1, ind.q), 1e-9, 'q* crossing'); }
    // the two lines cross inside (0,1) exactly when q* exists
    const d0 = M.rowEU(g, 0, 0) - M.rowEU(g, 1, 0), d1 = M.rowEU(g, 0, 1) - M.rowEU(g, 1, 1);
    ok((ind.q !== null) === (d0 * d1 < 0), `${k} a=${a}: crossing exists ⇔ sign change`);
  }
  // q* really moves when A[0][0] moves (at least somewhere on the slider)
  const qs = new Set(); for (let a = -2; a <= 6; a += 0.5) { const g = M.clone(base); g.A[0][0] = a; const q = M.indifference(g).q; if (q !== null) qs.add(q.toFixed(6)); }
  ok(qs.size > 3, k + ': q* moves with Row’s payoff');
  ok(Number(html.match(/id="a4"[^>]*value="([\d.-]+)"/)[1]) === P.pennies.A[0][0], 'a4 default = pennies top-left');
}
eq(M.mixedNE(P.pennies), { p: 0.5, q: 0.5 }, 'pennies mixed (0.5, 0.5)');
near(M.mixedNE(P.stag).p, 0.75, 1e-12, 'stag p* 0.75'); near(M.mixedNE(P.concert).p, 0.6, 1e-12, 'date p* 0.6'); near(M.mixedNE(P.concert).q, 0.4, 1e-12, 'date q* 0.4');
near(M.mixedNE(P.chicken).p, 0.8, 1e-12, 'chicken p* 0.8');

// ---- step 5: fictitious play claims (s5hint) ----
const N = 400;
{
  const path5 = M.fictitious(P.pennies, N), L = path5[N - 1];
  ok(Math.hypot(L.p - 0.5, L.q - 0.5) < 0.05, 'pennies: ends within 0.05 of the centre');
  ok(Math.hypot(L.p - 0.5, L.q - 0.5) < Math.hypot(path5[49].p - 0.5, path5[49].q - 0.5), 'pennies: closer at 400 than at 50');
  let turn = 0; for (let n = 1; n < N; n++) { const a0 = Math.atan2(path5[n - 1].p - 0.5, path5[n - 1].q - 0.5), a1 = Math.atan2(path5[n].p - 0.5, path5[n].q - 0.5); let d = a1 - a0; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; turn += d; }
  ok(Math.abs(turn) > 4 * Math.PI, 'pennies: the trail circles the centre several times');
}
{ const L = M.fictitious(P.concert, N)[N - 1]; ok(Math.hypot(L.p - 1, L.q - 1) < 0.02, 'date night: heads to the corner (Concert, Concert)'); }
{ const pth = M.fictitious(P.chicken, N), L = pth[N - 1]; ok(pth.every(s => Math.abs(s.p - s.q) < 1e-12), 'chicken: stays on the diagonal'); ok(Math.hypot(L.p - 0.8, L.q - 0.8) < 0.01, 'chicken: approaches (0.8, 0.8)'); }
ok(html.includes('data-games="pennies,concert,chicken,stag,pd"'), 'step 5 presets');

// ---- step 3 / quiz random games ----
const counts = [0, 0, 0, 0, 0]; for (let s = 1; s <= 500; s++) counts[M.pureNE(M.randomGame(s)).length]++;
ok(counts[0] > 0 && counts[1] > 0 && counts[2] > 0, 'random games show 0, 1 and 2 pure equilibria');
for (let s = 1000; s < 1100; s++) { const g = M.randomGame(s); g.A.flat().concat(g.B.flat()).forEach(v => ok(Number.isInteger(v) && v >= 0 && v <= 5, 'payoffs 0..5')); }

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
eq(zk, ek, 'zh/en key sets match');
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');

// ---- every key referenced in HTML/app exists ----
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const m of html.matchAll(/data-games="([^"]+)"/g)) m[1].split(',').forEach(k => ok(STRINGS.zh[k] && STRINGS.zh[k + '0'] && STRINGS.zh[k + '1'], 'preset strings ' + k));
for (const k of ['storyPd', 'storyStag', 'storyConcert', 'storyPennies', 'storyChicken', 'storyRandom']) ok(app.includes(`'${k}'`), 'story used ' + k);
for (const id of ['g0', 'g1', 'g3', 'g4', 'g5', 'r0a', 'r0b', 'c0a', 'c0b', 'ac1a', 'ac1b', 'ar1a', 'ar1b', 'all1', 'T2', 'S2', 'rand3', 'r3a', 'r3b', 'c3a', 'c3b', 'q4', 'a4', 'play5', 'clear5', 'check6', 'show6', 'new6']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder and stylesheet');
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
ok(fs.existsSync(path.join(dir, '../../../math/applied/game-theory/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS game-theory core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · random games 0/1/2/3+ pure NE: ${counts.slice(0, 3).join('/')}/${counts[3] + counts[4]}`);
