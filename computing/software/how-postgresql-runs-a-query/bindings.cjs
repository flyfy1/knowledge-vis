// Numbers in the prose, computed from models.js at build time ({=name} in content.*.md).
// Language-neutral: the same string goes into both languages. tests/models.cjs pins every value;
// tools/crosscheck.cjs validates the underlying models against PostgreSQL 17.6 / 18.0 source specs & RFC vectors.
module.exports = M => {
  const b = {};
  const f = (x, d) => M.fmt(x, d, 'en');
  const pct = (x, d) => f(x * 100, d) + '%';

  /* ch2: planner cost crossover & correlation error */
  const cLow = M.plannerCosts({ selectivity: 0.001, randomPageCost: 4.0 });
  const cMid = M.plannerCosts({ selectivity: 0.05, randomPageCost: 4.0 });
  const cSsd = M.plannerCosts({ selectivity: 0.05, randomPageCost: 1.1 });
  const corr = M.correlationMismatch(false);
  b['ch2.seqCost'] = f(cLow.seqCost, 0);
  b['ch2.idxLowCost'] = f(cLow.indexCost, 0);
  b['ch2.bmpMidCost'] = f(cMid.bitmapCost, 0);
  b['ch2.crossPct'] = pct(cMid.crossSeqVsBitmap, 1);
  b['ch2.crossSsdPct'] = pct(cSsd.crossSeqVsBitmap, 1);
  b['ch2.corrEst'] = f(corr.estRows, 0);
  b['ch2.corrAct'] = f(corr.actualRows, 0);
  b['ch2.corrRatio'] = f(corr.ratio, 1);

  /* ch3: 8 KiB slotted page & HOT */
  const pgHot = M.simulatePageSequence({ payloadBytes: 64, fillfactor: 80, indexedChanged: false });
  const pgIdx = M.simulatePageSequence({ payloadBytes: 64, fillfactor: 80, indexedChanged: true });
  b['ch3.blcksz'] = f(M.PG.BLCKSZ, 0);
  b['ch3.pageHdr'] = String(M.PG.PAGE_HEADER_SIZE);
  b['ch3.itemSz'] = String(M.PG.ITEM_ID_SIZE);
  b['ch3.tupFixed'] = String(M.PG.HEAP_TUPLE_FIXED);
  b['ch3.tupAlign'] = String(M.PG.HEAP_TUPLE_ALIGNED);
  b['ch3.defFree'] = f(pgHot.freeBytes, 0);
  b['ch3.defIdxWrites'] = String(pgHot.indexWrites);
  b['ch3.idxChangedWrites'] = String(pgIdx.indexWrites);

  /* ch4: MVCC isolation difference */
  const rc2 = M.mvccScenario({ isolation: 'rc', step: 2 });
  const rr2 = M.mvccScenario({ isolation: 'rr', step: 2 });
  b['ch4.rcVal'] = String(rc2.visibleVal);
  b['ch4.rrVal'] = String(rr2.visibleVal);

  /* ch5: 32-bit XID wraparound thresholds */
  const wMax = M.vacuumWraparoundSim({ ageMillion: 2145, vacuumMode: 'off' });
  b['ch5.freezeAgeM'] = f(M.PG.AUTOVACUUM_FREEZE_MAX_AGE / 1e6, 0);
  b['ch5.halfLimitM'] = f(M.PG.XID_HALF / 1e6, 1);
  b['ch5.stopAgeM'] = f(wMax.stopAge / 1e6, 1);

  /* ch6: shared buffers clock sweep & bulkread ring */
  const cUn = M.clockSweepSim({ workload: 'seq_unprotected', step: 36 });
  const cRg = M.clockSweepSim({ workload: 'seq_ring', step: 36 });
  b['ch6.ringFrames'] = String(M.PG.RING_BULKREAD_FRAMES);
  b['ch6.ringKiB'] = String(M.PG.RING_BULKREAD_FRAMES * 8);
  b['ch6.unprotPost'] = `${cUn.postHits}/${cUn.postTotal}`;
  b['ch6.ringPost'] = `${cRg.postHits}/${cRg.postTotal}`;

  /* ch7: nbtree Lehman & Yao splits */
  const btSeq = M.nbtreeSim({ orderMode: 'seq', insertCount: 24, maxKeys: 4 });
  const btRand = M.nbtreeSim({ orderMode: 'rand', insertCount: 24, maxKeys: 4 });
  b['ch7.btOpaque'] = String(M.PG.BT_OPAQUE_SIZE);
  b['ch7.seqLeaves'] = String(btSeq.leafCount);
  b['ch7.seqFill'] = f(btSeq.avgFillPct, 0) + '%';
  b['ch7.randLeaves'] = String(btRand.leafCount);
  b['ch7.randFill'] = f(btRand.avgFillPct, 0) + '%';

  /* ch8: hash join & work_mem spill */
  const j4 = M.joinCostSim({ outerRows: 80000, innerRows: 400000, workMemMB: 4 });
  const j16 = M.joinCostSim({ outerRows: 80000, innerRows: 400000, workMemMB: 16 });
  b['ch8.hashSizeMiB'] = f(j4.hashSizeMiB, 1);
  b['ch8.hash4Batch'] = String(j4.nbatch);
  b['ch8.hash4Spill'] = f(j4.spillMiB, 1);
  b['ch8.hash16Batch'] = String(j16.nbatch);

  /* ch9: WAL CRC-32C & Full-Page Writes */
  const wRand = M.walRecoverySim({ checkpointMin: 5, workload: 'rand', fpw: true });
  const wSeq = M.walRecoverySim({ checkpointMin: 5, workload: 'seq', fpw: true });
  b['ch9.crcTest'] = M.crc32cHex('123456789');
  b['ch9.randFpwPct'] = f(wRand.fpwSharePct, 1) + '%';
  b['ch9.seqFpwPct'] = f(wSeq.fpwSharePct, 1) + '%';
  b['ch9.walSegMiB'] = String(M.PG.WAL_SEG_BYTES / 1048576);

  return b;
};
