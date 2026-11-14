'use strict';
// Pins the page's models to the standards' own tables (USB 2.0 Table 5-10, USB 3.2 Table 7-14, BOT 1.0 Tables 5.1/5.2,
// the SBC READ(10)/READ(16) layouts), checks each named result against an independent closed form, pins every number
// the prose quotes (placeholders filled from prose(), literals checked against models.js), pins how far each
// conclusion moves when a tuned parameter is halved or doubled, and evaluates every live sentence branch.
// Run: node computing/systems/how-usb-drives-talk/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const M = require(path.join(DIR, 'models.js'));
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;
const html = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(DIR, 'app.js'), 'utf8');
const { SPEC, USB2, MODES, LABELS, LINE, Q, WRAP, CHAIN, HEAT, STICK, FRONTIER } = M;

let n = 0, fails = 0;
function check(name, got, want) { n++; if (got !== want) { fails++; console.error(`FAIL ${name}: model gives ${got}, expected ${want}`); } }
function near(name, got, want, tol) { n++; if (!(Math.abs(got - want) <= tol)) { fails++; console.error(`FAIL ${name}: ${got} not within ${tol} of ${want}`); } }
function says(key, phrase) { n++; if (!Z[key] || !Z[key].includes(phrase)) { fails++; console.error(`FAIL prose ${key} should contain "${phrase}"`); } }
const f = (x, d) => x.toFixed(d);
const zf = (x, d) => M.fmt(x, d, 'zh');

/* ── 02 USB 2.0 Table 5-10, every row ── */
{
  check('7,500 bytes per microframe', USB2.perMicroframe(), 7500);
  for (const [p, nT, rem, useful] of SPEC.usb2.table510) {
    const r = USB2.pack(p);
    check(`Table 5-10 payload ${p}: transfers`, r.n, nT); check(`Table 5-10 payload ${p}: remaining`, r.remaining, rem); check(`Table 5-10 payload ${p}: useful`, r.useful, useful);
    check(`Table 5-10 payload ${p}: bytes/s`, r.bps, useful * 8000);
  }
  check('max bulk = 53,248,000 B/s', USB2.pack(512).bps, SPEC.usb2.maxBps);
  says('ch2.p2', '55 个字节'); check('overhead 55', SPEC.usb2.overhead, 55); says('ch2.p1', '125 微秒'); says('ch2.law', '125 微秒');
  says('ch2.model.how', zf(7500, 0) + ' 字节');
}

