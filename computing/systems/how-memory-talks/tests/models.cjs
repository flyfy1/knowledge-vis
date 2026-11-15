'use strict';
// Pins the page's memory models: datasheet and dated figures against the values typed from their sources; the refresh
// duty cycle, the address split and the timing set by hand; the command simulator against the closed-form hit / miss /
// conflict latencies and against every timing rule (each command log is replayed and checked: tRCD, tRP, tRAS, tRC,
// tRRD_S/L, tFAW, tCCD_S/L, tRTP, one command per cycle); the Hamming decoders against an independent count; the PAM3
// crossovers against their closed forms; the row-hammer counts against hand arithmetic; how far each conclusion moves
// when a tuned parameter is halved or doubled; every number the prose quotes (placeholders filled from prose(),
// literals checked against models.js); every live sentence branch; copy keys, language hygiene, the registry, sibling
// links and the sibling essays' aliases.
// Run: node computing/systems/how-memory-talks/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const M = require(path.join(DIR, 'models.js'));
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;
const html = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(DIR, 'app.js'), 'utf8');
const { SPEC, BINS, FACTS, FRONTIER } = M;
const D5 = SPEC.ddr5, D4 = SPEC.ddr4;

let n = 0, fails = 0;
function check(name, got, want) { n++; if (got !== want) { fails++; console.error(`FAIL ${name}: model gives ${got}, expected ${want}`); } }
function near(name, got, want, tol) { n++; if (!(Math.abs(got - want) <= tol)) { fails++; console.error(`FAIL ${name}: ${got} not within ${tol} of ${want}`); } }
function says(key, phrase) { n++; if (!Z[key] || !Z[key].includes(phrase)) { fails++; console.error(`FAIL prose ${key} should contain "${phrase}"`); } }
const f = (x, d) => x.toFixed(d);
const zf = (x, d) => M.fmt(x, d, 'zh');

/* ── datasheet and dated figures, typed again from the sources (BRIEF.md lists URL and date for each) ── */
{
  // SK hynix H5CG48AGBDX018N rev 1.0, Table 67 and AC tables; Micron 16Gb die rev D; Micron SODIMM core rev F
  check('DDR5 tREFI 3.9 µs, 8192 REF per 32 ms, hot above 85 °C', [D5.tREFIns, D5.refPerWindow, D5.windowMs, D5.hotC].join(), '3900,8192,32,85');
  check('DDR5 tREFI × 8192 ≈ 32 ms', Math.round(D5.tREFIns * D5.refPerWindow / 1e6), D5.windowMs);
  check('DDR5 16Gb tRFC1/tRFC2/tRFCsb 295/160/130 ns', [D5.tRFC1[16], D5.tRFC2[16], D5.tRFCsb[16]].join(), '295,160,130');
  check('DDR5 8Gb tRFC1/tRFC2/tRFCsb 195/130/115 ns (SQRAM RDIMM)', [D5.tRFC1[8], D5.tRFC2[8], D5.tRFCsb[8]].join(), '195,130,115');
  check('DDR5 x8: 32 banks, 8 groups × 4, rows R0–R15, columns C0–C9, 1 KB page; x16 2 KB', [D5.banks, D5.bgs, D5.banksPerBg, D5.rowBits, D5.colBitsX8, D5.pageX8, D5.pageX16].join(), '32,8,4,16,10,1024,2048');
  check('DDR5 x8 page = 2^columns bytes', Math.pow(2, D5.colBitsX8), D5.pageX8);
  check('DDR5 BL16, 16n prefetch, 2 × 32-bit subchannels, 36/40-bit with ECC', [D5.bl, D5.prefetch, D5.subs, D5.subWidth, D5.eccSubSodimm, D5.eccSubRdimm].join(), '16,16,2,32,36,40');
  check('DDR5 VDD 1.1 V from a 5 V PMIC input', [D5.vdd, D5.pmicIn].join(), '1.1,5');
  check('DDR5 tCCD_S 8, tCCD_L max(8, 5 ns), tRRD_S 8, tRRD_L max(8, 5 ns), tFAW 32 / 40, tRTP max(12, 7.5 ns)', [D5.tCCDs, D5.tCCDLmin, D5.tCCDLns, D5.tRRDs, D5.tRRDLmin, D5.tRRDLns, D5.tFAW1k, D5.tFAW2k, D5.tRTPmin, D5.tRTPns].join(), '8,8,5,8,8,5,32,40,12,7.5');
  check('DDR5 tRAS 32 ns, tRC 48 ns, tAA 16 ns', [D5.tRASns, D5.tRCns, D5.tAAns].join(), '32,48,16');
  check('on-die ECC 128 + 8', [D5.odEcc.data, D5.odEcc.check].join(), '128,8');
  check('1 KB-page tFAW = 4 × tRRD_S (so it never binds alone)', D5.tFAW1k, 4 * D5.tRRDs);
  // SK hynix H5AN8G8NCJR rev 1.5
  check('DDR4 tREFI 7.8 µs, tRFC1 2/4/8/16 Gb = 160/260/350/550 ns', [D4.tREFIns, D4.tRFC1[2], D4.tRFC1[4], D4.tRFC1[8], D4.tRFC1[16]].join(), '7800,160,260,350,550');
  const r4 = M.ddr4RfcCheck(); check('DDR4 nRFC at 3200 × 0.625 ns = tRFC1 table', [2, 4, 8, 16].map(d => r4[d]).join(), [2, 4, 8, 16].map(d => D4.tRFC1[d]).join());
  check('DDR4-3200: tCCD_S 4, tCCD_L 8, nRRD 4/8, nFAW 34, nRAS 52, nRC 74', Object.values(D4.t3200).join(), '4,8,4,8,34,52,74');
  check('DDR4 16 banks in 4 groups, BL8, 64-bit', [D4.banks, D4.bgs, D4.bl, D4.width].join(), '16,4,8,64');
  // speed bins
  const bin = id => { const b = BINS[id]; return [b.mts, b.cl, b.rcd, b.rp, b.ras || '', b.volt || '', b.kind].join(); };
  check('DDR4-3200AA 22-22-22', bin('ddr4-3200aa'), '3200,22,22,22,,,jedec');
  check('Corsair DDR4-3200 16-18-18-36 1.35 V', bin('ddr4-3200x'), '3200,16,18,18,36,1.35,xmp');
  check('DDR5-4800B 40-39-39', bin('ddr5-4800b'), '4800,40,39,39,,,jedec');
  check('DDR5-5600B 46-45-45', bin('ddr5-5600b'), '5600,46,45,45,,,jedec');
  check('DDR5-6400B 52-52-52', bin('ddr5-6400b'), '6400,52,52,52,,,jedec');
  check('G.SKILL DDR5-6400 32-39-39-102 1.40 V', bin('ddr5-6400x'), '6400,32,39,39,102,1.4,xmp');
  check('Intel test DDR5-7200 34-45-45-115', bin('ddr5-7200i'), '7200,34,45,45,115,,xmp');
  check('BIN_ORDER lists every bin once', M.BIN_ORDER.slice().sort().join(), Object.keys(BINS).sort().join());
  // JEDEC DDR5 bins: CL is tAA = 16 ns rounded up to an even count (the two below it are too short)
  for (const id of ['ddr5-4800b', 'ddr5-5600b', 'ddr5-6400b']) { const b = BINS[id], tck = 2000 / b.mts; check(id + ' CL ≥ 16 ns and CL − 2 < 16 ns', b.cl * tck >= 16 - 1e-9 && (b.cl - 2) * tck < 16, true); }
  // facts and frontier
  check('AMD 9950X: 2 channels, 1DPC 5600, 2DPC 3600, 2024-08-15', [FACTS.amd9950x.ch, FACTS.amd9950x.oneDpc, FACTS.amd9950x.twoDpc, FACTS.amd9950x.launch].join(), '2,5600,3600,2024-08-15');
  check('Kim 2014: 129 modules, 110 vulnerable, 139K, 64 ms, 50 ns', [FACTS.kim2014.modules, FACTS.kim2014.vulnerable, FACTS.kim2014.minAct, FACTS.kim2014.window, FACTS.kim2014.tRC].join(), '129,110,139000,64,50');
  check('Kim 2020: 1580 chips, 9.6K (4.8K per side)', [FACTS.kim2020.chips, FACTS.kim2020.minAct, FACTS.kim2020.perRow].join(), '1580,9600,4800');
  check('Kim 2020 per side = half', FACTS.kim2020.perRow * 2, FACTS.kim2020.minAct);
  check('TRRespass: 42 modules, 13 vulnerable, up to 19 sides', [FACTS.trrespass.modules, FACTS.trrespass.vulnerable, FACTS.trrespass.maxSides].join(), '42,13,19');
  check('DRAM 70 ns, trace 170 ps/inch', [FACTS.dramNs, FACTS.tpdPsPerIn].join(), '70,170');
  check('as of 2026-11', FRONTIER.asOf, '2026-11'); says('ch11.title', '2026 年 11 月');
  check('JESD79-5C 2024-04-17 to 8800', [FRONTIER.prac.doc, FRONTIER.prac.date, FRONTIER.prac.maxMts].join(), 'JESD79-5C,2024-04-17,8800');
  check('CAMM2 JESD318 2023-12-05, 8–128 GB', [FRONTIER.camm2.doc, FRONTIER.camm2.date, FRONTIER.camm2.minGB, FRONTIER.camm2.maxGB].join(), 'JESD318,2023-12-05,8,128');
  check('GDDR7 JESD239 2024-03-05, 48 Gb/s, 32-bit, 192 GB/s', [FRONTIER.gddr7.doc, FRONTIER.gddr7.date, FRONTIER.gddr7.gbpsMax, FRONTIER.gddr7.width, FRONTIER.gddr7.perDevice].join(), 'JESD239,2024-03-05,48,32,192');
  check('GDDR7 per device = rate × width / 8', FRONTIER.gddr7.perDevice, FRONTIER.gddr7.gbpsMax * FRONTIER.gddr7.width / 8);
  check('RTX 5090 28 Gb/s × 512 bits', [FRONTIER.rtx5090.gbps, FRONTIER.rtx5090.width].join(), '28,512');
  check('LPDDR5X 10.7 Gb/s Samsung 2024-04-17', [FRONTIER.lp5x.gbps, FRONTIER.lp5x.vendor, FRONTIER.lp5x.date].join(), '10.7,Samsung,2024-04-17');
  check('LPDDR6 JESD209-6 2025-07-09, 10667–14400, 12-DQ subchannels', [FRONTIER.lp6.doc, FRONTIER.lp6.date, FRONTIER.lp6.minMts, FRONTIER.lp6.maxMts, FRONTIER.lp6.subDq].join(), 'JESD209-6,2025-07-09,10667,14400,12');
  check('MRDIMM 8800 / 6900P 8800 / 6700P 8000 / gen 2 12800, JESD82-552 2026-04-30', [FRONTIER.mrdimm.gen1, FRONTIER.mrdimm.xeon6900, FRONTIER.mrdimm.xeon6700, FRONTIER.mrdimm.gen2, FRONTIER.mrdimm.bufDoc, FRONTIER.mrdimm.bufDate].join(), '8800,8800,8000,12800,JESD82-552,2026-04-30');
  check('record 13606 (prev 13556, per the Duck-IT article text), 24 GB, reported 2026-07-03', [FRONTIER.record.mts, FRONTIER.record.prev, FRONTIER.record.moduleGB, FRONTIER.record.reported].join(), '13606,13556,24,2026-07-03');
  check('DDR6 reported 8800–17600', [FRONTIER.ddr6.lo, FRONTIER.ddr6.hi].join(), '8800,17600');
  const ymd = s => { const [y, m, d] = s.split('-').map(Number); return `${y} 年 ${m} 月 ${d} 日`; };
  says('ch11.e1', ymd(FRONTIER.prac.date)); says('ch11.e1', FRONTIER.prac.doc); says('ch11.e2', ymd(FRONTIER.lp6.date)); says('ch11.e2', FRONTIER.lp6.doc);
  says('ch11.e3', ymd(FRONTIER.gddr7.date)); says('ch11.e3', ymd(FRONTIER.camm2.date)); says('ch11.d1', ymd(FRONTIER.record.reported)); says('ch11.d1', FRONTIER.record.who);
  says('ch11.d1', FRONTIER.record.moduleGB + ' GB'); says('ch11.d2', ymd(FRONTIER.lp5x.date)); says('ch11.c1', ymd(FRONTIER.mrdimm.bufDate)); says('ch11.c1', FRONTIER.mrdimm.bufDoc);
  says('ch9.p1', '2024 年 4 月'); says('ch9.p1', '2023 年'); says('ch9.p2', '2024 年 3 月'); says('ch10.p5', '2024 年 4 月'); says('ch10.p5', FRONTIER.prac.doc);
  says('ch10.p2', '2014 年'); says('ch10.p2', '2020 年'); says('ch10.p3', '2020 年'); says('ch9.p3', '2025 年的 RTX 5090');
}

