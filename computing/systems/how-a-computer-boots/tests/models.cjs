'use strict';
// Pins the page's boot models: SHA-256 and CRC32 against node's own implementations; the ATX power-on state machine
// against the timing table; the reset-vector arithmetic of the SDM; SPI read clocks from the W25Q256JV command table;
// the boot timeline sums; the MADT bytes and checksum; the GPT builder against an independent parse (offsets, CRCs,
// protective MBR) and the backup fallback; the small RSA (primes, round trip) and the Secure Boot verifier's order;
// the revocation outcomes and dbx byte counts; PCR extends recomputed with node crypto; the AP bring-up calibration;
// the sourced and frontier figures typed again from their sources; every number the prose quotes (placeholders filled
// from prose(), literals checked against models.js); every live sentence branch; copy keys, language hygiene, the
// registry, links to live siblings and the sibling essays' aliases.
// Run: node computing/systems/how-a-computer-boots/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm'), crypto = require('crypto'), zlib = require('zlib');
const DIR = path.join(__dirname, '..');
const ROOT = path.join(DIR, '..', '..', '..');
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
const sha = b => crypto.createHash('sha256').update(Buffer.from(b)).digest('hex');

/* ── primitives against node ── */
{
  for (const s of ['', 'abc', 'x'.repeat(55), 'x'.repeat(56), 'x'.repeat(64), 'shim 16 (sbat shim,4)', '中文 also works']) check('sha256 ' + s.slice(0, 12), M.hex(M.sha256(s)), sha(Buffer.from(s, 'utf8')));
  const R = crypto.randomBytes(1000); check('sha256 random bytes', M.hex(M.sha256(new Uint8Array(R))), sha(R));
  check('crc32 "123456789" = CBF43926', M.h8(M.crc32(M.enc('123456789'))), 'CBF43926');
  check('crc32 random bytes = zlib', M.crc32(new Uint8Array(R)), zlib.crc32(R) >>> 0);
}

