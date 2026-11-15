'use strict';
// Pins the page's models to the documents' own tables and examples (Type-C R2.5 Tables 3-4 and 4-36, USB4 2.0 Table 5-2
// and the Appendix A HEC examples, the Connection Manager Guide's Table 6-3 and worked examples, USB PD r3.3 Tables
// 3.1/3.3/3.6, VESA's published fits), checks named results against independent closed forms, pins every number the
// prose quotes (placeholders from prose(), literals against models.js), pins how far each conclusion moves when a
// tuned parameter is halved or doubled, and evaluates every live sentence branch.
// Run: node computing/systems/how-thunderbolt-works/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const M = require(path.join(DIR, 'models.js'));
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;
const html = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(DIR, 'app.js'), 'utf8');
const { SPEC, CC, PKT, ALLOC, VIDEO, LANES, SHARE, CHAIN, SCREEN, PD, IOMMU, FRONTIER } = M;

let n = 0, fails = 0;
function check(name, got, want) { n++; if (got !== want) { fails++; console.error(`FAIL ${name}: model gives ${got}, expected ${want}`); } }
function near(name, got, want, tol) { n++; if (!(Math.abs(got - want) <= tol)) { fails++; console.error(`FAIL ${name}: ${got} not within ${tol} of ${want}`); } }
function says(key, phrase) { n++; if (!Z[key] || !Z[key].includes(phrase)) { fails++; console.error(`FAIL prose ${key} should contain "${phrase}"`); } }
const f = (x, d) => x.toFixed(d);
const zf = (x, d) => M.fmt(x, d, 'zh');

/* ── 01 Type-C: Table 3-4 typed independently; CC divider against Table 4-36 ── */
{
  const T34 = 'A1 GND,A2 TX1+,A3 TX1−,A4 VBUS,A5 CC1,A6 D+,A7 D−,A8 SBU1,A9 VBUS,A10 RX2−,A11 RX2+,A12 GND,' +
    'B1 GND,B2 TX2+,B3 TX2−,B4 VBUS,B5 CC2,B6 D+,B7 D−,B8 SBU2,B9 VBUS,B10 RX1−,B11 RX1+,B12 GND';
  check('Table 3-4, all 24 pins', SPEC.pins.map(p => p[0] + ' ' + p[1]).join(), T34);
  // B12 faces A1 in the receptacle, so turning the plug 180° puts the contact that met Ai onto Bi: the same-numbered
  // pins must carry corresponding functions (TX1↔TX2, RX1↔RX2, CC1↔CC2, SBU1↔SBU2; VBUS, GND, D± unchanged)
  const sw = s => s.replace(/1/, '#').replace(/2/, '1').replace('#', '2');
  for (let i = 1; i <= 12; i++) {
    const a = SPEC.pins[i - 1][1], b = SPEC.pins[12 + i - 1][1];
    check(`rotation A${i} → B${i}`, /TX|RX|CC|SBU/.test(a) ? sw(a) : a, b);
  }
  says('ch1.dgPin.cap', 'B12 正对 A1');
  const W = SPEC.cc.win;
  check('nominal Rp 56k in default window', CC.classify(CC.v('usb')), 'usb'); check('nominal 22k in 1.5 A window', CC.classify(CC.v('a15')), 'a15'); check('nominal 10k in 3 A window', CC.classify(CC.v('a30')), 'a30');
  for (const k of ['usb', 'a15', 'a30']) for (const c of ['lo', 'hi']) check(`${k} ${c} corner stays in its window`, CC.classify(CC.v(k, c)), k);
  check('3 A high corner = Table 4-36 max 2.042 V', f(CC.v('a30', 'hi'), 3), '2.042'); check('default high corner = 0.612 V', f(CC.v('usb', 'hi'), 3), '0.612');
  check('1.5 A high corner = 1.164 V', f(CC.v('a15', 'hi'), 3), '1.164');
  check('windows', JSON.stringify(W), JSON.stringify({ usb: [0.277, 0.612], a15: [0.746, 1.164], a30: [1.369, 2.042] }));
  check('flip uses TX2/RX2 and CC2', CC.attach('a30', true, false).pairs.join() + CC.attach('a30', true, false).ccPin, 'TX2,RX2CC2');
  check('Ra below every window when emarked (detected as Ra, not a sink)', CC.attach('a30', false, true).otherV < W.a30[0], true);
  says('ch1.p2', 'Rd = 5.1 kΩ'); check('Rd', SPEC.cc.rd, 5.1);
  for (const r of ['56 kΩ', '22 kΩ', '10 kΩ', '4.75–5.5 V']) says('ch1.p3', r);
  check('Rp values', [SPEC.cc.rp.usb.k, SPEC.cc.rp.a15.k, SPEC.cc.rp.a30.k, SPEC.cc.pull.join('–')].join(), '56,22,10,4.75–5.5');
  says('ch1.p4', '0.8–1.2 kΩ'); check('Ra', SPEC.cc.ra.join('–'), '0.8–1.2');
}

