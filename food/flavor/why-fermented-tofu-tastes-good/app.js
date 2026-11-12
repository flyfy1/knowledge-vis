/* Why fermented tofu tastes good: wiring, drawing, i18n and on-screen gating. All visible text comes from copy.*.js. */
(() => {
'use strict';
const M = window.TofuModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const C = { bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', dimfill: '#3a4254' };
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmt = M.fmt, pct = M.pct, sig = M.sig;

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
// resolve a model sentence {key, v} whose values may be copy keys or lists of copy keys
function sayText(o) {
  const v = {};
  for (const [k, x] of Object.entries(o.v)) v[k] = x && x.k ? t(x.k) : x && x.list ? x.list.map(q => t(q)).join(t('list.sep')) : x;
  return t(o.key, v);
}
const effLang = () => (COPY[lang] ? lang : 'zh');
function applyLang() {
  document.documentElement.lang = effLang() === 'zh' ? 'zh-CN' : 'en';
  document.title = t('doc.title');
  const md = document.querySelector('meta[name=description]');
  if (md) md.content = t('doc.desc');
  document.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(e => { e.innerHTML = t(e.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-aria]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.i18nAria)); });
  document.querySelectorAll('[data-hk]').forEach(e => { e.dataset.h = t(e.dataset.hk); });
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
const io = new IntersectionObserver(es => es.forEach(e => { for (const s of sims) if (s.cvs.includes(e.target)) { s.vis = s.cvs.some(cv => cv.__vis = (cv === e.target ? e.isIntersecting : cv.__vis)); s.dirty = true; } }), { rootMargin: '60px' });
function reg(cvs, o) { o.cvs = [].concat(cvs); o.vis = false; o.dirty = true; sims.push(o); o.cvs.forEach(cv => io.observe(cv)); return o; }
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
function axes(c, f, xLab, yLab) {
  c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.T); c.lineTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
  c.fillStyle = C.mute; c.font = FONT;
  if (yLab) { c.textAlign = 'left'; c.fillText(yLab, f.L + 6, f.T - 10); }
  if (xLab) { c.textAlign = 'right'; c.fillText(xLab, f.R, f.B + 24); }
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
function cursorDot(c, x, y, col) { c.fillStyle = col; c.beginPath(); c.arc(x, y, 4.5, 0, 6.283); c.fill(); }
function clock(until, speed) { return { t: reduce ? until : 0, until, speed, restart() { this.t = reduce ? this.until : 0; }, tick(dt) { const was = this.t; this.t = Math.min(this.until, this.t + dt * this.speed); return this.t !== was; } }; }
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const pow10 = e => e === 0 ? '1' : e === 1 ? '10' : e < 0 ? '10⁻' + SUP[-e] : '10' + String(e).split('').map(d => SUP[+d]).join('');

/* ───────── 01 random scission ───────── */
(() => {
  const cv = $('#scCv'), sP = $('#scP'), CH = 8;
  let N = 40; // 20 residues per chain on narrow screens so each cell stays visible
  let seed = 7, smp = null;
  const p = () => +sP.value / 100;
  const redoSample = () => { N = cv.getBoundingClientRect().width < 480 ? 20 : 40; smp = M.scission.sample(seed, CH, N, p()); };
  redoSample();
  const sim = reg(cv, {
    draw() {
      if ((w0 => (w0 < 480 ? 20 : 40))(cv.getBoundingClientRect().width) !== N) { redoSample(); text(); }
      const { c, w, h } = fit(cv), cell = Math.max(4, Math.min((w - 16) / N, (h - 16) / (CH * 1.7)));
      const bw = cell * 0.78, rowH = (h - 16) / CH, ox = (w - cell * N) / 2;
      for (let k = 0; k < CH; k++) {
        const cut = smp.cuts[k], y = 8 + rowH * k + (rowH - bw) / 2;
        for (let i = 0; i < N; i++) {
          const left = i === 0 || cut[i - 1], right = i === N - 1 || cut[i], free = left && right, x = ox + i * cell;
          c.fillStyle = free ? C.gold : 'rgba(99,199,230,.55)';
          c.fillRect(x + (cell - bw) / 2, y, bw, bw);
          if (i < N - 1 && !cut[i]) { c.fillStyle = 'rgba(99,199,230,.55)'; c.fillRect(x + (cell + bw) / 2, y + bw * 0.38, cell - bw, bw * 0.24); }
        }
      }
    }
  });
  function text() {
    const P = p(); let frags = 0; for (const cut of smp.cuts) frags += 1 + cut.filter(Boolean).length;
    put('#scPo', pct(P)); put('#scFree', pct(smp.free, 1)); put('#scTh', pct(P * P, 1));
    put('#scLen', fmt(CH * N / frags, 1)); put('#scNeed', pct(M.scission.pForFree(0.25)));
    putHTML('#scSay', sayText(M.say.scission(P)));
  }
  sim.text = text;
  sP.addEventListener('input', () => { redoSample(); sim.dirty = true; text(); });
  on('#scSeed', 'click', () => { seed++; redoSample(); sim.dirty = true; text(); });
  text();
})();

/* ───────── 02 endo + exo ───────── */
(() => {
  const cv = $('#enCv'), cv2 = $('#en2Cv'), E = M.enzymes, DAYS = 90, ck = clock(DAYS, 9);
  const runs = {}; for (const m of ['endo', 'exo', 'both']) runs[m] = E.run(m, DAYS, 0.25, 0.5);
  const mode = () => radioVal('enMode');
  const rowAt = t => { const r = runs[mode()]; return r[Math.min(r.length - 1, Math.round(t / 0.5))]; };
  const BINS = [[1, 1], [2, 5], [6, 20], [21, 50], [51, 100], [101, 200]];
  const sim = reg([cv, cv2], {
    step(dt) { if (ck.tick(dt)) { this.dirty = true; text(); } if (this.dirty) { this.draw(); this.dirty = false; } },
    draw() {
      { const { c, w, h } = fit(cv), f = frame(w, h, [30, 14, 38, 46], 0, DAYS, 0, 0.35);
        yTicks(c, f, [0, 0.1, 0.2, 0.3], v => pct(v)); axes(c, f, t('ch2.cv.x'), t('ch2.cv.y'));
        xTicks(c, f, [0, 30, 60, 90], v => fmt(v), false);
        for (const m of ['endo', 'exo', 'both']) if (m !== mode()) path(c, runs[m].map(q => [q.t, q.free]), f.X, f.Y, C.dimfill, 1.6);
        const shown = runs[mode()].filter(q => q.t <= ck.t + 1e-9).map(q => [q.t, q.free]);
        path(c, shown, f.X, f.Y, C.gold); if (shown.length) { const q = shown[shown.length - 1]; cursorDot(c, f.X(q[0]), f.Y(q[1]), C.gold); } }
      { const { c, w, h } = fit(cv2), row = rowAt(ck.t), n = row.hist, tot = 200;
        const f = frame(w, h, [26, 10, 34, 46], 0, BINS.length, 0, 1);
        yTicks(c, f, [0, 0.5, 1], v => pct(v)); axes(c, f, t('ch2.cv.len'), t('ch2.cv.share'));
        BINS.forEach(([a, b], i) => {
          let s = 0; for (let L = a; L <= b; L++) s += L * n[L]; s /= tot;
          const x0 = f.X(i) + 6, x1 = f.X(i + 1) - 6; c.fillStyle = i === 0 ? C.gold : C.cyan; c.fillRect(x0, f.Y(s), x1 - x0, f.B - f.Y(s));
          c.fillStyle = C.mute; c.textAlign = 'center'; c.fillText(a === b ? fmt(a) : x1 - x0 > 56 ? fmt(a) + '–' + fmt(b) : '≤' + fmt(b), (x0 + x1) / 2, f.B + 11);
        }); }
    }
  });
  function text() {
    const row = rowAt(ck.t), done = ck.t >= DAYS - 1e-9;
    put('#enDay', fmt(row.t)); put('#enFree', pct(row.free, 1)); put('#enMean', fmt(row.mean, row.mean < 10 ? 1 : 0)); put('#enFrags', fmt(row.frags, row.frags < 10 ? 1 : 0));
    putHTML('#enSay', sayText(M.say.enzymes(mode(), row, done)));
  }
  sim.text = text;
  radios('enMode').forEach(r => r.addEventListener('change', () => { ck.restart(); sim.dirty = true; text(); }));
  on('#enReplay', 'click', () => { ck.restart(); sim.dirty = true; text(); });
  text();
})();

/* ───────── 03 umami synergy ───────── */
(() => {
  const cv = $('#umCv'), U = M.umami, F = U.FOOD, sW = $('#umW');
  const w = () => +sW.value / 100;
  const curve = []; for (let i = 0; i <= 200; i++) { const x = i / 200; curve.push([x, U.euc(U.mix(F.sufu, F.pork, x))]); }
  const eS = U.euc(F.sufu), eP = U.euc(F.pork);
  const sim = reg(cv, {
    draw() {
      const { c, w: W, h } = fit(cv), f = frame(W, h, [30, 16, 38, 40], 0, 1, 0, 13);
      yTicks(c, f, [0, 4, 8, 12], v => fmt(v)); axes(c, f, t('ch3.cv.x'), t('ch3.cv.y'));
      xTicks(c, f, [0, 0.25, 0.5, 0.75, 1], v => pct(v), false);
      path(c, [[0, eP], [1, eS]], f.X, f.Y, C.mute, 1.5, [5, 4]);
      path(c, curve, f.X, f.Y, C.cyan);
      const x = w(); cursorDot(c, f.X(x), f.Y(U.euc(U.mix(F.sufu, F.pork, x))), C.gold);
    }
  });
  function text() {
    const x = w(), m = U.mix(F.sufu, F.pork, x), s = U.sums(m);
    put('#umWo', pct(x)); put('#umGlu', t('ch3.unit.mg', { v: fmt(s.u * 1000, 1) })); put('#umNuc', t('ch3.unit.mg', { v: fmt(s.v * 1000, 1) }));
    put('#umEuc', t('ch3.unit.g', { v: sig(U.euc(m)) })); put('#umAdd', t('ch3.unit.g', { v: sig(x * eS + (1 - x) * eP) }));
    putHTML('#umSay', sayText(M.say.umami(x)));
  }
  sim.text = text;
  sW.addEventListener('input', () => { sim.dirty = true; text(); });
  text();
})();

/* ───────── 04 water activity and ripening ───────── */
(() => {
  const cv = $('#awCv'), cv2 = $('#aw2Cv'), Wt = M.water, sW = $('#awW'), box = $('#awOrgs');
  const curve = []; for (let i = 0; i <= 264; i++) curve.push([i / 10, Wt.aw(i / 10)]);
  const sim = reg([cv, cv2], {
    draw() {
      const w = +sW.value, a = Wt.aw(w);
      { const { c, w: W, h } = fit(cv), f = frame(W, h, [30, 14, 38, 46], 0, 26.4, 0.74, 1);
        yTicks(c, f, [0.75, 0.8, 0.85, 0.9, 0.95, 1], v => fmt(v, 2)); axes(c, f, t('ch4.cv.salt'), t('ch4.cv.aw'));
        xTicks(c, f, [0, 5, 10, 15, 20, 25], v => fmt(v), false);
        for (const l of Wt.LIMITS) { c.strokeStyle = a >= l.aw ? C.red : C.dimfill; c.lineWidth = 1.4; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(f.L, f.Y(l.aw)); c.lineTo(f.R, f.Y(l.aw)); c.stroke(); c.setLineDash([]); }
        path(c, curve, f.X, f.Y, C.cyan); cursorDot(c, f.X(Math.min(w, 26.4)), f.Y(a), C.gold); }
      { const { c, w: W, h } = fit(cv2), f = frame(W, h, [24, 14, 36, 46], 4, 18, 0, 1.2), fit_ = Wt.fit();
        yTicks(c, f, [0, 0.5, 1], v => fmt(v, 1)); axes(c, f, t('ch4.cv.psalt'), t('ch4.cv.rate'));
        xTicks(c, f, [4, 8, 11, 14, 18], v => fmt(v), false);
        const L = x => Math.max(0, fit_.icpt + fit_.slope * x);
        path(c, [[4, L(4)], [8, L(8)]], f.X, f.Y, C.mute, 1.5, [5, 4]); path(c, [[14, L(14)], [16.05, 0], [18, 0]], f.X, f.Y, C.mute, 1.5, [5, 4]);
        path(c, [[8, L(8)], [14, L(14)]], f.X, f.Y, C.mute, 1.8);
        for (const p of Wt.HAN) cursorDot(c, f.X(p.s), f.Y(Wt.rate(p)), C.gold);
        if (w >= 4 && w <= 18) { c.strokeStyle = C.cyan; c.lineWidth = 1.2; c.beginPath(); c.moveTo(f.X(w), f.T); c.lineTo(f.X(w), f.B); c.stroke(); } }
    }
  });
  function text() {
    const w = +sW.value, a = Wt.aw(w), g = Wt.growers(a), inRange = w >= 8 && w <= 14;
    put('#awWo', fmt(w, 1) + '%'); put('#awM', t('ch4.unit.m', { v: fmt(Wt.molality(Math.min(w, Wt.SAT)), 2) })); put('#awA', fmt(a, 3));
    put('#awG', t('ch4.unit.grow', { v: fmt(g.length), n: fmt(g.length) }));
    const r = Wt.rateAt(w);
    put('#awR', inRange ? t('ch4.unit.rate', { v: fmt(r, 2) }) : t('ch4.unit.out'));
    put('#awD', !inRange ? t('ch4.unit.out') : r > 0 ? t('ch4.unit.days', { v: fmt(Wt.daysTo(w, 32)) }) : t('ch4.unit.none'));
    const html = Wt.LIMITS.map(l => `<span class="${a >= l.aw ? 'on' : ''}">${t('ch4.org.' + l.id)} ${fmt(l.aw, 2)}</span>`).join('');
    if (box.__h !== html) { box.innerHTML = html; box.__h = html; }
    putHTML('#awSay', sayText(M.say.water(w)));
  }
  sim.text = text;
  sW.addEventListener('input', () => { sim.dirty = true; text(); });
  text();
})();

/* ───────── 05 / 08 odour bars ───────── */
const GCOL = { fat: C.gold, green: C.green, stink: C.red, fruit: C.violet };
function bars(c, w, h, rows, val, lo, hi, line, dimBelow, axisKey) {
  c.font = FONT; let lw = 0; for (const r of rows) lw = Math.max(lw, c.measureText(t('ch5.cmp.' + r.id)).width);
  // labels must fit the left column: on narrow screens shrink their font rather than let long names run off the canvas
  const cap = w * 0.42, ls = lw + 14 > cap ? Math.max(0.75, (cap - 14) / lw) : 1, LF = FONT.replace('12px', (12 * ls).toFixed(1) + 'px');
  const L = Math.min(lw * ls + 14, cap), R = w - 10, T = 16, B = h - 34, rh = (B - T) / rows.length;
  const X = v => L + (R - L) * (Math.log10(v) - lo) / (hi - lo);
  c.strokeStyle = C.grid; c.fillStyle = C.mute; c.textAlign = 'center';
  for (let e = lo; e <= hi; e++) { const x = X(Math.pow(10, e)); c.beginPath(); c.moveTo(x, T); c.lineTo(x, B); c.stroke(); if ((e - lo) % (w < 480 ? 2 : 1) === 0) c.fillText(pow10(e), x, B + 11); }
  c.textAlign = 'right'; c.fillText(t(axisKey), R, B + 26);
  const nd = [];
  rows.forEach((r, i) => {
    const y = T + i * rh, v = val(r);
    c.fillStyle = C.ink; c.textAlign = 'right'; c.font = LF; c.fillText(t('ch5.cmp.' + r.id), L - 8, y + rh / 2); c.font = FONT;
    if (!(v > 0)) { nd.push(y + rh / 2); return; }
    const x1 = Math.max(L + 2, X(Math.max(v, Math.pow(10, lo))));
    c.fillStyle = dimBelow && v < line ? C.dimfill : GCOL[r.g]; c.fillRect(L, y + rh * 0.2, x1 - L, rh * 0.6);
  });
  if (line != null) { const x = X(line); c.strokeStyle = C.ink; c.lineWidth = 1.4; c.setLineDash([5, 4]); c.beginPath(); c.moveTo(x, T - 6); c.lineTo(x, B); c.stroke(); c.setLineDash([]); }
  // "not detected" goes on top of the threshold / dilution line, on a patch of background, so the line never runs through it
  const ndt = t('ch5.cv.nd'), tw = c.measureText(ndt).width;
  for (const yc of nd) { c.fillStyle = C.bg; c.fillRect(R - tw - 4, yc - rh * 0.35, tw + 4, rh * 0.7); c.fillStyle = C.mute; c.textAlign = 'right'; c.fillText(ndt, R, yc); }
}
(() => {
  const cv = $('#odCv'), A = M.aroma;
  const day = () => +radioVal('odDay'), sort = () => radioVal('odSort');
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), d = day(), byO = sort() === 'oav';
      const rows = byO ? A.byOav(d) : A.byConc(d);
      if (byO) bars(c, w, h, rows, r => r.oav, -1, 5, 1, false, 'ch5.cv.oav');
      else bars(c, w, h, rows, r => r.conc, -3, 2, null, false, 'ch5.cv.conc');
    }
  });
  function text() {
    const d = day(), tc = A.byConc(d)[0], to = A.byOav(d)[0];
    put('#odTc', t('ch5.cmp.' + tc.id)); put('#odTo', t('ch5.cmp.' + to.id)); put('#odOo', sig(to.oav)); put('#odN', fmt(A.smelled(d, 1).length));
    putHTML('#odSay', sayText(M.say.aroma(d)));
  }
  sim.text = text;
  [...radios('odDay'), ...radios('odSort')].forEach(r => r.addEventListener('change', () => { sim.dirty = true; text(); }));
  text();
})();

