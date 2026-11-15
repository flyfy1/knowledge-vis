# BRIEF — 网卡是怎么搬运数据包的 (How a Network Card Moves Packets)

Built-By: Claude Code (claude-opus-5-5)
Verified-By: self-check by builder (node model test, browser test zh at 1280/390/320 and reduced motion, canvas sweep, screenshots of every model and diagram at three widths and with reduced motion); Claude Code (claude-opus-5-5), independent review 2026-11-15: zh and en copy read in full, models.js and tests, sources re-opened (Neugebauer SIGCOMM'18 §3 and §6, Høiland-Jørgensen CoNEXT'18 §4, Cai SIGCOMM'21 §3, Farshin ATC'20 §1–2, Linux scaling.rst, Microsoft RSS Configuration, IEEE 802.3dj ballot e-mail, Broadcom Thor Ultra release, LF UEC 1.0 release, Network World UEC 1.1, NVIDIA SuperNIC page), browser test zh+en, canvas sweep, screenshots of all diagrams and models at 1280/390/320 in both languages; see specs/reviews/how-a-nic-moves-packets-review-20261115.md
Category: computing 计算机 / subtopic systems 系统 · Stage: university
Series: computer architecture series (`specs/essay-briefs/TASK-arch-series.md`, queued item "how a NIC moves packets")
Format: long interactive essay. zh written by the builder; `copy.en.js` translated (Haiku), corrected in review; British spelling (fibre, coloured, modelled) as in the other computing/systems essays.
Files: index.html, copy.zh.js, copy.en.js, models.js, app.js, REGISTRY.json, tests/models.cjs, tests/browser.cjs
No page-provenance label and no page-provenance.css link (the registrar adds both).

## The one question

一张 400G 网卡，每秒要收三千多万个包——平均每个包只有三十纳秒左右，比一次内存访问还短。它是怎么在 CPU 几乎不插手的情况下，
把包从光纤里搬进正确的那个程序的内存的？