/* ── 02 the header: Appendix A, Table 5-2, single-bit correction ── */
{
  for (const [b3, b2, b1, hec] of SPEC.usb4.hecExamples) check(`Appendix A ${[b3, b2, b1].map(M.hex2).join(' ')}`, M.hex2(PKT.hec(b3, b2, b1)), M.hex2(hec));
  const h = PKT.header(0xF, 127, 0, false);
  check('PDF in bits 31:28, HopID 22:16, Length 15:8', f(PKT.word(h) >>> 8, 0), f((0xF << 20) | (127 << 8) | 0, 0));
  check('Length 256 encodes as 00h', PKT.lengthField(256), 0);
  // every one of the 32 single-bit errors has a distinct non-zero syndrome and is corrected, on many headers
  let bad = 0;
  for (const [pdf, hop, len] of [[1, 8, 0], [0xF, 127, 255], [2, 33, 64], [8, 99, 5]]) {
    const w = PKT.word(PKT.header(pdf, hop, len)), syn = new Set();
    for (let b = 0; b < 32; b++) { const r = (w ^ (1 << b)) >>> 0, s = PKT.syndrome(r), c = PKT.correct(r); syn.add(s); if (!s || c.bit !== b || c.w !== w) bad++; }
    check(`32 distinct syndromes (PDF ${pdf})`, syn.size, 32);
  }
  check('every single-bit error corrected', bad, 0);
  check('payload padded to 4', [1, 2, 3, 4, 5, 255, 256].map(x => PKT.pad(x)).join(), '3,2,1,0,3,1,0');
  check('HopID 7 bits', SPEC.usb4.hopBits, 7); says('ch2.p2', '4 位协议定义字段'); says('ch2.p2', '7 位 HopID'); says('ch2.p2', '8 位 Length');
  says('ch2.p3', '07h'); says('ch2.p3', '00h'); says('ch2.p3', '55h'); check('HEC params', [SPEC.usb4.hec.poly, SPEC.usb4.hec.init, SPEC.usb4.hec.xorOut].map(M.hex2).join(), '07,00,55');
  says('ch2.p3', '三个算好的例子'); check('three examples', SPEC.usb4.hecExamples.length, 3);
}

/* ── 03 the Connection Manager Guide ── */
{
  const r = ALLOC.cm(80, [{ id: 'dp', kind: 'dp', iso: 36 }, { id: 'x', kind: 'usb3x', iso: 10 }, { id: 't1', kind: 'usb3t', iso: 5 }, { id: 't2', kind: 'usb3t', iso: 5 }, { id: 'p', kind: 'pcie', iso: 0 }]);
  check('guide 80 G example: totals', r.paths.filter(p => p.kind !== 'dp').map(p => f(p.total, 1)).join(), '14.0,9.0,9.0,4.0');
  check('guide 80 G example: weights 14/9/9/4', r.paths.filter(p => p.kind !== 'dp').map(p => p.weight).join(), SPEC.cm.ex80.weights.join());
  // Table 6-3: DP bandwidth = rate × lanes × 0.8
  for (const [rate, row] of Object.entries(SPEC.cm.table63)) [4, 2, 1].forEach((l, i) => check(`Table 6-3 ${rate} ×${l}`, f(ALLOC.dpBw(rate, l), 2), f(row[i], 2)));
  const s = SCREEN.run({ conn: 'tb4', mode: 'uhd60', count: 2, method: 'maxlink' });
  check('guide 40 G example: first DP', s.rows[0].res, SPEC.cm.ex40.first); check('guide 40 G example: second DP', f(s.rows[1].res, 2), f(SPEC.cm.ex40.second, 2));
  check('second is HBR2 ×2', s.rows[1].cfg.rate + s.rows[1].cfg.lanes, 'HBR22');
  says('ch3.p1', '10% 的余量'); says('ch3.p1', '90%'); says('ch3.p1', '1.5 Gb/s'); check('guard and min bulk', SPEC.cm.guard + ' ' + SPEC.cm.minBulk, '0.1 1.5');
  says('ch3.p2', '权重 1 到 15'); check('weight max', SPEC.usb4.weightMax, 15);
  says('ch3.p3', '32 Gb/s'); check('TB4 PCIe', SPEC.tb.tb4.pcie, 32); says('ch3.limit', '64 Gb/s'); check('TB5 PCIe', SPEC.tb.tb5.pcie, 64);
  // WRR is work-conserving and respects ceilings
  const w = ALLOC.wrr(30, [{ id: 'a', w: 1, cap: 5 }, { id: 'b', w: 1, cap: 100 }]);
  check('WRR gives the leftover of a capped flow to the other', f(w.a, 3) + ' ' + f(w.b, 3), '5.000 25.000');
}

