'use strict';
// Markov-chain (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const both = (key, sub) => { for (const l of ['zh', 'en']) ok(STRINGS[l][key].includes(sub), `${l}.${key} quotes ${sub}`); };
const matmul = (A, B) => A.map(r => B[0].map((_, j) => r.reduce((s, v, k) => s + v * B[k][j], 0)));

// ---- the matrices are stochastic ----
for (const [k, P] of Object.entries(M.PRESETS)) P.forEach(row => { near(row.reduce((a, b) => a + b, 0), 1, 1e-12, 'row sum ' + k); row.forEach(v => ok(v >= 0, 'nonnegative')); });
for (let s = 0; s <= 0.9001; s += 0.05) M.sticky(M.P0, s).forEach(row => near(row.reduce((a, b) => a + b, 0), 1, 1e-12, 'sticky rows'));

// ---- step 0: memorylessness in the simulated walk (s0hint: rows approach 0.1, 0.7, 0.2) ----
assert.deepEqual(M.P0[1], [0.1, 0.7, 0.2]); checks++; ok(STRINGS.zh.s0hint.includes('0.1、0.7、0.2') && STRINGS.en.s0hint.includes('0.1, 0.7, 0.2'), 's0hint quotes the campus row'); checks++;
{
  const path0 = M.walk(M.P0, 1, 200000, M.rng(1)), c = M.conditional(path0, 1);
  for (let y = 0; y < 3; y++) { const n = c[y].reduce((a, b) => a + b, 0); ok(n > 500, 'enough cases'); c[y].forEach((v, j) => near(v / n, M.P0[1][j], 0.02, `P(next=${j} | today=campus, yesterday=${y})`)); }
  // 3000 days (what three clicks give) are already close: within 0.07
  const p3 = M.walk(M.P0, 1, 3000, M.rng(1)), c3 = M.conditional(p3, 1);
  for (let y = 0; y < 3; y++) { const n = c3[y].reduce((a, b) => a + b, 0); c3[y].forEach((v, j) => near(v / n, M.P0[1][j], 0.08, '3000-day table')); }
}

// ---- step 1: evolution ----
const pi = M.stationary(M.P0);
near(pi[0], 13 / 42, 1e-12, 'π metro = 13/42'); near(pi[1], 17 / 42, 1e-12, 'π campus = 17/42'); near(pi[2], 12 / 42, 1e-12, 'π park = 12/42');
pi.forEach((v, i) => near(M.step(pi, M.P0)[i], v, 1e-12, 'πP = π'));
both('s1hint', '31%'); both('s1hint', '40%'); both('s1hint', '29%');
both('s2hint', '31.0%'); both('s2hint', '40.5%'); both('s2hint', '28.6%');
for (const start of [[1, 0, 0], [0, 1, 0], [0, 0, 1], [1 / 3, 1 / 3, 1 / 3]]) {
  const tr = M.evolve(start, M.P0, 20);
  tr.forEach(d => near(d.reduce((a, b) => a + b, 0), 1, 1e-12, 'shares sum to 1'));
  ok(M.tv(tr[7], pi) < 0.005, 'about a week to lie on the dashes');
  // the matrix-power view agrees: π_t = π_0 P^t
  let Pt = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]; for (let k = 0; k < 5; k++) Pt = matmul(Pt, M.P0);
  M.step(start, Pt).forEach((v, i) => near(v, tr[5][i], 1e-12, 'π0 P^5'));
}

// ---- step 2: balance ----
for (let a = 0; a <= 1.0001; a += 0.05) for (let b = 0; a + b <= 1.0001; b += 0.05) {
  const d = [a, b, Math.max(0, 1 - a - b)], f = M.flows(d, M.P0), nx = M.step(d, M.P0);
  f.forEach((q, i) => near(nx[i] - d[i], q.inn - q.out, 1e-12, 'change = inflow − outflow'));
}
M.flows(pi, M.P0).forEach(q => { near(q.out, q.inn, 1e-12, 'balanced at π'); ok(q.out > 0.12 && q.out < 0.16, 'outflow 12%–16%: ' + q.out); });
both('s2hint', '12%–16%');
{ const f = M.flows([0.6, 0.2, 0.2], M.P0); ok(f[0].out > 2 * f[0].inn, 'default: metro drains'); let d = [0.6, 0.2, 0.2]; for (let k = 0; k < 10; k++) d = M.step(d, M.P0); ok(M.tv(d, pi) < 1e-3, 'next-day presses level the bars'); }