/* ── sourced figures, typed again from the sources (BRIEF.md lists URL and date) ── */
{
  const A = SRC.atx;
  check('ATX: T1 < 200 (500 legacy), T2 0.2–20, T3 100–250 (100–500 legacy)', [A.t1Req, A.t1Legacy, A.t2.join('-'), A.t3Req.join('-'), A.t3Legacy.join('-')].join(), '200,500,0.2-20,100-250,100-500');
  check('ATX windows 12 V 11.20–12.60, 5 V 4.75–5.25, 3.3 V 3.14–3.47', A.rails.map(r => r.slice(2).join('-')).join(), '11.2-12.6,4.75-5.25,3.14-3.47');
  check('ATX rev 2.1a', A.rev, '2.1a');
  check('SDM reset state CS F000, base FFFF0000, EIP FFF0', [SRC.sdm.csSel, SRC.sdm.csBase, SRC.sdm.eip].map(x => x.toString(16)).join(), 'f000,ffff0000,fff0');
  check('SDM example waits: INIT 10 ms, SIPI 200 µs, two SIPIs', [SRC.sdm.initMs, SRC.sdm.sipiUs, SRC.sdm.sipiCount].join(), '10,200,2');
  check('SDM order 325384-093US', SRC.sdm.order, '325384-093US');
  const Cm = M.SPI.cmds;
  check('W25Q256JV 03h: 8 + 24, 1 lane, 50 MHz', [Cm['03'].ins, Cm['03'].addr, Cm['03'].dummy, Cm['03'].dlanes, Cm['03'].fmax].join(), '8,24,0,1,50');
  check('W25Q256JV 0Bh/3Bh/6Bh: 8 dummy, 1/2/4 lanes, 133 MHz', ['0B', '3B', '6B'].map(k => [Cm[k].dummy, Cm[k].dlanes, Cm[k].fmax].join('/')).join(), '8/1/133,8/2/133,8/4/133');
  check('W25Q256JV EBh: 8 + 6 + 2 mode + 4 dummy, 4 lanes', [Cm.EB.ins, Cm.EB.addr, Cm.EB.mode, Cm.EB.dummy, Cm.EB.dlanes].join(), '8,6,2,4,4');
  check('Gleixner 2023-05-04: 112 threads, ~800 → ~80 ms, alive 0.35–3.5 ms, microcode ~8 ms', [SRC.smp.threads, SRC.smp.serialMs, SRC.smp.parallelMs, SRC.smp.aliveMs.join('-'), SRC.smp.ucodeMs, SRC.smp.date].join(), '112,800,80,0.35-3.5,8,2023-05-04');
  check('SBAT.md: BootHole 3 certs + 150 hashes, ~10 of 32 kB', [SRC.sbat.bootholeCerts, SRC.sbat.bootholeHashes, SRC.sbat.eventKB, SRC.sbat.dbxKB].join(), '3,150,10,32');
  check('EFI_SIGNATURE_LIST header 28, owner 16, SHA-256 32', [SRC.sigList, SRC.sigOwner, SRC.sha256].join(), '28,16,32');
  check('GPT: entry array ≥ 16384, entry 128, header 92, revision 1.0, 0xEE, 0xAA55, 0x7C00', [SRC.gpt.entryMin, SRC.gpt.entrySize, SRC.gpt.hdrSize, SRC.gpt.rev.toString(16), SRC.gpt.pmbrType.toString(16), SRC.gpt.mbrSig.toString(16), SRC.gpt.mbrLoad.toString(16)].join(), '16384,128,92,10000,ee,aa55,7c00');
  check('ESP type GUID', M.GPT.espType, 'C12A7328-F81F-11D2-BA4B-00A0C93EC93B');
  const F = FRONTIER;
  check('UEFI 2.11 / PI 1.9, 2024-12-17', [F.uefi.ver, F.uefi.pi, F.uefi.released].join(), '2.11,1.9,2024-12-17');
  check('certificate expiry 2026-06-24 / 06-27 / 10-19, KB updated 2026-05-18', [F.certs.kek2011, F.certs.uefi2011, F.certs.pca2011, F.certs.kbUpdated].join(), '2026-06-24,2026-06-27,2026-10-19,2026-05-18');
  check('KB5025885 phases 2023-05-09 / 2024-04-09 / 2024-07-09', [F.kb5025885.first, F.kb5025885.eval, F.kb5025885.deploy].join(), '2023-05-09,2024-04-09,2024-07-09');
  check('BootHole 2020-07-29 CVE-2020-10713 CVSS 8.2', [F.boothole.date, F.boothole.cve, F.boothole.cvss].join(), '2020-07-29,CVE-2020-10713,8.2');
  check('BlackLotus 2023-03-01 CVE-2022-21894 patched 2022-01', [F.blacklotus.date, F.blacklotus.cve, F.blacklotus.patched].join(), '2023-03-01,CVE-2022-21894,2022-01');
  check('openSIL Venice 2026, Medusa 2027 H1', [F.opensil.venice, F.opensil.medusa].join(), '2026,2027 H1');
  check('Pluton page 2026-05-27; boot protocol 2.15 (5.5)', [F.pluton.page, F.lbp.ver, F.lbp.kernel].join(), '2026-05-27,2.15,5.5');
  // the same dates and figures as written in the prose
  for (const [k, s] of [['ch1.p2', '修订 2.1a，2023 年 11 月'], ['ch3.p2', '修订 I，2018 年 10 月'], ['ch9.p2', '2020 年 7 月 29 日'], ['ch9.p2', 'CVE-2020-10713，CVSS 8.2'],
    ['ch9.p3', '2023 年 3 月 1 日'], ['ch9.p3', 'CVE-2022-21894'], ['ch9.p3', '2022 年 1 月'], ['ch9.p3', '2023 年 5 月 9 日'], ['ch9.p3', '2024 年 7 月'],
    ['ch13.e1', '2024 年 12 月 17 日'], ['ch13.e1', 'UEFI 2.11 和 PI 1.9'], ['ch13.e1', 'ACPI 6.6'], ['ch13.e2', '修订 1.59，2019 年 11 月 8 日'], ['ch13.e3', '2.15（内核 5.5）'],
    ['ch13.d1', '2026 年 6 月 24 日'], ['ch13.d1', '2026 年 6 月 27 日'], ['ch13.d1', '2026 年 10 月 19 日'], ['ch13.d1', '2026 年 5 月 18 日更新'],
    ['ch13.d2', '2023 年 5 月 9 日'], ['ch13.d2', '2024 年 4 月 9 日'], ['ch13.d2', '2024 年 7 月'], ['ch13.d3', '2026 年 5 月 27 日'], ['ch13.d4', '112 线程'],
    ['ch13.c1', '2025 年 10 月 30 日'], ['ch13.c1', '2026 年发布'], ['ch13.c1', '2027 年上半年'], ['ch11.p4', '2023 年 5 月'], ['ch11.p2', '0x1F1'], ['ch11.p2', '0x202'], ['ch11.p2', '2.15（内核 5.5）'],
    ['footer', '325384-093US，2026 年 9 月'], ['footer', '修订 1.59'], ['footer', '2023 年 5 月 4 日'], ['ch9.p3', '日期待公布'], ['ch13.d2', '日期待公布']]) says(k, s);
  // the expiries are written in the past tense (the page is dated November 2026)
  says('ch13.d1', '已经到期'); says('ch13.law', '到期了');
  // review 2026-11-15: expiry does not stop booting (edk2 Pkcs7Verify sets X509_V_FLAG_NO_CHECK_TIME); what stops is new signing
  says('ch13.d1', '固件验签名时不看证书的有效期'); says('ch13.d1', '关掉了时间检查'); says('ch13.d1', '到期停下的是「签新的东西」');
  // the model count in the description is the number of model sections on the page
  const nModels = Object.keys(Z).filter(k => /^ch\d+\.model\.title$/.test(k)).length;
  check('ten model sections', nModels, 10); says('doc.desc', '十个可以动手的模型');
  // a SHA-256 PCR is 256 bits = 64 hex digits; the diff readout counts hex digits
  says('ch10.read.diff', '64 个十六进制位'); says('ch10.p4', '256 个比特、写成 64 个十六进制位');
  // every bring-up point other than the 112-thread calibration point is labelled as extrapolated
  says('ch11.p5', '推算，不是测量'); says('ch11.say.mid', '推算'); says('ch11.say.small', '推算'); says('ch11.say.big', '往外推'); says('ch11.say.cal', '校准');
  check('112 threads uses the calibration sentence', M.say.smp(112).key, 'ch11.say.cal');
  says('ch5.p5', '调出来的参数');
}

