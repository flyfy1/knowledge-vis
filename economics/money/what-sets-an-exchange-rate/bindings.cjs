// Prose numbers computed from models.js at build time ({=name} in content.*.md).
// Language-neutral (en-US digits); tests/models.cjs pins every value.
module.exports = M => {
  const b = {};
  const f = (x, d) => M.fmt(x, d, 'en').replace(/^-/, '−');
  const F = M.FRONTIER;

  /* ch1 onshore market */
  b['ch1.sBase'] = f(M.market.solve(0.8, 60, 0).S, 2);
  b['ch1.sAll'] = f(M.market.solve(1, 60, 0).S, 2);
  b['ch1.sLow'] = f(M.market.solve(0.6, 60, 0).S, 2);
  b['ch1.sBuy'] = f(M.market.solve(1, 60, 60).S, 2);

  /* ch2 Big Mac */
  const B = M.bigmac, cn = B.get('CHN');
  b['ch2.cnPpp'] = f(cn.ppp, 2); b['ch2.cnEx'] = f(cn.ex, 2); b['ch2.cnUsd'] = f(cn.usd, 2);
  b['ch2.cnRaw'] = f(-cn.raw * 100, 1); b['ch2.cnAdj'] = f(-cn.adj * 100, 1);
  b['ch2.jpnAdj'] = f(-B.get('JPN').adj * 100, 1);
  b['ch2.cheRaw'] = f(B.get('CHE').raw * 100, 1); b['ch2.indRaw'] = f(-B.get('IND').raw * 100, 1);
  b['ch2.logSlope'] = f(B.logSlope, 2); b['ch2.logR2'] = f(B.logR2, 2); b['ch2.under'] = String(B.under);
  const g = B.pts.filter(p => p.gdp != null && p.iso !== 'USA' || p.iso === 'USA');
  const med = a => { const s = a.slice().sort((x, y) => x - y), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
  const rich = g.filter(p => p.gdp != null && p.gdp > 40000).map(p => p.usd), poor = g.filter(p => p.gdp != null && p.gdp < 15000).map(p => p.usd);
  b['ch2.nRich'] = String(rich.length); b['ch2.nPoor'] = String(poor.length);
  b['ch2.richMed'] = f(med(rich), 2); b['ch2.poorMed'] = f(med(poor), 2);
  b['ch2.slope10k'] = f(B.slope * 10000, 2); b['ch2.r2'] = f(B.r2, 2);

  /* ch3 real exchange rate */
  b['ch3.qDef'] = f(-(M.real.ratio(0, 0, 0.03, 3) - 1) * 100, 1);
  b['ch3.beDef'] = f(M.real.breakEven(0, 0.03, 3) * 100, 1);

  /* ch4 covered parity */
  const S = 6.66, iu = 0.03875, ic = 0.014, F12 = M.cip.forward(S, iu, ic, 1);
  b['ch4.f12'] = f(F12, 4); b['ch4.pts12'] = String(-M.cip.points(S, F12)); b['ch4.prem12'] = f(-M.cip.premium(S, F12, 1) * 100, 2);
  b['ch4.hedged'] = f(M.cip.hedged(S, iu, ic, 1) * 100, 2); b['ch4.diff'] = f((iu - ic) * 100, 3);

  /* ch5 overshooting */
  const o = M.over.solve(5, 2, 0.5);
  b['ch5.jumpDef'] = f(o.jump, 0); b['ch5.iDef'] = f(-o.di, 1); b['ch5.halfDef'] = f(o.half, 2);
  b['ch5.jumpFast'] = f(M.over.solve(5, 2, 5).jump, 1);

  /* ch6 carry */
  const c3 = M.carry.run(0.04, 3, 0.10, 0.15), c5 = M.carry.run(0.04, 5, 0.10, 0.15);
  b['ch6.beDef'] = f(c3.breakEven * 100, 1);
  b['ch6.meanDef'] = f(c3.annMean * 100, 1); b['ch6.medDef'] = f(c3.annMedian * 100, 1); b['ch6.loseDef'] = f(c3.pLose * 100, 0);
  b['ch6.mean5'] = f(c5.annMean * 100, 1); b['ch6.med5'] = f(c5.annMedian * 100, 1); b['ch6.lose5'] = f(c5.pLose * 100, 0); b['ch6.wipe5'] = f(c5.pWiped * 100, 1);
  const Y = F.yen2024, mv = 1 - Y.lo / Y.hi, sh = M.carry.shock(mv, 5, Y.carryPts / 100);
  b['ch6.ykCarry'] = f(Y.carryPts, 1); b['ch6.ykHi'] = f(Y.hi, 0); b['ch6.ykLo'] = f(Y.lo, 0); b['ch6.nikkei'] = f(Y.nikkei, 1);
  b['ch6.ykMove'] = f(mv * 100, 0); b['ch6.ykLoss5'] = f(sh.loss * 100, 0); b['ch6.ykYears'] = f(sh.years, 1);

  /* ch7 trilemma */
  b['ch7.fxFloat'] = f(M.tri.shock('float', 2, 2).dFx, 0);

  /* ch8 peg attack */
  const p0 = M.peg.solve(2, 5, 40), p4 = M.peg.solve(4, 5, 40);
  b['ch8.naiveDef'] = f(p0.naive, 0); b['ch8.tDef'] = f(p0.T, 0); b['ch8.runDef'] = f(p0.run, 0); b['ch8.shareDef'] = f(p0.runShare * 100, 0);
  b['ch8.naive4'] = f(p4.naive, 0); b['ch8.t4'] = f(p4.T, 0); b['ch8.share4'] = f(p4.runShare * 100, 0);

  /* ch9 currency mismatch */
  const m0 = M.mismatch.solve(0.5, 0.1, 0.3), m1 = M.mismatch.solve(0.5, 0.1, 1);
  b['ch9.nwDef'] = f(-m0.dNw * 100, 0); b['ch9.levDef'] = f(m0.lev * 100, 0); b['ch9.starDef'] = f(m0.star * 100, 0); b['ch9.nw100'] = f(-m1.dNw * 100, 0);

  /* ch10 fixing */
  const r95 = M.fixing.run(-0.002, 0.95);
  b['ch10.edge95'] = String(r95.edgeDays); b['ch10.gap95'] = f(-r95.lastGap * 100, 1);
  b['ch10.dev2015'] = f((F.fix2015.after / F.fix2015.before - 1) * 100, 1);

  /* ch11 coordination */
  const fin = a => M.coord.path(0.9, a, 4, 40)[40] * 100;
  b['ch11.finDef'] = f(fin(0), 0); b['ch11.finM08'] = f(fin(-0.8), 0); b['ch11.finM11'] = f(fin(-1.1), 1);
  b['ch11.tip'] = f(M.coord.tipping(4), 2);

  /* facts (dated, sourced in BRIEF.md) */
  b['f.coferUsd'] = f(F.cofer.usd, 2); b['f.coferUsdPrev'] = f(F.cofer.usdPrev, 2); b['f.coferEur'] = f(F.cofer.eur, 2);
  b['f.coferCny'] = f(F.cofer.cny, 2); b['f.coferCnyPrev'] = f(F.cofer.cnyPrev, 2); b['f.coferTotal'] = f(F.cofer.totalTn, 2);
  b['f.swiftCny'] = f(F.swift.cny, 2); b['f.swiftCny20'] = f(F.swift.cny2020, 1); b['f.tfCny'] = f(F.swiftTf.cny, 2);
  b['f.bisDaily'] = f(F.bis.dailyTn, 1); b['f.bisDaily22'] = f(F.bis.dailyTn2022, 1); b['f.bisUsd'] = f(F.bis.usd, 1); b['f.bisUsd22'] = f(F.bis.usd2022, 1);
  b['f.bisCny'] = f(F.bis.cny, 1); b['f.bisCny22'] = f(F.bis.cny2022, 1);
  b['f.dxyLo'] = f(F.dxy2025.lo, 1); b['f.dxyHi'] = f(F.dxy2025.hi, 1); b['f.dxySince'] = String(F.dxy2025.worstSince);
  b['f.fedLo'] = f(F.fed.lo, 2); b['f.fedHi'] = f(F.fed.hi, 2); b['f.boj'] = f(F.boj.rate, 2); b['f.pboc'] = f(F.pboc7d.rate, 2);
  b['f.fix'] = f(F.cnyFix.fix, 4); b['f.fixEst'] = f(F.cnyFix.est, 4); b['f.fixPips'] = String(F.cnyFix.pips);
  b['f.fixPct'] = f((F.cnyFix.fix / F.cnyFix.est - 1) * 100, 1); b['f.spot'] = f(F.cnySpot.spot, 4);
  b['f.res14'] = f(F.cnReserves.peak2014, 2); b['f.res17'] = f(F.cnReserves.low2017, 3); b['f.res26'] = f(F.cnReserves.tn, 4);
  b['f.cips'] = f(F.cips2025.trnYuan, 0);
  return b;
};
