# Task: bus series (PCIe 与系统总线)

Requested by Yangyu on 2026-11-15: "我也希望能看到关于 PCIe 以及其他系统总线的解释介绍文章。你可以先用一种语言生成，
英文或者中文都行，然后再用简单的模型翻译到另外的语言去". Follows the storage series
(specs/essay-briefs/TASK-storage-series.md, S1–S5 live).

All essays go in `computing/systems/`. Stage: university. Pipeline as for the storage series: Opus builds
`copy.zh.js` (en is a same-keys stub with `enStub = true`), Haiku translates, a separate Opus session
reviews both languages in full, a designated registrar commits, registers and deploys.
Order: B1 and B2 first; B3–B5 queued.

## Briefs to follow (all essays)

- `specs/essay-briefs/BRIEF-BATCH3.md`, `STANDARD.md`, `BRIEF-COMMON.md`, `BRIEF-DEEP.md` (read them under
  `specs/essay-briefs/` even though they mention `/tmp`), and `specs/essays.md` (incl. the step-7 `?v=`
  cache-key convention).
- Structural model: `computing/systems/how-usb-drives-talk/` (reviewed, live), every file: copy keys,
  `ESSAY_BASE_URL`, `enStub`, how tests exempt the provenance label, label-clicking and wait-for-condition
  in `tests/browser.cjs` (forced clicks on 1-px radios are flaky under smooth scrolling).
- Work only in your directory. No commits, no `git add/stash/reset/clean`, no `rm` or any delete command.
  Scratch in `/tmp/agent-tasks/buses/<slug>/`. Stop your server; browser tests serially. Playwright:
  `NODE_PATH=~/fast/integ-life/integ-games/node_modules`. Report goes in your reply (not `REPORT.md`).

- **Diagrams are required** (Yangyu, 2026-11-15): follow STANDARD.md §4a — a static SVG diagram for every
  chapter that introduces a structure, at least six per essay. Natural ones here: the PCIe tree (root complex,
  switch, endpoints), a lane as differential pairs, the TLP/DLLP/PHY layer stack and a TLP's byte layout, the
  credit loop, the ACK/NAK replay sequence, configuration space and BARs, NRZ vs PAM4 eyes, the FLIT layout;
  for B2 a shared bus vs point-to-point, northbridge/southbridge vs today's board, a two-socket NUMA system,
  ring vs mesh, chiplets on a package, an I²C bus with pull-ups.

## Relation to existing pages (one word, one owner)

- `why-nvme-is-fast` #ch2 (PCIe ×4 rates for SSDs, Little's law), #ch4 (SQ/CQ rings, doorbells, DMA, MSI-X
  for NVMe), #ch8 (PCIe 6.0 for storage, GPUDirect). Link, don't redo. It keeps storage-specific words
  (PCIe 4.0 5.0 6.0 SSD 速度, PCIe vs SATA bandwidth). B1 takes the generic ones (PCIe 是什么, PCIe 通道,
  x16 x4 区别, what is PCIe, PCIe lanes).
