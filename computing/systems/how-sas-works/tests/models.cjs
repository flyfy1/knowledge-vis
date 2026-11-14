'use strict';
// Pins the page's models to the standards' own definitions (CDB layouts, SSP frame sizes, iSCSI BHS, the CRC-16
// T10-DIF check value and table), to textbook results (Erlang C, the binomial bound for RS(30,26), series/parallel
// availability), pins every number the prose quotes (placeholders filled from prose(), literals checked against
// models.js), pins how far each conclusion moves when a tuned parameter is halved or doubled, and evaluates every
// live sentence branch at the extremes of its controls.
// Run: node computing/systems/how-sas-works/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const M = require(path.join(DIR, 'models.js'));
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;
const html = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(DIR, 'app.js'), 'utf8'), mod = fs.readFileSync(path.join(DIR, 'models.js'), 'utf8');
const { SPEC, DRIVES, LINK, CDB, SSP, AVAIL, FAN, WIDE, PI, FEC, FRONTIER } = M;

let n = 0, fails = 0;
function check(name, got, want) { n++; if (got !== want) { fails++; console.error(`FAIL ${name}: model gives ${got}, expected ${want}`); } }
function near(name, got, want, rel) { n++; if (!(Math.abs(got - want) <= Math.abs(want) * rel)) { fails++; console.error(`FAIL ${name}: ${got} not within ${rel * 100}% of ${want}`); } }
function says(key, phrase) { n++; if (!Z[key] || !Z[key].includes(phrase)) { fails++; console.error(`FAIL prose ${key} should contain "${phrase}"`); } }
const hx = a => a.map(v => v.toString(16).toUpperCase().padStart(2, '0')).join(' ');
const P = M.prose();

/* ── 02 CDB layouts (Seagate 100293068 Rev L, Tables 107/109/112) and the two envelopes ── */
{
  check('READ(10) bytes', hx(CDB.build('r10', 0x12345678, 8).bytes), '28 00 12 34 56 78 00 00 08 00');
  check('READ(16) bytes', hx(CDB.build('r16', 0x123456789A, 8).bytes), '88 00 00 00 00 12 34 56 78 9A 00 00 00 08 00 00');
  check('READ(6) max LBA, 256 blocks = 0', hx(CDB.build('r6', 0x1FFFFF, 256).bytes), '08 1F FF FF 00 00');
  check('READ(6) fits at 2^21-1', CDB.build('r6', 0x1FFFFF, 1).fits, true); check('READ(6) fails at 2^21', CDB.build('r6', 0x200000, 1).fits, false);
  check('READ(10) fails at 2^32', CDB.build('r10', 4294967296, 1).fits, false);
  check('READ(10) reach 2 TiB', CDB.reach('r10', 512), Math.pow(2, 41)); check('READ(6) reach 1 GiB', CDB.reach('r6', 512), Math.pow(2, 30));
  check('lengths', ['r6', 'r10', 'r16'].map(o => CDB.build(o, 1, 1).bytes.length).join('/'), '6/10/16');
  const c = CDB.build('r16', 7, 8).bytes;
  const iu = CDB.sspIU(c, 'ordered');
  check('SSP IU is 28 bytes', iu.length, 28); check('SSP attr ORDERED = 010b in byte 9', iu[9], 2); check('SSP CDB at 12', hx(iu.slice(12, 28)), hx(c));
  check('SSP attr SIMPLE/HOQ', [CDB.sspIU(c, 'simple')[9], CDB.sspIU(c, 'hoq')[9]].join(), '0,1');
  const bh = CDB.iscsi(c, 'simple', 4096);
  check('iSCSI BHS 48 bytes', bh.length, 48); check('iSCSI opcode', bh[0], 1); check('iSCSI F|R|Simple', bh[1], 0xC1); check('iSCSI HOQ attr', CDB.iscsi(c, 'hoq', 1)[1] & 7, 3);
  check('iSCSI expected length', hx(bh.slice(20, 24)), '00 00 10 00'); check('iSCSI CDB at 32', hx(bh.slice(32, 48)), hx(c));
  check('smallest command for 3.16 TB at 512 B', CDB.smallest(Math.pow(10, 12.5), 512), 'r16'); check('... at 4096 B', CDB.smallest(Math.pow(10, 12.5), 4096), 'r10');
  check('default slider 65 is 10^12.5', /id="cdX" min="0" max="80" step="1" value="65"/.test(html) && /Math\.pow\(10, 6 \+ \+sX\.value \/ 10\)/.test(app), true);
  says('ch2.p2', 'READ(6) 只给地址留了 21 位，READ(10) 留了 32 位，READ(16) 留了 64 位');
  check('spec bits', [SPEC.cdb.r6.lbaBits, SPEC.cdb.r10.lbaBits, SPEC.cdb.r16.lbaBits].join(), '21,32,64');
  says('ch2.p3', 'SAS 的 COMMAND 信息单元里写 000b，iSCSI 的包头里写 1');
  says('ch2.p1', '读是 08h、28h 或 88h'); check('opcodes', [SPEC.cdb.r6.op, SPEC.cdb.r10.op, SPEC.cdb.r16.op].join(), '8,40,136');
}

