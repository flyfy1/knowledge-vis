/* Deterministic models for "How Containers Isolate a Process".
   Reimplements core Linux kernel 6.x & OCI Image v1.1.0 / Runtime v1.2.0 rules at small scale:
   - FIPS 180-4 SHA-256 (verified against Node crypto.createHash('sha256'))
   - Isolation boundary & footprint model (process vs OCI container vs Firecracker/Kata microVM vs full VM)
   - OCI image layers, DiffID -> ChainID recurrence & multi-service deduplication
   - OverlayFS merged tree, file-level Copy-Up & .wh. / .wh..wh..opq whiteouts
   - Linux 8 Namespaces, /proc remount visibility & Rootless UserNS UID/GID mapping
   - Container networking (veth + bridge + conntrack/NAT vs host vs eBPF redirect + VXLAN MTU)
   - cgroups v2 CPU bandwidth throttling (cpu.max quota / period multi-thread burnout)
   - cgroups v2 unified memory (memory.high direct reclaim PSI, page cache vs tmpfs, memory.max OOM kill)
   - Security perimeter (NoNewPrivs -> seccomp-bpf -> Linux Capabilities -> LSM MAC)
   - PID 1 signal handling (sh -c vs exec vs tini) & orphaned zombie reaping
   No external dependencies; runs identically in browser and Node. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ContainerModels = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /* ── formatting helpers ── */
  function fmt(x, d, locale) {
    if (!isFinite(x)) return '∞';
    d = d == null ? 0 : d;
    const neg = x < 0 ? '-' : '', ax = Math.abs(x);
    const fixed = ax.toFixed(d);
    const [ip, fp] = fixed.split('.');
    const grouped = ip.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    void locale;
    return neg + grouped + (fp != null ? '.' + fp : '');
  }
  function sig(x, n) {
    if (!isFinite(x)) return '∞';
    if (x === 0) return '0';
    return Number(x.toPrecision(n || 3)).toString();
  }
  function bytesStr(b) {
    if (b < 1024) return fmt(b, 0) + ' B';
    if (b < 1048576) return fmt(b / 1024, 1) + ' KiB';
    if (b < 1073741824) return fmt(b / 1048576, 1) + ' MiB';
    return fmt(b / 1073741824, 2) + ' GiB';
  }

  /* ── pure-JS FIPS 180-4 SHA-256 (UTF-8 input string -> lowercase 64-hex) ── */
  const K256 = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ]);
  const H256_INIT = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  function toUtf8Bytes(str) {
    if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(str);
    const out = [];
    for (let i = 0; i < str.length; i++) {
      let c = str.charCodeAt(i);
      if (c < 0x80) out.push(c);
      else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
      else if (c >= 0xd800 && c <= 0xdbff && i + 1 < str.length) {
        const c2 = str.charCodeAt(++i);
        c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
        out.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 0x3f), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
      } else out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
    }
    return new Uint8Array(out);
  }
  function sha256Hex(input) {
    const src = typeof input === 'string' ? toUtf8Bytes(input) : input;
    const len = src.length;
    const bitLenHi = Math.floor((len * 8) / 0x100000000);
    const bitLenLo = (len * 8) >>> 0;
    const paddedLen = Math.ceil((len + 9) / 64) * 64;
    const buf = new Uint8Array(paddedLen);
    buf.set(src, 0);
    buf[len] = 0x80;
    const dv = new DataView(buf.buffer);
    dv.setUint32(paddedLen - 8, bitLenHi, false);
    dv.setUint32(paddedLen - 4, bitLenLo, false);

    const h = H256_INIT.slice();
    const w = new Uint32Array(64);
    const rotr = (x, n) => (x >>> n) | (x << (32 - n));
    for (let off = 0; off < paddedLen; off += 64) {
      for (let i = 0; i < 16; i++) w[i] = dv.getUint32(off + i * 4, false);
      for (let i = 16; i < 64; i++) {
        const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
        const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
      }
      let [a, b, c, d, e, f, g, hh] = h;
      for (let i = 0; i < 64; i++) {
        const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
        const ch = (e & f) ^ ((~e) & g);
        const t1 = (hh + S1 + ch + K256[i] + w[i]) >>> 0;
        const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const t2 = (S0 + maj) >>> 0;
        hh = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
      }
      h[0] = (h[0] + a) >>> 0; h[1] = (h[1] + b) >>> 0; h[2] = (h[2] + c) >>> 0; h[3] = (h[3] + d) >>> 0;
      h[4] = (h[4] + e) >>> 0; h[5] = (h[5] + f) >>> 0; h[6] = (h[6] + g) >>> 0; h[7] = (h[7] + hh) >>> 0;
    }
    return h.map(v => v.toString(16).padStart(8, '0')).join('');
  }

  /* ── ch1: isolation boundary & footprint (Process vs OCI Container vs MicroVM vs Full VM) ── */
  const ISOLATION_SPECS = {
    process:   { mode: 'process',   sharedKernel: true,  nsCount: 0, guestKernelMb: 0,   vmmMb: 0,  shimMb: 0,   appMb: 18, bootMs: 1,    sharedSubsystems: 10 },
    container: { mode: 'container', sharedKernel: true,  nsCount: 6, guestKernelMb: 0,   vmmMb: 0,  shimMb: 3.2, appMb: 18, bootMs: 15,   sharedSubsystems: 5 },
    microvm:   { mode: 'microvm',   sharedKernel: false, nsCount: 0, guestKernelMb: 18,  vmmMb: 5,  shimMb: 2.0, appMb: 18, bootMs: 115,  sharedSubsystems: 1 },
    vm:        { mode: 'vm',        sharedKernel: false, nsCount: 0, guestKernelMb: 128, vmmMb: 32, shimMb: 0,   appMb: 18, bootMs: 1800, sharedSubsystems: 1 }
  };
  const FIRECRACKER_SPEC = { memOverheadMaxMiB: 5, bootMsMax: 125 };
  function isolationProfile(mode, replicas) {
    const m = ISOLATION_SPECS[mode] ? mode : 'container';
    const sp = ISOLATION_SPECS[m];
    const n = Math.max(1, Math.min(32, Math.round(replicas == null ? 8 : replicas)));
    const perReplicaOverheadMb = sp.guestKernelMb + sp.vmmMb + sp.shimMb;
    const totalPerReplicaMb = perReplicaOverheadMb + sp.appMb;
    const hostKernelBaseMb = 160; // shared host Linux kernel slab + page tables baseline (parameterized)
    const totalMb = hostKernelBaseMb + n * totalPerReplicaMb;
    const kernelMbTotal = hostKernelBaseMb + n * (sp.guestKernelMb + sp.vmmMb + sp.shimMb);
    const appMbTotal = n * sp.appMb;
    return {
      mode: m,
      replicas: n,
      sharedKernel: sp.sharedKernel,
      nsCount: sp.nsCount,
      bootMs: sp.bootMs,
      appMb: sp.appMb,
      perReplicaOverheadMb: Math.round(perReplicaOverheadMb * 10) / 10,
      totalPerReplicaMb: Math.round(totalPerReplicaMb * 10) / 10,
      kernelMbTotal: Math.round(kernelMbTotal * 10) / 10,
      appMbTotal,
      totalMb: Math.round(totalMb * 10) / 10,
      sharedSubsystems: sp.sharedSubsystems,
      sayKey: 'ch1.say.' + m
    };
  }

  /* ── ch2: OCI Image Layers, DiffID -> ChainID & Content-Addressable Deduplication ── */
  const BASE_LAYERS = [
    { id: 'L0', name: 'debian:12-slim', sizeMiB: 124, contentA: 'debian-bookworm-20261101', contentB: 'debian-bookworm-20261101' },
    { id: 'L1', name: 'python:3.12',    sizeMiB: 48,  contentA: 'cpython-3.12.7-openssl3',  contentB: 'cpython-3.12.7-openssl3' },
    { id: 'L2', name: 'pip-deps',       sizeMiB: 27,  contentA: 'werkzeug+jinja2+urllib3',  contentB: 'werkzeug+jinja2+urllib3' },
    { id: 'L3', name: 'app.py',         sizeMiB: 1,   contentA: 'flask-service-a-v1',       contentB: 'fastapi-service-b-v1' }
  ];
  function ociChain(contents, sizes) {
    const out = [];
    let prevChain = null;
    for (let i = 0; i < contents.length; i++) {
      const diffId = 'sha256:' + sha256Hex('tar:' + contents[i]);
      const chainId = i === 0 ? diffId : ('sha256:' + sha256Hex(prevChain + ' ' + diffId));
      prevChain = chainId;
      out.push({ id: BASE_LAYERS[i].id, name: BASE_LAYERS[i].name, sizeMiB: sizes[i], diffId, chainId });
    }
    const configObj = { architecture: 'amd64', os: 'linux', rootfs: { type: 'layers', diff_ids: out.map(l => l.diffId) } };
    const configDigest = 'sha256:' + sha256Hex(JSON.stringify(configObj));
    const manifestObj = {
      schemaVersion: 2,
      mediaType: 'application/vnd.oci.image.manifest.v1+json',
      config: { mediaType: 'application/vnd.oci.image.config.v1+json', digest: configDigest },
      layers: out.map(l => ({ mediaType: 'application/vnd.oci.image.layer.v1.tar+gzip', digest: l.diffId, size: l.sizeMiB * 1048576 }))
    };
    const manifestDigest = 'sha256:' + sha256Hex(JSON.stringify(manifestObj));
    return { layers: out, configDigest, manifestDigest };
  }
  function ociLayersModel(opts) {
    const o = opts || {};
    const mutate = ['none', 'L1', 'L2', 'L3'].includes(o.mutate) ? o.mutate : 'none';
    const replicas = Math.max(2, Math.min(10, Math.round(o.replicas == null ? 2 : o.replicas)));
    const contentsA = BASE_LAYERS.map(l => l.contentA);
    const contentsB = BASE_LAYERS.map(l => l.contentB);
    if (mutate === 'L1') contentsB[1] = 'cpython-3.13.0-openssl3';
    else if (mutate === 'L2') contentsB[2] = 'werkzeug+jinja2+pydantic2';
    else if (mutate === 'L3') contentsB[3] = 'flask-service-a-v2-1byte';
    const sizes = BASE_LAYERS.map(l => l.sizeMiB);
    const chainA = ociChain(contentsA, sizes);
    const chainB = ociChain(contentsB, sizes);

    const rows = chainA.layers.map((la, i) => {
      const lb = chainB.layers[i];
      const diffMatch = la.diffId === lb.diffId;
      const chainMatch = la.chainId === lb.chainId;
      return {
        id: la.id,
        name: la.name,
        sizeMiB: la.sizeMiB,
        diffA: la.diffId,
        diffB: lb.diffId,
        chainA: la.chainId,
        chainB: lb.chainId,
        shared: chainMatch,
        diffMatch
      };
    });

    const singleImageMiB = sizes.reduce((a, b) => a + b, 0); // 200 MiB
    const sharedMiB = rows.filter(r => r.shared).reduce((a, r) => a + r.sizeMiB, 0);
    const uniqueA = singleImageMiB - sharedMiB;
    const uniqueB = singleImageMiB - sharedMiB;
    // With `replicas` variants/containers: 1 copy of A + (replicas - 1) copies of B sharing ChainID-matched lower layers
    const naiveMiB = singleImageMiB * replicas;
    // Wait: if mutate === 'none' and replicas >= 2, Service A (1st) + Service B variants share `sharedMiB` (199 MiB) once,
    // plus `uniqueA` (1 MiB) + `(replicas - 1) * uniqueB` (when distinct services) OR for N identical replicas of A: 200 MiB total.
    // Here we explicitly model `replicas` distinct microservices built from the mutated layer stack!
    const storedMiB = sharedMiB + uniqueA + (replicas - 1) * uniqueB;
    const savedMiB = naiveMiB - storedMiB;
    const cacheHits = rows.filter(r => r.shared).length;
    const sayKey = mutate === 'none' ? 'ch2.say.none' : mutate === 'L3' ? 'ch2.say.l3' : mutate === 'L2' ? 'ch2.say.l2' : 'ch2.say.l1';

    return {
      mutate,
      replicas,
      singleImageMiB,
      sharedMiB,
      storedMiB,
      naiveMiB,
      savedMiB,
      cacheHits,
      rows,
      manifestA: chainA.manifestDigest,
      manifestB: chainB.manifestDigest,
      sayKey
    };
  }

  /* ── ch3: OverlayFS (lowerdir + upperdir + workdir -> merged, Copy-Up & .wh. whiteouts) ── */
  const OVERLAY_OPS = ['read', 'append', 'chmod', 'rm-split', 'rm-same', 'opaque'];
  function overlayfsModel(op) {
    const mode = OVERLAY_OPS.includes(op) ? op : 'read';
    // Base layers
    const l0 = [
      { path: '/usr/bin/python', sizeMiB: 5.2, perm: '755' },
      { path: '/var/cache/model.bin', sizeMiB: 100.0, perm: '644' }
    ];
    let l1 = [
      { path: '/app/server.py', sizeMiB: 0.004, perm: '644' },
      { path: '/var/cache/pkg.tar', sizeMiB: 80.0, perm: '644' }
    ];
    let upper = [];
    let merged = [
      { path: '/usr/bin/python', sizeMiB: 5.2, origin: 'L0' },
      { path: '/var/cache/model.bin', sizeMiB: 100.0, origin: 'L0' },
      { path: '/app/server.py', sizeMiB: 0.004, origin: 'L1' },
      { path: '/var/cache/pkg.tar', sizeMiB: 80.0, origin: 'L1' }
    ];
    let copyUpMiB = 0;
    let whiteouts = 0;
    let wastedMiB = 0;

    if (mode === 'append') {
      copyUpMiB = 100.0;
      upper = [{ path: '/var/cache/model.bin', sizeMiB: 100.004, kind: 'copy-up' }];
      merged = merged.map(f => f.path === '/var/cache/model.bin' ? { path: f.path, sizeMiB: 100.004, origin: 'upper' } : f);
    } else if (mode === 'chmod') {
      copyUpMiB = 100.0;
      upper = [{ path: '/var/cache/model.bin', sizeMiB: 100.0, kind: 'copy-up-meta' }];
      merged = merged.map(f => f.path === '/var/cache/model.bin' ? { path: f.path, sizeMiB: 100.0, origin: 'upper' } : f);
    } else if (mode === 'rm-split') {
      whiteouts = 1;
      wastedMiB = 80.0;
      upper = [{ path: '/var/cache/.wh.pkg.tar', sizeMiB: 0, kind: 'whiteout' }];
      merged = merged.filter(f => f.path !== '/var/cache/pkg.tar');
    } else if (mode === 'rm-same') {
      // Deleted before L1 snapshot is committed
      l1 = l1.filter(f => f.path !== '/var/cache/pkg.tar');
      merged = merged.filter(f => f.path !== '/var/cache/pkg.tar');
    } else if (mode === 'opaque') {
      whiteouts = 1;
      wastedMiB = 180.0; // hides both model.bin (100) and pkg.tar (80) from /var/cache
      upper = [{ path: '/var/cache/.wh..wh..opq', sizeMiB: 0, kind: 'opaque' }];
      merged = merged.filter(f => !f.path.startsWith('/var/cache/'));
    }

    const sum = arr => arr.reduce((a, b) => a + b.sizeMiB, 0);
    const l0MiB = sum(l0);
    const l1MiB = sum(l1);
    const upperMiB = sum(upper);
    const totalStoredMiB = Math.round((l0MiB + l1MiB + upperMiB) * 1000) / 1000;
    const visibleMiB = Math.round(sum(merged) * 1000) / 1000;

    return {
      op: mode,
      l0, l1, upper, merged,
      l0MiB: Math.round(l0MiB * 1000) / 1000,
      l1MiB: Math.round(l1MiB * 1000) / 1000,
      upperMiB: Math.round(upperMiB * 1000) / 1000,
      copyUpMiB,
      whiteouts,
      wastedMiB,
      totalStoredMiB,
      visibleMiB,
      sayKey: 'ch3.say.' + mode
    };
  }

  /* ── ch4: Linux Namespaces & Rootless UserNS UID mapping ── */
  const NS_ALL = ['PID', 'MNT', 'NET', 'UTS', 'IPC', 'CGROUP', 'USER', 'TIME'];
  function namespaceModel(opts) {
    const o = opts || {};
    const pidNs = o.pidNs !== false;
    const mntNs = o.mntNs !== false;
    const netNs = o.netNs !== false;
    const userNs = !!o.userNs;
    const procRemount = o.procRemount !== false;
    const hostUidBase = userNs ? (o.hostUidBase != null ? o.hostUidBase : 100000) : 0;

    const hostPid = 4821;
    const insidePid = pidNs ? 1 : hostPid;
    const procShowsHost = !pidNs || !procRemount;
    const visibleProcs = procShowsHost ? 142 : 2; // host has 142 processes vs 2 in container
    const uidInside = 0;
    const uidOutside = userNs ? hostUidBase : 0;
    const uidMapLine = userNs ? `0 ${hostUidBase} 65536` : '0 0 4294967295';

    // 4 always-active baseline namespaces (UTS, IPC, CGROUP, TIME optional) + toggled ones
    const isolated = {
      PID: pidNs,
      MNT: mntNs,
      NET: netNs,
      UTS: true,
      IPC: true,
      CGROUP: true,
      USER: userNs,
      TIME: false
    };
    const isolatedCount = Object.values(isolated).filter(Boolean).length;

    let riskState = 'rootful-ok';
    if (!mntNs) riskState = 'no-mnt';
    else if (!pidNs) riskState = 'host-pid';
    else if (!procRemount) riskState = 'proc-leak';
    else if (userNs) riskState = 'rootless';

    return {
      pidNs, mntNs, netNs, userNs, procRemount,
      hostPid, insidePid,
      procShowsHost, visibleProcs,
      uidInside, uidOutside, uidMapLine,
      isolated, isolatedCount, totalNs: NS_ALL.length,
      riskState,
      sayKey: 'ch4.say.' + riskState
    };
  }

  /* ── ch5: Container Networking (veth + bridge + NAT vs host vs eBPF + VXLAN MTU) ── */
  const NET_MODES = ['bridge-nat', 'same-bridge', 'host-net', 'ebpf-host'];
  function networkModel(opts) {
    const o = opts || {};
    const mode = NET_MODES.includes(o.mode) ? o.mode : 'bridge-nat';
    const payloadBytes = Math.max(60, Math.min(1500, Math.round(o.payloadBytes == null ? 1460 : o.payloadBytes)));
    const kpps = Math.max(10, Math.min(200, Math.round(o.kpps == null ? 50 : o.kpps)));
    const vxlan = !!o.vxlan;

    // Parameterized software network-stack path characteristics
    const table = {
      'bridge-nat':  { netnsCross: 1, bridgeHops: 1, conntrackHooks: 2, cpuNsPerPkt: 1850, isolated: true,  stages: ['app', 'veth', 'docker0', 'nftables', 'nic'] },
      'same-bridge': { netnsCross: 2, bridgeHops: 1, conntrackHooks: 1, cpuNsPerPkt: 1450, isolated: true,  stages: ['app', 'vethA', 'docker0', 'vethB', 'peer'] },
      'host-net':    { netnsCross: 0, bridgeHops: 0, conntrackHooks: 0, cpuNsPerPkt: 520,  isolated: false, stages: ['app', 'nic'] },
      'ebpf-host':   { netnsCross: 1, bridgeHops: 0, conntrackHooks: 0, cpuNsPerPkt: 780,  isolated: true,  stages: ['app', 'veth-ebpf', 'nic'] }
    };
    const spec = table[mode];
    const vxlanOverhead = (vxlan && mode !== 'same-bridge') ? 50 : 0; // 14 outer eth + 20 outer IP + 8 UDP + 8 VXLAN
    const mtuLimit = 1500 - vxlanOverhead;
    const ipPayload = payloadBytes + 40; // IPv4 (20) + TCP (20)
    const fragmented = ipPayload > mtuLimit;
    const cpuCoresPct = Math.round((kpps * 1000 * spec.cpuNsPerPkt / 1e9) * 1000) / 10; // % of 1 core

    let sayKey = 'ch5.say.' + mode;
    if (fragmented) sayKey = 'ch5.say.frag';

    return {
      mode,
      payloadBytes,
      kpps,
      vxlan,
      vxlanOverhead,
      mtuLimit,
      ipPayload,
      fragmented,
      netnsCross: spec.netnsCross,
      bridgeHops: spec.bridgeHops,
      conntrackHooks: spec.conntrackHooks,
      cpuNsPerPkt: spec.cpuNsPerPkt,
      cpuCoresPct,
      isolated: spec.isolated,
      stages: spec.stages,
      sayKey
    };
  }

  /* ── ch6: cgroups v2 CPU Bandwidth Control (cpu.max quota / period) ── */
  function cfsThrottleModel(opts) {
    const o = opts || {};
    const cpus = Math.max(0.25, Math.min(4.0, Math.round((o.cpus == null ? 0.5 : o.cpus) * 4) / 4));
    const periodMs = [10, 20, 100].includes(o.periodMs) ? o.periodMs : 100;
    const threads = Math.max(1, Math.min(8, Math.round(o.threads == null ? 4 : o.threads)));
    const hostCores = 8;
    const windowMs = 200;
    const rpcCpuMs = 20;

    const periodUs = periodMs * 1000;
    const quotaUs = Math.round(cpus * periodUs);
    const quotaMs = quotaUs / 1000;
    const effThreads = Math.min(threads, hostCores);
    const throttled = effThreads > cpus;
    const burnMs = throttled ? (quotaMs / effThreads) : periodMs;
    const freezeMs = throttled ? Math.max(0, periodMs - burnMs) : 0;

    const nrPeriods = Math.floor(windowMs / periodMs);
    const nrThrottled = throttled ? nrPeriods : 0;
    const throttledMsTotal = Math.round(nrThrottled * freezeMs * 10) / 10;

    // Worst-case wall-clock latency for a 20 ms single-thread RPC arriving just before quota runs out
    // Wait: in each period it gets up to burnMs (or quotaMs if 1 thread runs alone while others stall;
    // when all `effThreads` stay runnable in parallel, each gets `burnMs` per period).
    const activePerThread = burnMs;
    const periodsNeeded = throttled ? Math.max(0, Math.ceil(rpcCpuMs / activePerThread) - 1) : 0;
    // Minimum single freeze hit if request lands right when burst exhausts the bucket:
    const rpcWallMs = throttled ? Math.round((rpcCpuMs + freezeMs * Math.max(1, Math.floor(rpcCpuMs / quotaMs) || 1)) * 10) / 10 : rpcCpuMs;
    // Actually exact worst-case for 1 RPC when `threads` burst together at start of period:
    // If all 4 threads burst and exhaust quota in 12.5 ms, an RPC needing 20 ms CPU gets 12.5 ms? Wait:
    // if single RPC runs 20 ms alone after bucket was emptied by sibling threads: it waits 1 full freezeMs (87.5 ms) + 20 ms = 107.5 ms!
    const singleBurstRpcMs = Math.round((rpcCpuMs + freezeMs) * 100) / 100;

    const segments = [];
    for (let p = 0; p < nrPeriods; p++) {
      const t0 = p * periodMs;
      segments.push({ t0, activeEnd: t0 + burnMs, periodEnd: t0 + periodMs, throttled });
    }

    return {
      cpus,
      periodMs,
      periodUs,
      quotaUs,
      quotaMs,
      threads,
      effThreads,
      throttled,
      burnMs: Math.round(burnMs * 100) / 100,
      freezeMs: Math.round(freezeMs * 100) / 100,
      nrPeriods,
      nrThrottled,
      throttledMsTotal,
      singleBurstRpcMs,
      rpcWallMs,
      windowMs,
      segments,
      sayKey: throttled ? 'ch6.say.throttled' : 'ch6.say.smooth'
    };
  }

  /* ── ch7: cgroups v2 Unified Memory (memory.high PSI reclaim vs memory.max OOM kill) ── */
  function cgroupMemoryModel(opts) {
    const o = opts || {};
    const memMaxMiB = Math.max(256, Math.min(1024, Math.round(o.memMaxMiB == null ? 512 : o.memMaxMiB)));
    const highPct = Math.max(60, Math.min(95, Math.round(o.highPct == null ? 80 : o.highPct)));
    const memHighMiB = Math.round(memMaxMiB * highPct / 100);
    const anonMiB = Math.max(64, Math.min(640, Math.round(o.anonMiB == null ? 240 : o.anonMiB)));
    const requestedCacheMiB = Math.max(0, Math.min(512, Math.round(o.pageCacheMiB == null ? 220 : o.pageCacheMiB)));
    const tmpfsMiB = Math.max(0, Math.min(384, Math.round(o.tmpfsMiB == null ? 0 : o.tmpfsMiB)));

    const unreclaimableMiB = anonMiB + tmpfsMiB;
    const demandTotalMiB = unreclaimableMiB + requestedCacheMiB;

    let keptCacheMiB = requestedCacheMiB;
    let reclaimedCacheMiB = 0;
    let currentMiB = demandTotalMiB;
    let psiPct = 0;
    let oomKilled = false;
    let status = 'healthy';

    if (unreclaimableMiB > memMaxMiB) {
      // Even after dropping 100% of clean page cache, unreclaimable exceeds memory.max -> OOM kill
      keptCacheMiB = 0;
      reclaimedCacheMiB = requestedCacheMiB;
      currentMiB = memMaxMiB;
      psiPct = 100;
      oomKilled = true;
      status = 'oom';
    } else if (unreclaimableMiB > memHighMiB) {
      // Unreclaimable exceeds memory.high (but <= memory.max): all clean cache evicted, severe direct reclaim stall
      keptCacheMiB = 0;
      reclaimedCacheMiB = requestedCacheMiB;
      currentMiB = unreclaimableMiB;
      const frac = (unreclaimableMiB - memHighMiB) / Math.max(1, memMaxMiB - memHighMiB);
      psiPct = Math.round((30 + 60 * frac) * 10) / 10;
      status = 'thrash';
    } else if (demandTotalMiB > memHighMiB) {
      // Clean page cache can be evicted down to memory.high!
      keptCacheMiB = Math.max(0, memHighMiB - unreclaimableMiB);
      reclaimedCacheMiB = requestedCacheMiB - keptCacheMiB;
      currentMiB = unreclaimableMiB + keptCacheMiB;
      const excessRatio = reclaimedCacheMiB / Math.max(1, memMaxMiB);
      psiPct = Math.round(Math.min(28, 4 + 45 * excessRatio) * 10) / 10;
      status = 'reclaim';
    }

    return {
      memMaxMiB,
      highPct,
      memHighMiB,
      anonMiB,
      tmpfsMiB,
      requestedCacheMiB,
      unreclaimableMiB,
      demandTotalMiB,
      keptCacheMiB,
      reclaimedCacheMiB,
      currentMiB,
      psiPct,
      oomKilled,
      status,
      sayKey: 'ch7.say.' + status
    };
  }

  /* ── ch8: Security Perimeter (NoNewPrivs + seccomp-bpf + Capabilities + LSM) ── */
  const SYSCALL_PROBES = ['read_write', 'raw_ping', 'mount_fs', 'ptrace', 'bpf', 'kexec'];
  const SECCOMP_COUNTS = { total: 374, blockedDefault: 44, allowedDefault: 330 };
  function seccompCapModel(opts) {
    const o = opts || {};
    const probe = SYSCALL_PROBES.includes(o.probe) ? o.probe : 'mount_fs';
    const seccomp = o.seccomp !== false;
    const capNetRaw = o.capNetRaw !== false;
    const capSysAdmin = !!o.capSysAdmin;
    const capSysPtrace = !!o.capSysPtrace;
    const noNewPrivs = o.noNewPrivs !== false;
    const lsm = o.lsm !== false;

    const specs = {
      read_write: { seccompBlocked: false, reqCap: null,           lsmBlocked: false },
      raw_ping:   { seccompBlocked: false, reqCap: 'CAP_NET_RAW',  lsmBlocked: false },
      mount_fs:   { seccompBlocked: true,  reqCap: 'CAP_SYS_ADMIN',lsmBlocked: true  },
      ptrace:     { seccompBlocked: true,  reqCap: 'CAP_SYS_PTRACE', lsmBlocked: true },
      bpf:        { seccompBlocked: true,  reqCap: 'CAP_SYS_ADMIN',lsmBlocked: true  },
      kexec:      { seccompBlocked: true,  reqCap: 'CAP_SYS_BOOT', lsmBlocked: true  }
    };
    const sp = specs[probe];
    const hasCap = sp.reqCap === null ? true
      : sp.reqCap === 'CAP_NET_RAW' ? capNetRaw
      : sp.reqCap === 'CAP_SYS_ADMIN' ? capSysAdmin
      : sp.reqCap === 'CAP_SYS_PTRACE' ? capSysPtrace
      : false; // CAP_SYS_BOOT is dropped in container profiles

    const gates = [
      { id: 'nnp',     pass: true,                        note: noNewPrivs ? 'locked' : 'setuid-open' },
      { id: 'seccomp', pass: !(seccomp && sp.seccompBlocked), note: (seccomp && sp.seccompBlocked) ? 'EPERM' : 'PASS' },
      { id: 'caps',    pass: hasCap,                      note: hasCap ? 'PASS' : 'EPERM' },
      { id: 'lsm',     pass: !(lsm && sp.lsmBlocked),     note: (lsm && sp.lsmBlocked) ? 'EACCES' : 'PASS' }
    ];

    let verdict = 'ALLOW';
    let blockedAt = 'none';
    if (!gates[1].pass) { verdict = 'EPERM'; blockedAt = 'seccomp'; }
    else if (!gates[2].pass) { verdict = 'EPERM'; blockedAt = 'caps'; }
    else if (!gates[3].pass) { verdict = 'EACCES'; blockedAt = 'lsm'; }

    const allowedSyscalls = seccomp ? SECCOMP_COUNTS.allowedDefault : SECCOMP_COUNTS.total;
    const blockedSyscalls = seccomp ? SECCOMP_COUNTS.blockedDefault : 0;
    const capRiskScore = (capNetRaw ? 1 : 0) + (capSysPtrace ? 3 : 0) + (capSysAdmin ? 8 : 0) + (seccomp ? 0 : 6);

    const sayKey = verdict === 'ALLOW' ? 'ch8.say.allow' : ('ch8.say.' + blockedAt);

    return {
      probe,
      seccomp,
      capNetRaw,
      capSysAdmin,
      capSysPtrace,
      noNewPrivs,
      lsm,
      reqCap: sp.reqCap || 'NONE',
      gates,
      verdict,
      blockedAt,
      allowedSyscalls,
      blockedSyscalls,
      capRiskScore,
      sayKey
    };
  }

  /* ── ch9: PID 1 Signal Handling & Zombie Reaping ── */
  const PID1_MODES = ['shell', 'exec', 'init'];
  function pid1SignalModel(opts) {
    const o = opts || {};
    const mode = PID1_MODES.includes(o.mode) ? o.mode : 'shell';
    const graceSec = Math.max(4, Math.min(15, Math.round(o.graceSec == null ? 10 : o.graceSec)));
    const spawnRate = Math.max(0, Math.min(6, Math.round(o.spawnRate == null ? 3 : o.spawnRate)));
    const sendStop = o.sendStop !== false;
    const stopAtSec = 5;
    const timeSec = Math.max(0, Math.min(20, Math.round(o.timeSec == null ? 15 : o.timeSec)));

    let state = 'running';
    let exitCode = null;
    let activeRunSec = timeSec;
    let shutdownSec = null;
    let killType = 'none';

    if (sendStop && timeSec >= stopAtSec) {
      if (mode === 'shell') {
        // /bin/sh as PID 1 ignores SIGTERM -> waits full graceSec -> SIGKILL at stopAtSec + graceSec
        const killAt = stopAtSec + graceSec;
        if (timeSec < killAt) {
          state = 'ignoring-sigterm';
          activeRunSec = timeSec;
        } else {
          state = 'killed-sigkill';
          exitCode = 137;
          activeRunSec = killAt;
          shutdownSec = killAt;
          killType = 'SIGKILL';
        }
      } else {
        // Both 'exec' (app as PID 1 with handler) and 'init' (tini forwarding SIGTERM) drain cleanly in 1 s
        const exitAt = stopAtSec + 1;
        if (timeSec < exitAt) {
          state = 'draining';
          activeRunSec = timeSec;
        } else {
          state = 'exited-clean';
          exitCode = 0;
          activeRunSec = exitAt;
          shutdownSec = exitAt;
          killType = 'SIGTERM';
        }
      }
    }

    // Zombies: 'init' (tini) reaps every SIGCHLD immediately -> 0 zombies.
    // Both 'shell' (sh doesn't reap orphaned grandchildren) and 'exec' (app forgot waitpid) leak zombies while running!
    const zombies = mode === 'init' ? 0 : (state === 'killed-sigkill' || state === 'exited-clean' ? 0 : activeRunSec * spawnRate);
    // Actually before exit, zombies accumulated = activeRunSec * spawnRate; once exited, container PID namespace is destroyed,
    // wait: showing peak zombies accumulated BEFORE container death is super instructive! Let's return both liveZombies and peakZombies.
    const peakZombies = mode === 'init' ? 0 : Math.min(activeRunSec, mode === 'shell' ? activeRunSec : stopAtSec + 1) * spawnRate;
    const sigtermWaitSec = !sendStop || timeSec < stopAtSec ? 0
      : mode === 'shell' ? Math.min(timeSec - stopAtSec, graceSec) : Math.min(timeSec - stopAtSec, 1);

    const sayKey = !sendStop || timeSec < stopAtSec ? 'ch9.say.run'
      : state === 'ignoring-sigterm' ? 'ch9.say.hang'
      : state === 'killed-sigkill' ? 'ch9.say.sigkill'
      : mode === 'exec' ? 'ch9.say.exec'
      : 'ch9.say.init';

    return {
      mode,
      graceSec,
      spawnRate,
      sendStop,
      stopAtSec,
      timeSec,
      state,
      exitCode,
      killType,
      shutdownSec,
      zombies,
      peakZombies,
      sigtermWaitSec,
      sayKey
    };
  }

  return {
    fmt, sig, bytesStr, sha256Hex,
    ISOLATION_SPECS, FIRECRACKER_SPEC, isolationProfile,
    BASE_LAYERS, ociLayersModel,
    OVERLAY_OPS, overlayfsModel,
    NS_ALL, namespaceModel,
    NET_MODES, networkModel,
    cfsThrottleModel,
    cgroupMemoryModel,
    SYSCALL_PROBES, SECCOMP_COUNTS, seccompCapModel,
    PID1_MODES, pid1SignalModel
  };
});
