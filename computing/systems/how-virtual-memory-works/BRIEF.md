# BRIEF — 虚拟内存是怎么工作的 (How Virtual Memory Works)

Built-By: Claude Code (claude-opus-5-5)
Verified-By: self-check by builder (node model test, browser test zh at 1280/390/320 and reduced motion, canvas sweep, screenshots of every model and diagram at three widths); independent review pending
Category: computing 计算机 / subtopic systems 系统 · Stage: university
Series: computer architecture series A3 (`specs/essay-briefs/TASK-arch-series.md`)
Format: long interactive essay. Chinese written in full; `copy.en.js` is a same-keys stub (`enStub = true`, the page falls back to Chinese).
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
- **Commit 7212b58d** "x86/mm/64: Make 5-level paging support unconditional", committed 2025-05-17:
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

- The Linux release number that first shipped 5-level paging unconditionally. The page gives only the commit date and does not name a version.
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
