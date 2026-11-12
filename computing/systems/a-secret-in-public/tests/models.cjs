'use strict';
// Pins every number the essay's prose states to the page's own models, and checks that the prose
// (copy.zh.js) still says exactly that number. Also checks the cryptography itself (SHA-256 test vectors,
// RSA/DH/EC identities), every sentence branch and its placeholders, the frontier dates and the
// no-Chinese-outside-copy rule. Run: node computing/systems/a-secret-in-public/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const M = require(path.join(DIR, 'models.js'));
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;
const HTML = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8'), APP = fs.readFileSync(path.join(DIR, 'app.js'), 'utf8');

let n = 0, fails = 0;
function check(name, got, want) {
  n++;
  if (got !== want) { fails++; console.error(`FAIL ${name}: model gives ${got}, expected ${want}`); }
}
function ok(name, cond) { check(name, !!cond, true); }
function says(key, phrase) {
  n++;
  if (!Z[key] || !Z[key].includes(phrase)) { fails++; console.error(`FAIL prose ${key} should contain "${phrase}"`); }
}
const g = x => (typeof x === 'bigint' ? x : Math.round(x)).toLocaleString('en-US'); // the page's grouping
const f = (x, d) => x.toFixed(d);
const html = (sel) => { const m = HTML.match(new RegExp('<input[^>]*id="' + sel + '"[^>]*>')); return m ? m[0] : ''; };
const attr = (sel, a) => { const m = html(sel).match(new RegExp(a + '="([^"]*)"')); return m ? m[1] : null; };

/* ── shared number theory ── */
{
  check('modPow 4^327 mod 2039', M.modPow(4n, 327n, 2039n), 1027n);
  check('modInv', M.modInv(257n, 55680n), 5633n);
  check('iroot', M.iroot(10n ** 30n + 5n, 3), 10n ** 10n);
  ok('isPrime 2^61−1', M.isPrime((1n << 61n) - 1n)); ok('not prime 561 (Carmichael)', !M.isPrime(561n));
  ok('isPrime 2^127−1 (random-base branch)', M.isPrime((1n << 127n) - 1n)); ok('not prime (2^61−1)(2^31−1)', !M.isPrime(((1n << 61n) - 1n) * ((1n << 31n) - 1n)));
  check('text round trip', M.intToText(M.textToInt('MEET AT NOON')), 'MEET AT NOON');
}

/* ── ch1 key counting ── */
{
  check('ch1 pairs(100000)', g(M.keys.pairs(100000)), '4,999,950,000'); says('ch1.p3', '4,999,950,000');
  says('ch1.p3', 'n(n−1)/2');
  check('ch1 default n', attr('knN', 'value'), '10'); check('ch1 pairs(10)', M.keys.pairs(10), 45);
}

/* ── ch2 square-and-multiply and the race ── */
{
  const G = M.safePrimeBelow(M.DH_BITS);
  check('ch2 safe prime 11 bits', G.p, 2039n); check('ch2 q', G.q, 1019n); ok('ch2 q prime', M.isPrime(G.q));
  says('ch2.modelA.title', '4ˣ mod 2039');
  check('ch2 4 has order q', M.modPow(4n, G.q, G.p), 1n);
  const tr = M.powTrace(4n, 327n, 2039n);
  check('ch2 trace value', tr.value, 1027n); check('ch2 squarings', tr.squarings, 8); check('ch2 mults', tr.mults, 4); check('ch2 total', tr.total, 12);
  check('ch2 smX default 327', attr('smX', 'value'), '327'); check('ch2 smX max = q−1', attr('smX', 'max'), String(G.q - 1n));
  for (let x = 1; x <= 1018; x += 37) check('ch2 trace = modPow x=' + x, M.powTrace(4n, BigInt(x), 2039n).value, M.modPow(4n, BigInt(x), 2039n));
  check('ch2 forwardMax(2048)', g(M.race.forwardMax(2048)), '4,094'); says('ch2.p3', '4,094'); says('ch2.p5', '4,094');
  says('ch2.p3', '2(k−1)');
  check('ch2 brute log2 at 2048', M.race.bruteExpectedLog2(2048), 2046); says('ch2.p5', '2<sup>2046</sup>');
  check('ch2 bsgs log2 at 2048', M.race.bsgsLog2(2048), 1024.5); says('ch2.p5', '2<sup>1024.5</sup>');
  // every prime size on the slider: safe prime, BSGS finds x, brute (small sizes) finds x in exactly x steps
  for (let bits = 8; bits <= 40; bits += 4) {
    const I = M.dlogInstance(bits, 1), S = M.safePrimeBelow(bits);
    ok('ch2 safe prime ' + bits, M.isPrime(S.p) && M.isPrime(S.q) && S.p === 2n * S.q + 1n && M.bitLength(S.p) === bits);
    const b = M.bsgs(I); check('ch2 bsgs finds x at ' + bits, b.x, I.x); ok('ch2 bsgs ≤ 2√q at ' + bits, b.steps <= 2 * Math.sqrt(Number(I.q)) + 2);
    if (bits <= 20) { const s = M.bruteRun(M.bruteStart(I), 1e7); check('ch2 brute steps = x at ' + bits, BigInt(s.steps), I.x); }
  }
  const I20 = M.dlogInstance(20, 1); check('ch2 seed-1 20-bit x', I20.x, 420965n); check('ch2 20-bit bsgs steps', M.bsgs(I20).steps, 1305);
  // "bits + 4 → brute ×16, BSGS ×4": the model's expected costs
  check('ch2 +4 bits brute ×16', Math.pow(2, M.race.bruteExpectedLog2(24) - M.race.bruteExpectedLog2(20)), 16); says('ch2.say.done', '多 16 倍');
  check('ch2 +4 bits bsgs ×4', Math.pow(2, M.race.bsgsLog2(24) - M.race.bsgsLog2(20)), 4); says('ch2.say.done', '小步大步多 4 倍');
  says('ch2.p5', '√2 倍');
  check('ch2 slider', [attr('rcBits', 'min'), attr('rcBits', 'max'), attr('rcBits', 'step')].join(','), '8,40,4'); says('ch2.limit', '最多 40 位');
}

