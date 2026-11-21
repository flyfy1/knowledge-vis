#!/usr/bin/env node
'use strict';
/* Cross-checks models.js against Node.js native node:crypto SHA-256 and exact
   OCI Image v1.1.0 / Runtime v1.2.0 + Linux Kernel 6.x specification invariants.
   Honest host note: on macOS Darwin (no Linux kernel, no docker/containerd/runc daemon),
   live kernel unshare/cgroups/OverlayFS syscalls cannot execute directly; this script
   validates cryptographic content addressing against node:crypto and checks all kernel
   accounting & protocol equations deterministically.
   Usage: node computing/software/how-containers-isolate-a-process/tools/crosscheck.cjs */
const crypto = require('crypto');
const path = require('path');
const os = require('os');
const M = require(path.join(__dirname, '..', 'models.js'));

let n = 0, bad = 0;
const rows = [];
const sha = s => crypto.createHash('sha256').update(s, 'utf8').digest('hex');

function cmp(name, got, want, tol) {
  n++;
  const a = [].concat(got), b = [].concat(want);
  let err = 0, okLen = a.length === b.length;
  if (okLen) {
    for (let i = 0; i < a.length; i++) {
      err = Math.max(err, typeof a[i] === 'number' ? Math.abs(a[i] - b[i]) : (a[i] === b[i] ? 0 : Infinity));
    }
  }
  const ok = okLen && err <= (tol || 0);
  if (!ok) bad++;
  rows.push(`${ok ? 'ok  ' : 'FAIL'} ${name}${typeof a[0] === 'number' ? ` (max |diff| ${okLen ? err.toExponential(2) : 'len'}, tol ${tol || 0})` : okLen && err === 0 ? '' : ` got ${String(a).slice(0, 64)} want ${String(b).slice(0, 64)}`}`);
}

rows.push(`host: ${os.platform()} ${os.arch()} (${os.release()}), Node ${process.version}`);

/* 1. FIPS 180-4 SHA-256 vectors + multi-byte UTF-8 against Node crypto */
for (const sample of [
  '',
  'abc',
  'abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq',
  'tar:debian-bookworm-20261101',
  '容器镜像层内容寻址测试-λ-2026',
  'a'.repeat(130)
]) {
  cmp(`sha256Hex("${sample.slice(0, 24)}") === node:crypto`, M.sha256Hex(sample), sha(sample));
}

/* 2. OCI Image Spec v1.1.0 ChainID recurrence + Manifest/Config canonical JSON digests */
{
  const m0 = M.ociLayersModel({ mutate: 'none', replicas: 2 });
  const expectedDiffs = M.BASE_LAYERS.map(l => 'sha256:' + sha('tar:' + l.contentA));
  const expectedChains = [];
  for (let i = 0; i < expectedDiffs.length; i++) {
    expectedChains.push(i === 0 ? expectedDiffs[0] : 'sha256:' + sha(expectedChains[i - 1] + ' ' + expectedDiffs[i]));
  }
  cmp('OCI DiffIDs match node:crypto', m0.rows.map(r => r.diffA), expectedDiffs);
  cmp('OCI ChainID recurrence matches node:crypto', m0.rows.map(r => r.chainA), expectedChains);

  const cfgJson = JSON.stringify({ architecture: 'amd64', os: 'linux', rootfs: { type: 'layers', diff_ids: expectedDiffs } });
  const cfgDigest = 'sha256:' + sha(cfgJson);
  const manJson = JSON.stringify({
    schemaVersion: 2,
    mediaType: 'application/vnd.oci.image.manifest.v1+json',
    config: { mediaType: 'application/vnd.oci.image.config.v1+json', digest: cfgDigest },
    layers: M.BASE_LAYERS.map((l, i) => ({ mediaType: 'application/vnd.oci.image.layer.v1.tar+gzip', digest: expectedDiffs[i], size: l.sizeMiB * 1048576 }))
  });
  cmp('OCI Manifest digest matches node:crypto', m0.manifestA, 'sha256:' + sha(manJson));

  // Mutating L2 invalidates L2 and L3 ChainIDs while preserving L0 and L1
  const mL2 = M.ociLayersModel({ mutate: 'L2', replicas: 2 });
  cmp('L2 mutation keeps L0,L1 ChainID and rebuilds L2,L3', mL2.rows.map(r => r.shared), [true, true, false, false]);
  // Mutating L3 invalidates only L3 even though DiffID only changed in L3
  const mL3 = M.ociLayersModel({ mutate: 'L3', replicas: 10 });
  cmp('L3 mutation shares 199 MiB across 10 replicas', [mL3.sharedMiB, mL3.storedMiB, mL3.naiveMiB], [199, 209, 2000], 0);
}

