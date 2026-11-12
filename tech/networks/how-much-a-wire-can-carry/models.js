/* How much a wire can carry: the essay's models as plain functions (UMD: page and node). No visible text here.
 * Every model implements a named, standard result:
 *   ngram      Witten–Bell interpolated n-gram letter model (Witten & Bell 1991; Chen & Goodman 1998 §2.4)
 *   shannon51  Shannon's guessing-game bounds on the entropy of English (Shannon 1951, BSTJ 30:50–64, eqs. 17–18)
 *   huffman    minimum-redundancy prefix code (Huffman 1952)
 *   arith      integer arithmetic coder with E1/E2/E3 rescaling (Witten, Neal & Cleary 1987, CACM 30:520)
 *   counting   pigeonhole bound on lossless compression (Cover & Thomas, Elements of Information Theory, §5)
 *   bsc        binary symmetric channel: I(X;Y) = H(Y) − H(p), C = 1 − H(p) (Shannon 1948; Cover & Thomas §7.1.4)
 *   awgn       Shannon–Hartley C = B log2(1 + S/N); power-limited limit P/(N0 ln 2) (Shannon 1949)
 *   link       Friis free-space link budget with the Voyager 2 design control table (Ludwig & Taylor, DESCANSO 4, 2002)
 *   repetition majority-vote repetition codes on a BSC (exact binomial tail + seeded simulation)
 *   ebn0       Shannon bound Eb/N0 ≥ (2^η − 1)/η, limit ln 2 = −1.59 dB (Cover & Thomas §9.3)
 *   biawgn     binary-input AWGN capacity by numerical integration (Richardson & Urbanke, Modern Coding Theory §4.2)
 *   hamming    Hamming (7,4) code, parity-check matrix with columns 1..7 (Hamming 1950)
 *   gf16, rs   GF(2^4) with x^4 + x + 1; Reed–Solomon (15,9) as an evaluation code (Reed & Solomon 1960),
 *              decoded with erasures + errors by the Berlekamp–Welch key equation (Welch & Berlekamp 1986)
 *   conv       rate-1/2, K = 7 convolutional code (171,133 octal; CCSDS 131.0-B, the Voyager code), soft Viterbi (1967)
 *   ldpc       rate-1/2 LDPC code, column weight 3 + dual-diagonal parity part (IRA structure as in 802.11n / 5G NR),
 *              sum-product belief propagation in the LLR domain (Gallager 1963; Kschischang, Frey & Loeliger 2001)
 *   ber        seeded Monte Carlo of BPSK over AWGN for uncoded, convolutional and LDPC links
 *   polar      channel polarisation on the BEC: z → 2z − z², z² (Arıkan 2009, IEEE Trans. IT 55:3051)
 *   qam        square M-QAM over AWGN: simulated and exact symbol error rate (Proakis & Salehi, Digital Comms §4.3)
 *   amc        adaptive modulation and coding on a Rayleigh (Clarke) fading channel with the 3GPP TS 38.214 CQI table 4
 *   mimo       MIMO capacity log2 det(I + (SNR/nt) H Hᴴ) with i.i.d. Rayleigh H (Telatar 1999; Foschini & Gans 1998)
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.WireModels = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const LN2 = Math.LN2;
  const log2 = x => Math.log(x) / LN2;
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const dB = x => 10 * Math.log10(x);
  const undB = d => Math.pow(10, d / 10);

  /* ───────── random numbers: mulberry32 + Box–Muller ───────── */
  function rng(seed) {
    let a = (seed >>> 0) || 1;
    const next = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    let spare = null;
    next.gauss = () => {
      if (spare !== null) { const s = spare; spare = null; return s; }
      let u = 0; while (u === 0) u = next();
      const v = next(), r = Math.sqrt(-2 * Math.log(u));
      spare = r * Math.sin(2 * Math.PI * v); return r * Math.cos(2 * Math.PI * v);
    };
    next.int = n => Math.floor(next() * n);
    return next;
  }

  /* erfc with fractional error < 1.2e-7 (Numerical Recipes, Chebyshev fit) and Q(x) = ½ erfc(x/√2) */
  function erfc(x) {
    const z = Math.abs(x), t = 1 / (1 + 0.5 * z);
    const r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
    return x >= 0 ? r : 2 - r;
  }
  const Q = x => 0.5 * erfc(x / Math.SQRT2);
  const H2 = p => (p <= 0 || p >= 1) ? 0 : -p * log2(p) - (1 - p) * log2(1 - p);
  function bisect(f, a, b, it = 100) { let fa = f(a); for (let i = 0; i < it; i++) { const m = (a + b) / 2, fm = f(m); if ((fm > 0) === (fa > 0)) { a = m; fa = fm; } else b = m; } return (a + b) / 2; }
  function entropyOfCounts(counts) { let n = 0; for (const c of counts) n += c; if (!n) return 0; let h = 0; for (const c of counts) if (c) h -= c / n * log2(c / n); return h; }

  /* ═════════ 1 · letters, n-grams and Shannon's guessing game ═════════ */
  const ALPHA = 'abcdefghijklmnopqrstuvwxyz ';
  const A = ALPHA.length; // 27
  const toIdx = s => { const out = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) { const c = ALPHA.indexOf(s[i]); out[i] = c < 0 ? 26 : c; } return out; };
  // normalise any text to the 27-symbol alphabet (what the corpus uses)
  const norm27 = s => String(s).toLowerCase().replace(/['’‘]/g, '').replace(/[^a-z]+/g, ' ').replace(/ +/g, ' ');

  /* Witten–Bell interpolated model of order K (K letters of context). P_k(c|h) = (n(h,c) + T(h)·P_{k−1}(c|h')) / (n(h) + T(h)),
   * T(h) = number of distinct letters seen after h; the order −1 model is uniform. Counts can be added one letter at a time. */
  function ngramModel(K) {
    const maps = []; for (let k = 0; k <= K; k++) maps.push(new Map());
    const m = { K, maps, seen: 0 };
    m.add = (ctxStr, c) => { // ctxStr: the preceding letters (any length; the last K are used)
      for (let k = 0; k <= K; k++) {
        if (ctxStr.length < k) break;
        const h = ctxStr.slice(ctxStr.length - k);
        let e = maps[k].get(h); if (!e) { e = { n: 0, t: 0, c: new Uint32Array(A) }; maps[k].set(h, e); }
        if (e.c[c] === 0) e.t++; e.c[c]++; e.n++;
      }
      m.seen++;
    };
    // probabilities from the order-kmax part of the model (kmax ≤ K); onEach(k, p) sees every order's estimate
    m.distK = (ctxStr, kmax, onEach) => { // Float64Array(27) of probabilities
      let p = new Float64Array(A).fill(1 / A), last = -1;
      for (let k = 0; k <= kmax; k++) {
        if (ctxStr.length < k) break;
        const e = maps[k].get(ctxStr.slice(ctxStr.length - k));
        if (!e || !e.n) break; // a longer context never seen: keep the shorter estimate
        const q = new Float64Array(A), d = e.n + e.t;
        for (let i = 0; i < A; i++) q[i] = (e.c[i] + e.t * p[i]) / d;
        p = q; last = k;
        if (onEach) onEach(k, p);
      }
      if (onEach) for (let k = last + 1; k <= kmax; k++) onEach(k, p);
      return p;
    };
    m.dist = ctxStr => m.distK(ctxStr, K);
    return m;
  }
  // the order-k model inside a model of order K ≥ k (counts for orders ≤ k do not depend on K)
  const ngramView = (m, k) => ({ K: k, dist: ctx => m.distK(ctx, k) });
  // generators: yield every `every` letters so a page can spread the work over frames; runGen drives one to the end
  function runGen(g) { let r; do { r = g.next(); } while (!r.done); return r.value; }
  function* trainNgramGen(text, K, every = 4000) {
    const m = ngramModel(K);
    for (let i = 0; i < text.length; i++) { m.add(text.slice(Math.max(0, i - K), i), ALPHA.indexOf(text[i]) < 0 ? 26 : ALPHA.indexOf(text[i])); if (i % every === every - 1) yield i / text.length; }
    return m;
  }
  // held-out cross-entropy of every order 0…K in one pass (same numbers as crossEntropy on order-k models)
  function* crossEntropyAllGen(model, test, every = 2000) {
    const K = model.K, bits = new Float64Array(K + 1);
    for (let i = 0; i < test.length; i++) {
      const c = ALPHA.indexOf(test[i]);
      model.distK(test.slice(Math.max(0, i - K), i), K, (k, p) => { bits[k] -= log2(p[c]); });
      if (i % every === every - 1) yield i / test.length;
    }
    return Array.from(bits, b => b / test.length);
  }
  function trainNgram(text, K) { return runGen(trainNgramGen(text, K)); }
  // held-out cross-entropy in bits per letter (an upper bound on the source's entropy rate)
  function crossEntropy(model, test, warm = '') {
    const s = warm + test, K = model.K; let bits = 0;
    for (let i = warm.length; i < s.length; i++) { const p = model.dist(s.slice(Math.max(0, i - K), i)); bits -= log2(p[ALPHA.indexOf(s[i])]); }
    return bits / test.length;
  }
  // in-sample conditional entropy H(X | previous k letters) from raw counts: Shannon's F_{k+1}; biased low for large k
  function pluginConditional(text, k) {
    const map = new Map();
    for (let i = k; i < text.length; i++) { const h = text.slice(i - k, i); let c = map.get(h); if (!c) { c = new Uint32Array(A); map.set(h, c); } c[ALPHA.indexOf(text[i])]++; }
    let n = 0, h = 0; for (const c of map.values()) { let s = 0; for (const x of c) s += x; n += s; h += s * entropyOfCounts(c); }
    return h / n;
  }
  const corpusSplit = (corpus, frac = 0.85) => { const cut = corpus.lastIndexOf(' ', Math.floor(corpus.length * frac)); return { train: corpus.slice(0, cut + 1), test: corpus.slice(cut + 1) }; };
  // letters ranked by the model's probability (ties: alphabet order) — the order in which a machine would guess
  function guessOrder(model, ctx) { const p = model.dist(ctx); return Array.from({ length: A }, (_, i) => i).sort((a, b) => p[b] - p[a] || a - b); }
  function machineRanks(model, passage, before = '') {
    const s = before + passage, out = [];
    for (let i = before.length; i < s.length; i++) out.push(guessOrder(model, s.slice(Math.max(0, i - model.K), i)).indexOf(ALPHA.indexOf(s[i])) + 1);
    return out;
  }
  /* Shannon 1951: q_i = share of letters guessed on the i-th try. Upper bound −Σ q_i log2 q_i; lower bound Σ i (q_i − q_{i+1}) log2 i. */
  function shannonBounds(ranks) {
    const q = new Float64Array(A + 2); for (const r of ranks) q[r] += 1 / ranks.length;
    let up = 0, lo = 0; for (let i = 1; i <= A; i++) { if (q[i] > 0) up -= q[i] * log2(q[i]); lo += i * (q[i] - q[i + 1]) * log2(i); }
    return { upper: up, lower: lo, q, firstTry: q[1] };
  }

  /* ═════════ 2 · Huffman and arithmetic coding ═════════ */
  // symbols ordered by count desc, then code point; ties in the heap broken by creation order so the code is reproducible
  function symbolCounts(arr) { const m = new Map(); for (const s of arr) m.set(s, (m.get(s) || 0) + 1); return [...m.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)); }
  function huffman(weights) { // weights: array of numbers > 0; returns code lengths and codewords (strings of 0/1)
    const n = weights.length; if (n === 1) return { lengths: [1], codes: ['0'] };
    // two queues: leaves sorted by (weight, id), merged nodes appear in non-decreasing weight and increasing id,
    // so taking the smaller head by (weight, id) is the same as re-sorting the whole list each step, in O(n log n)
    const less = (a, b) => a.w < b.w || (a.w === b.w && a.id < b.id);
    const leaves = weights.map((w, i) => ({ w, id: i, leaf: i })).sort((a, b) => a.w - b.w || a.id - b.id), merged = [];
    let li = 0, mi = 0, nextId = n;
    const take = () => (mi >= merged.length || (li < leaves.length && less(leaves[li], merged[mi]))) ? leaves[li++] : merged[mi++];
    for (let step = 0; step < n - 1; step++) { const a = take(), b = take(); merged.push({ w: a.w + b.w, id: nextId++, kids: [a, b] }); }
    const live = [merged[merged.length - 1]];
    const lengths = new Array(n), codes = new Array(n);
    (function walk(nd, code) { if (nd.kids) { walk(nd.kids[0], code + '0'); walk(nd.kids[1], code + '1'); } else { lengths[nd.leaf] = code.length; codes[nd.leaf] = code; } })(live[0], '');
    return { lengths, codes };
  }
  function textStats(arr) {
    const sc = symbolCounts(arr), n = arr.length, w = sc.map(e => e[1]);
    const H = entropyOfCounts(w), hf = huffman(w);
    let L = 0; sc.forEach((e, i) => { L += e[1] * hf.lengths[i]; });
    return { symbols: sc.map(e => e[0]), counts: w, n, H, huffLengths: hf.lengths, huffCodes: hf.codes, huffBits: L, huffAvg: L / n };
  }

  /* Integer arithmetic coder, 32-bit registers (Witten, Neal & Cleary 1987). model(i) → { cum: cumulative counts
   * (length A+1, cum[0] = 0), total } for the i-th symbol; totals must stay ≤ 2^16 so that range × cum < 2^53. */
  const TOP = 4294967296, HALF = 2147483648, QTR = 1073741824;
  function arithEncoder() {
    let low = 0, high = TOP - 1, pending = 0; const bits = [];
    const emit = b => { bits.push(b); for (; pending > 0; pending--) bits.push(1 - b); };
    return {
      bits,
      push(cum, total, s) {
        const range = high - low + 1;
        high = low + Math.floor(range * cum[s + 1] / total) - 1; low = low + Math.floor(range * cum[s] / total);
        for (;;) {
          if (high < HALF) emit(0);
          else if (low >= HALF) { emit(1); low -= HALF; high -= HALF; }
          else if (low >= QTR && high < 3 * QTR) { pending++; low -= QTR; high -= QTR; }
          else break;
          low = 2 * low; high = 2 * high + 1;
        }
      },
      finish() { pending++; emit(low < QTR ? 0 : 1); return bits; }
    };
  }
  function arithDecoder(bits, nsym) {
    let low = 0, high = TOP - 1, value = 0, pos = 0;
    const bit = () => (pos < bits.length ? bits[pos++] : 0);
    for (let i = 0; i < 32; i++) value = 2 * value + bit();
    return {
      next(cum, total) {
        const range = high - low + 1, target = Math.floor(((value - low + 1) * total - 1) / range);
        let s = 0; while (s < nsym - 1 && cum[s + 1] <= target) s++;
        high = low + Math.floor(range * cum[s + 1] / total) - 1; low = low + Math.floor(range * cum[s] / total);
        for (;;) {
          if (high < HALF) { /* nothing */ }
          else if (low >= HALF) { low -= HALF; high -= HALF; value -= HALF; }
          else if (low >= QTR && high < 3 * QTR) { low -= QTR; high -= QTR; value -= QTR; }
          else break;
          low = 2 * low; high = 2 * high + 1; value = 2 * value + bit();
        }
        return s;
      }
    };
  }
  function arithEncode(syms, model) { const e = arithEncoder(); for (let i = 0; i < syms.length; i++) { const { cum, total } = model(i); e.push(cum, total, syms[i]); } return e.finish(); }
  function arithDecode(bits, n, model, nsym) { const d = arithDecoder(bits, nsym), out = []; for (let i = 0; i < n; i++) { const { cum, total } = model(i, out); out.push(d.next(cum, total)); } return out; }
  // a frequency table (integers) → cum with total ≤ 2^16, every symbol at least 1
  function quantise(probsOrCounts, total = 65536) {
    const n = probsOrCounts.length; let s = 0; for (const x of probsOrCounts) s += x;
    const f = new Uint32Array(n); let used = 0;
    for (let i = 0; i < n; i++) { f[i] = Math.max(1, Math.floor(probsOrCounts[i] / s * (total - n))); used += f[i]; }
    const cum = new Float64Array(n + 1); for (let i = 0; i < n; i++) cum[i + 1] = cum[i] + f[i];
    return { cum, total: cum[n] };
  }
  /* static model: the symbol frequencies of the text itself (as Huffman uses them); returns bits and a round-trip check */
  function arithStatic(arr) {
    const st = textStats(arr), idx = new Map(st.symbols.map((s, i) => [s, i])), syms = arr.map(s => idx.get(s));
    const table = quantise(st.counts, Math.min(65536, Math.max(st.n, st.symbols.length + 1)));
    const model = () => table, bits = arithEncode(syms, model), back = arithDecode(bits, syms.length, model, st.symbols.length);
    return { bits: bits.length, perSymbol: bits.length / arr.length, ok: back.every((s, i) => s === syms[i]), H: st.H };
  }
  /* biased coin: Huffman on blocks of b flips (exact expected length) vs arithmetic coding of an actual seeded sequence */
  function coinHuffman(p, b) {
    const w = []; for (let x = 0; x < (1 << b); x++) { let k = 0; for (let j = 0; j < b; j++) k += (x >> j) & 1; w.push(Math.pow(p, k) * Math.pow(1 - p, b - k)); }
    const hf = huffman(w); let L = 0; w.forEach((q, i) => { L += q * hf.lengths[i]; }); return L / b;
  }
  function coinArith(p, n, seed) {
    const r = rng(seed), syms = []; for (let i = 0; i < n; i++) syms.push(r() < p ? 1 : 0);
    const table = quantise([1 - p, p]), model = () => table, bits = arithEncode(syms, model), back = arithDecode(bits, n, model, 2);
    let ones = 0; for (const s of syms) ones += s;
    return { bits: bits.length, perSymbol: bits.length / n, ok: back.every((s, i) => s === syms[i]), ones };
  }

  /* ═════════ 3 · prediction is compression ═════════ */
  // adaptive order-K Witten–Bell model driving the arithmetic coder; optional pre-training text (the "prior knowledge")
  function* adaptiveCodeGen(text, K, pretrain, every = 1000) {
    const syms = toIdx(text), warm = pretrain ? pretrain.slice(-K) : '', s = warm + text, off = warm.length;
    const fresh = function* () { return pretrain ? yield* trainNgramGen(pretrain, K, every * 4) : ngramModel(K); };
    const ctx = i => s.slice(Math.max(0, i + off - K), i + off);
    // encode, updating the model after each letter
    const m = yield* fresh(), enc = arithEncoder();
    for (let i = 0; i < syms.length; i++) {
      const t = quantise(m.dist(ctx(i))); enc.push(t.cum, t.total, syms[i]); m.add(ctx(i), syms[i]);
      if (i % every === every - 1) yield;
    }
    const bits = enc.finish();
    // decode with a fresh, identically trained model to prove the round trip
    const m2 = yield* fresh(), dec = arithDecoder(bits, A); let ok = true, d = warm;
    for (let i = 0; i < syms.length; i++) {
      const h = d.slice(Math.max(0, i + off - K), i + off), t = quantise(m2.dist(h)), x = dec.next(t.cum, t.total);
      if (x !== syms[i]) ok = false;
      m2.add(h, x); d += ALPHA[x];
      if (i % every === every - 1) yield;
    }
    return { bits: bits.length, bpc: bits.length / text.length, ok };
  }
  function adaptiveCode(text, K, pretrain) { return runGen(adaptiveCodeGen(text, K, pretrain)); }
  function randomLetters(n, seed) { const r = rng(seed); let s = ''; for (let i = 0; i < n; i++) s += ALPHA[r.int(A)]; return s; }
  // pigeonhole: of the 2^n strings of n bits, at most 2^(n−k+1) − 1 can map to outputs of n − k bits or fewer
  function counting(n, k) { const total = Math.pow(2, n), shorter = k > n ? 0 : Math.pow(2, n - k + 1) - 1; return { total, shorter, frac: Math.min(1, shorter / total) }; }

  /* ═════════ 4 · binary symmetric channel ═════════ */
  const bsc = {
    pY1: (p, q) => q * (1 - p) + (1 - q) * p,
    mutualInfo(p, q) { return H2(bsc.pY1(p, q)) - H2(p); },
    capacity: p => 1 - H2(p),
    simulate(n, p, q, seed) { // send n bits with P(1) = q; return the bits, the flips and the empirical mutual information
      const r = rng(seed), x = new Uint8Array(n), y = new Uint8Array(n), joint = [0, 0, 0, 0];
      for (let i = 0; i < n; i++) { x[i] = r() < q ? 1 : 0; y[i] = x[i] ^ (r() < p ? 1 : 0); joint[2 * x[i] + y[i]]++; }
      let I = 0; const px = [joint[0] + joint[1], joint[2] + joint[3]], py = [joint[0] + joint[2], joint[1] + joint[3]];
      for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) { const j = joint[2 * a + b]; if (j) I += j / n * log2(j * n / (px[a] * py[b])); }
      let flips = 0; for (let i = 0; i < n; i++) flips += x[i] ^ y[i];
      return { x, y, flips, empiricalI: I };
    }
  };

  /* ═════════ 5 · AWGN and real links ═════════ */
  const awgn = {
    capacity: (B, snr) => B * log2(1 + snr),               // bit/s
    powerLimited: PN0 => PN0 / LN2,                        // bit/s as B → ∞ at fixed P/N0 (W/Hz ratio, linear)
    // the four "what if" cases for the reader's B and SNR
    whatIf(B, snr) { return { base: awgn.capacity(B, snr), power2: awgn.capacity(B, 2 * snr), band2: awgn.capacity(2 * B, snr / 2), both2: awgn.capacity(2 * B, snr) }; },
    minSNR: eta => Math.pow(2, eta) - 1                    // smallest SNR (linear) for η bit/s/Hz
  };
  const BOLTZ = 1.380649e-23, C0 = 299792458, AU = 1.495978707e11;
  const friisLoss = (dMeters, fHz) => -20 * Math.log10(4 * Math.PI * dMeters * fHz / C0);
  const noiseDensity_dBmHz = T => 10 * Math.log10(BOLTZ * T) + 30;
  /* Voyager 2 X-band downlink, DSS-43 (70 m), 1996-01-01 (Ludwig & Taylor 2002, Table 5-3): range 7.273e9 km = 48.62 AU */
  const VOYAGER = { ptdBm: 40.9, gt: 48.2, pointT: -0.1, f: 8415e6, atm: -0.04, pol: -0.08, gr: 74.01, pointR: -0.2, Tsys: 21.12, d1996: 7.273e12, rate1996: 160, rates: [160, 1400, 7200], margin160: 13.3 };
  function voyagerLink(dMeters) {
    const V = VOYAGER, Ls = friisLoss(dMeters, V.f);
    const pr = V.ptdBm + V.gt + V.pointT + Ls + V.atm + V.pol + V.gr + V.pointR, n0 = noiseDensity_dBmHz(V.Tsys);
    const prn0 = pr - n0; return { spaceLoss: Ls, pr, n0, prn0, cInf: undB(prn0) / LN2 };
  }
  /* Wi-Fi 7 (802.11be) 320 MHz: 3920 data subcarriers, 12.8 µs + 0.8 µs guard; MCS 13 = 4096-QAM, rate 5/6 */
  const wifi7 = { B: 320e6, tones: 3920, tsym: 13.6e-6, bitsPerTone: 12, rate: 5 / 6, evmDb: -38, maxStreams: 16 };
  wifi7.phyRate = (nss = 1) => nss * wifi7.tones * wifi7.bitsPerTone * wifi7.rate / wifi7.tsym;
  /* 3GPP TS 38.214 V19.5.0 Table 5.2.2.1-5 (CQI table 4, up to 1024-QAM; BLER target 0.1) */
  const CQI4 = [
    { q: 1, mod: 4, r: 78, eff: 0.1523 }, { q: 2, mod: 4, r: 193, eff: 0.377 }, { q: 3, mod: 4, r: 449, eff: 0.877 },
    { q: 4, mod: 16, r: 378, eff: 1.4766 }, { q: 5, mod: 16, r: 616, eff: 2.4063 }, { q: 6, mod: 64, r: 567, eff: 3.3223 },
    { q: 7, mod: 64, r: 666, eff: 3.9023 }, { q: 8, mod: 64, r: 772, eff: 4.5234 }, { q: 9, mod: 64, r: 873, eff: 5.1152 },
    { q: 10, mod: 256, r: 711, eff: 5.5547 }, { q: 11, mod: 256, r: 797, eff: 6.2266 }, { q: 12, mod: 256, r: 885, eff: 6.9141 },
    { q: 13, mod: 256, r: 948, eff: 7.4063 }, { q: 14, mod: 1024, r: 853, eff: 8.3301 }, { q: 15, mod: 1024, r: 948, eff: 9.2578 }
  ];

  /* ═════════ 6 · repetition codes and the Eb/N0 floor ═════════ */
  function binom(n, k) { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return r; }
  const repetition = {
    errExact(n, p) { let s = 0; for (let k = Math.floor(n / 2) + 1; k <= n; k++) s += binom(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k); return s; }, // n odd
    simulate(n, p, trials, seed) { const r = rng(seed); let err = 0; for (let t = 0; t < trials; t++) { let f = 0; for (let j = 0; j < n; j++) if (r() < p) f++; if (f > n / 2) err++; } return err / trials; },
    // smallest odd n with error ≤ target
    nFor(p, target) { for (let n = 1; n < 400; n += 2) if (repetition.errExact(n, p) <= target) return n; return Infinity; }
  };
  const ebn0 = {
    min: eta => (Math.pow(2, eta) - 1) / eta,            // linear, η in bit/s/Hz (complex baseband)
    limitDb: () => dB(LN2),
    bpskBer: ebn0Lin => Q(Math.sqrt(2 * ebn0Lin)),
    // Gray-coded square M-QAM, nearest-neighbour approximation (exact for M = 4: Q(√(2 Eb/N0)), the same as BPSK)
    qamBer(M, ebn0Lin) { const k = log2(M); return 4 / k * (1 - 1 / Math.sqrt(M)) * Q(Math.sqrt(3 * k / (M - 1) * ebn0Lin)); },
    ebn0ForBer(M, target) { return dB(Math.pow(10, bisect(x => ebn0.qamBer(M, Math.pow(10, x)) - target, -2, 4))); },
    bpskForBer: target => dB(Math.pow(10, bisect(x => ebn0.bpskBer(Math.pow(10, x)) - target, -2, 4)))
  };
  /* binary-input AWGN capacity (bit per channel use), y = ±1 + n, n ~ N(0, σ²): C = 1 − E[log2(1 + e^{−2y/σ²})] given x = +1 */
  function biawgnCapacity(sigma) {
    const N = 4000, lo = 1 - 12 * sigma, hi = 1 + 12 * sigma, h = (hi - lo) / N; let s = 0;
    for (let i = 0; i <= N; i++) {
      const y = lo + i * h, w = (i === 0 || i === N) ? 0.5 : 1;
      const pdf = Math.exp(-(y - 1) * (y - 1) / (2 * sigma * sigma)) / (sigma * Math.sqrt(2 * Math.PI));
      const t = -2 * y / (sigma * sigma); const l = t > 30 ? t / LN2 : log2(1 + Math.exp(t));
      s += w * pdf * l;
    }
    return 1 - s * h;
  }
  // Eb/N0 (dB) at which a binary-input AWGN channel reaches capacity R
  const biawgnLimitDb = R => { const s = bisect(sg => biawgnCapacity(sg) - R, 0.2, 5); return dB(1 / (2 * R * s * s)); };
  const gaussLimitDb = R => dB((Math.pow(2, 2 * R) - 1) / (2 * R)); // real-valued Gaussian input, R bits per real dimension

  /* ═════════ 7 · Hamming (7,4) ═════════ */
  const hamming = {
    // positions 1..7; parity bits at 1, 2, 4; column j of H is j in binary, so the syndrome names the flipped position
    encode(d) { const c = [0, 0, d[0], 0, d[1], d[2], d[3]]; c[0] = c[2] ^ c[4] ^ c[6]; c[1] = c[2] ^ c[5] ^ c[6]; c[3] = c[4] ^ c[5] ^ c[6]; return c; },
    syndrome(r) { let s = 0; for (let j = 0; j < 7; j++) if (r[j]) s ^= (j + 1); return s; },
    decode(r) { const s = hamming.syndrome(r), c = r.slice(); if (s) c[s - 1] ^= 1; return { s, c, d: [c[2], c[4], c[5], c[6]] }; },
    codewords() { const out = []; for (let x = 0; x < 16; x++) out.push(hamming.encode([(x >> 3) & 1, (x >> 2) & 1, (x >> 1) & 1, x & 1])); return out; },
    dist: (a, b) => a.reduce((s, v, i) => s + (v ^ b[i]), 0),
    minDistance() { const cw = hamming.codewords(); let d = 99; for (let i = 0; i < 16; i++) for (let j = i + 1; j < 16; j++) d = Math.min(d, hamming.dist(cw[i], cw[j])); return d; },
    blockError(p) { return 1 - Math.pow(1 - p, 7) - 7 * p * Math.pow(1 - p, 6); }, // more than one flip in 7
    // exact data-bit error rate after decoding on a BSC(p): sum over all 128 error patterns (linear code: send all-zero)
    bitError(p) { let s = 0; for (let e = 0; e < 128; e++) { const r = []; let w = 0; for (let j = 0; j < 7; j++) { r.push((e >> j) & 1); w += (e >> j) & 1; } const d = hamming.decode(r).d; s += Math.pow(p, w) * Math.pow(1 - p, 7 - w) * (d[0] + d[1] + d[2] + d[3]) / 4; } return s; }
  };

  /* ═════════ 8 · GF(16) and Reed–Solomon (15,9) ═════════ */
  const gf = (() => {
    const exp = new Uint8Array(30), log = new Int8Array(16).fill(-1); let x = 1;
    for (let i = 0; i < 15; i++) { exp[i] = x; log[x] = i; x <<= 1; if (x & 16) x ^= 0x13; } // x^4 + x + 1
    for (let i = 15; i < 30; i++) exp[i] = exp[i - 15];
    const mul = (a, b) => (a && b) ? exp[log[a] + log[b]] : 0;
    const inv = a => exp[(15 - log[a]) % 15];
    const pow = (a, n) => { let r = 1; for (let i = 0; i < n; i++) r = mul(r, a); return r; };
    return { exp, log, add: (a, b) => a ^ b, mul, inv, div: (a, b) => mul(a, inv(b)), pow };
  })();
  const RS = { n: 15, k: 9 };
  RS.points = Array.from({ length: 15 }, (_, i) => gf.exp[i]); // α^0 … α^14
  RS.evalPoly = (c, x) => { let r = 0; for (let j = c.length - 1; j >= 0; j--) r = gf.mul(r, x) ^ c[j]; return r; };
  RS.encode = msg => RS.points.map(a => RS.evalPoly(msg, a)); // codeword = the message polynomial evaluated at 15 points
  // solve A·x = b over GF(16); returns x or null if inconsistent (free variables set to 0)
  function gfSolve(Arows, b) {
    const m = Arows.length, n = Arows[0].length, M = Arows.map((r, i) => r.concat([b[i]]));
    const piv = []; let row = 0;
    for (let col = 0; col < n && row < m; col++) {
      let p = -1; for (let r = row; r < m; r++) if (M[r][col]) { p = r; break; }
      if (p < 0) continue;
      [M[row], M[p]] = [M[p], M[row]];
      const iv = gf.inv(M[row][col]); for (let j = col; j <= n; j++) M[row][j] = gf.mul(M[row][j], iv);
      for (let r = 0; r < m; r++) if (r !== row && M[r][col]) { const f = M[r][col]; for (let j = col; j <= n; j++) M[r][j] ^= gf.mul(f, M[row][j]); }
      piv.push(col); row++;
    }
    for (let r = row; r < m; r++) if (M[r][n]) return null;
    const x = new Array(n).fill(0); piv.forEach((c, r) => { x[c] = M[r][n]; }); return x;
  }
  function polyDiv(num, den) { // returns { q, r } with coefficient arrays (index = power)
    const r = num.slice(), dd = den.length - 1, lead = gf.inv(den[dd]), q = new Array(Math.max(1, num.length - dd)).fill(0);
    for (let i = num.length - 1; i >= dd; i--) { const c = gf.mul(r[i], lead); q[i - dd] = c; if (c) for (let j = 0; j <= dd; j++) r[i - dd + j] ^= gf.mul(c, den[j]); }
    return { q, r: r.slice(0, dd) };
  }
  /* decode: received array of 15 symbols, null = erased. Berlekamp–Welch on the n' unerased positions:
   * find E (monic, degree e) and Q (degree < e + k) with Q(a_i) = r_i E(a_i); then f = Q / E. Works when 2·errors + erasures ≤ n − k. */
  RS.decode = recv => {
    const pos = []; recv.forEach((v, i) => { if (v !== null && v !== undefined) pos.push(i); });
    const np = pos.length, k = RS.k; if (np < k) return { ok: false, reason: 'too-few' };
    const e = Math.floor((np - k) / 2);
    const rows = [], rhs = [];
    for (const i of pos) {
      const a = RS.points[i], r = recv[i], row = [];
      for (let j = 0; j < e + k; j++) row.push(gf.pow(a, j));                // Q_j
      for (let j = 0; j < e; j++) row.push(gf.mul(r, gf.pow(a, j)));         // E_j (char 2: minus = plus)
      rows.push(row); rhs.push(gf.mul(r, gf.pow(a, e)));
    }
    const sol = gfSolve(rows, rhs); if (!sol) return { ok: false, reason: 'no-solution' };
    const Qp = sol.slice(0, e + k), Ep = sol.slice(e + k).concat([1]);
    const { q, r } = polyDiv(Qp, Ep); if (r.some(v => v)) return { ok: false, reason: 'not-divisible' };
    const msg = q.slice(0, k); while (msg.length < k) msg.push(0);
    const cw = RS.encode(msg); const errors = pos.filter(i => cw[i] !== recv[i]);
    if (errors.length > e) return { ok: false, reason: 'too-many' };
    return { ok: true, msg, codeword: cw, errors, erasures: 15 - np, budget: e };
  };

  /* ═════════ 9 · convolutional code + Viterbi, LDPC + belief propagation, Monte Carlo BER ═════════ */
  const conv = (() => {
    const K = 7, S = 64, G = [0o171, 0o133];
    const parity = x => { let p = 0; while (x) { p ^= x & 1; x >>= 1; } return p; };
    // state = last 6 input bits (newest in bit 5); register = (input << 6) | state
    const out = []; const nxt = [];
    for (let s = 0; s < S; s++) for (let u = 0; u < 2; u++) { const reg = (u << 6) | s; out[2 * s + u] = [parity(reg & G[0]), parity(reg & G[1])]; nxt[2 * s + u] = reg >> 1; }
    function encode(bits) { let s = 0; const c = []; for (const u of bits.concat([0, 0, 0, 0, 0, 0])) { const o = out[2 * s + u]; c.push(o[0], o[1]); s = nxt[2 * s + u]; } return c; }
    function viterbi(y, nInfo) { // y: received soft values (+1 ↔ bit 0); maximises Σ y·(1 − 2c)
      const T = nInfo + 6; let pm = new Float64Array(S).fill(-Infinity); pm[0] = 0;
      const surv = new Uint8Array(T * S), prevS = new Uint8Array(T * S);
      for (let t = 0; t < T; t++) {
        const nm = new Float64Array(S).fill(-Infinity), y0 = y[2 * t], y1 = y[2 * t + 1];
        for (let s = 0; s < S; s++) { if (pm[s] === -Infinity) continue;
          for (let u = 0; u < (t < nInfo ? 2 : 1); u++) { const o = out[2 * s + u], m = pm[s] + (o[0] ? -y0 : y0) + (o[1] ? -y1 : y1), ns = nxt[2 * s + u];
            if (m > nm[ns]) { nm[ns] = m; surv[t * S + ns] = u; prevS[t * S + ns] = s; } } }
        pm = nm;
      }
      const dec = new Uint8Array(T); let s = 0;
      for (let t = T - 1; t >= 0; t--) { dec[t] = surv[t * S + s]; s = prevS[t * S + s]; }
      return dec.slice(0, nInfo);
    }
    return { K, encode, viterbi, rate: 0.5 };
  })();

  function ldpcBuild(k = 512, seed = 2026) {
    const m = k, n = k + m, r = rng(seed), wc = 3, X = m >> 1;
    // info part: each column joins 3 distinct checks; no two columns share a pair of checks (no 4-cycles), and no column
    // joins two adjacent checks (that would close a 4-cycle with a dual-diagonal parity column)
    let cols = null;
    for (let attempt = 0; attempt < 60 && !cols; attempt++) {
      const cap = new Uint8Array(m).fill(wc), pairs = new Set([0 * m + X, X * m + (m - 1), 0 * m + (m - 1)]), out = []; let failed = false;
      for (let j = 0; j < k && !failed; j++) {
        let ok = false;
        for (let tries = 0; tries < 400 && !ok; tries++) {
          const cand = []; const free = []; for (let i = 0; i < m; i++) if (cap[i]) free.push(i);
          if (free.length < wc) break;
          while (cand.length < wc) { const c = free[r.int(free.length)]; if (!cand.includes(c)) cand.push(c); }
          cand.sort((a, b) => a - b);
          let bad = false; for (let a = 0; a < wc && !bad; a++) for (let b = a + 1; b < wc && !bad; b++) { if (cand[b] - cand[a] === 1 || pairs.has(cand[a] * m + cand[b])) bad = true; }
          if (bad) continue;
          for (let a = 0; a < wc; a++) for (let b = a + 1; b < wc; b++) pairs.add(cand[a] * m + cand[b]);
          cand.forEach(c => cap[c]--); out.push(cand); ok = true;
        }
        if (!ok) failed = true;
      }
      if (!failed) cols = out;
    }
    // adjacency lists
    const chk = Array.from({ length: m }, () => []);
    cols.forEach((cs, j) => cs.forEach(c => chk[c].push(j)));
    // parity part as in IEEE 802.11n / 5G NR base graphs: column p0 has weight 3 (rows 0, m/2, m−1), columns p1…p(m−1)
    // are dual-diagonal (p_j joins rows j−1 and j); no parity column of weight 1
    chk[0].push(k); chk[X].push(k); chk[m - 1].push(k);
    for (let j = 1; j < m; j++) { chk[j - 1].push(k + j); chk[j].push(k + j); }
    const edgesC = [], edgesV = []; chk.forEach((vs, c) => vs.forEach(v => { edgesC.push(c); edgesV.push(v); }));
    const E = edgesC.length, vEdges = Array.from({ length: n }, () => []), cStart = new Int32Array(m + 1);
    for (let e = 0; e < E; e++) vEdges[edgesV[e]].push(e);
    for (let c = 0, e = 0; c < m; c++) { cStart[c] = e; e += chk[c].length; } cStart[m] = E;
    return { k, m, n, X, cols, chk, E, edgesV: Int32Array.from(edgesV), vEdges, cStart, rate: k / n };
  }
  function ldpcEncode(code, info) {
    const { k, m, cols } = code, t = new Uint8Array(m);
    cols.forEach((cs, j) => { if (info[j]) cs.forEach(c => { t[c] ^= 1; }); });
    // p0 = sum of all rows' info parts (every dual-diagonal column cancels); then p_{i+1} = t_i ⊕ p_i ⊕ [i = m/2]·p0
    const p = new Uint8Array(m), X = m >> 1; let s0 = 0; for (let i = 0; i < m; i++) s0 ^= t[i]; p[0] = s0;
    if (m > 1) p[1] = t[0] ^ p[0];
    for (let i = 1; i < m - 1; i++) p[i + 1] = t[i] ^ p[i] ^ (i === X ? p[0] : 0);
    const c = new Uint8Array(k + m); c.set(info, 0); c.set(p, k); return c;
  }
  function ldpcCheck(code, bits) { const { m, chk } = code; for (let c = 0; c < m; c++) { let s = 0; for (const v of chk[c]) s ^= bits[v]; if (s) return false; } return true; }
  /* sum-product decoding; llr[v] = log P(0)/P(1). Returns hard decisions, iterations used and the error trace if `truth` given */
  function ldpcDecode(code, llr, maxIter = 50, truth, keepPosts) {
    const { n, m, E, edgesV, vEdges, cStart } = code;
    const v2c = new Float64Array(E), c2v = new Float64Array(E), hard = new Uint8Array(n), trace = [], posts = keepPosts ? [Float64Array.from(llr)] : null;
    for (let e = 0; e < E; e++) v2c[e] = llr[edgesV[e]];
    const countErr = () => { let x = 0; for (let v = 0; v < n; v++) x += hard[v] ^ truth[v]; return x; };
    for (let v = 0; v < n; v++) hard[v] = llr[v] < 0 ? 1 : 0;
    if (truth) trace.push(countErr());
    if (ldpcCheck(code, hard)) return { hard, iters: 0, trace, posts, ok: true };
    const tf = new Float64Array(32), fw = new Float64Array(33), bw = new Float64Array(33);
    for (let it = 1; it <= maxIter; it++) {
      for (let c = 0; c < m; c++) { // check update with forward/backward products of tanh(L/2)
        const a = cStart[c], d = cStart[c + 1] - a;
        for (let j = 0; j < d; j++) tf[j] = Math.tanh(clamp(v2c[a + j], -40, 40) / 2);
        fw[0] = 1; for (let j = 0; j < d; j++) fw[j + 1] = fw[j] * tf[j];
        bw[d] = 1; for (let j = d - 1; j >= 0; j--) bw[j] = bw[j + 1] * tf[j];
        for (let j = 0; j < d; j++) { const x = clamp(fw[j] * bw[j + 1], -0.999999999999, 0.999999999999); c2v[a + j] = 2 * Math.atanh(x); }
      }
      const post = keepPosts ? new Float64Array(n) : null;
      for (let v = 0; v < n; v++) { // variable update
        const es = vEdges[v]; let tot = llr[v]; for (const e of es) tot += c2v[e];
        for (const e of es) v2c[e] = tot - c2v[e];
        hard[v] = tot < 0 ? 1 : 0; if (post) post[v] = tot;
      }
      if (posts) posts.push(post);
      if (truth) trace.push(countErr());
      if (ldpcCheck(code, hard)) return { hard, iters: it, trace, posts, ok: true };
    }
    return { hard, iters: maxIter, trace, posts, ok: false };
  }

  /* Monte Carlo: BPSK (0 → +1, 1 → −1) over AWGN, Es = 1, σ² = 1 / (2 R Eb/N0). Each frame draws fresh random info bits,
   * encodes them with the page's encoder, adds noise, decodes. Stops at `maxFE` frame errors or `maxFrames` frames. */
  const ber = {
    sigma: (ebn0dB, R) => Math.sqrt(1 / (2 * R * undB(ebn0dB))),
    makeRun(scheme, ebn0dB, seed, opts = {}) {
      return { scheme, ebn0dB, r: rng(seed), bits: 0, errs: 0, frames: 0, fe: 0, maxFE: opts.maxFE || 40, maxFrames: opts.maxFrames || 2000, done: false, code: opts.code, iters: opts.iters || 50, frameLen: opts.frameLen || 256 };
    },
    stepRun(run, nFrames) {
      for (let f = 0; f < nFrames && !run.done; f++) {
        const r = run.r; let e = 0, nb = 0;
        if (run.scheme === 'uncoded') {
          const s = ber.sigma(run.ebn0dB, 1); nb = 1000;
          for (let i = 0; i < nb; i++) { const b = r() < 0.5 ? 1 : 0, y = (b ? -1 : 1) + s * r.gauss(); if ((y < 0 ? 1 : 0) !== b) e++; }
        } else if (run.scheme === 'conv') {
          const s = ber.sigma(run.ebn0dB, 0.5), L = run.frameLen, u = []; for (let i = 0; i < L; i++) u.push(r() < 0.5 ? 1 : 0);
          const c = conv.encode(u), y = c.map(b => (b ? -1 : 1) + s * r.gauss()), d = conv.viterbi(y, L);
          for (let i = 0; i < L; i++) e += d[i] ^ u[i]; nb = L;
        } else { // ldpc
          const code = run.code, s = ber.sigma(run.ebn0dB, code.rate), u = new Uint8Array(code.k);
          for (let i = 0; i < code.k; i++) u[i] = r() < 0.5 ? 1 : 0;
          const c = ldpcEncode(code, u), llr = new Float64Array(code.n);
          for (let v = 0; v < code.n; v++) { const y = (c[v] ? -1 : 1) + s * r.gauss(); llr[v] = 2 * y / (s * s); }
          const d = ldpcDecode(code, llr, run.iters);
          for (let i = 0; i < code.k; i++) e += d.hard[i] ^ u[i]; nb = code.k;
        }
        run.bits += nb; run.errs += e; run.frames++; if (e) run.fe++;
        if (run.fe >= run.maxFE || run.frames >= run.maxFrames) run.done = true;
      }
      return run;
    },
    result: run => ({ ebn0dB: run.ebn0dB, ber: run.errs / Math.max(1, run.bits), bits: run.bits, errs: run.errs, frames: run.frames, fe: run.fe }),
    // standard error of a BER estimate from `bits` independent bits (binomial)
    sigmaBer: (p, bits) => Math.sqrt(Math.max(p, 1e-12) * (1 - p) / bits)
  };

  /* ═════════ 10 · channel polarisation (BEC) ═════════ */
  function polarBEC(eps, nLevels) { // returns the N = 2^n erasure probabilities of the synthetic channels
    let z = [eps];
    for (let l = 0; l < nLevels; l++) { const nz = []; for (const x of z) { nz.push(2 * x - x * x, x * x); } z = nz; }
    return z;
  }
  function polarStats(eps, nLevels, lo = 0.01, hi = 0.99) {
    const z = polarBEC(eps, nLevels), N = z.length; let good = 0, bad = 0, mean = 0;
    for (const x of z) { if (x < lo) good++; else if (x > hi) bad++; mean += x; }
    return { N, good: good / N, bad: bad / N, mid: 1 - (good + bad) / N, meanZ: mean / N, capacity: 1 - eps };
  }

  /* ═════════ 11 · QAM and adaptive modulation ═════════ */
  const qam = {
    // square M-QAM, levels ±1, ±3, … scaled so average symbol energy is 1
    scale: M => Math.sqrt(3 / (2 * (M - 1))),
    serExact(M, esn0) { const p = 2 * (1 - 1 / Math.sqrt(M)) * Q(Math.sqrt(3 / (M - 1) * esn0)); return 1 - (1 - p) * (1 - p); },
    snrFor(M, target) { return bisect(x => qam.serExact(M, undB(x)) - target, -10, 70); }, // dB
    simulate(M, esn0dB, nsym, seed) {
      const r = rng(seed), m = Math.sqrt(M), a = qam.scale(M), sig = Math.sqrt(1 / (2 * undB(esn0dB)));
      const pts = new Float32Array(4 * nsym); let err = 0;
      const slice = v => clamp(2 * Math.round((v / a - 1) / 2) + 1, -(m - 1), m - 1);
      for (let i = 0; i < nsym; i++) {
        const xi = 2 * r.int(m) - (m - 1), xq = 2 * r.int(m) - (m - 1);
        const yi = xi * a + sig * r.gauss(), yq = xq * a + sig * r.gauss();
        if (slice(yi) !== xi || slice(yq) !== xq) err++;
        pts[4 * i] = xi * a; pts[4 * i + 1] = xq * a; pts[4 * i + 2] = yi; pts[4 * i + 3] = yq;
      }
      return { pts, ser: err / nsym, errors: err };
    }
  };
  const amc = {
    /* Clarke/Jakes Rayleigh fading as a sum of M sinusoids with random arrival angles and phases (seeded); E|h|² = 1 */
    fading(nSlots, slotSec, fdHz, seed, M = 24) {
      const r = rng(seed), al = [], ph = [], g = new Float64Array(nSlots);
      for (let i = 0; i < M; i++) { al.push(2 * Math.PI * r()); ph.push(2 * Math.PI * r()); }
      for (let t = 0; t < nSlots; t++) { let re = 0, im = 0; const tt = t * slotSec;
        for (let i = 0; i < M; i++) { const a = 2 * Math.PI * fdHz * tt * Math.cos(al[i]) + ph[i]; re += Math.cos(a); im += Math.sin(a); }
        g[t] = (re * re + im * im) / M; }
      return g;
    },
    doppler: (kmh, fHz) => kmh / 3.6 * fHz / C0,
    /* each slot the scheduler uses the SNR reported `delay` slots earlier, minus an outer-loop offset Δ, and picks the
     * highest CQI entry whose required SNR Γ·(2^eff − 1) it meets. The block fails if the SNR actually present is below
     * that requirement. Outer-loop link adaptation (OLLA) steers Δ so that the block error rate settles at the 3GPP
     * target of 10 %: +up dB after a failure, −up·0.1/0.9 dB after a success. olla = false keeps Δ at 0. */
    run(meanSnrDb, kmh, delay, gammaDb, seed, olla = true, nSlots = 2000, slotSec = 0.0005, fHz = 3.5e9) {
      const g = amc.fading(nSlots, slotSec, amc.doppler(kmh, fHz), seed), snr0 = undB(meanSnrDb), G = undB(gammaDb);
      const req = CQI4.map(c => G * (Math.pow(2, c.eff) - 1)), up = 0.5, down = up * 0.1 / 0.9;
      let thr = 0, sh = 0, fails = 0, sent = 0, off = 0; const pick = new Int8Array(nSlots), ok = new Uint8Array(nSlots), snrDb = new Float64Array(nSlots), offs = new Float64Array(nSlots);
      for (let t = 0; t < nSlots; t++) {
        const s = snr0 * g[t], rep = snr0 * g[Math.max(0, t - delay)] / undB(off); snrDb[t] = dB(Math.max(s, 1e-6)); offs[t] = off;
        let q = -1; for (let i = 0; i < CQI4.length; i++) if (rep >= req[i]) q = i;
        pick[t] = q; sh += log2(1 + s);
        if (q >= 0) { sent++; if (s >= req[q]) { ok[t] = 1; thr += CQI4[q].eff; if (olla) off -= down; } else { fails++; if (olla) off += up; } }
      }
      return { snrDb, pick, ok, offs, throughput: thr / nSlots, shannon: sh / nSlots, bler: sent ? fails / sent : 0, idle: 1 - sent / nSlots, req: req.map(dB), finalOffset: off };
    }
  };

  /* ═════════ 12 · MIMO ═════════ */
  function jacobiEig(S, n) { // real symmetric n×n (array of Float64Array rows), returns eigenvalues
    const a = S.map(r => Float64Array.from(r));
    for (let sweep = 0; sweep < 60; sweep++) {
      let off = 0; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) off += a[i][j] * a[i][j];
      if (off < 1e-22) break;
      for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) {
        if (Math.abs(a[p][q]) < 1e-300) continue;
        const th = (a[q][q] - a[p][p]) / (2 * a[p][q]), t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1)), c = 1 / Math.sqrt(t * t + 1), s = t * c;
        for (let k = 0; k < n; k++) { const akp = a[k][p], akq = a[k][q]; a[k][p] = c * akp - s * akq; a[k][q] = s * akp + c * akq; }
        for (let k = 0; k < n; k++) { const apk = a[p][k], aqk = a[q][k]; a[p][k] = c * apk - s * aqk; a[q][k] = s * apk + c * aqk; }
      }
    }
    return Array.from({ length: n }, (_, i) => a[i][i]);
  }
  const mimo = {
    channel(nr, nt, r) { const re = [], im = []; for (let i = 0; i < nr; i++) { re.push([]); im.push([]); for (let j = 0; j < nt; j++) { re[i].push(r.gauss() / Math.SQRT2); im[i].push(r.gauss() / Math.SQRT2); } } return { re, im, nr, nt }; },
    // eigenvalues of W = H Hᴴ (nr × nr Hermitian) via the real 2nr × 2nr embedding (each eigenvalue appears twice)
    gains(H) {
      const { re, im, nr, nt } = H, Wr = [], Wi = [];
      for (let i = 0; i < nr; i++) { Wr.push(new Float64Array(nr)); Wi.push(new Float64Array(nr)); for (let j = 0; j < nr; j++) { let a = 0, b = 0; for (let k = 0; k < nt; k++) { a += re[i][k] * re[j][k] + im[i][k] * im[j][k]; b += im[i][k] * re[j][k] - re[i][k] * im[j][k]; } Wr[i][j] = a; Wi[i][j] = b; } }
      const n2 = 2 * nr, S = []; for (let i = 0; i < n2; i++) S.push(new Float64Array(n2));
      for (let i = 0; i < nr; i++) for (let j = 0; j < nr; j++) { S[i][j] = Wr[i][j]; S[i + nr][j + nr] = Wr[i][j]; S[i][j + nr] = -Wi[i][j]; S[i + nr][j] = Wi[i][j]; }
      const ev = jacobiEig(S, n2).sort((a, b) => b - a), out = [];
      for (let i = 0; i < n2; i += 2) out.push(Math.max(0, (ev[i] + ev[i + 1]) / 2));
      return out.slice(0, Math.min(nr, nt));
    },
    capacityOf: (gains, nt, snr) => gains.reduce((s, l) => s + log2(1 + snr / nt * l), 0),
    // the channel gains of `draws` seeded channels; they do not depend on the SNR, so one set serves every SNR
    gainSet(nt, nr, draws, seed) { const r = rng(seed), set = []; for (let d = 0; d < draws; d++) set.push(mimo.gains(mimo.channel(nr, nt, r))); return set; },
    capOfSet: (set, nt, snrDb) => { const snr = undB(snrDb); let s = 0; for (const g of set) s += mimo.capacityOf(g, nt, snr); return s / set.length; },
    ergodic(nt, nr, snrDb, draws, seed) { const set = mimo.gainSet(nt, nr, draws, seed); return { C: mimo.capOfSet(set, nt, snrDb), sample: set[0] }; }
  };

  /* ═════════ 13 · frontier: spectral efficiencies and the SNR Shannon requires for them ═════════ */
  const frontier = {
    minSnrDb: eta => dB(Math.pow(2, eta) - 1),
    // bits per complex symbol of a coded constellation: log2(M) × code rate
    eta: (M, rate) => log2(M) * rate
  };

  /* ═════════ 14 · spec-sheet check ═════════ */
  const spec = {
    bound: (Bhz, streams, snrDb) => streams * Bhz * log2(1 + undB(snrDb)),
    snrNeeded: (rate, Bhz, streams) => dB(Math.pow(2, rate / (streams * Bhz)) - 1)
  };

  /* ═════════ the page's fixed seeds and the BER experiment plan (shared by app.js and the tests) ═════════ */
  const SEEDS = { coin: 7, randomText: 5, repetition: 100, qam: 1, amc: 7, mimo: 5, bsc: 1, bpFrame: 14 };
  const berPlan = {
    PTS: { uncoded: [0, 2, 4, 6, 8], ldpc: [0, 0.5, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3], conv: [0, 1, 2, 2.5, 3, 3.5, 4, 4.5, 5] },
    SEED: { ldpc: 1000, conv: 2000, uncoded: 3000 },
    MAXBITS: 1e6, MAXFE: 40, TARGET: 1e-4, CONV_FRAME: 256,
    frameBits: (scheme, k) => scheme === 'ldpc' ? k : scheme === 'conv' ? 256 : 1000,
    // point i of a scheme: stop at 40 frame errors or 10^6 information bits
    makeRun(scheme, i, code, iters = 50) {
      const fb = berPlan.frameBits(scheme, code ? code.k : 0);
      return ber.makeRun(scheme, berPlan.PTS[scheme][i], berPlan.SEED[scheme] + i, { code, maxFE: berPlan.MAXFE, maxFrames: Math.ceil(berPlan.MAXBITS / fb), frameLen: berPlan.CONV_FRAME, iters });
    },
    // the whole curve, as the page runs it: points in order, stopping after the first point with no errors
    runAll(scheme, code, iters = 50) {
      const out = [];
      for (let i = 0; i < berPlan.PTS[scheme].length; i++) { const run = berPlan.makeRun(scheme, i, code, iters); while (!run.done) ber.stepRun(run, 8); const r = ber.result(run); out.push(r); if (!r.errs) break; }
      return out;
    },
    /* Eb/N0 where a measured curve crosses `target`: log-linear interpolation between the last point above and the first
     * point below; a point with no errors stands in as 1/bits (an upper bound), so the crossing errs to the right */
    cross(res, target = 1e-4) {
      for (let i = 0; i + 1 < res.length; i++) {
        const a = res[i], b = res[i + 1], ya = a.ber, yb = b.errs ? b.ber : 1 / b.bits;
        if (ya >= target && yb < target) return a.ebn0dB + (b.ebn0dB - a.ebn0dB) * (Math.log10(ya) - Math.log10(target)) / (Math.log10(ya) - Math.log10(yb));
      }
      return null;
    }
  };

  return { SEEDS, berPlan, LN2, log2, clamp, dB, undB, rng, erfc, Q, H2, bisect, entropyOfCounts,
    ALPHA, toIdx, norm27, ngramModel, ngramView, runGen, trainNgramGen, crossEntropyAllGen, trainNgram, crossEntropy, pluginConditional, corpusSplit, guessOrder, machineRanks, shannonBounds,
    symbolCounts, huffman, textStats, arithEncoder, arithDecoder, arithEncode, arithDecode, quantise, arithStatic, coinHuffman, coinArith,
    adaptiveCodeGen, adaptiveCode, randomLetters, counting, bsc, awgn, friisLoss, noiseDensity_dBmHz, VOYAGER, voyagerLink, AU, wifi7, CQI4,
    binom, repetition, ebn0, biawgnCapacity, biawgnLimitDb, gaussLimitDb, hamming, gf, RS, gfSolve, polyDiv,
    conv, ldpcBuild, ldpcEncode, ldpcCheck, ldpcDecode, ber, polarBEC, polarStats, qam, amc, jacobiEig, mimo, frontier, spec };
}));
