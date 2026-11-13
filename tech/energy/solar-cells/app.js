/* Solar Cells: How Much Electricity Can One Photon Make? — canvas wiring, i18n, and IntersectionObserver gating.
 * All pure physics/economic computations live in SolarModels (models.js). */
(function () {
  'use strict';

  const M = window.SolarModels;
  const COPY = window.ESSAY_COPY || {};
  const FALLBACK = COPY.zh || {};
  const $ = id => document.getElementById(id);

  let lang = 'zh';
  try {
    const saved = localStorage.getItem('knowledge-lang');
    if (saved === 'en' && COPY.en) lang = 'en';
  } catch (e) {}

  function dict() { return COPY[lang] || FALLBACK; }
  function t(key, vars) {
    let s = dict()[key];
    if (s == null) s = FALLBACK[key];
    if (s == null) return key;
    if (vars) {
      for (const k in vars) s = s.replace(new RegExp('\\{' + k + '\\}', 'g'), String(vars[k]));
    }
    return s;
  }

  const reducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const COLORS = {
    bg: '#0f1219', grid: '#1e2433', axis: '#394256', ink: '#ebe8e0', mute: '#9aa3b2',
    gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', orange: '#f0a35e'
  };

  function fit(cv) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = cv.getBoundingClientRect();
    const W = Math.max(240, Math.round(rect.width));
    const H = Math.max(100, Math.round(rect.height));
    const pw = Math.round(W * dpr), ph = Math.round(H * dpr);
    if (cv.width !== pw || cv.height !== ph) { cv.width = pw; cv.height = ph; }
    const ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, W, H };
  }

  function clearBg(ctx, W, H) {
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, W, H);
  }

  function drawGrid(ctx, pad, W, H, xTicks, yTicks, xFmt, yFmt, xLabel, yLabel) {
    const pw = W - pad.l - pad.r;
    const ph = H - pad.t - pad.b;
    ctx.save();
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    ctx.font = '11px ui-monospace,Menlo,Consolas,monospace';
    ctx.fillStyle = COLORS.mute;

    // Horizontal grid & Y labels
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    yTicks.forEach(tk => {
      const y = pad.t + ph * (1 - tk.u);
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(pad.l + pw, y); ctx.stroke();
      ctx.fillText(yFmt(tk.v), pad.l - 7, y);
    });

    // Vertical grid & X labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    xTicks.forEach((tk, idx) => {
      const x = pad.l + pw * tk.u;
      ctx.beginPath(); ctx.moveTo(x, pad.t); ctx.lineTo(x, pad.t + ph); ctx.stroke();
      if (W >= 400 || idx % 2 === 0 || idx === xTicks.length - 1) {
        ctx.fillText(xFmt(tk.v), x, pad.t + ph + 7);
      }
    });

    // Axes border
    ctx.strokeStyle = COLORS.axis;
    ctx.beginPath();
    ctx.moveTo(pad.l, pad.t);
    ctx.lineTo(pad.l, pad.t + ph);
    ctx.lineTo(pad.l + pw, pad.t + ph);
    ctx.stroke();

    // Axis titles positioned inside safe margins so zero overlap
    ctx.font = '11px system-ui,-apple-system,sans-serif';
    ctx.fillStyle = COLORS.mute;
    if (yLabel) {
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(yLabel, pad.l, pad.t - 6);
    }
    if (xLabel) {
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText(xLabel, pad.l + pw, H - 3);
    }
    ctx.restore();
    return { pw, ph };
  }

  function drawPillLabel(ctx, text, x, y, bgColor, fgColor, align = 'center') {
    ctx.save();
    ctx.font = '600 11px ui-monospace,Menlo,Consolas,monospace';
    const w = ctx.measureText(text).width + 12;
    const h = 20;
    let rx = x - w / 2;
    if (align === 'left') rx = x;
    if (align === 'right') rx = x - w;
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.roundRect(rx, y - h / 2, w, h, 5);
    ctx.fill();
    ctx.fillStyle = fgColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, rx + w / 2, y + 0.5);
    ctx.restore();
  }

  /* ── Registry of gated sims (IntersectionObserver) ── */
  const sims = [];
  function registerSim(el, drawFn) {
    const rec = { el, draw: drawFn, visible: false };
    sims.push(rec);
  }

  function initObserver() {
    if (!('IntersectionObserver' in window)) {
      sims.forEach(s => { s.visible = true; s.draw(); });
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        const rec = sims.find(s => s.el === en.target);
        if (!rec) return;
        rec.visible = en.isIntersecting;
        if (rec.visible) rec.draw();
      });
    }, { rootMargin: '120px 0px' });
    sims.forEach(s => io.observe(s.el));
  }

  /* ───── 01 · Solar Spectrum ───── */
  function updateCh1Text() {
    const am = parseFloat($('c1Am').value);
    const mode = document.querySelector('input[name="c1Mode"]:checked').value;
    $('c1Amo').textContent = t('ch1.unit.am', { v: am.toFixed(1) });
    const sp = M.spectrum.sample(am);
    $('c1Power').textContent = t('ch1.unit.wm2', { v: sp.totalPower.toFixed(0) });
    $('c1Flux').textContent = t('ch1.unit.flux', { v: (sp.totalFlux / 1e21).toFixed(2) });
    $('c1Vis').textContent = t('ch1.unit.pct', { v: (sp.visShare * 100).toFixed(0) });
    $('c1Ir').textContent = t('ch1.unit.pct', { v: (sp.irShare * 100).toFixed(0) });

    const vars = {
      am: am.toFixed(1),
      p: sp.totalPower.toFixed(0),
      f: (sp.totalFlux / 1e21).toFixed(2),
      vis: (sp.visShare * 100).toFixed(0),
      ir: (sp.irShare * 100).toFixed(0),
      uv: (sp.uvShare * 100).toFixed(1)
    };
    if (am < 0.15) $('c1Say').innerHTML = t('ch1.say.space', vars);
    else if (am <= 1.7) $('c1Say').innerHTML = t('ch1.say.std', vars);
    else $('c1Say').innerHTML = t('ch1.say.low', vars);
    return { sp, mode };
  }

  function drawCh1() {
    const { sp, mode } = updateCh1Text();
    const { ctx, W, H } = fit($('c1Cv'));
    clearBg(ctx, W, H);
    const pad = { l: W < 400 ? 44 : 54, r: 16, t: 28, b: 36 };
    const lamMin = 280, lamMax = 2400;
    const xU = nm => (nm - lamMin) / (lamMax - lamMin);
    const yMax = mode === 'power' ? 2.4 : 7.5;

    // Faint spectral region strips (UV < 380, Vis 380..780, IR > 780)
    const pw = W - pad.l - pad.r, ph = H - pad.t - pad.b;
    const x380 = pad.l + pw * xU(380), x780 = pad.l + pw * xU(780);
    ctx.fillStyle = 'rgba(179,157,251,0.06)';
    ctx.fillRect(pad.l, pad.t, x380 - pad.l, ph);
    const visGrad = ctx.createLinearGradient(x380, 0, x780, 0);
    visGrad.addColorStop(0, 'rgba(130,110,255,0.12)');
    visGrad.addColorStop(0.35, 'rgba(99,199,230,0.10)');
    visGrad.addColorStop(0.65, 'rgba(122,214,160,0.10)');
    visGrad.addColorStop(1, 'rgba(240,122,109,0.12)');
    ctx.fillStyle = visGrad;
    ctx.fillRect(x380, pad.t, x780 - x380, ph);

    const xTicks = [400, 800, 1200, 1600, 2000, 2400].map(v => ({ v, u: xU(v) }));
    const yTicks = mode === 'power'
      ? [0, 0.6, 1.2, 1.8, 2.4].map(v => ({ v, u: v / yMax }))
      : [0, 2, 4, 6].map(v => ({ v, u: v / yMax }));
    drawGrid(
      ctx, pad, W, H, xTicks, yTicks,
      v => String(v),
      v => mode === 'power' ? v.toFixed(1) : String(v),
      t('ch1.cv.lam'),
      mode === 'power' ? t('ch1.cv.yP') : t('ch1.cv.yF')
    );

    // Region labels well clear of peak (placed top-right or near baseline)
    ctx.save();
    ctx.font = '11px system-ui,-apple-system,sans-serif';
    ctx.fillStyle = COLORS.mute;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    if (W >= 360) ctx.fillText(t('ch1.cv.vis'), (x380 + x780) / 2, pad.t + 6);
    ctx.fillText(t('ch1.cv.ir'), (x780 + pad.l + pw) / 2, pad.t + 6);
    ctx.restore();

    const yOf = pt => {
      const val = mode === 'power' ? pt.I : pt.phi17;
      return pad.t + ph * (1 - Math.min(1, val / yMax));
    };
    const yOfBB = pt => {
      const val = mode === 'power' ? pt.bb : (pt.bb / (pt.E * M.Q)) / 1e17;
      return pad.t + ph * (1 - Math.min(1, val / yMax));
    };

    // Dashed AM0 reference
    ctx.save();
    ctx.strokeStyle = COLORS.mute;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    sp.pts.forEach((pt, i) => {
      if (pt.nm > lamMax) return;
      const x = pad.l + pw * xU(pt.nm), y = yOfBB(pt);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.restore();

    // Filled active spectrum
    ctx.save();
    ctx.beginPath();
    let started = false, lastX = pad.l;
    sp.pts.forEach(pt => {
      if (pt.nm > lamMax) return;
      const x = pad.l + pw * xU(pt.nm), y = yOf(pt);
      if (!started) { ctx.moveTo(x, pad.t + ph); ctx.lineTo(x, y); started = true; }
      else ctx.lineTo(x, y);
      lastX = x;
    });
    ctx.lineTo(lastX, pad.t + ph);
    ctx.closePath();
    ctx.fillStyle = 'rgba(233,185,73,0.18)';
    ctx.fill();

    ctx.beginPath();
    sp.pts.forEach((pt, i) => {
      if (pt.nm > lamMax) return;
      const x = pad.l + pw * xU(pt.nm), y = yOf(pt);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = COLORS.gold;
    ctx.lineWidth = 2.2;
    ctx.stroke();
    ctx.restore();
  }

  /* ───── 02 · Bandgap Spectrum Slicer ───── */
  function updateCh2Text() {
    const eg = parseFloat($('c2Eg').value);
    $('c2Ego').textContent = t('ch2.unit.ev', { v: eg.toFixed(2) });
    // Sync preset radio only if matching closely
    document.querySelectorAll('input[name="c2Mat"]').forEach(r => {
      const m = M.bandgap.MATERIALS.find(x => x.id === r.value);
      r.checked = m ? Math.abs(m.eg - eg) < 0.015 : false;
    });

    const res = M.bandgap.analyze(eg);
    $('c2Cut').textContent = t('ch2.unit.nm', { v: res.lamCut.toFixed(0) });
    $('c2Edge').textContent = t('ch2.unit.pct', { v: (res.edgeShare * 100).toFixed(1) });
    $('c2Therm').textContent = t('ch2.unit.pct', { v: (res.thermShare * 100).toFixed(1) });
    $('c2Below').textContent = t('ch2.unit.pct', { v: (res.belowShare * 100).toFixed(1) });

    const vars = {
      eg: eg.toFixed(2),
      lam: res.lamCut.toFixed(0),
      below: (res.belowShare * 100).toFixed(1),
      therm: (res.thermShare * 100).toFixed(1),
      edge: (res.edgeShare * 100).toFixed(1),
      jsc: res.jscMaCm2.toFixed(1)
    };
    if (eg < 0.90) $('c2Say').innerHTML = t('ch2.say.low', vars);
    else if (eg <= 1.50) $('c2Say').innerHTML = t('ch2.say.mid', vars);
    else $('c2Say').innerHTML = t('ch2.say.high', vars);
    return res;
  }

  function drawCh2() {
    const res = updateCh2Text();
    const { ctx, W, H } = fit($('c2Cv'));
    clearBg(ctx, W, H);
    const pad = { l: W < 400 ? 44 : 54, r: 16, t: 28, b: 36 };
    const lamMin = 280, lamMax = 2400, yMax = 2.0;
    const pw = W - pad.l - pad.r, ph = H - pad.t - pad.b;
    const xAt = nm => pad.l + pw * ((nm - lamMin) / (lamMax - lamMin));
    const yAt = val => pad.t + ph * (1 - Math.min(1, val / yMax));

    drawGrid(
      ctx, pad, W, H,
      [400, 800, 1200, 1600, 2000, 2400].map(v => ({ v, u: (v - lamMin) / (lamMax - lamMin) })),
      [0, 0.5, 1.0, 1.5, 2.0].map(v => ({ v, u: v / yMax })),
      v => String(v), v => v.toFixed(1),
      t('ch2.cv.lam'), t('ch2.cv.e')
    );

    const cut = Math.min(lamMax, Math.max(lamMin, res.lamCut));
    const above = res.curve.filter(p => p.nm <= cut);
    const below = res.curve.filter(p => p.nm >= cut);

    // 1. Band-edge energy (gold)
    if (above.length > 1) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(xAt(above[0].nm), yAt(0));
      above.forEach(p => ctx.lineTo(xAt(p.nm), yAt(p.iEdge)));
      ctx.lineTo(xAt(above[above.length - 1].nm), yAt(0));
      ctx.closePath();
      ctx.fillStyle = 'rgba(233,185,73,0.45)';
      ctx.fill();

      // 2. Thermalization heat (orange, stacked on iEdge up to I)
      ctx.beginPath();
      above.forEach((p, i) => {
        const x = xAt(p.nm), y = yAt(p.I);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      for (let i = above.length - 1; i >= 0; i--) {
        ctx.lineTo(xAt(above[i].nm), yAt(above[i].iEdge));
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(240,163,94,0.42)';
      ctx.fill();
      ctx.restore();
    }

    // 3. Unabsorbed transmission (dim red)
    if (below.length > 1) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(xAt(below[0].nm), yAt(0));
      below.forEach(p => ctx.lineTo(xAt(p.nm), yAt(p.I)));
      ctx.lineTo(xAt(below[below.length - 1].nm), yAt(0));
      ctx.closePath();
      ctx.fillStyle = 'rgba(240,122,109,0.34)';
      ctx.fill();
      ctx.restore();
    }

    // Outer AM1.5G outline
    ctx.save();
    ctx.beginPath();
    res.curve.forEach((p, i) => {
      const x = xAt(p.nm), y = yAt(p.I);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Cutoff vertical marker
    if (res.lamCut <= lamMax) {
      const xc = xAt(res.lamCut);
      ctx.strokeStyle = COLORS.cyan;
      ctx.lineWidth = 1.8;
      ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(xc, pad.t); ctx.lineTo(xc, pad.t + ph); ctx.stroke();
      ctx.setLineDash([]);
      const lbl = t('ch2.cv.cut', { lam: res.lamCut.toFixed(0) });
      const align = xc > W - 110 ? 'right' : (xc < pad.l + 80 ? 'left' : 'center');
      drawPillLabel(ctx, lbl, xc, pad.t + 14, 'rgba(20,24,33,0.92)', COLORS.cyan, align);
    }
    ctx.restore();
  }

  /* ───── 03 · Shockley-Queisser Limit ───── */
  function updateCh3Text() {
    const eg = parseFloat($('c3Eg').value);
    const logEre = parseFloat($('c3Ere').value);
    const ere = Math.pow(10, logEre);
    const X = parseFloat(document.querySelector('input[name="c3X"]:checked').value);
    $('c3Ego').textContent = t('ch3.unit.ev', { v: eg.toFixed(2) });
    const erePct = ere * 100;
    $('c3Ereo').textContent = erePct >= 1 ? erePct.toFixed(0) + '%' : (erePct >= 0.1 ? erePct.toFixed(1) + '%' : erePct.toFixed(2) + '%');

    const res = M.sq.eval(eg, { X, ere });
    $('c3Eta').textContent = t('ch3.unit.pct', { v: (res.eta * 100).toFixed(1) });
    $('c3Voc').textContent = t('ch3.unit.v', { v: res.voc.toFixed(3) });
    $('c3Ff').textContent = t('ch3.unit.pct', { v: (res.ff * 100).toFixed(1) });
    $('c3Loss').textContent = t('ch3.unit.pct', { v: (res.radCarnotShare * 100).toFixed(1) });

    const vars = {
      eg: eg.toFixed(2),
      eta: (res.eta * 100).toFixed(1),
      voc: res.voc.toFixed(3),
      drop: Math.max(0, eg - res.voc).toFixed(2),
      below: (res.belowShare * 100).toFixed(1),
      therm: (res.thermShare * 100).toFixed(1),
      rad: (res.radCarnotShare * 100).toFixed(1),
      ere: erePct >= 1 ? erePct.toFixed(0) : erePct.toFixed(2),
      x: String(X)
    };
    if (logEre < -0.1) $('c3Say').innerHTML = t('ch3.say.defect', vars);
    else if (X > 1.5) $('c3Say').innerHTML = t('ch3.say.conc', vars);
    else $('c3Say').innerHTML = t('ch3.say.ideal', vars);

    return { eg, ere, X, res };
  }

  function drawCh3() {
    const { eg, ere, X, res } = updateCh3Text();

    // Top curve canvas
    const top = fit($('c3Cv'));
    clearBg(top.ctx, top.W, top.H);
    const pad = { l: top.W < 400 ? 42 : 52, r: 16, t: 28, b: 36 };
    const egMin = 0.5, egMax = 2.4, etaMax = 45;
    const pw = top.W - pad.l - pad.r, ph = top.H - pad.t - pad.b;
    const xAt = e => pad.l + pw * ((e - egMin) / (egMax - egMin));
    const yAt = p => pad.t + ph * (1 - Math.min(1, (p * 100) / etaMax));

    drawGrid(
      top.ctx, pad, top.W, top.H,
      [0.6, 0.9, 1.2, 1.5, 1.8, 2.1, 2.4].map(v => ({ v, u: (v - egMin) / (egMax - egMin) })),
      [0, 10, 20, 30, 40].map(v => ({ v, u: v / etaMax })),
      v => v.toFixed(1), v => v + '%',
      t('ch3.cv.eg'), t('ch3.cv.eta')
    );

    const idealCurve = M.sq.sweep({ X: 1, ere: 1 }, egMin, egMax, 0.04);
    const actCurve = (X === 1 && ere === 1) ? idealCurve : M.sq.sweep({ X, ere }, egMin, egMax, 0.04);

    top.ctx.save();
    // Dashed ideal 1-sun reference
    top.ctx.strokeStyle = COLORS.cyan;
    top.ctx.lineWidth = 1.7;
    top.ctx.setLineDash([5, 4]);
    top.ctx.beginPath();
    idealCurve.forEach((pt, i) => {
      const x = xAt(pt.Eg), y = yAt(pt.eta);
      if (i === 0) top.ctx.moveTo(x, y); else top.ctx.lineTo(x, y);
    });
    top.ctx.stroke();
    top.ctx.setLineDash([]);

    // Active gold curve
    top.ctx.strokeStyle = COLORS.gold;
    top.ctx.lineWidth = 2.4;
    top.ctx.beginPath();
    actCurve.forEach((pt, i) => {
      const x = xAt(pt.Eg), y = yAt(pt.eta);
      if (i === 0) top.ctx.moveTo(x, y); else top.ctx.lineTo(x, y);
    });
    top.ctx.stroke();

    // Si 1.12 eV reference tick
    const xSi = xAt(1.12);
    top.ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    top.ctx.beginPath(); top.ctx.moveTo(xSi, pad.t + ph); top.ctx.lineTo(xSi, pad.t + ph - 10); top.ctx.stroke();
    top.ctx.fillStyle = COLORS.mute;
    top.ctx.font = '10px ui-monospace,Menlo,Consolas,monospace';
    top.ctx.textAlign = 'center';
    top.ctx.textBaseline = 'bottom';
    top.ctx.fillText('Si', xSi, pad.t + ph - 12);

    // Selected point
    const xp = xAt(eg), yp = yAt(res.eta);
    top.ctx.strokeStyle = COLORS.gold;
    top.ctx.lineWidth = 1;
    top.ctx.setLineDash([3, 3]);
    top.ctx.beginPath(); top.ctx.moveTo(xp, pad.t + ph); top.ctx.lineTo(xp, yp); top.ctx.stroke();
    top.ctx.setLineDash([]);
    top.ctx.fillStyle = COLORS.gold;
    top.ctx.beginPath(); top.ctx.arc(xp, yp, 5.5, 0, Math.PI * 2); top.ctx.fill();
    const pillAlign = xp > top.W - 95 ? 'right' : (xp < pad.l + 80 ? 'left' : 'center');
    drawPillLabel(top.ctx, (res.eta * 100).toFixed(1) + '%', xp, Math.max(pad.t + 14, yp - 18), 'rgba(20,24,33,0.92)', COLORS.gold, pillAlign);
    top.ctx.restore();

    // Bottom stacked bar canvas
    const bot = fit($('c3Cv2'));
    clearBg(bot.ctx, bot.W, bot.H);
    const bPad = { l: 16, r: 16 };
    const bw = bot.W - bPad.l - bPad.r;
    const barY = 50, barH = 34;
    const segs = [
      { key: 'elec', val: res.eta, col: COLORS.green },
      { key: 'nonrad', val: res.nonRadShare, col: COLORS.red },
      { key: 'rad', val: res.radCarnotShare, col: COLORS.violet },
      { key: 'therm', val: res.thermShare, col: COLORS.orange },
      { key: 'below', val: res.belowShare, col: '#69748c' }
    ].filter(s => s.val > 0.002);

    let cx = bPad.l;
    bot.ctx.save();
    bot.ctx.font = '600 11px system-ui,-apple-system,sans-serif';
    segs.forEach((s, idx) => {
      const sw = bw * s.val;
      bot.ctx.fillStyle = s.col;
      bot.ctx.fillRect(cx, barY, Math.max(2, sw - 1), barH);
      const pctStr = (s.val * 100).toFixed(0) + '%';
      if (sw >= 42) {
        bot.ctx.fillStyle = '#0c0e13';
        bot.ctx.textAlign = 'center';
        bot.ctx.textBaseline = 'middle';
        bot.ctx.fillText(pctStr, cx + sw / 2, barY + barH / 2);
      }
      cx += sw;
    });

    // Clean single-row legend above bar
    let lx = bPad.l, ly = 20;
    bot.ctx.font = '12px system-ui,-apple-system,sans-serif';
    segs.forEach(s => {
      const label = t('ch3.cv.' + s.key) + ' ' + (s.val * 100).toFixed(1) + '%';
      const tw = bot.ctx.measureText(label).width + 24;
      if (lx + tw > bot.W - bPad.r && lx > bPad.l) { lx = bPad.l; ly += 18; }
      bot.ctx.fillStyle = s.col;
      bot.ctx.fillRect(lx, ly - 5, 9, 9);
      bot.ctx.fillStyle = COLORS.ink;
      bot.ctx.textAlign = 'left';
      bot.ctx.textBaseline = 'middle';
      bot.ctx.fillText(label, lx + 13, ly);
      lx += tw;
    });
    bot.ctx.restore();
  }

  /* ───── 04 · Real I-V & P-V Curve ───── */
  function updateCh4Text() {
    const G = parseFloat($('c4G').value);
    const TcC = parseFloat($('c4T').value);
    const Rs = parseFloat($('c4Rs').value);
    const Rsh = parseFloat($('c4Rsh').value);
    const n = parseFloat($('c4N').value);
    $('c4Go').textContent = t('ch4.unit.wm2', { v: G.toFixed(0) });
    $('c4To').textContent = t('ch4.unit.deg', { v: TcC.toFixed(0) });
    $('c4Rso').textContent = t('ch4.unit.ohm', { v: Rs.toFixed(1) });
    $('c4Rsho').textContent = t('ch4.unit.ohm', { v: Rsh.toFixed(0) });
    $('c4No').textContent = t('ch4.unit.raw', { v: n.toFixed(2) });

    const res = M.iv.analyze({ G, TcC, Rs, Rsh, n });
    $('c4Eta').textContent = t('ch4.unit.pct', { v: (res.eta * 100).toFixed(1) });
    $('c4Voc').textContent = t('ch4.unit.v', { v: res.voc.toFixed(3) });
    $('c4Jsc').textContent = t('ch4.unit.ma', { v: res.jsc.toFixed(1) });
    $('c4Ff').textContent = t('ch4.unit.pct', { v: (res.ff * 100).toFixed(1) });

    const vars = {
      g: G.toFixed(0), t: TcC.toFixed(0), rs: Rs.toFixed(1), rsh: Rsh.toFixed(0),
      voc: res.voc.toFixed(3), jsc: res.jsc.toFixed(1),
      ff: (res.ff * 100).toFixed(1), pmpp: res.pmpp.toFixed(1), eta: (res.eta * 100).toFixed(1)
    };
    if (Rs >= 2.2) $('c4Say').innerHTML = t('ch4.say.rs', vars);
    else if (Rsh <= 300) $('c4Say').innerHTML = t('ch4.say.rsh', vars);
    else if (TcC >= 48) $('c4Say').innerHTML = t('ch4.say.hot', vars);
    else $('c4Say').innerHTML = t('ch4.say.ok', vars);
    return res;
  }

  function drawCh4() {
    const res = updateCh4Text();
    const { ctx, W, H } = fit($('c4Cv'));
    clearBg(ctx, W, H);
    const pad = { l: W < 400 ? 44 : 52, r: W < 400 ? 42 : 52, t: 28, b: 36 };
    const vMax = 0.85, jMax = 48, pMax = 30;
    const pw = W - pad.l - pad.r, ph = H - pad.t - pad.b;
    const xAt = v => pad.l + pw * Math.min(1, v / vMax);
    const yJ = j => pad.t + ph * (1 - Math.min(1, j / jMax));
    const yP = p => pad.t + ph * (1 - Math.min(1, p / pMax));

    drawGrid(
      ctx, pad, W, H,
      [0, 0.2, 0.4, 0.6, 0.8].map(v => ({ v, u: v / vMax })),
      [0, 12, 24, 36, 48].map(v => ({ v, u: v / jMax })),
      v => v.toFixed(1), v => String(v),
      t('ch4.cv.v'), t('ch4.cv.j')
    );

    // Right Y-axis label for power
    ctx.save();
    ctx.font = '11px system-ui,-apple-system,sans-serif';
    ctx.fillStyle = COLORS.gold;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(t('ch4.cv.p'), pad.l + pw, pad.t - 6);
    ctx.font = '11px ui-monospace,Menlo,Consolas,monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    [0, 10, 20, 30].forEach(pv => {
      ctx.fillText(String(pv), pad.l + pw + 7, yP(pv));
    });
    ctx.restore();

    // MPP rectangle shaded inside Voc*Jsc box
    ctx.save();
    ctx.fillStyle = 'rgba(179,157,251,0.16)';
    const xM = xAt(res.vmpp), yJM = yJ(res.jmpp), y0 = yJ(0);
    ctx.fillRect(pad.l, yJM, xM - pad.l, y0 - yJM);
    ctx.strokeStyle = COLORS.violet;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(pad.l, yJM, xM - pad.l, y0 - yJM);
    ctx.setLineDash([]);

    // Ideal dashed reference curve
    ctx.strokeStyle = COLORS.mute;
    ctx.lineWidth = 1.4;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    res.idealPts.forEach((pt, i) => {
      const x = xAt(pt.V), y = yJ(pt.J);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // J-V curve (cyan)
    ctx.strokeStyle = COLORS.cyan;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    res.pts.forEach((pt, i) => {
      const x = xAt(pt.V), y = yJ(pt.J);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // P-V curve (gold)
    ctx.strokeStyle = COLORS.gold;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    res.pts.forEach((pt, i) => {
      const x = xAt(pt.V), y = yP(pt.P);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // MPP dots on J-V and P-V
    ctx.fillStyle = COLORS.cyan;
    ctx.beginPath(); ctx.arc(xM, yJM, 4.5, 0, Math.PI * 2); ctx.fill();
    const yPM = yP(res.pmpp);
    ctx.fillStyle = COLORS.gold;
    ctx.beginPath(); ctx.arc(xM, yPM, 5, 0, Math.PI * 2); ctx.fill();
    drawPillLabel(ctx, t('ch4.cv.mpp') + ' ' + res.pmpp.toFixed(1), xM, Math.max(pad.t + 16, yPM - 16), 'rgba(20,24,33,0.92)', COLORS.gold, xM > W - 110 ? 'right' : 'center');
    ctx.restore();
  }

  /* ───── 05 · Perovskite-Silicon Tandem ───── */
  function updateCh5Text() {
    const et = parseFloat($('c5Top').value);
    const eb = parseFloat($('c5Bot').value);
    const spec = document.querySelector('input[name="c5Spec"]:checked').value;
    const am = spec === 'am30' ? 3.0 : 1.5;
    $('c5Topo').textContent = t('ch5.unit.ev', { v: et.toFixed(2) });
    $('c5Boto').textContent = t('ch5.unit.ev', { v: eb.toFixed(2) });

    const res = M.tandem.eval(et, eb, { am });
    $('c5Eta2').textContent = t('ch5.unit.pct', { v: (res.eta2T * 100).toFixed(1) });
    $('c5Eta4').textContent = t('ch5.unit.pct', { v: (res.eta4T * 100).toFixed(1) });
    $('c5J1').textContent = t('ch5.unit.ma', { v: res.j1MaCm2.toFixed(1) });
    $('c5J2').textContent = t('ch5.unit.ma', { v: res.j2MaCm2.toFixed(1) });

    const vars = {
      et: et.toFixed(2), eb: eb.toFixed(2),
      j1: res.j1MaCm2.toFixed(1), j2: res.j2MaCm2.toFixed(1),
      e2: (res.eta2T * 100).toFixed(1), e4: (res.eta4T * 100).toFixed(1)
    };
    if (res.mismatchRatio >= 0.92) $('c5Say').innerHTML = t('ch5.say.match', vars);
    else if (res.limitingCell === 'top') $('c5Say').innerHTML = t('ch5.say.top', vars);
    else $('c5Say').innerHTML = t('ch5.say.bot', vars);
    return { et, eb, am, res };
  }

  function drawCh5() {
    const { et, eb, am, res } = updateCh5Text();

    // Top: efficiency vs Eg_top
    const top = fit($('c5Cv'));
    clearBg(top.ctx, top.W, top.H);
    const pad = { l: top.W < 400 ? 42 : 52, r: 16, t: 28, b: 36 };
    const minE = 1.40, maxE = 2.10, etaMax = 50;
    const pw = top.W - pad.l - pad.r, ph = top.H - pad.t - pad.b;
    const xAt = e => pad.l + pw * ((e - minE) / (maxE - minE));
    const yAt = eta => pad.t + ph * (1 - Math.min(1, (eta * 100) / etaMax));

    drawGrid(
      top.ctx, pad, top.W, top.H,
      [1.4, 1.55, 1.7, 1.85, 2.0, 2.1].map(v => ({ v, u: (v - minE) / (maxE - minE) })),
      [10, 20, 30, 40, 50].map(v => ({ v, u: v / etaMax })),
      v => v.toFixed(2), v => v + '%',
      t('ch5.cv.eg'), t('ch5.cv.eta')
    );

    const sweep = M.tandem.sweepTop(eb, am, minE, maxE, 0.025);
    top.ctx.save();
    // 33.4% 1J SQ ceiling
    const ySq = yAt(0.334);
    top.ctx.strokeStyle = COLORS.gold;
    top.ctx.lineWidth = 1.3;
    top.ctx.setLineDash([4, 4]);
    top.ctx.beginPath(); top.ctx.moveTo(pad.l, ySq); top.ctx.lineTo(pad.l + pw, ySq); top.ctx.stroke();

    // 4T dashed violet
    top.ctx.strokeStyle = COLORS.violet;
    top.ctx.lineWidth = 2.0;
    top.ctx.setLineDash([6, 4]);
    top.ctx.beginPath();
    sweep.forEach((pt, i) => {
      const x = xAt(pt.EgTop), y = yAt(pt.eta4T);
      if (i === 0) top.ctx.moveTo(x, y); else top.ctx.lineTo(x, y);
    });
    top.ctx.stroke();
    top.ctx.setLineDash([]);

    // 2T solid cyan
    top.ctx.strokeStyle = COLORS.cyan;
    top.ctx.lineWidth = 2.5;
    top.ctx.beginPath();
    sweep.forEach((pt, i) => {
      const x = xAt(pt.EgTop), y = yAt(pt.eta2T);
      if (i === 0) top.ctx.moveTo(x, y); else top.ctx.lineTo(x, y);
    });
    top.ctx.stroke();

    // Active crosshair
    const xp = xAt(et);
    top.ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    top.ctx.lineWidth = 1;
    top.ctx.beginPath(); top.ctx.moveTo(xp, pad.t); top.ctx.lineTo(xp, pad.t + ph); top.ctx.stroke();
    const y2 = yAt(res.eta2T), y4 = yAt(res.eta4T);
    top.ctx.fillStyle = COLORS.violet;
    top.ctx.beginPath(); top.ctx.arc(xp, y4, 4.5, 0, Math.PI * 2); top.ctx.fill();
    top.ctx.fillStyle = COLORS.cyan;
    top.ctx.beginPath(); top.ctx.arc(xp, y2, 5.5, 0, Math.PI * 2); top.ctx.fill();
    const pillAlign = xp > top.W - 105 ? 'right' : (xp < pad.l + 85 ? 'left' : 'center');
    drawPillLabel(top.ctx, '2T ' + (res.eta2T * 100).toFixed(1) + '%', xp, Math.min(pad.t + ph - 14, y2 + 18), 'rgba(20,24,33,0.92)', COLORS.cyan, pillAlign);
    top.ctx.restore();

    // Bottom: J-V comparison of Top, Bottom, and 2T series
    const bot = fit($('c5Cv2'));
    clearBg(bot.ctx, bot.W, bot.H);
    const bPad = { l: bot.W < 400 ? 42 : 52, r: 16, t: 28, b: 34 };
    const vMax = 2.6, jMax = 45;
    const bpw = bot.W - bPad.l - bPad.r, bph = bot.H - bPad.t - bPad.b;
    const bx = v => bPad.l + bpw * Math.min(1, v / vMax);
    const by = j => bPad.t + bph * (1 - Math.min(1, j / jMax));

    drawGrid(
      bot.ctx, bPad, bot.W, bot.H,
      [0, 0.5, 1.0, 1.5, 2.0, 2.5].map(v => ({ v, u: v / vMax })),
      [0, 15, 30, 45].map(v => ({ v, u: v / jMax })),
      v => v.toFixed(1), v => String(v),
      t('ch4.cv.v'), t('ch5.cv.jv')
    );

    // Draw top & bottom subcell horizontal current ceilings + 2T curve
    bot.ctx.save();
    const yJ1 = by(res.j1MaCm2), yJ2 = by(res.j2MaCm2);
    bot.ctx.setLineDash([4, 4]);
    bot.ctx.strokeStyle = COLORS.gold;
    bot.ctx.beginPath(); bot.ctx.moveTo(bPad.l, yJ1); bot.ctx.lineTo(bx(res.voc1), yJ1); bot.ctx.stroke();
    bot.ctx.strokeStyle = COLORS.green;
    bot.ctx.beginPath(); bot.ctx.moveTo(bPad.l, yJ2); bot.ctx.lineTo(bx(res.voc2), yJ2); bot.ctx.stroke();
    bot.ctx.setLineDash([]);

    // 2T series J-V
    bot.ctx.strokeStyle = COLORS.cyan;
    bot.ctx.lineWidth = 2.4;
    bot.ctx.beginPath();
    res.jv2T.forEach((pt, i) => {
      const x = bx(pt.V), y = by(pt.J);
      if (i === 0) bot.ctx.moveTo(x, y); else bot.ctx.lineTo(x, y);
    });
    bot.ctx.stroke();

    // Direct short labels well separated on right side
    bot.ctx.font = '11px ui-monospace,Menlo,Consolas,monospace';
    bot.ctx.textAlign = 'left';
    bot.ctx.textBaseline = 'middle';
    const lx = bx(Math.min(2.15, res.voc2T)) + 6;
    const tx = Math.min(bot.W - 88, Math.max(bPad.l + 8, lx));
    bot.ctx.fillStyle = COLORS.gold;
    bot.ctx.fillText('J1=' + res.j1MaCm2.toFixed(1), bPad.l + 6, Math.max(bPad.t + 10, yJ1 - 9));
    bot.ctx.fillStyle = COLORS.green;
    bot.ctx.fillText('J2=' + res.j2MaCm2.toFixed(1), bPad.l + 80, Math.min(bPad.t + bph - 10, yJ2 + 10));
    bot.ctx.fillStyle = COLORS.cyan;
    bot.ctx.fillText('2T Voc ' + res.voc2T.toFixed(2) + 'V', tx, bPad.t + bph - 14);
    bot.ctx.restore();
  }

  /* ───── 06 · Grid Duck Curve & Battery Pairing ───── */
  function updateCh6Text() {
    const scale = parseFloat($('c6Scale').value);
    const bat = parseFloat($('c6Bat').value);
    const eta = parseFloat($('c6Eta').value) / 100;
    $('c6Scaleo').textContent = t('ch6.unit.x', { v: scale.toFixed(1) });
    $('c6Bato').textContent = t('ch6.unit.gwh', { v: bat.toFixed(0) });
    $('c6Etao').textContent = t('ch6.unit.pct', { v: (eta * 100).toFixed(0) });

    const res = M.grid.simulateGwh(scale, bat, eta, true);
    $('c6Usable').textContent = t('ch6.unit.pct', { v: (res.solarGridShare * 100).toFixed(1) });
    $('c6Curt').textContent = t('ch6.unit.pct', { v: (res.curtailShare * 100).toFixed(1) });
    $('c6Peak').textContent = t('ch6.unit.gw', { v: res.eveningPeakGw.toFixed(1) });
    $('c6Ramp').textContent = t('ch6.unit.gw', { v: res.ramp3.toFixed(1) });

    const vars = {
      s: scale.toFixed(1), bat: bat.toFixed(0), eta: (eta * 100).toFixed(0),
      pot: res.solarPotentialGwh.toFixed(1),
      curt: (res.curtailShare * 100).toFixed(1),
      cgwh: res.curtailedSolarGwh.toFixed(1),
      peak: res.eveningPeakGw.toFixed(1),
      ramp: res.ramp3.toFixed(1),
      use: (res.solarGridShare * 100).toFixed(1)
    };
    if (bat < 1) $('c6Say').innerHTML = t('ch6.say.notsun', vars);
    else if (res.curtailShare > 0.25) $('c6Say').innerHTML = t('ch6.say.curt', vars);
    else $('c6Say').innerHTML = t('ch6.say.bat', vars);
    return res;
  }

  function drawCh6() {
    const res = updateCh6Text();
    const { ctx, W, H } = fit($('c6Cv'));
    clearBg(ctx, W, H);
    const pad = { l: W < 400 ? 42 : 50, r: 16, t: 28, b: 36 };
    const yMin = -20, yMax = 30;
    const pw = W - pad.l - pad.r, ph = H - pad.t - pad.b;
    const xAt = h => pad.l + pw * (h / 23);
    const yAt = gw => pad.t + ph * (1 - (gw - yMin) / (yMax - yMin));

    drawGrid(
      ctx, pad, W, H,
      [0, 4, 8, 12, 16, 20, 23].map(v => ({ v, u: v / 23 })),
      [-20, -10, 0, 10, 20, 30].map(v => ({ v, u: (v - yMin) / (yMax - yMin) })),
      v => v + 'h', v => String(v),
      t('ch6.cv.h'), t('ch6.cv.gw')
    );

    const floor = M.grid.floorGw;
    const yFloor = yAt(floor), yZero = yAt(0);

    // Zero line
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.16)';
    ctx.beginPath(); ctx.moveTo(pad.l, yZero); ctx.lineTo(pad.l + pw, yZero); ctx.stroke();

    // Floor line (3 GW)
    ctx.strokeStyle = COLORS.red;
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(pad.l, yFloor); ctx.lineTo(pad.l + pw, yFloor); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = COLORS.red;
    ctx.font = '10px ui-monospace,Menlo,Consolas,monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(t('ch6.cv.floor'), pad.l + 6, yFloor - 3);

    // Battery charge (green) and discharge (orange) bars per hour
    const barW = Math.max(4, pw / 24 - 2);
    for (let h = 0; h < 24; h++) {
      const x = xAt(h) - barW / 2;
      if (res.inn[h] > 0.05) {
        const y1 = yAt(res.netRaw[h]), y2 = yAt(res.after[h]);
        ctx.fillStyle = 'rgba(122,214,160,0.45)';
        ctx.fillRect(x, Math.min(y1, y2), barW, Math.abs(y2 - y1));
      }
      if (res.out[h] > 0.05) {
        const y1 = yAt(res.netRaw[h]), y2 = yAt(res.after[h]);
        ctx.fillStyle = 'rgba(240,163,94,0.45)';
        ctx.fillRect(x, Math.min(y1, y2), barW, Math.abs(y2 - y1));
      }
      if (res.after[h] < floor) {
        const ya = yAt(Math.max(yMin, res.after[h]));
        ctx.fillStyle = 'rgba(240,122,109,0.36)';
        ctx.fillRect(x, yFloor, barW, ya - yFloor);
      }
    }

    // Total demand dashed
    ctx.strokeStyle = COLORS.mute;
    ctx.lineWidth = 1.6;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    res.demand.forEach((d, h) => {
      const x = xAt(h), y = yAt(d);
      if (h === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Net load after storage (gold)
    ctx.strokeStyle = COLORS.gold;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    res.after.forEach((v, h) => {
      const x = xAt(h), y = yAt(Math.max(yMin, v));
      if (h === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.restore();
  }

  /* ───── 07 · Swanson's Law & BOS Split ───── */
  function updateCh7Text() {
    const lr = parseFloat($('c7Lr').value) / 100;
    const bos = parseFloat($('c7Bos').value);
    const eff = parseFloat($('c7Eff').value) / 100;
    $('c7Lro').textContent = t('ch7.unit.pct', { v: (lr * 100).toFixed(1) });
    $('c7Boso').textContent = t('ch7.unit.usd', { v: bos.toFixed(2) });
    $('c7Effo').textContent = t('ch7.unit.pct', { v: (eff * 100).toFixed(1) });

    const p76 = M.learning.priceAt(0.001, lr);
    const sys = M.learning.systemCost(2974, lr, bos, eff);
    $('c7P76').textContent = t('ch7.unit.usd', { v: p76.toFixed(1) });
    $('c7P25').textContent = t('ch7.unit.usd', { v: sys.modUsdPerW.toFixed(2) });
    $('c7Tot').textContent = t('ch7.unit.usd', { v: sys.totalUsdPerW.toFixed(2) });
    $('c7Share').textContent = t('ch7.unit.pct', { v: (sys.modShare * 100).toFixed(0) });

    const vars = {
      lr: (lr * 100).toFixed(1), p76: p76.toFixed(1),
      mod: sys.modUsdPerW.toFixed(2), bos: sys.bosUsdPerW.toFixed(2),
      tot: sys.totalUsdPerW.toFixed(2), eff: (eff * 100).toFixed(1),
      share: (sys.modShare * 100).toFixed(0)
    };
    if (eff >= 0.27) $('c7Say').innerHTML = t('ch7.say.eff', vars);
    else $('c7Say').innerHTML = t('ch7.say.split', vars);
    return { lr, sys };
  }

  function drawCh7() {
    const { lr, sys } = updateCh7Text();

    // Top log-log curve
    const top = fit($('c7Cv'));
    clearBg(top.ctx, top.W, top.H);
    const pad = { l: top.W < 400 ? 48 : 56, r: 16, t: 28, b: 36 };
    const lxMin = -3, lxMax = 4; // 10^-3 GW (1 MW) to 10^4 GW (10 TW)
    const lyMin = -1.2, lyMax = 2.2; // $0.06/W to $158/W
    const pw = top.W - pad.l - pad.r, ph = top.H - pad.t - pad.b;
    const xAt = gw => pad.l + pw * ((Math.log10(gw) - lxMin) / (lxMax - lxMin));
    const yAt = p => pad.t + ph * (1 - ((Math.log10(p) - lyMin) / (lyMax - lyMin)));

    drawGrid(
      top.ctx, pad, top.W, top.H,
      [-3, -2, -1, 0, 1, 2, 3, 4].map(e => ({ v: e, u: (e - lxMin) / (lxMax - lxMin) })),
      [-1, 0, 1, 2].map(e => ({ v: e, u: (e - lyMin) / (lyMax - lyMin) })),
      e => e === 0 ? '1 GW' : (e === 3 ? '1 TW' : (e === -3 ? '1 MW' : '10^' + e)),
      e => '$' + (e < 0 ? Math.pow(10, e).toFixed(1) : String(Math.pow(10, e))),
      t('ch7.cv.gw'), t('ch7.cv.usdw')
    );

    top.ctx.save();
    // Wright curve
    top.ctx.strokeStyle = COLORS.cyan;
    top.ctx.lineWidth = 2.4;
    top.ctx.beginPath();
    for (let i = 0; i <= 70; i++) {
      const gw = Math.pow(10, lxMin + (lxMax - lxMin) * (i / 70));
      const pr = M.learning.priceAt(gw, lr);
      const x = xAt(gw), y = yAt(pr);
      if (i === 0) top.ctx.moveTo(x, y); else top.ctx.lineTo(x, y);
    }
    top.ctx.stroke();

    // Vertical 2.97 TW marker
    const x25 = xAt(2974);
    top.ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    top.ctx.setLineDash([4, 3]);
    top.ctx.beginPath(); top.ctx.moveTo(x25, pad.t); top.ctx.lineTo(x25, pad.t + ph); top.ctx.stroke();
    top.ctx.setLineDash([]);

    // Milestone points
    M.learning.MILESTONES.forEach((m, idx) => {
      const x = xAt(m.gw), y = yAt(m.usdPerW);
      top.ctx.fillStyle = COLORS.gold;
      top.ctx.beginPath(); top.ctx.arc(x, y, 4.5, 0, Math.PI * 2); top.ctx.fill();
      if (top.W >= 420 || idx % 2 === 0) {
        top.ctx.font = '10px ui-monospace,Menlo,Consolas,monospace';
        top.ctx.fillStyle = COLORS.ink;
        top.ctx.textAlign = idx === M.learning.MILESTONES.length - 1 ? 'right' : 'left';
        top.ctx.textBaseline = 'bottom';
        top.ctx.fillText(String(m.year), idx === M.learning.MILESTONES.length - 1 ? x - 6 : x + 6, y - 4);
      }
    });
    top.ctx.restore();

    // Bottom $/W split bar at 2.97 TW
    const bot = fit($('c7Cv2'));
    clearBg(bot.ctx, bot.W, bot.H);
    const bPad = { l: 16, r: 16 };
    const maxScaleUsd = 1.3; // Fixed $/W visual reference scale so changing BOS or Eff moves bar length!
    const bw = bot.W - bPad.l - bPad.r;
    const barY = 52, barH = 34;
    const wMod = bw * Math.min(1, sys.modUsdPerW / maxScaleUsd);
    const wBos = bw * Math.min(1 - Math.min(1, sys.modUsdPerW / maxScaleUsd), sys.bosUsdPerW / maxScaleUsd);

    bot.ctx.save();
    bot.ctx.font = '12px system-ui,-apple-system,sans-serif';
    bot.ctx.fillStyle = COLORS.mute;
    bot.ctx.textAlign = 'left';
    bot.ctx.textBaseline = 'top';
    bot.ctx.fillText(t('ch7.cv.split') + ': $' + sys.totalUsdPerW.toFixed(2) + '/W', bPad.l, 14);

    bot.ctx.fillStyle = '#1d2433';
    bot.ctx.fillRect(bPad.l, barY, bw, barH);
    bot.ctx.fillStyle = COLORS.green;
    bot.ctx.fillRect(bPad.l, barY, Math.max(2, wMod), barH);
    bot.ctx.fillStyle = COLORS.orange;
    bot.ctx.fillRect(bPad.l + wMod, barY, Math.max(2, wBos), barH);

    bot.ctx.font = '600 11px ui-monospace,Menlo,Consolas,monospace';
    bot.ctx.textBaseline = 'middle';
    if (wMod >= 56) {
      bot.ctx.fillStyle = '#0c0e13';
      bot.ctx.textAlign = 'center';
      bot.ctx.fillText('$' + sys.modUsdPerW.toFixed(2), bPad.l + wMod / 2, barY + barH / 2);
    }
    if (wBos >= 58) {
      bot.ctx.fillStyle = '#0c0e13';
      bot.ctx.textAlign = 'center';
      bot.ctx.fillText('$' + sys.bosUsdPerW.toFixed(2), bPad.l + wMod + wBos / 2, barY + barH / 2);
    }
    const endX = Math.min(bot.W - bPad.r - 4, bPad.l + wMod + wBos + 8);
    if (bPad.l + wMod + wBos + 60 < bot.W - bPad.r) {
      bot.ctx.fillStyle = COLORS.ink;
      bot.ctx.textAlign = 'left';
      bot.ctx.fillText('$' + sys.totalUsdPerW.toFixed(2) + '/W', endX, barY + barH / 2);
    }
    bot.ctx.restore();
  }

  /* ───── 08 · Frontier list & filter ───── */
  function renderFrontier() {
    const ul = $('frList');
    if (!ul) return;
    const filter = (document.querySelector('input[name="c8F"]:checked') || {}).value || 'all';
    ul.innerHTML = '';
    M.frontier.forEach(item => {
      const li = document.createElement('li');
      li.dataset.kind = item.kind;
      if (filter !== 'all' && item.kind !== filter) li.hidden = true;
      const parts = item.date.split('-');
      const dStr = t('ch8.date', { y: parts[0], m: parts[1] });
      const meta = document.createElement('div');
      meta.className = 'meta';
      const tag = document.createElement('span');
      tag.className = 'tag ' + item.kind;
      tag.textContent = t('ch8.kind.' + item.kind);
      const asof = document.createElement('span');
      asof.textContent = t('ch8.asof', { d: dStr });
      meta.appendChild(tag);
      meta.appendChild(asof);

      const txt = document.createElement('div');
      txt.className = 'txt';
      txt.innerHTML = t('fr.' + item.id);
      li.appendChild(meta);
      li.appendChild(txt);
      ul.appendChild(li);
    });
  }

  /* ───── Language Application ───── */
  function applyLang() {
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
    document.title = t('doc.title');
    const md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', t('doc.desc'));

    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
    document.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });

    const btnZh = document.querySelector('#langToggle button[data-lang="zh"]');
    const btnEn = document.querySelector('#langToggle button[data-lang="en"]');
    if (btnZh) btnZh.setAttribute('aria-pressed', String(lang === 'zh'));
    if (btnEn) btnEn.setAttribute('aria-pressed', String(lang === 'en'));

    renderFrontier();
    sims.forEach(s => s.draw());
  }

  /* ───── Wire all controls & events ───── */
  function bindEvents() {
    document.querySelectorAll('#langToggle button').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.lang;
        if (target === 'en' && !COPY.en) return;
        lang = target;
        try { localStorage.setItem('knowledge-lang', lang); } catch (e) {}
        applyLang();
      });
    });

    // Ch 1
    ['input', 'change'].forEach(ev => $('c1Am').addEventListener(ev, drawCh1));
    document.querySelectorAll('input[name="c1Mode"]').forEach(r => r.addEventListener('change', drawCh1));

    // Ch 2
    ['input', 'change'].forEach(ev => $('c2Eg').addEventListener(ev, drawCh2));
    document.querySelectorAll('input[name="c2Mat"]').forEach(r => {
      r.addEventListener('change', () => {
        const m = M.bandgap.MATERIALS.find(x => x.id === r.value);
        if (m) { $('c2Eg').value = String(m.eg); drawCh2(); }
      });
    });

    // Ch 3
    ['input', 'change'].forEach(ev => {
      $('c3Eg').addEventListener(ev, drawCh3);
      $('c3Ere').addEventListener(ev, drawCh3);
    });
    document.querySelectorAll('input[name="c3X"]').forEach(r => r.addEventListener('change', drawCh3));

    // Ch 4
    ['c4G', 'c4T', 'c4Rs', 'c4Rsh', 'c4N'].forEach(id => {
      ['input', 'change'].forEach(ev => $(id).addEventListener(ev, drawCh4));
    });

    // Ch 5
    ['c5Top', 'c5Bot'].forEach(id => {
      ['input', 'change'].forEach(ev => $(id).addEventListener(ev, drawCh5));
    });
    document.querySelectorAll('input[name="c5Spec"]').forEach(r => r.addEventListener('change', drawCh5));

    // Ch 6
    ['c6Scale', 'c6Bat', 'c6Eta'].forEach(id => {
      ['input', 'change'].forEach(ev => $(id).addEventListener(ev, drawCh6));
    });

    // Ch 7
    ['c7Lr', 'c7Bos', 'c7Eff'].forEach(id => {
      ['input', 'change'].forEach(ev => $(id).addEventListener(ev, drawCh7));
    });

    // Ch 8
    document.querySelectorAll('input[name="c8F"]').forEach(r => r.addEventListener('change', renderFrontier));

    window.addEventListener('resize', () => {
      sims.forEach(s => { if (s.visible) s.draw(); });
    });
  }

  registerSim($('c1Cv'), drawCh1);
  registerSim($('c2Cv'), drawCh2);
  registerSim($('c3Cv'), drawCh3);
  registerSim($('c4Cv'), drawCh4);
  registerSim($('c5Cv'), drawCh5);
  registerSim($('c6Cv'), drawCh6);
  registerSim($('c7Cv'), drawCh7);

  bindEvents();
  applyLang();
  initObserver();
})();