/* 3. OverlayFS copy-up & .wh. whiteout conservation laws */
{
  const rRead = M.overlayfsModel('read');
  const rApp = M.overlayfsModel('append');
  const rChmod = M.overlayfsModel('chmod');
  const rSplit = M.overlayfsModel('rm-split');
  const rSame = M.overlayfsModel('rm-same');
  const rOpq = M.overlayfsModel('opaque');
  cmp('OverlayFS read zero copy-up', [rRead.copyUpMiB, rRead.upperMiB], [0, 0], 1e-6);
  cmp('OverlayFS 4KB append triggers 100 MiB copy-up', [rApp.copyUpMiB, rApp.upperMiB], [100, 100.004], 1e-6);
  cmp('OverlayFS chmod +x triggers 100 MiB copy-up', [rChmod.copyUpMiB, rChmod.upperMiB], [100, 100], 1e-6);
  cmp('OverlayFS split RUN rm creates whiteout & keeps 80 MiB dead', [rSplit.whiteouts, rSplit.wastedMiB, rSplit.totalStoredMiB], [1, 80, 185.204], 1e-3);
  cmp('OverlayFS same RUN && rm frees 80 MiB', [rSame.whiteouts, rSame.wastedMiB, rSame.totalStoredMiB], [0, 0, 105.204], 1e-3);
  cmp('OverlayFS opaque dir hides entire /var/cache (180 MiB)', [rOpq.whiteouts, rOpq.wastedMiB, rOpq.upper[0].path], [1, 180, '/var/cache/.wh..wh..opq']);
}

/* 4. Namespaces & UserNS uid_map invariants */
{
  const nDef = M.namespaceModel({});
  const nRootless = M.namespaceModel({ userNs: true });
  const nLeak = M.namespaceModel({ pidNs: true, procRemount: false });
  cmp('Default container: PID 1 inside / 4821 outside, UID 0 both sides', [nDef.insidePid, nDef.hostPid, nDef.uidInside, nDef.uidOutside], [1, 4821, 0, 0], 0);
  cmp('Rootless UserNS: UID 0 inside -> 100000 outside', [nRootless.uidInside, nRootless.uidOutside, nRootless.uidMapLine], [0, 100000, '0 100000 65536']);
  cmp('Unmounted /proc leaks host PIDs despite PID ns', [nLeak.insidePid, nLeak.procShowsHost, nLeak.visibleProcs], [1, true, 142]);
}

/* 5. Container networking VXLAN MTU boundary */
{
  const vOk = M.networkModel({ mode: 'bridge-nat', payloadBytes: 1410, vxlan: true });
  const vFrag = M.networkModel({ mode: 'bridge-nat', payloadBytes: 1460, vxlan: true });
  cmp('VXLAN 1410B TCP payload fits 1450B MTU', [vOk.ipPayload, vOk.mtuLimit, vOk.fragmented], [1450, 1450, false]);
  cmp('VXLAN 1460B TCP payload fragments (>1450B)', [vFrag.ipPayload, vFrag.mtuLimit, vFrag.fragmented], [1500, 1450, true]);
}

