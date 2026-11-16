'use strict';
// Pins the page's models: format parameters against the standards' tables (IEEE 754-2019, OCP OFP8, OCP MX v1.0);
// the fast double-based rounding engine against the exact BigInt rational engine on seeded random operands for + − ×
// and FMA in four directed / nearest modes across six formats; encodings against the platform's own Float32Array;
// every number the prose binds ({=…}) against an independent derivation; the summation, variance, FMA, scaling,
// SIMD, pipeline and licence models on hand-worked cases; copy keys used by app.js; zh/en key parity; language hygiene
// of index.html; the registry.
// Run: node computing/systems/how-a-cpu-does-math/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const M = require(path.join(DIR, 'models.js'));
const B = require(path.join(DIR, 'bindings.cjs'))(M);
const load = l => { const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, `copy.${l}.js`), 'utf8'), ctx); return ctx.window.ESSAY_COPY[l]; };
const Z = load('zh'), E = load('en');
const html = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(DIR, 'app.js'), 'utf8');
const { FMT } = M;

let n = 0, fails = 0;
function check(name, got, want) { n++; if (got !== want) { fails++; console.error(`FAIL ${name}: got ${got}, expected ${want}`); } }
function ok(name, cond, info) { n++; if (!cond) { fails++; console.error(`FAIL ${name}${info ? ': ' + info : ''}`); } }

/* ── 1. format parameters, typed from the standards ── */
{
  const row = k => { const F = FMT[k]; return [F.bits, F.eb, F.mb, F.max, F.minNormal, F.minSub, F.eps].join(); };
  // IEEE 754-2019 Table 3.5: binary16 emax 15, binary32 emax 127, binary64 emax 1023
  check('binary16', row('fp16'), [16, 5, 10, 65504, 2 ** -14, 2 ** -24, 2 ** -10].join());
  check('binary32', row('fp32'), [32, 8, 23, (2 - 2 ** -23) * 2 ** 127, 2 ** -126, 2 ** -149, 2 ** -23].join());
  check('binary64 max = Number.MAX_VALUE, minSub = MIN_VALUE', [FMT.fp64.max, FMT.fp64.minSub, FMT.fp64.eps].join(), [Number.MAX_VALUE, Number.MIN_VALUE, Number.EPSILON].join());
  check('bfloat16', row('bf16'), [16, 8, 7, (2 - 2 ** -7) * 2 ** 127, 2 ** -126, 2 ** -133, 2 ** -7].join());
  // OCP OFP8 v1.0 Table 1 / Micikevicius et al. 2022 Table 1: E4M3 max 448 (S.1111.110), min normal 2^-6, min sub 2^-9; E5M2 max 57344, 2^-14, 2^-16
  check('FP8 E4M3', row('e4m3'), [8, 4, 3, 448, 2 ** -6, 2 ** -9, 2 ** -3].join());
  check('FP8 E5M2', row('e5m2'), [8, 5, 2, 57344, 2 ** -14, 2 ** -16, 2 ** -2].join());
  // OCP MX v1.0 Tables 2–3: FP6 E2M3 max 7.5, E3M2 max 28; FP4 E2M1 max 6, min sub 0.5
  check('FP6 E2M3', [FMT.e2m3.max, FMT.e2m3.minNormal, FMT.e2m3.minSub].join(), '7.5,1,0.125');
  check('FP6 E3M2', [FMT.e3m2.max, FMT.e3m2.minNormal, FMT.e3m2.minSub].join(), '28,0.25,0.0625');
  check('FP4 E2M1', [FMT.e2m1.max, FMT.e2m1.minNormal, FMT.e2m1.minSub].join(), '6,1,0.5');
  // the eight FP4 magnitudes
  const mags = []; for (let c = 0; c < 8; c++) { const d = M.fromCode(BigInt(c), 'e2m1'); mags.push(d.value); }
  check('FP4 E2M1 magnitudes', mags.join(), '0,0.5,1,1.5,2,3,4,6');
  check('E4M3 NaN is S.1111.111 only', [M.fromCode(0x7Fn, 'e4m3').cls, M.fromCode(0x7En, 'e4m3').value, M.fromCode(0x78n, 'e4m3').value].join(), 'nan,448,256');
  check('E5M2 0x7C is inf', M.fromCode(0x7Cn, 'e5m2').cls, 'inf');
}