/* ── ch3 Diffie–Hellman ── */
{
  check('ch3 DH bits', M.bitLength(M.safePrimeBelow(M.DH_BITS).p), 11); says('ch3.p5', 'p = 2039 只有 11 位'); says('ch3.model.title', 'p = 2039');
  const x = M.dh(+attr('dhA', 'value'), +attr('dhB', 'value'));
  check('ch3 defaults', [x.A, x.B, x.sA].join(','), '1027,265,294'); check('ch3 both sides agree', x.sA, x.sB);
  for (let a = 1; a <= 1018; a += 101) for (let b = 1; b <= 1018; b += 113) { const y = M.dh(a, b); if (y.sA !== y.sB) check('ch3 agree ' + a + ',' + b, y.sA, y.sB); }
  const e = M.eve(x); check('ch3 Eve recovers the key', e.s, x.sA); check('ch3 Eve steps', e.steps, 42); says('ch3.say.eve', '几十步就够');
  const mm = M.mitm(x, 101, 202);
  check('ch3 MITM Alice key = Mallory A key', mm.kAlice, mm.kMalA); check('ch3 MITM Bob key = Mallory B key', mm.kBob, mm.kMalB);
  ok('ch3 MITM two different keys', mm.kAlice !== mm.kBob); check('ch3 MITM values', [mm.kAlice, mm.kBob].join(','), '60,212');
  says('ch3.say.mal', '1 到 2038'); ok('app MAL secrets 101, 202', APP.includes('const MAL = [101, 202]'));
  check('ch3 GNFS 2048', f(M.gnfsLog2(2048), 0), '117'); says('ch3.p5', '2<sup>117</sup>');
  check('ch3 BSGS 2048-bit p (q ≈ 2^2047) ≈ 2^1024', Math.round(M.race.bsgsLog2(2048)), 1025);
  says('ch3.p5', '约 2<sup>1024</sup> 步'); // √q = 2^1023.5 baby steps; the prose rounds √q
  check('ch3 √(2^2047) ≈ 2^1024 to the nearest power', Math.round(2047 / 2), 1024);
}

/* ── ch4 RSA ── */
{
  const P = M.RSA_PRIMES; check('ch4 primes 101..997', [P[0], P[P.length - 1], P.length].join(','), '101,997,143');
  check('ch4 slider max', attr('rsP', 'max'), String(P.length - 1));
  const k = M.rsaKey(P[+attr('rsP', 'value')], P[+attr('rsQ', 'value')]);
  check('ch4 default key', [k.p, k.q, k.n, k.phi, k.e, k.d].join(','), '241,233,56153,55680,257,5633');
  check('ch4 e·d ≡ 1', (k.e * k.d) % k.phi, 1n);
  const m = BigInt(attr('rsM', 'value')), c = M.rsaEnc(k, m);
  check('ch4 c(100)', c, 16748n); check('ch4 decrypt', M.rsaDec(k, c), m);
  check('ch4 signature', M.rsaSign(k, m), 12763n); ok('ch4 verify', M.rsaVerify(k, m, M.rsaSign(k, m))); ok('ch4 forged sig fails', !M.rsaVerify(k, m, 12764n));
  check('ch4 tamper doubles m', M.rsaDec(k, M.rsaScale(k, c, 2)), 2n * m);
  const big = BigInt(k.n - 10n); check('ch4 tamper wraps', M.rsaDec(k, M.rsaScale(k, M.rsaEnc(k, big), 2)), 2n * big - k.n);
  const td = M.trialDivide(k.n); check('ch4 trial division', [td.f, td.tries].join(','), '233,116');
  check('ch4 default n digits', k.n.toString().length, 5); says('ch4.p5', '默认的 n 只有 5 位');
  check('ch4 2048-bit n digits', ((1n << 2047n)).toString().length, 617); check('ch4 2048-bit max digits', ((1n << 2048n) - 1n).toString().length, 617); says('ch4.p5', '617 位');
  // every prime pair round-trips (sampled), and e is always coprime to φ
  for (let i = 0; i < P.length; i += 7) for (let j = 3; j < P.length; j += 11) { if (i === j) continue; const kk = M.rsaKey(P[i], P[j]); ok('ch4 key ' + i + ',' + j, kk.d && M.rsaDec(kk, M.rsaEnc(kk, 2n)) === 2n); }
  // the rsM slider reaches n−1 on the smallest pair? (the page clamps max to n−1; HTML max must not be below the smallest n−1)
  ok('ch4 rsM html max ≤ smallest n − 1', +attr('rsM', 'max') <= 101 * 103 - 1);
  // cube-root attack
  const K3 = M.rsaBig3(); check('ch4 512-bit n', M.bitLength(K3.n), 512); check('ch4 e=3 inverse', (3n * K3.d) % K3.phi, 1n);
  says('ch4.modelB.how', '512 位');
  const mi = M.textToInt('MEET AT NOON'); check('ch4 msg bits', M.bitLength(mi), 95); check('ch4 cube bits', M.bitLength(mi ** 3n), 283);
  for (const msg of ['MEET AT NOON', 'PIN 4096', 'YES']) {
    const mm = M.textToInt(msg), cc = M.modPow(mm, 3n, K3.n), a = M.cubeRootAttack(K3, cc);
    ok('ch4 cube root reads ' + msg, a.exact && M.intToText(a.m) === msg);
    const pm = M.padRandom(mm, K3, 7), pc = M.modPow(pm, 3n, K3.n), pa = M.cubeRootAttack(K3, pc);
    ok('ch4 padding defeats root ' + msg, !pa.exact); check('ch4 Bob still decrypts padded ' + msg, M.modPow(pc, K3.d, K3.n), pm);
    check('ch4 padding keeps the message in the low bytes ' + msg, pm & ((1n << 136n) - 1n), mm);
    ok('ch4 padded < n', pm < K3.n);
  }
  check('ch4 padded bits', M.bitLength(M.padRandom(mi, K3, 7)), 488);
}