/* ── 03 names, encodings, packets, negotiation ── */
{
  check('Gen1 raw = spec 500 MB/s', LINE.rawMBps('g1x1'), SPEC.usb3.g1Raw);
  near('Gen2 raw ≈ spec 1.2 GB/s', LINE.rawMBps('g2x1'), SPEC.usb3.g2Raw, 15);
  check('Gen1 packet 1024/1056', f(LINE.packetEff('g1x1'), 6), f(1024 / 1056, 6));
  check('Gen2 packet 1024/1060', f(LINE.packetEff('g2x1'), 6), f(1024 / 1060, 6));
  check('framed below raw, above spec (Gen1)', LINE.framedMBps('g1x1') < 500 && LINE.framedMBps('g1x1') > SPEC.usb3.g1Eff, true);
  check('Gen2x2 effective = 2 × Gen2 (spec: doubled)', MODES.g2x2.eff, 2 * SPEC.usb3.g2Eff); check('Gen1x2 = 2 × Gen1', MODES.g1x2.eff, 2 * SPEC.usb3.g1Eff);
  check('USB4 Gen 4 lane = 25.6 GBd × 11/7', f(MODES.u4g4.gbps, 4), f(25.6 * 11 / 7, 4));
  check('marketing names', ['g1x1', 'g2x1', 'g1x2', 'g2x2', 'u4g2', 'u4g3', 'u4g4'].map(m => LINE.marketGbps(m)).join(','), '5,10,10,20,20,40,80');
  check('USB 3.0 / 3.1 Gen 1 / 3.2 Gen 1 / USB 5Gbps are one mode', ['usb30', 'usb31g1', 'usb32g1', 'usb5'].map(id => LABELS.find(x => x[0] === id)[1]).join(), 'g1x1,g1x1,g1x1,g1x1');
  // USB 3.2 Table 7-14, typed independently (rows DFP, columns UFP: g1x1 g1x2 g2x1 g2x2)
  const T714 = { g1x1: ['g1x1', 'g1x1', 'g1x1', 'g1x1'], g1x2: ['g1x1', 'g1x2', 'g1x1', 'g1x2'], g2x1: ['g1x1', 'g1x1', 'g2x1', 'g2x1'], g2x2: ['g1x1', 'g1x2', 'g2x1', 'g2x2'] };
  const cols = ['g1x1', 'g1x2', 'g2x1', 'g2x2'];
  for (const d of cols) cols.forEach((u, i) => check(`Table 7-14 ${d}/${u}`, LINE.negotiate(d, u), T714[d][i]));
  // the dates and names quoted in ch3
  const ymd = s => { const [y, m, d] = s.split('-').map(Number); return `${y} 年 ${m} 月 ${d} 日`; };
  for (const k of ['usb30', 'usb31', 'usb32']) says('ch3.p1', ymd(SPEC.usb3.dates[k]));
  says('ch3.p1', '2024 年 1 月'); check('naming guide date', SPEC.namingGuide, '2024-01');
  for (const nm of ['USB 5Gbps', 'USB 10Gbps', 'USB 20Gbps', 'USB 40Gbps', 'USB 80Gbps']) says('ch3.p1', nm);
  says('ch3.p3', '「500 MB/sec」'); says('ch3.p3', '「450 MB/sec 或更少」'); says('ch3.p3', '约 1.2 GB/s'); says('ch3.p3', '约 1.1 GB/s');
  says('ch3.p3', '1,024 字节数据配 32 字节开销'); check('Gen1 overhead 32', SPEC.usb3.hdrG1 + SPEC.usb3.dppStart + SPEC.usb3.dppEnd + SPEC.usb3.crc32, 32);
  says('ch3.p3', '24 字节包头'); check('Gen2 header 24', SPEC.usb3.hdrG2, 24);
  says('ch3.p4', '每秒 256 亿个符号'); check('25.6 GBd', SPEC.usb4.gen4Baud, 25.6); says('ch3.p4', '每 7 个符号装 11 位');
}

/* ── 04 CBW / CSW bytes against BOT 1.0 Tables 5.1 / 5.2 and SBC CDB layouts ── */
{
  const H = a => WRAP.hex(a).join(' ');
  const c10 = WRAP.cbw(0x2A, 0x12345678, 0x0100, 'read10');
  check('CBW is 31 bytes', c10.bytes.length, SPEC.bot.cbwBytes); check('CSW is 13 bytes', WRAP.csw(1).length, SPEC.bot.cswBytes);
  check('CBW signature "USBC" little endian', H(c10.bytes.slice(0, 4)), '55 53 42 43'); check('CSW signature "USBS"', H(WRAP.csw(1).slice(0, 4)), '55 53 42 53');
  check('USBC in ASCII', String.fromCharCode(...c10.bytes.slice(0, 4)), 'USBC'); check('USBS in ASCII', String.fromCharCode(...WRAP.csw(1).slice(0, 4)), 'USBS');
  check('tag LE at 4..7', H(c10.bytes.slice(4, 8)), '2A 00 00 00');
  check('dCBWDataTransferLength LE = 256 × 512', H(c10.bytes.slice(8, 12)), '00 00 02 00');
  check('bmCBWFlags data-in', c10.bytes[12], 0x80); check('bCBWCBLength 10', c10.bytes[14], 10);
  check('READ(10) CDB', H(c10.cdb), '28 00 12 34 56 78 00 01 00 00');
  check('CDB starts at offset 15', H(c10.bytes.slice(15, 25)), H(c10.cdb)); check('unused CB bytes zero', c10.bytes.slice(25).every(x => x === 0), true);
  const c16 = WRAP.cbw(1, 0x123456789A, 8, 'read16');
  check('READ(16) CDB', H(c16.cdb), '88 00 00 00 00 12 34 56 78 9A 00 00 00 08 00 00'); check('READ(16) CB length 16', c16.bytes[14], 16);
  check('READ(10) LBA limit 2^32−1', WRAP.maxLba('read10'), 4294967295); says('ch4.say.over', '4,294,967,295');
  check('opcodes match scsi_proto.h', [SPEC.scsi.read10, SPEC.scsi.read16, SPEC.scsi.unmap, SPEC.scsi.ata16].map(x => x.toString(16)).join(), '28,88,42,85');
  says('ch4.p1', '31 字节'); says('ch4.p1', '13 字节'); says('ch4.p1', '最长 16 字节'); check('max CB 16', SPEC.bot.maxCb, 16);
  says('ch4.p1', '1999 年 9 月 31 日'); check('BOT printed date', SPEC.bot.datePrinted, 'September 31, 1999');
  says('ch4.p3', '55 53 42 43'); says('ch4.p3', '55 53 42 53');
  says('ch2.say.max', '每秒 8,000 格');
}