/* ── 2. encodings against the platform ── */
{
  const f32hex = x => { const a = new Float32Array([x]); return '0x' + new Uint32Array(a.buffer)[0].toString(16).toUpperCase().padStart(8, '0'); };
  const r = M.rng(99);
  let bad = 0;
  for (let i = 0; i < 3000; i++) {
    const x = (r() - 0.5) * Math.pow(10, Math.floor(r() * 80) - 40);
    const s = x.toPrecision(12); const e = M.encode(s, 'fp32');
    if (e.hex !== f32hex(Number(s))) { bad++; if (bad < 4) console.error('  encode', s, e.hex, f32hex(Number(s))); }
  }
  check('encode(·, fp32) = Float32Array on 3,000 decimals', bad, 0);
  check('0.1 in binary32', M.encode('0.1', 'fp32').hex, '0x3DCCCCCD');
  check('0.1 in binary64 (exact decimal)', M.encode('0.1', 'fp64').exact, '0.1000000000000000055511151231257827021181583404541015625');
  check('0.1 in BF16', M.encode('0.1', 'bf16').hex + ' ' + M.encode('0.1', 'bf16').exact, '0x3DCD 0.10009765625');
  check('1/3 parses as a fraction', M.encode('1/3', 'fp32').hex, f32hex(1 / 3));
  check('overflow to inf in FP16', M.encode('70000', 'fp16').cls, 'inf');
  check('E4M3 saturates instead (RNE, conversions clamp)', M.encode('1000', 'e4m3').value, 448);
  check('tiny → 0 in FP16', M.encode('1e-9', 'fp16').cls, 'zero');
  check('subnormal in FP16', M.encode('1e-6', 'fp16').cls, 'sub');
}

