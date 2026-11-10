'use strict';
// CNN feature maps (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const eq = (a, b, m) => { assert.equal(a, b, m); checks++; };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b}`);
const both = (key, sub) => { for (const l of ['zh', 'en']) ok(STRINGS[l][key].includes(sub), `${l}.${key} quotes ${sub}`); };
const flat = m => m.flat();

// ---- convolution = definition (cross-correlation, no flip), sizes ----
let r = 11; const rnd = () => { r = (r * 16807) % 2147483647; return r / 2147483647; };
for (let trial = 0; trial < 40; trial++) {
  const img = Array.from({ length: 14 }, () => Array.from({ length: 14 }, rnd)), k = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => rnd() * 4 - 2));
  for (let p = 0; p <= 2; p++) for (let s = 1; s <= 3; s++) {
    const out = M.conv(img, k, p, s), o = Math.floor((14 + 2 * p - 3) / s) + 1;
    eq(out.length, o, 'output side formula'); eq(M.outSize(14, 3, p, s), o, 'outSize');
    // brute force on a zero-padded copy
    const P = 14 + 2 * p, pad = Array.from({ length: P }, (_, i) => Array.from({ length: P }, (_, j) => (i - p >= 0 && i - p < 14 && j - p >= 0 && j - p < 14 ? img[i - p][j - p] : 0)));
    for (let i = 0; i < o; i += 2) for (let j = 0; j < o; j += 3) { let v = 0; for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) v += k[a][b] * pad[i * s + a][j * s + b]; near(out[i][j], v, 1e-12, 'conv = definition'); }
  }
  // products() sums to the valid convolution
  const v = M.conv(img, k); for (let i = 0; i < 12; i += 5) for (let j = 0; j < 12; j += 4) near(M.products(img, k, i, j).sum, v[i][j], 1e-12, 'nine products');
}
// no flip: an asymmetric kernel shifts in the stated direction
{ const img = Array.from({ length: 14 }, (_, i) => Array.from({ length: 14 }, (_, j) => (i === 5 && j === 5 ? 1 : 0))); const k = [[0, 0, 0], [0, 0, 1], [0, 0, 0]]; const o = M.conv(img, k); eq(o[4][3], 1, 'cross-correlation: kernel (1,2) reads in[i+1][j+2]'); }

// ---- step 0: the vertical-edge kernel on the square ----
const E0 = M.edgeAt(0);
assert.deepEqual(E0.map(r => r.map(v => Math.round(v * 1e9) / 1e9)), M.SOBEL_X); checks++;
eq(M.conv(M.IMAGES.square, E0).length, 12, '14×14 → 12×12'); both('s0e', '12×12');
{
  const f = M.conv(M.IMAGES.square, E0);
  // left edge positive in exactly two columns (2, 3), right edge negative in columns 8, 9, zero elsewhere
  f.forEach(row => row.forEach((v, j) => { if (j === 2 || j === 3) ok(v >= 0, 'left edge ≥ 0'); else if (j === 8 || j === 9) ok(v <= 0, 'right edge ≤ 0'); else eq(v, 0, 'flat → 0'); }));
  ok(f[5][2] > 0 && f[5][3] > 0 && f[5][8] < 0 && f[5][9] < 0, 'two columns each');
  eq(M.products(M.IMAGES.square, E0, 3, 2).sum, 3, 'default window sum');
  eq(f[6][5], 0, 'inside the square: 0');
}
ok(STRINGS.zh.s0hint.includes('两列') && STRINGS.en.s0hint.includes('two columns'), 's0hint: two columns');

