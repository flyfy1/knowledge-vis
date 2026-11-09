'use strict';
// Definite integral (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node variants/claude-code/integral/tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0;
const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b}`);
const grid = (lo, hi, st) => { const out = []; for (let v = lo; v <= hi + 1e-9; v += st) out.push(Math.round(v * 1000) / 1000); return out; };
const mid = (fn, a, b, n = 20000) => M.riemann(fn, a, b, n, 'mid').sum;

// ---- step 0: square counts, checked square by square against the geometry ----
let prevGap = Infinity;
for (const Ng of M.GRID_NS) {
  const cols = M.gridColumns(Ng), c = 1 / Ng;
  cols.forEach((col, i) => {
    for (let j = 0; j < Ng; j++) {
      const lo = M.sq(i * c), hi = M.sq((i + 1) * c);          // min and max of x² on the column
      const fullyUnder = (j + 1) * c <= lo + 1e-12, touches = j * c < hi - 1e-12;
      ok(fullyUnder === (j < col.inside), `inside count N=${Ng} col ${i} row ${j}`);
      ok(touches === (j < col.touch), `touch count N=${Ng} col ${i} row ${j}`);
    }
  });
  const b = M.gridBounds(Ng);
  ok(b.lower < 1 / 3 && 1 / 3 < b.upper, 'true area between the counts');
  ok(b.upper - b.lower < prevGap, 'finer grid → narrower gap'); prevGap = b.upper - b.lower;
}
assert.deepEqual([M.gridBounds(40).lower, M.gridBounds(40).upper], [0.3125, 0.36125]); checks++;

// ---- step 1: Riemann sums vs closed forms ----
let prev = null;
for (const n of M.NS) {
  const L = M.riemann(M.sq, 0, 1, n, 'left').sum, R = M.riemann(M.sq, 0, 1, n, 'right').sum, Mm = M.riemann(M.sq, 0, 1, n, 'mid').sum;
  near(L, M.Lsq(n), 1e-12, 'left sum = (n−1)(2n−1)/(6n²)'); near(R, M.Rsq(n), 1e-12, 'right sum = (n+1)(2n+1)/(6n²)'); near(Mm, M.Msq(n), 1e-12, 'midpoint = 1/3 − 1/(12n²)');
  ok(L < 1 / 3 && 1 / 3 < R, 'L < 1/3 < R'); near(R - L, 1 / n, 1e-12, 'gap exactly 1/n');
  ok(Math.abs(Mm - 1 / 3) < Math.min(1 / 3 - L, R - 1 / 3), 'midpoint closer than both');
  if (prev) near((R - L) / prev, 0.5, 1e-12, 'gap halves when n doubles');
  prev = R - L;
}
assert.deepEqual([M.num(M.Lsq(4), 6), M.num(M.Rsq(4), 6)], ['0.21875', '0.46875']); checks++;   // quiz ②
ok(Math.abs(M.Msq(4) - 1 / 3) < 0.006, 'midpoint already close at n = 4 (s1hint)');
ok(M.NS.includes(16) && M.NS.indexOf(16) <= M.NS.length - 1, 'n = 16 reachable for the conclusion');

// ---- step 2: braking car ----
near(mid(M.V, 0, M.T_END), M.DIST, 1e-9, 'true distance 24 m'); near(0.5 * 4 * 12, M.DIST, 0, 'triangle ½·4·12');
ok(M.V(M.T_END) === 0 && M.V(0) === 12, 'from 12 m/s to rest in 4 s');
for (const n of M.NS2) {
  const cum = M.cumulative(n), s = M.riemann(M.V, 0, M.T_END, n, 'left').sum;
  near(cum[cum.length - 1].total, s, 1e-12, 'running total ends at the sum'); near(s, 24 + 24 / n, 1e-12, 'left sum = 24 + 24/n');
  cum.forEach(q => near(q.part, q.h * (M.T_END / n), 1e-12, 'each slice = speed × time')); ok(s <= 50, 'road axis holds the total');
}
assert.equal(M.num(M.riemann(M.V, 0, 4, 1, 'left').sum), '48'); assert.equal(M.num(M.riemann(M.V, 0, 4, 32, 'left').sum), '24.75'); checks += 2;

// ---- step 3: signed accumulation ----
for (const b of grid(0.1, 2, 0.05).concat([M.ZERO_NET])) {
  const p = M.signedParts(b);
  near(p.net, mid(M.g, 0, b), 1e-7, 'net = numerical integral');
  ok(p.neg <= 0 && p.pos >= 0, 'parts carry their signs');
  if (b <= 1) ok(p.pos === 0 && p.net < 0, 'only negative up to b = 1');
  if (Math.abs(b - M.ZERO_NET) > 1e-9) ok((p.net < 0) === (b < M.ZERO_NET), 'negative before √3, positive after');
  ok(M.g(b) <= 3.2, 'curve inside the plot');
}
near(M.signedParts(M.ZERO_NET).net, 0, 1e-12, 'cancels at √3'); near(M.signedParts(1).net, -2 / 3, 1e-12, 'b = 1 gives −2/3 (quiz ③ feedback)');
ok(!grid(0.1, 2, 0.05).some(b => Math.abs(b - M.ZERO_NET) < 1e-9), '√3 is off the slider grid, hence the button');

// ---- step 4: accumulation function ----
for (const x of grid(0, 1.5, 0.05)) {
  near(M.Atrace(x), M.A(x), 2e-6, 'trace of 400 strips ≈ x³/3');
  let last = Infinity;
  for (const dx of M.DXS) {
    const gr = M.growth(x, dx);
    near(gr.excess, x * dx + dx * dx / 3, 1e-9, 'excess = x·dx + dx²/3'); ok(gr.excess > 0, 'growth rate slightly above x²'); ok(gr.excess < last, 'excess shrinks with dx'); last = gr.excess;
    ok(x + dx <= 2.05 && M.A(x + dx) <= 2.9 && M.sq(x + dx) <= 4.2, 'inside the plots');
  }
}
near((M.A(1 + 1e-6) - M.A(1 - 1e-6)) / 2e-6, 1, 1e-6, 'A′(1) = 1 = 1²');
near(M.A(1) - M.A(0), 1 / 3, 1e-15, '∫₀¹ x² dx = 1/3 by the antiderivative');

// ---- step 5: quiz ----
near(mid(x => x, 0, 2), Number(STRINGS.zh.q1B), 1e-9, 'quiz ① = 2');
near(M.A(2) - M.A(1), 7 / 3, 1e-12, 'quiz ④ = 7/3'); near(mid(M.sq, 1, 2), 7 / 3, 1e-8, 'quiz ④ numerically'); near(M.A(2), 8 / 3, 1e-12, 'distractor 8/3 is 0 → 2');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['q1A', 'q1B', 'q1C', 'q4A', 'q4B', 'q4C', 'lg0Curve', 'lg4Exact']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) { ok(STRINGS[l].s1e.includes('(n − 1)(2n − 1)/(6n²)') && STRINGS[l].s1e.includes('(n + 1)(2n + 1)/(6n²)'), 'closed forms quoted'); ok(STRINGS[l].s2e.includes('12 − 3t'), 'speed formula quoted'); ok(STRINGS[l].s2hint.includes('48 m') && STRINGS[l].s2hint.includes('24.75 m'), 'distance range quoted'); ok(STRINGS[l].s4e.includes('400') && STRINGS[l].s3e.includes('0.05'), 'trace strips and strip width quoted'); }

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['g0', 'n1', 'modeL', 'modeR', 'modeM', 'n2', 'drive2', 'b3', 'zero3', 'x4', 'dx4', 'q1check', 'q2check', 'q3check', 'q4check']) ok(html.includes(`id="${id}"`), 'control ' + id);
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
ok(fs.existsSync(path.join(dir, '../../../math/calculus/integral/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS integral core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · grid gap at N = 40: ${(M.gridBounds(40).upper - M.gridBounds(40).lower).toFixed(5)}`);