/* ── 01 refresh, by hand ── */
{
  const r = M.refresh('ddr5', 16, false, 'ab');
  check('DDR5 16Gb busy = 295 / 3900', f(r.busy, 6), f(295 / 3900, 6));
  check('extra wait = busy × tRFC / 2', f(r.extra, 6), f(295 / 3900 * 295 / 2, 6));
  check('hot halves tREFI and doubles busy', [M.refresh('ddr5', 16, true).tREFI, f(M.refresh('ddr5', 16, true).busy, 6)].join(), [1950, f(2 * r.busy, 6)].join());
  check('FGR: tRFC2 every tREFI/2', [M.refresh('ddr5', 16, false, 'fgr').tRFC, M.refresh('ddr5', 16, false, 'fgr').tREFI].join(), '160,1950');
  check('same-bank: tRFCsb every tREFI/2, bank scope', [M.refresh('ddr5', 16, false, 'sb').tRFC, M.refresh('ddr5', 16, false, 'sb').tREFI, M.refresh('ddr5', 16, false, 'sb').scope].join(), '130,1950,bank');
  check('DDR4 ignores the DDR5 modes', M.refresh('ddr4', 8, false, 'sb').tRFC, 350);
  check('FGR occupies more but waits less than all-bank', M.refresh('ddr5', 16, false, 'fgr').busy > r.busy && M.refresh('ddr5', 16, false, 'fgr').extra < r.extra, true);
  says('ch1.ctl.hot', D5.hotC + '°C'); says('ch1.say.hot', D5.hotC + '°C'); says('ch1.p4', D5.hotC + '°C');
  says('ch1.p3', '2 Gb'); says('ch1.p3', '8 Gb'); says('ch1.p3', '16 Gb'); says('ch1.limit', '24 Gb、32 Gb');
  check('24/32 Gb tRFC not in the model', [D5.tRFC1[24], D5.tRFC1[32]].join(), ',');
}

