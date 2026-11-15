'use strict';
// Pins the page's models to their sources: the generation table and latency table of Das Sharma 2022 (slides 4 and 13),
// the TLP header layouts (field widths, Fmt/Type codes, real header bytes), Linux pci_regs.h / pci-ecam.h offsets,
// the Intel SDM MSI format and a real lspci record, Hargin's loss figures, the Q-function results for NRZ and PAM4,
// and the FLIT byte budget. Checks each named result against an independent closed form, pins every number the
// prose quotes (placeholders filled from prose(), literals checked against models.js), pins how far each conclusion
// moves when a tuned parameter is halved or doubled, evaluates every live-sentence branch, and checks the copy,
// the registry and the sibling links.
// Run: node computing/systems/how-pcie-works/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const M = require(path.join(DIR, 'models.js'));
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;
const html = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(DIR, 'app.js'), 'utf8');
const { GENS, FLIT, LANE, GEN3, TLP, FC, ARQ, CFG, ENUM, MSI, LOSS, EYE, FEC, FRONTIER, MiB, KiB } = M;

let n = 0, fails = 0;
function check(name, got, want) { n++; if (got !== want) { fails++; console.error(`FAIL ${name}: model gives ${got}, expected ${want}`); } }
function near(name, got, want, tol) { n++; if (!(Math.abs(got - want) <= tol)) { fails++; console.error(`FAIL ${name}: ${got} not within ${tol} of ${want}`); } }
function says(key, phrase) { n++; if (!Z[key] || !Z[key].includes(phrase)) { fails++; console.error(`FAIL prose ${key} should contain "${phrase}"`); } }
const zf = (x, d) => M.fmt(x, d, 'zh');
const P = M.prose();
const pv = k => { const [v, d, kind] = P[k]; return kind === 'pct' ? zf(v * 100, d) + '%' : kind === 'sci' ? M.sci(v, d) : zf(v, d); };
const hx = a => TLP.hex(a).join(' ');

/* ── 02 generations, encodings, the Gen3 choice ── */
{
  check('rates GT/s', Object.values(GENS).map(g => g.gts).join(), '2.5,5,8,16,32,64,128,256');
  check('years (Das Sharma slide 4; Gen7 2025; Gen8 target 2028)', Object.values(GENS).map(g => g.year).join(), '2003,2007,2010,2017,2019,2022,2025,2028');
  check('encodings', Object.values(GENS).map(g => g.enc).join(), '8b10b,8b10b,128b130b,128b130b,128b130b,flit,flit,flit');
  check('PAM4 from Gen6', Object.values(GENS).map(g => !!g.pam4).join(), 'false,false,false,false,false,true,true,true');
  near('Gen1 lane 0.25 GB/s', LANE.dataGBps(1), 0.25, 1e-12);
  near('Gen3 lane 8·128/130/8', LANE.dataGBps(3), 8 * 128 / 130 / 8, 1e-12);
  near('Gen5 ×16 = 63.0 GB/s', M.LINK5x16(), 32 * 16 * 128 / 130 / 8, 1e-9); check('Gen5 ×16 prose', pv('g5x16'), '63.0');
  near('Gen6 lane 64/8·236/256', LANE.dataGBps(6), 7.375, 1e-12); near('Gen7 lane', LANE.dataGBps(7), 14.75, 1e-12);
  check('Gen6 baud stays at Gen5', LANE.baud(6), LANE.baud(5)); check('Gen6 Nyquist 16 GHz', LANE.nyquist(6), 16); check('Gen7 Nyquist 32 GHz', LANE.nyquist(7), 32);
  near('Gen4 ×8 = Gen3 ×16 (one generation older at twice the width)', LANE.link(4, 8), LANE.link(3, 16), 1e-9);
  near('Gen4 ×8 = 2 × Gen3 ×8', LANE.link(4, 8), 2 * LANE.link(3, 8), 1e-9);
  // Froelich 2008: 8 GT/s scrambled vs 10 GT/s 8b/10b; insertion loss of the same channel at 4 and 5 GHz
  near('Gen3 option 8 GT/s → 7.88 Gb/s', GEN3.data(GEN3.opt8), 8 * 128 / 130, 1e-9); check('option 10 GT/s → 8 Gb/s', GEN3.data(GEN3.opt10), 8);
  check('insertion loss 13.5 dB at 4 GHz, 19.3 dB at 5 GHz', [GEN3.opt8.ilDb, GEN3.opt10.ilDb].join(), '13.5,19.3');
  check('oDb 5.8', pv('oDb'), '5.8'); check('g3g2 1.97', pv('g3g2'), '1.97'); check('enc130', pv('enc130'), '1.54%'); check('flitOh', pv('flitOh'), '7.8%');
  // negotiation: the common highest generation and width
  const ng = (c, s) => LANE.negotiate(c, s);
  check('Gen4 ×16 card in Gen3 ×16 slot', JSON.stringify([ng({ g: 4, w: 16 }, { g: 3, w: 16 }).g, ng({ g: 4, w: 16 }, { g: 3, w: 16 }).w, ng({ g: 4, w: 16 }, { g: 3, w: 16 }).limit]), '[3,16,"gen"]');
  check('×16 card in ×8 slot', ng({ g: 4, w: 16 }, { g: 4, w: 8 }).limit, 'width');
  check('both limited', ng({ g: 5, w: 16 }, { g: 3, w: 4 }).limit, 'genwidth');
  check('card is the limit', ng({ g: 3, w: 4 }, { g: 5, w: 16 }).limit, 'card');
  check('match', ng({ g: 4, w: 4 }, { g: 4, w: 4 }).limit, 'none');
  check('Gen4 ×8 prose', pv('g4x8'), '15.8');
  says('ch2.p2', '2.5 GT/s'); says('ch2.p2', '5 GT/s'); says('ch2.p3', '8 GT/s'); says('ch2.p3', '10 GT/s'); says('ch2.p3', '2008');
  says('ch2.p4', '16 GT/s（2017 年）'); says('ch2.p4', '32 GT/s（2019 年）'); says('ch2.p4', 'Gen6（2022 年）的 64 GT/s'); says('ch2.p4', 'Gen7（2025 年）128 GT/s');
  says('ch2.p2', 'Gen2（2007 年）'); says('ch2.p3', 'Gen3（2010 年）'); says('ch1.p1', '2003 年'); says('ch2.p4', '256 字节');
}

