/* Stablecoins, CBDCs and new kinds of money: i18n runtime, wiring and drawing. All visible text comes from copy.*.js
   (generated from content.<lang>.md by scripts/build-pages.cjs); the static diagrams are inline SVG partials
   (figures/dg-*.html). The runtime head follows investment/derivatives/a-fair-price-for-a-bet/app.js.
   Money amounts in $bn are shown as 亿美元 in Chinese (×10) and as billions in English (bn()). */
(() => {
'use strict';
const M = window.StablecoinModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const C = { bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', dimfill: '#3a4254' };
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

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
const pct = (x, d) => t('u.pct', { v: fmt(x * 100, d == null ? 0 : d) });
const usd = (x, d) => t('u.usd', { v: fmt(x, d == null ? 2 : d) });
const bnv = (x, d) => fmt(effLang() === 'zh' ? x * 10 : x, d == null ? 0 : d);   // number only, in the language's unit
const bn = (x, d) => t('u.bn', { v: bnv(x, d) });
const eur = x => t('u.eur', { v: fmt(x, 0) });
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
const put = (sel, s) => { const e = $(sel); if (e && e.textContent !== s) e.textContent = s; };
const putHTML = (sel, s) => { const e = $(sel); if (e && e.__h !== s) { e.innerHTML = s; e.__h = s; } };
const onAll = (els, ev, fn) => els.forEach(e => e.addEventListener(ev, fn));
const val = id => +$('#' + id).value;
const out = (id, s) => put('#' + id + 'o', s);
const radioVal = name => { const r = document.querySelector(`input[name=${name}]:checked`); return r ? r.value : null; };

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
function yTicks(c, f, items) {
  c.fillStyle = C.mute; c.font = FONT; c.textAlign = 'right'; let lastY = Infinity;
  for (const [y, s] of items) { const py = f.Y(y); if (py > lastY - 14 || py < f.T - 1 || py > f.B + 1) continue; c.fillText(s, f.L - 6, py); lastY = py; c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, py); c.lineTo(f.R, py); c.stroke(); }
}
function nice(lo, hi, n) {
  const span = hi - lo || 1, raw = span / n, p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p, st = (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p, o = [];
  for (let v = Math.ceil(lo / st - 1e-9) * st; v <= hi + st * 1e-9; v += st) o.push(Math.abs(v) < st * 1e-9 ? 0 : v);
  return { ticks: o, d: Math.max(0, -Math.floor(Math.log10(st) + 1e-9)) };
}
const tk = (lo, hi, n, f) => { const k = nice(lo, hi, n); return k.ticks.map(v => [v, f ? f(v, k.d) : fmt(v, k.d)]); };
function line(c, pts, f, col, lw, dash) { c.strokeStyle = col; c.lineWidth = lw || 2; c.lineJoin = 'round'; c.setLineDash(dash || []); c.beginPath(); let first = true; for (const [x, y] of pts) { if (!isFinite(y)) { first = true; continue; } const px = f.X(x), py = f.Y(y); if (first) c.moveTo(px, py); else c.lineTo(px, py); first = false; } c.stroke(); c.setLineDash([]); }
function hline(c, f, y, col, dash) { line(c, [[f.x0, y], [f.x1, y]], f, col, 1.2, dash || [4, 4]); }
function vline(c, f, x, col, dash) { c.strokeStyle = col; c.lineWidth = 1.2; c.setLineDash(dash || [4, 4]); c.beginPath(); c.moveTo(f.X(x), f.T); c.lineTo(f.X(x), f.B); c.stroke(); c.setLineDash([]); }
function dot(c, x, y, col, r) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r || 4.5, 0, 6.283); c.fill(); }
function clip(c, f, fn) { c.save(); c.beginPath(); c.rect(f.L, f.T - 2, f.R - f.L, f.B - f.T + 4); c.clip(); fn(); c.restore(); }
const MARG = [28, 14, 40, 50];

/* ═════════ ch3: a price tag in a volatile unit ═════════ */
(function ch3() {
  const cv = $('#c3Cv'); if (!cv) return; let S = {};
  function update() {
    const sigma = val('c3S') / 100, days = val('c3D'), band = val('c3B') / 100;
    const u = M.unitOfAccount({ sigma, days, band }), path = M.unitPath({ sigma, band, seed: 7 });
    S = { sigma, band, u, path };
    out('c3S', pct(sigma)); out('c3D', fmt(days, 0)); out('c3B', pct(band));
    put('#c3Band', t('ch3.range', { lo: fmt(u.lo, 0), hi: fmt(u.hi, 0) }));
    put('#c3Out', pct(u.pOut));
    put('#c3Per', t('u.yr', { v: fmt(u.perYear, u.perYear < 10 ? 1 : 0) }));
    put('#c3Sim', t('u.yr', { v: fmt(path.resets.length, 0) }));
    const gap = fmt(u.daysBetween, u.daysBetween < 10 ? 1 : 0), per = fmt(u.perYear, u.perYear < 10 ? 1 : 0);
    putHTML('#c3Say', t(u.perYear < 1 ? 'ch3.say.calm' : u.perYear <= 12 ? 'ch3.say.some' : 'ch3.say.often', { gap, per }));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), v = S.path.vals, hi = Math.max(100 * (1 + S.band), ...v) * 1.02, lo = Math.min(100 / (1 + S.band), ...v) * 0.98;
    const f = frame(w, h, MARG, 0, 365, lo, hi);
    xTicks(c, f, [0, 60, 120, 180, 240, 300, 365].map(x => [x, fmt(x, 0)])); yTicks(c, f, tk(lo, hi, 5));
    axes(c, f, t('ch3.cv.x'), t('ch3.cv.y'));
    hline(c, f, 100 * (1 + S.band), C.mute); hline(c, f, 100 / (1 + S.band), C.mute);
    clip(c, f, () => line(c, v.map((y, i) => [i, y]), f, C.cyan, 1.6));
    for (const i of S.path.resets) dot(c, f.X(i), f.Y(v[i]), C.gold, 3.2);
  } });
  onAll(['c3S', 'c3D', 'c3B'].map(i => $('#' + i)), 'input', update); langHooks.push(update); update();
})();

