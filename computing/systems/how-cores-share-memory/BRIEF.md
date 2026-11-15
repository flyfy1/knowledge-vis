# BRIEF — 多个核心怎么共用一块内存 (How Cores Share Memory)

Built-By: Claude Code (claude-opus-5-5)
Verified-By: self-check by builder (node model test, browser test zh at 1280/390/320 and reduced motion, canvas sweep, screenshots of every model and diagram at three widths); Claude Code (claude-opus-5-5), separate session, independent review 2026-11-15: zh and en read in full, models re-derived, frontier facts re-checked, diagrams viewed in both languages (see Review)
Category: computing 计算机 / subtopic systems 系统 · Stage: university
Series: computer architecture series A5 (`specs/essay-briefs/TASK-arch-series.md`)
Format: long interactive essay, zh and en (`copy.en.js` translated; no `enStub`).
Files: index.html, copy.zh.js, copy.en.js, models.js, app.js, REGISTRY.json, tests/models.cjs, tests/browser.cjs

## The one question

八个核心各有自己的缓存，却要看到同一块内存。一个核心改了一个数，别的核心怎么知道？为什么两个线程各加一百万次，
结果却不是两百万？为什么有的 CPU 上程序对，换一种 CPU 就错？

## Changes from the starting list (TASK file)

- Order of the middle chapters: lost update (ch5) → atomic instructions (ch6) → contended line / ping-pong (ch7).
  The list had coherence-miss cost before the race; the ping-pong model needs atomics to make sense (it counts
  atomic increments), so it moved after them.
- ch2 (the two invariants) has no model of its own: its readouts (单写多读 / 数据值) live in the ch1 model, and the
  prose sends the reader back to it. ch9 reuses the ch8 litmus enumerator, fixed to MP.
- The C++/Java memory model is one paragraph in ch9 (SC for DRF, `memory_order_seq_cst` / release / acquire),
  not a chapter.
- ch5 has two models: an exact count of every interleaving (dynamic programming, not sampling) and a random-burst
  scheduler for the full million.
- Added a 'none' (no protocol) baseline to the coherence engine for ch1/ch2.

## Chapters, models, published results, tuned parameters

One coherence engine (`access` in models.js: per-cache line states, values as write counters, ledger of bus
transactions, memory reads, cache-to-cache transfers, writebacks, invalidations, stale reads) runs ch1, ch3, ch4
and ch10. Protocols: none, MSI, MESI (Illinois: clean copies supply data), MOESI. BusRd, BusRdX, BusUpgr and
writebacks each count as one bus transaction.

1. Two caches, one stale copy. Fixed four-step script (0 reads x, 1 reads x, 0 writes, 1 reads). No protocol: core 1
   reads 0; MESI: 1. Readouts for both invariants.
2. The two invariants (SWMR, data value; Primer §2.3). Prose only, per cache line.
3. Snooping MSI / MESI / MOESI. 4 cores × 4 lines; buttons per core and four presets (4 rounds each): private data
   (MSI 48 tx, of which 16 useless BusUpgr; MESI 32), one writer three readers (MESI 4 writebacks, MOESI 0; tx 20 vs
   16), migratory (MESI 15 writebacks, 46 tx; MOESI 0, 31), read-only (4 tx). Hand-checked in the test.
4. Directories. Storage per 64-byte line (Primer §8.5): full vector N + 2 bits (12.9 % at 64 cores, 200 % at 1024),
   coarse vector K = 8 (25.4 % at 1024), 4 limited pointers (8.4 %). Messages per miss on a replayed trace
   (snoop: N − 1 + data; directory: 2, 4 with an owner (3-hop), 3, or 2 + 2s): 3.8 vs 4.0 at 4 cores, 64.0 vs 4.1
   at 64, 256 vs 4.1 at 256; 38 % of misses at 64 cores are 3-hop. Trace mix **TUNED**: 4000 accesses, 64 lines,
   70 % on 4 hot lines, 20 % writes. Sensitivity: write share halved/doubled, hot share 35 %/90 %, hot lines 2/8 →
   snoop still cheaper at 4 cores, directory 3.9–4.2 messages per miss at 64 (pinned).
