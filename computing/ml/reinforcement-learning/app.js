(function () {
  'use strict';

  var M = window.RLModels;
  var COPY = window.ESSAY_COPY || {};

  // =========================================================================
  // LANGUAGE & COPY ENGINE
  // =========================================================================
  var memLang = 'zh';
  function getStoredLang() {
    try {
      var saved = window.localStorage.getItem('knowledge-lang');
      if (saved === 'en' || saved === 'zh') return saved;
    } catch (e) {}
    return null;
  }
  function setStoredLang(l) {
    memLang = l;
    try {
      window.localStorage.setItem('knowledge-lang', l);
    } catch (e) {}
  }
  function detectInitialLang() {
    var stored = getStoredLang();
    if (stored) return stored;
    var nav = (navigator.language || '').toLowerCase();
    return nav.indexOf('zh') === 0 ? 'zh' : 'en';
  }

  var lang = detectInitialLang();
  var reducedMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function getPath(obj, path) {
    var parts = path.split('.');
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (!cur || typeof cur !== 'object') return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }

  function t(key, vars) {
    var pack = COPY[lang] || COPY.zh || {};
    var str = getPath(pack, key);
    if (str === undefined && COPY.zh) str = getPath(COPY.zh, key);
    if (typeof str !== 'string') return key;
    if (!vars) return str;
    return str.replace(/\{([a-zA-Z0-9_]+)\}/g, function (_, name) {
      return vars[name] !== undefined ? String(vars[name]) : '{' + name + '}';
    });
  }

  function el(id) { return document.getElementById(id); }

  function applyStaticCopy() {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.title = t('doc.title');
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', t('doc.desc'));

    var nodes = document.querySelectorAll('[data-t]');
    for (var i = 0; i < nodes.length; i++) {
      var key = nodes[i].getAttribute('data-t');
      var val = t(key);
      if (val.indexOf('<') !== -1) nodes[i].innerHTML = val;
      else nodes[i].textContent = val;
    }

    var zhBtn = el('langZh');
    var enBtn = el('langEn');
    if (zhBtn) zhBtn.setAttribute('aria-pressed', lang === 'zh' ? 'true' : 'false');
    if (enBtn) enBtn.setAttribute('aria-pressed', lang === 'en' ? 'true' : 'false');
  }

  function say(id, key, vars) {
    var node = el(id);
    if (!node) return;
    node.dataset.key = key;
    node.innerHTML = t(key, vars);
  }

  // =========================================================================
  // CANVAS HELPERS & VISIBILITY SCHEDULING
  // =========================================================================
  var COLORS = {
    bg: '#090b10',
    panel: '#111520',
    line: '#2c3344',
    grid: '#1d2332',
    ink: '#ebe8e0',
    mute: '#a7aebb',
    gold: '#e9b949',
    cyan: '#63c7e6',
    red: '#f27a6c',
    green: '#7ad6a0',
    violet: '#b39dfb'
  };

  function fitCanvas(cv, aspectRatioDesktop, minH, maxH) {
    var rect = cv.getBoundingClientRect();
    var cssW = Math.max(240, Math.round(rect.width || 680));
    var baseH = Math.round(cssW * aspectRatioDesktop);
    if (cssW < 460) {
      baseH = Math.max(minH, Math.round(cssW * (aspectRatioDesktop * 1.38)));
    }
    var cssH = Math.max(minH, Math.min(maxH, baseH));
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var pw = Math.round(cssW * dpr);
    var ph = Math.round(cssH * dpr);
    if (cv.width !== pw || cv.height !== ph) {
      cv.width = pw;
      cv.height = ph;
    }
    cv.style.height = cssH + 'px';
    var ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);
    return { ctx: ctx, W: cssW, H: cssH, narrow: cssW < 460 };
  }

  function drawClippedText(ctx, text, x, y, W, align, baseline, font, color) {
    ctx.save();
    if (font) ctx.font = font;
    if (color) ctx.fillStyle = color;
    ctx.textAlign = align || 'left';
    ctx.textBaseline = baseline || 'alphabetic';
    var pad = 6;
    var cx = Math.max(pad, Math.min(W - pad, x));
    ctx.fillText(text, cx, y);
    ctx.restore();
  }

  function drawAxes(ctx, x0, y0, w, h, yMin, yMax, ticks, W, fmt) {
    ctx.strokeStyle = COLORS.line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x0, y0 + h);
    ctx.lineTo(x0 + w, y0 + h);
    ctx.stroke();

    var nTicks = ticks || 3;
    for (var i = 0; i <= nTicks; i++) {
      var frac = i / nTicks;
      var py = y0 + h - frac * h;
      var val = yMin + frac * (yMax - yMin);
      ctx.strokeStyle = COLORS.grid;
      ctx.beginPath();
      ctx.moveTo(x0, py);
      ctx.lineTo(x0 + w, py);
      ctx.stroke();
      var label = fmt ? fmt(val) : (Math.abs(val) >= 10 ? val.toFixed(0) : val.toFixed(1));
      drawClippedText(ctx, label, x0 - 6, py + 3, W, 'right', 'middle', '11px ui-monospace, monospace', COLORS.mute);
    }
  }

  function drawLineSeries(ctx, arr, x0, y0, w, h, yMin, yMax, color, width) {
    if (!arr || arr.length < 2) return;
    var span = Math.max(1e-9, yMax - yMin);
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width || 2;
    ctx.beginPath();
    for (var i = 0; i < arr.length; i++) {
      var px = x0 + (i / (arr.length - 1)) * w;
      var py = y0 + h - ((arr[i] - yMin) / span) * h;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.restore();
  }

  function drawArrow(ctx, cx, cy, dir, size, color) {
    // 0: Up, 1: Right, 2: Down, 3: Left
    var dx = [0, 1, 0, -1][dir];
    var dy = [-1, 0, 1, 0][dir];
    var len = size;
    var x1 = cx - dx * len * 0.45;
    var y1 = cy - dy * len * 0.45;
    var x2 = cx + dx * len * 0.55;
    var y2 = cy + dy * len * 0.55;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    var head = Math.max(4, size * 0.36);
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - dx * head - dy * head * 0.65, y2 - dy * head + dx * head * 0.65);
    ctx.lineTo(x2 - dx * head + dy * head * 0.65, y2 - dy * head - dx * head * 0.65);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // =========================================================================
  // STATE & LAB CONTROLLERS
  // =========================================================================
  var state = {
    c1: { eps: 0.12, ucbC: 0.75, seed: 42 },
    c2: { pol: 'optimal', gamma: 0.90, slip: 0.15 },
    c3: { mode: 'vi', frame: 0, playing: false, timer: null, data: null },
    c4: { alpha: 0.40, eps: 0.10, seed: 101 },
    c5: { useBaseline: true, batchSize: 10, seed: 314 },
    c6: { adv: 1, epsClip: 0.20, klBeta: 0.05, paramsB: 7 },
    c7: { board: M.DEFAULT_TTT_BOARD.slice(), budget: 120, cUct: 1.41, seed: 77 },
    c8: { coinReward: 0.90, klReg: 0.00, gamma: 0.92 },
    c9: { domain: 'llmMath' }
  };

  // --- LAB 1: BANDIT ---
  function renderLab1() {
    var cv = el('cv1');
    if (!cv) return;
    var sim = M.banditSim({ eps: state.c1.eps, ucbC: state.c1.ucbC, horizon: 300, trials: 80, seed: state.c1.seed });
    var g = fitCanvas(cv, 0.44, 290, 360);
    var ctx = g.ctx, W = g.W, H = g.H, narrow = g.narrow;

    var maxReg = Math.max(25, sim.greedy.finalRegret, sim.epsGreedy.finalRegret, sim.ucb.finalRegret) * 1.1;

    if (narrow) {
      var padL = 42, padR = 14, chW = W - padL - padR;
      var c1H = Math.round(H * 0.46);
      drawClippedText(ctx, t('c1.chartRegret'), padL, 16, W, 'left', 'middle', 'bold 12px sans-serif', COLORS.ink);
      drawAxes(ctx, padL, 26, chW, c1H - 36, 0, maxReg, 3, W, function (v) { return v.toFixed(0); });
      drawLineSeries(ctx, sim.greedy.regretCurve, padL, 26, chW, c1H - 36, 0, maxReg, COLORS.red, 2);
      drawLineSeries(ctx, sim.epsGreedy.regretCurve, padL, 26, chW, c1H - 36, 0, maxReg, COLORS.gold, 2);
      drawLineSeries(ctx, sim.ucb.regretCurve, padL, 26, chW, c1H - 36, 0, maxReg, COLORS.green, 2.5);
      drawClippedText(ctx, 't = 0', padL, c1H + 4, W, 'left', 'top', '10px ui-monospace, monospace', COLORS.mute);
      drawClippedText(ctx, 't = 300', padL + chW, c1H + 4, W, 'right', 'top', '10px ui-monospace, monospace', COLORS.mute);

      var bTop = c1H + 34;
      var bH = H - bTop - 26;
      drawClippedText(ctx, t('c1.chartPulls'), padL, bTop - 12, W, 'left', 'middle', 'bold 12px sans-serif', COLORS.ink);
      drawArmBars(ctx, sim, padL, bTop, chW, bH, W);
    } else {
      var splitX = Math.round(W * 0.57);
      var lPadL = 46, lPadT = 30, lW = splitX - lPadL - 18, lH = H - lPadT - 30;
      drawClippedText(ctx, t('c1.chartRegret'), lPadL, 15, W, 'left', 'middle', 'bold 12.5px sans-serif', COLORS.ink);
      drawAxes(ctx, lPadL, lPadT, lW, lH, 0, maxReg, 3, W, function (v) { return v.toFixed(0); });
      drawLineSeries(ctx, sim.greedy.regretCurve, lPadL, lPadT, lW, lH, 0, maxReg, COLORS.red, 2);
      drawLineSeries(ctx, sim.epsGreedy.regretCurve, lPadL, lPadT, lW, lH, 0, maxReg, COLORS.gold, 2);
      drawLineSeries(ctx, sim.ucb.regretCurve, lPadL, lPadT, lW, lH, 0, maxReg, COLORS.green, 2.6);
      drawClippedText(ctx, 't = 0', lPadL, lPadT + lH + 14, W, 'left', 'middle', '11px ui-monospace, monospace', COLORS.mute);
      drawClippedText(ctx, 't = 300', lPadL + lW, lPadT + lH + 14, W, 'right', 'middle', '11px ui-monospace, monospace', COLORS.mute);

      var rPadL = splitX + 34, rW = W - rPadL - 16;
      drawClippedText(ctx, t('c1.chartPulls'), rPadL, 15, W, 'left', 'middle', 'bold 12.5px sans-serif', COLORS.ink);
      drawArmBars(ctx, sim, rPadL, lPadT, rW, lH, W);
    }

    el('c1EpsOut').textContent = state.c1.eps.toFixed(2);
    el('c1UcbOut').textContent = state.c1.ucbC.toFixed(2);
    el('c1r1').textContent = sim.greedy.finalRegret.toFixed(1);
    el('c1r2').textContent = sim.epsGreedy.finalRegret.toFixed(1);
    el('c1r3').textContent = sim.ucb.finalRegret.toFixed(1);
    el('c1r4').textContent = Math.round(sim.ucb.finalOptRate * 100) + '%';

    var sayKey = 'c1.sayBalanced';
    if (state.c1.eps === 0) sayKey = 'c1.sayNoEps';
    else if (state.c1.eps >= 0.28) sayKey = 'c1.sayHighEps';
    say('c1Say', sayKey, {
      greedyReg: sim.greedy.finalRegret.toFixed(1),
      epsReg: sim.epsGreedy.finalRegret.toFixed(1),
      ucbReg: sim.ucb.finalRegret.toFixed(1),
      ucbPct: Math.round(sim.ucb.finalOptRate * 100),
      eps: state.c1.eps.toFixed(2)
    });
  }

  function drawArmBars(ctx, sim, x0, y0, w, h, W) {
    var pulls = sim.ucb.lastPulls;
    var maxP = 1;
    for (var i = 0; i < pulls.length; i++) if (pulls[i] > maxP) maxP = pulls[i];
    drawAxes(ctx, x0, y0, w, h, 0, maxP, 2, W, function (v) { return Math.round(v) + ''; });
    var slot = w / pulls.length;
    var bw = Math.max(12, Math.min(34, slot * 0.58));
    for (var a = 0; a < pulls.length; a++) {
      var bh = (pulls[a] / maxP) * h;
      var bx = x0 + a * slot + (slot - bw) * 0.5;
      var by = y0 + h - bh;
      ctx.fillStyle = a === sim.bestArm ? COLORS.green : COLORS.cyan;
      ctx.fillRect(bx, by, bw, bh);
      var lbl = a === sim.bestArm ? ('A' + (a + 1) + '*') : ('A' + (a + 1));
      drawClippedText(ctx, lbl, bx + bw * 0.5, y0 + h + 13, W, 'center', 'middle', '11px ui-monospace, monospace', a === sim.bestArm ? COLORS.green : COLORS.mute);
    }
  }

  // --- LAB 2: 5x5 GRIDWORLD MDP ---
  function drawGridWorld(ctx, V, policy, x0, y0, size, W, highlightWalls, cellFont) {
    var rows = 5, cols = 5;
    var cell = size / cols;
    var minV = -10, maxV = 10;

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var cx = x0 + c * cell;
        var cy = y0 + r * cell;
        var isWall = highlightWalls(r, c);
        var isGoal = r === 0 && c === 4;
        var isTrap = r === 0 && c === 2;
        var isStart = r === 4 && c === 0;

        if (isWall) {
          ctx.fillStyle = '#242938';
        } else if (isGoal) {
          ctx.fillStyle = 'rgba(122, 214, 160, 0.28)';
        } else if (isTrap) {
          ctx.fillStyle = 'rgba(242, 122, 108, 0.28)';
        } else {
          var v = V[r][c];
          var norm = Math.max(-1, Math.min(1, v / maxV));
          if (norm >= 0) {
            ctx.fillStyle = 'rgba(99, 199, 230, ' + (0.08 + norm * 0.28).toFixed(3) + ')';
          } else {
            ctx.fillStyle = 'rgba(242, 122, 108, ' + (0.08 + Math.abs(norm) * 0.30).toFixed(3) + ')';
          }
        }
        ctx.fillRect(cx + 1, cy + 1, cell - 2, cell - 2);
        ctx.strokeStyle = isStart ? COLORS.gold : COLORS.line;
        ctx.lineWidth = isStart ? 2 : 1;
        ctx.strokeRect(cx + 1, cy + 1, cell - 2, cell - 2);

        if (isGoal) {
          drawClippedText(ctx, '+10', cx + cell * 0.5, cy + cell * 0.5, W, 'center', 'middle', 'bold 12px ui-monospace, monospace', COLORS.green);
        } else if (isTrap) {
          drawClippedText(ctx, '-10', cx + cell * 0.5, cy + cell * 0.5, W, 'center', 'middle', 'bold 12px ui-monospace, monospace', COLORS.red);
        } else if (!isWall) {
          drawArrow(ctx, cx + cell * 0.5, cy + cell * 0.36, policy[r][c], Math.max(8, cell * 0.26), isStart ? COLORS.gold : COLORS.ink);
          var txt = V[r][c].toFixed(1);
          drawClippedText(ctx, txt, cx + cell * 0.5, cy + cell * 0.76, W, 'center', 'middle', (cellFont || 10.5) + 'px ui-monospace, monospace', COLORS.mute);
        }
      }
    }
  }

  function renderLab2() {
    var cv = el('cv2');
    if (!cv) return;
    var res = M.mdpEvaluate({ gamma: state.c2.gamma, slip: state.c2.slip, stepCost: -0.1, policyMode: state.c2.pol });
    var g = fitCanvas(cv, 0.45, 290, 350);
    var ctx = g.ctx, W = g.W, H = g.H, narrow = g.narrow;

    var wallFn = function (r, c) {
      return (r === 1 && c === 1) || (r === 2 && c === 1) || (r === 3 && c === 3);
    };

    if (narrow) {
      var gridSize = Math.min(W - 24, H - 56);
      var gx = Math.round((W - gridSize) * 0.5);
      drawGridWorld(ctx, res.V, res.policy, gx, 28, gridSize, W, wallFn, 9.5);
      drawClippedText(ctx, t('c2.gridTitle'), gx, 14, W, 'left', 'middle', 'bold 12px sans-serif', COLORS.ink);
    } else {
      var gridSizeD = Math.min(255, H - 44);
      drawClippedText(ctx, t('c2.gridTitle'), 24, 15, W, 'left', 'middle', 'bold 12.5px sans-serif', COLORS.ink);
      drawGridWorld(ctx, res.V, res.policy, 24, 28, gridSizeD, W, wallFn, 11);

      var rx = 24 + gridSizeD + 30;
      var rw = W - rx - 20;
      drawClippedText(ctx, t('c2.barTitle'), rx, 15, W, 'left', 'middle', 'bold 12.5px sans-serif', COLORS.ink);
      var items = [
        { lbl: t('c2.barOpt'), v: res.optStartValue, col: COLORS.green },
        { lbl: t('c2.barCur'), v: res.startValue, col: COLORS.gold },
        { lbl: t('c2.barNaive'), v: res.naiveStartValue, col: COLORS.red }
      ];
      var midX = rx + rw * 0.46;
      var barArea = rw * 0.48;
      var barY = 54;
      for (var i = 0; i < items.length; i++) {
        var y = barY + i * 68;
        drawClippedText(ctx, items[i].lbl, rx, y, W, 'left', 'middle', '12px sans-serif', COLORS.ink);
        ctx.strokeStyle = COLORS.line;
        ctx.beginPath();
        ctx.moveTo(midX, y + 10);
        ctx.lineTo(midX, y + 36);
        ctx.stroke();
        var bw = (Math.max(-8, Math.min(8, items[i].v)) / 8) * (barArea * 0.5);
        ctx.fillStyle = items[i].col;
        if (bw >= 0) ctx.fillRect(midX, y + 14, Math.max(2, bw), 18);
        else ctx.fillRect(midX + bw, y + 14, Math.max(2, -bw), 18);
        drawClippedText(ctx, items[i].v.toFixed(2), bw >= 0 ? (midX + bw + 6) : (midX + bw - 6), y + 23, W, bw >= 0 ? 'left' : 'right', 'middle', 'bold 11.5px ui-monospace, monospace', items[i].col);
      }
    }

    el('c2GammaOut').textContent = state.c2.gamma.toFixed(2);
    el('c2SlipOut').textContent = state.c2.slip.toFixed(2);
    el('c2r1').textContent = res.startValue.toFixed(2);
    el('c2r2').textContent = res.naiveStartValue.toFixed(2);
    el('c2r3').textContent = res.V[0][3].toFixed(2);
    el('c2r4').textContent = res.eightStepExact.toFixed(2);

    var sayKey = 'c2.sayOpt';
    if (state.c2.pol === 'alwaysGoal') sayKey = 'c2.sayNaive';
    else if (state.c2.gamma < 0.6) sayKey = 'c2.sayMyopic';
    else if (state.c2.slip >= 0.3) sayKey = 'c2.saySlippery';
    say('c2Say', sayKey, {
      startV: res.startValue.toFixed(2),
      naiveV: res.naiveStartValue.toFixed(2),
      optV: res.optStartValue.toFixed(2),
      gamma: state.c2.gamma.toFixed(2),
      slip: state.c2.slip.toFixed(2)
    });
  }

  // --- LAB 3: DP (VALUE ITERATION & POLICY ITERATION) ---
  function ensureDpData() {
    if (!state.c3.data) {
      state.c3.data = M.dpIterate({ gamma: 0.9, slip: 0.15, stepCost: -0.1, maxIters: 40 });
      if (reducedMotion) {
        state.c3.frame = state.c3.data.viConvergedAt;
      }
    }
    return state.c3.data;
  }

  function renderLab3() {
    var cv = el('cv3');
    if (!cv) return;
    var dp = ensureDpData();
    var isVI = state.c3.mode === 'vi';
    var frames = isVI ? dp.viFrames : dp.piFrames;
    var idx = Math.max(0, Math.min(frames.length - 1, state.c3.frame));
    var f = frames[idx];

    var g = fitCanvas(cv, 0.43, 280, 340);
    var ctx = g.ctx, W = g.W, H = g.H, narrow = g.narrow;
    var wallFn = function (r, c) {
      return (r === 1 && c === 1) || (r === 2 && c === 1) || (r === 3 && c === 3);
    };

    var deltas = dp.viFrames.slice(1).map(function (fr) { return Math.log10(Math.max(1e-6, fr.maxDelta)); });

    if (narrow) {
      var gridSize = Math.min(W - 44, Math.round(H * 0.56));
      var gx = Math.round((W - gridSize) * 0.5);
      drawClippedText(ctx, (isVI ? 'VI' : 'PI') + ' k=' + f.iter, gx, 14, W, 'left', 'middle', 'bold 12px ui-monospace, monospace', COLORS.ink);
      drawGridWorld(ctx, f.V, f.policy, gx, 24, gridSize, W, wallFn, 9);

      var cy0 = 24 + gridSize + 24;
      var ch = H - cy0 - 20;
      drawAxes(ctx, 40, cy0, W - 54, ch, -5, 1, 2, W, function (v) { return '1e' + Math.round(v); });
      drawLineSeries(ctx, deltas, 40, cy0, W - 54, ch, -5, 1, COLORS.cyan, 2);
    } else {
      var gridSizeD = Math.min(240, H - 42);
      drawClippedText(ctx, (isVI ? 'VI' : 'PI') + ' k = ' + f.iter, 20, 15, W, 'left', 'middle', 'bold 12.5px ui-monospace, monospace', COLORS.ink);
      drawGridWorld(ctx, f.V, f.policy, 20, 28, gridSizeD, W, wallFn, 10.5);

      var cx0 = 20 + gridSizeD + 44;
      var cw = W - cx0 - 18;
      var chD = H - 64;
      drawClippedText(ctx, t('c3.chartDelta'), cx0, 15, W, 'left', 'middle', 'bold 12.5px sans-serif', COLORS.ink);
      drawAxes(ctx, cx0, 30, cw, chD, -5, 1, 3, W, function (v) { return '1e' + Math.round(v); });
      drawLineSeries(ctx, deltas, cx0, 30, cw, chD, -5, 1, COLORS.cyan, 2.2);

      // Mark current VI sweep
      if (isVI && idx >= 1 && idx <= deltas.length) {
        var mx = cx0 + ((idx - 1) / Math.max(1, deltas.length - 1)) * cw;
        var my = 30 + chD - ((deltas[idx - 1] - (-5)) / 6) * chD;
        ctx.fillStyle = COLORS.gold;
        ctx.beginPath();
        ctx.arc(mx, my, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      drawClippedText(ctx, 'k = 1', cx0, 30 + chD + 15, W, 'left', 'middle', '11px ui-monospace, monospace', COLORS.mute);
      drawClippedText(ctx, 'k = ' + deltas.length, cx0 + cw, 30 + chD + 15, W, 'right', 'middle', '11px ui-monospace, monospace', COLORS.mute);
    }

    el('c3r1').textContent = f.iter + ' / ' + (frames.length - 1);
    el('c3r2').textContent = isVI ? f.maxDelta.toFixed(4) : (f.changedActions + ' act');
    el('c3r3').textContent = f.V[4][0].toFixed(2);
    el('c3r4').textContent = dp.viConvergedAt + ' vs ' + dp.piConvergedAt;

    var sayKey = isVI ? (idx >= dp.viConvergedAt ? 'c3.sayVIConv' : 'c3.sayVI') : 'c3.sayPI';
    say('c3Say', sayKey, {
      iter: f.iter,
      startV: f.V[4][0].toFixed(2),
      viConv: dp.viConvergedAt,
      piConv: dp.piConvergedAt,
      changed: f.changedActions !== undefined ? f.changedActions : 0
    });
  }

  function stopDpTimer() {
    if (state.c3.timer) {
      clearInterval(state.c3.timer);
      state.c3.timer = null;
    }
    state.c3.playing = false;
    var pBtn = el('c3Play');
    if (pBtn) {
      pBtn.setAttribute('aria-pressed', 'false');
      pBtn.textContent = t('c3.play');
    }
  }

  function toggleDpPlay() {
    if (state.c3.playing) {
      stopDpTimer();
      return;
    }
    var dp = ensureDpData();
    var frames = state.c3.mode === 'vi' ? dp.viFrames : dp.piFrames;
    if (reducedMotion) {
      state.c3.frame = frames.length - 1;
      renderLab3();
      return;
    }
    if (state.c3.frame >= frames.length - 1) state.c3.frame = 0;
    state.c3.playing = true;
    var pBtn = el('c3Play');
    if (pBtn) {
      pBtn.setAttribute('aria-pressed', 'true');
      pBtn.textContent = t('c3.pause');
    }
    state.c3.timer = setInterval(function () {
      var curFrames = state.c3.mode === 'vi' ? dp.viFrames : dp.piFrames;
      if (state.c3.frame >= curFrames.length - 1) {
        stopDpTimer();
        return;
      }
      state.c3.frame += 1;
      renderLab3();
    }, 240);
  }

  // --- LAB 4: CLIFF WALKING (Q-LEARNING VS SARSA) ---
  function renderLab4() {
    var cv = el('cv4');
    if (!cv) return;
    var sim = M.cliffWalkCompare({ alpha: state.c4.alpha, eps: state.c4.eps, episodes: 220, runs: 16, seed: state.c4.seed });
    var g = fitCanvas(cv, 0.48, 300, 380);
    var ctx = g.ctx, W = g.W, H = g.H;

    var gridPadX = 18;
    var cw = Math.floor((W - gridPadX * 2) / 12);
    var gx = Math.round((W - cw * 12) * 0.5);
    var gy = 26;
    drawClippedText(ctx, t('c4.gridTitle'), gx, 13, W, 'left', 'middle', 'bold 12px sans-serif', COLORS.ink);

    for (var r = 0; r < 4; r++) {
      for (var c = 0; c < 12; c++) {
        var cx = gx + c * cw;
        var cy = gy + r * cw;
        var isCliff = r === 3 && c >= 1 && c <= 10;
        var isStart = r === 3 && c === 0;
        var isGoal = r === 3 && c === 11;
        ctx.fillStyle = isCliff ? 'rgba(242, 122, 108, 0.25)' : isStart ? 'rgba(233, 185, 73, 0.2)' : isGoal ? 'rgba(122, 214, 160, 0.25)' : '#121622';
        ctx.fillRect(cx + 1, cy + 1, cw - 2, cw - 2);
        ctx.strokeStyle = COLORS.line;
        ctx.strokeRect(cx + 1, cy + 1, cw - 2, cw - 2);
        if (isStart) drawClippedText(ctx, 'S', cx + cw * 0.5, cy + cw * 0.5, W, 'center', 'middle', 'bold 11px ui-monospace, monospace', COLORS.gold);
        else if (isGoal) drawClippedText(ctx, 'G', cx + cw * 0.5, cy + cw * 0.5, W, 'center', 'middle', 'bold 11px ui-monospace, monospace', COLORS.green);
        else if (isCliff && cw >= 28) drawClippedText(ctx, '×', cx + cw * 0.5, cy + cw * 0.5, W, 'center', 'middle', '11px ui-monospace, monospace', COLORS.red);
      }
    }

    function drawPath(pts, col, offY, dash) {
      if (!pts || pts.length < 2) return;
      ctx.save();
      ctx.strokeStyle = col;
      ctx.lineWidth = 2.6;
      if (dash) ctx.setLineDash(dash);
      ctx.beginPath();
      for (var i = 0; i < pts.length; i++) {
        var px = gx + (pts[i].c + 0.5) * cw;
        var py = gy + (pts[i].r + 0.5) * cw + offY;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.restore();
    }
    drawPath(sim.sarsa.greedyPath, COLORS.green, -2, null);
    drawPath(sim.qlearning.greedyPath, COLORS.cyan, 2, [5, 3]);

    var chartTop = gy + cw * 4 + 28;
    var chartH = H - chartTop - 28;
    var padL = 46, padR = 16;
    drawClippedText(ctx, t('c4.curveTitle'), padL, chartTop - 12, W, 'left', 'middle', 'bold 12px sans-serif', COLORS.ink);
    drawAxes(ctx, padL, chartTop, W - padL - padR, chartH, -150, 0, 3, W, function (v) { return Math.round(v) + ''; });
    drawLineSeries(ctx, sim.qlearning.smooth, padL, chartTop, W - padL - padR, chartH, -150, 0, COLORS.cyan, 2.2);
    drawLineSeries(ctx, sim.sarsa.smooth, padL, chartTop, W - padL - padR, chartH, -150, 0, COLORS.green, 2.4);
    drawClippedText(ctx, 'ep 1', padL, chartTop + chartH + 14, W, 'left', 'middle', '11px ui-monospace, monospace', COLORS.mute);
    drawClippedText(ctx, 'ep 220', W - padR, chartTop + chartH + 14, W, 'right', 'middle', '11px ui-monospace, monospace', COLORS.mute);

    el('c4AlphaOut').textContent = state.c4.alpha.toFixed(2);
    el('c4EpsOut').textContent = state.c4.eps.toFixed(2);
    el('c4r1').textContent = sim.qlearning.meanLast50.toFixed(1);
    el('c4r2').textContent = sim.sarsa.meanLast50.toFixed(1);
    el('c4r3').textContent = sim.qlearning.greedyReturn + '';
    el('c4r4').textContent = sim.sarsa.greedyReturn + '';

    var sayKey = state.c4.eps <= 0.04 ? 'c4.sayLowEps' : 'c4.sayDiff';
    say('c4Say', sayKey, {
      qOnline: sim.qlearning.meanLast50.toFixed(1),
      sOnline: sim.sarsa.meanLast50.toFixed(1),
      qGreedy: sim.qlearning.greedyReturn,
      sGreedy: sim.sarsa.greedyReturn,
      eps: state.c4.eps.toFixed(2)
    });
  }

  // --- LAB 5: POLICY GRADIENT & BASELINES ---
  function renderLab5() {
    var cv = el('cv5');
    if (!cv) return;
    var sim = M.policyGradientLab({
      useBaseline: state.c5.useBaseline,
      batchSize: state.c5.batchSize,
      steps: 40,
      lr: 0.14,
      seed: state.c5.seed
    });
    var g = fitCanvas(cv, 0.43, 280, 340);
    var ctx = g.ctx, W = g.W, H = g.H, narrow = g.narrow;

    var minY = 12.0, maxY = 14.6;
    if (narrow) {
      var padL = 44, padR = 14, ch = H - 56;
      drawClippedText(ctx, t('c5.curveTitle'), padL, 15, W, 'left', 'middle', 'bold 12px sans-serif', COLORS.ink);
      drawAxes(ctx, padL, 28, W - padL - padR, ch, minY, maxY, 3, W, function (v) { return v.toFixed(1); });
      drawLineSeries(ctx, sim.noBaseRun.returnCurve, padL, 28, W - padL - padR, ch, minY, maxY, COLORS.red, state.c5.useBaseline ? 1.8 : 2.6);
      drawLineSeries(ctx, sim.withBaseRun.returnCurve, padL, 28, W - padL - padR, ch, minY, maxY, COLORS.cyan, state.c5.useBaseline ? 2.6 : 1.8);
      drawClippedText(ctx, 'step 0', padL, 28 + ch + 14, W, 'left', 'middle', '10.5px ui-monospace, monospace', COLORS.mute);
      drawClippedText(ctx, 'step 40', W - padR, 28 + ch + 14, W, 'right', 'middle', '10.5px ui-monospace, monospace', COLORS.mute);
    } else {
      var splitX = Math.round(W * 0.42);
      var bPadL = 46, bW = splitX - bPadL - 22, cH = H - 62;
      drawClippedText(ctx, t('c5.stdTitle'), bPadL, 15, W, 'left', 'middle', 'bold 12px sans-serif', COLORS.ink);
      var maxStd = Math.max(4, sim.statsNoBase.gradStd * 1.15);
      drawAxes(ctx, bPadL, 30, bW, cH, 0, maxStd, 3, W, function (v) { return v.toFixed(1); });
      var bw = Math.min(44, bW * 0.28);
      var h1 = (sim.statsNoBase.gradStd / maxStd) * cH;
      var h2 = (sim.statsWithBase.gradStd / maxStd) * cH;
      var x1 = bPadL + bW * 0.25 - bw * 0.5;
      var x2 = bPadL + bW * 0.72 - bw * 0.5;
      ctx.fillStyle = COLORS.red;
      ctx.fillRect(x1, 30 + cH - h1, bw, h1);
      ctx.fillStyle = COLORS.cyan;
      ctx.fillRect(x2, 30 + cH - h2, bw, Math.max(3, h2));
      drawClippedText(ctx, sim.statsNoBase.gradStd.toFixed(2), x1 + bw * 0.5, 30 + cH - h1 - 10, W, 'center', 'middle', 'bold 11px ui-monospace, monospace', COLORS.red);
      drawClippedText(ctx, sim.statsWithBase.gradStd.toFixed(2), x2 + bw * 0.5, 30 + cH - h2 - 10, W, 'center', 'middle', 'bold 11px ui-monospace, monospace', COLORS.cyan);
      drawClippedText(ctx, t('c5.barNo'), x1 + bw * 0.5, 30 + cH + 15, W, 'center', 'middle', '11px sans-serif', COLORS.mute);
      drawClippedText(ctx, t('c5.barYes'), x2 + bw * 0.5, 30 + cH + 15, W, 'center', 'middle', '11px sans-serif', COLORS.mute);

      var rPadL = splitX + 38, rW = W - rPadL - 16;
      drawClippedText(ctx, t('c5.curveTitle'), rPadL, 15, W, 'left', 'middle', 'bold 12px sans-serif', COLORS.ink);
      drawAxes(ctx, rPadL, 30, rW, cH, minY, maxY, 3, W, function (v) { return v.toFixed(1); });
      drawLineSeries(ctx, sim.noBaseRun.returnCurve, rPadL, 30, rW, cH, minY, maxY, COLORS.red, state.c5.useBaseline ? 1.8 : 2.8);
      drawLineSeries(ctx, sim.withBaseRun.returnCurve, rPadL, 30, rW, cH, minY, maxY, COLORS.cyan, state.c5.useBaseline ? 2.8 : 1.8);
      drawClippedText(ctx, 'step 0', rPadL, 30 + cH + 15, W, 'left', 'middle', '11px ui-monospace, monospace', COLORS.mute);
      drawClippedText(ctx, 'step 40', rPadL + rW, 30 + cH + 15, W, 'right', 'middle', '11px ui-monospace, monospace', COLORS.mute);
    }

    el('c5BatchOut').textContent = state.c5.batchSize + '';
    el('c5r1').textContent = sim.statsNoBase.gradStd.toFixed(2);
    el('c5r2').textContent = sim.statsWithBase.gradStd.toFixed(2);
    el('c5r3').textContent = sim.varianceReductionFactor.toFixed(1) + 'x';
    el('c5r4').textContent = (state.c5.useBaseline ? sim.withBaseRun.finalReturn : sim.noBaseRun.finalReturn).toFixed(2);

    say('c5Say', state.c5.useBaseline ? 'c5.sayWithBase' : 'c5.sayNoBase', {
      stdNo: sim.statsNoBase.gradStd.toFixed(2),
      stdYes: sim.statsWithBase.gradStd.toFixed(2),
      factor: sim.varianceReductionFactor.toFixed(1),
      batch: state.c5.batchSize
    });
  }

  // --- LAB 6: PPO CLIPPING & GRPO MEMORY ---
  function renderLab6() {
    var cv = el('cv6');
    if (!cv) return;
    var ppo = M.ppoObjectiveLab({ epsClip: state.c6.epsClip, klBeta: state.c6.klBeta, advantage: state.c6.adv });
    var grpo = M.grpoCompare({ groupSize: 16, modelParamsB: state.c6.paramsB });

    var g = fitCanvas(cv, 0.43, 280, 340);
    var ctx = g.ctx, W = g.W, H = g.H, narrow = g.narrow;

    var minY = -2.0, maxY = 2.0;
    var unclipped = ppo.points.map(function (p) { return p.unclipped; });
    var clipped = ppo.points.map(function (p) { return p.ppoClip; });
    var withKl = ppo.points.map(function (p) { return p.withKl; });

    function drawClipBand(x0, y0, w, h) {
      var xLow = x0 + ((ppo.clipLow - 0.4) / 1.4) * w;
      var xHigh = x0 + ((ppo.clipHigh - 0.4) / 1.4) * w;
      ctx.fillStyle = 'rgba(233, 185, 73, 0.08)';
      ctx.fillRect(xLow, y0, xHigh - xLow, h);
    }

    if (narrow) {
      var padL = 42, padR = 14, ch = H - 56;
      drawClippedText(ctx, t('c6.objTitle'), padL, 15, W, 'left', 'middle', 'bold 12px sans-serif', COLORS.ink);
      drawClipBand(padL, 28, W - padL - padR, ch);
      drawAxes(ctx, padL, 28, W - padL - padR, ch, minY, maxY, 4, W, function (v) { return v.toFixed(1); });
      drawLineSeries(ctx, unclipped, padL, 28, W - padL - padR, ch, minY, maxY, COLORS.mute, 1.6);
      drawLineSeries(ctx, clipped, padL, 28, W - padL - padR, ch, minY, maxY, COLORS.gold, 2.5);
      drawLineSeries(ctx, withKl, padL, 28, W - padL - padR, ch, minY, maxY, COLORS.cyan, 2.2);
      drawClippedText(ctx, 'r=0.4', padL, 28 + ch + 14, W, 'left', 'middle', '10.5px ui-monospace, monospace', COLORS.mute);
      drawClippedText(ctx, 'r=1.0', padL + ((1.0 - 0.4) / 1.4) * (W - padL - padR), 28 + ch + 14, W, 'center', 'middle', '10.5px ui-monospace, monospace', COLORS.gold);
      drawClippedText(ctx, 'r=1.8', W - padR, 28 + ch + 14, W, 'right', 'middle', '10.5px ui-monospace, monospace', COLORS.mute);
    } else {
      var splitX = Math.round(W * 0.58);
      var lPadL = 44, lW = splitX - lPadL - 18, cH = H - 62;
      drawClippedText(ctx, t('c6.objTitle'), lPadL, 15, W, 'left', 'middle', 'bold 12px sans-serif', COLORS.ink);
      drawClipBand(lPadL, 30, lW, cH);
      drawAxes(ctx, lPadL, 30, lW, cH, minY, maxY, 4, W, function (v) { return v.toFixed(1); });
      drawLineSeries(ctx, unclipped, lPadL, 30, lW, cH, minY, maxY, COLORS.mute, 1.6);
      drawLineSeries(ctx, clipped, lPadL, 30, lW, cH, minY, maxY, COLORS.gold, 2.6);
      drawLineSeries(ctx, withKl, lPadL, 30, lW, cH, minY, maxY, COLORS.cyan, 2.2);
      drawClippedText(ctx, 'r = 0.4', lPadL, 30 + cH + 15, W, 'left', 'middle', '11px ui-monospace, monospace', COLORS.mute);
      drawClippedText(ctx, 'r = 1.0', lPadL + ((1.0 - 0.4) / 1.4) * lW, 30 + cH + 15, W, 'center', 'middle', '11px ui-monospace, monospace', COLORS.gold);
      drawClippedText(ctx, 'r = 1.8', lPadL + lW, 30 + cH + 15, W, 'right', 'middle', '11px ui-monospace, monospace', COLORS.mute);

      var rPadL = splitX + 44, rW = W - rPadL - 16;
      drawClippedText(ctx, t('c6.memTitle'), rPadL, 15, W, 'left', 'middle', 'bold 12px sans-serif', COLORS.ink);
      var maxMem = grpo.ppoTotalGB * 1.15;
      drawAxes(ctx, rPadL, 30, rW, cH, 0, maxMem, 3, W, function (v) { return Math.round(v) + ''; });
      var bw = Math.min(48, rW * 0.28);
      var hPpo = (grpo.ppoTotalGB / maxMem) * cH;
      var hGrpo = (grpo.grpoVerifierGB / maxMem) * cH;
      var xP = rPadL + rW * 0.26 - bw * 0.5;
      var xG = rPadL + rW * 0.72 - bw * 0.5;
      ctx.fillStyle = COLORS.red;
      ctx.fillRect(xP, 30 + cH - hPpo, bw, hPpo);
      ctx.fillStyle = COLORS.green;
      ctx.fillRect(xG, 30 + cH - hGrpo, bw, hGrpo);
      drawClippedText(ctx, grpo.ppoTotalGB + 'GB', xP + bw * 0.5, 30 + cH - hPpo - 10, W, 'center', 'middle', 'bold 11px ui-monospace, monospace', COLORS.red);
      drawClippedText(ctx, grpo.grpoVerifierGB + 'GB', xG + bw * 0.5, 30 + cH - hGrpo - 10, W, 'center', 'middle', 'bold 11px ui-monospace, monospace', COLORS.green);
      drawClippedText(ctx, 'PPO', xP + bw * 0.5, 30 + cH + 15, W, 'center', 'middle', '11px ui-monospace, monospace', COLORS.mute);
      drawClippedText(ctx, 'GRPO', xG + bw * 0.5, 30 + cH + 15, W, 'center', 'middle', '11px ui-monospace, monospace', COLORS.mute);
    }

    el('c6ClipOut').textContent = state.c6.epsClip.toFixed(2);
    el('c6KlOut').textContent = state.c6.klBeta.toFixed(2);
    el('c6ParamOut').textContent = state.c6.paramsB + 'B';
    el('c6r1').textContent = '[' + ppo.clipLow.toFixed(2) + ', ' + ppo.clipHigh.toFixed(2) + ']';
    el('c6r2').textContent = grpo.ppoTotalGB + ' GB';
    el('c6r3').textContent = grpo.grpoVerifierGB + ' GB';
    el('c6r4').textContent = '-' + Math.round(grpo.memorySavingPct) + '%';

    say('c6Say', state.c6.adv > 0 ? 'c6.sayPos' : 'c6.sayNeg', {
      low: ppo.clipLow.toFixed(2),
      high: ppo.clipHigh.toFixed(2),
      params: state.c6.paramsB,
      ppoGB: grpo.ppoTotalGB,
      grpoGB: grpo.grpoVerifierGB
    });
  }

  // --- LAB 7: MCTS ON 3x3 TIC-TAC-TOE ---
  function renderTttDom(res) {
    var grid = el('tttGrid');
    if (!grid) return;
    grid.innerHTML = '';
    var b = state.c7.board;
    for (var i = 0; i < 9; i++) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ttt-cell';
      if (b[i] === 1) {
        btn.className += ' x';
        btn.textContent = 'X';
      } else if (b[i] === -1) {
        btn.className += ' o';
        btn.textContent = 'O';
      } else {
        btn.textContent = (i + 1) + '';
        btn.style.fontSize = '12px';
        btn.style.color = '#6b7280';
      }
      if (res && res.chosenMove === i) btn.className += ' best';
      btn.setAttribute('data-idx', i + '');
      btn.setAttribute('aria-label', 'Cell ' + (i + 1));
      btn.addEventListener('click', (function (idx) {
        return function () {
          if (state.c7.board[idx] !== 0 || M.tttWinner(state.c7.board) !== 0) return;
          state.c7.board[idx] = M.tttTurn(state.c7.board);
          renderLab7();
        };
      })(i));
      grid.appendChild(btn);
    }
  }

  function renderLab7() {
    var cv = el('cv7');
    if (!cv) return;
    var res = M.mctsSearch({ board: state.c7.board, budget: state.c7.budget, cUct: state.c7.cUct, seed: state.c7.seed });
    renderTttDom(res);

    var g = fitCanvas(cv, 0.50, 230, 280);
    var ctx = g.ctx, W = g.W, H = g.H;
    drawClippedText(ctx, t('c7.chartTitle'), 12, 15, W, 'left', 'middle', 'bold 12px sans-serif', COLORS.ink);

    if (res.terminal || res.children.length === 0) {
      var msg = res.winner === 1 ? t('c7.winX') : res.winner === -1 ? t('c7.winO') : t('c7.draw');
      drawClippedText(ctx, msg, W * 0.5, H * 0.5, W, 'center', 'middle', 'bold 15px sans-serif', COLORS.gold);
    } else {
      var top = res.children.slice(0, 6);
      var maxV = Math.max(1, top[0].visits);
      var padL = 56, padR = 66, topY = 34, rowH = Math.min(34, Math.floor((H - 46) / top.length));
      var barMaxW = Math.max(60, W - padL - padR);
      for (var i = 0; i < top.length; i++) {
        var ch = top[i];
        var y = topY + i * rowH;
        var bw = (ch.visits / maxV) * barMaxW;
        var col = ch.isMinimaxBest ? COLORS.green : (i === 0 ? COLORS.red : COLORS.cyan);
        drawClippedText(ctx, '#' + (ch.move + 1) + (ch.isMinimaxBest ? '*' : ''), padL - 6, y + rowH * 0.45, W, 'right', 'middle', 'bold 11.5px ui-monospace, monospace', ch.isMinimaxBest ? COLORS.green : COLORS.ink);
        ctx.fillStyle = col;
        ctx.fillRect(padL, y + 4, Math.max(3, bw), rowH - 10);
        var info = ch.visits + ' (' + Math.round(ch.winRate * 100) + '%)';
        drawClippedText(ctx, info, padL + Math.max(3, bw) + 6, y + rowH * 0.45, W, 'left', 'middle', '11px ui-monospace, monospace', COLORS.mute);
      }
    }

    el('c7BudgetOut').textContent = state.c7.budget + '';
    el('c7COut').textContent = state.c7.cUct.toFixed(2);
    el('c7r1').textContent = res.chosenMove !== null ? ('#' + (res.chosenMove + 1)) : '—';
    el('c7r2').textContent = res.oracle.bestMoves.length ? res.oracle.bestMoves.map(function (m) { return '#' + (m + 1); }).join(', ') : '—';
    el('c7r3').textContent = res.terminal ? '—' : (res.isMinimaxOptimal ? t('c7.yes') : t('c7.no'));
    el('c7r4').textContent = res.treeNodesCount + '';

    var sayKey = res.terminal ? 'c7.sayTerminal' : (res.isMinimaxOptimal ? 'c7.sayMatch' : 'c7.sayUnderbudget');
    say('c7Say', sayKey, {
      budget: state.c7.budget,
      nodes: res.treeNodesCount,
      pick: res.chosenMove !== null ? ('#' + (res.chosenMove + 1)) : '-',
      oracle: res.oracle.bestMoves.map(function (m) { return '#' + (m + 1); }).join(', ')
    });
  }

  // --- LAB 8: REWARD HACKING & GOODHART'S LAW ---
  function renderLab8() {
    var cv = el('cv8');
    if (!cv) return;
    var sim = M.rewardHackingGrid({ coinReward: state.c8.coinReward, goalReward: 10, klReg: state.c8.klReg, gamma: state.c8.gamma });
    var g = fitCanvas(cv, 0.44, 290, 350);
    var ctx = g.ctx, W = g.W, H = g.H, narrow = g.narrow;

    // Top strip: 6-state track diagram
    var trackY = 34;
    var padX = narrow ? 20 : 34;
    var stepW = (W - padX * 2) / 5;
    drawClippedText(ctx, t('c8.trackTitle'), padX, 14, W, 'left', 'middle', 'bold 12px sans-serif', COLORS.ink);

    for (var s = 0; s < 6; s++) {
      var sx = padX + s * stepW;
      if (s < 5) {
        ctx.strokeStyle = COLORS.line;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sx + 14, trackY + 18);
        ctx.lineTo(sx + stepW - 14, trackY + 18);
        ctx.stroke();
      }
      ctx.fillStyle = s === 5 ? 'rgba(122, 214, 160, 0.25)' : (s === 2 ? 'rgba(233, 185, 73, 0.22)' : '#141926');
      ctx.strokeStyle = s === 5 ? COLORS.green : (s === 2 ? (sim.isHacking ? COLORS.red : COLORS.gold) : COLORS.line);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sx, trackY + 18, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      var lbl = s === 0 ? 'S' : s === 5 ? 'G' : s === 2 ? '$' : (s + '');
      drawClippedText(ctx, lbl, sx, trackY + 18, W, 'center', 'middle', 'bold 11.5px ui-monospace, monospace', s === 5 ? COLORS.green : (s === 2 ? COLORS.gold : COLORS.ink));
    }
    if (sim.isHacking) {
      var lx = padX + 2 * stepW;
      ctx.strokeStyle = COLORS.red;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(lx, trackY + 2, 12, Math.PI * 0.8, Math.PI * 2.2);
      ctx.stroke();
      drawClippedText(ctx, 'LOOP!', lx, trackY + 42, W, 'center', 'middle', 'bold 10.5px ui-monospace, monospace', COLORS.red);
    } else {
      drawClippedText(ctx, '→ +10', padX + 3.5 * stepW, trackY + 42, W, 'center', 'middle', 'bold 10.5px ui-monospace, monospace', COLORS.green);
    }

    // Bottom curve: Sweep CoinReward 0..1.8 -> True vs Proxy Return
    var coins = [];
    var trueArr = [];
    var proxyArr = [];
    for (var c = 0; c <= 1.801; c += 0.05) {
      coins.push(c);
      var r = M.rewardHackingGrid({ coinReward: c, goalReward: 10, klReg: state.c8.klReg, gamma: state.c8.gamma });
      trueArr.push(r.trueReturn);
      proxyArr.push(r.proxyReturn);
    }
    var cTop = 104, cH = H - cTop - 28, padL = 44, padR = 16;
    drawClippedText(ctx, t('c8.chartTitle'), padL, cTop - 12, W, 'left', 'middle', 'bold 12px sans-serif', COLORS.ink);
    var maxRet = Math.max(15, Math.max.apply(null, proxyArr) + 2);
    drawAxes(ctx, padL, cTop, W - padL - padR, cH, -10, maxRet, 3, W, function (v) { return Math.round(v) + ''; });
    drawLineSeries(ctx, trueArr, padL, cTop, W - padL - padR, cH, -10, maxRet, COLORS.green, 2.5);
    drawLineSeries(ctx, proxyArr, padL, cTop, W - padL - padR, cH, -10, maxRet, COLORS.red, 2.2);

    var curX = padL + (state.c8.coinReward / 1.8) * (W - padL - padR);
    ctx.strokeStyle = COLORS.gold;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(curX, cTop);
    ctx.lineTo(curX, cTop + cH);
    ctx.stroke();
    ctx.setLineDash([]);

    drawClippedText(ctx, 'coin = 0', padL, cTop + cH + 14, W, 'left', 'middle', '11px ui-monospace, monospace', COLORS.mute);
    drawClippedText(ctx, 'coin = 1.8', W - padR, cTop + cH + 14, W, 'right', 'middle', '11px ui-monospace, monospace', COLORS.mute);

    el('c8CoinOut').textContent = state.c8.coinReward.toFixed(2);
    el('c8KlOut').textContent = state.c8.klReg.toFixed(2);
    el('c8GammaOut').textContent = state.c8.gamma.toFixed(2);
    el('c8r1').textContent = sim.critWithKl.toFixed(2);
    el('c8r2').textContent = sim.trueReturn.toFixed(1);
    el('c8r3').textContent = sim.proxyReturn.toFixed(1);
    el('c8r4').textContent = sim.reachedGoal ? t('c8.goalYes') : (sim.coinsCollected + ' ' + t('c8.coinsUnit'));

    var sayKey = sim.isHacking ? 'c8.sayHacking' : (state.c8.klReg > 0 && state.c8.coinReward > sim.critNoKl ? 'c8.sayKlSaved' : 'c8.sayClean');
    say('c8Say', sayKey, {
      coin: state.c8.coinReward.toFixed(2),
      crit: sim.critWithKl.toFixed(2),
      trueRet: sim.trueReturn.toFixed(1),
      proxyRet: sim.proxyReturn.toFixed(1),
      coins: sim.coinsCollected
    });
  }

  // --- LAB 9: FRONTIER REGIME SELECTOR ---
  function renderLab9() {
    var reg = M.FRONTIER.regimes[state.c9.domain];
    if (!reg) return;
    el('c9r1').textContent = t('c9.ver_' + reg.verifier);
    el('c9r2').textContent = t('c9.cost_' + reg.sampleCost);
    el('c9r3').textContent = t('c9.risk_' + reg.failureRisk);
    el('c9r4').textContent = reg.fitAlgo;

    var keyMap = {
      llmMath: 'c9.sayMath',
      robotics: 'c9.sayRob',
      boardGame: 'c9.sayGame',
      openChat: 'c9.sayChat'
    };
    say('c9Say', keyMap[state.c9.domain] || 'c9.sayMath');
  }

  // =========================================================================
  // INTERSECTION OBSERVER & LAZY RENDERING
  // =========================================================================
  var labMap = {
    lab1: renderLab1,
    lab2: renderLab2,
    lab3: renderLab3,
    lab4: renderLab4,
    lab5: renderLab5,
    lab6: renderLab6,
    lab7: renderLab7,
    lab8: renderLab8,
    lab9: renderLab9
  };
  var visibleLabs = Object.create(null);

  function renderAllVisibleOrAll(forceAll) {
    Object.keys(labMap).forEach(function (id) {
      if (forceAll || visibleLabs[id]) labMap[id]();
    });
  }

  function setupObservers() {
    if (!('IntersectionObserver' in window)) {
      Object.keys(labMap).forEach(function (id) { visibleLabs[id] = true; });
      renderAllVisibleOrAll(true);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        var id = entries[i].target.id;
        if (entries[i].isIntersecting) {
          visibleLabs[id] = true;
          if (labMap[id]) labMap[id]();
        } else {
          visibleLabs[id] = false;
          if (id === 'lab3') stopDpTimer();
        }
      }
    }, { rootMargin: '60px' });

    Object.keys(labMap).forEach(function (id) {
      var node = el(id);
      if (node) io.observe(node);
    });
  }

  // =========================================================================
  // EVENT WIRING
  // =========================================================================
  function bindSeg(selector, cb) {
    var btns = document.querySelectorAll(selector);
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function () {
        for (var j = 0; j < btns.length; j++) {
          btns[j].classList.remove('on');
          btns[j].setAttribute('aria-pressed', 'false');
        }
        this.classList.add('on');
        this.setAttribute('aria-pressed', 'true');
        cb(this);
      });
    }
  }

  function wireControls() {
    // Language toggle
    el('langZh').addEventListener('click', function () {
      if (lang === 'zh') return;
      lang = 'zh';
      setStoredLang('zh');
      applyStaticCopy();
      renderAllVisibleOrAll(true);
    });
    el('langEn').addEventListener('click', function () {
      if (lang === 'en') return;
      lang = 'en';
      setStoredLang('en');
      applyStaticCopy();
      renderAllVisibleOrAll(true);
    });

    // Lab 1
    el('c1Eps').addEventListener('input', function () { state.c1.eps = parseFloat(this.value); renderLab1(); });
    el('c1Ucb').addEventListener('input', function () { state.c1.ucbC = parseFloat(this.value); renderLab1(); });
    el('c1Reseed').addEventListener('click', function () { state.c1.seed += 17; renderLab1(); });

    // Lab 2
    bindSeg('#lab2 [data-pol]', function (btn) {
      state.c2.pol = btn.getAttribute('data-pol');
      renderLab2();
    });
    el('c2Gamma').addEventListener('input', function () { state.c2.gamma = parseFloat(this.value); renderLab2(); });
    el('c2Slip').addEventListener('input', function () { state.c2.slip = parseFloat(this.value); renderLab2(); });

    // Lab 3
    bindSeg('#lab3 [data-dpmode]', function (btn) {
      stopDpTimer();
      state.c3.mode = btn.getAttribute('data-dpmode');
      var dp = ensureDpData();
      state.c3.frame = reducedMotion ? (state.c3.mode === 'vi' ? dp.viConvergedAt : dp.piFrames.length - 1) : 0;
      renderLab3();
    });
    el('c3Play').addEventListener('click', toggleDpPlay);
    el('c3Step').addEventListener('click', function () {
      stopDpTimer();
      var dp = ensureDpData();
      var frames = state.c3.mode === 'vi' ? dp.viFrames : dp.piFrames;
      if (state.c3.frame < frames.length - 1) state.c3.frame += 1;
      renderLab3();
    });
    el('c3Reset').addEventListener('click', function () {
      stopDpTimer();
      state.c3.frame = 0;
      renderLab3();
    });

    // Lab 4
    el('c4Alpha').addEventListener('input', function () { state.c4.alpha = parseFloat(this.value); renderLab4(); });
    el('c4Eps').addEventListener('input', function () { state.c4.eps = parseFloat(this.value); renderLab4(); });
    el('c4Reseed').addEventListener('click', function () { state.c4.seed += 23; renderLab4(); });

    // Lab 5
    el('c5Base').addEventListener('change', function () { state.c5.useBaseline = this.checked; renderLab5(); });
    el('c5Batch').addEventListener('input', function () { state.c5.batchSize = parseInt(this.value, 10); renderLab5(); });
    el('c5Reseed').addEventListener('click', function () { state.c5.seed += 31; renderLab5(); });

    // Lab 6
    bindSeg('#lab6 [data-adv]', function (btn) {
      state.c6.adv = parseFloat(btn.getAttribute('data-adv'));
      renderLab6();
    });
    el('c6Clip').addEventListener('input', function () { state.c6.epsClip = parseFloat(this.value); renderLab6(); });
    el('c6Kl').addEventListener('input', function () { state.c6.klBeta = parseFloat(this.value); renderLab6(); });
    el('c6Param').addEventListener('input', function () { state.c6.paramsB = parseInt(this.value, 10); renderLab6(); });

    // Lab 7
    el('c7Budget').addEventListener('input', function () { state.c7.budget = parseInt(this.value, 10); renderLab7(); });
    el('c7C').addEventListener('input', function () { state.c7.cUct = parseFloat(this.value); renderLab7(); });
    el('c7Tactical').addEventListener('click', function () {
      state.c7.board = M.DEFAULT_TTT_BOARD.slice();
      renderLab7();
    });
    el('c7Clear').addEventListener('click', function () {
      state.c7.board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      renderLab7();
    });

    // Lab 8
    el('c8Coin').addEventListener('input', function () { state.c8.coinReward = parseFloat(this.value); renderLab8(); });
    el('c8Kl').addEventListener('input', function () { state.c8.klReg = parseFloat(this.value); renderLab8(); });
    el('c8Gamma').addEventListener('input', function () { state.c8.gamma = parseFloat(this.value); renderLab8(); });

    // Lab 9
    bindSeg('#lab9 [data-dom]', function (btn) {
      state.c9.domain = btn.getAttribute('data-dom');
      renderLab9();
    });

    var resizeTid = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTid);
      resizeTid = setTimeout(function () { renderAllVisibleOrAll(true); }, 100);
    });
  }

  // =========================================================================
  // BOOT
  // =========================================================================
  applyStaticCopy();
  wireControls();
  renderAllVisibleOrAll(true);
  setupObservers();
  window.__essayReady = true;
})();