/* ═════════ ch4: the peg and its arbitrage ═════════ */
(function ch4() {
  const cv = $('#c4Cv'); if (!cv) return; let S = {}, cur = 0;
  function update() {
    const fee = val('c4F') / 100, cap = val('c4K') / 100, jump = val('c4J') / 100, closed = $('#c4C').checked;
    const r = M.pegSim({ fee, cap, jump, closed });
    S = { fee, cap, jump, closed, r }; cur = reduce ? M.PEG.hours : 0;
    out('c4F', pct(fee, 2)); out('c4K', pct(cap, 1)); out('c4J', pct(jump, 1));
    put('#c4Min', t('u.cents', { v: fmt(r.minPrice * 100, 1) }));
    const outH = Math.round(r.outShare * M.PEG.hours);
    put('#c4Out', t('u.hours', { v: fmt(outH, 0) }));
    put('#c4Red', pct(r.redeemed, 1));
    putHTML('#c4Say', t(cap === 0 ? 'ch4.say.none' : closed ? 'ch4.say.shut' : 'ch4.say.held', { min: fmt(r.minPrice * 100, 1), out: fmt(outH, 0) }));
    sim.dirty = true;
  }
  const sim = reg(cv, {
    step(dt) { if (cur >= M.PEG.hours) return false; cur = Math.min(M.PEG.hours, cur + dt * 60); return true; },
    draw() {
      const { c, w, h } = fit(cv), P = S.r.price, lo = Math.min(97, Math.floor(S.r.minPrice * 100 - 0.5)), hi = Math.max(101, Math.ceil(Math.max(...P) * 100 + 0.3));
      const f = frame(w, h, MARG, 0, M.PEG.hours, lo, hi);
      if (S.closed) { c.fillStyle = 'rgba(58,66,84,.55)'; c.fillRect(f.X(M.PEG.closeFrom), f.T, f.X(M.PEG.closeFrom + M.PEG.closeHours) - f.X(M.PEG.closeFrom), f.B - f.T); }
      xTicks(c, f, [0, 48, 96, 144, 192, 240].map(x => [x, fmt(x, 0)])); yTicks(c, f, tk(lo, hi, 5));
      axes(c, f, t('ch4.cv.x'), t('ch4.cv.y'));
      hline(c, f, 100 * (1 - S.fee), C.mute); hline(c, f, 100 * (1 + S.fee), C.mute);
      const n = Math.max(1, Math.floor(cur));
      clip(c, f, () => line(c, P.slice(0, n).map((p, i) => [i, p * 100]), f, C.gold, 1.8));
    }
  });
  onAll(['c4F', 'c4K', 'c4J'].map(i => $('#' + i)), 'input', update); $('#c4C').addEventListener('change', update); langHooks.push(update); update();
})();