/* ───────── 06 century egg ───────── */
(() => {
  const cv = $('#egCv'), E = M.egg, sB = $('#egB'), sG = $('#egG'), DAYS = 42, ck = clock(DAYS, 4.2);
  let ser = null;
  function model() {
    const b = +sB.value, g = +sG.value, a = E.radius(g), cs = E.KAPPA * b, pts = [];
    for (let d = 0; d <= DAYS + 1e-9; d += 0.5) pts.push({ d, w: cs * E.mean(E.YOLK, 1, a, d * 86400, null, 40), y: cs * E.mean(0, E.YOLK, a, d * 86400, null, 40) });
    ser = { b, g, a, cs, pts };
  }
  model();
  const at = d => ser.pts[Math.min(ser.pts.length - 1, Math.round(d / 0.5))];
  const sim = reg(cv, {
    step(dt) { if (ck.tick(dt)) { this.dirty = true; text(); } if (this.dirty) { this.draw(); this.dirty = false; } },
    draw() {
      const { c, w, h } = fit(cv), wide = w >= 560, R = wide ? Math.min(h / 2 - 18, w * 0.2) : Math.min(62, h * 0.2);
      const cx = wide ? R + 14 : w / 2, cy = wide ? h / 2 : R + 8, t_ = ck.t * 86400, K = 36;
      // cross-section: rings shaded by local concentration; drawn to a size that grows with egg mass
      const Rr = R * Math.cbrt(ser.g / 90);
      for (let i = K; i >= 1; i--) {
        const f = i / K, u = E.u(f * ser.a, ser.a, t_) * ser.cs / 1.6, k = Math.min(1, u);
        const col = `rgb(${Math.round(40 + 59 * k)},${Math.round(46 + 153 * k)},${Math.round(60 + 170 * k)})`;
        c.fillStyle = col; c.beginPath(); c.arc(cx, cy, Rr * f, 0, 6.283); c.fill();
      }
      c.strokeStyle = C.gold; c.setLineDash([4, 4]); c.lineWidth = 1.2; c.beginPath(); c.arc(cx, cy, Rr * E.YOLK, 0, 6.283); c.stroke(); c.setLineDash([]);
      c.strokeStyle = C.mute; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, Rr, 0, 6.283); c.stroke();
      const m = wide ? [30, 14, 38, cx + R + 54] : [cy + R + 34, 14, 38, 46], f = frame(w, h, m, 0, DAYS, 0, 1.7);
      c.fillStyle = 'rgba(233,185,73,.18)'; c.fillRect(f.L + 1, f.Y(E.GEL[1]), f.R - f.L - 1, f.Y(E.GEL[0]) - f.Y(E.GEL[1]));
      yTicks(c, f, [0, 0.5, 1, 1.5], v => fmt(v, 1)); axes(c, f, t('ch6.cv.days'), t('ch6.cv.naoh'));
      xTicks(c, f, [0, 7, 14, 21, 28, 35, 42], v => fmt(v), false);
      const shown = ser.pts.filter(p => p.d <= ck.t + 1e-9);
      path(c, shown.map(p => [p.d, p.y]), f.X, f.Y, C.violet); path(c, shown.map(p => [p.d, p.w]), f.X, f.Y, C.cyan);
      if (shown.length) { const p = shown[shown.length - 1]; cursorDot(c, f.X(p.d), f.Y(p.w), C.cyan); cursorDot(c, f.X(p.d), f.Y(p.y), C.violet); }
    }
  });
  function text() {
    const p = at(ck.t), ph = p.w < E.GEL[0] ? 'liquid' : p.w <= E.GEL[1] ? 'gel' : 'over';
    put('#egBo', fmt(ser.b, 1) + '%'); put('#egGo', t('ch6.unit.g', { v: fmt(ser.g) }));
    put('#egDay', t('ch6.unit.d', { v: fmt(p.d, p.d % 1 ? 1 : 0) })); put('#egW', t('ch6.unit.pct', { v: fmt(p.w, 2) })); put('#egY', t('ch6.unit.pct', { v: fmt(p.y, 2) }));
    put('#egPh', t('ch6.phase.' + ph));
    putHTML('#egSay', sayText(M.say.egg(ser.b, ser.g, p.d, DAYS)));
  }
  sim.text = text;
  const redo = () => { model(); if (reduce) ck.restart(); sim.dirty = true; text(); };
  [sB, sG].forEach(e => e.addEventListener('input', redo));
  on('#egReplay', 'click', () => { ck.restart(); sim.dirty = true; text(); });
  text();
})();

