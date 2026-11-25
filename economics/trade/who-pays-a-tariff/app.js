/* Who pays a tariff: i18n runtime, wiring and drawing. All visible text comes from copy.*.js (generated from
   content.<lang>.md by scripts/build-pages.cjs); static diagrams are inline SVG partials (figures/dg-*.html).
   The runtime head follows investment/derivatives/a-fair-price-for-a-bet/app.js. */
(() => {
'use strict';
const M = window.TariffModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const C = { bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb' };
const tint = (col, a) => { const n = parseInt(col.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
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
const pct = (x, d) => t('u.pct', { v: fmt(x * 100, d == null ? 1 : d) });
const spct = (x, d) => t('u.pct', { v: M.signed(x * 100, d == null ? 1 : d, effLang()) });
const area = (x, d) => t('u.area', { v: M.signed(x, d == null ? 0 : d, effLang()) });
const yuan = (x, d) => t('u.yuan', { v: fmt(x, d == null ? 1 : d) });
const gdp = (x, d) => t('u.gdp', { v: M.signed(x, d == null ? 1 : d, effLang()) });
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
const onAll = (ids, fn) => ids.forEach(i => $('#' + i).addEventListener('input', fn));
const val = id => +$('#' + id).value;
const out = (id, s) => put('#' + id + 'o', s);

function frame(w, h, m, x0, x1, y0, y1, logY) {
  const L = m[3], R = w - m[1], T = m[0], Bt = h - m[2];
  const ty = logY ? Math.log : (v => v);
  return { L, R, T, B: Bt, X: x => L + (R - L) * (x - x0) / (x1 - x0), Y: y => Bt - (Bt - T) * (ty(y) - ty(y0)) / (ty(y1) - ty(y0)) };
}
function axes(c, f, xLab, yLab) {
  c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.T); c.lineTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
  c.fillStyle = C.mute; c.font = FONT;
  if (yLab) { c.textAlign = 'left'; c.fillText(yLab, f.L + 6, f.T - 12); }
  if (xLab) { c.textAlign = 'right'; c.fillText(xLab, f.R, f.B + 30); }
}
function xTicks(c, f, items) {
  c.fillStyle = C.mute; c.font = FONT; c.textAlign = 'center'; let lastR = -Infinity;
  for (const [x, s] of items) { const px = f.X(x), w = c.measureText(s).width, cx = Math.min(Math.max(px, f.L + w / 2), f.R - w / 2); if (cx - w / 2 < lastR + 8) continue; c.fillText(s, cx, f.B + 13); lastR = cx + w / 2; }
}
function yTicks(c, f, items) {
  c.fillStyle = C.mute; c.font = FONT; c.textAlign = 'right'; let lastY = Infinity;
  for (const [y, s] of items) { const py = f.Y(y); if (py > lastY - 14 || py < f.T - 1 || py > f.B + 1) continue; c.fillText(s, f.L - 6, py); lastY = py; c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, py); c.lineTo(f.R, py); c.stroke(); }
}
function line(c, pts, f, col, lw, dash) { c.strokeStyle = col; c.lineWidth = lw || 2; c.lineJoin = 'round'; c.setLineDash(dash || []); c.beginPath(); let first = true; for (const [x, y] of pts) { if (!isFinite(y)) { first = true; continue; } const px = f.X(x), py = f.Y(y); if (first) c.moveTo(px, py); else c.lineTo(px, py); first = false; } c.stroke(); c.setLineDash([]); }
function dot(c, x, y, col, r) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r || 4.5, 0, 6.283); c.fill(); }
function clip(c, f, fn) { c.save(); c.beginPath(); c.rect(f.L, f.T - 2, f.R - f.L, f.B - f.T + 4); c.clip(); fn(); c.restore(); }
function poly(c, f, pts, col, a) { c.fillStyle = tint(col, a); c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(f.X(x), f.Y(y)) : c.moveTo(f.X(x), f.Y(y))); c.closePath(); c.fill(); }
const MARG = [28, 14, 40, 46];
const range = (a, b, n) => { const o = []; for (let i = 0; i <= n; i++) o.push(a + (b - a) * i / n); return o; };

