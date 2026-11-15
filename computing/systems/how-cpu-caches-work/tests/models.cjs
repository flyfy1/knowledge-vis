'use strict';
// Pins the page's cache models: the engine against hand-worked sequences (LRU, tree pseudo-LRU, the toy cache), the
// 3C classification against its definition, Belady's optimum as an upper bound, the ch1 reuse-distance shortcut
// against a simulation of the actual interleaved trace, the MESI table against the Illinois protocol, the closed
// forms behind the VIPT limit, the write model and the staircase; the real-chip figures against the values typed
// from their sources; every number the prose quotes (placeholders filled from prose(), literals checked against
// models.js); how far each conclusion moves when a tuned parameter is halved or doubled; every live sentence branch;
// copy keys, language hygiene, the registry and the sibling essays' aliases.
// Run: node computing/systems/how-cpu-caches-work/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const M = require(path.join(DIR, 'models.js'));
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;
const html = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(DIR, 'app.js'), 'utf8');
const { KiB, MiB, LINE, CHIPS, ZEN, FRONTIER } = M;

let n = 0, fails = 0;
function check(name, got, want) { n++; if (got !== want) { fails++; console.error(`FAIL ${name}: model gives ${got}, expected ${want}`); } }
function near(name, got, want, tol) { n++; if (!(Math.abs(got - want) <= tol)) { fails++; console.error(`FAIL ${name}: ${got} not within ${tol} of ${want}`); } }
function says(key, phrase) { n++; if (!Z[key] || !Z[key].includes(phrase)) { fails++; console.error(`FAIL prose ${key} should contain "${phrase}"`); } }
const f = (x, d) => x.toFixed(d);

/* ── real-chip figures, typed again from the sources (BRIEF.md lists URL and date for each) ── */
{
  // AMD 58455 rev 1.00 §2.6 / Hot Chips 2024
  check('Zen 5 L1I 32 KiB 8-way', [ZEN.l1i.size, ZEN.l1i.ways].join(), [32 * KiB, 8].join());
  check('Zen 5 L1D 48 KiB 12-way, 4–5 cycles', [ZEN.l1d.size, ZEN.l1d.ways, ZEN.l1d.lat, ZEN.l1d.latMax].join(), [48 * KiB, 12, 4, 5].join());
  check('Zen 5 L2 1 MiB 16-way, 14 cycles', [ZEN.l2.size, ZEN.l2.ways, ZEN.l2.lat].join(), [MiB, 16, 14].join());
  check('Zen 5 L3 32 MiB per 8-core CCX, 16-way, 46 cycles, up to 96 MiB', [ZEN.l3.size, ZEN.l3.ways, ZEN.l3.lat, ZEN.l3.perCcx, ZEN.l3.maxSoc].join(), [32 * MiB, 16, 46, 8, 96 * MiB].join());
  check('Zen 5 line 64 B', ZEN.line, 64);
  check('Strix Point: 4 Zen 5 + 16 MB, 8 Zen 5c + 8 MB', [CHIPS.strix.zen5, CHIPS.strix.zen5L3, CHIPS.strix.zen5c, CHIPS.strix.zen5cL3].join(), [4, 16 * MiB, 8, 8 * MiB].join());
  check('9950X 5.7 GHz, 64 MB L3', [CHIPS.r9950x.ghz, CHIPS.r9950x.l3].join(), [5.7, 64 * MiB].join());
  check('DRAM 70 ns (Chips and Cheese 9950X)', CHIPS.dramNs, 70);
  check('Lion Cove L0 48 KiB 4 cycles, L1 192 KiB 9 cycles, L2 2.5/3 MiB 17 cycles', [CHIPS.lionCove.l0.size, CHIPS.lionCove.l0.lat, CHIPS.lionCove.l1.size, CHIPS.lionCove.l1.lat, CHIPS.lionCove.l2.size, CHIPS.lionCove.l2.sizeAlt, CHIPS.lionCove.l2.lat].join(),
    [48 * KiB, 4, 192 * KiB, 9, 2.5 * MiB, 3 * MiB, 17].join());
  check('Redwood Cove L1 48 KiB 5 cycles, L2 2 MiB', [CHIPS.lionCove.prev.l1.size, CHIPS.lionCove.prev.l1.lat, CHIPS.lionCove.prev.l2.size].join(), [48 * KiB, 5, 2 * MiB].join());
  check('Lunar Lake: Skymont L2 4 MB, L3 12 MB, 8 MB memory-side, L3 51 cycles, DRAM 131 ns', [CHIPS.lunarLake.skymontL2, CHIPS.lunarLake.l3, CHIPS.lunarLake.msc, CHIPS.lunarLake.l3lat, CHIPS.lunarLake.dramNs].join(), [4 * MiB, 12 * MiB, 8 * MiB, 51, 131].join());
  check('Neoverse V3 L1D 64 KiB 4-way 4 cycles; L2 2 MiB 8-way or 3 MiB 12-way', [CHIPS.neoV3.l1d.size, CHIPS.neoV3.l1d.ways, CHIPS.neoV3.l1d.lat, CHIPS.neoV3.l2.size, CHIPS.neoV3.l2.ways, CHIPS.neoV3.l2alt.size, CHIPS.neoV3.l2alt.ways].join(),
    [64 * KiB, 4, 4, 2 * MiB, 8, 3 * MiB, 12].join());
  check('Apple M6 sysctl (2026-11-15)', [CHIPS.appleHost.l1d, CHIPS.appleHost.l1i, CHIPS.appleHost.l2, CHIPS.appleHost.l2share, CHIPS.appleHost.page, CHIPS.appleHost.line].join(), [131072, 196608, 20971520, 2, 16384, 128].join());
  check('9800X3D: 64 MB stacked, 96 MB L3, 104 MB total, below the die', [FRONTIER.x3d.stacked, FRONTIER.x3d.l3, FRONTIER.x3d.total, FRONTIER.x3d.below, FRONTIER.x3d.announced].join(), [64 * MiB, 96 * MiB, 104 * MiB, true, '2024-10-31'].join());
  check('9800X3D total = 8 × 1 MB L2 + 96 MB L3', FRONTIER.x3d.total, 8 * ZEN.l2.size + FRONTIER.x3d.l3);
  check('EPYC 9755 512 MB / 128 cores, 2024-10-10; Xeon 6980P 504 MB; MI300X 256 MB, 2023-12-06', [FRONTIER.epyc9755.l3, FRONTIER.epyc9755.cores, FRONTIER.epyc9755.launch, FRONTIER.xeon6980p.l3, FRONTIER.mi300x.llc, FRONTIER.mi300x.launch].join(),
    [512 * MiB, 128, '2024-10-10', 504 * MiB, 256 * MiB, '2023-12-06'].join());
  check('N2 SRAM 38 Mb/mm², +11 % over N3, N3 +6 % (2024-12-12)', [FRONTIER.sram.n2Mb, FRONTIER.sram.n2Gain, FRONTIER.sram.n3Gain, FRONTIER.sram.date].join(), [38, 11, 6, '2024-12-12'].join());
  check('Zen 6 as reported (2026-11-11)', [FRONTIER.zen6.l3PerCore, FRONTIER.zen6.ccdCores, FRONTIER.zen6.ccdL3, FRONTIER.zen6.zen6cCcdCores, FRONTIER.zen6.zen6cL3, FRONTIER.zen6.reported].join(), [4 * MiB, 12, 48 * MiB, 32, 128 * MiB, '2026-11-11'].join());
  check('Zen 6 CCD L3 = cores × per-core', FRONTIER.zen6.ccdL3, FRONTIER.zen6.ccdCores * FRONTIER.zen6.l3PerCore);
  check('as of 2026-11', FRONTIER.asOf, '2026-11'); says('ch11.title', '2026 年 11 月');
  const ymd = s => { const [y, m, d] = s.split('-').map(Number); return `${y} 年 ${m} 月 ${d} 日`; };
  says('ch11.e1', ymd(FRONTIER.x3d.announced)); says('ch11.e2', ymd(FRONTIER.epyc9755.launch)); says('ch11.e2', ymd(FRONTIER.mi300x.launch));
  says('ch11.c1', ymd(FRONTIER.zen6.reported)); says('ch11.d4', ymd(FRONTIER.sram.date).replace(/ 12 日$/, ' 12 日'));
  says('ch11.d1', '2024 年 8 月 14 日'); says('ch11.d2', '2024 年 9 月 27 日'); says('ch11.d3', '2026 年 6 月 13 日');
  says('ch6.r.lc.src', '2024 年 9 月 27 日'); says('ch6.r.v3.src', '2026 年 6 月 13 日'); says('ch6.r.apple.src', '2026 年 11 月 15 日'); check('Apple read date', CHIPS.appleHost.read, '2026-11-15');
  says('ch6.r.zen5.src', '2024 年 8 月'); check('AMD guide date', ZEN.docDate, '2024-08');
  check('DRAM in cycles = 70 ns × 5.7 GHz', M.dramCycles(), 70 * 5.7);
}

