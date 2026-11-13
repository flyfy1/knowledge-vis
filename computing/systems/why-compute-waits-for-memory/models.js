/* Why Compute Waits for Memory: pure models (UMD, no DOM).
 * Used by app.js via window.MemoryWallModels and by tests/models.cjs via require().
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MemoryWallModels = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

  /* ───────── 1 · Five-stage RISC pipeline simulator ─────────
   * Loop of 6 instructions:
   *   I0: LD  R1, [R0]     (writes R1 after MEM)
   *   I1: ADD R2, R1, R3   (reads R1 -> load-use hazard on I0; writes R2 after EX)
   *   I2: MUL R4, R2, R5   (reads R2 -> ALU-ALU hazard on I1; writes R4 after EX)
   *   I3: ADD R6, R6, 1    (independent)
   *   I4: CMP R6, R7       (reads R6 -> ALU-ALU hazard on I3)
   *   I5: BNE loop         (independent of R6 value in simplified model; reads flags from I4)
   */
  const pipeline = {
    INSTS: [
      { id: 0, op: 'LD  R1, [R0]', isLoad: true,  src: [],  dst: 'R1' },
      { id: 1, op: 'ADD R2, R1, R3', isLoad: false, src: ['R1'], dst: 'R2' },
      { id: 2, op: 'MUL R4, R2, R5', isLoad: false, src: ['R2'], dst: 'R4' },
      { id: 3, op: 'ADD R6, R6, 1',  isLoad: false, src: [],  dst: 'R6' },
      { id: 4, op: 'CMP R6, R7',     isLoad: false, src: ['R6'], dst: 'FL' },
      { id: 5, op: 'BNE loop',       isLoad: false, src: ['FL'], dst: null },
    ],
    simulate(memCycles, forwarding) {
      const N = pipeline.INSTS.length;
      const M = Math.max(1, Math.round(memCycles));
      // Track cycle each stage completes for each instruction: if, id, ex, memStart, memEnd, wb
      const sched = [];
      let prevIf = 0;
      for (let i = 0; i < N; i++) {
        const ins = pipeline.INSTS[i];
        // Cannot enter IF before previous instruction left IF (in-order single-issue)
        const enterIf = prevIf + 1;
        // Can enter ID in cycle after IF, provided previous instruction in ID is not stalled
        const prevIdEnd = i > 0 ? sched[i - 1].id : 0;
        let enterId = Math.max(enterIf + 1, prevIdEnd + 1);
        // Check RAW hazards against earlier instructions while in ID
        let enterExMin = enterId + 1;
        let hazard = null;
        for (let j = 0; j < i; j++) {
          const p = sched[j];
          const pDef = pipeline.INSTS[j];
          if (!pDef.dst || !ins.src.includes(pDef.dst)) continue;
          // When is pDef.dst ready?
          // With forwarding: after MEM for load (p.memEnd), after EX for ALU (p.ex)
          // Without forwarding: after WB (p.wb)
          const readyAtEndOf = forwarding
            ? (pDef.isLoad ? p.memEnd : p.ex)
            : p.wb;
          const neededAtStartOf = readyAtEndOf + 1;
          if (neededAtStartOf > enterExMin) {
            enterExMin = neededAtStartOf;
            hazard = pDef.isLoad ? 'mem' : 'alu';
          }
        }
        // Structural in-order constraint: cannot enter EX until previous instruction left EX
        const prevEx = i > 0 ? sched[i - 1].ex : 0;
        const ex = Math.max(enterExMin, prevEx + 1);
        // ID ends right before EX starts
        const idEnd = ex - 1;
        // Wait: if previous instruction stalled in ID, its idEnd pushed our enterId
        const memStart = ex + 1;
        const memEnd = ins.isLoad ? (memStart + M - 1) : memStart;
        const wb = memEnd + 1;
        sched.push({
          id: idEnd,
          ifCycle: enterIf,
          idStart: enterId,
          idEnd,
          ex,
          memStart,
          memEnd,
          wb,
          hazard,
        });
        prevIf = enterIf;
      }
      const totalCycles = sched[N - 1].wb;
      const idealCycles = 5 + (N - 1); // 10 cycles for 6 instructions with zero stalls
      const stallCycles = totalCycles - idealCycles;
      const cpi = totalCycles / N;
      const waitPct = (stallCycles / totalCycles) * 100;
      const computePct = 100 - waitPct;
      return {
        memCycles: M,
        forwarding: !!forwarding,
        totalCycles,
        idealCycles,
        stallCycles,
        retired: N,
        cpi,
        waitPct,
        computePct,
        sched,
      };
    },
    // Helper to get stage occupancy at a given 1-indexed cycle
    stageAt(sim, cycle) {
      const out = { IF: null, ID: null, EX: null, MEM: null, WB: null, memWait: false, aluWait: false };
      for (let i = 0; i < sim.sched.length; i++) {
        const s = sim.sched[i];
        if (cycle === s.ifCycle) out.IF = i;
        else if (cycle >= s.idStart && cycle <= s.idEnd) {
          out.ID = i;
          if (cycle > s.idStart) {
            if (s.hazard === 'mem') out.memWait = true;
            else if (s.hazard === 'alu') out.aluWait = true;
          }
        }
        else if (cycle === s.ex) out.EX = i;
        else if (cycle >= s.memStart && cycle <= s.memEnd) {
          out.MEM = i;
          if (pipeline.INSTS[i].isLoad && cycle > s.memStart) out.memWait = true;
        }
        else if (cycle === s.wb) out.WB = i;
      }
      return out;
    },
  };

  /* ───────── 2 · Memory hierarchy & set-associative cache simulator ─────────
   * Latencies: typical modern x86/ARM server ranges (Hennessy & Patterson; Intel/AMD arch guides).
   * Scale: 1 CPU cycle (~0.3 ns at ~3.3 GHz) = 1 human second.
   */
  const hierarchy = {
    CYCLE_NS: 0.3,
    LEVELS: [
      { id: 'l1',   ns: 1,     sizeText: '32–64 KB',    humanS: 1 / 0.3 },
      { id: 'l2',   ns: 4,     sizeText: '256 KB–2 MB', humanS: 4 / 0.3 },
      { id: 'l3',   ns: 15,    sizeText: '32–256 MB',   humanS: 15 / 0.3 },
      { id: 'dram', ns: 80,    sizeText: '16–512 GB',   humanS: 80 / 0.3 },
      { id: 'ssd',  ns: 70000, sizeText: '1–16 TB',     humanS: 70000 / 0.3 },
    ],
  };

  function createCache(cacheBytes, blockBytes, ways) {
    const totalLines = Math.max(1, Math.floor(cacheBytes / blockBytes));
    const effWays = Math.min(ways, totalLines);
    const numSets = Math.max(1, Math.floor(totalLines / effWays));
    const sets = Array.from({ length: numSets }, () => []);
    let hits = 0, misses = 0;

    function access(byteAddr) {
      const blockAddr = Math.floor(byteAddr / blockBytes);
      const setIdx = blockAddr % numSets;
      const tag = Math.floor(blockAddr / numSets);
      const set = sets[setIdx];
      const pos = set.indexOf(tag);
      if (pos !== -1) {
        set.splice(pos, 1);
        set.push(tag);
        hits++;
        return { hit: true, setIdx, tag, blockAddr };
      }
      if (set.length >= effWays) set.shift();
      set.push(tag);
      misses++;
      return { hit: false, setIdx, tag, blockAddr };
    }

    return {
      cacheBytes,
      blockBytes,
      ways: effWays,
      numSets,
      totalLines,
      sets,
      access,
      stats() {
        const total = hits + misses;
        return {
          hits,
          misses,
          total,
          hitRate: total ? hits / total : 0,
          missRate: total ? misses / total : 0,
          bytesTransferred: misses * blockBytes,
        };
      },
    };
  }

  const cacheWalk = {
    ELEM_BYTES: 8, // Float64
    simulate(opts) {
      const N = opts.N || 16;
      const order = opts.order === 'col' ? 'col' : 'row';
      const cacheBytes = opts.cacheBytes || 1024;
      const blockBytes = opts.blockBytes || 64;
      const ways = opts.ways || 1;
      const cache = createCache(cacheBytes, blockBytes, ways);
      const missGrid = new Uint8Array(N * N);
      const trace = [];
      for (let a = 0; a < N; a++) {
        for (let b = 0; b < N; b++) {
          const r = order === 'row' ? a : b;
          const c = order === 'row' ? b : a;
          const idx = r * N + c;
          const addr = idx * cacheWalk.ELEM_BYTES;
          const res = cache.access(addr);
          missGrid[idx] = res.hit ? 0 : 1;
          trace.push({ r, c, idx, hit: res.hit, setIdx: res.setIdx, blockAddr: res.blockAddr });
        }
      }
      return {
        N,
        order,
        matrixBytes: N * N * cacheWalk.ELEM_BYTES,
        ...cache.stats(),
        missGrid,
        trace,
        cache,
      };
    },
  };

  /* ───────── 3 · Tiled matrix multiplication in cache simulator ─────────
   * Computes C[N×N] = A[N×N] × B[N×N], Float64 (8 B), row-major contiguous layout.
   * Compares naive i-j-k, row-friendly i-k-j, and tiled (blocked) B×B loop orders.
   */
  const matmulTile = {
    ELEM_BYTES: 8,
    CACHE_BYTES: 2048,
    BLOCK_BYTES: 64,
    WAYS: 4,
    simulate(N, mode, blockSize) {
      const n = N || 24;
      const cache = createCache(matmulTile.CACHE_BYTES, matmulTile.BLOCK_BYTES, matmulTile.WAYS);
      const bytesPerMat = n * n * matmulTile.ELEM_BYTES;
      const baseA = 0;
      const baseB = bytesPerMat;
      const baseC = 2 * bytesPerMat;
      const accA = (i, k) => cache.access(baseA + (i * n + k) * 8);
      const accB = (k, j) => cache.access(baseB + (k * n + j) * 8);
      const accC = (i, j) => cache.access(baseC + (i * n + j) * 8);

      if (mode === 'ijk') {
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < n; j++) {
            accC(i, j); // load C[i][j]
            for (let k = 0; k < n; k++) {
              accA(i, k);
              accB(k, j);
            }
            accC(i, j); // store C[i][j]
          }
        }
      } else if (mode === 'ikj') {
        for (let i = 0; i < n; i++) {
          for (let k = 0; k < n; k++) {
            accA(i, k);
            for (let j = 0; j < n; j++) {
              accB(k, j);
              accC(i, j);
            }
          }
        }
      } else {
        const B = clamp(Math.round(blockSize || 8), 1, n);
        for (let ii = 0; ii < n; ii += B) {
          for (let kk = 0; kk < n; kk += B) {
            for (let jj = 0; jj < n; jj += B) {
              const iMax = Math.min(n, ii + B);
              const kMax = Math.min(n, kk + B);
              const jMax = Math.min(n, jj + B);
              for (let i = ii; i < iMax; i++) {
                for (let k = kk; k < kMax; k++) {
                  accA(i, k);
                  for (let j = jj; j < jMax; j++) {
                    accB(k, j);
                    accC(i, j);
                  }
                }
              }
            }
          }
        }
      }

      const st = cache.stats();
      const flops = 2 * n * n * n;
      const effIntensity = flops / st.bytesTransferred;
      const B = mode === 'tiled' ? clamp(Math.round(blockSize || 8), 1, n) : n;
      const workingSetBytes = mode === 'tiled' ? 3 * B * B * 8 : 3 * bytesPerMat;
      return {
        N: n,
        mode,
        blockSize: B,
        flops,
        workingSetBytes,
        fitsCache: workingSetBytes <= matmulTile.CACHE_BYTES,
        ...st,
        effIntensity,
      };
    },
  };

  /* ───────── 4 · The Memory Wall (Wulf & McKee 1995) & Little's Law ───────── */
  const memoryWall = {
    // Default H100-like HBM3 bus: 3350 GB/s peak, 128 B cache-line/sector transaction
    PEAK_BW_GBS: 3350,
    REQ_BYTES: 128,
    amat(hitCycles, missRate, missCycles) {
      return hitCycles + missRate * missCycles;
    },
    effCPI(baseCPI, memFraction, missRate, missCycles) {
      return baseCPI + memFraction * missRate * missCycles;
    },
    computeUtilPct(baseCPI, effCpi) {
      return (baseCPI / effCpi) * 100;
    },
    littlesLaw(peakBwGBs, latNs, inFlightReqs, reqBytes) {
      const bwBps = peakBwGBs * 1e9;
      const latS = latNs * 1e-9;
      const requiredBytes = bwBps * latS;
      const requiredReqs = requiredBytes / reqBytes;
      const currentBytes = inFlightReqs * reqBytes;
      const achievedBwGBs = Math.min(peakBwGBs, currentBytes / latS / 1e9);
      const bwPct = (achievedBwGBs / peakBwGBs) * 100;
      return {
        requiredBytes,
        requiredReqs,
        currentBytes,
        achievedBwGBs,
        bwPct,
      };
    },
  };

  /* ───────── 5 · Multi-core scaling: Dennard, Amdahl, Gustafson, Shared Bus ───────── */
  const multicore = {
    amdahl(f, P) {
      return 1 / ((1 - f) + f / P);
    },
    gustafson(f, P) {
      return (1 - f) + f * P;
    },
    // Each active core draws `bwPerCoreGBs`; total memory bus supplies `busCapGBs`.
    // Memory ceiling in equivalent single-core speedups = busCapGBs / bwPerCoreGBs.
    bwCapped(f, P, bwPerCoreGBs, busCapGBs) {
      const am = multicore.amdahl(f, P);
      const memCap = busCapGBs / bwPerCoreGBs;
      return {
        amdahl: am,
        gustafson: multicore.gustafson(f, P),
        memCap,
        actual: Math.min(am, memCap),
        saturated: am > memCap,
      };
    },
    // Dynamic power P = alpha * C * V^2 * f (normalized to reference)
    relPower(vRel, fRel) {
      return vRel * vRel * fRel;
    },
  };

  /* ───────── 6 · Systolic array reuse & dense linear-algebra layer ───────── */
  const systolic = {
    // Weight-stationary k×k array streaming N×k activations:
    // Each activation crosses k PEs; each partial sum accumulates down k PEs.
    // Steady-state FLOPs/cycle = 2*k^2, edge I/O elements/cycle = 2*k -> FLOPs/elem = k
    stats(k, streamLen) {
      const n = streamLen || 64;
      const macsPerCycle = k * k;
      const flopsPerCycle = 2 * macsPerCycle;
      const totalMacs = n * k * k;
      const totalFlops = 2 * totalMacs;
      // Total elements moved across boundary: k^2 weight loads + n*k activation reads + n*k output writes
      const elemsMoved = k * k + 2 * n * k;
      const flopsPerElem = totalFlops / elemsMoved;
      const steadyFlopsPerElem = k; // as n -> inf: (2*n*k^2)/(2*n*k) = k
      return { k, n, macsPerCycle, flopsPerCycle, totalFlops, elemsMoved, flopsPerElem, steadyFlopsPerElem };
    },
  };

  const gemmLayer = {
    // Y[M×N] = X[M×K] · W[K×N]
    eval(M, K, N, bytesPerElem) {
      const flops = 2 * M * K * N;
      const bytes = bytesPerElem * (M * K + K * N + M * N);
      const intensity = flops / bytes;
      return { M, K, N, bytesPerElem, flops, bytes, intensity };
    },
  };

  /* ───────── 7 · Roofline model (Williams, Waterman, Patterson 2009) ───────── */
  const HW = {
    cpu: {
      id: 'cpu',
      peakFlops: 5.7e12,   // AMD EPYC 9654 96-core FP32 sustained AVX-512 estimate
      bwBps: 460.8e9,      // 12-ch DDR5-4800 theoretical max
      capGB: 768,
      watt: 360,
      precision: 'FP32',
    },
    h100: {
      id: 'h100',
      peakFlops: 989.5e12, // H100 SXM dense BF16/FP16 Tensor Core
      bwBps: 3.35e12,      // HBM3
      capGB: 80,
      watt: 700,
      precision: 'BF16',
    },
    b200: {
      id: 'b200',
      peakFlops: 2250e12,  // B200 dense BF16/FP16 Tensor Core
      bwBps: 8.0e12,       // HBM3e
      capGB: 180,
      watt: 1000,
      precision: 'BF16',
    },
    ironwood: {
      id: 'ironwood',
      peakFlops: 2307e12,  // Google TPU v7 Ironwood BF16
      bwBps: 7.38e12,      // HBM
      capGB: 192,
      watt: null,
      precision: 'BF16',
    },
  };

  const WORKLOADS = {
    dot:     { id: 'dot',     intensity: 0.5 },   // BF16 dot product: 2 FLOPs / 4 bytes = 0.5
    stencil: { id: 'stencil', intensity: 0.67 },  // 2D 5-pt stencil: ~8 FLOPs / 12 bytes BF16
    decode1: { id: 'decode1', intensity: 1.0 },   // LLM decode batch=1 BF16: 2 FLOPs / 2 B weight = 1.0
    decode64:{ id: 'decode64',intensity: 57.0 },  // LLM decode batch=64 (70B BF16, 4K ctx)
    gemm:    { id: 'gemm',    intensity: 682.7 }, // M=1024, K=4096, N=4096 BF16 GEMM
  };

  const roofline = {
    ridge(hwId) {
      const hw = HW[hwId];
      return hw.peakFlops / hw.bwBps;
    },
    eval(hwId, intensity) {
      const hw = HW[hwId];
      const ridge = hw.peakFlops / hw.bwBps;
      const bwCap = hw.bwBps * intensity;
      const perf = Math.min(hw.peakFlops, bwCap);
      const bound = intensity < ridge ? 'memory' : 'compute';
      const utilPct = (perf / hw.peakFlops) * 100;
      return { hw, ridge, intensity, perf, bound, utilPct };
    },
  };

  /* ───────── 8 · LLM Inference Roofline & KV Cache ───────── */
  const LLM_MODELS = {
    llama8b:  { id: 'llama8b',  paramsB: 8.03, layers: 32, kvHeads: 8, headDim: 128, dModel: 4096 },
    llama70b: { id: 'llama70b', paramsB: 70.6, layers: 80, kvHeads: 8, headDim: 128, dModel: 8192 },
  };

  const llmServe = {
    kvBytesPerToken(modelId, kvBytesPerElem) {
      const m = LLM_MODELS[modelId];
      const b = kvBytesPerElem || 2; // BF16 default
      return 2 * m.layers * m.kvHeads * m.headDim * b;
    },
    eval(o) {
      const m = LLM_MODELS[o.modelId || 'llama8b'];
      const hw = HW[o.hwId || 'h100'];
      const numGpus = Math.max(1, o.numGpus || 1);
      const bits = o.bits || 16;
      const batch = Math.max(1, o.batch || 1);
      const ctx = Math.max(1, o.ctx || 2048);

      const weightBytes = m.paramsB * 1e9 * (bits / 8);
      const kvPerTok = llmServe.kvBytesPerToken(m.id, 2);
      const kvTotalBytes = batch * ctx * kvPerTok;
      const totalMemBytes = weightBytes + kvTotalBytes;
      const capTotalBytes = hw.capGB * 1e9 * numGpus;
      const fits = totalMemBytes <= capTotalBytes;

      const bytesPerStep = weightBytes + kvTotalBytes;
      const attnFlopsPerTok = 4 * m.layers * m.dModel * ctx;
      const flopsPerTok = 2 * m.paramsB * 1e9 + attnFlopsPerTok;
      const totalFlopsStep = batch * flopsPerTok;

      const aggBw = hw.bwBps * numGpus;
      // Note: effective Tensor Core FLOP/s scales roughly inversely with bit-width down to FP8 if supported;
      // here we keep dense BF16 peak as conservative compute ceiling for weight-only quantization or FP8 where applicable.
      const effPeak = bits <= 8 && hw.id !== 'cpu' ? hw.peakFlops * 2 * numGpus : hw.peakFlops * numGpus;

      const tMem = bytesPerStep / aggBw;
      const tComp = totalFlopsStep / effPeak;
      const stepTime = Math.max(tMem, tComp);
      const bound = tMem >= tComp ? 'memory' : 'compute';

      const tokPerSecTotal = batch / stepTime;
      const tokPerSecUser = 1 / stepTime;
      const intensity = totalFlopsStep / bytesPerStep;
      const computeUtilPct = Math.min(100, (totalFlopsStep / stepTime) / effPeak * 100);
      const kvSharePct = (kvTotalBytes / bytesPerStep) * 100;

      return {
        model: m,
        hw,
        numGpus,
        bits,
        batch,
        ctx,
        weightBytes,
        kvPerTok,
        kvTotalBytes,
        totalMemBytes,
        capTotalBytes,
        fits,
        bytesPerStep,
        flopsPerTok,
        stepTime,
        bound,
        tokPerSecTotal,
        tokPerSecUser,
        intensity,
        computeUtilPct,
        kvSharePct,
      };
    },
  };

  /* ───────── 9 · Data movement energy (Horowitz ISSCC 2014, 45nm CMOS) & Interconnects ───────── */
  const energy = {
    // pJ per operation or 32-bit access (Horowitz 2014 ISSCC)
    HOROWITZ_PJ: {
      int32Add: 0.1,
      fp16Add:  0.4,
      fp16Mul:  1.1,
      fp16Mac:  1.5, // 1.1 + 0.4
      fp32Add:  0.9,
      fp32Mul:  3.7,
      fp32Mac:  4.6,
      sram8KB:  5,   // 32-bit read
      sram32KB: 10,
      sram1MB:  100,
      dram32b:  640, // 32-bit off-chip DRAM read = 160 pJ/byte
    },
    INTERCONNECTS: [
      { id: 'hbm3e',  bwGBs: 8000 }, // B200 aggregate HBM3e
      { id: 'hbm3',   bwGBs: 3350 }, // H100 aggregate HBM3
      { id: 'nvlink5',bwGBs: 1800 }, // Blackwell NVLink 5 bidir
      { id: 'nvlink4',bwGBs: 900 },  // Hopper NVLink 4 bidir
      { id: 'pcie5',  bwGBs: 128 },  // PCIe 5.0 x16 bidir (64 GB/s unidir)
      { id: 'eth800', bwGBs: 100 },  // 800 Gb/s Ethernet / IB unidir
    ],
    // Budget per FP16 MAC (2 bytes weight moved from source, amortized over `reuse` MACs)
    budget(reuse, source) {
      const macPj = energy.HOROWITZ_PJ.fp16Mac; // 1.5 pJ
      const read32 = source === 'sram8' ? 5 : source === 'sram1m' ? 100 : 640;
      const movePerMacPj = (read32 / 2) / Math.max(1, reuse); // 2 bytes = half of 32-bit read
      const totalPj = macPj + movePerMacPj;
      const moveSharePct = (movePerMacPj / totalPj) * 100;
      const ratioMoveToMac = movePerMacPj / macPj;
      return { reuse, source, macPj, movePerMacPj, totalPj, moveSharePct, ratioMoveToMac };
    },
  };

  /* ───────── 10 · Frontier snapshot (dated November 2026) ─────────
   * Isolated block so specs can be updated without rewriting prose.
   */
  const FRONTIER = {
    asOf: '2026-11',
    chips: [
      { id: 'epyc9654',   label: 'AMD EPYC 9654 (CPU)',    year: 2022, memType: 'DDR5',  capGB: 768, bwTB: 0.4608, bf16Tflops: 5.7,   precNote: 'FP32', status: 'shipped' },
      { id: 'h100',       label: 'NVIDIA H100 SXM',        year: 2023, memType: 'HBM3',  capGB: 80,  bwTB: 3.35,   bf16Tflops: 989.5, precNote: 'BF16', status: 'shipped' },
      { id: 'mi300x',     label: 'AMD Instinct MI300X',    year: 2023, memType: 'HBM3',  capGB: 192, bwTB: 5.30,   bf16Tflops: 1300,  precNote: 'BF16', status: 'shipped' },
      { id: 'h200',       label: 'NVIDIA H200 SXM',        year: 2024, memType: 'HBM3e', capGB: 141, bwTB: 4.80,   bf16Tflops: 989.5, precNote: 'BF16', status: 'shipped' },
      { id: 'b200',       label: 'NVIDIA B200',            year: 2025, memType: 'HBM3e', capGB: 180, bwTB: 8.00,   bf16Tflops: 2250,  precNote: 'BF16', status: 'shipped' },
      { id: 'ironwood',   label: 'Google TPU v7 Ironwood', year: 2025, memType: 'HBM',   capGB: 192, bwTB: 7.38,   bf16Tflops: 2307,  precNote: 'BF16', status: 'shipped' },
      { id: 'mi355x',     label: 'AMD Instinct MI355X',    year: 2025, memType: 'HBM3e', capGB: 288, bwTB: 8.19,   bf16Tflops: null,  precNote: 'CDNA4',status: 'shipped' },
      { id: 'rubin',      label: 'NVIDIA Rubin (spec)',    year: 2026, memType: 'HBM4',  capGB: 288, bwTB: 19.2,   bf16Tflops: null,  fp4Pflops: 50, precNote: 'NVFP4 50 PFLOPS (spec)', status: 'vendor-spec' },
    ],
    hbm4Jedec: {
      standard: 'JESD270-4',
      published: '2025-04',
      busWidthBits: 2048,
      channels: 32,
      baselineStackTB: 2.0,
      vendorSampleStackTBMin: 2.5,
      vendorSampleStackTBMax: 3.3,
    },
  };

  return {
    clamp,
    pipeline,
    hierarchy,
    createCache,
    cacheWalk,
    matmulTile,
    memoryWall,
    multicore,
    systolic,
    gemmLayer,
    HW,
    WORKLOADS,
    roofline,
    LLM_MODELS,
    llmServe,
    energy,
    FRONTIER,
  };
}));
