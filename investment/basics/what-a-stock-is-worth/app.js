/* What a stock is worth: i18n runtime, wiring and drawing. All visible text comes from copy.*.js (generated from
   content.<lang>.md by scripts/build-pages.cjs); the static diagrams are inline SVG partials (figures/dg-*.html).
   The runtime head follows investment/derivatives/a-fair-price-for-a-bet/app.js. */
(() => {
'use strict';
const M = window.StockWorthModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const C = { bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', dimfill: '#3a4254' };
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const X = M.FRONTIER;

/* ───────── language ───────── */
const LS = 'knowledge-lang';
let memLang = null;
function readLang() { try { return localStorage.getItem(LS); } catch (e) { return memLang; } }
function writeLang(v) { memLang = v; try { localStorage.setItem(LS, v); } catch (e) { /* in-memory fallback */ } }
let lang = readLang();
if (lang !== 'zh' && lang !== 'en') lang = /^zh/i.test(navigator.language || '') ? 'zh' : 'en';
const enStub = !COPY.en || document.documentElement.dataset.langEn === 'stub';
const hasLang = l => !!COPY[l] && !(l === 'en' && enStub);
const effLang = () => (hasLang(lang) ? lang : 'zh');
function t(key, vars) {
  const L = effLang();
  let s = (COPY[L] && COPY[L][key] != null) ? COPY[L][key] : (COPY.zh && COPY.zh[key] != null ? COPY.zh[key] : key);
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => vars[k] != null ? vars[k] : m);
  return s;
}
const fmt = (x, d) => M.fmt(x, d, effLang());
const num = (x, d) => fmt(x, d == null ? 0 : d);
const pct = (x, d) => t('u.pct', { v: fmt(x * 100, d == null ? 0 : d) });
const pts = (x, d) => t('u.pt', { v: fmt(x * 100, d == null ? 1 : d) });
const yrs = (x, d) => t('u.yr', { v: fmt(x, d == null ? 1 : d) });
const times = (x, d) => t('u.x', { v: fmt(x, d == null ? 1 : d) });
const yuan = (x, d) => t('u.money', { v: fmt(x, d == null ? 0 : d) });
const langHooks = [];
function applyLang() {
  document.documentElement.lang = effLang() === 'zh' ? 'zh-CN' : 'en';
  document.title = t('doc.title');
  const md = document.querySelector('meta[name=description]');
  if (md) md.content = t('doc.desc');
  $$('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
  $$('[data-i18n-html]').forEach(e => { e.innerHTML = t(e.dataset.i18nHtml); });
  $$('[data-i18n-aria]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.i18nAria)); });
  $$('#langToggle button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  langHooks.forEach(f => f());
  sims.forEach(s => { s.dirty = true; });
}
$$('#langToggle button').forEach(b => b.addEventListener('click', () => { lang = b.dataset.lang; writeLang(lang); applyLang(); }));

/* ───────── canvas + on-screen registry ───────── */
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
let lastT = 0;
function loop(now) {
  const dt = Math.min(0.1, lastT ? (now - lastT) / 1000 : 0); lastT = now;
  for (const s of sims) if (s.vis) { if (s.step && s.step(dt)) s.dirty = true; if (s.dirty) { s.dirty = false; s.draw(); } }
  requestAnimationFrame(loop);
}
const radioVal = name => { const r = document.querySelector(`input[name=${name}]:checked`); return r ? r.value : null; };
const put = (sel, s) => { const e = $(sel); if (e && e.textContent !== s) e.textContent = s; };
const putHTML = (sel, s) => { const e = $(sel); if (e && e.__h !== s) { e.innerHTML = s; e.__h = s; } };
const onAll = (els, ev, fn) => els.forEach(e => e.addEventListener(ev, fn));
const val = id => +$('#' + id).value;
const out = (id, s) => put('#' + id + 'o', s);

/* chart helpers */
function frame(w, h, m, x0, x1, y0, y1) {
  const L = m[3], R = w - m[1], T = m[0], Bt = h - m[2];
  return { L, R, T, B: Bt, x0, x1, y0, y1, X: x => L + (R - L) * (x - x0) / (x1 - x0), Y: y => Bt - (Bt - T) * (y - y0) / (y1 - y0) };
}
function axes(c, f, xLab, yLab) {
  c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.T); c.lineTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
  c.fillStyle = C.mute; c.font = FONT;
  if (yLab) { c.textAlign = 'left'; c.fillText(yLab, f.L + 6, f.T - 12); }
  if (xLab) { c.textAlign = 'right'; c.fillText(xLab, f.R, f.B + 30); }
}
function xTicks(c, f, items) {
  c.fillStyle = C.mute; c.font = FONT; c.textAlign = 'center'; let lastR = -Infinity;
  for (const [x, s] of items) { const px = f.X(x), w = c.measureText(s).width, cx = Math.min(Math.max(px, f.L + w / 2), f.R - w / 2); if (cx - w / 2 < lastR + 8) continue; c.fillText(s, cx, f.B + 13); lastR = cx + w / 2; c.strokeStyle = C.line; c.beginPath(); c.moveTo(px, f.B); c.lineTo(px, f.B + 4); c.stroke(); }
}
function yTicks(c, f, items, right) {
  c.fillStyle = C.mute; c.font = FONT; c.textAlign = right ? 'left' : 'right'; let lastY = Infinity;
  for (const [y, s] of items) { const py = f.Y(y); if (py > lastY - 14 || py < f.T - 1 || py > f.B + 1) continue; c.fillText(s, right ? f.R + 6 : f.L - 6, py); lastY = py; if (!right) { c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, py); c.lineTo(f.R, py); c.stroke(); } }
}
function nice(lo, hi, n) {
  const span = hi - lo || 1, raw = span / n, p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p, st = (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p, o = [];
  for (let v = Math.ceil(lo / st - 1e-9) * st; v <= hi + st * 1e-9; v += st) o.push(Math.abs(v) < st * 1e-9 ? 0 : v);
  return { ticks: o, d: Math.max(0, -Math.floor(Math.log10(st) + 1e-9)) };
}
const tk = (lo, hi, n, f) => { const k = nice(lo, hi, n); return k.ticks.map(v => [v, f ? f(v, k.d) : fmt(v, k.d)]); };
const pk = (lo, hi, n) => { const k = nice(lo * 100, hi * 100, n); return k.ticks.map(v => [v / 100, fmt(v, k.d) + '%']); };
function line(c, P, f, col, lw, dash) { c.strokeStyle = col; c.lineWidth = lw || 2; c.lineJoin = 'round'; c.setLineDash(dash || []); c.beginPath(); let first = true; for (const [x, y] of P) { if (!isFinite(y)) { first = true; continue; } const px = f.X(x), py = f.Y(y); if (first) c.moveTo(px, py); else c.lineTo(px, py); first = false; } c.stroke(); c.setLineDash([]); }
function dot(c, x, y, col, r) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r || 4.5, 0, 6.283); c.fill(); }
function clip(c, f, fn) { c.save(); c.beginPath(); c.rect(f.L, f.T - 2, f.R - f.L, f.B - f.T + 4); c.clip(); fn(); c.restore(); }
const MARG = [28, 14, 40, 52];

/* ═════════ ch2: a strip of discounted cash ═════════ */
(function ch2() {
  const cv = $('#c2Cv'), N = 40; let S = {};
  function update() {
    const r = val('s2R') / 100, g = val('s2G') / 100, ok = r > g;
    S = { r, g, ok, rows: M.strip(4, r, g, N), P: M.gordon(4, r, g) };
    out('s2R', pct(r, 1)); out('s2G', pct(g, 1));
    if (ok) {
      const s10 = M.shareFirst(r, g, 10), s30 = M.shareFirst(r, g, 30), half = M.halfYear(r, g);
      put('#c2P', yuan(S.P)); put('#c2S10', pct(s10)); put('#c2S30', pct(s30)); put('#c2Half', t('u.yr', { v: num(half) }));
      putHTML('#c2Say', t('ch2.say.ok', { r: pct(r, 1), g: pct(g, 1), p: num(S.P), s10: pct(s10), half: num(half) }));
    } else {
      ['#c2P', '#c2S10', '#c2S30', '#c2Half'].forEach(s => put(s, '—')); put('#c2P', t('u.none'));
      putHTML('#c2Say', t('ch2.say.none'));
    }
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), top = Math.max(...S.rows.map(o => o.cash)) * 1.08, f = frame(w, h, [28, 46, 40, 44], 0.5, N + 0.5, 0, top);
    xTicks(c, f, [1, 10, 20, 30, 40].map(x => [x, String(x)])); yTicks(c, f, tk(0, top, 5));
    axes(c, f, t('ch2.cv.x'), t('ch2.cv.y'));
    const bw = Math.max(1, (f.R - f.L) / N - 2);
    for (const o of S.rows) {
      const x = f.X(o.k) - bw / 2;
      c.fillStyle = C.dimfill; c.fillRect(x, f.Y(o.cash), bw, f.B - f.Y(o.cash));
      c.fillStyle = C.gold; c.fillRect(x, f.Y(o.pv), bw, f.B - f.Y(o.pv));
    }
    if (S.ok) {
      const g2 = frame(w, h, [28, 46, 40, 44], 0.5, N + 0.5, 0, 1);
      yTicks(c, g2, [[0, '0%'], [0.5, '50%'], [1, '100%']], true);
      line(c, S.rows.map(o => [o.k, o.cum / S.P]), g2, C.cyan, 2.2);
      c.strokeStyle = C.cyan; c.setLineDash([2, 4]); c.beginPath(); c.moveTo(g2.L, g2.Y(0.5)); c.lineTo(g2.R, g2.Y(0.5)); c.stroke(); c.setLineDash([]);
    }
  } });
  onAll(['s2R', 's2G'].map(i => $('#' + i)), 'input', update); langHooks.push(update); update();
})();

