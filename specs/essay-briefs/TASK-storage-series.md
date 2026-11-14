# Task: storage series (硬盘与存储协议)

Requested by Yangyu on 2026-11-14: "关于电脑硬盘的基础知识解释得更加详细一些……目前只看到了 NVMe，其他的协议也希望能
看到单独的介绍……可以写单独文章". The existing page is `computing/systems/why-nvme-is-fast/` (NVMe 为什么这么快,
built by Antigravity, self-checked only, not independently reviewed).

All essays go in `computing/systems/` beside the NVMe essay (no new subtopic). Stage: university.
Order: S1 first (it gives the others their vocabulary), S2 alongside; S3–S6 queued.

## Status (2026-11-15)

S1–S5 are live in zh and en, each reviewed by a separate Claude Code session (same model; cross-model review pending).
Essay commit → deployed at:

| | Page | Essay commit | Live at |
|---|---|---|---|
| S1 | `what-a-drive-is-made-of` 硬盘里到底是什么 | `745f535e` | `bb361d4b` |
| S2 | `how-sata-works` SATA 为什么用了二十多年 | `d1df3df8` | `bb361d4b` |
| S3 | `how-sas-works` 服务器硬盘为什么用 SAS | `122add13` | `cfc408ab` |
| S4 | `how-usb-drives-talk` 移动硬盘为什么跑不满 | `16ff7768` | `d3848685` |
| S5 | `storage-over-a-network` 隔着网线的硬盘 | `d7abd777` | `d604470d` |

All five link one another where the text mentions the other route (the S1–S5 labels point at `e2630ba1`, the last
cross-link commit). S6 `how-phone-storage-works` (optional) is not started; S1–S5 mention no S6 page, so nothing is
waiting to be linked. The "Queued" list below is the original spec, kept for reference.

## Briefs to follow (all essays)

- `specs/essay-briefs/BRIEF-BATCH3.md`, and through it `STANDARD.md` and `BRIEF-COMMON.md`, plus
  `BRIEF-DEEP.md` (ladder, real models at small scale with a named source, frontier chapter). These files
  still say `/tmp/agent-tasks/essays/…`; read them under `specs/essay-briefs/`.
- Structural model: `food/flavor/how-soy-sauce-gets-its-flavor/`, every file (copy keys, `ESSAY_BASE_URL`,
  language-aware formatting, how both tests exempt the bilingual `page-provenance` label that the registrar
  adds to the hero afterwards). Use it rather than the NVMe essay, which predates some conventions.
- Work only in your directory. No commits, no `rm`/cleanup commands. Scratch, screenshots and logs in
  `/tmp/agent-tasks/storage/<slug>/`. Stop your local server when done. Browser tests serially.
  You cannot write a file named `REPORT.md`; put the report in your reply.
- Write `copy.zh.js` only; leave `copy.en.js` as a stub with the same keys copied from zh (a Haiku agent
  translates later). Tests must still pass in zh.

## Relation to the NVMe essay (one word, one owner)

