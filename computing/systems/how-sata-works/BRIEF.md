# BRIEF — SATA 为什么用了二十多年 (Why SATA Has Lasted Over Twenty Years)

Built-By: Claude Code (claude-opus-5-5)
Verified-By: self-check by builder (node model test, browser test zh at 1280/390/320 and reduced motion, canvas sweep, screenshots at three widths); Claude Code (claude-opus-5-5), independent review in a separate session 2026-11-14 (scope under "Review")
Category: computing 计算机 / subtopic systems 系统 · Stage: university
Series: storage series S2 (`specs/essay-briefs/TASK-storage-series.md`)
Format: long interactive essay. Chinese and English are both complete (the `enStub` flag has been removed; "For the translator" below is historical).
Files: index.html, copy.zh.js, copy.en.js (stub), models.js, app.js, REGISTRY.json, tests/models.cjs, tests/browser.cjs

## The one question

一根七针的数据线、一套 2004 年定下的主机接口，为什么到 2026 年还接在最大的机械硬盘上？
And the second question: when the computer says "read sector 123456", what does that sentence turn into on
the wire, and how does the data come back?

## Changes from the starting list (TASK file)

- ch1 links S1 (`what-a-drive-is-made-of`) as plain text only, not a live link, because S1 is not live yet.
  The layer table (wire / link / transport / command set / host interface / connector) is drawn here.
- ch2 model is a timing budget built from ATA/ATAPI-7 Table 51 and Annex E (data setup, hold, cable and
  connector skews), not a generic "skew vs width" plot. It shows which Ultra DMA modes still close on 80- and
  40-conductor cables.
- ch3 adds the scrambler as a switch, and the comma and run-length readouts. The 552 MB/s result is not
  redone; the page links NVMe #ch2 and computes only the raw 150/300/600 MB/s.
- ch4 adds the hex view of the actual Register H2D FIS, its CRC and the scrambled dwords, and the wire
  accounting (frames, ALIGN, handshake round trips), which ch7 and ch8 reuse as the link cap.
- ch5 builds its own HDD model (S1 is not available to import): Jacobson & Wilkes seek curve fitted to the
  Barracuda 7200.12 manual. Not the multicore queue story.
- ch7 has a model (the TASK only asked for prose): CBS vs FBS port multiplier, random and sequential.
- ch8 has a small model (outer-edge rate vs rpm and areal density). The "SATA-IO decided not to do 12 Gb/s"
  reason could not be sourced, and the page says so.
- ch10 added: three questions for a spec sheet, and the summary.
- ch6 model metric: average power at the same access rate (energy per idle gap ÷ mean gap). An earlier draft
  divided by gap + wake latency, which counted the slower access rate as a saving and hid the break-even loss;
  fixed during self-check, so curves now rise above "always on" for gaps shorter than break-even (chart clipped
  at 300 mW, stated in the figure caption).

## Chapters, models, published results, tuned parameters

| Ch | Title | Model (models.js) | Basis |
|---|---|---|---|
| 1 | SATA 在地图上的哪里 | table only | SATA 3.5a scope; T13 ATA; Intel AHCI |
| 2 | 从并行到串行 | `UDMA.budget` | ATA/ATAPI-7 v2 Table 51, Annex E |
| 3 | 线上的比特：8b/10b | `B8.encode/stream/stats/commas/period`, `LINK.scrambler` | SATA 3.5a Tables 85/86/88/89, §9.6, Annex A; Widmer & Franaszek 1983 |
| 4 | 一条读命令的五帧 | `LINK.h2dRead/crc/readFrames/wire` | SATA 3.5a §10.5 FIS formats, §13.6.4 READ FPDMA QUEUED, Table 92/93 primitives, Annex A.3 CRC example |
| 5 | 盘自己排队：NCQ | `DISK.simulate` (FIFO/SSTF/SATF, closed queue) | Jacobson & Wilkes 1991 seek model and SATF; Barracuda 7200.12 manual |
| 6 | 热插拔与省电 | `POWER.run/breakEven/best` | SATA 3.5a Table 78/79 exit times; Benini et al. 2000 break-even; 870 EVO datasheet |
| 7 | 端口倍增、eSATA、mSATA 与 M.2 | `PM.random/seq` | SATA 3.5a §16.7 (CBS/FBS); ch4 wire cap; ch5 disk |
| 8 | 为什么停在 6 Gb/s | `HDD.od/densToReach` | Exos 32 TB datasheet, rate ∝ rpm × √(areal density) |
| 9 | 前沿在哪（截至 2026 年 11 月） | `FRONTIER` data block | sources below |
| 10 | 读规格表时问三件事 | prose | — |