/* ═════════ elasticity ═════════ */
(function e1() {
  const cv = $('#e1Cv'); let S = {};
  function update() {
    const e = val('e1E'), dp = val('e1P') / 100, r = M.elastic(e, dp); S = { e, dp, r };
    out('e1E', fmt(e, 2)); out('e1P', spct(dp, 0));
    put('#e1Dq', spct(r.dq)); put('#e1Sp', spct(r.dspend)); put('#e1Arc', fmt(r.arc, 2));
    const v = { e: fmt(e, 2), dp: spct(dp, 0), dq: spct(r.dq), spend: spct(r.dspend) };
    const k = dp === 0 ? 'zero' : Math.abs(e - 1) < 0.08 ? 'unit' : e < 1 ? 'inelastic' : 'elastic';
    putHTML('#e1Say', t('elasticity.say.' + k, v)); sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), f = frame(w, h, MARG, 0, 220, 40, 210);
    xTicks(c, f, [0, 50, 100, 150, 200].map(x => [x, fmt(x)])); yTicks(c, f, [50, 100, 150, 200].map(y => [y, fmt(y)]));
    axes(c, f, t('elasticity.cv.x'), t('elasticity.cv.y'));
    const curve = e => range(40, 210, 80).map(p => [100 * Math.pow(p / 100, -e), p]);
    clip(c, f, () => { line(c, curve(1), f, C.mute, 1.2, [4, 4]); line(c, curve(Math.max(S.e, 0.001)), f, C.gold, 2.4); });
    const p1 = 100 * (1 + S.dp), q1 = 100 * S.r.q;
    c.fillStyle = tint(C.gold, 0.12); c.fillRect(f.X(0), f.Y(p1), f.X(q1) - f.X(0), f.Y(40) - f.Y(p1));
    dot(c, f.X(100), f.Y(100), C.mute, 4); dot(c, f.X(q1), f.Y(p1), C.gold, 6);
  } });
  onAll(['e1E', 'e1P'], update); langHooks.push(update); update();
})();

