'use strict';
// Pins every number the essay's prose states to the page's own models and checks that copy.zh.js still says exactly
// that number; checks the codes and coders for correctness (round trips, distances, budgets); and checks the seeded
// Monte Carlo against theory with tolerances set by the number of trials (4 standard errors).
// Run: node tech/networks/how-much-a-wire-can-carry/tests/models.cjs      (about 40 s: it re-runs the page's BER curves)
const path = require('path'), fs = require('fs'), vm = require('vm');
const D = path.join(__dirname, '..');
const M = require(path.join(D, 'models.js')), CORPUS = require(path.join(D, 'corpus.js'));
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(D, 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;

let n = 0, fails = 0;
function check(name, got, want) { n++; if (got !== want) { fails++; console.error(`FAIL ${name}: model gives ${got}, expected ${want}`); } }
function near(name, got, want, tol) { n++; if (!(Math.abs(got - want) <= tol)) { fails++; console.error(`FAIL ${name}: ${got} vs ${want} (tolerance ${tol})`); } }
function says(key, phrase) { n++; const s = typeof Z[key] === 'string' ? Z[key] : JSON.stringify(Z[key]); if (!s || !s.includes(phrase)) { fails++; console.error(`FAIL prose ${key} should contain "${phrase}"`); } }
const f = (x, d) => x.toFixed(d);
const SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };
const sci = (x, d = 1) => { let e = Math.floor(Math.log10(Math.abs(x))), m = +(x / Math.pow(10, e)).toFixed(d); if (m >= 10) { m /= 10; e++; } return m.toFixed(d) + '×10' + String(e).split('').map(c => SUP[c]).join(''); };
const t0 = Date.now();

/* ── ch1 entropy, n-grams, the guessing game ── */
const { train, test } = M.corpusSplit(CORPUS);
{
  check('log2 27', f(Math.log2(27), 2), '4.75'); says('ch1.p1', 'log₂ 27 ≈ 4.75'); says('ch1.ng.leg.flat', 'log₂ 27 = 4.75');
  check('corpus 13.4 万 letters', f(CORPUS.length / 1e4, 1), '13.4'); says('ch1.limit', '约 13.4 万个字母');
  check('corpus alphabet', /^[a-z ]+$/.test(CORPUS), true);
  check('training share 85%', f(train.length / CORPUS.length, 2), '0.85'); says('ch1.ng.how', '前 85%'); says('ch1.model.how', '前 85%');
  // the one-pass ladder equals separate models of each order
  const m6 = M.trainNgram(train, 6), all = M.runGen(M.crossEntropyAllGen(m6, test));
  for (const k of [0, 2, 4, 6]) check('cross-entropy one pass = order ' + k, f(all[k], 9), f(M.crossEntropy(M.trainNgram(train, k), test), 9));
  let best = 0; all.forEach((x, k) => { if (x < all[best]) best = k; });
  check('best order, full data', best, 4); check('best cross-entropy', f(all[4], 2), '2.00'); says('ch1.p4', '看前 4 个字母）在没见过的文本上是 2.00 比特每字母');
  check('order 6 worse', all[6] > all[4], true);
  const tr10 = train.slice(0, Math.round(train.length * 0.1)), a10 = M.runGen(M.crossEntropyAllGen(M.trainNgram(tr10, 6), test));
  let b10 = 0; a10.forEach((x, k) => { if (x < a10[b10]) b10 = k; });
  check('best order, 10% data', b10, 3); check('best cross-entropy, 10%', f(a10[3], 2), '2.67'); says('ch1.p4', '最好的是看前 3 个字母，2.67 比特');
  // the slider's every training size: the best order is never the highest one tried (so the page has no "top" sentence)
  { let worst = 0; for (let p = 1; p <= 100; p++) { const tr = train.slice(0, Math.round(train.length * p / 100)), x = M.runGen(M.crossEntropyAllGen(M.trainNgram(tr, 6), test)); let bk = 0; x.forEach((v, k) => { if (v < x[bk]) bk = k; }); worst = Math.max(worst, bk); } check('best order < 6 at every slider size', worst < 6, true); }
  // in-sample conditional entropy is lower than held-out cross-entropy (the reason for the cyan bars)
  for (const k of [2, 4, 6]) check('plug-in below held-out, order ' + k, M.pluginConditional(train, k) < all[k], true);
  // Shannon's bounds on a toy rank list: all first-try gives 0 bits; lower ≤ upper always
  const sb = M.shannonBounds([1, 1, 1, 1]); check('bounds all first try', sb.upper + sb.lower, 0);
  const v4 = M.ngramView(m6, 4), pre = test.slice(0, 40), ps = test.slice(40, 120), rk = M.machineRanks(v4, ps, pre), b = M.shannonBounds(rk);
  check('lower ≤ upper', b.lower <= b.upper, true); check('ranks in 1..27', rk.every(r => r >= 1 && r <= 27), true);
  check('view of order 4 = order-4 model', M.ngramView(m6, 4).dist('alic').join(), M.trainNgram(train, 4).dist('alic').join());
  says('ch1.p3', '0.6 到 1.3 比特每字母'); // Shannon 1951, Fig. 4 at N = 100 (a cited value, not a model output)
}

