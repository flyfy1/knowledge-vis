/* Pure algorithmic models for "How Nginx Handles Ten Thousand Connections" (Nginx 1.28.0 stable).
   UMD export: window.NginxModels in browsers, module.exports in Node. Zero external dependencies. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.NginxModels = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ── Pinned Nginx 1.28.0 & Linux x86-64 LP64 constants ── */
  const CONST = {
    RELEASE: '1.28.0',
    RELEASE_DATE: '2025-04-23',
    CONN_BYTES: 232,             // sizeof(ngx_connection_t) on 64-bit Linux (src/core/ngx_connection.h)
    EVENT_BYTES: 104,            // sizeof(ngx_event_t) on 64-bit Linux (src/event/ngx_event.h)
    CONN_TOTAL_BYTES: 440,       // ngx_connection_t + read_event + write_event preallocated per slot
    POOL_HDR_BYTES: 80,          // sizeof(ngx_pool_t) on 64-bit LP64 (src/core/ngx_palloc.h)
    POOL_DATA_HDR_BYTES: 32,     // sizeof(ngx_pool_data_t) on subsequent blocks
    DEFAULT_POOL_SIZE: 16384,    // NGX_DEFAULT_POOL_SIZE (16 KiB)
    REQ_POOL_BYTES: 4096,        // typical per-request pool / 4 KiB page
    MAX_ALLOC_FROM_POOL: 4095,   // NGX_MAX_ALLOC_FROM_POOL = ngx_pagesize - 1 (4 KiB page)
    ALIGNMENT: 16,               // NGX_ALIGNMENT on 64-bit
    THREAD_STACK_MIB: 8,         // default Linux pthread ulimit -s (8 MiB virtual)
    THREAD_COMMIT_KIB: 128,      // committed stack + kernel task_struct + thread malloc arena (illustrative RSS)
    CTX_SWITCH_US: 3.5,          // illustrative thread context-switch + L1/TLB warmup cost (us)
    TIMER_LAZY_DELAY_MS: 300,    // NGX_TIMER_LAZY_DELAY (src/event/ngx_event_timer.h)
    LIMIT_REQ_SCALE: 1000,       // fixed-point multiplier in ngx_http_limit_req_module.c
    SENDFILE_MAX_CHUNK_MIB: 2,   // sendfile_max_chunk 2m example / Linux chunked syscall pacing
    RW_CHUNK_KIB: 32,            // buffered read()+write() chunk size for copy accounting
    UPSTREAM_MBPS: 1000,         // LAN link between Nginx and backend upstream (1 Gbps)
    HARD_RESTART_GAP_MS: 300     // hard stop+start listener downtime window (ms)
  };

  /* ── formatting helpers ── */
  function fmt(x, d, locale) {
    const dec = d == null ? 0 : d;
    if (!Number.isFinite(x)) return '∞';
    const tol = 0.5 * Math.pow(10, -dec);
    const v = Math.abs(x) < tol ? 0 : x;
    return v.toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US', {
      minimumFractionDigits: dec,
      maximumFractionDigits: dec
    });
  }

  function bytesStr(b, locale) {
    if (b < 1024) return fmt(b, 0, locale) + ' B';
    if (b < 1024 * 1024) return fmt(b / 1024, 1, locale) + ' KiB';
    if (b < 1024 * 1024 * 1024) return fmt(b / (1024 * 1024), 2, locale) + ' MiB';
    return fmt(b / (1024 * 1024 * 1024), 2, locale) + ' GiB';
  }

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ── 1. Ch1: C10K memory & context-switch scaling ── */
  function c10kModel(opts) {
    const o = Object.assign({ conns: 10000, workers: 4, activePct: 5, stackMiB: 8 }, opts || {});
    const conns = Math.max(100, Math.round(o.conns));
    const workers = Math.max(1, Math.round(o.workers));
    const activePct = Math.max(1, Math.min(100, o.activePct));
    const stackMiB = Math.max(0.5, o.stackMiB);

    const active = Math.max(1, Math.round(conns * activePct / 100));
    const idle = conns - active;

    // Thread-per-connection
    const threadVirtualMiB = conns * stackMiB;
    const threadRssMiB = (conns * CONST.THREAD_COMMIT_KIB + active * 64) / 1024;
    const runnableSwitchesPerMs = active * 2;
    const switchUsPerMs = runnableSwitchesPerMs * CONST.CTX_SWITCH_US;
    const coreBudgetUsPerMs = workers * 1000;
    const ctxCpuPct = Math.min(100, (switchUsPerMs / coreBudgetUsPerMs) * 100);

    // Nginx event-loop workers (preallocated connection + event arrays + active pools)
    const nginxBaseBytes = conns * CONST.CONN_TOTAL_BYTES;
    const nginxActivePoolBytes = active * CONST.REQ_POOL_BYTES;
    const nginxTotalBytes = nginxBaseBytes + nginxActivePoolBytes;
    const nginxRssMiB = nginxTotalBytes / (1024 * 1024);

    let status = 'light';
    if (ctxCpuPct >= 85 || threadRssMiB >= 2048) status = 'collapse';
    else if (threadVirtualMiB >= 8192 || ctxCpuPct >= 30) status = 'cliff';

    const curve = [];
    for (let n = 500; n <= 20000; n += 500) {
      const act = Math.max(1, Math.round(n * activePct / 100));
      const tRss = (n * CONST.THREAD_COMMIT_KIB + act * 64) / 1024;
      const tVirt = n * stackMiB;
      const ngRss = (n * CONST.CONN_TOTAL_BYTES + act * CONST.REQ_POOL_BYTES) / (1024 * 1024);
      curve.push({ n, threadRssMiB: tRss, threadVirtualMiB: tVirt, nginxRssMiB: ngRss });
    }

    return {
      conns, workers, activePct, stackMiB, active, idle,
      threadVirtualMiB, threadRssMiB, ctxCpuPct, runnableSwitchesPerMs,
      nginxBaseBytes, nginxActivePoolBytes, nginxTotalBytes, nginxRssMiB,
      ramRatio: threadRssMiB / Math.max(0.01, nginxRssMiB),
      status, curve
    };
  }

  /* ── 2. Ch2: Master-Worker Zero-Downtime Hot Reload (HUP) vs Hard Restart ── */
  function reloadSim(opts) {
    const o = Object.assign({ timeMs: 1200, tailMs: 1200, workers: 4, mode: 'graceful' }, opts || {});
    const timeMs = Math.max(0, Math.min(4000, Math.round(o.timeMs)));
    const tailMs = Math.max(200, Math.min(3000, Math.round(o.tailMs)));
    const workers = Math.max(1, Math.min(8, Math.round(o.workers)));
    const mode = o.mode === 'hard' ? 'hard' : 'graceful';
    const TRIGGER = 500;
    const reqsPerWorker = 5;
    const totalInitialInFlight = workers * reqsPerWorker;

    // Assign each in-flight request across workers with deterministic completion offsets up to tailMs
    const oldConns = [];
    for (let w = 0; w < workers; w++) {
      for (let j = 0; j < reqsPerWorker; j++) {
        const frac = ((j + 1) / reqsPerWorker) * ((w + 1) / workers);
        const finishAt = TRIGGER + Math.round(tailMs * frac);
        oldConns.push({ worker: w, finishAt });
      }
    }

    let oldWorkersAlive = workers;
    let newWorkersActive = 0;
    let oldInFlight = totalInitialInFlight;
    let newInFlight = 0;
    let dropped = 0;
    let phase = 'pre';

    if (mode === 'graceful') {
      if (timeMs < TRIGGER) {
        phase = 'pre';
      } else {
        newWorkersActive = workers;
        newInFlight = totalInitialInFlight;
        oldInFlight = oldConns.filter(c => c.finishAt > timeMs).length;
        const aliveSet = new Set(oldConns.filter(c => c.finishAt > timeMs).map(c => c.worker));
        oldWorkersAlive = aliveSet.size;
        phase = oldInFlight > 0 ? 'draining' : 'done';
      }
    } else {
      if (timeMs < TRIGGER) {
        phase = 'pre';
      } else {
        phase = 'hard';
        oldWorkersAlive = 0;
        oldInFlight = 0;
        const gap = Math.min(CONST.HARD_RESTART_GAP_MS, timeMs - TRIGGER);
        const rejectedDuringGap = Math.floor(gap * 0.02); // 20 req/s arriving while listener is down
        dropped = totalInitialInFlight + rejectedDuringGap;
        if (timeMs >= TRIGGER + CONST.HARD_RESTART_GAP_MS) {
          newWorkersActive = workers;
          newInFlight = totalInitialInFlight;
        }
      }
    }

    // Build worker lifecycle bars for canvas visualization
    const oldWorkerBars = [];
    for (let w = 0; w < workers; w++) {
      const maxEnd = Math.max(...oldConns.filter(c => c.worker === w).map(c => c.finishAt));
      oldWorkerBars.push({
        id: w,
        start: 0,
        end: mode === 'graceful' ? maxEnd : TRIGGER,
        alive: mode === 'graceful' ? (timeMs < maxEnd) : (timeMs < TRIGGER)
      });
    }

    return {
      timeMs, tailMs, workers, mode, triggerMs: TRIGGER,
      phase, oldWorkersAlive, newWorkersActive,
      oldInFlight, newInFlight, dropped,
      oldWorkerBars,
      newStartMs: mode === 'graceful' ? TRIGGER : TRIGGER + CONST.HARD_RESTART_GAP_MS
    };
  }

  /* ── 3. Ch3: epoll / kqueue O(active) vs select / poll O(N) & accept dispatch ── */
  function epollSim(opts) {
    const o = Object.assign({ conns: 10000, active: 40, dispatch: 'reuseport' }, opts || {});
    const conns = Math.max(500, Math.round(o.conns));
    const active = Math.max(1, Math.min(conns, Math.round(o.active)));
    const dispatch = ['shared', 'mutex', 'reuseport'].includes(o.dispatch) ? o.dispatch : 'reuseport';
    const workers = 4;

    const selectWork = conns;
    const epollWork = active;
    const speedupRatio = selectWork / epollWork;

    // Illustrative microsecond cost model: O(N) bitmap copy/scan vs O(k) ready list pop
    const selectUs = 0.8 + conns * 0.015 + active * 0.25;
    const epollUs = 0.8 + active * 0.25;
    const timeSpeedup = selectUs / epollUs;

    const wokenWorkers = dispatch === 'shared' ? workers : 1;
    const listenQueues = dispatch === 'reuseport' ? workers : 1;

    const curve = [];
    for (let n = 1000; n <= 20000; n += 1000) {
      const act = Math.min(n, active);
      curve.push({
        n,
        selectUs: 0.8 + n * 0.015 + act * 0.25,
        epollUs: 0.8 + act * 0.25
      });
    }

    return {
      conns, active, dispatch, workers,
      selectWork, epollWork, speedupRatio,
      selectUs, epollUs, timeSpeedup,
      wokenWorkers, listenQueues,
      curve
    };
  }

  /* ── 4. Ch4: 11-phase HTTP pipeline & exact location matching (ngx_http_core_find_location) ── */
  const LOCATION_PRESET_URIS = [
    '/',
    '/static/logo.png',
    '/static/app.PNG',
    '/static/readme.txt',
    '/static/images/pic.jpg',
    '/api/v1/users'
  ];

  const HTTP_PHASES = [
    'POST_READ', 'SERVER_REWRITE', 'FIND_CONFIG', 'REWRITE',
    'POST_REWRITE', 'PREACCESS', 'ACCESS', 'POST_ACCESS',
    'PRECONTENT', 'CONTENT', 'LOG'
  ];

  function locationMatch(opts) {
    const o = Object.assign({ uri: '/static/logo.png', hatStatic: true, regexOrder: 'cs_first' }, opts || {});
    const uri = String(o.uri || '/');
    const hatStatic = !!o.hatStatic;
    const regexOrder = o.regexOrder === 'ci_first' ? 'ci_first' : 'cs_first';

    const blocks = [
      { id: 'exact_root', mod: '=', pat: '/', type: 'exact' },
      { id: 'prefix_static', mod: hatStatic ? '^~' : '', pat: '/static/', type: 'prefix', noregexp: hatStatic },
      { id: 'prefix_images', mod: '', pat: '/static/images/', type: 'prefix', noregexp: false },
      { id: 'regex_cs', mod: '~', pat: '\\.(png|jpg|js)$', type: 'regex', re: /\.(png|jpg|js)$/ },
      { id: 'regex_ci', mod: '~*', pat: '\\.(png|jpg)$', type: 'regex', re: /\.(png|jpg)$/i },
      { id: 'prefix_root', mod: '', pat: '/', type: 'prefix', noregexp: false }
    ];

    const regexList = regexOrder === 'cs_first' ? [blocks[3], blocks[4]] : [blocks[4], blocks[3]];
    const trace = [];
    let winner = null;
    let matchKind = '';
    let regexEvaluated = 0;

    // Step 1: Exact '=' check
    trace.push({ step: 'exact', blockId: 'exact_root', matched: uri === '/' });
    if (uri === '/') {
      winner = blocks[0];
      matchKind = 'exact';
      return { uri, hatStatic, regexOrder, winner, matchKind, regexEvaluated, rulesChecked: 1, trace, blocks };
    }

    // Step 2: Longest prefix search in static location tree
    const prefixes = [blocks[1], blocks[2], blocks[5]];
    let bestPrefix = null;
    for (const p of prefixes) {
      if (uri.startsWith(p.pat)) {
        if (!bestPrefix || p.pat.length > bestPrefix.pat.length) bestPrefix = p;
      }
    }
    trace.push({ step: 'prefix', blockId: bestPrefix ? bestPrefix.id : null, matched: !!bestPrefix, noregexp: !!(bestPrefix && bestPrefix.noregexp) });

    if (bestPrefix && bestPrefix.noregexp) {
      winner = bestPrefix;
      matchKind = 'prefix_halt';
      return { uri, hatStatic, regexOrder, winner, matchKind, regexEvaluated: 0, rulesChecked: 1 + prefixes.length, trace, blocks };
    }

    // Step 3: Regexes in config order (~ and ~*)
    for (const r of regexList) {
      regexEvaluated++;
      const hit = r.re.test(uri);
      trace.push({ step: 'regex', blockId: r.id, matched: hit });
      if (hit) {
        winner = r;
        matchKind = 'regex';
        return { uri, hatStatic, regexOrder, winner, matchKind, regexEvaluated, rulesChecked: 1 + prefixes.length + regexEvaluated, trace, blocks };
      }
    }

    // Step 4: Fallback to longest prefix found in Step 2
    winner = bestPrefix || blocks[5];
    matchKind = 'prefix_fallback';
    trace.push({ step: 'fallback', blockId: winner.id, matched: true });
    return { uri, hatStatic, regexOrder, winner, matchKind, regexEvaluated, rulesChecked: 1 + prefixes.length + regexEvaluated, trace, blocks };
  }

  /* ── 5. Ch5: Per-request Memory Pool (ngx_pool_t) bump allocator ── */
  function alignUp(n, align) {
    return (n + align - 1) & ~(align - 1);
  }

  function poolAllocSim(opts) {
    const o = Object.assign({ itemBytes: 512, count: 12, poolSize: 4096 }, opts || {});
    const itemBytes = Math.max(16, Math.round(o.itemBytes));
    const count = Math.max(1, Math.min(40, Math.round(o.count)));
    const poolSize = o.poolSize === 16384 ? 16384 : 4096;

    const firstUsable = poolSize - CONST.POOL_HDR_BYTES;
    const maxAlloc = Math.min(firstUsable, CONST.MAX_ALLOC_FROM_POOL);

    const blocks = [{
      index: 0,
      cap: poolSize,
      hdr: CONST.POOL_HDR_BYTES,
      used: CONST.POOL_HDR_BYTES,
      failed: 0,
      items: []
    }];
    let currentIdx = 0;
    const large = [];

    for (let i = 0; i < count; i++) {
      if (itemBytes <= maxAlloc) {
        let placed = false;
        for (let b = currentIdx; b < blocks.length; b++) {
          const blk = blocks[b];
          const start = alignUp(blk.used, CONST.ALIGNMENT);
          if (start + itemBytes <= blk.cap) {
            blk.items.push({ id: i, start, size: itemBytes, pad: start - blk.used });
            blk.used = start + itemBytes;
            placed = true;
            break;
          }
          blk.failed++;
          if (blk.failed > 4 && b === currentIdx && b + 1 < blocks.length) currentIdx = b + 1;
        }
        if (!placed) {
          const start = alignUp(CONST.POOL_DATA_HDR_BYTES, CONST.ALIGNMENT);
          const nb = {
            index: blocks.length,
            cap: poolSize,
            hdr: CONST.POOL_DATA_HDR_BYTES,
            used: start + itemBytes,
            failed: 0,
            items: [{ id: i, start, size: itemBytes, pad: start - CONST.POOL_DATA_HDR_BYTES }]
          };
          blocks.push(nb);
        }
      } else {
        large.push({ id: i, size: itemBytes });
      }
    }

    const totalPoolBytes = blocks.length * poolSize;
    const totalLargeBytes = large.length * itemBytes;
    const totalAllocatedBytes = totalPoolBytes + totalLargeBytes;
    const requestedBytes = count * itemBytes;
    const freeCallsOnDestroy = blocks.length + large.length;
    const status = large.length > 0 ? 'large' : (blocks.length === 1 ? 'small_one' : 'small_multi');

    return {
      itemBytes, count, poolSize, maxAlloc,
      blocks, large,
      blocksCount: blocks.length,
      largeCount: large.length,
      totalPoolBytes, totalLargeBytes, totalAllocatedBytes,
      requestedBytes,
      wasteBytes: totalAllocatedBytes - requestedBytes,
      freeCallsOnDestroy,
      status
    };
  }

  /* ── 6. Ch6: Smooth Weighted Round-Robin (ngx_http_upstream_get_peer) ── */
  function maxConsecutive(seq, target) {
    let best = 0, cur = 0;
    for (const x of seq) {
      if (x === target) { cur++; if (cur > best) best = cur; }
      else cur = 0;
    }
    return best;
  }

  function swrrSim(opts) {
    const o = Object.assign({ weights: [5, 1, 1], algo: 'swrr', failA: false }, opts || {});
    const weights = (o.weights || [5, 1, 1]).map(w => Math.max(1, Math.min(10, Math.round(w))));
    const algo = o.algo === 'naive' ? 'naive' : 'swrr';
    const failA = !!o.failA;
    const names = ['A', 'B', 'C'];
    const totalStatic = weights[0] + weights[1] + weights[2];
    const steps = failA ? totalStatic * 2 : totalStatic;

    const naiveSeq = [];
    for (let i = 0; i < 3; i++) for (let k = 0; k < weights[i]; k++) naiveSeq.push(names[i]);
    const naiveMaxStreakA = maxConsecutive(naiveSeq, 'A');

    // Exact ngx_http_upstream_get_peer loop
    const eff = [
      failA ? Math.max(0, Math.floor(weights[0] / 2)) : weights[0],
      weights[1],
      weights[2]
    ];
    const cw = [0, 0, 0];
    const history = [];
    const swrrSeq = [];
    let zeroSumOk = true;

    for (let step = 0; step < steps; step++) {
      let stepTotal = 0;
      let best = -1;
      for (let i = 0; i < 3; i++) {
        cw[i] += eff[i];
        stepTotal += eff[i];
        if (eff[i] < weights[i]) eff[i]++;
        if (best === -1 || cw[i] > cw[best]) best = i;
      }
      const before = cw.slice();
      cw[best] -= stepTotal;
      if (cw[0] + cw[1] + cw[2] !== 0) zeroSumOk = false;
      swrrSeq.push(names[best]);
      history.push({
        step: step + 1,
        picked: names[best],
        before,
        after: cw.slice(),
        effAfter: eff.slice(),
        stepTotal
      });
    }

    const activeSeq = algo === 'naive' ? (failA ? naiveSeq.concat(naiveSeq) : naiveSeq) : swrrSeq;
    const maxStreakA = maxConsecutive(activeSeq, 'A');
    const swrrMaxStreakA = maxConsecutive(swrrSeq, 'A');
    const status = (algo === 'swrr' && failA) ? 'recover' : (algo === 'naive' ? 'naive' : 'smooth');

    return {
      weights, algo, failA, totalStatic, steps,
      sequence: activeSeq, swrrSeq, naiveSeq, history,
      maxStreakA, swrrMaxStreakA, naiveMaxStreakA,
      zeroSumOk, status
    };
  }

  /* ── 7. Ch7: Leaky-bucket Rate Limiting (ngx_http_limit_req_lookup) ── */
  function limitReqSim(opts) {
    const o = Object.assign({ rate: 5, burst: 4, spike: 8, nodelay: false, dtMs: 20 }, opts || {});
    const rate = Math.max(1, Math.min(20, Math.round(o.rate)));
    const burst = Math.max(0, Math.min(12, Math.round(o.burst)));
    const spike = Math.max(1, Math.min(15, Math.round(o.spike)));
    const nodelay = !!o.nodelay;
    const dtMs = Math.max(5, Math.round(o.dtMs));

    const rateScaled = rate * CONST.LIMIT_REQ_SCALE;
    const burstScaled = burst * CONST.LIMIT_REQ_SCALE;

    let lrExcess = 0;
    let lrLast = 0;
    let immediateCount = 0;
    let delayedCount = 0;
    let rejectedCount = 0;
    let maxDelayMs = 0;
    const steps = [];

    for (let i = 0; i < spike; i++) {
      const t = i * dtMs;
      if (i === 0) {
        // First insert into shared rbtree: lr->excess = 0, lr->last = now
        lrExcess = 0;
        lrLast = t;
        immediateCount++;
        steps.push({ index: i + 1, tMs: t, candidateExcess: 0, storedExcess: 0, delayMs: 0, outcome: 'immediate' });
        continue;
      }
      const ms = t - lrLast;
      let excess = lrExcess - Math.floor(rateScaled * ms / 1000) + CONST.LIMIT_REQ_SCALE;
      if (excess < 0) excess = 0;

      if (excess > burstScaled) {
        // NGX_BUSY (503): lr->excess and lr->last are NOT modified
        rejectedCount++;
        steps.push({ index: i + 1, tMs: t, candidateExcess: excess, storedExcess: lrExcess, delayMs: null, outcome: 'rejected' });
      } else {
        lrExcess = excess;
        lrLast = t;
        if (excess === 0 || nodelay) {
          immediateCount++;
          steps.push({ index: i + 1, tMs: t, candidateExcess: excess, storedExcess: lrExcess, delayMs: 0, outcome: 'immediate' });
        } else {
          const delayMs = Math.round((excess * 1000) / rateScaled);
          if (delayMs > maxDelayMs) maxDelayMs = delayMs;
          delayedCount++;
          steps.push({ index: i + 1, tMs: t, candidateExcess: excess, storedExcess: lrExcess, delayMs, outcome: 'delayed' });
        }
      }
    }

    let status = 'clean';
    if (burst === 0 && rejectedCount > 0) status = 'zero_burst';
    else if (nodelay && (rejectedCount > 0 || immediateCount > 1)) status = 'nodelay';
    else if (!nodelay && delayedCount > 0) status = 'queued';

    return {
      rate, burst, spike, nodelay, dtMs,
      immediateCount, delayedCount, rejectedCount, maxDelayMs,
      steps, status
    };
  }

  /* ── 8. Ch8: Red-Black Tree Timers (ngx_event_timer_rbtree) & NGX_TIMER_LAZY_DELAY ── */
  function buildRbTree(keys) {
    // Classic Red-Black insertion matching ngx_rbtree_insert invariants
    const NIL = { isNil: true, color: 'B', key: null, left: null, right: null, parent: null };
    NIL.left = NIL; NIL.right = NIL; NIL.parent = NIL;
    let root = NIL;

    function leftRotate(x) {
      const y = x.right;
      x.right = y.left;
      if (y.left !== NIL) y.left.parent = x;
      y.parent = x.parent;
      if (x.parent === NIL) root = y;
      else if (x === x.parent.left) x.parent.left = y;
      else x.parent.right = y;
      y.left = x;
      x.parent = y;
    }

    function rightRotate(y) {
      const x = y.left;
      y.left = x.right;
      if (x.right !== NIL) x.right.parent = y;
      x.parent = y.parent;
      if (y.parent === NIL) root = x;
      else if (y === y.parent.right) y.parent.right = x;
      else y.parent.left = x;
      x.right = y;
      y.parent = x;
    }

    for (const k of keys) {
      const z = { isNil: false, key: k, color: 'R', left: NIL, right: NIL, parent: NIL };
      let y = NIL, x = root;
      while (x !== NIL) {
        y = x;
        x = z.key < x.key ? x.left : x.right;
      }
      z.parent = y;
      if (y === NIL) root = z;
      else if (z.key < y.key) y.left = z;
      else y.right = z;

      let cur = z;
      while (cur !== root && cur.parent.color === 'R') {
        const gp = cur.parent.parent;
        if (cur.parent === gp.left) {
          const uncle = gp.right;
          if (uncle.color === 'R') {
            cur.parent.color = 'B';
            uncle.color = 'B';
            gp.color = 'R';
            cur = gp;
          } else {
            if (cur === cur.parent.right) { cur = cur.parent; leftRotate(cur); }
            cur.parent.color = 'B';
            gp.color = 'R';
            rightRotate(gp);
          }
        } else {
          const uncle = gp.left;
          if (uncle.color === 'R') {
            cur.parent.color = 'B';
            uncle.color = 'B';
            gp.color = 'R';
            cur = gp;
          } else {
            if (cur === cur.parent.left) { cur = cur.parent; rightRotate(cur); }
            cur.parent.color = 'B';
            gp.color = 'R';
            leftRotate(gp);
          }
        }
      }
      root.color = 'B';
    }

    // Verify invariants & compute layout
    let noRedRed = true;
    let maxDepth = 0;
    const blackHeights = new Set();
    const nodes = [];
    let inorderIdx = 0;

    function walk(node, depth, bh) {
      if (node === NIL) {
        blackHeights.add(bh);
        return;
      }
      if (node.color === 'R') {
        if ((node.left !== NIL && node.left.color === 'R') || (node.right !== NIL && node.right.color === 'R')) noRedRed = false;
      }
      const nextBh = bh + (node.color === 'B' ? 1 : 0);
      if (depth > maxDepth) maxDepth = depth;
      walk(node.left, depth + 1, nextBh);
      const rank = inorderIdx++;
      walk(node.right, depth + 1, nextBh);
      nodes.push({
        key: node.key,
        color: node.color,
        depth,
        rank,
        leftKey: node.left === NIL ? null : node.left.key,
        rightKey: node.right === NIL ? null : node.right.key
      });
    }
    walk(root, 1, 0);

    const rootIsBlack = root === NIL || root.color === 'B';
    const equalBlackHeight = blackHeights.size <= 1;
    const bhVal = blackHeights.size === 1 ? [...blackHeights][0] : -1;
    let minKey = null;
    if (root !== NIL) {
      let c = root;
      while (c.left !== NIL) c = c.left;
      minKey = c.key;
    }

    return {
      rootIsBlack, noRedRed, equalBlackHeight,
      blackHeight: bhVal, maxDepth, minKey, nodes
    };
  }

  function rbtreeTimerSim(opts) {
    const o = Object.assign({ count: 15, nowMs: 400, lazy: true }, opts || {});
    const count = Math.max(7, Math.min(31, Math.round(o.count)));
    const nowMs = Math.max(0, Math.min(1200, Math.round(o.nowMs)));
    const lazy = !!o.lazy;

    const rng = mulberry32(20261121);
    const allDeadlines = [];
    for (let i = 0; i < count; i++) {
      // Spread deterministic deadlines between 100 and 1150 ms without exact duplicates
      allDeadlines.push(100 + Math.round(rng() * 1050) + i);
    }

    const expired = allDeadlines.filter(k => k <= nowMs);
    const active = allDeadlines.filter(k => k > nowMs);
    const rb = buildRbTree(active);

    const epollTimeoutMs = active.length > 0 ? rb.minKey - nowMs : -1;
    const boundDepth = active.length > 0 ? Math.floor(2 * Math.log2(active.length + 1)) : 0;

    // 10,000 connection benchmark theoretical RB depth bound
    const c10kMaxDepth = Math.floor(2 * Math.log2(10000 + 1));

    // NGX_TIMER_LAZY_DELAY = 300ms simulation across 100 packet arrivals with 20..360ms timer shift
    const rng2 = mulberry32(99173);
    let skipped = 0;
    for (let i = 0; i < 100; i++) {
      const delta = 20 + Math.round(rng2() * 340);
      if (lazy && Math.abs(delta) < CONST.TIMER_LAZY_DELAY_MS) skipped++;
    }

    const status = active.length === 0 ? 'empty' : (expired.length > 0 ? 'expired' : 'waiting');

    return {
      count, nowMs, lazy,
      allDeadlines, expired, active,
      expiredCount: expired.length,
      activeCount: active.length,
      minDeadline: rb.minKey,
      epollTimeoutMs,
      tree: rb,
      maxDepth: rb.maxDepth,
      boundDepth,
      c10kMaxDepth,
      lazySkippedPct: skipped,
      status
    };
  }

  /* ── 9. Ch9: Zero-Copy sendfile() vs read/write & Reverse-Proxy proxy_buffering ── */
  function zeroCopyProxySim(opts) {
    const o = Object.assign({ scenario: 'static', optOn: true, sizeMiB: 16, clientMbps: 2 }, opts || {});
    const scenario = o.scenario === 'proxy' ? 'proxy' : 'static';
    const optOn = !!o.optOn;
    const sizeMiB = Math.max(1, Math.min(64, Math.round(o.sizeMiB)));
    const clientMbps = Math.max(1, Math.min(100, Math.round(o.clientMbps)));

    // Static file path metrics
    const chunksRw = Math.ceil((sizeMiB * 1024) / CONST.RW_CHUNK_KIB);
    const rwSyscalls = chunksRw * 2;
    const rwCtxSwitches = rwSyscalls * 2;
    const rwCpuCopiedMiB = sizeMiB * 2;

    const sfSyscalls = Math.ceil(sizeMiB / CONST.SENDFILE_MAX_CHUNK_MIB);
    const sfCtxSwitches = sfSyscalls * 2;
    const sfCpuCopiedMiB = 0;

    // Proxy buffering metrics (1 MiB = 8 * 1024 * 1024 bits)
    const totalBits = sizeMiB * 8 * 1024 * 1024;
    const upstreamSendMs = (totalBits / (CONST.UPSTREAM_MBPS * 1e6)) * 1000;
    const clientRecvMs = (totalBits / (clientMbps * 1e6)) * 1000;

    const syscalls = scenario === 'static' ? (optOn ? sfSyscalls : rwSyscalls) : (optOn ? sfSyscalls : rwSyscalls);
    const ctxSwitches = scenario === 'static' ? (optOn ? sfCtxSwitches : rwCtxSwitches) : 0;
    const cpuCopiedMiB = scenario === 'static' ? (optOn ? sfCpuCopiedMiB : rwCpuCopiedMiB) : sizeMiB * 2;
    const upstreamPinnedMs = optOn ? upstreamSendMs : clientRecvMs;
    const speedup = CONST.UPSTREAM_MBPS / clientMbps;

    const status = scenario === 'static'
      ? (optOn ? 'sendfile' : 'rw')
      : (optOn ? 'proxy_on' : 'proxy_off');

    return {
      scenario, optOn, sizeMiB, clientMbps,
      rwSyscalls, rwCtxSwitches, rwCpuCopiedMiB,
      sfSyscalls, sfCtxSwitches, sfCpuCopiedMiB,
      syscalls, ctxSwitches, cpuCopiedMiB,
      upstreamSendMs, clientRecvMs, upstreamPinnedMs,
      speedup, status
    };
  }

  return {
    CONST,
    LOCATION_PRESET_URIS,
    HTTP_PHASES,
    fmt,
    bytesStr,
    mulberry32,
    c10kModel,
    reloadSim,
    epollSim,
    locationMatch,
    poolAllocSim,
    swrrSim,
    limitReqSim,
    buildRbTree,
    rbtreeTimerSim,
    zeroCopyProxySim
  };
});
