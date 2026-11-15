/* How CPU caches work: the page's models. Every model is a real cache simulated on an address trace generated
   here from a seeded generator, or a named result (Mattson stack distance, Belady MIN, Hill's 3C, Chen & Baer's
   reference prediction table, the Illinois MESI protocol). Real-chip figures sit in CHIPS / FRONTIER with their
   source and the date it was opened (also listed in BRIEF.md). Constants chosen for the model rather than taken from
   a source are marked TUNED here and on the page.
   UMD: window.CacheModels in the browser, module.exports in node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CacheModels = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const KiB = 1024, MiB = 1048576, LINE = 64;
  const log2 = x => Math.round(Math.log2(x));
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

  // mulberry32: a small seeded generator, so every trace and every random choice repeats exactly
  function rng(seed) {
    let a = seed >>> 0;
    return function () { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }

  /* ── Real-chip figures (sources in BRIEF.md, opened 2026-11-15) ── */
  const CHIPS = {
    // AMD, "Software Optimization Guide for the AMD Zen5 Microarchitecture", pub. 58455 rev 1.00 (August 2024),
    // §2.6.1–2.6.4; and AMD's Hot Chips 2024 talk (Cohen, Subramony; August 2024), slides 4, 10, 11, 18.
    zen5: {
      l1i: { size: 32 * KiB, ways: 8 }, l1d: { size: 48 * KiB, ways: 12, lat: 4, latMax: 5 },
      l2: { size: 1 * MiB, ways: 16, lat: 14 }, l3: { size: 32 * MiB, ways: 16, lat: 46, perCcx: 8, maxSoc: 96 * MiB },
      line: 64, l3victim: true, l2inclusiveL1: true, docDate: '2024-08'
    },
    // AMD product page, Ryzen 9 9950X (opened 2026-11-15): up to 5.7 GHz boost, 16 MB L2, 64 MB L3, launch 2024-08-15
    r9950x: { ghz: 5.7, l2: 16 * MiB, l3: 64 * MiB, cores: 16, launch: '2024-08-15' },
    // Chips and Cheese, "AMD's Ryzen 9950X: Zen 5 on Desktop" (2024-08-14): "just over 70 ns" DRAM latency, DDR5-6000
    dramNs: 70, dramNote: 'DDR5-6000, Chips and Cheese 2024-08-14',
    // Intel Tech Tour 2024, "Next Gen P-core: The Lion Cove Architecture" (June 2024), memory-subsystem slide
    lionCove: { l0: { size: 48 * KiB, lat: 4 }, l1: { size: 192 * KiB, lat: 9 }, l2: { size: 2.5 * MiB, sizeAlt: 3 * MiB, lat: 17 },
      prev: { l1: { size: 48 * KiB, lat: 5 }, l2: { size: 2 * MiB, lat: 16 } } },
    // Intel Hot Chips 2024 (Lunar Lake): Skymont 4-core cluster with a 4 MB shared L2; up to 12 MB shared L3; 8 MB memory-side cache.
    // Chips and Cheese "Lion Cove: Intel's P-core roars" (2024-09-27, Core Ultra 7 258V): L3 51 cycles measured, DRAM about 131 ns.
    lunarLake: { skymontL2: 4 * MiB, l3: 12 * MiB, msc: 8 * MiB, l3lat: 51, dramNs: 131 },
    // Arm Neoverse V3 TRM (107734), as quoted by jia.je's Graviton 5 measurements (2026-06-13): L1D 64 KB 4-way
    // "VIPT behaving as PIPT", 64 B line; L2 2 MB 8-way or 3 MB 12-way, PIPT; measured L1D load-to-use 4 cycles.
    // AMD Hot Chips 2024 slide 18 (Strix Point): 4 Zen 5 cores share 16 MB of L3, 8 Zen 5c cores share 8 MB
    strix: { zen5: 4, zen5L3: 16 * MiB, zen5c: 8, zen5cL3: 8 * MiB },
    neoV3: { l1d: { size: 64 * KiB, ways: 4, lat: 4 }, l1i: { size: 64 * KiB, ways: 4 }, l2: { size: 2 * MiB, ways: 8 }, l2alt: { size: 3 * MiB, ways: 12 } },
    // macOS sysctl on the machine this page was written on (brand string "Apple M6"), read 2026-11-15:
    // hw.perflevel0.l1dcachesize 131072, l1icachesize 196608, l2cachesize 20971520 shared by 2; hw.pagesize 16384; hw.cachelinesize 128.
    appleHost: { name: 'Apple M6', l1d: 128 * KiB, l1i: 192 * KiB, l2: 20 * MiB, l2share: 2, page: 16 * KiB, line: 128, read: '2026-11-15' }
  };
  const ZEN = CHIPS.zen5;
  const dramCycles = () => CHIPS.dramNs * CHIPS.r9950x.ghz;                     // ≈ 399

  /* ── 02 the address split ── */
  function geometry(size, ways, line) {
    line = line || LINE; const sets = size / (ways * line);
    return { size, ways, line, sets, offBits: log2(line), idxBits: log2(sets), lowBits: log2(line) + log2(sets) };
  }
  function split(addr, g) {
    const lineNo = Math.floor(addr / g.line);
    return { offset: addr % g.line, index: lineNo % g.sets, tag: Math.floor(lineNo / g.sets), line: lineNo };
  }
  function parseHex(s) {
    const m = String(s).trim().replace(/_/g, '').match(/^(0x)?([0-9a-f]{1,12})$/i);
    return m ? parseInt(m[2], 16) : null;
  }

  /* ── the cache engine: one set-associative cache with a chosen replacement policy.
     probe() looks without changing anything; touch() records a hit; fill() brings a line in and returns the line it
     pushed out. Line addresses are byte address / line size. ── */
  const POLICIES = ['lru', 'plru', 'random', 'srrip', 'brrip'];
  function makeCache(o) {
    const line = o.line || LINE, ways = o.ways, sets = Math.round(o.size / (line * ways)), N = sets * ways;
    const tag = new Float64Array(N).fill(-1), dirty = new Uint8Array(N), stamp = new Float64Array(N), rrpv = new Uint8Array(N), flag = new Uint8Array(N);
    const tree = new Uint8Array(sets * ways), R = rng(o.seed || 7), pol = o.policy || 'lru';
    let clock = 0;
    const setOf = L => L % sets;
    function probe(L) { const b = setOf(L) * ways; for (let w = 0; w < ways; w++) if (tag[b + w] === L) return b + w; return -1; }
    function plruTouch(s, w) { // heap-ordered tree, node 1 at the root; bit 0 = victim on the left, 1 = on the right
      let node = 1, lo = 0, hi = ways;
      while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (w < mid) { tree[s * ways + node] = 1; node = 2 * node; hi = mid; } else { tree[s * ways + node] = 0; node = 2 * node + 1; lo = mid; } }
    }
    function plruVictim(s) {
      let node = 1, lo = 0, hi = ways;
      while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (tree[s * ways + node] === 0) { node = 2 * node; hi = mid; } else { node = 2 * node + 1; lo = mid; } }
      return lo;
    }
    function touch(i, isW) {
      if (isW) dirty[i] = 1;
      const s = Math.floor(i / ways), w = i % ways;
      if (pol === 'lru') stamp[i] = ++clock; else if (pol === 'plru') plruTouch(s, w); else if (pol === 'srrip' || pol === 'brrip') rrpv[i] = 0;
    }
    function victimWay(s) {
      const b = s * ways;
      for (let w = 0; w < ways; w++) if (tag[b + w] < 0) return w;
      if (pol === 'lru') { let v = 0; for (let w = 1; w < ways; w++) if (stamp[b + w] < stamp[b + v]) v = w; return v; }
      if (pol === 'plru') return plruVictim(s);
      if (pol === 'random') return Math.floor(R() * ways);
      for (;;) { for (let w = 0; w < ways; w++) if (rrpv[b + w] === 3) return w; for (let w = 0; w < ways; w++) rrpv[b + w]++; }
    }
    function fill(L, isW, fl) {
      const s = setOf(L), w = victimWay(s), i = s * ways + w;
      const out = tag[i] >= 0 ? { line: tag[i], dirty: dirty[i] === 1, flag: flag[i] } : null;
      tag[i] = L; dirty[i] = isW ? 1 : 0; flag[i] = fl || 0;
      if (pol === 'lru') stamp[i] = ++clock; else if (pol === 'plru') plruTouch(s, w);
      else if (pol === 'srrip') rrpv[i] = 2; else if (pol === 'brrip') rrpv[i] = R() < 1 / 32 ? 2 : 3;
      return out;
    }
    function remove(L) { const i = probe(L); if (i < 0) return null; const out = { line: L, dirty: dirty[i] === 1, flag: flag[i] }; tag[i] = -1; dirty[i] = 0; flag[i] = 0; stamp[i] = 0; return out; }
    function lines() { const a = []; for (let i = 0; i < N; i++) if (tag[i] >= 0) a.push({ line: tag[i], dirty: dirty[i] === 1, set: Math.floor(i / ways), way: i % ways }); return a; }
    return { line, ways, sets, size: o.size, policy: pol, probe, touch, fill, remove, lines, flag, dirty, tag, treeBits: s => Array.from(tree.slice(s * ways + 1, s * ways + ways)), setOf };
  }
  // run a trace of byte addresses through one cache (allocate on every miss); returns hits / misses
  function run(trace, cfg) {
    const c = makeCache(cfg), n = trace.addr.length; let hits = 0;
    for (let k = 0; k < n; k++) { const L = Math.floor(trace.addr[k] / c.line), i = c.probe(L); if (i >= 0) { hits++; c.touch(i, trace.w ? trace.w[k] : 0); } else c.fill(L, trace.w ? trace.w[k] : 0); }
    return { n, hits, misses: n - hits, hitRate: hits / n };
  }
  // Belady's MIN (1966): on a miss, push out the line whose next use is farthest away (no bypass)
  function runOpt(trace, cfg) {
    const line = cfg.line || LINE, ways = cfg.ways, sets = cfg.size / (line * ways), n = trace.addr.length;
    const next = new Float64Array(n), last = new Map();
    for (let k = n - 1; k >= 0; k--) { const L = Math.floor(trace.addr[k] / line); next[k] = last.has(L) ? last.get(L) : Infinity; last.set(L, k); }
    const tag = new Float64Array(sets * ways).fill(-1), nu = new Float64Array(sets * ways);
    let hits = 0;
    for (let k = 0; k < n; k++) {
      const L = Math.floor(trace.addr[k] / line), b = (L % sets) * ways; let i = -1;
      for (let w = 0; w < ways; w++) if (tag[b + w] === L) { i = b + w; break; }
      if (i >= 0) { hits++; nu[i] = next[k]; continue; }
      let v = -1; for (let w = 0; w < ways; w++) if (tag[b + w] < 0) { v = b + w; break; }
      if (v < 0) { v = b; for (let w = 1; w < ways; w++) if (nu[b + w] > nu[v]) v = b + w; }
      tag[v] = L; nu[v] = next[k];
    }
    return { n, hits, misses: n - hits, hitRate: hits / n };
  }

  /* ── 3C (Hill 1987; Hill & Smith 1989), classified per miss: compulsory = the line was never touched before;
     capacity = a fully associative LRU cache of the same size also misses; conflict = the rest. ── */
  function faLru(capLines) {
    const m = new Map();
    return { access(L) { if (m.has(L)) { m.delete(L); m.set(L, 1); return true; } m.set(L, 1); if (m.size > capLines) m.delete(m.keys().next().value); return false; } };
  }
  function threeC(trace, size, ways, line) {
    line = line || LINE; const capLines = size / line, w = ways === 'fa' ? capLines : ways;
    const c = makeCache({ size, ways: w, line, policy: 'lru' }), fa = faLru(capLines), seen = new Set();
    let comp = 0, cap = 0, conf = 0; const n = trace.addr.length;
    for (let k = 0; k < n; k++) {
      const L = Math.floor(trace.addr[k] / line), i = c.probe(L), faHit = fa.access(L);
      if (i >= 0) { c.touch(i, 0); continue; }
      c.fill(L, 0);
      if (!seen.has(L)) comp++; else if (!faHit) cap++; else conf++;
      seen.add(L);
    }
    return { n, comp, cap, conf, misses: comp + cap + conf, rate: (comp + cap + conf) / n };
  }

  /* ── traces ── */
  function T(n) { return { addr: new Float64Array(n), w: new Uint8Array(n), pc: new Uint16Array(n) }; }
  function fromList(list) { const t = T(list.length); list.forEach((a, k) => { t.addr[k] = a[0]; t.w[k] = a[1] || 0; t.pc[k] = a[2] || 0; }); return t; }

  // ch2: x += a[i] * b[i] for 8 four-byte elements, on a 128-byte direct-mapped (or 2-way) toy cache with 16-byte lines
  const TOY = { size: 128, line: 16, aBase: 0x100, bBases: [0x180, 0x1A0], n: 8, elem: 4 };
  function toyTrace(bBase) { const l = []; for (let i = 0; i < TOY.n; i++) { l.push([TOY.aBase + TOY.elem * i, 0, 1]); l.push([bBase + TOY.elem * i, 0, 2]); } return fromList(l); }
  function toyRun(bBase, ways) {
    const c = makeCache({ size: TOY.size, ways, line: TOY.line, policy: 'lru' }), tr = toyTrace(bBase), g = geometry(TOY.size, ways, TOY.line), steps = [];
    for (let k = 0; k < tr.addr.length; k++) {
      const a = tr.addr[k], L = Math.floor(a / TOY.line), i = c.probe(L), sp = split(a, g);
      let ev = null; if (i >= 0) c.touch(i, 0); else ev = c.fill(L, 0);
      steps.push({ addr: a, arr: tr.pc[k] === 1 ? 'a' : 'b', i: k >> 1, hit: i >= 0, set: sp.index, tag: sp.tag, offset: sp.offset, evicted: ev ? ev.line : null, state: c.lines() });
    }
    return { steps, hits: steps.filter(s => s.hit).length, misses: steps.filter(s => !s.hit).length, sets: g.sets };
  }

  // ch3 / ch4: a small program. Three 4 KiB float arrays A, B, C placed 64 KiB apart, C[i] = A[i] + B[i] for
  // 1,024 elements, then 256 look-ups in a 2 KiB table at random rows; the whole thing four times.
  const PROG = { arr: 4 * KiB, gap: 64 * KiB, base: 0x100000, table: 2 * KiB, tableBase: 0x140000, look: 256, reps: 4, seed: 11 };
  function progTrace() {
    const R = rng(PROG.seed), l = [], A = PROG.base, B = A + PROG.gap, C = B + PROG.gap;
    for (let r = 0; r < PROG.reps; r++) {
      for (let i = 0; i < PROG.arr / 4; i++) { l.push([A + 4 * i, 0, 1]); l.push([B + 4 * i, 0, 2]); l.push([C + 4 * i, 1, 3]); }
      for (let k = 0; k < PROG.look; k++) l.push([PROG.tableBase + 8 * Math.floor(R() * PROG.table / 8), 0, 4]);
    }
    return fromList(l);
  }
  const C3 = { sizes: [2, 4, 8, 16, 32, 64].map(k => k * KiB), ways: [1, 2, 4, 8, 'fa'] };
  let c3cache = null;
  function c3grid() {
    if (c3cache) return c3cache;
    const tr = progTrace(), g = {};
    for (const w of C3.ways) for (const s of C3.sizes) g[w + ':' + s] = threeC(tr, s, w);
    return (c3cache = g);
  }

  // ch4: replacement. A 16 KiB, 8-way cache (32 sets) on three traces.
  const REPL = { size: 16 * KiB, ways: 8, policies: ['lru', 'plru', 'random', 'srrip', 'brrip', 'opt'] };
  function loopTrace(lines, passes) { const t = T(lines * passes); for (let p = 0, k = 0; p < passes; p++) for (let i = 0; i < lines; i++, k++) t.addr[k] = 0x200000 + i * LINE; return t; }
  // hot set of h lines touched in rounds; every `every` rounds a one-time scan of s new lines goes through
  function scanTrace(hotLines, scanLines, rounds) {
    const l = []; let fresh = 0;
    for (let r = 0; r < rounds; r++) {
      for (let i = 0; i < hotLines; i++) l.push([0x300000 + i * LINE]);
      if (r % 2 === 1) for (let i = 0; i < scanLines; i++) l.push([0x4000000 + (fresh++) * LINE]);
    }
    return fromList(l);
  }
  function replTrace(kind, loopFrac) {
    const cap = REPL.size / LINE;
    if (kind === 'loop') return loopTrace(Math.round(cap * loopFrac), 12);
    if (kind === 'scan') return scanTrace(Math.round(cap * 0.75), cap, 24);
    return progTrace();
  }
  function replace(kind, loopFrac, policy) {
    const tr = replTrace(kind, loopFrac), cfg = { size: REPL.size, ways: REPL.ways, policy, seed: 5 };
    return policy === 'opt' ? runOpt(tr, cfg) : run(tr, cfg);
  }

  /* ── 05 writes. A 32 KiB 8-way LRU L1 in front of the next level (L2). Stores are 8 bytes. Write-through sends
     every store on; write-back sends a whole 64-byte line when a dirty line leaves (and, at the end, the lines still
     dirty). With allocate a store miss first reads the line in; without, the store goes past the cache.
     Timing: one access per cycle; a read miss waits TR = 14 cycles (Zen 5's L2 load-to-use); a write buffer of D
     entries hands one entry to the next level every TW cycles; a store (or dirty eviction) that finds the buffer
     full waits. TW is TUNED. ── */
  const WRITE = { size: 32 * KiB, ways: 8, store: 8, TR: ZEN.l2.lat, TW: 3, policies: ['wt-na', 'wt-a', 'wb-na', 'wb-a'], depths: [0, 1, 2, 4, 8, 16] };
  // a stencil that updates a 16 KiB array in place four times (three loads, one store per element), then a pass
  // that reads a 64 KiB input 24 values at a time and writes 8 results in a burst after each block (an output of
  // about 21 KiB, written once)
  function writeTrace() {
    const l = [], U = 0x600000, IN = 0x700000, OUT = 0x800000, n = 16 * KiB / 8;
    for (let r = 0; r < 4; r++) for (let i = 0; i < n; i++) { l.push([U + 8 * Math.max(0, i - 1), 0]); l.push([U + 8 * i, 0]); l.push([U + 8 * Math.min(n - 1, i + 1), 0]); l.push([U + 8 * i, 1]); }
    for (let b = 0, o = 0; b < 64 * KiB / 8; b += 24) { for (let i = b; i < b + 24; i++) l.push([IN + 8 * i, 0]); for (let j = 0; j < 8; j++, o++) l.push([OUT + 8 * o, 1]); }
    return fromList(l);
  }
  function writes(policy, depth, opts) {
    opts = opts || {}; const TR = opts.TR || WRITE.TR, TW = opts.TW || WRITE.TW;
    const wb = policy.startsWith('wb'), alloc = policy.endsWith('-a'), tr = opts.trace || writeTrace();
    const c = makeCache({ size: WRITE.size, ways: WRITE.ways, policy: 'lru' }), n = tr.addr.length;
    let rd = 0, wrBytes = 0, wrOps = 0, hits = 0, t = 0, wait = 0, readStall = 0;
    const q = [];                                                   // completion times of buffered writes
    const enqueue = () => {
      wrOps++;
      if (depth === 0) { const start = Math.max(t, q.length ? q[q.length - 1] : 0); wait += start + TW - t; t = start + TW; q.push(t); return; }
      while (q.length && q[0] <= t) q.shift();
      if (q.length >= depth) { wait += q[0] - t; t = q[0]; q.shift(); }
      const start = Math.max(t, q.length ? q[q.length - 1] : t); q.push(start + TW);
    };
    for (let k = 0; k < n; k++) {
      t += 1; const L = Math.floor(tr.addr[k] / LINE), isW = tr.w[k] === 1, i = c.probe(L);
      if (i >= 0) { hits++; c.touch(i, isW && wb); if (isW && !wb) { wrBytes += WRITE.store; enqueue(); } continue; }
      if (isW && !alloc) { wrBytes += WRITE.store; enqueue(); continue; }
      rd += LINE; t += TR; readStall += TR;
      const ev = c.fill(L, isW && wb);
      if (ev && ev.dirty) { wrBytes += LINE; enqueue(); }
      if (isW && !wb) { wrBytes += WRITE.store; enqueue(); }
    }
    const tail = c.lines().filter(x => x.dirty).length;              // dirty lines still to be written at the end
    return { n, hits, readBytes: rd, writeBytes: wrBytes + tail * LINE, tailLines: tail, writeOps: wrOps, cycles: t, wait, readStall, waitShare: wait / t,
      stores: Array.from(tr.w).filter(x => x).length };
  }

  /* ── 01 why several levels. The program of ch1 is four loops interleaved at fixed shares of all accesses; each
     sweeps its data in order. Under LRU a line is still in a cache of C lines exactly when fewer than C distinct
     lines were touched since its last use (its reuse distance, Mattson et al. 1970). For loops of N_r lines taking a
     share p_r of accesses, the reuse distance of loop r is N_r plus, for every other loop o, min(N_o, p_o·N_r/p_r).
     A level of capacity C serves loop r when that distance is below C; an inclusive LRU hierarchy then serves each
     access at the first level that holds it (Mattson's inclusion property). The tests check this against a
     simulation of the actual interleaved trace. Program shares and sizes are TUNED (an illustrative program). ── */
  const PROGRAM = {
    loops: [
      { id: 'stack', lines: 16 * KiB / LINE, p: 0.60 },
      { id: 'work', lines: 384 * KiB / LINE, p: 0.25 },
      { id: 'table', lines: 8 * MiB / LINE, p: 0.12 },
      { id: 'stream', lines: Infinity, p: 0.03 }
    ]
  };
  function program(tableMiB) { return PROGRAM.loops.map(l => l.id === 'table' && tableMiB ? Object.assign({}, l, { lines: tableMiB * MiB / LINE }) : l); }
  function reuse(loops) {
    return loops.map(r => {
      if (!isFinite(r.lines)) return Infinity;
      let d = r.lines; for (const o of loops) if (o !== r) d += Math.min(o.lines, o.p * r.lines / r.p); return d;
    });
  }
  const LEVELS = { l1: { size: ZEN.l1d.size, lat: ZEN.l1d.lat }, l2: { size: ZEN.l2.size, lat: ZEN.l2.lat }, l3: { size: ZEN.l3.size, lat: ZEN.l3.lat } };
  function amat(on, tableMiB) {
    const loops = program(tableMiB), D = reuse(loops), mem = dramCycles(), lv = ['l1', 'l2', 'l3'].filter(k => on[k]);
    const served = { l1: 0, l2: 0, l3: 0, mem: 0 }; let t = 0;
    loops.forEach((r, i) => {
      const k = lv.find(k => D[i] < LEVELS[k].size / LINE);
      if (k) { served[k] += r.p; t += r.p * LEVELS[k].lat; } else { served.mem += r.p; t += r.p * mem; }
    });
    return { amat: t, served, D, mem };
  }
  // the actual interleaved trace of the ch1 program (each loop advances when its accumulated share reaches 1)
  function programTrace(n, tableMiB) {
    const loops = program(tableMiB), acc = loops.map(() => 0), pos = loops.map(() => 0), t = T(n), base = [0x10000000, 0x20000000, 0x40000000, 0x80000000];
    for (let k = 0; k < n; k++) {
      let best = 0; for (let i = 0; i < loops.length; i++) { acc[i] += loops[i].p; if (acc[i] > acc[best]) best = i; }
      acc[best] -= 1; const L = isFinite(loops[best].lines) ? pos[best] % loops[best].lines : pos[best]; pos[best]++;
      t.addr[k] = base[best] * 1 + L * LINE; t.pc[k] = best;
    }
    return t;
  }

  /* ── 06 inclusive, exclusive (victim) and non-inclusive. One core's L2 (16-way) and its L3 share (16-way),
     both LRU, under uniform random reads over a working set of W bytes. Sizes are Zen 5's scaled down 16× so the
     simulation runs in the page (hit rates under uniform random access depend on W / capacity, not on the absolute
     size): L2 1 MiB → 64 KiB; L3 share 4 MiB (desktop Zen 5, 32 MiB for 8 cores) → 256 KiB, or 1 MiB (Strix Point's
     8 Zen 5c with 8 MiB) → 64 KiB. ── */
  const HIER = { scale: 16, l2: 64 * KiB, l3: { desk: 256 * KiB, dense: 64 * KiB }, ways: 16, wMul: [0.5, 0.75, 1, 1.5, 2, 3, 4, 5, 6, 8], seed: 23 };
  function hierarchy(kind, l3size, W, opts) {
    opts = opts || {};
    const l2 = makeCache({ size: HIER.l2, ways: HIER.ways }), l3 = makeCache({ size: l3size, ways: HIER.ways }), R = rng(HIER.seed);
    const wl = Math.round(W / LINE), n = opts.n || Math.max(60000, wl * 24), warm = Math.floor(n / 3);
    let h2 = 0, h3 = 0, mem = 0, back = 0, cnt = 0;
    for (let k = 0; k < n; k++) {
      const L = Math.floor(R() * wl), m = k >= warm; if (m) cnt++;
      const i2 = l2.probe(L);
      if (i2 >= 0) { l2.touch(i2, 0); if (m) h2++; continue; }
      const i3 = l3.probe(L);
      if (i3 >= 0) {
        if (m) h3++;
        if (kind === 'excl') { l3.remove(L); const ev = l2.fill(L, 0); if (ev) l3.fill(ev.line, 0); }
        else { l3.touch(i3, 0); l2.fill(L, 0); }
        continue;
      }
      if (m) mem++;
      if (kind === 'excl') { const ev = l2.fill(L, 0); if (ev) l3.fill(ev.line, 0); }
      else {
        const e3 = l3.fill(L, 0);
        if (kind === 'incl' && e3 && l2.remove(e3.line)) { if (m) back++; }
        l2.fill(L, 0);
      }
    }
    const uniq = new Set(l2.lines().map(x => x.line)); for (const x of l3.lines()) uniq.add(x.line);
    return { h2: h2 / cnt, h3: h3 / cnt, hit: (h2 + h3) / cnt, mem: mem / cnt, back: back / cnt, unique: uniq.size * LINE, n: cnt };
  }
  function capacityOf(kind, l3size) { return kind === 'incl' ? l3size : kind === 'excl' ? HIER.l2 + l3size : null; }

  /* ── 07 VIPT: the cache picks a set with address bits below the page size while the TLB translates the rest. If
     index + offset bits fit inside the page offset, no two virtual names of one physical line can land in different
     sets: size ≤ page size × ways. ── */
  function vipt(size, ways, page, line) {
    line = line || LINE; const perWay = size / ways, sets = perWay / line, pow2 = Number.isInteger(Math.log2(sets)), pageBits = log2(page);
    const lowBits = Math.ceil(Math.log2(perWay) - 1e-9), extra = Math.max(0, lowBits - pageBits);
    return { lowBits, pageBits, fits: perWay <= page, extra, limit: page * ways, sets, pow2, aliases: Math.pow(2, extra) };
  }

  /* ── 08 prefetching. A 32 KiB 8-way LRU cache. Next-line: on a miss, also fetch the following line. Stride: a
     reference prediction table indexed by the load's PC (Chen & Baer 1995): each entry keeps the last address, the
     stride and a state (initial → transient → steady, or no-prediction); in steady state it fetches the line
     `dist` strides ahead, `degree` lines in a row. A prefetched line counts as useful when a demand access finds it.
     Coverage = useful / misses without prefetching; accuracy = useful / issued. Prefetches are assumed to arrive in
     time. ── */
  const PF = { size: 32 * KiB, ways: 8 };
  function pfTrace(kind) {
    const l = [];
    if (kind === 'stride') { for (let i = 0; i < 4096; i++) l.push([0x1000000 + i * 256, 0, 1]); }           // a struct field, 256-byte records
    else if (kind === 'matrix') { for (let j = 0; j < 8; j++) for (let i = 0; i < 512; i++) l.push([0x2000000 + i * 4096 + j * 8, 0, 2]); } // walk down columns of a 512×512 double matrix
    else if (kind === 'list') { const R = rng(31), perm = [...Array(4096).keys()]; for (let i = perm.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [perm[i], perm[j]] = [perm[j], perm[i]]; } for (const p of perm) l.push([0x3000000 + p * 64, 0, 3]); } // a linked list scattered in memory
    else { const R = rng(37); for (let i = 0; i < 4096; i++) { l.push([0x1000000 + i * 64, 0, 1]); l.push([0x4000000 + Math.floor(R() * 65536) * 64, 0, 4]); } }  // sequential scan beside probes at random rows of a 4 MiB hash table
    return fromList(l);
  }
  function prefetch(kind, mode, dist, degree) {
    const tr = pfTrace(kind), c = makeCache({ size: PF.size, ways: PF.ways }), n = tr.addr.length;
    const base = run(tr, { size: PF.size, ways: PF.ways });
    const rpt = new Map(); let issued = 0, useful = 0, misses = 0;
    const pf = L => { if (c.probe(L) >= 0) return; issued++; const ev = c.fill(L, 0, 1); };
    for (let k = 0; k < n; k++) {
      const a = tr.addr[k], L = Math.floor(a / LINE), i = c.probe(L);
      if (i >= 0) { if (c.flag[i]) { useful++; c.flag[i] = 0; } c.touch(i, 0); }
      else { misses++; c.fill(L, 0, 0); if (mode === 'next') for (let d = 1; d <= degree; d++) pf(L + d); }
      if (mode === 'stride') {
        const e = rpt.get(tr.pc[k]);
        if (!e) { rpt.set(tr.pc[k], { last: a, stride: 0, st: 'init' }); continue; }
        const s = a - e.last, ok = s === e.stride, was = e.st;
        if (was === 'init') e.st = ok ? 'steady' : 'trans'; else if (was === 'trans') e.st = ok ? 'steady' : 'nopred';
        else if (was === 'steady') e.st = ok ? 'steady' : 'init'; else e.st = ok ? 'trans' : 'nopred';
        if (!ok && was !== 'steady') e.stride = s;                 // a steady entry keeps its stride through one surprise
        e.last = a;
        if (e.st === 'steady' && e.stride !== 0) for (let d = 0; d < degree; d++) pf(Math.floor((a + e.stride * (dist + d)) / LINE));
      }
    }
    return { n, base: base.misses, misses, issued, useful, wasted: issued - useful, coverage: base.misses ? useful / base.misses : 0, accuracy: issued ? useful / issued : 0,
      trafficLines: misses + issued, baseTraffic: base.misses };
  }

  /* ── 09 coherence: the Illinois protocol (MESI, Papamarcos & Patel 1984) for one line and two cores. ── */
  function mesiStep(st, core, op) {
    const me = st[core], other = st[1 - core], next = st.slice(); let bus = null, from = null, inval = 0, wb = false;
    if (op === 'R') {
      if (me === 'I') {
        bus = 'BusRd';
        if (other === 'M') { wb = true; from = 'cache'; next[1 - core] = 'S'; next[core] = 'S'; }
        else if (other === 'E' || other === 'S') { from = 'cache'; next[1 - core] = 'S'; next[core] = 'S'; }
        else { from = 'mem'; next[core] = 'E'; }
      }
    } else if (op === 'W') {
      if (me === 'E') next[core] = 'M';
      else if (me === 'S') { bus = 'BusUpgr'; if (other !== 'I') { inval = 1; next[1 - core] = 'I'; } next[core] = 'M'; }
      else if (me === 'I') {
        bus = 'BusRdX';
        if (other === 'M') { wb = true; from = 'cache'; } else if (other !== 'I') from = 'cache'; else from = 'mem';
        if (other !== 'I') { inval = 1; next[1 - core] = 'I'; }
        next[core] = 'M';
      }
    } else if (op === 'E') { if (me === 'M') wb = true; next[core] = 'I'; }
    return { st: next, bus, from, inval, wb };
  }
  // two cores each add 1 to their own 8-byte counter N times (a load then a store), taking turns every g additions.
  // Same line: counters at offsets 0 and 8 of one 64-byte line. Padded: 64 bytes apart. TC (cycles per transfer of a
  // line between cores, or per upgrade) is TUNED.
  const FS = { N: 1000, TC: 100, gs: [1, 2, 4, 8, 16, 64, 256, 1000] };
  function falseSharing(same, g, opts) {
    opts = opts || {}; const N = opts.N || FS.N, TC = opts.TC || FS.TC;
    const lines = same ? [['I', 'I']] : [['I', 'I'], ['I', 'I']], idx = c => same ? 0 : c;
    let tx = 0, inval = 0, c2c = 0, memRd = 0, ops = 0; const done = [0, 0];
    while (done[0] < N || done[1] < N) for (const c of [0, 1]) for (let j = 0; j < g && done[c] < N; j++) {
      for (const op of ['R', 'W']) { const L = idx(c), r = mesiStep(lines[L], c, op); lines[L] = r.st; ops++; if (r.bus) tx++; inval += r.inval; if (r.from === 'cache') c2c++; if (r.from === 'mem') memRd++; }
      done[c]++;
    }
    return { tx, inval, c2c, memRd, ops, cycles: ops + tx * TC, perAdd: (ops + tx * TC) / (2 * N) };
  }

  /* ── 10 the latency staircase of a pointer chase. A random cyclic chain through W bytes, one pointer per 64-byte
     line, on Zen 5's three levels (sizes, ways and load-to-use latencies from the optimization guide; DRAM 70 ns ×
     5.7 GHz). Virtual pages map to random physical frames (seeded), so set bits above the page offset are random.
     In steady state each set sees its lines in a fixed cyclic order, and under LRU a set holding k such lines hits
     all of them if k ≤ ways and none if k > ways; each level sees only what the level above missed (non-inclusive
     fill on miss). Exact for LRU; the real L3 is neither LRU nor indexed by plain address bits. ── */
  const STAIR = { minLog: 12, maxLog: 27, step: 0.5, seed: 41 };
  function staircase(W, page, seed) {
    const n = Math.max(1, Math.round(W / LINE)), linesPerPage = page / LINE, pages = Math.ceil(n / linesPerPage), R = rng(seed || STAIR.seed);
    const frame = new Float64Array(pages); for (let p = 0; p < pages; p++) frame[p] = Math.floor(R() * 4194304);   // 16 GiB of 4 KiB frames
    const lv = [{ sets: ZEN.l1d.size / LINE / ZEN.l1d.ways, ways: ZEN.l1d.ways, lat: ZEN.l1d.lat }, { sets: ZEN.l2.size / LINE / ZEN.l2.ways, ways: ZEN.l2.ways, lat: ZEN.l2.lat },
      { sets: ZEN.l3.size / LINE / ZEN.l3.ways, ways: ZEN.l3.ways, lat: ZEN.l3.lat }];
    const phys = new Float64Array(n);
    for (let i = 0; i < n; i++) { const p = Math.floor(i / linesPerPage); phys[i] = frame[p] * linesPerPage + (i % linesPerPage); }
    let alive = new Uint32Array(n); for (let i = 0; i < n; i++) alive[i] = i;
    let cnt = alive.length; const served = [];
    for (const L of lv) {
      const count = new Uint32Array(L.sets); for (let j = 0; j < cnt; j++) count[phys[alive[j]] % L.sets]++;
      const miss = new Uint32Array(cnt); let m = 0, h = 0;
      for (let j = 0; j < cnt; j++) { const s = phys[alive[j]] % L.sets; if (count[s] <= L.ways) h++; else miss[m++] = alive[j]; }
      served.push(h); alive = miss; cnt = m;
    }
    served.push(cnt);
    const lat = [lv[0].lat, lv[1].lat, lv[2].lat, dramCycles()];
    const cyc = served.reduce((s, h, i) => s + h * lat[i], 0) / n;
    return { W, n, served: served.map(h => h / n), cycles: cyc, ns: cyc / CHIPS.r9950x.ghz };
  }
  let stairCache = {};
  function staircaseCurve(page) {
    if (stairCache[page]) return stairCache[page];
    const pts = []; for (let e = STAIR.minLog; e <= STAIR.maxLog + 1e-9; e += STAIR.step) pts.push(staircase(Math.round(Math.pow(2, e) / LINE) * LINE, page));
    return (stairCache[page] = pts);
  }

  /* ── 11 the frontier: dated facts (sources in BRIEF.md) ── */
  const FRONTIER = {
    asOf: '2026-11',
    x3d: { name: 'Ryzen 7 9800X3D', announced: '2024-10-31', stacked: 64 * MiB, l3: 96 * MiB, total: 104 * MiB, below: true },
    xeon6980p: { l3: 504 * MiB, cores: 128 }, epyc9755: { l3: 512 * MiB, cores: 128, launch: '2024-10-10' },
    mi300x: { llc: 256 * MiB, launch: '2023-12-06' },
    sram: { n2Mb: 38, n2Gain: 11, n3Gain: 6, date: '2024-12-12' },
    zen6: { l3PerCore: 4 * MiB, ccdCores: 12, ccdL3: 48 * MiB, zen6cCcdCores: 32, zen6cL3: 128 * MiB, reported: '2026-11-11' }
  };

  /* ── numbers quoted in the prose: [value, decimals, kind] ── */
  function prose() {
    const on3 = { l1: 1, l2: 1, l3: 1 }, a3 = amat(on3), a1 = amat({ l1: 1 }), aL3 = amat({ l3: 1 }), a13 = amat({ l1: 1, l3: 1 }), a12 = amat({ l1: 1, l2: 1 }), a0 = amat({});
    const a3big = amat(on3, 32), D = a3.D;
    const g1 = geometry(ZEN.l1d.size, ZEN.l1d.ways), g2 = geometry(ZEN.l2.size, ZEN.l2.ways), g3 = geometry(ZEN.l3.size, ZEN.l3.ways);
    const toyA = toyRun(TOY.bBases[0], 1), toyB = toyRun(TOY.bBases[1], 1), toy2 = toyRun(TOY.bBases[0], 2);
    const G = c3grid(), k = (w, s) => G[w + ':' + s * KiB];
    const r = p => replace('loop', 1.25, p), s = p => replace('scan', 0, p);
    const w = Object.fromEntries(WRITE.policies.map(p => [p, writes(p, 4)])), w0 = writes('wt-na', 0), w8 = writes('wt-na', 8), wbh = writes('wt-na', 4, { TW: WRITE.TW / 2 }), wbd = writes('wt-na', 4, { TW: WRITE.TW * 2 });
    const hW = 2 * HIER.l2, hi = hierarchy('incl', HIER.l3.dense, hW), he = hierarchy('excl', HIER.l3.dense, hW), hn = hierarchy('nincl', HIER.l3.dense, hW);
    const hW4 = 5 * HIER.l2, hdi = hierarchy('incl', HIER.l3.desk, hW4), hde = hierarchy('excl', HIER.l3.desk, hW4);
    const v1 = vipt(ZEN.l1d.size, ZEN.l1d.ways, 4 * KiB), vN = vipt(CHIPS.neoV3.l1d.size, CHIPS.neoV3.l1d.ways, 4 * KiB);
    const ps = prefetch('stride', 'stride', 4, 1), pl = prefetch('list', 'stride', 4, 1), pn = prefetch('stride', 'next', 4, 1), pm = prefetch('matrix', 'stride', 4, 1), pml = prefetch('mix', 'next', 4, 1), pms = prefetch('mix', 'stride', 4, 1), pm8 = prefetch('matrix', 'stride', 8, 1), pln = prefetch('list', 'next', 4, 1);
    const fs1 = falseSharing(true, 1), fp1 = falseSharing(false, 1), fs64 = falseSharing(true, 64), fsH = falseSharing(true, 1, { TC: FS.TC / 2 }), fsD = falseSharing(true, 1, { TC: FS.TC * 2 });
    const st = W => staircase(W, 4 * KiB), s24 = st(24 * KiB), s512 = st(512 * KiB), s16 = st(16 * MiB), s128 = st(128 * MiB), s1m4 = st(1 * MiB), s1mH = staircase(1 * MiB, 2 * MiB);
    const s768 = st(768 * KiB), s768H = staircase(768 * KiB, 2 * MiB);
    return {
      // ch1
      dram: [dramCycles(), 0], amat3: [a3.amat, 1], amat1: [a1.amat, 0], amatL3: [a3.amat ? aL3.amat : 0, 1], amat13: [a13.amat, 1], amat12: [a12.amat, 1], amat0: [a0.amat, 0],
      memShare: [a3.served.mem, 0, 'pct'], memPart: [a3.served.mem * a3.mem / a3.amat, 0, 'pct'], dStack: [D[0], 0], dWork: [D[1], 0], dTable: [D[2], 0], amatBig: [a3big.amat, 1],
      pStack: [PROGRAM.loops[0].p, 0, 'pct'], pWork: [PROGRAM.loops[1].p, 0, 'pct'], pTable: [PROGRAM.loops[2].p, 0, 'pct'], pStream: [PROGRAM.loops[3].p, 0, 'pct'],
      szStack: [PROGRAM.loops[0].lines * LINE / KiB, 0], szWork: [PROGRAM.loops[1].lines * LINE / KiB, 0], szTable: [PROGRAM.loops[2].lines * LINE / MiB, 0], l1Lines: [ZEN.l1d.size / LINE, 0],
      // ch2
      z1sets: [g1.sets, 0], z1idx: [g1.idxBits, 0], z1low: [g1.lowBits, 0], z2sets: [g2.sets, 0], z2idx: [g2.idxBits, 0], z3sets: [g3.sets, 0], z3idx: [g3.idxBits, 0], z3low: [g3.lowBits, 0],
      toyMissA: [toyA.misses, 0], toyMissB: [toyB.misses, 0], toyMiss2: [toy2.misses, 0], toyN: [toyA.steps.length, 0],
      // ch3
      progArr: [PROG.arr / KiB, 0], progGap: [PROG.gap / KiB, 0], progTable: [PROG.table / KiB, 0], progLook: [PROG.look, 0], progReps: [PROG.reps, 0],
      c3n: [k(1, 16).n, 0], c3comp: [k(1, 16).comp, 0], dm16: [k(1, 16).misses, 0], dm16conf: [k(1, 16).conf, 0], w2_16: [k(2, 16).misses, 0], w4_16: [k(4, 16).misses, 0], fa16: [k('fa', 16).misses, 0],
      fa8cap: [k('fa', 8).cap, 0], fa8: [k('fa', 8).misses, 0], dm64: [k(1, 64).misses, 0], dm64conf: [k(1, 64).conf, 0], w2_8conf: [k(2, 8).conf, 0],
      // ch4
      lruLoop: [r('lru').hitRate, 1, 'pct'], plruLoop: [r('plru').hitRate, 1, 'pct'], rndLoop: [r('random').hitRate, 1, 'pct'], srripLoop: [r('srrip').hitRate, 1, 'pct'], brripLoop: [r('brrip').hitRate, 1, 'pct'], optLoop: [r('opt').hitRate, 1, 'pct'],
      lruScan: [s('lru').hitRate, 1, 'pct'], srripScan: [s('srrip').hitRate, 1, 'pct'], brripScan: [s('brrip').hitRate, 1, 'pct'], optScan: [s('opt').hitRate, 1, 'pct'],
      // ch5
      wSize: [WRITE.size / KiB, 0], wWays: [WRITE.ways, 0], wTR: [WRITE.TR, 0], wTW: [WRITE.TW, 0],
      wtWrite: [w['wt-na'].writeBytes / KiB, 0], wbWrite: [w['wb-a'].writeBytes / KiB, 0], wbRead: [w['wb-a'].readBytes / KiB, 0], wtRead: [w['wt-na'].readBytes / KiB, 0], wbnaWrite: [w['wb-na'].writeBytes / KiB, 0],
      stores: [w['wt-na'].stores, 0], wtWait0: [w0.waitShare, 0, 'pct'], wtWait4: [w['wt-na'].waitShare, 0, 'pct'], wtWait8: [w8.waitShare, 0, 'pct'], wbWait4: [w['wb-a'].waitShare, 1, 'pct'],
      wtWaitH: [wbh.waitShare, 0, 'pct'], wtWaitD: [wbd.waitShare, 0, 'pct'],
      // ch6
      hWmib: [hW * HIER.scale / MiB, 0], hW4mib: [hW4 * HIER.scale / MiB, 0], hInc: [hi.hit, 0, 'pct'], hExc: [he.hit, 0, 'pct'], hNin: [hn.hit, 0, 'pct'], hBack: [hi.back * 1000, 0], hDeskI: [hdi.hit, 0, 'pct'], hDeskE: [hde.hit, 0, 'pct'],
      // ch7
      v1low: [v1.lowBits, 0], v1page: [v1.pageBits, 0], vNextra: [vN.extra, 0], vNlimit: [vN.limit / KiB, 0], apNeedW: [CHIPS.appleHost.l1d / CHIPS.appleHost.page, 0],
      // ch8
      pfSize: [PF.size / KiB, 0], pfWays: [PF.ways, 0],
      pfStrideCov: [ps.coverage, 0, 'pct'], pfStrideAcc: [ps.accuracy, 0, 'pct'], pfListIss: [pl.issued, 0], pfNextCov: [pn.coverage, 0, 'pct'], pfNextAcc: [pn.accuracy, 0, 'pct'],
      pfMatCov: [pm.coverage, 0, 'pct'], pfMixNextAcc: [pml.accuracy, 0, 'pct'], pfMixStrideAcc: [pms.accuracy, 0, 'pct'], pfMixNextCov: [pml.coverage, 0, 'pct'], pfMixStrideCov: [pms.coverage, 0, 'pct'], pfMat8Cov: [pm8.coverage, 0, 'pct'], pfListNextAcc: [pln.accuracy, 0, 'pct'], pfListNextCov: [pln.coverage, 0, 'pct'],
      // ch9
      fsTx: [fs1.tx, 0], fpTx: [fp1.tx, 0], fsPer: [fs1.perAdd, 1], fpPer: [fp1.perAdd, 2], fs64Tx: [fs64.tx, 0], fsN: [FS.N, 0], fsPerH: [fsH.perAdd, 0], fsPerD: [fsD.perAdd, 0], fsTC: [FS.TC, 0],
      // ch10
      // real-chip figures and dated frontier facts quoted in the prose (sources in CHIPS / FRONTIER and BRIEF.md)
      zL1: [ZEN.l1d.size / KiB, 0], zL1w: [ZEN.l1d.ways, 0], zL1lat: [ZEN.l1d.lat, 0], zL1max: [ZEN.l1d.latMax, 0], zL1i: [ZEN.l1i.size / KiB, 0], zL1iw: [ZEN.l1i.ways, 0],
      zL2: [ZEN.l2.size / MiB, 0], zL2w: [ZEN.l2.ways, 0], zL2lat: [ZEN.l2.lat, 0], zL3: [ZEN.l3.size / MiB, 0], zL3w: [ZEN.l3.ways, 0], zL3lat: [ZEN.l3.lat, 0], zL3n: [ZEN.l3.perCcx, 0], zL3max: [ZEN.l3.maxSoc / MiB, 0],
      ghz: [CHIPS.r9950x.ghz, 1], r9L3: [CHIPS.r9950x.l3 / MiB, 0], dramNs: [CHIPS.dramNs, 0], sxL3: [CHIPS.strix.zen5L3 / MiB, 0], sxN: [CHIPS.strix.zen5, 0], sxcL3: [CHIPS.strix.zen5cL3 / MiB, 0], sxcN: [CHIPS.strix.zen5c, 0],
      lcL0: [CHIPS.lionCove.l0.size / KiB, 0], lcL0lat: [CHIPS.lionCove.l0.lat, 0], lcL1: [CHIPS.lionCove.l1.size / KiB, 0], lcL1lat: [CHIPS.lionCove.l1.lat, 0],
      lcL2: [CHIPS.lionCove.l2.size / MiB, 1], lcL2b: [CHIPS.lionCove.l2.sizeAlt / MiB, 0], lcL2lat: [CHIPS.lionCove.l2.lat, 0], rcL1: [CHIPS.lionCove.prev.l1.size / KiB, 0], rcL1lat: [CHIPS.lionCove.prev.l1.lat, 0], rcL2: [CHIPS.lionCove.prev.l2.size / MiB, 0],
      llL3: [CHIPS.lunarLake.l3 / MiB, 0], llL3lat: [CHIPS.lunarLake.l3lat, 0], llDram: [CHIPS.lunarLake.dramNs, 0], skyL2: [CHIPS.lunarLake.skymontL2 / MiB, 0], llMsc: [CHIPS.lunarLake.msc / MiB, 0],
      v3L1: [CHIPS.neoV3.l1d.size / KiB, 0], v3L1w: [CHIPS.neoV3.l1d.ways, 0], v3lat: [CHIPS.neoV3.l1d.lat, 0], v3L2: [CHIPS.neoV3.l2.size / MiB, 0], v3L2w: [CHIPS.neoV3.l2.ways, 0], v3L2b: [CHIPS.neoV3.l2alt.size / MiB, 0], v3L2bw: [CHIPS.neoV3.l2alt.ways, 0],
      apL1: [CHIPS.appleHost.l1d / KiB, 0], apL1i: [CHIPS.appleHost.l1i / KiB, 0], apL2: [CHIPS.appleHost.l2 / MiB, 0], apShare: [CHIPS.appleHost.l2share, 0], apPage: [CHIPS.appleHost.page / KiB, 0], apLine: [CHIPS.appleHost.line, 0],
      x3dStack: [FRONTIER.x3d.stacked / MiB, 0], x3dL3: [FRONTIER.x3d.l3 / MiB, 0], x3dTotal: [FRONTIER.x3d.total / MiB, 0], xeonL3: [FRONTIER.xeon6980p.l3 / MiB, 0], epycL3: [FRONTIER.epyc9755.l3 / MiB, 0], epycN: [FRONTIER.epyc9755.cores, 0],
      miLlc: [FRONTIER.mi300x.llc / MiB, 0], n2Mb: [FRONTIER.sram.n2Mb, 0], n2Gain: [FRONTIER.sram.n2Gain, 0], n3Gain: [FRONTIER.sram.n3Gain, 0],
      z6core: [FRONTIER.zen6.l3PerCore / MiB, 0], z6n: [FRONTIER.zen6.ccdCores, 0], z6L3: [FRONTIER.zen6.ccdL3 / MiB, 0], z6cN: [FRONTIER.zen6.zen6cCcdCores, 0], z6cL3: [FRONTIER.zen6.zen6cL3 / MiB, 0],
      s24: [s24.cycles, 0], s512: [s512.cycles, 0], s16: [s16.cycles, 0], s128: [s128.cycles, 0], s128ns: [s128.ns, 0], s1m4: [s1m4.cycles, 0], s1mH: [s1mH.cycles, 0], s768: [s768.cycles, 0], s768H: [s768H.cycles, 0]
    };
  }

  /* ── formatting ── */
  function fmt(x, d, lang) {
    if (x == null || !isFinite(x)) return '—';
    const s = (d == null ? (Math.abs(x) >= 100 ? 0 : Math.abs(x) >= 10 ? 1 : 2) : d);
    return Number(x).toLocaleString(lang === 'en' ? 'en-US' : 'zh-CN', { minimumFractionDigits: s, maximumFractionDigits: s });
  }

  /* ── live sentences: each returns { key, v } ── */
  const say = {
    amat(on, tableMiB) {
      const a = amat(on, tableMiB), n = ['l1', 'l2', 'l3'].filter(k => on[k]).length, best = amat({ l1: 1, l2: 1, l3: 1 }, tableMiB).amat;
      const v = { amat: a.amat, mem: a.served.mem, best, n };
      if (n === 0) return { key: 'ch1.say.none', v };
      if (n === 3) return { key: a.served.mem > 0.031 ? 'ch1.say.threeSpill' : 'ch1.say.three', v };
      if (!on.l1) return { key: 'ch1.say.nol1', v };
      return { key: 'ch1.say.partial', v };
    },
    toy(step) { return { key: step.hit ? 'ch2.say.hit' : (step.evicted != null ? 'ch2.say.evict' : 'ch2.say.cold'), v: step }; },
    threeC(ways, size) {
      const r = c3grid()[ways + ':' + size], v = r;
      if (r.conf === 0 && r.cap === 0) return { key: 'ch3.say.comp', v };
      if (r.conf >= r.cap) return { key: 'ch3.say.conf', v };
      return { key: 'ch3.say.cap', v };
    },
    repl(kind, frac) {
      const h = Object.fromEntries(REPL.policies.map(p => [p, replace(kind, frac, p).hitRate]));
      if (kind === 'loop' && frac <= 1) return { key: 'ch4.say.fits', v: h };
      if (kind === 'loop') return { key: h.lru < 0.05 ? 'ch4.say.thrash' : 'ch4.say.loopmid', v: h };
      if (kind === 'scan') return { key: 'ch4.say.scan', v: h };
      return { key: 'ch4.say.prog', v: h };
    },
    writes(policy, depth) {
      const r = writes(policy, depth);
      if (policy.startsWith('wb')) return { key: 'ch5.say.wb', v: r };
      return { key: r.waitShare > 0.2 ? 'ch5.say.wtfull' : 'ch5.say.wt', v: r };
    },
    hier(kind, l3k, mul) {
      const W = mul * HIER.l2, r = hierarchy(kind, HIER.l3[l3k], W), cap = capacityOf(kind, HIER.l3[l3k]);
      const v = Object.assign({ W, cap }, r);
      if (kind === 'incl') return { key: 'ch6.say.incl', v };
      if (kind === 'excl') return { key: 'ch6.say.excl', v };
      return { key: 'ch6.say.nincl', v };
    },
    vipt(size, ways, page) { const r = vipt(size, ways, page); return { key: !r.pow2 ? 'ch7.say.odd' : r.fits ? 'ch7.say.fits' : 'ch7.say.alias', v: r }; },
    prefetch(kind, mode, dist, degree) {
      const r = prefetch(kind, mode, dist, degree);
      if (mode === 'none') return { key: 'ch8.say.none', v: r };
      if (r.issued === 0) return { key: 'ch8.say.silent', v: r };
      if (r.accuracy < 0.5) return { key: 'ch8.say.waste', v: r };
      return { key: 'ch8.say.good', v: r };
    },
    mesi(r) { if (r.bus == null) return { key: 'ch9.say.quiet', v: r }; if (r.bus === 'BusUpgr') return { key: 'ch9.say.upgr', v: r }; return { key: r.inval ? 'ch9.say.inval' : 'ch9.say.bus', v: r }; },
    fs(same, g) { const r = falseSharing(same, g); return { key: same ? (g >= FS.N ? 'ch9.say.fsonce' : 'ch9.say.fs') : 'ch9.say.pad', v: r }; },
    stair(W, page) {
      const r = staircase(W, page), top = r.served.indexOf(Math.max(...r.served));
      return { key: Math.max(...r.served) > 0.97 ? 'ch10.say.level' : 'ch10.say.edge', v: Object.assign({ top }, r) };
    }
  };

  return { KiB, MiB, LINE, CHIPS, ZEN, dramCycles, rng, geometry, split, parseHex, makeCache, run, runOpt, threeC, faLru, fromList, POLICIES,
    TOY, toyTrace, toyRun, PROG, progTrace, C3, c3grid, REPL, replTrace, replace, loopTrace, scanTrace, WRITE, writeTrace, writes,
    PROGRAM, program, reuse, LEVELS, amat, programTrace, HIER, hierarchy, capacityOf, vipt, PF, pfTrace, prefetch, mesiStep, FS, falseSharing,
    STAIR, staircase, staircaseCurve, FRONTIER, prose, fmt, say, clamp };
});
