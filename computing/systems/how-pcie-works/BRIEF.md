# BRIEF — PCIe 为什么能一代一代翻倍 (Why PCIe Keeps Doubling)

Built-By: Claude Code (claude-opus-5-5)
Verified-By: self-check by builder (node model test, browser test zh at 1280/390/320 and reduced motion, canvas sweep, screenshots of every model and diagram at 1280, spot checks at 320 and 390 with reduced motion); Claude Code (claude-opus-5-5), separate session, independent review 2026-11-15: zh and en read in full, models re-derived, 12 diagrams screenshotted at 1280/390/320 zh/en (see Review)
Category: computing 计算机 / subtopic systems 系统 · Stage: university
Series: bus series B1 (`specs/essay-briefs/TASK-bus-series.md`)
Format: long interactive essay. copy.zh.js and copy.en.js are complete and key-for-key identical (English translated; `enStub` removed).
Files: index.html, copy.zh.js, copy.en.js, models.js, app.js, REGISTRY.json, tests/models.cjs, tests/browser.cjs

## The one question

显卡、固态、网卡都插在 PCIe 上。这条总线二十多年里速度翻了七次，靠的是什么？一次读写在这根线上到底发生了什么？

## Chapters, models and diagrams

| Ch | Title | Model (interactive) | Static diagram (STANDARD §4a) |
|---|---|---|---|
| 1 | 一棵树，不是一条总线 | — | d1 tree: root complex, switch, endpoints (schematic) |
| 2 | 一条通道，七次翻倍 | card × slot negotiation → link and GB/s | d2 one lane (two pairs, AC caps); d3 encoding overhead bars (to scale) |
| 3 | 一次读写，几个包 | TLP efficiency vs size, MPS/MRRS/completion split, live header hex | d4 layer framing (schematic); d5 header bit map, 1 bit = 1/32 row (to scale) |
| 4 | 发之前，先数对面还有没有地方 | credit gate, event simulation with the modular rule | d6 credit loop (CL, CC, P/NP/Cpl × hdr/data) |
| 5 | 错了就重发 | go-back-N vs selective repeat under a BER | d7 ACK/NAK replay sequence |
| 6 | 开机点名 | step-through depth-first enumerator, BAR sizing, 1 MiB windows, address map with zoom | d8 type-0 config header (offsets from pci_regs.h) + ECAM bit split |
| 7 | 中断也是一次写内存 | MSI address/data builder, MSI-X entry and the 1-DW MWr bytes; real lspci record | d9 doorbell → DMA via IOMMU → MSI → APIC |
| 8 | 越快，走得越近 | trace loss vs length for three materials against Gen5/6/7 budgets, retimers | d10 channel + Gen5 36 dB budget bar (bar to scale) |
| 9 | 一个符号两比特 | NRZ vs PAM4 eyes under the same Gaussian noise, BER readouts | d11 NRZ eye vs three PAM4 eyes, Gray-coded levels |
| 10 | 固定大小的 FLIT | (a) FEC + retry goodput at 64 GT/s; (b) latency/bandwidth vs TLP size, Das Sharma slide 13 | d12 256-byte FLIT, one cell per byte (to scale) |
| 11 | 前沿在哪（截至 2026 年 11 月） | — | — |
| 12 | 回到开头 | — | — |

## Changes from the starting list (TASK file)

- The starting ch3 ("three layers") is split: ch3 keeps the transaction layer and the TLP bytes; ACK/NAK and the
  replay buffer moved to ch5 where they are modelled. The data link layer's LCRC and sequence number are introduced
  in ch3 (d4) and used in ch5.
- The starting ch9 (PAM4 and FLIT) became two chapters: ch9 PAM4 and eyes, ch10 FEC and FLIT with two models,
  because the FEC trade and the FLIT latency table are separate results.