// ---- step 1: kernels ----
for (let deg = 0; deg <= 180; deg += 15) near(flat(M.edgeAt(deg)).reduce((a, b) => a + b, 0), 0, 1e-12, 'edge kernels sum to 0');
near(flat(M.KERNELS.blur()).reduce((a, b) => a + b, 0), 1, 1e-12, 'blur sums to 1');
eq(flat(M.KERNELS.sharpen()).reduce((a, b) => a + b, 0), 1, 'sharpen sums to 1');
{ const id = M.conv(M.IMAGES.square, M.KERNELS.identity()); for (let i = 0; i < 12; i++) for (let j = 0; j < 12; j++) eq(id[i][j], M.IMAGES.square[i + 1][j + 1], 'identity = image minus one ring'); }
{ // square at 0° vs 90°: vertical sides vs horizontal sides
  const v = M.conv(M.IMAGES.square, M.edgeAt(0)), h = M.conv(M.IMAGES.square, M.edgeAt(90));
  for (let i = 0; i < 12; i++) for (let j = 0; j < 12; j++) near(h[i][j], v[j][i], 1e-9, '90° = transposed 0°');
  const d = M.conv(M.IMAGES.square, M.edgeAt(45)), mx = M.maxAbs(d), top = [];
  d.forEach((row, i) => row.forEach((x, j) => { if (Math.abs(x) >= mx - 1e-9) top.push([i, j, Math.sign(x)]); }));
  assert.deepEqual(top, [[3, 3, 1], [8, 8, -1]]); checks++; // top-left corner positive, bottom-right negative
}
{ // diagonal: 45° gives an all-zero map, 135° is the strongest angle
  eq(M.maxAbs(M.conv(M.IMAGES.diagonal, M.edgeAt(45))) < 1e-9, true, 'diagonal at 45° is all zero');
  let best = 0, bestDeg = -1; for (let deg = 0; deg <= 180; deg += 15) { const m = M.maxAbs(M.conv(M.IMAGES.diagonal, M.edgeAt(deg))); if (m > best + 1e-9) { best = m; bestDeg = deg; } }
  eq(bestDeg, 135, 'diagonal strongest at 135°');
}
{ const s = M.conv(M.IMAGES.square, M.KERNELS.sharpen()); eq(Math.max(...flat(s)), 3, 'sharpen max 3'); eq(Math.min(...flat(s)), -1, 'sharpen min −1'); }
{ const b = M.conv(M.IMAGES.square, M.KERNELS.blur()); const vals = new Set(flat(b).map(v => Math.round(v * 9))); ok(vals.size > 3, 'blur produces a ramp of intermediate values'); }
both('s1hint', '135°'); both('s1hint', '3'); both('s1hint', '−1');

// ---- step 2: size ----
for (let p = 0; p <= 2; p++) for (let s = 1; s <= 3; s++) {
  const o = M.outSize(14, 3, p, s), reach = (o - 1) * s + 3, miss = 14 + 2 * p - reach;
  ok(miss >= 0 && miss < s, 'uncovered strip narrower than the stride');
  if (p === 0 && s === 3) eq(miss, 2, 'p = 0, s = 3 leaves 2 columns/rows untouched');
  if (p === 1 && s === 1) eq(o, 14, 'p = 1 keeps 14×14');
  // every input pixel covered iff miss = 0 (brute force)
  const cover = new Set(); for (let a = 0; a < o; a++) for (let q = 0; q < 3; q++) cover.add(a * s + q - p);
  for (let i = 0; i < 14; i++) eq(cover.has(i), i < 14 + p - miss, 'coverage matches the readout');
}
eq(M.outSize(14, 3, 0, 2), 6, 's = 2: 6×6'); ok(9 * 36 / (9 * 144) === 0.25, 's = 2: a quarter of the multiplications');
both('s2hint', '14×14'); both('s2hint', '2');

// ---- step 3: ReLU and pooling ----
for (const key of M.IMAGE_KEYS) {
  const raw = M.conv(M.IMAGES[key], E0), rl = M.relu(raw);
  ok(flat(rl).every(v => v >= 0), 'ReLU leaves no negatives');
  flat(raw).forEach((v, i) => eq(flat(rl)[i], Math.max(0, v), 'ReLU keeps positives'));
  for (const q of [2, 3]) {
    const p = M.maxpool(rl, q); eq(p.length, 12 / q, 'pool side 12/q'); eq(Math.max(...flat(p)), Math.max(...flat(rl)), 'maximum survives pooling');
    // pooled = block maxima
    for (let a = 0; a < p.length; a++) for (let b = 0; b < p.length; b++) { let m = -Infinity; for (let u = 0; u < q; u++) for (let w = 0; w < q; w++) m = Math.max(m, rl[a * q + u][b * q + w]); eq(p[a][b], m, 'block max'); }
  }
}
{ // disc: without ReLU the left rim is positive and the right rim negative; with ReLU only the left side is left
  const raw = M.conv(M.IMAGES.disc, E0);
  raw.forEach(row => row.forEach((v, j) => { if (v > 1e-9) ok(j < 6, 'positive only on the left half'); if (v < -1e-9) ok(j >= 6, 'negative only on the right half'); }));
  eq(M.maxpool(M.relu(raw), 2).length ** 2, 36, '144 → 36'); eq(M.maxpool(M.relu(raw), 3).length ** 2, 16, '144 → 16');
}
both('s3hint', '36'); both('s3hint', '16');