/* ── 03 TLP headers: field widths, codes, real bytes, overhead ── */
{
  for (const [name, lay] of Object.entries({ DW0: TLP.DW0, REQ1: TLP.REQ1, ADDR64HI: TLP.ADDR64HI, ADDRLO: TLP.ADDRLO, CPL1: TLP.CPL1, CPL2: TLP.CPL2 }))
    check(`${name} fields sum to 32 bits`, lay.reduce((a, f) => a + f[1], 0), 32);
  const w = (lay, k) => lay.find(f => f[0] === k)[1];
  check('DW0 widths Fmt3 Type5 TC3 Attr2 AT2 Length10', [w(TLP.DW0, 'fmt'), w(TLP.DW0, 'type'), w(TLP.DW0, 'tc'), w(TLP.DW0, 'attr'), w(TLP.DW0, 'at'), w(TLP.DW0, 'len')].join(), '3,5,3,2,2,10');
  check('request DW1: RID16 Tag8 LBE4 FBE4', TLP.REQ1.map(f => f[1]).join(), '16,8,4,4');
  check('completion DW1: CID16 Status3 BCM1 ByteCount12', TLP.CPL1.map(f => f[1]).join(), '16,3,1,12');
  check('completion DW2: RID16 Tag8 R1 LowerAddress7', TLP.CPL2.map(f => f[1]).join(), '16,8,1,7');
  check('MRd64 byte 0 = 0x20', TLP.mem('rd', 2 ** 36, 512, 0x0100, 0x2A).bytes[0], 0x20);
  check('MWr64 byte 0 = 0x60', TLP.mem('wr', 2 ** 36, 512, 0x0100, 0x2A).bytes[0], 0x60);
  check('MWr32 byte 0 = 0x40', TLP.mem('wr', 0xFEE00000, 4, 0, 0).bytes[0], 0x40);
  check('CplD byte 0 = 0x4A', TLP.cpl(256, 512, 0, 0x0100, 0x2A, 0).bytes[0], 0x4A);
  check('MRd64 512 B header', hx(TLP.mem('rd', 0x1000000000, 512, 0x0100, 0x2A).bytes), '20 00 00 80 01 00 2A FF 00 00 00 10 00 00 00 00');
  check('CplD 256 of 512 header', hx(TLP.cpl(256, 512, 0, 0x0100, 0x2A, 0).bytes), '4A 00 00 40 00 00 02 00 01 00 2A 00');
  check('addresses below 4 GiB use 3 DW', TLP.mem('rd', 2 ** 32 - 4, 4, 0, 0).dws.length, 3); check('at 4 GiB use 4 DW', TLP.mem('rd', 2 ** 32, 4, 0, 0).dws.length, 4);
  check('Length 1024 DW encodes as 0', TLP.mem('wr', 2 ** 36, 4096, 0, 0).v.len, 0);
  check('per-TLP overhead 8 bytes', TLP.perTlp, 8); check('4-DW TLP costs 24 bytes (Das Sharma slide 13)', TLP.hdrBytes(true) + TLP.perTlp, 24);
  check('MPS range', TLP.MPS[0] + '..' + TLP.MPS[TLP.MPS.length - 1], '128..4096');
  near('write eff closed form', TLP.write(4096, 256, true).eff, 4096 / (4096 + 16 * 24), 1e-12);
  near('read eff closed form (16 × 256 B completions)', TLP.read(4096, 512, 256, true).eff, 4096 / (4096 + 16 * 20), 1e-12);
  check('r64: 64 completions', TLP.read(4096, 512, 64, true).ncpl, 64);
  check('w256 91.4%', pv('w256'), '91.4%'); check('w128 84.2%', pv('w128'), '84.2%'); check('w512 95.5%', pv('w512'), '95.5%'); check('w64 72.7%', pv('w64'), '72.7%');
  check('r512 92.8%', pv('r512'), '92.8%'); check('r64 76.2%', pv('r64'), '76.2%'); check('w256X', pv('w256X'), '57.6');
  says('ch3.p2', '8 个字节'); says('ch3.p2', '4 GiB'); says('ch3.p3', 'Length 10 位'); says('ch3.p3', '1024 DW'); says('ch3.p3', '4096 字节'); says('ch3.p4', '128 到 4096 字节');
  says('ch5.law', '12 位序号'); check('12-bit sequence numbers', ARQ.seqBits, 12); says('ch3.p1', '32 位的 LCRC');
}

