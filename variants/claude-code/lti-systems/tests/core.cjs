'use strict';
// LTI (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS, RULES } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const A_GRID = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

// ---- step 0: x[n] = Σ x[k]·δ[n−k] for every preset and every count ----
M.PRESETS.forEach((x, p) => {
  ok(x.length === M.N_IN, 'preset length 8');
  for (let c = 0; c <= 8; c++) {
    const s = M.partialSum(x, c, M.N_IN);
    for (let n = 0; n < M.N_IN; n++) ok(s[n] === (n < c ? x[n] : 0), `partial sum p${p} c${c} n${n}`);
    if (c > 0) { const pc = M.piece(x, c - 1); pc.forEach((v, n) => ok(v === (n === c - 1 ? x[c - 1] : 0), 'piece is a single stem')); }
  }
  const sum = new Array(M.N_IN).fill(0); for (let k = 0; k < M.N_IN; k++) M.piece(x, k, M.N_IN).forEach((v, n) => { sum[n] += v; });
  assert.deepEqual(sum, x); checks++;
  // every value fits the drawn axis ±2
  ok(x.every(v => Math.abs(v) <= 2), 'step 0 axis');
});

// ---- the box rules behave as their printed formulas say ----
const rnd = (() => { let s = 11; return () => { s = (s * 16807) % 2147483647; return s / 2147483647 * 4 - 2; }; })();
for (let trial = 0; trial < 50; trial++) {
  const x = Array.from({ length: M.L }, rnd);
  M.run('echo', x).forEach((v, n) => near(v, x[n] + 0.5 * (n >= 3 ? x[n - 3] : 0), 1e-12, 'echo rule'));
  M.run('diff', x).forEach((v, n) => near(v, x[n] - (n ? x[n - 1] : 0), 1e-12, 'diff rule'));
  let yp = 0; M.run('smooth', x).forEach((v, n) => { near(v, 0.6 * yp + 0.4 * x[n], 1e-12, 'smooth rule'); yp = v; });
  M.run('warm', x).forEach((v, n) => near(v, (1 + n / 8) * x[n], 1e-12, 'warm rule'));
}
ok(RULES.rule_smooth.includes('0.6') && RULES.rule_smooth.includes('0.4') && M.SMOOTH_A === 0.6, 'smooth rule text = model');

// ---- step 1: prediction from h equals the real run, for every LTI box and preset ----
for (const id of M.LTI_IDS) for (const x of M.PRESETS) { const r = M.slapAndPredict(id, x); ok(r.err < M.TOL, `step 1 prediction ${id}`); checks++; }
// h windows: echo h = δ + 0.5δ[n−3], diff h = δ − δ[n−1], smooth h = 0.4·0.6^n
assert.deepEqual(M.recordH('echo').slice(0, 5), [1, 0, 0, 0.5, 0]); checks++;
assert.deepEqual(M.recordH('diff').slice(0, 3), [1, -1, 0]); checks++;
M.recordH('smooth').forEach((v, n) => near(v, 0.4 * Math.pow(0.6, n), 1e-12, 'smooth h'));
// all h values inside the drawn ±1.2 axis
for (const id of M.LTI_IDS) ok(M.recordH(id).every(v => Math.abs(v) <= 1.2), 'step 1 h axis');

