/* Why NVMe Is So Fast: pure quantitative models (UMD, no DOM).
 * Used by app.js via window.NvmeEssayModels and by tests/models.cjs via require().
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.NvmeEssayModels = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

  /* ───────── 1 · End-to-end 4 KB random read latency breakdown ───────── */
  const latencyBreakdown = {
    PRESETS: {
      hdd:  { id: 'hdd',  mediaUs: 8500, wireUs: 7,  protoUs: 28 },
      sata: { id: 'sata', mediaUs: 75,   wireUs: 7,  protoUs: 18 },
      nvme: { id: 'nvme', mediaUs: 75,   wireUs: 1,  protoUs: 4 },
      ull:  { id: 'ull',  mediaUs: 10,   wireUs: 1,  protoUs: 4 }
    },
    compute(presetId, customMediaUs, protoOverride) {
      const base = latencyBreakdown.PRESETS[presetId] || latencyBreakdown.PRESETS.nvme;
      const mediaUs = customMediaUs != null ? clamp(customMediaUs, 5, 20000) : base.mediaUs;
      const proto = protoOverride || (presetId === 'hdd' || presetId === 'sata' ? 'ahci' : 'nvme');
      const wireUs = proto === 'ahci' ? 7 : 1;
      const protoUs = proto === 'ahci' ? 18 : 4;
      const overheadUs = wireUs + protoUs;
      const totalUs = mediaUs + overheadUs;
      const overheadPct = (overheadUs / totalUs) * 100;
      const mediaPct = (mediaUs / totalUs) * 100;
      const maxIopsQd1 = 1e6 / totalUs;
      return {
        presetId: base.id,
        proto,
        mediaUs,
        wireUs,
        protoUs,
        overheadUs,
        totalUs,
        overheadPct,
        mediaPct,
        maxIopsQd1
      };
    }
  };

  /* ───────── 2 · Bus bandwidth, encoding overhead & Little's Law ───────── */
  const busBandwidth = {
    BUSES: {
      sata3: { id: 'sata3', gtps: 6,  lanes: 1, encEff: 0.80,       protoEff: 0.92, rawMBs: 600 },
      pcie3: { id: 'pcie3', gtps: 8,  lanes: 4, encEff: 128 / 130,  protoEff: 0.90, rawMBs: 3938.46 },
      pcie4: { id: 'pcie4', gtps: 16, lanes: 4, encEff: 128 / 130,  protoEff: 0.90, rawMBs: 7876.92 },
      pcie5: { id: 'pcie5', gtps: 32, lanes: 4, encEff: 128 / 130,  protoEff: 0.90, rawMBs: 15753.85 },
      pcie6: { id: 'pcie6', gtps: 64, lanes: 4, encEff: 242 / 256,  protoEff: 0.94, rawMBs: 32000 }
    },
    compute(busId, qd, readUs) {
      const b = busBandwidth.BUSES[busId] || busBandwidth.BUSES.pcie4;
      const q = clamp(Math.round(qd || 1), 1, 512);
      const latUs = clamp(readUs || 80, 10, 200);
      const effectiveMBs = b.id === 'pcie6'
        ? 28500
        : b.rawMBs * b.protoEff;
      const max4kIops = (effectiveMBs * 1e6) / 4096;
      const qdIops = q / (latUs * 1e-6);
      const actualIops = Math.min(qdIops, max4kIops);
      const actualMBs = (actualIops * 4096) / 1e6;
      const busUtilPct = (actualMBs / effectiveMBs) * 100;
      const qdToSaturate4k = Math.ceil(max4kIops * (latUs * 1e-6));
      return {
        busId: b.id,
        gtps: b.gtps,
        lanes: b.lanes,
        encEffPct: b.encEff * 100,
        rawMBs: b.rawMBs,
        effectiveMBs,
        max4kIops,
        qd: q,
        latUs,
        qdIops,
        actualIops,
        actualMBs,
        busUtilPct,
        qdToSaturate4k
      };
    }
  };

  /* ───────── 3 · Multi-core queue & lock contention scaling ───────── */
  const queueScaling = {
    simulatePoint(cores, nandCapKIops) {
      const c = clamp(Math.round(cores), 1, 32);
      const cap = clamp(nandCapKIops || 1500, 300, 3000);
      const perCoreKIops = 180;
      const ahciQdCap = 400; // 32 slots / 80 us
      // Spinlock hold (1.2 us) + cache-line bounce per extra core (0.35 us)
      const lockServiceUs = 1.2 + 0.35 * (c - 1);
      const ahciLockCap = 1000 / lockServiceUs;
      const ahciKIops = Math.min(c * perCoreKIops, ahciQdCap, ahciLockCap, cap);
      const nvmeKIops = Math.min(c * perCoreKIops, cap);
      const speedup = nvmeKIops / ahciKIops;
      const lockWaitPct = Math.max(0, 1 - ahciKIops / Math.min(c * perCoreKIops, cap)) * 100;
      return {
        cores: c,
        ahciKIops,
        nvmeKIops,
        speedup,
        lockWaitPct,
        ahciLockCap,
        ahciQdCap
      };
    },
    curve(nandCapKIops) {
      const pts = [];
      for (let c = 1; c <= 32; c++) pts.push(queueScaling.simulatePoint(c, nandCapKIops));
      return pts;
    }
  };

  /* ───────── 4 · NVMe circular ring buffer (SQ/CQ) & Doorbell state machine ───────── */
  const ringProtocol = {
    SIZE: 8,
    PHASES: ['submit', 'doorbell', 'fetch_dma', 'complete', 'ack'],
    create() {
      return {
        sqHead: 0,
        sqTail: 0,
        cqHead: 0,
        cqTail: 0,
        dbSqTail: 0,
        dbCqHead: 0,
        phaseIdx: 0,
        completed: 0,
        nvmeMmioOps: 0,
        ahciMmioOps: 0,
        lastCmdId: 0,
        sqSlots: new Array(8).fill(null),
        cqSlots: new Array(8).fill(null)
      };
    },
    step(st) {
      const s = Object.assign({}, st, {
        sqSlots: st.sqSlots.slice(),
        cqSlots: st.cqSlots.slice()
      });
      const phase = ringProtocol.PHASES[s.phaseIdx];
      if (phase === 'submit') {
        s.lastCmdId += 1;
        s.sqSlots[s.sqTail] = { id: s.lastCmdId, state: 'queued' };
        s.sqTail = (s.sqTail + 1) % ringProtocol.SIZE;
      } else if (phase === 'doorbell') {
        s.dbSqTail = s.sqTail;
        s.nvmeMmioOps += 1; // 1 posted MMIO write
        s.ahciMmioOps += 3; // AHCI: uncached PxCI/PxIS/status reads+writes
      } else if (phase === 'fetch_dma') {
        if (s.sqHead !== s.dbSqTail) {
          s.sqSlots[s.sqHead] = { id: s.lastCmdId, state: 'dma' };
          s.sqHead = (s.sqHead + 1) % ringProtocol.SIZE;
        }
      } else if (phase === 'complete') {
        s.cqSlots[s.cqTail] = { id: s.lastCmdId, state: 'done' };
        s.cqTail = (s.cqTail + 1) % ringProtocol.SIZE;
        s.sqSlots[(s.sqHead + ringProtocol.SIZE - 1) % ringProtocol.SIZE] = null;
      } else if (phase === 'ack') {
        if (s.cqHead !== s.cqTail) {
          s.cqSlots[s.cqHead] = null;
          s.cqHead = (s.cqHead + 1) % ringProtocol.SIZE;
          s.dbCqHead = s.cqHead;
          s.completed += 1;
          s.nvmeMmioOps += 1; // 1 posted CQ Head doorbell write
          s.ahciMmioOps += 2; // AHCI: uncached interrupt clear + port read
        }
      }
      s.phaseIdx = (s.phaseIdx + 1) % ringProtocol.PHASES.length;
      return { state: s, phase };
    },
    runOneCmd(st) {
      let cur = st;
      for (let i = 0; i < ringProtocol.PHASES.length; i++) {
        cur = ringProtocol.step(cur).state;
      }
      return cur;
    }
  };

  /* ───────── 5 · Multi-channel NAND die parallelism ───────── */
  const nandParallel = {
    TR_US: 50,
    TDMA_US: 2.5,
    simulate(channels, diesPerCh, qd) {
      const ch = clamp(Math.round(channels || 8), 1, 8);
      const dpc = clamp(Math.round(diesPerCh || 4), 1, 4);
      const totalDies = ch * dpc;
      const q = clamp(Math.round(qd || 1), 1, 64);
      const activeDies = Math.min(q, totalDies);
      const singleDieIops = 1e6 / (nandParallel.TR_US + nandParallel.TDMA_US);
      const rawDieIops = activeDies * singleDieIops;
      const chBusCapIops = ch * 400000; // ~1.6 GB/s per channel at 4 KB
      const iops = Math.min(rawDieIops, chBusCapIops);
      const mbps = (iops * 4096) / 1e6;
      const speedupVsQd1 = iops / singleDieIops;
      const dieUtilPct = (activeDies / totalDies) * 100;
      return {
        channels: ch,
        diesPerCh: dpc,
        totalDies,
        qd: q,
        activeDies,
        singleDieIops,
        iops,
        mbps,
        speedupVsQd1,
        dieUtilPct
      };
    }
  };

  /* ───────── 6 · Write Amplification (WAF), Over-Provisioning & Trim ───────── */
  const writeAmp = {
    RAW_NAND_WRITE_MBS: 4000,
    compute(fillPct, opPct, trimOn) {
      const fill = clamp(fillPct || 75, 20, 98);
      const op = clamp(opPct || 7, 7, 28);
      const trim = trimOn !== false;
      const physicalRatio = 1 + op / 100;
      const logicalUtil = (fill / 100) / physicalRatio;
      // Without Trim, deleted/stale pages remain marked valid in FTL (+0.20 stale fraction, capped at 0.95)
      const victimValid = trim
        ? clamp(logicalUtil, 0.15, 0.95)
        : clamp(logicalUtil + 0.20, 0.20, 0.95);
      const waf = 1 / (1 - victimValid);
      const hostWriteMBs = writeAmp.RAW_NAND_WRITE_MBS / waf;
      const freeInVictimPct = (1 - victimValid) * 100;
      return {
        fillPct: fill,
        opPct: op,
        trimOn: trim,
        logicalUtilPct: logicalUtil * 100,
        victimValidPct: victimValid * 100,
        freeInVictimPct,
        waf,
        hostWriteMBs
      };
    }
  };

  /* ───────── 7 · Polling vs. Interrupts (io_uring / SPDK) ───────── */
  const pollingVsIrq = {
    IRQ_CPU_US: 3.5,
    POLL_OVERHEAD_US: 0.5,
    compute(mediaUs, irqUs, iopsK) {
      const m = clamp(mediaUs || 10, 5, 100);
      const iq = clamp(irqUs || 6, 2, 12);
      const rate = clamp(iopsK || 200, 10, 800) * 1000;
      const irqLatencyUs = m + iq;
      const pollLatencyUs = m + pollingVsIrq.POLL_OVERHEAD_US;
      const irqOverheadPct = (iq / irqLatencyUs) * 100;
      const latencySavedPct = ((irqLatencyUs - pollLatencyUs) / irqLatencyUs) * 100;
      const irqCores = (rate * pollingVsIrq.IRQ_CPU_US) / 1e6;
      const pollCores = 1.0; // 1 dedicated polling core up to ~1M+ IOPS
      const crossoverIopsK = 1000 / pollingVsIrq.IRQ_CPU_US; // ~285.7 kIOPS
      return {
        mediaUs: m,
        irqUs: iq,
        iopsK: rate / 1000,
        irqLatencyUs,
        pollLatencyUs,
        irqOverheadPct,
        latencySavedPct,
        irqCores,
        pollCores,
        crossoverIopsK
      };
    }
  };

  /* ───────── 8 · Frontier data path: POSIX vs GPUDirect Storage ───────── */
  const frontierPath = {
    PATHS: {
      posix:     { id: 'posix',     cpuCopies: 2, capMBs: 6500,  cpuLoadPct: 85 },
      gds:       { id: 'gds',       cpuCopies: 0, capMBs: 99999, cpuLoadPct: 4 },
      multi_gds: { id: 'multi_gds', cpuCopies: 0, capMBs: 99999, cpuLoadPct: 6 }
    },
    GEN_MBS: {
      gen4: 7089,
      gen5: 14178,
      gen6: 28500
    },
    compute(pathId, modelGB, genId) {
      const p = frontierPath.PATHS[pathId] || frontierPath.PATHS.gds;
      const gb = clamp(modelGB || 40, 5, 200);
      const g = frontierPath.GEN_MBS[genId] ? genId : 'gen6';
      const linkMBs = frontierPath.GEN_MBS[g];
      const driveCount = p.id === 'multi_gds' ? 4 : 1;
      const effectiveMBs = Math.min(linkMBs * driveCount, p.capMBs);
      const transferSec = (gb * 1000) / effectiveMBs;
      return {
        pathId: p.id,
        genId: g,
        modelGB: gb,
        driveCount,
        cpuCopies: p.cpuCopies,
        cpuLoadPct: p.cpuLoadPct,
        effectiveGBs: effectiveMBs / 1000,
        transferSec
      };
    }
  };

  return {
    clamp,
    latencyBreakdown,
    busBandwidth,
    queueScaling,
    ringProtocol,
    nandParallel,
    writeAmp,
    pollingVsIrq,
    frontierPath
  };
}));
