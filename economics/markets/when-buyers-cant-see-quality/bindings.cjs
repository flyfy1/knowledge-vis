// Prose numbers computed from models.js ({=name} in content.*.md). Language-neutral.
module.exports = M => {
  const f = M.fmt, y = x => f(x * 1e4, 0), pc = (x, d) => f(x * 100, d || 0);
  const a = M.insure(M.CH1), a1 = M.insure(Object.assign({}, M.CH1, { g: 1 })), a20 = M.insure(Object.assign({}, M.CH1, { p: 0.2 }));
  const L = M.lemons({ b: 1.5, lo: 2 }), L0 = M.lemons({ b: 1.5, lo: 0 }), fx = M.lemonsFixed(1.5, 2, 10);
  const P = M.pool({}), P3 = M.pool({ K: 3 }), P5 = M.pool({ K: 5 }), Pi1 = M.pool({ inc: 1000 }), Pi15 = M.pool({ inc: 1500 });
  const S = M.CH5, sDef = M.screen(Object.assign({}, S, { D: 3 })), Ds = M.minSeparatingD(S), sStar = M.screen(Object.assign({}, S, { D: Ds + 0.01 }));
  const sp = M.spence(M.CH6), sp15 = M.spence(Object.assign({}, M.CH6, { eStar: 1.5 }));
  const h0 = M.hazard(0), hb = M.hazardBest(), fb = M.firstBest();
  const W = M.sw(M.CH8), W0 = M.sw(Object.assign({}, M.CH8, { gap: 0 }));
  const q0 = M.pd(0, 0.3, 5), q10 = M.pd(0, 0.3, 15), qThin = M.pd(0, 0.3, 0), qLate = M.pd(2, 0.3, 5), cut = M.cutoff(580);
  return {
    'ch1.ev': y(a.ev), 'ch1.max': y(a.maxPrem), 'ch1.rp': y(a.riskPrem), 'ch1.ratio': f(a.ratio, 2), 'ch1.max1': y(a1.maxPrem),
    'ch1.ev20': y(a20.ev), 'ch1.max20': y(a20.maxPrem), 'ch1.ratio20': f(a20.ratio, 2),
    'ch3.p0': f(L.hist[0].p, 2), 'ch3.k0': String(L.hist[0].k), 'ch3.p1': f(L.hist[1].p, 2), 'ch3.k1': String(L.hist[1].k),
    'ch3.rounds': String(L.hist.length - 1), 'ch3.pf': f(L.final.p, 2), 'ch3.kf': String(L.final.k), 'ch3.gf': pc(L.final.gainShare),
    'ch3.fix': f(fx.p, 0), 'ch3.k0lo0': String(L0.final.k), 'ch3.r0lo0': String(L0.hist.length - 1),
    'ch4.mean': f(P.meanCost, 0), 'ch4.med': pc(P.ps[500], 1), 'ch4.wtp1': f(M.wtpYuan(0.01, 2), 0), 'ch4.p0': f(P.hist[0].prem[0], 0), 'ch4.n0': String(P.hist[0].nIn),
    'ch4.p1': f(P.hist[1].prem[0], 0), 'ch4.rounds': String(P.rounds), 'ch4.pf': f(P.final.prem[0], 0), 'ch4.nf': String(P.final.nIn),
    'ch4.s1000': pc(Pi1.final.share), 'ch4.s1500': pc(Pi15.final.share), 'ch4.pr1500': f(Pi15.final.prem[0], 0),
    'ch4.s3': pc(P3.final.share), 'ch4.lo3': f(P3.final.prem[0], 0), 'ch4.s5': pc(P5.final.share), 'ch4.lo5': f(P5.final.prem[0], 0),
    'ch5.aprem': y(S.pH * S.L), 'ch5.ds': f(Ds, 2), 'ch5.bprem': y(S.pL * (S.L - Ds)), 'ch5.loss3': y(-sDef.profit), 'ch5.lb': pc(M.lamBreak(S)),
    'ch5.cefull': f(sStar.ceLfull, 2), 'ch5.cesep': f(sStar.ceLsep, 2),
    'ch6.a': f(sp.range[0], 1), 'ch6.b': f(sp.range[1], 0), 'ch6.hi': f(sp.highNet, 0), 'ch6.lo': f(sp.lowNet, 0), 'ch6.avg': f(sp.avg, 0), 'ch6.hi15': f(sp15.highNet, 0),
    'ch7.p0': pc(h0.p), 'ch7.prem0': y(h0.prem), 'ch7.bs': pc(hb.s), 'ch7.be': pc(hb.e), 'ch7.bp': pc(hb.p, 1), 'ch7.bprem': y(hb.prem),
    'ch7.ce0': f(h0.ce, 2), 'ch7.ceb': f(hb.ce, 2), 'ch7.cefb': f(fb.ce, 2), 'ch7.efb': pc(fb.e),
    'ch8.r1': pc(W.G[0].rMax, 1), 'ch8.r4': pc(W.G[3].rMax, 1), 'ch8.best': pc(W.best.r, 1), 'ch8.ret': pc(W.best.ret - 1, 1), 'ch8.rat': pc(W.rationed),
    'ch8.top0': pc(W0.best.r, 0), 'ch8.ret0': pc(W0.best.ret - 1, 0),
    'ch8.pr1': pc(W.priced[0].r, 1), 'ch8.pr2': pc(W.priced[1].r, 1), 'ch8.pr3': pc(W.priced[2].r, 1), 'ch8.pr4': pc(W.priced[3].r, 0),
    'ch9.q0': pc(q0, 1), 'ch9.s0': f(M.score(q0), 0), 'ch9.s15': f(M.score(q10), 0), 'ch9.sthin': f(M.score(qThin), 0), 'ch9.slate': f(M.score(qLate), 0), 'ch9.qlate': pc(qLate, 1),
    'ch9.ap': pc(cut.approve), 'ch9.bad': pc(cut.badApproved, 1), 'ch9.all': pc(cut.badRate, 1), 'ch9.caught': pc(cut.caught),
  };
};
