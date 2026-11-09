'use strict';
// Number theory & counting (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const eq = (a, b, m) => { assert.deepEqual(a, b, m); checks++; };
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
const range = id => { const m = html.match(new RegExp(`id="${id}"[^>]*min="(-?[\\d.]+)" max="(-?[\\d.]+)"[^>]*value="(-?[\\d.]+)"`)); assert.ok(m, 'slider ' + id); return m.slice(1).map(Number); };

// ---- step 0: prime factorisation is unique, whatever the first cut (2..400, every first cut) ----
const [n0lo, n0hi, n0def] = range('n0');
eq([n0lo, n0hi], M.RANGE.n0, 'n0 range matches model');
for (let n = n0lo; n <= n0hi; n++) {
  const want = M.leavesOf(n).join(','), prod = M.leavesOf(n).reduce((s, p) => s * p, 1);
  ok(prod === n && M.leavesOf(n).every(M.isPrime), 'leaves are primes multiplying to ' + n);
  const J = M.splits(n).length;
  ok((J === 0) === M.isPrime(n), 'no first cut exactly for primes: ' + n);
  for (let c = 0; c < Math.max(1, J); c++) {
    const tree = M.factorTree(n, c);
    eq(M.treeLeaves(tree).sort((a, b) => a - b).join(','), want, `unique leaves n=${n} cut=${c}`);
    if (J > 1 && c > 0) ok(M.factorTree(n, c).kids[0].v !== M.factorTree(n, c - 1).kids[0].v, 'different first cuts really differ');
  }
}
eq(M.splits(n0def).length, 11, '360 has 11 first cuts');
ok(M.leavesOf(360).join(',') === '2,2,2,3,3,5', '360 = 2³ × 3² × 5');
ok(M.splits(1).length === 0 && !M.isPrime(1), '1 is not prime');

// ---- step 1: divisor table = all divisors; count = Π(e+1); pairing and perfect squares ----
const [n1lo, n1hi, n1def] = range('n1');
let maxRows = 0, maxCols = 0;
for (let n = n1lo; n <= n1hi; n++) {
  const T = M.divisorTable(n), flat = T.cells.flat().sort((a, b) => a - b), brute = M.divisors(n);
  eq(flat, brute, 'table holds every divisor exactly once: ' + n);
  ok(M.divisorCount(n) === brute.length, 'Π(e+1) = brute count: ' + n);
  ok((brute.length % 2 === 1) === M.isSquare(n), 'odd divisor count ⇔ perfect square: ' + n);
  brute.forEach(d => ok(brute.includes(n / d), 'partner n/d is a divisor'));
  maxRows = Math.max(maxRows, T.rows.length); maxCols = Math.max(maxCols, T.cols.length);
}
ok(maxRows <= 9 && maxCols <= 8, 'table fits the canvas layout (≤ 9 rows, ≤ 8 columns)');
eq(M.factorize(72), [[2, 3], [3, 2]], '72 = 2³ × 3² (s1e example)'); ok(M.divisorCount(72) === 12, '72 has 4 × 3 = 12 divisors');
eq(M.divisors(12), [1, 2, 3, 4, 6, 12], 'divisors of 12 (s1e)');
ok(n1def === 72 && range('d1')[1] === 12, 'step 1 default n = 72 with 12 divisors');
[36, 64, 100].forEach(n => ok(M.isSquare(n) && M.divisorCount(n) % 2 === 1, n + ' perfect square example'));

// ---- step 2: Euclid ----
const [elo, ehi, aDef] = range('a2'), bDef = range('b2')[2];
eq([elo, ehi], M.RANGE.euclid, 'Euclid range matches model'); eq(range('b2').slice(0, 2), M.RANGE.euclid, 'b range');
let worst = { steps: 0 };
for (let a = elo; a <= ehi; a++) for (let b = elo; b <= ehi; b++) {
  const E = M.euclid(a, b);
  ok(E.gcd === M.gcdBrute(a, b), `gcd(${a},${b})`);
  ok(M.exponentView(a, b).gcd === E.gcd, 'min-exponent gcd = Euclid gcd');
  ok(M.exponentView(a, b).lcm === M.lcm(a, b), 'max-exponent lcm');
  E.rows.forEach(r => ok(r.a === r.q * r.b + r.r && r.r >= 0 && r.r < r.b, 'each row is a division with remainder'));
  for (let i = 1; i < E.rows.length; i++) ok(M.gcdBrute(E.rows[i].a, E.rows[i].b) === E.gcd, 'gcd invariant along the chain');
  // the squares tile the rectangle exactly: total area = a·b
  ok(E.rows.reduce((s, r) => s + r.q * r.b * r.b, 0) === a * b, 'squares tile the rectangle');
  if (E.steps > worst.steps) worst = { steps: E.steps, a, b };
}
ok(worst.steps === 9, 'max 9 divisions in range (s2hint)');
ok(M.euclid(89, 55).steps === 9 && M.euclid(89, 55).rows.every(r => r.q === 1 || r.r === 0), '89, 55 needs all 9 divisions, one square per round');
let slowest = 0; for (let a = elo; a <= ehi; a++) for (let b = elo; b <= ehi; b++) if (M.euclid(a, b).steps === 9) slowest++;
ok(slowest === 2, '89/55 (both orders) is the only 9-division pair');
eq(M.euclid(aDef, bDef).rows.map(r => [r.a, r.q, r.b, r.r]), [[84, 2, 36, 12], [36, 3, 12, 0]], 'default chain 84, 36');
ok(M.euclid(aDef, bDef).gcd === 12, 'default gcd 12');
ok(M.euclid(13, 8).gcd === 1, 'coprime ends in 1 × 1 squares');

