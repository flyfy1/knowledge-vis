# BRIEF — 移动硬盘为什么跑不满 (Why a USB Drive Never Hits Its Label)

Built-By: Claude Code (claude-opus-5-5)
Verified-By: self-check by builder (node model test, browser test zh at 1280/390/320 and reduced motion, canvas sweep, screenshots at three widths); independent review pending
Category: computing 计算机 / subtopic systems 系统 · Stage: university
Series: storage series S4 (`specs/essay-briefs/TASK-storage-series.md`)
Format: long interactive essay. Chinese is complete; `copy.en.js` is a same-keys stub (`enStub = true`) waiting for translation.
Files: index.html, copy.zh.js, copy.en.js (stub), models.js, app.js, REGISTRY.json, tests/models.cjs, tests/browser.cjs

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
| `HEAT.C` heat capacity | 25 J/K | 20 Gb/s plastic, 25 °C: first throttle 5.8 / 11.7 min / never-in-15-min for 12.5 / 25 / 50 J/K. Steady temperature (77 °C) does not depend on C, so it throttles eventually at any C; only the time moves. |
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

- Keys in `copy.zh.js`; `copy.en.js` currently mirrors them with `enStub = true`. Translate every value, keep
  every `{placeholder}`, then delete the `enStub` line; `tests/models.cjs` then checks the English registry title.
- Keep spec-quoted strings as the spec wrote them in English ("500 MB/sec", "450 MB/sec or less", "in excess of
  400MB/s", "host directed", "September 31, 1999").
- 「USB 20Gbps」 etc. are the USB-IF logo names: keep them as written.
- S3 (服务器硬盘为什么用 SAS) is cited as plain text, not a link, until it is registered.
