'use strict';
// Pins the page's virtual-memory models: the figures typed from their sources (Intel SDM Vol. 3A ch. 5, AMD 58455,
// the Linux docs, Android's 16 KB page guide, this machine's measurements); the page-table arithmetic and the x86-64
// walk against hand-worked bit splits and Table 5-20; the TLB simulation against its closed forms; the replacement
// engine against Belady, Nelson & Shedler's string; the nested walk against nm + n + m; the effective-access-time
// formula by hand; every number the prose quotes (placeholders filled from prose(), literals checked against
// models.js); how far each conclusion moves when a tuned parameter is halved or doubled; every live sentence branch;
// copy keys, language hygiene, the registry, sibling links and the sibling essays' aliases.
// Run: node computing/systems/how-virtual-memory-works/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const M = require(path.join(DIR, 'models.js'));
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;
const html = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(DIR, 'app.js'), 'utf8');
const { KiB, MiB, GiB, TiB, PiB, FACTS, FRONTIER } = M;

let n = 0, fails = 0;
function check(name, got, want) { n++; if (got !== want) { fails++; console.error(`FAIL ${name}: model gives ${got}, expected ${want}`); } }
function near(name, got, want, tol) { n++; if (!(Math.abs(got - want) <= tol)) { fails++; console.error(`FAIL ${name}: ${got} not within ${tol} of ${want}`); } }
function says(key, phrase) { n++; if (!Z[key] || !Z[key].includes(phrase)) { fails++; console.error(`FAIL prose ${key} should contain "${phrase}"`); } }
const f = (x, d) => x.toFixed(d);

/* ── figures typed again from the sources (BRIEF.md lists URL and date for each) ── */
{
  const S = FACTS.sdm;
  check('SDM §5.5: 48-bit 4-level, 57-bit 5-level, 52-bit physical', [S.va4, S.va5, S.pa].join(), '48,57,52');
  check('512 entries of 8 bytes = one 4 KiB page', [S.entries, S.entryBytes, S.entries * S.entryBytes].join(), '512,8,4096');
  check('PCID is 12 bits (CR3 11:0)', S.pcidBits, 12);
  const P = S.pte;
  check('Table 5-20 bit positions P RW US PWT PCD A D PAT G R', [P.P, P.RW, P.US, P.PWT, P.PCD, P.A, P.D, P.PAT, P.G, P.R].join(), '0,1,2,3,4,5,6,7,8,11');
  check('Table 5-20 PFN 12..51, PK 59..62, XD 63', [P.pfnLo, P.pfnHi, P.pkLo, P.pkHi, P.XD].join(), '12,51,59,62,63');
  const L = FACTS.linux5;
  check('Linux 5level-paging: 256 TiB / 64 TiB → 128 PiB / 4 PiB', [L.va4 / TiB, L.pa4 / TiB, L.va5 / PiB, L.pa5 / PiB].join(), '256,64,128,4');
  check('256 TiB = 2^48 bytes, 128 PiB = 2^57', [L.va4 === Math.pow(2, 48), L.va5 === Math.pow(2, 57)].join(), 'true,true');
  check('5-level unconditional commit 2025-05-17', [L.unconditional, FRONTIER.linux5].join(), '2025-05-17,2025-05-17');
  const z = FACTS.zen5;
  check('Zen 5 DTLB 96 / 4096 16-way / 1G 1024; ITLB 64 / 2048', [z.l1dtlb, z.l2dtlb, z.l2dtlbWays, z.l2dtlb1g, z.l1itlb, z.l2itlb].join(), '96,4096,16,1024,64,2048');
  check('Zen 5 6 walkers, 64-entry PDC', [z.walkers, z.pdc].join(), '6,64');
  check('Zen 5 L1/L2/L3 latency 4/14/46', [z.l1.lat, z.l2.lat, z.l3.lat].join(), '4,14,46');
  check('DRAM 70 ns at 5.7 GHz', [FACTS.dramNs, FACTS.ghz].join(), '70,5.7');
  near('DRAM ≈ 399 cycles', M.dramCycles(), 399, 0.01);
  check('host minor fault 0.53 µs (first run 2.5), retouch 0.11, 16 KiB page, read 2026-11-15', [FACTS.minorUs, FACTS.minorUsHi, FACTS.touchUs, FACTS.hostPage, FACTS.read].join(), [0.53, 2.5, 0.11, 16384, '2026-11-15'].join());
  check('990 PRO QD1 22K IOPS; Barracuda 8.5 + 4.16 ms', [FACTS.nvmeIops, FACTS.hddSeekMs, FACTS.hddRotMs].join(), '22000,8.5,4.16');
  check('4.16 ms = half a turn at 7,200 rpm', f(60000 / 7200 / 2, 2), '4.17');   // the data sheet rounds down
  check('arm64: 4K 39/48, 16K 47, 64K 42/52', [FACTS.arm.k4.join('/'), FACTS.arm.k16, FACTS.arm.k64.join('/')].join(), '39/48,47,42/52');
  check('PTI doc: CR3 ~ a hundred cycles', FACTS.kpti.cr3Cycles, 100);
  const A = FRONTIER.android;
  check('Android 15; Play deadline 2027-02-01', [A.version, A.deadline].join(), '15,2027-02-01');
  check('Android gains 3.16 (30) / 4.56 / 4.48 / 6.60 / 8 % (950 ms)', [A.launch, A.launchMax, A.power, A.camHot, A.camCold, A.boot, A.bootMs].join(), '3.16,30,4.56,4.48,6.6,8,950');
  check('as of 2026-11', FRONTIER.asOf, '2026-11');
  says('ch12.title', '2026 年 11 月'); says('ch12.d1', '2025 年 5 月 17 日'); says('ch12.d2', '16384'); says('ch12.d2', '2026 年 11 月 15 日');
  says('ch12.c2', '2027 年 2 月 1 日'); says('ch12.e1', '2026 年 9 月版'); says('ch3.p1', '2026 年 9 月版'); says('hero.note', '2026');
  check('16384 = host page', FACTS.hostPage, 16384);
  says('ch7.p2', '22,000 次每秒'); says('ch7.p2', '8.5 毫秒'); says('ch7.p2', '4.16 毫秒'); says('ch7.p2', '0.50 到 0.63'); says('ch7.p2', '7,200 转');
  says('ch7.src.nvme', '22K'); says('ch7.src.hdd', '8.5'); says('ch7.src.hdd', '4.16'); says('ch7.src.minor', '2026 年 11 月 15 日');
  says('ch10.p4', '大约一百个'); says('ch10.p1', '12');
  says('ch12.e2', '48 位'); check('arm 4K 4-level = 48 bits', FACTS.arm.k4[1], 48);
}

