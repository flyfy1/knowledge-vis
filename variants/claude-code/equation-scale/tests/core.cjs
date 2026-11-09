'use strict';
// Equation balance (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const S = (a, b, c, d) => ({ a, b, c, d });

// ---- weighing and exact balance ----
ok(M.isBalanced(S(1, 2, 0, 8), 6) && !M.isBalanced(S(1, 2, 0, 8), 5), 'exact equality, no tolerance');
ok(M.tiltDeg(S(1, 0, 0, 3), 7) > 0 && M.tiltDeg(S(1, 0, 0, 9), 7) < 0 && M.tiltDeg(S(1, 0, 0, 7), 7) === 0, 'tilt sign: + means left lower');
ok(Math.abs(M.tiltDeg(S(6, 24, 0, 0), 9)) === M.TILT_MAX, 'tilt is clamped (illustrative only)');

// ---- step 0: the strip brackets the hidden count; heavier side flips exactly at x ----
for (const x of M.STEP0_BAGS) {
  ok(x <= M.STEP0_MAX, 'bag reachable with the marbles on offer');
  for (let n = 0; n <= M.STEP0_MAX; n++) {
    const h = M.heavier(S(1, 0, 0, n), x);
    ok(h === (n < x ? 'L' : n > x ? 'R' : '='), `heavier side n=${n} x=${x}`);
  }
}

// ---- invariance: same move on both pans keeps a level balance level (and a tipped one tipped) ----
let seed = 11; const rnd = k => { seed = (seed * 1103515245 + 12345) % 2147483648; return Math.floor(seed / 2147483648 * k); };
const ops = [{ kind: 'add', what: 'm', n: 1 }, { kind: 'add', what: 'm', n: 3 }, { kind: 'sub', what: 'm', n: 1 }, { kind: 'sub', what: 'm', n: 2 }, { kind: 'add', what: 'bag', n: 1 }, { kind: 'sub', what: 'bag', n: 1 }, { kind: 'mul', k: 2 }, { kind: 'mul', k: 3 }, { kind: 'div', k: 2 }, { kind: 'div', k: 3 }];
let applied = 0;
for (let trial = 0; trial < 400; trial++) {
  const x = 1 + rnd(8), a = 1 + rnd(3), b = rnd(6), c = rnd(a), d = (a - c) * x + b; // level by construction (d ≥ b)
  const s = S(a, b, c, d); if (!M.isBalanced(s, x) || d > 24) continue;
  for (const op of ops) {
    const r = M.applyOp(s, op);
    if (r.ok) { applied++; ok(M.isBalanced(r.state, x), 'both-pan move keeps level ' + JSON.stringify([s, op])); }
    const tipped = S(a, b + 1, c, d), r2 = M.applyOp(tipped, op);
    if (r2.ok) ok(!M.isBalanced(r2.state, x), 'both-pan move keeps a tipped balance tipped');
  }
  const one = M.applyOp(s, { kind: 'oneAdd', side: 'L', what: 'm', n: 1 });
  if (one.ok) ok(!M.isBalanced(one.state, x), 'one-pan add tips it');
  const oneM = M.applyOp(s, { kind: 'oneMul', side: 'L', k: 2 });
  if (oneM.ok && a * x + b > 0) ok(!M.isBalanced(oneM.state, x), 'one-pan doubling tips it');
}
ok(applied > 500, 'enough moves exercised: ' + applied);