// ---- step 2: the check-up table (s2hint and s6fin) ----
const res = (id, test, A, d = 2) => (test === 'shift' ? M.shift(id, A, d) : M.TESTS[test](id, A, d)).res;
for (const A of A_GRID) for (let d = 1; d <= 4; d++) {
  for (const id of M.LTI_IDS) for (const test of ['sup', 'shift', 'pred']) ok(res(id, test, A, d) < M.TOL, `${id} passes ${test} A=${A}`);
  for (const id of ['square', 'offset']) { ok(res(id, 'sup', A)> 0.01, `${id} fails superposition A=${A}`); ok(res(id, 'shift', A, d) < M.TOL, `${id} passes shift`); ok(res(id, 'pred', A)> 0.01, `${id} prediction fails`); }
  ok(res('warm', 'sup', A) < M.TOL, 'warm passes superposition'); ok(res('warm', 'shift', A, d)> 0.01, 'warm fails shift'); ok(res('warm', 'pred', A)> 0.01, 'warm prediction fails');
  ok(res('clip', 'shift', A, d) < M.TOL, 'clipper passes shift');
  // clipper: all pass iff the mixed input stays within ±1 (A ≤ 1.25 on the slider grid)
  const inside = M.mix(A).every(v => Math.abs(v) <= 1);
  ok(inside === (A <= 1.25), `clipper linear range A=${A}`);
  ok((res('clip', 'sup', A) < M.TOL) === inside && (res('clip', 'pred', A) < M.TOL) === inside, `clipper sup/pred A=${A}`);
}
// "the larger A, the bigger the gap" for the clipper beyond 1.25
for (let i = A_GRID.indexOf(1.5); i < A_GRID.length - 1; i++) ok(res('clip', 'sup', A_GRID[i + 1]) > res('clip', 'sup', A_GRID[i]) && res('clip', 'pred', A_GRID[i + 1]) > res('clip', 'pred', A_GRID[i]), 'clipper gap grows with A');
// the shift comparison only uses n = d..15
{ const s = M.shift('offset', 1, 3); ok(s.r2.slice(0, 3).every(v => Number.isNaN(v)) && s.r2.slice(3).every(Number.isFinite), 'shift window n = d..15'); }

// ---- step 3: step response = running sum of h; differencing gives h back ----
for (const id of M.LTI_IDS) for (let a10 = 0; a10 <= 9; a10++) {
  const a = a10 / 10, st = M.stepStudy(id, a);
  ok(st.errCum < M.TOL && st.errBack < M.TOL, `step response identities ${id} a=${a}`);
  ok(st.s.every(v => v >= -0.25 && v <= 1.75) && st.h.every(v => Math.abs(v) <= 1.2), 'step 3 axes');
}
near(M.stepStudy('echo').last, 1.5, 1e-12, 'echo settles at 1.5');
{ const s = M.stepStudy('diff').s; ok(s[0] === 1 && s.slice(1).every(v => v === 0), 'differencer: jump at n = 0 then 0'); }
for (let a10 = 0; a10 <= 9; a10++) {
  const a = a10 / 10, st = M.stepStudy('smooth', a);
  near(st.last, 1 - Math.pow(a, 16), 1e-12, 's[15] = 1 − a^16'); ok(st.dc === 1, 'smoother DC gain 1');
  // the "still short" note appears exactly when 1 − s[15] > 0.005 (a ≥ 0.8 on the grid)
  ok((Math.abs(st.dc - st.last) > 0.005) === (a >= 0.8 - 1e-9), `slow note a=${a}`);
  if (a10 > 0) { const p = M.stepStudy('smooth', a - 0.1); ok(st.h[0] < p.h[0] && st.s[3] < p.s[3], 'larger a: lower h, slower climb'); }
}

// ---- step 4: causality and stability ----
for (let i = -24; i <= 24; i++) for (let n0 = -3; n0 <= 0; n0++) {
  const r = Math.round(i * 5) / 100, wc = M.worstCase(r, n0);
  ok(wc.stable === (Math.abs(r) < 1) && wc.causal === (n0 >= 0), 'verdicts');
  // worst case is reached by x[n−k] = sign h[k]: check at the last window sample
  const nLast = M.S4.nMax, hk = k => (k >= n0 ? Math.pow(r, k - n0) : 0);
  let y = 0; for (let k = n0; k <= nLast; k++) y += hk(k) * Math.sign(hk(k)) * 1; near(y, wc.acc[wc.acc.length - 1], 1e-9 * Math.max(1, y), 'worst case reached');
  if (wc.stable) ok(wc.total31 <= wc.bound + 1e-12 && wc.acc.every(v => v <= wc.bound + 1e-12), 'never exceeds 1/(1−|r|)');
  // total31 independent of n0; negative r has the same |h| as positive r
  near(wc.total31, M.worstCase(Math.abs(r), 0).total31, 1e-12, 'Σ|h| depends on |r| only, not n0');
}
near(M.worstCase(1, 0).total31, 31, 1e-12, 'r = 1: Σ|h| = 31 (a straight line)');
{ const a = M.worstCase(1, 0).acc; for (let i = 5; i < a.length; i++) near(a[i] - a[i - 1], 1, 1e-12, 'r = 1 rises linearly'); }

