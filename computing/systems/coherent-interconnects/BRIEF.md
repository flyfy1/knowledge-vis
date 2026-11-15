# BRIEF — 芯片之间怎么共用内存 (How Chips Share Memory)

Built-By: Claude Code (claude-opus-5-5)
Verified-By: self-check by builder (node model test, browser test zh at 1280/390/320 and reduced motion, canvas sweep, screenshots of every model and diagram at three widths); independent review pending
Category: computing 计算机 / subtopic systems 系统 · Stage: university
Series: bus series B4 (`specs/essay-briefs/TASK-bus-series.md`), slug kept as `coherent-interconnects`
Format: long interactive essay. Chinese written in full; `copy.en.js` is a same-keys stub (`enStub = true`), the page falls back to Chinese.
Files: index.html, copy.zh.js, copy.en.js, models.js, app.js, REGISTRY.json, tests/models.cjs, tests/browser.cjs

## The one question

一台服务器里的 CPU、GPU、加速卡、内存扩展卡各有自己的内存，为什么都想「共用一块内存」？靠一根 PCIe 线怎么做到缓存一致？训练大模型的几十上百块 GPU 怎么连成「一台机器」？

## Changes from the starting list (TASK file)

- ch2 (coherence recap) has no model: one paragraph plus the home-agent diagram, linking A5 #ch1/#ch3/#ch4/#ch7 and
  A2 #ch9 for MESI, snooping and directories. No coherence word is re-defined here.
- NVLink (ch8, table, no model) is split from all-reduce (ch9, two models: a stepper on real numbers and a time
  model). UALink is folded into ch10 with scale-up/scale-out; there is no separate UALink chapter.
- Link encryption (IDE) is one sentence in ch6, not a section; its details were only found in vendor blogs.
- ch1's model has no NVLink-C2C option: no public round-trip latency was found (ch11.limit says so).
- 13 chapters: 1 copy/share, 2 recap, 3 CXL protocols + flit, 4 device types, 5 expansion + tiering, 6 pooling +
  switches, 7 back-invalidate, 8 NVLink/NVSwitch, 9 all-reduce, 10 scale-up/out + UALink, 11 in-package coherence
  (MI300A, Grace Hopper), 12 frontier, 13 three questions.

## Models, published results, tuned parameters

Convention: every GB/s in models.js and on the page is per direction; NVIDIA's 900/1,800/3,600 GB/s and
NVLink-C2C's 900 GB/s are the sum of both directions, kept as published in `*Bidir` fields and halved where used.

