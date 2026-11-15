'use strict';
// Pins the page's models: the privilege table against the SDM / Arm rules as written in models.js; the syscall ABI
// against syscall(2) and the two syscall tables; the crossing-cost arithmetic against Ren et al.; the register-access
// counts; the interrupt / polling / NAPI simulation (livelock threshold, batching, coalescing); the descriptor ring
// (free-running counters, the need-and-capacity rule); match / probe / bind with -EPROBE_DEFER against pci_match_one_id
// and the compatible scoring; the read path sums against Lee et al.'s Figure 4(a); syscalls per I/O; the sourced and
// frontier figures typed again from their sources; every number the prose quotes (placeholders filled from prose(),
// literals checked against models.js); every live sentence branch; copy keys, language hygiene, the registry, links to
// live siblings and the sibling essays' aliases.
// Run: node computing/systems/how-the-os-talks-to-hardware/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const ROOT = path.join(DIR, '..', '..', '..');
const SLUG = 'how-the-os-talks-to-hardware';
const M = require(path.join(DIR, 'models.js'));
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;
const html = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(DIR, 'app.js'), 'utf8');
const { SRC, FRONTIER } = M;

let n = 0, fails = 0;
function check(name, got, want) { n++; if (got !== want) { fails++; console.error(`FAIL ${name}: model gives ${got}, expected ${want}`); } }
function within(name, got, lo, hi) { n++; if (!(got >= lo && got <= hi)) { fails++; console.error(`FAIL ${name}: ${got} not in [${lo}, ${hi}]`); } }
function says(key, phrase) { n++; if (!Z[key] || !Z[key].includes(phrase)) { fails++; console.error(`FAIL prose ${key} should contain "${phrase}"`); } }
const f = (x, d) => x.toFixed(d);
const P = M.prose();

/* ── sourced figures, typed again from the sources (BRIEF.md lists URL and date) ── */
{
  check('FlexSC: 79 in, 71 out, 150, L3 miss 250, 14000 to recover', Object.values(SRC.flexsc).join(), '79,71,150,250,14000');
  check('Ren: 2.4 GHz, <100, 400–500, CR3 200, TLB 700 / 30, read 344 ns +113 % / +47 %, avg 22 %, retpoline 89 / 72',
    [SRC.ren.ghz, SRC.ren.base, SRC.ren.kpti.join('-'), SRC.ren.cr3, SRC.ren.tlbNoPcid, SRC.ren.tlbPcid, SRC.ren.readNs, SRC.ren.slowNoPcid, SRC.ren.slowPcid, SRC.ren.kptiAvg, SRC.ren.retPoll, SRC.ren.retEpoll].join(), '2.4,100,400-500,200,700,30,344,113,47,22,89,72');
  check('Neugebauer 64 B DMA read: 520 / 547 / 947 ns', [SRC.pcie.min, SRC.pcie.median, SRC.pcie.max].join(), '520,547,947');
  check('Arrakis Table 1 Linux column', Object.values(SRC.arrakis).join(), '1.26,1.05,0.17,0.24,0.44,0.1,0.1,3.36,6.19,2.2,1.44,0.38');
  check('Arrakis Linux in-path sums to 3.36', f(['stackIn', 'stackOut', 'sched', 'copyIn', 'copyOut', 'ret', 'sys'].reduce((a, k) => a + SRC.arrakis[k], 0), 2), '3.36');
  check('Lee Fig 4(a) values', Object.values(SRC.lee).join(), '12.82,7.26,0.3,0.09,0.19,0.33,0.72,0.29,0.37,0.81,0.23,0.95,0.21');
  check('Lee: labelled steps < total, remainder 1.07', f(M.READ.rest, 2), '1.07');
  check('Axboe: 1.7 M polled, 1.2 M irq, libaio 608 K, no-op 12–20 M, 4096 entries', [SRC.axboe.poll, SRC.axboe.irq, SRC.axboe.aio, SRC.axboe.nopLo, SRC.axboe.nopHi, SRC.axboe.maxEntries].join(), '1700000,1200000,608000,12000000,20000000,4096');
  check('Haas & Leis: 12.5 M IOPS, 13k cycles, SPDK 3, polled 16, irq 10 M with 32', Object.values(SRC.haas).join(), '12500000,13000,3,16,10000000,32');
  check('Haas budget = 2.5 GHz × 64 / 12 M ≈ 13k', Math.round(2.5e9 * 64 / 12e6 / 1000), 13);
  check('e1000 RxDescriptors 256 (48–4096), 16 B; e1000e ITR 4000 / 20000; dev_weight 64', Object.values(SRC.nic).join(), '256,48,4096,16,4000,20000,64');
  check('x86-64 syscall table: read 0, write 1, getpid 39, openat 257, io_uring_enter 426; max 472 (fchroot)', [...Object.values(SRC.abi.x86.calls), SRC.abi.x86.max].join(), '0,1,39,257,426,472');
  check('generic table (arm64): read 63, write 64, getpid 172, openat 56, io_uring_enter 426', Object.values(SRC.abi.arm.calls).join(), '63,64,172,56,426');
  check('syscall(2) x86-64: rax; rdi rsi rdx r10 r8 r9; ret rax', [SRC.abi.x86.nr, SRC.abi.x86.args.join(' '), SRC.abi.x86.ret].join('|'), 'rax|rdi rsi rdx r10 r8 r9|rax');
  check('syscall(2) arm64: svc #0, x8; x0–x5; ret x0', [SRC.abi.arm.insn, SRC.abi.arm.nr, SRC.abi.arm.args.join(' '), SRC.abi.arm.ret].join('|'), 'svc #0|x8|x0 x1 x2 x3 x4 x5|x0');
  check('IA32_LSTAR C0000082H, IA32_FMASK C0000084H', [SRC.sdm.lstar, SRC.sdm.fmask].map(x => x.toString(16)).join(), 'c0000082,c0000084');
  check('Google 2023-06-14: 60 %, ~1 M USD', [SRC.google.share, SRC.google.paidM, SRC.google.date].join(), '60,1,2023-06-14');
  const F = FRONTIER;
  check('as of 2026-11: 7.4-rc2, stable 7.3.4', [F.asOf, F.kernel.rc, F.kernel.stable].join(), '2026-11,7.4-rc2,7.3.4');
  check('Rust: summit 2025-12-10, Binder 6.18, C removed by 7.4', [F.rust.summit, F.rust.binder, F.rust.cRemoved].join(), '2025-12-10,6.18,7.4');
  check('virtio 1.2 CS01 2022-07-01, 1.3 CSD01 2023-10-06', [F.virtio.cs12, F.virtio.csd13].join(), '2022-07-01,2023-10-06');
  // the same dates and figures as written in the prose
  for (const [k, s] of [['ch2.p2', '7.4-rc2'], ['ch13.e1', '7.4-rc2'], ['ch13.e1', '7.3.4'], ['ch13.d1', '2023 年 6 月 14 日'], ['ch13.d1', '约 100 万美元'],
    ['ch13.d2', '2025 年 12 月 10 日'], ['ch13.d2', 'Linux 6.18'], ['ch13.d2', '到 7.4-rc2'], ['ch13.d3', '2022 年 7 月'], ['ch13.d3', '2023 年 10 月'],
    ['ch13.c2', '2026 年 9 月 19 日'], ['ch12.p4', '2022 年 7 月'], ['ch13.law', '墙还在原地']]) says(k, s);
  says('ch13.title', '2026 年 11 月');
  // the ABI the prose spells out
  says('ch2.p3', 'RCX'); says('ch2.p3', 'R11'); says('ch2.p3', 'IA32_LSTAR'); says('ch2.p3', 'IA32_FMASK'); says('ch2.p3', '不保存栈指针');
  // vectors and ports
  says('ch5.p2', '0 到 31 号留给异常'); says('ch5.p2', '缺页是 14 号'); says('ch5.p2', '#GP 是 13 号'); says('ch5.p2', '32 号以上');
  says('ch4.p2', '0x60'); says('ch4.p2', '0x3F8'); says('ch4.p2', '0xCF8 和 0xCFC');
  says('ch9.p2', '类别码 0x010802，掩码 0xFFFFFF');
  check('nvme class match uses 0x010802 / 0xFFFFFF', [M.BIND.drvs[1].ids[0].cls, M.BIND.drvs[1].ids[0].mask].map(x => '0x' + x.toString(16).toUpperCase()).join(), '0x10802,0xFFFFFF');
  // the model count in the description is the number of model sections on the page
  const nModels = Object.keys(Z).filter(k => /^ch\d+\.model\.title$/.test(k)).length;
  check('nine model sections', nModels, 9); says('doc.desc', '九个可以动手的模型');
}

