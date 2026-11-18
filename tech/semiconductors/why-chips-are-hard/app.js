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
  renderDiagrams(true);
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
window.addEventListener('resize', () => { sims.forEach(s => { s.dirty = true; }); renderDiagrams(false); });
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
    let key, v = { ni: sci(d.ni, 1), N: sci(P.N, 1), T: fmt(P.T), Ti: Ti ? fmt(Ti) : '' };
    if (!P.N) { key = 'ch1.say.intrinsic'; v.per = sci(M.carriers.ATOMS / d.ni, 1); }
    else if (P.T >= Ti) key = 'ch1.say.hot';
    else if (P.T >= Ti - 60) key = 'ch1.say.near';
    else { key = 'ch1.say.extrinsic.' + P.type; v.per = sci(M.carriers.atomsPerDopant(P.N), 1); v.x = sci(Math.max(d.n, d.p) / d.ni, 1); }
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
    const key = P.V > vbi - 0.1 ? 'ch2.say.flat' : Math.abs(P.V) < 0.005 ? 'ch2.say.zero' : P.V > 0 ? 'ch2.say.fwd' : 'ch2.say.rev';
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
    const v = { g: fmt(P.g), L: lenTxt(r.L), x: sig(r.tot), V: fmt(r.V, 2), vt: fmt(r.vt, 2), share: fmt(r.leakShare * 100) + '%' };
    putHTML('#c4Say', t('ch4.say.' + D.sayKey(P.g, P.mode, P.fs), v));
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
  // the slider is logarithmic: the pitch is rounded to what its label shows (whole nm from 20 nm, 0.1 nm below), so the
  // label, the half-pitch tile and the model all use the same number
  const roundPitch = x => x >= 20 ? Math.round(x) : Math.round(x * 10) / 10;
  const p = () => { const tool = L.TOOLS[radioVal('c5Tool')]; return { tool, key: radioVal('c5Tool'), mode: radioVal('c5Ill'), split: +radioVal('c5Split'), pitch: roundPitch(Math.pow(10, val('c5P'))) }; };
  const limit = P => { const k = P.key + P.mode; if (!(k in limCache)) limCache[k] = L.printLimit(P.tool.lam, P.tool.na, P.mode); return limCache[k]; };
  let cache = null;
  function model() {
    const P = p(), ep = L.exposurePitch(P.pitch, P.split), con = L.contrast(P.tool.lam, P.tool.na, ep, P.mode);
    const img = L.image(P.tool.lam, P.tool.na, ep, P.mode, 240);
    let lo = Infinity, hi = -Infinity; for (const q of img) { lo = Math.min(lo, q[1]); hi = Math.max(hi, q[1]); }
    // development threshold: the level above which the image is one target half-pitch wide, so that a single exposure
    // prints equal lines and spaces and each of several exposures leaves a line 1/(2·split) of its own period wide
    const want = 1 / (2 * P.split), frac = th => img.filter(q => q[1] > th).length / img.length;
    const thr = con > 1e-6 ? M.bisect(th => frac(th) - want, lo, hi, 30) : (lo + hi) / 2;
    cache = { P, ep, con, lo, hi, thr, ok: con >= L.CMIN, dark: con < 1e-6 };
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
        if (m.ok) { // the threshold line, named in the margin above the plot so the name never sits on the curve
          hline(c, f, m.thr, C.red); c.fillStyle = C.red; c.textAlign = 'right'; c.fillText(tt('ch5.cv.th'), f.R, f.T - 10);
          const lw = c.measureText(tt('ch5.cv.th')).width; c.strokeStyle = C.red; c.lineWidth = 1.3; c.setLineDash([5, 4]); c.beginPath(); c.moveTo(f.R - lw - 30, f.T - 10); c.lineTo(f.R - lw - 6, f.T - 10); c.stroke(); c.setLineDash([]);
        }
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
    const v = { ep: fmt(m.ep, m.ep < 20 ? 1 : 0), k1: fmt(L.k1(m.ep / 2, P.tool.lam, P.tool.na), 3), c: fmt(m.con, 2), splitNote: P.split > 1 ? t('ch5.split.note' + P.split) : '' };
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
  $('#c6M').value = E.pathCount(); $('#c6R').value = E.DEFAULTS.R; $('#c6P').value = E.DEFAULTS.P; $('#c6D').value = E.DEFAULTS.dose;
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
    putHTML('#c8Say', t(!d.ok ? 'ch8.say.lost' : d.dibl <= 50 && d.swing <= 1.1 * d.sLong ? 'ch8.say.good' : 'ch8.say.marginal', v));
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
        xTicks(c, f, f.X(20) - f.X(12) < 22 ? [20, 40, 60, 80, 100, 120] : [12, 20, 40, 60, 80, 100, 120], v => fmt(v), true); // on a narrow plot 12 and 20 would touch
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
    const v = { p: fmt(P.pitch), w: fmt(P.pitch / 2, 1), b: fmt(P.bar, 1), share: fmt(W.conductorShare('cu', P.pitch, P.bar) * 100) + '%', cu: rTxt(cu), ru: rTxt(ru), x: fmt(x), len: sig(P.len, 2), d: isFinite(dc) ? dTxt(dc, dr) : '—' };
    putHTML('#c9Say', t(!isFinite(cu) ? 'ch9.say.nocu' : ru < cu ? 'ch9.say.ru' : 'ch9.say.cu', v));
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
      const ym = x.asOf.split('-'), date = ym.length > 1 ? (effLang() === 'zh' ? t('ch11.date', { y: ym[0], m: +ym[1] }) : new Date(Date.UTC(+ym[0], +ym[1] - 1, 1)).toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })) : ym[0];
      const hide = f !== 'all' && f !== x.kind;
      return `<li data-kind="${x.kind}"${hide ? ' hidden' : ''}><div class="meta"><span class="tag ${x.kind}">${t('ch11.kind.' + x.kind)}</span><span>${t('ch11.asof', { d: date })}</span></div><div class="txt">${t('fr.' + x.id)}</div><div class="src">${t('ch11.src')}<a href="${x.url}" rel="noopener">${x.src}</a></div></li>`;
    }).join('');
  }
  window.__frRender = render;
  radios('c11F').forEach(r => r.addEventListener('change', render));
})();

