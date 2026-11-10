'use strict';
// Entropy (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
const both = (key, ...subs) => { for (const l of ['zh', 'en']) for (const s of subs) ok(STRINGS[l][key].includes(s), `${key} (${l}) quotes ${s}`); };
const fmt = new Function(app.match(/const fmt = [^\n]+/)[0].replace('const fmt =', 'return'))();
ok(fmt(90, 0) === '90' && fmt(2.5, 3) === '2.5' && fmt(0.4690, 3) === '0.469' && fmt(1, 3) === '1', 'fmt trims only after a decimal point');

// ---- step 0: halving game ----
for (let N = 2; N <= 32; N++) {
  let total = 0, mn = Infinity, mx = 0;
  for (let s = 0; s < N; s++) {
    const st = M.halving(N, s);
    let lo = 0, hi = N; st.forEach(q => { if (q.yes) hi = q.mid; else lo = q.mid; });
    ok(lo === s && hi === s + 1, 'halving finds the secret');
    total += st.length; mn = Math.min(mn, st.length); mx = Math.max(mx, st.length);
  }
  near(total / N, M.avgQuestions(N), 1e-12, 'average = closed form, N=' + N);
  const k = Math.floor(Math.log2(N));
  ok(mn >= k && mx <= k + 1 && mx === Math.ceil(Math.log2(N)), 'questions are ⌊log₂N⌋ or ⌈log₂N⌉');
  ok(M.avgQuestions(N) >= Math.log2(N) - 1e-12 && M.avgQuestions(N) < Math.log2(N) + 1, 'log₂N ≤ average < log₂N + 1');
  ok(mx <= 5, 'at most 5 question rows are drawn');
}
ok(M.avgQuestions(8) === 3, 's0hint: N = 8 always 3'); ok(fmt(M.avgQuestions(6), 2) === '2.67' && fmt(Math.log2(6), 3) === '2.585', 's0hint: 2.67 vs 2.585');
both('s0hint', '2.67', '2.585');

// ---- step 1: surprise adds when probabilities multiply ----
for (let a = 0.05; a <= 1.0001; a += 0.05) for (let b = 0.05; b <= 1.0001; b += 0.05) {
  near(M.surprise(a) + M.surprise(b), M.surprise(a * b), 1e-9, 'additivity');
  ok(M.surprise(a * b) <= 9, 'combined surprise inside the drawn 0–9 bit axis');
}
ok(M.surprise(0.5) === 1 && M.surprise(0.125) === 3 && M.surprise(1) === 0, '1 bit, 3 bits, 0 bits');
// 1/p does not add (the page says it fails apart from coincidences): count matches on the slider grid
for (let i = 1; i <= 20; i++) for (let j = 1; j <= 20; j++) { const a = i / 20, b = j / 20; ok((Math.abs(1 / a + 1 / b - 1 / (a * b)) < 1e-9) === (i + j === 20), 's1hint: 1/p adds only when a + b = 1'); }
ok(Math.abs(1 / 0.5 + 1 / 0.25 - 1 / 0.125) > 1, 'default sliders show the mismatch');

// ---- step 2: the coin ----
ok(fmt(M.binaryH(0.9), 3) === '0.469' && M.binaryH(0.5) === 1, 'H(0.9) = 0.469, H(0.5) = 1');
ok(fmt(M.surprise(0.9), 2) === '0.15' && fmt(M.surprise(0.1), 1) === '3.3', 'heads 0.15 bits, tails 3.3 bits');
both('s2hint', '0.15', '3.3', '0.469');
for (let i = 1; i < 100; i++) { const p = i / 100; ok(M.binaryH(p) <= 1 + 1e-12 && M.binaryH(p) > 0, 'H in (0, 1]'); near(M.binaryH(p), M.binaryH(1 - p), 1e-12, 'symmetric'); }
{ // running average surprise converges toward H (law of large numbers) on long runs
  const r = M.coinRun(0.9, 20000, 11); near(r[19999], M.binaryH(0.9), 0.02, 'long-run average surprise ≈ H');
  const h = M.coinRun(0.9, 200, 1); ok(h.length === 200, '200 tosses');
}

// ---- step 3: six weathers ----
for (let a = 0; a <= 2.0001; a += 0.1) {
  const p = M.source(a); near(p.reduce((x, y) => x + y, 0), 1, 1e-12, 'normalised');
  ok(M.entropy(p) <= Math.log2(6) + 1e-12, 'H ≤ log₂ 6');
  if (a > 0.05) ok(M.entropy(p) < M.entropy(M.source(a - 0.1)), 'H falls as α grows');
}
near(M.entropy(M.source(0)), Math.log2(6), 1e-12, 'uniform H = log₂6'); both('s3hint', '2.585');