// ---- step 5: sine in, sine out ----
for (const id of M.IDS) for (let m = 1; m <= 31; m++) for (const A of [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]) {
  const r = M.sineTest(id, m, A);
  if (M.BOXES[id].lti) {
    ok(r.other < 1e-9 && r.newBins.length === 0, `${id} keeps the input frequency only`);
    near(r.gain, r.Hc.mag, 1e-9, `${id} gain = |H| (closed form)`); near(r.Hh.mag, r.Hc.mag, 1e-9, `${id} |H| from h`);
    let dp = Math.abs(r.phase - r.Hc.ph); dp = Math.min(dp, 2 * Math.PI - dp); ok(dp < 1e-7, `${id} phase = ∠H`);
  }
  if (id === 'square') { ok(r.gain < 1e-9 && Math.abs(r.other - 1) < 1e-9, 'squarer: nothing at ω, 100% elsewhere'); const k2 = 2 * m <= 32 ? 2 * m : 64 - 2 * m; assert.deepEqual(r.newBins, [0, k2].sort((a, b) => a - b)); checks++; }
  if (id === 'clip') {
    ok((r.other < 1e-9) === (A <= 1 || m === 16), `clipper wire-like iff A ≤ 1, except m = 16 (m=${m}, A=${A})`);
    if (m === 16) near(r.gain, Math.min(1, 1 / A), 1e-9, 'm = 16 clipper gain 1/A');
    if (A <= 1) near(r.gain, 1, 1e-9, 'clipper is a wire for A ≤ 1');
    // odd harmonics only (folded): every new bin is ±(odd multiple of m) mod 64
    r.newBins.forEach(k => ok([...Array(32).keys()].some(j => { const q = ((2 * j + 1) * m) % 64; return q === k || 64 - q === k; }), 'odd multiples only'));
  }
  if (id === 'warm') ok(r.other > 0.01 && r.newBins.length > 0, 'warming amp spreads the spectrum');
}
// s5hint shapes: smoother falls with frequency, differencer rises towards 2, echo swings between 0.5 and 1.5
for (let m = 1; m < 31; m++) { ok(M.sineTest('smooth', m + 1, 1).gain < M.sineTest('smooth', m, 1).gain, 'smoother low-pass'); ok(M.sineTest('diff', m + 1, 1).gain > M.sineTest('diff', m, 1).gain, 'differencer high-pass'); }
near(M.sineTest('diff', 31, 1).gain, 2, 0.01, 'differencer ≈ 2 near π');
{ let lo = 9, hi = 0; for (let i = 0; i <= 3000; i++) { const g = M.Hclosed('echo', Math.PI * i / 3000).mag; lo = Math.min(lo, g); hi = Math.max(hi, g); } near(lo, 0.5, 1e-6, 'echo min'); near(hi, 1.5, 1e-6, 'echo max'); }

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set([...Object.keys(RULES), 's1lgH', 's3lgH', 's5phase']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5') && STRINGS[l].foot.includes(l === 'zh' ? '冲激与 LTI · 给系统一巴掌' : 'Impulse & LTI · Slap the System'), 'footer names model and original');
for (const l of ['zh', 'en']) ok(!/左图|右图|left chart|right chart|left panel|right panel/i.test(Object.values(STRINGS[l]).join(' ')), 'no left/right chart wording');

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'(?!\s*\+)/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of M.IDS) ok(STRINGS.zh['box_' + id] && STRINGS.zh['rule_' + id], 'box strings ' + id);
for (const k of ['c2a_', 'c2b_']) for (const s of ['sup', 'shift', 'pred']) ok(STRINGS.zh[k + s], 'test titles ' + k + s);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder');
ok(!html.includes('canvas-label-guard'), 'no label guard');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../signal/systems/lti-systems/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS lti-systems core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