/* ── 02 the address split, by hand ── */
{
  const a = M.parseHex(M.ADDR.def), m = M.mapAddr(a, 'rowfirst', 2, 1), b = M.mapAddr(a, 'bgfirst', 2, 1);
  check('default address', M.ADDR.def, '0x23A5C9E48'); says('ch2.p4', M.ADDR.def); says('ch2.say.bad', M.ADDR.def);
  check('35 bits for 2 channels × 16 GB', M.totalBits(2, 1), 35); check('2^35 B = 2 × 16 GB', Math.pow(2, 35), 2 * 16 * Math.pow(2, 30));
  // rowfirst from bit 0: off 6, ch 1, sub 1, col 6, bg 3, ba 2, row 16
  const bits = (lo, nb) => Math.floor(a / Math.pow(2, lo)) % Math.pow(2, nb);
  check('rowfirst by hand', [m.off, m.ch, m.sub, m.col, m.bg, m.ba, m.row].join(), [bits(0, 6), bits(6, 1), bits(7, 1), bits(8, 6), bits(14, 3), bits(17, 2), bits(19, 16)].join());
  check('bgfirst by hand', [b.bg, b.col, b.ba, b.row].join(), [bits(8, 3), bits(11, 6), bits(17, 2), bits(19, 16)].join());
  check('bank index = bg + 8 × ba', m.bank, m.bg + 8 * m.ba);
  check('column field = 10 column bits − 4 (BL16)', M.geomBits(2, 1).col, D5.colBitsX8 - 4);
  check('too large an address is flagged', M.mapAddr(M.parseHex('0xFFFFFFFFFF'), 'rowfirst', 2, 1).over, true);
  check('parseHex rejects non-hex', M.parseHex('zz'), null);
  says('ch2.p3', '16 GB'); says('ch2.p3', '32 位'); says('ch2.say.over', '16 GB');
  // the next line in the same subchannel: rowfirst → next column, bgfirst → next bank group
  const step = M.LINE * 2 * 2, mr = M.mapAddr(a + step, 'rowfirst', 2, 1), mb = M.mapAddr(a + step, 'bgfirst', 2, 1);
  check('rowfirst +256: same bank and row, next column', mr.bank === m.bank && mr.row === m.row && mr.col === m.col + 1, true);
  check('bgfirst +256: same row, next bank group', mb.row === b.row && mb.bg === (b.bg + 1) % 8, true);
  check('ch2 model text says 8 groups', D5.bgs, 8); says('ch2.model.how', '8 个 bank 组'); says('ch2.model.how', '第 6 章');
}

/* ── 03 timing set and the command simulator ── */
function replay(T, r, o) {
  // check every rule on the log of one simulate() run; return the first violation or ''
  const L = r.log, NB = T.banks, last = { ACT: new Array(NB).fill(-1e9), PRE: new Array(NB).fill(-1e9), RD: new Array(NB).fill(-1e9) };
  let prevT = -1, lastAct = -1e9, lastRd = -1e9, lastRdBg = -1; const bgAct = new Array(T.bgs).fill(-1e9), acts = [], open = new Array(NB).fill(-1);
  for (const e of L) {
    if (e.t <= prevT) return `two commands at ${e.t}`; prevT = e.t;
    const b = e.b, bg = b % T.bgs;
    if (e.c === 'ACT') {
      if (e.t < last.PRE[b] + T.RP) return `tRP at ${e.t}`; if (e.t < last.ACT[b] + T.RC) return `tRC at ${e.t}`;
      if (e.t < lastAct + T.RRDS) return `tRRD_S at ${e.t}`; if (e.t < bgAct[bg] + T.RRDL) return `tRRD_L at ${e.t}`;
      if (acts.length >= 4 && e.t < acts[acts.length - 4] + T.FAW) return `tFAW at ${e.t}`;
      if (open[b] !== -1) return `ACT to an open bank at ${e.t}`;
      last.ACT[b] = e.t; lastAct = e.t; bgAct[bg] = e.t; acts.push(e.t); open[b] = 1;
    } else if (e.c === 'PRE') {
      if (e.t < last.ACT[b] + T.RAS) return `tRAS at ${e.t}`; if (e.t < last.RD[b] + T.RTP) return `tRTP at ${e.t}`;
      last.PRE[b] = e.t; open[b] = -1;
    } else {
      if (open[b] !== 1) return `RD to a closed bank at ${e.t}`; if (e.t < last.ACT[b] + T.RCD) return `tRCD at ${e.t}`;
      if (e.t < lastRd + (bg === lastRdBg ? T.CCDL : T.CCDS)) return `tCCD at ${e.t}`;
      if (e.end !== e.t + T.CL + T.BL2) return `CL at ${e.t}`;
      last.RD[b] = e.t; lastRd = e.t; lastRdBg = bg;
    }
  }
  return '';
}
{
  const T = M.timing('ddr5-6400b');
  check('DDR5-6400B tCK 312.5 ps', T.tck, 0.3125);
  check('tRAS = ceil(32 ns / tCK) = 103', T.RAS, Math.ceil(32 / 0.3125)); check('tRC = tRAS + tRP = 155', T.RC, 155);
  check('tCCD_L at 6400 = 16, at 3200 = 8, at 8800 = 22', [M.genericTiming(6400).CCDL, M.genericTiming(3200).CCDL, M.genericTiming(8800).CCDL].join(), '16,8,22');
  check('tRTP at 6400 = max(12, ceil(7.5 / tCK)) = 24', T.RTP, 24);
  check('generic timing at 6400 = 16 ns rounded up: CL 52 even', [M.genericTiming(6400).CL, M.genericTiming(6400).RCD].join(), '52,52');
  check('64 bytes per DDR5 burst = 32 bits × 16', T.bytes, 64); check('64 bytes per DDR4 burst = 64 bits × 8', M.timing('ddr4-3200aa').bytes, 64);
  const I = M.idle(T);
  check('idle hit / miss / conflict = 60 / 112 / 164 cycles', [I.hit, I.miss, I.conflict].join(), '60,112,164');
  // one request into an empty bank is a miss; the same row again a hit; another row in that bank a conflict
  const one = M.simulate(T, [{ bank: 3, row: 7 }], {});
  check('simulated miss = closed form', one.reqs[0].end - one.reqs[0].arr, I.miss);
  const hit = M.simulate(T, [{ bank: 3, row: 7 }, { bank: 3, row: 7 }], { mode: 'chain' });
  check('simulated hit = closed form', hit.reqs[1].end - hit.reqs[1].arr, I.hit);
  const conf = M.simulate(T, [{ bank: 3, row: 7 }, { bank: 3, row: 9 }], { mode: 'chain' });
  check('simulated conflict = closed form (tRAS and tRTP already met)', conf.reqs[1].end - conf.reqs[1].arr, I.conflict);
  const cl = M.simulate(T, [{ bank: 3, row: 7 }, { bank: 3, row: 9 }], { mode: 'chain', policy: 'close' });
  check('close page turns the conflict into a miss (waiting out tRP of the early PRE)', cl.reqs[1].cls === 'miss' && cl.reqs[1].end - cl.reqs[1].arr < I.conflict, true);
  // every rule holds on every trace the page shows, and on dense random floods
  const runs = [];
  for (const bin of ['ddr4-3200aa', 'ddr5-6400b', 'ddr5-6400x']) for (const k of ['stream', 'random', 'pingpong']) for (const p of ['open', 'close']) for (const mode of ['chain', 'flood']) {
    const TT = M.timing(bin); runs.push([`${bin} ${k} ${p} ${mode}`, TT, M.simulate(TT, M.trace(k).map(r => ({ bank: r.bank % TT.banks, row: r.row })), { mode, policy: p, log: true })]);
  }
  for (const nb of [1, 4, 32]) for (const h of [0, 0.5, 1]) { const TT = M.timing('ddr5-6400b'); runs.push([`bw ${nb} ${h}`, TT, M.simulate(TT, M.bwTrace(nb, h), { mode: 'flood', log: true })]); }
  for (const g of [1, 2, 8]) for (const nr of [false, true]) for (const p2 of [false, true]) { const TT = M.genericTiming(6400, { page2k: p2 }); runs.push([`bg ${g} ${nr} ${p2}`, TT, M.simulate(TT, M.bgTrace(g, nr), { mode: 'flood', policy: nr ? 'close' : 'open', log: true })]); }
  for (const [name, TT, r] of runs) {
    const v = replay(TT, r); n++; if (v) { fails++; console.error('FAIL timing rule broken in ' + name + ': ' + v); }
    check('every request served once ' + name, r.reqs.every(q => q.end != null), true);
    n++; if (r.gbps > r.peak + 1e-9) { fails++; console.error('FAIL throughput above peak in ' + name); }
    const c = r.counts; check('hit+miss+conflict = requests ' + name, c.hit + c.miss + c.conflict, r.reqs.length);
  }
  // ping-pong in one bank: consecutive ACTs at least tRC apart, so the average is at least tRC per two reads apart
  const pp = M.ch3('pingpong', 'open', 'ddr5-6400b'), actT = pp.chain.log.filter(e => e.c === 'ACT').map(e => e.t);
  check('ping-pong ACTs at least tRC apart', actT.slice(1).every((t, i) => t - actT[i] >= T.RC), true);
  // the ch3 conclusions hold for other seeds (the trace is fixed by TR.seed on the page)
  for (let s = 1; s <= 12; s++) {
    const tr = M.trace('random', M.TR.n, s), o = M.simulate(T, tr, { mode: 'chain', policy: 'open' }), c = M.simulate(T, tr, { mode: 'chain', policy: 'close' });
    check('random: close page waits less, seed ' + s, c.avgLat < o.avgLat, true);
  }
  check('stream: only the first read in each of the 8 groups misses', M.ch3('stream', 'open', 'ddr5-6400b').chain.counts.hit, M.TR.n - 8);
  for (const b of ['ddr4-3200aa', 'ddr5-6400b', 'ddr5-6400x']) for (const k of ['stream', 'random', 'pingpong']) check(`ch3 ${b} ${k}: every read served`, isFinite(M.ch3(k, 'open', b).chain.avgLat), true);
  says('ch3.model.how', '8 个 bank 组'); says('ch3.p2', '64 字节'); says('ch3.limit', '2000 年');
}