/* ── 04 credits ── */
{
  check('data credit 16 B', FC.dataUnit, 16); check('caps 127 / 2047', FC.maxHdr + '/' + FC.maxData, '127/2047'); check('moduli 256 / 4096', FC.hdrMod + '/' + FC.dataMod, '256/4096');
  says('ch4.p3', '127 个头信用'); says('ch4.p3', '2047 个数据信用'); says('ch4.p1', '16 字节'); says('ch4.p2', '8 位（头）和 12 位（数据）');
  check('cap 2047 credits = 32 KiB', pv('capKiB'), '32');
  // the modular gate: send iff (CL − (CC + need)) mod 2^n ≤ 2^(n−1)
  check('gate: room', FC.gate(100, 50, 16, 4096), true); check('gate: exactly full', FC.gate(66, 50, 16, 4096), true); check('gate: one short', FC.gate(65, 50, 16, 4096), false);
  check('gate across the wrap', FC.gate(10, 4090, 16, 4096), true); check('gate across the wrap, short', FC.gate(10, 4090, 17, 4096), false);
  const fc = FC.closed({ payload: 256, hdr: 127, data: 2047, rtt: 1000 });
  near('closed form W·τ/(τ+RTT)', fc.util, 127 * fc.tau / (fc.tau + 1000), 1e-12); near('τ = 280 B / 63.0 GB/s', fc.tau, 280 / M.LINK5x16(), 1e-12);
  check('limited by data credits at the default (a tie: 2047/16 = 127 = header cap)', fc.lim, 'data');
  const sim = FC.sim({ payload: 256, hdr: 127, data: 2047, rtt: 1000 }, 20000);
  near('event simulation with the modular gate agrees with the closed form', sim.util, fc.util, 0.01);
  check('fcU 56%', pv('fcU'), '56%'); check('fcX 32.4', pv('fcX'), '32.4'); check('fcTau 4.44', pv('fcTau'), '4.44'); check('fcNeed 3,632', pv('fcNeed'), '3,632'); check('fcNeedKB 58.1', pv('fcNeedKB'), '58.1');
  // tuned: the round trip, halved and doubled
  check('RTT halved → 100%', pv('fcHalf'), '100%'); check('RTT doubled → 28%', pv('fcDbl'), '28%');
  check('MPS 128 is header-bound', FC.closed({ payload: 128, hdr: 127, data: 2047, rtt: 1000 }).lim, 'hdr'); check('fc128 31%', pv('fc128'), '31%');
  check('scaled flow control (×16 header cap 2032) fills the link', FC.closed({ payload: 256, hdr: FC.maxHdr * FC.scaleMax, data: 8192, rtt: 1000 }).util, 1);
  check('scale factors 1/4/16', FC.scales.join('/'), '1/4/16'); says('ch4.p5', '1、4 或 16'); says('ch4.p5', String(FC.scaledSlider)); check('scaled slider within the ×16 data cap', FC.scaledSlider <= FC.maxData * FC.scaleMax, true);
  says('ch2.p1', '100 MHz'); says('d4.note', '4 字节'); says('d4.note', '11 位'); says('d4.note', '12 位'); says('d4.note', '8 字节');
  check('×16 scaled caps 2032 / 32,752 (≈512 KiB)', pv('hdrS') + ' ' + pv('capS') + ' ' + pv('capSKiB'), '2,032 32,752 512');
  check('the ×16 cap covers the slowest default: 128 B at 2000 ns', FC.closed({ payload: 128, hdr: 2032, data: 8192, rtt: 2000 }).util, 1);
  says('ch4.p4', '1000 纳秒'); says('ch4.p4', '500 纳秒'); says('ch4.p4', '2000 纳秒'); says('ch4.p4', '256 字节'); says('ch4.p4', '128 字节');
}

/* ── 05 ACK/NAK replay ── */
{
  const a = ARQ.tlp({ payload: 256, ber: 1e-6, rtt: 1000 });
  near('p = 1 − (1 − BER)^(8L), L = 280', a.p, 1 - Math.pow(1 - 1e-6, 8 * 280), 1e-12);
  near('go-back-N U = (1 − p)/(1 + 2a·p), 1 + 2a = ratio (Stallings)', a.U, (1 - a.p) / (1 + (a.ratio - 1) * a.p), 1e-12);
  // independent derivation: each error wastes K = ratio frame times (the bad frame plus the frames sent until the NAK
  // arrives); expected frame times per delivered frame = 1 + K·p/(1 − p)
  near('go-back-N from first principles', a.U, 1 / (1 + a.ratio * a.p / (1 - a.p)), 1e-12);
  near('go-back-N, hand value at 1e-6 / 256 B / 1000 ns', a.U, 0.66360, 5e-5); near('selective repeat 1 − p', a.Usr, 1 - a.p, 1e-12);
  near('errors per second at 1e-12 on 512 Gb/s', ARQ.tlp({ payload: 256, ber: 1e-12, rtt: 1000 }).errPerSec, 0.512, 1e-9);
  check('four replays in a row retrain (2-bit REPLAY_NUM)', ARQ.replayRoll, 4); says('ch5.p3', '2 位'); says('ch5.p3', '四次');
  check('e12', pv('e12'), '0.51'); check('p12', pv('p12'), '2.2 × 10⁻⁹'); check('p8', pv('p8'), '2.2 × 10⁻⁵'); check('u8', pv('u8'), '99.50%');
  check('p6', pv('p6'), '0.22%'); check('u6', pv('u6'), '66%'); check('u6sr', pv('u6sr'), '99.8%'); check('ratio', pv('ratio'), '226'); check('buf KB', pv('buf'), '63');
  check('RTT halved → 80%', pv('u6half'), '80%'); check('RTT doubled → 50%', pv('u6dbl'), '50%');
  check('4096 B → 65%', pv('u6big'), '65%'); check('Astera split: mid-loss Gen5 reach 8.0 in', pv('r5mAlt'), '8.0'); check('128 B → 66%', pv('u6small'), '66%');
  says('ch5.p1', '10⁻¹²'); says('ch5.p5', '4096 字节'); says('ch5.p5', '128 字节'); says('ch5.p5', '500 纳秒'); says('ch5.p5', '2000 纳秒'); says('ch5.p4', '256 字节');
}

