'use strict';
// Pins the page's models to the standards' own worked data (SATA 3.5a Table 88/89, Annex A CRC and scrambler,
// Annex A.3 example frame), pins every number the prose quotes (placeholders filled from prose(), literals checked
// against models.js), pins how far each conclusion moves when a tuned parameter is halved or doubled, and evaluates
// every live sentence branch at the extremes of its controls.
// Run: node computing/systems/how-sata-works/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const M = require(path.join(DIR, 'models.js'));
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;
const html = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(DIR, 'app.js'), 'utf8'), mod = fs.readFileSync(path.join(DIR, 'models.js'), 'utf8');
const { SPEC, UDMA, B8, LINK, DISK, POWER, PM, HDD, FRONTIER } = M;

let n = 0, fails = 0;
function check(name, got, want) { n++; if (got !== want) { fails++; console.error(`FAIL ${name}: model gives ${got}, expected ${want}`); } }
function says(key, phrase) { n++; if (!Z[key] || !Z[key].includes(phrase)) { fails++; console.error(`FAIL prose ${key} should contain "${phrase}"`); } }
const f = (x, d) => x.toFixed(d);
const H = x => (x >>> 0).toString(16).toUpperCase().padStart(8, '0');

/* ── 8b/10b against SATA 3.5a Table 88 (all 256 data bytes, both running disparities) and Table 89 ── */
const T88 = '1001110100/0110001011,0111010100/1000101011,1011010100/0100101011,1100011011/1100010100,1101010100/0010101011,1010011011/1010010100,0110011011/0110010100,1110001011/0001110100,1110010100/0001101011,1001011011/1001010100,0101011011/0101010100,1101001011/1101000100,0011011011/0011010100,1011001011/1011000100,0111001011/0111000100,0101110100/1010001011,0110110100/1001001011,1000111011/1000110100,0100111011/0100110100,1100101011/1100100100,0010111011/0010110100,1010101011/1010100100,0110101011/0110100100,1110100100/0001011011,1100110100/0011001011,1001101011/1001100100,0101101011/0101100100,1101100100/0010011011,0011101011/0011100100,1011100100/0100011011,0111100100/1000011011,1010110100/0101001011,1001111001/0110001001,0111011001/1000101001,1011011001/0100101001,1100011001/1100011001,1101011001/0010101001,1010011001/1010011001,0110011001/0110011001,1110001001/0001111001,1110011001/0001101001,1001011001/1001011001,0101011001/0101011001,1101001001/1101001001,0011011001/0011011001,1011001001/1011001001,0111001001/0111001001,0101111001/1010001001,0110111001/1001001001,1000111001/1000111001,0100111001/0100111001,1100101001/1100101001,0010111001/0010111001,1010101001/1010101001,0110101001/0110101001,1110101001/0001011001,1100111001/0011001001,1001101001/1001101001,0101101001/0101101001,1101101001/0010011001,0011101001/0011101001,1011101001/0100011001,0111101001/1000011001,1010111001/0101001001,1001110101/0110000101,0111010101/1000100101,1011010101/0100100101,1100010101/1100010101,1101010101/0010100101,1010010101/1010010101,0110010101/0110010101,1110000101/0001110101,1110010101/0001100101,1001010101/1001010101,0101010101/0101010101,1101000101/1101000101,0011010101/0011010101,1011000101/1011000101,0111000101/0111000101,0101110101/1010000101,0110110101/1001000101,1000110101/1000110101,0100110101/0100110101,1100100101/1100100101,0010110101/0010110101,1010100101/1010100101,0110100101/0110100101,1110100101/0001010101,1100110101/0011000101,1001100101/1001100101,0101100101/0101100101,1101100101/0010010101,0011100101/0011100101,1011100101/0100010101,0111100101/1000010101,1010110101/0101000101,1001110011/0110001100,0111010011/1000101100,1011010011/0100101100,1100011100/1100010011,1101010011/0010101100,1010011100/1010010011,0110011100/0110010011,1110001100/0001110011,1110010011/0001101100,1001011100/1001010011,0101011100/0101010011,1101001100/1101000011,0011011100/0011010011,1011001100/1011000011,0111001100/0111000011,0101110011/1010001100,0110110011/1001001100,1000111100/1000110011,0100111100/0100110011,1100101100/1100100011,0010111100/0010110011,1010101100/1010100011,0110101100/0110100011,1110100011/0001011100,1100110011/0011001100,1001101100/1001100011,0101101100/0101100011,1101100011/0010011100,0011101100/0011100011,1011100011/0100011100,0111100011/1000011100,1010110011/0101001100,1001110010/0110001101,0111010010/1000101101,1011010010/0100101101,1100011101/1100010010,1101010010/0010101101,1010011101/1010010010,0110011101/0110010010,1110001101/0001110010,1110010010/0001101101,1001011101/1001010010,0101011101/0101010010,1101001101/1101000010,0011011101/0011010010,1011001101/1011000010,0111001101/0111000010,0101110010/1010001101,0110110010/1001001101,1000111101/1000110010,0100111101/0100110010,1100101101/1100100010,0010111101/0010110010,1010101101/1010100010,0110101101/0110100010,1110100010/0001011101,1100110010/0011001101,1001101101/1001100010,0101101101/0101100010,1101100010/0010011101,0011101101/0011100010,1011100010/0100011101,0111100010/1000011101,1010110010/0101001101,1001111010/0110001010,0111011010/1000101010,1011011010/0100101010,1100011010/1100011010,1101011010/0010101010,1010011010/1010011010,0110011010/0110011010,1110001010/0001111010,1110011010/0001101010,1001011010/1001011010,0101011010/0101011010,1101001010/1101001010,0011011010/0011011010,1011001010/1011001010,0111001010/0111001010,0101111010/1010001010,0110111010/1001001010,1000111010/1000111010,0100111010/0100111010,1100101010/1100101010,0010111010/0010111010,1010101010/1010101010,0110101010/0110101010,1110101010/0001011010,1100111010/0011001010,1001101010/1001101010,0101101010/0101101010,1101101010/0010011010,0011101010/0011101010,1011101010/0100011010,0111101010/1000011010,1010111010/0101001010,1001110110/0110000110,0111010110/1000100110,1011010110/0100100110,1100010110/1100010110,1101010110/0010100110,1010010110/1010010110,0110010110/0110010110,1110000110/0001110110,1110010110/0001100110,1001010110/1001010110,0101010110/0101010110,1101000110/1101000110,0011010110/0011010110,1011000110/1011000110,0111000110/0111000110,0101110110/1010000110,0110110110/1001000110,1000110110/1000110110,0100110110/0100110110,1100100110/1100100110,0010110110/0010110110,1010100110/1010100110,0110100110/0110100110,1110100110/0001010110,1100110110/0011000110,1001100110/1001100110,0101100110/0101100110,1101100110/0010010110,0011100110/0011100110,1011100110/0100010110,0111100110/1000010110,1010110110/0101000110,1001110001/0110001110,0111010001/1000101110,1011010001/0100101110,1100011110/1100010001,1101010001/0010101110,1010011110/1010010001,0110011110/0110010001,1110001110/0001110001,1110010001/0001101110,1001011110/1001010001,0101011110/0101010001,1101001110/1101001000,0011011110/0011010001,1011001110/1011001000,0111001110/0111001000,0101110001/1010001110,0110110001/1001001110,1000110111/1000110001,0100110111/0100110001,1100101110/1100100001,0010110111/0010110001,1010101110/1010100001,0110101110/0110100001,1110100001/0001011110,1100110001/0011001110,1001101110/1001100001,0101101110/0101100001,1101100001/0010011110,0011101110/0011100001,1011100001/0100011110,0111100001/1000011110,1010110001/0101001110'.split(',').map(s => s.split('/'));
{
  check('Table 88 has 256 rows', T88.length, 256);
  let bad = 0;
  for (let b = 0; b < 256; b++) {
    if (B8.encode(b, -1).code !== T88[b][0]) { bad++; if (bad < 4) console.error('  D byte ' + b.toString(16) + ' RD-: ' + B8.encode(b, -1).code + ' vs ' + T88[b][0]); }
    if (B8.encode(b, 1).code !== T88[b][1]) { bad++; if (bad < 4) console.error('  D byte ' + b.toString(16) + ' RD+: ' + B8.encode(b, 1).code + ' vs ' + T88[b][1]); }
  }
  check('8b/10b encoder = Table 88 (512 entries)', bad, 0);
  check('K28.5 RD-', B8.encodeK(5, -1).code, '0011111010'); check('K28.5 RD+', B8.encodeK(5, 1).code, '1100000101');
  check('K28.3 RD-', B8.encodeK(3, -1).code, '0011110011'); check('K28.3 RD+', B8.encodeK(3, 1).code, '1100001100');
  // every code word is balanced or off by exactly ±2, and the disparity flips only on unbalanced words
  let rdBad = 0;
  for (let b = 0; b < 256; b++) for (const rd of [-1, 1]) {
    const e = B8.encode(b, rd), d = [...e.code].filter(c => c === '1').length * 2 - 10;
    if (!(d === 0 && e.rd === rd) && !(d === -2 * rd && e.rd === -rd)) rdBad++;
  }
  check('running disparity rule on all 512 words', rdBad, 0);
  // ch3.p3: "256 个字节两两组合全部试过，编码后最长的同值串是 5 位"
  let maxRun = 0;
  for (const rd0 of [-1, 1]) for (let a = 0; a < 256; a++) for (let b = 0; b < 256; b++) {
    const s = B8.stream([{ v: a }, { v: b }], rd0).map(x => x.code).join(''); const r = B8.stats(s).maxRun; if (r > maxRun) maxRun = r;
  }
  check('max run over all byte pairs', maxRun, 5); says('ch3.p3', '256 个字节两两组合全部试过，编码后最长的同值串是 5 位');
  // "随机两万个字节的累计摆动不超过 6"
  const r = M.rng(2026), bytes = Array.from({ length: 20000 }, () => Math.floor(r() * 256));
  const sw = B8.stats(B8.stream(bytes.map(v => ({ v })), -1).map(x => x.code).join('')).swing;
  check('swing of 20000 random bytes <= 6', sw <= 6, true); says('ch3.p3', '随机两万个字节的累计摆动不超过 6');
  // all-zero bytes: D0.0, longest run 3, period 20 bits; raw run 64
  const z = B8.stream(Array(8).fill({ v: 0 }), -1), zc = z.map(x => x.code).join('');
  check('D0.0 RD-', z[0].code, '1001110100'); check('zero max run', B8.stats(zc).maxRun, 3); check('raw zero run', B8.stats(B8.rawBits(Array(8).fill(0))).maxRun, 64);
  says('ch3.p3', 'D0.0（1001110100），最长只有 3 位不跳'); says('ch3.p3', '8 个字节是 64 位一动不动');
  check('zero period (10 bits per RD, 20 per pair)', B8.period(zc) % 10, 0); says('ch3.p4', '每 10 位就重复一次');
  // the comma never appears in data streams, only with K28.5
  let commaInData = 0; for (let a = 0; a < 256; a++) for (let b = 0; b < 256; b += 3) for (const rd0 of [-1, 1]) if (B8.commas(B8.stream([{ v: a }, { v: b }], rd0).map(x => x.code).join('')).length) commaInData++;
  check('no comma in any data pair', commaInData, 0); says('ch3.p4', '0011111（或反过来 1100000）');
  check('comma in K28.5', B8.commas(B8.encodeK(5, -1).code).length > 0, true);
  check('8b/10b rates', [1, 2, 3].map(g => f(LINK.rawMBps(g), 0)).join('/'), '150/300/600');
  check('Gen1 Tx swing', SPEC.txGen1.join('/'), '400/500/600'); says('ch3.p1', '400–600 毫伏（标称 500）');
  says('ch3.p2', '1983'); says('ch3.p2', '表 85、86'); says('ch3.p2', '表 88');
  says('ch3.p4', '16 位线性反馈移位寄存器（多项式 x¹⁶+x¹⁵+x¹³+x⁴+1，初值 FFFFh）');
  check('ALIGN spacing', SPEC.alignEvery + '/' + SPEC.alignPair, '256/2'); says('ch3.p4', '每发 256 个双字就要插一对 ALIGN');
  says('ch3.p3', '约 552 MB/s'); check('NVMe essay figure', HDD.nvmeQuote, 552);
}