/* ── 04 CL in nanoseconds ── */
{
  const l = id => M.latency(BINS[id]);
  check('DDR5-6400 CL32 = DDR4-3200 CL16 = 10 ns', [f(l('ddr5-6400x').cl, 6), f(l('ddr4-3200x').cl, 6)].join(), '10.000000,10.000000');
  const jedec = M.BIN_ORDER.filter(id => BINS[id].kind === 'jedec').map(id => l(id).cl);
  check('JEDEC bins between 13 and 17 ns', Math.min(...jedec) >= 13 && Math.max(...jedec) <= 17, true); says('ch4.p3', '13 到 17 纳秒'); says('ch12.q1', '13 到 17 纳秒');
  check('burst time equal: DDR4 BL8 and DDR5 BL16 at twice the rate', f(l('ddr4-3200aa').burst, 6), f(l('ddr5-6400b').burst, 6));
  says('ch4.p1', '1600 MHz'); says('ch4.p1', '3200 MHz'); check('clock = MT/s ÷ 2', [3200 / 2, 6400 / 2].join(), '1600,3200');
  says('ch4.p1', 'CL × 2000 ÷ 传输速率'); says('ch12.q1', 'CL × 2000 ÷ 传输速率'); check('ns = CL × 2000 / MT/s', l('ddr5-6400b').cl, 52 * 2000 / 6400);
  says('ch4.p4', '8 次传输，64 位宽'); says('ch4.p4', '16 次传输，32 位宽');
  check('the page slider covers every bin rate', M.BIN_ORDER.every(id => BINS[id].mts >= 1600 && BINS[id].mts <= 9600 && BINS[id].mts % 400 === 0), true);
  check('the CL slider covers every bin CL', M.BIN_ORDER.every(id => BINS[id].cl >= 10 && BINS[id].cl <= 64 && BINS[id].cl % 2 === 0), true);
  check('reference for the sentence = DDR4-3200 CL16', M.say.cl(6400, 32).key, 'ch4.say.same');
}

/* ── 05 bandwidth ── */
{
  check('peak per subchannel 6400 × 4 B = 25.6 GB/s', M.bandwidth(1, 0).peak, 25.6);
  check('1 bank, all new rows ≈ one read per tRC', f(M.bandwidth(1, 0).gbps, 1), f(64 / (M.timing('ddr5-6400b').RC * 0.3125), 1));
  check('more banks never lower (no hits)', M.BW.banks.every((b, i) => i === 0 || M.bandwidth(b, 0).gbps >= M.bandwidth(M.BW.banks[i - 1], 0).gbps - 0.05), true);
  near('one bank, all hits = BL/tCCD_L share of peak (less the first ACT)', M.bandwidth(1, 1).frac, 8 / 16, 0.02);
  says('ch5.p3', '6400 百万次/秒 × 8 字节'); says('ch5.p2', '8 × 8 字节'); says('ch5.p2', '16 × 4 字节'); says('ch5.p2', '128 字节');
  says('ch5.p4', '8 个 bank、九成命中'); check('ch5.p4 8 banks at 0.9', M.bandwidth(8, 0.9).frac > 0.9, true);
  says('dg.dimm.note', '16 次 × 4 字节 = 64 字节'); says('dg.dimm.pmic', '5 V → 1.1 V'); says('dg.dimm.cap', '5 伏变成 1.1 伏');
  says('ch5.model.how', 'DDR5-6400B'); check('ch5 uses DDR5-6400B', M.BW.bin, 'ddr5-6400b');
}

/* ── 06 bank groups ── */
{
  const g = M.bankGroups(1, 6400);
  check('one group: utilisation close to BL2 / tCCD_L', g.frac <= g.ideal + 1e-9 && g.frac > g.ideal - 0.03, true);
  check('two groups reach the bus', M.bankGroups(2, 6400).frac > 0.9, true);
  says('ch6.p2', 'DDR5-3200 时 5 纳秒正好 8 个周期'); check('5 ns at 3200 = 8 cycles', 5 / (2000 / 3200), 8);
  says('ch6.p2', 'max(8 个周期, 5 纳秒)'); says('ch6.p2', 'DDR5-8800'); check('8800 is a ch6 rate', M.BG.rates.includes(8800), true);
  says('ch6.say.same', '突发只占 8 个'); says('ch6.say.rot', '只隔 8 个周期'); says('ch6.say.sameok', '5 纳秒'); says('ch6.say.faw', '4 次'); says('ch6.say.fawok', '4 次');
  check('BL/2 = tCCD_S = 8', [M.timing('ddr5-6400b').BL2, D5.tCCDs].join(), '8,8');
  says('ch6.ctl.x16', '2 KB'); says('ch6.p3', '1 KB'); says('ch6.p3', '2 KB'); says('ch6.limit', '4 个 bank');
  check('new rows at 1 KB: tFAW = 4 bursts, not binding', M.bankGroups(8, 6400, true, false).frac > 0.9, true);
  check('new rows at 2 KB: tFAW binds', M.bankGroups(8, 6400, true, true).frac < M.bankGroups(8, 6400, true, false).frac - 0.1, true);
  says('dg.bg.cap', 'DDR5-6400'); says('ch6.model.how', '16 纳秒取整');
}

/* ── 07 fly-by ── */
{
  const r = M.flyby(6400);
  check('chip step = 14 mm × 170 ps/in ÷ 25.4', f(r.step, 6), f(14 * 170 / 25.4, 6));
  check('span = 4 steps', f(r.span, 6), f(4 * r.step, 6)); check('UI at 6400 = 156.25 ps', r.ui, 156.25);
  check('needs training at 6400, not at 400', [r.needTrain, M.flyby(400).needTrain].join(), 'true,false');
  says('ch7.p4', 'DDR-400'); says('ch7.p4', '五颗'); check('five chips', M.FLY.chips, 5);
  says('ch7.p2', '9950X'); says('ch7.p3', '每 8 根数据线配一对'); says('ch7.law', '每 8 根线配一对'); says('dg.dpc.dq', '每 8 根配一对');
}