/* ───────── 07 taste activity values ───────── */
(() => {
  const cv = $('#tvCv'), U = M.umami, F = U.FOOD;
  const what = () => radioVal('tvWhat');
  function rows() {
    if (what() === 'succ') return [{ k: 'ch7.cv.sufu', lo: null }, { k: 'ch7.cv.fresh', lo: U.tav(F.yolkFresh.succinic, 'succinic') }, { k: 'ch7.cv.pres', lo: U.tav(F.yolkPreserved.succinic, 'succinic') }];
    return [{ k: 'ch7.cv.sufu', lo: U.tav(129, 'glu'), hi: U.tav(176, 'glu') }, { k: 'ch7.cv.fresh', lo: U.tav(F.yolkFresh.glu, 'glu') }, { k: 'ch7.cv.pres', lo: U.tav(F.yolkPreserved.glu, 'glu') }];
  }
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), rs = rows(); let lw = 0; for (const r of rs) lw = Math.max(lw, c.measureText(t(r.k)).width);
      const L = lw + 16, Rr = w - 12, T = 12, B = h - 34, rh = (B - T) / rs.length, lo = -1, hi = 2;
      const X = v => L + (Rr - L) * (Math.log10(v) - lo) / (hi - lo);
      c.fillStyle = C.mute; c.textAlign = 'center'; c.strokeStyle = C.grid;
      for (let e = lo; e <= hi; e++) { const x = X(Math.pow(10, e)); c.beginPath(); c.moveTo(x, T); c.lineTo(x, B); c.stroke(); c.fillText(pow10(e), x, B + 11); }
      c.textAlign = 'right'; c.fillText(t('ch7.cv.x'), Rr, B + 26);
      rs.forEach((r, i) => {
        const y = T + i * rh; c.fillStyle = C.ink; c.textAlign = 'right'; c.fillText(t(r.k), L - 8, y + rh / 2);
        if (r.lo == null) { c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(t('ch7.cv.nd'), L + 4, y + rh / 2); return; }
        c.fillStyle = i === 0 ? C.gold : C.cyan; c.fillRect(L, y + rh * 0.22, X(r.lo) - L, rh * 0.56);
        if (r.hi) { c.fillStyle = 'rgba(233,185,73,.45)'; c.fillRect(X(r.lo), y + rh * 0.22, X(r.hi) - X(r.lo), rh * 0.56); }
      });
      const x1 = X(1); c.strokeStyle = C.ink; c.setLineDash([5, 4]); c.beginPath(); c.moveTo(x1, T); c.lineTo(x1, B); c.stroke(); c.setLineDash([]);
    }
  });
  function text() {
    const succ = what() === 'succ', rs = rows();
    put('#tvS', succ ? t('ch7.unit.nd') : fmt(rs[0].lo, 1) + '–' + fmt(rs[0].hi, 1));
    put('#tvF', sig(rs[1].lo)); put('#tvP', sig(rs[2].lo)); put('#tvT', t('ch7.unit.mg', { v: fmt(U.TH[succ ? 'succinic' : 'glu'], succ ? 1 : 0) }));
    putHTML('#tvSay', sayText(M.say.tav(what())));
  }
  sim.text = text;
  radios('tvWhat').forEach(r => r.addEventListener('change', () => { sim.dirty = true; text(); }));
  text();
})();