/* ── 01 contiguous vs paged allocation ── */
{
  for (const m of M.FRAG.means) {
    const r = M.frag(m);
    // once memory itself is short (16 MiB × 35 steps ≈ 2 × RAM) the two allocators refuse different processes and the
    // counts can cross by one; below that, paging never refuses more than first fit
    n++; if (m <= 14 && r.failP > r.failB) { fails++; console.error(`FAIL ch1 mean ${m}: paging refused more than first fit`); }
    n++; if (r.failP > r.failB * 1.05 + 1) { fails++; console.error(`FAIL ch1 mean ${m}: paging refused clearly more than first fit`); }
    n++; if (r.hist.some(h => h.largest > h.free)) { fails++; console.error(`FAIL ch1 mean ${m}: a hole larger than all free memory`); }
    n++; if (r.hist.some((h, i) => i && (h.failB < r.hist[i - 1].failB || h.failP < r.hist[i - 1].failP))) { fails++; console.error(`FAIL ch1 mean ${m}: refusals not cumulative`); }
  }
  // occupancy bookkeeping: every live frame belongs to exactly one process in both strips
  const k = M.frag(6, { keep: true }), h = k.hist[150];
  check('ch1: free count matches the strip', h.free, [...h.bb].filter(x => x < 0).length);
  check('ch1: paged free count matches the strip', h.freeP, [...h.pg].filter(x => x < 0).length);
  says('ch1.model.how', '256 MiB'); says('ch1.model.how', '10 到 60 步'); check('RAM 256, life 10–60', [M.FRAG.ram, M.FRAG.lifeMin, M.FRAG.lifeMax].join(), '256,10,60');
  says('ch1.p4', '平均 3 MiB'); says('ch1.p4', '平均 12 MiB'); says('ch1.p4', '进程平均 6 MiB');
}

/* ── 02 the flat table and the tree, by hand ── */
{
  check('32-bit, 4 KiB: 2^20 entries × 8 = 8 MiB', M.flatBytes(32, 4 * KiB), Math.pow(2, 20) * 8);
  check('48-bit: 2^36 × 8 = 512 GiB', M.flatBytes(48, 4 * KiB), 512 * GiB);
  check('57-bit: 2^45 × 8 = 256 TiB', M.flatBytes(57, 4 * KiB), 256 * TiB);
  check('levels: 48/4K 4, 57/4K 5, 39/4K 3, 47/16K 3, 42/64K 2, 52/64K 3', [M.levels(48, 4 * KiB), M.levels(57, 4 * KiB), M.levels(39, 4 * KiB), M.levels(47, 16 * KiB), M.levels(42, 64 * KiB), M.levels(52, 64 * KiB)].join(), '4,5,3,3,2,3');
  // arm64 doc: 4K pages give 39 bits with 3 levels and 48 with 4; 64K give 42 with 2 — same as the formula
  check('arm64 doc agrees with the level formula', [M.levels(FACTS.arm.k4[0], 4 * KiB), M.levels(FACTS.arm.k4[1], 4 * KiB), M.levels(FACTS.arm.k64[0], 64 * KiB), M.levels(FACTS.arm.k16, 16 * KiB)].join(), '3,4,2,3');
  // the tree: one root, and leaf tables = distinct 2 MiB spans touched; with a 64 MiB heap the 4 regions are
  // code 4 MiB (2 spans), heap 64 MiB at 0x1400000 (32 spans, 2 MiB aligned), libs 32 MiB (16), stack 8 MiB ending 64 KiB below
  // the top (5, unaligned) = 55 PTs; PDs: GiB 0, libs, stack = 3; PDPTs: 512-GiB slots 0, 192 (libs at 0x600000000000), 255 = 3; one root
  const t = M.treeTables(48, 4 * KiB, 64 * MiB);
  check('tree: per level leaf→root', t.perLevel.join(), '55,3,3,1');
  check('tree: 62 tables, 248 KiB', [t.tables, t.bytes / KiB].join(), '62,248');
  check('tree bytes ≈ mapped / 512 for a big heap', Math.abs(M.treeTables(48, 4 * KiB, 16384 * MiB).bytes / M.treeTables(48, 4 * KiB, 16384 * MiB).mapped - 1 / 512) < 0.0003, true);
  says('ch2.p1', '2<sup>12</sup>'); says('ch2.p2', '2<sup>20</sup>'); says('ch2.p2', '2<sup>36</sup>'); says('ch2.p2', '512 项');
  says('ch2.p3', '1/512'); says('ch2.p3', '2,048 项'); says('ch2.p3', '47 位'); says('ch2.p3', '42 位');
  check('16 KiB page: 2,048 entries, 11 bits', [16 * KiB / 8, Math.log2(16 * KiB / 8)].join(), '2048,11');
}

