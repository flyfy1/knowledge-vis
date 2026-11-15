'use strict';
// Pins the page's models: the frame bytes and IEEE 802.3 CRC-32 (check value, residue); the line-rate arithmetic; descriptor
// prefetch (Little's law); PCIe bytes per received packet against Neugebauer et al.'s equation 1 and their header sizes;
// the Toeplitz hash against all of Microsoft's published IPv4 and IPv6 test vectors (both columns); flows onto queues and
// the birthday-problem probability; the offload cost model and its fit to Cai et al.; TSO segment numbering; the DDIO
// LRU simulation; byte queue limits; the XDP / DPDK per-core figures; ECMP versus spraying; the sourced and frontier
// figures typed again from their sources; every number the prose quotes; every live sentence branch; copy keys, language
// hygiene, the registry, links to live siblings and the sibling essays' aliases.
// Run: node computing/systems/how-a-nic-moves-packets/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const ROOT = path.join(DIR, '..', '..', '..');
const SLUG = 'how-a-nic-moves-packets';
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
  check('802.3: preamble 7, SFD 1, MAC 6, tag 4, type 2, payload 46–1500, FCS 4, min 64, gap 12', [SRC.eth.pre, SRC.eth.sfd, SRC.eth.mac, SRC.eth.vlan, SRC.eth.type, SRC.eth.minPay, SRC.eth.maxPay, SRC.eth.fcs, SRC.eth.minFrame, SRC.eth.ifg].join(), '7,1,6,4,2,46,1500,4,64,12');
  check('CRC-32 polynomial 0x04C11DB7', SRC.eth.poly.toString(16), '4c11db7');
  check('Microsoft key, 40 bytes', SRC.ms.key.map(M.hb).join(''), '6d5a56da255b0ec24167253d43a38fb0d0ca2bcbae7b30b477cb2da38030f20c6a42b73bbeac01fa');
  check('RSS table 2–8× processors (Microsoft), ≥ 4× queues (Linux), rps_sock_flow_entries 65536', [SRC.ms.tableLo, SRC.ms.tableHi, SRC.scaling.tableX, SRC.scaling.rfs].join(), '2,8,4,65536');
  check('Neugebauer: MWr / MRd 24 B, CplD 20 B, Gen3 x8 62.96 / 57.88 Gb/s, 520 / 547 / 947 ns, Niantic 40 / 8, DDIO 10 %, +70 ns, remote +100 ns',
    Object.values(SRC.neug).join(), '24,24,20,62.96,57.88,520,547,947,40,8,10,70,100');
  check('B1: DLLP 2 %, FLIT 236 of 256', [SRC.b1.dll, SRC.b1.flitTlp, SRC.b1.flit].join(), '0.02,236,256');
  check('Farshin: 18 × 1.375 MiB, 11 ways, 2 for DDIO (0x600, max 0x7FF), 18 × 256 ≈ 6.5 MiB = 26.6 %, ~30 % / ~30 %',
    [SRC.farshin.slices, SRC.farshin.sliceMiB, SRC.farshin.ways, SRC.farshin.ddioWays, SRC.farshin.maskDef.toString(16), SRC.farshin.maskMax.toString(16), SRC.farshin.cores, SRC.farshin.desc, SRC.farshin.footMiB, SRC.farshin.footPct, SRC.farshin.gain, SRC.farshin.tail].join(),
    '18,1.375,11,2,600,7ff,18,256,6.5,26.6,30,30');
  check('Farshin mask 0x600 is two bits', (SRC.farshin.maskDef.toString(2).match(/1/g) || []).length, 2);
  check('Farshin footprint: 18 × 256 × 1.5 KB ≈ 6.5 MiB', f(18 * 256 * 1536 / 1048576, 2), '6.75');
  check('Cai: 42 / 55 Gb/s, copy 49 %, DDIO miss 49 %, 3.4 GHz, GRO 64 KB', Object.values(SRC.cai).join(), '42,55,0.49,49,3.4,65536');
  check('XDP paper: 3.6 GHz; XDP 24, DPDK 43.5, raw 4.8, conntrack 1.8 Mpps; PCI 115; pass 4.5; 82 / 2 µs', Object.values(SRC.xdp).join(), '3.6,24,43.5,4.8,1.8,115,4.5,82,2');
  check('DRAM 70–131 ns (as on how-cpu-caches-work)', [SRC.dram.lo, SRC.dram.hi].join(), '70,131');
  check('ConnectX-7: 400 GbE, Gen5 x16, 330–370 M msg/s', Object.values(SRC.cx7).join(), '400,5,16,330,370');
  check('LWN 2011: 256 packets, 1 Gb/s, 1500 B', Object.values(SRC.lwn).join(), '256,1,1500');
  check('RoCE v2 UDP port 4791', SRC.roce.port, 4791);
  const F = FRONTIER;
  check('frontier as of 2026-11; UEC 1.0 2025-06-11; UEC 1.1 2026-10-12', [F.asOf, F.uec10, F.uec11].join(), '2026-11,2025-06-11,2026-10-12');
  check('802.3dj ballot: closed 2026-03-26, 159 voters, 131 returned, 99 / 29 / 3, 487 comments', Object.values(F.dj).join(), '2026-03-26,159,131,99,29,3,487');
  check('802.3dj: returned = approve + disapprove + abstain', F.dj.approve + F.dj.disapprove + F.dj.abstain, F.dj.returned);
  check('802.3dj: 99 of 131 is 76 %; the email\'s 77 % excludes abstentions (99 / 128)', [f(99 / 131 * 100, 0), f(99 / 128 * 100, 0)].join(), '76,77');
  check('ConnectX-8 800, ConnectX-9 1600 (firmware 2026-02); Thor Ultra 800G 2025-10-14; CPO blog 2025-08-18, 800G, 3.5×',
    [F.cx8, F.cx9, F.cx9fw, F.thor.gbps, F.thor.date, F.cpo.blog, F.cpo.ports, F.cpo.eff].join(), '800,1600,2026-02,800,2025-10-14,2025-08-18,800,3.5');
  for (const [k, s] of [['ch13.e2', '2025 年 6 月 11 日'], ['ch13.e3', '2026 年 3 月 26 日'], ['ch13.e3', '收回 {djRet} 张票，{djYes} 张赞成、{djNo} 张反对、{djAbs} 张弃权，不计弃权的赞成率 {djPct}'], ['ch13.e3', '{djCom} 条意见'],
    ['ch13.d1', '800 Gb/s'], ['ch13.d1', 'PCIe 6.0'], ['ch13.d1', '1.6 Tb/s'], ['ch13.d1', '2026 年 2 月'], ['ch13.d2', '2025 年 10 月 14 日'], ['ch13.d3', '10 月 12 日'],
    ['ch13.d3', '2026 年 10 月 14 日'], ['ch13.c1', '2025 年 8 月 18 日'], ['ch13.c1', '3.5 倍'], ['ch13.c1', '800 Gb/s'], ['ch12.p3', '2025 年 10 月'],
    ['ch11.p3', '{cxLo} 到 {cxHi}'], ['ch3.p3', '{rdMin}'], ['ch8.p1', '{nFlush}']]) says(k, s);
  says('ch13.title', '2026 年 11 月');
  // the model count in the description is the number of model sections on the page
  const nModels = Object.keys(Z).filter(k => /^ch\d+\.model\d*\.title$/.test(k)).length;
  check('ten model sections', nModels, 10); says('doc.desc', '十个可以动手的模型');
}