/* ── 04/05 the closed-queue bound ── */
{
  const L = 1100, D = 7250;
  for (const S of [4096, 65536, 1048576]) {
    const b = Q.bot(S, L, D);
    near('BOT = S/(tCmd + tMedia + S/L) at ' + S, b.X, S / (Q.tCmd + Q.tMedia + S / L), 1e-9);
    check('UAS N=1 equals BOT at ' + S, f(Q.uas(S, L, D, 1).X, 9), f(b.X, 9));
    check('UAS never above the link at ' + S, Q.uas(S, L, D, 64).X <= L + 1e-9, true);
    check('UAS monotone in N at ' + S, [1, 2, 4, 8, 16, 32].map(k => Q.uas(S, L, D, k).X).every((x, i, a) => !i || x >= a[i - 1] - 1e-9), true);
  }
  near('90% size closed form', Q.bot(Q.sizeFor(0.9, L, D), L, D).X / L, 0.9, 1e-9);
  near('knee: N* reaches the pipe', Q.uas(131072, L, D, Q.knee(131072, L, D)).X, L, 1e-6);
  check('drive slower than link: drive limits', Q.uas(1048576, 2200, 560, 32).lim, 'drive');
  says('ch4.p5', '约 20%'); says('ch4.p5', '约 250 MB/s'); check('UASP preface figures', [SPEC.uasp.botOverheadPct, SPEC.uasp.botMBps].join(), '20,250');
  says('ch5.p3', '超过 400 MB/s'); check('UASP > 400', SPEC.uasp.uasMBps, 400);
  says('ch4.limit', '固定往返 50 微秒'); says('ch4.limit', '闪存首字节等待 50 微秒'); check('tuned tCmd/tMedia', [Q.tCmd, Q.tMedia].join(), '50,50');
  says('ch5.limit', '每条命令 4 微秒'); check('tuned tCpu', Q.tCpu, 4);
  says('ch5.p1', '2009 年 6 月 24 日'); check('UASP date', SPEC.uasp.date, '2009-06-24');
  says('ch5.p1', '65,533'); check('streams', SPEC.usb3.streamsMax, 65533);
  says('ch5.p4', '最多申请 256 个流'); says('ch5.p4', '退回 32'); check('linux uas', [SPEC.linuxUas.maxCmnds, SPEC.linuxUas.noStreamsQd].join(), '256,32');
  says('ch4.p4', '约 1,100 MB/s'); check('Gen2 effective', SPEC.usb3.g2Eff, 1100);
}