/* ── 01 power-on ── */
{
  const r = M.powerOn();
  check('default: all rails in regulation, all three timings pass', [r.allOk, r.chk.t1, r.chk.t2, r.chk.t3, r.ok].join(), 'true,true,true,true,true');
  check('default T1 = 6 + 8 × 3.14 / 3.30', f(r.T1, 4), f(6 + 8 * 3.14 / 3.30, 4));
  check('default PWR_OK = T1 + 150', f(r.pwrOk, 4), f(r.T1 + 150, 4));
  check('3.3 V T2 measured from 10 % of nominal', f(r.rails[2].T2, 4), f(8 * (3.14 - 0.33) / 3.30, 4));
  const bad = M.powerOn({ set33: 3.10 });
  check('3.10 V: never in regulation, no PWR_OK', [bad.allOk, bad.pwrOk, bad.bad.join()].join(), 'false,,3.3');
  check('3.48 V: above 3.47, no PWR_OK', M.powerOn({ set33: 3.48 }).allOk, false);
  check('3.14 V exactly is inside', M.powerOn({ set33: 3.14 }).allOk, true);
  check('ramp 25: T2 over 20 ms', M.powerOn({ ramp: 25 }).chk.t2, false);
  check('ramp 24: 3.3 V T2 = 20.4, still fails', f(M.powerOn({ ramp: 24 }).rails[2].T2, 1), '20.4');
  check('T3 50 fails short, 300 fails long, 100 and 250 pass', [50, 100, 250, 300].map(x => M.powerOn({ t3: x }).chk.t3).join(), 'false,true,true,false');
  // the slider grid: every combination gives a defined state and sentence
  for (let ramp = 1; ramp <= 30; ramp++) for (let v = 0; v <= 20; v++) for (let t3 = 5; t3 <= 30; t3++) { const q = M.powerOn({ ramp, set33: 3 + 0.02 * v, t3: t3 * 10 }); if (q.allOk && !(q.pwrOk > q.T1)) { n++; fails++; console.error('FAIL power grid', ramp, v, t3); } }
  // sensitivity of the TUNED start delays: doubling them moves T1 by 6 ms, not the verdict
  check('start delays doubled: T1 + 6, still passes', [f(M.powerOn({ start: [4, 8, 12] }).T1 - r.T1, 1), M.powerOn({ start: [4, 8, 12] }).ok].join(), '6.0,true');
}

/* ── 02 reset vector ── */
{
  for (const mib of M.FLASH_SIZES) { const rv = M.resetVector(mib);
    check(`${mib} MiB: linear FFFFFFF0`, rv.linear, 0xFFFFFFF0); check(`${mib} MiB: file offset = size − 16`, rv.fileOffset, mib * 1048576 - 16); }
  check('after a far jump F000:FFF0 = FFFF0', M.realAddr(0xF000, 0xFFF0), 0xFFFF0);
  check('fetchAddr reset / far', [M.fetchAddr('reset', 0xFFF0), M.fetchAddr('far', 0)].map(x => x.toString(16)).join(), 'fffffff0,f0000');
  check('parseIp accepts 1–4 hex digits only', [M.parseIp('fff0'), M.parseIp('0'), M.parseIp('12345'), M.parseIp('xyz'), M.parseIp('')].join(), '65520,0,,,');
}

/* ── 03 SPI ── */
{
  const r = M.spiRead('03', 50, 64); check('03h 64 B: 32 + 512 clocks', r.clk, 544); check('03h 64 B at 50 MHz', f(r.us, 2), '10.88');
  const e = M.spiRead('EB', 133, 64); check('EBh 64 B: 20 + 128 clocks', e.clk, 148);
  check('03h capped at 50 MHz', [M.spiRead('03', 133, 64).f, M.spiRead('03', 133, 64).capped].join(), '50,true');
  check('3Bh data clocks = 4 per byte', M.spiRead('3B', 133, 64).data, 256);
  check('16 MiB with 03h = (32 + 2^27) / 50 MHz', f(M.spiRead('03', 50, 16777216).s, 6), f((32 + 134217728) / 50e6, 6));
  check('order of speed for 16 MiB: EB < 6B < 3B < 0B', M.SPI.order.slice(1).map(k => M.spiRead(k, 133, 16777216).s).every((s, i, a) => !i || s < a[i - 1]), true);
}

/* ── 05 timeline ── */
{
  const D = M.TL.dur;
  check('TUNED durations as on the page (ch5.tuned)', [D.sp, D.dxe, D.bds, D.krn, D.usr].join(), '0.3,2,1.5,1.5,5');
  for (const k of ['0.3 秒', 'DXE 2 秒', 'BDS 1.5 秒', '内核 1.5 秒', '用户空间 5']) says('ch5.tuned', k);
  check('normal = power + the nine stages', f(M.timeline('normal').total, 4), f(M.powerOn().pwrOk / 1000 + D.sp + D.pre + D.memRestore + D.post + D.dxe + D.bds + D.ldr + D.krn + D.usr, 4));
  check('first boot = normal − restore + training', f(M.timeline('first', 15).total - M.timeline('normal').total, 4), f(15 - D.memRestore, 4));
  check('S3 has no DXE, no BDS', M.timeline('s3').segs.map(s => s.key).filter(k => k === 'dxe' || k === 'bds').length, 0);
  check('S0ix has no firmware', M.timeline('s0ix').segs.map(s => s.key).join(), 'krn');
  check('S4 runs DXE and reads the image back', ['dxe', 'img'].every(k => M.timeline('s4').segs.some(s => s.key === k)), true);
  check('ordering: s0ix < s3 < s4 < fast < normal < first', ['s0ix', 's3', 's4', 'fast', 'normal', 'first'].map(k => M.timeline(k).total).every((x, i, a) => !i || x > a[i - 1]), true);
  // sensitivity: doubling the userspace time does not change which stage is longest in a first boot with 15 s training
  check('first boot: training is the longest stage', M.timeline('first', 15).biggest, 'mem');
  check('normal boot: userspace is the longest stage', M.timeline('normal').biggest, 'usr');
}