/* ── 01 the wall ── */
{
  const R = (a, l, o, g) => M.priv(a, l, o, g).res;
  check('x86 ring 3: load ok, kload #PF, in #GP, mmio #PF, hlt #GP, cr3 #GP, syscall enters', M.PRIV.ops.x86.map(o => R('x86', 'r3', o, false)).join(), 'ok,pf,gp,pf,gp,gp,enter');
  check('x86 ring 0: everything runs, syscall not needed', M.PRIV.ops.x86.map(o => R('x86', 'r0', o, false)).join(), 'ok,ok,ok,ok,ok,ok,kernel');
  check('x86 ring 3 granted: in and mmio run, hlt / cr3 / kload still trap', ['in', 'mmio', 'hlt', 'cr3', 'kload'].map(o => R('x86', 'r3', o, true)).join(), 'ok,ok,gp,gp,pf');
  check('Arm EL0: load ok, kload abort, mmio abort, msr undefined, svc enters', M.PRIV.ops.arm.map(o => R('arm', 'el0', o, false)).join(), 'ok,abort,abort,undef,enter');
  check('Arm EL0 granted: mmio runs, msr still undefined', ['mmio', 'msr'].map(o => R('arm', 'el0', o, true)).join(), 'ok,undef');
  check('Arm has no port I/O', R('arm', 'el0', 'in', false), 'na');
  check('signals: #GP/#PF/abort SIGSEGV, undefined SIGILL', [M.priv('x86', 'r3', 'hlt').sig, M.priv('x86', 'r3', 'kload').sig, M.priv('arm', 'el0', 'kload').sig, M.priv('arm', 'el0', 'msr').sig].join(), 'SIGSEGV,SIGSEGV,SIGSEGV,SIGILL');
  check('seven x86 operations in the table', M.PRIV.ops.x86.length, 7); says('ch1.limit', '七种操作');
}

/* ── 02 the ABI ── */
{
  const r = M.abi('x86', 'read');
  check('x86 read: rax=0, rdi rsi rdx, syscall', r.regs.map(x => x[0] + '=' + x[1]).join(' '), 'rax=0 rdi=3 rsi=0x7ffd5e2c1000 rdx=4096');
  check('x86 io_uring_enter uses r10 for the 4th argument', M.abi('x86', 'io_uring_enter').regs[4][0], 'r10');
  check('arm read: x8=63, x0..x2', M.abi('arm', 'read').regs.map(x => x[0] + '=' + x[1]).join(' '), 'x8=63 x0=3 x1=0x7ffd5e2c1000 x2=4096');
  check('getpid takes no arguments', M.abi('x86', 'getpid').nargs, 0);
  check('io_uring_enter has the same number on both tables', M.abi('x86', 'io_uring_enter').nr === M.abi('arm', 'io_uring_enter').nr, true);
}

