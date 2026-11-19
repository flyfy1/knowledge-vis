'use strict';
const M = require('./models.js');

module.exports = function () {
  const lay = M.v2Layout(99493, 1024);
  const xor = M.xorRecover('jpg', 0x19);
  const fp3 = M.knownPlaintextCheck('magic3', 550);
  const fp16 = M.knownPlaintextCheck('exact16', 550);
  const win = M.memoryWindowProb(1350, 450, 1, 30);
  const adrp = M.adrpResolve(0x4492ff0, 0x83d26f8, '0x1224f8000');

  return {
    'ch1.plain': M.fmt(lay.plainSize, 0, 'zh'),
    'ch1.dat': M.fmt(lay.datSize, 0, 'zh'),
    'ch1.diff': String(lay.overhead),
    'ch1.aesPad': String(lay.aesCipherBytes),
    'ch1.xorBytes': M.fmt(lay.xorBytes, 0, 'zh'),
    'ch2.keyHex': xor.keyHex,
    'ch4.fp3': M.fmt(fp3.expectedFP, 1, 'zh'),
    'ch4.fp16Exp': String(Math.round(fp16.log10FP)),
    'ch5.scanSec': M.fmt(win.scanSec, 1, 'zh'),
    'ch5.pSinglePct': M.fmt(win.pSingle * 100, 3, 'zh') + '%',
    'ch5.p30Pct': M.fmt(win.pMulti * 100, 2, 'zh') + '%',
    'ch7.pc': adrp.pcHex,
    'ch7.target': adrp.targetHex,
    'ch7.delta': M.fmt(adrp.pageDelta, 0, 'zh'),
    'ch7.off': adrp.pageOffHex,
  };
};