/* ═════════ ch2 incidence ═════════ */
(function i2() {
  const cv = $('#i2Cv'), inf = $('#i2Inf'); let S = {};
  function update() {
    const tau = val('i2T') / 100, ed = val('i2D'), es = inf.checked ? Infinity : val('i2S'), r = M.incidence(ed, es, tau); S = { tau, ed, es, r };
    $('#i2S').disabled = inf.checked;
    out('i2T', pct(tau, 0)); out('i2D', fmt(ed, 1)); out('i2S', inf.checked ? t('u.inf') : fmt(es, 1));
    put('#i2Pb', spct(r.Pb - 1)); put('#i2Ps', spct(r.Ps - 1)); put('#i2Sh', pct(r.share, 0)); put('#i2Q', spct(r.Q - 1));
    put('#i2Rev', pct(r.rev)); put('#i2Dwl', pct(r.dwl, 2));
    const v = { pb: spct(r.Pb - 1), ps: spct(r.Ps - 1), share: pct(r.share, 0), share2: pct(1 - r.share, 0) };
    const k = tau === 0 ? 'zero' : es === Infinity ? 'small' : Math.abs(r.share - 0.5) < 0.04 ? 'even' : r.share > 0.5 ? 'buyer' : 'seller';
    putHTML('#i2Say', t('ch2.say.' + k, v)); sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), f = frame(w, h, MARG, 0, 180, 50, 170);
    xTicks(c, f, [0, 50, 100, 150].map(x => [x, fmt(x)])); yTicks(c, f, [50, 75, 100, 125, 150].map(y => [y, fmt(y)]));
    axes(c, f, t('ch2.cv.x'), t('ch2.cv.y'));
    const { r, ed, es } = S, Pb = 100 * r.Pb, Ps = 100 * r.Ps, Q = 100 * r.Q;
    clip(c, f, () => {
      // revenue rectangle and deadweight triangle (curved sides)
      c.fillStyle = tint(C.gold, 0.25); c.fillRect(f.X(0), f.Y(Pb), f.X(Q) - f.X(0), f.Y(Ps) - f.Y(Pb));
      const dq = p => 100 * Math.pow(p / 100, -ed), sq = p => es === Infinity ? Infinity : 100 * Math.pow(p / 100, es);
      const tri = []; for (const p of range(Pb, 100, 20)) tri.push([dq(p), p]);
      if (es !== Infinity) for (const p of range(100, Ps, 20)) tri.push([sq(p), p]); else tri.push([100, 100], [Q, 100]);
      tri.push([Q, Ps]); poly(c, f, tri, C.red, 0.4);
      line(c, range(52, 168, 80).map(p => [dq(p), p]), f, C.gold, 2.4);
      if (es === Infinity) line(c, [[0, 100], [180, 100]], f, C.cyan, 2.4);
      else line(c, range(52, 168, 80).map(p => [sq(p), p]), f, C.cyan, 2.4);
      if (S.tau > 0) { line(c, [[0, Pb], [Q, Pb]], f, C.gold, 1.2, [4, 3]); line(c, [[0, Ps], [Q, Ps]], f, C.cyan, 1.2, [4, 3]); }
    });
    dot(c, f.X(100), f.Y(100), C.mute, 4);
    if (S.tau > 0) { dot(c, f.X(Q), f.Y(Pb), C.gold, 5); dot(c, f.X(Q), f.Y(Ps), C.cyan, 5); }
    c.textAlign = 'left'; c.fillStyle = C.gold; c.fillText(t('ch2.cv.pb'), f.L + 6, f.Y(Pb) - 10);
    c.fillStyle = C.cyan; if (S.tau > 0.03) c.fillText(t('ch2.cv.ps'), f.L + 6, f.Y(Ps) + 12);
  } });
  onAll(['i2T', 'i2D', 'i2S'], update); inf.addEventListener('change', update); langHooks.push(update); update();
})();

