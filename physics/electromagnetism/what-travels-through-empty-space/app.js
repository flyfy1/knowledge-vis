/* What Travels Through Empty Space: wiring, drawing, i18n and on-screen gating.
 * All visible text lives in copy.zh.js (and optional copy.en.js). */
(() => {
'use strict';
const M = window.EmptySpaceModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const C = {
  bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8',
  gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb'
};
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = M.clamp;
const PI = Math.PI;

/* ───────── language ───────── */
const LS = 'knowledge-lang';
let memLang = null;
function readLang() { try { return localStorage.getItem(LS); } catch (e) { return memLang; } }
function writeLang(v) { memLang = v; try { localStorage.setItem(LS, v); } catch (e) { /* in-memory fallback */ } }
let lang = readLang();
if (lang !== 'zh' && lang !== 'en') lang = /^zh/i.test(navigator.language || '') ? 'zh' : 'en';
const effLang = () => (COPY[lang] ? lang : 'zh');
function t(key, vars) {
  let s = (COPY[lang] && COPY[lang][key] != null) ? COPY[lang][key] : (COPY.zh && COPY.zh[key] != null ? COPY.zh[key] : key);
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => vars[k] != null ? vars[k] : m);
  return s;
}
function fmt(x, d = 0) {
  if (!isFinite(x)) return '—';
  const v = Math.abs(x) < 0.5 * Math.pow(10, -d) ? 0 : x;
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}
function fmtSci(x) {
  if (!isFinite(x) || x === 0) return '0';
  const exp = Math.floor(Math.log10(Math.abs(x)));
  const mant = x / Math.pow(10, exp);
  return `${mant.toFixed(1)}e${exp}`;
}
function fmtFreq(f) {
  if (f >= 1e18) return fmt(f / 1e18, 2) + ' EHz';
  if (f >= 1e15) return fmt(f / 1e15, 2) + ' PHz';
  if (f >= 1e12) return fmt(f / 1e12, 2) + ' THz';
  if (f >= 1e9) return fmt(f / 1e9, 2) + ' GHz';
  if (f >= 1e6) return fmt(f / 1e6, 2) + ' MHz';
  if (f >= 1e3) return fmt(f / 1e3, 1) + ' kHz';
  return fmt(f, 0) + ' Hz';
}
function fmtLam(lam) {
  if (lam >= 1e3) return fmt(lam / 1e3, 2) + ' km';
  if (lam >= 1) return fmt(lam, 2) + ' m';
  if (lam >= 1e-2) return fmt(lam * 100, 1) + ' cm';
  if (lam >= 1e-3) return fmt(lam * 1e3, 2) + ' mm';
  if (lam >= 1e-6) return fmt(lam * 1e6, 2) + ' μm';
  if (lam >= 1e-9) return fmt(lam * 1e9, 1) + ' nm';
  return fmt(lam * 1e12, 2) + ' pm';
}
function fmtEnergyEV(eV) {
  if (eV >= 1e6) return fmt(eV / 1e6, 2) + ' MeV';
  if (eV >= 1e3) return fmt(eV / 1e3, 2) + ' keV';
  if (eV >= 0.1) return fmt(eV, 2) + ' eV';
  if (eV >= 1e-3) return fmt(eV * 1e3, 2) + ' meV';
  if (eV >= 1e-6) return fmt(eV * 1e6, 2) + ' μeV';
  return fmt(eV * 1e9, 2) + ' neV';
}
function fmtDist(m) {
  if (m >= M.CONST.AU * 0.5) return fmt(m / M.CONST.AU, 1) + ' AU';
  if (m >= 1e6) return fmt(m / 1e3, 0) + ' km';
  if (m >= 1e3) return fmt(m / 1e3, 2) + ' km';
  return fmt(m, 1) + ' m';
}
function fmtTime(s) {
  if (s >= 3600) return fmt(s / 3600, 1) + ' h';
  if (s >= 60) return fmt(s / 60, 1) + ' min';
  if (s >= 1) return fmt(s, 2) + ' s';
  if (s >= 1e-3) return fmt(s * 1e3, 2) + ' ms';
  if (s >= 1e-6) return fmt(s * 1e6, 2) + ' μs';
  return fmt(s * 1e9, 1) + ' ns';
}

function applyLang() {
  document.documentElement.lang = effLang() === 'zh' ? 'zh-CN' : 'en';
  document.title = t('doc.title');
  const md = document.querySelector('meta[name=description]');
  if (md) md.content = t('doc.desc');
  document.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(e => { e.innerHTML = t(e.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-aria]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.i18nAria)); });
  document.querySelectorAll('#langToggle button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  sims.forEach(s => { s.dirty = true; if (s.text) s.text(); });
}
document.querySelectorAll('#langToggle button').forEach(b => b.addEventListener('click', () => { lang = b.dataset.lang; writeLang(lang); applyLang(); }));

/* ───────── canvas + sim registry ───────── */
function fit(cv) {
  const r = cv.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
  const W = Math.max(1, Math.round(r.width * d)), H = Math.max(1, Math.round(r.height * d));
  if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
  const c = cv.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0); c.font = FONT; c.textBaseline = 'middle';
  c.clearRect(0, 0, r.width, r.height);
  return { c, w: r.width, h: r.height };
}
const sims = [];
const io = new IntersectionObserver(es => es.forEach(e => {
  for (const s of sims) if (s.cvs.includes(e.target)) {
    s.vis = s.cvs.some(cv => (cv.__vis = (cv === e.target ? e.isIntersecting : cv.__vis)));
    s.dirty = true;
  }
}), { rootMargin: '60px' });
function reg(cvs, o) {
  o.cvs = [].concat(cvs); o.vis = false; o.dirty = true;
  sims.push(o); o.cvs.forEach(cv => io.observe(cv));
  return o;
}
window.addEventListener('resize', () => sims.forEach(s => { s.dirty = true; }));
const on = (sel, ev, fn) => { const el = $(sel); el.addEventListener(ev, fn); return el; };
const radios = name => [...document.querySelectorAll(`input[name=${name}]`)];
const radioVal = name => radios(name).find(r => r.checked).value;
const put = (sel, s) => { const e = $(sel); if (e.textContent !== s) e.textContent = s; };
const putHTML = (sel, s) => { const e = $(sel); if (e.__h !== s) { e.innerHTML = s; e.__h = s; } };

function frame(w, h, m, x0, x1, y0, y1) {
  const L = m[3], R = w - m[1], T = m[0], B = h - m[2];
  return { L, R, T, B, X: x => L + (R - L) * (x - x0) / (x1 - x0), Y: y => B - (B - T) * (y - y0) / (y1 - y0) };
}
function axes(c, f, xLab, yLab, opt = {}) {
  c.strokeStyle = C.line; c.lineWidth = 1;
  c.beginPath(); c.moveTo(f.L, f.T); c.lineTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
  c.fillStyle = C.mute; c.font = FONT;
  if (yLab) { c.textAlign = 'left'; c.fillText(yLab, f.L + 4, f.T - 12); }
  if (xLab) { c.textAlign = 'right'; c.fillText(xLab, f.R, f.B + (opt.xLabDy || 24)); }
}
function xTicks(c, f, vals, fmtv, skipLast) {
  c.fillStyle = C.mute; c.textAlign = 'center';
  vals.forEach((v, i) => {
    if (skipLast && i === vals.length - 1) return;
    const x = f.X(v);
    c.fillText(fmtv(v), x, f.B + 11);
    c.strokeStyle = C.line; c.beginPath(); c.moveTo(x, f.B); c.lineTo(x, f.B + 3); c.stroke();
  });
}
function yTicks(c, f, vals, fmtv) {
  c.fillStyle = C.mute; c.textAlign = 'right';
  vals.forEach(v => {
    const y = f.Y(v);
    c.fillText(fmtv(v), f.L - 6, y);
    c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, y); c.lineTo(f.R, y); c.stroke();
  });
}
function path(c, pts, X, Y, col, lw = 2.2) {
  c.strokeStyle = col; c.lineWidth = lw; c.lineJoin = 'round';
  c.beginPath();
  pts.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](X(p[0]), Y(p[1])));
  c.stroke();
}