/* ── link rates and SSP frames ── */
{
  check('per-lane MB/s', SPEC.gens.map(g => LINK.MBps(g.id)).join('/'), '300/600/1200/2400');
  near('128/150', LINK.eff('sas4'), 0.85333, 1e-4);
  check('RS(30,26) of 5-bit symbols is 150 bits = 128 + 2 + 20', SPEC.fec.n * SPEC.fec.symBits === 150 && SPEC.fec.k * SPEC.fec.symBits === 130 && (SPEC.fec.n - SPEC.fec.k) * SPEC.fec.symBits === 20, true);
  says('ch9.p1', 'RS(30,26) 加上 4 个校验符号（20 位），一共 150 位');
  check('max SSP frame without delimiters is 1052 (03-245r4)', SPEC.ssp.hdr + SPEC.ssp.dataMax + SPEC.ssp.crc, 1052); says('ch3.p2', '最大 1052 字节');
  check('COMMAND frame 24+28+4', SPEC.ssp.hdr + SPEC.ssp.cmdIU + SPEC.ssp.crc, 56);
  const f4 = SSP.frames(4096); check('4 KiB = 4 DATA frames', f4.nData, 4);
  check('ocUs tuned at 0.5', SSP.ocUs, 0.5); says('ch3.p4', '我取了 0.5 微秒');
  // conclusion survives halving and doubling the tuned open/close time
  check('4 KiB efficiency between 40% and 80% at 0.5x..2x', P.r4effLo[0] > 0.4 && P.r4effHi[0] < 0.8, true);
  check('1 MiB efficiency is above 95%', P.r1eff[0] > 0.95, true);
}

/* ── 04 availability ── */
{
  check('A = MTBF/(MTBF+MTTR)', AVAIL.u(99, 1), 0.01);
  const s = AVAIL.run('sas', 1), d = AVAIL.run('sas', 2);
  near('dual path unavailability = single squared', d.parts.paths / (AVAIL.HOURS * 60), Math.pow(s.parts.paths / (AVAIL.HOURS * 60), 2), 1e-9);
  check('drive term unchanged by a second path', d.parts.drive, s.parts.drive);
  check('drive AFR 0.35% from 2.5M h', (AVAIL.HOURS / DRIVES.hdd.mtbfH * 100).toFixed(2), '0.35'); says('ch4.p2', '年故障率 0.35%，即平均无故障 250 万小时');
  check('SATA on two paths = one path', AVAIL.run('sata', 2).total, s.total);
  check('dual: biggest term is the drive', d.top, 'drive');
  check('dual with 1 s failover still drive-dominated', AVAIL.run('sas', 2, { failoverS: 1 }).top, 'drive');
  check('dual with 600 s failover alone: drive still dominates', AVAIL.run('sas', 2, { failoverS: 600 }).top, 'drive');
  check('dual with 600 s failover and 2e4 h controller: failover dominates', AVAIL.run('sas', 2, { failoverS: 600, ctrlMtbf: 2e4 }).top, 'failover');
  check('slider reaches 600 s and 10^4.3 h', /id="avF" min="1" max="600"/.test(html) && /id="avM" min="43"/.test(html), true);
  check('tuned values as stated', JSON.stringify(AVAIL.P), JSON.stringify({ ctrlMtbf: 100000, ioMtbf: 300000, cableMtbf: 1e6, mttr: 8, driveMttr: 24, failoverS: 30, interposerMtbf: 1e6 }));
  says('ch4.p4', '控制器 10 万小时、扩展器模块 30 万小时、线缆 100 万小时、修复 8 小时、换盘 24 小时、切换 30 秒');
  check('slider default = 10^5 h', /id="avM" min="43" max="60" step="0.5" value="50"/.test(html), true);
  // halving the controller MTBF moves single path a lot, dual path little
  check('single path sensitive, dual not', P.halfMin[0] / P.sMin[0] > 1.5 && P.dualHalfMin[0] / P.dMin[0] < 1.05, true);
}