// ---- refusals the page explains ----
assert.equal(M.applyOp(S(1, 2, 0, 8), { kind: 'sub', what: 'bag', n: 1 }).reason, 'needBags'); checks++;
assert.equal(M.applyOp(S(1, 2, 0, 8), { kind: 'sub', what: 'm', n: 3 }).reason, 'needMarbles'); checks++;
assert.equal(M.applyOp(S(1, 2, 0, 5), { kind: 'div', k: 2 }).reason, 'notEven'); checks++;
assert.equal(M.applyOp(S(3, 12, 0, 30), { kind: 'mul', k: 2 }).reason, 'tooMany'); checks++;
assert.equal(M.applyOp(S(0, 3, 0, 3), { kind: 'sub', what: 'm', n: 3 }).reason, 'emptyPan'); checks++;
// step 2 walk-through quoted in s2hint: x + 2 = 5 → ×2 → 2x + 4 = 10 → ÷2 → x + 2 = 5; ×3 then ×2 overflows
{
  let s = M.STEP2.start; assert.deepEqual(M.divisors(s), []); checks++;
  s = M.applyOp(s, { kind: 'mul', k: 2 }).state; assert.equal(M.exprString(s), '2x + 4 = 10'); checks++;
  assert.deepEqual(M.divisors(s), [2]); checks++;
  assert.equal(M.exprString(M.applyOp(s, { kind: 'div', k: 2 }).state), 'x + 2 = 5'); checks++;
  const s3 = M.applyOp(M.STEP2.start, { kind: 'mul', k: 3 }).state; assert.equal(M.exprString(s3), '3x + 6 = 15'); checks++;
  assert.equal(M.applyOp(s, { kind: 'mul', k: 3 }).reason, 'tooMany'); checks++; // 6x + 12 = 30: 30 marbles > 24 (quoted in tooMany)
  for (const l of ['zh', 'en']) ok(STRINGS[l].s2hint.includes('2x + 4 = 10') && STRINGS[l].s2e.includes('x + 2 = 5'), 'step 2 text quotes the model');
}
// step 1 starts level at x + 2 = 8
ok(M.isBalanced(M.STEP1.start, M.STEP1.x) && M.exprString(M.STEP1.start) === 'x + 2 = 8', 'step 1 start');
for (const l of ['zh', 'en']) ok(STRINGS[l].s1e.includes('x + 2 = 8') && STRINGS[l].reset1.includes('x + 2 = 8'), 'step 1 text');

// ---- divisors and isolation ----
assert.deepEqual(M.divisors(S(3, 2, 0, 14)), []); assert.deepEqual(M.divisors(S(3, 0, 0, 12)), [3]);
assert.deepEqual(M.divisors(S(4, 8, 0, 20)), [2, 4]); assert.deepEqual(M.divisors(S(2, 6, 0, 16)), [2]); checks += 4;
ok(M.isolated(S(1, 0, 0, 7)) === 'L' && M.isolated(S(0, 7, 1, 0)) === 'R', 'isolated either side');
ok(!M.isolated(S(1, 3, 0, 7)) && !M.isolated(S(2, 0, 0, 8)) && !M.isolated(S(1, 0, 1, 4)), 'not isolated');

// ---- the problems: positive whole answers, level at the start, solvable by the moves on offer ----
const all = [M.STEP3, ...M.STEP4, ...M.STEP5];
for (const p of all) {
  const v = M.solve(p.start);
  ok(v === p.x && Number.isInteger(v) && v > 0, 'answer ' + M.exprString(p.start));
  ok(M.isBalanced(p.start, p.x), 'starts level');
}
// breadth-first search with the page's buttons (n = 1..9, remove a bag, ×2, ÷2/3/4) reaches isolation
function bfs(start, x) {
  const key = s => [s.a, s.b, s.c, s.d].join(), seen = new Map([[key(start), 0]]), q = [start];
  const moves = [];
  for (let n = 1; n <= 9; n++) moves.push({ kind: 'sub', what: 'm', n }, { kind: 'add', what: 'm', n });
  moves.push({ kind: 'sub', what: 'bag', n: 1 }, { kind: 'mul', k: 2 }, { kind: 'div', k: 2 }, { kind: 'div', k: 3 }, { kind: 'div', k: 4 });
  while (q.length) {
    const s = q.shift(), dpt = seen.get(key(s));
    if (M.isolated(s)) return { depth: dpt, value: M.isolatedValue(s) };
    for (const m of moves) { const r = M.applyOp(s, m); if (r.ok && !seen.has(key(r.state))) { seen.set(key(r.state), dpt + 1); q.push(r.state); } }
  }
  return null;
}
const depth = all.map(p => { const r = bfs(p.start, p.x); ok(r && r.value === p.x, 'reachable ' + M.exprString(p.start)); return r.depth; });
assert.deepEqual(depth, [1, 2, 2, 2, 3, 3]); checks++; // one-step, two-step ×3, bags on both sides ×2 (three moves each)
// step 4 claims: equation 1 cannot be shared first; 2 and 3 work in either order
ok(M.divisors(M.STEP4[0].start).length === 0, 'eq 1: no sharing first');
{
  const a = M.applyOp(M.applyOp(M.STEP4[1].start, { kind: 'sub', what: 'm', n: 6 }).state, { kind: 'div', k: 2 }).state;
  const b0 = M.applyOp(M.STEP4[1].start, { kind: 'div', k: 2 }).state, b = M.applyOp(b0, { kind: 'sub', what: 'm', n: 3 }).state;
  ok(M.exprString(b0) === 'x + 3 = 8' && M.isolatedValue(a) === 5 && M.isolatedValue(b) === 5, 'eq 2 either order (s4hint)');
  const s30 = M.applyOp(M.STEP4[0].start, { kind: 'sub', what: 'm', n: 2 }).state;
  ok(M.exprString(s30) === '3x = 12' && M.divisors(s30).includes(3), 'eq 1: 3x = 12 then share');
  for (const l of ['zh', 'en']) ok(STRINGS[l].s4hint.includes('3x = 12') && STRINGS[l].s4hint.includes('x + 3 = 8') && STRINGS[l].s4e.includes('3x + 2 = 14'), 'step 4 text');
  const s5 = M.applyOp(M.STEP5[0].start, { kind: 'sub', what: 'bag', n: 1 }).state;
  ok(M.exprString(M.STEP5[0].start) === '3x + 1 = x + 9' && M.exprString(s5) === '2x + 1 = 9', 'step 5 first move');
  for (const l of ['zh', 'en']) ok(STRINGS[l].s5hint.includes('2x + 1 = 9') && STRINGS[l].s5e.includes('3x + 1 = x + 9'), 'step 5 text');
  ok(M.exprString(M.STEP3.start) === 'x + 5 = 9', 'step 3 equation');
  for (const l of ['zh', 'en']) ok(STRINGS[l].s3e.includes('x + 5 = 9') && STRINGS[l].s3t.includes('x + 5 = 9'), 'step 3 text');
}
// substitution check line
{ const sub = M.substitute(M.STEP4[0].start, 4); ok(sub.left === '3×4 + 2' && sub.L === 14 && sub.R === 14 && sub.ok, 'substitution'); }
// finale formula lines are right
for (const [s, v] of [[S(1, 3, 0, 10), 7], [S(2, 5, 0, 13), 4], [S(4, 2, 1, 11), 3]]) ok(M.solve(s) === v, 'formula ' + M.exprString(s));
for (const l of ['zh', 'en']) ok(STRINGS[l].formula.includes('4x + 2 = x + 11') && STRINGS[l].formula.includes('3x = 9'), 'formula text');
// no hidden value of a step-3..5 problem is printed in static text before solving (finale uses other equations)
for (const l of ['zh', 'en']) for (const p of all) ok(!STRINGS[l].formula.includes(M.exprString(p.start)), 'finale does not spoil ' + M.exprString(p.start));

