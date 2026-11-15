# Review: how-the-os-talks-to-hardware (操作系统是怎么和硬件说话的 / How the OS Talks to Hardware)

Reviewer: Claude Code (claude-opus-5-5), independent of the builder (Opus, zh) and translator (Haiku, en). 2026-11-15.
Scope: zh and en copy in full, models.js, app.js, index.html, tests; primary-source spot checks; aliases; browser
(zh + en, 1280/390/320, reduced motion), canvas sweep, screenshots of all ten diagrams and nine models in both languages.
Edits are confined to `computing/systems/how-the-os-talks-to-hardware/` and this note. Nothing committed.

## Findings and fixes

### Factual
1. **Highest x86-64 syscall number was wrong.** The page said 471 at 7.4-rc2. `arch/x86/entry/syscalls/syscall_64.tbl`
   at tags v7.4-rc2 and v7.3 ends at **472 fchroot** (hooked up 2026-07-27; 471 is rseq_slice_yield). Fixed in
   `SRC.abi.x86.max`; `tests/models.cjs` pins 472 (sysMax and the table check).
2. **Stable kernel was stale.** 7.3.1 → **7.3.4** (kernel.org releases.json, released 2026-11-10). FRONTIER, ch13.e1
   (both languages) and the test pins updated. Mainline 7.4-rc2 confirmed from the v7.4-rc2 Makefile.
3. **ch13.law overgeneralised** "the part of the kernel attackers target most often" / 「内核里最常被攻击的部分」 from
   one bounty programme's one-year share. Now scoped to Google's kernel bug bounty in both languages (pinned).