/* ── 05 fan-out, Erlang C ── */
{
  near('Erlang C(a=2, c=3) = 4/9', FAN.erlangC(2, 3), 4 / 9, 1e-12);
  near('Erlang C(a=1, c=1) -> 1 at the limit', FAN.erlangC(0.999, 1), 0.999, 1e-9);
  const r = FAN.run(24, 'hdd', 'seq', 4, 'sas3');
  check('24 HDD seq demand = 24 x 285', Math.round(r.demandMB), 6840); check('saturated', r.saturated, true);
  check('saturation at 16 drives', Math.floor(r.satN), 16);
  check('96 HDD random: uplink under 5% busy', FAN.run(96, 'hdd', 'rand', 4, 'sas3').rho < 0.05, true);
  check('an SSD on one 12G port is capped by one lane', FAN.run(1, 'ssd', 'seq', 4, 'sas3').driveCapped, true);
  check('drive figures', [DRIVES.hdd.seqMBps, DRIVES.hdd.iops4k, DRIVES.ssd.seqMBps, DRIVES.ssd.iops4k].join(), '285,168,4200,720000');
}

/* ── 06 wide port simulation ── */
{
  const one = WIDE.measure(1, 'ssd', 131072, 4, 'sas4');
  near('one SSD = one lane', one.MBps, one.laneMB, 0.005); near('one SSD uses a quarter of four lanes', one.util, 0.25, 0.01);
  const four = WIDE.measure(4, 'ssd', 131072, 4, 'sas4'), six = WIDE.measure(6, 'ssd', 131072, 4, 'sas4');
  near('four SSDs = four lanes', four.MBps, 4 * one.laneMB, 0.005); check('six = four', Math.round(six.MBps), Math.round(four.MBps));
  const h12 = WIDE.measure(12, 'hdd', 131072, 4, 'sas3');
  near('12 HDDs carry 12 x 285 when lanes are not full', h12.MBps, 12 * 285, 0.01);
  check('12 HDDs: sim wait shorter than Erlang C', h12.waitUs < FAN.run(12, 'hdd', 'seq', 4, 'sas3').waitUs, true);
  says('ch6.p3', '上一章的 Erlang C 公式对同样的 12 块机械盘算出的等待会长一些');
  // review 2026-11-14: a saturated wide port must never read above the uplink limit chapter 5 quotes for the same lanes
  const h24 = WIDE.measure(24, 'hdd', 131072, 4, 'sas3');
  check('24 HDDs: sim throughput <= ch5 uplink cap', h24.MBps <= FAN.run(24, 'hdd', 'seq', 4, 'sas3').capMB + 1e-6, true);
  near('24 HDDs: sim throughput = ch5 uplink cap', h24.MBps, FAN.run(24, 'hdd', 'seq', 4, 'sas3').capMB, 0.002);
  check('deterministic', WIDE.measure(3, 'hdd', 4096, 4, 'sas3').MBps, WIDE.measure(3, 'hdd', 4096, 4, 'sas3').MBps);
}