/* ═════════ ch3 ledger ═════════ */
(function l3() {
  const cv = $('#l3Cv'), cv2 = $('#l3Cv2'); let S = {};
  const exOf = v => v > 20.5 ? Infinity : v;
  function update() {
    const tt = val('l3T'), eX = exOf(val('l3X')), L = M.ledger(tt, eX), o = M.optimalTariff(eX); S = { tt, eX, L, o };
    out('l3T', yuan(tt)); out('l3X', eX === Infinity ? t('u.inf') : fmt(eX, 1));
    put('#l3Cs', area(-L.csLoss)); put('#l3Ps', area(L.psGain)); put('#l3Rev', area(L.rev)); put('#l3Tot', area(L.tot));
    put('#l3Net', area(L.net)); put('#l3Opt', yuan(o.t)); put('#l3For', area(-L.foreignLoss)); put('#l3W', area(L.world));
    const v = { t: yuan(tt), opt: yuan(o.t), tot: area(L.tot), dwl: t('u.area', { v: fmt(L.dwl, 0) }), net: area(L.net), world: area(L.world) };
    const k = tt === 0 ? 'zero' : L.prohibitive ? 'block' : eX === Infinity ? 'small' : L.net > 0 ? 'gain' : 'loss';
    putHTML('#l3Say', t('ch3.say.' + k, v)); sim.dirty = true;
  }
  const sim = reg([cv, cv2], { draw() {
    { const { c, w, h } = fit(cv), f = frame(w, h, MARG, 0, 130, 60, 150);
      xTicks(c, f, [0, 40, 80, 120].map(x => [x, fmt(x)])); yTicks(c, f, [60, 80, 100, 120, 140].map(y => [y, fmt(y)]));
      axes(c, f, t('ch3.cv.x'), t('ch3.cv.y'));
      const L = S.L, P = L.P, Ps = L.Pstar, D = p => 100 - (p - 100), Sp = p => 40 + 0.4 * (p - 100);
      clip(c, f, () => {
        poly(c, f, [[0, P], [L.S1, P], [40, 100], [0, 100]], C.violet, 0.35);
        poly(c, f, [[40, 100], [L.S1, P], [L.S1, 100]], C.red, 0.45);
        poly(c, f, [[L.S1, P], [L.D1, P], [L.D1, 100], [L.S1, 100]], C.gold, 0.3);
        poly(c, f, [[L.D1, P], [100, 100], [L.D1, 100]], C.red, 0.45);
        if (Ps < 100) poly(c, f, [[L.S1, 100], [L.D1, 100], [L.D1, Ps], [L.S1, Ps]], C.cyan, 0.35);
        line(c, [[D(150), 150], [D(60), 60]], f, C.gold, 2.2); line(c, [[Sp(60), 60], [Sp(150), 150]], f, C.violet, 2.2);
        line(c, [[0, 100], [130, 100]], f, C.mute, 1, [4, 3]); line(c, [[0, P], [130, P]], f, C.ink, 1);
      });
      c.textAlign = 'left'; c.fillStyle = C.gold; c.fillText(t('ch3.cv.d'), f.X(D(146)) + 6, f.Y(146));
      c.fillStyle = C.violet; c.fillText(t('ch3.cv.s'), f.X(Sp(144)) - 70, f.Y(144));
    }
    { const { c, w, h } = fit(cv2), xs = range(0, 50, 100), ys = xs.map(x => M.ledger(x, S.eX).net);
      const lo = Math.min(-200, ...ys), hi = Math.max(100, ...ys), f = frame(w, h, [28, 14, 40, 56], 0, 50, lo, hi);
      xTicks(c, f, [0, 10, 20, 30, 40, 50].map(x => [x, fmt(x)]));
      const st = hi - lo > 1500 ? 500 : hi - lo > 600 ? 200 : 100, tk = []; for (let v = Math.ceil(lo / st) * st; v <= hi; v += st) tk.push([v, fmt(v)]);
      yTicks(c, f, tk); axes(c, f, t('ch3.cv.x2'), t('ch3.cv.y2'));
      line(c, [[0, 0], [50, 0]], f, C.mute, 1, [4, 3]);
      line(c, xs.map((x, i) => [x, ys[i]]), f, C.ink, 2.2);
      if (S.eX !== Infinity) dot(c, f.X(S.o.t), f.Y(S.o.net), C.cyan, 5);
      dot(c, f.X(S.tt), f.Y(S.L.net), C.gold, 6);
    }
  } });
  onAll(['l3T', 'l3X'], update); langHooks.push(update); update();
})();

