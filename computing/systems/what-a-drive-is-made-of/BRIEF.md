# BRIEF — 硬盘里到底是什么 (What a Drive Is Made Of)

Built-By: Claude Code (claude-opus-5-5)
Verified-By: self-check by builder (node model test, browser test zh at 1280/390/320 plus en stub, canvas sweep, screenshots at three widths); independent review pending
Category: computing 计算机 / subtopic systems · Stage: university
Format: long interactive essay; copy.zh.js written; copy.en.js is a same-keys stub (values still Chinese) for a translator
Files: index.html, copy.zh.js, copy.en.js (stub), models.js, app.js, REGISTRY.json, tests/models.cjs, tests/browser.cjs
Task: specs/essay-briefs/TASK-storage-series.md § S1 (Yangyu, 2026-11-14)

## The one question

一块机械硬盘和一块固态硬盘，都叫「硬盘」，里面装的东西完全不同。为什么电脑可以用同一套方式去读它们？
它们各自的快、慢、坏，分别是从哪来的？

## Ladder (each chapter needed by the next)

| ch | law (short) | model | published result | tuned |
|---|---|---|---|---|
| 1 #ch1 | the OS sees numbered blocks | 512e write of 4 KiB at a partition offset: physical sectors touched, read-modify-write | Advanced Format arithmetic | — |
| 2 #ch2 | an HDD read is mostly waiting | seek(x) + 30000/rpm + 4 KiB ÷ mean rate; short-stroke span; rate ∝ radius | Ruemmler & Wilkes 1994 seek form (√d short, linear long; HP 97560 coefficients); zoned recording | time scale A, B fitted to 1.0 ms single-track / 8.5 ms average (Barracuda 7200.12); inner/outer radius 0.5 (0.4–0.6 → mean seq 174–199 MB/s) |
| 3 #ch3 | shingling: gain saturates, rewrite cost grows | gain B/((B−1)q+1); mean rewrite (B+1)/2 tracks, 2 revolutions each, track size from ch2 | geometry of overlapping tracks | q and B are sliders (illustrative) |
| 4 #ch4 | n bits → 2ⁿ levels in one window | Gaussian Vth states; RBER = 2(L−1)/L·Q(Δ/2σ)/n with Gray code; σ(N) = σ0 + kN | AWGN channel model, Cai et al. 2017 §6.2 | window 6 V (drops out of every endurance result — pinned); σ0, k: see ch5 |
| 5 #ch5 | wear-out = RBER reaching the ECC limit | BCH-type code, k = 8192, l = k + 14t, P_fail = binomial tail (Cai Eq. 1), UBER ≈ P_fail(t+1)/k; endurance per cell type; lifetime = PEC(1+OP)/(365·DWPD·WA) (Cai Eq. 4); Arrhenius AF | Cai et al. 2017 Eqs. 1, 4; JESD218 UBER targets | σ0, k solved so that MLC = 3,000 and TLC = 1,000 P/E at the default ECC (Cai 2017's 1x-nm planar figures). Predictions: SLC 9,838, QLC 179, PLC 0. Calibration points halved/doubled: QLC 0–1,590 (prose says so); ordering SLC>MLC>TLC>QLC holds in every case (pinned). OP 7.4% assumed (GiB/GB). Ea is a slider (no primary value read) |
| 6 #ch6 | no in-place update; a map hides it | page-mapped log-structured FTL, 8×4 pages, 24 LBAs, greedy GC, seeded RNG; DOM grid + map table | standard page-level FTL with greedy victim selection | sizes chosen for display |
| 7 #ch7 | "interface" is five layers | walk form factor → connector → lanes → transport → command set, report the first mismatch | — (compatibility rules from standards, see sources) | — |
| 8 #ch8 | latency + size/bandwidth | three devices, size slider 4 KiB–1 GiB; break-even size = latency × bandwidth | latency–bandwidth model (Hennessy & Patterson) | HDD from ch2; SSDs from data sheets (measured by vendor) |
| 9 #ch9 | frontier, dated | FRONTIER data block in models.js, prose pinned to it | — | — |
| 10 #ch10 | three questions | — | — | — |

Reuse: ch1 uses ch2's revolution; ch3 uses ch2's track size and revolution; ch5 uses ch4's σ(N); ch8 uses ch2's
HDD; ch10 points back to every chapter.

## Changes from the starting list

- Kept all nine and added ch10 (a usable ending: three questions).
- ch4 and ch5 split the work differently: ch4 is levels and RBER only; ch5 derives endurance from the ECC model
  (Cai Eq. 1) through ch4's wear law, then the lifetime equation (Cai Eq. 4), TBW/DWPD and retention.
- ch5 retention: the Arrhenius activation energy is a slider, not a stated fact (JESD218/JEP122 not opened).
- ch6: the FTL toy shows the map itself; the steady-state WAF formula, OP and TRIM are left to NVMe #ch6 (linked).
  No fill-rate slider.
