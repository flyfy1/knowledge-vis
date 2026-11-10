'use strict';
// RSA (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };

// ---- fast powers agree with repeated multiplication; operation counts ----
for (let n = 2; n <= 60; n++) for (let m = 0; m < n; m++) for (let E = 0; E <= 70; E++) {
  const r = M.modpow(m, E, n);
  if (r.value !== M.modpowNaive(m, E, n)) assert.fail(`modpow ${m}^${E} mod ${n}`);
  if (E >= 1) {
    const L = E.toString(2).length;
    if (r.squares + r.mults !== M.fastCount(E)) assert.fail('fastCount = squarings + products');
    if (M.fastCount(E) > 2 * (L - 1) || M.fastCount(E) < L - 1) assert.fail('L−1 ≤ fast ≤ 2(L−1)');
    if (r.ops[r.ops.length - 1].exp !== E) assert.fail('ladder ends at the exponent');
  }
}
checks++;

// ---- step 0: measured trial division ----
const T = M.splitTable();
ok(T.length === 17 && T[0].b === 8 && T[T.length - 1].b === 40, 'sizes 8..40 step 2');
T.forEach(r => {
  ok(M.isPrime(r.p) && M.isPrime(r.q) && r.q < r.p && r.p < Math.pow(2, r.b / 2), 'two largest primes below 2^(b/2) at b=' + r.b);
  ok(r.found === r.q, 'trial division stops at q');
  ok(r.nBits === r.b, 'n has exactly b bits');
  // the counted divisions: 2, then every odd number up to q
  ok(r.divisions === 1 + (r.q - 1) / 2, 'division count');
  if (r.b >= 16) ok((r.root - r.q) / r.root < 0.02, 'q sits right next to √n');
});
for (let i = 1; i < T.length; i++) { const ratio = T[i].divisions / T[i - 1].divisions; ok(ratio > 1.85 && ratio < 2.55, 'about ×2 per two bits'); }
ok(T[0].digitMults === 4 && T[T.length - 1].digitMults === 49, 'schoolbook products 4 → 49');
ok(T[T.length - 1].divisions === 524286, '40 bits: 524286 divisions');
// default visited range 8..16 gives the ratio shown on load
near(Math.pow(T[4].divisions / T[0].divisions, 1 / 4), 2.12, 0.01, 'default trend ratio');

// ---- step 1: powers on a clock, Euler's theorem ----
for (let n = 3; n <= 36; n++) {
  const ph = M.phi(n);
  for (let a = 2; a < n; a++) {
    const o = M.orbit(a, n), pw = M.modpow(a, ph, n).value;
    if (M.gcd(a, n) === 1) { ok(o.ret > 0 && ph % o.ret === 0 && pw === 1, `Euler a=${a} n=${n}`); ok(o.cycleStart === 0 && o.cycleLen === o.ret, 'pure cycle'); }
    else { ok(o.ret === 0 && pw !== 1, `no return a=${a} n=${n}`); ok(o.cycleLen > 0, 'falls into a loop'); }
  }
}
ok(M.phi(14) === 6 && M.orbit(5, 14).ret === 6, 'n = 14, a = 5: loop length 6 = φ');
assert.deepEqual(M.orbit(5, 14).seq.slice(1), [5, 11, 13, 9, 3, 1]); checks++;
[2, 4, 7].forEach(a => ok(M.gcd(a, 14) > 1, 'hollow examples in the hint'));
ok([...Array(12)].some((_, i) => { const a = i + 2; return M.gcd(a, 14) === 1 && M.orbit(a, 14).ret < 6; }), 'loop length is not always φ (s1hint)');
for (let p = 2; p < 50; p++) for (let q = 2; q < 50; q++) if (M.isPrime(p) && M.isPrime(q) && p !== q) ok(M.phi(p * q) === (p - 1) * (q - 1), 'φ(pq)');