// ---- step 3: lamps ----
const [llo, lhi] = range('a3'); eq([llo, lhi], M.RANGE.lamp, 'lamp range'); eq(range('b3').slice(0, 2), M.RANGE.lamp, 'lamp b range');
for (let a = llo; a <= lhi; a++) for (let b = llo; b <= lhi; b++) {
  const l = M.lcm(a, b), L = M.lamps(a, b, l + Math.max(a, b));
  ok(L.first === l, 'first common flash = lcm');
  ok(M.gcd(a, b) * l === a * b, 'gcd × lcm = a × b');
  ok(L.fa.includes(l) && L.fb.includes(l) && L.fa.filter(v => v > 0 && v < l).every(v => !L.fb.includes(v)), 'no earlier coincidence');
}
ok(M.lcm(5, 8) === 40 && M.lcm(6, 8) === 24, 's3hint: 40 s → 24 s');
ok(M.lcm(4, 8) === 8, 's3hint: a = 4, b = 8 gives 8');
ok(range('a3')[2] === 6 && range('b3')[2] === 8, 'step 3 defaults 6, 8');

// ---- step 4: routes ----
const [rlo, rhi] = range('r4'), [ulo, uhi] = range('u4');
for (let r = rlo; r <= rhi; r++) for (let u = ulo; u <= uhi; u++) {
  const W = M.pathTable(r, u), P = M.allPaths(r, u);
  ok(W[r][u] === M.choose(r + u, u) && P.length === W[r][u], `adding rule = C(${r + u},${u}) = enumeration`);
  ok(new Set(P).size === P.length && P.every(w => w.length === r + u && [...w].filter(c => c === 'U').length === u), 'routes are distinct words');
  for (let i = 0; i <= r; i++) for (let j = 0; j <= u; j++) ok(W[i][j] === M.choose(i + j, j), 'every corner is a Pascal entry');
  ok(M.choose(r + u, u) === M.choose(r + u, r), 'C(n,u) = C(n,r)');
  if (u <= rhi && r <= uhi) ok(M.pathTable(u, r)[u][r] === W[r][u], 'swapping r and u keeps the total');
  ok(M.choose(r + u, u) === M.factorial(r + u) / (M.factorial(u) * M.factorial(r)), 'factorial formula');
}
ok(M.choose(rhi + uhi, uhi) === 462, 'largest grid: 462 routes (3-digit labels)');

// ---- step 5: P = C × k! ----
const [plo, phi] = range('n5'), [klo, khi] = range('k5');
for (let n = plo; n <= phi; n++) for (let k = klo; k <= khi; k++) {
  const S = M.subsets(n, k), O = M.orderedPicks(n, k);
  ok(S.length === M.choose(n, k) && O.length === M.perm(n, k), 'C and P by enumeration');
  ok(O.length === S.length * M.factorial(k), 'P = C × k!');
  S.forEach(set => ok(M.orderings(set).length === M.factorial(k) && M.orderings(set).every(w => O.includes(w)), 'each set has k! orders, all ordered picks'));
  ok(new Set(O.map(w => [...w].sort().join(''))).size === S.length, 'ordered picks collapse onto the combinations');
}
eq([1, 2, 3].map(M.factorial), [1, 2, 6], 's5hint: 1, 2, 6 dots per column');

// ---- step 6: question bank ----
for (let seed = 1; seed <= 400; seed++) {
  const q = M.question(seed);
  if (q.kind === 'qDiv') ok(q.answer === M.divisors(q.n).length && q.n >= 2, 'qDiv answer');
  if (q.kind === 'qGcd') ok(q.answer === M.gcdBrute(q.a, q.b) && q.a !== q.b, 'qGcd answer');
  if (q.kind === 'qLcm') { let l = 1; while (l % q.a || l % q.b) l++; ok(q.answer === l, 'qLcm answer'); }
  if (q.kind === 'qPath') ok(q.answer === M.allPaths(q.r, q.u).length, 'qPath answer');
}
ok(new Set(Array.from({ length: 8 }, (_, i) => M.question(i + 1).kind)).size === 4, 'all four kinds appear');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
eq(zk, ek, 'zh/en key sets match');
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
ok(STRINGS.zh.s2hint.includes('9 次') && STRINGS.en.s2hint.includes('9 divisions'), 'quoted max division count');
ok(STRINGS.zh.s3hint.includes('40 秒缩到 24 秒') && STRINGS.en.s3hint.includes('40 s to 24 s'), 'quoted lamp waits');
ok(STRINGS.zh.s1e.includes('4 × 3 = 12') && STRINGS.en.s1e.includes('4 × 3 = 12'), 'quoted divisor count of 72');

// ---- every key referenced in HTML/app exists ----
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const k of ['sameYes', 'sameNo', 'sqYes', 'sqNo', 'tipDiv', 'tipGcd', 'tipLcm', 'tipPath']) ok(app.includes(`'${k}'`), 'app uses ' + k);
for (const id of ['n0', 'split0', 'reset0', 'n1', 'd1', 'a2', 'b2', 'cut2', 'all2', 'a3', 'b3', 'play3', 'all3', 'r4', 'u4', 'walk4', 'clear4', 'n5', 'k5', 'j5', 'ans6', 'check6', 'show6', 'new6']) ok(html.includes(`id="${id}"`), 'control ' + id);
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
ok(fs.existsSync(path.join(dir, '../../../math/arithmetic/number-combinatorics/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS number-combinatorics core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · worst Euclid ${worst.steps} divisions (${worst.a}, ${worst.b})`);