/* ── 03 the x86-64 walk against the manual ── */
{
  const va = M.parseVA('0x555555561a38');
  check('parseVA accepts 0x, underscores; rejects junk', [M.parseVA('0x5555_5556_1a38') === va, M.parseVA('zz'), M.parseVA('')].join(), 'true,,');
  const F = M.fields(va, false);
  // by hand: 0x555555561a38 = 0101 0101 0101 0101 0101 0101 0101 0110 0001 1010 0011 1000
  check('9+9+9+9+12 split of 0x555555561a38', [...F.idx, F.off].join(), [0b010101010, 0b101010101, 0b010101010, 0b101100001, 0xa38].join());
  check('the split sums to 48', 9 * 4 + 12, FACTS.sdm.va4);
  says('ch3.p1', '9 + 9 + 9 + 9 + 12 = 48');
  for (const [hi, lo] of [[47, 39], [38, 30], [29, 21], [20, 12]]) says('ch3.p1', `${hi} 到 ${lo}`);
  says('ch3.p1', '11 到 0'); says('ch3.p1', '128 TiB'); check('user half = 128 TiB', Math.pow(2, 47) / TiB, 128);
  says('ch3.p3', '56 到 48'); says('ch3.p2', '第 7 位叫 PS'); says('ch3.p2', '第 63 位 XD'); says('ch3.p2', '第 8 位 G');
  says('ch3.p2', '第 0 位 P'); says('ch3.p2', '第 1 位 R/W'); says('ch3.p2', '第 2 位 U/S'); says('ch3.p2', '第 5 位 A'); says('ch3.p2', '第 6 位 D'); says('ch3.p2', '第 12 位往上');
  // each step reads base + index × 8, and the next base comes from bits 51:12 of the entry
  const w = M.walk(va, false, 'r');
  check('heap walk: 4 reads, no fault', [w.steps.length, w.fault || 'none'].join(), '4,none');
  for (let i = 0; i < 4; i++) check('step ' + i + ' address = base·4096 + idx·8', w.steps[i].addr, (w.steps[i].base << 12n) + BigInt(w.steps[i].idx) * 8n);
  for (let i = 1; i < 4; i++) check('step ' + i + ' base from previous entry', w.steps[i].base, (w.steps[i - 1].entry >> 12n) & ((1n << 40n) - 1n));
  check('PA = frame of the last entry + offset', w.pa, (((w.steps[3].entry >> 12n) & ((1n << 40n) - 1n)) << 12n) | 0xa38n);
  check('heap leaf flags P RW US A D XD', ['P', 'RW', 'US', 'A', 'D', 'XD'].map(k => w.steps[3].flags[k]).join(''), '111111');
  check('PA within the 16 GiB toy memory', w.pa < 16n * BigInt(GiB), true);
  const hg = M.walk(M.parseVA(M.TOY.presets.huge), false, 'r');
  check('2 MiB page: 3 reads, PS in the PDE, 21-bit offset kept', [hg.steps.length, hg.steps[2].ps, hg.pageBytes, Number(hg.pa & 0x1fffffn).toString(16)].join(), '3,true,2097152,1234a8');
  const out = (p, lv5, a) => { const r = M.walk(M.parseVA(M.TOY.presets[p]), lv5, a); return (r.fault || 'ok') + ':' + r.steps.length; };
  check('presets, 4-level, read', ['heap', 'code', 'huge', 'absent', 'kern', 'hole', 'noncanon'].map(p => out(p, false, 'r')).join(), 'ok:4,ok:4,ok:3,notpresent:4,super:1,notpresent:1,noncanon:0');
  check('presets, 5-level, read', ['heap', 'huge', 'hole', 'noncanon'].map(p => out(p, true, 'r')).join(), 'ok:5,ok:4,notpresent:2,notpresent:2');
  check('write to code faults (R/W = 0); execute heap faults (XD = 1); execute code ok', [out('code', false, 'w'), out('heap', false, 'x'), out('code', false, 'x')].join(), 'ro:4,xd:4,ok:4');
  check('0x0000900000000000 is non-canonical at 48 bits, canonical at 57', [M.canonical(0x0000900000000000n, 48), M.canonical(0x0000900000000000n, 57)].join(), 'false,true');
  check('0xffff888000000040 canonical at 48', M.canonical(0xffff888000000040n, 48), true);
  check('kernel PML4E has U/S = 0', M.walk(M.parseVA(M.TOY.presets.kern), false, 'r').steps[0].flags.US, 0);
}

