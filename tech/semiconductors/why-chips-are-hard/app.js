/* Why chips are hard: wiring, drawing, i18n and on-screen gating. All visible text comes from copy.*.js. */
(() => {
'use strict';
const M = window.ChipModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const C = { bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', copper: '#d48a4e', dimfill: '#3a4254' };
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

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
// plain text of a copy value (for canvas labels that may carry <sub>)
const tt = (key, vars) => t(key, vars).replace(/<[^>]+>/g, '');
function fmt(x, d = 0) {
  if (!isFinite(x)) return '—';
  const v = Math.abs(x) < 0.5 * Math.pow(10, -d) ? 0 : x;
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}
// three significant figures, plain notation for 0.01 ≤ |x| < 1e5
function sig(x, n = 3) {
  if (!isFinite(x)) return '—';
  if (x === 0) return '0';
  const e = Math.floor(Math.log10(Math.abs(x)));
  if (e >= 5 || e < -2) return sci(x, n - 1);
  const d = Math.max(0, n - 1 - e);
  return fmt(x, d);
}
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
// scientific notation as m×10ⁿ (language-neutral)
function sci(x, d = 1) {
  if (!isFinite(x)) return '—';
  if (x === 0) return '0';
  let e = Math.floor(Math.log10(Math.abs(x))), m = x / Math.pow(10, e);
  if (+m.toFixed(d) >= 10) { m /= 10; e++; }
  const sup = String(e).split('').map(c => SUP[c]).join('');
  return (e === 0 ? fmt(m, d) : fmt(m, d) + '×10' + sup);
}
const pow10 = e => '10' + String(e).split('').map(c => SUP[c]).join('');

function applyLang() {
  document.documentElement.lang = effLang() === 'zh' ? 'zh-CN' : 'en';
  document.title = t('doc.title');
  const md = document.querySelector('meta[name=description]');
  if (md) md.content = t('doc.desc');
  document.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(e => { e.innerHTML = t(e.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-aria]').forEach(e => { e.setAttribute('aria-label', tt(e.dataset.i18nAria)); });
  document.querySelectorAll('#langToggle button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  // ranges take their accessible name from their visible label
  document.querySelectorAll('label.rng').forEach(l => { const i = l.querySelector('input'), s = l.querySelector('span'); if (i && s) i.setAttribute('aria-label', s.textContent); });
  sims.forEach(s => { s.dirty = true; if (s.text) s.text(); });
  if (window.__frRender) window.__frRender();
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
const io = new IntersectionObserver(es => es.forEach(e => { for (const s of sims) if (s.cvs.includes(e.target)) { e.target.__vis = e.isIntersecting; s.vis = s.cvs.some(cv => cv.__vis); s.dirty = true; } }), { rootMargin: '60px' });
function reg(cvs, o) { o.cvs = [].concat(cvs); o.vis = false; o.dirty = true; sims.push(o); o.cvs.forEach(cv => io.observe(cv)); return o; }
window.addEventListener('resize', () => sims.forEach(s => { s.dirty = true; }));
const radios = name => [...document.querySelectorAll(`input[name=${name}]`)];
const radioVal = name => { const r = radios(name).find(x => x.checked); return r ? r.value : null; };
const put = (sel, s) => { const e = $(sel); if (e.textContent !== s) e.textContent = s; };
const putHTML = (sel, s) => { const e = $(sel); if (e.__h !== s) { e.innerHTML = s; e.__h = s; } };
const val = id => +document.getElementById(id).value;

/* plot helpers */
function frame(w, h, m, x0, x1, y0, y1) {
  const L = m[3], R = w - m[1], T = m[0], B = h - m[2];
  return { L, R, T, B, x0, x1, y0, y1, X: x => L + (R - L) * (x - x0) / (x1 - x0), Y: y => B - (B - T) * (y - y0) / (y1 - y0) };
}
function axes(c, f, xLab, yLab) {
  c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.T); c.lineTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
  c.fillStyle = C.mute; c.font = FONT;
  if (yLab) { c.textAlign = 'left'; c.fillText(yLab, f.L + 6, f.T - 10); }
  if (xLab) { c.textAlign = 'right'; c.fillText(xLab, f.R, f.B + 26); }
}
function xTicks(c, f, vals, lab, skipLast) {
  c.fillStyle = C.mute; c.textAlign = 'center';
  vals.forEach((v, i) => { const x = f.X(v); c.strokeStyle = C.line; c.beginPath(); c.moveTo(x, f.B); c.lineTo(x, f.B + 3); c.stroke(); if (skipLast && i === vals.length - 1) return; c.fillText(lab(v), x, f.B + 11); });
}
function yTicks(c, f, vals, lab) {
  c.fillStyle = C.mute; c.textAlign = 'right';
  vals.forEach(v => { const y = f.Y(v); c.fillText(lab(v), f.L - 6, y); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, y); c.lineTo(f.R, y); c.stroke(); });
}
function path(c, pts, X, Y, col, lw = 2.2) { c.strokeStyle = col; c.lineWidth = lw; c.lineJoin = 'round'; c.beginPath(); let on = false; for (const p of pts) { if (!isFinite(p[1])) { on = false; continue; } const x = X(p[0]), y = Y(p[1]); if (on) c.lineTo(x, y); else { c.moveTo(x, y); on = true; } } c.stroke(); }
function clipF(c, f) { c.save(); c.beginPath(); c.rect(f.L, f.T - 1, f.R - f.L, f.B - f.T + 2); c.clip(); }
function dot(c, x, y, col, r = 4.5) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); }
function vline(c, f, x, col, dash = [5, 4]) { c.strokeStyle = col; c.lineWidth = 1.3; c.setLineDash(dash); c.beginPath(); c.moveTo(f.X(x), f.T); c.lineTo(f.X(x), f.B); c.stroke(); c.setLineDash([]); }
function hline(c, f, y, col, dash = [5, 4]) { c.strokeStyle = col; c.lineWidth = 1.3; c.setLineDash(dash); c.beginPath(); c.moveTo(f.L, f.Y(y)); c.lineTo(f.R, f.Y(y)); c.stroke(); c.setLineDash([]); }
const decLab = e => pow10(e);
function logTicks(lo, hi, every) { const out = []; for (let e = Math.ceil(lo); e <= Math.floor(hi); e++) if ((e - Math.ceil(lo)) % every === 0) out.push(e); return out; }
// whether a text label fits between two x positions
const fits = (c, s, room) => c.measureText(s).width + 6 <= room;

/* ───────── 01 carriers ───────── */
(() => {
  const cv = $('#c1Cv'), cv2 = $('#c1Cv2'), CR = M.carriers;
  const p = () => { const v = val('c1N'); return { T: val('c1T'), N: v <= 12.001 ? 0 : Math.pow(10, v), type: radioVal('c1Type') }; };
  const sim = reg([cv, cv2], {
    draw() {
      const P = p(), Eg = CR.Eg(P.T), mid = Eg / 2, ei = mid + CR.eiMinusMid(P.T), ef = ei + CR.efMinusEi(P.T, P.N, P.type);
      { // band diagram with the Fermi–Dirac occupation drawn sideways
        const { c, w, h } = fit(cv), fw = Math.min(150, w * 0.32), bandR = w - fw - 24, lm = 12 + Math.max(...['ch1.cv.Ec', 'ch1.cv.Ev', 'ch1.cv.Ef'].map(k => c.measureText(tt(k)).width)), f = frame(w, h, [18, 10, 14, lm], 0, 1, -0.25, Eg + 0.25);
        const yEc = f.Y(Eg), yEv = f.Y(0);
        c.fillStyle = 'rgba(99,199,230,.10)'; c.fillRect(f.L, f.T, bandR - f.L, yEc - f.T);
        c.fillStyle = 'rgba(240,122,109,.10)'; c.fillRect(f.L, yEv, bandR - f.L, f.B - yEv);
        c.strokeStyle = C.ink; c.lineWidth = 2; c.beginPath(); c.moveTo(f.L, yEc); c.lineTo(bandR, yEc); c.moveTo(f.L, yEv); c.lineTo(bandR, yEv); c.stroke();
        c.strokeStyle = C.mute; c.setLineDash([3, 4]); c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.Y(ei)); c.lineTo(bandR, f.Y(ei)); c.stroke(); c.setLineDash([]);
        const yEf = f.Y(Math.max(-0.2, Math.min(Eg + 0.2, ef)));
        c.strokeStyle = C.gold; c.lineWidth = 2; c.beginPath(); c.moveTo(f.L, yEf); c.lineTo(bandR, yEf); c.stroke();
        c.fillStyle = C.mute; c.textAlign = 'right';
        c.fillText(tt('ch1.cv.Ec'), f.L - 6, yEc); c.fillText(tt('ch1.cv.Ev'), f.L - 6, yEv);
        c.fillStyle = C.gold;
        const efLabY = Math.abs(yEf - yEc) < 14 ? yEc + 14 : Math.abs(yEf - yEv) < 14 ? yEv - 14 : yEf;
        c.fillText(tt('ch1.cv.Ef'), f.L - 6, efLabY);
        // occupation f(E): x = f from 0 to 1
        const fx0 = bandR + 16, fx1 = w - 10;
        c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(fx0, f.T); c.lineTo(fx0, f.B); c.stroke();
        const pts = []; for (let i = 0; i <= 120; i++) { const E = -0.25 + (Eg + 0.5) * i / 120; pts.push([CR.fermi(E, ef, P.T), E]); }
        path(c, pts, x => fx0 + (fx1 - fx0) * x, f.Y, C.violet, 1.8);
        c.fillStyle = C.mute; c.textAlign = 'right'; c.fillText(tt('ch1.cv.f'), fx1, f.T + 2);
      }
      { // n, p vs temperature
        const { c, w, h } = fit(cv2), f = frame(w, h, [26, 14, 38, 46], 200, 700, 2, 20);
        yTicks(c, f, logTicks(2, 20, 3), decLab); axes(c, f, tt('ch1.cv.T'), tt('ch1.cv.dens'));
        xTicks(c, f, [200, 300, 400, 500, 600, 700], v => fmt(v), true);
        const ni = [], nn = [], pp = [];
        for (let T = 200; T <= 700; T += 5) { const d = CR.densities(T, P.N, P.type); ni.push([T, Math.log10(d.ni)]); nn.push([T, Math.log10(d.n)]); pp.push([T, Math.log10(d.p)]); }
        clipF(c, f); c.setLineDash([5, 4]); path(c, ni, f.X, f.Y, C.mute, 1.4); c.setLineDash([]);
        path(c, pp, f.X, f.Y, C.red); path(c, nn, f.X, f.Y, C.cyan); c.restore();
        vline(c, f, P.T, C.gold);
        const d = CR.densities(P.T, P.N, P.type);
        for (const [v, col] of [[d.n, C.cyan], [d.p, C.red]]) if (Math.log10(v) >= 2) dot(c, f.X(P.T), f.Y(Math.log10(v)), col);
      }
    }
  });
  function text() {
    const P = p(), d = M.carriers.densities(P.T, P.N, P.type), Ti = M.carriers.intrinsicT(P.N);
    put('#c1To', t('ch1.unit.T', { k: fmt(P.T), c: fmt(P.T - 273.15) }));
    put('#c1No', P.N ? t('ch1.unit.N', { v: sci(P.N, 1) }) : t('ch1.unit.none'));
    put('#c1n', sci(d.n, 1)); put('#c1p', sci(d.p, 1));
    put('#c1ef', t('ch1.unit.ev', { v: (M.carriers.efMinusEi(P.T, P.N, P.type) >= 0 ? '+' : '−') + fmt(Math.abs(M.carriers.efMinusEi(P.T, P.N, P.type)), 3) }));
    put('#c1rho', t('ch1.unit.rho', { v: sig(M.carriers.resistivity(P.T, P.N, P.type)) }));
    let key, v = { ni: sci(d.ni, 1), N: sci(P.N, 1), dop: t('ch1.dop.' + P.type), maj: t('ch1.maj.' + P.type), T: fmt(P.T), Ti: Ti ? fmt(Ti) : '' };
    if (!P.N) { key = 'ch1.say.intrinsic'; v.per = sci(M.carriers.ATOMS / d.ni, 1); }
    else if (P.T >= Ti) key = 'ch1.say.hot';
    else if (P.T >= Ti - 60) key = 'ch1.say.near';
    else { key = 'ch1.say.extrinsic'; v.per = sci(M.carriers.atomsPerDopant(P.N), 1); v.x = sci(Math.max(d.n, d.p) / d.ni, 1); }
    putHTML('#c1Say', t(key, v));
  }
  sim.text = text;
  const redo = () => { sim.dirty = true; text(); };
  ['c1T', 'c1N'].forEach(id => $('#' + id).addEventListener('input', redo));
  radios('c1Type').forEach(r => r.addEventListener('change', redo));
  text();
})();

/* ───────── 02 pn junction ───────── */
(() => {
  const cv = $('#c2Cv'), cv2 = $('#c2Cv2'), J = M.junction;
  const p = () => ({ Na: Math.pow(10, val('c2Na')), Nd: Math.pow(10, val('c2Nd')), V: val('c2V') });
  const lenTxt = cm => { const nm = cm * 1e7; return nm < 1000 ? t('ch2.unit.nm', { v: fmt(nm) }) : t('ch2.unit.um', { v: sig(nm / 1000) }); };
  const ampTxt = a => { const x = Math.abs(a); if (x < 1e-12) return sci(a, 1) + ' A'; if (x < 1e-9) return fmt(a * 1e12, 1) + ' pA'; if (x < 1e-6) return fmt(a * 1e9, 1) + ' nA'; if (x < 1e-3) return fmt(a * 1e6, 1) + ' µA'; return fmt(a * 1e3, 1) + ' mA'; };
  const sim = reg([cv, cv2], {
    draw() {
      const P = p(), w0 = J.width(P.Na, P.Nd, P.V), Eg = M.carriers.Eg(300), Vb = w0.vb;
      { // band diagram across the junction (depletion approximation)
        const { c, w, h } = fit(cv), span = Math.max(w0.W * 2.4, 1e-6), x0 = -w0.xp - (span - w0.W) / 2, x1 = x0 + span;
        const f = frame(w, h, [22, 12, 26, 12], x0, x1, -Eg - 0.3, Math.max(1.2, Vb + 0.2));
        const phi = x => x <= -w0.xp ? 0 : x <= 0 ? (M.Q * P.Na / (2 * 11.7 * 8.854188e-14)) * Math.pow(x + w0.xp, 2) : x <= w0.xn ? Vb - (M.Q * P.Nd / (2 * 11.7 * 8.854188e-14)) * Math.pow(w0.xn - x, 2) : Vb;
        c.fillStyle = 'rgba(163,170,184,.12)'; c.fillRect(f.X(-w0.xp), f.T, f.X(w0.xn) - f.X(-w0.xp), f.B - f.T);
        const ec = [], ev = [];
        for (let i = 0; i <= 200; i++) { const x = x0 + span * i / 200, e = Vb - phi(x); ec.push([x, e]); ev.push([x, e - Eg]); }
        path(c, ec, f.X, f.Y, C.cyan); path(c, ev, f.X, f.Y, C.red);
        c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(tt('ch2.cv.p'), f.L + 4, f.B + 12);
        c.textAlign = 'right'; c.fillText(tt('ch2.cv.n'), f.R - 4, f.B + 12);
        c.textAlign = 'left'; c.fillText(tt('ch2.cv.E'), f.L + 4, f.T - 10);
      }
      { // |I| vs V, log scale
        const { c, w, h } = fit(cv2), f = frame(w, h, [26, 14, 38, 46], -3, 0.8, -19, 0);
        yTicks(c, f, logTicks(-18, 0, 3), decLab); axes(c, f, tt('ch2.cv.v'), tt('ch2.cv.i'));
        xTicks(c, f, [-3, -2, -1, 0], v => fmt(v), false);
        const pts = []; for (let v = -3; v <= 0.8001; v += 0.01) { const i = Math.abs(J.current(P.Na, P.Nd, v)); pts.push([v, i > 0 ? Math.max(-19, Math.log10(i)) : -19]); }
        path(c, pts, f.X, f.Y, C.violet);
        const iv = Math.abs(J.current(P.Na, P.Nd, P.V));
        dot(c, f.X(P.V), f.Y(iv > 0 ? Math.max(-19, Math.min(0, Math.log10(iv))) : -19), C.gold);
      }
    }
  });
  function text() {
    const P = p(), vbi = J.vbi(P.Na, P.Nd), w0 = J.width(P.Na, P.Nd, P.V), I = J.current(P.Na, P.Nd, P.V);
    put('#c2Nao', t('ch1.unit.N', { v: sci(P.Na, 1) })); put('#c2Ndo', t('ch1.unit.N', { v: sci(P.Nd, 1) })); put('#c2Vo', t('ch2.unit.v', { v: fmt(P.V, 2) }));
    put('#c2vbi', t('ch2.unit.v', { v: fmt(vbi, 3) })); put('#c2w', lenTxt(w0.W)); put('#c2e', t('ch2.unit.kvcm', { v: fmt(J.emax(P.Na, P.Nd, P.V) / 1000) })); put('#c2i', ampTxt(I));
    const v = { v: fmt(Math.abs(P.V), 2), vbi: fmt(vbi, 2), vb: fmt(w0.vb, 2), w: lenTxt(w0.W), i: ampTxt(Math.abs(I)) };
    const key = P.V > vbi - 0.05 ? 'ch2.say.fwd' : Math.abs(P.V) < 0.005 ? 'ch2.say.zero' : P.V > 0 ? 'ch2.say.fwd' : 'ch2.say.rev';
    if (key === 'ch2.say.fwd') v.vb = fmt(Math.max(0, vbi - P.V), 2);
    putHTML('#c2Say', t(key, v));
  }
  sim.text = text;
  const redo = () => { sim.dirty = true; text(); };
  ['c2Na', 'c2Nd', 'c2V'].forEach(id => $('#' + id).addEventListener('input', redo));
  text();
})();

/* ───────── 03 MOSFET ───────── */
const curTxt = a => { const x = Math.abs(a); if (x >= 1e-6) return t('ch3.unit.ua', { v: sig(a * 1e6) }); if (x >= 1e-9) return t('ch3.unit.na', { v: sig(a * 1e9) }); return t('ch3.unit.pa', { v: sig(a * 1e12) }); };
(() => {
  const cv = $('#c3Cv'), F = M.mosfet;
  const p = () => ({ vt: val('c3Vt'), n: val('c3n'), T: val('c3T'), vdd: val('c3Vdd') });
  const sim = reg(cv, {
    draw() {
      const P = p(), { c, w, h } = fit(cv), f = frame(w, h, [26, 14, 38, 46], 0, 1.2, -13, -2);
      yTicks(c, f, logTicks(-13, -2, 2), decLab); axes(c, f, tt('ch3.cv.vg'), tt('ch3.cv.id'));
      xTicks(c, f, [0, 0.3, 0.6, 0.9, 1.2], v => fmt(v, 1), true);
      vline(c, f, P.vt, C.mute);
      const pts = []; for (let v = 0; v <= 1.2001; v += 0.005) pts.push([v, Math.max(-13, Math.min(-2, Math.log10(F.id(v, P))))]);
      path(c, pts, f.X, f.Y, C.cyan);
      const ly = v => Math.max(-13, Math.min(-2, Math.log10(F.id(v, P))));
      dot(c, f.X(0), f.Y(ly(0)), C.red, 5.5); dot(c, f.X(P.vdd), f.Y(ly(P.vdd)), C.gold, 5.5);
      c.textAlign = 'left'; c.fillStyle = C.red; const yo = f.Y(ly(0)); c.fillText(tt('ch3.cv.off'), f.X(0) + 9, yo + (yo > f.B - 14 ? -12 : 0));
      c.fillStyle = C.gold; c.textAlign = P.vdd > 1.0 ? 'right' : 'left'; c.fillText(tt('ch3.cv.on'), f.X(P.vdd) + (P.vdd > 1.0 ? -9 : 9), f.Y(ly(P.vdd)) + 12);
    }
  });
  function text() {
    const P = p(), s = F.swing(P), r = F.ratio(P, P.vdd), lim = M.vth(P.T) * M.LN10 * 1000;
    put('#c3Vto', t('ch2.unit.v', { v: fmt(P.vt, 2) })); put('#c3Vddo', t('ch2.unit.v', { v: fmt(P.vdd, 2) })); put('#c3To', t('ch3.unit.k', { v: fmt(P.T) })); put('#c3no', fmt(P.n, 2));
    put('#c3s', t('ch3.unit.mvdec', { v: fmt(s, 1) })); put('#c3ion', curTxt(F.ion(P, P.vdd))); put('#c3ioff', curTxt(F.ioff(P))); put('#c3r', sci(r, 1));
    const ideal = P.n <= 1.0001 ? t('ch3.say.ideal') : t('ch3.say.nonideal', { lim: fmt(lim, 1) });
    const key = r >= 1e5 ? 'ch3.say.ok' : 'ch3.say.leaky';
    putHTML('#c3Say', t(key, { r: sci(r, 1), s: fmt(s, 1), ideal, dec: fmt(Math.log10(r), 1) }));
  }
  sim.text = text;
  const redo = () => { sim.dirty = true; text(); };
  ['c3Vt', 'c3Vdd', 'c3T', 'c3n'].forEach(id => $('#' + id).addEventListener('input', redo));
  text();
})();

/* ───────── 04 Dennard ───────── */
(() => {
  const cv = $('#c4Cv'), cv2 = $('#c4Cv2'), D = M.dennard;
  const p = () => ({ g: val('c4G'), mode: radioVal('c4Mode'), fs: $('#c4F').checked });
  const lenTxt = nm => nm >= 1000 ? t('ch4.unit.um', { v: fmt(nm / 1000, 1) }) : t('ch4.unit.nm', { v: fmt(nm) });
  const sim = reg([cv, cv2], {
    draw() {
      const P = p();
      { const { c, w, h } = fit(cv), f = frame(w, h, [26, 14, 38, 46], -0.5, 10.5, -1, 3.5);
        yTicks(c, f, [-1, 0, 1, 2, 3], e => e === 0 ? '1' : decLab(e)); axes(c, f, tt('ch4.cv.gen'), tt('ch4.cv.pd'));
        xTicks(c, f, [0, 2, 4, 6, 8, 10], v => fmt(v), false);
        const bw = Math.max(4, (f.X(1) - f.X(0)) * 0.62);
        for (let g = 0; g <= 10; g++) {
          const r = D.rel(g, P.mode, P.fs), x = f.X(g) - bw / 2, lt = Math.min(3.5, Math.log10(r.tot)), yTop = f.Y(lt), yBase = f.Y(-1);
          const yDyn = f.Y(Math.max(-1, Math.min(3.5, Math.log10(Math.max(1e-9, r.dyn))))); // total bar in red, the switching part in front: red showing above it is leakage
          c.globalAlpha = g === P.g ? 1 : 0.45;
          c.fillStyle = C.red; c.fillRect(x, yTop, bw, yBase - yTop);
          c.fillStyle = C.cyan; c.fillRect(x, yDyn, bw, yBase - yDyn);
          c.globalAlpha = 1;
        }
        hline(c, f, 0, C.mute); }
      { const { c, w, h } = fit(cv2), f = frame(w, h, [26, 14, 38, 46], 1970, 2023, -0.5, 4);
        yTicks(c, f, [0, 1, 2, 3, 4], e => fmt(Math.pow(10, e))); axes(c, f, tt('ch4.cv.year'), tt('ch4.cv.f'));
        xTicks(c, f, [1970, 1980, 1990, 2000, 2010, 2020], v => fmt(v).replace(',', ''), false);
        c.fillStyle = 'rgba(179,157,251,.75)';
        for (const [y, mhz] of D.FREQ) { c.beginPath(); c.arc(f.X(y), f.Y(Math.log10(mhz)), 3, 0, 6.283); c.fill(); } }
    }
  });
  function text() {
    const P = p(), r = D.rel(P.g, P.mode, P.fs);
    put('#c4Go', fmt(P.g)); put('#c4L', lenTxt(r.L)); put('#c4V', t('ch4.unit.vv', { v: fmt(r.V, 2), t: fmt(r.vt, 2) }));
    put('#c4f', r.f >= 1e9 ? t('ch4.unit.ghz', { v: fmt(r.f / 1e9, 2) }) : t('ch4.unit.mhz', { v: fmt(r.f / 1e6) }));
    put('#c4pd', t('ch4.unit.x', { v: sig(r.tot) })); put('#c4leak', fmt(r.leakShare * 100, r.leakShare < 0.1 ? 1 : 0) + '%');
    const v = { g: fmt(P.g), L: lenTxt(r.L), x: sig(r.tot), vt: fmt(r.vt, 2), share: fmt(r.leakShare * 100) + '%' };
    let key;
    if (r.leakShare > 0.2 && P.mode === 'dennard') key = 'ch4.say.leak';
    else if (r.tot < 1.5) key = P.fs || P.g === 0 ? 'ch4.say.flat' : 'ch4.say.cool';
    else if (!P.fs) key = 'ch4.say.cool';
    else key = r.leakShare > 0.2 ? 'ch4.say.leak' : 'ch4.say.hot';
    putHTML('#c4Say', t(key, v));
  }
  sim.text = text;
  const redo = () => { sim.dirty = true; text(); };
  $('#c4G').addEventListener('input', redo); $('#c4F').addEventListener('change', redo); radios('c4Mode').forEach(r => r.addEventListener('change', redo));
  text();
})();

/* ───────── 05 lithography ───────── */
(() => {
  const cv = $('#c5Cv'), cv2 = $('#c5Cv2'), L = M.litho, COLS = [C.gold, C.cyan, C.violet, C.green];
  const limCache = {};
  const p = () => { const tool = L.TOOLS[radioVal('c5Tool')]; return { tool, key: radioVal('c5Tool'), mode: radioVal('c5Ill'), split: +radioVal('c5Split'), pitch: Math.pow(10, val('c5P')) }; };
  const limit = P => { const k = P.key + P.mode; if (!(k in limCache)) limCache[k] = L.printLimit(P.tool.lam, P.tool.na, P.mode); return limCache[k]; };
  let cache = null;
  function model() {
    const P = p(), ep = L.exposurePitch(P.pitch, P.split), con = L.contrast(P.tool.lam, P.tool.na, ep, P.mode);
    const img = L.image(P.tool.lam, P.tool.na, ep, P.mode, 240);
    let lo = Infinity, hi = -Infinity; for (const q of img) { lo = Math.min(lo, q[1]); hi = Math.max(hi, q[1]); }
    cache = { P, ep, con, lo, hi, thr: (lo + hi) / 2, ok: con >= L.CMIN, dark: con < 1e-6 };
  }
  model();
  const sim = reg([cv, cv2], {
    draw() {
      const m = cache, P = m.P, span = 3 * m.ep;
      { const { c, w, h } = fit(cv), yMax = Math.max(1.0, Math.ceil(m.hi * 5) / 5 + 0.1), f = frame(w, h, [26, 14, 38, 46], -span / 2, span / 2, 0, yMax);
        yTicks(c, f, [0, 0.5, 1].filter(v => v <= yMax), v => fmt(v, 1)); axes(c, f, tt('ch5.cv.x'), tt('ch5.cv.I'));
        const ticks = [-span / 2, -span / 4, 0, span / 4, span / 2].map(x => +x.toFixed(1));
        xTicks(c, f, ticks, v => fmt(v), true);
        const pts = []; for (let i = 0; i <= 360; i++) { const x = -span / 2 + span * i / 360; pts.push([x, L.intensity(x, P.tool.lam, P.tool.na, m.ep, P.mode)]); }
        if (m.ok) hline(c, f, m.thr, C.red);
        path(c, pts, f.X, f.Y, COLS[0]); }
      { const { c, w, h } = fit(cv2), f = frame(w, h, [12, 14, 30, 46], -span / 2, span / 2, 0, 1);
        c.fillStyle = '#20263a'; c.fillRect(f.L, f.T, f.R - f.L, f.B - f.T);
        if (m.ok) {
          for (let e = 0; e < P.split; e++) {
            c.fillStyle = COLS[e % COLS.length];
            // printed openings of exposure e: where its image is above the threshold, shifted by e × target pitch
            let run = null;
            for (let i = 0; i <= 480; i++) {
              const x = -span / 2 + span * i / 480, on = L.intensity(x - e * P.pitch, P.tool.lam, P.tool.na, m.ep, P.mode) > m.thr;
              if (on && run == null) run = x; if ((!on || i === 480) && run != null) { c.fillRect(f.X(run), f.T + 4, Math.max(1, f.X(x) - f.X(run)), f.B - f.T - 8); run = null; }
            }
          }
        } else { c.fillStyle = C.mute; c.textAlign = 'center'; c.fillText(tt('ch5.cv.none'), (f.L + f.R) / 2, (f.T + f.B) / 2); }
        c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(tt('ch5.cv.wafer'), f.L, f.B + 14); }
    }
  });
  function text() {
    const m = cache, P = m.P, hp = P.pitch / 2, lim = limit(P);
    put('#c5Po', t('ch5.unit.nm', { v: fmt(P.pitch, P.pitch < 20 ? 1 : 0) }));
    put('#c5hp', t('ch5.unit.nm', { v: fmt(hp, 1) })); put('#c5k1', fmt(L.k1(m.ep / 2, P.tool.lam, P.tool.na), 3)); put('#c5c', fmt(m.con, 2));
    put('#c5lim', t('ch5.unit.nm', { v: fmt(lim / 2, 1) }));
    const v = { ep: fmt(m.ep, m.ep < 20 ? 1 : 0), k1: fmt(L.k1(m.ep / 2, P.tool.lam, P.tool.na), 3), c: fmt(m.con, 2), splitNote: t('ch5.split.note' + P.split) };
    putHTML('#c5Say', t(m.dark ? 'ch5.say.dark' : m.ok ? 'ch5.say.ok' : 'ch5.say.weak', v));
  }
  sim.text = text;
  const redo = () => { model(); sim.dirty = true; text(); };
  $('#c5P').addEventListener('input', redo); ['c5Tool', 'c5Ill', 'c5Split'].forEach(n => radios(n).forEach(r => r.addEventListener('change', redo)));
  text();
})();

/* ───────── 06 EUV light budget ───────── */
(() => {
  const cv = $('#c6Cv'), cv2 = $('#c6Cv2'), E = M.euv;
  let seed = 3;
  const p = () => ({ m: val('c6M'), R: val('c6R'), P: val('c6P'), dose: val('c6D'), px: val('c6Px') });
  // Poisson sample (normal approximation above 50, exact by multiplication below)
  function pois(rnd, mean) {
    if (mean > 50) { const u = Math.max(1e-12, rnd()), v = rnd(); return Math.max(0, Math.round(mean + Math.sqrt(mean) * Math.sqrt(-2 * Math.log(u)) * Math.cos(6.283185 * v))); }
    const L = Math.exp(-mean); let k = 0, q = 1; do { k++; q *= rnd(); } while (q > L); return k - 1;
  }
  const sim = reg([cv, cv2], {
    draw() {
      const P = p();
      { const { c, w, h } = fit(cv), f = frame(w, h, [26, 14, 38, 50], -0.5, P.m + 0.5, -1, 3.2);
        yTicks(c, f, [-1, 0, 1, 2, 3], e => e === 0 ? '1' : e === 1 ? '10' : e === -1 ? '0.1' : fmt(Math.pow(10, e))); axes(c, f, tt('ch6.cv.step'), tt('ch6.cv.p'));
        const step = P.m > 10 ? 2 : 1, ticks = []; for (let i = 0; i <= P.m; i += step) ticks.push(i);
        xTicks(c, f, ticks, v => fmt(v), false);
        const bw = Math.max(3, (f.X(1) - f.X(0)) * 0.6);
        for (let i = 0; i <= P.m; i++) { const pw = P.P * Math.pow(P.R, i), y = f.Y(Math.max(-1, Math.log10(pw))); c.fillStyle = i === 0 ? C.violet : i === P.m ? C.gold : C.cyan; c.fillRect(f.X(i) - bw / 2, y, bw, f.Y(-1) - y); } }
      { const { c, w, h } = fit(cv2), n = 10, cell = Math.min((h - 16) / n, (w - 16) / n), ox = (w - cell * n) / 2, oy = (h - cell * n) / 2;
        const mean = E.photons(P.dose, P.px, 13.5), rnd = M.rng(seed);
        for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
          const k = pois(rnd, mean), rel = (k / mean - 1) / 0.1, g = Math.max(0, Math.min(1, 0.5 + rel / 2));
          const r = Math.round(30 + 200 * g), gg = Math.round(28 + 190 * g), b = Math.round(60 + 170 * g);
          c.fillStyle = `rgb(${r},${gg},${b})`; c.fillRect(ox + i * cell + 0.5, oy + j * cell + 0.5, cell - 1, cell - 1);
        } }
    }
  });
  function text() {
    const P = p(), tr = E.transmission(P.R, P.m), pw = P.P * tr, sec = E.secondsPerWafer(P.P, P.R, P.m, P.dose), n = E.photons(P.dose, P.px, 13.5), noise = E.shotNoise(P.dose, P.px, 13.5);
    put('#c6Mo', fmt(P.m)); put('#c6Ro', fmt(P.R * 100, 1) + '%'); put('#c6Po', t('ch6.unit.w', { v: fmt(P.P) })); put('#c6Do', t('ch6.unit.mj', { v: fmt(P.dose) })); put('#c6Pxo', t('ch6.unit.nm', { v: fmt(P.px) }));
    put('#c6t', t('ch6.unit.pct', { v: fmt(tr * 100, tr < 0.01 ? 2 : 1) })); put('#c6pw', t('ch6.unit.w', { v: fmt(pw, pw < 10 ? 2 : 1) })); put('#c6sec', t('ch6.unit.s', { v: fmt(sec, sec < 10 ? 2 : 1) }));
    put('#c6ph', t('ch6.unit.ph', { n: fmt(n), v: fmt(noise * 100, 1) }));
    put('#c6Scale', t('ch6.scale', { v: '±10%' }));
    const v = { m: fmt(P.m), t: fmt(tr * 100, tr < 0.01 ? 2 : 1) + '%', P: fmt(P.P), pw: fmt(pw, pw < 10 ? 2 : 1), dose: fmt(P.dose), sec: fmt(sec, 1), wph: fmt(3600 / sec), px: fmt(P.px), n: fmt(n), noise: fmt(noise * 100, 1) + '%' };
    putHTML('#c6Say', t(noise > 0.04 ? 'ch6.say.noisy' : 'ch6.say.main', v));
  }
  sim.text = text;
  const redo = () => { sim.dirty = true; text(); };
  ['c6M', 'c6R', 'c6P', 'c6D', 'c6Px'].forEach(id => $('#' + id).addEventListener('input', redo));
  $('#c6Roll').addEventListener('click', () => { seed++; redo(); });
  text();
})();

/* ───────── 07 node names and cell density ───────── */
(() => {
  const cv = $('#c7Cv'), CE = M.cells;
  let preset = 'g48m24';
  const geom = () => preset ? CE.NODES[preset] : { cpp: val('c7Cpp'), mmp: val('c7Mmp'), tracks: val('c7Tr'), tiers: val('c7Ti'), width: 3, name: null };
  function setSliders(g) { $('#c7Cpp').value = g.cpp; $('#c7Mmp').value = g.mmp; $('#c7Tr').value = g.tracks; $('#c7Ti').value = g.tiers; }
  setSliders(CE.NODES[preset]);
  const sim = reg(cv, {
    draw() {
      const g = geom(), { c, w, h } = fit(cv), cw = (g.width || 3) * g.cpp, ch = g.tracks * g.mmp;
      const s = Math.min((w - 40) / cw, (h - 70) / ch), x0 = Math.max(20, (w - cw * s) / 2), y0 = 30;
      // cell outline
      c.fillStyle = 'rgba(99,199,230,.08)'; c.fillRect(x0, y0, cw * s, ch * s);
      c.strokeStyle = C.cyan; c.lineWidth = 1.5; c.strokeRect(x0, y0, cw * s, ch * s);
      // metal tracks
      c.strokeStyle = 'rgba(179,157,251,.55)'; c.lineWidth = Math.max(1, g.mmp * s / 2);
      for (let k = 0; k < Math.floor(g.tracks); k++) { const y = y0 + (k + 0.5) * g.mmp * s; c.beginPath(); c.moveTo(x0, y); c.lineTo(x0 + cw * s, y); c.stroke(); }
      // gates: one per contacted gate pitch, centred
      c.strokeStyle = C.gold; c.lineWidth = Math.max(1.5, 0.35 * g.cpp * s);
      for (let k = 0; k < (g.width || 3); k++) { const x = x0 + (k + 0.5) * g.cpp * s; c.beginPath(); c.moveTo(x, y0); c.lineTo(x, y0 + ch * s); c.stroke(); }
      c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(tt('ch7.cv.cell'), x0, y0 - 14);
      // the node name as a length, same scale
      if (g.name) {
        const by = y0 + ch * s + 22; c.fillStyle = C.red; c.fillRect(x0, by - 3, Math.max(1.5, g.name * s), 6);
        c.fillStyle = C.mute; c.fillText(tt('ch7.cv.name'), x0 + Math.max(1.5, g.name * s) + 8, by);
      }
    }
  });
  function text() {
    const g = geom();
    put('#c7Cppo', t('ch7.unit.nm', { v: fmt(g.cpp) })); put('#c7Mmpo', t('ch7.unit.nm', { v: fmt(g.mmp) })); put('#c7Tro', t('ch7.unit.tracks', { v: fmt(g.tracks, Number.isInteger(g.tracks) ? 0 : 2) })); put('#c7Tio', t('ch7.unit.tiers', { v: fmt(g.tiers) }));
    put('#c7area', t('ch7.unit.nm2', { v: fmt(CE.area(g)) })); put('#c7d', t('ch7.unit.mtr', { v: fmt(CE.density(g), 1) })); put('#c7side', t('ch7.unit.nm', { v: fmt(CE.sideNm(g), 1) }));
    put('#c7ratio', g.name ? t('ch7.unit.x', { v: fmt(g.cpp / g.name, 1) }) : t('common.na'));
    if (preset) putHTML('#c7Say', t('ch7.say.named', { name: tt('ch7.preset.' + preset), ratio: fmt(g.cpp / g.name, 1), side: fmt(CE.sideNm(g), 1), d: fmt(CE.density(g), 1) }));
    else putHTML('#c7Say', t('ch7.say.custom', { side: fmt(CE.sideNm(g), 1), d: fmt(CE.density(g), 1) }));
  }
  sim.text = text;
  radios('c7Preset').forEach(r => r.addEventListener('change', () => { preset = r.value; setSliders(CE.NODES[preset]); sim.dirty = true; text(); }));
  ['c7Cpp', 'c7Mmp', 'c7Tr', 'c7Ti'].forEach(id => $('#' + id).addEventListener('input', () => { preset = null; radios('c7Preset').forEach(r => { r.checked = false; }); sim.dirty = true; text(); }));
  text();
})();

/* ───────── 08 electrostatic control ───────── */
(() => {
  const cv = $('#c8Cv'), cv2 = $('#c8Cv2'), EL = M.electro, VT = 0.3, VDD = 0.75;
  const TSI = { planar: 10, finfet: 6, gaa: 5 }, TOX = { planar: 1.0, finfet: 0.9, gaa: 0.9 };
  const p = () => ({ shape: radioVal('c8Shape'), L: val('c8L'), tsi: val('c8Tsi'), tox: val('c8Tox') });
  const COL = { planar: C.mute, finfet: C.cyan, gaa: C.gold };
  const sim = reg([cv, cv2], {
    draw() {
      const P = p();
      { const { c, w, h } = fit(cv), cx = w / 2, cy = h / 2 + 6, s = Math.min(6, (h - 40) / 22);
        const gate = 'rgba(233,185,73,.55)', si = 'rgba(99,199,230,.85)';
        if (P.shape === 'planar') {
          c.fillStyle = 'rgba(99,199,230,.25)'; c.fillRect(cx - 90, cy, 180, 40);
          c.fillStyle = si; c.fillRect(cx - 60, cy, 120, Math.max(3, P.tsi * s * 0.6));
          c.fillStyle = gate; c.fillRect(cx - 60, cy - 26, 120, 22);
        } else if (P.shape === 'finfet') {
          const fw = Math.max(4, P.tsi * s), fh = 60;
          c.fillStyle = gate; c.fillRect(cx - fw / 2 - 18, cy - fh / 2 - 18, fw + 36, fh + 18);
          c.fillStyle = 'rgba(99,199,230,.25)'; c.fillRect(cx - 90, cy + fh / 2, 180, 16);
          c.fillStyle = si; c.fillRect(cx - fw / 2, cy - fh / 2, fw, fh + 16);
        } else {
          const th = Math.max(3, P.tsi * s * 0.8), sw = 70;
          for (let k = 0; k < 3; k++) { const y = cy - 34 + k * (th + 18); c.fillStyle = gate; c.fillRect(cx - sw / 2 - 12, y - 8, sw + 24, th + 16); c.fillStyle = si; c.fillRect(cx - sw / 2, y, sw, th); }
        }
        c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(tt('ch8.cv.gate'), 12, 16);
        c.fillStyle = C.gold; c.fillRect(12 + c.measureText(tt('ch8.cv.gate')).width + 8, 11, 14, 10);
        const x2 = 12 + c.measureText(tt('ch8.cv.gate')).width + 34;
        c.fillStyle = C.mute; c.fillText(tt('ch8.cv.ch'), x2, 16); c.fillStyle = C.cyan; c.fillRect(x2 + c.measureText(tt('ch8.cv.ch')).width + 8, 11, 14, 10); }
      { const { c, w, h } = fit(cv2), f = frame(w, h, [26, 14, 38, 46], 6, 40, 55, 160);
        yTicks(c, f, [60, 80, 100, 120, 140, 160], v => fmt(v)); axes(c, f, tt('ch8.cv.L'), tt('ch8.cv.S'));
        xTicks(c, f, [6, 10, 15, 20, 25, 30, 35, 40], v => fmt(v), true);
        hline(c, f, 59.5, C.mute);
        for (const sh of ['planar', 'finfet', 'gaa']) {
          const tsi = sh === P.shape ? P.tsi : TSI[sh], tox = sh === P.shape ? P.tox : TOX[sh];
          const pts = []; for (let L = 6; L <= 40.01; L += 0.25) { const d = EL.device(sh, L, tsi, tox); pts.push([L, d.ok && d.swing <= 160 ? d.swing : NaN]); }
          path(c, pts, f.X, f.Y, COL[sh], sh === P.shape ? 2.6 : 1.4);
        }
        vline(c, f, P.L, C.ink);
        const d = EL.device(P.shape, P.L, P.tsi, P.tox); if (d.ok && d.swing <= 160) dot(c, f.X(P.L), f.Y(d.swing), COL[P.shape]); }
    }
  });
  function text() {
    const P = p(), d = EL.device(P.shape, P.L, P.tsi, P.tox), lk = EL.leakFactor(d, VT, VDD);
    put('#c8Lo', t('ch8.unit.nm', { v: fmt(P.L) })); put('#c8Tsio', t('ch8.unit.nm', { v: fmt(P.tsi, 1) })); put('#c8Toxo', t('ch8.unit.nm', { v: fmt(P.tox, 2) }));
    put('#c8lam', t('ch8.unit.nm', { v: fmt(d.lam, 2) })); put('#c8ratio', fmt(d.ratio, 1));
    put('#c8s', d.ok ? t('ch8.unit.mv', { v: fmt(d.swing) }) : t('ch8.unit.lost')); put('#c8dibl', t('ch8.unit.mvv', { v: fmt(d.dibl) }));
    put('#c8leak', d.ok ? t('ch8.unit.x', { v: sig(lk) }) : t('ch8.unit.lost'));
    const v = { r: fmt(d.ratio, 1), s: t('ch8.unit.mv', { v: fmt(d.swing) }), dibl: fmt(d.dibl), leak: sig(lk), dvt: fmt(d.theta * VDD * 1000) };
    putHTML('#c8Say', t(!d.ok ? 'ch8.say.lost' : d.dibl <= 50 && d.swing <= 70 ? 'ch8.say.good' : 'ch8.say.marginal', v));
  }
  sim.text = text;
  const redo = () => { sim.dirty = true; text(); };
  radios('c8Shape').forEach(r => r.addEventListener('change', () => { $('#c8Tsi').value = TSI[r.value]; $('#c8Tox').value = TOX[r.value]; redo(); }));
  ['c8L', 'c8Tsi', 'c8Tox'].forEach(id => $('#' + id).addEventListener('input', redo));
  text();
})();

/* ───────── 09 wires ───────── */
(() => {
  const cv = $('#c9Cv'), cv2 = $('#c9Cv2'), W = M.wires;
  const p = () => ({ pitch: val('c9P'), bar: val('c9B'), len: Math.pow(10, val('c9Len')) });
  const rTxt = r => !isFinite(r) ? '—' : r >= 1000 ? t('ch9.unit.kohm', { v: fmt(r / 1000, r >= 1e4 ? 0 : 1) }) : t('ch9.unit.ohm', { v: fmt(r) });
  const dTxt = (a, b) => (a >= 1000 || b >= 1000) ? t('ch9.unit.ns', { a: sig(a / 1000), b: sig(b / 1000) }) : t('ch9.unit.ps', { a: sig(a), b: sig(b) });
  const sim = reg([cv, cv2], {
    draw() {
      const P = p();
      { const { c, w, h } = fit(cv), gCu = W.geom('cu', P.pitch, P.bar), gRu = W.geom('ru', P.pitch, P.bar);
        const s = Math.min((h - 40) / gCu.h, (w / 2 - 40) / gCu.w, 6), y0 = (h - gCu.h * s) / 2 + 6;
        const draw1 = (cx, g, col, lab) => {
          const x = cx - g.w * s / 2;
          c.fillStyle = '#5b6273'; c.fillRect(x, y0, g.w * s, g.h * s);
          if (g.wc > 0 && g.hc > 0) { c.fillStyle = col; c.fillRect(x + (g.w - g.wc) / 2 * s, y0, g.wc * s, g.hc * s); }
          c.fillStyle = C.mute; c.textAlign = 'center'; c.fillText(lab, cx, y0 - 12);
        };
        draw1(w * 0.3, gCu, C.copper, tt('ch9.cv.cu')); draw1(w * 0.7, gRu, C.violet, tt('ch9.cv.ru')); }
      { const { c, w, h } = fit(cv2), f = frame(w, h, [26, 14, 38, 50], 12, 120, 0.5, 5);
        yTicks(c, f, [1, 2, 3, 4, 5], e => fmt(Math.pow(10, e))); axes(c, f, tt('ch9.cv.p'), tt('ch9.cv.r'));
        xTicks(c, f, [12, 20, 40, 60, 80, 100, 120], v => fmt(v), true);
        for (const [m, col] of [['cu', C.copper], ['ru', C.violet]]) {
          const pts = []; for (let q = 12; q <= 120; q += 0.5) { const r = W.rPerUm(m, q, P.bar); pts.push([q, isFinite(r) ? Math.min(5, Math.log10(r)) : NaN]); }
          path(c, pts, f.X, f.Y, col);
        }
        vline(c, f, P.pitch, C.ink);
        for (const [m, col] of [['cu', C.copper], ['ru', C.violet]]) { const r = W.rPerUm(m, P.pitch, P.bar); if (isFinite(r) && r < 1e5) dot(c, f.X(P.pitch), f.Y(Math.log10(r)), col); } }
    }
  });
  function text() {
    const P = p(), cu = W.rPerUm('cu', P.pitch, P.bar), ru = W.rPerUm('ru', P.pitch, P.bar), x = W.crossover(P.bar);
    const dc = W.delayPs('cu', P.pitch, P.len, P.bar), dr = W.delayPs('ru', P.pitch, P.len, P.bar);
    put('#c9Po', t('ch9.unit.nm', { v: fmt(P.pitch) })); put('#c9Bo', t('ch9.unit.nm', { v: fmt(P.bar, 1) })); put('#c9Leno', t('ch9.unit.um', { v: sig(P.len, 2) }));
    put('#c9cu', rTxt(cu)); put('#c9ru', rTxt(ru)); put('#c9share', t('ch9.unit.pct', { v: fmt(W.conductorShare('cu', P.pitch, P.bar) * 100) }));
    put('#c9delay', isFinite(dc) ? dTxt(dc, dr) : '—');
    const v = { p: fmt(P.pitch), share: fmt(W.conductorShare('cu', P.pitch, P.bar) * 100) + '%', cu: rTxt(cu), ru: rTxt(ru), x: fmt(x), len: sig(P.len, 2), d: isFinite(dc) ? dTxt(dc, dr) : '—' };
    putHTML('#c9Say', t(ru < cu ? 'ch9.say.ru' : 'ch9.say.cu', v));
  }
  sim.text = text;
  const redo = () => { sim.dirty = true; text(); };
  ['c9P', 'c9B', 'c9Len'].forEach(id => $('#' + id).addEventListener('input', redo));
  text();
})();

/* ───────── 10 yield and cost ───────── */
(() => {
  const cv = $('#c10Cv'), F = M.fab;
  let seed = 7, cache = null;
  const p = () => ({ a: val('c10A'), d0: val('c10D'), model: radioVal('c10Model'), wafer: radioVal('c10Wafer'), k: +radioVal('c10K') });
  function model() {
    const P = p(), piece = P.k > 1 ? P.a / P.k * (1 + F.OVERHEAD) : P.a, dies = F.layout(piece), sc = F.scatter(dies, P.d0, seed);
    cache = { P, piece, dies, sc, dead: sc.dead.filter(x => x).length };
  }
  model();
  const sim = reg(cv, {
    draw() {
      const m = cache, { c, w, h } = fit(cv), r = Math.min(w, h) / 2 - 10, cx = w / 2, cy = h / 2, s = r / (F.D_MM / 2);
      c.fillStyle = '#1b2130'; c.beginPath(); c.arc(cx, cy, r, 0, 6.283); c.fill();
      c.strokeStyle = C.line; c.lineWidth = 1; c.stroke();
      m.dies.forEach((d, i) => { c.fillStyle = m.sc.dead[i] ? 'rgba(240,122,109,.75)' : 'rgba(122,214,160,.55)'; const gap = Math.min(1, d.s * s * 0.06); c.fillRect(cx + d.x * s + gap, cy + d.y * s + gap, d.s * s - 2 * gap, d.s * s - 2 * gap); });
      c.fillStyle = '#ffffff'; for (const [x, y] of m.sc.pts) { c.beginPath(); c.arc(cx + x * s, cy + y * s, 1.6, 0, 6.283); c.fill(); }
    }
  });
  function text() {
    const m = cache, P = m.P, price = F.WAFER_PRICE[P.wafer];
    const gross = F.gross(m.piece), y = F.yieldOf(P.model, m.piece, P.d0), good = gross * y, mc = m.dies.length ? 1 - m.dead / m.dies.length : 0;
    const sys = F.system(P.a, P.d0, P.model, price, P.k), mono = F.system(P.a, P.d0, P.model, price, 1);
    put('#c10Ao', t('ch10.unit.mm2', { v: fmt(P.a) })); put('#c10Do', t('ch10.unit.d0', { v: fmt(P.d0, 2) }));
    put('#c10gross', P.k > 1 ? t('ch10.unit.n', { v: fmt(gross, 1) }) + ' · ' + t('ch10.unit.piece', { k: fmt(P.k), a: fmt(m.piece) }) : t('ch10.unit.n', { v: fmt(gross, 1) }));
    put('#c10y', t('ch10.unit.pct', { a: fmt(y * 100, 1), b: fmt(mc * 100, 1) })); put('#c10good', t('ch10.unit.n', { v: fmt(good, 1) }));
    put('#c10cost', t('ch10.unit.usd', { v: fmt(sys.cost) }));
    let s = P.k > 1 ? t('ch10.say.chip', { k: fmt(P.k), piece: fmt(m.piece), y: fmt(sys.y * 100, 1) + '%', cost: fmt(sys.cost), mono: fmt(mono.cost) })
      : t('ch10.say.one', { a: fmt(P.a), gross: fmt(gross, 1), y: fmt(y * 100, 1) + '%', good: fmt(good, 1), price: fmt(price), cost: fmt(mono.cost), dead: fmt(m.dead) });
    if (P.k === 1 && P.a >= 800) s += ' ' + t('ch10.say.reticle', { a: fmt(P.a) });
    putHTML('#c10Say', s);
  }
  sim.text = text;
  const redo = () => { model(); sim.dirty = true; text(); };
  ['c10A', 'c10D'].forEach(id => $('#' + id).addEventListener('input', redo));
  ['c10Model', 'c10Wafer', 'c10K'].forEach(n => radios(n).forEach(r => r.addEventListener('change', redo)));
  $('#c10Roll').addEventListener('click', () => { seed++; redo(); });
  text();
})();

/* ───────── 11 frontier list ───────── */
(() => {
  const list = $('#frList');
  function render() {
    const f = radioVal('c11F') || 'all';
    list.innerHTML = M.FRONTIER.map(x => {
      const ym = x.asOf.split('-'), date = ym.length > 1 ? (effLang() === 'zh' ? t('ch11.date', { y: ym[0], m: +ym[1] }) : new Date(Date.UTC(+ym[0], +ym[1] - 1, 1)).toLocaleString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })) : ym[0];
      const hide = f !== 'all' && f !== x.kind;
      return `<li data-kind="${x.kind}"${hide ? ' hidden' : ''}><div class="meta"><span class="tag ${x.kind}">${t('ch11.kind.' + x.kind)}</span><span>${t('ch11.asof', { d: date })}</span></div><div class="txt">${t('fr.' + x.id)}</div><div class="src">${t('ch11.src')}<a href="${x.url}" rel="noopener">${x.src}</a></div></li>`;
    }).join('');
  }
  window.__frRender = render;
  radios('c11F').forEach(r => r.addEventListener('change', render));
})();

/* ───────── loop ───────── */
applyLang();
function tick() {
  for (const s of sims) if (s.vis && s.dirty) { s.draw(); s.dirty = false; }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
window.__essayReady = true;
})();