/* ── 06/08 chain ── */
{
  const r = CHAIN.usb({ drive: 'sata', bridge: 'p3x2' }); check('SATA drive on a PCIe bridge does not fit', r.fits, false);
  check('JMS586A case: 20 Gb/s box with PCIe 3.0 x2 is bridge-limited', CHAIN.usb({ box: 'g2x2', host: 'g2x2', bridge: 'p3x2' }).neck, 'bridge');
  check('20 Gb/s box on 10 Gb/s port falls back to Gen 2x1', CHAIN.usb({ box: 'g2x2', host: 'g2x1', bridge: 'p3x4' }).mode, 'g2x1');
  check('briefs: JMS586A is Gen2x2 to PCIe 3.0 x2', SPEC.bridges.jms586a.usb + ' ' + SPEC.bridges.jms586a.pcie.join('x'), 'g2x2 3x2');
  check('PCIe 3.0 lane = 8 GT/s × 128/130 / 8', f(CHAIN.pcieLane(3), 4), f(8000 * 128 / 130 / 8, 4));
  near('PCIe 3.0 x1 = SD Express 7.0 985 MB/s', CHAIN.pcieLane(3), SPEC.sd.ex7, 0.5); near('PCIe 4.0 x2 = SD Express 8.0 3,940 MB/s', CHAIN.pcieLane(4) * 2, SPEC.sd.ex8, 2);
  says('ch6.p5', '985 MB/s');
  check('TB5 tunnel above the PCIe 4.0 x4 bridge', CHAIN.tunnel({ host: 'tb5' }).neck, 'bridge'); check('TB4 tunnel-limited', CHAIN.tunnel({ host: 'tb4' }).neck, 'tunnel');
  check('USB4 without PCIe tunnel = 10 Gb/s USB path', CHAIN.tunnel({ host: 'usb4np' }).X, CHAIN.usb({ box: 'g2x1', host: 'g2x1', bridge: 'p4x4' }).X);
  says('ch6.limit', '取 0.85'); check('eta', CHAIN.eta, 0.85); says('ch6.limit', '每条 1 MiB、UASP 下同时 4 条'); check('S,N', [CHAIN.S, CHAIN.N].join(), '1048576,4');
  says('ch6.limit', '5 Gb/s 450、10 Gb/s 1,100、20 Gb/s 2,200 MB/s');
  says('hero.sub', zf(SPEC.nvmeSeq, 0) + ' MB/s'); says('ch6.p4', zf(SPEC.nvmeSeq, 0) + ' MB/s'); says('ch8.model.how', zf(SPEC.nvmeSeq, 0) + ' MB/s');
  says('ch8.p2', '雷电 4 是 PCIe 32 Gb/s'); says('ch8.p2', '雷电 5 是 PCIe 64 Gb/s'); check('TB PCIe', [SPEC.tb.tb4Pcie, SPEC.tb.tb5Pcie].join(), '32,64');
  says('ch8.p3', '0.80 到 0.92'); says('ch8.say.nopcie', '10 Gb/s'); check('TB USB3 tunnel', SPEC.tb.tb4Usb3, 10);
  says('ch6.p1', 'ANSI INCITS 431-2007'); check('SAT std', SPEC.satStd, 'ANSI INCITS 431-2007');
}

/* ── 07 heat: the simulation against the closed forms ── */
{
  for (const box of ['g2x1', 'g2x2', 'tb5']) for (const sh of ['al', 'plastic']) for (const Ta of [15, 25, 40]) {
    const rate = HEAT.rate(box), R = HEAT.Rbox[sh], s = HEAT.sim(rate, R, Ta), ts = HEAT.tStar(rate, R, Ta);
    if (isFinite(ts) && ts < HEAT.dur) near(`first throttle = closed form t* (${box}, ${sh}, ${Ta})`, s.tFirst, ts, 0.5);
    else check(`no throttle when t* beyond the run (${box}, ${sh}, ${Ta})`, s.tFirst, null);
    if (s.tFirst == null) near(`no-throttle end temperature follows the exponential (${box}, ${sh}, ${Ta})`, s.Tend, HEAT.steady(rate, R, Ta) - (HEAT.steady(rate, R, Ta) - Ta) * Math.exp(-HEAT.dur / (R * HEAT.C)), 0.2);
  }
  check('slower link, cooler drive', HEAT.steady(HEAT.rate('g2x1'), 14, 25) < HEAT.steady(HEAT.rate('g2x2'), 14, 25), true);
  says('ch7.p1', '0–70 °C'); says('ch7.p1', '5.5 W'); check('sheet', [SPEC.nvmeOpMax, SPEC.nvmeReadW].join(), '70,5.5');
  says('ch7.limit', '金属 6、塑料 14 K/W'); says('ch7.limit', '热容 25 J/K'); says('ch7.limit', '芯片 1 W'); says('ch7.limit', '1.5 W'); says('ch7.limit', '跑 30%'); says('ch7.limit', '回差 5 °C');
  check('tuned heat', [HEAT.Rbox.al, HEAT.Rbox.plastic, HEAT.C, HEAT.Pb, HEAT.P0, HEAT.f, HEAT.hyst, HEAT.thr].join(), '6,14,25,1,1.5,0.3,5,70');
}