/* ── 02 the frame and the line-rate budget ── */
{
  const enc = s => [...Buffer.from(s, 'ascii')];
  check('CRC-32 check value: "123456789" → 0xCBF43926', M.hex(M.crc32(enc('123456789'))), '0xcbf43926');
  check('CRC-32 of nothing is 0', M.crc32([]), 0);
  for (const sz of [64, 1518, 9018]) for (const vl of [false, true]) {
    const fr = M.frame(sz, vl, false);
    check(`frame ${sz}${vl ? ' tagged' : ''}: length`, fr.size, sz);
    check(`frame ${sz}${vl ? ' tagged' : ''}: residue over data + FCS is the CRC-32 residue 0x2144DF1C`, M.hex(fr.residue), '0x2144df1c');
    check(`frame ${sz}${vl ? ' tagged' : ''}: FCS bytes least significant first`, fr.bytes.slice(-4).join(), [0, 8, 16, 24].map(s => (fr.fcs >>> s) & 255).join());
  }
  check('tagged frame: 0x8100 then TCI 0x0064 then 0x0800', M.frame(64, true, false).bytes.slice(12, 18).map(M.hb).join(''), '810000640800');
  check('a 64-byte untagged frame carries 46 bytes of payload', M.frame(64, false, false).pay, 46);
  check('a 64-byte tagged frame carries 42', M.frame(64, true, false).pay, 42);
  const bad = M.frame(64, false, true);
  check('one flipped bit: FCS mismatch', bad.ok, false); check('one flipped bit: residue no longer the constant', bad.residue === 0x2144DF1C, false);
  check('64 B → 84 B on the wire, 1518 → 1538', [M.budget(1, 64).wire, M.budget(1, 1518).wire].join(), '84,1538');
  check('10G minimum frames: 14.88 Mpps (the classic figure)', f(M.budget(10, 64).pps / 1e6, 2), '14.88');
  check('100G minimum frames: 148.81 Mpps', f(M.budget(100, 64).pps / 1e6, 2), '148.81');
  check('400G 64 B: 1.68 ns per packet', f(M.budget(400, 64).ns, 2), '1.68');
  check('400G 1518 B: 30.76 ns', f(M.budget(400, 1518).ns, 2), '30.76');
  check('payload share of 1518-byte frames: 1500 / 1538', f(M.budget(400, 1518).eff, 4), f(1500 / 1538, 4));
  check('400G 1518 B is shorter than one DRAM access', M.budget(400, 1518).ns < SRC.dram.lo, true);
}

/* ── 03 descriptor prefetch ── */
{
  const r = M.prefetch(400, 64, 8, 32, 547);
  check('Little: 595.24 Mpps × 547 ns = 325.6 descriptors in flight', f(r.need, 1), '325.6');
  check('in 40.7 reads of 8', f(r.reads, 1), '40.7');
  check('32 reads × 8 / 547 ns = 468 Mpps', f(r.max / 1e6, 0), '468');
  check('so 32 outstanding reads fall short at 400G minimum frames', r.ok, false);
  check('64 outstanding reads are enough', M.prefetch(400, 64, 8, 64, 547).ok, true);
  check('one descriptor per read: 10 % of line rate', f(M.prefetch(400, 64, 1, 32, 547).frac, 2), '0.10');
  check('1518 B: 17.8 in flight', f(M.prefetch(400, 1518, 8, 32, 547).need, 1), '17.8');
}

