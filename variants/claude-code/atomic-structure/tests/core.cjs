'use strict';
// Atomic structure (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const eq = (a, b, m) => { assert.deepEqual(a, b, m); checks++; };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b}`);

// ---- lookup table: symbols and the usual mass numbers (independent list) ----
const SYMS = 'H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca'.split(' ');
const A_COMMON = [1, 4, 7, 9, 11, 12, 14, 16, 19, 20, 23, 24, 27, 28, 31, 32, 35, 40, 39, 40];
for (let Z = 1; Z <= 20; Z++) {
  eq(M.element(Z).sym, SYMS[Z - 1], 'symbol ' + Z);
  eq(Z + M.element(Z).N, A_COMMON[Z - 1], 'A = Z + N for ' + SYMS[Z - 1]);
}
ok(M.element(0) === null && M.element(21) === null, 'only Z = 1…20');

// ---- step 2: the 2, 8, 8 rule against the textbook table ----
const TABLE = { 1: [1], 2: [2], 3: [2, 1], 6: [2, 4], 8: [2, 6], 10: [2, 8], 11: [2, 8, 1], 12: [2, 8, 2], 13: [2, 8, 3], 14: [2, 8, 4], 16: [2, 8, 6], 17: [2, 8, 7], 18: [2, 8, 8], 19: [2, 8, 8, 1], 20: [2, 8, 8, 2] };
for (const [e, arr] of Object.entries(TABLE)) eq(M.shells(Number(e)), arr, 'arrangement for ' + e);
for (let e = 0; e <= 20; e++) {
  const s = M.shells(e);
  eq(s.reduce((a, b) => a + b, 0), e, 'shells add up for ' + e);
  s.forEach((n, i) => { ok(n <= (i === 0 ? 2 : 8), 'shell capacity'); if (i < s.length - 1) ok(n === (i === 0 ? 2 : 8), 'inner shells full before the next opens'); });
}
assert.throws(() => M.shells(21)); assert.throws(() => M.shells(-1)); checks += 2;
// sodium walk-through in s2hint: 2 into shell 1, 8 into shell 2, the 11th opens shell 3
eq(M.shells(2), [2], '2 electrons fill shell 1'); eq(M.shells(10), [2, 8], '10 fill shells 1–2'); eq(M.shells(11).length, 3, '11th opens shell 3');
// quiz 1: chlorine is 2, 8, 7 (option a)
eq(M.shells(17), [2, 8, 7], 'quiz: chlorine');
ok(STRINGS.zh.quizA === '2, 8, 7' && STRINGS.en.quizA === '2, 8, 7', 'quiz option a is the right one');

// ---- step 3: outer shell and tendency ----
const KIND = { 1: ['lose', 1], 2: ['stable', 0], 3: ['lose', 1], 4: ['lose', 2], 5: ['lose', 3], 6: ['share', 0], 7: ['gain', 3], 8: ['gain', 2], 9: ['gain', 1], 10: ['stable', 0], 11: ['lose', 1], 12: ['lose', 2], 13: ['lose', 3], 14: ['share', 0], 15: ['gain', 3], 16: ['gain', 2], 17: ['gain', 1], 18: ['stable', 0], 19: ['lose', 1], 20: ['lose', 2] };
for (let Z = 1; Z <= 20; Z++) { const tz = M.tendency(Z); eq([tz.kind, tz.n], KIND[Z], 'tendency ' + SYMS[Z - 1]); }
// s3hint: full (cyan) bars exactly at 2, 10, 18; bars drop back to 1 exactly when a new shell opens (3, 11, 19)
eq([...Array(20).keys()].map(i => i + 1).filter(Z => M.tendency(Z).kind === 'stable'), [2, 10, 18], 'stable at 2, 10, 18');
const drops = []; for (let Z = 2; Z <= 20; Z++) if (M.outer(Z).count < M.outer(Z - 1).count) drops.push(Z);
eq(drops, [3, 11, 19], 'sawtooth drops where a new shell opens');
for (let Z = 3; Z <= 20; Z++) if (drops.includes(Z)) eq(M.outer(Z).count, 1, 'drop back to 1');
// s3e examples: Na, Mg lose; O, Cl gain; C, Si share; He, Ne, Ar stable
eq(['Na', 'Mg'].map(s => M.tendency(SYMS.indexOf(s) + 1).kind), ['lose', 'lose'], 'Na, Mg lose');
eq(['O', 'Cl'].map(s => M.tendency(SYMS.indexOf(s) + 1).kind), ['gain', 'gain'], 'O, Cl gain');
eq(['C', 'Si'].map(s => M.tendency(SYMS.indexOf(s) + 1).kind), ['share', 'share'], 'C, Si share');
ok(M.outer(2).cap === 2 && M.outer(10).cap === 8, 'outer cap 2 for shell 1, else 8');

