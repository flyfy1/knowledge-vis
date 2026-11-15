# BRIEF — 雷电接口是怎么工作的 (How Thunderbolt Works)

Built-By: Claude Code (claude-opus-5-5)
Verified-By: self-check by builder (node model test, browser test zh at 1280/390/320 and reduced motion, canvas sweep, screenshots of every model and diagram at 1280/390/320); Claude Code (claude-opus-5-5), independent review 2026-11-15: zh and en read in full, models re-derived against the primary specs, diagrams at 1280/390/320 zh/en (see Review)
Authorship-Impact: authored
Category: computing 计算机 / subtopic systems 系统 · Stage: university
Series: bus series B6 (`specs/essay-briefs/TASK-bus-series.md`)
Format: long interactive essay. Chinese written in full; `copy.en.js` translated (same keys), reviewed in the browser 2026-11-15.
Files: index.html, copy.zh.js, copy.en.js, models.js, app.js, REGISTRY.json, tests/models.cjs, tests/browser.cjs

## The one question

一根 USB-C 线，为什么能同时带显示器、网卡、硬盘和充电，还能一台接一台串下去？雷电和 USB4 到底是什么关系？
Answered in three layers: the connector and cable (pins, CC, VBUS, PD), the routers (tunnels in one packet format),
and the Connection Manager (who gets how much, how deep the tree goes). Ch9 answers "TB vs USB4": same protocol,
different guarantees.

## Changes from the starting list (TASK file)

- ch1 is the connector only (Table 3-4 pinout, CC divider, e-marker/VCONN). The "connector vs link vs protocol"
  distinction moved to ch2, where the router diagram shows it.
- ch2 adds a real header model: Table 5-2 fields, the HEC CRC-8 reproducing the spec's three Appendix A examples,
  and single-bit correction (USB4 §5.1.2.1.1 "shall correct any single-bit errors").
- ch3 uses the Connection Manager Guide 2.0 §6 algorithm itself (10 % guard band, isochronous first, ≥ 1.5 Gb/s per
  bulk path, equal split, weights) plus the USB4 §5.3.3 scheduler; it adds direction (DP is downstream only), which
  gives the page's two discoveries: reads don't compete with displays, and Bandwidth Boost hurts reads.
- ch4: the "6-device rule" is the spanning-tree depth (USB4 depths 0–5; 6 in TBT3-compatible mode). Hop latency
  has no figure in the spec, so it is a TUNED parameter with sensitivities pinned.
- ch5: retimers/active cables are one paragraph only (Type-C Table 3-1 reference length, insertion loss); the model
  is lanes × rate × coding per direction with PAM3 eye and baud arithmetic.
- ch6 adds VESA CVT-RB2 timing (pixel clock) and the CM Guide's two DP reservation methods (Max Link BW vs DP BW
  Allocation Mode), reproducing the guide's own 40 G example (second display gets HBR2 ×2 = 8.64).