/* ── 3. fast engine == exact engine (seeded random operands) ── */
{
  const r = M.rng(2024);
  const val = d => (d.cls === 'zero' ? 0 : M.dyToNumber(d.s, d.m, d.e));
  const randIn = (F, fk) => { for (;;) { const code = BigInt(Math.floor(r() * Math.pow(2, F.bits))); const d = M.fromCode(code, fk); if (d.cls !== 'nan' && d.cls !== 'inf') return d.value; } };
  const exactRound = (s, m, e, F, mode) => {
    if (m === 0n) return 0;
    const N = e >= 0 ? m << BigInt(e) : m, D = e >= 0 ? 1n : 1n << BigInt(-e);
    const q = M.roundRat(s, N, D, F, mode);
    return q.cls === 'inf' ? s * Infinity : val(q);
  };
  const dy = x => M.dyFromDouble(x);
  let bad = 0, total = 0;
  for (const fk of ['fp32', 'bf16', 'fp16', 'e5m2', 'e4m3', 'e2m1']) {
    const F = FMT[fk];
    for (const mode of ['rne', 'rtz', 'ru', 'rd']) {
      for (let i = 0; i < 1500; i++) {
        const a = randIn(F, fk), b = randIn(F, fk), c = randIn(F, fk);
        // a + b
        const S = M.exactSum([a, b]);
        const pa = dy(a), pb = dy(b), pc = dy(c);
        const prod = { s: pa.s * pb.s, m: pa.m * pb.m, e: pa.e + pb.e };
        // a·b + c exactly
        const k = Math.min(prod.e, pc.e), fm = BigInt(prod.s) * (prod.m << BigInt(prod.e - k)) + BigInt(pc.s) * (pc.m << BigInt(pc.e - k));
        const cases = [
          ['add', M.add(a, b, F, mode), exactRound(S.s, S.m, S.e, F, mode)],
          ['mul', M.mul(a, b, F, mode), exactRound(prod.s, prod.m, prod.e, F, mode)],
          ['fma', M.fma(a, b, c, F, mode), exactRound(fm < 0n ? -1 : 1, fm < 0n ? -fm : fm, k, F, mode)]
        ];
        for (const [op, got, want] of cases) { total++; if (!(got === want || (got !== got && want !== want))) { bad++; if (bad < 6) console.error(`  ${fk} ${mode} ${op}(${a}, ${b}${op === 'fma' ? ', ' + c : ''}) fast ${got} exact ${want}`); } }
      }
    }
  }
  check(`fast engine = exact engine on ${total.toLocaleString('en-US')} operations`, bad, 0);
  // the binade edge: x just below a power of two rounds down in RD (the case the TwoSum remainder exists for)
  check('rd(1 − 2^-60) in fp32 = 1 − 2^-24', M.add(1, -Math.pow(2, -60), FMT.fp32, 'rd'), 1 - Math.pow(2, -24));
  check('ru(1 + 2^-60) in fp32 = 1 + 2^-23', M.add(1, Math.pow(2, -60), FMT.fp32, 'ru'), 1 + Math.pow(2, -23));
  check('fp32 rne = Math.fround on sums', (() => { const q = M.rng(5); for (let i = 0; i < 5000; i++) { const a = Math.fround(q() * 1000), b = Math.fround(q()); if (M.add(a, b, FMT.fp32) !== Math.fround(a + b)) return false; } return true; })(), true);
  // stochastic rounding is unbiased: mean of many SR roundings of 1 + 0.3 ulp ≈ 1 + 0.3 ulp
  { const u = M.rng(1), F = FMT.bf16, x = 1 + 0.3 * F.eps; let s = 0; const N = 20000; for (let i = 0; i < N; i++) s += M.rnd(x, F, 'sr', 0, u); const m = (s / N - 1) / F.eps; ok('SR mean within 0.3 ± 0.02 ulp', Math.abs(m - 0.3) < 0.02, m); }
}

