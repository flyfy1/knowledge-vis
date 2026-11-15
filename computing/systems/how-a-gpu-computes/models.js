/* How a GPU computes: the page's models. Two ways to keep an execution unit busy (average memory access time against
   Little's law), the CUDA indexing rules that map an image onto a grid of blocks, warps and lanes, one warp scheduler
   simulated cycle by cycle, the resident-warp limits of one named SM (H100, compute capability 9.0), branch divergence
   with an active mask, the 32-byte sectors a warp's 32 addresses touch, the 32 shared-memory banks, a tiled matrix
   multiply under a two-level roofline, tensor-core peaks by number format under a roofline, and a triangle rasterised
   into 2×2 quads and 32-lane warps.
   Real-chip figures sit in SRC / FRONTIER with their source and the date it was opened (also in BRIEF.md). Constants
   chosen for a model rather than taken from a source are marked TUNED here and on the page.
   UMD: window.GpuModels in the browser, module.exports in node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.GpuModels = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // mulberry32: a small seeded generator, so every random address and lane outcome repeats exactly
  function rng(seed) {
    let a = seed >>> 0;
    return function () { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }

  /* ── Sourced figures (BRIEF.md lists URL and the date each was opened, all 2026-11-15) ── */
  const SRC = {
    // NVIDIA Hopper Tuning Guide (last updated 2026-11-02): 64 warps, 32 blocks, 64K 32-bit registers and 255 per thread,
    // 228 KB shared memory per SM, 1 KB reserved per block, 227 KB per block, 256 KB L1 + texture + shared, 50 MB L2.
    // NVIDIA Hopper architecture in-depth blog: 132 SMs on H100 SXM5, 128 FP32 cores and 4 tensor cores per SM, 256 KB register file.
    // NVIDIA H100 product page: FP32 67 TFLOPS, FP64 Tensor 67; TF32 989, BF16/FP16 1,979, FP8 3,958 "with sparsity"
    // (dense = half); 80 GB at 3.35 TB/s. CUDA Programming Guide v13.5 (2026-10-31): warp of 32, max 1024 threads per block.
    h100: { sms: 132, fp32Lanes: 128, tcPerSm: 4, schedulers: 4, regsPerSm: 65536, regFileKB: 256, maxRegsThread: 255,
      maxWarps: 64, maxBlocks: 32, maxThreadsBlock: 1024, smemSmKB: 228, smemBlockKB: 227, smemReserveKB: 1, l1smemKB: 256,
      l2MB: 50, hbmGB: 80, hbmTBs: 3.35, fp32TF: 67, tcSparse: { tf32: 989, fp16: 1979, fp8: 3958 }, fp64tc: 67 },
    // DGX B200 page: 8 GPUs, 1,440 GB, 64 TB/s HBM3e; HGX page (8 GPUs): FP4 144 sparse | 72 dense PFLOPS, FP8/FP6 72,
    // FP16/BF16 36, TF32 18 (sparse; dense is half), FP64 296 TFLOPS. Chips and Cheese 2025-12-15: 148 SMs, 126 MB L2.
    b200: { gpus: 8, memGB: 1440, hbmTBs: 64, fp4dense: 72, sparsePF: { fp8: 72, fp16: 36, tf32: 18 }, fp64TF: 296, sms: 148, l2MB: 126, date: '2025-12-15' },
    // HGX page, B300 column (8 GPUs): FP4 108 dense PFLOPS, FP64 10 TFLOPS, INT8 3 POPS (sparse) against B200's 72.
    b300: { gpus: 8, fp4dense: 108, fp64TF: 10, int8Sparse: 3, b200int8Sparse: 72 },
    // Luo et al., "Benchmarking and Dissecting the Nvidia Hopper GPU Architecture", arXiv 2402.13499v1 (2024-02-21),
    // Table IV, latency in clock cycles measured on an H800 PCIe (Hopper SM): L1 40.7, shared 29.0, L2 263.0, global 478.8.
    luo: { l1: 40.7, shared: 29.0, l2: 263.0, global: 478.8, date: '2024-02-21' },
    // CUDA C++ Best Practices Guide v13.5: 32 banks, 32 bits per bank per clock; warp accesses served in 32-byte transactions.
    banks: 32, bankBytes: 4, sector: 32, line: 128, warp: 32,
    // AMD HIP docs (hardware implementation, HIP 7.16): warps of 32 (RDNA) or 64 (CDNA); LDS 32 banks (CDNA 1–3) or 64 (CDNA 4, RDNA 2–4)
    amd: { waveCdna: 64, waveRdna: 32, ldsBanksCdna3: 32, ldsBanksCdna4: 64 },
    // how-cpu-caches-work (A2), from AMD 58455: a Zen 5 L1 data-cache hit returns in 4 cycles
    zen5L1: 4,
    // x86-64 with AVX-512: 16 general-purpose 64-bit registers and 32 vector registers of 512 bits (architectural, what a program sees)
    x86: { gpr: 16, gprBits: 64, vec: 32, vecBits: 512 },
    // Volkov, "Understanding Latency Hiding on GPUs", UCB/EECS-2016-143 (2016-08-12)
    volkov: { year: 2016 }
  };
  const H = SRC.h100;
  // clock implied by the datasheet: 67 TFLOPS = 132 SMs × 128 lanes × 2 FLOP × f
  const CLK = H.fp32TF * 1e12 / (H.sms * H.fp32Lanes * 2);

  const FRONTIER = {
    asOf: '2026-11',
    // NVIDIA RTX 5090 product page: 21,760 CUDA cores, 2.41 GHz boost, 32 GB GDDR7, 512-bit; Blackwell. 128 lanes per SM → 170 SMs
    rtx5090: { cores: 21760, boost: 2.41, memGB: 32, bus: 512 },
    // NVIDIA HGX page, Rubin column (per GPU): NVFP4 inference 50 PFLOPS, NVFP4 training 35, FP8/FP6 17.5, FP16/BF16 4;
    // 288 GB HBM4 at 22 TB/s; NVLink 3.6 TB/s; "ramping into full production" (opened 2026-11-15). A claim until measured.
    rubin: { nvfp4Inf: 50, nvfp4Train: 35, fp8: 17.5, fp16: 4, memGB: 288, hbmTBs: 22 },
    // Tom's Hardware and AMD launch reports (June 2025): MI355X 256 CUs, 288 GB HBM3E, 8 TB/s, about 10 PFLOPS dense FP4,
    // 5 FP8, 2.5 FP16 (press, AMD datasheet not opened: timed out)
    mi355x: { cus: 256, memGB: 288, hbmTBs: 8, fp4: 10.1, fp8: 5.0, fp16: 2.5 },
    // ServeTheHome, "AMD Instinct MI455X Deep Dive" (Ryan Smith, 2026-08-12): 432 GB HBM4 (12 × 36 GB), about 23.3 TB/s,
    // "a bit over 40 PFLOPS of dense FP4", TSMC N2 compute dies, SIMD32 ALU organisation. AMD's figures: a claim.
    mi455x: { memGB: 432, stacks: 12, stackGB: 36, hbmTBs: 23.3, fp4: 40, date: '2026-08-12' },
    // CUDA Programming Guide v13.5, last updated 2026-10-31; ROCm 7.2.4 (production, 2026-05-29), 7.14.1 preview (2026-09-02)
    cuda: { ver: '13.5', date: '2026-10-31' }, rocm: { prod: '7.2.4', prodDate: '2026-05-29', prev: '7.14.1', prevDate: '2026-09-02' }
  };

  /* ── 01 two ways to keep a unit busy. A thread alternates c cycles of work with one memory access.
     CPU-like: one thread, a cache with hit rate h: AMAT = h·Lhit + (1 − h)·L (Hennessy & Patterson), busy = c / (c + AMAT).
     GPU-like: N threads, no cache, the unit switches to any ready thread: busy = min(1, N·c / (c + L)) (Little's law). ── */
  const HIDE = { c: 10, L: Math.round(SRC.luo.global), Lhit: SRC.zen5L1, hs: [0, 0.5, 0.8, 0.9, 0.95, 0.98, 0.99, 1], Ns: [1, 2, 4, 8, 16, 32, 49, 64] };
  function hide(c, h, N, L, Lhit) {
    L = L == null ? HIDE.L : L; Lhit = Lhit == null ? HIDE.Lhit : Lhit;
    const amat = h * Lhit + (1 - h) * L, uCpu = c / (c + amat), uGpu = Math.min(1, N * c / (c + L));
    return { amat, uCpu, uGpu, nFull: Math.ceil((c + L) / c), uCpuMax: c / (c + Lhit), inFlight: N * c / (c + L) };
  }

  /* ── 02 a 2D image on a grid. CUDA Programming Guide: thread ID of (x, y) in a (Dx, Dy) block is x + y·Dx; each warp
     holds 32 consecutive thread IDs, the first warp thread 0. ── */
  const IMAGES = { fhd: [1920, 1080], sq: [1000, 1000], k4: [3840, 2160] };
  const BLOCKS = [[32, 8], [16, 16], [8, 8], [32, 32], [64, 4], [8, 32]];
  function mapImage(W, Hh, bx, by, px, py) {
    const gx = Math.ceil(W / bx), gy = Math.ceil(Hh / by), blocks = gx * gy, tpb = bx * by, threads = blocks * tpb, idle = threads - W * Hh;
    const wpb = Math.ceil(tpb / 32), rowsPerWarp = Math.max(1, 32 / bx), warpW = Math.min(bx, 32);
    const r = { gx, gy, blocks, tpb, threads, idle, idleShare: idle / threads, wpb, rowsPerWarp, warpW, warps: blocks * wpb };
    if (px != null) {
      const bix = Math.floor(px / bx), biy = Math.floor(py / by), tx = px % bx, ty = py % by, tid = tx + ty * bx;
      Object.assign(r, { bix, biy, tx, ty, tid, warp: Math.floor(tid / 32), lane: tid % 32, inImage: px < W && py < Hh });
    }
    return r;
  }

  /* ── 03a one warp scheduler, cycle by cycle. Each warp runs a loop of k instructions, the last of which is a load;
     after issuing it the warp cannot issue for L more cycles. The scheduler issues one instruction per cycle from a
     ready warp. 'gto' (greedy then oldest): keep issuing the same warp until it stalls, then the oldest ready warp; the
     warps' loads spread out and the steady state is busy = min(1, N·k / (k + L)). 'rr' (round robin from the warp after
     the last one issued): every warp advances together, all reach their loads at about the same time and wait together
     (Narasiman et al., MICRO 2011, two-level warp scheduling), so busy falls below the closed form. ── */
  const SCHED = { Ns: [1, 2, 4, 6, 8, 12, 16], ks: [5, 10, 20, 40, 80], Ls: { shared: Math.round(SRC.luo.shared), l1: Math.round(SRC.luo.l1), l2: Math.round(SRC.luo.l2), global: Math.round(SRC.luo.global) }, maxPerSched: H.maxWarps / H.schedulers, T: 40000, warm: 8000 };
  function warpSim(N, k, L, policy, T, warm, keep) {
    T = T || SCHED.T; warm = warm == null ? SCHED.warm : warm; policy = policy || 'gto';
    const ready = new Array(N).fill(0), pos = new Array(N).fill(0), trace = [];
    let last = policy === 'gto' ? 0 : N - 1, issued = 0;   // GTO starts on warp 0; round robin's first pick is warp 0 too
    for (let t = 0; t < T; t++) {
      let w = -1;
      if (policy === 'gto') { if (ready[last] <= t) w = last; else for (let c = 0; c < N; c++) if (ready[c] <= t) { w = c; break; } }
      else for (let j = 1; j <= N; j++) { const c = (last + j) % N; if (ready[c] <= t) { w = c; break; } }
      if (w >= 0) {
        pos[w]++; const isLoad = pos[w] === k;
        if (isLoad) { pos[w] = 0; ready[w] = t + 1 + L; } else ready[w] = t + 1;
        last = w; if (t >= warm) issued++;
        if (keep && t < keep) trace.push([w, isLoad ? 1 : 0]);
      } else if (keep && t < keep) trace.push([-1, 0]);
    }
    return { busy: issued / (T - warm), closed: Math.min(1, N * k / (k + L)), nFull: Math.ceil((k + L) / k), trace };
  }

  /* ── 03b resident warps on one H100 SM (compute capability 9.0, Hopper Tuning Guide limits). Allocation rounding
     (registers per warp, shared-memory granules) is left out; the page says so. ── */
  const OCC = { tpbs: [32, 64, 128, 256, 512, 1024], regs: [16, 24, 32, 40, 48, 64, 80, 96, 128, 168, 255], smem: [0, 4, 8, 16, 32, 48, 64, 100, 164, 227] };
  function occupancy(tpb, regs, smemKB) {
    const wpb = Math.ceil(tpb / 32);
    const bad = tpb > H.maxThreadsBlock ? 'threads' : regs > H.maxRegsThread ? 'regsThread' : regs * tpb > H.regsPerSm ? 'regsBlock' : smemKB > H.smemBlockKB ? 'smem' : null;
    if (bad) return { bad, wpb, blocks: 0, warps: 0, occ: 0, limit: bad, perSched: 0 };
    const lim = { blocks: H.maxBlocks, warps: Math.floor(H.maxWarps / wpb), regs: Math.floor(H.regsPerSm / (regs * tpb)), smem: Math.floor(H.smemSmKB / (smemKB + H.smemReserveKB)) };
    const blocks = Math.min(lim.blocks, lim.warps, lim.regs, lim.smem);
    const limit = ['warps', 'regs', 'smem', 'blocks'].find(k => lim[k] === blocks);
    const warps = blocks * wpb;
    return { bad: null, wpb, lim, blocks, warps, occ: warps / H.maxWarps, limit, perSched: warps / H.schedulers };
  }

  /* ── 04 divergence. A warp meets if (cond) A else B. Each path that at least one lane takes is issued once for the
     whole warp, with the other lanes masked off (CUDA Programming Guide, SIMT architecture). With lanes independent
     and P(cond) = p: E[cycles] = a·(1 − (1 − p)^32) + b·(1 − p^32); useful lane-instructions = 32·(p·a + (1 − p)·b).
     'warp': the condition is the same for every lane of a warp (it depends on the warp, not the lane). ── */
  const DIV = { ps: [0, 0.01, 0.03, 0.05, 0.1, 0.25, 0.5, 0.75, 0.9, 0.95, 0.99, 1], as: [10, 20, 40, 80], b: 10 };
  function diverge(p, a, b, mode) {
    if (mode === 'warp') return { cycles: p * a + (1 - p) * b, useful: p * a + (1 - p) * b, eff: 1 };
    const cycles = a * (1 - Math.pow(1 - p, 32)) + b * (1 - Math.pow(p, 32)), useful = p * a + (1 - p) * b;
    return { cycles, useful, eff: useful / cycles };
  }
  function sampleMask(p, seed, mode) {
    const R = rng(seed || 7);
    if (mode === 'warp') { const x = R() < p; return new Array(32).fill(x); }
    const m = []; for (let i = 0; i < 32; i++) m.push(R() < p); return m;
  }
  function maskCycles(mask, a, b) { const nA = mask.filter(Boolean).length; return { nA, cycles: (nA ? a : 0) + (nA < 32 ? b : 0), eff: (nA * a + (32 - nA) * b) / (32 * ((nA ? a : 0) + (nA < 32 ? b : 0))) }; }

  /* ── 05 coalescing. 32 lanes each load 4 bytes; the request is served in 32-byte sectors (Best Practices Guide).
     Efficiency = bytes asked for / bytes moved; effective bandwidth = efficiency × the H100's 3.35 TB/s. ── */
  const COAL = { patterns: ['seq', 'offset', 'stride', 'rows', 'random'], strides: [1, 2, 3, 4, 8, 16, 32], offsets: [0, 1, 4, 7, 8, 16], imgW: 1920 };
  function laneAddrs(pattern, param) {
    const a = [];
    if (pattern === 'random') { const R = rng(1000 + (param || 0)); for (let i = 0; i < 32; i++) a.push(4 * Math.floor(R() * (1 << 22))); return a; }
    for (let i = 0; i < 32; i++) {
      if (pattern === 'seq') a.push(4 * i);
      else if (pattern === 'offset') a.push(4 * (i + param));
      else if (pattern === 'stride') a.push(4 * i * param);
      else if (pattern === 'rows') a.push(4 * (Math.floor(i / 16) * COAL.imgW + (i % 16)));
    }
    return a;
  }
  function coalesce(pattern, param) {
    const a = laneAddrs(pattern, param), sec = new Set(a.map(x => Math.floor(x / SRC.sector))), ln = new Set(a.map(x => Math.floor(x / SRC.line)));
    const useful = new Set(a).size * 4, moved = sec.size * SRC.sector, eff = useful / moved;
    return { addrs: a, sectors: sec.size, lines: ln.size, useful, moved, eff, bw: eff * H.hbmTBs, sectorList: [...sec].sort((x, y) => x - y) };
  }

  /* ── 06 shared-memory banks: 32 banks of 4 bytes; word w lives in bank w mod 32; lanes reading different words of
     one bank are served one after another, lanes reading the same word get a broadcast (Best Practices Guide). ── */
  const BANK = { strides: [0, 1, 2, 3, 4, 8, 16, 31, 32, 33, 64] };
  function bankDegree(words) {
    const per = new Map();
    for (const w of words) { const b = ((w % 32) + 32) % 32; if (!per.has(b)) per.set(b, new Set()); per.get(b).add(w); }
    let deg = 0; for (const s of per.values()) deg = Math.max(deg, s.size);
    const perBank = []; for (let b = 0; b < 32; b++) perBank.push(per.has(b) ? per.get(b).size : 0);
    return { deg, perBank };
  }
  function banks(stride) { const w = []; for (let i = 0; i < 32; i++) w.push(i * stride); const r = bankDegree(w); return Object.assign(r, { words: w, bw: SRC.banks * SRC.bankBytes / r.deg }); }
  function tileColumn(pad, col) { const w = []; for (let i = 0; i < 32; i++) w.push(i * (32 + pad) + (col || 0)); const r = bankDegree(w); return Object.assign(r, { words: w, stride: 32 + pad }); }
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);

  /* ── 07 tiled matrix multiply, FP32 on the H100's CUDA cores, as a two-level roofline (Williams, Waterman & Patterson
     2009, with one roof per memory level). A block computes a T×T tile of C; each element of the A and B tiles it loads
     from HBM is used T times: I_global = 2T³…/… = T/4 FLOP per byte (4-byte floats; T = 1 is the untiled kernel, two
     loads per multiply-add). Each thread computes an r×r patch of its tile from registers, reading 2r words from shared
     memory per 2r² FLOP: I_shared = r/4. Shared-memory bandwidth = SMs × 32 banks × 4 B × clock. K step 32 (TUNED: it
     sets the shared memory a block needs, 2·T·32·4 bytes, not the intensity). Caches are ignored. ── */
  const MM = { Ts: [1, 8, 16, 32, 64, 128], rs: [1, 2, 4, 8], kStep: 32 };
  const SMEM_TBs = H.sms * SRC.banks * SRC.bankBytes * CLK / 1e12;
  function tiledMM(T, r) {
    if (T === 1) r = 1;
    const Ig = T === 1 ? 0.25 : T / 4, Is = T === 1 ? Infinity : r / 4;
    const roofs = { peak: H.fp32TF, hbm: Ig * H.hbmTBs, smem: Is * SMEM_TBs };
    const att = Math.min(roofs.peak, roofs.hbm, roofs.smem), eps = 1e-9;
    const limit = att >= roofs.peak - eps ? 'peak' : roofs.hbm <= roofs.smem ? 'hbm' : 'smem';
    const threads = T === 1 ? 256 : Math.pow(T / r, 2), smemKB = T === 1 ? 0 : 2 * T * MM.kStep * 4 / 1024;
    const bad = T !== 1 && (r > T || threads > H.maxThreadsBlock) ? (threads > H.maxThreadsBlock ? 'threads' : 'r') : (T !== 1 && threads < 32 ? 'tiny' : null);
    return { T, r, Ig, Is, roofs, att, limit, threads, smemKB, bad, ridge: H.fp32TF / H.hbmTBs };
  }

  /* ── 08 tensor cores by number format. Peaks are vendor dense figures (sparse ÷ 2 where the sheet lists sparse).
     A square N×N×N multiply that reads A and B and writes C once, all in format of b bytes: I = 2N³ / (3N²·b) = 2N / (3b);
     attainable = min(peak, I × HBM bandwidth) (roofline). m16n8k16: one warp instruction does 16·8·16 = 2,048
     multiply-adds; a warp FMA does 32. ── */
  const FMTS = { fp32: 4, tf32: 4, fp16: 2, fp8: 1, fp4: 0.5 };
  const GPUS = {
    h100: { bw: H.hbmTBs, peak: { fp32: H.fp32TF, tf32: H.tcSparse.tf32 / 2, fp16: H.tcSparse.fp16 / 2, fp8: H.tcSparse.fp8 / 2, fp4: null } },
    b200: { bw: SRC.b200.hbmTBs / SRC.b200.gpus, peak: { fp32: null, tf32: SRC.b200.sparsePF.tf32 * 1000 / 2 / 8, fp16: SRC.b200.sparsePF.fp16 * 1000 / 2 / 8, fp8: SRC.b200.sparsePF.fp8 * 1000 / 2 / 8, fp4: SRC.b200.fp4dense * 1000 / 8 } }
  };
  const MMA = { m: 16, n: 8, k: 16, Ns: [128, 256, 512, 1024, 2048, 4096, 8192, 16384] };
  function gemm(N, fmt, gpu) {
    const g = GPUS[gpu], peak = g.peak[fmt];
    if (peak == null) return { none: true };
    const I = 2 * N / (3 * FMTS[fmt]), mem = I * g.bw, att = Math.min(peak, mem);
    return { I, peak, mem, att, share: att / peak, bound: mem < peak ? 'mem' : 'compute', ridge: peak / g.bw, nFull: Math.ceil(peak / g.bw * 3 * FMTS[fmt] / 2) };
  }
  const mmaMacs = () => MMA.m * MMA.n * MMA.k;

  /* ── 09 rasterising one triangle. Edge functions at pixel centres (Pineda 1988); fragments are shaded in 2×2 quads so
     each pixel has neighbours for screen-space derivatives; a 32-lane warp takes 8 quads. Lanes on quad pixels outside
     the triangle still run ("helper" lanes) and their results are thrown away. ── */
  const RAS = { base: [[0, 0], [1, 0.25], [0.35, 1]], off: [3.37, 3.21], sizes: [1, 2, 3, 4, 6, 8, 12, 16, 24, 32], grid: 40 };
  function raster(s) {
    const [o0, o1] = RAS.off, v = RAS.base.map(([x, y]) => [o0 + x * s, o1 + y * s]);
    const ef = (a, b, p) => (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
    const area2 = ef(v[0], v[1], v[2]);
    const pix = [], quads = new Map();
    const xmax = Math.ceil(Math.max(...v.map(p => p[0]))), ymax = Math.ceil(Math.max(...v.map(p => p[1])));
    for (let y = 0; y <= ymax; y++) for (let x = 0; x <= xmax; x++) {
      const p = [x + 0.5, y + 0.5];
      const w0 = ef(v[1], v[2], p), w1 = ef(v[2], v[0], p), w2 = ef(v[0], v[1], p);
      const inside = area2 > 0 ? (w0 > 0 && w1 > 0 && w2 > 0) : (w0 < 0 && w1 < 0 && w2 < 0);
      if (inside) { pix.push([x, y]); const q = (x >> 1) + ',' + (y >> 1); quads.set(q, (quads.get(q) || 0) + 1); }
    }
    const nq = quads.size, lanes = 4 * nq, warps = Math.ceil(nq / 8);
    return { verts: v, pix, covered: pix.length, quads: nq, lanes, quadEff: lanes ? pix.length / lanes : null, warps, warpEff: warps ? pix.length / (32 * warps) : null, area: Math.abs(area2) / 2, quadList: [...quads.keys()].map(k => k.split(',').map(Number)) };
  }

  // the same triangle placed at 100 sub-pixel offsets (a 10 × 10 grid of cell centres inside one pixel): the quad
  // efficiency depends on where the triangle lands, so the prose quotes the mean and the range as well as RAS.off
  function rasterSpread(s) {
    const save = RAS.off.slice(), e = [];
    for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) { RAS.off[0] = 3 + (i + 0.5) / 10; RAS.off[1] = 3 + (j + 0.5) / 10; e.push(raster(s).quadEff || 0); }
    RAS.off[0] = save[0]; RAS.off[1] = save[1];
    return { mean: e.reduce((x, y) => x + y, 0) / e.length, min: Math.min(...e), max: Math.max(...e) };
  }

  /* ── numbers quoted in the prose: [value, decimals, kind] ── */
  let PROSE_CACHE = null;
  function prose() {
    if (PROSE_CACHE) return PROSE_CACHE;
    const c = HIDE.c, h95 = hide(c, 0.95, 1), h99 = hide(c, 0.99, 1), h0 = hide(c, 0, 1), g8 = hide(c, 0, 8), g32 = hide(c, 0, 32), h1 = hide(c, 1, 1);
    const [W, Hh] = IMAGES.fhd, m16 = mapImage(W, Hh, 16, 16), m328 = mapImage(W, Hh, 32, 8), m32 = mapImage(W, Hh, 32, 32), sq = mapImage(1000, 1000, 16, 16);
    const L = SCHED.Ls, s820 = warpSim(8, 20, L.global), s1620 = warpSim(16, 20, L.global), s1640 = warpSim(16, 40, L.global), s820l2 = warpSim(8, 20, L.l2), s1620l2 = warpSim(16, 20, L.l2), rr1640 = warpSim(16, 40, L.global, 'rr'), rr820 = warpSim(8, 20, L.global, 'rr');
    const o32 = occupancy(256, 32, 0), o64 = occupancy(256, 64, 0), o128 = occupancy(256, 128, 0), oS = occupancy(256, 32, 100), oDef = occupancy(256, 64, 16), o1 = occupancy(32, 32, 0);
    const d50 = diverge(0.5, 10, 10), d05 = diverge(0.05, 10, 10), d05b = diverge(0.05, 40, 10), d01 = diverge(0.01, 10, 10);
    const cs = coalesce('seq'), co1 = coalesce('offset', 1), c2 = coalesce('stride', 2), c4 = coalesce('stride', 4), c8 = coalesce('stride', 8), c32 = coalesce('stride', 32), cr = coalesce('random', 0), crow = coalesce('rows');
    const b2 = banks(2), b32 = banks(32), b33 = banks(33), b3 = banks(3), tc0 = tileColumn(0), tc1 = tileColumn(1);
    const mN = tiledMM(1, 1), m32r1 = tiledMM(32, 1), m64r4 = tiledMM(64, 4), m128r8 = tiledMM(128, 8), m128r4 = tiledMM(128, 4);
    const g256 = gemm(256, 'fp8', 'h100'), g4096 = gemm(4096, 'fp8', 'h100'), b512 = gemm(512, 'fp4', 'b200'), b1024 = gemm(1024, 'fp4', 'b200'), h16_256 = gemm(256, 'fp16', 'h100');
    const r2 = raster(2), r4 = raster(4), r8 = raster(8), r32 = raster(32), sp2 = rasterSpread(2), sp32 = rasterSpread(32);
    const F = FRONTIER, B2 = SRC.b200;
    PROSE_CACHE = {
      // ch1
      hc: [c, 0], hL: [HIDE.L, 0], hLhit: [HIDE.Lhit, 0], hAmat95: [h95.amat, 2], hU95: [h95.uCpu, 1, 'pct'], hAmat99: [h99.amat, 2], hU99: [h99.uCpu, 1, 'pct'], hU0: [h0.uCpu, 1, 'pct'], hU1: [h1.uCpu, 1, 'pct'],
      hG8: [g8.uGpu, 1, 'pct'], hG32: [g32.uGpu, 1, 'pct'], hNfull: [h0.nFull, 0], h100sm: [H.sms, 0], h100lanes: [H.fp32Lanes, 0], h100cores: [H.sms * H.fp32Lanes, 0], regKB: [H.regFileKB, 0], cpuRegKB: [(SRC.x86.gpr * SRC.x86.gprBits + SRC.x86.vec * SRC.x86.vecBits) / 8 / 1024, 0], x86gpr: [SRC.x86.gpr, 0], x86vec: [SRC.x86.vec, 0], x86vecBits: [SRC.x86.vecBits, 0], l1KB: [H.l1smemKB, 0],
      // a CUDA thread's architectural registers: at most 255 × 4 B; at full residency (64 warps × 32 threads) 65,536 / 2,048 = 32 each
      gpuRegMaxB: [H.maxRegsThread * 4, 0], thrSm: [H.maxWarps * 32, 0], gpuRegFull: [H.regsPerSm / (H.maxWarps * 32), 0], gpuRegFullB: [H.regsPerSm / (H.maxWarps * 32) * 4, 0],
      // ch2
      imgW: [W, 0], imgH: [Hh, 0], g16x: [m16.gx, 0], g16y: [m16.gy, 0], g16b: [m16.blocks, 0], g16t: [m16.threads, 0], g16idle: [m16.idle, 0], g16share: [m16.idleShare, 2, 'pct'], g16w: [m16.warps, 0],
      g328x: [m328.gx, 0], g328y: [m328.gy, 0], g328idle: [m328.idle, 0], g32idle: [m32.idle, 0], sqIdle: [sq.idle, 0], sqShare: [sq.idleShare, 1, 'pct'], pixels: [W * Hh, 0],
      // ch3
      lShared: [L.shared, 0], lL1: [L.l1, 0], lL2: [L.l2, 0], lGlobal: [L.global, 0], perSched: [SCHED.maxPerSched, 0], maxWarps: [H.maxWarps, 0], scheds: [H.schedulers, 0],
      s820: [s820.closed, 1, 'pct'], s1620: [s1620.closed, 1, 'pct'], s1640: [s1640.closed, 1, 'pct'], s820l2: [s820l2.closed, 1, 'pct'], n20g: [s820.nFull, 0], n40g: [s1640.nFull, 0], n20l2: [s820l2.nFull, 0], rr1640: [rr1640.busy, 0, 'pct'],
      maxBlocks: [H.maxBlocks, 0], regsSm: [H.regsPerSm, 0], maxRegs: [H.maxRegsThread, 0], smemSm: [H.smemSmKB, 0], smemBlk: [H.smemBlockKB, 0], smemRes: [H.smemReserveKB, 0],
      o32w: [o32.warps, 0], o32: [o32.occ, 0, 'pct'], o64w: [o64.warps, 0], o64: [o64.occ, 0, 'pct'], o128w: [o128.warps, 0], o128: [o128.occ, 0, 'pct'], oSb: [oS.blocks, 0], oSw: [oS.warps, 0], oS: [oS.occ, 0, 'pct'],
      oDefW: [oDef.warps, 0], oDefPs: [oDef.perSched, 0], o1w: [o1.warps, 0], o1: [o1.occ, 0, 'pct'],
      // ch4
      d50: [d50.eff, 0, 'pct'], d05: [d05.eff, 1, 'pct'], d05b: [d05b.eff, 1, 'pct'], d01: [d01.eff, 1, 'pct'], dCyc05: [d05.cycles, 1],
      // ch5
      csS: [cs.sectors, 0], co1S: [co1.sectors, 0], co1E: [co1.eff, 0, 'pct'], c2S: [c2.sectors, 0], c2E: [c2.eff, 0, 'pct'], c4S: [c4.sectors, 0], c8S: [c8.sectors, 0], c8E: [c8.eff, 1, 'pct'], c8bw: [c8.bw, 2],
      crS: [cr.sectors, 0], crowS: [crow.sectors, 0], crowL: [crow.lines, 0], hbm: [H.hbmTBs, 2], c8x: [cs.eff / c8.eff, 0],
      // ch6
      b2d: [b2.deg, 0], b32d: [b32.deg, 0], b33d: [b33.deg, 0], b3d: [b3.deg, 0], tc0d: [tc0.deg, 0], tc1d: [tc1.deg, 0], bankBW: [SRC.banks * SRC.bankBytes, 0],
      // ch7
      mmNaive: [mN.att, 2], mm32: [m32r1.att, 1], mm32hbm: [m32r1.roofs.hbm, 1], mm64: [m64r4.att, 1], mm128: [m128r8.att, 0], mm128r4: [m128r4.att, 1], smemTB: [SMEM_TBs, 1], clk: [CLK / 1e9, 2],
      mmRidge: [mN.ridge, 0], mmRidgeT: [mN.ridge * 4, 0], mmX: [m128r8.att / mN.att, 0], mm128smem: [m128r8.smemKB, 0], mm128thr: [m128r8.threads, 0], fp32TF: [H.fp32TF, 0],
      // ch8
      macs: [mmaMacs(), 0], macsX: [mmaMacs() / 32, 0], tf32: [GPUS.h100.peak.tf32, 1], fp16: [GPUS.h100.peak.fp16, 1], fp8: [GPUS.h100.peak.fp8, 0], fp64tc: [H.fp64tc, 0],
      bFp16: [GPUS.b200.peak.fp16, 0], bFp8: [GPUS.b200.peak.fp8, 0], bFp4: [GPUS.b200.peak.fp4, 0], bBw: [GPUS.b200.bw, 0],
      g256: [g256.att, 0], g256i: [g256.I, 0], g256s: [g256.share, 0, 'pct'], b512s: [b512.share, 0, 'pct'], b1024s: [b1024.share, 0, 'pct'], h16_256: [h16_256.share, 0, 'pct'],
      // ch9
      r2c: [r2.covered, 0], r2l: [r2.lanes, 0], r2e: [r2.quadEff, 0, 'pct'], r4e: [r4.quadEff, 0, 'pct'], r8e: [r8.quadEff, 0, 'pct'], r32e: [r32.quadEff, 0, 'pct'], r32c: [r32.covered, 0], r32w: [r32.warps, 0],
      r2avg: [sp2.mean, 0, 'pct'], r2lo: [sp2.min, 0, 'pct'], r2hi: [sp2.max, 0, 'pct'], r32avg: [sp32.mean, 0, 'pct'],
      // ch10
      l2MB: [H.l2MB, 0], bL2: [B2.l2MB, 0], bSm: [B2.sms, 0],
      // ch11
      bMem: [B2.memGB / B2.gpus, 0], b300fp4: [SRC.b300.fp4dense * 1000 / SRC.b300.gpus, 0], b300fp64: [SRC.b300.fp64TF / SRC.b300.gpus, 2], b200fp64: [B2.fp64TF / B2.gpus, 0], b300int8: [SRC.b300.int8Sparse, 0], b200int8: [SRC.b300.b200int8Sparse, 0],
      r5c: [F.rtx5090.cores, 0], r5sm: [F.rtx5090.cores / H.fp32Lanes, 0], r5mem: [F.rtx5090.memGB, 0], r5bus: [F.rtx5090.bus, 0],
      rbInf: [F.rubin.nvfp4Inf, 0], rbTr: [F.rubin.nvfp4Train, 0], rbMem: [F.rubin.memGB, 0], rbBw: [F.rubin.hbmTBs, 0],
      miCu: [F.mi355x.cus, 0], miMem: [F.mi355x.memGB, 0], miBw: [F.mi355x.hbmTBs, 0], miFp4: [F.mi355x.fp4, 1],
      mi4Mem: [F.mi455x.memGB, 0], mi4St: [F.mi455x.stacks, 0], mi4Gb: [F.mi455x.stackGB, 0], mi4Bw: [F.mi455x.hbmTBs, 1], mi4Fp4: [F.mi455x.fp4, 0],
      waveC: [SRC.amd.waveCdna, 0], waveR: [SRC.amd.waveRdna, 0], ldsC4: [SRC.amd.ldsBanksCdna4, 0]
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
    hide(c, h, N) { const r = hide(c, h, N); return { key: r.uGpu >= 1 ? 'ch1.say.gpufull' : r.uGpu > r.uCpu ? 'ch1.say.gpuahead' : 'ch1.say.cpuahead', v: r }; },
    map(W, Hh, bx, by) { const r = mapImage(W, Hh, bx, by); return { key: r.idle === 0 ? 'ch2.say.exact' : 'ch2.say.idle', v: r }; },
    pixel(W, Hh, bx, by, px, py) { const r = mapImage(W, Hh, bx, by, px, py); return { key: bx >= 32 ? 'ch2.say.pxrow' : 'ch2.say.pxrows', v: r }; },
    sched(N, k, L, policy) { const r = warpSim(N, k, L, policy, 6000, 2000); return { key: policy === 'rr' && r.busy < r.closed - 0.02 ? 'ch3.say.rr' : r.closed >= 1 ? 'ch3.say.full' : r.nFull > SCHED.maxPerSched ? 'ch3.say.never' : 'ch3.say.more', v: r }; },
    occ(tpb, regs, smem) { const r = occupancy(tpb, regs, smem); return { key: r.bad ? 'ch3.say.occ.bad.' + r.bad : 'ch3.say.occ.' + r.limit, v: r }; },
    div(p, a, mode) { const r = diverge(p, a, DIV.b, mode); return { key: mode === 'warp' ? 'ch4.say.warp' : (p === 0 || p === 1) ? 'ch4.say.none' : 'ch4.say.split', v: r }; },
    coal(pattern, param) { const r = coalesce(pattern, param); return { key: r.eff >= 1 ? 'ch5.say.full' : r.sectors >= 32 ? 'ch5.say.worst' : 'ch5.say.part', v: r }; },
    bank(stride) { const r = banks(stride); return { key: stride === 0 ? 'ch6.say.bcast' : r.deg === 1 ? 'ch6.say.free' : r.deg === 32 ? 'ch6.say.worst' : 'ch6.say.conflict', v: r }; },
    tile(pad) { const r = tileColumn(pad); return { key: r.deg === 1 ? 'ch6.say.tilefree' : 'ch6.say.tileconf', v: r }; },
    mm(T, r) { const m = tiledMM(T, r); return { key: m.bad ? 'ch7.say.bad.' + m.bad : T === 1 ? 'ch7.say.naive' : 'ch7.say.' + m.limit, v: m }; },
    gemm(N, fmt, gpu) { const g = gemm(N, fmt, gpu); return { key: g.none ? 'ch8.say.none' : g.bound === 'mem' ? 'ch8.say.mem' : 'ch8.say.compute', v: g }; },
    ras(s) { const r = raster(s); return { key: r.quadEff < 0.5 ? 'ch9.say.small' : 'ch9.say.big', v: r }; }
  };

  return { rng, SRC, CLK, FRONTIER, HIDE, hide, IMAGES, BLOCKS, mapImage, SCHED, warpSim, OCC, occupancy, DIV, diverge, sampleMask, maskCycles,
    COAL, laneAddrs, coalesce, BANK, bankDegree, banks, tileColumn, gcd, MM, SMEM_TBs, tiledMM, FMTS, GPUS, MMA, gemm, mmaMacs, RAS, raster, rasterSpread, prose, fmt, say };
});