/* ── ch2 Huffman, arithmetic coding, the coin ── */
{
  const def = Array.from(CORPUS.slice(0, CORPUS.indexOf(' ', 300))), st = M.textStats(def), ar = M.arithStatic(def);
  check('default text length', st.n, 306); says('ch2.p3', '开头的 306 个字母');
  check('H', f(st.H, 3), '3.955'); check('Huffman', f(st.huffAvg, 3), '4.000'); check('gap', f(st.huffAvg - st.H, 3), '0.045');
  says('ch2.p3', '熵是 3.955 比特/符号，哈夫曼平均 4.000，只多 0.045');
  const sp = st.symbols.indexOf(' '), tt = st.symbols.indexOf('t');
  check('space ideal', f(-Math.log2(st.counts[sp] / st.n), 2), '2.35'); check('space Huffman', st.huffLengths[sp], 2); says('ch2.p3', '空格的理想码长是 2.35 位，它给了 2 位');
  check('t ideal', f(-Math.log2(st.counts[tt] / st.n), 2), '3.45'); check('t Huffman', st.huffLengths[tt], 4); says('ch2.p3', 't 的理想码长是 3.45 位，它只能给 4 位');
  check('H ≤ L < H + 1', st.H <= st.huffAvg && st.huffAvg < st.H + 1, true);
  check('arith round trip', ar.ok, true);
  // prefix-free and Kraft equality (Huffman codes are complete)
  const codes = st.huffCodes; let kraft = 0, prefix = false;
  codes.forEach((c, i) => { kraft += Math.pow(2, -c.length); codes.forEach((d, j) => { if (i !== j && d.startsWith(c)) prefix = true; }); });
  check('Huffman prefix-free', prefix, false); check('Kraft sum', kraft, 1);
  // the two-queue Huffman matches the textbook "re-sort every step" construction on random weights
  const r = M.rng(9);
  for (let tr = 0; tr < 20; tr++) {
    const w = Array.from({ length: 2 + r.int(40) }, () => 1 + r.int(30)), live = w.map((x, i) => ({ w: x, id: i, leaf: i })); let id = w.length; const L = new Array(w.length);
    while (live.length > 1) { live.sort((a, b) => a.w - b.w || a.id - b.id); const a = live.shift(), b2 = live.shift(); live.push({ w: a.w + b2.w, id: id++, kids: [a, b2] }); }
    (function walk(nd, d) { if (nd.kids) { walk(nd.kids[0], d + 1); walk(nd.kids[1], d + 1); } else L[nd.leaf] = d; })(live[0], 0);
    check('Huffman lengths = reference #' + tr, M.huffman(w).lengths.join(), L.join());
  }
  // a Chinese sentence round-trips too (the box takes any text)
  check('arith round trip, Chinese', M.arithStatic(Array.from('信息论的核心问题是：一根线到底能传多少信息？')).ok, true);
  const H1 = M.H2(0.1), ca = M.coinArith(0.1, 2000, M.SEEDS.coin);
  check('coin H(0.1)', f(H1, 3), '0.469'); check('coin Huffman b=1', f(M.coinHuffman(0.1, 1), 3), '1.000'); check('coin arith', f(ca.perSymbol, 3), '0.468');
  check('coin bits', ca.bits, 936); check('coin ones < 200', ca.ones < 200, true); check('coin round trip', ca.ok, true);
  says('ch2.p4', 'p = 0.1 时熵是 0.469，一次一码的哈夫曼是 1.000，算术编码实测 0.468：2000 次抛掷编成了 936 位');
  says('ch2.coin.how', '2000 次');
  // block Huffman approaches the entropy
  check('coin b=10 within 0.01 of H', M.coinHuffman(0.1, 10) - H1 < 0.01, true);
}