/* ── 08 ECC, by an independent count ── */
{
  // (136,128) SEC with two errors at a < b: syndrome a ^ b ≠ 0; silent when it names a position 1…136, else detected
  let sil = 0, due = 0, tot = 0;
  for (let a = 1; a <= 136; a++) for (let b = a + 1; b <= 136; b++) { tot++; const s = a ^ b; if (s >= 1 && s <= 136) sil++; else due++; }
  const e2 = M.eccStats('sec', 2);
  check('SEC 2 errors: total C(136,2)', e2.total, tot); check('SEC 2 errors: silent count', Math.round(e2.silent * e2.total), sil); check('SEC 2 errors: detected count', Math.round(e2.due * e2.total), due);
  check('C(136,2) = 9180', tot, 9180);
  check('SEC and SECDED fix every single error', [M.eccStats('sec', 1).fixed, M.eccStats('secded', 1).fixed].join(), '1,1');
  check('SECDED detects every double error', M.eccStats('secded', 2).due, 1);
  check('SECDED 3 errors: never fixed, some silent', M.eccStats('secded', 3).fixed === 0 && M.eccStats('secded', 3).silent > 0.5, true);
  check('no ECC: all silent', M.eccStats('none', 2).silent, 1);
  check('decode by hand: SEC one error at 5 → fixed; at 3 and 5 → syndrome 6 → silent', [M.decode('sec', [5]), M.decode('sec', [3, 5])].join(), 'fixed,silent');
  check('decode by hand: SEC 100 and 200? no — positions ≤ 136: 129 and 1 → syndrome 128 → silent; 129 and 8 → 137 → due', [M.decode('sec', [1, 129]), M.decode('sec', [8, 129])].join(), 'silent,due');
  check('decode by hand: SECDED overall parity bit alone → fixed', M.decode('secded', [72]), 'fixed');
  // (136,128) layouts, recounted independently: textbook columns 1..136 agree with the decoder's enumeration; the
  // odd-weight layout (128 odd-weight columns + 8 smallest even-weight) by direct reasoning: odd⊕odd is even and lands
  // on a used column only if it is one of the 8 even ones; odd⊕even is odd and always used; even⊕even is even.
  {
    const tb = M.secDouble('textbook'); check('textbook (136,128) double-error silent share = decoder enumeration', f(tb.silent, 9), f(e2.silent, 9));
    const cols = M.secColumns('oddweight'), pc = v => v.toString(2).split('').filter(c => c === '1').length;
    check('odd-weight layout: 136 distinct nonzero 8-bit columns incl. the 8 unit vectors', [cols.length, new Set(cols).size, cols.every(c => c > 0 && c < 256), [1, 2, 4, 8, 16, 32, 64, 128].every(u => cols.includes(u))].join(), '136,136,true,true');
    const odd = cols.filter(c => pc(c) % 2), even = cols.filter(c => !(pc(c) % 2)), evSet = new Set(even);
    check('odd-weight layout: 128 odd + 8 even columns (the literals in ch8.p4)', [odd.length, even.length].join(), '128,8');
    let mis = odd.length * even.length; for (let i = 0; i < odd.length; i++) for (let j = i + 1; j < odd.length; j++) if (evSet.has(odd[i] ^ odd[j])) mis++;
    for (let i = 0; i < even.length; i++) for (let j = i + 1; j < even.length; j++) if (evSet.has(even[i] ^ even[j])) mis++;
    check('odd-weight layout silent share, recounted by parity classes', f(M.secDouble('oddweight').silent, 9), f(mis / 9180, 9));
    check('odd-weight layout far below the textbook layout', M.secDouble('oddweight').silent < 0.25 && tb.silent > 0.85, true);
  }
  const ex = M.eccExample('sec', 2, 1); check('example syndrome = xor of positions', ex.syndrome, ex.pos[0] ^ ex.pos[1]);
  says('ch8.model.how', '(136,128)'); says('ch8.model.how', '(72,64)'); check('code sizes', [M.ECC.sec.n, M.ECC.sec.k, M.ECC.secded.n, M.ECC.secded.k].join(), '136,128,72,64');
  says('ch8.p3', '32 位数据加 4 位校验'); says('ch8.p3', '加 8 位'); check('36 = 32 + 4, 40 = 32 + 8', [D5.eccSubSodimm - D5.subWidth, D5.eccSubRdimm - D5.subWidth].join(), '4,8');
}

/* ── 09 PAM3 ── */
{
  check('3 bits in 2 PAM3 symbols: 9 ≥ 8', Math.pow(3, 2) >= Math.pow(2, 3), true); check('pairs', Object.values(M.pam3Pairs()).join(), '9,8,3');
  says('ch9.p2', '9 种组合'); says('ch9.p2', '8 种表示 3 个比特'); says('dg.pam3.note', '1.5 比特'); says('ch9.p2', '32 位宽');
  const x = M.crossNrzPam3() * 2 / M.SIG.k, s = M.signal(x);
  near('NRZ and PAM3 eyes equal at the crossover', s.nrz.eye, s.pam3.eye, 1e-9);
  const y = M.crossPam3Pam4() * 2 / M.SIG.k, s2 = M.signal(y);
  near('PAM3 and PAM4 eyes equal at the crossover', s2.pam3.eye, s2.pam4.eye, 1e-9);
  check('best: NRZ below, PAM3 between, PAM4 above', [M.signal(x - 1).best, M.signal((x + y) / 2).best, M.signal(y + 1).best].join(), 'nrz,pam3,pam4');
  says('ch9.p3', '32 Gb/s'); check('ch9.p3 default slider 32', /id="sgG"[^>]*value="32"/.test(html), true);
  says('ch9.p3', 'PCIe 6.0 选 PAM4');
  says('ch9.p4', '6900P'); says('ch9.p4', '6700P'); says('ch9.p4', '至强 6');
  check('MRDIMM: chips at half the channel rate', FRONTIER.mrdimm.gen1 / 2, 4400);
}

/* ── 10 row hammer ── */
{
  const h = M.hammer(2, 'none', 139000);
  check('ACTs per interval = floor((3900 − 295) / 48) = 75', h.perInt, Math.floor((3900 - 295) / 48)); check('= 75', h.perInt, 75);
  check('double-sided victim, no defence: every ACT of a window', h.worst, 75 * 8192);
  check('per aggressor per window', h.perAgg, 75 * 8192 / 2);
  check('max ACTs in 64 ms at 50 ns = 1.28 M', M.maxActs(64, 50), 1.28e6);
  const p = M.hammer(10, 'prac', 4800);
  check('PRAC: alert threshold a quarter of 4800', p.nbo, 1200);
  check('PRAC: victim below two thresholds', p.worst < 2 * p.nbo && p.flips === 0, true);
  for (const nA of [2, 10, 24]) for (const hc of M.RH.hcs) check(`PRAC holds at ${nA} aggressors, ${hc}`, M.hammer(nA, 'prac', hc).flips, 0);
  check('TRR(8) holds two aggressors', M.hammer(2, 'trr', 4800).worst < 4800, true);
  check('TRR(8) fails at ten aggressors and threshold 10000', M.hammer(10, 'trr', 10000).flips > 0, true);
  check('TRR(16) holds ten', M.hammer(10, 'trr', 10000, { k: 16 }).flips, 0);
  says('ch10.p4', '10 个攻击行'); says('ch10.p4', '门槛是 1 万'); says('ch10.p4', '13.9 万'); says('ch10.p4', '门槛 4800'); says('ch10.p4', '16 行'); says('ch10.p4', '4 行'); says('ch10.limit', '八分之一'); says('ch10.limit', '二分之一');
  check('ch10 literals are model values', [M.RH.hcs.includes(10000), FACTS.kim2014.minAct, FACTS.kim2020.perRow].join(), 'true,139000,4800');
  check('ch10 thresholds on the page', M.RH.hcs.every(hc => html.includes(`name="rhH" value="${hc}"`)), true);
  check('slider range covers 2 and 24', /id="rhN" min="2" max="24"/.test(html), true);
  says('ch10.model.how', '四分之一'); check('PRAC fraction a quarter', M.RH.pracFrac, 0.25);
}

/* ── tuned parameters halved / doubled (BRIEF.md lists the same) ── */
{
  // ch7 chip pitch: needs training at 6400 either way
  check('ch7 pitch halved / doubled: still more than half a UI at 6400', M.flyby(6400, 7).needTrain && M.flyby(6400, 28).needTrain, true);
  // ch9 loss slope: the PAM3 window moves (by 1/k), the ordering does not
  for (const k of [0.6, 2.4]) { const lo = M.crossNrzPam3() * 2 / k, hi = M.crossPam3Pam4() * 2 / k; check('ch9 slope ' + k + ': NRZ, PAM3, PAM4 in order', [M.signal(lo - 1, k).best, M.signal((lo + hi) / 2, k).best, M.signal(hi + 1, k).best].join(), 'nrz,pam3,pam4'); }
  // ch10 TRR table: halved to 4 fails at 10 aggressors, doubled to 16 holds
  check('ch10 TRR k=4 at 10 aggressors fails', M.hammer(10, 'trr', 10000, { k: 4 }).flips > 0, true);
  // ch10 PRAC fraction: halved or doubled, still no flips at 4800 (doubled to one half: two sides × one half = the threshold, never above)
  for (const fr of [0.125, 0.5]) for (const hc of M.RH.hcs) for (const nA of [2, 10, 24]) check(`ch10 PRAC fraction ${fr} still safe at ${hc}, ${nA} aggressors`, M.hammer(nA, 'prac', hc, { pracFrac: fr }).flips, 0);
  // ch3 / ch5 traces: other seeds keep the ordering of ch5 (more banks, more bandwidth)
  for (const s of [1, 2, 3]) { const T = M.timing('ddr5-6400b'), a = M.simulate(T, M.bwTrace(1, 0, 400, s), { mode: 'flood' }), b = M.simulate(T, M.bwTrace(32, 0, 400, s), { mode: 'flood' }); check('ch5 seed ' + s + ': 32 banks ≫ 1 bank', b.gbps > 10 * a.gbps, true); }
}

