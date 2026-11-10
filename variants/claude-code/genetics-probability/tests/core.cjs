'use strict';
// Genetics & probability (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8'), html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const fmt = eval(app.match(/const fmt = [^\n]+/)[0].replace(/^const fmt = /, '').replace(/;$/, ''));
const pct = (p, d = 1) => fmt(p * 100, d) + '%';
ok(fmt(90, 0) === '90' && fmt(50, 0) === '50' && fmt(42.1875, 1) === '42.2' && fmt(25, 1) === '25', 'fmt trims only decimal zeros');

// ---- step 0: segregation ----
ok(M.gameteProbs('AA').A === 1 && M.gameteProbs('Aa').A === 0.5 && M.gameteProbs('Aa').a === 0.5 && M.gameteProbs('aa').a === 1, 'gamete probabilities');
{ const r = M.rng(11); let a = 0; for (let i = 0; i < 2000; i++) if (M.drawGamete('Aa', r) === 'A') a++; near(a / 2000, 0.5, 0.03, 'Aa share settles near 1/2 over the 2000-gamete cap'); }
{ const r = M.rng(5); for (let i = 0; i < 200; i++) { ok(M.drawGamete('AA', r) === 'A' && M.drawGamete('aa', r) === 'a', 'homozygotes give one allele'); } }
ok(/const CAP0 = 2000;/.test(app), 'gamete cap');

// ---- step 1: Punnett square ----
const G = ['AA', 'Aa', 'aa'];
for (const g1 of G) for (const g2 of G) {
  const X = M.cross(g1, g2);
  near(X.geno.AA.v + X.geno.Aa.v + X.geno.aa.v, 1, 1e-12, 'genotypes sum to 1');
  near(X.dom.v + X.rec.v, 1, 1e-12, 'phenotypes sum to 1');
  near(X.dom.v, X.geno.AA.v + X.geno.Aa.v, 1e-12, 'dominance pools AA + Aa');
  for (const k of G) ok(Number.isInteger(X.geno[k].v * 4), 'whole cells');
  // cross is symmetric in the two parents
  const Y = M.cross(g2, g1); for (const k of G) ok(X.geno[k].v === Y.geno[k].v, 'symmetric');
}
{ const X = M.cross('Aa', 'Aa'); ok(M.fstr(X.geno.AA) === '1/4' && M.fstr(X.geno.Aa) === '1/2' && M.fstr(X.geno.aa) === '1/4' && M.fstr(X.dom) === '3/4' && M.fstr(X.rec) === '1/4', '1:2:1 and 3:1'); }
{ const X = M.cross('Aa', 'aa'); ok(M.fstr(X.geno.Aa) === '1/2' && M.fstr(X.geno.aa) === '1/2' && M.fstr(X.dom) === '1/2', 'test cross 1:1'); }
{ const X = M.cross('AA', 'aa'); ok(M.fstr(X.geno.Aa) === '1' && M.fstr(X.dom) === '1', 'AA × aa all Aa, all purple'); }

// ---- step 2: binomial ----
for (let n = 1; n <= 10; n++) {
  const p = M.binomPMF(n, 0.25);
  near(p.reduce((a, b) => a + b, 0), 1, 1e-12, 'pmf sums to 1');
  near(p.reduce((a, v, k) => a + k * v, 0), n / 4, 1e-12, 'mean n/4');
  near(p[0], Math.pow(0.75, n), 1e-12, 'P(0) = (3/4)^n');
}
const p4 = M.binomPMF(4, 0.25);
ok(pct(p4[1]) === '42.2%' && pct(p4[0]) === '31.6%', 'n = 4: 42% and 32% (s2hint, quiz)');
ok(p4[1] < 0.5, 'exactly 3:1 is under half');
ok(Math.round(p4[1] * 100) === 42 && Math.round(p4[0] * 100) === 32, 'hint quotes about 42% and about 32%');
ok(p4.indexOf(Math.max(...p4)) === 1, 'n = 4 mode k = 1');
// no specific k exceeds ~30% at n = 10 (hint: "any particular k becomes fairly unlikely")
ok(Math.max(...M.binomPMF(10, 0.25)) < 0.3, 'n = 10: every k under 30%');
// simulated families average n/4
{ const r = M.rng(77); for (const n of [4, 10]) { let s = 0; const F = 20000; for (let i = 0; i < F; i++) s += M.family(n, r); near(s / F, n / 4, 0.03, 'simulated mean n/4 for n=' + n); } }
ok(app.includes("choice.value === 'b'"), 'quiz answer b');
ok(html.includes('id="n2" data-step="2" type="range" min="1" max="10" step="1" value="4"'), 'n slider default 4');

// ---- step 3: two genes — 16 cells agree with the product rule for all nine cross combinations ----
for (const A of M.CROSSES_A) for (const B of M.CROSSES_B) {
  const p1 = { A: A[0], B: B[0] }, p2 = { A: A[1], B: B[1] }, D = M.dihybrid(p1, p2), PR = M.productRule(p1, p2);
  ok(D.cells.length === 16, '16 cells');
  for (const k of M.PHENO) near(D.prob[k].v, PR[k].v, 1e-12, `16 cells = product rule ${A}${B} ${k}`);
  near(M.PHENO.reduce((s, k) => s + D.prob[k].v, 0), 1, 1e-12, 'sums to 1');
}
{ const D = M.dihybrid({ A: 'Aa', B: 'Bb' }, { A: 'Aa', B: 'Bb' }); assert.deepEqual(M.PHENO.map(k => D.count[k]), [9, 3, 3, 1]); checks++; ok(M.fstr(D.prob.AB) === '9/16', '9/16'); }
{ const D = M.dihybrid({ A: 'Aa', B: 'Bb' }, { A: 'aa', B: 'Bb' }); assert.deepEqual(M.PHENO.map(k => D.count[k]), [6, 2, 6, 2]); checks++; /* ratio 3:1:3:1 (s3hint) */ }
ok(M.fstr(M.cross('Aa', 'aa').dom) === '1/2', 'colour line moves to the middle for Aa × aa');

