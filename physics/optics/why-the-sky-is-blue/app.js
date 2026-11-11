/* Why the sky is blue: wiring, drawing, i18n and on-screen gating. All visible text comes from copy.*.js. */
(() => {
'use strict';
const M = window.SkyModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const C = { bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb',
  wb: '#5b8cff', wg: '#62d38a', wr: '#ff6b5b' };
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = M.clamp;

/* ───────── language ───────── */
const LS = 'knowledge-lang';
let memLang = null;
function readLang() { try { return localStorage.getItem(LS); } catch (e) { return memLang; } }
function writeLang(v) { memLang = v; try { localStorage.setItem(LS, v); } catch (e) { /* in-memory fallback */ } }
let lang = readLang();
if (lang !== 'zh' && lang !== 'en') lang = /^zh/i.test(navigator.language || '') ? 'zh' : 'en';
function t(key, vars) {
  let s = (COPY[lang] && COPY[lang][key] != null) ? COPY[lang][key] : (COPY.zh && COPY.zh[key] != null ? COPY.zh[key] : key);
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => vars[k] != null ? vars[k] : m);
  return s;
}
const effLang = () => (COPY[lang] ? lang : 'zh');
// plain digits with a dot and comma grouping in every language (no 万/亿)
function fmt(x, d = 0) {
  if (!isFinite(x)) return '—';
  const v = Math.abs(x) < 0.5 * Math.pow(10, -d) ? 0 : x;
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d, useGrouping: Math.abs(v) >= 10000 });
}
// percentages: one decimal below 10, none above; tiny values keep two significant digits
function fpct(x) { if (x > 0 && x < 0.1) return fmt(x, 2); return fmt(x, x < 10 ? 1 : 0); }
const nm = v => t('unit.nm', { v: fmt(v) });
// a colour as text: dominant wavelength and purity
function colText(dom, purity, purple) {
  if (purity < 2) return t('unit.colWhite', { p: fmt(purity, 0) });
  if (purple) return t('unit.colPurple', { p: fmt(purity, 0) });
  return t('unit.col', { l: fmt(dom), p: fmt(purity, 0) });
}
const css = c => `rgb(${c[0]},${c[1]},${c[2]})`;
const rgbOf = (xyz, bright = 0.85) => M.rgb(xyz, xyz.Y > 0 ? bright * M.SUN_XYZ.Y / xyz.Y : 1); // colour only, fixed brightness

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
{ const m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); }

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
const io = new IntersectionObserver(es => es.forEach(e => { for (const s of sims) if (s.cvs.includes(e.target)) { s.vis = s.cvs.some(cv => cv.__vis = (cv === e.target ? e.isIntersecting : cv.__vis)); s.dirty = true; } }), { rootMargin: '60px' });
function reg(cvs, o) { o.cvs = [].concat(cvs); o.vis = false; o.dirty = true; sims.push(o); o.cvs.forEach(cv => io.observe(cv)); return o; }
window.addEventListener('resize', () => sims.forEach(s => { s.dirty = true; }));
const on = (sel, ev, fn) => { const el = $(sel); el.addEventListener(ev, fn); return el; };
const radios = name => [...document.querySelectorAll(`input[name=${name}]`)];
const radioVal = name => radios(name).find(r => r.checked).value;
const put = (sel, s) => { const e = $(sel); if (e.textContent !== s) e.textContent = s; };
const putHTML = (sel, s) => { const e = $(sel); if (e.__h !== s) { e.innerHTML = s; e.__h = s; } };
const swatch = (sel, col) => { $(sel).style.background = css(col); };

function frame(w, h, m, x0, x1, y0, y1) {
  const L = m[3], R = w - m[1], T = m[0], B = h - m[2];
  return { L, R, T, B, X: x => L + (R - L) * (x - x0) / (x1 - x0), Y: y => B - (B - T) * (y - y0) / (y1 - y0) };
}
function axes(c, f, xLab, yLab) {
  c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.T); c.lineTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
  c.fillStyle = C.mute; c.font = FONT;
  if (yLab) { c.textAlign = 'left'; c.fillText(yLab, f.L + 6, f.T - 10); }
  if (xLab) { c.textAlign = 'right'; c.fillText(xLab, f.R, f.B + 28); }
}
function xTicks(c, f, vals, fmtv, skipLast) {
  c.fillStyle = C.mute; c.textAlign = 'center';
  vals.forEach((v, i) => { if (skipLast && i === vals.length - 1) return; const x = f.X(v); c.fillText(fmtv(v), x, f.B + 11); c.strokeStyle = C.line; c.beginPath(); c.moveTo(x, f.B); c.lineTo(x, f.B + 3); c.stroke(); });
}
function yTicks(c, f, vals, fmtv) {
  c.fillStyle = C.mute; c.textAlign = 'right';
  vals.forEach(v => { const y = f.Y(v); c.fillText(fmtv(v), f.L - 6, y); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, y); c.lineTo(f.R, y); c.stroke(); });
}
function path(c, pts, X, Y, col, lw = 2.2, dash) { c.strokeStyle = col; c.lineWidth = lw; c.lineJoin = 'round'; if (dash) c.setLineDash(dash); c.beginPath(); pts.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](X(p[0]), Y(p[1]))); c.stroke(); c.setLineDash([]); }
function dot(c, x, y, col, r = 4.5) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); }
// a thin rainbow strip under a wavelength axis
function rainbow(c, f, l0, l1, y, hgt = 5) {
  for (let l = Math.max(380, l0); l < Math.min(780, l1); l += 2) { c.fillStyle = css(M.spectralRGB(l + 1)); c.fillRect(f.X(l), y, Math.max(1, f.X(l + 2) - f.X(l)) + 0.5, hgt); }
}
const SPEC_TICKS = [400, 500, 600, 700];

