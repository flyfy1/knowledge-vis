# Review: how-a-nic-moves-packets (网卡是怎么搬运数据包的 / How a Network Card Moves Packets)

Reviewer: Claude Code (claude-opus-5-5), independent of the builder (Claude Code, Opus, zh) and the translator (Haiku, en).
Date: 2026-11-15. Scope (reduced motion: one full-page screenshot at 390 plus the behaviour checks in tests/browser.cjs; diagrams are static SVG): copy.zh.js and copy.en.js in full, models.js, app.js (formatting and live sentences),
index.html (site-nav include), tests; claims against primary sources; browser test zh + en; canvas sweep; screenshots
of all 8 diagrams and 10 model cards at 1280 / 390 / 320 in both languages, plus reduced motion.
Edits only inside `computing/systems/how-a-nic-moves-packets/` and this note. Nothing committed.

## Findings and fixes

### Facts wrong or misquoted

1. **802.3dj ballot (ch13.e3).** The page said "131 张票里 99 张赞成（77%）" / "99 of 131 votes in favor (77%)"; 99 / 131 is 76 %.
   The IEEE 802.3 e-mail of 2026-03-28 gives 131 returned = 99 approve + 29 disapprove + 3 abstain; the 77 % is
   99 / 128, abstentions excluded (75 % required). Fixed in both languages: all four counts, "approval rate 77 % not
   counting abstentions". `FRONTIER.dj` now holds approve / disapprove / abstain and `prose()` computes `djPct`;
   pinned in tests (`djRet djYes djNo djAbs djPct djCom`, plus returned = sum).
2. **802.3dj scope.** "每条通道 200 Gb/s" was not on the project page (its title gives 200G–1.6T only). Now attributed
   to the Ethernet Alliance.
3. **Niantic batches (ch4.p2).** Neugebauer's "up to 40 / up to 8" are *TX* descriptors; the page applied them to
   descriptors in general in a receive chapter. Now says transmit descriptors and that the model assumes 8 for RX.
4. **Cai copy share (ch7.tuned).** The fit pairs 42 Gb/s (all optimizations incl. aRFS) with 49 % copy, which Cai
   report for GRO + jumbo *before* aRFS. The tuned note now says so (the fit is unchanged; numbers unchanged).
5. **Farshin (ch8.p4).** "两者抢同一些路时双方的缓存不命中都会上升" overstated Fig. 4 (the cache-sensitive app's misses
   rise). Reworded.
6. **Linux scaling.rst (ch5.p2, ch6.p3).** "要求" → "建议" (the doc says NICs *should* provide ≥ 4×). The queue advice
   now matches the doc: one queue per CPU for low latency; HT showed no benefit, so no more queues than cores.

### PCIe overhead vs the PCIe essay
Both essays use 24 B per 4-DW TLP (8 B framing + DLL, 16 B header); they differ only in the DLLP share.
Neugebauer deducts 8.07 % (62.96 → 57.88 Gb/s, "recommended values"; the paper notes it depends on transaction rate
and implementation); how-pcie-works applies 2 % only in its ch10 Gen5-vs-FLIT comparison (Das Sharma), and its ch3
model omits DLLPs. The page had called that essay "B1" (an internal series code) on the toggle and implied its prose
states 2 %. Fixed: toggle "PCIe 那篇第 10 章的 2%" / "PCIe essay, ch. 10: 2%"; ch4.p4 explains where the two estimates
come from and links `../how-pcie-works/#ch10`. Arithmetic re-derived: Gen5 x16 = 504.1 Gb/s after 128b/130b,
× 0.9193 = 463.4; 106 B × 8 × 595.2 Mpps = 504.8 Gb/s → 91.8 %; with 2 %: 494.0 → 97.9 %. No contradiction remains:
both estimates say 64 B does not fit and 1518 B does.

### Live sentences wrong in some states
7. **ch10 default (400G / 64 B).** `say.pci` fired ("加多少核心也没用") while the readouts and ch10.p3 quoted 25 / 14 / 124
   cores. The sentence now gives the per-core arithmetic and scopes the 115 Mpps ceiling to the paper's 2018 machine,
   pointing to ch4 for a 400G card's own PCIe; ch10.p3 gets the same clause.
