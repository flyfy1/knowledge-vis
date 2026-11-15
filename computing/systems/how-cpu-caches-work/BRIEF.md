# BRIEF — CPU 的三级缓存是怎么工作的 (How a CPU's Three Levels of Cache Work)

Built-By: Claude Code (claude-opus-5-5)
Verified-By: self-check by builder (node model test, browser test zh at 1280/390/320 and reduced motion, canvas sweep, screenshots of every model and diagram at three widths); independent review pending
Category: computing 计算机 / subtopic systems 系统 · Stage: university
Series: computer architecture series A2 (`specs/essay-briefs/TASK-arch-series.md`)
Format: long interactive essay. Chinese written in full; `copy.en.js` is a same-keys stub (`enStub = true`), so the page shows Chinese until it is translated.
Files: index.html, copy.zh.js, copy.en.js, models.js, app.js, REGISTRY.json, tests/models.cjs, tests/browser.cjs

## The one question

内存要等几十纳秒，CPU 一纳秒能做好几件事。几十 KB 到几十 MB 的缓存，是怎么让它大部分时候不用等的？为什么要分三级，每一级又为什么是现在这个大小？

## Changes from the starting list (TASK file)

- ch1 does not use a CACTI-style curve. "Bigger is slower" is shown with documented latencies of real levels
  (Zen 5 L1/L2/L3, Lion Cove's 192 KiB L1 at 9 cycles and its new 48 KiB L0 at 4) and the AMAT model uses those
  latencies with Mattson's reuse distance. The general AMAT formula is linked to the memory essay #ch4, not retaught.
- ch2 has two models (split any address on Zen 5's three levels; a 128-byte direct-mapped toy cache stepping a dot
  product) instead of one.
- ch6 carries two diagrams (generic sliced-L3 layout; inclusive vs exclusive capacity) plus the real Zen 5 CCX
  diagram and a five-core vendor table; Skymont's L1 is left blank (no primary figure found).
- ch7 states the page × ways limit as a constraint with named exceptions (Neoverse V3 handles aliases in hardware;
  Apple uses 16 KiB pages).
- ch8 shows a real failure mode found by the model: a column walk with a 4096-byte stride puts every element in one
  8-way set, so prefetching 8 strides ahead evicts its own prefetches (coverage 99 % at distance 4, 0 % at 8).
- ch9 adds a step-by-step two-core MESI model beside the false-sharing model.
- ch10 adds the page-size effect on the staircase (random physical frames under 4 KiB pages overload some L2 sets).
- ch12 is the short closing: three questions to ask of a chip's caches.

## Chapters, models, published results, tuned parameters

All traces are generated in models.js from seeded generators; every model runs one cache engine (`makeCache`,
set-associative, LRU / tree-PLRU / random / SRRIP / BRRIP) except where noted.

1. Levels and AMAT. Program: four interleaved loops, stack 16 KiB (60 %), work array 384 KiB (25 %), lookup table
   8 MiB (12 %, slider 1–64 MiB), stream (3 %). **TUNED.** Level served by reuse distance (Mattson et al. 1970);
   test simulates the real interleaved trace (2.4 M accesses, table 4 MiB) with three LRU stacks: shares agree
   within 0.2 %. Result: 23.4 cycles with three levels; 3 % of accesses go to memory but take 51 % of the time.
   Sensitivity: table share halved (6 %) → 20.9 cycles, memory 57 % of time; doubled (24 %) → 28.4, 42 %. The
   ordering three levels < L1+L3 < L1+L2 < L1 holds for both (tested).
2. Address split (Zen 5 L1D 64 sets / L2 1,024 / L3 32,768) and toy cache (128 B, 16 B lines): 16/16 misses with
   b at 0x180, 4 with b at 0x1A0 or two ways. Hand-checked in the test.
3. 3C (Hill 1987) per miss: compulsory = first touch, capacity = also misses in fully associative LRU of the same
   size, conflict = the rest. Program: A, B, C 4 KiB each, 64 KiB apart, C=A+B, then 256 random lookups in a
   2 KiB table, ×4 (13,312 accesses, 224 compulsory). **TUNED program.** 16 KiB direct-mapped 12,416 misses
   (12,192 conflict); 2-way the same; 4-way 224.
4. Replacement on a 16 KiB 8-way cache: loop 1.25× → LRU 0 %, PLRU 1.7 %, random 57.1 %, SRRIP 0 %, BRRIP 64.1 %,
   Belady 71.7 %. Scan (hot 0.75× cache + one-time scan of 1× every other round) → LRU 30 %, SRRIP 45 %, BRRIP 57.5
   % = Belady. Random seed 5; seeds 5–8 give 56.5–57.1 %. BRRIP ε = 1/32 (RRIP paper, via a secondary summary).
5. Writes: 32 KiB 8-way L1, stencil over 16 KiB ×4 then a 64 KiB input with 8-store bursts. Read miss 14 cycles
   (Zen 5 L2), write buffer drains one entry per 3 cycles (**TUNED TW**). Write-through 85 KiB written vs
   write-back 37 KiB; allocate reads 102 KiB vs 80 KiB. Write-through waits 35 % / 3 % / 0 % at depth 0 / 4 / 8.
   Sensitivity: TW halved → 0 % at depth 4; doubled → 23 %.
6. Inclusive / non-inclusive / exclusive, L2 and L3 16-way LRU under uniform random reads, sizes scaled 1/16
   (hit rate depends only on W / capacity). At W = 2 MiB with 1 MiB L3 per core: 50 % / 58 % / 100 %; 502
   back-invalidations per 1,000 accesses. Desktop ratio, W = 5 MiB: 80 % vs 91 %. Seed 23.
7. VIPT closed form: size ≤ page × ways. Zen 5 48 KiB = 4 KiB × 12; Neoverse V3 64 KiB 4-way → 2 extra bits.
8. Prefetch: 32 KiB 8-way; next-line and Chen & Baer RPT (per-PC last address, stride, 4 states). Timeliness and
   bandwidth not modelled (stated on the page). Stride 256 B → stride 100 %/100 %, next-line 0 %; list → stride
   silent, next-line 7 % accurate; scan + random probes → next-line 34 % accurate, stride 100 % accurate, 50 %
   coverage.
9. MESI (Illinois) table; false sharing, two cores × 1,000 load+store adds. Transfer/upgrade cost TC = 100 cycles
   (**TUNED**). Same line alternating each add: 3,999 messages, 201.9 cycles/add; padded 2 messages, 2.10.
   Sensitivity: TC halved → 102, doubled → 402 (linear).
10. Pointer chase, exact steady state of per-set LRU on Zen 5's three levels, random physical frames (seed 41).
    24 KiB → 4, 512 KiB → 14, 16 MiB → 51, 128 MiB → 399 cycles (70 ns). 1 MiB: 31 with 4 KiB pages, 14 with 2 MiB.
    Seeds 1, 2, 3, 99 give 28–30 at 1 MiB and 17–24 at 768 KiB (the page says the excess varies run to run).
11. Frontier (no model).

## Diagrams (STANDARD §4a, inline SVG from app.js, labels from copy, portrait layout ≤ 600 px)

split (Zen 5 L1D address bits) · assoc (4-set 4-way lookup) · plru (8-way tree, bits from the engine) · write
(dirty bit, write buffer, write-through vs write-back paths) · ring (private L1i/L1d/L2, sliced shared L3,
schematic) · incl (inclusive / non-inclusive / exclusive capacity) · zen (Zen 5 CCX, real figures) · vipt (page
offset line, Zen 5 vs Neoverse V3 index bits) · rpt (stride prefetcher table) · mesi (four states, eight numbered
transitions) · false (false sharing on one 64-byte line). Eleven in all.

## Sources (each opened by me on 2026-11-15 unless marked)

- AMD, Software Optimization Guide for the AMD Zen5 Microarchitecture, pub. 58455 rev 1.00 (Aug 2024), §2.6:
  https://www.amd.com/content/dam/amd/en/documents/processor-tech-docs/software-optimization-guides/58455.zip
  (AMD's server timed out; the same PDF opened from the kernel bugzilla attachment
  https://bugzilla.kernel.org/attachment.cgi?id=306770, bug 206537). L1I 32 KiB 8-way; L1D 48 KiB 12-way,
  write-back, 4–5 cycles; L2 1 MiB 16-way inclusive of L1, ≥14 cycles; L3 up to 96 MiB, 16-way, filled by L2
  victims, average 46 cycles, shadow tags; utag way predictor; L1/L2 prefetchers.
- AMD Hot Chips 2024 (Cohen, Subramony):
  https://www.hc2024.hotchips.org/assets/program/conference/day2/24_HC2024.AMD.Cohen.Subramony.final.pdf
  — 8-core CCX with 32 MB L3; Strix Point 4 × Zen 5 + 16 MB, 8 × Zen 5c + 8 MB.
- Intel Tech Tour 2024, Lion Cove:
  https://cdrdv2-public.intel.com/824430/2024_Intel_Tech%20Tour%20TW_Next%20Gen%20P-core%20The%20Lion%20Cove%20Architecture-4.pdf
  — L0 48 KB 4 cycles, L1 192 KB 9 cycles, L2 2.5/3 MB 17 cycles; Redwood Cove L1 48 KB 5 cycles, L2 2 MB.
- Intel Hot Chips 2024, Lunar Lake:
  https://www.hc2024.hotchips.org/assets/program/conference/day1/56_HC2024.Intel.AGihon.final.pdf
  — Skymont 4 MB shared L2, 12 MB L3, 8 MB memory-side cache.
- Chips and Cheese, AMD's Ryzen 9950X: Zen 5 on Desktop (2024-08-14):
  https://old.chipsandcheese.com/p/amds-ryzen-9950x-zen-5-on-desktop — DRAM "just over 70 ns" (DDR5-6000);
  cross-CCD ~200 ns.
- Chips and Cheese, Lion Cove: Intel's P-core roars (2024-09-27):
  https://old.chipsandcheese.com/2024/09/27/lion-cove-intels-p-core-roars/ — L3 51 cycles, DRAM ~131 ns (258V).
- AMD Ryzen 9 9950X product page:
  https://www.amd.com/en/products/processors/desktops/ryzen/9000-series/amd-ryzen-9-9950x.html — 16 MB L2, 64 MB L3,
  launch 08/15/2024; 5.7 GHz boost.
- AMD press release, Ryzen 7 9800X3D (2024-10-31):
  https://ir.amd.com/news-events/press-releases/detail/1225/the-gaming-legend-continues-amd-introduces-next-generation-amd-ryzen-7-9800x3d-processor
- AMD EPYC 9755: https://www.amd.com/en/products/processors/server/epyc/9005-series/amd-epyc-9755.html
- AMD Instinct MI300X: https://www.amd.com/en/products/accelerators/instinct/mi300/mi300x.html
- jia.je, Arm Neoverse V3 (Graviton 5) (2026-06-13): https://jia.je/hardware/2026/06/13/arm-neoverse-v3/index.md
  — quotes the TRM; measured L1D 4 cycles; aliasing test.
- IEEE Spectrum, TSMC N2 SRAM (2024-12-12): https://spectrum.ieee.org/tsmc-n2
- Club386, AMD Zen 6 (2026-11-11): https://www.club386.com/?p=162670
- This machine: `sysctl hw.perflevel0.* hw.perflevel1.* hw.cachelinesize hw.pagesize machdep.cpu.brand_string`,
  read 2026-11-15 ("Apple M6": perflevel0 "Super", 2 cores, L1I 192 KiB, L1D 128 KiB, L2 20 MiB, cpusperl2 2;
  perflevel1 "Performance", 4 cores, L1D 64 KiB, L2 20 MiB; line 128 B; page 16 KiB).
- Textbook results (not re-opened): Mattson et al. 1970; Belady 1966; Hill 1987, Hill & Smith 1989; Jaleel et
  al. ISCA 2010; Chen & Baer 1995; Papamarcos & Patel 1984.

## Not verified from a primary source

- Arm Neoverse V3 TRM 107734 (https://developer.arm.com/documentation/107734/latest/): JavaScript-rendered, not
  opened. L1D 64 KiB 4-way "VIPT behaving as PIPT", RRIP-style L1D and PLRU L1I replacement, L2 2/3 MiB are taken
  from jia.je's quotation.
- RRIP paper PDF (BRRIP ε = 1/32, SRRIP insertion at 2): the mirror failed; taken from a secondary summary
  (https://wangziqi2013.github.io/paper/2018/06/19/RRIP.html).
- Intel Xeon 6980P "504M Cache": only the title of Intel's product page, seen in search results; the page
  returned Access Denied. The prose says so.
- Zen 6 figures: Club386's report of AMD's presentation; no AMD document found. Listed under 「说法」.
- Apple: the CPU optimization guide is gated; only sysctl figures are used. Ways, latencies and any SLC are not
  stated. The page claims only that 128 KiB with 16 KiB pages needs ≥ 8 ways for the VIPT rule.
- Skymont L1 sizes: not found in a primary source; the table cell says so.
- "Intel client chips use a ring" (ring diagram caption) and "shared L3 is usually sliced with a hash": general
  knowledge, not opened for this page.
- `lscpu --caches` option and C++17 `std::hardware_destructive_interference_size`: from memory, not re-checked.

## Facts that will go stale

Zen 6 (claimed, 2026-11-11), any Zen 6 / Panther Lake / Apple M-series cache sizes, the largest server L3, SRAM
density per node. FRONTIER.asOf = 2026-11.

## Checked / not checked

Checked: every prose number is a prose() value pinned in tests/models.cjs; vendor figures re-typed in the test;
hand-worked LRU, PLRU (victim 4 then 0), SRRIP, toy cache; 3C sums, compulsory = distinct lines, fully
associative conflict = 0, misses = independent run; Belady ≥ every policy; reuse-distance shortcut vs simulated
trace; MESI table (8 cases); VIPT closed form over 96 configurations; every live-sentence branch reached; browser
test at 1280/390/320 (overflow, clipping, 48 px targets, eleven diagrams: aria, labels inside, no overlap,
≥ 11 px), every model driven, reduced motion; canvas text sweep. Screenshots viewed: all eleven diagrams at 1280 and 320; models ch1, ch3, ch4, ch7, ch8 at 1280, ch5, ch6, ch10 at 320, ch9 (both) at 390. The 390 reduced-motion page was checked by the browser test; it has no animations, and its full-page screenshot was too tall to inspect by eye.
Not checked: English (stub); timing of real prefetchers; real L3 replacement and hashing; TLB costs in ch10.

## For the translator

Keep placeholders; `ch9.log.item` is a compact log entry; diagram labels have tight boxes (narrow layout 340
units): keep `dg.*S` keys short. 「调出来的参数」 = "tuned parameter".

## Registrar notes

- Title zh 「CPU 的三级缓存是怎么工作的」, en "How a CPU's Three Levels of Cache Work"; 12 concepts #ch1–#ch12.
- Alias moves (TASK-arch-series "one word, one owner"): L1 L2 L3 缓存, 缓存行, 组相联缓存, cache line, set associative
  cache move from why-compute-waits-for-memory #ch2 to this page (#ch1, #ch2, #ch3); "L1 L2 L3 cache" is new.
  The test allowlists exactly these. 缓存命中率 and cache hierarchy stay with the memory essay (flagged: they could
  move here too). 缓存 / cache stay with switches-that-compute #ch11.
- For A5: this page takes 伪共享 / false sharing and "MESI 状态 / MESI states" for its first look; 缓存一致性,
  cache coherence, MESI 协议, MOESI are deliberately left for A5.
- No provenance label or pages.config/atlas edits made.
