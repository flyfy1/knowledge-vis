/* Deterministic compiler models for "How LLVM Compiles Your Code" (UMD: browser + Node).
   Pinned host reference: Apple clang version 21.0.0 (clang-2100.4.1.1), target arm64-apple-darwin27.2.0
   (LLVM 21 opaque-pointer IR; clang-only Xcode Command Line Tools driver without standalone opt/llc binaries).
   Zero external dependencies. Every algorithm is implemented directly at small scale. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.LlvmModels = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const HOST_RELEASE = {
    driver: 'Apple clang version 21.0.0 (clang-2100.4.1.1)',
    llvmBase: 'LLVM 21',
    target: 'arm64-apple-darwin27.2.0',
    irTriple: 'arm64-apple-macosx27.2.0',
    opaquePointers: true,
    hasStandaloneOpt: false,
    hasStandaloneLlc: false,
  };

  function fmt(x, d, locale) {
    if (!isFinite(x)) return '∞';
    const dec = d == null ? 0 : d;
    const neg = x < 0 ? '−' : '';
    const v = Math.abs(x);
    const fixed = v.toFixed(dec);
    const [intPart, fracPart] = fixed.split('.');
    const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return neg + grouped + (fracPart != null ? '.' + fracPart : '');
  }

  /* ───────── ch1: 3-phase decoupled compiler matrix (N × M vs N + 1 + M) ───────── */
  const ARCH_FRONTENDS = [
    { id: 'clang', label: 'Clang (C/C++)', snippet: 'int add_mul(int x, int y) { return x * 3 + y; }' },
    { id: 'rustc', label: 'rustc (Rust)', snippet: 'pub fn add_mul(x: i32, y: i32) -> i32 { x * 3 + y }' },
    { id: 'swiftc', label: 'swiftc (Swift)', snippet: 'func add_mul(_ x: Int32, _ y: Int32) -> Int32 { x * 3 + y }' },
    { id: 'julia', label: 'Julia', snippet: 'add_mul(x::Int32, y::Int32) = x * Int32(3) + y' },
  ];

  const ARCH_BACKENDS = [
    { id: 'arm64', label: 'AArch64 (Apple Silicon)', asm: 'add w8, w0, w0, lsl #1\nadd w0, w8, w1\nret' },
    { id: 'x86_64', label: 'x86_64', asm: 'leal (%rdi,%rdi,2), %eax\naddl %esi, %eax\nretq' },
    { id: 'riscv64', label: 'RISC-V (RV64)', asm: 'slli a2, a0, 1\naddw a0, a2, a0\naddw a0, a0, a1\nret' },
    { id: 'wasm32', label: 'WebAssembly', asm: 'local.get 0\ni32.const 3\ni32.mul\nlocal.get 1\ni32.add' },
  ];

  function archScale(opts) {
    const o = opts || {};
    const frontends = Math.max(1, Math.min(8, Math.round(o.frontends == null ? 6 : o.frontends)));
    const backends = Math.max(1, Math.min(8, Math.round(o.backends == null ? 5 : o.backends)));
    const passes = Math.max(1, Math.min(20, Math.round(o.passes == null ? 10 : o.passes)));
    const monolithic = !!o.monolithic;
    const monoPairs = frontends * backends;
    const llvmEdges = frontends + backends;
    const monoPassImpls = monoPairs * passes;
    const llvmPassImpls = passes;
    const monoComponents = monoPairs + monoPassImpls;
    const llvmComponents = frontends + passes + backends;
    const ratio = monoComponents / llvmComponents;
    return {
      frontends, backends, passes, monolithic,
      monoPairs, llvmEdges,
      monoPassImpls, llvmPassImpls,
      monoComponents, llvmComponents,
      savedPairs: monoPairs - llvmEdges,
      savedComponents: monoComponents - llvmComponents,
      ratio,
      activePairs: monolithic ? monoPairs : llvmEdges,
      activePasses: monolithic ? monoPassImpls : llvmPassImpls,
    };
  }

  /* ───────── ch2: AST to -O0 IR (alloca stack slots vs register promotion) ───────── */
  /* Counts match live Apple Clang 21.0.0 IR output (`probe_O0.ll` / `ssa_demo.c`) */
  const O0_SNIPPETS = {
    sum_array: {
      id: 'sum_array',
      allocas: 4, // ptr %a, i32 %n, i32 %s, i32 %i
      stackBytes: 20, // 8 + 4 + 4 + 4
      entryStores: 4,
      exitLoads: 3, // final cond check (2 loads) + ret load (1 load)
      perIterStackLoads: 6, // cond(2) + body(3) + latch(1)
      perIterStackStores: 2, // body(%s) + latch(%i)
      perIterArrayLoads: 1,
      perIterO0Insns: 15, // cmp+br + gep+load+load+add+store+br + load+add+store+br + 3 cond loads
      o2FixedStackOps: 0,
      o2PerIterArrayLoads: 1,
      o2PerIterInsns: 5, // phi-based loop without vector unroll: gep + load + add + add + icmp/br
      o0Snippet: '%5 = alloca i32, align 4\n%6 = alloca i32, align 4\nstore i32 0, ptr %5\n%17 = load i32, ptr %5\n%18 = add nsw i32 %17, %16\nstore i32 %18, ptr %5',
      o2Snippet: '%62 = phi i64 [ %67, %61 ], [ %8, %7 ]\n%63 = phi i32 [ %66, %61 ], [ %9, %7 ]\n%65 = load i32, ptr %64, align 4\n%66 = add nsw i32 %65, %63',
    },
    pick_phi: {
      id: 'pick_phi',
      allocas: 4, // cond, a, b, x
      stackBytes: 16,
      entryStores: 4,
      exitLoads: 1, // ret load
      perIterStackLoads: 3, // load a, load cond, load b (when cond=1)
      perIterStackStores: 2, // store x initial + store x in branch
      perIterArrayLoads: 0,
      perIterO0Insns: 12,
      o2FixedStackOps: 0,
      o2PerIterArrayLoads: 0,
      o2PerIterInsns: 5, // add, icmp, shl, select, add
      o0Snippet: '%7 = alloca i32, align 4\nstore i32 %9, ptr %7\n...\nstore i32 %14, ptr %7\n%16 = load i32, ptr %7',
      o2Snippet: '%4 = add nsw i32 %1, 1\n%6 = shl nsw i32 %2, 1\n%7 = select i1 %5, i32 %4, i32 %6',
    },
  };

  function simAlloca(opts) {
    const o = opts || {};
    const snippetId = O0_SNIPPETS[o.snippet] ? o.snippet : 'sum_array';
    const S = O0_SNIPPETS[snippetId];
    const iters = Math.max(1, Math.min(32, Math.round(o.iters == null ? 8 : o.iters)));
    const promoted = !!o.promoted;
    const effIters = snippetId === 'pick_phi' ? 1 : iters;
    const stackLoadsO0 = S.exitLoads + S.perIterStackLoads * effIters;
    const stackStoresO0 = S.entryStores + S.perIterStackStores * effIters;
    const stackMemOpsO0 = stackLoadsO0 + stackStoresO0;
    const arrayLoads = S.perIterArrayLoads * effIters;
    const totalMemOpsO0 = stackMemOpsO0 + arrayLoads;
    const totalMemOpsO2 = S.o2FixedStackOps + S.o2PerIterArrayLoads * effIters;
    const o0Insns = S.allocas + S.entryStores + S.exitLoads + S.perIterO0Insns * effIters;
    const o2Insns = S.o2PerIterInsns * effIters + (snippetId === 'sum_array' ? 3 : 1);
    return {
      snippet: snippetId,
      iters: effIters,
      promoted,
      allocas: promoted ? 0 : S.allocas,
      stackBytes: promoted ? 0 : S.stackBytes,
      stackMemOps: promoted ? 0 : stackMemOpsO0,
      stackLoads: promoted ? 0 : stackLoadsO0,
      stackStores: promoted ? 0 : stackStoresO0,
      arrayLoads,
      totalMemOps: promoted ? totalMemOpsO2 : totalMemOpsO0,
      o0MemOps: totalMemOpsO0,
      o2MemOps: totalMemOpsO2,
      savedMemOps: totalMemOpsO0 - totalMemOpsO2,
      irInsns: promoted ? o2Insns : o0Insns,
      o0Snippet: S.o0Snippet,
      o2Snippet: S.o2Snippet,
    };
  }

  /* ───────── ch3: SSA & mem2reg (real Dominance Frontier + phi insertion + renaming) ───────── */
  const CFG_PRESETS = {
    diamond: {
      id: 'diamond',
      entry: 'B0',
      blocks: [
        { id: 'B0', label: 'entry', x: 0.5, y: 0.14, defs: ['x'], uses: [], ops: ['alloca x', 'x = a + 1'] },
        { id: 'B1', label: 'then', x: 0.24, y: 0.48, defs: ['x'], uses: [], ops: ['x = b * 2'] },
        { id: 'B2', label: 'else', x: 0.76, y: 0.48, defs: ['x'], uses: [], ops: ['x = a - 3'] },
        { id: 'B3', label: 'merge', x: 0.5, y: 0.84, defs: [], uses: ['x'], ops: ['ret x + 5'] },
      ],
      edges: [['B0', 'B1'], ['B0', 'B2'], ['B1', 'B3'], ['B2', 'B3']],
      beforeStackOps: 7, // 1 alloc + 3 stores + 1 load (+entry param)
    },
    ifThen: {
      id: 'ifThen',
      entry: 'B0',
      blocks: [
        { id: 'B0', label: 'entry', x: 0.5, y: 0.14, defs: ['x'], uses: [], ops: ['alloca x', 'x = a + 1'] },
        { id: 'B1', label: 'then', x: 0.22, y: 0.50, defs: ['x'], uses: [], ops: ['x = ext(b)'] },
        { id: 'B2', label: 'merge', x: 0.5, y: 0.84, defs: [], uses: ['x'], ops: ['ret x + 5'] },
      ],
      edges: [['B0', 'B1'], ['B0', 'B2'], ['B1', 'B2']],
      beforeStackOps: 5,
    },
    loop: {
      id: 'loop',
      entry: 'B0',
      blocks: [
        { id: 'B0', label: 'entry', x: 0.5, y: 0.12, defs: ['x'], uses: [], ops: ['alloca x', 'x = 0'] },
        { id: 'B1', label: 'header', x: 0.5, y: 0.42, defs: [], uses: ['x'], ops: ['cmp i < n'] },
        { id: 'B2', label: 'body', x: 0.22, y: 0.72, defs: ['x'], uses: ['x'], ops: ['x = x + a[i]'] },
        { id: 'B3', label: 'exit', x: 0.78, y: 0.76, defs: [], uses: ['x'], ops: ['ret x'] },
      ],
      edges: [['B0', 'B1'], ['B1', 'B2'], ['B2', 'B1'], ['B1', 'B3']],
      beforeStackOps: 8,
    },
    chained: {
      id: 'chained',
      entry: 'B0',
      blocks: [
        { id: 'B0', label: 'entry', x: 0.5, y: 0.10, defs: ['x'], uses: [], ops: ['x = 1'] },
        { id: 'B1', label: 'left1', x: 0.25, y: 0.34, defs: ['x'], uses: [], ops: ['x = a'] },
        { id: 'B2', label: 'mid', x: 0.5, y: 0.56, defs: [], uses: ['x'], ops: ['t = x + 2'] },
        { id: 'B3', label: 'right2', x: 0.76, y: 0.74, defs: ['x'], uses: ['x'], ops: ['x = x * 3'] },
        { id: 'B4', label: 'exit', x: 0.5, y: 0.90, defs: [], uses: ['x'], ops: ['ret x'] },
      ],
      edges: [['B0', 'B1'], ['B0', 'B2'], ['B1', 'B2'], ['B2', 'B3'], ['B2', 'B4'], ['B3', 'B4']],
      beforeStackOps: 9,
    },
  };

  function computeDominators(blocks, edges, entry) {
    const ids = blocks.map(b => b.id);
    const preds = Object.fromEntries(ids.map(id => [id, []]));
    const succs = Object.fromEntries(ids.map(id => [id, []]));
    for (const [u, v] of edges) {
      succs[u].push(v);
      preds[v].push(u);
    }
    const dom = Object.fromEntries(ids.map(id => [id, new Set(id === entry ? [entry] : ids)]));
    let changed = true;
    while (changed) {
      changed = false;
      for (const b of ids) {
        if (b === entry) continue;
        const ps = preds[b];
        if (!ps.length) continue;
        const inter = new Set(dom[ps[0]]);
        for (let i = 1; i < ps.length; i++) {
          for (const x of inter) if (!dom[ps[i]].has(x)) inter.delete(x);
        }
        inter.add(b);
        if (inter.size !== dom[b].size || [...inter].some(x => !dom[b].has(x))) {
          dom[b] = inter;
          changed = true;
        }
      }
    }
    const idom = {};
    for (const b of ids) {
      if (b === entry) { idom[b] = null; continue; }
      const strict = [...dom[b]].filter(d => d !== b);
      // immediate dominator is the strict dominator dominated by all other strict dominators
      idom[b] = strict.find(cand => strict.every(other => dom[cand].has(other))) || entry;
    }
    // Dominance Frontier (Cytron et al. 1991)
    const df = Object.fromEntries(ids.map(id => [id, new Set()]));
    for (const b of ids) {
      if (preds[b].length >= 2) {
        for (const p of preds[b]) {
          let runner = p;
          while (runner && runner !== idom[b]) {
            df[runner].add(b);
            runner = idom[runner];
          }
        }
      }
    }
    return { preds, succs, dom, idom, df };
  }

  function runMem2Reg(opts) {
    const o = opts || {};
    const presetId = CFG_PRESETS[o.preset] ? o.preset : 'diamond';
    const P = CFG_PRESETS[presetId];
    const runPass = o.runPass == null ? true : !!o.runPass;
    const { preds, succs, dom, idom, df } = computeDominators(P.blocks, P.edges, P.entry);

    // Iterated dominance frontier for variable 'x'
    const defBlocks = P.blocks.filter(b => b.defs.includes('x')).map(b => b.id);
    const phiSet = new Set();
    const work = [...defBlocks];
    const inWork = new Set(work);
    while (work.length) {
      const b = work.shift();
      for (const y of df[b]) {
        if (!phiSet.has(y)) {
          phiSet.add(y);
          if (!inWork.has(y)) {
            inWork.add(y);
            work.push(y);
          }
        }
      }
    }

    // Dominator tree children for SSA renaming
    const domChildren = Object.fromEntries(P.blocks.map(b => [b.id, []]));
    for (const b of P.blocks) if (idom[b.id]) domChildren[idom[b.id]].push(b.id);

    let nextVer = 0;
    const stack = ['undef'];
    const blockInfo = {};
    for (const b of P.blocks) blockInfo[b.id] = { phiDef: null, phiInputs: [], defVer: null, useVers: [] };

    function rename(bId) {
      const b = P.blocks.find(x => x.id === bId);
      let pushed = 0;
      if (phiSet.has(bId)) {
        const v = `%x.${nextVer++}`;
        blockInfo[bId].phiDef = v;
        stack.push(v);
        pushed++;
      }
      if (b.uses.includes('x')) {
        blockInfo[bId].useVers.push(stack[stack.length - 1]);
      }
      if (b.defs.includes('x')) {
        const v = `%x.${nextVer++}`;
        blockInfo[bId].defVer = v;
        stack.push(v);
        pushed++;
      }
      for (const s of succs[bId]) {
        if (phiSet.has(s)) {
          blockInfo[s].phiInputs.push({ from: bId, val: stack[stack.length - 1] });
        }
      }
      for (const c of domChildren[bId]) rename(c);
      for (let i = 0; i < pushed; i++) stack.pop();
    }
    rename(P.entry);

    const phiBlocks = [...phiSet];
    const outBlocks = P.blocks.map(b => ({
      id: b.id,
      label: b.label,
      x: b.x,
      y: b.y,
      idom: idom[b.id],
      df: [...df[b.id]],
      hasPhi: runPass && phiSet.has(b.id),
      phiText: runPass && blockInfo[b.id].phiDef
        ? `${blockInfo[b.id].phiDef} = phi i32 ${blockInfo[b.id].phiInputs.map(p => `[ ${p.val}, %${p.from} ]`).join(', ')}`
        : null,
      defVer: runPass ? blockInfo[b.id].defVer : null,
      useVers: runPass ? blockInfo[b.id].useVers : [],
      ops: b.ops,
    }));

    return {
      preset: presetId,
      runPass,
      blocks: outBlocks,
      edges: P.edges,
      idom,
      df: Object.fromEntries(Object.entries(df).map(([k, s]) => [k, [...s]])),
      phiBlocks,
      phiCount: runPass ? phiBlocks.length : 0,
      versionsCreated: runPass ? nextVer : 0,
      beforeMemOps: P.beforeStackOps,
      afterMemOps: runPass ? 0 : P.beforeStackOps,
    };
  }

  /* ───────── ch4: Pass pipeline fixed-point stepper ───────── */
  const PIPELINE_PRESETS = {
    dead_branch: {
      id: 'dead_branch',
      rounds: [
        {
          pass: 'raw (-O0)',
          detailKey: 'raw',
          memOps: 6,
          deadOps: 5,
          lines: [
            { text: '%x.slot = alloca i32', live: true, tag: 'mem' },
            { text: 'store i32 %arg0, ptr %x.slot', live: true, tag: 'mem' },
            { text: '%0 = load i32, ptr %x.slot', live: true, tag: 'mem' },
            { text: '%mul = mul nsw i32 %0, 2', live: true },
            { text: '%a = add nsw i32 %mul, 0', live: true },
            { text: '%b = sub nsw i32 %a, %a', live: true },
            { text: '%c = icmp ne i32 %b, 0', live: true },
            { text: 'br i1 %c, label %dead, label %live', live: true },
            { text: 'dead: ret i32 999', live: true, tag: 'dead' },
            { text: 'live: %r = add nsw i32 %a, 3', live: true },
            { text: 'ret i32 %r', live: true },
          ],
        },
        {
          pass: 'SROA',
          detailKey: 'sroa',
          memOps: 0,
          deadOps: 5,
          lines: [
            { text: '%mul = mul nsw i32 %arg0, 2', live: true },
            { text: '%a = add nsw i32 %mul, 0', live: true },
            { text: '%b = sub nsw i32 %a, %a', live: true },
            { text: '%c = icmp ne i32 %b, 0', live: true },
            { text: 'br i1 %c, label %dead, label %live', live: true },
            { text: 'dead: ret i32 999', live: true, tag: 'dead' },
            { text: 'live: %r = add nsw i32 %a, 3', live: true },
            { text: 'ret i32 %r', live: true },
          ],
        },
        {
          pass: 'InstCombine',
          detailKey: 'instcombine',
          memOps: 0,
          deadOps: 1,
          lines: [
            { text: '%mul = shl nsw i32 %arg0, 1', live: true, tag: 'opt' },
            { text: 'br i1 false, label %dead, label %live', live: true, tag: 'opt' },
            { text: 'dead: ret i32 999', live: false, tag: 'dead' },
            { text: 'live: %r = add nsw i32 %mul, 3', live: true },
            { text: 'ret i32 %r', live: true },
          ],
        },
        {
          pass: 'SimplifyCFG + ADCE',
          detailKey: 'simplifycfg',
          memOps: 0,
          deadOps: 0,
          lines: [
            { text: '%mul = shl nsw i32 %arg0, 1', live: true, tag: 'opt' },
            { text: '%r = add nsw i32 %mul, 3', live: true, tag: 'opt' },
            { text: 'ret i32 %r', live: true },
          ],
        },
      ],
    },
    inline_fold: {
      id: 'inline_fold',
      rounds: [
        {
          pass: 'raw (-O0)',
          detailKey: 'raw',
          memOps: 4,
          deadOps: 2,
          lines: [
            { text: '%p1 = alloca i32', live: true, tag: 'mem' },
            { text: '%p2 = alloca i32', live: true, tag: 'mem' },
            { text: 'store i32 10, ptr %p1', live: true, tag: 'mem' },
            { text: 'store i32 12, ptr %p2', live: true, tag: 'mem' },
            { text: '%v = call i32 @add_mul(i32 10, i32 12)', live: true },
            { text: 'ret i32 %v', live: true },
          ],
        },
        {
          pass: 'SROA + Inline',
          detailKey: 'inline',
          memOps: 0,
          deadOps: 2,
          lines: [
            { text: '%t0 = mul nsw i32 10, 3', live: true, tag: 'opt' },
            { text: '%t1 = add nsw i32 %t0, 12', live: true, tag: 'opt' },
            { text: 'ret i32 %t1', live: true },
          ],
        },
        {
          pass: 'InstCombine + DCE',
          detailKey: 'fold',
          memOps: 0,
          deadOps: 0,
          lines: [
            { text: 'ret i32 42', live: true, tag: 'opt' },
          ],
        },
      ],
    },
    cse_chain: {
      id: 'cse_chain',
      rounds: [
        {
          pass: 'raw (-O0)',
          detailKey: 'raw',
          memOps: 5,
          deadOps: 2,
          lines: [
            { text: '%a.s = alloca i32', live: true, tag: 'mem' },
            { text: 'store i32 %a, ptr %a.s', live: true, tag: 'mem' },
            { text: '%0 = load i32, ptr %a.s', live: true, tag: 'mem' },
            { text: '%p1 = mul nsw i32 %0, %b', live: true },
            { text: '%p2 = mul nsw i32 %0, %b', live: true, tag: 'dead' },
            { text: '%sum = add nsw i32 %p1, %p2', live: true },
            { text: '%res = add nsw i32 %sum, 0', live: true },
            { text: 'ret i32 %res', live: true },
          ],
        },
        {
          pass: 'SROA + GVN',
          detailKey: 'gvn',
          memOps: 0,
          deadOps: 1,
          lines: [
            { text: '%p1 = mul nsw i32 %a, %b', live: true, tag: 'opt' },
            { text: '%sum = add nsw i32 %p1, %p1', live: true, tag: 'opt' },
            { text: '%res = add nsw i32 %sum, 0', live: true },
            { text: 'ret i32 %res', live: true },
          ],
        },
        {
          pass: 'InstCombine',
          detailKey: 'instcombine_cse',
          memOps: 0,
          deadOps: 0,
          lines: [
            { text: '%p1 = mul nsw i32 %a, %b', live: true },
            { text: '%sum = shl nsw i32 %p1, 1', live: true, tag: 'opt' },
            { text: 'ret i32 %sum', live: true },
          ],
        },
      ],
    },
  };

  function stepPipeline(opts) {
    const o = opts || {};
    const presetId = PIPELINE_PRESETS[o.preset] ? o.preset : 'dead_branch';
    const P = PIPELINE_PRESETS[presetId];
    const maxRounds = P.rounds.length - 1;
    const round = Math.max(0, Math.min(maxRounds, Math.round(o.round == null ? maxRounds : o.round)));
    const cur = P.rounds[round];
    const startOps = P.rounds[0].lines.length;
    const endOps = P.rounds[maxRounds].lines.length;
    const currentOps = cur.lines.length;
    const fixedPoint = round === maxRounds;
    return {
      preset: presetId,
      round,
      maxRounds,
      fixedPoint,
      passName: cur.pass,
      detailKey: cur.detailKey,
      startOps,
      endOps,
      currentOps,
      removedOps: startOps - currentOps,
      memOps: cur.memOps,
      deadOps: cur.deadOps,
      lines: cur.lines,
    };
  }

  /* ───────── ch5: LICM + Aliasing (restrict / TBAA) + SIMD LoopVectorize ───────── */
  function loopOptSim(opts) {
    const o = opts || {};
    const n = Math.max(4, Math.min(256, Math.round(o.n == null ? 20 : o.n)));
    const aliasMode = ['unknown', 'restrict', 'tbaa'].includes(o.aliasMode) ? o.aliasMode : 'unknown';
    const vf = [1, 4, 8].includes(Number(o.vf)) ? Number(o.vf) : 4;
    const licm = o.licm == null ? true : !!o.licm;
    const aliasOverlap = !!o.aliasOverlap; // runtime pointer overlap only possible in 'unknown'

    const staticNoAlias = aliasMode === 'restrict' || aliasMode === 'tbaa';
    const needsRuntimeCheck = aliasMode === 'unknown' && (licm || vf > 1);
    const runtimeFallsBack = aliasMode === 'unknown' && aliasOverlap;
    const hoisted = licm && (staticNoAlias || !runtimeFallsBack);
    const vectorized = vf > 1 && (staticNoAlias || !runtimeFallsBack);

    const effVf = vectorized ? vf : 1;
    const vecIters = vectorized ? Math.floor(n / effVf) : 0;
    const tailIters = vectorized ? (n % effVf) : n;

    // Scalar unoptimized baseline: n loads a[i] + n loads *b + n muls (*b*2) + n adds + n stores
    const scalarUnoptOps = n * 5;
    const scalarUnoptInvariantLoads = n;

    const preheaderLoads = hoisted ? 1 : 0;
    const preheaderMuls = hoisted ? 1 : 0;
    const invariantReloadsInLoop = hoisted ? 0 : n;
    const invariantMulsInLoop = hoisted ? 0 : n;

    // Vector loop iteration: 1 vec load a, 1 vec add, 1 vec store (3 vec ops per vecIter)
    // Scalar tail / fallback iteration: load a + add + store (+ reload/mul if not hoisted)
    const vecLoopOps = vecIters * 3;
    const tailLoopOps = tailIters * (hoisted ? 3 : 5);
    const guardChecks = needsRuntimeCheck ? 2 : 0; // overlap tests out vs a and out vs b
    const totalOps = preheaderLoads + preheaderMuls + guardChecks + vecLoopOps + tailLoopOps;

    return {
      n,
      aliasMode,
      vf,
      licm,
      aliasOverlap,
      staticNoAlias,
      needsRuntimeCheck,
      runtimeFallsBack,
      hoisted,
      vectorized,
      effVf,
      vecIters,
      tailIters,
      scalarUnoptOps,
      scalarUnoptInvariantLoads,
      preheaderOps: preheaderLoads + preheaderMuls,
      invariantReloadsInLoop,
      totalOps,
      savedOps: scalarUnoptOps - totalOps,
      speedupRatio: scalarUnoptOps / Math.max(1, totalOps),
    };
  }

  /* ───────── ch6: Undefined Behavior (nsw / poison) as Optimization License ───────── */
  const INT32_MAX = 2147483647;
  const INT32_MIN = -2147483648;

  function ubSim(opts) {
    const o = opts || {};
    const scenario = o.scenario === 'null' ? 'null' : 'overflow';
    const mode = o.mode === 'wrapv' ? 'wrapv' : 'nsw';
    const opt = o.opt === 'O0' ? 'O0' : 'O2';
    const x = o.x == null ? INT32_MAX : Math.max(INT32_MIN, Math.min(INT32_MAX, Math.round(o.x)));
    const pIsNull = !!o.pIsNull;

    if (scenario === 'overflow') {
      const hwWrapped = (x + 1) | 0;
      const hwResult = hwWrapped > x ? 1 : 0;
      const triggersOverflow = x === INT32_MAX;
      const irOp = mode === 'nsw' ? 'add nsw i32 %x, 1' : 'add i32 %x, 1';
      const poison = mode === 'nsw' && triggersOverflow;
      const branchEliminated = opt === 'O2' && mode === 'nsw';
      const compiledResult = branchEliminated ? 1 : hwResult;
      const mismatch = compiledResult !== hwResult;
      const o2Ir = branchEliminated
        ? 'ret i32 1'
        : opt === 'O2'
          ? '%2 = icmp ne i32 %x, 2147483647\n%3 = zext i1 %2 to i32\nret i32 %3'
          : `%1 = ${irOp}\n%2 = icmp sgt i32 %1, %x\n%3 = zext i1 %2 to i32\nret i32 %3`;
      return {
        scenario, mode, opt, x, pIsNull,
        hwWrapped, hwResult,
        triggersOverflow, poison,
        branchEliminated,
        compiledResult,
        mismatch,
        irOp,
        o2Ir,
      };
    }

    // Dereference before null check: int v = *p; if (!p) return 0; return v;
    const triggersNullUB = pIsNull;
    const branchEliminated = opt === 'O2' && mode === 'nsw'; // 'nsw' toggle acts as standard UB-enabled vs safe check
    const hwGuardSafe = !triggersNullUB ? 'deref_ok' : (branchEliminated ? 'crash_segfault' : 'returned_0');
    return {
      scenario, mode, opt, x, pIsNull,
      hwWrapped: 0,
      hwResult: triggersNullUB ? 0 : 42,
      triggersOverflow: triggersNullUB,
      poison: branchEliminated && triggersNullUB,
      branchEliminated,
      compiledResult: triggersNullUB ? (branchEliminated ? -1 : 0) : 42,
      mismatch: branchEliminated && triggersNullUB,
      hwGuardSafe,
      irOp: 'load i32, ptr %p',
      o2Ir: branchEliminated ? '%v = load i32, ptr %p\nret i32 %v ; null check deleted!' : '%v = load i32, ptr %p\n%c = icmp eq ptr %p, null\nbr i1 %c, label %ret0, label %ok',
    };
  }

  /* ───────── ch7: Instruction Selection (SelectionDAG / GlobalISel) ───────── */
  /* Instructions verified verbatim against Apple Clang 21.0.0 -S -O2 on arm64 & -target x86_64 */
  const ISEL_CASES = {
    fma: {
      id: 'fma',
      expr: 'a * b + c',
      nodes: [
        { id: 'n0', op: 'mul i32 %a, %b', x: 0.35, y: 0.34 },
        { id: 'n1', op: 'add i32 %t, %c', x: 0.65, y: 0.66 },
      ],
      edges: [['n0', 'n1']],
      irOps: 2,
      arm64: {
        fused: ['madd w0, w1, w0, w2', 'ret'],
        fusedTileCount: 1,
        unfused: ['mul w8, w0, w1', 'add w0, w8, w2', 'ret'],
        unfusedTileCount: 2,
      },
      x86_64: {
        fused: ['imull %esi, %edi', 'leal (%rdi,%rdx), %eax', 'retq'],
        fusedTileCount: 2,
        unfused: ['imull %esi, %edi', 'addl %edx, %edi', 'movl %edi, %eax', 'retq'],
        unfusedTileCount: 3,
      },
    },
    shiftAdd: {
      id: 'shiftAdd',
      expr: 'a + (b << 2)',
      nodes: [
        { id: 'n0', op: 'shl i32 %b, 2', x: 0.35, y: 0.34 },
        { id: 'n1', op: 'add i32 %a, %t', x: 0.65, y: 0.66 },
      ],
      edges: [['n0', 'n1']],
      irOps: 2,
      arm64: {
        fused: ['add w0, w0, w1, lsl #2', 'ret'],
        fusedTileCount: 1,
        unfused: ['lsl w8, w1, #2', 'add w0, w0, w8', 'ret'],
        unfusedTileCount: 2,
      },
      x86_64: {
        fused: ['leal (%rdi,%rsi,4), %eax', 'retq'],
        fusedTileCount: 1,
        unfused: ['shll $2, %esi', 'addl %esi, %edi', 'movl %edi, %eax', 'retq'],
        unfusedTileCount: 3,
      },
    },
    arrayLoad: {
      id: 'arrayLoad',
      expr: 'a[i] + c',
      nodes: [
        { id: 'n0', op: 'sext i32 %i -> i64', x: 0.22, y: 0.22 },
        { id: 'n1', op: 'getelementptr i32, ptr %a, %idx', x: 0.45, y: 0.42 },
        { id: 'n2', op: 'load i32, ptr %ptr', x: 0.66, y: 0.62 },
        { id: 'n3', op: 'add i32 %val, %c', x: 0.80, y: 0.82 },
      ],
      edges: [['n0', 'n1'], ['n1', 'n2'], ['n2', 'n3']],
      irOps: 4,
      arm64: {
        fused: ['ldr w8, [x0, w1, sxtw #2]', 'add w0, w8, w2', 'ret'],
        fusedTileCount: 2,
        unfused: ['sxtw x8, w1', 'lsl x8, x8, #2', 'add x8, x0, x8', 'ldr w8, [x8]', 'add w0, w8, w2', 'ret'],
        unfusedTileCount: 5,
      },
      x86_64: {
        fused: ['movslq %esi, %rcx', 'movl %edx, %eax', 'addl (%rdi,%rcx,4), %eax', 'retq'],
        fusedTileCount: 3,
        unfused: ['movslq %esi, %rcx', 'shlq $2, %rcx', 'addq %rdi, %rcx', 'movl (%rcx), %eax', 'addl %edx, %eax', 'retq'],
        unfusedTileCount: 5,
      },
    },
    scaleConst: {
      id: 'scaleConst',
      expr: 'x * 2 + 3',
      nodes: [
        { id: 'n0', op: 'shl nsw i32 %x, 1', x: 0.35, y: 0.34 },
        { id: 'n1', op: 'add nsw i32 %t, 3', x: 0.65, y: 0.66 },
      ],
      edges: [['n0', 'n1']],
      irOps: 2,
      arm64: {
        fused: ['lsl w8, w0, #1', 'add w0, w8, #3', 'ret'],
        fusedTileCount: 2,
        unfused: ['mov w8, #2', 'mul w8, w0, w8', 'add w0, w8, #3', 'ret'],
        unfusedTileCount: 3,
      },
      x86_64: {
        fused: ['leal 3(,%rdi,2), %eax', 'retq'],
        fusedTileCount: 1,
        unfused: ['shll $1, %edi', 'addl $3, %edi', 'movl %edi, %eax', 'retq'],
        unfusedTileCount: 3,
      },
    },
  };

  function iselSim(opts) {
    const o = opts || {};
    const preset = ISEL_CASES[o.preset] ? o.preset : 'fma';
    const arch = o.arch === 'x86_64' ? 'x86_64' : 'arm64';
    const fuse = o.fuse == null ? true : !!o.fuse;
    const C = ISEL_CASES[preset];
    const T = C[arch];
    const asm = fuse ? T.fused : T.unfused;
    const insnCount = fuse ? T.fusedTileCount : T.unfusedTileCount;
    return {
      preset, arch, fuse,
      expr: C.expr,
      irOps: C.irOps,
      nodes: C.nodes,
      edges: C.edges,
      asm,
      insnCount,
      unfusedCount: T.unfusedTileCount,
      fusedCount: T.fusedTileCount,
      savedInsns: T.unfusedTileCount - insnCount,
    };
  }

  /* ───────── ch8: Liveness, Interference Graph & Register Allocation (Chaitin-Briggs & Linear Scan) ───────── */
  const REGALLOC_SCENARIOS = {
    diamond: {
      id: 'diamond',
      len: 8,
      intervals: [
        { id: 'v0', start: 0, end: 7, uses: 3 },
        { id: 'v1', start: 1, end: 4, uses: 2 },
        { id: 'v2', start: 2, end: 5, uses: 2 },
        { id: 'v3', start: 4, end: 7, uses: 2 },
        { id: 'v4', start: 5, end: 8, uses: 2 },
        { id: 'v5', start: 6, end: 8, uses: 1 },
      ],
    },
    chain: {
      id: 'chain',
      len: 9,
      intervals: [
        { id: 'v0', start: 0, end: 8, uses: 4 },
        { id: 'v1', start: 1, end: 6, uses: 3 },
        { id: 'v2', start: 2, end: 5, uses: 2 },
        { id: 'v3', start: 3, end: 7, uses: 2 },
        { id: 'v4', start: 5, end: 9, uses: 2 },
        { id: 'v5', start: 6, end: 9, uses: 2 },
        { id: 'v6', start: 7, end: 9, uses: 1 },
      ],
    },
    pressure: {
      id: 'pressure',
      len: 10,
      intervals: [
        { id: 'v0', start: 0, end: 9, uses: 5 },
        { id: 'v1', start: 0, end: 8, uses: 4 },
        { id: 'v2', start: 1, end: 7, uses: 3 },
        { id: 'v3', start: 2, end: 6, uses: 2 },
        { id: 'v4', start: 3, end: 6, uses: 2 },
        { id: 'v5', start: 3, end: 5, uses: 1 },
        { id: 'v6', start: 6, end: 10, uses: 2 },
        { id: 'v7', start: 7, end: 10, uses: 2 },
      ],
    },
  };

  function buildInterference(intervals, len) {
    const edges = [];
    const adj = Object.fromEntries(intervals.map(iv => [iv.id, new Set()]));
    let maxLive = 0;
    for (let t = 0; t < len; t++) {
      const live = intervals.filter(iv => iv.start <= t && t < iv.end);
      if (live.length > maxLive) maxLive = live.length;
    }
    for (let i = 0; i < intervals.length; i++) {
      for (let j = i + 1; j < intervals.length; j++) {
        const a = intervals[i], b = intervals[j];
        if (Math.max(a.start, b.start) < Math.min(a.end, b.end)) {
          edges.push([a.id, b.id]);
          adj[a.id].add(b.id);
          adj[b.id].add(a.id);
        }
      }
    }
    return { edges, adj, maxLive };
  }

  function allocateGraphColoring(intervals, adj, K) {
    const remaining = new Set(intervals.map(iv => iv.id));
    const stack = [];
    const curDeg = id => [...adj[id]].filter(n => remaining.has(n)).length;
    const costOf = id => {
      const iv = intervals.find(x => x.id === id);
      return iv.uses / Math.max(1, iv.end - iv.start);
    };
    while (remaining.size) {
      let pick = [...remaining].find(id => curDeg(id) < K);
      if (!pick) {
        // Optimistic spill candidate: minimum spill cost (uses / live length)
        pick = [...remaining].sort((a, b) => costOf(a) - costOf(b) || a.localeCompare(b))[0];
      }
      remaining.delete(pick);
      stack.push(pick);
    }
    const color = {};
    const spilled = [];
    while (stack.length) {
      const id = stack.pop();
      const used = new Set([...adj[id]].map(n => color[n]).filter(c => c != null));
      let c = -1;
      for (let r = 0; r < K; r++) {
        if (!used.has(r)) { c = r; break; }
      }
      if (c >= 0) color[id] = c;
      else spilled.push(id);
    }
    return { color, spilled };
  }

  function allocateLinearScan(intervals, K) {
    const sorted = [...intervals].sort((a, b) => a.start - b.start || a.end - b.end);
    const active = [];
    const free = Array.from({ length: K }, (_, i) => i);
    const color = {};
    const spilled = [];

    for (const iv of sorted) {
      // Expire intervals ending at or before iv.start
      for (let i = active.length - 1; i >= 0; i--) {
        if (active[i].end <= iv.start) {
          free.push(color[active[i].id]);
          free.sort((a, b) => a - b);
          active.splice(i, 1);
        }
      }
      if (active.length === K) {
        // Spill active interval with largest end if it ends after iv.end
        active.sort((a, b) => b.end - a.end);
        const furthest = active[0];
        if (furthest.end > iv.end) {
          color[iv.id] = color[furthest.id];
          delete color[furthest.id];
          spilled.push(furthest.id);
          active[0] = iv;
        } else {
          spilled.push(iv.id);
        }
      } else {
        color[iv.id] = free.shift();
        active.push(iv);
      }
    }
    return { color, spilled };
  }

  function regAllocSim(opts) {
    const o = opts || {};
    const scenario = REGALLOC_SCENARIOS[o.scenario] ? o.scenario : 'chain';
    const S = REGALLOC_SCENARIOS[scenario];
    const K = Math.max(2, Math.min(6, Math.round(o.K == null ? 3 : o.K)));
    const algo = o.algo === 'linear' ? 'linear' : 'graph';
    const { edges, adj, maxLive } = buildInterference(S.intervals, S.len);
    const res = algo === 'linear'
      ? allocateLinearScan(S.intervals, K)
      : allocateGraphColoring(S.intervals, adj, K);

    const regsUsed = new Set(Object.values(res.color)).size;
    // Each spilled vreg needs 1 str (def spill) + `uses` ldr reloads on stack
    const spillInsns = res.spilled.reduce((acc, id) => {
      const iv = S.intervals.find(x => x.id === id);
      return acc + 1 + (iv ? iv.uses : 1);
    }, 0);

    return {
      scenario,
      K,
      algo,
      len: S.len,
      intervals: S.intervals,
      edges,
      maxLive,
      color: res.color,
      spilled: res.spilled,
      spillCount: res.spilled.length,
      spillInsns,
      regsUsed,
    };
  }

  /* ───────── ch9: PGO, ThinLTO & Link-Time Optimization ───────── */
  const LTO_EDGES = [
    { name: 'add_mul(10, 12)', irSize: 3, hot: true, foldsConst: true, callsPerTU: 1 },
    { name: 'fast_hash(buf)', irSize: 18, hot: true, foldsConst: false, callsPerTU: 2 },
    { name: 'parse_cfg(opt)', irSize: 45, hot: false, foldsConst: false, callsPerTU: 1 },
    { name: 'log_fatal(err)', irSize: 70, hot: false, foldsConst: false, callsPerTU: 1 },
  ];

  function ltoSim(opts) {
    const o = opts || {};
    const mode = ['none', 'thin', 'full'].includes(o.mode) ? o.mode : 'thin';
    const threshold = Math.max(5, Math.min(60, Math.round(o.threshold == null ? 30 : o.threshold)));
    const tus = Math.max(4, Math.min(32, Math.round(o.tus == null ? 16 : o.tus)));
    const pgo = o.pgo == null ? true : !!o.pgo;

    const totalCallSites = tus * LTO_EDGES.reduce((s, e) => s + e.callsPerTU, 0);
    const irPerTuMB = 1.8; // representative IR module footprint per translation unit
    const summaryPerTuMB = 0.025; // compact ThinLTO ModuleSummaryIndex per TU

    let inlinedEdges = [];
    if (mode !== 'none') {
      inlinedEdges = LTO_EDGES.filter(e => {
        const effThresh = pgo ? (e.hot ? threshold * 2 : Math.floor(threshold * 0.5)) : threshold;
        return e.irSize <= effThresh;
      });
    }
    const inlinedSites = tus * inlinedEdges.reduce((s, e) => s + e.callsPerTU, 0);
    const remainingCalls = totalCallSites - inlinedSites;
    const foldedConst42 = inlinedEdges.some(e => e.foldsConst);

    let peakMemPerWorkerMB = 0;
    let totalLinkMemMB = 0;
    let workers = 1;
    if (mode === 'none') {
      peakMemPerWorkerMB = 0.4; // machine object linking only
      totalLinkMemMB = 0.4 + tus * 0.1;
      workers = 1;
    } else if (mode === 'thin') {
      workers = Math.min(tus, 8);
      const importedIR = inlinedEdges.length * 0.15;
      peakMemPerWorkerMB = irPerTuMB + importedIR + tus * summaryPerTuMB;
      totalLinkMemMB = workers * peakMemPerWorkerMB;
    } else {
      workers = 1;
      peakMemPerWorkerMB = tus * irPerTuMB;
      totalLinkMemMB = peakMemPerWorkerMB;
    }

    return {
      mode,
      threshold,
      tus,
      pgo,
      edges: LTO_EDGES.map(e => ({
        ...e,
        inlined: inlinedEdges.some(x => x.name === e.name),
      })),
      totalCallSites,
      inlinedSites,
      remainingCalls,
      foldedConst42,
      workers,
      peakMemPerWorkerMB,
      totalLinkMemMB,
      // Verified binary difference from Apple Clang 21.0.0 on tu_a.c + tu_b.c:
      // -O2 separate: 3 instructions (mov w0,#10; mov w1,#12; b _add_mul) + callee (3 insns)
      // -O2 -flto=thin: 2 instructions in main (mov w0,#42; ret)
      noLtoMainInsns: 3,
      thinLtoMainInsns: 2,
    };
  }

  return {
    HOST_RELEASE,
    fmt,
    ARCH_FRONTENDS,
    ARCH_BACKENDS,
    archScale,
    O0_SNIPPETS,
    simAlloca,
    CFG_PRESETS,
    computeDominators,
    runMem2Reg,
    PIPELINE_PRESETS,
    stepPipeline,
    loopOptSim,
    INT32_MAX,
    INT32_MIN,
    ubSim,
    ISEL_CASES,
    iselSim,
    REGALLOC_SCENARIOS,
    regAllocSim,
    LTO_EDGES,
    ltoSim,
  };
}));