/* ── 04 chain depth ── */
{
  check('USB4 depth 5', SPEC.usb4.depthUsb4, 5); check('TBT3 depth 6', SPEC.usb4.depthTbt3, 6);
  says('ch4.law', '最多 5 层'); says('ch4.law', '6 层'); says('dg5.note', '第 5 层'); says('dg5.note', '第 6 层');
  check('chain of 7 in USB4 mode keeps 5', CHAIN.run({ n: 7 }).live, 5);
  check('first link carries the sum', f(CHAIN.run({ n: 4 }).links[0].load, 6), f(CHAIN.run({ n: 4 }).pcieTotal, 6));
  says('ch4.p3', '每跳 1 微秒'); check('tHop TUNED 1 µs', CHAIN.tHop, 1); says('ch4.p3', '约 50 微秒'); check('tFlash 50', CHAIN.tFlash, 50);
  says('ch4.p4', '4 个雷电口');
}

/* ── 05 lanes ── */
{
  check('TBT3 20.625 × 128/132 = 20 exactly', f(SPEC.usb4.tbt3g3 * 128 / 132, 9), '20.000000000'); check('TBT3 10.3125 × 64/66 = 10', f(SPEC.usb4.tbt3g2 * 64 / 66, 9), '10.000000000');
  check('Gen 4 lane = 25.6 × 11/7', f(LANES.modes.g4.rate, 6), f(25.6 * 11 / 7, 6));
  check('3^7 ≥ 2^11', Math.pow(3, 7) >= Math.pow(2, 11), true); says('ch5.p2', '2,187'); says('ch5.p2', '2,048'); says('ch5.p2', '25.6 GBd');
  check('RS(198,194) efficiency = 128/132', f(192 / 198, 9), f(128 / 132, 9));
  check('asym 3/1 lanes', LANES.modes.g4asym.lanes.join(), '3,1'); check('CM raw Table 6-2', JSON.stringify(SPEC.cm.raw), JSON.stringify({ g2x1: [10, 10], g2x2: [20, 20], g3x1: [20, 20], g3x2: [40, 40], g4: [80, 80], g4asym: [120, 40] }));
  check('PAM2 eye 0 dB', LANES.eye(2).db, 0); says('ch5.p3', '约 0.63'); check('TB5 brief PAM3 baud', SPEC.tb.pam3.baud, 0.63);
  says('ch5.p1', '20.625 Gb/s'); says('ch5.p5', '0.8 米'); check('Gen 3 passive cable', SPEC.cables.g3, 0.8);
}

/* ── 06 video timing and the VESA fits ── */
{
  const c = VIDEO.cvt(3840, 2160, 60);
  check('CVT-RB2 4K60 totals', c.hTot + '×' + c.vTot, '3920×2222'); check('CVT-RB2 4K60 clock', f(c.pclk / 1e6, 2), '522.61');
  check('VESA: 4K60 24 bpp fits HBR3 ×2', VIDEO.need('uhd60', 24) <= SPEC.dp.hbr3x2, true);
  check('VESA: 4K60 does not fit HBR2 ×2 (8.64)', VIDEO.need('uhd60', 24) > 8.64, true);
  check('VESA: 5K60 24 bpp fits HBR3 ×4', VIDEO.need('k5_60', 24) <= SPEC.dp.hbr3x4, true); check('5K60 needs more than 2 lanes', VIDEO.need('k5_60', 24) > SPEC.dp.hbr3x2, true);
  check('VESA DP 2.0: three 4K90 30 bpp ≤ 77.37', 3 * VIDEO.cvt(3840, 2160, 90).pclk * 30 / 1e9 <= SPEC.dp.payload21, true);
  check('8K60 30 bpp exceeds HBR3 ×4 (needs DSC)', VIDEO.need('k8_60', 30) > SPEC.dp.hbr3x4, true);
  for (const x of ['25.92', '12.96', '77.37']) says('ch6.p2', x);
  says('ch6.p1', '80 个消隐'); says('ch6.p1', '460 微秒'); check('CVT constants', SPEC.cvt.hBlank + ' ' + SPEC.cvt.minVblankUs, '80 460');
  says('ch6.p4', '可分 72'); check('TB5 available', f(0.9 * 80, 0), '72'); says('ch6.p4', '108'); check('TB5 boost available', f(0.9 * 120, 0), '108');
  says('ch6.p3', '可分 36'); check('TB4 available', f(0.9 * 40, 0), '36');
}