/* ───────── 01: Delayed field kink ───────── */
(() => {
  const cv = $('#kinkCv'), sBeta = $('#kinkBeta'), sTau = $('#kinkTau'), btnPause = $('#kinkPause');
  let tSim = reduce ? 10.0 : 4.0, paused = false;
  const maxT = 13.0;
  function getP() { return { beta: +sBeta.value, tau: +sTau.value, mode: radioVal('kinkMode') }; }
  const sim = reg(cv, {
    step(dt) {
      if (!paused && !reduce) {
        tSim += dt * 2.2;
        if (tSim > maxT) tSim = 1.5;
        this.dirty = true;
      }
      if (this.dirty) { this.draw(); this.dirty = false; text(); }
    },
    draw() {
      const { c, w, h } = fit(cv), P = getP();
      const cx = w * 0.45, cy = h * 0.52, scale = Math.min(w, h) * 0.038;
      const rWave = Math.max(0.5, tSim), rIn = Math.max(0.2, tSim - P.tau);

      if (P.mode === 'causal') {
        c.strokeStyle = C.gold; c.lineWidth = 1.4; c.setLineDash([5, 4]);
        c.beginPath(); c.arc(cx, cy, rWave * scale, 0, PI * 2); c.stroke();
        c.strokeStyle = 'rgba(233,185,73,.45)';
        c.beginPath(); c.arc(cx, cy, rIn * scale, 0, PI * 2); c.stroke();
        c.setLineDash([]);
      }

      // 12 radial/kinked electric field lines
      for (let k = 0; k < 12; k++) {
        const th = (k / 12) * PI * 2;
        const pts = M.ch1.fieldLinePoints(th, tSim, P.beta, P.tau, P.mode, 14);
        c.strokeStyle = C.cyan; c.lineWidth = 1.5;
        c.beginPath();
        pts.forEach((pt, idx) => {
          const px = cx + pt[0] * scale, py = cy - pt[1] * scale;
          c[idx ? 'lineTo' : 'moveTo'](px, py);
        });
        c.stroke();

        // Highlight transverse kink vector at theta = 90 deg and 270 deg
        if (P.mode === 'causal' && (k === 3 || k === 9)) {
          const rMid = 0.5 * (rWave + rIn);
          const idxMid = Math.round((rMid / 14) * (pts.length - 1));
          const pm = pts[clamp(idxMid, 1, pts.length - 2)];
          const px = cx + pm[0] * scale, py = cy - pm[1] * scale;
          const len = clamp(12 + 30 * P.beta, 10, 32);
          c.strokeStyle = C.red; c.lineWidth = 2.6;
          c.beginPath(); c.moveTo(px, py); c.lineTo(px + len, py); c.stroke();
          c.fillStyle = C.red;
          c.beginPath(); c.moveTo(px + len + 5, py); c.lineTo(px + len - 2, py - 4); c.lineTo(px + len - 2, py + 4); c.closePath(); c.fill();
        }
      }

      // Charge dot
      const ox = Math.min(2.2, P.beta * Math.max(0, tSim - 0.5 * P.tau)) * scale;
      c.fillStyle = C.gold; c.beginPath(); c.arc(cx + ox, cy, 6, 0, PI * 2); c.fill();
      c.fillStyle = C.ink; c.textAlign = 'left';
      c.fillText(P.mode === 'causal' ? t('ch1.cv.kink') : t('ch1.cv.instant'), 12, 16);
    }
  });
  function text() {
    const P = getP();
    const rShow = Math.max(1, tSim);
    const flds = M.ch1.fieldsAt(rShow, P.beta, P.tau, PI / 2);
    put('#kinkBetaO', fmt(P.beta, 2) + ' c');
    put('#kinkTauO', fmt(P.tau, 2) + ' τ₀');
    put('#kinkR', fmt(rShow, 1));
    put('#kinkRatio', P.mode === 'causal' ? fmt(flds.ratio, 2) : '0.00');
    put('#kinkEr', fmt(flds.erPowerDecay, 3));
    put('#kinkEp', P.mode === 'causal' ? fmt(flds.epowerDecay, 3) : '0.000');
    const key = P.mode === 'causal' ? 'ch1.say.causal' : 'ch1.say.instant';
    putHTML('#kinkSay', t(key, { r: fmt(rShow, 1), ratio: fmt(flds.ratio, 2) }));
  }
  sim.text = text;
  const nudge = () => { if (reduce) tSim = 10.0; sim.dirty = true; text(); };
  [sBeta, sTau].forEach(e => e.addEventListener('input', nudge));
  radios('kinkMode').forEach(r => r.addEventListener('change', nudge));
  on('#kinkKick', 'click', () => { tSim = reduce ? 10.0 : 1.2; sim.dirty = true; text(); });
  on('#kinkPause', 'click', () => {
    paused = !paused;
    btnPause.setAttribute('aria-pressed', String(paused));
    btnPause.textContent = t(paused ? 'common.resume' : 'common.pause');
  });
  text();
})();