/* ───────── static diagrams (STANDARD §4a): inline SVG built from small specs, every label from copy ─────────
   Two layouts: 'w' (viewBox 720 wide, used when the figure is at least 600 px wide) and 'n' (viewBox 340 wide).
   Text is 14 units, so it renders at 11.8 px or more in either layout at its narrowest (320 px screens).
   A label with a width limit wraps onto more lines. Drawn numbers come from models.js. */
const NS = 'http://www.w3.org/2000/svg', FS = 14, LH = 18;
function S(tag, a, parent) { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); if (parent) parent.appendChild(e); return e; }
const tint = (col, a) => { const n = parseInt(col.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
function mk(svg) {
  const g = {
    box(x, y, w, h, col, o) { o = o || {}; return S('rect', { x, y, width: Math.max(0, w), height: Math.max(0, h), rx: o.rx == null ? 0 : o.rx, fill: o.solid ? col : tint(col, o.a == null ? 0.13 : o.a), stroke: o.nostroke ? 'none' : col, 'stroke-width': o.sw || 1.2, 'stroke-dasharray': o.dash || 'none' }, svg); },
    line(x1, y1, x2, y2, col, o) { o = o || {}; const id = `url(#ar-${(col || C.mute).slice(1)})`; return S('line', { x1, y1, x2, y2, stroke: col || C.mute, 'stroke-width': o.sw || 1.6, 'stroke-dasharray': o.dash || 'none', 'marker-end': o.arrow ? id : 'none', 'marker-start': o.both ? id : 'none' }, svg); },
    path(d, col, o) { o = o || {}; return S('path', { d, fill: o.fill ? (o.solid ? o.fill : tint(o.fill, o.a == null ? 0.13 : o.a)) : 'none', stroke: o.nostroke ? 'none' : (col || C.mute), 'stroke-width': o.sw || 1.6, 'stroke-dasharray': o.dash || 'none', 'stroke-linejoin': 'round', 'marker-end': o.arrow ? `url(#ar-${(col || C.mute).slice(1)})` : 'none' }, svg); },
    circle(cx, cy, r, col, o) { o = o || {}; return S('circle', { cx, cy, r, fill: o.solid ? col : o.bg ? C.bg : tint(col, o.a == null ? 0.14 : o.a), stroke: col, 'stroke-width': o.sw || 1.4 }, svg); },
    // text: a copy key (or {raw} for language-neutral symbols), position; a = start|middle|end, c = colour class, w = wrap width
    text(x, y, key, o) {
      o = o || {}; const s = typeof key === 'object' ? key.raw : tt(key, o.vars);
      const e = S('text', { x, y, 'font-size': FS, 'text-anchor': o.a || 'start', 'dominant-baseline': 'central', class: o.c || '' }, svg);
      e.textContent = s; if (o.w) e.dataset.w = o.w; if (o.weight) e.setAttribute('font-weight', o.weight);
      return e;
    },
    // a dimension line with end ticks
    dim(x1, y1, x2, y2, col) { g.line(x1, y1, x2, y2, col || C.mute, { sw: 1.2 }); const v = x1 === x2; g.line(x1 - (v ? 4 : 0), y1 - (v ? 0 : 4), x1 + (v ? 4 : 0), y1 + (v ? 0 : 4), col || C.mute, { sw: 1.2 }); g.line(x2 - (v ? 4 : 0), y2 - (v ? 0 : 4), x2 + (v ? 4 : 0), y2 + (v ? 0 : 4), col || C.mute, { sw: 1.2 }); },
    // fixed charges: a ring with a minus or a plus drawn as strokes (not text)
    ion(x, y, plus, col) { g.circle(x, y, 6, col, { a: 0.18, sw: 1.2 }); g.line(x - 3, y, x + 3, y, col, { sw: 1.4 }); if (plus) g.line(x, y - 3, x, y + 3, col, { sw: 1.4 }); }
  };
  return g;
}
function arrowDefs(svg) {
  const d = S('defs', {}, svg);
  for (const col of [C.mute, C.gold, C.cyan, C.red, C.green, C.violet, C.ink]) {
    const m = S('marker', { id: 'ar-' + col.slice(1), viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, d);
    S('path', { d: 'M0,0 L10,5 L0,10 z', fill: col }, m);
  }
}
// wrap text that has a width limit: split at spaces (or between CJK characters) into tspans
function wrapTexts(svg) {
  for (const e of svg.querySelectorAll('text[data-w]')) {
    const maxw = +e.dataset.w; if (e.getComputedTextLength() <= maxw) continue;
    const s = e.textContent, x = e.getAttribute('x'), y0 = +e.getAttribute('y'), cjk = /[\u3000-\u9fff\uff00-\uffef]/.test(s);
    const toks = cjk ? s.match(/[A-Za-z0-9.,%+×–\-/()\[\]:_=²³κλ]+|\s+|./g) : s.split(/(\s+)/);
    e.textContent = ''; const lines = []; let cur = '';
    const probe = S('tspan', {}, e);
    const closing = /^[\u3001\u3002\uff0c\uff1b\uff1a\uff09\u201d,.;:)%]$/; // never start a line with closing punctuation
    for (const tk of toks) { const nx = cur + tk; probe.textContent = nx; if (e.getComputedTextLength() > maxw && cur.trim() && !closing.test(tk)) { lines.push(cur.trim()); cur = tk.trim() ? tk : ''; } else cur = nx; }
    if (cur.trim()) lines.push(cur.trim()); e.removeChild(probe);
    lines.forEach((l, i) => { const ts = S('tspan', { x, y: y0 + i * LH }, e); ts.textContent = l; });
  }
}
// panels side by side when wide, stacked when narrow; each panel: { h, draw(g, x, y, pw) }
function panels(L, cols, list) {
  const wide = L === 'w', W = wide ? 720 : 340, n = wide ? cols : 1, pw = W / n, rows = [];
  for (let i = 0; i < list.length; i += n) rows.push(list.slice(i, i + n));
  const hs = rows.map(r => Math.max(...r.map(q => q.h)));
  return { W, H: hs.reduce((a, b) => a + b, 0), draw(g) { let y = 0; rows.forEach((r, ri) => { r.forEach((q, ci) => q.draw(g, ci * pw, y, pw)); y += hs[ri]; }); } };
}
const DG = {};

// ch1: a dopant atom in the silicon lattice (flattened to a square grid; schematic). Electrons cyan, holes red.
DG.lattice = L => panels(L, 2, ['n', 'p'].map(tp => ({ h: 264, draw(g, x, y, pw) {
  const col = tp === 'n' ? C.cyan : C.red, cls = tp === 'n' ? 'c' : 'r', sp = 62, gx = x + (pw - 3 * sp) / 2, gy = y + 66;
  g.text(x + pw / 2, y + 16, 'dg.lattice.' + tp, { a: 'middle', c: cls, weight: 600, w: pw - 16 });
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
    const px = gx + c * sp, py = gy + r * sp, hole = tp === 'p' && r === 1 && c === 1;
    if (c < 3) g.line(px + 16, py, px + sp - 16, py, hole ? C.red : C.mute, { sw: hole ? 1.6 : 2.4, dash: hole ? '4 4' : 'none' });
    if (r < 2) g.line(px, py + 16, px, py + sp - 16, C.mute, { sw: 2.4 });
  }
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
    const px = gx + c * sp, py = gy + r * sp, dop = r === 1 && c === 1;
    g.circle(px, py, 15, dop ? col : C.mute, { a: dop ? 0.24 : 0.1 });
    g.text(px, py + 0.5, { raw: dop ? (tp === 'n' ? 'P' : 'B') : 'Si' }, { a: 'middle', c: dop ? cls : 'm', weight: dop ? 700 : 400 });
  }
  if (tp === 'n') { g.circle(gx + sp + 31, gy + sp - 31, 5, C.cyan, { solid: 1 }); g.path(`M${gx + sp + 38},${gy + sp - 35} q 8,-7 16,-2`, C.cyan, { sw: 1.4, arrow: 1 }); }
  else g.circle(gx + 1.5 * sp, gy + sp, 5.5, C.red, { bg: 1, sw: 1.8 });
  g.text(x + pw / 2, y + 226, 'dg.lattice.' + (tp === 'n' ? 'e' : 'h'), { a: 'middle', c: cls, w: pw - 24 });
} })));

