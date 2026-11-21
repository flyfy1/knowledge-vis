// Numbers in the prose, computed from models.js at build time ({=name} in content.*.md).
// Language-neutral: the same string goes into both languages. tests/models.cjs pins these;
// tools/crosscheck.cjs verifies the underlying V8 14.6.202.34-node.40 facts against /opt/homebrew/bin/node.
module.exports = M => {
  const b = {};
  const f = (x, d) => M.fmt(x, d, 'en');

  /* Pinned release & thresholds (ch1) */
  b['v8.ver'] = M.V8_RELEASE.v8;
  b['node.ver'] = M.V8_RELEASE.node;
  b['ch1.fbvThresh'] = f(M.TIER_THRESHOLDS.feedbackAlloc, 0);
  b['ch1.magOsrThresh'] = f(M.TIER_THRESHOLDS.maglevOsr, 0);
  b['ch1.magThresh'] = f(M.TIER_THRESHOLDS.maglev, 0);
  b['ch1.tfOsrThresh'] = f(M.TIER_THRESHOLDS.turbofanOsr, 0);
  b['ch1.tfThresh'] = f(M.TIER_THRESHOLDS.turbofan, 0);
  b['ch1.ignNs'] = f(M.MEASURED.ignNsPerCall, 0);
  b['ch1.spNs'] = f(M.MEASURED.spNsPerCall, 1);
  b['ch1.magNs'] = f(M.MEASURED.magNsPerCall, 1);
  b['ch1.tfNs'] = f(M.MEASURED.tfNsPerCall, 1);
  b['ch1.magCompileMs'] = f(M.MEASURED.magCompileMs, 3);
  b['ch1.tfCompileMs'] = f(M.MEASURED.tfCompileMs, 3);
  const cold = M.simPipeline({ calls: 5, bytecodeBytes: 120, lazyPreparse: true });
  b['ch1.coldTiered'] = f(cold.tieredMs, 3);
  b['ch1.coldAlwaysTf'] = f(cold.alwaysTurboMs, 2);

  /* ch2: pointer tagging, Smi & HeapNumber */
  const smi31 = M.inspectValue(1073741823, 'compressed');
  const smi32 = M.inspectValue(2147483647, 'full64');
  const heap64 = M.inspectValue(0.5, 'full64');
  const heap32 = M.inspectValue(0.5, 'compressed');
  b['ch2.smi31Max'] = f(smi31.smiMax, 0);
  b['ch2.smi32Max'] = f(smi32.smiMax, 0);
  b['ch2.heap64B'] = f(heap64.heapBytes, 0);
  b['ch2.heap32B'] = f(heap32.heapBytes, 0);
  b['ch2.obj2_32B'] = f(smi31.obj2Bytes, 0);
  b['ch2.obj2_64B'] = f(smi32.obj2Bytes, 0);
  b['ch2.heapLimitGiB'] = f(M.MEASURED.freshHeap.heapLimitBytes / (1024 * 1024 * 1024), 2);

  /* ch3: Hidden Classes (Map) & slack tracking */
  const slEarly = M.simMapScenario('slack_early');
  const slDone = M.simMapScenario('slack_done');
  const dict = M.simMapScenario('delete_dict');
  b['ch3.slackCalls'] = f(M.SLACK_INITIAL_CALLS, 0);
  b['ch3.slackEarlyB'] = f(slEarly.instanceSize64, 0);
  b['ch3.slackEarlySlots'] = f(slEarly.inObjectSlots, 0);
  b['ch3.slackDoneB'] = f(slDone.instanceSize64, 0);
  b['ch3.slackDoneSlots'] = f(slDone.inObjectSlots, 0);
  b['ch3.dictObjB'] = f(dict.instanceSize64, 0);

  /* ch4: Inline Cache */
  b['ch4.maxPoly'] = f(M.IC_MAX_POLYMORPHIC, 0);
  b['ch4.monoNs'] = f(M.MEASURED.icNs[1], 2);
  b['ch4.megaNs'] = f(M.MEASURED.icNs[5], 2);

  /* ch5: Bytecode */
  b['ch5.addLen'] = '13';
  b['ch5.loopLen'] = '33';

  /* ch6: Deopt */
  const dClean = M.simDeoptTrace('clean', true);
  const dLate = M.simDeoptTrace('late_map', true);
  b['ch6.cleanMs'] = f(dClean.totalMs, 3);
  b['ch6.lateMs'] = f(dLate.totalMs, 3);

  /* ch7: ElementsKind */
  b['ch7.smiArrNs'] = f(M.MEASURED.arrNsPerElem.packed_smi, 2);
  b['ch7.dblArrNs'] = f(M.MEASURED.arrNsPerElem.packed_double, 2);
  b['ch7.holeyArrNs'] = f(M.MEASURED.arrNsPerElem.holey_double, 2);
  b['ch7.dictArrNs'] = f(M.MEASURED.arrNsPerElem.dict, 2);

  /* ch8: GC */
  b['ch8.newSpaceKiB'] = f(M.MEASURED.freshHeap.newSpaceBytes / 1024, 0);
  b['ch8.oldUsedMiB'] = f(M.MEASURED.freshHeap.oldSpaceUsedBytes / (1024 * 1024), 2);
  b['ch8.scavLoMs'] = f(M.MEASURED.scavengeRangeMs[0], 2);
  b['ch8.scavHiMs'] = f(M.MEASURED.scavengeRangeMs[1], 2);

  return b;
};