/* ───────── 02: Capacitor displacement current & Faraday feedback ───────── */
(() => {
  const cv = $('#capCv'), sF = $('#capF'), sR = $('#capR'), sEps = $('#capEps'), btnPause = $('#capPause');
  let phase = reduce ? PI * 0.25 : 0, paused = false;
  const getP = () => ({ f: +sF.value, r: +sR.value, eps: +sEps.value });
  const sim = reg(cv, {
    step(dt) {
      if (!paused && !reduce) { phase = (phase + dt * 2.2) % (2 * PI); this.dirty = true; }
      if (this.dirty) { this.draw(); this.dirty = false; text(); }
    },
    draw() {
      const { c, w, h } = fit(cv), P = getP(), m = M.ch2.waveforms(P.f, P.r, P.eps);
      const narrow = w < 560;
      // Schematic box
      const sx = 10, sy = 10, sw = narrow ? w - 20 : w * 0.42, sh = narrow ? h * 0.42 : h - 20;
      const cx = sx + sw * 0.5, cy = sy + sh * 0.5;
      const plateW = Math.min(sw * 0.56, 110), gap = Math.min(sh * 0.36, 44);
      // Dielectric tint
      if (P.eps > 1) {
        c.fillStyle = 'rgba(99,199,230,.12)';
        c.fillRect(cx - plateW / 2, cy - gap / 2, plateW, gap);
      }
      // Wires and plates
      c.strokeStyle = C.mute; c.lineWidth = 3;
      c.beginPath();
      c.moveTo(cx, sy + 18); c.lineTo(cx, cy - gap / 2);
      c.moveTo(cx, cy + gap / 2); c.lineTo(cx, sy + sh - 18);
      c.stroke();
      c.fillStyle = C.ink;
      c.fillRect(cx - plateW / 2, cy - gap / 2 - 4, plateW, 4);
      c.fillRect(cx - plateW / 2, cy + gap / 2, plateW, 4);

      // E-field arrows in gap (proportional to sin(phase))
      const eVal = Math.sin(phase);
      const bVal = Math.cos(phase);
      if (Math.abs(eVal) > 0.08) {
        c.strokeStyle = C.gold; c.lineWidth = 1.6;
        for (let k = -2; k <= 2; k++) {
          const ax = cx + k * (plateW * 0.18);
          const dir = eVal > 0 ? 1 : -1;
          const y0 = cy - dir * (gap * 0.34), y1 = cy + dir * (gap * 0.34);
          c.beginPath(); c.moveTo(ax, y0); c.lineTo(ax, y1); c.stroke();
          c.fillStyle = C.gold;
          c.beginPath(); c.moveTo(ax, y1 + dir * 4); c.lineTo(ax - 3, y1 - dir * 3); c.lineTo(ax + 3, y1 - dir * 3); c.closePath(); c.fill();
        }
      }
      // B-field loop indicator around gap
      c.strokeStyle = C.violet; c.lineWidth = 1.5 + Math.abs(bVal) * 1.5;
      c.beginPath(); c.ellipse(cx, cy, plateW * 0.62, gap * 0.25, 0, 0, PI * 2); c.stroke();
      c.fillStyle = C.gold; c.textAlign = 'left';
      c.fillText(t('ch2.cv.wire'), sx + 6, sy + 14);
      c.fillStyle = C.cyan; c.textAlign = 'right';
      c.fillText(t('ch2.cv.gap'), sx + sw - 6, sy + sh - 14);

      // Waveform plot
      const gx = narrow ? 38 : sw + 48;
      const gy0 = narrow ? sh + 26 : 26;
      const f = frame(w, h, [gy0, 14, 34, gx], 0, 2 * PI, -1.15, 1.15);
      if (f.R - f.L > 60 && f.B - f.T > 50) {
        yTicks(c, f, [-1, 0, 1], v => fmt(v));
        axes(c, f, t('ch2.cv.phase'), t('ch2.cv.amp'));
        xTicks(c, f, [0, PI, 2 * PI], v => v === 0 ? '0' : v < 4 ? 'π' : '2π', true);
        path(c, m.pts.map(p => [p.ph, p.Icond]), f.X, f.Y, C.gold, 2.6);
        c.setLineDash([5, 4]);
        path(c, m.pts.map(p => [p.ph, p.Idisp]), f.X, f.Y, C.cyan, 2.0);
        c.setLineDash([]);
        // Current phase marker
        const px = f.X(phase);
        c.strokeStyle = C.mute; c.lineWidth = 1;
        c.beginPath(); c.moveTo(px, f.T); c.lineTo(px, f.B); c.stroke();
      }
    }
  });
  function text() {
    const P = getP(), m = M.ch2.compute(P.f, P.r, P.eps);
    put('#capFO', fmt(P.f) + ' MHz');
    put('#capRO', fmt(P.r) + ' cm');
    put('#capEpsO', fmt(P.eps, 1));
    put('#capIc', fmt(m.IcondPeak, 3) + ' A');
    put('#capId', fmt(m.IdispPeak, 3) + ' A');
    put('#capB', fmt(m.Brim_uT, 2) + ' μT');
    const farVal = m.faradayPctRaw > 100 ? fmt(m.faradayPctRaw, 0) : fmt(m.faradayPct, m.faradayPct < 0.1 ? 3 : 1);
    const farDisp = m.faradayPctRaw > 100 ? `${farVal}% (${t('ch2.nonpert')})` : `${farVal}%`;
    put('#capFar', farDisp);
    const key = m.faradayPctRaw > 100 ? 'ch2.say.nonpert' : m.nonQuasiStatic ? 'ch2.say.wave' : 'ch2.say.quasi';
    putHTML('#capSay', t(key, {
      c: fmt(m.C_pF, 1), ic: fmt(m.IcondPeak, 3), b: fmt(m.Brim_uT, 2),
      kr: fmt(m.kR, 3), far: farVal, f: fmt(P.f)
    }));
  }
  sim.text = text;
  const redo = () => { sim.dirty = true; text(); };
  [sF, sR, sEps].forEach(e => e.addEventListener('input', redo));
  on('#capPause', 'click', () => {
    paused = !paused;
    btnPause.setAttribute('aria-pressed', String(paused));
    btnPause.textContent = t(paused ? 'common.resume' : 'common.pause');
  });
  text();
})();

/* ───────── 03: 1-D Yee FDTD Leapfrog Solver ───────── */
(() => {
  const cv = $('#fdtdCv'), sN = $('#fdtdN'), sS = $('#fdtdS'), btnPause = $('#fdtdPause');
  let st = null, paused = false;
  function initFdtd() {
    const n = +sN.value, S = +sS.value, mode = radioVal('fdtdSrc');
    st = M.ch3.create({ n, S, mode });
    if (reduce) M.ch3.step(st, mode === 'pulse' ? 120 : 180);
  }
  initFdtd();
  const sim = reg(cv, {
    step(dt) {
      if (!paused && !reduce) {
        const sub = Math.max(1, Math.round(dt * 55));
        if (st.mode === 'pulse' && st.stepCount >= 220 && st.S <= 1.0001) {
          initFdtd();
        } else {
          if (M.ch3.peakAbsE(st) < 1e4) M.ch3.step(st, sub);
        }
        this.dirty = true;
      }
      if (this.dirty) { this.draw(); this.dirty = false; text(); }
    },
    draw() {
      const { c, w, h } = fit(cv), f = frame(w, h, [28, 14, 34, 42], 0, st.N - 1, -1.25, 1.25);
      // Dielectric slab background
      const xSlab = f.X(st.iSlab);
      c.fillStyle = 'rgba(99,199,230,.10)';
      c.fillRect(xSlab, f.T, f.R - xSlab, f.B - f.T);
      c.strokeStyle = C.cyan; c.lineWidth = 1; c.setLineDash([4, 4]);
      c.beginPath(); c.moveTo(xSlab, f.T); c.lineTo(xSlab, f.B); c.stroke(); c.setLineDash([]);

      yTicks(c, f, [-1, 0, 1], v => fmt(v));
      axes(c, f, t('ch3.cv.x'), t('ch3.cv.y'));
      xTicks(c, f, [0, 60, 120, 180, 240], v => fmt(v), true);

      // Top labels on left and right of slab interface (kept well inside margins)
      c.fillStyle = C.mute; c.textAlign = 'left';
      c.fillText(t('ch3.cv.vac'), f.L + 6, f.T + 12);
      c.fillStyle = C.cyan; c.textAlign = 'right';
      c.fillText(t('ch3.cv.med', { n: fmt(st.n, 1) }), f.R - 6, f.T + 12);

      const ePts = [], hPts = [];
      for (let i = 0; i < st.N; i++) ePts.push([i, clamp(st.E[i], -1.22, 1.22)]);
      for (let i = 0; i < st.N - 1; i++) hPts.push([i + 0.5, clamp(st.H[i], -1.22, 1.22)]);
      path(c, ePts, f.X, f.Y, C.gold, 2.3);
      c.setLineDash([5, 4]);
      path(c, hPts, f.X, f.Y, C.cyan, 1.8);
      c.setLineDash([]);
    }
  });
  function text() {
    const fr = M.ch3.fresnel(st.n);
    const pk = M.ch3.peakAbsE(st);
    const unstable = st.S > 1.0001 && pk > 2.5;
    const meas = M.ch3.measureSplit(st);
    put('#fdtdNO', fmt(st.n, 1));
    put('#fdtdSO', fmt(st.S, 2));
    put('#fdtdV', fmt(fr.speedFrac, 3) + ' c');
    put('#fdtdR', (st.mode === 'pulse' && st.stepCount >= 95 && st.stepCount <= 165)
      ? `${fmt(meas.R_meas * 100, 1)}% / ${fmt(fr.R * 100, 1)}%`
      : `— / ${fmt(fr.R * 100, 1)}%`);
    put('#fdtdT', (st.mode === 'pulse' && st.stepCount >= 95 && st.stepCount <= 165)
      ? `${fmt(meas.T_meas * 100, 1)}% / ${fmt(fr.T * 100, 1)}%`
      : `— / ${fmt(fr.T * 100, 1)}%`);
    put('#fdtdU', unstable ? '∞' : fmt(meas.energyRatio, 4));
    if (unstable) {
      putHTML('#fdtdSay', t('ch3.say.unstable', { s: fmt(st.S, 2), pk: pk > 1e5 ? fmtSci(pk) : fmt(pk, 1) }));
    } else if (st.mode === 'cw') {
      putHTML('#fdtdSay', t('ch3.say.cw', { n: fmt(st.n, 1), v: fmt(fr.speedFrac, 3), rth: fmt(fr.R * 100, 1) }));
    } else {
      const rm = (st.stepCount >= 95 && st.stepCount <= 165) ? fmt(meas.R_meas * 100, 1) : fmt(fr.R * 100, 1);
      const tm = (st.stepCount >= 95 && st.stepCount <= 165) ? fmt(meas.T_meas * 100, 1) : fmt(fr.T * 100, 1);
      putHTML('#fdtdSay', t('ch3.say.pulse', {
        n: fmt(st.n, 1), rth: fmt(fr.R * 100, 1), tth: fmt(fr.T * 100, 1),
        rm, tm, v: fmt(fr.speedFrac, 3), u: fmt(meas.energyRatio, 4)
      }));
    }
  }
  sim.text = text;
  const redo = () => { initFdtd(); sim.dirty = true; text(); };
  [sN, sS].forEach(e => e.addEventListener('input', redo));
  radios('fdtdSrc').forEach(r => r.addEventListener('change', redo));
  on('#fdtdReset', 'click', redo);
  on('#fdtdPause', 'click', () => {
    paused = !paused;
    btnPause.setAttribute('aria-pressed', String(paused));
    btnPause.textContent = t(paused ? 'common.resume' : 'common.pause');
  });
  text();
})();