The NVMe essay already teaches, with models: latency breakdown media vs protocol (#ch1), SATA III 8b/10b
≈552 MB/s vs PCIe x4 rates and Little's law (#ch2), AHCI 1×32 vs NVMe 64K queues and lock contention (#ch3),
SQ/CQ rings and doorbells (#ch4), NAND die parallelism (#ch5), write amplification and TRIM (#ch6), polling
vs interrupts (#ch7). Link to those chapters in one line instead of re-deriving them. If a chapter here would
be the same model with different numbers, cut it to a paragraph and a link.

Search words it owns and you must not take: NVMe 为什么快, NVMe 和 SATA 区别, NVMe vs SATA, AHCI 协议瓶颈,
AHCI overhead, NVMe vs AHCI, SATA III 速度上限, 队列深度 QD 是什么, queue depth, NVMe 64K 队列, AHCI 32 queue depth
limit, write amplification / 写放大, TRIM. Check its REGISTRY.json for the full list.
Exception, decided by the team lead: **固态硬盘为什么比机械硬盘快 / SSD vs HDD** moves to S1 (it answers it
from physics); the registrar repoints the NVMe page when S1 is registered.

## Things to get right (all essays)

- Every figure (rates, latencies, encodings, limits, dates of spec releases) needs a source you opened:
  the standard's own text or the standards body (T10/T13/SATA-IO/SNIA/USB-IF/NVM Express/JEDEC/INCITS),
  vendor datasheets, or a textbook. Say which generation each number belongs to. Mark tuned parameters as
  tuned beside the model and state how far the conclusion moves if halved or doubled.
- Distinguish **physical layer / link / transport / command set / form factor** every time; this confusion
  ("M.2 就是 NVMe", "SAS 就是 SATA") is the main thing readers get wrong. S1 builds the map; the others
  place themselves on it in their first chapter.
- Frontier chapter: dated facts, sources in BRIEF.md, separate established / demonstrated / claimed. No
  buying advice ("买哪个好") and no brand recommendations; mechanisms and specs only.
- Aliases are what a confused person types: 机械硬盘和固态硬盘区别, M.2 接口是不是都是 NVMe, 硬盘为什么会坏,
  QLC 寿命, 移动硬盘为什么这么慢, SAS 和 SATA 能混用吗, 什么是 UASP, NAS 用什么协议, and so on.

## S1 · `computing/systems/what-a-drive-is-made-of/` (port 18901)

硬盘里到底是什么 — the foundation. One question: 一块机械硬盘和一块固态硬盘，都叫「硬盘」，里面装的东西完全不同，
为什么电脑可以用同一套方式去读它们？它们各自的快、慢、坏，分别是从哪来的？

Starting chapter list (reorder, merge, drop; report what changed):
1. 块与地址：the block device abstraction, sectors (512 / 4Kn / 512e), LBA. Why the OS sees a numbered array.
2. 盘片与磁头：rotation latency (5400/7200/15000 rpm), seek time curve (√ for short, linear for long seeks),
   transfer rate falling from outer to inner tracks (zoned bit recording). Model: random-read latency and
   IOPS from rpm and seek curve; sequential MB/s across the platter.
3. 面密度：bits per track × tracks per inch; why heads fly nanometres up; PMR → SMR (shingled; why rewrites
   cost) → HAMR / MAMR. Model: SMR band rewrite cost.
4. 闪存单元：a floating-gate / charge-trap cell, threshold voltage; SLC/MLC/TLC/QLC/PLC as 2ⁿ levels in one
   window; read margin shrinking. Model: Gaussian Vth distributions, overlap → raw bit error rate vs bits per
   cell and wear.
5. 为什么闪存会坏：P/E cycles, oxide wear, retention vs temperature (Arrhenius), ECC (BCH/LDPC) as the thing
   that keeps it usable; TBW and DWPD as derived quantities. Model: endurance from P/E × capacity ÷ WAF
   (link NVMe #ch6 for WAF itself).
6. 闪存为什么不能原地改写：page write / block erase asymmetry, the FTL as a map from LBA to physical page,
   garbage collection (link NVMe #ch6 for the steady-state formula; here show the mapping itself). Model: a
   tiny FTL the reader writes into.
7. 三层地图：interface/physical connector vs link vs protocol vs form factor. SATA, SAS, PCIe/NVMe, USB on one
   map; M.2 (B/M keys, SATA or NVMe), U.2/U.3, 2.5"/3.5", EDSFF. Model: an interactive map / chooser that
   says what can talk to what. This chapter links forward to S2–S6 (as plain text until they exist).
8. 快慢从哪来：end-to-end — HDD 7200 rpm vs SATA SSD vs NVMe SSD for random 4K and sequential, which term
   dominates in each. Short; links NVMe #ch1 for the protocol half.
9. 前沿在哪：HDD capacity records (HAMR shipping status), NAND layer counts, QLC/PLC, as of Nov 2026.

## S2 · `computing/systems/how-sata-works/` (port 18902)

SATA 为什么用了二十多年 — one question: 一根七针的数据线、一套 2004 年定下的规矩，为什么到 2026 年还装在几乎每台电脑里？
它到底是怎么把一个读请求送到盘上的？

Starting chapter list:
1. 在地图上的位置 (link S1 #ch7): SATA physical/link/transport layers, ATA command set, AHCI as the host
   controller interface. SATA ≠ AHCI ≠ ATA.
2. 从并行到串行：PATA/IDE ribbon cables, 40→80 wires, clock skew and crosstalk limit parallel buses; why one
   fast differential pair beats 16 slow wires. Model: skew budget vs bus width and clock.
3. 线上的比特：LVDS differential signalling, 8b/10b, running disparity, DC balance, clock recovery, K28.5
   comma. Model: an 8b/10b encoder the reader types bytes into (real code tables). Only cite the 552 MB/s
   result from NVMe #ch2, don't redo it.
4. 帧与 FIS：primitives (X_RDY, R_RDY, SOF, EOF, HOLD), Frame Information Structures (Register H2D/D2H,
   DMA Setup, Data), CRC-32. Model: a step-through of one READ FPDMA QUEUED exchange.
5. NCQ：why reordering helps a spinning disk (the elevator / shortest-access-time-first), depth 32. Model:
   random requests on a rotating platter, FIFO vs NCQ order, IOPS vs depth (uses S1's HDD model). Do not
   redo the multicore queue story (NVMe #ch3).
6. 热插拔、电源与 link power management: Partial/Slumber/DevSleep, wake latency vs idle power. Model:
   energy vs wake latency trade-off for an idle pattern.
7. 端口倍增与 eSATA, mSATA, M.2 SATA: what changes and what does not.
8. 为什么 SATA 停在 6 Gb/s：SATA-IO's decision not to do 12 Gb/s, SATA Express, and why HDDs never needed more
   (S1 sequential model). Short.
9. 前沿在哪：SATA in 2026 (spec revision status, HDD and boot-drive use), as of Nov 2026.

## Queued (spec only; not yet dispatched)

- **S3 · `how-sas-works`** — SCSI command set (CDB), SAS physical/link/port/transport layers, dual port and
  multipath, expanders and zoning, wide ports, SATA drives on SAS (STP) but not the reverse, T10 PI
  (end-to-end data integrity), SAS-4 24G and the 24G+ roadmap.
- **S4 · `how-usb-drives-talk`** — USB Mass Storage Bulk-Only Transport vs UASP (command queuing over
  streams), bridge chips (SATA/NVMe ↔ USB), SCSI over USB, USB 3.x gen naming, Thunderbolt/USB4 PCIe
  tunnelling, why 移动硬盘 benchmarks differ from the label.
- **S5 · `storage-over-a-network`** — block vs file vs object; iSCSI, Fibre Channel, NVMe-oF (RDMA/TCP/FC);
  added latency per hop; SMB/NFS for NAS at the file level.
- **S6 · `how-phone-storage-works`** (optional) — eMMC vs UFS, links `tech/devices/inside-a-phone/`.

## Report (reply, under 450 words)

As BRIEF-BATCH3 and BRIEF-DEEP ask: chapter ladder one line each, what changed from the list above, the
figures of merit, tuned parameters, frontier facts with dates/sources, tests run and their output summary,
missing prerequisites, anything not verified from a primary source.
