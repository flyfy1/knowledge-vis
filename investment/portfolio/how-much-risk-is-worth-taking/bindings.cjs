// Numbers in the prose, computed from models.js at build time ({=name} in content.*.md). Language-neutral.
// Simulated figures use fixed seeds, the same ones app.js uses for the default state. tests/models.cjs re-derives them.
module.exports = M => {
  const b = {}, A = M.ASSETS, S = M.covFrom(A.sig, A.rho);
  const f = (x, d) => M.fmt(x, d), P = (x, d) => f(x * 100, d == null ? 1 : d) + '%';

  /* ch1 */
  const v10 = M.floor1(10, 0.2, 0.3);
  b['ch1.v1'] = P(M.floor1(1, 0.2, 0.3).vol); b['ch1.v10'] = P(v10.vol); b['ch1.fl'] = P(v10.floor);
  b['ch1.off10'] = P((1 - 1 / 10) * 0.3 * 0.04 / v10.var, 0); b['ch1.cov10'] = '90/100';
  b['ch1.n10'] = String(M.nToFloor(0.2, 0.3, 0.1)); b['ch1.n10b'] = String(M.nToFloor(0.2, 0.1, 0.1)); b['ch1.flb'] = P(M.floor1(1, 0.2, 0.1).floor);

  /* ch2 */
  const g = M.gmvNS(S), w7 = M.minVarNS(A.mu, S, 0.07), U = M.frontierU(A.mu, S), uw = U.w(U.mMin);
  b['ch2.gv'] = P(g.vol, 2); b['ch2.gm'] = P(M.dot(g.w, A.mu), 2); b['ch2.v7'] = P(w7.vol, 2); b['ch2.save'] = f((0.16 - w7.vol) * 100, 1);
  ['a', 'b', 'c', 'd'].forEach((k, i) => { b['ch2.w7' + k] = P(w7.w[i], 0); });
  b['ch2.ugv'] = P(U.sMin, 2); b['ch2.ugc'] = P(-uw[2], 1);

  /* ch3 */
  const T = M.tangencyU(A.mu, S, A.rf), T1 = M.tangencyU(A.mu, S, 0.01), h = M.cml(T, A.rf, 0.5);
  b['ch3.tm'] = P(T.m, 2); b['ch3.ts'] = P(T.s, 2); b['ch3.sr'] = f(T.sr, 2);
  T.w.forEach((w, i) => { b['ch3.w' + i] = P(w, 0); });
  b['ch3.sr1'] = f((A.mu[1] - A.rf) / A.sig[1], 2); b['ch3.sr2'] = f((A.mu[2] - A.rf) / A.sig[2], 2);
  b['ch3.cm16'] = P(A.rf + T.sr * 0.16, 2); b['ch3.m50'] = P(h.m, 2); b['ch3.s50'] = P(h.s, 2);
  b['ch3.w0rf1'] = P(T1.w[0], 0); b['ch3.srrf1'] = f(T1.sr, 2);

  /* ch4 */
  const se = M.sharpeSE(0.5, 10), r1 = M.sharpeTrials(0.5, 10, 1, 400, 4), r20 = M.sharpeTrials(0, 10, 20, 400, 4);
  b['ch4.se'] = f(se, 2); b['ch4.lo'] = f(0.5 - 1.96 * se, 2); b['ch4.hi'] = f(0.5 + 1.96 * se, 2);
  b['ch4.neg'] = P(r1.filter(x => x < 0).length / r1.length, 0);
  b['ch4.t01'] = f((1 + 0.125) / 0.01, 0);
  b['ch4.k20'] = f(M.expMaxNormal(20) * M.sharpeSE(0, 10), 2); b['ch4.k20sim'] = f(M.median(r20), 2); b['ch4.k100'] = f(M.expMaxNormal(100) * M.sharpeSE(0, 10), 2);

  /* ch5 */
  const be = M.betas(A.mu, S, T.w);
  be.forEach((v, i) => { b['ch5.b' + i] = f(v, 2); }); b['ch5.ex'] = P(T.m - A.rf, 2);

  /* ch6 */
  const t0 = M.tangencyNS(A.mu, S, A.rf), mu2 = A.mu.slice(), mu3 = A.mu.slice(); mu2[2] += 0.01; mu3[1] -= 0.01;
  b['ch6.p0'] = P(t0.w[2], 0); b['ch6.p1'] = P(M.tangencyNS(mu2, S, A.rf).w[2], 0);
  b['ch6.q0'] = P(t0.w[1], 0); b['ch6.q1'] = P(M.tangencyNS(mu3, S, A.rf).w[1], 0);
  b['ch6.se10'] = P(0.16 / Math.sqrt(10), 1); b['ch6.t16'] = f(Math.pow(0.16 / 0.016, 2), 0);
  const e10 = M.resample(A, 10, 200, 7, false), e100 = M.resample(A, 100, 200, 7, false), k10 = M.resample(A, 10, 200, 7, true);
  b['ch6.e10'] = f(e10.srMean, 3); b['ch6.e100'] = f(e100.srMean, 3); b['ch6.ek10'] = f(k10.srMean, 3);
  b['ch6.opt'] = f(e10.srOpt, 3); b['ch6.eq'] = f(e10.srEq, 3); b['ch6.iv'] = f(e10.srIV, 3); b['ch6.gmv'] = f(e10.srGMV, 3);
  b['ch6.lo10'] = P(e10.wRange[1][0], 0); b['ch6.hi10'] = P(e10.wRange[1][1], 0);

  /* ch7 */
  const mu = 0.07, sg = 0.18, r = 0.03;
  b['ch7.g1'] = P(M.growthL(mu, sg, r, 1), 2); b['ch7.g2'] = P(M.growthL(mu, sg, r, 2), 2); b['ch7.g3'] = P(M.growthL(mu, sg, r, 3), 2);
  b['ch7.a3'] = P(r + 3 * (mu - r), 0);
  b['ch7.mean3'] = f(Math.exp((r + 3 * (mu - r)) * 10), 2); b['ch7.med3'] = f(Math.exp(M.growthL(mu, sg, r, 3) * 10), 2);
  b['ch7.below3'] = P(M.pathsL(mu, sg, r, 3, 10, 500, 11).below, 0);

  /* ch8 */
  const d0 = M.divReturn([0.5, 0.5], [0.2, 0.2], 0), d5 = M.divReturn([0.5, 0.5], [0.2, 0.2], 0.5), rs = M.rebalSim([0.07, 0.07], [0.2, 0.2], 0, 30, 1000, 3);
  b['ch8.dr'] = f(d0.dr * 100, 1); b['ch8.dr5'] = f(d5.dr * 100, 1); b['ch8.vol'] = P(d0.volP, 1);
  b['ch8.ga'] = P(rs.gA, 2); b['ch8.grb'] = P(rs.gRB, 2); b['ch8.gbh'] = P(rs.gBH, 2); b['ch8.win'] = P(rs.winRB, 0);

  /* ch9 */
  const fs = M.kellyF(mu, r, sg), f10 = M.kellyF(0.10, r, sg), f12 = M.kellyF(0.12, r, sg);
  b['ch9.f'] = P(fs, 0); b['ch9.g'] = P(M.gK(fs, mu, r, sg), 2); b['ch9.gh'] = P(M.gK(fs / 2, mu, r, sg), 2);
  b['ch9.vol'] = P(fs * sg, 1); b['ch9.volh'] = P(fs / 2 * sg, 1);
  b['ch9.f10'] = P(f10, 0); b['ch9.g10'] = P(M.gK(f10, mu, r, sg), 2); b['ch9.f12'] = P(f12, 0); b['ch9.g12'] = P(M.gK(f12, mu, r, sg), 2);
  b['ch9.gh12'] = P(M.gK(f12 / 2, mu, r, sg), 2);
  const c20 = M.coinSim(0.2, 0.6, 200, 1000, 5), c40 = M.coinSim(0.4, 0.6, 200, 1000, 5);
  b['ch9.cg'] = P(M.coinG(0.2, 0.6), 2); b['ch9.cg40'] = P(M.coinG(0.4, 0.6), 2);
  b['ch9.cmed'] = f(c20.med, 0); b['ch9.cmed40'] = f(c40.med, 2); b['ch9.cruin40'] = P(c40.ruin, 0);
  return b;
};
