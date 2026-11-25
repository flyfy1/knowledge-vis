'use strict';
/* Prose numbers for content.*.md, computed from models.js and data.js ({=name}). Language-neutral. */
module.exports = M => {
  const D = require('./data.js');
  const f = (x, d) => M.fmt(x, d, 'en');
  const p = (x, d) => M.pct(x, d, 'en');
  // ch3: a 0.5 µm-radius bead in 20 °C water; a 0.5 nm "molecule" in 20 °C water (order of magnitude only).
  const Db = M.stokesEinstein(0.5e-6, 20), Db37 = M.stokesEinstein(0.5e-6, 37), Dm = M.stokesEinstein(0.5e-9, 20);
  const g1 = M.gbm(0.07, 0.2, 1), g10 = M.gbm(0.07, 0.2, 10), g16 = M.gbm(0.07, 0.2, 16), g40 = M.gbm(0.07, 0.4, 10);
  const h = q => M.horizon(D, q);
  const v = (e, q) => M.vrAt(D, e, q);
  const r50 = M.ruin(50, 100, 18 / 37), r20 = M.ruin(20, 100, 18 / 37), rf = M.ruin(50, 100, 0.5);
  return {
    'ch1.in100': p(M.shareWithin(100, 10), 1),
    'ch1.in2_100': p(M.shareWithin(100, 20), 1),
    'ch1.in10000': p(M.shareWithin(10000, 100), 1),
    'ch1.abs100': f(M.meanAbs(100), 2),
    'ch1.ratio': f(Math.sqrt(2 / Math.PI), 2),
    'ch2.skew1': f(M.sumTheory('lopsided', 1).skew, 2),
    'ch2.skew100': f(M.sumTheory('lopsided', 100).skew, 2),
    'ch3.Db': f(Db * 1e12, 2),
    'ch3.Db37': f(Db37 * 1e12, 2),
    'ch3.rms1': f(M.rms1d(Db, 1) * 1e6, 2),
    'ch3.t10': f(M.timeToSpread(Db, 10e-6), 0),
    'ch3.t1mm': f(M.timeToSpread(Db, 1e-3) / 86400, 1),
    'ch3.t1cm': f(M.timeToSpread(Db, 1e-2) / (365.25 * 86400), 1),
    'ch3.Dm': f(Dm * 1e12, 0),
    'ch3.m10': f(M.timeToSpread(Dm, 10e-6), 2),
    'ch3.m1cm': f(M.timeToSpread(Dm, 1e-2) / 86400, 1),
    'ch4.ann': p(M.annualise(D.eras.all.sd, D.perYear), 1),
    'ch4.daily': p(D.eras.all.sd, 2),
    'ch4.perYear': f(D.perYear, 0),
    'ch4.loss1': p(g1.pLoss, 0),
    'ch4.loss10': p(g10.pLoss, 0),
    'ch4.tStar': f(g16.tStar, 0),
    'ch4.lossStar': p(g16.pLoss, 0),
    'ch4.med10': f(g10.median, 0),
    'ch4.mean10': f(g10.mean, 0),
    'ch4.med10s40': f(g40.median, 0),
    'ch5.n': f(D.n, 0),
    'ch5.from': D.from.slice(0, 4),
    'ch5.to': D.to,
    'ch5.k1': f(h(1).kurt, 1),
    'ch5.k5': f(h(5).kurt, 1),
    'ch5.k21': f(h(21).kurt, 1),
    'ch5.k63': f(h(63).kurt, 1),
    'ch5.o4': f(h(1).over4, 0),
    'ch5.e4': f(h(1).exp4, 1),
    'ch5.r21': f(h(21).ratio, 2),
    'ch5.r63': f(h(63).ratio, 2),
    'ch5.vmin': p(D.rv21.min, 0),
    'ch5.vminDate': D.rv21.minDate,
    'ch5.vmax': p(D.rv21.max, 0),
    'ch5.vmaxDate': D.rv21.maxDate,
    'ch5.k1n': f(D.tail.k1, 0),
    'ch5.a1': f(D.tail.a1, 1),
    'ch5.a25': f(D.tail.a25, 1),
    'ch5.shuffles': f(D.shuffles, 0),
    'ch5.e1acf': f(D.eras.e1.acf1, 2),
    'ch5.e1vr21': f(v('e1', 21).vr, 2),
    'ch5.e2vr21': f(v('e2', 21).vr, 2),
    'ch5.e3vr21': f(v('e3', 21).vr, 2),
    'ch5.e3lo21': f(v('e3', 21).lo, 2),
    'ch5.e3acf': f(D.eras.e3.acf1, 2),
    'ch5.allvr21': f(v('all', 21).vr, 2),
    'ch5.allhi21': f(v('all', 21).hi, 2),
    'ch6.t50': p(r50.timid, 1),
    'ch6.b50': p(r50.bold, 1),
    'ch6.n50': f(r50.timidBets, 0),
    'ch6.t20': p(r20.timid, 1),
    'ch6.b20': p(r20.bold, 1),
    'ch6.nfair': f(rf.timidBets, 0),
    'ch7.merge': f(M.mergeStep(), 0),
    'ch7.sig1000': f(Math.sqrt(M.alphaBar(1000)), 4),
    'ch8.o4x': f(h(1).over4 / h(1).exp4, 0),
    'ch8.m1': p(0.2 * Math.sqrt(1 / 12), 1),
  };
};
