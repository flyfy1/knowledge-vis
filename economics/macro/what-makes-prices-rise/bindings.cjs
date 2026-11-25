// Prose numbers computed from models.js ({=name} in content.*.md). Language-neutral.
'use strict';
module.exports = M => {
  const f = (x, d) => M.fmt(x, d), F = M.FACTS, abs = Math.abs;
  const qe = M.qty(2008, 2014), sv = M.qty(2019, 2021), rb = M.qty(2021, 2023), al = M.qty(1960, 2025);
  const g = (q, k) => 100 * q.g[k];
  const s0 = M.adas('supply', 0.5, 0), s1 = M.adas('supply', 0.5, 1), d0 = M.adas('demand', 0.5, 0), b0 = M.adas('both', 0.5, 0);
  const c0 = M.adas('china', 0.5, 0), c1 = M.adas('china', 0.5, 1);
  const sl = M.eraSlopes();
  const h0 = M.phillips({ mode: 'hot', theta: 0, gap: 1 }), h6 = M.phillips({ mode: 'hot', theta: 0.6, gap: 1 }), h1 = M.phillips({ mode: 'hot', theta: 1, gap: 1 });
  const o0 = M.phillips({ mode: 'hot', theta: 0, gap: 1, oil: true }), o8 = M.phillips({ mode: 'hot', theta: 0.8, gap: 1, oil: true });
  const k0 = M.phillips({ mode: 'cool', theta: 0, gap: 1 }), k2 = M.phillips({ mode: 'cool', theta: 0, gap: 2 }), k6 = M.phillips({ mode: 'cool', theta: 0.6, gap: 1 });
  const infl = y => M.cpiInfl().find(r => r[0] === y)[1];
  const ser = (n, y) => M.usSeries(n).find(r => r[0] === y)[1];
  const w = o => M.spiral(Object.assign({ s: 0.1, X: 50, rho: 0.7, a: 0.5, theta: 0.6 }, o));
  const sg = d => M.seignorage({ d, k: 0.10, alpha: 5 });
  const dd = o => M.debtDeflation(Object.assign({ b0: 1, i: 0.05, sigma: 0.1, g: 0, pi: -0.068, phi: 0 }, o));
  const dep = M.depression(), jp = M.wbAvg('jpn', 1995, 2012), wb = (c, y) => M.data.wb[c][y - M.data.wb.y0];
  const roots4 = sg(0.04).roots, roots2 = sg(0.02).roots;
  return {
    'hero.base': f(M.qty(2007, 2014).f.base, 1), 'hero.cpi2206': f(F.us2206.cpi, 1), 'hero.neg': String(F.china.negMonths),
    'hero.ppi': f(F.china2610.ppi, 1), 'hero.cpi': f(F.china2610.cpi, 1),
    'ch1.qeM': f(g(qe, 'M'), 1), 'ch1.qeY': f(g(qe, 'Y'), 1), 'ch1.qeCf': f(100 * qe.cf.pi, 1), 'ch1.qeP': f(g(qe, 'P'), 1),
    'ch1.qeV': f(abs(g(qe, 'V')), 1), 'ch1.qeV0': f(qe.v0, 2), 'ch1.qeV1': f(qe.v1, 2),
    'ch1.svM': f(g(sv, 'M'), 1), 'ch1.svV': f(abs(g(sv, 'V')), 1), 'ch1.svP': f(g(sv, 'P'), 1),
    'ch1.rbM': f(g(rb, 'M'), 1), 'ch1.rbV': f(g(rb, 'V'), 1), 'ch1.rbP': f(g(rb, 'P'), 1),
    'ch1.allF': f(al.f.M, 0), 'ch1.allV': f(g(al, 'V'), 1), 'ch1.allP': f(g(al, 'P'), 1), 'ch1.allCf': f(100 * al.cf.pi, 1),
    'ch2.sPi1': f(s0.pi1, 1), 'ch2.sY1': f(s0.y1, 1), 'ch2.sLowT': String(s0.low.t), 'ch2.sLow': f(s0.low.pi, 1), 'ch2.sYs': f(s0.ySum, 1),
    'ch2.fPi1': f(s1.pi1, 1), 'ch2.fPT': f(s1.pT, 1), 'ch2.dPi1': f(d0.pi1, 1), 'ch2.dY1': f(d0.y1, 1), 'ch2.bPi1': f(b0.pi1, 1), 'ch2.bY1': f(b0.y1, 1),
    'ch3.s60': f(sl.e60, 2), 'ch3.s70': f(sl.e70, 2), 'ch3.s84': f(sl.e84, 2), 'ch3.s20': f(sl.e20, 2),
    'ch3.hot10': f(h0.pi10, 1), 'ch3.hot20': f(h0.piT, 1), 'ch3.hot06': f(h6.ss, 2), 'ch3.hot1': f(h1.ss, 1),
    'ch3.oil0': f(o0.piT, 1), 'ch3.oil8': f(o8.piT, 1), 'ch3.nrou': f(F.nrou26, 1),
    'ch4.cpi80': f(infl(1980), 1), 'ch4.m80': f(ser('mich', 1980), 1), 'ch4.e82': f(ser('exp10', 1982), 1),
    'ch4.cpi22': f(infl(2022), 1), 'ch4.m22': f(ser('mich', 2022), 1), 'ch4.e22': f(ser('exp10', 2022), 1),
    'ch4.c0n': String(k0.years), 'ch4.c0py': f(k0.pointYears, 0), 'ch4.c2py': f(k2.pointYears, 0), 'ch4.c6n': String(k6.years), 'ch4.c6py': f(k6.pointYears, 0),
    'ch4.cpi83': f(infl(1983), 1), 'ch4.u82': f(ser('u', 1982), 1), 'ch4.m25': f(ser('mich', 2025), 1), 'ch4.cpi25': f(infl(2025), 1), 'ch4.e25': f(ser('exp10', 2025), 1),
    'ch5.p1': f(w({}).pi1, 1), 'ch5.p8': f(w({}).pi8, 1), 'ch5.spiral8': f(w({ rho: 1, a: 1, theta: 0 }).pi8, 1), 'ch5.stuck8': f(w({ rho: 1, a: 1 }).pi8, 1),
    'ch5.om1': f(w({}).omega1, 1),
    'ch6.jorda': String(F.jorda), 'ch6.max': f(100 * M.seignMax(0.10, 5).d, 1), 'ch6.mo4': f(100 * roots4.low, 1), 'ch6.ss4': f(100 * M.annualOfMonthly(roots4.low), 0),
    'ch6.ss2': f(100 * M.annualOfMonthly(roots2.low), 0), 'ch6.h10': String(sg(0.10).hyperAt), 'ch6.h15': String(sg(0.15).hyperAt),
    'ch7.cpi': f(abs(100 * dep.cpi), 1), 'ch7.pa': f(100 * dep.cpiPerYear, 1), 'ch7.b4': f(100 * dd({}).b4, 0), 'ch7.b10': f(100 * dd({}).bT, 0),
    'ch7.rr': f(100 * dd({}).realRate, 1), 'ch7.ref': f(100 * dd({ pi: 0.02 }).bT, 0), 'ch7.f10': f(100 * dd({ phi: 0.1 }).bT, 0),
    'ch7.ngdp': f(abs(100 * dep.ngdp), 1), 'ch7.rgdp': f(abs(100 * dep.rgdp), 1), 'ch7.burden': f(dep.realBurden, 2), 'ch7.dti': f(dep.debtToIncome, 2),
    'ch8.jpAvg': f(jp.avg, 2), 'ch8.jpNeg': String(jp.neg), 'ch8.jp22': f(wb('jpn', 2022), 1), 'ch8.jp23': f(wb('jpn', 2023), 1), 'ch8.jp24': f(wb('jpn', 2024), 1), 'ch8.jp25': f(wb('jpn', 2025), 1),
    'ch8.cn23': f(F.china.cpi23, 1), 'ch8.cn24': f(F.china.cpi24, 1), 'ch8.cn25': f(F.china.cpi25, 1),
    'ch8.ppi23': f(abs(F.china.ppi23), 1), 'ch8.ppi24': f(abs(F.china.ppi24), 1), 'ch8.ppi25': f(abs(F.china.ppi25), 1),
    'ch8.chPi1': f(c0.pi1, 1), 'ch8.chPT': f(abs(c0.pT), 1), 'ch8.chFull': f(abs(c1.pT), 1),
    'ch8.brent': String(F.brentPeak), 'ch8.turn': f(F.china.turn, 1), 'ch8.core': f(F.china2610.core, 1), 'ch8.cnWb': f(wb('chn', 2025), 2),
    'c.mining': f(F.china2610.mining, 1), 'c.raw': f(F.china2610.raw, 1), 'c.proc': f(F.china2610.processing, 1), 'c.cons': f(F.china2610.consumer, 1),
    'c.cpi': f(F.china2610.cpi, 1), 'c.core': f(F.china2610.core, 1),
    'ch10.gap': f(F.shapiro.gap, 1), 'ch10.coreGap': f(F.shapiro.coreGap, 1), 'ch10.fedGoods': f(F.fedTariff.coreGoods, 1), 'ch10.fedCore': f(F.fedTariff.corePce, 1),
    'ch10.us': f(F.us2610.cpi, 2), 'ch10.usCore': f(F.us2610.core, 2), 'ch10.e10': f(F.exp10Nov26, 2)
  };
};