/* ═════════ ch4 Ricardo ═════════ */
(function r4() {
  const cvE = $('#r4CvE'), cvP = $('#r4CvP'); let S = {}, auto = true;
  function update(ev) {
    if (ev && ev.target && ev.target.id === 'r4P') auto = false;
    const pc = val('r4C'), base = M.ricardo({ pC: pc });
    if (auto) $('#r4P').value = base.pe.toFixed(3);
    const p = val('r4P'), R = M.ricardo({ pC: pc, p }); S = { R, pc };
    out('r4P', fmt(p, 3)); out('r4C', fmt(pc, 1));
    put('#r4GE', spct(R.gE)); put('#r4GP', spct(R.gP)); put('#r4Pe', fmt(R.pe, 3)); put('#r4Band', fmt(Math.min(R.autE, R.autP), 2) + ' – ' + fmt(Math.max(R.autE, R.autP), 2));
    const lo = Math.min(R.autE, R.autP), hi = Math.max(R.autE, R.autP);
    const v = { p: fmt(p, 3), lo: fmt(lo, 2), hi: fmt(hi, 2), ge: spct(R.gE), gp: spct(R.gP) };
    const k = hi - lo < 0.005 ? 'same' : p <= lo + 0.003 ? 'edgeE' : p >= hi - 0.003 ? 'edgeP' : 'both';
    putHTML('#r4Say', t('ch4.say.' + k, v)); sim.dirty = true;
  }
  function panel(cv, L, lc, lw, col, name, p) {
    const { c, w, h } = fit(cv), f = frame(w, h, [28, 12, 40, 40], 0, 3, 0, 3);
    xTicks(c, f, [0, 1, 2, 3].map(x => [x, fmt(x)])); yTicks(c, f, [0, 1, 2, 3].map(y => [y, fmt(y)]));
    axes(c, f, t('ch4.cv.x'), t('ch4.cv.y'));
    const cMax = L / lc, wMax = L / lw, I = Math.max(cMax * p, wMax);
    clip(c, f, () => {
      line(c, [[0, wMax], [cMax, 0]], f, C.mute, 2);
      line(c, [[0, I], [I / p, 0]], f, col, 1.4, [5, 4]);
    });
    dot(c, f.X(L / 2 / lc), f.Y(L / 2 / lw), C.mute, 4); dot(c, f.X(I / 2 / p), f.Y(I / 2), C.gold, 6);
    c.textAlign = 'right'; c.fillStyle = col; c.font = '600 13px -apple-system,"PingFang SC",system-ui,sans-serif'; c.fillText(name, f.R, f.T + 4); c.font = FONT;
  }
  const sim = reg([cvE, cvP], { draw() {
    const R = S.R; panel(cvE, R.LE, 100, 120, C.cyan, t('ch4.cv.en'), R.p); panel(cvP, R.LP, S.pc, 80, C.violet, t('ch4.cv.pt'), R.p);
  } });
  onAll(['r4P', 'r4C'], update); $('#r4Auto').addEventListener('click', () => { auto = true; update(); });
  langHooks.push(update); update();
})();

/* ═════════ ch5 balance ═════════ */
(function b5() {
  const cv = $('#b5Cv'), YRS = 3; let S = {}, tNow = 0, playing = false;
  function update(keep) {
    if (keep !== true) { tNow = playing ? tNow : 0; }
    const o = { sPriv: val('b5S'), inv: val('b5I'), deficit: val('b5D') }, m = val('b5M'), B = M.balance(o), sh = M.tariffShock(m, tNow, o);
    S = { o, m, B, sh };
    out('b5S', t('u.gdp', { v: fmt(o.sPriv, 1) })); out('b5I', t('u.gdp', { v: fmt(o.inv, 1) })); out('b5D', t('u.gdp', { v: fmt(o.deficit, 1) })); out('b5M', t('u.gdp', { v: fmt(m, 1) }));
    put('#b5Ca', gdp(B.ca)); put('#b5Sn', t('u.gdp', { v: fmt(B.s, 1) })); put('#b5Nx', gdp(sh.nx)); put('#b5Ap', pct(sh.appr / 100)); put('#b5Full', pct(sh.apprFull / 100));
    const gap = Math.abs(B.ca), base = { gap: t('u.gdp', { v: fmt(gap, 1) }), ca: gdp(B.ca) };
    let shock;
    if (m === 0) shock = t('ch5.say.shock0');
    else if (tNow >= YRS - 1e-6) shock = t('ch5.say.shock2', { nx: gdp(sh.nx), appr: pct(sh.appr / 100) });
    else shock = t('ch5.say.shock1', { yr: fmt(tNow, 1), nx: gdp(sh.nx), ca: gdp(B.ca), left: t('u.gdp', { v: fmt(sh.nx - B.ca, 2) }), appr: pct(sh.appr / 100) });
    const k = Math.abs(B.ca) < 0.05 ? 'balanced' : B.ca < 0 ? 'deficit' : 'surplus';
    putHTML('#b5Say', t('ch5.say.' + k, Object.assign(base, { shock }))); sim.dirty = true;
  }
  const sim = reg(cv, {
    step(dt) { if (!playing) return false; tNow = Math.min(YRS, tNow + dt * 0.6); if (tNow >= YRS) playing = false; update(true); return true; },
    draw() {
      const { c, w, h } = fit(cv), ca = S.B.ca, lo = Math.min(ca, ca + S.m) - 1, hi = Math.max(ca, ca + S.m, 0) + 1;
      const f = frame(w, h, MARG, 0, YRS, lo, hi);
      xTicks(c, f, [0, 1, 2, 3].map(x => [x, fmt(x)])); const tk = []; for (let v = Math.ceil(lo); v <= hi; v++) tk.push([v, fmt(v)]); yTicks(c, f, tk);
      axes(c, f, t('ch5.cv.x'), t('ch5.cv.y'));
      line(c, [[0, 0], [YRS, 0]], f, C.mute, 1, [3, 3]);
      line(c, [[0, ca], [YRS, ca]], f, C.cyan, 2);
      const pts = range(0, tNow, 60).map(x => [x, M.tariffShock(S.m, x, S.o).nx]);
      line(c, pts, f, C.gold, 2.4); dot(c, f.X(tNow), f.Y(S.sh.nx), C.gold, 5);
    } });
  onAll(['b5S', 'b5I', 'b5D', 'b5M'], () => update());
  $('#b5Play').addEventListener('click', () => { if (reduce) { tNow = YRS; update(true); return; } if (tNow >= YRS) tNow = 0; playing = true; });
  $('#b5Reset').addEventListener('click', () => { playing = false; tNow = 0; update(true); });
  langHooks.push(() => update(true)); update();
})();