/* ═════════ ch3: Gordon, r against g ═════════ */
(function ch3() {
  const cv = $('#c3Cv'); let S = {};
  function update() {
    const r = val('s3R') / 100, g = val('s3G') / 100, o = M.gordonShock(4, r, g, 0.01);
    S = { r, g, o };
    out('s3R', pct(r, 2)); out('s3G', pct(g, 2));
    if (r > g + 1e-9) {
      put('#c3P', yuan(o.p0)); put('#c3M', times(1 / (r - g), 1)); put('#c3Chg', t('u.pct', { v: M.signed(o.chg * 100, 0, effLang()) })); put('#c3Dur', yrs(o.dur, 0));
      const v = { gap: pts(r - g, 2), p: num(o.p0), p1: num(o.p1), chg: pct(-o.chg), m: times(1 / (r - g), 0) };
      putHTML('#c3Say', t(r - g < 0.02 ? 'ch3.say.near' : 'ch3.say.ok', v));
    } else {
      put('#c3P', t('u.none')); ['#c3M', '#c3Chg', '#c3Dur'].forEach(s => put(s, '—'));
      putHTML('#c3Say', t('ch3.say.none'));
    }
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), f = frame(w, h, MARG, 0.02, 0.14, 0, 400);
    xTicks(c, f, [0.02, 0.04, 0.06, 0.08, 0.1, 0.12, 0.14].map(x => [x, fmt(x * 100, 0) + '%'])); yTicks(c, f, tk(0, 400, 4));
    axes(c, f, t('ch3.cv.x'), t('ch3.cv.y'));
    const P = []; for (let r = S.g + 0.0005; r <= 0.14; r += 0.0005) P.push([r, M.gordon(4, r, S.g)]);
    clip(c, f, () => line(c, P, f, C.cyan, 2.2));
    if (S.g >= 0.02) { const ax = f.X(S.g); c.strokeStyle = C.red; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(ax, f.T); c.lineTo(ax, f.B); c.stroke(); c.setLineDash([]); c.fillStyle = C.red; c.textAlign = ax > f.R - 50 ? 'right' : 'left'; c.fillText(t('ch3.cv.asym'), ax + (ax > f.R - 50 ? -6 : 6), f.T + 8); }
    if (S.r > S.g && S.o.p0 <= 400) dot(c, f.X(S.r), f.Y(S.o.p0), C.gold, 6);
  } });
  onAll(['s3R', 's3G'].map(i => $('#' + i)), 'input', update); langHooks.push(update); update();
})();