// ch2: the junction at zero bias. The two sides of the depletion region are drawn in the ratio the model gives for the
// chapter's default doping (Na = 1e17, Nd = 1e16); everything else is schematic.
DG.junction = L => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 246 : 264, J = M.junction, w0 = J.width(1e17, 1e16, 0), xp = w0.xp * 1e7, xn = w0.xn * 1e7;
  return { W, H, draw(g) {
    const x0 = wide ? 10 : 5, x3 = W - x0, depW = wide ? 250 : 160, xa = (W - depW) / 2, xb = xa + depW, xj = xa + depW * xp / (xp + xn), y0 = 46, bh = 90;
    g.box(x0, y0, xa - x0, bh, C.red, { a: 0.12, nostroke: 1 }); g.box(xb, y0, x3 - xb, bh, C.cyan, { a: 0.12, nostroke: 1 });
    g.box(xa, y0, xj - xa, bh, C.red, { a: 0.04, nostroke: 1 }); g.box(xj, y0, xb - xj, bh, C.cyan, { a: 0.04, nostroke: 1 });
    g.box(x0, y0, x3 - x0, bh, C.mute, { a: 0, sw: 1 });
    g.line(xa, y0, xa, y0 + bh, C.mute, { sw: 1, dash: '3 3' }); g.line(xb, y0, xb, y0 + bh, C.mute, { sw: 1, dash: '3 3' }); g.line(xj, y0, xj, y0 + bh, C.ink, { sw: 1.2 });
    // mobile carriers: holes (open, red) on the p side, electrons (solid, cyan) on the n side; ten times fewer on the n side
    for (let r = 0; r < 4; r++) for (let x = x0 + 12 + (r % 2) * 9; x < xa - 8; x += 18) g.circle(x, y0 + 14 + r * 21, 3.6, C.red, { bg: 1, sw: 1.4 });
    for (let r = 0; r < 2; r++) for (let x = xb + 16 + r * 20; x < x3 - 8; x += 40) g.circle(x, y0 + 26 + r * 38, 3.4, C.cyan, { solid: 1 });
    // fixed ions: equal numbers on the two sides (the charges balance), packed tightly on the heavily doped side
    for (let i = 0; i < 4; i++) g.ion((xa + xj) / 2, y0 + 15 + i * 20, false, C.red);
    for (let i = 0; i < 4; i++) g.ion(xj + (xb - xj) * (0.3 + 0.4 * (i % 2)), y0 + 26 + Math.floor(i / 2) * 38, true, C.cyan);
    g.text((x0 + xa) / 2, 22, 'dg.junction.p', { a: 'middle', c: 'r', weight: 600, w: xa - x0 - 6 });
    g.text((xa + xb) / 2, 22, 'dg.junction.dep', { a: 'middle', weight: 600, w: depW - 6 });
    g.text((xb + x3) / 2, 22, 'dg.junction.n', { a: 'middle', c: 'c', weight: 600, w: x3 - xb - 6 });
    const yb = y0 + bh + 12; g.dim(xa, yb, xj, yb); g.dim(xj, yb, xb, yb);
    g.text(xj - 6, yb + 17, 'dg.junction.xp', { a: 'end', c: 'm', vars: { v: fmt(xp) } });
    g.text((xj + xb) / 2 + 8, yb + 17, 'dg.junction.xn', { a: 'middle', c: 'm', vars: { v: fmt(xn) } });
    g.line(xb - 8, yb + 44, xa + 8, yb + 44, C.gold, { sw: 2, arrow: 1 });
    g.text(W / 2, yb + 64, 'dg.junction.field', { a: 'middle', c: 'g', w: W - 24 });
  } };
};

