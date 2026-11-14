/* How USB drives talk: the page's models. Each one implements a table or rule from a standard, or a named textbook
   result; constants that are tuned (not taken from a source) are marked TUNED here and flagged on the page.
   Units: MB/s means 1e6 bytes per second, which is also 1 byte per microsecond, so bytes / (MB/s) = µs.
   UMD: window.UsbModels in the browser, module.exports in node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.UsbModels = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

  /* ── Figures quoted from documents (sources and dates opened in BRIEF.md). ── */
  const SPEC = {
    // USB 2.0 (usb_20.pdf, 2023-02-24 package): §5.3.3 microframe 125 µs; Table 5-10 high-speed bulk limits,
    // "Protocol Overhead (55 bytes)"; rows: payload, max transfers, bytes remaining, useful bytes per microframe
    usb2: {
      mbit: 480, microframeUs: 125, overhead: 55, maxPacket: 512, maxBps: 53248000,
      table510: [[1, 133, 52, 133], [2, 131, 33, 262], [4, 127, 7, 508], [8, 119, 3, 952], [16, 105, 45, 1680], [32, 86, 18, 2752],
        [64, 63, 3, 4032], [128, 40, 180, 5120], [256, 24, 36, 6144], [512, 13, 129, 6656]]
    },
    // USB 3.2 Revision 1.1 (June 2022): revision history; §4.4.11 efficiency; §7.2.1 packet structure
    usb3: {
      dates: { usb30: '2008-11-12', usb31: '2013-07-26', usb32: '2017-09-22', usb32r11: '2022-06' },
      g1Raw: 500, g1Eff: 450, g2Raw: 1200, g2Eff: 1100,      // §4.4.11: "500 MB/sec", "450 MB/sec or less", "approximately 1.2 GB/sec", "approximately 1.1 GB/sec"
      maxPayload: 1024, hdrG1: 20, hdrG2: 24, dppStart: 4, dppEnd: 4, crc32: 4,   // §7.2.1.1, Fig 7-4, §7.2.1.2
      streamsMax: 65533                                        // §4.4.6.4 "from 1 to up to 65533"
    },
    // USB4 Specification Version 2.0 (November 2025 build): release history, §4.3.1, §3.2
    usb4: { v1: '2019-08', v2: '2022-10', latestBuild: '2025-11', gen4Baud: 25.6, pam3Bits: 11, pam3Trits: 7 },
    usb4v2Announced: '2022-10-18',                             // USB-IF press release
    namingGuide: '2024-01',                                    // USB Data Performance Language Usage Guidelines, Jan 2024
    // USB Mass Storage Class Bulk-Only Transport Revision 1.0 (cover date as printed: "September 31, 1999")
    bot: { rev: '1.0', datePrinted: 'September 31, 1999', cbwBytes: 31, cswBytes: 13, cbwSig: 0x43425355, cswSig: 0x53425355, maxCb: 16 },
    msco: { bbb: 0x50, uas: 0x62, scsi: 0x06 },                // MSC Specification Overview 1.4 (2010-02-19), Tables 1 and 2
    // UASP Revision 1.0 (2009-06-24) §2: BOT overhead "about 20%"; BOT on USB 3 "approximately 250 MB/s"; UASP "in excess of 400MB/s"
    uasp: { date: '2009-06-24', botOverheadPct: 20, botMBps: 250, uasMBps: 400 },
    linuxUas: { maxCmnds: 256, noStreamsQd: 32, reserve: 2, checked: '2026-11-14' },   // drivers/usb/storage/uas.c
    scsi: { read10: 0x28, read16: 0x88, unmap: 0x42, writeSame16: 0x93, ata16: 0x85, ata12: 0xA1 }, // include/scsi/scsi_proto.h
    satStd: 'ANSI INCITS 431-2007',                            // per smartctl(8)
    // bridge product briefs (JMicron): upstream USB, downstream link
    bridges: { jms583: { usb: 'g2x1', pcie: [3, 2], date: '2018-05-15' }, jms581d: { usb: 'g2x1', pcie: [3, 2], sata: true, date: '2020-01-20' },
      jms586a: { usb: 'g2x2', pcie: [3, 2], date: '2021-07-01' } },
    // Intel Thunderbolt 5 technology brief (2023-09): PC data requirements, PCIe 64 Gbps (TB5) and 32 Gbps (TB4)
    tb: { tb4Pcie: 32, tb5Pcie: 64, tb5Link: 80, tb5Boost: 120, tb5Usb3: 10, tb4Usb3: 10, tb5Date: '2023-09' },
    // SD Association bus speed page: SD Express 985 / 1970 / 3940 MB/s; UHS-I 104, UHS-II 312 (half duplex), UHS-III 624
    sd: { uhs1: 104, uhs2: 312, uhs3: 624, ex7: 985, ex8: 3940 },
    // drive data sheets: a PCIe 4.0 x4 drive (Samsung 990 EVO Plus rev 1.0: 7,250 MB/s read 2/4 TB; read 5.5 W at 4 TB;
    // operating 0–70 °C) and a SATA drive (Samsung 870 EVO rev 1.1: 560 MB/s)
    nvmeSeq: 7250, nvmeReadW: 5.5, nvmeOpMax: 70, sataSeq: 560,
    die: { tlcWriteMBps: 194, paper: 'ISSCC 2023, 28.2' }       // title of the SK hynix paper: "…with a 194MB/s Write Throughput…"
  };

  /* ── 02 USB 2.0: the host packs bulk transactions into each 125 µs microframe. 480 Mb/s × 125 µs = 7,500 bytes;
     each transaction costs payload + 55 bytes (Table 5-10 header). This reproduces every row of Table 5-10. ── */
  const USB2 = {
    perMicroframe() { return SPEC.usb2.mbit * 1e6 * SPEC.usb2.microframeUs * 1e-6 / 8; },          // 7500
    pack(payload) {
      const B = this.perMicroframe(), per = payload + SPEC.usb2.overhead, n = Math.floor(B / per);
      return { n, remaining: B - n * per, useful: n * payload, bps: n * payload * 8000, share: per / B, eff: n * payload / B };
    },
    rawMBps() { return SPEC.usb2.mbit / 8; }                                                     // 60
  };

  /* ── 03 from the label to the wire. lanes × signalling rate × encoding gives the raw byte rate; a full 1024-byte
     SuperSpeed data packet costs header (20 bytes Gen 1, 24 Gen 2 non-deferred), DPP framing 4 + 4 and CRC-32 4.
     That packet accounting is this page's; the spec's own "450 MB/s or less" and "about 1.1 GB/s" (§4.4.11) also
     count flow control and protocol and are quoted, not derived. USB4 Gen 4 FEC is not modelled. ── */
  const MODES = {
    hs:   { lanes: 1, gbps: 0.48, enc: [1, 1], family: 'usb2' },
    g1x1: { lanes: 1, gbps: 5, enc: [8, 10], family: 'usb3', hdr: 20, eff: 450 },
    g2x1: { lanes: 1, gbps: 10, enc: [128, 132], family: 'usb3', hdr: 24, eff: 1100 },
    g1x2: { lanes: 2, gbps: 5, enc: [8, 10], family: 'usb3', hdr: 20, eff: 900 },
    g2x2: { lanes: 2, gbps: 10, enc: [128, 132], family: 'usb3', hdr: 24, eff: 2200 },
    u4g2: { lanes: 2, gbps: 10, enc: [64, 66], family: 'usb4' },
    u4g3: { lanes: 2, gbps: 20, enc: [128, 132], family: 'usb4' },
    u4g4: { lanes: 2, gbps: 25.6 * 11 / 7, enc: [1, 1], family: 'usb4', pam3: true }
  };
  // printed names on boxes → spec mode (USB 3.0 became USB 3.1 Gen 1 in 2013 and USB 3.2 Gen 1 in 2017)
  const LABELS = [
    ['usb20', 'hs'], ['usb30', 'g1x1'], ['usb31g1', 'g1x1'], ['usb32g1', 'g1x1'], ['usb5', 'g1x1'],
    ['usb31g2', 'g2x1'], ['usb32g2', 'g2x1'], ['usb10', 'g2x1'], ['usb32g1x2', 'g1x2'],
    ['usb32g2x2', 'g2x2'], ['usb20g', 'g2x2'], ['usb4_20', 'u4g2'], ['usb4_40', 'u4g3'], ['usb80', 'u4g4']
  ];
  const LINE = {
    lineGbps(m) { const o = MODES[m]; return o.lanes * o.gbps; },
    rawMBps(m) { const o = MODES[m]; return o.lanes * o.gbps * 1000 * o.enc[0] / o.enc[1] / 8; },
    packetEff(m) { const o = MODES[m]; if (!o.hdr) return null; const p = SPEC.usb3.maxPayload; return p / (o.hdr + SPEC.usb3.dppStart + p + SPEC.usb3.crc32 + SPEC.usb3.dppEnd); },
    framedMBps(m) { const o = MODES[m]; if (o.family === 'usb2') return SPEC.usb2.maxBps / 1e6; const e = this.packetEff(m); return e == null ? null : this.rawMBps(m) * e; },
    specMBps(m) { const o = MODES[m]; if (o.family === 'usb2') return SPEC.usb2.maxBps / 1e6; return o.eff || null; },
    // consumer name per the January 2024 guideline: by aggregate signalling rate
    marketGbps(m) { const g = this.lineGbps(m); return g < 1 ? null : g > 70 ? 80 : Math.round(g); },
    // USB 3.2 Table 7-14: start-up PHY capability for a host (DFP) and a device (UFP); tests check all 16 cells
    negotiate(dfp, ufp) {
      const T = { g1x1: { g1x1: 'g1x1', g1x2: 'g1x1', g2x1: 'g1x1', g2x2: 'g1x1' }, g1x2: { g1x1: 'g1x1', g1x2: 'g1x2', g2x1: 'g1x1', g2x2: 'g1x2' },
        g2x1: { g1x1: 'g1x1', g1x2: 'g1x1', g2x1: 'g2x1', g2x2: 'g2x1' }, g2x2: { g1x1: 'g1x1', g1x2: 'g1x2', g2x1: 'g2x1', g2x2: 'g2x2' } };
      return T[dfp][ufp];
    }
  };

  /* ── 04/05 one command at a time vs a queue. A closed system with N commands in flight (Lazowska, Zahorjan,
     Graham and Sevcik, Quantitative System Performance, 1984, ch. 5, asymptotic bounds): throughput
     X(N) ≤ min(N·S / R, 1 / D_max), R = per-command time on an otherwise idle system, D_max = the busiest single
     stage per command. Bulk-Only is N = 1 by construction (BOT 1.0 §5: CBW, data, CSW, then the next CBW).
     R = t_cmd (host + bridge turnaround including the CBW and CSW, or the command and status IUs; TUNED)
       + t_media (flash read latency before the first byte; TUNED stand-in)
       + S / min(link, drive)  (data moves at the slower of the two; the bridge is assumed to stream, not store).
     D_max = max(S / min(link, drive), t_cpu), t_cpu = bridge processing per command (TUNED). ── */
  const Q = {
    tCmd: 50,      // µs, TUNED
    tMedia: 50,    // µs, TUNED stand-in (NVMe essay #ch5 quotes tR ≈ 50 µs)
    tCpu: 4,       // µs, TUNED: bridge firmware per command when commands overlap
    run(S, link, drive, N, o) {
      const p = Object.assign({ tCmd: this.tCmd, tMedia: this.tMedia, tCpu: this.tCpu }, o || {});
      const pipe = Math.min(link, drive), tData = S / pipe, R = p.tCmd + p.tMedia + tData;
      const latBound = N * S / R, linkBound = pipe, cpuBound = S / p.tCpu;
      const X = Math.min(latBound, linkBound, cpuBound);
      const lim = X === linkBound ? (link <= drive ? 'link' : 'drive') : X === cpuBound ? 'cpu' : 'latency';
      return { X, R, iops: X / S * 1e6, util: X / link, lim, latBound, linkBound, cpuBound, tData, wait: R - tData };
    },
    bot(S, link, drive, o) { return this.run(S, link, drive, 1, o); },
    uas(S, link, drive, N, o) { return this.run(S, link, drive, N, o); },
    // the block size at which Bulk-Only reaches a share f of the pipe: S = f/(1−f) · pipe · (t_cmd + t_media)
    sizeFor(f, link, drive, o) { const p = Object.assign({ tCmd: this.tCmd, tMedia: this.tMedia }, o || {}); return f / (1 - f) * Math.min(link, drive) * (p.tCmd + p.tMedia); },
    // the queue depth at which the latency bound meets the pipe: N* = R / tData
    knee(S, link, drive, o) { const r = this.run(S, link, drive, 1, o); return r.R / r.tData; }
  };

  /* ── 04 the bytes of one Bulk-Only command: a 31-byte CBW around a SCSI CDB, and the 13-byte CSW (BOT 1.0 Tables
     5.1, 5.2; little endian). READ(10) and READ(16) CDB layouts from SBC (big endian fields). ── */
  const WRAP = {
    le32(v) { return [v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255]; },
    cdb(op, lba, blocks) {
      if (op === 'read16') { const hi = Math.floor(lba / 4294967296), lo = lba >>> 0; return [0x88, 0, hi >>> 24 & 255, hi >>> 16 & 255, hi >>> 8 & 255, hi & 255, lo >>> 24 & 255, lo >>> 16 & 255, lo >>> 8 & 255, lo & 255, blocks >>> 24 & 255, blocks >>> 16 & 255, blocks >>> 8 & 255, blocks & 255, 0, 0]; }
      return [0x28, 0, lba >>> 24 & 255, lba >>> 16 & 255, lba >>> 8 & 255, lba & 255, 0, blocks >>> 8 & 255, blocks & 255, 0];
    },
    cbw(tag, lba, blocks, op, blockSize) {
      const cb = this.cdb(op, lba, blocks), len = blocks * (blockSize || 512), b = [];
      b.push(...this.le32(SPEC.bot.cbwSig), ...this.le32(tag), ...this.le32(len), 0x80, 0, cb.length);
      for (let i = 0; i < 16; i++) b.push(i < cb.length ? cb[i] : 0);
      return { bytes: b, cdb: cb, len };
    },
    csw(tag, residue, status) { return [...this.le32(SPEC.bot.cswSig), ...this.le32(tag), ...this.le32(residue || 0), status || 0]; },
    hex(a) { return a.map(x => x.toString(16).toUpperCase().padStart(2, '0')); },
    maxBlocks(op) { return op === 'read16' ? 4294967295 : 65535; },
    maxLba(op) { return op === 'read16' ? Math.pow(2, 64) - 1 : 4294967295; }
  };

  /* ── 06 translation inside the box. A SCSI command arriving over BOT or UAS becomes an ATA command (T10 SAT) for a
     SATA drive, or an NVMe command (NVM Express SCSI Translation Reference 1.1, Figure 2) for an NVMe drive.
     READ(10)/(16): LBA → ATA LBA / NVMe SLBA; TRANSFER LENGTH → ATA COUNT / NVMe NLB, which is zero-based. ── */
  const XLATE = {
    // returns { ata, nvme } with field lists; nvme NLB is blocks − 1 (NVMe Read, CDW12 bits 15:0)
    read(lba, blocks) {
      return { ata: { op: 0x60, name: 'READ FPDMA QUEUED', lba, count: blocks }, nvme: { op: 0x02, name: 'Read', slba: lba, nlb: blocks - 1 } };
    },
    rows: ['read', 'unmap', 'logsense', 'ata16', 'sync', 'inquiry'],
    // whether the bridge has a standard path for each row: SAT for SATA, the translation reference for NVMe
    path: { read: [1, 1], unmap: [1, 1], logsense: [1, 1], ata16: [1, 0], sync: [1, 1], inquiry: [1, 1] }
  };

  /* ── 06/08 the chain from flash to the host. Every stage has a payload ceiling; the copy runs at the narrowest,
     then the protocol term (Q.run) applies. PCIe per lane: 8 GT/s × 128/130 (Gen 3), 16 GT/s (Gen 4), the same
     raw figures the SD Association quotes for SD Express; packet efficiency η is TUNED. ── */
  const CHAIN = {
    eta: 0.85,                      // TUNED: share of a PCIe or tunnel byte rate left for data after packet headers
    S: 1048576, N: 4,               // assumption stated on the page: a big copy, 1 MiB requests, 4 in flight under UAS
    pcieLane(gen) { return (gen === 4 ? 16 : 8) * 1000 * 128 / 130 / 8; },
    pcie(gen, lanes, eta) { return this.pcieLane(gen) * lanes * (eta == null ? this.eta : eta); },
    drive(d) { return d === 'sata' ? SPEC.sataSeq : SPEC.nvmeSeq; },
    bridge(b, eta) { if (b === 'sata') return 600; const m = /^p(\d)x(\d)$/.exec(b); return this.pcie(+m[1], +m[2], eta); },
    // the USB-bridge path. box and host are USB 3.2 modes; the link that comes up is Table 7-14's cell
    usb(o) {
      const p = Object.assign({ drive: 'nvme', bridge: 'p3x2', box: 'g2x1', host: 'g2x1', proto: 'uas', eta: this.eta }, o || {});
      const fits = (p.drive === 'sata') === (p.bridge === 'sata');
      const mode = LINE.negotiate(p.host, p.box), usbCap = LINE.specMBps(mode), drv = this.drive(p.drive), br = this.bridge(p.bridge, p.eta);
      const stages = [['drive', drv], ['bridge', br], ['usb', usbCap]];
      const pipe = Math.min(br, usbCap);
      const r = Q.run(this.S, pipe, drv, p.proto === 'bot' ? 1 : this.N, p.qOpts);
      let min = stages[0]; for (const s of stages) if (s[1] < min[1]) min = s;
      return { fits, mode, stages, X: fits ? r.X : 0, cap: min[1], neck: min[0], proto: r, fellBack: mode !== p.box };
    },
    // the PCIe-tunnel path (Thunderbolt 4/5, USB4 hosts that tunnel PCIe): no SCSI, the NVMe queue goes straight through
    tunnel(o) {
      const p = Object.assign({ host: 'tb4', eta: this.eta, bridge: 'p4x4' }, o || {});
      const drv = SPEC.nvmeSeq, br = this.bridge(p.bridge, p.eta);
      if (p.host === 'usb4np') {              // a USB4 host without PCIe tunnelling: the box falls back to its USB 3 side (10 Gbps tunnel)
        const r = this.usb({ drive: 'nvme', bridge: p.bridge, box: 'g2x1', host: 'g2x1', proto: 'uas', eta: p.eta });
        return { X: r.X, stages: [['drive', drv], ['bridge', br], ['usb', LINE.specMBps('g2x1')]], neck: 'usb', cap: LINE.specMBps('g2x1'), pcie: false };
      }
      const tun = (p.host === 'tb5' ? SPEC.tb.tb5Pcie : SPEC.tb.tb4Pcie) * 1000 / 8 * p.eta;
      const stages = [['drive', drv], ['bridge', br], ['tunnel', tun]];
      let min = stages[0]; for (const s of stages) if (s[1] < min[1]) min = s;
      return { X: min[1], stages, neck: min[0], cap: min[1], pcie: true };
    }
  };

  /* ── 07 heat. Lumped capacitance (Newton cooling; Incropera & DeWitt, Fundamentals of Heat and Mass Transfer, §5.2):
     C dT/dt = P − (T − Ta)/R. P = bridge + drive, drive power linear between an active floor and the data-sheet
     read power at full rate. When T reaches the threshold the drive slows to a fraction f until T falls by the
     hysteresis band (a bang-bang throttle). R, C, the floor, the bridge power, f and the threshold are TUNED. ── */
  const HEAT = {
    C: 25, Rbox: { al: 6, plastic: 14 }, P0: 1.5, Pb: 1.0, f: 0.3, thr: SPEC.nvmeOpMax, hyst: 5, dur: 900,
    power(rate) { return this.Pb + this.P0 + (SPEC.nvmeReadW - this.P0) * rate / SPEC.nvmeSeq; },
    steady(rate, R, Ta) { return Ta + R * this.power(rate); },
    tStar(rate, R, Ta, C) { const P = this.power(rate), x = (this.thr - Ta) / (R * P); return x >= 1 || x <= 0 ? (x <= 0 ? 0 : Infinity) : -R * (C || this.C) * Math.log(1 - x); },
    // simulate a copy of `dur` seconds from T = Ta; returns the trace and averages
    sim(rate, R, Ta, o) {
      const p = Object.assign({ C: this.C, dt: 0.25, dur: this.dur }, o || {});
      let T = Ta, slow = false, t = 0, bytes = 0, tFirst = null, slowT = 0;
      const tr = [[0, T, rate]];
      while (t < p.dur - 1e-9) {
        const r = slow ? rate * this.f : rate, P = this.power(r);
        T += (P - (T - Ta) / R) / p.C * p.dt; t += p.dt; bytes += r * p.dt; if (slow) slowT += p.dt;
        if (!slow && T >= this.thr) { slow = true; if (tFirst == null) tFirst = t; }
        else if (slow && T <= this.thr - this.hyst) slow = false;
        if (Math.abs(t / 2 - Math.round(t / 2)) < 1e-6) tr.push([t, T, slow ? rate * this.f : rate]);
      }
      return { tr, avg: bytes / p.dur, gb: bytes / 1000, tFirst, slowShare: slowT / p.dur, Tend: T, Tmax: Math.max(...tr.map(x => x[1])) };
    },
    rate(box) { return box === 'tb5' ? CHAIN.tunnel({ host: 'tb5' }).X : CHAIN.usb({ box, host: box, bridge: box === 'g2x2' ? 'p3x4' : 'p3x2' }).X; }
  };

  /* ── 09 a flash drive or memory card: a controller and a few dies. Sequential write = min(dies × per-die program
     throughput, what the bus and protocol carry); the bus term reuses Q.run at 128 KiB for USB, and the SD
     Association's bus maxima for cards (no protocol model for SD). ── */
  const STICK = {
    S: 131072,
    bus(b) {
      if (b === 'u2bot') return Q.bot(this.S, SPEC.usb2.maxBps / 1e6, 1e9).X;
      if (b === 'u5bot') return Q.bot(this.S, SPEC.usb3.g1Eff, 1e9).X;
      if (b === 'u5uas') return Q.uas(this.S, SPEC.usb3.g1Eff, 1e9, 4).X;
      if (b === 'u10uas') return Q.uas(this.S, SPEC.usb3.g2Eff, 1e9, 4).X;
      if (b === 'uhs1') return SPEC.sd.uhs1; if (b === 'uhs2') return SPEC.sd.uhs2; return SPEC.sd.ex7;
    },
    write(dies, perDie, b) { const flash = dies * perDie, bus = this.bus(b); return { X: Math.min(flash, bus), flash, bus, neck: flash <= bus ? 'flash' : 'bus', diesToFill: bus / perDie }; }
  };

  /* ── frontier data block (as of November 2026; sources and dates opened in BRIEF.md) ── */
  const FRONTIER = {
    asOf: '2026-11',
    usb4v2: '2022-10-18', usb4Build: '2025-11-19', usb32Latest: '2022-06', naming: '2024-01',
    tb5: '2023-09', tb5Pcie: 64, tb4Pcie: 32,
    tb5Reported: [5400, 6650],   // MB/s, sequential reads reported by reviewers of TB5 enclosures in 2025–2026 (secondary)
    tb34Reported: 2800,          // MB/s, reported in user and review measurements for TB3/TB4 NVMe enclosures (secondary)
    sdEx8: 3940
  };

  /* ── numbers quoted in the prose. Each entry is [value, decimals, kind]; the page formats it for the current
     language and tests/models.cjs pins every one. ── */
  function prose() {
    const L1 = SPEC.usb3.g1Eff, L2 = SPEC.usb3.g2Eff, D = SPEC.nvmeSeq, K = 1024;
    const b4 = Q.bot(4 * K, L2, D), b128 = Q.bot(128 * K, L2, D), b1m = Q.bot(K * K, L2, D), b64g1 = Q.bot(64 * K, L1, D);
    const u4q32 = Q.uas(4 * K, L2, D, 32), u128q4 = Q.uas(128 * K, L2, D, 4), u4q8 = Q.uas(4 * K, L2, D, 8);
    const half = { tCmd: Q.tCmd / 2 }, dbl = { tCmd: Q.tCmd * 2 };
    const c10 = CHAIN.usb({ box: 'g2x1', host: 'g2x1', bridge: 'p3x2' }), c20 = CHAIN.usb({ box: 'g2x2', host: 'g2x2', bridge: 'p3x4' }),
      c20x2 = CHAIN.usb({ box: 'g2x2', host: 'g2x2', bridge: 'p3x2' }), c20on10 = CHAIN.usb({ box: 'g2x2', host: 'g2x1', bridge: 'p3x4' }),
      c10bot = CHAIN.usb({ box: 'g2x1', host: 'g2x1', bridge: 'p3x2', proto: 'bot' }), cSata = CHAIN.usb({ drive: 'sata', bridge: 'sata', box: 'g2x1', host: 'g2x1' });
    const t4 = CHAIN.tunnel({ host: 'tb4' }), t5 = CHAIN.tunnel({ host: 'tb5' }), tnp = CHAIN.tunnel({ host: 'usb4np' });
    const etas = [0.8, 0.92].map(e => CHAIN.tunnel({ host: 'tb4', eta: e }).X);
    const R = HEAT.Rbox, h10p = HEAT.sim(HEAT.rate('g2x1'), R.plastic, 25), h20p = HEAT.sim(HEAT.rate('g2x2'), R.plastic, 25), h5p = HEAT.sim(HEAT.rate('tb5'), R.plastic, 25),
      h5a = HEAT.sim(HEAT.rate('tb5'), R.al, 25);
    const st = STICK.write(1, SPEC.die.tlcWriteMBps, 'u5bot'), st2 = STICK.write(2, SPEC.die.tlcWriteMBps, 'u5bot'), stu2 = STICK.write(2, SPEC.die.tlcWriteMBps, 'u2bot');
    return {
      // ch2
      mf: [USB2.perMicroframe(), 0], u2n: [USB2.pack(512).n, 0], u2left: [USB2.pack(512).remaining, 0], u2max: [USB2.pack(512).bps / 1e6, 1], u2eff: [USB2.pack(512).eff, 1, 'pct'],
      u2n64: [USB2.pack(64).n, 0], u2mb64: [USB2.pack(64).bps / 1e6, 1], u2raw: [USB2.rawMBps(), 0],
      // ch3
      g1raw: [LINE.rawMBps('g1x1'), 0], g1fr: [LINE.framedMBps('g1x1'), 0], g2raw: [LINE.rawMBps('g2x1'), 0], g2fr: [LINE.framedMBps('g2x1'), 0],
      g22raw: [LINE.rawMBps('g2x2'), 0], g1pe: [LINE.packetEff('g1x1'), 1, 'pct'], g2pe: [LINE.packetEff('g2x1'), 1, 'pct'],
      u4g3raw: [LINE.lineGbps('u4g3') * 128 / 132, 1], u4g4lane: [MODES.u4g4.gbps, 2],
      // ch4
      b4: [b4.X, 1], b4iops: [b4.iops, 0], b128: [b128.X, 0], b1m: [b1m.X, 0], b90: [Q.sizeFor(0.9, L2, D) / K, 0], b64g1: [b64g1.X, 0],
      b4h: [Q.bot(4 * K, L2, D, half).X, 1], b4d: [Q.bot(4 * K, L2, D, dbl).X, 1], b90h: [Q.sizeFor(0.9, L2, D, half) / K, 0], b90d: [Q.sizeFor(0.9, L2, D, dbl) / K, 0],
      // ch5
      u4q32: [u4q32.X, 0], u4q32k: [u4q32.iops / 1000, 0], u4q8: [u4q8.X, 0], u128q4: [u128q4.X, 0], knee128: [Q.knee(128 * K, L2, D), 1], knee4: [Q.knee(4 * K, L2, D), 0],
      cpuH: [4 * K / (Q.tCpu / 2) , 0], cpuD: [4 * K / (Q.tCpu * 2), 0], linQd: [SPEC.linuxUas.maxCmnds - SPEC.linuxUas.reserve, 0],
      // ch6
      c10: [c10.X, 0], c20: [c20.X, 0], c20x2: [c20x2.X, 0], c20on10: [c20on10.X, 0], c10bot: [c10bot.X, 0], cSata: [cSata.X, 0],
      p3x2: [CHAIN.bridge('p3x2'), 0], p3x4: [CHAIN.bridge('p3x4'), 0], lane3: [CHAIN.pcieLane(3), 1],
      // ch7
      Pfull: [HEAT.power(SPEC.nvmeSeq), 1], P10: [HEAT.power(HEAT.rate('g2x1')), 1], T10p: [HEAT.steady(HEAT.rate('g2x1'), R.plastic, 25), 0], T20p: [HEAT.steady(HEAT.rate('g2x2'), R.plastic, 25), 0],
      T5p: [HEAT.steady(HEAT.rate('tb5'), R.plastic, 25), 0], T5a: [HEAT.steady(HEAT.rate('tb5'), R.al, 25), 0],
      ts5p: [HEAT.tStar(HEAT.rate('tb5'), R.plastic, 25), 0], avg5p: [h5p.avg, 0], avg20p: [h20p.avg, 0], avg10p: [h10p.avg, 0], avg5a: [h5a.avg, 0],
      tau: [R.plastic * HEAT.C / 60, 1], T20lo: [HEAT.steady(HEAT.rate('g2x2'), R.plastic / 2, 25), 0], T20hi: [HEAT.steady(HEAT.rate('g2x2'), R.plastic * 2, 25), 0],
      ts20p: [HEAT.tStar(HEAT.rate('g2x2'), R.plastic, 25) / 60, 1], durMin: [HEAT.dur / 60, 0],
      // ch8
      t4: [t4.X, 0], t5: [t5.X, 0], tnp: [tnp.X, 0], t4lo: [Math.min(...etas), 0], t4hi: [Math.max(...etas), 0], rep34: [FRONTIER.tb34Reported, 0],
      rep5lo: [FRONTIER.tb5Reported[0], 0], rep5hi: [FRONTIER.tb5Reported[1], 0], tunRaw4: [SPEC.tb.tb4Pcie * 1000 / 8, 0],
      // ch9
      st1: [st.X, 0], st2: [st2.X, 0], stu2: [stu2.X, 0], stBus: [st.bus, 0], stDies: [st.diesToFill, 1]
    };
  }

  /* ── formatting: language-aware ── */
  function fmt(x, d, lang) {
    if (x == null || !isFinite(x)) return '—';
    const s = (d == null ? (Math.abs(x) >= 100 ? 0 : Math.abs(x) >= 10 ? 1 : 2) : d);
    return Number(x).toLocaleString(lang === 'en' ? 'en-US' : 'zh-CN', { minimumFractionDigits: s, maximumFractionDigits: s });
  }
  function tunit(sec) {
    const a = Math.abs(sec);
    if (a < 1e-6) return { v: sec * 1e9, u: 'ns' }; if (a < 1e-3) return { v: sec * 1e6, u: 'us' }; if (a < 1) return { v: sec * 1e3, u: 'ms' }; return { v: sec, u: 's' };
  }

  /* ── live sentences: each returns { key, v } so the page can fill a whole-sentence template ── */
  const say = {
    usb2(payload) { const p = USB2.pack(payload); return { key: payload >= SPEC.usb2.maxPacket ? 'ch2.say.max' : (p.eff < 0.5 ? 'ch2.say.small' : 'ch2.say.mid'), v: p }; },
    label(id) {
      const m = LABELS.find(x => x[0] === id)[1], o = MODES[m];
      const v = { mode: m, line: LINE.lineGbps(m), raw: LINE.rawMBps(m), framed: LINE.framedMBps(m), spec: LINE.specMBps(m), market: LINE.marketGbps(m) };
      if (o.family === 'usb2') return { key: 'ch3.say.usb2', v };
      if (o.family === 'usb4') return { key: 'ch3.say.usb4', v };
      if (m === 'g1x2') return { key: 'ch3.say.g1x2', v };
      if (id === 'usb10') return { key: 'ch3.say.usb10', v };
      return { key: 'ch3.say.usb3', v };
    },
    bot(S, link, drive, tCmd) {
      const r = Q.bot(S, link, drive, { tCmd }); const v = { X: r.X, share: r.util, wait: r.wait, tData: r.tData, iops: r.iops };
      if (r.util < 0.5) return { key: 'ch4.say.wait', v };
      if (r.util < 0.9) return { key: 'ch4.say.mid', v };
      return { key: 'ch4.say.full', v };
    },
    uas(S, link, drive, N) {
      const r = Q.uas(S, link, drive, N), b = Q.bot(S, link, drive); const v = { X: r.X, bot: b.X, gain: r.X / b.X, n: N, knee: Q.knee(S, link, drive), iops: r.iops };
      if (N === 1) return { key: 'ch5.say.q1', v };
      if (r.lim === 'cpu') return { key: 'ch5.say.cpu', v };
      if (r.lim === 'link' || r.lim === 'drive') return { key: 'ch5.say.link', v };
      return { key: 'ch5.say.lat', v };
    },
    chain(o) {
      const r = CHAIN.usb(o); const v = { X: r.X, cap: r.cap, neck: r.neck, mode: r.mode, share: r.X / SPEC.nvmeSeq };
      if (!r.fits) return { key: 'ch6.say.nofit', v };
      if (r.fellBack) return { key: 'ch6.say.fallback', v };
      return { key: 'ch6.say.' + r.neck, v };
    },
    heat(box, Rk, Ta) {
      const rate = HEAT.rate(box), R = HEAT.Rbox[Rk], s = HEAT.sim(rate, R, Ta), Tinf = HEAT.steady(rate, R, Ta);
      const v = { rate, Tinf, tFirst: s.tFirst, avg: s.avg, slow: s.slowShare, thr: HEAT.thr };
      if (s.tFirst == null) return { key: 'ch7.say.cool', v };
      return { key: 'ch7.say.throttle', v };
    },
    tunnel(host) {
      const r = CHAIN.tunnel({ host }); const v = { X: r.X, neck: r.neck };
      if (!r.pcie) return { key: 'ch8.say.nopcie', v };
      return { key: r.neck === 'tunnel' ? 'ch8.say.tunnel' : 'ch8.say.bridge', v };
    },
    stick(dies, perDie, b) {
      const r = STICK.write(dies, perDie, b); const v = { X: r.X, flash: r.flash, bus: r.bus, need: r.diesToFill };
      return { key: r.neck === 'flash' ? 'ch9.say.flash' : 'ch9.say.bus', v };
    }
  };

  return { SPEC, USB2, MODES, LABELS, LINE, Q, WRAP, XLATE, CHAIN, HEAT, STICK, FRONTIER, fmt, tunit, say, clamp, prose };
});