/* ── 04 TLB: simulation vs closed form ── */
{
  for (const e of [256, 1536]) for (const W of [4 * MiB, 64 * MiB, 1 * GiB]) {
    const r = M.tlb('rand', W, e, 4 * KiB);
    near(`random LRU ≈ 1 − entries/pages (${e}, ${W / MiB} MiB)`, r.missRate, r.closed, 0.01);
  }
  check('seq 4 KiB beyond reach: one miss per 512 accesses', M.tlb('seq', 64 * MiB, 1536, 4 * KiB).missRate, 1 / 512);
  check('seq fitting: no misses', M.tlb('seq', 4 * MiB, 1536, 4 * KiB).missRate, 0);
  check('col 4 KiB beyond reach: every access misses', M.tlb('col', 64 * MiB, 1536, 4 * KiB).missRate, 1);
  check('col 2 MiB: 32 pages fit', M.tlb('col', 64 * MiB, 1536, 2 * MiB).missRate, 0);
  // cyclic LRU closed form against a direct simulation
  const sim = (Np, E, per) => { const t = M.lru(E); let miss = 0, nn = 0; for (let r = 0; r < 4; r++) for (let p = 0; p < Np; p++) for (let k = 0; k < per; k++) { const h = t.has(p); if (!h) t.put(p); if (r >= 2) { nn++; if (!h) miss++; } } return miss / nn; };
  check('cyclic LRU closed form = simulation (40 pages, 32 entries)', sim(40, 32, 3), 1 / 3);
  check('cyclic LRU closed form = simulation (32 pages, 32 entries)', sim(32, 32, 3), 0);
  says('ch4.p3', '64 MiB'); says('ch4.p3', '1,536 项'); says('ch4.p3', '512 次读'); says('ch4.p1', '512 个 8 字节');
  check('ch4 default 64 MiB, 1536 entries in the lists', [M.TLB.sizes.includes(64 * MiB), M.TLB.entries.includes(1536)].join(), 'true,true');
}

/* ── 05–06 walk cost and huge pages ── */
{
  const w = M.walkC(1 * GiB, 4 * KiB, false, false);
  check('no PWC: every walk reads 4', w.perWalk, 4);
  check('no PWC, 5-level: 5', M.walkC(1 * GiB, 4 * KiB, false, true).perWalk, 5);
  const p = M.walkC(1 * GiB, 4 * KiB, true, false);
  check('PWC: between 1 and 4 reads', p.perWalk >= 1 && p.perWalk < 4, true);
  near('best = 4 + miss · reads · 14', p.best, 4 + p.missRate * p.perWalk * 14, 1e-9);
  near('worst = 4 + miss · reads · 399', p.worst, 4 + p.missRate * p.perWalk * M.dramCycles(), 1e-9);
  check('2 MiB pages: walks are one level shorter', M.walkC(64 * GiB, 2 * MiB, false, false).perWalk, 3);
  check('L2 DTLB reach 16 MiB / 8 GiB', [FACTS.zen5.l2dtlb * 4 * KiB / MiB, FACTS.zen5.l2dtlb * 2 * MiB / GiB].join(), '16,8');
  const h1 = M.huge(16 * GiB, GiB, false);
  check('1 GiB pages use the 1,024-entry L2 (reach 1 TiB)', h1.reach, 1024 * GiB);
  check('sparse: 4 KiB pages allocate exactly what is touched', M.huge(16 * GiB, 4 * KiB, true).bloat, 1);
  check('sparse: 2 MiB pages allocate 16× (one 4 KiB piece in every 64 KiB)', M.huge(16 * GiB, 2 * MiB, true).bloat, 16);
  says('ch5.p3', '1 GiB 的数组'); says('ch5.p3', '64 GiB'); says('ch5.p3', '16 MiB'); says('ch6.p3', '16 GiB 的数组'); says('ch6.p3', '1 TiB');
  says('ch5.p1', '跳过两级或三级'); says('ch6.model.how', '64 KiB 里只用 4 KiB');
}

/* ── 07 effective access time, by hand ── */
{
  const e = M.eat(1e-4, 'nvme'), tm = 0.07, tf = 1e6 / 22000;
  near('EAT = (1 − p)·t_mem + p·t_fault', e.eat, (1 - 1e-4) * tm + 1e-4 * tf, 1e-12);
  near('p for 10 % slower = 0.1·t_mem / (t_fault − t_mem)', e.p10, 0.1 * tm / (tf - tm), 1e-15);
  near('NVMe fault ≈ 45.5 µs', M.faultUs('nvme'), 45.45, 0.01);
  near('disk fault 12.66 ms', M.faultUs('hdd'), 12660, 1e-6);
  says('ch7.model.how', '(1 − p)'); says('ch7.p3', '10%'); says('ch7.p3', '1968');
}

/* ── 08 replacement against Belady, Nelson & Shedler (1969) ── */
{
  check('Belady string', M.REF.belady.join(' '), '1 2 3 4 1 2 5 1 2 3 4 5');
  says('ch8.p2', M.REF.belady.join(' ')); says('ch8.p2', '1969'); says('ch8.p1', '1966'); says('ch8.p3', '1970');
  check('FIFO 3 → 9, 4 → 10 (the anomaly)', [M.run('belady', 3, 'fifo').faults, M.run('belady', 4, 'fifo').faults].join(), '9,10');
  check('OPT 3 → 7, 4 → 6', [M.run('belady', 3, 'opt').faults, M.run('belady', 4, 'opt').faults].join(), '7,6');
  check('LRU 3 → 10, 4 → 8', [M.run('belady', 3, 'lru').faults, M.run('belady', 4, 'lru').faults].join(), '10,8');
  check('FIFO anomaly at 4 frames only', M.anomaly('belady').join(), '3');
  // stack property: LRU and OPT never fault more with more frames, on every string
  for (const s of ['belady', 'loop', 'local']) for (const pol of ['lru', 'opt']) { const c = M.curve(s)[pol]; check(`${pol} on ${s} is monotone`, c.every((x, i) => !i || x <= c[i - 1]), true); }
  // OPT is a lower bound for every policy at every size
  for (const s of ['belady', 'loop', 'local']) { const c = M.curve(s); for (let i = 0; i < 8; i++) for (const pol of ['fifo', 'clock', 'lru']) { n++; if (c[pol][i] < c.opt[i]) { fails++; console.error(`FAIL OPT not a lower bound: ${s} ${pol} ${i + 1}`); } } }
  check('FIFO FIFO-hand: cold misses = distinct pages', M.run('belady', 8, 'fifo').faults, 5);
  check('the 5-page loop with 4 frames: LRU misses all 20', M.run('loop', 4, 'lru').faults, 20);
}