/* ── 03 crossing cost ── */
{
  check('crossing cycles: none 100, pcid 100 + 450 + 30, nopcid 100 + 450 + 700', [M.COST.cross.none, M.COST.cross.pcid, M.COST.cross.nopcid].join(), '100,580,1250');
  const r = M.sysCost('pcid', 200, 1);
  check('pcid, 200 cycles, batch 1: share = 580 / 780', f(r.share, 6), f(580 / 780, 6));
  check('ns = cycles / 2.4', f(r.ns, 6), f(780 / 2.4, 6));
  check('batch 32 amortises: share = (580/32) / (200 + 580/32)', f(M.sysCost('pcid', 200, 32).share, 6), f((580 / 32) / (200 + 580 / 32), 6));
  check('share falls monotonically with batch', M.COST.batches.map(b => M.sysCost('nopcid', 200, b).share).every((s, i, a) => !i || s < a[i - 1]), true);
  check('TUNED function call 5 cycles', M.COST.fn, 5); says('ch3.tuned', '5 个周期'); says('ch3.tuned', '400 到 500');
  says('ch3.p3', '200 个周期的工作'); says('ch3.p3', '把批量拉到 32');
  check('default work 200, batch 32 index', [M.COST.works[2], M.COST.batches[5]].join(), '200,32');
  check('html default scW = 200 cycles', /id="scW" min="0" max="8" step="1" value="2"/.test(html), true);
  check('ch3 law: a bare crossing (FlexSC 150) is shorter than an L3 miss (250)', SRC.flexsc.total < SRC.flexsc.miss, true);
}

/* ── 04 register accesses ── */
{
  const r = M.mmio(3, 1);
  check('poll: 64 × (20 + 3 × 547)', r.poll.ns, 64 * (20 + 3 * 547));
  check('irq: 64 × (20 + 547 + 20)', r.irq.ns, 64 * 587);
  check('ring b=1: 64 × 8 + 64 × 20 + 64', r.ring.ns, 64 * 8 + 64 * 20 + 64);
  check('ring reads no device register', M.MMIO.batches.every(b => M.mmio(3, b).ring.reads === 0), true);
  check('order poll > irq > ring at every b once status is read twice or more', M.MMIO.polls.filter(k => k >= 2).every(k => M.MMIO.batches.every(b => { const q = M.mmio(k, b); return q.perCmd.poll > q.perCmd.irq && q.perCmd.irq > q.perCmd.ring; })), true);
  // sensitivity claimed in ch4.tuned: doubling the TUNED write costs keeps the order
  { const W0 = M.MMIO.W, C0 = M.MMIO.C; M.MMIO.W = 40; M.MMIO.C = 2;
    check('W, C doubled: order unchanged', M.MMIO.polls.filter(k => k >= 2).every(k => M.MMIO.batches.every(b => { const q = M.mmio(k, b); return q.perCmd.poll > q.perCmd.irq && q.perCmd.irq > q.perCmd.ring; })), true);
    M.MMIO.W = W0; M.MMIO.C = C0; }
  check('default sliders k = 5, b = 16 (the prose says 默认下)', [M.MMIO.polls[3], M.MMIO.batches[4], /id="mmK" min="0" max="6" step="1" value="3"/.test(html), /id="mmB" min="0" max="6" step="1" value="4"/.test(html)].join(), '5,16,true,true'); says('ch4.p4', '默认下');
  check('TUNED 20 ns write, 1 ns RAM write', [M.MMIO.W, M.MMIO.C].join(), '20,1'); says('ch4.tuned', '20 纳秒'); says('ch4.tuned', '1 纳秒'); says('ch4.tuned', '先后顺序不变');
}

/* ── 06 interrupts, polling, NAPI ── */
{
  check('livelock rate = 1e6 / (2.2 + 1.26)', f(M.livelockRate(), 3), f(1e6 / 3.46, 3));
  const at = (m, r, u, o) => M.pollSim(m, r, u, o);
  check('irq below the threshold: not livelocked', at('irq', 2e5, 0).livelock, false);
  check('irq above the threshold: livelocked', at('irq', 3e5, 0).livelock, true);
  check('poll: always one core', at('poll', 1e3, 0).cpu, 1);
  within('napi batches at 200k (about 2 per interrupt)', at('napi', 2e5, 0).perIrq, 1.9, 2.1);
  check('k = 1: one status read costs less than an interrupt (one read either way)', M.mmio(1, 1).perCmd.poll < M.mmio(1, 1).perCmd.irq, true);
  check('napi never livelocks across the grid', M.POLL.rates.every(r => !at('napi', r, 0).livelock), true);
  check('irq cpu rises with rate', M.POLL.rates.map(r => at('irq', r, 0).cpu).every((c, i, a) => !i || c >= a[i - 1]), true);
  check('coalescing 50 µs at 10k cuts interrupts', at('irq', 1e4, 50).irqsPerSec < at('irq', 1e4, 0).irqsPerSec / 1.4, true);
  says('ch6.p3', '每秒 20 万个包'); says('ch6.p3', '每秒 1 万'); says('ch6.p3', '每秒 30 万'); says('ch6.p4', '等 50 微秒');
  check('default rate slider = 200k', M.POLL.rates[7], 2e5); check('html default plR', /id="plR" min="0" max="10" step="1" value="7"/.test(html), true);
  check('p3 rates are on the slider', [1e4, 3e5].every(r => M.POLL.rates.includes(r)), true); check('50 µs on the coalescing slider', M.POLL.coal.includes(50), true);
  // ch6.tuned sensitivity claims
  check('h doubled: livelock rate ≈ six tenths', f(1e6 / (2 * M.POLL.h + M.POLL.p) / M.livelockRate(), 1), '0.6'); says('ch6.tuned', '六成');
  { const d = at('poll', 2e5, 0, { q: 0.2 }).mean - at('poll', 2e5, 0).mean; within('q doubled: poll mean +~0.05 µs', d, 0.03, 0.07); }
  says('ch6.tuned', '0.05 微秒'); says('ch6.tuned', '0.1 微秒'); says('ch6.tuned', '那 2.2 微秒'); check('q = 0.1 TUNED', M.POLL.q, 0.1);
}