/* ── 06 configuration space and enumeration ── */
{
  // pci_regs.h offsets: contiguous, 64 bytes
  let at = 0; for (const [off, len, k] of CFG.type0) { check('type0 offset ' + k, off, at); at += len; }
  check('type0 header 64 bytes', at, CFG.hdrBytes); check('spaces 256 / 4096', CFG.spaceBytes + '/' + CFG.extBytes, '256/4096');
  check('ECAM bits 8+5+3+12 = 28', CFG.ECAM_BITS.map(b => b[1]).join() + '=' + CFG.ECAM_BITS.reduce((a, b) => a + b[1], 0), '8,5,3,12=28');
  check('ECAM bus<<20|dev<<15|fn<<12', CFG.ecam(4, 3, 2, 0x10), (4 << 20) | (3 << 15) | (2 << 12) | 0x10);
  check('d8 example 0x400010', CFG.ecam(4, 0, 0, 0x10), 0x400010);
  check('BAR probe 16 KiB', CFG.barProbe(16 * KiB).toString(16), 'ffffc000');
  for (let e = 4; e <= 31; e++) check('BAR size round trip 2^' + e, CFG.barSize(CFG.barProbe(2 ** e)), 2 ** e);
  // the d8 diagram's rows reproduce the same offsets
  const rowsSrc = app.match(/DIAG\.d8 = [\s\S]*?const rows = (\[[\s\S]*?\]\]\]);/)[1], rows = vm.runInNewContext(rowsSrc);
  check('d8 has 16 rows of 4 bytes', rows.map(r => r.reduce((a, c) => a + c[1], 0)).join(''), '4'.repeat(16));
  const fromDiag = new Map(); rows.forEach((r, i) => { let b = i * 4 + 4; for (const [k, len] of r) { b -= len; if (k !== 'rsv') fromDiag.set(k, b); } });
  for (const [off, , k] of CFG.type0) if (k !== 'rsv') check('d8 places ' + k + ' at its offset', fromDiag.get(k), off);
  const r = ENUM.run({ card: true, cardBar: 4 * KiB }), r0 = ENUM.run({});
  check('buses', r.buses, 8); check('steps', r.steps.length, 19);
  check('used 308 MiB', r.used / MiB, 308); check('without the card 307 MiB', r0.used / MiB, 307);
  near('waste 3.78 MiB', r.waste / MiB, 3.78, 0.005); check('card window 1 MiB', r.bridges.find(b => b.kind === 'dp' && b.dev === 2).need, MiB);
  for (const d of r.devs) d.bars.forEach((s, i) => check(`${d.id} BAR${i} naturally aligned`, d.addr[i] % s, 0));
  for (const b of r.bridges) if (b.need) { check(`window ${b.kind} ${b.bdf.bus}:${b.bdf.dev} 1 MiB granular`, (b.base % MiB) + ((b.limit + 1) % MiB), 0); }
  const spans = []; for (const d of r.devs) d.bars.forEach((s, i) => spans.push([d.addr[i], d.addr[i] + s])); spans.sort((x, y) => x[0] - y[0]);
  check('no two BARs overlap', spans.every((s, i) => !i || spans[i - 1][1] <= s[0]), true);
  for (const d of r.devs) d.bars.forEach((s, i) => { const rt = ENUM.route(r, d.addr[i] + 1); check(`address routes to ${d.id} BAR${i}`, rt.hit && rt.hit.ep.id + rt.hit.bar, d.id + i); });
  check('base address is tuned and moves nothing but the base', (() => { const b0 = ENUM.base; ENUM.base = 0xC0000000; const q = ENUM.run({ card: true, cardBar: 4 * KiB }); ENUM.base = b0; return q.used === r.used && q.waste === r.waste; })(), true);
  check('buses', pv('buses'), '8'); check('used', pv('used'), '308'); check('barSum', pv('barSum'), '304.22'); check('waste', pv('waste'), '3.78'); check('cardWin', pv('cardWin'), '1'); check('used0', pv('used0'), '307');
  says('ch6.p1', '64 字节'); says('ch6.p1', '4096 字节'); says('ch6.p1', '256 字节'); says('ch6.p3', '1 MiB'); says('d8.l1', '8 位'); says('d8.l2', '5 位'); says('d8.l3', '3 位'); says('d8.l4', '12 位');
  says('d8.l1', '256 条'); says('d8.l2', '32 个'); says('d8.l3', '8 个'); says('d8.l4', '4096 字节');
}

/* ── 07 MSI ── */
{
  const k = MSI.decode(MSI.billauer.addr, MSI.billauer.data);
  check('lspci record: FEE', k.fee, 0xFEE); check('lspci record: dest 3', k.dest, 3); check('vector 0x71', k.vector, 0x71); check('lowest priority', k.mode, 1);
  check('RH, DM', k.rh + ',' + k.dm, '1,1'); check('level asserted', k.level, 1);
  check('addr(dest 2)', MSI.addr(2, 0, 0).toString(16), 'fee02000'); check('data(0x41)', MSI.data(0x41, 0, 0, 0), 0x41);
  check('MSI-X entry 16 bytes', MSI.entry(0xFEE02000, 0x41, false).length, 16);
  check('MSI-X entry bytes', hx(MSI.entry(0xFEE02000, 0x41, false)), '00 20 E0 FE 00 00 00 00 41 00 00 00 00 00 00 00');
  const t = MSI.tlp(0xFEE02000, 0x41, 0x0400, 0);
  check('MSI write header', hx(t.hdr.bytes), '40 00 00 01 04 00 00 0F FE E0 20 00'); check('MSI payload', hx(t.data), '41 00 00 00');
  says('ch7.p4', '0xfee0300c'); says('ch7.p4', '0x4171'); says('ch7.p4', '0x03'); says('ch7.p4', 'DM=1'); says('ch7.p4', '逻辑目标'); check('Billauer record is logical mode (DM=1, RH=1)', k.dm + '/' + k.rh, '1/1'); says('ch7.p4', '0x71'); says('ch7.p3', '16 字节'); says('ch7.p3', 'FEE');
}