1. Copy or share (ch1). copy = t0 + S/B_dma (PCIe 5.0 ×16, 63 GB/s); share = L + ⌈fS/64⌉·64 / min(B_CXL.cache, M·64/L)
   (Little's law). L = 170 ns is the CXL survey's Table 2 estimate, not tuned. Closed-form crossover; it is null
   when f < Bshare/Bdma (38 % at M = 64). 1 MiB at 5 %: copy 26.6 µs, share 2.3 µs; at 100 % share 43.7 µs.
   Crossover at 100 %: 374 KiB (5.2 MiB with 256 in flight).
   **TUNED t0 = 10 µs**: halved → crossover 184 KiB, doubled → 755 KiB; at 5 % sharing still always wins.
   L halved (85 ns) → crossover 1,983 KiB; doubled (340 ns) → 141 KiB; at 1 MiB/5 % share still wins (4.7 µs).
2. Flit accounting (ch3), Das Sharma et al. §6.3: CXL.mem read 0.939·8/9·raw (53.4 GB/s at ×16; Table 4: 53.5),
   CXL.cache read 16/17·0.94·raw (56.6), write 4/6·0.94·raw (40.1); 256 B flit: cache read 14/16, write
   4/6.5·15/16 (112 and 73.8 GB/s). CXL.mem read on the 256 B flit is **derived** (15/16·8/9), not in the survey;
   the page and the live sentence say so.
3. Protocol stepper (ch4): two lines, three caches, message names from the survey (D2H/H2D, M2S/S2M, BISnp/BIRsp,
   TLPs). Simplified: one CPU cache, no races. The test checks hand-written sequences and the single-writer
   invariant over every two-step sequence.
4. Tiering (ch5): 4,096 pages, Zipf popularity, coldest share p on the device; idle latency = mix of Liu et al.'s
   measured local (111 ns) and device latency; bandwidth = min(B_loc/(1−q), B_cxl/q). Defaults (card D, 50 %):
   11 % of accesses, 126 ns, +13 %; random placement 50 % / 175 ns. **TUNED s = 0.9**: halved → only 8 % of pages
   fit within +5 % (23 % at 0.9, 62 % at 1.2). **TUNED pages = 4096**: halved/doubled → 126.3/124.9 ns at 50 %.
   "Pooled via switch" uses the survey's 250 ns estimate with card D's bandwidth (labelled 估计).
5. Pooling (ch6): lognormal demand, mean 1, shared factor √ρ; each host alone sized at its p99, pooled hosts keep
   the mean and the pool covers the p99 of summed overflow; 20,000 seeded trials. 16 hosts save 17 %; 64 hosts
   17 %. **TUNED cv = 0.35**: halved → 10 %, doubled → 26 %. **TUNED ρ = 0.5** (slider): 0 → 38 %, 0.25 → 27 %,
   0.75 → 9 %, 1 → 0 %. Pond's real figure (10 % demand cut for 16–32 sockets) is quoted next to it with the reasons
   the model is higher.
6. Directory + back-invalidate (ch7): 1,024 shared lines, LRU directory, 20,000 seeded accesses; counts BISnp per
   1,000 accesses. 16 hosts, 5 % writes: 305 (fan-out 5.4); 4 hosts 156; read-only 0; half-size directory 896
   (all capacity evictions). Not a tuned result: it shows the scaling, not a measured rate.
7. Ring all-reduce (ch9): Patarasuk & Yuan's algorithm run on integers (3–5 GPUs); time
   2(N−1)/N·S/B + 2(N−1)α, BF16. 8 B params, 72 GPUs: NVLink 5 35 ms, NVLink 6 18 ms, PCIe 5.0 ×16 501 ms,
   400 Gb/s 632 ms. **TUNED α = 2/3/5 µs (NVLink/PCIe/net)**: halved/doubled moves 70 B over the network by
   < 0.1 % and 8 B over NVLink 5 by ~1 %. Every page choice is bandwidth-bound; the prose gives the closed-form
   break-even size N·α·B (130 MB for 72 GPUs on NVLink 5).
8. Hierarchical (ch10): reduce-scatter in the NVLink 5 domain, all-reduce of 1/G shards across R = N/G domains,
   all-gather. 9,216 GPUs, 70 B, 400 Gb/s: 72-GPU domains 0.39 s, 8-GPU 0.98 s, flat ring 5.7 s (15×). α halved/
   doubled keeps the ordering (tested).

## Diagrams (STANDARD §4a: inline SVG from app.js, labels from copy, portrait layout below 600 px)

1 copy vs share (ch1) · 2 home agent across the link (ch2) · 3 CXL stack and the 68 B flit (ch3) · 4 the three device
types (ch4) · 5 expander and hot/cold tiering (ch5) · 6 switch and pool (ch6) · 7 back-invalidate sequence (ch7,
after the survey's Fig. 17b) · 8 NVL72-style scale-up domain vs scale-out network (ch8) · 9 ring all-reduce steps
(ch9, drawn from `ringSteps(4)`) · 10 Grace Hopper vs MI300A (ch11). Numbers in labels come from models.js.

## Sources (each opened by me on 2026-11-15)

- D. Das Sharma, R. Blankenship, D. S. Berger, "An Introduction to the Compute Express Link (CXL) Interconnect",
  arXiv 2306.11227 (2023; ACM Computing Surveys 2024): https://arxiv.org/pdf/2306.11227 — flits §3.2, latencies
  §6.1 and Table 2, bandwidth §6.3/Table 4, back-invalidate §5, device types, MLD, PBR, GFAM.
- J. Liu et al., "Dissecting CXL Memory Performance at Scale", arXiv 2409.14317v1 (2024-09-22):
  https://arxiv.org/html/2409.14317v1 — Table 1 latencies and bandwidths of CXL-A..D and local DRAM.
- H. Li et al., "Pond: CXL-Based Memory Pooling Systems for Cloud Platforms", ASPLOS 2023:
  https://arxiv.org/pdf/2203.00241
- Y. Sun et al., "Demystifying CXL Memory with Genuine CXL-Ready Systems and Devices", MICRO 2023:
  https://arxiv.org/pdf/2303.15375
- CXL Consortium, CXL 3.0 white paper and webinar: https://computeexpresslink.org/wp-content/uploads/2023/12/CXL_3.0_white-paper_FINAL.pdf ,
  https://computeexpresslink.org/wp-content/uploads/2023/12/CXL_3.0-Webinar_FINAL.pdf ; CXL 4.0 white paper (2025-11):
  https://computeexpresslink.org/wp-content/uploads/2025/11/CXL_4.0-White-Paper_FINAL.pdf
- Intel, "Advantages of managing the CXL memory tier in hardware" (flat memory mode):
  https://cdrdv2-public.intel.com/886601/advantages-managing-cxl-memory-tier-in-hardware-technical-paper.pdf
- NVIDIA NVLink and NVLink Switch page: https://www.nvidia.com/en-us/data-center/nvlink/ (per-GPU bandwidth, links,
  aggregate, SHARP in every switch; Rubin marked preliminary).
- NVIDIA Vera Rubin NVL72 page: https://www.nvidia.com/en-us/data-center/vera-rubin-nvl72/ ("ramping into full production").
- NVIDIA, "Grace Hopper Superchip Architecture In-Depth" (2022-11-10):
  https://developer.nvidia.com/blog/nvidia-grace-hopper-superchip-architecture-in-depth/
- NVIDIA, ConnectX-8 SuperNIC blog (2025-05-18): https://developer.nvidia.com/blog/nvidia-connectx-8-supernics-advance-ai-platform-architecture-with-pcie-gen6-connectivity
- NVIDIA newsroom, Spectrum-X / Quantum-X Photonics (2025-03-18): https://nvidianews.nvidia.com/news/nvidia-spectrum-x-co-packaged-optics-networking-switches-ai-factories
- UALink Consortium 1.0 press release (2025-04-08): https://ualinkconsortium.org/wp-content/uploads/2025/04/UALink-1.0-Specification-PR_FINAL.pdf ;
  white paper and specification page: https://ualinkconsortium.org/specification/
- AMD Instinct MI300A data sheet: https://www.amd.com/content/dam/amd/en/documents/instinct-tech-docs/data-sheets/amd-instinct-mi300a-data-sheet.pdf
- P. Patarasuk, X. Yuan, "Bandwidth optimal all-reduce algorithms for clusters of workstations", JPDC 69 (2009):
  https://www.cs.fsu.edu/~xyuan/paper/09jpdc.pdf

## Not verified from a primary source

- UALink 2.0 release date 2026-04-07 (Converge Digest: https://convergedigest.com/ualink-2-0-adds-in-network-compute-chiplet-support-and-200g-performance/)
  and the chair's "products expected in 2027" (a video description); Astera Labs' 2027 UALink switch plan
  (Q1 2026 earnings call transcript, https://www.fool.com/earnings/call-transcripts/2026/05/05/astera-labs-alab-q1-2026-earnings-transcript/).
- Whether Quantum-X / Spectrum-X Photonics shipped on schedule (the prose says it is not checked).
- Vera Rubin NVL72 figures are marked preliminary by NVIDIA; Taiwanese ODM shipments from press reports.
- NVL72 tray layout (18 compute trays of 4 GPUs, 9 switch trays): from secondary sources; diagram 8 draws "a few trays"
  and the caption says so.
- IDE (AES-GCM link encryption, CXL 2.0): Synopsys blogs only; the page keeps it to one sentence.
- AMD EPYC 9005 CXL 2.0 support: press (ServeTheHome) only; not stated on the page.
- CXL 1.0/1.1 dates (2019-03 / 2019-09): from the Das Sharma survey, not the consortium's own records.
- ConnectX-7 at 400 Gb/s per GPU (used for the network bars): general product knowledge plus DGX H100 notes in
  search results; the 800 Gb/s ConnectX-8 figure is from the NVIDIA blog above.

## Facts that will go stale

CXL 4.0 products (none found), UALink products (2027 claims), Vera Rubin NVL72 status and "preliminary" figures,
co-packaged optics shipping, NIC speeds. FRONTIER.asOf = 2026-11.

## Checked / not checked

Checked: every prose number is a prose() value pinned in tests/models.cjs (placeholder use checked both ways);
literal numbers in the prose checked against models.js with `says`; vendor/paper figures re-typed in the test;
flit formulas against §6.3; copy/share closed form and crossover; protocol sequences by hand and the single-writer
invariant; tiering, pooling and directory limiting cases and monotonicity; ring all-reduce ends with the totals at
every N, first step by hand, the per-GPU bytes meet the Patarasuk–Yuan bound; hierarchical R = 1 equals the flat
ring; halving/doubling each tuned parameter; every live-sentence branch reached; aliases against 11 siblings;
sibling anchors and quoted titles (5,380 checks). Browser test zh at 1280/390/320 and reduced motion (PASS); canvas
sweep 656 states at 1280/390/320 (PASS). Screenshots viewed: all ten diagrams at 1280 and 320 (one at 390), all
nine models at 1280 and at 320. The reduced-motion page was checked by the browser test (canvas still, diagrams
clean); its full-page screenshot was too tall to inspect by eye.
Not checked: English (stub); real CXL.cache latencies on shipping Type 2 devices (none public); NVLink-C2C latency.

## For the translator

Keep placeholders; 「调出来的参数」 = "tuned parameter". Diagram labels sit in tight boxes in the 340-unit narrow
layout; keep `dg.*` labels short. Bandwidth is "per direction" everywhere unless the text says 合计 / both directions.
`ch9.p.*` are model-size choices ("1 B / 8 B / 70 B / 405 B parameters").

## Registrar notes

- Slug `coherent-interconnects`; title zh 「芯片之间怎么共用内存」, en "How Chips Share Memory"; 13 concepts #ch1–#ch13.
- Linked, not claimed: cache coherence / MESI / snoop filter / directory (A5), NUMA / chiplets / Infinity Fabric (B2),
  NVLink 带宽 / NVLink vs PCIe (memory essay #ch9), CXL 内存池 / CXL memory pooling / co-packaged optics (memory
  essay #ch10), RDMA / Ultra Ethernet (S5). This page's ch6 uses 内存池 in prose; the alias 「CXL 内存池」 stays with
  the memory essay #ch10 (the registrar may want to move it to #ch6 here).
- B3 is quoted in plain text as 《内存条是怎么和 CPU 说话的》 as the task file names it; B3's current hero.title is
  「内存是怎么和 CPU 说话的」. Align the quote (copy.zh.js ch3.p4) when B3 goes live and link it.
- Pages that name CXL in plain text and could link here once live: A5 ch11.p2 and ch12.links, B2 ch9.d2, B1 ch11.e3.
- No provenance label, pages.config or atlas edits made.
