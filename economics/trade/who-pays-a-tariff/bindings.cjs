'use strict';
/* Prose numbers computed from models.js ({=name} in content.<lang>.md). Language-neutral: digits only, plus % and the
   minus sign, so the same string serves both languages. tests/models.cjs re-derives each one independently. */
module.exports = M => {
  const f = (x, d) => M.fmt(x, d, 'en');
  const pc = (x, d) => f(x * 100, d == null ? 1 : d) + '%';
  const apc = (x, d) => f(Math.abs(x) * 100, d == null ? 1 : d) + '%';
  const X = M.FRONTIER;
  const e04 = M.elastic(0.4, 0.2), e15 = M.elastic(1.5, 0.2);
  const i2 = M.incidence(1.5, 3, 0.25), sw = M.incidence(1.5, 0.5, 0.25);
  const L = M.ledger(20, 10), o10 = M.optimalTariff(10), o4 = M.optimalTariff(4), Linf = M.ledger(20, Infinity);
  const R = M.ricardo(), R85 = M.ricardo({ p: 0.85 });
  const D = M.divert();
  const RM = M.retalMatrix(10, o10.t);
  const k1 = M.chokeAt(1 / 12), k2 = M.chokeAt(2), k8 = M.chokeAt(8);
  const P = M.passthru();
  return {
    'e1.dq04': apc(e04.dq), 'e1.sp04': apc(e04.dspend), 'e1.dq15': apc(e15.dq), 'e1.sp15': apc(e15.dspend),
    'i2.pb': apc(i2.Pb - 1), 'i2.ps': apc(i2.Ps - 1), 'i2.dollar': pc(i2.dollarShare, 0), 'i2.swap': pc(sw.share, 0),
    'i2.dwl': pc(i2.dwl), 'i2.rev': pc(i2.rev), 'i2.dwlx': f(M.incidence(1.5, 3, 0.2).dwl / M.incidence(1.5, 3, 0.1).dwl, 1),
    'l3.P': f(L.P, 1), 'l3.Ps': f(L.Pstar, 1), 'l3.M': f(L.M, 1), 'l3.cs': f(L.csLoss, 0), 'l3.ps': f(L.psGain, 0),
    'l3.rev': f(L.rev, 0), 'l3.tot': f(L.tot, 0), 'l3.net': f(-L.net, 0), 'l3.opt': f(o10.t, 1), 'l3.optNet': f(o10.net, 0),
    'l3.opt4': f(o4.t, 1), 'l3.netInf': f(-Linf.net, 0),
    'r4.pe': f(R.pe, 3), 'r4.gE': pc(R.gE), 'r4.gP': pc(R.gP), 'r4.gE85': pc(R85.gE),
    'b5.appr': pc(M.tariffShock(1, 100).apprFull / 100),
    'd6.dC': apc(D.toC1 / D.toC0 - 1, 0), 'd6.dV': apc(D.toV1 / D.toV0 - 1, 0), 'd6.dP': apc(D.dP), 'd6.dT': apc(D.total1 / D.total0 - 1),
    't6.t': f(o10.t, 1), 't6.win': f(RM.tf.a, 0), 't6.lose': f(-RM.tf.b, 0), 't6.both': f(-RM.tt.a, 0),
    'f.fkRetal': f(-X.fk.retal, 2) + '%',
    'k7.p1': f(k1.P, 1), 'k7.rev1': f(k1.ctrlRev, 1), 'k7.p2': f(k2.P, 2), 'k7.p8': f(k8.P, 2), 'k7.sh8': pc(k8.share, 0), 'k7.rev8': f(k8.ctrlRev, 2),
    'p8.ex': pc(Math.exp(P.o.g + Math.log(1.25)) - 1), 'p8.naive': pc(P.naive, 0), 'p8.did': pc(P.border.b, 0), 'p8.retail': f(P.retail.b, 2),
    'f.arwTax': f(X.arw.taxPerMonth * 10, 0), 'f.arwDwl': f(X.arw.dwlPerMonth * 10, 0),
    'f.fgLoss': f(X.fgkk.loss * 10, 0), 'f.fgLossGdp': f(X.fgkk.lossGdp, 2) + '%', 'f.fgNet': f(X.fgkk.net * 10, 0), 'f.fgNetGdp': f(X.fgkk.netGdp, 2) + '%',
    'f.washers': f(X.washers.rise, 0) + '%',
    'f.fk24': f(X.fk.avg2024, 1) + '%', 'f.fk25': f(X.fk.avg2025, 1) + '%', 'f.fkFree': f(X.fk.dutyFree, 0) + '%', 'f.fkPt': f(X.fk.pt, 0) + '%',
    'f.fkLo': f(X.fk.welfLo, 2) + '%', 'f.fkHi': '+' + f(X.fk.welfHi, 2) + '%',
    'f.gn18': f(X.gn.pt2018, 0) + '%', 'f.gn25': f(X.gn.pt2025, 0) + '%', 'f.gnStat': f(X.gn.statutory, 1) + '%', 'f.gnApp': f(X.gn.applied, 1) + '%',
    'f.fedGoods': f(X.fed.coreGoods, 1) + '%', 'f.fedCore': f(X.fed.corePce, 1) + '%', 'f.clv': f(X.clv.retail, 0) + '%',
    'f.freund': f(X.freund.absorbed, 0), 'f.frLo': f(X.freund.dominantLo, 0) + '%', 'f.frHi': f(X.freund.dominantHi, 0) + '%',
    'f.cn17': f(X.fk.chinaShare17, 0) + '%', 'f.cn25': f(X.fk.chinaShare25, 0) + '%', 'f.cnSur': f(X.china.surplus2025, 2), 'f.cnSur24': f(X.china.surplus2024, 2),
    'f.bea': f(X.bea.ca2025, 2), 'f.beaGdp': f(X.bea.caGdp2025, 1) + '%', 'f.bea24': f(X.bea.caGdp2024, 1) + '%',
    'f.iea25': f(X.iea.refined2025, 0) + '%'
  };
};