/* ── CRC and scrambler against SATA 3.5a Annex A ── */
{
  const sample = [0x00308027, 0xE1234567, 0, 2, 0];
  const c = LINK.crc(sample);
  check('Annex A.1.5 CRC trace', c.trace.map(H).join(' '), '11E353FD 0F656DA7 3D14369C 92D0D681 319FFF6F');
  check('Annex A.1.5 CRC', H(c.crc), '319FFF6F');
  const A24 = 'C2D2768D 1F26B368 A508436C 3452D354 8A559502 BB1ABE1B FA56B73D 53F60B1B F0809C41 747FC34A BE865291 7A6FA7B6 3163E6D6 F036FE0C 1EF3EA29 EB342694 53853B17 E94ADC4D 5D200E88 6901EDD0 FA9E38DE 68DB4B07 450A437B 960DD708 3F35E698 FE7698A5 C80EF715 666090AF FAF0D5CB 2B82009F 0E317491 76F46A1E';
  check('Annex A.2.4 first 32 scrambler outputs', LINK.scrambler(32).map(H).join(' '), A24);
  // Annex A.3 example frame: scrambled dwords as transmitted
  const sc = LINK.scrambler(6), tx = sample.concat([c.crc]).map((x, i) => H(x ^ sc[i]));
  check('Annex A.3 transmitted dwords', tx.join(' '), 'C2E2F6AA FE05F60F A508436C 3452D356 8A559502 8A854174');
  check('CRC init / poly', H(SPEC.crcInit) + '/' + H(SPEC.crcPoly), '52325032/04C11DB7'); says('ch4.p4', '初值 52325032h'); says('ch4.p4', '附录 A.3');
}