/* ── every prose placeholder is a prose() key; pinned values ── */
{
  const P = M.prose();
  const want = { refi4: '7.8', refi5: '3.9', rfc4: '350', rfc4b: '550', rfc4a: '160', rfc5f: '160', rfc5s: '130', busy4: '4.5', busy4b: '7.1', busy5: '7.6', busy5h: '15.1', busy5f: '8.2', ext5: '11.2', ext5f: '6.6', ext5s: '4.3', refN: '8192', refMs: '32',
    bgs: '8', bpg: '4', banks: '32', rows: '65536', page: '1024', chips: '4', rowKiB: '4', linesRow: '64', abits: '35', agib: '32', dimmGB: '16', dens: '16', mRow: '18251', mBg: '2', mBa: '2', mCol: '30', mCh: '1', mSub: '0',
    tck6: '312.5', cl6: '52', rcd6: '52', rp6: '52', ras6: '103', rc6: '155', bl2: '8', hit6: '18.75', miss6: '35.0', conf6: '51.25', hit6c: '60', miss6c: '112', conf6c: '164', rc6ns: '48.4', trN: '48', sRlat: '43.1', sSlat: '21.5', sPlat: '50.9', sPclat: '48.2', sRclat: '35.3', sRconf: '24', sRmiss: '24',
    cl43: '13.75', cl4x: '10.0', cl56: '16.25', cl5x: '10.0', miss5x: '22.2', miss4x: '21.25', tck4: '0.625', tck5: '0.3125', peak4: '25.6', peak6: '51.2', burst4: '2.5', burst6: '2.50', dramNs: '70',
    bwPeak: '25.6', bwDimm: '51.2', bw1_0: '1.3', bw32_0: '21.9', bw32_0f: '86', bw8_9f: '93', bw1_1f: '49', bwN: '400', bl16bytes: '64', bl8bytes: '64', pref: '16', vdd: '1.1', pmicIn: '5', core6: '400', peak2ch: '102.4',
    bgN: '256', ccdl64: '16', ccds: '8', g1_64: '49', g2_64: '95', g1_32: '98', g1_88: '36', ccdl88: '22', faw1k: '32', faw2k: '40', rrds: '8', gn1k: '95', gn2k: '77',
    flyPs: '93.7', flySpan: '375', ui64: '156.3', flyUi64: '2.4', flyUi4: '0.15', flyUi32: '1.20', pitch: '14', flyChips: '5', flyUiH: '1.2', flyUiD: '4.8', tpd: '170', amd1: '5600', amd2: '3600', amdR: '64',
    odData: '128', odCheck: '8', eccSo: '36', eccRd: '40', e1fix: '100', e2sil: '88', e2due: '12', d2due: '100', d3sil: '76', e2n: '9180', e2silOdd: '17',
    s32nrz: '16', s32pam3: '10.7', s32pam4: '8', xNP3: '18.1', xP3P4: '21.1', xNP3g: '30', xP3P4g: '35', sigK: '1.2', xNP3g2: '15', xNP3gh: '60', g7max: '48', g7w: '32', g7dev: '192', r5090: '1792', r5090g: '28', r5090w: '512',
    lp5x: '10.7', lp6lo: '10667', lp6hi: '14400', lp6dq: '12', camLo: '8', camHi: '128', mr1: '8800', mr1half: '4400', mr2: '12800', mrX7: '8000', mrBw: '70.4',
    kimN: '129', kimV: '110', kimMin: '139', kimWin: '64', kimRC: '50', kimMax: '1.28', k20chips: '1580', k20min: '9.6', k20row: '4.8', trrN: '42', trrV: '13', trrSides: '19',
    rhPer: '75', rhWorstN: '614', rhT2: '75', rhT10: '122.9', rhT10f: '5', rhT10b: '0', rhP10: '2399', rhP10a: '1010', rhNbo: '1200', rhK: '8', rhT10k16: '136', rhT10k4: '122.9', rhT10n: '122.9',
    rec: '13606', recPrev: '13556', d6lo: '8800', d6hi: '17600', prac88: '8800' };
  for (const [k, [v, d, kind]] of Object.entries(P)) check('prose ' + k, kind === 'pct' ? f(v * 100, d) : f(v, d), want[k]);
  check('every prose value pinned', Object.keys(P).sort().join(','), Object.keys(want).sort().join(','));
  const used = new Set();
  for (const m of html.matchAll(/data-i18n-html="([^"]+)"/g)) { const v = Z[m[1]] || ''; for (const p of v.matchAll(/\{(\w+)\}/g)) { used.add(p[1]); n++; if (!(p[1] in P)) { fails++; console.error(`FAIL {${p[1]}} in ${m[1]} is not filled on the page`); } } }
  for (const k of Object.keys(P)) { n++; if (!used.has(k)) { fails++; console.error('FAIL prose() value ' + k + ' is never quoted'); } }
  // keys used only by the diagrams' figcaptions are data-i18n-html too, so they are in `used`
  // the claims the prose makes about the models
  check('ch1: FGR busier, but shorter extra wait; same-bank shortest', P.busy5f[0] > P.busy5[0] && P.ext5f[0] < P.ext5[0] && P.ext5s[0] < P.ext5f[0], true);
  check('ch1: hot doubles', f(P.busy5h[0], 6), f(2 * P.busy5[0], 6));
  check('ch3: stream < random close < random open < ping-pong', P.sSlat[0] < P.sRclat[0] && P.sRclat[0] < P.sRlat[0] && P.sRlat[0] < P.sPlat[0], true);
  check('ch3: random close = all misses', M.ch3('random', 'close', 'ddr5-6400b').chain.counts.miss, M.TR.n);
  check('ch3: ping-pong close still above the conflict-free miss', P.sPclat[0] > P.miss6[0], true);
  check('ch4: "差不多": DDR5-6400 CL32 miss within 1 ns of DDR4-3200 CL16', Math.abs(P.miss5x[0] - P.miss4x[0]) < 1, true);
  check('ch4: bandwidth doubles', P.peak6[0], 2 * P.peak4[0]);
  check('ch5: 32 banks at no hits far above one bank', P.bw32_0[0] > 10 * P.bw1_0[0], true);
  check('ch6: frequency makes grouping matter', P.g1_32[0] > P.g1_64[0] && P.g1_64[0] > P.g1_88[0], true);
  check('ch7: 2DPC is 64 % of 1DPC', Math.round(P.amdR[0] * 100), 64);
  check('ch8: (72,64) silent at 3 errors', P.d3sil[0] > 0.5, true);
  check('ch10: TRR k=8 at 10 aggressors same as no defence', P.rhT10[0], P.rhT10n[0]);
  check('ch10: none of 10 aggressors flips at the 2014 threshold', P.rhT10b[0], 0);
  check('ch10: no-defence double-sided above the 2014 threshold', P.rhWorstN[0] * 1000 > FACTS.kim2014.minAct, true);
  check('ch12: DDR5-6400 module = 51.2 GB/s', P.bwDimm[0], 51.2);
}