/* ── 09 copy-on-write accounting ── */
{
  for (const [c, g] of [[0, 0], [0.1, 0], [0.1, 0.1], [0.5, 0.5], [1, 1]]) {
    const r = M.cow(c, g);
    check(`cow(${c},${g}) copies = child + parent − both`, r.copies, r.child + r.parent - r.both);
    check(`cow(${c},${g}) faults = child + parent`, r.faults, r.child + r.parent);
  }
  check('everyone writes everything: COW copies N, faults 2N', [M.cow(1, 1).copies, M.cow(1, 1).faults].join(), [M.COW.N, 2 * M.COW.N].join());
  check('25,600 pages × 4 KiB = 100 MiB', M.COW.N * 4 * KiB / MiB, 100);
  says('ch9.p2', '10%');
}

/* ── 10 context switches ── */
{
  for (const K of [2, 4, 6, 8]) check(`K=${K}: tagged never misses more than flush`, M.ctxM(K, 'tagged', false, 1000).missPer1k <= M.ctxM(K, 'flush', false, 1000).missPer1k, true);
  check('K=1: no switches, tagged = flush', M.ctxM(1, 'tagged', false, 1000).missPer1k, M.ctxM(1, 'flush', false, 1000).missPer1k);
  check('6 × 256 + 8 kernel pages just exceeds 1,536', 6 * M.CTX.ws + M.CTX.kpages > M.CTX.entries && 5 * M.CTX.ws + M.CTX.kpages <= M.CTX.entries, true);
  check('PCID tags 4,096', Math.pow(2, FACTS.sdm.pcidBits), 4096);
  says('ch10.p3', '4 个进程'); says('ch10.p3', '每 1,000 次访问'); says('ch10.p3', '6 个进程'); says('ch10.p3', '8 个进程'); says('ch10.p4', '4 个进程'); says('ch10.p4', '2018');
}

/* ── 11 the two-dimensional walk ── */
{
  for (const [a, b, r] of [[4, 4, 24], [5, 5, 35], [4, 3, 19], [3, 3, 15], [4, 0, 4]]) check(`nested ${a}×${b} = nm + n + m`, M.nested(a, b).refs, r);
  check('grid cells = (n+1)(m+1) − 1 (the data itself is not a read)', M.nested(4, 4).grid, 24);
  says('ch11.law', '24'); says('ch11.p1', '2008'); says('ch11.p2', '15% 到 38%');
}

/* ── tuned parameters: halved / doubled (BRIEF.md lists the same) ── */
{
  // ch1 lifetime / seed: paging never refuses more than first fit, and at mean 6 first fit refuses more
  for (const seed of [3, 7, 21, 99]) { const r = M.frag(6, { seed }); check(`ch1 seed ${seed}: first fit refuses more`, r.failB > r.failP, true); }
  // ch5 PWC sizes 16 / 64 instead of 32: the PWC still cuts the 1 GiB walk to under half
  const save = [M.WALK.pde, M.WALK.pdpte];
  for (const s of [16, 64]) { M.WALK.pde = s; M.WALK.pdpte = s; const r = M.walkCost(1 * GiB, 4 * KiB, true, false); check(`ch5 PWC ${s}: reads per walk < 2.5`, r.perWalk < 2.5, true); const r64 = M.walkCost(64 * GiB, 4 * KiB, true, false); check(`ch5 PWC ${s}: 64 GiB needs more reads than 1 GiB`, r64.perWalk > r.perWalk, true); }
  [M.WALK.pde, M.WALK.pdpte] = save;
  // ch10 working set halved / doubled: tagged at 4 processes still well under flush
  const ws = M.CTX.ws;
  // (with 512 pages each, 4 processes no longer fit 1,536 entries, so the check moves to 2 processes: the claim is
  // "tags help while the working sets fit together", which is what ch10.p3 says)
  for (const [w, K] of [[128, 4], [512, 2]]) { M.CTX.ws = w; const a = M.ctx(K, 'tagged', false, 1000).missPer1k, b = M.ctx(K, 'flush', false, 1000).missPer1k; check(`ch10 ws ${w}, ${K} processes: tagged < flush / 5`, a < b / 5, true); }
  M.CTX.ws = 512; check('ch10 ws 512, 4 processes: tagged no longer helps much', M.ctx(4, 'tagged', false, 1000).missPer1k > M.ctx(4, 'flush', false, 1000).missPer1k / 2, true);
  M.CTX.ws = ws;
  // ch10 kernel pages halved/doubled: KPTI without PCID still the worst
  const kp = M.CTX.kpages;
  for (const k of [4, 16]) { M.CTX.kpages = k; check(`ch10 kpages ${k}: KPTI flush worst`, M.ctx(4, 'flush', true, 1000).missPer1k > M.ctx(4, 'flush', false, 1000).missPer1k, true); }
  M.CTX.kpages = kp;
}