/* ── ch3 adaptive coding, counting ── */
{
  const T = test.slice(0, 10000), R = M.randomLetters(10000, M.SEEDS.randomText);
  const c3 = M.adaptiveCode(T, 3), w3 = M.adaptiveCode(T, 3, train), w4 = M.adaptiveCode(T, 4, train), w5 = M.adaptiveCode(T, 5, train);
  check('k3 cold', f(c3.bpc, 3), '2.599'); check('k3 warm', f(w3.bpc, 3), '2.007'); says('ch3.p3', '从零开始是 2.599 比特/字母，预训练后降到 2.007');
  check('k4 warm ≈ 1.84', f(w4.bpc, 2), '1.84'); check('k5 warm ≈ 1.84', f(w5.bpc, 2), '1.84'); says('ch3.p3', '预训练后约 1.84');
  for (const r of [c3, w3, w4, w5]) check('adaptive round trip', r.ok, true);
  const r0 = M.adaptiveCode(R, 0); check('random k0', f(r0.bpc, 3), '4.766'); says('ch3.p3', '0 阶编出 4.766');
  const rw = [3, 4, 5].map(k => M.adaptiveCode(R, k, train).bpc);
  check('random warm > 8 bits for k ≥ 3', rw.every(x => x > 8), true); says('ch3.p3', '最多要 8 比特以上');
  check('random cold grows with k', M.adaptiveCode(R, 2).bpc > r0.bpc, true);
  says('ch3.model.how', '10,000 个字母');
  check('counting k=2 ≤ half', M.counting(16, 2).frac <= 0.5, true); check('counting k=8 = 1/128', f(M.counting(64, 8).frac, 7), f(1 / 128, 7));
  says('ch3.p4', '省 2 位最多一半，省 8 位最多 1/128');
  check('counting k > n', M.counting(4, 6).shorter, 0);
}

/* ── ch4 BSC ── */
{
  check('C(0.1)', f(M.bsc.capacity(0.1), 3), '0.531'); says('ch4.p3', '容量却只剩 0.531'); says('ch6.p2', '低于 0.531 比特/次');
  check('I max at q = 0.5', f(M.bsc.mutualInfo(0.1, 0.5), 9), f(M.bsc.capacity(0.1), 9));
  check('I(0.5, q) = 0', M.bsc.mutualInfo(0.5, 0.3), 0);
  const s = M.bsc.simulate(200000, 0.1, 0.5, 3); near('empirical I → C', s.empiricalI, M.bsc.capacity(0.1), 0.01);
}