/* ───────── 01 photons through a layer of air ───────── */
(() => {
  const cv = $('#phCv'), sAir = $('#phAir');
  const BANDS = [{ l: 450, col: C.wb }, { l: 550, col: C.wg }, { l: 650, col: C.wr }];
  const r = M.rng(20261111), SPEED = 0.8, RATE = 16; // layer thicknesses per s, photons per s
  let live = [], counts = [0, 0, 0], spawnAcc = 0, staticPaths = null;
  const air = () => +sAir.value;
  function spawn() {
    const k = Math.floor(r() * 3), b = BANDS[k], p = M.photon(M.rayleighTau(b.l) * air(), 90, r, true);
    const x0 = r() * 2.4 - 1.2; p.path.forEach(q => { q[0] += x0; });
    const seg = []; let tot = 0; for (let i = 1; i < p.path.length; i++) { const d = Math.hypot(p.path[i][0] - p.path[i - 1][0], p.path[i][1] - p.path[i - 1][1]); seg.push(d); tot += d; }
    live.push({ k, p, seg, tot, s: 0, fade: 0 });
  }
  function staticSet() { // reduced motion: a fixed sample of finished paths
    const rr = M.rng(99); staticPaths = [];
    for (let i = 0; i < 45; i++) { const k = i % 3, p = M.photon(M.rayleighTau(BANDS[k].l) * air(), 90, rr, true); const x0 = rr() * 2.4 - 1.2; p.path.forEach(q => { q[0] += x0; }); staticPaths.push({ k, p }); }
    const st = BANDS.map(b => M.photonStats(b.l, air(), 90, 3000, 5)); counts = st.map(s => s.sky);
  }
  if (reduce) staticSet();
  function posAt(o) { // point along the path after distance s
    let s = o.s; const pts = [o.p.path[0]];
    for (let i = 0; i < o.seg.length; i++) { const a = o.p.path[i], b = o.p.path[i + 1]; if (s >= o.seg[i]) { pts.push(b); s -= o.seg[i]; } else { const u = o.seg[i] ? s / o.seg[i] : 0; pts.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]); break; } }
    return pts;
  }
  const sim = reg(cv, {
    step(dt) {
      if (reduce) { if (this.dirty) { this.draw(); this.dirty = false; } return; }
      spawnAcc += dt * RATE; while (spawnAcc >= 1) { spawnAcc -= 1; spawn(); }
      for (const o of live) {
        if (o.s < o.tot) { o.s = Math.min(o.tot, o.s + dt * SPEED); if (o.s >= o.tot && o.p.end === 'ground' && o.p.k > 0) { counts[o.k]++; text(); } }
        else o.fade += dt;
      }
      live = live.filter(o => o.fade < 0.8);
      this.draw();
    },
    draw() {
      const { c, w, h } = fit(cv), T = 26, B = h - 30, sc = B - T, cx = w / 2;
      const X = x => cx + x * sc, Y = d => T + d * sc;
      // the layer, tinted by how much air there is
      c.fillStyle = `rgba(99,150,230,${0.05 + 0.06 * Math.min(4, air())})`; c.fillRect(0, T, w, sc);
      c.fillStyle = '#20262f'; c.fillRect(0, B, w, h - B);
      c.strokeStyle = C.line; c.beginPath(); c.moveTo(0, T); c.lineTo(w, T); c.moveTo(0, B); c.lineTo(w, B); c.stroke();
      c.fillStyle = C.mute; c.textAlign = 'left';
      c.fillText(t('ch1.cv.space'), 10, T - 13); c.fillText(t('ch1.cv.ground'), 10, B + 15);
      c.textAlign = 'right'; c.fillText(t('ch1.cv.sun'), w - 10, T - 13);
      c.save(); c.beginPath(); c.rect(0, 0, w, h); c.clip();
      const drawOne = (k, pts, alpha, head) => {
        c.globalAlpha = alpha; c.strokeStyle = BANDS[k].col; c.lineWidth = 1.6; c.beginPath();
        pts.forEach((q, i) => c[i ? 'lineTo' : 'moveTo'](X(q[0]), Y(q[1]))); c.stroke();
        if (head) { const q = pts[pts.length - 1]; dot(c, X(q[0]), Y(q[1]), BANDS[k].col, 3); }
        c.globalAlpha = 1;
      };
      if (reduce && staticPaths) staticPaths.forEach(o => drawOne(o.k, o.p.path, 0.75, false));
      else for (const o of live) drawOne(o.k, posAt(o), Math.max(0, 1 - o.fade / 0.8) * 0.9, o.s < o.tot);
      c.restore();
    }
  });
  function text() {
    const a = air(), s = M.ch1State(a);
    put('#phAiro', t('ch1.unit.air', { v: fmt(a, 1) }));
    put('#phB', fpct(s.b) + '%'); put('#phR', fpct(s.r) + '%'); put('#phRatio', a > 0 ? t('unit.times', { v: fmt(s.ratio, 1) }) : '—');
    put('#phSky', t('ch1.unit.sky', { b: fmt(counts[0]), g: fmt(counts[1]), r: fmt(counts[2]) }));
    const key = M.say.ch1(a);
    putHTML('#phSay', t(key, { b: fpct(s.b), r: fpct(s.r), ratio: fmt(s.ratio, 1), air: fmt(a, 1) }));
  }
  sim.text = text;
  const reset = () => { live = []; counts = [0, 0, 0]; if (reduce) staticSet(); sim.dirty = true; text(); };
  sAir.addEventListener('input', reset);
  on('#phClear', 'click', reset);
  text();
})();