(Refined from the task: "几十纳秒" became "三十纳秒左右" because 400G at 1518-byte frames is 30.8 ns per packet; the
hero also states the DRAM comparison, 70–131 ns, as on how-cpu-caches-work #ch1.)

## Ladder (final, 14 chapters; changes from the task list)

1. 网卡里有什么 — PHY/SerDes/FEC, MAC, parser and flow table, queues and DMA, PCIe endpoint. Diagram `nic`. No model.
2. 一帧以太网，和每个包的时间 — frame fields, CRC-32 FCS, pps and ns per packet. Diagram `frame`. Model: real frame bytes + FCS, line-rate budget.
3. 收一个包要走的路 — descriptor ring seen from the NIC, write-back, MSI-X / NAPI (links OS #ch6, #ch7). Diagram `rx`. Model: descriptor prefetch as Little's law.
4. PCIe 装得下吗 — Neugebauer's per-packet TLP accounting. Model: PCIe bytes per received packet.
5. 多个队列与 RSS — Toeplitz hash, indirection table. Diagram `rss`. Models: the hash bit by bit (Microsoft vectors), flows onto queues (elephants).
6. 把包送到对的核心 — RPS/RFS/aRFS/XPS, IRQ affinity, NUMA. Prose only (added: the task list folded this into RSS; split so ch5 stays about hashing).
7. 交给网卡做 — checksum offload, TSO/GSO, GRO/LRO. Diagram `tso`. Model: cycles per byte + TSO segment listing.
8. 写进缓存：DDIO 和它的漏 — DDIO ways, leaky DMA. Model: LRU simulation of the I/O ways.
9. 发包的路，和不该排的队 — TX path, BQL, qdisc. Diagram `tx` (added: an eighth diagram). Model: BQL.
10. 在驱动里处理：XDP 与 DPDK — XDP actions, AF_XDP, DPDK. Diagram `xdp`. Model: cores to keep up.
11. 网卡直接写别人的内存：RDMA — verbs, QP/CQ, one-sided write, RoCE v2 port 4791, PFC/ECN/DCQCN briefly (links storage #ch6), SmartNIC/DPU/SR-IOV (merged here). Diagram `qp`. No model.
12. 训练集群里的网卡 — ECMP vs packet spraying (reuses the ch5 hash), PTP timestamping (merged here). Model: ECMP vs spray.
13. 前沿在哪（2026 年 11 月） — established / demonstrated / claimed.
14. 看一张网卡时问的三件事.

## Models, results, tuned parameters

All numbers in the prose come from `prose()` in models.js and are pinned in tests/models.cjs.

| Model | Default | Result |
|---|---|---|
| ch2 frame + budget | 400G, 1518 B | 32.5 Mpps, 30.8 ns, 92 cycles at 3 GHz; 64 B: 595 Mpps, 1.68 ns; FCS of the 64 B sample frame 0x264e623c |
| ch3 prefetch | 400G, 64 B, 8 per read, 32 outstanding, 547 ns | 326 descriptors in flight, 41 reads; 32 reads sustain 468 Mpps = 79 % of line rate |
| ch4 PCIe | Gen5 x16, 64 B, MPS 256, batched | 106 B up per packet, needs 505 Gb/s, link gives 463 (Neugebauer DLL) / 494 (2 %, as in how-pcie-works ch10 after Das Sharma) → 92 % / 98 %; 1518 B fits (437 needed) |
| ch5 hash | 66.9.149.187:2794 → 161.142.100.80:1766 | 0x51ccc178 (Microsoft), index 120 → queue 0, reverse → queue 2 |
| ch5 load | 8 queues, 1000 mice, 4 elephants | 200 seeds: max/mean 1.67, collisions 56 % (birthday 1 − 41 %) |
| ch7 offloads | MTU 1500, GRO, 1 flow | 17.4 Gb/s per core; none 3.3; jumbo+GRO 42.0; LRO 55.0; 16 flows 35.1, 64 flows 16.8 |
| ch8 DDIO | 1024 slots × 8 queues, 2 ways, 1500 B, 600 µs stalls | buffers 12.0 MiB vs 4.5 MiB; reads hit 73 %, 1949 B DRAM per packet; 256 slots: 100 % hits, 18.9 % drops |
| ch9 BQL | 25G, 1024 slots, 64 KB TSO, 50 µs completions | off: 3.9 MB queued, 1.26 ms; on: ~70 µs |
| ch10 XDP | 400G, 64 B | stack 124 cores, XDP 25, DPDK 14 (exceeds the 115 Mpps PCI limit of the paper's machine) |
| ch12 ECMP | 64 flows, 64 paths | 200 seeds: ECMP 26 %, spraying 99 %; 128 flows / 16 paths 61 % |

TUNED (marked on the page):
- a 3 GHz core for cycles per packet (ch2);
- one elephant = 100 mice (ch5);
- the three cost constants of ch7, fitted to Cai et al. (42 Gb/s GRO+9000, copy 49 %, 55 Gb/s LRO): 0.32 cycles/B, 1586/frame, 10 027/skb. Doubling the per-frame constant leaves 88 % of the no-merge rate and 79 % of the jumbo+GRO rate;
- DDIO sim: load 60 %, a stall every 2 ms. At 80 % load the read hit rate falls from 73 % to 29 %; with a 1 ms period, 14 %; with 300 µs stalls, it is 100 % even at 80 %;
- BQL hold of 20 intervals (simplified from dynamic_queue_limits.c);
- seeds: rssLoad 7 (page), 1000+i (averages); ecmp 11 (page), 500+i (averages); DDIO 1234.

## Diagrams (8; layout 'w' at a prose column of 600 px or more, 'n' below)

`nic` (ch1), `frame` (ch2), `rx` (ch3), `rss` (ch5), `tso` (ch7), `tx` (ch9), `xdp` (ch10), `qp` (ch11). All seven named in the task, plus `tx`.

## Sources (opened 2026-11-15 unless noted)

- IEEE 802.3 frame, public summary: https://en.wikipedia.org/wiki/Ethernet_frame (the standard itself is not openly available; CRC check value 0xCBF43926 and residue 0x2144DF1C verified by computation in tests).
- Microsoft, Verifying the RSS Hash Calculation (key, 5 IPv4 + 3 IPv6 vectors): https://learn.microsoft.com/en-us/windows-hardware/drivers/network/verifying-the-rss-hash-calculation
- Microsoft, RSS Hashing Functions: https://learn.microsoft.com/en-us/windows-hardware/drivers/network/rss-hashing-functions
- Microsoft, RSS Configuration (table 2–8× processors): https://learn.microsoft.com/en-us/windows-hardware/drivers/network/rss-configuration
- Linux, Scaling in the Linux Networking Stack (RSS table ≥ 4× queues, RPS/RFS/aRFS/XPS, rps_sock_flow_entries 65536, IRQ affinity, hyperthreads): https://docs.kernel.org/networking/scaling.html
- Neugebauer et al., Understanding PCIe performance for end host networking, SIGCOMM 2018: https://www.cl.cam.ac.uk/teaching/1011/R02/papers/p327-neugebauer.pdf
- Farshin et al., Reexamining Direct Cache Access to Optimize I/O Intensive Applications for Multi-hundred-gigabit Networks, USENIX ATC 2020: https://www.usenix.org/conference/atc20/presentation/farshin (PDF https://www.usenix.org/system/files/atc20-farshin.pdf)
- Cai et al., Understanding Host Network Stack Overheads, SIGCOMM 2021: https://cs.cornell.edu/~ragarwal/pubs/network-stack.pdf
- Høiland-Jørgensen et al., The eXpress Data Path, CoNEXT 2018 (the ACM PDF returned HTML; course copy used): https://courses.grainger.illinois.edu/ece598hpn/fa2023/papers/xdp.pdf
- Corbet, Network transmit queue limits, LWN 2011-08-09: https://lwn.net/Articles/454390/
- NVIDIA ConnectX-7 user manual, introduction: https://docs.nvidia.com/networking/display/connectx7vpi/Introduction
- NVIDIA SuperNIC page (ConnectX-8 800 Gb/s PCIe Gen6; ConnectX-9 up to 1.6 Tb/s per GPU): https://www.nvidia.com/en-us/networking/products/ethernet/supernic
- NVIDIA ConnectX-9 firmware release notes v82.48.1000 "February 2026 GA Release": https://networking-docs.nvidia.com/connectx9fwrn/82481000
- Broadcom, Thor Ultra press release 2025-10-14 (sampling, PCIe Gen6 x16, packet-level multipathing, out-of-order delivery, selective retransmission): https://www.broadcom.com/company/news/product-releases/63641
- Linux Foundation, UEC Specification 1.0 press release 2025-06-11: https://www.linuxfoundation.org/press/uec-launches-spec-1.0
- Network World 2025-06-14 (UEC 1.0: spraying at switch, reordering at NIC, congestion control without lossless network): https://www.networkworld.com/article/4006285/ultra-ethernet-consortium-publishes-1-0-specification-readies-ethernet-for-hpc-ai.html
- Network World 2026-10-14 (UEC 1.1, released 2026-10-12): https://www.networkworld.com/article/4235340/ultra-ethernet-1-1-extends-the-specification-to-scale-up-networks-and-adds-programmable-congestion-control.html
- ultraethernet.org (lists 1.1 as current, undated): https://ultraethernet.org/
- IEEE P802.3dj SA ballot e-mail 2026-03-28: https://grouper.ieee.org/groups/802/3/email_dialog/msg01813.html ; project page https://www.ieee802.org/3/dj/
- NVIDIA technical blog 2025-08-18, co-packaged optics: https://developer.nvidia.com/blog/scaling-ai-factories-with-co-packaged-optics-for-better-power-efficiency/

## Not verified from a primary source

- 802.3df (800G) approval on 2024-02-16: search results only (the page says only "approved", no date).
- Final approval of 802.3dj: not found (review searched again 2026-11-15; the Ethernet Alliance expects end of 2026); the page says so.
- 802.3dj scope: the project page title gives 200 Gb/s, 400 Gb/s, 800 Gb/s and 1.6 Tb/s; "200 Gb/s per lane" is attributed on the page to the Ethernet Alliance (secondhand, via a news report).
- ConnectX-9 lane count (PNY datasheet says 48 lanes): the PDF could not be decoded; not used on the page.
- Single-port 800G limit of ConnectX-9: third-party only; not on the page.
- The IEEE e-mail's 77 %: resolved in review. The e-mail gives 131 returned = 99 approve + 29 disapprove + 3 abstain; 77 % = 99 / 128 (abstentions excluded). The page now quotes all four counts and computes the rate in models.js (djPct).
- Gen6 FLIT header sizes (16 / 16 / 12 B) in the ch4 model are approximations, flagged on the page.
- DDIO replacement policy: Intel does not publish it; the sim is LRU (stated on the page).
- The LWN article's "almost 4 ms" is not quoted; the page recomputes 3.1 ms from wire bytes.

## Facts that will go stale

UEC versions (1.1 current as of 2026-10), 802.3dj status, ConnectX-8/9 and Thor Ultra availability, CPO switch ship dates (Quantum-X early 2026, Spectrum-X H2 2026 as planned in 2025-08).

## Registrar notes

- Title: 网卡是怎么搬运数据包的 / How a Network Card Moves Packets.
- Links to live siblings: OS #ch6 #ch7 #ch12, PCIe #ch3 #ch9, caches #ch1 #ch3, wired #ch4, storage #ch6, coherent #ch9 #ch10, why-compute-waits-for-memory #ch10, tcp-congestion, distributed-systems, how-a-gpu-computes (ch14). Drafts named in plain text: 《网页是怎么来到你手机上的》, 《一根线到底能传多少信息》 — link them when live.
- Aliases taken (none owned elsewhere, checked against aliases.json, lessons and sibling registries): 以太网帧, 巨型帧, 帧校验序列, RSS, 托普利茨哈希, aRFS, TSO 分段卸载, GRO, LRO, DDIO, leaky DMA, BQL, XDP, AF_XDP, 队列对, 单边写, 包喷洒, ECMP, PTP 硬件时间戳, UEC 1.1, SmartNIC, DPU, and question forms (网卡是怎么工作的 …).
- Left to siblings on purpose: bare TSO, RDMA / RoCE v2 / PFC / DCQCN / 无损以太网 (storage), 超以太网 / CPO (memory, coherent), NAPI / 描述符环 / DPDK / SR-IOV / virtio / 内核旁路 / 零拷贝 / 中断合并 (OS), MSI / TLP / PCIe 开销 (PCIe), NUMA (wired), MTU / 数据包 / 丢包 (web-page draft).
- Siblings could link here: OS #ch7/#ch12 (NIC side of rings, XDP), storage #ch6 (QP inside the NIC), coherent #ch10 (scale-out NIC), PCIe #ch9 (400G NIC budget).

## Review 2026-11-15 (Claude Code, claude-opus-5-5)

Checked against the source: Neugebauer §3 (24/24/20 B, 2+6+4+12 B, 62.96 → 57.88 Gb/s, the simple-NIC list, Niantic 40/8 are *TX* descriptors), §6 (520/547/947 ns, DDIO 10 % and +70 ns, remote +100 ns); XDP paper (24, 43.5, 4.8, 1.8, 115, 4.5 Mpps, 82 / 2 µs, E5-1650 v4 3.6 GHz); Cai (42, 55, 49 % copy with GRO + jumbo before aRFS, 49 % miss rate, Gold 6128 3.4 GHz, worst-case IRQ placement without aRFS); Farshin (6.5 MiB, 26.6 %, ~30 % / 30 %, Gold 6140 18 × 1.375 MiB 11 ways, Tootoonchian's leaky DMA); scaling.rst (≥ 4× table, 65536, aRFS:RFS = RSS:RPS, one queue per CPU, no HT benefit); Microsoft (2–8× processors); 802.3dj ballot e-mail; Thor Ultra (2025-10-14, PCIe Gen6 x16, sampling, multipathing / out-of-order / selective retransmission); LF UEC 1.0 (2025-06-11, no technical details, as the page says); Network World UEC 1.1 (2026-10-12); NVIDIA SuperNIC (CX-8 800 Gb/s Gen6, CX-9 1.6 Tb/s per GPU).
Recomputed independently: 400G at 64 B (84 B on the wire) 595.2 Mpps / 1.68 ns, at 1518 B 32.5 Mpps / 30.8 ns; Gen5 x16 504.1 Gb/s after 128b/130b, × (1 − 8.07 %) = 463.4; 106 B × 8 × 595.2 M = 504.8 Gb/s → 91.8 %; 64 uniformly random balls in 64 bins give a mean of 1/max = 0.26 (20 000 trials, independent script), matching the Toeplitz-hashed 26 %.
Not checked by the reviewer: the ConnectX-7 message rate (330–370 M/s), the ConnectX-9 firmware date, the NVIDIA CPO blog, the LWN article.

## Registration (2026-11-15, power/NIC registrar)

- Scripts `?v=20261115b` (models.js and both copy files changed in review).
- One-click additions: #ch1 网卡 / network card, NIC (the page tag 网卡 opened the page top). Page tag 网络 / Networking became 网络硬件 /
  Network Hardware (REGISTRY and pages.config.js): 网络 would have taken bare 网络 from tcp-congestion.
- Collisions resolved on the owners' side: bare RDMA tied at 80 between storage-over-a-network #ch6 and #ch11 here (title names RDMA),
  so S5 #ch6 gains the alias RDMA; PCIe 开销 / PCIe overhead / PCIe bandwidth became aliases of how-pcie-works #ch3 (this page's
  per-packet phrases contain them); "packet" became an alias of tcp-congestion (#ch8's title says packets). Bare TSO stays on
  how-cores-share-memory #ch9 (total store order).
- Siblings now link here: how-the-os-talks-to-hardware ch6.limit (#ch5, RSS) and ch7.limit (#ch3, descriptor prefetch and write-back),
  storage-over-a-network ch6.p1 (#ch11, queue pairs and one-sided writes), coherent-interconnects ch10.limit (#ch12, ECMP and spraying).
  how-pcie-works #ch10 and how-cpu-caches-work were checked and left alone (no sentence about NICs or DDIO).
- Atlas: 20 hand-written edges (10 between chapters, 10 with siblings).