/* ── ch5 Shannon–Hartley, Voyager ── */
{
  const w = M.awgn.whatIf(20e6, M.undB(20));
  check('20 MHz 20 dB', f(w.base / 1e6, 2), '133.16'); check('power ×2', f(w.power2 / 1e6, 2), '153.02'); check('band ×2', f(w.band2 / 1e6, 2), '226.90');
  says('ch5.p3', '容量 133.16 Mbit/s。功率翻倍只到 153.02 Mbit/s'); says('ch5.p3', '却到 226.90 Mbit/s');
  check('SNR after halving', f(20 - M.dB(2), 0), '17'); says('ch5.p3', '信噪比降到 17 dB');
  const lo = M.awgn.whatIf(20e6, M.undB(-10)); check('-10 dB base', f(lo.base / 1e6, 2), '2.75'); check('-10 dB band ×2', f(lo.band2 / 1e6, 2), '2.82'); says('ch5.p3', '从 2.75 到 2.82 Mbit/s');
  // the page's bandwidth slider has 20 MHz exactly at its default index
  const BWS = []; for (let e = 3; e <= 8; e++) for (const m of [1, 2, 5]) BWS.push(m * Math.pow(10, e)); BWS.push(1e9);
  check('bandwidth list default', BWS[13], 2e7);
  // power-limited regime: wide-band limit = P/(N0 ln2)
  near('B → ∞ (relative)', M.awgn.capacity(1e14, 2e9 / 1e14) / M.awgn.powerLimited(2e9), 1, 1e-4);
  const V = M.VOYAGER, v96 = M.voyagerLink(V.d1996);
  check('1996 range in AU', f(V.d1996 / M.AU, 2), '48.62'); says('ch5.p5', '48.62 天文单位');
  check('Pr/N0 1996', f(v96.prn0, 2), '39.86'); says('ch5.p5', '39.86 dB·Hz');
  check('limit 1996', f(v96.cInf / 1e3, 2), '13.97'); says('ch5.p5', '约 13.97 kbit/s');
  says('ch5.p5', '13.3 dB 的余量'); check('margin constant', V.margin160, 13.3);
  const ld = 299792458 * 86400 / M.AU; check('one light-day in AU', f(ld, 0), '173'); says('ch5.p5', '173 天文单位');
  check('limit at 173 AU', f(M.voyagerLink(173 * M.AU).cInf / 1e3, 2), '1.10'); says('ch5.p5', '约 1.10 kbit/s');
  check('40.9 dBm in W', f(Math.pow(10, V.ptdBm / 10) / 1000, 1), '12.3'); says('ch5.vy.how', '40.9 dBm（约 12.3 W）');
  says('ch5.vy.how', '48.2 dBi'); says('ch5.vy.how', '8415 MHz'); says('ch5.vy.how', '74.0 dBi'); says('ch5.vy.how', '21.1 K');
  check('Voyager rates', V.rates.join(), '160,1400,7200'); says('ch5.vy.leg.rates', '160 bit/s、1.4 kbit/s、7.2 kbit/s');
}

/* ── ch6 repetition, Eb/N0 ── */
{
  check('rep3', f(M.repetition.errExact(3, 0.1) * 100, 1), '2.8'); says('ch6.p1', '从 10% 降到 2.8%');
  check('rep25', sci(M.repetition.errExact(25, 0.1)), '1.6×10⁻⁷'); says('ch6.p1', '降到约 1.6×10⁻⁷');
  for (const nn of [3, 7, 15]) { // seeded simulation agrees with the binomial tail within 4 standard errors
    const p = M.repetition.errExact(nn, 0.1), s = M.repetition.simulate(nn, 0.1, 20000, M.SEEDS.repetition + nn);
    near('rep sim n=' + nn, s, p, 4 * Math.sqrt(p * (1 - p) / 20000));
  }
  says('ch6.model.how', '20,000 次模拟');
  check('ln 2 in dB', f(M.ebn0.limitDb(), 2), '-1.59'); says('ch6.eq', '−1.59 dB'); says('ch6.eq', '0.693');
  check('η=2 floor', f(M.dB(M.ebn0.min(2)), 2), '1.76'); check('QPSK 1e-5', f(M.ebn0.ebn0ForBer(4, 1e-5), 2), '9.59');
  const gap = M.ebn0.ebn0ForBer(4, 1e-5) - M.dB(M.ebn0.min(2));
  check('gap', f(gap, 2), '7.83'); check('gap ≈ 6× power', f(M.undB(gap), 0), '6'); says('ch6.p5', 'η = 2 时界是 1.76 dB，而不编码的 QPSK 要 9.59 dB 才能做到 10⁻⁵，差 7.83 dB，相当于发射功率差六倍');
  check('QPSK BER = BPSK BER', M.ebn0.qamBer(4, 3), M.ebn0.bpskBer(3));
}

/* ── ch7 Hamming ── */
{
  const H = M.hamming;
  check('dmin', H.minDistance(), 3); says('ch7.p3', 'd = 3');
  check('perfect code', 16 * 8, Math.pow(2, 7)); says('ch7.p3', '16 × 8 = 128');
  for (let x = 0; x < 16; x++) { const d = [(x >> 3) & 1, (x >> 2) & 1, (x >> 1) & 1, x & 1], c = H.encode(d); check('codeword syndrome 0', H.syndrome(c), 0); for (let j = 0; j < 7; j++) { const r = c.slice(); r[j] ^= 1; const o = H.decode(r); check('single flip ' + j, o.s === j + 1 && o.d.join() === d.join(), true); } }
  check('bit error p=0.01', sci(H.bitError(0.01)), '8.7×10⁻⁴'); says('ch7.p3', '约 8.7×10⁻⁴');
}