- `why-compute-waits-for-memory` owns the memory hierarchy, memory wall, roofline, HBM packaging (#ch9,
  #ch10) and multicore bus contention (#ch5). B3 links to these and spends its space on the DDR interface.
- Storage series: `how-sata-works` (8b/10b, serial vs parallel skew for PATA #ch2), `how-usb-drives-talk`
  (USB4/Thunderbolt PCIe tunnelling #ch8), `what-a-drive-is-made-of` #ch7 (connector/layer map). Link.
- Check every sibling's REGISTRY.json before choosing aliases.

## Things to get right (all essays)

- Every figure from a source you opened: PCI-SIG specs and press releases, JEDEC standards, Intel/AMD/Arm
  documentation, NXP I²C spec UM10204, vendor datasheets, textbooks. Say which generation each number
  belongs to. Tuned parameters labelled beside the model, with the effect of halving/doubling stated.
- Models are the real thing at small scale (actual encoding, actual flow-control rule, actual timing
  equation), not analogies with sliders.
- Frontier chapter: dated facts, sources in BRIEF.md, established / demonstrated / claimed kept apart. No
  buying advice, no brand recommendations.
- Aliases are what a confused person types: 显卡插 x8 会慢吗, PCIe 通道不够怎么办, 主板上的 PCIe 是从哪来的,
  内存频率是什么, CL 值, 什么是 CXL, NVLink 是什么, I2C 是什么, and so on.

## B1 · `computing/systems/how-pcie-works/` (port 18931)

PCIe 为什么能一代一代翻倍 — one question: 显卡、固态、网卡都插在 PCIe 上。这条总线 20 多年来速度翻了七次，靠的是什么？
一次读写在这根线上到底发生了什么？

Starting chapter list (reorder, merge, drop; report what changed):
1. 在地图上的位置: root complex, switches, endpoints; lanes and links (×1/×4/×8/×16); a tree, not a shared bus.
2. 一条通道里：差分对、SerDes、嵌入时钟; the 8b/10b → 128b/130b step (link S2 for 8b/10b itself) and why
   Gen3 doubled with only 8 → 8 GT/s.
3. 三层：transaction (TLP: memory read/write, completions, posted vs non-posted), data link (sequence number,
   LCRC, ACK/NAK, replay buffer), physical. Model: one memory read as TLP + completion bytes, header
   overhead vs payload size (MPS/MRRS) → efficiency curve.
4. 信用流控: credit-based flow control per VC (header/data credits, posted/non-posted/completion); model
   the link stalling when the receiver's buffer is too small for the round-trip.
5. 出错了怎么办：LCRC, replay, the replay timer; model throughput under a bit-error rate with replay.
6. 开机时发生了什么：enumeration, configuration space, BDF, BARs and MMIO address assignment; a tiny
   enumerator the reader runs over a tree.
7. 设备怎么主动干活：bus-mastering DMA, MSI/MSI-X, IOMMU (link NVMe #ch4 for the storage use).
8. 信号的极限：channel insertion loss (dB at Nyquist), why each generation doubles the Nyquist frequency,
   equalisation (CTLE/DFE) and retimers; model loss vs trace length and frequency against the budget per
   generation (e.g. ~36 dB Gen5).
9. PAM4 与 FLIT：Gen6 at 64 GT/s with PAM4, FEC and fixed-size FLITs, why FLIT mode changes the overhead and
   latency; Gen7 128 GT/s; model PAM4 eye height vs NRZ (≈ −9.5 dB SNR) and the FEC trade.
10. 前沿在哪 (as of Nov 2026): PCIe 7.0 release status, 8.0 work, optical PCIe, CXL riding on PCIe PHY.
11. Short closing.

## B2 · `computing/systems/how-a-computer-is-wired/` (port 18932)

电脑里的零件是怎么连起来的 — one question: CPU、内存、显卡、硬盘、USB 口，各自走的是哪条路？为什么早年的电脑是一根大家
共用的总线，今天却变成一张点对点的网？

Starting chapter list:
1. 共享总线：ISA and PCI — one set of wires, arbitration, address/data multiplexing; bandwidth shared by
   everyone (PCI 32-bit 33 MHz = 133 MB/s). Model: N devices on a shared bus vs point-to-point links.
2. 为什么并行总线到头了：reflected-wave switching in PCI, clock skew (link S2 #ch2 instead of redoing the
   skew budget; here: loading and reflections — model a transmission line with stubs, or bus loading vs
   max clock).
3. 北桥与南桥：front-side bus, AGP, the chipset era; memory behind the northbridge.
4. 拆掉北桥：integrated memory controller, point-to-point CPU links (HyperTransport, QPI/UPI, Infinity
   Fabric); NUMA — model remote vs local memory latency and bandwidth for a two-socket system.
5. 今天的主板：CPU lanes vs chipset lanes, DMI/chipset link as a shared uplink; model what happens when
   several devices behind the chipset are busy (oversubscription of a ×4/×8 uplink).
6. 片上网络：ring and mesh interconnects inside a CPU, hop counts and latency (model a ring vs 2D mesh).
7. 芯粒：chiplets and die-to-die links (Infinity Fabric on package, UCIe), energy per bit vs off-package.
8. 小总线：I²C, SPI, UART, SMBus/eSPI for sensors, firmware flash and management — keep to one chapter with
   one model (I²C open-drain rise time vs pull-up and bus capacitance, from UM10204), and say B5 may go deeper.
9. 前沿在哪 (as of Nov 2026).
10. Short closing.

## Queued (spec only; not yet dispatched)

- **B3 · `how-memory-talks`** — the DDR interface: commands (ACT/RD/WR/PRE), timings CL/tRCD/tRP in cycles vs ns
  (why "faster" DDR has higher CL), burst length and prefetch, banks/bank groups, DDR5 two subchannels and on-die
  ECC, DIMM ranks and channels, signal integrity → CAMM2 and MRDIMM, LPDDR5X, GDDR7 PAM3. HBM only by link.
- **B4 · `coherent-interconnects`** — cache coherence over a wire (MESI, snoop vs directory), CXL.io/.cache/.mem,
  memory expansion and pooling latency, NVLink/NVSwitch and UALink for GPUs, scale-up vs scale-out.
- **B5 · `small-buses`** (optional) — I²C, SPI, UART, CAN in depth: addressing, arbitration, clock stretching,
  baud tolerance, CAN bit stuffing and arbitration.

## Report (reply, under 450 words)

Chapter ladder one line each, what changed from the list above, figures of merit, tuned parameters, frontier
facts with dates/sources, tests run and their output summary, missing prerequisites, anything not verified from
a primary source, and notes for the registrar (titles, aliases handed to siblings).