/* ───────── 02 a molecule as a driven oscillator ───────── */
(() => {
  const cv1 = $('#osCv1'), cv2 = $('#osCv2'), sL = $('#osL'), sR = $('#osRes');
  let phase = 0, rings = [], ringAcc = 0;
  const L = () => +sL.value, LR = () => +sR.value;
  const sim = reg([cv1, cv2], {
    step(dt) {
      if (reduce) { if (this.dirty) { this.draw(); this.dirty = false; } return; }
      const f = 0.9 * 550 / L(); // visual cycles per second: shorter waves swing faster
      phase += dt * f * 2 * Math.PI; ringAcc += dt * f;
      while (ringAcc >= 1) { ringAcc -= 1; rings.push(0); }
      rings = rings.map(q => q + dt * 70).filter(q => q < 400);
      this.draw();
    },
    draw() {
      const l = L(), lr = LR(), col = css(M.spectralRGB(l));
      { // left: wave in, electron swinging, waves out
        const { c, w, h } = fit(cv1), mx = w * 0.55, my = h / 2;
        const relMax = M.oscPower(380, lr), rel = M.oscPower(l, lr) / relMax; // brightness of the re-emitted light, 380 nm = 1
        const amp = 16 * (M.oscAmp(l, lr) / M.oscAmp(380, lr)) * (Math.abs(M.oscAmp(380, lr)) > 0 ? 1 : 0);
        const wl = 34 * l / 550, ph = reduce ? 0.6 : phase;
        c.strokeStyle = col; c.lineWidth = 2; c.beginPath();
        for (let x = 0; x <= mx - 22; x += 2) { const y = my + 10 * Math.sin(2 * Math.PI * x / wl - ph); c[x ? 'lineTo' : 'moveTo'](x, y); }
        c.stroke();
        const rr = reduce ? [40, 80, 120, 160] : rings;
        for (const q of rr) { c.globalAlpha = Math.max(0, (0.12 + 0.88 * rel) * (1 - q / 400)); c.strokeStyle = col; c.lineWidth = 1.5 + 2.5 * rel; c.beginPath(); c.arc(mx, my, 24 + q, -1.1, 1.1); c.stroke(); }
        c.globalAlpha = 1;
        c.strokeStyle = C.mute; c.lineWidth = 1; c.beginPath(); c.arc(mx, my, 20, 0, 6.283); c.stroke();
        dot(c, mx, my, C.gold, 5);
        dot(c, mx, my + clamp(amp, -18, 18) * Math.sin(ph), C.cyan, 4);
        c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(t('ch2.cv.in'), 8, 16);
        c.textAlign = 'right'; c.fillText(t('ch2.cv.out'), w - 8, 16);
        c.textAlign = 'center'; c.fillText(t('ch2.cv.mol'), mx, h - 14);
      }
      { // right: scattering strength across the visible, relative to 700 nm
        const { c, w, h } = fit(cv2), top = M.oscRel(380, 700, lr), yMax = Math.max(6, Math.ceil(top * 1.1));
        const f = frame(w, h, [28, 14, 40, 40], 380, 780, 0, yMax);
        const ys = []; const stp = yMax > 30 ? 10 : yMax > 12 ? 5 : 1; for (let v = 0; v <= yMax; v += stp) ys.push(v);
        yTicks(c, f, ys, v => fmt(v)); axes(c, f, t('ch2.cv.x'), t('ch2.cv.y'));
        xTicks(c, f, SPEC_TICKS, v => fmt(v)); rainbow(c, f, 380, 780, f.B + 15, 3);
        const pure = [], real = []; for (let q = 380; q <= 780; q += 4) { pure.push([q, Math.pow(700 / q, 4)]); real.push([q, M.oscRel(q, 700, lr)]); }
        path(c, pure, f.X, f.Y, C.mute, 1.4, [5, 4]);
        path(c, real, f.X, f.Y, C.cyan, 2.4);
        dot(c, f.X(l), f.Y(M.oscRel(l, 700, lr)), C.gold, 5);
      }
    }
  });
  function text() {
    const l = L(), lr = LR(), s = M.ch2State(l, lr);
    put('#osLo', nm(l)); put('#osReso', nm(lr));
    put('#osRel', t('unit.times', { v: fmt(s.rel, s.rel < 10 ? 2 : 1) })); put('#osHalf', t('unit.times', { v: fmt(s.blueRed, 2) })); put('#osExp', fmt(s.exp, 2));
    const key = M.say.ch2(l, s);
    putHTML('#osSay', t(key, { l: fmt(l), rel: fmt(s.rel, s.rel < 10 ? 2 : 1), lr: fmt(lr), exp: fmt(s.exp, 2) }));
  }
  sim.text = text;
  [sL, sR].forEach(e => e.addEventListener('input', () => { sim.dirty = true; text(); }));
  text();
})();