/* ── 02 the address split and the toy cache, by hand ── */
{
  const g = M.geometry(48 * KiB, 12);
  check('Zen 5 L1D: 64 sets, 6 + 6 bits', [g.sets, g.offBits, g.idxBits, g.lowBits].join(), '64,6,6,12');
  const g3 = M.geometry(32 * MiB, 16);
  check('Zen 5 L3: 32,768 sets, 15 index bits, 21 low bits', [g3.sets, g3.idxBits, g3.lowBits].join(), '32768,15,21');
  const s = M.split(0x7ffd3a5c9e48, g);
  check('split 0x7ffd3a5c9e48 in L1D', [s.offset, s.index, s.tag].join(), [0x7ffd3a5c9e48 % 64, Math.floor(0x7ffd3a5c9e48 / 64) % 64, Math.floor(0x7ffd3a5c9e48 / 4096)].join());
  check('parseHex accepts 0x, rejects junk', [M.parseHex('0x1A0'), M.parseHex('1a0'), M.parseHex('zz')].join(), '416,416,');
  // the toy: 128 B direct-mapped, 16 B lines → 8 sets; a at 0x100 is lines 16–17 (sets 0, 1); b at 0x180 is lines
  // 24–25 (sets 0, 1): every access evicts the other array. b at 0x1A0 is lines 26–27 (sets 2, 3): 4 cold misses.
  const a = M.toyRun(0x180, 1), b = M.toyRun(0x1A0, 1), c = M.toyRun(0x180, 2);
  check('toy b@0x180 direct-mapped: 16 of 16 miss', a.misses + '/' + a.steps.length, '16/16');
  check('toy b@0x1A0: 4 misses (one per line)', b.misses, 4);
  check('toy 2-way: 4 misses', c.misses, 4);
  check('toy step 2 lands in set 0 and evicts a', [a.steps[1].set, a.steps[1].evicted].join(), '0,16');
  says('ch2.p3', '128 字节'); says('ch2.p3', '每行 16 字节'); says('ch2.p3', '一共 8 组'); check('toy constants', [M.TOY.size, M.TOY.line, M.TOY.size / M.TOY.line].join(), '128,16,8');
  says('ch2.code', '0x100'); says('ch2.code', '0x180'); says('ch2.code', '0x1A0'); says('ch2.code', 'i < 8');
  check('toy bases', [M.TOY.aBase, ...M.TOY.bBases, M.TOY.n].join(), [0x100, 0x180, 0x1A0, 8].join());
  says('ch2.p4', '正好差 128 字节'); check('b − a = cache size', M.TOY.bBases[0] - M.TOY.aBase, M.TOY.size);
}

