# BRIEF · why-compute-waits-for-memory 为什么计算一直在等内存

- Author: Antigravity (gemini-4-hydrogen)
- Built-By: Antigravity (gemini-4-hydrogen), Wave 2 Batch 1 deep essay (2026-11-13)
- Verified-By: Antigravity (gemini-4-hydrogen) — independent review of zh & en prose, models.js vs 7 hardware spot-checks, 1280/390/320 layout & canvas sweeps, reduced motion, and keyboard access
- category `computing`, subtopic `systems`, stage `university`

## The Essay's One Question

**为什么一台每秒能算上千万亿次的处理器，运行起来却常常大部分时间都在原地干等？**
（Why does a processor capable of quadrillions of operations per second spend most of its time sitting idle waiting?）

Every chapter builds one rung of the answer: physical latency and energy cost of moving bits, the widening divergence between compute FLOP/s and memory bandwidth, and how hardware/software trade concurrency and reuse to hide or reduce data movement.

## Chapter Ladder & Models

1. **`#ch1` 流水线上的气泡 / Pipeline Stalls** — Links `../switches-that-compute/#ch9`.
   - **Law**: 5-stage pipeline retires 1 instruction/cycle when fed, but a memory-latency RAW dependency stalls downstream stages with bubbles.
   - **Model**: Cycle-accurate 5-stage RISC pipeline (`IF, ID, EX, MEM, WB`) executing a 6-instruction loop (`LD -> ADD -> MUL -> ADD -> CMP -> BNE`). Controls: memory latency (`1, 12, 40, 200` cycles), forwarding toggle, step / play / reset.
   - **Pinned claims**: L1 hit (1 cyc, fwd ON) = `11` cyc (`9.1%` wait); fwd OFF = `18` cyc; DRAM miss (200 cyc) = `210` cyc (`200` stall cyc, `95.2%` waiting).
   - **Limits**: Single-issue in-order educational pipeline (Hennessy & Patterson); ignores OoO execution windows and hardware prefetchers.

2. **`#ch2` 内存远在天边：延迟阶梯与缓存命中 / Memory Latency Hierarchy & Cache Simulator**
   - **Law**: Arithmetic takes < 1 ns while DRAM takes tens of ns; hardware fetches whole cache lines, so contiguous strides use every byte while strided access wastes bandwidth.
   - **Model 2a**: Latency ladder (`1, 4, 15, 80, 70000 ns`) scaled to human time (`1 cycle = 0.3 ns -> 1 s`), log vs linear toggle.
   - **Model 2b**: Real LRU set-associative cache simulator (`512/1024/2048 B`, `16/32/64 B` line, `1/2/4`-way) fed row-major vs column-major address traces on a `16×16` Float64 (`2,048 B`) matrix, plus an in-page median-of-7 `Float64Array` (`512×512`) browser timing ratio button.
   - **Pinned claims**: L1 `1 ns` (`3.3 s`), L2 `4 ns` (`13.3 s`), DRAM `80 ns` (`4.4 min`), SSD `70,000 ns` (`2.7 days`); 1 KB direct-mapped 64 B-line cache: row-major `32` misses (`12.5%`, `2,048 B`) vs col-major `256` misses (`100.0%`, `16,384 B`, `8×` traffic).
   - **Limits**: Real CPUs use stride prefetchers and browser JIT adds bounds checks; only relative ratio is shown for live browser run.

3. **`#ch3` 局部性与分块 / Locality & Tiling**
   - **Law**: Identical `O(N^3)` arithmetic counts differ by nearly an order of magnitude in slow-memory traffic depending on reuse inside cache.
   - **Model**: `24×24` Float64 matrix multiply (`27,648` FLOPs) traced through a `2 KB`, 4-way LRU, `64 B`-line cache comparing `i-j-k`, `i-k-j`, and tiled `B ∈ {2, 4, 8, 12, 16, 24}`.
   - **Pinned claims**: `i-j-k` = `4,035` misses (`258,240 B`, `0.11` FLOP/B); `i-k-j` = `1,872` misses; optimal `B = 8` (`1,536 B ≤ 2,048 B`) = `534` misses (`34,176 B`, `0.81` FLOP/B, `7.6×` fewer misses than `ijk`); oversized `B = 12` (`3,456 B > 2,048 B`) jumps back to `1,145` misses.
   - **Limits**: Real BLAS libraries pack tiles into contiguous buffers and use multi-level register/L1/L2 blocking (Goto & van de Geijn 2008).