/* ───────── 08 dilution ───────── */
(() => {
  const cv = $('#fdCv'), A = M.aroma, sF = $('#fdF');
  const day = () => +radioVal('fdDay'), fd = () => Math.pow(10, +sF.value);
  const sim = reg(cv, { draw() { const { c, w, h } = fit(cv); bars(c, w, h, A.byOav(day()), r => r.oav, -1, 5, fd(), true, 'ch5.cv.oav'); } });
  function text() {
    const d = day(), F = fd(), on_ = A.smelled(d, F), g = A.groupSum(d, F);
    const lead = Object.entries(g).sort((a, b) => b[1] - a[1])[0];
    put('#fdFo', t('ch8.unit.fd', { v: fmt(F, F < 10 ? 1 : 0) })); put('#fdN', t('ch8.unit.n', { v: fmt(on_.length) }));
    put('#fdLead', on_.length ? t('ch5.leg.' + lead[0]) : '—'); put('#fdS', t('ch8.unit.n', { v: fmt(on_.filter(r => r.g === 'stink').length) }));
    putHTML('#fdSay', sayText(M.say.dilution(+sF.value, d)));
  }
  sim.text = text;
  sF.addEventListener('input', () => { sim.dirty = true; text(); });
  radios('fdDay').forEach(r => r.addEventListener('change', () => { sim.dirty = true; text(); }));
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
    if (s.dirty && s.draw) { s.draw(); s.dirty = false; }
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
window.__essayReady = true;
})();
