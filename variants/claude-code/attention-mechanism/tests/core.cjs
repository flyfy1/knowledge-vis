'use strict';
// Attention (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => { assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`); checks++; };
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const both = (key, s) => { for (const l of ['zh', 'en']) ok(STRINGS[l][key].includes(s), `${l}.${key} quotes ${s}`); };
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), appSrc = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
const sliderVals = id => { const m = html.match(new RegExp(`id="${id}"[^>]*min="([^"]+)" max="([^"]+)" step="([^"]+)"`)); const [lo, hi, st] = m.slice(1).map(Number), out = []; for (let v = lo; v <= hi + 1e-9; v += st) out.push(Math.round(v / st) * st); return out; };
const sum = a => a.reduce((x, y) => x + y, 0);
const r2 = v => Math.round(v * 100) / 100;

// ---- step 0: hard vs soft lookup ----
ok(M.keys().every(k => Math.abs(Math.hypot(k[0], k[1]) - 1) < 1e-12), 'keys have length 1 (s0e)');
both('s0e', '2.5'); ok(M.Q0LEN === 2.5, 'query length 2.5');
ok(M.MEM.values.join() === '3,1,-2,0.5', 'table values');
for (const a of sliderVals('q0')) {
  const L = M.lookup(a, M.Q0LEN);
  near(sum(L.w), 1, 1e-12, 'weights sum to 1');
  ok(L.hard === M.MEM.values[M.argmax(L.scores)], 'hard = value of top score');
  ok(L.soft <= 3 + 1e-12 && L.soft >= -2 - 1e-12, 'soft is an average of the values');
  near(L.soft, sum(L.w.map((w, j) => w * M.MEM.values[j])), 1e-12, 'soft = Σ w·v');
}
{
  const S = M.sweepStats();
  ok(S.jumps.length === 4 && S.jMin === 2 && S.jMax === 3, 'hard lookup jumps 2 to 3 at four boundaries');
  ok(r2(S.maxSlope * 10) / 10 > 0 && Math.abs(S.maxSlope - 0.046) < 0.0005, 'soft lookup changes at most 0.046 per degree: ' + S.maxSlope);
  // finer sweep: the slope bound holds between whole degrees too
  let mx = 0; for (let a = 0; a < 360; a += 0.05) mx = Math.max(mx, Math.abs(M.lookup(a + 0.05, 2.5).soft - M.lookup(a, 2.5).soft) / 0.05);
  ok(mx < 0.0475, 'fine slope bound ' + mx);
}

// ---- step 1: softmax ----
both('s1e', '60°'); both('s1e', '2');
for (const b of sliderVals('beta')) {
  const base = M.lookup(60, 2, b, 0);
  for (const c of sliderVals('csh')) { const L = M.lookup(60, 2, b, c); L.w.forEach((w, j) => near(w, base.w[j], 1e-12, 'adding c leaves weights unchanged')); near(sum(L.w), 1, 1e-12, 'sum 1'); }
  const e = M.effCount(base.w); ok(e >= 1 - 1e-12 && e <= 4 + 1e-12, 'effective count within 1..4');
}
{ const L = M.lookup(60, 2, 0); L.w.forEach(w => near(w, 0.25, 1e-12, 'β = 0 → 0.25 each')); near(M.effCount(L.w), 4, 1e-12, 'β = 0 → effective count 4'); }
{ let prev = 5; for (const b of sliderVals('beta')) { const e = M.effCount(M.lookup(60, 2, b).w); ok(e <= prev + 1e-12, 'effective count falls as β grows'); prev = e; } }
{ const L = M.lookup(60, 2, 5); ok(r2(L.w[0]) === 0.77 && r2(M.effCount(L.w)) === 1.54, 'β = 5: key 1 gets 0.77, effective count 1.54'); ok(L.w[0] + L.w[1] > 0.999, 'keys 1 and 2 take almost all the weight'); }
{ const d1 = 60 - 20, d2 = 110 - 60; ok(Math.abs(d1 - d2) <= 10, 'query roughly as close to key 1 as to key 2'); }