Published results reproduced and pinned in tests/models.cjs:
- the 8b/10b encoder reproduces all 512 entries of SATA 3.5a Table 88 (RD− and RD+), and K28.3/K28.5 of Table 89;
- the CRC reproduces the Annex A.3 worked example trace (11E353FD … 319FFF6F);
- the scrambler reproduces the first Annex A outputs (C2D2768D, 1F26B368, A508436C, …);
- the fitted seek curve reproduces the 8.5 ms average seek of the Barracuda 7200.12 manual.

Key numbers (all from `prose()`): UDMA 6 133.3 MB/s, skew+setup+hold use 12.76 of 15 ns at mode 6 (margin
0.24 ns); 1.5/3/6 Gb/s carry 150/300/600 MB/s; one 4 KiB queued read is 1,267 Dwords on the wire, 8.45 µs at
6 Gb/s, 81% payload; a 128 KiB read is 97% payload, 580 MB/s cap. NCQ (seed 7, 3000 requests): FIFO 78 IOPS
at QD1; SATF 131/158/190 IOPS at QD 8/16/32. Break-even idle: Partial 16.7 µs, Slumber 12.5 ms, DevSleep
20.3 ms; DevSleep at 1 s mean idle averages 5.5 mW (96% saved, ~20 ms extra wait). Port multiplier: 4 disks FBS random 526 IOPS, CBS 112 IOPS. HDD needs 3.9× areal density at
7200 rpm to reach 560 MB/s.

Tuned parameters (not from a source; each is flagged in the chapter's "limit" paragraph with its sensitivity):

| Parameter | Value | Range tried | Effect (pinned) |
|---|---|---|---|
| full-stroke seek | 16 ms | 12–20 ms | SATF QD16 148–168 IOPS; gain over FIFO 1.89–2.14× |
| short/long seek boundary | 30% of stroke | 15–50% | (same sweep) |
| inner/outer radius ratio | 0.45 | 0.35–0.6 | (same sweep) |
| link-on idle power | 150 mW | ×0.5–×2 | Slumber break-even 11.1–16.7 ms |
| Partial power | 60 mW | ×0.5–×2 | Partial break-even 12.5–50.0 µs |
| Slumber power | 30 mW | — | stands in from 870 EVO "Idle, DIPM on" (state not stated in the sheet) |

## Sources (each opened by me on 2026-11-14 unless stated)

- Serial ATA Revision 3.5a Gold, SATA-IO, 2021-03-02 —
  https://sata-io.org/system/files/specifications/Serial%20ATA%20Revision%203.5a.pdf (revision history,
  Tables 1, 5, 52, 54, 76, 78, 79, 85, 86, 88, 89, 92, 93; §9.6; Annex A; §10.5; §13.6; §16.7)
- SATA-IO purchase page (3.5a is the newest revision on sale) — https://sata-io.org/developers/purchase-specification
- Serial ATA 1.0a, 2003-01-07 — https://web.mit.edu/fustflum/etcetera/serialata10a.pdf (§2.1 "~10 years", §2.2 Gen3 mid-2007)
- ATA/ATAPI-7 Vol 2 rev 4b (T13/1532D) — https://users.utcluj.ro/~baruch/media/sie/labor/ATA-ATAPI/d1532v2r4b-ATA-ATAPI-7.pdf (Table 51, Annex E)
- Intel AHCI 1.3.1 page — https://www.intel.com/content/www/us/en/io/serial-ata/serial-ata-ahci-spec-rev1-3-1.html (32 ports, 32 slots)
- Intel press release, AHCI 1.0, 2004-04-13 — https://www.intel.com/pressroom/archive/releases/2004/20040413corp.htm
- SATA Express announcement 2011-08-09 (SATA-IO release as reprinted by design-reuse.com; StorageNewsletter 2011-08-10)
- Seagate Barracuda 7200.12 product manual rev H — https://www.seagate.com/staticfiles/support/disc/manuals/desktop/Barracuda%207200.12/100529369h.pdf
- Seagate Exos M datasheet DS2045.4-2511 (Exos 32 TB: SATA 6Gb/s, 285 MB/s, 170 IOPS QD16) —
  https://www.seagate.com/content/dam/seagate/en/content-fragments/products/datasheets/exos-m-v1-2/exos-v1-2-DS2045-4-2511-en_US.pdf
  (DS2046.1-2512 gives the same 285 MB/s)
