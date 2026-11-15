# BRIEF — 雷电接口是怎么工作的 (How Thunderbolt Works)

Built-By: Claude Code (claude-opus-5-5)
Verified-By: self-check by builder (node model test, browser test zh at 1280/390/320 and reduced motion, canvas sweep, screenshots of every model and diagram at 1280/390/320); independent review pending
Authorship-Impact: authored
Category: computing 计算机 / subtopic systems 系统 · Stage: university
Series: bus series B6 (`specs/essay-briefs/TASK-bus-series.md`)
Format: long interactive essay. Chinese written in full; `copy.en.js` is a same-keys stub (`enStub = true`), translation pending.
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
- Panther Lake (secondary only): https://www.pcworld.com/article/2935377/intels-new-panther-lake-cpu-11-essential-facts-you-should-know.html ,
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
- Panther Lake: integrated TB4, TB5 only via discrete controller on some SKUs (secondary reports; marked "claim");
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