5. Lost update. Exact counts: k = 1: 6 orders (min 1); k = 2: 70 (min 2); k = 3: 924, 2.2 % correct; k = 5:
   184,756, 0.1 % correct, min 2. Checked against C(4k, 2k) and a brute-force walk for k ≤ 4. Random scheduler,
   1,000,000 each: burst mean b **TUNED** (slider 1–1024): b = 1 → exactly 1,000,000; b ≥ 4 loses 33–35 % for every
   b and seeds 11–13 (pinned 32–36 %). The prose says the loss does not shrink with b and why.
6. Atomics. CAS loop vs fetch-and-add under a uniformly random scheduler (2000 increments per thread, seed
   varied in the test): 2.86 steps per increment at 2 threads, 5.5 at 8, 10.6 at 32 with 81 % of CAS failing.
   Final count always n × M.
7. Contended line. n threads, FIFO grant, transfer T from the measured Bergamo latencies (low end: 30 / 100 / 200
   ns), increment t = 1 ns **TUNED**. Exact: rate 1/(T + t) for n ≥ 2 (test: simulation = closed form). 32 M/s in a
   cluster (24 at 40 ns), 9.9 cross-cluster, 5.0 cross-socket, 2000 M/s for private counters. t halved/doubled moves
   the shared rate by under 4 %; doubling T halves it (0.508).
8. SC and the store buffer. Litmus enumerator over every reachable state: SC; x86-TSO (Sewell et al.'s abstract
   machine: FIFO store buffer, own-buffer forwarding, MFENCE drains, LOCK'd XCHG needs an empty buffer); weak
   (Armv8 / RVWMO style, multi-copy atomic, same-address order, fences, acquire/release with RCsc, no
   dependencies). Tests SB, MP, LB with none / fence / xchg or acq-rel. Results checked against the x86-TSO paper's
   Intel examples 8-1 (MP forbidden), 8-2 (LB forbidden), 8-3 (SB allowed), 8-9 (SB with xchg forbidden), and
   SC ⊆ TSO ⊆ weak for every case.
9. x86 vs Arm: MP allowed only in the weak model; fences or release/acquire forbid it; LB (1,1) only in the weak
   model; plain atomic exchanges do not order SB on the weak model.
10. Locks on the MESI engine (rounds, random order, one access per core per round): bus transactions per handoff at
   4 / 16 / 64 cores: TAS 55 / 301 / 1261, TTAS 11.9 / 47.3 / 195, ticket 6.0 / 18.2 / 66, MCS 8.0 constant. Hold
   time H = 20 rounds **TUNED**: halved/doubled keeps the order TAS > TTAS > ticket > MCS at 64 cores, MCS ≈ 8,
   ticket within 5 %; only TAS scales with H (599 at H = 40, 16 cores).
11. Frontier (Nov 2026): established / demonstrated / claimed.
12. Closing: three questions.

## Diagrams (STANDARD §4a, inline SVG from app.js, labels from copy, portrait layout ≤ 600 px)

stale (two caches, one stale copy) · epochs (SWMR epochs on a timeline) · snoop (shared bus, BusRdX broadcast) ·
mesi (four states, 12 numbered arcs: processor-side solid, snoop-side dashed, evictions thin) · dir (snooping
broadcast vs directory with home node) · hops (3-hop read and an invalidating write as message sequences) · race
(lost update, two threads) · atomic (line held in M during a locked RMW) · ping (line moving between two cores
over time) · sbuf (store buffers breaking SC in SB) · litmus (SB and MP outcome tables, computed by the models) ·
mcs (MCS queue: tail pointer, nodes, release). Twelve in all.

## Sources (each opened by me on 2026-11-15 unless marked)

- D. J. Sorin, M. D. Hill, D. A. Wood, V. Nagarajan, *A Primer on Memory Consistency and Cache Coherence*, 2nd ed.
  (Morgan & Claypool, 2020): https://pages.cs.wisc.edu/~markhill/papers/primer2020_2nd_edition.pdf — §2.3 SWMR
  and data-value invariants; ch. 3 SC (Lamport 1979 cited there); ch. 4 TSO; ch. 5 relaxed models and SC for DRF
  (C++ / Java); ch. 7 snooping (MSI, MESI, MOESI; Illinois / Papamarcos & Patel 1984; Sweazey & Smith 1986 MOESI;
  Intel QPI MESIF); ch. 8 directories (home, 3-hop, coarse vector, limited pointers, §8.5 storage).
- P. Sewell, S. Sarkar, S. Owens, F. Zappa Nardelli, M. O. Myreen, "x86-TSO: A Rigorous and Usable Programmer's
  Model for x86 Multiprocessors", CACM 53(7), 2010: https://www.cl.cam.ac.uk/~pes20/weakmemory/cacm.pdf — the
  abstract machine, LOCK semantics, Intel SDM rev. 34 examples 8-1 to 8-10, vendor-manual contradictions.
- J. M. Mellor-Crummey, M. L. Scott, "Algorithms for Scalable Synchronization on Shared-Memory Multiprocessors",
  ACM TOCS 9(1), 1991: https://www.cs.rochester.edu/u/scott/papers/1991_TOCS_synch.pdf — TAS, TTAS, ticket, MCS;
  "O(1) remote references per lock acquisition".
- RISC-V unprivileged ISA, RVWMO chapter and Ztso:
  https://github.com/riscv/riscv-isa-manual/blob/main/src/unpriv/rvwmo.adoc and .../src/unpriv/ztso.adoc.
- Arm, "Synchronization Overview and Case Study on Arm Architecture", v1.2, June 2022:
  https://documentation-service.arm.com/static/62b4777131ea212bb66241e6 — permitted reorderings, DMB, LDAR/STLR,
  LDXR/STXR, LSE (LDADD, CAS, SWP).
- Arm Learning Paths, memory consistency examples:
  https://learn.arm.com/learning-paths/servers-and-cloud-computing/memory_consistency/examples/ — MP litmus on
  hardware, 458 of about 1,000,000 runs showed (1, 0).
- Chips and Cheese, "Testing AMD's Bergamo: Zen 4c Spam" (2024-06-22):
  https://chipsandcheese.com/p/testing-amds-bergamo-zen-4c-spam — core-to-core method (two cores bounce one
  value), intra-cluster 30–40 ns, cross-cluster 100–120 ns, cross-socket ~200 ns, worst just over 212 ns.