/* ───────── 04: Dipole radiation pattern ───────── */
(() => {
  const cv = $('#dipCv'), sL = $('#dipL'), sAng = $('#dipAng');
  const getP = () => ({ l: +sL.value, ang: +sAng.value });
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), P = getP(), m = M.ch4.dipoleMetrics(P.l);
      const cx = w * 0.5, cy = h * 0.52, R = Math.min(w * 0.34, h * 0.37);
      // Polar grid circles
      c.strokeStyle = C.grid; c.lineWidth = 1;
      for (const f of [0.5, 1.0]) { c.beginPath(); c.arc(cx, cy, R * f, 0, PI * 2); c.stroke(); }
      c.beginPath(); c.moveTo(cx, cy - R - 8); c.lineTo(cx, cy + R + 8); c.moveTo(cx - R - 8, cy); c.lineTo(cx + R + 8, cy); c.stroke();

      // Isotropic reference circle scaled by 1/sqrt(D)
      c.strokeStyle = C.cyan; c.lineWidth = 1.4; c.setLineDash([4, 4]);
      c.beginPath(); c.arc(cx, cy, R / Math.sqrt(m.D), 0, PI * 2); c.stroke(); c.setLineDash([]);

      // Polar power pattern U(theta) on left & right (axis is vertical: theta = 0 at top)
      c.fillStyle = 'rgba(233,185,73,.16)'; c.strokeStyle = C.gold; c.lineWidth = 2.3;
      c.beginPath();
      for (let deg = 0; deg <= 360; deg += 2) {
        const th = (deg * PI) / 180;
        const f = M.ch4.dipoleField(th, P.l);
        const rNorm = m.uMax > 0 ? (f * f) / m.uMax : 0;
        const px = cx + rNorm * R * Math.sin(th);
        const py = cy - rNorm * R * Math.cos(th);
        c[deg ? 'lineTo' : 'moveTo'](px, py);
      }
      c.closePath(); c.fill(); c.stroke();

      // Dipole rod in center
      const rodHalf = clamp(P.l * 24, 6, 36);
      c.strokeStyle = C.ink; c.lineWidth = 4;
      c.beginPath(); c.moveTo(cx, cy - rodHalf); c.lineTo(cx, cy + rodHalf); c.stroke();

      // Observation angle probe ray
      const obsRad = (P.ang * PI) / 180;
      const obsF = M.ch4.dipoleField(obsRad, P.l);
      const obsR = (m.uMax > 0 ? (obsF * obsF) / m.uMax : 0) * R;
      c.strokeStyle = C.red; c.lineWidth = 2;
      c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + R * 1.06 * Math.sin(obsRad), cy - R * 1.06 * Math.cos(obsRad)); c.stroke();
      c.fillStyle = C.red; c.beginPath(); c.arc(cx + obsR * Math.sin(obsRad), cy - obsR * Math.cos(obsRad), 5, 0, PI * 2); c.fill();

      c.fillStyle = C.mute; c.textAlign = 'center';
      c.fillText(t('ch4.cv.axis'), cx, 14);
      c.textAlign = 'right';
      c.fillText(t('ch4.cv.eq'), w - 10, cy - 12);
    }
  });
  function text() {
    const P = getP(), m = M.ch4.patternAtAngle(P.ang, P.l);
    put('#dipLO', fmt(P.l, 2) + ' λ');
    put('#dipAngO', fmt(P.ang) + '°');
    put('#dipD', `${fmt(m.D, 2)} (${fmt(m.dBi, 2)} dBi)`);
    put('#dipR', fmt(m.RradMax, m.RradMax < 5 ? 2 : 1) + ' Ω');
    put('#dipBW', fmt(m.hpbwDeg, 1) + '°');
    put('#dipRel', fmt(m.relPower * 100, 1) + '%');
    const noteKey = P.l <= 0.25 ? 'ch4.note.short' : P.l <= 0.70 ? 'ch4.note.half' : P.l <= 1.15 ? 'ch4.note.full' : 'ch4.note.multi';
    putHTML('#dipSay', t('ch4.say.main', {
      l: fmt(P.l, 2), r: fmt(m.RradMax, m.RradMax < 5 ? 2 : 1), d: fmt(m.D, 2), dbi: fmt(m.dBi, 2),
      bw: fmt(m.hpbwDeg, 1), ang: fmt(P.ang), rel: fmt(m.relPower * 100, 1), note: t(noteKey)
    }));
  }
  sim.text = text;
  const redo = () => { sim.dirty = true; text(); };
  [sL, sAng].forEach(e => e.addEventListener('input', redo));
  document.querySelectorAll('[data-dip-preset]').forEach(b => b.addEventListener('click', () => {
    sL.value = b.dataset.dipPreset; redo();
  }));
  text();
})();