/* ═════════ ch6 diversion ═════════ */
(function d6() {
  const cv = $('#d6Cv'); let S = {};
  function update() {
    const tau = val('d6T') / 100, psi = val('d6Psi') / 100, sigma = val('d6Sg'), D = M.divert({ tau, psi, sigma }); S = { D };
    out('d6T', pct(tau, 0)); out('d6Psi', pct(psi, 0)); out('d6Sg', fmt(sigma, 1));
    put('#d6Sc', pct(D.sC)); put('#d6Dp', spct(D.dP)); put('#d6C', spct(D.toC1 / D.toC0 - 1)); put('#d6V', spct(D.toV1 / D.toV0 - 1)); put('#d6Tot', spct(D.total1 / D.total0 - 1));
    const psiS = psi === 0 ? t('ch6.say.psi0') : t('ch6.say.psi1', { psi: pct(psi, 0), cut: pct(1 - D.pCstar) });
    const k = tau === 0 ? 'zero' : 'main';
    putHTML('#d6Say', t('ch6.say.' + k, { toC: spct(D.toC1 / D.toC0 - 1), toV: spct(D.toV1 / D.toV0 - 1), sc: pct(D.sC), dp: spct(D.dP), tau: pct(tau, 0), psi: psiS })); sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), D = S.D, lw = Math.min(110, w * 0.28), L = lw, R = w - 60, bh = 18;
    const X = v => L + (R - L) * v / 1;
    const rows = [[t('ch6.cv.before'), [[D.toC0, C.red], [D.toV0, C.cyan]]], [t('ch6.cv.after'), [[D.toC1, C.red], [D.toV1, C.cyan], [D.rev, C.green]]]];
    rows.forEach(([lab, segs], i) => {
      const y = 30 + i * 60; c.fillStyle = C.mute; c.textAlign = 'right'; c.fillText(lab, L - 10, y + bh / 2);
      let x = 0; for (const [v, col] of segs) { c.fillStyle = tint(col, 0.6); c.fillRect(X(x), y, X(x + v) - X(x), bh); x += v; }
    });
    const ly = h - 22; let lx = L;
    for (const [k, col] of [['ch6.cv.a', C.red], ['ch6.cv.b', C.cyan], ['ch6.cv.rev', C.green]]) { c.fillStyle = tint(col, 0.6); c.fillRect(lx, ly - 6, 12, 12); c.fillStyle = C.mute; c.textAlign = 'left'; const s = t(k); c.fillText(s, lx + 18, ly); lx += 30 + c.measureText(s).width; }
  } });
  onAll(['d6T', 'd6Psi', 'd6Sg'], update); langHooks.push(update); update();
})();

