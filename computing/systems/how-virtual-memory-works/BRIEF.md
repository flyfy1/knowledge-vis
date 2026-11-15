# BRIEF — 虚拟内存是怎么工作的 (How Virtual Memory Works)

Built-By: Claude Code (claude-opus-5-5)
Verified-By: self-check by builder (node model test, browser test zh at 1280/390/320 and reduced motion, canvas sweep, screenshots of every model and diagram at three widths); Claude Code (claude-opus-5-5), separate review session 2026-11-15: zh and en read in full, every model driven and re-derived, frontier facts and SDM Table 5-20 checked against sources, nine diagrams inspected at 1280/390/320 in both languages (see Review)
Category: computing 计算机 / subtopic systems 系统 · Stage: university
Series: computer architecture series A3 (`specs/essay-briefs/TASK-arch-series.md`)
Format: long interactive essay, static files only (no build step): index.html, copy.zh.js, copy.en.js, models.js, app.js. Both languages are written in full; `copy.en.js` is the English translation with the same keys (it no longer sets `enStub`, so English mode shows English).
Files: index.html, copy.zh.js, copy.en.js, models.js, app.js, REGISTRY.json, tests/models.cjs, tests/browser.cjs

## The one question

每个程序都以为自己独占一整块从 0 开始的内存，几十个程序却挤在同一条内存里。CPU 每读一个字节都要先翻译一次地址，为什么这样还不慢？

## Changes from the starting ladder (dispatch message)

- The ladder had about 15 rungs; merged into 13 chapters. Base-and-bound and segmentation are folded into ch1, as the
  "before" half of a contiguous vs paged allocator model.
- Single-level table and the multi-level tree are one chapter (ch2). The 4/5-level walk and the PTE bits are ch3, with
  two diagrams.
- The cost of a miss (ch5) comes straight after the TLB (ch4) and before huge pages (ch6), so that huge pages can be
  shown as a cure for both reach and walk length, using the same model.