4. **`#ch4` 内存墙与利特尔法则 / The Memory Wall & Little's Law**
   - **Law**: Small miss rates multiplied by high miss penalties crush effective CPI; saturating high bandwidth requires `Bandwidth × Latency` bytes simultaneously in flight.
   - **Model**: Wulf & McKee AMAT/CPI (`baseCPI = 1`, `memShare = 0.3`, `missPenalty = 250` cycles) + Little's Law (`3,350 GB/s`, `128 B` request, `40–120 ns` latency, `16–2400` in-flight requests).
   - **Pinned claims**: `2%` miss rate → effective CPI `2.50`, compute utilization `40.0%`; `10%` miss rate → `11.8%`. At `80 ns` and `3,350 GB/s`, bus needs `268 KB` (`2,094` concurrent 128 B requests); `32` requests yield only `51.2 GB/s` (`1.5%`).
   - **Limits**: Assumes independent non-blocking requests; pointer-chasing workloads cannot generate high concurrency.

5. **`#ch5` 堆核心为什么不够 / Multicore, Amdahl, Gustafson & Shared Bus** — Links `../../../tech/semiconductors/why-chips-are-hard/#ch4`.
   - **Law**: After Dennard scaling stalled, adding cores hits serial fractions (Amdahl) and shared memory-bus saturation.
   - **Model**: Amdahl `1 / ((1-f) + f/P)`, Gustafson `(1-f) + f*P`, and memory-bus ceiling `busCapGBs / bwPerCoreGBs` (`192 GB/s ÷ 12 GB/s = 16×`).
   - **Pinned claims**: At `f = 95%`, `P = 64`: Amdahl `15.4×`, Gustafson `60.8×`; at `f = 99%`, `P = 64`: Amdahl `39.3×` but shared bus caps actual speedup at `16×`.
   - **Limits**: Ignores NUMA/cache-coherence traffic, which bends real scaling curves earlier.

6. **`#ch6` 从单核到脉动阵列 / SIMD, GPUs & Systolic Arrays**
   - **Law**: GPUs/TPUs trade single-thread latency for massive thread concurrency and systolic on-chip data reuse.
   - **Model**: Animated weight-stationary `k×k` (`2, 4, 8`) systolic grid + dense linear layer `(M×4096)×(4096×4096)` calculator (`M = 1..1024`, BF16/FP8/INT4).
   - **Pinned claims**: `8×8` systolic array = `64` MAC/cycle (`128` FLOP/cycle), `8` FLOP/elem steady-state reuse; `4096×4096` BF16 layer moves from `1.00 FLOP/B` at `M = 1` to `409.6 FLOP/B` at `M = 512`.
   - **Limits**: Assumes one DRAM pass for X, W, Y without kernel fusion; real TPUs use larger arrays (e.g. 128×128+).

7. **`#ch7` 屋顶线模型 / The Roofline Model**
   - **Law**: Attainable performance is `min(peak FLOP/s, bandwidth × I)` with ridge point `I* = peak / bandwidth`.
   - **Model**: Log-log Roofline comparing AMD EPYC 9654 (FP32), NVIDIA H100 SXM (BF16), NVIDIA B200 (BF16), Google TPU v7 Ironwood (BF16) across 5 workloads + custom `I`.
   - **Pinned claims**: Ridge points `I*`: EPYC 9654 `12.4`, H100 `295.4`, B200 `281.3`, Ironwood `312.6 FLOP/B`. At `decode1` (`I = 1.0`), H100 achieves `3.35 TFLOPS` (`99.7%` of Tensor Core capacity idle).
   - **Limits**: Physical upper bound; excludes launch/sync overheads and real MFU losses.

8. **`#ch8` 为什么大模型推理一直在等内存 / LLM Inference Roofline** — Links `../../ml/what-a-frontier-model-takes/#ch8`.
   - **Law**: Autoregressive decode reads all active weights + KV cache per step; batch=1 is ~1 FLOP/B bandwidth-bound.
   - **Model**: Exact Roofline + GQA-8 KV cache capacity/traffic model for `8B` and `70B` across BF16/FP8/INT4 on `1× H100` / `1× B200`, `B = 1..128`, `ctx = 512..65536`.
   - **Pinned claims**: `8B` BF16, `B = 1`, `ctx = 2048` on H100: weights `16.06 GB`, KV `0.27 GB`, total `16.33 GB`, `205 tok/s`, `I = 1.05 FLOP/B`, `0.36%` compute util; `INT4` shrinks weights to `4.01 GB` → `782 tok/s` (`3.8×`); `70B` BF16 (`141.2 GB` weights) exceeds 80 GB H100 VRAM.
   - **Limits**: Single-GPU HBM upper bound; excludes KV cache quantization, PagedAttention fragmentation, and multi-GPU AllReduce.