/* ── 07 descriptor ring ── */
{
  const r = M.ringSim(256, 0.5, 500);
  check('counters are free-running 32-bit: started at 0xFFFFFF00 and wrapped', r.prod < 0x10000 && r.cons < 0x10000, true);
  check('index = counter & (N − 1)', [r.iProd, r.iCons].join(), [r.prod & 255, r.cons & 255].join());
  check('occupancy never exceeds N', M.RING.sizes.every(N => M.ringSim(N, 0.7, 1500).maxOcc <= N), true);
  check('arrived = done + drops + still in ring', r.arrived, r.done + r.drops + ((r.prod - r.cons) >>> 0));
  check('need = ceil(rate × (stall + 20))', r.need, Math.ceil(0.5 * 520));
  check('512 slots at 500 µs: no drops', M.ringSim(512, 0.5, 500).drops, 0);
  { const q = M.ringSim(4096, 0.5, 1000), peaks = [4, 8, 12, 16, 20].map(ms => Math.max(...q.trace.filter(([t]) => t < ms * 1000 && t >= ms * 1000 - 2000).map(x => x[1])));
    check('1 ms stalls at 0.5 M/s: capacity below arrivals, every period peaks higher than the last', [q.keepsUp, peaks.every((v, i, a) => !i || v > a[i - 1])].join(), 'false,true');
    check('1 ms stalls: 512 slots drop', M.ringSim(512, 0.5, 1000).drops > 0, true);
    check('1 ms stalls: the over sentence even before the big ring drops', M.say.ring(q).key, 'ch7.say.over'); }
  check('capacity at 1 ms = 0.5 / 1.26', f(M.ringSim(256, 0.5, 1000).cap, 4), f(0.5 / 1.26, 4));
  says('ch7.p4', '每秒 50 万个包'); says('ch7.p4', '500 微秒'); says('ch7.p4', '512 格'); says('ch7.p4', '1 毫秒'); says('ch7.p4', '0.5 百万');
  check('defaults: 256 slots, 0.5, 500 µs', [M.RING.sizes[2], M.RING.rates[4], M.RING.stalls[4]].join(), '256,0.5,500');
  for (const [id, v] of [['rgN', 2], ['rgR', 4], ['rgS', 4]]) check('html default ' + id, new RegExp(`id="${id}" min="0" max="\\d+" step="1" value="${v}"`).test(html), true);
  check('d doubled: need +10', Math.ceil(0.5 * (500 + 40)) - r.need, 10); says('ch7.tuned', '只多 10 格');
  says('ch7.tuned', '1.26 微秒'); check('ring p = Arrakis 1.26', M.RING.p, 1.26);
}

/* ── 09 match, probe, bind ── */
{
  const D = id => M.BIND.devs.find(d => d.id === id), V = id => M.BIND.drvs.find(d => d.id === id);
  check('igb matches the NIC by vendor:device', M.pciMatch(V('igb').ids[0], D('nic')), true);
  check('nvme matches any NVMe by class', M.pciMatch(V('nvme').ids[0], D('nvme')), true);
  check('nvme does not take the NIC', M.pciMatch(V('nvme').ids[0], D('nic')), false);
  check('no driver for the GPU', M.BIND.drvs.some(v => M.matches(v, D('gpu')).ok), false);
  check('dw_mmc matches the second compatible string (index 1)', M.ofScore(V('dwmmc'), D('mmc')), 1);
  const all = { igb: true, nvme: true, dwmmc: true, regfixed: true };
  const a = M.bind('regfirst', all), b = M.bind('mmcfirst', all);
  check('regulator first: 4 bound, no retry', [a.bound, a.log.filter(e => e.ev === 'retry').length].join(), '4,0');
  check('mmc first: defer, then retried after the regulator binds, 4 bound', [b.log.some(e => e.ev === 'defer'), b.log.filter(e => e.ev === 'retry').length, b.bound].join(), 'true,1,4');
  const c = M.bind('mmcfirst', { igb: true, nvme: true, dwmmc: true, regfixed: false });
  check('no regulator driver: mmc stays deferred', c.deferredLeft.join(), 'mmc');
  check('html default order is mmcfirst', /name="bdO" value="mmcfirst" checked/.test(html), true);
}

/* ── 10 the read path ── */
{
  const L = SRC.lee;
  check('miss on Optane: labelled steps + rest + enter/ret = 12.82 + 0.20', f(M.readTrace('miss', 'optane').total, 2), f(L.total + 0.2, 2));
  check('hit = enter + lookup + copy + ret', f(M.readTrace('hit', 'optane').total, 2), f(0.1 + L.lookup + L.copy + 0.1, 2));
  check('direct skips lookup, alloc, insert and copy', f(M.readTrace('miss', 'optane').total - M.readTrace('direct', 'optane').total, 2), f(L.lookup + L.alloc + L.insert + L.copy, 2));
  check('polled also skips the interrupt rest and the context switch', f(M.readTrace('direct', 'optane').total - M.readTrace('polled', 'optane').total, 2), f(M.READ.rest + L.ctx, 2));
  check('device time Optane 7.26, NAND 80, HDD 4000', Object.values(M.READ.devices).join(), '7.26,80,4000');
  says('ch10.tuned', '80 微秒'); says('ch10.tuned', '4 毫秒'); says('ch10.tuned', '0.10 微秒'); check('enter/ret 0.10', SRC.arrakis.sys + SRC.arrakis.ret, 0.2);
  check('average at 90 % hits = 0.9 hit + 0.1 miss', f(M.readTrace('miss', 'optane', 90).avg, 4), f(0.9 * M.readTrace('hit', 'optane').total + 0.1 * M.readTrace('miss', 'optane').total, 4));
  check('ch10 law: on Optane the software is as slow as the device (within 25 %)', Math.abs(M.readTrace('miss', 'optane').soft / M.readTrace('miss', 'optane').device - 1) < 0.25, true);
  check('hit slider 90 % default', [M.READ.hits[5], /id="rdH" min="0" max="8" step="1" value="5"/.test(html)].join(), '90,true');
}

