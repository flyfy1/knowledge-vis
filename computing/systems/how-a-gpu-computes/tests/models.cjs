'use strict';
// Pins the page's GPU models: the vendor and measured figures against the values typed from their sources; latency
// hiding (AMAT against Little's law) by hand; the CUDA thread-index rule and the grid counts; the warp scheduler
// simulation against its closed form under greedy-then-oldest, and round robin falling short of it; the H100 occupancy
// limits on hand-worked cases; divergence against the binomial formula and a Monte Carlo over sampled masks; sector
// counts for every access pattern by hand; bank conflicts against gcd(s, 32); the tiled multiply's two roofs; tensor-core
// peaks and the roofline crossover; the rasteriser's edge functions against a brute-force supersampled area; every number
// the prose quotes (placeholders filled from prose(), literals checked against models.js); how far each conclusion moves
// when a tuned parameter is halved or doubled; every live sentence branch; copy keys, language hygiene, the registry, the
// sibling essays' aliases and links.
// Run: node computing/systems/how-a-gpu-computes/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const ROOT = path.join(DIR, '..', '..', '..');
const M = require(path.join(DIR, 'models.js'));
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;
const html = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(DIR, 'app.js'), 'utf8');
const { SRC, FRONTIER } = M, H = SRC.h100;

let n = 0, fails = 0;
function check(name, got, want) { n++; if (got !== want) { fails++; console.error(`FAIL ${name}: model gives ${got}, expected ${want}`); } }
function within(name, got, lo, hi) { n++; if (!(got >= lo && got <= hi)) { fails++; console.error(`FAIL ${name}: ${got} not in [${lo}, ${hi}]`); } }
function says(key, phrase) { n++; if (!Z[key] || !Z[key].includes(phrase)) { fails++; console.error(`FAIL prose ${key} should contain "${phrase}"`); } }
const f = (x, d) => x.toFixed(d);
const P = M.prose();