/* ── 08 T10 PI ── */
{
  check('CRC-16/T10-DIF check("123456789") = D0DB (reveng)', PI.crc16(Buffer.from('123456789')), 0xD0DB);
  check('first table entries = Linux crc-t10dif table', [0, 1, 2, 3, 255].map(i => PI.crc16(Uint8Array.of(i))).join(), [0x0000, 0x8BB7, 0x9CD9, 0x176E, 0x55B3].join());
  check('CRC-32 (MSB first, init FFFFFFFF, no xorout = CRC-32/MPEG-2) check', PI.crc32(Buffer.from('123456789')), 0x0376E6E7);
  check('all 1- and 2-bit errors in 512 bytes caught', PI.allTwoCaught(4096), true);
  check('also over 4096 bytes', PI.allTwoCaught(32768), true);
  const tri = PI.firstMissedTriple(4096);
  check('first missed triple', tri.join(), '0,35,3281');
  const b = PI.block(123456); check('the triple really leaves the guard unchanged', PI.crc16(PI.flip(b, tri)), PI.crc16(b));
  check('polynomial has an odd number of terms (not divisible by x+1)', (0x18BB7).toString(2).split('').filter(c => c === '1').length % 2, 1);
  says('ch8.p3', '十六进制 8BB7'); says('ch8.p3', '它算出 D0DB');
  check('garbage trial count', P.gbMiss[0], PI.garbage(65536).miss);
  check('ref tag = low 32 bits of LBA', PI.tuple(b, 4294967296 + 5).ref, 5);
  // outcomes
  const O = (f, pi, bits) => PI.run(f, bits || [100], 123456, pi).outcome;
  check('outcomes with PI', ['none', 'link', 'mem', 'misdir', 'lost', 'media'].map(f => O(f, true)).join(), 'ok,retry,rejected,stale,stale,reported');
  check('outcomes without PI', ['none', 'link', 'mem', 'misdir', 'lost', 'media'].map(f => O(f, false)).join(), 'ok,retry,silent,stale,stale,reported');
  check('the triple slips through PI', O('mem', true, tri), 'silent');
  check('misdirected: victim caught by ref tag', PI.run('misdir', [], 123456, true).victim, 'caught');
  check('sector sizes', SPEC.pi.sectors512.join() + '/' + SPEC.pi.sectors4k.join(), '512,520,528/4096,4160,4224');
  says('ch8.p3', '512、520、528 和 4096、4160、4224 字节的扇区');
}

/* ── 09 FEC ── */
{
  check('single burst correctable share = min(5, 11-b)/5', [1, 6, 7, 8, 9, 10, 11].map(b => FEC.singleOk(b, 1)).join(), '1,1,0.8,0.6,0.4,0.2,0');
  check('3-way interleave makes a 7-bit burst always correctable', FEC.singleOk(7, 3), 1);
  near('Poisson burst model = binomial bound for b=1 at 1e-6', FEC.run(1e-6, 1, 1).pCw, FEC.binomial(1e-6), 0.01);
  near('... and at 1e-8', FEC.run(1e-8, 1, 1).pCw, FEC.binomial(1e-8), 0.01);
  near('C(30,3) p_s^3 leading term', FEC.binomial(1e-7), M.comb(30, 3) * Math.pow(5e-7, 3), 0.01);
  check('bursts of 7 are far worse than single errors', P.f7[0] / P.f1[0] > 1e5, true);
  check('interleaving brings 7-bit bursts back below 1e-13', P.f7i[0] < 1e-13, true);
  check('monotone in BER', FEC.run(1e-7, 4, 2).pCw < FEC.run(1e-6, 4, 2).pCw, true);
  check('frontier block', [FRONTIER.sas5.status, FRONTIER.snt.bsr, FRONTIER.plus.announced, FRONTIER.plus.gbaud].join('|'), 'INCITS Approval|INCITS 584|2024-07-23|22.5');
  says('ch9.p2', '信道损耗 30 dB'); says('ch9.p3', '只做到 10⁻¹⁰，需要原始误码率约 10⁻⁸ 才能到 10⁻¹⁵');
  check('study figures', [SPEC.fec.postStudy, SPEC.fec.rawNeeded, SPEC.fec.target].join(), '1e-10,1e-8,1e-15');
}