/* ═════════ ch5: a run on the peg ═════════ */
(function ch5() {
  const cv = $('#c5Cv'); if (!cv) return; let S = {};
  const ids = { liq: 'c5L', hair: 'c5H', loss: 'c5X', buf: 'c5E', jumpy: 'c5J' };
  function read() { const o = {}; for (const k in ids) o[k] = val(ids[k]) / 100; return o; }
  function update() {
    const o = read(), r = M.runModel(o);
    S = { o, r };
    out('c5L', pct(o.liq)); out('c5H', pct(o.hair, 1)); out('c5X', pct(o.loss, 2)); out('c5E', pct(o.buf, 2)); out('c5J', pct(o.jumpy));
    put('#c5V0', usd(r.V0, 3)); put('#c5R', pct(r.R, 1)); put('#c5Avg', usd(r.avg, 3)); put('#c5Un', r.unpaid > 0 ? pct(r.unpaid, 1) : t('u.none'));
    const v = { v0: fmt(r.V0, 3), r: pct(r.R, 1), v: fmt(r.V, 3), avg: fmt(r.avg, 3), unpaid: pct(r.unpaid, 1) };
    putHTML('#c5Say', t('ch5.say.' + r.status, v));
    $$('#lab5 [data-pre]').forEach(b => b.setAttribute('aria-pressed', 'false'));
    sim.dirty = true;
  }
  function how() { putHTML('#c5How', t('ch5.model.how', { tol: pct(M.RUN.tol) })); }
  $$('#lab5 [data-pre]').forEach(b => b.addEventListener('click', () => {
    const p = M.RUN_PRESETS[b.dataset.pre]; for (const k in ids) $('#' + ids[k]).value = String(+(p[k] * 100).toFixed(4));
    update(); b.setAttribute('aria-pressed', 'true');
  }));
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), B = S.r.book, f = frame(w, h, MARG, 0, 1, 0, 1.15);
    xTicks(c, f, [0, 0.2, 0.4, 0.6, 0.8, 1].map(x => [x, pct(x)])); yTicks(c, f, tk(0, 1.15, 5));
    axes(c, f, t('ch5.cv.x'), t('ch5.cv.y'));
    if (B.cashMax < 1) { c.fillStyle = 'rgba(240,122,109,.16)'; c.fillRect(f.X(B.cashMax), f.T, f.R - f.X(B.cashMax), f.B - f.T); }
    hline(c, f, 1, C.mute, [2, 3]); hline(c, f, 1 - M.RUN.tol, C.mute);
    const pts = []; for (let i = 0; i <= 200; i++) { const R = Math.min(i / 200, 0.995); if (R > B.cashMax) break; pts.push([R, Math.min(1.15, Math.max(0, B.at(R).V))]); }
    clip(c, f, () => line(c, pts, f, C.cyan, 2.2));
    for (const p of S.r.path) if (!p.dflt) dot(c, f.X(p.R), f.Y(Math.min(1.15, Math.max(0, p.V))), C.violet, 3);
    const R = S.r.R, V = S.r.status === 'default' ? 0 : Math.min(1.15, Math.max(0, S.r.V));
    dot(c, f.X(R), f.Y(V), C.gold, 6);
  } });
  onAll(Object.values(ids).map(i => $('#' + i)), 'input', update); langHooks.push(how, update); how(); update();
})();