/* ── 09 stick ── */
{
  check('per-die figure from the paper title', SPEC.die.tlcWriteMBps, 194); says('ch9.p1', '194 MB/s 写入吞吐'); says('ch9.p2', '一颗 194 MB/s');
  check('SD bus maxima', [SPEC.sd.uhs1, SPEC.sd.uhs2, SPEC.sd.ex7, SPEC.sd.ex8].join(), '104,312,985,3940');
  for (const s of ['104 MB/s', '312 MB/s', '985 MB/s', '3,940 MB/s']) says('ch9.p3', s);
  check('stick bus uses the ch4 model', STICK.bus('u5bot'), Q.bot(131072, SPEC.usb3.g1Eff, 1e9).X);
}

/* ── frontier and literal dates ── */
{
  says('ch10.e1', '2022 年 10 月 18 日'); check('USB4 v2 date', FRONTIER.usb4v2, '2022-10-18');
  says('ch10.e1', '2025 年 11 月 19 日'); check('USB4 build', FRONTIER.usb4Build, '2025-11-19');
  says('ch10.e2', '2022 年 6 月的 1.1 版'); check('USB 3.2 r1.1', FRONTIER.usb32Latest, '2022-06');
  says('ch10.e3', '3,940 MB/s'); says('ch10.e3', '2023 年 9 月'); check('TB5 brief', FRONTIER.tb5, '2023-09');
  says('ch10.title', '2026 年 11 月'); check('as of', FRONTIER.asOf, '2026-11');
}

/* ── every prose placeholder is a prose() key; pinned values ── */
{
  const P = M.prose();
  const want = { mf: '7500', u2n: '13', u2left: '129', u2max: '53.2', u2eff: '88.7', u2n64: '63', u2mb64: '32.3', u2raw: '60',
    g1raw: '500', g1fr: '485', g2raw: '1212', g2fr: '1171', g22raw: '2424', g1share: '72', g2share: '88', g1pe: '97.0', g2pe: '96.6', u4g3raw: '38.8', u4g4lane: '40.23',
    b4: '39.5', b4iops: '9641', b128: '598', b1m: '996', b90: '967', b64g1: '267', b4h: '52.0', b4d: '26.6', b90h: '725', b90d: '1450',
    u4q32: '1024', u4q32k: '250', u4q8: '316', u128q4: '1100', knee128: '1.8', knee4: '28', cpuH: '2048', cpuD: '512', linQd: '254',
    c10: '1100', c20: '2200', c20x2: '1674', c20on10: '1100', c10bot: '996', cSata: '560', p3x2: '1674', p3x4: '3348', lane3: '984.6',
    Pfull: '6.5', P10: '3.1', T10p: '68', T20p: '77', T5p: '112', T5a: '62', ts5p: '256', avg5p: '3343', avg20p: '1861', avg10p: '1100', avg5a: '6695',
    tau: '5.8', T20lo: '51', T20hi: '129', ts20p: '11.7', ts20h: '5.9', ts20d: '23.4', durMin: '15',
    t4: '3400', t5: '6695', tnp: '1100', t4lo: '3200', t4hi: '3680', rep34: '2800', rep5lo: '5400', rep5hi: '6650', tunRaw4: '4000',
    st1: '194', st2: '335', stu2: '51', stBus: '335', stDies: '1.7' };
  for (const [k, [v, d, kind]] of Object.entries(P)) check('prose ' + k, kind === 'pct' ? f(v * 100, d) : f(v, d), want[k]);
  check('every prose value pinned', Object.keys(P).sort().join(','), Object.keys(want).sort().join(','));
  const used = new Set();
  for (const [k, v] of Object.entries(Z)) if (!/\.say\./.test(k) && /\.(p\d|law|limit|lead|sum|q\d|e\d|d\d|c\d)$/.test(k)) for (const m of v.matchAll(/\{(\w+)\}/g)) {
    used.add(m[1]); n++; if (!(m[1] in P)) { fails++; console.error(`FAIL prose placeholder {${m[1]}} in ${k} is not in prose()`); }
  }
  for (const k of Object.keys(P)) { n++; if (!used.has(k)) { fails++; console.error('FAIL prose() value ' + k + ' is never quoted'); } }
  // other keys rendered with data-i18n-html may only use prose() placeholders too
  for (const m of html.matchAll(/data-i18n-html="([^"]+)"/g)) { const v = Z[m[1]] || ''; for (const p of v.matchAll(/\{(\w+)\}/g)) { n++; if (!(p[1] in P)) { fails++; console.error(`FAIL {${p[1]}} in ${m[1]} is not filled on the page`); } } }
  // the claims the prose makes about the models
  check('ch4: 4 KiB far below the link', P.b4[0] < 0.05 * 1100, true); check('ch5: UAS QD32 at 4 KiB is chip-bound', Q.uas(4096, 1100, 7250, 32).lim, 'cpu');
  check('ch7: 10 Gb/s plastic does not throttle', HEAT.sim(HEAT.rate('g2x1'), 14, 25).tFirst, null); check('ch7: TB5 aluminium does not throttle', HEAT.sim(HEAT.rate('tb5'), 6, 25).tFirst, null);
  check('ch8: model above the reported TB3/4 figure', P.t4lo[0] > FRONTIER.tb34Reported, true);
  // review 2026-11-14: claims added by the independent reviewer
  check('ch8.p4: tunnel vs no-tunnel is a factor of three', Math.round(P.t4[0] / P.tnp[0]), 3); says('ch8.p4', '差三倍');
  check('ch7.limit: heat capacity does not move the equilibrium', [12.5, 25, 50, 100].every(C => HEAT.sim(HEAT.rate('g2x2'), 14, 25, { C, dur: 20000 }).tFirst != null) && HEAT.steady(HEAT.rate('g2x2'), 14, 25) > HEAT.thr, true);
  check('ch7.limit: doubled C does not throttle within the run', HEAT.sim(HEAT.rate('g2x2'), 14, 25, { C: 50 }).tFirst, null);
  near('ch7.limit: halved C throttles at the closed form', HEAT.sim(HEAT.rate('g2x2'), 14, 25, { C: 12.5 }).tFirst / 60, P.ts20h[0], 0.01);
  check('ch5.limit: halved tCpu, QD32 4 KiB becomes link-bound', Q.uas(4096, 1100, 7250, 32, { tCpu: Q.tCpu / 2 }).lim, 'link');
  check('ch7.p4: a 15-minute copy at 20 Gb/s in plastic throttles', HEAT.sim(HEAT.rate('g2x2'), 14, 25).tFirst != null, true);
  check('ch11.sum: Gen 1 effective share is 450 / 625', P.g1share[0], 450 / 625);
  check('ch9: one die is flash-bound, two are bus-bound', STICK.write(1, 194, 'u5bot').neck + ' ' + STICK.write(2, 194, 'u5bot').neck, 'flash bus');
}

