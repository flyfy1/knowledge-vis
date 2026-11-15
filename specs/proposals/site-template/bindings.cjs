'use strict';
// Numbers the prose states, computed from the page's own models. Language-neutral: the translator never sees
// these expressions, only the {=name} tokens. Every name must be used in content.zh.md (the build fails otherwise).
module.exports = M => {
  const D = M.disk, f0 = x => M.fmt(x), f1 = x => M.fmt(x, 1), f2 = x => M.fmt(x, 2);
  const r = D.random(7200, 1), sh = D.random(7200, 0.1);
  return {
    'ch2.seek': f1(r.seek), 'ch2.rot': f2(r.rot), 'ch2.t': f1(r.t), 'ch2.iops': f0(r.iops), 'ch2.seekShare': f0(r.seekShare * 100),
    'ch2.iops15k': f0(D.random(15000, 1).iops), 'ch2.iops5400': f0(D.random(5400, 1).iops),
    'ch2.shortSeek': f1(sh.seek), 'ch2.shortIops': f0(sh.iops),
    'ch2.od': f0(D.odRate(7200)), 'ch2.id': f0(D.idRate(7200)), 'ch2.mean': f0(D.meanSeq(7200))
  };
};