/* ── 08 channel loss ── */
{
  near('Dk 4.35 tuned so mid-loss dielectric = Hargin 0.48 dB/in at 10 GHz', LOSS.diel('mid', 10), LOSS.hargin.diel10, 0.005);
  near('FR-4 conductor = skin + RTF roughness at 10 GHz', LOSS.cond('fr4', 10), LOSS.hargin.skin10 + LOSS.hargin.rtf10, 1e-12);
  near('low-loss conductor = skin + HVLP2 at 10 GHz', LOSS.cond('low', 10), LOSS.hargin.skin10 + LOSS.hargin.hvlp10, 1e-12);
  check('budgets 36/32/36 at 16/16/32 GHz', [5, 6, 7].map(g => LOSS.GEN[g].budget + '@' + LOSS.GEN[g].f).join(), '36@16,32@16,36@32');
  check('fixed Gen5 = 8.5 + 1.5 + 9.5', LOSS.fixed(5), 19.5); check('max two retimers', LOSS.maxRetimers, 2);
  check('a16', pv('a16'), '2.76'); check('a16l', pv('a16l'), '1.05'); check('fix5', pv('fix5'), '19.5'); check('left5', pv('left5'), '16.5');
  check('r5f', pv('r5f'), '6.0'); check('r5m', pv('r5m'), '8.3'); check('r5l', pv('r5l'), '15.7'); check('r6m', pv('r6m'), '6.8'); check('r7m', pv('r7m'), '5.2'); check('r7l', pv('r7l'), '9.9');
  check('Gen7 package + connector halved', pv('r7mHalf'), '6.7'); check('doubled', pv('r7mDbl'), '2.1');
  check('reach is where each = budget', Math.abs(LOSS.link(5, 'mid', LOSS.reach(5, 'mid'), 0).margin) < 1e-9, true);
  check('one retimer doubles the reach', LOSS.link(5, 'mid', 2 * LOSS.reach(5, 'mid') - 0.01, 1).ok, true);
  says('ch8.p2', '36 dB'); says('ch8.p2', '32 dB'); says('ch8.p1', '16 GHz'); says('ch8.p1', '32 GHz'); says('ch8.p5', '4.35'); says('ch8.p5', '10 GHz'); says('ch8.p3', '最多两颗');
}

/* ── 09 NRZ and PAM4 ── */
{
  check('PAM4 eye ratio 1/3', EYE.ratio, 1 / 3); near('penalty 20·log10(3)', EYE.penaltyDb, 20 * Math.log10(3), 1e-12);
  near('erfc(1) (Numerical Recipes, < 1.2e-7)', M.erfc(1), 0.157299207050285, 2e-7);
  near('NRZ at 1e-12 needs 23.0 dB', EYE.need('nrz', 1e-12), 22.97, 0.01); near('PAM4 1e-12 32.5 dB', EYE.need('pam4', 1e-12), 32.46, 0.01); near('PAM4 1e-6 29.0', EYE.need('pam4', 1e-6), 29.0, 0.05);
  check('pen', pv('pen'), '9.54'); check('nrz12', pv('nrz12'), '23.0'); check('pam12', pv('pam12'), '32.5'); check('pam6', pv('pam6'), '29.0'); check('gap12', pv('gap12'), '9.5'); check('gapUse', pv('gapUse'), '6.0');
  check('loss16', pv('loss16'), '19.9'); check('loss32', pv('loss32'), '32.7'); check('lossGap', pv('lossGap'), '12.8');
  says('ch9.p1', '10 英寸'); says('ch9.p3', '10⁻⁶');
}

/* ── 10 FLIT, FEC, latency ── */
{
  check('FLIT 236 + 6 + 8 + 6 = 256', FLIT.tlp + FLIT.dlp + FLIT.crc + FLIT.fec, FLIT.bytes); check('FLIT 256', FLIT.bytes, 256);
  check('three interleaves cover the FLIT', FEC.cw.reduce((a, b) => a + b, 0), 256); check('FEC 2 bytes per interleave', FLIT.fec / FLIT.interleave, 2);
  for (const k of ['tlp', 'dlp', 'crc', 'fec']) says('ch10.p2', FLIT[k] + ' 字节'); says('ch10.law', '236 字节');
  // Das Sharma 2022 slide 13: every row of the latency table
  for (const [dw, x1a, x1b, x16a, x16b] of FEC.dds) {
    near(`lat130 x1 ${dw} DW`, FEC.lat130(dw, 1), x1a, 5e-9); near(`latFlit x1 ${dw} DW`, FEC.latFlit(dw, 1), x1b, 5e-9);
    near(`lat130 x16 ${dw} DW`, FEC.lat130(dw, 16), x16a, 5e-8); near(`latFlit x16 ${dw} DW`, FEC.latFlit(dw, 16), x16b, 5e-9);
  }
  near('crossover ≈ 38.8 DW', FEC.crossover(), 38.8, 0.05); check('cross', pv('cross'), '39'); check('crossB', pv('crossB'), '155');
  check('sc1', pv('sc1'), '2.68'); check('sc1024', pv('sc1024'), '1.91'); check('lat0x1', pv('lat0x1'), '11.9'); check('lat1024x1', pv('lat1024x1'), '516');
  check('pNo', pv('pNo'), '0.2%'); check('uNo', pv('uNo'), '49%'); check('uNoSr', pv('uNoSr'), '99.8%'); check('pFec', pv('pFec'), '6.9 × 10⁻⁷'); check('uFec', pv('uFec'), '99.97%'); check('flitRatio', pv('flitRatio'), '501');
  check('no FEC, RTT halved', pv('uNoHalf'), '66%'); check('no FEC, RTT doubled', pv('uNoDbl'), '33%');
  check('with FEC the round trip hardly matters', FEC.goodput({ ber: 1e-6, fec: true, rtt: 2000 }).U > 0.999, true);
  near('FEC: one bad byte per interleave is corrected (P[≥2 bad] closed form)', FEC.pCw(86, 1e-3), 1 - Math.pow(1 - 1e-3, 86) - 86 * 1e-3 * Math.pow(1 - 1e-3, 85), 1e-15);
  check('decode < 2 ns', pv('decNs'), '2'); check('FLIT on a Gen6 ×16 link: 2 ns', FEC.flitNs(16), 2);
  says('ch10.p5', '1024 DW');
}

