/* How the OS talks to hardware: the page's models.
   A privilege rule engine (Intel SDM IN/HLT/MOV CR3 and paging U/S rules; Arm exception levels); the Linux system-call
   ABI on x86-64 and arm64 (syscall(2), the 7.4-rc2 syscall tables, the SDM's SYSCALL operation); a cost model of one
   kernel crossing per operation with batching (cycle counts from Ren et al., SOSP 2019); a register-access cost sum
   for three ways a driver hands work to a device (one PCIe round trip from Neugebauer et al., SIGCOMM 2018); a seeded
   discrete-event simulation of interrupts, polling and the NAPI hybrid (Mogul & Ramakrishnan's receive livelock); a
   descriptor ring with free-running 32-bit producer/consumer counters; the Linux driver core's match → probe → bind with
   pci_match_one_id, of_match_node scoring and -EPROBE_DEFER; a read() traced through the I/O stack with per-step times
   read off Lee et al. (USENIX ATC 2019) Figure 4(a); and syscalls per I/O for read, epoll and io_uring.
   Real-world figures sit in SRC / FRONTIER with their source and the date it was opened (also in BRIEF.md). Constants
   chosen for a model rather than taken from a source are marked TUNED here and on the page.
   UMD: window.OsHwModels in the browser, module.exports in node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.OsHwModels = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ── sourced figures (BRIEF.md has URL and the date each was opened, 2026-11-15) ── */
  const SRC = {
    // Soares & Stumm, FlexSC, OSDI 2010, §2.1: gettsc on a Core i7 (Nehalem): 79 cycles in, 71 out, 150 round trip;
    // an L3 miss is 250 cycles there; §1: Xalan needs up to 14,000 cycles to regain its IPC after a pwrite.
    flexsc: { enter: 79, leave: 71, total: 150, miss: 250, recover: 14000 },
    // Ren et al., SOSP 2019, §4.1.1, Xeon E5-2630 v3 at 2.40 GHz: entry + exit < 100 cycles without KPTI; KPTI's
    // constant cost 400–500 cycles; a CR3 write ~200 cycles; small-read spends 700 more cycles in TLB misses without
    // PCID and 30 with it; the shortest read test (344 ns) slows by 113 % without PCID, 47 % with it (Figure 3 text);
    // average KPTI slowdown over LEBench 22 %; retpoline: poll +89 %, epoll +72 %.
    ren: { ghz: 2.4, base: 100, kpti: [400, 500], cr3: 200, tlbNoPcid: 700, tlbPcid: 30, readNs: 344, slowNoPcid: 113, slowPcid: 47, kptiAvg: 22, retPoll: 89, retEpoll: 72 },
    // Neugebauer et al., SIGCOMM 2018, §6.2: 64 B DMA reads on a Xeon E5 (Haswell): min 520 ns, median 547 ns, max 947 ns
    pcie: { min: 520, median: 547, max: 947 },
    // Peter et al., Arrakis, OSDI 2014, Table 1 (Linux, UDP echo, Xeon E5-2430 at 2.2 GHz), µs per packet
    arrakis: { stackIn: 1.26, stackOut: 1.05, sched: 0.17, copyIn: 0.24, copyOut: 0.44, ret: 0.10, sys: 0.10, total: 3.36, idle: 6.19, wake: 2.2, arrP: 1.44, arrN: 0.38 },
    // Lee et al., Asynchronous I/O Stack, USENIX ATC 2019, Figure 4(a): 4 KB random read on an Optane SSD, µs, read off the
    // figure (label positions matched to bars); the figure's total is 12.82; the labelled steps leave a remainder.
    lee: { total: 12.82, device: 7.26, lookup: 0.30, lba: 0.09, alloc: 0.19, insert: 0.33, bio: 0.72, dmaMap: 0.29, submit: 0.37, complete: 0.81, dmaUnmap: 0.23, ctx: 0.95, copy: 0.21 },
    // Axboe, "Efficient IO with io_uring" v0.4 (2019-10-15), §9: 4 KiB random reads, one core: 1.7 M IOPS polled, 1.2 M
    // with interrupts, libaio 608 K; no-op 12–20 M messages/s; ring sizes 1..4096, a power of two
    axboe: { poll: 1.7e6, irq: 1.2e6, aio: 608e3, nopLo: 12e6, nopHi: 20e6, maxEntries: 4096 },
    // Haas & Leis, VLDB 2023, §2.5: 8 SSDs, 12.5 M IOPS; 13k cycles per I/O budget (2.5 GHz × 64 cores / 12 M IOPS);
    // SPDK reaches full bandwidth with 3 threads; io_uring polled needs ~16; libaio / io_uring with interrupts top out near
    // 10 M IOPS with 32 threads; "around half of the available CPU cores" go to submitting and reaping I/O
    haas: { iops: 12.5e6, budget: 13000, spdk: 3, poll: 16, irqIops: 10e6, irqThreads: 32 },
    // Linux docs: e1000 RxDescriptors default 256, range 48–4096, 16 bytes each; e1000e InterruptThrottleRate mode 3
    // = 4000/s bulk, 20000/s low latency; net.core.dev_weight 64
    nic: { rxDefault: 256, rxMin: 48, rxMax: 4096, descBytes: 16, itrBulk: 4000, itrLow: 20000, weight: 64 },
    // syscall(2): instruction, number and argument registers; arch/x86/entry/syscalls/syscall_64.tbl and
    // scripts/syscall.tbl at 7.4-rc2 (opened 2026-11-15; reviewer re-read v7.4-rc2 and v7.3: the last x86-64 entry is
    // 472 fchroot, hooked up 2026-07-27, after 471 rseq_slice_yield)
    abi: {
      x86: { insn: 'syscall', nr: 'rax', args: ['rdi', 'rsi', 'rdx', 'r10', 'r8', 'r9'], ret: 'rax', max: 472,
        calls: { read: 0, write: 1, getpid: 39, openat: 257, io_uring_enter: 426 } },
      arm: { insn: 'svc #0', nr: 'x8', args: ['x0', 'x1', 'x2', 'x3', 'x4', 'x5'], ret: 'x0',
        calls: { read: 63, write: 64, getpid: 172, openat: 56, io_uring_enter: 426 } }
    },
    // Intel SDM / felixcloutier SYSCALL: RCX := RIP, R11 := RFLAGS, RIP := IA32_LSTAR, CS from IA32_STAR[47:32],
    // RFLAGS &= ~IA32_FMASK (MSR C0000084H), CPL := 0; RSP is not saved
    sdm: { fmask: 0xC0000084, lstar: 0xC0000082 },
    // Google security blog 2023-06-14 (kCTF VRP): "60% of the submissions exploited the io_uring component"; ~1 M USD paid for io_uring alone
    google: { share: 60, paidM: 1, date: '2023-06-14' }
  };
  const FRONTIER = {
    asOf: '2026-11',
    kernel: { rc: '7.4-rc2', stable: '7.3.4' },             // Makefile at v7.4-rc2; kernel.org releases.json (7.3.4, 2026-11-10)
    rust: { summit: '2025-12-10', binder: '6.18', cRemoved: '7.4' }, // LWN 1049831; cgit v6.18 drivers/android/binder/*.rs; master has no binder.c
    uring: { googleDate: '2023-06-14' },
    virtio: { cs12: '2022-07-01', csd13: '2023-10-06' }      // OASIS announcement (v1.2 CS01); v1.3 CSD01 date from the TC ballot
  };

  /* ── helpers ── */
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const expo = (r, rate) => -Math.log(1 - r()) / rate;
  const hex = (v, n) => '0x' + (v >>> 0).toString(16).toUpperCase().padStart(n || 1, '0');

  /* ── 01 the wall: what the hardware does with one instruction at one privilege level ──
     x86: IN with CPL > IOPL checks the TSS I/O bitmap and raises #GP(0) if the port's bit is 1 (SDM, IN); HLT and
     MOV to CR3 need CPL 0 (#GP(0)); a user access to a supervisor page (U/S = 0) is a page fault; a device register is
     an address the kernel maps only in its own half unless it hands a mapping out (UIO/VFIO mmap).
     Arm: no port I/O; EL0 access to a kernel or unmapped address is a data abort; writing an EL1 system register at EL0
     is UNDEFINED; SVC takes an exception to EL1. Linux turns #GP / #PF / data aborts in user mode into SIGSEGV and
     undefined instructions into SIGILL. */
  const PRIV = {
    levels: { x86: ['r3', 'r0'], arm: ['el0', 'el1'] },
    ops: { x86: ['load', 'kload', 'in', 'mmio', 'hlt', 'cr3', 'sys'], arm: ['load', 'kload', 'mmio', 'msr', 'sys'] }
  };
  function priv(arch, level, op, grant) {
    const user = level === 'r3' || level === 'el0';
    if (!PRIV.ops[arch].includes(op)) return { res: 'na', sig: null };
    if (op === 'sys') return user ? { res: 'enter', sig: null } : { res: 'kernel', sig: null };
    if (!user) return { res: 'ok', sig: null };
    if (op === 'load') return { res: 'ok', sig: null };
    if (arch === 'x86') {
      if (op === 'in') return grant ? { res: 'ok', sig: null } : { res: 'gp', sig: 'SIGSEGV' };
      if (op === 'mmio') return grant ? { res: 'ok', sig: null } : { res: 'pf', sig: 'SIGSEGV' };
      if (op === 'kload') return { res: 'pf', sig: 'SIGSEGV' };
      return { res: 'gp', sig: 'SIGSEGV' };                 // hlt, cr3
    }
    if (op === 'mmio') return grant ? { res: 'ok', sig: null } : { res: 'abort', sig: 'SIGSEGV' };
    if (op === 'kload') return { res: 'abort', sig: 'SIGSEGV' };
    return { res: 'undef', sig: 'SIGILL' };                 // msr
  }

  /* ── 02 the system-call ABI ── */
  const ABI = {
    calls: ['read', 'write', 'getpid', 'openat', 'io_uring_enter'],
    // example arguments: [name, value]; AT_FDCWD = -100, IORING_ENTER_GETEVENTS = 1
    args: { read: [['fd', '3'], ['buf', '0x7ffd5e2c1000'], ['count', '4096']], write: [['fd', '1'], ['buf', '0x55d0c3a0b2a0'], ['count', '13']], getpid: [],
      openat: [['dirfd', '-100'], ['pathname', '0x55d0c3a0b2c0'], ['flags', '0']], io_uring_enter: [['fd', '4'], ['to_submit', '8'], ['min_complete', '8'], ['flags', '1'], ['sig', '0'], ['sz', '0']] }
  };
  function abi(arch, call) {
    const A = SRC.abi[arch], nr = A.calls[call], args = ABI.args[call];
    const regs = [[A.nr, String(nr), 'nr']].concat(args.map(([n, v], i) => [A.args[i], v, n]));
    return { arch, call, nr, insn: A.insn, regs, ret: A.ret, nargs: args.length };
  }

  /* ── 03 what one crossing costs: per-operation time with a kernel crossing every `batch` operations ──
     crossing cycles on Ren et al.'s Xeon E5-2630 v3: entry + exit (they give < 100, used here as 100), plus KPTI's
     constant cost (midpoint of 400–500), plus the extra TLB-miss cycles of small-read (700 without PCID, 30 with). */
  const COST = { ghz: SRC.ren.ghz, fn: 5, // TUNED: a call + ret pair, a few cycles
    profiles: ['none', 'pcid', 'nopcid'], works: [50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000], batches: [1, 2, 4, 8, 16, 32, 64] };
  COST.cross = { none: SRC.ren.base, pcid: SRC.ren.base + (SRC.ren.kpti[0] + SRC.ren.kpti[1]) / 2 + SRC.ren.tlbPcid, nopcid: SRC.ren.base + (SRC.ren.kpti[0] + SRC.ren.kpti[1]) / 2 + SRC.ren.tlbNoPcid };
  function sysCost(profile, work, batch) {
    const c = COST.cross[profile], per = work + c / batch, ns = per / COST.ghz;
    return { c, per, ns, ops: 1e9 / ns, share: (c / batch) / per, vsFn: per / (work + COST.fn), cNs: c / COST.ghz };
  }

  /* ── 04 handing work to a device: CPU time stalled on register accesses for N commands ──
     an uncached read of a device register waits for a PCIe round trip (taken as the measured 547 ns median); a posted
     write leaves the core without waiting (TUNED 20 ns to issue); a write to cached RAM is TUNED 1 ns. */
  const MMIO = { n: 64, R: SRC.pcie.median, W: 20, C: 1, descWords: 8, polls: [1, 2, 3, 5, 8, 12, 20], batches: [1, 2, 4, 8, 16, 32, 64] };
  function mmio(k, b) {
    const { n, R, W, C, descWords } = MMIO;
    const poll = { reads: n * k, writes: n, ns: n * (W + k * R) };                 // write command, read status k times
    const irq = { reads: n, writes: 2 * n, ns: n * (W + R + W) };                  // write command; handler reads cause, writes ack
    const db = Math.ceil(n / b);
    const ring = { reads: 0, writes: db, ns: n * descWords * C + db * W + n * C }; // descriptors to RAM, one doorbell per batch, completions from RAM
    return { poll, irq, ring, perCmd: { poll: poll.ns / n, irq: irq.ns / n, ring: ring.ns / n }, ratio: poll.ns / ring.ns };
  }

  /* ── 06 interrupts, polling and NAPI: a seeded discrete-event simulation of one core receiving packets ──
     p = protocol work per packet (TUNED from Arrakis's 1.26 µs "network stack in"); h = cost of taking one interrupt and
     waking the work (TUNED from Arrakis's 2.2 µs extra when the receiver was idle); q = one empty poll (TUNED 0.1 µs).
     irq: every packet interrupts (or, with coalescing, the first packet starts a timer and the handler takes what is
     there); poll: a core spins; napi: one interrupt, then polls of up to `budget` packets until the ring is empty. */
  const POLL = { p: SRC.arrakis.stackIn, h: SRC.arrakis.wake, q: 0.1, budget: SRC.nic.weight, events: 30000, seed: 11,
    rates: [1e3, 2e3, 5e3, 1e4, 2e4, 5e4, 1e5, 2e5, 3e5, 5e5, 7e5], coal: [0, 5, 10, 20, 50, 100], modes: ['irq', 'poll', 'napi'] };
  function pollSim(mode, rate, usecs, o) {
    o = Object.assign({}, POLL, o || {});
    const r = rng(o.seed), N = o.events, arr = new Float64Array(N);
    let t = 0; for (let i = 0; i < N; i++) { t += expo(r, rate / 1e6); arr[i] = t; }   // µs
    const T = arr[N - 1], lat = new Float64Array(N);
    let busy = 0, irqs = 0, free = 0, i = 0;
    if (mode === 'poll') {
      // the poller checks the ring every q when it is empty; a packet is seen at the end of the check in progress
      let now = 0;
      while (i < N) {
        if (arr[i] > now) { const k = Math.ceil((arr[i] - now) / o.q); now += k * o.q; }
        while (i < N && arr[i] <= now) { now += o.p; lat[i] = now - arr[i]; i++; }
      }
      busy = T;
    } else if (mode === 'irq' && !usecs) {
      for (; i < N; i++) { const s = Math.max(arr[i], free); free = s + o.h + o.p; busy += o.h + o.p; irqs++; lat[i] = free - arr[i]; }
    } else {
      // an interrupt is raised `usecs` after the first packet that finds it armed; the handler starts when the core is free
      while (i < N) {
        const fire = arr[i] + (usecs || 0), start = Math.max(fire, free);
        let now = start + o.h; busy += o.h; irqs++;
        if (mode === 'irq') {
          // the handler takes the packets that are there when it starts; later ones arm the next interrupt
          let j = i; while (j < N && arr[j] <= start) j++;
          for (; i < j; i++) { now += o.p; busy += o.p; lat[i] = now - arr[i]; }
        } else {
          // NAPI: poll rounds of up to `budget`, until a poll finds the ring empty; then re-arm the interrupt
          for (;;) {
            let k = 0;
            while (i < N && arr[i] <= now && k < o.budget) { now += o.p; busy += o.p; lat[i] = now - arr[i]; i++; k++; }
            now += o.q; busy += o.q;
            if (!(i < N && arr[i] <= now)) break;
          }
        }
        free = now;
      }
    }
    const span = Math.max(T, free);
    const sorted = Array.from(lat).sort((a, b) => a - b);
    const mean = sorted.reduce((s, x) => s + x, 0) / N;
    const cpu = mode === 'poll' ? 1 : busy / span, rho = rate * (o.h + o.p) / 1e6;
    return { mode, rate, usecs: usecs || 0, cpu: Math.min(1, cpu), irqsPerSec: irqs / span * 1e6, perIrq: N / Math.max(1, irqs), mean, p99: sorted[Math.floor(0.99 * (N - 1))],
      livelock: mode === 'irq' && !usecs && rho >= 1, rho, backlog: free > T * 1.02 };
  }
  // where interrupts stop being cheaper than spinning: the irq-per-packet core is fully busy at 1 / (h + p)
  const livelockRate = () => 1e6 / (POLL.h + POLL.p);

  /* ── 07 a receive descriptor ring: free-running 32-bit counters, capacity N (a power of two) ──
     Poisson arrivals at `rate` (packets/s); the driver is NAPI-like: an interrupt `d` after the first packet, then p per
     packet; every `period` the core is taken away for `stall` µs (TUNED: another task, a long softirq). A packet that
     finds prod − cons = N is dropped. The counters start near 2^32 so the wrap is visible; index = counter & (N − 1). */
  const RING = { sizes: [64, 128, 256, 512, 1024, 2048, 4096], rates: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7], stalls: [0, 100, 200, 300, 500, 800, 1000, 1500],
    d: 20, period: 2000, p: SRC.arrakis.stackIn, budget: SRC.nic.weight, ms: 20, start: 0xFFFFFF00, seed: 5 };
  function ringSim(N, rateM, stall, o) {
    o = Object.assign({}, RING, o || {});
    const r = rng(o.seed), horizon = o.ms * 1000, q = [];
    let prod = o.start >>> 0, cons = o.start >>> 0, drops = 0, arrived = 0, done = 0, latSum = 0, maxOcc = 0, doorbells = 0;
    let t = 0, cpuFree = 0, armed = true, irqAt = Infinity, polling = false;
    const trace = [];
    const stalledUntil = tm => { const ph = tm % o.period; return ph < stall ? tm - ph + stall : tm; };
    let next = expo(r, rateM);
    // event loop over arrivals and driver work, at most one packet of driver work per step
    while (t < horizon) {
      const tDrv = polling ? Math.max(cpuFree, t) : irqAt;
      if (next <= tDrv && next < horizon) {
        t = next; arrived++;
        if (((prod - cons) >>> 0) >= N) drops++; else { q.push(t); prod = (prod + 1) >>> 0; }
        const occ = (prod - cons) >>> 0; if (occ > maxOcc) maxOcc = occ;
        if (armed && !polling) { armed = false; irqAt = t + o.d; }
        next = t + expo(r, rateM);
      } else if (tDrv < horizon) {
        t = stalledUntil(tDrv);
        if (!polling) { polling = true; cpuFree = t; continue; }
        if (q.length) {
          const a = q.shift(); cons = (cons + 1) >>> 0; done++; t += o.p; latSum += t - a; cpuFree = t;
          if (done % o.budget === 0) doorbells++;
        } else { polling = false; armed = true; irqAt = Infinity; doorbells++; }
      } else break;
      if (trace.length < 4000 && (!trace.length || t - trace[trace.length - 1][0] >= horizon / 3000)) trace.push([t, (prod - cons) >>> 0]);
    }
    return { N, rateM, stall, arrived, drops, dropPct: arrived ? drops / arrived : 0, done, mean: done ? latSum / done : 0, maxOcc, prod, cons, iProd: prod & (N - 1), iCons: cons & (N - 1), doorbells, trace,
      need: Math.ceil(rateM * (stall + o.d)), cap: (1 - stall / o.period) / o.p, keepsUp: rateM <= (1 - stall / o.period) / o.p };
  }

  /* ── 09 the driver core: match → probe → bind, with -EPROBE_DEFER ──
     PCI: pci_match_one_id (drivers/pci/pci.h): each of vendor, device, subvendor, subdevice equal or PCI_ANY_ID, and
     !((id.class ^ dev.class) & id.class_mask). Device tree: __of_device_is_compatible scores a match by the position of
     the string in the node's compatible list (earlier is better), and __of_match_node keeps a driver's best entry.
     Binding (Documentation/driver-api/driver-model): when a driver registers, each unbound device on its bus is matched;
     on a match probe() runs; -EPROBE_DEFER puts the device on the deferred list; every successful bind retries it. */
  const ANY = 0xFFFFFFFF;
  const BIND = {
    devs: [
      { id: 'nic', bus: 'pci', vendor: 0x8086, device: 0x1533, subvendor: 0x8086, subdevice: 0x0001, cls: 0x020000 },
      { id: 'nvme', bus: 'pci', vendor: 0x144D, device: 0xA80A, subvendor: 0x144D, subdevice: 0xA801, cls: 0x010802 },
      { id: 'gpu', bus: 'pci', vendor: 0x10DE, device: 0x2684, subvendor: 0x10DE, subdevice: 0x16F1, cls: 0x030000 },
      { id: 'mmc', bus: 'platform', compatible: ['acme,soc-dwmmc', 'snps,dw-mshc'], needs: 'reg' },
      { id: 'reg', bus: 'platform', compatible: ['regulator-fixed'] }
    ],
    drvs: [
      { id: 'igb', bus: 'pci', ids: [{ vendor: 0x8086, device: 0x1533, subvendor: ANY, subdevice: ANY, cls: 0, mask: 0 }] },
      { id: 'nvme', bus: 'pci', ids: [{ vendor: ANY, device: ANY, subvendor: ANY, subdevice: ANY, cls: 0x010802, mask: 0xFFFFFF }] },
      { id: 'dwmmc', bus: 'platform', of: ['snps,dw-mshc'] },
      { id: 'regfixed', bus: 'platform', of: ['regulator-fixed'] }
    ],
    orders: { regfirst: ['igb', 'nvme', 'regfixed', 'dwmmc'], mmcfirst: ['igb', 'nvme', 'dwmmc', 'regfixed'] }
  };
  function pciMatch(id, d) {
    const eq = (a, b) => a === ANY || a === b;
    return eq(id.vendor, d.vendor) && eq(id.device, d.device) && eq(id.subvendor, d.subvendor) && eq(id.subdevice, d.subdevice) && !(((id.cls ^ d.cls) & id.mask) >>> 0);
  }
  function ofScore(drv, d) { let best = -1; for (const s of drv.of) { const i = d.compatible.indexOf(s); if (i >= 0 && (best < 0 || i < best)) best = i; } return best; }
  function matches(drv, d) { if (drv.bus !== d.bus) return { ok: false }; if (d.bus === 'pci') return { ok: drv.ids.some(id => pciMatch(id, d)) }; const s = ofScore(drv, d); return { ok: s >= 0, index: s }; }
  function bind(order, loaded) {
    const seq = BIND.orders[order].filter(k => loaded[k] !== false), state = {}, log = [], deferred = [];
    BIND.devs.forEach(d => { state[d.id] = { drv: null, st: 'none' }; });
    const tryProbe = (drv, d) => {
      log.push({ ev: 'match', drv: drv.id, dev: d.id });
      if (d.needs && !(state[d.needs].st === 'bound')) { state[d.id] = { drv: drv.id, st: 'deferred' }; if (!deferred.includes(d.id)) deferred.push(d.id); log.push({ ev: 'defer', drv: drv.id, dev: d.id }); return false; }
      state[d.id] = { drv: drv.id, st: 'bound' }; log.push({ ev: 'bound', drv: drv.id, dev: d.id });
      const di = deferred.indexOf(d.id); if (di >= 0) deferred.splice(di, 1);
      // driver_deferred_probe_trigger(): retry everything that deferred
      for (const id of deferred.slice()) { const dd = BIND.devs.find(x => x.id === id), dv = BIND.drvs.find(x => x.id === state[id].drv); log.push({ ev: 'retry', drv: dv.id, dev: id }); tryProbe(dv, dd); }
      return true;
    };
    for (const k of seq) {
      const drv = BIND.drvs.find(x => x.id === k); log.push({ ev: 'register', drv: k });
      for (const d of BIND.devs) if (state[d.id].st === 'none' && matches(drv, d).ok) tryProbe(drv, d);
    }
    for (const d of BIND.devs) if (state[d.id].st === 'none') log.push({ ev: 'nodrv', dev: d.id });
    const bound = BIND.devs.filter(d => state[d.id].st === 'bound').length;
    return { state, log, bound, deferredLeft: deferred.slice(), unbound: BIND.devs.filter(d => state[d.id].st === 'none').map(d => d.id) };
  }

  /* ── 10 one read() through the stack (µs) ──
     steps from Lee et al. Figure 4(a) (Optane, 4 KB); the remainder of their 12.82 µs total is shown as one step
     ("interrupt and the rest"); syscall entry and return from Arrakis Table 1 (another machine, said on the page);
     other device times TUNED as orders of magnitude (NAND flash ~80 µs, a disk ~4 ms). */
  const L = SRC.lee;
  const READ = {
    devices: { optane: L.device, nand: 80, hdd: 4000 },
    rest: +(L.total - (L.lookup + L.lba + L.alloc + L.insert + L.bio + L.dmaMap + L.submit + L.device + L.complete + L.dmaUnmap + L.ctx + L.copy)).toFixed(2),
    modes: ['hit', 'miss', 'direct', 'polled'], hits: [0, 10, 25, 50, 75, 90, 95, 99, 100]
  };
  function readSteps(mode, dev) {
    const D = READ.devices[dev], A = SRC.arrakis;
    const s = [['enter', A.sys, 'cpu', 'vfs']];
    if (mode === 'hit') s.push(['lookup', L.lookup, 'cpu', 'pc'], ['copy', L.copy, 'cpu', 'pc']);
    else {
      if (mode === 'miss') s.push(['lookup', L.lookup, 'cpu', 'pc'], ['alloc', L.alloc, 'cpu', 'pc']);
      s.push(['lba', L.lba, 'cpu', 'fs']);
      if (mode === 'miss') s.push(['insert', L.insert, 'cpu', 'pc']);
      s.push(['bio', L.bio, 'cpu', 'blk'], ['dmamap', L.dmaMap, 'cpu', 'drv'], ['submit', L.submit, 'cpu', 'drv'], ['device', D, mode === 'polled' ? 'spin' : 'dev', 'dev']);
      if (mode !== 'polled') s.push(['rest', READ.rest, 'cpu', 'irq']);
      s.push(['complete', L.complete, 'cpu', 'blk'], ['dmaunmap', L.dmaUnmap, 'cpu', 'drv']);
      if (mode !== 'polled') s.push(['ctx', L.ctx, 'cpu', 'sched']);
      if (mode === 'miss') s.push(['copy', L.copy, 'cpu', 'pc']);
    }
    s.push(['ret', A.ret, 'cpu', 'vfs']);
    return s;
  }
  function readTrace(mode, dev, hitPct) {
    const s = readSteps(mode, dev), total = s.reduce((a, x) => a + x[1], 0), cpu = s.filter(x => x[2] !== 'dev').reduce((a, x) => a + x[1], 0);
    const dv = s.filter(x => x[0] === 'device').reduce((a, x) => a + x[1], 0);
    const hit = readSteps('hit', dev).reduce((a, x) => a + x[1], 0), miss = readSteps('miss', dev).reduce((a, x) => a + x[1], 0);
    const h = (hitPct == null ? 0 : hitPct) / 100, avg = h * hit + (1 - h) * miss;
    return { steps: s, total, cpu, device: dv, soft: total - dv, softShare: (total - dv) / total, hit, miss, avg, ratio: miss / hit };
  }

  /* ── 11 syscalls per I/O: blocking read, epoll, io_uring, io_uring with SQPOLL ──
     per I/O: crossings × (ch3 crossing cost) + context switches × 0.95 µs (Lee) + w of real work (TUNED from Arrakis
     1.26 µs); k = I/Os ready or batched per call. */
  const ASYNC = { apis: ['block', 'epoll', 'uring', 'sqpoll'], ks: [1, 2, 4, 8, 16, 32, 64], w: SRC.arrakis.stackIn, ctx: L.ctx };
  function asyncIo(api, k, profile) {
    const cNs = COST.cross[profile || 'pcid'] / COST.ghz / 1000; // µs per crossing
    const sys = api === 'block' ? 1 : api === 'epoll' ? 1 + 1 / k : api === 'uring' ? 1 / k : 0;
    const ctx = api === 'block' ? 1 : api === 'sqpoll' ? 0 : 1 / k;
    const us = sys * cNs + ctx * ASYNC.ctx + ASYNC.w;
    const cores = api === 'sqpoll' ? 2 : 1;
    return { api, k, sys, ctx, us, iops: 1e6 / us, overShare: (us - ASYNC.w) / us, cores, perCore: 1e6 / us / cores };
  }

  /* ── numbers quoted in the prose: [value, decimals, kind] ── */
  let PROSE_CACHE = null;
  function prose() {
    if (PROSE_CACHE) return PROSE_CACHE;
    const R = SRC.ren, F = SRC.flexsc;
    const c1 = sysCost('pcid', 200, 1), c32 = sysCost('pcid', 200, 32), cN = sysCost('nopcid', 200, 1), c0 = sysCost('none', 200, 1);
    const m = mmio(5, 16);
    const pI = pollSim('irq', 2e5, 0), pN = pollSim('napi', 2e5, 0), pP = pollSim('poll', 2e5, 0), pN1 = pollSim('napi', 1e4, 0), pI1 = pollSim('irq', 1e4, 0), pI3 = pollSim('irq', 3e5, 0), pN3 = pollSim('napi', 3e5, 0), pC = pollSim('irq', 1e4, 50);
    const g0 = ringSim(256, 0.5, 500), g1 = ringSim(512, 0.5, 500), g2 = ringSim(256, 0.5, 0);
    const b1 = bind('regfirst', {}), b2 = bind('mmcfirst', {});
    const rH = readTrace('hit', 'optane'), rM = readTrace('miss', 'optane'), rD = readTrace('direct', 'optane'), rP = readTrace('polled', 'optane'), rN = readTrace('miss', 'nand'), r90 = readTrace('miss', 'optane', 90);
    const aB = asyncIo('block', 32), aE = asyncIo('epoll', 32), aU = asyncIo('uring', 32), aS = asyncIo('sqpoll', 32);
    PROSE_CACHE = {
      // ch2
      nrRead: [SRC.abi.x86.calls.read, 0], nrReadA: [SRC.abi.arm.calls.read, 0], nrUring: [SRC.abi.x86.calls.io_uring_enter, 0], sysMax: [SRC.abi.x86.max, 0],
      // ch3
      fxIn: [F.enter, 0], fxOut: [F.leave, 0], fxTot: [F.total, 0], fxMiss: [F.miss, 0], fxRec: [F.recover, 0],
      rBase: [R.base, 0], rK0: [R.kpti[0], 0], rK1: [R.kpti[1], 0], rCr3: [R.cr3, 0], rTlb: [R.tlbNoPcid, 0], rTlbP: [R.tlbPcid, 0], rReadNs: [R.readNs, 0], rSlowN: [R.slowNoPcid, 0], rSlowP: [R.slowPcid, 0], rAvg: [R.kptiAvg, 0], rPoll: [R.retPoll, 0], rEpoll: [R.retEpoll, 0],
      cPcid: [c1.c, 0], cNo: [cN.c, 0], c1Share: [c1.share, 0, 'pct'], c32Share: [c32.share, 0, 'pct'], c1Fn: [c1.vsFn, 1], c1Ns: [c1.ns, 0], c0Ns: [c0.ns, 0], cNNs: [cN.ns, 0], cPcidNs: [c1.cNs, 0],
      // ch4
      pcieMed: [SRC.pcie.median, 0], pcieMin: [SRC.pcie.min, 0], pcieMax: [SRC.pcie.max, 0], mPoll: [m.perCmd.poll / 1000, 2], mIrq: [m.perCmd.irq, 0], mRing: [m.perCmd.ring, 0], mRatio: [m.ratio, 0], mN: [MMIO.n, 0],
      // ch6
      pP: [POLL.p, 2], pH: [POLL.h, 1], pLive: [livelockRate() / 1000, 0], pIcpu: [pI.cpu, 0, 'pct'], pNcpu: [pN.cpu, 0, 'pct'], pNper: [pN.perIrq, 1], pPlat: [pP.mean, 1], pIlat: [pI.mean, 1], pNlat: [pN.mean, 1],
      pN1cpu: [pN1.cpu, 1, 'pct'], pI1cpu: [pI1.cpu, 1, 'pct'], pI3lat: [pI3.mean / 1000, 1], pN3cpu: [pN3.cpu, 0, 'pct'], pCirq: [pC.irqsPerSec, 0], pI1irq: [pI1.irqsPerSec, 0], pClat: [pC.mean, 0], pI1lat: [pI1.mean, 1],
      weight: [SRC.nic.weight, 0], itrB: [SRC.nic.itrBulk, 0], itrL: [SRC.nic.itrLow, 0],
      // ch7
      rxDef: [SRC.nic.rxDefault, 0], rxMax: [SRC.nic.rxMax, 0], descB: [SRC.nic.descBytes, 0], g0drop: [g0.dropPct, 1, 'pct'], g0need: [g0.need, 0], g1drop: [g1.dropPct, 0, 'pct'], g2occ: [g2.maxOcc, 0], gD: [RING.d, 0], gCap: [ringSim(512, 0.5, 1000).cap, 2], gPeriod: [RING.period / 1000, 0],
      // ch9
      b1bound: [b1.bound, 0], b2retry: [b2.log.filter(x => x.ev === 'retry').length, 0],
      // ch10
      leeTot: [L.total, 2], leeDev: [L.device, 2], leeCtx: [L.ctx, 2], leeCopy: [L.copy, 2], leeBio: [L.bio, 2], leeRest: [READ.rest, 2], leeMap: [L.dmaMap, 2], leeUnmap: [L.dmaUnmap, 2],
      rHit: [rH.total, 2], rMiss: [rM.total, 2], rDirect: [rD.total, 2], rPolled: [rP.total, 2], rRatio: [rM.ratio, 0], rSoft: [rM.softShare, 0, 'pct'], rNsoft: [rN.softShare, 0, 'pct'], r90: [r90.avg, 2],
      // ch11
      aBsys: [aB.sys, 0], aEsys: [aE.sys, 2], aUsys: [aU.sys, 3], aBiops: [aB.iops / 1000, 0], aUiops: [aU.iops / 1000, 0], aSiops: [aS.iops / 1000, 0], aScore: [aS.perCore / 1000, 0],
      axPoll: [SRC.axboe.poll / 1e6, 1], axIrq: [SRC.axboe.irq / 1e6, 1], axAio: [SRC.axboe.aio / 1000, 0], axNopLo: [SRC.axboe.nopLo / 1e6, 0], axNopHi: [SRC.axboe.nopHi / 1e6, 0], axMax: [SRC.axboe.maxEntries, 0],
      // ch12
      arTot: [SRC.arrakis.total, 2], arStack: [SRC.arrakis.stackIn, 2], arN: [SRC.arrakis.arrN, 2], arP: [SRC.arrakis.arrP, 2], arIdle: [SRC.arrakis.idle, 2], haasIops: [SRC.haas.iops / 1e6, 1], haasBud: [SRC.haas.budget, 0], haasSpdk: [SRC.haas.spdk, 0], haasPoll: [SRC.haas.poll, 0], haasIrq: [SRC.haas.irqIops / 1e6, 0], haasIrqT: [SRC.haas.irqThreads, 0],
      // ch13
      gShare: [SRC.google.share, 0]
    };
    return PROSE_CACHE;
  }

  /* ── formatting ── */
  function fmt(x, d, lang) {
    if (x == null || !isFinite(x)) return '—';
    const s = (d == null ? (Math.abs(x) >= 100 ? 0 : Math.abs(x) >= 10 ? 1 : 2) : d);
    const k = Math.pow(10, s); x = Math.sign(x) * Math.round(Math.abs(x) * k * (1 + 1e-12)) / k;
    return Number(x).toLocaleString(lang === 'en' ? 'en-US' : 'zh-CN', { minimumFractionDigits: s, maximumFractionDigits: s });
  }
  function fmtKind(v, kind) { if (kind === 'hex') return hex(v, 8); if (kind === 'str') return String(v); return null; }

  /* ── live sentences: each returns { key } ── */
  const say = {
    priv(arch, level, op, grant) { const r = priv(arch, level, op, grant); return { key: 'ch1.say.' + arch + '.' + op + '.' + (r.res === 'ok' && grant && (level === 'r3' || level === 'el0') && (op === 'in' || op === 'mmio') ? 'granted' : r.res) }; },
    abi(arch) { return { key: 'ch2.say.' + arch }; },
    cost(r, batch) { if (r.share >= 0.5) return { key: batch > 1 ? 'ch3.say.mostBatch' : 'ch3.say.most' }; if (r.share >= 0.1) return { key: 'ch3.say.some' }; return { key: 'ch3.say.little' }; },
    mmio(k, b) { return { key: b === 1 ? 'ch4.say.b1' : 'ch4.say.ok' }; },
    poll(r) { if (r.mode === 'irq') return { key: r.livelock ? 'ch6.say.irqLive' : r.usecs ? 'ch6.say.irqCoal' : r.cpu > 0.5 ? 'ch6.say.irqBusy' : 'ch6.say.irq' }; if (r.mode === 'poll') return { key: r.rate >= 7e5 ? 'ch6.say.pollFull' : 'ch6.say.poll' }; return { key: r.rate >= 7e5 ? 'ch6.say.napiFull' : r.perIrq >= 2 ? 'ch6.say.napiBatch' : 'ch6.say.napi' }; },
    ring(r) { if (!r.keepsUp) return { key: 'ch7.say.over' }; if (r.drops) return { key: 'ch7.say.drop' }; if (r.maxOcc > r.N / 2) return { key: 'ch7.say.close' }; return { key: 'ch7.say.ok' }; },
    bind(b) { if (b.deferredLeft.length) return { key: 'ch9.say.stuck' }; if (b.log.some(x => x.ev === 'retry')) return { key: 'ch9.say.retry' }; if (b.unbound.length > 1) return { key: 'ch9.say.missing' }; return { key: 'ch9.say.ok' }; },
    read(mode) { return { key: 'ch10.say.' + mode }; },
    async(api) { return { key: 'ch11.say.' + api }; }
  };

  return { SRC, FRONTIER, rng, hex, PRIV, priv, ABI, abi, COST, sysCost, MMIO, mmio, POLL, pollSim, livelockRate, RING, ringSim, ANY, BIND, pciMatch, ofScore, matches, bind,
    READ, readSteps, readTrace, ASYNC, asyncIo, prose, fmt, fmtKind, say };
});