/* ── the engine: LRU and tree pseudo-LRU by hand ── */
{
  // 1 set × 4 ways LRU: A B C D, touch A, insert E → evicts B
  const c = M.makeCache({ size: 4 * 64, ways: 4, policy: 'lru' });
  for (const L of [1, 2, 3, 4]) c.fill(L, 0);
  c.touch(c.probe(1), 0);
  check('LRU evicts the least recently used', c.fill(5, 0).line, 2);
  // 8-way tree PLRU: fill ways 0–7 (lines 0–7), touch line 2 → victim way 4; then touch line 4 → victim way 0
  const p = M.makeCache({ size: 8 * 64, ways: 8, policy: 'plru' });
  for (let i = 0; i < 8; i++) p.fill(i, 0);
  p.touch(p.probe(2), 0);
  check('PLRU bits after touching way 2', p.treeBits(0).join(''), '1000100');
  check('PLRU victim after touching way 2 is way 4', p.fill(100, 0).line, 4);
  const q = M.makeCache({ size: 8 * 64, ways: 8, policy: 'plru' });
  for (let i = 0; i < 8; i++) q.fill(i, 0);
  q.touch(q.probe(2), 0); q.touch(q.probe(4), 0);
  check('PLRU victim after touching ways 2 then 4 is way 0', q.fill(100, 0).line, 0);
  says('ch4.p1', '8 路只用 7 个位'); check('7 bits for 8 ways', p.treeBits(0).length, 7);
  // SRRIP: insert at 2, hit → 0, victim = first at 3 after ageing; a hit line outlives a never-reused one
  const r = M.makeCache({ size: 2 * 64, ways: 2, policy: 'srrip' });
  r.fill(1, 0); r.fill(2, 0); r.touch(r.probe(1), 0);
  check('SRRIP keeps the re-referenced line', r.fill(3, 0).line, 2);
  says('ch4.p3', '1/32'); check('BRRIP epsilon is 1/32 in the engine', /R\(\) < 1 \/ 32 \? 2 : 3/.test(fs.readFileSync(path.join(DIR, 'models.js'), 'utf8')), true);
}

/* ── 03 3C: by definition ── */
{
  const G = M.c3grid(), tr = M.progTrace();
  const distinct = new Set(Array.from(tr.addr, a => Math.floor(a / LINE))).size;
  for (const [k, r] of Object.entries(G)) {
    check(`3C ${k}: parts sum to misses`, r.comp + r.cap + r.conf, r.misses);
    check(`3C ${k}: compulsory = distinct lines`, r.comp, distinct);
    const [w, s] = k.split(':');
    const sim = M.run(tr, { size: +s, ways: w === 'fa' ? +s / LINE : +w, policy: 'lru' });
    check(`3C ${k}: misses = an independent run`, r.misses, sim.misses);
    if (w === 'fa') check(`3C ${k}: fully associative has no conflict misses`, r.conf, 0);
  }
  check('trace length', tr.addr.length, M.PROG.reps * (3 * M.PROG.arr / 4 + M.PROG.look));
  check('A, B, C 64 KiB apart, a multiple of every direct-mapped way size up to 64 KiB', M.C3.sizes.every(s => M.PROG.gap % s === 0), true);
  check('2-way 16 KiB does not help (three arrays per set)', G['2:' + 16 * KiB].misses, G['1:' + 16 * KiB].misses);
  check('4-way 16 KiB = compulsory only', G['4:' + 16 * KiB].misses, G['4:' + 16 * KiB].comp);
}

/* ── 04 replacement: Belady is an upper bound; LRU on a cyclic loop larger than every set ── */
{
  for (const kind of ['loop', 'scan', 'prog']) for (const x of [0.5, 1, 1.05, 1.25, 2, 3]) {
    if (kind !== 'loop' && x !== 1) continue;
    const opt = M.replace(kind, x, 'opt').hitRate;
    for (const p of M.POLICIES) { n++; if (M.replace(kind, x, p).hitRate > opt + 1e-12) { fails++; console.error(`FAIL ${kind} ${x}: ${p} beats Belady`); } }
  }
  check('LRU on a loop 1.25× the cache (every set over-full): no hits', M.replace('loop', 1.25, 'lru').hits, 0);
  check('loop that fits: 11 of 12 passes hit', f(M.replace('loop', 1, 'lru').hitRate, 6), f(11 / 12, 6));
  says('ch4.p4', '1.25 倍'); check('ch4 default slider 1.25', /id="rpL"[^>]*value="1\.25"/.test(html), true);
  check('ch4: random and BRRIP beat LRU on the loop', M.replace('loop', 1.25, 'random').hitRate > 0.5 && M.replace('loop', 1.25, 'brrip').hitRate > 0.6, true);
  check('ch4: SRRIP beats LRU on the scan', M.replace('scan', 0, 'srrip').hitRate > M.replace('scan', 0, 'lru').hitRate, true);
}

/* ── 05 writes ── */
{
  const P = M.WRITE, wt = M.writes('wt-na', 4), wb = M.writes('wb-a', 4);
  check('write-through writes every store (8 bytes each)', wt.writeBytes, wt.stores * P.store);
  check('write-back writes whole lines', wb.writeBytes % LINE, 0);
  check('stores: 4 × 2,048 stencil + 342 bursts × 8', wt.stores, 4 * 2048 + Math.ceil(8192 / 24) * 8);
  says('ch5.model.how', '16 KiB 的数组'); says('ch5.model.how', '64 KiB 的输入'); says('ch5.model.how', '每读 24 个数就连着写 8 个'); says('ch5.model.how', '四遍');
  check('allocate reads the output lines in: wb-a − wt-na reads = output lines', wb.readBytes - wt.readBytes, Math.ceil(Math.ceil(8192 / 24) * 8 * 8 / LINE) * LINE);
  const w = d => M.writes('wt-na', d).waitShare;
  check('deeper buffer, less waiting', w(0) > w(1) && w(1) >= w(2) && w(2) >= w(4) && w(4) >= w(8), true);
  check('TR is Zen 5 L2 latency', P.TR, ZEN.l2.lat);
  says('ch5.p3', '每次 8 字节'); check('store size 8', P.store, 8);
  says('ch5.p3', '改四遍');
}

