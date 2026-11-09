'use strict';
// Limits and ε–δ (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const grid = (lo, hi, st) => { const a = []; for (let v = lo; v <= hi + 1e-9; v += st) a.push(Math.round(v * 1e6) / 1e6); return a; };

// ---- step 0: the hole; distance from 2 equals h; rounding stays far below the digits shown ----
for (const k of grid(1, 6, 0.5)) {
  const h = Math.pow(10, -k), dec = Math.min(12, Math.ceil(k) + 3);
  for (const x of [1 - h, 1 + h]) {
    const err = Math.abs(M.hole(x) - (x + 1));
    ok(err < 1e-9, `literal formula = x + 1 within 1e-9 at h=${h} (${err})`);
    ok(err < 0.5 * Math.pow(10, -dec), 'rounding below the displayed decimals');
    // |f − 2| = h to 3 significant figures (the table shows 3)
    ok(Math.abs(Math.abs(M.hole(x) - 2) / h - 1) < 5e-4, 'distance from 2 equals h (3 s.f.)');
  }
}
ok(!isFinite(M.hole(1)), 'f(1) is undefined (0/0)');
ok(Math.abs(Math.pow(10, -0.5) - 1 / 3) < 0.02, 'each notch shrinks h to about 1/3 (s0e)');

// ---- steps 1–2: δ* for x² ----
for (const a of grid(0.5, 3, 0.05)) for (const e of grid(0.05, 1, 0.05)) {
  const ds = M.bestDelta(a, e);
  ok(Math.abs(M.worstSq(a, ds) - e) < 1e-9, 'worst error at δ* equals ε');
  ok(M.wins(a, e, ds) && !M.wins(a, e, ds * (1 + 1e-6)), 'δ* wins, anything larger loses');
  // brute force: sample the open interval and check the sup
  let sup = 0; for (let i = 1; i < 2000; i++) { const x = a - ds + 2 * ds * i / 2000; sup = Math.max(sup, Math.abs(x * x - a * a)); }
  ok(sup < e, 'sampled |x² − a²| < ε inside (a − δ*, a + δ*)');
  // the right side decides (s1hint, s2e): left-side worst error is smaller
  ok((ds <= a ? 2 * a * ds - ds * ds : a * a) < 2 * a * ds + ds * ds, 'right side binds');
  // s2hint: ratio to ε/(2a) is below 1
  ok(ds / (e / (2 * a)) < 1, 'δ* < ε/(2a)');
}
// ratio → 1 as ε → 0; δ* → 0 as a grows (no single δ for every a)
for (const a of [0.5, 1, 3]) ok(1 - M.bestDelta(a, 1e-8) / (1e-8 / (2 * a)) < 1e-6, 'ratio → 1');
ok(M.bestDelta(1000, 0.5) < 3e-4, 'δ* → 0 as a → ∞');
// step 1 slider grid: win ⇔ δ ≤ δ*
for (const e of grid(0.05, 1, 0.05)) for (const d of grid(0.01, 0.6, 0.01)) ok(M.wins(1, e, d) === (d <= M.bestDelta(1, e) + 1e-12), 'win iff δ ≤ δ*');
// the default (ε = 0.5, δ = 0.4) loses, so the first view shows red
ok(!M.wins(1, 0.5, 0.4), 'default round shows a loss');

// ---- step 3: witnesses ----
const Ls = grid(-2, 2, 0.1), ks = grid(0.3, 3, 0.1);
for (const L of Ls) for (const k of ks) {
  const d = Math.pow(10, -k);
  for (const kind of ['jump', 'osc', 'blow']) {
    const w = M.witness(kind, L, 0.5, d);
    ok(w.x !== null && Math.abs(w.x) < d && w.x !== 0 && Math.abs(M.F3[kind](w.x) - L) >= 0.5, `${kind}: witness for every L and δ`);
  }
  const w = M.witness('damped', L, 0.5, d);
  if (w.x !== null) ok(Math.abs(w.x) < d && Math.abs(M.F3.damped(w.x) - L) >= 0.5, 'damped witness valid');
  if (w.proof) ok(d <= 0.5 - Math.abs(L), 'proof only when δ ≤ ε − |L|');
  if (Math.abs(L) >= 0.5) ok(w.x !== null, 'damped: |L| ≥ ε always loses');
}
// s3hint: control with L = 0 wins once δ < 0.5; every slider δ except the first is below 0.5
for (const k of ks) { const d = Math.pow(10, -k); ok(M.witness('damped', 0, 0.5, d).proof === (d <= 0.5), 'L = 0 wins iff δ ≤ 0.5'); }
// jump: values 1 and −1 differ by 2, so max(|1 − L|, |−1 − L|) ≥ 1 ≥ 0.5 for all L
for (const L of Ls) ok(Math.max(Math.abs(1 - L), Math.abs(-1 - L)) >= 1, 'jump gap');

