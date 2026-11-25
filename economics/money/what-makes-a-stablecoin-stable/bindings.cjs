// Numbers in the prose and on the diagrams, computed from models.js at build time ({=name} in content.*.md).
// Language-neutral: a binding is a bare number or a percentage. Amounts that need a language-specific unit (亿 /
// billion) are written in the prose from FRONTIER and pinned in tests/models.cjs. tests/models.cjs re-derives the
// key bindings independently.
module.exports = M => {
  const b = {};
  const f = (x, d) => M.fmt(x, d, 'en');
  const pct = (x, d) => f(x * 100, d == null ? 0 : d) + '%';
  const X = M.FRONTIER;

  /* ch2: a price tag in a volatile unit */
  const u = M.unitOfAccount({ sigma: 0.5, days: 30, band: 0.05 });
  b['ch3.lo'] = f(u.lo, 0); b['ch3.hi'] = f(u.hi, 0); b['ch3.per'] = f(u.perYear, 0); b['ch3.gap'] = f(u.daysBetween, 1);
  b['ch3.sim'] = f(M.unitPath({ sigma: 0.5, band: 0.05 }).resets.length, 0);
  const u2 = M.unitOfAccount({ sigma: 0.02, days: 30, band: 0.05 });
  b['ch3.calmYears'] = f(1 / u2.perYear, 0);
  b['ch3.per25'] = f(M.unitOfAccount({ sigma: 0.25, days: 30, band: 0.05 }).perYear, 0);

  /* ch3: the peg */
  const D3 = { fee: 0.001, cap: 0.01, jump: 0.03, closed: false };
  const open = M.pegSim(D3), shut = M.pegSim(Object.assign({}, D3, { closed: true })), none = M.pegSim(Object.assign({}, D3, { cap: 0 }));
  b['ch4.min'] = f(open.minPrice * 100, 1); b['ch4.minShut'] = f(shut.minPrice * 100, 1);
  b['ch4.outShut'] = f(Math.round(shut.outShare * M.PEG.hours), 0); b['ch4.outOpen'] = f(Math.round(open.outShare * M.PEG.hours), 0);
  b['ch4.outNone'] = f(Math.round(none.outShare * M.PEG.hours), 0); b['ch4.hours'] = f(M.PEG.hours, 0);

  /* ch4: the run */
  const hole = M.runModel(M.RUN_PRESETS.hole), panic = M.runModel(M.RUN_PRESETS.panic), gen = M.runModel(M.RUN_PRESETS.genius);
  b['ch5.loss'] = pct(M.RUN_PRESETS.hole.loss); b['ch5.v0'] = f(hole.V0, 3); b['ch5.unpaid'] = pct(hole.unpaid, 1);
  b['ch5.avg'] = f(hole.avg, 3); b['ch5.jumpy'] = pct(M.RUN_PRESETS.hole.jumpy);
  b['ch5.pLiq'] = pct(M.RUN_PRESETS.panic.liq); b['ch5.pHair'] = pct(M.RUN_PRESETS.panic.hair); b['ch5.pJumpy'] = pct(M.RUN_PRESETS.panic.jumpy);
  b['ch5.pBuf'] = pct(M.RUN_PRESETS.panic.buf); b['ch5.pV0'] = f(panic.V0, 3); b['ch5.pUnpaid'] = pct(panic.unpaid, 1);
  b['ch5.gHair'] = pct(M.RUN_PRESETS.genius.hair, 1); b['ch5.gV0'] = f(gen.V0, 3);

  /* ch5: the spiral */
  const D5 = { cover: 1.6, depth: 0.2, cap: 3, shock: 0.1, reserve: 0 };
  const s = M.spiral(D5);
  b['ch6.cover'] = f(D5.cover, 1); b['ch6.depth'] = pct(D5.depth); b['ch6.thr'] = f(M.spiralThreshold(D5.depth), 0);
  b['ch6.halt'] = f(s.halted, 1); b['ch6.pHalt'] = f(s.lastP, 2); b['ch6.supX'] = f(s.supplyX, 0);
  b['ch6.shock'] = pct(D5.shock);
  const s35 = M.spiral(Object.assign({}, D5, { cover: 3.5 })), s45 = M.spiral(Object.assign({}, D5, { cover: 4.5 }));
  b['ch6.h35'] = f(s35.halted, 1); b['ch6.drop45'] = pct(1 - s45.priceRatio);
  const sr2 = M.spiral(Object.assign({}, D5, { reserve: 3, shock: 0.3 }));
  b['ch6.resHalt'] = sr2.halted == null ? '—' : f(sr2.halted, 1);

  /* ch6: issuer economics */
  const D6 = { eta: 20, delta: 0.5 };
  b['ch7.best'] = pct(M.bestRate(D6.eta)); b['ch7.be'] = pct(M.breakEven(D6), 2); b['ch7.shrink'] = pct(1 - Math.exp(-D6.eta * 0.01));

  /* ch7: CBDC holding cap */
  const all = M.cbdcCap({ cap: 3000, take: 1, kind: 'central' }), calm = M.cbdcCap({ cap: 3000, take: 0.2, kind: 'central' });
  b['ch8.mean'] = f(all.mean, 0); b['ch8.capped'] = f(all.capped, 0); b['ch8.share'] = pct(all.share, 1); b['ch8.ofLiq'] = pct(all.drainOfLiq);
  b['ch8.calm'] = pct(calm.share, 1); b['ch8.liq'] = pct(M.CBDC.liq); b['ch8.med'] = f(M.CBDC.median, 0);
  b['ch8.c10'] = pct(M.cbdcCap({ cap: 10000, take: 1, kind: 'central' }).share, 0);

  /* frontier */
  b['f.usdtShare'] = pct(X.usdt / X.total); b['f.top2'] = pct((X.usdt + X.usdc) / X.total);
  b['f.billShare'] = pct(X.tetherBills / X.tetherRes); b['f.excess'] = pct(X.tetherExcess / X.tetherLiab, 1);
  b['f.payShare'] = pct(X.bisPay / (X.imfVol * 1000), 1);
  return b;
};