- Chips and Cheese, "AMD's Ryzen 9950X: Zen 5 on Desktop" (2024-08-14):
  https://old.chipsandcheese.com/p/amds-ryzen-9950x-zen-5-on-desktop — cross-CCD nearly 200 ns at launch.
- AMD press release, 5th Gen EPYC (2024-10-10): https://ir.amd.com/news-events/press-releases/detail/1219/ —
  EPYC 9965, 192 Zen 5c cores.
- Club386, "AMD 256-core Zen 6 EPYC Venice": https://www.club386.com/amd-256-core-zen-6-epyc-venice/ and
  StorageReview's report (2026-07-23) — 256 cores, 8 CCDs × 32, up to 1024 MB L3, "+70 %". (Builder's 16-core CCX
  claim removed by the reviewer, see Review.)
- Reviewer, opened 2026-11-15: hwbusters, "AMD launches Zen 6 with EPYC Venice" (2026-07-22):
  https://hwbusters.com/news/amd-launches-zen-6-with-epyc-venice-256-cores-on-tsmc-2nm/ — launch at Advancing AI
  2026, 256 cores, Zen 6c CCD 32 cores / 128 MB L3, "more than 70%" (vendor). StorageReview, "AMD EPYC Venice SP7
  review" (2026-11-10): https://www.storagereview.com/review/amd-epyc-venice-sp7-review — EPYC 9996, 256 Zen 6c
  cores, 1,024 MB L3, SP7 "generally available on November 10"; "a Zen 6c CCD has 32 cores sharing 128MB of L3".
- The Register (2026-06-01): https://www.theregister.com/a/5248150 — Xeon 6+ "Clearwater Forest", 288 E-cores,
  576 MB L3, two sockets.
- Hector Martin, "[PATCH 0/4] arm64: Support the TSO memory model" (2024-04-11):
  https://lists.openwall.net/linux-kernel/2024/04/11/40 — Apple's per-thread TSO bit, exposed through PR_SET_MEM_MODEL for x86 emulators (the patch names FEX-Emu; Rosetta 2's use of the bit is
  common knowledge, not stated in this source).
- X. Yu, S. Devadas, "Tardis: Time Traveling Coherence Algorithm for Distributed Shared Memory", PACT 2015:
  https://arxiv.org/abs/1501.04504 — O(log N) bits per line, 256-core simulation.