/* ───────── 03 the spectrum of sky light ───────── */
(() => {
  const cv = $('#spCv'), sT = $('#spT');
  const sim = reg(cv, {
    draw() {
      const T = +sT.value, { c, w, h } = fit(cv), f = frame(w, h, [28, 14, 40, 40], 200, 900, 0, 1.12);
      c.fillStyle = 'rgba(179,157,251,.12)'; c.fillRect(f.X(200), f.T, f.X(380) - f.X(200), f.B - f.T);
      c.fillStyle = C.violet; c.textAlign = 'left'; c.fillText(t('ch3.cv.uv'), f.X(200) + 6, f.T + 10);
      yTicks(c, f, [0, 0.5, 1], v => fmt(v, 1)); axes(c, f, t('ch3.cv.x'), t('ch3.cv.y'));
      xTicks(c, f, [300, 400, 500, 600, 700, 800], v => fmt(v)); rainbow(c, f, 380, 780, f.B + 15, 3);
      const sun = l => M.planck(l, T), sky = M.scattered(T, 4);
      const norm = g => { let m = 0; for (let l = 200; l <= 900; l += 2) m = Math.max(m, g(l)); return m; };
      const ns = norm(sun), nk = norm(sky), a = [], b = [];
      for (let l = 200; l <= 900; l += 3) { a.push([l, sun(l) / ns]); b.push([l, sky(l) / nk]); }
      path(c, a, f.X, f.Y, C.gold, 2.2); path(c, b, f.X, f.Y, C.cyan, 2.4);
      const st = M.ch3State(T);
      if (st.sunPeak <= 900) dot(c, f.X(st.sunPeak), f.Y(1), C.gold, 4);
      if (st.skyPeak >= 200 && st.skyPeak <= 900) dot(c, f.X(st.skyPeak), f.Y(1), C.cyan, 4);
    }
  });
  function peakText(v) { return v < 380 ? t('ch3.unit.uv', { v: fmt(v) }) : v > 780 ? t('ch3.unit.ir', { v: fmt(v) }) : nm(v); }
  function text() {
    const T = +sT.value, s = M.ch3State(T);
    put('#spTo', t('unit.k', { v: fmt(T) }));
    put('#spSunPk', peakText(s.sunPeak)); put('#spSkyPk', peakText(s.skyPeak));
    put('#spViolet', fmt(s.violet) + '%'); put('#spBlue', fmt(s.blue) + '%');
    const key = M.say.ch3(s);
    putHTML('#spSay', t(key, { T: fmt(T), sp: fmt(s.sunPeak), kp: fmt(s.skyPeak), v: fmt(s.violet), bl: fmt(s.blue) }));
  }
  sim.text = text;
  sT.addEventListener('input', () => { sim.dirty = true; text(); });
  on('#spSun', 'click', () => { sT.value = M.T_SUN; sim.dirty = true; text(); });
  text();
})();