- ch7: U.3 left out of the model because secondary sources disagree on U.2 drives in U.3 bays; mentioned in prose.
- ch8: the SSD side uses vendor QD1 figures (latency = 1/IOPS) instead of a NAND tR + protocol model, so the
  protocol split is linked to NVMe #ch1 rather than re-derived. 552 MB/s (NVMe #ch2) is linked, not restated.
- ch3: no areal-density numbers (no primary source opened for current BPI/TPI); prose gives the formula only.
- 固态硬盘为什么比机械硬盘快 / SSD vs HDD is taken here (#ch8) as decided by the team lead. None of the NVMe page's
  owned words appear in REGISTRY aliases (test enforces it).

## Sources (opened by me; date opened 2026-11-14 unless noted)

| figure | source | checked |
|---|---|---|
| seek model form; HP 97560: 3.24+0.400√d ms (d ≤ 383), 8.00+0.008d ms, 1,962 cyl, 4,002 rpm; settle 1–3 ms; average seek = 1/3 stroke convention | Ruemmler & Wilkes, IEEE Computer 27(3):17–29, 1994, https://www.cs.cmu.edu/~natassa/courses/15-721/papers/IEEEComputer.DiskModel.pdf | text extracted, Table 2 read |
| 7,200 rpm desktop drive: track-to-track 1.0 ms read, average 8.5 ms read, average latency 4.16 ms (2009 generation) | Seagate Barracuda 7200.12 Serial ATA Product Manual 100529369 rev C, April 2009, https://www.seagate.com/staticfiles/support/disc/manuals/desktop/Barracuda%207200.12/100529369c.pdf | table read |
| 8 TB 7,200 rpm enterprise HDD: max sustained 249 MB/s; avg latency 4.16 ms; 4Kn/512e options; 1 sector per 10¹⁵ bits | Seagate Enterprise Capacity 3.5 HDD data sheet DS1882, https://www.seagate.com/www-content/datasheets/pdfs/ent-cap-3-5-hdd-data-sheetDS1882-3-1610GB-en_GB.pdf | text extracted |
| head flies < 5 nm; TFC brings transducer within 1–2 nm | UC Berkeley CML reports (search result summaries of https://cml.berkeley.edu/wp-content/uploads/blue-reports/16006.pdf and G20001) | **summary only; PDFs not opened** |
| 512e read-modify-write; sector 63 vs 2048 alignment | Thomas-Krenn wiki "Advanced Sector Format of Block Devices"; Dell WP27 "512e and 4Kn Disk Formats" (via search summary) | **search summaries; WD/Seagate AF white papers not opened** |
| SMR: tracks partially overwrite the previous one; drive-managed vs host-managed; no zone size given | https://zonedstorage.io/docs/introduction/smr | read |
| Gaussian (AWGN) Vth model; ECC failure Eq. 1; ECC handles RBER 10⁻³–10⁻²; JEDEC 10⁻¹⁵; lifetime Eq. 4; OP Eq. 5; MLC ~3,000, TLC ~1,000 P/E (1x-nm), 5x-nm MLC ~10,000, old SLC 150,000; Arrhenius used for refresh | Cai, Ghose, Haratsch, Luo, Mutlu, Proc. IEEE 105(9):1666, 2017, https://arxiv.org/abs/1706.08642 (PDF text extracted) | read relevant sections |
| JESD218 classes: client 30 °C 1 yr, UBER 10⁻¹⁵; enterprise 40 °C 3 months, UBER 10⁻¹⁶ | 2011 FMS slide by A. Cox, https://files.futurememorystorage.com/proceedings/2011/20110810_T1B_Cox.pdf | **search snippet only; PDF timed out; JESD218B.02 not opened** |
| 870 EVO: QD1 random read 13,000 IOPS, seq read 560 MB/s, 1 TB 600 TBW, 5 years, "whichever comes first" | Samsung SSD 870 EVO Data Sheet rev 1.1, https://download.semiconductor.samsung.com/resources/data-sheet/Samsung_SSD_870_EVO_Data_Sheet_Rev1.1_230509_10129500053000.pdf | text extracted |
| 990 PRO 1 TB: QD1 random read 22K IOPS, seq read 7,450 MB/s, PCIe 4.0 ×4 NVMe 2.0 | Samsung NVMe SSD 990 PRO Datasheet rev 1.0, https://download.semiconductor.samsung.com/resources/data-sheet/Samsung_NVMe_SSD_990_PRO_Datasheet_Rev.1.0_10129514072296.pdf | text extracted |
| SATA 6 Gb/s released May 2009 | press coverage of the SATA-IO release (search summary) | **SATA-IO page not opened** |
| U.3 = SFF-TA-1001 (2017), uses SFF-8639; E1.S = SFF-TA-1006 on SFF-TA-1002 | StorageReview, next.ink (search summaries) | **secondary; SNIA SFF texts not opened** |
| M.2 B/M keys; slot wiring decides SATA vs PCIe | forum/vendor explanations (search summary) | **secondary; PCI-SIG M.2 spec not opened** |
| SAS backplanes accept SATA drives (STP), SATA ports reject SAS drives | general knowledge + Microchip 24G SAS page (search) | **not verified from T10 text** |

## Facts that will go stale (frontier block: `FRONTIER` in models.js, `ch9.f.*` in copy.zh.js)

| fact | status | date | source (opened 2026-11-14) |
|---|---|---|---|
| Seagate Mozaic 4+ HAMR, up to 44 TB, shipping in volume to two hyperscalers; 4+ TB per disk; roadmap 10 TB/disk, 100 TB | demo / claim (roadmap) | 2026-03-03 | https://www.seagate.com/stories/articles/seagate-delivers-industrys-highest-capacity-hard-drives-with-next-generation-mozaic-4/ |
| WD 40 TB UltraSMR ePMR in qualification, volume 2H 2026; HAMR qualifying, ramp 2027; 100 TB by 2029 | claim | 2026-02-03 | https://www.westerndigital.com/en-ca/company/newsroom/press-releases/2026/2026-02-03-western-digital-accelerates-storage-innovation-for-ai-era |
| Micron 6600 ION 245 TB shipping (QLC, U.2 and E3.L) | demo | 2026-05-05 | search summary of Micron release (micron.gcs-web.com/node/50436); **release page not opened** |
| Kioxia LC9 245.76 TB announced | demo (sampling) | 2025-07 | Blocks & Files (search summary) |
| SK hynix 321-layer 2 Tb QLC mass production | demo | 2025-08-25 | press copies (Evertiq, StorageNewsletter, search summary); **SK hynix newsroom not opened** |
| Samsung V10 400+ layers shown at FMS 2026; mass production reported by Seoul Economic Daily, delay to 2027 reported by ZDNet Korea | claim (conflicting) | 2026-08-05 | https://www.trendforce.com/news/2026/08/05/news-samsung-unveils-industry-first-400-layer-v10-bv-nand-memory-density-up-58-vs-v9/ |
| PLC: Solidigm demo 2022; SK hynix split-cell 5-bit at IEDM Dec 2025; no shipping product found | claim | 2026-11 | Solidigm newsroom, Blocks & Files 2026-01-15, TrendForce (search summaries) |

## Checked / not checked

Checked: every number in the prose is recomputed in tests/models.cjs from models.js or the source constants it
quotes (820 checks); every live-sentence branch evaluated at control extremes; en stub keys/placeholders equal zh;
anchors, NVMe deep links and relative links exist; no NVMe-owned words in aliases; browser test (zh 1280/390/320,
en stub, keyboard, every figure driven, reduced motion); canvas sweep 936 states clean; screenshots looked at for
every figure at 1280/390/320 (fixed: ch2 average-seek label, ch5 "新的就不行" clipped at 320, ch8 tick labels
clipped at the right edge and wording of bar colours, ch4 default moved to 800 cycles so the overlap shows).

Not checked: items marked in bold above; current-generation 3D NAND P/E figures (the model is calibrated to planar
1x-nm numbers and says so); real SMR band sizes; HDD inner-radius rate; activation energy for retention; that
modern HDDs keep the HP 97560 seek-curve shape. English copy and independent review are pending.

## Figures of merit

HDD: random-read latency/IOPS (seek + half a turn), sequential MB/s (∝ radius), TB per platter (areal density).
NAND: bits per cell, layer count, P/E endurance (where RBER meets the ECC limit), TBW/DWPD; every device:
latency, bandwidth and their product (break-even size).

## Prerequisites the site lacks

An error-correcting-codes page (Hamming → BCH/LDPC, binomial tail); a page on magnetic recording itself
(read/write heads, grains, superparamagnetic limit); a general reaction-rate/Arrhenius page (the soy essay #ch5,
linked from ch5, is the nearest).

## Also not checked (order-of-magnitude statements kept in prose)

"数千亿个小格子" per chip is pinned from SK hynix 2 Tb ÷ 4 bits; real block/page sizes are described only as
"much larger"; DRAM holding the FTL map is general practice, no source opened.

## Notes for the registrar

- Alias 垃圾回收 GC (#ch6) is not on the NVMe page's owned list but appears in NVMe #ch6's title — judgment call.
- With the copy.en.js stub, EN mode sets html[lang]=en over Chinese text (as the task requires); set
  `languages: ["zh"]` until translated.

## For the registrar

zh title 硬盘里到底是什么 / en What a Drive Is Made Of; one-line desc in REGISTRY.json; category computing,
subtopic systems (both exist); stage university; `languages: ["zh"]` until copy.en.js is translated. Repoint the
NVMe page's 固态硬盘为什么比机械硬盘快 alias to #ch8 here.