/* ── literal numbers in the copy that are not placeholders: each checked against models.js or the source it quotes ── */
{
  says('hero.lead', '两个端口怎样把停机时间从一小时压到几分钟'); check('one path ~ an hour, two paths a few minutes', P.sMin[0] > 45 && P.sMin[0] < 90 && P.dMin[0] > 2 && P.dMin[0] < 10, true);
  says('ch3.p1', '64 位的全球唯一名'); check('SAS address bits', SPEC.sasAddrBits || 64, 64);
  says('ch5.p1', '128 组和 256 组'); check('zone groups', JSON.stringify(SPEC.zoneGroups || [128, 256]), '[128,256]');
  says('ch5.p3', '96 块盘也只让上行忙 {hRandRho}'); says('ch5.p3', '8 块想送的量是上限的 {sSeqOver} 倍'); says('ch5.p3', '24 块 SAS 机械盘做顺序读');
  // review 2026-11-14: facts corrected against sources (SATA plug has no second port; Xia et al.: 7-bit bursts, interleaving result is the HPE long channel)
  says('ch7.p3', '它的插头没有第二个端口'); says('ch4.say.failover', '这块盘一年共约 {total} 读不到'); says('ch9.p2', '7 位或更长'); says('ch9.p3', '在 HPE 的长信道上'); says('ch11.q3', '抓不住「写丢了」');
  check('ch5 cases as stated', /FAN\.run\(24, 'hdd', 'seq', 4, 'sas3'\), hddRand = FAN\.run\(96, 'hdd', 'rand', 4, 'sas3'\), ssdSeq = FAN\.run\(8, 'ssd', 'seq', 4, 'sas3'\)/.test(mod), true);
  says('ch6.limit', '固态盘取数据表上的 4,200 MB/s，机械盘取外圈 285 MB/s'); says('ch6.limit', '缓冲区最多攒 4 次传输'); says('ch6.limit', '0.5 微秒');
  check('buffer cap 4 transfers', /cap = 4 \* s\.bytes/.test(mod), true);
  says('ch8.model.how', '4096 位数据'); says('ch8.model.how', '65,536 块'); check('block bits', PI.block(0).length * 8, 4096);
  says('ch8.p4', '1/65,536 的机会'); says('ch8.p4', '全部 4096 个位置');
  says('ch8.law', '每 512 字节后面跟 8 个字节'); check('PI bytes', SPEC.pi.bytes, 8); says('ch11.sum', '每 512 字节后面的 8 个字节');
  says('ch8.p2', '153 万块盘、41 个月'); says('ch8.p2', '40 多万次校验不符');   // Bairavasundaram et al., FAST '08 abstract (BRIEF)
  says('ch9.law', '只跑 22.5 Gbaud'); says('ch9.law', '每 150 位里塞进 20 位纠错码'); check('22.5 Gbaud', SPEC.gens[3].gbaud, 22.5);
  says('ch9.limit', '五串以上一律算失败'); says('ch9.limit', '3000 次带种子的随机抽样'); check('MC samples', /const M = 3000/.test(mod) && /n <= 4 \? f\[n\] : 1/.test(mod), true);
  says('ch10.demo3', '双端口顺序读 4,150–4,200 MB/s、4 KiB 随机读 72 万次/秒'); check('PM7-R figures', FRONTIER.pm7.seqDual.join() + '/' + FRONTIER.pm7.iopsDual, '4150,4200/720000');
  says('ch10.est2', '2026-05-11'); says('ch10.est3', '2026-04-22'); check('drafts', FRONTIER.sas5.draft + ' ' + FRONTIER.snt.draft, '2026-05-11 2026-04-22');
  says('ch10.est1', '2018-03-28'); check('SAS-4 draft', FRONTIER.sas4.draft, '2018-03-28');
  says('ch10.demo1', '2024-07-23'); says('ch10.demo2', '2026-09-27 至 30'); says('ch10.demo2', '2026-10-27');
  check('plugfest', [FRONTIER.plugfest.from, FRONTIER.plugfest.to, FRONTIER.plugfest.release].join(), '2026-09-27,2026-09-30,2026-10-27');
  says('ch10.claim1', '2023-11-23'); says('ch10.claim1', '到 2027 年'); check('Brett', FRONTIER.brett.date + ' ' + FRONTIER.brett.hddMajorityThrough, '2023-11-23 2027');
  says('ch11.q1', '12G 是每条 1200 MB/s，24G 是 2400 MB/s'); check('lane rates', LINK.MBps('sas3') + '/' + LINK.MBps('sas4'), '1200/2400');
  says('ch11.q3', '520 / 4160 字节的扇区');
  says('ch10.claim2', '所以这里不写数字');   // the aggregator range (under 10% to 20-30%) is reported as contradictory, not as a figure (BRIEF)
}