/* ── 11 frontier (dated, as of November 2026) ── */
{
  check('frontier dates', [FRONTIER.gen7, FRONTIER.optical, FRONTIER.gen8draft03, FRONTIER.gen8draft05, FRONTIER.gen6workshop, FRONTIER.cxl4, FRONTIER.ssd6].join(), '2025-06,2025-06,2025-09,2026-05,2026-07-31,2025-11,2026-02');
  check('Gen7 ×16 bidirectional 512 GB/s = 2 directions × 16 lanes × 128 GT/s / 8 (raw, as PCI-SIG quotes it)', 2 * 16 * GENS[7].gts / 8, FRONTIER.gen7x16bidir);
  check('Gen8 ×16 bidirectional quoted as 1 TB/s (raw 2 × 16 × 256 / 8 = 1024 GB/s)', FRONTIER.gen8x16bidir === 1000 && 2 * 16 * GENS[8].gts / 8 === 1024, true);
  check('f7bi', pv('f7bi'), '512'); check('f8bi', pv('f8bi'), '1,000'); check('f8gts', pv('f8gts'), '256');
  says('ch11.e1', '2025 年 6 月'); says('ch11.e2', '2025 年 9 月'); says('ch11.e2', '2026 年 5 月'); says('ch11.e3', '2025 年 11 月'); says('ch11.e3', '128 GT/s');
  says('ch11.d1', '2026-07-31'); says('ch11.d2', '2026 年 2 月'); says('ch11.c1', '2028 年'); says('ch11.title', '2026 年 11 月');
}

/* ── every {placeholder} in the static copy is a prose() number ── */
{
  for (const [k, v] of Object.entries(Z)) {
    if (/\.say\.|^u\.|fmt$|\.hex\.|\.log\.|\.n\.|persec|years|busfmt|\.cv\d?\.|^d\d+\./.test(k)) continue;
    for (const m of v.matchAll(/\{(\w+)\}/g)) { n++; if (!(m[1] in P)) { fails++; console.error(`FAIL {${m[1]}} in ${k} is not a prose() value`); } }
  }
  for (const k of Object.keys(P)) { n++; if (!Object.values(Z).some(v => v.includes('{' + k + '}'))) { fails++; console.error(`FAIL prose value ${k} is never quoted`); } }
}

/* ── sentence branches at the extremes of each control ── */
{
  const has = k => { n++; if (Z[k] == null) { fails++; console.error('FAIL missing say key ' + k); } };
  const seen = new Set(), add = s => { has(s.key); seen.add(s.key); };
  for (const cg of [1, 2, 3, 4, 5, 6, 7]) for (const cw of [1, 4, 8, 16]) for (const sg of [1, 3, 5, 7]) for (const sw of [1, 4, 8, 16]) add(M.say.lane({ g: cg, w: cw }, { g: sg, w: sw }));
  for (const op of ['wr', 'rd']) for (const mps of [128, 256, 512]) for (const mrrs of [128, 512, 4096]) for (const cpl of [64, mps]) for (let e = 6; e <= 16; e++) add(M.say.tlp(op, 2 ** e, mps, mrrs, cpl));
  for (const payload of [128, 256, 512]) for (const data of [64, 1024, 2047, 8192]) for (const rtt of [100, 1000, 2000]) for (const hdr of [127, 4096]) add(M.say.fc({ payload, hdr, data, rtt }));
  for (let e = -15; e <= -4; e += 0.5) for (const payload of [128, 4096]) add(M.say.arq({ payload, ber: 10 ** e, rtt: 1000 }));
  for (const card of [true, false]) for (const s of [0, 5, null]) add(M.say.enumr({ card, cardBar: 4096 }, s));
  for (const g of [5, 6, 7]) for (const m of ['fr4', 'mid', 'low']) for (const len of [1, 10, 30]) for (const k of [0, 1, 2]) add(M.say.loss(g, m, len, k));
  for (let d = 15; d <= 40; d += 0.5) add(M.say.eye(d));
  for (let e = -9; e <= -4; e += 0.25) for (const fec of [true, false]) for (const mode of ['gbn', 'sr']) add(M.say.fec({ ber: 10 ** e, fec, mode, rtt: 1000 }));
  for (let e = 0; e <= 10; e++) for (const w of [1, 16]) add(M.say.flit(2 ** e, w));
  const all = Object.keys(Z).filter(k => /\.say\./.test(k));
  for (const k of all) check('branch reached ' + k, seen.has(k) || ['ch7.say.own', 'ch7.say.real'].includes(k), true);
  for (const k of seen) check('branch has copy ' + k, all.includes(k), true);
  // the app chooses ch5's sentence from the scheme actually selected, with the same thresholds as say.arq
  check('ch5 thresholds shared with app.js', /u > 0\.9999 \? 'ch5\.say\.clean' : u > 0\.9 \? 'ch5\.say\.some' : 'ch5\.say\.bad'/.test(app), true);
}