/* ── sentence branches at the extremes of each control ── */
{
  const has = k => { n++; if (Z[k] == null) { fails++; console.error('FAIL missing say key ' + k); } };
  const seen = new Set(), add = s => { has(s.key); seen.add(s.key); };
  for (let i = 0; i <= 9; i++) add(M.say.usb2(Math.pow(2, i)));
  for (const [id] of LABELS) add(M.say.label(id));
  for (const L of [53.248, 450, 1100, 2200]) for (let e = 12; e <= 22; e += 0.5) for (const tc of [10, 50, 200]) add(M.say.bot(Math.round(Math.pow(2, e)), L, 7250, tc));
  for (const L of [450, 1100, 2200]) for (let e = 12; e <= 22; e += 0.5) for (const N of [1, 2, 4, 8, 16, 32]) add(M.say.uas(Math.round(Math.pow(2, e)), L, 7250, N));
  const U = ['g1x1', 'g2x1', 'g2x2'];
  for (const drive of ['sata', 'nvme']) for (const bridge of ['sata', 'p3x2', 'p3x4']) for (const box of U) for (const host of U) for (const proto of ['bot', 'uas']) add(M.say.chain({ drive, bridge, box, host, proto }));
  for (const box of ['g2x1', 'g2x2', 'tb5']) for (const sh of ['al', 'plastic']) for (const Ta of [15, 40]) add(M.say.heat(box, sh, Ta));
  for (const h of ['usb4np', 'tb4', 'tb5']) add(M.say.tunnel(h));
  for (const d of [1, 2, 4]) for (const w of [20, 194]) for (const b of ['u2bot', 'u5bot', 'u5uas', 'uhs1', 'uhs2', 'ex7']) add(M.say.stick(d, w, b));
  const all = ['ch2.say.max', 'ch2.say.mid', 'ch2.say.small', 'ch3.say.usb2', 'ch3.say.usb3', 'ch3.say.usb10', 'ch3.say.g1x2', 'ch3.say.usb4',
    'ch4.say.wait', 'ch4.say.mid', 'ch4.say.full', 'ch5.say.q1', 'ch5.say.lat', 'ch5.say.link', 'ch5.say.cpu',
    'ch6.say.nofit', 'ch6.say.usb', 'ch6.say.bridge', 'ch6.say.drive', 'ch6.say.fallback', 'ch7.say.cool', 'ch7.say.throttle',
    'ch8.say.nopcie', 'ch8.say.tunnel', 'ch8.say.bridge', 'ch9.say.flash', 'ch9.say.bus'];
  for (const k of all) check('branch reached ' + k, seen.has(k), true);
  // ch4.say.fit / ch4.say.over describe the hex wrapper (chosen by WRAP.maxLba, checked above), not a throughput branch
  for (const L of [0, 31, 32, 40]) { const k = Math.pow(2, L) - 1 > WRAP.maxLba('read10') ? 'ch4.say.over' : 'ch4.say.fit'; has(k); all.push(k); }
  for (const k of Object.keys(Z)) if (/\.say\./.test(k)) check('say key is a branch ' + k, all.includes(k), true);
}

