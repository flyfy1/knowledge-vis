'use strict';
// Hashing (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const eq = (a, b, m) => { assert.equal(a, b, m); checks++; };
const both = (key, sub) => { for (const l of ['zh', 'en']) ok(STRINGS[l][key].includes(sub), `${l}.${key} quotes ${sub}`); };
let r = 7; const rnd = () => { r = (r * 16807) % 2147483647; return r / 2147483647; };
const randStr = (L, uni = false) => { let s = ''; for (let i = 0; i < L; i++) s += uni && rnd() < 0.3 ? String.fromCodePoint(0x4e00 + Math.floor(rnd() * 2000)) : String.fromCharCode(32 + Math.floor(rnd() * 95)); return s; };

// ---- step 0: FNV-1a and UTF-8 ----
eq(M.hex(M.fnv1a(M.utf8(''))), '811c9dc5', 'FNV-1a offset basis (published test vector)');
eq(M.hex(M.fnv1a(M.utf8('a'))), 'e40c292c', 'FNV-1a("a") published test vector');
eq(M.hex(M.fnv1a(M.utf8('foobar'))), 'bf9cf968', 'FNV-1a("foobar") published test vector');
eq(M.OFFSET, 0x811c9dc5, 'offset quoted in s0e'); eq(M.PRIME, 16777619, 'prime quoted in s0e');
both('s0e', '0x811c9dc5'); both('s0e', '16777619');
for (let t = 0; t < 300; t++) {
  const s = randStr(1 + Math.floor(rnd() * 40), t % 2 === 1), b = M.utf8(s);
  assert.deepEqual(b, [...Buffer.from(s, 'utf8')]); checks++;
  const { h, trace } = M.fnv1a(b, true);
  ok(Number.isInteger(h) && h >= 0 && h < 2 ** 32, 'always 32 bits'); eq(trace.length, b.length, 'one row per byte'); eq(trace[trace.length - 1], h, 'last row = fingerprint');
  eq(M.hex(h).length, 8, '8 hex digits'); eq(M.bits(h).length, 32, '32 bit cells');
}
eq(M.utf8('你').length, 3, 'a Chinese character is 3 UTF-8 bytes'); eq(M.utf8('c').length, 1, 'a Latin letter is 1 byte');
eq(2 ** 32, 4294967296, '2^32 quoted'); both('s0readout', '4,294,967,296');
{ // cat vs cats: first 4 rows (start + c, a, t) identical, fingerprints far apart
  const a = M.fnv1a(M.utf8('cat'), true), b = M.fnv1a(M.utf8('cats'), true);
  for (let i = 0; i < 3; i++) eq(a.trace[i], b.trace[i], 'shared prefix rows');
  ok(M.popcount(a.h ^ b.h) >= 12, 'cat vs cats differ in many bits: ' + M.popcount(a.h ^ b.h));
}
ok(M.SAMPLES.includes('cat') && M.SAMPLES.includes('cats'), 'samples named in the hint exist');
ok(M.SAMPLES.every(s => [...s].length <= 48), 'samples fit the 48-character input');

