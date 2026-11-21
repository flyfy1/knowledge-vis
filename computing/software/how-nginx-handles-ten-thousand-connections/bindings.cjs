// Numbers in the prose, computed from models.js at build time ({=name} in content.*.md).
// Language-neutral: the same string goes into both languages. tests/models.cjs pins these exact values.
module.exports = M => {
  const b = {};
  const f = (x, d) => M.fmt(x, d, 'en');

  /* ch1: C10K memory & context switches */
  const c1 = M.c10kModel({ conns: 10000, workers: 4, activePct: 5, stackMiB: 8 });
  b['ch1.connB'] = String(M.CONST.CONN_BYTES);
  b['ch1.evtB'] = String(M.CONST.EVENT_BYTES);
  b['ch1.slotB'] = String(M.CONST.CONN_TOTAL_BYTES);
  b['ch1.stackMiB'] = String(M.CONST.THREAD_STACK_MIB);
  b['ch1.virtGiB'] = f(c1.threadVirtualMiB / 1024, 2);
  b['ch1.threadRss'] = f(c1.threadRssMiB, 0);
  b['ch1.nginxMiB'] = f(c1.nginxRssMiB, 2);
  b['ch1.ramRatio'] = f(c1.ramRatio, 0);
  b['ch1.ctxPct'] = f(c1.ctxCpuPct, 1);

  /* ch2: HUP hot reload */
  const r2 = M.reloadSim({ timeMs: 1200, tailMs: 1200, workers: 4, mode: 'graceful' });
  const r2h = M.reloadSim({ timeMs: 1200, tailMs: 1200, workers: 4, mode: 'hard' });
  b['ch2.oldAlive'] = String(r2.oldWorkersAlive);
  b['ch2.newAlive'] = String(r2.newWorkersActive);
  b['ch2.hardDrop'] = String(r2h.dropped);

  /* ch3: epoll vs select */
  const e3 = M.epollSim({ conns: 10000, active: 40, dispatch: 'reuseport' });
  b['ch3.selectUs'] = f(e3.selectUs, 1);
  b['ch3.epollUs'] = f(e3.epollUs, 1);
  b['ch3.scanRatio'] = f(e3.speedupRatio, 0);

  /* ch4: 11 phases & location match */
  b['ch4.phases'] = String(M.HTTP_PHASES.length);

  /* ch5: ngx_pool_t */
  const p5 = M.poolAllocSim({ itemBytes: 512, count: 12, poolSize: 4096 });
  b['ch5.hdrB'] = String(M.CONST.POOL_HDR_BYTES);
  b['ch5.maxSmall'] = f(p5.maxAlloc, 0);
  b['ch5.defPool'] = f(M.CONST.DEFAULT_POOL_SIZE / 1024, 0);
  b['ch5.blocks'] = String(p5.blocksCount);
  b['ch5.frees'] = String(p5.freeCallsOnDestroy);

  /* ch6: SWRR */
  const s6 = M.swrrSim({ weights: [5, 1, 1], algo: 'swrr', failA: false });
  b['ch6.seq'] = s6.swrrSeq.join(', ');
  b['ch6.swrrMax'] = String(s6.swrrMaxStreakA);
  b['ch6.naiveMax'] = String(s6.naiveMaxStreakA);

  /* ch7: limit_req leaky bucket */
  const l7q = M.limitReqSim({ rate: 5, burst: 4, spike: 8, nodelay: false });
  const l7n = M.limitReqSim({ rate: 5, burst: 4, spike: 8, nodelay: true });
  b['ch7.scale'] = f(M.CONST.LIMIT_REQ_SCALE, 0);
  b['ch7.qDelay'] = String(l7q.delayedCount);
  b['ch7.qDrop'] = String(l7q.rejectedCount);
  b['ch7.qMaxMs'] = String(l7q.maxDelayMs);
  b['ch7.nImm'] = String(l7n.immediateCount);

  /* ch8: Red-Black tree timers */
  const t8 = M.rbtreeTimerSim({ count: 15, nowMs: 400, lazy: true });
  b['ch8.lazyMs'] = String(M.CONST.TIMER_LAZY_DELAY_MS);
  b['ch8.lazySkip'] = String(t8.lazySkippedPct);
  b['ch8.c10kDepth'] = String(t8.c10kMaxDepth);
  b['ch8.timeout'] = String(t8.epollTimeoutMs);

  /* ch9: sendfile & proxy_buffering */
  const z9s = M.zeroCopyProxySim({ scenario: 'static', optOn: true, sizeMiB: 16, clientMbps: 2 });
  const z9r = M.zeroCopyProxySim({ scenario: 'static', optOn: false, sizeMiB: 16, clientMbps: 2 });
  const z9p = M.zeroCopyProxySim({ scenario: 'proxy', optOn: true, sizeMiB: 16, clientMbps: 2 });
  b['ch9.rwSys'] = f(z9r.rwSyscalls, 0);
  b['ch9.rwCtx'] = f(z9r.rwCtxSwitches, 0);
  b['ch9.rwCopy'] = f(z9r.rwCpuCopiedMiB, 0);
  b['ch9.sfSys'] = f(z9s.sfSyscalls, 0);
  b['ch9.upMs'] = f(z9p.upstreamSendMs, 1);
  b['ch9.cliSec'] = f(z9p.clientRecvMs / 1000, 1);
  b['ch9.speedup'] = f(z9p.speedup, 0);

  return b;
};
