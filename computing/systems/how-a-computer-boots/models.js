/* How a computer boots: the page's models. A power-on state machine on the ATX timing table; the reset-vector
   arithmetic of the Intel SDM; SPI flash read timing from a real datasheet's command table; a boot timeline by stage
   (durations TUNED, structure from the UEFI/PI phases and the ACPI sleep states); an ACPI MADT builder with its
   checksum; a GUID partition table builder and parser with real CRC32 and the backup-header fallback; SHA-256 and a
   small-modulus RSA (BigInt) driving a Secure Boot chain verifier (db, dbx, SBAT) and a revocation comparison; a TPM PCR
   extend log; and a calibrated linear model of serial vs parallel AP bring-up.
   Real-world figures sit in SRC / FRONTIER with their source and the date it was opened (also in BRIEF.md). Constants
   chosen for a model rather than taken from a source are marked TUNED here and on the page.
   UMD: window.BootModels in the browser, module.exports in node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.BootModels = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ── sourced figures (BRIEF.md has URL and the date each was opened, 2026-11-15) ── */
  const SRC = {
    // Intel, ATX Version 3 Multi Rail Desktop Platform Power Supply Design Guide, rev 2.1a (Nov 2023), doc 336521,
    // Table 4-2 (regulation) and Table 4-10 (timing). T2 is measured from 10 % of nominal to inside regulation.
    atx: { rails: [['12', 12.0, 11.20, 12.60], ['5', 5.0, 4.75, 5.25], ['3.3', 3.3, 3.14, 3.47]],
      t1Req: 200, t1Legacy: 500, t1Rec: 150, t2: [0.2, 20], t3Req: [100, 250], t3Legacy: [100, 500], t3Rec: [100, 150], t4: 10, rev: '2.1a', date: '2023-11' },
    // Intel SDM Vol. 3A, order 325384-093US (Sept 2026), §12.1.4 First Instruction Executed; §11.4.4, Table 11-1
    sdm: { csSel: 0xF000, csBase: 0xFFFF0000, eip: 0xFFF0, initMs: 10, sipiUs: 200, sipiCount: 2, order: '325384-093US', date: '2026-09' },
    // Winbond W25Q256JV datasheet rev I (2018-10-23): 03h to fR = 50 MHz, others to FR = 133 MHz; dummy clocks per command
    spi: { chip: 'W25Q256JV', fR: 50, FR: 133, sizeMiB: 32 },
    // Linux, Thomas Gleixner, "[patch V2 00/38] cpu/hotplug, x86: Reworked parallel CPU bringup", 2023-05-04:
    // two-socket Skylake server, 56 cores / 112 threads, ~800 ms busy-waiting for APs, ~80 ms after the change;
    // alive report 350 µs – 3.5 ms; microcode up to ~8 ms on primary threads.
    smp: { threads: 112, serialMs: 800, parallelMs: 80, aliveMs: [0.35, 3.5], ucodeMs: 8, date: '2023-05-04' },
    // rhboot/shim SBAT.md: BootHole added 3 certificates and 150 image hashes to dbx, ~10 kB of a typical 32 kB
    sbat: { bootholeHashes: 150, bootholeCerts: 3, eventKB: 10, dbxKB: 32 },
    // edk2 ImageAuthentication.h: EFI_SIGNATURE_LIST header 16+4+4+4, EFI_SIGNATURE_DATA = owner GUID 16 + data
    sigList: 28, sigOwner: 16, sha256: 32,
    // UEFI 2.11 §5 via edk2 UefiGpt.h / UefiMultiPhase.h / Mbr.h; SeaBIOS boot.c (MBR read to 0x07C0:0)
    gpt: { entryMin: 16384, entrySize: 128, hdrSize: 92, rev: 0x00010000, pmbrType: 0xEE, mbrSig: 0xAA55, mbrLoad: 0x7C00 }
  };
  const FRONTIER = {
    asOf: '2026-11',
    uefi: { ver: '2.11', pi: '1.9', released: '2024-12-17' },          // UEFI Forum press release (Business Wire) 2024-12-17
    acpi: { ver: '6.6' },                                                // uefi.org/specs/ACPI/6.6 (release date not verified)
    certs: { kek2011: '2026-06-24', uefi2011: '2026-06-27', pca2011: '2026-10-19', kbUpdated: '2026-05-18' }, // Microsoft KB5062710
    kb5025885: { first: '2023-05-09', eval: '2024-04-09', deploy: '2024-07-09' }, // Microsoft KB5025885 phases
    boothole: { date: '2020-07-29', cve: 'CVE-2020-10713', cvss: 8.2 },  // Eclypsium 2020-07-29
    blacklotus: { date: '2023-03-01', cve: 'CVE-2022-21894', patched: '2022-01', sold: '2022-10' }, // ESET 2023-03-01
    opensil: { venice: 2026, medusa: '2027 H1' },                        // AMD at OCP Summit, reported by TechPowerUp 2025-10-30
    pluton: { page: '2026-05-27' },                                      // Microsoft Learn, Pluton page (ms.date)
    lbp: { ver: '2.15', kernel: '5.5' }                                  // Linux x86 boot protocol doc
  };

  /* ── helpers ── */
  const enc = s => (typeof TextEncoder !== 'undefined' ? new TextEncoder().encode(s) : Uint8Array.from(Buffer.from(s, 'utf8')));
  const hex = (b, n) => Array.from(n == null ? b : b.slice(0, n), x => x.toString(16).padStart(2, '0')).join('');
  const h8 = x => (x >>> 0).toString(16).toUpperCase().padStart(8, '0');

  /* ── SHA-256 (FIPS 180-4) ── */
  const K256 = new Uint32Array([0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2]);
  function sha256(msg) {
    const m = typeof msg === 'string' ? enc(msg) : msg, L = m.length, nb = ((L + 9 + 63) >> 6) << 6, b = new Uint8Array(nb);
    b.set(m); b[L] = 0x80; const bits = L * 8; for (let i = 0; i < 8; i++) b[nb - 1 - i] = Math.floor(bits / Math.pow(2, 8 * i)) & 255;
    const H = new Uint32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]), W = new Uint32Array(64);
    const r = (x, n) => (x >>> n) | (x << (32 - n));
    for (let o = 0; o < nb; o += 64) {
      for (let i = 0; i < 16; i++) W[i] = (b[o + 4 * i] << 24) | (b[o + 4 * i + 1] << 16) | (b[o + 4 * i + 2] << 8) | b[o + 4 * i + 3];
      for (let i = 16; i < 64; i++) { const s0 = r(W[i - 15], 7) ^ r(W[i - 15], 18) ^ (W[i - 15] >>> 3), s1 = r(W[i - 2], 17) ^ r(W[i - 2], 19) ^ (W[i - 2] >>> 10); W[i] = (W[i - 16] + s0 + W[i - 7] + s1) | 0; }
      let [a, bb, c, d, e, f, g, h] = H;
      for (let i = 0; i < 64; i++) {
        const t1 = (h + (r(e, 6) ^ r(e, 11) ^ r(e, 25)) + ((e & f) ^ (~e & g)) + K256[i] + W[i]) | 0, t2 = ((r(a, 2) ^ r(a, 13) ^ r(a, 22)) + ((a & bb) ^ (a & c) ^ (bb & c))) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = bb; bb = a; a = (t1 + t2) | 0;
      }
      H[0] += a; H[1] += bb; H[2] += c; H[3] += d; H[4] += e; H[5] += f; H[6] += g; H[7] += h;
    }
    const out = new Uint8Array(32); for (let i = 0; i < 8; i++) { out[4 * i] = H[i] >>> 24; out[4 * i + 1] = (H[i] >>> 16) & 255; out[4 * i + 2] = (H[i] >>> 8) & 255; out[4 * i + 3] = H[i] & 255; }
    return out;
  }
  const concat = (a, b) => { const o = new Uint8Array(a.length + b.length); o.set(a); o.set(b, a.length); return o; };

  /* ── CRC32 (IEEE 802.3, reflected polynomial 0xEDB88320), as UEFI uses for GPT ── */
  const CRCT = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(b, from, len) { let c = 0xFFFFFFFF; const e = (from || 0) + (len == null ? b.length - (from || 0) : len); for (let i = from || 0; i < e; i++) c = CRCT[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }

  /* ═════════ 01 power-on: the ATX timing table as a state machine ═════════
     PS_ON# goes low at t = 0. Each rail starts at its own delay (TUNED: 2, 4, 6 ms) and ramps linearly from 0 to its
     set point over `ramp` ms. A rail is in regulation once it is inside [min, max] of Table 4-2. T1 is when the last of
     +12, +5, +3.3 enters regulation; T2 is a rail's time from 10 % of nominal into regulation; PWR_OK rises T3 after T1.
     A rail whose set point sits outside its window never qualifies, so PWR_OK never rises and the board keeps the CPU
     in reset. */
  const POWER = { start: [2, 4, 6], ramp: 8, set33: 3.30, t3: 150, rampRange: [1, 30], setRange: [3.00, 3.40], t3Range: [50, 300] }; // start delays TUNED
  function powerOn(o) {
    o = Object.assign({}, POWER, o || {});
    const A = SRC.atx;
    const rails = A.rails.map(([name, vnom, vmin, vmax], i) => {
      const vset = name === '3.3' ? o.set33 : vnom, start = o.start[i], ramp = o.ramp;
      const inReg = vset >= vmin - 1e-9 && vset <= vmax + 1e-9;
      const tAt = v => start + ramp * v / vset;                 // linear ramp to vset
      const tReg = inReg ? tAt(vmin) : null, t10 = tAt(0.1 * vnom);
      return { name, vnom, vmin, vmax, vset, start, ramp, inReg, tReg, T2: inReg ? tReg - t10 : null, v: t => t <= start ? 0 : t >= start + ramp ? vset : vset * (t - start) / ramp };
    });
    const allOk = rails.every(r => r.inReg);
    const T1 = allOk ? Math.max(...rails.map(r => r.tReg)) : null;
    const pwrOk = allOk ? T1 + o.t3 : null;
    const T2max = allOk ? Math.max(...rails.map(r => r.T2)) : null;
    const bad = rails.filter(r => !r.inReg).map(r => r.name);
    const chk = {
      t1: allOk ? (T1 < A.t1Req) : false,
      t2: allOk ? rails.every(r => r.T2 >= A.t2[0] && r.T2 <= A.t2[1]) : false,
      t3: o.t3 >= A.t3Req[0] && o.t3 <= A.t3Req[1]
    };
    return { rails, allOk, T1, T2max, t3: o.t3, pwrOk, bad, chk, ok: allOk && chk.t1 && chk.t2 && chk.t3 };
  }

  /* ═════════ 02 the reset vector ═════════ */
  const FLASH_SIZES = [8, 16, 32, 64];
  function resetVector(mib) {
    const S = SRC.sdm, size = mib * 1048576, top = 0x100000000;
    const linear = (S.csBase + S.eip) >>> 0;
    return { sel: S.csSel, base: S.csBase, eip: S.eip, linear, below4G: top - linear, winStart: top - size, fileOffset: size - (top - linear),
      realNormal: S.csSel * 16 + S.eip, oneMiB: 0x100000 };
  }
  // ordinary real-mode address once CS has been reloaded: selector × 16 + offset (20 bits plus the A20 carry)
  const realAddr = (sel, ip) => sel * 16 + ip;
  const parseIp = s => (/^[0-9a-f]{1,4}$/i.test(String(s).trim()) ? parseInt(String(s).trim(), 16) : null);
  // the address the reader's offset gives in either mode
  function fetchAddr(mode, ip) { const S = SRC.sdm; return mode === 'reset' ? (S.csBase + ip) >>> 0 : realAddr(S.csSel, ip); }

  /* ═════════ 03 SPI flash read timing (W25Q256JV command table, 3-byte address mode) ═════════
     clocks = instruction + address + mode + dummy + data. Lanes: instruction always on 1 line; address on 1 or 4;
     data on 1, 2 or 4. 03h is limited to fR = 50 MHz; the others run to FR = 133 MHz. */
  const SPI = {
    cmds: {
      '03': { ins: 8, addr: 24, mode: 0, dummy: 0, dlanes: 1, fmax: 50 },
      '0B': { ins: 8, addr: 24, mode: 0, dummy: 8, dlanes: 1, fmax: 133 },
      '3B': { ins: 8, addr: 24, mode: 0, dummy: 8, dlanes: 2, fmax: 133 },
      '6B': { ins: 8, addr: 24, mode: 0, dummy: 8, dlanes: 4, fmax: 133 },
      'EB': { ins: 8, addr: 6, mode: 2, dummy: 4, dlanes: 4, fmax: 133 }
    },
    order: ['03', '0B', '3B', '6B', 'EB'],
    sizes: [64, 4096, 16777216],             // a cache line, a 4 KiB page, a 16 MiB firmware image
    clocks: [10, 20, 25, 33, 50, 66, 80, 100, 133]
  };
  function spiRead(cmd, mhz, bytes) {
    const c = SPI.cmds[cmd], f = Math.min(mhz, c.fmax);
    const over = c.ins + c.addr + c.mode + c.dummy, data = bytes * 8 / c.dlanes, clk = over + data, s = clk / (f * 1e6);
    return { cmd, f, capped: mhz > c.fmax, over, data, clk, s, us: s * 1e6, MBps: bytes / s / 1e6, MiBps: bytes / s / 1048576, overShare: over / clk };
  }

  /* ═════════ 05 boot timeline by stage (durations TUNED, order of magnitude; the structure is the content) ═════════ */
  const TL = {
    stages: ['psu', 'sp', 'pre', 'mem', 'post', 'dxe', 'bds', 'ldr', 'img', 'krn', 'usr'],
    group: { psu: 'hw', sp: 'fw', pre: 'fw', mem: 'fw', post: 'fw', dxe: 'fw', bds: 'fw', ldr: 'os', img: 'os', krn: 'os', usr: 'os' },
    // seconds, TUNED: sp 0.3, pre 0.2, restored training 0.5, post 0.3, DXE 2.0, BDS 1.5, loader 0.5, kernel 1.5, userspace 5.0
    dur: { sp: 0.3, pre: 0.2, memRestore: 0.5, post: 0.3, dxe: 2.0, bds: 1.5, ldr: 0.5, krn: 1.5, usr: 5.0,
      fastDxe: 0.8, fastBds: 0.3, s3mem: 0.3, s3script: 0.2, s3os: 1.0, s4img: 2.0, s4os: 1.0, s0ix: 0.3 },
    train: 15, trainRange: [1, 60],         // full training on a first boot, seconds, TUNED (reader's slider)
    scenarios: ['first', 'normal', 'fast', 's3', 's4', 's0ix']
  };
  function timeline(sc, train) {
    const D = TL.dur, psu = powerOn().pwrOk / 1000, tr = train == null ? TL.train : train;
    const seq = {
      first: [['psu', psu], ['sp', D.sp], ['pre', D.pre], ['mem', tr], ['post', D.post], ['dxe', D.dxe], ['bds', D.bds], ['ldr', D.ldr], ['krn', D.krn], ['usr', D.usr]],
      normal: [['psu', psu], ['sp', D.sp], ['pre', D.pre], ['mem', D.memRestore], ['post', D.post], ['dxe', D.dxe], ['bds', D.bds], ['ldr', D.ldr], ['krn', D.krn], ['usr', D.usr]],
      fast: [['psu', psu], ['sp', D.sp], ['pre', D.pre], ['mem', D.memRestore], ['post', D.post], ['dxe', D.fastDxe], ['bds', D.fastBds], ['ldr', D.ldr], ['krn', D.krn], ['usr', D.usr]],
      // S3: DRAM kept in self-refresh, PEI replays the saved boot script and jumps to the OS waking vector; no DXE, no BDS
      s3: [['psu', psu], ['sp', D.sp], ['pre', D.pre], ['mem', D.s3mem], ['post', D.s3script], ['krn', D.s3os]],
      // S4: memory was written to disk and power removed: full firmware boot, then the loader reads the image back
      s4: [['psu', psu], ['sp', D.sp], ['pre', D.pre], ['mem', D.memRestore], ['post', D.post], ['dxe', D.dxe], ['bds', D.bds], ['ldr', D.ldr], ['img', D.s4img], ['krn', D.s4os]],
      // S0ix: the OS never left; no firmware runs at all
      s0ix: [['krn', D.s0ix]]
    }[sc];
    let t = 0; const segs = seq.map(([k, d]) => { const s = { key: k, start: t, dur: d, group: TL.group[k] }; t += d; return s; });
    const fw = segs.filter(s => s.group !== 'os').reduce((a, s) => a + s.dur, 0);
    const big = segs.reduce((a, s) => (s.dur > a.dur ? s : a), segs[0]);
    return { sc, segs, total: t, fw, fwShare: fw / t, biggest: big.key, biggestDur: big.dur, trainShare: (segs.find(s => s.key === 'mem') || { dur: 0 }).dur / t };
  }

  /* ═════════ 06 ACPI: a MADT built byte by byte (ACPI 6.5/6.6 via edk2 Acpi10.h / Acpi65.h) ═════════
     36-byte description header, +4 Local Interrupt Controller Address, +4 Flags, then one Processor Local APIC (type 0,
     8 bytes) per core and one I/O APIC (type 1, 12 bytes). Checksum: the byte that makes all bytes sum to 0 mod 256. */
  const MADT = { cores: [1, 2, 4, 8, 16, 24, 32, 64, 128, 192, 254], lapic: 0xFEE00000, ioapic: 0xFEC00000, hdr: 36, fixed: 44, lapicLen: 8, ioapicLen: 12 };
  function madt(n, corrupt) {
    const len = MADT.fixed + n * MADT.lapicLen + MADT.ioapicLen, b = new Uint8Array(len);
    const w32 = (o, v) => { b[o] = v & 255; b[o + 1] = (v >>> 8) & 255; b[o + 2] = (v >>> 16) & 255; b[o + 3] = (v >>> 24) & 255; };
    const str = (o, s) => { for (let i = 0; i < s.length; i++) b[o + i] = s.charCodeAt(i); };
    str(0, 'APIC'); w32(4, len); b[8] = 5; b[9] = 0; str(10, 'KVBOOT'); str(16, 'ESSAYTBL'); w32(24, 1); str(28, 'KVIS'); w32(32, 1);
    w32(36, MADT.lapic); w32(40, 1); // flags: PCAT_COMPAT
    let o = 44;
    for (let i = 0; i < n; i++) { b[o] = 0; b[o + 1] = 8; b[o + 2] = i; b[o + 3] = i; w32(o + 4, 1); o += 8; } // enabled
    b[o] = 1; b[o + 1] = 12; b[o + 2] = n; b[o + 3] = 0; w32(o + 4, MADT.ioapic); w32(o + 8, 0);
    let s = 0; for (let i = 0; i < len; i++) s = (s + b[i]) & 255;
    b[9] = (256 - s) & 255;
    if (corrupt) b[44 + 3] ^= 0x01;    // one bit of the first APIC ID
    let sum = 0; for (let i = 0; i < len; i++) sum = (sum + b[i]) & 255;
    const cores = []; for (let p = 44; p < len;) { if (b[p] === 0) cores.push(b[p + 3]); p += b[p + 1]; }
    return { bytes: b, len, checksum: b[9], sum, ok: sum === 0, cores };
  }

  /* ═════════ 07 the GUID partition table ═════════
     LBA 0: protective MBR (one 0xEE entry from LBA 1). LBA 1: header (92 bytes). LBA 2–33: 128 entries × 128 bytes =
     16 KiB. Backup array and header at the end of the disk. Header CRC32 over HeaderSize bytes with its own CRC field
     zeroed; entry array CRC32 over NumberOfPartitionEntries × SizeOfPartitionEntry. */
  const GPT = { lba: 512, entries: 128, diskGiB: [1, 64, 256, 1024, 4096], espMiB: [100, 260, 512, 1024], defDisk: 1, defEsp: 1,
    espType: 'C12A7328-F81F-11D2-BA4B-00A0C93EC93B', linuxType: '0FC63DAF-8483-4772-8E79-3D69D8477DE4',
    diskGuid: '6E3B1D2A-55C0-4C4B-9F6A-2B0D7E1C9A41', espGuid: '1F0D3C55-8A21-4E5B-B7C4-0A9E62D4F318', rootGuid: '9B5E7A10-3C4D-4F86-A1E2-5D7C8B9F0A63',
    edits: ['none', 'sig', 'guid', 'mylba', 'entry', 'start'] };
  // GUID text → 16 bytes in the on-disk order: first three fields little-endian, last two as written
  function guidBytes(g) {
    const h = g.replace(/-/g, ''), pairs = s => s.match(/../g);
    const parts = [...pairs(h.slice(0, 8)).reverse(), ...pairs(h.slice(8, 12)).reverse(), ...pairs(h.slice(12, 16)).reverse(), ...pairs(h.slice(16))];
    return Uint8Array.from(parts.map(x => parseInt(x, 16)));
  }
  const guidStr = (b, o) => { const x = i => b[o + i].toString(16).padStart(2, '0').toUpperCase(); return [3, 2, 1, 0].map(x).join('') + '-' + [5, 4].map(x).join('') + '-' + [7, 6].map(x).join('') + '-' + [8, 9].map(x).join('') + '-' + [10, 11, 12, 13, 14, 15].map(x).join(''); };
  const w32 = (b, o, v) => { b[o] = v & 255; b[o + 1] = (v >>> 8) & 255; b[o + 2] = (v >>> 16) & 255; b[o + 3] = (v >>> 24) & 255; };
  const w64 = (b, o, v) => { w32(b, o, v % 4294967296); w32(b, o + 4, Math.floor(v / 4294967296)); };
  const r32 = (b, o) => (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0;
  const r64 = (b, o) => r32(b, o) + r32(b, o + 4) * 4294967296;
  function gptBuild(diskGiB, espMiB) {
    const L = GPT.lba, nLba = diskGiB * 1073741824 / L, last = nLba - 1, arrLba = SRC.gpt.entryMin / L;
    const firstUse = 2 + arrLba, lastUse = last - 1 - arrLba;
    const espStart = 2048, espEnd = espStart + espMiB * 2048 - 1, rootStart = espEnd + 1, rootEnd = lastUse;
    const ent = new Uint8Array(GPT.entries * SRC.gpt.entrySize);
    const putEntry = (i, type, uniq, s, e, name) => { const o = i * 128; ent.set(guidBytes(type), o); ent.set(guidBytes(uniq), o + 16); w64(ent, o + 32, s); w64(ent, o + 40, e); w64(ent, o + 48, 0); for (let k = 0; k < name.length; k++) { ent[o + 56 + 2 * k] = name.charCodeAt(k); } };
    putEntry(0, GPT.espType, GPT.espGuid, espStart, espEnd, 'EFI system partition');
    putEntry(1, GPT.linuxType, GPT.rootGuid, rootStart, rootEnd, 'root');
    const arrCrc = crc32(ent);
    const hdr = (my, alt, entLba) => {
      const h = new Uint8Array(SRC.gpt.hdrSize);
      'EFI PART'.split('').forEach((c, i) => { h[i] = c.charCodeAt(0); });
      w32(h, 8, SRC.gpt.rev); w32(h, 12, SRC.gpt.hdrSize); w32(h, 16, 0); w32(h, 20, 0);
      w64(h, 24, my); w64(h, 32, alt); w64(h, 40, firstUse); w64(h, 48, lastUse); h.set(guidBytes(GPT.diskGuid), 56);
      w64(h, 72, entLba); w32(h, 80, GPT.entries); w32(h, 84, SRC.gpt.entrySize); w32(h, 88, arrCrc);
      w32(h, 16, crc32(h)); return h;
    };
    const mbr = new Uint8Array(512);
    mbr[446 + 4] = SRC.gpt.pmbrType; w32(mbr, 446 + 8, 1); w32(mbr, 446 + 12, Math.min(nLba - 1, 0xFFFFFFFF));
    mbr[510] = 0x55; mbr[511] = 0xAA;
    return { nLba, last, firstUse, lastUse, arrLba, espStart, espEnd, rootStart, rootEnd, mbr, primary: hdr(1, last, 2), backup: hdr(last, 1, last - arrLba), entries: ent, backupEntries: ent.slice(), arrCrc };
  }
  // the reader's edit: which field gets one byte changed, whether the CRC is then recomputed, whether the backup is hit too
  function gptEdit(d, edit, fixCrc, both) {
    const out = { mbr: d.mbr, primary: d.primary.slice(), backup: d.backup.slice(), entries: d.entries.slice(), backupEntries: d.backupEntries.slice(), last: d.last, arrLba: d.arrLba };
    const apply = (h, ent) => {
      if (edit === 'sig') h[0] ^= 0x01;                       // 'E' → 'D'
      if (edit === 'guid') h[56] ^= 0x01;                     // one byte of DiskGUID
      if (edit === 'mylba') h[24] ^= 0x02;                    // MyLBA no longer this sector
      if (edit === 'entry') ent[56 + 2 * 3] ^= 0x20;          // a letter of the ESP's name changes case
      if (edit === 'start') ent[32] ^= 0x08;                  // the ESP's StartingLBA moves by 8 sectors
      if (fixCrc) { w32(h, 88, crc32(ent)); w32(h, 16, 0); w32(h, 16, crc32(h)); }
    };
    apply(out.primary, out.entries);
    if (both) apply(out.backup, out.backupEntries);
    return out;
  }
  function gptCheck(h, ent, atLba) {
    const why = [];
    let sig = ''; for (let i = 0; i < 8; i++) sig += String.fromCharCode(h[i]);
    if (sig !== 'EFI PART') why.push('sig');
    const size = r32(h, 12); const c = h.slice(0, size); const stored = r32(c, 16); w32(c, 16, 0);
    const calc = crc32(c); if (calc !== stored) why.push('hdrcrc');
    if (r64(h, 24) !== atLba) why.push('mylba');
    const n = r32(h, 80), es = r32(h, 84), acalc = crc32(ent, 0, n * es);
    if (acalc !== r32(h, 88)) why.push('arrcrc');
    return { ok: !why.length, why, stored, calc, arrStored: r32(h, 88), arrCalc: acalc };
  }
  function gptParse(d) {
    const pm = d.mbr[446 + 4] === SRC.gpt.pmbrType && r32(d.mbr, 446 + 8) === 1 && (d.mbr[510] | (d.mbr[511] << 8)) === SRC.gpt.mbrSig;
    const P = gptCheck(d.primary, d.entries, 1), B = gptCheck(d.backup, d.backupEntries, d.last);
    const use = P.ok ? 'primary' : B.ok ? 'backup' : null;
    const ent = use === 'primary' ? d.entries : use === 'backup' ? d.backupEntries : null;
    const parts = [];
    if (ent) for (let i = 0; i < GPT.entries; i++) {
      const o = i * 128, type = guidStr(ent, o); if (/^0{8}-0{4}-0{4}-0{4}-0{12}$/.test(type)) continue;
      let name = ''; for (let k = 0; k < 36; k++) { const ch = ent[o + 56 + 2 * k] | (ent[o + 57 + 2 * k] << 8); if (!ch) break; name += String.fromCharCode(ch); }
      parts.push({ i, type, esp: type === GPT.espType, start: r64(ent, o + 32), end: r64(ent, o + 40), name });
    }
    const esp = parts.find(p => p.esp);
    return { pm, P, B, use, parts, esp, espAligned: esp ? esp.start % 2048 === 0 : false };
  }
  const MBR_LIMIT_BYTES = Math.pow(2, 32) * 512;   // 32-bit LBA field × 512-byte sectors

  /* ═════════ 08–09 signatures: SHA-256 and textbook RSA with a small modulus (BigInt) ═════════
     Real Secure Boot uses Authenticode: RSA-2048 (PKCS #1 v1.5) over a SHA-256 of the PE image. Here the modulus is about
     62 bits so the arithmetic is visible; the verify rule, s^e mod n = H(image) mod n, is the same. */
  const B = x => BigInt(x);
  function modpow(b, e, m) { let r = 1n; b %= m; while (e > 0n) { if (e & 1n) r = r * b % m; b = b * b % m; e >>= 1n; } return r; }
  function egcd(a, b) { let [r0, r1, s0, s1] = [a, b, 1n, 0n]; while (r1) { const q = r0 / r1; [r0, r1] = [r1, r0 - q * r1]; [s0, s1] = [s1, s0 - q * s1]; } return [r0, s0]; }
  function isPrime(n) {
    if (n < 2n) return false; for (const p of [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n]) { if (n === p) return true; if (n % p === 0n) return false; }
    let d = n - 1n, s = 0; while (!(d & 1n)) { d >>= 1n; s++; }
    for (const a of [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n]) { let x = modpow(a, d, n); if (x === 1n || x === n - 1n) continue; let comp = true; for (let i = 1; i < s; i++) { x = x * x % n; if (x === n - 1n) { comp = false; break; } } if (comp) return false; }
    return true;
  }
  function nextPrime(n) { let p = n | 1n; while (!isPrime(p)) p += 2n; return p; }
  const E = 65537n;
  function keyFrom(seed) {
    // two primes just above 2^31 + seed-derived offsets; deterministic, so every key on the page repeats exactly
    const h = sha256('key:' + seed);
    const off = k => B('0x' + hex(h.slice(k, k + 3)));
    let p = nextPrime((1n << 31n) + off(0)), q = nextPrime((1n << 30n) * 3n + off(4));
    while (((p - 1n) * (q - 1n)) % E === 0n) q = nextPrime(q + 2n);
    const n = p * q, phi = (p - 1n) * (q - 1n), d = ((egcd(E, phi)[1] % phi) + phi) % phi;
    return { name: seed, n, e: E, d };
  }
  const digestInt = (bytes, n) => B('0x' + hex(sha256(bytes))) % n;
  const sign = (key, bytes) => modpow(digestInt(bytes, key.n), key.d, key.n);
  const verifySig = (pub, bytes, s) => modpow(s, pub.e, pub.n) === digestInt(bytes, pub.n);
  const certBody = (subject, pub) => enc(subject + '|' + pub.n.toString(16) + '|' + pub.e.toString(16));
  function makeCert(subject, key, issuerKey, issuerName) { const pub = { n: key.n, e: key.e }; return { subject, pub, issuer: issuerName, sig: sign(issuerKey, certBody(subject, pub)) }; }
  const fp = c => hex(sha256(certBody(c.subject, c.pub)), 8);

  // the cast: keys and certificates (names as on Microsoft's pages; the distro key stands for any shim vendor)
  const KEYS = {};
  ['pk', 'kek', 'msUefi2011', 'pca2011', 'winUefi2023', 'distro', 'mok', 'attacker'].forEach(k => { KEYS[k] = keyFrom(k); });
  const CERT = {
    pk: makeCert('OEM Platform Key', KEYS.pk, KEYS.pk, 'OEM Platform Key'),
    kek: makeCert('Microsoft Corporation KEK 2K CA 2023', KEYS.kek, KEYS.pk, 'OEM Platform Key'),
    msUefi2011: makeCert('Microsoft UEFI CA 2011', KEYS.msUefi2011, KEYS.msUefi2011, 'Microsoft UEFI CA 2011'),
    pca2011: makeCert('Microsoft Windows Production PCA 2011', KEYS.pca2011, KEYS.pca2011, 'Microsoft Windows Production PCA 2011'),
    winUefi2023: makeCert('Windows UEFI CA 2023', KEYS.winUefi2023, KEYS.winUefi2023, 'Windows UEFI CA 2023'),
    distro: makeCert('Distro Secure Boot CA', KEYS.distro, KEYS.distro, 'Distro Secure Boot CA'),
    mok: makeCert('Machine Owner Key', KEYS.mok, KEYS.mok, 'Machine Owner Key'),
    attacker: makeCert('Self-made key', KEYS.attacker, KEYS.attacker, 'Self-made key')
  };
  // an image: its bytes, an optional signature by `by`, and an SBAT generation for shim's check
  function image(name, body, by, sbat) { const bytes = enc(body); return { name, bytes, by: by || null, s: by ? sign(KEYS[by], bytes) : null, sbat: sbat || null }; }
  function tamper(img) { const b = img.bytes.slice(); b[b.length - 3] ^= 0x01; return Object.assign({}, img, { bytes: b, tampered: true }); }
  // one verification step: dbx hash, dbx certificate, then a trusted signer and a matching signature
  function verifyImage(img, trust, dbx) {
    const h = hex(sha256(img.bytes));
    if (dbx.hashes.includes(h)) return { ok: false, why: 'dbxhash', h };
    if (!img.s) return { ok: false, why: 'unsigned', h };
    if (dbx.certs.includes(img.by)) return { ok: false, why: 'dbxcert', h };
    if (!trust.includes(img.by)) return { ok: false, why: 'untrusted', h };
    if (!verifySig(CERT[img.by].pub, img.bytes, img.s)) return { ok: false, why: 'badsig', h };
    return { ok: true, why: 'ok', h };
  }
  const IMG = {
    shim: image('shimx64.efi', 'shim 16 (sbat shim,4)', 'msUefi2011', 4),
    shimOld: image('shimx64.efi', 'shim 0.9, vulnerable (sbat none)', 'msUefi2011', 0),
    grub: image('grubx64.efi', 'GRUB 2.12 (sbat grub,2)', 'distro', 2),
    grubOld: image('grubx64.efi', 'GRUB 2.04, vulnerable config parser (sbat grub,1)', 'distro', 1),
    kernel: image('vmlinuz', 'Linux 6.18 distro build', 'distro'),
    kernelMine: image('vmlinuz', 'Linux 6.18 my own build', 'mok'),
    kernelBare: image('vmlinuz', 'Linux 6.18 unsigned build'),
    evil: image('grubx64.efi', 'bootkit loader', 'attacker'),
    bootmgrOld: image('bootmgfw.efi', 'Windows Boot Manager 2022-01 build, vulnerable', 'pca2011'),
    bootmgrPca: image('bootmgfw.efi', 'Windows Boot Manager 2024 build signed by PCA 2011', 'pca2011'),
    bootmgr23: image('bootmgfw.efi', 'Windows Boot Manager 2024 build signed by 2023 CA', 'winUefi2023')
  };
  /* ch8: firmware → shim → GRUB → kernel. Firmware trusts db; shim trusts its built-in distro certificate and the MOK
     list, checks dbx too, and refuses images whose SBAT generation is below the policy. */
  const SB = { shims: ['shim', 'shimOld'], grubs: ['grub', 'grubTampered', 'grubOld', 'evil'], kernels: ['kernel', 'kernelBare', 'kernelMine'] };
  function chain(o) {
    o = Object.assign({ shim: 'shim', grub: 'grub', kernel: 'kernel', sb: true, dbx: false, sbat: 2, mok: false }, o || {});
    const shim = IMG[o.shim], grub = o.grub === 'grubTampered' ? tamper(IMG.grub) : IMG[o.grub], kernel = IMG[o.kernel];
    const db = ['msUefi2011', 'winUefi2023'], dbx = { hashes: o.dbx ? [hex(sha256(IMG.shimOld.bytes))] : [], certs: [] };
    const shimTrust = ['distro'].concat(o.mok ? ['mok'] : []);
    const steps = [];
    if (!o.sb) { [shim, grub, kernel].forEach((im, i) => steps.push({ who: ['fw', 'shim', 'grub'][i], img: im.name, ok: true, why: 'off' })); return { steps, stopAt: null, booted: true, sb: false }; }
    const s1 = verifyImage(shim, db, dbx); steps.push(Object.assign({ who: 'fw', img: shim.name, signer: shim.by }, s1));
    if (!s1.ok) return { steps, stopAt: 0, booted: false, sb: true };
    let s2 = verifyImage(grub, shimTrust, dbx);
    if (s2.ok && grub.sbat != null && grub.sbat < o.sbat) s2 = { ok: false, why: 'sbat', h: s2.h };
    steps.push(Object.assign({ who: 'shim', img: grub.name, signer: grub.by, gen: grub.sbat }, s2));
    if (!s2.ok) return { steps, stopAt: 1, booted: false, sb: true };
    const s3 = verifyImage(kernel, shimTrust, dbx); steps.push(Object.assign({ who: 'grub', img: kernel.name, signer: kernel.by }, s3));
    return { steps, stopAt: s3.ok ? null : 2, booted: s3.ok, sb: true };
  }

  /* ch9: revoking something that was validly signed. Three loaders per scenario go through the same verifier: the
     attacker's old vulnerable loader, today's loader, and an older install stick. Bytes added to dbx are counted with
     the EFI_SIGNATURE_LIST layout (28-byte list header + 48 bytes per SHA-256 entry). */
  const REV = { scenarios: ['linux', 'windows'], methods: { linux: ['none', 'hash', 'sbat'], windows: ['none', 'hash', 'cert'] },
    builds: [1, 10, 50, 150, 300], defBuilds: 3 };
  function revoke(sc, method, nBuilds, db23) {
    const n = nBuilds == null ? SRC.sbat.bootholeHashes : nBuilds;
    const sigBytes = SRC.sigOwner + SRC.sha256, hashBytes = n ? SRC.sigList + n * sigBytes : 0;
    let dbx = { hashes: [], certs: [] }, sbatMin = 1, added = 0, bytes = 0, extra = '';
    const L = sc === 'linux';
    const old = L ? IMG.grubOld : IMG.bootmgrOld, cur = L ? IMG.grub : (db23 ? IMG.bootmgr23 : IMG.bootmgrPca), media = L ? image('grubx64.efi', 'GRUB 2.06 on a 2022 install stick (sbat grub,1)', 'distro', 1) : IMG.bootmgrPca;
    if (method === 'hash') { dbx.hashes.push(hex(sha256(old.bytes))); added = n; bytes = hashBytes; }
    if (method === 'sbat') { sbatMin = 2; extra = 'grub,2'; }
    if (method === 'cert') { dbx.certs.push('pca2011'); added = 1; }
    const trust = L ? ['distro'] : ['pca2011', 'winUefi2023'];
    const run = img => { let r = verifyImage(img, trust, dbx); if (r.ok && L && img.sbat != null && img.sbat < sbatMin) r = { ok: false, why: 'sbat' }; return r; };
    const rOld = run(old), rCur = run(cur), rMedia = run(media);
    // a second vulnerable build that is not on the hash list: hashes revoke only the builds someone listed
    const sibling = L ? image('grubx64.efi', 'GRUB 2.04 rebuilt by another vendor (sbat grub,1)', 'distro', 1) : image('bootmgfw.efi', 'Windows Boot Manager 2021-07 build, vulnerable', 'pca2011');
    const rSib = run(sibling);
    return { sc, method, n, added, bytes, extra, share: bytes / (SRC.sbat.dbxKB * 1024), old: rOld, cur: rCur, media: rMedia, sibling: rSib };
  }

  /* ═════════ 10 measured boot: PCR extend, PCR_new = SHA-256(PCR_old || digest) (TPM 2.0 Part 1 §17.2) ═════════ */
  const PCR = { tampers: ['none', 'fw', 'oprom', 'sboff', 'grub', 'gpt', 'order'], policies: ['p7', 'p0247', 'p4'], banks: [0, 2, 4, 5, 7] };
  function pcrEvents(tamper) {
    const gptHdr = hex(gptBuild(GPT.diskGiB[GPT.defDisk], GPT.espMiB[GPT.defEsp]).primary);
    const ev = [
      [0, 'crtm', 'firmware SEC+PEI volume v1.07'],
      [0, 'dxe', 'firmware DXE volume v1.07'],
      [7, 'sbstate', 'SecureBoot=1'], [7, 'pkvar', 'PK=' + fp(CERT.pk)], [7, 'kekvar', 'KEK=' + fp(CERT.kek)], [7, 'dbvar', 'db=' + fp(CERT.msUefi2011) + ',' + fp(CERT.winUefi2023)], [7, 'dbxvar', 'dbx=empty'],
      [2, 'oprom', 'GPU option ROM v3.2'],
      [0, 'sep', 'separator'], [2, 'sep', 'separator'], [4, 'sep', 'separator'], [5, 'sep', 'separator'], [7, 'sep', 'separator'],
      [4, 'shim', 'shimx64.efi ' + hex(sha256(IMG.shim.bytes))],
      [7, 'auth', 'authority=' + fp(CERT.msUefi2011)],
      [4, 'grub', 'grubx64.efi ' + hex(sha256(IMG.grub.bytes))],
      [5, 'gpt', 'GPT ' + gptHdr]
    ].map(([p, k, d]) => ({ pcr: p, key: k, data: d }));
    const fix = (k, f) => ev.forEach(e => { if (e.key === k) e.data = f(e.data); });
    if (tamper === 'fw') fix('dxe', () => 'firmware DXE volume v1.08');
    if (tamper === 'oprom') fix('oprom', () => 'GPU option ROM v3.3');
    if (tamper === 'sboff') fix('sbstate', () => 'SecureBoot=0');
    if (tamper === 'grub') fix('grub', () => 'grubx64.efi ' + hex(sha256(enc('GRUB 2.12-2 (sbat grub,2)'))));
    if (tamper === 'gpt') { const d = gptBuild(GPT.diskGiB[GPT.defDisk], GPT.espMiB[2]); fix('gpt', () => 'GPT ' + hex(d.primary)); }
    if (tamper === 'order') { const i = ev.findIndex(e => e.key === 'shim'), j = ev.findIndex(e => e.key === 'grub'); const t = ev[i]; ev[i] = ev[j]; ev[j] = t; }
    return ev;
  }
  function pcrRun(tamper) {
    const reg = {}; PCR.banks.forEach(b => { reg[b] = new Uint8Array(32); });
    const log = [];
    for (const e of pcrEvents(tamper)) { const dg = sha256(e.data); reg[e.pcr] = sha256(concat(reg[e.pcr], dg)); log.push({ pcr: e.pcr, key: e.key, digest: hex(dg, 4), after: hex(reg[e.pcr], 4) }); }
    const out = {}; PCR.banks.forEach(b => { out[b] = hex(reg[b]); });
    return { pcr: out, log };
  }
  const POLICY = { p7: [7], p0247: [0, 2, 4, 7], p4: [4] };
  function unseal(policy, tamper) {
    const ref = pcrRun('none').pcr, now = pcrRun(tamper).pcr, use = POLICY[policy];
    const changed = PCR.banks.filter(b => ref[b] !== now[b]);
    return { ok: use.every(b => ref[b] === now[b]), changed, use };
  }
  // how many hex digits of a 64-digit PCR differ after a change (an avalanche check)
  const diffDigits = (a, b) => { let n = 0; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) n++; return n; };

  /* ═════════ 11 waking the other cores: serial vs parallel AP bring-up, calibrated to one measurement ═════════
     Serial: the boot CPU kicks one AP and waits for it (alive report + microcode) before the next: N_AP × tSerial.
     Parallel (Linux 6.5+ style): kick them all, wait once, then a short serialized part per AP: tFirst + N_AP × tTail.
     tSerial = 800 / 111 ms and tTail from 80 ms are calibrated to the 112-thread Skylake numbers; tFirst = alive (3.5 ms
     upper bound) + microcode (8 ms). Beyond 112 threads the model assumes the per-AP costs stay constant. */
  const SMP = { threads: [2, 4, 8, 16, 32, 64, 112, 192, 256, 384, 512], def: 6 };
  const SMPK = (() => { const S = SRC.smp, nAp = S.threads - 1, tFirst = S.aliveMs[1] + S.ucodeMs; return { tSerial: S.serialMs / nAp, tFirst, tTail: (S.parallelMs - tFirst) / nAp }; })();
  function bringup(n) {
    const ap = n - 1, serial = ap * SMPK.tSerial, parallel = ap ? SMPK.tFirst + ap * SMPK.tTail : 0;
    const S = SRC.sdm, firmware = S.initMs + S.sipiCount * S.sipiUs / 1000;   // the SDM example's fixed waits
    return { n, ap, serial, parallel, saved: serial - parallel, ratio: parallel ? serial / parallel : 1, firmware };
  }

  /* ── numbers quoted in the prose: [value, decimals, kind] ── */
  let PROSE_CACHE = null;
  function prose() {
    if (PROSE_CACHE) return PROSE_CACHE;
    const A = SRC.atx, p = powerOn(), pBad = powerOn({ set33: 3.10 }), pSlow = powerOn({ ramp: 25 });
    const rv = resetVector(32);
    const s03 = spiRead('03', 50, 64), sEB = spiRead('EB', 133, 64), s03img = spiRead('03', 50, 16777216), sEBimg = spiRead('EB', 133, 16777216), s0Bimg = spiRead('0B', 133, 16777216);
    const tN = timeline('normal'), tF = timeline('first'), tS3 = timeline('s3'), tS4 = timeline('s4'), tFast = timeline('fast');
    const m8 = madt(8), m64 = madt(64);
    const g = gptBuild(GPT.diskGiB[GPT.defDisk], GPT.espMiB[GPT.defEsp]);
    const rL = revoke('linux', 'hash', SRC.sbat.bootholeHashes);
    const pc = pcrRun('none'), pcF = pcrRun('fw');
    const b112 = bringup(112), b512 = bringup(512);
    PROSE_CACHE = {
      // ch1
      t1Req: [A.t1Req, 0], t1Leg: [A.t1Legacy, 0], t2Lo: [A.t2[0], 1], t2Hi: [A.t2[1], 0], t3Lo: [A.t3Req[0], 0], t3Hi: [A.t3Req[1], 0],
      v33min: [A.rails[2][2], 2], v33max: [A.rails[2][3], 2], v12min: [A.rails[0][2], 2],
      pT1: [p.T1, 1], pOk: [p.pwrOk, 1], badSet: [3.10, 2], slowRamp: [25, 0], slowT2: [pSlow.T2max, 1],
      // ch2
      rvLin: [rv.linear, 'hex'], rvBase: [rv.base, 'hex'], rvSel: [rv.sel, 'hex4'], rvEip: [rv.eip, 'hex4'], rvOff: [rv.fileOffset, 'hex'], rvBelow: [rv.below4G, 0], rvReal: [rv.realNormal, 'hex5'],
      // ch3
      spiF03: [SRC.spi.fR, 0], spiF: [SRC.spi.FR, 0], s03us: [s03.us, 2], sEBus: [sEB.us, 2], s03clk: [s03.clk, 0], sEBclk: [sEB.clk, 0], sEBover: [sEB.over, 0],
      s03img: [s03img.s, 2], sEBimg: [sEBimg.s, 2], s0Bimg: [s0Bimg.s, 2], sEBMBps: [sEBimg.MBps, 0], spiX: [s03img.s / sEBimg.s, 1], spiSize: [SRC.spi.sizeMiB, 0],
      // ch5
      tNormal: [tN.total, 1], tFirst: [tF.total, 1], tS3: [tS3.total, 1], tS4: [tS4.total, 1], tFast: [tFast.total, 1], tFwShare: [tN.fwShare, 0, 'pct'], tTrain: [TL.train, 0], tTrainShare: [tF.trainShare, 0, 'pct'],
      // ch6
      madtLen8: [m8.len, 0], madtSum8: [m8.checksum, 'hex2'], madtLen64: [m64.len, 0],
      // ch7
      gFirst: [g.firstUse, 0], gArr: [g.arrLba, 0], gLast: [g.last, 0], gEsp: [g.espStart, 0], gCrc: [r32(g.primary, 16), 'hex'], gArrCrc: [g.arrCrc, 'hex'], mbrTiB: [MBR_LIMIT_BYTES / Math.pow(2, 40), 0], gEntries: [GPT.entries, 0], gEntrySize: [SRC.gpt.entrySize, 0],
      // ch9
      bhHashes: [SRC.sbat.bootholeHashes, 0], bhCerts: [SRC.sbat.bootholeCerts, 0], bhBytes: [rL.bytes, 0], bhKB: [SRC.sbat.eventKB, 0], dbxKB: [SRC.sbat.dbxKB, 0], bhShare: [rL.share, 0, 'pct'], sigEntry: [SRC.sigOwner + SRC.sha256, 0],
      // ch10
      pcr0: [pc.pcr[0].slice(0, 8), 'str'], pcr0f: [pcF.pcr[0].slice(0, 8), 'str'], pcrDiff: [diffDigits(pc.pcr[0], pcF.pcr[0]), 0],
      // ch11
      smpN: [SRC.smp.threads, 0], smpSer: [b112.serial, 0], smpPar: [b112.parallel, 0], smp512s: [b512.serial, 0], smp512p: [b512.parallel, 0], sdmInit: [SRC.sdm.initMs, 0], sdmSipi: [SRC.sdm.sipiUs, 0],
      aliveLo: [SRC.smp.aliveMs[0], 2], aliveHi: [SRC.smp.aliveMs[1], 1], ucode: [SRC.smp.ucodeMs, 0]
    };
    return PROSE_CACHE;
  }

  /* ── formatting ── */
  function fmt(x, d, lang) {
    if (x == null || !isFinite(x)) return '—';
    const s = (d == null ? (Math.abs(x) >= 100 ? 0 : Math.abs(x) >= 10 ? 1 : 2) : d);
    const k = Math.pow(10, s); x = Math.sign(x) * Math.round(Math.abs(x) * k * (1 + 1e-12)) / k;
    return Number(x).toLocaleString(lang === 'en' ? 'en-US' : 'zh-CN', { minimumFractionDigits: s, maximumFractionDigits: s });
  }
  function fmtKind(v, kind) {
    if (kind === 'hex') return '0x' + h8(v);
    if (kind === 'hex4') return '0x' + v.toString(16).toUpperCase().padStart(4, '0');
    if (kind === 'hex5') return '0x' + v.toString(16).toUpperCase().padStart(5, '0');
    if (kind === 'hex2') return '0x' + v.toString(16).toUpperCase().padStart(2, '0');
    if (kind === 'str') return String(v);
    return null;
  }

  /* ── live sentences: each returns { key } ── */
  const say = {
    power(r) { if (!r.allOk) return { key: 'ch1.say.never' }; if (!r.chk.t2) return { key: 'ch1.say.t2' }; if (!r.chk.t3) return { key: r.t3 < SRC.atx.t3Req[0] ? 'ch1.say.t3short' : 'ch1.say.t3long' }; if (!r.chk.t1) return { key: 'ch1.say.t1' }; return { key: 'ch1.say.ok' }; },
    reset(mode, ipOk) { if (ipOk === false) return { key: 'ch2.say.badip' }; return { key: mode === 'reset' ? 'ch2.say.reset' : 'ch2.say.far' }; },
    spi(r) { if (r.capped) return { key: 'ch3.say.capped' }; if (r.cmd === 'EB' && r.overShare >= 0.05) return { key: 'ch3.say.quadio' }; return { key: r.overShare >= 0.05 ? 'ch3.say.overhead' : 'ch3.say.data' }; },
    timeline(sc) { return { key: 'ch5.say.' + sc }; },
    madt(r) { return { key: r.ok ? 'ch6.say.ok' : 'ch6.say.bad' }; },
    gpt(r, edit, fix) { if (r.use === 'primary') return { key: edit !== 'none' && fix ? 'ch7.say.fixed' : 'ch7.say.primary' }; if (r.use === 'backup') return { key: 'ch7.say.backup' }; return { key: 'ch7.say.none' }; },
    chain(r) { if (!r.sb) return { key: 'ch8.say.off' }; if (r.booted) return { key: 'ch8.say.ok' }; const s = r.steps[r.stopAt]; return { key: 'ch8.say.' + s.why }; },
    revoke(r) { return { key: 'ch9.say.' + r.sc + '.' + r.method + (r.method === 'cert' ? (r.cur.ok ? '.ok' : '.bad') : '') }; },
    pcr(policy, tamper) { const u = unseal(policy, tamper); if (tamper === 'none') return { key: 'ch10.say.same' }; return { key: u.ok ? 'ch10.say.unseal' : 'ch10.say.locked' }; },
    smp(n) { return { key: n <= 2 ? 'ch11.say.small' : n === SRC.smp.threads ? 'ch11.say.cal' : n >= 256 ? 'ch11.say.big' : 'ch11.say.mid' }; }
  };

  return { SRC, FRONTIER, sha256, hex, h8, crc32, enc, POWER, powerOn, FLASH_SIZES, resetVector, realAddr, parseIp, fetchAddr, SPI, spiRead, TL, timeline,
    MADT, madt, GPT, guidBytes, guidStr, gptBuild, gptEdit, gptParse, gptCheck, r32, r64, MBR_LIMIT_BYTES,
    modpow, isPrime, keyFrom, sign, verifySig, KEYS, CERT, IMG, image, tamper, verifyImage, SB, chain, REV, revoke,
    PCR, pcrEvents, pcrRun, POLICY, unseal, diffDigits, SMP, SMPK, bringup, prose, fmt, fmtKind, say };
});