/* ── 06 MADT ── */
{
  for (const c of M.MADT.cores) { const r = M.madt(c); check(`MADT ${c}: length 44 + 8n + 12`, r.len, 44 + 8 * c + 12); check(`MADT ${c}: bytes sum to 0`, r.sum, 0); check(`MADT ${c}: cores read back`, r.cores.length, c); }
  const b = M.madt(8).bytes; check('signature APIC, revision 5, length field', String.fromCharCode(...b.slice(0, 4)) + b[8] + (b[4] | b[5] << 8), 'APIC5120');
  check('first LAPIC entry: type 0, length 8', [b[44], b[45]].join(), '0,8');
  check('IO APIC entry: type 1, length 12', [b[44 + 64], b[45 + 64]].join(), '1,12');
  check('corrupt: sum ≠ 0', M.madt(8, true).ok, false);
  says('ch6.p4', '36 字节'); says('ch6.p5', '8 字节的记录'); says('ch6.p5', '12 字节的记录'); check('header 36, LAPIC 8, IOAPIC 12', [M.MADT.hdr, M.MADT.lapicLen, M.MADT.ioapicLen].join(), '36,8,12');
}

/* ── 07 GPT: an independent parse with Buffer reads ── */
{
  for (const gib of M.GPT.diskGiB) {
    const d = M.gptBuild(gib, 260), H = Buffer.from(d.primary), E = Buffer.from(d.entries), last = gib * 2097152 - 1;
    check(`${gib} GiB: signature`, H.toString('latin1', 0, 8), 'EFI PART');
    check(`${gib} GiB: revision, header size`, [H.readUInt32LE(8).toString(16), H.readUInt32LE(12)].join(), '10000,92');
    const z = Buffer.from(H); z.writeUInt32LE(0, 16);
    check(`${gib} GiB: header CRC32 over 92 bytes with the field zeroed`, H.readUInt32LE(16), zlib.crc32(z) >>> 0);
    check(`${gib} GiB: MyLBA 1, AlternateLBA last`, [Number(H.readBigUInt64LE(24)), Number(H.readBigUInt64LE(32))].join(), '1,' + last);
    check(`${gib} GiB: usable 34 .. last − 33`, [Number(H.readBigUInt64LE(40)), Number(H.readBigUInt64LE(48))].join(), '34,' + (last - 33));
    check(`${gib} GiB: entries at LBA 2, 128 × 128`, [Number(H.readBigUInt64LE(72)), H.readUInt32LE(80), H.readUInt32LE(84)].join(), '2,128,128');
    check(`${gib} GiB: array CRC32`, H.readUInt32LE(88), zlib.crc32(E) >>> 0);
    const B = Buffer.from(d.backup); check(`${gib} GiB: backup MyLBA last, entries at last − 32`, [Number(B.readBigUInt64LE(24)), Number(B.readBigUInt64LE(72))].join(), last + ',' + (last - 32));
    const mbr = Buffer.from(d.mbr); check(`${gib} GiB: protective MBR`, [mbr[450].toString(16), mbr.readUInt32LE(454), mbr.readUInt16LE(510).toString(16)].join(), 'ee,1,aa55');
    check(`${gib} GiB: protective MBR size capped at 0xFFFFFFFF`, mbr.readUInt32LE(458), Math.min(last, 0xFFFFFFFF));
    // the ESP type GUID in mixed-endian order (UEFI Appendix A)
    check(`${gib} GiB: ESP type bytes`, E.toString('hex', 0, 16), '28732ac11ff8d211ba4b00a0c93ec93b');
    const r = M.gptParse(d); check(`${gib} GiB: parse finds ESP at 2048`, [r.use, r.esp.start, r.esp.end, r.parts.length].join(), `primary,2048,${2048 + 260 * 2048 - 1},2`);
  }
  const d = M.gptBuild(64, 260), run = (e, fx, b) => M.gptParse(M.gptEdit(d, e, fx, b));
  for (const e of ['sig', 'guid', 'mylba', 'entry', 'start']) { check(`edit ${e}: backup used`, run(e, false, false).use, 'backup'); check(`edit ${e} on both: nothing`, run(e, false, true).use, null); }
  check('edit sig + fix CRC: still caught by the signature', run('sig', true, false).use, 'backup');
  check('edit mylba + fix CRC: still caught by MyLBA', run('mylba', true, false).use, 'backup');
  for (const e of ['guid', 'entry', 'start']) check(`edit ${e} + fix CRC: accepted`, run(e, true, false).use, 'primary');
  check('start + fix: the ESP moved by 8 sectors', run('start', true, false).esp.start, 2056);
  check('MBR limit = 2^32 × 512 = 2 TiB', M.MBR_LIMIT_BYTES, 2 * Math.pow(2, 40));
}

/* ── 08 signatures and the chain ── */
{
  for (const [k, K] of Object.entries(M.KEYS)) {
    const bits = K.n.toString(2).length; within('key ' + k + ' modulus bits', bits, 60, 64);
    const msg = M.enc('test ' + k); check('key ' + k + ' sign/verify round trip', M.verifySig(K, msg, M.sign(K, msg)), true);
    check('key ' + k + ' wrong message fails', M.verifySig(K, M.enc('other'), M.sign(K, msg)), false);
  }
  const C = o => M.chain(o);
  check('default chain boots', C().booted, true);
  check('tampered GRUB: badsig at shim', [C({ grub: 'grubTampered' }).stopAt, C({ grub: 'grubTampered' }).steps[1].why].join(), '1,badsig');
  check('evil loader: untrusted', C({ grub: 'evil' }).steps[1].why, 'untrusted');
  check('old GRUB at SBAT 2: sbat; at SBAT 1: boots', [C({ grub: 'grubOld' }).steps[1].why, C({ grub: 'grubOld', sbat: 1 }).booted].join(), 'sbat,true');
  check('old shim boots without dbx, blocked with dbx', [C({ shim: 'shimOld' }).booted, C({ shim: 'shimOld', dbx: true }).steps[0].why].join(), 'true,dbxhash');
  check('unsigned kernel: unsigned', C({ kernel: 'kernelBare' }).steps[2].why, 'unsigned');
  check('own kernel: untrusted, then boots with MOK', [C({ kernel: 'kernelMine' }).steps[2].why, C({ kernel: 'kernelMine', mok: true }).booted].join(), 'untrusted,true');
  check('Secure Boot off: everything runs', C({ sb: false, grub: 'evil', kernel: 'kernelBare' }).booted, true);
  check('dbx is checked before the signature', M.verifyImage(M.IMG.shimOld, ['msUefi2011'], { hashes: [M.hex(M.sha256(M.IMG.shimOld.bytes))], certs: [] }).why, 'dbxhash');
}