8. **ch2.say.tiny** ("连一次加载都不够") fires below 10 ns (< 30 cycles), where an L1/L2 load still fits. Now "not even one
   L3 access (a few dozen cycles)".

### Prose numbers not from the model
ch2.law "1.7 纳秒" → `{ns64}` (1.68); ch13.e1 "64 / 12 字节" → `{eMinF}` / `{eIfg}`. Remaining literals in law lines
(64, 1518, 20 B) are standard constants, unchanged; two sourced literals added in review are thresholds, not model
outputs: "（要求 75%）" / "(75% required)" in ch13.e3, and "8 个一批" in ch4.p2, which mirrors `PCIE.batch` and the toggle label.

### English
- Spelling: the computing/systems essays use British spelling (fibre 32 vs fiber 3; colour 72 vs color 4). Made the
  page consistent: fibre (doc.desc, hero.sub, diagram), coloured, modelled, traveller, data centre, in favour.
  REGISTRY desc.en already said fibre and still equals doc.desc.
- Draft titles: "How Much a Wire Carries" → **"How Much a Wire Can Carry"** (tech/networks/how-much-a-wire-can-carry
  REGISTRY); "How a Web Page Reaches Your Phone" was already right. "two drafts" → "two essays still being written".
- ch4.dll.b fixed (above); ch4.dll.n "Paper's" → "The paper's"; ch6.p3 "In its 2021 measurements" → "their";
  ch10.model.title "drop a packet that must go" → "drop unwanted packets".
- Verbatim quotes: the only quoted wording attributed to a source is "aRFS is to RFS what RSS is to RPS" (verbatim in
  scaling.rst); the zh renders it as 文档的说法是 (a translation, not a quote mark). No paraphrase is presented in quotes.
- New test (checked to fail on a deliberately misspelled title, then restored): every link to a sibling quotes its exact English title, every sibling title in “…” matches the sibling's `copy.en.js` hero.title, and both draft titles match their
  REGISTRY (zh and en), so they auto-link once live.

### Model soundness
- ECMP vs spraying: an independent script throwing 64 balls uniformly into 64 bins gives mean 1/max = 0.262; the page's
  Toeplitz-hashed 26 % agrees. Spraying 99 % is round-robin per flow with a random offset; assumptions (equal flows,
  one switch tier, Toeplitz standing in for vendor hashes, reorder cost ignored) are labelled in ch12.limit.
- Tuned constants are labelled where their numbers appear (3 GHz core in ch2 how/readout; elephant = 100 mice in
  ch5.tuned; Cai fit in ch7.tuned with the doubling sensitivity; DDIO load / stall period in ch8.tuned; BQL hold in
  ch9.limit). Gen6 header sizes are flagged approximate in ch4.limit; DDIO LRU stated in ch8.limit.
- Budget arithmetic: 400G at 64 B, 84 B on the wire → 595.2 Mpps, 1.68 ns; 1518 B → 1538 B, 32.5 Mpps, 30.8 ns. Correct.

### Diagrams (STANDARD §4a)
Eight diagrams (nic, frame, rx, rss, tso, tx, xdp, qp), each before its model, captions say schematic (frame says
widths schematic; its byte counts are from `SRC.eth`). Screenshots at 1280 / 390 / 320 zh + en: no overlaps or
clipping; portrait variants at ≤ 640 px. Field order and widths in `frame` correct; the FCS bracket spans destination
through data, correct. Minor, left: in `rx` step 6 (MSI-X) is drawn in the driver column though the card sends it
(the label reads as "interrupt arrives, or wait for polling", acceptable); in the portrait `qp` at 320 the step-1 badge sits on the SQ box's top edge, readable.

### Site navigation
index.html includes `site-nav.css?v=sn-20261115` before `</head>` and `site-nav.js?v=sn-20261115` last in `<body>`,
matching `VERSION` in scripts/build-site-nav.cjs. Titles of siblings are in 《》 / “…” and exact.