/* ── ch4 FIS and wire account ── */
{
  const d = LINK.h2dRead(0x123456, 8, 5);
  check('H2D dword0 type/C/opcode/count', H(d[0]), '08608027'); check('H2D tag in COUNT 7:3', H(d[3]), '00000028');
  check('H2D LBA + device 40h', H(d[1]), '40123456'); check('H2D length', d.length, 5);
  says('ch4.p2', '类型 27h，5 个双字'); says('ch4.p2', '操作码 60h'); says('ch4.p2', '0–31 的<strong>标签</strong>');
  says('ch4.p2', '（34h）'); says('ch4.p2', '（41h）'); says('ch4.p2', '（46h），每个最多 8192 字节'); says('ch4.p2', '（A1h）'); says('ch4.p2', '32 位的 SActive');
  check('opcode', SPEC.readFpdma, 0x60); check('tags', SPEC.tags, 32); check('data FIS max bytes', SPEC.dataFisMaxDw * 4, 8192);
  const rf = LINK.readFrames(256); check('128 KiB data frames', rf.frames.filter(x => x.id === 'data').length, 16); says('ch4.p3', '拆成 16 个数据帧');
  check('4 KiB frames', LINK.readFrames(8).frames.length, 5); says('ch4.p3', '读一个 4 KiB：5 帧');
  check('round trip', SPEC.rtDw, 20); says('ch4.p3', '一个来回 20 个双字'); says('ch4.p3', 'ALIGN 每 256 个双字一对'); says('ch4.limit', '握手的 20 个双字');
  check('SSD sequential', HDD.ssdSeq, 560); says('ch4.p3', '560 MB/s（三星 870 EVO 数据表）'); says('ch4.p3', '约 552 MB/s');
  check('wire cap above the SSD figure', LINK.wire(256, 3).mbps > HDD.ssdSeq, true);
  for (const g of [1, 2, 3]) for (const s of [1, 8, 64, 256]) { const w = LINK.wire(s, g); n++; if (!(w.eff > 0 && w.eff < 1 && w.mbps < LINK.rawMBps(g))) { fails++; console.error('FAIL wire bounds', g, s); } }
}

