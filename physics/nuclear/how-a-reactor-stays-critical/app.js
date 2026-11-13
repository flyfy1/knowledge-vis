/* Nuclear Fission: How a Reactor Stays Critical — DOM wiring, canvas plots, i18n, and IntersectionObserver gating.
   All visible copy comes from copy.*.js; all physics comes from models.js (FissionModels). Zero CJK characters here. */
(function () {
  'use strict';

  const M = window.FissionModels;
  const COPY = window.ESSAY_COPY || {};
  const $ = function (s) { return document.querySelector(s); };
  const clamp = function (x, a, b) { return Math.max(a, Math.min(b, x)); };

  const C = {
    bg: '#0f1219', line: '#2b3242', grid: '#1d2330', ink: '#ebe8e0',
    mute: '#a3aab8', dim: '#7e8799', gold: '#e9b949', cyan: '#63c7e6',
    red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', bar: '#4a5368'
  };
  const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
  const FONT_SM = '11px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
  const MONO = '11.5px ui-monospace,"SF Mono",Menlo,Consolas,monospace';
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ───────── Language & string interpolation ───────── */
  const LS_KEY = 'knowledge-lang';
  let memLang = null;
  function readLang() {
    try { return localStorage.getItem(LS_KEY); } catch (e) { return memLang; }
  }
  function writeLang(v) {
    memLang = v;
    try { localStorage.setItem(LS_KEY, v); } catch (e) { /* storage disabled fallback */ }
  }

  let lang = readLang();
  if (lang !== 'zh' && lang !== 'en') lang = 'zh';
  const PV = M.prose();

  function rawKey(k) {
    if (COPY[lang] && COPY[lang][k] != null) return COPY[lang][k];
    if (COPY.zh && COPY.zh[k] != null) return COPY.zh[k];
    return k;
  }

  function fill(str, vars) {
    if (typeof str !== 'string') return str;
    const v = vars || PV;
    return str.replace(/\{([A-Za-z0-9_]+)\}/g, function (_, name) {
      return v[name] != null ? String(v[name]) : (PV[name] != null ? String(PV[name]) : '{' + name + '}');
    });
  }

  function t(k, vars) { return fill(rawKey(k), vars); }

  function formatBig(val) {
    const tiers = rawKey('fmt.big');
    if (Array.isArray(tiers)) {
      for (let i = 0; i < tiers.length; i++) {
        const th = tiers[i][0], tpl = tiers[i][1];
        if (Math.abs(val) >= th) {
          const scaled = val / th;
          const s = scaled >= 100 ? scaled.toFixed(0) : (scaled >= 10 ? scaled.toFixed(1) : scaled.toFixed(2));
          return tpl.replace('{v}', s);
        }
      }
    }
    return Math.round(val).toLocaleString('en-US');
  }

  function fmtEnergy(eV) {
    if (eV >= 1e6) return t('u.mev', { v: (eV / 1e6).toFixed(2) });
    if (eV >= 1e3) return t('u.kev', { v: (eV / 1e3).toFixed(eV >= 1e5 ? 0 : 1) });
    return t('u.ev', { v: eV >= 10 ? eV.toFixed(1) : (eV >= 1 ? eV.toFixed(2) : eV.toFixed(3)) });
  }

  function fmtDuration(sec) {
    if (sec < 60) return t('u.s', { v: sec < 10 ? sec.toFixed(1) : Math.round(sec) });
    if (sec < 3600) return Math.round(sec / 60) + ' min';
    if (sec < 86400) return t('u.hr', { v: (sec / 3600).toFixed(1) });
    return Math.round(sec / 86400) + ' d';
  }

  function fmtYears(yr) {
    if (yr < 10) return t('u.yr', { v: yr.toFixed(1) });
    return t('u.yr', { v: Math.round(yr).toLocaleString('en-US') });
  }

  function fmtSci(x) {
    if (!isFinite(x)) return '∞';
    if (Math.abs(x) >= 1e4) return x.toExponential(1).replace('e+', 'e');
    if (Math.abs(x) >= 100) return Math.round(x).toLocaleString('en-US');
    if (Math.abs(x) >= 10) return x.toFixed(1);
    if (Math.abs(x) >= 1) return x.toFixed(2);
    return x.toFixed(3);
  }

  function applyLang() {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.title = t('doc.title');
    const md = document.querySelector('meta[name="description"]');
    if (md) md.content = t('doc.desc');
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      el.innerHTML = t(el.dataset.i18nHtml);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      el.setAttribute('aria-label', t(el.dataset.i18nAria));
    });
    document.querySelectorAll('#langToggle button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
    });
    // Render source list
    const ul = $('#srcList');
    if (ul) {
      const items = rawKey('src.items');
      if (Array.isArray(items)) {
        ul.innerHTML = items.map(function (html) { return '<li>' + fill(html, PV) + '</li>'; }).join('');
      }
    }
    sims.forEach(function (s) {
      s.dirty = true;
      s.updateText();
      drawIfReady(s);
    });
  }

  document.querySelectorAll('#langToggle button').forEach(function (b) {
    b.addEventListener('click', function () {
      lang = b.dataset.lang === 'en' ? 'en' : 'zh';
      writeLang(lang);
      applyLang();
    });
  });

  /* ───────── Canvas helpers & non-overlapping label tracker ───────── */
  function fitCanvas(cv) {
    const r = cv.getBoundingClientRect();
    const w = Math.max(1, r.width);
    const h = Math.max(1, r.height);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = Math.round(w * dpr);
    const H = Math.round(h * dpr);
    if (cv.width !== W || cv.height !== H) {
      cv.width = W;
      cv.height = H;
    }
    const c = cv.getContext('2d');
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.font = w < 440 ? FONT_SM : FONT;
    c.textBaseline = 'middle';
    c.fillStyle = C.bg;
    c.fillRect(0, 0, w, h);
    return { c: c, w: w, h: h, small: w < 440 };
  }

  function createPlacer(c, w, h) {
    const boxes = [];
    function overlaps(b) {
      for (let i = 0; i < boxes.length; i++) {
        const a = boxes[i];
        if (b.x < a.x + a.w + 3 && b.x + b.w + 3 > a.x && b.y < a.y + a.h + 2 && b.y + b.h + 2 > a.y) return true;
      }
      return false;
    }
    function inBounds(b) {
      return b.x >= 2 && b.x + b.w <= w - 2 && b.y >= 2 && b.y + b.h <= h - 2;
    }
    // Draws text with optional dark backing; nudges vertically/horizontally or skips if crowded
    function put(text, x, y, col, opts) {
      const o = opts || {};
      const align = o.align || 'left';
      const font = o.font || c.font;
      const prevFont = c.font;
      c.font = font;
      const tw = c.measureText(text).width;
      const th = o.th || 14;
      const pad = o.backing ? 3 : 1;

      function boxAt(cx, cy) {
        let bx = align === 'left' ? cx : (align === 'right' ? cx - tw : cx - tw / 2);
        bx = clamp(bx, 3 + pad, Math.max(3 + pad, w - tw - 3 - pad));
        const by = clamp(cy - th / 2, 3, Math.max(3, h - th - 3));
        return { x: bx - pad, y: by, w: tw + pad * 2, h: th, tx: bx, ty: by + th / 2 };
      }

      const shifts = o.shifts || [[0, 0], [0, -16], [0, 16], [0, -32], [0, 32], [-44, -14], [44, -14]];
      let chosen = null;
      for (let i = 0; i < shifts.length; i++) {
        const cand = boxAt(x + shifts[i][0], y + shifts[i][1]);
        if (inBounds(cand) && !overlaps(cand)) { chosen = cand; break; }
      }
      if (!chosen) {
        if (o.required) {
          chosen = boxAt(x, y);
        } else {
          c.font = prevFont;
          return false;
        }
      }
      boxes.push(chosen);
      if (o.backing) {
        c.fillStyle = 'rgba(15,18,25,0.88)';
        c.fillRect(chosen.x, chosen.y, chosen.w, chosen.h);
      }
      c.fillStyle = col;
      c.textAlign = 'left';
      c.textBaseline = 'middle';
      c.fillText(text, chosen.tx, chosen.ty);
      c.font = prevFont;
      return true;
    }
    return { put: put };
  }

  function makeFrame(w, h, m, x0, x1, y0, y1) {
    const L = m[3], R = w - m[1], T = m[0], B = h - m[2];
    return {
      L: L, R: R, T: T, B: B, x0: x0, x1: x1, y0: y0, y1: y1,
      X: function (x) { return L + (R - L) * (x - x0) / (x1 - x0); },
      Y: function (y) { return B - (B - T) * (y - y0) / (y1 - y0); }
    };
  }

  function drawAxes(c, f, p, xLab, yLab, w) {
    c.strokeStyle = C.line;
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(f.L, f.T);
    c.lineTo(f.L, f.B);
    c.lineTo(f.R, f.B);
    c.stroke();
    if (yLab) p.put(yLab, f.L + 4, 12, C.mute, { align: 'left', required: true });
    if (xLab) p.put(xLab, f.R, f.B + (w < 440 ? 28 : 30), C.mute, { align: 'right', required: true });
  }

  function drawTicks(c, f, p, xs, xFmt, ys, yFmt) {
    ys.forEach(function (v) {
      const y = f.Y(v);
      c.strokeStyle = C.grid;
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(f.L + 1, y);
      c.lineTo(f.R, y);
      c.stroke();
      p.put(yFmt(v), f.L - 6, y, C.mute, { align: 'right', shifts: [[0, 0]] });
    });
    xs.forEach(function (v) {
      const x = f.X(v);
      c.strokeStyle = C.line;
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(x, f.B);
      c.lineTo(x, f.B + 4);
      c.stroke();
      p.put(xFmt(v), x, f.B + 14, C.mute, { align: 'center', shifts: [[0, 0]] });
    });
  }

  function drawCurve(c, pts, X, Y, col, lw, dash) {
    c.strokeStyle = col;
    c.lineWidth = lw || 2.2;
    c.lineJoin = 'round';
    if (dash) c.setLineDash(dash);
    c.beginPath();
    let pen = false;
    for (let i = 0; i < pts.length; i++) {
      const pt = pts[i];
      if (!pt || !isFinite(pt[0]) || !isFinite(pt[1])) { pen = false; continue; }
      const px = X(pt[0]), py = Y(pt[1]);
      if (!pen) { c.moveTo(px, py); pen = true; } else c.lineTo(px, py);
    }
    c.stroke();
    c.setLineDash([]);
  }

  /* ───────── IntersectionObserver sim registry ───────── */
  const sims = [];
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      for (let i = 0; i < sims.length; i++) {
        const s = sims[i];
        if (s.cv === entry.target) {
          s.vis = entry.isIntersecting;
          if (s.vis) {
            s.dirty = true;
            drawIfReady(s);
          }
        }
      }
    });
  }, { rootMargin: '80px' });

  function drawIfReady(s) {
    if (!s.vis || !s.dirty) return;
    s.dirty = false;
    s.draw();
    s.cv.dataset.drawn = '1';
  }

  function registerSim(canvasId, cfg) {
    const cv = $(canvasId);
    const sim = {
      cv: cv,
      vis: false,
      dirty: true,
      updateText: cfg.updateText,
      draw: cfg.draw
    };
    sims.push(sim);
    io.observe(cv);
    return sim;
  }

  window.addEventListener('resize', function () {
    sims.forEach(function (s) { s.dirty = true; drawIfReady(s); });
  });

  function bindSeg(segId, onChange) {
    const wrap = $(segId);
    let val = wrap.querySelector('[aria-pressed="true"]').dataset.val;
    wrap.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        val = b.dataset.val;
        wrap.querySelectorAll('button').forEach(function (btn) {
          btn.setAttribute('aria-pressed', String(btn === b));
        });
        onChange(val);
      });
    });
    return function () { return val; };
  }

  function bindSlider(sel, onChange) {
    const el = $(sel);
    el.addEventListener('input', onChange);
    el.addEventListener('change', onChange);
    return el;
  }

  function put(sel, text) {
    const el = $(sel);
    if (el && el.textContent !== text) el.textContent = text;
  }
  function putHTML(sel, html) {
    const el = $(sel);
    if (el && el.__h !== html) { el.innerHTML = html; el.__h = html; }
  }

  /* ───────── 01 Binding energy per nucleon ───────── */
  let sim1 = null;
  const getRx1 = bindSeg('#ch1Seg', function () { if (sim1) { sim1.updateText(); sim1.dirty = true; drawIfReady(sim1); } });
  sim1 = registerSim('#cv1', {
    updateText: function () {
      const rx = getRx1();
      const d = M.ch1Data(rx);
      const isFission = d.kind === 'fission';
      put('#r1q', t('u.mev', { v: d.qPrompt.toFixed(1) }));
      put('#r1tot', isFission ? ('~' + t('u.mev', { v: d.qTotal.toFixed(0) })) : t('u.mev', { v: d.qPrompt.toFixed(2) }));
      put('#r1coal', t('u.t', { v: formatBig(d.coalTotal) }));
      put('#r1cmp', isFission ? t('u.times', { v: d.u235ToDtQRatio.toFixed(1) }) : '1.0×');
      const br = M.ch1Branch(rx);
      putHTML('#say1', t('ch1.say.' + br, {
        qPrompt: d.qPrompt.toFixed(1),
        qTotal: d.qTotal.toFixed(0),
        ratioQ: d.u235ToDtQRatio.toFixed(1),
        coalM: (d.coalTotal / 1e6).toFixed(2),
        dtToU: d.dtToU235Ratio.toFixed(1)
      }));
    },
    draw: function () {
      const rx = getRx1();
      const d = M.ch1Data(rx);
      const ctx = fitCanvas(this.cv), c = ctx.c, w = ctx.w, h = ctx.h, small = ctx.small;
      const p = createPlacer(c, w, h);
      const f = makeFrame(w, h, [28, 18, 42, small ? 40 : 48], 0, 250, 0, 9.6);
      drawAxes(c, f, p, t('ch1.cv.x'), t('ch1.cv.y'), w);
      drawTicks(c, f, p, small ? [0, 60, 120, 180, 240] : [0, 50, 100, 150, 200, 250], String, [0, 3, 6, 9], String);

      // Background curve
      const pts = d.curve.map(function (pt) { return [pt.A, pt.BA]; });
      drawCurve(c, pts, f.X, f.Y, C.dim, 1.8);
      d.curve.forEach(function (pt) {
        c.beginPath();
        c.arc(f.X(pt.A), f.Y(pt.BA), 3, 0, 6.283);
        c.fillStyle = C.mute;
        c.fill();
      });

      // Peak marker Fe-56 / Ni-62
      const peakA = 62, peakBA = M.bindingPerA('Ni62');
      c.beginPath();
      c.arc(f.X(peakA), f.Y(peakBA), 4.5, 0, 6.283);
      c.strokeStyle = C.green;
      c.lineWidth = 1.6;
      c.stroke();
      p.put('Ni-62 / Fe-56', f.X(peakA) + 8, f.Y(peakBA) - 4, C.green, { align: 'left', backing: true });

      // Highlight before & after
      d.beforePts.forEach(function (id) {
        const nuc = M.NUC[id], ba = M.bindingPerA(id);
        const px = f.X(nuc.A), py = f.Y(ba);
        c.beginPath(); c.arc(px, py, 6, 0, 6.283);
        c.fillStyle = C.red; c.fill();
        p.put(id + ' (' + t('ch1.cv.before') + ')', px, py - 14, C.red, { align: nuc.A > 180 ? 'right' : 'left', backing: true });
      });
      d.afterPts.forEach(function (id, idx) {
        const nuc = M.NUC[id], ba = M.bindingPerA(id);
        const px = f.X(nuc.A), py = f.Y(ba);
        c.beginPath(); c.arc(px, py, 6, 0, 6.283);
        c.fillStyle = C.gold; c.fill();
        p.put(id + ' (' + t('ch1.cv.after') + ')', px, py + (idx === 0 ? -15 : 16), C.gold, { align: 'center', backing: true });
      });
    }
  });

  /* ───────── 02 Cross-sections & moderation ───────── */
  let sim2 = null;
  const getMod2 = bindSeg('#ch2Seg', function () { if (sim2) { sim2.updateText(); sim2.dirty = true; drawIfReady(sim2); } });
  const s2E = bindSlider('#s2E', function () { if (sim2) { sim2.updateText(); sim2.dirty = true; drawIfReady(sim2); } });
  sim2 = registerSim('#cv2', {
    updateText: function () {
      const modKey = getMod2();
      const logE = parseFloat(s2E.value);
      const d = M.moderationData(modKey, logE);
      const eStr = fmtEnergy(d.E_eV);
      put('#o2E', eStr);
      put('#r2E', eStr);
      put('#r2sf', t('u.barn', { v: fmtSci(d.sf235) }));
      put('#r2sc', t('u.barn', { v: fmtSci(d.sc238) }));
      put('#r2col', Math.round(d.collisionsHere) + ' / ' + Math.round(d.totalToThermal));
      const br = M.ch2Branch(modKey, logE);
      putHTML('#say2', t('ch2.say.' + br, {
        E: eStr,
        sf: fmtSci(d.sf235),
        sc: fmtSci(d.sc238),
        colNow: Math.round(d.collisionsHere),
        colTot: Math.round(d.totalToThermal),
        sigH: M.MODERATORS.h2o.sigma_a.toFixed(3),
        sigD: M.MODERATORS.d2o.sigma_a.toFixed(5)
      }));
    },
    draw: function () {
      const modKey = getMod2();
      const logE = parseFloat(s2E.value);
      const d = M.moderationData(modKey, logE);
      const ctx = fitCanvas(this.cv), c = ctx.c, w = ctx.w, h = ctx.h, small = ctx.small;
      const p = createPlacer(c, w, h);
      const f = makeFrame(w, h, [30, 18, 42, small ? 44 : 54], -2, 6.6, -1.3, 4.0);
      drawAxes(c, f, p, t('ch2.cv.x'), t('ch2.cv.y'), w);
      drawTicks(c, f, p,
        small ? [-2, 0, 2, 4, 6] : [-2, -1, 0, 1, 2, 3, 4, 5, 6],
        function (lx) { return lx === 0 ? '1' : ('10^' + lx); },
        [-1, 0, 1, 2, 3, 4],
        function (ly) { return ly === 0 ? '1' : ('10^' + ly); }
      );

      // Shaded U-238 resonance trap region (2 eV to 200 eV -> log 0.3 to 2.3)
      const rx0 = f.X(Math.log10(2)), rx1 = f.X(Math.log10(200));
      c.fillStyle = 'rgba(240,122,109,0.09)';
      c.fillRect(rx0, f.T, rx1 - rx0, f.B - f.T);
      p.put(t('ch2.cv.trap'), (rx0 + rx1) / 2, f.T + 12, C.red, { align: 'center', backing: true });

      const ptsF = [], ptsC = [];
      for (let i = 0; i <= 180; i++) {
        const lx = -1.7 + (i / 180) * 8.1;
        const E = Math.pow(10, lx);
        ptsF.push([lx, Math.log10(M.sigmaF235(E))]);
        ptsC.push([lx, Math.log10(M.sigmaC238(E))]);
      }
      drawCurve(c, ptsC, f.X, f.Y, C.red, 1.8);
      drawCurve(c, ptsF, f.X, f.Y, C.cyan, 2.4);

      p.put(t('ch2.cv.u235'), f.X(-1.4), f.Y(Math.log10(M.sigmaF235(0.04))) + 18, C.cyan, { align: 'left', backing: true });
      p.put(t('ch2.cv.u238'), f.X(3.8), f.Y(0.15), C.red, { align: 'left', backing: true });

      // Current E vertical line + dots
      const curX = f.X(d.logE);
      c.strokeStyle = C.gold;
      c.lineWidth = 1.6;
      c.setLineDash([4, 4]);
      c.beginPath(); c.moveTo(curX, f.T); c.lineTo(curX, f.B); c.stroke();
      c.setLineDash([]);

      const fy = f.Y(Math.log10(d.sf235)), cy = f.Y(Math.log10(d.sc238));
      c.beginPath(); c.arc(curX, fy, 5.5, 0, 6.283); c.fillStyle = C.gold; c.fill();
      c.beginPath(); c.arc(curX, cy, 4.5, 0, 6.283); c.fillStyle = C.red; c.fill();
      p.put(fmtEnergy(d.E_eV) + ' · ' + fmtSci(d.sf235) + ' b', curX, Math.max(f.T + 18, fy - 16), C.gold, {
        align: d.logE > 3.5 ? 'right' : 'left', backing: true, required: true
      });
    }
  });

  /* ───────── 03 Six-factor formula ───────── */
  let sim3 = null;
  const getMode3 = bindSeg('#ch3Seg', function () { if (sim3) { sim3.updateText(); sim3.dirty = true; drawIfReady(sim3); } });
  const s3enrich = bindSlider('#s3enrich', function () { if (sim3) { sim3.updateText(); sim3.dirty = true; drawIfReady(sim3); } });
  const s3rods = bindSlider('#s3rods', function () { if (sim3) { sim3.updateText(); sim3.dirty = true; drawIfReady(sim3); } });
  sim3 = registerSim('#cv3', {
    updateText: function () {
      const m = getMode3(), enr = parseFloat(s3enrich.value), rods = parseFloat(s3rods.value);
      const r = M.sixFactor(m, enr, rods);
      const rFull = M.sixFactor('pwr', enr, rods);
      put('#o3enrich', t('u.pct', { v: enr.toFixed(2) }));
      put('#o3rods', t('u.pct', { v: Math.round(rods) }));
      put('#r3k', r.kEff.toFixed(3));
      put('#r3kinf', r.kInf.toFixed(3));
      put('#r3rho', t('u.pcm', { v: (r.rhoPcm >= 0 ? '+' : '') + Math.round(r.rhoPcm) }));
      const stKey = r.kEff >= 1.005 ? 'ch3.state.super' : (r.kEff >= 0.995 ? 'ch3.state.crit' : 'ch3.state.sub');
      put('#r3state', t(stKey));
      const br = M.ch3Branch(m, enr, rods);
      putHTML('#say3', t('ch3.say.' + br, {
        enrich: enr.toFixed(2),
        k: r.kEff.toFixed(3),
        kFull: rFull.kEff.toFixed(3),
        rho: Math.round(r.rhoPcm),
        heuMin: PV.heuMin
      }));
    },
    draw: function () {
      const m = getMode3(), enr = parseFloat(s3enrich.value), rods = parseFloat(s3rods.value);
      const r = M.sixFactor(m, enr, rods);
      const ctx = fitCanvas(this.cv), c = ctx.c, w = ctx.w, h = ctx.h, small = ctx.small;
      const p = createPlacer(c, w, h);
      const yMax = Math.max(2.2, Math.ceil((Math.max(r.eta, r.kEff) + 0.15) * 4) / 4);
      const f = makeFrame(w, h, [28, 18, 42, small ? 38 : 46], -0.6, 6.6, 0, yMax);
      drawAxes(c, f, p, '', t('ch3.cv.barY'), w);
      const yTicksArr = yMax > 2.25 ? [0, 0.5, 1.0, 1.5, 2.0, 2.5] : [0, 0.5, 1.0, 1.5, 2.0];
      drawTicks(c, f, p, [], String, yTicksArr, function (v) { return v.toFixed(1); });

      // k = 1 reference line
      const y1 = f.Y(1.0);
      c.strokeStyle = C.green;
      c.lineWidth = 1.5;
      c.setLineDash([5, 4]);
      c.beginPath(); c.moveTo(f.L, y1); c.lineTo(f.R, y1); c.stroke();
      c.setLineDash([]);
      p.put('1.000', f.R - 4, y1 - 10, C.green, { align: 'right', backing: true });

      const bars = [
        { k: 'η', val: r.eta, col: C.cyan },
        { k: 'f', val: r.f, col: C.cyan },
        { k: 'p', val: r.p, col: C.cyan },
        { k: 'ε', val: r.eps, col: C.cyan },
        { k: 'P_F', val: r.P_F, col: C.violet },
        { k: 'P_T', val: r.P_T, col: C.violet },
        { k: 'k_eff', val: r.kEff, col: r.kEff >= 1.005 ? C.red : (r.kEff >= 0.995 ? C.green : C.gold) }
      ];
      const slotW = (f.R - f.L) / bars.length;
      const bw = Math.min(48, slotW * 0.62);
      for (let i = 0; i < bars.length; i++) {
        const b = bars[i];
        const cx = f.L + slotW * (i + 0.5);
        const topY = f.Y(Math.min(yMax, b.val));
        c.fillStyle = b.col;
        c.fillRect(cx - bw / 2, topY, bw, f.B - topY);
        p.put(b.val.toFixed(2), cx, Math.max(f.T + 10, topY - 10), b.col, { align: 'center', font: MONO });
        p.put(b.k, cx, f.B + 15, i === 6 ? b.col : C.ink, { align: 'center', font: MONO, required: true });
      }
    }
  });

  /* ───────── 04 Delayed neutrons & 6-group point kinetics ───────── */
  let sim4 = null;
  const getMode4 = bindSeg('#ch4Seg', function () { if (sim4) { sim4.updateText(); sim4.dirty = true; drawIfReady(sim4); } });
  const s4rho = bindSlider('#s4rho', function () { if (sim4) { sim4.updateText(); sim4.dirty = true; drawIfReady(sim4); } });
  sim4 = registerSim('#cv4', {
    updateText: function () {
      const m = getMode4(), rhoD = parseFloat(s4rho.value);
      const r = M.kineticsSim(m, rhoD, 10);
      const sign = rhoD > 0 ? '+' : '';
      const dStr = t('u.dollar', { v: sign + rhoD.toFixed(2) });
      const pcmStr = t('u.pcm', { v: (r.rhoPcm > 0 ? '+' : '') + Math.round(r.rhoPcm) });
      put('#o4rho', dStr + ' (' + pcmStr + ')');
      put('#r4rho', dStr + ' / ' + pcmStr);
      put('#r4p10', r.nAtEnd > 1e5 ? r.nAtEnd.toExponential(1) + '×' : t('u.times', { v: fmtSci(r.nAtEnd) }));
      put('#r4peak', r.peakN > 1e5 ? r.peakN.toExponential(1) + '×' : t('u.times', { v: fmtSci(r.peakN) }));
      let perStr = '∞';
      if (isFinite(r.period_s)) {
        perStr = Math.abs(r.period_s) < 0.05 ? t('u.ms', { v: (r.period_s * 1000).toFixed(1) }) : t('u.s', { v: r.period_s.toFixed(1) });
      }
      put('#r4period', perStr);
      const br = M.ch4Branch(m, rhoD);
      putHTML('#say4', t('ch4.say.' + br, {
        rhoD: Math.abs(rhoD).toFixed(2),
        rhoPcm: Math.round(r.rhoPcm),
        p10: r.nAtEnd > 1e4 ? r.nAtEnd.toExponential(1) : fmtSci(r.nAtEnd),
        peak: fmtSci(r.peakN),
        period: isFinite(r.period_s) ? Math.abs(r.period_s).toFixed(1) : '∞',
        tauBar: PV.tauBar,
        lamUs: PV.lamPromptUs
      }));
    },
    draw: function () {
      const m = getMode4(), rhoD = parseFloat(s4rho.value);
      const r = M.kineticsSim(m, rhoD, 10);
      const rRef = M.kineticsSim('nodoppler', Math.min(0.95, Math.max(-0.5, rhoD)), 10);
      const ctx = fitCanvas(this.cv), c = ctx.c, w = ctx.w, h = ctx.h, small = ctx.small;
      const p = createPlacer(c, w, h);

      // Log10 P/P0 axis covering -1 to +4 (0.1x to 10,000x)
      const yMin = -0.6, yMax = 3.5;
      const f = makeFrame(w, h, [28, 18, 42, small ? 44 : 52], 0, 10, yMin, yMax);
      drawAxes(c, f, p, t('ch4.cv.x'), t('ch4.cv.y'), w);
      drawTicks(c, f, p, [0, 2, 4, 6, 8, 10], String, [0, 1, 2, 3], function (ly) {
        return Math.pow(10, ly) + '×';
      });

      // Baseline P=1
      c.strokeStyle = C.line; c.lineWidth = 1; c.setLineDash([3, 3]);
      c.beginPath(); c.moveTo(f.L, f.Y(0)); c.lineTo(f.R, f.Y(0)); c.stroke();
      c.setLineDash([]);

      if (m === 'doppler' && rhoD >= 1.0) {
        const refPts = rRef.series.map(function (pt) { return [pt.t, clamp(Math.log10(pt.n), yMin, yMax)]; });
        drawCurve(c, refPts, f.X, f.Y, C.dim, 1.5, [4, 4]);
      }

      const pts = r.series.map(function (pt) {
        const ly = Math.log10(Math.max(1e-2, pt.n));
        return ly <= yMax + 0.1 ? [pt.t, clamp(ly, yMin, yMax)] : null;
      });
      const col = (m === 'promptOnly' && rhoD > 0.01) || (rhoD >= 1.0 && m !== 'doppler') ? C.red : (rhoD >= 1.0 ? C.gold : C.cyan);
      drawCurve(c, pts, f.X, f.Y, col, 2.5);

      const last = r.series[r.series.length - 1];
      const endLy = clamp(Math.log10(Math.max(1e-2, last.n)), yMin, yMax);
      p.put(
        (last.n > 1e4 ? last.n.toExponential(1) : fmtSci(last.n)) + '×',
        f.X(last.t) - 6, f.Y(endLy) - 12, col, { align: 'right', backing: true, required: true }
      );
    }
  });

  /* ───────── 05 Xenon-135 poisoning & iodine pit ───────── */
  let sim5 = null;
  const getRes5 = bindSeg('#ch5Seg', function () { if (sim5) { sim5.updateText(); sim5.dirty = true; drawIfReady(sim5); } });
  const s5flux = bindSlider('#s5flux', function () { if (sim5) { sim5.updateText(); sim5.dirty = true; drawIfReady(sim5); } });
  const s5post = bindSlider('#s5post', function () { if (sim5) { sim5.updateText(); sim5.dirty = true; drawIfReady(sim5); } });
  sim5 = registerSim('#cv5', {
    updateText: function () {
      const res = parseFloat(getRes5()), flux = parseFloat(s5flux.value), post = parseFloat(s5post.value);
      const r = M.xenonSim(flux, post, res);
      put('#o5flux', flux.toFixed(1) + ' ×10¹³');
      put('#o5post', t('u.pct', { v: Math.round(post) }));
      put('#r5eq', t('u.pcm', { v: Math.round(r.eqWorthPcm) }));
      put('#r5peak', t('u.pcm', { v: Math.round(r.peakNegPcm) }));
      put('#r5peakH', t('u.hr', { v: r.peakHour.toFixed(1) }));
      put('#r5lock', r.isLocked ? t('ch5.lock.no', { h: r.lockedHours.toFixed(1) }) : t('ch5.lock.ok'));
      const br = M.ch5Branch(flux, post, res);
      putHTML('#say5', t('ch5.say.' + br, {
        post: Math.round(post),
        eq: Math.round(r.eqWorthPcm),
        peak: Math.round(r.peakNegPcm),
        peakH: r.peakHour.toFixed(1),
        res: Math.round(res),
        lockH: r.lockedHours.toFixed(1)
      }));
    },
    draw: function () {
      const res = parseFloat(getRes5()), flux = parseFloat(s5flux.value), post = parseFloat(s5post.value);
      const r = M.xenonSim(flux, post, res);
      const ctx = fitCanvas(this.cv), c = ctx.c, w = ctx.w, h = ctx.h, small = ctx.small;
      const p = createPlacer(c, w, h);
      const yMin = Math.min(-7500, Math.floor((r.peakNegPcm - 500) / 1000) * 1000);
      const f = makeFrame(w, h, [28, 18, 42, small ? 48 : 58], 0, 48, yMin, 0);
      drawAxes(c, f, p, t('ch5.cv.x'), t('ch5.cv.y'), w);
      const yStep = yMin < -9000 ? 3000 : 2000;
      const yTicksArr = [];
      for (let yv = 0; yv >= yMin; yv -= yStep) yTicksArr.push(yv);
      drawTicks(c, f, p, [0, 12, 24, 36, 48], String, yTicksArr, String);

      // Available reactivity ceiling (-res)
      const limY = f.Y(-res);
      if (limY >= f.T && limY <= f.B) {
        c.fillStyle = 'rgba(240,122,109,0.09)';
        c.fillRect(f.L, limY, f.R - f.L, f.B - limY);
        c.strokeStyle = C.red; c.lineWidth = 1.5; c.setLineDash([5, 4]);
        c.beginPath(); c.moveTo(f.L, limY); c.lineTo(f.R, limY); c.stroke();
        c.setLineDash([]);
        p.put(t('ch5.cv.limitLine') + ' (-' + res + ')', f.R - 4, limY - 10, C.red, { align: 'right', backing: true });
      }

      const pts = r.series.map(function (pt) { return [pt.h, pt.worthPcm]; });
      drawCurve(c, pts, f.X, f.Y, r.isLocked ? C.red : C.cyan, 2.5);

      const pkX = f.X(r.peakHour), pkY = f.Y(r.peakNegPcm);
      c.beginPath(); c.arc(pkX, pkY, 5, 0, 6.283); c.fillStyle = C.gold; c.fill();
      p.put(Math.round(r.peakNegPcm) + ' pcm @ ' + r.peakHour.toFixed(1) + ' h', pkX, pkY + 15, C.gold, {
        align: r.peakHour > 24 ? 'right' : 'left', backing: true, required: true
      });
    }
  });

  /* ───────── 06 Shutdown decay heat (Way-Wigner) ───────── */
  let sim6 = null;
  const getRun6 = bindSeg('#ch6Seg', function () { if (sim6) { sim6.updateText(); sim6.dirty = true; drawIfReady(sim6); } });
  const s6p0 = bindSlider('#s6p0', function () { if (sim6) { sim6.updateText(); sim6.dirty = true; drawIfReady(sim6); } });
  const s6t = bindSlider('#s6t', function () { if (sim6) { sim6.updateText(); sim6.dirty = true; drawIfReady(sim6); } });
  sim6 = registerSim('#cv6', {
    updateText: function () {
      const runKey = getRun6(), p0 = parseFloat(s6p0.value), logT = parseFloat(s6t.value);
      const r = M.decayHeat(runKey, p0, logT);
      const tStr = fmtDuration(r.t_s);
      put('#o6p0', t('u.mw', { v: Math.round(p0) }));
      put('#o6t', tStr);
      put('#r6frac', t('u.pct', { v: r.fracPct.toFixed(2) }));
      put('#r6mw', t('u.mw', { v: r.mw >= 10 ? r.mw.toFixed(1) : r.mw.toFixed(2) }));
      put('#r6boil', t('u.kgs', { v: r.boilKgS >= 10 ? r.boilKgS.toFixed(1) : r.boilKgS.toFixed(2) }));
      put('#r6cum', t('u.mwh', { v: Math.round(r.cumMWh).toLocaleString('en-US') }));
      const br = M.ch6Branch(runKey, p0, logT);
      putHTML('#say6', t('ch6.say.' + br, {
        tStr: tStr,
        mw: r.mw >= 10 ? r.mw.toFixed(1) : r.mw.toFixed(2),
        pct: r.fracPct.toFixed(2),
        boil: r.boilKgS >= 10 ? r.boilKgS.toFixed(1) : r.boilKgS.toFixed(2),
        boilTon: Math.round(r.boilTonDay).toLocaleString('en-US'),
        cumMWh: Math.round(r.cumMWh).toLocaleString('en-US')
      }));
    },
    draw: function () {
      const runKey = getRun6(), p0 = parseFloat(s6p0.value), logT = parseFloat(s6t.value);
      const r = M.decayHeat(runKey, p0, logT);
      const rDay = M.decayHeat('day', p0, logT);
      const ctx = fitCanvas(this.cv), c = ctx.c, w = ctx.w, h = ctx.h, small = ctx.small;
      const p = createPlacer(c, w, h);
      const xMax = Math.log10(30 * 86400);
      const f = makeFrame(w, h, [28, 18, 42, small ? 40 : 48], 0, xMax, -1.5, 1.0);
      drawAxes(c, f, p, t('ch6.cv.x'), t('ch6.cv.y'), w);
      drawTicks(c, f, p,
        [0, Math.log10(60), Math.log10(3600), Math.log10(86400), Math.log10(7 * 86400)],
        function (lx) {
          if (lx < 0.5) return '1 s';
          if (lx < 2.5) return '1 m';
          if (lx < 4.0) return '1 h';
          if (lx < 5.2) return '1 d';
          return '7 d';
        },
        [-1, 0, 1],
        function (ly) { return Math.pow(10, ly) + '%'; }
      );

      if (runKey !== 'day') {
        const dayPts = rDay.curve.map(function (pt) { return [pt.logT, Math.max(-1.5, Math.log10(Math.max(1e-3, pt.fracPct)))]; });
        drawCurve(c, dayPts, f.X, f.Y, C.dim, 1.4, [4, 4]);
      }
      const pts = r.curve.map(function (pt) { return [pt.logT, Math.max(-1.5, Math.log10(Math.max(1e-3, pt.fracPct)))]; });
      drawCurve(c, pts, f.X, f.Y, C.gold, 2.5);

      const mx = f.X(Math.min(xMax, logT));
      const my = f.Y(Math.max(-1.5, Math.log10(Math.max(1e-3, r.fracPct))));
      c.beginPath(); c.arc(mx, my, 5.5, 0, 6.283); c.fillStyle = C.red; c.fill();
      p.put(r.mw.toFixed(1) + ' MW (' + r.fracPct.toFixed(2) + '%)', mx, my - 15, C.red, {
        align: logT > xMax * 0.55 ? 'right' : 'left', backing: true, required: true
      });
    }
  });

  /* ───────── 07 Spent fuel & radiotoxicity horizon ───────── */
  let sim7 = null;
  const getCyc7 = bindSeg('#ch7Seg', function () { if (sim7) { sim7.updateText(); sim7.dirty = true; drawIfReady(sim7); } });
  const s7yr = bindSlider('#s7yr', function () { if (sim7) { sim7.updateText(); sim7.dirty = true; drawIfReady(sim7); } });
  const s7gw = bindSlider('#s7gw', function () { if (sim7) { sim7.updateText(); sim7.dirty = true; drawIfReady(sim7); } });
  sim7 = registerSim('#cv7', {
    updateText: function () {
      const cyc = getCyc7(), logYr = parseFloat(s7yr.value), gwe = parseFloat(s7gw.value);
      const r = M.wasteModel(cyc, logYr, gwe);
      const yrStr = fmtYears(r.year);
      put('#o7yr', yrStr);
      put('#o7gw', gwe.toFixed(0) + ' GWe');
      put('#r7thm', t('u.t', { v: r.tHM_yr.toFixed(1) }));
      put('#r7kw', t('u.kwth', { v: r.kwPerT >= 1 ? r.kwPerT.toFixed(2) : r.kwPerT.toFixed(4) }));
      put('#r7tox', t('u.times', { v: r.toxRatio >= 10 ? Math.round(r.toxRatio) : r.toxRatio.toFixed(2) }));
      put('#r7cross', fmtYears(r.crossoverYr));
      const br = M.ch7Branch(cyc, logYr, gwe);
      putHTML('#say7', t('ch7.say.' + br, {
        yr: Math.round(r.year).toLocaleString('en-US'),
        kw: r.kwPerT >= 1 ? r.kwPerT.toFixed(2) : r.kwPerT.toFixed(3),
        thm: r.tHM_yr.toFixed(1),
        casks: r.casksPerYr.toFixed(1),
        ashText: t('u.t', { v: formatBig(r.coalAshT_yr) }),
        cross: Math.round(r.crossoverYr).toLocaleString('en-US'),
        tox: r.toxRatio >= 10 ? Math.round(r.toxRatio) : r.toxRatio.toFixed(2)
      }));
    },
    draw: function () {
      const cyc = getCyc7(), logYr = parseFloat(s7yr.value), gwe = parseFloat(s7gw.value);
      const r = M.wasteModel(cyc, logYr, gwe);
      const rOnce = M.wasteModel('once', logYr, gwe);
      const ctx = fitCanvas(this.cv), c = ctx.c, w = ctx.w, h = ctx.h, small = ctx.small;
      const p = createPlacer(c, w, h);
      const f = makeFrame(w, h, [28, 18, 42, small ? 44 : 52], 0, 5, -1.5, 3.5);
      drawAxes(c, f, p, t('ch7.cv.x'), t('ch7.cv.y'), w);
      drawTicks(c, f, p, [0, 1, 2, 3, 4, 5], function (ly) { return '10^' + ly; }, [-1, 0, 1, 2, 3], function (ly) { return '10^' + ly + '×'; });

      // 1x uranium ore line
      const oreY = f.Y(0);
      c.strokeStyle = C.green; c.lineWidth = 1.5; c.setLineDash([5, 4]);
      c.beginPath(); c.moveTo(f.L, oreY); c.lineTo(f.R, oreY); c.stroke();
      c.setLineDash([]);
      p.put(t('ch7.cv.oreLine'), f.L + 6, oreY + 12, C.green, { align: 'left', backing: true });

      if (cyc === 'reprocess') {
        const oncePts = rOnce.curve.map(function (pt) { return [pt.logYear, Math.max(-1.5, Math.log10(Math.max(1e-3, pt.toxRatio)))]; });
        drawCurve(c, oncePts, f.X, f.Y, C.dim, 1.5, [4, 4]);
      }
      const pts = r.curve.map(function (pt) { return [pt.logYear, Math.max(-1.5, Math.log10(Math.max(1e-3, pt.toxRatio)))]; });
      drawCurve(c, pts, f.X, f.Y, cyc === 'reprocess' ? C.cyan : C.gold, 2.5);

      const mx = f.X(logYr), my = f.Y(Math.max(-1.5, Math.log10(Math.max(1e-3, r.toxRatio))));
      c.beginPath(); c.arc(mx, my, 5.5, 0, 6.283); c.fillStyle = C.red; c.fill();
      p.put((r.toxRatio >= 10 ? Math.round(r.toxRatio) : r.toxRatio.toFixed(2)) + '× @ ' + fmtYears(r.year), mx, my - 15, C.red, {
        align: logYr > 2.6 ? 'right' : 'left', backing: true, required: true
      });
    }
  });

  /* ───────── 08 Frontier reactor architectures ───────── */
  let sim8 = null;
  const getArch8 = bindSeg('#ch8Seg', function () { if (sim8) { sim8.updateText(); sim8.dirty = true; drawIfReady(sim8); } });
  sim8 = registerSim('#cv8', {
    updateText: function () {
      const a = getArch8();
      const d = M.ch8Data(a);
      put('#r8enrich', t('u.pct', { v: d.enrichPct }));
      put('#r8temp', t('u.degc', { v: d.outletC }));
      put('#r8carnot', t('u.pct', { v: d.carnotPct.toFixed(1) }));
      put('#r8real', t('u.pct', { v: d.realEffPct.toFixed(1) }));
      putHTML('#say8', t('ch8.say.' + d.id, {
        enrich: d.enrichPct,
        temp: d.outletC,
        carnot: d.carnotPct.toFixed(1),
        real: d.realEffPct.toFixed(1)
      }));
    },
    draw: function () {
      const sel = getArch8();
      const ids = ['pwr', 'candu', 'htgr', 'naFast'];
      const ctx = fitCanvas(this.cv), c = ctx.c, w = ctx.w, h = ctx.h, small = ctx.small;
      const p = createPlacer(c, w, h);
      const f = makeFrame(w, h, [32, 18, 42, small ? 42 : 52], -0.5, 3.5, 0, 80);
      drawAxes(c, f, p, '', '%', w);
      drawTicks(c, f, p, [], String, [0, 20, 40, 60, 80], function (v) { return v + '%'; });

      const slotW = (f.R - f.L) / ids.length;
      const bw = Math.min(24, slotW * 0.24);

      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        const d = M.ch8Data(id);
        const cx = f.L + slotW * (i + 0.5);
        const isSel = id === sel;

        // Three grouped bars: Carnot ceiling, Real efficiency, Enrichment %
        const vals = [
          { v: d.carnotPct, col: isSel ? C.cyan : 'rgba(99,199,230,0.35)' },
          { v: d.realEffPct, col: isSel ? C.green : 'rgba(122,214,160,0.35)' },
          { v: d.enrichPct, col: isSel ? C.gold : 'rgba(233,185,73,0.35)' }
        ];
        for (let j = 0; j < vals.length; j++) {
          const bx = cx + (j - 1.5) * (bw + 2);
          const by = f.Y(vals[j].v);
          c.fillStyle = vals[j].col;
          c.fillRect(bx, by, bw, f.B - by);
          if (isSel) {
            p.put(vals[j].v.toFixed(id === 'candu' && j === 2 ? 2 : 0) + '%', bx + bw / 2, by - 9, vals[j].col, {
              align: 'center', font: FONT_SM
            });
          }
        }
        p.put(t('ch8.arch.' + id).replace(/\s*\([^)]+\)/, ''), cx, f.B + 15, isSel ? C.ink : C.mute, {
          align: 'center', font: small ? FONT_SM : FONT, required: true
        });
      }

      // Legend in top right
      p.put('■ ' + t('ch8.cv.carnot'), f.R - 6, f.T + 8, C.cyan, { align: 'right', backing: true, font: FONT_SM });
      p.put('■ ' + t('ch8.cv.real'), f.R - 6, f.T + 24, C.green, { align: 'right', backing: true, font: FONT_SM });
      p.put('■ ' + t('ch8.cv.enrich'), f.R - 6, f.T + 40, C.gold, { align: 'right', backing: true, font: FONT_SM });
    }
  });

  /* ───────── Scroll TOC active highlight ───────── */
  const tocLinks = Array.prototype.slice.call(document.querySelectorAll('.toc a'));
  const secObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const id = '#' + entry.target.id;
        tocLinks.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === id); });
      }
    });
  }, { rootMargin: '-30% 0px -55% 0px' });
  document.querySelectorAll('section.ch').forEach(function (sec) { secObserver.observe(sec); });

  /* ───────── Init ───────── */
  applyLang();
  if (reduceMotion) {
    document.documentElement.style.scrollBehavior = 'auto';
  }
})();