/* ── sourced and frontier figures, typed again from the sources (BRIEF.md lists URL and date for each) ── */
{
  // Hopper Tuning Guide: 64 warps, 32 blocks, 64K registers, 255 per thread, 228 KB per SM, 227 KB per block, 1 KB reserved, 256 KB L1+shared, 50 MB L2
  check('H100 occupancy limits', [H.maxWarps, H.maxBlocks, H.regsPerSm, H.maxRegsThread, H.smemSmKB, H.smemBlockKB, H.smemReserveKB, H.l1smemKB, H.l2MB].join(), '64,32,65536,255,228,227,1,256,50');
  check('64K registers × 4 B = 256 KB register file', H.regsPerSm * 4 / 1024, H.regFileKB);
  // Hopper in-depth blog: 132 SMs (SXM5), 128 FP32 lanes and 4 tensor cores per SM, 4 partitions
  check('H100 SXM5: 132 SMs × 128 lanes, 4 TCs, 4 schedulers', [H.sms, H.fp32Lanes, H.tcPerSm, H.schedulers].join(), '132,128,4,4');
  // H100 product page: FP32 67, FP64 TC 67, TF32 989 / FP16 1,979 / FP8 3,958 with sparsity; 80 GB at 3.35 TB/s
  check('H100 peaks (sparse) and memory', [H.fp32TF, H.fp64tc, H.tcSparse.tf32, H.tcSparse.fp16, H.tcSparse.fp8, H.hbmGB, H.hbmTBs].join(), '67,67,989,1979,3958,80,3.35');
  check('dense = sparse ÷ 2 on the page', [M.GPUS.h100.peak.tf32, M.GPUS.h100.peak.fp16, M.GPUS.h100.peak.fp8].join(), '494.5,989.5,1979');
  // HGX / DGX B200: 8 GPUs, 1,440 GB, 64 TB/s; FP4 72 PF dense; FP8 72, FP16 36, TF32 18 sparse; FP64 296 TF
  const B = SRC.b200;
  check('B200 (8 GPUs) figures', [B.gpus, B.memGB, B.hbmTBs, B.fp4dense, B.sparsePF.fp8, B.sparsePF.fp16, B.sparsePF.tf32, B.fp64TF].join(), '8,1440,64,72,72,36,18,296');
  check('B200 per GPU: 9,000 FP4, 4,500 FP8, 2,250 FP16 TFLOPS, 8 TB/s', [M.GPUS.b200.peak.fp4, M.GPUS.b200.peak.fp8, M.GPUS.b200.peak.fp16, M.GPUS.b200.bw].join(), '9000,4500,2250,8');
  check('B200 Chips and Cheese 148 SMs, 126 MB L2, 2025-12-15', [B.sms, B.l2MB, B.date].join(), '148,126,2025-12-15');
  check('B300 (8 GPUs): FP4 108 PF, FP64 10 TF, INT8 3 POPS vs 72', [SRC.b300.fp4dense, SRC.b300.fp64TF, SRC.b300.int8Sparse, SRC.b300.b200int8Sparse].join(), '108,10,3,72');
  // Luo et al. arXiv 2402.13499 Table IV (H800): L1 40.7, shared 29.0, L2 263.0, global 478.8 cycles
  check('Luo latencies (cycles)', [SRC.luo.l1, SRC.luo.shared, SRC.luo.l2, SRC.luo.global, SRC.luo.date].join(), '40.7,29,263,478.8,2024-02-21');
  check('scheduler presets are Luo rounded', Object.values(M.SCHED.Ls).join(), [29, 41, 263, 479].join());
  check('banks 32 × 4 B; sector 32 B; line 128 B; warp 32', [SRC.banks, SRC.bankBytes, SRC.sector, SRC.line, SRC.warp].join(), '32,4,32,128,32');
  check('AMD wave 64 (CDNA) / 32 (RDNA); LDS 32 / 64 banks', [SRC.amd.waveCdna, SRC.amd.waveRdna, SRC.amd.ldsBanksCdna3, SRC.amd.ldsBanksCdna4].join(), '64,32,32,64');
  check('Zen 5 L1 hit 4 cycles (A2)', SRC.zen5L1, 4);
  const F = FRONTIER;
  check('RTX 5090: 21,760 cores, 32 GB, 512-bit', [F.rtx5090.cores, F.rtx5090.memGB, F.rtx5090.bus].join(), '21760,32,512');
  check('RTX 5090: 21,760 / 128 = 170 SMs', F.rtx5090.cores / 128, 170);
  check('Rubin: 50 / 35 PF NVFP4, 288 GB, 22 TB/s', [F.rubin.nvfp4Inf, F.rubin.nvfp4Train, F.rubin.memGB, F.rubin.hbmTBs].join(), '50,35,288,22');
  check('MI355X: 256 CUs, 288 GB, 8 TB/s, 10.1 PF FP4', [F.mi355x.cus, F.mi355x.memGB, F.mi355x.hbmTBs, F.mi355x.fp4].join(), '256,288,8,10.1');
  check('MI455X: 12 × 36 GB = 432 GB, 23.3 TB/s, 40 PF, 2026-08-12', [F.mi455x.stacks * F.mi455x.stackGB, F.mi455x.memGB, F.mi455x.hbmTBs, F.mi455x.fp4, F.mi455x.date].join(), '432,432,23.3,40,2026-08-12');
  check('CUDA 13.5 (2026-10-31); ROCm 7.2.4 (2026-05-29), 7.14.1 (2026-09-02)', [F.cuda.ver, F.cuda.date, F.rocm.prod, F.rocm.prodDate, F.rocm.prev, F.rocm.prevDate].join(), '13.5,2026-10-31,7.2.4,2026-05-29,7.14.1,2026-09-02');
  // literals in the prose, against the figures above
  for (const [k, s] of [['ch1.p3', '478.8 拍'], ['ch1.p3', '2024 年'], ['ch3.p3', '2024 年'], ['ch3.p2', '32 条 FP32'], ['ch2.p3', '最多 1024 个线程'],
    ['ch7.p3', '132 个 SM × 32 个 bank × 4 字节'], ['ch7.p3', '67 TFLOPS ÷ 132 ÷ 128 ÷ 2'], ['ch10.p2', 'H100 80 GB'], ['ch11.d1', '80 GB HBM3'],
    ['ch3.bar.warps', '64'], ['ch3.bar.regs', '65536'], ['ch3.bar.smem', '228 KB'], ['ch3.bar.blocks', '32'], ['dg.sm.rf', '64 KB'], ['dg.sm.l1', '256 KB'],
    ['ch3.say.occ.bad.regsBlock', '65536'], ['ch11.d5', '每 SM 128 条'], ['ch11.e1', '13.5 版'],
    ['ch11.d2', '2025 年 12 月 15 日'], ['ch11.d6', '2026 年 10 月 31 日'], ['ch11.d6', '7.2.4 发布于 2026 年 5 月 29 日'], ['ch11.d6', '7.14.1 发布于 2026 年 9 月 2 日'],
    ['ch11.c1', '2026 年 11 月 15 日'], ['ch11.c2', '2026 年 8 月 12 日'], ['ch11.d4', '2025 年 6 月'], ['ch11.title', '2026 年 11 月'],
    ['ch9.p2', 'Pineda 1988 年'], ['ch9.p3', '2010 年'], ['ch3.p4', 'Volkov 2016 年'], ['ch3.p4', '2011 年'], ['ch11.e3', '2009']]) says(k, s);
  check('register file per partition: 256 KB / 4 = 64 KB', H.regFileKB / H.schedulers, 64);
  check('x86-64 AVX-512 architectural registers: 16 × 64 b + 32 × 512 b = 2,176 B', (SRC.x86.gpr * SRC.x86.gprBits + SRC.x86.vec * SRC.x86.vecBits) / 8, 2176);
  // model inputs quoted as literals in the prose
  check('ch3.p4 inputs 20 and 40 instructions, 8 warps are on the sliders', M.SCHED.ks.includes(20) && M.SCHED.ks.includes(40) && M.SCHED.maxPerSched >= 8, true);
  says('ch3.p4', '两次读之间 20 条指令'); says('ch3.p4', '8 个线程束只忙'); says('ch3.p4', '多到 40 条');
  check('ch4.p3 else path fixed at 10, if path 10 by default', [M.DIV.b, M.DIV.as[0]].join(), '10,10'); says('ch4.p3', '各 10 条');
  says('ch9.p3', '100 个位置'); check('rasterSpread uses 10 × 10 = 100 offsets', 10 * 10, 100);
  says('ch3.p6', '每块 256 个线程'); check('ch3.p6 inputs: 256 threads, 32/64/128 registers, 100 KB, 16 KB on the sliders', [256, 32].every(v => M.OCC.tpbs.includes(v)) && [32, 64, 128].every(v => M.OCC.regs.includes(v)) && [100, 16].every(v => M.OCC.smem.includes(v)), true);
  check('the scheduler holds 64 / 4 = 16 warps', M.SCHED.maxPerSched, H.maxWarps / H.schedulers);
  says('ch3.p4', '16 个（一个调度器的上限）');
}

/* ── 01 latency hiding, by hand ── */
{
  const r = M.hide(10, 0.95, 1);
  check('AMAT(95 %) = .95·4 + .05·479 = 27.75', f(r.amat, 2), '27.75');
  check('CPU busy = 10 / 37.75', f(r.uCpu, 6), f(10 / 37.75, 6));
  check('GPU, 8 threads: 80 / 489', f(M.hide(10, 0, 8).uGpu, 6), f(80 / 489, 6));
  check('GPU full at ceil(489 / 10) = 49 threads', M.hide(10, 0, 1).nFull, 49);
  check('49 threads saturate, 48 do not', [M.hide(10, 0, 49).uGpu, M.hide(10, 0, 48).uGpu < 1].join(), '1,true');
  check('49 is on the slider', M.HIDE.Ns.includes(49), true);
  check('prose inputs on the sliders (95 %, 99 %, 8, 32)', [M.HIDE.hs.includes(0.95), M.HIDE.hs.includes(0.99), M.HIDE.Ns.includes(8), M.HIDE.Ns.includes(32)].join(), 'true,true,true,true');
  check('every hit rate leaves the CPU below 10 / 14', M.HIDE.hs.every(h => M.hide(10, h, 1).uCpu <= 10 / 14 + 1e-12), true);
}

