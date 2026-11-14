/* Storage over a network: the page's models. Each one implements the text of a standard, a published
   measurement or a named textbook result; constants that are tuned (not taken from a source) are marked TUNED
   here and flagged on the page. UMD: window.NetStoreModels in the browser, module.exports in node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.NetStoreModels = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const KiB = 1024, MiB = 1024 * 1024;

  /* ── Figures quoted from standards and primary documents. Every prose figure that comes from a document
     lives here, so the node test can pin it. Sources and the dates they were opened are in BRIEF.md. ── */
  const SPEC = {
    // RFC 7143 (iSCSI, consolidated), April 2014: §11.2.1 BHS is 48 bytes; §13.1 digests are CRC32C (4 bytes),
    // default None; §13.10–13.17 defaults; §4.2.7.4 iqn names; IANA: iscsi-target 3260/tcp.
    smbPort: 445,   // IANA microsoft-ds 445/tcp
    iscsi: { rfc: 7143, rfcDate: '2014-04', bhs: 48, digest: 4, port: 3260,
      InitialR2T: true, ImmediateData: true, MRDSL: 8192, MaxBurst: 262144, FirstBurst: 65536, MaxOutR2T: 1,
      maxLen: 16777215, iqnExample: 'iqn.2001-04.com.example:storage.disk2.sys1.xyz' },
    // NVM Express TCP Transport Specification Rev 1.1 (2024-08-05): Figure 25 common header 8 bytes;
    // Figure 30 CapsuleCmd HLEN 72; Figure 31 CapsuleResp HLEN 24; Figures 32/33/34 H2CData, C2HData, R2T HLEN 24;
    // Figure 26 ICReq 128; §3.3.1.1 digests 4 bytes; C2HData SUCCESS flag (no response capsule);
    // Figure 11 SQE 64 bytes, CQE 16 bytes. IANA: nvme 4420, nvme-disc 8009.
    nvmeTcp: { rev: '1.1', date: '2024-08-05', ch: 8, cmd: 72, rsp: 24, data: 24, r2t: 24, icreq: 128, digest: 4,
      sqe: 64, cqe: 16, port: 4420, disc: 8009 },
    // RoCE v2 per-packet headers (Linux include/rdma/ib_pack.h and drivers/infiniband/sw/rxe/rxe_hdr.h):
    // Ethernet 14, IPv4 20, UDP 8, BTH 12, RETH 16, AETH 4, ICRC 4; Ethernet FCS 4; IANA roce 4791/udp (2014-10-17).
    roce: { eth: 14, ip4: 20, udp: 8, bth: 12, reth: 16, aeth: 4, icrc: 4, fcs: 4, port: 4791, portDate: '2014-10-17', mtu: 4096 },
    // TCP/IPv4 over Ethernet: Ethernet header 14 + FCS 4, IPv4 20, TCP 20 + timestamps option 12; preamble/SFD 8
    // and minimum inter-frame gap 12 (IEEE 802.3). MSS = MTU − 20 − 20 − 12.
    eth: { hdr: 14, fcs: 4, pre: 8, ifg: 12, ip4: 20, tcp: 20, ts: 12 },
    // Fibre Channel frame (FC-FS, as quoted by secondary sources; standard not opened): SOF 4, header 24,
    // data field up to 2112, CRC 4, EOF 4 → 2148 bytes; six idle words (24 bytes) between frames.
    fc: { sof: 4, hdr: 24, crc: 4, eof: 4, payloadMax: 2112, frameMax: 2148, idle: 24,
      // FCIA speedmap throughputs (MB/s per direction) as tabulated on Wikipedia "Fibre Channel" (opened 2026-11-14);
      // T11 spec years and first market availability from the same table.
      gens: [
        { g: 1, MBps: 100, spec: 1996, mkt: 1997 }, { g: 2, MBps: 200, spec: 2000, mkt: 2001 },
        { g: 4, MBps: 400, spec: 2003, mkt: 2005 }, { g: 8, MBps: 800, spec: 2006, mkt: 2008 },
        { g: 16, MBps: 1600, spec: 2009, mkt: 2011 }, { g: 32, MBps: 3200, spec: 2013, mkt: 2016 },
        { g: 64, MBps: 6400, spec: 2017, mkt: 2020 }, { g: 128, MBps: 12425, spec: 2022, mkt: 2025 }
      ] },
    // light in silica fibre: group index about 1.47 → 4.90 µs per km one way (c = 299 792.458 km/s)
    fibreIndex: 1.47, c: 299792.458,
    // Linux nfs(5): attribute cache defaults (seconds); cto is the default
    nfs: { acregmin: 3, acregmax: 60, acdirmin: 30, acdirmax: 60 },
    // Linux kernel defaults: drivers/nvme/host/fabrics.h (ctrl_loss_tmo 600 s, reconnect_delay 10 s,
    // fast_io_fail_tmo off), drivers/nvme/host/nvme.h (keep-alive 5 s); open-iscsi etc/iscsid.conf
    // (replacement_timeout 120 s, NOP-Out every 5 s with a 5 s timeout). kaPeriod: drivers/nvme/host/core.c
    // nvme_keep_alive_work_period() sends a Keep Alive every kato/2 (NVMe 1.4 §7.12.1), halved again with TBKAS.
    linux: { kato: 5, kaPeriod: 2.5, ctrlLoss: 600, reconnect: 10, iscsiRepl: 120, noopInt: 5, noopTmo: 5, nvmeTcpSince: '5.0', nvmeTcpSinceDate: '2019-03-03' },
    // Backblaze Drive Stats for 2025 (published 2026-02-12): 4,317 failures in 115,638,676 drive days
    bb: { failures: 4317, driveDays: 115638676, afrQuoted: 1.36, published: '2026-02-12' },
    // XORing Elephants (Sathiamoorthy et al., PVLDB 2013): Facebook HDFS RS(10,4), repair transfers 10 blocks
    rs104: { k: 10, m: 4, repairLo: 10, repairHi: 20, clusterPBday: 2, nodes: 3000 }
  };

  /* ── the page's default control values (the prose quotes several of them) ── */
  const DEFAULTS = {
    lv: { k: 1, S: 8 * MiB, cached: false },
    nas: { N: 1000, s: 64, rtt: 0.5, k: 3, P: 1, g: 1, rttFar: 30, Pfar: 16 },
    is: { W: MiB, rtt: 0.1, g: 10, prof: 'rfc', rttFar: 10 },
    fc: { g: 16, km: 50, cr: 40, pl: 2112 },
    bd: { m: 'nand', t: 'tcpKernel', km: 0, hops: 0 },
    ls: { p: 1e-3, g: 100, rtt: 20, rttFar: 200 },
    cp: { t: 'tcp', o: 'read', icd: true, s: 4096 },
    mp: { lam: 80, mu1: 100, ratio: 0.5, lamLow: 20, lamSafe: 45 },   // thousands of requests per second,
    ec: { s: 'rs104', mttr: 24 }
  };

  /* ── 01 one small change at three levels. Block level: the client's file system writes whole blocks (and
     reads the block first if it is only partly changed and not cached). File level: an NFS/SMB WRITE carries
     the changed bytes; the server does the block work. Object level: S3-style PUT replaces the whole object
     (there is no partial overwrite), so the client sends the full object, after fetching it if not cached. ── */
  const LEVEL = {
    block: 4096,
    cost(k, S, cached) {
      const B = LEVEL.block, nb = Math.ceil(k / B), partial = k % B !== 0;
      const rd = partial && !cached ? B : 0;
      const block = { bytes: nb * B + rd, rt: 1 + (rd ? 1 : 0) };
      const file = { bytes: k, rt: 1 };
      const object = { bytes: S + (cached ? 0 : S), rt: cached ? 1 : 2 };
      for (const o of [block, file, object]) o.amp = o.bytes / k;
      return { block, file, object };
    }
  };

  /* ── 02 many small files over a file protocol. Each file costs k round trips of metadata/data requests plus its
     transfer time; with P files in flight, asymptotic bounds of operational analysis (Lazowska et al. 1984, ch. 5):
     X = min(P / D, B / s) files per second, D = k·RTT + s/B. One big file of the same total: k·RTT + N·s/B. ── */
  const NAS = {
    run(N, sKiB, rttMs, k, P, gbps) {
      const B = gbps * 1e9 / 8, s = sKiB * KiB, rtt = rttMs / 1000;
      const D = k * rtt + s / B, X = Math.min(P / D, B / s), T = N / X;
      const big = k * rtt + N * s / B;
      const mbps = N * s / T / 1e6, linkMBps = B / 1e6;
      const bound = P / D <= B / s ? 'rtt' : 'bw';
      return { D, X, T, big, ratio: T / big, mbps, linkMBps, util: mbps / linkMBps, bound, sStar: k * rtt * B / P / KiB };
    }
  };

  /* ── 03 one iSCSI write (RFC 7143 §13.10–13.17): unsolicited data is the immediate data in the command PDU
     (≤ min(FirstBurstLength, MaxRecvDataSegmentLength)), plus, if InitialR2T=No, Data-Out PDUs up to
     FirstBurstLength. The rest waits for R2Ts, each soliciting up to MaxBurstLength; with MaxOutstandingR2T=1
     each R2T is one round trip. Every PDU carries a 48-byte BHS; data segments ≤ MRDSL. TCP/IP/Ethernet
     overhead is added per MSS-sized segment. Time = round trips × RTT + bytes on the wire / link rate. ── */
  function tcpWire(bytes, mtu) {
    const E = SPEC.eth, mss = mtu - E.ip4 - E.tcp - E.ts, per = E.hdr + E.fcs + E.pre + E.ifg + E.ip4 + E.tcp + E.ts;
    const pk = Math.max(1, Math.ceil(bytes / mss));
    return { pk, wire: bytes + pk * per, mss, per };
  }
  const PROFILES = {
    rfc: { InitialR2T: true, ImmediateData: true, FirstBurst: 65536, MaxBurst: 262144, MRDSL: 8192 },
    noimm: { InitialR2T: true, ImmediateData: false, FirstBurst: 65536, MaxBurst: 262144, MRDSL: 8192 },
    unsol: { InitialR2T: false, ImmediateData: true, FirstBurst: 262144, MaxBurst: 262144, MRDSL: 262144 },
    big: { InitialR2T: false, ImmediateData: true, FirstBurst: 16777215, MaxBurst: 16777215, MRDSL: 262144 }
  };
  const ISCSI = {
    PROFILES,
    write(W, rttMs, gbps, prof, mtu) {
      const o = PROFILES[prof] || prof, bhs = SPEC.iscsi.bhs;
      const imm = o.ImmediateData ? Math.min(W, o.FirstBurst, o.MRDSL) : 0;
      const unsol = o.InitialR2T ? imm : Math.min(W, o.FirstBurst);
      const unsolOut = unsol - imm;
      let rest = W - unsol, r2t = 0, dataOut = Math.ceil(unsolOut / o.MRDSL);
      const bursts = [unsol];
      while (rest > 0) { const b = Math.min(rest, o.MaxBurst); r2t++; bursts.push(b); dataOut += Math.ceil(b / o.MRDSL); rest -= b; }
      const pdus = 1 + r2t + dataOut + 1;
      const toTarget = W + bhs * (1 + dataOut), toHost = bhs * (r2t + 1);
      const wt = tcpWire(toTarget, mtu || 1500), wh = tcpWire(toHost, mtu || 1500);
      const rate = gbps * 1e9 / 8, rounds = 1 + r2t;
      const tWire = wt.wire / rate, T = rounds * rttMs / 1000 + tWire;
      return { imm, unsol, bursts, rate, r2t, dataOut, pdus, rounds, wire: wt.wire + wh.wire, eff: W / (wt.wire + wh.wire), tWire, T, MBps: W / T / 1e6, linkMBps: rate / 1e6, waitShare: rounds * rttMs / 1000 / T };
    }
  };

  /* ── 04 Fibre Channel buffer-to-buffer credits as a sliding window (Stallings, Data and Computer
     Communications, §7.1: U = min(1, W·t_f / (t_f + 2·t_prop))). One credit = one receive buffer = one frame
     the sender may launch before an R_RDY comes back. Credits needed to fill the link = ceil(2·t_prop/t_f) + 1. ── */
  const FC = {
    usPerKm() { return 1e6 * SPEC.fibreIndex / SPEC.c; },   // one way, µs per km
    gen(g) { return SPEC.fc.gens.find(x => x.g === g); },
    frameBytes(payload) { const F = SPEC.fc; return payload + F.sof + F.hdr + F.crc + F.eof + F.idle; },
    run(g, km, credits, payload) {
      const G = FC.gen(g), fb = FC.frameBytes(payload), tf = fb / (G.MBps * 1e6) * 1e6;   // µs per frame
      const tp = km * FC.usPerKm(), rtt = 2 * tp;
      const need = Math.ceil(rtt / tf) + 1, util = Math.min(1, credits * tf / (tf + rtt));
      const goodMBps = util * G.MBps * payload / fb;
      const reachKm = (credits - 1) * tf / 2 / FC.usPerKm();   // longest distance these credits keep full
      return { tf, tp, rtt, need, util, goodMBps, reachKm, MBps: G.MBps, perKm: 2 * FC.usPerKm() / tf };
    },
    // Brocade's full-frame rule of thumb (Fabric OS admin guide, via vendor manuals): about LinkSpeed/2 credits per km
    brocadePerKm(g) { return g / 2; }
  };

  /* ── 05 the latency of one 4 KiB random read at queue depth 1: media + fabric round trip + fibre + switches.
     Fabric round trips are SPDK's measured QD1 4 KiB random-read latencies against a null block device
     (Release 24.05 reports, Mellanox ConnectX-5 100 GbE, point-to-point, no switch, Xeon Gold 6348, Linux 6.0.18),
     i.e. everything except the media. Media presets are the NVMe essay's ch1 values. ── */
  const BUDGET = {
    fabric: { local: 0, rdmaSpdk: 4.72, rdmaKernel: 12.10, tcpSpdk: 17.50, tcpKernel: 21.39 },
    chelsioKernelTcp: 21.46,           // Chelsio 2021 white paper: kernel NVMe/TCP, real SSD, remote − local read
    media: { hdd: 8500, nand: 75, ull: 10 },
    switchUs: 1.0,                     // TUNED: one switch traversal each way (cut-through class), µs
    run(mediaUs, tr, km, hops, sw) {
      // a local drive has no network: distance and switches do not apply
      const loc = tr === 'local', f = BUDGET.fabric[tr], prop = loc ? 0 : 2 * km * FC.usPerKm(), swc = loc ? 0 : 2 * hops * (sw == null ? BUDGET.switchUs : sw);
      const net = f + prop + swc, total = mediaUs + net;
      return { media: mediaUs, fabric: f, prop, sw: swc, net, total, share: net / total, iops: 1e6 / total };
    }
  };

  /* ── 06 what one lost packet costs. Go-back-N (RoCE NICs without selective repeat, per Mittal et al. 2018):
     U = (1−p)/(1 + (W−1)p) with W packets per round trip (Stallings §7.3). Ideal selective repeat: U = 1−p.
     Reno-style TCP under random loss (Mathis et al., CCR 1997): rate ≤ (MSS/RTT)·√(3/2)/√p, capped at the link. ── */
  const LOSS = {
    roceMtu: 4096, tcpMss: 1448,
    // Mathis et al. 1997, Table 1: C = √(3/2) ≈ 1.22 for periodic loss without delayed ACKs (used here); quoted on the
    // page as alternatives: about 1.31 for random loss and about 0.87 (√(3/4)) with delayed ACKs
    mathisAlt: { random: 1.31, delayed: 0.87 },
    run(p, gbps, rttUs) {
      const rate = gbps * 1e9, rtt = rttUs * 1e-6;
      const W = Math.max(1, rate * rtt / (LOSS.roceMtu * 8));
      const gbn = (1 - p) / (1 + (W - 1) * p), sr = 1 - p;
      const mathis = p > 0 ? (LOSS.tcpMss * 8 / rtt) * Math.sqrt(1.5) / Math.sqrt(p) : Infinity;
      const tcp = Math.min(1, mathis / rate);
      return { W, gbn, sr, tcp, gbnG: gbn * gbps, srG: sr * gbps, tcpG: tcp * gbps };
    },
    // loss rate at which GBN keeps a fraction u (solve (1−p)/(1+(W−1)p) = u)
    pFor(u, gbps, rttUs) { const W = Math.max(1, gbps * 1e9 * rttUs * 1e-6 / (LOSS.roceMtu * 8)); return (1 - u) / (1 + u * (W - 1)); },
    // loss rate at which the Mathis bound equals a fraction u of the link
    pTcpFor(u, gbps, rttUs) { const r = (LOSS.tcpMss * 8 / (rttUs * 1e-6)) * Math.sqrt(1.5) / (u * gbps * 1e9); return r * r; }
  };

  /* ── 07 one I/O across three transports, message by message (header sizes from SPEC). Pure ACK packets are not
     counted on either TCP or RDMA. Returns the message list (dir: +1 host→target, −1 target→host). ── */
  const CAPS = {
    msgs(tr, op, size, opt) {
      const o = Object.assign({ icd: true, succ: true, collapse: true }, opt || {}), I = SPEC.iscsi, N = SPEC.nvmeTcp, m = [];
      const add = (dir, key, hdr, data) => m.push({ dir, key, hdr, data: data || 0 });
      if (tr === 'iscsi') {
        if (op === 'read') {
          add(1, 'iscsi.cmd', I.bhs);
          const n = Math.ceil(size / I.MRDSL); for (let i = 0; i < n; i++) add(-1, 'iscsi.din', I.bhs, Math.min(I.MRDSL, size - i * I.MRDSL));
          if (!o.collapse) add(-1, 'iscsi.rsp', I.bhs);
        } else {
          const imm = o.icd ? Math.min(size, I.FirstBurst, I.MRDSL) : 0;
          add(1, 'iscsi.cmd', I.bhs, imm);
          let rest = size - imm;
          while (rest > 0) { const b = Math.min(rest, I.MaxBurst); add(-1, 'iscsi.r2t', I.bhs); for (let x = 0; x < b; x += I.MRDSL) add(1, 'iscsi.dout', I.bhs, Math.min(I.MRDSL, b - x)); rest -= b; }
          add(-1, 'iscsi.rsp', I.bhs);
        }
      } else if (tr === 'tcp') {
        if (op === 'read') { add(1, 'tcp.cmd', N.cmd); add(-1, 'tcp.c2h', N.data, size); if (!o.succ) add(-1, 'tcp.rsp', N.rsp); }
        else if (o.icd) { add(1, 'tcp.cmd', N.cmd, size); add(-1, 'tcp.rsp', N.rsp); }
        else { add(1, 'tcp.cmd', N.cmd); add(-1, 'tcp.r2t', N.r2t); add(1, 'tcp.h2c', N.data, size); add(-1, 'tcp.rsp', N.rsp); }
      } else {
        if (op === 'read') { add(1, 'rdma.send', 0, N.sqe); add(-1, 'rdma.write', 0, size); add(-1, 'rdma.sendc', 0, N.cqe); }
        else if (o.icd) { add(1, 'rdma.send', 0, N.sqe + size); add(-1, 'rdma.sendc', 0, N.cqe); }
        else { add(1, 'rdma.send', 0, N.sqe); add(-1, 'rdma.readreq', 0, 0); add(1, 'rdma.readresp', 0, size); add(-1, 'rdma.sendc', 0, N.cqe); }
      }
      return m;
    },
    run(tr, op, size, opt, mtu) {
      const m = CAPS.msgs(tr, op, size, opt), R = SPEC.roce;
      let wire = 0, packets = 0, hdrBytes = 0;
      if (tr === 'rdma') {
        const per = R.eth + R.ip4 + R.udp + R.bth + R.icrc + R.fcs + SPEC.eth.pre + SPEC.eth.ifg;
        for (const x of m) {
          const ext = x.key === 'rdma.write' || x.key === 'rdma.readreq' ? R.reth : x.key === 'rdma.readresp' ? R.aeth : 0;
          const pk = Math.max(1, Math.ceil(x.data / R.mtu)); packets += pk; wire += x.data + pk * per + ext; hdrBytes += pk * per + ext;
        }
      } else {
        // each direction is one TCP byte stream; consecutive same-direction PDUs share segments
        const runs = []; for (const x of m) { const b = x.hdr + x.data; if (runs.length && runs[runs.length - 1].dir === x.dir) runs[runs.length - 1].b += b; else runs.push({ dir: x.dir, b }); }
        for (const r of runs) { const w = tcpWire(r.b, mtu || 1500); packets += w.pk; wire += w.wire; }
        hdrBytes = wire - m.reduce((a, x) => a + x.data, 0);
      }
      const payload = size;   // the I/O's own data
      let legs = 0, last = 0; for (const x of m) { if (x.dir !== last) legs++; last = x.dir; }
      return { m, msgs: m.length, legs, rt: Math.ceil(legs / 2), wire, packets, eff: payload / wire, hdr: wire - payload };
    }
  };

  /* ── 08 two paths as two M/M/1 queues (Kleinrock, Queueing Systems Vol. 1, §3.2; split routing). Path 1 is the
     ANA-optimized / ALUA active-optimized path; path 2 is slower (TUNED ratio). Mean response time for a split p:
     T = p/(μ1 − pλ) + (1−p)/(μ2 − (1−p)λ). The optimum obeys the square-root rule: μi − λi ∝ √μi. ── */
  const MP = {
    T(p, lam, mu1, mu2) {
      const a = p * lam, b = (1 - p) * lam;
      if ((p > 0 && a >= mu1) || (p < 1 && b >= mu2)) return Infinity;
      return (p > 0 ? p / (mu1 - a) : 0) + (p < 1 ? (1 - p) / (mu2 - b) : 0);
    },
    best(lam, mu1, mu2) {
      const s1 = Math.sqrt(mu1), s2 = Math.sqrt(mu2), c = (mu1 + mu2 - lam) / (s1 + s2);
      let l1 = mu1 - s1 * c; l1 = clamp(l1, 0, lam);
      if (lam - l1 < 0) l1 = lam;
      return l1 / lam;
    },
    run(lam, mu1, ratio) {
      const mu2 = mu1 * ratio, pb = MP.best(lam, mu1, mu2);
      const pol = { opt: 1, rr: 0.5, prop: mu1 / (mu1 + mu2), best: pb };
      const T = {}; for (const k in pol) T[k] = MP.T(pol[k], lam, mu1, mu2);
      const fail1 = lam < mu2 ? 1 / (mu2 - lam) : Infinity, fail2 = lam < mu1 ? 1 / (mu1 - lam) : Infinity;
      return { mu2, pol, T, fail1, fail2, rho1: lam / mu1 };
    }
  };

  /* ── 09 replication vs erasure coding. Storage overhead n/k and failures tolerated m = n − k are exact.
     Durability uses the standard Markov approximation for a group of n devices that loses data at the (m+1)-th
     concurrent failure, independent exponential failures λ and repairs μ ≫ λ:
     MTTDL ≈ μ^m / (λ^(m+1) · n(n−1)…(n−m)). Repair reads k fragments (replication: 1). ── */
  const EC = {
    SCHEMES: { mirror: { n: 2, k: 1 }, rep3: { n: 3, k: 1 }, rs63: { n: 9, k: 6 }, rs104: { n: 14, k: 10 } },
    afr() { return SPEC.bb.failures / (SPEC.bb.driveDays / 365); },
    run(n, k, afr, mttrH) {
      const m = n - k, lam = -Math.log(1 - afr) / 8760, mu = 1 / mttrH;
      let prod = 1; for (let i = 0; i <= m; i++) prod *= (n - i);
      const mttdl = Math.pow(mu, m) / (Math.pow(lam, m + 1) * prod);
      const pYear = -Math.expm1(-8760 / mttdl);   // expm1 keeps precision when the yearly probability is tiny
      return { m, overhead: n / k, mttdl, pYear, nines: -Math.log10(pYear), repairReads: k };
    }
  };

  /* ── frontier data block (as of November 2026; sources and the dates opened in BRIEF.md) ── */
  const FRONTIER = {
    asOf: '2026-11',
    nvme24: '2026-08-04',            // NVM Express: NVMe 2.4 specification set incl. TCP and RDMA transports
    nvmeTcp11: '2024-08-05',
    linuxNvmeTcp: '2019-03-03',      // Linux 5.0: NVMe/TCP host and target
    winPreview: '2026-03-13',        // Microsoft: in-box NVMe-oF initiator (TCP, RDMA) in Windows Server Insider builds
    fc128: '2025-11-19',             // Broadcom: Brocade X8 directors and G820 switch (128G FC)
    fc128Ports: 56,
    uec10: '2025-06-11',             // Ultra Ethernet Consortium Specification 1.0
    cxl40: '2025-11-18', cxl40GT: 128,
    spdkRel: '24.05', chelsioYear: 2021
  };

  /* ── numbers quoted in the prose. Each entry is [value, decimals, kind]; the page formats it for the current
     language and tests/models.cjs pins every one. ── */
  function prose() {
    const c1 = LEVEL.cost(1, 8 * MiB, false), c1c = LEVEL.cost(1, 8 * MiB, true);
    const n0 = NAS.run(1000, 64, 0.5, 3, 1, 1), nW = NAS.run(1000, 64, 30, 3, 1, 1), nW16 = NAS.run(1000, 64, 30, 3, 16, 1), nW1 = NAS.run(1000, 64, 30, 1, 16, 1);
    const i0 = ISCSI.write(MiB, 0.1, 10, 'rfc'), iW = ISCSI.write(MiB, 10, 10, 'rfc'), iWb = ISCSI.write(MiB, 10, 10, 'big'), i4 = ISCSI.write(4 * KiB, 0.1, 10, 'rfc'), i4n = ISCSI.write(4 * KiB, 0.1, 10, 'noimm');
    const f0 = FC.run(16, 50, 40, 2112), f8 = FC.run(8, 100, 1, 2112), f8s = FC.run(8, 100, 1, 512), f0n = FC.run(16, 50, f0.need, 2112), f32 = FC.run(32, 10, 40, 2112);
    const R = BUDGET.run, M = BUDGET.media;
    const bh = R(M.hdd, 'tcpKernel', 0, 0), bn = R(M.nand, 'tcpKernel', 0, 0), bu = R(M.ull, 'tcpKernel', 0, 0), brn = R(M.nand, 'rdmaSpdk', 0, 0), bru = R(M.ull, 'rdmaSpdk', 0, 0);
    const bk = R(M.nand, 'tcpKernel', 10, 2), bsw0 = R(M.nand, 'tcpKernel', 0, 3, 0.5), bsw1 = R(M.nand, 'tcpKernel', 0, 3, 2);
    const l3 = LOSS.run(1e-3, 100, 20), l2 = LOSS.run(1e-2, 100, 20), l3f = LOSS.run(1e-3, 100, 200);
    const pg = LOSS.pFor(0.9, 100, 20), pgf = LOSS.pFor(0.9, 100, 200), pt = LOSS.pTcpFor(0.9, 100, 20);
    const ct = CAPS.run('tcp', 'read', 4096), ci = CAPS.run('iscsi', 'read', 4096), cr = CAPS.run('rdma', 'read', 4096);
    const cwt = CAPS.run('tcp', 'write', 4096, { icd: false }), cwr = CAPS.run('rdma', 'write', 4096, { icd: false }), cwi = CAPS.run('tcp', 'write', 4096, { icd: true });
    const cr64 = CAPS.run('rdma', 'read', 65536), ct64 = CAPS.run('tcp', 'read', 65536), ci64 = CAPS.run('iscsi', 'read', 65536);
    const D = DEFAULTS.mp, mp = MP.run(D.lam, D.mu1, D.ratio), mpl = MP.run(D.lamLow, D.mu1, D.ratio), mp45 = MP.run(D.lamSafe, D.mu1, D.ratio);
    const afr = EC.afr(), S = EC.SCHEMES, e3 = EC.run(3, 1, afr, 24), e10 = EC.run(14, 10, afr, 24), e2 = EC.run(2, 1, afr, 24), e63 = EC.run(9, 6, afr, 24);
    const e3h = EC.run(3, 1, afr, 48), e10h = EC.run(14, 10, afr, 48);
    return {
      blk1: [c1.block.bytes, 0], blk1c: [c1c.block.bytes, 0], obj1: [c1.object.bytes / MiB, 0], obj1c: [c1c.object.bytes / MiB, 0],
      nasD: [n0.D * 1000, 2], nasT: [n0.T, 2], nasBig: [n0.big, 2], nasR: [n0.ratio, 1],
      nasWT: [nW.T, 0], nasWBig: [nW.big, 2], nasW16: [nW16.T, 1], nasW1: [nW1.T, 1], nasStar: [NAS.run(1000, 64, 0.5, 3, 1, 1).sStar, 0], nasStarW: [nW.sStar, 0],
      i0r: [i0.r2t, 0], i0rt: [i0.rounds, 0], i0T: [i0.T * 1000, 2], i0w: [i0.tWire * 1000, 2], i0pdu: [i0.pdus, 0],
      iWT: [iW.T * 1000, 1], iWs: [iW.waitShare, 0, 'pct'], iWbT: [iWb.T * 1000, 1], iWbrt: [iWb.rounds, 0], iWMB: [iW.MBps, 0], iWbMB: [iWb.MBps, 0],
      i4rt: [i4.rounds, 0], i4nrt: [i4n.rounds, 0], iEff: [i0.eff, 1, 'pct'],
      fcPerKm: [f0.perKm, 1], fcNeed: [f0.need, 0], fcUtil: [f0.util, 0, 'pct'], fcGood: [f0.goodMBps, 0], fcTf: [f0.tf, 2],
      fcReach: [f0.reachKm, 1], fc8: [f8.need, 0], fc8s: [f8s.need, 0], fcBro8: [FC.brocadePerKm(8) * 100, 0], fc32: [f32.util, 0, 'pct'],
      fcUs: [FC.usPerKm(), 2],
      bhS: [bh.share, 2, 'pct'], bnS: [bn.share, 0, 'pct'], buS: [bu.share, 0, 'pct'], brnS: [brn.share, 0, 'pct'], bruS: [bru.share, 0, 'pct'],
      bnT: [bn.total, 1], bnI: [bn.iops, 0], bkT: [bk.total, 1], bkProp: [bk.prop, 0], bswLo: [bsw0.total, 1], bswHi: [bsw1.total, 1],
      lW: [l3.W, 0], l3g: [l3.gbn, 0, 'pct'], l2g: [l2.gbn, 0, 'pct'], l3fW: [l3f.W, 0], l3fg: [l3f.gbn, 0, 'pct'], l3t: [l3.tcpG, 0],
      pg: [pg, 2, 'pct'], pgf: [pgf, 3, 'pct'], pt: [pt, 4, 'pct'],
      ctM: [ct.msgs, 0], ctRt: [ct.rt, 0], ctH: [ct.hdr, 0], ctE: [ct.eff, 0, 'pct'], ciH: [ci.hdr, 0], ciE: [ci.eff, 0, 'pct'], crH: [cr.hdr, 0], crE: [cr.eff, 0, 'pct'], crM: [cr.msgs, 0],
      cwtRt: [cwt.rt, 0], cwrRt: [cwr.rt, 0], cwiRt: [cwi.rt, 0], cr64E: [cr64.eff, 1, 'pct'], ct64E: [ct64.eff, 1, 'pct'], ci64E: [ci64.eff, 1, 'pct'],
      mpOpt: [mp.T.opt * 1000, 0], mpRr: [mp.T.rr * 1000, 0], mpProp: [mp.T.prop * 1000, 1], mpBest: [mp.T.best * 1000, 1], mpPb: [mp.pol.best, 0, 'pct'],
      mpLam: [D.lam * 1000, 0], mpMu1: [D.mu1 * 1000, 0], mpMu2: [mp.mu2 * 1000, 0], mpLamLow: [D.lamLow * 1000, 0], mpLamSafe: [D.lamSafe * 1000, 0],
      mplOpt: [mpl.T.opt * 1000, 1], mplPb: [mpl.pol.best, 0, 'pct'], mp45F: [mp45.fail1 * 1000, 0],
      afr: [afr, 2, 'pct'], e3o: [e3.overhead, 1], e10o: [e10.overhead, 1], e3n: [e3.nines, 1], e10n: [e10.nines, 1], e2n: [e2.nines, 1], e63n: [e63.nines, 1], e63o: [e63.overhead, 1],
      e3nh: [e3h.nines, 1], e10nh: [e10h.nines, 1], bbF: [SPEC.bb.failures, 0], bbDY: [SPEC.bb.driveDays / 365, 0]
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
  // a byte count, picked binary unit: { v, u } with u in 'B','KiB','MiB','GiB'
  function bunit(b) {
    if (b < KiB) return { v: b, u: 'B' }; if (b < MiB) return { v: b / KiB, u: 'KiB' }; if (b < 1024 * MiB) return { v: b / MiB, u: 'MiB' }; return { v: b / (1024 * MiB), u: 'GiB' };
  }

  /* ── live sentences: each returns { key, v } so the page can fill a whole-sentence template ── */
  const say = {
    level(k, S, cached) {
      const r = LEVEL.cost(k, S, cached), v = { k, S, b: r.block.bytes, f: r.file.bytes, o: r.object.bytes, ab: r.block.amp, ao: r.object.amp };
      if (r.object.bytes < r.block.bytes) return { key: 'ch1.say.objSmall', v };
      if (k >= S) return { key: 'ch1.say.whole', v };
      if (r.block.amp <= 1.0001) return { key: 'ch1.say.aligned', v };
      return { key: cached ? 'ch1.say.cached' : 'ch1.say.cold', v };
    },
    nas(N, s, rtt, k, P, g) {
      const r = NAS.run(N, s, rtt, k, P, g), v = { T: r.T, big: r.big, ratio: r.ratio, util: r.util, sStar: r.sStar };
      // bandwidth-bound, or within 25% of one big file: the round trips no longer set the pace
      if (r.bound === 'bw' || r.ratio < 1.25) return { key: 'ch2.say.bwNear', v };
      return { key: r.ratio >= 10 ? 'ch2.say.rttBad' : 'ch2.say.rtt', v };
    },
    iscsi(W, rtt, g, prof) {
      const r = ISCSI.write(W, rtt, g, prof), v = { rt: r.rounds, r2t: r.r2t, wait: r.waitShare, T: r.T, MBps: r.MBps };
      if (r.r2t === 0) return { key: 'ch3.say.one', v };
      if (r.waitShare >= 0.5) return { key: 'ch3.say.wait', v };
      return { key: 'ch3.say.wire', v };
    },
    fc(g, km, cr, pl) {
      const r = FC.run(g, km, cr, pl), v = { need: r.need, util: r.util, good: r.goodMBps, reach: r.reachKm, cr };
      if (r.util >= 0.999) return { key: 'ch4.say.full', v };
      if (r.util < 0.5) return { key: 'ch4.say.starve', v };
      return { key: 'ch4.say.part', v };
    },
    budget(media, tr, km, hops) {
      const r = BUDGET.run(media, tr, km, hops), v = { share: r.share, net: r.net, total: r.total, iops: r.iops };
      if (tr === 'local') return { key: 'ch5.say.local', v };
      if (r.share < 0.05) return { key: 'ch5.say.tiny', v };
      if (r.share >= 0.5) return { key: 'ch5.say.dom', v };
      return { key: 'ch5.say.mid', v };
    },
    loss(p, g, rtt) {
      const r = LOSS.run(p, g, rtt), v = { W: r.W, gbn: r.gbn, sr: r.sr, tcp: r.tcp };
      if (r.gbn >= 0.99 && r.tcp >= 0.99) return { key: 'ch6.say.fine', v };
      if (r.tcp < r.gbn) return { key: 'ch6.say.tcpWorse', v };
      return { key: 'ch6.say.gbnWorse', v };
    },
    caps(tr, op, icd, size) {
      const r = CAPS.run(tr, op, size || 4096, { icd }), v = { rt: r.rt, msgs: r.msgs, eff: r.eff };
      return { key: r.rt > 1 ? 'ch7.say.two' : 'ch7.say.one', v };
    },
    mp(lam, mu1, ratio) {
      const r = MP.run(lam, mu1, ratio), v = { opt: r.T.opt, best: r.T.best, pb: r.pol.best, fail1: r.fail1, rr: r.T.rr };
      if (!isFinite(r.T.best)) return { key: 'ch8.say.overAll', v };   // more than both paths together can serve
      if (!isFinite(r.T.opt)) return { key: 'ch8.say.over', v };
      if (!isFinite(r.fail1)) return { key: r.pol.best > 0.999 ? 'ch8.say.noFailOpt' : 'ch8.say.noFail', v };
      if (r.pol.best > 0.999) return { key: 'ch8.say.optOnly', v };
      return { key: 'ch8.say.spill', v };
    },
    ec(n, k, afr, mttr) {
      const r = EC.run(n, k, afr, mttr), v = { o: r.overhead, nines: r.nines, m: r.m, reads: r.repairReads };
      if (k === 1) return { key: 'ch9.say.rep', v };
      return { key: 'ch9.say.ec', v };
    }
  };

  return { SPEC, DEFAULTS, LEVEL, NAS, ISCSI, FC, BUDGET, LOSS, CAPS, MP, EC, FRONTIER, KiB, MiB, fmt, tunit, bunit, say, clamp, tcpWire, prose };
});