// ---- step 4: linkage ----
for (let i = 0; i <= 50; i++) {
  const r = i / 100, tc = M.testcross(r), sl = M.selfLinked(r);
  near(Object.values(tc).reduce((a, b) => a + b, 0), 1, 1e-12, 'test cross sums to 1');
  near(Object.values(sl).reduce((a, b) => a + b, 0), 1, 1e-12, 'self sums to 1');
  near(tc.Ab + tc.aB, r, 1e-12, 'recombinant share = r');
  if (i) { const prev = M.testcross((i - 1) / 100); ok(tc.AB < prev.AB && tc.Ab > prev.Ab, 'parental bars shrink as r grows'); ok(sl.AB < M.selfLinked((i - 1) / 100).AB, 'self AB falls as r grows'); }
}
// r = 50%: indistinguishable from independent assortment (test cross and self)
{ const tc = M.testcross(0.5), D = M.dihybrid({ A: 'Aa', B: 'Bb' }, { A: 'aa', B: 'bb' }); for (const k of M.PHENO) near(tc[k], D.prob[k].v, 1e-12, 'r = 50% test cross = 1:1:1:1'); }
{ const sl = M.selfLinked(0.5); near(sl.AB, 0.5625, 1e-12, '56.25%'); near(sl.Ab, 0.1875, 1e-12, '18.75%'); near(sl.aB, 0.1875, 1e-12, '18.75%'); near(sl.ab, 0.0625, 1e-12, '6.25%'); }
for (const l of ['zh', 'en']) ok(STRINGS[l].s4readoutSelf.includes('56.25%, 18.75%, 18.75%, 6.25%') || STRINGS[l].s4readoutSelf.includes('56.25%、18.75%、18.75%、6.25%'), 'self readout quotes 9:3:3:1 percentages');
{ const tc = M.testcross(0); near(tc.AB, 0.5, 1e-12, 'r = 0 parental 50%'); near(tc.Ab, 0, 1e-12, 'r = 0 no recombinants'); const sl = M.selfLinked(0); near(sl.AB, 0.75, 1e-12, 'self r=0 3/4'); near(sl.ab, 0.25, 1e-12, 'self r=0 1/4'); }
// axis ranges hold every bar: test cross ≤ 0.5 < 0.6, self ≤ 0.75 < 0.8
for (let i = 0; i <= 50; i++) { ok(Math.max(...Object.values(M.testcross(i / 100))) <= 0.5 + 1e-12 && Math.max(...Object.values(M.selfLinked(i / 100))) <= 0.75 + 1e-12, 'bars fit the axis'); }
// estimating r from 200 simulated test-cross offspring is unbiased and scatters by a few percent
{ const rnd = M.rng(9); for (const r of [0.1, 0.2, 0.3, 0.5]) { let s = 0, s2 = 0; const R = 400; for (let i = 0; i < R; i++) { const c = M.simulateTestcross(r, 200, rnd), e = (c.Ab + c.aB) / 200; s += e; s2 += e * e; } const m = s / R, sd = Math.sqrt(s2 / R - m * m); near(m, r, 0.01, 'estimate unbiased r=' + r); ok(sd < 0.04, 'estimate scatter a few percent'); } }

// ---- step 5: conditional probability ----
ok(M.fstr(M.conditional('dom', 'Aa').p) === '2/3' && M.fstr(M.conditional('dom', 'AA').p) === '1/3' && M.fstr(M.conditional('dom', 'aa').p) === '0', 'P(·|purple)');
ok(M.fstr(M.conditional('none', 'Aa').p) === '1/2' && M.fstr(M.conditional('none', 'AA').p) === '1/4', 'no evidence');
ok(M.fstr(M.conditional('rec', 'aa').p) === '1' && M.conditional('rec', 'aa').kept === 1, 'white → aa');
for (const e of ['none', 'dom', 'rec']) near(G.reduce((s, g) => s + M.conditional(e, g).p.v, 0), 1, 1e-12, 'conditional sums to 1');
ok(M.fstr(M.nextGeneration('aa').sum) === '1/3' && M.fstr(M.nextGeneration('Aa').sum) === '1/6', 'next generation 1/3 and 1/6');
near(M.nextGeneration('aa').total, 1 / 3, 1e-12, 'float total agrees');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5') && STRINGS[l].foot.includes(l === 'zh' ? '遗传与概率 · 从配子到表型' : 'Genetics & Probability · From Gametes to Phenotypes'), 'footer');
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/上图|下图|上面的图|下面的图|左图|右图|upper chart|lower chart|top chart|bottom chart|左边的图|右边的图|left panel|right panel|left chart|right chart|on the left|on the right/i.test(v), 'no left/right figure references in ' + k);

// ---- keys and controls ----
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'(?!\s*\+)/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const k of M.PHENO) ok(STRINGS.zh['ph' + k] && STRINGS.en['ph' + k], 'phenotype name ' + k);
for (const id of ['g0AA', 'g0Aa', 'g0aa', 'one0', 'fifty0', 'clear0', 'pa1Aa', 'pb1aa', 'n2', 'sim2', 'clear2', 'checkQuiz', 'xa0', 'xb2', 'tc4', 'self4', 'r4', 'sim4', 'clear4', 'ev0', 'ev1', 'ev2', 'tgAA', 'tgAa', 'tgaa', 'ptaa', 'ptAa']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder');

// ---- deep links ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../probability/basics/genetics-probability/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS genetics-probability core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