/* ── ch5 elliptic curves ── */
{
  // real curve: P + Q lies on the curve; tangent case; vertical line → O
  const A = -2, Bc = 2, on = P => Math.abs(P.y * P.y - M.ecR.rhs(P.x, A, Bc)) < 1e-6;
  const pt = (x, neg) => { const y = Math.sqrt(M.ecR.rhs(x, A, Bc)); return { x, y: neg ? -y : y }; };
  for (const [a, b, ng] of [[-1.2, 0.6, false], [0, 1, true], [1.5, 1.5, false], [-1.5, 2.4, true]]) { const R = M.ecR.add(pt(a), pt(b, ng), A); ok('ch5 real sum on curve ' + a + ',' + b, R && on(R)); }
  check('ch5 vertical → O', M.ecR.add(pt(1), pt(1, true), A), null);
  ok('ch5 real curve has one component (disc < 0 → one real root)', -4 * A ** 3 - 27 * Bc ** 2 < 0);
  check('ch5 erP/erQ min ≥ root', +attr('erP', 'min') >= M.ecR.root(A, Bc), true);
  says('ch5.modelA.title', 'y² = x³ − 2x + 2'); says('ch5.modelB.title', 'y² = x³ + 2x + 3'); check('ch5 F_p curve', [M.EC_A, M.EC_B].join(','), '2,3');
  // F_p group: Hasse bound for every prime, the group law closes, associativity on samples
  check('ch5 slider covers EC_PRIMES', attr('efP', 'max'), String(M.EC_PRIMES.length - 1));
  for (const p of M.EC_PRIMES) {
    const G = M.ecGroup(p);
    ok('ch5 Hasse p=' + p, Math.abs(G.N - (p + 1)) <= 2 * Math.sqrt(p));
    ok('ch5 order divides N p=' + p, G.N % G.order === 0);
    const [P1, P2, P3] = [G.pts[1], G.pts[2], G.pts[G.pts.length - 1]];
    const s1 = M.ecAdd(M.ecAdd(P1, P2, p), P3, p), s2 = M.ecAdd(P1, M.ecAdd(P2, P3, p), p);
    ok('ch5 associativity p=' + p, JSON.stringify(s1) === JSON.stringify(s2));
    for (let k = 1; k <= Math.min(G.order, 60); k += 7) { const a = M.ecMul(k, G.G, p).R, b = M.ecMultiples(G.G, k, p)[k - 1]; ok('ch5 double-and-add = repeated add p=' + p + ' k=' + k, JSON.stringify(a) === JSON.stringify(b)); }
    check('ch5 order·G = O p=' + p, M.ecMul(G.order, G.G, p).R, null);
  }
  const p97 = M.EC_PRIMES[+attr('efP', 'value')]; check('ch5 default p', p97, 97);
  const G97 = M.ecGroup(97); check('ch5 p=97 group', [G97.N, G97.G.x, G97.G.y, G97.order].join(','), '100,0,10,50');
  const m23 = M.ecMul(+attr('efK', 'value'), G97.G, 97); check('ch5 23G', [m23.R.x, m23.R.y, m23.ops].join(','), '49,34,8');
  check('ch5 Hasse range 97', Math.ceil(98 - G97.hasse) + '–' + Math.floor(98 + G97.hasse), '79–117');
  check('ch5 efK max = order at default', attr('efK', 'max'), String(G97.order - 1)); // HTML max is a placeholder; app.js sets it to the order
  // NIST table
  check('ch5 NIST rows', M.NIST_TABLE.map(r => r.s + ':' + r.rsa + ':' + r.ecc).join(' '), '80:1024:160 112:2048:224 128:3072:256 192:7680:384 256:15360:512');
  says('ch5.p5', '3072 位的 RSA'); says('ch5.p5', '128 位安全'); says('ch5.tcap', 'SP 800-57'); says('ch5.limit', '251');
  check('ch5 largest p', M.EC_PRIMES[M.EC_PRIMES.length - 1], 251);
}