/* ───────── 04 what the eye makes of it ───────── */
(() => {
  const cv1 = $('#eyCv1'), cv2 = $('#eyCv2'), sN = $('#eyN'), sC = $('#eyCut');
  let st = null;
  const recalc = () => { st = M.ch4State(+sN.value, +sC.value); };
  recalc();
  const sim = reg([cv1, cv2], {
    draw() {
      const n = +sN.value, cut = +sC.value;
      { // the light and what each of the eye's three curves picks up from it
        const { c, w, h } = fit(cv1), f = frame(w, h, [28, 14, 40, 40], 380, 780, 0, 1.1);
        yTicks(c, f, [0, 0.5, 1], v => fmt(v, 1)); axes(c, f, t('ch4.cv.x'), t('ch4.cv.y'));
        xTicks(c, f, SPEC_TICKS, v => fmt(v)); rainbow(c, f, 380, 780, f.B + 15, 3);
        if (cut > 380) { c.fillStyle = 'rgba(240,122,109,.13)'; c.fillRect(f.X(380), f.T, f.X(cut) - f.X(380), f.B - f.T); }
        const s = M.scattered(M.T_SUN, n, cut); let ms = 0, mp = 0;
        for (let l = 380; l <= 780; l += 2) { ms = Math.max(ms, s(l)); const q = M.cmf(l); mp = Math.max(mp, s(l) * q.x, s(l) * q.y, s(l) * q.z); }
        const A = [], X = [], Yy = [], Z = [];
        for (let l = 380; l <= 780; l += 2) { const q = M.cmf(l), v = s(l); A.push([l, ms ? v / ms : 0]); X.push([l, mp ? v * q.x / mp : 0]); Yy.push([l, mp ? v * q.y / mp : 0]); Z.push([l, mp ? v * q.z / mp : 0]); }
        c.fillStyle = 'rgba(163,170,184,.16)'; c.beginPath(); c.moveTo(f.X(380), f.B); A.forEach(p => c.lineTo(f.X(p[0]), f.Y(p[1]))); c.lineTo(f.X(780), f.B); c.fill();
        path(c, A, f.X, f.Y, C.mute, 1.4);
        path(c, X, f.X, f.Y, C.wr, 2); path(c, Yy, f.X, f.Y, C.wg, 2); path(c, Z, f.X, f.Y, C.wb, 2);
      }
      { // chromaticity diagram
        const { c, w, h } = fit(cv2), side = Math.min(w - 50, h - 52), ox = 38 + (w - 50 - side) / 2, oy = 14;
        const X = x => ox + side * x / 0.8, Y = y => oy + side - side * y / 0.9;
        c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(X(0), Y(0.9)); c.lineTo(X(0), Y(0)); c.lineTo(X(0.8), Y(0)); c.stroke();
        c.fillStyle = C.mute; c.textAlign = 'center';
        [0, 0.4, 0.8].forEach(v => c.fillText(fmt(v, 1), X(v), Y(0) + 11)); c.textAlign = 'right'; [0, 0.4, 0.8].forEach(v => { if (v <= 0.9) c.fillText(fmt(v, 1), X(0) - 5, Y(v)); });
        c.textAlign = 'right'; c.fillText('x', X(0.8), Y(0) + 26); c.textAlign = 'right'; c.fillText('y', X(0) - 8, Y(0.6)); // between the 0.4 and 0.8 ticks, clear of the 520 label
        const loc = M.LOCUS; c.lineWidth = 3;
        for (let i = 0; i < loc.length - 1; i += 2) { c.strokeStyle = css(M.spectralRGB(loc[i].l)); c.beginPath(); c.moveTo(X(loc[i].x), Y(loc[i].y)); c.lineTo(X(loc[Math.min(loc.length - 1, i + 2)].x), Y(loc[Math.min(loc.length - 1, i + 2)].y)); c.stroke(); }
        c.strokeStyle = C.line; c.setLineDash([4, 4]); c.lineWidth = 1; c.beginPath(); c.moveTo(X(loc[0].x), Y(loc[0].y)); c.lineTo(X(loc[loc.length - 1].x), Y(loc[loc.length - 1].y)); c.stroke(); c.setLineDash([]);
        c.fillStyle = C.mute;
        for (const L of [460, 490, 520, 580]) { const q = loc.find(p => p.l === L), ux = X(q.x) - X(M.SUN_XY.x), uy = Y(q.y) - Y(M.SUN_XY.y), d = Math.hypot(ux, uy) || 1; c.textAlign = ux < 0 ? 'right' : 'left'; c.fillText(fmt(L), X(q.x) + 12 * ux / d, Y(q.y) + 12 * uy / d); }
        const W = M.SUN_XY, P = M.xy(st.xyz);
        if (isFinite(st.dom) && !st.purple) { const q = loc.reduce((a, b) => Math.abs(b.l - st.dom) < Math.abs(a.l - st.dom) ? b : a); c.strokeStyle = C.cyan; c.lineWidth = 1.2; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(X(W.x), Y(W.y)); c.lineTo(X(q.x), Y(q.y)); c.stroke(); c.setLineDash([]); }
        const v = loc.find(p => p.l === 410); dot(c, X(v.x), Y(v.y), C.violet, 5);
        c.fillStyle = C.violet; c.textAlign = 'left'; c.fillText(t('ch4.cv.violet'), X(v.x) + 9, Y(v.y) + 2);
        dot(c, X(W.x), Y(W.y), C.ink, 4.5); c.fillStyle = C.ink; c.textAlign = 'left'; c.fillText(t('ch4.cv.sun'), X(W.x) + 9, Y(W.y) - 4);
        dot(c, X(P.x), Y(P.y), css(rgbOf(st.xyz)), 6); c.strokeStyle = C.ink; c.lineWidth = 1; c.beginPath(); c.arc(X(P.x), Y(P.y), 6, 0, 6.283); c.stroke();
        c.fillStyle = C.cyan; c.textAlign = 'right'; c.fillText(t('ch4.cv.sky'), X(P.x) - 10, Y(P.y) + 12);
      }
    }
  });
  function text() {
    const n = +sN.value, cut = +sC.value, s = st;
    put('#eyNo', fmt(n, 1)); put('#eyCuto', cut <= 380 ? t('ch4.unit.nocut') : nm(cut));
    put('#eyDom', s.purity < 2 ? '—' : nm(s.dom)); put('#eyPur', fmt(s.purity) + '%');
    put('#eyVE', fmt(s.violetEnergy) + '%'); put('#eyVY', fmt(s.violetBright, 1) + '%');
    swatch('#eySkySw', rgbOf(s.xyz)); swatch('#eyVioSw', M.spectralRGB(410));
    const key = M.say.ch4(s, cut);
    putHTML('#eySay', t(key, { n: fmt(n, 1), d: fmt(s.dom), d0: fmt(s.dom0), p: fmt(s.purity), ve: fmt(s.violetEnergy), vy: fmt(s.violetBright, 1), cut: fmt(cut) }));
  }
  sim.text = text;
  [sN, sC].forEach(e => e.addEventListener('input', () => { recalc(); sim.dirty = true; text(); }));
  text();
})();

