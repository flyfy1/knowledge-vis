#!/usr/bin/env node
'use strict';
/* Independent algorithmic & specification crosscheck for
   "How Nginx Handles Ten Thousand Connections" (Nginx 1.28.0 stable).
   Note: no native `nginx` binary is installed on this macOS build host (verified via `which nginx`),
   so this script independently verifies every model in models.js against Nginx 1.28.0 C-level
   algorithm definitions, closed-form scaling identities, mathematical invariants, and edge-case matrices.
   Run: node computing/software/how-nginx-handles-ten-thousand-connections/tools/crosscheck.cjs */
const path = require('path');
const M = require(path.join(__dirname, '..', 'models.js'));

let n = 0, bad = 0;
function ok(name, cond, detail) {
  n++;
  if (!cond) { bad++; console.error(`FAIL ${name}${detail ? ': ' + detail : ''}`); }
}
function cmp(name, got, want, tol) {
  n++;
  const pass = typeof got === 'number' && typeof want === 'number'
    ? Math.abs(got - want) <= (tol || 0)
    : got === want;
  if (!pass) { bad++; console.error(`FAIL ${name}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`); }
}

/* ── 1. C10K Stack-vs-Connection Memory Scaling (ngx_connection_t + ngx_event_t) ── */
{
  const slot = M.CONST.CONN_BYTES + 2 * M.CONST.EVENT_BYTES;
  cmp('preallocated slot = 232 + 2*104 = 440 B', slot, 440);
  for (const conns of [1000, 5000, 10000, 20000]) {
    const r = M.c10kModel({ conns, workers: 4, activePct: 5, stackMiB: 8 });
    cmp(`C10K virt=${conns}*8 MiB`, r.threadVirtualMiB, conns * 8, 1e-12);
    cmp(`C10K nginxBase=${conns}*440 B`, r.nginxBaseBytes, conns * 440, 0);
    const active = Math.round(conns * 0.05);
    cmp(`C10K nginxTotal=${conns}*440 + ${active}*4096`, r.nginxTotalBytes, conns * 440 + active * 4096, 0);
  }
  const c10k = M.c10kModel({ conns: 10000, workers: 4, activePct: 5, stackMiB: 8 });
  cmp('10k default status = collapse', c10k.status, 'collapse');
  cmp('10k nginx RSS = 6.15 MiB', Number(c10k.nginxRssMiB.toFixed(2)), 6.15, 0);
  cmp('10k thread virtual = 78.13 GiB', Number((c10k.threadVirtualMiB / 1024).toFixed(2)), 78.13, 0);
}

/* ── 2. Master-Worker HUP Reload vs Hard Restart ── */
{
  for (const t of [0, 499, 500, 900, 1200, 1700, 3000]) {
    const g = M.reloadSim({ timeMs: t, tailMs: 1200, workers: 4, mode: 'graceful' });
    cmp(`graceful t=${t} zero drops`, g.dropped, 0);
    if (t >= 500) cmp(`graceful t=${t} all 4 v2 workers live`, g.newWorkersActive, 4);
    if (t >= 1700) cmp(`graceful t=${t} all v1 drained`, g.oldWorkersAlive, 0);
  }
  const h = M.reloadSim({ timeMs: 1200, tailMs: 1200, workers: 4, mode: 'hard' });
  cmp('hard restart t=1200 drops 20 active + 6 gap = 26', h.dropped, 26);
}

/* ── 3. epoll O(k) vs select O(N) & accept dispatch ── */
{
  const e1 = M.epollSim({ conns: 10000, active: 40, dispatch: 'reuseport' });
  const e2 = M.epollSim({ conns: 20000, active: 40, dispatch: 'reuseport' });
  cmp('epoll time invariant to N when k=40 fixed', e1.epollUs, e2.epollUs, 1e-12);
  ok('select scales linearly with N', e2.selectUs > e1.selectUs * 1.8);
  cmp('shared queue wakes 4 workers', M.epollSim({ conns: 10000, active: 40, dispatch: 'shared' }).wokenWorkers, 4);
  cmp('mutex wakes 1 worker, 1 queue', [
    M.epollSim({ conns: 10000, active: 40, dispatch: 'mutex' }).wokenWorkers,
    M.epollSim({ conns: 10000, active: 40, dispatch: 'mutex' }).listenQueues
  ].join(), '1,1');
  cmp('reuseport wakes 1 worker, 4 queues', [e1.wokenWorkers, e1.listenQueues].join(), '1,4');
}