9. **`#ch9` 搬运一个比特的能量账单与互联阶梯 / Energy & Interconnects**
   - **Law**: Off-chip DRAM data movement costs hundreds of times more energy than FP arithmetic; HBM shortens wires onto a wide silicon interposer.
   - **Model**: Horowitz (ISSCC 2014, 45nm) energy breakdown per FP16 MAC (`1.5 pJ`) vs `640 pJ/32b` DRAM (`320 pJ / reuse` per 2 B weight), `100 pJ` 1 MB SRAM, `5 pJ` 8 KB SRAM, plus interconnect ladder (`8,000` down to `100 GB/s`).
   - **Pinned claims**: Unreused DRAM read: `320 pJ` move vs `1.5 pJ` compute (`99.5%` move, `213×`); `reuse = 256` drops move to `1.25 pJ` (`45.5%`). Interconnects: HBM3e `8,000`, NVLink 5 `1,800`, PCIe 5.0 x16 bidir `128`, 800G Ethernet `100 GB/s`.
   - **Limits**: Horowitz absolute pJ numbers are 45nm CMOS; relative wire-to-compute gap persists/widens at 4nm/3nm.

10. **`#ch10` 前沿在哪里（截至 2026 年 11 月）/ Where the Frontier Is (Nov 2026)**
    - **Law**: Late-2026 accelerators push toward 2048-bit HBM4 and co-packaged optics, while thermal density, packaging yield, and software stacks remain open limits.
    - **Model**: Interactive comparison of `EPYC 9654`, `H100`, `MI300X`, `H200`, `B200`, `TPU v7 Ironwood`, `MI355X`, and `Rubin (vendor spec)` across bandwidth, capacity, and ridge point.
    - **Pinned claims**: JEDEC `JESD270-4` (2025-04) `2,048-bit`, `2.0 TB/s/stack` baseline (`2.5–3.3 TB/s` vendor samples); Rubin spec `288 GB HBM4`, `19.2 TB/s`.

11. **`#ch11` 四个诊断问题 / Four Questions Checklist** — Actionable checklist + `.sum` + links to `switches-that-compute`, `why-chips-are-hard`, `what-a-frontier-model-takes`, `how-a-chatbot-writes`.

## Sourced Real-World Figures (Verified 2026-11-13)