/* ═════════ ch6: the algorithmic death spiral ═════════ */
(function ch6() {
  const cv = $('#c6Cv'), cv2 = $('#c6Cv2'); if (!cv) return; let S = {}, cur = 0;
  const ratio = x => (x >= 0.01 ? pct(x, x >= 0.1 ? 0 : 1) : x.toExponential(1).replace('e', '×10^'));
  function update() {
    const o = { cover: val('c6C'), depth: val('c6D') / 100, cap: val('c6K'), shock: val('c6S') / 100, reserve: val('c6R') };
    const r = M.spiral(o), thr = M.spiralThreshold(o.depth);
    S = { o, r, thr }; cur = reduce ? M.SPIRAL.days : 0;
    out('c6C', fmt(o.cover, 1)); out('c6D', pct(o.depth)); out('c6K', bn(o.cap, effLang() === 'zh' ? 0 : 1)); out('c6S', pct(o.shock)); out('c6R', bn(o.reserve, effLang() === 'zh' ? 0 : 1));
    const halt = r.halted != null ? t('u.days', { v: fmt(r.halted, 1) }) : t('u.never');
    put('#c6Thr', fmt(thr, 1)); put('#c6Halt', halt); put('#c6Drop', ratio(r.priceRatio));
    put('#c6Sup', t('u.x', { v: fmt(r.supplyX, r.supplyX < 10 ? 1 : 0) })); put('#c6MinP', usd(r.minP, 2)); put('#c6Left', bn(r.U, 1));
    const v = { c: fmt(o.cover, 1), thr: fmt(thr, 1), halt, sup: fmt(r.supplyX, r.supplyX < 10 ? 1 : 0), left: bnv(r.U, 1), drop: ratio(r.priceRatio), minP: fmt(r.minP, 2), res: bnv(r.reserveLeft, 1) };
    const key = r.halted != null ? 'spiral' : (o.cover < thr && o.reserve > r.reserveLeft + 1e-9) ? 'saved' : 'safe';
    putHTML('#c6Say', t('ch6.say.' + key, v));
    sim.dirty = true;
    $('#c6How') && putHTML('#c6How', t('ch6.model.how', { shock: pct(o.shock) }));
  }
  const sim = reg([cv, cv2], {
    step(dt) { if (cur >= M.SPIRAL.days) return false; cur = Math.min(M.SPIRAL.days, cur + dt * 4); return true; },
    draw() {
      const H = S.r.hours, n = H.filter(p => p.t <= cur + 1e-9);
      { const { c, w, h } = fit(cv), f = frame(w, h, MARG, 0, M.SPIRAL.days, 0, 1.25);
        xTicks(c, f, [0, 5, 10, 15, 20].map(x => [x, fmt(x, 0)])); yTicks(c, f, tk(0, 1.25, 5));
        axes(c, f, t('ch6.cv.x'), t('ch6.cv.y'));
        hline(c, f, 1, C.mute, [2, 3]);
        clip(c, f, () => { line(c, n.map(p => [p.t, Math.min(1.25, isFinite(p.c) ? p.c / S.o.cover : 1.25)]), f, C.cyan, 1.8); line(c, n.map(p => [p.t, p.p]), f, C.gold, 2.2); });
        if (S.r.halted != null && cur >= S.r.halted) vline(c, f, S.r.halted, C.red); }
      { const { c, w, h } = fit(cv2), f = frame(w, h, [22, 14, 30, 50], 0, M.SPIRAL.days, -6.2, 0.3);
        xTicks(c, f, [0, 5, 10, 15, 20].map(x => [x, fmt(x, 0)])); yTicks(c, f, [0, -2, -4, -6].map(y => [y, y === 0 ? '1' : '10^' + y]));
        axes(c, f, '', t('ch6.cv.y2'));
        clip(c, f, () => line(c, n.map(p => [p.t, Math.log10(p.price / M.SPIRAL.P0)]), f, C.violet, 2));
        if (S.r.halted != null && cur >= S.r.halted) vline(c, f, S.r.halted, C.red); }
    }
  });
  onAll(['c6C', 'c6D', 'c6K', 'c6S', 'c6R'].map(i => $('#' + i)), 'input', update); langHooks.push(update); update();
})();