// ---- step 4: ions ----
const ion = (Z, e) => M.ion(Z, e);
eq(ion(11, 10).label, 'Na⁺', 'Na⁺'); eq(ion(11, 10).noble, 10, 'Na⁺ like neon'); eq(ion(11, 10).shells, [2, 8], 'Na⁺ 2, 8');
eq(ion(17, 18).label, 'Cl⁻', 'Cl⁻'); eq(ion(17, 18).noble, 18, 'Cl⁻ like argon');
eq(ion(12, 10).label, 'Mg²⁺', 'Mg²⁺'); eq(ion(8, 10).label, 'O²⁻', 'O²⁻'); eq(ion(13, 10).label, 'Al³⁺', 'Al³⁺');
eq(ion(11, 11).label, 'Na', 'neutral has no charge');
for (let Z = 1; Z <= 20; Z++) for (let e = Math.max(0, Z - 3); e <= Math.min(20, Z + 3); e++) {
  const q = ion(Z, e); eq(q.charge, Z - e, 'net charge = Z − e');
  ok(q.sym === SYMS[Z - 1], 'identity kept when electrons change');
}
// every lose/gain verdict is reachable with the step-4 buttons and does fill the outer shell
for (let Z = 1; Z <= 20; Z++) {
  const tz = M.tendency(Z); if (tz.kind !== 'lose' && tz.kind !== 'gain') continue;
  const e = tz.kind === 'lose' ? Z - tz.n : Z + tz.n;
  const [lo, hi] = M.eRange(Z);
  ok(tz.n <= 3 && e >= lo && e <= hi, 'reachable with the step-4 buttons for ' + SYMS[Z - 1]);
  const q = ion(Z, e);
  ok(e === 0 || q.outer.full, 'outer shell full after the verdict for ' + SYMS[Z - 1]);
}
// button range: ≤ 3 either way, never past the neighbouring noble arrangement; noble gases cannot change
for (let Z = 1; Z <= 20; Z++) { const [lo, hi] = M.eRange(Z); ok(lo <= Z && Z <= hi && Z - lo <= 3 && hi - Z <= 3 && lo >= 0 && hi <= 20, 'eRange ' + Z); }
for (const Z of [2, 10, 18]) eq(M.eRange(Z), [Z, Z], 'noble gas fixed ' + Z);
eq(M.eRange(11), [10, 14], 'Na range'); eq(M.eRange(17), [14, 18], 'Cl range');
// quiz 2: magnesium → Mg²⁺ (option a)
eq(M.tendency(12).kind + M.tendency(12).n, 'lose2', 'Mg loses 2'); ok(STRINGS.en.quiz2A.startsWith('Mg²⁺'), 'quiz 2 option a is Mg²⁺');

// ---- step 1: particles ----
const ppe = M.PROTON_PER_ELECTRON; eq(Math.round(ppe), 1836, 'proton ≈ 1836 electrons');
near(M.MASS.n / M.MASS.p, 1, 0.002, 'proton and neutron weigh about the same');

// ---- step 0: true-scale zoom and shares (carbon-12) ----
const q = M.shares(6, 6);
near(q.rN, 2.747e-15, 0.001e-15, 'carbon nucleus radius 1.2 fm × 12^(1/3)');
eq(Math.round(q.ratio / 1000) * 1000, 28000, 'atom ≈ 28,000 × nucleus');
eq(+(q.massNuc * 100).toFixed(2), 99.97, 'nucleus 99.97 % of mass');
eq(+(q.massEl * 100).toPrecision(2), 0.027, 'electrons 0.027 % of mass');
eq(+(q.volNuc * 100).toPrecision(2), 4.5e-12, 'nucleus 4.5×10⁻¹² % of volume');
near(M.viewWidth(0), 6e-10, 1e-22, 'view starts at 600 pm'); near(M.viewWidth(1), 2e-14, 1e-26, 'view ends at 20 fm');
// s0hint: at the left end the nucleus is under 1 px; it only reaches 2 px (drawn as a disc) past halfway;
// the atom's dashed edge is visible at the left end (fits inside the canvas). Canvas widths 240–920 px.
for (let W = 240; W <= 920; W += 10) {
  const H = W >= 600 ? 380 : 330;
  ok(M.pixels(M.viewWidth(0), W).nucleus < 1, 'nucleus < 1 px at the start, W=' + W);
  ok(M.pixels(M.viewWidth(0), W).atom < H - 90, 'atom edge inside the frame at the start, W=' + W);
  for (let s = 0; s <= 0.5; s += 0.01) ok(M.pixels(M.viewWidth(s), W).nucleus < 2, `nucleus still a cross at s=${s.toFixed(2)}, W=${W}`);
  ok(M.pixels(M.viewWidth(1), W).nucleus >= 2, 'nucleus visible at the end');
  ok(M.pixels(M.viewWidth(1), W).nucleus < H - 110, 'nucleus fits the frame at the end');
}
for (const m of [6e-10, 1e-10, 3e-12, 7e-14, 2e-14]) { const L = M.niceLength(m); ok(L <= m && L > m / 5, 'scale bar length'); }

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['quizA', 'quizB', 'quizC']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5') && STRINGS[l].foot.includes('Atomic Structure') === (l === 'en'), 'footer names the model and the original');
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/左图|右图|left chart|right chart|left panel|right panel/i.test(v), 'no left/right figure references: ' + k);

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const m of app.matchAll(/'(v[A-Z][a-z]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'verdict key ' + m[1]);
for (const id of ['z0', 'pPlus', 'pMinus', 'nPlus', 'nMinus', 'nReset', 'z2', 'fill2', 'all2', 'checkQuiz', 'z3', 'z4', 'take4', 'add4', 'neutral4', 'checkQuiz2']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder + css');
ok(!html.includes('canvas-label-guard'), 'no label guard');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../chemistry/matter/atomic-structure/index.html')), 'comparison link target exists');
for (let i = 0; i <= 5; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS atomic-structure core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · atom/nucleus ≈ ${Math.round(q.ratio)}`);
