# BRIEF — 电脑里的零件是怎么连起来的 (How the Parts of a Computer Are Wired Together)

Built-By: Claude Code (claude-opus-5-5)
Verified-By: self-check by builder (node model test, browser test zh at 1280/390/320 and reduced motion including the STANDARD §4a diagram checks, canvas sweep zh/en at 1280/390/320, screenshots of every diagram and model); Claude Code (claude-opus-5-5), independent review 2026-11-15, zh and en read in full (see Review)
Category: computing 计算机 / subtopic systems 系统 · Stage: university
Series: bus series B2 (`specs/essay-briefs/TASK-bus-series.md`)
Format: long interactive essay. Chinese written in full; `copy.en.js` is a full translation (same keys; no `enStub`).
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
   **Tuned:** tpd = 170 ps/in (middle), Z0 = 60 Ω (bottom, most favourable) of the spec's ranges for add-in-card traces (§4.4.3.3: 150–190 ps/in, 60–100 Ω; §4.3.6.2: no impedance spec for system boards); tpd 190 → 12 loads,
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
- Intel 800 Series Chipset Family PCH Datasheet Vol. 1, 833778-003 (Feb 2025) §9.0: "DMI that supports 16 GT/s, 8 GT/s, 5 GT/s and 2.5 GT/s"; SKU table "DMI Gen 4 x8" (opened by the reviewer): https://cdrdv2-public.intel.com/833778/833778-003.pdf
- AMD Ryzen 9 9950X: https://www.amd.com/en/products/processors/desktops/ryzen/9000-series/amd-ryzen-9-9950x.html
- AMD AM5 chipsets: https://www.amd.com/en/products/processors/chipsets/am5.html
- UCIe key metrics, D. Das Sharma, HOTI 2025: https://hoti.org/assets/slides/2025_08_21_day2_SessionD_UCIe_Mem.pdf
- UCIe 3.0 release (2025-08-05): https://www.businesswire.com/news/home/20250805909613/en/UCIe-Consortium-Introduces-3.0-Specification-With-64-GTs-Performance-and-Enhanced-Manageability
- UCIe 4.0 (2026-11-12; added by the reviewer): https://www.uciexpress.org/specifications (lists 4.0 with highlights) and the Business Wire release https://www.businesswire.com/news/home/20261112413531/en/ (dated by URL and search listing; body returned 403)
- CXL 4.0 release (2025-11-18): https://computeexpresslink.org/wp-content/uploads/2025/11/CXL_4.0-Specification-Release_FINAL_Website-Copy.pdf
- Intel mesh on Skylake-SP (2017): https://top500.org/news/growing-core-count-led-intel-to-mesh-architecture/
- Xeon 6+ (search summaries of Intel's Computex newsroom post and product page, plus press):
  https://www.intel.com/content/www/us/en/newsroom/news/artificial-intelligence/intel-announces-new-ai-innovations-at-computex.html
- Intel 900-series chipset leak: https://www.guru3d.com/story/intel-900series-chipset-leak-b960-debuts-z990-keeps-full-oc-control/
- Textbooks (not opened online; standard results): Johnson & Graham, High-Speed Digital Design (1993); Dally &
  Poulton, Digital Systems Engineering (1998); Dally & Towles, Principles and Practices of Interconnection Networks
  (2004); Bertsekas & Gallager, Data Networks §6.5.2.

## Facts that will go stale

UCIe 4.0 latest spec (2026-11-12; 3.0 on 2025-08-05); CXL 4.0 at 128 GT/s (2025-11-18); Xeon 6+ up to 288 E-cores with Foveros Direct
(2026); Z890 / AM5 lane counts (current desktop generation); the leaked DMI 5.0 ×4 / ×2 for Intel 900-series.

## Checked / not checked

Checked from a primary source: every PCI, 875P, UM10204, Zeppelin, UCIe metric, ARK and AMD product-page number used
by a model. Not verified from a primary source (secondary or summary only):
- AMD's chipset link as PCIe 4.0 ×4 (product page only gives 28 total / 24 usable lanes); X870E being two chips in
  a daisy chain.
- DMI 4.0 encoding (128b/130b assumed from PCIe 4.0; the 16 GT/s rate is now primary, Intel 833778-003 §9.0).
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

## Review

- **Reviewer:** Claude Code (claude-opus-5-5), separate session; did not build the page. Date 2026-11-15.
- **Scope:** zh and en read in full (every key of copy.zh.js and copy.en.js); all eight models driven in the
  browser at 1280 (and screenshots at 390/320, zh/en); every diagram looked at in screenshots at 1280/390/320 zh/en.
- **Checks against primary sources opened by the reviewer:**
  - PCI Local Bus Spec 3.0 (lekensteyn mirror): Table 3-5 rows and notes (graphics 5×15 + 5×10 phases, LAN 10, disk 13,
    ISA 2×5, P2P 10 + 13; eight clocks target initial latency; total 9.27 µs) reproduce exactly; Table 7-7
    (33: 30/11/10/7/2; 66: 15/6/5/3/1); §4.1.2 reflected wave, "up to 10 ns, one third"; Table 4-4 Ioh = −17.1(Vcc−Vout)
    mA → 58.5 Ω; Vih 0.5 Vcc; Cin 10 pF; §4.4.3.3 Z0 / tpd ranges are for add-in-card traces; §4.3.6.2 says system
    boards have no impedance spec, a full round trip must fit in 10 ns and a single reflection must reach input levels
    ("operating frequency may be traded off for additional round trips") — the ch2 model is exactly this rule.
    Six loads + two connectors / two loads + four connectors (§4.1.2).
  - Loaded line: t' = tpd·√(1+Cd/C0), Z' = Z0/√(…) with Cd = C/0.8 in; re-derived 459 ps/in, 22.2 Ω, V1 = 27.5 %,
    2V1 = 55 %, 13 loads at 33.33 MHz (9.55 ns ≤ 10), 6 at 66.67 MHz (4.41 ≤ 5); 20 pF → 49 %, two trips, 5 loads.
    Near-end step on dg2 at 2τ is V1(2+Γs) ≈ 67 %, as drawn.
  - Intel 875P datasheet 252525-002: FSB 800 MHz "6.4 GB/s", dual DDR400 6.4, AGP 8X 2.1, HI 1.5 and CSA 266 MB/s,
    ICH5 2 SATA (150 MB/s), 8 USB 2.0; Figure 1 matches dg3. Max-min by hand: 6.4 − 0.125 − 0.266 − 2.1 = 3.909 → 3.9.
  - AMD ISSCC 2018 Zeppelin slides: ~90 / ~145 / ~200 ns (2.4 GHz, 1R DDR4-2667), 2 pJ/bit IFOP. 1/8·90 + 3/8·145 +
    1/2·200 = 165.6 ns, 1.84×.
  - Intel ARK Z890 (Q4'24, DMI 4.0, 8 lanes, PCIe 4.0 up to 24, 8 SATA, 14 USB), 800-series chipset brief (34 HSIO,
    eSPI 4 CS, processor 1x16+1x4 / 2x8+1x4 / 1x8+3x4 + Gen4 1x4, 5× 20G USB), PCH datasheet 833778-003 §9.0
    (DMI 16 GT/s): 8 × 16 × 128/130 / 8 = 15.75 GB/s. ARK Xeon 6767P (Q1'25, 2S, 4 UPI at 24 GT/s, 8 ch DDR5-6400).
  - AMD AM5 chipset page (fetched): gives lane configurations and total/usable counts, not the uplink generation;
    PCIe 4.0 ×4 = 7.88 GB/s stays labelled as secondary (press/reviews agree).
  - Ring/mesh closed forms: ring N²/(4(N−1)) = 16.25 at 64; 8×8 mesh 2·(k²−1)/(3k)·N/(N−1) = 5.33; γ ring N/8 = 8,
    mesh k/4 = 2 → ratio 4.
  - UCIe energy: 0.3 pJ × 8 Tb/s = 2.4 W; 0.6 → 4.8 W; 2 → 16 W; LPDDR5 2.8 → 22.4 W; edges 0.76 / 4.5 mm.
  - NXP UM10204 Rev 7 §7.1: t2 − t1 = 0.8473·RC; Table 10 tr 1000/300/120 ns, Cb 400/400/550 pF, IOL 3/3/20 mA at
    0.4 V, VOL 0.2 VDD at 2 mA for VDD ≤ 2 V; original release 1982. 4.7 kΩ × 200 pF → 796 ns; 400 kHz window
    967 Ω – 1.77 kΩ.
  - Frontier, each in two places: UCIe 3.0 (consortium spec page + press coverage); **UCIe 4.0 released 2026-11-12**
    (consortium spec page + Business Wire/HPCwire listings); CXL 4.0 128 GT/s 2025-11-18 (consortium white paper +
    press); Xeon 6+ 288 E-cores (Computex 2026 coverage + MWC March 2026 coverage, still inconsistent, hedge kept);
    Intel 900-series DMI 5.0 ×4/×2 (guru3d + wccftech/pcgamer, all citing a leak; labelled as leak).
  - Skylake-SP mesh routing is vertical-first (ISSCC 2018 coverage on WikiChip); the page had "across, then down".
  - Search words: no alias collides with any tracked REGISTRY.json or with the how-pcie-works / why-chips-are-hard drafts.
- **Changes (zh and en in sync):**
  - ch9.e3: said no UCIe version after 3.0 as of Nov 2026 — false; now reports UCIe 4.0 (2026-11-12) without numbers;
    `FRONTIER.ucie4`, REGISTRY frontier concept, BRIEF sources and stale-facts list updated.
  - ch2.limit: the tuned 60 Ω was called a "middle value"; the ranges are the add-in-card trace ranges and the spec
    sets none for system boards — now says so, and that 60 Ω is the bottom (most favourable) end; "6 slots plus 2"
    (en) corrected to six loads plus two connectors. Tests pin both and pin tpd/Z0 to the spec range.
  - ch3.p4: "two SATA disks at 150 MB/s each" → two SATA ports at up to 150 MB/s (interface limit; 2004 disks could
    not reach it).
  - ch4.p4: "the OS spreads memory evenly" by default → the default assumes interleaving (as with NUMA off in the
    BIOS); Linux normally allocates locally.
  - ch6.p2 / dg6.b.note: routing direction made generic, with Intel's vertical-first noted.
  - ch7.p2: "wires inside a die are tens of µm long" → thin and short, often tens of µm between neighbouring circuits.
  - dg2.cap: "on the right" → wording that also fits the stacked layout at ≤ 640 px.
  - dg8: junction dots so it is clear which wire joins SDA or SCL (the second pull-up crosses SDA).
  - ch2 canvas: the "Top speed about … MHz" label ran off the left edge at 320 px in English (canvas sweep); now clamped inside the plot.
  - ch4 bars: shares shown to one decimal (13 % → 12.5 %, matching the tile).
  - English: "Core {n}" labels overflowed their boxes on dg6 → "C{n}" with the caption explaining; dg1 bus label sat
    on the bus line → "Shared wires"; ch4.p1 and ch8.p5 grammar; "chipset overview" → "chipset brief"; ch9.d1 "had
    shipped" → "was on the market" (matches 上市); ch8.read.dev; ch3.p5 tense.
- **Unverified / left:**
  - AMD chipset uplink generation (PCIe 4.0 ×4) and the X870E daisy chain: AMD's pages do not state them.
  - UCIe 4.0 details beyond the spec page's highlight list (press release bodies returned 403); the page quotes no 4.0 numbers.
  - Xeon 6+ launch date (MWC March vs Computex June 2026): sources still disagree; the hedge stays.
  - Canvas labels on the ch7 model shrink to about 8–9 px at 320 px (canvas, not a §4a diagram); not changed.
  - tests/browser.cjs checks label-vs-label and label-vs-SVG overlap but not label-vs-box or label-on-line; the two
    English diagram problems above were found only in screenshots.

## Registrar (2026-11-15)

- The plain-text citations of 《PCIe 为什么能一代一代翻倍》 became links, zh and en: ch1.limit → how-pcie-works #ch1 (the
  real point-to-point interface), ch2.p5 and ch5.p5 → #ch2 (doubling; ×16 vs ×8), ch9.d2 → #ch11 (PCIe 7.0); ch10.links adds
  how-pcie-works and how-thunderbolt-works. Pages that now link here: how-pcie-works ch1.limit (#ch5) and ch12.links,
  how-sata-works ch2.limit (#ch2). B3, B4, B5 and why-chips-are-hard (unregistered draft) stay plain text.
- Search words from the one-click check: #ch1 总线 / computer bus. 主板上的 PCIe 是从哪来的, DMI, PCH and 芯片组 stay here
  (no collision). 芯粒 and chiplets reach #ch7 through its title only: the draft tech/semiconductors/why-chips-are-hard lists
  芯粒, 小芯片 and chiplets as its own aliases, and the reserved list in `tests/models.cjs` keeps them off this page. When that
  draft is registered, check that 芯粒 / chiplets go where the registrar decides and that UCIe / die-to-die stay here.
- `tests/models.cjs`: how-pcie-works and how-thunderbolt-works join the live-sibling whitelist and anchor checks, the "B1 as
  plain text" check became link checks, en links must equal zh links. Scripts stay at `?v=20261115`.
