/* How Thunderbolt works: the page's models. Each implements a table, formula or rule from a standard (USB Type-C,
   USB4, the USB4 Connection Manager Guide, USB Power Delivery, VESA CVT) or a named textbook result; constants that
   are tuned rather than sourced are marked TUNED here and flagged on the page.
   Units: Gbps = 1e9 bit/s; 1 Gbps carries 125 MB/s (1 MB = 1e6 bytes).
   UMD: window.TbModels in the browser, module.exports in node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.TbModels = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

  /* ── Figures quoted from documents (sources and dates opened in BRIEF.md). ── */
  const SPEC = {
    // USB Type-C Cable and Connector Specification Release 2.5 (March 2026), Table 3-4: receptacle pin assignments.
    // [pin, signal, group]; group drives the diagram colour (hs = high-speed pair, usb2, cc, sbu, pwr, gnd)
    pins: [
      ['A1', 'GND', 'gnd'], ['A2', 'TX1+', 'hs'], ['A3', 'TX1−', 'hs'], ['A4', 'VBUS', 'pwr'], ['A5', 'CC1', 'cc'], ['A6', 'D+', 'usb2'],
      ['A7', 'D−', 'usb2'], ['A8', 'SBU1', 'sbu'], ['A9', 'VBUS', 'pwr'], ['A10', 'RX2−', 'hs'], ['A11', 'RX2+', 'hs'], ['A12', 'GND', 'gnd'],
      ['B1', 'GND', 'gnd'], ['B2', 'TX2+', 'hs'], ['B3', 'TX2−', 'hs'], ['B4', 'VBUS', 'pwr'], ['B5', 'CC2', 'cc'], ['B6', 'D+', 'usb2'],
      ['B7', 'D−', 'usb2'], ['B8', 'SBU2', 'sbu'], ['B9', 'VBUS', 'pwr'], ['B10', 'RX1−', 'hs'], ['B11', 'RX1+', 'hs'], ['B12', 'GND', 'gnd']
    ],
    // Table 4-27 (Rp, resistor pull-up to 4.75–5.5 V), Table 4-28 (Rd 5.1 kΩ ±10 %), Table 4-36 (sink CC voltage windows),
    // Table 4-29 (Ra 800 Ω – 1.2 kΩ)
    cc: {
      rp: { usb: { k: 56, tol: 0.20, amps: 0.9 }, a15: { k: 22, tol: 0.05, amps: 1.5 }, a30: { k: 10, tol: 0.05, amps: 3.0 } },
      pull: [4.75, 5.5], pullNom: 5, rd: 5.1, rdTol: 0.10, ra: [0.8, 1.2],
      win: { usb: [0.277, 0.612], a15: [0.746, 1.164], a30: [1.369, 2.042] }, disconnect: 0.276
    },
    // Type-C R2.5 Table 3-1: passive cable assemblies (informative practical lengths) and current ratings
    cables: { g1: 2, g2: 1, g3: 0.8, usb2: 4 },
    // USB4 Specification Version 2.0 (November 2025 build)
    usb4: {
      v1: '2019-08', v2: '2022-10', build: '2025-11-19',
      hdrBytes: 4, maxPayload: 256, hopBits: 7, hopFirst: 8,   // §5.1.2, Table 5-2; §5.2: tunnelled packets use HopIDs 8 and up
      hec: { poly: 0x07, init: 0x00, xorOut: 0x55 },            // §5.1.2.1.1
      hecExamples: [[0xD0, 0xFF, 0x13, 0xD4], [0xF0, 0xDF, 0x11, 0x37], [0x10, 0x01, 0x08, 0xDA]],  // Figure A-1: bits 31:24, 23:16, 15:8, HEC
      depthUsb4: 5, depthTbt3: 6,                               // §6.1 (depths 0–5) and §13.4.1 (depths 0–6)
      gen2: 10, gen3: 20, tbt3g2: 10.3125, tbt3g3: 20.625,      // §2.2: Gbps per lane
      gen4Baud: 25.6, bitsPerTrits: [11, 7],                    // §3.2: 25.6 GBd PAM3, 11 bits in 7 trits
      fec4: [480, 504],                                         // Figure 4-30: 480 payload symbols + 24 redundancy (11-bit symbols)
      fec23: [192, 198],                                        // §4.3.1.6 RS(198,194): 192 data bytes + 2 sync + 4 redundancy
      enc: { g2: [64, 66], g3: [128, 132] },
      weightMax: 15                                             // §5.3.3.1: Path Scheduler weights 1–15
    },
    // USB4 Connection Manager Guide 2.0 (November 2025): §6, Tables 6-1, 6-2, 6-3 and the worked examples
    cm: {
      guard: 0.10, minBulk: 1.5,
      prio: { dp: 1, dpaux: 2, usb3x: 3, usb3t: 3, pcie: 3, h2h: 4 },
      raw: { g2x1: [10, 10], g2x2: [20, 20], g3x1: [20, 20], g3x2: [40, 40], g4: [80, 80], g4asym: [120, 40] },
      dpRates: { RBR: 1.62, HBR: 2.7, HBR2: 5.4, HBR3: 8.1 }, dp8b10b: 0.8,
      table63: { HBR3: [25.92, 12.96, 6.48], HBR2: [17.28, 8.64, 4.32], HBR: [8.64, 4.32, 2.16], RBR: [5.18, 2.59, 1.30] },   // 4, 2, 1 lanes
      ex80: { raw: 80, dp: 36, usb3x: 10, usb3t1: 5, usb3t2: 5, weights: [14, 9, 9, 4], bundle: 18 },
      ex40: { raw: 40, first: 25.92, second: 8.64 }
    },
    // Intel Thunderbolt 5 technology brief (2023-09), Figure 2; Intel newsroom, Thunderbolt 4 (2020-07-08)
    tb: {
      tb4: { link: 40, pcie: 32, usb3: 10, charge: 100, acc: 15, cable: 2, video: '2×4K', date: '2020-07-08' },
      tb5: { link: 80, boost: 120, pcie: 64, usb3: 10, usb3max: 20, charge: 140, chargeMax: 240, acc: 15, cable: 2, video: '2×6K', date: '2023-09' },
      tb3pcie: 16,
      pam2: { baud: 1, margin: 1 }, pam3: { baud: 0.63, margin: 0.5 }       // Figure 5 of the TB5 brief
    },
    // VESA: DisplayPort 2.0 release (2019-06-26): up to 20 Gbps/lane, 128b/132b, maximum payload 77.37 Gbps;
    // USB DevDays 2019 VESA slides: DP 1.4 HBR3 usable 25.92 Gbps, 4K60 24 bpp on 2 lanes, 5K60 24 bpp on 4 lanes
    dp: { uhbr20: 20, payload21: 77.37, hbr3x4: 25.92, hbr3x2: 12.96, dp20date: '2019-06-26' },
    // VESA CVT 1.2 reduced blanking version 2 (formula as published; not opened, see BRIEF): 80-pixel horizontal blank,
    // at least 460 µs vertical blank, V front porch ≥ 1, V sync 8, V back porch ≥ 6 lines
    cvt: { hBlank: 80, minVblankUs: 460, minVbiLines: 15 },
    // USB Power Delivery r3.3 v1.0 (2026-10-16): Tables 3.1, 3.2, 3.6; §3.2.2 cable limits; §5.8 fBitRate 300 kbps
    pd: { spr: [5, 9, 15, 20], epr: [28, 36, 48], cap3A: 60, capNonEpr: 100, eprMin: 100, eprMax: 240, bitKbps: 300, eprCable: { v: 50, a: 5 }, date: '2026-10-16' },
    // Thunderclap (Markettos et al., NDSS 2019, 24–27 February 2019); Thunderspy (Ruytenberg, disclosed to Intel 2020-02-10,
    // published May 2020, seven vulnerabilities); Microsoft Kernel DMA Protection page (updated 2026-10-08)
    sec: { thunderclap: '2019-02', thunderspy: '2020-05', thunderspyN: 7, page: 4096 },
    // USB Promoter Group developer update, 2019-03-04
    history: { donation: '2019-03-04', usb4v1: '2019-08', tb4: '2020-07-08', tb5: '2023-09', usb4v2: '2022-10' }
  };

  /* ── 01 the CC line. The source pulls CC up through Rp; the sink pulls it down through Rd; the cable carries only one CC
     wire, so only the CC pin that the plug orientation connects sees the divider: V = Vpull · Rd / (Rp + Rd). The sink
     reads the advertised current from which Table 4-36 window V falls in. The other CC pin is open, or sees the cable's
     Ra if the cable is electronically marked (then the source applies VCONN there). ── */
  const CC = {
    v(rpKey, corner) {
      const c = SPEC.cc, r = c.rp[rpKey];
      if (corner === 'lo') return c.pull[0] * c.rd * (1 - c.rdTol) / (r.k * (1 + r.tol) + c.rd * (1 - c.rdTol));
      if (corner === 'hi') return c.pull[1] * c.rd * (1 + c.rdTol) / (r.k * (1 - r.tol) + c.rd * (1 + c.rdTol));
      return c.pullNom * c.rd / (r.k + c.rd);
    },
    classify(v) {
      const w = SPEC.cc.win;
      // Table 4-36 gives the edges to the millivolt and its upper edges are the worst-case corners rounded
      // (0.6121 → 0.612, 2.0420 → 2.042), so a voltage is read at the table's own resolution
      v = Math.round(v * 1000) / 1000;
      for (const k of ['usb', 'a15', 'a30']) if (v >= w[k][0] && v <= w[k][1]) return k;
      return v < SPEC.cc.disconnect ? 'none' : 'gap';
    },
    // which receptacle pins carry what, given the plug orientation (Type-C §2.3.2 plug orientation detection)
    attach(rpKey, flipped, emarked, corner) {
      const v = this.v(rpKey, corner), cls = this.classify(v);
      const ra = SPEC.cc.ra, raV = SPEC.cc.pullNom * ((ra[0] + ra[1]) / 2) / (SPEC.cc.rp[rpKey].k + (ra[0] + ra[1]) / 2);
      return { v, cls, ccPin: flipped ? 'CC2' : 'CC1', otherPin: flipped ? 'CC1' : 'CC2', otherV: emarked ? raV : null,
        pairs: flipped ? ['TX2', 'RX2'] : ['TX1', 'RX1'], amps: SPEC.cc.rp[rpKey].amps, vconn: !!emarked };
    }
  };

  /* ── 02 the transport-layer packet. 4-byte header (Table 5-2): PDF 31:28, SuppID 27, Rsvd 26:23, HopID 22:16,
     Length 15:8 (00h means 256), HEC 7:0 = CRC-8 (poly 07h, init 00h, xorout 55h) over bits 31:8 MSB first.
     Payload 1–256 bytes, padded to a multiple of 4 (§5.1.2.2). A router corrects any single-bit header error. ── */
  const PKT = {
    crc8(bytes) { let c = SPEC.usb4.hec.init; for (const b of bytes) { c ^= b; for (let i = 0; i < 8; i++) c = (c & 0x80) ? ((c << 1) ^ SPEC.usb4.hec.poly) & 255 : (c << 1) & 255; } return c; },
    hec(b3, b2, b1) { return this.crc8([b3, b2, b1]) ^ SPEC.usb4.hec.xorOut; },
    header(pdf, hop, len, supp) {
      const b3 = ((pdf & 15) << 4) | ((supp ? 1 : 0) << 3), b2 = hop & 127, b1 = len & 255;   // bits 26:23 reserved (0), bit 23 is the top of b2
      return [b3, b2, b1, this.hec(b3, b2, b1)];
    },
    word(h) { return ((h[0] << 24) | (h[1] << 16) | (h[2] << 8) | h[3]) >>> 0; },
    bytesOf(w) { return [w >>> 24 & 255, w >>> 16 & 255, w >>> 8 & 255, w & 255]; },
    // syndrome of a received 32-bit header; zero means valid
    syndrome(w) { const b = this.bytesOf(w); return this.hec(b[0], b[1], b[2]) ^ b[3]; },
    // single-bit correction: find the bit whose flip gives this syndrome (CRC-8 07h has a distinct syndrome for each of the 32 bits)
    correct(w) {
      const s = this.syndrome(w); if (!s) return { w, bit: null, ok: true };
      for (let i = 0; i < 32; i++) { const t = (w ^ (1 << i)) >>> 0; if (!this.syndrome(t)) return { w: t, bit: i, ok: true }; }
      return { w, bit: null, ok: false };
    },
    lengthField(n) { return n === 256 ? 0 : n; },
    pad(n) { return (4 - n % 4) % 4; },
    eff(n) { return n / (SPEC.usb4.hdrBytes + n + this.pad(n)); }
  };

  /* ── 03 how a USB4 link is shared (Connection Manager Guide §6.1.2.3). Available = 90 % of the raw bandwidth (10 % guard
     band); isochronous requests first, by priority (DP main link 1, USB3 and PCIe 3); every USB3 and PCIe path keeps at
     least 1.5 Gbps; the rest of the 90 % goes to the bulk paths in equal shares; a path's WRR weight is its allocated
     Gbps (scaled to the 1–15 field if needed). Then the scheduler (USB4 §5.3.3): strict priority between groups, WRR
     inside a group, work-conserving, so an allocation is a share under contention, not a cap. ── */
  const ALLOC = {
    // paths: [{ id, kind: 'dp'|'usb3x'|'usb3t'|'pcie', iso }]; returns per-path { iso, bulk, total, weight }
    cm(raw, paths) {
      const C = SPEC.cm, avail = (1 - C.guard) * raw;
      const bulkPaths = paths.filter(p => p.kind !== 'dp');
      const out = paths.map(p => ({ id: p.id, kind: p.kind, prio: C.prio[p.kind], req: p.iso || 0, iso: 0, bulk: 0 }));
      let left = avail - C.minBulk * bulkPaths.length;
      for (const o of out.slice().sort((a, b) => a.prio - b.prio)) { const g = clamp(o.req, 0, Math.max(0, left)); o.iso = g; left -= g; }
      const sumIso = out.reduce((s, o) => s + o.iso, 0), bulkEach = bulkPaths.length ? (avail - sumIso) / bulkPaths.length : 0;
      for (const o of out) if (o.kind !== 'dp') o.bulk = bulkEach;
      for (const o of out) o.total = o.iso + o.bulk;
      const g3 = out.filter(o => o.prio === 3), mx = Math.max(0, ...g3.map(o => o.total));
      for (const o of g3) o.weight = Math.max(1, Math.round(mx > SPEC.usb4.weightMax ? o.total * SPEC.usb4.weightMax / mx : o.total));
      return { avail, paths: out, bulkEach, sumIso };
    },
    // DP under the Max Link BW method: the best Table 6-3 configuration that fits what is left (§6.2.1.1)
    maxLinkFit(remaining, maxRate, maxLanes) {
      const rates = ['HBR3', 'HBR2', 'HBR', 'RBR'], lanes = [4, 2, 1];
      let best = null;
      for (const r of rates) { if (SPEC.cm.dpRates[r] > SPEC.cm.dpRates[maxRate || 'HBR3']) continue;
        for (const l of lanes) { if (l > (maxLanes || 4)) continue; const bw = this.dpBw(r, l); if (bw <= remaining + 1e-9 && (!best || bw > best.bw)) best = { rate: r, lanes: l, bw }; } }
      return best;
    },
    dpBw(rate, lanes) { return SPEC.cm.dpRates[rate] * lanes * SPEC.cm.dp8b10b; },
    // the per-direction capacity the scheduler hands out: line rate after coding and after the 4-byte header of a full packet
    capacity(raw, coding) { return raw * coding * PKT.eff(256); },
    // work-conserving WRR with per-path ceilings (water filling): flows [{ id, w, cap }], total C
    wrr(C, flows) {
      const res = {}; let act = flows.filter(f => f.cap > 0), left = C;
      for (const f of flows) res[f.id] = 0;
      for (let it = 0; it < 10 && act.length && left > 1e-12; it++) {
        const W = act.reduce((s, f) => s + f.w, 0); let used = 0; const next = [];
        for (const f of act) { const give = left * f.w / W, room = f.cap - res[f.id]; if (give >= room) { res[f.id] += room; used += room; } else { res[f.id] += give; used += give; next.push(f); } }
        left -= used; if (next.length === act.length) break; act = next;
      }
      return res;
    }
  };

  /* ── 06 how much a picture needs. VESA CVT reduced blanking v2: h_total = h + 80; the vertical blank is the smallest
     whole number of lines lasting at least 460 µs; pixel clock = h_total · v_total · refresh. A stream needs
     pixel clock × bits per pixel. ── */
  const VIDEO = {
    modes: { fhd60: [1920, 1080, 60], qhd144: [2560, 1440, 144], uhd60: [3840, 2160, 60], uhd144: [3840, 2160, 144], k5_60: [5120, 2880, 60], k6_60: [6016, 3384, 60], k8_60: [7680, 4320, 60] },
    cvt(h, v, hz) {
      const c = SPEC.cvt, lineUs = (1e6 / hz - c.minVblankUs) / v, vbi = Math.max(Math.floor(c.minVblankUs / lineUs) + 1, c.minVbiLines);
      const hTot = h + c.hBlank, vTot = v + vbi, pclk = Math.floor(hTot * vTot * hz / 1000) * 1000;    // 0.001 MHz clock step
      return { hTot, vTot, vbi, pclk };
    },
    need(mode, bpp) { const m = this.modes[mode]; return this.cvt(m[0], m[1], m[2]).pclk * bpp / 1e9; },     // Gbps
    // the DSC compressed bits per pixel at which a stream fits a capacity
    bppFor(mode, cap) { const m = this.modes[mode]; return cap * 1e9 / this.cvt(m[0], m[1], m[2]).pclk; }
  };

  /* ── 05 lanes, coding and direction. Per direction: lanes × line rate × coding efficiency; Gen 4 is 25.6 GBd PAM3 with
     11 bits per 7 trits and RS-FEC 480/504; asymmetric Gen 4 runs three transmitters one way and one the other. ── */
  const LANES = {
    modes: {
      tbt3:   { gen: 'g3', lanes: [2, 2], rate: SPEC.usb4.tbt3g3, coding: 128 / 132, pam: 2, cable: 'g3', cm: [40, 40] },
      g2x2:   { gen: 'g2', lanes: [2, 2], rate: SPEC.usb4.gen2, coding: 64 / 66, pam: 2, cable: 'g1', cm: SPEC.cm.raw.g2x2 },
      g3x2:   { gen: 'g3', lanes: [2, 2], rate: SPEC.usb4.gen3, coding: 128 / 132, pam: 2, cable: 'g3', cm: SPEC.cm.raw.g3x2 },
      g4:     { gen: 'g4', lanes: [2, 2], rate: SPEC.usb4.gen4Baud * 11 / 7, coding: 480 / 504, pam: 3, cable: 'g3', cm: SPEC.cm.raw.g4 },
      g4asym: { gen: 'g4', lanes: [3, 1], rate: SPEC.usb4.gen4Baud * 11 / 7, coding: 480 / 504, pam: 3, cable: 'g3', cm: SPEC.cm.raw.g4asym }
    },
    dir(m, d) { const o = this.modes[m], n = o.lanes[d === 'down' ? 0 : 1]; const line = n * o.rate, coded = line * o.coding; return { lanes: n, line, coded, payload: coded * PKT.eff(256), cm: o.cm[d === 'down' ? 0 : 1] }; },
    baud(m) { const o = this.modes[m]; return o.pam === 3 ? SPEC.usb4.gen4Baud : o.rate; },
    nyquist(m) { return this.baud(m) / 2; },
    // ideal eye height of PAM-N at the same peak swing, relative to NRZ, and in dB
    eye(nLevels) { const h = 1 / (nLevels - 1); return { h, db: 20 * Math.log10(h) }; },
    // symbol rate needed for the same bit rate: log2(N) bits per symbol (PAM3 coded as 11 bits / 7 trits)
    relBaud(nLevels) { return nLevels === 3 ? 7 / 11 : 1 / Math.log2(nLevels); }
  };

  /* ── 03/04 scenarios on a link: a display (downstream), a drive (downstream when writing, upstream when reading) and a
     USB 3 device, scheduled by the ch3 rules. ── */
  const LINKS = {
    tb4:   { raw: [40, 40], coding: 128 / 132, pcie: SPEC.tb.tb4.pcie, usb3: SPEC.tb.tb4.usb3, dp: 'dp14' },
    tb5:   { raw: [80, 80], coding: 480 / 504, pcie: SPEC.tb.tb5.pcie, usb3: SPEC.tb.tb5.usb3, dp: 'dp21' },
    tb5bb: { raw: [120, 40], coding: 480 / 504, pcie: SPEC.tb.tb5.pcie, usb3: SPEC.tb.tb5.usb3, dp: 'dp21' }
  };
  const DISPLAYS = { none: [], uhd60: ['uhd60'], uhd60x2: ['uhd60', 'uhd60'], k6_60: ['k6_60'], k6_60x2: ['k6_60', 'k6_60'] };
  const SHARE = {
    bpp: 24,
    run(o) {
      const p = Object.assign({ link: 'tb4', display: 'uhd60', drive: 'write', usb: true }, o || {});
      const L = LINKS[p.link], dpNeeds = DISPLAYS[p.display].map(m => VIDEO.need(m, this.bpp));
      const usb3cap = L.usb3 * 128 / 132, pciecap = L.pcie;
      const paths = dpNeeds.map((g, i) => ({ id: 'dp' + i, kind: 'dp', iso: g })).concat([{ id: 'usb', kind: 'usb3x', iso: 0 }, { id: 'pcie', kind: 'pcie', iso: 0 }]);
      const dirs = {}, streamCap = L.dp === 'dp14' ? SPEC.dp.hbr3x4 : SPEC.dp.payload21;
      for (const d of ['down', 'up']) {
        const raw = L.raw[d === 'down' ? 0 : 1], cm = ALLOC.cm(raw, d === 'down' ? paths : paths.filter(q => q.kind !== 'dp'));
        const cap = ALLOC.capacity(raw, L.coding);
        const dpGot = d === 'down' ? cm.paths.filter(q => q.kind === 'dp').map(q => q.iso) : [];
        // a stream runs only if one DP link can carry it and the CM reserved enough for it
        const dpUse = d === 'down' ? dpNeeds.reduce((s, g, i) => s + (g <= streamCap + 1e-9 && dpGot[i] >= g - 1e-9 ? g : 0), 0) : 0;
        const w = id => (cm.paths.find(q => q.id === id) || {}).weight || 1;
        const flows = [];
        if (p.usb) flows.push({ id: 'usb', w: w('usb'), cap: usb3cap });
        if ((p.drive === 'write' && d === 'down') || (p.drive === 'read' && d === 'up')) flows.push({ id: 'pcie', w: w('pcie'), cap: pciecap });
        const got = ALLOC.wrr(cap - dpUse, flows);
        dirs[d] = { raw, cap, cm, dpUse, usb: got.usb || 0, pcie: got.pcie || 0, idle: cap - dpUse - (got.usb || 0) - (got.pcie || 0) };
      }
      const dpFits = dpNeeds.every((g, i) => g <= streamCap + 1e-9 && dirs.down.cm.paths.find(q => q.id === 'dp' + i).iso >= g - 1e-9);
      const dd = p.drive === 'write' ? dirs.down : dirs.up;
      return { p, dpNeeds, dpFits, streamCap, dirs, drive: dd.pcie, driveMBps: dd.pcie * 125, usbCap: usb3cap, pcieCap: pciecap };
    }
  };

  /* ── 04 a daisy chain. Every device below a link shares it: link k carries the traffic of devices k…n. All PCIe traffic
     leaves the host through one downstream PCIe adapter per port (USB4 §11), so the drives share one PCIe path, split
     equally by the switches below (an assumption). The spanning tree stops at depth 5 (USB4) or 6 (TBT3-compatible).
     Per-router forwarding latency is TUNED (no figure in the spec). ── */
  const CHAIN = {
    tHop: 1,          // µs per router traversal, TUNED
    tFlash: 50,       // µs, the flash read wait used in the storage essays (TUNED there too)
    run(o) {
      const p = Object.assign({ link: 'tb4', n: 3, display: false, depth: 'usb4', tHop: this.tHop }, o || {});
      const L = LINKS[p.link], maxDepth = p.depth === 'tbt3' ? SPEC.usb4.depthTbt3 : SPEC.usb4.depthUsb4;
      const live = Math.min(p.n, maxDepth), dropped = p.n - live;
      const dpNeed = p.display ? VIDEO.need('uhd60', SHARE.bpp) : 0;
      const cap = ALLOC.capacity(L.raw[0], L.coding), pcieTotal = Math.min(L.pcie, cap - dpNeed);
      const each = live ? pcieTotal / live : 0;
      const links = []; for (let k = 1; k <= live; k++) links.push({ k, load: each * (live - k + 1) + dpNeed, cap });
      const rtt = 2 * live * p.tHop;
      return { live, dropped, maxDepth, each, eachMBps: each * 125, pcieTotal, links, dpNeed, rtt, rttShare: rtt / (this.tFlash + rtt) };
    }
  };

  /* ── 06 displays on a connection: what the pictures need against what the connection carries. DP Alt Mode gives the DP
     link the high-speed pairs directly (4 lanes, or 2 lanes + USB 3 on the other 2); a USB4 tunnel carries DP inside the
     link, the Connection Manager reserving either the DP link's whole rate (Max Link BW, 8b/10b only) or what the DPTX
     asks for (DP BW Allocation Mode). ── */
  const SCREEN = {
    conn: {
      alt4: { kind: 'alt', cap: SPEC.dp.hbr3x4 }, alt2: { kind: 'alt', cap: SPEC.dp.hbr3x2 }, alt21: { kind: 'alt', cap: SPEC.dp.payload21 },
      tb4: { kind: 'tun', raw: 40, stream: SPEC.dp.hbr3x4, method: 'maxlink' },
      tb5: { kind: 'tun', raw: 80, stream: SPEC.dp.payload21, method: 'bwalloc' },
      tb5bb: { kind: 'tun', raw: 120, stream: SPEC.dp.payload21, method: 'bwalloc' }
    },
    run(o) {
      // dpMax: the highest DP link rate the monitors advertise (4 lanes); under Max Link BW the CM reserves that link
      const p = Object.assign({ mode: 'uhd60', count: 2, bpp: 24, conn: 'tb4', method: null, dpMax: 'HBR3' }, o || {});
      const c = Object.assign({}, this.conn[p.conn]); if (p.method && c.kind === 'tun') c.method = p.method;
      const need = VIDEO.need(p.mode, p.bpp), rows = [];
      if (c.kind === 'alt') {
        // MST shares one DP link among the displays
        let used = 0; for (let i = 0; i < p.count; i++) { const ok = used + need <= c.cap + 1e-9; rows.push({ need, got: ok ? need : 0, ok }); if (ok) used += need; }
        return { p, need, rows, cap: c.cap, used, kind: 'alt', fit: rows.filter(r => r.ok).length };
      }
      const avail = (1 - SPEC.cm.guard) * c.raw; let left = avail; let used = 0;
      for (let i = 0; i < p.count; i++) {
        if (c.method === 'maxlink') {          // 8b/10b links only (CM Guide §6.2.1): the stream is also held to HBR3 × 4
          const cfg = ALLOC.maxLinkFit(left, p.dpMax); const res = cfg ? cfg.bw : 0, ok = res >= need - 1e-9;
          rows.push({ need, res, cfg, ok }); left -= res; if (ok) used += need;
        } else {
          const ok = need <= Math.min(left, c.stream) + 1e-9; rows.push({ need, res: ok ? need : 0, ok }); if (ok) { left -= need; used += need; }
        }
      }
      return { p, need, rows, cap: avail, used, left, kind: 'tun', method: c.method, fit: rows.filter(r => r.ok).length };
    }
  };

  /* ── 07 USB Power Delivery. Required source PDOs from the Port Present PDP (Tables 3.1, 3.2, 3.6): 5/9/15 V at
     min(3 A, PDP ÷ V) where allowed by the PDP band, 20 V at min(cable, PDP ÷ 20) above 45 W; Present PDP is capped at
     60 W on a 3 A cable and at 100 W on a cable that is not EPR capable (§3.2.2); EPR fixed 28/36/48 V from Table 3.6.
     The sink picks the PDO giving it the most power up to its own need, preferring the higher voltage. ── */
  const PD = {
    cables: { c3: { amps: 3, epr: false, marked: false }, c5: { amps: 5, epr: true, marked: true } },
    present(pdp, cable) { const c = this.cables[cable]; let x = pdp; if (c.amps <= 3) x = Math.min(x, SPEC.pd.cap3A); if (!c.epr) x = Math.min(x, SPEC.pd.capNonEpr); return x; },
    r2(x) { return Math.round(x * 100) / 100; },
    sprPdos(x, cableA) {
      const o = [];
      if (x <= 15) { o.push([5, this.r2(x / 5)]); return o; }
      o.push([5, 3]);
      if (x <= 27) { o.push([9, this.r2(x / 9)]); return o; }
      o.push([9, 3]);
      if (x <= 45) { o.push([15, this.r2(x / 15)]); return o; }
      o.push([15, 3]); o.push([20, this.r2(Math.min(cableA, Math.min(x, 100) / 20))]);
      return o;
    },
    eprPdos(x) {
      const o = [];
      if (x <= 100) return o;
      if (x <= 140) { o.push([28, this.r2(x / 28)]); return o; }
      o.push([28, 5]); if (x <= 180) { o.push([36, this.r2(x / 36)]); return o; }
      o.push([36, 5]); o.push([48, this.r2(x / 48)]); return o;
    },
    // pdp: charger's Port Maximum PDP; cable key; sink: { need W, epr: bool }
    run(pdp, cable, sinkNeed, sinkEpr) {
      const c = this.cables[cable], x = this.present(pdp, cable);
      const spr = this.sprPdos(Math.min(x, 100), c.amps);
      const eprPossible = pdp > SPEC.pd.eprMin && c.epr && sinkEpr && sinkNeed > SPEC.pd.eprMin;
      const epr = eprPossible ? this.eprPdos(x) : [];
      const pick = list => { let best = null; for (const [v, a] of list) { const w = Math.min(v * a, sinkNeed); if (!best || w > best.w + 1e-9 || (Math.abs(w - best.w) < 1e-9 && v > best.v)) best = { v, a, w }; } return best; };
      const sprPick = pick(spr), eprPick = epr.length ? pick(spr.concat(epr)) : null, fin = eprPick && eprPick.w > sprPick.w ? eprPick : sprPick;
      const why = !(pdp > SPEC.pd.eprMin) ? 'charger' : !c.epr ? 'cable' : null;
      const msgs = ['src_caps', 'request', 'accept', 'ps_rdy'];
      if (eprPossible && fin.v > 20) msgs.push('epr_enter', 'epr_ack', 'cable_id', 'epr_ok', 'epr_caps', 'epr_request', 'accept', 'ps_rdy');
      return { present: x, spr, epr, pick: fin, eprUsed: fin.v > 20, why, msgs, wire: this.wireMs(msgs, spr.length, epr.length) };
    },
    // time on the CC wire at 300 kbps: preamble 64 bits, SOP 4 K-codes × 5, header 4 × 5, each data object 8 × 5,
    // CRC 8 × 5, EOP 5; every message is acknowledged by a GoodCRC (no data objects). Gaps and supply transitions excluded.
    bits(nDo) { return 64 + 20 + 20 + 40 * nDo + 40 + 5; },
    // data objects per message. Cable discovery is a Discover Identity request on SOP' (VDM header) and the passive
    // EPR cable's ACK (VDM header, ID Header, Cert Stat, Product, Passive Cable VDO: 5 objects, PD §6.4.12.3).
    // EPR_Source_Capabilities (§6.5.18) is an Extended Message: SPR objects 0-filled to position 7, the EPR fixed PDOs
    // from position 8, then the one EPR AVS APDO; sent in Chunks of at most 26 bytes (MaxExtendedMsgChunkLen), each
    // with a 2-byte extended header, the receiver asking for each Chunk after the first (§6.5.1.1, Chunked format).
    msgDos(m, nSpr, nEpr) {
      if (m === 'cable_id') return [1, 5];
      if (m === 'epr_caps') {
        const data = 4 * (7 + nEpr + 1), out = [];
        for (let off = 0; off < data; off += 26) { if (off) out.push(1); out.push(Math.ceil((2 + Math.min(26, data - off)) / 4)); }
        return out;
      }
      return [{ src_caps: nSpr, request: 1, accept: 0, ps_rdy: 0, epr_enter: 1, epr_ack: 1, epr_ok: 1, epr_request: 2 }[m]];
    },
    wireMs(msgs, nSpr, nEpr) {
      let b = 0; for (const m of msgs) for (const n of this.msgDos(m, nSpr, nEpr)) b += this.bits(n) + this.bits(0);
      return b / SPEC.pd.bitKbps;          // bits / (kbit/s) = ms
    }
  };

  /* ── 08 an IOMMU maps whole pages. N receive buffers of s bytes sit in slots of a slab, each page holding 4096 / s slots;
     the rest of the slots hold other kernel objects. The device can reach every byte of every page that holds at least
     one of its buffers (the Thunderclap paper's sub-page exposure). Expected mapped pages is the occupancy result:
     P · (1 − C(m(P−1), N) / C(mP, N)). A seeded draw shows one layout. ── */
  const IOMMU = {
    poolPages: 64,
    rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; },
    layout(s, N, seed) {
      const m = Math.floor(SPEC.sec.page / s), P = this.poolPages, slots = m * P, r = this.rng(seed || 7), all = [...Array(slots).keys()];
      for (let i = slots - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = all[i]; all[i] = all[j]; all[j] = t; }
      const mine = new Set(all.slice(0, Math.min(N, slots))), pages = new Set([...mine].map(i => Math.floor(i / m)));
      return { m, P, mine, pages };
    },
    run(s, N, mode, seed) {
      const lay = this.layout(s, N, seed), page = SPEC.sec.page, bufBytes = Math.min(N, lay.m * lay.P) * s;
      if (mode === 'off') return { lay, mapped: lay.P * page, exposed: lay.P * page - bufBytes, bufBytes, mode };
      if (mode === 'bounce') { const pg = Math.ceil(bufBytes / page); return { lay, mapped: pg * page, exposed: 0, bufBytes, mode }; }
      const mapped = lay.pages.size * page;
      return { lay, mapped, exposed: mapped - bufBytes, bufBytes, mode };
    },
    expectedPages(s, N) {
      const m = Math.floor(SPEC.sec.page / s), P = this.poolPages, T = m * P;
      // probability a given page holds none of the N buffers: C(T − m, N) / C(T, N) = Π_{i<N} (T − m − i)/(T − i)
      let q = 1; for (let i = 0; i < N; i++) q *= Math.max(0, T - m - i) / (T - i);
      return P * (1 - q);
    }
  };

  /* ── frontier data block (as of November 2026; sources and dates opened in BRIEF.md) ── */
  const FRONTIER = {
    asOf: '2026-11',
    usb4Build: '2025-11-19', typec25: '2026-03', pd33: '2026-10-16', tb5Brief: '2023-09', tb5FirstMac: '2024-10-30',
    kdmaPage: '2026-10-08', panther: '2026-01'
  };

  /* ── numbers quoted in the prose. [value, decimals, kind]; the page formats them, tests/models.cjs pins every one. ── */
  function prose() {
    const cc0 = CC.v('usb'), cc15 = CC.v('a15'), cc30 = CC.v('a30');
    const cm80 = ALLOC.cm(80, [{ id: 'dp', kind: 'dp', iso: 36 }, { id: 'x', kind: 'usb3x', iso: 10 }, { id: 't1', kind: 'usb3t', iso: 5 }, { id: 't2', kind: 'usb3t', iso: 5 }, { id: 'p', kind: 'pcie', iso: 0 }]);
    const s0 = SHARE.run({}), sNo = SHARE.run({ display: 'none' }), sRead = SHARE.run({ drive: 'read' }), sNoUsb = SHARE.run({ usb: false, display: 'none' });
    const s5 = SHARE.run({ link: 'tb5', display: 'k6_60x2' }), s5bb = SHARE.run({ link: 'tb5bb', display: 'k6_60x2' }), s5bbR = SHARE.run({ link: 'tb5bb', display: 'k6_60x2', drive: 'read' }), s5R = SHARE.run({ link: 'tb5', display: 'k6_60x2', drive: 'read' });
    const ch3 = CHAIN.run({}), ch1 = CHAIN.run({ n: 1 }), ch6 = CHAIN.run({ n: 6 }), ch6t = CHAIN.run({ n: 6, depth: 'tbt3' }), chd = CHAIN.run({ display: true }),
      chH = CHAIN.run({ tHop: CHAIN.tHop / 2 }), chD = CHAIN.run({ tHop: CHAIN.tHop * 2 });
    const d = m => LANES.dir(m, 'down'), u = m => LANES.dir(m, 'up');
    const c4k = VIDEO.cvt(3840, 2160, 60), n4k = VIDEO.need('uhd60', 24), n5k = VIDEO.need('k5_60', 24), n6k24 = VIDEO.need('k6_60', 24), n6k30 = VIDEO.need('k6_60', 30), n8k30 = VIDEO.need('k8_60', 30), n4k90x3 = 3 * VIDEO.cvt(3840, 2160, 90).pclk * 30 / 1e9;
    const scTb4 = SCREEN.run({}), scTb4h2 = SCREEN.run({ dpMax: 'HBR2' }), scTb4bw = SCREEN.run({ method: 'bwalloc' }), sc6k30 = SCREEN.run({ conn: 'tb5', mode: 'k6_60', bpp: 30 }), sc6k30bb = SCREEN.run({ conn: 'tb5bb', mode: 'k6_60', bpp: 30 }), sc6k24 = SCREEN.run({ conn: 'tb5', mode: 'k6_60', bpp: 24 });
    const pd65 = PD.run(65, 'c3', 65, false), pd100c3 = PD.run(100, 'c3', 100, false), pd140c5 = PD.run(140, 'c5', 140, true), pd140c3 = PD.run(140, 'c3', 140, true), pd240 = PD.run(240, 'c5', 240, true);
    const io = IOMMU.run(1536, 64, 'iommu'), ioOff = IOMMU.run(1536, 64, 'off'), ioB = IOMMU.run(1536, 64, 'bounce'), io2k = IOMMU.run(2048, 64, 'iommu'), io4k = IOMMU.run(4096, 64, 'iommu');
    return {
      // ch1
      cc0: [cc0, 2], cc15: [cc15, 2], cc30: [cc30, 2], cc0lo: [CC.v('usb', 'lo'), 3], cc0hi: [CC.v('usb', 'hi'), 3], cc30lo: [CC.v('a30', 'lo'), 3], cc30hi: [CC.v('a30', 'hi'), 3],
      // ch2
      eff256: [PKT.eff(256), 1, 'pct'], eff64: [PKT.eff(64), 1, 'pct'], eff5: [PKT.eff(5), 1, 'pct'], hopMax: [Math.pow(2, SPEC.usb4.hopBits) - 1, 0], hopPaths: [Math.pow(2, SPEC.usb4.hopBits) - SPEC.usb4.hopFirst, 0],
      // ch3
      ex80avail: [cm80.avail, 0], ex80bulk: [cm80.bulkEach, 0],
      s5w: [s5.driveMBps, 0], s5bbw: [s5bb.driveMBps, 0], s5r: [s5R.driveMBps, 0], s5bbr: [s5bbR.driveMBps, 0], s0dp: [s0.dirs.down.dpUse, 1], s0drive: [s0.driveMBps, 0], s0usb: [s0.dirs.down.usb, 1], sNoDrive: [sNo.driveMBps, 0], sReadDrive: [sRead.driveMBps, 0], sCap4: [s0.dirs.down.cap, 1], sNoUsbDrive: [sNoUsb.driveMBps, 0],
      // ch4
      ch3each: [ch3.eachMBps, 0], ch1each: [ch1.eachMBps, 0], ch6live: [ch6.live, 0], ch6tlive: [ch6t.live, 0], chdEach: [chd.eachMBps, 0], chRtt: [ch3.rtt, 0], chRttShare: [ch3.rttShare, 0, 'pct'],
      chRttH: [chH.rttShare, 0, 'pct'], chRttD: [chD.rttShare, 0, 'pct'],
      // ch5
      tbt3coded: [d('tbt3').coded / 2, 1], g3coded: [d('g3x2').coded, 2], g4lane: [LANES.modes.g4.rate, 2], g4down: [d('g4').coded, 1], g4asymDown: [d('g4asym').coded, 1], g4asymUp: [u('g4asym').coded, 1],
      g4fec: [480 / 504, 1, 'pct'], g3fecLoss: [1 - SPEC.usb4.fec23[0] / SPEC.usb4.fec23[1], 0, 'pct'], pam3db: [LANES.eye(3).db, 1], pam4db: [LANES.eye(4).db, 1], pam3baud: [LANES.relBaud(3), 2], nyq3: [LANES.nyquist('g3x2'), 0], nyq4: [LANES.nyquist('g4'), 1],
      // ch6
      pclk4k: [c4k.pclk / 1e6, 2], htot4k: [c4k.hTot, 0], vtot4k: [c4k.vTot, 0], n4k: [n4k, 2], n5k: [n5k, 1], n6k24: [n6k24, 1], n6k30: [n6k30, 1], n8k30: [n8k30, 1], n4k90x3: [n4k90x3, 1],
      dsc8k: [VIDEO.bppFor('k8_60', SPEC.dp.hbr3x4), 1], dscRatio8k: [30 / VIDEO.bppFor('k8_60', SPEC.dp.hbr3x4), 2],
      scTb4fit: [scTb4.fit, 0], scTb4bwfit: [scTb4bw.fit, 0], sc6k30: [sc6k30.fit, 0], sc6k30bb: [sc6k30bb.fit, 0], sc6k24: [sc6k24.fit, 0], tb4second: [scTb4.rows[1].res, 2], tb4first: [scTb4.rows[0].res, 2], tb4h2each: [scTb4h2.rows[0].res, 2], tb4h2fit: [scTb4h2.fit, 0],
      // ch7
      pd65w: [pd65.pick.w, 0], pd100c3: [pd100c3.pick.w, 0], pd140c5: [pd140c5.pick.w, 0], pd140c3: [pd140c3.pick.w, 0], pd240a: [pd240.pick.a, 0], pdWire: [pd140c5.wire, 1], pdWireSpr: [pd65.wire, 1],
      // ch8
      ioPagesE: [IOMMU.expectedPages(1536, 64), 1], ioMappedE: [IOMMU.expectedPages(1536, 64) * 4, 0], ioExposedE: [IOMMU.expectedPages(1536, 64) * 4 - io.bufBytes / 1024, 0], io2kE: [IOMMU.expectedPages(2048, 64) * 4 - io2k.bufBytes / 1024, 0], ioPages7: [io.lay.pages.size, 0], ioBuf: [io.bufBytes / 1024, 0], ioOff: [ioOff.mapped / 1024, 0], io4k: [io4k.exposed / 1024, 0]
    };
  }

  /* ── formatting: language-aware ── */
  function fmt(x, d, lang) {
    if (x == null || !isFinite(x)) return '—';
    const s = (d == null ? (Math.abs(x) >= 100 ? 0 : Math.abs(x) >= 10 ? 1 : 2) : d);
    return Number(x).toLocaleString(lang === 'en' ? 'en-US' : 'zh-CN', { minimumFractionDigits: s, maximumFractionDigits: s });
  }
  const hex2 = x => x.toString(16).toUpperCase().padStart(2, '0');

  /* ── live sentences: { key, v } so the page fills whole-sentence templates ── */
  const say = {
    cc(rp, flipped, emarked, corner) { const a = CC.attach(rp, flipped, emarked, corner); const k = a.cls === 'gap' || a.cls === 'none' ? 'ch1.say.bad' : flipped ? 'ch1.say.flip' : 'ch1.say.norm'; return { key: k, v: a }; },
    pkt(n, flip) { const pad = PKT.pad(n); return { key: flip == null ? (pad ? 'ch2.say.pad' : 'ch2.say.ok') : 'ch2.say.fix', v: { n, pad, eff: PKT.eff(n) } }; },
    share(o) {
      const r = SHARE.run(o), p = r.p;
      if (!r.dpFits) return { key: 'ch3.say.nodp', v: r };
      if (p.drive === 'read' && p.display !== 'none') return { key: 'ch3.say.read', v: r };
      if (r.drive >= r.pcieCap - 1e-6) return { key: 'ch3.say.pciecap', v: r };
      if (p.display === 'none') return { key: 'ch3.say.alone', v: r };
      return { key: 'ch3.say.shared', v: r };
    },
    chain(o) { const r = CHAIN.run(o); return { key: r.dropped ? 'ch4.say.deep' : r.live === 1 ? 'ch4.say.one' : 'ch4.say.many', v: r }; },
    lanes(m) { return { key: m === 'g4asym' ? 'ch5.say.asym' : LANES.modes[m].pam === 3 ? 'ch5.say.pam3' : m === 'tbt3' ? 'ch5.say.tbt3' : 'ch5.say.nrz', v: m }; },
    screen(o) {
      const r = SCREEN.run(o), all = r.fit === r.p.count;
      if (r.kind === 'alt') return { key: all ? 'ch6.say.altok' : 'ch6.say.altno', v: r };
      if (r.method === 'maxlink' && !all && r.rows.some(x => x.cfg && x.cfg.bw < x.need)) return { key: 'ch6.say.maxlink', v: r };
      return { key: all ? 'ch6.say.tunok' : 'ch6.say.tunno', v: r };
    },
    pd(pdp, cable, need, epr) {
      const r = PD.run(pdp, cable, need, epr);
      if (r.eprUsed) return { key: 'ch7.say.epr', v: r };
      // short of what the device wants: the cable if it lowered what the charger may offer, otherwise the charger
      if (r.pick.w < need - 1e-9) return { key: 'ch7.say.short.' + (r.present < Math.min(pdp, need) - 1e-9 || (need > SPEC.pd.eprMin && pdp > SPEC.pd.eprMin && epr && !PD.cables[cable].epr) ? 'cable' : 'charger'), v: r };
      return { key: 'ch7.say.full', v: r };
    },
    iommu(s, N, mode) { const r = IOMMU.run(s, N, mode); return { key: 'ch8.say.' + mode, v: r }; }
  };

  return { SPEC, CC, PKT, ALLOC, VIDEO, LANES, LINKS, DISPLAYS, SHARE, CHAIN, SCREEN, PD, IOMMU, FRONTIER, fmt, hex2, say, clamp, prose };
});
