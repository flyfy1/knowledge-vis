// Numbers in the prose and on the diagrams, computed from models.js / data.js at build time ({=name} in content.*.md).
// Language-neutral: bare numbers, percentages, bp. tests/models.cjs re-derives the key ones independently.
module.exports = M => {
  const b = {}, D = M.DATA;
  const f = (x, d) => M.fmt(x, d), s = (x, d) => M.signed(x, d);
  const P = (x, d) => f(x * 100, d == null ? 2 : d) + '%';      // decimal → 4.91%
  const PP = (x, d) => s(x * 100, d == null ? 2 : d);             // decimal → +0.79 (points)
  const BP = x => s(x * 1e4, 0);                                  // decimal → −4 (bp)
  const C = d => M.realCurve(d), A = '2021-12-31', B = '2023-06-30', L = D.last;

  /* ch1 */
  const bl = M.bundle(C(L), 10, 0.06);
  b['ch1.y'] = P(bl.y); b['ch1.z'] = P(bl.zT); b['ch1.gapC'] = BP(bl.gap);
  b['ch1.gapA'] = BP(M.bundle(C(A), 10, 0.06).gap); b['ch1.gapB'] = BP(M.bundle(C(B), 10, 0.06).gap);

  /* ch2 */
  const fw = M.forward(C(L), 2, 5);
  b['ch2.z2'] = P(C(L).z(2)); b['ch2.z5'] = P(C(L).z(5)); b['ch2.f'] = P(fw.f); b['ch2.units'] = f(fw.units, 4);
  b['ch2.arb'] = f(M.forwardArb(C(L), 2, 5, 0.055, 100).profit, 2);
  const fc = M.fwdCurve(C(L)), fcB = M.fwdCurve(C(B));
  b['ch2.f910'] = P(fc[9]); b['ch2.z10'] = P(C(L).z(10)); b['ch2.fB34'] = P(fcB[3]); b['ch2.zB1'] = P(C(B).z(1));

  /* ch3 */
  const bc = M.build(M.PATHS.cuts.map(v => v / 100), 0.008);
  b['ch3.y1'] = P(bc.y[0]); b['ch3.y10'] = P(bc.y[9]); b['ch3.s'] = PP(bc.y[9] - bc.y[0]); b['ch3.e'] = PP(bc.exp[9] - bc.exp[0]); b['ch3.tp'] = PP(bc.tp[9] - bc.tp[0]);
  const ipB = M.impliedPath(bc.y, -0.005);
  b['ch3.pA9'] = P(0.03); b['ch3.pB9'] = P(ipB[9]); b['ch3.pB4'] = P(ipB[4]);
  const bh = M.build(M.PATHS.hikes.map(v => v / 100), 0.008); b['ch3.hs'] = PP(bh.y[9] - bh.y[0]);

  /* ch4 */
  const hC = M.hold(C(L), 10, 'same'), hB = M.hold(C(B), 10, 'same');
  b['ch4.ret'] = P(hC.ret); b['ch4.r1'] = P(hC.r1); b['ch4.ex'] = PP(hC.excess); b['ch4.be'] = f(hC.breakeven * 1e4, 0);
  b['ch4.retB'] = P(hB.ret); b['ch4.r1B'] = P(hB.r1); b['ch4.exB'] = PP(hB.excess);
  const x62 = M.rxStats(1962), x90 = M.rxStats(1990), x08 = M.rxStats(2008);
  b['ch4.m62'] = PP(x62.mean / 100); b['ch4.sd62'] = f(x62.sd, 1); b['ch4.pos62'] = P(x62.pos, 0); b['ch4.w62'] = PP(x62.worst / 100); b['ch4.wy62'] = String(x62.worstYear);
  b['ch4.m90'] = PP(x90.mean / 100); b['ch4.pos90'] = P(x90.pos, 0); void x08;
  const A_ = D.acmM, i90 = 0, tpm90 = A_.tp10.slice(i90).reduce((a, v) => a + v, 0) / A_.tp10.length; b['ch4.tp90'] = PP(tpm90 / 100);
  b['ch4.x22'] = PP(D.rx.series[2022 - D.rx.seriesStart] / 100);

  /* ch5 */
  let mn = 0, mx = 0; A_.tp10.forEach((v, k) => { if (v < A_.tp10[mn]) mn = k; if (v > A_.tp10[mx]) mx = k; });
  const lab = k => { const o = M.mLabel(A_.start, k); return o.y + '-' + String(o.m).padStart(2, '0'); };
  b['ch5.min'] = PP(A_.tp10[mn] / 100); b['ch5.minD'] = lab(mn); b['ch5.max'] = PP(A_.tp10[mx] / 100); b['ch5.maxD'] = lab(mx);
  const K = D.kwM, off = M.mIndex(K.start, A_.start); let kmn = null, kmx = null, n = 0, sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0, md = 0;
  A_.tp10.forEach((x, k) => { const y = K.v[off + k]; if (y == null) return; if (kmn == null || y < K.v[off + kmn]) kmn = k; if (kmx == null || y > K.v[off + kmx]) kmx = k; n++; sx += x; sy += y; sxx += x * x; syy += y * y; sxy += x * y; md = Math.max(md, Math.abs(x - y)); });
  b['ch5.kmin'] = PP(K.v[off + kmn] / 100); b['ch5.kminD'] = lab(kmn); b['ch5.kmax'] = PP(K.v[off + kmx] / 100); b['ch5.kmaxD'] = lab(kmx);
  b['ch5.corr'] = f((n * sxy - sx * sy) / Math.sqrt((n * sxx - sx * sx) * (n * syy - sy * sy)), 2); b['ch5.md'] = f(md, 2);
  b['ch5.acm'] = PP(D.acmLast.tp10 / 100); b['ch5.kw'] = PP(D.kwLast[1] / 100); b['ch5.y10'] = P(D.acmLast.y10 / 100); b['ch5.exp'] = P((D.acmLast.y10 - D.acmLast.tp10) / 100);

  /* ch6 */
  const s1 = M.shock(0.04, 10, 0.04, 0.01), s3 = M.shock(0.04, 30, 0.04, 0.03), s3d = M.shock(0.04, 30, 0.04, -0.03), z30 = M.bond(0, 30, 0.04), s2 = M.bond(0.04, 2, 0.04);
  b['ch6.mac'] = f(s1.b0.mac, 2); b['ch6.mod'] = f(s1.b0.mod, 2); b['ch6.conv'] = f(s1.b0.conv, 1); b['ch6.dv01'] = f(s1.b0.dv01, 4);
  b['ch6.ex1'] = PP(s1.exact); b['ch6.du1'] = PP(s1.dur); b['ch6.dc1'] = PP(s1.durConv);
  b['ch6.ex3'] = PP(s3.exact); b['ch6.du3'] = PP(s3.dur); b['ch6.dc3'] = PP(s3.durConv); b['ch6.ex3d'] = PP(s3d.exact); b['ch6.du3d'] = PP(s3d.dur);
  b['ch6.mac30'] = f(M.bond(0.04, 30, 0.04).mac, 2); b['ch6.z30'] = f(z30.mac, 2); b['ch6.mac2'] = f(s2.mac, 2);

  /* ch7 */
  const pf = M.immunise(7, 100, 2, 15, 0.045), su = (p, w) => M.surplus(pf, 7, 0.045, p, w);
  b['ch7.w'] = P(pf.w, 0); b['ch7.w2'] = P(1 - pf.w, 0); b['ch7.L'] = f(pf.PVL, 2);
  b['ch7.up1'] = s(su(0.01, 0).barbell, 2); b['ch7.dn1'] = s(su(-0.01, 0).barbell, 2); b['ch7.up2'] = s(su(0.02, 0).barbell, 2);
  b['ch7.tw'] = s(su(0, 0.01).barbell, 2); b['ch7.twn'] = s(su(0, -0.01).barbell, 2); b['ch7.disp'] = f(M.dispersion(pf.barbell, 7), 0);

  /* ch8 */
  const ns = d => M.nsFit(D.parMat, D.curves[d].par);
  b['ch8.rA'] = f(ns(A).rmse * 100, 0); b['ch8.rB'] = f(ns(B).rmse * 100, 0); b['ch8.rC'] = f(ns(L).rmse * 100, 0);
  b['ch8.b0'] = f(ns(L).b[0], 2); b['ch8.b1'] = s(ns(L).b[1], 2); b['ch8.b1B'] = s(ns(B).b[1], 2);
  b['ch8.p1'] = P(D.pca.share[0], 1); b['ch8.p2'] = P(D.pca.share[1], 1); b['ch8.p3'] = P(D.pca.share[2], 1); b['ch8.p123'] = P(D.pca.share[0] + D.pca.share[1] + D.pca.share[2], 1);
  b['ch8.n'] = String(D.pca.months);

  /* ch9 */
  const sp = ym => M.split(M.mIndex(A_.start, ym));
  for (const [k, ym] of [['23', '2023-06'], ['19', '2019-08'], ['00', '2000-12'], ['06', '2006-12'], ['26', '2026-10']]) { const x = sp(ym); b['ch9.s' + k] = PP(x.s / 100); b['ch9.e' + k] = PP(x.exp / 100); b['ch9.t' + k] = PP(x.tp / 100); }
  const I = D.inv; b['ch9.i3first'] = I.s3m[0].first; b['ch9.i3last'] = I.s3m[0].last; b['ch9.i3min'] = PP(I.s3m[0].min / 100); b['ch9.i3minD'] = I.s3m[0].minD;
  b['ch9.i3bfirst'] = I.s3m[1].first; b['ch9.i3blast'] = I.s3m[1].last; b['ch9.i3bmin'] = PP(I.s3m[1].min / 100);
  const r2 = I.s2y.find(r => r.neg > 100); b['ch9.i2first'] = r2.first; b['ch9.i2last'] = r2.last; b['ch9.i2min'] = PP(r2.min / 100); b['ch9.i2minD'] = r2.minD;
  b['ch9.now3'] = PP(I.lastS3m[1] / 100); b['ch9.now2'] = PP(I.lastS2y[1] / 100); b['ch9.nowD'] = I.lastS3m[0];

  /* ch10 */
  const r = 0.045, oas = { BBB: 'bbb', BB: 'bb', B: 'b', CCC: 'ccc' };
  for (const g of ['BBB', 'BB', 'B', 'CCC']) {
    const p = M.annualFromCum(D.spg.cum[g][1] / 100, 5), el = M.credit({ r, T: 5, p, R: 0.4, k: 1 }), o = D.oas[oas[g]].v / 100;
    if (g === 'BBB') { b['ch10.pBBB'] = P(p); b['ch10.c5BBB'] = f(D.spg.cum[g][1], 2) + '%'; }
    b['ch10.el' + g] = f(el.s * 1e4, 0); b['ch10.o' + g] = f(o * 1e4, 0); b['ch10.sh' + g] = P(el.s / o, 0);
  }
  const ex = M.credit({ r, T: 5, p: 0.02, R: 0.4, k: 1 }); b['ch10.exS'] = f(ex.s * 1e4, 0); b['ch10.exTri'] = f(ex.tri * 1e4, 0);
  b['ch10.oasD'] = D.oas.hy.d;

  /* ch11 */
  const sim = M.vasicekSim({ N: 1000, p: 0.039, rho: 0, years: 2000, seed: 20261125 }), st = M.stats(sim), rs = M.stats(D.spg.sg.map(v => v / 100));
  const sim2 = M.vasicekSim({ N: 1000, p: 0.039, rho: 0.1, years: 2000, seed: 20261125 }), st2 = M.stats(sim2);
  b['ch11.sd0'] = f(st.sd * 100, 2); b['ch11.max0'] = P(st.max, 1); b['ch11.sd1'] = f(st2.sd * 100, 2); b['ch11.max1'] = P(st2.max, 1); b['ch11.q1'] = P(st2.q99, 1);
  b['ch11.l0'] = P(M.lossYears(sim, 0.6, 0.036), 1); b['ch11.l1'] = P(M.lossYears(sim2, 0.6, 0.036), 1);
  b['ch11.rmean'] = P(rs.mean, 2); b['ch11.rsd'] = f(rs.sd * 100, 2); b['ch11.rmax'] = P(rs.max, 2);
  b['ch11.vq'] = P(M.vasicekQ(0.039, 0.1, 0.99), 1);

  /* ch12 */
  const dc = D.decomp, e0 = dc.find(x => x.d === '2024-09-17'), e1 = dc[dc.length - 1], lo = dc[0];
  b['ch12.y0'] = P(e0.y10 / 100); b['ch12.y1'] = P(e1.y10 / 100); b['ch12.dy'] = PP((e1.y10 - e0.y10) / 100);
  b['ch12.de'] = PP((e1.rn10 - e0.rn10) / 100); b['ch12.dt'] = PP((e1.tp10 - e0.tp10) / 100);
  b['ch12.kw0'] = PP(e0.kw10 / 100); b['ch12.dk'] = PP((D.kwLast[1] - e0.kw10) / 100);
  b['ch12.g0'] = P(e0.dgs10 / 100); b['ch12.g1'] = P(e1.dgs10 / 100); b['ch12.lo'] = P(lo.dgs10 / 100); b['ch12.loTp'] = PP(lo.tp10 / 100);
  b['ch12.hy'] = f(D.oas.hy.v, 2) + '%'; b['ch12.hyMin'] = f(D.oas.hy.min[1], 2) + '%'; b['ch12.hyMinD'] = D.oas.hy.min[0]; b['ch12.hyMax'] = f(D.oas.hy.max[1], 2) + '%'; b['ch12.hyMaxD'] = D.oas.hy.max[0];
  b['ch12.ig'] = f(D.oas.ig.v, 2) + '%'; b['ch12.ccc'] = f(D.oas.ccc.v, 2) + '%'; b['ch12.cccMax'] = f(D.oas.ccc.max[1], 2) + '%'; b['ch12.cccMaxD'] = D.oas.ccc.max[0]; b['ch12.cccMin'] = f(D.oas.ccc.min[1], 2) + '%'; b['ch12.cccMinD'] = D.oas.ccc.min[0];
  b['ch12.sg24'] = f(D.spg.sg[2024 - 1981], 2) + '%';
  return b;
};
