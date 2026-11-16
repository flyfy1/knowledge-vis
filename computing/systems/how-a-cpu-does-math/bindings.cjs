// Numbers in the prose and on the diagrams, computed from models.js at build time ({=name} in content.*.md).
// Language-neutral: the same string goes into both languages. tests/models.cjs re-derives the key ones independently.
module.exports = M => {
  const b = {};
  const f = (x, d) => M.fmt(x, d, 'en');
  const pct = (x, d) => f(x * 100, d) + '%';

  /* ch1 */
  const e = M.encode('0.1', 'fp32'), ed = M.encode('0.1', 'fp64');
  b['ch1.hex01'] = e.hex;
  b['ch1.E01'] = String(e.expField);
  b['ch1.v01'] = e.exact;
  b['ch1.err01'] = M.sci(e.err.abs, 3);
  b['ch1.rel01'] = M.sci(e.err.rel, 2);
  b['ch1.v01d'] = ed.exact;
  b['ch1.int'] = f(M.firstLostInteger('fp32') - 1, 0);
  b['dg.f32.bs'] = e.fields.sign;
  b['dg.f32.be'] = e.fields.exp;
  b['dg.f32.bm'] = e.fields.man;
  b['dg.f32.ev'] = `${e.expField} − 127 = ${String(e.unbiased).replace('-', '−')}`;
  const sig = Number(e.m) / Math.pow(2, 23);
  b['dg.f32.mv'] = `1.f = ${sig.toPrecision(17).replace(/0+$/, '')}`;
  b['dg.f32.val'] = `(+1) × ${sig.toPrecision(8)}… × 2⁻⁴ = ${e.exact.slice(0, 13)}…`;
  b['dg.f32.val1'] = `(+1) × ${sig.toPrecision(8)}… × 2⁻⁴`;
  b['dg.f32.val2'] = `= ${e.exact.slice(0, 13)}…`;
  b['ch1.ratio'] = f(Math.round(e.err.abs / ed.err.abs), 0);

  /* ch2 */
  const h = s => s / 3600;
  b['ch2.h17'] = f(h(2 ** 17), 1); b['ch2.ms17'] = f(M.clockStep(2 ** 17, 'fp32') * 1000, 3);
  const fail = M.clockFails(1 / 60, 'fp32');
  b['ch2.h18'] = f(h(fail), 1); b['ch2.ms18'] = f(M.clockStep(fail, 'fp32') * 1000, 2);
  b['ch2.eps32'] = M.pow2s(-23) + ' ≈ ' + M.sci(M.FMT.fp32.eps, 2);
  b['ch2.eps64'] = M.pow2s(-52) + ' ≈ ' + M.sci(M.FMT.fp64.eps, 2);
  b['ch2.u32'] = M.sci(M.FMT.fp32.eps / 2, 2); b['ch2.u64'] = M.sci(M.FMT.fp64.eps / 2, 2);
  b['ch2.lost'] = f(M.firstLostInteger('fp32'), 0);
  const lonUlp = M.ulpAt(100, 'fp32');
  b['ch2.lonUlp'] = M.sci(lonUlp, 2); b['ch2.lonM'] = f(lonUlp * 111320, 2); // 111.32 km per degree at the equator

  /* ch3: BF16, add 1 a thousand times; binary32, add 0.1 ten thousand times */
  const acc = (fk, d, n, m) => M.accumulate(fk, d, n, m, 7, 10).final;
  b['ch3.stall'] = f(acc('bf16', 1, 1000, 'rne'), 0);
  const ru = acc('bf16', 1, 1000, 'ru');
  b['ch3.ru'] = f(ru, 0); b['ch3.ruX'] = f(ru / 1000, 1);
  b['ch3.sr'] = f(acc('bf16', 1, 1000, 'sr'), 0);
  b['ch3.f32rne'] = f(acc('fp32', 0.1, 10000, 'rne'), 4);
  b['ch3.f32rtz'] = f(acc('fp32', 0.1, 10000, 'rtz'), 4);
  b['ch3.f32ex'] = f(M.accumulate('fp32', 0.1, 10, 'rne').exact * 1000, 4); // the stored 0.1 (binary32) times 10,000

  /* ch4 */
  const z140 = M.towardZero(140), z149 = M.towardZero(149);
  b['ch4.sig140'] = String(z140.sig); b['ch4.rel140'] = M.sci(z140.rel, 1); b['ch4.sig149'] = String(z149.sig);
  b['ch4.halv'] = String(M.halvings(false)); b['ch4.halvFtz'] = String(M.halvings(true));

  /* ch5 */
  const V = M.variance(3000, 1000), V4 = M.variance(10000, 1000);
  b['ch5.off'] = f(3000, 0); b['ch5.ex'] = f(V.exact, 4); b['ch5.two'] = f(V.two, 4); b['ch5.one'] = f(V.one, 2);
  b['ch5.one4'] = f(V4.one, 0);
  const S = M.sums('bf16', 1000);
  b['ch5.N'] = f(1000, 0); b['ch5.sumEx'] = f(S.exact, 2); b['ch5.sumNaive'] = f(S.naive, 0); b['ch5.sumPair'] = f(S.pair, 0);

  /* ch6 */
  const q = M.squareDiff(1.1);
  b['ch6.x'] = M.dyDecimal(M.dyFromDouble(q.x).m, M.dyFromDouble(q.x).e);
  b['ch6.fused'] = M.sci(q.fused, 3);
  let negN = 0, negX = null;
  for (let i = 0; i < 1000; i++) { const r = M.squareDiff(1 + i / 1000); if (r.fused < 0) { negN++; if (negX == null) negX = 1 + i / 1000; } }
  b['ch6.negN'] = String(negN); b['ch6.negX'] = String(negX);
  const ds = M.dotStats(1000, 1000);
  b['ch6.eSep'] = M.sci(ds.sep, 2); b['ch6.eFus'] = M.sci(ds.fused, 2); b['ch6.wins'] = pct(ds.wins, 0);

  /* ch7 */
  b['ch7.fp16max'] = f(M.FMT.fp16.max, 0); b['ch7.fp16min'] = M.sci(M.FMT.fp16.minNormal, 2);
  b['ch7.e5max'] = f(M.FMT.e5m2.max, 0); b['ch7.e4max'] = f(M.FMT.e4m3.max, 0);
  const q16 = M.quantDist('fp16', 1e-7), qb = M.quantDist('bf16', 1e-7), q4 = M.quantDist('e4m3', 1000), q5 = M.quantDist('e5m2', 1000);
  b['ch7.fp16zero'] = pct(q16.zero, 0); b['ch7.fp16med'] = pct(q16.med, 0); b['ch7.bf16med'] = pct(qb.med, 2);
  b['ch7.e4over'] = pct(q4.over, 0); b['ch7.e5med'] = pct(q5.med, 1);

  /* ch8: outlier 100 */
  const R = Object.fromEntries(M.scaleAll(100).map(r => [r.scheme, r]));
  b['ch8.A'] = '100';
  b['ch8.int8tS'] = f(R.int8t.sqnr, 1); b['ch8.int8tZ'] = pct(R.int8t.zeros, 0); b['ch8.int8bS'] = f(R.int8b.sqnr, 1);
  b['ch8.mxfp8S'] = f(R.mxfp8.sqnr, 1); b['ch8.e4span'] = f(M.formatRow('e4m3').binades, 1);

  /* ch9 */
  const sd = M.simd(512, 'f32', 1000, 0.3);
  b['ch9.on'] = String(sd.on); b['ch9.mask'] = sd.maskHex; b['ch9.vecs'] = String(sd.vecs); b['ch9.tail'] = String(sd.tail); b['ch9.tm'] = sd.tailMaskHex;

  /* ch10 */
  b['ch10.split64'] = pct(M.splitFraction(64, 4), 0); b['ch10.split32'] = pct(M.splitFraction(32, 4), 0);
  b['ch10.lines2'] = String(M.linesPerVector(16, 4, 2)); b['ch10.lines16'] = String(M.linesPerVector(16, 4, 16));
  const LB = Object.fromEntries(M.laneSweep('bf16', 4096).map(r => [r.L, r]));
  b['ch10.l1'] = f(LB[1].v, 0); b['ch10.l8'] = f(LB[8].v, 0); b['ch10.l16'] = f(LB[16].v, 0); b['ch10.ex'] = f(LB[1].exact, 1);
  const LF = Object.fromEntries(M.laneSweep('fp32', 65536).map(r => [r.L, r]));
  b['ch10.f1'] = M.sci(LF[1].rel, 1); b['ch10.f16'] = M.sci(LF[16].rel, 1);

  /* ch11 */
  const Sf = M.SRC.fma, Sk = M.SRC.skx;
  b['ch11.lat'] = String(Sf.lat); b['ch11.tp'] = String(Sf.perCycle);
  b['ch11.k1'] = pct(M.fmaSim(1, Sf.lat, Sf.perCycle, 2, 2).rate / Sf.perCycle, 1);
  b['ch11.peak'] = f(M.peakGflops(M.SRC.zen5.scalar, 16, Sf.perCycle), 1);
  b['ch11.m4'] = f(M.SRC.m4.gflops4, 0); b['ch11.m4one'] = f(M.SRC.m4.gflops1, 0);
  b['ch11.f0'] = f(Sk.l0, 1); b['ch11.f1'] = f(Sk.l1, 1); b['ch11.f2'] = f(Sk.l2, 1); b['ch11.halt'] = String(Sk.haltUs); b['ch11.relax'] = String(Sk.relaxUs);
  b['ch11.sp20'] = f(M.licenseSim(20, 1000, 'skx').speedup, 2);
  b['ch11.z0'] = f(M.SRC.zen5.scalar, 1); b['ch11.z1'] = f(M.SRC.zen5.dip, 1);

  /* ch12 */
  const vl = M.vla(512, 100), op = M.outer(512);
  b['ch12.trips'] = String(vl.trips); b['ch12.last'] = String(vl.last);
  b['ch12.mo'] = String(op.fmopa); b['ch12.mv'] = String(op.fmla); b['ch12.per'] = String(op.perLoadFmopa);
  b['ch12.amx'] = f(M.amxTile().macs, 0);
  b['ch13.m4'] = f(M.SRC.m4.gflops4, 0);
  return b;
};