/* ── 11 syscalls per I/O ── */
{
  check('block: 1 syscall, 1 switch', [M.asyncIo('block', 8).sys, M.asyncIo('block', 8).ctx].join(), '1,1');
  check('epoll: 1 + 1/k', M.asyncIo('epoll', 8).sys, 1 + 1 / 8);
  check('uring: 1/k', M.asyncIo('uring', 8).sys, 1 / 8);
  check('sqpoll: 0 syscalls, 2 cores', [M.asyncIo('sqpoll', 8).sys, M.asyncIo('sqpoll', 8).cores].join(), '0,2');
  check('uring equals block at k = 1 and beats it from k = 2', M.asyncIo('uring', 1).perCore === M.asyncIo('block', 1).perCore && M.ASYNC.ks.filter(k => k >= 2).every(k => M.asyncIo('uring', k).perCore > M.asyncIo('block', k).perCore), true);
  says('ch11.tuned', '1.26 微秒'); says('ch11.tuned', '0.95 微秒'); check('w 1.26, ctx 0.95', [M.ASYNC.w, M.ASYNC.ctx].join(), '1.26,0.95');
}

/* ── every number the prose quotes ── */
{
  const want = { nrRead: '0', nrReadA: '63', nrUring: '426', sysMax: '472', fxIn: '79', fxOut: '71', fxTot: '150', fxMiss: '250', fxRec: '14000',
    rBase: '100', rK0: '400', rK1: '500', rCr3: '200', rTlb: '700', rTlbP: '30', rReadNs: '344', rSlowN: '113', rSlowP: '47', rAvg: '22', rPoll: '89', rEpoll: '72',
    cPcid: '580', cNo: '1250', c1Share: '74', c32Share: '8', c1Fn: '3.8', c1Ns: '325', c0Ns: '125', cNNs: '604', cPcidNs: '242',
    pcieMed: '547', pcieMin: '520', pcieMax: '947', mPoll: '2.75', mIrq: '587', mRing: '10', mRatio: '269', mN: '64',
    pP: '1.26', pH: '2.2', pLive: '289', pIcpu: '70', pNcpu: '49', pNper: '2.0', pPlat: '1.5', pIlat: '7.4', pNlat: '3.3', pN1cpu: '3.5', pI1cpu: '3.5', pI3lat: '2.2', pN3cpu: '63',
    pCirq: '6694', pI1irq: '10048', pClat: '46', pI1lat: '3.5', weight: '64', itrB: '4000', itrL: '20000',
    rxDef: '256', rxMax: '4096', descB: '16', g0drop: '0.8', g0need: '260', g1drop: '0', g2occ: '24', gD: '20', gCap: '0.40', gPeriod: '2',
    b1bound: '4', b2retry: '1',
    leeTot: '12.82', leeDev: '7.26', leeCtx: '0.95', leeCopy: '0.21', leeBio: '0.72', leeRest: '1.07', leeMap: '0.29', leeUnmap: '0.23',
    rHit: '0.71', rMiss: '13.02', rDirect: '11.99', rPolled: '9.97', rRatio: '18', rSoft: '44', rNsoft: '7', r90: '1.94',
    aBsys: '1', aEsys: '1.03', aUsys: '0.031', aBiops: '408', aUiops: '771', aSiops: '794', aScore: '397',
    axPoll: '1.7', axIrq: '1.2', axAio: '608', axNopLo: '12', axNopHi: '20', axMax: '4096',
    arTot: '3.36', arStack: '1.26', arN: '0.38', arP: '1.44', arIdle: '6.19',
    haasIops: '12.5', haasBud: '13000', haasSpdk: '3', haasPoll: '16', haasIrq: '10', haasIrqT: '32', gShare: '60' };
  for (const [k, [v, d, kind]] of Object.entries(P)) check('prose ' + k, kind === 'pct' ? f(v * 100, d) : typeof d === 'number' ? f(v, d) : M.fmtKind(v, d), want[k]);
  check('every prose value pinned', Object.keys(P).sort().join(','), Object.keys(want).sort().join(','));
  const used = new Set();
  const scan = key => { const v = Z[key] || ''; for (const p of v.matchAll(/\{(\w+)\}/g)) { used.add(p[1]); n++; if (!(p[1] in P)) { fails++; console.error(`FAIL {${p[1]}} in ${key} is not filled on the page`); } } };
  for (const m of html.matchAll(/data-i18n-html="([^"]+)"/g)) scan(m[1]);
  for (const k of Object.keys(P)) { n++; if (!used.has(k)) { fails++; console.error('FAIL prose() value ' + k + ' is never quoted'); } }
  for (const k of Object.keys(Z).filter(k => /^dg\./.test(k))) for (const p of Z[k].matchAll(/\{(\w+)\}/g)) { n++; if (!(p[1] in P)) { fails++; console.error(`FAIL {${p[1]}} in ${k} has no source`); } }
  // the claims the prose makes about the numbers
  check('ch4: polling costs hundreds of times the ring', P.mRatio[0] > 100, true);
  check('ch6: NAPI halves the interrupt-per-packet CPU at 200k or better', P.pNcpu[0] < P.pIcpu[0] * 0.75, true);
  check('ch6: at 10k NAPI and irq cost the same', f(P.pN1cpu[0], 3), f(P.pI1cpu[0], 3));
  check('ch7: need just above 256', P.g0need[0] > 256 && P.g0need[0] < 300, true);
  check('ch10: a miss is more than ten times a hit', P.rRatio[0] > 10, true);
  check('ch11: io_uring per-core beats blocking', P.aUiops[0] > P.aBiops[0], true);
}