- **Memory Latency Hierarchy**: L1 ~1 ns, L2 ~4 ns, L3 ~15 ns, DRAM 60–100 ns (80 ns representative), NVMe SSD ~50–100 μs (70 μs representative) — Hennessy & Patterson *Computer Architecture: A Quantitative Approach*; Intel/AMD optimization manuals.
- **Horowitz Energy Table (45nm CMOS, ~0.9V)**: FP16 add 0.4 pJ, FP16 mul 1.1 pJ, FP32 add 0.9 pJ, FP32 mul 3.7 pJ, 8 KB SRAM read 5 pJ, 1 MB SRAM read 100 pJ, off-chip DRAM 32-bit read 640 pJ — Mark Horowitz, *"Computing's Energy Problem (and what we can do about it)"*, IEEE ISSCC 2014 (checked 2026-11-13 via Stanford/ISSCC summaries).
- **Wulf & McKee (1995)**: *"Hitting the Memory Wall: Implications of the Obvious"*, ACM SIGARCH Computer Architecture News 23(1):20–24, March 1995.
- **Roofline Model**: Samuel Williams, Andrew Waterman, David Patterson, *"Roofline: An Insightful Visual Performance Model for Multicore Architectures"*, CACM 52(4), April 2009.
- **AMD EPYC 9654**: 96 cores, 12-ch DDR5-4800 (`460.8 GB/s`), ~5.7 TFLOPS FP32 estimate — AMD EPYC 9004 specs (checked 2026-11-13).
- **NVIDIA H100 SXM**: 80 GB HBM3, `3.35 TB/s`, `989.5 TFLOPS` dense BF16/FP16 Tensor Core (`1,979` sparse), `900 GB/s` NVLink 4, 700 W TDP — NVIDIA H100 Datasheet (checked 2026-11-13).
- **NVIDIA H200 SXM**: 141 GB HBM3e, `4.8 TB/s`, `989.5 TFLOPS` dense BF16 — NVIDIA H200 specs (checked 2026-11-13).
- **NVIDIA B200**: 180 GB HBM3e, `8.0 TB/s`, `2,250 TFLOPS` dense BF16, `1.8 TB/s` NVLink 5, 1,000 W TDP — NVIDIA Blackwell specs (checked 2026-11-13).
- **NVIDIA Rubin (vendor spec, as of 2026-11)**: 288 GB HBM4, `19.2 TB/s` (revised shipping spec), 50 PFLOPS NVFP4 inference (vendor spec) — NVIDIA Rubin disclosures / ServeTheHome (checked 2026-11-13).
- **AMD Instinct MI300X / MI355X**: MI300X 192 GB HBM3, `5.3 TB/s`, `1,300 TFLOPS` BF16; MI355X 288 GB HBM3e, `8.19 TB/s`, 1,400 W TBP — AMD CDNA3/CDNA4 specs / TechPowerUp (checked 2026-11-13).
- **Google TPU v7 Ironwood**: 192 GB HBM, `7.38 TB/s`, `2,307 TFLOPS` BF16, 9,216-chip pod — Google Cloud TPU specifications (checked 2026-11-13).
- **JEDEC HBM4 (`JESD270-4`, April 2025)**: `2,048-bit` bus, 32 channels, ~2.0 TB/s baseline per stack at 8 Gbps/pin; SK Hynix (`10+ Gbps`, ≥2.5 TB/s), Samsung (`up to 13 Gbps`, ~3.3 TB/s), Micron (`>11 Gbps`, >2.8 TB/s) — JEDEC / vendor releases (checked 2026-11-13).
- **CXL 3.1/3.2 & CPO**: CXL Consortium 3.1/3.2 fabric pooling; NVIDIA Quantum-X / Spectrum-X Photonics CPO (`1.6 Tb/s` per port, vendor claim up to `3.5×` power efficiency vs pluggables) — NVIDIA / Optica OPN / Yole (checked 2026-11-13).
- **PIM & Neuromorphic**: Samsung HBM-PIM, SK Hynix GDDR6-AiM, Intel Loihi 2 — vendor technical notes & open neuromorphic benchmarks (checked 2026-11-13).

## Facts That Will Go Stale (Baseline: 2026-11)

- All chip rows and HBM4 vendor speeds in `models.js` `FRONTIER` (`asOf: '2026-11'`), specifically Rubin shipping specs (`19.2 TB/s`, `50 PFLOPS NVFP4`), HBM4 vendor binning (`2.5–3.3 TB/s`), MI355X/B200/Ironwood standing, and PIM/CPO deployment status.

## Site Prerequisites Lacking

- No dedicated standalone lesson on **CPU out-of-order execution & branch prediction** or **DRAM cell/bank refresh physics** yet (both are scoped as future `computing/systems/` topics).

## Checked / Not Checked

- **Checked (`Verified-By: Antigravity (gemini-4-hydrogen)`)**:
  - First-read review in Chinese at `1280px` + interaction across all 10 models before reading source/`BRIEF.md`.
  - Quantitative math, formulas, and `.say` edge states in `models.js` / `tests/models.cjs` (`193 / 193` passing) + 7 independent hardware spot-checks (NVIDIA H100 SXM, JEDEC HBM4 `JESD270-4`, Horowitz ISSCC 2014, NVIDIA B200, Google TPU v7 Ironwood, NVIDIA Rubin shipping spec, AMD Instinct MI355X).
  - Full English copy (`copy.en.js`, 333 / 333 key & placeholder parity with `copy.zh.js`, `0` leftover CJK), canvas labels, `aria-label`, `doc.title`, cross-link titles against sibling `REGISTRY.json` / `pages.config.js`, and `"中 | EN"` toggle.
  - Browser & layout verification across `1280 / 390 / 320` in `zh` and `en` + `prefers-reduced-motion` + keyboard slider control + visual screenshot inspection: `tests/browser.cjs` (`PASS`), `tests/canvas-text-overlap.cjs --sweep` (`PASS: 1112 canvas states across 1 pages × 1280/390/320 × zh/en (with slider/button sweep) have no colliding or clipped text`).
- **Not checked / deferred to coordinator**:
  - Site-level integration (`pages.config.js`, `page-provenance.json`, `tests/page-provenance-core.cjs`, `tests/page-provenance-browser.cjs`, `atlas/`, `search/`), out of reviewer scope.
  - Live `cwBench` relative browser timing varies naturally across CPU/JS engines (`BRIEF.md` §2 notes median-of-7 run).