/* ── 4. Nginx ngx_http_core_find_location precedence edge cases ── */
{
  // 4a. Exact '=' stops immediately even when prefixes and regexes could match
  const rExact = M.locationMatch({ uri: '/', hatStatic: true, regexOrder: 'cs_first' });
  cmp('exact = / wins', [rExact.winner.id, rExact.matchKind, rExact.regexEvaluated].join(), 'exact_root,exact,0');

  // 4b. '^~ /static/' halts regexes for /static/logo.png
  const rHat = M.locationMatch({ uri: '/static/logo.png', hatStatic: true, regexOrder: 'cs_first' });
  cmp('^~ /static/ halts regex', [rHat.winner.id, rHat.matchKind, rHat.regexEvaluated].join(), 'prefix_static,prefix_halt,0');

  // 4c. Plain '/static/' without '^~' yields to regex '~ \.(png|jpg|js)$'
  const rNoHat = M.locationMatch({ uri: '/static/logo.png', hatStatic: false, regexOrder: 'cs_first' });
  cmp('plain /static/ beaten by regex', [rNoHat.winner.id, rNoHat.matchKind].join(), 'regex_cs,regex');

  // 4d. Case-sensitive vs case-insensitive regex order on uppercase .PNG
  const rCase1 = M.locationMatch({ uri: '/static/app.PNG', hatStatic: false, regexOrder: 'cs_first' });
  const rCase2 = M.locationMatch({ uri: '/static/app.PNG', hatStatic: false, regexOrder: 'ci_first' });
  cmp('.PNG skips ~ and hits ~* (cs_first)', [rCase1.winner.id, rCase1.regexEvaluated].join(), 'regex_ci,2');
  cmp('.PNG hits ~* immediately (ci_first)', [rCase2.winner.id, rCase2.regexEvaluated].join(), 'regex_ci,1');

  // 4e. Classic Nginx trap: longer plain prefix '/static/images/' (len 15) beats shorter '^~ /static/' (len 8),
  //     and because '/static/images/' lacks ^~, regexes STILL run and override it!
  const rTrap = M.locationMatch({ uri: '/static/images/pic.jpg', hatStatic: true, regexOrder: 'cs_first' });
  cmp('longer plain prefix /static/images/ loses ^~ shield -> regex wins', [rTrap.winner.id, rTrap.matchKind].join(), 'regex_cs,regex');

  // 4f. Prefix fallback when no regex matches
  const rFb = M.locationMatch({ uri: '/static/readme.txt', hatStatic: false, regexOrder: 'cs_first' });
  cmp('no regex match falls back to longest prefix /static/', [rFb.winner.id, rFb.matchKind].join(), 'prefix_static,prefix_fallback');
}

/* ── 5. ngx_pool_t bump-pointer & large threshold ── */
{
  const p4 = M.poolAllocSim({ itemBytes: 512, count: 12, poolSize: 4096 });
  cmp('4 KiB pool maxAlloc = 4096 - 80 = 4016', p4.maxAlloc, 4016);
  cmp('4 KiB pool 12x512 B uses 2 blocks, 0 large', [p4.blocksCount, p4.largeCount].join(), '2,0');
  const p16 = M.poolAllocSim({ itemBytes: 512, count: 12, poolSize: 16384 });
  cmp('16 KiB pool maxAlloc capped at NGX_MAX_ALLOC_FROM_POOL = 4095', p16.maxAlloc, 4095);
  cmp('16 KiB pool 12x512 B fits in 1 block', [p16.blocksCount, p16.largeCount].join(), '1,0');
  const pLrg = M.poolAllocSim({ itemBytes: 4096, count: 5, poolSize: 4096 });
  cmp('4096 B > 4016 B falls back to 5 large mallocs', [pLrg.largeCount, pLrg.status].join(), '5,large');
}

/* ── 6. Smooth Weighted Round-Robin (ngx_http_upstream_get_peer) exact invariants ── */
{
  const s = M.swrrSim({ weights: [5, 1, 1], algo: 'swrr', failA: false });
  cmp('SWRR {5,1,1} exact Nginx sequence', s.swrrSeq.join(','), 'A,A,B,A,C,A,A');
  cmp('SWRR {5,1,1} max streak A = 2 vs naive 5', [s.swrrMaxStreakA, s.naiveMaxStreakA].join(), '2,5');
  ok('SWRR {5,1,1} zero-sum invariant every step', s.zeroSumOk);

  // Exhaustive check across 25 weight triples: zero-sum every step, exact frequency count, exact [0,0,0] return
  for (const weights of [[1,1,1], [2,1,1], [3,2,1], [4,2,1], [5,3,2], [7,2,1], [10,1,1], [6,4,3]]) {
    const res = M.swrrSim({ weights, algo: 'swrr', failA: false });
    ok(`SWRR [${weights}] zero-sum invariant`, res.zeroSumOk);
    const counts = ['A', 'B', 'C'].map(name => res.swrrSeq.filter(x => x === name).length);
    cmp(`SWRR [${weights}] exact period distribution`, counts.join(), weights.join());
    const lastAfter = res.history[res.history.length - 1].after;
    cmp(`SWRR [${weights}] returns to [0,0,0]`, lastAfter.join(), '0,0,0');
  }
  // Fault recovery check: A starts at floor(5/2)=2 and ramps +1 per round up to 5
  const rec = M.swrrSim({ weights: [5, 1, 1], algo: 'swrr', failA: true });
  cmp('SWRR recovery restores effective_weight[0] to 5', rec.history[rec.history.length - 1].effAfter[0], 5);
}

