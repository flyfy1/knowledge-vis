(function () {
  'use strict';

  const M = window.ReactionModels;
  const COPY = window.ESSAY_COPY || {};
  const C = {
    bg: '#0f1219', card2: '#1a1f2b', line: '#2b3242',
    ink: '#ebe8e0', mute: '#a3aab8', dim: '#697284',
    gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d',
    green: '#7ad6a0', violet: '#b39dfb'
  };
  const FONT = '12px/1.3 -apple-system,"PingFang SC","Noto Sans CJK SC",system-ui,sans-serif';
  const FONTB = '600 12px/1.3 -apple-system,"PingFang SC","Noto Sans CJK SC",system-ui,sans-serif';
  const MONO = '11px/1.3 ui-monospace,Menlo,Consolas,monospace';
  const REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let LANG = 'zh';
  try {
    const saved = localStorage.getItem('knowledge-lang');
    if (saved === 'en' || (!saved && navigator.language && navigator.language.toLowerCase().startsWith('en'))) {
      if (COPY.en) LANG = 'en';
    }
  } catch (_) {}

  function dict() {
    return (LANG === 'en' && COPY.en) ? COPY.en : (COPY.zh || {});
  }

  function t(key, vars) {
    const d = dict();
    let s = (d[key] != null) ? d[key] : ((COPY.zh && COPY.zh[key] != null) ? COPY.zh[key] : key);
    if (vars) {
      for (const k of Object.keys(vars)) {
        s = s.split('{' + k + '}').join(String(vars[k]));
      }
    }
    return s;
  }

  const $ = (s, root) => (root || document).querySelector(s);
  const $$ = (s, root) => Array.from((root || document).querySelectorAll(s));
  const put = (s, txt) => { const el = $(s); if (el) el.textContent = txt; };
  const putHTML = (s, html) => { const el = $(s); if (el) el.innerHTML = html; };
  const radioVal = name => {
    const el = $('input[name="' + name + '"]:checked');
    return el ? el.value : '';
  };

  function fmt(v, d = 0) {
    if (!Number.isFinite(v)) return '—';
    const abs = Math.abs(v);
    if (abs < Math.pow(10, -d - 1)) return (0).toFixed(d);
    return v.toFixed(d);
  }

  function fmtSmart(v) {
    if (!Number.isFinite(v)) return '—';
    const a = Math.abs(v);
    if (a === 0) return '0';
    if (a >= 1e5 || a < 1e-3) return v.toExponential(2);
    if (a >= 100) return v.toFixed(0);
    if (a >= 10) return v.toFixed(1);
    if (a >= 1) return v.toFixed(2);
    return v.toFixed(3);
  }

  function fmtSciPow(v) {
    if (!Number.isFinite(v) || v <= 0) return '0';
    const exp = Math.floor(Math.log10(v));
    const mant = v / Math.pow(10, exp);
    const sup = String(exp).split('').map(ch => {
      if (ch === '-') return '⁻';
      return '⁰¹²³⁴⁵⁶⁷⁸⁹'[+ch] || ch;
    }).join('');
    return mant.toFixed(2) + ' × 10' + sup;
  }

  /* ── Canvas helpers with strict bounds clamping & overlap prevention ── */
  function fit(cv) {
    const rect = cv.getBoundingClientRect();
    const w = Math.max(200, Math.round(rect.width || cv.clientWidth || 600));
    const h = Math.max(140, Math.round(rect.height || cv.clientHeight || 300));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
    }
    const c = cv.getContext('2d');
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, w, h);
    c._cw = w;
    c._ch = h;
    return { c, w, h };
  }

  function frame(w, h, pad, x0, x1, y0, y1) {
    const [pt, pr, pb, pl] = pad;
    const L = pl, R = w - pr, T = pt, B = h - pb;
    const dx = (x1 - x0) || 1, dy = (y1 - y0) || 1;
    return {
      w, h, L, R, T, B, x0, x1, y0, y1,
      X: x => L + ((x - x0) / dx) * (R - L),
      Y: y => B - ((y - y0) / dy) * (B - T)
    };
  }

  function safeText(c, txt, x, y, col, align = 'left', font = FONT, bg = null) {
    c.save();
    c.font = font;
    c.textBaseline = 'middle';
    const cw = c._cw || 9999;
    const ch = c._ch || 9999;
    const m = c.measureText(txt);
    const tw = m.width;
    let drawX = x;
    if (align === 'center') {
      drawX = M.clamp(x, tw / 2 + 4, cw - tw / 2 - 4);
    } else if (align === 'right') {
      drawX = M.clamp(x, tw + 4, cw - 4);
    } else {
      drawX = M.clamp(x, 4, cw - tw - 4);
    }
    const drawY = M.clamp(y, 9, ch - 9);
    if (bg) {
      const lx = align === 'center' ? drawX - tw / 2 : (align === 'right' ? drawX - tw : drawX);
      c.fillStyle = bg;
      c.fillRect(lx - 3, drawY - 7, tw + 6, 14);
    }
    c.textAlign = align;
    c.fillStyle = col || C.ink;
    c.fillText(txt, drawX, drawY);
    c.restore();
  }

  function path(c, pts, col, lw = 2, dash = null) {
    if (!pts.length) return;
    c.save();
    c.strokeStyle = col;
    c.lineWidth = lw;
    if (dash) c.setLineDash(dash);
    c.beginPath();
    pts.forEach((p, i) => (i === 0 ? c.moveTo(p[0], p[1]) : c.lineTo(p[0], p[1])));
    c.stroke();
    c.restore();
  }

  function vline(c, x, y0, y1, col, dash = [4, 4], lw = 1.3) {
    c.save();
    c.strokeStyle = col;
    c.lineWidth = lw;
    if (dash) c.setLineDash(dash);
    c.beginPath();
    c.moveTo(x, y0);
    c.lineTo(x, y1);
    c.stroke();
    c.restore();
  }

  function hline(c, y, x0, x1, col, dash = [4, 4], lw = 1.2) {
    c.save();
    c.strokeStyle = col;
    c.lineWidth = lw;
    if (dash) c.setLineDash(dash);
    c.beginPath();
    c.moveTo(x0, y);
    c.lineTo(x1, y);
    c.stroke();
    c.restore();
  }

  function xTicks(c, f, vals, fmtFn) {
    c.save();
    c.font = MONO;
    let lastR = -1e9;
    for (const v of vals) {
      const px = f.X(v);
      if (px < f.L - 1 || px > f.R + 1) continue;
      c.strokeStyle = 'rgba(43,50,66,0.55)';
      c.lineWidth = 1;
      c.beginPath(); c.moveTo(px, f.T); c.lineTo(px, f.B); c.stroke();
      const s = fmtFn(v);
      const tw = c.measureText(s).width;
      const lx = M.clamp(px - tw / 2, 4, (c._cw || f.w) - tw - 4);
      if (lx > lastR + 6) {
        safeText(c, s, lx + tw / 2, f.B + 11, C.mute, 'center', MONO);
        lastR = lx + tw;
      }
    }
    c.restore();
  }

  function yTicks(c, f, vals, fmtFn) {
    c.save();
    c.font = MONO;
    let lastY = 1e9;
    const sorted = vals.slice().sort((a, b) => a - b); // bottom to top -> y descending
    for (const v of sorted) {
      const py = f.Y(v);
      if (py < f.T - 1 || py > f.B + 1) continue;
      c.strokeStyle = 'rgba(43,50,66,0.55)';
      c.lineWidth = 1;
      c.beginPath(); c.moveTo(f.L, py); c.lineTo(f.R, py); c.stroke();
      if (Math.abs(py - lastY) >= 16) {
        safeText(c, fmtFn(v), f.L - 6, py, C.mute, 'right', MONO);
        lastY = py;
      }
    }
    c.restore();
  }

  function axesBox(c, f, xLabel, yLabel) {
    c.save();
    c.strokeStyle = C.line;
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(f.L, f.T);
    c.lineTo(f.L, f.B);
    c.lineTo(f.R, f.B);
    c.stroke();
    c.restore();
    if (xLabel) safeText(c, xLabel, f.R, f.B + 25, C.mute, 'right', MONO);
    if (yLabel) safeText(c, yLabel, f.L, Math.max(9, f.T - 11), C.mute, 'left', MONO);
  }

  // Deterministic 1D vertical de-overlap inside [yMin, yMax]
  function resolveVertical(items, minGap, yMin, yMax) {
    items.sort((a, b) => a.ty - b.ty);
    for (let i = 0; i < items.length; i++) {
      items[i].ly = M.clamp(items[i].ty, yMin, yMax);
    }
    for (let i = 1; i < items.length; i++) {
      items[i].ly = Math.max(items[i].ly, items[i - 1].ly + minGap);
    }
    const over = items.length ? items[items.length - 1].ly - yMax : 0;
    if (over > 0) {
      for (const it of items) it.ly -= over;
    }
    for (let i = items.length - 2; i >= 0; i--) {
      items[i].ly = Math.min(items[i].ly, items[i + 1].ly - minGap);
    }
    for (const it of items) it.ly = M.clamp(it.ly, yMin, yMax);
    return items;
  }

  /* ── Visibility-gated RAF loop ── */
  const sims = [];
  let rafId = 0;
  let lastTs = 0;

  function reg(cv, opts) {
    const sim = {
      cv,
      visible: false,
      dirty: true,
      draw: opts.draw,
      step: opts.step || null,
      text: null
    };
    sims.push(sim);
    return sim;
  }

  function tick(ts) {
    rafId = 0;
    const dt = lastTs ? Math.min(0.05, (ts - lastTs) / 1000) : 0.016;
    lastTs = ts;
    let needMore = false;
    for (const s of sims) {
      if (!s.visible) continue;
      if (s.step && s.step(dt)) needMore = true;
      if (s.dirty) {
        s.dirty = false;
        s.draw();
      }
    }
    if (needMore) scheduleTick();
  }

  function scheduleTick() {
    if (!rafId) rafId = requestAnimationFrame(tick);
  }

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      for (const e of entries) {
        const s = sims.find(x => x.cv === e.target);
        if (!s) continue;
        s.visible = e.isIntersecting;
        if (s.visible) { s.dirty = true; scheduleTick(); }
      }
    }, { rootMargin: '120px 0px' });
    // observed right after registration below
    window.__essayObserve = cv => io.observe(cv);
  } else {
    window.__essayObserve = cv => {
      const s = sims.find(x => x.cv === cv);
      if (s) { s.visible = true; s.dirty = true; scheduleTick(); }
    };
  }

  window.addEventListener('resize', () => {
    for (const s of sims) { s.dirty = true; }
    scheduleTick();
  });

  /* ══════════════════════════════════════════════════════════════════
     CH 1: Multiplicity W & Random Exchange Walker
  ══════════════════════════════════════════════════════════════════ */
  (() => {
    const cv = $('#ch1Cv');
    const sNa = $('#ch1Na'), sQ = $('#ch1Q');
    const bPlay = $('#ch1Play'), bStep = $('#ch1Step'), bReset = $('#ch1Reset');
    const wrapEnergy = $('#ch1EnergyCtl');

    let mode = 'energy';
    let playing = !REDUCED;
    let rng = M.mulberry32(42);
    let walker = null;
    let acc = 0;

    function resetWalker() {
      const NA = +sNa.value, NB = 10, Q = +sQ.value;
      rng = M.mulberry32(42 + NA * 7 + Q * 13);
      if (mode === 'energy') {
        const dist = M.einsteinDist(NA, NB, Q);
        walker = {
          mode: 'energy',
          qA: 0, // start maximally ordered!
          Q,
          steps: 0,
          hist: new Array(Q + 1).fill(0)
        };
        walker.hist[0] = 1;
        if (REDUCED) {
          for (let i = 0; i < 400; i++) M.stepEnergyWalker(walker, NA, NB, rng);
        }
        return dist;
      }
      const m = 16;
      const grid = new Array(2 * m).fill(0);
      for (let i = 0; i < m; i++) grid[i] = 1; // 1 = red on left, 0 = blue on right
      walker = {
        mode: 'mixing',
        grid,
        k: 0,
        steps: 0,
        hist: new Array(m + 1).fill(0)
      };
      walker.hist[0] = 1;
      if (REDUCED) {
        for (let i = 0; i < 400; i++) M.stepMixingWalker(walker, m, rng);
      }
      return M.mixingDist(m);
    }

    resetWalker();

    function advance(n) {
      const NA = +sNa.value, NB = 10;
      for (let i = 0; i < n; i++) {
        if (mode === 'energy') M.stepEnergyWalker(walker, NA, NB, rng);
        else M.stepMixingWalker(walker, 16, rng);
      }
    }

    const sim = reg(cv, {
      step(dt) {
        if (!playing || REDUCED) return false;
        acc += dt;
        const stepEvery = 0.04;
        let moved = false;
        while (acc >= stepEvery) {
          acc -= stepEvery;
          advance(4);
          moved = true;
        }
        if (moved) {
          sim.dirty = true;
          updateCurReadout();
        }
        return true;
      },
      draw() {
        const { c, w, h } = fit(cv);
        const NA = +sNa.value, NB = 10, Q = +sQ.value;
        const dist = mode === 'energy' ? M.einsteinDist(NA, NB, Q) : M.mixingDist(16);
        const probs = dist.probs;
        const maxP = Math.max(0.05, Math.max(...probs) * 1.18);

        // Top schematic strip (microstate illustration)
        const stripH = 54;
        c.fillStyle = C.card2;
        c.fillRect(12, 8, w - 24, stripH);
        c.strokeStyle = C.line;
        c.strokeRect(12, 8, w - 24, stripH);
        const midX = w / 2;
        if (mode === 'energy') {
          const leftFrac = walker.qA / Q;
          const bw = (w - 56) / 2;
          c.fillStyle = 'rgba(233,185,73,0.22)';
          c.fillRect(20, 26, bw * leftFrac, 22);
          c.fillStyle = 'rgba(99,199,230,0.22)';
          c.fillRect(midX + 8, 26, bw * (1 - leftFrac), 22);
          vline(c, midX, 12, 58, C.line, null, 1.5);
          safeText(c, `A (${NA}): qA = ${walker.qA}`, 24, 18, C.gold, 'left', MONO);
          safeText(c, `B (${NB}): qB = ${Q - walker.qA}`, midX + 12, 18, C.cyan, 'left', MONO);
          safeText(c, t('ch1.cv.steps', { v: walker.steps }), w - 20, 40, C.mute, 'right', MONO);
        } else {
          const cellW = Math.min(12, (w - 48) / 32);
          const x0 = (w - cellW * 32) / 2;
          for (let i = 0; i < 32; i++) {
            c.fillStyle = walker.grid[i] ? C.red : C.cyan;
            c.beginPath();
            c.arc(x0 + (i + 0.5) * cellW, 39, Math.max(2.5, cellW * 0.34), 0, Math.PI * 2);
            c.fill();
          }
          vline(c, midX, 14, 58, C.gold, [3, 3], 1.5);
          safeText(c, `k = ${walker.k} / 16`, 20, 18, C.ink, 'left', MONO);
          safeText(c, t('ch1.cv.steps', { v: walker.steps }), w - 20, 18, C.mute, 'right', MONO);
        }

        // Main histogram below
        const nBins = probs.length;
        const f = frame(w, h, [82, 14, 38, 44], -0.5, nBins - 0.5, 0, maxP);
        const yStep = maxP > 0.28 ? 0.10 : 0.05;
        const yvs = [];
        for (let y = 0; y <= maxP + 1e-6; y += yStep) yvs.push(Number(y.toFixed(2)));
        yTicks(c, f, yvs, v => Math.round(v * 100) + '%');

        const xStep = nBins > 24 ? 5 : (nBins > 12 ? 4 : 2);
        const xvs = [];
        for (let k = 0; k < nBins; k += xStep) xvs.push(k);
        if (xvs[xvs.length - 1] !== nBins - 1) xvs.push(nBins - 1);
        xTicks(c, f, xvs, v => String(v));
        axesBox(c, f, mode === 'energy' ? 'qA' : 'k', t('ch1.cv.ytot'));

        const barW = Math.max(2, ((f.R - f.L) / nBins) * 0.78);
        for (let k = 0; k < nBins; k++) {
          const cx = f.X(k);
          const py = f.Y(probs[k]);
          c.fillStyle = 'rgba(233,185,73,0.72)';
          c.fillRect(cx - barW / 2, py, barW, f.B - py);
        }

        // Overlay empirical visited density
        if (walker.steps > 10) {
          const totalH = walker.hist.reduce((a, b) => a + b, 0) || 1;
          c.fillStyle = 'rgba(99,199,230,0.28)';
          for (let k = 0; k < nBins; k++) {
            const hp = walker.hist[k] / totalH;
            const py = f.Y(Math.min(maxP, hp));
            c.fillRect(f.X(k) - barW * 0.35, py, barW * 0.7, f.B - py);
          }
        }

        // Current walker marker
        const curPos = mode === 'energy' ? walker.qA : walker.k;
        const mx = f.X(curPos);
        vline(c, mx, f.T, f.B, C.cyan, [3, 3], 1.8);
        c.fillStyle = C.cyan;
        c.beginPath();
        c.arc(mx, f.Y(probs[curPos]), 5.5, 0, Math.PI * 2);
        c.fill();
        c.strokeStyle = C.bg;
        c.lineWidth = 1.5;
        c.stroke();

        const peak = mode === 'energy' ? dist.peakQ : dist.peakK;
        safeText(c, t('ch1.cv.peak', { p: peak, pct: fmt(dist.peakProb * 100, 1) }), f.X(peak), f.T + 10, C.gold, peak > nBins * 0.65 ? 'right' : (peak < nBins * 0.35 ? 'left' : 'center'), FONTB, C.bg);
      }
    });

    function updateCurReadout() {
      const cur = mode === 'energy' ? walker.qA : walker.k;
      putHTML('#ch1Cur', t(mode === 'energy' ? 'ch1.unit.q' : 'ch1.unit.k', { v: cur }));
    }

    function text() {
      const NA = +sNa.value, NB = 10, Q = +sQ.value;
      wrapEnergy.hidden = (mode === 'mixing');
      put('#ch1NaOut', NA);
      put('#ch1QOut', Q);
      put('#ch1Play', t(playing ? 'common.pause' : 'common.resume'));

      const dist = mode === 'energy' ? M.einsteinDist(NA, NB, Q) : M.mixingDist(16);
      const pct = fmt(dist.peakProb * 100, 2);
      const sk = fmt(dist.peakSoverK, 2);
      put('#ch1Wmax', t('ch1.unit.pct', { v: pct }));
      put('#ch1Smax', sk);
      const edgeStr = dist.edgeProb >= 1e-4
        ? fmt(dist.edgeProb * 100, 4) + '%'
        : (dist.edgeProb * 100).toExponential(2) + '%';
      put('#ch1Edge', edgeStr);
      updateCurReadout();

      const key = M.say.ch1(mode, { NA, NB });
      const peak = mode === 'energy' ? dist.peakQ : dist.peakK;
      const wpeak = mode === 'mixing' ? fmtSciPow(Math.exp(dist.logW[peak])) : '';
      putHTML('#ch1Say', t(key, { NA, Q, peak, pct, sk, edge: edgeStr, wpeak }));
    }

    sim.text = text;
    window.__essayObserve(cv);

    $$('input[name="ch1mode"]').forEach(r => r.addEventListener('change', () => {
      mode = radioVal('ch1mode');
      resetWalker();
      sim.dirty = true;
      text();
    }));
    [sNa, sQ].forEach(el => el.addEventListener('input', () => {
      resetWalker();
      sim.dirty = true;
      text();
    }));
    bPlay.addEventListener('click', () => {
      playing = !playing;
      text();
      if (playing) scheduleTick();
    });
    bStep.addEventListener('click', () => {
      playing = false;
      advance(1);
      sim.dirty = true;
      text();
    });
    bReset.addEventListener('click', () => {
      resetWalker();
      sim.dirty = true;
      text();
      if (playing) scheduleTick();
    });
    text();
  })();

  /* ══════════════════════════════════════════════════════════════════
     CH 2: Boltzmann Factor from Bath Multiplicity
  ══════════════════════════════════════════════════════════════════ */
  (() => {
    const cv = $('#ch2Cv');
    const sT = $('#ch2T'), sDe = $('#ch2De'), sNb = $('#ch2Nb');

    const sim = reg(cv, {
      draw() {
        const { c, w, h } = fit(cv);
        const T = +sT.value, dE = +sDe.value, NB = +sNb.value;
        const res = M.boltzmannVsBath(T, dE, NB);
        const stacked = w < 560;

        // Panel A: 4 discrete energy levels (left or top)
        const fA = stacked
          ? frame(w, h * 0.48, [22, 14, 28, 42], -0.5, 3.5, 0, 1)
          : frame(w * 0.48, h, [26, 14, 36, 44], -0.5, 3.5, 0, 1);

        yTicks(c, fA, [0, 0.25, 0.5, 0.75, 1], v => Math.round(v * 100) + '%');
        xTicks(c, fA, [0, 1, 2, 3], i => (i === 0 ? '0' : i + 'ΔE'));
        axesBox(c, fA, '', 'p_i');

        const bw = Math.min(28, (fA.R - fA.L) / 6);
        for (let i = 0; i < 4; i++) {
          const cx = fA.X(i);
          const pb = res.pBath[i], pz = res.pBoltz[i];
          const pyB = fA.Y(pb), pyZ = fA.Y(pz);
          c.fillStyle = 'rgba(233,185,73,0.78)';
          c.fillRect(cx - bw * 0.55, pyB, bw * 0.52, fA.B - pyB);
          c.strokeStyle = C.cyan;
          c.lineWidth = 2;
          c.strokeRect(cx + bw * 0.04, pyZ, bw * 0.52, fA.B - pyZ);
          const topY = Math.min(pyB, pyZ) - 9;
          safeText(c, fmt(pz * 100, 1) + '%', cx, topY, C.ink, 'center', MONO);
        }

        // Panel B: p_i vs T (150..1200 K)
        const ox = stacked ? 0 : w * 0.52;
        const oy = stacked ? h * 0.52 : 0;
        const pw = stacked ? w : w * 0.48;
        const ph = stacked ? h * 0.48 : h;

        c.save();
        c.translate(ox, oy);
        c._cw = pw;
        c._ch = ph;
        const fB = frame(pw, ph, [22, 16, 34, 42], 150, 1200, 0, 1);
        yTicks(c, fB, [0, 0.25, 0.5, 0.75, 1], v => Math.round(v * 100) + '%');
        xTicks(c, fB, [200, 400, 600, 800, 1000, 1200], v => String(v));
        axesBox(c, fB, 'T (K)', 'Boltzmann p_i(T)');

        const cols = [C.gold, C.cyan, C.green, C.violet];
        for (let lv = 0; lv < 4; lv++) {
          const pts = [];
          for (let tK = 150; tK <= 1200; tK += 15) {
            const b = M.boltzmannVsBath(tK, dE, NB);
            pts.push([fB.X(tK), fB.Y(b.pBoltz[lv])]);
          }
          path(c, pts, cols[lv], lv <= 1 ? 2.2 : 1.5);
        }
        vline(c, fB.X(T), fB.T, fB.B, C.ink, [3, 3], 1.4);
        const lblItems = [0, 1, 2, 3].map(lv => ({
          lv,
          ty: fB.Y(res.pBoltz[lv])
        }));
        resolveVertical(lblItems, 14, fB.T + 8, fB.B - 8);
        for (const it of lblItems) {
          c.fillStyle = cols[it.lv];
          c.beginPath();
          c.arc(fB.X(T), fB.Y(res.pBoltz[it.lv]), 4, 0, Math.PI * 2);
          c.fill();
          const align = T > 950 ? 'right' : 'left';
          const dx = T > 950 ? -7 : 7;
          safeText(c, 'E' + it.lv, fB.X(T) + dx, it.ly, cols[it.lv], align, MONO, C.bg);
        }
        c.restore();
      }
    });

    function text() {
      const T = +sT.value, dE = +sDe.value, NB = +sNb.value;
      put('#ch2TOut', t('ch2.unit.k', { v: T }));
      put('#ch2DeOut', t('ch2.unit.kj', { v: dE }));
      put('#ch2NbOut', NB);

      const res = M.boltzmannVsBath(T, dE, NB);
      const rt = fmt(res.RT_kJ, 2);
      const p0 = fmt(res.pBoltz[0] * 100, 2);
      const p1 = fmt(res.pBoltz[1] * 100, 2);
      const pb1 = fmt(res.pBath[1] * 100, 2);

      put('#ch2Rt', t('ch2.unit.kj', { v: rt }));
      put('#ch2P0', p0 + '%');
      put('#ch2P1', p1 + '%');
      put('#ch2Qb', res.QB);

      const key = M.say.ch2(res);
      putHTML('#ch2Say', t(key, { T, rt, de: dE, nb: NB, p0, p1, pb1 }));
    }

    sim.text = text;
    window.__essayObserve(cv);
    [sT, sDe, sNb].forEach(el => el.addEventListener('input', () => { sim.dirty = true; text(); }));
    text();
  })();

  /* ══════════════════════════════════════════════════════════════════
     CH 3: Four-Quadrant ΔG = ΔH - TΔS Map
  ══════════════════════════════════════════════════════════════════ */
  (() => {
    const cv = $('#ch3Cv');
    const sel = $('#ch3Rxn'), sT = $('#ch3T');
    const SHORT = {
      nh4no3: 'NH₄NO₃(aq)', n2o4: 'N₂O₄ → 2NO₂', caco3: 'CaCO₃ → CaO',
      h2o2: '2H₂O₂ → O₂', nh3: 'N₂+3H₂ → 2NH₃', h2o: '2H₂+O₂ → 2H₂O', o3: '3O₂ → 2O₃'
    };

    const sim = reg(cv, {
      draw() {
        const { c, w, h } = fit(cv);
        const T = +sT.value, curId = sel.value;
        const f = frame(w, h, [26, 16, 38, 52], -250, 250, -560, 360);

        // Shade spontaneous half-plane (dH < (T/1000)*dS) vs non-spontaneous
        const slope = T / 1000;
        const yLeft = slope * f.x0, yRight = slope * f.x1;
        c.save();
        c.beginPath(); c.rect(f.L, f.T, f.R - f.L, f.B - f.T); c.clip();

        // Non-spontaneous upper polygon
        c.fillStyle = 'rgba(240,122,109,0.08)';
        c.beginPath();
        c.moveTo(f.L, f.T); c.lineTo(f.R, f.T);
        c.lineTo(f.R, f.Y(yRight)); c.lineTo(f.L, f.Y(yLeft));
        c.closePath(); c.fill();

        // Spontaneous lower polygon
        c.fillStyle = 'rgba(122,214,160,0.09)';
        c.beginPath();
        c.moveTo(f.L, f.Y(yLeft)); c.lineTo(f.R, f.Y(yRight));
        c.lineTo(f.R, f.B); c.lineTo(f.L, f.B);
        c.closePath(); c.fill();

        // Origin crosshairs
        vline(c, f.X(0), f.T, f.B, 'rgba(163,170,184,0.35)', [4, 4], 1);
        hline(c, f.Y(0), f.L, f.R, 'rgba(163,170,184,0.35)', [4, 4], 1);

        // Delta G = 0 line
        path(c, [[f.L, f.Y(yLeft)], [f.R, f.Y(yRight)]], C.gold, 2.2);
        c.restore();

        yTicks(c, f, [-500, -300, -100, 0, 100, 300], v => String(v));
        xTicks(c, f, [-200, -100, 0, 100, 200], v => String(v));
        axesBox(c, f, 'ΔS° (J/mol·K)', 'ΔH° (kJ/mol)');

        // Quadrant markers in corners (clear of points)
        safeText(c, 'Q2 (-ΔH,+ΔS)', f.R - 6, f.B - 12, C.green, 'right', MONO);
        safeText(c, 'Q4 (+ΔH,-ΔS)', f.L + 6, f.T + 12, C.red, 'left', MONO);

        // Plot reaction points with smart label nudging
        const pts = M.REACTIONS.map(r => {
          const ev = M.evalReaction(r.id, T);
          return {
            r, ev,
            px: f.X(r.dS),
            py: f.Y(r.dH),
            ty: f.Y(r.dH)
          };
        });
        // Split left (dS < 0) and right (dS >= 0) so labels de-overlap cleanly per side
        const leftPts = pts.filter(p => p.r.dS < 0);
        const rightPts = pts.filter(p => p.r.dS >= 0);
        resolveVertical(leftPts, 17, f.T + 24, f.B - 14);
        resolveVertical(rightPts, 17, f.T + 14, f.B - 24);

        for (const p of pts) {
          const isSel = p.r.id === curId;
          const col = p.ev.spontaneous ? C.green : C.red;
          if (Math.abs(p.ly - p.py) > 6) {
            path(c, [[p.px, p.py], [p.px + (p.r.dS < 0 ? 10 : -10), p.ly]], col, 1, [2, 2]);
          }
          c.fillStyle = col;
          c.beginPath();
          c.arc(p.px, p.py, isSel ? 7 : 5, 0, Math.PI * 2);
          c.fill();
          if (isSel) {
            c.strokeStyle = C.gold;
            c.lineWidth = 2.2;
            c.stroke();
          }
          const onRight = p.px < f.L + (f.R - f.L) * 0.62;
          const lx = onRight ? p.px + 10 : p.px - 10;
          const align = onRight ? 'left' : 'right';
          safeText(c, SHORT[p.r.id], lx, p.ly, isSel ? C.gold : C.ink, align, isSel ? FONTB : MONO, 'rgba(15,18,25,0.78)');
        }
      }
    });

    function text() {
      const T = +sT.value, id = sel.value;
      put('#ch3TOut', t('ch2.unit.k', { v: T }));
      const ev = M.evalReaction(id, T);
      const dgEl = $('#ch3Dg');
      if (dgEl) {
        dgEl.className = ev.spontaneous ? 'n' : 'r';
      }
      put('#ch3Dg', t('ch3.unit.kj', { v: (ev.dG > 0 ? '+' : '') + fmt(ev.dG, 2) }));
      put('#ch3Ds', t('ch3.unit.jk', { v: (ev.dS_tot > 0 ? '+' : '') + fmt(ev.dS_tot, 1) }));
      put('#ch3Tc', ev.Tcross ? t('ch2.unit.k', { v: Math.round(ev.Tcross) }) : t('ch3.unit.none'));
      const qStr = t('ch3.q.' + ev.q);
      put('#ch3Quad', qStr);

      const key = M.say.ch3(ev);
      const fullName = t('ch3.rxn.' + id);
      putHTML('#ch3Say', t(key, {
        name: fullName,
        dh: (ev.dH > 0 ? '+' : '') + fmt(ev.dH, 2),
        ds: (ev.dS > 0 ? '+' : '') + fmt(ev.dS, 1),
        dg: (ev.dG > 0 ? '+' : '') + fmt(ev.dG, 2),
        dstot: (ev.dS_tot > 0 ? '+' : '') + fmt(ev.dS_tot, 1),
        tc: ev.Tcross ? Math.round(ev.Tcross) : '—',
        quad: qStr,
        T
      }));
    }

    cv.addEventListener('click', e => {
      const rect = cv.getBoundingClientRect();
      const x = e.clientX - rect.left, y = e.clientY - rect.top;
      const f = frame(rect.width, rect.height, [26, 16, 38, 52], -250, 250, -560, 360);
      let best = null, bestD = 30;
      for (const r of M.REACTIONS) {
        const d = Math.hypot(f.X(r.dS) - x, f.Y(r.dH) - y);
        if (d < bestD) { bestD = d; best = r.id; }
      }
      if (best) {
        sel.value = best;
        sim.dirty = true;
        text();
      }
    });

    sim.text = text;
    window.__essayObserve(cv);
    sel.addEventListener('change', () => { sim.dirty = true; text(); });
    sT.addEventListener('input', () => { sim.dirty = true; text(); });
    text();
  })();

  /* ══════════════════════════════════════════════════════════════════
     CH 4: G(xi) Curve, Q vs K, and van 't Hoff Plot
  ══════════════════════════════════════════════════════════════════ */
  (() => {
    const cvA = $('#ch4aCv'), cvB = $('#ch4bCv');
    const sT = $('#ch4T'), sP = $('#ch4P'), sXi = $('#ch4Xi');

    function getT() {
      const v = +sT.value;
      return v === 298 ? 298.15 : v;
    }

    const simA = reg(cvA, {
      draw() {
        const { c, w, h } = fit(cvA);
        const sysId = radioVal('ch4sys') || 'n2o4';
        const T = getT(), P = +sP.value, xi = +sXi.value;
        const eq = M.eqExtent(sysId, T, P);
        const cur = M.gibbsExtent(sysId, T, P, xi);

        const pts = [];
        let gMin = 1e9, gMax = -1e9;
        for (let i = 1; i <= 99; i++) {
          const x = i / 100;
          const g = M.gibbsExtent(sysId, T, P, x).G;
          pts.push([x, g]);
          if (g < gMin) gMin = g;
          if (g > gMax) gMax = g;
        }
        const span = Math.max(4, gMax - gMin);
        const y0 = gMin - 0.14 * span, y1 = gMax + 0.14 * span;
        const f = frame(w, h, [24, 18, 38, 50], 0, 1, y0, y1);

        const yStep = span > 80 ? 40 : (span > 30 ? 15 : (span > 12 ? 5 : 2));
        const yvs = [];
        for (let y = Math.ceil(y0 / yStep) * yStep; y <= y1; y += yStep) yvs.push(Number(y.toFixed(1)));
        yTicks(c, f, yvs, v => String(v));
        xTicks(c, f, [0, 0.25, 0.5, 0.75, 1], v => fmt(v, 2));
        axesBox(c, f, 'ξ', 'G(ξ) − G(0) (kJ/mol)');

        // Equilibrium vertical line
        vline(c, f.X(eq.xi), f.T, f.B, C.cyan, [5, 4], 1.6);

        // Curve
        c.save();
        c.beginPath(); c.rect(f.L, f.T, f.R - f.L, f.B - f.T); c.clip();
        path(c, pts.map(p => [f.X(p[0]), f.Y(p[1])]), C.gold, 2.5);

        // Tangent line at current xi
        const slope = cur.dGdxi;
        const dxTan = 0.16;
        const xL = xi - dxTan, xR = xi + dxTan;
        const gL = cur.G - slope * dxTan, gR = cur.G + slope * dxTan;
        const tanCol = Math.abs(xi - eq.xi) < 0.025 ? C.green : (slope < 0 ? C.cyan : C.red);
        path(c, [[f.X(xL), f.Y(gL)], [f.X(xR), f.Y(gR)]], tanCol, 2.4);
        c.restore();

        // Eq dot & slider dot
        const gEq = M.gibbsExtent(sysId, T, P, clampXi(eq.xi)).G;
        c.fillStyle = C.cyan;
        c.beginPath(); c.arc(f.X(eq.xi), f.Y(gEq), 5, 0, Math.PI * 2); c.fill();

        c.fillStyle = C.ink;
        c.beginPath(); c.arc(f.X(xi), f.Y(cur.G), 6, 0, Math.PI * 2); c.fill();
        c.strokeStyle = tanCol; c.lineWidth = 2; c.stroke();

        // Non-overlapping callouts
        const eqLbl = `ξeq = ${fmt(eq.xi * 100, 1)}%`;
        const curLbl = `ξ = ${fmt(xi * 100, 0)}%`;
        const eqX = f.X(eq.xi);
        const curX = f.X(xi);
        if (Math.abs(eqX - curX) < 95) {
          safeText(c, eqLbl, eqX, f.T + 12, C.cyan, eq.xi > 0.7 ? 'right' : 'left', MONO, C.bg);
          safeText(c, curLbl, curX, Math.max(f.T + 28, f.Y(cur.G) - 16), C.ink, xi > 0.7 ? 'right' : 'left', FONTB, C.bg);
        } else {
          safeText(c, eqLbl, eqX, f.T + 12, C.cyan, 'center', MONO, C.bg);
          safeText(c, curLbl, curX, Math.max(f.T + 12, f.Y(cur.G) - 16), C.ink, 'center', FONTB, C.bg);
        }
      }
    });

    function clampXi(x) { return M.clamp(x, 0.005, 0.995); }

    const simB = reg(cvB, {
      draw() {
        const { c, w, h } = fit(cvB);
        const sysId = radioVal('ch4sys') || 'n2o4';
        const T = getT(), P = +sP.value;
        const stacked = w < 520;
        const eq = M.eqExtent(sysId, T, P);
        const compRes = M.gibbsExtent(sysId, T, P, clampXi(eq.xi));

        // Left / Top: van 't Hoff plot ln Kp vs 1000/T (1.1 .. 4.0)
        const pw = stacked ? w : w * 0.62;
        const ph = stacked ? h * 0.58 : h;
        const x1000 = [];
        let yMin = 1e9, yMax = -1e9;
        for (let inv = 1.15; inv <= 4.01; inv += 0.05) {
          const tk = 1000 / inv;
          const lnK = Math.log(M.eqThermo(sysId, tk).K);
          x1000.push([inv, lnK]);
          if (lnK < yMin) yMin = lnK;
          if (lnK > yMax) yMax = lnK;
        }
        const fL = frame(pw, ph, [22, 14, 34, 46], 1.15, 4.0, yMin - 1.5, yMax + 1.5);
        const ySpan = yMax - yMin;
        const ys = ySpan > 18 ? [-10, 0, 10, 20] : [-4, -2, 0, 2, 4, 6];
        yTicks(c, fL, ys, v => String(v));
        xTicks(c, fL, [1.5, 2.0, 2.5, 3.0, 3.5, 4.0], v => fmt(v, 1));
        axesBox(c, fL, '1000 / T (K⁻¹)', 'ln Kp');
        hline(c, fL.Y(0), fL.L, fL.R, C.dim, [3, 3], 1);
        c.save(); c.beginPath(); c.rect(fL.L, fL.T, fL.R - fL.L, fL.B - fL.T); c.clip();
        path(c, x1000.map(p => [fL.X(p[0]), fL.Y(p[1])]), C.gold, 2.3);
        c.restore();

        const curInv = 1000 / T;
        const curLnK = Math.log(M.eqThermo(sysId, T).K);
        c.fillStyle = C.cyan;
        c.beginPath(); c.arc(fL.X(curInv), fL.Y(curLnK), 5.5, 0, Math.PI * 2); c.fill();
        safeText(c, `T=${Math.round(T)}K, lnK=${fmt(curLnK, 2)}`, fL.X(curInv), M.clamp(fL.Y(curLnK) - 14, fL.T + 10, fL.B - 10), C.cyan, curInv > 2.8 ? 'right' : 'left', MONO, C.bg);

        // Right / Bottom: Equilibrium mole fraction bars
        const ox = stacked ? 0 : w * 0.65;
        const oy = stacked ? h * 0.62 : 0;
        const rw = stacked ? w : w * 0.35;
        const rh = stacked ? h * 0.38 : h;
        c.save();
        c.translate(ox, oy);
        c._cw = rw; c._ch = rh;
        const items = sysId === 'n2o4'
          ? [{ k: 'N₂O₄', v: compRes.comp[0], col: C.cyan }, { k: 'NO₂', v: compRes.comp[1], col: C.gold }]
          : [{ k: 'N₂', v: compRes.comp[0], col: C.cyan }, { k: 'H₂', v: compRes.comp[1], col: C.violet }, { k: 'NH₃', v: compRes.comp[2], col: C.gold }];
        const fR = frame(rw, rh, [22, 14, 14, 48], 0, 1, 0, items.length);
        safeText(c, t('ch4b.cv.eqmol', { p: P }), fR.L, 10, C.mute, 'left', MONO);
        items.forEach((it, i) => {
          const cy = fR.T + (i + 0.5) * ((fR.B - fR.T) / items.length);
          const bh = Math.min(18, (fR.B - fR.T) / items.length * 0.52);
          safeText(c, it.k, fR.L - 6, cy, C.ink, 'right', MONO);
          c.fillStyle = C.card2;
          c.fillRect(fR.L, cy - bh / 2, fR.R - fR.L, bh);
          c.fillStyle = it.col;
          c.fillRect(fR.L, cy - bh / 2, (fR.R - fR.L) * it.v, bh);
          const txtX = it.v > 0.65 ? fR.L + (fR.R - fR.L) * it.v - 5 : fR.L + (fR.R - fR.L) * it.v + 5;
          const al = it.v > 0.65 ? 'right' : 'left';
          safeText(c, fmt(it.v * 100, 1) + '%', txtX, cy, it.v > 0.65 ? C.bg : C.ink, al, MONO);
        });
        c.restore();
      }
    });

    function text() {
      const sysId = radioVal('ch4sys') || 'n2o4';
      const T = getT(), P = +sP.value, xi = +sXi.value;
      put('#ch4TOut', t('ch2.unit.k', { v: T === 298.15 ? '298.15' : T }));
      put('#ch4POut', t('ch4.unit.bar', { v: P }));
      put('#ch4XiOut', t('ch4.unit.pct', { v: Math.round(xi * 100) }));

      const eq = M.eqExtent(sysId, T, P);
      const cur = M.gibbsExtent(sysId, T, P, xi);
      const slopeEl = $('#ch4Slope');
      if (slopeEl) slopeEl.className = Math.abs(xi - eq.xi) < 0.025 ? 'n' : (cur.dGdxi < 0 ? 'c' : 'r');

      const slopeStr = (cur.dGdxi > 0 ? '+' : '') + fmt(cur.dGdxi, 2);
      put('#ch4Slope', t('ch3.unit.kj', { v: slopeStr }));
      put('#ch4Q', fmtSmart(cur.Q));
      put('#ch4K', fmtSmart(eq.K));
      put('#ch4Xeq', t('ch4.unit.pct', { v: fmt(eq.xi * 100, 1) }));

      const key = M.say.ch4a(xi, eq);
      putHTML('#ch4aSay', t(key, {
        xi: Math.round(xi * 100),
        xeq: fmt(eq.xi * 100, 1),
        q: fmtSmart(cur.Q),
        k: fmtSmart(eq.K),
        slope: fmt(Math.abs(cur.dGdxi), 2)
      }));
      putHTML('#ch4bSay', t(M.say.ch4b(sysId)));
    }

    simA.text = text;
    simB.text = () => {};
    window.__essayObserve(cvA);
    window.__essayObserve(cvB);

    $$('input[name="ch4sys"]').forEach(r => r.addEventListener('change', () => {
      simA.dirty = true; simB.dirty = true; text();
    }));
    [sT, sP, sXi].forEach(el => el.addEventListener('input', () => {
      simA.dirty = true; simB.dirty = true; text();
    }));
    text();
  })();

  /* ══════════════════════════════════════════════════════════════════
     CH 5: Activation Energy, Kinetics & Catalyst Invariance
  ══════════════════════════════════════════════════════════════════ */
  (() => {
    const cv = $('#ch5Cv');
    const sDg = $('#ch5Dg'), sCat = $('#ch5Cat'), sT = $('#ch5T');
    const bPlay = $('#ch5Play'), bReplay = $('#ch5Replay');

    let playing = !REDUCED;
    let simT = 0;

    function getWin(p) {
      return M.clamp(4.5 * p.tau, 0.06, 18);
    }

    const sim = reg(cv, {
      step(dt) {
        if (!playing || REDUCED) return false;
        const p = M.kineticsParams(+sT.value, +sDg.value, +sCat.value);
        const tMax = getWin(p);
        const speed = tMax / 4.0; // finish sweep in ~4s visual time
        if (simT < tMax) {
          simT = Math.min(tMax, simT + dt * speed);
          sim.dirty = true;
          return simT < tMax;
        }
        return false;
      },
      draw() {
        const { c, w, h } = fit(cv);
        const dG = +sDg.value, cat = +sCat.value, T = +sT.value;
        const p0 = M.kineticsParams(T, dG, 0);
        const p = M.kineticsParams(T, dG, cat);
        const stacked = w < 560;

        // Left / Top: Energy barrier diagram
        const fL = stacked
          ? frame(w, h * 0.46, [22, 16, 26, 44], 0, 1, -20, 72)
          : frame(w * 0.46, h, [26, 14, 34, 48], 0, 1, -20, 72);
        yTicks(c, fL, [-10, 0, 20, 40, 60], v => String(v));
        axesBox(c, fL, '', 'G (kJ/mol)');

        // Uncatalyzed barrier (dashed mute) & Catalyzed barrier (solid gold)
        function profilePts(tsPeak) {
          const pts = [];
          for (let i = 0; i <= 60; i++) {
            const x = i / 60;
            const base = dG * (3 * x * x - 2 * x * x * x);
            const bump = Math.sin(Math.PI * x);
            const peakOffset = (tsPeak - dG * 0.5) * Math.pow(bump, 1.8);
            pts.push([fL.X(x), fL.Y(base + peakOffset)]);
          }
          return pts;
        }
        c.save(); c.beginPath(); c.rect(fL.L, fL.T, fL.R - fL.L, fL.B - fL.T); c.clip();
        if (cat > 0.5) path(c, profilePts(p0.tsG), C.dim, 1.6, [4, 4]);
        path(c, profilePts(p.tsG), C.gold, 2.5);
        c.restore();

        safeText(c, 'A (0)', fL.X(0.06), fL.Y(0) - 10, C.cyan, 'left', MONO, C.bg);
        safeText(c, `B (${dG >= 0 ? '+' : ''}${dG})`, fL.X(0.94), fL.Y(dG) - 10, C.gold, 'right', MONO, C.bg);
        safeText(c, `Ea=${fmt(p.EaF, 0)}`, fL.X(0.5), M.clamp(fL.Y(p.tsG) - 11, fL.T + 9, fL.B - 10), C.ink, 'center', MONO, C.bg);

        // Right / Bottom: Concentration [A](t), [B](t)
        const ox = stacked ? 0 : w * 0.49;
        const oy = stacked ? h * 0.50 : 0;
        const pw = stacked ? w : w * 0.51;
        const ph = stacked ? h * 0.50 : h;
        const tMax = getWin(p);
        const curT = REDUCED ? tMax : Math.min(simT, tMax);

        c.save();
        c.translate(ox, oy);
        c._cw = pw; c._ch = ph;
        const fR = frame(pw, ph, [24, 16, 36, 44], 0, tMax, 0, 1);
        yTicks(c, fR, [0, 0.25, 0.5, 0.75, 1], v => Math.round(v * 100) + '%');
        xTicks(c, fR, [0, tMax * 0.25, tMax * 0.5, tMax * 0.75, tMax], v => tMax < 1 ? v.toFixed(2) : v.toFixed(1));
        axesBox(c, fR, 't (s)', t('ch5.cv.frac'));

        hline(c, fR.Y(p.Beq), fR.L, fR.R, C.green, [4, 4], 1.5);
        const ptsA = [], ptsB = [];
        for (let i = 0; i <= 80; i++) {
          const tt = (i / 80) * curT;
          const st = M.kineticsAt(p, tt);
          ptsA.push([fR.X(tt), fR.Y(st.A)]);
          ptsB.push([fR.X(tt), fR.Y(st.B)]);
        }
        path(c, ptsA, C.cyan, 2.3);
        path(c, ptsB, C.gold, 2.5);
        const endSt = M.kineticsAt(p, curT);
        c.fillStyle = C.cyan; c.beginPath(); c.arc(fR.X(curT), fR.Y(endSt.A), 4.5, 0, Math.PI * 2); c.fill();
        c.fillStyle = C.gold; c.beginPath(); c.arc(fR.X(curT), fR.Y(endSt.B), 4.5, 0, Math.PI * 2); c.fill();
        safeText(c, `Beq=${fmt(p.Beq * 100, 1)}%`, fR.R - 4, M.clamp(fR.Y(p.Beq) - 11, fR.T + 10, fR.B - 10), C.green, 'right', MONO, C.bg);
        c.restore();
      }
    });

    function text() {
      const dG = +sDg.value, cat = +sCat.value, T = +sT.value;
      put('#ch5DgOut', t('ch3.unit.kj', { v: (dG > 0 ? '+' : '') + dG }));
      put('#ch5CatOut', t('ch3.unit.kj', { v: cat }));
      put('#ch5TOut', t('ch2.unit.k', { v: T }));
      put('#ch5Play', t(playing ? 'common.pause' : 'common.resume'));

      const p0 = M.kineticsParams(T, dG, 0);
      const p = M.kineticsParams(T, dG, cat);
      const speed = p0.tHalf / p.tHalf;
      const beqStr = fmt(p.Beq * 100, 1);
      const kStr = fmtSmart(p.K);
      const thStr = p.tHalf >= 1 ? fmt(p.tHalf, 2) : fmt(p.tHalf, 4);
      const spStr = speed >= 10 ? fmt(speed, 0) : fmt(speed, 1);

      put('#ch5K', kStr);
      put('#ch5Beq', beqStr + '%');
      put('#ch5Thalf', t('ch5.unit.s', { v: thStr }));
      put('#ch5Speed', t('ch5.unit.x', { v: spStr }));

      putHTML('#ch5Say', t(M.say.ch5(cat), {
        dg: (dG > 0 ? '+' : '') + dG,
        T,
        cat,
        thalf: thStr,
        beq: beqStr,
        k: kStr,
        speed: spStr
      }));
    }

    sim.text = text;
    window.__essayObserve(cv);
    [sDg, sCat, sT].forEach(el => el.addEventListener('input', () => {
      simT = REDUCED ? 999 : 0;
      sim.dirty = true;
      text();
      if (playing) scheduleTick();
    }));
    bPlay.addEventListener('click', () => {
      playing = !playing;
      text();
      if (playing) scheduleTick();
    });
    bReplay.addEventListener('click', () => {
      simT = 0;
      playing = !REDUCED;
      sim.dirty = true;
      text();
      if (playing) scheduleTick();
    });
    text();
  })();

  /* ══════════════════════════════════════════════════════════════════
     CH 6: ATP Coupling & Ellingham Diagram
  ══════════════════════════════════════════════════════════════════ */
  (() => {
    const cvA = $('#ch6aCv'), sRatio = $('#ch6Ratio'), sPi = $('#ch6Pi');
    const simA = reg(cvA, {
      draw() {
        const { c, w, h } = fit(cvA);
        const ratio = Math.pow(10, +sRatio.value);
        const res = M.atpCoupling(ratio, +sPi.value);
        const f = frame(w, h, [20, 18, 28, 96], -75, 25, 0, 3);
        xTicks(c, f, [-60, -40, -20, 0, 20], v => String(v));
        vline(c, f.X(0), f.T, f.B, C.ink, null, 1.5);
        safeText(c, 'ΔG (kJ/mol)', f.R, f.B + 18, C.mute, 'right', MONO);

        const bars = [
          { lbl: t('ch6.cv.glc'), val: res.dG_g6p, col: C.red },
          { lbl: t('ch6.cv.atp'), val: res.dG_atp, col: C.cyan },
          { lbl: t('ch6.cv.net'), val: res.dG_net, col: res.spontaneous ? C.green : C.red }
        ];
        const rowH = (f.B - f.T) / 3;
        bars.forEach((b, i) => {
          const cy = f.T + (i + 0.5) * rowH;
          const bh = Math.min(22, rowH * 0.56);
          safeText(c, b.lbl, f.L - 8, cy, C.ink, 'right', MONO);
          const x0 = f.X(0), x1 = f.X(M.clamp(b.val, -75, 25));
          c.fillStyle = b.col;
          c.fillRect(Math.min(x0, x1), cy - bh / 2, Math.abs(x1 - x0), bh);
          const txt = (b.val > 0 ? '+' : '') + fmt(b.val, 1);
          const rightSide = b.val >= 0;
          safeText(c, txt, rightSide ? x1 + 6 : x1 - 6, cy, b.col, rightSide ? 'left' : 'right', MONO, C.bg);
        });
      }
    });

    function textA() {
      const ratio = Math.pow(10, +sRatio.value), pi = +sPi.value;
      const ratioStr = ratio >= 1 ? fmt(ratio, 1) : (ratio >= 0.01 ? fmt(ratio, 2) : ratio.toExponential(1));
      put('#ch6RatioOut', ratioStr);
      put('#ch6PiOut', t('ch6.unit.mm', { v: fmt(pi, 1) }));
      const res = M.atpCoupling(ratio, pi);
      const netEl = $('#ch6Dgnet');
      if (netEl) netEl.className = res.spontaneous ? 'n' : 'r';
      put('#ch6Dgatp', t('ch3.unit.kj', { v: fmt(res.dG_atp, 2) }));
      put('#ch6Dgnet', t('ch3.unit.kj', { v: (res.dG_net > 0 ? '+' : '') + fmt(res.dG_net, 2) }));
      put('#ch6E', t('ch6.unit.v', { v: fmt(res.E_equiv, 3) }));
      putHTML('#ch6aSay', t(M.say.ch6a(res), {
        ratio: ratioStr,
        pi: fmt(pi, 1),
        atp: fmt(res.dG_atp, 2),
        net: (res.dG_net > 0 ? '+' : '') + fmt(res.dG_net, 2)
      }));
    }
    simA.text = textA;
    window.__essayObserve(cvA);
    [sRatio, sPi].forEach(el => el.addEventListener('input', () => { simA.dirty = true; textA(); }));
    textA();

    // 6B Ellingham Diagram
    const cvB = $('#ch6bCv'), selOx = $('#ch6Ox'), sT = $('#ch6T');
    const OX_SHORT = { feo: 'FeO', zno: 'ZnO', tio2: 'TiO₂', al2o3: 'Al₂O₃', mgo: 'MgO', co: '2C→2CO', co2: 'C→CO₂' };

    const simB = reg(cvB, {
      draw() {
        const { c, w, h } = fit(cvB);
        const oxId = selOx.value, T = +sT.value;
        const f = frame(w, h, [24, 62, 38, 54], 300, 2500, -1250, -100);
        yTicks(c, f, [-1200, -1000, -800, -600, -400, -200], v => String(v));
        xTicks(c, f, [400, 800, 1200, 1600, 2000, 2400], v => String(v));
        axesBox(c, f, 'T (K)', 'ΔG° (kJ/mol O₂)');

        const endLabels = [];
        for (const l of M.ELLINGHAM_LINES) {
          const isSel = l.id === oxId;
          const isC = !!l.isCarbon;
          const col = l.id === 'co' ? C.cyan : (l.id === 'co2' ? C.green : (isSel ? C.gold : C.dim));
          const lw = (isSel || isC) ? 2.4 : 1.3;
          const dash = isC ? [6, 4] : null;
          const y1 = M.ellinghamDG(l.id, 300), y2 = M.ellinghamDG(l.id, 2500);
          c.save(); c.beginPath(); c.rect(f.L, f.T, f.R - f.L, f.B - f.T); c.clip();
          path(c, [[f.X(300), f.Y(y1)], [f.X(2500), f.Y(y2)]], col, lw, dash);
          c.restore();
          endLabels.push({ id: l.id, col: isSel ? C.gold : col, ty: f.Y(y2), bold: isSel || isC });
        }

        resolveVertical(endLabels, 15, f.T + 10, f.B - 10);
        for (const it of endLabels) {
          safeText(c, OX_SHORT[it.id], f.R + 6, it.ly, it.col, 'left', it.bold ? FONTB : MONO);
        }

        // Cursor at T and crossover dot
        const an = M.ellinghamAnalysis(oxId, T);
        vline(c, f.X(T), f.T, f.B, C.ink, [3, 3], 1.4);
        c.fillStyle = C.gold; c.beginPath(); c.arc(f.X(T), f.Y(an.dG_ox), 5, 0, Math.PI * 2); c.fill();
        c.fillStyle = C.cyan; c.beginPath(); c.arc(f.X(T), f.Y(an.dG_co), 4.5, 0, Math.PI * 2); c.fill();

        if (an.Tcross >= 300 && an.Tcross <= 2500) {
          const yCross = M.ellinghamDG(oxId, an.Tcross);
          c.fillStyle = C.green; c.beginPath(); c.arc(f.X(an.Tcross), f.Y(yCross), 6, 0, Math.PI * 2); c.fill();
          c.strokeStyle = C.bg; c.lineWidth = 1.5; c.stroke();
          safeText(c, `T*=${Math.round(an.Tcross)}K`, f.X(an.Tcross), M.clamp(f.Y(yCross) - 14, f.T + 12, f.B - 12), C.green, an.Tcross > 2100 ? 'right' : 'center', MONO, C.bg);
        }
      }
    });

    function textB() {
      const oxId = selOx.value, T = +sT.value;
      put('#ch6TOut', t('ch2.unit.k', { v: T }));
      const an = M.ellinghamAnalysis(oxId, T);
      const redEl = $('#ch6Dgred');
      if (redEl) redEl.className = an.canSmeltWithCO ? 'n' : 'r';

      put('#ch6Dgox', fmt(an.dG_ox, 0) + ' kJ/mol');
      put('#ch6Dgred', (an.dG_red_CO > 0 ? '+' : '') + fmt(an.dG_red_CO, 0) + ' kJ/mol');
      put('#ch6Tcross', t('ch2.unit.k', { v: Math.round(an.Tcross) }));
      put('#ch6Emin', t('ch6.unit.v', { v: fmt(an.E_min_pure, 2) }));

      putHTML('#ch6bSay', t(M.say.ch6b(an), {
        T,
        ox: t('ch6.ox.' + oxId),
        red: fmt(Math.abs(an.dG_red_CO), 0),
        tc: Math.round(an.Tcross),
        emin: fmt(an.E_min_pure, 2)
      }));
    }

    simB.text = textB;
    window.__essayObserve(cvB);
    selOx.addEventListener('change', () => { simB.dirty = true; textB(); });
    sT.addEventListener('input', () => { simB.dirty = true; textB(); });
    textB();
  })();

  /* ══════════════════════════════════════════════════════════════════
     CH 7: Haber-Bosch Reactor Simulator
  ══════════════════════════════════════════════════════════════════ */
  (() => {
    const cv = $('#ch7Cv');
    const sT = $('#ch7T'), sP = $('#ch7P'), sTau = $('#ch7Tau');

    const sim = reg(cv, {
      draw() {
        const { c, w, h } = fit(cv);
        const T_C = +sT.value, P = +sP.value, tau = +sTau.value;
        const f = frame(w, h, [24, 18, 38, 46], 250, 650, 0, 100);

        // Typical industrial window band 400..500 C
        c.fillStyle = 'rgba(122,214,160,0.08)';
        c.fillRect(f.X(400), f.T, f.X(500) - f.X(400), f.B - f.T);

        yTicks(c, f, [0, 20, 40, 60, 80, 100], v => v + '%');
        xTicks(c, f, [250, 350, 450, 550, 650], v => v + '°C');
        axesBox(c, f, 'T (°C)', t('ch7.cv.conv'));

        const ptsEq = [], ptsSingle = [];
        for (let tc = 250; tc <= 650; tc += 5) {
          const r = M.haberReactor(tc, P, tau);
          ptsEq.push([f.X(tc), f.Y(r.eqConv * 100)]);
          ptsSingle.push([f.X(tc), f.Y(r.singleConv * 100)]);
        }
        path(c, ptsEq, C.cyan, 2.1, [6, 4]);
        path(c, ptsSingle, C.gold, 2.7);

        const cur = M.haberReactor(T_C, P, tau);
        vline(c, f.X(T_C), f.T, f.B, C.dim, [3, 3], 1.2);
        c.fillStyle = C.cyan; c.beginPath(); c.arc(f.X(T_C), f.Y(cur.eqConv * 100), 4.5, 0, Math.PI * 2); c.fill();
        c.fillStyle = C.ink; c.beginPath(); c.arc(f.X(T_C), f.Y(cur.singleConv * 100), 6, 0, Math.PI * 2); c.fill();
        c.strokeStyle = C.gold; c.lineWidth = 2; c.stroke();

        safeText(c, '400–500°C', f.X(450), f.T + 11, C.green, 'center', MONO, C.bg);
        const align = T_C > 540 ? 'right' : 'left';
        const dx = T_C > 540 ? -8 : 8;
        safeText(c, `${fmt(cur.singleConv * 100, 1)}%`, f.X(T_C) + dx, M.clamp(f.Y(cur.singleConv * 100) - 12, f.T + 22, f.B - 12), C.gold, align, FONTB, C.bg);
      }
    });

    function text() {
      const T_C = +sT.value, P = +sP.value, tau = +sTau.value;
      put('#ch7TOut', t('ch7.unit.c', { v: T_C }));
      put('#ch7POut', t('ch7.unit.bar', { v: P }));
      put('#ch7TauOut', t('ch7.unit.x', { v: fmt(tau, 1) }));

      const r = M.haberReactor(T_C, P, tau);
      const eq = fmt(r.eqConv * 100, 1);
      const single = fmt(r.singleConv * 100, 1);
      const ynh3 = fmt(r.singleYNH3 * 100, 1);
      const loop = fmt(r.loopYield * 100, 1);
      const comp = fmt(r.compFresh_kJ, 1);

      put('#ch7Eq', t('ch7.unit.pct', { v: eq }));
      put('#ch7Single', t('ch7.unit.pct', { v: single }));
      put('#ch7Ynh3', t('ch7.unit.pct', { v: ynh3 }));
      put('#ch7Loop', t('ch7.unit.pct', { v: loop }));
      put('#ch7Comp', t('ch7.unit.kjmol', { v: comp }));

      putHTML('#ch7Say', t(M.say.ch7(r), {
        T: T_C, p: P, eq, single, ynh3, loop, comp
      }));
    }

    sim.text = text;
    window.__essayObserve(cv);
    [sT, sP, sTau].forEach(el => el.addEventListener('input', () => { sim.dirty = true; text(); }));
    text();
  })();

  /* ══════════════════════════════════════════════════════════════════
     CH 8: Regular Solution, Common Tangent & Phase Diagram
  ══════════════════════════════════════════════════════════════════ */
  (() => {
    const cv = $('#ch8Cv');
    const sTtc = $('#ch8Ttc'), sX0 = $('#ch8X0');

    const sim = reg(cv, {
      draw() {
        const { c, w, h } = fit(cv);
        const ttc = +sTtc.value, x0 = +sX0.value;
        const res = M.regularSolution(ttc, x0);

        // Top panel: g_mix / RT vs x (0..1)
        const fT = frame(w, h * 0.48, [18, 18, 22, 48], 0, 1, -0.75, 0.25);
        yTicks(c, fT, [-0.6, -0.3, 0], v => fmt(v, 1));
        axesBox(c, fT, '', 'g_mix / RT');
        hline(c, fT.Y(0), fT.L, fT.R, C.dim, [3, 3], 1);

        const ptsG = [];
        for (let i = 1; i <= 99; i++) {
          const x = i / 100;
          ptsG.push([fT.X(x), fT.Y(M.regG(x, res.w))]);
        }
        c.save(); c.beginPath(); c.rect(fT.L, fT.T, fT.R - fT.L, fT.B - fT.T); c.clip();
        path(c, ptsG, C.cyan, 2.3);
        c.restore();

        if (res.binodal) {
          const [xa, xb] = res.binodal;
          const gBin = M.regG(xa, res.w);
          path(c, [[fT.X(xa), fT.Y(gBin)], [fT.X(xb), fT.Y(gBin)]], C.gold, 2.4);
          [xa, xb].forEach(bx => {
            c.fillStyle = C.green; c.beginPath(); c.arc(fT.X(bx), fT.Y(gBin), 4.5, 0, Math.PI * 2); c.fill();
          });
        }
        // Current x0 on top curve and equilibrium tie-line
        c.fillStyle = C.ink; c.beginPath(); c.arc(fT.X(x0), fT.Y(M.clamp(res.gHom, -0.75, 0.25)), 4.5, 0, Math.PI * 2); c.fill();
        if (res.twoPhase) {
          vline(c, fT.X(x0), fT.Y(res.gHom), fT.Y(res.gEq), C.gold, [3, 2], 1.6);
          c.fillStyle = C.gold; c.beginPath(); c.arc(fT.X(x0), fT.Y(res.gEq), 5, 0, Math.PI * 2); c.fill();
        }

        // Bottom panel: T/Tc (0.40 .. 1.25) vs x (0..1)
        const fB = frame(w, h, [h * 0.54, 18, 36, 48], 0, 1, 0.40, 1.25);
        yTicks(c, fB, [0.5, 0.75, 1.0, 1.25], v => fmt(v, 2));
        xTicks(c, fB, [0, 0.25, 0.5, 0.75, 1], v => fmt(v, 2));
        axesBox(c, fB, 'x', 'T / Tc');

        const binL = [], binR = [], spinL = [], spinR = [];
        for (let tR = 0.40; tR <= 0.999; tR += 0.01) {
          const ww = 2 / tR;
          const b = M.regBinodal(ww), sp = M.regSpinodal(ww);
          if (b) { binL.push([fB.X(b[0]), fB.Y(tR)]); binR.unshift([fB.X(b[1]), fB.Y(tR)]); }
          if (sp) { spinL.push([fB.X(sp[0]), fB.Y(tR)]); spinR.unshift([fB.X(sp[1]), fB.Y(tR)]); }
        }
        binL.push([fB.X(0.5), fB.Y(1.0)]);
        spinL.push([fB.X(0.5), fB.Y(1.0)]);
        path(c, binL.concat(binR), C.green, 2.3);
        path(c, spinL.concat(spinR), C.red, 1.8, [5, 4]);

        if (res.twoPhase && res.binodal) {
          path(c, [[fB.X(res.binodal[0]), fB.Y(ttc)], [fB.X(res.binodal[1]), fB.Y(ttc)]], C.gold, 1.8, [3, 3]);
        }
        c.fillStyle = C.ink; c.beginPath(); c.arc(fB.X(x0), fB.Y(ttc), 5.5, 0, Math.PI * 2); c.fill();
        c.strokeStyle = res.twoPhase ? C.gold : C.cyan; c.lineWidth = 2; c.stroke();
        safeText(c, `(${fmt(x0, 2)}, ${fmt(ttc, 2)})`, fB.X(x0), M.clamp(fB.Y(ttc) - 13, fB.T + 10, fB.B - 10), C.ink, x0 > 0.7 ? 'right' : 'left', MONO, C.bg);
      }
    });

    function text() {
      const ttc = +sTtc.value, x0 = +sX0.value;
      put('#ch8TtcOut', fmt(ttc, 2));
      put('#ch8X0Out', fmt(x0, 2));

      const res = M.regularSolution(ttc, x0);
      put('#ch8W', fmt(res.w, 2));
      if (res.binodal) {
        put('#ch8Bin', fmt(res.binodal[0], 3) + ' / ' + fmt(res.binodal[1], 3));
      } else {
        put('#ch8Bin', t('ch8.unit.single'));
      }
      put('#ch8Frac', res.twoPhase ? t('ch8.unit.pct', { v: fmt(res.fracBeta * 100, 1) }) : '—');
      put('#ch8Save', t('ch8.unit.rt', { v: fmt(res.dGsaved, 4) }));

      putHTML('#ch8Say', t(M.say.ch8(res), {
        ttc: fmt(ttc, 2),
        w: fmt(res.w, 2),
        x0: fmt(x0, 2),
        xa: res.binodal ? fmt(res.binodal[0], 3) : '—',
        xb: res.binodal ? fmt(res.binodal[1], 3) : '—',
        fb: fmt(res.fracBeta * 100, 1),
        save: fmt(res.dGsaved, 4)
      }));
    }

    sim.text = text;
    window.__essayObserve(cv);
    [sTtc, sX0].forEach(el => el.addEventListener('input', () => { sim.dirty = true; text(); }));
    text();
  })();

  /* ══════════════════════════════════════════════════════════════════
     CH 9: Frontier Thermodynamic Floor vs Real Engineering
  ══════════════════════════════════════════════════════════════════ */
  (() => {
    const cv = $('#ch9Cv');
    const wPpm = $('#ch9PpmWrap'), wVc = $('#ch9VcellWrap'), wFe = $('#ch9FeWrap');
    const sPpm = $('#ch9Ppm'), sVc = $('#ch9Vcell'), sFe = $('#ch9Fe');

    const sim = reg(cv, {
      draw() {
        const { c, w, h } = fit(cv);
        const mode = radioVal('ch9mode') || 'elec';
        const narrow = w < 420;
        const leftPad = narrow ? 118 : 156;
        let maxX = 75, bars = [], floorVal = 0, xTitle = '';

        if (mode === 'elec') {
          const el = M.electrolyserMetrics();
          floorVal = el.kwh_dG;
          maxX = 75;
          xTitle = 'kWh / kg H₂';
          bars = [
            { lbl: t('ch9.cv.elecDg'), lo: 0, hi: el.kwh_dG, col: C.gold, txt: fmt(el.kwh_dG, 1) },
            { lbl: t('ch9.cv.elecHhv'), lo: 0, hi: el.kwh_HHV, col: C.mute, txt: fmt(el.kwh_HHV, 1) },
            { lbl: t('ch9.cv.soec'), lo: 35, hi: 45, col: C.green, txt: '35–45' },
            { lbl: t('ch9.cv.pem'), lo: 48, hi: 55, col: C.cyan, txt: '48–55' },
            { lbl: t('ch9.cv.awe'), lo: 50, hi: 65, col: C.violet, txt: '50–65' }
          ];
        } else if (mode === 'dac') {
          const ppm = +sPpm.value;
          const dac = M.dacMinWork(ppm, false);
          const concShort = ppm >= 10000 ? fmt(ppm / 1e4, 1) + '%' : ppm + 'ppm';
          floorVal = dac.w_GJ_t;
          maxX = 12;
          xTitle = 'GJ / t CO₂';
          bars = [
            { lbl: t('ch9.cv.wminFlue'), lo: 0, hi: M.dacMinWork(0.12, true).w_GJ_t, col: C.dim, txt: '0.17' },
            { lbl: t('ch9.cv.wminCur', { conc: concShort }), lo: 0, hi: dac.w_GJ_t, col: C.gold, txt: fmt(dac.w_GJ_t, 2) },
            { lbl: t('ch9.cv.dacTarget'), lo: 2.5, hi: 4.5, col: C.red, txt: '2.5–4.5?' },
            { lbl: t('ch9.cv.dacRange'), lo: 5.4, hi: 10.8, col: C.cyan, txt: '5.4–10.8' }
          ];
        } else {
          const vc = +sVc.value, fe = +sFe.value;
          const ee = M.co2rrEnergyEfficiency(1.15, vc, fe);
          floorVal = 100;
          maxX = 100;
          xTitle = t('ch9.cv.ee');
          bars = [
            { lbl: t('ch9.cv.thermoCo2'), lo: 0, hi: 100, col: C.gold, txt: '100%' },
            { lbl: t('ch9.cv.targetCo2'), lo: 42, hi: 60, col: C.red, txt: '>42–60%' },
            { lbl: t('ch9.cv.meaCo2'), lo: 20, hi: 35, col: C.green, txt: '20–35%' },
            { lbl: t('ch9.cv.yourCo2'), lo: 0, hi: ee.ee * 100, col: C.cyan, txt: fmt(ee.ee * 100, 1) + '%' }
          ];
        }

        const f = frame(w, h, [18, 22, 34, leftPad], 0, maxX, 0, bars.length);
        const step = mode === 'elec' ? 15 : (mode === 'dac' ? 2 : 20);
        const xvs = [];
        for (let v = 0; v <= maxX; v += step) xvs.push(v);
        xTicks(c, f, xvs, v => String(v));
        axesBox(c, f, xTitle, '');
        vline(c, f.X(floorVal), f.T, f.B, C.gold, [4, 4], 1.5);

        const rowH = (f.B - f.T) / bars.length;
        bars.forEach((b, i) => {
          const cy = f.T + (i + 0.5) * rowH;
          const bh = Math.min(20, rowH * 0.56);
          safeText(c, b.lbl, f.L - 8, cy, C.ink, 'right', MONO);
          const xL = f.X(b.lo), xR = f.X(b.hi);
          if (b.lo > 0) {
            c.fillStyle = 'rgba(105,114,132,0.22)';
            c.fillRect(f.L, cy - 3, xL - f.L, 6);
          }
          c.fillStyle = b.col;
          c.fillRect(xL, cy - bh / 2, Math.max(4, xR - xL), bh);
          const rightSpace = f.R - xR;
          if (rightSpace > 46) {
            safeText(c, b.txt, xR + 6, cy, b.col, 'left', MONO, C.bg);
          } else {
            safeText(c, b.txt, xR - 5, cy, C.bg, 'right', MONO);
          }
        });
      }
    });

    function text() {
      const mode = radioVal('ch9mode') || 'elec';
      wPpm.hidden = (mode !== 'dac');
      wVc.hidden = (mode !== 'co2rr');
      wFe.hidden = (mode !== 'co2rr');

      if (mode === 'elec') {
        const el = M.electrolyserMetrics();
        put('#ch9Floor', t('ch9.unit.kwhkg', { v: fmt(el.kwh_dG, 1) }));
        put('#ch9Real', t('ch9.read.realElec'));
        put('#ch9Mult', t('ch9.read.multElec'));
        put('#ch9Eff', t('ch9.read.effElec'));
        putHTML('#ch9Say', t(M.say.ch9('elec')));
      } else if (mode === 'dac') {
        const ppm = +sPpm.value;
        const conc = ppm >= 10000 ? fmt(ppm / 1e4, 1) + '%' : t('ch9.unit.ppm', { v: ppm });
        put('#ch9PpmOut', conc);
        const dac = M.dacMinWork(ppm, false);
        const mLo = 5.4 / dac.w_GJ_t, mHi = 10.8 / dac.w_GJ_t;
        const multStr = fmt(mLo, 0) + '–' + fmt(mHi, 0);
        put('#ch9Floor', t('ch9.unit.gjt', { v: fmt(dac.w_GJ_t, 2) }));
        put('#ch9Real', t('ch9.read.realDac'));
        put('#ch9Mult', multStr + '×');
        put('#ch9Eff', fmt((dac.w_GJ_t / 7.2) * 100, 1) + '%');
        putHTML('#ch9Say', t(ppm > 2000 ? 'ch9.say.dacHigh' : M.say.ch9('dac'), {
          conc,
          floor: fmt(dac.w_GJ_t, 2),
          kj: fmt(dac.w_kJ_mol, 1),
          mult: multStr
        }));
      } else {
        const vc = +sVc.value, fe = +sFe.value;
        put('#ch9VcellOut', t('ch9.unit.v', { v: fmt(vc, 2) }));
        put('#ch9FeOut', t('ch9.unit.pct', { v: fe }));
        const ee = M.co2rrEnergyEfficiency(1.15, vc, fe);
        put('#ch9Floor', t('ch9.read.floorCo2'));
        put('#ch9Real', t('ch9.read.realCo2'));
        put('#ch9Mult', fmt(1 / Math.max(0.05, ee.ee), 1) + '×');
        put('#ch9Eff', fmt(ee.ee * 100, 1) + '%');
        putHTML('#ch9Say', t(M.say.ch9('co2rr'), {
          v: fmt(vc, 2),
          fe,
          eff: fmt(ee.ee * 100, 1)
        }));
      }
    }

    sim.text = text;
    window.__essayObserve(cv);
    $$('input[name="ch9mode"]').forEach(r => r.addEventListener('change', () => { sim.dirty = true; text(); }));
    [sPpm, sVc, sFe].forEach(el => el.addEventListener('input', () => { sim.dirty = true; text(); }));
    text();
  })();

  /* ══════════════════════════════════════════════════════════════════
     i18n Application & Language Toggle
  ══════════════════════════════════════════════════════════════════ */
  function applyLang() {
    const effLang = (LANG === 'en' && COPY.en) ? 'en' : 'zh';
    document.documentElement.lang = effLang === 'en' ? 'en' : 'zh-CN';
    document.title = t('doc.title');
    const metaDesc = $('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', t('doc.desc'));

    $$('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    $$('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
    $$('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });

    $$('#langToggle button').forEach(btn => {
      btn.setAttribute('aria-pressed', btn.dataset.lang === effLang ? 'true' : 'false');
    });

    for (const s of sims) {
      s.dirty = true;
      if (s.text) s.text();
    }
    scheduleTick();
  }

  $$('#langToggle button').forEach(btn => {
    btn.addEventListener('click', () => {
      const want = btn.dataset.lang === 'en' ? 'en' : 'zh';
      if (want === 'en' && !COPY.en) return;
      LANG = want;
      try { localStorage.setItem('knowledge-lang', LANG); } catch (_) {}
      applyLang();
    });
  });

  applyLang();
  window.__essayReady = true;
})();
