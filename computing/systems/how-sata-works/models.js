/* How SATA works: the page's models. Each one implements a named, published result or the text of a standard;
   constants that are tuned (not taken from a source) are marked TUNED here and flagged on the page.
   UMD: window.SataModels in the browser, module.exports in node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SataModels = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

  /* ── Figures quoted from the standards (Serial ATA Revision 3.5a Gold, 2 Mar 2021; ATA/ATAPI-7 Vol 2 rev 4b;
     Intel AHCI). Every prose figure that comes from a document lives here, so the node test can pin it. ── */
  const SPEC = {
    gens: [
      { id: 1, gbps: 1.5, uiPs: 666.6667 },
      { id: 2, gbps: 3.0, uiPs: 333.3333 },
      { id: 3, gbps: 6.0, uiPs: 166.6667 }
    ],
    // ratification dates, SATA 3.5a §1 revision history
    revisions: [
      { v: '2.5', date: '2005-10-27' }, { v: '2.6', date: '2007-02-15' }, { v: '3.0', date: '2009-06-06' },
      { v: '3.1', date: '2011-07-18' }, { v: '3.2', date: '2013-08-07' }, { v: '3.3', date: '2016-02-02' },
      { v: '3.4', date: '2018-06-13' }, { v: '3.5', date: '2020-07-01' }, { v: '3.5a', date: '2021-03-02' }
    ],
    sata10a: '2003-01-07',          // Serial ATA 1.0a cover page
    sata10aGen3Plan: 2007,          // 1.0a §2.2: Gen3 estimated introduction "mid 2007"
    sata10aRoadmapYears: 10,        // 1.0a §2.1: "Allows roadmap spanning ~10 years"
    ahci10: '2004-04-13',           // Intel press release, IDF Taipei
    ahciPorts: 32, ahciSlots: 32,   // Intel AHCI 1.3.1 page: 1 to 32 ports, command list up to 32 entries
    satae: '2011-08-09',            // SATA-IO announces SATA Express (8 and 16 Gb/s over PCIe)
    sataeGbps: [8, 16],
    signalPins: 7, pairs: 2, gndPins: 3, powerPins: 15,   // Table 5
    txGen1: [400, 500, 600],        // mVppd min/nom/max, Table 54 Gen1i
    txGen3: [240, 900],             // mVppd device min/max, Table 54 Gen3i
    tags: 32, pmPorts: 15,          // §13.6.2.1 tags 0..31; Port Multiplier up to 15 device ports
    exit: { partial: 10e-6, slumber: 10e-3, devslp: 20e-3 },   // Table 78 maxima (DevSleep: DETO default)
    mdat: 10e-3,                    // Table 79: minimum DEVSLP assertion time
    cableInt: 1, cableExt: 2,       // metres, Table 1
    dataFisMaxDw: 2048, frameMaxDw: 2064,
    alignEvery: 256, alignPair: 2,
    rtDw: 20,                       // Table 95: informative round-trip example, 20 Dwords
    crcInit: 0x52325032, crcPoly: 0x04C11DB7,
    readFpdma: 0x60, writeFpdma: 0x61,
    oobGapNs: { wake: 106.7, init: 320 },   // Table 76: COMWAKE and COMINIT/COMRESET nominal gap lengths
    msataRev: '3.1', m2Rev: '3.2', devslpRev: '3.2',
    m2: { B: { sata: 1, pcie: [1, 2] }, M: { sata: 1, pcie: [1, 2, 4] } }   // §6.9.13, §6.9.14
  };

  /* ── 02 parallel ATA: Ultra DMA timing, ATA/ATAPI-7 Vol 2 rev 4b Table 51 (t2CYCTYP, tCYC, tDS, tDH) and
     Annex E.5.1.1 (worst-case strobe-to-data skew, sender's component I/O to recipient's component I/O; extra
     negative skew for 40-conductor cables in modes 0–2 from crosstalk and ringing). All values in ns.
     The "budget" adds the recipient's setup and hold times to the two worst skews. That sum is this page's
     accounting, not the standard's own derivation (which works at each connector); the page says so. ── */
  const UDMA = {
    t2: [240, 160, 120, 90, 60, 40, 30],
    cyc: [112, 73, 54, 39, 25, 16.8, 13.0],
    ds: [15, 10, 7, 7, 5, 4.0, 2.6],
    dh: [5, 5, 5, 5, 5, 4.6, 3.5],
    neg: [5.99, 5.99, 5.99, 5.99, 5.99, 4.34, 3.6],
    pos: [5.38, 5.38, 5.38, 5.38, 5.38, 3.83, 3.06],
    settle40: [70, 36, 22, null, null, null, null],
    cableIn: 18,                    // inches, Annex E.1: maximum length
    dataLines: 16,
    mbps(m) { return 4 / this.t2[m] * 1000; },            // two 16-bit words per t2CYCTYP, MB/s (1e6 B)
    budget(m, cable, scale) {
      const k = scale == null ? 1 : scale;
      const s40 = cable === 40 ? this.settle40[m] : 0;
      const skew = (this.neg[m] + this.pos[m]) * k;
      const allowed = !(cable === 40 && s40 == null);
      const used = this.ds[m] + this.dh[m] + skew + (s40 || 0) * k;
      return { cyc: this.cyc[m], ds: this.ds[m], dh: this.dh[m], skew, settle: (s40 || 0) * k, used, margin: this.cyc[m] - used,
        allowed, ok: allowed && used <= this.cyc[m] + 1e-9, mbps: this.mbps(m) };
    },
    // the fastest mode whose budget still closes under a skew scale
    fastest(cable, scale) { let best = -1; for (let m = 0; m < 7; m++) if (this.budget(m, cable, scale).ok) best = m; return best; },
    // without skew: only setup + hold remain (what an embedded-clock serial link avoids paying)
    noSkewCycle(m) { return this.ds[m] + this.dh[m]; },
    perWireMbps(m) { return 1 / (this.t2[m] / 2) * 1000; },  // Mb/s on one data line: one bit per edge (tCYC typ = t2/2)
    sataGen1Payload() { return SPEC.gens[0].gbps * 1000 * 8 / 10 / 8; } // MB/s after 8b/10b
  };

  /* ── 03 8b/10b (Widmer & Franaszek 1983; SATA 3.5a Tables 85, 86, 89). Bits are written abcdei fghj, a first.
     The 5b/6b and 3b/4b sub-block tables below are typed from Tables 85 and 86; tests/models.cjs checks that
     encoding every byte from both running disparities reproduces all 512 entries of Table 88. ── */
  const T6 = [ // [rd−, rd+] for D0..D31
    ['100111', '011000'], ['011101', '100010'], ['101101', '010010'], ['110001', '110001'], ['110101', '001010'],
    ['101001', '101001'], ['011001', '011001'], ['111000', '000111'], ['111001', '000110'], ['100101', '100101'],
    ['010101', '010101'], ['110100', '110100'], ['001101', '001101'], ['101100', '101100'], ['011100', '011100'],
    ['010111', '101000'], ['011011', '100100'], ['100011', '100011'], ['010011', '010011'], ['110010', '110010'],
    ['001011', '001011'], ['101010', '101010'], ['011010', '011010'], ['111010', '000101'], ['110011', '001100'],
    ['100110', '100110'], ['010110', '010110'], ['110110', '001001'], ['001110', '001110'], ['101110', '010001'],
    ['011110', '100001'], ['101011', '010100']
  ];
  const T4 = [['1011', '0100'], ['1001', '1001'], ['0101', '0101'], ['1100', '0011'], ['1101', '0010'], ['1010', '1010'], ['0110', '0110'], ['1110', '0001']];
  const A7 = ['0111', '1000'];
  const KCODE = { 3: ['0011110011', '1100001100'], 5: ['0011111010', '1100000101'] };  // Table 89, K28.3 and K28.5
  const ones = s => { let n = 0; for (const c of s) if (c === '1') n++; return n; };
  // running disparity after a sub-block (Widmer & Franaszek): unbalanced blocks set it; 000111/0011 count as +,
  // 111000/1100 as −; other balanced blocks leave it
  function rdAfter(block, rd) {
    const o = ones(block), z = block.length - o;
    if (o > z) return 1; if (z > o) return -1;
    if (block === '000111' || block === '0011') return 1;
    if (block === '111000' || block === '1100') return -1;
    return rd;
  }
  const B8 = {
    encode(byte, rd) {
      const x = byte & 31, y = byte >> 5, c = rd < 0 ? 0 : 1;
      const six = T6[x][c]; const rd1 = rdAfter(six, rd);
      let four;
      if (y === 7) {
        const e = six[4], i = six[5];
        four = ((rd1 < 0 && e === '1' && i === '1') || (rd1 > 0 && e === '0' && i === '0')) ? A7[rd1 < 0 ? 0 : 1] : T4[7][rd1 < 0 ? 0 : 1];
      } else four = T4[y][rd1 < 0 ? 0 : 1];
      const rd2 = rdAfter(four, rd1);
      return { code: six + four, rd: rd2, name: 'D' + x + '.' + y };
    },
    encodeK(y, rd) { const code = KCODE[y][rd < 0 ? 0 : 1]; return { code, rd: -rd, name: 'K28.' + y }; },
    // bytes as an array of { v, k } (k = true for a control character K28.v); returns the encoded symbols
    stream(items, rd0) {
      let rd = rd0 == null ? -1 : rd0; const out = [];
      for (const it of items) { const s = it.k ? this.encodeK(it.v, rd) : this.encode(it.v, rd); out.push(Object.assign({ rdIn: rd, byte: it.v, k: !!it.k }, s)); rd = s.rd; }
      return out;
    },
    // the raw serial bit string of bytes sent without coding, least significant bit first (the same order as a..h)
    rawBits(bytes) { let s = ''; for (const b of bytes) for (let i = 0; i < 8; i++) s += (b >> i) & 1; return s; },
    stats(bits) {
      let run = 0, maxRun = 0, prev = '', tr = 0, rds = 0, maxAbs = 0, lo = 0, hi = 0;
      for (const c of bits) {
        if (c === prev) run++; else { if (prev) tr++; run = 1; prev = c; }
        if (run > maxRun) maxRun = run;
        rds += c === '1' ? 1 : -1; if (rds > hi) hi = rds; if (rds < lo) lo = rds;
      }
      maxAbs = Math.max(hi, -lo);
      return { n: bits.length, maxRun, transitions: tr, density: bits.length > 1 ? tr / (bits.length - 1) : 0, rdsEnd: rds, rdsLo: lo, rdsHi: hi, swing: hi - lo, maxAbs };
    },
    // the shortest period p (≤ 40 bits) with which the bit string repeats exactly, or 0 if none
    period(bits) { for (let p = 1; p <= 40 && p < bits.length / 2; p++) { let ok = true; for (let i = 0; i + p < bits.length; i++) if (bits[i] !== bits[i + p]) { ok = false; break; } if (ok) return p; } return 0; },
    // positions of the comma pattern (0011111 or 1100000) in a bit string
    commas(bits) { const out = []; for (let i = 0; i + 7 <= bits.length; i++) { const w = bits.substr(i, 7); if (w === '0011111' || w === '1100000') out.push(i); } return out; }
  };

  /* ── SATA link: CRC-32 (SATA 3.5a §9.6, Annex A.1) and the payload scrambler (§9.6, Annex A.2: LFSR
     x^16+x^15+x^13+x^4+1, seed FFFFh). The tests pin both to the spec's worked example (Annex A.3) and the first 32
     scrambler outputs (Annex A.2.4). ── */
  const LINK = {
    crc(dwords, init) {
      let c = (init == null ? SPEC.crcInit : init) >>> 0; const trace = [];
      for (const d of dwords) {
        c = (c ^ d) >>> 0;
        for (let i = 0; i < 32; i++) c = (c & 0x80000000) ? (((c << 1) ^ SPEC.crcPoly) >>> 0) : ((c << 1) >>> 0);
        trace.push(c);
      }
      return { crc: c, trace };
    },
    scrambler(n) {
      let s = 0xFFFF; const out = [];
      for (let w = 0; w < n; w++) {
        let v = 0;
        for (let k = 0; k < 32; k++) { const b = (s >> 15) & 1; s = ((s << 1) & 0xFFFF) ^ (b ? 0xA011 : 0); v = (v | (b << k)) >>> 0; }
        out.push(v >>> 0);
      }
      return out;
    },
    hex(d) { return (d >>> 0).toString(16).toUpperCase().padStart(8, '0'); },
    // Register Host-to-Device FIS for READ FPDMA QUEUED (SATA 3.5a Fig. 275 and Fig. 337)
    h2dRead(lba, sectors, tag) {
      const sc = sectors & 0xFFFF, L = n => Math.floor(lba / Math.pow(2, n)) % 256;
      const d0 = (0x27 | (0x80 << 8) | (SPEC.readFpdma << 16) | ((sc & 0xFF) << 24)) >>> 0;
      const d1 = (L(0) | (L(8) << 8) | (L(16) << 16) | (0x40 << 24)) >>> 0;     // Device: bit 6 set (LBA)
      const d2 = (L(24) | (L(32) << 8) | (L(40) << 16) | (((sc >> 8) & 0xFF) << 24)) >>> 0;
      const d3 = ((tag & 31) << 3) >>> 0;                                        // COUNT(7:3) = TAG
      return [d0, d1, d2, d3, 0];
    },
    // the frames of one READ FPDMA QUEUED, in order. len = FIS Dwords (type Dword included)
    readFrames(sectors, sectorBytes) {
      const bytes = sectors * (sectorBytes || 512), dw = Math.ceil(bytes / 4), fr = [];
      fr.push({ id: 'h2d', dir: 'h', len: 5 }, { id: 'd2h', dir: 'd', len: 5 }, { id: 'dmas', dir: 'd', len: 7 });
      for (let left = dw; left > 0; left -= SPEC.dataFisMaxDw) fr.push({ id: 'data', dir: 'd', len: 1 + Math.min(left, SPEC.dataFisMaxDw) });
      fr.push({ id: 'sdb', dir: 'd', len: 2 });
      return { frames: fr, payloadDw: dw, bytes };
    },
    /* Wire accounting for one command. A frame costs SOF + FIS + CRC + EOF, plus two handshakes, each one round
       trip (X_RDY→R_RDY before, WTRM→R_OK after); the round trip is the spec's informative 20 Dwords (Table 95), an
       upper bound for a literal design. ALIGN pairs are added every 256 Dwords. Command processing inside the host and
       the drive is not counted: this is the wire's own best case. */
    wire(sectors, gen, rt) {
      const R = rt == null ? SPEC.rtDw : rt, rf = this.readFrames(sectors), g = SPEC.gens[(gen || 3) - 1];
      let framed = 0, hs = 0;
      for (const f of rf.frames) { framed += 3 + f.len; hs += 2 * R; }
      const pre = framed + hs, align = SPEC.alignPair * Math.floor(pre / SPEC.alignEvery), total = pre + align;
      const dwNs = 40 / g.gbps;                      // a Dword is four 10-bit characters
      const us = total * dwNs / 1000;
      return { frames: rf.frames.length, framed, hs, align, total, payloadDw: rf.payloadDw, eff: rf.payloadDw / total, us, mbps: rf.bytes / us, dwNs };
    },
    rawMBps(gen) { return SPEC.gens[gen - 1].gbps * 1000 * 8 / 10 / 8; }
  };

  /* ── seeded RNG (mulberry32) ── */
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  /* ── 05 a small hard disk and its scheduler.
     Seek curve: Jacobson & Wilkes (HPL-CSP-91-7, 1991) — t = a + b·√d for short seeks, c + e·d for long ones (d =
     seek distance as a fraction of full stroke). Fitted to a Seagate Barracuda 7200.12 (a SATA 3 Gb/s drive,
     product manual rev. H): track-to-track 1.0 ms, average read seek 8.5 ms. Full stroke and the switch point are
     TUNED (the manual gives neither). Rotation 7200 rpm. Transfer at 125 MB/s at the outer edge, scaling with
     radius; inner/outer radius ratio TUNED. Requests are uniform over LBAs (more of them on outer tracks).
     Schedulers: FIFO; SSTF (shortest seek first, arm only); SATF (shortest access time first: seek + rotational
     wait, Jacobson & Wilkes; Seltzer, Chen & Ousterhout 1990). ── */
  const DISK = {
    rpm: 7200, tt: 1.0, avg: 8.5, full: 16, x0: 0.3, ri: 0.45, odMBps: 125, ioKB: 4,   // full, x0, ri TUNED
    coef(o) {
      const p = Object.assign({}, this, o || {});
      // unknowns b, c, e with: a + b√x0 = c + e·x0 ; c + e = full ; E[t] over d ~ 2(1−d) = avg
      // E[√d] on [0,x0] under 2(1−d): ∫ 2(1−d)√d = 2(2/3 x0^1.5 − 2/5 x0^2.5)
      const a = p.tt, x0 = p.x0;
      const P0 = 2 * x0 - x0 * x0;                              // P(d < x0)
      const Ms = 2 * (2 / 3 * Math.pow(x0, 1.5) - 2 / 5 * Math.pow(x0, 2.5));
      const P1 = 1 - P0;
      const Md = 2 * ((1 / 2 - 1 / 3) - (x0 * x0 / 2 - x0 * x0 * x0 / 3));   // ∫_{x0}^1 2(1−d) d
      // long branch: c + e d, with c = full − e
      // continuity: a + b√x0 = full − e + e x0  →  b = (full − e(1 − x0) − a)/√x0
      // average: a P0 + b Ms + (full − e) P1 + e Md = avg   → linear in e
      const sq = Math.sqrt(x0);
      const k0 = a * P0 + (p.full - a) / sq * Ms + p.full * P1;   // terms without e
      const k1 = -(1 - x0) / sq * Ms - P1 + Md;                    // coefficient of e
      const e = (p.avg - k0) / k1, b = (p.full - e * (1 - x0) - a) / sq, c = p.full - e;
      return { a, b, c, e, x0, rev: 60000 / p.rpm, ri: p.ri, od: p.odMBps, ioKB: p.ioKB };
    },
    seek(d, k) { if (d <= 0) return 0; return d < k.x0 ? k.a + k.b * Math.sqrt(d) : k.c + k.e * d; },
    // mean seek over uniform random track pairs, by quadrature (checks the fit)
    meanSeek(k) { const N = 4000; let s = 0; for (let i = 0; i < N; i++) { const d = (i + 0.5) / N; s += this.seek(d, k) * 2 * (1 - d) / N; } return s; },
    xferMs(x, k) { const r = k.ri + (1 - k.ri) * x; return k.ioKB * 1.024 / (k.od * r) ; },  // 4 KiB at the local rate
    // a request uniform over LBAs: radius r with density ∝ r, then x = track index fraction (0 = outer edge)
    req(R, k) { const r = Math.sqrt(k.ri * k.ri + R() * (1 - k.ri * k.ri)); return { x: (1 - r) / (1 - k.ri), th: R() }; },
    // positioning cost of serving q from head at (x, phase ph in revolutions) at time 0: [seek, rotational wait]
    cost(h, q, k) {
      const s = this.seek(Math.abs(q.x - h.x), k);
      const ph = (h.ph + s / k.rev) % 1; let w = q.th - ph; w -= Math.floor(w);
      return [s, w * k.rev];
    },
    pick(policy, h, queue, k) {
      if (policy === 'fifo') return 0;
      let best = 0, bv = Infinity;
      for (let i = 0; i < queue.length; i++) {
        const c = this.cost(h, queue[i], k), v = policy === 'sstf' ? c[0] : c[0] + c[1];
        if (v < bv) { bv = v; best = i; }
      }
      return best;
    },
    /* closed queue of depth Q: whenever a request completes, a new random one arrives. Returns IOPS, mean and
       95th-percentile response time, and the average seek and rotational wait per request. */
    simulate(Q, policy, n, seed, o) {
      const k = this.coef(o), R = rng(seed == null ? 7 : seed), queue = [];
      let t = 0; const h = { x: 0.5, ph: 0 };
      for (let i = 0; i < Q; i++) queue.push(Object.assign(this.req(R, k), { t0: 0 }));
      const warm = Math.min(200, Math.floor(n / 5)); let t1 = 0, sumS = 0, sumW = 0, cnt = 0; const resp = [];
      for (let i = 0; i < n + warm; i++) {
        const j = this.pick(policy, h, queue, k), q = queue[j]; queue.splice(j, 1);
        const [s, w] = this.cost(h, q, k), x = this.xferMs(q.x, k), dt = s + w + x;
        t += dt; h.x = q.x; h.ph = (q.th + x / k.rev) % 1;
        if (i === warm) t1 = t - dt;
        if (i >= warm) { sumS += s; sumW += w; cnt++; resp.push(t - q.t0); }
        queue.push(Object.assign(this.req(R, k), { t0: t }));
      }
      resp.sort((a, b) => a - b);
      const span = t - t1;
      return { iops: cnt / span * 1000, mean: resp.reduce((a, b) => a + b, 0) / resp.length, p95: resp[Math.floor(0.95 * (resp.length - 1))],
        seek: sumS / cnt, wait: sumW / cnt };
    },
    // a batch of Q requests drained without refilling (what command-based switching forces, ch7)
    drain(Q, policy, batches, seed, o) {
      const k = this.coef(o), R = rng(seed == null ? 11 : seed); let t = 0, done = 0; const h = { x: 0.5, ph: 0 };
      for (let b = 0; b < batches; b++) {
        const queue = []; for (let i = 0; i < Q; i++) queue.push(this.req(R, k));
        while (queue.length) { const j = this.pick(policy, h, queue, k), q = queue[j]; queue.splice(j, 1); const [s, w] = this.cost(h, q, k), x = this.xferMs(q.x, k); t += s + w + x; h.x = q.x; h.ph = (q.th + x / k.rev) % 1; done++; }
      }
      return { iops: done / t * 1000 };
    },
    curve(policy, n, seed, o) { const out = []; for (let Q = 1; Q <= 32; Q++) out.push([Q, this.simulate(Q, policy, n, seed, o).iops]); return out; },
    halfRevMs() { return 60000 / this.rpm / 2; }
  };

  /* ── 06 link power: the break-even analysis of dynamic power management (Benini, Bogliolo & De Micheli,
     IEEE TVLSI 8:299, 2000), with exponential idle gaps of mean m, a timeout τ before entering a low-power state,
     and the spec's worst-case exit latencies. Powers: Slumber is the Samsung 870 EVO's "Idle, DIPM on" figure
     (30 mW) used as a stand-in; DevSleep 2.5 mW from the same datasheet (250/500 GB). The link-awake idle power
     and Partial are TUNED: no datasheet found gives them. ── */
  const POWER = {
    P: { on: 0.150, partial: 0.060, slumber: 0.030, devslp: 0.0025 },   // W; on and partial TUNED
    ssdActiveW: 2.0,                // 870 EVO 250/500 GB: active average read 2.0 W
    hddIdleW: 6.9,                  // Exos 32 TB data sheet: idle A average 6.9 W
    exitOf(s) { return s === 'on' ? 0 : SPEC.exit[s]; },
    // break-even idle gap: entering at once pays off only if the gap is longer than this
    breakEven(s, P) { const p = P || this.P; return p.on * this.exitOf(s) / (p.on - p[s]); },
    /* per idle gap G ~ Exp(m): stay on for min(G, τ); then sleep for (G − τ)+; if it slept, waking costs the exit
       latency at full power and delays the next request. DevSleep also holds the device asleep for at least MDAT. */
    run(s, m, tau, P) {
      const p = P || this.P;
      if (s === 'on') return { W: p.on, lat: 0, pSleep: 0, save: 0 };
      const e = Math.exp(-tau / m), L = this.exitOf(s);
      const onT = m * (1 - e), slT = m * e;
      // DevSleep: the request waits for the rest of MDAT if it arrives early, E[(MDAT − X)+] with X ~ Exp(m)
      const hold = s === 'devslp' ? (SPEC.mdat - m * (1 - Math.exp(-SPEC.mdat / m))) : 0;
      const lat = e * (L + hold);
      const E = p.on * onT + p[s] * slT + e * (p[s] * hold + p.on * L);
      // average power at the same access rate: energy per idle gap over the mean gap. (Dividing by m + lat instead
      // would credit the slower access rate as a saving.)
      const W = E / m;
      return { W, lat, pSleep: e, save: 1 - W / p.on };
    },
    // the mean idle gap (s) past which DevSleep draws less than Slumber, with no timeout (bisection on a log scale)
    devOverSlumber(P) { let a = 1e-3, b = 10; for (let i = 0; i < 60; i++) { const m = Math.sqrt(a * b); if (this.run('devslp', m, 0, P).W < this.run('slumber', m, 0, P).W) b = m; else a = m; } return Math.sqrt(a * b); },
    best(m, tau, P, latCap) {
      let b = 'on', bw = Infinity;
      for (const s of ['on', 'partial', 'slumber', 'devslp']) { const r = this.run(s, m, tau, P); if (latCap != null && r.lat > latCap) continue; if (r.W < bw - 1e-12) { bw = r.W; b = s; } }
      return b;
    }
  };

  /* ── 07 port multiplier: command-based vs FIS-based switching (SATA 3.5a §16.7), using the ch5 disk for random
     reads and the Exos datasheet rate for sequential reads; the link ceiling comes from the ch4 wire account. ── */
  const PM = {
    exosMBps: 285,                 // Seagate Exos 32 TB data sheet DS2045.4-2511: max sustained OD
    random(N, Q, mode, n) {
      const one = DISK.simulate(Q, 'satf', n || 3000, 7).iops;
      if (mode === 'fbs') return { iops: N * one, one };
      return { iops: DISK.drain(Q, 'satf', Math.max(20, Math.round((n || 3000) / Q)), 11).iops, one };
    },
    seq(N, mode, gen) {
      const cap = LINK.wire(256, gen).mbps;
      const demand = mode === 'fbs' ? N * this.exosMBps : this.exosMBps;
      return { mbps: Math.min(cap, demand), cap, demand, capped: demand > cap };
    }
  };

  /* ── 08 how fast a hard disk reads at the outer edge: rate ∝ rpm × linear density, and linear density ∝ √(areal
     density) if bits and tracks shrink together (an assumption the page states). Anchor: Exos 32 TB, 285 MB/s at
     7200 rpm. ── */
  const HDD = {
    od(rpm, dens, hbd) { return PM.exosMBps * rpm / 7200 * Math.sqrt(dens) * (hbd || 1); },
    densToReach(mbps, rpm) { const r = mbps / (PM.exosMBps * rpm / 7200); return r * r; },
    ssdSeq: 560,                    // Samsung 870 EVO data sheet rev 1.1: sequential read up to 560 MB/s
    nvmeQuote: 552                  // NVMe essay #ch2's effective SATA III figure (cited, not re-derived)
  };

  /* ── frontier data block (as of November 2026; sources and dates opened in BRIEF.md) ── */
  const FRONTIER = {
    asOf: '2026-11',
    latestRev: '3.5a', latestRevDate: '2021-03-02', fastestGbps: 6,
    exos: { tb: 32, mbps: 285, iops: 170, qd: 16, sheet: 'DS2045.4-2511' },
    seagate44: { tb: 44, date: '2026-03-03', customers: 2 },
    wd40: { tb: 40, quarterEnd: '2026-07-03' },
    wdHbd: { demo: 2, target: 8, targetYear: 2030 },
    wdHamr44: '2027 H1', wdRoadmap: { 60: 2028, 100: 2029 }, wdDualPivotYear: 2028,
    ocpNvmeHdd: { rev: '1.0b', date: '2023-04-20' },
    seagateRoadmap: { perDiskNow: 4, perDiskGoal: 10, driveGoal: 100 }
  };


  /* ── numbers quoted in the prose. Each entry is [value, decimals, kind]; the page formats it for the current
     language and tests/models.cjs pins every one. ── */
  function prose() {
    const b6 = UDMA.budget(6, 80), b5 = UDMA.budget(5, 80), b2 = UDMA.budget(2, 40);
    const w1 = LINK.wire(1), w8 = LINK.wire(8), w256 = LINK.wire(256);
    const sim = (q, p, o) => DISK.simulate(q, p, 3000, 7, o);
    const q1 = sim(1, 'fifo'), s8 = sim(8, 'satf'), s16 = sim(16, 'satf'), s32 = sim(32, 'satf'), t16 = sim(16, 'sstf');
    const tuned = [{ full: 12 }, { full: 20 }, { x0: 0.15 }, { x0: 0.5 }, { ri: 0.35 }, { ri: 0.6 }];
    const sv = tuned.map(o => sim(16, 'satf', o).iops), gv = tuned.map((o, i) => sv[i] / sim(16, 'fifo', o).iops);
    const P = POWER.P, scaled = (k, x) => Object.assign({}, P, { [k]: P[k] * x });
    const d1 = POWER.run('devslp', 1, 0);
    const pm4 = PM.random(4, 8, 'fbs'), pmc = PM.random(1, 8, 'cbs');
    return {
      u6: [UDMA.mbps(6), 1], u6used: [b6.used, 2], u6mar: [b6.margin, 2], u5mar: [b5.margin, 2], u2used40: [b2.used, 2],
      k6: [(UDMA.cyc[6] - UDMA.ds[6] - UDMA.dh[6]) / (UDMA.neg[6] + UDMA.pos[6]), 2], k4: [(UDMA.cyc[4] - UDMA.ds[4] - UDMA.dh[4]) / (UDMA.neg[4] + UDMA.pos[4]), 2],
      nosk: [UDMA.noSkewCycle(6), 1], wire: [UDMA.perWireMbps(6), 1], lines: [UDMA.dataLines * UDMA.perWireMbps(6), 0], g1: [UDMA.sataGen1Payload(), 0],
      r1: [LINK.rawMBps(1), 0], r2: [LINK.rawMBps(2), 0], r3: [LINK.rawMBps(3), 0],
      dw4: [w8.total, 0], us4: [w8.us, 2], eff4: [w8.eff, 0, 'pct'], eff1: [w1.eff, 0, 'pct'], fr256: [w256.frames, 0], eff256: [w256.eff, 0, 'pct'], mb256: [w256.mbps, 0],
      rev: [60000 / DISK.rpm, 2], half: [DISK.halfRevMs(), 2], q1: [q1.iops, 0], s8: [s8.iops, 0], s16: [s16.iops, 0], s32: [s32.iops, 0], t16: [t16.iops, 0],
      p32: [s32.p95, 0], p1: [q1.p95, 0], lo: [Math.min(...sv), 0], hi: [Math.max(...sv), 0], glo: [Math.min(...gv), 2], ghi: [Math.max(...gv), 2],
      bePartial: [POWER.breakEven('partial') * 1e6, 1], beSlumber: [POWER.breakEven('slumber') * 1e3, 1], beDev: [POWER.breakEven('devslp') * 1e3, 1],
      dev1: [d1.W * 1000, 1], devSave1: [d1.save, 0, 'pct'], devLat1: [d1.lat * 1000, 0],
      beSlo: [Math.min(POWER.breakEven('slumber', scaled('on', 0.5)), POWER.breakEven('slumber', scaled('on', 2))) * 1e3, 1],
      beShi: [Math.max(POWER.breakEven('slumber', scaled('on', 0.5)), POWER.breakEven('slumber', scaled('on', 2))) * 1e3, 1],
      bePlo: [Math.min(POWER.breakEven('partial', scaled('partial', 0.5)), POWER.breakEven('partial', scaled('partial', 2))) * 1e6, 1],
      bePhi: [Math.max(POWER.breakEven('partial', scaled('partial', 0.5)), POWER.breakEven('partial', scaled('partial', 2))) * 1e6, 1],
      xDS: [POWER.devOverSlumber() * 1e3, 0], xDSlo: [POWER.devOverSlumber(scaled('on', 0.5)) * 1e3, 0], xDShi: [POWER.devOverSlumber(scaled('on', 2)) * 1e3, 0],
      two: [PM.seq(2, 'fbs', 3).mbps, 0], cap3: [PM.seq(3, 'fbs', 3).mbps, 0], cbs: [pmc.iops, 0], one: [pm4.one, 0], fbs4: [pm4.iops, 0],
      need: [HDD.densToReach(HDD.ssdSeq, 7200), 1], od10: [HDD.od(7200, 10 / 3), 0], od15: [HDD.od(15000, 1), 0], hbd2: [HDD.od(7200, 1, 2), 0]
    };
  }

  /* ── formatting: language-aware ── */
  function fmt(x, d, lang) {
    if (x == null || !isFinite(x)) return '—';
    const s = (d == null ? (Math.abs(x) >= 100 ? 0 : Math.abs(x) >= 10 ? 1 : 2) : d);
    return Number(x).toLocaleString(lang === 'en' ? 'en-US' : 'zh-CN', { minimumFractionDigits: s, maximumFractionDigits: s });
  }
  // a time in seconds, picked unit: returns { v, u } with u in 'ns','us','ms','s'
  function tunit(sec) {
    const a = Math.abs(sec);
    if (a < 1e-6) return { v: sec * 1e9, u: 'ns' }; if (a < 1e-3) return { v: sec * 1e6, u: 'us' }; if (a < 1) return { v: sec * 1e3, u: 'ms' }; return { v: sec, u: 's' };
  }

  /* ── live sentences: each returns { key, v } so the page can fill a whole-sentence template ── */
  const say = {
    udma(m, cable, scale) {
      const b = UDMA.budget(m, cable, scale);
      if (!b.allowed) return { key: 'ch2.say.forbid', v: { mode: m } };
      const f = UDMA.fastest(cable, scale);
      const v = { mode: m, used: b.used, cyc: b.cyc, margin: b.margin, pct: b.used / b.cyc, fastest: f };
      if (!b.ok) return { key: 'ch2.say.fail', v };
      if (b.margin / b.cyc < 0.05) return { key: 'ch2.say.tight', v };
      return { key: 'ch2.say.ok', v };
    },
    enc(raw, coded, nComma, nK) {
      const v = { rawRun: raw.maxRun, run: coded.maxRun, swing: coded.swing, rawSwing: raw.swing, commas: nComma, k: nK };
      if (raw.maxRun > 5) return { key: 'ch3.say.long', v };
      return { key: 'ch3.say.short', v };
    },
    ncq(Q, f, s, a) {
      const v = { q: Q, fifo: f.iops, sstf: s.iops, satf: a.iops, gain: a.iops / f.iops, p95: a.p95, p95f: f.p95 };
      if (Q === 1) return { key: 'ch5.say.q1', v };
      return { key: 'ch5.say.q', v };
    },
    power(s, m, tau) {
      const r = POWER.run(s, m, tau), b = POWER.best(m, tau);
      const v = { W: r.W, save: r.save, lat: r.lat, best: b, pSleep: r.pSleep };
      if (s === 'on') return { key: 'ch6.say.on', v };
      if (r.save < 0) return { key: 'ch6.say.loss', v };
      if (s === b) return { key: 'ch6.say.best', v };
      return { key: 'ch6.say.other', v };
    },
    pm(N, mode, work, gen, Q) {
      if (work === 'seq') {
        const r = PM.seq(N, mode, gen); const v = { n: N, mbps: r.mbps, cap: r.cap, demand: r.demand };
        if (mode === 'cbs') return { key: 'ch7.say.seqCbs', v };
        return { key: r.capped ? 'ch7.say.seqCap' : 'ch7.say.seqFbs', v };
      }
      const r = PM.random(N, Q, mode); const v = { n: N, iops: r.iops, one: r.one };
      return { key: mode === 'cbs' ? 'ch7.say.randCbs' : 'ch7.say.randFbs', v };
    },
    hdd(rpm, dens, hbd) {
      const r = HDD.od(rpm, dens, hbd), v = { od: r, ssd: HDD.ssdSeq, share: r / HDD.ssdSeq, need: HDD.densToReach(HDD.ssdSeq, rpm) };
      if (r >= HDD.ssdSeq) return { key: 'ch8.say.over', v };
      return { key: 'ch8.say.under', v };
    }
  };

  return { SPEC, UDMA, B8, LINK, DISK, POWER, PM, HDD, FRONTIER, rng, fmt, tunit, say, clamp, T6, T4, prose };
});
