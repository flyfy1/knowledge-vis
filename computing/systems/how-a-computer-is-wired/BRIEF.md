# BRIEF — 电脑里的零件是怎么连起来的 (How the Parts of a Computer Are Wired Together)

Built-By: Claude Code (claude-opus-5-5)
Verified-By: self-check by builder (node model test, browser test zh at 1280/390/320 and reduced motion including the STANDARD §4a diagram checks, canvas sweep zh/en at 1280/390/320, screenshots of every diagram and model); independent review pending
Category: computing 计算机 / subtopic systems 系统 · Stage: university
Series: bus series B2 (`specs/essay-briefs/TASK-bus-series.md`)
Format: long interactive essay. Chinese written in full; `copy.en.js` is a same-keys stub (`enStub = true`) until translated.
Files: index.html, copy.zh.js, copy.en.js, models.js, app.js, REGISTRY.json, tests/models.cjs, tests/browser.cjs

## The one question

CPU、内存、显卡、硬盘、USB 口，各自走的是哪条路？为什么早年的电脑是一根大家共用的总线，今天却变成一张点对点的网？
Answered on the page as: sharing never went away, it moved. A shared bus (ch1) could not get faster because of
its own electrical loading (ch2); point-to-point links replaced it, but every flow still met at one place — the
northbridge's memory controller (ch3), then each socket's memory (ch4, NUMA), then the chipset uplink (ch5), then
the on-die network (ch6) and the package (ch7). Only the slow management buses still share wires (ch8).

## Changes from the starting list (TASK file)

- Kept the ten-chapter order. ch2 is reflected-wave switching and bus loading only; the skew budget is linked to
  how-sata-works #ch2, not redone.
- ch3 uses one concrete platform, Intel 875P / ICH5 (2004 datasheet), so every link rate on the diagram is sourced.
- ch4 uses AMD's ISSCC 2018 Zeppelin latencies (EPYC 7001, two sockets × four dies) because they are the only
  primary-source local / same-package / remote triple I found; Xeon 6767P figures appear as today's comparison.
- ch5 uses Intel Core Ultra 200S + Z890 (ARK + chipset brief) and AMD AM5 (product page); the AMD link generation
  is secondary (see below).
- ch8 is I²C only, with SPI / UART / SMBus / eSPI in one paragraph, and says the series may go deeper (B5).
- Dropped a separate "HyperTransport / QPI / UPI" model; they are named in ch4.p1, no numbers.

## Chapters, models, published results, tuned parameters

