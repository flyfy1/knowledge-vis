# BRIEF — 移动硬盘为什么跑不满 (Why a USB Drive Never Hits Its Label)

Built-By: Claude Code (claude-opus-5-5)
Verified-By: self-check by builder (node model test, browser test zh at 1280/390/320 and reduced motion, canvas sweep, screenshots at three widths); Claude Code (claude-opus-5-5), separate session, independent review 2026-11-14 of zh and en copy in full, every model, spec tables and frontier facts (see Review)
Category: computing 计算机 / subtopic systems 系统 · Stage: university
Series: storage series S4 (`specs/essay-briefs/TASK-storage-series.md`)
Format: long interactive essay, Chinese and English (the English was translated after the build and corrected in review).
Files: index.html, copy.zh.js, copy.en.js, models.js, app.js, REGISTRY.json, tests/models.cjs, tests/browser.cjs

## The one question

一块能跑 7 GB/s 的 NVMe 固态装进 USB 硬盘盒，为什么只剩几百 MB/s 到两三 GB/s？包装上的「USB 3.2 Gen 2×2」「40Gbps」说的到底是什么？
Refined on the page into: which link in the chain drive → bridge chip → USB link → protocol → (heat) sets the
number you measure, and how do you read that off the labels.

## Changes from the starting list (TASK file)

- ch1 is the layer map (table): USB storage is "SCSI commands in a USB envelope, translated by a bridge to SATA or
  NVMe". Links S1 #ch7 and S2 #ch3 instead of re-explaining the drive and SATA layers.
- ch2 (USB 2.0) is a real model of USB 2.0 Table 5-10 (bulk transactions per 125 µs microframe), not a general
  "polling is slow" story.
- ch3 turns the naming mess into one model: label → mode (Table 7-14 / 7-15) → line rate → encoding → packet
  framing → the spec's own effective figure.
- ch4 (BOT) has two figures: the CBW/CSW bytes built from BOT 1.0 Tables 5.1/5.2 with a READ(10)/READ(16) CDB,
  and a one-command-at-a-time throughput bound.
- ch5 (UASP) reuses the ch4 bound with N commands in flight (Lazowska asymptotic bounds).
- The suggested "SCSI command set" and "bridge translation" chapters are merged into ch6, which also carries the
  bottleneck-chain model (drive, bridge downstream PCIe/SATA, USB link, protocol).
- ch7 (heat throttling) became its own chapter with a lumped RC model; the TASK only mentioned it.
- ch8 (Thunderbolt / USB4 PCIe tunnel) reuses the chain.
- ch9 (flash drives and SD cards): dies × per-die write vs the bus.
- ch10 frontier (as of 2026-11, established / demonstrated / claimed) and ch11 closing (three questions + links).
- No buying advice, no brand recommendations. Bridge chips are named only where their product brief is the source.

## Chapters, models, published results, tuned parameters

| Ch | Model (models.js) | Basis |
|---|---|---|
| 1 | — (layer table) | MSC Overview 1.4 protocol codes 50h/62h |
| 2 | `USB2.pack` | USB 2.0 §5.8.4 Table 5-10, 55-byte bulk overhead, 7,500 B/microframe |
| 3 | `LINE` (`rawMBps`, `packetEff`, `negotiate`) | USB 3.2 r1.1 §4.4.11, Tables 7-14/7-15; USB4 v2.0 PAM3 11b/7t |
| 4 | `WRAP` (CBW/CSW), `Q.bot` | BOT 1.0 Tables 5.1/5.2; SBC READ(10)/(16); closed-queue bound X = S/(tCmd+tMedia+S/L) |
| 5 | `Q.uas` | X = min(N·S/R, link, S/tCpu) (Lazowska et al. 1984 ch. 5) |
| 6 | `CHAIN.usb` | min(drive, bridge PCIe/SATA, USB effective) × protocol; JMicron product briefs |
| 7 | `HEAT.sim` | lumped capacitance (Incropera §5.2), T∞ = Ta + R·P, t* = −RC·ln(1 − (Tthr − Ta)/(RP)), throttle with hysteresis |
| 8 | `CHAIN.tunnel` | Intel TB5 brief (TB4 PCIe 32 Gb/s, TB5 PCIe 64 Gb/s), USB4 "may optionally support PCIe Tunneling" |
| 9 | `STICK.write` | ISSCC 2023 28.2 per-die 194 MB/s; SD Association bus maxima |