/* ── 01 the reuse-distance shortcut against a simulation of the actual trace ── */
{
  // each level an LRU cache of its capacity, fully associative (Mattson's inclusion property: an inclusive LRU
  // hierarchy serves an access at the first level whose LRU stack holds it). Table 4 MiB so a full sweep fits a
  // test run; warm-up one third.
  const T = 4, n0 = 2400000, tr = M.programTrace(n0, T), lv = ['l1', 'l2', 'l3'].map(k => M.LEVELS[k].size / LINE);
  const caches = lv.map(cap => { const m = new Map(); return { hit(L) { if (m.has(L)) { m.delete(L); m.set(L, 1); return true; } m.set(L, 1); if (m.size > cap) m.delete(m.keys().next().value); return false; } }; });
  const served = [0, 0, 0, 0]; let cnt = 0;
  for (let k = 0; k < n0; k++) {
    const L = Math.floor(tr.addr[k] / LINE), h = caches.map(c => c.hit(L)), i = h.indexOf(true);
    if (k > n0 / 3) { served[i < 0 ? 3 : i]++; cnt++; }
  }
  const a = M.amat({ l1: 1, l2: 1, l3: 1 }, T).served;
  ['l1', 'l2', 'l3', 'mem'].forEach((k, i) => near('ch1 simulated share at ' + k, served[i] / cnt, a[k], 0.002));
  const P = M.PROGRAM.loops;
  check('ch1 program shares sum to 1', f(P.reduce((s, l) => s + l.p, 0), 9), f(1, 9));
  says('ch1.p5', '拖到 32 MiB'); check('ch1: table at 32 MiB = no L3', f(M.amat({ l1: 1, l2: 1, l3: 1 }, 32).amat, 9), f(M.amat({ l1: 1, l2: 1 }, 32).amat, 9));
  check('ch1 slider stops include 32', /const TABLES = \[1, 2, 4, 8, 16, 32, 64\]/.test(app), true);
}

/* ── 06 hierarchy ── */
{
  const H = M.HIER, ex = M.hierarchy('excl', H.l3.dense, 2 * H.l2), inc = M.hierarchy('incl', H.l3.dense, 2 * H.l2);
  check('exclusive: W = L2 + L3 fits entirely', ex.hit, 1);
  near('inclusive: hit ≈ L3 / W under uniform access', inc.hit, H.l3.dense / (2 * H.l2), 0.01);
  check('capacity: incl = L3, excl = L2 + L3', [M.capacityOf('incl', H.l3.dense), M.capacityOf('excl', H.l3.dense)].join(), [H.l3.dense, H.l2 + H.l3.dense].join());
  check('scale: 1 MiB L2 / 16', H.l2 * H.scale, ZEN.l2.size);
  check('desk L3 share = 32 MiB / 8 cores, scaled', H.l3.desk * H.scale, ZEN.l3.size / ZEN.l3.perCcx);
  check('dense L3 share = Strix Point Zen 5c 8 MB / 8 cores, scaled', H.l3.dense * H.scale, CHIPS.strix.zen5cL3 / CHIPS.strix.zen5c);
  check('non-inclusive between the two', inc.hit < M.hierarchy('nincl', H.l3.dense, 2 * H.l2).hit && M.hierarchy('nincl', H.l3.dense, 2 * H.l2).hit < ex.hit, true);
}

/* ── 07 VIPT ── */
{
  for (const page of [4096, 16384, 65536]) for (const ways of [4, 8, 12, 16]) for (const s of [16, 32, 48, 64, 96, 128, 192, 256]) {
    const r = M.vipt(s * KiB, ways, page);
    if (!r.pow2) continue;
    check(`VIPT ${s}K/${ways}/${page}: fits ⇔ size ≤ page × ways`, r.fits, s * KiB <= page * ways);
  }
  const z = M.vipt(48 * KiB, 12, 4096), v = M.vipt(64 * KiB, 4, 4096), ap = M.vipt(128 * KiB, 8, 16384);
  check('Zen 5 L1D exactly at the limit', [z.fits, z.limit].join(), [true, 48 * KiB].join());
  check('Neoverse V3: 2 extra bits, 4 sets, limit 16 KiB', [v.extra, v.aliases, v.limit].join(), [2, 4, 16 * KiB].join());
  check('Apple: 128 KiB with 16 KiB pages and 8 ways fits', ap.fits, true);
  says('ch7.p2', '每路 4 KiB'); check('48 KiB / 12 = 4 KiB', ZEN.l1d.size / ZEN.l1d.ways, 4096);
}

/* ── 08 prefetch ── */
{
  for (const t of ['stride', 'matrix', 'list', 'mix']) for (const m of ['none', 'next', 'stride']) for (const d of [1, 4, 8, 32]) for (const g of [1, 2, 4]) {
    const r = M.prefetch(t, m, d, g);
    n++; if (!(r.useful <= r.issued && r.coverage <= 1 && r.misses + r.useful === r.base || m === 'none' && r.issued === 0)) {
      // with prefetching, demand misses can differ from base − useful (pollution), so only bounds are exact
      if (!(r.useful <= r.issued && r.coverage <= 1)) { fails++; console.error(`FAIL prefetch bounds ${t} ${m} ${d} ${g}`); }
    }
  }
  check('list: the stride prefetcher never issues', M.prefetch('list', 'stride', 4, 1).issued, 0);
  check('matrix column: every element in one set (4096 B stride, 64 sets)', (4096 / LINE) % (M.PF.size / LINE / M.PF.ways), 0);
  // reviewer: the cliff. In the single set, a line prefetched d steps ahead must outlive the d − 1 later prefetches and
  // the d − 1 demand hits that refresh newer lines meanwhile: 2(d − 1) + 1 ≤ ways, so d ≤ 4 with 8 ways. The prose says
  // "4 steps 99 %, 5 or more 0 %".
  for (let d = 1; d <= 8; d++) { const cov = M.prefetch('matrix', 'stride', d, 1).coverage, fitsLRU = 2 * (d - 1) + 1 <= M.PF.ways;
    check('matrix column, distance ' + d + ': covered iff 2(d-1)+1 <= ways', fitsLRU ? cov > 0.98 : cov === 0, true); }
  says('ch8.p3', '5 步');
  // reviewer: the ratios quoted in ch1.p3 ("Zen 5: each cache level outwards 20–30× larger, 3–4× slower; L3 → memory 8–9×")
  { const r = [ZEN.l2.size / ZEN.l1d.size, ZEN.l3.size / ZEN.l2.size], l = [ZEN.l2.lat / ZEN.l1d.lat, ZEN.l3.lat / ZEN.l2.lat], m = M.dramCycles() / ZEN.l3.lat;
    check('ch1.p3 size ratios 20–30×', r.every(x => x >= 20 && x <= 33), true); check('ch1.p3 latency ratios 3–4×', l.every(x => x >= 3 && x < 4), true);
    check('ch1.p3 L3 → memory 8–9×', m >= 8 && m < 9, true);
    says('ch1.p3', '以 Zen 5 为例，三级缓存每往外一级，容量大二十到三十多倍，延迟也多三四倍'); says('ch1.p3', '再多八九倍'); }
  // reviewer: jia.je's aliasing test (Graviton 5): 8,778,731,053 vs 5,298,206,743 cycles = 1.66×
  check('Neoverse V3 alias slowdown 1.66×', (8778731053 / 5298206743).toFixed(2), '1.66'); says('ch7.p3', '1.66 倍'); says('ch11.d3', '1.66 倍');
  says('ch11.e3', '一个核心复合体共享的 L3 最多');
  says('ch8.p3', '每条记录 256 字节'); says('ch8.p3', '每行 4096 字节'); says('ch8.p3', '往前取 4 步'); says('ch8.p3', '往前取 5 步'); says('ch8.p3', '8 步也是'); says('ch8.p3', '2 × 4 + 1 = 9 行抢 8 路'); says('ch8.p3', '一组只有 8 路');
  check('pf ways 8', M.PF.ways, 8); check('ch8 default distance 4', /id="pfD"[^>]*value="4"/.test(html), true);
  says('ch8.p4', '4 MiB 的散列表'); check('hash table 65,536 lines = 4 MiB', 65536 * LINE, 4 * MiB);
}

