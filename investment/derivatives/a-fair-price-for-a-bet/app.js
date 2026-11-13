(function () {
  'use strict';

  const M = window.DerivModels;
  const I18N = window.ESSAY_I18N || {};
  const $ = (id) => document.getElementById(id);
  const radioVal = (name, def) => {
    const el = document.querySelector(`input[name="${name}"]:checked`);
    return el ? el.value : def;
  };
  const fmt = (tpl, vars) => {
    if (!tpl) return '';
    return tpl.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? String(vars[k]) : ''));
  };

  let curLang = 'zh';
  try {
    const saved = localStorage.getItem('knowledge-lang');
    if (saved === 'en' && I18N.en) curLang = 'en';
  } catch (e) { /* ignore storage errors */ }

  const dict = () => I18N[curLang] || I18N.zh || {};
  const t = (key, fallback) => {
    const parts = key.split('.');
    let cur = dict();
    for (let i = 0; i < parts.length; i++) {
      if (cur && Object.prototype.hasOwnProperty.call(cur, parts[i])) cur = cur[parts[i]];
      else { cur = null; break; }
    }
    if (cur !== null && cur !== undefined) return cur;
    const flat = dict()[key];
    return flat !== undefined ? flat : (fallback !== undefined ? fallback : key);
  };

  const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Theme & Palette ── */
  const cssVar = (name, fb) => {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fb;
  };
  const pal = () => ({
    ink: cssVar('--ink', '#18181b'),
    ink2: cssVar('--ink-2', '#3f3f46'),
    muted: cssVar('--ink-3', '#71717a'),
    rule: cssVar('--line', '#e4e4e7'),
    paper: cssVar('--paper', '#ffffff'),
    paper2: cssVar('--paper-2', '#f4f4f5'),
    cyan: '#0284c7',
    cyanSoft: 'rgba(2, 132, 199, 0.14)',
    amber: '#d97706',
    amberSoft: 'rgba(217, 119, 6, 0.16)',
    emerald: '#059669',
    emeraldSoft: 'rgba(5, 150, 105, 0.14)',
    rose: '#e11d48',
    roseSoft: 'rgba(225, 29, 72, 0.14)',
    slate: '#64748b'
  });

  /* ── Canvas Helpers with Anti-Overlap Hygiene ── */
  function fit(cv) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(240, Math.round(cv.clientWidth || 600));
    const h = Math.max(180, Math.round(cv.clientHeight || 280));
    if (cv.width !== w * dpr || cv.height !== h * dpr) {
      cv.width = w * dpr;
      cv.height = h * dpr;
    }
    const c = cv.getContext('2d');
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, w, h);
    return { c, w, h };
  }

  const overlaps = (a, b, pad = 2) => !(a.x + a.w + pad <= b.x || b.x + b.w + pad <= a.x || a.y + a.h + pad <= b.y || b.y + b.h + pad <= a.y);

  function safeText(c, txt, x, y, opts, placed) {
    const o = opts || {};
    const align = o.align || 'left';
    const font = o.font || '11px -apple-system, BlinkMacSystemFont, sans-serif';
    c.save();
    c.font = font;
    c.fillStyle = o.color || pal().ink2;
    c.textBaseline = o.base || 'middle';
    const tw = c.measureText(txt).width;
    let lx = x;
    if (align === 'center') lx = x - tw / 2;
    else if (align === 'right') lx = x - tw;
    const minX = o.minX != null ? o.minX : 4;
    const maxX = o.maxX != null ? o.maxX : c.canvas.clientWidth - 4;
    lx = Math.max(minX, Math.min(lx, maxX - tw));
    const minY = o.minY != null ? o.minY : 10;
    const maxY = o.maxY != null ? o.maxY : c.canvas.clientHeight - 8;
    const cy = Math.max(minY, Math.min(y, maxY));
    const box = { x: lx, y: cy - 7, w: tw, h: 14 };
    if (placed) {
      for (let i = 0; i < placed.length; i++) {
        if (overlaps(box, placed[i], 3)) {
          if (o.allowShiftY) {
            const tryUp = { x: lx, y: box.y - 14, w: tw, h: 14 };
            const tryDn = { x: lx, y: box.y + 14, w: tw, h: 14 };
            if (tryUp.y >= minY - 6 && placed.every((p) => !overlaps(tryUp, p, 3))) {
              box.y = tryUp.y;
            } else if (tryDn.y + 14 <= maxY + 6 && placed.every((p) => !overlaps(tryDn, p, 3))) {
              box.y = tryDn.y;
            } else {
              c.restore();
              return false;
            }
          } else {
            c.restore();
            return false;
          }
        }
      }
      placed.push(box);
    }
    c.textAlign = 'left';
    c.fillText(txt, box.x, box.y + 7);
    c.restore();
    return true;
  }

  function drawPanelTitle(c, title, rx, ry, rw, placed) {
    const font = rw < 240 ? '600 10.5px -apple-system, sans-serif' : '600 11.5px -apple-system, sans-serif';
    safeText(c, title, rx + 2, ry + 9, { font, color: pal().ink, minX: rx, maxX: rx + rw }, placed);
  }

  function drawAxesGrid(c, box, xMin, xMax, yMin, yMax, opts) {
    const o = opts || {};
    const P = pal();
    const xMap = (v) => box.x + ((v - xMin) / (xMax - xMin || 1)) * box.w;
    const yMap = (v) => box.y + box.h - ((v - yMin) / (yMax - yMin || 1)) * box.h;

    c.save();
    c.strokeStyle = P.rule;
    c.lineWidth = 1;
    const ny = o.ny || (box.h < 120 ? 3 : 4);
    let lastY = -999;
    for (let i = 0; i <= ny; i++) {
      const yv = yMin + (i / ny) * (yMax - yMin);
      const yp = yMap(yv);
      c.beginPath();
      c.moveTo(box.x, yp);
      c.lineTo(box.x + box.w, yp);
      c.stroke();
      if (Math.abs(yp - lastY) >= 16) {
        const lbl = o.yFmt ? o.yFmt(yv) : yv.toFixed(Math.abs(yMax - yMin) < 5 ? 1 : 0);
        safeText(c, lbl, box.x - 5, yp, {
          align: 'right',
          font: '10px ui-monospace, SFMono-Regular, monospace',
          color: P.muted,
          minX: 2,
          maxX: box.x + 2
        });
        lastY = yp;
      }
    }

    const nx = o.nx || (box.w < 220 ? 3 : 4);
    let lastXRight = -999;
    for (let i = 0; i <= nx; i++) {
      const xv = o.xCustom ? o.xCustom[i] : xMin + (i / nx) * (xMax - xMin);
      if (xv === undefined) continue;
      const xp = xMap(xv);
      c.beginPath();
      c.moveTo(xp, box.y);
      c.lineTo(xp, box.y + box.h);
      c.stroke();
      const lbl = o.xFmt ? o.xFmt(xv) : String(Math.round(xv));
      c.font = '10px ui-monospace, SFMono-Regular, monospace';
      const tw = c.measureText(lbl).width;
      const left = Math.max(box.x - 4, Math.min(xp - tw / 2, box.x + box.w - tw + 4));
      if (left > lastXRight + 8) {
        c.fillStyle = P.muted;
        c.textAlign = 'left';
        c.textBaseline = 'top';
        c.fillText(lbl, left, box.y + box.h + 5);
        lastXRight = left + tw;
      }
    }
    c.restore();
    return { xMap, yMap };
  }

  function splitTwo(w, h) {
    if (w < 500) {
      const h1 = Math.floor((h - 14) / 2);
      return [
        { x: 0, y: 0, w, h: h1 },
        { x: 0, y: h1 + 14, w, h: h - h1 - 14 }
      ];
    }
    const w1 = Math.floor((w - 18) / 2);
    return [
      { x: 0, y: 0, w: w1, h },
      { x: w1 + 18, y: 0, w: w - w1 - 18, h }
    ];
  }

  /* ══════════════════════════════════════════════
     MODEL 1 · Forward Cost of Carry
     ══════════════════════════════════════════════ */
  function drawM1() {
    const cv = $('m1Cv');
    if (!cv) return;
    const Fquote = parseFloat($('m1Quote').value);
    const rPct = parseFloat($('m1R').value);
    const qPct = parseFloat($('m1Q').value);
    $('m1Quoteo').textContent = Fquote.toFixed(2);
    $('m1Ro').textContent = rPct.toFixed(1) + '%';
    $('m1Qo').textContent = qPct.toFixed(1) + '%';

    const d = M.forward.compute({ S0: 100, rPct, qPct, T: 1, Fquote });
    $('m1Fair').textContent = d.Ffair.toFixed(2);
    $('m1Quoted').textContent = d.Fquote.toFixed(2);
    $('m1Arb').textContent = (d.arbProfitT >= 0.05 ? '+' : '') + d.arbProfitT.toFixed(2);
    if (d.regime === 'overpriced') $('m1Act').textContent = t('say.ch1ActOver');
    else if (d.regime === 'underpriced') $('m1Act').textContent = t('say.ch1ActUnder');
    else $('m1Act').textContent = t('say.ch1ActFair');

    const sayTpl = d.regime === 'overpriced' ? t('say.ch1Over') : (d.regime === 'underpriced' ? t('say.ch1Under') : t('say.ch1Fair'));
    $('m1Say').innerHTML = fmt(sayTpl, {
      quote: d.Fquote.toFixed(2),
      fair: d.Ffair.toFixed(2),
      diff: Math.abs(d.diff).toFixed(2),
      borrow: d.borrowToday.toFixed(2),
      shares: d.sharesToday.toFixed(3),
      repay: d.repayT.toFixed(2),
      arb: d.arbProfitT.toFixed(2),
      r: rPct.toFixed(1)
    });

    const { c, w, h } = fit(cv);
    const P = pal();
    const placed = [];
    const [r1, r2] = splitTwo(w, h);

    // Left panel: price comparison bars (S0, F*, Fquote)
    drawPanelTitle(c, t('cv.ch1LeftTitle'), r1.x, r1.y, r1.w, placed);
    const b1 = { x: r1.x + 42, y: r1.y + 24, w: r1.w - 54, h: r1.h - 48 };
    const { xMap, yMap } = drawAxesGrid(c, b1, 0, 3, 90, 118, {
      nx: 2,
      xCustom: [0.5, 1.5, 2.5],
      xFmt: (v) => (v < 1 ? 'S0' : v < 2 ? 'F*' : 'F'),
      ny: b1.h < 100 ? 3 : 4
    });

    const items = [
      { idx: 0.5, val: d.S0, col: P.slate, lbl: fmt(t('cv.ch1SpotLbl'), { v: d.S0.toFixed(0) }) },
      { idx: 1.5, val: d.Ffair, col: P.cyan, lbl: fmt(t('cv.ch1FairLbl'), { v: d.Ffair.toFixed(2) }) },
      { idx: 2.5, val: d.Fquote, col: P.amber, lbl: fmt(t('cv.ch1QuoteLbl'), { v: d.Fquote.toFixed(2) }) }
    ];
    const barW = Math.min(38, b1.w * 0.18);
    items.forEach((it) => {
      const cx = xMap(it.idx);
      const topY = yMap(Math.min(118, Math.max(90, it.val)));
      const botY = yMap(90);
      c.fillStyle = it.col;
      c.fillRect(cx - barW / 2, topY, barW, Math.max(3, botY - topY));
      safeText(c, it.val.toFixed(2), cx, Math.max(b1.y + 8, topY - 9), {
        align: 'center',
        font: '600 10.5px ui-monospace, monospace',
        color: it.col,
        minX: r1.x + 4,
        maxX: r1.x + r1.w - 4,
        allowShiftY: true
      }, placed);
    });

    // Right panel: Arbitrage payoff vs S_T (flat line across S_T = 70..130)
    drawPanelTitle(c, t('cv.ch1RightTitle'), r2.x, r2.y, r2.w, placed);
    const b2 = { x: r2.x + 40, y: r2.y + 24, w: r2.w - 52, h: r2.h - 48 };
    const maxY = Math.max(8, Math.ceil(d.arbProfitT + 2));
    const g2 = drawAxesGrid(c, b2, 70, 130, -2, maxY, {
      nx: 3,
      ny: b2.h < 100 ? 3 : 4,
      yFmt: (v) => (v > 0 ? '+' + v.toFixed(0) : v.toFixed(0))
    });
    const y0 = g2.yMap(0);
    c.strokeStyle = P.muted;
    c.setLineDash([4, 3]);
    c.beginPath();
    c.moveTo(b2.x, y0);
    c.lineTo(b2.x + b2.w, y0);
    c.stroke();
    c.setLineDash([]);

    const arbY = g2.yMap(d.arbProfitT);
    c.fillStyle = d.arbProfitT > 0.05 ? P.emeraldSoft : P.cyanSoft;
    c.fillRect(b2.x, Math.min(y0, arbY), b2.w, Math.abs(y0 - arbY));
    c.strokeStyle = d.arbProfitT > 0.05 ? P.emerald : P.cyan;
    c.lineWidth = 2.5;
    c.beginPath();
    c.moveTo(b2.x, arbY);
    c.lineTo(b2.x + b2.w, arbY);
    c.stroke();

    const tagTxt = d.arbProfitT > 0.05 ? fmt(t('cv.ch1NetFlat'), { v: d.arbProfitT.toFixed(2) }) : t('cv.ch1Zero');
    safeText(c, tagTxt, b2.x + b2.w / 2, Math.max(b2.y + 10, arbY - 10), {
      align: 'center',
      font: '600 11px -apple-system, sans-serif',
      color: d.arbProfitT > 0.05 ? P.emerald : P.muted,
      minX: r2.x + 4,
      maxX: r2.x + r2.w - 4
    }, placed);
  }

  /* ══════════════════════════════════════════════
     MODEL 2 · Payoff Curves & Put-Call Parity
     ══════════════════════════════════════════════ */
  function drawM2() {
    const cv = $('m2Cv');
    if (!cv) return;
    const strategy = radioVal('m2Strat', 'call');
    const ST = parseFloat($('m2ST').value);
    const K = parseFloat($('m2K').value);
    const sigmaPct = parseFloat($('m2Sig').value);
    $('m2STo').textContent = ST.toFixed(0);
    $('m2Ko').textContent = K.toFixed(0);
    $('m2Sigo').textContent = sigmaPct.toFixed(0) + '%';

    const d = M.payoffParity.compute({ strategy, S0: 100, K, rPct: 4, qPct: 1, T: 1, sigmaPct, ST });
    $('m2Cost').textContent = d.curCost.toFixed(2);
    $('m2Pnl').textContent = (d.curPnl >= 0 ? '+' : '') + d.curPnl.toFixed(2);
    $('m2PortA').textContent = d.portACost.toFixed(2);
    $('m2PortB').textContent = d.portBCost.toFixed(2);
    $('m2Say').innerHTML = fmt(t('say.ch2Desc'), {
      st: ST.toFixed(0),
      payoff: d.curPayoff.toFixed(2),
      cost: d.curCost.toFixed(2),
      pnl: (d.curPnl >= 0 ? '+' : '') + d.curPnl.toFixed(2),
      portA: d.portACost.toFixed(2),
      portB: d.portBCost.toFixed(2),
      diff: Math.abs(d.parityDiff).toFixed(4)
    });

    const { c, w, h } = fit(cv);
    const P = pal();
    const placed = [];
    const [r1, r2] = splitTwo(w, h);

    // Left: payoff & P&L curves
    drawPanelTitle(c, t('cv.ch2LeftTitle'), r1.x, r1.y, r1.w, placed);
    let yMin = -25, yMax = 55;
    d.curve.forEach((pt) => {
      yMin = Math.min(yMin, pt.pnl - 5, pt.payoff - 5);
      yMax = Math.max(yMax, pt.pnl + 8, pt.payoff + 8);
    });
    if (strategy === 'protPut' || strategy === 'covCall') {
      yMin = -45; yMax = Math.max(yMax, 155);
    }
    const b1 = { x: r1.x + 40, y: r1.y + 24, w: r1.w - 50, h: r1.h - 48 };
    const g1 = drawAxesGrid(c, b1, 50, 160, yMin, yMax, { nx: 4, ny: b1.h < 100 ? 3 : 4 });

    // Zero line
    if (yMin < 0 && yMax > 0) {
      const zy = g1.yMap(0);
      c.strokeStyle = P.muted;
      c.setLineDash([3, 3]);
      c.beginPath(); c.moveTo(b1.x, zy); c.lineTo(b1.x + b1.w, zy); c.stroke();
      c.setLineDash([]);
    }
    // Payoff dashed
    c.strokeStyle = P.slate;
    c.lineWidth = 1.6;
    c.setLineDash([5, 4]);
    c.beginPath();
    d.curve.forEach((pt, idx) => {
      const px = g1.xMap(pt.s), py = g1.yMap(pt.payoff);
      if (idx === 0) c.moveTo(px, py); else c.lineTo(px, py);
    });
    c.stroke();
    c.setLineDash([]);

    // P&L solid
    c.strokeStyle = P.cyan;
    c.lineWidth = 2.4;
    c.beginPath();
    d.curve.forEach((pt, idx) => {
      const px = g1.xMap(pt.s), py = g1.yMap(pt.pnl);
      if (idx === 0) c.moveTo(px, py); else c.lineTo(px, py);
    });
    c.stroke();

    // Current S_T marker
    const mx = g1.xMap(ST), my = g1.yMap(d.curPnl);
    c.strokeStyle = P.amber;
    c.lineWidth = 1;
    c.beginPath(); c.moveTo(mx, b1.y); c.lineTo(mx, b1.y + b1.h); c.stroke();
    c.fillStyle = P.amber;
    c.beginPath(); c.arc(mx, my, 4.5, 0, Math.PI * 2); c.fill();
    safeText(c, (d.curPnl >= 0 ? '+' : '') + d.curPnl.toFixed(1), mx + 6, Math.max(b1.y + 10, my - 8), {
      font: '600 10.5px ui-monospace, monospace',
      color: P.amber,
      minX: r1.x + 6,
      maxX: r1.x + r1.w - 4,
      allowShiftY: true
    }, placed);

    // Right: stacked bar for Portfolio A (C + pvK) vs Portfolio B (P + pvS)
    drawPanelTitle(c, t('cv.ch2RightTitle'), r2.x, r2.y, r2.w, placed);
    const b2 = { x: r2.x + 42, y: r2.y + 24, w: r2.w - 52, h: r2.h - 48 };
    const topBar = Math.max(120, Math.ceil(d.portACost * 1.15));
    const g2 = drawAxesGrid(c, b2, 0, 2, 0, topBar, {
      nx: 1,
      xCustom: [0.55, 1.45],
      xFmt: (v) => (v < 1 ? 'A: C+PV(K)' : 'B: P+PV(S)'),
      ny: b2.h < 100 ? 3 : 4
    });
    const bw = Math.min(44, b2.w * 0.24);
    const xA = g2.xMap(0.55), xB = g2.xMap(1.45);
    const yBase = g2.yMap(0);
    const yPvK = g2.yMap(d.pvK);
    const yTopA = g2.yMap(d.portACost);
    c.fillStyle = P.slate; c.fillRect(xA - bw / 2, yPvK, bw, yBase - yPvK);
    c.fillStyle = P.cyan; c.fillRect(xA - bw / 2, yTopA, bw, yPvK - yTopA);
    safeText(c, d.portACost.toFixed(2), xA, Math.max(b2.y + 8, yTopA - 8), { align: 'center', font: '600 10.5px ui-monospace, monospace', color: P.cyan }, placed);

    const yPvS = g2.yMap(d.pvS);
    const yTopB = g2.yMap(d.portBCost);
    c.fillStyle = P.emerald; c.fillRect(xB - bw / 2, yPvS, bw, yBase - yPvS);
    c.fillStyle = P.amber; c.fillRect(xB - bw / 2, yTopB, bw, yPvS - yTopB);
    safeText(c, d.portBCost.toFixed(2), xB, Math.max(b2.y + 8, yTopB - 8), { align: 'center', font: '600 10.5px ui-monospace, monospace', color: P.amber }, placed);
  }

  /* ══════════════════════════════════════════════
     MODEL 3 · One-Step Binomial Replication
     ══════════════════════════════════════════════ */
  function drawM3() {
    const cv = $('m3Cv');
    if (!cv) return;
    const pRealPct = parseFloat($('m3Preal').value);
    const K = parseFloat($('m3K').value);
    const type = radioVal('m3Type', 'call');
    $('m3Prealo').textContent = pRealPct.toFixed(0) + '%';
    $('m3Ko').textContent = K.toFixed(0);

    const d = M.binomialOne.compute({ S0: 100, K, u: 1.20, d: 0.85, rPct: 4, T: 1, pRealPct, type });
    $('m3Rep').textContent = d.rnPrice.toFixed(2);
    $('m3Exp').textContent = d.realExpPV.toFixed(2);
    $('m3Delta').textContent = (d.delta >= 0 ? '+' : '') + d.delta.toFixed(4);
    $('m3Pstar').textContent = d.pStar.toFixed(4);

    const gapVal = d.realExpPV - d.rnPrice;
    let gapTxt = '';
    if (Math.abs(gapVal) < 0.08) gapTxt = fmt(t('say.ch3GapEq'), { pstar: (d.pStar * 100).toFixed(1) + '%' });
    else if (gapVal > 0) gapTxt = fmt(t('say.ch3GapHi'), { val: gapVal.toFixed(2) });
    else gapTxt = fmt(t('say.ch3GapLo'), { val: Math.abs(gapVal).toFixed(2) });

    $('m3Say').innerHTML = fmt(t('say.ch3Desc'), {
      delta: d.delta.toFixed(4),
      cash: d.B.toFixed(2),
      rep: d.rnPrice.toFixed(2),
      pReal: pRealPct.toFixed(0),
      exp: d.realExpPV.toFixed(2),
      gap: gapTxt
    });

    const { c, w, h } = fit(cv);
    const P = pal();
    const placed = [];
    const [r1, r2] = splitTwo(w, h);

    // Left: 1-step tree diagram
    drawPanelTitle(c, t('cv.ch3LeftTitle'), r1.x, r1.y, r1.w, placed);
    const lx0 = r1.x + Math.max(46, r1.w * 0.22);
    const lx1 = r1.x + r1.w - Math.max(58, r1.w * 0.28);
    const lyMid = r1.y + r1.h * 0.56;
    const lyUp = r1.y + r1.h * 0.30;
    const lyDn = r1.y + r1.h * 0.82;

    c.strokeStyle = P.cyan; c.lineWidth = 2;
    c.beginPath(); c.moveTo(lx0, lyMid); c.lineTo(lx1, lyUp); c.stroke();
    c.strokeStyle = P.slate; c.lineWidth = 1.6;
    c.beginPath(); c.moveTo(lx0, lyMid); c.lineTo(lx1, lyDn); c.stroke();

    [
      { x: lx0, y: lyMid, col: P.ink },
      { x: lx1, y: lyUp, col: P.emerald },
      { x: lx1, y: lyDn, col: P.rose }
    ].forEach((nd) => {
      c.fillStyle = nd.col;
      c.beginPath(); c.arc(nd.x, nd.y, 5, 0, Math.PI * 2); c.fill();
    });

    safeText(c, 'S0=100', lx0, lyMid - 14, { align: 'center', font: '600 10.5px ui-monospace, monospace', color: P.ink, minX: r1.x + 2, maxX: r1.x + r1.w - 2 }, placed);
    safeText(c, 'f=' + d.rnPrice.toFixed(2), lx0, lyMid + 14, { align: 'center', font: '600 10.5px ui-monospace, monospace', color: P.cyan, minX: r1.x + 2, maxX: r1.x + r1.w - 2 }, placed);
    safeText(c, fmt(t('cv.ch3Up'), { su: d.Su.toFixed(0), fu: d.fu.toFixed(1) }), lx1 - 4, lyUp - 13, { align: 'center', font: '600 10.5px ui-monospace, monospace', color: P.emerald, minX: r1.x + 2, maxX: r1.x + r1.w - 2 }, placed);
    safeText(c, fmt(t('cv.ch3Dn'), { sd: d.Sd.toFixed(0), fd: d.fd.toFixed(1) }), lx1 - 4, lyDn + 13, { align: 'center', font: '600 10.5px ui-monospace, monospace', color: P.rose, minX: r1.x + 2, maxX: r1.x + r1.w - 2 }, placed);

    // Right: Bar comparison between No-Arbitrage Replication Cost vs Subjective Expectation PV
    drawPanelTitle(c, t('cv.ch3RightTitle'), r2.x, r2.y, r2.w, placed);
    const b2 = { x: r2.x + 38, y: r2.y + 24, w: r2.w - 48, h: r2.h - 48 };
    const topV = Math.max(25, Math.ceil(Math.max(d.rnPrice, d.realExpPV) * 1.25));
    const g2 = drawAxesGrid(c, b2, 0, 2, 0, topV, {
      nx: 1,
      xCustom: [0.55, 1.45],
      xFmt: (v) => (v < 1 ? t('cv.ch3RepBar') : t('cv.ch3ExpBar')),
      ny: b2.h < 100 ? 3 : 4
    });
    const bw = Math.min(44, b2.w * 0.24);
    const yBase = g2.yMap(0);
    const yRep = g2.yMap(d.rnPrice);
    const yExp = g2.yMap(d.realExpPV);
    c.fillStyle = P.cyan; c.fillRect(g2.xMap(0.55) - bw / 2, yRep, bw, yBase - yRep);
    c.fillStyle = P.amber; c.fillRect(g2.xMap(1.45) - bw / 2, yExp, bw, yBase - yExp);

    safeText(c, d.rnPrice.toFixed(2), g2.xMap(0.55), Math.max(b2.y + 8, yRep - 9), { align: 'center', font: '700 11px ui-monospace, monospace', color: P.cyan }, placed);
    safeText(c, d.realExpPV.toFixed(2), g2.xMap(1.45), Math.max(b2.y + 8, yExp - 9), { align: 'center', font: '700 11px ui-monospace, monospace', color: P.amber }, placed);
  }

  /* ══════════════════════════════════════════════
     MODEL 4 · Multi-Step CRR Tree & Early Exercise
     ══════════════════════════════════════════════ */
  function drawM4() {
    const cv = $('m4Cv');
    if (!cv) return;
    const style = radioVal('m4Style', 'amerPut');
    const steps = parseInt($('m4Steps').value, 10);
    const rPct = parseFloat($('m4R').value);
    const qPct = parseFloat($('m4Q').value);
    $('m4Stepso').textContent = String(steps);
    $('m4Ro').textContent = rPct.toFixed(1) + '%';
    $('m4Qo').textContent = qPct.toFixed(1) + '%';

    const d = M.crrTree.compute({ S0: 100, K: 100, rPct, qPct, sigmaPct: 25, T: 1, steps, style });
    $('m4Price').textContent = d.price.toFixed(2);
    $('m4BS').textContent = d.bsRef.toFixed(2);
    $('m4Prem').textContent = (d.earlyPremium >= 0.005 ? '+' : '') + d.earlyPremium.toFixed(2);
    $('m4EarlyN').textContent = String(d.earlyNodes);

    if (style === 'amerPut') {
      $('m4Say').innerHTML = fmt(t('say.ch4AmerPut'), {
        steps, price: d.price.toFixed(2), prem: d.earlyPremium.toFixed(2), early: d.earlyNodes, bs: d.bsRef.toFixed(2)
      });
    } else if (style === 'amerCall') {
      const nmsg = qPct <= 0.01 ? t('say.ch4AmerCallNoDiv') : fmt(t('say.ch4AmerCallWithDiv'), { q: qPct.toFixed(1), early: d.earlyNodes, prem: d.earlyPremium.toFixed(2) });
      $('m4Say').innerHTML = fmt(t('say.ch4AmerCall'), { q: qPct.toFixed(1), nmsg, price: d.price.toFixed(2), bs: d.bsRef.toFixed(2) });
    } else {
      $('m4Say').innerHTML = fmt(t('say.ch4Euro'), { steps, price: d.price.toFixed(2), bs: d.bsRef.toFixed(2), err: Math.abs(d.price - d.bsRef).toFixed(3) });
    }

    const { c, w, h } = fit(cv);
    const P = pal();
    const placed = [];
    const [r1, r2] = splitTwo(w, h);

    // Left: lattice drawing
    drawPanelTitle(c, t('cv.ch4LeftTitle'), r1.x, r1.y, r1.w, placed);
    const padX = 16, padTop = 26, padBot = 16;
    const tx0 = r1.x + padX, tw = r1.w - padX * 2;
    const ty0 = r1.y + padTop, th = r1.h - padTop - padBot;
    const nodes = d.nodes;
    if (nodes) {
      const N = nodes.length - 1;
      const pos = (i, j) => {
        const x = tx0 + (i / (N || 1)) * tw;
        const yCenter = ty0 + th / 2;
        const span = th * 0.92;
        const stepY = span / Math.max(N, 1);
        const y = yCenter + (i * 0.5 - j) * stepY;
        return { x, y };
      };
      c.strokeStyle = P.rule;
      c.lineWidth = N > 14 ? 0.8 : 1.1;
      for (let i = 0; i < N; i++) {
        for (let j = 0; j <= i; j++) {
          const p0 = pos(i, j);
          const pu = pos(i + 1, j + 1);
          const pd = pos(i + 1, j);
          c.beginPath(); c.moveTo(p0.x, p0.y); c.lineTo(pu.x, pu.y); c.stroke();
          c.beginPath(); c.moveTo(p0.x, p0.y); c.lineTo(pd.x, pd.y); c.stroke();
        }
      }
      const rad = N > 16 ? 2.6 : N > 10 ? 3.5 : 4.6;
      for (let i = 0; i <= N; i++) {
        for (let j = 0; j <= i; j++) {
          const nd = nodes[i][j];
          const p0 = pos(i, j);
          c.fillStyle = nd.early ? P.amber : P.cyan;
          c.beginPath(); c.arc(p0.x, p0.y, nd.early ? rad + 1.1 : rad, 0, Math.PI * 2); c.fill();
        }
      }
    }

    // Right: convergence curve N = 1..128
    drawPanelTitle(c, t('cv.ch4RightTitle'), r2.x, r2.y, r2.w, placed);
    const curve = d.convCurve;
    let yMin = d.bsRef, yMax = d.bsRef;
    curve.forEach((pt) => {
      yMin = Math.min(yMin, pt.euro, pt.cur);
      yMax = Math.max(yMax, pt.euro, pt.cur);
    });
    const spanY = Math.max(1.5, yMax - yMin);
    const b2 = { x: r2.x + 40, y: r2.y + 24, w: r2.w - 50, h: r2.h - 48 };
    const g2 = drawAxesGrid(c, b2, 0, curve.length - 1, yMin - spanY * 0.15, yMax + spanY * 0.15, {
      nx: 3,
      xCustom: [0, 5, 10, 15],
      xFmt: (idx) => String(curve[Math.round(idx)] ? curve[Math.round(idx)].n : ''),
      ny: b2.h < 100 ? 3 : 4,
      yFmt: (v) => v.toFixed(1)
    });

    // BS reference horizontal line
    const yBs = g2.yMap(d.bsRef);
    c.strokeStyle = P.emerald;
    c.lineWidth = 1.4;
    c.setLineDash([4, 4]);
    c.beginPath(); c.moveTo(b2.x, yBs); c.lineTo(b2.x + b2.w, yBs); c.stroke();
    c.setLineDash([]);

    // Euro curve (slate)
    c.strokeStyle = P.slate; c.lineWidth = 1.5;
    c.beginPath();
    curve.forEach((pt, idx) => {
      const px = g2.xMap(idx), py = g2.yMap(pt.euro);
      if (idx === 0) c.moveTo(px, py); else c.lineTo(px, py);
    });
    c.stroke();

    // Current style curve (cyan)
    c.strokeStyle = P.cyan; c.lineWidth = 2.2;
    c.beginPath();
    curve.forEach((pt, idx) => {
      const px = g2.xMap(idx), py = g2.yMap(pt.cur);
      if (idx === 0) c.moveTo(px, py); else c.lineTo(px, py);
    });
    c.stroke();

    // Highlight current N dot
    let nearIdx = 0;
    let bestD = 999;
    curve.forEach((pt, idx) => {
      const dist = Math.abs(pt.n - steps);
      if (dist < bestD) { bestD = dist; nearIdx = idx; }
    });
    const dotX = g2.xMap(nearIdx), dotY = g2.yMap(d.price);
    c.fillStyle = P.amber;
    c.beginPath(); c.arc(dotX, dotY, 4.5, 0, Math.PI * 2); c.fill();
    safeText(c, fmt(t('cv.ch4BsRef'), { v: d.bsRef.toFixed(2) }), b2.x + b2.w - 2, yBs - 9, {
      align: 'right', font: '600 10px ui-monospace, monospace', color: P.emerald, minX: r2.x + 2, maxX: r2.x + r2.w - 2
    }, placed);
  }

  /* ══════════════════════════════════════════════
     MODEL 5 · GBM Paths & Mean vs Median Split
     ══════════════════════════════════════════════ */
  let gbmSeed = 42;
  function drawM5() {
    const cv = $('m5Cv');
    if (!cv) return;
    const sigmaPct = parseFloat($('m5Sig').value);
    const muPct = parseFloat($('m5Mu').value);
    const T = parseFloat($('m5T').value);
    $('m5Sigo').textContent = sigmaPct.toFixed(0) + '%';
    $('m5Muo').textContent = muPct.toFixed(0) + '%';
    $('m5To').textContent = T.toFixed(1) + 'y';

    const d = M.gbm.compute({ S0: 100, muPct, sigmaPct, T, nPaths: 200, nSteps: 52, seed: gbmSeed });
    $('m5Mean').textContent = d.theoMean.toFixed(2);
    $('m5Med').textContent = d.theoMedian.toFixed(2);
    $('m5P05').textContent = d.theoP05.toFixed(2);
    $('m5P95').textContent = d.theoP95.toFixed(2);
    $('m5Say').innerHTML = fmt(t('say.ch5Desc'), {
      mu: muPct.toFixed(0),
      sig: sigmaPct.toFixed(0),
      t: T.toFixed(1),
      mean: d.theoMean.toFixed(2),
      med: d.theoMedian.toFixed(2),
      empMed: d.empMedian.toFixed(2),
      gap: (d.theoMean - d.theoMedian).toFixed(2),
      p05: d.theoP05.toFixed(2),
      p95: d.theoP95.toFixed(2)
    });

    const { c, w, h } = fit(cv);
    const P = pal();
    const placed = [];
    const [r1, r2] = splitTwo(w, h);

    // Left: paths + theoretical envelope
    drawPanelTitle(c, t('cv.ch5LeftTitle'), r1.x, r1.y, r1.w, placed);
    const yCap = Math.max(160, Math.min(340, d.theoP95 * 1.15));
    const yLow = Math.max(20, Math.min(60, d.theoP05 * 0.75));
    const b1 = { x: r1.x + 40, y: r1.y + 24, w: r1.w - 48, h: r1.h - 48 };
    const g1 = drawAxesGrid(c, b1, 0, T, yLow, yCap, { nx: 3, ny: b1.h < 100 ? 3 : 4, xFmt: (v) => v.toFixed(1) + 'y' });

    // 5%-95% envelope fill (use 1.645 sigma)
    c.fillStyle = P.cyanSoft;
    c.beginPath();
    d.envelope.forEach((pt, i) => {
      const s = pt.med * Math.exp(1.645 * (pt.up1 / pt.med > 1 ? Math.log(pt.up1 / pt.med) : 0));
      const px = g1.xMap(pt.t), py = g1.yMap(Math.min(yCap, s));
      if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
    });
    for (let i = d.envelope.length - 1; i >= 0; i--) {
      const pt = d.envelope[i];
      const s = pt.med * Math.exp(-1.645 * (pt.up1 / pt.med > 1 ? Math.log(pt.up1 / pt.med) : 0));
      c.lineTo(g1.xMap(pt.t), g1.yMap(Math.max(yLow, s)));
    }
    c.closePath(); c.fill();

    // Sample paths
    d.samplePaths.forEach((path, idx) => {
      c.strokeStyle = idx % 3 === 0 ? 'rgba(2, 132, 199, 0.38)' : 'rgba(100, 116, 139, 0.25)';
      c.lineWidth = 1;
      c.beginPath();
      path.forEach((v, i) => {
        const tVal = (i / (path.length - 1)) * T;
        const px = g1.xMap(tVal), py = g1.yMap(Math.max(yLow, Math.min(yCap, v)));
        if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
      });
      c.stroke();
    });

    // Theo mean (dashed amber) and median (solid cyan)
    c.strokeStyle = P.amber; c.lineWidth = 2; c.setLineDash([4, 3]);
    c.beginPath();
    d.envelope.forEach((pt, i) => {
      const px = g1.xMap(pt.t), py = g1.yMap(Math.min(yCap, pt.mean));
      if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
    });
    c.stroke(); c.setLineDash([]);

    c.strokeStyle = P.cyan; c.lineWidth = 2.4;
    c.beginPath();
    d.envelope.forEach((pt, i) => {
      const px = g1.xMap(pt.t), py = g1.yMap(Math.min(yCap, pt.med));
      if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
    });
    c.stroke();

    // Right: Terminal distribution histogram
    drawPanelTitle(c, t('cv.ch5RightTitle'), r2.x, r2.y, r2.w, placed);
    const b2 = { x: r2.x + 36, y: r2.y + 24, w: r2.w - 46, h: r2.h - 48 };
    const xLo = Math.max(20, Math.floor(d.theoP05 * 0.7));
    const xHi = Math.min(350, Math.ceil(d.theoP95 * 1.25));
    const nBins = 16;
    const bwV = (xHi - xLo) / nBins;
    const counts = new Array(nBins).fill(0);
    d.finals.forEach((v) => {
      const idx = Math.max(0, Math.min(nBins - 1, Math.floor((v - xLo) / bwV)));
      counts[idx]++;
    });
    const maxCnt = Math.max(5, ...counts);
    const g2 = drawAxesGrid(c, b2, xLo, xHi, 0, maxCnt * 1.15, { nx: 3, ny: b2.h < 100 ? 3 : 4 });
    const yBase = g2.yMap(0);
    const barPx = b2.w / nBins;
    counts.forEach((cnt, i) => {
      const x0 = b2.x + i * barPx;
      const yTop = g2.yMap(cnt);
      c.fillStyle = P.cyanSoft;
      c.strokeStyle = P.cyan;
      c.lineWidth = 1;
      c.fillRect(x0 + 1, yTop, Math.max(2, barPx - 2), yBase - yTop);
      c.strokeRect(x0 + 1, yTop, Math.max(2, barPx - 2), yBase - yTop);
    });

    const xmMed = g2.xMap(Math.min(xHi, d.theoMedian));
    const xmMean = g2.xMap(Math.min(xHi, d.theoMean));
    c.strokeStyle = P.cyan; c.lineWidth = 2;
    c.beginPath(); c.moveTo(xmMed, b2.y); c.lineTo(xmMed, b2.y + b2.h); c.stroke();
    c.strokeStyle = P.amber; c.lineWidth = 2; c.setLineDash([4, 3]);
    c.beginPath(); c.moveTo(xmMean, b2.y); c.lineTo(xmMean, b2.y + b2.h); c.stroke();
    c.setLineDash([]);

    safeText(c, fmt(t('cv.ch5Med'), { v: d.theoMedian.toFixed(1) }), xmMed - 3, b2.y + 10, {
      align: 'right', font: '600 10px ui-monospace, monospace', color: P.cyan, minX: r2.x + 2, maxX: r2.x + r2.w - 2, allowShiftY: true
    }, placed);
    safeText(c, fmt(t('cv.ch5Mean'), { v: d.theoMean.toFixed(1) }), xmMean + 3, b2.y + 24, {
      align: 'left', font: '600 10px ui-monospace, monospace', color: P.amber, minX: r2.x + 2, maxX: r2.x + r2.w - 2, allowShiftY: true
    }, placed);
  }

  /* ══════════════════════════════════════════════
     MODEL 6 · BS Closed-Form vs Crank-Nicolson PDE
     ══════════════════════════════════════════════ */
  let m6AnimId = null;
  function drawM6() {
    const cv = $('m6Cv');
    if (!cv) return;
    const tau = parseFloat($('m6Tau').value);
    const sigmaPct = parseFloat($('m6Sig').value);
    const type = radioVal('m6Type', 'call');
    $('m6Tauo').textContent = tau.toFixed(2) + 'y';
    $('m6Sigo').textContent = sigmaPct.toFixed(0) + '%';

    const d = M.bsPde.solve({ K: 100, rPct: 4, qPct: 1, sigmaPct, T: 1.0, tau, type });
    const tv = Math.max(0, d.exactAtK);
    $('m6Bs').textContent = d.exactAtK.toFixed(3);
    $('m6Pde').textContent = d.pdeAtK.toFixed(3);
    $('m6Err').textContent = d.maxErr.toFixed(3);
    $('m6TimeVal').textContent = tv.toFixed(3);
    $('m6Say').innerHTML = fmt(t('say.ch6Desc'), {
      tau: tau.toFixed(2),
      sig: sigmaPct.toFixed(0),
      bs: d.exactAtK.toFixed(3),
      pde: d.pdeAtK.toFixed(3),
      err: d.maxErr.toFixed(3),
      tv: tv.toFixed(3)
    });

    const { c, w, h } = fit(cv);
    const P = pal();
    const placed = [];
    drawPanelTitle(c, t('cv.ch6Title'), 0, 0, w, placed);
    const box = { x: 46, y: 26, w: w - 62, h: h - 52 };
    const g = drawAxesGrid(c, box, 55, 155, 0, 60, { nx: w < 420 ? 4 : 5, ny: 4 });

    // Payoff at tau=0 (slate dashed)
    c.strokeStyle = P.slate; c.lineWidth = 1.6; c.setLineDash([4, 4]);
    c.beginPath();
    d.slice.forEach((pt, i) => {
      const px = g.xMap(pt.S), py = g.yMap(Math.min(60, pt.payoff));
      if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
    });
    c.stroke(); c.setLineDash([]);

    // BS closed form (cyan solid)
    c.strokeStyle = P.cyan; c.lineWidth = 2.6;
    c.beginPath();
    d.slice.forEach((pt, i) => {
      const px = g.xMap(pt.S), py = g.yMap(Math.min(60, pt.exact));
      if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
    });
    c.stroke();

    // Crank-Nicolson PDE (amber dashed)
    c.strokeStyle = P.amber; c.lineWidth = 2; c.setLineDash([5, 4]);
    c.beginPath();
    d.slice.forEach((pt, i) => {
      const px = g.xMap(pt.S), py = g.yMap(Math.min(60, pt.pde));
      if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
    });
    c.stroke(); c.setLineDash([]);

    // ATM marker at S=100
    const xK = g.xMap(100), yK = g.yMap(d.exactAtK);
    c.fillStyle = P.cyan;
    c.beginPath(); c.arc(xK, yK, 4.5, 0, Math.PI * 2); c.fill();
    safeText(c, 'K=100: ' + d.exactAtK.toFixed(2), xK + 6, Math.max(box.y + 10, yK - 10), {
      font: '600 10.5px ui-monospace, monospace', color: P.cyan, minX: 6, maxX: w - 6, allowShiftY: true
    }, placed);
  }

  function playM6() {
    if (m6AnimId) {
      cancelAnimationFrame(m6AnimId);
      m6AnimId = null;
      return;
    }
    const slider = $('m6Tau');
    if (reduceMotion()) {
      const cur = parseFloat(slider.value);
      slider.value = cur > 0.5 ? '0.00' : '1.00';
      drawM6();
      return;
    }
    let val = 0;
    slider.value = '0.00';
    drawM6();
    const step = () => {
      val += 0.025;
      if (val >= 1.0) {
        slider.value = '1.00';
        drawM6();
        m6AnimId = null;
        return;
      }
      slider.value = val.toFixed(2);
      drawM6();
      m6AnimId = requestAnimationFrame(step);
    };
    m6AnimId = requestAnimationFrame(step);
  }

  /* ══════════════════════════════════════════════
     MODEL 7 · Greeks & Discrete Delta Hedging MC
     ══════════════════════════════════════════════ */
  let m7Seed = 7;
  function drawM7() {
    const cv = $('m7Cv');
    if (!cv) return;
    const mode = radioVal('m7Mode', 'hedge');
    $('m7CtlHedge').classList.toggle('is-hidden', mode !== 'hedge');
    $('m7CtlGreeks').classList.toggle('is-hidden', mode !== 'greeks');

    const { c, w, h } = fit(cv);
    const P = pal();
    const placed = [];

    if (mode === 'hedge') {
      const rvPct = parseFloat($('m7Rv').value);
      const steps = parseInt(radioVal('m7Freq', '63'), 10);
      const costBps = parseFloat($('m7Cost').value);
      $('m7Rvo').textContent = rvPct.toFixed(0) + '%';
      $('m7Costo').textContent = costBps.toFixed(0) + ' bps';

      const d = M.greeksHedge.hedgeSim({ S0: 100, K: 100, rPct: 4, qPct: 0, T: 0.25, ivPct: 20, rvPct, steps, costBps, nPaths: 300, seed: m7Seed });

      $('m7AL').textContent = t('readLabel.ch7Mean');
      $('m7A').textContent = (d.mean >= 0 ? '+' : '') + d.mean.toFixed(3);
      $('m7BL').textContent = t('readLabel.ch7Sd');
      $('m7B').textContent = d.sd.toFixed(3);
      $('m7CL').textContent = t('readLabel.ch7P0595');
      $('m7C').textContent = '[' + d.p05.toFixed(2) + ', ' + d.p95.toFixed(2) + ']';
      $('m7DL').textContent = t('readLabel.ch7C0');
      $('m7D').textContent = d.C0.toFixed(2);

      let tpl = t('say.ch7HedgeFair');
      if (d.mean < -0.15) tpl = t('say.ch7HedgeNeg');
      else if (d.mean > 0.15) tpl = t('say.ch7HedgePos');
      $('m7Say').innerHTML = fmt(tpl, {
        c0: d.C0.toFixed(2),
        rv: rvPct.toFixed(0),
        steps,
        cost: costBps.toFixed(0),
        n: d.nPaths,
        mean: (d.mean >= 0 ? '+' : '') + d.mean.toFixed(2),
        absMean: Math.abs(d.mean).toFixed(2),
        sd: d.sd.toFixed(2),
        p05: d.p05.toFixed(2),
        p95: d.p95.toFixed(2)
      });

      drawPanelTitle(c, fmt(t('cv.ch7HedgeTitle'), { n: d.nPaths }), 0, 0, w, placed);
      const box = { x: 42, y: 26, w: w - 58, h: h - 52 };
      const xMin = -3.6, xMax = 3.6;
      const nBins = 24;
      const bw = (xMax - xMin) / nBins;
      const bins = new Array(nBins).fill(0);
      d.pnls.forEach((v) => {
        const idx = Math.max(0, Math.min(nBins - 1, Math.floor((v - xMin) / bw)));
        bins[idx]++;
      });
      const maxC = Math.max(10, ...bins);
      const g = drawAxesGrid(c, box, xMin, xMax, 0, maxC * 1.15, {
        nx: w < 420 ? 4 : 6,
        ny: 4,
        xFmt: (v) => (v > 0 ? '+' + v.toFixed(1) : v.toFixed(1))
      });
      const yBase = g.yMap(0);
      const pxW = box.w / nBins;
      bins.forEach((cnt, i) => {
        const binMid = xMin + (i + 0.5) * bw;
        const px = box.x + i * pxW;
        const py = g.yMap(cnt);
        c.fillStyle = binMid < 0 ? P.roseSoft : P.emeraldSoft;
        c.strokeStyle = binMid < 0 ? P.rose : P.emerald;
        c.lineWidth = 1;
        c.fillRect(px + 1, py, Math.max(2, pxW - 2), yBase - py);
        c.strokeRect(px + 1, py, Math.max(2, pxW - 2), yBase - py);
      });

      const xz = g.xMap(0);
      c.strokeStyle = P.muted; c.lineWidth = 1.4; c.setLineDash([4, 3]);
      c.beginPath(); c.moveTo(xz, box.y); c.lineTo(xz, box.y + box.h); c.stroke();
      c.setLineDash([]);
      const xm = g.xMap(Math.max(xMin, Math.min(xMax, d.mean)));
      c.strokeStyle = P.cyan; c.lineWidth = 2.4;
      c.beginPath(); c.moveTo(xm, box.y); c.lineTo(xm, box.y + box.h); c.stroke();

      safeText(c, fmt(t('cv.ch7MeanLine'), { v: (d.mean >= 0 ? '+' : '') + d.mean.toFixed(2) }), xm + 4, box.y + 12, {
        font: '700 10.5px ui-monospace, monospace', color: P.cyan, minX: 6, maxX: w - 6, allowShiftY: true
      }, placed);
      safeText(c, t('cv.ch7ZeroLine'), xz - 4, box.y + 26, {
        align: 'right', font: '10px -apple-system, sans-serif', color: P.muted, minX: 6, maxX: w - 6, allowShiftY: true
      }, placed);
    } else {
      const S0 = parseFloat($('m7S').value);
      const T = parseFloat($('m7T').value);
      $('m7So').textContent = S0.toFixed(0);
      $('m7To').textContent = T.toFixed(2) + 'y';
      const d = M.greeksHedge.anatomy({ S0, K: 100, rPct: 4, qPct: 0, T, ivPct: 20, type: 'call' });

      $('m7AL').textContent = t('readLabel.ch7Delta');
      $('m7A').textContent = d.cur.delta.toFixed(3);
      $('m7BL').textContent = t('readLabel.ch7Gamma');
      $('m7B').textContent = d.cur.gamma.toFixed(4);
      $('m7CL').textContent = t('readLabel.ch7Vega');
      $('m7C').textContent = d.cur.vega1pct.toFixed(3);
      $('m7DL').textContent = t('readLabel.ch7Theta');
      $('m7D').textContent = d.cur.thetaDay.toFixed(4);

      $('m7Say').innerHTML = fmt(t('say.ch7Greeks'), {
        s: S0.toFixed(0), t: T.toFixed(2),
        delta: d.cur.delta.toFixed(3),
        gamma: d.cur.gamma.toFixed(4),
        theta: d.cur.thetaDay.toFixed(4),
        vega: d.cur.vega1pct.toFixed(3)
      });

      const [r1, r2] = splitTwo(w, h);
      // Left: Delta (0..1) and Gamma (scaled)
      drawPanelTitle(c, t('cv.ch7DeltaTitle'), r1.x, r1.y, r1.w, placed);
      const b1 = { x: r1.x + 38, y: r1.y + 24, w: r1.w - 48, h: r1.h - 48 };
      const g1 = drawAxesGrid(c, b1, 60, 140, 0, 1.05, { nx: 4, ny: b1.h < 100 ? 3 : 4, yFmt: (v) => v.toFixed(2) });
      const maxG = Math.max(0.05, ...d.curve.map((pt) => pt.gamma));
      c.strokeStyle = P.cyan; c.lineWidth = 2.2;
      c.beginPath();
      d.curve.forEach((pt, i) => {
        const px = g1.xMap(pt.s), py = g1.yMap(pt.delta);
        if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
      });
      c.stroke();

      c.strokeStyle = P.amber; c.lineWidth = 2;
      c.beginPath();
      d.curve.forEach((pt, i) => {
        const px = g1.xMap(pt.s), py = g1.yMap(pt.gamma / maxG);
        if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
      });
      c.stroke();
      const sx1 = g1.xMap(S0);
      c.strokeStyle = P.muted; c.setLineDash([3, 3]);
      c.beginPath(); c.moveTo(sx1, b1.y); c.lineTo(sx1, b1.y + b1.h); c.stroke();
      c.setLineDash([]);

      // Right: Vega & -Theta
      drawPanelTitle(c, t('cv.ch7VtTitle'), r2.x, r2.y, r2.w, placed);
      const maxV = Math.max(0.25, ...d.curve.map((pt) => pt.vega));
      const maxTh = Math.max(0.03, ...d.curve.map((pt) => Math.abs(pt.theta)));
      const b2 = { x: r2.x + 38, y: r2.y + 24, w: r2.w - 48, h: r2.h - 48 };
      const g2 = drawAxesGrid(c, b2, 60, 140, 0, maxV * 1.15, { nx: 4, ny: b2.h < 100 ? 3 : 4, yFmt: (v) => v.toFixed(2) });
      c.strokeStyle = P.emerald; c.lineWidth = 2.2;
      c.beginPath();
      d.curve.forEach((pt, i) => {
        const px = g2.xMap(pt.s), py = g2.yMap(pt.vega);
        if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
      });
      c.stroke();

      c.strokeStyle = P.rose; c.lineWidth = 2;
      c.beginPath();
      d.curve.forEach((pt, i) => {
        const px = g2.xMap(pt.s), py = g2.yMap((Math.abs(pt.theta) / maxTh) * maxV);
        if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
      });
      c.stroke();
      const sx2 = g2.xMap(S0);
      c.strokeStyle = P.muted; c.setLineDash([3, 3]);
      c.beginPath(); c.moveTo(sx2, b2.y); c.lineTo(sx2, b2.y + b2.h); c.stroke();
      c.setLineDash([]);
    }
  }

  /* ══════════════════════════════════════════════
     MODEL 8 · Real Market Failures (SPX Smile, Tails, Clustering)
     ══════════════════════════════════════════════ */
  function drawM8() {
    const cv = $('m8Cv');
    if (!cv) return;
    const mode = radioVal('m8Mode', 'smile');
    $('m8CtlSmile').classList.toggle('is-hidden', mode !== 'smile');
    $('m8CtlTails').classList.toggle('is-hidden', mode !== 'tails');

    const { c, w, h } = fit(cv);
    const P = pal();
    const placed = [];

    if (mode === 'smile') {
      const idx = parseInt($('m8Strike').value, 10);
      const info = M.marketBreaks.smileInfo(idx);
      const row = info.row;
      $('m8Strikeo').textContent = row.k + ' ' + row.type;

      $('m8AL').textContent = t('readLabel.ch8Mid');
      $('m8A').textContent = info.mid.toFixed(2) + ' / ' + row.spreadPct.toFixed(1) + '%';
      $('m8BL').textContent = t('readLabel.ch8Bs');
      $('m8B').textContent = info.bsFlat.toFixed(2);
      $('m8CL').textContent = t('readLabel.ch8Iv');
      $('m8C').textContent = row.iv.toFixed(2) + '%';
      $('m8DL').textContent = t('readLabel.ch8Diff');
      $('m8D').textContent = (info.diffFromFlat >= 0 ? '+' : '') + info.diffFromFlat.toFixed(2);

      $('m8Say').innerHTML = fmt(t('say.ch8Smile'), {
        k: row.k, tp: row.type, m: row.m.toFixed(1),
        mid: info.mid.toFixed(2), spr: row.spreadPct.toFixed(1),
        bs: info.bsFlat.toFixed(2), diff: (info.diffFromFlat >= 0 ? '+' : '') + info.diffFromFlat.toFixed(2),
        iv: row.iv.toFixed(2), skew: (info.ivSkewPts >= 0 ? '+' : '') + info.ivSkewPts.toFixed(2)
      });

      drawPanelTitle(c, t('cv.ch8SmileTitle'), 0, 0, w, placed);
      const box = { x: 44, y: 26, w: w - 60, h: h - 52 };
      const chain = M.SPX_SMILE_SNAPSHOT.chain;
      const g = drawAxesGrid(c, box, 5900, 9200, 8, 42, { nx: w < 420 ? 3 : 5, ny: 4, yFmt: (v) => v.toFixed(0) + '%' });

      // Flat BS reference line (14.52%)
      const yFlat = g.yMap(M.SPX_SMILE_SNAPSHOT.atmIvPct);
      c.strokeStyle = P.slate; c.lineWidth = 1.6; c.setLineDash([5, 4]);
      c.beginPath(); c.moveTo(box.x, yFlat); c.lineTo(box.x + box.w, yFlat); c.stroke();
      c.setLineDash([]);
      safeText(c, t('cv.ch8FlatBs'), box.x + box.w - 4, yFlat - 10, { align: 'right', font: '10px -apple-system, sans-serif', color: P.slate, minX: 4, maxX: w - 4 }, placed);

      // Market IV smile curve
      c.strokeStyle = P.cyan; c.lineWidth = 2.6;
      c.beginPath();
      chain.forEach((pt, i) => {
        const px = g.xMap(pt.k), py = g.yMap(pt.iv);
        if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
      });
      c.stroke();

      chain.forEach((pt, i) => {
        const px = g.xMap(pt.k), py = g.yMap(pt.iv);
        const sel = i === idx;
        c.fillStyle = sel ? P.amber : (pt.spreadPct > 20 ? P.rose : P.cyan);
        c.beginPath(); c.arc(px, py, sel ? 5.5 : 3.2, 0, Math.PI * 2); c.fill();
      });

      const sx = g.xMap(row.k), sy = g.yMap(row.iv);
      safeText(c, row.k + ': ' + row.iv.toFixed(1) + '%', sx, Math.max(box.y + 10, sy - 12), {
        align: 'center', font: '700 10.5px ui-monospace, monospace', color: P.amber, minX: 6, maxX: w - 6, allowShiftY: true
      }, placed);
    } else if (mode === 'tails') {
      const logY = $('m8LogY').checked;
      const E = M.SP500_EMPIRICAL;
      $('m8AL').textContent = t('readLabel.ch8Kurt');
      $('m8A').textContent = E.kurtosis.toFixed(1) + ' / ' + E.skewness.toFixed(2);
      $('m8BL').textContent = t('readLabel.ch8Gt4');
      $('m8B').textContent = E.gt4 + ' vs ' + E.normalExpectedGt4;
      $('m8CL').textContent = t('readLabel.ch8Worst');
      $('m8C').textContent = E.worstDay.pct.toFixed(2) + '% (' + E.worstDay.z.toFixed(1) + 's)';
      $('m8DL').textContent = t('readLabel.ch8Best');
      $('m8D').textContent = '+' + E.bestDay.pct.toFixed(2) + '% (+' + E.bestDay.z.toFixed(1) + 's)';
      $('m8Say').innerHTML = t('say.ch8Tails');

      drawPanelTitle(c, t('cv.ch8TailsTitle'), 0, 0, w, placed);
      const box = { x: 46, y: 26, w: w - 60, h: h - 52 };
      const yMaxVal = logY ? Math.log10(1000) : 760;
      const mapCnt = (cnt) => (logY ? Math.log10(Math.max(0.5, cnt)) + 0.3 : cnt);
      const yTop = logY ? Math.log10(1000) + 0.3 : 760;
      const g = drawAxesGrid(c, box, -6, 6, 0, yTop, {
        nx: w < 420 ? 4 : 6,
        ny: 4,
        xFmt: (v) => (v > 0 ? '+' + v + 's' : v + 's'),
        yFmt: (v) => (logY ? Math.round(Math.pow(10, Math.max(0, v - 0.3))).toString() : Math.round(v).toString())
      });
      const yBase = g.yMap(0);
      const barPx = box.w / E.bins.length;
      E.bins.forEach(([zMid, cnt], i) => {
        if (cnt <= 0) return;
        const px = box.x + i * barPx;
        const py = g.yMap(mapCnt(cnt));
        const isTail = Math.abs(zMid) >= 3.0;
        c.fillStyle = isTail ? P.rose : P.cyanSoft;
        c.strokeStyle = isTail ? P.rose : P.cyan;
        c.lineWidth = 1;
        c.fillRect(px + 1, py, Math.max(2, barPx - 2), yBase - py);
        c.strokeRect(px + 1, py, Math.max(2, barPx - 2), yBase - py);
      });

      // Normal density overlay scaled to N=2511 * binWidth(0.5)
      c.strokeStyle = P.amber; c.lineWidth = 2; c.setLineDash([4, 3]);
      c.beginPath();
      for (let z = -6; z <= 6; z += 0.15) {
        const expCnt = E.n * 0.5 * M.normPDF(z);
        const py = g.yMap(Math.max(0, mapCnt(expCnt)));
        const px = g.xMap(z);
        if (z === -6) c.moveTo(px, py); else c.lineTo(px, py);
      }
      c.stroke(); c.setLineDash([]);
      safeText(c, t('cv.ch8TailsNorm'), box.x + box.w - 4, box.y + 12, { align: 'right', font: '600 10px -apple-system, sans-serif', color: P.amber, minX: 4, maxX: w - 4 }, placed);
    } else {
      const E = M.SP500_EMPIRICAL;
      $('m8AL').textContent = t('readLabel.ch8AcAbs');
      $('m8A').textContent = '+' + E.acAbsReturn1.toFixed(3);
      $('m8BL').textContent = t('readLabel.ch8AcRet');
      $('m8B').textContent = E.acReturn1.toFixed(3);
      $('m8CL').textContent = t('readLabel.ch8PeakRv');
      $('m8C').textContent = '92.5%';
      $('m8DL').textContent = t('readLabel.ch8VixPeak');
      $('m8D').textContent = E.vixPeak2020.v.toFixed(2);
      $('m8Say').innerHTML = t('say.ch8Cluster');

      drawPanelTitle(c, t('cv.ch8ClustTitle'), 0, 0, w, placed);
      const mv = E.monthlyVol;
      const box = { x: 44, y: 26, w: w - 58, h: h - 52 };
      const g = drawAxesGrid(c, box, 0, mv.length - 1, 0, 100, {
        nx: 4,
        xCustom: [2, 38, 74, 110],
        xFmt: (i) => (mv[Math.round(i)] ? mv[Math.round(i)][0].slice(0, 4) : ''),
        ny: 4,
        yFmt: (v) => v.toFixed(0) + '%'
      });

      // VIX month-end dashed amber
      c.strokeStyle = P.amber; c.lineWidth = 1.6; c.setLineDash([4, 3]);
      c.beginPath();
      mv.forEach((pt, i) => {
        const px = g.xMap(i), py = g.yMap(pt[2]);
        if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
      });
      c.stroke(); c.setLineDash([]);

      // Monthly realized vol solid cyan
      c.strokeStyle = P.cyan; c.lineWidth = 2.1;
      c.beginPath();
      mv.forEach((pt, i) => {
        const px = g.xMap(i), py = g.yMap(pt[1]);
        if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
      });
      c.stroke();

      // Peak callout 2020-03 (idx 40)
      const px20 = g.xMap(40), py20 = g.yMap(92.5);
      c.fillStyle = P.rose; c.beginPath(); c.arc(px20, py20, 4, 0, Math.PI * 2); c.fill();
      safeText(c, t('cv.ch8ClustMar20'), px20 + 6, py20 + 2, { font: '600 10px ui-monospace, monospace', color: P.rose, minX: 4, maxX: w - 4, allowShiftY: true }, placed);
    }
  }

  /* ══════════════════════════════════════════════
     MODEL 9 · Heston Stochastic Volatility Smile
     ══════════════════════════════════════════════ */
  function drawM9() {
    const cv = $('m9Cv');
    if (!cv) return;
    const rho = parseFloat($('m9Rho').value);
    const xi = parseFloat($('m9Xi').value);
    const kappa = parseFloat($('m9Kappa').value);
    $('m9Rhoo').textContent = rho.toFixed(2);
    $('m9Xio').textContent = xi.toFixed(2);
    $('m9Kappao').textContent = kappa.toFixed(1);

    const d = M.heston.smile({ rho, xi, kappa });
    $('m9Iv80').textContent = d.iv80.toFixed(2) + '%';
    $('m9Iv100').textContent = d.iv100.toFixed(2) + '%';
    $('m9Iv120').textContent = d.iv120.toFixed(2) + '%';
    $('m9Skew').textContent = (d.skew25 >= 0 ? '+' : '') + d.skew25.toFixed(2) + '%';

    let tpl = t('say.ch9Skew');
    if (xi < 0.08) tpl = t('say.ch9Flat');
    else if (Math.abs(rho) < 0.18) tpl = t('say.ch9Smile');
    $('m9Say').innerHTML = fmt(tpl, {
      rho: rho.toFixed(2), xi: xi.toFixed(2), kappa: kappa.toFixed(1),
      iv80: d.iv80.toFixed(2), iv100: d.iv100.toFixed(2), iv120: d.iv120.toFixed(2),
      skew: (d.skew25 >= 0 ? '+' : '') + d.skew25.toFixed(2)
    });

    const { c, w, h } = fit(cv);
    const P = pal();
    const placed = [];
    drawPanelTitle(c, t('cv.ch9Title'), 0, 0, w, placed);
    const box = { x: 46, y: 26, w: w - 62, h: h - 52 };
    let yMin = 10, yMax = 30;
    d.curve.forEach((pt) => {
      yMin = Math.min(yMin, pt.ivPct - 2);
      yMax = Math.max(yMax, pt.ivPct + 3);
    });
    const g = drawAxesGrid(c, box, 80, 120, Math.max(4, Math.floor(yMin)), Math.ceil(yMax), {
      nx: 4, ny: 4, xFmt: (v) => v.toFixed(0) + '%', yFmt: (v) => v.toFixed(0) + '%'
    });

    // Flat BS reference at 20.1%
    const yFlat = g.yMap(20.1);
    c.strokeStyle = P.slate; c.lineWidth = 1.5; c.setLineDash([4, 4]);
    c.beginPath(); c.moveTo(box.x, yFlat); c.lineTo(box.x + box.w, yFlat); c.stroke();
    c.setLineDash([]);
    safeText(c, t('cv.ch9Flat'), box.x + box.w - 4, yFlat - 9, { align: 'right', font: '10px -apple-system, sans-serif', color: P.slate, minX: 4, maxX: w - 4 }, placed);

    // Heston curve
    c.strokeStyle = P.cyan; c.lineWidth = 2.8;
    c.beginPath();
    d.curve.forEach((pt, i) => {
      const px = g.xMap(pt.m), py = g.yMap(pt.ivPct);
      if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
    });
    c.stroke();
    d.curve.forEach((pt) => {
      c.fillStyle = P.cyan;
      c.beginPath(); c.arc(g.xMap(pt.m), g.yMap(pt.ivPct), 3.6, 0, Math.PI * 2); c.fill();
    });
    safeText(c, d.iv80.toFixed(1) + '%', g.xMap(80) + 6, Math.max(box.y + 10, g.yMap(d.iv80) - 10), { font: '600 10.5px ui-monospace, monospace', color: P.cyan, minX: 4, maxX: w - 4, allowShiftY: true }, placed);
    safeText(c, d.iv120.toFixed(1) + '%', g.xMap(120) - 6, Math.max(box.y + 10, g.yMap(d.iv120) - 10), { align: 'right', font: '600 10.5px ui-monospace, monospace', color: P.cyan, minX: 4, maxX: w - 4, allowShiftY: true }, placed);
  }

  /* ══════════════════════════════════════════════
     MODEL 10 · Uses vs Harms & BIS Notional Waterfall
     ══════════════════════════════════════════════ */
  function drawM10() {
    const cv = $('m10Cv');
    if (!cv) return;
    const mode = radioVal('m10Mode', 'hedge');
    $('m10CtlHedge').classList.toggle('is-hidden', mode !== 'hedge');

    const { c, w, h } = fit(cv);
    const P = pal();
    const placed = [];

    if (mode === 'hedge') {
      const spotChangePct = parseFloat($('m10Move').value);
      const spreadPct = parseFloat($('m10Spread').value);
      const hedgeRatioPct = parseFloat($('m10Hr').value);
      $('m10Moveo').textContent = (spotChangePct >= 0 ? '+' : '') + spotChangePct.toFixed(0) + '%';
      $('m10Spreado').textContent = spreadPct.toFixed(0) + '%';
      $('m10Hro').textContent = hedgeRatioPct.toFixed(0) + '%';

      const d = M.usesHarms.compare({ spotChangePct, spreadPct, hedgeRatioPct });
      $('m10AL').textContent = t('readLabel.ch10OpUn');
      $('m10A').textContent = d.baseOpProfit.toFixed(0);
      $('m10BL').textContent = t('readLabel.ch10OpH');
      $('m10B').textContent = d.hedgedProfit.toFixed(0);
      $('m10CL').textContent = t('readLabel.ch10OptRet');
      $('m10C').textContent = (d.optRetPct >= 0 ? '+' : '') + d.optRetPct.toFixed(0) + '%';
      $('m10DL').textContent = t('readLabel.ch10Drag');
      $('m10D').textContent = d.roundTripDragPct.toFixed(2) + '%';

      $('m10Say').innerHTML = fmt(t('say.ch10Hedge'), {
        mv: (spotChangePct >= 0 ? '+' : '') + spotChangePct.toFixed(0),
        opUn: d.baseOpProfit.toFixed(0),
        hr: hedgeRatioPct.toFixed(0),
        opH: d.hedgedProfit.toFixed(0),
        spr: spreadPct.toFixed(0),
        fair: d.fairOpt.toFixed(2),
        ask: d.askOpt.toFixed(2),
        drag: d.roundTripDragPct.toFixed(2),
        optRet: (d.optRetPct >= 0 ? '+' : '') + d.optRetPct.toFixed(0)
      });

      const [r1, r2] = splitTwo(w, h);
      // Left: Corp Hedging profit
      drawPanelTitle(c, t('cv.ch10CorpTitle'), r1.x, r1.y, r1.w, placed);
      const b1 = { x: r1.x + 40, y: r1.y + 24, w: r1.w - 48, h: r1.h - 48 };
      const g1 = drawAxesGrid(c, b1, -20, 20, 0, 420, { nx: 4, ny: b1.h < 100 ? 3 : 4, xFmt: (v) => (v > 0 ? '+' + v + '%' : v + '%') });
      c.strokeStyle = P.slate; c.lineWidth = 1.6; c.setLineDash([4, 3]);
      c.beginPath();
      d.curve.filter((pt) => pt.pct >= -20 && pt.pct <= 20).forEach((pt, i) => {
        const px = g1.xMap(pt.pct), py = g1.yMap(Math.max(0, Math.min(420, pt.opUn)));
        if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
      });
      c.stroke(); c.setLineDash([]);
      c.strokeStyle = P.emerald; c.lineWidth = 2.4;
      c.beginPath();
      d.curve.filter((pt) => pt.pct >= -20 && pt.pct <= 20).forEach((pt, i) => {
        const px = g1.xMap(pt.pct), py = g1.yMap(Math.max(0, Math.min(420, pt.opH)));
        if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
      });
      c.stroke();
      const cx1 = g1.xMap(Math.max(-20, Math.min(20, spotChangePct)));
      c.fillStyle = P.emerald; c.beginPath(); c.arc(cx1, g1.yMap(Math.max(0, Math.min(420, d.hedgedProfit))), 4.5, 0, Math.PI * 2); c.fill();

      // Right: Short-term OTM call % return vs spot %
      drawPanelTitle(c, t('cv.ch10RetTitle'), r2.x, r2.y, r2.w, placed);
      const b2 = { x: r2.x + 44, y: r2.y + 24, w: r2.w - 52, h: r2.h - 48 };
      const g2 = drawAxesGrid(c, b2, -15, 15, -140, 1200, { nx: 4, ny: b2.h < 100 ? 3 : 4, xFmt: (v) => (v > 0 ? '+' + v + '%' : v + '%'), yFmt: (v) => v.toFixed(0) + '%' });
      const yz = g2.yMap(0);
      c.strokeStyle = P.muted; c.setLineDash([3, 3]);
      c.beginPath(); c.moveTo(b2.x, yz); c.lineTo(b2.x + b2.w, yz); c.stroke();
      c.setLineDash([]);
      c.strokeStyle = P.rose; c.lineWidth = 2.3;
      c.beginPath();
      d.curve.filter((pt) => pt.pct >= -15 && pt.pct <= 15).forEach((pt, i) => {
        const px = g2.xMap(pt.pct), py = g2.yMap(Math.max(-140, Math.min(1200, pt.retOpt)));
        if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
      });
      c.stroke();
      const cx2 = g2.xMap(Math.max(-15, Math.min(15, spotChangePct)));
      const cy2 = g2.yMap(Math.max(-140, Math.min(1200, d.optRetPct)));
      c.fillStyle = P.amber; c.beginPath(); c.arc(cx2, cy2, 4.5, 0, Math.PI * 2); c.fill();
    } else {
      const F = M.FRONTIER;
      $('m10AL').textContent = t('readLabel.ch10Notional');
      $('m10A').textContent = '$' + F.bisOtcNotionalT.toFixed(1) + 'T';
      $('m10BL').textContent = t('readLabel.ch10Gross');
      $('m10B').textContent = '$' + F.bisOtcGrossMktValT.toFixed(1) + 'T';
      $('m10CL').textContent = t('readLabel.ch10Net');
      $('m10C').textContent = '~$' + F.bisNetCreditEstT.toFixed(1) + 'T';
      $('m10DL').textContent = t('readLabel.ch10Im');
      $('m10D').textContent = '$423.5B + ~$1.6T';
      $('m10Say').innerHTML = t('say.ch10Notional');

      drawPanelTitle(c, t('cv.ch10NotionalTitle'), 0, 0, w, placed);
      const box = { x: w < 420 ? 115 : 148, y: 30, w: w - (w < 420 ? 132 : 172), h: h - 54 };
      const rows = [
        { lbl: t('cv.ch10BarNotional'), val: F.bisOtcNotionalT, col: P.slate },
        { lbl: t('cv.ch10BarGross'), val: F.bisOtcGrossMktValT, col: P.amber },
        { lbl: t('cv.ch10BarNet'), val: F.bisNetCreditEstT, col: P.cyan },
        { lbl: t('cv.ch10BarIm'), val: 2.02, col: P.emerald }
      ];
      // Use square-root or log-like visual compression? No, exact linear bars with exact callout AND inset zoomed ratio!
      const rowH = box.h / rows.length;
      rows.forEach((r, idx) => {
        const cy = box.y + idx * rowH + rowH * 0.5;
        const bh = Math.min(26, rowH * 0.54);
        const bwPx = Math.max(3, (r.val / F.bisOtcNotionalT) * box.w);
        c.fillStyle = r.col;
        c.fillRect(box.x, cy - bh / 2, bwPx, bh);
        safeText(c, r.lbl, box.x - 8, cy, { align: 'right', font: '600 10.5px -apple-system, sans-serif', color: P.ink2, minX: 4, maxX: box.x - 2 }, placed);
        if (idx > 0) {
          const zoomW = Math.max(6, (r.val / 25) * box.w * 0.45);
          c.fillStyle = r.col;
          c.globalAlpha = 0.22;
          c.fillRect(box.x + bwPx + 10, cy - bh / 2, zoomW, bh);
          c.globalAlpha = 1;
          safeText(c, '$' + r.val.toFixed(1) + 'T', box.x + bwPx + zoomW + 16, cy, { font: '600 10.5px ui-monospace, monospace', color: r.col, minX: box.x, maxX: w - 6 }, placed);
        }
      });
    }
  }

  /* ══════════════════════════════════════════════
     MODEL 11 · Frontier: 0DTE Gamma & Perp Funding
     ══════════════════════════════════════════════ */
  function drawM11() {
    const cv = $('m11Cv');
    if (!cv) return;
    const mode = radioVal('m11Mode', 'gamma0dte');
    $('m11CtlGamma').classList.toggle('is-hidden', mode !== 'gamma0dte');
    $('m11CtlPerp').classList.toggle('is-hidden', mode !== 'perp');

    const { c, w, h } = fit(cv);
    const P = pal();
    const placed = [];

    if (mode === 'gamma0dte') {
      const dteDays = parseFloat($('m11Dte').value);
      const spotShockPct = parseFloat($('m11Shock').value);
      $('m11Dteo').textContent = dteDays.toFixed(2) + 'd';
      $('m11Shocko').textContent = spotShockPct.toFixed(1) + '%';

      const d = M.frontierModel.gamma0dte({ dteDays, spotShockPct });
      $('m11AL').textContent = t('readLabel.ch11Gam');
      $('m11A').textContent = d.curGamma.toFixed(4);
      $('m11BL').textContent = t('readLabel.ch11Ratio');
      $('m11B').textContent = d.ratioVs30d.toFixed(2) + 'x';
      $('m11CL').textContent = t('readLabel.ch11Jump');
      $('m11C').textContent = d.deltaMoveShares.toFixed(3);
      $('m11DL').textContent = t('readLabel.ch11Share');
      $('m11D').textContent = M.FRONTIER.spx0dte2025SharePct + '% / ' + M.FRONTIER.spx0dteJul2026PeakPct + '%';

      $('m11Say').innerHTML = fmt(t('say.ch11Gamma'), {
        dte: dteDays.toFixed(2),
        gam: d.curGamma.toFixed(4),
        ratio: d.ratioVs30d.toFixed(2),
        shock: spotShockPct.toFixed(1),
        dDelta: d.deltaMoveShares.toFixed(3)
      });

      drawPanelTitle(c, t('cv.ch11GammaTitle'), 0, 0, w, placed);
      const maxY = Math.max(0.15, Math.ceil(d.curGamma * 1.15 * 10) / 10);
      const box = { x: 46, y: 26, w: w - 60, h: h - 52 };
      const g = drawAxesGrid(c, box, 90, 110, 0, maxY, { nx: 4, ny: 4, yFmt: (v) => v.toFixed(2) });

      // 30D baseline
      c.strokeStyle = P.slate; c.lineWidth = 1.6; c.setLineDash([4, 3]);
      c.beginPath();
      d.curve.forEach((pt, i) => {
        const px = g.xMap(pt.s), py = g.yMap(pt.g30);
        if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
      });
      c.stroke(); c.setLineDash([]);

      // Current DTE Gamma curve
      c.strokeStyle = P.rose; c.lineWidth = 2.6;
      c.beginPath();
      d.curve.forEach((pt, i) => {
        const px = g.xMap(pt.s), py = g.yMap(Math.min(maxY, pt.gCur));
        if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
      });
      c.stroke();

      safeText(c, d.ratioVs30d.toFixed(1) + 'x 30D', g.xMap(100), Math.max(box.y + 10, g.yMap(d.curGamma) - 10), {
        align: 'center', font: '700 10.5px ui-monospace, monospace', color: P.rose, minX: 4, maxX: w - 4
      }, placed);
    } else {
      const perpPremiumBps = parseFloat($('m11Prem').value);
      const arbCapital = parseFloat($('m11Arb').value);
      $('m11Premo').textContent = (perpPremiumBps >= 0 ? '+' : '') + perpPremiumBps.toFixed(0) + ' bps';
      $('m11Arbo').textContent = arbCapital.toFixed(0) + '%';

      const d = M.frontierModel.perpFunding({ perpPremiumBps, arbCapital });
      $('m11AL').textContent = t('readLabel.ch11InitAnn');
      $('m11A').textContent = d.initAnnPct.toFixed(1) + '%';
      $('m11BL').textContent = t('readLabel.ch11EndAnn');
      $('m11B').textContent = d.endAnnPct.toFixed(1) + '%';
      $('m11CL').textContent = t('readLabel.ch11InitBps');
      $('m11C').textContent = d.initFunding8hBps.toFixed(1) + ' bps';
      $('m11DL').textContent = t('readLabel.ch11Arb');
      $('m11D').textContent = arbCapital.toFixed(0) + '%';

      $('m11Say').innerHTML = fmt(t('say.ch11Perp'), {
        prem: perpPremiumBps.toFixed(0),
        initBps: d.initFunding8hBps.toFixed(1),
        initAnn: d.initAnnPct.toFixed(1),
        arb: arbCapital.toFixed(0),
        endBps: d.endFunding8hBps.toFixed(1),
        endAnn: d.endAnnPct.toFixed(1)
      });

      drawPanelTitle(c, t('cv.ch11PerpTitle'), 0, 0, w, placed);
      const yLo = Math.min(-50, ...d.trace.map((pt) => pt.annPct)) - 20;
      const yHi = Math.max(80, ...d.trace.map((pt) => pt.annPct)) + 30;
      const box = { x: 48, y: 26, w: w - 62, h: h - 52 };
      const g = drawAxesGrid(c, box, 0, 18, yLo, yHi, { nx: 6, ny: 4, xFmt: (v) => 'T+' + Math.round(v), yFmt: (v) => Math.round(v) + '%' });
      const y0 = g.yMap(0);
      c.strokeStyle = P.muted; c.setLineDash([3, 3]);
      c.beginPath(); c.moveTo(box.x, y0); c.lineTo(box.x + box.w, y0); c.stroke();
      c.setLineDash([]);

      c.strokeStyle = P.amber; c.lineWidth = 2.6;
      c.beginPath();
      d.trace.forEach((pt, i) => {
        const px = g.xMap(pt.step), py = g.yMap(pt.annPct);
        if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
      });
      c.stroke();
      d.trace.forEach((pt) => {
        c.fillStyle = P.amber;
        c.beginPath(); c.arc(g.xMap(pt.step), g.yMap(pt.annPct), 3, 0, Math.PI * 2); c.fill();
      });
    }
  }

  /* ── Frontier Table Renderer ── */
  function renderFrontierTable() {
    const wrap = $('frTableWrap');
    const tbl = t('frTable');
    if (!wrap || !tbl || !tbl.rows) return;
    let html = '<table class="frontier-tbl"><caption>' + tbl.title + '</caption><thead><tr>';
    tbl.cols.forEach((c) => { html += '<th>' + c + '</th>'; });
    html += '</tr></thead><tbody>';
    tbl.rows.forEach((r) => {
      html += '<tr>' + r.map((cell, idx) => '<td' + (idx === 1 ? ' class="num"' : '') + '>' + cell + '</td>').join('') + '</tr>';
    });
    html += '</tbody></table>';
    wrap.innerHTML = html;
  }

  /* ── i18n Application ── */
  function applyLang(lang) {
    curLang = (lang === 'en' && I18N.en) ? 'en' : 'zh';
    document.documentElement.lang = curLang === 'en' ? 'en' : 'zh-CN';
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-html]').forEach((el) => {
      el.innerHTML = t(el.getAttribute('data-i18n-html'));
    });
    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
    });
    const btn = $('langToggle');
    if (btn) btn.textContent = curLang === 'en' ? 'EN' : t('nav.lang');
    renderFrontierTable();
    redrawAll();
  }

  const sims = [
    { ch: 'ch1', draw: drawM1 },
    { ch: 'ch2', draw: drawM2 },
    { ch: 'ch3', draw: drawM3 },
    { ch: 'ch4', draw: drawM4 },
    { ch: 'ch5', draw: drawM5 },
    { ch: 'ch6', draw: drawM6 },
    { ch: 'ch7', draw: drawM7 },
    { ch: 'ch8', draw: drawM8 },
    { ch: 'ch9', draw: drawM9 },
    { ch: 'ch10', draw: drawM10 },
    { ch: 'ch11', draw: drawM11 }
  ];
  const visible = new Set();

  function redrawAll() {
    sims.forEach((s) => s.draw());
  }

  /* ── Wiring Controls & IntersectionObserver ── */
  function init() {
    const langBtn = $('langToggle');
    if (langBtn) {
      langBtn.addEventListener('click', () => {
        const next = curLang === 'zh' ? 'en' : 'zh';
        try { localStorage.setItem('knowledge-lang', next); } catch (e) { /* ignore */ }
        applyLang(next);
      });
    }

    ['m1Quote', 'm1R', 'm1Q'].forEach((id) => $(id).addEventListener('input', drawM1));
    $('m1Snap').addEventListener('click', () => {
      const rPct = parseFloat($('m1R').value);
      const qPct = parseFloat($('m1Q').value);
      const d = M.forward.compute({ S0: 100, rPct, qPct, T: 1, Fquote: 100 });
      $('m1Quote').value = d.Ffair.toFixed(2);
      drawM1();
    });

    ['m2ST', 'm2K', 'm2Sig'].forEach((id) => $(id).addEventListener('input', drawM2));
    document.querySelectorAll('input[name="m2Strat"]').forEach((el) => el.addEventListener('change', drawM2));

    ['m3Preal', 'm3K'].forEach((id) => $(id).addEventListener('input', drawM3));
    document.querySelectorAll('input[name="m3Type"]').forEach((el) => el.addEventListener('change', drawM3));

    ['m4Steps', 'm4R', 'm4Q'].forEach((id) => $(id).addEventListener('input', drawM4));
    document.querySelectorAll('input[name="m4Style"]').forEach((el) => el.addEventListener('change', drawM4));

    ['m5Sig', 'm5Mu', 'm5T'].forEach((id) => $(id).addEventListener('input', drawM5));
    $('m5Seed').addEventListener('click', () => { gbmSeed += 13; drawM5(); });

    ['m6Tau', 'm6Sig'].forEach((id) => $(id).addEventListener('input', drawM6));
    document.querySelectorAll('input[name="m6Type"]').forEach((el) => el.addEventListener('change', drawM6));
    $('m6Play').addEventListener('click', playM6);

    ['m7Rv', 'm7Cost', 'm7S', 'm7T'].forEach((id) => $(id).addEventListener('input', drawM7));
    document.querySelectorAll('input[name="m7Mode"], input[name="m7Freq"]').forEach((el) => el.addEventListener('change', drawM7));
    $('m7Seed').addEventListener('click', () => { m7Seed += 11; drawM7(); });

    $('m8Strike').addEventListener('input', drawM8);
    $('m8LogY').addEventListener('change', drawM8);
    document.querySelectorAll('input[name="m8Mode"]').forEach((el) => el.addEventListener('change', drawM8));

    ['m9Rho', 'm9Xi', 'm9Kappa'].forEach((id) => $(id).addEventListener('input', drawM9));

    ['m10Move', 'm10Spread', 'm10Hr'].forEach((id) => $(id).addEventListener('input', drawM10));
    document.querySelectorAll('input[name="m10Mode"]').forEach((el) => el.addEventListener('change', drawM10));

    ['m11Dte', 'm11Shock', 'm11Prem', 'm11Arb'].forEach((id) => $(id).addEventListener('input', drawM11));
    document.querySelectorAll('input[name="m11Mode"]').forEach((el) => el.addEventListener('change', drawM11));

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((ent) => {
          const id = ent.target.id;
          if (ent.isIntersecting) {
            visible.add(id);
            const sim = sims.find((s) => s.ch === id);
            if (sim) sim.draw();
          } else {
            visible.delete(id);
          }
        });
      }, { rootMargin: '120px' });
      sims.forEach((s) => {
        const el = $(s.ch);
        if (el) io.observe(el);
      });
    }

    let resizeT = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeT);
      resizeT = setTimeout(redrawAll, 90);
    });

    applyLang(curLang);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