/* ── ch8 GF(16), RS(15,9) ── */
{
  const gf = M.gf;
  check('7 = α^10', gf.log[7], 10); check('9 = α^14', gf.log[9], 14); check('α^9 = A', gf.exp[9], 10); check('7 × 9', gf.mul(7, 9), 10);
  says('ch8.p3', '7 = α¹⁰，9 = α¹⁴，指数相加得 24，模 15 余 9，而 α⁹ = A');
  check('field: a · a⁻¹ = 1', [...Array(15)].every((_, i) => gf.mul(i + 1, gf.inv(i + 1)) === 1), true);
  check('α has order 15', new Set(gf.exp.slice(0, 15)).size, 15);
  const r = M.rng(4); let okIn = true, badOut = 0, outTrials = 0;
  for (let tr = 0; tr < 400; tr++) {
    const msg = Array.from({ length: 9 }, () => r.int(16)), cw = M.RS.encode(msg), recv = cw.slice(), pos = [...Array(15).keys()];
    for (let i = 14; i > 0; i--) { const j = r.int(i + 1); [pos[i], pos[j]] = [pos[j], pos[i]]; }
    const e = r.int(5), s = r.int(8); let k = 0;
    for (let i = 0; i < e; i++) recv[pos[k++]] ^= 1 + r.int(15);
    for (let i = 0; i < s; i++) recv[pos[k++]] = null;
    const dec = M.RS.decode(recv), right = dec.ok && dec.msg.join() === msg.join();
    if (2 * e + s <= 6) { if (!right) okIn = false; } else { outTrials++; if (right) badOut++; }
  }
  check('RS decodes every 2e + s ≤ 6', okIn, true); check('RS never right beyond the budget', badOut, 0);
  says('ch8.read.budget', '上限 6'); says('ch8.say.clean', '2e + s ≤ 6');
}