/* ── 09 revocation ── */
{
  const R = (s, m, k, d) => M.revoke(s, m, k, d), ok = r => [r.old.ok, r.sibling.ok, r.cur.ok, r.media.ok].map(x => (x ? 1 : 0)).join('');
  check('linux none: all boot', ok(R('linux', 'none', 150)), '1111');
  check('linux hash: only the listed build blocked', ok(R('linux', 'hash', 150)), '0111');
  check('linux sbat: every generation-1 build blocked, current boots', ok(R('linux', 'sbat', 150)), '0010');
  check('windows hash: only the listed build blocked', ok(R('windows', 'hash', 150, true)), '0111');
  check('windows cert with 2023 CA: only current boots', ok(R('windows', 'cert', 150, true)), '0010');
  check('windows cert without 2023 CA: nothing boots', ok(R('windows', 'cert', 150, false)), '0000');
  check('hash bytes = 28 + 48 n', M.REV.builds.map(k => R('linux', 'hash', k).bytes).join(), M.REV.builds.map(k => 28 + 48 * k).join());
  check('300 builds overflow nothing but take 44 % of 32 kB', f(R('linux', 'hash', 300).share * 100, 0), '44');
  check('sbat adds no bytes', R('linux', 'sbat', 150).bytes, 0);
  check('default slider index is 150 builds', M.REV.builds[M.REV.defBuilds], 150);
  check('html default rkN', /id="rkN" min="0" max="4" step="1" value="3"/.test(html), true);
  says('ch9.p4', '28 字节的列表头');
}

/* ── 10 PCRs, recomputed with node crypto ── */
{
  const ev = M.pcrEvents('none'), reg = {}; M.PCR.banks.forEach(b => { reg[b] = Buffer.alloc(32); });
  for (const e of ev) reg[e.pcr] = crypto.createHash('sha256').update(Buffer.concat([reg[e.pcr], crypto.createHash('sha256').update(e.data).digest()])).digest();
  const run = M.pcrRun('none').pcr;
  for (const b of M.PCR.banks) check('PCR ' + b + ' = node recompute', run[b], reg[b].toString('hex'));
  const ch = tp => M.unseal('p7', tp).changed.join();
  check('fw changes PCR 0', ch('fw'), '0'); check('oprom changes PCR 2', ch('oprom'), '2'); check('sboff changes PCR 7', ch('sboff'), '7');
  check('grub changes PCR 4', ch('grub'), '4'); check('gpt changes PCR 5', ch('gpt'), '5'); check('order changes PCR 4', ch('order'), '4');
  check('p7 survives fw and grub, locks on sboff', ['fw', 'grub', 'sboff'].map(tp => M.unseal('p7', tp).ok).join(), 'true,true,false');
  check('p0247 locks on fw, oprom, grub, order; survives gpt', ['fw', 'oprom', 'grub', 'order', 'gpt'].map(tp => M.unseal('p0247', tp).ok).join(), 'false,false,false,false,true');
  says('ch10.p2', 'PCR 0 记固件本身的代码'); says('ch10.p2', 'PCR 7'); check('banks 0 2 4 5 7', M.PCR.banks.join(), '0,2,4,5,7');
}

/* ── 11 bring-up ── */
{
  check('calibration reproduces 800 and 80 at 112', [f(M.bringup(112).serial, 6), f(M.bringup(112).parallel, 6)].join(), '800.000000,80.000000');
  check('tFirst = 3.5 + 8', M.SMPK.tFirst, 11.5);
  check('tuned figures on the page', [f(M.SMPK.tTail, 2), f(M.SMPK.tSerial * 111, 0)].join(), '0.62,800');
  for (const s of ['800/111', '3.5 毫秒', '微码 8 毫秒', '0.62 毫秒']) says('ch11.tuned', s);
  check('2 threads: serial faster than parallel', M.bringup(2).serial < M.bringup(2).parallel, true);
  check('break-even below 4 threads', M.bringup(4).serial > M.bringup(4).parallel, true);
}