- ch2 carries the Gen3 decision (8 GT/s scrambled vs 10 GT/s 8b/10b, Froelich 2008) and links S2 for 8b/10b itself.
- Equalisation (CTLE/DFE) is described in one sentence in ch8 and in ch9; it is not modelled (no sourced numbers).
- Virtual channels are not modelled; ch4 models one credit type in one direction.
- Twelve chapters instead of eleven (frontier ch11, closing ch12).

## Tuned parameters (all labelled on the page, halving/doubling stated in the prose)

| Parameter | Value | Where | Halved | Doubled |
|---|---|---|---|---|
| credit round trip | 1000 ns | ch4 | utilisation 56% → 100% | → 28% |
| ACK round trip | 1000 ns | ch5 | U at 1e-6: 66% → 80% | → 50% |
| FLIT round trip | 1000 ns | ch10 | no-FEC U at 1e-6: 49% → 66% | → 33% (with FEC: > 99.9% either way) |
| Gen6/7 package + connector loss | = Gen5 (10 dB) | ch8 | Gen7 mid-loss reach 5.2 → 6.7 in | → 2.1 in |
| Dk of all boards | 4.35 | ch8 | chosen so mid-loss dielectric = Hargin 0.48 dB/in at 10 GHz | |
| MMIO base, device list | 0x80000000, GPU/switch/SSD/NIC/USB | ch6 | moving the base changes no size (pinned in tests) | |
| scaled flow control | ×16: header cap 127·16 = 2032, data slider up to 8192 (< 32,752) | ch4 | factors 1/4/16 from NVIDIA patent US9904653 | |

## Sources (all opened 2026-11-15)

Primary or first-hand:
- D. Das Sharma, "PCI Express 6.0 Specification", OFA workshop 2022 — https://www.openfabrics.org/wp-content/uploads/2022-workshop/2022-workshop-presentations/206_DDasSharma.pdf (slide 4 generation table, slide 13 latency/bandwidth table, FLIT layout 236/6/8/6, FEC 3-way interleave, FBER 1e-6, < 2 ns decode)
- D. Froelich, "PCI Express 3.0 PHY Electrical Layer Requirements", PCI-SIG 2008 (copy hosted on TI E2E) — https://e2e.ti.com/cfs-file/__key/telligent-evolution-components-attachments/00-48-01-00-00-71-64-61/03_5F00_PCIe_5F00_3.0_5F00_PHY_5F00_Electrical_5F00_Layer_5F00_Requirements_5F00_Final_5B00_1_5D00_.pdf (8 vs 10 GT/s, −13.5 / −19.3 dB, BER 1e-12)
- Budruk, Anderson, Shanley, PCI Express System Architecture, ch. 3 sample — https://ptgmedia.pearsoncmg.com/images/0321156307/samplechapter/budrukch03.pdf
- Linux: https://raw.githubusercontent.com/torvalds/linux/master/include/uapi/linux/pci_regs.h, https://raw.githubusercontent.com/torvalds/linux/master/include/linux/pci-ecam.h, https://raw.githubusercontent.com/torvalds/linux/master/drivers/pci/ecam.c (and include/linux/pci.h)
- Intel SDM vol. 3A §10.11 MSI format (mirror) — https://xem.github.io/minix86/manual/intel-x86-and-64-manual-vol3/o_fe12b1e2a880e0ce-397.html
- E. Billauer, lspci MSI record — https://billauer.co.il/blog/?p=1119
- TI SNLA401 (loss budgets, retimer +28 dB, redriver +16 dB, Gen4 28 dB) — https://www.ti.com/document-viewer/lit/html/SNLA401
- Tektronix, "PCIe 7.0 Introduction / PCIe 6.0 Solution" (2023) — https://map-assets.tek.com/map-assets/emea/pdf-files/PCIe7_0_Intro_PCIe_6_0_Solution.pdf ; Tektronix Gen5/6 TRx (2022) — https://20134699.fs1.hubspotusercontent-na1.net/hubfs/20134699/Presentation-and-Publication/%5BTektronix%5D%20PCIe%205.0%20&%206.0%20Electrical%20TRx%20Test%20Solution_Anritsu%20Showcase%202022_0920.pdf
- Samtec, DesignCon 2024, PCIe and PAM4 to 128 GT/s — https://suddendocs.samtec.com/notesandwhitepapers/samtec-dc24-ppt-pciexpress-and-pam4-the-pathway-to-128gtps.pdf
- Z. Hargin, Siemens, "Loss planning" (2025-10-09) — https://blogs.sw.siemens.com/electronic-systems-design/2025/10/09/loss-planning/
- CXL Consortium, CXL 4.0 white paper (2025-11) — https://computeexpresslink.org/wp-content/uploads/2025/11/CXL_4.0-White-Paper_FINAL.pdf
- Credo news release 2026-02-10 (Toucan compliant at 32 GT/s) — https://s205.q4cdn.com/511065572/files/doc_news/Credos-Toucan-PCIe-Retimer-Achieves-PCISIG-Compliance-2026.pdf
- G. Colton, blog 2024-11 (credit caps 127 / 2047) — https://scolton.blogspot.com/2024/11 ; Xillybus TLP primer — https://xillybus.com/tutorials/pci-express-tlp-pcie-primer-tutorial-guide-2
- Textbook results: Stallings, Data and Computer Communications (go-back-N utilisation); Proakis, Digital Communications (M-PAM error rate); Numerical Recipes erfcc.