/* ── every prose placeholder is a prose() key; pinned values ── */
{
  const P = M.prose();
  const want = { ram: '256', fragSteps: '300', fMean: '6', fFailB: '20', fFailP: '5', fFree: '54', fLargest: '17', f3FailB: '0', f3FailP: '0', f12FailB: '125', f12FailP: '114',
    flat32: '8', flat48: '512', flat57: '256', pages48: '68.7', lv48: '4', lv57: '5', lv16k: '4', lv16k47: '3', lv64k: '2', bits16k: '11',
    t48n: '62', t48kib: '248', t48map: '108', t57n: '66', t48bigN: '8238', t48bigMiB: '32.2', heapBig: '16',
    va4: '48', va5: '57', pa: '52', vaTiB: '256', va5PiB: '128', pa4TiB: '64', pa5PiB: '4',
    tlbL1: '96', tlbL2: '4096', tlbW: '16', tlb1g: '1024', itlb1: '64', itlb2: '2048', reachL1: '384', reachL2: '16', reachL2h: '8',
    r4: '90.8', r2: '0.0', s4: '0.20', c4: '100', c2: '0.0', r4closed: '90.6',
    walkers: '6', pdc: '64', pwcT: '32', w1miss: '98', w1refs: '4', w1prefs: '1.94', w1pbest: '30.7', w1pworst: '765', w1worst: '1576', w64refs: '2.50', w64worst: '1001', w16miss: '0.1', w1p5refs: '1.94', dram: '399', l2lat: '14', l1lat: '4',
    h4miss: '99.9', h2miss: '50', h1gmiss: '0.0', h4worst: '800', h2worst: '203', h1gworst: '4', h2refs: '1.00', reach1g: '1024', hs2bloat: '16', hs4alloc: '1', hs2alloc: '16',
    minorUs: '0.53', minorHi: '2.5', touchUs: '0.11', nvmeUs: '45', hddMs: '12.7', dramNs: '70', minorX: '8', nvmeX: '649', hddX: '180857',
    emSlow: '1.001', enSlow: '1.06', ehSlow: '19', eh6Slow: '1.2', en10: '6484', eh10: '1808561', em10: '66',
    bf3: '9', bf4: '10', bl3: '10', bl4: '8', bo3: '7', bc3: '9', bc4: '10', bn: '12', lp4: '20', lpo: '8', lp5: '5', lpn: '20',
    cowN: '25600', cowMiB: '100', k10c: '2535', k1010c: '4840', k1010f: '5111', k1010both: '271',
    ctFlush: '51', ctTag: '0', ct6: '7', ct8: '51', ck0: '0.0', ckPcid: '0', ckFlush: '259', ckCr3: '2.2', ckCyc: '220', pcidN: '4096', ctxEntries: '1536', ctxWs: '256', ctxQ: '5000', ctxK: '8',
    n44: '24', n55: '35', n43: '19', n33: '15', n44x: '6',
    anLaunch: '3.16', anMax: '30', anPower: '4.56', anCamH: '4.48', anCamC: '6.60', anBoot: '8', anBootMs: '950', anVer: '15',
    apPage: '16', arm16: '47', arm64a: '42', arm64b: '52', arm4a: '39', cr3c: '100' };
  for (const [k, [v, d, kind]] of Object.entries(P)) check('prose ' + k, kind === 'pct' ? f(v * 100, d) : f(v, d), want[k]);
  check('every prose value pinned', Object.keys(P).sort().join(','), Object.keys(want).sort().join(','));
  const used = new Set();
  for (const m of html.matchAll(/data-i18n-html="([^"]+)"/g)) { const v = Z[m[1]] || ''; for (const p of v.matchAll(/\{(\w+)\}/g)) { used.add(p[1]); n++; if (!(p[1] in P)) { fails++; console.error(`FAIL {${p[1]}} in ${m[1]} is not filled on the page`); } } }
  for (const m of html.matchAll(/data-i18n="([^"]+)"/g)) { const v = Z[m[1]] || ''; for (const p of v.matchAll(/\{(\w+)\}/g)) { used.add(p[1]); n++; if (!(p[1] in P)) { fails++; console.error(`FAIL {${p[1]}} in ${m[1]} is not filled on the page`); } } }
  const unquoted = Object.keys(P).filter(k => !used.has(k));
  // values kept in prose() as anchors for the checks above, not quoted on the page
  const ANCHORS = new Set(unquoted.length ? unquoted.filter(k => ['ram', 'fragSteps', 'fMean', 'pages48', 'lv16k', 't57n', 'dram', 'l2lat', 'l1lat', 'dramNs', 'minorX', 'nvmeX', 'hddX', 'bn', 'ck0', 'pcidN', 'ctxEntries', 'ctxWs', 'ctxQ', 'ctxK', 'pwcT', 'f3FailP', 'cr3c', 'tlbW', 'lv57'].includes(k)) : []);
  for (const k of unquoted) { n++; if (!ANCHORS.has(k)) { fails++; console.error('FAIL prose() value ' + k + ' is never quoted'); } }
  // the claims the prose makes about the models
  check('ch1: first fit refuses more than paging at 6 MiB; the largest hole is far below the free total', P.fFailB[0] > P.fFailP[0] && P.fLargest[0] < P.fFree[0] / 2, true);
  check('ch1: 3 MiB both zero; 12 MiB both large', P.f3FailB[0] === 0 && P.f3FailP[0] === 0 && P.f12FailP[0] > 50, true);
  check('ch4: random 4 KiB misses most, 2 MiB almost none', P.r4[0] > 0.8 && P.r2[0] < 0.001, true);
  check('ch5: PWC cuts reads below half; five-level costs no more with the PWC', P.w1prefs[0] < P.w1refs[0] / 2 && Math.abs(P.w1p5refs[0] - P.w1prefs[0]) < 0.05, true);
  check('ch6: 2 MiB pages read ~1 per miss', Math.abs(P.h2refs[0] - 1) < 0.01, true);
  check('ch7: minor fault faster than any disk fault', P.minorUs[0] < P.nvmeUs[0] && P.nvmeUs[0] * 1000 < P.hddMs[0] * 1e6, true);
  check('ch8: Clock equals FIFO on Belady\'s string', P.bc3[0] === P.bf3[0] && P.bc4[0] === P.bf4[0], true);
  check('ch9: COW at 10 % copies about a tenth', Math.abs(P.k10c[0] / P.cowN[0] - 0.1) < 0.01, true);
  check('ch10: 8 processes tagged = flush; 6 in between', P.ct8[0] === P.ctFlush[0] && P.ct6[0] > P.ctTag[0] && P.ct6[0] < P.ctFlush[0], true);
  check('ch10: KPTI without PCID misses more than switching alone', P.ckFlush[0] > P.ctFlush[0], true);
}