/* ── sentence branches ── */
{
  const has = k => { n++; if (Z[k] == null) { fails++; console.error('FAIL missing say key ' + k); } };
  const seen = new Set(), add = s => { has(s.key); seen.add(s.key); };
  for (const a of ['x86', 'arm']) for (const l of M.PRIV.levels[a]) for (const o of M.PRIV.ops[a]) for (const g of [false, true]) add(M.say.priv(a, l, o, g));
  for (const a of ['x86', 'arm']) add(M.say.abi(a));
  for (const p of M.COST.profiles) for (const w of M.COST.works) for (const b of M.COST.batches) add(M.say.cost(M.sysCost(p, w, b), b));
  for (const k of M.MMIO.polls) for (const b of M.MMIO.batches) add(M.say.mmio(k, b));
  for (const m of M.POLL.modes) for (const r of M.POLL.rates) for (const u of (m === 'poll' ? [0] : M.POLL.coal)) add(M.say.poll(M.pollSim(m, r, u, { events: 4000 })));
  for (const N of M.RING.sizes) for (const r of M.RING.rates) for (const s of M.RING.stalls) add(M.say.ring(M.ringSim(N, r, s, { ms: 6 })));
  const ids = ['igb', 'nvme', 'dwmmc', 'regfixed'];
  for (const o of Object.keys(M.BIND.orders)) for (let mask = 0; mask < 16; mask++) { const l = {}; ids.forEach((k, i) => { l[k] = !!(mask & (1 << i)); }); add(M.say.bind(M.bind(o, l))); }
  for (const m of M.READ.modes) add(M.say.read(m));
  for (const a of M.ASYNC.apis) add(M.say.async(a));
  const all = Object.keys(Z).filter(k => /\.say\./.test(k));
  for (const k of all) check('branch reached ' + k, seen.has(k), true);
  for (const k of seen) check('branch has copy ' + k, Z[k] != null, true);
}