Tuned parameters (not from a spec) and what halving / doubling does:

| Parameter | Value | Sensitivity |
|---|---|---|
| `Q.tCmd` command round trip | 50 µs | BOT 4 KiB at 10 Gb/s: 52 / 39.5 / 27 MB/s for 25 / 50 / 100 µs; 1 MiB: 1,020 / 996 / 950. Conclusion "small blocks are latency-bound under BOT" holds across the range. |
| `Q.tMedia` flash first byte | 50 µs | same arithmetic as tCmd (sums with it) |
| `Q.tCpu` bridge per-command cost | 4 µs | UAS QD32 4 KiB: 1,100 MB/s (link) at 2 µs, 1,024 at 4, 512 at 8. The "4 KiB QD32 is chip-bound" sentence depends on this value. |
| `CHAIN.eta` PCIe/tunnel efficiency | 0.85 | TB4 tunnel 3,200–3,680 MB/s and 20 Gb/s + PCIe 3.0 x2 1,575–1,812 MB/s over 0.80–0.92 (slider in ch8). Bottleneck identity unchanged. |
| `HEAT.C` heat capacity | 25 J/K | 20 Gb/s plastic, 25 °C: first throttle 5.9 / 11.7 / 23.4 min (the last beyond the 15-min run) for 12.5 / 25 / 50 J/K; now quoted on the page (ch7.limit) and pinned. Steady temperature (77 °C) does not depend on C, so it throttles eventually at any C; only the time moves. |
| `HEAT.Rbox` plastic / aluminium | 14 / 6 K/W | plastic 7 K/W: never throttles; 28 K/W: 6.6 min. The plastic-vs-metal contrast is the point, the exact minutes are not. |
| `HEAT.Pb` bridge chip power | 1 W | 0.5 W: never; 2 W: 6.7 min |
| `HEAT.P0`, `f`, `hyst`, `thr` | 1.5 W idle, throttled to 30%, 5 °C, 70 °C | thr = sheet's 70 °C max operating temperature; others illustrative |
| `STICK.S` | 128 KiB | sets the BOT-on-5 Gb/s bus figure (335 MB/s) |

## Sources (each opened by me on 2026-11-14)