- cppreference, std::memory_order: https://en.cppreference.com/w/cpp/atomic/memory_order.

## Not verified from a primary source

- Arm ARM (DDI 0487) memory-model chapter B2: not opened (not fetchable); the Arm white paper and Learning Path
  were used instead. The weak model is "Armv8 / RVWMO style" as described in Chapters, not a full Arm model.
- Intel SDM cache locking: now checked by the reviewer against an SDM Vol. 3A mirror, §8.1.4 (older numbering):
  "For the P6 and more recent processor families, if the area of memory being locked ... is cached ... as
  write-back memory and is completely contained in a cache line, the processor may not assert the LOCK# signal ...
  This operation is called 'cache locking.'" (https://xem.github.io/minix86/manual/intel-x86-and-64-manual-vol3/o_fe12b1e2a880e0ce-261.html).
  The prose keeps "一般是" / "normally" because the SDM says "may". Current Intel PDF (chapter renumbered) not opened.
- AnandTech core-to-core latency tables: the site has closed; not used.
- 9950X cross-CCD latency later improved by firmware: secondary reports only; the prose says "刚上市时".
- Venice "+70 %" (StorageReview) and Xeon 6+ "+30 % per thread vs 192-core EPYC 9965" (Tom's Hardware headline seen
  in search, article not opened): vendor claims as reported; the prose labels both as unverified vendor numbers.
- Lamport 1979 and the C++11 / Java "SC for DRF" statement: via the Primer's chapters, not the originals.
- Venice in two-socket configurations: not claimed on the page.

## Facts that will go stale

Venice core counts and L3 (SP7 generally available 2026-11-10), Xeon 6+ figures, the largest coherent domain,
Apple's TSO mode support in Linux. FRONTIER.asOf = 2026-11.

## Checked / not checked

Checked: every prose number is a prose() value pinned in tests/models.cjs (11,568 checks); measured and frontier
figures re-typed in the test; MSI / MESI / MOESI / no-protocol by hand; both invariants and freshness after every
step of 20,000 random accesses per protocol; preset counts by hand; directory formulas; lost-update DP = brute
force and C(4k, 2k); CAS final counts; contended-line simulation = closed form; litmus results vs the x86-TSO
paper's examples and SC ⊆ TSO ⊆ weak; lock ordering and MCS constant; tuned parameters halved / doubled; every
live-sentence branch; copy keys reachable; no Chinese in html / app / models; registry anchors; alias ownership
against every sibling REGISTRY.json, atlas lessons and aliases.json; link whitelist; no link to A4. Browser test
at 1280 / 390 / 320 (overflow, clipping, 48 px targets, twelve diagrams: role, aria, labels inside, no overlap,
≥ 11 px), every model driven, reduced motion; canvas text sweep. Screenshots viewed: every diagram at 1280, 390
and 320; every model at 1280, 390 and 320. Reduced motion (390) checked by the browser test; its full-page screenshot is too tall to inspect by eye.
Not checked (builder): English (stub at the time; now reviewed, see Review); real hardware behaviour beyond the cited measurements; dependency-ordered litmus
tests (none modelled); non-multi-copy-atomic behaviour (Armv7, POWER).

## For the translator

Keep placeholders. Litmus code in `pre` blocks is built by app.js (x = 1, r1 = y). Diagram labels have tight
boxes (narrow layout 340 units): keep `dg.hops.*`, `dg.dir.core`, `dg.mcs.*` short. 「调出来的参数」 = "tuned
parameter". 「石蕊测试」 = "litmus test"; 「排号锁」 = "ticket lock"; 「家」 = "home (node)".

## Registrar notes

- Title zh 「多个核心怎么共用一块内存」, en "How Cores Share Memory"; 12 concepts #ch1–#ch12 (REGISTRY.json, en
  text written).
