/* What a drive is made of: the page's models. Each implements a named, published result; constants that are
   tuned (chosen, not taken from a source) are marked TUNED here and flagged on the page.
   UMD: window.DriveModels in the browser, module.exports in node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.DriveModels = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

  /* ── 01 blocks and addresses: logical 512-byte sectors on 4096-byte physical sectors (Advanced Format, "512e").
     A 4 KiB file-system write at partition offset k·8 lands on LBA S + 8k. If S is not a multiple of 8 the write
     straddles two physical sectors, and each must be read, patched and rewritten (read-modify-write).
     Sector 63 was the old DOS/MBR default start; 2048 (1 MiB) is the modern default (Thomas-Krenn; Dell WP27). */
  const sector = {
    LOG: 512, PHYS: 4096, PER: 8,
    write(start, kib) { // start: first LBA of the write; kib: length in KiB (multiple of 0.5)
      const n = Math.round(kib * 2), a = start, b = start + n - 1;
      const p0 = Math.floor(a / this.PER), p1 = Math.floor(b / this.PER), touched = p1 - p0 + 1;
      let partial = 0;
      for (let p = p0; p <= p1; p++) { const lo = Math.max(a, p * this.PER), hi = Math.min(b, p * this.PER + this.PER - 1); if (hi - lo + 1 < this.PER) partial++; }
      const asked = n * this.LOG, written = touched * this.PHYS, read = partial * this.PHYS;
      return { touched, partial, asked, written, read, rmw: partial > 0, p0, p1 };
    },
    // a partition starting at `offset` writes 4 KiB clusters: is every cluster aligned?
    aligned(offset) { return offset % this.PER === 0; }
  };

  /* ── 02 platters and heads. Seek time vs distance: the Ruemmler & Wilkes (1994, IEEE Computer 27(3):17) form —
     square root of distance for short seeks (constant acceleration), linear for long seeks (coast). Their HP 97560
     fit (Table 2): 3.24 + 0.400·√d ms for d ≤ 383 cylinders, 8.00 + 0.008·d ms beyond, 1,962 cylinders.
     A modern drive is that shape rescaled in time, seek(x) = A + B·f97(x·1962) for x = fraction of full stroke,
     with A and B TUNED so that a single-track seek is 1.0 ms and the Seagate-style average (random pairs of tracks,
     distance density 2(1−x)) is 8.5 ms read — Seagate Barracuda 7200.12 product manual 100529369 rev C (2009).
     Rotational latency: half a revolution on average = 30000/rpm ms. Sequential rate at radius r with constant
     linear density (zoned recording): rate ∝ r. Outer-edge rate 249 MB/s: Seagate Enterprise Capacity 3.5 HDD 8 TB,
     7,200 rpm (data sheet DS1882). TUNED: inner/outer data radius 0.5 (not published). */
  const disk = {
    RW: { a: 3.24, b: 0.400, c: 8.00, e: 0.008, cut: 383, N: 1962 },
    T2T: 1.0, AVG: 8.5, OD: 249, RHO: 0.5, RPM: 7200, KB4: 4096,
    f97(d) { const R = this.RW; d = Math.max(1, d); return d <= R.cut ? R.a + R.b * Math.sqrt(d) : R.c + R.e * d; },
    // ∫_0^s g(x)·2(s−x)/s² dx by Simpson (the average over random pairs inside a span s of the stroke)
    meanOver(g, s) { const n = 2000, h = s / n; let acc = 0; for (let i = 0; i <= n; i++) { const x = i * h, w = (i === 0 || i === n) ? 1 : (i % 2 ? 4 : 2); acc += w * g(x) * 2 * (s - x) / (s * s); } return acc * h / 3; },
    _fit: null,
    fit() {
      if (this._fit) return this._fit;
      const t1 = this.f97(1), m = this.meanOver(x => this.f97(x * this.RW.N), 1);
      const B = (this.AVG - this.T2T) / (m - t1), A = this.T2T - B * t1;
      return (this._fit = { A, B });
    },
    seek(x) { const { A, B } = this.fit(); return x <= 0 ? 0 : A + B * this.f97(x * this.RW.N); },
    avgSeek(span) { return this.meanOver(x => this.seek(x), clamp(span, 1e-4, 1)); },
    full() { return this.seek(1); },
    rot(rpm) { return 30000 / rpm; },          // ms, average
    rev(rpm) { return 60000 / rpm; },          // ms, one full revolution
    odRate(rpm) { return this.OD * rpm / this.RPM; },               // MB/s at the outer edge; same platter, faster spin
    rateAt(c, rpm) { const r2 = 1 - c * (1 - this.RHO * this.RHO); return this.odRate(rpm) * Math.sqrt(r2); }, // c = fraction of capacity from LBA 0 (outer edge)
    idRate(rpm) { return this.odRate(rpm) * this.RHO; },
    meanSeq(rpm) { return this.odRate(rpm) * (1 + this.RHO) / 2; },  // one revolution per track, tracks evenly spaced in r
    trackMB(rpm) { return this.odRate(rpm) / (rpm / 60); },          // MB on one outer track
    random(rpm, span) {
      const s = this.avgSeek(span), r = this.rot(rpm), x = this.KB4 / (this.meanSeq(rpm) * 1e6) * 1000;
      const t = s + r + x; return { seek: s, rot: r, xfer: x, t, iops: 1000 / t, seekShare: s / t };
    }
  };

  /* ── 03 shingled recording. Conventional tracks are one write-head width W apart; shingled tracks are written at a
     pitch q·W (q < 1), each overlapping the last, in bands of B tracks with a full-width last track
     (zonedstorage.io: "the next track partially overwrites the previous one"). Capacity gain over conventional for
     the same head: B / ((B−1)q + 1). Updating track k of a band in place means rewriting tracks k…B; for a random k
     the mean is (B+1)/2 tracks. Each rewritten track costs one revolution to read and one to write (ch2 rpm).
     TUNED/illustrative: q and B are sliders; real band sizes are set by firmware and not published per drive. */
  const smr = {
    gain(B, q) { return B / ((B - 1) * q + 1); },
    maxGain(q) { return 1 / q; },
    meanRewrite(B) { return (B + 1) / 2; },
    update(B, q, rpm) {
      const tracks = this.meanRewrite(B), ms = tracks * 2 * disk.rev(rpm), mb = tracks * disk.trackMB(rpm);
      return { tracks, ms, mb, gain: this.gain(B, q), cmrMs: disk.rev(rpm), slow: ms / disk.rev(rpm) };
    }
  };

  /* ── 04 flash cell levels. n bits per cell → L = 2ⁿ threshold-voltage states spread evenly over the same window;
     each state is Gaussian with standard deviation σ (the AWGN channel model of Cai et al. 2017, Proc. IEEE 105:1666,
     §6.2). Read references sit midway between neighbours, so a cell is misread into a neighbour with probability
     Q(Δ/2σ) on each inner side, Δ = window/(L−1). With Gray coding a neighbour error flips one of the n bits:
       RBER = 2(L−1)/L · Q(Δ/2σ) / n.
     Wear: σ(N) = σ0 + k·N after N program/erase cycles (linear widening). TUNED: window 6 V (illustrative), and σ0, k
     solved so that, with the ch5 default ECC, MLC lasts 3,000 cycles and TLC 1,000 — Cai et al. 2017 §1/§3 for
     1x-nm planar MLC and TLC. SLC, QLC and PLC are then the model's predictions. */
  function erfc(x) { // Numerical Recipes erfcc, |error| < 1.2e-7 relative
    const z = Math.abs(x), t = 1 / (1 + 0.5 * z);
    const r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
    return x >= 0 ? r : 2 - r;
  }
  const Q = x => 0.5 * erfc(x / Math.SQRT2);
  // inverse of Q on (0, 0.5) by bisection
  function Qinv(p) { let lo = 0, hi = 40; for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (Q(m) > p) lo = m; else hi = m; } return (lo + hi) / 2; }
  const cell = {
    WIN: 6, NAMES: ['slc', 'mlc', 'tlc', 'qlc', 'plc'],
    CAL: { mlc: 3000, tlc: 1000 },
    levels(n) { return Math.pow(2, n); },
    delta(n) { return this.WIN / (this.levels(n) - 1); },
    rber(n, sigma) { const L = this.levels(n); return 2 * (L - 1) / L * Q(this.delta(n) / (2 * sigma)) / n; },
    // the widest σ for which RBER stays at or below p
    sigmaMax(n, p) { const L = this.levels(n), q = p * n * L / (2 * (L - 1)); return this.delta(n) / (2 * Qinv(q)); },
    _w: {},
    wear(p) { // σ0 and k from the two calibration points, for an ECC limit p
      const key = String(p); if (this._w[key]) return this._w[key];
      const s2 = this.sigmaMax(2, p), s3 = this.sigmaMax(3, p), k = (s2 - s3) / (this.CAL.mlc - this.CAL.tlc), s0 = s3 - k * this.CAL.tlc;
      return (this._w[key] = { s0, k });
    },
    sigma(N, w) { return w.s0 + w.k * N; },
    // cycles until RBER passes the ECC limit p (0 if it fails when new)
    endurance(n, p, w) { const sm = this.sigmaMax(n, p); return Math.max(0, (sm - w.s0) / w.k); },
    // density of the Vth distribution at v (for drawing)
    pdf(n, v, sigma) { const L = this.levels(n), d = this.delta(n); let s = 0; for (let i = 0; i < L; i++) { const z = (v - i * d) / sigma; s += Math.exp(-z * z / 2); } return s / (L * sigma * Math.sqrt(2 * Math.PI)); }
  };

  /* ── 05 ECC and wear-out. A BCH code over GF(2^14) protecting k = 8,192 data bits (1 KiB) with t correctable bits
     needs 14·t parity bits, so l = k + 14t. Codeword failure (Cai et al. 2017 Eq. 1, independent errors):
       P_fail = Σ_{j=t+1}^{l} C(l,j) p^j (1−p)^{l−j}.
     Uncorrectable bit error rate ≈ P_fail·(t+1)/k (a failed word has at least t+1 wrong bits). Targets: 10⁻¹⁵ for
     client and 10⁻¹⁶ for enterprise drives (JESD218 via Cai 2017 and a 2011 JEDEC slide; standard not opened).
     Lifetime (Cai et al. 2017 Eq. 4, no compression): years = PEC·(1+OP) / (365·DWPD·WA).
     Retention vs temperature: Arrhenius acceleration AF = exp(Ea/k·(1/T1 − 1/T2)); Ea is a slider because no
     value was read in a primary source. */
  function logBinomTail(l, t, p) { // log of P(X > t), X ~ Bin(l, p), summed in log space
    const lp = Math.log(p), lq = Math.log1p(-p);
    let lc = 0; for (let j = 1; j <= t + 1; j++) lc += Math.log((l - j + 1) / j);
    let best = -Infinity; const terms = [];
    for (let j = t + 1; j <= l; j++) { const v = lc + j * lp + (l - j) * lq; terms.push(v); if (v > best) best = v; if (v < best - 60) break; lc += Math.log((l - j) / (j + 1)); }
    let s = 0; for (const v of terms) s += Math.exp(v - best); return best + Math.log(s);
  }
  const ecc = {
    // ASSUMPTION: the spare area of a consumer drive taken as the GiB/GB difference, 2^30/10^9 − 1 ≈ 7.4%
    OP: Math.pow(2, 30) / 1e9 - 1,
    K: 8192, M: 14, T: 40, UBER: { client: 1e-15, ent: 1e-16 },
    len(t) { return this.K + this.M * t; },
    rate(t) { return this.K / this.len(t); },
    uber(p, t) { return Math.exp(logBinomTail(this.len(t), t, p)) * (t + 1) / this.K; },
    // the highest raw bit error rate that still meets the target
    limit(t, target) { let lo = -9, hi = -0.5; for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (this.uber(Math.pow(10, m), t) <= target) lo = m; else hi = m; } return Math.pow(10, lo); },
    years(pec, op, dwpd, wa) { return pec * (1 + op) / (365 * dwpd * wa); },
    fullWrites(pec, op, wa) { return pec * (1 + op) / wa; },
    dwpd(tbw, capTB, years) { return tbw / (capTB * 365 * years); },
    af(Ea, c1, c2) { const k = 8.617333262e-5, T1 = c1 + 273.15, T2 = c2 + 273.15; return Math.exp(Ea / k * (1 / T1 - 1 / T2)); },
    // endurance of each cell type for a given t and target
    table(t, target) { const p = this.limit(t, target), w = cell.wear(this.limit(this.T, this.UBER.client)); return [1, 2, 3, 4, 5].map(n => ({ n, pe: cell.endurance(n, p, w) })); }
  };
  ecc.P0 = null; // default ECC limit, filled below
  ecc.P0 = ecc.limit(ecc.T, ecc.UBER.client);
  const W0 = cell.wear(ecc.P0);

  /* ── 06 a tiny flash translation layer: page-mapped, log-structured, greedy garbage collection.
     8 blocks × 4 pages = 32 physical pages hold 24 logical pages (over-provisioning (32−24)/24 = 1/3, Cai Eq. 5).
     A write goes to the next free page of the open block; the old copy is marked invalid. When only one free block
     is left, the block with the fewest valid pages is copied out and erased (greedy victim choice). */
  function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function FTL(opts) {
    const o = Object.assign({ blocks: 8, pages: 4, lbas: 24 }, opts || {});
    this.B = o.blocks; this.P = o.pages; this.N = o.lbas;
    this.reset();
  }
  FTL.prototype.reset = function () {
    this.pg = []; for (let b = 0; b < this.B; b++) { const row = []; for (let p = 0; p < this.P; p++) row.push({ s: 'free', lba: -1 }); this.pg.push(row); }
    this.map = new Array(this.N).fill(null); this.erases = new Array(this.B).fill(0);
    this.open = 0; this.next = 0; this.host = 0; this.nand = 0; this.gcRuns = 0; this.moved = 0; this.last = null;
  };
  FTL.prototype.freeBlocks = function () { const out = []; for (let b = 0; b < this.B; b++) if (b !== this.open && this.pg[b].every(x => x.s === 'free')) out.push(b); return out; };
  FTL.prototype.valid = function (b) { return this.pg[b].filter(x => x.s === 'valid').length; };
  FTL.prototype._place = function (lba) {
    if (this.next >= this.P) { const f = this.freeBlocks(); this.open = f[0]; this.next = 0; }
    const old = this.map[lba]; if (old) this.pg[old.b][old.p].s = 'invalid';
    this.pg[this.open][this.next] = { s: 'valid', lba }; this.map[lba] = { b: this.open, p: this.next }; this.next++; this.nand++;
  };
  FTL.prototype._gc = function () {
    // keep one spare block for collection: collect while the open block is full and only one free block is left
    let guard = 0;
    while (this.freeBlocks().length <= 1 && this.next >= this.P && guard++ < 20) {
      let v = -1, best = Infinity;
      for (let b = 0; b < this.B; b++) { if (b === this.open) continue; const st = this.pg[b]; if (st.every(x => x.s === 'free')) continue; const n = this.valid(b); if (n < best) { best = n; v = b; } }
      if (v < 0 || best >= this.P) break;
      const keep = this.pg[v].filter(x => x.s === 'valid').map(x => x.lba);
      for (const lba of keep) { this._place(lba); this.moved++; }
      for (let p = 0; p < this.P; p++) this.pg[v][p] = { s: 'free', lba: -1 };
      this.erases[v]++; this.gcRuns++;
    }
  };
  FTL.prototype.write = function (lba) { this._gc(); this._place(lba); this.host++; this.last = lba; };
  FTL.prototype.waf = function () { return this.host ? this.nand / this.host : 0; };
  FTL.prototype.counts = function () { let v = 0, inv = 0, fr = 0; for (const row of this.pg) for (const x of row) { if (x.s === 'valid') v++; else if (x.s === 'invalid') inv++; else fr++; } return { valid: v, invalid: inv, free: fr }; };
  FTL.prototype.snapshot = function () { return JSON.stringify({ pg: this.pg, map: this.map, open: this.open, next: this.next, host: this.host, nand: this.nand }); };
  const ftl = {
    FTL, rng, SEED: 7,
    // rows in a page-level map for a drive of `bytes`, one row per 4 KiB
    mapRows(bytes) { return bytes / 4096; },
    // the page's starting state: all 24 logical pages written in order, then three random overwrites
    start() { const f = new FTL(), r = rng(this.SEED); for (let i = 0; i < f.N; i++) f.write(i); for (let i = 0; i < 3; i++) f.write(Math.floor(r() * f.N)); f.r = r; f.host0 = f.host; f.nand0 = f.nand; return f; },
    // the reader's random writes after the start
    randomRun(n, seed) { const f = this.start(); const r = rng(seed == null ? 11 : seed); for (let i = 0; i < n; i++) f.write(Math.floor(r() * f.N)); return f; }
  };

  /* ── 07 the layer map: walk the layers from the outside in and report the first one where drive and slot disagree.
     Layers: form factor, connector/key, electrical lanes (physical + link), transport, command set.
     Sources: SATA-IO (SATA 6 Gb/s, 2009); SAS backplanes take SATA drives but SATA ports reject SAS drives (connector
     key, SFF-8482); M.2 keys and slot wiring (secondary sources; PCI-SIG M.2 spec not opened); U.2 is SFF-8639;
     EDSFF E1.S is SFF-TA-1006 on the SFF-TA-1002 edge connector, PCIe only (secondary). */
  const L = ['ff', 'conn', 'lane', 'xport', 'cmd'];
  const DRIVES = {
    hdd35: { ff: '35', conn: 'sata', lane: 'sata', xport: 'sata', cmd: 'ata' },
    ssd25: { ff: '25', conn: 'sata', lane: 'sata', xport: 'sata', cmd: 'ata' },
    m2sata: { ff: 'm2', conn: 'bm', lane: 'sata', xport: 'sata', cmd: 'ata' },
    m2nvme: { ff: 'm2', conn: 'm', lane: 'pcie4', xport: 'pcie', cmd: 'nvme' },
    u2: { ff: '25', conn: 'sff8639', lane: 'pcie4', xport: 'pcie', cmd: 'nvme' },
    sas25: { ff: '25', conn: 'sas', lane: 'sas', xport: 'sas', cmd: 'scsi' },
    e1s: { ff: 'e1s', conn: 'edsff', lane: 'pcie4', xport: 'pcie', cmd: 'nvme' }
  };
  // what each slot accepts at each layer
  const SLOTS = {
    sataPort: { ff: ['35', '25'], conn: ['sata'], lane: ['sata'], xport: ['sata'], cmd: ['ata'] },
    m2pcie: { ff: ['m2'], conn: ['m', 'bm'], lane: ['pcie4'], xport: ['pcie'], cmd: ['nvme'] },
    m2both: { ff: ['m2'], conn: ['m', 'bm'], lane: ['pcie4', 'sata'], xport: ['pcie', 'sata'], cmd: ['nvme', 'ata'] },
    sasBay: { ff: ['35', '25'], conn: ['sas', 'sata'], lane: ['sas', 'sata'], xport: ['sas', 'sata'], cmd: ['scsi', 'ata'] },
    u2bay: { ff: ['25'], conn: ['sff8639', 'sas', 'sata'], lane: ['pcie4'], xport: ['pcie'], cmd: ['nvme'] },
    usbSata: { ff: ['25'], conn: ['sata'], lane: ['sata'], xport: ['sata'], cmd: ['ata'], bridge: true },
    usbNvme: { ff: ['m2'], conn: ['m', 'bm'], lane: ['pcie4'], xport: ['pcie'], cmd: ['nvme'], bridge: true },
    e1sBay: { ff: ['e1s'], conn: ['edsff'], lane: ['pcie4'], xport: ['pcie'], cmd: ['nvme'] }
  };
  const map = {
    LAYERS: L, DRIVES, SLOTS,
    check(d, s) {
      const D = DRIVES[d], S = SLOTS[s], rows = [];
      let fail = null;
      for (const k of L) { const ok = S[k].includes(D[k]); rows.push({ k, v: D[k], ok: fail ? null : ok }); if (!ok && !fail) fail = k; }
      // a SAS/U.2 bay that physically takes a SATA drive talks SATA to it (SATA tunnelled by the SAS host; STP)
      return { ok: !fail, fail, rows, bridge: !!S.bridge, key: fail ? 'fail.' + fail : S.bridge ? 'ok.bridge' : (s === 'sasBay' && D.cmd === 'ata') ? 'ok.stp' : 'ok' };
    },
    matrix() { const out = {}; for (const d of Object.keys(DRIVES)) for (const s of Object.keys(SLOTS)) out[d + '|' + s] = this.check(d, s).ok; return out; }
  };

  /* ── 08 end to end: time for one read of size S = access latency + S / bandwidth (the latency–bandwidth model,
     Hennessy & Patterson). HDD: ch2 model at 7,200 rpm (random access; mean sequential rate over the platter).
     SSDs: the manufacturers' own measured QD1 4 KB random-read IOPS and sequential reads (latency = 1/IOPS):
     Samsung 870 EVO (SATA, data sheet rev 1.1): 13,000 IOPS, 560 MB/s; Samsung 990 PRO 1 TB (PCIe 4.0 ×4 NVMe,
     data sheet rev 1.0): 22K IOPS, 7,450 MB/s. These include the host's software stack on the test system. */
  const e2e = {
    DEV: {
      hdd: { lat: null, bw: null },
      sata: { iops: 13000, bw: 560 },
      nvme: { iops: 22000, bw: 7450 }
    },
    lat(id) { return id === 'hdd' ? disk.random(7200, 1).t / 1000 : 1 / this.DEV[id].iops; },   // seconds
    bw(id) { return id === 'hdd' ? disk.meanSeq(7200) : this.DEV[id].bw; },                     // MB/s
    time(id, bytes) { const l = this.lat(id), x = bytes / (this.bw(id) * 1e6); return { t: l + x, lat: l, xfer: x, latShare: l / (l + x) }; },
    // the size at which latency and transfer take equal time
    cross(id) { return this.lat(id) * this.bw(id) * 1e6; }
  };

  /* ── 09 frontier facts (as of November 2026). status: est = established standard/physics, demo = shipping or
     demonstrated by the company named, claim = roadmap or report, not independently confirmed. */
  const FRONTIER = [
    { id: 'seagate', status: 'demo', date: '2026-03-03', v: { tb: 44, perDisk: 4, goalDisk: 10, goalTb: 100 } },
    { id: 'wd', status: 'claim', date: '2026-02-03', v: { tb: 40, volumeYear: 2026, hamrRamp: 2027, goalTb: 100, goalYear: 2029 } },
    { id: 'micron', status: 'demo', date: '2026-05-05', v: { tb: 245, kioxiaTb: 245.76, kioxiaDate: '2025-07' } },
    { id: 'hynix', status: 'demo', date: '2025-08-25', v: { layers: 321, tbit: 2 } },
    { id: 'samsung', status: 'claim', date: '2026-08-05', v: { layers: 400 } },
    { id: 'plc', status: 'claim', date: '2026-11', v: { solidigmYear: 2022, hynixIedm: '2025-12' } }
  ];

  /* ── number formatting shared by the page and the node test (same digits in zh and en; no 万/亿) */
  function fmt(x, d) {
    d = d || 0; if (!isFinite(x)) return '—';
    const v = Math.abs(x) < 0.5 * Math.pow(10, -d) ? 0 : x;
    return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  }
  const sig = x => fmt(x, x >= 100 ? 0 : x >= 10 ? 1 : x >= 1 ? 2 : 3);
  // powers of ten written as 1.2 × 10⁻³ (superscripts; no ^ notation)
  const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
  function sci(x, d) {
    if (!(x > 0)) return '0';
    let e = Math.floor(Math.log10(x)), m = x / Math.pow(10, e); d = d == null ? 1 : d;
    if (+m.toFixed(d) >= 10) { m /= 10; e += 1; }
    if (e >= -2 && e <= 3) return sig(x);
    return m.toFixed(d) + ' × 10' + String(e).split('').map(c => SUP[c]).join('');
  }
  // a duration in seconds → [value, unit key]
  function dur(s) {
    if (s < 1e-3) return [fmt(s * 1e6, s * 1e6 < 10 ? 1 : 0), 'us'];
    if (s < 1) return [fmt(s * 1e3, s * 1e3 < 100 ? 1 : 0), 'ms'];
    return [fmt(s, s < 10 ? 2 : 1), 's'];
  }
  // a size in bytes → [value, unit key] (binary prefixes as the slider uses powers of two)
  function size(b) {
    const one = (x) => fmt(x, x < 10 && Math.abs(x - Math.round(x)) > 1e-9 ? 1 : 0);
    if (b >= 1 << 30) return [one(b / (1 << 30)), 'GiB'];
    if (b >= 1 << 20) return [one(b / (1 << 20)), 'MiB'];
    return [one(b / 1024), 'KiB'];
  }

  /* ── the live sentences: which template, and with which values. Values are strings, or {k: copy key};
     the page and the node test resolve them the same way. */
  const say = {
    sector(offset) {
      const w = sector.write(offset, 4), v = { o: fmt(offset), t: fmt(w.touched), r: fmt(w.read / 1024), wr: fmt(w.written / 1024), rev: fmt(disk.rev(7200), 1) };
      return { key: w.rmw ? 'ch1.say.rmw' : 'ch1.say.ok', v };
    },
    disk(rpm, span) {
      const r = disk.random(rpm, span), v = { rpm: fmt(rpm), s: fmt(r.seek, 1), r: fmt(r.rot, 2), t: fmt(r.t, 1), i: fmt(r.iops), sh: fmt(r.seekShare * 100), span: fmt(span * 100) };
      if (span >= 0.999) return { key: 'ch2.say.full', v };
      return { key: r.seekShare >= 0.5 ? 'ch2.say.shortSeek' : 'ch2.say.shortRot', v };
    },
    smr(B, q) {
      const u = smr.update(B, q, 7200), v = { B: fmt(B), g: fmt((u.gain - 1) * 100), gm: fmt((smr.maxGain(q) - 1) * 100), tr: fmt(u.tracks, 1), ms: fmt(u.ms), x: fmt(u.slow), mb: fmt(u.mb) };
      if (B === 1) return { key: 'ch3.say.one', v };
      return { key: u.gain >= 0.97 * smr.maxGain(q) ? 'ch3.say.sat' : 'ch3.say', v };
    },
    cell(n, N) {
      const s = cell.sigma(N, W0), r = cell.rber(n, s), p = ecc.P0, v = { n: { k: 'cell.' + cell.NAMES[n - 1] }, L: fmt(cell.levels(n)), N: fmt(N), r: sci(r), lim: sci(p), mv: fmt(cell.delta(n) * 1000) };
      if (r > 0.05) return { key: 'ch4.say.mush', v };
      return { key: r > p ? 'ch4.say.over' : 'ch4.say.ok', v };
    },
    ecc(t, cls) {
      const target = ecc.UBER[cls], p = ecc.limit(t, target), tb = ecc.table(t, target), v = { t: fmt(t), lim: sci(p), rate: fmt(ecc.rate(t) * 100, 1), tlc: fmt(tb[2].pe), qlc: fmt(tb[3].pe), plc: fmt(tb[4].pe) };
      return { key: tb[3].pe <= 0 ? 'ch5.say.noQlc' : 'ch5.say', v };
    },
    life(n, dwpd, wa) {
      const pe = cell.endurance(n, ecc.P0, W0), y = ecc.years(pe, ecc.OP, dwpd, wa), v = { n: { k: 'cell.' + cell.NAMES[n - 1] }, pe: fmt(pe), y: y >= 10 ? fmt(y) : fmt(y, 1), d: fmt(dwpd, 2), wa: fmt(wa, 1) };
      if (pe <= 0) return { key: 'ch5.say.life0', v };
      return { key: y >= 5 ? 'ch5.say.lifeLong' : 'ch5.say.lifeShort', v };
    },
    ftl(f) {
      const c = f.counts(), dh = f.host - f.host0, dn = f.nand - f.nand0, v = { h: fmt(dh), n: fmt(dn), w: dh ? fmt(dn / dh, 2) : '—', g: fmt(f.gcRuns), m: fmt(f.moved), inv: fmt(c.invalid) };
      if (!dh) return { key: 'ch6.say.start', v };
      return { key: f.gcRuns ? 'ch6.say.gc' : 'ch6.say.nogc', v };
    },
    map(d, s) { const r = map.check(d, s); return { key: 'ch7.say.' + r.key, v: { d: { k: 'ch7.d.' + d }, s: { k: 'ch7.s.' + s }, l: r.fail ? { k: 'ch7.layer.' + r.fail } : '' } }; },
    e2e(bytes) {
      const h = e2e.time('hdd', bytes), a = e2e.time('sata', bytes), n = e2e.time('nvme', bytes), [sv, su] = size(bytes);
      const v = { s: sv, su: { k: 'unit.' + su }, x1: fmt(h.t / a.t, h.t / a.t < 10 ? 1 : 0), x2: fmt(h.t / n.t, h.t / n.t < 10 ? 1 : 0), hl: fmt(h.latShare * 100, h.latShare > 0.99 || h.latShare < 0.01 ? 1 : 0) };
      return { key: h.latShare >= 0.5 ? 'ch8.say.lat' : 'ch8.say.bw', v };
    }
  };

  return { clamp, sector, disk, smr, Q, Qinv, erfc, cell, ecc, W0, ftl, map, e2e, FRONTIER, fmt, sig, sci, dur, size, say };
});