- ch7 models PD Tables 3.1/3.2/3.6 and the §3.2.2 cable caps, plus the EPR entry sequence and wire time.
- ch8 models IOMMU page granularity (Thunderclap's sub-page exposure) with an occupancy closed form.
- Diagrams: nine instead of six (pinout, router/tunnels, header fields, dock, chain, lane split, Alt Mode pin use,
  PD EPR sequence, IOMMU pages).

## Chapters, models, published results, tuned parameters

| # | Law | Model | Pinned against |
|---|-----|-------|----------------|
| 1 | One CC wire: the divider tells orientation and current | V = 5·Rd/(Rp+Rd), tolerance corners | Table 4-36 windows; corners land inside, upper edges = 0.612 / 2.042 V |
| 2 | Everything is one packet format with a 4-byte header | header builder, CRC-8, syndrome correction | Appendix A: D0 FF 13→D4, F0 DF 11→37, 10 01 08→DA; 32 distinct syndromes |
| 3 | Display reserved first, rest split, WRR | CM §6 + work-conserving WRR | CM Guide 80 G example (72 avail, bulk 4, weights 14/9/9/4) |
| 4 | Top link carries all; depth 5 (6 TBT3) | chain loads, live count, RTT | USB4 §6.1, §13.4.1 |
| 5 | PAM3 11b/7t; 3+1 asymmetric | lanes × rate × coding | 20.625×128/132 = 20; Table 6-2 raw 120/40 |
| 6 | Need = pixel clock × bpp; reservation decides | CVT-RB2, Max Link BW vs alloc | 4K60 3920×2222 @ 522.61 MHz; Table 6-3; CM 40 G example |
| 7 | Voltage negotiated; cable caps | PDO tables, sink choice, wire time | Tables 3.1, 3.3 example (3/3/3/3.25 A), 3.6 |
| 8 | IOMMU grants pages | random slab layout, occupancy formula | 400-seed mean within 0.6 page of closed form |

Tuned parameters (flagged on the page): CHAIN.tHop = 1 µs per router (no spec figure; the 8 ns in USB4 is a
time-sync bound, not forwarding latency), CHAIN.tFlash = 50 µs (same value as the storage essays). Sensitivity:
RTT share 11 % at default, 6 % halved, 19 % doubled. IOMMU pool of 64 pages and uniform random placement are
demonstration choices. DSC "12 bpp" is a reader option, not a device setting. Sink choice rule (most power up to
need, higher voltage on ties) is a simplification. Drives on one chain split the PCIe tunnel equally (assumption). CC.classify reads the divider voltage at Table 4-36's own resolution (rounded to 1 mV): the table's upper
edges are the worst-case tolerance corners rounded (0.6121 V → 0.612, 2.0420 V → 2.042), and without the rounding
the exact corners fell 0.03–0.08 mV outside. This change was made after a test failed and is recorded here; as a
consequence every tolerance corner lands in its window and `ch1.say.bad` is unreachable (asserted in tests/models.cjs).

## Sources (each opened by me on 2026-11-15)

- USB4 Specification Version 2.0, November 2025 build (zip; includes the Connection Manager Guide 2.0 rev 1.2):
  https://www.usb.org/sites/default/files/USB4%20Specification%20November%202025.zip
- USB Type-C Cable and Connector Specification Release 2.5 (March 2026):
  https://usb.org/sites/default/files/USB%20Type-C%202.5%20Release%20202603.zip
- USB Power Delivery Specification r3.3 v1.0 (2026-10-16): https://usb.org/sites/default/files/USB_PD_R3.3_V1.0.zip
- USB Promoter Group USB4 developer update (announced 2019-03-04):
  https://usb.org/sites/default/files/2019-02/USB_PG_USB4_DevUpdate_Announcement_FINAL_20190226.pdf
- Intel Thunderbolt 5 technology brief (2023-09):
  https://intel.com/content/dam/www/central-libraries/us/en/documents/2023-09/thunderbolt-5-technology-brief.pdf
- Intel newsroom, Thunderbolt 4 (2020-07-08): https://www.intel.com/content/www/us/en/newsroom/news/thunderbolt-4-universal-cable-connectivity.html
  (the TB4 product-brief PDF URL now redirects to a 404)
- VESA, USB DevDays 2019, DP Alt Mode over USB Type-C:
  https://www.vesa.org/wp-content/uploads/2019/10/USB-DevDays-2019-VESA-DP-Alt-Mode-over-USB-Type-C.pdf
- VESA DisplayPort 2.0 release (2019-06-26): https://vesa.org/featured-articles/vesa-publishes-displayport-2-0-video-standard-enabling-support-for-beyond-8k-resolutions-higher-refresh-rates-for-4k-hdr-and-virtual-reality-applications/
- TI TPS65982 / TPS65983B datasheets (DP Alt Mode pin assignments C and D):
  https://www.ti.com/document-viewer/TPS65982/datasheet/GUID-FA15CA6C-B7FB-49F1-931C-AFE7AA35D7F0
- CVT-RB2 cross-check (cvt12 output for 3840×2160 60 Hz): https://bbs.archlinux.org/viewtopic.php?id=302832
- Microsoft, Kernel DMA Protection (page updated 2026-10-08):
  https://learn.microsoft.com/en-us/windows/security/hardware-security/kernel-dma-protection-for-thunderbolt
- Thunderclap (Markettos et al., NDSS 2019): https://www.ndss-symposium.org/ndss-paper/thunderclap/ , https://thunderclap.io/ ,
  slides https://dev.ndss-symposium.org/wp-content/uploads/ndss2019_05A-1_Markettos_slides.pdf
- Thunderspy (Ruytenberg, 2020): https://thunderspy.io/
- Apple newsroom, M4 Pro and M4 Max (2024-10-30), regional copy of the release:
  https://www.apple.com/ca/newsroom/2024/10/apple-introduces-m4-pro-and-m4-max/
- Intel Core Ultra Series 3 Processors Quick Reference Guide v1 (opened by the reviewer 2026-11-15): https://cdrdv2-public.intel.com/871380/Intel%20Core%20Ultra%20Series%203%20Processors%20-%20Quick%20Reference%20Guide%20v1.pdf
- Panther Lake (secondary): https://www.servethehome.com/intel-launches-core-ultra-series-3-mobile-processors-panther-lake-roars-to-life/2/ , https://www.pcworld.com/article/2935377/intels-new-panther-lake-cpu-11-essential-facts-you-should-know.html ,
  https://www.techspot.com/news/110816-intel-launches-core-ultra-series-3-panther-lake.html

## Facts that will go stale

USB4 build date (2025-11-19), Type-C 2.5 (2026-03), PD 3.3 v1.0 (2026-10-16), Kernel DMA Protection page date,
Panther Lake TB integration, "TB5 ships on Apple M4 Pro/Max". `FRONTIER` in models.js holds them; tests pin them.

## Checked / not checked

Checked against primary text: pinout, CC tables, HEC (code reproduces Appendix A), header fields, HopID rules
(§5.2, output HopID ≥ 8 on lane adapters, 0 = control), uncorrectable HEC handling, depths, line rates and coding,
PAM3 11b/7t and RS-FEC 480/504, CM Guide §6 and Tables 6-1/6-2/6-3 with both worked examples, PD tables and
EPR sequence, TB5 brief figures, TB4 newsroom figures, DP 2.0 release figures.

Not verified from a primary source (flagged on the page where used):
- the VESA CVT 1.2 standard itself (formula from published descriptions, cross-checked with one cvt12 output);
- the VESA DP Alt Mode standard itself (pin assignments C/D from TI datasheets and VESA DevDays slides);
- (resolved in review) Panther Lake is now checked against Intel's own Core Ultra Series 3 quick reference guide;
- Thunderclap paper body (abstract, slides and project page only); Linux 5.0 enabling the IOMMU for Thunderbolt
  and disabling ATS (secondary);
- USB4's position on DMA protection for hosts (no primary text found; the ch9 table says "由平台决定");
- "包含" for host-to-host on TB4/TB5 in the ch9 table (follows from USB4 making it mandatory for hosts);
- PAM3 "0.63 / 0.5" in the TB5 brief: conditions not given; ch10 lists it as a claim.

## For the translator

Every visible string, including SVG labels (`dg1.*` … `dg9.*`), canvas labels (`chN.cv.*`) and units (`u.*`), is
a copy key. Diagrams lay out from the rendered width and wrap labels, so English labels can be longer. Message
names in the PD diagram and list (Source_Capabilities, EPR_Mode …) are spec identifiers and stay in English.

## Registrar notes

- Title: 雷电接口是怎么工作的 / How Thunderbolt Works. Eleven concepts, one per chapter (REGISTRY.json).
- Not taken: "USB4 和雷电区别" / "雷电和 USB4 区别" / "Thunderbolt vs USB4" / "USB4 vs Thunderbolt" belong to
  how-usb-drives-talk #ch8. This page's ch9 (mandatory-vs-optional table) answers them more fully; the registrar may
  want to move them here or pin both.
- Avoided: "快充" (why-batteries-hold-so-little), "快充为什么发热" (inside-a-phone), bare "DMA" (why-a-few-firms-win,
  Digital Markets Act). Words like "PCIe 隧道是什么" stay with how-usb-drives-talk.
- B1 (how-pcie-works) is named in plain text in ch3.p5 and ch11.links, not linked; add the link once B1 is live.

## Review

- Reviewer: Claude Code (claude-opus-5-5), separate session; did not build the page. Date: 2026-11-15.
- Scope: zh and en read in full (every key of copy.zh.js and copy.en.js); all eight models driven in the browser; all nine
  diagrams screenshotted at 1280/390/320 in zh and en.
- Checks against primary text I opened myself (spec PDFs re-extracted with pypdf into /tmp/agent-tasks/buses/review-b6/):
  - Type-C R2.5 Table 3-4 (all 24 pins, B12 facing A1), Tables 4-27/4-28/4-29/4-36, Table 3-1 (0.8 m for USB4 Gen 3/Gen 4
    passive; full-featured cables must be e-marked).
  - CC 1 mV rounding: correct, not a hidden model error. Table 4-36's upper edges are exactly the worst-case resistor
    corners (5.5 V, Rp −5 %, Rd +10 %: 0.6121 V and 2.0420 V) rounded to the table's millivolt; Table 4-28 also gives
    2.04 V. The lower edges (0.277, 0.746, 1.369 V) sit below every corner (resistor, current-source and 3.3 V pull-up),
    so the old sentence "the windows are cut at the worst-case corners" was true only for upper edges; reworded.
  - USB4 2.0 Table 5-2 (PDF 31:28, SuppID 27, Rsvd 26:23, HopID 22:16, Length 15:8, HEC 7:0), §5.1.2.1.1 HEC (07h/00h/55h,
    shall correct single-bit errors; uncorrectable: drop, count, retrain / Gen 4 recovery); Appendix A three HEC examples
    recomputed with an independent script (D4, 37, DA) and 32 distinct single-bit syndromes.
  - §5.2: tunnelled packets use HopIDs 8 to Max Input HopID. §6.1 depths 0–5, §13.4.1 depths 0–6, §13.6.1 (depth 6
    recommended). §11: a host has one Downstream PCIe Adapter per downstream port; hubs must tunnel PCIe. §2.2.10: host
    must do USB3, DP and host-to-host; PCIe optional. §4.x: Gen 2 required, Gen 3 optional for hosts/devices, required
    for hubs; RS-FEC RS(198,194) negotiated at Gen 3; Gen 4 25.6 GBd PAM3, 11 bits / 7 trits, RS(504,480).
  - CM Guide 2.0 §6.1.2.3/6.1.2.4 (90 %, 1.5 Gb/s floors, 80 G example 72/4, weights 14/9/9/4), §6.2.1 (Max Link BW
    reserves the *maximum* rate/lane count, 8b/10b only; 40 G example 25.92 + 8.64; BW Allocation Mode needs a
    Version 2.0 DP IN adapter and DPTX support), Table 6-2 (120/40).
  - PD r3.3 §3.2.2–3.2.4, Tables 3.1 and 3.6 (65 W on a 3 A cable → Present PDP 60 W → 20 V × 3 A: right), §6.5.18
    (EPR_Source_Capabilities padded to 7 SPR slots, Extended, chunked), §6.5.1.1 (26-byte chunks), §7.30.1 (EPR entry
    order, cable discovery on SOP').
  - Intel TB5 technology brief Figure 2 and note 4; Microsoft Kernel DMA Protection page (updated 2026-10-08; no
    protection during boot); thunderclap.io and the NDSS abstract; thunderspy.io; Intel Core Ultra Series 3 quick
    reference guide; Apple M4 Pro/Max TB5 (Apple spec page and TidBITS, 2024-10-30).
  - Hand checks of CVT-RB2 4K60 (3920 × 2222, 522.614 MHz), 6K60 and 8K60 pixel clocks, the ch3 share numbers
    (1,994 / 3,562 / 869 → 5,215 / 8,000 → 3,477 MB/s) from the CM rules and work-conserving WRR.
  - Search words: no alias collides with any other REGISTRY.json or atlas/graph entry; S4 #ch3/#ch8 linked, not repeated.
  - English doc.title follows the sister pattern "<title> · a long essay you can play with" (also used by
    how-usb-drives-talk, what-a-drive-is-made-of and others); accepted.
- Changes (zh and en in sync; every new number pinned in tests/models.cjs):
  - ch6.p3: the page said TB4 "uses Max Link BW" and so lights only one of two 4K monitors, contradicting Intel's
    two-4K promise quoted two paragraphs later. Now: Max Link BW is the default for 8b/10b DP links and reserves the
    monitor's *maximum* link; two monitors topping out at HBR2 ×4 reserve 17.28 each and both fit (new model option
    SCREEN.run dpMax, pinned `tb4h2each`, `tb4h2fit`); allocation mode needs host and GPU support; which route a TB4
    product uses is stated as unverified.
  - ch8.p3: the quoted 172/76/44 KiB came from one seeded layout (43 pages, 2.5 SD below the 48.1-page mean), so the
    prose stopped matching after "shuffle". Now quotes the closed-form expectation (48.1 pages, ~193 KiB mapped, ~97 KiB
    exposed, ~65 KiB at 2 KiB) and names the default layout's 43 pages; a 400-layout mean test pins it.
  - ch7 PD wire time: the model omitted the cable's Discover Identity ACK (5 objects) and counted EPR_Source_Capabilities
    as nSpr + nEpr objects. Now 7 padded SPR slots + EPR PDOs + EPR AVS, Extended, 26-byte chunks with a chunk request:
    14.1 → 18.5 ms (pinned with an independent bit count); ch7.limit says chunked format is assumed.
  - ch2.p2: "at most 127 paths per port" → HopID max value 127, tunnel paths from 8, so at most 120 (`hopPaths`).
  - ch5.limit: claimed Gen 2/3 RS-FEC was "folded into the coding efficiency"; it was not. Now: negotiated, model leaves
    it off, costs another ~3 % when on (`g3fecLoss`). ch5.p1/say.tbt3: TB3's 20.625 → 20 no longer attributed to
    128b/132b (ratio stated as 2 bits in 66). ch5.p5: active cables use retimers or linear redrivers.
  - ch7.p5, ch9 table, ch10.d1: TB5 charging is "required for notebooks under 140 W, up to 240 W allowed (EPR supported,
    not required)", parallel to TB4's 100 W; both require 15 W for accessories.
  - ch4.p4: TB4 accessories have four Thunderbolt ports (usually one up, three down), not "4 downstream ports".
    ch4.p2: one PCIe downstream adapter per host port.
  - ch1.p1 pin arithmetic (8 + 4 + …), D+/D− joined on the board, not "in the socket" (also ch1.limit); ch1.p3 upper/lower
    window edges.
  - ch8.p1/p2: Thunderclap emulated an Intel 82574L NIC; affected macOS, FreeBSD, Linux, Windows; "sub-page exposure is
    what the paper says" softened to what thunderclap.io says. ch8.p4: Thunderspy author's claim that USB4/TB4 are also
    affected, labelled as the author's claim.
  - ch10.c1: Panther Lake now cites Intel's quick reference guide (4 integrated TB4 ports; discrete TB5 on some SKUs).
  - Registered title 《NVMe 为什么这么快》 (was 《NVMe 为什么快》, two places). English: "Annex A" → "Appendix A";
    "lanes" → "wire pairs" where a direction is meant (USB4 lanes are bidirectional); §5.2 and the Intel guide added to
    the footer.
  - Diagrams: dgPd heads clipped at the SVG edge at 320/390 (fixed in app.js: lifelines inset by half a head width);
    dgRouter cable label wrapped wider than its pill (fixed); dgDock en "Downstream" overflowed its box at 320 (label now
    "USB4 port (out)"); dgPd en divider shortened.
  - Canvases (English, found by the sweep): the ch4 "Device 6 unallocated" labels ran off the left edge at 320 (rows
    without a bar now write their label in the empty bar area), and the ch8 bounce-buffer note ran off both edges at
    390/320 (now wraps; the page grid gives up the room).
  - tests/browser.cjs: the ch4 redraw check now waits for the next frames (it failed 2 of 4 runs on a 120 ms fixed wait);
    the ch8 default-exposure check reads the seeded layout from the model; new check that the page count shown is the
    one the prose quotes.