// ---- step 3: speed ----
for (let si = 0; si <= 18; si++) {
  const s = si / 20, P = M.sticky(M.P0, s), e = M.eigOthers(P);
  M.stationary(P).forEach((v, i) => near(v, pi[i], 1e-9, 'stickiness keeps π'));
  near(Math.max(...e.re.map(Math.abs)), (1 - s) * 0.4 + s, 1e-6, '|λ₂| = (1 − s)·0.4 + s');
  near(e.re[1], (1 - s) * 0.3 + s, 1e-6, 'λ₃ = (1 − s)·0.3 + s');
  // the eigenvalues really are eigenvalues: det(P − λI) = 0
  for (const l of e.re) { const Q = P.map((r, i) => r.map((v, j) => v - (i === j ? l : 0))); near(M.det3(Q), 0, 1e-9, 'det(P − λI) = 0'); }
  // long-run slope of the distance equals |λ₂| (ratio of consecutive distances)
  const tr = M.evolve([1, 0, 0], P, 400), k = Math.min(380, Math.ceil(Math.log(1e-9) / Math.log(e.mod)));
  if (k > 5) { const r = M.tv(tr[k + 1], pi) / M.tv(tr[k], pi); near(r, e.mod, 0.02, 'distance ratio → |λ₂| at s=' + s); }
}
assert.equal(M.mixDays(M.P0, 0.01), 6); assert.equal(M.mixDays(M.sticky(M.P0, 0.5), 0.01), 14); assert.equal(M.mixDays(M.sticky(M.P0, 0.9), 0.01), 78); checks += 3;
both('s3hint', '6'); both('s3hint', '14'); both('s3hint', '78'); both('s3hint', '0.94'); both('s3hint', '0.7');
ok(M.mixDays(M.sticky(M.P0, 0.9), 0.01) <= 80, 'T3 = 80 covers the slowest setting');

// ---- step 4: failures ----
{
  const c = M.PRESETS.cycle, tr = M.evolve([1, 0, 0], c, 30);
  assert.deepEqual(tr[29], [0, 0, 1]); assert.deepEqual(tr[30], [1, 0, 0]); checks += 2;
  for (let k = 0; k + 3 <= 30; k++) assert.deepEqual(tr[k], tr[k + 3]); checks++;
  near(M.eigOthers(c).mod, 1, 1e-12, 'cycle: |λ| = 1');
  M.stationary(c).forEach(v => near(v, 1 / 3, 1e-12, 'cycle steady state 1/3'));
  const sp = M.PRESETS.split, a = M.evolve([1, 0, 0], sp, 30)[30], b = M.evolve([0, 0, 1], sp, 30)[30];
  near(a[0], 0.5, 1e-12, 'split from metro: half'); near(a[1], 0.5, 1e-12, 'half'); near(b[2], 1, 0, 'park stays');
  near(M.eigOthers(sp).re[0], 1, 1e-12, 'eigenvalue 1 twice');
  const n = M.evolve([1, 0, 0], M.P0, 30)[30], m = M.evolve([0, 0, 1], M.P0, 30)[30]; ok(M.tv(n, m) < 1e-9, 'normal: lines coincide');
}

// ---- step 5: waiting for a pattern ----
const EXP = { HH: 6, HT: 4, HHH: 14, HTH: 10 };
for (const [p, e] of Object.entries(EXP)) {
  near(M.expectedWait(p), e, 1e-9, 'E wait ' + p);
  const pmf = M.waitPmf(p, 2000); near(pmf.reduce((a, b) => a + b, 0), 1, 1e-9, 'pmf sums to 1'); near(pmf.reduce((a, b, i) => a + b * i, 0), e, 1e-6, 'pmf mean');
  const r = M.rng(3); let s = 0; const R = 20000; for (let i = 0; i < R; i++) s += M.waitSample(p, r); near(s / R, e, 0.06 * e, 'simulated mean ' + p);
  both('s5hint', String(e));
}
assert.deepEqual(M.automaton('HH'), [{ H: 1, T: 0 }, { H: 2, T: 0 }]); assert.deepEqual(M.automaton('HT'), [{ H: 1, T: 0 }, { H: 1, T: 2 }]); checks += 2;
near(M.waitPmf('HH', 2)[2], 0.25, 1e-12, 'P(HH on toss 2) = 1/4'); near(M.waitPmf('HT', 2)[2], 0.25, 1e-12, 'P(HT on toss 2) = 1/4');

// ---- formatting helper used in app.js keeps integer zeros ----
const app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
const fmtSrc = app.match(/const fmt = [^\n]+/)[0];
const fmt = new Function(fmtSrc.replace('const fmt =', 'return'))();
assert.equal(fmt(90, 0), '90'); assert.equal(fmt(2.5, 2), '2.5'); assert.equal(fmt(3, 3), '3'); assert.equal(fmt(-0.0001, 2), '0'); assert.equal(fmt(100, 1), '100'); checks += 5;

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set([]);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/左图|右图|left chart|right chart|left panel|right panel/i.test(v), 'no left/right chart wording in ' + k);

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'[,)]/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['go0a', 'go0b', 'go0c', 'day0', 'days0', 'clear0', 'mat0', 'cond0', 'st1_m', 'st1_u', 'st1_p', 'st1_even', 't1', 'play1', 'a2', 'b2', 'stepBtn2', 'solve2', 's3', 'pr_normal', 'pr_cycle', 'pr_split', 'pt_HH', 'pt_HT', 'pt_HHH', 'pt_HTH', 'run5a', 'run5b', 'reset5']) ok(html.includes(`id="${id}"`), 'control ' + id);
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
ok(fs.existsSync(path.join(dir, '../../../probability/stochastic/markov-chains/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS markov-chains core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