/* ── 07 PD tables ── */
{
  const row = (pdp, a) => PD.sprPdos(pdp, a).map(([v, i]) => v + 'V' + i).join(' ');
  check('Table 3.1 15 W', row(15, 3), '5V3'); check('Table 3.1 27 W', row(27, 3), '5V3 9V3'); check('Table 3.1 45 W', row(45, 3), '5V3 9V3 15V3');
  check('Table 3.1 60 W', row(60, 3), '5V3 9V3 15V3 20V3'); check('Table 3.1 100 W, 5 A cable', row(100, 5), '5V3 9V3 15V3 20V5');
  check('Table 3.1 20 W', row(20, 3), '5V3 9V2.22');
  check('Table 3.3 example (65 W present, 5 A cable)', row(65, 5), '5V3 9V3 15V3 20V3.25');
  check('3 A cable caps PDP at 60 W', PD.present(100, 'c3'), 60); check('non-EPR cable caps at 100 W', Math.min(PD.present(240, 'c3'), 100), 60);
  check('Table 3.6 EPR 140', PD.eprPdos(140).map(([v, a]) => v + 'V' + a).join(' '), '28V5'); check('Table 3.6 EPR 180', PD.eprPdos(180).map(([v, a]) => v + 'V' + a).join(' '), '28V5 36V5');
  check('Table 3.6 EPR 240', PD.eprPdos(240).map(([v, a]) => v + 'V' + a).join(' '), '28V5 36V5 48V5');
  check('EPR sequence', PD.run(140, 'c5', 140, true).msgs.join(), 'src_caps,request,accept,ps_rdy,epr_enter,epr_ack,cable_id,epr_ok,epr_caps,epr_request,accept,ps_rdy');
  check('EPR needs an EPR cable', PD.run(240, 'c3', 240, true).eprUsed, false);
  says('ch7.p1', '300 kbps'); says('ch7.p1', '64 位前导码'); check('BMC', SPEC.pd.bitKbps, 300);
  says('ch7.law', '3 A 的线最多 60 W'); says('ch7.law', '最多 100 W'); check('caps', SPEC.pd.cap3A + ' ' + SPEC.pd.capNonEpr, '60 100');
  for (const v of ['28 V', '36 V', '48 V', '240 W']) says('ch7.p3', v); says('ch7.p3', '50 V / 5 A'); check('EPR cable', SPEC.pd.eprCable.v + '/' + SPEC.pd.eprCable.a, '50/5');
  says('ch7.p5', '100 W'); says('ch7.p5', '140 W'); says('ch7.p5', '240 W'); says('ch7.p5', '15 W');
  check('TB4/TB5 charging figures', [SPEC.tb.tb4.charge, SPEC.tb.tb5.charge, SPEC.tb.tb5.chargeMax, SPEC.tb.tb5.acc].join(), '100,140,240,15');
}

/* ── 08 IOMMU: simulation against the occupancy formula ── */
{
  for (const [s, N] of [[1536, 64], [512, 32], [1024, 128], [2048, 8]]) {
    let sum = 0; const K = 400; for (let i = 1; i <= K; i++) sum += IOMMU.layout(s, N, i * 7919).pages.size;
    near(`mean mapped pages ${s} B × ${N} vs closed form`, sum / K, IOMMU.expectedPages(s, N), 0.6);
  }
  check('4 KiB buffers expose nothing', IOMMU.run(4096, 64, 'iommu').exposed, 0); check('bounce exposes nothing', IOMMU.run(1536, 64, 'bounce').exposed, 0);
  says('ch8.p2', '4,096 字节'); check('page', SPEC.sec.page, 4096); says('ch8.p4', '七个漏洞'); check('Thunderspy vulnerabilities', SPEC.sec.thunderspyN, 7);
  says('ch8.p1', 'NDSS 2019'); says('ch8.p4', '2011 到 2020 年'); says('ch8.p3', '64 个 1,536 字节'); says('ch8.p3', '64 页'); check('pool', IOMMU.poolPages, 64);
}

/* ── 09 / 10 dates and requirement strings ── */
{
  says('ch9.p1', '2019 年 3 月 4 日'); check('donation', SPEC.history.donation, '2019-03-04');
  says('ch9.p1', '2019 年 8 月'); says('ch9.p1', '2022 年 10 月'); says('ch9.p1', '2025 年 11 月'); check('USB4 dates', [SPEC.usb4.v1, SPEC.usb4.v2, FRONTIER.usb4Build].join(), '2019-08,2022-10,2025-11-19');
  says('ch9.r.pcie.usb4', '可选'); says('ch9.r.pcie.tb4', '必须'); says('ch9.r.tbt3.usb4', '可选'); says('ch9.r.pcieMin.tb4', '32'); says('ch9.r.pcieMin.tb5', '64');
  says('ch9.r.speed.tb5', '80'); says('ch9.r.speed.tb5', '120'); check('TB5 link', SPEC.tb.tb5.link + '/' + SPEC.tb.tb5.boost, '80/120');
  says('ch9.r.video.tb4', '两台 4K'); says('ch9.r.video.tb5', '两台 6K'); check('video', SPEC.tb.tb4.video + ' ' + SPEC.tb.tb5.video, '2×4K 2×6K');
  says('ch9.r.usb3.tb5', '可到 20'); check('TB5 USB 3 max', SPEC.tb.tb5.usb3max, 20);
  says('ch10.e1', '2025 年 11 月 19 日'); says('ch10.e2', '2026 年 3 月'); says('ch10.e2', '2026 年 10 月 16 日'); says('ch10.e3', '2019 年 6 月 26 日');
  check('frontier dates', [FRONTIER.typec25, FRONTIER.pd33, SPEC.dp.dp20date].join(), '2026-03,2026-10-16,2019-06-26');
  says('ch10.d1', '2023 年 9 月'); check('TB5 brief', FRONTIER.tb5Brief, '2023-09'); says('ch10.d2', '2024 年 10 月 30 日'); check('first TB5 Mac', FRONTIER.tb5FirstMac, '2024-10-30');
  says('ch10.d3', '2026 年 10 月 8 日'); check('KDMA page', FRONTIER.kdmaPage, '2026-10-08'); says('ch10.c1', '2026 年 1 月'); check('Panther Lake', FRONTIER.panther, '2026-01');
  says('ch10.law', '2026 年 11 月'); check('as of', FRONTIER.asOf, '2026-11');
}