- USB 2.0 spec (zip, Table 5-10): https://www.usb.org/sites/default/files/usb_20_20230224.zip
- USB 3.2 Revision 1.1 (June 2022): https://www.usb.org/sites/default/files/usb_32_202206_0.zip (§4.4.11 effective rates, Tables 7-14/7-15, streams 1–65533, revision dates)
- USB4 Specification v2.0, November 2025 build: https://www.usb.org/sites/default/files/USB4%20Specification%20November%202025.zip
- USB-IF data-performance language guidelines, Jan 2024: https://usb.org/sites/default/files/usb_data_performance_language_usage_guidelines_jan_2024_0.pdf
- USB-IF USB4 v2.0 / 80Gbps announcement, 2022-10-18: https://www.businesswire.com/news/home/20221017006047/en/USB-IF-Announces-Publication-of-New-USB4-Specification-to-Enable-USB-80Gbps-Performance (PDF copy from usb.org press room, same text)
- BOT 1.0: https://www.usb.org/sites/default/files/usbmassbulk_10.pdf (cover date printed "September 31, 1999")
- MSC Overview 1.4: https://www.usb.org/sites/default/files/Mass_Storage_Specification_Overview_v1.4_2-19-2010.pdf
- UASP 1.0 (2009-06-24): https://web.archive.org/web/20120119200525/http://www.usb.org/developers/devclass_docs/uasp_1_0.zip (also https://www.usb.org/sites/default/files/uas_1_0.pdf)
- NVM Express SCSI Translation Reference 1.1: https://nvmexpress.org/wp-content/uploads/NVM-Express-SCSI-Translation-Reference-1_1-Gold.pdf
- smartctl man page (SAT standard, snt* bridge types): https://raw.githubusercontent.com/smartmontools/smartmontools/master/smartmontools/smartctl.8.in
- Linux: https://raw.githubusercontent.com/torvalds/linux/master/drivers/usb/storage/uas.c , .../drivers/usb/storage/unusual_uas.h , .../drivers/ata/libata-scsi.c , .../include/scsi/scsi_proto.h
- JMicron product briefs: JMS586A v1.05 https://www.jmicron.com/file/download/1224/Product+Brief+of+JMS586A+v1.05.pdf ; JMS583 https://www.jmicron.com/file/download/1012/JMS583_Product+Brief.pdf ; JMS581D https://www.jmicron.com/file/download/1080/Product+Brief+of+JMS581D.pdf
- Intel Thunderbolt 5 technology brief (2023-09): https://intel.com/content/dam/www/central-libraries/us/en/documents/2023-09/thunderbolt-5-technology-brief.pdf
- SD Association bus speeds: https://www.sdcard.org/developers/sd-standard-overview/bus-speed-default-speed-high-speed-uhs-sd-express/
- Samsung 990 EVO Plus datasheet rev 1.0 (via Farnell): https://www.farnell.com/datasheets/4411543.pdf
- Samsung 870 EVO datasheet: https://download.semiconductor.samsung.com/resources/data-sheet/Samsung_SSD_870_EVO_Data_Sheet_Rev1.1_230509_10129500053000.pdf
- ISSCC 2023 paper 28.2 (title only, 194 MB/s per die): https://www.aminer.cn/pub/6567aafa939a5f4082b88288/a-high-performance-tb-b-cell-d-nand-flash-with-a-mb
- Reported measurements (secondary): TB5 enclosures 5,400–6,650 MB/s — https://www.notebookcheck.net/ORICO-X50PRO-review-This-Thunderbolt-5-enclosure-hits-6-000-MB-s.1303108.0.html , https://www.storagereview.com/?p=137255 , https://fstoppers.com/originals/fanless-thunderbolt-5-compatible-ssd-my-time-orico-x50-enclosure-901639 , https://medium.com/ideas-with-wings/i-tested-the-worlds-fastest-ssd-enclosure-it-beat-my-macbook-pro-s-internal-storage-8f6c59980182 ; TB3/TB4 ~2,800 MB/s — https://forums.macrumors.com/threads/thunderbolt-3-m-2-nvme-ssd-enclosures.2027925/page-37 , https://talk.tidbits.com/t/how-to-choose-a-fast-external-ssd-for-your-mac/26845

## Facts that will go stale

- USB4 spec build (Nov 2025) and USB 3.2 r1.1 (June 2022) as "latest".
- Reported TB5 / TB3-4 enclosure figures (reviews and forums).
- Bridge chips named (JMS583/581D/586A) as examples of their class.
- Frontier list in ch10 is dated 2026-11.

## Checked / not checked

Checked against a primary document: every spec table and number in the "Sources" list above; every prose
number is generated by `models.js` and pinned in `tests/models.cjs`.

Not verified from a primary source (the page labels them as reported or leaves them out):
- TB3/TB4 enclosures measuring ~2,800 MB/s (forum and review reports). The page presents the gap to the
  model's 3,200–3,680 MB/s as unexplained in ch8; the forum explanation ("~22 Gb/s for PCIe data") appears only in ch10 under 未核实.
- TB5 enclosure figures 5,400–6,650 MB/s (reviews).
- Any 2026 "mandatory naming" requirement from USB-IF: not found in a primary document, not claimed.
- Windows 8 as the first Windows with an inbox UAS driver (Wikipedia only): removed from the page; ch5 cites the Linux driver only.
- Per-die 194 MB/s is from the ISSCC paper title; the paper body was not opened.
- Bridge chip per-command cost (tCpu), enclosure thermal resistances and heat capacity: tuned, not measured.

## For the translator

- `copy.en.js` is translated (no `enStub`); keep it key-for-key with `copy.zh.js`. `tests/models.cjs` checks keys,
  placeholders and the English registry title/desc; `tests/browser.cjs` runs the width sweep in English too.