- One word, one owner: this page takes 缓存一致性 / cache coherence (#ch1), MESI 协议 / MOESI / MSI / 总线窥探
  (#ch3), as TASK-arch-series left them. It does not take 伪共享 / false sharing, MESI 状态 / MESI states or cache
  line ping-pong (A2, linked at A2 #ch9), NUMA words (B2), or distributed-systems' consistency words. No alias moves
  needed; the test checks all aliases against every sibling registry, atlas lessons and aliases.json.
- A4 (how-a-cpu-guesses-ahead) and B4 (CXL / NVLink) are named in plain text in ch11.p2; link them when live.
  A2 names this page in plain text (ch9.p1, ch12.links): link it when this page goes live.
- No provenance label, pages.config, atlas or search edits made.

## Review

Reviewer: Claude Code (claude-opus-5-5), separate session; did not build the page. Date: 2026-11-15.
Scope: zh and en read in full (every key of copy.zh.js and copy.en.js), every model driven in the browser, all 12
diagrams viewed at 1280 / 390 / 320 in both languages, models re-derived with an independent script.

Checks (independent Python, own engine and RNG): MSI / MESI / MOESI preset counts — private 48 / 32 / 32 tx (16
BusUpgr), prodcons 20 / 20 / 16 tx with 4 / 4 / 0 writebacks, migratory 47 / 46 / 31 tx with 15 / 15 / 0 writebacks,
read-only 4 — all as the page. MOESI removes exactly the M→S flush writebacks on a remote read; eviction writebacks
are unchanged (private: 16 under every protocol), and in "one writer, three readers" the O line ends dirty (one
writeback deferred, not removed). Directory storage (N + 2)/512: 12.89 % at 64, 50.4 % at 256, 200.4 % at 1024;
coarse 25.4 %, pointers 8.4 %. Lost update brute force k ≤ 4: 6 / 70 / 924 / 12,870 orders, min 1 / 2 / 2 / 2;
the correct orders are exactly C(2k, k), so 20 / 924 = 2.16 % at k = 3 and 252 / 184,756 = 0.14 % at k = 5. Race:
other seeds give 34.9–35.0 % at b = 4 and 31.8–34.2 % at b = 1024 (page seed 33–35 %). CAS: 2.84, 5.48, 10.5 steps
and 81 % failures at 32 threads (page 2.86, 5.5, 10.6). Contended line 1/(T + 1 ns): 32.3, 24.4, 9.9, 5.0 M/s;
62 / 82 / 402 ms. Locks: TAS = (n − 1)·H + 1 (1261 at 64, 599 at H = 40, 16 cores). Litmus: all eight test/sync
cases match the published SC / x86-TSO / Armv8 results; Intel SDM examples 8-1 (MP), 8-2 (LB), 8-3 (SB) opened in
an SDM mirror (https://xem.github.io/minix86/manual/intel-x86-and-64-manual-vol3/o_fe12b1e2a880e0ce-265.html),
8-9 (SB with xchg) confirmed by search. Spot-checked sources: Chips and Cheese Bergamo (30–40 / 100–120 / ~200 /
just over 212 ns, 2024-06-22), Arm Learning Path MP (458 of 1,000,000), Venice (hwbusters + StorageReview), Xeon
6+ (288 E-cores, 576 MB L3, 2S, Intel's +30 % per-thread claim: Tom's Hardware headline and other reports), Tardis
(arXiv abstract: O(log N), 16 / 64 / 256 cores, "similar performance to directory protocols"), Apple TSO patch
(openwall, 2024-04-11). Links resolve to existing anchors; sibling titles match pages.config.js.

Changes:
- ch11.d2 Venice: the 256-core part is Zen 6c (was "Zen 6"); the "two 16-core clusters per CCD" claim removed
  (StorageReview: 32 cores share 128 MB; sources disagree); dates now launch 2026-07-22 and SP7 GA 2026-11-10
  (was "Q4 2026"). FRONTIER.venice updated (ccxCores removed); test pins the new fields.
- ch3.p4: MOESI's 0 writebacks in "one writer, three readers" now says the O line ends dirty and owes one writeback;
  MSI's 9 memory reads no longer called "readers" (1 is the writer's fill; MESI's 1 is that fill).
- ch2.p3: at step 3 without a protocol both readouts already say broken (the model says so); prose said step 4.
- ch5.p5: "两头正好抵消 / cancel" → "大致抵消 / roughly cancel", with the seed caveat.
- ch7.p2: cross-chiplet link now to B2 #ch7 (chiplets), cross-socket to #ch4.
- ch7 readout "time for two threads to add a million each" was wrong for n ≠ 2 (it showed 2 M additions for any n,
  and private mode showed 1 M per thread): now "time for two million additions in total", private split over n.
- ch8.p5: the Intel examples are named (8-1 MP, 8-2 LB, 8-3 SB, 8-9 SB + xchg) and marked as the old Chapter 8
  numbering; ch9.limit: Arm is other-multi-copy atomic (own-store forwarding), which the weak model omits.
- ch11.d5: the Linux patch is for x86 emulators such as FEX-Emu (the source does not mention Rosetta).
- English: ch10 title ("does waiting longer…" → "do more waiters…"); "Odd (r1, r2)" → "Non-SC (r1, r2)" and
  "odd outcome" → "non-SC outcome" everywhere, glossed in ch8.p4 and the litmus caption (zh gloss of 怪结果 too);
  epochs caption no longer glosses a label that does not exist ("(R)"; R/W is glossed); "is then evicted" (the core)
  → "loses the line"; ch12.sum broken sentence; ch1.read.last; ch5.say.k1; diagram labels shortened where they
  touched box edges (atomic "Read, add, write; held in M", sbuf "Store buffer (FIFO)" glossed in caption, race
  "Read 5"); "Core 0" kept on one line in the ch3 grid.
- Diagrams: MESI legend (1280) no longer runs into the next line sample (two rows); MESI circles larger at ≤ 600 px;
  snooping diagram at ≤ 600 px puts four cores in one row so no snoop line crosses another core's box.
- tests/models.cjs: English dates and facts, Intel example mapping, no CJK in copy.en.js, sibling English titles,
  MOESI deferred writeback, MSI/MESI memory reads, ch7 readout, ch2 step 3, no CCX claim.

Unverified: Arm ARM B2 and the RISC-V RVWMO chapter not opened (Arm Learning Path and white paper only); Primer 2nd
ed., Sewell et al. text and Mellor-Crummey & Scott not opened by the reviewer (PDFs not readable in this
environment; the SDM examples they cite were checked directly); current Intel SDM chapter number for the examples;
Club386 / The Register pages not reopened; Lamport 1979 original.

Test results after the review: tests/models.cjs PASS 11,605 checks; tests/browser.cjs PASS three runs in a row (zh + en at
1280 / 390 / 320, reduced motion); canvas-text-overlap --sweep PASS, 582 canvas states, zh/en, scroll-aware mode.

## Registrar (2026-11-15)

- Essay commit 445f4b67 (this tree as reviewed, on drafts/arch-20261115 as b00a3be6). Registered with A4 in one batch.
- Links: ch11.p2 links A4 #ch8 (out-of-order execution with the store buffer, memory disambiguation) and ch12.links links A4's
  page top, zh and en; B4 (coherent interconnects, being written) stays plain text. Siblings now link here: A2 ch9.p1, ch12.links
  (page top) and ch9.limit (#ch3); A3 ch13.links; A4 ch12.links (#ch8). tests/models.cjs allows and requires the A4 links and
  checks A4's quoted titles.
- Aliases: as planned, this page takes 缓存一致性 / cache coherence (#ch1) and MESI 协议 / MOESI / MSI 协议 / 总线窥探 (#ch3); plain
  MSI stays with how-pcie-works #ch7 (MSI interrupts), MSI-X 中断 with why-nvme-is-fast. One-click additions: #ch4 窥探和目录的区别,
  总线窥探和目录协议的区别, snooping vs directory; #ch5 为什么多线程加法结果不对, 多线程加法结果不对, why multithreaded counter gives
  wrong result; #ch8 内存模型, memory model; #ch9 x86 和 ARM 内存序, 内存序, x86 vs Arm memory ordering, memory ordering.
- Scripts stay at `?v=20261115` (first deployment).

## Registrar of B3 and B4 (2026-11-15)

- B4 (`coherent-interconnects`) is live, so ch11.p2 and ch12.links link its page top, zh and en, instead of naming "a later essay
  on links between chips". tests/models.cjs requires both links (it used to require the plain text) and checks B4's quoted title.
- No alias changed. Scripts move to `?v=20261115b` (`?v=20261115` was deployed).

## Registrar of A6 and the boot essay (2026-11-15)

- ch12.links gains one clause linking how-a-gpu-computes #ch10 (why a GPU does not keep its SMs' L1 caches coherent; that
  chapter builds on this page's #ch3 and #ch4), zh and en; tests/models.cjs allows A6 and checks the link and quoted title.
  缓存一致性 / cache coherence stay here (A6 #ch10 has only "GPU cache coherence"). Scripts move to `?v=20261115c`.
