// Prose numbers computed from models.js at build time ({=name} in content.*.md).
// Language-neutral; tests/models.cjs re-derives the important ones independently.
module.exports = M => {
  const b = {};
  const f = (x, d) => M.fmt(x, d);
  const F = M.FRONTIER;

  /* ch1: Maddison and the rule of 70 */
  b['ch1.kr50'] = f(M.ratioUS('kr', 1950), 1); b['ch1.tw50'] = f(M.ratioUS('tw', 1950), 1);
  b['ch1.kr22'] = f(M.ratioUS('kr', 2022), 0); b['ch1.tw22'] = f(M.ratioUS('tw', 2022), 0);
  b['ch1.ar50'] = f(M.ratioUS('ar', 1950), 0); b['ch1.ar22'] = f(M.ratioUS('ar', 2022), 0);
  b['ch1.krG'] = f(M.cagr('kr', 1950, 2022), 1); b['ch1.arG'] = f(M.cagr('ar', 1950, 2022), 1); b['ch1.usG'] = f(M.cagr('us', 1950, 2022), 1);
  b['ch1.d2'] = f(M.rule70(2), 0); b['ch1.x2'] = f(M.factorAfter(2, 70), 0);
  b['ch1.d7'] = f(M.rule70(7), 0); b['ch1.x7'] = f(M.factorAfter(7, 70), 0);
  b['ch1.e7'] = f(M.doublingExact(7), 1); b['ch1.e10'] = f(M.doublingExact(10), 1);

  /* ch2 */
  b['ch2.dbl3'] = f(100 * M.doubleGain(1 / 3), 0); b['ch2.dbl5'] = f(100 * M.doubleGain(0.5), 0);

  /* ch3: default Solow, g = 0 */
  const o3 = { s: 25, n: 1, d: 5, a: 1 / 3, A: 1, g: 0 }, st3 = M.steady(o3);
  b['ch3.k'] = f(st3.k, 1); b['ch3.y'] = f(st3.y, 2); b['ch3.c'] = f(st3.c, 2); b['ch3.hl'] = f(M.halfLife(o3), 0);

  /* ch4: convergence and the saving-rate pulse */
  const o4 = { s: 25, n: 1, d: 5, a: 1 / 3, A: 1, g: 1.5 }, cv = M.convergence(o4, 0.1, 60);
  b['ch4.p1'] = f(cv.poor[1].gy, 1); b['ch4.p10'] = f(cv.poor[10].gy, 1); b['ch4.p30'] = f(cv.poor[30].gy, 1);
  b['ch4.hl'] = f(M.halfLife(o4), 0);
  const sh = M.savingsShock({ s: 20, n: 1, d: 5, a: 1 / 3, A: 1, g: 1.5 }, 30, 10, 80);
  b['ch4.peak'] = f(sh.peak, 1); b['ch4.back'] = f(sh.halfBack, 0); b['ch4.lvl'] = f(100 * sh.levelGain, 0);
  b['ch4.ng50'] = f(M.ratioUS('ng', 1950), 1); b['ch4.ng22'] = f(M.ratioUS('ng', 2022), 1);

  /* ch5: China, PWT 11.0 */
  const cn = M.DATA.pwt.CN.map(r => M.decompose(r, null, true));
  [3, 4, 5].forEach(i => {
    const d = cn[i - 1];
    b[`ch5.cn${i}gy`] = f(d.gy, 1); b[`ch5.cn${i}cap`] = f(d.cap, 1); b[`ch5.cn${i}tfp`] = f(d.tfp, 1);
  });

  /* ch6: Jones ideas model */
  const ip0 = M.ideasPath({ nR: 0, lam: 0.75, phi: 0.5 }, 200);
  b['ch6.g100zero'] = f(ip0[100].gA, 1); b['ch6.g200zero'] = f(ip0[200].gA, 1);
  b['ch6.lr1'] = f(M.ideasLongRun({ nR: 1, lam: 0.75, phi: 0.5 }), 1);
  b['ch6.lr3'] = f(M.ideasLongRun({ nR: 3, lam: 0.75, phi: 0.5 }), 1);
  b['ch6.R3'] = f(M.ideasPath({ nR: 3, lam: 0.75, phi: 0.5 }, 100)[100].R, 0);

  /* ch7: Wright's law on real solar data */
  const all = M.wrightFit(1975, 2025), w1 = M.wrightFit(1975, 2003), w3 = M.wrightFit(2010, 2025);
  b['ch7.lrAll'] = f(100 * all.lr, 0); b['ch7.r2All'] = f(all.r2, 2); b['ch7.dblAll'] = f(all.doublings, 0);
  b['ch7.dropAll'] = f(Math.round(all.priceDrop / 100) * 100, 0);
  b['ch7.cap0'] = f(all.first[2], 1); b['ch7.cap1'] = f(all.last[2] / 1e6, 1);   // MW -> TW
  b['ch7.p0'] = f(all.first[1], 0); b['ch7.p1'] = f(all.last[1], 2);
  b['ch7.lr1'] = f(100 * w1.lr, 0); b['ch7.lr3'] = f(100 * w3.lr, 0);

  /* ch8: catch-up */
  b['ch8.kr50'] = f(M.ratioUS('kr', 1950), 1); b['ch8.kr22'] = f(M.ratioUS('kr', 2022), 0); b['ch8.tw22'] = f(M.ratioUS('tw', 2022), 0);
  b['ch8.br78'] = f(M.ratioUS('br', 1978), 0); b['ch8.br22'] = f(M.ratioUS('br', 2022), 0);
  b['ch8.cn78'] = f(M.ratioUS('cn', 1978), 0); b['ch8.cn22'] = f(M.ratioUS('cn', 2022), 0);
  const ky = M.kyRatio('cn'), kyu = M.kyRatio('us');
  b['ch8.ky00'] = f(ky[2000], 1); b['ch8.ky23'] = f(ky[2023], 1); b['ch8.kyUs00'] = f(kyu[2000], 1); b['ch8.kyUs23'] = f(kyu[2023], 1);

  /* ch9: Acemoglu arithmetic */
  const A = M.ACEMOGLU, h = M.hulten(A), hh = M.hulten(Object.assign({}, A, { hard: true }));
  b['ch9.exp'] = f(A.exp, 0); b['ch9.prof'] = f(A.prof, 0); b['ch9.imp'] = f(h.impacted, 1); b['ch9.lcs'] = f(A.lcs, 0);
  b['ch9.ls'] = f(A.ls, 3); b['ch9.save'] = f(h.save, 1); b['ch9.tfp'] = f(h.tfp, 2); b['ch9.yr'] = f(h.perYear, 3);
  b['ch9.tfpHard'] = f(hh.tfp, 2); b['ch9.gdp'] = f(h.gdp, 1);

  /* ch10: J-curve defaults */
  const j = M.jcurve({ i: 6, pay: 15, ramp: 5 }, 30);
  b['ch10.low'] = f(j.low, 1); b['ch10.lowT'] = f(j.lowT, 0); b['ch10.cross'] = f(j.cross, 0);
  b['ch10.end'] = f(j.endMeasured, 0); b['ch10.truth'] = f(j.endTrue, 0);

  /* facts (dated, sourced in BRIEF.md) */
  b['f.cnG25'] = f(F.cnGdp2025, 1); b['f.cnGdpYuan'] = f(F.cnGdpYuan2025, 0);
  b['f.cnQ1'] = f(F.cnQ.q1, 1); b['f.cnQ2'] = f(F.cnQ.q2, 1); b['f.cnQ3'] = f(F.cnQ.q3, 1); b['f.cnQ4'] = f(F.cnQ.q4, 1);
  b['f.cnPcY'] = f(F.cnGdppcYuan2025, 0); b['f.cnPcU'] = f(F.cnGdppcUsd2025, 0); b['f.cnPop'] = f(F.cnPopDrop2025, 0);
  b['f.cnQ326'] = f(F.cnQ3_2026, 1); b['f.cn9m'] = f(F.cn9m2026, 1);
  b['f.imfInv'] = f(F.imfCnGfcf2025, 1); b['f.imfMis'] = f(F.imfMisalloc, 1);
  b['f.wapYear'] = String(F.cnWapPeakYear); b['f.wapPeak'] = f(F.cnWapPeak / 100, 1); b['f.wap23'] = f(F.cnWap2023 / 100, 2);
  b['f.usQ3'] = f(F.usProdQ3_2026, 1); b['f.usYoY'] = f(F.usProdYoY_Q3_2026, 1);
  b['f.bnef'] = f(F.bnef2025, 0); b['f.bnefStat'] = f(F.bnefStationary2025, 0); b['f.bnefCn'] = f(F.bnefChina2025, 0);
  b['f.wbEscaped'] = f(F.wbEscaped, 0); b['f.wbStuck'] = f(F.wbStuck, 0);
  b['f.aceLo'] = f(F.acemogluGdpLo, 2); b['f.aceHi'] = f(F.acemogluGdpHi, 2);
  b['f.bickU'] = f(F.bickUsers, 1); b['f.bickA'] = f(F.bickAll, 1); b['f.bickP'] = f(F.bickProd, 1);
  b['f.fred24'] = f(F.fredSaved2024, 1); b['f.fred26'] = f(F.fredSaved2026, 1);
  b['f.brynA'] = f(F.brynAvg, 0); b['f.brynN'] = f(F.brynNovice, 0); b['f.noyT'] = f(F.noyTime, 0); b['f.noyQ'] = f(F.noyQuality, 0);
  b['f.peng'] = f(F.pengFaster, 1); b['f.metr'] = f(F.metrSlower, 0); b['f.metrE'] = f(F.metrExpected, 0); b['f.metrB'] = f(F.metrBelieved, 0);
  b['f.humlum'] = f(F.humlumTime, 0); b['f.brs'] = f(F.brsTfp2017, 1); b['f.moore'] = f(F.mooreResearchers, 0);
  const E = id => M.ESTIMATES.find(e => e.id === id);
  b['f.agLo'] = f(E('aghion').lo, 2); b['f.agHi'] = f(E('aghion').hi, 2); b['f.agMid'] = f(E('aghion').mid, 2);
  b['f.gs'] = f(E('goldman').lo, 1); b['f.an'] = f(E('anthropic').lo, 1);
  return b;
};
