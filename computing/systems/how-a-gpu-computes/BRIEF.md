# BRIEF — GPU 是怎么算的 (How a GPU Computes)

Built-By: Claude Code (claude-opus-5-5)
Verified-By: self-check by builder (node model test, browser test zh at 1280/390/320 and reduced motion, canvas sweep, screenshots of every model and diagram at three widths); Claude Code (claude-opus-5-5), independent review 2026-11-15: every prose claim in zh and en against models.js and tests/models.cjs, H100 limits against the Hopper Tuning Guide, CUDA Guide divergence / warp-switch / scope wording and Best Practices coalescing / bank wording re-opened, Rubin sparsity, Volkov 2010 talk; English copy edited; browser test zh+en (incl. reduced motion), canvas sweep zh+en at three widths; screenshots viewed: all diagrams at zh 1280/320 and en 1280/390, models at zh 320 and en 390/1280, a subset elsewhere (specs/reviews/how-a-gpu-computes-review-20261115.md)
Category: computing 计算机 / subtopic systems 系统 · Stage: university
Series: computer architecture series A6 (`specs/essay-briefs/TASK-arch-series.md`)
Format: long interactive essay; `copy.zh.js` written by the builder, `copy.en.js` translated (Haiku) and edited by the reviewer; same keys
Files: index.html, copy.zh.js, copy.en.js, models.js, app.js, REGISTRY.json, tests/models.cjs, tests/browser.cjs

## The one question

一块 GPU 有上万个「核」，每个都比 CPU 的核笨得多。它是怎么把一张图、一次矩阵乘法拆给这么多笨核同时做的？为什么同一段代码，写法稍微一变，GPU 上能慢好几倍？

(The task wrote 慢十倍. The page says 好几倍 because the models give ×2 to ×8 for one cause (divergence ×2–4, stride ×8, bank conflict up to ×32 on shared memory only) and ×80 for tiling against no tiling; "ten times" for one small change would need a cause the page does not model.)

## Changes from the ladder (TASK file)

- Twelve chapters. Warp scheduling and occupancy are one chapter (ch3) with two models: the scheduler first, then what caps the warps it can hold; a button carries the occupancy result into the scheduler.
- ch1 is not a die-area model. It puts AMAT (Hennessy & Patterson) against Little's law for one load-then-compute loop; the die-area picture is a schematic diagram. (An area model would need a published area split I did not open.)
- ch7's model is TFLOPS against tile size **and** per-thread register block, with two roofs (HBM and shared memory) on the H100's FP32 CUDA cores; one roof alone hides why T = 32 with r = 1 is still slow.
- ch8 adds the matrix size: each format's peak against a square GEMM's roofline on H100 and B200, so "narrower format = faster" is shown with its condition.
- ch9 (graphics) has a model: a triangle rasterised into 2×2 quads and 32-lane warps.
- ch10 (memory system, no coherence) has no model, one diagram.

## Chapters, models, published results, tuned parameters