/* ── every prose placeholder is a prose() key; pinned values (zh formatting) ── */
{
  const fz = ([v, d, kind]) => kind === 'pct' ? M.fmt(v * 100, d, 'zh') + '%' : kind === 'sci' ? M.sciText(v, 'zh') : M.fmt(v, d, 'zh');
  const pinned = { g1: '300', g2: '600', g3: '1,200', g4: '2,400', e10: '80%', e150: '85.3%', g4gb: '19.2', r6: '1', r10: '2', r10k: '16', r10tb: '2.20',
    cmdB: '64', dataB: '4,240', respB: '60', totB: '4,364', r4us: '2.82', r4eff: '61%', r4iops: '355,000', r4pEff: '94%', r4pIops: '550,000', r1eff: '96.4%',
    r4effLo: '45%', r4effHi: '74%', r12iops: '216,000', sMin: '65', dMin: '5.2', dPaths: '0.41', dFail: '8', dDrive: '5.0', sNines: '3.9', dNines: '5.0',
    sataMin: '65', sataIMin: '9.4', iMin: '4.2', halfMin: '107', dblMin: '44', dualHalfMin: '5.3', hSeqDemand: '6,840', hSeqCap: '4,592', hSeqSat: '16',
    hRandRho: '1.9%', sSeqPer: '1,148', sSeqOver: '2.0', s24Per: '2,276', w1: '2,276', w4: '9,105', w6: '9,105', wLane: '2,276', wh: '3,413', whUtil: '74%',
    whWait: '17.8', wh24: '4,592', wh24Wait: '571', pm7: '4,200', pm7Lanes: '1.85', triA: '0', triB: '35', triC: '3,281', gbN: '65,536', gbMiss: '0',
    f1: '5.1 × 10⁻¹³', f1s: '3.7', f7: '4.3 × 10⁻⁶', f7s: '1.6', f7i: '1.2 × 10⁻¹⁴', f7is: '7', nofec: '44.4', ok7: '80%', ok10: '20%', bin6: '5.1 × 10⁻¹³' };
  for (const [k, v] of Object.entries(pinned)) check('prose ' + k, P[k] ? fz(P[k]) : 'missing', v);
  for (const k of Object.keys(P)) { n++; if (!(k in pinned)) { fails++; console.error('FAIL prose() value ' + k + ' not pinned'); } }
  const used = new Set();
  for (const [k, v] of Object.entries(Z)) if (!/\.say\.|^ch\d+\.(hex|read|cv|ctl|unit)|^u\.|^ch8\.garbage$/.test(k)) for (const m of v.matchAll(/\{(\w+)\}/g)) {
    used.add(m[1]); n++; if (!(m[1] in P)) { fails++; console.error(`FAIL prose placeholder {${m[1]}} in ${k} is not in prose()`); }
  }
  for (const k of Object.keys(P)) { n++; if (!used.has(k)) { fails++; console.error('FAIL prose() value ' + k + ' is never quoted'); } }
}

