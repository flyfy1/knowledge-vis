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
| A6 | `how-a-gpu-computes` | — | — | queued (optional), not dispatched |
| — | boot, display, power, NIC, OS-and-hardware essays (list below) | — | — | queued, specs to be written when dispatched |

A2: alias move, cross-link and one-click aliases in `88dafe9c` (the label points there), registration `644c2aee`. The
"One word, one owner" decision below is done: L1 L2 L3 缓存, 缓存行, 组相联缓存, cache line, set associative cache (and L1 L2
L3 cache) are on A2 #ch1–#ch3; why-compute-waits-for-memory #ch2 keeps 缓存命中率, cache hierarchy and the locality words, and
its ch2.p3 links A2 (Antigravity edition; note in specs/reviews/why-compute-waits-for-memory-alias-move-20261115.md). A2 #ch9
takes MESI 状态 and false sharing; 缓存一致性, cache coherence, MESI 协议 and MOESI are left for A5 (no result until then).
switches-that-compute #ch11 does not link A2 (its cache mention is a list item; its browser test requires 48 × 48 links).
A2 names A5 (ch9.p1, ch9.limit and ch12.links) in plain text: link it when it goes live. Its A3 mentions are links since A3
went live (ch7.p2 and ch10.limit to A3 #ch4, ch7.limit and ch12.links to the page top; scripts `?v=20261115b`).

A1 and A3: alias move, A2 -> A3 links and one-click aliases in `c0cc5c40` (both labels, and the repointed A2 and
switches-that-compute labels, point there), registration `601bf01c`. Registrar decision on the notes below: 指令集 / ISA /
instruction set and CPU 怎么执行程序 / how a CPU runs a program (A1 #ch1), 机器码 / machine code (A1 #ch3) and 流水线 / pipelining
(A1 #ch6, with 指令流水线 / CPU 流水线) left switches-that-compute #ch9 / #ch11; switches keeps 程序计数器, fetch decode execute,
冯·诺依曼结构 and 关键路径 / critical path (#ch4); the memory essay #ch1 keeps stalls, forwarding, CPI and "instruction pipeline".
A3 owns Belady 异常 / Belady's anomaly (A2 #ch4 keeps Belady 最优替换 / LRU); IOMMU stays on Thunderbolt #ch8, NUMA on B2, CXL
内存池 on the memory essay. Plain text still waiting for A4: A1 ch6.limit and ch8.p3, A3 ch10.p4. how-thunderbolt-works #ch8
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
The series A1–A5 is live; A6 and the boot / display / power / NIC / OS items below are queued.

## The course, in reading order

Existing pages are marked (live). New essays are A1–A6; B and S are the other two series.

1. (live) `switches-that-compute` — gates, adders, latches, clock, ALU, a 16-byte stored-program machine.
2. **A1 `how-a-cpu-runs-a-program`** — ISA and machine code, a 5-stage pipeline in depth, hazards.
3. (live) `why-compute-waits-for-memory` — the memory wall, overview of the hierarchy, roofline, AI chips.
4. **A2 `how-cpu-caches-work`** — L1/L2/L3 in depth (dispatched first).
5. **A3 `how-virtual-memory-works`** — pages, page tables, TLB.
6. **A4 `how-a-cpu-guesses-ahead`** — branch prediction, out-of-order, speculation, Spectre.
7. **A5 `how-cores-share-memory`** — coherence, consistency models, atomics.
8. **A6 `how-a-gpu-computes`** (queued, optional) — SIMT, warps, occupancy; links the memory essay #ch6.
9. B3 memory bus (DDR), B1 PCIe, B2 how a computer is wired, B4 coherent interconnects (CXL, NVLink).
10. S1–S5 storage, and `why-nvme-is-fast`.

11. B6 Thunderbolt / USB4 (in TASK-bus-series.md).

Yangyu, 2026-11-15: "我希望最终的效果是可以通过这个课程，把计算机各个部件的运行原理都讲清楚". So the course also needs,
queued after the above (spec to be written when dispatched): how a computer boots (firmware, UEFI, POST, the boot
chain); how pixels reach a screen (GPU display engine, DisplayPort/HDMI, refresh, VRR); how power reaches the CPU
(PSU, VRMs, DVFS, why chips throttle); how a network card moves packets (NIC, DMA rings, offloads, RSS); how the
OS talks to hardware (drivers, interrupts, system calls). Check `pages.config.js` and the untracked drafts
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