/* ── ch2 Ultra DMA ── */
{
  check('UDMA6 cycle', UDMA.cyc[6], 13.0); says('ch2.p2', '13.0 纳秒'); says('ch2.p3', '一拍 13.0 纳秒'); says('ch2.p4', '从 13.0 缩到');
  check('UDMA6 t2', UDMA.t2[6], 30); says('ch2.p2', '每 30 纳秒送两个 16 位字');
  check('cable length', UDMA.cableIn, 18); says('ch2.p2', '18 英寸');
  check('UDMA2 cycle / settle', UDMA.cyc[2] + '/' + UDMA.settle40[2], '54/22'); says('ch2.p3', '54 纳秒一拍里要多等 22 纳秒');
  check('mode 6 closes', UDMA.budget(6, 80).ok, true); check('mode 6 fails above k6', UDMA.budget(6, 80, M.prose().k6[0] + 0.01).ok, false);
  check('mode 6 fastest at 1x', UDMA.fastest(80, 1), 6); check('above k4 only mode 3 left', UDMA.fastest(80, M.prose().k4[0] + 0.01), 3);
  check('40-conductor forbids mode 3', UDMA.budget(3, 40).allowed, false); says('ch2.p3', '第 3 档以上才有可能');
  check('Gen1 raw', SPEC.gens[0].gbps * 1000, 1500); says('ch2.p4', '一对线就是 1500 兆位');
  check('pins', [SPEC.signalPins, SPEC.gndPins, SPEC.powerPins].join('/'), '7/3/15'); says('ch2.p4', '7 针里另外 3 针是地'); says('ch1.r.ff.what', '7 针数据口 + 15 针电源口');
  check('internal cable', SPEC.cableInt, 1); says('ch2.p4', '长到 1 米');
  check('Gen1 payload beats UDMA6', UDMA.sataGen1Payload() > UDMA.mbps(6), true);
}