- Unverified: the VESA CVT and DP Alt Mode standards themselves (as before); TB3's own line code (64b/66b vs 128b/132b;
  same ratio, so no number depends on it); whether shipping TB4 hosts use Max Link BW or allocation mode for two 4K
  monitors; the Thunderspy USB4/TB4 claim; the TB4 "two 4K or one 8K" wording (newsroom; the TB5 brief's TB4 column says
  "Dual 4K"); TB5 brief's PAM3 0.63/0.5 conditions; Linux 5.0 IOMMU/ATS details.

## Registrar (2026-11-15)

- The plain-text citations of 《PCIe 为什么能一代一代翻倍》 became links, zh and en: ch3.p5 → how-pcie-works #ch2, ch11.links →
  the page. how-usb-drives-talk ch8.p1 now links #ch2 (multi-protocol tunnel) and ch8.p2 links #ch9 (the Thunderbolt
  requirements); how-pcie-works ch12.links and how-a-computer-is-wired ch10.links link the page.
- One word, one owner: USB4 和雷电区别, 雷电和 USB4 区别, Thunderbolt vs USB4 and USB4 vs Thunderbolt moved from
  how-usb-drives-talk #ch8 to #ch9. Search words from the one-click check: #ch7 PD 快充协议 (快充 itself stays with
  inside-a-phone and the battery draft), #ch9 雷电 5, 雷电 5 是什么, Thunderbolt 5, what is Thunderbolt 5, #ch11 雷电,
  Thunderbolt, USB-C 能干什么, what can USB-C do. how-usb-drives-talk #ch3 gained 40Gbps, which tied with #ch5 here.
