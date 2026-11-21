// Numbers in the prose, computed from models.js at build time ({=name} in content.*.md).
// Language-neutral: the same string goes into both languages.
// tests/models.cjs pins these values; tools/crosscheck.cjs compares models.js against react@19.3.1 / react-dom@19.3.1 / scheduler@0.28.0.
module.exports = M => {
  const b = {};
  const f = (x, d) => M.fmt(x, d, 'en');

  /* Pinned release & scheduler budget */
  b['react.ver'] = M.PINNED.react;
  b['sch.ver'] = M.PINNED.scheduler;
  b['sch.slice'] = f(M.PINNED.frameIntervalMs, 0);
  b['frame.ms'] = f(M.PINNED.frameBudgetMs, 2);

  /* ch2: JSX Element vs Fiber */
  const elJsx = M.inspectElementAndFiber('counter', 'jsx');
  const elRec = M.inspectElementAndFiber('counter', 'reconciled');
  b['ch2.elemKeys'] = String(elJsx.stats.elementCoreKeys);
  b['ch2.jsxDom'] = String(elJsx.stats.domNodesAllocated);
  b['ch2.jsxCalls'] = String(elJsx.stats.fnCallsAtJsx);
  b['ch2.fibers'] = String(elRec.stats.fiberCount);
  b['ch2.doms'] = String(elRec.stats.domNodesAllocated);

  /* ch3: WorkLoop time slicing */
  const wlFull = M.simulateWorkLoop({ unitMs: 1.6, budgetMs: 5, unitsDone: 11 });
  b['ch3.nodes'] = String(wlFull.totalNodes);
  b['ch3.yields'] = String(wlFull.yieldCount);
  b['ch3.slices'] = String(wlFull.sliceIdx);

  /* ch4: Two-pass key reconciliation */
  const recId = M.reconcileList('prepend', 'id');
  const recIdx = M.reconcileList('prepend', 'index');
  b['ch4.idReused'] = String(recId.stats.reusedCount);
  b['ch4.idMoves'] = String(recId.stats.moveCount);
  b['ch4.idMounts'] = String(recId.stats.mountCount);
  b['ch4.idxReused'] = String(recIdx.stats.reusedCount);
  b['ch4.idxMismatch'] = String(recIdx.stats.stateMismatches);

  /* ch5: Hooks linked list & circular pending queue */
  const hkNorm = M.simulateHooks({ actions: ['inc', 'double'], conditionalSkip: false });
  b['ch5.prev'] = String(hkNorm.prevCount);
  b['ch5.next'] = String(hkNorm.memoizedState);

  /* ch6: subtreeFlags bubbling */
  const bub = M.traverseAndBubble('singleLeaf', 10);
  b['ch6.total'] = String(bub.stats.totalNodes);
  b['ch6.commitVis'] = String(bub.stats.commitVisited);
  b['ch6.commitSkip'] = String(bub.stats.commitSkipped);
  b['ch6.skipPct'] = f((bub.stats.commitSkipped / bub.stats.totalNodes) * 100, 0) + '%';

  /* ch7: Commit & Effect timing */
  const tlLayout = M.simulateCommitTimeline({ renderMs: 4, mutationMs: 1.5, layoutEffectMs: 6, passiveEffectMs: 5, tooltipMode: 'layout' });
  const tlPassive = M.simulateCommitTimeline({ renderMs: 4, mutationMs: 1.5, layoutEffectMs: 6, passiveEffectMs: 5, tooltipMode: 'passive' });
  b['ch7.paintLayout'] = f(tlLayout.timeToPaintMs, 1);
  b['ch7.paintPassive'] = f(tlPassive.timeToPaintMs, 1);

  /* ch8: Event delegation & batching */
  const evBatch = M.simulateEventsAndBatching({ triggerKind: 'click', setStateCalls: 3 });
  const evSync = M.simulateEventsAndBatching({ triggerKind: 'flushSync', setStateCalls: 3 });
  b['ch8.listeners'] = String(evBatch.nativeListenersAttached);
  b['ch8.calls'] = String(evBatch.setStateCalls);
  b['ch8.commits'] = String(evBatch.commitCount);
  b['ch8.syncCommits'] = String(evSync.commitCount);

  /* ch9: Lanes preemption */
  const lnTrans = M.simulateLanesScheduler({ useTransition: true, listNodes: 14, nodeCostMs: 1.5, keystrokeAtMs: 7 });
  const lnSync = M.simulateLanesScheduler({ useTransition: false, listNodes: 14, nodeCostMs: 1.5, keystrokeAtMs: 7 });
  b['ch9.transLat'] = f(lnTrans.inputLatencyMs, 1);
  b['ch9.syncLat'] = f(lnSync.inputLatencyMs, 1);
  b['ch9.totalLanes'] = String(M.LANES.TotalLanes);
  b['ch9.syncLane'] = String(M.LANES.SyncLane);
  b['ch9.transLane'] = String(M.LANES.TransitionLane1);

  /* ch10: React Compiler cache slots */
  const ccOn = M.simulateCompilerCache({ compiled: true, stepKind: 'parentOnly', renderCount: 4 });
  const ccOff = M.simulateCompilerCache({ compiled: false, stepKind: 'parentOnly', renderCount: 4 });
  b['ch10.slots'] = String(ccOn.cacheSize);
  b['ch10.hits'] = String(ccOn.slotHits);
  b['ch10.offRuns'] = String(ccOff.filterComputes);

  return b;
};