4. **ch13.d1**: en "involved io_uring" → "exploited the io_uring component of the Linux kernel" (the blog's words);
   zh made exact as well (「利用的是 Linux 内核的 io_uring 组件」, "单是 io_uring 就付了约 100 万美元", seccomp-bpf).
5. **ch13.c1** attributed an unsourced view to "supporters of io_uring". Rewritten to Google's own sentence
   ("brings performance benefits, and promptly reacts to security issues", "a fairly new part of the kernel").
6. **ch6 livelock**: the law said "not a single useful packet gets finished", but the model serialises wake + work per
   packet, so past 1/(h+p) ≈ 289 kpps it saturates (queue and latency diverge) rather than collapsing. Law softened
   ("fewer and fewer packets get finished") and ch6.limit now says what the model omits (interrupt priority stealing
   protocol time, falling throughput).
7. **ch10.tuned**: now says the polled read drops the whole 1.07 µs "interrupt and the rest" step (a simplification)
   and that the Arrakis 2 × 0.10 µs crossings are added on top of Lee's 12.82 µs total, so ~0.2 µs may be double
   counted if the figure already includes them. Numbers unchanged (0.71 / 13.02 / 11.99 / 9.97 µs).

### Quotations (neither language may present a paraphrase or translation as verbatim)
- ch7.p3 en "free-running" → “free flowing 32-bit integers, and rely on natural wrapping” (Axboe, io_uring.pdf);
  zh no longer puts a translation in 「」 and says "环的计数器" (Axboe says ring counters, not "its two rings").
- ch11.p4 en → “mostly bound by the number of system calls that have to be performed” (verbatim); zh paraphrase unquoted.
- ch12.p2 SPDK en → “a user space, polled-mode, asynchronous, lockless NVMe driver”; zh unquoted.
- ch13.d2 en → “Rust in the kernel is no longer experimental” (LWN, 2025-12-10); zh unquoted with the English original.
- ch13.c2: Hardware Busters paraphrases Llamas ("he writes, the C driver had become incredibly painful to maintain");
  the en quote “extremely painful to maintain” was both wrong and not his words. Both languages now attribute it as the
  report's paraphrase, without quote marks.
- ch4.p2 zh: the device-io doc sentence is now an unquoted paraphrase.
`tests/models.cjs` gained pins for each verbatim English quote and checks that the bad forms are gone.

### English and layout
- ch3.law rewritten (was "What makes it expensive is what it spreads"); ch1.limit Meltdown sentence rewritten.
- ch9 live log showed truncated device names ("Network", "Solid-state", and in zh 「SD」): app.js cut the label at the
  first space. Now cut at " PCI " or the bracket ("Network card", "SD card controller", 「SD 卡控制器」).
- "The 2th compatible string", "with 1 retries", "retried 1 times" fixed.
- ch4 canvas bar labels were clipped at 320 px in English; shortened ("Command + poll status", "Command + interrupt",
  "Memory queue + doorbell").
- dg.map.pcf8 / p1f7 restored to "0xCF8/CFC legacy PCI config" and "0x1F7 IDE command/status" (the longer forms with
  spaces wrapped and overlapped at 1280; the browser test caught it).
- bypass diagram (wide): the IOMMU arrow ran through the wrapped English label; arrow now starts below it.
- site-nav include lines carried `?v=20261115`; the build script's key is `sn-20261115`. Fixed.

### Aliases
No collision with any sibling REGISTRY.json, atlas aliases or lessons (test passes). Two judgement calls:
- **RDMA** / remote direct memory access removed from #ch12: storage-over-a-network #ch6 owns RDMA 是什么 / what is
  RDMA and explains it; this page names it once. Reserved in the test.
- Bare **DMA** belongs to why-a-few-firms-win (Digital Markets Act); this page keeps only DMA 是什么 / what is DMA.
  Reserved in the test.
A3 (KPTI/PCID/page faults), B1 (MSI/BAR/config space), Thunderbolt (IOMMU, DMA attacks) and NVMe (doorbells, SQ/CQ,
polling vs interrupts) words are absent from this page's aliases.

### Diagrams (§4a)
Ten inline-SVG diagrams, one per structural chapter, all captions say schematic; labels from copy. Technically
checked: ring order (x86 ring 3 above ring 0; EL0–EL3), SYSCALL/SYSRET register moves, address map (I/O APIC
0xFEC00000 below LAPIC 0xFEE00000, flash at the 4 GiB top), RX ring (NIC advances head, driver writes tail,
index = count & (N−1)), IOMMU lane, probe/defer/retry, read() stack, io_uring head/tail owners (app writes SQ tail /
CQ head, kernel SQ head / CQ tail; matches io_uring.c), bypass paths. Screenshots inspected at 1280/390/320 in both
languages.

## Spot-checked sources (opened 2026-11-15)
Google security blog 2023-06-14; Axboe "Efficient IO with io_uring" (text extracted from the PDF): free flowing
counters, 1.7 M polled / 1.2 M irq / 608 K aio, 12–20 M no-ops, 1..4096 entries, inline completion of cached reads;
LWN 1049831; Hardware Busters 2026-09-19; spdk.io about; docs.kernel.org device-io, e1000 (16 B, 256, 48–4096),
e1000e (4000 / 20000); Arrakis OSDI'14 Table 1 (1.26, 3.36, 6.19, 1.44, 0.38 µs; E5-2430 2.2 GHz; +2.2 µs context
switch from idle); syscall_64.tbl and scripts/syscall.tbl at v7.4-rc2; master drivers/android (only binder/,
Kconfig, Makefile, consistent with the C Binder removal); virtio 1.3 (no CS01 found; page's statement stands).
Models re-derived by hand: crossing 100+450+30 = 580 cycles, 780/205 = 3.8×, 74 %; livelock 1e6/3.46 = 289 kpps;
mmio 5×547+20 = 2.75 µs, 587 ns, 656/64 = 10 ns; read hit 0.71, miss 13.02, NAND software 7 %; asyncIo 408 k / 771 k.

## Not verified
Ren et al. cycle counts (100, 400–500, CR3 200, TLB 30/700), FlexSC, Neugebauer, Lee Fig. 4(a) values (figure text not
extractable), Haas & Leis; Arm ARM accessor pseudocode for MSR TTBR0_EL1 at EL0 (UNDEFINED → SIGILL is standard and
disclosed as unchecked in ch1.limit); IOMMU strict/lazy (qualitative only); NAND 80 µs / HDD 4 ms are labelled
orders of magnitude on the page; virtio 1.3 final status; whether the C Binder removal landed exactly in 7.4-rc1 (master
checked, not the tag, because of GitHub rate limits). ch10's canvas looks blank in English element screenshots at 390/320 (the tall card is captured before the on-screen-gated
canvas scrolls into view); a probe that scrolls the canvas into view shows it drawn in both languages at 390 and 320.
Reduced motion: one extra pass captured every figure and model card at 1280/390/320 in both languages with
`reducedMotion: 'reduce'` (114 shots, scratch only); no difference from the normal run apart from that capture artifact.
`tests/browser.cjs` header comment (lines 10–11) still calls English a stub; the code already runs en when no `enStub`.