/* ── keys, language hygiene, registry, siblings ── */
{
  const keys = new Set([...html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)].map(m => m[1]));
  for (const m of app.matchAll(/\bt\('([\w.]+)'(?!\s*\+)/g)) if (/^[\w]+\.[\w.]*\w$/.test(m[1])) keys.add(m[1]);
  for (const m of Object.keys(M.MODES)) { keys.add('ch3.mode.' + m); keys.add('ch3.enc.' + m); }
  for (const s of ['drive', 'bridge', 'usb', 'tunnel']) keys.add('ch6.st.' + s);
  for (const o of ['read10', 'read16']) keys.add('ch4.op.' + o);
  for (const u of ['us', 'ms', 's', 'min']) keys.add('u.' + u);
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
      src = src.replace(/<details class="page-provenance"[\s\S]*?<\/details>/, '');   // the bilingual label the registrar adds later
    }
    src = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '').replace(/<!--[\s\S]*?-->/g, '');
    n++;
    const others = (src.match(/[一-鿿]+/g) || []).filter(x => !(file === 'index.html' && x === '中'));
    if (others.length) { fails++; console.error(`FAIL Chinese text in ${file}: ${others.slice(0, 3).join(' ')}`); }
  }
  const R = JSON.parse(fs.readFileSync(path.join(DIR, 'REGISTRY.json'), 'utf8'));
  check('registry slug/path', R.slug + ' ' + R.path, 'how-usb-drives-talk computing/systems/how-usb-drives-talk/');
  check('registry category', [R.category, R.subtopic, R.stage].join('/'), 'computing/systems/university');
  check('registry title', R.title.zh, Z['doc.title'].split(' · ')[0]); check('registry desc', R.desc.zh, Z['doc.desc']);
  check('hero title = registry title', Z['hero.title'], R.title.zh);
  for (const c of R.concepts) check('anchor ' + c.anchor, html.includes('id="' + c.anchor.slice(1) + '"'), true);
  for (const c of R.concepts) { n++; if (!c.aliases.zh.length || !c.aliases.en.length || !c.title.en || !c.desc.en) { fails++; console.error('FAIL concept incomplete ' + c.id); } }
  check('one concept per chapter', R.concepts.map(c => c.anchor).join(), Array.from({ length: 11 }, (_, i) => '#ch' + (i + 1)).join());
  // one word, one owner: the four sibling essays' aliases and the TASK file's list are not ours to take
  const norm = s => s.toLowerCase().replace(/\s+/g, '');
  const owned = new Map();
  for (const a of ['NVMe 为什么快', 'NVMe 和 SATA 区别', 'NVMe vs SATA', 'AHCI 协议瓶颈', 'AHCI overhead', 'NVMe vs AHCI', 'SATA III 速度上限', '队列深度 QD 是什么', 'queue depth',
    'NVMe 64K 队列', 'AHCI 32 queue depth limit', 'write amplification', '写放大', 'TRIM', 'Trim']) owned.set(norm(a), 'TASK');
  for (const sib of ['why-nvme-is-fast', 'what-a-drive-is-made-of', 'how-sata-works', 'how-sas-works', 'storage-over-a-network']) {
    const p = path.join(DIR, '..', sib, 'REGISTRY.json');
    if (fs.existsSync(p)) for (const c of JSON.parse(fs.readFileSync(p, 'utf8')).concepts) for (const a of [...c.aliases.zh, ...c.aliases.en]) owned.set(norm(a), sib);
  }
  for (const c of R.concepts) for (const a of [...c.aliases.zh, ...c.aliases.en]) { n++; if (owned.has(norm(a))) { fails++; console.error(`FAIL alias owned by ${owned.get(norm(a))}: ${a}`); } }
  // live sibling links must point at chapters that exist; S3 (how-sas-works) is live since 2026-11-14 and is
  // linked from ch6.p1 and ch11.links (its chapter 2, the CDB), the same in zh and en; S5 (storage-over-a-network,
  // live 2026-11-15) is linked from ch6.p1 and ch11.links (its chapter 3, iSCSI)
  const all = Object.values(Z).join('');
  for (const sib of ['what-a-drive-is-made-of', 'how-sata-works', 'why-nvme-is-fast', 'how-sas-works', 'storage-over-a-network']) {
    const sh = fs.readFileSync(path.join(DIR, '..', sib, 'index.html'), 'utf8');
    for (const m of all.matchAll(new RegExp(sib + '/(#ch\\d+)?', 'g'))) if (m[1]) check(`${sib} anchor ${m[1]}`, sh.includes(`id="${m[1].slice(1)}"`), true);
  }
  const sasLinks = v => v.match(/how-sas-works\/#?\w*/g) || [];
  check('ch6.p1 links S3 #ch2', sasLinks(Z['ch6.p1']).join(), 'how-sas-works/#ch2');
  check('ch11.links links S3 #ch2', sasLinks(Z['ch11.links']).join(), 'how-sas-works/#ch2');
  check('links to S3 (ch6.p1, ch11.links)', sasLinks(all).length, 2);
  const netLinks = v => v.match(/storage-over-a-network\/#?\w*/g) || [];
  check('ch6.p1 links S5 #ch3', netLinks(Z['ch6.p1']).join(), 'storage-over-a-network/#ch3');
  check('ch11.links links S5 #ch3', netLinks(Z['ch11.links']).join(), 'storage-over-a-network/#ch3');
  check('links to S5 (ch6.p1, ch11.links)', netLinks(all).length, 2);
  const sas = JSON.parse(fs.readFileSync(path.join(DIR, '..', 'how-sas-works', 'REGISTRY.json'), 'utf8'));
  says('ch6.p1', '《' + sas.title.zh + '》'); says('ch11.links', '《' + sas.title.zh + '》');
  for (const k of ['ch1.p2', 'ch6.p2', 'ch5.p2', 'ch9.p1', 'ch11.links']) { n++; if (!/href=/.test(Z[k])) { fails++; console.error('FAIL expected a sibling link in ' + k); } }

  const ectx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.en.js'), 'utf8'), ectx);
  const EN = ectx.window.ESSAY_COPY.en, stub = ectx.window.ESSAY_COPY.enStub === true, ph = s => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');
  check('en S5 links = zh S5 links', (Object.values(EN).join('').match(/storage-over-a-network\/#?\w*/g) || []).sort().join(' '), (all.match(/storage-over-a-network\/#?\w*/g) || []).sort().join(' '));
  check('en S3 links = zh S3 links', (Object.values(EN).join('').match(/how-sas-works\/#?\w*/g) || []).sort().join(' '), (all.match(/how-sas-works\/#?\w*/g) || []).sort().join(' '));
  check('en keys = zh keys', Object.keys(EN).sort().join('|'), Object.keys(Z).sort().join('|'));
  for (const k of Object.keys(Z)) check('en placeholders ' + k, ph(EN[k]), ph(Z[k]));
  if (stub) { check('en stub mirrors zh exactly', JSON.stringify(EN), JSON.stringify(Z)); console.log('NOTE: copy.en.js is a stub (enStub); English registry match skipped until it is translated'); }
  else { check('registry title en', R.title.en, EN['doc.title'].split(' · ')[0]); check('registry desc en', R.desc.en, EN['doc.desc']); }
}

if (fails) { console.error(`\n${fails} of ${n} checks failed`); process.exit(1); }
console.log(`PASS: ${n} checks (USB 2.0 Table 5-10, USB 3.2 Table 7-14, BOT wrappers, closed forms, and every number in the prose match the models)`);
