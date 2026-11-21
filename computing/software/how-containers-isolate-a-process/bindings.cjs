// Numbers in the prose, computed from models.js at build time ({=name} in content.*.md).
// Language-neutral: the same string goes into both languages. tests/models.cjs pins every value;
// tools/crosscheck.cjs validates SHA-256 digests and kernel spec invariants against Node crypto.
module.exports = M => {
  const b = {};
  const f = (x, d) => M.fmt(x, d, 'en');

  /* ch1: isolation boundary & footprint */
  const c8 = M.isolationProfile('container', 8);
  const m8 = M.isolationProfile('microvm', 8);
  const v8 = M.isolationProfile('vm', 8);
  b['ch1.cBoot'] = f(c8.bootMs, 0);
  b['ch1.mBoot'] = f(m8.bootMs, 0);
  b['ch1.vmBoot'] = f(v8.bootMs, 0);
  b['ch1.cTotal8'] = f(c8.totalMb, 1);
  b['ch1.vmTotal8'] = f(v8.totalMb, 0);

  /* ch2: OCI image layers & ChainID deduplication */
  const o2 = M.ociLayersModel({ mutate: 'none', replicas: 2 });
  const o10 = M.ociLayersModel({ mutate: 'none', replicas: 10 });
  b['ch2.img'] = f(o2.singleImageMiB, 0);
  b['ch2.shared'] = f(o2.sharedMiB, 0);
  b['ch2.stored2'] = f(o2.storedMiB, 0);
  b['ch2.naive2'] = f(o2.naiveMiB, 0);
  b['ch2.tenShared'] = f(o10.sharedMiB, 0);
  b['ch2.tenStored'] = f(o10.storedMiB, 0);
  b['ch2.tenNaive'] = f(o10.naiveMiB, 0);

  /* ch3: OverlayFS copy-up & whiteout */
  const ovApp = M.overlayfsModel('append');
  const ovSplit = M.overlayfsModel('rm-split');
  const ovSame = M.overlayfsModel('rm-same');
  b['ch3.modelSize'] = f(ovApp.copyUpMiB, 0);
  b['ch3.pkgSize'] = f(ovSplit.wastedMiB, 0);
  b['ch3.splitTotal'] = f(ovSplit.totalStoredMiB, 1);
  b['ch3.sameTotal'] = f(ovSame.totalStoredMiB, 1);

  /* ch4: Linux Namespaces & UID mapping */
  const nsRootless = M.namespaceModel({ userNs: true });
  const nsHost = M.namespaceModel({ pidNs: false });
  b['ch4.nsTotal'] = String(M.NS_ALL.length);
  b['ch4.hostPid'] = String(nsRootless.hostPid);
  b['ch4.uidBase'] = String(nsRootless.uidOutside);
  b['ch4.hostProcs'] = String(nsHost.visibleProcs);
  b['ch4.ctProcs'] = String(nsRootless.visibleProcs);

  /* ch5: veth, bridge, NAT & eBPF */
  const netBr = M.networkModel({ mode: 'bridge-nat', vxlan: true });
  const netEbpf = M.networkModel({ mode: 'ebpf-host', vxlan: true });
  b['ch5.vxlan'] = String(netBr.vxlanOverhead);
  b['ch5.mtu'] = String(netBr.mtuLimit);
  b['ch5.bridgeNs'] = f(netBr.cpuNsPerPkt, 0);
  b['ch5.ebpfNs'] = f(netEbpf.cpuNsPerPkt, 0);

  /* ch6: cgroups v2 CPU bandwidth throttling */
  const cfs4 = M.cfsThrottleModel({ cpus: 0.5, periodMs: 100, threads: 4 });
  const cfs10 = M.cfsThrottleModel({ cpus: 0.5, periodMs: 10, threads: 4 });
  b['ch6.quota'] = f(cfs4.quotaMs, 0);
  b['ch6.period'] = f(cfs4.periodMs, 0);
  b['ch6.burn4'] = f(cfs4.burnMs, 1);
  b['ch6.freeze4'] = f(cfs4.freezeMs, 1);
  b['ch6.rpc4'] = f(cfs4.singleBurstRpcMs, 1);
  b['ch6.freeze10'] = f(cfs10.freezeMs, 2);

  /* ch7: cgroups v2 memory accounting */
  const memDef = M.cgroupMemoryModel({ memMaxMiB: 512, highPct: 80, anonMiB: 240, pageCacheMiB: 220, tmpfsMiB: 0 });
  b['ch7.max'] = f(memDef.memMaxMiB, 0);
  b['ch7.high'] = f(memDef.memHighMiB, 0);
  b['ch7.reclaimed'] = f(memDef.reclaimedCacheMiB, 0);
  b['ch7.psi'] = f(memDef.psiPct, 1) + '%';

  /* ch8: seccomp-bpf & capabilities */
  b['ch8.totalSys'] = String(M.SECCOMP_COUNTS.total);
  b['ch8.allowedSys'] = String(M.SECCOMP_COUNTS.allowedDefault);
  b['ch8.blockedSys'] = String(M.SECCOMP_COUNTS.blockedDefault);

  /* ch9: PID 1 signal & zombie reaping */
  const pRun = M.pid1SignalModel({ mode: 'shell', timeSec: 5, spawnRate: 3, sendStop: false });
  const pKill = M.pid1SignalModel({ mode: 'shell', timeSec: 15, spawnRate: 3, sendStop: true });
  b['ch9.grace'] = String(pKill.graceSec);
  b['ch9.exitKill'] = String(pKill.exitCode);
  b['ch9.zombies5'] = String(pRun.peakZombies);

  /* ch10: frontier (Firecracker NSDI 2020) */
  b['ch10.fcMem'] = String(M.FIRECRACKER_SPEC.memOverheadMaxMiB);
  b['ch10.fcBoot'] = String(M.FIRECRACKER_SPEC.bootMsMax);

  return b;
};