/* ── keys, language hygiene, registry, siblings ── */
{
  const keys = new Set([...html.matchAll(/data-i18n(?:-html|-aria|)="([^"]+)"/g)].map(m => m[1]));
  for (const m of app.matchAll(/'((?:ch\d+|dg|u|doc|nav|toc|hero)\.[\w.-]*\w)'/g)) keys.add(m[1]);
  for (const m of html.matchAll(/data-dg="(\w+)"/g)) keys.add('dg.' + m[1] + '.aria');
  // keys app.js builds from model names
  for (const a of ['x86', 'arm']) for (const o of M.PRIV.ops[a]) keys.add('ch1.op.' + o);
  for (const r of ['ok', 'gp', 'pf', 'abort', 'undef', 'enter', 'kernel', 'na']) keys.add('ch1.res.' + r);
  for (const a of ['x86', 'arm']) for (let i = 1; i <= 6; i++) keys.add(`ch2.step.${a}.${i}`);
  for (const ev of ['register', 'match', 'bound', 'defer', 'retry', 'nodrv']) keys.add('ch9.ev.' + ev);
  for (const s of ['bound', 'deferred', 'none']) keys.add('ch9.st.' + s);
  for (const d of M.BIND.devs) keys.add('ch9.dev.' + d.id);
  for (const d of M.BIND.drvs) keys.add('ch9.drv.' + d.id);
  for (const m of M.READ.modes) for (const d of Object.keys(M.READ.devices)) for (const s of M.readSteps(m, d)) keys.add('ch10.st.' + s[0]);
  for (const a of M.ASYNC.apis) keys.add('ch11.a.' + a);
  for (const k of [...keys]) if (/\.$/.test(k)) keys.delete(k);
  for (const k of keys) { n++; if (Z[k] == null) { fails++; console.error('FAIL missing zh key ' + k); } }
  const prefixes = [...app.matchAll(/'((?:ch\d+|dg)\.[\w.]*)'\s*\+/g)].map(m => m[1]);
  for (const k of Object.keys(Z)) {
    const reach = keys.has(k) || html.includes(`"${k}"`) || app.includes(`'${k}'`) || prefixes.some(p => k.startsWith(p)) || /\.say\./.test(k);
    n++; if (!reach) { fails++; console.error('FAIL zh key never used ' + k); }
  }
  for (const [k, v] of Object.entries(Z)) if (/\.say\./.test(k)) for (const m of v.matchAll(/\{(\w+)\}/g)) {
    n++; if (!new RegExp('\\b' + m[1] + '\\s*:|[{,]\\s*' + m[1] + '\\s*[,}]').test(app)) { fails++; console.error(`FAIL placeholder {${m[1]}} in ${k} is never supplied by app.js`); }
  }
  const dgs = [...html.matchAll(/class="dia" data-dg="(\w+)"/g)].map(m => m[1]);
  check('ten diagrams (six or more required; the eight the task names included)', dgs.join(), 'rings,sys,map,irq,ring,iommu,probe,stack,uring,bypass');
  for (const d of dgs) { check('diagram spec ' + d, app.includes('DG.' + d + ' = '), true); for (const s of ['cap', 'aria']) check(`dg.${d}.${s}`, typeof Z[`dg.${d}.${s}`], 'string'); }
  { n++; if (!dgs.some(d => Z['dg.' + d + '.cap'].includes('示意'))) { fails++; console.error('FAIL no caption says 示意'); } }
  for (const file of ['index.html', 'app.js', 'models.js']) {
    let src = fs.readFileSync(path.join(DIR, file), 'utf8');
    if (file === 'index.html') {
      const tt = src.match(/<title>([^<]*)<\/title>/)[1], md = src.match(/<meta name="description" content="([^"]*)">/)[1];
      check('static title = doc.title', tt, Z['doc.title']); check('static meta = doc.desc', md, Z['doc.desc']);
      src = src.replace(/<title>[^<]*<\/title>/, '').replace(/<meta name="description" content="[^"]*">/, '');
      src = src.replace(/<details class="page-provenance"[\s\S]*?<\/details>/, '');
    }
    src = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '').replace(/<!--[\s\S]*?-->/g, '');
    n++;
    const others = (src.match(/[一-鿿、，。：；（）「」《》]+/g) || []).filter(x => !(file === 'index.html' && x === '中'));
    if (others.length) { fails++; console.error(`FAIL Chinese text in ${file}: ${others.slice(0, 3).join(' ')}`); }
  }
  // the registrar adds one bilingual page-provenance label (stripped in the CJK check above)
  check('at most one provenance label', (html.match(/<details class="page-provenance"/g) || []).length <= 1, true);
  const R = JSON.parse(fs.readFileSync(path.join(DIR, 'REGISTRY.json'), 'utf8'));
  check('registry slug/path', R.slug + ' ' + R.path, SLUG + ' computing/systems/' + SLUG + '/');
  check('registry category', [R.category, R.subtopic, R.stage].join('/'), 'computing/systems/university');
  check('registry title', R.title.zh, Z['doc.title'].split(' · ')[0]); check('registry desc', R.desc.zh, Z['doc.desc']);
  check('hero title = registry title', Z['hero.title'], R.title.zh);
  for (const c of R.concepts) check('anchor ' + c.anchor, html.includes('id="' + c.anchor.slice(1) + '"'), true);
  for (const c of R.concepts) { n++; if (!c.aliases.zh.length || !c.aliases.en.length || !c.title.en || !c.desc.en || !c.title.zh || !c.desc.zh) { fails++; console.error('FAIL concept incomplete ' + c.id); } }
  check('one concept per chapter', R.concepts.map(c => c.anchor).join(), Array.from({ length: 14 }, (_, i) => '#ch' + (i + 1)).join());
  // one word, one owner: every alias anywhere else (sibling registries, atlas lessons, the alias table) is off limits,
  // plus the words the task file reserves for siblings
  const norm = s => s.toLowerCase().replace(/\s+/g, '');
  const mine = new Set(R.concepts.map(c => c.id));
  const owned = new Map(), own = (a, who) => { if (typeof a === 'string' && !owned.has(norm(a))) owned.set(norm(a), who); };
  const AL = JSON.parse(fs.readFileSync(path.join(ROOT, 'atlas', 'graph', 'aliases.json'), 'utf8'));
  for (const [id, v] of Object.entries(AL)) if (!mine.has(id)) for (const l of ['zh', 'en']) (v[l] || []).forEach(a => own(a, 'atlas aliases ' + id));
  const LD = path.join(ROOT, 'atlas', 'graph', 'lessons');
  for (const fn of fs.readdirSync(LD)) {
    if (fn === SLUG + '.json') continue;
    const d = JSON.parse(fs.readFileSync(path.join(LD, fn), 'utf8'));
    for (const nd of d.nodes || []) if (nd.aliases && !mine.has(nd.id)) for (const l of ['zh', 'en']) (nd.aliases[l] || []).forEach(a => own(a, 'lesson ' + fn));
  }
  for (const sub of fs.readdirSync(path.join(DIR, '..'))) {
    const p = path.join(DIR, '..', sub, 'REGISTRY.json');
    if (sub !== SLUG && fs.existsSync(p)) for (const c of JSON.parse(fs.readFileSync(p, 'utf8')).concepts || []) for (const a of [...c.aliases.zh, ...c.aliases.en]) own(a, sub);
  }
  for (const a of ['KPTI', '页表隔离', 'PCID', 'Meltdown', '缺页', 'page fault']) own(a, 'how-virtual-memory-works (task file)');
  for (const a of ['MSI 中断是什么', '设备怎么通知 CPU', 'MSI 地址 0xFEE', 'MSI', 'MSI-X', 'BAR 是什么', 'BAR', 'PCIe 配置空间', '配置空间', 'PCIe 枚举', 'PCIe enumeration']) own(a, 'how-pcie-works (task file)');
  for (const a of ['IOMMU', 'IOMMU 是什么', 'VT-d', '内核 DMA 保护', 'DMA 攻击', 'DMA attack']) own(a, 'how-thunderbolt-works (task file)');
  for (const a of ['io_uring IOPOLL', 'SPDK 轮询模式', 'NVMe 中断与轮询', '轮询 vs 中断', 'SQ CQ 环形队列', '门铃寄存器', 'Doorbell', 'doorbell register']) own(a, 'why-nvme-is-fast (task file)');
  for (const a of ['排队论', 'M/M/1/K', '缓冲区', '丢包', 'packet loss', 'queueing theory']) own(a, 'how-a-web-page-arrives (task file)');
  for (const a of ['CXL', '上下文切换', 'context switch']) own(a, 'siblings (task file)');
  // review 2026-11-15: storage-over-a-network #ch6 explains RDMA in depth (RDMA 是什么 / what is RDMA); this page only names it
  for (const a of ['RDMA', 'remote direct memory access', 'RDMA 是什么', 'what is RDMA']) own(a, 'storage-over-a-network (review)');
  // why-a-few-firms-win owns bare DMA (the Digital Markets Act); this page keeps the question forms only
  own('DMA', 'why-a-few-firms-win');
  for (const c of R.concepts) for (const a of [...c.aliases.zh, ...c.aliases.en]) { n++; if (owned.has(norm(a))) { fails++; console.error(`FAIL alias owned by ${owned.get(norm(a))}: ${a}`); } }
  const mineAll = R.concepts.flatMap(c => [...c.aliases.zh, ...c.aliases.en]).map(norm);
  check('no alias twice on this page', new Set(mineAll).size, mineAll.length);
  for (const w of ['系统调用', 'system call', '特权级', 'NAPI', '描述符环', 'EPROBE_DEFER', '页缓存', 'O_DIRECT', 'epoll', 'DPDK', 'virtio', 'SR-IOV', 'MMIO 是什么', '软中断']) check('this page takes ' + w, mineAll.includes(norm(w)), true);
  // links: only live siblings, chapters that exist, titles quoted as in their copy
  const all = Object.values(Z).join('');
  const LIVE = ['how-a-cpu-runs-a-program', 'how-virtual-memory-works', 'how-a-computer-boots', 'how-pcie-works', 'why-nvme-is-fast', 'how-thunderbolt-works', 'how-cores-share-memory',
    'how-a-cpu-guesses-ahead', 'what-a-drive-is-made-of', 'how-cpu-caches-work', 'coherent-interconnects'];
  const hrefs = [...all.matchAll(/href='([^']+)'/g)].map(m => m[1]);
  for (const h of hrefs) { n++; if (!new RegExp('^\\.\\./(' + LIVE.join('|') + ')/(#ch\\d+)?$').test(h)) { fails++; console.error('FAIL unexpected link ' + h); } }
  for (const sib of LIVE) {
    const sh = fs.readFileSync(path.join(DIR, '..', sib, 'index.html'), 'utf8');
    for (const m of all.matchAll(new RegExp("href='\\.\\./" + sib + "/(#ch\\d+)?'", 'g'))) if (m[1]) check(`${sib} anchor ${m[1]}`, sh.includes(`id="${m[1].slice(1)}"`), true);
    const cp = path.join(DIR, '..', sib, 'copy.zh.js');
    if (fs.existsSync(cp)) { const cz = { window: {} }; vm.runInNewContext(fs.readFileSync(cp, 'utf8'), cz); check(sib + ' title quoted as in its copy', all.includes('《' + cz.window.ESSAY_COPY.zh['hero.title'] + '》'), true); }
  }
  for (const [h, why] of [['../how-virtual-memory-works/#ch10', 'KPTI'], ['../how-pcie-works/#ch6', 'BAR'], ['../how-pcie-works/#ch7', 'MSI'], ['../why-nvme-is-fast/#ch4', 'queues'], ['../why-nvme-is-fast/#ch7', 'polling'],
    ['../how-thunderbolt-works/#ch8', 'IOMMU'], ['../how-a-computer-boots/#ch11', 'handoff'], ['../how-a-computer-boots/#ch6', 'ACPI'], ['../how-a-computer-boots/#ch12', 'Arm ELs'], ['../how-cores-share-memory/#ch9', 'barriers'],
    ['../how-a-cpu-guesses-ahead/#ch10', 'Spectre'], ['../what-a-drive-is-made-of/#ch1', 'LBA'], ['../what-a-drive-is-made-of/#ch2', 'HDD'], ['../how-virtual-memory-works/#ch3', 'paging'], ['../how-virtual-memory-works/#ch4', 'TLB'],
    ['../coherent-interconnects/#ch3', 'CXL'], ['../how-a-cpu-runs-a-program/#ch8', 'exceptions'], ['../how-cpu-caches-work/', 'caches']]) check(`links ${h} (${why})`, hrefs.includes(h), true);
  // the unregistered siblings are named in plain text, ready for the registrar to link
  check('how-a-web-page-arrives named in plain text, not linked', [all.includes('《网页是怎么来到你手机上的》'), /how-a-web-page-arrives|a-secret-in-public/.test(all)].join(), 'true,false');
  // no exploit detail in the security paragraph
  for (const k of ['ch13.d1', 'ch13.c1']) { n++; if (/shellcode|payload|绕过步骤|利用步骤|exploit/i.test(Z[k])) { fails++; console.error('FAIL exploit wording in ' + k); } }
  says('ch13.c2', '不是独立的统计');
  // review 2026-11-15: English quotations are the sources' own words (opened 2026-11-15); paraphrases carry no quote marks
  {
    const ectx0 = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.en.js'), 'utf8'), ectx0); const E0 = ectx0.window.ESSAY_COPY.en;
    for (const [k, q] of [['ch13.d1', 'exploited the io_uring component of the Linux kernel'], ['ch13.d2', '“Rust in the kernel is no longer experimental”'],
      ['ch13.c1', '“brings performance benefits, and promptly reacts to security issues”'], ['ch13.c1', '“a fairly new part of the kernel”'],
      ['ch7.p3', '“free flowing 32-bit integers, and rely on natural wrapping”'], ['ch11.p4', '“mostly bound by the number of system calls that have to be performed”'],
      ['ch12.p2', '“a user space, polled-mode, asynchronous, lockless NVMe driver”'], ['ch13.law', "Google's kernel bug bounty"]]) check('en verbatim ' + k + ': ' + q, E0[k].includes(q), true);
    for (const [k, bad] of [['ch13.d1', 'involved'], ['ch13.c2', '“'], ['ch13.c2', 'extremely'], ['ch7.p3', 'free-running'], ['ch13.law', 'attackers target most often']]) check('en not ' + k + ': ' + bad, E0[k].includes(bad), false);
    for (const [k, bad] of [['ch13.c2', '「'], ['ch13.d2', '「'], ['ch11.p4', '「'], ['ch12.p2', '「用户态'], ['ch7.p3', '「'], ['ch4.p2', '「'], ['ch13.law', '最常被攻击']]) check('zh no translated quote ' + k, Z[k].includes(bad), false);
    says('ch13.law', 'Google 的内核漏洞奖励计划里'); says('ch13.d1', '利用的是 Linux 内核的 io_uring 组件');
  }

  const ectx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.en.js'), 'utf8'), ectx);
  const EN = ectx.window.ESSAY_COPY.en, stub = ectx.window.ESSAY_COPY.enStub === true, ph = s => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');
  check('en keys = zh keys', Object.keys(EN).sort().join('|'), Object.keys(Z).sort().join('|'));
  for (const k of Object.keys(Z)) check('en placeholders ' + k, ph(EN[k]), ph(Z[k]));
  if (stub) { check('en stub mirrors zh exactly', JSON.stringify(EN), JSON.stringify(Z)); console.log('NOTE: copy.en.js is a stub (enStub); English registry match skipped until it is translated'); }
  else { check('registry title en', R.title.en, EN['doc.title'].split(' · ')[0]); check('registry desc en', R.desc.en, EN['doc.desc']); }
}

if (fails) { console.error(`\n${fails} of ${n} checks failed`); process.exit(1); }
console.log(`PASS: ${n} checks (privilege table, syscall ABI, crossing cost, register accesses, interrupt / polling / NAPI simulation, descriptor ring counters and capacity, match / probe / bind, read-path sums, syscalls per I/O, sourced and frontier figures, every number in the prose, every sentence branch, keys, registry, links and aliases)`);