/* ── 04 PCIe bytes per received packet ── */
{
  check('Gen3–5: the TLP-layer share after 128b/130b is Neugebauer\'s 57.88 / 62.96', f(M.linkGbps(3, 8) / (8 * 8 * 128 / 130), 4), f(57.88 / 62.96, 4));
  check('Gen5 x16: 463 Gb/s (Neugebauer DLL), 494 (B1 2 %)', [f(M.linkGbps(5, 16), 0), f(M.linkGbps(5, 16, 0.02), 0)].join(), '463,494');
  check('Gen6 x16 FLIT: 16 × 64 × 236 / 256 = 944', f(M.linkGbps(6, 16), 0), '944');
  // Neugebauer eq. 1: B = ceil(sz / MPS) × 24 + sz for a write
  const r = M.pcieRx({ gen: 5, lanes: 16, size: 64, mps: 256, design: 'simple', gbps: 400 });
  check('simple NIC, 64 B frame (60 after FCS strip): data 84, write-back 40, MRd 24, irq 28, head CplD 24', [r.up.data, r.up.wb, r.up.fetch, r.up.irq, r.up.head].join(), '84,40,24,28,24');
  check('simple NIC down: tail 28, descriptor CplD 36, head MRd 24', [r.down.tail, r.down.fetch, r.down.head].join(), '28,36,24');
  check('simple NIC: 200 B up per 64 B packet', r.upB, 200);
  const b = M.pcieRx({ gen: 5, lanes: 16, size: 64, mps: 256, design: 'batch', gbps: 400 });
  check('batched: write-back (24 + 128) / 8 = 19, fetch 24 / 8 = 3, data 84 → 106', [b.up.wb, b.up.fetch, b.upB].join(), '19,3,106');
  check('batched down: (20 + 128) / 8 + 28 / 8 = 22', b.downB, 22);
  check('1518 B frame at MPS 256: 6 TLPs → 1514 + 144', M.pcieRx({ gen: 5, lanes: 16, size: 1518, mps: 256, design: 'batch', gbps: 400 }).up.data, 1514 + 6 * 24);
  check('400G 64 B fails on Gen5 x16 with either DLL estimate', [b.ok, M.pcieRx({ gen: 5, lanes: 16, size: 64, mps: 256, design: 'batch', gbps: 400, dll: 0.02 }).ok].join(), 'false,false');
  check('400G 1518 B fits on Gen5 x16', M.pcieRx({ gen: 5, lanes: 16, size: 1518, mps: 256, design: 'batch', gbps: 400 }).ok, true);
}

/* ── 05 Toeplitz, all of Microsoft's vectors, and flows onto queues ── */
{
  for (const [dst, dp, src, sp, hIp, hTcp] of SRC.ms.v4) {
    check(`MS IPv4 ${src}:${sp} → ${dst}:${dp} addresses only`, M.hex(M.toeplitz(M.rssInput(src, dst, sp, dp, false))), M.hex(hIp));
    check(`MS IPv4 ${src}:${sp} → ${dst}:${dp} with TCP ports`, M.hex(M.toeplitz(M.rssInput(src, dst, sp, dp, true))), M.hex(hTcp));
  }
  for (const [dst, dp, src, sp, hIp, hTcp] of SRC.ms.v6) {
    check(`MS IPv6 ${src} → ${dst} addresses only`, M.hex(M.toeplitz(M.rssInput(src, dst, sp, dp, false))), M.hex(hIp));
    check(`MS IPv6 ${src} → ${dst} with TCP ports`, M.hex(M.toeplitz(M.rssInput(src, dst, sp, dp, true))), M.hex(hTcp));
  }
  // the vectors as printed on Microsoft Learn (typed again)
  check('first IPv4 vector 0x323e8fc2 / 0x51ccc178', SRC.ms.v4[0].slice(4).map(x => M.hex(x)).join(), '0x323e8fc2,0x51ccc178');
  check('last IPv6 vector 0x4b61e985 / 0x02d1feef', SRC.ms.v6[2].slice(4).map(x => M.hex(x)).join(), '0x4b61e985,0x02d1feef');
  check('IPv4 + TCP input is 12 bytes, IPv6 + TCP 36', [M.rssInput('1.2.3.4', '5.6.7.8', 1, 2, true).length, M.rssInput('::1', '::2', 1, 2, true).length].join(), '12,36');
  check('mixed families rejected', M.rssInput('1.2.3.4', '::1', 1, 2, true), null);
  check('bad address rejected', M.rss('1.2.3', '5.6.7.8', 1, 2, true, 8), null);
  const r = M.rss('66.9.149.187', '161.142.100.80', 2794, 1766, true, 8);
  check('default flow: index 120 → queue 0; reverse → queue 2', [r.idx, r.q, r.rq].join(), '120,0,2');
  check('birthday: 4 elephants in 8 queues, 7/8 × 6/8 × 5/8', f(M.noCollide(4, 8), 4), f(7 / 8 * 6 / 8 * 5 / 8, 4));
  const L = M.rssLoad(8, 1000, 4, 7);
  check('rssLoad conserves traffic', L.load.reduce((a, x) => a + x, 0), 1000 + 4 * M.RSS.weight);
  check('rssLoad: four elephants placed', L.eq.reduce((a, x) => a + x, 0), 4);
  check('the simulated collision rate is near the birthday probability', Math.abs(M.rssAvg(8, 1000, 4, 200).collide - (1 - M.noCollide(4, 8))) < 0.08, true);
  within('10 000 mice on 8 queues: max / mean', M.rssAvg(8, 10000, 0, 20).ratio, 1, 1.08);
}