// a planar MOSFET cross-section; s scales every length. Gate gold, channel and n regions cyan, p substrate red tint.
function fet(g, cx, yb, s, o) {
  const Lg = 120 * s, gh = 34 * s, ox = 10 * s, sw = 70 * s, sd = 36 * s, half = 150 * s, sh = o.subH * s;
  g.box(cx - half, yb, 2 * half, sh, C.red, { a: 0.1 });
  g.box(cx - Lg / 2 - sw, yb, sw, sd, C.cyan, { a: 0.3 }); g.box(cx + Lg / 2, yb, sw, sd, C.cyan, { a: 0.3 });
  g.box(cx - Lg / 2, yb - ox, Lg, ox, C.mute, { a: 0.55, sw: 1 });
  g.box(cx - Lg / 2, yb - ox - gh, Lg, gh, C.gold, { a: 0.45 });
  if (o.on) g.box(cx - Lg / 2, yb, Lg, 5 * s, C.cyan, { solid: 1, nostroke: 1 });
}
// ch3: the switch, off and on (schematic)
DG.mosfet = L => panels(L, 2, [false, true].map(on => ({ h: 250, draw(g, x, y, pw) {
  const cx = x + pw / 2, yb = y + 124;
  g.text(cx, y + 16, on ? 'dg.mos.on' : 'dg.mos.off', { a: 'middle', c: on ? 'g' : 'r', weight: 600, w: pw - 16 });
  fet(g, cx, yb, 1, { on, subH: 110 });
  g.text(cx, y + 97, 'dg.mos.g', { a: 'middle' });
  g.text(cx - 95, y + 142, 'dg.mos.s', { a: 'middle', c: 'c' }); g.text(cx + 95, y + 142, 'dg.mos.d', { a: 'middle', c: 'c' });
  g.line(cx + 70, y + 102, cx + 54, y + 117, C.mute, { sw: 1 }); g.text(cx + 73, y + 98, 'dg.mos.ox', { c: 'm', w: pw / 2 - 78 });
  if (on) g.line(cx - 48, y + 141, cx + 48, y + 141, C.cyan, { sw: 1.6, arrow: 1 });
  g.text(cx, y + 176, on ? 'dg.mos.ch' : 'dg.mos.nch', { a: 'middle', c: on ? 'c' : 'm', w: 220 });
  g.text(cx, y + 222, 'dg.mos.sub', { a: 'middle', c: 'r' });
} })));

// ch4: one generation of constant-field scaling, drawn at the model's ratio 1/κ (oxide thickness exaggerated in both)
DG.scaling = L => { const k = M.dennard.kappa(1); return panels(L, 2, [1, 1 / k].map((s, i) => ({ h: 282, draw(g, x, y, pw) {
  const cx = x + pw / 2, base = y + 182, yb = base - 60 * s, top = yb - 44 * s;
  g.text(cx, y + 16, i ? 'dg.scale.after' : 'dg.scale.before', { a: 'middle', c: i ? 'g' : '', weight: 600, w: pw - 16, vars: { k: fmt(k, 2) } });
  fet(g, cx, yb, s, { subH: 60 });
  g.dim(cx - 60 * s, top - 9, cx + 60 * s, top - 9, C.gold); g.text(cx, top - 24, { raw: i ? 'L/κ' : 'L' }, { a: 'middle', c: 'g' });
  g.text(x + 12, y + 206, i ? 'dg.scale.b' : 'dg.scale.a', { c: 'm', w: pw - 24 });
} }))); };