// ---- step 2: Q, K, V ----
both('s2e', '3'); both('s2e', '√2'); ok(M.QSCALE === 3 && M.D === 2, 'W_Q = 3·rotation, d = 2');
for (const phi of sliderVals('phi')) for (const m of [false, true]) {
  const R = M.attention(phi, m);
  R.A.forEach(row => near(sum(row), 1, 1e-12, 'row sums to 1'));
  R.O.forEach((o, i) => { const e = R.A[i].reduce((p, a, j) => [p[0] + a * R.V[j][0], p[1] + a * R.V[j][1]], [0, 0]); near(o[0], e[0], 1e-12, 'O = A·V'); near(o[1], e[1], 1e-12, 'O = A·V'); });
}
{
  const A0 = M.attention(0), A90 = M.attention(90);
  for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) near(A0.S[i][j], A0.S[j][i], 1e-12, 'φ = 0: score matrix symmetric');
  const w = A0.A[3], order = w.map((v, j) => j).sort((a, b) => w[b] - w[a]);
  ok(new Set(order.slice(0, 2)).has(2) && new Set(order.slice(0, 2)).has(3) && Math.abs(w[2] - w[3]) < 0.02, 'φ = 0: it splits almost evenly between ball and itself');
  ok(r2(w[2]) === 0.45 && r2(w[3]) === 0.46, 'φ = 0: ball 0.45, it 0.46');
  ok(M.argmax(A90.A[3]) === 0 && r2(A90.A[3][0]) === 0.59, 'φ = 90: it attends most to cat (0.59)');
  ok(r2(A90.A[0][3]) === 0.01, 'φ = 90: cat gives it only 0.01 (asymmetric)');
}

// ---- step 3: the whole matrix ----
const H = M.hull(M.TOK);
for (const phi of sliderVals('phi3')) {
  const Rm = M.attention(phi, true), Ru = M.attention(phi, false);
  near(M.upperSum(Rm.A), 0, 0, 'mask zeroes the upper triangle');
  ok(Ru.A.every(r => r.every(a => a > 0)), 'without mask every weight is positive');
  ok(Rm.A[0][0] === 1 && f2(Rm.A[0][0]) === '1.00', 'masked first row: cat looks at itself (1.00)');
  ok(Rm.A[4].every(a => a > 0), 'masked last row sees all 5 words');
  ok(Ru.O.every(o => M.inHull(o, H)) && Rm.O.every(o => M.inHull(o, H)), 'outputs inside the convex hull');
}
function f2(q) { return (Math.abs(q) < 0.005 ? 0 : q).toFixed(2).replace('-', '−'); }
ok(H.length === 5, 'all five value vectors are hull corners');

// ---- step 4: √d scaling (fixed-seed simulation) ----
both('s4e', '400'); both('s4e', '8'); ok(M.TRIALS === 400 && M.NKEYS === 8, '400 trials, 8 keys');
const dv = sliderVals('dIdx'); ok(dv.length === M.DIMS.length && M.DIMS[dv[0]] === 1 && M.DIMS[dv[dv.length - 1]] === 512, 'slider spans d = 1..512');
const S = M.DIMS.map(d => M.scalingStudy(d));
S.forEach(s => {
  ok(Math.abs(s.sdRaw / Math.sqrt(s.d) - 1) < 0.08, `sd(q·k) ≈ √d at d = ${s.d}: ${s.sdRaw}`);
  ok(s.sdSc > 0.93 && s.sdSc < 1.04, `scaled sd ≈ 1 at d = ${s.d}: ${s.sdSc}`);
});
for (let i = 1; i < S.length; i++) ok(S[i].maxRaw > S[i - 1].maxRaw, 'unscaled largest weight climbs with d');
ok(S[S.length - 1].gRaw < S[0].gRaw / 5, 'unscaled gradient collapses');
{ const ms = S.map(s => s.maxSc), gs = S.map(s => s.gSc); ok(r2(Math.min(...ms)) === 0.3 && r2(Math.max(...ms)) === 0.37, 'scaled max weight within 0.30–0.37'); ok(r2(Math.min(...gs)) >= 0.17 && r2(Math.max(...gs)) <= 0.22, 'scaled gradient within 0.18–0.22'); }
ok(Math.abs(S[S.length - 1].sdRaw - 22.6) < 0.1, 'd = 512 raw sd ≈ 22.6');
// histogram ranges hold nearly all samples (raw ±80, scaled ±5)
S.forEach(s => { ok(s.raw.filter(x => Math.abs(x) > 80).length / s.raw.length < 0.001, 'raw range ±80'); ok(s.sc.filter(x => Math.abs(x) > 5).length / s.sc.length < 0.003, 'scaled range ±5'); });
ok(appSrc.includes("r.raw, -80, 80, 40") && appSrc.includes("r.sc, -5, 5, 40"), 'app histogram ranges match the test');