/* ── 07 offloads and TSO ── */
{
  check('the fit reproduces Cai: GRO + 9000 = 42 Gb/s', f(M.offload(9000, 'gro', 1).gbps, 2), '42.00');
  check('the fit reproduces Cai: copy share 49 %', f(M.offload(9000, 'gro', 1).copy, 2), '0.49');
  check('the fit reproduces Cai: LRO + 9000 = 55 Gb/s', f(M.offload(9000, 'lro', 1).gbps, 2), '55.00');
  check('constants positive', M.OFF.cB > 0 && M.OFF.cF > 0 && M.OFF.cS > 0, true);
  check('more interleaved flows never help GRO', M.OFF.flows.every((fl, i) => i === 0 || M.offload(9000, 'gro', fl).gbps <= M.offload(9000, 'gro', M.OFF.flows[i - 1]).gbps), true);
  check('order none < gro < lro at 1500', [M.offload(1500, 'none', 1), M.offload(1500, 'gro', 1), M.offload(1500, 'lro', 1)].map(x => x.gbps).every((g, i, a) => i === 0 || g > a[i - 1]), true);
  const t = M.tso(65536, 1448);
  check('64 KB / 1448 = 46 segments, last 376 bytes', [t.n, t.segs[45].len].join(), '46,376');
  check('sequence numbers advance by MSS', t.segs[1].seq - t.segs[0].seq, 1448);
  check('IPv4 ID advances by one', t.segs[45].id - t.segs[0].id, 45);
  check('only the last segment carries PSH', t.segs.filter(s => s.psh).map(s => s.i).join(), '45');
  check('header 14 + 20 + 32 = 66', M.TSO.hdr, 66);
}

/* ── 08 DDIO ── */
{
  check('LLC 24.75 MiB; 2 of 11 ways = 4.5 MiB', [M.DDIO.llc / 1048576, f(M.DDIO.llc * 2 / 11 / 1048576, 2)].join(), '24.75,4.50');
  const fits = M.ddioSim(256, 2, 1500, 0);
  check('256 × 8 × 1536 B = 3 MiB fits in 4.5 MiB', [fits.foot / 1048576, fits.fits].join(), '3,true');
  check('fitting buffers: every write in place, every read a hit, no DRAM traffic', [fits.wHit, fits.rHit, fits.dram].join(), '1,1,0');
  const leak = M.ddioSim(1024, 2, 1500, 0);
  check('12 MiB of buffers in 4.5: writes allocate and evict one buffer each (1536 B)', [leak.wHit, f(leak.dram, 0)].join(), '0,1536');
  check('leaky with no stall: reads still hit (the core keeps up)', leak.rHit, 1);
  check('with 600 µs stalls reads miss', M.ddioSim(1024, 2, 1500, 600).rHit < 0.9, true);
  check('all 11 ways: 12 MiB fits', M.ddioSim(1024, 11, 1500, 600).fits, true);
}

/* ── 09 BQL ── */
{
  check('a 64 KB send takes 17 descriptors, 1514 B one', [M.descPer(65536), M.descPer(1514)].join(), '17,1');
  const off = M.bql(25, 1024, 65536, 50, false);
  check('without BQL the ring holds 60 × 64 KB', off.ringBytes, 60 * 65536);
  check('a small packet waits 1.26 ms at 25G', f(off.delay / 1000, 2), '1.26');
  const on = M.bql(25, 1024, 65536, 50, true);
  within('with BQL the limit settles within a packet of one interval of bytes (25 Gb/s × 50 µs = 156 KB)', on.limit, 156250 - 65536, 156250 + 65536);
  within('with BQL the link is idle under 2 % of the time', on.idleShare, 0, 0.02);
  within('the limit is never below one packet', Math.min(...on.trace.map(x => x[1])), 65536, Infinity);
  check('LWN example recomputed: 256 × 1538 B at 1 Gb/s = 3.1 ms', f(256 * 1538 * 8 / 1e9 * 1000, 1), '3.1');
}

/* ── 10 XDP / DPDK ── */
{
  const x = M.xdpCores(400, 64);
  check('400G 64 B: 595 Mpps exceeds the PCI limit of 115', x.overPci, true);
  check('cores: raw 124, XDP 24.8, DPDK 13.7', x.rows.slice(1).map(r => f(r.cores, 1)).join(), '124.0,24.8,13.7');
  check('XDP 24 Mpps = 41.7 ns, 150 cycles at 3.6 GHz', [f(x.rows[2].ns, 1), f(x.rows[2].cyc, 0)].join(), '41.7,150');
}

/* ── 12 ECMP and spraying ── */
{
  const e = M.ecmp(64, 64, 'ecmp', 11), s = M.ecmp(64, 64, 'spray', 11);
  check('ECMP conserves packets', e.load.reduce((a, x) => a + x, 0), 64 * M.AI.pkts);
  check('spraying conserves packets', s.load.reduce((a, x) => a + x, 0), 64 * M.AI.pkts);
  check('spraying within one packet per flow of the mean', s.max - s.mean <= 64, true);
  check('ECMP efficiency below spraying', e.eff < s.eff, true);
}