// ch5: which diffraction orders the lens collects (schematic; angles not to scale). Light gold, lens cyan.
DG.abbe = L => panels(L, 3, ['a', 'b', 'c'].map(k => ({ h: 328, draw(g, x, y, pw) {
  const cx = x + pw / 2, ym = y + 78, yl = y + 182, yw = y + 266, y1 = ym + 6, dy = yl - y1;
  const fine = k !== 'a', d0 = k === 'c' ? 50 : 0, sep = k === 'a' ? 52 : 100;
  g.text(cx, y + 16, 'dg.abbe.' + k, { a: 'middle', weight: 600, w: pw - 12 });
  g.line(cx - d0 * 30 / dy, y + 48, cx, ym - 3, C.gold, { sw: 2, arrow: 1 });
  g.box(cx - 62, ym, 124, 6, C.mute, { a: 0.2, sw: 1 });
  for (let i = 0, n = fine ? 10 : 5, w = 124 / n; i < n; i++) g.box(cx - 62 + i * w, ym, w / 2, 6, C.ink, { solid: 1, nostroke: 1 });
  g.path(`M${cx - 72},${yl} Q${cx},${yl - 24} ${cx + 72},${yl} Q${cx},${yl + 24} ${cx - 72},${yl} Z`, C.cyan, { fill: C.cyan, a: 0.16, sw: 1.2 });
  g.box(cx - 110, yl - 4, 38, 8, C.mute, { solid: 1, nostroke: 1 }); g.box(cx + 72, yl - 4, 38, 8, C.mute, { solid: 1, nostroke: 1 });
  const pass = [];
  for (const m of [-1, 0, 1]) {
    const dx = d0 + m * sep, inside = Math.abs(dx) < 70, xe = Math.max(-108, Math.min(108, dx)), f = dx ? xe / dx : 1;
    g.line(cx, y1, cx + xe, y1 + dy * f - (inside ? 0 : 5), C.gold, { sw: m === 0 ? 2 : 1.5, dash: inside ? 'none' : '5 4' });
    if (inside) { pass.push(m); g.line(cx + dx, yl, cx, yw - 6, C.gold, { sw: m === 0 ? 2 : 1.5 }); }
    const fy = 0.44, lx = cx + dx * fy + (m < 0 ? -9 : 9);
    g.text(lx, y1 + dy * fy - 6, { raw: m === 0 ? '0' : m > 0 ? '+1' : '−1' }, { a: m < 0 ? 'end' : 'start', c: inside ? 'g' : 'm' });
  }
  g.box(cx - 70, yw, 140, 10, C.mute, { a: 0.3, sw: 1 });
  if (pass.length < 2) g.box(cx - 70, yw - 5, 140, 5, C.gold, { a: 0.55, nostroke: 1 });
  else for (let i = 0, n = fine ? 10 : 5, w = 140 / n; i < n; i++) g.box(cx - 70 + i * w + w / 4, yw - 5, w / 2, 5, C.gold, { solid: 1, nostroke: 1 });
  g.text(cx - 68, ym + 3, 'dg.abbe.mask', { a: 'end', c: 'm' });
  g.text(cx - 112, yl + 24, 'dg.abbe.lens', { c: 'c' });
  g.text(cx - 76, yw + 5, 'dg.abbe.wafer', { a: 'end', c: 'm' });
  g.text(cx, yw + 30, 'dg.abbe.r' + k, { a: 'middle', c: pass.length < 2 ? 'r' : 'n', w: pw - 12 });
} })));