/* ── every number the prose quotes ── */
{
  const want = { t1Req: '200', t1Leg: '500', t2Lo: '0.2', t2Hi: '20', t3Lo: '100', t3Hi: '250', v33min: '3.14', v33max: '3.47', v12min: '11.20',
    pT1: '13.6', pOk: '163.6', badSet: '3.10', slowRamp: '25', slowT2: '21.3',
    rvLin: '0xFFFFFFF0', rvBase: '0xFFFF0000', rvSel: '0xF000', rvEip: '0xFFF0', rvOff: '0x01FFFFF0', rvBelow: '16', rvReal: '0xFFFF0',
    spiF03: '50', spiF: '133', s03us: '10.88', sEBus: '1.11', s03clk: '544', sEBclk: '148', sEBover: '20', s03img: '2.68', sEBimg: '0.25', s0Bimg: '1.01', sEBMBps: '66', spiX: '10.6', spiSize: '32',
    tNormal: '12.0', tFirst: '26.5', tS3: '2.2', tS4: '8.5', tFast: '9.6', tFwShare: '41', tTrain: '15', tTrainShare: '57',
    madtLen8: '120', madtSum8: '0xB9', madtLen64: '568',
    gFirst: '34', gArr: '32', gLast: '134217727', gEsp: '2048', gCrc: '0xFEE8232E', gArrCrc: '0x93A5FB89', mbrTiB: '2', gEntries: '128', gEntrySize: '128',
    bhHashes: '150', bhCerts: '3', bhBytes: '7228', bhKB: '10', dbxKB: '32', bhShare: '22', sigEntry: '48',
    pcr0: 'b8418242', pcr0f: 'cc721e3e', pcrDiff: '60',
    smpN: '112', smpSer: '800', smpPar: '80', smp512s: '3683', smp512p: '327', sdmInit: '10', sdmSipi: '200', aliveLo: '0.35', aliveHi: '3.5', ucode: '8' };
  for (const [k, [v, d, kind]] of Object.entries(P)) check('prose ' + k, kind === 'pct' ? f(v * 100, d) : typeof d === 'number' ? f(v, d) : M.fmtKind(v, d), want[k]);
  check('every prose value pinned', Object.keys(P).sort().join(','), Object.keys(want).sort().join(','));
  const used = new Set();
  const scan = key => { const v = Z[key] || ''; for (const p of v.matchAll(/\{(\w+)\}/g)) { used.add(p[1]); n++; if (!(p[1] in P)) { fails++; console.error(`FAIL {${p[1]}} in ${key} is not filled on the page`); } } };
  for (const m of html.matchAll(/data-i18n-html="([^"]+)"/g)) scan(m[1]);
  for (const k of Object.keys(P)) { n++; if (!used.has(k)) { fails++; console.error('FAIL prose() value ' + k + ' is never quoted'); } }
  // diagram labels draw from the same values (vars filled from prose() in app.js)
  for (const k of Object.keys(Z).filter(k => /^dg\./.test(k))) for (const p of Z[k].matchAll(/\{(\w+)\}/g)) { n++; if (!(p[1] in P) && !['n', 'e', 's', 'last'].includes(p[1])) { fails++; console.error(`FAIL {${p[1]}} in ${k} has no source`); } }
  // literals in the prose, checked against the models
  says('ch1.limit', '2、4、6 毫秒'); check('TUNED start delays 2, 4, 6', M.POWER.start.join(), '2,4,6');
  says('ch3.p2', '8 个时钟的命令、24 个时钟的地址'); says('ch3.p2', '空等 8 个时钟'); says('ch3.p2', '只要 6 个时钟，再加 2 个时钟的模式位和 4 个空等时钟，数据每字节 2 个时钟');
  says('ch7.p3', '偏移 0 是 8 个字母的签名'); says('ch7.p3', '16 是表头自己的 CRC32'); says('ch7.p3', '24 是「我在哪个扇区」'); says('ch7.p3', '72 是分区项数组从哪开始'); says('ch7.p3', '88 是整个分区项数组的 CRC32');
  says('ch7.p3', '表头一共 92 字节'); says('ch7.p2', '一共 16 KiB'); check('16 KiB array', SRC.gpt.entryMin, 16 * 1024);
  says('ch6.p3', '0x7C00'); says('ch6.p3', '0xAA55'); says('ch6.p3', '512 字节');
  says('ch9.p4', '每条 {sigEntry} 字节'); says('ch11.p3', '0x000VV000'); says('ch2.p3', '16 个字节');
  check('16 bytes below 4 GiB', 0x100000000 - M.resetVector(32).linear, 16);
  // the claims the prose makes about the numbers
  check('ch1: T3 dominates the wait to PWR_OK', P.pOk[0] - P.pT1[0] > P.pT1[0] * 5, true);
  check('ch5: S4 saves little against a normal boot', P.tNormal[0] - P.tS4[0] < 4, true);
  check('ch9: hash list of 150 is the same order as ~10 kB', P.bhBytes[0] > 5000 && P.bhBytes[0] < 10240, true);
  check('ch10: a one-line firmware change flips most digits', P.pcrDiff[0] > 50, true);
  check('ch3: EBh image read ≈ ten times 03h', P.spiX[0] > 10, true);
}