/* ── ch9 codes, BP, and the BER curves ── */
{
  // encoders produce codewords; noiseless decoding returns the data
  for (const k of [16, 128, 512, 2048]) {
    const code = M.ldpcBuild(k), r = M.rng(k), u = new Uint8Array(k).map(() => r() < 0.5 ? 1 : 0), c = M.ldpcEncode(code, u);
    check('LDPC codeword k=' + k, M.ldpcCheck(code, c), true);
    check('LDPC no 4-cycles k=' + k, (() => { const seen = new Set(); for (let j = 0; j < code.n; j++) { const cs = []; code.chk.forEach((vs, ci) => { if (vs.includes(j)) cs.push(ci); }); for (let a = 0; a < cs.length; a++) for (let b = a + 1; b < cs.length; b++) { const key = cs[a] * code.m + cs[b]; if (seen.has(key)) return false; seen.add(key); } } return true; })(), true);
  }
  const u = Array.from({ length: 40 }, (_, i) => (i * 7) % 3 === 0 ? 1 : 0), cc = M.conv.encode(u);
  check('Viterbi noiseless', Array.from(M.conv.viterbi(cc.map(b => b ? -1 : 1), 40)).join(), u.join());
  check('BI-AWGN limit, rate 1/2', f(M.biawgnLimitDb(0.5), 2), '0.19'); says('ch9.model.how', '0.19 dB');
  check('BI-AWGN capacity → 1 as σ → 0', M.biawgnCapacity(0.2) > 0.99999 && M.biawgnCapacity(0.2) <= 1, true); near('BI-AWGN capacity at σ = 1 (Richardson–Urbanke: 0.4859)', M.biawgnCapacity(1), 0.4859, 5e-4);
  // the small BP demo at the page's default frame converges in a few iterations
  {
    const code = M.ldpcBuild(16), r = M.rng(M.SEEDS.bpFrame), s = M.ber.sigma(2, code.rate), uu = new Uint8Array(16); for (let i = 0; i < 16; i++) uu[i] = r() < 0.5 ? 1 : 0;
    const c = M.ldpcEncode(code, uu), llr = new Float64Array(code.n); for (let v = 0; v < code.n; v++) { const y = (c[v] ? -1 : 1) + s * r.gauss(); llr[v] = 2 * y / (s * s); }
    const d = M.ldpcDecode(code, llr, 50, c, true); check('BP demo converges', d.ok && d.trace[d.trace.length - 1] === 0 && d.iters > 2 && d.iters < 10, true);
  }
  // statistics: uncoded simulation against Q(√(2 Eb/N0)) within 4 standard errors of a binomial count
  const P = M.berPlan, unc = P.runAll('uncoded');
  for (const r of unc) { const p = M.ebn0.bpskBer(M.undB(r.ebn0dB)); near('uncoded sim at ' + r.ebn0dB + ' dB', r.ber, p, 4 * Math.sqrt(p * (1 - p) / r.bits)); }
  check('uncoded 1e-4 crossing', f(M.ebn0.bpskForBer(1e-4), 2), '8.40'); says('ch9.p4', '不编码的 BPSK 要到 8.40 dB');
  // convolutional code: below the union bound Σ B_d Q(√(2 d R Eb/N0)) (d = 10…18 of the (171,133) code), allowing 4σ
  const conv = P.runAll('conv'), Bd = [[10, 36], [12, 211], [14, 1404], [16, 11633], [18, 77433]];
  for (const r of conv.filter(r => r.ebn0dB >= 3 && r.errs)) {
    const ub = Bd.reduce((s, [d, b]) => s + b * M.Q(Math.sqrt(2 * d * 0.5 * M.undB(r.ebn0dB))), 0);
    check('conv ≤ union bound at ' + r.ebn0dB + ' dB', r.ber <= ub + 4 * Math.sqrt(ub / r.bits) * 8, true); // errors come in bursts of up to ~8 bits
  }
  const c3 = conv.find(r => r.ebn0dB === 3); check('conv 3 dB', sci(c3.ber), '3.2×10⁻⁴'); says('ch9.p4', '卷积码在 3 dB 处约 3.2×10⁻⁴');
  check('conv crossing', f(P.cross(conv), 2), '3.42'); says('ch9.p4', '到 10⁻⁴ 要 3.42 dB');
  // LDPC, n = 1024, as the page runs it
  const lim = M.biawgnLimitDb(0.5), code = M.ldpcBuild(512), ld = P.runAll('ldpc', code);
  const at = x => ld.find(r => r.ebn0dB === x);
  check('LDPC 2 dB', sci(at(2).ber), '1.5×10⁻³'); check('LDPC 2.5 dB', sci(at(2.5).ber), '9.3×10⁻⁵'); check('LDPC 1.75 dB', sci(at(1.75).ber), '3.5×10⁻³');
  says('ch9.p4', '在 2 dB 处的误码率约 1.5×10⁻³，在 2.5 dB 处约 9.3×10⁻⁵'); says('ch9.p4', '码长 1024 在同一处是 3.5×10⁻³');
  const lx = P.cross(ld); check('LDPC crossing', f(lx, 2), '2.49'); check('LDPC gap', f(lx - lim, 2), '2.30'); says('ch9.p4', '大约要 2.49 dB，离极限 2.30 dB');
  // two independent seeds agree on the frame error rate at 2 dB (pooled binomial, 4σ)
  { const a = at(2), alt = M.ber.makeRun('ldpc', 2, 9001, { code, maxFE: 40, maxFrames: 2000 }); while (!alt.done) M.ber.stepRun(alt, 8); const b = M.ber.result(alt);
    const p = (a.fe + b.fe) / (a.frames + b.frames); near('LDPC FER, two seeds', a.fe / a.frames, b.fe / b.frames, 4 * Math.sqrt(p * (1 - p) * (1 / a.frames + 1 / b.frames))); }
  // n = 4096 at 1.75 dB (one point, the page's seed for it)
  { const c2 = M.ldpcBuild(2048), i = P.PTS.ldpc.indexOf(1.75), run = P.makeRun('ldpc', i, c2); while (!run.done) M.ber.stepRun(run, 4); const r = M.ber.result(run);
    check('LDPC n=4096 1.75 dB', sci(r.ber), '3.0×10⁻⁴'); says('ch9.p4', '码长 4096 时，1.75 dB 处就降到约 3.0×10⁻⁴'); }
  // at most 5 iterations the waterfall moves right: no crossing by 3 dB
  { const i = P.PTS.ldpc.indexOf(3), run = P.makeRun('ldpc', i, code, 5); while (!run.done) M.ber.stepRun(run, 8); check('5 iterations: 3 dB still above 1e-4', M.ber.result(run).ber > 1e-4, true); }
  says('ch9.p3', '攒够 40 个出错的帧，或者跑满 100 万个比特'); check('plan', P.MAXFE + ':' + P.MAXBITS, '40:1000000');
  // literature numbers used in ch9 and ch13
  check('Turbo gap', f(0.7 - lim, 1), '0.5'); says('ch9.p5', '离这条极限约 0.5 dB'); says('ch9.p5', '0.0045 dB'); says('ch9.p5', '0.04 dB');
  globalThis.__ber = { lx, cx: P.cross(conv) };
}