/* ═════════ ch4: what a P/E assumes ═════════ */
(function ch4() {
  const cv = $('#c4Cv'); let S = {};
  function update() {
    const pe = val('s4PE'), r = val('s4R') / 100, roe = val('s4ROE') / 100, g1 = val('s4G1') / 100;
    const pm = M.peFrom(r, 0.03, roe), n = M.yearsOfGrowth(pe, r, g1, pm), same = Math.abs(roe - r) < 1e-9, g = same ? NaN : M.impliedG(pe, r, roe);
    S = { pe, r, roe, g1, pm, n };
    out('s4PE', times(pe, 0)); out('s4R', pct(r, 2)); out('s4ROE', pct(roe)); out('s4G1', pct(g1));
    put('#c4Ey', pct(1 / pe, 1)); put('#c4G', same ? '—' : pct(g, 1)); put('#c4Pm', times(pm, 1));
    put('#c4N', n === 0 ? yrs(0, 0) : isFinite(n) ? yrs(n, 1) : t('u.never'));
    const v = { pe: num(pe), r: pct(r, 2), g1: pct(g1), n: num(n, 1), pm: num(pm, 1) };
    putHTML('#c4Say', t(same ? 'ch4.say.roe' : pe <= pm ? 'ch4.say.low' : g1 <= r ? 'ch4.say.slow' : 'ch4.say.ok', v));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), f = frame(w, h, MARG, 0.05, 0.4, 0, 40);
    xTicks(c, f, [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4].map(x => [x, fmt(x * 100, 0) + '%'])); yTicks(c, f, tk(0, 40, 4));
    axes(c, f, t('ch4.cv.x'), t('ch4.cv.y'));
    const P = []; for (let g = S.r + 0.002; g <= 0.4; g += 0.002) P.push([g, M.yearsOfGrowth(S.pe, S.r, g, S.pm)]);
    clip(c, f, () => line(c, P, f, C.cyan, 2.2));
    if (isFinite(S.n) && S.n <= 40) dot(c, f.X(S.g1), f.Y(S.n), C.gold, 6);
  } });
  onAll(['s4PE', 's4R', 's4ROE', 's4G1'].map(i => $('#' + i)), 'input', update); langHooks.push(update); update();
})();