1. **一组大家共用的线** — law: one talker at a time, bandwidth divided. Diagram dg1 shared bus vs point-to-point.
   Model: PCI transaction = D data phases + 8 clocks target initial latency (PCI 3.0 Table 3-5's own rule),
   N devices, round-robin. Reproduces every row of Table 3-5 (6.15/0.54/0.63/0.78/1.17 µs, total 9.27 µs).
   The bytes column matches except disk (52 vs the table's 50, because 13 whole DWORD phases carry 52 bytes);
   the test allows 2 bytes.
   Limits: fixed latency, fair arbitration; the "point-to-point" row is a thought experiment.
2. **为什么并行总线跑不快** — Diagram dg2 loaded line + near/far voltage steps. Model: Table 7-7 budget
   (Tprop = Tcyc − Tval − Tsu − Tskew) against k round trips of a loaded line, t' = tpd√(1+C/(C0·s)),
   Z' = Z0/√(…), weakest driver Rs = 1/17.1 mS = 58.5 Ω (Table 4-4), lattice bound to Vih = 0.5 Vcc.
   Result: 13 loads at 33 MHz, 6 at 66 MHz; 5 at 33 MHz with 20 pF loads (two trips).
   **Tuned:** tpd = 170 ps/in, Z0 = 60 Ω inside the spec's 150–190 / 60–100 ranges; tpd 190 → 12 loads,
   Z0 100 → 11 loads (stated in ch2.limit, pinned in tests). Model is an upper bound (no rise time, ringing).
   The slider's 33 and 66 stops mean 33.33 / 66.67 MHz so the default readout matches the prose.
3. **北桥与南桥** — Diagram dg3 the 875P platform. Model: max-min fair allocation (progressive filling,
   Bertsekas & Gallager) over FSB 6.4, memory 6.4, AGP 2.1, HI 0.266, CSA 0.266 GB/s. Default: CPU gets 3.9 of the
   6.4 it wants; memory, not the FSB, is full; two SATA disks (150 MB/s each) exceed the 266 MB/s Hub Interface.
4. **把内存控制器搬进 CPU** — Diagram dg4 two sockets × four dies. Model: access-weighted latency from 90/145/200 ns
   and Little's law X = m·64 B / latency. Interleave over 8 dies: 165.6 ns, 1.84× local; 7.1 → 3.9 GB/s per core.
   **Tuned:** m = 10 misses in flight per core; bandwidth is linear in m (stated), latency ratio independent of it.
5. **今天的主板** — Diagram dg5 Core Ultra 200S + Z890 board. Model: the same max-min allocation, full duplex,
   DMI 4.0 ×8 = 15.75 GB/s per direction, AMD PCIe 4.0 ×4 = 7.88 GB/s. Default (two chipset SSDs reading at 7.25 +
   USB 2.2 GB/s): each SSD 6.78 GB/s (Intel), 2.84 GB/s (AMD); SSD-to-SSD copy uses both directions at full speed.
6. **芯片里面的路** — Diagram dg6 ring of 8 vs 4×4 mesh. Model: brute-force all-pairs hop counts and channel
   loads, checked in tests against closed forms (ring N²/(4(N−1)), γ = N/8; mesh per-dimension k(k²−1)/3, γ = k/4,
   Dally & Towles). 64 stations: ring 16.3 hops, 8×8 mesh 5.3, throughput ratio 4.
7. **芯粒之间** — Diagram dg7 organic substrate vs bridge/interposer. Model: P = BW × 8 × pJ/bit, edge = BW /
   shoreline density. 1 TB/s: UCIe 2.5D 2.4 W on 0.76 mm, 2D 4.8 W on 4.5 mm, EPYC IFOP 16 W, LPDDR5-like 22.4 W.
8. **到今天还在共用的小总线** — Diagram dg8 I²C with pull-ups. Model: UM10204 §7.1, tr = ln(7/3)·Rp·Cb,
   Rp(max) = tr/(0.8473·Cb), Rp(min) = (VDD − VOL)/IOL. 4.7 kΩ at 200 pF: 796 ns, fine for 100 kHz, too slow for
   400 kHz (needs 967 Ω–1.77 kΩ).
9. **前沿在哪里（截至 2026 年 11 月）** — established / demonstrated / claimed kept apart.
10. **看一台机器的三个问题** — closing.

Diagrams (all inline SVG built in app.js from copy keys, role=img, aria-label from copy; numbers on them come from
`prose()` and are pinned): dg1 shared bus vs point-to-point; dg2 loaded line + reflected-wave steps (step heights
from the ch2 model); dg3 Intel 875P northbridge/southbridge; dg4 two-socket EPYC 7001; dg5 Core Ultra 200S + Z890
board; dg6 ring vs 4×4 mesh; dg7 chiplets on organic substrate vs bridge/interposer; dg8 I²C with pull-ups.
Captions say 示意 / 不按比例 where geometry is not to scale.

## Sources (each opened by me on 2026-11-15)

- PCI Local Bus Specification Rev. 3.0 (3 Feb 2004), mirror: https://lekensteyn.nl/files/docs/PCI_SPEV_V3_0.pdf —
  §1.5 132 MB/s, revision history (1.0 1992-06-22), Table 3-5, Table 7-7, Table 4-3/4-4, §4.2.2 Cin, §4.4.3 Z0 and
  tpd ranges, card trace 1.5 in, connector pitch 0.8 in, "six loads on the system board and two add-in card
  connectors or two loads … and four add-in card connectors".
- Intel 875P Chipset Datasheet 252525-002 (Feb 2004), mirror:
  https://atta.szlcsc.com/upload/public/pdf/source/20240402/E393CA42179B85BB1FBB448E0419D5F2.pdf
- NXP UM10204 I²C-bus specification and user manual Rev. 7.0 (1 Oct 2021): https://www.nxp.com/docs/en/user-guide/UM10204.pdf
- AMD ISSCC 2018 2.4 "Zeppelin: An SoC for Multi-chip Architectures" slides:
  https://www.slideshare.net/slideshow/isscc-2018-zeppelin-an-soc-for-multichip-architectures/88327178
- Intel ARK Z890: https://www.intel.com/content/www/us/en/products/sku/237777/intel-z890-chipset/specifications.html
- Intel ARK Core Ultra 7 265F: https://www.intel.com/content/www/us/en/products/sku/241064/intel-core-ultra-7-processor-265f-30m-cache-up-to-5-30-ghz/specifications.html
- Intel ARK Xeon 6767P: https://www.intel.com/content/www/us/en/products/sku/241845/intel-xeon-6767p-processor-336m-cache-2-40-ghz/specifications.html
- Intel 800 Series Chipset Brief: https://cdrdv2-public.intel.com/842318/intel-800-series-chipset-brief-public.pdf
- AMD Ryzen 9 9950X: https://www.amd.com/en/products/processors/desktops/ryzen/9000-series/amd-ryzen-9-9950x.html
- AMD AM5 chipsets: https://www.amd.com/en/products/processors/chipsets/am5.html
- UCIe key metrics, D. Das Sharma, HOTI 2025: https://hoti.org/assets/slides/2025_08_21_day2_SessionD_UCIe_Mem.pdf
- UCIe 3.0 release (2025-08-05): https://www.businesswire.com/news/home/20250805909613/en/UCIe-Consortium-Introduces-3.0-Specification-With-64-GTs-Performance-and-Enhanced-Manageability
- CXL 4.0 release (2025-11-18): https://computeexpresslink.org/wp-content/uploads/2025/11/CXL_4.0-Specification-Release_FINAL_Website-Copy.pdf
- Intel mesh on Skylake-SP (2017): https://top500.org/news/growing-core-count-led-intel-to-mesh-architecture/
- Xeon 6+ (search summaries of Intel's Computex newsroom post and product page, plus press):
  https://www.intel.com/content/www/us/en/newsroom/news/artificial-intelligence/intel-announces-new-ai-innovations-at-computex.html
- Intel 900-series chipset leak: https://www.guru3d.com/story/intel-900series-chipset-leak-b960-debuts-z990-keeps-full-oc-control/
- Textbooks (not opened online; standard results): Johnson & Graham, High-Speed Digital Design (1993); Dally &
  Poulton, Digital Systems Engineering (1998); Dally & Towles, Principles and Practices of Interconnection Networks
  (2004); Bertsekas & Gallager, Data Networks §6.5.2.

## Facts that will go stale

UCIe 3.0 latest spec (2025-08-05); CXL 4.0 at 128 GT/s (2025-11-18); Xeon 6+ up to 288 E-cores with Foveros Direct
(2026); Z890 / AM5 lane counts (current desktop generation); the leaked DMI 5.0 ×4 / ×2 for Intel 900-series.

## Checked / not checked

Checked from a primary source: every PCI, 875P, UM10204, Zeppelin, UCIe metric, ARK and AMD product-page number used
by a model. Not verified from a primary source (secondary or summary only):
- AMD's chipset link as PCIe 4.0 ×4 (product page only gives 28 total / 24 usable lanes); X870E being two chips in
  a daisy chain.
- DMI 4.0 = 16 GT/s per lane (ARK says "DMI 4.0", the rate is from reviews and the PCIe 4.0 equivalence).
- HyperTransport / QPI / UPI introduction years (the text says only "2000 年代").
- UCIe founding (March 2022) and founding members.
- Xeon 6+ dates: reports differ (MWC March 2026 unveil vs Computex June 2026 availability); the page says so.
- I²C used for DDC/EDID and SPD (common knowledge, not checked against VESA/JEDEC).
- Intel Skylake-SP mesh date via Top500 news, not an Intel document.
- Nova Lake / 900-series chipset figures are a leak, labelled as such.

## For the translator

tests/models.cjs keeps a key-by-key inventory of the literal digits in the zh prose (`LITERALS`): any zh edit that
adds or removes a number fails until the inventory is updated and the number is tied to SPEC or a check.

All visible text, diagram labels and aria-labels are keys in copy.zh.js. Keep placeholders `{…}` as they are;
diagram labels are fitted to their boxes (they wrap to two lines, then shrink, never below 11 px at 320 wide).
Book titles of sibling essays should use their registered English titles.

## Registrar notes

- B1 (《PCIe 为什么能一代一代翻倍》, how-pcie-works) and 《芯片为什么越来越难做》 ch10 (why-chips-are-hard, untracked
  at build time) are named in plain text, not linked; turn them into links when they go live.
- Aliases avoided for siblings: 芯粒 / chiplets / 先进封装 (why-chips-are-hard #ch10), PCIe 是什么 / PCIe 通道 /
  显卡插 x8 会慢吗 (B1), CXL / NVLink (B4), 为什么并行总线被串行取代 (how-sata-works), multicore memory contention
  (why-compute-waits-for-memory #ch5).
- 主板上的 PCIe 是从哪来的 is on ch5 here (CPU lanes vs chipset lanes); the TASK file lists it among example
  aliases for the series — move it to B1 if B1 claims it.
