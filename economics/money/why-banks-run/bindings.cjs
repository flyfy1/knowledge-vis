// Prose numbers computed from models.js at build time ({=name} in content.*.md).
// Language-neutral; tests/models.cjs pins every value.
module.exports = M => {
  const b = {}, F = M.FACTS, S = F.svb;
  const f = (x, d) => M.fmt(x, d, 'en');

  /* facts (dated, sourced in BRIEF.md and the footer) */
  b['f.lehA'] = f(F.lehman.assets * 10, 0);          // US$ bn -> 亿美元
  b['f.lehE'] = f(F.lehman.equity * 10, 0);
  b['f.lehLev'] = f(F.lehman.lev, 1);
  b['f.lehCushion'] = f(100 / F.lehman.lev, 1);
  b['f.svbSecPct'] = f(F.svbSecuritiesPct, 0); b['f.peerSecPct'] = f(F.svbPeerSecuritiesPct, 0);
  b['f.svbUnins'] = f(F.svbUninsuredPct, 0); b['f.peerUnins'] = f(F.svbPeerUninsuredPct, 0);
  b['f.svbDur'] = f(F.svbHtmDuration, 1);
  b['f.svbHtmLoss'] = f(S.htmCost - S.htmFair, 1);
  b['f.svbEq'] = f(S.equity, 1);
  b['f.y10a'] = f(F.y10_2021, 2); b['f.y10b'] = f(F.y10_2022, 2); b['f.y2a'] = f(F.y2_2021, 2); b['f.y2b'] = f(F.y2_2022, 2);
  b['f.afsSold'] = f(F.svbAfsSold, 0); b['f.afsLoss'] = f(F.svbAfsLoss, 1); b['f.raise'] = f(F.svbRaise, 2);
  b['f.out9'] = f(F.svbOut9, 0); b['f.out10'] = f(F.svbOut10, 0); b['f.outPct'] = f(F.svbOutPct, 0);
  b['f.wamu'] = f(F.wamuOut, 0); b['f.wamuDays'] = f(F.wamuDays, 0);
  b['f.cnLimit'] = f(F.cnLimit, 0); b['f.cnInst'] = f(F.cnInstitutions, 0); b['f.usLimit'] = f(F.usLimit, 0);
  b['f.cet1'] = f(F.basel.cet1, 1); b['f.ccb'] = f(F.basel.ccb, 1); b['f.lev'] = f(F.basel.lev, 0); b['f.lcr'] = f(F.basel.lcr, 0);
  b['f.ro.ins'] = f(F.runoff.insured, 0); b['f.ro.ret'] = f(F.runoff.retail, 0); b['f.ro.op'] = f(F.runoff.oper, 0); b['f.ro.corp'] = f(F.runoff.corp, 0);
  b['f.lcrShort'] = f(F.svbLcrShortfall, 0);
  b['f.csAt1'] = f(F.csAt1, 0);
  b['f.fdic26'] = f(F.fdic2026, 0); b['f.fdic25'] = f(F.fdic2025, 0); b['f.nano'] = f(F.nanoAssets / 100, 2);   // US$ m -> 亿美元
  const R = F.fsr;
  b['f.fsrRun'] = f(R.runnable / 1000, 1); b['f.fsrRunGdp'] = f(R.runnableGdp, 0); b['f.fsrUnins'] = f(R.uninsured / 1000, 1);
  b['f.fsrRepo'] = f(R.repo / 1000, 1); b['f.fsrMmf'] = f(R.mmf / 1000, 1); b['f.fsrLcr'] = f(R.lcr, 0);
  b['f.pcAssets'] = f(R.pcAssets, 1); b['f.pcLoans'] = f(R.pcLoans, 1); b['f.pcShare'] = f(R.pcShare, 0);
  b['f.stable'] = f(R.stable * 10, 0);                // US$ bn -> 亿美元
  b['f.usdc'] = f(F.usdcAtSvb, 1); b['f.usdcLow'] = f(F.usdcLow, 2);

  /* ch2 leverage */
  const l30 = M.leverage(30, 2), l10 = M.leverage(10, 2);
  b['ch2.e30'] = f(l30.E, 1); b['ch2.d30'] = f(l30.D, 1); b['ch2.e30after'] = f(l30.E1, 1);
  b['ch2.eq30'] = f(l30.eqLossPct, 0); b['ch2.lev30'] = f(l30.lev1, 1);
  b['ch2.sell30'] = f(l30.sell, 0); b['ch2.sell30pct'] = f(l30.sellPct, 0);
  b['ch2.eq10'] = f(l10.eqLossPct, 0); b['ch2.sell10'] = f(l10.sell, 0);

  /* ch4 Diamond–Dybvig */
  const D = M.DD_DEFAULT;
  b['ch4.tipb'] = f(M.ddTipBelief(D) * 100, 0);
  b['ch4.tipbS8'] = f(M.ddTipBelief(Object.assign({}, D, { s: 0.8 })) * 100, 0);
  b['ch4.tipbS4'] = f(M.ddTipBelief(Object.assign({}, D, { s: 0.4 })) * 100, 0);
  b['ch4.qthr'] = f(M.ddInsuredThreshold(D) * 100, 0);
  b['ch4.lossthr'] = f(M.ddLossThreshold(D) * 100, 0);
  b['ch4.lolrthr'] = f((1 - M.DD.p / M.DD.R) * 100, 0);   // R(1 − loss) = penalty rate

  /* ch5 SVB */
  const v = M.svb({}), v25 = M.svb({ bondPct: 25 });
  b['ch5.loss'] = f(v.lossPct, 1); b['ch5.mloss'] = f(v.mtmLoss, 1); b['ch5.mtm'] = f(v.mtmEq, 1);
  b['ch5.star'] = f(v.dyStar, 2); b['ch5.mtm25'] = f(v25.mtmEq, 1); b['ch5.star25'] = f(v25.dyStar, 1);

  /* ch7 deposit insurance and LCR */
  const cv = M.covered([60, 20], F.cnLimit);
  b['ch7.cnCov'] = f(cv.cov, 0); b['ch7.cnUnc'] = f(cv.unc, 0);
  const lc = M.lcr({});
  b['ch7.out'] = f(lc.out30, 1); b['ch7.lcr'] = f(lc.ratio, 0); b['ch7.days'] = f(lc.days, 1);
  return b;
};