/* ── 4. bindings: every prose number, derived again independently ── */
{
  const fr = Math.fround;
  check('ch1.hex01', B['ch1.hex01'], '0x3DCCCCCD');
  check('ch1.E01 (0.1 = 1.6·2^-4 → 123)', B['ch1.E01'], String(-4 + 127));
  check('ch1.v01', B['ch1.v01'], '0.100000001490116119384765625');
  check('ch1.err01 = fround(0.1) − 0.1', B['ch1.err01'], M.sci(fr(0.1) - 0.1, 3));
  check('ch1.int', B['ch1.int'], '16,777,216');
  check('ch2.lost: first integer binary32 cannot hold', B['ch2.lost'], (() => { let k = 1; while (fr(k) === k) k++; return k.toLocaleString('en-US'); })());
  check('ch1.ratio = 2^28 (24 vs 53 bits, same position)', B['ch1.ratio'], (2 ** 28).toLocaleString('en-US'));
  check('ch2.ms17: ulp of 2^17 in binary32, ms', B['ch2.ms17'], String(2 ** (17 - 23) * 1000));
  check('ch2.h18: 2^18 s in hours', B['ch2.h18'], (2 ** 18 / 3600).toFixed(1));
  check('ch2.ms18', B['ch2.ms18'], String(2 ** (18 - 23) * 1000));
  ok('2^17 s step is below a 60 Hz frame and 2^18 s step is above it', 2 ** (17 - 23) < 1 / 60 && 2 ** (18 - 23) > 1 / 60);
  check('ch2.lonM: ulp at 100° in metres', B['ch2.lonM'], (2 ** (6 - 23) * 111320).toFixed(2));
  // BF16 by hand: round a double to 8 significant bits, ties to even
  const bf = x => { if (x === 0) return 0; const e = Math.floor(Math.log2(x)), q = 2 ** (e - 7), n = x / q, f = Math.floor(n), d = n - f; return (d > 0.5 || (d === 0.5 && f % 2) ? f + 1 : f) * q; };
  { let s = 0, stall = 0; for (let i = 1; i <= 1000; i++) { const t = bf(s + 1); if (t === s && !stall) stall = i; s = t; } check('ch3.stall (hand BF16)', B['ch3.stall'], String(s)); check('BF16 stalls at step 257', stall, 257); }
  { let s = 0; for (let i = 0; i < 1000; i++) { const x = s + 1, e = Math.floor(Math.log2(x)), q = 2 ** (e - 7); s = Math.ceil(x / q) * q; } check('ch3.ru (hand BF16, round up)', B['ch3.ru'], s.toLocaleString('en-US')); }
  { let s = 0; const d = fr(0.1); for (let i = 0; i < 10000; i++) s = fr(s + d); check('ch3.f32rne = fround loop', B['ch3.f32rne'], s.toFixed(4)); }
  { let x = 1, k = 0; while (x !== 0) { x = fr(x / 2); k++; } check('ch4.halv', B['ch4.halv'], String(k)); }
  { let x = 1, k = 0; while (x !== 0) { x = fr(x / 2); if (x < 2 ** -126) x = 0; k++; } check('ch4.halvFtz', B['ch4.halvFtz'], String(k)); }
  check('ch4.sig140: 1.7·2^-140 keeps 149 − 140 + 1 bits', B['ch4.sig140'], String(149 - 140 + 1));
  check('ch4.sig149', B['ch4.sig149'], '2');
  // variance by an independent route: doubles of the same binary32 data, compensated
  { const V = M.variance(3000, 1000); ok('ch5: two-pass within 1e-5 of exact; one-pass off by > 100%', Math.abs(V.two - V.exact) / V.exact < 1e-5 && Math.abs(V.one - V.exact) / V.exact > 1); ok('ch5.one4 negative', M.variance(10000, 1000).one < 0); }
  { const xs = M.dataSum('bf16', 1000); let s = 0; for (const x of xs) s += x; check('ch5.sumEx (double sum is exact here)', B['ch5.sumEx'], s.toFixed(2)); check('ch5.sumPair is the BF16 nearest the exact sum', B['ch5.sumPair'], String(bf(s))); }
  { const x = fr(1.1), p = fr(x * x), err = x * x - p; check('ch6.fused = x² − fround(x²) (exact in double)', B['ch6.fused'], M.sci(err, 3)); }
  { let neg = 0; for (let i = 0; i < 1000; i++) { const x = fr(1 + i / 1000); if (x * x - fr(x * x) < 0) neg++; } check('ch6.negN', B['ch6.negN'], String(neg)); }
  check('ch7.e4max / e5max / fp16max', [B['ch7.e4max'], B['ch7.e5max'], B['ch7.fp16max']].join(' '), '448 57,344 65,504');
  check('ch8.e4span = log2(448 / 2^-9)', B['ch8.e4span'], (Math.log2(448) + 9).toFixed(1));
  { const r = M.simd(512, 'f32', 1000, 0.3); let m = 0; r.vals.forEach((v, i) => { if (v > 0.3) m |= 1 << i; }); check('ch9.mask', B['ch9.mask'], '0x' + m.toString(16).toUpperCase().padStart(4, '0')); }
  check('ch9.vecs / tail / tm', [B['ch9.vecs'], B['ch9.tail'], B['ch9.tm']].join(), [Math.ceil(1000 / 16), 1000 % 16, '0x00FF'].join());
  check('ch10.split64 / split32 (offset 4)', [B['ch10.split64'], B['ch10.split32']].join(), '100%,50%');
  check('ch10.lines2 / lines16', [B['ch10.lines2'], B['ch10.lines16']].join(), [Math.ceil(16 * 2 * 4 / 64), 16].join());
  check('ch11.k1 = 1 / (lat × units)', B['ch11.k1'], (100 / (4 * 2)).toFixed(1) + '%');
  check('ch11.peak = 5.7 × 16 × 2 × 2', B['ch11.peak'], (5.7 * 16 * 2 * 2).toFixed(1));
  check('ch12.trips / last', [B['ch12.trips'], B['ch12.last']].join(), [Math.ceil(100 / 16), 100 % 16].join());
  check('ch12.mo / mv / per', [B['ch12.mo'], B['ch12.mv'], B['ch12.per']].join(), [16 * 16, 16, 16 * 16 / 32].join());
  check('ch12.amx = 16 × 16 × 32', B['ch12.amx'], (16 * 16 * 32).toLocaleString('en-US'));
  check('ch11.m4one ≈ m4 / 4', Math.round(M.SRC.m4.gflops4 / M.SRC.m4.gflops1), 4);
  // every bound key is used by the prose of zh (the build fails otherwise) and the prose values match
  for (const [k, v] of Object.entries(B)) if (!k.startsWith('dg.')) { const hit = Object.values(Z).some(s => s.includes(v)); ok(`binding ${k} appears in the zh copy`, hit, v); }
}