/* 6. cgroups v2 cpu.max CFS bandwidth throttling conservation */
{
  for (const cpus of [0.25, 0.5, 1.0, 2.0]) {
    for (const periodMs of [10, 20, 100]) {
      for (const threads of [1, 2, 4, 8]) {
        const c = M.cfsThrottleModel({ cpus, periodMs, threads });
        const expectedTotalCpu = c.throttled ? c.quotaMs : c.effThreads * periodMs;
        cmp(`CFS conservation (cpus=${cpus},p=${periodMs},t=${threads})`, c.burnMs * c.effThreads, expectedTotalCpu, 0.05);
      }
    }
  }
}

/* 7. cgroups v2 memory accounting, page cache reclaim, and OOM threshold */
{
  const m1 = M.cgroupMemoryModel({ memMaxMiB: 512, highPct: 80, anonMiB: 240, pageCacheMiB: 220, tmpfsMiB: 0 });
  const m2 = M.cgroupMemoryModel({ memMaxMiB: 512, highPct: 80, anonMiB: 240, pageCacheMiB: 220, tmpfsMiB: 300 });
  cmp('Memory reclaim protects process below memory.max', [m1.memHighMiB, m1.currentMiB, m1.reclaimedCacheMiB, m1.oomKilled], [410, 410, 50, false], 0);
  cmp('tmpfs + anon > memory.max triggers OOM-kill', [m2.unreclaimableMiB, m2.oomKilled, m2.status], [540, true, 'oom']);
}

/* 8. seccomp-bpf + Capabilities + LSM gate order */
{
  const gMountDef = M.seccompCapModel({ probe: 'mount_fs' });
  const gMountNoSec = M.seccompCapModel({ probe: 'mount_fs', seccomp: false, capSysAdmin: false });
  const gMountAdmin = M.seccompCapModel({ probe: 'mount_fs', seccomp: false, capSysAdmin: true, lsm: true });
  const gMountPriv = M.seccompCapModel({ probe: 'mount_fs', seccomp: false, capSysAdmin: true, lsm: false });
  cmp('mount() blocked at seccomp first', [gMountDef.verdict, gMountDef.blockedAt], ['EPERM', 'seccomp']);
  cmp('mount() without seccomp blocked at Capabilities', [gMountNoSec.verdict, gMountNoSec.blockedAt], ['EPERM', 'caps']);
  cmp('mount() with CAP_SYS_ADMIN still blocked by LSM', [gMountAdmin.verdict, gMountAdmin.blockedAt], ['EACCES', 'lsm']);
  cmp('mount() with all checks disabled -> ALLOW', [gMountPriv.verdict, gMountPriv.blockedAt], ['ALLOW', 'none']);
}

/* 9. PID 1 signal & zombie reaping state machine */
{
  const sHang = M.pid1SignalModel({ mode: 'shell', timeSec: 10, spawnRate: 3, sendStop: true });
  const sKill = M.pid1SignalModel({ mode: 'shell', timeSec: 15, spawnRate: 3, sendStop: true });
  const sExec = M.pid1SignalModel({ mode: 'exec', timeSec: 15, spawnRate: 3, sendStop: true });
  const sInit = M.pid1SignalModel({ mode: 'init', timeSec: 15, spawnRate: 3, sendStop: true });
  cmp('PID 1 shell hangs at 10s', [sHang.state, sHang.sigtermWaitSec, sHang.exitCode], ['ignoring-sigterm', 5, null]);
  cmp('PID 1 shell killed at 15s with 137', [sKill.state, sKill.sigtermWaitSec, sKill.exitCode], ['killed-sigkill', 10, 137]);
  cmp('PID 1 exec exits cleanly (0) but leaked zombies before exit', [sExec.state, sExec.exitCode, sExec.peakZombies], ['exited-clean', 0, 18]);
  cmp('PID 1 init (tini) exits cleanly (0) with 0 zombies', [sInit.state, sInit.exitCode, sInit.peakZombies], ['exited-clean', 0, 0]);
}

console.log(rows.join('\n'));
console.log(`${n - bad}/${n} comparisons agree`);
process.exit(bad ? 1 : 0);