Secondary (used where the primary could not be fetched):
- ServeTheHome, PCIe 7.0 release and optical ECN (2025-06-15) — https://www.servethehome.com/pci-sig-releases-pcie-7-0-specifications-and-optical-pcie/
- ServeTheHome, PCIe 8.0 draft 0.5 (2026-05-06) — https://servethehome.com/pci-sig-pcie-8-0-specification-draft-0-5-released/
- innovationopenlab, Credo Gen6 retimer on the 6.x Integrators List (2026-08-31) — https://www.innovationopenlab.com/news-biz/71744/credos-toucan-pcie-retimer-achieves-pci-express-compliance-and-joins-pci-express-6x-integrators-list.html
- Micron 9650 mass production (2026-02): Micron IR page https://micron.gcs-web.com/node/50236 and press coverage; the page only links why-nvme-is-fast #ch8 for it.
- MSOE course notes (overview cross-check) — https://faculty-web.msoe.edu/johnsontimoj/EE4980/files4980/parallel_communications_pcie.pdf ; rtlp-lib field table — https://docs.rs/crate/rtlp-lib/0.5.0/source/tlp.md

Added in review (2026-11-15): AMD PG346 https://docs.amd.com/r/en-US/pg346-cpm-pcie/Completer-Completion-Descriptor-Format ; Ajanovic, Hot Chips 2009 https://old.hotchips.org/wp-content/uploads/hc_archives/hc21/1_sun/HC21.23.1.SystemInterconnectTutorial-Epub/HC21.23.131.Ajanovic-Intel-PCIeGen3.pdf ; Astera Labs https://www.asteralabs.com/insights/pci-express-5-0-architecture-channel-insertion-loss-budget/ ; NVIDIA patent https://patents.google.com/patent/US9904653 ; Billauer (moved) https://billauer.se/blog/?p=1119 ; eeNews Europe https://www.eenewseurope.com/en/pci-sig-announces-pcie-7-0-and-optical-interconnect-revision-for-ai-and-data-centres

Could not be opened: pcisig.com, BusinessWire (PCI-SIG optical release, Cadence 6.x compliance release), Intel FPGA
docs (redirects), allaboutcircuits, signalintegrityjournal (403).

## Facts that will go stale (frontier block, models.js FRONTIER)

