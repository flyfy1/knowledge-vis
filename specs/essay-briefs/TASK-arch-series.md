# Task: computer architecture series (计算机体系结构)

Requested by Yangyu on 2026-11-15: "我这个课程的目的可能是希望达到 computer architecture 的效果，还有比如讲一讲 CPU 的
L1、L2、L3 缓存，我也希望能看到对应的课程". The storage series (TASK-storage-series.md) and the bus series
(TASK-bus-series.md) are part of the same course. Together they should cover roughly what an undergraduate
computer-architecture course covers (Patterson & Hennessy, *Computer Organization and Design*; Hennessy &
Patterson, *Computer Architecture: A Quantitative Approach*), at the site's essay standard.

All essays in `computing/systems/`, stage university, same pipeline as the bus series (Opus builds zh with an
en stub, Haiku translates, separate Opus review of both languages, registrar). **Static diagrams are required**
(STANDARD.md §4a). Briefs, structural model, hard rules: as in TASK-bus-series.md "Briefs to follow".

## Status (2026-11-15)

| | Page | Essay commit | Live at | State |
|---|---|---|---|---|
| A1 | `how-a-cpu-runs-a-program` CPU 是怎么运行一个程序的 | `0daab2e9` | `e41b1fe0` | live, zh + en, reviewed by a separate Claude Code session (same model; cross-model review pending) |
| A2 | `how-cpu-caches-work` CPU 的三级缓存是怎么工作的 | `476c9f45` | `781c2db7` | live, zh + en, reviewed by a separate Claude Code session (same model; cross-model review pending) |
| A3 | `how-virtual-memory-works` 虚拟内存是怎么工作的 | `df11763e` | `e41b1fe0` | live, zh + en, reviewed by a separate Claude Code session (same model; cross-model review pending) |
| A4 | `how-a-cpu-guesses-ahead` CPU 是怎么猜着往前跑的 | `50a4a3c2` | `c79af41c` | live, zh + en, reviewed by a separate Claude Code session (same model; cross-model review pending) |
| A5 | `how-cores-share-memory` 多个核心怎么共用一块内存 | `445f4b67` | `c79af41c` | live, zh + en, reviewed by a separate Claude Code session (same model; cross-model review pending) |
| A6 | `how-a-gpu-computes` GPU 是怎么算的 | `e844143c` | `9b09a7f7` | live, zh + en, reviewed by a separate Claude Code session (same model; cross-model review pending) |
| — | `how-a-computer-boots` 电脑是怎么开机的 | `509b4d6e` | `9b09a7f7` | live, zh + en, reviewed by a separate Claude Code session (same model; cross-model review pending) |
| — | `how-the-os-talks-to-hardware` 操作系统是怎么和硬件说话的 | `20a942e2` | `26daf4af` | live, zh + en, reviewed by a separate Claude Code session (same model; cross-model review pending) |
| — | `how-pixels-reach-a-screen` 像素是怎么到屏幕上的 | `3e6bf23d` | `26daf4af` | live, zh + en, reviewed by a separate Claude Code session (same model; cross-model review pending) |
| — | `how-power-reaches-the-cpu` 电是怎么送进 CPU 的 | `e8b05fa7` | `b38d9e07` | live, zh + en, reviewed by a separate Claude Code session (same model; cross-model review pending) |
| — | `how-a-nic-moves-packets` 网卡是怎么搬运数据包的 | `230d5aac` | `b38d9e07` | live, zh + en, reviewed by a separate Claude Code session (same model; cross-model review pending) |