/* ── sentence branches ── */
{
  const has = k => { n++; if (Z[k] == null) { fails++; console.error('FAIL missing say key ' + k); } };
  const seen = new Set(), add = s => { has(s.key); seen.add(s.key); };
  for (let ramp = 1; ramp <= 30; ramp += 1) for (let v = 0; v <= 20; v++) for (const t3 of [50, 100, 150, 250, 300]) add(M.say.power(M.powerOn({ ramp, set33: 3 + 0.02 * v, t3 })));
  for (const s of [[2, 4, 6], [195, 200, 205]]) add(M.say.power(M.powerOn({ start: s })));
  for (const m of ['reset', 'far']) for (const ok of [true, false]) add(M.say.reset(m, ok));
  for (const c of M.SPI.order) for (const mhz of M.SPI.clocks) for (const b of M.SPI.sizes) add(M.say.spi(M.spiRead(c, mhz, b)));
  for (const s of M.TL.scenarios) add(M.say.timeline(s));
  for (const c of M.MADT.cores) for (const bad of [false, true]) add(M.say.madt(M.madt(c, bad)));
  const d = M.gptBuild(64, 260);
  for (const e of M.GPT.edits) for (const fx of [false, true]) for (const b of [false, true]) add(M.say.gpt(M.gptParse(M.gptEdit(d, e, fx, b)), e, fx));
  for (const shim of M.SB.shims) for (const grub of M.SB.grubs) for (const kernel of M.SB.kernels) for (const sb of [true, false]) for (const dbx of [false, true]) for (const mok of [false, true]) for (const sbat of [1, 2]) add(M.say.chain(M.chain({ shim, grub, kernel, sb, dbx, mok, sbat })));
  for (const s of M.REV.scenarios) for (const m of M.REV.methods[s]) for (const db23 of [true, false]) add(M.say.revoke(M.revoke(s, m, 150, db23)));
  for (const p of M.PCR.policies) for (const tp of M.PCR.tampers) add(M.say.pcr(p, tp));
  for (const k of M.SMP.threads) add(M.say.smp(k));
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
  for (const s of M.TL.stages) keys.add('ch5.st.' + s);
  for (const s of M.TL.scenarios) keys.add('ch5.sc.' + s);
  for (const w of ['ok', 'off', 'badsig', 'untrusted', 'unsigned', 'dbxhash', 'dbxcert', 'sbat']) keys.add('ch8.why.' + w);
  for (const w of ['fw', 'shim', 'grub']) keys.add('ch8.who.' + w);
  for (const k of Object.keys(M.KEYS).filter(k => ['msUefi2011', 'distro', 'mok', 'attacker'].includes(k))) keys.add('ch8.signer.' + k);
  for (const i of ['none', '0', '1', '2']) keys.add('ch8.stop.' + i);
  for (const r of ['old', 'sibling', 'cur', 'media']) keys.add('ch9.row.' + r);
  for (const b of M.PCR.banks) keys.add('ch10.w.' + b);
  for (const w of ['sig', 'hdrcrc', 'mylba', 'arrcrc']) keys.add('ch7.why.' + w);
  for (const u of ['primary', 'backup', 'none']) keys.add('ch7.use.' + u);
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
  check('thirteen diagrams (six or more required)', dgs.join(), 'power,map,spi,first,car,flow,acpi,gpt,chain,revoke,pcr,sipi,arm');
  for (const d of dgs) { check('diagram spec ' + d, app.includes('DG.' + d + ' = '), true); for (const s of ['cap', 'aria']) check(`dg.${d}.${s}`, typeof Z[`dg.${d}.${s}`], 'string'); }
  for (const s of ['示意，不按比例', '示意。', '本页的模型算出']) { n++; if (!dgs.some(d => Z['dg.' + d + '.cap'].includes(s))) { fails++; console.error('FAIL no caption says ' + s); } }
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
  check('registry slug/path', R.slug + ' ' + R.path, 'how-a-computer-boots computing/systems/how-a-computer-boots/');
  check('registry category', [R.category, R.subtopic, R.stage].join('/'), 'computing/systems/university');
  check('registry title', R.title.zh, Z['doc.title'].split(' · ')[0]); check('registry desc', R.desc.zh, Z['doc.desc']);
  check('hero title = registry title', Z['hero.title'], R.title.zh);
  for (const c of R.concepts) check('anchor ' + c.anchor, html.includes('id="' + c.anchor.slice(1) + '"'), true);
  for (const c of R.concepts) { n++; if (!c.aliases.zh.length || !c.aliases.en.length || !c.title.en || !c.desc.en || !c.title.zh || !c.desc.zh) { fails++; console.error('FAIL concept incomplete ' + c.id); } }
  check('one concept per chapter', R.concepts.map(c => c.anchor).join(), Array.from({ length: 14 }, (_, i) => '#ch' + (i + 1)).join());
  // one word, one owner: every alias anywhere else (sibling registries, atlas lessons, the alias table) is off limits,
  // plus the words the task file reserves for siblings that are not registered yet
  const norm = s => s.toLowerCase().replace(/\s+/g, '');
  const mine = new Set(R.concepts.map(c => c.id));
  const owned = new Map(), own = (a, who) => { if (typeof a === 'string' && !owned.has(norm(a))) owned.set(norm(a), who); };
  const AL = JSON.parse(fs.readFileSync(path.join(ROOT, 'atlas', 'graph', 'aliases.json'), 'utf8'));
  for (const [id, v] of Object.entries(AL)) if (!mine.has(id)) for (const l of ['zh', 'en']) (v[l] || []).forEach(a => own(a, 'atlas aliases ' + id));
  const LD = path.join(ROOT, 'atlas', 'graph', 'lessons');
  for (const fn of fs.readdirSync(LD)) {
    if (fn === 'how-a-computer-boots.json') continue;
    const d = JSON.parse(fs.readFileSync(path.join(LD, fn), 'utf8'));
    for (const nd of d.nodes || []) if (nd.aliases && !mine.has(nd.id)) for (const l of ['zh', 'en']) (nd.aliases[l] || []).forEach(a => own(a, 'lesson ' + fn));
  }
  for (const sub of fs.readdirSync(path.join(DIR, '..'))) {
    const p = path.join(DIR, '..', sub, 'REGISTRY.json');
    if (sub !== 'how-a-computer-boots' && fs.existsSync(p)) for (const c of JSON.parse(fs.readFileSync(p, 'utf8')).concepts || []) for (const a of [...c.aliases.zh, ...c.aliases.en]) own(a, sub);
  }
  for (const a of ['PCIe 枚举', 'BAR', '配置空间', '开机点名', 'PCIe enumeration']) own(a, 'how-pcie-works (task file)');
  for (const a of ['内存训练', '开机内存训练黑屏', 'memory training']) own(a, 'how-memory-talks (task file)');
  for (const a of ['SPI', 'eSPI', 'I2C']) own(a, 'how-a-computer-is-wired (task file)');
  for (const a of ['IOMMU', 'DMA 攻击', 'DMA attack']) own(a, 'how-thunderbolt-works (task file)');
  for (const a of ['数字签名', '证书链', '根证书', 'CA', 'RSA 签名', 'digital signature', 'certificate chain', 'root certificate', '哈希函数', 'hash function']) own(a, 'a-secret-in-public (task file)');
  for (const a of ['GPT']) own(a, 'ambiguous with the language model');
  for (const c of R.concepts) for (const a of [...c.aliases.zh, ...c.aliases.en]) { n++; if (owned.has(norm(a))) { fails++; console.error(`FAIL alias owned by ${owned.get(norm(a))}: ${a}`); } }
  const mineAll = R.concepts.flatMap(c => [...c.aliases.zh, ...c.aliases.en]).map(norm);
  check('no alias twice on this page', new Set(mineAll).size, mineAll.length);
  for (const w of ['安全启动', 'Secure Boot', '复位向量', 'reset vector', 'UEFI', 'GUID 分区表', '度量启动', 'measured boot', 'INIT-SIPI-SIPI']) check('this page takes ' + w, mineAll.includes(norm(w)), true);
  // links: only live siblings, chapters that exist, titles quoted as in their copy
  const all = Object.values(Z).join('');
  const LIVE = ['how-a-cpu-runs-a-program', 'how-a-computer-is-wired', 'how-pcie-works', 'how-virtual-memory-works', 'what-a-drive-is-made-of', 'how-thunderbolt-works', 'how-cores-share-memory', 'how-memory-talks', 'rsa-encryption'];
  const hrefs = [...all.matchAll(/href='([^']+)'/g)].map(m => m[1]);
  for (const h of hrefs) { n++; if (!new RegExp('^\\.\\./(' + LIVE.join('|') + ')/(#ch\\d+)?$').test(h)) { fails++; console.error('FAIL unexpected link ' + h); } }
  for (const sib of LIVE) {
    const sh = fs.readFileSync(path.join(DIR, '..', sib, 'index.html'), 'utf8');
    for (const m of all.matchAll(new RegExp("href='\\.\\./" + sib + "/(#ch\\d+)?'", 'g'))) if (m[1]) check(`${sib} anchor ${m[1]}`, sh.includes(`id="${m[1].slice(1)}"`), true);
    const cp = path.join(DIR, '..', sib, 'copy.zh.js');
    if (fs.existsSync(cp)) { const cz = { window: {} }; vm.runInNewContext(fs.readFileSync(cp, 'utf8'), cz); check(sib + ' title quoted as in its copy', all.includes('《' + cz.window.ESSAY_COPY.zh['hero.title'] + '》'), true); }
  }
  check('rsa-encryption title as in pages.config.js', all.includes('《RSA 公钥加密》') && fs.readFileSync(path.join(ROOT, 'pages.config.js'), 'utf8').includes('title: { zh: "RSA 公钥加密 ·'), true);
  for (const [h, why] of [['../how-pcie-works/#ch6', 'enumeration'], ['../how-memory-talks/#ch7', 'training'], ['../how-a-computer-is-wired/#ch8', 'SPI'], ['../how-thunderbolt-works/#ch8', 'IOMMU'], ['../how-virtual-memory-works/#ch3', 'paging'], ['../what-a-drive-is-made-of/#ch1', 'LBA']]) check(`links ${h} (${why})`, hrefs.includes(h), true);
  // the unregistered sibling is named in plain text, ready for the registrar to link
  check('a-secret-in-public named in plain text', (all.match(/《当着所有人的面约定一个秘密》/g) || []).length, 2);
  check('a-secret-in-public not linked yet', /a-secret-in-public/.test(all), false);
  { const cz = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, '..', 'a-secret-in-public', 'copy.zh.js'), 'utf8'), cz); check('its title as in its copy', cz.window.ESSAY_COPY.zh['hero.title'], '当着所有人的面约定一个秘密'); }
  // safety: the two incidents stay at advisory level
  for (const k of ['ch9.p2', 'ch9.p3']) { n++; if (/shellcode|payload|绕过步骤|利用步骤|exploit/i.test(Z[k])) { fails++; console.error('FAIL exploit wording in ' + k); } }
  says('ch9.p5', '没有、也不该有利用的细节');

  const ectx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.en.js'), 'utf8'), ectx);
  const EN = ectx.window.ESSAY_COPY.en, stub = ectx.window.ESSAY_COPY.enStub === true, ph = s => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');
  check('en keys = zh keys', Object.keys(EN).sort().join('|'), Object.keys(Z).sort().join('|'));
  for (const k of Object.keys(Z)) check('en placeholders ' + k, ph(EN[k]), ph(Z[k]));
  // review 2026-11-15: English model count, PCR units, no doubled units after a placeholder that already carries one
  { const has = (k, s) => { n++; if (!EN[k] || !EN[k].includes(s)) { fails++; console.error(`FAIL en ${k} should contain "${s}"`); } };
    has('doc.desc', 'Ten hands-on models'); has('ch10.read.diff', 'Hex digits'); has('ch10.p4', '64 hex digits'); has('ch13.d1', 'does not look at a certificate');
    has('ch11.p5', 'not a measurement'); has('ch11.say.mid', 'extrapolated'); has('ch5.p5', 'tuned parameters');
    for (const k of Object.keys(EN)) { n++; if (/\{(t1|t2|t3|ok|ser|par|total|train)\} (ms|s|µs)\b/.test(EN[k]) || /64 bits/.test(EN[k])) { fails++; console.error('FAIL en doubled unit or PCR bits in ' + k); } } }
  if (stub) { check('en stub mirrors zh exactly', JSON.stringify(EN), JSON.stringify(Z)); console.log('NOTE: copy.en.js is a stub (enStub); English registry match skipped until it is translated'); }
  else { check('registry title en', R.title.en, EN['doc.title'].split(' · ')[0]); check('registry desc en', R.desc.en, EN['doc.desc']); }
}

if (fails) { console.error(`\n${fails} of ${n} checks failed`); process.exit(1); }
console.log(`PASS: ${n} checks (SHA-256 and CRC32 vs node, ATX timing, reset vector, SPI clocks, timeline sums, MADT checksum, GPT vs an independent parse and the backup fallback, RSA round trips and the verifier order, revocation outcomes and dbx bytes, PCR extends vs node crypto, bring-up calibration, sourced and frontier figures, every number in the prose, every sentence branch, keys, registry, links and aliases)`);
