/* How cores share memory: the page's models. One snooping coherence engine (MSI / MESI / MOESI, plus a "no protocol"
   write-back baseline) drives the stale-copy demo, the protocol simulator, the directory comparison and the lock
   handoffs; an exhaustive interleaving counter for the lost update; a CAS-loop vs fetch-add scheduler; a line-arbitration
   model of a contended counter on measured core-to-core latencies; and a litmus-test enumerator for sequential
   consistency, x86-TSO (Sewell et al.'s abstract machine) and a weak model in the style of Armv8 / RVWMO.
   Real-chip figures sit in LAT / FRONTIER with their source and the date it was opened (also in BRIEF.md). Constants
   chosen for a model rather than taken from a source are marked TUNED here and on the page.
   UMD: window.CoherenceModels in the browser, module.exports in node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CoherenceModels = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const LINE = 64;

  // mulberry32: a small seeded generator, so every trace and every random choice repeats exactly
  function rng(seed) {
    let a = seed >>> 0;
    return function () { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }

  /* ── Measured and dated figures (sources in BRIEF.md, opened 2026-11-15) ── */
  const LAT = {
    // Chips and Cheese, "Testing AMD's Bergamo: Zen 4c Spam" (Chester Lam, 2024-06-22). Method: two cores alternately
    // increment one value in memory. "Intra-cluster latency ... around 30-40 ns"; "Cross-cluster transfers within a
    // socket ... 100-120 ns"; cross-socket "averaged around 200 ns", worst "just over 212 ns".
    bergamo: { intra: [30, 40], cross: [100, 120], socket: 200, socketMax: 212, date: '2024-06-22' },
    // Chips and Cheese, "AMD's Ryzen 9950X: Zen 5 on Desktop" (2024-08-14): cross-cluster "nearly 200 ns" at launch.
    zen5desk: { crossCcd: 200, date: '2024-08-14' }
  };
  const FRONTIER = {
    asOf: '2026-11',
    epyc9965: { cores: 192, launch: '2024-10-10' },                                   // AMD press release 2024-10-10
    venice: { cores: 256, ccds: 8, ccdCores: 32, ccxCores: 16, l3: 1024, reported: '2026-07-23', sp7: 'Q4 2026' }, // Club386, StorageReview 2026-07-23
    xeon6p: { cores: 288, l3: 576, sockets: 2, reported: '2026-06-01' },              // The Register 2026-06-01 (Xeon 6+ "Clearwater Forest")
    appleTso: { date: '2024-04-11' },                                                 // Hector Martin, "[PATCH 0/4] arm64: Support the TSO memory model"
    tardis: { year: 2015, cores: 256, arxiv: '1501.04504' },
    armMp: { runs: 1000000, seen: 458 },                                              // learn.arm.com "Thread Synchronization Examples", litmus7 on hardware
    claims: { venicePerf: 70, xeon6pPerThread: 30 },                                  // vendor claims as reported (StorageReview 2026-07-23; Tom's Hardware headline)                          // Yu & Devadas, PACT 2015
    mcs: { year: 1991 }, tso: { year: 2010 }, primer: { year: 2020 }
  };

  /* ── The coherence engine. One line's state in every cache plus memory; values are write counters so the
     data-value invariant can be checked: a read must return the newest written value.
     Protocols: 'none' — private write-back caches with no snooping (states I, V clean, D dirty);
     'msi' — memory supplies data unless a cache holds the line in M (M flushes: data to the requester, writeback);
     'mesi' — Illinois (Papamarcos & Patel 1984): a read miss with no other copy fills in E; any cache holding the line
     supplies it (cache-to-cache); an M copy read by another core writes back and becomes S;
     'moesi' — as MESI, but an M copy read by another core becomes O (dirty, shared, supplies data) with no writeback;
     the O copy is written back only when it is evicted.
     All three protocols upgrade S (or O) to M with BusUpgr; a write miss is BusRdX. E and S evictions are silent. ── */
  const PROTOS = ['none', 'msi', 'mesi', 'moesi'];
  function makeSystem(proto, nCores, nLines) {
    const st = [], val = [];
    for (let c = 0; c < nCores; c++) { st.push(new Array(nLines).fill('I')); val.push(new Array(nLines).fill(0)); }
    return { proto, n: nCores, lines: nLines, st, val, mem: new Array(nLines).fill(0), latest: new Array(nLines).fill(0), wcount: 0,
      led: { tx: 0, rd: 0, rdx: 0, upgr: 0, memRd: 0, c2c: 0, wb: 0, inval: 0, stale: 0, ops: 0 } };
  }
  const isDirty = s => s === 'M' || s === 'O' || s === 'D';
  // one processor-side access; returns a record of what happened (for the log, the directory replay and the tests)
  function access(sys, core, op, line) {
    const P = sys.proto, me = sys.st[core][line], L = sys.led; L.ops++;
    const others = []; for (let c = 0; c < sys.n; c++) if (c !== core && sys.st[c][line] !== 'I') others.push(c);
    const rec = { core, op, line, before: me, bus: null, from: null, wb: false, inval: [], sharers: others.slice(), owner: null, stale: false, value: null };
    const ownerOf = () => others.find(c => sys.st[c][line] === 'M' || sys.st[c][line] === 'O' || sys.st[c][line] === 'E');
    rec.owner = ownerOf(); if (rec.owner === undefined) rec.owner = null;
    const writeback = c => { sys.mem[line] = sys.val[c][line]; L.wb++; L.tx++; rec.wb = true; };
    const fill = () => {   // data for a miss: from a cache or from memory, by protocol
      const dirty = others.find(c => isDirty(sys.st[c][line]));
      if (P === 'msi') { if (dirty != null) { rec.from = 'cache'; L.c2c++; return sys.val[dirty][line]; } rec.from = 'mem'; L.memRd++; return sys.mem[line]; }
      const src = dirty != null ? dirty : others[0];
      if (src != null) { rec.from = 'cache'; L.c2c++; return sys.val[src][line]; }
      rec.from = 'mem'; L.memRd++; return sys.mem[line];
    };
    if (P === 'none') {
      if (op === 'R') { if (me === 'I') { sys.val[core][line] = sys.mem[line]; sys.st[core][line] = 'V'; rec.from = 'mem'; L.memRd++; } rec.value = sys.val[core][line]; }
      else if (op === 'W') { if (me === 'I') { sys.val[core][line] = sys.mem[line]; rec.from = 'mem'; L.memRd++; } sys.wcount++; sys.val[core][line] = sys.wcount; sys.latest[line] = sys.wcount; sys.st[core][line] = 'D'; rec.value = sys.wcount; }
      else { if (me === 'D') { sys.mem[line] = sys.val[core][line]; L.wb++; rec.wb = true; } sys.st[core][line] = 'I'; }
      if (op === 'R' && rec.value !== sys.latest[line]) { rec.stale = true; L.stale++; }
      rec.after = sys.st[core][line]; return rec;
    }
    if (op === 'R') {
      if (me === 'I') {
        rec.bus = 'BusRd'; L.tx++; L.rd++;
        const v = fill();
        for (const c of others) {
          const s = sys.st[c][line];
          if (s === 'M') { if (P === 'moesi') { sys.st[c][line] = 'O'; rec.owned = true; } else { writeback(c); sys.st[c][line] = 'S'; } }
          else if (s === 'O') rec.owned = true;
          else if (s === 'E') sys.st[c][line] = 'S';
        }
        sys.val[core][line] = v; sys.st[core][line] = (P !== 'msi' && others.length === 0) ? 'E' : 'S';
      }
      rec.value = sys.val[core][line];
      if (rec.value !== sys.latest[line]) { rec.stale = true; L.stale++; }
    } else if (op === 'W') {
      if (me === 'E') { /* silent upgrade */ }
      else if (me === 'S' || me === 'O') { rec.bus = 'BusUpgr'; L.tx++; L.upgr++; }
      else if (me === 'I') { rec.bus = 'BusRdX'; L.tx++; L.rdx++; sys.val[core][line] = fill(); }
      if (me !== 'M') for (const c of others) { sys.st[c][line] = 'I'; rec.inval.push(c); L.inval++; }
      sys.wcount++; sys.val[core][line] = sys.wcount; sys.latest[line] = sys.wcount; sys.st[core][line] = 'M'; rec.value = sys.wcount;
    } else if (op === 'E') {
      if (me === 'M' || me === 'O') writeback(core);
      sys.st[core][line] = 'I';
    }
    rec.after = sys.st[core][line];
    return rec;
  }
  // the two coherence invariants (Sorin, Hill, Wood & Nagarajan, Primer 2nd ed. §2.3) checked on the current state:
  // SWMR — at most one cache may write a line (M, or D without a protocol) and then no other cache holds it;
  // data value — every valid copy holds the newest written value (an O owner's sharers hold the same dirty value).
  function invariants(sys) {
    let swmr = true, value = true;
    for (let l = 0; l < sys.lines; l++) {
      const writers = [], holders = [];
      for (let c = 0; c < sys.n; c++) { const s = sys.st[c][l]; if (s !== 'I') holders.push(c); if (s === 'M' || s === 'D' || s === 'E') writers.push(c); }
      if (writers.length > 1 || (writers.length === 1 && holders.length > 1)) swmr = false;
      for (const c of holders) if (sys.val[c][l] !== sys.latest[l]) value = false;
    }
    return { swmr, value };
  }
  function runTrace(proto, nCores, nLines, trace) {
    const sys = makeSystem(proto, nCores, nLines), recs = [];
    for (const [c, op, l] of trace) recs.push(access(sys, c, op, l));
    return { sys, recs, led: sys.led };
  }

  /* ── 01 the stale copy: a fixed four-step script on two cores and one line ── */
  const STALE = { script: [[0, 'R', 0], [1, 'R', 0], [0, 'W', 0], [1, 'R', 0]] };
  function stale(proto, steps) { return runTrace(proto, 2, 1, STALE.script.slice(0, steps)); }

  /* ── 03 the protocol simulator's preset traces: 4 cores, lines A–D, ROUNDS rounds each ── */
  const SIM = { cores: 4, lines: 4, rounds: 4 };
  function preset(name) {
    const t = [], R = SIM.rounds, N = SIM.cores;
    for (let r = 0; r < R; r++) {
      if (name === 'private') for (let c = 0; c < N; c++) { t.push([c, 'R', c], [c, 'W', c], [c, 'E', c]); }      // read, update, lose it to capacity
      else if (name === 'prodcons') { t.push([0, 'W', 0]); for (let c = 1; c < N; c++) t.push([c, 'R', 0]); }       // one writer, three readers
      else if (name === 'migratory') for (let c = 0; c < N; c++) t.push([c, 'R', 0], [c, 'W', 0]);                  // a counter passed round
      else if (name === 'readonly') for (let c = 0; c < N; c++) t.push([c, 'R', 0]);                                 // a shared table
    }
    return t;
  }
  const PRESETS = ['private', 'prodcons', 'migratory', 'readonly'];
  function presetRun(name, proto) { return runTrace(proto, SIM.cores, SIM.lines, preset(name)); }

  /* ── 04 directories. (a) Storage per 64-byte line (Primer §8.5): full bit vector N + 2 state bits; coarse vector
     with K cores per bit N/K + 2; limited pointers i·log2 N + 2 + 1 overflow bit. (b) Messages: the same trace replayed
     on N cores, counted two ways. Snooping: every bus transaction is broadcast to the N − 1 other caches, plus one data
     response when data moves. Directory (Primer §8.2–8.4, MESI-like, no evictions): read with no owner: request, data
     (2 messages, 2 hops); read with an owner in M/E: request, forward, data to requester, copy to home (4 messages,
     3 hops); write miss with an owner: request, forward, data (3 messages, 3 hops); write miss or upgrade with s
     sharers: request, data or ack count from home, s invalidations, s acks (2 + 2s messages; 3 hops if s > 0). ── */
  const DIR = { stateBits: 2, coarseK: 8, pointers: 4, lineBits: LINE * 8, coresList: [4, 8, 16, 32, 64, 128, 256, 512, 1024],
    trace: { lines: 64, ops: 4000, pWrite: 0.2, hot: 0.7, hotLines: 4, seed: 7 } };   // TUNED trace mix
  function dirBits(N, scheme, opt) {
    opt = opt || {}; const lg = Math.ceil(Math.log2(N));
    if (scheme === 'full') return N + DIR.stateBits;
    if (scheme === 'coarse') return Math.ceil(N / (opt.K || DIR.coarseK)) + DIR.stateBits;
    return (opt.i || DIR.pointers) * lg + DIR.stateBits + 1;
  }
  const dirOverhead = (N, scheme, opt) => dirBits(N, scheme, opt) / DIR.lineBits;
  function dirTrace(N, seed) {
    const T = DIR.trace, R = rng(seed || T.seed), t = [];
    for (let k = 0; k < T.ops; k++) {
      const c = Math.floor(R() * N), l = R() < T.hot ? Math.floor(R() * T.hotLines) : T.hotLines + Math.floor(R() * (T.lines - T.hotLines));
      t.push([c, R() < T.pWrite ? 'W' : 'R', l]);
    }
    return t;
  }
  function dirCompare(N, seed) {
    const { recs } = runTrace('mesi', N, DIR.trace.lines, dirTrace(N, seed));
    let snoop = 0, dir = 0, misses = 0, threeHop = 0;
    for (const r of recs) {
      if (!r.bus) continue; misses++;
      snoop += (N - 1) + (r.from ? 1 : 0);
      if (r.bus === 'BusRd') { if (r.owner != null) { dir += 4; threeHop++; } else dir += 2; }
      else if (r.bus === 'BusRdX' && r.owner != null) { dir += 3; threeHop++; }
      else { const k = r.sharers.length; dir += 2 + 2 * k; if (k > 0) threeHop++; }
    }
    return { N, misses, snoop, dir, perMissSnoop: snoop / misses, perMissDir: dir / misses, threeHopShare: threeHop / misses };
  }

  /* ── 05 the lost update. Two threads each run k times: r = load(x); store(x, r + 1). Every interleaving of the 4k
     memory steps is counted exactly (dynamic programming over (i, j, phase, registers, memory)); each interleaving
     weighs the same. With an atomic increment each increment is one indivisible step and the result is always 2k. ── */
  function lostUpdate(k, atomic) {
    if (atomic) { const total = binom(2 * k, k); return { k, total, dist: { [2 * k]: total }, min: 2 * k, max: 2 * k, pCorrect: 1 }; }
    // state: i (steps done by A, 0..2k), j (steps done by B), rA, rB, mem → count. Odd step = has loaded, holds register.
    let cur = new Map([[key(0, 0, 0, 0, 0), 1]]);
    const out = {}; let total = 0;
    function key(i, j, a, b, m) { return i + ',' + j + ',' + a + ',' + b + ',' + m; }
    for (let s = 0; s < 4 * k; s++) {
      const nxt = new Map();
      for (const [kk, cnt] of cur) {
        const [i, j, a, b, m] = kk.split(',').map(Number);
        if (i < 2 * k) { const ni = i + 1, na = i % 2 === 0 ? m : a, nm = i % 2 === 0 ? m : a + 1; const q = key(ni, j, na, b, nm); nxt.set(q, (nxt.get(q) || 0) + cnt); }
        if (j < 2 * k) { const nj = j + 1, nb = j % 2 === 0 ? m : b, nm = j % 2 === 0 ? m : b + 1; const q = key(i, nj, a, nb, nm); nxt.set(q, (nxt.get(q) || 0) + cnt); }
      }
      cur = nxt;
    }
    for (const [kk, cnt] of cur) { const m = +kk.split(',')[4]; out[m] = (out[m] || 0) + cnt; total += cnt; }
    const vals = Object.keys(out).map(Number);
    return { k, total, dist: out, min: Math.min(...vals), max: Math.max(...vals), pCorrect: (out[2 * k] || 0) / total };
  }
  function binom(n, r) { let x = 1; for (let i = 1; i <= r; i++) x = x * (n - r + i) / i; return Math.round(x); }
  // the same race at scale, under a random scheduler: each turn one thread runs a burst of memory steps whose length is
  // geometric with mean b (b is TUNED: it stands for how far the two cores drift apart; real hardware is not a coin).
  const RACE = { N: 1000000, bursts: [1, 4, 16, 64, 256, 1024], seed: 11 };
  function raceSim(b, N, seed) {
    N = N || RACE.N; const R = rng(seed || RACE.seed), p = 1 / b;
    let mem = 0, cnt = [0, 0], ph = [0, 0], reg = [0, 0], who = 0;
    while (cnt[0] < N || cnt[1] < N) {
      if (cnt[who] >= N) who = 1 - who;
      // run a burst
      do {
        if (ph[who] === 0) { reg[who] = mem; ph[who] = 1; } else { mem = reg[who] + 1; ph[who] = 0; cnt[who]++; }
      } while (cnt[who] < N && R() >= p);
      if (cnt[1 - who] < N) who = 1 - who;
    }
    return { b, N, final: mem, lost: 2 * N - mem, share: mem / (2 * N) };
  }

  /* ── 06 atomics: a CAS loop vs fetch-and-add. n threads, each wants M increments; a scheduler picks a random thread
     for each memory step. CAS loop: load old; CAS(old → old + 1) fails if the value changed since the load. Fetch-and-
     add (x86 LOCK XADD, Arm LSE LDADD, RISC-V AMOADD) is one step that cannot fail. ── */
  const CAS = { M: 2000, threads: [1, 2, 4, 8, 16, 32], seed: 3 };
  function casLoop(n, M, seed) {
    M = M || CAS.M; const R = rng(seed || CAS.seed);
    let mem = 0, done = 0, steps = 0, fails = 0; const ph = new Array(n).fill(0), old = new Array(n).fill(0), cnt = new Array(n).fill(0);
    const live = []; for (let i = 0; i < n; i++) live.push(i);
    while (live.length) {
      const k = Math.floor(R() * live.length), t = live[k]; steps++;
      if (ph[t] === 0) { old[t] = mem; ph[t] = 1; }
      else { if (mem === old[t]) { mem++; cnt[t]++; done++; } else fails++; ph[t] = 0; if (cnt[t] >= M) { live[k] = live[live.length - 1]; live.pop(); } }
    }
    return { n, M, final: mem, steps, fails, stepsPerInc: steps / done, failShare: fails / (done + fails) };
  }

  /* ── 07 a contended line. n threads atomically increment one shared counter (or each its own counter, padded to its
     own line). The line is granted to one requester at a time in FIFO order; a grant to a different core costs one
     core-to-core transfer T (measured, LAT); the increment itself takes t (TUNED, 1 ns: a few cycles on a hit in L1).
     Exact result: with n ≥ 2 every grant goes to a different core, so the counter advances once per T + t. ── */
  const PING = { t: 1, inc: 1000000, sim: 20000, places: ['intra', 'cross', 'socket'] };
  function pingT(place, end) { const B = LAT.bergamo; return place === 'intra' ? B.intra[end] : place === 'cross' ? B.cross[end] : B.socket; }
  function pingPong(n, place, mode, end, opts) {
    opts = opts || {}; const T = opts.T != null ? opts.T : pingT(place, end == null ? 0 : end), t = opts.t || PING.t, K = opts.sim || PING.sim;
    if (mode === 'private') return { n, T, t, mode, transfers: 0, perInc: t, totalRate: n / t, perThread: 1 / t, timeFor: inc => inc * t };
    // FIFO arbitration simulated: every core keeps one request queued; the owner after its increment re-queues at the back
    let owner = -1, transfers = 0, time = 0; const q = []; for (let c = 0; c < n; c++) q.push(c);
    for (let k = 0; k < K; k++) { const c = q.shift(); if (c !== owner) { transfers++; time += T; owner = c; } time += t; q.push(c); }
    const perInc = time / K;
    return { n, T, t, mode, transfers: transfers / K, perInc, totalRate: 1 / perInc, perThread: 1 / perInc / n, timeFor: inc => inc * perInc };
  }

  /* ── 08–09 litmus tests. A thread is a list of instructions: W (store), R (load into a register), F (full fence),
     X (atomic exchange), with optional acq (load-acquire) / rel (store-release). Three models:
     'sc'   — Lamport: some interleaving of the threads' instructions in program order, one memory.
     'tso'  — x86-TSO, the abstract machine of Sewell, Sarkar, Owens, Zappa Nardelli & Myreen (CACM 2010): a FIFO store
              buffer per thread; a load reads the newest buffered store to its address, else memory; a buffered store
              reaches memory at any time; MFENCE waits for an empty buffer; a LOCK'd instruction takes the global lock,
              and ends with an empty buffer (here: it waits for an empty buffer, then reads and writes memory at once).
     'weak' — what this page models of Armv8 / RVWMO: one memory (stores are multi-copy atomic); a thread may perform
              an instruction before earlier ones that are still pending unless an earlier one is to the same address, is
              a fence, or is a load-acquire, or the later one is a fence or a store-release (which waits for everything
              before it); a store-release followed by a load-acquire stays in order (Arm's RCsc). Address, data and
              control dependencies are not modelled (none of these tests has one).
     The enumerator explores every reachable state and collects the final register values. ── */
  const W = (a, v, o) => Object.assign({ op: 'W', a, v }, o), Rd = (a, r, o) => Object.assign({ op: 'R', a, r }, o), F = () => ({ op: 'F' }), X = (a, v, r) => ({ op: 'X', a, v, r });
  const LITMUS = {
    SB: { regs: ['r1', 'r2'], fences: {
      none: [[W('x', 1), Rd('y', 'r1')], [W('y', 1), Rd('x', 'r2')]],
      fence: [[W('x', 1), F(), Rd('y', 'r1')], [W('y', 1), F(), Rd('x', 'r2')]],
      lock: [[X('x', 1, 'e1'), Rd('y', 'r1')], [X('y', 1, 'e2'), Rd('x', 'r2')]] }, odd: '0,0' },
    MP: { regs: ['r1', 'r2'], fences: {
      none: [[W('x', 1), W('y', 1)], [Rd('y', 'r1'), Rd('x', 'r2')]],
      fence: [[W('x', 1), F(), W('y', 1)], [Rd('y', 'r1'), F(), Rd('x', 'r2')]],
      acqrel: [[W('x', 1), W('y', 1, { rel: 1 })], [Rd('y', 'r1', { acq: 1 }), Rd('x', 'r2')]] }, odd: '1,0' },
    LB: { regs: ['r1', 'r2'], fences: {
      none: [[Rd('x', 'r1'), W('y', 1)], [Rd('y', 'r2'), W('x', 1)]],
      fence: [[Rd('x', 'r1'), F(), W('y', 1)], [Rd('y', 'r2'), F(), W('x', 1)]] }, odd: '1,1' }
  };
  const MODELS = ['sc', 'tso', 'weak'];
  function litmus(test, fence, model) {
    const T = LITMUS[test], prog = T.fences[fence], regs = T.regs, outs = new Map(), seen = new Set();
    let states = 0;
    const addrs = ['x', 'y'];
    // state: pcs/done-masks, memory, regs, buffers (tso)
    function finish(st) { const k = regs.map(r => st.reg[r] || 0).join(','); outs.set(k, (outs.get(k) || 0) + 1); }
    function sig(st) { return JSON.stringify(st); }
    function visit(st) {
      const s = sig(st); if (seen.has(s)) return; seen.add(s); states++;
      const moves = [];
      if (model === 'sc') {
        prog.forEach((th, t) => { const pc = st.pc[t]; if (pc < th.length) moves.push(() => scStep(st, t, th[pc])); });
      } else if (model === 'tso') {
        prog.forEach((th, t) => {
          const pc = st.pc[t], buf = st.buf[t];
          if (buf.length) moves.push(() => { const n = clone(st); const [a, v] = n.buf[t].shift(); n.mem[a] = v; return n; });   // τ: drain oldest
          if (pc >= th.length) return;
          const ins = th[pc];
          if (ins.op === 'W') moves.push(() => { const n = clone(st); n.buf[t].push([ins.a, ins.v]); n.pc[t]++; return n; });
          else if (ins.op === 'R') moves.push(() => { const n = clone(st); const own = [...n.buf[t]].reverse().find(e => e[0] === ins.a); n.reg[ins.r] = own ? own[1] : n.mem[ins.a]; n.pc[t]++; return n; });
          else if (ins.op === 'F' && !buf.length) moves.push(() => { const n = clone(st); n.pc[t]++; return n; });
          else if (ins.op === 'X' && !buf.length) moves.push(() => { const n = clone(st); n.reg[ins.r] = n.mem[ins.a]; n.mem[ins.a] = ins.v; n.pc[t]++; return n; });
        });
      } else {
        prog.forEach((th, t) => {
          for (let i = 0; i < th.length; i++) {
            if (st.done[t][i]) continue;
            if (canPerform(th, st.done[t], i)) moves.push(() => { const n = clone(st); n.done[t][i] = 1; perform(n, th[i]); return n; });
          }
        });
      }
      if (!moves.length) { finish(st); return; }
      for (const m of moves) visit(m());
    }
    function canPerform(th, done, i) {
      const b = th[i];
      for (let j = 0; j < i; j++) {
        if (done[j]) continue;
        const a = th[j];
        if (a.op === 'F' || b.op === 'F') return false;
        if (a.a && b.a && a.a === b.a) return false;
        if (a.acq) return false;
        if (b.rel) return false;
        if (a.rel && b.acq) return false;
      }
      return true;
    }
    function perform(n, ins) { if (ins.op === 'W') n.mem[ins.a] = ins.v; else if (ins.op === 'R') n.reg[ins.r] = n.mem[ins.a]; else if (ins.op === 'X') { n.reg[ins.r] = n.mem[ins.a]; n.mem[ins.a] = ins.v; } }
    function scStep(st, t, ins) { const n = clone(st); perform(n, ins); n.pc[t]++; return n; }
    const clone = st => JSON.parse(JSON.stringify(st));
    const init = { pc: prog.map(() => 0), done: prog.map(th => th.map(() => 0)), mem: Object.fromEntries(addrs.map(a => [a, 0])), reg: {}, buf: prog.map(() => []) };
    visit(init);
    const all = ['0,0', '0,1', '1,0', '1,1'];
    return { test, fence, model, states, allowed: all.filter(k => outs.has(k)), odd: T.odd, oddAllowed: outs.has(T.odd) };
  }
  function litmusTable(test, fence) { const o = {}; for (const m of MODELS) o[m] = litmus(test, fence, m); return o; }

  /* ── 10 locks, run on the coherence engine (MESI). n cores all want one lock, again and again. Time advances in
     rounds; in each round every core makes one memory access, in a seeded random order. The holder works for H rounds
     on private data (no traffic), then releases. Lock kinds (Mellor-Crummey & Scott 1991): TAS spins with an atomic
     exchange; TTAS reads until the lock looks free, then exchanges; the ticket lock takes a ticket with fetch-and-add
     and spins reading now_serving; MCS swaps itself onto the tail of a queue and spins on a flag in its own line, which
     its predecessor clears with one write. Counted: bus transactions (BusRd, BusRdX, BusUpgr, writebacks) per handoff. ── */
  const LOCK = { H: 20, handoffs: 60, warm: 4, seed: 19, kinds: ['tas', 'ttas', 'ticket', 'mcs'], cores: [2, 4, 8, 16, 32, 64] };   // H TUNED
  function lockSim(kind, n, opts) {
    opts = opts || {}; const H = opts.H != null ? opts.H : LOCK.H, HO = opts.handoffs || LOCK.handoffs, R = rng(opts.seed || LOCK.seed);
    // lines: 0 lock word (TAS/TTAS) or next_ticket; 1 now_serving (ticket) or tail (MCS); 2 + c: core c's queue node (MCS)
    const sys = makeSystem('mesi', n, 2 + n), mem = new Array(2 + n).fill(0);
    const A = (c, op, l) => access(sys, c, op, l);
    const S = []; for (let c = 0; c < n; c++) S.push({ ph: 'want', work: 0, ticket: 0, pred: -1 });
    // MCS state kept in "memory": tail (line 1) holds core+1 or 0; node c: locked flag and next pointer (both in line 2+c)
    const node = []; for (let c = 0; c < n; c++) node.push({ locked: 0, next: -1 });
    let holder = -1, handoffs = 0, txAtStart = 0, round = 0, started = false;
    const order = []; for (let c = 0; c < n; c++) order.push(c);
    while (handoffs < HO + LOCK.warm && round < 200000) {
      round++;
      for (let i = n - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
      for (const c of order) {
        const s = S[c];
        if (s.ph === 'hold') { if (++s.work >= H) { release(c); } continue; }
        if (s.ph === 'relwait') { A(c, 'R', 2 + c); if (node[c].next !== -1) { const nx = node[c].next; A(c, 'W', 2 + nx); node[nx].locked = 0; s.ph = 'want'; } continue; }
        acquireStep(c);
      }
    }
    function got(c) { const s = S[c]; s.ph = 'hold'; s.work = 0; if (holder !== -1 && holder !== c) { /* unreachable */ } holder = c; handoffs++; if (!started && handoffs >= LOCK.warm) { started = true; txAtStart = sys.led.tx; } }
    function acquireStep(c) {
      const s = S[c];
      if (kind === 'tas') { A(c, 'W', 0); if (mem[0] === 0) { mem[0] = 1; got(c); } return; }
      if (kind === 'ttas') {
        if (s.ph === 'want') { A(c, 'R', 0); if (mem[0] === 0) s.ph = 'try'; return; }
        A(c, 'W', 0); if (mem[0] === 0) { mem[0] = 1; got(c); } else s.ph = 'want'; return;
      }
      if (kind === 'ticket') {
        if (s.ph === 'want') { A(c, 'W', 0); s.ticket = mem[0]++; s.ph = 'spin'; return; }
        A(c, 'R', 1); if (mem[1] === s.ticket) got(c); return;
      }
      // MCS
      if (s.ph === 'want') { node[c].next = -1; node[c].locked = 1; A(c, 'W', 2 + c); s.ph = 'swap'; return; }
      if (s.ph === 'swap') { A(c, 'W', 1); const pred = mem[1] - 1; mem[1] = c + 1; if (pred < 0) { got(c); return; } s.pred = pred; s.ph = 'link'; return; }
      if (s.ph === 'link') { A(c, 'W', 2 + s.pred); node[s.pred].next = c; s.ph = 'spin'; return; }
      A(c, 'R', 2 + c); if (node[c].locked === 0) got(c);
    }
    function release(c) {
      const s = S[c]; s.ph = 'want'; holder = -1;
      if (kind === 'tas' || kind === 'ttas') { A(c, 'W', 0); mem[0] = 0; return; }
      if (kind === 'ticket') { A(c, 'W', 1); mem[1]++; return; }
      // MCS: if no successor is linked yet and we are the tail, clear the tail; if a successor is swapping in, the
      // releaser must wait for the link (here: it releases once the link appears, by staying in 'rel' state)
      A(c, 'R', 2 + c);
      if (node[c].next === -1) {
        A(c, 'W', 1);
        if (mem[1] === c + 1) { mem[1] = 0; return; }
        s.ph = 'relwait'; return;
      }
      const nx = node[c].next; A(c, 'W', 2 + nx); node[nx].locked = 0;
    }
    const tx = sys.led.tx - txAtStart, ho = Math.max(1, handoffs - LOCK.warm);
    return { kind, n, H, handoffs: ho, tx, perHandoff: tx / ho, rounds: round };
  }

  /* ── numbers quoted in the prose: [value, decimals, kind] ── */
  let PROSE_CACHE = null;
  function prose() {
    if (PROSE_CACHE) return PROSE_CACHE;
    const pr = Object.fromEntries(PRESETS.map(p => [p, Object.fromEntries(PROTOS.slice(1).map(q => [q, presetRun(p, q).led]))]));
    const sNone = stale('none', 4), sMesi = stale('mesi', 4);
    const d16 = dirCompare(16), d64 = dirCompare(64), d4 = dirCompare(4), d256 = dirCompare(256);
    const lu1 = lostUpdate(1), lu2 = lostUpdate(2), lu3 = lostUpdate(3), lu5 = lostUpdate(5);
    const rc1 = raceSim(1), rc64 = raceSim(64), rc1024 = raceSim(1024), rcLong = RACE.bursts.filter(b => b > 1).map(b => raceSim(b).lost / (2 * RACE.N));
    const c2 = casLoop(2), c8 = casLoop(8), c32 = casLoop(32);
    const pi0 = pingPong(2, 'intra', 'shared', 0), pi1 = pingPong(2, 'intra', 'shared', 1), pc0 = pingPong(2, 'cross', 'shared', 0), ps = pingPong(2, 'socket', 'shared', 0), pp = pingPong(2, 'intra', 'private'), p8 = pingPong(8, 'intra', 'shared', 0);
    const L = k => n => lockSim(k, n).perHandoff;
    const lk = Object.fromEntries(LOCK.kinds.map(k => [k, Object.fromEntries([4, 16, 64].map(n => [n, L(k)(n)]))]));
    const tasH2 = lockSim('tas', 16, { H: LOCK.H * 2 }).perHandoff;
    const B = LAT.bergamo, V = FRONTIER.venice, X6 = FRONTIER.xeon6p;
    PROSE_CACHE = {
      // ch1
      stNoneVal: [sNone.recs[3].value, 0], stMesiVal: [sMesi.recs[3].value, 0],
      // ch3 presets: bus transactions, writebacks, memory reads
      prMsiTx: [pr.private.msi.tx, 0], prMesiTx: [pr.private.mesi.tx, 0], prMsiUp: [pr.private.msi.upgr, 0],
      pcMesiWb: [pr.prodcons.mesi.wb, 0], pcMoesiWb: [pr.prodcons.moesi.wb, 0], pcMsiMem: [pr.prodcons.msi.memRd, 0], pcMesiMem: [pr.prodcons.mesi.memRd, 0], pcMesiTx: [pr.prodcons.mesi.tx, 0], pcMoesiTx: [pr.prodcons.moesi.tx, 0],
      mgMesiWb: [pr.migratory.mesi.wb, 0], mgMoesiWb: [pr.migratory.moesi.wb, 0], mgMesiTx: [pr.migratory.mesi.tx, 0], mgMoesiTx: [pr.migratory.moesi.tx, 0],
      roMesiTx: [pr.readonly.mesi.tx, 0], simRounds: [SIM.rounds, 0],
      // ch4
      ov64: [dirOverhead(64, 'full'), 1, 'pct'], ov256: [dirOverhead(256, 'full'), 0, 'pct'], ov1024: [dirOverhead(1024, 'full'), 0, 'pct'], ovC1024: [dirOverhead(1024, 'coarse'), 1, 'pct'], ovP1024: [dirOverhead(1024, 'ptr'), 1, 'pct'],
      dirK: [DIR.coarseK, 0], dirI: [DIR.pointers, 0],
      d4s: [d4.perMissSnoop, 1], d4d: [d4.perMissDir, 1], d16s: [d16.perMissSnoop, 1], d16d: [d16.perMissDir, 1], d64s: [d64.perMissSnoop, 1], d64d: [d64.perMissDir, 1], d256s: [d256.perMissSnoop, 0], d256d: [d256.perMissDir, 1], d64hop: [d64.threeHopShare, 0, 'pct'],
      dirOps: [DIR.trace.ops, 0], dirLines: [DIR.trace.lines, 0], dirPW: [DIR.trace.pWrite, 0, 'pct'], dirHot: [DIR.trace.hot, 0, 'pct'], dirHotN: [DIR.trace.hotLines, 0],
      // ch5
      lu1n: [lu1.total, 0], lu1min: [lu1.min, 0], lu2n: [lu2.total, 0], lu2min: [lu2.min, 0], lu3n: [lu3.total, 0], lu3ok: [lu3.pCorrect, 1, 'pct'], lu5n: [lu5.total, 0], lu5ok: [lu5.pCorrect, 1, 'pct'], lu5min: [lu5.min, 0],
      raceN: [RACE.N, 0], rcLo: [Math.min(...rcLong), 0, 'pct'], rcHi: [Math.max(...rcLong), 0, 'pct'], rc1: [rc1.final, 0], rc64: [rc64.final, 0], rc1024: [rc1024.final, 0], rc1024lost: [rc1024.lost, 0],
      // ch6
      casM: [CAS.M, 0], cas2: [c2.stepsPerInc, 2], cas8: [c8.stepsPerInc, 1], cas32: [c32.stepsPerInc, 1], cas32f: [c32.failShare, 0, 'pct'],
      // ch7
      bIntraLo: [B.intra[0], 0], bIntraHi: [B.intra[1], 0], bCrossLo: [B.cross[0], 0], bCrossHi: [B.cross[1], 0], bSock: [B.socket, 0], bSockMax: [B.socketMax, 0], z5cross: [LAT.zen5desk.crossCcd, 0],
      piRate0: [pi0.totalRate * 1000, 0], piRate1: [pi1.totalRate * 1000, 0], pcRate: [pc0.totalRate * 1000, 1], psRate: [ps.totalRate * 1000, 1], ppRate: [pp.totalRate * 1000, 0],
      piMs: [pi0.timeFor(2 * PING.inc) / 1e6, 0], piMsHi: [pi1.timeFor(2 * PING.inc) / 1e6, 0], psMs: [ps.timeFor(2 * PING.inc) / 1e6, 0], ppMs: [pp.timeFor(PING.inc) / 1e6, 0], p8Rate: [p8.totalRate * 1000, 0], pingT: [PING.t, 0],
      // ch10
      tas4: [lk.tas[4], 0], tas16: [lk.tas[16], 0], tas64: [lk.tas[64], 0], ttas4: [lk.ttas[4], 1], ttas16: [lk.ttas[16], 1], ttas64: [lk.ttas[64], 0], tk4: [lk.ticket[4], 1], tk16: [lk.ticket[16], 1], tk64: [lk.ticket[64], 0],
      mcs4: [lk.mcs[4], 1], mcs16: [lk.mcs[16], 1], mcs64: [lk.mcs[64], 1], lockH: [LOCK.H, 0], tasH2: [tasH2, 0],
      // frontier
      e9965: [FRONTIER.epyc9965.cores, 0], vCores: [V.cores, 0], vCcd: [V.ccds, 0], vCcdC: [V.ccdCores, 0], vCcx: [V.ccxCores, 0], vL3: [V.l3, 0], x6Cores: [X6.cores, 0], x6L3: [X6.l3, 0], x6S: [X6.sockets, 0], x6Dom: [X6.cores * X6.sockets, 0],
      tdCores: [FRONTIER.tardis.cores, 0], armRuns: [FRONTIER.armMp.runs, 0], armSeen: [FRONTIER.armMp.seen, 0], vClaim: [FRONTIER.claims.venicePerf, 0], x6Claim: [FRONTIER.claims.xeon6pPerThread, 0]
    };
    return PROSE_CACHE;
  }

  /* ── formatting ── */
  function fmt(x, d, lang) {
    if (x == null || !isFinite(x)) return '—';
    const s = (d == null ? (Math.abs(x) >= 100 ? 0 : Math.abs(x) >= 10 ? 1 : 2) : d);
    const k = Math.pow(10, s); x = Math.sign(x) * Math.round(Math.abs(x) * k * (1 + 1e-12)) / k;
    return Number(x).toLocaleString(lang === 'en' ? 'en-US' : 'zh-CN', { minimumFractionDigits: s, maximumFractionDigits: s });
  }

  /* ── live sentences: each returns { key, v } ── */
  const say = {
    stale(proto, steps) {
      const r = stale(proto, steps), last = r.recs[r.recs.length - 1];
      if (!steps) return { key: 'ch1.say.start', v: r };
      if (steps < 4) return { key: 'ch1.say.step' + steps + (proto === 'none' ? 'n' : 'p'), v: r };
      return { key: last.stale ? 'ch1.say.stale' : 'ch1.say.fresh', v: r };
    },
    sim(rec) {
      if (!rec) return { key: 'ch3.say.start' };
      if (rec.op === 'E') return { key: rec.wb ? 'ch3.say.evictwb' : (rec.before === 'I' ? 'ch3.say.evictnone' : 'ch3.say.evict') };
      if (!rec.bus) return { key: rec.op === 'R' ? 'ch3.say.hit' : (rec.before === 'E' ? 'ch3.say.silent' : 'ch3.say.hitw') };
      if (rec.bus === 'BusUpgr') return { key: 'ch3.say.upgr' };
      if (rec.op === 'R') return { key: rec.wb ? 'ch3.say.rdwb' : rec.from === 'cache' ? (rec.owned ? 'ch3.say.rdown' : 'ch3.say.rdc2c') : (rec.after === 'E' ? 'ch3.say.rdE' : 'ch3.say.rdmem') };
      return { key: rec.from === 'cache' ? 'ch3.say.rdxc2c' : 'ch3.say.rdxmem' };
    },
    preset(name, proto) { return { key: 'ch3.say.p.' + name, v: presetRun(name, proto).led }; },
    dir(N) { const r = dirCompare(N); return { key: r.perMissSnoop > r.perMissDir ? 'ch4.say.dirwins' : 'ch4.say.snoopwins', v: r }; },
    lost(k, atomic) { const r = lostUpdate(k, atomic); return { key: atomic ? 'ch5.say.atomic' : k === 1 ? 'ch5.say.k1' : 'ch5.say.race', v: r }; },
    // race: every b ≥ 1 switches mid-update, so something is always lost
    race(b) { const r = raceSim(b); return { key: 'ch5.say.racebad', v: r }; },
    cas(n) { const r = casLoop(n); return { key: n === 1 ? 'ch6.say.one' : 'ch6.say.many', v: r }; },
    ping(n, place, mode) { const r = pingPong(n, place, mode, 0); return { key: mode === 'private' ? 'ch7.say.private' : n === 1 ? 'ch7.say.one' : 'ch7.say.shared', v: r }; },
    litmus(test, fence, model) { const r = litmus(test, fence, model); return { key: r.oddAllowed ? 'ch8.say.allowed' : 'ch8.say.forbidden', v: r }; },
    lock(kind, n) { const r = lockSim(kind, n); return { key: 'ch10.say.' + kind, v: r }; }
  };

  return { LINE, rng, LAT, FRONTIER, PROTOS, makeSystem, access, invariants, runTrace, STALE, stale, SIM, PRESETS, preset, presetRun,
    DIR, dirBits, dirOverhead, dirTrace, dirCompare, lostUpdate, binom, RACE, raceSim, CAS, casLoop, PING, pingT, pingPong,
    LITMUS, MODELS, litmus, litmusTable, LOCK, lockSim, prose, fmt, say };
});