/* ── 5. models on hand-worked cases ── */
{
  // rounding modes order: rd ≤ rne ≤ ru, |rtz| ≤ |x|
  const r = M.rng(8); let bad = 0;
  for (let i = 0; i < 2000; i++) { const x = (r() - 0.5) * 1e3, F = FMT.bf16, a = M.rnd(x, F, 'rd'), b = M.rnd(x, F), c = M.rnd(x, F, 'ru'), z = M.rnd(x, F, 'rtz'); if (!(a <= b && b <= c && Math.abs(z) <= Math.abs(x))) bad++; }
  check('rd ≤ rne ≤ ru, |rtz| ≤ |x|', bad, 0);
  check('stall points: FP16 adding 1 stops at 2048, FP32 at 16,777,216', [M.stallPoint('fp16', 1, 5000).value, M.stallPoint('fp32', 1, 2e7).value].join(), '2048,16777216');
  // summation: pairwise and Kahan are within 2 ulps of the exact sum; naive is not, in BF16 at n = 1000
  { const s = M.sums('bf16', 1000); ok('pairwise and Kahan within 2 ulps (BF16)', Math.abs(s.pair - s.exact) <= 2 * M.ulpAt(s.exact, 'bf16') && Math.abs(s.kahan - s.exact) <= 2 * M.ulpAt(s.exact, 'bf16')); ok('naive stalls at 256', s.naive === 256); }
  // squareDiff exactness check: p + fused == x² for every x tried
  { let bad2 = 0; for (let i = 0; i < 1000; i++) if (!M.squareDiff(1 + i / 1000).exactOk) bad2++; check('p + fma(x, x, −p) = x² exactly (1,000 x)', bad2, 0); }
  // OCP MX v1.0 §6.3 scale: X = 2^(floor(log2 amax) − emax_elem)
  { const blk = [0.1, -3, 5.5, 0.01]; const q = M.quantize(blk.concat(new Array(28).fill(0)), 'mxfp4'); ok('MXFP4 block with amax 5.5: scale 2^(2−2) = 1, 5.5 → 6 (RNE tie to even), −3 → −3', q[2] === 6 && q[1] === -3 && q[0] === 0); }
  { const xs = M.scaledData(1000); const q = M.quantize(xs, 'mxfp8'); check('MXFP8: scale 2^(9 − 8) = 2, 1000/2 = 500 > 448 clamps (OCP MX §6.3), so the outlier is stored as 896', q[37], 896); }
  check('MXFP8 stays near 31 dB for every outlier size', [1, 10, 100, 1000].every(a => Math.abs(M.scaleResult('mxfp8', a).sqnr - 31) < 1.5), true);
  check('INT8 per tensor collapses at outlier 1000 (all ordinary values → 0)', M.scaleResult('int8t', 1000).zeros, 1);
  check('bits per element: MXFP4 4.25, NVFP4 4.5625 (incl. per-tensor FP32)', [M.BPE.mxfp4, M.BPE.nvfp4].join(), '4.25,4.5625');
  // FMA pipeline: rate = min(units, k/lat, loads/loadsPerFma)
  let bad3 = 0;
  for (let k = 1; k <= 16; k++) for (const u of [1, 2]) for (const lpf of [1, 2]) { const r2 = M.fmaSim(k, 4, u, 2, lpf); if (Math.abs(r2.rate - Math.min(u, k / 4, 2 / lpf)) > 1e-3) bad3++; }
  check('fmaSim rate = min(units, k / lat, loads / per FMA)', bad3, 0);
  // licence model: break-even near half the time in vector code; no-throttle profile = 1 / (1 − f/2)
  { let be = 0; for (let b = 5; b <= 1000; b += 5) if (M.licenseSim(b, 1000, 'skx').speedup >= 1) { be = b; break; } ok('break-even burst between 450 and 550 µs per ms', be >= 450 && be <= 550, be); }
  ok('no-throttle speedup = 1 / (1 − f/2)', [0.02, 0.3, 0.9].every(fv => Math.abs(M.licenseSim(fv * 1000, 1000, 'none').speedup - 1 / (1 - fv / 2)) < 1e-9));
  check('vla(128, 10) rows', M.vla(128, 10).rows.join(), '4,4,2');
  check('vla(2048, 10): one trip, 10 of 64', [M.vla(2048, 10).trips, M.vla(2048, 10).lanes].join(), '1,64');
}