// ---- quiz ----
for (const q of M.QUIZ) { ok(M.solve(q.start) === q.answer && q.options.includes(q.answer) && new Set(q.options).size === 4, 'quiz answer'); }
assert.equal(M.exprString(M.QUIZ[0].start), 'x + 7 = 12'); assert.equal(M.exprString(M.QUIZ[1].start), '2x + 3 = 15'); checks += 2;
for (const l of ['zh', 'en']) ok(STRINGS[l].why1.includes('5 + 7 = 12') && STRINGS[l].why2.includes('2×6 + 3 = 15'), 'quiz explanations');
{ const s = M.applyOp(S(2, 4, 0, 10), { kind: 'sub', what: 'm', n: 4 }).state; ok(M.exprString(s) === '2x = 6', 'q3 result'); }
for (const l of ['zh', 'en']) ok(STRINGS[l].why3.includes('2x = 6'), 'q3 explanation');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['formula']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
ok(!/移项/.test(Object.values(STRINGS.zh).join('')) && !/\btranspos/i.test(Object.values(STRINGS.en).join('')), 'no "move the term" rule');

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const m of app.matchAll(/data-i18n="([A-Za-z0-9_]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app data-i18n ' + m[1]);
for (const k of ['opAddM', 'opSubM', 'opAddB', 'opSubB', 'opMul', 'opDiv', 'opOneAddL', 'opOneMulL', 'needBags', 'needMarbles', 'notEven', 'tooMany', 'emptyPan', 'q1', 'q2', 'q3', 'q3a', 'q3b', 'q3c', 'q3d', 'why1', 'why2', 'why3', 'qWrong3b', 'qWrong3c', 'qWrong3d', 'check1a', 'check1b', 'check1c', 'check2a', 'check2b', 'check2c']) ok(STRINGS.zh[k] !== undefined, 'indirect key ' + k);
for (const id of ['add0', 'sub0', 'next0', 'add1m', 'sub1m', 'add1b', 'sub1b', 'one1', 'reset1', 'mul2', 'mul3', 'div2', 'div3', 'one2', 'reset2', 'quizBox']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder');
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
ok(fs.existsSync(path.join(dir, '../../../math/algebra/equation-scale/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS equation-scale core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · solve depths ${depth.join(',')}`);
