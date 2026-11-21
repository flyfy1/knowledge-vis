// Prose numbers computed from models.js at build time ({=name} in content.*.md).
// Language-neutral: identical strings inserted into zh and en; tests/models.cjs pins every value.
module.exports = M => {
  const b = {};
  const f = (x, d) => M.fmt(x, d, 'en');

  /* ch1: event loop vs locks */
  const el = M.eventLoopModel({ threads: 4, hotPct: 50, slowCmd: false });
  const elSlow = M.eventLoopModel({ threads: 4, hotPct: 50, slowCmd: true });
  b['ch1.loopKops'] = f(el.loopKops, 0);
  b['ch1.lock4Kops'] = f(el.lockKops, 0);
  b['ch1.slowP99'] = f(elSlow.p99Us / 1000, 2);
  b['ch1.blocked'] = String(elSlow.blockedCount);

  /* ch2: RESP & pipelining */
  const pipSeq = M.pipelineStats({ n: 20, rttUs: 200, proto: 'resp2', mode: 'seq' });
  const pipOn = M.pipelineStats({ n: 20, rttUs: 200, proto: 'resp2', mode: 'pipe' });
  b['ch2.reqBytes'] = String(pipSeq.sample.reqBytes);
  b['ch2.seqMs'] = f(pipSeq.seqTotalUs / 1000, 2);
  b['ch2.pipeUs'] = f(pipOn.pipeTotalUs, 0);
  b['ch2.speedup'] = f(pipOn.speedup, 1);

  /* ch3: redisObject & listpack */
  b['ch3.robjB'] = String(M.CONST.ROBJ_BYTES);
  b['ch3.sds8B'] = String(M.CONST.SDSHDR8_BYTES);
  b['ch3.embLimit'] = String(M.CONST.EMBSTR_LIMIT);
  b['ch3.emb44Alloc'] = String(M.stringMemory(44, false).allocBytes);
  b['ch3.raw45Alloc'] = String(M.stringMemory(45, false).allocBytes);
  const h64 = M.hashMemory(64, 44);
  b['ch3.lp64Bytes'] = f(h64.lpAlloc, 0);
  b['ch3.ht64Bytes'] = f(h64.htTotal, 0);
  b['ch3.lpMaxEntries'] = String(M.CONST.HASH_MAX_LP_ENTRIES);

  /* ch4: dict progressive rehash */
  b['ch4.htInit'] = String(M.CONST.DICT_INITIAL_SIZE);
  b['ch4.forceRatio'] = String(M.CONST.DICT_FORCE_RATIO);

  /* ch5: zskiplist */
  b['ch5.maxLvl'] = String(M.CONST.ZSKIPLIST_MAXLEVEL);
  b['ch5.zslP'] = String(M.CONST.ZSKIPLIST_P);
  b['ch5.seed3Hops'] = String(M.zslQueryRank(M.buildSkiplist(12, 3), 9).hops);

  /* ch6: Redis 8 io-threads */
  b['ch6.kops1'] = f(M.ioThreadModel({ ioThreads: 1 }).kops, 0);
  b['ch6.kops4'] = f(M.ioThreadModel({ ioThreads: 4 }).kops, 0);

  /* ch7: CoW & AOF */
  b['ch7.pageKiB'] = String(M.CONST.PAGE_BYTES / 1024);
  b['ch7.cowUnif'] = f(M.cowSim({ writePct: 50, skew: false }).ramMult, 2);
  b['ch7.cowSkew'] = f(M.cowSim({ writePct: 50, skew: true }).ramMult, 2);

  /* ch8: expire & eviction */
  b['ch8.expKeys'] = String(M.CONST.ACTIVE_EXPIRE_KEYS_PER_LOOP);
  b['ch8.expStale'] = String(M.CONST.ACTIVE_EXPIRE_ACCEPTABLE_STALE);
  b['ch8.lruSamp'] = String(M.CONST.MAXMEMORY_SAMPLES);
  b['ch8.lruPool'] = String(M.CONST.EVPOOL_SIZE);
  b['ch8.lru5Err'] = f(M.approxLruSim(5).meanErrPct, 1);
  b['ch8.lfuInit'] = String(M.CONST.LFU_INIT_VAL);
  b['ch8.lfuFactor'] = String(M.CONST.LFU_LOG_FACTOR);
  b['ch8.lfu1k'] = String(M.morrisExpectedCounter(1000, 10));
  b['ch8.lfu100k'] = String(M.morrisExpectedCounter(100000, 10));

  /* ch9: hash slots */
  b['ch9.slots'] = f(M.CONST.CLUSTER_SLOTS, 0);
  b['ch9.crcTestSlot'] = f(M.keyHashSlot('123456789').slot, 0);
  b['ch9.tagSlot'] = f(M.keyHashSlot('user:{42}:cart').slot, 0);

  return b;
};