/* ───────── 05: Poynting solar sail + 3-polariser Malus ───────── */
(() => {
  const cv1 = $('#sailCv'), cv2 = $('#polCv');
  const sAU = $('#sailAU'), sRef = $('#sailRef'), chkMid = $('#polMid'), sTh2 = $('#polTh2');
  const getP = () => ({ au: +sAU.value, ref: +sRef.value, mid: chkMid.checked, th2: +sTh2.value });
  const sim = reg([cv1, cv2], {
    draw() {
      const P = getP();
      // Top canvas: 1/r^2 Poynting flux curve + Sun/Sail schematic
      {
        const { c, w, h } = fit(cv1);
        const f = frame(w, h, [26, 14, 34, 48], 0.3, 3.0, 0, 9000);
        yTicks(c, f, [0, 4000, 8000], v => fmt(v));
        axes(c, f, 'AU', 'S (W/m²)');
        xTicks(c, f, [0.5, 1.0, 1.5, 2.0, 2.5, 3.0], v => fmt(v, 1), true);
        const pts = [];
        for (let r = 0.4; r <= 3.001; r += 0.05) pts.push([r, M.ch5.poyntingSail(r, P.ref).S]);
        path(c, pts, f.X, f.Y, C.gold, 2.4);
        const cur = M.ch5.poyntingSail(P.au, P.ref);
        c.fillStyle = C.cyan; c.beginPath(); c.arc(f.X(P.au), f.Y(Math.min(8900, cur.S)), 5.5, 0, PI * 2); c.fill();
        c.fillStyle = C.mute; c.textAlign = 'right';
        c.fillText(t('ch5.cv.sail'), f.R - 6, f.T + 12);
      }
      // Bottom canvas: 3-polariser vector bench
      {
        const { c, w, h } = fit(cv2);
        const pol = M.ch5.malusThree(P.th2, P.mid);
        const xs = [w * 0.22, w * 0.50, w * 0.78];
        const cy = h * 0.48, rad = Math.min(w * 0.11, h * 0.28);

        // Beam horizontal spine
        c.strokeStyle = 'rgba(233,185,73,.35)'; c.lineWidth = 3;
        c.beginPath(); c.moveTo(12, cy); c.lineTo(w - 12, cy); c.stroke();

        const stages = [
          { x: xs[0], ang: 0, amp: Math.sqrt(pol.I1), active: true, lbl: t('ch5.cv.p1') },
          { x: xs[1], ang: P.th2, amp: P.mid ? Math.sqrt(pol.I2) : Math.sqrt(pol.I1), active: P.mid, lbl: P.mid ? t('ch5.cv.p2', { ang: fmt(P.th2) }) : t('ch5.cv.none') },
          { x: xs[2], ang: 90, amp: Math.sqrt(pol.I3), active: true, lbl: t('ch5.cv.p3') }
        ];
        stages.forEach((st, idx) => {
          c.save();
          c.translate(st.x, cy);
          c.strokeStyle = st.active ? C.line : 'rgba(163,170,184,.25)';
          c.lineWidth = 2;
          c.beginPath(); c.ellipse(0, 0, rad * 0.65, rad, 0, 0, PI * 2); c.stroke();
          if (st.active) {
            // Polariser transmission axis lines
            const a = (st.ang * PI) / 180;
            c.strokeStyle = 'rgba(163,170,184,.38)'; c.lineWidth = 1;
            const dx = Math.sin(a) * rad * 0.55, dy = -Math.cos(a) * rad * 0.85;
            c.beginPath(); c.moveTo(-dx, -dy); c.lineTo(dx, dy); c.stroke();
            // Transmitted E-field vector
            const ev = st.amp * 1.35;
            const vx = Math.sin(a) * rad * 0.55 * ev, vy = -Math.cos(a) * rad * 0.85 * ev;
            if (st.amp > 0.02) {
              c.strokeStyle = idx === 2 ? C.violet : C.gold; c.lineWidth = 3;
              c.beginPath(); c.moveTo(-vx, -vy); c.lineTo(vx, vy); c.stroke();
            }
          }
          c.restore();
          c.fillStyle = st.active ? C.ink : C.mute; c.textAlign = 'center';
          c.fillText(st.lbl, st.x, h - 14);
        });
      }
    }
  });
  function text() {
    const P = getP(), s = M.ch5.poyntingSail(P.au, P.ref), pol = M.ch5.malusThree(P.th2, P.mid);
    put('#sailAUO', fmt(P.au, 1) + ' AU');
    put('#sailRefO', fmt(P.ref * 100) + '%');
    put('#polTh2O', fmt(P.th2) + '°');
    sTh2.disabled = !P.mid;
    put('#sailS', fmt(s.S, 0) + ' W/m²');
    put('#sailP', fmt(s.pressure_uPa, 2) + ' μPa');
    put('#sailDv', fmt(s.dvPerDayMs, 1) + ' m/s·d');
    put('#polOut', fmt(pol.pctOut, 1) + '%');
    const polmsg = !P.mid
      ? t('ch5.pol.off')
      : pol.pctOut < 0.05
        ? t('ch5.pol.zero', { ang: fmt(P.th2) })
        : t('ch5.pol.on', { ang: fmt(P.th2), i2: fmt(pol.I2 * 100, 1), i3: fmt(pol.pctOut, 1) });
    putHTML('#ch5Say', t('ch5.say.all', {
      au: fmt(P.au, 1), r: fmt(P.ref, 2), s: fmt(s.S, 0), p: fmt(s.pressure_uPa, 2), dv: fmt(s.dvPerDayMs, 1), polmsg
    }));
  }
  sim.text = text;
  const redo = () => { sim.dirty = true; text(); };
  [sAU, sRef, sTh2].forEach(e => e.addEventListener('input', redo));
  chkMid.addEventListener('change', redo);
  text();
})();

/* ───────── 06: Full spectrum & liquid water Debye loss ───────── */
(() => {
  const cv1 = $('#specCv'), cv2 = $('#waterCv'), sLogF = $('#specLogF');
  const getP = () => +sLogF.value;
  const sim = reg([cv1, cv2], {
    draw() {
      const logf = getP();
      // Top canvas: 10^4 .. 10^20 Hz spectrum + photon energy log10(E_eV)
      {
        const { c, w, h } = fit(cv1), f = frame(w, h, [32, 14, 34, 44], 4, 20, -10, 6);
        yTicks(c, f, [-8, -4, 0, 4], v => `1e${v}`);
        axes(c, f, 'log₁₀(f/Hz)', 'log₁₀(E/eV)');
        xTicks(c, f, [4, 8, 12, 16, 20], v => fmt(v), true);

        // Visible band rainbow strip
        const xVis0 = f.X(14.6), xVis1 = f.X(14.9);
        c.fillStyle = 'rgba(122,214,160,.35)';
        c.fillRect(xVis0, f.T, Math.max(4, xVis1 - xVis0), f.B - f.T);

        // E = hf line
        const pts = [];
        for (let lg = 4; lg <= 20.001; lg += 0.5) {
          pts.push([lg, Math.log10(M.ch6.inspect(lg).E_eV)]);
        }
        path(c, pts, f.X, f.Y, C.cyan, 2.5);

        // Thermal threshold 6.25 THz (logf = 12.796) and Ionisation threshold 10 eV (logf = 15.383)
        const xTh = f.X(12.796), xIon = f.X(15.383);
        c.strokeStyle = C.violet; c.setLineDash([4, 4]); c.lineWidth = 1.4;
        c.beginPath(); c.moveTo(xTh, f.T); c.lineTo(xTh, f.B); c.stroke();
        c.strokeStyle = C.red;
        c.beginPath(); c.moveTo(xIon, f.T); c.lineTo(xIon, f.B); c.stroke();
        c.setLineDash([]);

        // Stagger labels away from each other and keep inside frame at 320px
        c.fillStyle = C.violet; c.textAlign = 'right';
        c.fillText(t('ch6.cv.therm'), xTh - 4, f.T + 14);
        c.fillStyle = C.red;
        if (f.R - xIon < 95) {
          c.textAlign = 'right';
          c.fillText(t('ch6.cv.ion'), xIon - 4, f.T + 36);
        } else {
          c.textAlign = 'left';
          c.fillText(t('ch6.cv.ion'), xIon + 4, f.T + 34);
        }

        // Current cursor
        const cur = M.ch6.inspect(logf);
        const cx = f.X(logf), cy = f.Y(Math.log10(cur.E_eV));
        c.fillStyle = C.gold; c.beginPath(); c.arc(cx, cy, 5.5, 0, PI * 2); c.fill();
      }
      // Bottom canvas: 25 C water Debye dielectric loss eps''(f) from 0.5 to 100 GHz
      {
        const { c, w, h } = fit(cv2), f = frame(w, h, [28, 14, 32, 42], -0.3, 2.0, 0, 54);
        yTicks(c, f, [0, 20, 40], v => fmt(v));
        axes(c, f, 'log₁₀(f/GHz)', t('ch6.cv.wat'));
        xTicks(c, f, [0, 1, 2], v => v === 0 ? '1' : v === 1 ? '10' : '100', true);
        const pts = [];
        for (let lg = -0.3; lg <= 2.001; lg += 0.04) {
          pts.push([lg, M.ch6.waterDebye(Math.pow(10, lg)).epsDoublePrime]);
        }
        path(c, pts, f.X, f.Y, C.cyan, 2.3);
        const lgOven = Math.log10(2.45), lgPeak = Math.log10(19.6);
        const wOven = M.ch6.waterDebye(2.45), wPeak = M.ch6.waterDebye(19.6);
        c.fillStyle = C.gold; c.beginPath(); c.arc(f.X(lgOven), f.Y(wOven.epsDoublePrime), 5, 0, PI * 2); c.fill();
        c.fillStyle = C.red; c.beginPath(); c.arc(f.X(lgPeak), f.Y(wPeak.epsDoublePrime), 5, 0, PI * 2); c.fill();
        c.fillStyle = C.gold; c.textAlign = 'left';
        c.fillText(t('ch6.cv.oven'), f.L + 6, f.T + 12);
        c.fillStyle = C.red; c.textAlign = 'right';
        c.fillText(t('ch6.cv.peak'), f.R - 6, f.T + 30);
      }
    }
  });
  function text() {
    const lg = getP(), m = M.ch6.inspect(lg);
    put('#specLogFO', fmt(lg, 2));
    put('#specLam', fmtLam(m.lam));
    put('#specE', fmtEnergyEV(m.E_eV));
    put('#specKt', m.thermalRatio >= 100 ? fmt(m.thermalRatio, 0) + '×' : m.thermalRatio >= 0.01 ? fmt(m.thermalRatio, 2) + '×' : fmtSci(m.thermalRatio) + '×');
    put('#specMode', m.photonsPerModeAt1Wm2 >= 1e4 ? fmtSci(m.photonsPerModeAt1Wm2) : fmt(m.photonsPerModeAt1Wm2, 3));
    const regKey = m.ionising ? 'ch6.reg.ion' : m.thermalRatio > 2 ? 'ch6.reg.quant' : m.thermalRatio > 0.2 ? 'ch6.reg.cross' : 'ch6.reg.class';
    putHTML('#specSay', t('ch6.say.body', {
      f: fmtFreq(m.f), lam: fmtLam(m.lam), band: t('ch6.band.' + m.band),
      e: fmtEnergyEV(m.E_eV),
      kt: m.thermalRatio >= 10 ? fmt(m.thermalRatio, 0) : m.thermalRatio >= 0.01 ? fmt(m.thermalRatio, 2) : fmtSci(m.thermalRatio),
      regime: t(regKey)
    }));
  }
  sim.text = text;
  const redo = () => { sim.dirty = true; text(); };
  sLogF.addEventListener('input', redo);
  document.querySelectorAll('[data-spec-f]').forEach(b => b.addEventListener('click', () => {
    sLogF.value = b.dataset.specF; redo();
  }));
  text();
})();