/* ═════════ ch5: trailing P/E against CAPE ═════════ */
(function ch5() {
  const cv = $('#c5Cv'); let S = {};
  function update() {
    const d = val('s5D') / 100, o = M.capeCycle(d);
    S = { d, o };
    out('s5D', pct(d));
    put('#c5Tr', t('u.x', { v: num(o.trailR.lo, 1) + '–' + num(o.trailR.hi, 1) })); put('#c5Cape', t('u.x', { v: num(o.capeR.lo, 1) + '–' + num(o.capeR.hi, 1) }));
    const b = M.capeCycle(0); put('#c5Base', t('u.x', { v: num(b.trailR.lo, 0) + ' / ' + num(b.capeR.lo, 1) }));
    const v = { d: pct(d), tlo: num(o.trailR.lo, 1), thi: num(o.trailR.hi, 1), clo: num(o.capeR.lo, 1), chi: num(o.capeR.hi, 1) };
    putHTML('#c5Say', t(d === 0 ? 'ch5.say.flat' : 'ch5.say.ok', v));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), Y = M.CAPE.years, top = Math.max(30, S.o.trailR.hi * 1.08), f = frame(w, h, MARG, 0, Y, 0, top);
    c.fillStyle = 'rgba(58,66,84,.55)';
    for (let x = 0; x < Y; x += 0.25) if (M.dip(x) > 0 && S.d > 0) c.fillRect(f.X(x), f.T, Math.max(1, f.X(x + 0.25) - f.X(x)), f.B - f.T);
    xTicks(c, f, [0, 10, 20, 30, 40, 50, 60, 70].map(x => [x, String(x)])); yTicks(c, f, tk(0, top, 5));
    axes(c, f, t('ch5.cv.x'), t('ch5.cv.y'));
    line(c, S.o.trail.map((v, i) => [i, v]), f, C.violet, 2);
    line(c, S.o.cape.map((v, i) => [i, v]), f, C.cyan, 2.4);
  } });
  $('#s5D').addEventListener('input', update); langHooks.push(update); update();
})();