/* ───────── 05 the setting sun ───────── */
(() => {
  const cv1 = $('#snCv1'), cv2 = $('#snCv2'), sE = $('#snE'), bPlay = $('#snPlay');
  let playing = false, pos = null; // pos: the sun's height while playing, kept finer than the slider's 0.5° step
  const E = () => (playing && pos != null ? pos : +sE.value);
  const sim = reg([cv1, cv2], {
    step(dt) {
      if (playing) {
        let e = E(); e -= dt * (e > 12 ? 7 : 2); // degrees per second, slower near the horizon
        if (e <= 0) { e = 0; playing = false; bPlay.setAttribute('aria-pressed', 'false'); }
        pos = e; sE.value = e; this.dirty = true; text();
      }
      if (this.dirty) { this.draw(); this.dirty = false; }
    },
    draw() {
      const e = E(), st = M.ch5State(e), sunCol = rgbOf(st.xyz, 0.95);
      { // geometry (atmosphere drawn far thicker than it is)
        const { c, w, h } = fit(cv1), R = Math.max(w, h) * 1.25, cx = w * 0.3, cy = h - 34 + R, H = h * 0.42;
        c.fillStyle = 'rgba(99,150,230,.16)'; c.beginPath(); c.arc(cx, cy, R + H, 0, 6.283); c.fill();
        c.fillStyle = '#20262f'; c.beginPath(); c.arc(cx, cy, R, 0, 6.283); c.fill();
        const ox = cx, oy = cy - R, a = e * Math.PI / 180, dx = Math.cos(a), dy = -Math.sin(a);
        // distance to the top of the shell along the ray: |o + s d − c| = R + H
        const px = ox - cx, py = oy - cy, bq = px * dx + py * dy, cq = px * px + py * py - (R + H) * (R + H), s = -bq + Math.sqrt(bq * bq - cq);
        // the sun itself, beyond the air, along the same line (kept inside the canvas)
        let k = 1; const fx = ox + dx * (s + 22), fy = oy + dy * (s + 22);
        if (fx > w - 12) k = Math.min(k, (w - 12 - ox) / (fx - ox)); if (fy < 12) k = Math.min(k, (oy - 12) / (oy - fy));
        const sx = ox + (fx - ox) * k, sy = oy + (fy - oy) * k;
        // the ray stops at the sun; where the canvas is too narrow, the top of the air is off to the right
        const ls = Math.min(s, (s + 22) * k), ex = ox + dx * ls, ey = oy + dy * ls;
        const g = c.createLinearGradient(ex, ey, ox, oy); g.addColorStop(0, css(M.rgb(M.SUN_XYZ, 0.95))); g.addColorStop(1, css(sunCol));
        c.strokeStyle = g; c.lineWidth = 4; c.beginPath(); c.moveTo(ex, ey); c.lineTo(ox, oy); c.stroke();
        dot(c, sx, sy, css(M.rgb(M.SUN_XYZ, 0.95)), 9);
        c.strokeStyle = C.mute; c.setLineDash([4, 4]); c.lineWidth = 1; c.beginPath(); c.moveTo(ox, oy); c.lineTo(ox, oy - H); c.stroke(); c.setLineDash([]);
        dot(c, ox, oy, C.ink, 4);
        c.fillStyle = C.mute; c.textAlign = 'center'; c.fillText(t('ch5.cv.you'), ox, oy + 15);
        // the sun as you see it, top left
        dot(c, 26, 28, css(sunCol), 14);
        c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(t('ch5.cv.sun'), 48, 28);
      }
      { // share of each wavelength that gets through
        const { c, w, h } = fit(cv2), f = frame(w, h, [28, 14, 40, 40], 380, 780, 0, 100);
        yTicks(c, f, [0, 50, 100], v => fmt(v) + '%'); axes(c, f, t('ch5.cv.x'), t('ch5.cv.y'));
        xTicks(c, f, SPEC_TICKS, v => fmt(v));
        for (let l = 380; l < 780; l += 5) { const v = 100 * M.transmit(l + 2.5, e); c.fillStyle = css(M.spectralRGB(l + 2.5)); c.globalAlpha = 0.85; c.fillRect(f.X(l), f.Y(v), f.X(l + 5) - f.X(l) + 0.5, f.B - f.Y(v)); }
        c.globalAlpha = 1;
      }
    }
  });
  function text() {
    const e = E(), s = M.ch5State(e);
    put('#snEo', t('unit.deg', { v: fmt(e, 1) }));
    put('#snM', t('unit.times', { v: fmt(s.m, 1) })); put('#snB', fpct(s.b) + '%'); put('#snR', fpct(s.r) + '%');
    put('#snDom', colText(s.dom, s.purity, s.purple));
    const key = M.say.ch5(s);
    putHTML('#snSay', t(key, { e: fmt(e, 1), m: fmt(s.m, 1), b: fpct(s.b), r: fpct(s.r), d: fmt(s.dom), p: fmt(s.purity) }));
    put('#snPlay', t(playing ? 'ch5.btn.stop' : 'ch5.btn.play'));
  }
  sim.text = text;
  sE.addEventListener('input', () => { playing = false; bPlay.setAttribute('aria-pressed', 'false'); sim.dirty = true; text(); });
  bPlay.addEventListener('click', () => {
    if (playing) { playing = false; }
    else if (reduce) { sE.value = 0; }
    else { if (E() <= 0) sE.value = 60; pos = +sE.value; playing = true; }
    bPlay.setAttribute('aria-pressed', String(playing)); sim.dirty = true; text();
  });
  text();
})();