/* ── every number the prose quotes ── */
{
  const want = { ppsTop: '32.5', nsTop: '30.8', pps64: '595', ns64: '1.68', pps9k: '5.53', ns9k: '181', cycTop: '92', cyc64: '5.0', eff64: '55', eff15: '97.5', pps10: '14.88', pps800: '1190', ns800: '0.84',
    wire64: '84', wire15: '1538', dramLo: '70', dramHi: '131', perDram64: '42', ePre: '7', eSfd: '1', eMac: '6', eType: '2', eMin: '46', eMax: '1500', eFcs: '4', eIfg: '12', eMinF: '64', eVlan: '4', fcs64: '0x264e623c',
    rdMin: '520', rdMed: '547', rdMax: '947', pfNeed: '326', pfReads: '41', pfNeed15: '18', pf1Frac: '10', pfFrac: '79', pfMax: '468', pfOut: '32',
    mwrH: '24', cplH: '20', dllN: '8', dllB: '2', g5avail: '463', g5availB: '494', p64up: '106', p64need: '505', p64frac: '92', p64bfrac: '98', p64sUp: '200', p64sFrac: '49',
    p15up: '1680', p15need: '437', p15oh: '11.0', p64oh: '77', g6avail: '944', g6frac8: '100', nFetch: '40', nWb: '8',
    v4h: '0x51ccc178', v4hip: '0x323e8fc2', rssIdx: '120', rssQ: '0', rssRq: '2', tblLo: '2', tblHi: '8', tblX: '4', rssMice: '1.04', rssE: '1.67', rssEc: '56', rssNo: '41', rssNo16: '67', rssE16c: '34', rssW: '100',
    rfs: '65536', remote: '100',
    o0: '3.3', oG: '17.4', oJ: '42.0', oL: '55.0', o16: '35.1', o64: '16.8', oJcores: '9.5', o0cores: '123', oF2n: '88', oF2j: '79', cB: '0.32', cF: '1586', cS: '10027',
    caiG: '42', caiL: '55', caiCopy: '49', caiGhz: '3.4', caiMiss: '49', tsoN: '46', tsoHdr: '3036', tsoH: '66',
    llcMiB: '24.75', ddioMiB: '4.5', fWays: '11', fDdio: '2', fFoot: '6.5', fPct: '26.6', fGain: '30', fTail: '30', d0foot: '12.0', d0r: '73', d0w: '0', d0dram: '1949',
    d256r: '100', d256w: '100', d256drop: '18.9', dWr: '100', dWdram: '0', d0sr: '100', d0sdram: '1536', d512drop: '5.1', d512dram: '0', d0drop: '0', dPkt: '1536', nDdio: '10', nFlush: '70',
    dR8r: '29', dP1r: '14', dR8s: '100', dRho: '60', dRho8: '80',
    q0ms: '1.26', q1us: '70', q15ms: '0.50', q0MB: '3.9', lwnMs: '3.1', lwnRing: '256', descPer: '17',
    xCt: '1.8', xRaw: '4.8', xXdp: '24', xDpdk: '43.5', xPci: '115', xNsX: '42', xNsD: '23', xLatX: '82', xLatD: '2', xPass: '4.5', xcRaw: '124', xcXdp: '25', xcDpdk: '14', xc15Raw: '6.8', xc15Xdp: '1.4',
    cxLo: '330', cxHi: '370', rocePort: '4791', ai64: '26', ai64s: '99', ai128: '61',
    djRet: '131', djYes: '99', djNo: '29', djAbs: '3', djPct: '77', djCom: '487' };
  for (const [k, [v, d, kind]] of Object.entries(P)) check('prose ' + k, kind === 'pct' ? f(v * 100, d) : kind ? M.fmtKind(v, kind) : f(v, d), want[k]);
  check('every prose value pinned', Object.keys(P).sort().join(','), Object.keys(want).sort().join(','));
  const used = new Set();
  const scan = key => { const v = Z[key] || ''; for (const p of v.matchAll(/\{(\w+)\}/g)) { used.add(p[1]); n++; if (!(p[1] in P)) { fails++; console.error(`FAIL {${p[1]}} in ${key} is not filled on the page`); } } };
  for (const m of html.matchAll(/data-i18n-html="([^"]+)"/g)) if (!/^(ch3\.lat|ch4\.dll)\./.test(m[1])) scan(m[1]);
  for (const k of Object.keys(P)) { n++; if (!used.has(k)) { fails++; console.error('FAIL prose() value ' + k + ' is never quoted'); } }
  for (const k of Object.keys(Z).filter(k => /^dg\./.test(k) && !/^dg\.rss\.(q|core)$/.test(k))) for (const p of Z[k].matchAll(/\{(\w+)\}/g)) { n++; if (!(p[1] in P)) { fails++; console.error(`FAIL {${p[1]}} in ${k} has no source`); } }
  // the claims the prose makes about the numbers
  check('hero: 400G 1518 B packets are shorter than a DRAM access', P.nsTop[0] < P.dramLo[0], true);
  check('ch3: 32 outstanding reads fall short; 1 descriptor per read far short', P.pfFrac[0] < 1 && P.pf1Frac[0] < 0.2, true);
  check('ch4: both DLL estimates fail at 64 B, 1518 B fits', P.p64frac[0] < 1 && P.p64bfrac[0] < 1 && P.p15need[0] < P.g5avail[0], true);
  check('ch5: tens of thousands of mice are even, elephants are not', P.rssMice[0] < 1.1 && P.rssE[0] > 1.4, true);
  check('ch5: the simulated collision share is near 1 − birthday', Math.abs(P.rssEc[0] - (1 - P.rssNo[0])) < 0.08, true);
  check('ch5: 16 queues collide less often', P.rssE16c[0] < P.rssEc[0], true);
  check('ch7: interleaving cuts GRO + jumbo', P.o16[0] < P.oJ[0] && P.o64[0] < P.o16[0], true);
  check('ch8: the default leaks (reads below 90 %, DRAM bytes above the packet)', P.d0r[0] < 0.9 && P.d0dram[0] > 1500, true);
  check('ch8: tuned sensitivity moves the same way', P.dR8r[0] < P.d0r[0] && P.dP1r[0] < P.d0r[0], true);
  check('ch9: BQL turns milliseconds into tens of microseconds', P.q0ms[0] > 1 && P.q1us[0] < 100, true);
  check('ch10: XDP several times the stack, DPDK about twice XDP', P.xXdp[0] / P.xRaw[0] > 4 && P.xDpdk[0] / P.xXdp[0] < 2, true);
  check('ch12: ECMP at 64 / 64 is poor, spraying near perfect, 128 / 16 in between', P.ai64[0] < 0.4 && P.ai64s[0] > 0.95 && P.ai128[0] > P.ai64[0], true);
}

