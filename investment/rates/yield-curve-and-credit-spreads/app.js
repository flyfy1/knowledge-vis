/* The Yield Curve and Credit Spreads: wiring, drawing, i18n, and on-screen gating.
 * All visible strings come from copy.zh.js / copy.en.js. Zero CJK characters here. */
(() => {
  'use strict';

  const M = window.YieldCreditModels;
  const COPY = window.ESSAY_COPY || {};
  const $ = (s) => document.querySelector(s);
  const byId = (id) => document.getElementById(id);

  const C = {
    bg: '#0f1219',
    card2: '#1a1f2b',
    line: '#2b3242',
    grid: '#1f2533',
    ink: '#ebe8e0',
    mute: '#a3aab8',
    gold: '#e9b949',
    cyan: '#63c7e6',
    red: '#f07a6d',
    green: '#7ad6a0',
    violet: '#b39dfb'
  };
  const FONT = '11.5px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
  const FONT_SM = '10.5px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
  const FONT_BOLD = '600 11.5px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
  const MINUS = '\u2212';

  /* ───────── Language & Formatting ───────── */
  const LS_KEY = 'knowledge-lang';
  let memLang = null;
  function readLang() { try { return localStorage.getItem(LS_KEY); } catch (e) { return memLang; } }
  function writeLang(v) { memLang = v; try { localStorage.setItem(LS_KEY, v); } catch (e) { /* fallback */ } }

  let lang = readLang();
  if (lang !== 'zh' && lang !== 'en') {
    lang = /^zh/i.test(navigator.language || '') ? 'zh' : 'en';
  }
  const effLang = () => (COPY[lang] ? lang : 'zh');

  function t(key, vars) {
    const d = COPY[lang] || {};
    const dz = COPY.zh || {};
    let s = d[key] != null ? d[key] : (dz[key] != null ? dz[key] : key);
    if (vars) {
      s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? String(vars[k]) : m));
    }
    return s;
  }

  function fmt(x, d = 2) {
    if (!isFinite(x)) return '--';
    const v = Math.abs(x) < 0.5 * Math.pow(10, -d) ? 0 : x;
    return v.toLocaleString(effLang() === 'zh' ? 'zh-CN' : 'en-US', {
      minimumFractionDigits: d,
      maximumFractionDigits: d,
      useGrouping: true
    }).replace('-', MINUS);
  }
  function sgn(x, d = 2) {
    const s = fmt(x, d);
    return Math.abs(x) >= 0.5 * Math.pow(10, -d) && x > 0 ? '+' + s : s;
  }
  const put = (id, str) => { const el = byId(id); if (el && el.textContent !== str) el.textContent = str; };
  const putHTML = (id, html) => { const el = byId(id); if (el && el.__h !== html) { el.innerHTML = html; el.__h = html; } };

  const radios = (name) => [...document.querySelectorAll(`input[name="${name}"]`)];
  const radioVal = (name) => {
    const r = radios(name).find((x) => x.checked);
    return r ? r.value : null;
  };
  const setRadio = (name, v) => radios(name).forEach((r) => { r.checked = r.value === v; });

  /* ───────── Canvas Fit, Safe Anti-Overlap Text & IntersectionObserver ───────── */
  function fit(cv) {
    const r = cv.getBoundingClientRect();
    const w = Math.max(220, Math.round(r.width));
    const h = Math.max(160, Math.round(r.height));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
    }
    const c = cv.getContext('2d');
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.font = FONT;
    c.textBaseline = 'middle';
    c.clearRect(0, 0, w, h);
    return { c, w, h };
  }

  const overlaps = (a, b, pad = 2) =>
    !(a.x + a.w + pad <= b.x || b.x + b.w + pad <= a.x || a.y + a.h + pad <= b.y || b.y + b.h + pad <= a.y);

  function safeText(c, txt, x, y, opts, placed) {
    const o = opts || {};
    const font = o.font || FONT;
    const align = o.align || 'left';
    c.save();
    c.font = font;
    c.fillStyle = o.color || C.mute;
    c.textBaseline = 'middle';
    const tw = c.measureText(txt).width;
    const th = 12;
    let lx = x;
    if (align === 'center') lx = x - tw / 2;
    else if (align === 'right') lx = x - tw;
    const minX = o.minX != null ? o.minX : 4;
    const maxX = o.maxX != null ? o.maxX : (c.canvas.clientWidth || 600) - 4;
    const minY = o.minY != null ? o.minY : 8;
    const maxY = o.maxY != null ? o.maxY : (c.canvas.clientHeight || 300) - 8;
    lx = Math.max(minX, Math.min(lx, maxX - tw));
    const cy = Math.max(minY, Math.min(y, maxY));
    const box = { x: lx, y: cy - th / 2, w: tw, h: th };
    if (placed) {
      let conflict = placed.some((p) => overlaps(box, p, 2));
      if (conflict && o.shiftY) {
        const up = { x: lx, y: box.y - 14, w: tw, h: th };
        const dn = { x: lx, y: box.y + 14, w: tw, h: th };
        if (up.y >= minY - 6 && placed.every((p) => !overlaps(up, p, 2))) {
          box.y = up.y;
          conflict = false;
        } else if (dn.y + th <= maxY + 6 && placed.every((p) => !overlaps(dn, p, 2))) {
          box.y = dn.y;
          conflict = false;
        }
      }
      if (conflict) {
        c.restore();
        return false;
      }
      placed.push(box);
    }
    c.textAlign = 'left';
    c.fillText(txt, box.x, box.y + th / 2);
    c.restore();
    return true;
  }

  function frame(w, h, m, x0, x1, y0, y1) {
    const L = m[3], R = w - m[1], T = m[0], B = h - m[2];
    const dx = x1 - x0 || 1;
    const dy = y1 - y0 || 1;
    return {
      L, R, T, B, x0, x1, y0, y1,
      X: (x) => L + ((R - L) * (x - x0)) / dx,
      Y: (y) => B - ((B - T) * (y - y0)) / dy
    };
  }

  function nice(lo, hi, n = 4) {
    if (hi - lo < 1e-9) { lo -= 1; hi += 1; }
    const raw = (hi - lo) / n;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const step = [1, 2, 2.5, 5, 10].map((k) => k * mag).find((s) => s >= raw * 0.999) || raw;
    const a = Math.floor(lo / step + 1e-9) * step;
    const b = Math.ceil(hi / step - 1e-9) * step;
    const ticks = [];
    for (let v = a; v <= b + step * 1e-6; v += step) ticks.push(Math.abs(v) < step * 1e-6 ? 0 : v);
    const isInt = (v) => Math.abs(v - Math.round(v)) < 1e-9;
    const dec = isInt(step) ? 0 : isInt(step * 10) ? 1 : 2;
    return { lo: a, hi: b, ticks, dec };
  }

  function drawAxes(c, f, xLab, yLab, placed, opts) {
    const o = opts || {};
    c.save();
    c.strokeStyle = C.line;
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(f.L, f.T);
    c.lineTo(f.L, f.B);
    c.lineTo(f.R, f.B);
    c.stroke();
    c.restore();
    if (yLab) {
      safeText(c, yLab, f.L + 2, f.T - 12, { font: FONT_SM, color: C.mute, minX: 4, maxX: f.R }, placed);
    }
    if (xLab && !o.hideXLab) {
      safeText(c, xLab, (f.L + f.R) / 2, f.B + 28, { align: 'center', font: FONT_SM, color: C.mute, maxY: f.B + 36 }, placed);
    }
  }

  function drawYTicks(c, f, ticks, dec, fmtFn, placed) {
    for (const v of ticks) {
      const y = f.Y(v);
      c.save();
      c.strokeStyle = C.grid;
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(f.L, y);
      c.lineTo(f.R, y);
      c.stroke();
      c.restore();
      const label = fmtFn ? fmtFn(v, dec) : fmt(v, dec);
      safeText(c, label, f.L - 6, y, { align: 'right', font: FONT_SM, color: C.mute, minX: 2 }, placed);
    }
  }

  function drawXTicks(c, f, vals, fmtFn, placed) {
    for (const v of vals) {
      const x = f.X(v);
      c.save();
      c.strokeStyle = C.line;
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(x, f.B);
      c.lineTo(x, f.B + 4);
      c.stroke();
      c.restore();
      safeText(c, fmtFn ? fmtFn(v) : String(v), x, f.B + 14, { align: 'center', font: FONT_SM, color: C.mute }, placed);
    }
  }

  function poly(c, pts, color, opts) {
    if (!pts.length) return;
    const o = opts || {};
    c.save();
    c.strokeStyle = color;
    c.lineWidth = o.w || 2.2;
    if (o.dash) c.setLineDash(o.dash);
    c.beginPath();
    pts.forEach((p, i) => (i === 0 ? c.moveTo(p[0], p[1]) : c.lineTo(p[0], p[1])));
    c.stroke();
    c.restore();
  }

  /* ───────── Reactive Model Registry + On-screen Gating ───────── */
  const sims = [];
  const texts = [];
  let rafScheduled = false;

  function scheduleRender() {
    if (rafScheduled) return;
    rafScheduled = true;
    requestAnimationFrame(() => {
      rafScheduled = false;
      for (const s of sims) {
        if (s.vis && s.dirty) {
          s.dirty = false;
          s.draw();
        }
      }
    });
  }

  const io = new IntersectionObserver((entries) => {
    for (const ent of entries) {
      for (const s of sims) {
        if (s.cv === ent.target) {
          s.vis = ent.isIntersecting;
          if (s.vis) s.dirty = true;
        }
      }
    }
    scheduleRender();
  }, { rootMargin: '80px' });

  function regModel(cvId, draw, textFn, inputs) {
    const cv = byId(cvId);
    const sim = { cv, draw, vis: false, dirty: true };
    sims.push(sim);
    io.observe(cv);
    const update = () => {
      sim.dirty = true;
      textFn();
      scheduleRender();
    };
    texts.push(textFn);
    inputs.forEach((el) => {
      if (!el) return;
      el.addEventListener(el.type === 'range' ? 'input' : 'change', update);
    });
    return update;
  }

  window.addEventListener('resize', () => {
    for (const s of sims) s.dirty = true;
    scheduleRender();
  });

  /* ───────── Chapter 1: Bootstrapping Spot & Forward Curves ───────── */
  function getM1Yields() {
    const pre = radioVal('m1Pre');
    if (pre === 'custom') {
      return M.boot.customCurve(
        parseFloat(byId('m1Y2').value),
        parseFloat(byId('m1Y10').value),
        parseFloat(byId('m1Y30').value)
      );
    }
    return M.boot.presets[pre] || M.boot.presets.nov2026;
  }
  function syncM1PresetSliders() {
    const pre = radioVal('m1Pre');
    const customBox = byId('m1CustomCtl');
    const isCustom = pre === 'custom';
    customBox.classList.toggle('hidden', !isCustom);
    if (!isCustom) {
      const ys = M.boot.presets[pre] || M.boot.presets.nov2026;
      byId('m1Y2').value = ys[1];
      byId('m1Y10').value = ys[5];
      byId('m1Y30').value = ys[7];
    }
  }
  function drawM1() {
    const cv = byId('m1Cv');
    const { c, w, h } = fit(cv);
    const placed = [];
    const ys = getM1Yields();
    const b = M.boot.bootstrap(ys, 30);
    const showDf = byId('m1ShowDF').checked;
    const allRates = [...b.par, ...b.spot, ...b.fwd];
    const rn = nice(Math.max(0, Math.min(...allRates) - 0.3), Math.max(...allRates) + 0.3, 4);
    const rm = showDf ? 48 : 18;
    const f = frame(w, h, [28, rm, 40, 48], 1, 30, rn.lo, rn.hi);

    drawAxes(c, f, t('ch1.cv.x'), t('ch1.cv.y'), placed);
    drawYTicks(c, f, rn.ticks, rn.dec, (v, d) => fmt(v, d) + '%', placed);
    drawXTicks(c, f, [1, 5, 10, 15, 20, 25, 30], (v) => String(v), placed);

    if (showDf) {
      const fDf = frame(w, h, [28, rm, 40, 48], 1, 30, 0, 1);
      const dfPts = b.df.map((d, i) => [fDf.X(i + 1), fDf.Y(d)]);
      poly(c, dfPts, C.violet, { w: 1.8, dash: [3, 3] });
      safeText(c, t('ch1.cv.df'), f.R - 2, f.T - 12, { align: 'right', font: FONT_SM, color: C.violet }, placed);
      [0, 0.5, 1.0].forEach((v) => {
        safeText(c, fmt(v, 1), f.R + 6, fDf.Y(v), { font: FONT_SM, color: C.violet, maxX: w - 2 }, placed);
      });
    }

    poly(c, b.par.map((v, i) => [f.X(i + 1), f.Y(v)]), C.gold, { w: 2.3 });
    poly(c, b.spot.map((v, i) => [f.X(i + 1), f.Y(v)]), C.cyan, { w: 2.2 });
    poly(c, b.fwd.map((v, i) => [f.X(i + 1), f.Y(v)]), C.green, { w: 2.1, dash: [6, 4] });

    // End labels near maturity 30, resolved safely
    safeText(c, 'f ' + fmt(b.fwd[29], 2) + '%', f.X(30) - 4, f.Y(b.fwd[29]), { align: 'right', font: FONT_SM, color: C.green, shiftY: true }, placed);
    safeText(c, 'z ' + fmt(b.spot[29], 2) + '%', f.X(30) - 4, f.Y(b.spot[29]), { align: 'right', font: FONT_SM, color: C.cyan, shiftY: true }, placed);
    safeText(c, 'c ' + fmt(b.par[29], 2) + '%', f.X(30) - 4, f.Y(b.par[29]), { align: 'right', font: FONT_SM, color: C.gold, shiftY: true }, placed);
  }
  function textM1() {
    syncM1PresetSliders();
    const ys = getM1Yields();
    const b = M.boot.bootstrap(ys, 30);
    put('m1Y2o', t('unit.pct', { v: fmt(parseFloat(byId('m1Y2').value), 2) }));
    put('m1Y10o', t('unit.pct', { v: fmt(parseFloat(byId('m1Y10').value), 2) }));
    put('m1Y30o', t('unit.pct', { v: fmt(parseFloat(byId('m1Y30').value), 2) }));
    put('m1Spot1', t('unit.pct', { v: fmt(b.spot[0], 2) }));
    put('m1Spot10', t('unit.pct', { v: fmt(b.spot[9], 2) }));
    put('m1Fwd10', t('unit.pct', { v: fmt(b.fwd[9], 2) }));
    put('m1Df30', fmt(b.df[29], 3));

    const slope = b.par[9] - b.par[0];
    let key = 'ch1.say.flat';
    if (slope > 0.15) key = 'ch1.say.up';
    else if (slope < -0.15) key = 'ch1.say.inv';
    put('m1Say', t(key, {
      s1: fmt(b.spot[0], 2),
      s10: fmt(b.spot[9], 2),
      f10: fmt(b.fwd[9], 2),
      df30: fmt(b.df[29], 3)
    }));
  }

  /* ───────── Chapter 2: Expectations Hypothesis + Term Premium ───────── */
  function getM2Params() {
    return {
      r0: parseFloat(byId('m2R0').value),
      rL: parseFloat(byId('m2RL').value),
      h: parseFloat(byId('m2H').value),
      tp10: parseFloat(byId('m2Tp').value)
    };
  }
  function drawM2() {
    const cv = byId('m2Cv');
    const { c, w, h } = fit(cv);
    const placed = [];
    const p = getM2Params();
    const pts = M.eh.curve(p, 30);
    const vals = pts.flatMap((d) => [d.expShort, d.expAvg, d.yield]);
    const rn = nice(Math.max(-0.5, Math.min(...vals) - 0.3), Math.max(...vals) + 0.4, 4);
    const f = frame(w, h, [28, 18, 40, 48], 0, 30, rn.lo, rn.hi);

    drawAxes(c, f, t('ch2.cv.x'), t('ch2.cv.y'), placed);
    drawYTicks(c, f, rn.ticks, rn.dec, (v, d) => fmt(v, d) + '%', placed);
    drawXTicks(c, f, [0, 5, 10, 15, 20, 25, 30], (v) => String(v), placed);

    // Fill term-premium wedge between pure expectations average and total yield
    c.save();
    c.fillStyle = p.tp10 >= 0 ? 'rgba(233,185,73,0.13)' : 'rgba(240,122,109,0.14)';
    c.beginPath();
    c.moveTo(f.X(0), f.Y(p.r0));
    pts.forEach((d) => c.lineTo(f.X(d.n), f.Y(d.yield)));
    for (let i = pts.length - 1; i >= 0; i--) c.lineTo(f.X(pts[i].n), f.Y(pts[i].expAvg));
    c.lineTo(f.X(0), f.Y(p.r0));
    c.closePath();
    c.fill();
    c.restore();

    poly(c, [[f.X(0), f.Y(p.r0)], ...pts.map((d) => [f.X(d.n), f.Y(d.expShort)])], C.cyan, { w: 2.0, dash: [5, 4] });
    poly(c, [[f.X(0), f.Y(p.r0)], ...pts.map((d) => [f.X(d.n), f.Y(d.expAvg)])], C.violet, { w: 2.0 });
    poly(c, [[f.X(0), f.Y(p.r0)], ...pts.map((d) => [f.X(d.n), f.Y(d.yield)])], C.gold, { w: 2.6 });

    if (Math.abs(p.tp10) >= 0.25) {
      const midY = (pts[19].yield + pts[19].expAvg) / 2;
      safeText(c, t('ch2.cv.tparea'), f.X(20), f.Y(midY), { align: 'center', font: FONT_SM, color: p.tp10 >= 0 ? C.gold : C.red }, placed);
    }
    const last = pts[29];
    safeText(c, fmt(last.yield, 2) + '%', f.X(30) - 4, f.Y(last.yield), { align: 'right', font: FONT_SM, color: C.gold, shiftY: true }, placed);
    safeText(c, fmt(last.expAvg, 2) + '%', f.X(30) - 4, f.Y(last.expAvg), { align: 'right', font: FONT_SM, color: C.violet, shiftY: true }, placed);
  }
  function textM2() {
    const p = getM2Params();
    const s = M.eh.summary(p);
    put('m2R0o', t('unit.pct', { v: fmt(p.r0, 1) }));
    put('m2RLo', t('unit.pct', { v: fmt(p.rL, 1) }));
    put('m2Ho', t('unit.yr', { v: fmt(p.h, 1) }));
    put('m2Tpo', t('unit.pct', { v: sgn(p.tp10, 1) }));

    put('m2Y2', t('unit.pct', { v: fmt(s.y2, 2) }));
    put('m2Y10', t('unit.pct', { v: fmt(s.y10, 2) }));
    put('m2Spread', t('unit.pct', { v: sgn(s.s10y2y, 2) }));
    put('m2ExpSlope', t('unit.pct', { v: sgn(s.expSlope10y2y, 2) }));

    let key = 'ch2.say.flat';
    if (s.s10y2y < -0.15) key = 'ch2.say.inv';
    else if (p.tp10 >= 1.2 && Math.abs(s.expSlope10y2y) < 0.25) key = 'ch2.say.tp';
    else if (s.s10y2y > 0.15) key = 'ch2.say.normal';

    put('m2Say', t(key, {
      sp: sgn(s.s10y2y, 2),
      expsp: sgn(s.expSlope10y2y, 2),
      tp: sgn(p.tp10, 2),
      r0: fmt(p.r0, 1),
      rL: fmt(p.rL, 1),
      y10: fmt(s.y10, 2)
    }));
  }

  /* ───────── Chapter 3: Duration & Convexity ───────── */
  function getM3Params() {
    return {
      T: parseInt(radioVal('m3T') || '30', 10),
      dy: parseFloat(byId('m3Dy').value),
      y0: parseFloat(byId('m3Y0').value),
      c: parseFloat(byId('m3C').value)
    };
  }
  function drawM3() {
    const cv = byId('m3Cv');
    const { c, w, h } = fit(cv);
    const placed = [];
    const p = getM3Params();
    const yMin = Math.max(0.2, p.y0 - 3.2);
    const yMax = p.y0 + 3.2;
    const xs = [];
    for (let y = yMin; y <= yMax + 1e-6; y += 0.1) xs.push(y);
    const exactPts = xs.map((y) => [y, M.dur.price(p.c, p.T, y)]);
    const a0 = M.dur.analyze(p.c, p.T, p.y0, p.dy);
    const linPts = xs.map((y) => {
      const dy = y - p.y0;
      return [y, a0.p0 * (1 - a0.dMod * (dy / 100))];
    });
    const quadPts = xs.map((y) => {
      const dyDec = (y - p.y0) / 100;
      return [y, a0.p0 * (1 - a0.dMod * dyDec + 0.5 * a0.conv * dyDec * dyDec)];
    });

    const allP = [...exactPts.map((d) => d[1]), ...linPts.map((d) => d[1])];
    const pn = nice(Math.max(0, Math.min(...allP) * 0.92), Math.max(...allP) * 1.05, 4);
    const f = frame(w, h, [28, 18, 40, 52], yMin, yMax, pn.lo, pn.hi);

    drawAxes(c, f, t('ch3.cv.x'), t('ch3.cv.y'), placed);
    drawYTicks(c, f, pn.ticks, pn.dec, (v, d) => fmt(v, d), placed);
    const xt = [];
    for (let k = Math.ceil(yMin); k <= Math.floor(yMax); k++) xt.push(k);
    drawXTicks(c, f, xt, (v) => v + '%', placed);

    poly(c, linPts.map((d) => [f.X(d[0]), f.Y(d[1])]), C.red, { w: 1.9, dash: [5, 4] });
    poly(c, quadPts.map((d) => [f.X(d[0]), f.Y(d[1])]), C.cyan, { w: 1.9, dash: [3, 3] });
    poly(c, exactPts.map((d) => [f.X(d[0]), f.Y(d[1])]), C.gold, { w: 2.6 });

    // Vertical marker at shocked yield
    const yTarget = p.y0 + p.dy;
    const tx = f.X(yTarget);
    c.save();
    c.strokeStyle = 'rgba(235,232,224,0.35)';
    c.lineWidth = 1;
    c.setLineDash([2, 3]);
    c.beginPath();
    c.moveTo(tx, f.T);
    c.lineTo(tx, f.B);
    c.stroke();
    c.restore();

    // Points at y0 and y0+dy
    const dot = (xv, yv, col) => {
      c.save();
      c.fillStyle = col;
      c.beginPath();
      c.arc(f.X(xv), f.Y(yv), 4.5, 0, Math.PI * 2);
      c.fill();
      c.restore();
    };
    dot(p.y0, a0.p0, C.ink);
    dot(yTarget, a0.pNew, C.gold);
    dot(yTarget, a0.pLin, C.red);

    safeText(c, t('ch3.cv.base') + ' ' + fmt(a0.p0, 1), f.X(p.y0), f.Y(a0.p0) - 12, { align: 'center', font: FONT_SM, color: C.ink, shiftY: true }, placed);
    if (Math.abs(p.dy) >= 0.3) {
      const align = p.dy > 0 ? 'right' : 'left';
      const dxOff = p.dy > 0 ? -8 : 8;
      safeText(c, t('ch3.cv.shock') + ' ' + fmt(a0.pNew, 1), tx + dxOff, f.Y(a0.pNew), { align, font: FONT_SM, color: C.gold, shiftY: true }, placed);
    }
  }
  function textM3() {
    const p = getM3Params();
    const a = M.dur.analyze(p.c, p.T, p.y0, p.dy);
    put('m3Dyo', t('unit.pct', { v: sgn(p.dy, 1) }));
    put('m3Y0o', t('unit.pct', { v: fmt(p.y0, 1) }));
    put('m3Co', t('unit.pct', { v: fmt(p.c, 1) }));

    put('m3Exact', t('unit.pct', { v: sgn(a.exactPct, 2) }));
    put('m3Lin', t('unit.pct', { v: sgn(a.durPct, 2) }));
    put('m3Quad', t('unit.pct', { v: sgn(a.durConvPct, 2) }));
    put('m3Meta', fmt(a.dMod, 2) + ' / ' + fmt(a.conv, 1));

    if (Math.abs(p.dy) < 0.05) {
      put('m3Say', t('ch3.say.zero', { p0: fmt(a.p0, 1), dmod: fmt(a.dMod, 2) }));
    } else if (p.dy > 0) {
      put('m3Say', t('ch3.say.up', {
        dy: sgn(p.dy, 1),
        T: p.T,
        exact: fmt(a.exactPct, 2),
        lin: fmt(a.durPct, 2),
        conv: fmt(a.conv, 1),
        gain: fmt(a.convexityGainPct, 2)
      }));
    } else {
      put('m3Say', t('ch3.say.down', {
        dy: fmt(p.dy, 1),
        T: p.T,
        exact: fmt(a.exactPct, 2),
        lin: fmt(a.durPct, 2),
        gain: fmt(a.convexityGainPct, 2)
      }));
    }
  }

  /* ───────── Chapter 4: Yield Curve Inversion & NY Fed Probit ───────── */
  function drawM4() {
    const cv = byId('m4Cv');
    const { c, w, h } = fit(cv);
    const placed = [];
    const mode = radioVal('m4Mode');

    if (mode === 'history') {
      const s = M.inv.spread;
      const n = s.length;
      const f = frame(w, h, [28, 16, 40, 48], 0, n - 1, -3.0, 5.0);
      drawAxes(c, f, t('ch4.cv.xhist'), t('ch4.cv.yhist'), placed);
      drawYTicks(c, f, [-2, 0, 2, 4], 0, (v) => fmt(v, 0) + '%', placed);

      // Zero line
      c.save();
      c.strokeStyle = C.red;
      c.lineWidth = 1;
      c.setLineDash([4, 4]);
      c.beginPath();
      c.moveTo(f.L, f.Y(0));
      c.lineTo(f.R, f.Y(0));
      c.stroke();
      c.restore();

      // NBER recession shading
      c.save();
      c.fillStyle = 'rgba(240,122,109,0.24)';
      for (const [a, b] of M.inv.recRanges) {
        const x1 = f.X(a), x2 = Math.max(x1 + 2, f.X(b));
        c.fillRect(x1, f.T, x2 - x1, f.B - f.T);
      }
      c.restore();

      poly(c, s.map((v, i) => [f.X(i), f.Y(v)]), C.gold, { w: 1.7 });

      // Year ticks every 10 years (1960, 1970, ... 2020)
      const yrIdxs = [0, 120, 240, 360, 480, 600, 720];
      drawXTicks(c, f, yrIdxs, (idx) => String(1960 + Math.round(idx / 12)), placed);
      safeText(c, '2026-10: ' + sgn(s[n - 1], 2) + '%', f.R - 4, f.Y(s[n - 1]) - 12, { align: 'right', font: FONT_SM, color: C.gold, shiftY: true }, placed);
    } else {
      const obs = parseFloat(byId('m4Obs').value);
      const tp = parseFloat(byId('m4Tp').value);
      const dec = M.inv.decompose(obs, tp);
      const f = frame(w, h, [28, 18, 40, 48], -2.5, 2.5, 0, 100);
      drawAxes(c, f, t('ch4.cv.xprob'), t('ch4.cv.yprob'), placed);
      drawYTicks(c, f, [0, 25, 50, 75, 100], 0, (v) => v + '%', placed);
      drawXTicks(c, f, [-2, -1, 0, 1, 2], (v) => fmt(v, 0) + '%', placed);

      const pts = [];
      for (let x = -2.5; x <= 2.5001; x += 0.1) pts.push([f.X(x), f.Y(M.inv.probit(x))]);
      poly(c, pts, C.cyan, { w: 2.4 });

      const xObs = M.clamp(obs, -2.5, 2.5);
      const xExp = M.clamp(dec.expSlope, -2.5, 2.5);
      const mark = (xv, yv, col, lbl) => {
        c.save();
        c.strokeStyle = col;
        c.lineWidth = 1.4;
        c.setLineDash([3, 3]);
        c.beginPath();
        c.moveTo(f.X(xv), f.B);
        c.lineTo(f.X(xv), f.Y(yv));
        c.lineTo(f.L, f.Y(yv));
        c.stroke();
        c.fillStyle = col;
        c.beginPath();
        c.arc(f.X(xv), f.Y(yv), 5, 0, Math.PI * 2);
        c.fill();
        c.restore();
        safeText(c, lbl, f.X(xv), f.Y(yv) - 12, { align: 'center', font: FONT_SM, color: col, shiftY: true }, placed);
      };
      mark(xObs, dec.probRaw, C.gold, fmt(dec.probRaw, 1) + '%');
      mark(xExp, dec.probExpOnly, C.green, fmt(dec.probExpOnly, 1) + '%');
    }
  }
  function textM4() {
    const mode = radioVal('m4Mode');
    const isHist = mode === 'history';
    byId('m4CtlHist').classList.toggle('hidden', !isHist);
    byId('m4LegHist').classList.toggle('hidden', !isHist);
    byId('m4CtlDec').classList.toggle('hidden', isHist);
    byId('m4LegDec').classList.toggle('hidden', isHist);

    if (isHist) {
      const lead = parseInt(byId('m4Lead').value, 10);
      const rec = M.inv.record(lead);
      put('m4Leado', t('unit.mo', { v: lead }));
      put('m4AL', t('ch4.read.called'));
      put('m4BL', t('ch4.read.false'));
      put('m4CL', t('ch4.read.latest'));
      put('m4DL', t('ch4.read.prob'));
      put('m4A', `${rec.calledCount} / ${rec.totalRecessions}`);
      put('m4B', String(rec.falseAlarmCount));
      put('m4C', t('unit.pct', { v: sgn(rec.latestSpread, 2) }));
      put('m4D', t('unit.pct', { v: fmt(rec.latestProb, 1) }));
      put('m4Say', t('ch4.say.hist', {
        lead,
        tot: rec.totalRecessions,
        called: rec.calledCount,
        eps: rec.episodeCount,
        false: rec.falseAlarmCount
      }));
    } else {
      const obs = parseFloat(byId('m4Obs').value);
      const tp = parseFloat(byId('m4Tp').value);
      const dec = M.inv.decompose(obs, tp);
      put('m4Obso', t('unit.pct', { v: sgn(obs, 1) }));
      put('m4Tpo', t('unit.pct', { v: sgn(tp, 1) }));
      put('m4AL', t('ch4.read.obssp'));
      put('m4BL', t('ch4.read.expsp'));
      put('m4CL', t('ch4.read.pobs'));
      put('m4DL', t('ch4.read.pexp'));
      put('m4A', t('unit.pct', { v: sgn(obs, 2) }));
      put('m4B', t('unit.pct', { v: sgn(dec.expSlope, 2) }));
      put('m4C', t('unit.pct', { v: fmt(dec.probRaw, 1) }));
      put('m4D', t('unit.pct', { v: fmt(dec.probExpOnly, 1) }));
      put('m4Say', t(tp < 0 ? 'ch4.say.decneg' : 'ch4.say.decpos', {
        obs: sgn(obs, 2),
        tp: sgn(tp, 2),
        expsp: sgn(dec.expSlope, 2),
        pexp: fmt(dec.probExpOnly, 1)
      }));
    }
  }

  /* ───────── Chapter 5: Credit Waterfall & Default Arithmetic ───────── */
  function getM5Params() {
    return {
      rf: 4.81,
      spreadBp: parseFloat(byId('m5Sp').value),
      defaultPct: parseFloat(byId('m5Def').value),
      recoveryPct: parseFloat(byId('m5Rec').value),
      years: 5
    };
  }
  function drawM5() {
    const cv = byId('m5Cv');
    const { c, w, h } = fit(cv);
    const placed = [];
    const p = getM5Params();
    const res = M.cred.compute(p);
    const split = w < 520 ? w * 0.52 : w * 0.54;

    // Left panel: waterfall bar chart
    const maxY = Math.max(8, res.promisedYield * 1.15);
    const minY = Math.min(0, res.expRetPct - 1.5);
    const yn = nice(minY, maxY, 4);
    const fL = frame(split, h, [32, 16, 40, 44], 0, 4, yn.lo, yn.hi);
    safeText(c, t('ch5.cv.left'), fL.L, 14, { font: FONT_BOLD, color: C.ink }, placed);
    drawAxes(c, fL, '', '', placed, { hideXLab: true });
    drawYTicks(c, fL, yn.ticks, yn.dec, (v, d) => fmt(v, d) + '%', placed);

    const bw = Math.max(16, (fL.R - fL.L) / 5.8);
    const bars = [
      { cx: fL.X(0.5), y0: 0, y1: res.rf, col: C.cyan, lbl: t('ch5.cv.bar.rf'), v: fmt(res.rf, 2) + '%' },
      { cx: fL.X(1.5), y0: res.rf, y1: res.promisedYield, col: C.gold, lbl: t('ch5.cv.bar.sp'), v: '+' + fmt(res.spreadPct, 2) + '%' },
      { cx: fL.X(2.5), y0: res.expRetPct, y1: res.promisedYield, col: C.red, lbl: t('ch5.cv.bar.el'), v: MINUS + fmt(res.expLossExactPct, 2) + '%' },
      { cx: fL.X(3.5), y0: 0, y1: res.expRetPct, col: res.expRetPct >= res.rf ? C.green : C.red, lbl: t('ch5.cv.bar.er'), v: fmt(res.expRetPct, 2) + '%' }
    ];
    for (const b of bars) {
      const py0 = fL.Y(b.y0), py1 = fL.Y(b.y1);
      const top = Math.min(py0, py1), bh = Math.max(2, Math.abs(py1 - py0));
      c.save();
      c.fillStyle = b.col;
      c.fillRect(b.cx - bw / 2, top, bw, bh);
      c.restore();
      safeText(c, b.lbl, b.cx, fL.B + 14, { align: 'center', font: FONT_SM, color: C.mute }, placed);
      safeText(c, b.v, b.cx, top - 10, { align: 'center', font: FONT_SM, color: b.col, shiftY: true }, placed);
    }

    // Right panel: 5-year cumulative wealth paths
    const maxW = Math.max(...res.promisedWealth, ...res.rfWealth) * 1.04;
    const minW = Math.min(...res.expectedWealth, 90) * 0.96;
    const wn = nice(minW, maxW, 4);
    const fR = frame(w, h, [32, 16, 40, split + 44], 0, 5, wn.lo, wn.hi);
    safeText(c, t('ch5.cv.right'), fR.L, 14, { font: FONT_BOLD, color: C.ink }, placed);
    drawAxes(c, fR, '', '', placed, { hideXLab: true });
    drawYTicks(c, fR, wn.ticks, 0, (v) => '$' + Math.round(v), placed);
    drawXTicks(c, fR, [0, 1, 2, 3, 4, 5], (v) => String(v), placed);

    poly(c, res.promisedWealth.map((v, i) => [fR.X(i), fR.Y(v)]), C.gold, { w: 2.0, dash: [4, 3] });
    poly(c, res.rfWealth.map((v, i) => [fR.X(i), fR.Y(v)]), C.cyan, { w: 2.0 });
    poly(c, res.expectedWealth.map((v, i) => [fR.X(i), fR.Y(v)]), C.green, { w: 2.5 });

    safeText(c, t('ch5.cv.prom'), fR.R - 4, fR.Y(res.promisedWealth[5]), { align: 'right', font: FONT_SM, color: C.gold, shiftY: true }, placed);
    safeText(c, t('ch5.cv.expw'), fR.R - 4, fR.Y(res.expectedWealth[5]), { align: 'right', font: FONT_SM, color: C.green, shiftY: true }, placed);
    safeText(c, t('ch5.cv.rfw'), fR.R - 4, fR.Y(res.rfWealth[5]), { align: 'right', font: FONT_SM, color: C.cyan, shiftY: true }, placed);
  }
  function textM5() {
    const p = getM5Params();
    const res = M.cred.compute(p);
    put('m5Spo', t('unit.bp', { v: fmt(p.spreadBp, 0) }));
    put('m5Defo', t('unit.pct', { v: fmt(p.defaultPct, 1) }));
    put('m5Reco', t('unit.pct', { v: fmt(p.recoveryPct, 0) }));

    put('m5Prom', t('unit.pct', { v: fmt(res.promisedYield, 2) }));
    put('m5Loss', t('unit.pct', { v: fmt(res.expLossExactPct, 2) }));
    put('m5Exp', t('unit.pct', { v: fmt(res.expRetPct, 2) }));
    put('m5Be', t('unit.pct', { v: fmt(res.breakevenPct, 2) }));

    if (res.netPremiumBp >= 0) {
      put('m5Say', t('ch5.say.pos', {
        y: fmt(res.promisedYield, 2),
        el: fmt(res.expLossExactPct, 2),
        er: fmt(res.expRetPct, 2),
        prem: fmt(res.netPremiumBp, 0),
        be: fmt(res.breakevenPct, 2)
      }));
    } else {
      put('m5Say', t('ch5.say.neg', {
        p: fmt(p.defaultPct, 1),
        r: fmt(p.recoveryPct, 0),
        el: fmt(res.expLossExactPct, 2),
        sp: fmt(p.spreadBp, 0),
        er: fmt(res.expRetPct, 2),
        loss: fmt(-res.netPremiumBp, 0)
      }));
    }
  }

  /* ───────── Chapter 6: Merton Structural Credit ───────── */
  function getM6Params() {
    return {
      leveragePct: parseFloat(byId('m6Lev').value),
      sigmaVPct: parseFloat(byId('m6Vol').value),
      T: parseFloat(byId('m6T').value),
      rfPct: 4.8,
      liqWedgeBp: byId('m6Liq').checked ? 150 : 0
    };
  }
  function drawM6() {
    const cv = byId('m6Cv');
    const { c, w, h } = fit(cv);
    const placed = [];
    const p = getM6Params();
    const res = M.merton.compute(p);
    const midY = h * 0.49;

    // Top panel: terminal lognormal firm asset distribution at T
    const sig = p.sigmaVPct / 100;
    const tau = p.T;
    const r = p.rfPct / 100;
    const muLog = Math.log(100) + (r - 0.5 * sig * sig) * tau;
    const sdLog = sig * Math.sqrt(tau);
    const xMax = Math.max(200, Math.min(360, Math.exp(muLog + 2.4 * sdLog)));
    const xs = [], pdfs = [];
    for (let x = 8; x <= xMax; x += (xMax - 8) / 110) {
      const z = (Math.log(x) - muLog) / sdLog;
      const density = M.phi(z) / (x * sdLog);
      xs.push(x);
      pdfs.push(density);
    }
    const maxPdf = Math.max(...pdfs) * 1.15;
    const fTop = frame(w, midY, [26, 18, 26, 44], 8, xMax, 0, maxPdf);
    safeText(c, t('ch6.cv.top', { F: fmt(res.F, 0) }), fTop.L, 12, { font: FONT_BOLD, color: C.ink }, placed);
    drawAxes(c, fTop, '', '', placed, { hideXLab: true });
    drawXTicks(c, fTop, [50, 100, 150, 200].filter((v) => v <= xMax), (v) => String(v), placed);

    // Fill red insolvency tail V_T < F
    const tailPts = xs.map((x, i) => [x, pdfs[i]]).filter((d) => d[0] <= res.F);
    if (tailPts.length > 1) {
      c.save();
      c.fillStyle = 'rgba(240,122,109,0.34)';
      c.beginPath();
      c.moveTo(fTop.X(tailPts[0][0]), fTop.B);
      tailPts.forEach((d) => c.lineTo(fTop.X(d[0]), fTop.Y(d[1])));
      c.lineTo(fTop.X(res.F), fTop.B);
      c.closePath();
      c.fill();
      c.restore();
    }
    poly(c, xs.map((x, i) => [fTop.X(x), fTop.Y(pdfs[i])]), C.cyan, { w: 2.2 });

    // Barrier line F
    const bx = fTop.X(res.F);
    c.save();
    c.strokeStyle = C.red;
    c.lineWidth = 1.6;
    c.setLineDash([4, 3]);
    c.beginPath();
    c.moveTo(bx, fTop.T);
    c.lineTo(bx, fTop.B);
    c.stroke();
    c.restore();
    safeText(c, t('ch6.cv.barrier') + ' ' + fmt(res.F, 0), bx + 4, fTop.T + 10, { font: FONT_SM, color: C.red, maxX: fTop.R }, placed);

    // Bottom panel: Merton credit spread vs leverage
    const sweep = M.merton.sweepLeverage(p.sigmaVPct, p.T, p.rfPct, p.liqWedgeBp);
    const maxSp = Math.max(250, Math.min(2500, Math.max(...sweep.map((d) => d.totalSpreadBp)) * 1.08));
    const sn = nice(0, maxSp, 3);
    const fBot = frame(w, h, [midY + 28, 18, 32, 48], 20, 95, 0, sn.hi);
    safeText(c, t('ch6.cv.bot'), fBot.L, midY + 12, { font: FONT_BOLD, color: C.ink }, placed);
    drawAxes(c, fBot, '', '', placed, { hideXLab: true });
    drawYTicks(c, fBot, sn.ticks, 0, (v) => Math.round(v) + ' bp', placed);
    drawXTicks(c, fBot, [20, 40, 60, 80, 95], (v) => v + '%', placed);

    if (p.liqWedgeBp > 0) {
      poly(c, sweep.map((d) => [fBot.X(d.lev), fBot.Y(Math.min(sn.hi, d.spreadBp))]), C.mute, { w: 1.6, dash: [4, 4] });
    }
    poly(c, sweep.map((d) => [fBot.X(d.lev), fBot.Y(Math.min(sn.hi, d.totalSpreadBp))]), C.gold, { w: 2.5 });

    const cx = fBot.X(p.leveragePct);
    const cy = fBot.Y(Math.min(sn.hi, res.totalSpreadBp));
    c.save();
    c.fillStyle = C.gold;
    c.beginPath();
    c.arc(cx, cy, 5, 0, Math.PI * 2);
    c.fill();
    c.restore();
    safeText(c, fmt(res.totalSpreadBp, 0) + ' bp', cx - 6, cy - 12, { align: 'center', font: FONT_SM, color: C.gold, shiftY: true }, placed);
  }
  function textM6() {
    const p = getM6Params();
    const res = M.merton.compute(p);
    put('m6Levo', t('unit.pct', { v: fmt(p.leveragePct, 0) }));
    put('m6Volo', t('unit.pct', { v: fmt(p.sigmaVPct, 0) }));
    put('m6To', t('unit.yr', { v: fmt(p.T, 0) }));

    put('m6Sp', t('unit.bp', { v: fmt(res.totalSpreadBp, 1) }));
    put('m6Dd', fmt(res.ddQ, 2));
    put('m6Pdef', t('unit.pct', { v: fmt(res.qDefaultPct, 2) }));
    put('m6Eq', fmt(res.equity, 1));

    const key = p.liqWedgeBp > 0 ? 'ch6.say.liq' : (res.ddQ >= 1.8 ? 'ch6.say.low' : 'ch6.say.mid');
    put('m6Say', t(key, {
      lev: fmt(p.leveragePct, 0),
      vol: fmt(p.sigmaVPct, 0),
      dd: fmt(res.ddQ, 2),
      pdef: fmt(res.qDefaultPct, 2),
      msp: fmt(res.spreadBp, 1),
      tsp: fmt(res.totalSpreadBp, 1)
    }));
  }

  /* ───────── Chapter 7: Real vs Nominal, TIPS Breakeven & Full Decomposition ───────── */
  function getM7Params() {
    return {
      rRealPct: parseFloat(byId('m7Real').value),
      expInflPct: parseFloat(byId('m7ExpInf').value),
      irpNetPct: 0,
      tier: radioVal('m7Tier') || 'ig',
      actualInflPct: parseFloat(byId('m7ActInf').value),
      horizon: 10
    };
  }
  function drawM7() {
    const cv = byId('m7Cv');
    const { c, w, h } = fit(cv);
    const placed = [];
    const p = getM7Params();
    const res = M.tips.compute(p);
    const split = w < 520 ? w * 0.45 : w * 0.46;

    // Left: stacked bar decomposition (Nominal UST vs Corporate total)
    const minStack = Math.min(0, res.rRealPct - 0.5);
    const maxStack = Math.max(6, res.yCorpPct * 1.15);
    const sn = nice(minStack, maxStack, 4);
    const fL = frame(split, h, [32, 16, 40, 44], 0, 2, sn.lo, sn.hi);
    safeText(c, t('ch7.cv.left'), fL.L, 14, { font: FONT_BOLD, color: C.ink }, placed);
    drawAxes(c, fL, '', '', placed, { hideXLab: true });
    drawYTicks(c, fL, sn.ticks, sn.dec, (v, d) => fmt(v, d) + '%', placed);

    const bw = Math.max(24, (fL.R - fL.L) / 3.4);
    const drawSeg = (cx, yA, yB, col) => {
      const pyA = fL.Y(yA), pyB = fL.Y(yB);
      c.save();
      c.fillStyle = col;
      c.fillRect(cx - bw / 2, Math.min(pyA, pyB), bw, Math.max(2, Math.abs(pyB - pyA)));
      c.restore();
    };
    const x1 = fL.X(0.55), x2 = fL.X(1.45);
    drawSeg(x1, 0, res.rRealPct, C.cyan);
    drawSeg(x1, Math.max(0, res.rRealPct), Math.max(0, res.rRealPct) + (res.yNomPct - res.rRealPct), C.violet);
    safeText(c, t('ch7.cv.bar.ust'), x1, fL.B + 14, { align: 'center', font: FONT_SM, color: C.mute }, placed);
    safeText(c, fmt(res.yNomPct, 2) + '%', x1, fL.Y(res.yNomPct) - 10, { align: 'center', font: FONT_SM, color: C.cyan, shiftY: true }, placed);

    drawSeg(x2, 0, res.rRealPct, C.cyan);
    drawSeg(x2, Math.max(0, res.rRealPct), Math.max(0, res.rRealPct) + (res.yNomPct - res.rRealPct), C.violet);
    if (res.oasPct > 0) {
      drawSeg(x2, res.yNomPct, res.yCorpPct, C.gold);
    }
    safeText(c, t('ch7.cv.bar.corp'), x2, fL.B + 14, { align: 'center', font: FONT_SM, color: C.mute }, placed);
    safeText(c, fmt(res.yCorpPct, 2) + '%', x2, fL.Y(res.yCorpPct) - 10, { align: 'center', font: FONT_SM, color: C.gold, shiftY: true }, placed);

    // Right: 10-year real purchasing power race
    const yrs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const tipsCurve = yrs.map((yr) => 1000 * Math.pow(1 + res.rRealPct / 100, yr));
    const nomCurve = yrs.map((yr) => 1000 * Math.pow((1 + res.yNomPct / 100) / (1 + res.actualInflPct / 100), yr));
    const maxW = Math.max(...tipsCurve, ...nomCurve, 1200) * 1.05;
    const minW = Math.min(...tipsCurve, ...nomCurve, 850) * 0.95;
    const wn = nice(minW, maxW, 4);
    const fR = frame(w, h, [32, 18, 40, split + 44], 0, 10, wn.lo, wn.hi);
    safeText(c, t('ch7.cv.right'), fR.L, 14, { font: FONT_BOLD, color: C.ink }, placed);
    drawAxes(c, fR, '', '', placed, { hideXLab: true });
    drawYTicks(c, fR, wn.ticks, 0, (v) => '$' + Math.round(v), placed);
    drawXTicks(c, fR, [0, 2, 4, 6, 8, 10], (v) => String(v), placed);

    poly(c, nomCurve.map((v, i) => [fR.X(i), fR.Y(v)]), C.violet, { w: 2.3, dash: [5, 3] });
    poly(c, tipsCurve.map((v, i) => [fR.X(i), fR.Y(v)]), C.green, { w: 2.5 });
    safeText(c, 'TIPS $' + Math.round(res.tipsRealWealth), fR.R - 4, fR.Y(res.tipsRealWealth), { align: 'right', font: FONT_SM, color: C.green, shiftY: true }, placed);
    safeText(c, t('ch7.cv.nomline') + ' $' + Math.round(res.nomRealWealth), fR.R - 4, fR.Y(res.nomRealWealth), { align: 'right', font: FONT_SM, color: C.violet, shiftY: true }, placed);
  }
  function textM7() {
    const p = getM7Params();
    const res = M.tips.compute(p);
    put('m7Realo', t('unit.pct', { v: fmt(p.rRealPct, 2) }));
    put('m7ExpInfo', t('unit.pct', { v: fmt(p.expInflPct, 2) }));
    put('m7ActInfo', t('unit.pct', { v: fmt(p.actualInflPct, 1) }));

    put('m7Nom', t('unit.pct', { v: fmt(res.yNomPct, 2) }));
    put('m7Corp', t('unit.pct', { v: fmt(res.yCorpPct, 2) }));
    put('m7TipsW', t('unit.dollar', { v: fmt(res.tipsRealWealth, 0) }));
    put('m7NomW', t('unit.dollar', { v: fmt(res.nomRealWealth, 0) }));

    const diff = res.actualInflPct - res.breakevenPct;
    let key = 'ch7.say.eq';
    if (diff > 0.05) key = 'ch7.say.tips';
    else if (diff < -0.05) key = 'ch7.say.nom';
    put('m7Say', t(key, {
      act: fmt(res.actualInflPct, 1),
      be: fmt(res.breakevenPct, 2),
      nomw: fmt(res.nomRealWealth, 0),
      tipsw: fmt(res.tipsRealWealth, 0),
      edge: fmt(Math.abs(res.tipsEdgeDollar), 0)
    }));
  }

  /* ───────── Chapter 8: November 2026 Frontier ───────── */
  function drawM8() {
    const cv = byId('m8Cv');
    const { c, w, h } = fit(cv);
    const placed = [];
    const view = radioVal('m8View') || 'curves';
    const fr = M.frontier;

    if (view === 'curves') {
      const addSpread = byId('m8AddSpread').checked;
      const mats = fr.mats;
      const nov = fr.curves.nov2026;
      const inv23 = fr.curves.inv2023;
      const z21 = fr.curves.zirp2021;
      const maxY = addSpread ? 9.2 : 6.2;
      const f = frame(w, h, [32, 18, 40, 48], 1, 30, 0, maxY);
      safeText(c, t('ch8.cv.curves'), f.L, 14, { font: FONT_BOLD, color: C.ink }, placed);
      drawAxes(c, f, t('ch8.cv.xmat'), t('ch8.cv.y'), placed);
      drawYTicks(c, f, nice(0, maxY, 4).ticks, 0, (v) => fmt(v, 0) + '%', placed);
      drawXTicks(c, f, [1, 2, 5, 10, 20, 30], (v) => String(v), placed);

      poly(c, mats.map((m, i) => [f.X(m), f.Y(z21[i])]), C.mute, { w: 1.8, dash: [3, 3] });
      poly(c, mats.map((m, i) => [f.X(m), f.Y(inv23[i])]), C.red, { w: 2.0, dash: [5, 3] });
      poly(c, mats.map((m, i) => [f.X(m), f.Y(nov[i])]), C.cyan, { w: 2.6 });

      if (addSpread) {
        const igY = nov.map((y) => y + fr.igOasBp / 100);
        const hyY = nov.map((y) => y + fr.hyOasBp / 100);
        poly(c, mats.map((m, i) => [f.X(m), f.Y(igY[i])]), C.green, { w: 2.1 });
        poly(c, mats.map((m, i) => [f.X(m), f.Y(hyY[i])]), C.gold, { w: 2.2 });
        safeText(c, 'HY ' + fmt(hyY[7], 2) + '%', f.X(30) - 4, f.Y(hyY[7]) - 10, { align: 'right', font: FONT_SM, color: C.gold, shiftY: true }, placed);
        safeText(c, 'IG ' + fmt(igY[7], 2) + '%', f.X(30) - 4, f.Y(igY[7]) - 10, { align: 'right', font: FONT_SM, color: C.green, shiftY: true }, placed);
      }
      safeText(c, '2026-11 ' + fmt(nov[7], 2) + '%', f.X(30) - 4, f.Y(nov[7]) + 10, { align: 'right', font: FONT_SM, color: C.cyan, shiftY: true }, placed);
      safeText(c, '2023-06 ' + fmt(inv23[7], 2) + '%', f.X(30) - 4, f.Y(inv23[7]), { align: 'right', font: FONT_SM, color: C.red, shiftY: true }, placed);
      safeText(c, '2021-12 ' + fmt(z21[7], 2) + '%', f.X(30) - 4, f.Y(z21[7]), { align: 'right', font: FONT_SM, color: C.mute, shiftY: true }, placed);
    } else if (view === 'global') {
      const rows = fr.global10y;
      const f = frame(w, h, [32, 18, 40, 48], 0, rows.length, 0, 6);
      safeText(c, t('ch8.cv.global'), f.L, 14, { font: FONT_BOLD, color: C.ink }, placed);
      drawAxes(c, f, '', t('ch8.cv.y'), placed, { hideXLab: true });
      drawYTicks(c, f, [0, 1.5, 3, 4.5, 6], 1, (v, d) => fmt(v, d) + '%', placed);
      const bw = Math.max(24, (f.R - f.L) / (rows.length * 1.9));
      const cols = [C.cyan, C.gold, C.green, C.violet, C.mute];
      rows.forEach((row, i) => {
        const cx = f.X(i + 0.5);
        const top = f.Y(row.y);
        c.save();
        c.fillStyle = cols[i];
        c.fillRect(cx - bw / 2, top, bw, Math.max(2, f.B - top));
        c.restore();
        safeText(c, row.id.toUpperCase(), cx, f.B + 14, { align: 'center', font: FONT_BOLD, color: C.ink }, placed);
        safeText(c, fmt(row.y, 2) + '%', cx, top - 11, { align: 'center', font: FONT_SM, color: cols[i], shiftY: true }, placed);
      });
    } else {
      // Credit OAS vs 2020 & 2008 peaks (two grouped clusters: IG and HY)
      const groups = [
        { lbl: 'IG OAS', vals: [fr.igOasBp, fr.crisis.igCovidBp, fr.crisis.igGfcBp] },
        { lbl: 'HY OAS', vals: [fr.hyOasBp, fr.crisis.hyCovidBp, fr.crisis.hyGfcBp] }
      ];
      const f = frame(w, h, [32, 18, 40, 56], 0, 2, 0, 2400);
      safeText(c, t('ch8.cv.credit'), f.L, 14, { font: FONT_BOLD, color: C.ink }, placed);
      drawAxes(c, f, '', t('ch8.cv.ybp'), placed, { hideXLab: true });
      drawYTicks(c, f, [0, 600, 1200, 1800, 2400], 0, (v) => fmt(v, 0), placed);
      const subCols = [C.green, C.gold, C.red];
      const subTags = [t('ch8.cv.now'), t('ch8.cv.cov'), t('ch8.cv.gfc')];
      const subW = Math.max(16, (f.R - f.L) / 11);
      groups.forEach((g, gi) => {
        const gx = f.X(gi + 0.5);
        safeText(c, g.lbl, gx, f.B + 26, { align: 'center', font: FONT_BOLD, color: C.ink }, placed);
        g.vals.forEach((v, bi) => {
          const cx = gx + (bi - 1) * (subW + 6);
          const top = f.Y(v);
          c.save();
          c.fillStyle = subCols[bi];
          c.fillRect(cx - subW / 2, top, subW, Math.max(3, f.B - top));
          c.restore();
          safeText(c, subTags[bi], cx, f.B + 11, { align: 'center', font: FONT_SM, color: subCols[bi] }, placed);
          safeText(c, fmt(v, 0), cx, top - 10, { align: 'center', font: FONT_SM, color: subCols[bi], shiftY: true }, placed);
        });
      });
    }
  }
  function textM8() {
    const view = radioVal('m8View') || 'curves';
    const fr = M.frontier;
    byId('m8AddIgWrap').classList.toggle('hidden', view !== 'curves');

    if (view === 'curves') {
      put('m8AL', t('ch8.read.us10'));
      put('m8BL', t('ch8.read.s102'));
      put('m8CL', t('ch8.read.tp10'));
      put('m8DL', t('ch8.read.tips10'));
      put('m8A', t('unit.pct', { v: fmt(fr.ust10y, 2) }));
      put('m8B', t('unit.pct', { v: sgn(fr.spread10y2y, 2) }));
      put('m8C', t('unit.pct', { v: sgn(fr.tp10, 2) }));
      put('m8D', t('unit.pct', { v: fmt(fr.tips10, 2) }));
      put('m8Say', t('ch8.say.curves', { ig: fmt(fr.igOasBp, 0), hy: fmt(fr.hyOasBp, 0) }));
    } else if (view === 'global') {
      put('m8AL', t('ch8.read.gmax'));
      put('m8BL', t('ch8.read.gus'));
      put('m8CL', t('ch8.read.gde'));
      put('m8DL', t('ch8.read.gcn'));
      const g = Object.fromEntries(fr.global10y.map((x) => [x.id, x.y]));
      put('m8A', t('unit.pct', { v: fmt(g.uk, 2) }));
      put('m8B', t('unit.pct', { v: fmt(g.us, 2) }));
      put('m8C', t('unit.pct', { v: fmt(g.de, 2) }));
      put('m8D', t('unit.pct', { v: fmt(g.cn, 2) }));
      put('m8Say', t('ch8.say.global', {
        uk: fmt(g.uk, 2),
        us: fmt(g.us, 2),
        de: fmt(g.de, 2),
        jp: fmt(g.jp, 2),
        cn: fmt(g.cn, 2)
      }));
    } else {
      put('m8AL', t('ch8.read.ig'));
      put('m8BL', t('ch8.read.hy'));
      put('m8CL', t('ch8.read.iggfc'));
      put('m8DL', t('ch8.read.hygfc'));
      put('m8A', t('unit.bp', { v: fmt(fr.igOasBp, 0) }));
      put('m8B', t('unit.bp', { v: fmt(fr.hyOasBp, 0) }));
      put('m8C', t('unit.bp', { v: fmt(fr.crisis.igGfcBp, 0) }));
      put('m8D', t('unit.bp', { v: fmt(fr.crisis.hyGfcBp, 0) }));
      put('m8Say', t('ch8.say.credit', { ig: fmt(fr.igOasBp, 0), hy: fmt(fr.hyOasBp, 0) }));
    }
  }

  function renderTables() {
    const fr = M.frontier;
    const meritRows = [
      [t('ch8.m1.name'), '+' + fmt(fr.spread10y2y, 2) + '% (+' + Math.round(fr.spread10y2y * 100) + ' bp)', t('ch8.m1.src'), t('ch8.m1.note')],
      [t('ch8.m2.name'), '+' + fmt(fr.spread10y3m, 2) + '% (+' + Math.round(fr.spread10y3m * 100) + ' bp)', t('ch8.m2.src'), t('ch8.m2.note')],
      [t('ch8.m3.name'), '+' + fmt(fr.tp10, 2) + '%', t('ch8.m3.src'), t('ch8.m3.note')],
      [t('ch8.m4.name'), fmt(fr.tips10, 2) + '% / ' + fmt(fr.breakeven10, 2) + '%', t('ch8.m4.src'), t('ch8.m4.note')],
      [t('ch8.m5.name'), fmt(fr.igOasBp, 0) + ' bp (' + fmt(fr.igOasBp / 100, 2) + '%)', t('ch8.m5.src'), t('ch8.m5.note')],
      [t('ch8.m6.name'), fmt(fr.hyOasBp, 0) + ' bp (' + fmt(fr.hyOasBp / 100, 2) + '%)', t('ch8.m6.src'), t('ch8.m6.note')]
    ];
    putHTML('frMerit', `<table><thead><tr><th>${t('ch8.th.m')}</th><th>${t('ch8.th.v')}</th><th>${t('ch8.th.d')}</th><th>${t('ch8.th.n')}</th></tr></thead><tbody>${meritRows.map((r) => `<tr><td>${r[0]}</td><td class="n">${r[1]}</td><td><small>${r[2]}</small></td><td>${r[3]}</td></tr>`).join('')}</tbody></table>`);

    const gRows = fr.global10y.map((g) => [t(`ch8.g.${g.id}`), fmt(g.y, 2) + '%', t(`ch8.g.${g.id}.s`)]);
    putHTML('frGlobal', `<table><thead><tr><th>${t('ch8.th.cty')}</th><th>${t('ch8.th.y10')}</th><th>${t('ch8.th.gsrc')}</th></tr></thead><tbody>${gRows.map((r) => `<tr><td>${r[0]}</td><td class="n">${r[1]}</td><td><small>${r[2]}</small></td></tr>`).join('')}</tbody></table>`);
  }

  /* ───────── Wiring Controls & Presets ───────── */
  const up1 = regModel('m1Cv', drawM1, textM1, [
    ...radios('m1Pre'), byId('m1ShowDF'), byId('m1Y2'), byId('m1Y10'), byId('m1Y30')
  ]);
  const up2 = regModel('m2Cv', drawM2, textM2, [
    ...radios('m2Pre'), byId('m2R0'), byId('m2RL'), byId('m2H'), byId('m2Tp')
  ]);
  radios('m2Pre').forEach((r) => r.addEventListener('change', () => {
    const p = M.eh.presets[r.value];
    if (!p) return;
    byId('m2R0').value = p.r0;
    byId('m2RL').value = p.rL;
    byId('m2H').value = p.h;
    byId('m2Tp').value = p.tp10;
    up2();
  }));

  regModel('m3Cv', drawM3, textM3, [
    ...radios('m3T'), byId('m3Dy'), byId('m3Y0'), byId('m3C')
  ]);
  regModel('m4Cv', drawM4, textM4, [
    ...radios('m4Mode'), byId('m4Lead'), byId('m4Obs'), byId('m4Tp')
  ]);

  const up5 = regModel('m5Cv', drawM5, textM5, [
    ...radios('m5Pre'), byId('m5Sp'), byId('m5Def'), byId('m5Rec')
  ]);
  radios('m5Pre').forEach((r) => r.addEventListener('change', () => {
    const p = M.cred.presets[r.value];
    if (!p) return;
    byId('m5Sp').value = p.spreadBp;
    byId('m5Def').value = p.defaultPct;
    byId('m5Rec').value = p.recoveryPct;
    up5();
  }));

  regModel('m6Cv', drawM6, textM6, [
    byId('m6Lev'), byId('m6Vol'), byId('m6T'), byId('m6Liq')
  ]);

  const up7 = regModel('m7Cv', drawM7, textM7, [
    ...radios('m7Tier'), byId('m7Real'), byId('m7ExpInf'), byId('m7ActInf')
  ]);
  byId('m7SnapNov').addEventListener('click', () => {
    byId('m7Real').value = M.frontier.tips10;
    byId('m7ExpInf').value = M.frontier.breakeven10;
    byId('m7ActInf').value = 3.5;
    setRadio('m7Tier', 'ig');
    up7();
  });
  byId('m7SnapZirp').addEventListener('click', () => {
    byId('m7Real').value = -1.0;
    byId('m7ExpInf').value = 2.5;
    byId('m7ActInf').value = 4.5;
    setRadio('m7Tier', 'ig');
    up7();
  });

  regModel('m8Cv', drawM8, textM8, [
    ...radios('m8View'), byId('m8AddSpread')
  ]);

  texts.push(renderTables);

  /* ───────── Apply Initial & Switched Language ───────── */
  function applyLang() {
    const eff = effLang();
    document.documentElement.lang = eff === 'zh' ? 'zh-CN' : 'en';
    document.title = t('doc.title');
    const md = document.querySelector('meta[name=description]');
    if (md) md.content = t('doc.desc');
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-html]').forEach((el) => {
      el.innerHTML = t(el.dataset.i18nHtml);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      el.setAttribute('aria-label', t(el.dataset.i18nAria));
    });
    document.querySelectorAll('#langToggle button').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
    });
    sims.forEach((s) => { s.dirty = true; });
    texts.forEach((fn) => fn());
    scheduleRender();
  }

  document.querySelectorAll('#langToggle button').forEach((b) => {
    b.addEventListener('click', () => {
      lang = b.dataset.lang;
      writeLang(lang);
      applyLang();
    });
  });

  applyLang();
  up1();
  window.__essayReady = true;
})();