/* ═════════ ch6 retaliation matrix ═════════ */
(function t6() {
  function update() {
    const v = val('t6X'), eX = v > 20.5 ? Infinity : v, o = M.optimalTariff(eX), m = M.retalMatrix(eX, o.t);
    out('t6X', eX === Infinity ? t('u.inf') : fmt(eX, 1)); put('#t6T', yuan(o.t));
    const cell = (id, r) => putHTML('#' + id, t('ch6.t.cell', { a: M.signed(r.a, 0, effLang()), b: M.signed(r.b, 0, effLang()) }));
    cell('t6ff', m.ff); cell('t6ft', m.ft); cell('t6tf', m.tf); cell('t6tt', m.tt);
    $$('#lab-t6 td').forEach(td => td.classList.toggle('nash', td.id === 't6tt' && eX !== Infinity));
    putHTML('#t6Say', eX === Infinity ? t('ch6.t.say.inf') : t('ch6.t.say.pd', { gain: area(m.tf.a - m.ff.a), both: area(m.tt.a) }));
  }
  onAll(['t6X'], update); langHooks.push(update); update();
})();

/* ═════════ ch7 chokepoint ═════════ */
(function k7() {
  const cv = $('#k7Cv'), YRS = 10; let S = {}, tNow = 10, playing = false;
  const opts = () => ({ s: val('k7S') / 100, cut: val('k7C') / 100, T: val('k7T') });
  function update() {
    const o = opts(), now = M.chokeAt(Math.max(tNow, 1 / 12), o), p1 = M.chokeAt(1 / 12, o); S = { o, now };
    out('k7S', pct(o.s, 0)); out('k7C', pct(o.cut, 0)); out('k7T', fmt(o.T, 1));
    put('#k7P1', t('u.x', { v: fmt(p1.P, 2) })); put('#k7P', t('u.x', { v: fmt(now.P, 2) })); put('#k7Sh', pct(now.share, 0)); put('#k7Rev', fmt(now.ctrlRev, 2));
    const yr = tNow < 1 ? t('u.mo', { v: fmt(Math.max(1, Math.round(tNow * 12))) }) : t('u.yr', { v: fmt(tNow, 1) });
    const v = { yr, p: t('u.x', { v: fmt(now.P, 2) }), share: pct(now.share, 0), rev: t('u.x', { v: fmt(now.ctrlRev, 2) }) };
    const k = o.cut === 0 ? 'none' : now.ctrlRev > 1.05 && tNow < 2 ? 'early' : now.ctrlRev >= 1 ? 'mid' : 'late';
    putHTML('#k7Say', t('ch7.say.' + k, v)); sim.dirty = true;
  }
  const sim = reg(cv, {
    step(dt) { if (!playing) return false; tNow = Math.min(YRS, tNow + dt * 1.2); if (tNow >= YRS) playing = false; update(); return true; },
    draw() {
      const { c, w, h } = fit(cv), path = M.chokePath(S.o, YRS, 120).filter(([x]) => x > 0), hi = Math.max(2, ...path.map(([, r]) => r.P)) * 1.1;
      const f = frame(w, h, [28, 46, 40, 46], 0, YRS, 0.9, hi, true);
      xTicks(c, f, [0, 2, 4, 6, 8, 10].map(x => [x, fmt(x)]));
      yTicks(c, f, [1, 1.5, 2, 3, 5, 10, 20, 50].filter(v => v < hi).map(v => [v, fmt(v, v < 2 ? 1 : 0)]));
      axes(c, f, t('ch7.cv.x'), t('ch7.cv.y'));
      const fs = frame(w, h, [28, 46, 40, 46], 0, YRS, 0, 1);
      c.fillStyle = C.mute; c.textAlign = 'left'; [0, 0.5, 1].forEach(v => c.fillText(fmt(v * 100) + '%', f.R + 6, fs.Y(v)));
      c.textAlign = 'right'; c.fillText(t('ch7.cv.y2'), f.R + 40, f.T - 12);
      const shown = path.filter(([x]) => x <= tNow + 1e-9);
      line(c, path.map(([x, r]) => [x, r.P]), f, tint(C.gold, 0.25), 1.5);
      line(c, path.map(([x, r]) => [x, r.share]), fs, tint(C.violet, 0.25), 1.5);
      line(c, shown.map(([x, r]) => [x, r.P]), f, C.gold, 2.4); line(c, shown.map(([x, r]) => [x, r.share]), fs, C.violet, 2.2);
      dot(c, f.X(tNow), f.Y(S.now.P), C.gold, 5); dot(c, fs.X(tNow), fs.Y(S.now.share), C.violet, 5);
    } });
  onAll(['k7S', 'k7C', 'k7T'], update);
  $('#k7Play').addEventListener('click', () => { if (reduce) { tNow = YRS; update(); return; } tNow = 0; playing = true; });
  $('#k7Reset').addEventListener('click', () => { playing = false; tNow = 0; update(); });
  langHooks.push(update); update();
})();