/* ── 09 MESI (Illinois) and false sharing ── */
{
  const T = (a, c, op) => { const r = M.mesiStep(a.split(''), c, op); return r.st.join('') + (r.bus ? ' ' + r.bus : '') + (r.wb ? ' wb' : '') + (r.inval ? ' inv' : ''); };
  check('I,I core0 read → E (from memory)', T('II', 0, 'R'), 'EI BusRd');
  check('E,I core1 read → S,S', T('EI', 1, 'R'), 'SS BusRd');
  check('M,I core1 read → S,S with write-back', T('MI', 1, 'R'), 'SS BusRd wb');
  check('E,I core0 write → M silently', T('EI', 0, 'W'), 'MI');
  check('S,S core0 write → M,I upgrade', T('SS', 0, 'W'), 'MI BusUpgr inv');
  check('I,M core0 write → M,I read-for-ownership, write-back', T('IM', 0, 'W'), 'MI BusRdX wb inv');
  check('M,I core0 evict → I with write-back', T('MI', 0, 'E'), 'II wb');
  check('M,I core0 write → hit', T('MI', 0, 'W'), 'MI');
  const F = M.FS;
  check('false sharing, alternate every add', M.falseSharing(true, 1).tx, 4 * F.N - 1);
  for (const g of F.gs) check('padded: two cold reads only, g=' + g, M.falseSharing(false, g).tx, 2);
  const per = TC => M.falseSharing(true, 1, { TC }).perAdd, r = M.falseSharing(true, 1);
  check('cost is linear in TC', f(per(F.TC / 2), 6), f((r.ops + r.tx * F.TC / 2) / (2 * F.N), 6));
  says('ch9.p4', '每 64 下'); check('64 is a slider stop', F.gs.includes(64), true);
}

/* ── 10 staircase ── */
{
  check('fits in L1 → 4 cycles', M.staircase(24 * KiB, 4096).cycles, ZEN.l1d.lat);
  check('2 MiB pages, 1 MiB → L2 exactly', M.staircase(1 * MiB, 2 * MiB).cycles, ZEN.l2.lat);
  near('128 MiB → DRAM', M.staircase(128 * MiB, 4096).cycles, M.dramCycles(), 0.5);
  check('4 KiB pages cost more than 2 MiB at 768 KiB', M.staircase(768 * KiB, 4096).cycles > M.staircase(768 * KiB, 2 * MiB).cycles, true);
  says('ch10.p3', '第 15 位'); check('L2 index top bit = 15', M.geometry(ZEN.l2.size, ZEN.l2.ways).lowBits - 1, 15);
  says('ch10.p3', '高出 4 位'); check('4 bits above the 4 KiB page offset', M.geometry(ZEN.l2.size, ZEN.l2.ways).lowBits - 12, 4);
  says('ch10.p3', '超过 16 行'); check('16-way L2', ZEN.l2.ways, 16);
  says('ch10.p2', '24 KiB'); says('ch10.p2', '512 KiB'); says('ch10.p2', '16 MiB'); says('ch10.p2', '128 MiB'); says('ch10.p3', '1 MiB'); says('ch10.p3', '768 KiB');
}

/* ── tuned parameters: halved / doubled (BRIEF.md lists the same) ── */
{
  check('ch5: TW halved, 4-entry write-through no longer waits', M.writes('wt-na', 4, { TW: M.WRITE.TW / 2 }).waitShare, 0);
  check('ch5: TW doubled, 4-entry write-through waits a fifth of the time or more', M.writes('wt-na', 4, { TW: M.WRITE.TW * 2 }).waitShare > 0.2, true);
  check('ch5: write-back at 4 entries, TW doubled, still waits less than write-through', M.writes('wb-a', 4, { TW: M.WRITE.TW * 2 }).waitShare < M.writes('wt-na', 4, { TW: M.WRITE.TW * 2 }).waitShare, true);
  check('ch9: TC halved/doubled keeps padded ≪ same line', M.falseSharing(true, 1, { TC: M.FS.TC / 2 }).perAdd > 20 * M.falseSharing(false, 1, { TC: M.FS.TC / 2 }).perAdd, true);
  // ch1: the program's shares; halving or doubling the L3-bound share keeps the three-level ordering
  const alt = (p) => { const save = M.PROGRAM.loops.map(l => l.p); M.PROGRAM.loops[2].p = p; M.PROGRAM.loops[0].p = 1 - p - save[1] - save[3];
    const r = ['l123', 'l13', 'l12', 'l1'].map(k => M.amat({ l1: /1/.test(k), l2: /2/.test(k.slice(1)), l3: /3/.test(k) }).amat); M.PROGRAM.loops.forEach((l, i) => { l.p = save[i]; }); return r; };
  for (const p of [0.06, 0.24]) { const [a, b, c, d] = alt(p); check(`ch1: table share ${p}: three levels < L1+L3 < L1+L2 < L1`, a < b && b < c && c < d, true); }
}