// ---- step 4: ε–N ----
for (const k of grid(0, 2, 0.1)) {
  const e = Math.pow(10, -k);
  const A = M.epsN('alt', e);
  // brute-force check of the claim far past N
  for (let n = A.N; n < A.N + 3000; n++) if (Math.abs(M.SEQ.alt.a(n) - 1) >= e) assert.fail('alt term past N out of band');
  ok(A.N === 1 || Math.abs(M.SEQ.alt.a(A.N - 1) - 1) >= e, 'alt N is the smallest');
  ok(A.N === Math.floor(2 / e) + 1 || Math.abs(2 / e - Math.round(2 / e)) < 1e-9, 'alt N = ⌊2/ε⌋ + 1');
  const S = M.epsN('sin', e);
  ok(S.N <= S.guaranteed, 'actual N ≤ guaranteed N');
  for (let n = S.N; n < S.guaranteed + 2000; n++) if (Math.abs(M.SEQ.sin.a(n)) >= e) assert.fail('sin term past N out of band');
  ok(S.N === 1 || Math.abs(M.SEQ.sin.a(S.N - 1)) >= e, 'sin N is the smallest');
  ok(M.epsN('flip', e).N === null, 'flip has no N for ε ≤ 1');
}
// s4hint: ten times smaller ε → about ten times larger N (alt); sin grows like 1/ε²
{ const r = M.epsN('alt', 0.01).N / M.epsN('alt', 0.1).N; ok(r > 9 && r < 11, 'alt N ×10 (' + r + ')'); }
for (const e of [0.1, 0.05, 0.02, 0.01]) { const N = M.epsN('sin', e).N; ok(N > 0.9 / (e * e) && N <= 1 / (e * e) + 1, 'sin N ≈ 1/ε² at ε=' + e + ' (' + N + ')'); }
// the plotted window holds every red dot (nMax = 1.25·N) and stays drawable
ok(Math.ceil(1.25 * M.epsN('sin', 0.01).N) < 13000, 'step 4 axis stays under 13000 terms');

// ---- step 5: rules ----
for (const k of grid(-2, 2, 0.05)) {
  const e = Math.pow(10, k);
  const A = M.ruleCheck('q4', e), B = M.ruleCheck('q5', e), Cc = M.ruleCheck('min', e);
  ok(!A.ok, 'ε/4 loses for every ε'); ok(B.ok === (e <= 5 + 1e-9), 'ε/5 wins iff ε ≤ 5'); ok(Cc.ok, 'min(1, ε/5) wins for every ε');
  for (const c of [A, B]) if (!c.ok) ok(Math.abs(c.x - 2) < c.d && c.err >= e, 'counterexample is valid');
  ok(A.ratio <= 3.2 && B.ratio <= 3.2, 'ratio fits the 0–3.2 axis');
}
// the textbook inequality behind rule C
for (const e of [0.01, 1, 5, 6, 100]) { const d = Math.min(1, e / 5); for (let i = 1; i < 1000; i++) { const x = 2 - d + 2 * d * i / 1000; ok(Math.abs(x * x - 4) < e, 'rule C holds'); } }
// quiz: δ = ε/3 for 3x + 1 at 2; δ = 3ε and ε + 1 fail for some ε
ok([0.01, 1, 100].every(e => 3 * (e / 3) <= e), 'ε/3 works');
ok(3 * (3 * 1) > 1 && 3 * (1 + 1) > 1, 'the other two lose at ε = 1');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['th0h', 'th0l', 'th0r', 'rB', 'rC', 'lgDs', 'quizA', 'quizB', 'quizC']); // symbols only
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');

// ---- keys and controls ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const k of ['gA', 'gB', 'gC', 'rA', 'rB', 'rC', 's1win', 's1lose', 's3proof', 's3none', 'correct', 'wrong']) ok(STRINGS.zh[k] !== undefined, 'dynamic key ' + k);
for (const id of ['k0', 'sweep0', 'clear0', 'e1', 'd1', 'judge1', 'newEps1', 'clear1', 'a2', 'e2', 'kJump', 'kOsc', 'kBlow', 'kDamped', 'L3', 'k3', 'qAlt', 'qSin', 'qFlip', 'k4', 'rA', 'rB', 'rC', 'k5', 'checkQuiz']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('id="k3" data-step="3" type="range" min="0.3" max="3" step="0.1"') && html.includes('id="L3" data-step="3" type="range" min="-2" max="2" step="0.1"'), 'step 3 ranges as tested');
ok(html.includes('id="k4" data-step="4" type="range" min="0" max="2" step="0.1"') && html.includes('id="k5" data-step="5" type="range" min="-2" max="2" step="0.05"'), 'step 4/5 ranges as tested');

// ---- deep links ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../math/calculus/limits-epsilon/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS limits-epsilon core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