/* ── sentence branches ── */
{
  const has = k => { n++; if (Z[k] == null) { fails++; console.error('FAIL missing say key ' + k); } };
  const seen = new Set(), add = s => { has(s.key); seen.add(s.key); };
  for (const sz of M.FRAME.sizes) for (const fl of [false, true]) add(M.say.fcs(M.frame(sz, false, fl)));
  for (const sp of M.FRAME.speeds) for (const sz of M.FRAME.sizes) add(M.say.frame(M.budget(sp, sz)));
  for (const sp of M.FRAME.speeds) for (const sz of M.FRAME.sizes) for (const B of M.PREF.batches) for (const K of M.PREF.outs) for (const L of M.PREF.lats) add(M.say.pref(M.prefetch(sp, sz, B, K, L)));
  for (const gen of M.PCIE.gens) for (const lanes of M.PCIE.lanes) for (const size of M.FRAME.sizes) for (const mps of M.PCIE.mps) for (const design of ['simple', 'batch']) for (const gbps of M.PCIE.speeds) for (const dll of [undefined, SRC.b1.dll])
    add(M.say.pcie(M.pcieRx({ gen, lanes, size, mps, design, gbps, dll })));
  for (const v of SRC.ms.v4) for (const nq of M.RSS.queues) add(M.say.hash(M.rss(v[2], v[0], v[3], v[1], true, nq)));
  for (const q of M.RSS.queues) for (const mi of M.RSS.mice) for (const e of M.RSS.elephants) for (const seed of [7, 8, 9]) add(M.say.load(M.rssLoad(q, mi, e, seed), e));
  for (const mtu of M.OFF.mtus) for (const a of M.OFF.aggs) for (const fl of M.OFF.flows) add(M.say.off(M.offload(mtu, a, fl), a, fl));
  for (const R of M.DDIO.rings) for (const W of M.DDIO.ways) for (const sz of [256, 1500]) for (const st of [0, 600]) add(M.say.ddio(M.ddioSim(R, W, sz, st, { packets: 12000 })));
  for (const sp of M.BQL.speeds) for (const r of M.BQL.rings) for (const p of M.BQL.pkts) for (const tc of M.BQL.tcs) for (const on of [false, true]) add(M.say.bql(M.bql(sp, r, p, tc, on), on));
  for (const sp of [10, 25, 100, 400, 800]) for (const sz of M.FRAME.sizes) add(M.say.xdp(M.xdpCores(sp, sz)));
  for (const F of M.AI.flows) for (const Pp of M.AI.paths) for (const mo of M.AI.modes) add(M.say.ai(M.ecmp(F, Pp, mo), mo));
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
  for (const k of ['min', 'med', 'max']) keys.add('ch3.lat.' + k);
  for (const k of ['data', 'wb', 'fetch', 'irq', 'head', 'tail']) keys.add('ch4.it.' + k);
  for (const a of M.OFF.aggs) keys.add('ch7.a.' + a);
  for (const p of M.XDPM.paths) { keys.add('ch10.p.' + p); keys.add('ch10.cv.' + p); }
  for (const k of ['pre', 'sfd', 'dst', 'src', 'type', 'data', 'fcs', 'ifg']) keys.add('dg.frame.' + k);
  for (const k of ['pre', 'sfd', 'mac', 'type', 'data', 'fcs', 'ifg']) keys.add('dg.frame.b.' + k);
  for (const k of [...keys]) if (/\.$/.test(k)) keys.delete(k);
  for (const k of keys) { n++; if (Z[k] == null) { fails++; console.error('FAIL missing zh key ' + k); } }
  const prefixes = [...app.matchAll(/'((?:ch\d+|dg)\.[\w.]*)'\s*\+/g)].map(m => m[1]);
  for (const k of Object.keys(Z)) {
    const reach = keys.has(k) || html.includes(`"${k}"`) || app.includes(`'${k}'`) || prefixes.some(p => k.startsWith(p)) || /\.say\./.test(k);
    n++; if (!reach) { fails++; console.error('FAIL zh key never used ' + k); }
  }
  for (const [k, v] of Object.entries(Z)) if (/\.say\.|^ch3\.lat|^ch4\.dll|^ch7\.tso\.(more|sum)$|^ch2\.hex\.more$|^dg\.rss\.(q|core)$/.test(k)) for (const m of v.matchAll(/\{(\w+)\}/g)) {
    n++; if (!new RegExp('\\b' + m[1] + '\\s*:|[{,]\\s*' + m[1] + '\\s*[,}]').test(app)) { fails++; console.error(`FAIL placeholder {${m[1]}} in ${k} is never supplied by app.js`); }
  }
  const dgs = [...html.matchAll(/class="dia" data-dg="(\w+)"/g)].map(m => m[1]);
  check('eight diagrams (six or more required; all seven the task names, the transmit path added)', dgs.join(), 'nic,frame,rx,rss,tso,tx,xdp,qp');
  for (const d of dgs) { check('diagram spec ' + d, app.includes('DG.' + d + ' = '), true); for (const s of ['cap', 'aria']) check(`dg.${d}.${s}`, typeof Z[`dg.${d}.${s}`], 'string'); }
  for (const d of dgs) { n++; if (!Z['dg.' + d + '.cap'].includes('示意') && !/^(frame)$/.test(d)) { fails++; console.error('FAIL caption of ' + d + ' does not say 示意'); } }
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
  // the builder adds no provenance label; the registrar adds one later
  check('at most one provenance label', (html.match(/<details class="page-provenance"/g) || []).length <= 1, true);
  check('site navigation included', [html.includes('../../../site-nav.css?v='), html.includes('../../../site-nav.js?v=')].join(), 'true,true');
  const R = JSON.parse(fs.readFileSync(path.join(DIR, 'REGISTRY.json'), 'utf8'));
  check('registry slug/path', R.slug + ' ' + R.path, SLUG + ' computing/systems/' + SLUG + '/');
  check('registry category', [R.category, R.subtopic, R.stage].join('/'), 'computing/systems/university');
  check('registry title', R.title.zh, Z['doc.title'].split(' · ')[0]); check('registry desc', R.desc.zh, Z['doc.desc']);
  check('hero title = registry title', Z['hero.title'], R.title.zh);
  for (const c of R.concepts) check('anchor ' + c.anchor, html.includes('id="' + c.anchor.slice(1) + '"'), true);
  for (const c of R.concepts) { n++; if (!c.aliases.zh.length || !c.aliases.en.length || !c.title.en || !c.desc.en || !c.title.zh || !c.desc.zh) { fails++; console.error('FAIL concept incomplete ' + c.id); } }
  check('one concept per chapter', R.concepts.map(c => c.anchor).join(), Array.from({ length: 14 }, (_, i) => '#ch' + (i + 1)).join());
  // one word, one owner: every alias anywhere else (sibling registries, atlas lessons, the alias table) is off limits,
  // plus the words left to siblings (the build notes in BRIEF.md list why)
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
  for (const a of ['TSO', 'RDMA', 'RDMA 是什么', 'what is RDMA', 'RoCE', 'RoCE v2', 'PFC', 'DCQCN', '无损以太网', 'lossless Ethernet', 'NVMe-oF']) own(a, 'storage-over-a-network');
  for (const a of ['超以太网', 'Ultra Ethernet', 'Ultra Ethernet 是什么', '共封装光学', 'CPO', 'co-packaged optics']) own(a, 'siblings (memory / coherent / switches essays)');
  for (const a of ['内核旁路', 'kernel bypass', '零拷贝', 'zero copy', 'NAPI', '描述符环', 'descriptor ring', 'DMA 是什么', '接收环大小', '中断合并', 'interrupt coalescing', 'DPDK', 'SR-IOV', 'virtio']) own(a, 'how-the-os-talks-to-hardware');
  for (const a of ['MSI', 'MSI-X', 'TLP', 'PCIe 有效带宽', 'PCIe 协议开销']) own(a, 'how-pcie-works');
  for (const a of ['NUMA']) own(a, 'how-a-computer-is-wired');
  for (const a of ['MTU', '数据包', 'packet', '丢包', 'packet loss', 'TCP', 'IP 地址', '拥塞控制']) own(a, 'how-a-web-page-arrives / tcp-congestion (drafts and siblings)');
  own('DMA', 'why-a-few-firms-win');
  for (const c of R.concepts) for (const a of [...c.aliases.zh, ...c.aliases.en]) { n++; if (owned.has(norm(a))) { fails++; console.error(`FAIL alias owned by ${owned.get(norm(a))}: ${a}`); } }
  const mineAll = R.concepts.flatMap(c => [...c.aliases.zh, ...c.aliases.en]).map(norm);
  check('no alias twice on this page', new Set(mineAll).size, mineAll.length);
  for (const w of ['以太网帧', 'RSS', '托普利茨哈希', 'Toeplitz hash', 'aRFS', 'GRO', 'LRO', 'TSO 分段卸载', 'DDIO', 'leaky DMA', 'BQL', 'XDP', 'AF_XDP', '队列对', 'queue pair', '单边写', 'one-sided write', '包喷洒', 'packet spraying', 'ECMP', 'UEC 1.1'])
    check('this page takes ' + w, mineAll.includes(norm(w)), true);
  // links: only live siblings, chapters that exist, titles quoted as in their copy
  const all = Object.values(Z).join('');
  const LIVE = ['how-the-os-talks-to-hardware', 'how-pcie-works', 'how-cpu-caches-work', 'how-a-computer-is-wired', 'storage-over-a-network', 'coherent-interconnects',
    'why-compute-waits-for-memory', 'how-a-gpu-computes', 'tcp-congestion', 'distributed-systems'];
  const hrefs = [...all.matchAll(/href='([^']+)'/g)].map(m => m[1]);
  for (const h of hrefs) { n++; if (!new RegExp('^\\.\\./(' + LIVE.join('|') + ')/(#ch\\d+)?$').test(h)) { fails++; console.error('FAIL unexpected link ' + h); } }
  for (const sib of LIVE) {
    const sh = fs.readFileSync(path.join(DIR, '..', sib, 'index.html'), 'utf8');
    for (const m of all.matchAll(new RegExp("href='\\.\\./" + sib + "/(#ch\\d+)?'", 'g'))) if (m[1]) check(`${sib} anchor ${m[1]}`, sh.includes(`id="${m[1].slice(1)}"`), true);
    const cp = path.join(DIR, '..', sib, 'copy.zh.js');
    let title;
    if (fs.existsSync(cp)) { const cz = { window: {} }; vm.runInNewContext(fs.readFileSync(cp, 'utf8'), cz); title = cz.window.ESSAY_COPY.zh['hero.title']; }
    else title = sh.match(/<title>([^<]*)<\/title>/)[1];
    check(sib + ' title quoted as in its page', all.includes('《' + title + '》'), true);
  }
  for (const [h, why] of [['../how-the-os-talks-to-hardware/#ch7', 'rings'], ['../how-the-os-talks-to-hardware/#ch6', 'NAPI'], ['../how-the-os-talks-to-hardware/#ch12', 'bypass, SR-IOV'],
    ['../how-pcie-works/#ch3', 'TLP'], ['../how-pcie-works/#ch9', 'PAM4'], ['../how-cpu-caches-work/#ch1', 'DRAM latency'], ['../how-cpu-caches-work/#ch3', 'ways'], ['../how-a-computer-is-wired/#ch4', 'NUMA'],
    ['../storage-over-a-network/#ch6', 'RDMA'], ['../coherent-interconnects/#ch9', 'all-reduce'], ['../coherent-interconnects/#ch10', 'scale-up / scale-out'],
    ['../why-compute-waits-for-memory/#ch10', 'CPO'], ['../tcp-congestion/', 'congestion control'], ['../distributed-systems/', 'clocks']]) check(`links ${h} (${why})`, hrefs.includes(h), true);
  // drafts are named in plain text, ready for the registrar to link
  // English: every sibling title quoted in “…” as registered in its copy.en.js (auto-links need the exact title)
  {
    const ectx2 = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.en.js'), 'utf8'), ectx2);
    const allEn = Object.values(ectx2.window.ESSAY_COPY.en).join('');
    for (const sib of LIVE) {
      const cp = path.join(DIR, '..', sib, 'copy.en.js'); if (!fs.existsSync(cp)) continue;
      const cz = { window: {} }; vm.runInNewContext(fs.readFileSync(cp, 'utf8'), cz); const en = cz.window.ESSAY_COPY.en || {};
      const title = (en['hero.title'] || '').replace(/<[^>]+>/g, '');
      if (!title) continue;
      check(sib + ' English title quoted as in its page', allEn.includes('“' + title), true);
      // every quoted title inside a link to this sibling is exactly its title
      for (const m of allEn.matchAll(new RegExp("<a href='\\.\\./" + sib + "/[^']*'>([^<]*)</a>", 'g'))) { const q = m[1].match(/“([^”]*?)[,.]?”/); if (q) check(`${sib} link text “${q[1]}”`, q[1], title); }
    }
    for (const [d, sub] of [['how-much-a-wire-can-carry', 'tech/networks'], ['how-a-web-page-arrives', 'tech/networks']]) {
      const rp = path.join(ROOT, sub, d, 'REGISTRY.json');
      if (fs.existsSync(rp)) { const R2 = JSON.parse(fs.readFileSync(rp, 'utf8')); check(d + ' draft English title quoted exactly', allEn.includes('“' + R2.title.en), true); check(d + ' draft Chinese title quoted exactly', all.includes('《' + R2.title.zh + '》'), true); }
    }
  }
  check('the two network drafts are named, not linked', [all.includes('《网页是怎么来到你手机上的》'), all.includes('《一根线到底能传多少信息》'), /how-a-web-page-arrives|how-much-a-wire-carries/.test(hrefs.join())].join(), 'true,true,false');

  const ectx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.en.js'), 'utf8'), ectx);
  const EN = ectx.window.ESSAY_COPY.en, stub = ectx.window.ESSAY_COPY.enStub === true, ph = s => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');
  check('en keys = zh keys', Object.keys(EN).sort().join('|'), Object.keys(Z).sort().join('|'));
  for (const k of Object.keys(Z)) check('en placeholders ' + k, ph(EN[k]), ph(Z[k]));
  if (stub) { check('en stub mirrors zh exactly', JSON.stringify(EN), JSON.stringify(Z)); console.log('NOTE: copy.en.js is a stub (enStub); English registry match skipped until it is translated'); }
  else { check('registry title en', R.title.en, EN['doc.title'].split(' · ')[0]); check('registry desc en', R.desc.en, EN['doc.desc']); }
}

if (fails) { console.error(`\n${fails} of ${n} checks failed`); process.exit(1); }
console.log(`PASS: ${n} checks (frame and CRC-32, line-rate budget, descriptor prefetch, PCIe bytes per packet, all 16 Microsoft Toeplitz values, flows onto queues, offload fit and TSO, DDIO simulation, BQL, XDP / DPDK, ECMP and spraying, sourced and frontier figures, every number in the prose, every sentence branch, keys, registry, links and aliases)`);
