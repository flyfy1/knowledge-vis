/* How SAS works: the page's models. Each one implements a named, published result or the text of a standard;
   constants that are tuned (not taken from a source) are marked TUNED here and flagged on the page.
   UMD: window.SasModels in the browser, module.exports in node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SasModels = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  /* ── Figures quoted from standards and data sheets (sources and dates opened in BRIEF.md). ── */
  const SPEC = {
    // generations: T10 drafts page (status lines), Xia et al. 2018 (8b/10b through SAS-3; 128b/130b + RS(30,26) in SAS-4)
    gens: [
      { id: 'sas1', name: 'SAS-1', std: 'INCITS 376-2003', gbaud: 3.0, num: 8, den: 10, nominal: 3 },
      { id: 'sas2', name: 'SAS-2', std: 'INCITS 457', draft: '2009-04-18', gbaud: 6.0, num: 8, den: 10, nominal: 6 },
      { id: 'sas3', name: 'SAS-3', std: 'INCITS 519', draft: '2013-11-07', gbaud: 12.0, num: 8, den: 10, nominal: 12 },
      { id: 'sas4', name: 'SAS-4', std: 'INCITS 534', draft: '2018-03-28', gbaud: 22.5, num: 128, den: 150, nominal: 24 }
    ],
    scsi1: 1986, scsi2: 1994,                 // X3.131-1986, superseded by SCSI-2 in 1994 (T10 withdrawn list)
    // SSP frames, T10/03-245r4 (SAS-1.1 proposal, 2004): 24-byte header, IU up to 1024 bytes, 4-byte CRC
    ssp: { hdr: 24, crc: 4, dataMax: 1024, cmdIU: 28, respIU: 24, xferRdy: 12, delim: 8 },  // delim: SOF+EOF, 2 dwords (assumed, BRIEF)
    // SSP COMMAND IU task attribute codes (03-245r4 Table 4) vs iSCSI ATTR (RFC 7143 §11.3.1)
    attrSsp: { simple: 0, hoq: 1, ordered: 2 },
    attrIscsi: { simple: 1, ordered: 2, hoq: 3 },
    iscsiBhs: 48, iscsiCdbAt: 32, sspCdbAt: 12,
    sasAddrBits: 64,                          // SAS ADDRESS field bytes 8..15 (Seagate 100293068L, SAS phy log descriptor)
    zoneGroups: [128, 256],                   // smp_utils smp_conf_zone_perm_tbl(8): two table sizes, introduced in SAS-2
    // CDB layouts, Seagate SCSI Commands Reference Manual 100293068 Rev L (SBC-4), Tables 107, 109, 112
    cdb: {
      r6: { op: 0x08, len: 6, lbaBits: 21, lenBits: 8 },
      r10: { op: 0x28, len: 10, lbaBits: 32, lenBits: 16 },
      r16: { op: 0x88, len: 16, lbaBits: 64, lenBits: 32 }
    },
    // T10 PI: 8 bytes per logical block: guard CRC-16 (poly 0x8BB7, init 0, not reflected; check 0xD0DB, reveng),
    // 2-byte application tag, 4-byte reference tag = low 32 bits of the LBA in Type 1 (Seagate Table 108 note f)
    pi: { bytes: 8, poly: 0x8BB7, check: 0xD0DB, sectors512: [512, 520, 528], sectors4k: [4096, 4160, 4224] },
    // FEC, Xia et al., "A Study of Forward Error Correction Codes for SAS Channels", SIJ Dec 2018
    fec: { n: 30, k: 26, symBits: 5, t: 2, target: 1e-15, rawStudy: 1e-6, postStudy: 1e-10, rawNeeded: 1e-8 }
  };

  /* ── data sheets used by the models ── */
  const DRIVES = {
    // Seagate Exos DS2046.1-2512, SAS 12 Gb/s table (ST24000NM007H etc.)
    hdd: { seqMBps: 285, iops4k: 168, afr: 0.0035, mtbfH: 2.5e6, ports: 2, gen: 'sas3' },
    // KIOXIA PM7-R product page: 22.5 Gbit/s, dual-port 128 KiB sequential read 4,200 MB/s, 4 KiB random read 720K IOPS
    ssd: { seqMBps: 4200, iops4k: 720000, ports: 2, gen: 'sas4' }
  };

  /* ── link rates: the encoding is the only thing between baud and bytes ── */
  const LINK = {
    gen(id) { return SPEC.gens.find(g => g.id === id); },
    eff(id) { const g = this.gen(id); return g.num / g.den; },
    // payload MB/s (1e6 B) per lane after line coding
    MBps(id) { const g = this.gen(id); return g.gbaud * 1e3 * g.num / g.den / 8; },
    bytesPerUs(id) { return this.MBps(id); }   // 1 MB/s = 1 byte/µs
  };

  /* ── 02 the CDB: READ(6)/(10)/(16) built byte by byte; the same CDB inside an SSP COMMAND IU and an iSCSI PDU ── */
  const CDB = {
    reach(op, bs) { const c = SPEC.cdb[op]; return Math.pow(2, c.lbaBits) * bs; },   // bytes addressable
    maxBlocks(op) { const c = SPEC.cdb[op]; return op === 'r6' ? 256 : Math.pow(2, c.lenBits) - 1; },
    // lba and n as BigInt-safe numbers (lba < 2^53 is enough for any drive on this page)
    build(op, lba, n) {
      const c = SPEC.cdb[op], b = new Array(c.len).fill(0);
      const fits = lba < Math.pow(2, c.lbaBits) && n >= 1 && n <= this.maxBlocks(op);
      b[0] = c.op;
      const put = (from, width, v) => { let x = BigInt(Math.floor(v)); for (let i = from + width - 1; i >= from; i--) { b[i] = Number(x & 0xFFn); x >>= 8n; } };
      if (op === 'r6') { const L = BigInt(Math.floor(lba)) & 0x1FFFFFn; b[1] = Number((L >> 16n) & 0x1Fn); b[2] = Number((L >> 8n) & 0xFFn); b[3] = Number(L & 0xFFn); b[4] = n === 256 ? 0 : n; }
      else if (op === 'r10') { put(2, 4, lba % 4294967296); put(7, 2, n); }
      else { put(2, 8, lba); put(10, 4, n); }
      return { bytes: b, fits, lbaField: op === 'r6' ? [1, 3] : op === 'r10' ? [2, 5] : [2, 9], lenField: op === 'r6' ? [4, 4] : op === 'r10' ? [7, 8] : [10, 13] };
    },
    // the SSP COMMAND IU (28 bytes): LUN 0..7, task attribute in byte 9 bits 2..0, CDB in 12..27
    sspIU(cdb, attr, lun) {
      const iu = new Array(SPEC.ssp.cmdIU).fill(0); iu[7] = lun || 0; iu[9] = SPEC.attrSsp[attr];
      cdb.forEach((v, i) => { iu[SPEC.sspCdbAt + i] = v; }); return iu;
    },
    // the iSCSI SCSI Command BHS (48 bytes, RFC 7143 §11.3): opcode 01h, F|R|ATTR, LUN 8..15, expected length 20..23, CDB 32..47
    iscsi(cdb, attr, bytesExpected, lun) {
      const h = new Array(SPEC.iscsiBhs).fill(0); h[0] = 0x01; h[1] = 0x80 | 0x40 | SPEC.attrIscsi[attr]; h[9] = lun || 0;
      let x = Math.floor(bytesExpected); for (let i = 23; i >= 20; i--) { h[i] = x & 0xFF; x = Math.floor(x / 256); }
      cdb.forEach((v, i) => { h[SPEC.iscsiCdbAt + i] = v; }); return h;
    },
    // which command a driver needs for a byte offset on a drive with block size bs
    smallest(offset, bs) { for (const op of ['r6', 'r10', 'r16']) if (offset < this.reach(op, bs)) return op; return null; }
  };

  /* ── 03 one read over SSP: the wire account plus connection set-up. Frame sizes from 03-245r4; the time to open and
     close a connection is TUNED (ocUs) and the pattern "two connections per read" (command out, then the target
     reconnects with data and status) is the common case, stated as an assumption. ── */
  const SSP = {
    ocUs: 0.5,                         // TUNED: open + close one connection, µs
    frames(bytes) {
      const s = SPEC.ssp, nData = Math.max(1, Math.ceil(bytes / s.dataMax));
      const cmd = s.hdr + s.cmdIU + s.crc + s.delim;
      const data = nData * (s.hdr + s.crc + s.delim) + bytes;
      const resp = s.hdr + s.respIU + s.crc + s.delim;
      return { nData, cmd, data, resp, total: cmd + data + resp };
    },
    // time on one lane for one read of `bytes`, generation id, open/close µs, persistent connection
    read(bytes, gen, oc, persistent) {
      const f = this.frames(bytes), r = LINK.bytesPerUs(gen), o = oc == null ? this.ocUs : oc;
      const conns = persistent ? 0 : 2;
      const wireUs = f.total / r, ovUs = conns * o, us = wireUs + ovUs;
      const payloadUs = bytes / r;
      return { f, wireUs, ovUs, us, conns, eff: payloadUs / us, MBps: bytes / us, iops: 1e6 / us, lane: r };
    }
  };

  /* ── 04 dual port and multipath: steady-state availability A = MTBF / (MTBF + MTTR) per part; series parts multiply,
     redundant paths multiply their unavailabilities (NIST e-Handbook 8.1.8.2 / 8.1.8.3), assuming independent failures.
     Path parts' MTBF/MTTR are TUNED (order of magnitude); the drive's AFR is the Exos data sheet's. ── */
  const AVAIL = {
    HOURS: 8760,
    P: { ctrlMtbf: 100000, ioMtbf: 300000, cableMtbf: 1e6, mttr: 8, driveMttr: 24, failoverS: 30, interposerMtbf: 1e6 },  // TUNED
    u(mtbf, mttr) { return mttr / (mtbf + mttr); },
    // drive: 'sas' (two ports), 'sata' (one port), 'sataI' (one port behind a two-port interposer)
    run(drive, paths, P) {
      const p = Object.assign({}, this.P, P || {});
      const uPath = 1 - (1 - this.u(p.ctrlMtbf, p.mttr)) * (1 - this.u(p.ioMtbf, p.mttr)) * (1 - this.u(p.cableMtbf, p.mttr));
      const lamPath = (1 / p.ctrlMtbf + 1 / p.ioMtbf + 1 / p.cableMtbf) * this.HOURS;   // path failures per year
      const usable = drive === 'sata' ? 1 : paths;          // a one-port SATA drive can only hang on one path
      const uPaths = Math.pow(uPath, usable);
      const uDrive = this.u(DRIVES.hdd.mtbfH, p.driveMttr);
      const uInter = drive === 'sataI' ? this.u(p.interposerMtbf, p.mttr) : 0;
      const failoverMin = usable > 1 ? usable * lamPath * p.failoverS / 60 : 0;   // each path failure pauses I/O once
      const min = u => u * this.HOURS * 60;
      const parts = { paths: min(uPaths), drive: min(uDrive), inter: min(uInter), failover: failoverMin };
      const total = parts.paths + parts.drive + parts.inter + parts.failover;
      const top = Object.entries(parts).sort((a, b) => b[1] - a[1])[0][0];
      return { parts, total, usable, uPath, lamPath, top, A: 1 - total / (this.HOURS * 60), nines: -Math.log10(total / (this.HOURS * 60)) };
    }
  };

  /* ── 05 fan-out behind an expander: N drives share a k-lane uplink. Each I/O holds one lane for its connection time
     (ch3 model); offered load in erlangs a = rate × hold; waiting for a lane by Erlang C (M/M/c). ── */
  const FAN = {
    erlangC(a, c) {
      if (a >= c) return 1;
      let term = 1, sum = 1; for (let k = 1; k < c; k++) { term *= a / k; sum += term; }
      const top = term * a / c * (c / (c - a));
      return top / (sum + top);
    },
    io(kind, work) {
      const d = DRIVES[kind], bytes = work === 'seq' ? 131072 : 4096;
      const want = work === 'seq' ? d.seqMBps * 1e6 / bytes : d.iops4k;     // I/O per second the drive could do
      return { bytes, want };
    },
    run(N, kind, work, width, gen, persistent) {
      const { bytes, want } = this.io(kind, work);
      const hold = SSP.read(bytes, gen, null, persistent).us * 1e-6;        // s per I/O on a lane
      const perDrive = Math.min(want, 1 / hold);                             // a drive's narrow port holds one lane at a time
      const offered = N * perDrive, a = offered * hold;
      const cap = width / hold;
      const done = Math.min(offered, cap);
      const pw = this.erlangC(a, width), waitUs = a < width ? pw * hold / (width - a) * 1e6 : Infinity;
      const toMB = x => x * bytes / 1e6;
      return { bytes, hold, perDrive, perDriveMB: toMB(perDrive), driveCapped: perDrive < want, demandMB: toMB(offered), capMB: toMB(cap), doneMB: toMB(done),
        a, rho: a / width, pw, waitUs, over: offered / cap, saturated: offered > cap, satN: cap / perDrive };
    }
  };

  /* ── 06 wide port: a time-stepped simulation of K drives sharing the c lanes of one wide port. A connection holds
     one lane end to end (T10/02-335r2: connections on a wide port ≤ its phys); each drive's narrow port holds at most
     one connection. Drives fill a buffer at their media rate and ask for a lane when a whole transfer is ready. ── */
  const WIDE = {
    make(K, kind, bytes, lanes, gen, persistent, seed) {
      const R = rng(seed == null ? 5 : seed), d = DRIVES[kind];
      const media = (kind === 'ssd' ? d.seqMBps : d.seqMBps);                // bytes/µs the media can supply
      const hold = SSP.read(bytes, gen, null, persistent).us;
      const drives = [];
      for (let i = 0; i < K; i++) drives.push({ buf: R() * bytes, busy: false, waitFrom: null });
      return { t: 0, K, bytes, media, hold, lanes: new Array(lanes).fill(null).map(() => ({ who: -1, until: 0, log: [] })), drives, queue: [], moved: 0, waits: 0, nWait: 0, busyUs: 0, t0: 0 };
    },
    step(s, dtUs) {
      const end = s.t + dtUs, cap = 4 * s.bytes;
      while (s.t < end - 1e-9) {
        // next event: a lane frees, or a drive reaches a full transfer
        let next = end;
        for (const L of s.lanes) if (L.who >= 0 && L.until < next) next = L.until;
        s.drives.forEach(d => { if (!d.busy && d.waitFrom == null && d.buf < s.bytes) { const tt = s.t + (s.bytes - d.buf) / s.media; if (tt < next) next = tt; } });
        const h = Math.max(0, next - s.t);
        s.drives.forEach(d => { d.buf = Math.min(cap, d.buf + h * s.media); });
        s.busyUs += h * s.lanes.filter(L => L.who >= 0).length;
        s.t = next;
        for (const L of s.lanes) if (L.who >= 0 && L.until <= s.t + 1e-9) { const d = s.drives[L.who]; d.busy = false; d.buf -= s.bytes; s.moved += s.bytes; L.log.push([L.from, L.until, L.who]); if (L.log.length > 400) L.log.shift(); L.who = -1; }
        s.drives.forEach((d, i) => { if (!d.busy && d.waitFrom == null && d.buf >= s.bytes - 1e-6) { d.waitFrom = s.t; s.queue.push(i); } });
        for (const L of s.lanes) {
          if (L.who >= 0 || !s.queue.length) continue;
          const i = s.queue.shift(), d = s.drives[i];
          s.waits += s.t - d.waitFrom; s.nWait++; d.waitFrom = null; d.busy = true;
          L.who = i; L.from = s.t; L.until = s.t + s.hold;
        }
      }
      return s;
    },
    // run to steady state and measure over a window
    measure(K, kind, bytes, lanes, gen, persistent) {
      const s = this.make(K, kind, bytes, lanes, gen, persistent);
      this.step(s, 5000);
      const m0 = s.moved, b0 = s.busyUs, w0 = s.waits, n0 = s.nWait, t0 = s.t;
      this.step(s, 20000);
      const T = s.t - t0;
      // throughput from lane busy time (bytes / hold per busy µs): counts in-flight connections pro rata, so a short
      // window cannot over-count completions and a saturated port reads exactly its lane limit
      const MBps = (s.busyUs - b0) * s.bytes / s.hold / T;
      return { MBps, perDrive: MBps / K, util: (s.busyUs - b0) / (T * lanes), waitUs: s.nWait > n0 ? (s.waits - w0) / (s.nWait - n0) : 0, hold: s.hold, laneMB: s.bytes / s.hold };
    }
  };

  /* ── 08 T10 PI: the real CRC-16 T10-DIF guard, the reference tag, and a write-then-read pipeline with faults ── */
  const CRC16T = (() => { const t = new Uint16Array(256); for (let i = 0; i < 256; i++) { let c = i << 8; for (let k = 0; k < 8; k++) c = (c & 0x8000) ? ((c << 1) ^ 0x8BB7) & 0xFFFF : (c << 1) & 0xFFFF; t[i] = c; } return t; })();
  const CRC32T = (() => { const t = new Uint32Array(256); for (let i = 0; i < 256; i++) { let c = i << 24; for (let k = 0; k < 8; k++) c = (c & 0x80000000) ? ((c << 1) ^ 0x04C11DB7) >>> 0 : (c << 1) >>> 0; t[i] = c >>> 0; } return t; })();
  const PI = {
    crc16(bytes) { let c = 0; for (let i = 0; i < bytes.length; i++) c = ((c << 8) ^ CRC16T[((c >> 8) ^ bytes[i]) & 0xFF]) & 0xFFFF; return c; },
    // the link check, MSB-first CRC-32 with the same generator as SAS/Ethernet (illustrative: SAS's exact init/xor
    // conventions are not reproduced; any CRC-32 catches a 1–3 bit flip in one frame)
    crc32(bytes) { let c = 0xFFFFFFFF; for (let i = 0; i < bytes.length; i++) c = ((c << 8) ^ CRC32T[((c >>> 24) ^ bytes[i]) & 0xFF]) >>> 0; return c >>> 0; },
    block(lba, seed) {   // 512 bytes of deterministic content for a block
      const R = rng((seed == null ? 1 : seed) + lba * 7919), b = new Uint8Array(512);
      const text = 'LBA ' + lba + ' '; for (let i = 0; i < 512; i++) b[i] = i < 64 ? text.charCodeAt(i % text.length) : Math.floor(R() * 256);
      return b;
    },
    tuple(data, lba) { return { guard: this.crc16(data), app: 0, ref: lba % 4294967296 }; },
    flip(data, bits) { const d = new Uint8Array(data); for (const k of bits) d[k >> 3] ^= 0x80 >> (k & 7); return d; },
    // syndromes of single-bit errors over n bits; two flips are missed iff two syndromes coincide
    syndromes(nbits) { const pow = new Uint16Array(nbits); let v = 0x8BB7; for (let k = 0; k < nbits; k++) { pow[k] = v; const hi = v & 0x8000; v = (v << 1) & 0xFFFF; if (hi) v ^= 0x8BB7; } const s = new Uint16Array(nbits); for (let i = 0; i < nbits; i++) s[i] = pow[nbits - 1 - i]; return s; },
    allTwoCaught(nbits) { const s = this.syndromes(nbits), seen = new Set(); for (const x of s) { if (x === 0 || seen.has(x)) return false; seen.add(x); } return true; },
    // the first three-bit error (lexicographic in the first two positions) that leaves the guard unchanged
    firstMissedTriple(nbits) { const s = this.syndromes(nbits), at = new Map(); s.forEach((x, i) => at.set(x, i)); for (let i = 0; i < nbits; i++) for (let j = i + 1; j < nbits; j++) { const k = at.get(s[i] ^ s[j]); if (k != null && k > j) return [i, j, k]; } return null; },
    // replace whole blocks with random bytes; count how many still match their guard
    garbage(trials, seed) { const R = rng(seed == null ? 3 : seed), ref = this.block(0), g = this.crc16(ref); let miss = 0; const b = new Uint8Array(512); for (let t = 0; t < trials; t++) { for (let i = 0; i < 512; i++) b[i] = (R() * 256) | 0; if (this.crc16(b) === g) miss++; } return { trials, miss, expect: trials / 65536 }; },
    /* One block written then read back. fault: 'none' | 'link' (bits flip on the cable, after the frame CRC is computed)
       | 'mem' (bits flip in controller memory before the frame is built) | 'misdir' (the drive writes the block one LBA
       off) | 'lost' (the drive acknowledges but never writes; the old block stays) | 'media' (the medium decays past
       what drive ECC fixes). pi: whether the host generated protection information. ck values: 'pass' | 'caught' | 'off'. */
    run(fault, bits, lba, pi) {
      const data = this.block(lba), T = this.tuple(data, lba), off = pi ? 'pass' : 'off';
      const ck = { link: 'pass', ecc: 'pass', guard: off, ref: off };
      let outcome = 'ok', victim = null, guardSeen = T.guard;
      if (fault === 'link') {
        const bad = this.flip(data, bits);
        if (this.crc32(bad) !== this.crc32(data)) { ck.link = 'caught'; outcome = 'retry'; }
        else { guardSeen = this.crc16(bad); if (pi && guardSeen !== T.guard) { ck.guard = 'caught'; outcome = 'rejected'; } else outcome = 'silent'; }
      } else if (fault === 'mem') {
        const bad = this.flip(data, bits); guardSeen = this.crc16(bad);
        if (pi && guardSeen !== T.guard) { ck.guard = 'caught'; outcome = 'rejected'; } else outcome = 'silent';
      } else if (fault === 'misdir') {
        outcome = 'stale';                                     // our LBA still holds the previous block and its valid PI
        victim = pi && (T.ref !== (lba + 1) % 4294967296) ? 'caught' : 'silent';   // LBA+1 now holds a block tagged lba
        if (victim === 'caught') ck.ref = 'caught';
      } else if (fault === 'lost') {
        outcome = 'stale';
      } else if (fault === 'media') {
        ck.ecc = 'caught'; outcome = 'reported';
      }
      const caughtBy = Object.keys(ck).filter(k => ck[k] === 'caught');
      return { ck, outcome, victim, caughtBy, silent: outcome === 'silent' || outcome === 'stale', want: T, guardSeen };
    }
  };

  /* ── 09 the 24G line code: 128 payload + 2 header bits = 130 bits = 26 five-bit symbols; RS(30,26) adds 4 symbols
     (20 bits) to make 150. t = 2 symbols per codeword. Errors arrive as bursts of b consecutive bits (decision-feedback
     equalisers spread one wrong decision over several bits); bursts start independently, at a rate that keeps the
     raw BER fixed. With k-way interleaving consecutive symbols belong to k different codewords. ── */
  const FEC = {
    N: 30, K: 26, S: 5, T: 2,
    // symbols a burst of b bits starting at bit offset o (0..4) touches, and the most that land in one codeword
    perCodeword(b, o, k) { const s = Math.floor((o + b - 1) / 5) + 1; return Math.ceil(s / k); },
    singleOk(b, k) { let ok = 0; for (let o = 0; o < 5; o++) if (this.perCodeword(b, o, k) <= this.T) ok++; return ok / 5; },
    // fraction of placements of n bursts inside a block of k codewords that leave some codeword with > T bad symbols
    failFrac(n, b, k, R) {
      const span = 30 * k, sym = new Uint8Array(span), cw = new Uint8Array(k);
      const trial = starts => {
        sym.fill(0); cw.fill(0);
        for (const st of starts) { const s0 = Math.floor(st / 5), s1 = Math.floor((st + b - 1) / 5); for (let s = s0; s <= s1; s++) { const j = s % span; if (!sym[j]) { sym[j] = 1; cw[j % k]++; } } }
        for (let j = 0; j < k; j++) if (cw[j] > this.T) return 1; return 0;
      };
      const bits = span * 5;
      if (n === 1) { let f = 0; for (let a = 0; a < bits; a++) f += trial([a]); return f / bits; }
      if (n === 2) { let f = 0, c = 0; for (let a = 0; a < bits; a++) for (let b2 = a; b2 < bits; b2 += 1) { f += trial([a, b2]); c++; } return f / c; }
      let f = 0; const M = 3000; for (let i = 0; i < M; i++) { const st = []; for (let q = 0; q < n; q++) st.push(Math.floor(R() * bits)); f += trial(st); } return f / M;
    },
    _cache: {},
    fracs(b, k) { const key = b + ',' + k; if (!this._cache[key]) { const R = rng(17); this._cache[key] = [0, this.failFrac(1, b, k, R), this.failFrac(2, b, k, R), this.failFrac(3, b, k, R), this.failFrac(4, b, k, R)]; } return this._cache[key]; },
    // probability that a block of k codewords (150k bits) cannot be corrected; ≥5 bursts in one block count as failures
    blockFail(ber, b, k) {
      const mu = ber / b * 150 * k, f = this.fracs(b, k);
      let p = 0, pn = Math.exp(-mu);
      for (let n = 1; n <= 60; n++) { pn *= mu / n; p += pn * (n <= 4 ? f[n] : 1); if (n > 4 && pn < p * 1e-12) break; }
      return p;
    },
    // per 150-bit codeword, and the time between uncorrectable codewords on one 22.5 Gbaud lane
    run(ber, b, k) {
      const pBlock = this.blockFail(ber, b, k), pCw = pBlock / k;
      const perSec = 22.5e9 / 150;
      const noFec = 1 - Math.pow(1 - ber, 150);
      return { pCw, everyS: 1 / (pCw * perSec), noFec, noFecEveryS: 1 / (noFec * perSec), singleOk: this.singleOk(b, k) };
    },
    // independent bit errors, no interleaving: the textbook binomial bound for a t = 2 code over 5-bit symbols
    binomial(ber) { const ps = -Math.expm1(5 * Math.log1p(-ber)); let bad = 0; for (let j = 3; j <= 30; j++) bad += comb(30, j) * Math.pow(ps, j) * Math.pow(1 - ps, 30 - j); return bad; }
  };
  function comb(n, k) { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return r; }

  /* ── frontier data block (as of November 2026; sources and dates opened in BRIEF.md) ── */
  const FRONTIER = {
    asOf: '2026-11',
    sas4: { std: 'INCITS 534', draft: '2018-03-28' }, sas41: { std: 'INCITS 567-2023', draft: '2022-03-24' },
    spl5: { std: 'INCITS 554-2023', draft: '2022-05-06' },
    sas5: { draft: '2026-05-11', rev: '04', status: 'INCITS Approval', bsr: 'INCITS 561' },
    snt: { draft: '2026-04-22', rev: '05', status: 'Development', bsr: 'INCITS 584' },
    plus: { announced: '2024-07-23', gbaud: 22.5 },
    plugfest: { from: '2026-09-27', to: '2026-09-30', release: '2026-10-27' },
    brett: { date: '2023-11-23', no48G: true, hddMajorityThrough: 2027 },
    pm7: { gbaud: 22.5, seqDual: [4150, 4200], iopsDual: 720000 }
  };

  /* ── numbers quoted in the prose. Each entry is [value, decimals, kind]; the page formats it for the current
     language and tests/models.cjs pins every one. ── */
  function prose() {
    const TiB = Math.pow(2, 40), GiB = Math.pow(2, 30);
    const r4k = SSP.read(4096, 'sas4'), r4kP = SSP.read(4096, 'sas4', null, true), r1m = SSP.read(1048576, 'sas4');
    const r4k12 = SSP.read(4096, 'sas3');
    const r4kLo = SSP.read(4096, 'sas4', SSP.ocUs / 2), r4kHi = SSP.read(4096, 'sas4', SSP.ocUs * 2);
    const single = AVAIL.run('sas', 1), dual = AVAIL.run('sas', 2), sata2 = AVAIL.run('sata', 2), sataI = AVAIL.run('sataI', 2);
    const half = AVAIL.run('sas', 1, { ctrlMtbf: AVAIL.P.ctrlMtbf / 2 }), dbl = AVAIL.run('sas', 1, { ctrlMtbf: AVAIL.P.ctrlMtbf * 2 });
    const dualHalf = AVAIL.run('sas', 2, { ctrlMtbf: AVAIL.P.ctrlMtbf / 2 });
    const hddSeq = FAN.run(24, 'hdd', 'seq', 4, 'sas3'), hddRand = FAN.run(96, 'hdd', 'rand', 4, 'sas3'), ssdSeq = FAN.run(8, 'ssd', 'seq', 4, 'sas3');
    const ssdSeq24 = FAN.run(4, 'ssd', 'seq', 4, 'sas4');
    const w1 = WIDE.measure(1, 'ssd', 131072, 4, 'sas4'), w4 = WIDE.measure(4, 'ssd', 131072, 4, 'sas4'), w6 = WIDE.measure(6, 'ssd', 131072, 4, 'sas4');
    const wh = WIDE.measure(12, 'hdd', 131072, 4, 'sas3'), wh24 = WIDE.measure(24, 'hdd', 131072, 4, 'sas3');
    const tri = PI.firstMissedTriple(4096), gb = PI.garbage(65536);
    const f1 = FEC.run(1e-6, 1, 1), f7 = FEC.run(1e-6, 7, 1), f7i = FEC.run(1e-6, 7, 3);
    return {
      g1: [LINK.MBps('sas1'), 0], g2: [LINK.MBps('sas2'), 0], g3: [LINK.MBps('sas3'), 0], g4: [LINK.MBps('sas4'), 0],
      e10: [0.8, 0, 'pct'], e150: [128 / 150, 1, 'pct'], g4gb: [22.5 * 128 / 150, 1],
      r6: [CDB.reach('r6', 512) / GiB, 0], r10: [CDB.reach('r10', 512) / TiB, 0], r10k: [CDB.reach('r10', 4096) / TiB, 0], r10tb: [CDB.reach('r10', 512) / 1e12, 2],
      cmdB: [SSP.frames(4096).cmd, 0], dataB: [SSP.frames(4096).data, 0], respB: [SSP.frames(4096).resp, 0], totB: [SSP.frames(4096).total, 0],
      r4us: [r4k.us, 2], r4eff: [r4k.eff, 0, 'pct'], r4iops: [Math.round(r4k.iops / 1000) * 1000, 0], r4pEff: [r4kP.eff, 0, 'pct'], r4pIops: [Math.round(r4kP.iops / 1000) * 1000, 0], r1eff: [r1m.eff, 1, 'pct'],
      r4effLo: [r4kHi.eff, 0, 'pct'], r4effHi: [r4kLo.eff, 0, 'pct'], r12iops: [Math.round(r4k12.iops / 1000) * 1000, 0],
      sMin: [single.total, 0], dMin: [dual.total, 1], dPaths: [dual.parts.paths * 60, 2], dFail: [dual.parts.failover * 60, 0], dDrive: [dual.parts.drive, 1],
      sNines: [single.nines, 1], dNines: [dual.nines, 1], sataMin: [sata2.total, 0], sataIMin: [sataI.total, 1], iMin: [sataI.parts.inter, 1],
      halfMin: [half.total, 0], dblMin: [dbl.total, 0], dualHalfMin: [dualHalf.total, 1],
      hSeqDemand: [hddSeq.demandMB, 0], hSeqCap: [hddSeq.capMB, 0], hSeqSat: [Math.floor(hddSeq.satN), 0], hRandRho: [hddRand.rho, 1, 'pct'],
      sSeqPer: [ssdSeq.perDriveMB, 0], sSeqOver: [ssdSeq.over, 1], s24Per: [ssdSeq24.perDriveMB, 0],
      w1: [w1.MBps, 0], w4: [w4.MBps, 0], w6: [w6.MBps, 0], wLane: [w1.laneMB, 0], wh: [wh.MBps, 0], whUtil: [wh.util, 0, 'pct'], whWait: [wh.waitUs, 1], wh24: [wh24.MBps, 0], wh24Wait: [wh24.waitUs, 0],
      pm7: [DRIVES.ssd.seqMBps, 0], pm7Lanes: [DRIVES.ssd.seqMBps / w1.laneMB, 2],
      triA: [tri[0], 0], triB: [tri[1], 0], triC: [tri[2], 0], gbN: [gb.trials, 0], gbMiss: [gb.miss, 0],
      f1: [f1.pCw, 0, 'sci'], f1s: [f1.everyS / 3600, 1], f7: [f7.pCw, 0, 'sci'], f7s: [f7.everyS * 1000, 1], f7i: [f7i.pCw, 0, 'sci'], f7is: [f7i.everyS / 86400, 0],
      nofec: [f1.noFecEveryS * 1e6, 1], ok7: [FEC.singleOk(7, 1), 0, 'pct'], ok10: [FEC.singleOk(10, 1), 0, 'pct'], bin6: [FEC.binomial(1e-6), 0, 'sci']
    };
  }

  /* ── formatting: language-aware ── */
  function fmt(x, d, lang) {
    if (x == null || !isFinite(x)) return '—';
    const s = (d == null ? (Math.abs(x) >= 100 ? 0 : Math.abs(x) >= 10 ? 1 : 2) : d);
    return Number(x).toLocaleString(lang === 'en' ? 'en-US' : 'zh-CN', { minimumFractionDigits: s, maximumFractionDigits: s });
  }
  // mantissa and exponent for a×10^e with one decimal
  function sci(x) { if (!x || !isFinite(x)) return { m: 0, e: 0 }; let e = Math.floor(Math.log10(Math.abs(x))), m = x / Math.pow(10, e); if (Math.abs(+m.toFixed(1)) >= 10) { m /= 10; e += 1; } return { m, e }; }
  const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
  function sciText(x, lang) { const { m, e } = sci(x); return fmt(m, 1, lang) + ' × 10' + String(e).split('').map(c => SUP[c]).join(''); }
  // a duration in seconds: returns { v, u } with u in 'ns','us','ms','s','min','h','d','y'
  function tunit(sec) {
    const a = Math.abs(sec);
    if (a < 1e-6) return { v: sec * 1e9, u: 'ns' }; if (a < 1e-3) return { v: sec * 1e6, u: 'us' }; if (a < 1) return { v: sec * 1e3, u: 'ms' };
    if (a < 120) return { v: sec, u: 's' }; if (a < 7200) return { v: sec / 60, u: 'min' }; if (a < 172800) return { v: sec / 3600, u: 'h' };
    if (a < 3.156e7 * 2) return { v: sec / 86400, u: 'd' }; return { v: sec / 3.156e7, u: 'y' };
  }

  /* ── live sentences: each returns { key, v } so the page can fill a whole-sentence template ── */
  const say = {
    cdb(op, offset, bs) {
      const need = CDB.smallest(offset, bs), reach = CDB.reach(op, bs);
      const v = { need, reach, offset, bs };
      if (offset >= reach) return { key: 'ch2.say.miss', v };
      if (need !== op) return { key: 'ch2.say.more', v };
      return { key: 'ch2.say.ok', v };
    },
    ssp(bytes, gen, persistent) {
      const r = SSP.read(bytes, gen, null, persistent), v = { eff: r.eff, us: r.us, ov: r.ovUs, iops: r.iops, MBps: r.MBps };
      if (persistent) return { key: 'ch3.say.persist', v };
      if (r.ovUs > r.wireUs) return { key: 'ch3.say.overhead', v };
      if (r.eff > 0.9) return { key: 'ch3.say.big', v };
      return { key: 'ch3.say.mid', v };
    },
    avail(drive, paths, P) {
      const r = AVAIL.run(drive, paths, P), v = { total: r.total, nines: r.nines, top: r.top, usable: r.usable };
      if (drive === 'sata' && paths === 2) return { key: 'ch4.say.sata', v };
      if (r.usable === 1) return { key: 'ch4.say.single', v };
      if (drive === 'sataI') return { key: 'ch4.say.inter', v };
      if (r.top === 'failover') return { key: 'ch4.say.failover', v };
      return { key: 'ch4.say.dual', v };
    },
    fan(N, kind, work, width, gen) {
      const r = FAN.run(N, kind, work, width, gen), v = { done: r.doneMB, demand: r.demandMB, cap: r.capMB, rho: r.rho, wait: r.waitUs, satN: r.satN, per: r.perDriveMB, over: r.over };
      if (r.saturated) return { key: 'ch5.say.sat', v };
      if (r.rho < 0.1) return { key: 'ch5.say.idle', v };
      return { key: 'ch5.say.busy', v };
    },
    wide(m, K, lanes) {
      const v = { MBps: m.MBps, per: m.perDrive, util: m.util, wait: m.waitUs, lane: m.laneMB, k: K, lanes };
      if (K === 1) return { key: 'ch6.say.one', v };
      if (m.util > 0.97) return { key: 'ch6.say.full', v };
      return { key: 'ch6.say.some', v };
    },
    pi(r, fault, pi) {
      const v = { guard: r.want.guard, seen: r.guardSeen };
      if (fault === 'none') return { key: 'ch8.say.none', v };
      if (r.outcome === 'retry') return { key: 'ch8.say.link', v };
      if (r.outcome === 'reported') return { key: 'ch8.say.media', v };
      if (r.outcome === 'rejected') return { key: 'ch8.say.guard', v };
      if (fault === 'misdir') return { key: pi ? 'ch8.say.misdirPi' : 'ch8.say.misdir', v };
      if (fault === 'lost') return { key: 'ch8.say.lost', v };
      return { key: pi ? 'ch8.say.slipped' : 'ch8.say.silent', v };
    },
    fec(ber, b, k) {
      const r = FEC.run(ber, b, k), v = { p: r.pCw, every: r.everyS, ok: r.singleOk, nofec: r.noFecEveryS };
      if (r.singleOk < 1) return { key: 'ch9.say.burst', v };
      if (r.everyS > 3.156e7) return { key: 'ch9.say.rare', v };
      return { key: 'ch9.say.often', v };
    }
  };

  return { SPEC, DRIVES, LINK, CDB, SSP, AVAIL, FAN, WIDE, PI, FEC, FRONTIER, rng, fmt, sci, sciText, tunit, say, clamp, prose, comb };
});