/* ── ch6 SHA-256 and certificates ── */
{
  check('sha256 ""', M.sha256(''), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  check('sha256 "abc"', M.sha256('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  check('sha256 448-bit', M.sha256('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq'), '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1');
  check('sha256 two blocks', M.sha256('a'.repeat(1000)).slice(0, 16), '41edece42d63e8d9');
  const want = { none: [true, true, true, true], name: [true, true, false, false], key: [true, true, false, false], resign: [true, true, false, false], selfroot: [false, true, true, false] };
  for (const tp of Object.keys(want)) {
    const ch = M.chain(tp), w = want[tp];
    check('ch6 ' + tp, [ch.rootTrusted, ...ch.links.map(l => l.sigOk)].join(',') + ',' + ch.ok, [w[0], ...(tp === 'selfroot' ? [true, true, true] : tp === 'none' ? [true, true, true] : [true, true, false])].join(',') + ',' + w[3]);
    says('ch6.say.' + tp, tp === 'none' ? '通过' : tp === 'selfroot' ? '第一环' : tp === 'resign' ? '照样失败' : '对不上');
  }
  check('ch6 key bits', M.bitLength(M.rsaKeyBits(512, 101).n), 512); says('ch6.model.how', '512 位');
  says('ch6.limit', '1999 年'); // RSA-155 (512 bits), Aug 1999
}

/* ── ch7 bits of security ── */
{
  const G = M.gnfsLog2, R = M.rhoLog2;
  check('ch7 gnfs table', [512, 1024, 2048, 3072, 7680, 15360].map(b => f(G(b), 1)).join(' '), '63.9 86.8 116.9 138.7 203.0 269.4');
  // "above the table by 5 to 13 bits"
  const gaps = M.NIST_TABLE.map(r => G(r.rsa) - r.s); check('ch7 gaps', gaps.map(x => f(x, 1)).join(' '), '6.8 4.9 10.7 11.0 13.4');
  check('ch7 gap range', Math.round(Math.min(...gaps)) + '–' + Math.round(Math.max(...gaps)), '5–13'); says('ch7.p3', '高 5 到 13 位');
  check('ch7 2048', f(G(2048), 0), '117'); says('ch7.p4', '2<sup>117</sup>');
  check('ch7 896', f(G(896), 0), '82'); says('ch7.p4', '2<sup>82</sup>');
  check('ch7 2048 − 896', f(G(2048) - G(896), 0), '35'); says('ch7.p4', '2<sup>35</sup>');
  check('ch7 1024', f(G(1024), 0), '87'); says('ch7.p4', '2<sup>87</sup>'); says('ch7.p4', '80 位');
  check('ch7 NIST 1024 → 80', M.NIST_TABLE[0].s, 80);
  check('ch7 rho 256', f(R(256), 1), '127.8'); check('ch7 rho = f/2 − 0.17', f(R(256) - 128, 2), '-0.17');
  says('ch7.say.symecc', '256 位的曲线对应 128 位安全');
  says('ch7.p2', '√(πn/4)');
  check('ch7 years 2^128 @1e18', f(M.yearsLog10(128, 1e18), 2), '13.03'); check('ch7 years GNFS-2048', f(M.yearsLog10(G(2048), 1e18), 2), '9.69');
  says('ch7.read.years', '10¹⁸'); says('ch7.limit', '10<sup>18</sup>');
  check('ch7 scB default → 512', [64, 80, 96, 112, 128, 160, 192, 224, 256, 384, 512, 1024, 2048, 3072, 4096, 7680, 15360][+attr('scB', 'value')], 512);
  ok('app ch7 SIZES', APP.includes('const SIZES = [64, 80, 96, 112, 128, 160, 192, 224, 256, 384, 512, 1024, 2048, 3072, 4096, 7680, 15360]'));
  check('ch7 scB max', attr('scB', 'max'), '16'); ok('app RATE 1e18', APP.includes('const RATE = 1e18'));
  // records: bits from the RSA challenge numbers
  check('ch7 records', M.RECORDS.map(r => r.id + ':' + r.bits + ':' + r.year).join(' '), 'rsa768:768:2009 dlp795:795:2019 rsa250:829:2020 rsa260:862:2026 rsa896:896:2026');
  for (const r of M.RECORDS) { says('ch7.rec.' + r.id, String(r.year)); }
  says('fx.records', '862 位'); says('fx.records', '896 位'); says('fx.records', '795 位');
}

/* ── ch8 quantum ── */
{
  check('ch8 SHOR_NS = products of two distinct odd primes', M.SHOR_NS.every(N => { for (let p = 3; p * p <= N; p += 2) if (N % p === 0) { const q = N / p; return M.isPrime(BigInt(p)) && M.isPrime(BigInt(q)) && p !== q; } return false; }), true);
  check('ch8 slider', attr('shN', 'max'), String(M.SHOR_NS.length - 1));
  const N = M.SHOR_NS[+attr('shN', 'value')]; check('ch8 default N', N, 143);
  const t2 = M.shorTry(+attr('shA', 'value'), N); check('ch8 N=143 a=2', [t2.kind, t2.r, t2.y, t2.f1, t2.f2].join(','), 'ok,60,12,11,13');
  check('ch8 share 143', f(M.shorStats(143).share * 100, 0), '76');
  // "at least half" for every N on the slider (Nielsen & Chuang Thm 5.3 bound is ≥ 1/2 for two distinct odd primes)
  for (const NN of M.SHOR_NS) ok('ch8 share ≥ 50% N=' + NN, M.shorStats(NN).share >= 0.5); says('ch8.p2', '至少一半');
  for (const NN of M.SHOR_NS) for (let a = 2; a < NN - 1; a += Math.max(1, Math.floor(NN / 20))) { const r = M.shorTry(a, NN); if (r.kind === 'ok') ok('ch8 factors ' + NN + ' a=' + a, r.f1 * r.f2 === BigInt(NN) && r.f1 > 1n && r.f2 > 1n); }
  // every say branch is reachable on the slider
  const kinds = new Set(); for (const NN of M.SHOR_NS) for (let a = 2; a < NN - 1; a++) kinds.add(M.shorTry(a, NN).kind);
  check('ch8 branches', [...kinds].sort().join(','), 'lucky,minus1,odd,ok');
  check('ch8 Grover 128', f(M.groverLog2(128), 2), '63.65'); says('ch8.p3', '约 2<sup>64</sup>'); says('ch8.p3', '2<sup>170</sup>/MAXDEPTH');
  // Mosca defaults: 10 + 8 > 15
  const [x, y, z] = ['moX', 'moY', 'moZ'].map(id => +attr(id, 'value'));
  check('ch8 Mosca default', [x, y, z, M.mosca.exposed(x, y, z), M.mosca.worry(x, y, z)].join(','), '10,8,15,3,true');
  check('ch8 Mosca edge', M.mosca.exposed(7, 8, 15), 0); ok('ch8 Mosca safe', !M.mosca.worry(5, 5, 15));
}

/* ── ch9 lattices and LWE ── */
{
  for (let k = 1; k <= 4; k++) check('ch9 same lattice k=' + k, Math.abs(M.det2(M.latBasis(k))), Math.abs(M.det2(M.LAT_GOOD)));
  check('ch9 det', M.det2(M.LAT_GOOD), 44);
  check('ch9 Hadamard', [M.LAT_GOOD, ...[1, 2, 3, 4].map(M.latBasis)].map(b => f(M.hadamard(b), 2)).join(' '), '0.99 0.62 0.32 0.19 0.13');
  // the bad basis generates the same lattice: its vectors are integer combinations of the good one and vice versa (unimodular)
  for (let k = 1; k <= 4; k++) { const b = M.latBasis(k), D = M.det2(M.LAT_GOOD); for (const v of b) { const c1 = (v[0] * M.LAT_GOOD[1][1] - v[1] * M.LAT_GOOD[1][0]) / D, c2 = (M.LAT_GOOD[0][0] * v[1] - M.LAT_GOOD[0][1] * v[0]) / D; ok('ch9 integer combo k=' + k, Number.isInteger(c1) && Number.isInteger(c2)); } }
  const rates = [0, 1, 2, 3, 4].map(k => M.babaiSuccess(k, 2000, 9));
  ok('ch9 success falls with skew', rates.every((r, i) => i === 0 || r < rates[i - 1]));
  ok('ch9 good basis > 85%', rates[0] > 0.85); ok('ch9 k=4 < 10%', rates[4] < 0.1);
  says('ch9.read.rate', '2000'); ok('app babaiSuccess 2000', APP.includes('M.babaiSuccess(k, 2000, 9)'));
  // exact CVP really is exact: compare to a wide brute force
  for (let s = 1; s <= 30; s++) { const T = M.latTarget(s), e = M.cvpExact(T); let best = 1e9; for (let i = -15; i <= 15; i++) for (let j = -15; j <= 15; j++) best = Math.min(best, M.dist([i * 7 + j * -2, i * 1 + j * 6], T)); check('ch9 exact CVP seed ' + s, f(e.d, 9), f(best, 9)); }
  const T1 = M.latTarget(1); check('ch9 seed-1 target', T1.map(v => f(v, 2)).join(','), '6.89,10.08');
  // LWE
  const def = { n: +attr('lwN', 'value'), eta: +attr('lwE', 'value'), q: 97 };
  check('ch9 lwe defaults', [def.n, def.eta].join(','), '8,12'); ok('app m = 4n, SEED 3, 2000 trials', APP.includes('m: 4 * +sN.value') && APP.includes('TRIALS = 2000, SEED = 3'));
  says('ch9.p4', 'm = 4n'); says('ch9.modelB.how', '2000');
  const res = M.lweTrial(8, 32, 97, 12, 2000, 3), sh = M.lweKeyShift(res.K);
  check('ch9 default failures', res.fail, 8); check('ch9 default prediction', f(M.lwePredictKey(res.K) * 100, 2), '0.48');
  check('ch9 default shift', [f(sh.mu, 1), f(sh.sd, 2)].join(','), '-5.5,7.23');
  // no noise: never fails, and Eve's elimination is exact
  for (const q of [97, 257, 3329]) for (let nn = 4; nn <= 32; nn += 4) {
    const z = M.lweTrial(nn, 4 * nn, q, 0, 200, 3); check('ch9 no-noise no failures n=' + nn + ' q=' + q, z.fail, 0);
    const e = M.eveLinear(z.K); ok('ch9 no-noise Eve solves n=' + nn + ' q=' + q, e && e.right);
  }
  // with noise Eve's elimination is wrong on the page's grid (η ≥ 1)
  for (const q of [97, 257, 3329]) for (const nn of [4, 8, 16, 32]) { const e = M.eveLinear(M.lweTrial(nn, 4 * nn, q, 1, 1, 3).K); ok('ch9 noisy Eve wrong n=' + nn + ' q=' + q, e && !e.right && e.wrongCoords > 0); }
  // the per-key prediction matches the simulation: a binomial z-score, no wider than 3.5σ, over the whole slider grid
  let worst = 0, cells = 0;
  for (const q of [97, 257, 3329]) for (let nn = 4; nn <= 32; nn += 4) for (const eta of [1, 4, 8, 12, 16, 20, 24]) {
    const r = M.lweTrial(nn, 4 * nn, q, eta, 2000, 3), p = M.lwePredictKey(r.K), sd = Math.sqrt(Math.max(p * (1 - p), 1e-4) / 2000);
    const zz = Math.abs(r.rate - p) / sd; worst = Math.max(worst, zz); cells++;
    if (zz > 3.5) check(`ch9 prediction n=${nn} q=${q} η=${eta}: measured ${r.rate} vs ${f(p, 4)}`, f(zz, 2), '≤ 3.5');
  }
  console.log(`LWE prediction vs simulation over ${cells} settings: worst |z| = ${f(worst, 2)}`);
  // decryption works for the decryption-correctness bound: |e·r| < q/4 → correct, always
  { const K = M.lweKeygen(8, 32, 97, 2, 5), r = M.rng(6); let bad = 0; for (let i = 0; i < 500; i++) { const bit = i & 1, c = M.lweEnc(K, bit, r), ec = ((c.noise % 97) + 97 + 48.5) % 97 - 48.5; if (Math.abs(ec) < 97 / 4 - 0.5 && M.lweDec(K, c) !== bit) bad++; } check('ch9 small noise always decrypts', bad, 0); }
  check('ch9 brute 8,97', f(M.lweBruteLog10(8, 97), 0), '16'); says('ch9.p4', '约 10<sup>16</sup> 种'); says('ch9.p4', 'n = 8、q = 97');
  // every say branch reachable: clean / some / many
  const br = new Set(); for (const q of [97, 257, 3329]) for (let nn = 4; nn <= 32; nn += 4) for (let eta = 1; eta <= 24; eta += 3) { const r = M.lweTrial(nn, 4 * nn, q, eta, 2000, 3); br.add(r.fail === 0 ? 'clean' : r.rate < 0.05 ? 'some' : 'many'); }
  check('ch9 LWE branches', [...br].sort().join(','), 'clean,many,some');
  says('ch9.limit', '最多 32'); check('ch9 lwN max', attr('lwN', 'max'), '32');
  // ML-KEM sizes (FIPS 203 Table 3 byte sizes)
  check('ch9 ML-KEM sizes', M.MLKEM.map(P => { const s = M.mlkemSizes(P); return s.ek + '/' + s.ct; }).join(' '), '800/768 1184/1088 1568/1568');
  says('ch9.p6', g(M.mlkemSizes(M.MLKEM[1]).ek)); says('ch9.p6', g(M.mlkemSizes(M.MLKEM[1]).ct)); says('ch9.p6', '32 字节');
  check('ch9 ML-KEM-768 dfp', M.MLKEM[1].dfpLog2, -164); says('ch9.say.some', '2<sup>−164</sup>');
  check('ch9 ML-KEM-768 dim', M.mlkemSizes(M.MLKEM[1]).dim, 768); says('ch9.limit', '768 维');
  says('ch9.p5', 'q = 3329'); check('ch9 ML-KEM q', M.mlkemSizes(M.MLKEM[0]).q, 3329);
  says('ch9.tcap', '384k + 32'); says('ch9.tcap', '32(k·d<sub>u</sub> + d<sub>v</sub>)');
}

/* ── ch10 frontier and figures of merit ── */
{
  const mon = d => { const [y, m] = d.split('-').map(Number); return `${y} 年 ${m} 月`; };
  for (const x of M.FRONTIER) { says('fx.' + x.id, mon(x.date)); ok('frontier group ' + x.id, ['std', 'deploy', 'attack', 'claim'].includes(x.group)); }
  check('frontier count', M.FRONTIER.length, 19);
  check('frontier groups', ['std', 'deploy', 'attack', 'claim'].map(gp => M.FRONTIER.filter(x => x.group === gp).length).join(','), '6,5,5,3');
  // every frontier item names its source in parentheses
  for (const x of M.FRONTIER) ok('fx.' + x.id + ' cites a source', /（[^（）]*(NIST|IETF|Cloudflare|Signal|OpenSSH|NCSC|IACR|arXiv|GRI|Cognition|Google|Apple)[^（）]*）$/.test(Z['fx.' + x.id]));
  says('fx.ir8547', '2030 年'); says('fx.ir8547', '2035 年'); says('fx.ir8547', 'ML-KEM-768');
  says('fx.tls', '约 70%'); says('fx.tls', '约 15%');
  says('fx.qrsa', '不到 100 万'); says('fx.qecc', '1,200'); says('fx.survey', '28%–49%'); says('fx.survey', '26 位');
  // merit table
  const rows = M.MERIT.map(M.meritRow);
  check('merit ML-KEM rows', rows.filter(r => r.mlkem != null).map(r => r.pk + '/' + r.ct).join(' '), '800/768 1184/1088 1568/1568');
  check('merit ML-DSA-44 sig', M.MERIT.find(r => r.id === 'mldsa44').sig, 2420); says('ch10.open2', g(2420));
  check('merit x25519 pk', M.MERIT.find(r => r.id === 'x25519').pk, 32); says('ch9.p6', 'X25519 的公钥只有 32 字节');
  ok('merit ML-KEM faster than X25519', M.MERIT.find(r => r.id === 'mlkem768').ops > M.MERIT.find(r => r.id === 'x25519').ops); says('ch10.merit.p', 'ML-KEM 反而比 X25519 算得快');
  const slh = M.MERIT.find(r => r.id === 'slhdsa128s'); ok('merit SLH-DSA biggest and slowest signer', rows.filter(r => r.kind === 'sig').every(r => r.sig <= slh.sig || r.id === 'slhdsa128f') && slh.sign === Math.max(...rows.filter(r => r.kind === 'sig').map(r => r.sign)));
  for (const r of M.MERIT) ok('merit label ' + r.id, Z['merit.' + r.id]);
}

/* ── ch11 ── */
{
  check('ch11 1000× ≈ 10 bits', f(Math.log2(1000), 1), '10.0'); says('ch11.q2', '1000 倍'); says('ch11.q2', '约 10 位'); says('ch11.q2', '118 位');
}

/* ── copy integrity: every key used exists, placeholders are filled, no stray Chinese in code ── */
{
  const used = new Set();
  for (const m of HTML.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) used.add(m[1]);
  for (const m of APP.matchAll(/\bt\('([\w.]+)'/g)) used.add(m[1]);
  // dynamic keys
  for (const x of M.FRONTIER) used.add('fx.' + x.id);
  for (const r of M.MERIT) used.add('merit.' + r.id);
  for (const r of M.RECORDS) used.add('ch7.rec.' + r.id);
  for (const k of ['none', 'name', 'key', 'resign', 'selfroot']) used.add('ch6.say.' + k);
  for (const k of ['root', 'inter', 'site']) used.add('ch6.c.' + k);
  for (const k of ['ok', 'odd', 'minus1', 'lucky']) used.add('ch8.say.' + k);
  for (const k of ['start', 'sq', 'mul']) used.add('ch2.op.' + k);
  for (const k of used) if (!k.endsWith('.')) ok('copy has ' + k, Z[k] != null);
  // placeholders each sentence uses must be ones app.js passes: check the templates against the var lists in app.js
  const passes = {
    'ch1.say.sym': ['n', 'pairs', 'join'], 'ch1.say.pub': ['n', 'pairs', 'join'],
    'ch2.say.trace': ['x', 'L', 'sq', 'mul', 'tot', 'naive', 'v', 'p'],
    'ch2.say.running': ['bits', 'p', 'q', 'fwd', 'bsgs', 'ms', 'brute', 'ratio', 'ratioB', 'rate'], 'ch2.say.done': ['bits', 'p', 'q', 'fwd', 'bsgs', 'ms', 'brute', 'ratio', 'ratioB', 'rate'], 'ch2.say.reduce': ['bits', 'p', 'q', 'fwd', 'bsgs', 'ms', 'brute', 'ratio', 'ratioB', 'rate'],
    'ch3.say.ok': ['s', 'A', 'B', 'a', 'ka', 'kb', 'q', 'p', 'steps', 'ea'], 'ch3.say.eve': ['s', 'A', 'B', 'a', 'ka', 'kb', 'q', 'p', 'steps', 'ea'], 'ch3.say.mal': ['s', 'A', 'B', 'a', 'ka', 'kb', 'q', 'p', 'steps', 'ea'], 'ch3.say.maleve': ['s', 'A', 'B', 'a', 'ka', 'kb', 'q', 'p', 'steps', 'ea'],
    'ch4.say.ok': ['p', 'q', 'n', 'phi', 'e', 'd', 'm', 'c', 'ct', 'dec', 'm2', 'tries', 'digits'], 'ch4.say.tamper': ['p', 'q', 'n', 'phi', 'e', 'd', 'm', 'c', 'ct', 'dec', 'm2', 'tries', 'digits'], 'ch4.say.tamperwrap': ['p', 'q', 'n', 'phi', 'e', 'd', 'm', 'c', 'ct', 'dec', 'm2', 'tries', 'digits'], 'ch4.say.factor': ['p', 'q', 'n', 'phi', 'e', 'd', 'm', 'c', 'ct', 'dec', 'm2', 'tries', 'digits'], 'ch4.say.both': ['p', 'q', 'n', 'phi', 'e', 'd', 'm', 'c', 'ct', 'dec', 'm2', 'tries', 'digits'],
    'ch4.say.cube': ['bits', 'digits', 'mbits', 'msg', 'cubebits', 'pbits'], 'ch4.say.pad': ['bits', 'digits', 'mbits', 'msg', 'cubebits', 'pbits'],
    'ch5.say.add': ['R', 's'], 'ch5.say.double': ['R', 's'], 'ch5.say.inf': ['R', 's'],
    'ch5.say.cyclic': ['p', 'N', 'ord', 'Gx', 'Gy', 'k', 'ops', 'lo', 'hi', 'x', 'y'], 'ch5.say.sub': ['p', 'N', 'ord', 'Gx', 'Gy', 'k', 'ops', 'lo', 'hi', 'x', 'y'], 'ch5.say.ord': ['p', 'N', 'ord', 'Gx', 'Gy', 'k', 'ops', 'lo', 'hi', 'x', 'y'],
    'ch7.say.sym': ['k', 'sym', 'ecc', 'rsa', 'gro', 'shor'], 'ch7.say.symecc': ['k', 'sym', 'ecc', 'rsa', 'gro', 'shor'], 'ch7.say.ecc': ['k', 'sym', 'ecc', 'rsa', 'gro', 'shor'], 'ch7.say.both': ['k', 'sym', 'ecc', 'rsa', 'gro', 'shor'], 'ch7.say.rsa': ['k', 'sym', 'ecc', 'rsa', 'gro', 'shor'], 'ch7.say.qpk': ['k', 'sym', 'ecc', 'rsa', 'gro', 'shor'], 'ch7.say.qsym': ['k', 'sym', 'ecc', 'rsa', 'gro', 'shor'],
    'ch8.say.ok': ['a', 'n', 'r', 'h', 'y', 'f1', 'f2', 'share', 'ok', 'tot'], 'ch8.say.odd': ['a', 'n', 'r', 'h', 'y', 'f1', 'f2', 'share', 'ok', 'tot'], 'ch8.say.minus1': ['a', 'n', 'r', 'h', 'y', 'f1', 'f2', 'share', 'ok', 'tot'], 'ch8.say.lucky': ['a', 'n', 'r', 'h', 'y', 'f1', 'f2', 'share', 'ok', 'tot'],
    'ch8.say.safe': ['x', 'y', 'z', 'ex', 'sl'], 'ch8.say.edge': ['x', 'y', 'z', 'ex', 'sl'], 'ch8.say.exposed': ['x', 'y', 'z', 'ex', 'sl'],
    'ch9.say.split': ['dg', 'db', 'd', 'x', 'rb', 'rg', 'had', 'hg'], 'ch9.say.both': ['dg', 'db', 'd', 'x', 'rb', 'rg', 'had', 'hg'], 'ch9.say.neither': ['dg', 'db', 'd', 'x', 'rb', 'rg', 'had', 'hg'], 'ch9.say.badonly': ['dg', 'db', 'd', 'x', 'rb', 'rg', 'had', 'hg'],
    'ch9.say.zero': [], 'ch9.say.clean': ['fail', 'tr', 'pct', 'pred', 'sd', 'mu', 'q4', 'n', 'm', 'q', 'brute', 'w'], 'ch9.say.some': ['fail', 'tr', 'pct', 'pred', 'sd', 'mu', 'q4', 'n', 'm', 'q', 'brute', 'w'], 'ch9.say.many': ['fail', 'tr', 'pct', 'pred', 'sd', 'mu', 'q4', 'n', 'm', 'q', 'brute', 'w'], 'ch9.say.evebad': ['fail', 'tr', 'pct', 'pred', 'sd', 'mu', 'q4', 'n', 'm', 'q', 'brute', 'w']
  };
  for (const k in passes) { const used2 = [...(Z[k] || '').matchAll(/\{(\w+)\}/g)].map(m => m[1]); for (const u of used2) ok(`placeholder {${u}} in ${k} is passed by app.js`, passes[k].includes(u)); }
  // no Chinese in code files except the 中 toggle and the static <title>/<meta description>
  const han = /[㐀-鿿＀-￯　-〿]/;
  check('no Chinese in models.js', han.test(fs.readFileSync(path.join(DIR, 'models.js'), 'utf8')), false);
  check('no Chinese in app.js', han.test(APP), false);
  const stripped = HTML.replace(/<title>[^<]*<\/title>/, '').replace(/<meta name="description" content="[^"]*">/, '').replace(/>中</g, '><');
  check('no other Chinese in index.html', han.test(stripped), false);
  ok('no lesson-shell.js', !HTML.includes('lesson-shell')); ok('copy.en.js loaded optionally', /copy\.en\.js"[^>]*onerror/.test(HTML));
  ok('no provenance label', !HTML.includes('data-source-revision'));
  ok('safety warning shown', Z['hero.warn'].includes('绝不能用来保护任何东西') && Z['ch11.warn'].includes('不要用它保护任何东西'));
  // no "left/right figure" phrasing
  for (const k in Z) { if (/左图|右图|左边的图|右边的图/.test(Z[k])) check('no left/right figure in ' + k, true, false); }
  // links point at real pages
  for (const k in Z) for (const m of Z[k].matchAll(/href="([^"#]+)"/g)) { const p = path.join(DIR, m[1]); ok(`link ${m[1]} in ${k} exists`, m[1].startsWith('http') || fs.existsSync(path.join(p, 'index.html')) || m[1] === '../../../'); }
}

console.log(`${n - fails}/${n} checks passed`);
if (fails) process.exit(1);