/* ── every prose placeholder is a prose() key; pinned values ── */
{
  const P = M.prose();
  const want = { cc0: '0.42', cc15: '0.94', cc30: '1.69', cc0lo: '0.304', cc0hi: '0.612', cc30lo: '1.445', cc30hi: '2.042',
    eff256: '98.5', eff64: '94.1', eff5: '41.7', hopMax: '127', hopPaths: '120', ex80avail: '72', ex80bulk: '4',
    s5w: '869', s5bbw: '5215', s5r: '8000', s5bbr: '3477', s0dp: '12.5', s0drive: '1994', s0usb: '9.7', sNoDrive: '3562', sReadDrive: '3562', sCap4: '38.2', sNoUsbDrive: '4000',
    ch3each: '1333', ch1each: '4000', ch6live: '5', ch6tlive: '6', chdEach: '1069', chRtt: '6', chRttShare: '11', chRttH: '6', chRttD: '19',
    tbt3coded: '20.0', g3coded: '38.79', g4lane: '40.23', g4down: '76.6', g4asymDown: '114.9', g4asymUp: '38.3', g4fec: '95.2', g3fecLoss: '3', pam3db: '-6.0', pam4db: '-9.5', pam3baud: '0.64', nyq3: '10', nyq4: '12.8',
    pclk4k: '522.61', htot4k: '3920', vtot4k: '2222', n4k: '12.54', n5k: '22.2', n6k24: '30.6', n6k30: '38.2', n8k30: '62.1', n4k90x3: '71.6', dsc8k: '12.2', dscRatio8k: '2.45', hbr3fec: '25.31', fecPct: '2.4', dsc8kNoFec: '12.5',
    scTb4fit: '1', scTb4bwfit: '2', sc6k30: '1', sc6k30bb: '2', sc6k24: '2', tb4second: '8.64', tb4first: '25.92', tb4h2each: '17.28', tb4h2fit: '2',
    pd65w: '60', pd100c3: '60', pd140c5: '140', pd140c3: '60', pd240a: '5', pdWire: '18.5', pdWireSpr: '4.6',
    ioPagesE: '48.1', ioMappedE: '193', ioExposedE: '97', ioPages7: '43', ioBuf: '96', ioOff: '256', io2kE: '65', io4k: '0' };
  for (const [k, [v, d, kind]] of Object.entries(P)) check('prose ' + k, kind === 'pct' ? f(v * 100, d) : f(v, d), want[k]);
  check('every prose value pinned', Object.keys(P).sort().join(','), Object.keys(want).sort().join(','));
  const used = new Set();
  for (const m of html.matchAll(/data-i18n-html="([^"]+)"/g)) { const v = Z[m[1]] || ''; for (const p of v.matchAll(/\{(\w+)\}/g)) { used.add(p[1]); n++; if (!(p[1] in P)) { fails++; console.error(`FAIL {${p[1]}} in ${m[1]} is not filled on the page`); } } }
  for (const k of Object.keys(P)) { n++; if (!used.has(k)) { fails++; console.error('FAIL prose() value ' + k + ' is never quoted'); } }
  // the claims the prose makes about the models
  check('ch3: reading with a display beats writing with it', P.sReadDrive[0] > P.s0drive[0], true);
  check('ch3: boost helps writes, hurts reads', P.s5bbw[0] > P.s5w[0] && P.s5bbr[0] < P.s5r[0], true);
  check('ch3: alone, the drive hits the TB4 PCIe cap', P.sNoUsbDrive[0], SPEC.tb.tb4.pcie * 125);
  check('ch3.say.read is reached at the default display', M.say.share({ drive: 'read' }).key, 'ch3.say.read');
  check('ch4: three drives share one tunnel', f(P.ch3each[0] * 3, 0), f(P.ch1each[0], 0));
  check('ch4.p3 doubling the tuned hop at most doubles the share', P.chRttD[0] < 2 * P.chRttShare[0], true);
  check('ch5: PAM3 eye half of NRZ', f(LANES.eye(3).h, 3), '0.500'); check('ch5: PAM4 a third', f(LANES.eye(4).h, 3), '0.333');
  check('ch6: Max Link BW lights one of two 4K; allocation mode lights both', P.scTb4fit[0] + '/' + P.scTb4bwfit[0], '1/2');
  check('ch6: 8K DSC ratio from 30 bpp', f(30 / P.dsc8k[0], 2), f(P.dscRatio8k[0], 2));
  // DSC on 8b/10b DP needs FEC (2.4016 %, Linux drm_dp_bw_overhead; how-pixels-reach-a-screen ch7.p4), 2026-11-15
  check('FEC overhead (256·6 + 1)/(256·250)', f(SPEC.dp.fec8b10b * 100, 4), '2.4016');
  check('HBR3 ×4 with FEC', f(SPEC.dp.hbr3x4 / (1 + SPEC.dp.fec8b10b), 2), '25.31');
  check('ch6: 8K60 30 bpp still fits HBR3 with DSC + FEC at ≤ 12.2 bpp; DSC 12 lights it on Alt Mode 4 lanes and in a TB4 tunnel',
    [SCREEN.run({ mode: 'k8_60', count: 1, bpp: 12, conn: 'alt4' }).fit, SCREEN.run({ mode: 'k8_60', count: 1, bpp: 12, conn: 'tb4' }).fit, SCREEN.run({ mode: 'k8_60', count: 1, bpp: 12, conn: 'tb4', method: 'bwalloc' }).fit].join(), '1,1,1');
  check('ch6: FEC only on 8b/10b links and only with DSC', Object.keys(SCREEN.conn).map(c => [24, 30, 12].map(b => SCREEN.fecK(c, b) > 1 ? 1 : 0).join('')).join(' '), '001 001 000 001 000 000');
  check('ch6: alt4 DSC capacity is 25.31', f(SCREEN.run({ mode: 'k8_60', count: 1, bpp: 12, conn: 'alt4' }).cap, 2), '25.31');
  check('ch6: alt4 uncompressed capacity stays 25.92', f(SCREEN.run({ mode: 'uhd60', count: 1, bpp: 24, conn: 'alt4' }).cap, 2), '25.92');
  check('ch6: UHBR20 keeps 77.37 with DSC', f(SCREEN.run({ mode: 'k8_60', count: 1, bpp: 12, conn: 'alt21' }).cap, 2), '77.37');
  check('ch6: bwalloc reservation on TB4 includes FEC', f(SCREEN.run({ mode: 'k8_60', count: 1, bpp: 12, conn: 'tb4', method: 'bwalloc' }).rows[0].res / VIDEO.need('k8_60', 12), 6), f(1 + SPEC.dp.fec8b10b, 6));
  check('ch6: bppMax DSC on tb4 equals the prose 8K figure', f(SCREEN.bppMax({ mode: 'k8_60', conn: 'tb4' }).dsc, 4), f(P.dsc8k[0], 4));
  { const ec = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.en.js'), 'utf8'), ec);
    check('ch6: no literal 25.92 left in ch6.p4 (FEC figure comes from the model)', /25\.92/.test(Z['ch6.p4']) || /25\.92/.test(ec.window.ESSAY_COPY.en['ch6.p4']), false); }
  check('ch7: 65 W charger on 3 A cable gives 60 W because of the cable', M.say.pd(65, 'c3', 65, false).key, 'ch7.say.short.cable');
  check('ch7: 140 W charger, 3 A cable, EPR sink: cable is the reason', M.say.pd(140, 'c3', 140, true).key, 'ch7.say.short.cable');
  check('ch8: 2 KiB buffers still expose (another owner in the half page)', P.io2kE[0] > 0, true);
  // reviewer additions (2026-11-15)
  // TB5 brief Figure 2 and note 4: TB4 required for notebooks under 100 W, TB5 under 140 W, up to 240 W available
  says('ch7.p5', '140 W 以下'); says('ch9.r.charge.tb5', '140 W 以下'); says('ch9.r.charge.tb4', '100 W 以下');
  // Intel Core Ultra Series 3 quick reference guide: 4 integrated TB4 ports, discrete TB5 on some SKUs
  says('ch10.c1', '集成 4 个雷电 4 口');
  check('ch2: tunnel HopIDs run 8..127 (USB4 §5.2)', P.hopPaths[0], 127 - 8 + 1);
  check('ch6: two monitors that top out at HBR2 x4 both fit under Max Link BW (17.28 x 2 <= 36)', P.tb4h2each[0] * 2 <= 36 && P.tb4h2fit[0] === 2, true);
  { // ch8: the prose quotes the expectation, not one draw; the closed form agrees with a 400-layout mean, and the default draw is shown as one layout
    let sum = 0; for (let k = 1; k <= 400; k++) sum += IOMMU.run(1536, 64, 'iommu', k).lay.pages.size;
    near('ch8: expected pages vs 400-layout mean', sum / 400, P.ioPagesE[0], 0.6);
    check('ch8: exposed = mapped - buffers', f(P.ioMappedE[0] - P.ioBuf[0], 3), f(P.ioExposedE[0], 3));
  }
  { // ch7: EPR wire time recomputed independently: bits per message = 64 preamble + 20 SOP + 20 header + 40 per data object
    // + 40 CRC + 5 EOP, each followed by a 0-object GoodCRC. SPR: caps (4), Request (1), Accept, PS_RDY. EPR: Enter (1),
    // Ack (1), Discover Identity SOP' (1) and the cable's ACK (5), Enter Succeeded (1), EPR_Source_Capabilities as an
    // Extended Message of 4 x (7 + 1 + 1) = 36 bytes in 26-byte Chunks: 28 bytes (7), a Chunk request (1), 12 bytes (3);
    // EPR_Request (2), Accept, PS_RDY.
    const b = k => 149 + 40 * k, g = b(0), objs = [4, 1, 0, 0, 1, 1, 1, 5, 1, 7, 1, 3, 2, 0, 0];
    near('ch7: EPR wire time, independent count', P.pdWire[0], objs.reduce((s2, k) => s2 + b(k) + g, 0) / 300, 1e-9);
    near('ch7: SPR wire time, independent count', P.pdWireSpr[0], [4, 1, 0, 0].reduce((s2, k) => s2 + b(k) + g, 0) / 300, 1e-9);
  }
}