/* ── every prose placeholder is a prose() key; pinned values ── */
{
  const P = M.prose();
  const want = { dram: '399', amat3: '23.4', amat1: '162', amatL3: '56.6', amat13: '31.4', amat12: '65.8', amat0: '399', memShare: '3', memPart: '51', dStack: '427', dWork: '10086', dTable: '170240', amatBig: '65.8',
    pStack: '60', pWork: '25', pTable: '12', pStream: '3', szStack: '16', szWork: '384', szTable: '8', l1Lines: '768',
    z1sets: '64', z1idx: '6', z1low: '12', z2sets: '1024', z2idx: '10', z3sets: '32768', z3idx: '15', z3low: '21', toyMissA: '16', toyMissB: '4', toyMiss2: '4', toyN: '16',
    progArr: '4', progGap: '64', progTable: '2', progLook: '256', progReps: '4',
    c3n: '13312', c3comp: '224', dm16: '12416', dm16conf: '12192', w2_16: '12416', w4_16: '224', fa16: '224', fa8cap: '672', fa8: '896', dm64: '12416', dm64conf: '12192', w2_8conf: '11520',
    lruLoop: '0.0', plruLoop: '1.7', rndLoop: '57.1', srripLoop: '0.0', brripLoop: '64.1', optLoop: '71.7', lruScan: '30.0', srripScan: '45.0', brripScan: '57.5', optScan: '57.5',
    wSize: '32', wWays: '8', wTR: '14', wTW: '3', wtWrite: '85', wbWrite: '37', wbRead: '101', wtRead: '80', wbnaWrite: '37', stores: '10928', wtWait0: '35', wtWait4: '3', wtWait8: '0', wbWait4: '0.0', wtWaitH: '0', wtWaitD: '23',
    hWmib: '2', hW4mib: '5', hInc: '50', hExc: '100', hNin: '58', hBack: '502', hDeskI: '80', hDeskE: '91',
    v1low: '12', v1page: '12', vNextra: '2', vNlimit: '16', apNeedW: '8',
    pfSize: '32', pfWays: '8', pfStrideCov: '100', pfStrideAcc: '100', pfListIss: '0', pfNextCov: '0', pfNextAcc: '0', pfMatCov: '99', pfMixNextAcc: '34', pfMixStrideAcc: '100', pfMixNextCov: '25', pfMixStrideCov: '50',
    pfMat8Cov: '0', pfMat5Cov: '0', pfListNextAcc: '7', pfListNextCov: '6',
    fsTx: '3999', fpTx: '2', fsPer: '202', fpPer: '2.10', fs64Tx: '63', fsN: '1000', fsPerH: '102', fsPerD: '402', fsTC: '100',
    zL1: '48', zL1w: '12', zL1lat: '4', zL1max: '5', zL1i: '32', zL1iw: '8', zL2: '1', zL2w: '16', zL2lat: '14', zL3: '32', zL3w: '16', zL3lat: '46', zL3n: '8', zL3max: '96',
    ghz: '5.7', r9L3: '64', dramNs: '70', sxL3: '16', sxN: '4', sxcL3: '8', sxcN: '8',
    lcL0: '48', lcL0lat: '4', lcL1: '192', lcL1lat: '9', lcL2: '2.5', lcL2b: '3', lcL2lat: '17', rcL1: '48', rcL1lat: '5', rcL2: '2',
    llL3: '12', llL3lat: '51', llDram: '131', skyL2: '4', llMsc: '8', v3L1: '64', v3L1w: '4', v3lat: '4', v3L2: '2', v3L2w: '8', v3L2b: '3', v3L2bw: '12',
    apL1: '128', apL1i: '192', apL2: '20', apShare: '2', apPage: '16', apLine: '128',
    x3dStack: '64', x3dL3: '96', x3dTotal: '104', xeonL3: '504', epycL3: '512', epycN: '128', miLlc: '256', n2Mb: '38', n2Gain: '11', n3Gain: '6',
    z6core: '4', z6n: '12', z6L3: '48', z6cN: '32', z6cL3: '128',
    s24: '4', s512: '14', s16: '51', s128: '399', s128ns: '70', s1m4: '31', s1mH: '14', s768: '20', s768H: '14' };
  for (const [k, [v, d, kind]] of Object.entries(P)) check('prose ' + k, kind === 'pct' ? f(v * 100, d) : f(v, d), want[k]);
  check('every prose value pinned', Object.keys(P).sort().join(','), Object.keys(want).sort().join(','));
  const used = new Set();
  for (const m of html.matchAll(/data-i18n-html="([^"]+)"/g)) { const v = Z[m[1]] || ''; for (const p of v.matchAll(/\{(\w+)\}/g)) { used.add(p[1]); n++; if (!(p[1] in P)) { fails++; console.error(`FAIL {${p[1]}} in ${m[1]} is not filled on the page`); } } }
  for (const k of Object.keys(P)) { n++; if (!used.has(k)) { fails++; console.error('FAIL prose() value ' + k + ' is never quoted'); } }
  // the claims the prose makes about the models
  check('ch1: memory takes half the time at 3 % of accesses', P.memPart[0] > 0.5 && P.memShare[0] < 0.031, true);
  check('ch1: stack fits L1, work fits L2 not L1, table fits L3 not L2', P.dStack[0] < P.l1Lines[0] && P.dWork[0] > P.l1Lines[0] && P.dWork[0] < ZEN.l2.size / LINE && P.dTable[0] > ZEN.l2.size / LINE && P.dTable[0] < ZEN.l3.size / LINE, true);
  check('ch1: AMAT ordering of configurations', P.amat3[0] < P.amat13[0] && P.amat13[0] < P.amatL3[0] && P.amatL3[0] < P.amat12[0] && P.amat12[0] < P.amat1[0] && P.amat1[0] < P.amat0[0], true);
  check('ch5: write-back writes less, allocate reads more', P.wbWrite[0] < P.wtWrite[0] && P.wbRead[0] > P.wtRead[0], true);
  check('ch6: dense ratio gap larger than desk gap', P.hExc[0] - P.hInc[0] > P.hDeskE[0] - P.hDeskI[0], true);
  check('ch8: per-instruction stride beats next-line on the mix', P.pfMixStrideAcc[0] > P.pfMixNextAcc[0] && P.pfMixStrideCov[0] > P.pfMixNextCov[0], true);
  check('ch10: huge pages restore the L2 step', P.s1mH[0] === ZEN.l2.lat && P.s1m4[0] > ZEN.l2.lat, true);
  check('ch12: Lion Cove L1 slower than its L0', P.lcL1lat[0] > P.lcL0lat[0], true);
}