/* ── sentence branches at the extremes of each control ── */
{
  const has = k => { n++; if (Z[k] == null) { fails++; console.error('FAIL missing say key ' + k); } };
  const seen = new Set(), add = s => { has(s.key); seen.add(s.key); };
  for (const g of ['ddr4', 'ddr5']) for (const d of g === 'ddr4' ? [2, 4, 8, 16] : [8, 16]) for (const hot of [false, true]) for (const m of ['ab', 'fgr', 'sb']) add(M.say.refresh(g, d, hot, m));
  for (const a of [M.ADDR.def, '0x0', '0xFFFFFFFFFF']) for (const sc of ['rowfirst', 'bgfirst']) add(M.say.addr(M.mapAddr(M.parseHex(a), sc, 2, 1)));
  for (const k of ['stream', 'random', 'pingpong']) for (const p of ['open', 'close']) for (const b of ['ddr4-3200aa', 'ddr5-6400b', 'ddr5-6400x']) add(M.say.ch3(k, p, b));
  for (let mts = 1600; mts <= 9600; mts += 400) for (let cl = 10; cl <= 64; cl += 2) add(M.say.cl(mts, cl));
  for (const nb of M.BW.banks) for (let i = 0; i <= 10; i++) add(M.say.bw(nb, i / 10));
  for (const g of [1, 2, 4, 8]) for (const r of M.BG.rates) for (const nr of [false, true]) for (const x of [false, true]) add(M.say.bg(g, r, nr, nr && x));
  for (let mts = 400; mts <= 8800; mts += 400) for (const p of [7, 14, 28]) add(M.say.fly(mts, p));
  for (const c of ['none', 'sec', 'secded']) for (const k of [1, 2, 3]) add(M.say.ecc(c, k));
  for (let g = 8; g <= 48; g += 4) for (const k of [0.6, 1.2, 2.4]) add(M.say.sig(g, k));
  for (const nA of [2, 10, 24]) for (const m of ['none', 'trr', 'prac']) for (const hc of M.RH.hcs) add(M.say.rh(nA, m, hc));
  const all = ['ch1.say.normal', 'ch1.say.hot', 'ch1.say.fgr', 'ch1.say.sb', 'ch2.say.map', 'ch2.say.over', 'ch3.say.hits', 'ch3.say.conflicts', 'ch3.say.misses', 'ch3.say.missclose',
    'ch4.say.same', 'ch4.say.faster', 'ch4.say.slower', 'ch5.say.full', 'ch5.say.one', 'ch5.say.mid', 'ch5.say.conflict', 'ch6.say.same', 'ch6.say.sameok', 'ch6.say.rot', 'ch6.say.faw', 'ch6.say.fawok',
    'ch7.say.train', 'ch7.say.fine', 'ch8.say.none', 'ch8.say.fixed', 'ch8.say.silent', 'ch8.say.due', 'ch9.say.nrz', 'ch9.say.pam3', 'ch9.say.pam4',
    'ch10.say.flipnone', 'ch10.say.flip', 'ch10.say.trrok', 'ch10.say.safe', 'ch10.say.prac'];
  for (const k of all) check('branch reached ' + k, seen.has(k), true);
  const fixed = ['ch2.say.bad'];
  for (const k of fixed) { has(k); n++; if (!app.includes(`'${k}'`)) { fails++; console.error('FAIL app.js never shows ' + k); } }
  for (const k of Object.keys(Z)) if (/\.say\./.test(k)) check('say key is a branch ' + k, all.includes(k) || fixed.includes(k), true);
}