/* ── sentence branches at the extremes of each control ── */
{
  const has = k => { n++; if (Z[k] == null) { fails++; console.error('FAIL missing say key ' + k); } };
  const seen = new Set(), add = s => { has(s.key); seen.add(s.key); };
  for (const rp of ['usb', 'a15', 'a30']) for (const fl of [false, true]) for (const e of [false, true]) for (const k of ['nom', 'lo', 'hi']) add(M.say.cc(rp, fl, e, k));
  for (const len of [1, 3, 4, 5, 255, 256]) for (const b of [null, 0, 31]) add(M.say.pkt(len, b));
  for (const link of ['tb4', 'tb5', 'tb5bb']) for (const display of Object.keys(M.DISPLAYS)) for (const drive of ['write', 'read']) for (const usb of [false, true]) add(M.say.share({ link, display, drive, usb }));
  for (const link of ['tb4', 'tb5']) for (const nn of [1, 3, 7]) for (const depth of ['usb4', 'tbt3']) for (const display of [false, true]) add(M.say.chain({ link, n: nn, depth, display }));
  for (const m of Object.keys(LANES.modes)) add(M.say.lanes(m));
  for (const mode of Object.keys(VIDEO.modes)) for (const count of [1, 2, 3]) for (const bpp of [12, 24, 30]) for (const conn of Object.keys(SCREEN.conn)) for (const method of ['maxlink', 'bwalloc']) add(M.say.screen({ mode, count, bpp, conn, method }));
  for (const pdp of [20, 30, 45, 65, 100, 140, 240]) for (const cable of ['c3', 'c5']) for (const [need, epr] of [[25, false], [65, false], [100, false], [140, true], [240, true]]) add(M.say.pd(pdp, cable, need, epr));
  for (const s of [512, 1536, 4096]) for (const N of [8, 128]) for (const mode of ['off', 'iommu', 'bounce']) add(M.say.iommu(s, N, mode));
  const unreachable = ['ch1.say.bad'];   // the windows are cut so that every tolerance corner lands inside one (checked in 01)
  for (const k of Object.keys(Z)) if (/\.say\.(?!vconn$|novconn$)/.test(k) && !unreachable.includes(k)) check('branch reached ' + k, seen.has(k), true);
  for (const k of seen) check('branch has copy ' + k, Z[k] != null, true);
  check('ch1.say.bad never reached', seen.has('ch1.say.bad'), false);
}