/* ── ch10 polar ── */
{
  check('polar N=1024', f(M.polarStats(0.5, 10).good * 100, 1), '37.3'); says('ch10.p3', '37.3% 的子信道已经几乎完美');
  check('polar N=2^20', f(M.polarStats(0.5, 20).good * 100, 1), '48.1'); says('ch10.p3', '是 48.1%');
  for (const e of [0.2, 0.5, 0.8]) near('capacity conserved ε=' + e, M.polarStats(e, 12).meanZ, e, 1e-12);
}

/* ── ch11 QAM, AMC ── */
{
  const need = [4, 64, 1024, 4096].map(m => f(M.qam.snrFor(m, 1e-3), 1));
  check('QAM need', need.join(), '10.3,24.0,36.1,42.2'); says('ch11.p3', 'QPSK（4 个点）要 10.3 dB，64-QAM 要 24.0 dB，1024-QAM 要 36.1 dB，4096-QAM 要 42.2 dB');
  check('EVM -38 dB as power ratio', Math.floor(M.undB(38) / 1000), 6); says('ch11.p3', '6000 多倍'); check('Wi-Fi 7 EVM', M.wifi7.evmDb, -38);
  for (const m of [16, 256]) { const snr = M.qam.snrFor(m, 1e-2), s = M.qam.simulate(m, snr, 20000, 3), p = M.qam.serExact(m, M.undB(snr)); near('QAM sim M=' + m, s.ser, p, 4 * Math.sqrt(p * (1 - p) / 20000)); }
  says('ch11.model.how', '2000 个符号');
  const a = M.amc.run(20, 3, 4, 2, M.SEEDS.amc, true), b = M.amc.run(20, 30, 4, 2, M.SEEDS.amc, true);
  check('AMC 3 km/h', f(a.throughput, 2), '4.25'); check('Shannon avg', f(a.shannon, 2), '5.77'); check('AMC 30 km/h', f(b.throughput, 2), '2.61');
  says('ch11.p4', '吞吐是 4.25 bit/s/Hz，香农上限的平均值是 5.77'); says('ch11.p4', '吞吐跌到 2.61');
  check('report delay 4 slots = 2 ms', 4 * 0.5, 2); says('ch11.p4', '报告晚 2 毫秒');
  near('OLLA holds BLER at 10%', a.bler, 0.1, 0.02); near('OLLA at 30 km/h', b.bler, 0.1, 0.02);
  check('CQI 15', M.CQI4[14].eff, 9.2578); says('ch11.p4', '9.2578 bit/s/Hz');
  check('CQI 15 Shannon SNR', f(M.frontier.minSnrDb(9.2578), 1), '27.9'); says('ch11.p4', '27.9 dB'); says('frontier', '27.9 dB');
  check('CQI efficiencies = log2(M)·r/1024', M.CQI4.every(c => Math.abs(Math.log2(c.mod) * c.r / 1024 - c.eff) < 6e-4), true);
}

