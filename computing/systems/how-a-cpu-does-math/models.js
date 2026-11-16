/* How a CPU does math: the page's models.
   - An exact engine (BigInt): a real number given as a decimal string or fraction is rounded to any binary floating-point
     format (IEEE 754 binary64/32/16, bfloat16, TF32, OCP FP8 E4M3/E5M2, OCP MX FP6/FP4) under any rounding mode, with the
     bit encoding, the exact stored value and the exact error.
   - A fast engine (doubles): the same rounding for simulations. A double holds the exact product of two numbers of up to
     26 bits of precision, and TwoSum gives the exact error of a double sum, so add, multiply and fused multiply-add are
     rounded once and correctly for every format up to binary32 (tests/models.cjs checks it against the exact engine).
   - Chapter models: ulp and spacing, accumulation under each rounding mode, gradual underflow, cancellation in a variance,
     three summation algorithms, FMA and the exact error of a product, low-precision formats on a distribution, per-tensor
     and block scaling (OCP MX v1.0, NVFP4), SIMD masks and tails, lane-split reductions, an FMA issue simulation, a
     frequency-licence time simulation, and vector-length-agnostic loops with outer-product matrix units.
   Sourced figures sit in SRC with their source (BRIEF.md has the URL and the date each was opened). Anything chosen for
   a model rather than taken from a source is marked TUNED.
   UMD: window.CpuMathModels in the browser, module.exports in node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CpuMathModels = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ───────── seeded randomness ───────── */
  function rng(seed) { // mulberry32
    let a = seed >>> 0;
    return function () { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function gauss(r) { // Box–Muller, one value per call
    let u = 0; while (u === 0) u = r();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r());
  }

  /* ───────── formats ─────────
     kind: 'ieee' (top exponent reserved for inf and NaN), 'e4m3' (OCP FP8 E4M3: no inf, only S.1111.111 is NaN),
     'sat' (OCP MX FP6/FP4: every code is a finite number; conversions clamp). */
  function mkFormat(key, eb, mb, bias, kind, extra) {
    const F = Object.assign({ key, eb, mb, bias, kind, bits: 1 + eb + mb, p: mb + 1 }, extra || {});
    F.emin = 1 - bias;
    const topE = (1 << eb) - 1;
    F.emax = (kind === 'ieee' ? topE - 1 : topE) - bias;
    // largest finite significand (integer, p bits) at exponent emax
    F.maxSig = kind === 'e4m3' ? Math.pow(2, F.p) - 2 : Math.pow(2, F.p) - 1;
    F.max = F.maxSig * Math.pow(2, F.emax - mb);
    F.minNormal = Math.pow(2, F.emin);
    F.minSub = Math.pow(2, F.emin - mb);
    F.eps = Math.pow(2, -mb);        // gap between 1 and the next number
    F.inf = kind === 'ieee';
    F.maxM = BigInt(F.maxSig); F.maxE = F.emax - mb; // max = maxM · 2^maxE, exactly
    return F;
  }
  const FMT = {
    fp64: mkFormat('fp64', 11, 52, 1023, 'ieee'),
    fp32: mkFormat('fp32', 8, 23, 127, 'ieee'),
    tf32: mkFormat('tf32', 8, 10, 127, 'ieee'),
    fp16: mkFormat('fp16', 5, 10, 15, 'ieee'),
    bf16: mkFormat('bf16', 8, 7, 127, 'ieee'),
    e5m2: mkFormat('e5m2', 5, 2, 15, 'ieee'),
    e4m3: mkFormat('e4m3', 4, 3, 7, 'e4m3'),
    e3m2: mkFormat('e3m2', 3, 2, 3, 'sat'),
    e2m3: mkFormat('e2m3', 2, 3, 1, 'sat'),
    e2m1: mkFormat('e2m1', 2, 1, 1, 'sat')
  };
  const MODES = ['rne', 'rtz', 'ru', 'rd', 'sr'];
  // rounding of a magnitude: which way a mode goes for a value of sign s
  function magMode(mode, s) {
    if (mode === 'rtz') return 'down';
    if (mode === 'ru') return s > 0 ? 'up' : 'down';
    if (mode === 'rd') return s > 0 ? 'down' : 'up';
    return mode; // rne, rna, sr
  }

  /* ───────── exact engine (BigInt) ───────── */
  const bitlen = n => (n === 0n ? 0 : n.toString(2).length);
  const pow2 = k => 1n << BigInt(k);
  // exact value of a double as { s, m, e }: value = s · m · 2^e
  const DV = new DataView(new ArrayBuffer(8));
  function dyFromDouble(x) {
    DV.setFloat64(0, x);
    const hi = DV.getUint32(0), lo = DV.getUint32(4);
    const s = hi >>> 31 ? -1 : 1, E = (hi >>> 20) & 0x7ff;
    let m = (BigInt(hi & 0xfffff) << 32n) | BigInt(lo);
    if (E === 0x7ff) return null;
    if (E === 0) return { s, m, e: -1074 };
    return { s, m: m | (1n << 52n), e: E - 1075 };
  }
  // parse "0.1", "-2.5e-3", "1/3" → { s, N, D } (exact rational), or null
  function parseReal(str) {
    const t = String(str).trim().replace(/[−－]/g, '-').replace(/\s+/g, '');
    let m = t.match(/^([+-])?(\d+)\/(\d+)$/);
    if (m) { const N = BigInt(m[2]), D = BigInt(m[3]); if (D === 0n) return null; return { s: m[1] === '-' ? -1 : 1, N, D }; }
    m = t.match(/^([+-])?(\d*)(?:\.(\d*))?(?:[eE]([+-]?\d+))?$/);
    if (!m || (!m[2] && !m[3])) return null;
    const ip = m[2] || '', fp = m[3] || '', ex = m[4] ? parseInt(m[4], 10) : 0;
    if (Math.abs(ex) > 400) return null;
    let N = BigInt((ip + fp) || '0'), D = 10n ** BigInt(fp.length);
    if (ex > 0) N *= 10n ** BigInt(ex); else if (ex < 0) D *= 10n ** BigInt(-ex);
    return { s: m[1] === '-' ? -1 : 1, N, D };
  }
  /* Round the exact rational s·N/D to format F. Returns
     { cls: 'zero'|'sub'|'norm'|'inf'|'nan', s, m (BigInt), e, code (BigInt), inexact, overflow } with value s·m·2^e. */
  function roundRat(s, N, D, F, mode, u) {
    if (N === 0n) return encodeResult({ cls: 'zero', s, m: 0n, e: 0 }, F);
    let E = bitlen(N) - bitlen(D);
    if (E >= 0 ? N < (D << BigInt(E)) : (N << BigInt(-E)) < D) E--;
    const q = Math.max(E - F.mb, F.emin - F.mb);
    let num = N, den = D;
    if (q >= 0) den = D << BigInt(q); else num = N << BigInt(-q);
    let n = num / den; const rem = num - n * den;
    const mm = magMode(mode, s);
    let inc = false;
    if (rem !== 0n) {
      const c = 2n * rem - den; // >0 above half, 0 at half
      if (mm === 'up') inc = true;
      else if (mm === 'down') inc = false;
      else if (mm === 'rne') inc = c > 0n || (c === 0n && (n & 1n) === 1n);
      else if (mm === 'rna') inc = c >= 0n;
      else if (mm === 'sr') { const k = Math.max(0, bitlen(den) - 53); const fr = Number(rem >> BigInt(k)) / Number(den >> BigInt(k)); inc = (u || Math.random)() < fr; }
    }
    if (inc) n += 1n;
    const r = { s, m: n, e: q, inexact: rem !== 0n };
    if (n === 0n) return encodeResult(Object.assign(r, { cls: 'zero' }), F);
    // overflow: compare n·2^q with maxM·2^maxE
    if (cmpDy(n, q, F.maxM, F.maxE) > 0) {
      r.overflow = true;
      if (F.inf && mm !== 'down') return encodeResult(Object.assign(r, { cls: 'inf' }), F);
      return encodeResult(Object.assign(r, { cls: 'norm', m: F.maxM, e: F.maxE }), F);
    }
    r.cls = cmpDy(n, q, 1n, F.emin) < 0 ? 'sub' : 'norm';
    return encodeResult(r, F);
  }
  function cmpDy(m1, e1, m2, e2) { // compare m1·2^e1 with m2·2^e2 (m ≥ 0)
    const k = Math.min(e1, e2); const a = m1 << BigInt(e1 - k), b = m2 << BigInt(e2 - k);
    return a < b ? -1 : a > b ? 1 : 0;
  }
  function encodeResult(r, F) {
    const sb = r.s < 0 ? 1n : 0n, top = pow2(F.eb) - 1n;
    let Ef = 0n, M = 0n;
    if (r.cls === 'inf') { Ef = top; M = 0n; }
    else if (r.cls === 'nan') { Ef = top; M = F.kind === 'e4m3' ? pow2(F.mb) - 1n : pow2(F.mb - 1); }
    else if (r.cls !== 'zero') {
      let n = r.m, q = r.e;
      const k = bitlen(n) - F.p;
      if (k > 0) { n >>= BigInt(k); q += k; }
      if (bitlen(n) === F.p) { Ef = BigInt(q + F.mb + F.bias); M = n - pow2(F.mb); }
      else { // subnormal: q is emin - mb
        n = r.m << BigInt(r.e - (F.emin - F.mb)); Ef = 0n; M = n;
      }
    }
    r.code = (sb << BigInt(F.eb + F.mb)) | (Ef << BigInt(F.mb)) | M;
    return r;
  }
  // bits → value
  function decode(code, F) {
    code = BigInt(code);
    const M = code & (pow2(F.mb) - 1n), Ef = Number((code >> BigInt(F.mb)) & (pow2(F.eb) - 1n));
    const s = (code >> BigInt(F.eb + F.mb)) & 1n ? -1 : 1, top = (1 << F.eb) - 1;
    const r = { s, code };
    if (F.kind === 'ieee' && Ef === top) return Object.assign(r, M === 0n ? { cls: 'inf', m: 0n, e: 0 } : { cls: 'nan', m: 0n, e: 0 });
    if (F.kind === 'e4m3' && Ef === top && M === pow2(F.mb) - 1n) return Object.assign(r, { cls: 'nan', m: 0n, e: 0 });
    if (Ef === 0) return Object.assign(r, { cls: M === 0n ? 'zero' : 'sub', m: M, e: F.emin - F.mb });
    return Object.assign(r, { cls: 'norm', m: M | pow2(F.mb), e: Ef - F.bias - F.mb });
  }
  function fields(code, F) {
    const s = BigInt(code).toString(2).padStart(F.bits, '0');
    return { sign: s.slice(0, 1), exp: s.slice(1, 1 + F.eb), man: s.slice(1 + F.eb) };
  }
  const hexOf = (code, F) => '0x' + BigInt(code).toString(16).toUpperCase().padStart(Math.ceil(F.bits / 4), '0');
  // exact decimal expansion of m·2^e (always terminates). maxSig limits significant digits (then '…')
  function dyDecimal(m, e, maxSig) {
    if (m === 0n) return '0';
    let str;
    if (e >= 0) str = (m << BigInt(e)).toString();
    else {
      const k = -e, digits = (m * 5n ** BigInt(k)).toString().padStart(k + 1, '0');
      str = (digits.slice(0, digits.length - k) + '.' + digits.slice(digits.length - k)).replace(/0+$/, '').replace(/\.$/, '');
    }
    if (maxSig) {
      const lead = str.match(/^0\.0*/); const start = lead ? lead[0].length : 0;
      let count = 0, i = start;
      for (; i < str.length && count < maxSig; i++) if (str[i] !== '.') count++;
      if (i < str.length) str = str.slice(0, i) + '…';
    }
    return str;
  }
  function ratToNumber(N, D) { // nearest-ish double of N/D, N ≥ 0
    if (N === 0n) return 0;
    const k = bitlen(N) - bitlen(D) - 64;
    let a = N, b = D;
    if (k > 0) b <<= BigInt(k); else a <<= BigInt(-k);
    return Number(a / b) * Math.pow(2, k);
  }
  const dyToNumber = (s, m, e) => s * ratToNumber(e >= 0 ? m << BigInt(e) : m, e >= 0 ? 1n : pow2(-e));
  // exact sum of doubles (for references): returns { s, m, e }
  function exactSum(xs) {
    let acc = 0n, E = 0;
    const ds = xs.map(dyFromDouble);
    E = Math.min(0, ...ds.map(d => d.e));
    for (const d of ds) acc += BigInt(d.s) * (d.m << BigInt(d.e - E));
    return { s: acc < 0n ? -1 : 1, m: acc < 0n ? -acc : acc, e: E };
  }
  const exactSumNumber = xs => { const r = exactSum(xs); return dyToNumber(r.s, r.m, r.e); };

  /* ───────── fast engine (doubles) ───────── */
  function expOf(a) { // floor(log2 a) for finite a > 0
    DV.setFloat64(0, a); const E = (DV.getUint32(0) >>> 20) & 0x7ff;
    if (E === 0) return expOf(a * 18446744073709551616) - 64;
    return E - 1023;
  }
  /* round x + err (err: the exact remainder, |err| ≤ half an ulp of the double x, from TwoSum) to format F */
  function rnd(x, F, mode, err, u) {
    mode = mode || 'rne'; err = err || 0;
    if (x !== x) return NaN;
    if (x === 0 && err === 0) return x;
    if (x === 0) { x = err; err = 0; }
    if (!isFinite(x)) return F.inf ? x : (F.kind === 'e4m3' || F.kind === 'sat' ? Math.sign(x) * F.max : NaN);
    const s = x < 0 ? -1 : 1, a = Math.abs(x), e2 = err * s, mm = magMode(mode, s);
    const E = expOf(a);
    let q = Math.max(E - F.mb, F.emin - F.mb), Q = Math.pow(2, q);
    let n = a / Q, fl = Math.floor(n), fr = n - fl;
    // a is a normal power of two and the exact value lies just below it: use the finer quantum of the binade below
    if (fr === 0 && e2 < 0 && fl === Math.pow(2, F.mb) && q > F.emin - F.mb) { q--; Q /= 2; n = a / Q; fl = n; fr = 0; }
    let r;
    if (fr === 0) {
      if (e2 === 0) r = fl;
      else if (e2 > 0) r = mm === 'up' ? fl + 1 : fl;
      else r = mm === 'down' ? fl - 1 : fl;
    } else if (fr === 0.5 && e2 !== 0) {
      r = (mm === 'up' || ((mm === 'rne' || mm === 'rna') && e2 > 0)) ? fl + 1 : (mm === 'sr' ? (u() < 0.5 ? fl + 1 : fl) : fl);
    } else if (mm === 'down') r = fl;
    else if (mm === 'up') r = fl + 1;
    else if (mm === 'rne') r = fr > 0.5 ? fl + 1 : fr < 0.5 ? fl : (fl % 2 ? fl + 1 : fl);
    else if (mm === 'rna') r = fr >= 0.5 ? fl + 1 : fl;
    else r = (u || Math.random)() < fr ? fl + 1 : fl; // sr
    let v = r * Q;
    if (v > F.max) v = (F.inf && mm !== 'down') ? Infinity : F.max;
    return s * v;
  }
  function twoSum(a, b) { const s = a + b, bb = s - a, err = (a - (s - bb)) + (b - bb); return [s, err]; }
  const add = (a, b, F, mode, u) => { const [s, e] = twoSum(a, b); return rnd(s, F, mode, e, u); };
  const sub = (a, b, F, mode, u) => add(a, -b, F, mode, u);
  const mul = (a, b, F, mode, u) => rnd(a * b, F, mode, 0, u);          // exact product for p ≤ 26
  const fma = (a, b, c, F, mode, u) => { const [s, e] = twoSum(a * b, c); return rnd(s, F, mode, e, u); };
  const f32 = Math.fround;

  /* ───────── formatting (language-neutral; app.js passes lang for grouping) ───────── */
  function fmt(x, d, lang) {
    if (x == null || !isFinite(x)) return x === Infinity ? '∞' : x === -Infinity ? '−∞' : '—';
    const s = d == null ? (Math.abs(x) >= 100 ? 0 : Math.abs(x) >= 10 ? 1 : 2) : d;
    const k = Math.pow(10, s); x = Math.sign(x) * Math.round(Math.abs(x) * k * (1 + 1e-12)) / k;
    return Number(x).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US', { minimumFractionDigits: s, maximumFractionDigits: s }).replace('-', '−');
  }
  const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
  function sci(x, d) { // 1.19 × 10⁻⁷
    if (x === 0) return '0';
    if (!isFinite(x)) return x > 0 ? '∞' : x < 0 ? '−∞' : 'NaN';
    d = d == null ? 2 : d;
    let e = Math.floor(Math.log10(Math.abs(x))), m = x / Math.pow(10, e);
    if (Math.abs(+m.toFixed(d)) >= 10) { e++; m /= 10; }
    if (e >= -3 && e <= 5) return fmt(x, Math.max(0, d - e));
    return m.toFixed(d).replace('-', '−') + ' × 10' + String(e).split('').map(c => SUP[c]).join('');
  }
  const pow2s = k => '2' + String(k).split('').map(c => SUP[c]).join('');
  // a double printed with up to 17 significant digits, no exponent below 1e21
  const full = x => (Object.is(x, -0) ? '−0' : String(x).replace('-', '−'));

  /* ───────── sourced figures ───────── */
  const SRC = {
    // Agner Fog, Instruction tables (updated 2025-09-20): VFMADD...PS/PD latency 4 cycles; reciprocal throughput 0.5
    // (two per cycle) on Skylake (v,v,v), Zen 4 (xmm/ymm; zmm 1 per cycle) and Zen 5 (all widths).
    fma: { lat: 4, perCycle: 2, zen4zmmPerCycle: 1 },
    // Travis Downs, "Gathering Intel on Intel AVX-512 Transitions" (2020-01-17), Xeon W-2104 (Skylake-SP):
    // licence L0 3.2 GHz, L1 (AVX) 2.8 GHz, L2 (AVX-512) 2.4 GHz; ~10 µs halted per transition; ~680 µs to relax.
    skx: { l0: 3.2, l1: 2.8, l2: 2.4, haltUs: 10, relaxUs: 680, date: '2020-01-17' },
    // Chips and Cheese, "Zen 5's AVX-512 Frequency Behavior" (2025-02-28), Ryzen 9 9900X: ~5.7 GHz scalar; a heavy
    // 512-bit load/store sequence dips to ~4.7 GHz for ~a dozen ms; a register-only 512-bit FMA test stayed at 5.7 GHz.
    zen5: { scalar: 5.7, dip: 4.7, date: '2025-02-28' },
    // Remke & Breuer, "Hello SME!" (arXiv 2409.18779, 2024-09-27): Apple M4, SVL 512 bits; FP32 FMOPA 2009 GFLOPS on one
    // P-core with four ZA tiles, about 502 with one tile; each FP32 FMOPA performs 512 floating-point operations.
    m4: { svl: 512, gflops4: 2009, gflops1: 502, flopsPerFmopa: 512 },
    // Intel AMX (clang amxintrin.h; Intel ISA extensions reference): 8 tiles, each up to 16 rows × 64 bytes (1 KiB).
    // Intel's brochure (via Wikipedia): a 4th-gen Xeon core does 1024 BF16 or 2048 INT8 operations per cycle.
    amx: { tiles: 8, rows: 16, rowBytes: 64, bf16OpsPerCycle: 1024, int8OpsPerCycle: 2048 },
    // Arm SME (Arm developer blog, "Arm Scalable Matrix Extension introduction"): ZA is SVL/8 × SVL/8 bytes; four 32-bit
    // tiles; FP32 FMOPA: outer product of two SVL/32-element vectors into one (SVL/32)² tile. SVL 128 … 2048 bits.
    sme: { tiles32: 4, svlMin: 128, svlMax: 2048 },
    // NVIDIA, "Introducing NVFP4 …" (developer blog, 2025-06): E2M1 values, one E4M3 scale per 16 values, one FP32 scale
    // per tensor; NVIDIA counts about 4.5 bits per value.
    nvfp4: { block: 16 },
    // OCP MX v1.0 (2023-09): every concrete MX format has k = 32 elements per block and an E8M0 shared scale.
    mx: { block: 32, scaleBits: 8 }
  };

  /* ───────── ch1: encode a decimal number ───────── */
  function encode(str, fk, mode) {
    const F = FMT[fk], v = parseReal(str);
    if (!v) return { ok: false };
    const r = roundRat(v.s, v.N, v.D, F, mode || 'rne');
    return Object.assign(describe(r, F), { ok: true, input: v, err: errorOf(v, r) });
  }
  function fromCode(code, fk) { return describe(decode(code, FMT[fk]), FMT[fk]); }
  function describe(r, F) {
    const f = fields(r.code, F), out = { cls: r.cls, s: r.s, code: r.code, hex: hexOf(r.code, F), fields: f, fk: F.key };
    if (r.cls === 'inf') { out.exact = r.s < 0 ? '−∞' : '∞'; out.value = r.s * Infinity; return out; }
    if (r.cls === 'nan') { out.exact = 'NaN'; out.value = NaN; return out; }
    out.exact = (r.s < 0 ? '−' : '') + dyDecimal(r.m, r.e);
    out.value = r.cls === 'zero' ? (r.s < 0 ? -0 : 0) : dyToNumber(r.s, r.m, r.e);
    out.expField = parseInt(f.exp, 2); out.unbiased = r.cls === 'norm' ? out.expField - F.bias : F.emin;
    const k = bitlen(r.m) - F.p;
    out.sig = r.cls === 'norm' ? F.p : bitlen(r.m); // significant bits actually held
    out.m = r.m; out.e = r.e;
    out.ulp = Math.pow(2, (r.cls === 'norm' ? Math.max(out.unbiased, F.emin) : F.emin) - F.mb);
    void k;
    return out;
  }
  function errorOf(v, r) { // stored − input, as a double, plus relative error
    if (r.cls === 'inf' || r.cls === 'nan') return { abs: Infinity, rel: Infinity };
    // stored = s·m·2^e; input = s·N/D
    const sm = r.e >= 0 ? r.m << BigInt(r.e) : r.m, sd = r.e >= 0 ? 1n : pow2(-r.e);
    const num = BigInt(r.cls === 'zero' ? v.s : r.s) * sm * v.D - BigInt(v.s) * v.N * sd, den = sd * v.D;
    const abs = (num < 0n ? -1 : 1) * ratToNumber(num < 0n ? -num : num, den);
    const absExactStr = (num === 0n ? '0' : (num < 0n ? '−' : '') + ratDecimal(num < 0n ? -num : num, den, 6));
    const val = ratToNumber(v.N, v.D);
    return { abs, rel: val ? Math.abs(abs) / val : 0, str: absExactStr };
  }
  function ratDecimal(N, D, sig) { return sci(ratToNumber(N, D), sig - 1); }

  /* ───────── ch2: spacing ───────── */
  function ulpAt(x, fk) { const F = FMT[fk]; const a = Math.abs(x); if (a === 0) return F.minSub; return Math.pow(2, Math.max(expOf(a), F.emin) - F.mb); }
  // relative gap ulp(x)/x across magnitudes 2^lo … 2^hi (sampled), for the sawtooth chart
  function spacingCurve(fk, lo, hi, n) {
    const F = FMT[fk], pts = [];
    for (let i = 0; i <= n; i++) { const L = lo + (hi - lo) * i / n, x = Math.pow(2, L); if (x > F.max || x < F.minSub) continue; pts.push([L, ulpAt(x, fk) / x]); }
    return pts;
  }
  function plusOne(x, fk) { const F = FMT[fk], xs = rnd(x, F); return { xs, sum: add(xs, 1, F), ulp: ulpAt(xs, fk) }; }
  const firstLostInteger = fk => Math.pow(2, FMT[fk].p) + 1;
  // a clock counting seconds in format fk: at t seconds, the smallest step it can take
  function clockStep(t, fk) { return ulpAt(t, fk); }
  // first power of two (seconds) at which the step exceeds `frame` seconds
  function clockFails(frame, fk) { for (let k = 0; k < 200; k++) if (ulpAt(Math.pow(2, k), fk) > frame) return Math.pow(2, k); return Infinity; }

  /* ───────── ch3: adding the same number N times under each rounding mode ───────── */
  function accumulate(fk, delta, N, mode, seed, samples) {
    const F = FMT[fk], u = rng(seed || 7), d = rnd(delta, F);
    let s = 0; const pts = [[0, 0]], every = Math.max(1, Math.floor(N / (samples || 200)));
    for (let i = 1; i <= N; i++) { s = add(s, d, F, mode, u); if (i % every === 0 || i === N) pts.push([i, s]); }
    return { final: s, exact: d * N, d, pts };
  }
  // the first step at which a round-to-nearest sum of d stops changing (stagnation), if it does within N
  function stallPoint(fk, delta, N) {
    const F = FMT[fk], d = rnd(delta, F); let s = 0;
    for (let i = 1; i <= N; i++) { const t = add(s, d, F, 'rne'); if (t === s) return { step: i, value: s }; s = t; }
    return null;
  }

  /* ───────── ch4: toward zero ───────── */
  // the exact 1.7 · 2^-k stored as binary32 (with or without flush-to-zero)
  function towardZero(k, ftz) {
    const F = FMT.fp32, N = 17n, D = 10n * pow2(k);
    const r = roundRat(1, N, D, F, 'rne');
    const d = describe(r, F);
    const exact = ratToNumber(N, D);
    if (ftz && r.cls === 'sub') return { cls: 'flushed', value: 0, sig: 0, rel: 1, exact, hex: hexOf(0n, F) };
    return { cls: r.cls, value: d.value, sig: r.cls === 'zero' ? 0 : d.sig, rel: Math.abs(d.value - exact) / exact, exact, hex: d.hex, fields: d.fields, exactStr: d.exact };
  }
  // halve 1.0 in binary32 until it reaches zero: how many halvings
  function halvings(ftz) { let x = 1, n = 0; while (x !== 0) { x = f32(x / 2); if (ftz && x !== 0 && x < FMT.fp32.minNormal) x = 0; n++; } return n; }
  // a − b for two different numbers near the bottom of the normal range
  function gapPair(ftz) {
    const a = 1.5 * FMT.fp32.minNormal, b = 1.25 * FMT.fp32.minNormal; // both normal, exact in binary32
    let d = f32(a - b);
    if (ftz && d !== 0 && Math.abs(d) < FMT.fp32.minNormal) d = 0;
    return { a, b, d, inv: f32(1 / d) };
  }

  /* ───────── ch5: cancellation in a variance, and three ways to sum ───────── */
  function dataVar(offset, n, seed) { const r = rng(seed || 11), xs = []; for (let i = 0; i < n; i++) xs.push(f32(offset + gauss(r))); return xs; }
  function variance(offset, n, seed) {
    const xs = dataVar(offset, n || 1000, seed);
    n = xs.length;
    // exact reference from exact sums: (n Σx² − (Σx)²) / n²
    const ds = xs.map(dyFromDouble); let E = Math.min(...ds.map(d => d.e));
    let S = 0n, S2 = 0n;
    for (const d of ds) { const v = BigInt(d.s) * (d.m << BigInt(d.e - E)); S += v; S2 += v * v; }
    const num = BigInt(n) * S2 - S * S, den = BigInt(n) * BigInt(n) * pow2(-2 * E);
    const exact = ratToNumber(num, den);
    // one pass in binary32: (Σx² − (Σx)²/n) / n
    let s = 0, s2 = 0;
    for (const x of xs) { s = f32(s + x); s2 = f32(s2 + f32(x * x)); }
    const one = f32(f32(s2 - f32(f32(s * s) / n)) / n);
    // two passes: mean first, then squared deviations
    let mu = 0; for (const x of xs) mu = f32(mu + x); mu = f32(mu / n);
    let acc = 0; for (const x of xs) { const dd = f32(x - mu); acc = f32(acc + f32(dd * dd)); }
    const two = f32(acc / n);
    // Welford, one pass with a running mean
    let m = 0, M2 = 0;
    for (let i = 0; i < n; i++) { const x = xs[i], dl = f32(x - m); m = f32(m + f32(dl / (i + 1))); M2 = f32(M2 + f32(dl * f32(x - m))); }
    const wel = f32(M2 / n);
    return { exact, one, two, wel, n };
  }
  function dataSum(fk, N, seed) { const F = FMT[fk], r = rng(seed || 5), xs = []; for (let i = 0; i < N; i++) xs.push(rnd(r(), F)); return xs; }
  function sumNaive(xs, F) { let s = 0; for (const x of xs) s = add(s, x, F); return s; }
  function sumPairwise(xs, F, lo, hi) { lo = lo || 0; hi = hi == null ? xs.length : hi; if (hi - lo <= 8) { let s = 0; for (let i = lo; i < hi; i++) s = add(s, xs[i], F); return s; } const mid = (lo + hi) >> 1; return add(sumPairwise(xs, F, lo, mid), sumPairwise(xs, F, mid, hi), F); }
  function sumKahan(xs, F) { let s = 0, c = 0; for (const x of xs) { const y = sub(x, c, F), t = add(s, y, F); c = sub(sub(t, s, F), y, F); s = t; } return s; }
  function sums(fk, N, seed) {
    const F = FMT[fk], xs = dataSum(fk, N, seed), exact = exactSumNumber(xs);
    const naive = sumNaive(xs, F), pair = sumPairwise(xs, F), kahan = sumKahan(xs, F);
    const rel = v => Math.abs(v - exact) / exact;
    return { exact, naive, pair, kahan, rn: rel(naive), rp: rel(pair), rk: rel(kahan), u: F.eps / 2 };
  }

  /* ───────── ch6: FMA ───────── */
  // x² − y² with x = y, in binary32: separately rounded vs fused
  function squareDiff(x) {
    x = f32(x); const F = FMT.fp32;
    const p = f32(x * x), sep = f32(p - p), fused = fma(x, x, -p, F);
    // exact check: p + fused == x² exactly
    const dx = dyFromDouble(x), dp = dyFromDouble(p), df = dyFromDouble(fused);
    const E = Math.min(2 * dx.e, dp.e, fused === 0 ? 0 : df.e);
    const sq = (dx.m * dx.m) << BigInt(2 * dx.e - E), pv = BigInt(dp.s) * (dp.m << BigInt(dp.e - E)), fv = fused === 0 ? 0n : BigInt(df.s) * (df.m << BigInt(df.e - E));
    return { x, p, sep, fused, sqrtSep: Math.sqrt(sep), sqrtFused: fused < 0 ? NaN : Math.sqrt(fused), exactOk: pv + fv === sq, exactSq: dyDecimal(dx.m * dx.m, 2 * dx.e) };
  }
  // dot product of two seeded vectors in binary32: mul then add (two roundings per step) vs FMA (one)
  function dot(n, seed) {
    const r = rng(seed || 3), a = [], b = [];
    for (let i = 0; i < n; i++) { a.push(f32(r() * 2 - 1)); b.push(f32(r() * 2 - 1)); }
    const F = FMT.fp32; let s1 = 0, s2 = 0;
    for (let i = 0; i < n; i++) { s1 = f32(s1 + f32(a[i] * b[i])); s2 = fma(a[i], b[i], s2, F); }
    // exact: Σ a·b (each product exact in double; sum exactly)
    const exact = exactSumNumber(a.map((x, i) => x * b[i]));
    let sAbs = 0; for (let i = 0; i < n; i++) sAbs += Math.abs(a[i] * b[i]);
    return { exact, sep: s1, fused: s2, eSep: Math.abs(s1 - exact), eFused: Math.abs(s2 - exact), sAbs };
  }
  // average errors over many seeds (for the prose: how much FMA helps on average)
  function dotStats(n, seeds) { let a = 0, b = 0, w = 0; for (let k = 1; k <= seeds; k++) { const d = dot(n, 1000 + k); a += d.eSep; b += d.eFused; if (d.eFused < d.eSep) w++; } return { sep: a / seeds, fused: b / seeds, wins: w / seeds }; }

  /* ───────── ch7: formats ───────── */
  const TABLE_KEYS = ['fp64', 'fp32', 'tf32', 'fp16', 'bf16', 'e5m2', 'e4m3', 'e3m2', 'e2m3', 'e2m1'];
  function formatRow(fk) {
    const F = FMT[fk];
    return { fk, bits: F.bits, eb: F.eb, mb: F.mb, max: F.max, minNormal: F.minNormal, minSub: F.minSub, eps: F.eps,
      digits: F.p * Math.log10(2), binades: Math.log2(F.max) - Math.log2(F.minSub), inf: F.inf };
  }
  const formatTable = () => TABLE_KEYS.map(formatRow);
  // a Gaussian of width sigma, stored in format fk: what fraction vanishes, lands in subnormals, overflows; typical error
  function quantDist(fk, sigma, n, seed) {
    const F = FMT[fk], r = rng(seed || 21); n = n || 4096;
    let zero = 0, subn = 0, over = 0; const rels = [], hist = new Array(64).fill(0), H0 = -40;
    for (let i = 0; i < n; i++) {
      const x = gauss(r) * sigma; if (x === 0) continue;
      const q = rnd(x, F), a = Math.abs(x);
      const b = Math.floor(Math.log2(a)) - H0; if (b >= 0 && b < 64) hist[b]++;
      if (q === 0) zero++;
      else if (Math.abs(q) < F.minNormal) subn++;
      if (!isFinite(q) || (Math.abs(q) === F.max && a > F.max)) over++;
      rels.push(isFinite(q) ? Math.abs(q - x) / a : Infinity);
    }
    rels.sort((p, q) => p - q);
    return { zero: zero / n, sub: subn / n, over: over / n, med: rels[rels.length >> 1], hist, H0, lo: Math.log2(F.minSub), lon: Math.log2(F.minNormal), hi: Math.log2(F.max) };
  }

  /* ───────── ch8: scaling ───────── */
  function scaledData(outlier, seed) {
    const r = rng(seed || 31), xs = [];
    for (let i = 0; i < 512; i++) xs.push(f32(gauss(r)));
    [37, 150, 301, 444].forEach((k, j) => { xs[k] = f32((j % 2 ? -1 : 1) * outlier); });
    return xs;
  }
  const rneInt = x => { const f = Math.floor(x), d = x - f; return d > 0.5 ? f + 1 : d < 0.5 ? f : (f % 2 ? f + 1 : f); };
  const amaxOf = a => a.reduce((m, x) => Math.max(m, Math.abs(x)), 0);
  const SCHEMES = ['int8t', 'int8b', 'mxint8', 'mxfp8', 'mxfp6', 'mxfp4', 'nvfp4'];
  function quantize(xs, scheme) {
    const out = new Array(xs.length);
    const blocks = (k, f) => { for (let i = 0; i < xs.length; i += k) f(xs.slice(i, i + k), i); };
    const mxScale = (blk, emaxElem) => { const am = amaxOf(blk); return am === 0 ? 1 : Math.pow(2, expOf(am) - emaxElem); }; // OCP MX v1.0 §6.3
    if (scheme === 'int8t' || scheme === 'int8b') {
      blocks(scheme === 'int8t' ? xs.length : 32, (blk, i0) => { const s = f32(amaxOf(blk) / 127) || 1; blk.forEach((x, j) => { out[i0 + j] = Math.max(-127, Math.min(127, rneInt(x / s))) * s; }); });
    } else if (scheme === 'mxint8') { // INT8 elements: 1 sign, 1 integer, 6 fraction bits (value = int / 64); emax_elem 0
      blocks(32, (blk, i0) => { const X = mxScale(blk, 0); blk.forEach((x, j) => { out[i0 + j] = Math.max(-127, Math.min(127, rneInt(x / X * 64))) / 64 * X; }); });
    } else if (scheme === 'mxfp8' || scheme === 'mxfp6' || scheme === 'mxfp4') {
      const F = FMT[{ mxfp8: 'e4m3', mxfp6: 'e2m3', mxfp4: 'e2m1' }[scheme]];
      blocks(32, (blk, i0) => { const X = mxScale(blk, F.emax); blk.forEach((x, j) => { out[i0 + j] = rnd(x / X, F) * X; }); });
    } else if (scheme === 'nvfp4') { // per-tensor FP32 scale so block scales fit E4M3, then one E4M3 scale per 16 values
      const E = FMT.e2m1, S = FMT.e4m3, T = f32(amaxOf(xs) / (E.max * S.max)) || 1;
      blocks(16, (blk, i0) => { const sb = rnd(amaxOf(blk) / E.max / T, S) || S.minSub, sc = sb * T; blk.forEach((x, j) => { out[i0 + j] = rnd(x / sc, E) * sc; }); });
    }
    return out;
  }
  const BPE = { int8t: 8 + 32 / 512, int8b: 8 + 32 / 32, mxint8: 8 + 8 / 32, mxfp8: 8 + 8 / 32, mxfp6: 6 + 8 / 32, mxfp4: 4 + 8 / 32, nvfp4: 4 + 8 / 16 + 32 / 512 };
  const OUTLIER_AT = new Set([37, 150, 301, 444]);
  // quality on the 508 ordinary values (signal-to-quantisation-noise ratio in dB, and how many became 0), plus the worst
  // relative error on the four outliers. A whole-vector SQNR would be dominated by the outliers' energy and hide the rest.
  function scaleResult(scheme, outlier, seed) {
    const xs = scaledData(outlier, seed), q = quantize(xs, scheme);
    let sx = 0, se = 0, zeros = 0, nz = 0, outRel = 0;
    xs.forEach((x, i) => {
      if (OUTLIER_AT.has(i)) { outRel = Math.max(outRel, Math.abs(q[i] - x) / Math.abs(x)); return; }
      sx += x * x; se += (x - q[i]) * (x - q[i]); if (x !== 0) { nz++; if (q[i] === 0) zeros++; }
    });
    return { scheme, bpe: BPE[scheme], sqnr: se === 0 ? Infinity : 10 * Math.log10(sx / se), zeros: zeros / nz, outRel, q, xs };
  }
  const scaleAll = (outlier, seed) => SCHEMES.map(s => scaleResult(s, outlier, seed));

  /* ───────── ch9: SIMD lanes, masks, tails ───────── */
  const TYPE_BYTES = { f64: 8, f32: 4, f16: 2, i8: 1 };
  function simd(widthBits, type, N, thr, seed) {
    const lanes = widthBits / 8 / TYPE_BYTES[type];
    const r = rng(seed || 41), vals = []; for (let i = 0; i < lanes; i++) vals.push(Math.round((r() * 2 - 1) * 100) / 100);
    const mask = vals.map(v => v > thr);
    let mv = 0n; mask.forEach((b, i) => { if (b) mv |= 1n << BigInt(i); });
    const full = Math.floor(N / lanes), tail = N % lanes, vecs = full + (tail ? 1 : 0);
    const tailMask = tail ? (1n << BigInt(tail)) - 1n : 0n;
    const hex = v => '0x' + v.toString(16).toUpperCase().padStart(Math.max(1, Math.ceil(lanes / 4)), '0');
    // instructions per element / per vector for y = x > t ? x : 0 — scalar: load, compare, branch, store; vector: load,
    // compare into a mask register, masked move (zeroing), store
    return { lanes, vals, mask, maskHex: hex(mv), maskBits: mask.map(b => (b ? '1' : '0')).reverse().join(''), on: mask.filter(Boolean).length,
      full, tail, vecs, tailMaskHex: tail ? hex(tailMask) : '—', instScalar: 4 * N, instVec: 4 * vecs, ratio: (4 * N) / (4 * vecs) };
  }

  /* ───────── ch10: reductions split over lanes; alignment; strides ───────── */
  function laneSum(xs, L, F) {
    const part = new Array(L).fill(0);
    for (let i = 0; i < xs.length; i++) part[i % L] = add(part[i % L], xs[i], F);
    let w = L; const p = part.slice();
    while (w > 1) { w >>= 1; for (let j = 0; j < w; j++) p[j] = add(p[j], p[j + w], F); } // horizontal add: halve and add
    return p[0];
  }
  const LANES = [1, 2, 4, 8, 16, 32, 64];
  function laneSweep(fk, N, seed) {
    const F = FMT[fk], xs = dataSum(fk, N, seed), exact = exactSumNumber(xs);
    return LANES.map(L => { const v = laneSum(xs, L, F); return { L, v, rel: Math.abs(v - exact) / exact, exact }; });
  }
  // fraction of vector loads that cross a 64-byte line when a stream of `vb`-byte loads starts `off` bytes past a line
  function splitFraction(vb, off) { let split = 0; const n = 64; for (let i = 0; i < n; i++) { const a = off + i * vb; if (Math.floor(a / 64) !== Math.floor((a + vb - 1) / 64)) split++; } return split / n; }
  // distinct 64-byte lines touched by one vector of `lanes` elements of `eb` bytes at a stride of `stride` elements
  function linesPerVector(lanes, eb, stride) { const s = new Set(); for (let i = 0; i < lanes; i++) s.add(Math.floor(i * stride * eb / 64)); return s.size; }

  /* ───────── ch11: latency, throughput, frequency ───────── */
  // cycle-by-cycle issue of FMAs for a reduction with k independent accumulators
  function fmaSim(k, lat, units, loadsPerCycle, loadsPerFma, cycles) {
    cycles = cycles || 4000;
    const ready = new Array(k).fill(0); let done = 0, next = 0;
    for (let t = 0; t < cycles; t++) {
      let issued = 0, loads = loadsPerCycle, tried = 0;
      while (issued < units && tried < k) {
        const j = next % k;
        if (ready[j] <= t && loads >= loadsPerFma) { ready[j] = t + lat; loads -= loadsPerFma; issued++; done++; next++; tried = 0; }
        else { tried++; break; } // in-order across accumulators: chain j must go next
      }
    }
    const rate = done / cycles;
    const bound = Math.min(units, k / lat, loadsPerCycle / loadsPerFma);
    const lim = rate >= units - 1e-9 ? 'units' : (k / lat <= loadsPerCycle / loadsPerFma ? 'latency' : 'loads');
    return { rate, bound, lim, need: lat * units };
  }
  // the same issue rule, recording which accumulator each unit starts in each of the first `cycles` cycles (null = idle)
  function fmaTrace(k, lat, units, loadsPerCycle, loadsPerFma, cycles) {
    const ready = new Array(k).fill(0), rows = []; let next = 0;
    for (let t = 0; t < cycles; t++) {
      const row = new Array(units).fill(null); let issued = 0, loads = loadsPerCycle;
      while (issued < units) {
        const j = next % k;
        if (ready[j] <= t && loads >= loadsPerFma) { ready[j] = t + lat; loads -= loadsPerFma; row[issued++] = j; next++; } else break;
      }
      rows.push(row);
    }
    return rows;
  }
  const peakGflops = (ghz, lanes, units) => ghz * lanes * 2 * units;
  /* A program alternates scalar work and a short vector routine. With 256-bit code nothing changes the clock (TUNED
     assumption: the 256-bit routine is "light" and needs no licence). With 512-bit code the routine needs half the cycles,
     but on a Skylake-SP-like core the clock drops to the AVX-512 licence for the routine and stays there until ~680 µs
     after the last 512-bit instruction, with a ~10 µs halt at each upward transition (Downs 2020). Time-stepped. */
  function licenseSim(burstUs, periodUs, profile, periods) {
    periods = periods || 40;
    const P = profile === 'skx' ? { f0: SRC.skx.l0, f2: SRC.skx.l2, halt: SRC.skx.haltUs, relax: SRC.skx.relaxUs } : { f0: 1, f2: 1, halt: 0, relax: 0 };
    const vecWork = burstUs * P.f0 / 2;       // in cycles (×1e3 per µs·GHz cancels): 512-bit needs half the 256-bit cycles
    const scaWork = (periodUs - burstUs) * P.f0;
    let t = 0, lowUntil = -1;                  // time (µs) until which the clock stays at the licence level
    for (let k = 0; k < periods; k++) {
      // vector routine
      if (t > lowUntil) t += P.halt;          // transition up: halted
      t += vecWork / P.f2;
      lowUntil = t + P.relax;
      // scalar work: at f2 while t < lowUntil, then f0
      let w = scaWork;
      if (t < lowUntil) { const can = (lowUntil - t) * P.f2; if (w <= can) { t += w / P.f2; w = 0; } else { w -= can; t = lowUntil; } }
      t += w / P.f0;
    }
    const base = periods * periodUs;           // the 256-bit program at the base clock
    return { time: t, base, speedup: base / t };
  }

  // the clock over the first `spanUs` µs of the same program, as segments [t0, t1, GHz, kind] (kind: v vector, s scalar, h halt)
  function licenseTrace(burstUs, periodUs, profile, spanUs) {
    const P = profile === 'skx' ? { f0: SRC.skx.l0, f2: SRC.skx.l2, halt: SRC.skx.haltUs, relax: SRC.skx.relaxUs } : { f0: SRC.skx.l0, f2: SRC.skx.l0, halt: 0, relax: 0 };
    const vecWork = burstUs * P.f0 / 2, scaWork = (periodUs - burstUs) * P.f0, seg = [];
    let t = 0, lowUntil = -1;
    while (t < spanUs) {
      if (t > lowUntil && P.halt) { seg.push([t, t + P.halt, 0, 'h']); t += P.halt; }
      const tv = vecWork / P.f2; seg.push([t, t + tv, P.f2, 'v']); t += tv; lowUntil = t + P.relax;
      let w = scaWork;
      if (t < lowUntil) { const can = (lowUntil - t) * P.f2; const d = Math.min(w, can) / P.f2; seg.push([t, t + d, P.f2, 's']); t += d; w -= d * P.f2; }
      if (w > 1e-9) { seg.push([t, t + w / P.f0, P.f0, 's']); t += w / P.f0; }
    }
    return seg;
  }

  /* ───────── ch12: vector-length-agnostic loops and outer products ───────── */
  function vla(vlBits, N) {
    const lanes = vlBits / 32, trips = Math.ceil(N / lanes), rows = [];
    for (let k = 0; k < trips; k++) { const act = Math.min(lanes, N - k * lanes); rows.push(act); }
    return { lanes, trips, rows, last: rows.length ? rows[rows.length - 1] : 0, util: N / (trips * lanes) };
  }
  function outer(vlBits) {
    const n = vlBits / 32;
    return { fmla: n, fmopa: n * n, loadsFmla: 2 * n, loadsFmopa: 2 * n, perLoadFmla: n / (2 * n), perLoadFmopa: n * n / (2 * n) };
  }
  // one AMX TDPBF16PS on full tiles: C (16×16 FP32) += A (16 × 32 BF16) · B (32 × 16 BF16)
  function amxTile() { const m = SRC.amx.rows, kk = SRC.amx.rowBytes / 2, n = SRC.amx.rowBytes / 4; return { m, k: kk, n, macs: m * n * kk, elems: m * kk + kk * n }; }

  return { rng, gauss, FMT, MODES, TABLE_KEYS, SCHEMES, LANES, SRC, parseReal, roundRat, decode, fields, hexOf, dyDecimal, dyFromDouble,
    ratToNumber, dyToNumber, exactSum, exactSumNumber, rnd, add, sub, mul, fma, twoSum, expOf, fmt, sci, pow2s, full,
    encode, fromCode, ulpAt, spacingCurve, plusOne, firstLostInteger, clockStep, clockFails, accumulate, stallPoint,
    towardZero, halvings, gapPair, variance, dataSum, sumNaive, sumPairwise, sumKahan, sums, squareDiff, dot, dotStats,
    formatRow, formatTable, quantDist, scaledData, quantize, scaleResult, scaleAll, BPE, simd, laneSum, laneSweep,
    splitFraction, linesPerVector, fmaSim, fmaTrace, peakGflops, licenseSim, licenseTrace, vla, outer, amxTile };
});