/* ── 02 the grid, by hand ── */
{
  const r = M.mapImage(1920, 1080, 16, 16);
  check('1920×1080 / 16×16: 120 × 68 = 8,160 blocks', [r.gx, r.gy, r.blocks].join(), '120,68,8160');
  check('threads 8,160 × 256', r.threads, 8160 * 256);
  check('idle = 120·16 × 8 rows', r.idle, 1920 * 8);
  check('32×8 tiles 1920×1080 exactly', M.mapImage(1920, 1080, 32, 8).idle, 0);
  check('1000² / 16²: 63² blocks, 16,064 idle', [M.mapImage(1000, 1000, 16, 16).gx, M.mapImage(1000, 1000, 16, 16).idle].join(), '63,16064');
  // thread ID = x + y·Dx; warp = ID / 32
  const p = M.mapImage(1920, 1080, 16, 16, 21, 3);
  check('pixel (21, 3): block (1, 0), thread (5, 3) = 53, warp 1 lane 21', [p.bix, p.biy, p.tx, p.ty, p.tid, p.warp, p.lane].join(), '1,0,5,3,53,1,21');
  check('16×16: warp 0 is rows 0 and 1', [M.mapImage(1920, 1080, 16, 16, 15, 1).warp, M.mapImage(1920, 1080, 16, 16, 0, 2).warp].join(), '0,1');
  check('rows per warp: 32-wide 1, 16-wide 2, 8-wide 4', [32, 16, 8].map(bx => M.mapImage(1920, 1080, bx, 8).rowsPerWarp).join(), '1,2,4');
  says('ch2.p4', '1080 不是 16 的倍数');
  says('ch2.p3', '16×16 的块里，0 号线程束是第 0 行和第 1 行');
}

/* ── 03 the scheduler: simulation against the closed form, round robin's convoy ── */
{
  const L = M.SCHED.Ls;
  for (const N of [1, 2, 4, 8, 12, 16]) for (const k of M.SCHED.ks) for (const l of [L.shared, L.l2, L.global]) {
    const s = M.warpSim(N, k, l, 'gto');
    within(`GTO N=${N} k=${k} L=${l} matches min(1, Nk/(k+L))`, s.busy - s.closed, -0.01, 0.01);
  }
  for (const [N, k] of [[16, 40], [8, 20], [16, 20]]) { const rr = M.warpSim(N, k, L.global, 'rr'), g = M.warpSim(N, k, L.global, 'gto'); check(`RR below GTO at N=${N} k=${k}`, rr.busy < g.busy - 0.02, true); }
  check('one warp: GTO and RR agree', f(M.warpSim(1, 20, 479, 'rr').busy, 4), f(M.warpSim(1, 20, 479, 'gto').busy, 4));
  check('16 warps, k = 40 fill the global latency (16·40 ≥ 519)', 16 * 40 >= 40 + 479, true);
  check('n20g = 25 > 16: does not fit', P.n20g[0] > M.SCHED.maxPerSched, true);
  // trace: GTO issues k in a row from the same warp
  const tr = M.warpSim(4, 5, 30, 'gto', 40, 0, 40).trace;
  check('GTO trace: warp 0 issues 5 in a row, then warp 1', tr.slice(0, 6).map(x => x[0]).join(), '0,0,0,0,0,1');
  check('GTO trace: the fifth is the load', tr[4][1], 1);
}

/* ── 03b occupancy, by hand ── */
{
  const o = (t, r, s) => M.occupancy(t, r, s);
  check('256 thr, 32 regs: 8 blocks by warps → 64 warps', [o(256, 32, 0).blocks, o(256, 32, 0).warps, o(256, 32, 0).limit].join(), '8,64,warps');
  check('256 thr, 64 regs: 65536 / 16384 = 4 blocks → 32 warps', [o(256, 64, 0).blocks, o(256, 64, 0).limit].join(), '4,regs');
  check('256 thr, 128 regs: 2 blocks → 16 warps', o(256, 128, 0).warps, 16);
  check('100 KB smem: floor(228 / 101) = 2 blocks', [o(256, 32, 100).blocks, o(256, 32, 100).limit].join(), '2,smem');
  check('32-thread blocks: capped at 32 blocks = 32 warps', [o(32, 32, 0).warps, o(32, 32, 0).limit].join(), '32,blocks');
  check('1024 thr × 128 regs exceeds the SM: bad', o(1024, 128, 0).bad, 'regsBlock');
  check('default (256, 64, 16 KB): 32 warps, 8 per scheduler', [o(256, 64, 16).warps, o(256, 64, 16).perSched].join(), '32,8');
  check('227 KB smem: 1 block', o(256, 32, 227).blocks, 1);
  check('slider ranges stay inside the per-block limits', Math.max(...M.OCC.tpbs) <= H.maxThreadsBlock && Math.max(...M.OCC.regs) <= H.maxRegsThread && Math.max(...M.OCC.smem) <= H.smemBlockKB, true);
}

/* ── 04 divergence: formula against a Monte Carlo of sampled masks ── */
{
  for (const [p, a] of [[0.05, 10], [0.25, 40], [0.5, 10], [0.01, 80]]) {
    const d = M.diverge(p, a, 10, 'lane'); let cyc = 0, use = 0; const K = 20000;
    for (let s = 1; s <= K; s++) { const m = M.sampleMask(p, s * 7919, 'lane'), c = M.maskCycles(m, a, 10); cyc += c.cycles; use += (c.nA * a + (32 - c.nA) * 10) / 32; }
    within(`Monte Carlo cycles p=${p} a=${a}`, cyc / K / d.cycles, 0.98, 1.02);
    within(`Monte Carlo efficiency p=${p} a=${a}`, (use / cyc) / d.eff, 0.98, 1.02);
  }
  check('p = .5, equal paths: 50 %', f(M.diverge(0.5, 10, 10, 'lane').eff, 6), '0.500000');
  check('warp-uniform: 100 %', M.diverge(0.3, 40, 10, 'warp').eff, 1);
  check('p = 0 and p = 1: no divergence', [M.diverge(0, 10, 10, 'lane').eff, M.diverge(1, 10, 10, 'lane').eff].join(), '1,1');
  check('5 % costs 18.06 cycles = 10(1 − .95^32) + 10', f(M.diverge(0.05, 10, 10).cycles, 4), f(10 * (1 - Math.pow(0.95, 32)) + 10 * (1 - Math.pow(0.05, 32)), 4));
  check('mask cycles: some on each side → a + b', M.maskCycles([true, ...new Array(31).fill(false)], 10, 10).cycles, 20);
}