// ---- step 5: word order ----
both('s5e', '1.1'); both('s5e', '50°'); ok(M.OMEGA === 1.1 && M.PHI5 === 50, 'encoding constants');
for (const a of sliderVals('pa')) {
  const g = M.orderGap(a), A = M.orderOutputs([0, 1, 2], a), B = M.orderOutputs([2, 1, 0], a);
  near(A.X[1][0], B.X[1][0], 1e-12, 'bites keeps its input'); near(A.X[1][1], B.X[1][1], 1e-12, 'bites keeps its input');
  if (a === 0) g.forEach(x => near(x, 0, 1e-12, 'a = 0: identical outputs'));
  else { ok(g[0] > 1e-3 && g[2] > 1e-3 && g[1] > 1e-3, 'a > 0: all outputs change'); }
  // view range in app covers inputs and outputs
  for (const P of [A, B]) for (const p of [...P.out, ...P.X]) ok(p[0] >= -0.4 && p[0] <= 2.0 && p[1] >= -1.8 && p[1] <= 1.2, 'step 5 points inside the view');
}
ok(appSrc.includes('x0: -0.4, x1: 2.0, y0: -1.8, y1: 1.2'), 'app step-5 view matches the test');
{ let mx = 0; for (let i = 0; i <= 100; i++) mx = Math.max(mx, ...M.orderGap(i / 100)); ok(mx < 1.2 && appSrc.includes('yMax: 1.2, yTicks: [0, 0.4, 0.8, 1.2]'), 'gap curves fit the 0–1.2 axis: ' + mx); }

// ---- number formatting ----
const fmt = eval('(' + appSrc.match(/const fmt = [^\n]+/)[0].replace('const fmt = ', '').replace(/;\s*$/, '') + ')');
ok(fmt(90, 0) === '90' && fmt(1.50) === '1.5' && fmt(-0.001) === '0' && fmt(-1.25) === '−1.25' && fmt(100, 1) === '100' && fmt(40, 2) === '40' && fmt(512) === '512', 'fmt keeps integer zeros');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['formula']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
both('foot', 'claude-opus-5-5');
ok(STRINGS.zh.foot.includes('注意力机制 · 每个词决定看谁') && STRINGS.en.foot.includes('Attention · Every Word Decides Where to Look'), 'footer names the original');
ok(STRINGS.zh.compare.includes('注意力机制 · 每个词决定看谁'), 'compare link names the original');
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/左图|右图|left chart|right chart|on the left|on the right/i.test(v), `no left/right chart wording in ${l}.${k}`);

// ---- every key referenced in HTML/app exists ----
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of appSrc.matchAll(/\bt\('([A-Za-z0-9_]+)'[,)]/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const k of ['tok0', 'tok1', 'tok2', 'tok3', 'tok4', 'word0', 'word1', 'word2']) ok(STRINGS.zh[k] !== undefined, 'dynamic key ' + k); // t('tok' + i), t('word' + w)
for (const m of html.matchAll(/data-i18n(?:-html)?="([^"]+)"/g)) ok(!/\{[a-zA-Z0-9]+\}/.test(STRINGS.zh[m[1]]), 'static key without placeholders ' + m[1]);
for (const id of ['q0', 'sweep0', 'beta', 'csh', 'phi', 'ask0', 'ask4', 'phi3', 'mOff', 'mOn', 'dIdx', 'pa', 'h0', 'h1', 'h2', 'h4']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no canvas-label-guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder and css');

// ---- deep links ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../computing/ml/attention-mechanism/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS attention-mechanism core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
