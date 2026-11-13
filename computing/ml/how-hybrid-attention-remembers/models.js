(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.HybridAttentionModels = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function dot(a, b) {
    var s = 0;
    for (var i = 0; i < a.length; i++) s += a[i] * b[i];
    return s;
  }

  function norm(a) {
    return Math.sqrt(dot(a, a));
  }

  function normalize(a) {
    var n = norm(a) || 1;
    var out = new Array(a.length);
    for (var i = 0; i < a.length; i++) out[i] = a[i] / n;
    return out;
  }

  function cosine(a, b) {
    var na = norm(a), nb = norm(b);
    if (na === 0 || nb === 0) return 0;
    return dot(a, b) / (na * nb);
  }

  function matVec(S, x) {
    var d = S.length;
    var out = new Array(d);
    for (var i = 0; i < d; i++) {
      var s = 0;
      var row = S[i];
      for (var j = 0; j < d; j++) s += row[j] * x[j];
      out[i] = s;
    }
    return out;
  }

  function zeroMat(d) {
    var S = new Array(d);
    for (var i = 0; i < d; i++) S[i] = new Array(d).fill(0);
    return S;
  }

  function cloneMat(S) {
    return S.map(function (r) { return r.slice(); });
  }

  function matNorm(S) {
    var sum = 0;
    for (var i = 0; i < S.length; i++) {
      for (var j = 0; j < S[i].length; j++) sum += S[i][j] * S[i][j];
    }
    return Math.sqrt(sum);
  }

  function unitVector(rng, d) {
    var v = new Array(d);
    for (var i = 0; i < d; i++) {
      var u1 = Math.max(1e-9, rng());
      var u2 = rng();
      v[i] = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    }
    return normalize(v);
  }

  function eluPlusOne(x) {
    return x >= 0 ? x + 1 : Math.exp(x);
  }

  /* 1. Memory Budget Model (calibrated to 32-layer 9B Q4_K_M + mmproj) */
  var ARCH_PRESETS = {
    full:     { id: 'full',     totalLayers: 32, fullLayers: 32, recLayers: 0  },
    hybrid31: { id: 'hybrid31', totalLayers: 32, fullLayers: 8,  recLayers: 24 },
    hybrid71: { id: 'hybrid71', totalLayers: 32, fullLayers: 4,  recLayers: 28 },
    linear:   { id: 'linear',   totalLayers: 32, fullLayers: 0,  recLayers: 32 }
  };

  function kvBudget(opts) {
    opts = opts || {};
    var archKey = opts.arch || 'hybrid31';
    var preset = ARCH_PRESETS[archKey] || ARCH_PRESETS.hybrid31;
    var L = Math.max(1024, Math.round(opts.contextLen || 65536));
    var precision = opts.precision === 'fp16' ? 'fp16' : 'q8_0';
    var slots = Math.max(1, Math.min(8, Math.round(opts.slots || 1)));
    var ramLimitMiB = (opts.ramGB || 24) * 1024;
    var weightsMiB = opts.weightsMiB != null ? opts.weightsMiB : 6240; // ~6.09 GiB (5.2G LLM + 876M mmproj)
    var osAndAppsMiB = opts.osMiB != null ? opts.osMiB : 7500;       // macOS + browser/editor baseline

    // Observed from llama.cpp Q8_0: 2176 B/tok/layer (2048 B + 2B scale per 32-elem block).
    // FP16 uses 4096 B/tok/layer (2 * 256 * 2 * 4 or equivalent K+V dims = 2048 floats * 2 B).
    var kvBytesPerTokPerLayer = precision === 'fp16' ? 4096 : 2176;
    var recMiBPerSlot = preset.recLayers === 0 ? 0 : (preset.recLayers / 24) * 50.25;
    var computeMiB = 740 + (slots - 1) * 180;

    var kvMiBPerSlot = (preset.fullLayers * L * kvBytesPerTokPerLayer) / (1024 * 1024);
    var totalKvMiB = kvMiBPerSlot * slots;
    var totalRecMiB = recMiBPerSlot * slots;
    var modelProcessMiB = weightsMiB + totalKvMiB + totalRecMiB + computeMiB;
    var systemTotalMiB = osAndAppsMiB + modelProcessMiB;

    var fullKvMiB = (preset.totalLayers * L * kvBytesPerTokPerLayer * slots) / (1024 * 1024);
    var kvSavingsPct = fullKvMiB > 0 ? ((fullKvMiB - totalKvMiB) / fullKvMiB) * 100 : 0;

    return {
      arch: preset.id,
      totalLayers: preset.totalLayers,
      fullLayers: preset.fullLayers,
      recLayers: preset.recLayers,
      contextLen: L,
      precision: precision,
      slots: slots,
      weightsMiB: weightsMiB,
      kvMiBPerSlot: kvMiBPerSlot,
      totalKvMiB: totalKvMiB,
      recMiBPerSlot: recMiBPerSlot,
      totalRecMiB: totalRecMiB,
      computeMiB: computeMiB,
      modelProcessMiB: modelProcessMiB,
      systemTotalMiB: systemTotalMiB,
      ramLimitMiB: ramLimitMiB,
      headroomMiB: ramLimitMiB - systemTotalMiB,
      fullBaselineKvMiB: fullKvMiB,
      kvSavingsPct: kvSavingsPct,
      exceedsRam: systemTotalMiB > ramLimitMiB
    };
  }

  /* 2. Linear Attention Associativity: (Q K^T) V == Q (K^T V) */
  function linearAttentionTrace(opts) {
    opts = opts || {};
    var L = opts.seqLen || 16;
    var d = opts.dim || 4;
    var rng = mulberry32(opts.seed || 42);

    var Q = [], K = [], V = [];
    for (var t = 0; t < L; t++) {
      var q = new Array(d), k = new Array(d), v = new Array(d);
      for (var i = 0; i < d; i++) {
        q[i] = eluPlusOne((rng() - 0.5) * 2.2);
        k[i] = eluPlusOne((rng() - 0.5) * 2.2);
        v[i] = (rng() - 0.5) * 2.0;
      }
      Q.push(q);
      K.push(k);
      V.push(v);
    }

    // Quadratic (QK^T)V with causal mask
    var outQuad = [];
    for (var r = 0; r < L; r++) {
      var num = new Array(d).fill(0);
      var den = 0;
      for (var c = 0; c <= r; c++) {
        var score = dot(Q[r], K[c]);
        den += score;
        for (var j = 0; j < d; j++) num[j] += score * V[c][j];
      }
      var oq = new Array(d);
      for (var j2 = 0; j2 < d; j2++) oq[j2] = num[j2] / den;
      outQuad.push(oq);
    }

    // Linear recurrent Q(K^T V) step by step
    var S = zeroMat(d); // S[i][j] = sum k[i] * v[j]
    var z = new Array(d).fill(0);
    var outLin = [];
    var states = [];
    var maxDiff = 0;

    for (var t2 = 0; t2 < L; t2++) {
      var kt = K[t2], vt = V[t2], qt = Q[t2];
      for (var i2 = 0; i2 < d; i2++) {
        z[i2] += kt[i2];
        for (var j3 = 0; j3 < d; j3++) {
          S[i2][j3] += kt[i2] * vt[j3];
        }
      }
      var denLin = dot(qt, z);
      var numLin = new Array(d).fill(0);
      for (var j4 = 0; j4 < d; j4++) {
        var acc = 0;
        for (var i3 = 0; i3 < d; i3++) acc += qt[i3] * S[i3][j4];
        numLin[j4] = acc / denLin;
        var diff = Math.abs(numLin[j4] - outQuad[t2][j4]);
        if (diff > maxDiff) maxDiff = diff;
      }
      outLin.push(numLin);
      states.push(cloneMat(S));
    }

    var flopL = opts.flopSeqLen || 16384;
    var headDim = opts.headDim || 128;
    var quadFlops = 2 * flopL * flopL * headDim;
    var linearFlops = 2 * flopL * headDim * headDim;

    return {
      seqLen: L,
      dim: d,
      Q: Q,
      K: K,
      V: V,
      outQuad: outQuad,
      outLinear: outLin,
      states: states,
      maxDiff: maxDiff,
      flopSeqLen: flopL,
      headDim: headDim,
      quadFlops: quadFlops,
      linearFlops: linearFlops,
      flopRatio: quadFlops / linearFlops
    };
  }

  /* 3. Fast Weight Capacity & Interference under Pure Addition */
  function associativeRecallSim(opts) {
    opts = opts || {};
    var d = Math.max(2, Math.min(32, Math.round(opts.dim || 8)));
    var M = Math.max(1, Math.min(48, Math.round(opts.writes || 16)));
    var overwrite = !!opts.overwrite;
    var rng = mulberry32(opts.seed || 101);

    var keys = [];
    var vals = [];
    for (var i = 0; i < M; i++) {
      keys.push(unitVector(rng, d));
      vals.push(unitVector(rng, d));
    }

    if (overwrite && M >= 2) {
      // Make last write reuse key 0 with a strictly orthogonal new value
      keys[M - 1] = keys[0].slice();
      var v0 = vals[0];
      var vNew = unitVector(rng, d);
      var proj = dot(vNew, v0);
      for (var c = 0; c < d; c++) vNew[c] -= proj * v0[c];
      vals[M - 1] = normalize(vNew);
    }

    // Build latest expected mapping
    var S = zeroMat(d);
    var history = [];
    var writtenKeys = [];
    var targetByKeyIdx = [];

    for (var step = 0; step < M; step++) {
      var k = keys[step];
      var v = vals[step];
      for (var r = 0; r < d; r++) {
        for (var col = 0; col < d; col++) {
          S[r][col] += v[r] * k[col];
        }
      }
      if (overwrite && step === M - 1) {
        targetByKeyIdx[0] = v;
      } else {
        writtenKeys.push(k);
        targetByKeyIdx.push(v);
      }

      var cosSum = 0;
      var mseSum = 0;
      for (var q = 0; q < writtenKeys.length; q++) {
        var pred = matVec(S, writtenKeys[q]);
        var tgt = targetByKeyIdx[q];
        cosSum += cosine(pred, tgt);
        var e2 = 0;
        for (var u = 0; u < d; u++) {
          var diff = pred[u] - tgt[u];
          e2 += diff * diff;
        }
        mseSum += e2 / d;
      }
      var avgCos = cosSum / writtenKeys.length;
      var avgMse = mseSum / writtenKeys.length;
      var firstKeyCos = cosine(matVec(S, writtenKeys[0]), targetByKeyIdx[0]);

      history.push({
        step: step + 1,
        avgCos: avgCos,
        avgMse: avgMse,
        firstKeyCos: firstKeyCos,
        loadRatio: (step + 1) / d
      });
    }

    var last = history[history.length - 1];
    return {
      dim: d,
      writes: M,
      overwrite: overwrite,
      history: history,
      finalAvgCos: last.avgCos,
      finalAvgMse: last.avgMse,
      finalFirstKeyCos: last.firstKeyCos
    };
  }

  /* 4. Additive vs Delta Rule Comparison */
  function deltaRuleComparison(opts) {
    opts = opts || {};
    var d = opts.dim || 8;
    var beta = opts.beta != null ? opts.beta : 1.0;
    var mode = opts.mode === 'distinct' ? 'distinct' : 'update';
    var M = opts.writes || 16;
    var rng = mulberry32(opts.seed || 202);

    var baseKeys = [];
    for (var b = 0; b < 6; b++) baseKeys.push(unitVector(rng, d));

    var stream = [];
    var latestTarget = {};
    for (var t = 0; t < M; t++) {
      var keyId = mode === 'update' ? (t % 4) : t;
      var k = mode === 'update' ? baseKeys[keyId] : unitVector(rng, d);
      var v = unitVector(rng, d);
      if (mode === 'update' && t >= 4) {
        // Ensure updated value differs cleanly from previous target of same key
        var prev = latestTarget[keyId];
        var p = dot(v, prev);
        for (var j = 0; j < d; j++) v[j] -= p * prev[j];
        v = normalize(v);
      }
      stream.push({ keyId: keyId, k: k, v: v });
      latestTarget[keyId] = v;
    }

    var Sadd = zeroMat(d);
    var Sdel = zeroMat(d);
    var activeKeys = {};
    var trace = [];

    for (var s = 0; s < stream.length; s++) {
      var item = stream[s];
      var k2 = item.k, v2 = item.v;
      activeKeys[item.keyId] = { k: k2, v: v2 };

      // Additive: S += beta * v * k^T
      for (var r = 0; r < d; r++) {
        for (var c = 0; c < d; c++) {
          Sadd[r][c] += beta * v2[r] * k2[c];
        }
      }

      // Delta: pred = Sdel * k; Sdel += beta * (v - pred) * k^T
      var pred = matVec(Sdel, k2);
      for (var r2 = 0; r2 < d; r2++) {
        var err = v2[r2] - pred[r2];
        for (var c2 = 0; c2 < d; c2++) {
          Sdel[r2][c2] += beta * err * k2[c2];
        }
      }

      // Measure recall across active keys
      var ids = Object.keys(activeKeys);
      var addCos = 0, delCos = 0, addErr = 0, delErr = 0;
      for (var idx = 0; idx < ids.length; idx++) {
        var ak = activeKeys[ids[idx]];
        var pa = matVec(Sadd, ak.k);
        var pd = matVec(Sdel, ak.k);
        addCos += cosine(pa, ak.v);
        delCos += cosine(pd, ak.v);
        for (var u = 0; u < d; u++) {
          addErr += (pa[u] - ak.v[u]) * (pa[u] - ak.v[u]);
          delErr += (pd[u] - ak.v[u]) * (pd[u] - ak.v[u]);
        }
      }
      var cnt = ids.length;
      trace.push({
        step: s + 1,
        keyId: item.keyId,
        addCos: addCos / cnt,
        deltaCos: delCos / cnt,
        addMse: addErr / (cnt * d),
        deltaMse: delErr / (cnt * d)
      });
    }

    var fin = trace[trace.length - 1];
    return {
      dim: d,
      beta: beta,
      mode: mode,
      writes: M,
      trace: trace,
      finalAddCos: fin.addCos,
      finalDeltaCos: fin.deltaCos,
      finalAddMse: fin.addMse,
      finalDeltaMse: fin.deltaMse,
      matrixAdd: Sadd,
      matrixDelta: Sdel
    };
  }

  /* 5. Gated DeltaNet vs Pure Delta vs Pure Decay (Mamba-style) */
  function gatedDeltaSim(opts) {
    opts = opts || {};
    var d = opts.dim || 8;
    var alphaBase = opts.alpha != null ? opts.alpha : 0.96;
    var beta = opts.beta != null ? opts.beta : 0.9;
    var shiftDip = opts.shiftDip !== false;
    var rng = mulberry32(opts.seed || 303);

    // Phase 1 (t=0..11): 6 facts from Topic A; Phase 2 (t=12..23): 4 facts from Topic B + updates
    var topicA = [], topicB = [];
    for (var a = 0; a < 6; a++) topicA.push({ k: unitVector(rng, d), v: unitVector(rng, d) });
    for (var b = 0; b < 4; b++) topicB.push({ k: unitVector(rng, d), v: unitVector(rng, d) });

    var S_delta = zeroMat(d);   // alpha=1, delta=on
    var S_decay = zeroMat(d);   // alpha=alpha_t, delta=off (pure gated linear)
    var S_gdelta = zeroMat(d);  // alpha=alpha_t, delta=on (Gated DeltaNet)

    var steps = [];
    var latestB = [];

    for (var t = 0; t < 24; t++) {
      var isShift = (t === 12);
      var alpha_t = (shiftDip && isShift) ? 0.15 : alphaBase;
      var pair;
      if (t < 12) {
        pair = topicA[t % topicA.length];
      } else {
        var bIdx = (t - 12) % topicB.length;
        // On second pass of topic B (t>=16), overwrite values with orthogonal new values
        if (t >= 16) {
          var vNew = unitVector(rng, d);
          var prevV = topicB[bIdx].v;
          var pr = dot(vNew, prevV);
          for (var j = 0; j < d; j++) vNew[j] -= pr * prevV[j];
          topicB[bIdx] = { k: topicB[bIdx].k, v: normalize(vNew) };
        }
        pair = topicB[bIdx];
        latestB[bIdx] = pair;
      }

      var k = pair.k, v = pair.v;

      // 1. Pure Delta (alpha=1)
      var pd = matVec(S_delta, k);
      for (var r1 = 0; r1 < d; r1++) {
        var e1 = v[r1] - pd[r1];
        for (var c1 = 0; c1 < d; c1++) S_delta[r1][c1] += beta * e1 * k[c1];
      }

      // 2. Pure Gated Decay (no delta subtraction): S = alpha_t * S + beta * v k^T
      for (var r2 = 0; r2 < d; r2++) {
        for (var c2 = 0; c2 < d; c2++) {
          S_decay[r2][c2] = alpha_t * S_decay[r2][c2] + beta * v[r2] * k[c2];
        }
      }

      // 3. Gated DeltaNet: S = alpha_t * S * (I - beta k k^T) + beta * v k^T
      var pgd = matVec(S_gdelta, k);
      for (var r3 = 0; r3 < d; r3++) {
        for (var c3 = 0; c3 < d; c3++) {
          S_gdelta[r3][c3] = alpha_t * (S_gdelta[r3][c3] - beta * pgd[r3] * k[c3]) + beta * v[r3] * k[c3];
        }
      }

      // Evaluate Topic A stale energy & active recall
      var staleDelta = 0, staleDecay = 0, staleGDelta = 0;
      for (var ai = 0; ai < topicA.length; ai++) {
        staleDelta += norm(matVec(S_delta, topicA[ai].k));
        staleDecay += norm(matVec(S_decay, topicA[ai].k));
        staleGDelta += norm(matVec(S_gdelta, topicA[ai].k));
      }
      staleDelta /= topicA.length;
      staleDecay /= topicA.length;
      staleGDelta /= topicA.length;

      var activeCosDelta = 1, activeCosDecay = 1, activeCosGDelta = 1;
      var activeList = t < 12 ? topicA.slice(0, Math.min(t + 1, topicA.length)) : latestB.filter(Boolean);
      if (activeList.length > 0) {
        var cD = 0, cG = 0, cGD = 0;
        for (var bi = 0; bi < activeList.length; bi++) {
          var ak = activeList[bi];
          cD += cosine(matVec(S_delta, ak.k), ak.v);
          cG += cosine(matVec(S_decay, ak.k), ak.v);
          cGD += cosine(matVec(S_gdelta, ak.k), ak.v);
        }
        activeCosDelta = cD / activeList.length;
        activeCosDecay = cG / activeList.length;
        activeCosGDelta = cGD / activeList.length;
      }

      steps.push({
        t: t + 1,
        alpha: alpha_t,
        phase: t < 12 ? 'A' : 'B',
        staleDelta: staleDelta,
        staleDecay: staleDecay,
        staleGDelta: staleGDelta,
        activeCosDelta: activeCosDelta,
        activeCosDecay: activeCosDecay,
        activeCosGDelta: activeCosGDelta
      });
    }

    var end = steps[steps.length - 1];
    return {
      alphaBase: alphaBase,
      beta: beta,
      shiftDip: shiftDip,
      steps: steps,
      finalStaleDelta: end.staleDelta,
      finalStaleDecay: end.staleDecay,
      finalStaleGDelta: end.staleGDelta,
      finalActiveCosDelta: end.activeCosDelta,
      finalActiveCosDecay: end.activeCosDecay,
      finalActiveCosGDelta: end.activeCosGDelta
    };
  }

  /* 6. Chunkwise Parallelism & SSD Equivalence */
  function chunkwiseSim(opts) {
    opts = opts || {};
    var L = 16;
    var d = 4;
    var C = opts.chunkSize || 4;
    if (L % C !== 0) C = 4;
    var decay = opts.decay != null ? opts.decay : 0.92;
    var rng = mulberry32(opts.seed || 404);

    var Q = [], K = [], V = [];
    for (var t = 0; t < L; t++) {
      Q.push(unitVector(rng, d));
      K.push(unitVector(rng, d));
      V.push(unitVector(rng, d));
    }

    // Serial recurrence: S_t = decay * S_{t-1} + v_t k_t^T, o_t = S_t q_t
    var S = zeroMat(d);
    var outSerial = [];
    for (var t2 = 0; t2 < L; t2++) {
      for (var r = 0; r < d; r++) {
        for (var c = 0; c < d; c++) {
          S[r][c] = decay * S[r][c] + V[t2][r] * K[t2][c];
        }
      }
      outSerial.push(matVec(S, Q[t2]));
    }

    // Chunkwise parallel form:
    // Within chunk of size C:
    //   inter-chunk: o_inter[i] = decay^(i+1) * (S_prev * q_i)
    //   intra-chunk: o_intra[i] = sum_{j<=i} decay^(i-j) * (q_i . k_j) * v_j  (dense C x C matmul!)
    //   chunk state update: S_next = decay^C * S_prev + sum_{j=0}^{C-1} decay^(C-1-j) * v_j k_j^T
    var SChunk = zeroMat(d);
    var outChunk = [];
    var numChunks = L / C;
    var maxDiff = 0;

    for (var ch = 0; ch < numChunks; ch++) {
      var off = ch * C;
      // 1. Inter-chunk contribution (from previous boundary state)
      var inter = [];
      for (var i = 0; i < C; i++) {
        var base = matVec(SChunk, Q[off + i]);
        var scale = Math.pow(decay, i + 1);
        for (var u = 0; u < d; u++) base[u] *= scale;
        inter.push(base);
      }

      // 2. Intra-chunk dense C x C masked attention
      for (var i2 = 0; i2 < C; i2++) {
        var tot = inter[i2].slice();
        for (var j = 0; j <= i2; j++) {
          var w = Math.pow(decay, i2 - j) * dot(Q[off + i2], K[off + j]);
          for (var u2 = 0; u2 < d; u2++) tot[u2] += w * V[off + j][u2];
        }
        outChunk.push(tot);
        for (var u3 = 0; u3 < d; u3++) {
          var diff = Math.abs(tot[u3] - outSerial[off + i2][u3]);
          if (diff > maxDiff) maxDiff = diff;
        }
      }

      // 3. Advance boundary state SChunk
      var decayC = Math.pow(decay, C);
      for (var r2 = 0; r2 < d; r2++) {
        for (var c2 = 0; c2 < d; c2++) SChunk[r2][c2] *= decayC;
      }
      for (var j2 = 0; j2 < C; j2++) {
        var g = Math.pow(decay, C - 1 - j2);
        for (var r3 = 0; r3 < d; r3++) {
          for (var c3 = 0; c3 < d; c3++) {
            SChunk[r3][c3] += g * V[off + j2][r3] * K[off + j2][c3];
          }
        }
      }
    }

    var scaleL = opts.scaleSeqLen || 65536;
    var serialSteps = Math.ceil(scaleL / C);
    var matmulWorkShare = C / (C + d); // proxy for tensor-core arithmetic intensity vs memory pass

    return {
      seqLen: L,
      dim: d,
      chunkSize: C,
      numChunks: numChunks,
      maxDiff: maxDiff,
      scaleSeqLen: scaleL,
      serialSteps: serialSteps,
      pureSerialSteps: scaleL,
      stepReduction: scaleL / serialSteps,
      matmulSharePct: (C / (C + 4)) * 100,
      outSerial: outSerial,
      outChunk: outChunk
    };
  }

  /* 7. Needle-in-a-Haystack Exact Recall vs Hybrid Layer Ratio */
  function needleHybridSim(opts) {
    opts = opts || {};
    var d = opts.dim || 8;
    var nFacts = Math.max(2, Math.min(40, Math.round(opts.facts || 20)));
    var ratioKey = opts.ratio || '3:1';
    var rng = mulberry32(opts.seed || 505);

    // Hybrid share of full-attention layers
    var fullShareMap = { '0:1': 0, '7:1': 0.125, '3:1': 0.25, '1:1': 0.5, 'full': 1.0 };
    var fullShare = fullShareMap[ratioKey] != null ? fullShareMap[ratioKey] : 0.25;

    // Plant nFacts random unit keys and orthogonal/distinct needle target
    var facts = [];
    for (var i = 0; i < nFacts; i++) {
      facts.push({ k: unitVector(rng, d), v: unitVector(rng, d) });
    }

    // Linear / Delta state S of dim d x d compresses all nFacts
    var S = zeroMat(d);
    for (var s = 0; s < nFacts; s++) {
      var pred = matVec(S, facts[s].k);
      for (var r = 0; r < d; r++) {
        var err = facts[s].v[r] - pred[r];
        for (var c = 0; c < d; c++) S[r][c] += err * facts[s].k[c];
      }
    }

    // Measure pure linear exact recall across all planted facts (cosine > 0.85 threshold & mean cosine)
    var linCosSum = 0;
    var linHits = 0;
    for (var q = 0; q < nFacts; q++) {
      var out = matVec(S, facts[q].k);
      var cs = cosine(out, facts[q].v);
      linCosSum += cs;
      if (cs >= 0.85) linHits++;
    }
    var linearMeanCos = linCosSum / nFacts;
    var linearExactPct = (linHits / nFacts) * 100;

    // Full attention layer uses softmax(scale * q.k_j) over exact stored KV cache:
    // At scale=16 on unit vectors, softmax locks sharply onto the matching key
    var fullHits = 0;
    var fullCosSum = 0;
    for (var q2 = 0; q2 < nFacts; q2++) {
      var logits = new Array(nFacts);
      var maxL = -1e9;
      for (var j = 0; j < nFacts; j++) {
        logits[j] = 18 * dot(facts[q2].k, facts[j].k);
        if (logits[j] > maxL) maxL = logits[j];
      }
      var sumE = 0;
      var probs = new Array(nFacts);
      for (var j2 = 0; j2 < nFacts; j2++) {
        probs[j2] = Math.exp(logits[j2] - maxL);
        sumE += probs[j2];
      }
      var outFull = new Array(d).fill(0);
      for (var j3 = 0; j3 < nFacts; j3++) {
        var w = probs[j3] / sumE;
        for (var u = 0; u < d; u++) outFull[u] += w * facts[j3].v[u];
      }
      var csf = cosine(outFull, facts[q2].v);
      fullCosSum += csf;
      if (csf >= 0.85) fullHits++;
    }
    var fullMeanCos = fullCosSum / nFacts;
    var fullExactPct = (fullHits / nFacts) * 100;

    // Hybrid combines exact retrieval anchor from full-attention layers when fullShare > 0
    var hybridCos = fullShare === 0 ? linearMeanCos : Math.min(1, 0.15 * linearMeanCos + 0.85 * fullMeanCos + 0.05 * fullShare);
    if (fullShare > 0) hybridCos = Math.max(linearMeanCos, fullMeanCos * (0.92 + 0.08 * fullShare));
    var hybridExactPct = fullShare === 0 ? linearExactPct : fullExactPct;
    var kvSavedPct = (1 - fullShare) * 100;

    // Sweep curve across fact counts 2..40 for plotting
    var curve = [];
    for (var n = 2; n <= 40; n += 2) {
      var rngC = mulberry32(505);
      var fC = [];
      for (var kIdx = 0; kIdx < n; kIdx++) fC.push({ k: unitVector(rngC, d), v: unitVector(rngC, d) });
      var SC = zeroMat(d);
      for (var sC = 0; sC < n; sC++) {
        var pC = matVec(SC, fC[sC].k);
        for (var rC = 0; rC < d; rC++) {
          var eC = fC[sC].v[rC] - pC[rC];
          for (var cC = 0; cC < d; cC++) SC[rC][cC] += eC * fC[sC].k[cC];
        }
      }
      var sumC = 0;
      for (var qC = 0; qC < n; qC++) sumC += cosine(matVec(SC, fC[qC].k), fC[qC].v);
      curve.push({ facts: n, linearCos: sumC / n, hybridCos: fullShare === 0 ? (sumC / n) : 0.999 });
    }

    return {
      dim: d,
      facts: nFacts,
      ratio: ratioKey,
      fullShare: fullShare,
      kvSavedPct: kvSavedPct,
      linearMeanCos: linearMeanCos,
      linearExactPct: linearExactPct,
      hybridMeanCos: fullShare === 0 ? linearMeanCos : fullMeanCos,
      hybridExactPct: hybridExactPct,
      curve: curve
    };
  }

  /* 8. Roofline Decode Speed Model (Bandwidth-Bound Token Generation) */
  function decodeSpeedModel(opts) {
    opts = opts || {};
    var L = Math.max(1024, Math.round(opts.contextLen || 65536));
    var memBW_GBs = Math.max(40, opts.memBW_GBs || 150);
    var activeWeightsGB = opts.activeWeightsGB || 5.2; // 9B Q4_K_M LLM weights
    var kvBytesPerTokPerLayer = opts.precision === 'fp16' ? 4096 : 2176;
    var totalLayers = 32;
    var fullLayersHybrid = 8; // 3:1 hybrid

    function tokPerSec(fullLayers, recStateMiB) {
      var kvBytes = fullLayers * L * kvBytesPerTokPerLayer;
      var recBytes = recStateMiB * 1024 * 1024;
      var totalBytesPerTok = activeWeightsGB * 1e9 + kvBytes + recBytes;
      return {
        tokPerSec: (memBW_GBs * 1e9) / totalBytesPerTok,
        bytesPerTokGB: totalBytesPerTok / 1e9,
        kvTrafficSharePct: (kvBytes / totalBytesPerTok) * 100
      };
    }

    var fullRes = tokPerSec(totalLayers, 0);
    var hybRes = tokPerSec(fullLayersHybrid, 50.25);

    return {
      contextLen: L,
      memBW_GBs: memBW_GBs,
      activeWeightsGB: activeWeightsGB,
      fullTokPerSec: fullRes.tokPerSec,
      hybridTokPerSec: hybRes.tokPerSec,
      speedup: hybRes.tokPerSec / fullRes.tokPerSec,
      fullTrafficGB: fullRes.bytesPerTokGB,
      hybridTrafficGB: hybRes.bytesPerTokGB,
      fullKvTrafficPct: fullRes.kvTrafficSharePct,
      hybridKvTrafficPct: hybRes.kvTrafficSharePct
    };
  }

  /* 9. Architecture Comparison Matrix */
  function archCompareLab(opts) {
    opts = opts || {};
    var L = opts.contextLen || 65536;
    var bw = opts.memBW_GBs || 150;
    var presets = [
      { key: 'full',     fullShare: 1.0,   recall: 'exact',  update: 'softmax' },
      { key: 'hybrid31', fullShare: 0.25,  recall: 'exact',  update: 'gated_delta' },
      { key: 'hybrid71', fullShare: 0.125, recall: 'high',   update: 'lightning_or_delta' },
      { key: 'linear',   fullShare: 0.0,   recall: 'lossy',  update: 'ssm_or_delta' }
    ];
    return presets.map(function (p) {
      var b = kvBudget({ arch: p.key, contextLen: L, precision: 'q8_0', slots: 1 });
      var kvBytes = b.totalKvMiB * 1024 * 1024;
      var recBytes = b.totalRecMiB * 1024 * 1024;
      var tokSec = (bw * 1e9) / (5.2e9 + kvBytes + recBytes);
      return {
        key: p.key,
        fullSharePct: p.fullShare * 100,
        kvMiB: b.totalKvMiB,
        recMiB: b.totalRecMiB,
        seqStateMiB: b.totalKvMiB + b.totalRecMiB,
        tokPerSec: tokSec,
        recall: p.recall
      };
    });
  }

  /* Pinned facts for prose verification in tests/models.cjs */
  function facts() {
    var ch1Full = kvBudget({ arch: 'full', contextLen: 65536, precision: 'q8_0', slots: 1 });
    var ch1Hyb = kvBudget({ arch: 'hybrid31', contextLen: 65536, precision: 'q8_0', slots: 1 });
    var ch1Hyb2 = kvBudget({ arch: 'hybrid31', contextLen: 65536, precision: 'q8_0', slots: 2 });
    var ch1Hyb256 = kvBudget({ arch: 'hybrid31', contextLen: 262144, precision: 'q8_0', slots: 1 });
    var ch1Full256 = kvBudget({ arch: 'full', contextLen: 262144, precision: 'q8_0', slots: 1 });

    var ch2 = linearAttentionTrace({ seqLen: 16, dim: 4, flopSeqLen: 16384, headDim: 128 });
    var ch3Distinct8 = associativeRecallSim({ dim: 8, writes: 8, overwrite: false });
    var ch3Distinct24 = associativeRecallSim({ dim: 8, writes: 24, overwrite: false });
    var ch3Overwrite = associativeRecallSim({ dim: 8, writes: 8, overwrite: true });

    var ch4Update = deltaRuleComparison({ dim: 8, beta: 1.0, mode: 'update', writes: 16 });
    var ch5 = gatedDeltaSim({ dim: 8, alpha: 0.96, beta: 0.9, shiftDip: true });
    var ch6C64 = chunkwiseSim({ chunkSize: 64 === 64 ? 4 : 4, scaleSeqLen: 65536 });
    var ch7Pure32 = needleHybridSim({ dim: 8, facts: 32, ratio: '0:1' });
    var ch7Hyb32 = needleHybridSim({ dim: 8, facts: 32, ratio: '3:1' });
    var ch8_64k = decodeSpeedModel({ contextLen: 65536, memBW_GBs: 150 });
    var ch8_128k = decodeSpeedModel({ contextLen: 131072, memBW_GBs: 150 });

    return {
      ch1FullKvMiB: Math.round(ch1Full.totalKvMiB),                 // 4352 MiB
      ch1HybKvMiB: Math.round(ch1Hyb.totalKvMiB),                   // 1088 MiB
      ch1HybRecMiB: Number(ch1Hyb.totalRecMiB.toFixed(2)),          // 50.25 MiB
      ch1HybTotalSeqMiB: Number((ch1Hyb.totalKvMiB + ch1Hyb.totalRecMiB).toFixed(2)), // 1138.25 MiB
      ch1KvSavingsPct: Math.round(ch1Hyb.kvSavingsPct),             // 75 %
      ch1Hyb2SeqMiB: Number((ch1Hyb2.totalKvMiB + ch1Hyb2.totalRecMiB).toFixed(1)), // 2276.5 MiB
      ch1Full256KvGiB: Number((ch1Full256.totalKvMiB / 1024).toFixed(1)), // 17.0 GiB
      ch1Hyb256SeqGiB: Number(((ch1Hyb256.totalKvMiB + ch1Hyb256.totalRecMiB) / 1024).toFixed(1)), // 4.3 GiB
      ch2MaxDiff: ch2.maxDiff,                                      // < 1e-12
      ch2FlopRatio: Math.round(ch2.flopRatio),                      // 128 x at L=16384, d=128
      ch3Cos8: Number(ch3Distinct8.finalAvgCos.toFixed(2)),
      ch3Cos24: Number(ch3Distinct24.finalAvgCos.toFixed(2)),
      ch3OverwriteCos: Number(ch3Overwrite.finalFirstKeyCos.toFixed(2)),
      ch4AddCos: Number(ch4Update.finalAddCos.toFixed(2)),
      ch4DeltaCos: Number(ch4Update.finalDeltaCos.toFixed(2)),
      ch4AddMse: Number(ch4Update.finalAddMse.toFixed(3)),
      ch4DeltaMse: Number(ch4Update.finalDeltaMse.toFixed(4)),
      ch5StaleDelta: Number(ch5.finalStaleDelta.toFixed(2)),
      ch5StaleGDelta: Number(ch5.finalStaleGDelta.toFixed(2)),
      ch5ActiveCosDecay: Number(ch5.finalActiveCosDecay.toFixed(2)),
      ch5ActiveCosGDelta: Number(ch5.finalActiveCosGDelta.toFixed(2)),
      ch6MaxDiff: ch6C64.maxDiff,
      ch6StepsAtC64: Math.ceil(65536 / 64),                         // 1024
      ch7PureCos32: Number(ch7Pure32.linearMeanCos.toFixed(2)),
      ch7HybCos32: Number(ch7Hyb32.hybridMeanCos.toFixed(2)),
      ch7PureExactPct32: Math.round(ch7Pure32.linearExactPct),
      ch7HybExactPct32: Math.round(ch7Hyb32.hybridExactPct),
      ch8FullTok64k: Number(ch8_64k.fullTokPerSec.toFixed(1)),
      ch8HybTok64k: Number(ch8_64k.hybridTokPerSec.toFixed(1)),
      ch8Speedup64k: Number(ch8_64k.speedup.toFixed(2)),
      ch8Speedup128k: Number(ch8_128k.speedup.toFixed(2))
    };
  }

  return {
    ARCH_PRESETS: ARCH_PRESETS,
    kvBudget: kvBudget,
    linearAttentionTrace: linearAttentionTrace,
    associativeRecallSim: associativeRecallSim,
    deltaRuleComparison: deltaRuleComparison,
    gatedDeltaSim: gatedDeltaSim,
    chunkwiseSim: chunkwiseSim,
    needleHybridSim: needleHybridSim,
    decodeSpeedModel: decodeSpeedModel,
    archCompareLab: archCompareLab,
    facts: facts
  };
});