// ch6: the light path, one mark per reflection; the count and the fractions left come from the model's defaults
DG.euvpath = L => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 306 : 512, E = M.euv, P = E.PATH, R = E.DEFAULTS.R;
  const groups = [['col', P.collector], ['ill', P.illum], ['mask', P.mask], ['proj', P.proj]];
  return { W, H, draw(g) {
    const n = E.pathCount(), pts = [];
    g.box(3, 3, W - 6, H - 6, C.mute, { a: 0, dash: '6 5', rx: 10, sw: 1 });
    if (wide) {
      const xs = i => 124 + i * 50, top = 82, bot = 226; let i0 = 0;
      g.text(W - 14, 20, 'dg.euv.vac', { a: 'end', c: 'm' });
      for (const [key, cnt] of groups) {
        const xa = xs(i0) - 22, xb = xs(i0 + cnt - 1) + 22;
        g.box(xa, 60, xb - xa, 190, key === 'mask' ? C.violet : C.cyan, { a: 0.07, nostroke: 1, rx: 6 });
        g.text((xa + xb) / 2, 44, 'dg.euv.' + key, { a: 'middle', c: key === 'mask' ? 'v' : 'c', w: Math.max(72, xb - xa + 8) });
        i0 += cnt; g.text(xs(i0 - 1), 270, 'dg.euv.pct', { a: 'middle', c: 'g', vars: { v: fmt(Math.pow(R, i0) * 100, i0 === n ? 1 : 0) } });
      }
      pts.push([52, 154]); for (let i = 0; i < n; i++) pts.push([xs(i), i % 2 ? top : bot]); pts.push([xs(n - 1) + 46, bot + 4]);
      g.text(10, 96, 'dg.euv.src', { c: 'g', w: 88 });
      g.text(10, 270, 'dg.euv.rem', { c: 'm', w: 90 });
      g.box(xs(n - 1) + 20, bot + 6, 54, 8, C.mute, { a: 0.4, sw: 1 }); g.text(xs(n - 1) + 47, 290, 'dg.euv.wafer', { a: 'middle', c: 'm' });
    } else {
      const ys = i => 96 + i * 34, lx = 150, rx = 250; let i0 = 0;
      g.text(W / 2, 20, 'dg.euv.vac', { a: 'middle', c: 'm', w: W - 30 });
      for (const [key, cnt] of groups) {
        const ya = ys(i0) - 15, yb = ys(i0 + cnt - 1) + 15;
        g.box(10, ya, W - 20, yb - ya, key === 'mask' ? C.violet : C.cyan, { a: 0.07, nostroke: 1, rx: 6 });
        g.text(16, cnt > 1 ? ya + 16 : (ya + yb) / 2, 'dg.euv.' + key, { c: key === 'mask' ? 'v' : 'c', w: 112 });
        i0 += cnt; g.text(W - 16, ys(i0 - 1), 'dg.euv.pct', { a: 'end', c: 'g', vars: { v: fmt(Math.pow(R, i0) * 100, i0 === n ? 1 : 0) } });
      }
      pts.push([200, 52]); for (let i = 0; i < n; i++) pts.push([i % 2 ? rx : lx, ys(i)]); pts.push([200, ys(n - 1) + 40]);
      g.text(16, 52, 'dg.euv.src', { c: 'g', w: 160 });
      g.box(172, ys(n - 1) + 42, 56, 8, C.mute, { a: 0.4, sw: 1 }); g.text(16, ys(n - 1) + 46, 'dg.euv.wafer', { c: 'm' });
      g.text(W - 16, ys(n - 1) + 46, 'dg.euv.rem', { a: 'end', c: 'm', w: 96 });
    }
    g.path('M' + pts.map(q => q.join(',')).join(' L'), C.gold, { sw: 1.8, arrow: 1 });
    g.circle(pts[0][0], pts[0][1], 7, C.gold, { solid: 1 });
    let i = 0;
    for (const [key, cnt] of groups) for (let j = 0; j < cnt; j++, i++) {
      const [mx, my] = pts[i + 1], col = key === 'mask' ? C.violet : C.cyan;
      if (wide) g.line(mx - 15, my + (i % 2 ? -3 : 3), mx + 15, my + (i % 2 ? -3 : 3), col, { sw: 5 });
      else g.line(mx + (i % 2 ? 3 : -3), my - 11, mx + (i % 2 ? 3 : -3), my + 11, col, { sw: 5 });
    }
  } };
};

// ch7: a two-input NAND cell of the roadmap's "3 nm" generation, to scale (1.25 px per nm), from the model's node table
DG.cell = L => {
  const wide = L === 'w', W = wide ? 720 : 340, nd = M.cells.NODES.g48m24, k = 1.25, cw = 3 * nd.cpp * k, ch = nd.tracks * nd.mmp * k, H = wide ? 300 : 300 + 5 * 42;
  return { W, H, draw(g) {
    const x0 = wide ? 60 : 80, y0 = 54;
    g.box(x0, y0, cw, ch, C.cyan, { a: 0.07, sw: 1.5 });
    for (let i = 0; i < nd.tracks; i++) g.box(x0, y0 + (i + 0.25) * nd.mmp * k, cw, nd.mmp * k / 2, C.violet, { a: 0.45, nostroke: 1 });
    for (let i = 0; i < 3; i++) g.box(x0 + (i + 0.5) * nd.cpp * k - 7, y0, 14, ch, C.gold, { a: 0.8, nostroke: 1 });
    g.dim(x0, y0 - 14, x0 + cw, y0 - 14); g.text(x0 + cw / 2, y0 - 30, { raw: 'A' }, { a: 'middle', weight: 700 });
    const gx = i => x0 + (i + 0.5) * nd.cpp * k; g.dim(gx(0), y0 + ch + 14, gx(1), y0 + ch + 14, C.gold); g.text((gx(0) + gx(1)) / 2, y0 + ch + 30, { raw: 'B' }, { a: 'middle', c: 'g', weight: 700 });
    const ty = i => y0 + (i + 0.5) * nd.mmp * k; g.dim(x0 - 14, ty(0), x0 - 14, ty(1), C.violet); g.text(x0 - 26, (ty(0) + ty(1)) / 2, { raw: 'C' }, { a: 'end', c: 'v', weight: 700 });
    g.dim(x0 + cw + 14, y0, x0 + cw + 14, y0 + ch); g.text(x0 + cw + 26, y0 + ch / 2, { raw: 'D' }, { weight: 700 });
    g.box(x0, y0 + ch + 44, nd.name * k, 6, C.red, { solid: 1, nostroke: 1 }); g.text(x0 + 14, y0 + ch + 47, { raw: 'E' }, { c: 'r', weight: 700 });
    const v = { cpp: fmt(nd.cpp), mmp: fmt(nd.mmp), tr: fmt(nd.tracks), w: fmt(3 * nd.cpp), h: fmt(nd.tracks * nd.mmp), name: fmt(nd.name) };
    ['w', 'cpp', 'mmp', 'h', 'name'].forEach((key, i) => g.text(wide ? 330 : 6, (wide ? 66 : y0 + ch + 76) + i * 42, 'dg.cell.' + key, { w: wide ? 380 : 328, vars: v, c: ['', 'g', 'v', '', 'r'][i] }));
  } };
};