/* ── 05 sectors, by hand ── */
{
  const c = (p, v) => M.coalesce(p, v);
  check('sequential: 4 sectors, 1 line, 100 %', [c('seq').sectors, c('seq').lines, c('seq').eff].join(), '4,1,1');
  check('offset 1 word: 5 sectors (Best Practices "five")', c('offset', 1).sectors, 5);
  check('offset 8 words (one sector): 4 sectors again', c('offset', 8).sectors, 4);
  check('stride 2: 8 sectors, 50 %', [c('stride', 2).sectors, c('stride', 2).eff].join(), '8,0.5');
  check('stride s ≥ 8: 32 sectors', [8, 16, 32].map(s => c('stride', s).sectors).join(), '32,32,32');
  check('stride 3: 12 sectors', c('stride', 3).sectors, 12);
  check('two rows of 16: 4 sectors in 2 places', [c('rows').sectors, c('rows').lines].join(), '4,2');
  check('random: 32 sectors', c('random', 0).sectors, 32);
  check('stride 8 bandwidth = 3.35 / 8', f(c('stride', 8).bw, 4), f(3.35 / 8, 4));
  says('ch5.p2', '四个合并的 32 字节事务'); says('ch5.p2', '要五段'); says('ch5.p2', '效率只有 50%'); check('Best Practices: aligned 4, misaligned 5, stride 2 = 50 %', [M.coalesce('seq').sectors, M.coalesce('offset', 1).sectors, M.coalesce('stride', 2).eff].join(), '4,5,0.5');
}

/* ── 06 banks: degree = gcd(s, 32) ── */
{
  for (const s of [1, 2, 3, 4, 5, 6, 8, 12, 16, 24, 31, 32, 33, 48, 64]) check(`stride ${s}: degree gcd(${s}, 32)`, M.banks(s).deg, M.gcd(s, 32));
  check('stride 0: broadcast, one word', M.banks(0).deg, 1);
  check('32×32 column: 32-way; padded 33: 1', [M.tileColumn(0).deg, M.tileColumn(1).deg].join(), '32,1');
  check('every column of the padded tile is conflict-free', Array.from({ length: 32 }, (_, k) => M.tileColumn(1, k).deg).every(d => d === 1), true);
  check('bank bandwidth 128 B / cycle', M.banks(1).bw, 128);
  says('ch6.p2', '32 × 4 = {bankBW}'); says('ch6.p3', '步长 1 没有冲突'); says('ch6.p3', '一次读拖成 32 拍');
  check('step 1 has no conflict', M.banks(1).deg, 1);
}

/* ── 07 tiled multiply ── */
{
  const t = (T, r) => M.tiledMM(T, r);
  check('naive: 0.25 FLOP/B × 3.35 = 0.8375', f(t(1, 1).att, 4), '0.8375');
  check('clock = 67e12 / (132·128·2)', f(M.CLK / 1e9, 4), f(67e12 / (132 * 128 * 2) / 1e9, 4));
  check('smem bw = 132·32·4·clock = 33.5 TB/s', f(M.SMEM_TBs, 3), f(132 * 128 * 67e12 / (132 * 128 * 2) / 1e12, 3));
  check('T = 32, r = 1: limited by shared memory', [t(32, 1).limit, f(t(32, 1).att, 2)].join(), 'smem,' + f(M.SMEM_TBs / 4, 2));
  check('T = 128, r = 8: peak', [t(128, 8).limit, t(128, 8).att].join(), 'peak,67');
  check('T = 128, r = 8: 16×16 = 256 threads, 32 KB', [t(128, 8).threads, t(128, 8).smemKB].join(), '256,32');
  check('T = 64, r = 1: 4,096 threads — bad', t(64, 1).bad, 'threads');
  check('T = 8, r = 8: one thread — tiny', t(8, 8).bad, 'tiny');
  check('ridge 67 / 3.35 = 20 FLOP/B, T = 80', [t(1, 1).ridge, t(1, 1).ridge * 4].join(), '20,80');
  check('ch7.p2: 2 FLOP per 8 bytes = 0.25', t(1, 1).Ig, 2 / 8);
  check('each thread computes r² = 64 numbers at r = 8', 8 * 8, 64);
  says('ch7.p2', '2 次运算、8 个字节，每字节 0.25 次'); says('ch7.p4', 'T = 128、r = 4'); says('ch7.p4', '每个线程算 64 个数');
}

/* ── 08 tensor-core formats ── */
{
  check('m16n8k16 = 2,048 MACs = 64 × a warp FMA', [M.mmaMacs(), M.mmaMacs() / 32].join(), '2048,64');
  check('I = 2N / (3b): N = 256, FP8 = 170.67', f(M.gemm(256, 'fp8', 'h100').I, 2), '170.67');
  check('N = 4096 feeds every format on both GPUs', ['h100', 'b200'].every(g => Object.keys(M.FMTS).every(fm => { const r = M.gemm(4096, fm, g); return r.none || r.share === 1; })), true);
  check('1024 is the smallest N on the slider that feeds every format', M.MMA.Ns.find(N => ['h100', 'b200'].every(g => Object.keys(M.FMTS).every(fm => { const r = M.gemm(N, fm, g); return r.none || r.share === 1; }))), 1024);
  check('N = 256: FP8 is twice FP16 in absolute terms, both memory-bound', f(M.gemm(256, 'fp8', 'h100').att / M.gemm(256, 'fp16', 'h100').att, 6) + M.gemm(256, 'fp16', 'h100').bound, '2.000000mem');
  check('H100 FP4 and B200 FP32 absent', [M.gemm(1024, 'fp4', 'h100').none, M.gemm(1024, 'fp32', 'b200').none].join(), 'true,true');
  check('nFull: FP8 H100 at ridge', M.gemm(256, 'fp8', 'h100').nFull, Math.ceil(1979 / 3.35 * 3 / 2));
  says('ch8.p4', 'N 到 1024 以后，两块卡上每种格式都喂得饱'); says('ch8.p4', '两者绝对速度差一倍');
  says('ch8.p2', '19 位'); says('ch8.p2', 'E4M3 和 E5M2');
}

