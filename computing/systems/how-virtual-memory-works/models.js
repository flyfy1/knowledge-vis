/* How virtual memory works: the page's models. Every model is either a real mechanism simulated at small scale on a
   seeded trace (a first-fit allocator, x86-64 4- and 5-level page tables walked bit by bit, fully associative LRU
   TLBs, a page-walk cache, FIFO / LRU / Clock / Belady-OPT page replacement, copy-on-write accounting, tagged vs
   flushed TLBs across context switches) or a named closed form (flat page-table size, the effective-access-time
   formula, Bhargava et al.'s nm + n + m references for a two-dimensional walk). Real figures sit in FACTS / FRONTIER
   with their source and the date it was opened (also listed in BRIEF.md). Constants chosen for the model rather
   than taken from a source are marked TUNED here and on the page.
   UMD: window.VMModels in the browser, module.exports in node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.VMModels = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const KiB = 1024, MiB = 1048576, GiB = 1073741824, TiB = 1099511627776, PiB = 1125899906842624;
  const log2 = x => Math.round(Math.log2(x));
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

  // mulberry32: a small seeded generator, so every trace and every random choice repeats exactly
  function rng(seed) {
    let a = seed >>> 0;
    return function () { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }

  /* ── Real figures (sources in BRIEF.md, opened 2026-11-15) ── */
  const FACTS = {
    // Intel SDM Vol. 3A, order 253668-093US (September 2026), ch. 5 "Paging": §5.5 (4-level: 48-bit linear → 52-bit
    // physical, 256 TBytes; 5-level: 57-bit linear), Table 5-20 (PTE that maps a 4-KByte page), §5.10.1 (PCID 12 bits).
    sdm: { va4: 48, va5: 57, pa: 52, entries: 512, entryBytes: 8, pcidBits: 12, cr3MoveCycles: 100,
      // Table 5-20 bit positions
      pte: { P: 0, RW: 1, US: 2, PWT: 3, PCD: 4, A: 5, D: 6, PAT: 7, G: 8, R: 11, pfnLo: 12, pfnHi: 51, pkLo: 59, pkHi: 62, XD: 63 } },
    // Linux docs, x86_64/5level-paging: 4-level 256 TiB virtual / 64 TiB physical; 5-level 128 PiB / 4 PiB
    linux5: { va4: 256 * TiB, pa4: 64 * TiB, va5: 128 * PiB, pa5: 4 * PiB, unconditional: '2025-05-17' },
    // AMD, Software Optimization Guide for the AMD Zen5 Microarchitecture, 58455 rev 1.00 (August 2024), §2.6–2.7
    zen5: { l1dtlb: 96, l2dtlb: 4096, l2dtlbWays: 16, l2dtlb1g: 1024, l1itlb: 64, l2itlb: 2048, walkers: 6, pdc: 64,
      l1: { size: 48 * KiB, lat: 4 }, l2: { size: 1 * MiB, lat: 14 }, l3: { size: 32 * MiB, lat: 46 } },
    // DRAM ≈ 70 ns (Chips and Cheese, Ryzen 9 9950X, 2024-08-14) at 5.7 GHz (AMD product page) — the sibling A2 essay's figures
    dramNs: 70, ghz: 5.7,
    // page-fault service times
    // minor: measured on the machine this page was written on (Apple M6, macOS 27.2.1, 16 KiB pages), 2026-11-15:
    // first write to each page of a fresh 1 GiB anonymous mapping 0.53 µs/page (runs 0.50–0.63; the very first run 2.5),
    // second write to the same pages 0.11 µs/page
    minorUs: 0.53, minorUsHi: 2.5, touchUs: 0.11, hostPage: 16 * KiB, host: 'Apple M6', read: '2026-11-15',
    // major from flash: Samsung 990 PRO 1 TB data sheet rev 1.0, QD1 4 KB random read 22K IOPS → 1/22000 s
    nvmeIops: 22000,
    // major from a disk: Seagate Barracuda 7200.12 product manual (2009): average read seek 8.5 ms + average latency 4.16 ms
    hddSeekMs: 8.5, hddRotMs: 4.16,
    // Arm: Linux arm64 docs (4 KiB: 39 or 48 bits with 3 or 4 levels; 64 KiB: 42 bits with 2 levels, 52 with LVA);
    // arch/arm64/Kconfig: ARM64_VA_BITS_47 depends on 16 KiB pages
    arm: { k4: [39, 48], k16: 47, k64: [42, 52] },
    // Linux PTI doc: CR3 moves "on the order of a hundred cycles", at every kernel entry and exit
    kpti: { cr3Cycles: 100 }
  };
  const dramCycles = () => FACTS.dramNs * FACTS.ghz;                // ≈ 399

  /* ── 01 contiguous (base and bound) vs paged allocation: first-fit on a seeded arrival/exit sequence ──
     RAM is 256 units of 1 MiB. One process arrives per step with size uniform in [0.5, 1.5] × mean (≥ 1 MiB) and a
     lifetime uniform in 10–60 steps (TUNED). Base and bound needs one contiguous hole (first fit, OSTEP ch. 16–17);
     paging needs only enough free frames anywhere. A process that does not fit is turned away. */
  const FRAG = { ram: 256, steps: 300, seed: 7, lifeMin: 10, lifeMax: 60, means: [2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 16] };
  function frag(mean, opts) {
    opts = opts || {}; const R = rng(opts.seed || FRAG.seed), N = FRAG.ram, steps = opts.steps || FRAG.steps;
    const bb = new Int16Array(N).fill(-1), pg = new Int16Array(N).fill(-1);
    const liveB = new Map(), liveP = new Map(); // id → {end, base, size} / {end, frames}
    let failB = 0, failP = 0, arrivals = 0; const hist = [];
    const holes = () => { let best = 0, cur = 0, free = 0; for (let i = 0; i < N; i++) { if (bb[i] < 0) { cur++; free++; best = Math.max(best, cur); } else cur = 0; } return { free, largest: best }; };
    for (let t = 0; t < steps; t++) {
      for (const [id, p] of liveB) if (p.end <= t) { for (let i = p.base; i < p.base + p.size; i++) bb[i] = -1; liveB.delete(id); }
      for (const [id, p] of liveP) if (p.end <= t) { for (const f of p.frames) pg[f] = -1; liveP.delete(id); }
      const size = Math.max(1, Math.round(mean * (0.5 + R()))), life = FRAG.lifeMin + Math.floor(R() * (FRAG.lifeMax - FRAG.lifeMin + 1)), id = t;
      arrivals++;
      // first fit
      let base = -1; for (let i = 0, run = 0; i < N; i++) { run = bb[i] < 0 ? run + 1 : 0; if (run === size) { base = i - size + 1; break; } }
      if (base >= 0) { for (let i = base; i < base + size; i++) bb[i] = id; liveB.set(id, { end: t + life, base, size }); } else failB++;
      let freeP = 0; for (let i = 0; i < N; i++) if (pg[i] < 0) freeP++;
      if (freeP >= size) { const fr = []; for (let i = 0; i < N && fr.length < size; i++) if (pg[i] < 0) { pg[i] = id; fr.push(i); } liveP.set(id, { end: t + life, frames: fr }); } else failP++;
      const h = holes();
      hist.push({ t, failB, failP, free: h.free, largest: h.largest, freeP: N - [...pg].filter(x => x >= 0).length, size, bb: opts.keep ? Int16Array.from(bb) : null, pg: opts.keep ? Int16Array.from(pg) : null });
    }
    const last = hist[hist.length - 1];
    return { mean, arrivals, failB, failP, hist, free: last.free, largest: last.largest };
  }

  /* ── 02 the flat table and the multi-level tree ──
     Flat: one 8-byte entry per virtual page, 2^(VA − offset) × 8 bytes. Tree: each table is one page of 8-byte entries,
     so it resolves (offset − 3) bits; levels = ceil((VA − offset) / (offset − 3)). Tables actually needed for a sparse
     process = the distinct table pages that cover its mapped regions, counted level by level. */
  function flatBytes(vaBits, page) { return Math.pow(2, vaBits - log2(page)) * 8; }
  function levels(vaBits, page) { const o = log2(page); return Math.ceil((vaBits - o) / (o - 3)); }
  // a small process: code, heap (size set by the reader), shared libraries, stack. Offsets are fractions of the user
  // half of the address space so the layout works for any width (TUNED, typical of Linux's layout).
  const LAYOUT = { code: 4 * MiB, libs: 32 * MiB, stack: 8 * MiB, heaps: [1, 4, 16, 64, 256, 1024, 4096, 16384, 65536].map(x => x * MiB), heapDefault: 64 * MiB };
  function regions(vaBits, heap) {
    const top = Math.pow(2, vaBits - 1);               // user half
    return [[0x400000, LAYOUT.code], [0x400000 + 16 * MiB, heap], [top * 0.75, LAYOUT.libs], [top - LAYOUT.stack - 64 * KiB, LAYOUT.stack]];
  }
  function treeTables(vaBits, page, heap) {
    const o = log2(page), b = o - 3, L = levels(vaBits, page), per = [];
    const regs = regions(vaBits, heap);
    for (let lv = 1; lv <= L; lv++) {           // lv 1 = leaf tables (each covers 2^(o+b) bytes), lv L = root
      const span = Math.pow(2, o + b * lv), set = new Set();
      for (const [s, len] of regs) { const a = Math.floor(s / span), z = Math.floor((s + len - 1) / span); for (let k = a; k <= z; k++) set.add(k); }
      per.push(lv === L ? 1 : set.size);
    }
    const tables = per.reduce((s, x) => s + x, 0);
    const mapped = regs.reduce((s, r) => s + r[1], 0);
    return { levels: L, perLevel: per, tables, bytes: tables * page, mapped, flat: flatBytes(vaBits, page), bits: b };
  }

  /* ── 03 an x86-64 page-table walk (Intel SDM Vol. 3A §5.5, Table 5-20) on a toy physical memory ──
     A toy process is mapped into seeded page tables; physical frames are drawn at random from a 16 GiB space.
     Addresses are BigInt so 57-bit addresses stay exact. */
  const B = BigInt;
  const BIT = n => 1n << B(n);
  const PTE = FACTS.sdm.pte;
  const TOY = {
    seed: 11,
    regions: [
      { id: 'code', va: 0x555555554000n, pages: 4, rw: 0, xd: 0, us: 1, dirty: 0 },
      { id: 'heap', va: 0x555555560000n, pages: 64, rw: 1, xd: 1, us: 1, dirty: 1, absent: [0x555555560000n + 0x5000n] },
      { id: 'huge', va: 0x7f0000000000n, huge: true, rw: 1, xd: 1, us: 1, dirty: 1 },
      { id: 'stack', va: 0x7ffd3a5c0000n, pages: 16, rw: 1, xd: 1, us: 1, dirty: 1 },
      { id: 'kern', va: 0xffff888000000000n, pages: 1, rw: 1, xd: 1, us: 0, dirty: 1 }
    ],
    presets: { heap: '0x555555561a38', code: '0x555555554120', huge: '0x7f00001234a8', absent: '0x555555565010', kern: '0xffff888000000040', hole: '0x600000000000', noncanon: '0x0000900000000000' }
  };
  function buildToy(lv5) {
    const R = rng(TOY.seed + (lv5 ? 1 : 0)), used = new Set();
    const frame = () => { let f; do { f = 256 + Math.floor(R() * (4194304 - 256)); } while (used.has(f)); used.add(f); return B(f); };   // 16 GiB of 4 KiB frames
    const tables = new Map();       // frame (BigInt) → Map(index → entry BigInt)
    const newTable = () => { const f = frame(); tables.set(f, new Map()); return f; };
    const root = newTable();
    const dirFlags = BIT(PTE.P) | BIT(PTE.RW) | BIT(PTE.US) | BIT(PTE.A);
    const L = lv5 ? 5 : 4, shifts = lv5 ? [48, 39, 30, 21, 12] : [39, 30, 21, 12];
    function map(va, leafLevel, flags, pfn) {         // leafLevel: index into shifts of the level holding the leaf
      let t = root;
      for (let i = 0; i < leafLevel; i++) {
        const idx = (va >> B(shifts[i])) & 511n, tb = tables.get(t);
        if (!tb.has(idx)) { const nt = newTable(); tb.set(idx, (nt << 12n) | dirFlags | (va >= 0xffff800000000000n ? 0n : 0n)); }
        // supervisor-only kernel branch: clear U/S on the directory entries that lead to it
        if (va >= 0xffff800000000000n) tb.set(idx, tb.get(idx) & ~BIT(PTE.US));
        t = tb.get(idx) >> 12n & ((1n << 40n) - 1n);
      }
      const idx = (va >> B(shifts[leafLevel])) & 511n;
      tables.get(t).set(idx, (pfn << 12n) | flags);
    }
    for (const r of TOY.regions) {
      const fl = BIT(PTE.P) | (r.rw ? BIT(PTE.RW) : 0n) | (r.us ? BIT(PTE.US) : 0n) | BIT(PTE.A) | (r.dirty ? BIT(PTE.D) : 0n) | (r.xd ? BIT(PTE.XD) : 0n);
      if (r.huge) { let f; do { f = Math.floor(R() * 8192) * 512; } while (used.has(f)); for (let k = 0; k < 512; k++) used.add(f + k); map(r.va, L - 2, fl | BIT(7), B(f)); continue; }   // PS = bit 7 in a PDE
      for (let k = 0; k < r.pages; k++) {
        const va = r.va + B(k) * 4096n, absent = (r.absent || []).includes(va);
        map(va, L - 1, absent ? (BIT(PTE.RW) | BIT(PTE.US) | BIT(PTE.XD)) & ~BIT(PTE.P) : fl, absent ? 0x1d2n : frame());   // absent: P = 0; the OS may keep a swap slot in the other bits
      }
    }
    return { root, tables, L, shifts };
  }
  const TOYS = {};
  const toy = lv5 => TOYS[lv5 ? 5 : 4] || (TOYS[lv5 ? 5 : 4] = buildToy(lv5));
  function parseVA(s) {
    s = String(s || '').trim().replace(/[_\s]/g, '').toLowerCase();
    if (s.startsWith('0x')) s = s.slice(2);
    if (!/^[0-9a-f]{1,16}$/.test(s)) return null;
    return BigInt('0x' + s);
  }
  const LEVEL_NAMES = { 4: ['PML4', 'PDPT', 'PD', 'PT'], 5: ['PML5', 'PML4', 'PDPT', 'PD', 'PT'] };
  function canonical(va, bits) { const top = va >> B(bits - 1); return top === 0n || top === (1n << B(65 - bits)) - 1n; }
  // access: 'r' | 'w' | 'x', from user mode
  function walk(va, lv5, access) {
    const T = toy(lv5), bits = lv5 ? 57 : 48, names = LEVEL_NAMES[T.L], steps = [];
    if (!canonical(va, bits)) return { va, bits, canonical: false, steps, fault: 'noncanon' };
    let base = T.root;
    for (let i = 0; i < T.L; i++) {
      const sh = T.shifts[i], idx = (va >> B(sh)) & 511n, addr = (base << 12n) | (idx << 3n);
      const tb = T.tables.get(base), e = tb && tb.has(idx) ? tb.get(idx) : 0n;
      const ps = i === T.L - 2 && (e & BIT(7)) !== 0n, leaf = i === T.L - 1 || ps;
      const st = { level: names[i], hi: sh + 8, lo: sh, idx: Number(idx), addr, entry: e, base, leaf, ps, flags: decode(e) };
      steps.push(st);
      if (!(e & BIT(PTE.P))) return { va, bits, canonical: true, steps, fault: 'notpresent', faultLevel: i };
      if (!(e & BIT(PTE.US))) return { va, bits, canonical: true, steps, fault: 'super', faultLevel: i };
      if (leaf) {
        const offBits = ps ? 21 : 12, pfnMask = ((1n << 40n) - 1n) << 12n;
        const pa = ((e & pfnMask) & ~((1n << B(offBits)) - 1n)) | (va & ((1n << B(offBits)) - 1n));
        if (access === 'w' && !(e & BIT(PTE.RW))) return { va, bits, canonical: true, steps, fault: 'ro', pa };
        if (access === 'x' && (e & BIT(PTE.XD))) return { va, bits, canonical: true, steps, fault: 'xd', pa };
        return { va, bits, canonical: true, steps, pa, pageBytes: ps ? 2 * MiB : 4 * KiB, offBits };
      }
      base = (e >> 12n) & ((1n << 40n) - 1n);
    }
    return null;
  }
  function decode(e) {
    const b = n => Number((e >> B(n)) & 1n);
    return { P: b(PTE.P), RW: b(PTE.RW), US: b(PTE.US), PWT: b(PTE.PWT), PCD: b(PTE.PCD), A: b(PTE.A), D: b(PTE.D), PS: b(7), G: b(PTE.G), XD: b(PTE.XD), pfn: (e >> 12n) & ((1n << 40n) - 1n) };
  }
  // split a virtual address into its index fields (for the readout and the split diagram)
  function fields(va, lv5) { const sh = lv5 ? [48, 39, 30, 21, 12] : [39, 30, 21, 12]; return { idx: sh.map(s => Number((va >> B(s)) & 511n)), off: Number(va & 4095n) }; }

  /* ── 04 a fully associative LRU TLB on seeded traces ──
     'rand': uniform random 8-byte reads over an array of W bytes (40,000 measured after a 10,000-access warm-up).
     'seq' : sweeps through the array, 8-byte elements in order. 'col': walks a matrix column whose rows are 4 KiB,
     one access per row. For the two sweeps the page sequence is cyclic, and LRU on a cyclic sequence of Np pages
     either hits every page (Np ≤ entries) or misses every page (Np > entries): that is computed exactly. */
  const TLB = { warm: 10000, n: 40000, seed: 3, entries: [16, 32, 64, 96, 128, 256, 512, 1024, 1536, 2048, 4096], pages: [4 * KiB, 16 * KiB, 2 * MiB],
    sizes: [256 * KiB, 1 * MiB, 4 * MiB, 16 * MiB, 64 * MiB, 256 * MiB, 1 * GiB, 4 * GiB, 16 * GiB] };
  function lru(cap) {
    const m = new Map();
    return {
      has(k) { if (!m.has(k)) return false; m.delete(k); m.set(k, 1); return true; },
      put(k) { if (m.has(k)) m.delete(k); else if (m.size >= cap) m.delete(m.keys().next().value); m.set(k, 1); },
      del(k) { m.delete(k); }, clear() { m.clear(); }, get size() { return m.size; }, keys() { return m.keys(); }
    };
  }
  function tlbRun(trace, W, entries, page, seed) {
    const Np = Math.max(1, Math.ceil(W / page));
    if (trace !== 'rand') {
      const perPage = trace === 'seq' ? page / 8 : Math.max(1, page / 4096);   // accesses that fall in one page per sweep
      const missPerSweep = Np > entries ? Np : 0;
      return { Np, reach: entries * page, missRate: missPerSweep / (Np * perPage), perPage, exact: true };
    }
    const R = rng(seed || TLB.seed), t = lru(entries); let miss = 0;
    for (let i = 0; i < TLB.warm + TLB.n; i++) {
      const p = Math.floor(R() * W / 8) * 8 / page | 0;
      const h = t.has(p); if (!h) t.put(p);
      if (i >= TLB.warm && !h) miss++;
    }
    return { Np, reach: entries * page, missRate: miss / TLB.n, closed: Math.max(0, 1 - entries / Np) };
  }
  const memoT = new Map();
  function tlb(trace, W, entries, page) { const k = [trace, W, entries, page].join(); if (!memoT.has(k)) memoT.set(k, tlbRun(trace, W, entries, page)); return memoT.get(k); }

  /* ── 05 the cost of a miss: Zen 5's two DTLB levels + a page-walk cache, on the random trace ──
     L1 DTLB 96 entries, L2 DTLB 4,096 (treated as fully associative LRU; the real one is 16-way). On an L2 miss the
     walk needs one memory reference per level, minus the levels a page-walk cache skips: a hit on the PDE skips three
     (only the PTE is read), on the PDPTE two, on the top-level entry one (AMD 58455 §2.7.3). The PDE and PDPTE caches'
     sizes are not published: 32 entries each here (TUNED); the top-level cache has the documented 64 entries. Each
     reference costs what a load costs at the cache level where the entry is found; the model does not simulate where
     that is, it brackets it: every entry in L2 (14 cycles) or every entry from DRAM (≈ 399 cycles). */
  const WALK = { pde: 32, pdpte: 32, top: 64, seed: 5, warm: 20000, n: 40000, sizes: [16 * MiB, 64 * MiB, 256 * MiB, 1 * GiB, 4 * GiB, 16 * GiB, 64 * GiB] };
  function walkCost(W, page, pwc, lv5, opts) {
    opts = opts || {};
    const R = rng(opts.seed || WALK.seed), l1 = lru(FACTS.zen5.l1dtlb), l2 = lru(opts.l2 || FACTS.zen5.l2dtlb), top = lru(WALK.top), pdpte = lru(WALK.pdpte), pde = lru(WALK.pde);
    const huge = page >= 2 * MiB, giga = page >= GiB;
    const L = (lv5 ? 5 : 4) - (giga ? 2 : huge ? 1 : 0);  // levels walked for this page size
    let walks = 0, refs = 0, n = 0;
    const N = opts.n || WALK.n;
    for (let i = 0; i < WALK.warm + N; i++) {
      const a = Math.floor(R() * W / 8) * 8, vpn = Math.floor(a / page), meas = i >= WALK.warm;
      if (l1.has(vpn)) continue;
      if (l2.has(vpn)) { l1.put(vpn); continue; }
      l1.put(vpn); l2.put(vpn);
      // which entries the walk needs, keyed by the address region each one covers
      const k1g = Math.floor(a / GiB), k2m = Math.floor(a / (2 * MiB)), k512g = Math.floor(a / (512 * GiB));
      let r;
      if (!pwc) r = L;
      else if (!huge && pde.has(k2m)) r = 1;
      else if (!giga && pdpte.has(k1g)) r = L - (lv5 ? 3 : 2);
      else if (top.has(k512g)) r = L - (lv5 ? 2 : 1);
      else r = L;
      if (pwc) { top.put(k512g); if (!giga) pdpte.put(k1g); if (!huge) pde.put(k2m); }
      if (meas) { walks++; refs += r; }
    }
    const missRate = walks / N, perWalk = walks ? refs / walks : 0;
    const z = FACTS.zen5, best = z.l1.lat + missRate * perWalk * z.l2.lat, worst = z.l1.lat + missRate * perWalk * dramCycles();
    return { W, page, pwc, levels: L, missRate, perWalk, refsPerAccess: missRate * perWalk, best, worst, reach: z.l2dtlb * page };
  }
  const memoW = new Map();
  function walkC(W, page, pwc, lv5) { const k = [W, page, pwc ? 1 : 0, lv5 ? 1 : 0].join(); if (!memoW.has(k)) memoW.set(k, walkCost(W, page, pwc, lv5)); return memoW.get(k); }

  /* ── 06 huge pages: the same TLB + walk model with 4 KiB, 2 MiB and 1 GiB pages, and what a sparse program pays ──
     Dense: the program touches the whole array. Sparse: it touches one 4 KiB piece in every 64 KiB (TUNED pattern);
     memory allocated = touched pages rounded up to the page size (internal fragmentation). Zen 5 holds 1 GiB pages in
     the 96-entry L1 DTLB and a separate 1,024-entry L2 (58455 §2.7.2), so the 1 GiB case uses 1,024 L2 entries. */
  const HUGE = { sparseEvery: 64 * KiB, sizes: [64 * MiB, 256 * MiB, 1 * GiB, 4 * GiB, 16 * GiB, 64 * GiB], pages: [4 * KiB, 2 * MiB, 1 * GiB] };
  function hugeRun(W, page, sparse) {
    const r = page >= GiB ? walkCost(W, page, true, false, { l2: FACTS.zen5.l2dtlb1g }) : walkC(W, page, true, false);
    const touched = sparse ? W / HUGE.sparseEvery * 4 * KiB : W;
    const pieces = sparse ? W / HUGE.sparseEvery : W / (4 * KiB);
    // pages that hold at least one touched 4 KiB piece
    const pagesHit = sparse ? (page <= 4 * KiB ? pieces : Math.ceil(W / page)) : Math.ceil(W / page);
    const alloc = pagesHit * page;
    return Object.assign({}, r, { touched, alloc, bloat: alloc / touched, reach: (page >= GiB ? FACTS.zen5.l2dtlb1g : FACTS.zen5.l2dtlb) * page });
  }
  const memoH = new Map();
  function huge(W, page, sparse) { const k = [W, page, sparse ? 1 : 0].join(); if (!memoH.has(k)) memoH.set(k, hugeRun(W, page, sparse)); return memoH.get(k); }

  /* ── 07 page faults: effective access time = (1 − p) · t_mem + p · t_fault (Silberschatz et al.; OSTEP ch. 21) ── */
  const FAULT = { kinds: ['minor', 'nvme', 'hdd'], pLog: [-8, -2] };
  function faultUs(kind) { return kind === 'minor' ? FACTS.minorUs : kind === 'nvme' ? 1e6 / FACTS.nvmeIops : (FACTS.hddSeekMs + FACTS.hddRotMs) * 1000; }
  function eat(p, kind) {
    const tm = FACTS.dramNs / 1000, tf = faultUs(kind), t = (1 - p) * tm + p * tf;
    return { p, tf, tm, eat: t, slow: t / tm, p10: 0.1 * tm / (tf - tm), p2: tm / (tf - tm) };
  }

  /* ── 08 page replacement: FIFO, LRU, Clock (second chance) and Belady's OPT on a reference string ── */
  const REF = {
    belady: [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5],                     // Belady, Nelson & Shedler (1969); OSTEP ch. 22
    loop: [1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5],
    local: null, maxFrames: 8
  };
  // a locality string: three phases, each drawing mostly from its own 4 pages (TUNED, seeded)
  REF.local = (() => { const R = rng(19), out = []; const sets = [[1, 2, 3, 4], [3, 4, 5, 6], [7, 8, 1, 2]]; for (const s of sets) for (let i = 0; i < 12; i++) out.push(R() < 0.85 ? s[Math.floor(R() * 4)] : 1 + Math.floor(R() * 9)); return out; })();
  let lastUse = new Map();   // time of each page's latest use before the current reference (LRU)
  function run(strName, frames, policy) {
    const str = REF[strName];
    lastUse = new Map();
    const mem = [], trail = []; let faults = 0, hand = 0; const ref = new Map();
    str.forEach((p, i) => {
      if (mem.includes(p)) { ref.set(p, 1); lastUse.set(p, i); trail.push({ p, hit: true }); return; }
      faults++; let victim = null;
      if (mem.length < frames) { mem.push(p); ref.set(p, 1); }
      else {
        let j = 0;
        if (policy === 'fifo') { j = hand; hand = (hand + 1) % frames; }
        else if (policy === 'lru') { let best = Infinity; mem.forEach((q, k) => { const t = lastUse.get(q); if (t < best) { best = t; j = k; } }); }
        else if (policy === 'clock') { while (ref.get(mem[hand])) { ref.set(mem[hand], 0); hand = (hand + 1) % frames; } j = hand; hand = (hand + 1) % frames; }
        else { let far = -1; mem.forEach((q, k) => { let nx = str.indexOf(q, i + 1); if (nx < 0) nx = Infinity; if (nx > far) { far = nx; j = k; } }); }
        victim = mem[j]; ref.delete(victim); mem[j] = p; ref.set(p, 1);
      }
      lastUse.set(p, i);
      trail.push({ p, hit: false, victim });
    });
    return { faults, trail, n: str.length, final: mem.slice(), distinct: new Set(str).size };
  }
  const POLICIES = ['fifo', 'clock', 'lru', 'opt'];
  function curve(strName) { const out = {}; for (const p of POLICIES) { out[p] = []; for (let f = 1; f <= REF.maxFrames; f++) out[p].push(run(strName, f, p).faults); } return out; }
  function anomaly(strName) { const c = curve(strName).fifo, a = []; for (let f = 1; f < c.length; f++) if (c[f] > c[f - 1]) a.push(f); return a; }   // frames f+1 where FIFO faults rose

  /* ── 09 fork: eager copy vs copy-on-write ──
     The parent has N pages. After fork the child writes a fraction c of its pages and the parent a fraction g, chosen
     at random (seeded). Eager copy duplicates all N at fork. Copy-on-write shares every frame read-only; the first
     write to a shared page faults and copies it; when the other side later writes that page it is the only owner
     left, so the fault just makes it writable again (Linux reuses a page whose reference count is 1). */
  const COW = { N: 25600, page: 4 * KiB, seed: 13 };
  function cow(c, g) {
    const R = rng(COW.seed), N = COW.N; let child = 0, parent = 0, both = 0;
    for (let i = 0; i < N; i++) { const a = R() < c, b = R() < g; if (a) child++; if (b) parent++; if (a && b) both++; }
    const copies = child + parent - both;
    return { N, child, parent, both, copies, faults: child + parent, eagerCopies: N, memEager: 2 * N, memCow: N + copies, bytesCow: copies * COW.page, bytesEager: N * COW.page };
  }

  /* ── 10 context switches and kernel entries: a tagged (PCID) TLB vs flushing ──
     K processes take turns, Q = 5,000 accesses each (TUNED); each reads uniformly at random over its own 256 pages
     (1 MiB) (TUNED). Every S user accesses it makes a system call, during which the kernel touches 8 of its own pages
     (TUNED). One 1,536-entry fully associative LRU TLB (TUNED, between Zen 5's two levels). Modes:
       tagged — entries carry their process's PCID; nothing is flushed;
       flush  — every switch flushes everything; kernel pages are global and survive;
     KPTI adds a CR3 write at every kernel entry and exit; with PCID the two page-table copies get two tags, without
     PCID each of those CR3 writes flushes everything, global kernel pages included (Linux PTI doc). */
  const CTX = { Q: 5000, ws: 256, kpages: 8, entries: 1536, rounds: 12, seed: 17, S: [100, 300, 1000, 3000, 10000, 100000] };
  function ctx(K, mode, kpti, S) {
    const R = rng(CTX.seed), t = lru(CTX.entries); let miss = 0, n = 0, cr3 = 0, sys = 0;
    const flushAll = () => t.clear(), flushUser = () => { for (const k of [...t.keys()]) if (k >= 0) t.del(k); };
    let since = 0;
    for (let r = 0; r < CTX.rounds; r++) for (let p = 0; p < K; p++) {
      if (K > 1) { cr3++; if (mode === 'flush') flushUser(); }
      for (let i = 0; i < CTX.Q; i++) {
        const key = (kpti && mode === 'tagged' ? p * 2 : p) * 1e6 + Math.floor(R() * CTX.ws);
        const meas = r >= 2;
        if (!t.has(key)) { t.put(key); if (meas) miss++; }
        if (meas) n++;
        if (++since >= S) {
          since = 0; sys++;
          if (kpti) { cr3 += 2; if (mode === 'flush') flushAll(); }
          for (let k = 0; k < CTX.kpages; k++) { const kk = kpti && mode === 'tagged' ? -(p * 2 + 1) * 1e6 - k - 1 : -k - 1; if (!t.has(kk)) { t.put(kk); if (meas) miss++; } }
          if (kpti && mode === 'flush') flushAll();
        }
      }
    }
    return { K, mode, kpti, S, missPer1k: miss / n * 1000, cr3Per1k: cr3 / (CTX.rounds * K * CTX.Q) * 1000, cr3Cycles: cr3 / (CTX.rounds * K * CTX.Q) * 1000 * FACTS.kpti.cr3Cycles };
  }
  const memoC = new Map();
  function ctxM(K, mode, kpti, S) { const k = [K, mode, kpti ? 1 : 0, S].join(); if (!memoC.has(k)) memoC.set(k, ctx(K, mode, kpti, S)); return memoC.get(k); }

  /* ── 11 the two-dimensional walk (Bhargava, Serebrin, Spadini & Manne, ASPLOS 2008): a guest walk of n levels
     whose every guest-physical address (n table pointers and the final data address) is itself walked through m host
     levels: n·m + n + m references. A 2 MiB page removes one level on its side. ── */
  function nested(n, m) { return { n, m, refs: n * m + n + m, native: n, grid: (n + 1) * (m + 1) - 1 }; }

  /* ── 12 the frontier: dated facts (sources in BRIEF.md) ── */
  const FRONTIER = {
    asOf: '2026-11',
    android: { version: 15, deadline: '2027-02-01', launch: 3.16, launchMax: 30, power: 4.56, camHot: 4.48, camCold: 6.60, boot: 8, bootMs: 950 },
    // commit 7212b58d is contained in v6.16-rc1 and v6.16 and not in v6.15 (GitHub compare API, opened 2026-11-15);
    // Linux 6.16 was released on 2025-07-27 (the v6.16 tag; kernelnewbies.org/Linux_6.16)
    linux5: '2025-05-17', linux5Release: 6.16, linux5ReleaseDate: '2025-07-27', apple: { page: 16 * KiB }
  };

  /* ── numbers quoted in the prose: [value, decimals, kind] ── */
  function prose() {
    const f6 = frag(6), f3 = frag(3), f12 = frag(12);
    const t48 = treeTables(48, 4 * KiB, LAYOUT.heapDefault), t57 = treeTables(57, 4 * KiB, LAYOUT.heapDefault), t48big = treeTables(48, 4 * KiB, 16384 * MiB);
    const z = FACTS.zen5;
    const r4 = tlb('rand', 64 * MiB, 1536, 4 * KiB), r2 = tlb('rand', 64 * MiB, 1536, 2 * MiB), s4 = tlb('seq', 64 * MiB, 1536, 4 * KiB), c4 = tlb('col', 64 * MiB, 1536, 4 * KiB), c2 = tlb('col', 64 * MiB, 1536, 2 * MiB);
    const w1 = walkC(1 * GiB, 4 * KiB, false, false), w1p = walkC(1 * GiB, 4 * KiB, true, false), w64 = walkC(64 * GiB, 4 * KiB, true, false), w16m = walkC(16 * MiB, 4 * KiB, true, false), w1p5 = walkC(1 * GiB, 4 * KiB, true, true);
    const h4 = huge(16 * GiB, 4 * KiB, false), h2 = huge(16 * GiB, 2 * MiB, false), h1g = huge(16 * GiB, GiB, false), hs4 = huge(16 * GiB, 4 * KiB, true), hs2 = huge(16 * GiB, 2 * MiB, true);
    const em = eat(1e-4, 'minor'), en = eat(1e-4, 'nvme'), eh = eat(1e-4, 'hdd'), eh6 = eat(1e-6, 'hdd');
    const bf3 = run('belady', 3, 'fifo'), bf4 = run('belady', 4, 'fifo'), bl3 = run('belady', 3, 'lru'), bl4 = run('belady', 4, 'lru'), bo3 = run('belady', 3, 'opt'), bc3 = run('belady', 3, 'clock'), bc4 = run('belady', 4, 'clock');
    const lp4 = run('loop', 4, 'lru'), lpo = run('loop', 4, 'opt'), lp5 = run('loop', 5, 'lru');
    const k0 = cow(0, 0), k10 = cow(0.1, 0), k1010 = cow(0.1, 0.1);
    const ct1 = ctxM(4, 'flush', false, 1000), ct2 = ctxM(4, 'tagged', false, 1000), ck1 = ctxM(4, 'tagged', true, 1000), ck2 = ctxM(4, 'flush', true, 1000), ck0 = ctxM(4, 'tagged', false, 1000), ct6 = ctxM(6, 'tagged', false, 1000), ct8 = ctxM(8, 'tagged', false, 1000);
    const n44 = nested(4, 4), n55 = nested(5, 5), n43 = nested(4, 3), n33 = nested(3, 3);
    const A = FRONTIER.android;
    return {
      // ch1
      ram: [FRAG.ram, 0], fragSteps: [FRAG.steps, 0], fMean: [6, 0], fFailB: [f6.failB, 0], fFailP: [f6.failP, 0], fFree: [f6.free, 0], fLargest: [f6.largest, 0],
      f3FailB: [f3.failB, 0], f3FailP: [f3.failP, 0], f12FailB: [f12.failB, 0], f12FailP: [f12.failP, 0],
      // ch2
      flat32: [flatBytes(32, 4 * KiB) / MiB, 0], flat48: [flatBytes(48, 4 * KiB) / GiB, 0], flat57: [flatBytes(57, 4 * KiB) / TiB, 0], pages48: [Math.pow(2, 36) / 1e9, 1],
      lv48: [levels(48, 4 * KiB), 0], lv57: [levels(57, 4 * KiB), 0], lv16k: [levels(48, 16 * KiB), 0], lv16k47: [levels(47, 16 * KiB), 0], lv64k: [levels(42, 64 * KiB), 0], bits16k: [11, 0],
      t48n: [t48.tables, 0], t48kib: [t48.bytes / KiB, 0], t48map: [t48.mapped / MiB, 0], t57n: [t57.tables, 0], t48bigN: [t48big.tables, 0], t48bigMiB: [t48big.bytes / MiB, 1], heapBig: [16, 0],
      // ch3
      va4: [FACTS.sdm.va4, 0], va5: [FACTS.sdm.va5, 0], pa: [FACTS.sdm.pa, 0], vaTiB: [FACTS.linux5.va4 / TiB, 0], va5PiB: [FACTS.linux5.va5 / PiB, 0], pa4TiB: [FACTS.linux5.pa4 / TiB, 0], pa5PiB: [FACTS.linux5.pa5 / PiB, 0],
      // ch4
      tlbL1: [z.l1dtlb, 0], tlbL2: [z.l2dtlb, 0], tlbW: [z.l2dtlbWays, 0], tlb1g: [z.l2dtlb1g, 0], itlb1: [z.l1itlb, 0], itlb2: [z.l2itlb, 0],
      reachL1: [z.l1dtlb * 4, 0], reachL2: [z.l2dtlb * 4 / 1024, 0], reachL2h: [z.l2dtlb * 2 / 1024, 0],
      r4: [r4.missRate, 1, 'pct'], r2: [r2.missRate, 1, 'pct'], s4: [s4.missRate, 2, 'pct'], c4: [c4.missRate, 0, 'pct'], c2: [c2.missRate, 1, 'pct'], r4closed: [r4.closed, 1, 'pct'],
      // ch5
      walkers: [z.walkers, 0], pdc: [z.pdc, 0], pwcT: [WALK.pde, 0],
      w1miss: [w1.missRate, 0, 'pct'], w1refs: [w1.perWalk, 0], w1prefs: [w1p.perWalk, 2], w1pbest: [w1p.best, 1], w1pworst: [w1p.worst, 0], w1worst: [w1.worst, 0],
      w64refs: [w64.perWalk, 2], w64worst: [w64.worst, 0], w16miss: [w16m.missRate, 1, 'pct'], w1p5refs: [w1p5.perWalk, 2], dram: [dramCycles(), 0], l2lat: [z.l2.lat, 0], l1lat: [z.l1.lat, 0],
      // ch6
      h4miss: [h4.missRate, 1, 'pct'], h2miss: [h2.missRate, 0, 'pct'], h1gmiss: [h1g.missRate, 1, 'pct'], h4worst: [h4.worst, 0], h2worst: [h2.worst, 0], h1gworst: [h1g.worst, 0], h2refs: [h2.perWalk, 2],
      reach1g: [z.l2dtlb1g, 0], hs2bloat: [hs2.bloat, 0], hs4alloc: [hs4.alloc / GiB, 0], hs2alloc: [hs2.alloc / GiB, 0],
      // ch7
      minorUs: [FACTS.minorUs, 2], minorHi: [FACTS.minorUsHi, 1], touchUs: [FACTS.touchUs, 2], nvmeUs: [faultUs('nvme'), 0], hddMs: [faultUs('hdd') / 1000, 1], dramNs: [FACTS.dramNs, 0],
      minorX: [faultUs('minor') / (FACTS.dramNs / 1000), 0], nvmeX: [faultUs('nvme') / (FACTS.dramNs / 1000), 0], hddX: [faultUs('hdd') / (FACTS.dramNs / 1000), 0],
      emSlow: [em.slow, 3], enSlow: [en.slow, 2], ehSlow: [eh.slow, 0], eh6Slow: [eh6.slow, 1], en10: [1 / en.p10, 0], eh10: [1 / eh.p10, 0], em10: [1 / em.p10, 0],
      // ch8
      bf3: [bf3.faults, 0], bf4: [bf4.faults, 0], bl3: [bl3.faults, 0], bl4: [bl4.faults, 0], bo3: [bo3.faults, 0], bc3: [bc3.faults, 0], bc4: [bc4.faults, 0], bn: [REF.belady.length, 0],
      lp4: [lp4.faults, 0], lpo: [lpo.faults, 0], lp5: [lp5.faults, 0], lpn: [REF.loop.length, 0],
      // ch9
      cowN: [COW.N, 0], cowMiB: [COW.N * COW.page / MiB, 0], k10c: [k10.copies, 0], k1010c: [k1010.copies, 0], k1010f: [k1010.faults, 0], k1010both: [k1010.both, 0],
      // ch10
      ctFlush: [ct1.missPer1k, 0], ctTag: [ct2.missPer1k, 0], ct6: [ct6.missPer1k, 0], ct8: [ct8.missPer1k, 0], ck0: [ck0.missPer1k, 1], ckPcid: [ck1.missPer1k, 0], ckFlush: [ck2.missPer1k, 0], ckCr3: [ck1.cr3Per1k, 1], ckCyc: [ck1.cr3Cycles, 0],
      pcidN: [Math.pow(2, FACTS.sdm.pcidBits), 0], ctxEntries: [CTX.entries, 0], ctxWs: [CTX.ws, 0], ctxQ: [CTX.Q, 0], ctxK: [CTX.kpages, 0],
      // ch11
      n44: [n44.refs, 0], n55: [n55.refs, 0], n43: [n43.refs, 0], n33: [n33.refs, 0], n44x: [n44.refs / 4, 0],
      // ch12
      anLaunch: [A.launch, 2], anMax: [A.launchMax, 0], anPower: [A.power, 2], anCamH: [A.camHot, 2], anCamC: [A.camCold, 2], anBoot: [A.boot, 0], anBootMs: [A.bootMs, 0], anVer: [A.version, 0],
      lx5rel: [FRONTIER.linux5Release, 2], apPage: [FACTS.hostPage / KiB, 0], arm16: [FACTS.arm.k16, 0], arm64a: [FACTS.arm.k64[0], 0], arm64b: [FACTS.arm.k64[1], 0], arm4a: [FACTS.arm.k4[0], 0], cr3c: [FACTS.kpti.cr3Cycles, 0]
    };
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
    frag(mean, t) {
      const r = frag(mean), h = r.hist[Math.min(t == null ? r.hist.length - 1 : t, r.hist.length - 1)];
      const v = Object.assign({ mean }, h);
      if (h.failB === 0) return { key: 'ch1.say.none', v };
      if (h.failP === 0) return { key: 'ch1.say.bbOnly', v };
      // past saturation the two allocators hold different processes and the counts are noise around "memory full":
      // paging can refuse as many or one more (mean 16 MiB, seed 7: 159 vs 160); the sentence must not credit fragmentation
      if (h.failP >= h.failB) return { key: 'ch1.say.full', v };
      return { key: 'ch1.say.both', v };
    },
    table(va, page, heap) {
      const r = treeTables(va, page, heap), v = r;
      return { key: r.flat > 64 * GiB ? 'ch2.say.huge' : 'ch2.say.tree', v };
    },
    walk(w) {
      if (!w) return { key: 'ch3.say.bad', v: {} };
      if (w.fault === 'noncanon') return { key: 'ch3.say.noncanon', v: w };
      if (w.fault === 'notpresent') return { key: w.faultLevel === w.steps.length - 1 && w.steps.length > 1 && w.steps[w.steps.length - 1].leaf ? 'ch3.say.absent' : 'ch3.say.hole', v: w };
      if (w.fault === 'super') return { key: 'ch3.say.super', v: w };
      if (w.fault === 'ro') return { key: 'ch3.say.ro', v: w };
      if (w.fault === 'xd') return { key: 'ch3.say.xd', v: w };
      return { key: w.pageBytes > 4096 ? 'ch3.say.huge' : 'ch3.say.ok', v: w };
    },
    tlb(trace, W, entries, page) {
      const r = tlb(trace, W, entries, page), v = r;
      if (r.missRate < 0.0005) return { key: trace === 'rand' ? 'ch4.say.fits' : 'ch4.say.seqfit', v };
      if (trace === 'rand') return { key: 'ch4.say.rand', v };
      return { key: trace === 'seq' ? 'ch4.say.seq' : 'ch4.say.col', v };
    },
    walkCost(W, page, pwc, lv5) {
      const r = walkC(W, page, pwc, lv5), v = r;
      if (r.missRate < 0.005) return { key: 'ch5.say.fits', v };     // under 0.5 %: the 16 MiB case, exactly the L2 reach
      return { key: pwc ? 'ch5.say.pwc' : 'ch5.say.nopwc', v };
    },
    huge(W, page, sparse) {
      const r = huge(W, page, sparse), v = r;
      if (sparse && r.bloat > 1.5) return { key: 'ch6.say.bloat', v };
      if (r.missRate < 0.0005) return { key: 'ch6.say.fits', v };
      return { key: 'ch6.say.miss', v };
    },
    eat(p, kind) { const r = eat(p, kind); return { key: r.slow < 1.1 ? 'ch7.say.ok' : r.slow < 10 ? 'ch7.say.slow' : 'ch7.say.thrash', v: r }; },
    repl(str, frames, policy) {
      const r = run(str, frames, policy), v = Object.assign({ prev: frames > 1 ? run(str, frames - 1, policy).faults : null }, r);
      if (frames > 1 && v.prev < r.faults) return { key: 'ch8.say.anomaly', v };
      if (r.faults === r.distinct) return { key: 'ch8.say.cold', v };
      return { key: 'ch8.say.n', v };
    },
    cow(c, g) { const r = cow(c, g); return { key: r.copies === 0 ? 'ch9.say.none' : 'ch9.say.some', v: r }; },
    ctx(K, mode, kpti, S) { const r = ctxM(K, mode, kpti, S); return { key: kpti ? (mode === 'flush' ? 'ch10.say.kptiFlush' : 'ch10.say.kptiPcid') : (mode === 'flush' ? 'ch10.say.flush' : 'ch10.say.tag'), v: r }; },
    nested(n, m) { const r = nested(n, m); return { key: n === 0 || m === 0 ? 'ch11.say.native' : 'ch11.say.n', v: r }; }
  };

  return { KiB, MiB, GiB, TiB, PiB, FACTS, dramCycles, rng, FRAG, frag, flatBytes, levels, LAYOUT, regions, treeTables, TOY, buildToy, toy, parseVA, canonical, walk, decode, fields, LEVEL_NAMES,
    TLB, lru, tlbRun, tlb, WALK, walkCost, walkC, HUGE, huge, hugeRun, FAULT, faultUs, eat, REF, run, POLICIES, curve, anomaly, COW, cow, CTX, ctx, ctxM, nested, FRONTIER, prose, fmt, say, clamp };
});
