// Prose numbers bound at build time from models.js ({=name} in content.*.md).
// Language-neutral strings only; tests/models.cjs pins every value and
// tools/crosscheck.cjs verifies the underlying compiler outputs against /usr/bin/clang.
module.exports = M => {
  const b = {};
  const f = (x, d) => M.fmt(x, d == null ? 0 : d, 'en');

  // ch1: N x M vs N + 1 + M architecture matrix (default 6 frontends, 5 backends, 10 passes)
  const a1 = M.archScale({ frontends: 6, backends: 5, passes: 10 });
  b['ch1.frontends'] = String(a1.frontends);
  b['ch1.backends'] = String(a1.backends);
  b['ch1.monoPairs'] = String(a1.monoPairs);
  b['ch1.llvmEdges'] = String(a1.llvmEdges);
  b['ch1.monoPasses'] = f(a1.monoPassImpls, 0);
  b['ch1.llvmPasses'] = f(a1.llvmPassImpls, 0);

  // ch2: -O0 alloca vs -O2 register promotion for sum_array (8 iterations)
  const s2 = M.simAlloca({ snippet: 'sum_array', iters: 8, promoted: false });
  b['ch2.allocas'] = String(s2.allocas);
  b['ch2.stackBytes'] = String(s2.stackBytes);
  b['ch2.o0Mem'] = String(s2.o0MemOps);
  b['ch2.o2Mem'] = String(s2.o2MemOps);
  b['ch2.savedMem'] = String(s2.savedMemOps);

  // ch3: mem2reg / dominance frontier phi insertion
  const m3 = M.runMem2Reg({ preset: 'diamond', runPass: true });
  b['ch3.beforeMem'] = String(m3.beforeMemOps);
  b['ch3.afterMem'] = String(m3.afterMemOps);
  b['ch3.phiCount'] = String(m3.phiCount);

  // ch4: pass pipeline fixed point on dead_branch
  const p4 = M.stepPipeline({ preset: 'dead_branch', round: 3 });
  b['ch4.startOps'] = String(p4.startOps);
  b['ch4.endOps'] = String(p4.endOps);
  b['ch4.rounds'] = String(p4.maxRounds);

  // ch5: LICM + SIMD <4 x i32> vectorization (n = 20, vf = 4)
  const l5 = M.loopOptSim({ n: 20, aliasMode: 'restrict', vf: 4, licm: true });
  b['ch5.unoptOps'] = String(l5.scalarUnoptOps);
  b['ch5.vecOps'] = String(l5.totalOps);
  b['ch5.vecIters'] = String(l5.vecIters);

  // ch6: Signed integer overflow UB
  b['ch6.intMax'] = f(M.INT32_MAX, 0);
  b['ch6.intMin'] = f(M.INT32_MIN, 0);

  // ch7: Instruction Selection (FMA & shift-add)
  const i7arm = M.iselSim({ preset: 'fma', arch: 'arm64', fuse: true });
  const i7x86 = M.iselSim({ preset: 'fma', arch: 'x86_64', fuse: true });
  b['ch7.armFma'] = String(i7arm.insnCount);
  b['ch7.x86Fma'] = String(i7x86.insnCount);

  // ch8: Register Allocation (chain scenario, maxLive = 4)
  const r8k3 = M.regAllocSim({ scenario: 'chain', K: 3, algo: 'graph' });
  const r8k4 = M.regAllocSim({ scenario: 'chain', K: 4, algo: 'graph' });
  b['ch8.maxLive'] = String(r8k3.maxLive);
  b['ch8.spillsK3'] = String(r8k3.spillCount);
  b['ch8.spillsK4'] = String(r8k4.spillCount);
  b['ch8.spillInsnsK3'] = String(r8k3.spillInsns);

  // ch9: ThinLTO cross-TU inlining & link memory (16 TUs)
  const t9none = M.ltoSim({ mode: 'none', tus: 16, threshold: 30, pgo: true });
  const t9thin = M.ltoSim({ mode: 'thin', tus: 16, threshold: 30, pgo: true });
  const t9full = M.ltoSim({ mode: 'full', tus: 16, threshold: 30, pgo: true });
  b['ch9.noLtoCalls'] = String(t9none.remainingCalls);
  b['ch9.thinMem'] = f(t9thin.peakMemPerWorkerMB, 1);
  b['ch9.fullMem'] = f(t9full.peakMemPerWorkerMB, 1);
  b['ch9.noLtoMain'] = String(t9thin.noLtoMainInsns);
  b['ch9.thinLtoMain'] = String(t9thin.thinLtoMainInsns);

  return b;
};
