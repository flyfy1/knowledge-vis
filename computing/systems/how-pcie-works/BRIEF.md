# BRIEF — PCIe 为什么能一代一代翻倍 (Why PCIe Keeps Doubling)

Built-By: Claude Code (claude-opus-5-5)
Verified-By: self-check by builder (node model test, browser test zh at 1280/390/320 and reduced motion, canvas sweep, screenshots of every model and diagram at 1280, spot checks at 320 and 390 with reduced motion); independent review pending
Category: computing 计算机 / subtopic systems 系统 · Stage: university
Series: bus series B1 (`specs/essay-briefs/TASK-bus-series.md`)
Format: long interactive essay. copy.zh.js is complete; copy.en.js is a same-keys stub (`enStub = true`) awaiting translation.
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
| scaled flow control | modelled as "no cap" | ch4 | real scale factors not verified | |

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
- Completion Lower Address width: 7 bits used (PCIe spec as quoted by Xillybus/Budruk); rtlp-lib shows 6. 
- Scaled flow control factors (modelled only as removing the cap) and the generation that introduced it.
- The Gen3+ STP token layout (only its total, 8 bytes per TLP with LCRC, is used).
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