/* ═════════ ch7: issuer economics ═════════ */
(function ch7() {
  const cv = $('#c7Cv'); if (!cv) return; let S = {};
  const RMAX = 0.08;
  function update() {
    const r = val('c7R') / 100, eta = val('c7E'), delta = val('c7D') / 100, o = { eta, delta };
    const x = M.issuer(Object.assign({ r }, o)), be = M.breakEven(o), best = M.bestRate(eta);
    S = { r, o, x, best, curve: M.issuerCurve(o, RMAX) };
    out('c7R', pct(r, 2)); out('c7E', pct(1 - Math.exp(-eta * 0.01))); out('c7D', pct(delta));
    put('#c7U', bn(x.U)); put('#c7Inc', bn(x.income, 1)); put('#c7Dist', bn(x.dist, 1)); put('#c7Pro', bn(x.profit, 1));
    put('#c7Be', be == null ? '—' : pct(be, 2)); put('#c7Best', isFinite(best) ? pct(best, 1) : '—');
    const v = { r: pct(r, 2), u: bnv(x.U), pro: bnv(Math.abs(x.profit), 1), inc: bnv(x.income, 1), best: isFinite(best) ? pct(best, 1) : '—' };
    const key = x.profit < 0 ? 'loss' : r > best + 1e-9 ? 'high' : r < 0.015 ? 'low' : 'mid';
    putHTML('#c7Say', t('ch7.say.' + key, v));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), ys = S.curve.map(p => p[1]), lo = Math.min(0, ...ys), hi = Math.max(0.5, ...ys) * 1.1;
    const sc = effLang() === 'zh' ? 10 : 1;
    const f = frame(w, h, MARG, 0, RMAX, lo * sc, hi * sc);
    xTicks(c, f, [0, 0.02, 0.04, 0.06, 0.08].map(x => [x, pct(x)])); yTicks(c, f, tk(lo * sc, hi * sc, 5));
    axes(c, f, t('ch7.cv.x'), t('ch7.cv.y'));
    hline(c, f, 0, C.mute, [2, 3]);
    if (isFinite(S.best) && S.best <= RMAX) vline(c, f, S.best, C.mute);
    clip(c, f, () => line(c, S.curve.map(([x, y]) => [x, y * sc]), f, C.gold, 2.2));
    dot(c, f.X(S.r), f.Y(S.x.profit * sc), C.gold, 6);
  } });
  onAll(['c7R', 'c7E', 'c7D'].map(i => $('#' + i)), 'input', update); langHooks.push(update); update();
})();

/* ═════════ ch8: a holding cap on a CBDC ═════════ */
(function ch8() {
  const cv = $('#c8Cv'); if (!cv) return; let S = {};
  const NOCAP = 20500;
  function update() {
    const capV = val('c8C'), cap = capV >= NOCAP ? 1e12 : capV, take = val('c8T') / 100, kind = radioVal('c8K');
    const x = M.cbdcCap({ cap, take, kind });
    S = { cap, capV, take, kind, x };
    out('c8C', capV >= NOCAP ? t('u.nocap') : eur(capV)); out('c8T', pct(take));
    put('#c8Mean', eur(x.mean)); put('#c8Capped', eur(x.capped)); put('#c8Share', pct(x.share, 1)); put('#c8Liq', pct(x.drainOfLiq));
    const v = { cap: capV >= NOCAP ? t('u.nocap') : eur(capV), share: pct(x.share, 1), liq: pct(x.drainOfLiq) };
    const key = kind === 'bank' ? 'bank' : x.drainOfLiq < 0.5 ? 'ok' : x.drainOfLiq <= 1 ? 'tight' : 'short';
    putHTML('#c8Say', t('ch8.say.' + key, v));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), f = frame(w, h, MARG, 0, 20000, 0, Math.max(0.3, S.take * 0.6));
    xTicks(c, f, [0, 5000, 10000, 15000, 20000].map(x => [x, fmt(x, 0)])); yTicks(c, f, tk(0, f.y1, 5, (v, d) => pct(v, Math.max(0, d - 2))));
    axes(c, f, t('ch8.cv.x'), t('ch8.cv.y'));
    if (S.kind !== 'bank') hline(c, f, M.CBDC.liq, C.red);
    const pts = []; for (let i = 1; i <= 100; i++) { const cap = i * 200; pts.push([cap, S.take * M.expMin(cap, M.CBDC.median, M.CBDC.sd) / S.x.mean]); }
    clip(c, f, () => line(c, pts, f, C.gold, 2.2));
    if (S.capV < NOCAP) dot(c, f.X(S.capV), f.Y(S.x.share), C.gold, 6);
  } });
  onAll(['c8C', 'c8T'].map(i => $('#' + i)), 'input', update); onAll($$('input[name=c8K]'), 'change', update); langHooks.push(update); update();
})();

applyLang();
requestAnimationFrame(loop);
})();
