'use strict';
// Fees & compounding (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const Z = STRINGS.zh, E = STRINGS.en, B = M.BASE;

// ---- step 0: about a quarter ----
const lost30 = 1 - M.kept(0.01, 30);
near(lost30, 0.26, 0.005, '1% for 30 years takes ≈ 26%');
near(1 - M.value(B.P, B.r, B.f, 30) / M.value(B.P, B.r, 0, 30), lost30, 1e-12, 'ratio of balances = (1 − f)^T');
const opts = { a: 0.01, b: 0.10, c: 0.25, d: 0.50 };
ok(Object.entries(opts).sort((p, q) => Math.abs(p[1] - lost30) - Math.abs(q[1] - lost30))[0][0] === 'c', 'quiz answer c is closest');
ok(B.P === 20000 && B.r === 0.06 && B.f === 0.01, 'base example 20 000 / 6% / 1%');
ok(Z.tagline.includes('20 000') && E.tagline.includes('$20,000') && Z.s0e.includes('6%') && E.s0e.includes('6%'), 'base example quoted');
// gap accelerates: each year adds more than the previous one
const L = M.ledger(B.P, B.r, B.f, 30);
for (let i = 1; i < 30; i++) ok(L[i].gap - L[i - 1].gap > (i > 1 ? L[i - 1].gap - L[i - 2].gap : L[0].gap) - 1e-9, 'gap grows faster each year');
ok(L[9].gap / M.value(B.P, B.r, 0, 10) < 0.1, 'first ten years: gap under 10%');

// ---- step 1: ledger ----
near(L[0].fee, 212, 1e-9, 'year-1 fee 212'); near(L[29].fee, 858, 1, 'year-30 fee ≈ 858');
ok(Z.s1hint.includes('212') && Z.s1hint.includes('858') && E.s1hint.includes('$212') && E.s1hint.includes('$858'), 'hint quotes 212/858');
near(L[0].lostGrowth, 0, 1e-9, 'no lost growth in year 1');
for (let i = 1; i < 30; i++) { ok(L[i].fee > L[i - 1].fee, 'fees grow'); ok(L[i].lostGrowth > L[i - 1].lostGrowth, 'lost growth grows'); }
ok(L[29].lostGrowth > L[29].cum, 'by year 30 lost growth > fees paid (s1hint)');
// ledger agrees with closed form, and lost growth = fees compounded at the gross return
L.forEach((q, i) => {
  near(q.bal, M.value(B.P, B.r, B.f, q.t), 1e-6, 'ledger = closed form');
  let fv = 0; for (let k = 0; k <= i; k++) fv += L[k].fee * Math.pow(1 + B.r, q.t - L[k].t);
  near(q.gap, fv, 1e-6, 'gap = fees paid grown at 6% (the fees’ lost growth)');
});
ok(Math.max(...L.map(q => q.fee)) < 1000 && Math.max(...L.map(q => q.gap)) < 32000, 'c1 axes hold the ledger');

// ---- step 2: kept share ----
for (let f = 0; f <= 0.025 + 1e-9; f += 0.001) for (const r of [0.01, 0.03, 0.06, 0.1]) near(M.value(B.P, r, f, 30) / M.value(B.P, r, 0, 30), M.kept(f, 30), 1e-12, 'kept share independent of r');
near(M.kept(0.01, 30), 0.74, 0.005, '74% at 30 y'); near(M.kept(0.01, 50), 0.60, 0.006, '60% at 50 y'); near(M.kept(0.02, 30), 0.55, 0.006, '≈ 55% at 2%');
ok(Z.s2hint.includes('74%') && Z.s2hint.includes('60%') && Z.s2hint.includes('55%') && E.s2hint.includes('74%') && E.s2hint.includes('55%'), 'hint quotes 74/60/55');
for (let f = 0.001; f <= 0.025 + 1e-9; f += 0.001) for (let T = 1; T <= 50; T++) ok(f * T >= 1 - M.kept(f, T) - 1e-12, 'f × T overstates the loss');
ok(1 - M.kept(0.001, 30) > 0.029, '0.1% nearly flat but not zero');