## Test output (final)
- `node tests/models.cjs` → PASS: 3418 checks
- `ESSAY_BASE_URL=http://127.0.0.1:18984 node tests/browser.cjs` → PASS: browser smoke test (zh+en at 1280/390/320 …
  ten diagrams …, reduced motion)
- `CANVAS_BASE_URL=http://127.0.0.1:18984 node tests/canvas-text-overlap.cjs --sweep …` → PASS: 882 canvas states across
  1 pages × 1280/390/320 × zh/en

## Verdict
Ready to register after these fixes. The models are sound and every prose number is generated and pinned; tuned
parameters are labelled where they appear. The errors found were a stale syscall maximum and stable version,
an overgeneralised security claim, and several English "quotes" that were paraphrases; all fixed and pinned.

## Final alias list for the registrar (REGISTRY.json)
#ch1 特权级, 保护环, ring 0, 异常级别, 用户态和内核态 / privilege levels, protection rings, ring zero, exception levels, user mode vs kernel mode ·
#ch2 系统调用, 系统调用是什么, syscall 指令, 系统调用号 / system call, what is a syscall, syscall ABI, system call number ·
#ch3 系统调用开销, 系统调用为什么慢, 进出内核的代价 / syscall cost, system call overhead, cost of a kernel crossing ·
#ch4 MMIO 是什么, 内存映射 I/O, 端口 I/O, inb outb, 设备寄存器 / memory-mapped I/O, what is MMIO, port I/O, device registers, inb and outb ·
#ch5 中断处理, 上半部 下半部, 软中断, softirq, 中断向量表, APIC 是什么 / interrupt handling, top half and bottom half, Linux softirq, interrupt descriptor table, what is an APIC ·
#ch6 NAPI, 中断合并, 中断风暴, 接收活锁 / NAPI polling, interrupt coalescing, interrupt storm, receive livelock ·
#ch7 描述符环, DMA 是什么, 直接内存访问, 接收环大小 / descriptor ring, what is DMA, direct memory access, RX ring size ·
#ch8 DMA 重映射, IOVA, 设备页表 / DMA remapping, I/O virtual address, device page table ·
#ch9 驱动模型, 驱动怎么认出设备, probe 函数, EPROBE_DEFER / Linux driver model, driver probe, deferred probe, how drivers find devices ·
#ch10 VFS, 页缓存, O_DIRECT, 缓冲 I/O, Linux I/O 栈 / virtual file system, page cache, O_DIRECT flag, buffered I/O, Linux I/O stack ·
#ch11 epoll, io_uring 是什么, 异步 I/O, Linux 异步 I/O / epoll API, what is io_uring, asynchronous I/O, Linux async I/O ·
#ch12 DPDK, virtio, SR-IOV, 用户态驱动, 内核旁路 / Data Plane Development Kit, virtio devices, single-root I/O virtualization, user-space drivers, kernel bypass ·
#ch13 Rust 写驱动, Linux 内核 Rust, io_uring 安全 / Rust in the Linux kernel, Rust drivers, io_uring security ·
#ch14 程序卡在 I/O 上, I/O 性能排查 / program stuck on I/O, I/O performance troubleshooting.
Note for the registrar: "kernel bypass" sits next to storage-over-a-network's "kernel bypass zero copy"; distinct strings, but check search ranking.