/* ═════════ ch6: implied equity risk premium ═════════ */
(function ch6() {
  const cv = $('#c6Cv'); let S = {};
  function update() {
    const y = val('s6Y') / 100, g = val('s6G') / 100, rf = val('s6Rf') / 100, dp = val('s6P') / 100, price = 1 + dp, o = M.impliedERP(price, y, g, rf);
    S = { y, g, rf, price, o };
    out('s6Y', pct(y, 1)); out('s6G', pct(g, 1)); out('s6Rf', pct(rf, 2)); out('s6P', t('u.pct', { v: M.signed(dp * 100, 0, effLang()) }));
    put('#c6R', pct(o.r, 2)); put('#c6Erp', pct(o.erp, 2)); put('#c6Yld', pct(y / price, 2));
    const v = { r: pct(o.r, 2), rf: pct(rf, 2), erp: pct(o.erp, 2) };
    putHTML('#c6Say', t(o.erp < 0 ? 'ch6.say.neg' : 'ch6.say.ok', v));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), P = []; for (let p = 0.6; p <= 1.4001; p += 0.01) P.push([p, M.impliedERP(p, S.y, S.g, S.rf).erp]);
    const lo = Math.min(0, ...P.map(q => q[1])), hi = Math.max(...P.map(q => q[1])) * 1.1, f = frame(w, h, MARG, 0.6, 1.4, lo, hi);
    xTicks(c, f, [0.6, 0.8, 1, 1.2, 1.4].map(x => [x, t('u.pct', { v: M.signed((x - 1) * 100, 0, effLang()) })])); yTicks(c, f, pk(lo, hi, 5));
    axes(c, f, t('ch6.cv.x'), t('ch6.cv.y'));
    line(c, P, f, C.cyan, 2.2); dot(c, f.X(S.price), f.Y(S.o.erp), C.gold, 6);
  } });
  onAll(['s6Y', 's6G', 's6Rf', 's6P'].map(i => $('#' + i)), 'input', update); langHooks.push(update); update();
})();

/* ═════════ ch7: the security market line ═════════ */
(function ch7() {
  const cv = $('#c7Cv'); let S = {};
  function update() {
    const rf = val('s7Rf') / 100, erp = val('s7E') / 100, id = radioVal('c7Ind'), ind = M.INDUSTRIES.find(i => i.id === id), req = M.sml(rf, erp, ind.beta), mkt = M.sml(rf, erp, 1);
    S = { rf, erp, id };
    out('s7Rf', pct(rf, 2)); out('s7E', pct(erp, 2));
    put('#c7B', num(ind.beta, 2)); put('#c7Req', pct(req, 2)); put('#c7Mkt', pct(mkt, 2)); put('#c7N', num(ind.n));
    const v = { ind: t('ch7.ind.' + id), beta: num(ind.beta, 2), req: pct(req, 2), diff: pts(Math.abs(req - mkt), 2) };
    putHTML('#c7Say', t(ind.beta >= 1 ? 'ch7.say.ok' : 'ch7.say.lo', v));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), hi = Math.max(0.16, M.sml(S.rf, S.erp, 1.8) * 1.05), f = frame(w, h, MARG, 0, 1.8, 0, hi);
    xTicks(c, f, [0, 0.5, 1, 1.5].map(x => [x, fmt(x, 1)])); yTicks(c, f, pk(0, hi, 5));
    axes(c, f, t('ch7.cv.x'), t('ch7.cv.y'));
    line(c, [[0, S.rf], [1.8, M.sml(S.rf, S.erp, 1.8)]], f, C.cyan, 2);
    dot(c, f.X(1), f.Y(M.sml(S.rf, S.erp, 1)), C.mute, 5);
    for (const i of M.INDUSTRIES) dot(c, f.X(i.beta), f.Y(M.sml(S.rf, S.erp, i.beta)), i.id === S.id ? C.gold : C.violet, i.id === S.id ? 7 : 4.5);
  } });
  onAll(['s7Rf', 's7E'].map(i => $('#' + i)), 'input', update); onAll($$('input[name=c7Ind]'), 'change', update); langHooks.push(update); update();
})();