- `tests/models.cjs`: B1 is checked as a link with an existing anchor, en links must equal zh links, the "no provenance
  label" check is gone. `tests/browser.cjs` skips the hidden zh span of the provenance label in the English "no Chinese
  left" check, as the other essays do. Scripts stay at `?v=20261115`.

OS/pixels registrar (2026-11-15): ch8.p2 links how-the-os-talks-to-hardware #ch8 (DMA remapping); ch6.p1 links how-pixels-reach-a-screen
#ch2 (pixel clock and blanking) and ch6.p4 its #ch7 (DSC). #ch6 takes bare DSC, 显示流压缩 and Display Stream Compression (unowned;
how-pixels-reach-a-screen left the definitions here). Known inconsistency, not changed: ch6.p4 counts the full 25.92 Gb/s of HBR3 ×4
for DSC, but DSC on 8b/10b DisplayPort requires FEC (2.4016 %), leaving 25.31 (how-pixels-reach-a-screen ch7.p4; Linux
intel_dp_supports_dsc, drm_dp_bw_overhead). Scripts `?v=20261115b`.

Power/NIC registrar (2026-11-15), FEC fix: DSC on an 8b/10b DisplayPort link needs FEC, which costs (256·6 + 1)/(256·250) = 2.4016 %
(Linux drm_dp_bw_overhead(); i915 intel_dp_supports_dsc() refuses DSC on external DP without FEC; found in
specs/reviews/how-pixels-reach-a-screen-review-20261115.md, finding 3). models.js: `SPEC.dp.fec8b10b`, `SCREEN.isDsc` (bpp < 18),
`SCREEN.fecK` (alt2, alt4, tb4 with a DSC setting), `SCREEN.bppMax`; Alt Mode DSC capacity 25.92 → 25.31, Max Link BW gives the DSC
stream 1/k of the reserved link, allocation mode reserves need × k; UHBR rows unchanged (77.37 includes FEC). ch6.p4 (zh, en):
8K60 30-bit fits HBR3 with DSC at ≤ 12.2 bpp (×2.45; 12.5 without FEC; was 12.5 / ×2.39 against 25.92); ch6.limit says FEC is
modelled; the #scD readout uses bppMax. say.maxlink now fires on the FEC-aware fit. tests/models.cjs pins the overhead, 25.31, which
links get FEC, the three 8K60 DSC-12 fits and that ch6.p4 quotes no literal 25.92. The 12.2 differs from the pixels essay's 10.63 only
by timing (CVT-RB2 here, CTA-861 there). Scripts `?v=20261115c`.