/* ── ch12 MIMO ── */
{
  const s44 = M.mimo.gainSet(4, 4, 200, M.SEEDS.mimo), s11 = M.mimo.gainSet(1, 1, 200, M.SEEDS.mimo), C = (s, nt, x) => M.mimo.capOfSet(s, nt, x);
  check('4x4 20 dB', f(C(s44, 4, 20), 2), '21.98'); check('1x1 20 dB', f(C(s11, 1, 20), 2), '5.86'); check('ratio', f(C(s44, 4, 20) / C(s11, 1, 20), 2), '3.75');
  says('ch12.p3', '平均容量 21.98 bit/s/Hz，一发一收是 5.86，约 3.75 倍');
  check('4x4 slope 20→23', f(C(s44, 4, 23) - C(s44, 4, 20), 2), '3.72'); check('1x1 slope', f(C(s11, 1, 23) - C(s11, 1, 20), 2), '0.97');
  says('ch12.p3', '4×4 多出约 3.72 bit/s/Hz，一发一收只多约 0.97');
  check('ergodic = gain set', f(M.mimo.ergodic(4, 4, 20, 200, M.SEEDS.mimo).C, 9), f(C(s44, 4, 20), 9));
  // eigenvalues: count min(nt, nr) and sum = ‖H‖² (the trace of H Hᴴ)
  const r = M.rng(8);
  for (const [nt, nr] of [[2, 3], [4, 4], [8, 2]]) { const H = M.mimo.channel(nr, nt, r), g = M.mimo.gains(H); let fro = 0; for (let i = 0; i < nr; i++) for (let j = 0; j < nt; j++) fro += H.re[i][j] ** 2 + H.im[i][j] ** 2; check('gains count ' + nt + 'x' + nr, g.length, Math.min(nt, nr)); near('trace ' + nt + 'x' + nr, g.reduce((a, b) => a + b, 0), fro, 1e-9); }
  says('ch12.p2', '200 个信道矩阵');
}

/* ── ch13 frontier, ch14 checker ── */
{
  check('Wi-Fi 7 1 stream', f(M.wifi7.phyRate(1) / 1e6, 0), '2882'); says('frontier', '2882 Mbit/s');
  check('Wi-Fi 7 16 streams', f(M.wifi7.phyRate(16) / 1e9, 1), '46.1'); says('frontier', '约 46.1 Gbit/s'); says('ch14.preset.wifi', '46 Gbit/s');
  check('Wi-Fi bound at 38 dB', f(M.spec.bound(320e6, 16, 38) / 1e9, 1), '64.6'); says('ch14.p2', '64.6 Gbit/s'); says('ch14.p2', '38 dB');
  check('fibre η', f(450 / 42.4, 1), '10.6'); says('frontier', '平均每赫兹 10.6 比特');
  check('Hutter bits per byte', f(100424672 * 8 / 1e9, 2), '0.80'); says('frontier', '100,424,672 字节，约每字节 0.80 比特');
  check('η=9 needs', f(M.frontier.minSnrDb(9), 1), '27.1'); check('η=12 needs', f(M.frontier.minSnrDb(12), 1), '36.1'); says('ch14.q2', 'η = 9 要 27.1 dB，η = 12 要 36.1 dB');
  // the frontier block: every item has a known group and tag and a date/source line
  const G = new Set(['std', 'fibre', 'next', 'comp']), TG = new Set(['est', 'demo', 'claim', 'open']);
  check('frontier items well-formed', Z.frontier.every(x => G.has(x.group) && TG.has(x.tag) && x.text && x.when), true);
  check('every tag has a label', [...TG].every(x => Z['ch13.tag.' + x]), true);
  // the page's ch9 results quoted in the ch13 bar chart come from the same runs
  check('ch13 page gap = ch9 gap', f(globalThis.__ber.lx - M.biawgnLimitDb(0.5), 2), '2.30');
}

/* ── no placeholders left in the prose ── */
{
  const left = Object.entries(Z).filter(([k, v]) => typeof v === 'string' && !/\.say|\.unit|^u\.|\.tile|\.state|\.bar\.ldpc/.test(k) && /\{[A-Za-z_0-9]+\}/.test(v)).map(([k]) => k);
  check('no unfilled {placeholders} in prose', left.join(), '');
}

console.log(`${n - fails}/${n} checks passed in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
process.exit(fails ? 1 : 0);
