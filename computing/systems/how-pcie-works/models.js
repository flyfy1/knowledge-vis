/* How PCIe works: the page's models. Each implements a rule from a standard, a table from a primary source, or a named
   textbook result; constants chosen by me (not taken from a source) are marked TUNED here and flagged on the page.
   Units: GB/s = 1e9 bytes per second = 1 byte per nanosecond, so bytes / (GB/s) = ns.
   UMD: window.PcieModels in the browser, module.exports in node. Sources and dates opened: BRIEF.md. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PcieModels = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const KiB = 1024, MiB = 1048576;

  /* ── Generations. Rates, encodings and years 1.0–6.0: Das Sharma, PCI-SIG / OFA Workshop 2022, slide 4.
     7.0: released to members June 2025 (ServeTheHome 2025-06-15 on the PCI-SIG release). 8.0: draft 0.5 May 2026,
     target 2028 (ServeTheHome 2026-05-06). PAM4 halves the baud for the same GT/s (slide 6: "same Nyquist as 32.0 GT/s"). ── */
  const GENS = {
    1: { gts: 2.5, enc: '8b10b', year: 2003 },
    2: { gts: 5, enc: '8b10b', year: 2007 },
    3: { gts: 8, enc: '128b130b', year: 2010 },
    4: { gts: 16, enc: '128b130b', year: 2017 },
    5: { gts: 32, enc: '128b130b', year: 2019 },
    6: { gts: 64, enc: 'flit', year: 2022, pam4: true },
    7: { gts: 128, enc: 'flit', year: 2025, pam4: true },
    8: { gts: 256, enc: 'flit', year: 2028, pam4: true, draft: true }
  };
  const WIDTHS = [1, 2, 4, 8, 16];
  // FLIT: 256 B = 236 B TLP + 6 B DLP + 8 B CRC + 6 B FEC (Das Sharma 2022, slide 10)
  const FLIT = { bytes: 256, tlp: 236, dlp: 6, crc: 8, fec: 6, interleave: 3 };
  const encEff = enc => enc === '8b10b' ? 8 / 10 : enc === '128b130b' ? 128 / 130 : FLIT.tlp / FLIT.bytes;
  const LANE = {
    baud(g) { const o = GENS[g]; return o.pam4 ? o.gts / 2 : o.gts; },             // GBd
    nyquist(g) { return this.baud(g) / 2; },                                        // GHz
    rawGBps(g) { return GENS[g].gts / 8; },                                         // per lane, per direction
    dataGBps(g) { return GENS[g].gts * encEff(GENS[g].enc) / 8; },                  // after encoding / FLIT overhead
    link(g, w) { return w * this.dataGBps(g); },
    // link training settles on the highest rate and widest width both ends support (LTSSM outcome, simplified)
    negotiate(card, slot) {
      const g = Math.min(card.g, slot.g), w = Math.min(card.w, slot.w);
      const limit = (card.g > slot.g ? 'gen' : '') + (card.w > slot.w ? 'width' : '') || (slot.g > card.g || slot.w > card.w ? 'card' : 'none');
      return { g, w, GBps: this.link(g, w), full: this.link(card.g, card.w), limit };
    }
  };
  // Gen3 rate choice: PCI-SIG 2008 (Froelich, "PCIe 3.0 PHY Electrical Layer Requirements"): candidates "8 GT/s with
  // scrambling" and "10 GT/s with 8b/10b"; on a worst-case channel IL at 4 GHz −13.5 dB vs IL at 5 GHz −19.3 dB;
  // requirement "at least 2x effective data rate of PCIe 2.0"; BER 1e-12; client 14 in / server 20 in FR4.
  const GEN3 = {
    opt8: { gts: 8, eff: 128 / 130, ilDb: 13.5, f: 4 }, opt10: { gts: 10, eff: 0.8, ilDb: 19.3, f: 5 },
    data(o) { return o.gts * o.eff; },                                              // Gb/s per lane
    ber: 1e-12, client: 14, server: 20
  };

  /* ── 03 TLPs. Header 3 DW (32-bit address) or 4 DW (64-bit), Fmt/Type from Budruk et al. 2003 Table 3-6 (Fmt
     widened to 3 bits in later revisions); field widths per rtlp-lib's transcription of the spec. Data link layer adds a
     2-byte sequence number and a 4-byte LCRC; the physical layer adds framing (STP and END symbols in 8b/10b, a 4-byte
     STP token that carries the sequence number in 128b/130b). Total per TLP outside the header: 8 bytes in both,
     consistent with Das Sharma 2022 slide 13 (a 4-DW TLP costs 24 bytes at 128b/130b). ── */
  const TLP = {
    perTlp: 8, seq: 2, lcrc: 4, dllp: 8,
    hdrBytes(addr64) { return addr64 ? 16 : 12 },
    // DW0..: [name, bits] in transmit order (most significant bit of byte 0 first)
    DW0: [['fmt', 3], ['type', 5], ['t9', 1], ['tc', 3], ['t8', 1], ['attr2', 1], ['ln', 1], ['th', 1], ['td', 1], ['ep', 1], ['attr', 2], ['at', 2], ['len', 10]],
    REQ1: [['rid', 16], ['tag', 8], ['lbe', 4], ['fbe', 4]],
    ADDR64HI: [['addrhi', 32]], ADDRLO: [['addrlo', 30], ['ph', 2]],
    CPL1: [['cid', 16], ['st', 3], ['bcm', 1], ['bc', 12]], CPL2: [['rid', 16], ['tag', 8], ['r', 1], ['la', 7]],
    FMT: { MRd3: 0, MRd4: 1, MWr3: 2, MWr4: 3, Cpl: 0, CplD: 2 }, TYPE: { mem: 0, cpl: 0x0A },
    pack(layout, v) {                         // one DW from fields → 4 bytes, big-endian as transmitted
      let x = 0n; for (const [k, b] of layout) x = (x << BigInt(b)) | (BigInt(v[k] || 0) & ((1n << BigInt(b)) - 1n));
      return [24, 16, 8, 0].map(s => Number((x >> BigInt(s)) & 255n));
    },
    // a memory request header; addresses below 4 GiB must use the 3-DW form
    mem(op, addr, bytes, rid, tag) {
      const a64 = addr >= 2 ** 32, dw = Math.ceil(bytes / 4), fmt = (op === 'wr' ? 2 : 0) + (a64 ? 1 : 0);
      const v = { fmt, type: 0, len: dw & 1023, rid, tag, fbe: 0xF, lbe: dw > 1 ? 0xF : 0, addrhi: Math.floor(addr / 2 ** 32), addrlo: Math.floor((addr % 2 ** 32) / 4) };
      const dws = [this.pack(this.DW0, v), this.pack(this.REQ1, v)].concat(a64 ? [this.pack(this.ADDR64HI, v)] : [], [this.pack(this.ADDRLO, v)]);
      return { bytes: [].concat(...dws), dws, v, a64 };
    },
    cpl(bytes, remaining, cid, rid, tag, lowerAddr) {
      const v = { fmt: 2, type: 0x0A, len: Math.ceil(bytes / 4) & 1023, cid, st: 0, bcm: 0, bc: remaining & 4095, rid, tag, la: lowerAddr & 127 };
      const dws = [this.pack(this.DW0, v), this.pack(this.CPL1, v), this.pack(this.CPL2, v)];
      return { bytes: [].concat(...dws), dws, v };
    },
    hex(a) { return a.map(b => b.toString(16).toUpperCase().padStart(2, '0')); },
    // posted write of S bytes in MPS-sized TLPs
    write(S, mps, a64) { const n = Math.ceil(S / mps), oh = n * (this.hdrBytes(a64) + this.perTlp); return { n, wire: S + oh, oh, eff: S / (S + oh) }; },
    // read of S bytes: requests up to MRRS go upstream (no data), completions of `cpl` bytes come back with 3-DW headers
    read(S, mrrs, cplSize, a64) {
      const nreq = Math.ceil(S / mrrs); let ncpl = 0;
      for (let left = S; left > 0; left -= mrrs) ncpl += Math.ceil(Math.min(mrrs, left) / cplSize);
      const down = S + ncpl * (12 + this.perTlp), up = nreq * (this.hdrBytes(a64) + this.perTlp);
      return { nreq, ncpl, wire: down, up, oh: down - S, eff: S / down };
    },
    MPS: [128, 256, 512, 1024, 2048, 4096], maxLenDW: 1024
  };
  const LINK5x16 = () => LANE.link(5, 16);   // the link chapters 3–5 use: Gen5 ×16, 63.0 GB/s per direction

  /* ── 04 credit-based flow control. Data credit = 16 bytes (4 DW), header credit = one header; counters 8 bits (header)
     and 12 bits (data) counting mod 256 / 4096; the receiver never advertises more than 127 header or 2047 data credits
     beyond its buffer head (Colton 2024; Xillybus). The transmitter's gate: send if
     (CREDIT_LIMIT − (CREDITS_CONSUMED + needed)) mod 2^n ≤ 2^(n−1).
     Round trip `rtt` (TUNED reader parameter): from the end of a TLP to its credits arriving back at the sender. ── */
  const FC = {
    dataUnit: 16, maxHdr: 127, maxData: 2047, hdrMod: 256, dataMod: 4096,
    need(payload) { return { h: 1, d: Math.ceil(payload / this.dataUnit) }; },
    gate(limit, consumed, need, mod) { return ((limit - (consumed + need)) % mod + mod) % mod <= mod / 2; },
    tau(payload, L) { return (payload + 16 + TLP.perTlp) / L; },                         // ns on the wire, 4-DW header
    window(o) { const n = this.need(o.payload); return Math.min(Math.floor(o.hdr / n.h), Math.floor(o.data / n.d)); },
    closed(o) {
      const L = o.L || LINK5x16(), tau = this.tau(o.payload, L), W = this.window(o);
      const util = W <= 0 ? 0 : Math.min(1, W * tau / (tau + o.rtt));
      const n = this.need(o.payload), lim = Math.floor(o.hdr / n.h) < Math.floor(o.data / n.d) ? 'hdr' : 'data';
      const needW = Math.ceil((tau + o.rtt) / tau);
      return { tau, W, util, X: util * L * o.payload / (o.payload + 16 + TLP.perTlp), lim, needData: needW * n.d, needHdr: needW, L };
    },
    // event simulation with the modular gate; returns the sends, the credit trace, and measured throughput
    sim(o, T) {
      const L = o.L || LINK5x16(), tau = this.tau(o.payload, L), n = this.need(o.payload), scaled = !!o.scaled;
      const hm = scaled ? 1e9 : this.hdrMod, dm = scaled ? 1e9 : this.dataMod;
      let CLh = o.hdr % hm, CLd = o.data % dm, CCh = 0, CCd = 0, t = 0, busy = 0, sent = 0, avail = o.data;
      const ret = [], sends = [], trace = [[0, avail]];
      while (t < T) {
        while (ret.length && ret[0][0] <= t + 1e-9) { const r = ret.shift(); CLh = (CLh + r[1]) % hm; CLd = (CLd + r[2]) % dm; avail += r[2]; trace.push([r[0], avail]); }
        if (t >= busy - 1e-9 && this.gate(CLh, CCh, n.h, hm) && this.gate(CLd, CCd, n.d, dm)) {
          CCh = (CCh + n.h) % hm; CCd = (CCd + n.d) % dm; avail -= n.d; trace.push([t, avail]);
          sends.push(t); sent++; busy = t + tau; ret.push([t + tau + o.rtt, n.h, n.d]);
        } else {
          const nx = Math.min(busy > t + 1e-9 ? busy : Infinity, ret.length ? ret[0][0] : Infinity);
          if (!isFinite(nx)) break; t = nx;
        }
      }
      const half = sends.filter(s => s >= T / 2).length;
      return { sends, trace, util: half * tau / (T / 2), tau, sent };
    }
  };

  /* ── 05 ACK/NAK replay. A TLP of L bytes is hit with probability p = 1 − (1 − BER)^(8L); the link replays every TLP
     after the bad one (go-back-N). Stallings, Data and Computer Communications, ARQ: with the window covering the round
     trip, U = (1 − p) / (1 + 2a·p), 2a = round trip / frame time; selective repeat U = 1 − p. 12-bit sequence numbers;
     REPLAY_NUM is a 2-bit counter: the fourth replay in a row without progress retrains the link. ── */
  const ARQ = {
    seqBits: 12, replayRoll: 4, berSpec: 1e-12,
    pErr(bytes, ber) { return -Math.expm1(8 * bytes * Math.log1p(-ber)); },
    gbn(p, ratio) { return (1 - p) / (1 + ratio * p); },
    sr(p) { return 1 - p; },
    tlp(o) {
      const L = o.L || LINK5x16(), bytes = o.payload + 16 + TLP.perTlp, tau = bytes / L, p = this.pErr(bytes, o.ber), ratio = (tau + o.rtt) / tau;
      const perSec = 1e9 / tau, lineBits = o.lineGbps || 16 * 32;           // Gen5 ×16 line bits per ns
      return { bytes, tau, p, U: this.gbn(p, ratio), Usr: this.sr(p), ratio, perSec, errPerSec: o.ber * lineBits * 1e9, replayPerSec: perSec * p,
        retrainPerSec: perSec * Math.pow(p, this.replayRoll), bufBytes: L * (tau + o.rtt) };
    }
  };

  /* ── 06 enumeration. Depth-first bus numbering (primary / secondary / subordinate); BARs sized by writing all ones
     and reading back (pci_regs.h comment); memory BARs are powers of two, naturally aligned; bridge memory windows
     have 1 MiB granularity (MEMORY_BASE/LIMIT carry address bits 31:20). ECAM: bus << 20 | dev << 15 | fn << 12.
     MMIO base 0x8000_0000 and the device list are TUNED (chosen for the example); prefetchable windows not modelled. ── */
  const CFG = {
    type0: [[0x00, 2, 'vid'], [0x02, 2, 'did'], [0x04, 2, 'cmd'], [0x06, 2, 'sts'], [0x08, 1, 'rev'], [0x09, 3, 'class'], [0x0C, 1, 'cls'], [0x0D, 1, 'lat'], [0x0E, 1, 'htype'], [0x0F, 1, 'bist'],
      [0x10, 4, 'bar0'], [0x14, 4, 'bar1'], [0x18, 4, 'bar2'], [0x1C, 4, 'bar3'], [0x20, 4, 'bar4'], [0x24, 4, 'bar5'], [0x28, 4, 'cis'], [0x2C, 2, 'svid'], [0x2E, 2, 'sid'], [0x30, 4, 'rom'],
      [0x34, 1, 'cap'], [0x35, 7, 'rsv'], [0x3C, 1, 'iline'], [0x3D, 1, 'ipin'], [0x3E, 1, 'mingnt'], [0x3F, 1, 'maxlat']],
    hdrBytes: 64, spaceBytes: 256, extBytes: 4096,
    ecam(bus, dev, fn, reg) { return bus * 2 ** 20 + dev * 2 ** 15 + fn * 2 ** 12 + reg; },
    ECAM_BITS: [['bus', 8], ['dev', 5], ['fn', 3], ['reg', 12]],
    barProbe(size, a64) { return (((2 ** 32 - size) >>> 0) | (a64 ? 0x4 : 0)) >>> 0; },   // what reads back after writing FFFFFFFFh
    barSize(readback) { return ((~(readback & 0xFFFFFFF0)) >>> 0) + 1; }
  };
  const ENUM = {
    base: 0x80000000, win: MiB,
    // the example machine: three root ports; a switch with three downstream ports behind the second
    tree(o) {
      o = o || {};
      return { kind: 'rc', kids: [
        { kind: 'rp', dev: 1, kids: [{ kind: 'ep', id: 'gpu', bars: [16 * MiB, 256 * MiB, 32 * MiB] }] },
        { kind: 'rp', dev: 2, kids: [{ kind: 'sw', kids: [
          { kind: 'dp', dev: 0, kids: [{ kind: 'ep', id: 'ssd', bars: [16 * KiB] }] },
          { kind: 'dp', dev: 1, kids: [{ kind: 'ep', id: 'nic', bars: [128 * KiB, 16 * KiB] }] },
          { kind: 'dp', dev: 2, kids: o.card ? [{ kind: 'ep', id: 'card', bars: [o.cardBar || 4 * KiB] }] : [] }] }] },
        { kind: 'rp', dev: 3, kids: [{ kind: 'ep', id: 'usb', bars: [64 * KiB] }] }] };
    },
    alignUp(x, a) { return Math.ceil(x / a) * a; },
    run(o) {
      const root = this.tree(o), steps = [], devs = [], bridges = [];
      let nextBus = 0;
      const scan = (node, bus) => {                                    // node's children sit on `bus`
        node.kids.forEach((k, i) => {
          const dev = k.dev != null ? k.dev : (k.kind === 'sw' || k.kind === 'ep' ? 0 : i), bdf = { bus, dev, fn: 0 };
          if (k.kind === 'ep') { k.bdf = bdf; devs.push(k); steps.push({ k: 'ep', bdf, id: k.id }); return; }
          // a bridge (root port, switch upstream port, downstream port): number its secondary bus, recurse, close it
          const sec = ++nextBus; k.bdf = bdf; k.pri = bus; k.sec = sec; k.kids = k.kind === 'sw' ? k.kids : k.kids;
          bridges.push(k); steps.push({ k: 'br', bdf, kind: k.kind, sec });
          if (k.kind === 'sw') { const up = { kind: 'up', kids: k.kids }; scan(up, sec); } else scan(k, sec);
          k.sub = nextBus; steps.push({ k: 'close', bdf, kind: k.kind, sec, sub: k.sub });
        });
      };
      scan(root, nextBus);
      // size bottom-up: a bridge window holds its children's BARs and windows, each naturally aligned, rounded to 1 MiB
      const size = node => {
        if (node.kind === 'ep') { node.items = node.bars.map((s, i) => ({ s, a: s, ep: node, bar: i })); return; }
        const items = [];
        for (const k of node.kids) { size(k); if (k.kind === 'ep') items.push(...k.items); else if (k.need) items.push({ s: k.need, a: k.align, br: k }); }
        items.sort((x, y) => y.a - x.a || y.s - x.s);
        let end = 0; for (const it of items) { end = this.alignUp(end, it.a) + it.s; }
        node.items = items; node.raw = items.reduce((t, it) => t + it.s, 0);
        node.need = items.length ? this.alignUp(end, this.win) : 0; node.align = items.length ? Math.max(this.win, ...items.map(it => it.a)) : this.win;
      };
      size(root);
      const place = (node, start) => {
        node.base = start; let at = start;
        for (const it of node.items) {
          at = this.alignUp(at, it.a);
          if (it.br) place(it.br, at); else { it.ep.addr = it.ep.addr || []; it.ep.addr[it.bar] = at; }
          at += it.s;
        }
        if (node.kind !== 'ep' && node.kind !== 'rc') node.limit = node.need ? start + node.need - 1 : null;
      };
      place(root, this.base);
      const barSum = devs.reduce((t, d) => t + d.bars.reduce((a, b) => a + b, 0), 0);
      return { root, steps, devs, bridges, buses: nextBus + 1, barSum, used: root.need, waste: root.need - barSum };
    },
    // follow a memory address from the root complex down through the bridge windows
    route(r, addr) {
      const path = []; let node = r.root, hit = null;
      for (let guard = 0; guard < 8 && node; guard++) {
        let next = null;
        for (const k of node.kids) {
          if (k.kind === 'ep') { k.bars.forEach((s, i) => { if (addr >= k.addr[i] && addr < k.addr[i] + s) hit = { ep: k, bar: i, off: addr - k.addr[i] }; }); if (hit) break; }
          else if (k.need && addr >= k.base && addr <= k.limit) { next = k; path.push(k); break; }
        }
        if (hit || !next) break;
        node = next.kind === 'sw' ? { kids: next.kids } : next;
      }
      return { path, hit };
    }
  };

  /* ── 07 MSI. x86 message address: bits 31:20 = FEEh, 19:12 destination APIC ID, bit 3 RH, bit 2 DM; message data:
     7:0 vector, 10:8 delivery mode, 14 level, 15 trigger (Intel SDM vol. 3A §10.11). MSI-X table entry 16 bytes:
     address low, address high, data, vector control (pci_regs.h). The interrupt is a posted 1-DW memory write. ── */
  const MSI = {
    addr(dest, rh, dm) { return (0xFEE << 20 | (dest & 255) << 12 | (rh ? 8 : 0) | (dm ? 4 : 0)) >>> 0; },
    data(vector, mode, level, trigger) { return (vector & 255) | (mode & 7) << 8 | (level ? 1 << 14 : 0) | (trigger ? 1 << 15 : 0); },
    decode(a, d) { return { fee: a >>> 20, dest: (a >>> 12) & 255, rh: (a >>> 3) & 1, dm: (a >>> 2) & 1, vector: d & 255, mode: (d >>> 8) & 7, level: (d >>> 14) & 1, trigger: (d >>> 15) & 1 }; },
    entry(a, d, masked) { const le = x => [x & 255, (x >>> 8) & 255, (x >>> 16) & 255, (x >>> 24) & 255]; return [].concat(le(a), le(0), le(d), le(masked ? 1 : 0)); },
    tlp(a, d, rid, tag) { const h = TLP.mem('wr', a, 4, rid, tag); return { hdr: h, data: [d & 255, (d >>> 8) & 255, (d >>> 16) & 255, (d >>> 24) & 255] }; },
    billauer: { addr: 0xFEE0300C, data: 0x4171 }      // read with lspci -vv on a real machine (Billauer's blog)
  };

  /* ── 08 channel loss. Dielectric: 2.3·f[GHz]·Df·√Dk dB/in (rule of thumb); conductor: skin effect plus foil
     roughness ∝ √f, scaled from Hargin (Siemens, 2025-10-09): at 10 GHz skin 0.42, RTF roughness 0.55, HVLP2 0.11 dB/in,
     dielectric 0.48 dB/in at Df 0.010. Dk 4.35 is chosen so 2.3·10·0.010·√Dk = 0.48 (TUNED). Budgets at Nyquist:
     Gen5 36 dB @ 16 GHz (Keysight 2020; TI), Gen6 32 dB @ 16 GHz (Tektronix), Gen7 ≈36 dB @ 32 GHz (Tektronix 2023
     and Samtec/DesignCon 2024, pre-release). Fixed allocation: root-complex package 8.5 + connector 1.5 + add-in card
     (9.5 Gen5, 8.5 Gen6, ≈9 Gen7) from Tektronix's test set-ups; package and connector at Gen6/7 assumed equal to
     Gen5 (TUNED). A retimer starts a new channel with the full budget (TI SNLA401). ── */
  const LOSS = {
    MAT: { fr4: { Df: 0.020, Dk: 4.35, cond10: 0.97 }, mid: { Df: 0.010, Dk: 4.35, cond10: 0.97 }, low: { Df: 0.005, Dk: 4.35, cond10: 0.53 } },
    hargin: { skin10: 0.42, rtf10: 0.55, hvlp10: 0.11, diel10: 0.48 },
    GEN: { 5: { budget: 36, f: 16, pkg: 8.5, conn: 1.5, card: 9.5 }, 6: { budget: 32, f: 16, pkg: 8.5, conn: 1.5, card: 8.5 }, 7: { budget: 36, f: 32, pkg: 8.5, conn: 1.5, card: 9 } },
    gen4: { budget: 28, f: 8 }, retimer: 28, redriver: 16, maxRetimers: 2,
    diel(m, f) { const o = this.MAT[m]; return 2.3 * f * o.Df * Math.sqrt(o.Dk); },
    cond(m, f) { return this.MAT[m].cond10 * Math.sqrt(f / 10); },
    alpha(m, f) { return this.diel(m, f) + this.cond(m, f); },                      // dB per inch
    fixed(g) { const o = this.GEN[g]; return o.pkg + o.conn + o.card; },
    reach(g, m) { const o = this.GEN[g]; return Math.max(0, o.budget - this.fixed(g)) / this.alpha(m, o.f); },
    // a trace of `len` inches split evenly by k retimers into k+1 channels; each carries the fixed allocation
    link(g, m, len, k) {
      const o = this.GEN[g], seg = len / (k + 1), a = this.alpha(m, o.f), each = this.fixed(g) + seg * a;
      return { a, seg, each, budget: o.budget, margin: o.budget - each, ok: each <= o.budget + 1e-9, reach: this.reach(g, m) * (k + 1), f: o.f };
    }
  };

  /* ── 09 NRZ vs PAM4. Same peak-to-peak swing V, Gaussian noise σ (Proakis, M-PAM): NRZ decision distance V/2,
     BER = Q(V/2σ); PAM4 eyes are a third as tall, SER = 2(1 − 1/4)·Q(V/6σ), BER ≈ SER/2 with Gray coding. ── */
  function erfc(x) {                        // Numerical Recipes erfcc, fractional error < 1.2e-7
    const z = Math.abs(x), t = 1 / (1 + 0.5 * z);
    const r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
    return x >= 0 ? r : 2 - r;
  }
  const Q = x => 0.5 * erfc(x / Math.SQRT2);
  const EYE = {
    ratio: 1 / 3, penaltyDb: -20 * Math.log10(1 / 3),
    snr(db) { return Math.pow(10, db / 20); },                                      // V/σ from dB
    nrz(db) { return Q(this.snr(db) / 2); },
    pam4(db) { return 0.75 * Q(this.snr(db) / 6); },
    need(fn, target) { let lo = 0, hi = 60; for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (this[fn](m) > target) lo = m; else hi = m; } return (lo + hi) / 2; },
    fber6: 1e-6, ber5: 1e-12
  };

  /* ── 10 FLIT FEC and retry. Byte (symbol) error q = 1 − (1 − BER)^8, errors independent (an assumption: PAM4 with
     DFE errs in bursts, which precoding and the 3-way interleave address); each interleave corrects one symbol, so it
     fails with ≥ 2 bad bytes. Without FEC any bad byte forces a retry (the CRC detects). Retry cost from ch5. Latency
     and bandwidth accounting reproduce Das Sharma 2022 slide 13. ── */
  const FEC = {
    cw: [86, 85, 85], decodeNs: 2,     // FEC correction plus CRC check: under 2 ns (Das Sharma 2022)
    q(ber) { return -Math.expm1(8 * Math.log1p(-ber)); },
    pCw(n, q) { return -Math.expm1(n * Math.log1p(-q)) - n * q * Math.exp((n - 1) * Math.log1p(-q)); },
    retry(ber, fec) {
      const q = this.q(ber);
      if (!fec) return -Math.expm1(FLIT.bytes * Math.log1p(-q));
      let ok = 1; for (const n of this.cw) ok *= 1 - Math.max(0, this.pCw(n, q)); return 1 - ok;
    },
    flitNs(lanes, g) { return FLIT.bytes / (lanes * GENS[g || 6].gts / 8); },
    goodput(o) {
      const tau = this.flitNs(o.lanes || 16), p = this.retry(o.ber, o.fec), ratio = (tau + o.rtt) / tau;
      const U = o.mode === 'sr' ? ARQ.sr(p) : ARQ.gbn(p, ratio);
      return { p, tau, ratio, U, X: U * LANE.link(6, o.lanes || 16) };
    },
    // Das Sharma slide 13: latency to move a TLP of (data + 4) DW; 128b/130b at 32 GT/s vs FLIT at 64 GT/s, where a
    // TLP waits on average half a FLIT (accumulation) and the FLIT's own overhead is ignored
    lat130(dataDW, lanes) { return (4 * (dataDW + 4) + TLP.perTlp) / (lanes * 4 * 128 / 130); },
    latFlit(dataDW, lanes) { return (FLIT.bytes / 2 + 4 * (dataDW + 4)) / (lanes * 8); },
    // bandwidth of Gen6 FLIT at 64 GT/s over Gen5 at 32 GT/s with 2 % DLLP overhead, both with 4-DW headers
    eff130(dataDW) { return dataDW / (dataDW + 4 + 2) * 128 / 130 * 0.98; },
    effFlit(dataDW) { return dataDW / (dataDW + 4) * FLIT.tlp / FLIT.bytes; },
    scale(dataDW) { return 2 * this.effFlit(dataDW) / this.eff130(dataDW); },
    crossover() { let lo = 1, hi = 1024; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (this.scale(m) > 2) lo = m; else hi = m; } return (lo + hi) / 2; },
    dds: [[0, 6.09375, 18, 0.380859375, 1.125], [4, 10.15625, 20, 0.634765625, 1.25], [8, 14.21875, 22, 0.888671875, 1.375], [16, 22.34375, 26, 1.396484375, 1.625],
      [32, 38.59375, 34, 2.412109375, 2.125], [64, 71.09375, 50, 4.443359375, 3.125], [128, 136.09375, 82, 8.505859375, 5.125], [256, 266.09375, 146, 16.63085938, 9.125],
      [512, 526.09375, 274, 32.88085938, 17.125], [1024, 1046.09375, 530, 65.38085938, 33.125]]     // data DW, x1 130b, x1 flit, x16 130b, x16 flit (ns)
  };

  /* ── frontier facts (as of November 2026); sources and dates opened in BRIEF.md ── */
  const FRONTIER = {
    gen7: '2025-06', optical: '2025-06', gen8draft03: '2025-09', gen8draft05: '2026-05', gen8target: 2028, gen8gts: 256,
    gen6workshop: '2026-07-31', cxl4: '2025-11', ssd6: '2026-02', gen7x16bidir: 512, gen8x16bidir: 1000
  };

  /* ── numbers quoted in the prose: [value, decimals, kind] ── */
  function prose() {
    const L = LINK5x16();
    const fc = FC.closed({ payload: 256, hdr: 127, data: 2047, rtt: 1000 });
    const fcHalf = FC.closed({ payload: 256, hdr: 127, data: 2047, rtt: 500 }), fcDbl = FC.closed({ payload: 256, hdr: 127, data: 2047, rtt: 2000 });
    const fc128 = FC.closed({ payload: 128, hdr: 127, data: 2047, rtt: 1000 });
    const a12 = ARQ.tlp({ payload: 256, ber: 1e-12, rtt: 1000 }), a8 = ARQ.tlp({ payload: 256, ber: 1e-8, rtt: 1000 }), a6 = ARQ.tlp({ payload: 256, ber: 1e-6, rtt: 1000 });
    const a6big = ARQ.tlp({ payload: 4096, ber: 1e-6, rtt: 1000 }), a6small = ARQ.tlp({ payload: 128, ber: 1e-6, rtt: 1000 });
    const w256 = TLP.write(4096, 256, true), w128 = TLP.write(4096, 128, true), w512 = TLP.write(4096, 512, true), w64 = TLP.write(64, 256, true);
    const r512 = TLP.read(4096, 512, 256, true), r64 = TLP.read(4096, 512, 64, true);
    const e = ENUM.run({ card: true, cardBar: 4 * KiB }), e0 = ENUM.run({});
    const card = e.bridges.find(b => b.kind === 'dp' && b.dev === 2);
    const g5 = LOSS.link(5, 'fr4', 10, 0), noFec = FEC.goodput({ ber: 1e-6, fec: false, rtt: 1000 }), withFec = FEC.goodput({ ber: 1e-6, fec: true, rtt: 1000 });
    const noFecSr = FEC.goodput({ ber: 1e-6, fec: false, rtt: 1000, mode: 'sr' });
    const nrz12 = EYE.need('nrz', 1e-12), pam12 = EYE.need('pam4', 1e-12), pam6 = EYE.need('pam4', 1e-6);
    // halving and doubling the TUNED parameters: the 1000 ns round trip (ch5, ch10) and the Gen7 package + connector loss (ch8)
    const a6half = ARQ.tlp({ payload: 256, ber: 1e-6, rtt: 500 }), a6dbl = ARQ.tlp({ payload: 256, ber: 1e-6, rtt: 2000 });
    const noFecHalf = FEC.goodput({ ber: 1e-6, fec: false, rtt: 500 }), noFecDbl = FEC.goodput({ ber: 1e-6, fec: false, rtt: 2000 });
    const g7 = LOSS.GEN[7], r7k = k => (g7.budget - g7.card - k * (g7.pkg + g7.conn)) / LOSS.alpha('mid', g7.f);
    const len = 10, f16 = LOSS.alpha('mid', 16) * len, f32 = LOSS.alpha('mid', 32) * len;
    return {
      // ch2
      g1: [LANE.dataGBps(1), 2], g2: [LANE.dataGBps(2), 1], g3: [LANE.dataGBps(3), 3], g5x16: [L, 1], g4x8: [LANE.link(4, 8), 1],
      g6lane: [LANE.dataGBps(6), 3], g7lane: [LANE.dataGBps(7), 2],
      o8: [GEN3.data(GEN3.opt8), 2], o10: [GEN3.data(GEN3.opt10), 0], oDb: [GEN3.opt10.ilDb - GEN3.opt8.ilDb, 1], g3g2: [LANE.dataGBps(3) / LANE.dataGBps(2), 2],
      enc130: [1 - 128 / 130, 2, 'pct'], enc10: [0.2, 0, 'pct'], flitOh: [1 - FLIT.tlp / FLIT.bytes, 1, 'pct'],
      // ch3
      w256: [w256.eff, 1, 'pct'], w128: [w128.eff, 1, 'pct'], w512: [w512.eff, 1, 'pct'], w64: [w64.eff, 1, 'pct'], w256X: [w256.eff * L, 1],
      r512: [r512.eff, 1, 'pct'], r64: [r64.eff, 1, 'pct'], r64n: [r64.ncpl, 0], r512n: [r512.ncpl, 0], r512q: [r512.nreq, 0],
      // ch4
      fcU: [fc.util, 0, 'pct'], fcX: [fc.X, 1], fcW: [fc.W, 0], fcTau: [fc.tau, 2], fcNeed: [fc.needData, 0], fcNeedKB: [fc.needData * 16 / 1000, 1], capKiB: [FC.maxData * 16 / 1024, 0],
      fcHalf: [fcHalf.util, 0, 'pct'], fcDbl: [fcDbl.util, 0, 'pct'], fc128: [fc128.util, 0, 'pct'], fc128W: [fc128.W, 0],
      // ch5
      e12: [a12.errPerSec, 2], p12: [a12.p, 1, 'sci'], p8: [a8.p, 1, 'sci'], u8: [a8.U, 2, 'pct'], p6: [a6.p, 2, 'pct'], u6: [a6.U, 0, 'pct'], u6sr: [a6.Usr, 1, 'pct'],
      u6half: [a6half.U, 0, 'pct'], u6dbl: [a6dbl.U, 0, 'pct'], u6big: [a6big.U, 0, 'pct'], u6small: [a6small.U, 0, 'pct'], ratio: [a6.ratio, 0], buf: [a6.bufBytes / 1000, 0],
      // ch6
      buses: [e.buses, 0], used: [e.used / MiB, 0], barSum: [e.barSum / MiB, 2], waste: [e.waste / MiB, 2], cardWin: [card.need / MiB, 0], cardBar: [4, 0], used0: [e0.used / MiB, 0],
      // ch8
      a16: [LOSS.alpha('fr4', 16), 2], a16l: [LOSS.alpha('low', 16), 2], fix5: [LOSS.fixed(5), 1], r5f: [LOSS.reach(5, 'fr4'), 1], r5m: [LOSS.reach(5, 'mid'), 1], r5l: [LOSS.reach(5, 'low'), 1],
      r6m: [LOSS.reach(6, 'mid'), 1], r7m: [LOSS.reach(7, 'mid'), 1], r7l: [LOSS.reach(7, 'low'), 1], left5: [36 - LOSS.fixed(5), 1], r7mHalf: [r7k(0.5), 1], r7mDbl: [r7k(2), 1],
      // ch9
      pen: [EYE.penaltyDb, 2], nrz12: [nrz12, 1], pam12: [pam12, 1], pam6: [pam6, 1], gap12: [pam12 - nrz12, 1], gapUse: [pam6 - nrz12, 1],
      loss16: [f16, 1], loss32: [f32, 1], lossGap: [f32 - f16, 1],
      // ch10
      pNo: [noFec.p, 1, 'pct'], uNo: [noFec.U, 0, 'pct'], uNoSr: [noFecSr.U, 1, 'pct'], pFec: [withFec.p, 1, 'sci'], uFec: [withFec.U, 2, 'pct'], flitRatio: [noFec.ratio, 0], uNoHalf: [noFecHalf.U, 0, 'pct'], uNoDbl: [noFecDbl.U, 0, 'pct'],
      cross: [FEC.crossover(), 0], crossB: [FEC.crossover() * 4, 0], sc1: [FEC.scale(1), 2], sc1024: [FEC.scale(1024), 2],
      lat0x1: [FEC.latFlit(0, 1) - FEC.lat130(0, 1), 1], lat1024x1: [FEC.lat130(1024, 1) - FEC.latFlit(1024, 1), 0],
      decNs: [FEC.decodeNs, 0],
      // ch11 (FRONTIER)
      f7bi: [FRONTIER.gen7x16bidir, 0], f8bi: [FRONTIER.gen8x16bidir, 0], f8gts: [FRONTIER.gen8gts, 0]
    };
  }

  /* ── formatting: language-aware ── */
  function fmt(x, d, lang) {
    if (x == null || !isFinite(x)) return '—';
    const s = (d == null ? (Math.abs(x) >= 100 ? 0 : Math.abs(x) >= 10 ? 1 : 2) : d);
    return Number(x).toLocaleString(lang === 'en' ? 'en-US' : 'zh-CN', { minimumFractionDigits: s, maximumFractionDigits: s });
  }
  // 1.2 × 10⁻⁷ style for small probabilities, language-independent
  function sci(x, d) {
    if (!(x > 0)) return '0';
    const e = Math.floor(Math.log10(x)), m = x / Math.pow(10, e), sup = s => String(s).replace(/-/g, '⁻').replace(/\d/g, c => '⁰¹²³⁴⁵⁶⁷⁸⁹'[c]);
    if (e >= -2 && e <= 3) return fmt(x, d == null ? 3 : d, 'en');
    const ms = m.toFixed(d == null ? 1 : d);
    return (ms === '1.0' || ms === '1' ? '' : ms + ' × ') + '10' + sup(e);
  }

  /* ── live sentences: { key, v } ── */
  const say = {
    lane(card, slot) {
      const r = LANE.negotiate(card, slot), v = Object.assign({}, r, { share: r.GBps / r.full });
      if (r.limit === 'genwidth') return { key: 'ch2.say.both', v };
      if (r.limit === 'gen') return { key: 'ch2.say.gen', v };
      if (r.limit === 'width') return { key: 'ch2.say.width', v };
      if (r.limit === 'card') return { key: 'ch2.say.card', v };
      return { key: 'ch2.say.match', v };
    },
    tlp(op, S, mps, mrrs, cpl) {
      const r = op === 'wr' ? TLP.write(S, mps, true) : TLP.read(S, mrrs, cpl, true), v = Object.assign({ X: r.eff * LINK5x16() }, r);
      if (op === 'rd') return { key: cpl < mps ? 'ch3.say.rdsplit' : 'ch3.say.rd', v };
      return { key: r.eff < 0.8 ? 'ch3.say.small' : 'ch3.say.wr', v };
    },
    fc(o) {
      const r = FC.closed(o);
      if (r.util >= 0.999) return { key: 'ch4.say.full', v: r };
      return { key: r.lim === 'hdr' ? 'ch4.say.hdr' : 'ch4.say.data', v: r };
    },
    arq(o) {
      const r = ARQ.tlp(o);
      if (r.U > 0.9999) return { key: 'ch5.say.clean', v: r };
      if (r.U > 0.9) return { key: 'ch5.say.some', v: r };
      return { key: 'ch5.say.bad', v: r };
    },
    enumr(o, stepN) {
      const r = ENUM.run(o), done = stepN == null || stepN >= r.steps.length;
      if (!done) return { key: 'ch6.say.step', v: { r, n: stepN, s: r.steps[Math.max(0, stepN - 1)] } };
      return { key: o.card ? 'ch6.say.card' : 'ch6.say.done', v: { r } };
    },
    loss(g, m, len, k) {
      const r = LOSS.link(g, m, len, k);
      if (!r.ok) return { key: k < LOSS.maxRetimers ? 'ch8.say.fail' : 'ch8.say.failmax', v: r };
      return { key: k > 0 ? 'ch8.say.okret' : 'ch8.say.ok', v: r };
    },
    eye(db) {
      const n = EYE.nrz(db), p = EYE.pam4(db), v = { n, p };
      if (n > 1e-12) return { key: 'ch9.say.noisy', v };
      if (p > 1e-6) return { key: 'ch9.say.mid', v };
      return { key: 'ch9.say.clean', v };
    },
    fec(o) {
      const r = FEC.goodput(o);
      if (o.fec) return { key: 'ch10.say.fec', v: r };
      return { key: r.U < 0.9 ? 'ch10.say.nofecbad' : 'ch10.say.nofec', v: r };
    },
    flit(dw, lanes) {
      const a = FEC.lat130(dw, lanes), b = FEC.latFlit(dw, lanes), v = { a, b, s: FEC.scale(Math.max(dw, 1)) };
      return { key: b > a ? 'ch10.say.slower' : 'ch10.say.faster', v };
    }
  };

  return { GENS, WIDTHS, FLIT, LANE, GEN3, TLP, FC, ARQ, CFG, ENUM, MSI, LOSS, EYE, FEC, FRONTIER, Q, erfc, fmt, sci, say, prose, clamp, encEff, KiB, MiB, LINK5x16 };
});