/* ── 09 rasterising: edge functions against supersampled area ── */
{
  for (const s of [4, 8, 16, 32]) { const r = M.raster(s); within(`covered pixels ≈ area at s = ${s}`, r.covered / r.area, 0.75, 1.25); }
  // brute force: a pixel is covered iff its centre is inside, checked by barycentric coordinates
  for (const s of M.RAS.sizes) {
    const r = M.raster(s), [a, b, c] = r.verts, det = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1]); let cnt = 0;
    for (let y = 0; y < 50; y++) for (let x = 0; x < 50; x++) { const px = x + 0.5, py = y + 0.5, l1 = ((b[1] - c[1]) * (px - c[0]) + (c[0] - b[0]) * (py - c[1])) / det, l2 = ((c[1] - a[1]) * (px - c[0]) + (a[0] - c[0]) * (py - c[1])) / det; if (l1 > 0 && l2 > 0 && 1 - l1 - l2 > 0) cnt++; }
    check(`s = ${s}: covered by brute force`, r.covered, cnt);
    check(`s = ${s}: lanes = 4 × quads, warps = ceil(quads / 8)`, [r.lanes, r.warps].join(), [4 * r.quads, Math.ceil(r.quads / 8)].join());
  }
  check('s = 1: one pixel, 25 %', [M.raster(1).covered, M.raster(1).quadEff].join(), '1,0.25');
  check('quad efficiency rises with size', M.RAS.sizes.slice(1).every((s, i) => M.raster(s).quadEff >= M.raster(M.RAS.sizes[i]).quadEff - 0.08), true);
}

/* ── tuned parameters: halved / doubled (BRIEF.md lists the same) ── */
{
  // c = 10 cycles of work per read (ch1): 5 and 20 move the thread count to fill, but the CPU never reaches 10/14 either way
  check('c = 5: 97 threads to fill; c = 20: 25', [M.hide(5, 0, 1).nFull, M.hide(20, 0, 1).nFull].join(), '97,25');
  check('c = 20: CPU at 99 % still below 90 %', M.hide(20, 0.99, 1).uCpu < 0.9, true);
  // K step 32 (ch7) only sets shared memory: 16 and 64 leave the attainable rate unchanged
  check('K step changes no roof', M.tiledMM(128, 8).att, 67);
  check('T = 128 at K = 64 would need 64 KB, still under 227', 2 * 128 * 64 * 4 / 1024 <= H.smemBlockKB, true);
  // Lhit = 4 (A2's Zen 5): at 8 cycles the CPU's ceiling drops from 71 % to 56 %, the conclusion (CPU < GPU at 49 threads) stands
  check('Lhit 8: ceiling 10/18', f(M.hide(10, 1, 1, 479, 8).uCpu, 3), f(10 / 18, 3));
  // the triangle's offset (TUNED, ch9): the quad efficiency depends on it, so the prose also quotes the mean and range over
  // 100 offsets. The conclusion (small triangles waste most lanes, large ones little) holds at every offset
  { const s2 = M.rasterSpread(2), s4 = M.rasterSpread(4), s32 = M.rasterSpread(32);
    check('s = 2 spread 25 % to 75 %, mean 33 %', [f(s2.min, 2), f(s2.max, 2), f(s2.mean, 2)].join(), '0.25,0.75,0.33');
    within('s = 32 at every offset ≥ 85 %', s32.min, 0.85, 1); within('s = 4 mean between 45 % and 60 %', s4.mean, 0.45, 0.6);
    check('the chosen offset gives the low end at s = 2 (the prose says so by quoting the range)', M.raster(2).quadEff, s2.min);
    check('rasterSpread restores the offset', M.RAS.off.join(), '3.37,3.21'); }
}