/* ═════════ ch8 pass-through estimator ═════════ */
(function p8() {
  const cv = $('#p8Cv'); let S = {}, seed = 7;
  function update() {
    const o = { beta: val('p8B'), g: val('p8G') / 100, theta: val('p8Th') / 100, absorb: val('p8Ab') / 100, n: val('p8N'), seed };
    const P = M.passthru(o); S = { P, o };
    out('p8B', pct(o.beta, 0)); out('p8G', spct(o.g, 1)); out('p8Th', pct(o.theta, 0)); out('p8Ab', pct(o.absorb, 0)); out('p8N', fmt(o.n));
    put('#p8Nv', pct(P.naive, 0)); put('#p8Did', pct(P.border.b, 0) + ' ± ' + pct(P.border.se, 0)); put('#p8Rt', fmt(P.retail.b, 2)); put('#p8Full', fmt(P.complete, 2));
    const r = P.retail.b, full = P.complete, tol = Math.max(0.03, 2.5 * P.retail.se);
    const verdict = Math.abs(r - full) <= tol ? t('ch8.say.full', { full: fmt(full, 2) }) : r < full ? t('ch8.say.part', { full: fmt(full, 2) }) : t('ch8.say.over', { full: fmt(full, 2) });
    putHTML('#p8Say', t('ch8.say.main', { naive: pct(P.naive, 0), did: pct(P.border.b, 0), se: pct(P.border.se, 0), beta: pct(o.beta, 0), retail: fmt(r, 2), verdict })); sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), P = S.P, f = frame(w, h, MARG, -0.02, 0.25, -0.3, 0.6);
    xTicks(c, f, [0, 0.05, 0.1, 0.15, 0.2].map(x => [x, fmt(x, 2)])); yTicks(c, f, [-0.2, 0, 0.2, 0.4].map(y => [y, fmt(y, 1)]));
    axes(c, f, t('ch8.cv.x'), t('ch8.cv.y'));
    const jit = M.rng(3);
    clip(c, f, () => {
      for (const p of P.pts) { const jx = (jit() - 0.5) * 0.012; c.fillStyle = tint(C.cyan, 0.45); c.fillRect(f.X(p.x + jx) - 1.5, f.Y(p.border) - 1.5, 3, 3); c.fillStyle = tint(C.gold, 0.45); c.fillRect(f.X(p.x + jx + 0.006) - 1.5, f.Y(p.retail) - 1.5, 3, 3); }
      line(c, [[-0.02, P.border.a - 0.02 * P.border.b], [0.25, P.border.a + 0.25 * P.border.b]], f, C.cyan, 2.4);
      line(c, [[-0.02, P.retail.a - 0.02 * P.retail.b], [0.25, P.retail.a + 0.25 * P.retail.b]], f, C.gold, 2.4);
      line(c, [[-0.02, 0], [0.25, 0]], f, C.mute, 1, [3, 3]);
    });
  } });
  onAll(['p8B', 'p8G', 'p8Th', 'p8Ab', 'p8N'], update);
  $('#p8Re').addEventListener('click', () => { seed = (seed * 7919 + 13) % 100003; update(); });
  langHooks.push(update); update();
})();

applyLang();
requestAnimationFrame(loop);
window.__essayReady = true;
})();