/* ── keys, language hygiene, registry, siblings ── */
{
  const keys = new Set([...html.matchAll(/data-i18n(?:-html|-aria|)="([^"]+)"/g)].map(m => m[1]));
  for (const m of app.matchAll(/'((?:ch\d+|dg|u|doc)\.[\w.-]*\w)'/g)) keys.add(m[1]);
  for (const id of ['d4_2', 'd4_4', 'd4_8', 'd4_16', 'd5_8', 'd5_16']) keys.add('ch1.chip.' + id);
  for (const f2 of ['off', 'ch', 'sub', 'col', 'bg', 'ba', 'rank', 'row']) { keys.add('ch2.bits.f.' + f2); if (f2 !== 'rank') keys.add('dg.addr.' + f2); }
  for (const id of M.BIN_ORDER) keys.add('ch4.bin.' + id);
  for (const o of ['fixed', 'due', 'silent']) keys.add('ch8.out.' + o);
  for (const s of ['nrz', 'pam3', 'pam4']) keys.add('ch9.s.' + s);
  for (const k of ['wl', 'bl', 't', 'c', 'leak', 'ref', 'sa', 'e1', 'e2', 'e3']) keys.add('dg.cell.' + k);
  for (const k of ['e1', 'e2', 'e3']) keys.add('dg.addr.' + k);
  for (const k of ['pre', 'act', 'rd', 'trp', 'trcd', 'cl', 'conf', 'miss', 'hit']) keys.add('dg.timing.' + k);
  for (const k of ['dq', 'fly', 'stub']) keys.add('dg.dpc.' + k);
  for (const k of ['single', 'double', 'agg', 'vic', 'ok']) keys.add('dg.hammer.' + k);
  for (const m of html.matchAll(/data-dg="(\w+)"/g)) keys.add('dg.' + m[1] + '.aria');
  for (const k of [...keys]) if (/\.$/.test(k) || /^(ch\d+|dg|u)\.$/.test(k)) keys.delete(k);
  for (const k of ['dg.cell.e', 'ch2.bits.f', 'dg.addr', 'dg.timing', 'dg.dpc', 'dg.hammer', 'ch8.out', 'ch9.s', 'ch4.bin', 'ch1.chip', 'ch3.bin', 'ch2.next']) keys.delete(k);
  for (const k of keys) { n++; if (Z[k] == null) { fails++; console.error('FAIL missing zh key ' + k); } }
  // every copy key is used somewhere
  const appKeys = new Set([...app.matchAll(/'((?:ch\d+|dg|u|doc)\.[\w.-]*\w)'/g)].map(m => m[1]));
  for (const k of Object.keys(Z)) {
    const direct = keys.has(k) || appKeys.has(k) || html.includes(`"${k}"`);
    const prefixed = [...appKeys].some(p => k.startsWith(p + '.')) || /^dg\.\w+\.(aria|cap)$/.test(k) || /^(nav|toc)\./.test(k) || /^u\./.test(k) || /^ch\d+\.say\./.test(k);
    n++; if (!direct && !prefixed && !/^ch2\.next\./.test(k) && !/^dg\.(cell|addr|timing|dpc|hammer|bank|dimm|bg|ecc|pop|pam3)\./.test(k)) { fails++; console.error('FAIL copy key never used: ' + k); }
  }
  // the say sentences' placeholders are supplied by app.js
  for (const [k, v] of Object.entries(Z)) if (/\.say\./.test(k)) for (const m of v.matchAll(/\{(\w+)\}/g)) {
    n++; if (!new RegExp('\\b' + m[1] + '\\s*:|[{,]\\s*' + m[1] + '\\s*[,}]').test(app)) { fails++; console.error(`FAIL placeholder {${m[1]}} in ${k} is never supplied by app.js`); }
  }
  check('six or more diagrams', [...html.matchAll(/class="dia" data-dg="/g)].length >= 6, true);
  check('every diagram has a DG spec', [...html.matchAll(/data-dg="(\w+)"/g)].every(m => app.includes('DG.' + m[1] + ' = ')), true);
  check('scripts carry the cache key', (html.match(/\?v=20261115/g) || []).length, 4);
  check('no page-provenance label (registrar adds it)', /page-provenance/.test(html), false);
  for (const file of ['index.html', 'app.js', 'models.js']) {
    let src = fs.readFileSync(path.join(DIR, file), 'utf8');
    if (file === 'index.html') {
      const tt = src.match(/<title>([^<]*)<\/title>/)[1], md = src.match(/<meta name="description" content="([^"]*)">/)[1];
      check('static title = doc.title', tt, Z['doc.title']); check('static meta = doc.desc', md, Z['doc.desc']);
      src = src.replace(/<title>[^<]*<\/title>/, '').replace(/<meta name="description" content="[^"]*">/, '');
    }
    src = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '').replace(/<!--[\s\S]*?-->/g, '');
    n++;
    const others = (src.match(/[一-鿿]+/g) || []).filter(x => !(file === 'index.html' && x === '中'));
    if (others.length) { fails++; console.error(`FAIL Chinese text in ${file}: ${others.slice(0, 3).join(' ')}`); }
  }
  const R = JSON.parse(fs.readFileSync(path.join(DIR, 'REGISTRY.json'), 'utf8'));
  check('registry slug/path', R.slug + ' ' + R.path, 'how-memory-talks computing/systems/how-memory-talks/');
  check('registry category', [R.category, R.subtopic, R.stage].join('/'), 'computing/systems/university');
  check('registry title', R.title.zh, Z['doc.title'].split(' · ')[0]); check('registry desc', R.desc.zh, Z['doc.desc']);
  check('hero title = registry title', Z['hero.title'], R.title.zh);
  for (const c of R.concepts) check('anchor ' + c.anchor, html.includes('id="' + c.anchor.slice(1) + '"'), true);
  for (const c of R.concepts) { n++; if (!c.aliases.zh.length || !c.aliases.en.length || !c.title.en || !c.desc.en) { fails++; console.error('FAIL concept incomplete ' + c.id); } }
  check('one concept per chapter', R.concepts.map(c => c.anchor).join(), Array.from({ length: 12 }, (_, i) => '#ch' + (i + 1)).join());
  check('concept ids unique', new Set(R.concepts.map(c => c.id)).size, 12);
  // one word, one owner: no alias already owned by another page on the site (the series' siblings, and every other REGISTRY.json)
  const norm = s => s.toLowerCase().replace(/\s+/g, '');
  const owned = new Map(), root = path.join(DIR, '..', '..', '..');
  for (const cat of fs.readdirSync(root)) { const cp = path.join(root, cat); if (!fs.statSync(cp).isDirectory() || cat.startsWith('.')) continue;
    for (const sub of fs.readdirSync(cp)) { const sp = path.join(cp, sub); if (!fs.statSync(sp).isDirectory()) continue;
      for (const slug of fs.readdirSync(sp)) { if (slug === 'how-memory-talks') continue; const p = path.join(sp, slug, 'REGISTRY.json'); if (!fs.existsSync(p)) continue;
        let J; try { J = JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { continue; }
        for (const c of J.concepts || []) for (const a of [...(c.aliases.zh || []), ...(c.aliases.en || [])]) owned.set(norm(a), slug); } } }
  // words the series task file keeps with other pages even before they register
  for (const a of ['ECC', 'ecc memory', '内存纠错ECC', 'NUMA', '内存控制器', '内存墙', 'AMAT', '延迟与带宽的区别', '利特尔法则', '内存带宽瓶颈', 'HBM', 'PAM3 是什么', 'PAM4', 'NRZ', '为什么并行总线被串行取代', '内存怎么存一位', '内存带宽', 'CXL 内存池', 'CXL']) if (!owned.has(norm(a))) owned.set(norm(a), 'TASK');
  for (const c of R.concepts) for (const a of [...c.aliases.zh, ...c.aliases.en]) { n++; if (owned.has(norm(a))) { fails++; console.error(`FAIL alias owned by ${owned.get(norm(a))}: ${a}`); } }
  for (const l of ['zh', 'en']) { const mine = R.concepts.flatMap(c => c.aliases[l].map(norm)); check('aliases unique within the page, ' + l, new Set(mine).size, mine.length); }
  // sibling links point at chapters that exist
  const all = Object.values(Z).join('');
  const hrefs = [...all.matchAll(/href='([^']+)'/g)].map(m => m[1]);
  const SIBS = ['switches-that-compute', 'why-compute-waits-for-memory', 'what-a-drive-is-made-of', 'how-cpu-caches-work', 'how-a-computer-is-wired', 'how-sata-works', 'how-pcie-works', 'how-thunderbolt-works', 'coherent-interconnects'];
  for (const h of hrefs) {
    const m = h.match(/^\.\.\/([\w-]+)\/(#ch\d+)?$/); n++;
    if (!m || !SIBS.includes(m[1])) { fails++; console.error('FAIL unexpected link ' + h); continue; }
    let dir = null; for (const sub of ['computing/systems', 'computing/storage', 'tech/networks', 'computing/hardware']) { const d = path.join(root, sub, m[1]); if (fs.existsSync(path.join(d, 'index.html'))) dir = d; }
    if (!dir) { const hit = fs.readdirSync(root).map(c => path.join(root, c)).filter(p => fs.statSync(p).isDirectory()).flatMap(c => fs.readdirSync(c).map(s => path.join(c, s, m[1]))).find(p => fs.existsSync(path.join(p, 'index.html'))); dir = hit || null; }
    n++; if (!dir) { fails++; console.error('FAIL link target missing ' + h); continue; }
    if (!h.startsWith('../') || path.dirname(dir) !== path.dirname(DIR)) { /* links are written as ../<slug>/, so the sibling must sit in the same folder */ n++; if (path.dirname(dir) !== path.dirname(DIR)) { fails++; console.error('FAIL link is not a sibling folder: ' + h); } }
    if (m[2]) check(`${m[1]} anchor ${m[2]}`, fs.readFileSync(path.join(dir, 'index.html'), 'utf8').includes(`id="${m[2].slice(1)}"`), true);
  }
  // B4 is live since 2026-11-15: ch11.c3 links its #ch5 (memory expansion), ch12.links its page top
  check('ch11.c3 links B4 #ch5', Z['ch11.c3'].includes("href='../coherent-interconnects/#ch5'"), true);
  check('ch12.links links B4', Z['ch12.links'].includes("href='../coherent-interconnects/'"), true);
  check('no plain-text "later essay on interconnects" left', /后续一篇讲片间|留给本系列后续/.test(all), false);
  for (const [k, sib] of [['ch1.p2', 'switches-that-compute'], ['ch1.p2', 'what-a-drive-is-made-of'], ['ch3.p5', 'how-cpu-caches-work'], ['ch4.p4', 'why-compute-waits-for-memory'], ['ch7.p1', 'how-sata-works'], ['ch7.p3', 'how-pcie-works'], ['ch9.p2', 'how-thunderbolt-works'], ['ch9.p3', 'why-compute-waits-for-memory']])
    check(`${k} links ${sib}`, Z[k].includes(`href='../${sib}/`), true);
  // sibling titles quoted as in their copy
  for (const sib of SIBS) { const p = path.join(DIR, '..', sib, 'copy.zh.js'); if (!fs.existsSync(p)) continue; const vz = { window: {} }; vm.runInNewContext(fs.readFileSync(p, 'utf8'), vz); const tt = vz.window.ESSAY_COPY.zh['hero.title']; if (all.includes(`../${sib}/`)) { n++; if (!all.includes('《' + tt + '》')) { fails++; console.error(`FAIL ${sib} title not quoted as 《${tt}》`); } } }

  const ectx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.en.js'), 'utf8'), ectx);
  const EN = ectx.window.ESSAY_COPY.en, stub = ectx.window.ESSAY_COPY.enStub === true, ph = s => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');
  check('en keys = zh keys', Object.keys(EN).sort().join('|'), Object.keys(Z).sort().join('|'));
  for (const k of Object.keys(Z)) check('en placeholders ' + k, ph(EN[k]), ph(Z[k]));
  if (stub) { check('en stub mirrors zh exactly', JSON.stringify(EN), JSON.stringify(Z)); console.log('NOTE: copy.en.js is a stub (enStub); English registry match skipped until it is translated'); }
  else { check('registry title en', R.title.en, EN['doc.title'].split(' · ')[0]); check('registry desc en', R.desc.en, EN['doc.desc']); }
}

if (fails) { console.error(`\n${fails} of ${n} checks failed`); process.exit(1); }
console.log(`PASS: ${n} checks (datasheet figures, refresh and address split by hand, the simulator against closed forms and every timing rule, Hamming counts, PAM3 crossovers, row-hammer arithmetic, tuned parameters halved/doubled, and every number in the prose match the models)`);