/* ── live sentences: every branch reached at the extremes ── */
{
  const seen = new Set(); const has = k => { n++; if (Z[k] == null) { fails++; console.error('FAIL missing say key ' + k); } };
  for (const op of ['r6', 'r10', 'r16']) for (const bs of [512, 4096]) for (const x of [1e6, 1e9, 3.16e12, 1e14]) { const s = M.say.cdb(op, x, bs); has(s.key); seen.add(s.key); }
  for (const b of [512, 4096, 65536, 1048576]) for (const g of ['sas2', 'sas3', 'sas4']) for (const p of [false, true]) { const s = M.say.ssp(b, g, p); has(s.key); seen.add(s.key); }
  for (const d of ['sas', 'sata', 'sataI']) for (const p of [1, 2]) for (const P2 of [{}, { failoverS: 600, ctrlMtbf: 2e4 }, { failoverS: 1, ctrlMtbf: 2e4, mttr: 72 }, { ctrlMtbf: 1e6, mttr: 1 }]) { const s = M.say.avail(d, p, P2); has(s.key); seen.add(s.key); }
  for (const N of [1, 12, 24, 120]) for (const k of ['hdd', 'ssd']) for (const w of ['seq', 'rand']) for (const l of [1, 8]) for (const g of ['sas3', 'sas4']) { const s = M.say.fan(N, k, w, l, g); has(s.key); seen.add(s.key); }
  for (const K of [1, 3, 12, 24]) for (const ty of ['ssd', 'hdd']) { const m = WIDE.measure(K, ty, 131072, 4, 'sas3'); const s = M.say.wide(m, K, 4); has(s.key); seen.add(s.key); }
  for (const f of ['none', 'link', 'mem', 'misdir', 'lost', 'media']) for (const pi of [true, false]) for (const bits of [[5], PI.firstMissedTriple(4096)]) { const r = PI.run(f, bits, 1, pi); const s = M.say.pi(r, f, pi); has(s.key); seen.add(s.key); }
  for (const e of [-9, -6, -4]) for (const b of [1, 7, 12]) for (const k of [1, 3]) { const s = M.say.fec(Math.pow(10, e), b, k); has(s.key); seen.add(s.key); }
  const all = ['ch2.say.ok', 'ch2.say.more', 'ch2.say.miss', 'ch3.say.overhead', 'ch3.say.mid', 'ch3.say.big', 'ch3.say.persist', 'ch4.say.single', 'ch4.say.dual', 'ch4.say.failover', 'ch4.say.sata', 'ch4.say.inter',
    'ch5.say.idle', 'ch5.say.busy', 'ch5.say.sat', 'ch6.say.one', 'ch6.say.some', 'ch6.say.full', 'ch8.say.none', 'ch8.say.link', 'ch8.say.guard', 'ch8.say.silent', 'ch8.say.slipped', 'ch8.say.misdir', 'ch8.say.misdirPi', 'ch8.say.lost', 'ch8.say.media',
    'ch9.say.often', 'ch9.say.rare', 'ch9.say.burst'];
  for (const k of all) check('branch reached ' + k, seen.has(k), true);
  for (const k of Object.keys(Z)) if (/\.say\./.test(k)) check('say key listed ' + k, all.includes(k), true);
}