/* ───────── sky panorama (chapters 6 and 8) ───────── */
const COLS = 120, ROWS = 36, earthMax = {};
function earthClearMax(se) { if (earthMax[se] == null) earthMax[se] = M.skyGrid(se, { air: 1 }, COLS, ROWS).maxY; return earthMax[se]; }
function drawPano(cv, se, atm, grid, sunXYZ) {
  const { c, w, h } = fit(cv), L = 8, R = w - 8, T = 22, B = h - 26;
  const exposure = 0.92 * M.SUN_XYZ.Y / Math.max(grid.maxY, earthClearMax(se));
  const off = document.createElement('canvas'); off.width = COLS; off.height = ROWS;
  const oc = off.getContext('2d'), img = oc.createImageData(COLS, ROWS);
  for (let k = 0; k < grid.cells.length; k++) { const q = M.rgb(grid.cells[k], exposure); img.data[4 * k] = q[0]; img.data[4 * k + 1] = q[1]; img.data[4 * k + 2] = q[2]; img.data[4 * k + 3] = 255; }
  oc.putImageData(img, 0, 0);
  c.imageSmoothingEnabled = true; c.drawImage(off, L, T, R - L, B - T);
  // the sun
  const sx = (L + R) / 2, sy = B - (B - T) * se / 90;
  c.save(); c.beginPath(); c.rect(L, T, R - L, B - T); c.clip(); dot(c, sx, sy, css(rgbOf(sunXYZ, 1)), 7); c.restore();
  c.fillStyle = C.mute; c.textAlign = 'center';
  c.fillText(t('pano.zenith'), sx, T - 11);
  c.fillText(t('pano.sun'), sx, B + 13);
  c.textAlign = 'left'; c.fillText(t('pano.away'), L, B + 13);
  c.textAlign = 'right'; c.fillText(t('pano.away'), R, B + 13);
}

/* ───────── 06 the whole sky ───────── */
(() => {
  const cv = $('#skCv'), sE = $('#skE');
  let grid = null, gridFor = null;
  const sim = reg(cv, {
    draw() {
      const se = +sE.value;
      if (gridFor !== se) { grid = M.skyGrid(se, { air: 1 }, COLS, ROWS); gridFor = se; }
      drawPano(cv, se, { air: 1 }, grid, M.ch5State(se).xyz);
    }
  });
  function text() {
    const se = +sE.value, s = M.ch6State(se);
    put('#skEo', t('unit.deg', { v: fmt(se) }));
    put('#skZen', colText(s.zen.dom, s.zen.purity, s.zen.purple)); put('#skHor', colText(s.hor.dom, s.hor.purity, s.hor.purple));
    put('#skK', t('unit.times', { v: fmt(s.k, 1) })); put('#skZY', fmt(s.zenRel) + '%');
    const key = M.say.ch6(s);
    putHTML('#skSay', t(key, { e: fmt(se), zl: fmt(s.zen.dom), zp: fmt(s.zen.purity), hl: fmt(s.hor.dom), hp: fmt(s.hor.purity), k: fmt(s.k, 1), np: fmt(s.noonPurity) }));
  }
  sim.text = text;
  sE.addEventListener('input', () => { sim.dirty = true; text(); });
  text();
})();

/* ───────── 07 droplets of any size ───────── */
(() => {
  const cv1 = $('#miCv1'), cv2 = $('#miCv2'), sR = $('#miR');
  const cache = {}; const state = v => (cache[v] = cache[v] || M.ch7State(M.radiusOf(v)));
  let overview = null; // Q_ext against radius, for blue and red
  function buildOverview() {
    overview = { b: [], r: [] };
    for (let v = 0; v <= 66; v++) { const r = M.radiusOf(v); overview.b.push([v, M.mieAvg(r, 450, M.WATER).qext]); overview.r.push([v, M.mieAvg(r, 650, M.WATER).qext]); }
  }
  const sim = reg([cv1, cv2], {
    draw() {
      const v = +sR.value, s = state(v);
      { // scattering across the visible, relative to 550 nm
        const { c, w, h } = fit(cv1), f = frame(w, h, [28, 14, 40, 40], 380, 780, 0, 4.5);
        yTicks(c, f, [0, 1, 2, 3, 4], q => fmt(q)); axes(c, f, t('ch7.cv.x1'), t('ch7.cv.y1'));
        xTicks(c, f, SPEC_TICKS, q => fmt(q)); rainbow(c, f, 380, 780, f.B + 15, 3);
        const ref = []; for (let l = 380; l <= 780; l += 5) ref.push([l, Math.pow(550 / l, 4)]);
        path(c, ref, f.X, f.Y, C.mute, 1.3, [5, 4]);
        const q550 = s.qs[M.GRID.indexOf(550)].qsca, pts = M.GRID.map((l, i) => [l, Math.min(4.5, s.qs[i].qsca / q550)]);
        path(c, pts, f.X, f.Y, C.cyan, 2.4);
      }
      { // extinction efficiency against size
        if (!overview) buildOverview();
        const { c, w, h } = fit(cv2), f = frame(w, h, [28, 14, 40, 40], 0, 66, 0, 4.5);
        yTicks(c, f, [0, 1, 2, 3, 4], q => fmt(q)); axes(c, f, t('ch7.cv.x2'), t('ch7.cv.y2'));
        xTicks(c, f, [0, 20, 40, 60], q => { const r = M.radiusOf(q); return r < 1 ? fmt(r, 2) : fmt(r); });
        path(c, overview.b, f.X, f.Y, C.wb, 2); path(c, overview.r, f.X, f.Y, C.wr, 2);
        c.strokeStyle = C.gold; c.lineWidth = 2; c.beginPath(); c.moveTo(f.X(v), f.T); c.lineTo(f.X(v), f.B); c.stroke();
      }
    }
  });
  function text() {
    const v = +sR.value, r = M.radiusOf(v), s = state(v);
    put('#miRo', t('unit.um', { v: fmt(r, r < 0.1 ? 3 : r < 1 ? 2 : 1) }));
    put('#miX', fmt(s.x550, s.x550 < 10 ? 2 : 0)); put('#miRatio', t('unit.times', { v: fmt(s.ratio, 2) })); put('#miQ', fmt(s.q550, 2));
    put('#miSun', colText(s.sunDom, s.sunPurity, s.sunPurple));
    swatch('#miScSw', rgbOf(s.scat)); swatch('#miSunSw', rgbOf(s.sun));
    const key = M.say.ch7(s);
    putHTML('#miSay', t(key, { r: fmt(r, r < 0.1 ? 3 : r < 1 ? 2 : 1), ratio: fmt(s.ratio, 2), x: fmt(s.x550, 1), sd: fmt(s.sunDom) }));
  }
  sim.text = text;
  sR.addEventListener('input', () => { sim.dirty = true; text(); });
  text();
})();