/* ───────── 07: Atmospheric transmission windows ───────── */
(() => {
  const cv = $('#atmoCv'), sF = $('#atmoLogF'), sRho = $('#atmoRho'), sFof2 = $('#atmoFof2');
  const getP = () => ({ lg: +sF.value, rho: +sRho.value, fof2: +sFof2.value });
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), P = getP();
      const f = frame(w, h, [34, 14, 34, 44], 6.0, 18.5, 0, 125);
      yTicks(c, f, [0, 50, 100], v => fmt(v) + '%');
      axes(c, f, t('ch7.cv.x'), t('ch7.cv.y'));
      xTicks(c, f, [6, 9, 12, 15, 18], v => fmt(v), false);

      const pts = [];
      for (let i = 0; i <= 260; i++) {
        const lg = 6.0 + (i / 260) * 12.5;
        pts.push([lg, M.ch7.zenithTransmission(lg, P.rho, P.fof2) * 100]);
      }
      c.fillStyle = 'rgba(99,199,230,.12)';
      c.beginPath(); c.moveTo(f.X(6.0), f.B);
      pts.forEach(p => c.lineTo(f.X(p[0]), f.Y(p[1])));
      c.lineTo(f.X(18.5), f.B); c.closePath(); c.fill();
      path(c, pts, f.X, f.Y, C.cyan, 2.1);

      // Window labels placed cleanly above the 100% curve and staggered at 320px
      const yTop = f.Y(100);
      c.fillStyle = C.mute; c.textAlign = 'center';
      c.fillText(t('ch7.cv.rad'), f.X(9.0), yTop - 12);
      c.fillText(t('ch7.cv.ir'), f.X(13.5), yTop - 26);
      c.fillText(t('ch7.cv.vis'), f.X(15.2), yTop - 12);

      // Probe dot
      const T = M.ch7.zenithTransmission(P.lg, P.rho, P.fof2);
      c.fillStyle = C.gold; c.beginPath(); c.arc(f.X(P.lg), f.Y(T * 100), 5.5, 0, PI * 2); c.fill();
    }
  });
  function text() {
    const P = getP(), fHz = Math.pow(10, P.lg), lam = M.CONST.c / fHz;
    const T = M.ch7.zenithTransmission(P.lg, P.rho, P.fof2);
    const db = -10 * Math.log10(Math.max(1e-6, T));
    put('#atmoLogFO', fmt(P.lg, 2));
    put('#atmoRhoO', fmt(P.rho, 1) + ' g/m³');
    put('#atmoFof2O', fmt(P.fof2) + ' MHz');
    put('#atmoF', fmtFreq(fHz));
    put('#atmoLam', fmtLam(lam));
    put('#atmoT', fmt(T * 100, T < 0.01 ? 2 : 1) + '%');
    put('#atmoDb', fmt(db, db > 10 ? 1 : 2) + ' dB');
    const whyKey = (fHz / 1e6 <= P.fof2) ? 'ch7.why.iono' : T >= 0.7 ? 'ch7.why.open' : T >= 0.1 ? 'ch7.why.mid' : 'ch7.why.shut';
    putHTML('#atmoSay', t('ch7.say.body', {
      f: fmtFreq(fHz), lam: fmtLam(lam), rho: fmt(P.rho, 1),
      t: fmt(T * 100, T < 0.01 ? 2 : 1), db: fmt(db, db > 10 ? 1 : 2), why: t(whyKey)
    }));
  }
  sim.text = text;
  const redo = () => { sim.dirty = true; text(); };
  [sF, sRho, sFof2].forEach(e => e.addEventListener('input', redo));
  document.querySelectorAll('[data-atmo-f]').forEach(b => b.addEventListener('click', () => {
    sF.value = b.dataset.atmoF; redo();
  }));
  text();
})();