- Samsung 870 EVO datasheet rev 1.1 — https://download.semiconductor.samsung.com/resources/data-sheet/Samsung_SSD_870_EVO_Data_Sheet_Rev1.1_230509_10129500053000.pdf (560 MB/s, idle 30 mW, DevSleep 2.5 mW)
- D. M. Jacobson, J. Wilkes, HPL-CSP-91-7 (1991) — https://pages.cs.wisc.edu/~remzi/Classes/838/Fall2001/Papers/hp-sched.pdf
- Seagate press release, 44 TB Mozaic 4+, 2026-03-03 —
  https://investors.seagate.com/news/news-details/2026/Seagate-Delivers-Industrys-Highest-Capacity-Hard-Drives-with-Next-Generation-Mozaic-4/default.aspx
- StorageReview, WD 40 TB UltraSMR shipping and high-bandwidth drive, 2026-08-06 —
  https://www.storagereview.com/news/wd-bets-8x-bandwidth-beats-more-terabytes-as-40tb-ultrasmr-starts-shipping (secondary)
- OCP NVMe HDD project page (spec rev 1.0b, 2023-04-20 per the file URL) — https://www.opencompute.org/projects/storage/nvme-hdd/
- Micron 1100 datasheet (DevSleep 2 mW), via a distributor mirror — secondary, used only as a cross-check
- Widmer & Franaszek, IBM J. Res. Dev. 27:440 (1983) — cited for the code's origin; the tables come from SATA 3.5a

## Facts that will go stale

ch9 and the Exos / 870 EVO figures: latest SATA revision (3.5a), largest shipping HDDs (Seagate 44 TB, WD 40 TB),
WD high-bandwidth drive (2× demo, 8× by 2030 target), WD HAMR 44 TB (H1 2027), Seagate 10 TB/platter goal,
OCP NVMe HDD status. All are in `FRONTIER` in models.js, dated as of 2026-11.

## Checked / not checked

Checked against primary sources: every SPEC figure (line rates, pins, swings, exit times, MDAT, cable lengths,
FIS sizes, ALIGN spacing, round-trip, CRC/scrambler constants, opcodes, tag field, revision dates), Table 88/89,
Annex A CRC and scrambler examples, UDMA timings, Barracuda seek figures, Exos and 870 EVO figures, Seagate 44 TB.

Not verified from a primary source:
- Partial and Slumber power per state (no datasheet gives them; tuned / stand-in, flagged on the page);
- why SATA-IO never did a 12 Gb/s SATA (no official statement found; the page says so);
- the interface of the Seagate 44 TB and WD 40 TB drives (press material does not say; the page says so);
- WD 40 TB shipping and HBD figures come from StorageReview, not WD's own release;
- Benini et al. 2000 was not opened; the break-even formula used is the standard one;
- the full-stroke seek (16 ms) is tuned;
- the OCP NVMe HDD date comes from the document URL, and product shipments were not checked;
- the 552 MB/s figure belongs to the NVMe essay and is only linked.

## For the translator

copy.en.js is a same-keys copy of copy.zh.js with `window.ESSAY_COPY.enStub = true`. While that flag is set, the
page treats English as absent and shows Chinese; tests skip the English sweeps and the registry-en title match.
Translate every value, keep every `{placeholder}` and HTML tag, then delete the `enStub` line. The English title
must equal REGISTRY.json `title.en` ("Why SATA Has Lasted Over Twenty Years") plus the " · …" suffix pattern.