/* ── 6. copy: keys used by app.js exist; zh/en parity; language hygiene ── */
{
  const used = new Set([...app.matchAll(/\bt\('([a-z][\w.]*)'/g)].map(m => m[1]));
  for (const pre of ['ch4.cls.', 'ch4.say.']) for (const s of ['norm', 'sub', 'zero', 'flushed']) used.add(pre + s);
  for (const s of M.SCHEMES) used.add('ch8.s.' + s);
  for (const s of ['latency', 'units', 'loads']) { used.add('ch11.fma.lim.' + s); used.add('ch11.fma.say.' + s); }
  const missing = [...used].filter(k => !k.endsWith('.') && !(k in Z));
  check('keys app.js uses exist in zh', missing.join(), '');
  check('zh and en have the same keys', Object.keys(Z).sort().join() === Object.keys(E).sort().join(), true);
  const ph = s => (String(s).match(/\{[a-zA-Z_]\w*\}/g) || []).sort().join();
  const bad = Object.keys(Z).filter(k => ph(Z[k]) !== ph(E[k]));
  check('runtime placeholders match in zh and en', bad.join(), '');
  check('en is translated (meta.en native, no [EN pending] left)', E['meta.en'], 'native');
  check('no untranslated [EN pending] strings in en', Object.keys(E).filter(k => /EN pending/.test(E[k])).join(), '');
  check('no Chinese in any en string', Object.keys(E).filter(k => /[㐀-鿿]/.test(E[k])).join(), '');
  check('zh is the native language', Z['meta.en'], 'native');
  // no Chinese in index.html outside pre-filled copy: strip data-i18n* element contents, aria-labels, title and meta
  let h = html.replace(/<div[^>]*id="langToggle"[\s\S]*?<\/div>/, '').replace(/<title>[\s\S]*?<\/title>/, '').replace(/<meta[^>]*>/g, '').replace(/ aria-label="[^"]*"/g, '');
  for (let i = 0; i < 4; i++) h = h.replace(/(<(\w+)[^>]*data-i18n(?:-html)?="[^"]*"[^>]*>)[\s\S]*?(<\/\2>)/g, '$1$3');
  h = h.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
  // the provenance label is bilingual by design (rendered from page-provenance.json since registration, 2026-11-16):
  // exactly one, and only that block is exempt
  check('exactly one provenance label', (h.match(/<details class="page-provenance"/g) || []).length, 1);
  h = h.replace(/<details class="page-provenance"[\s\S]*?<\/details>/, '');
  const cjk = h.match(/[^\n]{0,30}[㐀-鿿][^\n]{0,30}/g) || [];
  check('no Chinese in index.html outside pre-filled copy', cjk.slice(0, 3).join(' | '), '');
  // the partials are language-neutral
  for (const f of fs.readdirSync(path.join(DIR, 'figures'))) { const s = fs.readFileSync(path.join(DIR, 'figures', f), 'utf8'); ok(`figures/${f} has no Chinese`, !/[㐀-鿿]/.test(s)); }
  // every diagram text carries a key or is language-neutral (digits, symbols, Latin format names)
  const raw = [...fs.readdirSync(path.join(DIR, 'figures')).filter(f => f.startsWith('dg-')).map(f => fs.readFileSync(path.join(DIR, 'figures', f), 'utf8')).join('').matchAll(/<text [^>]*>([^<]+)<\/text>/g)].map(m => m[1]);
  ok('literal diagram text is only digits, symbols and format names', raw.every(s => /^[0-9A-Z.×−+ ⁰¹²³⁴⁵⁶⁷⁸⁹⁻,]+$/.test(s)), raw.filter(s => !/^[0-9A-Z.×−+ ⁰¹²³⁴⁵⁶⁷⁸⁹⁻,]+$/.test(s)).join(' | '));
}

/* ── 7. registry ── */
{
  const R = JSON.parse(fs.readFileSync(path.join(DIR, 'REGISTRY.json'), 'utf8'));
  check('registry desc = doc.desc', R.desc.zh, Z['doc.desc']);
  check('registry title = zh title', R.title.zh, 'CPU 是怎么算小数的，又怎么一次算一排');
  check('registry desc = en doc.desc', R.desc.en, E['doc.desc']);
  check('registry en title is the en hero title', R.title.en, E['hero.title']);
  for (const c of R.concepts) ok(`concept ${c.id} anchor ${c.anchor} exists`, html.includes(`id="${c.anchor.slice(1)}"`));
  const all = R.concepts.flatMap(c => [...new Set([...c.aliases.zh, ...c.aliases.en].map(a => a.toLowerCase()))]);
  check('no alias owned by two concepts of this page', all.filter((a, i) => all.indexOf(a) !== i).join(), '');
  // words that sibling pages own (specs/atlas-search-index.md: one word, one owner)
  // 浮点数 / IEEE 754 moved here from switches-that-compute #ch10 at registration (2026-11-16): #ch1 owns them, switches must not.
  { const c1 = R.concepts.find(c => c.anchor === '#ch1'), mine = [...c1.aliases.zh, ...c1.aliases.en].map(a => a.toLowerCase());
    const sw = JSON.parse(fs.readFileSync(path.join(DIR, '..', 'switches-that-compute', 'REGISTRY.json'), 'utf8')).concepts.flatMap(c => [...c.aliases.zh, ...c.aliases.en].map(a => a.toLowerCase()));
    for (const w of ['浮点数', 'ieee 754', 'floating point']) { check('#ch1 owns ' + w, mine.includes(w), true); check('switches-that-compute no longer has ' + w, sw.includes(w), false); } }
  const theirs = ['浮点误差', '精度丢失', 'rounding error', '0.1+0.2', 'double vs float', 'fp8 e4m3 e5m2', 'fp8 formats', 'tensor core', 'throughput vs latency', '吞吐量', 'throughput', '权重量化', 'avx10'];
  check('no alias that a sibling owns', all.filter(a => theirs.includes(a)).join(), '');
}

console.log(`${n - fails}/${n} checks passed`);
if (fails) process.exit(1);