- Keep spec-quoted strings as the spec wrote them in English ("500 MB/sec", "450 MB/sec or less", "in excess of
  400MB/s", "host directed", "September 31, 1999").
- 「USB 20Gbps」 etc. are the USB-IF logo names: keep them as written.
- S3 (服务器硬盘为什么用 SAS) is cited as plain text, not a link, until it is registered.

## Review

Reviewer: Claude Code (claude-opus-5-5), separate session, did not build the page. Date: 2026-11-14.
Scope: copy.zh.js and copy.en.js read in full, every key; models.js, app.js, both tests; every model driven in a
browser (zh and en, 1280/390/320, reduced motion).

First-read notes (most important first):
1. ch7.p4 contrasted "the first 30 s" with "a 200 GB copy", but in the model a 200 GB copy finishes before any
   configuration throttles (20 Gb/s plastic first throttles at 11.7 min ≈ 1.5 TB in; TB5 plastic at 256 s).
2. ch11.sum said the name keeps "八九成 / eight to nine tenths" after encoding, headers and protocol; at 5 Gb/s the
   spec's 450 MB/s is 72 % of 625 MB/s.
3. ch8 stated as fact that a tunnel enclosure "falls back to its USB 3 side" on a USB4 host without PCIe tunnelling;
   that holds only for enclosures that also carry a USB 3 bridge. ch8.p4 compared a "USB4 40Gbps" box with a
   "Thunderbolt" box when the model's difference is the host port.
4. ch5's "small random reads are limited by the chip" rests entirely on the tuned 4 µs per command; halving it
   makes QD32 4 KiB link-bound. The page did not say so.
5. English: ch4.p4 "1 MiB only reaches 996 MB/s" inverted the meaning; several quotes were paraphrased inside
   quotation marks; English bar labels ("Bridge downstream link", "Actual (after protocol)") ran off the canvas at 320.

Checked against primary documents opened 2026-11-14/15 (text extracted locally):
- USB 2.0 (2023-02-24 package) Table 5-10: all ten rows, 55-byte overhead, 512 B → 13 transfers, 129 left,
  53,248,000 B/s. Model reproduces every row.
- USB 3.2 r1.1: §4.4.11 (500 MB/sec; 450 MB/sec or less; ~1.2 / ~1.1 GB/sec; "doubled" in x2), revision dates
  2008-11-12 / 2013-07-26 / 2017-09-22, §7.2.1.1 header sizes (20 symbols; non-deferred Gen 2 DPH adds a length
  field replica → 24), streams 1–65533 and "mass storage device command queuing", "USB 2.0 style polling has been
  replaced with asynchronous notifications", "Host directed", Table 7-14 (all 16 cells match the test).
- USB4 v2.0 (Nov 2025 build): errata through 2025-11-19; Gen 2 64b/66b, Gen 3 128b/132b; Gen 4 PAM3 25.6 GBd,
  11 bits → 7 trits; "A USB4 Host can also optionally support PCIe Tunneling". usb.org document library lists
  the November 2025 zip as the current file (https://www.usb.org/document-library/usb4r-specification-v20).
- BOT 1.0: cover date "September 31, 1999"; CBW offsets 0–3/4–7/8–11/12/13/14/15–30, 43425355h; CSW 13 bytes,
  53425355h, residue 8–11, status 12; "The host shall not transfer a CBW … until … received the CSW".
- UASP 1.0 (2009-06-24) §2 Management Overview: "about 20%", "approximately 250 MB/s", "utilizing the full duplex
  capability", "in excess of 400MB/s".
- USB-IF naming guidelines (Jan 2024): five recommended consumer names; spec names "not intended to be used in
  product names … packaging". It is a recommendation; the page now says "recommends" (was "requires").
- JMS586A brief v1.05: USB 3.2 Gen 2x2 → PCIe Gen 3x2, supports TRIM.
- Intel TB5 technology brief (2023-09) and Thunderbolt messaging guide: PCIe 64 Gbps (TB5) / 32 Gbps (TB4); USB 3
  10 Gbps for both, TB5 with footnote "Available up to USB 3: 20 Gbps" (now stated in ch8.say.nopcie).
- Samsung 990 EVO Plus data sheet: 7,250 MB/s (2/4 TB), read 5.5 W (4 TB), 0–70 °C.
- Linux uas.c: MAX_CMNDS 256, qdepth 32 without streams, scsi_change_queue_depth(qdepth − 2).
- SK hynix 194 MB/s: IEEE Spectrum (https://spectrum.ieee.org/flash-memory) reports it as the highest TLC write
  throughput presented, quoting SK hynix; the page now attributes the "highest" claim.
- Re-derived by hand: 53.2 MB/s; 500/1212/2424 MB/s; 38.8 and 40.23 Gb/s; BOT 4 KiB 39.5 MB/s; UAS QD32 4 KiB
  1,024 MB/s (chip-bound); PCIe 3.0 ×2 × 0.85 = 1,674 MB/s; T∞ = Ta + R·P = 77 °C, t* = 11.7 min; TB4 3,400 and
  TB5 bridge-bound 6,695 MB/s; stick 194 / 335 / 51 MB/s. The steady temperature is independent of C (T∞ = Ta+RP);
  a new test checks throttling still occurs at C = 12.5…100 J/K given a long enough run.
- No buying advice; no sibling-owned search words (test checks against all four sibling REGISTRY.json files);
  doc.title (before " · ") and doc.desc equal REGISTRY.json in both languages; S3 stays plain text.

Changes (zh and en kept in sync):
- ch2.p3: unsourced "老 U 盘常常停在三四十 MB/s" replaced by the model's own USB 2.0 BOT figure ({stu2}).
- ch3.p1, ch10.e2, ch3.say.usb3: naming guide "requires"/"should" → "recommends". ch4.p5, ch5.p3: "前言/foreword" → the spec's overview;
  en quotes made verbatim. ch5.p4: Linux queue depth described as granted streams minus two.
- ch5.limit: says the chip-bound conclusion depends on tCpu and flips when halved (pinned).
- ch7.p4: "200 GB" → "{durMin} minutes of continuous copying" (pinned that it throttles). ch7.limit: heat-capacity
  sensitivity added ({ts20h} 5.9 / {ts20d} 23.4 min; pinned).
- ch8.p2, ch8.say.nopcie: fallback made conditional on a USB 3 bridge in the enclosure; TB5 USB 3 footnote.
  ch8.p4: rewritten as the same box on two ports, {t4} vs {tnp}, "a factor of three" (pinned).
- ch9.p1: "highest at the time" attributed to IEEE Spectrum / SK hynix.
- ch11.sum: "八九成" → {g1share} (72 %) at 5 Gb/s and {g2share} (88 %) at 10 Gb/s (new prose() keys, pinned).
- English only: hero.sub, ch2.p3 "MB/s a second", ch2.p4 quotes, ch3.say.usb4 (mode was doubled; zh likewise
  read "USB4 的 USB4 Gen 3×2"), ch4.p4 inversion, "datasheets" → "product briefs", ch10 tag "Shipped" →
  "Demonstrated", ch6.cv.nofit shortened to fit the canvas.
- app.js: bar labels that do not fit the label column now wrap onto two lines before shrinking (fixes the 320 px
  English overflow in ch3/ch6/ch8/ch9 bar charts).
- app.js: an x-axis title wider than the plot now shrinks to fit (min 70 %); en ch4.cv.x shortened. Canvas sweep
  went from 171 findings (all 320 px English) to PASS (921 states, zh/en × 1280/390/320).

Unverified (unchanged, and the page marks them):
- TB3/TB4 enclosures at ~2,800 MB/s and the "~22 Gb/s for PCIe" explanation: forums and reviews only; one forum
  post cites an Intel figure I could not open. The page calls the gap unexplained (ch8) and the explanation
  未核实/Unverified (ch10). That handling is honest.
- TB5 enclosure figures 5,400–6,650 MB/s (reviews). The rumoured 2026 mandatory USB-IF naming rule: not found in
  any USB-IF document (the Jan 2026 trademark requirements list the logos but no mandate); stays 未核实.
- ISSCC 2023 28.2 body not opened (title and press only). SAT (INCITS 431-2007) itself not opened; the mapping
  table relies on the NVMe translation reference, smartctl(8) and libata-scsi.c, and the READ row says "such as".
- Tuned: tCmd, tMedia, tCpu, η, all heat constants (labelled on the page, sensitivities stated and pinned).

Tests after review: `node tests/models.cjs` → PASS 2446 checks; `tests/browser.cjs` → PASS (zh+en at
1280/390/320, reduced motion); `tests/canvas-text-overlap.cjs --sweep` → PASS 921 canvas states, zh/en.
Screenshots (not committed): /tmp/agent-tasks/storage/review-s4/shots and /figs.