/* ── sentence branches at the extremes of each control ── */
{
  const has = k => { n++; if (Z[k] == null) { fails++; console.error('FAIL missing say key ' + k); } };
  const seen = new Set(), add = s => { has(s.key); seen.add(s.key); };
  for (const m of M.FRAG.means) for (let t = 0; t < M.FRAG.steps; t++) add(M.say.frag(m, t));
  for (const v of [32, 39, 40, 48, 57]) for (const p of [4 * KiB, 16 * KiB, 64 * KiB]) for (const h of M.LAYOUT.heaps) add(M.say.table(v, p, h));
  add(M.say.walk(null));
  for (const lv5 of [false, true]) for (const p of Object.values(M.TOY.presets)) for (const a of ['r', 'w', 'x']) add(M.say.walk(M.walk(M.parseVA(p), lv5, a)));
  for (const tr of ['rand', 'seq', 'col']) for (const W of M.TLB.sizes) for (const e of [16, 1536, 4096]) for (const p of M.TLB.pages) add(M.say.tlb(tr, W, e, p));
  for (const W of M.WALK.sizes) for (const pwc of [false, true]) for (const lv5 of [false, true]) add(M.say.walkCost(W, 4 * KiB, pwc, lv5));
  for (const W of M.HUGE.sizes) for (const p of M.HUGE.pages) for (const s of [false, true]) add(M.say.huge(W, p, s));
  for (const k of M.FAULT.kinds) for (let e = -8; e <= -2; e += 0.25) add(M.say.eat(Math.pow(10, e), k));
  for (const s of ['belady', 'loop', 'local']) for (let fr = 1; fr <= 8; fr++) for (const p of M.POLICIES) add(M.say.repl(s, fr, p));
  for (const c of [0, 0.1, 1]) for (const g of [0, 0.1, 1]) add(M.say.cow(c, g));
  for (const K of [1, 4, 8]) for (const mode of ['tagged', 'flush']) for (const kp of [false, true]) add(M.say.ctx(K, mode, kp, 1000));
  for (const a of [0, 3, 4, 5]) for (const b of [0, 3, 4, 5]) add(M.say.nested(a, b));
  const all = Object.keys(Z).filter(k => /\.say\./.test(k));
  for (const k of all) check('branch reached ' + k, seen.has(k), true);
  for (const k of seen) has(k);
  check('ch3.say.bad shown by app.js', app.includes("'ch3.say.bad'"), true);
}