/* ── sentence branches at the extremes of each control ── */
{
  const has = k => { n++; if (Z[k] == null) { fails++; console.error('FAIL missing say key ' + k); } };
  const seen = new Set(), add = s => { has(s.key); seen.add(s.key); };
  const B = [0, 1];
  for (const a of B) for (const b of B) for (const c of B) for (const T of [1, 2, 4, 8, 16, 32, 64]) add(M.say.amat({ l1: a, l2: b, l3: c }, T));
  for (const bb of M.TOY.bBases) for (const w of [1, 2]) for (const s of M.toyRun(bb, w).steps) add(M.say.toy(s));
  for (const w of M.C3.ways) for (const s of M.C3.sizes) add(M.say.threeC(w, s));
  for (const k of ['loop', 'scan', 'prog']) for (const x of [0.5, 1, 1.05, 1.25, 3]) add(M.say.repl(k, x));
  for (const p of M.WRITE.policies) for (const d of M.WRITE.depths) add(M.say.writes(p, d));
  for (const k of ['incl', 'nincl', 'excl']) for (const l of ['dense', 'desk']) for (const m of [0.5, 2, 8]) add(M.say.hier(k, l, m));
  for (const page of [4096, 16384, 65536]) for (const w of [4, 8, 12, 16]) for (const s of [16, 32, 48, 64, 96, 128, 192, 256]) add(M.say.vipt(s * KiB, w, page));
  for (const t of ['stride', 'matrix', 'list', 'mix']) for (const m of ['none', 'next', 'stride']) for (const d of [1, 4, 8]) add(M.say.prefetch(t, m, d, 1));
  const st = ['M', 'E', 'S', 'I'];
  for (const a of st) for (const b of st) for (const c of [0, 1]) for (const op of ['R', 'W', 'E']) add(M.say.mesi(M.mesiStep([a, b], c, op)));
  for (const same of [true, false]) for (const g of M.FS.gs) add(M.say.fs(same, g));
  for (const p of [4096, 2 * MiB]) for (let e = 12; e <= 27; e += 0.5) add(M.say.stair(Math.round(Math.pow(2, e) / LINE) * LINE, p));
  const all = ['ch1.say.none', 'ch1.say.three', 'ch1.say.threeSpill', 'ch1.say.nol1', 'ch1.say.partial', 'ch2.say.hit', 'ch2.say.evict', 'ch2.say.cold',
    'ch3.say.comp', 'ch3.say.conf', 'ch3.say.cap', 'ch4.say.fits', 'ch4.say.thrash', 'ch4.say.loopmid', 'ch4.say.scan', 'ch4.say.prog',
    'ch5.say.wb', 'ch5.say.wt', 'ch5.say.wtfull', 'ch6.say.incl', 'ch6.say.excl', 'ch6.say.nincl', 'ch7.say.odd', 'ch7.say.fits', 'ch7.say.alias',
    'ch8.say.none', 'ch8.say.silent', 'ch8.say.waste', 'ch8.say.good', 'ch9.say.quiet', 'ch9.say.upgr', 'ch9.say.inval', 'ch9.say.bus',
    'ch9.say.fs', 'ch9.say.fsonce', 'ch9.say.pad', 'ch10.say.level', 'ch10.say.edge'];
  for (const k of all) check('branch reached ' + k, seen.has(k), true);
  // sentences app.js picks itself (start screens, end of run, bad input, the address split)
  const fixed = ['ch2.say.start1', 'ch2.say.start2', 'ch2.say.done', 'ch2.say.bad', 'ch2.say.split', 'ch9.say.start'];
  for (const k of fixed) { has(k); n++; if (!app.includes(`'${k}'`)) { fails++; console.error('FAIL app.js never shows ' + k); } }
  for (const k of Object.keys(Z)) if (/\.say\./.test(k)) check('say key is a branch ' + k, all.includes(k) || fixed.includes(k), true);
}