A2: alias move, cross-link and one-click aliases in `88dafe9c` (the label points there), registration `644c2aee`. The
"One word, one owner" decision below is done: L1 L2 L3 缓存, 缓存行, 组相联缓存, cache line, set associative cache (and L1 L2
L3 cache) are on A2 #ch1–#ch3; why-compute-waits-for-memory #ch2 keeps 缓存命中率, cache hierarchy and the locality words, and
its ch2.p3 links A2 (Antigravity edition; note in specs/reviews/why-compute-waits-for-memory-alias-move-20261115.md). A2 #ch9
takes MESI 状态 and false sharing; 缓存一致性, cache coherence, MESI 协议 and MOESI were left for A5 (A5 took them when it went live).
switches-that-compute #ch11 does not link A2 (its cache mention is a list item; its browser test requires 48 × 48 links).
A2's A5 mentions (ch9.p1, ch9.limit and ch12.links) are links since A5 went live (below). Its A3 mentions are links since A3
went live (ch7.p2 and ch10.limit to A3 #ch4, ch7.limit and ch12.links to the page top; scripts `?v=20261115b`).

A1 and A3: alias move, A2 -> A3 links and one-click aliases in `c0cc5c40` (both labels, and the repointed A2 and
switches-that-compute labels, point there), registration `601bf01c`. Registrar decision on the notes below: 指令集 / ISA /
instruction set and CPU 怎么执行程序 / how a CPU runs a program (A1 #ch1), 机器码 / machine code (A1 #ch3) and 流水线 / pipelining
(A1 #ch6, with 指令流水线 / CPU 流水线) left switches-that-compute #ch9 / #ch11; switches keeps 程序计数器, fetch decode execute,
冯·诺依曼结构 and 关键路径 / critical path (#ch4); the memory essay #ch1 keeps stalls, forwarding, CPI and "instruction pipeline".
A3 owns Belady 异常 / Belady's anomaly (A2 #ch4 keeps Belady 最优替换 / LRU); IOMMU stays on Thunderbolt #ch8, NUMA on B2, CXL
内存池 on the memory essay. The A4 mentions in A1 ch6.limit and ch8.p3 and A3 ch10.p4 are links since A4 went live (below). how-thunderbolt-works #ch8
does not link A3 (no page-table sentence there). The 取指 译码 执行 collision is fixed (below).

A4 and A5: cross-links, alias decisions and one-click aliases in `d34e98bb` (both labels, and the repointed A1, A2, A3 and
why-compute-waits-for-memory labels, point there), registration `1aa9a22f`, cache keys `c79af41c`. Links: A1 ch6.limit (A4 #ch6),
ch8.p3 (A4 #ch2), ch12.links; A3 ch10.p4 (A4 #ch10), ch13.links (A4 and A5); A2 ch9.p1, ch12.links, ch9.limit (A5 #ch3); A4
ch12.links (A5 #ch8); A5 ch11.p2 (A4 #ch8), ch12.links. A5 names B4 (coherent interconnects) in plain text: link it when B4 goes
live; A1's diagram label dg.layers.u3s ("后续文章") is SVG text and stays. Aliases: A5 took 缓存一致性 / cache coherence, MESI 协议,
MOESI, MSI 协议, 总线窥探 (unowned since A2); A2 keeps 伪共享 / false sharing / MESI 状态; plain MSI stays on how-pcie-works #ch7; A4
owns 推测执行 / speculative execution on #ch8 (A3 never carried them); distributed-systems keeps its consistency words. 取指 译码 执行
was removed from why-compute-waits-for-memory #ch1 (Antigravity edition; note
specs/reviews/why-compute-waits-for-memory-fetch-decode-alias-20261115.md), so it lands on switches-that-compute #ch9 (pinned).
The series A1–A5 is live.

A6 and the boot essay: cross-links, alias decisions and one-click aliases in `4e4585ca` (both labels, and the repointed
why-compute-waits-for-memory, how-cores-share-memory, how-memory-talks, how-pcie-works, how-a-computer-is-wired and
what-a-drive-is-made-of labels, point there), registration `0f111cc4`, cache keys `9b09a7f7`. Review notes
specs/reviews/how-a-gpu-computes-review-20261115.md and specs/reviews/how-a-computer-boots-review-20261115.md. Links into A6: the
memory essay ch6.p1 (#ch3), A5 ch12.links (#ch10); into the boot essay: B3 ch7.p4 (#ch5), B1 ch6.limit (#ch6), B2 ch8.p5 (#ch3), S1
ch1.p3 (#ch7). A1, A3 and A4 were checked and not linked (no plain-text mention); A6 and the boot essay do not link each other. Aliases:
boot #ch8 takes "Secure Boot chain of trust" / 安全启动信任链, never the bare "chain of trust" (a-secret-in-public #ch6); boot #ch3 keeps
SPI flash / quad SPI read beside B2's SPI / SPI bus; A6 keeps "GPU cache coherence" and "GPU shared memory" (the bare words stay with
A5, the memory essay and B4). The boot essay names a-secret-in-public in plain text (ch8.p2, ch14.links): link it when that draft goes
live.

The OS and pixels essays: cross-links, alias decisions and one-click aliases in `e916a267` (both labels, and the repointed
how-virtual-memory-works, how-pcie-works, why-nvme-is-fast, how-a-computer-boots, how-thunderbolt-works, storage-over-a-network and
how-a-gpu-computes labels, point there), registration `863f6b5f`, cache keys `26daf4af`. Review notes
specs/reviews/how-the-os-talks-to-hardware-review-20261115.md and specs/reviews/how-pixels-reach-a-screen-review-20261115.md. Links into
the OS essay: A3 ch10.limit (#ch3) and ch11.p3 (#ch8), B1 ch6.p5 (#ch4) and ch7.p3 (#ch5), NVMe ch7.p2 (#ch11; Antigravity edition, note
specs/reviews/why-nvme-is-fast-os-link-20261115.md), boot ch11.p6 (#ch9), B6 ch8.p2 (#ch8), S5 ch6.p1 (#ch12); into the pixels essay: B6
ch6.p1 (#ch2) and ch6.p4 (#ch7), A6 ch9.p2 (#ch1). B3 #ch9, S4 #ch8 and inside-a-phone #screen were checked and not linked (no sentence
on the topic). Aliases: the OS essay takes no RDMA (S5 #ch6) and only DMA 是什么 / what is DMA (bare DMA unowned); "kernel bypass" opens OS
#ch12, "kernel bypass zero copy" S5 #ch6; 中断 / interrupt, io_uring and 操作系统 / operating system now open OS #ch5, #ch11, #ch1. The pixels
essay takes no 显示流压缩 / Display Stream Compression; B6 #ch6 owns them and bare DSC, pixels #ch7 keeps DSC 有损吗 / is DSC lossy / 视觉无损;
A6 #ch1 takes 显卡 / graphics card. The OS essay names 《网页是怎么来到你手机上的》 in plain text (ch14.links): link it when
tech/networks/how-a-web-page-arrives goes live. The B6 DSC/FEC inconsistency was fixed on 2026-11-15 (93d7b195, below).

The power and NIC essays: cross-links, alias decisions and one-click aliases in `d0821bc1` (both labels, and the repointed
how-a-computer-boots, how-a-gpu-computes, why-compute-waits-for-memory, how-the-os-talks-to-hardware, storage-over-a-network,
coherent-interconnects and how-pcie-works labels, point there), registration `3539c70a`, cache keys `b38d9e07`. Review notes
specs/reviews/how-power-reaches-the-cpu-review-20261115.md and specs/reviews/how-a-nic-moves-packets-review-20261115.md. Links into the
power essay: boot ch1.p3 (#ch4), A6 ch11.p2 (#ch10), the memory essay ch5.p1 (#ch2; Antigravity edition, note
specs/reviews/why-compute-waits-for-memory-power-link-20261115.md); into the NIC essay: OS ch6.limit (#ch5) and ch7.limit (#ch3), S5 ch6.p1
(#ch11), B4 ch10.limit (#ch12). power-converters, B6 #ch7, B1 #ch10 and A2 were checked and not linked (no sentence on the topic).
Aliases: power keeps 防掉压 (no bare LLC) and #ch3 takes 电源怎么选 / PSU wattage; NIC #ch1 takes 网卡 / network card / NIC, and its page tag
is 网络硬件 / Network Hardware so bare 网络 stays on tcp-congestion; S5 #ch6 gains RDMA, B1 #ch3 PCIe 开销 / PCIe overhead / PCIe bandwidth,
the memory essay #ch10 CPO, tcp-congestion "packet", so the owners keep them; bare TSO stays on A5 (total store order). The power essay
names 《芯片为什么越来越难做》 and 《按下开关的那一刻，电是从哪儿来的》 in plain text, the NIC essay 《网页是怎么来到你手机上的》 and
《一根线到底能传多少信息》: link them when those drafts go live. Same round: B6 ch6.p4 now deducts FEC for DSC on 8b/10b DP (HBR3 ×4
25.31 Gb/s; 8K60 30-bit fits at ≤ 12.2 bpp on CVT-RB2 timing, `93d7b195`), B4's test requires its label (`888856c4`), and
scripts/test_index_pagination.cjs derives the Long Reads membership instead of pinning a stale list (`dc85cae0`).

**The queued list is complete.** Candidate follow-ups (not specced): retrofit static diagrams into S1–S5 (they predate STANDARD §4a);
B5 `small-buses` (I²C, SPI, UART, SMBus; B2 ch8 still names it in plain text); S6 `how-phone-storage-works` (UFS, eMMC); a CPU SIMD /
floating-point formats essay (IEEE 754, FP16 / BF16 / FP8 / FP4, AVX-512 and SVE), suggested by the A6 builder.

## The course, in reading order

Existing pages are marked (live). New essays are A1–A6; B and S are the other two series.

1. (live) `switches-that-compute` — gates, adders, latches, clock, ALU, a 16-byte stored-program machine.
2. **A1 `how-a-cpu-runs-a-program`** — ISA and machine code, a 5-stage pipeline in depth, hazards.
3. (live) `why-compute-waits-for-memory` — the memory wall, overview of the hierarchy, roofline, AI chips.
4. **A2 `how-cpu-caches-work`** — L1/L2/L3 in depth (dispatched first).
5. **A3 `how-virtual-memory-works`** — pages, page tables, TLB.
6. **A4 `how-a-cpu-guesses-ahead`** — branch prediction, out-of-order, speculation, Spectre.
7. **A5 `how-cores-share-memory`** — coherence, consistency models, atomics.
8. (live) **A6 `how-a-gpu-computes`** — SIMT, warps, occupancy, coalescing, tiling, tensor cores; links the memory essay #ch6.
9. B3 memory bus (DDR), B1 PCIe, B2 how a computer is wired, B4 coherent interconnects (CXL, NVLink).
10. S1–S5 storage, and `why-nvme-is-fast`.

11. B6 Thunderbolt / USB4 (in TASK-bus-series.md).

Yangyu, 2026-11-15: "我希望最终的效果是可以通过这个课程，把计算机各个部件的运行原理都讲清楚". So the course also needs,
queued after the above (spec to be written when dispatched): how a computer boots (firmware, UEFI, POST, the boot
chain; live since 2026-11-15 as `how-a-computer-boots`); how pixels reach a screen (GPU display engine, DisplayPort/HDMI, refresh, VRR; live since 2026-11-15 as `how-pixels-reach-a-screen`); how power reaches the CPU
(PSU, VRMs, DVFS, why chips throttle); how a network card moves packets (NIC, DMA rings, offloads, RSS); how the
OS talks to hardware (drivers, interrupts, system calls; live since 2026-11-15 as `how-the-os-talks-to-hardware`). Check `pages.config.js` and the untracked drafts
(`tech/devices`, `tech/networks`, `tech/semiconductors/why-chips-are-hard`) before speccing each, and link the
existing chips/transistor pages rather than repeating them.

A course index (one page listing this order with one line per essay) can follow once A1–A3 exist.

## One word, one owner

- `why-compute-waits-for-memory` #ch2 currently owns L1 L2 L3 缓存, 缓存行, 组相联缓存, 缓存命中率, cache hierarchy.
  **Decided by the team lead:** the cache words that A2 answers in depth (L1 L2 L3 缓存, 缓存行, 组相联缓存,
  cache line, set associative cache, L1 L2 L3 cache) move to A2; the memory essay keeps locality and
  row-vs-column traversal (按行遍历 按列遍历, 空间局部性, spatial locality, row major vs column major) and the
  latency-ladder overview. The registrar repoints that page when A2 is registered.
- #ch1 of that essay owns pipeline stall, load-use hazard, forwarding: A1 links to it and teaches the pipeline
  as a whole (control hazards, the full datapath) without taking those words.
- `switches-that-compute` #ch9/#ch11 own fetch-decode-execute, 冯·诺依曼结构, 机器码, 指令集, pipelining, cache in
  passing. A1 links #ch9; the registrar decides about 指令集 / ISA when A1 is registered.

## A2 · `computing/systems/how-cpu-caches-work/` (port 18941)

CPU 的 L1、L2、L3 缓存是怎么工作的 — one question: 内存要等一百纳秒，CPU 一纳秒能做好几件事。几十 KB 到几十 MB 的
缓存，是怎么让它大部分时候不用等的？为什么要分三级，每一级又为什么是现在这个大小？

Starting chapter list (reorder, merge, drop; report what changed):
1. 为什么要缓存，为什么不止一级 (link the memory essay #ch2 for the latency ladder; here: AMAT with two and three
   levels, and why one big fast cache is impossible — access time grows with size, from wire length and
   CACTI-style estimates).
2. 一个地址怎么被拆开：offset / index / tag, 64-byte lines. Model: type an address, see it split and land in a
   set; a direct-mapped cache simulator on a short trace.
3. 相联度：direct-mapped vs n-way vs fully associative; conflict misses; the 3C model (compulsory, capacity,
   conflict) measured on traces. Model: one trace, sweep size and ways, see the three kinds of miss.
4. 替换谁：LRU, pseudo-LRU (tree-PLRU bits), random, and why LRU fails on a loop slightly bigger than the cache
   (and what RRIP-style policies do). Model: same trace under each policy.
5. 写怎么办：write-through vs write-back, write-allocate, dirty bits, write buffers. Model: memory traffic per policy.
6. 三级各管什么：split L1i/L1d, private L2, shared L3 sliced across cores; inclusive / exclusive / non-inclusive
   (victim) L3, and the capacity each gives; real configurations of current cores (e.g. AMD Zen 5, Intel Lion
   Cove/Skymont, Apple M-series, an Arm Neoverse) from vendor documentation, with dates.
7. 为什么 L1 这么小：latency in cycles vs size; VIPT and the page-size × ways limit (4 KiB × 12 = 48 KiB),
   link A3 as plain text for the TLB. Model: the limit for page size and ways.
8. 预取：next-line and stride prefetchers; when they help and when they waste bandwidth. Model: a stride prefetcher
   on a trace, coverage and accuracy.
9. 多核时缓存要对得上：a first look at coherence (MESI states on one line, false sharing); A5 goes deeper.
   Model: two cores writing neighbouring words in one line vs separate lines.
10. 写代码时能看到缓存：measured effects a reader can reproduce (array stride benchmark, the latency staircase from
   a pointer-chasing test), with published measurements cited; link the memory essay #ch3 for tiling.
11. 前沿在哪 (as of Nov 2026): stacked L3 (3D V-Cache), large shared caches on AI and server chips, cache sizes on
   current flagship cores, SRAM scaling stalling at advanced nodes (sources).
12. Short closing.

Diagrams (at least six): address split into tag/index/offset; a set-associative array with ways and tags; a
core with L1i/L1d/L2 and a shared L3 ring; inclusive vs exclusive capacity; write-back path with dirty bit and
write buffer; MESI state diagram; false sharing on one 64-byte line; a real chip's cache layout (schematic).

Models must simulate real caches on real address traces (generated in `models.js`, seeded), not scaled bars.

## Queued (spec only)

- **A1 `how-a-cpu-runs-a-program`** — RISC-V as the example ISA: registers, instruction formats (R/I/S/B/U/J,
  real bit fields), assembling a small loop by hand; the single-cycle datapath, then the 5-stage pipeline with
  data and control hazards, branch delay and simple prediction (link the memory essay #ch1 for stalls on loads);
  CPI and the iron law (time = instructions × CPI × cycle time); x86 vs Arm vs RISC-V as ISAs, not as products.
- **A3 `how-virtual-memory-works`** — address spaces, pages, multi-level page tables (x86-64 4-level/5-level, real
  bit splits), the TLB and its reach, page faults and demand paging, huge pages, the cost of a TLB miss (page
  walk), copy-on-write.
- **A4 `how-a-cpu-guesses-ahead`** — branch predictors (2-bit counters, gshare, TAGE in outline), superscalar
  issue, out-of-order with register renaming and a reorder buffer (Tomasulo), memory disambiguation, speculation
  and Spectre/Meltdown as the price.
- **A5 `how-cores-share-memory`** — snooping vs directory coherence, MESI/MOESI, memory consistency (sequential
  consistency, TSO, Arm's weaker model), atomics and fences, false sharing, lock scaling.
- **A6 `how-a-gpu-computes`** (optional).

## Report (reply, under 450 words)

As in TASK-bus-series.md, including the list of diagrams and notes for the registrar on alias moves.