/* ── ch1, ch6, ch7, ch8, ch9 literals ── */
{
  check('AHCI 1.0 date', SPEC.ahci10, '2004-04-13'); says('ch1.p1', '2004 年 4 月 13 日发布了 1.0 版');
  check('AHCI slots/ports', SPEC.ahciSlots + '/' + SPEC.ahciPorts, '32/32'); says('ch1.r.hci.what', '最多 32 项的命令表，1 到 32 个端口');
  const rev = v => SPEC.revisions.find(r => r.v === v).date;
  check('3.5a date', rev('3.5a'), '2021-03-02'); says('ch9.e1', '2021 年 3 月 2 日批准'); check('3.5 date', rev('3.5'), '2020-07-01'); says('ch9.e1', '2020 年 7 月 1 日的 3.5 版');
  check('3.0 date', rev('3.0').slice(0, 7), '2009-06'); says('ch8.p1', '2009 年 6 月的 3.0 版');
  check('3.2 / 3.4 years', rev('3.2').slice(0, 4) + '/' + rev('3.4').slice(0, 4), '2013/2018'); says('ch8.p1', '3.2 版（2013），又在 3.4 版（2018）');
  check('2.5 year', rev('2.5').slice(0, 4), '2005'); says('ch9.e2', '2005 年的 2.5 版');
  check('1.0a', SPEC.sata10a + '/' + SPEC.sata10aGen3Plan + '/' + SPEC.sata10aRoadmapYears, '2003-01-07/2007/10'); says('ch8.p1', '2003 年的 SATA 1.0a'); says('ch8.p1', '「大约 10 年」'); says('ch8.p1', '2007 年年中');
  check('SATA Express', SPEC.satae + ' ' + SPEC.sataeGbps.join('/'), '2011-08-09 8/16'); says('ch8.p1', '2011 年 8 月 9 日'); says('ch8.p1', '目标 8 和 16 Gb/s');
  check('gens', SPEC.gens.map(g => f(g.gbps, 1)).join('/'), '1.5/3.0/6.0'); says('ch8.p1', '1.5、3.0、6.0 Gb/s'); says('ch9.e2', '1.5、3.0、6.0 Gb/s');
  check('OOB gaps', SPEC.oobGapNs.wake + '/' + SPEC.oobGapNs.init, '106.7/320'); says('ch6.p1', '106.7 纳秒或 320 纳秒');
  check('exits', [SPEC.exit.partial * 1e6, SPEC.exit.slumber * 1e3, SPEC.exit.devslp * 1e3, SPEC.mdat * 1e3].map(x => f(x, 0)).join('/'), '10/10/20/10');
  says('ch6.p1', '醒来不超过 10 微秒'); says('ch6.p1', '醒来不超过 10 毫秒'); says('ch6.p1', '醒来不超过 20 毫秒'); says('ch6.p1', '至少要保持 10 毫秒');
  check('DevSleep rev', SPEC.devslpRev + '/' + rev('3.2').slice(0, 4), '3.2/2013'); says('ch6.p1', '3.2 版，2013 年加入');
  check('870 EVO powers', f(POWER.P.slumber * 1000, 0) + '/' + f(POWER.P.devslp * 1000, 1) + '/' + f(POWER.ssdActiveW, 0), '30/2.5/2');
  says('ch6.p2', '空闲 30 毫瓦，DevSleep 2.5 毫瓦'); says('ch6.p2', '读写时约 2 瓦');
  const ratio = POWER.P.slumber / POWER.P.devslp; check('idle ratio 10–20x', ratio > 10 && ratio < 20, true); says('ch6.p2', '差十几倍');
  check('tuned powers', f(POWER.P.on * 1000, 0) + '/' + f(POWER.P.partial * 1000, 0), '150/60'); says('ch6.limit', '（150 毫瓦）'); says('ch6.limit', '（60 毫瓦）');
  check('Exos idle', POWER.hddIdleW, 6.9); says('ch6.p4', '6.9 瓦');
  // ch6.p3: best state at 1 ms mean idle is Partial; from 0.1 s DevSleep
  check('best at 1 ms', POWER.best(1e-3, 0), 'partial'); says('ch6.p3', '平均空闲 1 毫秒时最省的是 Partial');
  for (const m of [0.1, 0.3, 1, 10]) check('best at ' + m + ' s', POWER.best(m, 0), 'devslp');
  check('not DevSleep at 50 ms', POWER.best(0.05, 0) !== 'devslp', true); check('sleeping on short gaps costs energy', POWER.run('slumber', 1e-3, 0).save < 0, true); check('break-even is where Slumber at a fixed gap pays off', POWER.run('slumber', 1e-3, 0).W > POWER.P.on, true);
  check('chart clip', /YM = 300/.test(app), true); says('ch6.model.how', '超过 300 毫瓦的部分截掉了'); says('ch6.p3', '约 {xDS} 毫秒以上就轮到 DevSleep'); check('DevSleep beats Slumber just past xDS', POWER.best(M.prose().xDS[0] * 1.05e-3, 0), 'devslp'); check('Slumber beats DevSleep just below xDS', POWER.run('slumber', M.prose().xDS[0] * 0.95e-3, 0).W < POWER.run('devslp', M.prose().xDS[0] * 0.95e-3, 0).W, true);
  // reviewer additions (2026-11-14): spec quote for eSATA (3.5a Table 1 note 6), the 5-bit tag behind "why 32",
  // and the fastest UDMA mode just past each skew threshold quoted in ch2.p3
  says('ch7.r.esata.diff', '「eSATA 没有定义 Gen3i」'); check('tag bits', Math.log2(SPEC.tags), 5); says('ch5.p4', '标签只有 5 位'); says('ch5.p4', 'SActive 只有 32 位');
  { const Pz = M.prose(); check('fastest just above k6', UDMA.fastest(80, Pz.k6[0] + 0.005), 4); check('fastest just above k4', UDMA.fastest(80, Pz.k4[0] + 0.005), 3); check('fastest just below k4', UDMA.fastest(80, Pz.k4[0] - 0.005), 4); says('ch2.p3', '以上最快只剩第 3 档'); }
  check('PM ports / cables', SPEC.pmPorts + '/' + SPEC.cableExt + '/' + SPEC.cableInt, '15/2/1'); says('ch7.law', '15 块盘'); says('ch7.law', '2 米'); says('ch7.p1', '15 块盘');
  says('ch7.r.esata.diff', '线最长 2 米（机箱内 1 米）'); says('ch7.r.esata.diff', '3 Gb/s');
  check('mSATA / M.2 revs', SPEC.msataRev + rev('3.1').slice(0, 4) + '/' + SPEC.m2Rev + rev('3.2').slice(0, 4), '3.12011/3.22013');
  says('ch7.r.msata.diff', '3.1 版'); says('ch7.r.msata.diff', '2011'); says('ch7.r.m2.diff', '3.2 版（2013）');
  check('M.2 lanes', `B:${SPEC.m2.B.sata}/${SPEC.m2.B.pcie.join('/')} M:${SPEC.m2.M.sata}/${SPEC.m2.M.pcie.join('/')}`, 'B:1/1/2 M:1/1/2/4');
  says('ch7.r.m2.diff', 'B 键：1 条 SATA 或 2 条 PCIe；M 键：1 条 SATA 或 1/2/4 条 PCIe');
  check('Exos', [FRONTIER.exos.tb, FRONTIER.exos.mbps, FRONTIER.exos.iops, FRONTIER.exos.qd].join('/'), '32/285/170/16'); check('Exos rate = PM anchor', PM.exosMBps, FRONTIER.exos.mbps);
  says('ch9.d1', '7200 转，外圈 285 MB/s，4 KiB 随机读深度 16 下 170 次/秒'); says('ch5.p3', '深度 16 下是 170 次'); says('ch7.model.how', '285 MB/s'); says('ch8.model.how', '7200 转，外圈 285 MB/s'); says('ch8.p2', '285 MB/s');
  check('frontier', [FRONTIER.latestRev, FRONTIER.latestRevDate, FRONTIER.seagate44.tb, FRONTIER.seagate44.date, FRONTIER.wd40.tb, FRONTIER.wd40.quarterEnd].join(' '), '3.5a 2021-03-02 44 2026-03-03 40 2026-07-03');
  says('ch9.d2', '2026 年 3 月 3 日宣布，最大 44 TB'); says('ch9.d3', '2026 年 7 月 3 日'); says('ch9.d3', '40 TB');
  check('WD HBD', [FRONTIER.wdHbd.demo, FRONTIER.wdHbd.target, FRONTIER.wdHbd.targetYear].join('/'), '2/8/2030'); says('ch9.c2', '已演示 2 倍吞吐，目标 2030 年 8 倍');
  check('WD roadmap', [FRONTIER.wdHamr44, FRONTIER.wdRoadmap[60], FRONTIER.wdRoadmap[100], FRONTIER.wdDualPivotYear].join('/'), '2027 H1/2028/2029/2028');
  says('ch9.c1', '44 TB 的 HAMR 盘「按计划在 2027 年上半年」'); says('ch9.c1', '2028 年 60 TB、2029 年 100 TB'); says('ch9.c2', '目标 2028 年');
  says('ch6.p2', '（250 GB 和 500 GB）'); says('ch1.r.hci.who', '1.3.1');
  check('OCP', FRONTIER.ocpNvmeHdd.rev + ' ' + FRONTIER.ocpNvmeHdd.date, '1.0b 2023-04-20'); says('ch9.e3', '修订版 1.0b，2023 年 4 月 20 日');
  check('Seagate roadmap', [FRONTIER.seagateRoadmap.perDiskNow, FRONTIER.seagateRoadmap.perDiskGoal, FRONTIER.seagateRoadmap.driveGoal].join('/'), '4/10/100'); says('ch9.c3', '从 4 TB 多做到 10 TB，单盘到 100 TB');
  says('ch9.c2', '560 MB/s'); check('2x HBD beats 560', HDD.od(7200, 1, 2) > HDD.ssdSeq, true);
}

