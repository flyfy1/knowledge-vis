// Prose numbers computed from models.js at build time ({=name} in content.*.md).
// Language-neutral; tests/models.cjs pins every value.
module.exports = M => {
  const b = {};
  const f = (x, d) => M.fmt(x, d, 'en');
  const F = M.FRONTIER;
  const tn = x => f(x / 1000, 2);            // billions of dollars -> trillions, 2 dp

  /* facts (dated, sourced in BRIEF.md) */
  b['f.usTotal'] = tn(F.usDebtTotal20261123);
  b['f.usPublic'] = tn(F.usDebtPublic20261123);
  const U = F.usFY2026;
  b['f.rec'] = tn(U.receipts); b['f.out'] = tn(U.outlays);
  b['f.def'] = tn(U.outlays - U.receipts);
  b['f.int'] = tn(U.netInterest);
  b['f.prim'] = tn(U.outlays - U.receipts - U.netInterest);
  b['f.intPer100'] = f(U.netInterest / U.receipts * 100, 0);
  b['f.def2'] = tn(U.defense);
  b['f.int25'] = tn(F.usFY2025.netInterest); b['f.def25'] = tn(F.usFY2025.defense);
  b['f.usAvg'] = f(F.usAvgRateMarketable202610, 2);
  b['f.usForeign'] = tn(F.usForeign202609);
  b['f.usForeignPct'] = f(F.usForeign202609 / F.usDebtPublic20260930 * 100, 0);
  b['f.usJapan'] = tn(F.usJapan202609); b['f.usUK'] = tn(F.usUK202609); b['f.usChina'] = tn(F.usChina202609);
  b['f.jgbTotal'] = f(F.jgbTotal, 1); b['f.jgbBojPct'] = f(F.jgbBojPct, 1);
  b['f.jgbForeignPct'] = f(F.jgbForeignPct, 1); b['f.jgbTbForeignPct'] = f(F.jgbTbForeignPct, 1);
  b['f.grCut'] = f(F.grNominalCut, 1); b['f.grEfsf'] = f(F.grEfsfShare, 0); b['f.grNew'] = f(F.grNewBondShare, 1);
  b['f.grNpv'] = f(F.grNpvMarket, 0); b['f.grZtgLow'] = f(F.grZtgLow, 0); b['f.grZtgHigh'] = f(F.grZtgHigh, 0);
  b['f.cnEmp'] = f(F.cnPensionRate.employer, 0); b['f.cnInd'] = f(F.cnPensionRate.individual, 0);
  b['f.cn60'] = f(F.cnAge60Pct2025, 1); b['f.cn65'] = f(F.cnAge65Pct2025, 1);
  b['f.rameyLow'] = f(F.rameyLow, 1); b['f.rameyHigh'] = f(F.rameyHigh, 0);
  b['f.jpGross'] = f(F.japanGross, 0); b['f.jpPeak'] = f(F.japanPeak, 0); b['f.jpNetN'] = f(F.japanNetNarrow, 0); b['f.jpNetB'] = f(F.japanNetBroad, 0);
  b['f.jpR'] = f(F.japanR2025, 1); b['f.jpG'] = f(F.japanG2025, 1);
  b['f.cnH23'] = f(F.cnHidden2023, 1); b['f.cnSwap'] = f(F.cnSwap, 0); b['f.cnSpecial'] = f(F.cnSpecial, 0);
  b['f.cnTotal'] = f(F.cnTotal2025, 1); b['f.cnCentral'] = f(F.cnCentral2025, 1); b['f.cnLocal'] = f(F.cnLocal2025, 1);
  b['f.cnHidden'] = f(F.cnHidden2025, 1); b['f.cnRatio'] = f(F.cnRatio2025, 1);
  b['f.cnImf25'] = f(F.cnImfAug2025, 1); b['f.cnImf30'] = f(F.cnImfAug2030, 1);
  b['f.usD'] = f(F.usDebtGdp2026Q2, 1); b['f.usR'] = f(F.usReff2026Q2, 2); b['f.usG'] = f(F.usG2026Q2, 2);
  b['f.cboPd'] = f(F.cboPrimaryDef2026, 1); b['f.cbo26'] = f(F.cbo2026, 0); b['f.cbo36'] = f(F.cbo2036, 0);

  /* ch3 */
  const D = M.CH3_DEFAULT;
  const s = M.debtSummary(D);
  b['ch3.d30'] = f(s.d30, 0); b['ch3.ss'] = f(s.steady, 0);
  b['ch3.d30r5'] = f(M.debtSummary(Object.assign({}, D, { r: 5 })).d30, 0);
  b['ch3.d30eq'] = f(M.debtSummary(Object.assign({}, D, { r: 4, g: 4 })).d30, 0);
  b['ch3.stab'] = f(s.stab, 2); b['ch3.stabAbs'] = f(-s.stab, 2);

  /* ch4 */
  const C = M.CH4_DEFAULT;
  const c0 = M.currencyToy(Object.assign({}, C, { fxShare: 0 }));
  b['ch4.infl0'] = f(c0.cumInfl * 100, 0); b['ch4.avg0'] = f(c0.avgInfl * 100, 0); b['ch4.ratio0'] = f(c0.last.ratio, 0);
  b['ch4.def100'] = String(M.currencyToy(Object.assign({}, C, { fxShare: 100 })).defaultYear);
  b['ch4.def50'] = String(M.currencyToy(Object.assign({}, C, { fxShare: 50 })).defaultYear);
  b['ch4.defEuro'] = String(M.currencyToy(Object.assign({}, C, { fxShare: 0, backstop: false })).defaultYear);

  /* ch5 */
  const H = M.CH5_DEFAULT, h = M.haircut(H);
  b['ch5.value'] = f(h.value, 1); b['ch5.market'] = f(h.market * 100, 0); b['ch5.sz'] = f(h.sz * 100, 0);
  b['ch5.m5'] = f(M.haircut(Object.assign({}, H, { y: 5 })).market * 100, 0);

  /* ch6 */
  const P = y => M.paygAt({ year: y.year, ret: y.ret, repl: 45 }).tau;
  b['ch6.t2025'] = f(P({ year: 2025, ret: 60 }), 1); b['ch6.t2050'] = f(P({ year: 2050, ret: 60 }), 1);
  b['ch6.t2050r63'] = f(P({ year: 2050, ret: 63 }), 1); b['ch6.t2050r65'] = f(P({ year: 2050, ret: 65 }), 1);
  b['ch6.le'] = f(M.lifeExp(), 0);

  /* ch7 */
  const n = M.paygPath({ mode: 'none', repl: 45 }), g = M.paygPath({ mode: 'gradual', repl: 45 });
  const at = (arr, y) => arr.find(r => r.year === y).tau;
  b['ch7.n2025'] = f(at(n, 2025), 1); b['ch7.n2050'] = f(at(n, 2050), 1); b['ch7.g2050'] = f(at(g, 2050), 1);
  b['ch7.share'] = f((at(n, 2050) - at(g, 2050)) / (at(n, 2050) - at(n, 2025)) * 100, 0);

  /* ch8 */
  const K = M.CH8_DEFAULT, k = M.multiplier(K), k50 = M.multiplier(Object.assign({}, K, { theta: 0.5 }));
  b['ch8.a'] = f(k.a, 2); b['ch8.k'] = f(k.closed, 2); b['ch8.tax'] = f(k.tax, 2); b['ch8.debt'] = f(k.newDebt, 2);
  b['ch8.ratio'] = f(k.ratio1, 1); b['ch8.be'] = f(M.breakEvenK(K.t, K.d0), 2);
  b['ch8.k50'] = f(k50.closed, 2); b['ch8.dr50'] = f(k50.dRatio, 1);

  /* ch9 */
  const us = M.PRESETS.us, jp = M.PRESETS.jp;
  const usStab = M.stabilizingPb(us.d0, us.r, us.g);
  b['ch9.usStab'] = f(usStab, 1); b['ch9.usStabAbs'] = f(-usStab, 1);
  b['ch9.usD30'] = f(M.debtSummary(us).d30, 0);
  b['ch9.usPer1'] = f(M.stabilizingPb(us.d0, us.r + 1, us.g) - usStab, 2);
  const jpStab = M.stabilizingPb(jp.d0, jp.r, jp.g);
  b['ch9.jpStab'] = f(jpStab, 1); b['ch9.jpStabAbs'] = f(-jpStab, 1);
  b['ch9.jpStabPlus1'] = f(M.stabilizingPb(jp.d0, jp.g + 1, jp.g), 1);
  return b;
};