// ---- step 1: avalanche ----
for (let t = 0; t < 200; t++) {
  const s = t < M.SAMPLES.length ? M.SAMPLES[t] : randStr(3 + Math.floor(rnd() * 38), t % 3 === 0), b = M.utf8(s);
  const A = M.avalanche(b, M.fnv1a), B = M.avalanche(b, M.mixed);
  // FNV-1a's lowest output bit flips exactly when the lowest bit of some byte is flipped: 1/8 of all flips
  ok(Math.abs(A.perBitFrac[0] - 1 / 8) < 1e-12, 'FNV-1a bit 0 flips in exactly 1/8 of single-bit flips');
  for (let i = 0; i < b.length * 8; i++) ok((((M.fnv1a(b) ^ M.fnv1a(M.flipBit(b, i))) & 1) === 1) === ((i & 7) === 0), 'bit 0 flips iff a byte’s bit 0 flips');
  ok(B.mean >= 14.5 && B.mean <= 17.5, `mixed mean near 16 (${B.mean})`);
  ok(B.mean > A.mean, 'mixing raises the average');
  // output bit k depends only on bits 0..k of each byte, so it can flip in at most (k + 1)/8 of the flips
  for (let k = 0; k < 7; k++) ok(A.perBitFrac[k] <= (k + 1) / 8 + 1e-12, `FNV-1a bit ${k} flips at most (k+1)/8`);
}
{ // fmix32 is a bijection on samples (no two inputs collide) and maps 0 to 0
  eq(M.fmix32(0), 0, 'fmix32(0) = 0');
  const seen = new Set(); for (let i = 0; i < 100000; i++) seen.add(M.fmix32(i * 2654435761 >>> 0)); eq(seen.size, 100000, 'fmix32 has no collisions on 100k inputs');
}
both('s1hint', '12.5%'); both('s1hint', '(k + 1)/8'); both('s1e', '16');

// ---- step 2: hash table ----
eq(M.KEYS.length, 200, '200 keys'); eq(M.KEYS[12], 'item-12', 'key format');
eq(M.hashStr('item-12', 'sum'), M.hashStr('item-21', 'sum'), 'item-12 and item-21 share a byte sum');
eq(new Set(M.KEYS.map(k => M.hashStr(k, 'sum'))).size, 47, 'bad hash: only 47 distinct values'); both('s2hint', '47');
for (let n = 0; n <= 200; n += 5) for (let m = 8; m <= 64; m++) {
  const G = M.table(n, m, 'mixed'), E = M.expectEmpty(n, m);
  eq(G.lens.reduce((a, b) => a + b, 0), n, 'every key stored');
  ok(Math.abs(G.empty - E) <= 3 * Math.sqrt(E + 1), `good hash empty buckets near random expectation n=${n} m=${m}`);
  if (n >= 40) ok(Math.abs(G.probes - M.expectProbes(n, m)) <= 0.25 + 0.25 * n / m, `good hash probes near 1 + (n−1)/2m n=${n} m=${m}`);
  eq(G.hist.reduce((a, b) => a + b, 0), m, 'histogram counts buckets');
  const S = M.table(n, m, 'sum'); ok(m - S.empty <= 47, 'bad hash uses at most 47 buckets');
}
for (let m = 40; m <= 64; m++) {
  const G = M.table(200, m, 'mixed'), S = M.table(200, m, 'sum');
  ok(S.empty >= Math.max(4, m - 47) && S.empty > G.empty + 3, `bad hash leaves more buckets empty at n=200 m=${m}`);
  ok(S.probes > G.probes + 0.9, `bad hash lookups clearly slower at n=200 m=${m}`);
}
{ // the expectation formulas are right for a truly random hash (Monte Carlo)
  let empty = 0, probes = 0; const R = 3000, n = 100, m = 32;
  for (let rr = 0; rr < R; rr++) { const lens = new Array(m).fill(0); for (let i = 0; i < n; i++) lens[Math.floor(rnd() * m)]++; empty += lens.filter(l => !l).length; probes += lens.reduce((s, l) => s + l * (l + 1) / 2, 0) / n; }
  ok(Math.abs(empty / R - M.expectEmpty(n, m)) < 0.1, 'E[empty] = m(1 − 1/m)^n'); ok(Math.abs(probes / R - M.expectProbes(n, m)) < 0.02, 'E[probes] = 1 + (n−1)/2m');
  const pb = M.poissonBins(n, m, 30); ok(Math.abs(pb.reduce((a, b) => a + b, 0) - m) < 1e-6, 'Poisson bins sum to m');
}