/* ── ch5 disk model: fit, published-figure anchors, tuned sensitivity ── */
{
  check('rpm / track-to-track / average', [DISK.rpm, DISK.tt, DISK.avg].join('/'), '7200/1/8.5'); says('ch5.p1', '7200 转每分钟'); says('ch5.p1', '平均 8.5 毫秒，相邻磁道 1.0 毫秒');
  const K = DISK.coef(); check('fitted mean seek', f(DISK.meanSeek(K), 2), '8.50'); check('track-to-track seek', f(DISK.seek(1e-9, K), 2), '1.00'); check('full-stroke seek', f(DISK.seek(1, K), 2), '16.00');
  check('seek continuous at x0', f(DISK.seek(K.x0 - 1e-9, K), 4), f(DISK.seek(K.x0, K), 4));
  check('tuned', [DISK.full, DISK.x0, DISK.ri].join('/'), '16/0.3/0.45'); says('ch5.limit', '全程寻道（16 毫秒）'); says('ch5.limit', '全程的 30%'); says('ch5.limit', '内外圈半径比（0.45）');
  says('ch5.limit', '12 或 20 毫秒'); says('ch5.limit', '15% 或 50%'); says('ch5.limit', '0.35 或 0.6');
  check('the tuned sweep in prose() is the one the limit names', /full: 12 \}, \{ full: 20 \}, \{ x0: 0\.15 \}, \{ x0: 0\.5 \}, \{ ri: 0\.35 \}, \{ ri: 0\.6/.test(mod), true);
  check('SLOW factor', /SLOW = 1 \/ 60/.test(app), true); says('ch5.model.how', '60 倍');
  const P = M.prose(); check('SATF beats FIFO by more than 2x at QD32', P.s32[0] / P.q1[0] > 2, true); says('ch10.q3', '差一倍多');
  check('SATF > SSTF > FIFO at 16', P.s16[0] > P.t16[0] && P.t16[0] > P.q1[0], true);
  check('p95 grows with depth', P.p32[0] > P.p1[0], true);
  // FIFO does not improve with depth
  const fq = DISK.simulate(16, 'fifo', 3000, 7).iops; check('FIFO flat in depth', Math.abs(fq - P.q1[0]) / P.q1[0] < 0.05, true); says('ch5.p3', '深度再大也还是 {q1}');
  // seed stability of the headline number
  const seeds = [1, 2, 3, 4, 5].map(s => DISK.simulate(16, 'satf', 3000, s).iops); check('QD16 SATF across seeds within ±3%', Math.max(...seeds) / Math.min(...seeds) < 1.06, true);
}

/* ── ch7 / ch8 ── */
{
  const P = M.prose();
  check('two Exos under the cap', P.two[0] < P.cap3[0] && P.two[0] === 2 * PM.exosMBps, true);
  check('CBS random below one full disk', P.cbs[0] < P.one[0], true); check('FBS 4 = 4 x one', Math.round(P.fbs4[0]), Math.round(4 * P.one[0]));
  check('PM one = ch5 QD8 SATF', P.one[0], P.s8[0]);
  check('3 Gb/s cap', f(LINK.wire(256, 2).mbps, 0), f(P.mb256[0] / 2, 0)); says('ch8.model.how', '3 Gb/s');
  check('need density', f(HDD.densToReach(560, 7200) * HDD.od(7200, 1) ** 2 / 560 ** 2, 3), '1.000');
  says('ch8.p2', '3–4 TB 做到 10 TB'); check('od10 uses 3 TB per platter', /HDD\.od\(7200, 10 \/ 3\)/.test(mod), true); check('15k rpm overshoots', P.od15[0] > 560, true);
  check('od10 below 560', P.od10[0] < 560, true); says('ch8.p2', '仍然够不着');
}