| # | Chapter | Model | Standard result implemented |
|---|---|---|---|
| 1 | 两种花晶体管的办法 | one thread with a cache vs N threads without | AMAT = h·Lhit + (1−h)·L; busy = c/(c+AMAT); GPU busy = min(1, N·c/(c+L)) (Little's law) |
| 2 | 一张图怎么拆给两百万个线程 | image → grid → block → warp → lane | CUDA thread ID = x + y·Dx; warps of 32 consecutive IDs (Programming Guide) |
| 3 | 线程束调度与占用率 | cycle-by-cycle scheduler; H100 occupancy | GTO steady state = min(1, Nk/(k+L)) (tested ±1 %); round robin's convoy (Narasiman 2011); CC 9.0 limits |
| 4 | 一个线程束走了两条路 | if/else with an active mask | E[cycles] = a(1−(1−p)^32) + b(1−p^32); Monte Carlo agrees within 2 % |
| 5 | 32 个地址，几次读 | 32 addresses → 32-byte sectors | Best Practices: 4 sectors aligned, 5 misaligned, stride 2 = 50 % |
| 6 | 共享内存的 32 个 bank | stride → conflict degree; 32×32 tile ± padding | degree = gcd(s, 32); padding to 33 removes it (Best Practices) |
| 7 | 分块矩阵乘法 | two-level roofline on H100 FP32 | I_global = T/4, I_shared = r/4 FLOP/B (Williams et al. 2009 roofline, one roof per level) |
| 8 | 张量核心与数字格式 | peak by format vs GEMM roofline | m16n8k16 = 2,048 MACs; I = 2N/(3b) |
| 9 | 画一帧画面也是这台机器 | triangle → pixels → quads → warps | edge functions at pixel centres (Pineda 1988); 2×2 quad shading (helper lanes) |
| 10 | GPU 的存储层次，和不做的一致性 | — | scoped fences, atomics at L2, launch boundaries (CUDA memory model) |
| 11 | 前沿在哪（2026 年 11 月） | — | dated, sourced, marked established / claimed |
| 12 | 收尾 | — | — |

Tuned (marked on the page as 调出来的参数 where they appear):
- ch1 c = 10 cycles of work per load; Lhit = 4 (Zen 5 L1, from A2); L = 479 (Luo, rounded). Halving c to 5 needs 97 threads, doubling to 20 needs 25; the CPU at 99 % hits stays below 90 % either way (pinned).
- ch3 scheduler presets are Luo's latencies rounded (29 / 41 / 263 / 479); run length 40,000 cycles, first 8,000 discarded.
- ch7 K step 32: sets shared memory per block (2·T·32·4 B) only, no roof moves (pinned).
- ch9 triangle shape and offset (3.37, 3.21). The quad efficiency depends on the offset: over 100 sub-pixel offsets a 2-pixel triangle ranges 25 %–75 % (mean 33 %), a 32-pixel one 86 %–90 % (mean 88 %). The chosen offset gives the low end at size 2, so the prose quotes the range and mean as well (pinned).
- ch8 B200 per-GPU figures are the HGX 8-GPU figures ÷ 8; H100 and B200 tensor figures are the "with sparsity" values ÷ 2.

## Diagrams (STANDARD §4a, inline SVG from app.js, labels from copy, layout 'n' under 600 px)

1. `die` CPU core vs one SM: where the area goes (schematic, not to scale)
2. `hier` grid → 16×16 block → 8 warps → thread; ID = x + y·16
3. `sm` one Hopper SM: 4 partitions (scheduler, 64 KB RF, 32 FP32 lanes, tensor core, LD/ST), 256 KB L1/shared (numbers from the tuning guide; partition breakdown from the Hopper blog figure)
4. `tl` four warps hiding a load: issue vs wait, the scheduler row (schematic; drawn by the same greedy rule as the model)
5. `mask` the active mask through cond / if / else / join (mask hand-drawn, captioned)
6. `coal` 8 threads, stride 1 vs 2, 32-byte segments (scaled-down, captioned)
7. `banks` 8 threads × 8 banks, stride 1 vs 2 (scaled-down, captioned; real is 32)
8. `tile` A strip × B strip → C tile; HBM → shared → registers
9. `mma` m16n8k16: 16×16 × 16×8, one warp, 2,048 multiply-adds
10. `pipe` vertex data → VS → raster → FS → ROP → framebuffer; 2×2 quads, 8 per warp
11. `mem` SMs with RF and L1/shared, crossbar, L2 halves, DRAM; "no coherence between L1s"

## Sources (each opened by me on 2026-11-15 unless marked)

- NVIDIA CUDA Programming Guide v13.5 (last updated 2026-10-31): https://docs.nvidia.com/cuda/cuda-programming-guide/01-introduction/programming-model.html , …/03-advanced/advanced-kernel-programming.html , …/05-appendices/compute-capabilities.html ; also the 12.6 archive for the SIMT section: https://docs.nvidia.com/cuda/archive/12.6.0/cuda-c-programming-guide/index.html — warp of 32, 1024 threads per block, thread ID x + y·Dx, divergence executes each path with lanes disabled, no cost to switch warps, Volta independent thread scheduling.
- NVIDIA CUDA C++ Best Practices Guide: https://docs.nvidia.com/cuda/cuda-c-best-practices-guide/index.html — 32-byte transactions, "four 32-byte transactions", misaligned five, stride 2 = 50 %; 32 banks of 32 bits per clock, broadcast, w+1 padding.
- NVIDIA Hopper Tuning Guide: https://docs.nvidia.com/cuda/hopper-tuning-guide/index.html — 64 warps / 32 blocks / 64K registers / 255 per thread / 228 KB smem per SM / 227 KB per block / 1 KB reserved / 256 KB L1+shared / 50 MB L2.
- NVIDIA Hopper architecture in depth (blog): https://developer.nvidia.com/blog/nvidia-hopper-architecture-in-depth/ — 132 SMs (H100 SXM5), 128 FP32 + 4 tensor cores per SM, 256 KB register file. The whitepaper link (https://resources.nvidia.com/en-us-tensor-core/gtc22-whitepaper-hopper) redirected to a form; not read.
- NVIDIA H100 page: https://www.nvidia.com/en-us/data-center/h100/ — FP32 67, FP64 TC 67, TF32 989*, FP16 1,979*, FP8 3,958* (*with sparsity), 80 GB, 3.35 TB/s (SXM).
- NVIDIA DGX B200: https://www.nvidia.com/en-us/data-center/dgx-b200/ — 8 GPUs, 1,440 GB, 64 TB/s. NVIDIA HGX: https://www.nvidia.com/en-us/data-center/hgx/ — B200 and B300 8-GPU columns (FP4 72 / 108 PF dense, FP8 72, FP16 36, TF32 18 sparse, FP64 296 / 10 TF, INT8 72 / 3 POPS) and Rubin per GPU (NVFP4 50 inference / 35 training PF, 288 GB HBM4, 22 TB/s, "ramping into full production").
- Chips and Cheese, "Nvidia's B200: Keeping the CUDA Juggernaut Rolling" (2025-12-15): https://old.chipsandcheese.com/?p=37649 — 148 SMs (74 per die), 126 MB L2 in two halves.
- Luo et al., "Benchmarking and Dissecting the Nvidia Hopper GPU Architecture", arXiv 2402.13499 (2024-02-21): https://arxiv.org/html/2402.13499 — Table IV H800 latencies (cycles): shared 29.0, L1 40.7, L2 263.0, global 478.8.
- Volkov, "Understanding Latency Hiding on GPUs", UCB/EECS-2016-143 (2016-08-12): https://www2.eecs.berkeley.edu/Pubs/TechRpts/2016/EECS-2016-143.html — title, date and abstract (ILP as well as warps hide latency). The PDF did not parse; no number on the page comes from it.
- AMD HIP docs, hardware implementation: https://rocm.docs.amd.com/projects/HIP/en/latest/understand/hardware_implementation.html — wavefront 64 (CDNA) / 32 (RDNA); LDS 32 banks (CDNA 1–3), 64 (CDNA 4, RDNA 2–4).
- AMD ROCm release notes: https://rocm.docs.amd.com/en/docs-7.2.4/about/release-notes.html (7.2.4, 2026-05-29), https://rocm.docs.amd.com/en/docs-7.14.1/about/release-notes.html (7.14.1 preview, 2026-09-02).
- NVIDIA RTX 5090: https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/ — 21,760 CUDA cores, 32 GB GDDR7, 512-bit.
- ServeTheHome, "AMD Instinct MI455X Deep Dive" (2026-08-12): https://www.servethehome.com/amd-instinct-mi455x-deep-dive-cdna-5-marks-the-next-era-of-instinct/ — 432 GB HBM4 (12 × 36 GB), ~23.3 TB/s, "a bit over 40 PFLOPS" dense FP4, N2 compute dies, 32-wide SIMD.
- Tom's Hardware on MI355X (June 2025, press): https://www.tomshardware.com/tech-industry/artificial-intelligence/amd-reveals-core-specs-for-instinct-mi355x-cdna4-ai-accelerator-slated-for-shipping-in-the-second-half-of-2025 — 256 CUs, 288 GB, 8 TB/s, ~10 PF FP4. AMD's own page (https://www.amd.com/en/products/accelerators/instinct/mi350/mi355x.html) timed out twice.

## Not verified from a primary source

- The four-partition breakdown of the SM in diagram `sm` (blog figure, not the whitepaper text; the caption now names the blog).
- Hennessy & Patterson ch. 4 was not opened; AMAT is the textbook formula as used in A2.
- Narasiman et al. MICRO 2011 (two-level warp scheduling), Fatahalian et al. 2010 (quad fragment merging), Pineda 1988 (edge functions), Williams–Waterman–Patterson 2009 (roofline), the 2006 unified-shader date: cited from memory, papers not opened.
- MI355X figures (press, AMD page and brochure PDF timed out again in review; third-party spec sites agree on 256 CU / 288 GB / 8 TB/s / ~10.1 PF FP4 dense).
- "Atomics on device memory are carried out in L2": not found in the CUDA Guide (reviewer checked the advanced-kernel-programming page, which lists L2 as the point of coherence for device scope, now cited on the page beside the claim). The atomic-at-L2 statement is from NVIDIA architecture whitepapers (Fermi onward), not reopened.
- Volta "one path per cycle" under independent thread scheduling: the reviewer found only "independent thread scheduling allows full concurrency between threads, regardless of warp" in the 13.5 Guide; the one-path-per-cycle statement is from the Volta whitepaper ("same instruction for all active threads"), not reopened.
- Rubin "NVFP4 inference 50 PF": NVIDIA's Rubin architecture blog (opened in review) gives "up to 50 petaflops of NVFP4" with no sparsity label; a search summary says Tom's Hardware and Guru3D call it sparse, but neither article loaded (truncated / 403). The page says only that some press reports list it as sparse.
- "读离自己远的那一半 L2 要慢一些": qualitative only; no number given.
- wgmma = four warps (a warpgroup), B from shared memory and A from registers or shared memory: PTX ISA §9.7.17, the page was too long to load in review; from memory.
- ch3.limit now cites Volkov's GTC 2010 talk "Better Performance at Lower Occupancy" (2010-09-22); its slide text was seen through a search summary (fallacy that multithreading is the only way to hide latency; CUFFT at 2× lower occupancy, 2× faster), slides not opened directly.
- ch1.p2 register comparison, fixed in review to compare like with like: x86-64 architectural ~2 KB (16 × 8 B + 32 × 64 B, AVX-512) against a CUDA thread's architectural maximum 255 × 4 B = 1,020 B and 32 registers = 128 B per thread at full residency (65,536 / 2,048); all pinned. The 256 KB file is described as holding thousands of threads. CPU physical register files are explicitly left out.

## Facts that will go stale

ch11 throughout (dated in the text: CUDA 13.5 of 2026-10-31, ROCm 7.2.4 / 7.14.1, Rubin "in full production" as of 2026-11-15, MI455X claims of 2026-08-12, B300 HGX figures), and the ch8 B200 per-GPU peaks.

## Checked / not checked

Review (2026-11-15, Claude Code claude-opus-5-5): H100 CC 9.0 limits (64 warps, 32 blocks, 64K registers, 255 per thread, 228 / 227 / 1 KB, 256 KB L1+shared, 50 MB L2) re-read in the Hopper Tuning Guide; CUDA Guide 13.5 wording for divergence ("executes each branch path taken, disabling threads…", "full efficiency is realized when all 32 threads…") and warp switching ("switching between warps incurs no cost") re-read; Best Practices wording for 4 / 5 sectors, stride 2 = 50 %, banks of 32 bits per clock, broadcast, serialisation re-read. By hand: the closed forms for ch3 (32.1 %, 64.1 %, 25 / 13 / 15 warps), ch4 (55.4 %, 27.2 %, 78.4 %), ch7 (0.84, 8.4, 33.5, 67 TFLOPS, ridge 20 → T = 80), ch8 (dense H100 494.5 / 989.5 / 1,979; B200 2,250 / 4,500 / 9,000; N = 256 FP8 572 TFLOPS) and one ch9 triangle (s = 4, 7 pixels) agree with the models.

- Checked: every prose number comes from `prose()` and is pinned; literals in the prose (478.8, 132 × 32 × 4, 67 ÷ 132 ÷ 128 ÷ 2, 80 GB, the Best Practices quotes, the bar labels 64 / 65536 / 228 KB / 32, dates) are checked against `SRC`; the scheduler simulation against its closed form on 90 cases; divergence against 20,000 sampled warps; bank degree against gcd for 15 strides; rasteriser against a brute-force barycentric test for every slider size.
- Not checked: allocation granularity in occupancy (registers per warp in 256s, shared memory in granules) is left out and the page says so; real kernels hit L1/L2 on repeated reads, which the coalescing and tiling models ignore (said on the page).

## For the translator

All keys in `copy.zh.js`; `copy.en.js` mirrors it (translated, then edited in review). Units are in `u.*`; the `ch2.code` CUDA snippet should stay code. Sibling titles in English must match each sibling's `copy.en.js` `hero.title`. Keep 线程束 → warp, 线程块 → thread block, 占用率 → occupancy, 合并访存 → memory coalescing, 分支发散 → branch divergence.

## Registrar notes

- zh title: GPU 是怎么算的 · en title: How a GPU Computes. Category computing / systems, stage university.
- One line: 一块 GPU 有上万个「核」，每个都比 CPU 的核笨得多：它怎么把一张图、一次矩阵乘法拆给它们，为什么写法一变就慢好几倍。
- No provenance label added. Script keys `?v=20261115`.
- Aliases avoided by hand (near-ties of words siblings own): 张量核心 / tensor cores (why-compute-waits-for-memory owns 张量核 / tensor core), 渲染管线 / 光栅化 / GPU 渲染 (computer-graphics), roofline / 屋顶线 / 算术强度, HBM, GDDR7, NVLink, all-reduce, 缓存一致性, 量化 / MFU. Near-tie kept: "GPU cache coherence" (A5 owns "cache coherence"); drop it if the search sends it to the wrong page. Review changed REGISTRY.json aliases: 像素着色器 / pixel shader → 像素着色怎么上 SM / quad shading (rendering-pipeline words belong to computer-graphics); TF32 是什么, BF16 和 FP16 区别 / TF32 format → mma.sync m16n8k16, wgmma 指令 / m16n8k16 (the page only names the formats, it does not explain them); CUDA ROCm Triton / CUDA vs ROCm → GPU 代码为什么慢 / why is my GPU code slow (the page does not compare vendors).
- Links: memory essay #ch3 #ch4 #ch6 #ch7 #ch8 #ch9 and top; A2 #ch1; A4 #ch9; A5 #ch3 #ch4; B1 top; B3 #ch9; B4 #ch8 #ch11 and top; computer-graphics top. B3 and B4 went live while this page was built; they are linked (tests check each is live in pages.config.js).
- Prerequisites the site lacks: an essay on the CPU pipeline / SIMD vector units (the page contrasts against "one wide vector" without a sibling to link), and one on floating-point formats (FP8 / FP4 exponents and mantissas are only named).
