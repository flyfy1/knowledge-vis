// Numbers in the prose, computed from models.js at build time ({=name} in content.*.md).
// Language-neutral: the same string goes into both languages.
// tests/models.cjs pins these values; tools/crosscheck.cjs checks the algorithms against Git 2.56.0.
module.exports = M => {
  const b = {};
  const f = (x, d) => M.fmt(x, d, 'en');
  const pct = (x, d) => f(x * 100, d) + '%';

  /* ch2: blob header & hashes */
  const hello1 = M.looseObject('blob', 'hello git\n', 'sha1');
  const hello256 = M.looseObject('blob', 'hello git\n', 'sha256');
  const emptyTree256 = M.encodeTree([], 'sha256');
  b['ch2.helloRaw'] = String(hello1.rawSize);
  b['ch2.helloOid'] = hello1.oid.slice(0, 8);
  b['ch2.helloShard'] = hello1.shard;
  b['ch2.hello256'] = hello256.oid.slice(0, 12);
  b['ch2.emptyTree256'] = emptyTree256.oid.slice(0, 12);

  /* ch3: tree snapshot sharing */
  const snap = M.compareTreeSnapshotEdit('src/core/hash.js', 50, 1000);
  b['ch3.treeTotal'] = String(snap.nextObjects.size);
  b['ch3.treeNew'] = String(snap.newCount);
  b['ch3.treeShared'] = String(snap.sharedCount);
  b['ch3.naive50'] = f(snap.naiveBlobsTotal, 0);
  b['ch3.git50'] = f(snap.gitBlobsTotal, 0);

  /* ch4: commits & DAG */
  const d0 = M.createDagScenario([]);
  const dAmend = M.createDagScenario(['amend-main']);
  b['ch4.c0Oid'] = d0.nodes[0].oid.slice(0, 7);
  b['ch4.c2Oid'] = d0.nodes[2].oid.slice(0, 7);
  b['ch4.c2pOid'] = dAmend.nodes[4].oid.slice(0, 7);

  /* ch5: index stat cache */
  const idx = M.evalIndexStatCache({ totalFiles: 2000, modifiedFiles: 3, touchedOnlyFiles: 5, racySameTick: false });
  b['ch5.idxSkip'] = f(idx.skippedByStat, 0);
  b['ch5.idxBytes'] = M.bytesStr(idx.indexBytesEst, 'en');

  /* ch6: refs, HEAD, reflog */
  const rf = M.simulateReflogGC({ resetPerformed: true, daysElapsed: 10, gcExpiredDays: 30, gcNow: false });
  b['ch6.branchBytes'] = String(rf.branchFileBytes);
  b['ch6.headBytes'] = String(rf.headBytes);

  /* ch8: packfiles & deltas */
  const pk = M.simulatePackWindow({ windowSize: 4, sortByHeuristic: true, queryIdxSlot: 3 });
  b['ch8.looseTot'] = M.bytesStr(pk.looseTotalBytes, 'en');
  b['ch8.packTot'] = M.bytesStr(pk.packTotalBytes, 'en');
  b['ch8.packSave'] = pct(pk.savingsRatio, 0);

  /* ch9: wire & clone modes */
  const cf = M.simulateCloneMode({ mode: 'full', commits: 200, shallowDepth: 1, binaryAssetsMB: 12 });
  const cb = M.simulateCloneMode({ mode: 'blobless', commits: 200, shallowDepth: 1, binaryAssetsMB: 12 });
  b['ch9.fullMB'] = M.bytesStr(cf.wireBytes, 'en');
  b['ch9.bloblessMB'] = M.bytesStr(cb.wireBytes, 'en');
  b['ch9.bloblessPct'] = pct(cb.wireFraction, 1);

  /* ch10: frontier reftable & sparse index */
  const rb = M.simulateRefBackends({ numRefs: 100000, opsCount: 1 });
  const sp = M.simulateSparseIndex({ totalFiles: 100000, totalTopDirs: 20, activeDirs: 2 });
  b['ch10.packed100k'] = M.bytesStr(rb.packedFileBytes, 'en');
  b['ch10.reftable100k'] = M.bytesStr(rb.reftableTotalBytes, 'en');
  b['ch10.sparseEntries'] = f(sp.sparseEntries, 0);

  return b;
};