/* ── every prose placeholder is a prose() key; pinned values ── */
{
  const P = M.prose();
  const want = { u6: '133.3', u6used: '12.76', u6mar: '0.24', u5mar: '0.03', u2used40: '45.37', k6: '1.04', k4: '1.32', nosk: '6.1', wire: '66.7', lines: '1067', g1: '150',
    r1: '150', r2: '300', r3: '600', dw4: '1267', us4: '8.45', eff4: '81', eff1: '35', fr256: '20', eff256: '97', mb256: '580', rev: '8.33', half: '4.17',
    q1: '78', s8: '131', s16: '158', s32: '190', t16: '132', p32: '491', p1: '19', lo: '148', hi: '168', glo: '1.89', ghi: '2.14',
    bePartial: '16.7', beSlumber: '12.5', beDev: '20.3', dev1: '5.5', devSave1: '96', devLat1: '20', beSlo: '11.1', beShi: '16.7', bePlo: '12.5', bePhi: '50.0', xDS: '55', xDSlo: '27', xDShi: '109',
    two: '570', cap3: '580', cbs: '112', one: '131', fbs4: '526', need: '3.9', od10: '520', od15: '594', hbd2: '570' };
  for (const [k, [v, d, kind]] of Object.entries(P)) check('prose ' + k, kind === 'pct' ? f(v * 100, d) : f(v, d), want[k]);
  check('every prose value pinned', Object.keys(P).sort().join(','), Object.keys(want).sort().join(','));
  const used = new Set();
  for (const [k, v] of Object.entries(Z)) if (!/\.say\./.test(k) && /\.(p\d|law|limit|lead|sum|q\d|e\d|d\d|c\d)$/.test(k)) for (const m of v.matchAll(/\{(\w+)\}/g)) {
    used.add(m[1]); n++; if (!(m[1] in P)) { fails++; console.error(`FAIL prose placeholder {${m[1]}} in ${k} is not in prose()`); }
  }
  for (const k of Object.keys(P)) { n++; if (!used.has(k)) { fails++; console.error('FAIL prose() value ' + k + ' is never quoted'); } }
}

/* ── sentence branches at the extremes of each control ── */
{
  const has = k => { n++; if (Z[k] == null) { fails++; console.error('FAIL missing say key ' + k); } };
  const seen = new Set();
  for (const m of [0, 1, 2, 3, 4, 5, 6]) for (const cab of [40, 80]) for (const sc of [0.5, 1, 1.5, 2]) { const s = M.say.udma(m, cab, sc); has(s.key); seen.add(s.key); }
  for (const raw of [{ maxRun: 64, swing: 64 }, { maxRun: 3, swing: 2 }]) { const s = M.say.enc(raw, { maxRun: 3, swing: 2 }, 0, 0); has(s.key); seen.add(s.key); }
  for (const Q of [1, 32]) { const s = M.say.ncq(Q, { iops: 78, p95: 19 }, { iops: 120 }, { iops: 190, p95: 400 }); has(s.key); seen.add(s.key); }
  for (const st of ['on', 'partial', 'slumber', 'devslp']) for (const m of [1e-4, 1e-3, 1e-2, 0.1, 1, 10]) for (const tau of [0, 0.01, 1]) { const s = M.say.power(st, m, tau); has(s.key); seen.add(s.key); }
  for (const mode of ['cbs', 'fbs']) for (const work of ['seq', 'rand']) for (const N of [1, 15]) for (const g of [2, 3]) { const s = M.say.pm(N, mode, work, g, 8); has(s.key); seen.add(s.key); }
  for (const rpm of [5400, 7200, 10000, 15000]) for (const d of [1, 4]) for (const h of [1, 2]) { const s = M.say.hdd(rpm, d, h); has(s.key); seen.add(s.key); }
  const all = ['ch2.say.ok', 'ch2.say.tight', 'ch2.say.fail', 'ch2.say.forbid', 'ch3.say.long', 'ch3.say.short', 'ch5.say.q1', 'ch5.say.q', 'ch6.say.on', 'ch6.say.loss', 'ch6.say.best', 'ch6.say.other',
    'ch7.say.seqCbs', 'ch7.say.seqCap', 'ch7.say.seqFbs', 'ch7.say.randCbs', 'ch7.say.randFbs', 'ch8.say.over', 'ch8.say.under'];
  for (const k of all) check('branch reached ' + k, seen.has(k), true);
}

