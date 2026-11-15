# BRIEF — 操作系统是怎么和硬件说话的 (How the OS Talks to Hardware)

Built-By: Claude Code (claude-opus-5-5)
Verified-By: self-check by builder (node model test, browser test zh at 1280/390/320 and reduced motion, canvas sweep, screenshots of every model and diagram at three widths); Claude Code (claude-opus-5-5), independent review 2026-11-15: zh and en prose against the models and primary sources (Google kCTF blog, Axboe io_uring.pdf, LWN 1049831, Hardware Busters, SPDK about, kernel device-io/e1000/e1000e docs, Arrakis OSDI'14 Table 1, syscall_64.tbl at v7.4-rc2 and v7.3, kernel.org releases), aliases against sibling registries, browser test zh+en at 1280/390/320 and reduced motion, canvas sweep, screenshots of all ten diagrams and nine models; note specs/reviews/how-the-os-talks-to-hardware-review-20261115.md
Category: computing 计算机 / subtopic systems 系统 · Stage: university
Series: computer architecture series (`specs/essay-briefs/TASK-*-series.md`)
Format: long interactive essay. zh written by the builder; `copy.en.js` translated (Haiku) and revised in review; both languages are live on the page (no `enStub`).
Files: index.html, copy.zh.js, copy.en.js, models.js, app.js, REGISTRY.json, tests/models.cjs, tests/browser.cjs
No page-provenance label and no page-provenance.css link (the registrar adds both).

## The one question

你的程序里写一句 read() 或 printf()，几微秒后数据就从硬盘、网卡、键盘那里来了。可是用户程序明明碰不到任何硬件——
这句话是怎么穿过"墙"，找到对的驱动、对的设备，再把结果送回来的？

## Ladder (final)

1. 特权级（墙）
2. 系统调用（门）
3. 走一次门的代价
4. 设备 = 一排寄存器（MMIO / 端口 I/O）
5. 中断走过的路（MSI → APIC → IDT → 上半部 / 下半部）
6. 中断、轮询、NAPI
7. DMA 与描述符环
8. IOMMU（设备的页表）
9. 驱动怎么认出设备（match / probe / bind，-EPROBE_DEFER）
10. 一次 read() 穿过的每一层
11. epoll 与 io_uring
12. 绕开内核（DPDK / SPDK / RDMA / VFIO），virtio 与 SR-IOV
13. 前沿（2026 年 11 月）
14. 三个问题

Changes from the starting list:
- The cost of a crossing got its own chapter (3). Chapters 11 and 12 reuse its model.
- Chapter 5 has no model, by design: the path is fixed, so it is a diagram.
- Chapters 8 and 12 have no model either. Chapter 8 links B6 #ch8 for DMA attacks and keeps only remapping. Chapter 12 reuses the ch3 and ch6 models by name.
- Sibling material is linked instead of repeated:
  - KPTI: A3 #ch10
  - BAR: B1 #ch6
  - MSI bytes: B1 #ch7
  - NVMe queues and polling: NVMe #ch4 and #ch7
  - IOMMU attacks: B6 #ch8
  - Barriers: cores #ch9
  - Spectre: guesses-ahead #ch10
  - Arm ELs and the kernel handoff: boot #ch12 and #ch11
  - ACPI: boot #ch6
  - LBA and HDD: drive #ch1 and #ch2

## Models, results, tuned parameters

1. **priv**: the hardware response to 7 x86 operations and 5 Arm operations at user or kernel level, with or without the kernel granting access (ioperm, UIO/VFIO).
   - x86, ring 3: IN gives #GP; HLT and CR3 give #GP; a kernel load or MMIO gives #PF.
   - Arm, EL0: a kernel load gives a data abort; MSR is undefined (SIGILL).
2. **abi**: register contents for read/write/getpid/openat/io_uring_enter on x86-64 and arm64. For example, read is 0 on x86-64 and 63 on arm64; io_uring_enter is 426 on both. The x86 steps follow the SYSCALL pseudo-code.
3. **sysCost**: per-operation time = work + crossing / batch, on Ren et al.'s 2.4 GHz Xeon.
   - Crossing cost: 100 cycles without KPTI, 580 with KPTI+PCID, 1250 without PCID.
   - Default (200 cycles of work): 74 % of the time is in the crossing, 3.8× a function call. At batch 32 that falls to 8 %.
   - TUNED: function call = 5 cycles.
4. **mmio**: CPU stall per command for 64 commands.
   - Default k = 5 status reads, b = 16 commands per doorbell: poll 2.75 µs, interrupt 587 ns, ring 10 ns, a ratio of 269×.
   - The register read is measured: 547 ns. TUNED: posted write 20 ns, RAM write 1 ns. Doubling either keeps the order for k ≥ 2 (tested).
   - With k = 1, polling is cheaper than an interrupt, as it should be.
5. **pollSim** (seeded discrete-event simulation, one core). TUNED from Arrakis: per-packet work 1.26 µs, interrupt and wake 2.2 µs; empty poll 0.1 µs.
   - Interrupt per packet livelocks above 1e6 / 3.46 ≈ 289 kpps.
   - At 200 kpps: interrupts 70 % CPU and 7.4 µs mean latency; NAPI 49 %, 2.0 packets per interrupt.
   - Coalescing for 50 µs at 10 kpps: about 10,048 → 6,694 interrupts per second, latency 3.5 → 46 µs.
   - Sensitivity: doubling the wake cost lowers the livelock threshold to about 0.6×; doubling the empty-poll cost adds about 0.05 µs to the polling mean.
6. **ringSim**: an RX ring with free-running 32-bit counters starting at 0xFFFFFF00, so they wrap.
   - Default 256 slots, 0.5 Mpps, a 500 µs stall every 2 ms: about 260 slots needed, 0.8 % dropped; 512 slots → 0.
   - 1 ms stalls: capacity is 0.40 Mpps < arrivals, so any ring only fills later.
   - TUNED: interrupt delay 20 µs (doubling it adds 10 slots), stall period 2 ms.
7. **bind**: the PCI match follows pci_match_one_id (the nvme driver matches on class 0x010802 with mask 0xFFFFFF). Device-tree matches score by compatible position. -EPROBE_DEFER is retried after any successful bind.
   - The SD controller registered first defers, then is retried once.
   - Without the regulator driver it stays deferred.
8. **readTrace**: Lee et al. Fig. 4(a) steps (Optane, 4 KB random read). The labelled steps leave 1.07 µs of the 12.82 µs total; that remainder is modelled as "中断及其余". Entering and leaving the kernel adds 0.10 µs each (Arrakis).
   - Times: hit 0.71 µs, miss 13.02 µs, O_DIRECT 11.99 µs, polled 9.97 µs.
   - On a miss, software is 44 % of the time on Optane and 7 % on NAND.
   - At 90 % hits the average is 1.94 µs.
   - TUNED order-of-magnitude device times: NAND 80 µs, HDD 4 ms.
9. **asyncIo**: per I/O = crossings × the ch3 cost + context switches × 0.95 µs (Lee) + 1.26 µs of work. Results per core: blocking 408 k, io_uring with k = 8: 771 k (default view), SQPOLL 794 k over 2 cores = 397 k each.

## Diagrams (10; layout 'w' at a prose column of 600 px or more, 'n' below)

1. rings: x86 rings and Arm ELs (ch1)
2. sys: the syscall path in six numbered steps (ch2)
3. map: physical address map and the separate port space (ch4)
4. irq: the nine-step interrupt path (ch5)
5. ring: the eight-slot descriptor ring with consumer/producer and the index rule (ch7)
6. iommu: MMU and IOMMU lanes to RAM (ch8)
7. probe: discovery → match → probe → bind/defer/fail (ch9)
8. stack: the read() layers with the hit short-cut and the completion path (ch10)
9. uring: SQ/CQ in shared memory with head and tail owners (ch11)
10. bypass: three data paths (ch12)

These cover all eight named in the task (rings/ELs, syscall, MMIO map, interrupt, DMA ring, I/O stack, io_uring, probe/bind), plus iommu and bypass.

## Sources (opened 2026-11-15 unless noted)

- Soares & Stumm, FlexSC, OSDI 2010 — https://www.usenix.org/legacy/events/osdi10/tech/full_papers/Soares.pdf (§2.1: 79/71/150 cycles, L3 miss 250, 14,000 cycles to recover)
- Ren et al., An Analysis of Performance Evolution of Linux's Core Operations, SOSP 2019 — https://www.eecg.toronto.edu/~stumm/Papers/Ren-sosp-19.pdf (§4.1.1: KPTI 400–500 cycles, CR3 ~200, TLB 700/30, 344 ns read +113 %/+47 %, avg 22 %, retpoline poll +89 %, epoll +72 %)
- Neugebauer et al., Understanding PCIe performance for end host networking, SIGCOMM 2018 — https://www.cl.cam.ac.uk/research/srg/netos/projects/pcie-bench/neugebauer2018understanding.pdf (64 B DMA read min/median/max 520/547/947 ns)
- Peter et al., Arrakis, OSDI 2014 — https://www.usenix.org/system/files/conference/osdi14/osdi14-paper-peter_simon.pdf (Table 1)
- Lee et al., Asynchronous I/O Stack, USENIX ATC 2019 — https://www.usenix.org/system/files/atc19-lee-gyusun.pdf (Fig. 4(a); values read off the figure by matching label positions)
- Axboe, Efficient IO with io_uring — https://kernel.dk/io_uring.pdf
- Haas & Leis, What Modern NVMe Storage Can Do, VLDB 2023 — https://www.vldb.org/pvldb/vol16/p2090-haas.pdf (§2.5)
- OSTEP, I/O Devices — https://pages.cs.wisc.edu/~remzi/OSTEP/file-devices.pdf
- syscall(2) — https://man7.org/linux/man-pages/man2/syscall.2.html; io_uring_setup(2) — https://man7.org/linux/man-pages/man2/io_uring_setup.2.html
- syscall tables at 7.4-rc2: arch/x86/entry/syscalls/syscall_64.tbl, scripts/syscall.tbl (git.kernel.org torvalds/linux.git, tree and plain views); top-level Makefile for 7.4-rc2
- SYSCALL, IN, HLT pseudo-code — https://www.felixcloutier.com/x86/syscall, /x86/in, /x86/hlt (from the Intel SDM)
- drivers/pci/pci.h (pci_match_one_id), drivers/pci/pci-driver.c, drivers/base/dd.c (deferred probe), include/linux/mod_devicetable.h — elixir.bootlin.com v7.3.1 and git.kernel.org
- Kernel docs: driver-model binding/driver, device-io, PCI/pci, networking/napi, e1000, e1000e, iou-zcrx, block/ublk, sysctl kernel (io_uring_disabled), sysctl net (dev_weight), arch/x86/pti — https://docs.kernel.org/…
- TF-A firmware design (EL roles) — https://trustedfirmware-a.readthedocs.io/en/latest/design/firmware-design.html
- Google security blog 2023-06-14 — https://security.googleblog.com/2023/06/learnings-from-kctf-vrps-42-linux.html
- LWN, Maintainers Summit 2025-12-10 — https://lwn.net/Articles/1049831/
- Rust Binder: drivers/android/binder/*.rs at v6.18 and at master (7.4-rc2, no binder.c), checked on git.kernel.org; Hardware Busters 2026-09-19 — https://hwbusters.com/news/linux-7-4-deletes-11470-lines-of-android-binder-c-code-and-the-rust-binder-driver-takes-over/ (the Carlos Llamas quote)
- virtio: OASIS announcement of v1.2 CS01 — https://www.oasis-open.org/?p=10365 (spec dated 2022-07-01); v1.3 CSD01 — https://docs.oasis-open.org/virtio/virtio/v1.3/virtio-v1.3.html (2023-10-06)
- SPDK about — https://spdk.io/doc/about.html

## Not verified from a primary source

- Arm: the developer.arm.com EL page is JS-only and was not read. The EL roles come from TF-A docs. "MSR to an EL1 register at EL0 is UNDEFINED" follows the Arm ARM rule as commonly documented; I did not open the ARM ARM itself.
- arm64 vector-table offsets and ESR details are not on the page, so there is nothing to check.
- IOMMU strict/lazy invalidation is described qualitatively; I did not open a primary benchmark.
- Device times for NAND (80 µs) and HDD (4 ms) are TUNED orders of magnitude. The Intel P4510 77 µs figure was dropped because no datasheet confirmed it.
- virtio 1.3: whether it became a final Committee Specification after CSD01 was not found. The page says so.
- Phoronix (Cloudflare-blocked) was not read. The binder removal was checked in the kernel tree directly.
- Google's ChromeOS / Android / production-server statements come from the blog, not from ChromeOS sources.
- No kernel version is given for io_uring_disabled, irq-suspend-timeout, zcrx or ublk, on purpose.

## Facts that will go stale

- 7.4-rc2 / 7.3.4 as of 2026-11 (kernel.org, 7.3.4 released 2026-11-10); the x86-64 syscall max of 472 (fchroot, in v7.3 and v7.4-rc2; the builder's 471 was rseq_slice_yield, corrected in review).
- The Rust Binder status.
- virtio 1.3 status.
- io_uring restrictions at Google.

## Registrar notes

- Title: 操作系统是怎么和硬件说话的 / How the OS Talks to Hardware.
- 14 concepts (#ch1–#ch14) in REGISTRY.json. Aliases avoid every sibling and reserved word; the test hard-codes the reservations:
  - KPTI, PCID, Meltdown, 缺页 → A3
  - MSI, BAR, 配置空间, PCIe 枚举 → B1
  - IOMMU, VT-d, DMA 攻击 → B6
  - 门铃, SQ/CQ, 轮询 vs 中断, io_uring IOPOLL, SPDK 轮询 → NVMe
  - 排队论, 丢包, 缓冲区 → web-page essay
  - CXL and 上下文切换 are not taken.
- Owned here: 系统调用 / 特权级 / 中断处理 / 软中断 / NAPI / 中断合并 / 接收活锁 / MMIO / 端口 I/O / 描述符环 / DMA 是什么 / DMA 重映射 / IOVA / 驱动模型 / EPROBE_DEFER / VFS / 页缓存 / O_DIRECT / epoll / io_uring 是什么 / DPDK / virtio / SR-IOV / 用户态驱动 / 内核旁路. Review 2026-11-15: RDMA and "remote direct memory access" removed from #ch12 (storage-over-a-network #ch6 owns RDMA 是什么 / what is RDMA and explains it; this page names it in one sentence); bare "DMA" is why-a-few-firms-win's (Digital Markets Act), so this page keeps only the question forms DMA 是什么 / what is DMA.
- 《网页是怎么来到你手机上的》 is named in plain text in ch14.links, ready to link when it goes live.
- English is translated and reviewed (2026-11-15).

## Review 2026-11-15 (Claude Code, claude-opus-5-5)

Checked against sources opened 2026-11-15: Google kCTF blog (60 % "exploited the io_uring component", ~1 M USD for io_uring alone, ChromeOS/Android/production servers), Axboe io_uring.pdf (free flowing 32-bit counters, 1.7 M / 1.2 M / 608 K, 12–20 M no-ops, 1..4096 entries, inline completion of cached reads), LWN 1049831 ("no longer experimental"), Hardware Busters 2026-09-19 (the Llamas statement is the reporter's paraphrase, not a quote), SPDK about ("polled-mode"), kernel docs device-io (port space "generally not as fast", posted writes), e1000 (16 B, 256, 48–4096), e1000e (4000 / 20000), Arrakis OSDI'14 Table 1 (1.26, 3.36, 6.19, 1.44, 0.38; E5-2430 2.2 GHz; the extra 2.2 µs is the context switch from idle), syscall_64.tbl at v7.4-rc2 and v7.3 (max 472 fchroot), scripts/syscall.tbl (read 63, io_uring_enter 426), Makefile v7.4-rc2, kernel.org releases.json (stable 7.3.4), master drivers/android (only binder/, Kconfig, Makefile), virtio 1.3 (still CSD01 as far as found).
Not re-opened by the reviewer: Ren et al. (100 / 400–500 / 30 / 700 cycles), FlexSC, Neugebauer, Lee Fig. 4(a) (figure text not extractable; whether its 12.82 µs total already includes syscall entry/exit is unknown, now said on the page), Haas & Leis, the Arm ARM accessor pseudocode for MSR TTBR0_EL1 at EL0 (disclosed in ch1.limit), IOMMU strict/lazy (qualitative; matches the iommu.strict kernel parameter as I know it).

## Registrar (2026-11-15)

- Essay commit 20a942e2 (this tree as reviewed, with the review note specs/reviews/how-the-os-talks-to-hardware-review-20261115.md).
  Registered together with how-pixels-reach-a-screen.
- Alias decisions after the one-click check on the homepage ranking: RDMA stays off this page (storage-over-a-network #ch6 owns RDMA
  是什么 / RDMA); of the DMA words only DMA 是什么 / what is DMA are here (bare DMA is unowned; it ties at 80 between #ch7 and
  how-pcie-works #ch7 and is not pinned; the unregistered draft why-a-few-firms-win uses it for the Digital Markets Act). "kernel bypass"
  / 内核旁路 open #ch12 while storage-over-a-network's "kernel bypass zero copy" still opens its #ch6 (both pinned). IOMMU stays on
  how-thunderbolt-works #ch8, SPDK on why-nvme-is-fast #ch7. One-click additions: #ch1 操作系统, 操作系统怎么和硬件通信, 程序怎么访问
  硬件 / operating system, how does the OS talk to hardware, how do programs access hardware (操作系统 / operating system tied between
  this page's tag and how-virtual-memory-works' tag); #ch5 中断 / interrupt; #ch11 io_uring (it opened #ch13 through io_uring 安全).
  Pinned in tests/concept-search.cjs.
- Siblings now link here: how-virtual-memory-works ch10.limit (#ch3) and ch11.p3 (#ch8), how-pcie-works ch6.p5 (#ch4) and ch7.p3
  (#ch5), why-nvme-is-fast ch7.p2 (#ch11; Antigravity edition, note specs/reviews/why-nvme-is-fast-os-link-20261115.md),
  how-a-computer-boots ch11.p6 (#ch9), how-thunderbolt-works ch8.p2 (#ch8), storage-over-a-network ch6.p1 (#ch12).
  《网页是怎么来到你手机上的》 (ch14.links) stays plain text: tech/networks/how-a-web-page-arrives is an unregistered draft.