/* ───────── 08: Modulation & Friis link budget ───────── */
(() => {
  const cv1 = $('#linkCv'), cv2 = $('#modCv'), sScale = $('#linkScale');
  const getP = () => ({ pre: radioVal('linkPre'), mod: radioVal('modKind'), scale: +sScale.value });
  const sim = reg([cv1, cv2], {
    draw() {
      const P = getP(), base = M.ch8.PRESETS[P.pre];
      const m = M.ch8.friis({ ...base, distM: base.distM * P.scale });
      // Top canvas: Friis waterfall bars
      {
        const { c, w, h } = fit(cv1), f = frame(w, h, [28, 22, 42, 48], -0.5, 5.8, -185, 85);
        yTicks(c, f, [-150, -100, -50, 0, 50], v => fmt(v));
        axes(c, f, '', 'dBm');
        const cols = [
          { x: 0, v0: 0, v1: m.txPowerDbm, col: C.gold, lbl: t('ch8.cv.tx') },
          { x: 1, v0: m.txPowerDbm, v1: m.txPowerDbm + m.gTxDbi, col: C.green, lbl: t('ch8.cv.gtx') },
          { x: 2, v0: m.txPowerDbm + m.gTxDbi, v1: m.txPowerDbm + m.gTxDbi - m.fsplDb - m.atmLossDb, col: C.red, lbl: t('ch8.cv.fspl') },
          { x: 3, v0: m.prxDbm - m.gRxDbi, v1: m.prxDbm, col: C.green, lbl: t('ch8.cv.grx') },
          { x: 4, v0: -185, v1: m.prxDbm, col: C.cyan, lbl: t('ch8.cv.prx') },
          { x: 5, v0: -185, v1: m.noiseDbm, col: C.violet, lbl: t('ch8.cv.nf') }
        ];
        const bw = clamp((f.R - f.L) / 9, 14, 44);
        cols.forEach((b, idx) => {
          const yTop = f.Y(clamp(Math.max(b.v0, b.v1), -185, 85));
          const yBot = f.Y(clamp(Math.min(b.v0, b.v1), -185, 85));
          c.fillStyle = b.col;
          c.fillRect(f.X(b.x) - bw / 2, yTop, bw, Math.max(2, yBot - yTop));
          c.fillStyle = C.mute; c.textAlign = 'center';
          c.fillText(b.lbl, f.X(b.x), f.B + (idx % 2 === 0 ? 12 : 28));
        });
      }
      // Bottom canvas: Modulation waveform
      {
        const { c, w, h } = fit(cv2), f = frame(w, h, [28, 14, 24, 36], 0, 1, -1.25, 1.25);
        yTicks(c, f, [-1, 0, 1], v => fmt(v));
        axes(c, f, '', t('ch8.cv.wave', { kind: P.mod }));
        const pts = M.ch8.modulationTrace(P.mod);
        // Add subtle visual noise hint when SNR < 5 dB
        const nAmp = m.snrDb < 0 ? 0.24 : m.snrDb < 15 ? 0.08 : 0.0;
        const noisy = pts.map((p, idx) => [p[0], clamp(p[1] + nAmp * Math.sin(idx * 47.3), -1.2, 1.2)]);
        path(c, noisy, f.X, f.Y, C.cyan, 1.9);
        if (P.mod === 'AM') path(c, pts.map(p => [p[0], 0.55 + 0.45 * p[2]]), f.X, f.Y, C.gold, 1.5);
      }
    }
  });
  function text() {
    const P = getP(), base = M.ch8.PRESETS[P.pre];
    const m = M.ch8.friis({ ...base, distM: base.distM * P.scale });
    put('#linkScaleO', fmt(P.scale, 1) + '×');
    put('#linkFspl', fmt(m.fsplDb, 1) + ' dB');
    put('#linkPrx', fmt(m.prxDbm, 1) + ' dBm');
    put('#linkSnr', fmt(m.snrDb, 1) + ' dB');
    const capTxt = m.shannonMbps >= 1 ? fmt(m.shannonMbps, 1) + ' Mbps' : fmt(m.shannonMbps * 1e3, 1) + ' kbps';
    put('#linkCap', `${capTxt} / ${fmtTime(m.lightTimeS)}`);
    const nameMap = { wifi: 'ch8.pre.wifi', cell: 'ch8.pre.cell', gps: 'ch8.pre.gps', voyager: 'ch8.pre.voy' };
    putHTML('#linkSay', t('ch8.say.body', {
      name: t(nameMap[P.pre]), f: fmtFreq(m.freqMHz * 1e6), d: fmtDist(m.distM),
      lt: fmtTime(m.lightTimeS), fspl: fmt(m.fsplDb, 1), prx: fmt(m.prxDbm, 1),
      pw: fmtSci(m.prxWatts), snr: fmt(m.snrDb, 1), note: t('ch8.note.' + P.pre)
    }));
  }
  sim.text = text;
  const redo = () => { sim.dirty = true; text(); };
  sScale.addEventListener('input', redo);
  radios('linkPre').forEach(r => r.addEventListener('change', redo));
  radios('modKind').forEach(r => r.addEventListener('change', redo));
  text();
})();

/* ───────── 09: Phased-array beam steering & Silica optical fibre ───────── */
(() => {
  const cv1 = $('#arrCv'), cv2 = $('#fibCv');
  const sN = $('#arrN'), sTh = $('#arrTh'), sD = $('#arrD'), sLam = $('#fibLam');
  const getP = () => ({ N: +sN.value, th0: +sTh.value, d: +sD.value, lam: +sLam.value });
  const sim = reg([cv1, cv2], {
    draw() {
      const P = getP();
      // Top canvas: Left 2D wave interference + Right AF(theta)^2 pattern
      {
        const { c, w, h } = fit(cv1);
        const split = w < 460 ? w * 0.48 : w * 0.56;
        // 2D phased wave interference in half-space
        const gx0 = 20, gy0 = 24, gw = split - 30, gh = h - 40;
        const cols = 48, rows = 36, cw = gw / cols, ch = gh / rows;
        const th0Rad = (P.th0 * PI) / 180;
        const elemSpan = (P.N - 1) * P.d;
        const scaleLambda = Math.max(10, elemSpan * 1.6);
        for (let ix = 0; ix < cols; ix++) {
          const xLam = 0.4 + (ix / cols) * scaleLambda;
          for (let iy = 0; iy < rows; iy++) {
            const yLam = ((iy / (rows - 1)) - 0.5) * scaleLambda;
            let re = 0;
            for (let k = 0; k < P.N; k++) {
              const yk = (k - (P.N - 1) / 2) * P.d;
              const r = Math.hypot(xLam, yLam - yk);
              const phi = 2 * PI * (r - k * P.d * Math.sin(th0Rad));
              re += Math.cos(phi) / Math.sqrt(Math.max(0.5, r));
            }
            const val = clamp(re / (P.N * 0.55), -1, 1);
            c.fillStyle = val >= 0
              ? `rgba(233,185,73,${(val * 0.85).toFixed(2)})`
              : `rgba(99,199,230,${(-val * 0.75).toFixed(2)})`;
            c.fillRect(gx0 + ix * cw, gy0 + iy * ch, cw + 0.6, ch + 0.6);
          }
        }
        // Array element dots on left vertical line
        c.fillStyle = C.ink;
        for (let k = 0; k < P.N; k++) {
          const yk = (k - (P.N - 1) / 2) * P.d;
          const py = gy0 + gh * (0.5 + yk / scaleLambda);
          if (py >= gy0 && py <= gy0 + gh) { c.beginPath(); c.arc(gx0, py, 2.5, 0, PI * 2); c.fill(); }
        }
        c.fillStyle = C.ink; c.textAlign = 'left';
        c.fillText(t('ch9.cv.arr', { th: fmt(P.th0) }), gx0, 12);

        // Right panel: AF(theta)^2 vs angle [-90, 90]
        const f = frame(w, h, [28, 12, 32, split + 28], -90, 90, 0, 1.15);
        yTicks(c, f, [0, 0.5, 1], v => fmt(v, 1));
        axes(c, f, 'θ (°)', '|AF|²');
        xTicks(c, f, [-60, 0, 60], v => fmt(v) + '°', false);
        const pts = [];
        for (let ang = -90; ang <= 90; ang += 1) {
          const af = M.ch9.arrayFactor(ang, P.N, P.d, P.th0);
          pts.push([ang, af * af]);
        }
        path(c, pts, f.X, f.Y, C.gold, 2.1);
        const st = M.ch9.phasedArrayStats(P.N, P.d, P.th0);
        if (st.hasGratingLobe) {
          c.fillStyle = C.red; c.textAlign = 'right';
          c.fillText(t('ch9.cv.grate'), f.R - 2, f.T - 12);
        }
      }
      // Bottom canvas: Silica fibre attenuation vs wavelength
      {
        const { c, w, h } = fit(cv2), f = frame(w, h, [26, 14, 34, 42], 850, 1700, 0, 2.5);
        yTicks(c, f, [0, 1, 2], v => fmt(v, 1));
        axes(c, f, t('ch9.cv.fibx'), t('ch9.cv.fiby'));
        xTicks(c, f, [850, 1310, 1550, 1700], v => fmt(v), true);
        const pts = [];
        for (let l = 850; l <= 1700; l += 10) pts.push([l, M.ch9.fibreLossDbKm(l)]);
        path(c, pts, f.X, f.Y, C.cyan, 2.3);
        const loss = M.ch9.fibreLossDbKm(P.lam);
        c.fillStyle = C.gold; c.beginPath(); c.arc(f.X(P.lam), f.Y(Math.min(2.45, loss)), 5.5, 0, PI * 2); c.fill();
      }
    }
  });
  function text() {
    const P = getP(), st = M.ch9.phasedArrayStats(P.N, P.d, P.th0);
    const loss = M.ch9.fibreLossDbKm(P.lam);
    const rem10 = Math.pow(10, -loss); // 10 km * dB/km / 10 = dB/km
    put('#arrNO', fmt(P.N));
    put('#arrThO', fmt(P.th0) + '°');
    put('#arrDO', fmt(P.d, 2) + ' λ');
    put('#fibLamO', fmt(P.lam) + ' nm');
    put('#arrBw', fmt(st.hpbwDeg, 1) + '°');
    put('#arrGr', t(st.hasGratingLobe ? 'ch9.gr.warn' : 'ch9.gr.safe'));
    put('#fibLoss', fmt(loss, 3) + ' dB/km');
    put('#fibCrit', `${fmt(M.ch9.criticalAngleDeg(), 2)}° / ${fmt(M.ch9.numericalAperture(), 3)}`);
    const gmsg = t(st.hasGratingLobe ? 'ch9.say.gwarn' : 'ch9.say.gsafe', { d: fmt(P.d, 2) });
    putHTML('#ch9Say', t('ch9.say.body', {
      n: fmt(P.N), th: fmt(P.th0), bw: fmt(st.hpbwDeg, 1), gmsg,
      lam: fmt(P.lam), loss: fmt(loss, 3), rem: fmt(rem10 * 100, 1)
    }));
  }
  sim.text = text;
  const redo = () => { sim.dirty = true; text(); };
  [sN, sTh, sD, sLam].forEach(e => e.addEventListener('input', redo));
  text();
})();

