// Numbers in the prose and on the diagrams, computed from models.js at build time ({=name} in content.*.md).
// Language-neutral: the same string goes into both languages. tests/models.cjs re-derives the key ones independently.
module.exports = M => {
  const b = {};
  const f = (x, d) => M.fmt(x, d, 'en');
  const pct = (x, d) => f(x * 100, d) + '%';
  const C = T => T - 273.15;

  /* ch1 */
  const ice = M.PROCESSES.ice, cold = M.ledger(ice, 263.15), warm = M.ledger(ice, 283.15);
  b['ch1.iceH'] = f(ice.dH, 2); b['ch1.iceS'] = f(ice.dS, 1);
  b['ch1.iceSurrCold'] = f(-cold.surr, 1); b['ch1.iceTotCold'] = f(cold.tot, 1);
  b['ch1.iceSurrWarm'] = f(-warm.surr, 1); b['ch1.iceTotWarm'] = f(warm.tot, 1);
  const limeT = M.ledger(M.PROCESSES.lime, 300).Tx;
  b['ch1.limeT'] = f(limeT, 0); b['ch1.limeC'] = f(C(limeT), 0); b['ch1.vapT'] = f(M.ledger(M.PROCESSES.vap, 300).Tx, 0);

  /* ch2 */
  b['ch2.w4'] = String(Math.pow(2, 4)); b['ch2.p100'] = M.sci(Math.pow(2, -100), 2);
  b['ch2.rln2'] = f(M.mixS(0.5), 2); b['ch2.w33'] = String(M.omega(3, 3));
  b['ch2.pAll'] = M.sci(M.split(20, 60, 80).pAll, 2);

  /* ch3 */
  b['ch3.kT300'] = f(M.kT_eV(300) * 1000, 2); b['ch3.RT300'] = f(M.RT_kJ(300), 2); b['ch3.half'] = f(M.eVtokJ(0.5), 0);
  const r3 = M.boltzRatio(0.5, 300), r6 = M.boltzRatio(0.5, 600);
  b['ch3.r300'] = M.sci(r3, 2); b['ch3.r600'] = M.sci(r6, 2); b['ch3.rX'] = f(Math.round(r6 / r3 / 100) * 100, 0);

  /* ch4 */
  const lime = M.rxn('lime'), nh3 = M.rxn('nh3');
  b['ch4.lime300'] = f(M.dG(lime, 300), 0); b['ch4.nh3T'] = f(M.crossT(nh3), 0); b['ch4.nh3C'] = f(C(M.crossT(nh3)), 0);

  /* ch5 */
  const d = M.dissoc(M.T0, 1);
  b['ch5.dG'] = f(d.dG0, 2); b['ch5.xi'] = f(d.xiEq, 2); b['ch5.xiPct'] = pct(d.xiEq, 0); b['ch5.yPct'] = pct(d.xNO2, 0);
  b['ch5.gmin'] = f(-d.Gmin, 2);
  b['ch5.xi10'] = f(M.dissoc(M.T0, 10).xiEq, 2); b['ch5.xi01'] = f(M.dissoc(M.T0, 0.1).xiEq, 2); b['ch5.xi350'] = f(M.dissoc(350, 1).xiEq, 2);

  /* ch6 */
  b['ch6.decade'] = f(M.RT_kJ(M.T0) * Math.LN10, 1);
  const K7 = M.ammoniaK(700), K7l = Math.exp(M.lnK(nh3, 700));
  b['ch6.nh3K298'] = M.sci(M.ammoniaK(M.T0), 2); b['ch6.nh3K700'] = M.sci(K7, 2); b['ch6.nh3K700line'] = M.sci(K7l, 2);
  b['ch6.nh3off'] = f(K7l / K7, 1); b['ch6.nh3H700'] = f(M.ammoniaDG(700).dH, 1); b['ch6.nh3H298'] = f(nh3.dH, 1);

  /* ch7 */
  b['ch7.h2o'] = f(M.dG(M.rxn('water'), M.T0), 0);
  b['ch7.pref'] = M.sci(M.KB * M.T0 / M.HPLANCK, 2);
  const ts = M.twoState(80, 0, -3, 298);
  b['ch7.half'] = f(ts.half, 0); b['ch7.cat10'] = f(M.twoState(80, 10, -3, 298).speedup, 0);
  b['ch7.half100'] = f(M.twoState(100, 0, -3, 298).half / 3600, 0);

  /* ch8 */
  const atp = M.atpDG(10, 0.01);
  b['ch8.glu'] = f(M.ATP.glucose, 1); b['ch8.atp0'] = f(M.ATP.dG0, 1); b['ch8.atp'] = f(atp, 1); b['ch8.net'] = f(M.ATP.glucose + atp, 1);
  b['ch8.F'] = f(M.FARADAY, 0); b['ch8.h2g'] = f(M.WATER.dG, 1); b['ch8.erev'] = f(M.E_REV, 2);
  const fe = M.ellingham('oxFe', 1000), si = M.ellingham('oxSi', 1000), al = M.ellingham('oxAl', 1233.15);
  b['ch8.feT'] = f(fe.Tx, 0); b['ch8.feC'] = f(C(fe.Tx), 0); b['ch8.siT'] = f(si.Tx, 0); b['ch8.alT'] = f(al.Tx, 0);
  b['ch8.alV'] = f(al.volts, 2); b['ch8.alVc'] = f(al.voltsC, 2);

  /* ch9 */
  const A = M.FRONTIER.ammonia;
  b['ch9.dG298'] = f(M.ammoniaDG(M.T0).dG, 1); b['ch9.y298'] = pct(M.ammoniaEq(M.T0, 1, 0).y, 0);
  b['ch9.K723'] = M.sci(M.ammoniaK(723.15), 2); b['ch9.y723p1'] = pct(M.ammoniaEq(723.15, 1, 0).y, 2);
  b['ch9.y723p200'] = pct(M.ammoniaEq(723.15, 200, 0).y, 0);
  const best = M.bestT(200, 1), best10 = M.bestT(200, 10);
  b['ch9.best'] = f(C(best.T), 0); b['ch9.bestOut'] = pct(best.y, 0); b['ch9.bestEq'] = pct(best.yEq, 0);
  b['ch9.best10'] = f(C(best10.T), 0); b['ch9.bestOut10'] = pct(best10.y, 0);
  b['ch9.lhv'] = f(M.lhvNH3() * 1000, 1); b['ch9.avg'] = String(A.avgGJt); b['ch9.bat'] = String(A.batGJt);
  b['ch9.ej'] = String(A.energyEJ); b['ch9.share'] = String(A.sharePct); b['ch9.co2'] = f(A.co2Mt / 100, 1); b['ch9.ea'] = f(M.TP.Ea, 0);

  /* ch10 */
  const dm = M.demix(0.4, 0.8);
  b['ch10.chi'] = f(dm.chi, 1); b['ch10.b1'] = pct(dm.xb, 0); b['ch10.b2'] = pct(1 - dm.xb, 0);

  /* ch11 */
  const F = M.FRONTIER, E = F.electrolysis, w = M.minWorkCO2(F.dac.ppm * 1e-6);
  b['ch11.doeStack'] = String(E.doeStack2022); b['ch11.doeSys'] = String(E.doeSys2022); b['ch11.doeTarget'] = String(E.doeSys2026); b['ch11.doeUlt'] = String(E.doeSysUlt);
  b['ch11.etn'] = f(M.E_TN, 2); b['ch11.ereal'] = f(E.doeStack2022 / M.kWhPerKgH2(1), 2);
  b['ch11.minKwh'] = f(M.kWhPerKgH2(M.E_REV), 1); b['ch11.hhvKwh'] = f(M.kWhPerKgH2(M.E_TN), 1);
  b['ch11.doeX'] = f(E.doeSys2022 / M.kWhPerKgH2(M.E_REV), 1);
  b['ch11.ppm'] = String(F.dac.ppm); b['ch11.w'] = f(w, 1); b['ch11.wt'] = f(M.perTonneKWh(w), 0); b['ch11.wFlue'] = f(M.minWorkCO2(0.12), 1);
  b['ch11.gw'] = String(E.gw); b['ch11.envision'] = f(F.envision.kt / 10, 0); b['ch11.neom'] = f(F.neom.mt * 100, 0);
  b['ch11.mammoth'] = f(F.dac.mammothKt / 10, 1); b['ch11.stratos'] = f(F.dac.stratosKt / 10, 0);
  b['ch11.ocSamples'] = String(F.ocx24.samples); b['ch11.ocTested'] = String(F.ocx24.tested); b['ch11.ocRelax'] = f(F.ocx24.relax / 100, 2);
  b['ch11.liJ'] = String(F.liNRR.mAcm2); b['ch11.liFE'] = String(F.liNRR.fe); b['ch11.liEE'] = String(F.liNRR.ee); b['ch11.liH'] = String(F.liNRR.hours);
  return b;
};