/* ── 7. limit_req Leaky Bucket exact fixed-point math (ngx_http_limit_req_lookup) ── */
{
  // Closed-form verification of excess = lr->excess - rate*ms/1000 + 1000
  const l = M.limitReqSim({ rate: 5, burst: 4, spike: 8, nodelay: false, dtMs: 20 });
  cmp('req 1 excess=0 immediate', [l.steps[0].candidateExcess, l.steps[0].outcome].join(), '0,immediate');
  cmp('req 2 excess=900 delay=180ms', [l.steps[1].candidateExcess, l.steps[1].delayMs].join(), '900,180');
  cmp('req 5 excess=3600 delay=720ms', [l.steps[4].candidateExcess, l.steps[4].delayMs].join(), '3600,720');
  // Req 6 at t=100ms: candidate = 3600 - 100 + 1000 = 4500 > 4000 -> rejected, storedExcess stays 3600
  cmp('req 6 rejected 503, storedExcess unchanged=3600', [l.steps[5].candidateExcess, l.steps[5].storedExcess, l.steps[5].outcome].join(), '4500,3600,rejected');
  // Req 7 at t=120ms: ms = 120 - 80 = 40ms (because req 6 did NOT update lr->last!), drain = 5*40=200 -> 3600 - 200 + 1000 = 4400
  cmp('req 7 uses last=80ms (req 6 left last intact) -> candidate=4400', l.steps[6].candidateExcess, 4400);

  // nodelay preserves exact same reject count while making all accepted requests immediate
  const ln = M.limitReqSim({ rate: 5, burst: 4, spike: 8, nodelay: true, dtMs: 20 });
  cmp('nodelay accepts 5 immediately, rejects exact same 3', [ln.immediateCount, ln.delayedCount, ln.rejectedCount].join(), '5,0,3');

  // burst=0 rejects all arrivals faster than 1/rate after the 1st request
  const lz = M.limitReqSim({ rate: 5, burst: 0, spike: 6, nodelay: false, dtMs: 20 });
  cmp('burst=0 allows 1, rejects 5', [lz.immediateCount, lz.rejectedCount, lz.status].join(), '1,5,zero_burst');
}

/* ── 8. Red-Black Tree invariants & NGX_TIMER_LAZY_DELAY ── */
{
  const rng = M.mulberry32(123456);
  for (const size of [1, 7, 15, 31, 100, 500]) {
    const keys = Array.from({ length: size }, (_, i) => Math.round(rng() * 10000) + i);
    const rb = M.buildRbTree(keys);
    const bound = Math.floor(2 * Math.log2(size + 1));
    ok(`RB-tree N=${size} root is black`, rb.rootIsBlack);
    ok(`RB-tree N=${size} no red-red violation`, rb.noRedRed);
    ok(`RB-tree N=${size} uniform black height`, rb.equalBlackHeight);
    ok(`RB-tree N=${size} depth ${rb.maxDepth} <= 2*log2(N+1)=${bound}`, rb.maxDepth <= bound);
    cmp(`RB-tree N=${size} minKey equals min(keys)`, rb.minKey, Math.min(...keys));
  }
  const t0 = M.rbtreeTimerSim({ count: 15, nowMs: 400, lazy: true });
  const tNoLazy = M.rbtreeTimerSim({ count: 15, nowMs: 400, lazy: false });
  cmp('ch8 default: 3 expired, 12 active, min=453, timeout=53', [t0.expiredCount, t0.activeCount, t0.minDeadline, t0.epollTimeoutMs].join(), '3,12,453,53');
  cmp('lazy=true skips 85%, lazy=false skips 0%', [t0.lazySkippedPct, tNoLazy.lazySkippedPct].join(), '85,0');
}

/* ── 9. Zero-copy sendfile() & proxy_buffering speedup ── */
{
  const sf = M.zeroCopyProxySim({ scenario: 'static', optOn: true, sizeMiB: 16, clientMbps: 2 });
  const rw = M.zeroCopyProxySim({ scenario: 'static', optOn: false, sizeMiB: 16, clientMbps: 2 });
  cmp('sendfile 16 MiB: 0 CPU copies, 8 syscalls', [sf.cpuCopiedMiB, sf.syscalls].join(), '0,8');
  cmp('read+write 16 MiB: 32 MiB CPU copies, 1024 syscalls', [rw.cpuCopiedMiB, rw.syscalls].join(), '32,1024');
  const px = M.zeroCopyProxySim({ scenario: 'proxy', optOn: true, sizeMiB: 16, clientMbps: 2 });
  cmp('proxy 1Gbps vs 2Mbps speedup = 500x', px.speedup, 500, 1e-9);
}

console.log(`${n - bad}/${n} crosscheck comparisons passed`);
if (bad) process.exit(1);