// ---- step 4: Huffman ----
for (let a = 0; a <= 2.0001; a += 0.1) {
  const p = M.source(a), hf = M.huffman(p), H = M.entropy(p);
  ok(hf.avg >= H - 1e-12 && hf.avg < H + 1, 'H ≤ L < H + 1 at α=' + a.toFixed(1));
  near(M.kraft(hf.lengths), 1, 1e-12, 'Kraft sum = 1 (complete prefix code)');
  // prefix-free
  hf.codes.forEach((c, i) => hf.codes.forEach((d, j) => { if (i !== j) ok(!d.startsWith(c), 'prefix-free'); }));
  // commoner symbols never get longer codewords
  for (let i = 1; i < 6; i++) if (p[i] < p[i - 1] - 1e-12) ok(hf.lengths[i] >= hf.lengths[i - 1], 'rarer symbols never get shorter codewords');
  for (const k of [2, 3]) { const L = M.blockAvg(p, k); ok(L >= H - 1e-12 && L < H + 1 / k + 1e-12, `block ${k}: H ≤ L/k < H + 1/k`); }
  ok(M.blockAvg(p, 3) <= hf.avg + 1e-12, 'blocks never worse');
  ok(Math.max(...hf.lengths) <= 5, 'tree depth ≤ 5 (fits the drawn levels)');
  // optimality vs brute force over all complete length assignments is costly; check against Kraft-feasible lower bound
}
{ const p = M.source(2); ok(fmt(M.huffman(p).avg, 3) === '1.156' && fmt(M.blockAvg(p, 3), 3) === '0.683' && fmt(M.entropy(p), 3) === '0.661', 'α = 2 numbers'); ok(fmt(p[0] * 100, 0) === '86', 'sun 86% at α = 2'); }
both('s4hint', '1.156', '0.683', '0.661', '86%');
{ const p = M.source(0.5), e = M.encodeSample(p, 100000, 3); near(e.perSymbol, M.huffman(p).avg, 0.02, 'sampled bits per symbol ≈ L'); }

// ---- step 5: cross-entropy and KL ----
{ const p = M.source(0.5);
  ok(fmt(M.entropy(p), 3) === '2.157' && fmt(M.crossEntropy(p, M.source(1.5)), 3) === '3.02' && fmt(M.kl(p, M.source(1.5)), 3) === '0.862', 'default numbers 2.157 / 3.020 / 0.862');
  let best = Infinity, at = null; for (let i = 0; i <= 30; i++) { const a = -1 + i / 10, ce = M.crossEntropy(p, M.source(a)); ok(ce >= M.entropy(p) - 1e-12, 'Gibbs inequality'); if (ce < best) { best = ce; at = a; } }
  near(at, 0.5, 1e-9, 'minimum at model α = true α'); near(best, M.entropy(p), 1e-12, 'minimum equals H(p)');
  ok(M.crossEntropy(p, M.withoutLast(M.source(0.5))) === Infinity, 'q = 0 for a possible symbol gives ∞');
  for (let ap = 0; ap <= 2.0001; ap += 0.5) for (let aq = -1; aq <= 2.0001; aq += 0.5) ok(M.kl(M.source(ap), M.source(aq)) >= -1e-12, 'KL ≥ 0'); }
both('s5hint', '2.157', '3.02', '0.862');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const k of zk) ok(!/左图|右图|left chart|right chart|left panel|right panel/i.test(STRINGS[l][k]), 'no left/right figure references: ' + k);
for (const s of M.SYMBOLS) ok(STRINGS.zh['sym_' + s] && STRINGS.en['sym_' + s], 'symbol ' + s);

// ---- every key referenced in HTML/app exists ----
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) if (!/_$/.test(m[1])) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['n0', 'play0', 'many0', 'clear0', 'pa', 'pb', 'p2', 'flip2', 'a3', 'a4', 'encode4', 'ap5', 'aq5', 'zero5']) ok(html.includes(`id="${id}"`), 'control ' + id);

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../probability/stochastic/entropy/index.html')), 'comparison link target exists');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css') && !html.includes('canvas-label-guard'), 'provenance placeholder, no label guard');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS entropy core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