/* ───────── 08 another planet's sky ───────── */
(() => {
  const cv = $('#maCv'), sD = $('#maDust'), sE = $('#maE'), cA = $('#maAbs');
  let grid = null, key0 = null, st = null;
  const args = () => [radioVal('maP'), +sD.value, cA.checked, +sE.value];
  const recalc = () => { st = M.ch8State(...args()); };
  const sim = reg(cv, {
    draw() {
      const a = args(), k = a.join('|');
      if (key0 !== k) { grid = M.skyGrid(a[3], M.planetAtm(a[0], a[1], a[2]), COLS, ROWS); key0 = k; }
      drawPano(cv, a[3], st.atm, grid, st.sun);
    }
  });
  function text() {
    if (!st) recalc();
    const [planet, dust, abs, se] = args(), s = st;
    put('#maDusto', fmt(dust, 2)); put('#maEo', t('unit.deg', { v: fmt(se) }));
    put('#maZen', colText(s.zen.dom, s.zen.purity, s.zen.purple)); put('#maNear', colText(s.near.dom, s.near.purity, s.near.purple));
    put('#maY', fmt(s.yRel, s.yRel < 10 ? 1 : 0) + '%'); put('#maSun', colText(s.sunDom, s.sunPurity, s.sunPurple));
    const z = s.zen, pick = M.say.ch8(planet, dust, abs, s);
    const vars = { zl: fmt(z.dom), zp: fmt(z.purity), y: fmt(s.yRel, s.yRel < 10 ? 1 : 0), nl: fmt(s.near.dom) };
    let html = t(pick.key, vars);
    if (pick.near) html += t('say.join') + t('ch8.say.nearblue', vars);
    putHTML('#maSay', html);
  }
  sim.text = text;
  const redo = () => { recalc(); sim.dirty = true; text(); };
  [sD, sE].forEach(e => e.addEventListener('input', redo));
  cA.addEventListener('change', redo);
  radios('maP').forEach(r => r.addEventListener('change', redo));
  text();
})();

/* ───────── 09 photons scattered more than once ───────── */
(() => {
  const cv = $('#msCv'), sE = $('#msE'), sA = $('#msAir');
  let st = null, stFor = null;
  const get = () => { const k = sE.value + '|' + sA.value; if (stFor !== k) { st = M.ch9State(+sE.value, +sA.value); stFor = k; } return st; };
  const sim = reg(cv, {
    draw() {
      const s = get(), { c, w, h } = fit(cv), labW = 64, f = frame(w, h, [16, 14, 40, labW + 8], 0, 100, 0, 3);
      xTicks(c, f, [0, 25, 50, 75, 100], v => fmt(v) + '%'); axes(c, f, t('ch9.cv.x'), '');
      const cols = [C.wb, C.wg, C.wr], names = ['ch9.cv.b', 'ch9.cv.g', 'ch9.cv.r'];
      s.st.forEach((q, i) => {
        const y0 = f.Y(3 - i) + 8, bh = (f.B - f.T) / 3 - 16; let x = 0;
        [q.byK[1], q.byK[2], q.byK[3]].forEach((n, j) => {
          const share = 100 * n / Math.max(1, q.sky); c.fillStyle = cols[i]; c.globalAlpha = [0.95, 0.6, 0.3][j];
          c.fillRect(f.X(x), y0, f.X(x + share) - f.X(x), bh); x += share;
        });
        c.globalAlpha = 1; c.fillStyle = C.mute; c.textAlign = 'right'; c.fillText(t(names[i]), f.L - 8, y0 + bh / 2);
      });
    }
  });
  function text() {
    const s = get();
    put('#msEo', t('unit.deg', { v: fmt(+sE.value) })); put('#msAiro', t('ch1.unit.air', { v: fmt(+sA.value, 1) }));
    put('#msB', fmt(s.b) + '%'); put('#msR', fmt(s.r) + '%'); put('#msBR', t('unit.times', { v: fmt(s.br, 1) }));
    putHTML('#msSay', t('ch9.say', { e: fmt(+sE.value), a: fmt(+sA.value, 1), mb: fmt(s.b), mr: fmt(s.r), br: fmt(s.br, 1) }));
  }
  sim.text = text;
  [sE, sA].forEach(e => e.addEventListener('input', () => { sim.dirty = true; text(); }));
  text();
})();

/* ───────── loop ───────── */
applyLang();
let last = performance.now();
function tick(now) {
  const dt = Math.min((now - last) / 1000, 0.1); last = now;
  for (const s of sims) {
    if (!s.vis) continue;
    if (s.step) s.step(dt); else if (s.dirty) { s.draw(); s.dirty = false; }
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
window.__essayReady = true;
})();