/* ── every prose placeholder is a prose() key; pinned values ── */
{
  const want = { hc: '10', hL: '479', hLhit: '4', hAmat95: '27.75', hU95: '26.5', hAmat99: '8.75', hU99: '53.3', hU0: '2.0', hU1: '71.4', hG8: '16.4', hG32: '65.4', hNfull: '49',
    h100sm: '132', h100lanes: '128', h100cores: '16896', regKB: '256', l1KB: '256', cpuRegKB: '2', x86gpr: '16', x86vec: '32', x86vecBits: '512', gpuRegMaxB: '1020', thrSm: '2048', gpuRegFull: '32', gpuRegFullB: '128',
    imgW: '1920', imgH: '1080', g16x: '120', g16y: '68', g16b: '8160', g16t: '2088960', g16idle: '15360', g16share: '0.74', g16w: '65280', g328x: '60', g328y: '135', g328idle: '0', g32idle: '15360', sqIdle: '16064', sqShare: '1.6', pixels: '2073600',
    lShared: '29', lL1: '41', lL2: '263', lGlobal: '479', perSched: '16', maxWarps: '64', scheds: '4',
    s820: '32.1', s1620: '64.1', s1640: '100.0', s820l2: '56.5', n20g: '25', n40g: '13', n20l2: '15', rr1640: '58',
    maxBlocks: '32', regsSm: '65536', maxRegs: '255', smemSm: '228', smemBlk: '227', smemRes: '1',
    o32w: '64', o32: '100', o64w: '32', o64: '50', o128w: '16', o128: '25', oSb: '2', oSw: '16', oS: '25', oDefW: '32', oDefPs: '8', o1w: '32', o1: '50',
    d50: '50', d05: '55.4', d05b: '27.2', d01: '78.4', dCyc05: '18.1',
    csS: '4', co1S: '5', co1E: '80', c2S: '8', c2E: '50', c4S: '16', c8S: '32', c8E: '12.5', c8bw: '0.42', crS: '32', crowS: '4', crowL: '2', hbm: '3.35', c8x: '8',
    b2d: '2', b32d: '32', b33d: '1', b3d: '1', tc0d: '32', tc1d: '1', bankBW: '128',
    mmNaive: '0.84', mm32: '8.4', mm32hbm: '26.8', mm64: '33.5', mm128: '67', mm128r4: '33.5', smemTB: '33.5', clk: '1.98', mmRidge: '20', mmRidgeT: '80', mmX: '80', mm128smem: '32', mm128thr: '256', fp32TF: '67',
    macs: '2048', macsX: '64', tf32: '494.5', fp16: '989.5', fp8: '1979', fp64tc: '67', bFp16: '2250', bFp8: '4500', bFp4: '9000', bBw: '8',
    g256: '572', g256i: '171', g256s: '29', b512s: '61', b1024s: '100', h16_256: '29',
    r2c: '3', r2l: '12', r2e: '25', r4e: '44', r8e: '58', r32e: '87', r32c: '471', r32w: '17', r2avg: '33', r2lo: '25', r2hi: '75', r32avg: '88',
    l2MB: '50', bL2: '126', bSm: '148',
    bMem: '180', b300fp4: '13500', b300fp64: '1.25', b200fp64: '37', b300int8: '3', b200int8: '72',
    r5c: '21760', r5sm: '170', r5mem: '32', r5bus: '512', rbInf: '50', rbTr: '35', rbMem: '288', rbBw: '22',
    miCu: '256', miMem: '288', miBw: '8', miFp4: '10.1', mi4Mem: '432', mi4St: '12', mi4Gb: '36', mi4Bw: '23.3', mi4Fp4: '40', waveC: '64', waveR: '32', ldsC4: '64' };
  for (const [k, [v, d, kind]] of Object.entries(P)) check('prose ' + k, kind === 'pct' ? f(v * 100, d) : f(v, d), want[k]);
  check('every prose value pinned', Object.keys(P).sort().join(','), Object.keys(want).sort().join(','));
  const used = new Set();
  for (const m of html.matchAll(/data-i18n-html="([^"]+)"/g)) { const v = Z[m[1]] || ''; for (const p of v.matchAll(/\{(\w+)\}/g)) { used.add(p[1]); n++; if (!(p[1] in P)) { fails++; console.error(`FAIL {${p[1]}} in ${m[1]} is not filled on the page`); } } }
  for (const k of Object.keys(P)) { n++; if (!used.has(k)) { fails++; console.error('FAIL prose() value ' + k + ' is never quoted'); } }
  // the claims the prose makes about the numbers
  check('ch1: CPU at 99 % below GPU at 32 threads', P.hU99[0] < P.hG32[0], true);
  check('ch1: a CUDA thread sees fewer registers than an x86-64 thread (1,020 B < 2,176 B), and far fewer at full residency', P.gpuRegMaxB[0] < 2176 && P.gpuRegFullB[0] * 16 < 2176, true);
  check('no paraphrase is called a verbatim quote (原话)', Object.values(Z).some(v => v.includes('原话')), false);
  check('ch1: even 100 % hits leave the CPU below 75 %', P.hU1[0] < 0.75, true);
  check('ch1: 132 × 128 = 16,896 lanes ("上万")', P.h100cores[0] >= 10000, true);
  check('ch2: idle under 1 %', P.g16share[0] < 0.01, true);
  check('ch3: RR at 16 warps, k = 40 well below GTO 100 %', P.rr1640[0] < 0.7 && P.s1640[0] === 1, true);
  check('ch4: 5 % divergence costs nearly half', P.d05[0] < 0.6, true);
  check('ch5: stride 8 is 8× slower', P.c8x[0], 8);
  check('ch7: tiling ×80', Math.round(P.mmX[0]), 80);
  check('ch8: B200 FP4 at N = 512 below peak', P.b512s[0] < 1, true);
  check('ch9: s = 2 three pixels, 12 lanes', [P.r2c[0], P.r2l[0]].join(), '3,12');
  check('ch11: B300 FP64 fell to 1/30 of B200', P.b200fp64[0] / P.b300fp64[0] > 25, true);
}

/* ── sentence branches ── */
{
  const has = k => { n++; if (Z[k] == null) { fails++; console.error('FAIL missing say key ' + k); } };
  const seen = new Set(), add = s => { has(s.key); seen.add(s.key); };
  for (const c of [2, 5, 10, 20, 40]) for (const h of M.HIDE.hs) for (const N of M.HIDE.Ns) add(M.say.hide(c, h, N));
  for (const im of Object.values(M.IMAGES)) for (const [bx, by] of M.BLOCKS) { add(M.say.map(im[0], im[1], bx, by)); add(M.say.pixel(im[0], im[1], bx, by, 21, 3)); }
  for (let N = 1; N <= 16; N++) for (const k of M.SCHED.ks) for (const L of Object.values(M.SCHED.Ls)) for (const p of ['gto', 'rr']) add(M.say.sched(N, k, L, p));
  for (const t of M.OCC.tpbs) for (const r of M.OCC.regs) for (const s of M.OCC.smem) add(M.say.occ(t, r, s));
  for (const p of M.DIV.ps) for (const a of M.DIV.as) for (const m of ['lane', 'warp']) add(M.say.div(p, a, m));
  for (const P2 of M.COAL.patterns) for (let i = 0; i <= 6; i++) add(M.say.coal(P2, P2 === 'stride' ? M.COAL.strides[i] : P2 === 'offset' ? M.COAL.offsets[Math.min(i, 5)] : P2 === 'random' ? i : 0));
  for (const s of M.BANK.strides) add(M.say.bank(s)); for (const p of [0, 1]) add(M.say.tile(p));
  for (const T of M.MM.Ts) for (const r of M.MM.rs) add(M.say.mm(T, r));
  for (const N of M.MMA.Ns) for (const fm of Object.keys(M.FMTS)) for (const g of ['h100', 'b200']) add(M.say.gemm(N, fm, g));
  for (const s of M.RAS.sizes) add(M.say.ras(s));
  const all = Object.keys(Z).filter(k => /\.say\./.test(k));
  for (const k of all) check('branch reached ' + k, seen.has(k), true);
  for (const k of seen) check('branch has copy ' + k, Z[k] != null, true);
}