/* ── keys, language hygiene, registry, siblings ── */
{
  const keys = new Set([...html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)].map(m => m[1]).concat([...html.matchAll(/data-hk="([^"]+)"/g)].map(m => m[1])));
  for (const m of app.matchAll(/'((?:ch\d+|dg\d|u|doc)\.[\w.]*\w)'/g)) keys.add(m[1]);
  for (const k of ['usb', 'a15', 'a30']) { keys.add('ch1.amps.' + k); keys.add('ch1.cv.' + k); }
  for (const k of ['pdf', 'supp', 'rsvd', 'hop', 'len', 'hec']) keys.add('ch2.field.' + k);
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
  check('no lesson-shell', /lesson-shell/.test(html), false);
  check('nine diagrams', (html.match(/<figure class="dg"/g) || []).length, 9);
  check('a few phrases that would be buying advice are absent', /推荐购买|值得买的|买这款/.test(Object.values(Z).join('')), false);
  const R = JSON.parse(fs.readFileSync(path.join(DIR, 'REGISTRY.json'), 'utf8'));
  check('registry slug/path', R.slug + ' ' + R.path, 'how-thunderbolt-works computing/systems/how-thunderbolt-works/');
  check('registry category', [R.category, R.subtopic, R.stage].join('/'), 'computing/systems/university');
  check('registry title', R.title.zh, Z['doc.title'].split(' · ')[0]); check('registry desc', R.desc.zh, Z['doc.desc']); check('hero title = registry title', Z['hero.title'], R.title.zh);
  check('one concept per chapter', R.concepts.map(c => c.anchor).join(), Array.from({ length: 11 }, (_, i) => '#ch' + (i + 1)).join());
  for (const c of R.concepts) { n++; if (!c.aliases.zh.length || !c.aliases.en.length || !c.title.en || !c.desc.en) { fails++; console.error('FAIL concept incomplete ' + c.id); } }
  // one word, one owner: every other page's aliases (S4 owns "USB4 和雷电区别"; "快充" and "DMA" belong elsewhere)
  const norm = s => s.toLowerCase().replace(/\s+/g, ''), owned = new Map(), root = path.join(DIR, '..', '..', '..');
  const walk = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { if (e.name.startsWith('.') || e.name === 'node_modules') continue; const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p); else if (e.name === 'REGISTRY.json' && !p.includes('how-thunderbolt-works')) { try { for (const c of JSON.parse(fs.readFileSync(p, 'utf8')).concepts || []) for (const a of [...(c.aliases.zh || []), ...(c.aliases.en || [])]) owned.set(norm(a), path.relative(root, p)); } catch (err) { /* not a page registry */ } } } };
  walk(root);
  for (const c of R.concepts) for (const a of [...c.aliases.zh, ...c.aliases.en]) { n++; if (owned.has(norm(a))) { fails++; console.error(`FAIL alias owned by ${owned.get(norm(a))}: ${a}`); } }
  for (const L of ['zh', 'en']) { const ours = new Set(); for (const c of R.concepts) for (const a of c.aliases[L]) { n++; if (ours.has(norm(a))) { fails++; console.error('FAIL duplicate alias ' + a); } ours.add(norm(a)); } }
  // sibling links point at chapters that exist; B1 (how-pcie-works) is named in plain text, never linked
  const all = Object.values(Z).join('');
  for (const sib of ['how-usb-drives-talk', 'why-nvme-is-fast', 'how-pcie-works']) {
    const sh = fs.readFileSync(path.join(DIR, '..', sib, 'index.html'), 'utf8');
    for (const m of all.matchAll(new RegExp(sib + '/(#ch\\d+)', 'g'))) check(`${sib} anchor ${m[1]}`, sh.includes(`id="${m[1].slice(1)}"`), true);
  }
  check('S4 links: #ch3 and #ch8', [...new Set(all.match(/how-usb-drives-talk\/#ch\d+/g))].sort().join(), 'how-usb-drives-talk/#ch3,how-usb-drives-talk/#ch8');
  // B1 is live since 2026-11-15: the plain-text citations became links
  says('ch3.p5', 'how-pcie-works/#ch2'); says('ch11.links', 'how-pcie-works/'); says('ch3.p5', '《PCIe 为什么能一代一代翻倍》'); says('ch11.links', '《PCIe 为什么能一代一代翻倍》');

  const ectx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.en.js'), 'utf8'), ectx);
  const EN = ectx.window.ESSAY_COPY.en, stub = ectx.window.ESSAY_COPY.enStub === true, ph = s => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');
  check('en keys = zh keys', Object.keys(EN).sort().join('|'), Object.keys(Z).sort().join('|'));
  const hrefs = o => (Object.values(o).join('').match(/href=["']\.\.\/[^"']+/g) || []).sort().join(' ');
  // the OS and pixels essays, live since 2026-11-15: ch8.p2 -> OS #ch8 (IOMMU mappings), ch6.p1 -> pixels #ch2 (pixel clock), ch6.p4 -> pixels #ch7 (DSC)
  says('ch8.p2', "href='../how-the-os-talks-to-hardware/#ch8'"); says('ch8.p2', '《操作系统是怎么和硬件说话的》');
  says('ch6.p1', "href='../how-pixels-reach-a-screen/#ch2'"); says('ch6.p4', "href='../how-pixels-reach-a-screen/#ch7'"); says('ch6.p1', '《像素是怎么到屏幕上的》');
  for (const [sib, a] of [['how-the-os-talks-to-hardware', 'ch8'], ['how-pixels-reach-a-screen', 'ch2'], ['how-pixels-reach-a-screen', 'ch7']]) check(`${sib} anchor #${a}`, fs.readFileSync(path.join(DIR, '..', sib, 'index.html'), 'utf8').includes(`id="${a}"`), true);
  check('en links = zh links', hrefs(EN), hrefs(Z));
  for (const k of Object.keys(Z)) check('en placeholders ' + k, ph(EN[k]), ph(Z[k]));
  if (stub) { check('en stub mirrors zh exactly', JSON.stringify(EN), JSON.stringify(Z)); console.log('NOTE: copy.en.js is a stub (enStub); English registry match skipped until it is translated'); }
  else { check('registry title en', R.title.en, EN['doc.title'].split(' · ')[0]); check('registry desc en', R.desc.en, EN['doc.desc']); }
}

if (fails) { console.error(`\n${fails} of ${n} checks failed`); process.exit(1); }
console.log(`PASS: ${n} checks (Type-C Table 3-4 and 4-36, USB4 Appendix A and Table 5-2, CM Guide Table 6-3 and examples, PD Tables 3.1/3.3/3.6, VESA fits, and every number in the prose match the models)`);