PCIe 7.0 released 2025-06 with the optical-aware retimer ECN; PCIe 8.0 drafts 0.3 (2025-09) and 0.5 (2026-05),
256 GT/s, full spec targeted 2028, "1 TB/s ×16 bidirectional"; first 6.x compliance workshop concluded 2026-07-31;
CXL 4.0 (2025-11) on the 128 GT/s PHY; Micron 9650 PCIe 6.0 SSD in mass production 2026-02.

## Checked / not checked

Checked against a source: generation rates and years; encodings; Gen3 decision; TLP field widths and Fmt/Type codes
(two real header dumps reproduced); 8 bytes per TLP outside the header (matches Das Sharma's 24-byte 4-DW TLP);
the slide-13 latency table (every row, to 5e-9 ns); config header offsets; ECAM bit split; BAR sizing; MSI
address/data bits and a real record; MSI-X entry layout; Gen5/6/7 budgets; retimer reach; FLIT byte budget.

Not verified from a primary source:
- (Settled in review: Completion Lower Address is 7 bits; see Review.)
- Scaled flow control: factors now from a patent and vendor guides (see Review); not from the spec text.
- (Settled in review: Gen3 STP token layout from Intel's Hot Chips 2009 slides; see Review.)
- FLIT byte order and which interleave each byte belongs to (d12 says the assignment is schematic).
- PAM4 Gray-code level order in PCIe 6.0 (d11 labels follow standard Gray coding).
- Gen7 loss budget (pre-release vendor material); Gen6/7 package and connector losses (assumed = Gen5).
- Replay timer value (not used numerically; ACK round trip is a reader parameter).
- That the spec's loss budget assumes a reference CTLE/DFE receiver (stated qualitatively in ch8).
- Selective replay in FLIT mode (the page only says "重发那个 FLIT").
- All PCI-SIG facts are second-hand (ServeTheHome); Cadence's "first" workshop claim is reported as a claim.

## Note for the translator

copy.en.js mirrors copy.zh.js key for key. Keep every `{placeholder}`, every `<a href>` target and anchor, and the
sibling titles in English as they appear in each sibling's REGISTRY.json. Diagram labels must stay short (they are
laid out at 15 SVG units; long labels wrap). Remove `window.ESSAY_COPY.enStub = true;` when done; the tests then
also check the English registry title/desc and run the browser sweep in English.

## Review

Reviewer: Claude Code (claude-opus-5-5), separate session; did not build the page. Date: 2026-11-15.
Scope: every key of copy.zh.js and copy.en.js read in full; every model driven and its prose numbers re-derived by
hand or an independent formula; all 12 diagrams screenshotted at 1280/390/320 in zh and en; sources below opened.

Checks re-derived (all reproduce): Gen5 ×16 = 32·16·128/130/8 = 63.0 GB/s; 4 KiB write at MPS 256 = 4096/(4096+16·24)
= 91.4%; credits at 1000 ns: τ = 280/63.0 = 4.44 ns, W = 127, U = 127·4.44/1004.4 = 56% (500 ns → 100%, 2000 ns → 28%);
BER 1e-6: p = 1−(1−1e-6)^2240 = 0.22%, go-back-N 66%, selective 99.8%; Gen6 FLIT no-FEC 49%, FEC retry 7e-7;
board reach (36 − 19.5)/1.99 = 8.3 in (Gen5 mid), (36 − 19)/3.27 = 5.2 in (Gen7 mid), halved/doubled 6.7/2.1 in;
FLIT crossover 1.911·(m+6)/(m+4) = 2 at m = 38.8 DW; PAM4 penalty 20·log10 3 = 9.54 dB; NRZ 1e-12 at 23.0 dB.

Errors found and fixed (zh and en in sync, tests updated):
- "速度翻了七次 / doubled seven times" (hero, desc, ch2 title, toc, ch12, index.html meta, REGISTRY desc): Gen1→Gen7 is
  six doublings (ch12 itself lists six generations). Now 六次 / six. (The TASK file's one question also says 七次.)
- Go-back-N model: used (1−p)/(1+K·p) with K = frames resent per error; Stallings' formula is (1−p)/(1+2a·p) with
  1+2a = K. Fixed in models.js (also feeds ch10); test now checks the formula and an independent first-principles
  derivation. Prose moved: 4096 B at 1e-6 63% → 65%; 10⁻⁸ 99.49% → 99.50%; other rounded values unchanged.
- ch7.p4 / ch7.say.real: the lspci record 0xfee0300c has DM=1 (logical mode), so destination 0x03 is a bit mask of
  cores, not "3 号中断控制器 / interrupt controller 3". Rewritten; test pins DM=1/RH=1.
- ch3.p4: MRRS is not negotiated along the path (only MPS is); reworded.
- ch5.p3: REPLAY_NUM rolls over when the fourth replay would start (after three unsuccessful replays), and the link
  retrains before replaying; reworded, readout label likewise.
- d4 note: Gen3 does not replace the END with a token: STP is a 4-byte token (11-bit length, frame CRC, parity, 12-bit
  sequence number) and there is no END. Rewritten.
- ch2.p1, d2 caption: "没有时钟线 / no clock wire" → no clock travels with the data; the slot's 100 MHz reference
  clock is mentioned.
- ch4.p5/limit and the model: scaled flow control now stated as PCIe 4.0 on, factors 1/4/16, ×16 caps 2032 header and
  32,752 data credits (≈512 KiB); the model's checkbox uses the ×16 header cap (2032) instead of an arbitrary 4096.
- ch10.p1: "回退 N 帧会吃掉一大半带宽 / most of the bandwidth" → about half (the model gives 49% left).
- ch8.limit: adds Astera Labs' Gen5 split (package 9, board 16 dB) → mid-loss reach 8.0 in vs 8.3 in (pinned).
- d5 caption: field widths are not in Linux headers; now credited to the spec via MindShare and AMD IP guides.
- English: ISO-style dates in prose (as of 2026-11, in 2025-06 …) → month names.
- Layout: d5 at 320 px crammed T8/A2/LN/TH and TD/EP into unreadable 16-bit rows → DW0 drawn one byte per row in the
  narrow variant (new key d5.bits.byte); d8 at 320 px had wrapped labels spilling out of cells (Hdr type, Lat timer,
  Cache line, Subsystem vendor, Cap pointer) → rows grow with their labels; d4 at 1280 (en) note ran outside the SVG
  after the longer Gen3 note → height follows the note.

Second-hand facts upgraded to a primary or near-primary source (opened 2026-11-15):
- Completion Lower Address = 7 bits [6:0]: AMD PG346 Completer Completion Descriptor (quotes the spec's "least
  significant 7 bits"); rtlp-lib's own API doc also says "7-bit Lower Address", so its tlp.md range [63:58] (6 bits,
  bits 57:56 missing) is a transcription slip, not a different header. Applies to the non-FLIT completion header.
  https://docs.amd.com/r/en-US/pg346-cpm-pcie/Completer-Completion-Descriptor-Format ; https://docs.rs/rtlp-lib/0.5.0/rtlp_lib/struct.CompletionReqDW23.html
- Gen3 STP token layout, implicit END, SDP (F0h ACh) + 6-byte DLLP = 8 bytes, "8G chosen over 10G due to eye margin":
  M. Ajanovic (Intel), "PCI Express 3.0 Overview", Hot Chips 21 (2009) —
  https://old.hotchips.org/wp-content/uploads/hc_archives/hc21/1_sun/HC21.23.1.SystemInterconnectTutorial-Epub/HC21.23.131.Ajanovic-Intel-PCIeGen3.pdf
- MSI record 0xfee0300c / 0x4171: Billauer's blog opened (now at https://billauer.se/blog/?p=1119).
- Gen5 36 dB at 16 GHz: Astera Labs (also gives the 9/16/1.5/9.5 split and Gen4 28 dB) —
  https://www.asteralabs.com/insights/pci-express-5-0-architecture-channel-insertion-loss-budget/ ; NVIDIA BlueField-3 manual.
- Scaled flow control factors 1/4/16 and ×16 caps (2032 / 32,752 in the patent text; its Table 1 lists 2031 / 32,751): NVIDIA patent US9904653 (Glaser, Runhaar),
  https://patents.google.com/patent/US9904653 — not the spec, but the proposal it came from; non-scaled caps 127/2047
  also in Efinix's PCIe controller guide (search snippet; page since 404).
- PCIe 7.0 release (June 2025, 128 GT/s, 512 GB/s ×16 bidirectional, PAM4 + FLIT, optical-aware retimer ECN amending
  6.4 and 7.0): second place = eeNews Europe 2025-06-12,
  https://www.eenewseurope.com/en/pci-sig-announces-pcie-7-0-and-optical-interconnect-revision-for-ai-and-data-centres
- PCIe 8.0 draft 0.5 (May 2026; draft 0.3 Sept 2025; 256 GT/s; keeps PAM4 and FLIT; ~1 TB/s ×16; 2028): ServeTheHome
  re-opened (confirms PAM4/FLIT retained, so ch10.p6 stands) and Tom's Hardware headline.

Still second-hand or unverified: everything from pcisig.com itself (pcisig.com, BusinessWire 403, Wayback blocked);
the PCIe 4.0 start of scaled flow control; Gen6 32 dB and Gen7 ≈36 dB loss budgets (vendor material only); the
replay timer value (not used numerically); the Gen6/7 package/connector split (tuned); PAM4 Gray order in PCIe 6.0;
FLIT byte-to-interleave assignment (caption says schematic); Lower Address width in FLIT-mode headers (not drawn);
Micron 9650 and Credo items; Cadence's "first workshop" claim.

Not changed (design notes): the FEC retry probability (≈7e-7 at 1e-6) assumes independent byte errors and is lower
than burst-error figures in Das Sharma's papers; the limit text says so. The narrow d5 shows "Address [63:32]" on both
half-rows of DW2/DW3 (high half on top), which is correct but repetitive.

## Registrar (2026-11-15)

- Links to the bus-series siblings, live together with this page, zh and en: ch1.limit now points at
  how-a-computer-is-wired #ch5 (where a board's lanes come from) instead of "another essay"; ch12.links adds one sentence
  linking how-a-computer-is-wired and how-thunderbolt-works. Pages that now link here: how-a-computer-is-wired (#ch1, #ch2,
  #ch11 and the page), how-thunderbolt-works (#ch2 and the page), how-usb-drives-talk ch8.p1 (#ch1), why-nvme-is-fast ch2.p2
  (#ch2), what-a-drive-is-made-of ch7.p4 (the page).
- Search words from the one-click check: #ch1 PCIe / PCI Express, #ch2 PCIe 4.0 和 5.0 区别 / PCIe 4.0 vs 5.0. This page owns
  the generic PCIe words; why-nvme-is-fast keeps PCIe 4.0 5.0 6.0 SSD 速度, PCIe vs SATA bandwidth and MSI-X 中断 (so the
  plain query "MSI-X" still opens its #ch4).
- `tests/models.cjs`: the two siblings join the anchor and title checks, en links must equal zh links, and the "no provenance
  label yet" check is gone (the label is added at registration). Scripts stay at `?v=20261115` (never deployed before).

## Registrar of B3 and B4 (2026-11-15)

- ch11.e3 (CXL 4.0) gains one sentence linking B4 `coherent-interconnects` #ch3 (the CXL protocols and flits), zh and en;
  tests/models.cjs checks the link, its anchor and the quoted title. No alias changed. Scripts move to `?v=20261115b`.