/* ── keys, language hygiene, registry ── */
{
  const keys = new Set([...html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)].map(m => m[1]));
  for (const m of app.matchAll(/\bt\('([\w.]+)'(?!\s*\+)/g)) if (/^[\w]+\.[\w.]*\w$/.test(m[1])) keys.add(m[1]);
  for (const id of ['h2d', 'd2h', 'seek', 'dmas', 'data', 'sdb']) { keys.add('ch4.cv.' + id); if (id !== 'seek') keys.add('ch4.step.' + id); }
  for (let i = 0; i < 4; i++) keys.add('ch4.hex.f' + i);
  for (const s of ['on', 'partial', 'slumber', 'devslp']) keys.add('ch6.st.' + s);
  for (const g of [2, 3]) keys.add('ch7.link.' + g);
  for (const u of ['ns', 'us', 'ms', 's']) keys.add('u.' + u);
  for (const k of keys) { n++; if (Z[k] == null) { fails++; console.error('FAIL missing zh key ' + k); } }
  // the say sentences' placeholders are supplied by app.js
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
  check('registry slug/path', R.slug + ' ' + R.path, 'how-sata-works computing/systems/how-sata-works/');
  check('registry category', [R.category, R.subtopic, R.stage].join('/'), 'computing/systems/university');
  check('registry title', R.title.zh, Z['doc.title'].split(' · ')[0]); check('registry desc', R.desc.zh, Z['doc.desc']);
  check('hero title = registry title', Z['hero.title'], R.title.zh);
  for (const c of R.concepts) check('anchor ' + c.anchor, html.includes('id="' + c.anchor.slice(1) + '"'), true);
  for (const c of R.concepts) { n++; if (!c.aliases.zh.length || !c.aliases.en.length || !c.title.en || !c.desc.en) { fails++; console.error('FAIL concept incomplete ' + c.id); } }
  // one word, one owner: the NVMe essay's aliases (and the TASK file's list) are not ours to take
  const norm = s => s.toLowerCase().replace(/\s+/g, '');
  const owned = new Set(['NVMe 为什么快', 'NVMe 和 SATA 区别', 'NVMe vs SATA', 'AHCI 协议瓶颈', 'AHCI overhead', 'SATA III 速度上限', '队列深度 QD 是什么', 'queue depth', 'AHCI 32 queue depth limit', '写放大', 'write amplification', 'TRIM', 'Trim'].map(norm));
  const nv = path.join(DIR, '..', 'why-nvme-is-fast', 'REGISTRY.json');
  if (fs.existsSync(nv)) for (const c of JSON.parse(fs.readFileSync(nv, 'utf8')).concepts) for (const a of [...c.aliases.zh, ...c.aliases.en]) owned.add(norm(a));
  for (const c of R.concepts) for (const a of [...c.aliases.zh, ...c.aliases.en]) { n++; if (owned.has(norm(a))) { fails++; console.error('FAIL alias owned by the NVMe essay: ' + a); } }
  // the sibling essay S1 is live (2026-11-14): its links must point at chapters that exist there, in both languages
  const s1 = fs.readFileSync(path.join(DIR, '..', 'what-a-drive-is-made-of', 'index.html'), 'utf8');
  const s1Links = v => [...v.matchAll(/what-a-drive-is-made-of\/(#ch\d+)?/g)];
  n++; if (s1Links(Object.values(Z).join('')).length < 7) { fails++; console.error('FAIL expected links to S1 in ch1.p2, ch1.p3, ch5.p1, ch10.links'); }
  for (const v of Object.values(Z)) for (const m of s1Links(v)) if (m[1]) check('S1 anchor ' + m[1], s1.includes(`id="${m[1].slice(1)}"`), true);
  // the SAS essay S3 is live (2026-11-14): ch1.limit and ch10.links point at it; anchors must exist there
  const s3 = fs.readFileSync(path.join(DIR, '..', 'how-sas-works', 'index.html'), 'utf8');
  const s3Links = v => [...v.matchAll(/how-sas-works\/(#ch\d+)?/g)];
  check('links to S3 (ch1.limit, ch10.links)', s3Links(Object.values(Z).join('')).length, 2);
  for (const v of Object.values(Z)) for (const m of s3Links(v)) if (m[1]) check('S3 anchor ' + m[1], s3.includes(`id="${m[1].slice(1)}"`), true);

  const ectx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.en.js'), 'utf8'), ectx);
  const EN = ectx.window.ESSAY_COPY.en, stub = ectx.window.ESSAY_COPY.enStub === true, ph = s => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');
  check('en keys = zh keys', Object.keys(EN).sort().join('|'), Object.keys(Z).sort().join('|'));
  check('en S1 links = zh S1 links', s1Links(Object.values(EN).join('')).map(m => m[0]).sort().join(' '), s1Links(Object.values(Z).join('')).map(m => m[0]).sort().join(' '));
  check('en S3 links = zh S3 links', s3Links(Object.values(EN).join('')).map(m => m[0]).sort().join(' '), s3Links(Object.values(Z).join('')).map(m => m[0]).sort().join(' '));
  for (const k of Object.keys(Z)) check('en placeholders ' + k, ph(EN[k]), ph(Z[k]));
  if (stub) { check('en stub mirrors zh exactly', JSON.stringify(EN), JSON.stringify(Z)); console.log('NOTE: copy.en.js is a stub (enStub); English registry match skipped until it is translated'); }
  else { check('registry title en', R.title.en, EN['doc.title'].split(' · ')[0]); check('registry desc en', R.desc.en, EN['doc.desc']); }
}

if (fails) { console.error(`\n${fails} of ${n} checks failed`); process.exit(1); }
console.log(`PASS: ${n} checks (spec tables, Annex A examples, and every number in the prose match the models)`);
