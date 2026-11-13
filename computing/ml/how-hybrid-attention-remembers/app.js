(function () {
  'use strict';

  var M = window.HybridAttentionModels;
  var FACTS = M.facts();
  var REDUCE = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var C = {
    bg: '#0f1219',
    grid: '#232a3a',
    axis: '#4b556b',
    ink: '#ebe8e0',
    mute: '#a7aebb',
    gold: '#e9b949',
    cyan: '#63c7e6',
    red: '#f27a6c',
    green: '#7ad6a0',
    violet: '#b39dfb'
  };

  function getLang() {
    try {
      var s = localStorage.getItem('knowledge-lang');
      if (s === 'zh' || s === 'en') return s;
    } catch (e) {}
    return (navigator.language || '').toLowerCase().indexOf('zh') === 0 ? 'zh' : 'en';
  }

  function setLangStorage(l) {
    try { localStorage.setItem('knowledge-lang', l); } catch (e) {}
  }

  var lang = getLang();

  function dict() {
    return lang === 'en' && window.COPY_EN ? window.COPY_EN : window.COPY_ZH;
  }

  function getKey(obj, path) {
    var parts = path.split('.');
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }

  function fmtNum(v) {
    if (typeof v === 'number') {
      if (Math.abs(v) > 0 && Math.abs(v) < 1e-6) return v.toExponential(2);
      if (Number.isInteger(v)) return v.toLocaleString('en-US');
      return String(v);
    }
    return String(v);
  }

  function fillVars(str, extra) {
    return String(str).replace(/\{(\w+)\}/g, function (_, k) {
      if (extra && extra[k] !== undefined) return extra[k];
      if (FACTS[k] !== undefined) return fmtNum(FACTS[k]);
      return '{' + k + '}';
    });
  }

  function t(key, extra) {
    var val = getKey(dict(), key);
    if (val === undefined) val = getKey(window.COPY_ZH, key);
    if (val === undefined) return key;
    return fillVars(val, extra);
  }

  function fitCanvas(cv) {
    var rect = cv.getBoundingClientRect();
    var w = Math.max(240, Math.round(rect.width));
    var h = Math.max(160, Math.round(rect.height));
    var dpr = Math.min(window.devicePixelRatio || 1, 3);
    var tw = Math.round(w * dpr);
    var th = Math.round(h * dpr);
    if (cv.width !== tw || cv.height !== th) {
      cv.width = tw;
      cv.height = th;
    }
    var ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, w: w, h: h };
  }

  function fmtCtx(L) {
    return L >= 1024 ? Math.round(L / 1024) + 'K' : String(L);
  }

  function fmtMiB(mib) {
    if (mib >= 1024) return (mib / 1024).toFixed(2) + ' GiB';
    return Math.round(mib) + ' MiB';
  }

  function fmtFlops(f) {
    if (f >= 1e12) return (f / 1e12).toFixed(2) + ' T';
    if (f >= 1e9) return (f / 1e9).toFixed(2) + ' G';
    if (f >= 1e6) return (f / 1e6).toFixed(1) + ' M';
    return Math.round(f).toLocaleString('en-US');
  }

  /* State for all 9 interactive labs */
  var state = {
    c1: { arch: 'hybrid31', prec: 'q8_0', ctxPow: 6, slots: 1 }, // 2^6 * 1024 = 64K
    c2: { step: 8, flopLen: 16384, playing: false, timer: null },
    c3: { dim: 8, writes: 16, overwrite: false },
    c4: { mode: 'update', beta: 1.0 },
    c5: { alpha: 0.96, beta: 0.90, dip: true },
    c6: { chunk: 4, decay: 0.92 },
    c7: { ratio: '3:1', facts: 32 },
    c8: { ctxPow: 6, bw: 150 },
    c9: { ctx: 65536 }
  };

  /* Visibility gating */
  var visibleMap = {};
  var dirtyMap = {};

  function drawPanel(id) {
    if (!visibleMap[id]) {
      dirtyMap[id] = true;
      return;
    }
    dirtyMap[id] = false;
    drawFns[id]();
  }

  function updateAllReadouts() {
    updateC1Readouts();
    updateC2Readouts();
    updateC3Readouts();
    updateC4Readouts();
    updateC5Readouts();
    updateC6Readouts();
    updateC7Readouts();
    updateC8Readouts();
    updateC9Table();
  }

  /* ---- Ch1: Memory Budget ---- */
  function ctxFromPow(p) {
    return Math.pow(2, p) * 1024;
  }

  function updateC1Readouts() {
    var L = ctxFromPow(state.c1.ctxPow);
    var res = M.kvBudget({ arch: state.c1.arch, contextLen: L, precision: state.c1.prec, slots: state.c1.slots });
    document.getElementById('c1CtxOut').textContent = fmtCtx(L);
    document.getElementById('c1SlotsOut').textContent = String(state.c1.slots);
    document.getElementById('c1KvVal').textContent = fmtMiB(res.totalKvMiB);
    document.getElementById('c1RecVal').textContent = res.totalRecMiB.toFixed(res.totalRecMiB > 0 ? 1 : 0) + ' MiB';
    document.getElementById('c1SysVal').textContent = (res.systemTotalMiB / 1024).toFixed(2) + ' GiB';
    document.getElementById('c1SaveVal').textContent = Math.round(res.kvSavingsPct) + ' %';

    var ramState = res.exceedsRam
      ? t('ch1.sayWarn', { over: ((res.systemTotalMiB - res.ramLimitMiB) / 1024).toFixed(2) + ' GiB' })
      : t('ch1.sayOk', { headroom: (res.headroomMiB / 1024).toFixed(2) + ' GiB' });

    document.getElementById('c1Say').innerHTML = t('ch1.say', {
      archName: t('archNames.' + state.c1.arch),
      prec: state.c1.prec.toUpperCase(),
      ctx: fmtCtx(L),
      slots: state.c1.slots,
      kv: fmtMiB(res.totalKvMiB),
      rec: res.totalRecMiB.toFixed(1) + ' MiB',
      sys: (res.systemTotalMiB / 1024).toFixed(2) + ' GiB',
      ramState: ramState
    });
  }

  function drawC1() {
    var cv = document.getElementById('c1Cv');
    var g = fitCanvas(cv), ctx = g.ctx, w = g.w, h = g.h;
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, w, h);

    var L = ctxFromPow(state.c1.ctxPow);
    var keys = ['full', 'hybrid31', 'hybrid71', 'linear'];
    var items = keys.map(function (k) {
      return M.kvBudget({ arch: k, contextLen: L, precision: state.c1.prec, slots: state.c1.slots });
    });

    var maxGiB = Math.max(28, Math.ceil(Math.max.apply(null, items.map(function (it) { return it.systemTotalMiB / 1024; })) / 4) * 4);
    var padL = 48, padR = 18, padT = 26, padB = 38;
    var pw = w - padL - padR, ph = h - padT - padB;

    // Grid & Y ticks
    ctx.font = '11px ' + getComputedStyle(document.body).fontFamily;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    var ticks = 4;
    for (var i = 0; i <= ticks; i++) {
      var val = (maxGiB * i) / ticks;
      var y = padT + ph - (ph * i) / ticks;
      ctx.strokeStyle = C.grid;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(w - padR, y);
      ctx.stroke();
      ctx.fillStyle = C.mute;
      ctx.fillText(Math.round(val) + 'G', padL - 6, y);
    }

    // Bars
    var slotW = pw / keys.length;
    var barW = Math.min(72, slotW * 0.56);
    var shortNames = {
      full: t('cv.archFullShort'),
      hybrid31: t('cv.archH31Short'),
      hybrid71: t('cv.archH71Short'),
      linear: t('cv.archLinShort')
    };

    items.forEach(function (it, idx) {
      var cx = padL + slotW * (idx + 0.5);
      var x = cx - barW / 2;
      var baseGiB = (it.systemTotalMiB - it.totalKvMiB - it.totalRecMiB) / 1024;
      var recGiB = it.totalRecMiB / 1024;
      var kvGiB = it.totalKvMiB / 1024;

      var hBase = (baseGiB / maxGiB) * ph;
      var hRec = (recGiB / maxGiB) * ph;
      var hKv = (kvGiB / maxGiB) * ph;
      var y0 = padT + ph;

      // Base (weights + OS)
      ctx.fillStyle = '#334057';
      ctx.fillRect(x, y0 - hBase, barW, hBase);

      // Recurrent state
      if (hRec > 0.5) {
        ctx.fillStyle = C.green;
        ctx.fillRect(x, y0 - hBase - hRec, barW, Math.max(2, hRec));
      }

      // KV cache
      if (hKv > 0.5) {
        ctx.fillStyle = it.arch === state.c1.arch ? C.gold : C.cyan;
        ctx.fillRect(x, y0 - hBase - hRec - hKv, barW, hKv);
      }

      // Selected outline
      if (it.arch === state.c1.arch) {
        ctx.strokeStyle = C.gold;
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 1, y0 - hBase - hRec - hKv - 1, barW + 2, hBase + hRec + hKv + 2);
      }

      // Total label above bar
      var topY = y0 - hBase - hRec - hKv - 8;
      ctx.fillStyle = it.exceedsRam ? C.red : C.ink;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText((it.systemTotalMiB / 1024).toFixed(1) + 'G', cx, Math.max(padT + 10, topY));

      // X-axis label
      ctx.fillStyle = it.arch === state.c1.arch ? C.gold : C.mute;
      ctx.textBaseline = 'top';
      ctx.fillText(shortNames[it.arch], cx, y0 + 10);
    });

    // 24 GB red line
    var y24 = padT + ph - (24 / maxGiB) * ph;
    ctx.save();
    ctx.strokeStyle = C.red;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(padL, y24);
    ctx.lineTo(w - padR, y24);
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = C.red;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(t('cv.ramCeiling'), w - padR - 4, y24 - 4);
  }

  /* ---- Ch2: Linear Attention Equivalence & FLOPs ---- */
  var ch2Data = M.linearAttentionTrace({ seqLen: 16, dim: 4, flopSeqLen: 16384, headDim: 128 });

  function updateC2Readouts() {
    var d = M.linearAttentionTrace({ seqLen: 16, dim: 4, flopSeqLen: state.c2.flopLen, headDim: 128 });
    document.getElementById('c2StepOut').textContent = state.c2.step + ' / 16';
    document.getElementById('c2FlopLenOut').textContent = fmtCtx(state.c2.flopLen);
    document.getElementById('c2DiffVal').textContent = d.maxDiff.toExponential(2);
    document.getElementById('c2QuadVal').textContent = fmtFlops(d.quadFlops);
    document.getElementById('c2LinVal').textContent = fmtFlops(d.linearFlops);
    document.getElementById('c2RatioVal').textContent = Math.round(d.flopRatio) + '×';
    document.getElementById('c2Say').innerHTML = t('ch2.say', {
      t: state.c2.step,
      diff: d.maxDiff.toExponential(2),
      fLen: d.flopSeqLen.toLocaleString('en-US'),
      ratio: Math.round(d.flopRatio)
    });
  }

  function drawC2() {
    var cv = document.getElementById('c2Cv');
    var g = fitCanvas(cv), ctx = g.ctx, w = g.w, h = g.h;
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, w, h);

    var split = w > 560;
    var leftW = split ? Math.round(w * 0.44) : w;
    var leftH = split ? h : Math.round(h * 0.54);
    var stepIdx = Math.max(0, Math.min(15, Math.round(state.c2.step) - 1));
    var S = ch2Data.states[stepIdx];

    // Left: 4x4 State Matrix Heatmap
    ctx.font = '12px ' + getComputedStyle(document.body).fontFamily;
    ctx.fillStyle = C.ink;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(t('cv.stateMatrix') + ' (t=' + (stepIdx + 1) + ')', leftW / 2, 10);

    var maxAbs = 0.01;
    for (var r = 0; r < 4; r++) {
      for (var c = 0; c < 4; c++) {
        if (Math.abs(S[r][c]) > maxAbs) maxAbs = Math.abs(S[r][c]);
      }
    }
    var gridSize = Math.min(leftW - 40, leftH - 46, 210);
    var cell = gridSize / 4;
    var gx = (leftW - gridSize) / 2;
    var gy = 32;

    for (var r2 = 0; r2 < 4; r2++) {
      for (var c2 = 0; c2 < 4; c2++) {
        var val = S[r2][c2];
        var alpha = Math.min(0.92, Math.abs(val) / maxAbs);
        ctx.fillStyle = val >= 0
          ? 'rgba(99, 199, 230, ' + (0.12 + 0.78 * alpha).toFixed(2) + ')'
          : 'rgba(242, 122, 108, ' + (0.12 + 0.78 * alpha).toFixed(2) + ')';
        ctx.fillRect(gx + c2 * cell + 2, gy + r2 * cell + 2, cell - 4, cell - 4);
        ctx.fillStyle = C.ink;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = (cell < 36 ? '10px' : '11px') + ' ui-monospace, Menlo, monospace';
        ctx.fillText(val.toFixed(1), gx + (c2 + 0.5) * cell, gy + (r2 + 0.5) * cell);
      }
    }

    // Right: Log FLOPs curve O(L^2 d) vs O(L d^2)
    var rx0 = split ? leftW + 46 : 52;
    var rx1 = w - 20;
    var ry0 = split ? 36 : leftH + 28;
    var ry1 = h - 34;
    var rw = rx1 - rx0, rh = ry1 - ry0;

    ctx.font = '12px ' + getComputedStyle(document.body).fontFamily;
    ctx.fillStyle = C.ink;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(t('cv.flopsTitle'), (rx0 + rx1) / 2, split ? 12 : leftH + 6);

    var minLog = 7, maxLog = 14.2; // 10^7 to 10^14.2
    var minL = 512, maxL = 65536;
    function xOfL(Lval) {
      return rx0 + ((Math.log2(Lval) - Math.log2(minL)) / (Math.log2(maxL) - Math.log2(minL))) * rw;
    }
    function yOfFlop(f) {
      var lg = Math.log10(Math.max(1e7, f));
      return ry1 - ((lg - minLog) / (maxLog - minLog)) * rh;
    }

    for (var p = 8; p <= 14; p += 2) {
      var yy = ry1 - ((p - minLog) / (maxLog - minLog)) * rh;
      ctx.strokeStyle = C.grid;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(rx0, yy); ctx.lineTo(rx1, yy); ctx.stroke();
      ctx.fillStyle = C.mute;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText('1e' + p, rx0 - 6, yy);
    }

    [512, 4096, 16384, 65536].forEach(function (Lv) {
      var xx = xOfL(Lv);
      ctx.fillStyle = C.mute;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(fmtCtx(Lv), xx, ry1 + 8);
    });

    // Draw curves
    function strokeCurve(color, fn) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (var i = 0; i <= 32; i++) {
        var Lv = minL * Math.pow(maxL / minL, i / 32);
        var px = xOfL(Lv), py = yOfFlop(fn(Lv));
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    strokeCurve(C.red, function (Lv) { return 2 * Lv * Lv * 128; });
    strokeCurve(C.cyan, function (Lv) { return 2 * Lv * 128 * 128; });

    // Current L marker
    var curX = xOfL(state.c2.flopLen);
    var qY = yOfFlop(2 * state.c2.flopLen * state.c2.flopLen * 128);
    var lY = yOfFlop(2 * state.c2.flopLen * 128 * 128);
    ctx.strokeStyle = C.gold;
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(curX, qY); ctx.lineTo(curX, lY); ctx.stroke();
    ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(curX, qY, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.arc(curX, lY, 4.5, 0, Math.PI * 2); ctx.fill();

    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = C.red;
    ctx.fillText(t('cv.quad'), rx0 + 6, ry0 + 6);
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = C.cyan;
    ctx.fillText(t('cv.lin'), rx1 - 6, ry1 - 6);
  }

  /* ---- Ch3: Fast Weight Capacity ---- */
  function updateC3Readouts() {
    var d = M.associativeRecallSim({ dim: state.c3.dim, writes: state.c3.writes, overwrite: state.c3.overwrite });
    document.getElementById('c3WritesOut').textContent = String(state.c3.writes);
    document.getElementById('c3LoadVal').textContent = (state.c3.writes / state.c3.dim).toFixed(2) + '×';
    document.getElementById('c3CosVal').textContent = d.finalAvgCos.toFixed(2);
    document.getElementById('c3Key0Val').textContent = d.finalFirstKeyCos.toFixed(2);
    document.getElementById('c3MseVal').textContent = d.finalAvgMse.toFixed(3);
    document.getElementById('c3Say').innerHTML = t('ch3.say', {
      dim: state.c3.dim,
      writes: state.c3.writes,
      load: (state.c3.writes / state.c3.dim).toFixed(2) + '×',
      overMode: state.c3.overwrite ? t('ch3.sayOver') : t('ch3.sayDist'),
      cos: d.finalAvgCos.toFixed(2),
      k0: d.finalFirstKeyCos.toFixed(2)
    });
  }

  function drawC3() {
    var cv = document.getElementById('c3Cv');
    var g = fitCanvas(cv), ctx = g.ctx, w = g.w, h = g.h;
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, w, h);

    var d = M.associativeRecallSim({ dim: state.c3.dim, writes: state.c3.writes, overwrite: state.c3.overwrite });
    var padL = 50, padR = 20, padT = 22, padB = 38;
    var pw = w - padL - padR, ph = h - padT - padB;
    var maxW = Math.max(16, state.c3.writes);

    function xOf(s) { return padL + ((s - 1) / Math.max(1, maxW - 1)) * pw; }
    function yOf(v) { return padT + ph - Math.max(0, Math.min(1, v)) * ph; }

    ctx.font = '11px ' + getComputedStyle(document.body).fontFamily;
    for (var tick = 0; tick <= 4; tick++) {
      var val = tick * 0.25;
      var y = yOf(val);
      ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
      ctx.fillStyle = C.mute; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText(val.toFixed(2), padL - 6, y);
    }

    // M = d capacity line
    if (state.c3.dim <= maxW) {
      var cx = xOf(state.c3.dim);
      ctx.save();
      ctx.strokeStyle = C.red; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.moveTo(cx, padT); ctx.lineTo(cx, padT + ph); ctx.stroke();
      ctx.restore();
      ctx.fillStyle = C.red; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(t('cv.capLine') + ' (' + state.c3.dim + ')', Math.min(w - padR - 64, cx + 6), padT + 4);
    }

    // Curves
    function plotKey(prop, color) {
      ctx.strokeStyle = color; ctx.lineWidth = 2.5;
      ctx.beginPath();
      d.history.forEach(function (pt, idx) {
        var px = xOf(pt.step), py = yOf(pt[prop]);
        if (idx === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.stroke();
    }
    plotKey('firstKeyCos', C.gold);
    plotKey('avgCos', C.cyan);

    ctx.fillStyle = C.mute; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(t('cv.writesAxis') + ' (1 .. ' + state.c3.writes + ')', padL + pw / 2, padT + ph + 12);
  }

  /* ---- Ch4: Additive vs Delta Rule ---- */
  function updateC4Readouts() {
    var d = M.deltaRuleComparison({ dim: 8, beta: state.c4.beta, mode: state.c4.mode, writes: 16 });
    document.getElementById('c4BetaOut').textContent = state.c4.beta.toFixed(2);
    document.getElementById('c4DelCosVal').textContent = d.finalDeltaCos.toFixed(2);
    document.getElementById('c4AddCosVal').textContent = d.finalAddCos.toFixed(2);
    document.getElementById('c4DelMseVal').textContent = d.finalDeltaMse.toFixed(4);
    document.getElementById('c4AddMseVal').textContent = d.finalAddMse.toFixed(3);
    document.getElementById('c4Say').innerHTML = t('ch4.say', {
      modeName: state.c4.mode === 'update' ? t('ch4.modeUpd') : t('ch4.modeDist'),
      beta: state.c4.beta.toFixed(2),
      dCos: d.finalDeltaCos.toFixed(2),
      dMse: d.finalDeltaMse.toFixed(4),
      aCos: d.finalAddCos.toFixed(2),
      aMse: d.finalAddMse.toFixed(3)
    });
  }

  function drawC4() {
    var cv = document.getElementById('c4Cv');
    var g = fitCanvas(cv), ctx = g.ctx, w = g.w, h = g.h;
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, w, h);

    var d = M.deltaRuleComparison({ dim: 8, beta: state.c4.beta, mode: state.c4.mode, writes: 16 });
    var maxMse = Math.max(0.25, Math.max.apply(null, d.trace.map(function (pt) {
      return Math.max(pt.addMse, pt.deltaMse);
    })) * 1.12);

    var padL = 52, padR = 20, padT = 20, padB = 38;
    var pw = w - padL - padR, ph = h - padT - padB;
    function xOf(s) { return padL + ((s - 1) / 15) * pw; }
    function yOf(v) { return padT + ph - (v / maxMse) * ph; }

    ctx.font = '11px ' + getComputedStyle(document.body).fontFamily;
    for (var i = 0; i <= 4; i++) {
      var val = (maxMse * i) / 4;
      var y = yOf(val);
      ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
      ctx.fillStyle = C.mute; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText(val.toFixed(2), padL - 6, y);
    }

    function plotLine(prop, color) {
      ctx.strokeStyle = color; ctx.lineWidth = 2.5;
      ctx.beginPath();
      d.trace.forEach(function (pt, idx) {
        var px = xOf(pt.step), py = yOf(pt[prop]);
        if (idx === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.stroke();
    }
    plotLine('addMse', C.red);
    plotLine('deltaMse', C.green);

    ctx.fillStyle = C.mute; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(t('cv.stepAxis') + ' (1 .. 16) · ' + t('cv.mseAxis'), padL + pw / 2, padT + ph + 12);
  }

  /* ---- Ch5: Gated DeltaNet ---- */
  function updateC5Readouts() {
    var d = M.gatedDeltaSim({ dim: 8, alpha: state.c5.alpha, beta: state.c5.beta, shiftDip: state.c5.dip });
    document.getElementById('c5AlphaOut').textContent = state.c5.alpha.toFixed(2);
    document.getElementById('c5BetaOut').textContent = state.c5.beta.toFixed(2);
    document.getElementById('c5GDAVal').textContent = d.finalActiveCosGDelta.toFixed(2);
    document.getElementById('c5DecAVal').textContent = d.finalActiveCosDecay.toFixed(2);
    document.getElementById('c5GDSVal').textContent = d.finalStaleGDelta.toFixed(2);
    document.getElementById('c5DelSVal').textContent = d.finalStaleDelta.toFixed(2);
    document.getElementById('c5Say').innerHTML = t('ch5.say', {
      gda: d.finalActiveCosGDelta.toFixed(2),
      gds: d.finalStaleGDelta.toFixed(2),
      dls: d.finalStaleDelta.toFixed(2),
      dca: d.finalActiveCosDecay.toFixed(2)
    });
  }

  function drawC5() {
    var cv = document.getElementById('c5Cv');
    var g = fitCanvas(cv), ctx = g.ctx, w = g.w, h = g.h;
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, w, h);

    var d = M.gatedDeltaSim({ dim: 8, alpha: state.c5.alpha, beta: state.c5.beta, shiftDip: state.c5.dip });
    var padL = 50, padR = 20, padT = 26, padB = 38;
    var pw = w - padL - padR, ph = h - padT - padB;
    function xOf(step) { return padL + ((step - 1) / 23) * pw; }
    function yOf(v) { return padT + ph - Math.max(0, Math.min(1.05, v)) * ph; }

    ctx.font = '11px ' + getComputedStyle(document.body).fontFamily;
    for (var i = 0; i <= 4; i++) {
      var val = i * 0.25;
      var y = yOf(val);
      ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
      ctx.fillStyle = C.mute; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText(val.toFixed(2), padL - 6, y);
    }

    // Topic shift line at t=13
    var sx = xOf(13);
    ctx.save();
    ctx.strokeStyle = C.gold; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(sx, padT); ctx.lineTo(sx, padT + ph); ctx.stroke();
    ctx.restore();
    ctx.fillStyle = C.gold; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
    ctx.fillText(t('cv.topicShift') + ' (t=13)', sx + 6, padT + ph - 6);

    function plot(prop, color, dashed) {
      ctx.save();
      ctx.strokeStyle = color; ctx.lineWidth = dashed ? 1.8 : 2.5;
      if (dashed) ctx.setLineDash([4, 4]);
      ctx.beginPath();
      d.steps.forEach(function (st, idx) {
        var px = xOf(st.t), py = yOf(st[prop]);
        if (idx === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.restore();
    }

    plot('activeCosDecay', C.red, false);
    plot('activeCosDelta', C.cyan, false);
    plot('activeCosGDelta', C.green, false);

    ctx.fillStyle = C.mute; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(t('cv.activeAcc') + ' (t = 1 .. 24)', padL + pw / 2, padT + ph + 12);
  }

  /* ---- Ch6: Chunkwise Parallelism ---- */
  function updateC6Readouts() {
    var d = M.chunkwiseSim({ chunkSize: state.c6.chunk, decay: state.c6.decay, scaleSeqLen: 65536 });
    document.getElementById('c6DecayOut').textContent = state.c6.decay.toFixed(2);
    document.getElementById('c6DiffVal').textContent = d.maxDiff.toExponential(2);
    document.getElementById('c6StepsVal').textContent = d.serialSteps.toLocaleString('en-US');
    document.getElementById('c6RedVal').textContent = d.stepReduction + '×';
    document.getElementById('c6MatVal').textContent = Math.round(d.matmulSharePct) + ' %';
    document.getElementById('c6Say').innerHTML = t('ch6.say', {
      c: state.c6.chunk,
      diff: d.maxDiff.toExponential(2),
      steps: d.serialSteps.toLocaleString('en-US'),
      red: d.stepReduction
    });
  }

  function drawC6() {
    var cv = document.getElementById('c6Cv');
    var g = fitCanvas(cv), ctx = g.ctx, w = g.w, h = g.h;
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, w, h);

    var chunks = [1, 2, 4, 8, 16];
    var padL = 56, padR = 20, padT = 26, padB = 38;
    var pw = w - padL - padR, ph = h - padT - padB;
    var maxSteps = 65536;

    ctx.font = '11px ' + getComputedStyle(document.body).fontFamily;
    for (var i = 0; i <= 4; i++) {
      var val = (maxSteps * i) / 4;
      var y = padT + ph - (ph * i) / 4;
      ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
      ctx.fillStyle = C.mute; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText(val === 0 ? '0' : Math.round(val / 1024) + 'K', padL - 6, y);
    }

    var slotW = pw / chunks.length;
    var barW = Math.min(64, slotW * 0.56);
    chunks.forEach(function (cVal, idx) {
      var res = M.chunkwiseSim({ chunkSize: cVal, decay: state.c6.decay, scaleSeqLen: 65536 });
      var cx = padL + slotW * (idx + 0.5);
      var x = cx - barW / 2;
      var bh = Math.max(4, (res.serialSteps / maxSteps) * ph);
      var yTop = padT + ph - bh;

      ctx.fillStyle = cVal === state.c6.chunk ? C.gold : C.cyan;
      ctx.fillRect(x, yTop, barW, bh);

      ctx.fillStyle = cVal === state.c6.chunk ? C.gold : C.ink;
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText(res.serialSteps.toLocaleString('en-US'), cx, yTop - 4);

      ctx.fillStyle = cVal === state.c6.chunk ? C.gold : C.mute;
      ctx.textBaseline = 'top';
      ctx.fillText('C = ' + cVal, cx, padT + ph + 10);
    });

    ctx.fillStyle = C.mute; ctx.textAlign = 'right'; ctx.textBaseline = 'top';
    ctx.fillText(t('cv.serialSteps'), w - padR, 6);
  }

  /* ---- Ch7: Needle-in-a-Haystack ---- */
  function updateC7Readouts() {
    var d = M.needleHybridSim({ dim: 8, facts: state.c7.facts, ratio: state.c7.ratio });
    document.getElementById('c7FactsOut').textContent = String(state.c7.facts);
    document.getElementById('c7HybAccVal').textContent = Math.round(d.hybridExactPct) + ' %';
    document.getElementById('c7PureAccVal').textContent = Math.round(d.linearExactPct) + ' %';
    document.getElementById('c7SaveVal').textContent = d.kvSavedPct.toFixed(1).replace(/\.0$/, '') + ' %';
    document.getElementById('c7HybCosVal').textContent = d.hybridMeanCos.toFixed(2);
    document.getElementById('c7Say').innerHTML = t('ch7.say', {
      facts: state.c7.facts,
      pureAcc: Math.round(d.linearExactPct) + '%',
      ratio: state.c7.ratio === 'full' ? t('ch7.rFull') : state.c7.ratio,
      hybAcc: Math.round(d.hybridExactPct) + '%',
      save: d.kvSavedPct.toFixed(1).replace(/\.0$/, '') + '%'
    });
  }

  function drawC7() {
    var cv = document.getElementById('c7Cv');
    var g = fitCanvas(cv), ctx = g.ctx, w = g.w, h = g.h;
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, w, h);

    var d = M.needleHybridSim({ dim: 8, facts: state.c7.facts, ratio: state.c7.ratio });
    var padL = 50, padR = 20, padT = 22, padB = 38;
    var pw = w - padL - padR, ph = h - padT - padB;
    function xOf(n) { return padL + ((n - 2) / 38) * pw; }
    function yOf(v) { return padT + ph - Math.max(0, Math.min(1, v)) * ph; }

    ctx.font = '11px ' + getComputedStyle(document.body).fontFamily;
    for (var i = 0; i <= 4; i++) {
      var val = i * 0.25;
      var y = yOf(val);
      ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
      ctx.fillStyle = C.mute; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText(val.toFixed(2), padL - 6, y);
    }

    function plot(prop, color) {
      ctx.strokeStyle = color; ctx.lineWidth = 2.5;
      ctx.beginPath();
      d.curve.forEach(function (pt, idx) {
        var px = xOf(pt.facts), py = yOf(pt[prop]);
        if (idx === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.stroke();
    }
    plot('linearCos', C.red);
    plot('hybridCos', C.gold);

    // Current N marker
    var curX = xOf(state.c7.facts);
    ctx.save();
    ctx.strokeStyle = C.cyan; ctx.lineWidth = 1.2; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(curX, padT); ctx.lineTo(curX, padT + ph); ctx.stroke();
    ctx.restore();
    ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(curX, yOf(d.hybridMeanCos), 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(curX, yOf(d.linearMeanCos), 4.5, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = C.mute; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(t('cv.factsAxis') + ' (2 .. 40)', padL + pw / 2, padT + ph + 12);
  }

  /* ---- Ch8: Roofline Speed ---- */
  function updateC8Readouts() {
    var L = ctxFromPow(state.c8.ctxPow);
    var d = M.decodeSpeedModel({ contextLen: L, memBW_GBs: state.c8.bw });
    document.getElementById('c8CtxOut').textContent = fmtCtx(L);
    document.getElementById('c8BwOut').textContent = state.c8.bw + ' GB/s';
    document.getElementById('c8HybTokVal').textContent = d.hybridTokPerSec.toFixed(1) + ' tok/s';
    document.getElementById('c8FullTokVal').textContent = d.fullTokPerSec.toFixed(1) + ' tok/s';
    document.getElementById('c8SpdVal').textContent = d.speedup.toFixed(2) + '×';
    document.getElementById('c8KvPctVal').textContent = Math.round(d.fullKvTrafficPct) + ' %';
    document.getElementById('c8Say').innerHTML = t('ch8.say', {
      bw: state.c8.bw,
      ctx: fmtCtx(L),
      hybTok: d.hybridTokPerSec.toFixed(1),
      fullTok: d.fullTokPerSec.toFixed(1),
      spd: d.speedup.toFixed(2),
      kvPct: Math.round(d.fullKvTrafficPct) + '%'
    });
  }

  function drawC8() {
    var cv = document.getElementById('c8Cv');
    var g = fitCanvas(cv), ctx = g.ctx, w = g.w, h = g.h;
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, w, h);

    var pows = [2, 3, 4, 5, 6, 7, 8];
    var pts = pows.map(function (p) {
      var L = ctxFromPow(p);
      return M.decodeSpeedModel({ contextLen: L, memBW_GBs: state.c8.bw });
    });
    var maxTok = Math.ceil(Math.max.apply(null, pts.map(function (p) { return p.hybridTokPerSec; })) / 10) * 10;

    var padL = 50, padR = 20, padT = 22, padB = 38;
    var pw = w - padL - padR, ph = h - padT - padB;
    function xOf(idx) { return padL + (idx / (pows.length - 1)) * pw; }
    function yOf(v) { return padT + ph - (v / maxTok) * ph; }

    ctx.font = '11px ' + getComputedStyle(document.body).fontFamily;
    for (var i = 0; i <= 4; i++) {
      var val = (maxTok * i) / 4;
      var y = yOf(val);
      ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
      ctx.fillStyle = C.mute; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText(Math.round(val), padL - 6, y);
    }

    pows.forEach(function (p, idx) {
      ctx.fillStyle = p === state.c8.ctxPow ? C.gold : C.mute;
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(fmtCtx(ctxFromPow(p)), xOf(idx), padT + ph + 10);
    });

    function plot(prop, color) {
      ctx.strokeStyle = color; ctx.lineWidth = 2.5;
      ctx.beginPath();
      pts.forEach(function (pt, idx) {
        var px = xOf(idx), py = yOf(pt[prop]);
        if (idx === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.stroke();
    }
    plot('fullTokPerSec', C.cyan);
    plot('hybridTokPerSec', C.gold);

    var curIdx = pows.indexOf(state.c8.ctxPow);
    if (curIdx >= 0) {
      var cx = xOf(curIdx);
      ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(cx, yOf(pts[curIdx].hybridTokPerSec), 4.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.arc(cx, yOf(pts[curIdx].fullTokPerSec), 4.5, 0, Math.PI * 2); ctx.fill();
    }

    ctx.fillStyle = C.mute; ctx.textAlign = 'right'; ctx.textBaseline = 'top';
    ctx.fillText(t('cv.tokSec'), w - padR, 4);
  }

  /* ---- Ch9: Comparison Table ---- */
  function updateC9Table() {
    var rows = M.archCompareLab({ contextLen: state.c9.ctx, memBW_GBs: 150 });
    var tbody = document.getElementById('c9Body');
    tbody.innerHTML = '';
    var hybRec = '50.3 MiB';
    rows.forEach(function (r) {
      if (r.key === 'hybrid31') hybRec = r.recMiB.toFixed(1) + ' MiB';
      var tr = document.createElement('tr');
      if (r.key === 'hybrid31') tr.className = 'pick';
      tr.innerHTML =
        '<td>' + t('archNames.' + r.key) + '</td>' +
        '<td class="numc">' + fmtMiB(r.kvMiB) + '</td>' +
        '<td class="numc">' + (r.recMiB > 0 ? r.recMiB.toFixed(1) + ' MiB' : '0 MiB') + '</td>' +
        '<td class="numc">' + fmtMiB(r.seqStateMiB) + '</td>' +
        '<td class="numc">' + r.tokPerSec.toFixed(1) + ' tok/s</td>' +
        '<td>' + t('recallTags.' + r.recall) + '</td>';
      tbody.appendChild(tr);
    });
    document.getElementById('c9Say').innerHTML = t('ch9.say', {
      ctx: fmtCtx(state.c9.ctx),
      rec: hybRec
    });
  }

  var drawFns = {
    c1Cv: drawC1,
    c2Cv: drawC2,
    c3Cv: drawC3,
    c4Cv: drawC4,
    c5Cv: drawC5,
    c6Cv: drawC6,
    c7Cv: drawC7,
    c8Cv: drawC8
  };

  /* Apply Language */
  function applyLang(newLang) {
    lang = newLang;
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.title = t('meta.title');

    var btns = document.querySelectorAll('#langToggle button');
    for (var i = 0; i < btns.length; i++) {
      btns[i].setAttribute('aria-pressed', btns[i].dataset.lang === lang ? 'true' : 'false');
    }

    var textNodes = document.querySelectorAll('[data-i18n]');
    for (var j = 0; j < textNodes.length; j++) {
      textNodes[j].textContent = t(textNodes[j].dataset.i18n);
    }

    var htmlNodes = document.querySelectorAll('[data-i18n-html]');
    for (var k = 0; k < htmlNodes.length; k++) {
      htmlNodes[k].innerHTML = t(htmlNodes[k].dataset.i18nHtml);
    }

    var attrNodes = document.querySelectorAll('[data-i18n-attr]');
    for (var m = 0; m < attrNodes.length; m++) {
      var pairs = attrNodes[m].dataset.i18nAttr.split(',');
      for (var p = 0; p < pairs.length; p++) {
        var sp = pairs[p].split(':');
        if (sp.length === 2) attrNodes[m].setAttribute(sp[0].trim(), t(sp[1].trim()));
      }
    }

    updateAllReadouts();
    Object.keys(drawFns).forEach(function (id) {
      drawPanel(id);
    });
  }

  /* Wire controls */
  function bindSeg(containerId, attr, onPick) {
    var el = document.getElementById(containerId);
    el.addEventListener('click', function (ev) {
      var btn = ev.target.closest('button');
      if (!btn || !btn.dataset[attr]) return;
      var all = el.querySelectorAll('button');
      for (var i = 0; i < all.length; i++) all[i].classList.remove('on');
      btn.classList.add('on');
      onPick(btn.dataset[attr]);
    });
  }

  bindSeg('c1Arch', 'arch', function (v) { state.c1.arch = v; updateC1Readouts(); drawPanel('c1Cv'); });
  bindSeg('c1Prec', 'prec', function (v) { state.c1.prec = v; updateC1Readouts(); drawPanel('c1Cv'); });
  document.getElementById('c1Ctx').addEventListener('input', function (e) {
    state.c1.ctxPow = Math.round(Number(e.target.value)); updateC1Readouts(); drawPanel('c1Cv');
  });
  document.getElementById('c1Slots').addEventListener('input', function (e) {
    state.c1.slots = Math.round(Number(e.target.value)); updateC1Readouts(); drawPanel('c1Cv');
  });

  function stopC2Play() {
    if (state.c2.timer) { clearInterval(state.c2.timer); state.c2.timer = null; }
    state.c2.playing = false;
    document.getElementById('c2Play').setAttribute('aria-pressed', 'false');
  }

  document.getElementById('c2Step').addEventListener('input', function (e) {
    stopC2Play();
    state.c2.step = Math.round(Number(e.target.value)); updateC2Readouts(); drawPanel('c2Cv');
  });
  document.getElementById('c2FlopLen').addEventListener('input', function (e) {
    state.c2.flopLen = Math.round(Number(e.target.value)); updateC2Readouts(); drawPanel('c2Cv');
  });
  document.getElementById('c2Play').addEventListener('click', function () {
    if (REDUCE) {
      state.c2.step = 16;
      document.getElementById('c2Step').value = '16';
      updateC2Readouts(); drawPanel('c2Cv');
      return;
    }
    if (state.c2.playing) { stopC2Play(); return; }
    state.c2.playing = true;
    document.getElementById('c2Play').setAttribute('aria-pressed', 'true');
    state.c2.timer = setInterval(function () {
      if (!visibleMap.c2Cv) { stopC2Play(); return; }
      state.c2.step = state.c2.step >= 16 ? 1 : state.c2.step + 1;
      document.getElementById('c2Step').value = String(state.c2.step);
      updateC2Readouts(); drawPanel('c2Cv');
    }, 320);
  });
  document.getElementById('c2Reset').addEventListener('click', function () {
    stopC2Play();
    state.c2.step = 1;
    state.c2.flopLen = 16384;
    document.getElementById('c2Step').value = '1';
    document.getElementById('c2FlopLen').value = '16384';
    updateC2Readouts(); drawPanel('c2Cv');
  });

  bindSeg('c3Dim', 'dim', function (v) { state.c3.dim = Number(v); updateC3Readouts(); drawPanel('c3Cv'); });
  document.getElementById('c3Writes').addEventListener('input', function (e) {
    state.c3.writes = Number(e.target.value); updateC3Readouts(); drawPanel('c3Cv');
  });
  document.getElementById('c3Over').addEventListener('change', function (e) {
    state.c3.overwrite = !!e.target.checked; updateC3Readouts(); drawPanel('c3Cv');
  });

  bindSeg('c4Mode', 'mode', function (v) { state.c4.mode = v; updateC4Readouts(); drawPanel('c4Cv'); });
  document.getElementById('c4Beta').addEventListener('input', function (e) {
    state.c4.beta = Number(e.target.value); updateC4Readouts(); drawPanel('c4Cv');
  });

  document.getElementById('c5Alpha').addEventListener('input', function (e) {
    state.c5.alpha = Number(e.target.value); updateC5Readouts(); drawPanel('c5Cv');
  });
  document.getElementById('c5Beta').addEventListener('input', function (e) {
    state.c5.beta = Number(e.target.value); updateC5Readouts(); drawPanel('c5Cv');
  });
  document.getElementById('c5Dip').addEventListener('change', function (e) {
    state.c5.dip = !!e.target.checked; updateC5Readouts(); drawPanel('c5Cv');
  });

  bindSeg('c6Chunk', 'chunk', function (v) { state.c6.chunk = Number(v); updateC6Readouts(); drawPanel('c6Cv'); });
  document.getElementById('c6Decay').addEventListener('input', function (e) {
    state.c6.decay = Number(e.target.value); updateC6Readouts(); drawPanel('c6Cv');
  });

  bindSeg('c7Ratio', 'ratio', function (v) { state.c7.ratio = v; updateC7Readouts(); drawPanel('c7Cv'); });
  document.getElementById('c7Facts').addEventListener('input', function (e) {
    state.c7.facts = Number(e.target.value); updateC7Readouts(); drawPanel('c7Cv');
  });

  document.getElementById('c8Ctx').addEventListener('input', function (e) {
    state.c8.ctxPow = Number(e.target.value); updateC8Readouts(); drawPanel('c8Cv');
  });
  document.getElementById('c8Bw').addEventListener('input', function (e) {
    state.c8.bw = Number(e.target.value); updateC8Readouts(); drawPanel('c8Cv');
  });

  bindSeg('c9Ctx', 'ctx', function (v) { state.c9.ctx = Number(v); updateC9Table(); });

  document.getElementById('langToggle').addEventListener('click', function (ev) {
    var btn = ev.target.closest('button[data-lang]');
    if (!btn) return;
    setLangStorage(btn.dataset.lang);
    applyLang(btn.dataset.lang);
  });

  /* IntersectionObserver gating */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var id = en.target.id;
        visibleMap[id] = en.isIntersecting;
        if (en.isIntersecting && dirtyMap[id]) {
          dirtyMap[id] = false;
          drawFns[id]();
        }
      });
    }, { rootMargin: '120px 0px' });
    Object.keys(drawFns).forEach(function (id) {
      dirtyMap[id] = true;
      io.observe(document.getElementById(id));
    });
  } else {
    Object.keys(drawFns).forEach(function (id) { visibleMap[id] = true; });
  }

  window.addEventListener('resize', function () {
    Object.keys(drawFns).forEach(function (id) { drawPanel(id); });
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stopC2Play();
  });

  applyLang(lang);
  window.__essayReady = true;
})();