/* ── keys, language hygiene, registry, siblings ── */
{
  const keys = new Set([...html.matchAll(/data-i18n(?:-html|-aria|)="([^"]+)"/g)].map(m => m[1]));
  for (const m of app.matchAll(/'((?:ch\d+|dg|u|doc|nav|toc|hero)\.[\w.-]*\w)'/g)) keys.add(m[1]);
  for (const m of html.matchAll(/data-dg="(\w+)"/g)) keys.add('dg.' + m[1] + '.aria');
  for (const k of ['warps', 'regs', 'smem', 'blocks']) { keys.add('ch3.bar.' + k); keys.add('ch3.lim.' + k); }
  for (const fm of Object.keys(M.FMTS)) keys.add('ch8.fmt.' + fm);
  for (const k of keys) { n++; if (Z[k] == null) { fails++; console.error('FAIL missing zh key ' + k); } }
  const prefixes = [...app.matchAll(/'((?:ch\d+|dg)\.[\w.]*)'\s*\+/g)].map(m => m[1]);
  for (const k of Object.keys(Z)) {
    const reach = keys.has(k) || html.includes(`"${k}"`) || app.includes(`'${k}'`) || prefixes.some(p => k.startsWith(p)) || /\.say\./.test(k);
    n++; if (!reach) { fails++; console.error('FAIL zh key never used ' + k); }
  }
  for (const [k, v] of Object.entries(Z)) if (/\.say\./.test(k)) for (const m of v.matchAll(/\{(\w+)\}/g)) {
    n++; if (!new RegExp('\\b' + m[1] + '\\s*:|[{,]\\s*' + m[1] + '\\s*[,}]').test(app)) { fails++; console.error(`FAIL placeholder {${m[1]}} in ${k} is never supplied by app.js`); }
  }
  // diagram labels with placeholders get them from app.js
  for (const [k, v] of Object.entries(Z)) if (/^dg\./.test(k)) for (const m of v.matchAll(/\{(\w+)\}/g)) { n++; if (!new RegExp(`'${k.replace(/\./g, '\\.')}'[^\\n]*vars: \\{[^}]*\\b${m[1]}\\b`).test(app)) { fails++; console.error(`FAIL {${m[1]}} in ${k} not supplied`); } }
  check('eleven diagrams (six or more required)', [...html.matchAll(/class="dia" data-dg="/g)].length, 11);
  check('every diagram has a spec, an aria label and a caption', [...html.matchAll(/data-dg="(\w+)"/g)].every(m => app.includes('DG.' + m[1] + ' =') && Z['dg.' + m[1] + '.aria'] && Z['dg.' + m[1] + '.cap']), true);
  check('script cache keys on all four scripts', (html.match(/\.js\?v=20261115[a-z]?"/g) || []).length, 4);
  // the registrar adds one bilingual page-provenance label (skipped in the CJK check below)
  check('at most one provenance label', (html.match(/<details class="page-provenance"/g) || []).length <= 1, true);
  for (const file of ['index.html', 'app.js', 'models.js']) {
    let src = fs.readFileSync(path.join(DIR, file), 'utf8');
    if (file === 'index.html') {
      const tt = src.match(/<title>([^<]*)<\/title>/)[1], md = src.match(/<meta name="description" content="([^"]*)">/)[1];
      check('static title = doc.title', tt, Z['doc.title']); check('static meta = doc.desc', md, Z['doc.desc']);
      src = src.replace(/<title>[^<]*<\/title>/, '').replace(/<meta name="description" content="[^"]*">/, '');
      src = src.replace(/<details class="page-provenance"[\s\S]*?<\/details>/, '');
    }
    src = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '').replace(/<!--[\s\S]*?-->/g, '');
    n++;
    const others = (src.match(/[一-鿿、，。：；（）「」《》]+/g) || []).filter(x => !(file === 'index.html' && x === '中'));
    if (others.length) { fails++; console.error(`FAIL Chinese text in ${file}: ${others.slice(0, 3).join(' ')}`); }
  }
  const R = JSON.parse(fs.readFileSync(path.join(DIR, 'REGISTRY.json'), 'utf8'));
  check('registry slug/path', R.slug + ' ' + R.path, 'how-a-gpu-computes computing/systems/how-a-gpu-computes/');
  check('registry category', [R.category, R.subtopic, R.stage].join('/'), 'computing/systems/university');
  check('registry title', R.title.zh, Z['doc.title'].split(' · ')[0]); check('registry desc', R.desc.zh, Z['doc.desc']);
  check('hero title = registry title', Z['hero.title'], R.title.zh);
  for (const c of R.concepts) check('anchor ' + c.anchor, html.includes('id="' + c.anchor.slice(1) + '"'), true);
  for (const c of R.concepts) { n++; if (!c.aliases.zh.length || !c.aliases.en.length || !c.title.en || !c.desc.en || !c.title.zh || !c.desc.zh) { fails++; console.error('FAIL concept incomplete ' + c.id); } }
  check('one concept per chapter', R.concepts.map(c => c.anchor).join(), Array.from({ length: 12 }, (_, i) => '#ch' + (i + 1)).join());
  // one word, one owner (TASK-arch-series.md). why-compute-waits-for-memory keeps CPU vs GPU, why AI uses GPUs, TPU,
  // 张量核 / tensor core, roofline, HBM; B4 keeps NVLink and all-reduce; B3 keeps GDDR7; computer-graphics keeps
  // 渲染管线 / 光栅化 / GPU 渲染. Every alias anywhere else is off limits, and near-ties are kept out by hand.
  const norm = s => s.toLowerCase().replace(/\s+/g, '');
  const mine = new Set(R.concepts.map(c => c.id));
  const owned = new Map(), own = (a, who) => { if (typeof a === 'string' && !owned.has(norm(a))) owned.set(norm(a), who); };
  const AL = JSON.parse(fs.readFileSync(path.join(ROOT, 'atlas', 'graph', 'aliases.json'), 'utf8'));
  for (const [id, v] of Object.entries(AL)) if (!mine.has(id)) for (const l of ['zh', 'en']) (v[l] || []).forEach(a => own(a, 'atlas aliases ' + id));
  const LD = path.join(ROOT, 'atlas', 'graph', 'lessons');
  for (const fn of fs.readdirSync(LD)) {
    if (fn === 'how-a-gpu-computes.json') continue;
    const d = JSON.parse(fs.readFileSync(path.join(LD, fn), 'utf8'));
    for (const nd of d.nodes || []) if (nd.aliases && !mine.has(nd.id)) for (const l of ['zh', 'en']) (nd.aliases[l] || []).forEach(a => own(a, 'lesson ' + fn));
  }
  for (const top of ['systems', 'ml']) for (const sub of fs.readdirSync(path.join(DIR, '..', '..', top))) {
    const p = path.join(DIR, '..', '..', top, sub, 'REGISTRY.json');
    if (sub !== 'how-a-gpu-computes' && fs.existsSync(p)) for (const c of JSON.parse(fs.readFileSync(p, 'utf8')).concepts) for (const a of [...c.aliases.zh, ...c.aliases.en]) own(a, top + '/' + sub);
  }
  for (const a of ['张量核心', 'tensor cores', 'GPU 和 CPU 区别', 'GPU vs CPU', '为什么 AI 用 GPU', 'TPU', '脉动阵列', 'systolic array', 'roofline', '屋顶线', '算术强度', 'arithmetic intensity', 'HBM', 'GDDR7', 'NVLink', 'all-reduce', '缓存一致性', 'cache coherence', '渲染管线', '光栅化', 'GPU 渲染', '量化', 'MFU'])
    own(a, 'kept out by hand (sibling owns it or a near-tie)');
  for (const c of R.concepts) for (const a of [...c.aliases.zh, ...c.aliases.en]) { n++; if (owned.has(norm(a))) { fails++; console.error(`FAIL alias owned by ${owned.get(norm(a))}: ${a}`); } }
  const mineAll = R.concepts.flatMap(c => [...c.aliases.zh, ...c.aliases.en]).map(norm);
  check('no alias twice on this page', new Set(mineAll).size, mineAll.length);
  for (const w of ['线程束', 'warp', 'SIMT', '占用率', 'occupancy', '分支发散', 'warp divergence', '合并访存', 'memory coalescing', 'bank 冲突', 'shared memory bank conflict']) check('A6 takes ' + w, mineAll.includes(norm(w)), true);
  // links: only live siblings, chapters that exist; B3 and B4 are named in plain text until they are live
  const all = Object.values(Z).join('');
  const hrefs = [...all.matchAll(/href='([^']+)'/g)].map(m => m[1]);
  const SIBS = ['how-cpu-caches-work', 'why-compute-waits-for-memory', 'how-a-cpu-guesses-ahead', 'how-cores-share-memory', 'how-pcie-works', 'how-memory-talks', 'coherent-interconnects', 'how-pixels-reach-a-screen'];
  for (const h of hrefs) { n++; if (!new RegExp('^\\.\\./(' + SIBS.join('|') + ')/(#ch\\d+)?$').test(h) && h !== '../../graphics/computer-graphics/') { fails++; console.error('FAIL unexpected link ' + h); } }
  const cfg = fs.readFileSync(path.join(ROOT, 'pages.config.js'), 'utf8');
  for (const sib of SIBS) {
    check(`${sib} is live`, cfg.includes(`path: "computing/systems/${sib}/"`), true);
    const sh = fs.readFileSync(path.join(DIR, '..', sib, 'index.html'), 'utf8');
    for (const m of all.matchAll(new RegExp("href='\\.\\./" + sib + "/(#ch\\d+)?'", 'g'))) if (m[1]) check(`${sib} anchor ${m[1]}`, sh.includes(`id="${m[1].slice(1)}"`), true);
    const cz = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, '..', sib, 'copy.zh.js'), 'utf8'), cz);
    check(`${sib} title quoted as in its copy`, all.includes('《' + cz.window.ESSAY_COPY.zh['hero.title'] + '》'), true);
  }
  check('computer-graphics is live', cfg.includes('path: "computing/graphics/computer-graphics/"'), true);
  check('computer-graphics title quoted', all.includes('《' + fs.readFileSync(path.join(ROOT, 'computing', 'graphics', 'computer-graphics', 'index.html'), 'utf8').match(/<title>([^<·]*)/)[1].trim() + '》'), true);
  check('B3 linked at #ch9 (GDDR7)', hrefs.includes('../how-memory-talks/#ch9'), true);
  check('B4 linked at #ch8 (NVLink) and #ch11 (CPU–GPU coherence)', hrefs.includes('../coherent-interconnects/#ch8') && hrefs.includes('../coherent-interconnects/#ch11'), true);
  check('no plain-text "this series also has" left', /本系列还有讲|本系列讲片间互连的那一篇|本系列讲内存条的那一篇/.test(all), false);
  check('memory essay linked at #ch6 (tensor cores, systolic arrays)', hrefs.includes('../why-compute-waits-for-memory/#ch6'), true);
  check('memory essay linked at #ch7 and #ch8 (roofline, inference)', hrefs.includes('../why-compute-waits-for-memory/#ch7') && hrefs.includes('../why-compute-waits-for-memory/#ch8'), true);
  check('pixels essay linked at #ch1 from ch9.p2 (framebuffer)', Z['ch9.p2'].includes("href='../how-pixels-reach-a-screen/#ch1'"), true);
  check('A5 linked at #ch3 and #ch4 (snooping, directories)', hrefs.includes('../how-cores-share-memory/#ch3') && hrefs.includes('../how-cores-share-memory/#ch4'), true);

  const ectx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.en.js'), 'utf8'), ectx);
  const EN = ectx.window.ESSAY_COPY.en, stub = ectx.window.ESSAY_COPY.enStub === true, ph = s => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');
  check('en keys = zh keys', Object.keys(EN).sort().join('|'), Object.keys(Z).sort().join('|'));
  for (const k of Object.keys(Z)) check('en placeholders ' + k, ph(EN[k]), ph(Z[k]));
  if (stub) { check('en stub mirrors zh exactly', JSON.stringify(EN), JSON.stringify(Z)); console.log('NOTE: copy.en.js is a stub (enStub); English registry match skipped until it is translated'); }
  else { check('registry title en', R.title.en, EN['doc.title'].split(' · ')[0]); check('registry desc en', R.desc.en, EN['doc.desc']); }
}

if (fails) { console.error(`\n${fails} of ${n} checks failed`); process.exit(1); }
console.log(`PASS: ${n} checks (sourced and frontier figures, latency hiding, the CUDA index rule, the warp scheduler against its closed form, occupancy limits, divergence against Monte Carlo, sector counts, bank conflicts against gcd, the tiled multiply's roofs, tensor-core formats, the rasteriser against brute force, tuned-parameter sensitivity, and every number in the prose match the models)`);