/* ── keys, language hygiene, registry, siblings ── */
{
  const keys = new Set([...html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)].map(m => m[1]));
  for (const m of app.matchAll(/(?:^|[^\w.])t\('([\w.]+)'(?!\s*\+)/g)) if (/^[\w]+\.[\w.]*\w$/.test(m[1])) keys.add(m[1]);
  for (const d of ['gpu', 'ssd', 'nic', 'usb', 'card']) keys.add('ch6.dev.' + d);
  for (const b of ['rp', 'sw', 'dp']) keys.add('ch6.br.' + b);
  for (const l of ['ep', 'br', 'close']) keys.add('ch6.log.' + l);
  for (let i = 0; i < 8; i++) keys.add('ch7.mode.' + i);
  for (const k of Object.keys(Z)) if (/\.say\./.test(k)) keys.add(k);   // chosen by M.say.*, each branch reached above
  keys.add('d6.hdr'); keys.add('d6.data'); keys.add('ch9.cv.nrz'); keys.add('ch9.cv.pam'); keys.add('ch3.hex.mwr'); keys.add('ch3.hex.mrd');
  for (let i = 1; i <= 12; i++) { keys.add(`d${i}.aria`); keys.add(`d${i}.cap`); }
  const D = { d1: ['cpu', 'mem', 'rc', 'gpu', 'sw', 'usb', 'ssd', 'nic', 'slot', 'note'], d3: ['r1', 'r2', 'r3', 'data', 'ohfmt', 'oh1', 'oh2', 'oh3'],
    d4: ['stp', 'seq', 'hdr', 'data', 'ecrc', 'lcrc', 'end', 'tl', 'dll', 'phy', 'note'], d7: ['tx', 'rx', 'm7', 'm8', 'm9', 'nak', 'r8', 'r9', 'ack', 'n.ok', 'n.bad', 'n.drop', 'n.nakn', 'n.ok8', 'n.ok9', 'n.ackn'],
    d9: ['cpu', 'apic', 'rc', 'iommu', 'mem', 'dev', 's1', 's2', 's3', 's4', 's5'], d10: ['cpu', 'ret', 'conn', 'dev', 'board', 'cardt', 's.pkg', 's.board', 's.conn', 's.card'], d12: ['tlp', 'dlp', 'crc', 'fec', 'il'],
    d5: ['f.fmt', 'f.type', 'f.tc', 'f.attr', 'f.len', 'f.rid', 'f.tag', 'f.lbe', 'f.fbe', 'f.addrhi', 'f.addrlo', 'f.cid', 'f.st', 'f.bc', 'f.la', 't1', 't2', 'bits.hi', 'bits.byte'], d8: ['e.bus', 'e.dev', 'e.fn', 'e.reg', 'l1', 'l2', 'l3', 'l4', 'ex'] };
  for (const [d, ks] of Object.entries(D)) for (const k of ks) keys.add(d + '.' + k);
  for (const [, , k] of CFG.type0) keys.add('d8.f.' + k);
  for (const k of keys) { n++; if (Z[k] == null) { fails++; console.error('FAIL missing zh key ' + k); } }
  for (const k of Object.keys(Z)) { n++; if (!keys.has(k)) { fails++; console.error('FAIL unused zh key ' + k); } }
  // the live sentences' placeholders are supplied by app.js
  for (const [k, v] of Object.entries(Z)) if (/\.say\.|\.log\.|\.hex\.|^ch\d+\.(n|persec|years|busfmt|linkfmt|dwfmt)/.test(k)) for (const m of v.matchAll(/\{(\w+)\}/g)) {
    n++; if (!new RegExp('\\b' + m[1] + '\\s*:|[{,]\\s*' + m[1] + '\\s*[,}]').test(app)) { fails++; console.error(`FAIL placeholder {${m[1]}} in ${k} is never supplied by app.js`); }
  }
  for (const file of ['index.html', 'app.js', 'models.js']) {
    let src = fs.readFileSync(path.join(DIR, file), 'utf8');
    if (file === 'index.html') {
      const tt = src.match(/<title>([^<]*)<\/title>/)[1], md = src.match(/<meta name="description" content="([^"]*)">/)[1];
      check('static title = doc.title', tt, Z['doc.title']); check('static meta = doc.desc', md, Z['doc.desc']);
      src = src.replace(/<title>[^<]*<\/title>/, '').replace(/<meta name="description" content="[^"]*">/, '');
      src = src.replace(/<details class="page-provenance"[\s\S]*?<\/details>/, '');
    }
    src = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '').replace(/<!--[\s\S]*?-->/g, '');
    if (file === 'app.js') src = src.replace(/const CJK = \/[^\n]*\/;/, '').replace(/const PUNCT = \/[^\n]*\/;/, '').replace(/'[①②③④⑤]'/g, "''");
    n++;
    const others = (src.match(/[一-鿿]+/g) || []).filter(x => !(file === 'index.html' && x === '中'));
    if (others.length) { fails++; console.error(`FAIL Chinese text in ${file}: ${others.slice(0, 3).join(' ')}`); }
  }
  check('cache keys ?v=20261115', (html.match(/\.js\?v=20261115/g) || []).length, 4);
  const R = JSON.parse(fs.readFileSync(path.join(DIR, 'REGISTRY.json'), 'utf8'));
  check('registry slug/path', R.slug + ' ' + R.path, 'how-pcie-works computing/systems/how-pcie-works/');
  check('registry category', [R.category, R.subtopic, R.stage].join('/'), 'computing/systems/university');
  check('registry title', R.title.zh, Z['doc.title'].split(' · ')[0]); check('registry desc', R.desc.zh, Z['doc.desc']);
  check('hero title = registry title', Z['hero.title'], R.title.zh);
  for (const c of R.concepts) check('anchor ' + c.anchor, html.includes('id="' + c.anchor.slice(1) + '"'), true);
  for (const c of R.concepts) { n++; if (!c.aliases.zh.length || !c.aliases.en.length || !c.title.en || !c.desc.en) { fails++; console.error('FAIL concept incomplete ' + c.id); } }
  check('one concept per chapter', R.concepts.map(c => c.anchor).join(), Array.from({ length: 12 }, (_, i) => '#ch' + (i + 1)).join());
  // one word, one owner: every alias already registered anywhere on the site, plus the words reserved for B2 and B4
  const norm = s => s.toLowerCase().replace(/\s+/g, '');
  const owned = new Map();
  for (const a of ['什么是 CXL', 'CXL 是什么', 'what is CXL', '主板上的 PCIe 是从哪来的', 'PCI 总线', 'PCI bus']) owned.set(norm(a), 'reserved');
  const walk = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { if (e.name.startsWith('.') || e.name === 'node_modules') continue; const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (e.name === 'REGISTRY.json' && path.dirname(p) !== DIR) {
    try { for (const c of JSON.parse(fs.readFileSync(p, 'utf8')).concepts || []) for (const a of [...(c.aliases.zh || []), ...(c.aliases.en || [])]) owned.set(norm(a), path.relative(path.join(DIR, '../../..'), path.dirname(p))); } catch (err) { /* a sibling mid-edit */ } } } };
  walk(path.join(DIR, '../../..'));
  for (const c of R.concepts) for (const a of [...c.aliases.zh, ...c.aliases.en]) { n++; if (owned.has(norm(a))) { fails++; console.error(`FAIL alias owned by ${owned.get(norm(a))}: ${a}`); } }
  // sibling links point at chapters that exist, and quote the sibling's title
  const all = Object.values(Z).join('');
  const SIB = { 'how-sata-works': '../how-sata-works/', 'why-nvme-is-fast': '../why-nvme-is-fast/', 'how-usb-drives-talk': '../how-usb-drives-talk/', 'what-a-drive-is-made-of': '../what-a-drive-is-made-of/',
    'storage-over-a-network': '../storage-over-a-network/', 'how-sas-works': '../how-sas-works/', 'frequency-response': '../../../signal/systems/frequency-response/', 'inside-a-phone': '../../../tech/devices/inside-a-phone/',
    // bus series B2 and B6, live since 2026-11-15
    'how-a-computer-is-wired': '../how-a-computer-is-wired/', 'how-thunderbolt-works': '../how-thunderbolt-works/' };
  for (const [sib, rel] of Object.entries(SIB)) {
    const sdir = path.resolve(DIR, rel), sh = fs.readFileSync(path.join(sdir, 'index.html'), 'utf8');
    let hits = 0;
    for (const m of all.matchAll(new RegExp(rel.replace(/\./g, '\\.') + '(#[\\w-]+)?', 'g'))) { hits++; if (m[1]) check(`${sib} anchor ${m[1]}`, sh.includes(`id="${m[1].slice(1)}"`), true); }
    check('links ' + sib, hits > 0, true);
  }
  for (const [k, a] of [['ch2.p2', 'how-sata-works/#ch3'], ['ch1.p1', 'how-sata-works/#ch2'], ['ch2.p6', 'why-nvme-is-fast/#ch2'], ['ch7.p1', 'why-nvme-is-fast/#ch4'], ['ch7.p5', 'why-nvme-is-fast/#ch7'],
    ['ch11.d2', 'why-nvme-is-fast/#ch8'], ['ch12.links', 'how-usb-drives-talk/#ch8'], ['ch12.links', 'what-a-drive-is-made-of/#ch7'], ['ch4.p5', 'storage-over-a-network/#ch4'],
    ['ch5.p5', 'storage-over-a-network/#ch6'], ['ch10.p4', 'how-sas-works/#ch9'], ['ch10.p1', 'inside-a-phone/#ecc'], ['ch8.p1', 'frequency-response/'],
    ['ch1.limit', 'how-a-computer-is-wired/#ch5'], ['ch12.links', 'how-a-computer-is-wired/'], ['ch12.links', 'how-thunderbolt-works/']]) says(k, a);
  for (const sib of ['why-nvme-is-fast', 'how-sata-works', 'how-usb-drives-talk', 'what-a-drive-is-made-of', 'storage-over-a-network', 'how-sas-works', 'how-a-computer-is-wired', 'how-thunderbolt-works']) {
    const t = JSON.parse(fs.readFileSync(path.join(DIR, '..', sib, 'REGISTRY.json'), 'utf8')).title.zh; n++;
    if (!all.includes('《' + t + '》')) { fails++; console.error('FAIL sibling title not quoted: ' + t); }
  }
  // why-nvme-is-fast owns the PCIe 6.0 SSD figures; this page does not restate them
  check('no restated Gen6 SSD speed', /28[,.]?500|28 ?GB\/s/.test(all), false);

  const ectx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.en.js'), 'utf8'), ectx);
  const EN = ectx.window.ESSAY_COPY.en, stub = ectx.window.ESSAY_COPY.enStub === true, ph = s => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');
  check('en keys = zh keys', Object.keys(EN).sort().join('|'), Object.keys(Z).sort().join('|'));
  const hrefs = o => (Object.values(o).join('').match(/href=["']\.\.\/[^"']+/g) || []).sort().join(' ');
  check('en links = zh links', hrefs(EN), hrefs(Z));
  for (const k of Object.keys(Z)) check('en placeholders ' + k, ph(EN[k]), ph(Z[k]));
  if (stub) { check('en stub mirrors zh exactly', JSON.stringify(EN), JSON.stringify(Z)); console.log('NOTE: copy.en.js is a stub (enStub); English registry match skipped until it is translated'); }
  else { check('registry title en', R.title.en, EN['doc.title'].split(' · ')[0]); check('registry desc en', R.desc.en, EN['doc.desc']); }
}

if (fails) { console.error(`\n${fails} of ${n} checks failed`); process.exit(1); }
console.log(`PASS: ${n} checks (generation and latency tables, TLP layouts and bytes, credits, replay, config space, MSI, loss, eyes, FLIT, and every number in the prose match the models)`);
