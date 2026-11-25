// Numbers in the prose, computed from models.js at build time ({=name} in content.*.md). Language-neutral strings:
// bare numbers and percentages. Amounts with a language-specific unit (亿 / billion) are written in the prose and pinned
// in tests/models.cjs against FRONTIER.
module.exports = M => {
  const b = {}, f = (x, d) => M.fmt(x, d, 'en'), pct = (x, d) => f(x * 100, d == null ? 0 : d) + '%', X = M.FRONTIER;
  /* ch2 */
  b['ch2.P'] = f(M.gordon(4, 0.08, 0.04), 0); b['ch2.s10'] = pct(M.shareFirst(0.08, 0.04, 10)); b['ch2.s30'] = pct(M.shareFirst(0.08, 0.04, 30));
  b['ch2.half'] = f(M.halfYear(0.08, 0.04), 0);
  /* ch3 */
  const s = (r, g) => M.gordonShock(4, r, g, 0.01);
  b['ch3.P'] = f(s(0.08, 0.04).p0, 0); b['ch3.p1'] = f(s(0.08, 0.04).p1, 0); b['ch3.chg'] = pct(-s(0.08, 0.04).chg);
  b['ch3.P6'] = f(s(0.08, 0.06).p0, 0); b['ch3.chg6'] = pct(-s(0.08, 0.06).chg); b['ch3.P7'] = f(s(0.08, 0.07).p0, 0); b['ch3.chg7'] = pct(-s(0.08, 0.07).chg);
  b['ch3.chg2'] = pct(-s(0.08, 0.02).chg); b['ch3.dur'] = f(s(0.08, 0.04).dur, 0);
  /* ch4 */
  const pm = M.peFrom(0.08, 0.03, 0.15);
  b['ch4.ey40'] = pct(1 / 40, 1); b['ch4.g20'] = pct(M.impliedG(20, 0.08, 0.15), 1); b['ch4.g40'] = pct(M.impliedG(40, 0.08, 0.15), 1);
  b['ch4.pm'] = f(pm, 0); b['ch4.N'] = f(M.yearsOfGrowth(40, 0.08, 0.2, pm), 1); b['ch4.N15'] = f(M.yearsOfGrowth(40, 0.08, 0.15, pm), 1);
  /* ch5 */
  const c5 = M.capeCycle(0.5);
  b['ch5.trHi'] = f(c5.trailR.hi, 1); b['ch5.capeLo'] = f(c5.capeR.lo, 1); b['ch5.capeHi'] = f(c5.capeR.hi, 1);
  /* ch6 */
  const e = p => M.impliedERP(p, 0.035, 0.08, 0.0494).erp;
  b['ch6.erp'] = pct(e(1), 2); b['ch6.erpDown'] = pct(e(0.8), 2); b['ch6.erpUp'] = pct(e(1.2), 2);
  /* ch7 */
  const ind = id => M.INDUSTRIES.find(i => i.id === id).beta, rf = X.erp.tbond / 100, erp = X.erp.nov26 / 100;
  b['ch7.power'] = pct(M.sml(rf, erp, ind('power')), 2); b['ch7.semi'] = pct(M.sml(rf, erp, ind('semi')), 2);
  const se = 0.08 / (0.045 * Math.sqrt(60));
  b['ch7.se'] = f(se, 2); b['ch7.lo'] = f(1.28 - 1.96 * se, 2); b['ch7.hi'] = f(1.28 + 1.96 * se, 2);
  /* ch8 */
  b['ch8.ratioR'] = f(M.excessVol(M.EXV.rho).ratio, 2); b['ch8.ratio95'] = f(M.excessVol(0.95).ratio, 2);
  let lo = M.EXV.rho, hi = 1; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (M.excessVol(m).ratio < 1) lo = m; else hi = m; }
  b['ch8.cross'] = f((lo + hi) / 2, 2);
  /* ch9 */
  const D = { fee: 0.01, skill: 0.005, te: 0.05 };
  b['ch9.cf1'] = pct(M.trailShare(D.fee, D.skill, D.te, 1)); b['ch9.cf20'] = pct(M.trailShare(D.fee, D.skill, D.te, 20)); b['ch9.cf20b'] = pct(M.trailShare(0.015, D.skill, D.te, 20));
  const sim = M.funds(Object.assign({ T: 20, n: 2000, seed: 7, close: true, cut: 0.05 }, D));
  b['ch9.alive'] = pct(sim.aliveAt[19]); b['ch9.sim20'] = pct(sim.trailAt[19]); b['ch9.surv'] = pct(sim.trailSurv[19]);
  /* ch10 */
  b['ch10.grow'] = pct(M.bubbleGrowth(0.08, 0.9)); b['ch10.life'] = f(1 / (1 - 0.9), 0);
  /* frontier */
  const S = X.spiva, p2 = v => f(v, 2) + '%';
  ['1', '3', '5', '10', '15', '20'].forEach((h, i) => { b['f.spiva' + h] = p2(S.large[i]); });
  b['f.spivaPrev'] = f(S.prev1, 0) + '%'; b['f.spivaSurv'] = p2(S.surv20); b['f.spivaN'] = f(S.n20, 0); b['f.spivaRisk'] = p2(S.riskAdj20);
  b['f.ret500'] = p2(X.spivaRet20.sp500); b['f.retFund'] = p2(X.spivaRet20.largeEw);
  b['f.erpNov'] = p2(X.erp.nov26); b['f.erpJan'] = p2(X.erp.jan26); b['f.tbond'] = p2(X.erp.tbond);
  b['f.top10'] = f(X.top10.w25, 1) + '%'; b['f.top10e'] = f(X.top10.earn25, 0) + '%'; b['f.top10peak'] = f(X.top10.peak2000, 0) + '%';
  b['f.top10lo'] = f(X.top10.lo, 0) + '%'; b['f.top10hi'] = f(X.top10.hi, 0) + '%';
  b['f.capeNow'] = f(X.cape.now, 1); b['f.cape1999'] = f(X.cape.y1999, 1); b['f.capeEy'] = pct(1 / X.cape.now, 1);
  b['f.nqPeak'] = f(X.nasdaq.peak, 2); b['f.nqTrough'] = f(X.nasdaq.trough, 2); b['f.nqDrop'] = pct(1 - X.nasdaq.trough / X.nasdaq.peak);
  b['f.mpOos'] = f(X.mp.oos, 0) + '%'; b['f.mpPost'] = f(X.mp.post, 0) + '%';
  return b;
};