## Tests (final)
- `node tests/models.cjs` → PASS: 13489 checks
- `ESSAY_BASE_URL=http://127.0.0.1:18991 node tests/browser.cjs` → PASS (zh+en at 1280/390/320, eight diagrams, ten models, reduced motion)
- `CANVAS_BASE_URL=http://127.0.0.1:18991 node tests/canvas-text-overlap.cjs --sweep computing/systems/how-a-nic-moves-packets/` (rerun after all canvas- and diagram-affecting edits; two later DOM-only label edits, ch4.dll.n and ch10.model.title, are covered by the final browser run; scroll-aware mode in all 6 runs) → PASS: 1530 canvas states across 1 pages × 1280/390/320 × zh/en have no colliding or clipped text
- Server on 18991 stopped; leetcode / photosynthesis evidence not modified.

## Alias list for the registrar (unchanged; checked against all 55 REGISTRY.json files incl. tech/networks drafts, atlas aliases and lessons)
#ch1 网卡是怎么工作的, 网卡里有什么, 网络接口卡, 网卡怎么搬运数据包 / how does a network card work, network interface card, what is inside a NIC, how a NIC moves packets ·
#ch2 以太网帧, 以太网帧格式, 帧校验序列, 巨型帧, 线速包率 / Ethernet frame, Ethernet frame format, frame check sequence, jumbo frame, packets per second at line rate ·
#ch3 网卡怎么收包, 接收描述符写回, 描述符预取 / how a NIC receives a packet, descriptor prefetch, descriptor write-back ·
#ch4 400G 网卡 PCIe 够不够, 每个包的 PCIe 开销 / PCIe bandwidth for a 400G NIC, PCIe overhead per packet ·
#ch5 RSS, 接收端缩放, 托普利茨哈希, Toeplitz 哈希, RSS 间接表 / receive side scaling, Toeplitz hash, RSS indirection table ·
#ch6 aRFS, 加速 RFS, 接收流导向, 网卡中断亲和性 / accelerated RFS, receive flow steering, NIC interrupt affinity ·
#ch7 TSO 分段卸载, GRO, LRO, 校验和卸载, 网卡卸载 / TCP segmentation offload, generic receive offload, large receive offload, checksum offload, NIC offloads ·
#ch8 DDIO, 直接缓存访问, leaky DMA / Data Direct I/O, direct cache access ·
#ch9 BQL, 字节队列限制, 网卡发送环, 网卡怎么发包 / byte queue limits, NIC transmit ring, how a NIC sends a packet ·
#ch10 XDP, AF_XDP, eBPF 网络 / eXpress Data Path ·
#ch11 队列对, 单边写, RDMA verbs, SmartNIC, DPU / queue pair, one-sided write ·
#ch12 包喷洒, ECMP, 等价多路径, PTP 硬件时间戳 / packet spraying, equal-cost multipath, PTP hardware timestamping ·
#ch13 UEC 1.1, 800G 网卡, 1.6T 网卡 / 800G NIC, 1.6T NIC ·
#ch14 怎么看网卡规格, 网卡选型 / how to read a NIC spec sheet, choosing a network card.
Left to owners: NAPI, descriptor ring, DPDK, SR-IOV, kernel bypass, zero copy, interrupt coalescing (OS essay);
RDMA, RoCE (v2), PFC, DCQCN, lossless Ethernet (storage-over-a-network); MSI / MSI-X, TLP, PCIe overhead (how-pcie-works);
all-reduce, scale-up / scale-out, Ultra Ethernet, CPO (coherent-interconnects and siblings); NUMA (wired); MTU, packet,
packet loss (web-page draft). "RDMA verbs" is a distinct phrase and collides with nothing.

## Not verified
- 802.3df approval date (the page gives none); 802.3dj final approval (not found; Ethernet Alliance expects end 2026);
  "200 Gb/s per lane" (secondhand, attributed).
- Gen6 FLIT header sizes 16 / 16 / 12 B (approximation, labelled); DDIO replacement policy (Intel unpublished; LRU labelled).
- ConnectX-7 message rate 330–370 M/s, ConnectX-9 firmware date, NVIDIA CPO blog, LWN 2011 article: not reopened.
- Microsoft's 16 Toeplitz values: verified by the page's own test against the vectors as typed, not re-typed by me.

## Verdict
Publishable after these fixes. No model was wrong; the errors were one misquoted ballot figure, two attributions
stretched beyond the source, one internal code leaked to readers, and two live sentences false in their own default
or edge states. English reads as an essay; spelling now matches the site.