// ---- step 4: corner detector ----
for (const key of ['square', 'disc', 'letterT']) {
  const R = M.cornerRange(key);
  near(R.lo, 1, 1e-9, key + ': second-largest V + H is 1'); near(R.hi, 1.5, 1e-9, key + ': largest V + H is 1.5');
  for (let c = 0; c <= 2.0001; c += 0.1) {
    const q = M.corner(key, c);
    if (c >= 1 - 1e-9 && c < 1.5 - 1e-9) {
      if (key === 'disc') { eq(q.on.length, 7, `disc c=${c}: 7 tied points`); q.on.forEach(([i, j]) => ok(i <= 5 && j <= 5 && i + j <= 6, 'on the top-left arc')); }
      else { eq(q.on.length, 1, `${key} c=${c}: exactly one position`); assert.deepEqual(q.on[0], R.at); checks++; }
    }
    if (c >= 1.5 - 1e-9) eq(q.on.length, 0, `${key} c=${c}: dark`);
    if (c < 1 - 1e-9) ok(q.on.length > 1, `${key} c=${c}: more than one position`);
  }
  const q = M.corner(key, 0); eq(Math.max(...flat(q.V)), 1, 'V normalised to 1'); eq(Math.max(...flat(q.H)), 1, 'H normalised to 1');
}
eq(M.cornerRange('square').at.join(), '3,3', 'square: the top-left corner');
ok(M.corner('square', 0).on.length >= 20, 'c = 0: whole left and top edges lit');
both('s4hint', '1.5'); both('s4hint', '7');

// ---- step 5: learning ----
const eig = M.hessianEig();
ok(eig.min > 0.02, 'Hessian positive definite: a unique answer exists');
near(eig.lrMax, 0.56, 0.005, 'stable learning rate limit ≈ 0.56'); both('s5hint', '0.56'); both('s5div', '0.56');
{ // gradient = finite differences
  const k = M.zeroKernel().map(r => r.map(() => rnd() - 0.5)), g = M.lossGrad(k).g, h = 1e-6;
  for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) { const kp = k.map(r => r.slice()); kp[a][b] += h; const km = k.map(r => r.slice()); km[a][b] -= h; near(g[a][b], (M.lossGrad(kp).loss - M.lossGrad(km).loss) / (2 * h), 1e-6, 'gradient check'); }
}
near(M.lossGrad(M.TARGET_KERNEL).loss, 0, 1e-24, 'target kernel has zero loss');
{
  const run = M.train(0.3, 300); let monotone = true; for (let i = 1; i < run.losses.length; i++) if (run.losses[i] > run.losses[i - 1] + 1e-15) monotone = false;
  ok(monotone, 'lr 0.3: loss falls every step');
  ok(M.maxErr(run.k) < 0.01, 'lr 0.3: 300 steps bring the largest gap below 0.01');
  ok(M.maxErr(M.train(0.3, 200).k) >= 0.01, 'and 200 steps do not (so “press twice more” is needed)');
  const sign = M.train(0.3, 100).k; ok(sign[1][0] < -1 && sign[1][2] > 1 && sign[0][0] < 0 && sign[0][2] > 0, 'after 100 steps the shape is recognisable');
}
for (const lr of [0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.55]) { const run = M.train(lr, 400); ok(run.losses[400] < run.losses[0] * 1e-2, `lr ${lr} converges`); }
{ const run = M.train(0.6, 200); ok(run.losses[200] > run.losses[0] * 1e3, 'lr 0.6 diverges'); }
eq(Math.max(...[0.05, 0.6].map(v => v)), 0.6, 'slider top is 0.6');
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
ok(/id="lr5"[^>]*max="0.6"/.test(html) && /id="lr5"[^>]*min="0.05"/.test(html), 'learning-rate slider spans 0.05–0.6');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) eq(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k);
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/左图|右图|左边的图|右边的图|left panel|right panel|left chart|right chart|left image|right image/i.test(v), 'no left/right figure references: ' + k);

// ---- every key referenced in HTML/app exists ----
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const m of app.matchAll(/: '((?:img|ker)[A-Z][A-Za-z]*)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'label key ' + m[1]);
for (const id of ['i0', 'j0', 'scan0', 'clear0', 'img1', 'ker1', 'a1', 'p2', 's2', 'img3', 'q3', 'relu3', 'img4', 'c4s', 'lr5', 't1', 't10', 't100', 'reset5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('../../../page-provenance.css') && html.includes('<!-- page-provenance -->'), 'provenance placeholder');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../computing/ml/cnn-feature-maps/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS cnn-feature-maps core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · lr limit ${eig.lrMax.toFixed(3)}`);
