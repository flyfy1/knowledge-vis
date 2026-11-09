'use strict';
// Inequalities (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b}`);
const grid = (lo, hi, st) => { const out = []; for (let k = Math.round(lo / st); k * st <= hi + 1e-9; k++) out.push(+(k * st).toFixed(6)); return out; };

// ---- step 0: suitcase 3 + x ≤ 10 holds exactly for x ≤ 7; trying all 25 values gives the stretch 0..7 ----
const xs = grid(0, 12, 0.5);
ok(xs.length === 25, '25 values from 0 to 12');
for (const x of xs) ok(M.luggageOk(x) === (x <= 7), 'x = ' + x);
ok(Math.max(...xs.filter(M.luggageOk)) === 7 && xs.filter(M.luggageOk).length === 15, 'true stretch is 0..7 (15 values)');
ok(M.luggageOk(7) && !M.luggageOk(7.5), 'boundary 7 included, 7.5 excluded');

// ---- step 1: end points, probes ----
for (const a of grid(-5, 5, 0.5)) for (const op of M.OPS) for (const z of [10, 100, 1000]) {
  const holdsA = M.holds(a, op, a);
  ok(holdsA === !M.strict(op), 'end point is a solution iff the sign has “equal”');
  ok(M.holds(M.probe(a, op, z), op, a), 'zoomed neighbour is a solution');
  ok(M.holds(M.probe(a, op, 10 * z), op, a), 'an even closer neighbour is a solution too');
  ok(!M.holds(M.probe(a, M.FLIP[op], z), op, a), 'the neighbour on the other side is not');
  ok(Math.abs(M.probe(a, op, z) - a) === 1 / z || Math.abs(Math.abs(M.probe(a, op, z) - a) - 1 / z) < 1e-12, 'probe is one zoomed tick away');
}

// ---- step 2: adding c keeps order and the gap of 3 ----
for (const c of grid(-6, 6, 0.5)) { const q = M.shifted(M.P2, M.Q2, c); ok(q.rel === '<', 'still <'); near(q.gap, 3, 1e-12, 'gap 3'); }
{ const s = M.solve(1, 3, '≤', 10); ok(s.type === 'ray' && s.bound === 7 && s.op2 === '≤' && !s.flipped, '3 + x ≤ 10 → x ≤ 7'); }

// ---- step 3: multiplying by m ----
for (const m of grid(-3, 3, 0.25)) {
  const q = M.scaled(M.P, M.Q, m);
  ok(q.rel === (m > 0 ? '<' : m < 0 ? '>' : '='), 'order after × ' + m);
  near(q.gap, 3 * m, 1e-12, 'difference = 3m');
  ok(Math.abs(q.gap) <= 9 + 1e-9, 'record chart range ±9.5 holds every value');
}

// ---- step 4: solving; the test point always agrees with the shading ----
let rays = 0;
for (const a of grid(-3, 3, 0.5)) for (const b of grid(-6, 6, 1)) for (const c of grid(-6, 6, 1)) for (const op of M.OPS) {
  const s = M.solve(a, b, op, c);
  if (a === 0) { ok(s.type === (M.holds(b, op, c) ? 'all' : 'none'), 'a = 0 case'); }
  else {
    rays++;
    near(s.bound, (c - b) / a, 1e-12, 'bound = (c − b)/a');
    ok(s.flipped === (a < 0) && s.op2 === (a < 0 ? M.FLIP[op] : op), 'flip iff a < 0');
    ok(s.closed === !M.strict(op), 'closed end iff the sign has “equal”');
    ok(s.frac.den > 0 && M.gcd(s.frac.num, s.frac.den) === 1 && Math.abs(s.frac.num / s.frac.den - s.bound) < 1e-12, 'reduced fraction');
  }
  for (const x of grid(-8, 8, 0.5)) ok(M.inSolution(s, x) === M.holds(a * x + b, op, c), 'test point agrees with the shading');
}
ok(rays > 0, 'rays tested');
{ const s = M.solve(2, 3, '<', -2); ok(s.frac.num === -5 && s.frac.den === 2 && s.op2 === '<', 'default 2x + 3 < −2 → x < −5/2'); ok(!M.inSolution(s, 1) && !M.holds(2 * 1 + 3, '<', -2), 'default test x = 1: false, outside'); }
{ const s = M.solve(-2, 3, '<', -2); ok(s.flipped && s.op2 === '>' && s.bound === 2.5, 'negative a flips'); }

// ---- step 5: budget — the largest whole n with p·n + s ≤ M (brute force); rounding traps ----
for (const Mb of grid(20, 100, 5)) for (const p of grid(3, 12, 1)) for (const s of grid(0, 25, 1)) {
  const q = M.budget(Mb, p, s);
  let best = -1; for (let n = 0; n <= 40; n++) if (p * n + s <= Mb) best = n;
  ok(q.n === best, `max n for M=${Mb} p=${p} s=${s}`);
  ok((q.n < 0) === (Mb < s), 'no notebooks iff delivery exceeds budget');
  if (q.n >= 0) { ok(q.cost <= Mb && q.cost + p > Mb, 'cost fits, one more does not'); ok(q.left === Mb - q.cost && q.left < p, 'leftover less than one notebook'); }
  ok(q.bound <= 34, 'number line 0..34 covers every bound');
  const r = Math.round(q.bound);
  if (q.n >= 0 && r > q.n) ok(s + p * r > Mb, 'rounding up always breaks the budget');
}
{ const q = M.budget(60, 7, 5); ok(q.n === 7 && Math.round(q.bound) === 8 && 5 + 7 * 8 === 61, 'hint example: 7.86 → 7, rounding gives 8 costing 61'); }
{ const q = M.budget(60, 6, 8); ok(q.n === 8 && q.cost === 56 && q.left === 4 && q.bound.toFixed(2) === '8.67', 'default: 8.67 → 8, 56 spent, 4 left'); }

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set([]);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) { ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model'); ok(/不等式 · 天平倾斜，答案是一整段|Inequalities · A Tilted Scale Has a Whole Range of Answers/.test(STRINGS[l].foot), 'footer names the original'); }
ok(STRINGS.zh.compare.startsWith('对照另一版本：不等式 · 天平倾斜，答案是一整段'), 'compare link text');

// ---- every key referenced in HTML/app exists; controls; structure ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['x0', 'try0', 'clr0', 'a1', 'z1', 'c2s', 'm3', 'a4', 'b4', 'c4s', 'x4', 'ledger4', 'M5', 'p5', 's5']) ok(html.includes(`id="${id}"`), 'control ' + id);
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder + stylesheet');
ok(!/canvas-label-guard/.test(html + app), 'no canvas-label-guard');
ok(/<meta name="stage" content="junior">/.test(html) && /<meta name="category" content="math">/.test(html), 'stage/category match the original');

// ---- links land on existing pages/anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../math/algebra/inequalities/index.html')), 'comparison link target exists');

console.log(`PASS inequalities core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
