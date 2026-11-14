# BRIEF: Why NVMe Is So Fast (`computing/systems/why-nvme-is-fast/`)

## Goal & Ladder
One question in the hero: **Why is NVMe so fast, and what makes it fundamentally more advanced than HDD/SATA/AHCI?**
1. `#ch1` — Latency breakdown: when media drops from 8,500 us (HDD) to 75 us or 10 us (flash), AHCI's 25 us wire+protocol overhead jumps from 0.3% to 25.0%–71.4%; NVMe trims it to ~5 us.
2. `#ch2` — Bus width & Little's Law: SATA III 8b/10b (~552 MB/s usable) vs PCIe 3.0/4.0/5.0/6.0 x4 (3,545 / 7,089 / 14,178 / 28,500 MB/s), and why QD=1 still leaves PCIe 4.0 at 0.7% utilization.
3. `#ch3` — Queue architecture: AHCI 1x32 shared spinlock collapses under multicore cache-line bouncing (155k IOPS at 16 cores) vs NVMe 64Kx64K per-core queues (1,500k IOPS, 9.7x).
4. `#ch4` — Ring buffers & doorbells: 8-slot SQ/CQ in Host DRAM, 2 posted doorbell writes + PCIe DMA + MSI-X vs ~5 uncached MMIO accesses in AHCI.
5. `#ch5` — Internal SSD parallelism: single NAND die tR = 50 us (~19,048 IOPS) vs 8x4 = 32 dies interleaved at QD=32 (~610k IOPS, 32.0x).
6. `#ch6` — Write amplification & Trim: WAF = 1/(1-v); 85% fill at 7% OP (WAF 4.9x) vs 28% OP (3.0x) vs Trim off at 75% fill (10.1x).
7. `#ch7` — Polling vs interrupts: 10 us flash + 6 us IRQ = 16.0 us vs 10.5 us polling (34.4% faster), CPU crossover at ~286k IOPS.
8. `#ch8` — Frontier: PCIe 6.0 PAM4, NVMe 2.1, ZNS, and GPUDirect Storage (40 GB LLM weights in 1.4 s on PCIe 6.0 GDS vs 6.2 s on POSIX).

## Sources & Verification
- **NVMe 2.0 / 2.1 specs**: NVM Express Base Specification 2.0 (Jun 2, 2021) and 2.1 (Aug 6, 2024).
- **PCIe 3.0–6.0 encoding & rates**: PCI-SIG specifications (128b/130b for Gen3–5; 64 GT/s PAM4 FLIT for Gen6).
- **Enterprise PCIe 6.0 SSDs (checked 2026-11-14 via web search)**:
  - Micron 9650 NVMe SSD: mass production Feb 2026, up to 28,000 MB/s seq read, 5.5M random read IOPS.
  - Samsung PM1763 NVMe SSD: mass production Jul 2026, 4nm controller, up to 28,400 MB/s seq read, 21,900 MB/s seq write.
- **Client PCIe 5.0 SSDs (checked 2026-11-14 via web search)**: WD_BLACK SN8100, Samsung 9100 PRO (~14.7–14.9 GB/s seq read, 2M+ IOPS).
- **What is modeled/simplified**:
  - Ch1 holds OS filesystem overhead constant; Ch3 models spinlock contention with a 1.2 us base + 0.35 us/core bounce; Ch6 uses steady-state uniform random-write WAF = 1/(1-v); Ch7 models 3.5 us CPU cost per IRQ. All prose numbers are pinned by `tests/models.cjs`.

## Facts that will go stale
- Enterprise PCIe 6.0 production status & peak GB/s records (as of Nov 2026: ~28.4 GB/s).
- Client PCIe 5.0 peak speeds (~14.9 GB/s) and client PCIe 6.0 adoption status.
