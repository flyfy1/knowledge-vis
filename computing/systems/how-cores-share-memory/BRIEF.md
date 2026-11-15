# BRIEF — 多个核心怎么共用一块内存 (How Cores Share Memory)

Built-By: Claude Code (claude-opus-5-5)
Verified-By: self-check by builder (node model test, browser test zh at 1280/390/320 and reduced motion, canvas sweep, screenshots of every model and diagram at three widths); independent review pending
Category: computing 计算机 / subtopic systems 系统 · Stage: university
Series: computer architecture series A5 (`specs/essay-briefs/TASK-arch-series.md`)
Format: long interactive essay. Chinese written in full; `copy.en.js` is a same-keys stub (`enStub = true`), so
the page falls back to Chinese until it is translated.
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
  StorageReview's report (2026-07-23) — 256 cores, 8 CCDs × 32, 16-core CCX, up to 1024 MB L3, SP7 in Q4 2026, "+70 %".
- The Register (2026-06-01): https://www.theregister.com/a/5248150 — Xeon 6+ "Clearwater Forest", 288 E-cores,
  576 MB L3, two sockets.
- Hector Martin, "[PATCH 0/4] arm64: Support the TSO memory model" (2024-04-11):
  https://lists.openwall.net/linux-kernel/2024/04/11/40 — Apple's per-thread TSO bit, used by Rosetta 2.
- X. Yu, S. Devadas, "Tardis: Time Traveling Coherence Algorithm for Distributed Shared Memory", PACT 2015:
  https://arxiv.org/abs/1501.04504 — O(log N) bits per line, 256-core simulation.
- cppreference, std::memory_order: https://en.cppreference.com/w/cpp/atomic/memory_order.

## Not verified from a primary source

- Arm ARM (DDI 0487) memory-model chapter B2: not opened (not fetchable); the Arm white paper and Learning Path
  were used instead. The weak model is "Armv8 / RVWMO style" as described in Chapters, not a full Arm model.
- Intel SDM statement that a locked RMW on cacheable memory locks the cache line, not the bus: from memory and the
  Primer's discussion; the SDM itself was not opened. The prose says "一般是".
- AnandTech core-to-core latency tables: the site has closed; not used.
- 9950X cross-CCD latency later improved by firmware: secondary reports only; the prose says "刚上市时".
- Venice "+70 %" (StorageReview) and Xeon 6+ "+30 % per thread vs 192-core EPYC 9965" (Tom's Hardware headline seen
  in search, article not opened): vendor claims as reported; the prose labels both as unverified vendor numbers.
- Lamport 1979 and the C++11 / Java "SC for DRF" statement: via the Primer's chapters, not the originals.
- Venice in two-socket configurations: not claimed on the page.

## Facts that will go stale

Venice core counts and L3 (reported, not shipping until Q4 2026), Xeon 6+ figures, the largest coherent domain,
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
Not checked: English (stub); real hardware behaviour beyond the cited measurements; dependency-ordered litmus
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