/* ───────── 10: Frontier benchmarks (Nov 2026) ───────── */
(() => {
  const cv = $('#frCv');
  const getDom = () => radioVal('frDom');
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), dom = getDom(), F = M.FRONTIER;
      let bars = [];
      if (dom === 'fibre') {
        bars = [
          { lbl: t('ch10.cv.f1'), val: F.fibre.smfStdLossDbKm, max: 0.22, unit: ' dB/km', col: C.mute },
          { lbl: t('ch10.cv.f2'), val: F.fibre.silicaRayleighFloorDbKm, max: 0.22, unit: ' dB/km', col: C.cyan },
          { lbl: t('ch10.cv.f3'), val: F.fibre.hollowCoreRecordDbKm, max: 0.22, unit: ' dB/km', col: C.green }
        ];
      } else if (dom === 'space') {
        bars = [
          { lbl: t('ch10.cv.s1'), val: Math.log10(F.fso.voyager1BitrateBps), max: 9.0, disp: '160 bps', col: C.mute },
          { lbl: t('ch10.cv.s2'), val: Math.log10(F.fso.dsocMidMbps * 1e6), max: 9.0, disp: '25 Mbps', col: C.cyan },
          { lbl: t('ch10.cv.s3'), val: Math.log10(F.fso.dsocPeakMbps * 1e6), max: 9.0, disp: '267 Mbps', col: C.green }
        ];
      } else {
        bars = [
          { lbl: t('ch10.cv.e1'), val: 13.1, max: 16, disp: '~13 nm (0.33 NA)', col: C.mute },
          { lbl: t('ch10.cv.e2'), val: F.shortWave.euvHalfPitchNm, max: 16, disp: '8 nm (0.55 NA)', col: C.green },
          { lbl: t('ch10.cv.e3'), val: F.shortWave.thermalFreq300KTHz, max: F.shortWave.thzGapMaxTHz, disp: '6.25 THz (k_B T)', col: C.violet }
        ];
      }

      const L = 16, R = w - 16, avail = R - L;
      const barArea = avail * 0.50;
      const rowGap = (h - 36) / 3;
      bars.forEach((b, i) => {
        const yLabel = 24 + i * rowGap;
        const yBar = yLabel + 16;
        const bw = clamp((b.val / b.max) * barArea, 8, barArea);
        c.fillStyle = C.ink; c.textAlign = 'left';
        c.fillText(b.lbl, L, yLabel);
        c.fillStyle = 'rgba(43,50,66,.5)';
        c.fillRect(L, yBar, barArea, 18);
        c.fillStyle = b.col;
        c.fillRect(L, yBar, bw, 18);
        const valTxt = b.disp || (fmt(b.val, 3) + b.unit);
        c.fillStyle = b.col; c.textAlign = 'left';
        c.fillText(valTxt, L + bw + 8, yBar + 9);
      });
    }
  });
  function text() {
    const dom = getDom(), F = M.FRONTIER;
    if (dom === 'fibre') {
      const sp = M.ch10.fibreSpeedVsGlass();
      put('#frRec', `${fmt(F.fibre.hollowCoreRecordDbKm, 3)} dB/km · ${fmt(F.fibre.nictMultiCorePbps, 2)} Pbps`);
      put('#frPhy', `${fmt(F.fibre.silicaRayleighFloorDbKm, 2)} dB/km · ${fmt(sp.vacUsKm, 2)} μs/km`);
      put('#frGain', `${fmt(sp.lossRatio, 2)}× · -${fmt(sp.savingPct, 0)}%`);
      put('#frDate', F.asOf);
      putHTML('#frSay', t('ch10.say.fibre'));
    } else if (dom === 'space') {
      put('#frRec', `${fmt(F.fso.dsocPeakMbps)} Mbps · ${fmt(F.wireless.wifi7MaxGbps)} Gbps`);
      put('#frPhy', '1/r² · k_B T');
      put('#frGain', `>${fmt(M.ch10.dsocVsVoyagerBitrateRatio() / 1e6, 1)}M×`);
      put('#frDate', F.asOf);
      putHTML('#frSay', t('ch10.say.space'));
    } else {
      put('#frRec', `${fmt(F.shortWave.euvHalfPitchNm)} nm @ ${fmt(F.shortWave.euvWavelengthNm, 1)} nm`);
      put('#frPhy', `1.22λ/D · ${fmt(F.shortWave.thermalFreq300KTHz, 2)} THz`);
      put('#frGain', `${fmt(F.shortWave.euvHighNA / F.shortWave.euvLowNA, 2)}× NA`);
      put('#frDate', F.asOf);
      putHTML('#frSay', t('ch10.say.short'));
    }
  }
  sim.text = text;
  radios('frDom').forEach(r => r.addEventListener('change', () => { sim.dirty = true; text(); }));
  text();
})();

/* ───────── animation loop ───────── */
applyLang();
let last = performance.now();
function tick(now) {
  const dt = Math.min((now - last) / 1000, 0.1);
  last = now;
  for (const s of sims) {
    if (!s.vis) continue;
    if (s.step) s.step(dt);
    else if (s.dirty) { s.draw(); s.dirty = false; }
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
window.__essayReady = true;
})();