// ---- step 3: birthday ----
ok(M.pCollide(23, 365) > 0.5 && M.pCollide(22, 365) < 0.5, '23 people pass 50% (linked page)'); both('lk1', '23');
for (let b = 8; b <= 20; b++) {
  const d = 2 ** b, k = M.k50(d);
  ok(Math.abs(k - 1.1774 * Math.sqrt(d)) <= 1.5, `k50 ≈ 1.18√d for b=${b}`);
  ok(Math.abs(M.pCollide(Math.round(Math.sqrt(d)), d) - 0.393) < 0.02, 'about 39% at √d');
  if (b <= 18) { const ratio = M.k50(4 * d) / k; ok(ratio > 1.85 && ratio < 2.05, 'two more bits ≈ doubles the clash point'); }
  // the experiment with a real hash matches the formula: KS distance of 300 trials below 0.1
  const T = 300, ks = []; for (let t = 0; t < T; t++) ks.push(M.firstCollision(t, b)); ks.sort((x, y) => x - y);
  let D = 0; ks.forEach((v, i) => { const F = M.pCollide(v, d); D = Math.max(D, Math.abs(F - (i + 1) / T), Math.abs(F - i / T)); });
  ok(D < 0.1, `experiment vs theory KS ${D} for b=${b}`);
  ok(ks[T - 1] <= Math.ceil(4 * Math.sqrt(d)) * 1.2, 'trials essentially fit the 4√d axis');
}
{ // pCollide by brute force for a tiny d
  const d = 6; for (let k = 1; k <= 7; k++) { let tot = 0, clash = 0; const rec = (arr) => { if (arr.length === k) { tot++; if (new Set(arr).size < k) clash++; return; } for (let v = 0; v < d; v++) rec([...arr, v]); }; if (k <= 5) { rec([]); ok(Math.abs(clash / tot - M.pCollide(k, d)) < 1e-12, 'exact birthday formula'); } }
  eq(M.pCollide(7, 6), 1, 'pigeonhole');
}

// ---- step 4: bits needed ----
ok(Math.abs(M.pAny(1e9, 64) - 0.027) < 0.001, 'N = 1e9, 64 bits: about 2.7%'); both('s4hint', '2.7%');
eq(M.bitsNeeded(1e9, 1e-6), 79, '79 bits for 1e-6'); both('s4hint', '79');
for (let x = 3; x <= 12; x++) for (let y = -18; y <= -3; y += 3) {
  const N = 10 ** x, p = 10 ** y, b = M.bitsNeeded(N, p);
  ok(M.pAny(N, b) <= p * (1 + 1e-9) && M.pAny(N, b - 1) > p, 'smallest b with P ≤ p');
  ok(b <= 256 && b >= 16, 'needed bits inside the plotted axis');
  if (x < 12) { const dlt = M.bitsNeeded(N * 10, p) - b; ok(dlt >= 6 && dlt <= 7, 'N × 10 costs about 6.6 bits'); }
  if (y > -18) { const dlt = M.bitsNeeded(N, p / 1000) - b; ok(dlt >= 9 && dlt <= 11, '3 orders of p cost about 10 bits'); }
}
ok(M.pAny(1e12, 128) < 1e-14, '128 bits at N = 1e12 negligible');
// the approximation agrees with the exact product where both are computable
for (const [N, b] of [[100, 16], [1000, 20], [5000, 24], [300, 12]]) { const ex = M.pCollide(N, 2 ** b), ap = M.pAny(N, b); ok(Math.abs(ex - ap) < 0.01 * Math.max(ex, 0.01), `approx vs exact N=${N} b=${b}`); }

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) eq(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k);
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/左图|右图|left panel|right panel|left chart|right chart/i.test(v), 'no left/right figure references: ' + k);

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['txt0', 'presets0', 'i1', 'sweep1', 'clear1', 'n2', 'm2', 'good2', 'bad2', 'b3', 'run3', 'clear3', 'n4', 'p4']) ok(html.includes(`id="${id}"`), 'control ' + id);
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
ok(fs.existsSync(path.join(dir, '../../../computing/algorithms/hashing/index.html')), 'comparison link target exists');
for (let i = 0; i <= 5; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS hashing core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