// ch8: how many sides of the channel the gate touches (cross-sections across the current flow; schematic)
DG.shapes = L => panels(L, 3, ['planar', 'finfet', 'gaa'].map(k => ({ h: 212, draw(g, x, y, pw) {
  const cx = x + pw / 2, gate = { a: 0.45 }, yb = y + 168;
  g.text(cx, y + 16, 'dg.shape.' + k, { a: 'middle', weight: 600, w: pw - 14 });
  g.box(cx - 92, yb, 184, 26, C.mute, { a: 0.14, sw: 1 });
  if (k === 'planar') {
    g.box(cx - 92, yb - 34, 184, 34, C.mute, { a: 0.14, sw: 1 }); g.box(cx - 50, yb - 34, 100, 9, C.cyan, { solid: 1, nostroke: 1 });
    g.box(cx - 50, yb - 66, 100, 30, C.gold, gate); g.text(cx, yb - 51, 'dg.shape.gate', { a: 'middle' });
    g.text(cx + 58, yb - 51, 'dg.shape.ch', { c: 'c' }); g.path(`M${cx + 55},${yb - 46} L${cx + 44},${yb - 31}`, C.cyan, { sw: 1 });
  } else if (k === 'finfet') {
    g.path(`M${cx - 42},${yb} V${yb - 104} H${cx + 42} V${yb} H${cx + 13} V${yb - 78} H${cx - 13} V${yb} Z`, C.gold, { fill: C.gold, a: 0.45, sw: 1.2 });
    g.box(cx - 11, yb - 76, 22, 76, C.cyan, { solid: 1, nostroke: 1 });
    g.text(cx, yb - 91, 'dg.shape.gate', { a: 'middle' }); g.text(cx + 50, yb - 40, 'dg.shape.ch', { c: 'c' }); g.line(cx + 47, yb - 40, cx + 13, yb - 40, C.cyan, { sw: 1 });
  } else {
    g.box(cx - 50, yb - 112, 100, 112, C.gold, gate);
    for (let i = 0; i < 3; i++) g.box(cx - 36, yb - 84 + i * 28, 72, 10, C.cyan, { solid: 1, nostroke: 1 });
    g.text(cx, yb - 99, 'dg.shape.gate', { a: 'middle' }); g.text(cx + 58, yb - 51, 'dg.shape.ch', { c: 'c' }); g.line(cx + 55, yb - 51, cx + 37, yb - 51, C.cyan, { sw: 1 });
  }
  g.text(cx, yb + 13, 'dg.shape.sub', { a: 'middle', c: 'm' });
} })));

// ch9: the wiring stack (schematic) and one bottom-layer wire at 24 nm pitch drawn to scale from the model's geometry
DG.wires = L => panels(L, 2, [{ h: 250, draw(g, x, y, pw) {
  const x0 = x + 10, ww = 168, lx = x0 + ww + 12, lw = pw - ww - 30;
  g.text(x + pw / 2, y + 16, 'dg.wire.stack', { a: 'middle', weight: 600, w: pw - 16 });
  for (let i = 0; i < 2; i++) g.box(x0 + 8 + i * 84, y + 44, 68, 38, C.copper, { a: 0.75, nostroke: 1 });
  for (let r = 0; r < 2; r++) for (let i = 0; i < 5; i++) g.box(x0 + 4 + i * 34 + r * 8, y + 96 + r * 28, 18, 20, C.copper, { a: 0.75, nostroke: 1 });
  for (let r = 0; r < 2; r++) for (let i = 0; i < 11; i++) g.box(x0 + 2 + i * 15 + r * 4, y + 158 + r * 20, 7, 12, C.copper, { a: 0.75, nostroke: 1 });
  g.box(x0, y + 202, ww, 26, C.cyan, { a: 0.18, sw: 1 }); g.text(x0 + ww / 2, y + 215, 'dg.wire.fet', { a: 'middle', c: 'c' });
  g.text(lx, y + 54, 'dg.wire.top', { c: 'm', w: lw }); g.text(lx, y + 112, 'dg.wire.mid', { c: 'm', w: lw }); g.text(lx, y + 160, 'dg.wire.low', { c: 'm', w: lw });
} }, { h: 250, draw(g, x, y, pw) {
  const Wm = M.wires, p = 24, b = Wm.METALS.cu.barrier, gc = Wm.geom('cu', p, b), k = 5, cx = x + pw / 2, y0 = y + 62, xc = cx - 82, xr = cx + 82;
  g.text(cx, y + 16, 'dg.wire.dim', { a: 'middle', weight: 600, w: pw - 16, vars: { p: fmt(p), w: fmt(gc.w), h: fmt(gc.h) } });
  g.text(xc, y + 48, 'dg.wire.cu', { a: 'middle', c: '' }); g.text(xr, y + 48, 'dg.wire.ru', { a: 'middle', c: 'v' });
  g.box(xc - gc.w * k / 2, y0, gc.w * k, gc.h * k, C.mute, { a: 0.6, sw: 1 }); g.box(xc - gc.wc * k / 2, y0, gc.wc * k, gc.hc * k, C.copper, { solid: 1, nostroke: 1 });
  g.box(xr - gc.w * k / 2, y0, gc.w * k, gc.h * k, C.violet, { solid: 1, nostroke: 1 });
  g.text(xc, y0 + gc.h * k + 18, 'dg.wire.bar', { a: 'middle', c: 'm', w: 150, vars: { b: fmt(b), v: fmt(Wm.conductorShare('cu', p, b) * 100) } });
  g.text(xr, y0 + gc.h * k + 18, 'dg.wire.nobar', { a: 'middle', c: 'v', w: 150 });
} }]);