/* ═════════ ch7b: how noisy a beta is ═════════ */
(function ch7b() {
  const cv = $('#c7bCv'), TRUE = 1.28; let S = {}, seed = 11;
  function update() {
    const s = val('s7bS') / 100, n = val('s7bN'), o = M.betaFit(TRUE, s, n, seed);
    S = { o };
    out('s7bS', pct(s)); out('s7bN', t('u.mo', { v: num(n) }));
    put('#c7bEst', num(o.b, 2)); put('#c7bTrue', num(TRUE, 2)); put('#c7bSe', num(o.se, 2)); put('#c7bBand', num(TRUE - 1.96 * o.se, 2) + '–' + num(TRUE + 1.96 * o.se, 2));
    putHTML('#c7bSay', t('ch7.b.say.ok', { b: num(o.b, 2), se: num(o.se, 2), lo: num(TRUE - 1.96 * o.se, 2), hi: num(TRUE + 1.96 * o.se, 2) }));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), f = frame(w, h, MARG, -0.15, 0.15, -0.45, 0.45);
    xTicks(c, f, [-0.15, -0.1, -0.05, 0, 0.05, 0.1, 0.15].map(x => [x, fmt(x * 100, 0) + '%'])); yTicks(c, f, pk(-0.45, 0.45, 6));
    axes(c, f, t('ch7.b.cv.x'), t('ch7.b.cv.y'));
    clip(c, f, () => {
      c.fillStyle = 'rgba(99,199,230,.55)';
      for (const [x, y] of S.o.pts) { c.beginPath(); c.arc(f.X(x), f.Y(y), 2.6, 0, 6.283); c.fill(); }
      line(c, [[-0.15, -0.15 * TRUE], [0.15, 0.15 * TRUE]], f, C.mute, 1.6, [5, 4]);
      line(c, [[-0.15, S.o.a - 0.15 * S.o.b], [0.15, S.o.a + 0.15 * S.o.b]], f, C.gold, 2.4);
    });
  } });
  onAll(['s7bS', 's7bN'].map(i => $('#' + i)), 'input', update);
  $('#c7bAgain').addEventListener('click', () => { seed += 1; update(); });
  langHooks.push(update); update();
})();

/* ═════════ ch8: excess volatility ═════════ */
(function ch8() {
  const cv = $('#c8Cv'); let S = {};
  function update() {
    const b = val('s8B'), o = M.excessVol(b);
    S = { o };
    out('s8B', pct(b));
    put('#c8Sp', num(o.sdP, 2)); put('#c8Ss', num(o.sdS, 2)); put('#c8Ra', times(o.ratio, 2)); put('#c8Tr', pct(M.EXV.rho));
    putHTML('#c8Say', t(o.ratio > 1 ? 'ch8.say.wild' : 'ch8.say.calm', { ratio: times(o.ratio, 2) }));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), o = S.o, idx = []; for (let i = o.lo; i <= o.hi; i++) idx.push(i);
    const all = idx.map(i => o.p[i]).concat(idx.map(i => o.ps[i])), lo = Math.min(...all), hi = Math.max(...all), pad = (hi - lo) * 0.08;
    const f = frame(w, h, MARG, o.lo, o.hi, lo - pad, hi + pad);
    xTicks(c, f, [20, 40, 60, 80, 100, 120].map(x => [x, String(x)])); yTicks(c, f, tk(lo - pad, hi + pad, 5));
    axes(c, f, t('ch8.cv.x'), t('ch8.cv.y'));
    line(c, idx.map(i => [i, o.ps[i]]), f, C.cyan, 2);
    line(c, idx.map(i => [i, o.p[i]]), f, C.gold, 2);
  } });
  $('#s8B').addEventListener('input', update); langHooks.push(update); update();
})();

