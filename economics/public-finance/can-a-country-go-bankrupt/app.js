(function () {
  'use strict';

  var M = window.PublicFinanceModels;
  var COPY = window.ESSAY_COPY || {};
  var C = {
    bg: '#0f1219',
    card2: '#1a1f2b',
    grid: '#232938',
    axis: '#3a4358',
    ink: '#ebe8e0',
    mute: '#a3aab8',
    dim: '#8a92a4',
    gold: '#e9b949',
    cyan: '#63c7e6',
    red: '#f07a6d',
    green: '#7ad6a0',
    violet: '#b39dfb'
  };

  var memLang = 'zh';
  function getStoredLang() {
    try {
      var v = localStorage.getItem('knowledge-lang');
      if (v === 'zh' || v === 'en') return v;
    } catch (_) {}
    return memLang;
  }
  function storeLang(lang) {
    memLang = lang;
    try {
      localStorage.setItem('knowledge-lang', lang);
    } catch (_) {}
  }

  var lang = getStoredLang();
  function T() {
    return COPY[lang] || COPY.zh || {};
  }
  function getPath(obj, path) {
    var parts = path.split('.');
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return '';
      cur = cur[parts[i]];
    }
    return cur == null ? '' : String(cur);
  }
  function fmt(str, vars) {
    if (!vars) return str;
    return String(str).replace(/\{(\w+)\}/g, function (_, k) {
      return vars[k] != null ? String(vars[k]) : '';
    });
  }
  function f1(n) { return (Math.round(n * 10) / 10).toFixed(1); }
  function f2(n) { return (Math.round(n * 100) / 100).toFixed(2); }
  function f0(n) { return String(Math.round(n)); }
  function fs1(n) { return (n >= 0 ? '+' : '') + f1(n); }
  function fs2(n) { return (n >= 0 ? '+' : '') + f2(n); }

  function $(id) { return document.getElementById(id); }

  function setRead(id, items) {
    var el = $(id);
    if (!el) return;
    var html = '';
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      html += '<div>' + it.lbl + '<b' + (it.cls ? ' class="' + it.cls + '"' : '') + '>' + it.val + '</b></div>';
    }
    el.innerHTML = html;
  }

  function setLegend(id, items) {
    var el = $(id);
    if (!el) return;
    var html = '';
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var cls = it.kind ? ' class="' + it.kind + '"' : '';
      html += '<span><i' + cls + ' style="background:' + it.color + ';color:' + it.color + '"></i>' + it.label + '</span>';
    }
    el.innerHTML = html;
  }

  function setupCanvas(cv) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var rect = cv.getBoundingClientRect();
    var w = Math.max(240, Math.round(rect.width || cv.clientWidth || 600));
    var h = Math.max(180, Math.round(rect.height || cv.clientHeight || 320));
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
    }
    var ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, w, h);
    return { ctx: ctx, w: w, h: h, narrow: w < 460 };
  }

  function fontSpec(narrow, size, bold) {
    var sz = narrow ? Math.max(10, size - 1) : size;
    return (bold ? '600 ' : '400 ') + sz + 'px -apple-system,system-ui,sans-serif';
  }

  function placeLabels(items, minGap, minY, maxY) {
    items.sort(function (a, b) { return a.y - b.y; });
    for (var i = 0; i < items.length; i++) {
      items[i].y = Math.max(minY, Math.min(maxY, items[i].y));
    }
    for (var i = 1; i < items.length; i++) {
      if (items[i].y - items[i - 1].y < minGap) {
        items[i].y = items[i - 1].y + minGap;
      }
    }
    for (var i = items.length - 1; i >= 0; i--) {
      if (items[i].y > maxY) {
        items[i].y = maxY;
        if (i > 0 && items[i].y - items[i - 1].y < minGap) {
          items[i - 1].y = items[i].y - minGap;
        }
      }
    }
    return items;
  }

  function drawLinePlotAxes(ctx, pad, pw, ph, yMin, yMax, ticksY, suffixY, narrow) {
    ctx.strokeStyle = C.grid;
    ctx.lineWidth = 1;
    ctx.font = fontSpec(narrow, 11, false);
    ctx.fillStyle = C.dim;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'right';
    for (var i = 0; i <= ticksY; i++) {
      var val = yMin + (yMax - yMin) * (i / ticksY);
      var y = pad.t + ph - ((val - yMin) / (yMax - yMin)) * ph;
      ctx.beginPath();
      ctx.moveTo(pad.l, y);
      ctx.lineTo(pad.l + pw, y);
      ctx.stroke();
      ctx.fillText(f0(val) + suffixY, pad.l - 6, y);
    }
    ctx.strokeStyle = C.axis;
    ctx.beginPath();
    ctx.moveTo(pad.l, pad.t);
    ctx.lineTo(pad.l, pad.t + ph);
    ctx.lineTo(pad.l + pw, pad.t + ph);
    ctx.stroke();
  }

  // ---------- CH1: Flow vs Stock ----------
  function draw1() {
    var revPct = parseFloat($('c1Rev').value);
    var primarySpendPct = parseFloat($('c1Pri').value);
    var debtPct = parseFloat($('c1Debt').value);
    var avgRatePct = parseFloat($('c1Rate').value);
    $('o1Rev').textContent = f1(revPct) + '%';
    $('o1Pri').textContent = f1(primarySpendPct) + '%';
    $('o1Debt').textContent = f0(debtPct) + '%';
    $('o1Rate').textContent = f2(avgRatePct) + '%';

    var res = M.budgetAccounting({
      revPct: revPct,
      primarySpendPct: primarySpendPct,
      debtPct: debtPct,
      avgRatePct: avgRatePct,
      gdpTrillion: 20
    });

    var cv = $('cv1');
    if (visibleSet.cv1) {
      var g = setupCanvas(cv);
      var ctx = g.ctx, w = g.w, h = g.h, narrow = g.narrow;
      var t = T().ch1 || {};
      var pad = { l: narrow ? 38 : 48, r: 16, t: 34, b: 36 };
      var splitX = narrow ? w * 0.62 : w * 0.56;
      var flowW = splitX - pad.l - 18;
      var stockX = splitX + 18;
      var stockW = w - pad.r - stockX;
      var ph = h - pad.t - pad.b;

      // Left area: Flow (% GDP): Revenue vs Primary + Interest
      var maxFlow = Math.max(48, res.revPct, res.totalSpendPct) * 1.12;
      ctx.fillStyle = C.mute;
      ctx.font = fontSpec(narrow, 12, true);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(t.cvFlowTitle || 'Flow (% GDP)', pad.l, 10);

      drawLinePlotAxes(ctx, { l: pad.l, t: pad.t }, flowW, ph, 0, maxFlow, 4, '%', narrow);

      var barW = Math.min(54, flowW * 0.28);
      var xRev = pad.l + flowW * 0.26 - barW / 2;
      var xExp = pad.l + flowW * 0.72 - barW / 2;

      var hRev = (res.revPct / maxFlow) * ph;
      var yRev = pad.t + ph - hRev;
      ctx.fillStyle = C.cyan;
      ctx.fillRect(xRev, yRev, barW, hRev);

      var hPri = (res.primarySpendPct / maxFlow) * ph;
      var hInt = (res.interestPct / maxFlow) * ph;
      var yPri = pad.t + ph - hPri;
      var yTot = yPri - hInt;
      ctx.fillStyle = C.gold;
      ctx.fillRect(xExp, yPri, barW, hPri);
      ctx.fillStyle = C.red;
      ctx.fillRect(xExp, yTot, barW, hInt);

      ctx.font = fontSpec(narrow, 11, true);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillStyle = C.cyan;
      ctx.fillText(f1(res.revPct) + '%', xRev + barW / 2, Math.max(pad.t + 12, yRev - 4));
      ctx.fillStyle = C.ink;
      ctx.fillText(f1(res.totalSpendPct) + '%', xExp + barW / 2, Math.max(pad.t + 12, yTot - 4));

      ctx.font = fontSpec(narrow, 11, false);
      ctx.fillStyle = C.mute;
      ctx.textBaseline = 'top';
      ctx.fillText(t.cvBarRev || 'Revenue', xRev + barW / 2, pad.t + ph + 8);
      ctx.fillText(t.cvBarOut || 'Outlays', xExp + barW / 2, pad.t + ph + 8);

      // Divider
      ctx.strokeStyle = C.line || '#2b3242';
      ctx.beginPath();
      ctx.moveTo(splitX, pad.t);
      ctx.lineTo(splitX, pad.t + ph);
      ctx.stroke();

      // Right area: Stock vs 100% GDP baseline
      var maxStock = Math.max(140, res.debtPct * 1.15);
      ctx.fillStyle = C.mute;
      ctx.font = fontSpec(narrow, 12, true);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(t.cvStockTitle || 'Stock (% GDP)', stockX, 10);

      var sbW = Math.min(48, stockW * 0.34);
      var xGdp = stockX + stockW * 0.28 - sbW / 2;
      var xDebt = stockX + stockW * 0.74 - sbW / 2;
      var hGdp = (100 / maxStock) * ph;
      var hDebt = (res.debtPct / maxStock) * ph;

      ctx.fillStyle = '#334057';
      ctx.fillRect(xGdp, pad.t + ph - hGdp, sbW, hGdp);
      ctx.fillStyle = C.violet;
      ctx.fillRect(xDebt, pad.t + ph - hDebt, sbW, hDebt);

      ctx.font = fontSpec(narrow, 11, true);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillStyle = C.mute;
      ctx.fillText('100%', xGdp + sbW / 2, Math.max(pad.t + 12, pad.t + ph - hGdp - 4));
      ctx.fillStyle = C.violet;
      ctx.fillText(f0(res.debtPct) + '%', xDebt + sbW / 2, Math.max(pad.t + 12, pad.t + ph - hDebt - 4));

      ctx.font = fontSpec(narrow, 11, false);
      ctx.fillStyle = C.mute;
      ctx.textBaseline = 'top';
      ctx.fillText(t.cvBarGdp || '1y GDP', xGdp + sbW / 2, pad.t + ph + 8);
      ctx.fillText(t.cvBarDebt || 'Debt', xDebt + sbW / 2, pad.t + ph + 8);
    }

    var t1 = T().ch1 || {};
    setRead('r1', [
      { lbl: t1.rdPb || 'Primary Balance', val: fs1(res.primaryBalancePct) + '%', cls: res.primaryBalancePct >= 0 ? 'n' : 'r' },
      { lbl: t1.rdInt || 'Interest Bill', val: f2(res.interestPct) + '%', cls: 'g' },
      { lbl: t1.rdDef || 'Overall Balance', val: fs2(res.overallBalancePct) + '%', cls: res.overallBalancePct >= 0 ? 'n' : 'r' },
      { lbl: t1.rdShare || 'Interest / Rev', val: f1(res.interestToRevPct) + '%', cls: res.interestToRevPct > 15 ? 'r' : 'c' }
    ]);

    var sayKey = 'saySurplus';
    if (res.regime === 'primary_surplus_headline_deficit') sayKey = 'saySplit';
    else if (res.regime === 'primary_deficit') sayKey = 'sayDeficit';
    $('y1').innerHTML = fmt(t1[sayKey] || '', {
      pb: fs1(res.primaryBalancePct),
      int: f2(res.interestPct),
      ov: fs2(res.overallBalancePct),
      ish: f1(res.interestToRevPct)
    });
  }

  // ---------- CH2: Debt Dynamics r - g ----------
  function draw2() {
    var d0 = parseFloat($('c2D0').value);
    var rPct = parseFloat($('c2R').value);
    var gPct = parseFloat($('c2G').value);
    var pbPct = parseFloat($('c2Pb').value);
    $('o2D0').textContent = f0(d0) + '%';
    $('o2R').textContent = f2(rPct) + '%';
    $('o2G').textContent = f2(gPct) + '%';
    $('o2Pb').textContent = fs2(pbPct) + '%';

    var res = M.debtDynamics({ d0: d0, rPct: rPct, gPct: gPct, pbPct: pbPct, horizon: 30 });

    if (visibleSet.cv2) {
      var g = setupCanvas($('cv2'));
      var ctx = g.ctx, w = g.w, h = g.h, narrow = g.narrow;
      var t2 = T().ch2 || {};
      var pad = { l: narrow ? 42 : 52, r: narrow ? 16 : 24, t: 28, b: 36 };
      var pw = w - pad.l - pad.r;
      var ph = h - pad.t - pad.b;

      var yMax = 240;
      for (var i = 0; i < res.series.length; i++) {
        yMax = Math.max(yMax, res.series[i], res.zeroPbSeries[i]);
      }
      yMax = Math.min(500, Math.ceil(yMax / 40) * 40);

      drawLinePlotAxes(ctx, pad, pw, ph, 0, yMax, 4, '%', narrow);

      function xOf(yr) { return pad.l + (yr / res.horizon) * pw; }
      function yOf(val) { return pad.t + ph - (Math.min(yMax, Math.max(0, val)) / yMax) * ph; }

      // X ticks
      ctx.font = fontSpec(narrow, 11, false);
      ctx.fillStyle = C.dim;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      var step = narrow ? 10 : 5;
      for (var yr = 0; yr <= res.horizon; yr += step) {
        ctx.fillText(yr + 'y', xOf(yr), pad.t + ph + 8);
      }

      // Stabilizing baseline (flat d0)
      ctx.save();
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = C.dim;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(xOf(0), yOf(d0));
      ctx.lineTo(xOf(res.horizon), yOf(d0));
      ctx.stroke();
      ctx.restore();

      // Zero primary balance benchmark
      ctx.save();
      ctx.setLineDash([3, 4]);
      ctx.strokeStyle = C.cyan;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (var i = 0; i < res.zeroPbSeries.length; i++) {
        if (i === 0) ctx.moveTo(xOf(i), yOf(res.zeroPbSeries[i]));
        else ctx.lineTo(xOf(i), yOf(res.zeroPbSeries[i]));
      }
      ctx.stroke();
      ctx.restore();

      // Main path
      ctx.strokeStyle = res.diverges ? C.red : C.gold;
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (var i = 0; i < res.series.length; i++) {
        if (i === 0) ctx.moveTo(xOf(i), yOf(res.series[i]));
        else ctx.lineTo(xOf(i), yOf(res.series[i]));
      }
      ctx.stroke();

      // End labels placed cleanly without collision
      var labels = [
        { y: yOf(res.series[res.series.length - 1]), text: f0(res.endDebt) + '%', color: res.diverges ? C.red : C.gold },
        { y: yOf(res.zeroPbSeries[res.zeroPbSeries.length - 1]), text: 'pb=0: ' + f0(res.zeroPbSeries[res.zeroPbSeries.length - 1]) + '%', color: C.cyan },
        { y: yOf(d0), text: 'd0=' + f0(d0) + '%', color: C.mute }
      ];
      placeLabels(labels, 16, pad.t + 10, pad.t + ph - 10);
      ctx.font = fontSpec(narrow, 11, true);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (var k = 0; k < labels.length; k++) {
        ctx.fillStyle = labels[k].color;
        ctx.fillText(labels[k].text, pad.l + pw - 4, labels[k].y);
      }

      // Regime badge top-left inside plot
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = res.rgGapPct <= 0 ? C.green : C.red;
      ctx.fillText('r − g = ' + fs2(res.rgGapPct) + ' pp', pad.l + 8, pad.t + 6);
    }

    var t2 = T().ch2 || {};
    var ssTxt = res.steadyStatePct != null ? f0(res.steadyStatePct) + '%' : (t2.rdDiverge || 'Diverges');
    setRead('r2', [
      { lbl: t2.rdRg || 'r − g Gap', val: fs2(res.rgGapPct) + ' pp', cls: res.rgGapPct <= 0 ? 'n' : 'r' },
      { lbl: t2.rdStab || 'Stabilizing pb*', val: fs2(res.stabilizingPbPct) + '%', cls: 'c' },
      { lbl: t2.rdEnd || 'Year-30 Debt', val: f0(res.endDebt) + '%', cls: res.diverges ? 'r' : 'g' },
      { lbl: t2.rdSs || 'Long-run Target', val: ssTxt, cls: res.steadyStatePct != null ? 'n' : 'r' }
    ]);

    var sayKey = 'saySurplus';
    if (res.regime === 'favorable_rg_climbing_to_ss') sayKey = 'sayRgClimb';
    else if (res.regime === 'favorable_rg_falling') sayKey = 'sayRgFall';
    else if (res.regime === 'snowball') sayKey = 'saySnowball';
    else if (res.regime === 'knife_edge') sayKey = 'sayKnife';

    $('y2').innerHTML = fmt(t2[sayKey] || '', {
      rg: fs2(res.rgGapPct),
      pbStar: fs2(res.stabilizingPbPct),
      pb: fs2(pbPct),
      end: f0(res.endDebt),
      ss: res.steadyStatePct != null ? f0(res.steadyStatePct) : ''
    });
  }

  // ---------- CH3: Own vs Foreign Currency ----------
  function draw3() {
    var fxSharePct = parseFloat($('c3Fx').value);
    var fxDeprecPct = parseFloat($('c3Dep').value);
    var reserveMonths = parseFloat($('c3Res').value);
    $('o3Fx').textContent = f0(fxSharePct) + '%';
    $('o3Dep').textContent = '+' + f0(fxDeprecPct) + '%';
    $('o3Res').textContent = f1(reserveMonths) + 'm';

    var res = M.currencyExposure({
      d0: 75,
      fxSharePct: fxSharePct,
      fxDeprecPct: fxDeprecPct,
      rFxPct: 6.5,
      reserveMonths: reserveMonths
    });

    if (visibleSet.cv3) {
      var g = setupCanvas($('cv3'));
      var ctx = g.ctx, w = g.w, h = g.h, narrow = g.narrow;
      var t3 = T().ch3 || {};
      var pad = { l: narrow ? 40 : 48, r: 16, t: 32, b: 36 };
      var splitX = narrow ? w * 0.56 : w * 0.55;
      var pw1 = splitX - pad.l - 16;
      var x2 = splitX + 16;
      var pw2 = w - pad.r - x2;
      var ph = h - pad.t - pad.b;

      // Panel 1: Pre vs Post Debt/GDP stacked by Own vs FX
      var maxD = Math.max(120, res.dAfter * 1.15);
      ctx.fillStyle = C.mute;
      ctx.font = fontSpec(narrow, 12, true);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(t3.cvDebtTitle || 'Debt (% GDP)', pad.l, 10);
      drawLinePlotAxes(ctx, { l: pad.l, t: pad.t }, pw1, ph, 0, maxD, 4, '%', narrow);

      var bw = Math.min(50, pw1 * 0.28);
      var bx1 = pad.l + pw1 * 0.28 - bw / 2;
      var bx2 = pad.l + pw1 * 0.72 - bw / 2;

      function drawStack(x, dom, fx) {
        var hDom = (dom / maxD) * ph;
        var hFx = (fx / maxD) * ph;
        ctx.fillStyle = C.cyan;
        ctx.fillRect(x, pad.t + ph - hDom, bw, hDom);
        ctx.fillStyle = C.red;
        ctx.fillRect(x, pad.t + ph - hDom - hFx, bw, hFx);
        ctx.font = fontSpec(narrow, 11, true);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillStyle = C.ink;
        ctx.fillText(f1(dom + fx) + '%', x + bw / 2, Math.max(pad.t + 12, pad.t + ph - hDom - hFx - 4));
      }
      drawStack(bx1, res.dDom, res.dFx0);
      drawStack(bx2, res.dDom, res.dFxAfter);

      ctx.font = fontSpec(narrow, 11, false);
      ctx.fillStyle = C.mute;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(t3.cvPre || 'Pre-shock', bx1 + bw / 2, pad.t + ph + 8);
      ctx.fillText(t3.cvPost || 'Post-FX', bx2 + bw / 2, pad.t + ph + 8);

      // Divider
      ctx.strokeStyle = C.line || '#2b3242';
      ctx.beginPath();
      ctx.moveTo(splitX, pad.t);
      ctx.lineTo(splitX, pad.t + ph);
      ctx.stroke();

      // Panel 2: Annual FX Service vs Reserves (% GDP)
      var maxR = Math.max(30, res.fxDebtServicePct, res.reservesGdpPct) * 1.2;
      ctx.fillStyle = C.mute;
      ctx.font = fontSpec(narrow, 12, true);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(t3.cvFxTitle || 'FX Cash vs Reserves', x2, 10);

      var rbW = Math.min(44, pw2 * 0.30);
      var rx1 = x2 + pw2 * 0.28 - rbW / 2;
      var rx2 = x2 + pw2 * 0.72 - rbW / 2;
      var hServ = (res.fxDebtServicePct / maxR) * ph;
      var hRes = (res.reservesGdpPct / maxR) * ph;

      ctx.fillStyle = res.fxServiceToReserves >= 1 ? C.red : C.gold;
      ctx.fillRect(rx1, pad.t + ph - hServ, rbW, hServ);
      ctx.fillStyle = C.green;
      ctx.fillRect(rx2, pad.t + ph - hRes, rbW, hRes);

      ctx.font = fontSpec(narrow, 11, true);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillStyle = res.fxServiceToReserves >= 1 ? C.red : C.gold;
      ctx.fillText(f1(res.fxDebtServicePct) + '%', rx1 + rbW / 2, Math.max(pad.t + 12, pad.t + ph - hServ - 4));
      ctx.fillStyle = C.green;
      ctx.fillText(f1(res.reservesGdpPct) + '%', rx2 + rbW / 2, Math.max(pad.t + 12, pad.t + ph - hRes - 4));

      ctx.font = fontSpec(narrow, 11, false);
      ctx.fillStyle = C.mute;
      ctx.textBaseline = 'top';
      ctx.fillText(t3.cvServ || '1y FX Due', rx1 + rbW / 2, pad.t + ph + 8);
      ctx.fillText(t3.cvRes || 'Reserves', rx2 + rbW / 2, pad.t + ph + 8);
    }

    var t3 = T().ch3 || {};
    setRead('r3', [
      { lbl: t3.rdJump || 'Valuation Jump', val: '+' + f1(res.balanceSheetJumpPct) + ' pp', cls: res.balanceSheetJumpPct >= 15 ? 'r' : 'c' },
      { lbl: t3.rdAfter || 'Post-Shock Debt', val: f1(res.dAfter) + '%', cls: res.dAfter >= 95 ? 'r' : 'g' },
      { lbl: t3.rdRatio || 'FX Due / Reserves', val: f2(res.fxServiceToReserves) + 'x', cls: res.fxServiceToReserves >= 1 ? 'r' : 'n' },
      { lbl: t3.rdCpi || 'Imported CPI Push', val: '+' + f1(res.importedInflationPct) + ' pp', cls: 'g' }
    ]);

    var sayKey = 'sayOwn';
    if (res.regime === 'sudden_stop') sayKey = 'sayStop';
    else if (res.regime === 'fx_vulnerable') sayKey = 'sayVuln';
    $('y3').innerHTML = fmt(t3[sayKey] || '', {
      jump: f1(res.balanceSheetJumpPct),
      after: f1(res.dAfter),
      ratio: f2(res.fxServiceToReserves),
      cpi: f1(res.importedInflationPct)
    });
  }

  // ---------- CH4: Maturity Wall & Rollover ----------
  function draw4() {
    var wamYears = parseFloat($('c4Wam').value);
    var marketYieldPct = parseFloat($('c4Yield').value);
    var cbSharePct = parseFloat($('c4Cb').value);
    var primaryDeficitPct = parseFloat($('c4Def').value);
    $('o4Wam').textContent = f1(wamYears) + 'y';
    $('o4Yield').textContent = f2(marketYieldPct) + '%';
    $('o4Cb').textContent = f0(cbSharePct) + '%';
    $('o4Def').textContent = f1(primaryDeficitPct) + '%';

    var res = M.rolloverSchedule({
      debtPct: 110,
      wamYears: wamYears,
      oldCouponPct: 2.2,
      marketYieldPct: marketYieldPct,
      cbSharePct: cbSharePct,
      primaryDeficitPct: primaryDeficitPct
    });

    if (visibleSet.cv4) {
      var g = setupCanvas($('cv4'));
      var ctx = g.ctx, w = g.w, h = g.h, narrow = g.narrow;
      var t4 = T().ch4 || {};
      var pad = { l: narrow ? 40 : 48, r: narrow ? 42 : 50, t: 32, b: 36 };
      var pw = w - pad.l - pad.r;
      var ph = h - pad.t - pad.b;

      var maxBar = Math.max(40, res.maturingByYear[0] * 1.25);
      drawLinePlotAxes(ctx, pad, pw, ph, 0, maxBar, 4, '%', narrow);

      // Right axis for effective interest rate (0..10%)
      var maxR = 10;
      ctx.font = fontSpec(narrow, 11, false);
      ctx.fillStyle = C.gold;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      for (var k = 0; k <= 2; k++) {
        var rv = k * 5;
        var yr = pad.t + ph - (rv / maxR) * ph;
        ctx.fillText(rv + '%', pad.l + pw + 6, yr);
      }

      var n = res.maturingByYear.length;
      var slot = pw / n;
      var bw = Math.max(8, slot * 0.58);
      for (var i = 0; i < n; i++) {
        var val = res.maturingByYear[i];
        var bh = (val / maxBar) * ph;
        var bx = pad.l + i * slot + (slot - bw) / 2;
        ctx.fillStyle = i < 3 ? C.cyan : '#344b66';
        ctx.fillRect(bx, pad.t + ph - bh, bw, bh);

        if (!narrow || i % 2 === 0) {
          ctx.font = fontSpec(narrow, 11, false);
          ctx.fillStyle = C.dim;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText('Y' + (i + 1), bx + bw / 2, pad.t + ph + 8);
        }
      }

      // Overlay effective coupon line (years 0..10)
      ctx.strokeStyle = C.gold;
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      for (var t = 0; t < res.effRatePath.length; t++) {
        var rx = pad.l + (t / n) * pw;
        var ry = pad.t + ph - (Math.min(maxR, res.effRatePath[t]) / maxR) * ph;
        if (t === 0) ctx.moveTo(rx, ry);
        else ctx.lineTo(rx, ry);
      }
      ctx.stroke();

      // Target market yield dashed line
      var yTgt = pad.t + ph - (Math.min(maxR, marketYieldPct) / maxR) * ph;
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = C.red;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(pad.l, yTgt);
      ctx.lineTo(pad.l + pw, yTgt);
      ctx.stroke();
      ctx.restore();

      var yEndEff = pad.t + ph - (Math.min(maxR, res.effRatePath[10]) / maxR) * ph;
      var lbls = placeLabels([
        { y: yTgt, text: (t4.cvNew || 'New: ') + f2(marketYieldPct) + '%', color: C.red },
        { y: yEndEff, text: (t4.cvEff || 'Avg Y10: ') + f2(res.effRatePath[10]) + '%', color: C.gold }
      ], 15, pad.t + 10, pad.t + ph - 10);
      ctx.font = fontSpec(narrow, 11, true);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (var j = 0; j < lbls.length; j++) {
        ctx.fillStyle = lbls[j].color;
        ctx.fillText(lbls[j].text, pad.l + pw - 4, lbls[j].y);
      }
    }

    var t4 = T().ch4 || {};
    setRead('r4', [
      { lbl: t4.rd3y || 'Maturing in 3y', val: f1(res.threeYearSharePct) + '%', cls: res.threeYearSharePct > 50 ? 'r' : 'c' },
      { lbl: t4.rdGfn || 'Annual GFN', val: f1(res.gfnPct) + '%', cls: res.gfnPct > 28 ? 'r' : 'g' },
      { lbl: t4.rdRefi || 'Refi Share', val: f1(res.refiSharePct) + '%', cls: 'c' },
      { lbl: t4.rdShort || 'CB-Net Short Share', val: f1(res.consolidatedShortSharePct) + '%', cls: 'v' }
    ]);

    var sayKey = 'sayGradual';
    if (res.regime === 'rollover_cliff') sayKey = 'sayCliff';
    else if (res.regime === 'cb_duration_shortened') sayKey = 'sayCb';
    $('y4').innerHTML = fmt(t4[sayKey] || '', {
      wam: f1(wamYears),
      y3: f1(res.threeYearSharePct),
      refi: f1(res.refiSharePct),
      int1: f2(res.interestYr1Pct),
      int10: f2(res.interestYr10Pct),
      cbShort: f1(res.consolidatedShortSharePct)
    });
  }

  // ---------- CH5: Multipliers & Crowding Out ----------
  function draw5() {
    var stimPct = parseFloat($('c5Stim').value);
    var slackPct = parseFloat($('c5Slack').value);
    var opennessPct = parseFloat($('c5Open').value);
    var zlbOn = $('c5Zlb').checked;
    $('o5Stim').textContent = f2(stimPct) + '%';
    $('o5Slack').textContent = fs1(slackPct) + '%';
    $('o5Open').textContent = f0(opennessPct) + '%';

    var res = M.multiplierCrowding({
      stimPct: stimPct,
      slackPct: slackPct,
      zlbOn: zlbOn,
      opennessPct: opennessPct,
      baseDebtPct: 100,
      gBasePct: 3.5
    });

    if (visibleSet.cv5) {
      var g = setupCanvas($('cv5'));
      var ctx = g.ctx, w = g.w, h = g.h, narrow = g.narrow;
      var t5 = T().ch5 || {};
      var pad = { l: narrow ? 40 : 48, r: 16, t: 32, b: 36 };
      var splitX = narrow ? w * 0.56 : w * 0.56;
      var pw1 = splitX - pad.l - 18;
      var x2 = splitX + 18;
      var pw2 = w - pad.r - x2;
      var ph = h - pad.t - pad.b;

      // Left plot: Multiplier k vs Output Gap (-6% to +3%)
      ctx.fillStyle = C.mute;
      ctx.font = fontSpec(narrow, 12, true);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(t5.cvCurveTitle || 'Multiplier k', pad.l, 10);

      drawLinePlotAxes(ctx, { l: pad.l, t: pad.t }, pw1, ph, 0, 1.8, 3, '', narrow);
      function xGap(s) { return pad.l + ((s + 6) / 9) * pw1; }
      function yK(k) { return pad.t + ph - (Math.min(1.8, Math.max(0, k)) / 1.8) * ph; }

      ctx.font = fontSpec(narrow, 11, false);
      ctx.fillStyle = C.dim;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      [-6, -3, 0, 3].forEach(function (sv) {
        ctx.fillText((sv > 0 ? '+' : '') + String(sv) + '%', xGap(sv), pad.t + ph + 8);
      });

      // ZLB curve
      ctx.strokeStyle = C.cyan;
      ctx.lineWidth = zlbOn ? 3 : 1.6;
      ctx.beginPath();
      res.curve.forEach(function (pt, idx) {
        if (idx === 0) ctx.moveTo(xGap(pt.slackPct), yK(pt.kZlb));
        else ctx.lineTo(xGap(pt.slackPct), yK(pt.kZlb));
      });
      ctx.stroke();

      // Normal curve
      ctx.strokeStyle = C.gold;
      ctx.lineWidth = zlbOn ? 1.6 : 3;
      ctx.beginPath();
      res.curve.forEach(function (pt, idx) {
        if (idx === 0) ctx.moveTo(xGap(pt.slackPct), yK(pt.kNormal));
        else ctx.lineTo(xGap(pt.slackPct), yK(pt.kNormal));
      });
      ctx.stroke();

      // Active dot
      var ax = xGap(slackPct), ay = yK(res.multiplier);
      ctx.fillStyle = zlbOn ? C.cyan : C.gold;
      ctx.beginPath();
      ctx.arc(ax, ay, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = fontSpec(narrow, 11, true);
      ctx.textAlign = ax > pad.l + pw1 * 0.65 ? 'right' : 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText('k=' + f2(res.multiplier), ax + (ax > pad.l + pw1 * 0.65 ? -8 : 8), Math.max(pad.t + 14, ay - 6));

      // Divider
      ctx.strokeStyle = C.line || '#2b3242';
      ctx.beginPath();
      ctx.moveTo(splitX, pad.t);
      ctx.lineTo(splitX, pad.t + ph);
      ctx.stroke();

      // Right plot: Yr-1 vs Yr-5 net Debt/GDP shift
      ctx.fillStyle = C.mute;
      ctx.font = fontSpec(narrow, 12, true);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(t5.cvNetTitle || 'Net Δ(D/Y)', x2, 10);

      var maxAbs = Math.max(3, Math.abs(res.yr1DebtDeltaPct), Math.abs(res.yr5DebtDeltaPct)) * 1.3;
      var yZero = pad.t + ph * 0.55;
      ctx.strokeStyle = C.axis;
      ctx.beginPath();
      ctx.moveTo(x2, yZero);
      ctx.lineTo(x2 + pw2, yZero);
      ctx.stroke();

      var bw = Math.min(40, pw2 * 0.28);
      var bx1 = x2 + pw2 * 0.28 - bw / 2;
      var bx2 = x2 + pw2 * 0.72 - bw / 2;

      function drawDeltaBar(bx, val, lbl) {
        var scale = (ph * 0.42) / maxAbs;
        var bh = val * scale;
        ctx.fillStyle = val <= 0 ? C.green : C.red;
        if (bh >= 0) ctx.fillRect(bx, yZero - bh, bw, bh);
        else ctx.fillRect(bx, yZero, bw, -bh);

        ctx.font = fontSpec(narrow, 11, true);
        ctx.textAlign = 'center';
        ctx.textBaseline = bh >= 0 ? 'bottom' : 'top';
        var ty = bh >= 0 ? Math.max(pad.t + 12, yZero - bh - 4) : Math.min(pad.t + ph - 12, yZero - bh + 4);
        ctx.fillText(fs2(val), bx + bw / 2, ty);

        ctx.font = fontSpec(narrow, 11, false);
        ctx.fillStyle = C.mute;
        ctx.textBaseline = 'top';
        ctx.fillText(lbl, bx + bw / 2, pad.t + ph + 8);
      }
      drawDeltaBar(bx1, res.yr1DebtDeltaPct, t5.cvY1 || 'Yr 1');
      drawDeltaBar(bx2, res.yr5DebtDeltaPct, t5.cvY5 || 'Yr 5');
    }

    var t5 = T().ch5 || {};
    setRead('r5', [
      { lbl: t5.rdMult || 'Multiplier k', val: f2(res.multiplier), cls: res.multiplier >= 1 ? 'n' : 'g' },
      { lbl: t5.rdDr || 'Rate Push Δr', val: '+' + f2(res.deltaRPct) + ' pp', cls: res.deltaRPct >= 0.8 ? 'r' : 'c' },
      { lbl: t5.rdY1 || 'Yr-1 Δ(D/Y)', val: fs2(res.yr1DebtDeltaPct) + ' pp', cls: res.yr1DebtDeltaPct <= 0 ? 'n' : 'g' },
      { lbl: t5.rdY5 || 'Yr-5 Δ(D/Y)', val: fs2(res.yr5DebtDeltaPct) + ' pp', cls: res.yr5DebtDeltaPct > 1.5 ? 'r' : 'c' }
    ]);

    var sayKey = 'sayNormal';
    if (res.regime === 'zlb_high_multiplier' || res.regime === 'denom_cushion') sayKey = 'sayZlb';
    else if (res.regime === 'full_capacity_crowdout') sayKey = 'sayCrowd';
    $('y5').innerHTML = fmt(t5[sayKey] || '', {
      k: f2(res.multiplier),
      dr: f2(res.deltaRPct),
      d1: fs2(res.yr1DebtDeltaPct),
      d5: fs2(res.yr5DebtDeltaPct),
      self: f0(res.selfFinancingSharePct)
    });
  }

  // ---------- CH6: Demographics & PAYG ----------
  function draw6() {
    var workersPerRetiree = parseFloat($('c6Work').value);
    var replaceRatePct = parseFloat($('c6Rep').value);
    var healthFactor = parseFloat($('c6Hlth').value);
    var debtPct = parseFloat($('c6Debt').value);
    $('o6Work').textContent = f1(workersPerRetiree) + ':1';
    $('o6Rep').textContent = f0(replaceRatePct) + '%';
    $('o6Hlth').textContent = f1(healthFactor) + 'x';
    $('o6Debt').textContent = f0(debtPct) + '%';

    var res = M.demographicBudget({
      workersPerRetiree: workersPerRetiree,
      replaceRatePct: replaceRatePct,
      healthFactor: healthFactor,
      taxRevPct: 30,
      nonAgeSpendPct: 11,
      debtPct: debtPct,
      rEffPct: 3.2
    });

    if (visibleSet.cv6) {
      var g = setupCanvas($('cv6'));
      var ctx = g.ctx, w = g.w, h = g.h, narrow = g.narrow;
      var t6 = T().ch6 || {};
      var pad = { l: narrow ? 40 : 48, r: 16, t: 32, b: 38 };
      var pw = w - pad.l - pad.r;
      var ph = h - pad.t - pad.b;

      var snaps = [
        { s: res.young, lbl: t6.cvYoung || 'Young (4.2:1)' },
        { s: res.current, lbl: (t6.cvCur || 'Current ') + '(' + f1(workersPerRetiree) + ':1)' },
        { s: res.aged, lbl: t6.cvAged || 'Aged (1.7:1)' }
      ];

      var maxY = 44;
      snaps.forEach(function (item) {
        maxY = Math.max(maxY, item.s.mandatoryPct + 11);
      });
      maxY = Math.ceil(maxY / 10) * 10;
      drawLinePlotAxes(ctx, pad, pw, ph, 0, maxY, 4, '%', narrow);

      // Tax revenue ceiling line
      var yRev = pad.t + ph - (res.taxRevPct / maxY) * ph;
      ctx.save();
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = C.green;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pad.l, yRev);
      ctx.lineTo(pad.l + pw, yRev);
      ctx.stroke();
      ctx.restore();

      ctx.font = fontSpec(narrow, 11, true);
      ctx.fillStyle = C.green;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText((t6.cvRevLine || 'Tax Cap ') + f0(res.taxRevPct) + '%', pad.l + pw - 4, yRev - 4);

      var bw = Math.min(68, (pw / 3) * 0.56);
      snaps.forEach(function (item, idx) {
        var cx = pad.l + (pw / 3) * (idx + 0.5);
        var bx = cx - bw / 2;
        var s = item.s;
        var parts = [
          { val: s.pensionPct, color: C.gold },
          { val: s.healthPct, color: C.cyan },
          { val: s.interestPct, color: C.red },
          { val: res.nonAgeSpendPct, color: '#455470' }
        ];
        var yTop = pad.t + ph;
        for (var p = 0; p < parts.length; p++) {
          var bh = (parts[p].val / maxY) * ph;
          yTop -= bh;
          ctx.fillStyle = parts[p].color;
          ctx.fillRect(bx, yTop, bw, bh);
        }

        ctx.font = fontSpec(narrow, 11, true);
        ctx.fillStyle = s.fiscalGapPct < 0 ? C.red : C.ink;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(f1(s.mandatoryPct + res.nonAgeSpendPct) + '%', cx, Math.max(pad.t + 12, yTop - 4));

        ctx.font = fontSpec(narrow, 11, false);
        ctx.fillStyle = C.mute;
        ctx.textBaseline = 'top';
        ctx.fillText(item.lbl, cx, pad.t + ph + 8);
      });
    }

    var t6 = T().ch6 || {};
    var cur = res.current;
    setRead('r6', [
      { lbl: t6.rdAge || 'Pension + Health', val: f1(cur.ageTotalPct) + '%', cls: 'g' },
      { lbl: t6.rdRoom || 'Discretionary Room', val: f1(cur.discretionaryRoomPct) + '%', cls: cur.discretionaryRoomPct < 5 ? 'r' : 'c' },
      { lbl: t6.rdGap || 'Primary Budget Gap', val: fs1(cur.fiscalGapPct) + '%', cls: cur.fiscalGapPct < 0 ? 'r' : 'n' },
      { lbl: t6.rdNpv || 'Implicit 20y Gap', val: f0(res.implicitPaygNpvPct) + '%', cls: res.implicitPaygNpvPct > 40 ? 'r' : 'v' }
    ]);

    var sayKey = 'sayBalanced';
    if (res.regime === 'negative_discretionary') sayKey = 'sayNeg';
    else if (res.regime === 'severe_squeeze' || res.regime === 'mild_squeeze') sayKey = 'saySqueeze';
    $('y6').innerHTML = fmt(t6[sayKey] || '', {
      age: f1(cur.ageTotalPct),
      room: f1(cur.discretionaryRoomPct),
      gap: fs1(cur.fiscalGapPct),
      npv: f0(res.implicitPaygNpvPct)
    });
  }

  // ---------- CH7: Historical Debt Reduction Waterfall ----------
  function getHMode() {
    var els = document.querySelectorAll('input[name="hmode"]');
    for (var i = 0; i < els.length; i++) {
      if (els[i].checked) return els[i].value;
    }
    return 'us_ww2';
  }

  function draw7() {
    var mode = getHMode();
    var box = $('c7CustomBox');
    if (box) box.classList.toggle('hidden', mode !== 'custom');

    var pb = parseFloat($('c7Pb').value);
    var gRate = parseFloat($('c7G').value);
    var inf = parseFloat($('c7Inf').value);
    var cut = parseFloat($('c7Cut').value);
    $('o7Pb').textContent = fs2(pb) + '%';
    $('o7G').textContent = f2(gRate) + '%';
    $('o7Inf').textContent = f1(inf) + '%';
    $('o7Cut').textContent = f0(cut) + '%';

    var res = M.historicalDecomp({
      presetId: mode,
      startDebt: 110,
      years: 10,
      primaryPct: pb,
      growthPct: gRate,
      realRatePct: 2.0,
      inflationPct: inf,
      haircutPct: cut
    });

    if (visibleSet.cv7) {
      var g = setupCanvas($('cv7'));
      var ctx = g.ctx, w = g.w, h = g.h, narrow = g.narrow;
      var t7 = T().ch7 || {};
      var pad = { l: narrow ? 40 : 48, r: 16, t: 32, b: 42 };
      var pw = w - pad.l - pad.r;
      var ph = h - pad.t - pad.b;

      var steps = [
        { key: 'start', lbl: t7.wStart || 'Start', val: res.startDebt, base: 0, total: true, color: C.violet },
        { key: 'pri', lbl: t7.wPri || 'Primary', val: res.primaryContrib, total: false },
        { key: 'gro', lbl: t7.wGro || 'Growth', val: res.growthContrib, total: false },
        { key: 'int', lbl: t7.wInt || 'Interest', val: res.interestContrib, total: false },
        { key: 'inf', lbl: t7.wInf || 'Inflation', val: res.inflationContrib, total: false },
        { key: 'cut', lbl: t7.wCut || 'Haircut', val: res.restructuringContrib, total: false },
        { key: 'end', lbl: t7.wEnd || 'End', val: res.endDebt, base: 0, total: true, color: res.endDebt < res.startDebt ? C.green : C.red }
      ];

      var cur = res.startDebt;
      var maxY = res.startDebt;
      for (var i = 1; i < steps.length - 1; i++) {
        var next = cur + steps[i].val;
        steps[i].lo = Math.max(0, Math.min(cur, next));
        steps[i].hi = Math.max(0, Math.max(cur, next));
        steps[i].color = steps[i].val <= 0 ? C.green : C.red;
        if (steps[i].val === 0) steps[i].color = C.dim;
        maxY = Math.max(maxY, steps[i].hi);
        cur = next;
      }
      steps[0].lo = 0; steps[0].hi = res.startDebt;
      steps[6].lo = 0; steps[6].hi = res.endDebt;
      maxY = Math.max(120, Math.ceil((maxY * 1.15) / 20) * 20);

      drawLinePlotAxes(ctx, pad, pw, ph, 0, maxY, 4, '%', narrow);

      function yOf(v) { return pad.t + ph - (Math.min(maxY, Math.max(0, v)) / maxY) * ph; }
      var slot = pw / steps.length;
      var bw = Math.max(14, slot * 0.56);

      for (var i = 0; i < steps.length; i++) {
        var st = steps[i];
        var cx = pad.l + i * slot + slot / 2;
        var bx = cx - bw / 2;
        var yTop = yOf(st.hi);
        var yBot = yOf(st.lo);
        var bh = Math.max(2, yBot - yTop);
        ctx.fillStyle = st.color;
        ctx.fillRect(bx, yTop, bw, bh);

        // Connector line
        if (i < steps.length - 1) {
          var nextRef = i === 0 ? st.hi : (st.val >= 0 ? st.hi : st.lo);
          var yc = yOf(nextRef);
          ctx.strokeStyle = C.dim;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(bx + bw, yc);
          ctx.lineTo(pad.l + (i + 1) * slot + (slot - bw) / 2, yc);
          ctx.stroke();
        }

        ctx.font = fontSpec(narrow, 11, true);
        ctx.fillStyle = st.total ? st.color : (st.val <= 0 ? C.green : C.red);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        var valTxt = st.total ? f0(st.val) + '%' : (st.val >= 0 ? '+' : '') + f0(st.val);
        ctx.fillText(valTxt, cx, Math.max(pad.t + 12, yTop - 4));

        ctx.font = fontSpec(narrow, 10, false);
        ctx.fillStyle = C.mute;
        ctx.textBaseline = 'top';
        ctx.fillText(st.lbl, cx, pad.t + ph + 8);
      }
    }

    var t7 = T().ch7 || {};
    setRead('r7', [
      { lbl: t7.rdDrop || 'Net Change', val: fs1(res.endDebt - res.startDebt) + ' pp', cls: res.endDebt <= res.startDebt ? 'n' : 'r' },
      { lbl: t7.rdPri || 'Primary Effect', val: fs1(res.primaryContrib) + ' pp', cls: res.primaryContrib <= 0 ? 'n' : 'r' },
      { lbl: t7.rdGro || 'Growth + Inf', val: fs1(res.growthContrib + res.inflationContrib) + ' pp', cls: 'c' },
      { lbl: t7.rdEnd || 'Ending Debt', val: f1(res.endDebt) + '%', cls: res.endDebt < res.startDebt ? 'n' : 'g' }
    ]);

    var sayKey = 'sayCustom';
    if (res.presetId === 'us_ww2') sayKey = 'sayUs';
    else if (res.presetId === 'canada_1990s') sayKey = 'sayCa';
    else if (res.presetId === 'em_restruct') sayKey = 'sayEm';
    $('y7').innerHTML = fmt(t7[sayKey] || '', {
      start: f0(res.startDebt),
      end: f1(res.endDebt),
      years: f0(res.years),
      pri: fs1(res.primaryContrib),
      gro: fs1(res.growthContrib),
      inf: fs1(res.inflationContrib),
      cut: fs1(res.restructuringContrib)
    });
  }

  // ---------- CH8: Frontier Nov 2026 ----------
  function getCountryRadio() {
    var els = document.querySelectorAll('input[name="fcountry"]');
    for (var i = 0; i < els.length; i++) {
      if (els[i].checked) return els[i].value;
    }
    return 'us';
  }

  function renderFrontierTable() {
    var body = $('frTableBody');
    if (!body) return;
    var t8 = T().ch8 || {};
    var rows = t8.tableRows || [];
    var html = '';
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      html += '<tr><td>' + r.c + '</td><td class="n">' + r.debt + '</td><td class="n">' + r.int + '</td><td class="n">' + r.wam + '</td><td>' + r.note + '</td></tr>';
    }
    body.innerHTML = html;
  }

  function draw8() {
    var countryId = getCountryRadio();
    var yieldShiftBps = parseFloat($('c8Yield').value);
    var growthShiftPct = parseFloat($('c8Grow').value);
    $('o8Yield').textContent = (yieldShiftBps >= 0 ? '+' : '') + f0(yieldShiftBps) + ' bps';
    $('o8Grow').textContent = fs2(growthShiftPct) + ' pp';

    var res = M.frontierStress({
      countryId: countryId,
      yieldShiftBps: yieldShiftBps,
      growthShiftPct: growthShiftPct
    });

    if (visibleSet.cv8) {
      var g = setupCanvas($('cv8'));
      var ctx = g.ctx, w = g.w, h = g.h, narrow = g.narrow;
      var t8 = T().ch8 || {};
      var pad = { l: narrow ? 40 : 48, r: 16, t: 32, b: 38 };
      var pw = w - pad.l - pad.r;
      var ph = h - pad.t - pad.b;

      var items = res.allStressed;
      var maxInt = 7.0;
      for (var i = 0; i < items.length; i++) {
        maxInt = Math.max(maxInt, items[i].stressedInterest5y, items[i].baseInterestPct);
      }
      maxInt = Math.ceil(maxInt);
      drawLinePlotAxes(ctx, pad, pw, ph, 0, maxInt, 4, '%', narrow);

      var names = t8.shortNames || { us: 'US', jp: 'JP', ea: 'EA', cn: 'CN', em: 'EM' };
      var slot = pw / items.length;
      var bw = Math.max(12, Math.min(28, slot * 0.30));

      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        var cx = pad.l + i * slot + slot / 2;
        var active = it.id === countryId;

        if (active) {
          ctx.fillStyle = 'rgba(233,185,73,0.08)';
          ctx.fillRect(pad.l + i * slot + 4, pad.t, slot - 8, ph);
        }

        var hBase = (it.baseInterestPct / maxInt) * ph;
        var hStress = (it.stressedInterest5y / maxInt) * ph;
        ctx.fillStyle = C.cyan;
        ctx.fillRect(cx - bw - 2, pad.t + ph - hBase, bw, hBase);
        ctx.fillStyle = it.stressedInterest5y >= 4.0 ? C.red : C.gold;
        ctx.fillRect(cx + 2, pad.t + ph - hStress, bw, hStress);

        ctx.font = fontSpec(narrow, 11, active);
        ctx.fillStyle = active ? C.gold : C.ink;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(f1(it.stressedInterest5y) + '%', cx + 2 + bw / 2, Math.max(pad.t + 12, pad.t + ph - hStress - 4));

        ctx.fillStyle = active ? C.gold : C.mute;
        ctx.textBaseline = 'top';
        ctx.fillText(names[it.id] || it.id.toUpperCase(), cx, pad.t + ph + 8);
      }
    }

    var t8 = T().ch8 || {};
    setRead('r8', [
      { lbl: t8.rdBaseInt || '2026 Interest', val: f2(res.baseInterestPct) + '%', cls: 'c' },
      { lbl: t8.rdStrInt || '5y Stressed Int', val: f2(res.stressedInterest5y) + '%', cls: res.stressedInterest5y >= 4.0 ? 'r' : 'g' },
      { lbl: t8.rdRg || 'Stressed r − g', val: fs2(res.rgGapPct) + ' pp', cls: res.rgGapPct <= 0 ? 'n' : 'r' },
      { lbl: t8.rdEffort || 'Fiscal Shift Req', val: fs1(res.fiscalEffortNeededPct) + ' pp', cls: res.fiscalEffortNeededPct >= 4.0 ? 'r' : 'g' }
    ]);

    var cname = (t8.countryNames && t8.countryNames[countryId]) || countryId;
    var sayKey = 'sayManageable';
    if (res.regime === 'steep_adjustment') sayKey = 'saySteep';
    else if (res.regime === 'positive_rg') sayKey = 'sayPosRg';
    $('y8').innerHTML = fmt(t8[sayKey] || '', {
      name: cname,
      debt: f1(res.baseDebtPct),
      int0: f2(res.baseInterestPct),
      int5: f2(res.stressedInterest5y),
      roll: f0(res.roll5yPct),
      rg: fs2(res.rgGapPct),
      eff: fs1(res.fiscalEffortNeededPct)
    });
  }

  // ---------- I18N & Wiring ----------
  var visibleSet = { cv1: true, cv2: true, cv3: true, cv4: true, cv5: true, cv6: true, cv7: true, cv8: true };
  var draws = { cv1: draw1, cv2: draw2, cv3: draw3, cv4: draw4, cv5: draw5, cv6: draw6, cv7: draw7, cv8: draw8 };

  function applyI18n() {
    var dict = T();
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
    var pgTitle = getPath(dict, 'meta.title');
    if (pgTitle) document.title = pgTitle;
    var pgDesc = getPath(dict, 'meta.description');
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && pgDesc) metaDesc.setAttribute('content', pgDesc);

    var els = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < els.length; i++) {
      els[i].textContent = getPath(dict, els[i].getAttribute('data-i18n'));
    }
    var hEls = document.querySelectorAll('[data-i18n-html]');
    for (var i = 0; i < hEls.length; i++) {
      hEls[i].innerHTML = getPath(dict, hEls[i].getAttribute('data-i18n-html'));
    }
    var aEls = document.querySelectorAll('[data-i18n-aria]');
    for (var i = 0; i < aEls.length; i++) {
      aEls[i].setAttribute('aria-label', getPath(dict, aEls[i].getAttribute('data-i18n-aria')));
    }

    var btns = document.querySelectorAll('#langToggle button');
    for (var i = 0; i < btns.length; i++) {
      btns[i].setAttribute('aria-pressed', btns[i].getAttribute('data-lang') === lang ? 'true' : 'false');
    }

    setLegend('lg1', [
      { label: getPath(dict, 'ch1.lgRev'), color: C.cyan },
      { label: getPath(dict, 'ch1.lgPri'), color: C.gold },
      { label: getPath(dict, 'ch1.lgInt'), color: C.red },
      { label: getPath(dict, 'ch1.lgDebt'), color: C.violet }
    ]);
    setLegend('lg2', [
      { label: getPath(dict, 'ch2.lgPath'), color: C.gold },
      { label: getPath(dict, 'ch2.lgZero'), color: C.cyan, kind: 'dash' },
      { label: getPath(dict, 'ch2.lgFlat'), color: C.dim, kind: 'dash' }
    ]);
    setLegend('lg3', [
      { label: getPath(dict, 'ch3.lgDom'), color: C.cyan },
      { label: getPath(dict, 'ch3.lgFx'), color: C.red },
      { label: getPath(dict, 'ch3.lgRes'), color: C.green }
    ]);
    setLegend('lg4', [
      { label: getPath(dict, 'ch4.lgMat3'), color: C.cyan },
      { label: getPath(dict, 'ch4.lgMatLater'), color: '#344b66' },
      { label: getPath(dict, 'ch4.lgEff'), color: C.gold },
      { label: getPath(dict, 'ch4.lgNew'), color: C.red, kind: 'dash' }
    ]);
    setLegend('lg5', [
      { label: getPath(dict, 'ch5.lgZlb'), color: C.cyan },
      { label: getPath(dict, 'ch5.lgNorm'), color: C.gold },
      { label: getPath(dict, 'ch5.lgDown'), color: C.green },
      { label: getPath(dict, 'ch5.lgUp'), color: C.red }
    ]);
    setLegend('lg6', [
      { label: getPath(dict, 'ch6.lgPen'), color: C.gold },
      { label: getPath(dict, 'ch6.lgHlth'), color: C.cyan },
      { label: getPath(dict, 'ch6.lgInt'), color: C.red },
      { label: getPath(dict, 'ch6.lgRev'), color: C.green, kind: 'dash' }
    ]);
    setLegend('lg7', [
      { label: getPath(dict, 'ch7.lgStock'), color: C.violet },
      { label: getPath(dict, 'ch7.lgDown'), color: C.green },
      { label: getPath(dict, 'ch7.lgUp'), color: C.red }
    ]);
    setLegend('lg8', [
      { label: getPath(dict, 'ch8.lgBase'), color: C.cyan },
      { label: getPath(dict, 'ch8.lgStress'), color: C.gold }
    ]);

    renderFrontierTable();
    drawAll();
  }

  function drawAll() {
    draw1(); draw2(); draw3(); draw4(); draw5(); draw6(); draw7(); draw8();
  }

  function bindRange(id, fn) {
    var el = $(id);
    if (!el) return;
    el.addEventListener('input', fn);
    el.addEventListener('change', fn);
  }

  function init() {
    var btns = document.querySelectorAll('#langToggle button');
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function () {
        var next = this.getAttribute('data-lang');
        if (next && next !== lang) {
          lang = next;
          storeLang(lang);
          applyI18n();
        }
      });
    }

    bindRange('c1Rev', draw1);
    bindRange('c1Pri', draw1);
    bindRange('c1Debt', draw1);
    bindRange('c1Rate', draw1);

    bindRange('c2D0', draw2);
    bindRange('c2R', draw2);
    bindRange('c2G', draw2);
    bindRange('c2Pb', draw2);
    $('b2Soft').addEventListener('click', function () {
      $('c2D0').value = '100'; $('c2R').value = '2.5'; $('c2G').value = '4.5'; $('c2Pb').value = '-1.0';
      draw2();
    });
    $('b2Snow').addEventListener('click', function () {
      $('c2D0').value = '120'; $('c2R').value = '5.5'; $('c2G').value = '3.0'; $('c2Pb').value = '-2.0';
      draw2();
    });
    $('b2Stab').addEventListener('click', function () {
      $('c2D0').value = '120'; $('c2R').value = '5.0'; $('c2G').value = '3.5';
      var pbStar = Math.round((120 * ((0.05 - 0.035) / 1.035)) * 4) / 4;
      $('c2Pb').value = String(pbStar);
      draw2();
    });

    bindRange('c3Fx', draw3);
    bindRange('c3Dep', draw3);
    bindRange('c3Res', draw3);
    $('b3Own').addEventListener('click', function () {
      $('c3Fx').value = '0'; $('c3Dep').value = '40'; $('c3Res').value = '6.0';
      draw3();
    });
    $('b3Mix').addEventListener('click', function () {
      $('c3Fx').value = '35'; $('c3Dep').value = '30'; $('c3Res').value = '5.5';
      draw3();
    });
    $('b3Fx').addEventListener('click', function () {
      $('c3Fx').value = '75'; $('c3Dep').value = '55'; $('c3Res').value = '2.5';
      draw3();
    });

    bindRange('c4Wam', draw4);
    bindRange('c4Yield', draw4);
    bindRange('c4Cb', draw4);
    bindRange('c4Def', draw4);

    bindRange('c5Stim', draw5);
    bindRange('c5Slack', draw5);
    bindRange('c5Open', draw5);
    $('c5Zlb').addEventListener('change', draw5);

    bindRange('c6Work', draw6);
    bindRange('c6Rep', draw6);
    bindRange('c6Hlth', draw6);
    bindRange('c6Debt', draw6);

    var hModes = document.querySelectorAll('input[name="hmode"]');
    for (var i = 0; i < hModes.length; i++) {
      hModes[i].addEventListener('change', draw7);
    }
    bindRange('c7Pb', draw7);
    bindRange('c7G', draw7);
    bindRange('c7Inf', draw7);
    bindRange('c7Cut', draw7);

    var fCountries = document.querySelectorAll('input[name="fcountry"]');
    for (var i = 0; i < fCountries.length; i++) {
      fCountries[i].addEventListener('change', draw8);
    }
    bindRange('c8Yield', draw8);
    bindRange('c8Grow', draw8);

    if ('IntersectionObserver' in window) {
      visibleSet = {};
      var io = new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          var id = entries[i].target.id;
          visibleSet[id] = entries[i].isIntersecting;
          if (entries[i].isIntersecting && draws[id]) {
            draws[id]();
          }
        }
      }, { rootMargin: '250px 0px' });
      Object.keys(draws).forEach(function (id) {
        var el = $(id);
        if (el) io.observe(el);
      });
    }

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(drawAll, 60);
    });

    applyI18n();
    window.__ready = true;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