// ch10: one large die against chiplets on an interposer (side view; schematic)
DG.package = L => panels(L, 2, [false, true].map(split => ({ h: 206, draw(g, x, y, pw) {
  const cx = x + pw / 2;
  g.text(cx, y + 16, split ? 'dg.pkg.chiplet' : 'dg.pkg.mono', { a: 'middle', weight: 600, w: pw - 16 });
  g.box(cx - 140, y + 158, 280, 26, C.mute, { a: 0.16, sw: 1 }); g.text(cx, y + 171, 'dg.pkg.sub', { a: 'middle', c: 'm' });
  if (!split) {
    for (let i = 0; i < 12; i++) g.circle(cx - 99 + i * 18, y + 152, 4, C.mute, { a: 0.5, sw: 1 });
    g.box(cx - 110, y + 100, 220, 46, C.green, { a: 0.2 }); g.text(cx, y + 123, 'dg.pkg.die', { a: 'middle', c: 'n' });
  } else {
    for (let i = 0; i < 9; i++) g.circle(cx - 96 + i * 24, y + 153, 4, C.mute, { a: 0.5, sw: 1 });
    g.box(cx - 124, y + 124, 248, 24, C.violet, { a: 0.2 }); g.text(cx, y + 136, 'dg.pkg.int', { a: 'middle', c: 'v' });
    for (let i = 0; i < 4; i++) { const px = cx - 118 + i * 60; g.box(px, y + 88, 54, 28, C.green, { a: 0.2 }); for (let j = 0; j < 5; j++) g.circle(px + 7 + j * 10, y + 120, 2.2, C.mute, { a: 0.6, sw: 0.8 }); }
    g.text(cx - 124, y + 68, 'dg.pkg.chip', { c: 'n' });
    g.box(cx + 82, y + 46, 42, 24, C.red, { a: 0.2 }); g.line(cx + 88, y + 50, cx + 118, y + 66, C.red, { sw: 1.6 }); g.line(cx + 118, y + 50, cx + 88, y + 66, C.red, { sw: 1.6 });
  }
} })));

// ch11: power wires above the transistors against power wires on the back of a thinned wafer (schematic)
DG.bspdn = L => panels(L, 2, [false, true].map(back => ({ h: 262, draw(g, x, y, pw) {
  const cx = x + pw / 2, x0 = cx - 130, sig = (px, py, w, h) => g.box(px, py, w, h, C.violet, { a: 0.7, nostroke: 1 }), pwr = (px, py, w, h) => g.box(px, py, w, h, C.red, { a: 0.8, nostroke: 1 });
  g.text(cx, y + 16, back ? 'dg.bs.back' : 'dg.bs.front', { a: 'middle', weight: 600, w: pw - 16 });
  const yt = y + 150;                                   // top of the transistor layer
  g.box(x0, yt, 260, 20, C.cyan, { a: 0.2, sw: 1 }); g.text(cx, yt + 10, 'dg.bs.fet', { a: 'middle', c: 'c' });
  if (!back) {
    g.box(x0, yt + 20, 260, 40, C.mute, { a: 0.14, sw: 1 }); g.text(cx, yt + 40, 'dg.bs.si', { a: 'middle', c: 'm' });
    for (let i = 0; i < 3; i++) { pwr(x0 + 14 + i * 100, y + 58, 32, 16); pwr(x0 + 26 + i * 100, y + 74, 8, 76); }
    for (let i = 0; i < 2; i++) { sig(x0 + 62 + i * 100, y + 62, 34, 10); for (let r = 0; r < 3; r++) for (let j = 0; j < 3; j++) sig(x0 + 52 + i * 100 + j * 18, y + 88 + r * 20, 10, 10); }
  } else {
    for (let i = 0; i < 4; i++) sig(x0 + 16 + i * 62, y + 62, 40, 10);
    for (let r = 0; r < 3; r++) for (let j = 0; j < 14; j++) sig(x0 + 8 + j * 18, y + 88 + r * 20, 10, 10);
    g.box(x0, yt + 20, 260, 10, C.mute, { a: 0.14, sw: 1 });
    for (let i = 0; i < 3; i++) { pwr(x0 + 26 + i * 100, yt + 20, 8, 16); pwr(x0 + 10 + i * 100, yt + 36, 40, 16); }
  }
  const ly = y + 236; sig(x0, ly - 5, 12, 10); g.text(x0 + 18, ly, 'dg.bs.sig', { c: 'v' }); pwr(cx + 4, ly - 5, 12, 10); g.text(cx + 22, ly, 'dg.bs.pwr', { c: 'r' });
} })));

const dgLayout = new WeakMap();
function renderDiagrams(force) {
  for (const fig of document.querySelectorAll('figure.dia')) {
    const box = fig.querySelector('.svg'), L = fig.clientWidth >= 600 ? 'w' : 'n';
    if (!force && dgLayout.get(fig) === L + effLang()) continue;
    dgLayout.set(fig, L + effLang());
    const spec = DG[fig.dataset.dg](L);
    box.textContent = '';
    const svg = S('svg', { viewBox: `0 0 ${spec.W} ${spec.H}`, role: 'img', 'aria-label': tt('dg.' + fig.dataset.dg + '.aria'), class: L }, box);
    arrowDefs(svg); spec.draw(mk(svg)); wrapTexts(svg);
  }
}

/* ───────── loop ───────── */
applyLang();
function tick() {
  for (const s of sims) if (s.vis && s.dirty) { s.draw(); s.dirty = false; }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
window.__essayReady = true;
})();
