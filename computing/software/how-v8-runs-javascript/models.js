// Pure deterministic models of V8 14.6.202.34-node.40 (Node.js v26.12.1) internals.
// UMD module: works in the browser (window.V8Models) and in Node.js (require('./models.js')).
// Every threshold, byte size, and opcode is verified against the pinned V8 build in tools/crosscheck.cjs.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.V8Models = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const V8_RELEASE = {
    v8: '14.6.202.34-node.40',
    node: '26.12.1',
    arch: 'arm64',
    date: '2026-11-21',
  };

  // Real CLI flag defaults inspected via `node --help --v8-options` on V8 14.6.202.34-node.40.
  const TIER_THRESHOLDS = {
    feedbackAlloc: 8,     // --invocation-count-for-feedback-allocation=8
    sparkplugApprox: 12,  // baseline compiles right after feedback vector warm-up (--sparkplug on)
    maglevOsr: 100,       // --invocation-count-for-maglev-osr=100
    maglev: 400,          // --invocation-count-for-maglev=400
    turbofanOsr: 500,     // --invocation-count-for-osr=500
    turbofan: 3000,       // --invocation-count-for-turbofan=3000
  };

  // Real timings measured on Apple arm64 (macOS, Node v26.12.1 / V8 14.6.202.34-node.40, 2026-11-21).
  // sumLoop(100) across 50,000 calls with --max-opt=0..3, plus --trace-opt compile durations.
  // Parameterized model scales linearly from this baseline; treated as machine-specific reference defaults.
  const MEASURED = {
    machine: 'Apple arm64 (macOS), Node v26.12.1, V8 14.6.202.34-node.40',
    date: '2026-11-21',
    ignNsPerCall: 700.0,
    spNsPerCall: 286.3,
    magNsPerCall: 37.9,
    tfNsPerCall: 34.5,
    magCompileMs: 0.062,
    tfCompileMs: 0.456, // 0.010 main + 0.446 background + 0.004 finalize
    icNs: { 1: 1.38, 2: 1.87, 4: 1.88, 5: 3.00 },
    arrNsPerElem: {
      packed_smi: 0.25,
      packed_double: 0.55,
      holey_double: 1.59,
      dict: 9.88,
    },
    scavengeTypicalMs: 0.04,
    scavengeRangeMs: [0.03, 0.21],
    freshHeap: {
      totalHeapBytes: 5914624,
      usedHeapBytes: 4369336,
      newSpaceBytes: 524288,
      oldSpaceUsedBytes: 3121952,
      heapLimitBytes: 4395630592,
    },
  };

  const IC_MAX_POLYMORPHIC = 4;
  const SLACK_INITIAL_CALLS = 7; // construction counter 7 -> 0 shrinks unused in-object slots

  function fmt(x, d, locale) {
    if (!isFinite(x)) return '∞';
    const dec = d == null ? 0 : d;
    const n = Number(x);
    const fixed = n.toFixed(dec);
    const parts = fixed.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.length > 1 ? parts[0] + '.' + parts[1] : parts[0];
  }

  function sig(x, n) {
    if (!isFinite(x)) return '∞';
    if (x === 0) return '0';
    return Number(x.toPrecision(n || 3)).toString();
  }

  function bytesStr(b) {
    if (b >= 1024 * 1024) return fmt(b / (1024 * 1024), 2) + ' MiB';
    if (b >= 1024) return fmt(b / 1024, 1) + ' KiB';
    return fmt(b, 0) + ' B';
  }

  /* ═════════ ch1: 4-tier execution pipeline + lazy parsing ═════════ */
  function simPipeline(opts) {
    const calls = Math.max(1, Math.min(10000, Math.round(opts.calls || 1)));
    const bytecodeBytes = Math.max(30, Math.min(600, Math.round(opts.bytecodeBytes || 120)));
    const lazyPreparse = opts.lazyPreparse !== false;

    const scale = bytecodeBytes / 33; // normalized to 33-byte sumLoop baseline
    // Parser cost: full eager parse of 5 sibling functions in file vs lazy preparse of 4 cold siblings
    const eagerParseMs = 0.045 * scale;
    const parseMs = lazyPreparse ? 0.011 * scale : eagerParseMs;
    const parseSavedPct = lazyPreparse ? Math.round((1 - parseMs / eagerParseMs) * 100) : 0;

    const ignNs = MEASURED.ignNsPerCall * scale;
    const spNs = MEASURED.spNsPerCall * scale;
    const magNs = MEASURED.magNsPerCall * scale;
    const tfNs = MEASURED.tfNsPerCall * scale;

    const spCompileMs = 0.014 * scale;
    const magCompileMs = MEASURED.magCompileMs * Math.pow(scale, 0.85);
    const tfCompileMs = MEASURED.tfCompileMs * Math.pow(scale, 0.95);

    // Ignition only
    const ignitionOnlyMs = parseMs + (calls * ignNs) / 1e6;

    // Eager top-tier JIT from call #1 (hypothetical "always TurboFan")
    const alwaysTurboMs = eagerParseMs + tfCompileMs + (calls * tfNs) / 1e6;

    // Actual V8 tiered execution
    let tieredUs = parseMs * 1000;
    let compileMs = 0;
    let tier = 'ignition';
    for (let i = 1; i <= calls; i++) {
      if (i === TIER_THRESHOLDS.sparkplugApprox) {
        tieredUs += spCompileMs * 1000;
        compileMs += spCompileMs;
        tier = 'sparkplug';
      } else if (i === TIER_THRESHOLDS.maglev) {
        tieredUs += magCompileMs * 1000;
        compileMs += magCompileMs;
        tier = 'maglev';
      } else if (i === TIER_THRESHOLDS.turbofan) {
        tieredUs += tfCompileMs * 1000;
        compileMs += tfCompileMs;
        tier = 'turbofan';
      }
      const ns = i < TIER_THRESHOLDS.sparkplugApprox
        ? ignNs
        : i < TIER_THRESHOLDS.maglev
          ? spNs
          : i < TIER_THRESHOLDS.turbofan
            ? magNs
            : tfNs;
      tieredUs += ns / 1000;
    }
    const tieredMs = tieredUs / 1000;

    const mode = tier === 'ignition'
      ? 'cold'
      : tier === 'sparkplug'
        ? 'warm'
        : tier === 'maglev'
          ? 'hot'
          : 'top';

    return {
      calls,
      bytecodeBytes,
      lazyPreparse,
      tier,
      mode,
      parseMs,
      parseSavedPct,
      compileMs,
      ignitionOnlyMs,
      alwaysTurboMs,
      tieredMs,
      speedupVsIgn: ignitionOnlyMs / tieredMs,
      speedupVsAlwaysTurbo: alwaysTurboMs / tieredMs,
      thresholds: TIER_THRESHOLDS,
    };
  }

  /* ═════════ ch2: Pointer tagging, Smi & Pointer Compression ═════════ */
  function inspectValue(rawVal, mode) {
    const m = mode === 'compressed' ? 'compressed' : 'full64';
    const val = Number(rawVal);
    const isCompressed = m === 'compressed';
    const smiMin = isCompressed ? -1073741824 : -2147483648; // -2^30 vs -2^31
    const smiMax = isCompressed ? 1073741823 : 2147483647;   // 2^30-1 vs 2^31-1
    const isNegZero = Object.is(val, -0);
    const isInt = Number.isInteger(val) && !isNegZero;
    const isSmi = isInt && val >= smiMin && val <= smiMax;

    const wordBytes = isCompressed ? 4 : 8;
    const headerBytes = 3 * wordBytes; // map + properties + elements
    const obj2Bytes = headerBytes + 2 * wordBytes; // Point {x, y}: 20 B (compressed) vs 40 B (full64)
    const heapNumberBytes = isCompressed ? 12 : 16; // 4+8 vs 8+8

    let hexWord = '';
    let tagBit = 0;
    let kind = 'Smi';
    let heapBytes = 0;

    if (isSmi) {
      tagBit = 0;
      kind = 'Smi';
      heapBytes = 0;
      if (isCompressed) {
        const u32 = (val << 1) >>> 0;
        hexWord = '0x' + u32.toString(16).padStart(8, '0');
      } else {
        // Upper 32 bits carry int32 payload; lower 32 bits carry 0 tag (verified on arm64 Node)
        const hi = (val | 0) >>> 0;
        hexWord = '0x' + hi.toString(16).padStart(8, '0') + '_00000000';
      }
    } else {
      tagBit = 1;
      kind = 'HeapNumber';
      heapBytes = heapNumberBytes;
      if (isCompressed) {
        hexWord = '0x001a4201'; // 32-bit offset in 4 GiB cage with low bit = 1
      } else {
        hexWord = '0x198f_1f76c6a9'; // 64-bit tagged pointer with low bit = 1
      }
    }

    return {
      value: val,
      mode: m,
      isCompressed,
      isSmi,
      kind,
      tagBit,
      hexWord,
      wordBytes,
      heapBytes,
      totalBytes: wordBytes + heapBytes,
      headerBytes,
      obj2Bytes,
      smiMin,
      smiMax,
      sayKey: isSmi ? 'smi' : 'heap',
    };
  }

  /* ═════════ ch3: Hidden Classes (Map), Slack Tracking & Dictionary Mode ═════════ */
  function createMapExplorerState() {
    return {
      scenario: 'same_order',
      mode: 'fast',
      maps: [
        { id: 'M0', label: '{}', props: [], inObject: 4, unused: 4, size64: 56, size32: 28, dict: false, parent: null },
        { id: 'M1', label: '{x}', props: ['x'], inObject: 4, unused: 3, size64: 56, size32: 28, dict: false, parent: 'M0', edge: '+x' },
        { id: 'M2', label: '{x, y}', props: ['x', 'y'], inObject: 4, unused: 2, size64: 56, size32: 28, dict: false, parent: 'M1', edge: '+y' },
      ],
      activeMapId: 'M2',
      objects: [
        { name: 'p1', mapId: 'M2', props: ['x', 'y'], offsets: [24, 32] },
        { name: 'p2', mapId: 'M2', props: ['x', 'y'], offsets: [24, 32] },
      ],
      sameMap: true,
      constructionCounter: 0,
      instanceSize64: 56,
      instanceSize32: 28,
      inObjectSlots: 4,
      unusedSlots: 2,
      dictEntries: 0,
      sayKey: 'fast',
    };
  }

  function simMapScenario(scenario) {
    if (scenario === 'reordered') {
      return {
        scenario,
        mode: 'forked',
        maps: [
          { id: 'M0', label: '{}', props: [], inObject: 4, unused: 4, size64: 56, size32: 28, dict: false, parent: null },
          { id: 'M1', label: '{x}', props: ['x'], inObject: 4, unused: 3, size64: 56, size32: 28, dict: false, parent: 'M0', edge: '+x' },
          { id: 'M2', label: '{x, y}', props: ['x', 'y'], inObject: 4, unused: 2, size64: 56, size32: 28, dict: false, parent: 'M1', edge: '+y' },
          { id: 'M3', label: '{y}', props: ['y'], inObject: 4, unused: 3, size64: 56, size32: 28, dict: false, parent: 'M0', edge: '+y' },
          { id: 'M4', label: '{y, x}', props: ['y', 'x'], inObject: 4, unused: 2, size64: 56, size32: 28, dict: false, parent: 'M3', edge: '+x' },
        ],
        activeMapId: 'M4',
        objects: [
          { name: 'p1', mapId: 'M2', props: ['x', 'y'], offsets: [24, 32] },
          { name: 'p2', mapId: 'M4', props: ['y', 'x'], offsets: [24, 32] },
        ],
        sameMap: false,
        constructionCounter: 0,
        instanceSize64: 56,
        instanceSize32: 28,
        inObjectSlots: 4,
        unusedSlots: 2,
        dictEntries: 0,
        sayKey: 'forked',
      };
    }
    if (scenario === 'slack_early') {
      // Verified via %DebugPrint(new Ctor(1,2)) on call 1..6: instance size 104, inobject 10, unused 8, counter 6
      return {
        scenario,
        mode: 'slack',
        maps: [
          { id: 'C0', label: 'Point()', props: [], inObject: 10, unused: 10, size64: 104, size32: 52, dict: false, parent: null },
          { id: 'C1', label: 'Point.x', props: ['x'], inObject: 10, unused: 9, size64: 104, size32: 52, dict: false, parent: 'C0', edge: '+x' },
          { id: 'C2', label: 'Point.x,y', props: ['x', 'y'], inObject: 10, unused: 8, size64: 104, size32: 52, dict: false, parent: 'C1', edge: '+y' },
        ],
        activeMapId: 'C2',
        objects: [
          { name: 'pt1', mapId: 'C2', props: ['x', 'y'], offsets: [24, 32] },
        ],
        sameMap: true,
        constructionCounter: 6,
        instanceSize64: 104,
        instanceSize32: 52,
        inObjectSlots: 10,
        unusedSlots: 8,
        dictEntries: 0,
        sayKey: 'slack',
      };
    }
    if (scenario === 'slack_done') {
      // Verified via %DebugPrint(new Ctor(7,7)) on call 7+: instance size 40, inobject 2, unused 0, counter 0
      return {
        scenario,
        mode: 'fast',
        maps: [
          { id: 'C0*', label: 'Point()', props: [], inObject: 2, unused: 2, size64: 40, size32: 20, dict: false, parent: null },
          { id: 'C1*', label: 'Point.x', props: ['x'], inObject: 2, unused: 1, size64: 40, size32: 20, dict: false, parent: 'C0*', edge: '+x' },
          { id: 'C2*', label: 'Point.x,y', props: ['x', 'y'], inObject: 2, unused: 0, size64: 40, size32: 20, dict: false, parent: 'C1*', edge: '+y' },
        ],
        activeMapId: 'C2*',
        objects: [
          { name: 'pt1', mapId: 'C2*', props: ['x', 'y'], offsets: [24, 32] },
          { name: 'pt7', mapId: 'C2*', props: ['x', 'y'], offsets: [24, 32] },
        ],
        sameMap: true,
        constructionCounter: 0,
        instanceSize64: 40,
        instanceSize32: 20,
        inObjectSlots: 2,
        unusedSlots: 0,
        dictEntries: 0,
        sayKey: 'fast',
      };
    }
    if (scenario === 'delete_dict') {
      // Verified via %DebugPrint after `delete dObj.b`: Map[24], inobject 0, DictionaryProperties NameDictionary[30]
      return {
        scenario,
        mode: 'dict',
        maps: [
          { id: 'M0', label: '{a,b,c}', props: ['a', 'b', 'c'], inObject: 3, unused: 0, size64: 48, size32: 24, dict: false, parent: null },
          { id: 'MD', label: 'Dict(a,c)', props: ['a', 'c'], inObject: 0, unused: 0, size64: 24, size32: 12, dict: true, parent: 'M0', edge: 'delete b' },
        ],
        activeMapId: 'MD',
        objects: [
          { name: 'dObj', mapId: 'MD', props: ['a', 'c'], offsets: [] },
        ],
        sameMap: false,
        constructionCounter: 0,
        instanceSize64: 24,
        instanceSize32: 12,
        inObjectSlots: 0,
        unusedSlots: 0,
        dictEntries: 2,
        sayKey: 'dict',
      };
    }
    return createMapExplorerState();
  }

  /* ═════════ ch4: Inline Caches (LoadIC) ═════════ */
  function simIC(shapes, iterations) {
    const n = Math.max(1, Math.min(8, Math.round(shapes || 1)));
    const iters = Math.max(10000, Math.min(1000000, Math.round(iterations || 200000)));
    let state = 'MONOMORPHIC';
    let sayKey = 'mono';
    if (n >= 2 && n <= IC_MAX_POLYMORPHIC) {
      state = 'POLYMORPHIC';
      sayKey = 'poly';
    } else if (n > IC_MAX_POLYMORPHIC) {
      state = 'MEGAMORPHIC';
      sayKey = 'mega';
    }

    // Average Map checks before hit: 1 for mono; (n+1)/2 average linear probe for poly; hash stub probe for mega
    const avgGuards = n === 1 ? 1 : n <= IC_MAX_POLYMORPHIC ? (n + 1) / 2 : 1;
    // Calibrated around host V8 14.6 measurements: 1.38 ns (1 shape), 1.87-1.88 ns (2-4), 3.00+ ns (5+)
    const nsPerAccess = n === 1
      ? MEASURED.icNs[1]
      : n <= IC_MAX_POLYMORPHIC
        ? 1.45 + 0.14 * n
        : 3.00 + 0.12 * (n - 5);

    const totalMs = (iters * nsPerAccess) / 1e6;
    const monoMs = (iters * MEASURED.icNs[1]) / 1e6;
    const slowdown = nsPerAccess / MEASURED.icNs[1];

    const slotEntries = [];
    for (let i = 0; i < Math.min(n, IC_MAX_POLYMORPHIC); i++) {
      slotEntries.push({
        mapId: 'M' + (i + 1),
        offsetBytes: 24 + (i % 3) * 8,
        hit: true,
      });
    }

    return {
      shapes: n,
      iterations: iters,
      state,
      sayKey,
      maxPolymorphic: IC_MAX_POLYMORPHIC,
      avgGuards,
      nsPerAccess,
      totalMs,
      monoMs,
      slowdown,
      slotEntries,
      megamorphicFallback: n > IC_MAX_POLYMORPHIC,
    };
  }

  /* ═════════ ch5: Ignition Accumulator Bytecode VM & FeedbackVector ═════════ */
  // Real disassembly from host V8 14.6.202.34-node.40 `--print-bytecode --print-bytecode-filter=addXY`:
  //   0: GetNamedProperty a0, [0:"x"], FBV[1]
  //   4: Star0
  //   5: GetNamedProperty a0, [1:"y"], FBV[3]
  //   9: Add r0, FBV[0]
  //  12: Return
  const ADDXY_BYTECODE = [
    { off: 0, bytes: '33 03 00 01', op: 'GetNamedProperty a0, [0:"x"], FBV[1]', slot: 1, kind: 'load' },
    { off: 4, bytes: 'd2',          op: 'Star0',                                  slot: -1, kind: 'reg' },
    { off: 5, bytes: '33 03 01 03', op: 'GetNamedProperty a0, [1:"y"], FBV[3]', slot: 3, kind: 'load' },
    { off: 9, bytes: '40 f9 00',    op: 'Add r0, FBV[0]',                         slot: 0, kind: 'arith' },
    { off: 12, bytes: 'b7',         op: 'Return',                                 slot: -1, kind: 'ret' },
  ];

  function createBytecodeState(inputMode) {
    const mode = inputMode === 'double' || inputMode === 'string' ? inputMode : 'smi';
    const px = mode === 'smi' ? 3 : mode === 'double' ? 3.5 : '3';
    const py = 4;
    return {
      inputMode: mode,
      pcIdx: 0,
      stepCount: 0,
      done: false,
      sayKey: 'run',
      acc: 'undefined',
      r0: 'undefined',
      a0: mode === 'smi' ? '{ x: 3, y: 4 }' : mode === 'double' ? '{ x: 3.5, y: 4 }' : '{ x: "3", y: 4 }',
      px,
      py,
      fbv: {
        0: 'NONE', // BinaryOp feedback for Add
        1: 'UNINIT', // LoadIC for .x
        3: 'UNINIT', // LoadIC for .y
      },
      code: ADDXY_BYTECODE,
    };
  }

  function stepBytecodeState(st) {
    if (st.done) return st;
    const next = {
      inputMode: st.inputMode,
      pcIdx: st.pcIdx,
      stepCount: st.stepCount + 1,
      done: false,
      sayKey: 'run',
      acc: st.acc,
      r0: st.r0,
      a0: st.a0,
      px: st.px,
      py: st.py,
      fbv: Object.assign({}, st.fbv),
      code: st.code,
    };
    const ins = st.code[st.pcIdx];
    if (ins.off === 0) {
      next.acc = typeof st.px === 'string' ? `"${st.px}"` : String(st.px);
      next.fbv[1] = 'MONO(M1@+24)';
      next.pcIdx = 1;
    } else if (ins.off === 4) {
      next.r0 = next.acc;
      next.pcIdx = 2;
    } else if (ins.off === 5) {
      next.acc = String(st.py);
      next.fbv[3] = 'MONO(M1@+32)';
      next.pcIdx = 3;
    } else if (ins.off === 9) {
      if (st.inputMode === 'smi') {
        next.acc = String(3 + 4);
        next.fbv[0] = 'SignedSmall';
      } else if (st.inputMode === 'double') {
        next.acc = String(3.5 + 4);
        next.fbv[0] = 'Number';
      } else {
        next.acc = '"34"';
        next.fbv[0] = 'Any (StringConcat)';
      }
      next.pcIdx = 4;
    } else if (ins.off === 12) {
      next.done = true;
      next.sayKey = 'done';
    }
    return next;
  }

  /* ═════════ ch6: Speculative Optimization, OSR & Deoptimization Bailout ═════════ */
  function simDeoptTrace(scenario, maglevEnabled) {
    const scen = ['clean', 'late_map', 'smi_overflow', 'poly_storm'].includes(scenario) ? scenario : 'late_map';
    const useMaglev = maglevEnabled !== false;
    const totalCalls = 5000;
    const events = [];
    const series = []; // sampled points { call, ns, tier }

    let tier = 'ignition';
    let deoptCount = 0;
    let totalNs = 0;
    let bailoutReason = 'none';
    let guardStoppedOpt = false;
    let tierRank = 0; // 0=ign, 1=sp, 2=mag, 3=tf

    // Use real host V8 14.6 per-call timings (700 -> 286.3 -> 37.9 -> 34.5 ns)
    const tierNs = r => (r === 0 ? MEASURED.ignNsPerCall : r === 1 ? MEASURED.spNsPerCall : r === 2 ? MEASURED.magNsPerCall : MEASURED.tfNsPerCall);
    const tierName = r => (r === 0 ? 'Ignition' : r === 1 ? 'Sparkplug' : r === 2 ? 'Maglev' : 'TurboFan');

    for (let c = 1; c <= totalCalls; c++) {
      // Normal tier-up thresholds
      if (!guardStoppedOpt) {
        if (c === TIER_THRESHOLDS.sparkplugApprox && tierRank < 1) {
          tierRank = 1;
          tier = 'sparkplug';
          totalNs += 14000;
          events.push({ call: c, type: 'opt', tier: 'Sparkplug', reason: 'baseline' });
        }
        if (useMaglev && c === TIER_THRESHOLDS.maglev && tierRank < 2) {
          tierRank = 2;
          tier = 'maglev';
          totalNs += 62000;
          events.push({ call: c, type: 'opt', tier: 'Maglev', reason: 'hot_and_stable' });
        }
        if (c === TIER_THRESHOLDS.turbofan && tierRank < 3) {
          tierRank = 3;
          tier = 'turbofan';
          totalNs += 456000;
          events.push({ call: c, type: 'opt', tier: 'TurboFan', reason: 'hot_and_stable' });
        }
      }

      // Inject bailout conditions
      let triggeredDeopt = false;
      let reason = '';
      if (scen === 'late_map' && c === 3500 && tierRank >= 2) {
        triggeredDeopt = true;
        reason = 'wrong_map';
      } else if (scen === 'smi_overflow' && (c === 1200 || c === 3400) && tierRank >= 2) {
        triggeredDeopt = true;
        reason = 'not_smi';
      } else if (scen === 'poly_storm' && c >= 450 && c <= 2250 && (c - 450) % 450 === 0 && tierRank >= 2) {
        triggeredDeopt = true;
        reason = 'wrong_map';
      }

      if (triggeredDeopt) {
        deoptCount++;
        bailoutReason = reason;
        totalNs += 28000; // frame reconstruction + feedback update penalty
        events.push({ call: c, type: 'deopt', tier: tierName(tierRank), reason });
        tierRank = 0; // bailout directly back to Ignition!
        tier = 'ignition';
        if (deoptCount >= 4) {
          guardStoppedOpt = true;
          bailoutReason = 'deopt_loop';
        }
      }

      // Re-optimize after single bailout once widened feedback settles
      if (!guardStoppedOpt && scen === 'late_map' && c === 3900 && tierRank === 0) {
        tierRank = useMaglev ? 2 : 3;
        tier = useMaglev ? 'maglev' : 'turbofan';
        totalNs += useMaglev ? 35000 : 380000;
        events.push({ call: c, type: 'opt', tier: tierName(tierRank), reason: 'rewidened_ic' });
      }
      if (!guardStoppedOpt && scen === 'smi_overflow' && (c === 1600 || c === 3800) && tierRank === 0) {
        tierRank = c === 1600 && useMaglev ? 2 : 3;
        tier = tierRank === 2 ? 'maglev' : 'turbofan';
        totalNs += tierRank === 2 ? 42000 : 390000;
        events.push({ call: c, type: 'opt', tier: tierName(tierRank), reason: 'float64_phi' });
      }
      if (!guardStoppedOpt && scen === 'poly_storm' && c > 450 && c < 2250 && (c - 450) % 450 === 200 && tierRank === 0) {
        tierRank = useMaglev ? 2 : 3;
        tier = tierName(tierRank).toLowerCase();
        totalNs += useMaglev ? 45000 : 380000;
        events.push({ call: c, type: 'opt', tier: tierName(tierRank), reason: 'rewidened' });
      }

      const stepNs = tierNs(tierRank);
      totalNs += stepNs;
      if (c === 1 || c % 50 === 0 || triggeredDeopt) {
        series.push({ call: c, ns: stepNs, tierRank, deopt: triggeredDeopt });
      }
    }

    const cleanRefMs = scen === 'clean' ? totalNs / 1e6 : simDeoptTrace('clean', useMaglev).totalMs;
    const totalMs = totalNs / 1e6;
    const sayKey = deoptCount === 0 ? 'clean' : guardStoppedOpt ? 'thrash' : 'deopt';

    return {
      scenario: scen,
      maglevEnabled: useMaglev,
      totalCalls,
      finalTier: tier,
      deoptCount,
      bailoutReason,
      guardStoppedOpt,
      totalMs,
      cleanRefMs,
      overheadMs: Math.max(0, totalMs - cleanRefMs),
      events,
      series,
      sayKey,
    };
  }

  /* ═════════ ch7: Arrays & One-Way ElementsKind Lattice ═════════ */
  const ELEMENTS_KINDS = [
    'PACKED_SMI_ELEMENTS',
    'PACKED_DOUBLE_ELEMENTS',
    'PACKED_ELEMENTS',
    'HOLEY_SMI_ELEMENTS',
    'HOLEY_DOUBLE_ELEMENTS',
    'HOLEY_ELEMENTS',
    'DICTIONARY_ELEMENTS',
  ];

  function createArrayState() {
    return {
      elements: [1, 2, 3],
      length: 3,
      kind: 'PACKED_SMI_ELEMENTS',
      path: ['PACKED_SMI_ELEMENTS'],
      packed: true,
      smi: true,
      double: false,
      holey: false,
      dict: false,
      regressedAttempt: false,
      lastOp: 'init',
      bytesPerElem: 8,
      nsPerElem: MEASURED.arrNsPerElem.packed_smi,
      sayKey: 'smi',
    };
  }

  function applyArrayOp(st, op) {
    if (op === 'init' || op === 'reset') return createArrayState();
    const els = st.elements.slice();
    let kind = st.kind;
    let regressedAttempt = false;
    const path = st.path.slice();

    const setKind = nextKind => {
      if (nextKind !== kind) {
        kind = nextKind;
        if (path[path.length - 1] !== kind) path.push(kind);
      }
    };

    if (op === 'push_smi') {
      els.push(4);
      // Kind never upgrades or changes on a Smi push
    } else if (op === 'push_double') {
      els.push(1.5);
      if (kind === 'PACKED_SMI_ELEMENTS') setKind('PACKED_DOUBLE_ELEMENTS');
      else if (kind === 'HOLEY_SMI_ELEMENTS') setKind('HOLEY_DOUBLE_ELEMENTS');
    } else if (op === 'make_hole') {
      while (els.length < 5) els.push(undefined); // explicit hole sentinel
      els[5] = 2.5;
      if (kind === 'PACKED_SMI_ELEMENTS') setKind('HOLEY_DOUBLE_ELEMENTS');
      else if (kind === 'PACKED_DOUBLE_ELEMENTS') setKind('HOLEY_DOUBLE_ELEMENTS');
      else if (kind === 'PACKED_ELEMENTS') setKind('HOLEY_ELEMENTS');
      else if (kind === 'HOLEY_SMI_ELEMENTS') setKind('HOLEY_DOUBLE_ELEMENTS');
    } else if (op === 'push_string') {
      els.push('hi');
      if (kind === 'PACKED_SMI_ELEMENTS' || kind === 'PACKED_DOUBLE_ELEMENTS') setKind('PACKED_ELEMENTS');
      else if (kind === 'HOLEY_SMI_ELEMENTS' || kind === 'HOLEY_DOUBLE_ELEMENTS') setKind('HOLEY_ELEMENTS');
    } else if (op === 'shrink_len') {
      // Truncating or overwriting with ints NEVER reverts ElementsKind in V8!
      els.length = Math.min(3, els.length);
      for (let i = 0; i < els.length; i++) els[i] = i + 1;
      if (kind !== 'PACKED_SMI_ELEMENTS') regressedAttempt = true;
    } else if (op === 'make_sparse') {
      // Very large index jump forces dictionary backing
      setKind('DICTIONARY_ELEMENTS');
    }

    const packed = kind.startsWith('PACKED_');
    const smi = kind.includes('_SMI_');
    const dbl = kind.includes('_DOUBLE_');
    const holey = kind.startsWith('HOLEY_');
    const dict = kind === 'DICTIONARY_ELEMENTS';

    const bytesPerElem = dbl ? 8 : dict ? 24 : 8; // 8 B double/64-bit tagged slot; dict stores key+val+attrs
    const nsPerElem = kind === 'PACKED_SMI_ELEMENTS'
      ? MEASURED.arrNsPerElem.packed_smi
      : kind === 'PACKED_DOUBLE_ELEMENTS'
        ? MEASURED.arrNsPerElem.packed_double
        : kind === 'HOLEY_SMI_ELEMENTS' || kind === 'HOLEY_DOUBLE_ELEMENTS'
          ? MEASURED.arrNsPerElem.holey_double
          : kind === 'PACKED_ELEMENTS' || kind === 'HOLEY_ELEMENTS'
            ? 2.40
            : MEASURED.arrNsPerElem.dict;

    const sayKey = regressedAttempt
      ? 'stuck'
      : dict
        ? 'dict'
        : op === 'push_string' || (!holey && !smi && !dbl)
          ? 'tagged'
          : holey
            ? 'holey'
            : dbl
              ? 'double'
              : 'smi';

    return {
      elements: els,
      length: op === 'make_sparse' ? 100001 : els.length,
      kind,
      path,
      packed,
      smi,
      double: dbl,
      holey,
      dict,
      regressedAttempt,
      lastOp: op,
      bytesPerElem,
      nsPerElem,
      sayKey,
    };
  }

  /* ═════════ ch8: Orinoco Generational & Concurrent GC ═════════ */
  function createGCState(opts) {
    const o = opts || {};
    return {
      tick: 0,
      newCapKiB: 512,
      newUsedKiB: 120,
      oldCapKiB: 8192,
      oldUsedKiB: 3048,
      survivorAge1KiB: 0,
      youngMode: o.youngMode === 'minorms' ? 'minorms' : 'scavenger',
      allocRateKiB: o.allocRateKiB || 96,
      survivalPct: o.survivalPct != null ? o.survivalPct : 15,
      scavengeCount: 0,
      majorCount: 0,
      promotedKiB: 0,
      rememberedRefs: 14,
      lastEvent: 'scavenge',
      lastPauseMs: MEASURED.scavengeTypicalMs,
      maxPauseMs: MEASURED.scavengeTypicalMs,
      history: [{ tick: 0, newKiB: 120, oldKiB: 3048, pauseMs: 0.04, event: 'scavenge' }],
      sayKey: o.youngMode === 'minorms' ? 'minorms' : 'scavenge',
    };
  }

  function stepGC(st, opts) {
    const o = opts || {};
    const youngMode = o.youngMode === 'minorms' ? 'minorms' : st.youngMode;
    const allocRateKiB = Math.max(16, Math.min(256, Number(o.allocRateKiB != null ? o.allocRateKiB : st.allocRateKiB)));
    const survivalPct = Math.max(0, Math.min(60, Number(o.survivalPct != null ? o.survivalPct : st.survivalPct)));

    let newUsed = st.newUsedKiB + allocRateKiB;
    let oldUsed = st.oldUsedKiB;
    let age1 = st.survivorAge1KiB;
    let scavengeCount = st.scavengeCount;
    let majorCount = st.majorCount;
    let promotedTotal = st.promotedKiB;
    let lastEvent = 'alloc';
    let lastPauseMs = 0;

    if (o.forceMajor || oldUsed >= st.oldCapKiB) {
      // Major Mark-Sweep-Compact pause scales with live old objects
      lastPauseMs = 6.5 + (oldUsed / 1024) * 2.4;
      oldUsed = Math.round(oldUsed * 0.52);
      majorCount++;
      lastEvent = 'major';
    } else if (newUsed >= st.newCapKiB) {
      // Young Gen collection: Scavenger copies only survivors; MinorMS marks/sweeps in place
      const newlySurvived = Math.round((newUsed - age1) * (survivalPct / 100));
      const promoted = Math.round(age1 * (survivalPct / 100 + 0.35));
      oldUsed += promoted;
      promotedTotal += promoted;
      age1 = newlySurvived;
      newUsed = age1;
      scavengeCount++;
      lastEvent = youngMode === 'minorms' ? 'minorms' : 'scavenge';
      // Scavenger copy proportional to live bytes; MinorMS does concurrent marking so STW pause is ~35% smaller
      const basePause = 0.03 + ((newlySurvived + promoted) / 512) * 0.38;
      lastPauseMs = youngMode === 'minorms' ? Math.max(0.02, basePause * 0.65) : basePause;

      // Did promotion push OldGen past limit? Trigger Major GC next or flag immediately
      if (oldUsed >= st.oldCapKiB) {
        lastPauseMs = 6.5 + (oldUsed / 1024) * 2.4;
        oldUsed = Math.round(oldUsed * 0.52);
        majorCount++;
        lastEvent = 'major';
      }
    }

    const tick = st.tick + 1;
    const hist = st.history.concat([{
      tick,
      newKiB: newUsed,
      oldKiB: oldUsed,
      pauseMs: lastPauseMs,
      event: lastEvent,
    }]).slice(-28);

    const sayKey = lastEvent === 'major'
      ? 'major'
      : youngMode === 'minorms'
        ? 'minorms'
        : 'scavenge';

    return {
      tick,
      newCapKiB: st.newCapKiB,
      newUsedKiB: newUsed,
      oldCapKiB: st.oldCapKiB,
      oldUsedKiB: oldUsed,
      survivorAge1KiB: age1,
      youngMode,
      allocRateKiB,
      survivalPct,
      scavengeCount,
      majorCount,
      promotedKiB: promotedTotal,
      rememberedRefs: Math.round(10 + (oldUsed / 512) * 3),
      lastEvent,
      lastPauseMs,
      maxPauseMs: Math.max(st.maxPauseMs, lastPauseMs),
      history: hist,
      sayKey,
    };
  }

  /* ═════════ ch9: Event Loop & Microtask Checkpoint Seam ═════════ */
  function createLoopState(scenario, nestedDepth) {
    const scen = ['standard', 'nested', 'starve'].includes(scenario) ? scenario : 'standard';
    const depth = Math.max(1, Math.min(4, Math.round(nestedDepth || 2)));
    return {
      scenario: scen,
      nestedDepth: depth,
      step: 0,
      phase: 'sync',
      callStack: ['main.js (sync)'],
      nextTickQ: ['nextTick'],
      microQ: ['Promise.then', 'queueMicrotask'],
      macroCheckQ: ['setImmediate'],
      macroTimerQ: ['setTimeout(0)'],
      executed: [],
      nestedSpawned: 0,
      starved: false,
      done: false,
      sayKey: 'running',
    };
  }

  function stepLoopState(st) {
    if (st.done || st.starved) return st;
    const next = {
      scenario: st.scenario,
      nestedDepth: st.nestedDepth,
      step: st.step + 1,
      phase: st.phase,
      callStack: [],
      nextTickQ: st.nextTickQ.slice(),
      microQ: st.microQ.slice(),
      macroCheckQ: st.macroCheckQ.slice(),
      macroTimerQ: st.macroTimerQ.slice(),
      executed: st.executed.slice(),
      nestedSpawned: st.nestedSpawned,
      starved: false,
      done: false,
      sayKey: 'running',
    };

    if (st.callStack.length > 0) {
      next.executed.push(st.callStack[0]);
      next.phase = next.nextTickQ.length ? 'nextTick' : 'microtask';
    } else if (next.nextTickQ.length > 0) {
      const item = next.nextTickQ.shift();
      next.executed.push(item);
      next.phase = next.nextTickQ.length ? 'nextTick' : 'microtask';
    } else if (next.microQ.length > 0) {
      const item = next.microQ.shift();
      next.executed.push(item);
      if (st.scenario === 'starve') {
        next.nestedSpawned++;
        next.microQ.push('Promise#' + (next.nestedSpawned + 1));
        if (next.nestedSpawned >= 6) {
          next.starved = true;
          next.phase = 'starved';
          next.sayKey = 'starved';
          return next;
        }
      } else if (st.scenario === 'nested' && item.startsWith('Promise') && next.nestedSpawned < st.nestedDepth) {
        next.nestedSpawned++;
        next.microQ.push('nestedMicro#' + next.nestedSpawned);
      }
      next.phase = next.microQ.length ? 'microtask' : 'macrotask';
    } else if (next.macroCheckQ.length > 0) {
      const item = next.macroCheckQ.shift();
      next.executed.push(item);
      next.phase = 'macrotask';
    } else if (next.macroTimerQ.length > 0) {
      const item = next.macroTimerQ.shift();
      next.executed.push(item);
      next.done = true;
      next.phase = 'done';
      next.sayKey = 'done';
      return next;
    }

    if (next.callStack.length === 0 && next.nextTickQ.length === 0 && next.microQ.length === 0 &&
        next.macroCheckQ.length === 0 && next.macroTimerQ.length === 0) {
      next.done = true;
      next.phase = 'done';
      next.sayKey = 'done';
    }
    return next;
  }

  function runLoopAll(scenario, nestedDepth) {
    let st = createLoopState(scenario, nestedDepth);
    for (let i = 0; i < 24 && !st.done && !st.starved; i++) st = stepLoopState(st);
    return st;
  }

  return {
    V8_RELEASE,
    TIER_THRESHOLDS,
    MEASURED,
    IC_MAX_POLYMORPHIC,
    SLACK_INITIAL_CALLS,
    ELEMENTS_KINDS,
    fmt,
    sig,
    bytesStr,
    simPipeline,
    inspectValue,
    createMapExplorerState,
    simMapScenario,
    simIC,
    ADDXY_BYTECODE,
    createBytecodeState,
    stepBytecodeState,
    simDeoptTrace,
    createArrayState,
    applyArrayOp,
    createGCState,
    stepGC,
    createLoopState,
    stepLoopState,
    runLoopAll,
  };
});
