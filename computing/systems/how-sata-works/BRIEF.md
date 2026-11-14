# BRIEF — SATA 为什么用了二十多年 (Why SATA Has Lasted Over Twenty Years)

Built-By: Claude Code (claude-opus-5-5)
Verified-By: self-check by builder (node model test, browser test zh at 1280/390/320 and reduced motion, canvas sweep, screenshots at three widths); independent review pending
Category: computing 计算机 / subtopic systems 系统 · Stage: university
Series: storage series S2 (`specs/essay-briefs/TASK-storage-series.md`)
Format: long interactive essay. Chinese is complete. **English is a stub** (see "For the translator").
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