/* ── keys, language hygiene, registry, siblings ── */
{
  const keys = new Set([...html.matchAll(/data-i18n(?:-html|-aria|)="([^"]+)"/g)].map(m => m[1]));
  for (const m of app.matchAll(/'((?:ch\d+|dg|u|doc)\.[\w.-]*\w)'/g)) keys.add(m[1]);
  for (const m of html.matchAll(/data-hk="([^"]+)"/g)) keys.add(m[1]);
  for (const p of M.REPL.policies) keys.add('ch4.pol.' + p);
  for (const p of M.WRITE.policies) keys.add('ch5.pol.' + p);
  for (const m of ['none', 'next', 'stride']) keys.add('ch8.m.' + m);
  for (const s of ['M', 'E', 'S', 'I']) { keys.add('ch9.st.' + s); keys.add('dg.mesi.' + s); }
  for (const o of ['R', 'W', 'E']) { keys.add('ch9.op.' + o); keys.add('ch9.opS.' + o); }
  for (const s of ['mem', 'cache']) keys.add('ch9.from.' + s);
  for (const c of [0, 1]) keys.add('ch9.core' + c);
  for (let i = 1; i <= 8; i++) keys.add('dg.mesi.e' + i);
  for (let i = 1; i <= 4; i++) keys.add('dg.write.e' + i);
  for (const k of ['incl', 'nincl', 'excl']) { keys.add('dg.incl.' + k); keys.add('dg.incl.u.' + k); keys.add('dg.incl.n.' + k); }
  for (const m of html.matchAll(/data-dg="(\w+)"/g)) keys.add('dg.' + m[1] + '.aria');
  for (const k of ['ch1.', 'dg.', 'dg.write.e', 'dg.mesi.e', 'ch9.core']) keys.delete(k);
  for (const k of keys) { n++; if (Z[k] == null) { fails++; console.error('FAIL missing zh key ' + k); } }
  // the say sentences' placeholders are supplied by app.js
  for (const [k, v] of Object.entries(Z)) if (/\.say\./.test(k)) for (const m of v.matchAll(/\{(\w+)\}/g)) {
    n++; if (!new RegExp('\\b' + m[1] + '\\s*:|[{,]\\s*' + m[1] + '\\s*[,}]').test(app)) { fails++; console.error(`FAIL placeholder {${m[1]}} in ${k} is never supplied by app.js`); }
  }
  check('six or more diagrams', [...html.matchAll(/class="dia" data-dg="/g)].length >= 6, true);
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
  check('registry slug/path', R.slug + ' ' + R.path, 'how-cpu-caches-work computing/systems/how-cpu-caches-work/');
  check('registry category', [R.category, R.subtopic, R.stage].join('/'), 'computing/systems/university');
  check('registry title', R.title.zh, Z['doc.title'].split(' · ')[0]); check('registry desc', R.desc.zh, Z['doc.desc']);
  check('hero title = registry title', Z['hero.title'], R.title.zh);
  for (const c of R.concepts) check('anchor ' + c.anchor, html.includes('id="' + c.anchor.slice(1) + '"'), true);
  for (const c of R.concepts) { n++; if (!c.aliases.zh.length || !c.aliases.en.length || !c.title.en || !c.desc.en) { fails++; console.error('FAIL concept incomplete ' + c.id); } }
  check('one concept per chapter', R.concepts.map(c => c.anchor).join(), Array.from({ length: 12 }, (_, i) => '#ch' + (i + 1)).join());
  // one word, one owner. TASK-arch-series.md: the memory essay's #ch2 cache words move to this page (the registrar
  // repoints them when it registers A2); the memory essay keeps locality, traversal order, the latency ladder,
  // 缓存命中率 and cache hierarchy; switches-that-compute keeps 缓存 / cache and pipelining.
  const norm = s => s.toLowerCase().replace(/\s+/g, '');
  const MOVED = new Set(['L1 L2 L3 缓存', '缓存行', '组相联缓存', 'cache line', 'set associative cache', 'L1 L2 L3 cache'].map(norm));
  const owned = new Map();
  for (const a of ['缓存命中率', 'cache hierarchy', '按行遍历 按列遍历', '空间局部性', 'spatial locality', 'row major vs column major', '缓存', 'cache', 'AMAT', '缓存颠簸', 'cache thrashing',
    '时间局部性', 'temporal locality', '流水线', 'pipelining', '指令集', 'ISA']) owned.set(norm(a), 'TASK');
  for (const sib of ['why-compute-waits-for-memory', 'switches-that-compute', 'how-a-cpu-runs-a-program', 'how-virtual-memory-works', 'how-pcie-works', 'how-a-computer-is-wired', 'how-thunderbolt-works']) {
    const p = path.join(DIR, '..', sib, 'REGISTRY.json');
    if (fs.existsSync(p)) for (const c of JSON.parse(fs.readFileSync(p, 'utf8')).concepts) for (const a of [...c.aliases.zh, ...c.aliases.en]) if (!(sib === 'why-compute-waits-for-memory' && MOVED.has(norm(a)))) owned.set(norm(a), sib);
  }
  for (const c of R.concepts) for (const a of [...c.aliases.zh, ...c.aliases.en]) { n++; if (owned.has(norm(a))) { fails++; console.error(`FAIL alias owned by ${owned.get(norm(a))}: ${a}`); } }
  // live sibling links must point at chapters that exist; A3 is linked since it went live (2026-11-15: ch7.p2 and ch10.limit
  // #ch4, ch7.limit and ch12.links the page top); A5 is still named in plain text, not linked
  const all = Object.values(Z).join('');
  for (const sib of ['why-compute-waits-for-memory', 'switches-that-compute', 'how-virtual-memory-works']) {
    const sh = fs.readFileSync(path.join(DIR, '..', sib, 'index.html'), 'utf8');
    for (const m of all.matchAll(new RegExp(sib + '/(#ch\\d+)?', 'g'))) if (m[1]) check(`${sib} anchor ${m[1]}`, sh.includes(`id="${m[1].slice(1)}"`), true);
  }
  for (const k of ['ch1.p1', 'ch1.p3', 'ch2.p1', 'ch10.p4', 'ch12.links']) { n++; if (!/href=/.test(Z[k])) { fails++; console.error('FAIL expected a sibling link in ' + k); } }
  check('no links to the unwritten A5', /how-cores-share-memory/.test(all), false);
  says('ch9.p1', '后续一篇讲多核共享内存的文章');
  for (const [k, h] of [['ch7.p2', '../how-virtual-memory-works/#ch4'], ['ch7.limit', '../how-virtual-memory-works/'], ['ch10.limit', '../how-virtual-memory-works/#ch4'], ['ch12.links', '../how-virtual-memory-works/']]) check(`${k} links A3 (${h})`, Z[k].includes(`href='${h}'`), true);
  check('no plain-text "later essay on virtual memory" left', /后续一篇讲虚拟内存/.test(all), false);
  { const vz = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, '..', 'how-virtual-memory-works', 'copy.zh.js'), 'utf8'), vz); check('A3 title quoted as in its copy', all.includes('《' + vz.window.ESSAY_COPY.zh['hero.title'] + '》'), true); }
  const hrefs = [...all.matchAll(/href='([^']+)'/g)].map(m => m[1]);
  for (const h of hrefs) { n++; if (!/^\.\.\/(why-compute-waits-for-memory|switches-that-compute|how-virtual-memory-works)\/(#ch\d+)?$/.test(h)) { fails++; console.error('FAIL unexpected link ' + h); } }

  const ectx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.en.js'), 'utf8'), ectx);
  const EN = ectx.window.ESSAY_COPY.en, stub = ectx.window.ESSAY_COPY.enStub === true, ph = s => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');
  check('en keys = zh keys', Object.keys(EN).sort().join('|'), Object.keys(Z).sort().join('|'));
  for (const k of Object.keys(Z)) check('en placeholders ' + k, ph(EN[k]), ph(Z[k]));
  if (stub) { check('en stub mirrors zh exactly', JSON.stringify(EN), JSON.stringify(Z)); console.log('NOTE: copy.en.js is a stub (enStub); English registry match skipped until it is translated'); }
  else { check('registry title en', R.title.en, EN['doc.title'].split(' · ')[0]); check('registry desc en', R.desc.en, EN['doc.desc']); }
}

if (fails) { console.error(`\n${fails} of ${n} checks failed`); process.exit(1); }
console.log(`PASS: ${n} checks (vendor figures, hand-worked LRU/PLRU/toy cache, 3C by definition, Belady bound, reuse distance vs a simulated trace, MESI table, VIPT limit, and every number in the prose match the models)`);