// ---- step 3: share of the gain ----
near(M.gainShareLost(B.P, 0.06, 0.01, 30), 0.31, 0.01, '≈ 31% at 6%'); near(M.gainShareLost(B.P, 0.02, 0.01, 30), 0.58, 0.01, '≈ 58% at 2%');
ok(M.gainShareLost(B.P, 0.01, 0.01, 30) > 1, 'over 100% at 1%'); ok(M.value(B.P, 0.01, 0.01, 30) < B.P, 'principal not kept at 1% (s3noteOver)');
for (let r = 1.5; r <= 10; r += 0.5) { ok(M.gainShareLost(B.P, r / 100, 0.01, 30) < M.gainShareLost(B.P, (r - 0.5) / 100, 0.01, 30), 'lower return, bigger bite'); ok(M.gainShareLost(B.P, r / 100, 0.01, 30) < 1, 'under 100% from 1.5%'); }
ok(M.gainShareLost(B.P, 0.01, 0.01, 30) * 100 < 120, 'c3 axis holds r = 1%');

// ---- step 4: one-time charge ----
near(M.loadAsAnnual(0.03, 1), 0.03, 1e-12, 'held 1 year = full charge');
for (const Lc of [0.005, 0.01, 0.03, 0.05]) for (let T = 1; T <= 50; T++) { near(Math.pow(1 - M.loadAsAnnual(Lc, T), T), 1 - Lc, 1e-12, 'equivalence'); if (T > 1) ok(M.loadAsAnnual(Lc, T) < M.loadAsAnnual(Lc, T - 1), 'spreads thinner'); }
let prev = Infinity;
for (let f = 0.1; f <= 2.0001; f += 0.1) { const be = M.breakEvenYears(0.03, f / 100); ok(be <= prev, 'higher yearly fee, earlier break-even'); prev = be; ok(M.loadAsAnnual(0.03, be) <= f / 100 + 1e-15 && (be === 1 || M.loadAsAnnual(0.03, be - 1) > f / 100), 'break-even is the first whole year'); }
ok(M.breakEvenYears(0.03, 0.005) === 7, '3% vs 0.5%: 7 years');
for (let Lp = 0.5; Lp <= 5; Lp += 0.5) for (let f = 0.1; f <= 2.0001; f += 0.1) { const be = M.breakEvenYears(Lp / 100, f / 100); ok(be <= 50 || (f < 0.15 && Lp >= 4.5), 'break-even beyond the 50-year axis only for ≥ 4.5% vs 0.1% (readout then says s4never)'); }

// ---- step 5: break-even extra return ----
for (let f2 = 0.1; f2 <= 2.5001; f2 += 0.1) {
  const x = M.extraNeeded(0.06, 0.001, f2 / 100);
  near(M.value(1, 0.06 + x, f2 / 100, 30), M.value(1, 0.06, 0.001, 30), 1e-9, 'extra return exactly closes the gap');
  ok(x >= (f2 - 0.1) / 100 - 1e-12, 'always at least the fee difference');
  ok(100 * x <= 3, 'c5 axis holds the curve');
}
ok(M.extraNeeded(0.06, 0.001, 0.025) - 0.024 > M.extraNeeded(0.06, 0.001, 0.01) - 0.009, 'pulls away as f₂ grows');

// ---- table ----
near(1 - M.kept(0.02, 40), 0.554, 0.001, 'table corner');

// ---- bilingual parity ----
const zk = Object.keys(Z).sort(), ek = Object.keys(E).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(Z[k]), ph(E[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['s3noteOk']);
for (const k of zk) ok(NEUTRAL.has(k) || Z[k] !== E[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const k of Object.keys(STRINGS[l])) ok(!/左图|右图|left chart|right chart|on the (left|right)/i.test(STRINGS[l][k]), 'no left/right chart wording in ' + k);
const i18nSrc = fs.readFileSync(path.join(dir, 'i18n.js'), 'utf8');
for (const l of ['zh', 'en']) { const block = i18nSrc.split(`${l}: {`)[1].split(/\n  \}/)[0]; const keys = [...block.matchAll(/(?:^|[\s,])([A-Za-z0-9]+):\s*'/g)].map(m => m[1]); ok(keys.length === new Set(keys).size, 'no duplicate keys in ' + l); }

// ---- every key referenced in HTML/app exists; controls exist ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(Z[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(Z[m[1]] !== undefined, 'app key ' + m[1]);
for (const k of ['correct', 'wrong']) ok(Z[k] !== undefined, 'indirect key ' + k);
for (const id of ['checkQuiz', 't1', 'play1', 'f2', 'T2', 'r3', 'L4', 'f4', 'f5', 'table6']) ok(html.includes(`id="${id}"`), 'control ' + id);
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
ok(fs.existsSync(path.join(dir, '../../../investment/rates/fees-compounding/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS fees-compounding core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · 1% × 30 y takes ${(100 * lost30).toFixed(1)}%`);