## Review

Reviewer: Claude Code (claude-opus-5-5), separate session from the builder. Date: 2026-11-14.
Scope: the whole essay in zh and en; every model driven in the browser; models re-derived from their sources;
standards facts against the SATA 3.5a and ATA/ATAPI-7 PDFs (downloaded from the URLs above and searched as text);
frontier facts against primary sources plus a second source; sister-essay overlap; English quality.

Checks done:
- ATA/ATAPI-7 Vol 2 rev 4b Table 51 (t2CYCTYP, tCYC, tDS, tDH for modes 0–6) and Annex E.5.1.1 (negative and positive
  skew −5.99/5.38 ns, −4.34/3.83 for mode 5 and −3.6/3.06 for mode 6, and −70/−36/−22 ns extra for 40-conductor
  modes 0–2) all match `UDMA`. Recomputed by hand: mode 6 uses 12.76 of 13.0 ns; mode 5 has only 0.03 ns, so it fails
  first (×1.004), then mode 6 (×1.04) and mode 4 (×1.32). The budget is the page's own sum (stated in ch2.limit).
- 8b/10b: parsed SATA 3.5a Table 88 straight from the spec text with my own script (not the test's typed copy):
  all 256 bytes × both RDs match `B8.encode`; K28.3/K28.5 match Table 89. Random 20,000-byte stream: longest run 5,
  running-sum swing 6, as ch3.p3 says.
- CRC and scrambler: the Annex A.1.5 trace (11E353FD … 319FFF6F) and the A.2.4 outputs (C2D2768D, 1F26B368, …) read
  from the spec match the test's pins. Hex view: 08608027 XOR C2D2768D = CAB2F6AA, as shown.
- READ FPDMA QUEUED: field layout (SECTOR COUNT in FEATURES, TAG in COUNT(7:3), DEVICE bit 6, 60h) per §13.6.4.1;
  DMA Setup is 7 Dwords with the TAG in Dword 1 (§13.6 figure); SDB carries ACT(31:0) in Dword 1. Order and senders
  (H2D from host; D2H with BSY cleared, DMA Setup, Data, SDB from the drive) are right.
- Wire account for 4 KiB re-derived by hand: FIS 5+5+7+1025+2 = 1044, +15 (SOF/CRC/EOF) = 1059, +200 handshake
  (5 frames × 2 × 20) = 1259, +8 ALIGN = 1267 Dwords, 8.45 µs, 81% payload. The 20-Dword round trip is Table 95's HOLD/HOLDA
  example, used as a stand-in for every handshake (stated on the page).
- NCQ: QD1 FIFO 78 IOPS ≈ 1/(8.5 + 4.17 + transfer ms), checked by hand; the SATF gain over FIFO at QD32 stays 2.26–2.58×
  across the tuned sweep and 187–189 IOPS across seeds 1–4, so "more than double" survives.
- Link power: break-even P_on·L/(P_on − P_s) gives 16.7 µs / 12.5 ms / 20.3 ms; the ch6 fix (divide energy per gap by
  the mean gap, not by gap + wake) is right: it makes the curve cross "always on" exactly at break-even (τ = 0), while the
  old denominator could never exceed P_on. DevSleep at 1 s: 5.5 mW and ~20 ms, recomputed by hand. MDAT hold term
  E[(MDAT − X)+] checked.
- Port multiplier arithmetic (4 × 131 = 526 FBS; CBS drain 112; seq 570 then cap 580) and HDD sqrt rule (3.9×, 520,
  594, 570) recomputed.
- Spec facts read in SATA 3.5a: revision dates (§1, incl. 3.5 on 2020-07-01, 3.5a "changed the words master and slave"),
  SATA Express obsoleted in 3.4 (TPR082), DevSleep and M.2 in 3.2, mSATA in 3.1, Table 78 exit latencies, Table 79
  MDAT/DETO, Table 76 OOB times, ALIGN pair every 256 Dwords, hot plug "R" for backplane and "NS" for internal cable
  (Table 1), "Gen3i is not defined for eSATA" (note 6), port multipliers up to 15 device ports.
- Frontier, two places each: Seagate 44 TB Mozaic 4+ in volume to two hyperscalers (Seagate release 2026-03-03, plus
  trade press); WD 40 TB shipping in the quarter ended 2026-07-03, 44 TB HAMR H1 2027, 60 TB 2028, 100 TB 2029, HBD 2×
  shown / 8× by 2030, Dual Pivot 2028 (StorageReview 2026-08-06, plus Tom's Hardware and other press, all citing WD);
  no SATA revision after 3.5a (SATA-IO purchase page, plus search); SATA Express announced Aug 2011, 8/16 Gb/s (Engadget
  2011-08-10 and others). Exos DS2045.4-2511 (SATA 6Gb/s, 285 MB/s, 170 IOPS QD16, idle A 6.9 W, 3 TB/platter) and the 870 EVO
  sheet (560 MB/s, idle DIPM on 30 mW, DevSleep 2.5 mW for 250/500 GB, 2.0 W read) were checked in the PDFs.
- No search-word overlap: no alias in REGISTRY.json appears in the aliases of why-nvme-is-fast or what-a-drive-is-made-of
  (they share only category tags). Chapters point to NVMe #ch1–#ch3 for the multicore queue and 552 MB/s results instead of
  redoing them.

Changes made:
- ch4 canvas: the "… dwords in total" line was clipped at 320 px in English; it now shrinks to fit (`fitFont` in
  app.js, also used for the frame names), and the English label is shorter.
- ch6.limit (zh+en): added how far the DevSleep-over-Slumber crossover moves when the tuned awake power is halved or
  doubled (27–109 ms; 55 ms by default), and ch6.p3 now quotes the computed crossover ("past about {xDS} ms") instead of a
  hard-coded "0.1 s", which failed between 100 and 109 ms at the doubled end. New `POWER.devOverSlumber`, prose keys xDS/xDSlo/xDShi, pinned in tests.
- ch2.p3: "above ×k4 only mode 3 remains" → the fastest mode left is mode 3 (modes 0–2 also close); pinned with
  `UDMA.fastest` just above/below k6 and k4.
- ch5.p2: dropped "like an elevator" (SSTF is not the elevator/SCAN algorithm). ch5.p4: "why 32" now says the
  format fixes it (5-bit tag, 32-bit SActive) before the one-arm argument; pinned.
- ch7 eSATA: misquote "Gen3i is not applicable to eSATA" → the spec's words "Gen3i is not defined for eSATA"; pinned.
- ch4.p3: "Measured SATA SSDs are rated at 560" (measured vs rated) → rated at up to 560 MB/s (zh likewise).
- English only: "{wire} Mb/s per second"; "tens of milliseconds" where the Chinese and the model say ten-odd ms
  (ch4.p4, ch10.q2); "the largest 44 TB HAMR drive" wording; OCP spec named an NVMe hard-drive specification;
  "tenfold" → more than tenfold (30 vs 2.5 mW).
- This BRIEF: header no longer says English is a stub.

Not verified:
- Benini et al. 2000 not opened (the break-even formula is the standard one and re-derived above).
- The 150 mW / 60 mW link powers remain tuned; Slumber 30 mW remains a stand-in.
- WD's 40 TB shipping and HBD figures rest on trade press quoting WD's earnings call, not a WD document I opened.
- OCP NVMe HDD spec revision/date not re-opened; SATA Express 2011-08-09 date taken from press of 2011-08-10.
- Intel AHCI 1.0 press release and the Barracuda 7200.12 manual not re-opened.
- "Real drive firmware has a similar [aging] safeguard" (ch5.p3) is unsourced but generic.

- Registrar (2026-11-15, storage series S4): ch10.q2 links how-usb-drives-talk #ch6 (the USB bridge) and ch10.links
  links the essay, zh and en; `tests/models.cjs` checks the anchors. `tests/browser.cjs`: `pick()` clicks the visible
  label and waits until the radio is checked, `show()` waits until smooth scrolling has stopped; the forced click on the
  1 px input could land mid-scroll, so "ch2 40-conductor mode 6 not allowed" failed occasionally. No numeric check
  changed. Scripts load with `?v=20261115`.