/* ── keys, language hygiene, registry, siblings ── */
{
  const keys = new Set([...html.matchAll(/data-i18n(?:-html|-aria|)="([^"]+)"/g)].map(m => m[1]));
  for (const m of app.matchAll(/'((?:ch\d+|dg|u|doc)\.[\w.-]*\w)'/g)) keys.add(m[1]);
  for (const m of html.matchAll(/data-hk="([^"]+)"/g)) keys.add(m[1]);
  for (const m of html.matchAll(/data-dg="(\w+)"/g)) { keys.add('dg.' + m[1] + '.aria'); keys.add('dg.' + m[1] + '.cap'); }
  for (const k of [...keys]) if (/\.$/.test(k)) keys.delete(k);
  for (const k of keys) { n++; if (Z[k] == null) { fails++; console.error('FAIL missing zh key ' + k); } }
  // the say sentences' placeholders are supplied by app.js
  for (const [k, v] of Object.entries(Z)) if (/\.say\./.test(k)) for (const m of v.matchAll(/\{(\w+)\}/g)) {
    n++; if (!new RegExp('\\b' + m[1] + '\\s*:|[{,]\\s*' + m[1] + '\\s*[,}]').test(app)) { fails++; console.error(`FAIL placeholder {${m[1]}} in ${k} is never supplied by app.js`); }
  }
  const dgs = [...html.matchAll(/class="dia" data-dg="(\w+)"/g)].map(m => m[1]);
  check('nine diagrams', dgs.join(), 'map,split,walk,pte,tlb,pwc,fault,cow,nested');
  for (const d of dgs) check('diagram spec ' + d, app.includes('DG.' + d + ' = '), true);
  for (const file of ['index.html', 'app.js', 'models.js']) {
    let src = fs.readFileSync(path.join(DIR, file), 'utf8');
    if (file === 'index.html') {
      const tt = src.match(/<title>([^<]*)<\/title>/)[1], md = src.match(/<meta name="description" content="([^"]*)">/)[1];
      check('static title = doc.title', tt, Z['doc.title']); check('static meta = doc.desc', md, Z['doc.desc']);
      src = src.replace(/<title>[^<]*<\/title>/, '').replace(/<meta name="description" content="[^"]*">/, '');
      src = src.replace(/<details class="page-provenance"[\s\S]*?<\/details>/, '');   // the bilingual label the registrar adds later
    }
    src = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '').replace(/<!--[\s\S]*?-->/g, '');
    n++;
    const others = (src.match(/[一-鿿]+/g) || []).filter(x => !(file === 'index.html' && x === '中'));
    if (others.length) { fails++; console.error(`FAIL Chinese text in ${file}: ${others.slice(0, 3).join(' ')}`); }
  }
  const R = JSON.parse(fs.readFileSync(path.join(DIR, 'REGISTRY.json'), 'utf8'));
  check('registry slug/path', R.slug + ' ' + R.path, 'how-virtual-memory-works computing/systems/how-virtual-memory-works/');
  check('registry category', [R.category, R.subtopic, R.stage].join('/'), 'computing/systems/university');
  check('registry title', R.title.zh, Z['doc.title'].split(' · ')[0]); check('registry desc', R.desc.zh, Z['doc.desc']);
  check('hero title = registry title', Z['hero.title'], R.title.zh);
  for (const c of R.concepts) check('anchor ' + c.anchor, html.includes('id="' + c.anchor.slice(1) + '"'), true);
  for (const c of R.concepts) { n++; if (!c.aliases.zh.length || !c.aliases.en.length || !c.title.en || !c.desc.en) { fails++; console.error('FAIL concept incomplete ' + c.id); } }
  check('one concept per chapter', R.concepts.map(c => c.anchor).join(), Array.from({ length: 13 }, (_, i) => '#ch' + (i + 1)).join());
  // one word, one owner: no alias already held by a sibling essay
  const norm = s => s.toLowerCase().replace(/\s+/g, '');
  const owned = new Map();
  for (const sib of ['how-cpu-caches-work', 'why-compute-waits-for-memory', 'switches-that-compute', 'how-pcie-works', 'how-a-computer-is-wired', 'how-thunderbolt-works', 'what-a-drive-is-made-of', 'how-a-cpu-runs-a-program']) {
    const p = path.join(DIR, '..', sib, 'REGISTRY.json');
    if (fs.existsSync(p)) for (const c of JSON.parse(fs.readFileSync(p, 'utf8')).concepts) for (const a of [...c.aliases.zh, ...c.aliases.en]) owned.set(norm(a), sib);
  }
  const mine = new Set();
  for (const c of R.concepts) for (const a of [...c.aliases.zh, ...c.aliases.en]) {
    n++; if (owned.has(norm(a))) { fails++; console.error(`FAIL alias owned by ${owned.get(norm(a))}: ${a}`); }
  }
  // an alias may appear in both languages of one concept, but not in two concepts
  for (const c of R.concepts) { const here = new Set([...c.aliases.zh, ...c.aliases.en].map(norm)); for (const a of here) { n++; if (mine.has(a)) { fails++; console.error('FAIL alias in two concepts: ' + a); } } for (const a of here) mine.add(a); }
  // live sibling links must point at chapters that exist; A4 / A5 are named in plain text, not linked
  const all = Object.values(Z).join('');
  const hrefs = [...all.matchAll(/href='([^']+)'/g)].map(m => m[1]);
  for (const h of hrefs) {
    const m = h.match(/^\.\.\/([\w-]+)\/(#ch\d+)?$/);
    n++; if (!m) { fails++; console.error('FAIL unexpected link ' + h); continue; }
    const sh = path.join(DIR, '..', m[1], 'index.html');
    n++; if (!fs.existsSync(sh)) { fails++; console.error('FAIL link to a missing page ' + h); continue; }
    if (m[2]) check('anchor exists ' + h, fs.readFileSync(sh, 'utf8').includes(`id="${m[2].slice(1)}"`), true);
  }
  for (const want of ['../how-cpu-caches-work/#ch7', '../how-cpu-caches-work/#ch10', '../why-compute-waits-for-memory/#ch2', '../how-thunderbolt-works/#ch8', '../how-pcie-works/#ch7']) check('links to ' + want, hrefs.includes(want), true);
  check('no links to the unwritten A4 / A5', /how-cores-share-memory|speculat|out-of-order/.test(hrefs.join()), false);
  says('ch10.p4', '后续一篇讲 CPU 怎样提前猜测执行的文章');

  const ectx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.en.js'), 'utf8'), ectx);
  const EN = ectx.window.ESSAY_COPY.en, stub = ectx.window.ESSAY_COPY.enStub === true, ph = s => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');
  check('en keys = zh keys', Object.keys(EN).sort().join('|'), Object.keys(Z).sort().join('|'));
  for (const k of Object.keys(Z)) check('en placeholders ' + k, ph(EN[k]), ph(Z[k]));
  if (stub) { check('en stub mirrors zh exactly', JSON.stringify(EN), JSON.stringify(Z)); console.log('NOTE: copy.en.js is a stub (enStub); English registry match skipped until it is translated'); }
  else { check('registry title en', R.title.en, EN['doc.title'].split(' · ')[0]); check('registry desc en', R.desc.en, EN['doc.desc']); }
}

if (fails) { console.error(`\n${fails} of ${n} checks failed`); process.exit(1); }
console.log(`PASS: ${n} checks (SDM / AMD / Linux / Android figures, hand-split addresses and Table 5-20 bits, the walk step by step, TLB closed forms, Belady's string, nm + n + m, the EAT formula, and every number in the prose match the models)`);