// ---- step 2: keys ----
const def = M.makeKey(11, 29, 3);
ok(def.n === 319 && def.phi === 280 && def.d === 187 && def.k === 2, 'default key 319 / 280 / 187');
ok(M.P_LIST[2] === 11 && M.Q_LIST[0] === 29 && M.validE(280)[0] === 3, 'default slider positions');
let keys = 0, allChecked = 0;
for (const p of M.P_LIST) for (const q of M.Q_LIST) {
  const ph = (p - 1) * (q - 1), es = M.validE(ph, 8);
  ok(es.length === 8, 'eight e candidates for every p, q');
  for (const e of es) {
    const K = M.makeKey(p, q, e); keys++;
    ok(M.gcd(e, ph) === 1 && K.d > 0 && K.d < ph && (e * K.d) % ph === 1 && e * K.d === K.k * ph + 1, 'e·d = kφ + 1');
    let hits = 0; for (let d = 1; d < ph; d++) if ((e * d) % ph === 1) hits++;
    ok(hits === 1, 'exactly one dot at height 1');
    ok(K.euclid.rows.some(r => r.r === 1) && K.euclid.g === 1, 'Euclid reaches remainder 1');
    K.euclid.rows.forEach(r => ok(r.r === r.s * ph + r.t * e, 'row invariant r = s·φ + t·e'));
    ok(((K.euclid.t % ph) + ph) % ph === K.d, 'd from t');
    // ---- step 3: every plaintext round-trips; fixed points ----
    let fixed = 0;
    for (let m = 0; m < K.n; m++) {
      const c = M.modpow(m, e, K.n).value;
      if (M.modpow(c, K.d, K.n).value !== m) assert.fail(`round trip m=${m} key ${p},${q},${e}`);
      if (c === m) fixed++;
      allChecked++;
    }
    ok(fixed === M.fixedPointsFormula(p, q, e) && fixed >= 9, 'fixed points incl. 0, 1, n − 1');
    ok(M.modpow(K.n - 1, e, K.n).value === K.n - 1, 'n − 1 is fixed (e odd)');
    // ---- step 5: trial division finds p; recovered d matches ----
    const att = M.trialFactor(K.n);
    ok(att.f === p && att.g === q && att.f * att.f <= K.n, 'eavesdropper finds p below √n');
    ok(M.makeKey(att.f, att.g, e).d === K.d, 'recovered d');
  }
}
ok(M.P_LIST.every(p => M.Q_LIST.every(q => p < q)), 'p < q: smallest factor is p');

// ---- step 4: fast powers ----
ok(2 * 2047 === 4094 && Math.floor(2047 * Math.log10(2)) === 616, '2048-bit exponent counts');
ok(M.fastCount(65537) === 17 && M.fastCount(3) === 2, 'small public exponents are cheap');
ok(Math.pow(2, 24) - 2 < Math.pow(10, 8), 'naive band stays inside the 10^8 axis');

// ---- step 5: orders of magnitude ----
near(M.gnfsLog10(2048), 35.19, 0.01, 'GNFS 2048 ≈ 10^35.2');
near(M.yearLog10, 25.5, 0.01, 'one year at 10^18 ops/s');
let cross = 0; for (let L = 64; L <= 4096; L += 64) if (!cross && M.yearsLog10(M.gnfsLog10(L)) > 0) cross = L;
ok(cross === 1024 && M.yearsLog10(M.gnfsLog10(960)) < 0, 'GNFS crosses the one-year line around 1000 bits');
ok(M.gnfsLog10(4096) < 60, 'GNFS stays on the chart');
let off = 0; for (let L = 16; L <= 4096; L += 16) if (!off && M.trialLog10(L) > 60) off = L;
ok(off > 0 && off <= 448, 'trial division leaves the chart early');
for (let L = 64; L <= 4096; L += 64) ok(M.legitLog10(L) < 12, 'legitimate cost stays near the floor');
ok(M.yearsLog10(M.gnfsLog10(2048)) > 9 && M.yearsLog10(M.gnfsLog10(2048)) < 10.5, '2048 bits: ~10^9.7 years');
ok(Math.ceil(2048 * Math.log10(2)) === 617, '2048 bits ≈ 617 decimal digits (“six hundred-odd”)');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['euS', 'euT', 'formula']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/左图|右图|left chart|right chart|left-hand|right-hand/i.test(v), 'no left/right chart wording in ' + l + '.' + k);

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['b0', 'sweep0', 'slow0', 'n1', 'a1', 'walk1', 'p2', 'q2', 'e2', 'm3', 'check3', 'useE', 'useD', 'run4', 'attack5', 'L5', 'checkQuiz']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(/max="6"/.test(html.match(/id="p2"[^>]*/)[0]) && /max="5"/.test(html.match(/id="q2"[^>]*/)[0]) && /max="7"/.test(html.match(/id="e2"[^>]*/)[0]), 'slider ranges match the lists');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../computing/systems/rsa-encryption/index.html')), 'comparison link target exists');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS rsa-encryption core: ${checks} checks · ${keys} keys × all plaintexts (${allChecked} round trips) · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