/* ═════════ ch9: active funds versus the index ═════════ */
(function ch9() {
  const cv = $('#c9Cv'); let S = {};
  function update() {
    const fee = val('s9F') / 100, skill = val('s9S') / 100, te = val('s9T') / 100, close = $('#s9C').checked;
    const o = M.funds({ fee, skill, te, T: 20, n: 2000, seed: 7, close, cut: 0.05 });
    S = { fee, skill, te, o };
    out('s9F', pct(fee, 1)); out('s9S', pts(skill, 1)); out('s9T', pts(te, 1));
    put('#c9Y1', pct(o.trailAt[0])); put('#c9Y10', pct(o.trailAt[9])); put('#c9Y20', pct(o.trailAt[19])); put('#c9Al', pct(o.aliveAt[19])); put('#c9Sv', pct(o.trailSurv[19]));
    const v = { y1: pct(o.trailAt[0]), y20: pct(o.trailAt[19]), surv: pct(o.trailSurv[19]) };
    putHTML('#c9Say', t(fee < 0.0005 ? 'ch9.say.nofee' : skill > fee ? 'ch9.say.skill' : 'ch9.say.ok', v));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), f = frame(w, h, MARG, 0, 20, 0, 1);
    xTicks(c, f, [1, 5, 10, 15, 20].map(x => [x, String(x)])); yTicks(c, f, pk(0, 1, 5));
    axes(c, f, t('ch9.cv.x'), t('ch9.cv.y'));
    c.strokeStyle = C.line; c.setLineDash([2, 4]); c.beginPath(); c.moveTo(f.L, f.Y(0.5)); c.lineTo(f.R, f.Y(0.5)); c.stroke(); c.setLineDash([]);
    const cf = []; for (let T = 1; T <= 20; T += 0.25) cf.push([T, M.trailShare(S.fee, S.skill, S.te, T)]);
    line(c, cf, f, C.cyan, 1.8, [6, 4]);
    line(c, S.o.trailAt.map((v, i) => [i + 1, v]), f, C.gold, 2.6);
    X.spiva.h.forEach((hh, i) => dot(c, f.X(hh), f.Y(X.spiva.large[i] / 100), C.violet, 5));
  } });
  onAll(['s9F', 's9S', 's9T'].map(i => $('#' + i)), 'input', update); $('#s9C').addEventListener('change', update); langHooks.push(update); update();
})();

/* ═════════ ch10: a rational bubble ═════════ */
(function ch10() {
  const cv = $('#c10Cv'), F = 100, R = 0.08, YRS = 40, STEP = 0.35; let S = {}, seed = 3;
  function reset() {
    const pi = val('s10Pi'), b0 = val('s10B') / 100, o = M.bubblePath({ seed, F, B0: b0 * F, r: R, pi, years: YRS });
    const end = o.burst > 0 ? o.burst : YRS;
    S = { pi, o, end, shown: reduce ? end : 0, acc: 0 };
    out('s10Pi', num(pi, 2)); out('s10B', pct(b0));
    put('#c10Gr', pct(M.bubbleGrowth(R, pi))); put('#c10Li', yrs(1 / (1 - pi), 1));
    show(); sim.dirty = true;
  }
  function show() {
    const k = Math.min(S.shown, S.end), p = S.o.path[k];
    put('#c10Yr', num(k)); put('#c10Ra', times(p.P / F, 2));
    const done = S.shown >= S.end;
    if (done && S.o.burst > 0) putHTML('#c10Say', t('ch10.say.pop', { t: num(S.o.burst) }));
    else if (done) putHTML('#c10Say', t('ch10.say.end', { p: pct(Math.pow(S.pi, YRS), 1) }));
    else putHTML('#c10Say', t('ch10.say.run', { t: num(k), ratio: times(p.P / F, 2), grow: pct(M.bubbleGrowth(R, S.pi)) }));
  }
  const sim = reg(cv, {
    step(dt) { if (S.shown >= S.end) return false; S.acc += dt; if (S.acc < STEP) return false; S.acc = 0; S.shown++; show(); return true; },
    draw() {
      const { c, w, h } = fit(cv), top = Math.max(200, ...S.o.path.slice(0, S.end + 1).map(q => q.P)) * 1.08, f = frame(w, h, MARG, 0, YRS, 0, top);
      xTicks(c, f, [0, 10, 20, 30, 40].map(x => [x, String(x)])); yTicks(c, f, tk(0, top, 5));
      axes(c, f, t('ch10.cv.x'), t('ch10.cv.y'));
      line(c, [[0, F], [YRS, F]], f, C.cyan, 1.8);
      line(c, S.o.path.slice(0, Math.min(S.shown, S.end) + 1).map(q => [q.t, q.P]), f, C.gold, 2.4);
    }
  });
  onAll(['s10Pi', 's10B'].map(i => $('#' + i)), 'input', reset);
  $('#c10Again').addEventListener('click', () => { seed += 1; reset(); });
  langHooks.push(() => { out('s10Pi', num(S.pi, 2)); show(); }); reset();
})();

applyLang();
requestAnimationFrame(loop);
window.__essayReady = true;
})();