- Swapping, the working set and thrashing go into ch7 (page faults, with the EAT formula). Replacement (clock vs FIFO
  vs LRU vs OPT, Belady's anomaly) is ch8.
- fork / copy-on-write and memory-mapped files are one chapter (ch9).
- Context switches, PCID/ASID, TLB shootdown, and Meltdown/KPTI are one chapter (ch10), because KPTI's cost is a
  PCID question. A4 is named in plain text only.
- Nested paging is ch11, with one paragraph "page tables for devices" (IOMMU) linking how-pcie-works #ch7 and
  how-thunderbolt-works #ch8. ch12 is the frontier, ch13 is the closing (three questions).

## Chapters and models (all numbers from `models.js`, pinned in tests/models.cjs)

1. 为什么要虚拟地址: first fit vs paged allocation on 256 MiB, 300 seeded arrivals. At a mean of 6 MiB, first fit refuses 20 processes and paging refuses 5; 54 MiB is free but the largest hole is 17 MiB.
2. 页、偏移，和一张装不下的表: flat vs tree size. A flat 48-bit table is 512 GiB; the tree needs 62 tables (248 KiB) for 108 MiB mapped.
3. x86-64 四级页表: the reader types an address and walks seeded tables bit by bit (BigInt), with R/W, U/S, XD, a non-present page, a non-canonical address and 5-level paging.
4. TLB: a fully associative LRU TLB on random, sequential and column traces. At 64 MiB with 1,536 entries, the random trace misses 90.8% with 4 KiB pages and 0% with 2 MiB pages.
5. 一次缺失要付多少: Zen 5 L1/L2 DTLB plus a page-walk cache. At 1 GiB, a walk reads memory 4 times without the PWC and 1.94 times with it; the cost is 30.7–765 cycles per access, bracketed by L2 and DRAM latency.
6. 大页: 4 KiB / 2 MiB / 1 GiB pages, used dense or sparse. Sparse use makes 2 MiB pages allocate 16× the memory.
7. 缺页: EAT = (1−p)·t_mem + p·t_fault for minor, NVMe and disk faults. At p = 10⁻⁴ the slowdowns are 1.001×, 1.06× and 19×.
8. 换出谁: FIFO / Clock / LRU / OPT. On Belady's string FIFO faults 9 times with 3 frames and 10 with 4; Clock behaves the same.
9. fork: eager copy vs COW. When each side writes 10%, COW copies 4,840 pages and takes 5,111 faults.
10. 隔离的代价: tagged vs flushed TLB, with and without KPTI. With 4 processes: flush 51 misses per 1k accesses, tagged 0, flush with KPTI 259.
11. 二维页表: the nm+n+m grid. 4×4 gives 24 reads, 5×5 gives 35, 4×3 gives 19, 3×3 gives 15.
12. Frontier, as of November 2026.
13. Closing: three questions to ask when a program is slow.

### Tuned parameters (marked 调出来的参数 on the page, halved/doubled in tests)

- **ch1:** size spread ½–1½× the mean, lifetime 10–60 steps, seed 7.
  - Tested: first fit refuses more than paging at 6 MiB for seeds 3, 7, 21 and 99.
  - At a mean of 16 MiB, memory itself is short and the counts can cross by one (159 vs 160). The test allows this and says why.
- **ch2:** layout of the process (4 MiB code, a heap, 32 MiB of libraries, an 8 MiB stack).
- **ch3:** toy tables, seed 11 (12 for 5-level).
- **ch4:** 10k warm-up plus 40k measured accesses, seed 3.
- **ch5:** PDE and PDPTE walk-cache sizes of 32 each. AMD does not publish them.
  - Tested at 16 and 64: the walk-cache result holds (fewer than 2.5 reads per walk).
- **ch6:** sparse pattern of 4 KiB used in every 64 KiB.
- **ch8:** the "locality" string (seed 19).
- **ch10:** 5,000 accesses per quantum, a 256-page working set, 8 kernel pages, a 1,536-entry TLB.
  - Tested with working sets of 128 and 512 pages, and 4 and 16 kernel pages.

## Diagrams (inline SVG from app.js, labels from copy, 720-wide and 340-wide layouts)

1. `map` (ch1): two processes with their own page tables and one physical memory; the C library frames are shared. Schematic.
2. `split` (ch2): a 48-bit VA split into a 36-bit page number and a 12-bit offset. The page number goes to the table and comes back as a frame number; the offset is copied.
3. `walk` (ch3): CR3 → PML4 → PDPT → PD → PT → 4 KiB page, using bits 47:39 / 38:30 / 29:21 / 20:12 / 11:0 (SDM §5.5).
4. `pte` (ch3): the 4 KiB PTE as in SDM Table 5-20:
   - XD 63, PK 62:59, ignored 58:52, PFN M−1:12;
   - low bits: G 8, PAT 7, D 6, A 5, PCD 4, PWT 3, U/S 2, R/W 1, P 0.
5. `tlb` (ch4): the TLB in front of the walker. Hit path, miss path, fill.
6. `pwc` (ch5): a full walk (4 reads) vs a walk-cache hit on the PDE (1 read).
7. `fault` (ch7): the major-fault sequence CPU → OS → disk → OS → retry, in 6 numbered steps.
8. `cow` (ch9): before and after fork. After the child writes page 2, it gets a new frame.
9. `nested` (ch11): the 5×5 grid of the 2D walk, 24 numbered reads (red = host, blue = guest), then the data.

## Sources (each opened by me on 2026-11-15 unless marked)

- **Intel SDM Vol. 3A**, order 253668-093US (September 2026), ch. 5 "Paging": §5.5 4-level / 5-level, Table 5-20 PTE, PS bit, PCID, canonical addresses. https://cdrdv2.intel.com/v1/dl/getContent/671190 (PDF read via pypdf). Older-edition page images were also consulted: https://xem.github.io/minix86/manual/intel-x86-and-64-manual-vol3/o_fe12b1e2a880e0ce-128.html (-130, -131).
- **AMD Software Optimization Guide for the AMD Zen5 Microarchitecture**, 58455 rev 1.00 (Aug 2024), §2.6–2.7: TLBs, 6 walkers, PWC/PDC, page smashing, L1/L2/L3 latency. Copy hosted at https://bugzilla.kernel.org/attachment.cgi?id=306770.
- **Linux kernel docs:**
  - https://docs.kernel.org/arch/x86/x86_64/5level-paging.html
  - https://docs.kernel.org/arch/x86/pti.html
  - https://docs.kernel.org/admin-guide/mm/transhuge.html
  - https://docs.kernel.org/arch/arm64/memory.html
  - https://docs.kernel.org/driver-api/cxl/allocation/reclaim.html
  - https://docs.kernel.org/driver-api/cxl/linux/memory-hotplug.html
- **arch/arm64/Kconfig** (ARM64_VA_BITS_47 depends on 16K pages): https://raw.githubusercontent.com/torvalds/linux/master/arch/arm64/Kconfig
- **Commit 7212b58d** "x86/mm/64: Make 5-level paging support unconditional", committed 2025-05-17 (author date 2025-05-16, committer Ingo Molnar); contained in v6.16-rc1 and v6.16, not in v6.15 (GitHub compare API, https://api.github.com/repos/torvalds/linux/compare/v6.16...7212b58d6d7133e4cd3c2295e1fb54febe284156, opened 2026-11-15 by the reviewer), so it shipped in Linux 6.16, released 2025-07-27 (v6.16 tag date; https://kernelnewbies.org/Linux_6.16):
  - commit: https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=7212b58d6d7133e4cd3c2295e1fb54febe284156
  - thread: https://patchew.org/linux/20250516123306.3812286-1-kirill.shutemov@linux.intel.com
- **Bhargava, Serebrin, Spadini, Manne**, "Accelerating Two-Dimensional Page Walks for Virtualized Systems", ASPLOS 2008: https://courses.physics.illinois.edu/ece598ms/fa2019/papers/paper223.pdf
- **Android "Support 16 KB page sizes"**: https://developer.android.com/guide/practices/page-sizes
- **Meltdown**: https://meltdownattack.com/ (KPTI, formerly KAISER).
- **OSTEP** chapters 13–23 (address spaces, segmentation, paging, TLBs, advanced page tables, swapping, the complete VM system): https://pages.cs.wisc.edu/~remzi/OSTEP/
- **Measured on this machine** (Apple M6, macOS 27.2.1), 2026-11-15:
  - `sysctl hw.pagesize` = 16384;
  - minor-fault probe (1 GiB anonymous mmap, one write per page): 0.53 µs per page (runs 0.50–0.63, first run 2.5), second touch 0.11 µs.
- **Taken from sibling BRIEFs, not reopened by me:**
  - Samsung 990 PRO QD1 22K IOPS, and Seagate Barracuda 7200.12 8.5 ms seek + 4.16 ms latency (what-a-drive-is-made-of);
  - DRAM 70 ns on the 9950X at 5.7 GHz (how-cpu-caches-work).

## Not verified from a primary source

- The 15–38% gain for caching 2D walks (Bhargava et al.) is taken from the paper's abstract; the page says so.
- The Arm ARM was not opened. Arm granule and VA facts come from the Linux arm64 docs and Kconfig. AMD APM Vol. 2 was not opened; the SDM and the Zen 5 guide cover what the page states.
- The sizes of Zen 5's PDE/PDPTE walk caches are unpublished (tuned to 32).
- The Google Play deadline (2027-02-01) and Google's gains are as stated on the Android page when I read it. These are Google's own preliminary tests.
- The command lines in prose are from memory and were not run on Linux here: `setarch -R`, `perf stat -e dTLB-load-misses`, `/usr/bin/time -v`, and the THP sysfs paths.
- The minor-fault figure is from macOS on Apple silicon, not Linux on x86.

## Facts that will go stale

- 5-level paging adoption.
- The Android 16 KB deadline.
- CXL tiering in Linux.
- The Zen 5 TLB sizes (Zen 6).
- The SDM edition.

## For the translator

- Keep KiB/MiB/GiB and the bit ranges.
- "调出来的参数" = "tuned parameters".
- Keep `P=0` / `P=1` in the fault diagram without spaces, so that line wrapping keeps them together.
- The ch2 sentences put `{tables}` straight before 表 (the unit "张" is in `u.tables`).

## Registrar notes

- **Title:** zh 虚拟内存是怎么工作的 / en How Virtual Memory Works.
- **Category:** computing / systems; stage university.
- **Concepts:** 13 (#ch1–#ch13), defined in REGISTRY.json.
- **Aliases:** none collides with any sibling REGISTRY (checked by tests/models.cjs). Words deliberately left to their owners:
  - A2 #ch7: VIPT / 缓存别名;
  - A2 #ch4: LRU / Belady 最优替换;
  - A2 #ch10: 大页对缓存的影响 / huge pages and cache sets;
  - Thunderbolt #ch8: IOMMU 是什么 / VT-d / 内核 DMA 保护;
  - how-a-computer-is-wired #ch4: the NUMA family;
  - memory essay #ch10: CXL 内存池.
- **Suggestion:** A2 #ch7's prose names "后续一篇讲虚拟内存的文章" in plain text; it can now link here (#ch4).
- **Not done here:** no provenance label; pages.config.js and atlas files are untouched.

## Review

- **Reviewer:** Claude Code (claude-opus-5-5), a separate session that did not build the page. Date 2026-11-15.
- **Scope:** zh and en read in full (every key of copy.zh.js and copy.en.js); every model driven in the browser; every
  diagram looked at in screenshots at 1280/390/320 in both languages.

### Checks

- **Models re-derived with an independent script** (scratch, not in the repo): first fit vs paging on the same seeded
  arrivals (6 MiB: 20 vs 5, 54 MiB free, largest hole 17 MiB; 12 MiB: 125 vs 114); flat table 2^36 × 8 = 512 GiB and the
  tree 55 + 3 + 3 + 1 = 62 tables (248 KiB) for 108 MiB mapped; random-TLB closed form 1 − 1536/16384 = 90.6% vs the
  simulated 90.8% (seeds 1/3/9: 90.7/90.8/90.6%); PWC ≈ (32/512)·1 + (480/512)·2 = 1.94 reads; sparse 2 MiB bloat
  64 KiB / 4 KiB = 16×; EAT at p = 10⁻⁴ (t_mem 70 ns): 1.0007 (shown as 1.001), 1.065, 19.09; FIFO / Clock / LRU / OPT
  on Belady's string with 1–5 frames: 12 12 9 10 5 / 12 12 9 10 5 / 12 12 10 8 5 / 12 9 7 6 5; COW 10%/10%: 4,840
  copies, 5,111 faults, 271 pages written by both; nested walk (n+1)(m+1) − 1 = nm + n + m: 24 / 35 / 19 / 15.
  Context switches checked analytically: flush ≈ 256 misses per 5,000-access quantum ≈ 51 per 1k; KPTI without PCID
  ≈ 251 of 256 pages re-missed after each syscall plus 8 kernel pages ≈ 259 per 1k.
- **The 160 vs 159 exception** (mean 16 MiB, seed 7: first fit 159, paging 160). Honest as a model result: once memory
  is full the two allocators hold different sets of processes, so the counts are noise around "memory full" (8 seeds
  at 16 MiB: only seed 7 crosses). The page was not honest about it: the live sentence said the gap was fragmentation
  while paging had refused more. Fixed with a `ch1.say.full` branch, pinned in tests for every mean and step.
- **Intel SDM Vol. 3A** (253668-093US, PDF dated 2026-09-18) opened and Table 5-20 read: P 0, R/W 1, U/S 2, PWT 3,
  PCD 4, A 5, D 6, PAT 7, G 8, 10:9 ignored, 11 R (HLAT restart), M−1:12 address, 51:M reserved, 58:52 ignored,
  62:59 protection key, 63 XD; PS is bit 7 of a PDE (§5.5). All match the model, the prose and the diagram (the
  diagram now also draws 51:M reserved).
- **Frontier facts, each in two places:** Linux 5-level commit (git history via the GitHub API + LKML/patchew thread;
  release from the v6.16 tag + kernelnewbies); Android 16 KB pages and the 2027-02-01 Play deadline and Google's gains
  (developer.android.com page reopened, Play Console screenshot on the same page); Apple 16 KiB pages (`sysctl
  hw.pagesize` = 16384 on this machine, reviewer re-ran it); Arm granules (Linux arm64 memory doc: 4K 39/48-bit, 64K
  42-bit, 52-bit with LVA; arch/arm64 Kconfig per the builder); CXL demotion (Linux CXL reclaim doc: demotion_enabled,
  "prefer swap (or zswap)" by default, HMAT/CDAT); PTI doc ("on the order of a hundred cycles", "each CR3 write flushes
  the entire TLB" without PCID). Zen 5 L1 DTLB 96 and L2 DTLB 4,096 confirmed in Hot Chips 2024 coverage.
- **Tuned parameters halved/doubled:** added ch1 lifetimes 5–30 and 20–120 (the load band moves; first refusals still
  come from first fit). ch5 PWC 16/64 and ch10 working set/kernel pages were already tested. Sparse pattern: bloat is
  exactly (pattern stride / 4 KiB), so the 16× moves with it; the page labels it as tuned.
- **Ownership and links:** no alias collides with a sibling REGISTRY (test); the page links how-cpu-caches-work #ch7
  (VIPT) and #ch10 (staircase) instead of repeating them, and both chapters say what this page claims they say; all
  sibling titles match pages.config.js in both languages; every link resolves.

### Changes

- zh doubled units fixed at the source (copy): `ch5.say.nopwc` ("走完 4 级 级、读 4 次 次内存"), `ch5.say.pwc`
  ("只读 1.94 次 次"), `ch6.say.bloat` ("16 倍 倍"). The no-PWC sentence also no longer says "4.00 reads".
- New tests: a structural check in tests/models.cjs that reads every `t(z.key, {…})` call in app.js, finds which
  placeholders already carry a unit, and fails if any zh or en sentence the call can show repeats that unit (verified
  to catch the three original bugs); and a browser sweep of every live sentence over every radio/checkbox
  combination and every slider value in both languages (786 states, 575 distinct sentences) for doubled units, raw
  placeholders and CJK in English.
- ch1: new `ch1.say.full` branch; `ch1.say.both` now says "roughly".
- ch7: "慢了 1.06 倍 / 1.06× slower" reworded to "是只读内存的 1.06 倍 / 1.06× the time of a plain memory read" in the
  live sentences, readout label and ch7.p3.
- ch12.d1: names Linux 6.16 (released 2025-07-27) and says the commit first went into the x86 maintainers' tree (it did
  not "enter mainline" on 2025-05-17); new pinned value `lx5rel`. ch12.d4: full sysfs path
  `/sys/kernel/mm/numa/demotion_enabled`, "while the far node has room", default is swap/zswap.
- ch4.law made conditional ("if every access walked…"); ch13.sum "tens of MiB" → "a dozen or so MiB" (Zen 5 L2 reach
  is 16 MiB).
- English: ch3/ch4 titles aligned with their TOC entries; "VA" label → "Address"; "times the" readout → "Relative to
  native"; clock name capitalised at sentence start; English prose literals now pinned in tests/models.cjs.
- Diagrams: PTE draws the 51:M reserved field, and its labels fit their boxes (en 1280 frame-number label overflowed;
  "Ignored" overflowed at 320); fault: header box fits "Operating system" (narrow uses "OS"), arrow labels no longer sit
  on the arrows; TLB (narrow): "Page tables in memory" wraps inside its box and "Fill the TLB" no longer lies on the
  dashed line; nested (narrow): "Guest entry" wraps instead of touching the first cell; split (narrow): arrow moved off
  the "Physical address" label, offset label fits; map (wide): legend no longer overlaps the last frame.
- ch3 address field: label may shrink, fixing a 9–11 px overflow at 320 in English.
- BRIEF: Format line was stale (it said `copy.en.js` was a stub; there is no build step); the 5-level release moved from
  "not verified" to sources.

### Not verified

- Zen 5 L2 DTLB 16-way, 1,024 1 GiB entries, 6 walkers, 64-entry PDC, page smashing: the hosted copy of AMD 58455 now
  returns HTML, not the PDF, so these were not reopened (96 / 4,096 were confirmed elsewhere).
- 990 PRO and Barracuda figures (from the sibling BRIEF), the 70 ns DRAM figure, and the 15–38% of Bhargava et al.
  were not reopened. The Linux command lines in ch1, ch6 and ch13 were not run on Linux.
- The minor-fault measurement (0.53 µs) was not repeated.

## Registrar (2026-11-15)

- One-click additions: #ch1 虚拟内存, 为什么需要虚拟内存, virtual memory (the page tag otherwise beat the chapter); #ch2 页表, page
  table (#ch3's "page table walk" otherwise won); #ch10 上下文切换 TLB; #ch11 虚拟化 页表. Belady 异常 / Belady's anomaly stay on
  #ch8 and Belady 最优替换 / LRU on how-cpu-caches-work #ch4 (different concepts; both probed). IOMMU words stay on
  how-thunderbolt-works #ch8, NUMA on how-a-computer-is-wired #ch4, CXL 内存池 on why-compute-waits-for-memory.
- how-cpu-caches-work now links here (ch7.p2 and ch10.limit to #ch4, ch7.limit and ch12.links to the page top).
  how-thunderbolt-works #ch8 does not link back: no sentence there mentions page tables.
- Links to how-cpu-caches-work #ch4 / #ch7 / #ch10, why-compute-waits-for-memory #ch2, how-pcie-works #ch7,
  how-thunderbolt-works #ch8 and what-a-drive-is-made-of verified. A4 stays plain text. Scripts at `?v=20261115` (first
  deployment).

## Registrar of A4 and A5 (2026-11-15)

- A4 and A5 are live: ch10.p4 links A4 #ch10 (Spectre; it named "a later essay on how CPUs guess ahead"), and ch13.links,
  which named both as "two later essays", links A4's and A5's page tops, zh and en. tests/models.cjs requires those links (it
  used to forbid them), checks the quoted titles and checks this page's aliases against A4 and A5.
- 推测执行 / speculative execution: this page never carried them; they stay on A4 #ch8 (speculation and squashing), and the
  Meltdown sentence here links A4 #ch10. KPTI and Meltdown 补丁 stay here (#ch10).
- Scripts move to `?v=20261115b` (`?v=20261115` was deployed with the A1/A3 registration).

OS/pixels registrar (2026-11-15): ch10.limit links how-the-os-talks-to-hardware #ch3 (the cost of one kernel crossing, which this page
does not measure) and ch11.p3 links its #ch8 (how a driver fills the IOMMU's page table). Scripts `?v=20261115c`.