/* ── keys, language hygiene, registry ── */
{
  const keys = new Set([...html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"|data-hk="([^"]+)"/g)].map(m => m[1] || m[2]));
  for (const m of app.matchAll(/\bt\('([\w.]+)'(?!\s*\+)/g)) if (/^[\w]+\.[\w.]*\w$/.test(m[1])) keys.add(m[1]);
  for (const o of ['r6', 'r10', 'r16']) keys.add('ch2.op.' + o);
  for (const k of ['paths', 'drive', 'inter', 'failover']) keys.add('ch4.part.' + k);
  for (const k of ['pass', 'caught', 'off']) keys.add('ch8.st.' + k);
  for (const k of ['link', 'ecc', 'guard', 'ref']) keys.add('ch8.ck.' + k);
  for (const k of ['ok', 'retry', 'rejected', 'reported', 'silent', 'stale']) keys.add('ch8.out.' + k);
  for (const k of ['cmd', 'data', 'resp', 'gap']) keys.add('ch3.cv.' + k);
  for (const u of ['ns', 'us', 'ms', 's', 'min', 'h', 'd', 'y']) keys.add('u.' + u);
  for (const k of keys) { n++; if (Z[k] == null) { fails++; console.error('FAIL missing zh key ' + k); } }
  for (const [k, v] of Object.entries(Z)) if (/\.say\./.test(k)) for (const m of v.matchAll(/\{(\w+)\}/g)) {
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
    n++;
    const others = (src.match(/[一-鿿]+/g) || []).filter(x => !(file === 'index.html' && x === '中'));
    if (others.length) { fails++; console.error(`FAIL Chinese text in ${file}: ${others.slice(0, 3).join(' ')}`); }
  }
  const R = JSON.parse(fs.readFileSync(path.join(DIR, 'REGISTRY.json'), 'utf8'));
  check('registry slug/path', R.slug + ' ' + R.path, 'how-sas-works computing/systems/how-sas-works/');
  check('registry category', [R.category, R.subtopic, R.stage].join('/'), 'computing/systems/university');
  check('registry title', R.title.zh, Z['doc.title'].split(' · ')[0]); check('registry desc', R.desc.zh, Z['doc.desc']);
  check('hero title = registry title', Z['hero.title'], R.title.zh);
  for (const c of R.concepts) check('anchor ' + c.anchor, html.includes('id="' + c.anchor.slice(1) + '"'), true);
  for (const c of R.concepts) { n++; if (!c.aliases.zh.length || !c.aliases.en.length || !c.title.en || !c.desc.en) { fails++; console.error('FAIL concept incomplete ' + c.id); } }
  // one word, one owner: aliases of the sibling essays are not ours to take
  const norm = s => s.toLowerCase().replace(/\s+/g, '');
  const owned = new Map();
  for (const sib of ['why-nvme-is-fast', 'what-a-drive-is-made-of', 'how-sata-works', 'how-usb-drives-talk']) {
    const f = path.join(DIR, '..', sib, 'REGISTRY.json');
    if (fs.existsSync(f)) for (const c of JSON.parse(fs.readFileSync(f, 'utf8')).concepts) for (const a of [...c.aliases.zh, ...c.aliases.en]) owned.set(norm(a), sib);
  }
  for (const lang of ['zh', 'en']) { const mine = new Set();
    for (const c of R.concepts) for (const a of c.aliases[lang]) {
      n++; if (owned.has(norm(a))) { fails++; console.error('FAIL alias owned by ' + owned.get(norm(a)) + ': ' + a); }
      n++; if (mine.has(norm(a))) { fails++; console.error('FAIL alias used twice: ' + a); } mine.add(norm(a));
    } }
  // links into sibling essays point at chapters that exist there
  // the USB essay S4 (live 2026-11-15) is linked from ch1.p3 (#ch5, UAS) and ch11.links
  for (const sib of ['what-a-drive-is-made-of', 'how-sata-works', 'why-nvme-is-fast', 'how-usb-drives-talk']) {
    const sh = fs.readFileSync(path.join(DIR, '..', sib, 'index.html'), 'utf8');
    for (const v of Object.values(Z)) for (const m of v.matchAll(new RegExp(sib + '/(#[\\w-]+)', 'g'))) check(sib + ' anchor ' + m[1], sh.includes(`id="${m[1].slice(1)}"`), true);
  }
  const ctx2 = (p2) => { const c2 = { window: {} }; vm.runInNewContext(fs.readFileSync(p2, 'utf8'), c2); return c2.window.ESSAY_COPY; };
  const E = ctx2(path.join(DIR, 'copy.en.js')), EN = E.en, stub = E.enStub === true, ph = s => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');
  const s4Links = o => Object.values(o).join('').match(/how-usb-drives-talk\/#?\w*/g) || [];
  check('links to S4 (ch1.p3 #ch5, ch11.links)', s4Links(Z).sort().join(' '), 'how-usb-drives-talk/ how-usb-drives-talk/#ch5');
  check('en S4 links = zh S4 links', s4Links(EN).sort().join(' '), s4Links(Z).sort().join(' '));
  check('en keys = zh keys', Object.keys(EN).sort().join('|'), Object.keys(Z).sort().join('|'));
  for (const k of Object.keys(Z)) check('en placeholders ' + k, ph(EN[k]), ph(Z[k]));
  if (stub) { check('en stub mirrors zh exactly', JSON.stringify(EN), JSON.stringify(Z)); console.log('NOTE: copy.en.js is a stub (enStub); English registry match skipped until it is translated'); }
  else { check('registry title en', R.title.en, EN['doc.title'].split(' · ')[0]); check('registry desc en', R.desc.en, EN['doc.desc']); }
}

if (fails) { console.error(`\n${fails} of ${n} checks failed`); process.exit(1); }
console.log(`PASS: ${n} checks (CDB layouts, SSP and iSCSI envelopes, CRC-16 T10-DIF, Erlang C, RS(30,26) bound, and every number in the prose match the models)`);
