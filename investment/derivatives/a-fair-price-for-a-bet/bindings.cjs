// Numbers in the prose and on the diagrams, computed from models.js at build time ({=name} in content.*.md).
// Language-neutral: the same string goes into both languages, so a binding is a bare number or a percentage; amounts
// that need a language-specific unit (亿 / billion) and dates are written in the prose and pinned in tests/models.cjs
// against FRONTIER. tests/models.cjs re-derives the key bindings independently.
module.exports = M => {
  const b = {};
  const f = (x, d) => M.fmt(x, d, 'en');
  const pct = (x, d) => f(x * 100, d == null ? 0 : d) + '%';
  const E = M.EX, B = E.base, bs = o => M.bs(Object.assign({}, B, o || {}));

  /* ch1 */
  const F1 = M.forward(100, 0.04, 0, 1);
  b['ch1.F'] = f(F1, 2); b['ch1.gap'] = f(M.forwardArb(100, 0.04, 0, 1, 110).profit, 2);
  const sd = M.smile('dec'), sm = M.smile('mar');
  b['ch1.spot'] = f(M.DATA.SMILE.spot, 0); b['ch1.fDec'] = f(sd.F, 0); b['ch1.fMar'] = f(sm.F, 0);

  /* ch2 */
  const C = bs().price, P = bs({ type: 'put' }).price;
  b['ch2.C'] = f(C, 2); b['ch2.P'] = f(P, 2); b['ch2.cp'] = f(C - P, 2); b['ch2.kf'] = f(F1, 0);

  /* ch3 */
  const o1 = M.oneStep(E.one);
  b['ch3.delta'] = f(o1.delta, 1); b['ch3.B'] = f(-o1.B, 2); b['ch3.cost'] = f(o1.delta * 100, 0); b['ch3.price'] = f(o1.price, 2);
  b['ch3.naive80'] = f(o1.naive(0.8), 2); b['ch3.naive30'] = f(o1.naive(0.3), 2); b['ch3.q'] = pct(o1.q, 1);

  /* ch4 */
  const tree = (N, o) => M.crr(Object.assign({}, B, { N }, o || {})).price;
  b['ch4.n3'] = f(tree(3), 2); b['ch4.n50'] = f(tree(50), 2); b['ch4.n500'] = f(tree(500), 2);
  const eu = tree(500, { type: 'put' }), am = tree(500, { type: 'put', american: true });
  b['ch4.euPut'] = f(eu, 2); b['ch4.amPut'] = f(am, 2); b['ch4.early'] = f(am - eu, 2);

  /* ch5 */
  b['ch5.day'] = pct(0.2 * Math.sqrt(1 / 252), 2); b['ch5.month'] = pct(0.2 * Math.sqrt(1 / 12), 1); b['ch5.y4'] = pct(0.2 * Math.sqrt(4), 0);

  /* ch6 */
  const g = bs();
  b['ch6.Nd1'] = f(g.Nd1, 3); b['ch6.shares'] = f(g.shares, 2); b['ch6.loan'] = f(g.loan, 2); b['ch6.C'] = f(g.price, 2);
  b['ch6.need60'] = f(M.pde(Object.assign({}, B, { M: 60, Nt: 1, scheme: 'explicit', stopAt: 0 })).stableNt, 0);
  b['ch6.need240'] = f(M.pde(Object.assign({}, B, { M: 240, Nt: 1, scheme: 'explicit', stopAt: 0 })).stableNt, 0);
  b['ch6.cnErr'] = f(Math.abs(M.pde(Object.assign({}, B, { M: 240, Nt: 400 })).at(100) - g.price), 3);

  /* ch7 */
  b['ch7.delta'] = f(g.delta, 3); b['ch7.gamma'] = f(g.gamma, 4); b['ch7.vega1'] = f(g.vega / 100, 2); b['ch7.thetaDay'] = f(-g.theta / 365, 3);
  const H = (n, sr) => M.hedgeSim(Object.assign({}, B, { sigmaImp: 0.2, sigmaReal: sr, n, paths: E.hedge.paths, seed: E.hedge.seed }));
  b['ch7.paths'] = f(E.hedge.paths, 0);
  b['ch7.sd4'] = f(H(4, 0.2).sd, 2); b['ch7.sd52'] = f(H(52, 0.2).sd, 2); const h252 = H(252, 0.2); b['ch7.sd252'] = f(h252.sd, 2); b['ch7.rel252'] = pct(h252.sd / h252.prem, 1);
  b['ch7.loss30'] = f(-H(252, 0.3).mean, 2); b['ch7.gain10'] = f(H(252, 0.1).mean, 2);

  /* ch8 */
  const R = M.DATA.RETURNS, mis = M.smileMisprice('dec'), t5 = M.tails(5), c87 = M.crash87();
  b['ch8.atm'] = pct(sd.atm.iv, 1); b['ch8.p90'] = pct(sd.p90.iv, 1); b['ch8.ratio'] = f(mis.ratio, 1);
  b['ch8.n'] = f(R.n, 0); b['ch8.from'] = R.from.slice(0, 4); b['ch8.to'] = R.to.slice(0, 4); b['ch8.sd'] = pct(R.sd, 2);
  b['ch8.exp5'] = f(t5.exp, 3); b['ch8.obs5'] = f(t5.obs, 0); b['ch8.kurt'] = f(R.kurtosis, 1);
  b['ch8.oct19'] = f(-R.oct19.pct, 2) + '%'; b['ch8.z87'] = f(-c87.z, 1); b['ch8.log87'] = f(-c87.log10p, 0);
  b['ch8.worstPct'] = f(-R.worst[0].pct, 2) + '%';
  b['ch8.acfRaw1'] = f(R.acfRaw[0], 2); b['ch8.acfAbs1'] = f(R.acfAbs[0], 2); b['ch8.acfAbs20'] = f(R.acfAbs[19], 2);

  /* ch9 */
  const hs = M.hestonMC(E.heston), iv = K => hs.pts.find(p => p.K === K).iv;
  b['ch9.rho0'] = f(E.heston.rho, 1); b['ch9.xi0'] = f(E.heston.xi, 1);
  b['ch9.iv80'] = pct(iv(80), 1); b['ch9.iv100'] = pct(iv(100), 1); b['ch9.iv120'] = pct(iv(120), 1);
  const mg = E.margin, ms = M.marginStats({ im: mg.im, mm: mg.im * mg.mmFrac, sigma: mg.sigma, days: mg.days, seed: mg.seed, reserve: 0 }, mg.runs);
  b['ch9.closed'] = pct(ms.closed, 0); b['ch9.won'] = pct(ms.wouldHaveWon, 0);
  const net = M.netting(M.NET_EXAMPLE.owes);
  b['ch9.gross'] = f(net.gross, 0); b['ch9.bil'] = f(net.bilateral, 0); b['ch9.ccp'] = f(net.ccp, 0);

  /* ch10 */
  b['ch10.cut90'] = pct(M.minVar({ sigS: 15, sigF: 15, rho: 0.9, h: 0.9 }).cutStar, 0);
  b['ch10.cut70'] = pct(M.minVar({ sigS: 15, sigF: 15, rho: 0.7, h: 0.7 }).cutStar, 0);

  /* frontier data block */
  const X = M.FRONTIER;
  b['f.bisNotional'] = f(X.bisOtc.notionalTn, 0); b['f.bisGmv'] = f(X.bisOtc.gmvTn, 1); b['f.gmvPct'] = pct(X.bisOtc.gmvTn / X.bisOtc.notionalTn, 1);
  b['f.bisYoy'] = X.bisOtc.yoyNotionalPct + '%'; b['f.irdShare'] = X.bisOtc.irdSharePct + '%';
  b['f.bisDecNotional'] = f(X.bisOtcDec.notionalTn, 1); b['f.bisDecGmv'] = f(X.bisOtcDec.gmvTn, 1); b['f.triIrd'] = f(X.triennial.irdDailyTn, 1);
  b['f.fiaChg'] = f(-X.fia2025.totalChgPct, 1) + '%'; b['f.fiaOptChg'] = f(-X.fia2025.optionsChgPct, 1) + '%'; b['f.fiaFutChg'] = f(X.fia2025.futuresChgPct, 1) + '%'; b['f.fiaEqChg'] = f(-X.fia2025.equityChgPct, 1) + '%';
  b['f.zeroShare'] = f(X.spx0dte.sharePct, 1) + '%'; b['f.mmGamma'] = f(X.cboe0dte.mmGammaPct, 1) + '%'; b['f.retailLo'] = X.cboe0dte.retailLo + '%'; b['f.retailHi'] = X.cboe0dte.retailHi + '%';
  b['f.sebiLoss'] = f(X.sebi.fy26LossPct, 1) + '%'; b['f.sebiLoss3'] = X.sebi.fy22to24LossPct + '%'; b['f.sebiWin5'] = f(X.sebi.fiveYearProfitPct, 1) + '%'; b['f.sebiLose5'] = f(X.sebi.fiveYearLossPct, 1) + '%'; b['f.sebiBuyers'] = X.sebi.buyersPct + '%';
  b['f.sofr'] = f(X.sofr.pct, 2) + '%'; b['f.djia87'] = f(X.crash87.djiaPct, 1) + '%';
  b['f.ltcmLev'] = String(X.ltcm.leverage); b['f.ltcmAug'] = X.ltcm.augLossPct + '%'; b['f.ltcmFirms'] = String(X.ltcm.firms);
  return b;
};
