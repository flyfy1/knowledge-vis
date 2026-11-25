/* Why Do Recessions Happen?: i18n runtime, wiring and drawing.
   All visible text comes from copy.*.js (generated from content.*.md). Every model lives in models.js.
   Nothing animates on its own: canvases redraw only when visible and dirty, so reduced motion needs no guard. */
(() => {
'use strict';
const M = window.RecessionModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const C = { grid: '#1f2533', axis: '#3a4254', ink: '#ebe8e0', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', dim: '#3a4254' };
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';

/* language */
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
const pct = (x, d) => t('u.pct', { v: fmt(x, d == null ? 0 : d) });
const updaters = [];
function applyLang() {
  document.documentElement.lang = effLang() === 'zh' ? 'zh-CN' : 'en';
  document.title = t('doc.title');
  const md = document.querySelector('meta[name=description]');
  if (md) md.content = t('doc.desc');
  $$('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
  $$('[data-i18n-html]').forEach(e => { e.innerHTML = t(e.dataset.i18nHtml); });
  $$('[data-i18n-aria]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.i18nAria)); });
  $$('#langToggle button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  updaters.forEach(f => f());
  sims.forEach(s => { s.dirty = true; });
}
$$('#langToggle button').forEach(b => b.addEventListener('click', () => { lang = b.dataset.lang; writeLang(lang); applyLang(); }));

/* canvas + on-screen registry */
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
  for (const s of sims) if (s.cv === e.target) { s.vis = e.isIntersecting; s.dirty = true; }
}), { rootMargin: '60px' });
function reg(cv, draw) { const o = { cv, draw, vis: false, dirty: true }; sims.push(o); io.observe(cv); return o; }
window.addEventListener('resize', () => sims.forEach(s => { s.dirty = true; }));
function loop() { for (const s of sims) if (s.vis && s.dirty) { s.dirty = false; s.draw(); } requestAnimationFrame(loop); }
const put = (id, s) => { const e = document.getElementById(id); if (e && e.textContent !== s) e.textContent = s; };
const putHTML = (id, s) => { const e = document.getElementById(id); if (e && e.__h !== s) { e.innerHTML = s; e.__h = s; } };
const num = id => Number(document.getElementById(id).value);
function bind(ids, fn) {
  ids.forEach(id => { const e = document.getElementById(id); e.addEventListener('input', fn); e.addEventListener('change', fn); });
  updaters.push(fn);
}

/* generic line chart: series = [{ys, color, dash, w}], x from 0 to n−1 */
function chart(cv, series, opts) {
  const { c, w, h } = fit(cv);
  const all = series.flatMap(s => s.ys).filter(isFinite);
  let y0 = opts.y0 != null ? opts.y0 : Math.min(...all), y1 = opts.y1 != null ? opts.y1 : Math.max(...all);
  if (y1 - y0 < 1e-9) { y0 -= 1; y1 += 1; }
  const pad = (y1 - y0) * 0.08; y0 -= pad; y1 += pad;
  const n = Math.max(...series.map(s => s.ys.length));
  const Lm = w < 420 ? 40 : 48, L = Lm, R = w - 14, T = 22, B = h - 26;
  const X = i => L + (R - L) * i / Math.max(1, n - 1), Y = v => B - (B - T) * (v - y0) / (y1 - y0);
  const raw = (y1 - y0) / 4, p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p;
  const st = (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p;
  c.strokeStyle = C.grid; c.lineWidth = 1; c.fillStyle = C.mute; c.textAlign = 'right';
  for (let v = Math.ceil(y0 / st) * st; v <= y1 + 1e-9; v += st) {
    const y = Y(v); c.beginPath(); c.moveTo(L, y); c.lineTo(R, y); c.stroke(); c.fillText(fmt(v, st < 1 ? 1 : 0), L - 6, y);
  }
  c.strokeStyle = C.axis; c.beginPath(); c.moveTo(L, T); c.lineTo(L, B); c.lineTo(R, B); c.stroke();
  c.save(); c.beginPath(); c.rect(L, T - 2, R - L, B - T + 4); c.clip();
  for (const s of series) {
    c.strokeStyle = s.color; c.lineWidth = s.w || 2.2; c.setLineDash(s.dash || []); c.beginPath();
    s.ys.forEach((v, i) => { const x = X(i), y = Y(Math.max(y0, Math.min(y1, v))); i ? c.lineTo(x, y) : c.moveTo(x, y); });
    c.stroke(); c.setLineDash([]);
  }
  c.restore();
  c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(opts.ylab || '', L, 10);
  c.textAlign = 'right'; c.textBaseline = 'bottom'; c.fillText(opts.xlab || '', R, h - 2); c.textBaseline = 'middle';
}

/* ch1: paradox of thrift */
{
  let st = null; const cv = $('#c1Cv');
  const sim = reg(cv, () => st && chart(cv, [
    { ys: st.Y, color: C.gold }, { ys: st.S.map(s => s * 5), color: C.cyan }, { ys: st.I.map(s => s * 5), color: C.violet, dash: [5, 4], w: 1.6 }
  ], { y0: 0, y1: 110, ylab: t('ch1.cv.y'), xlab: t('ch1.cv.x') }));
  const upd = () => {
    const s = num('c1S'), b = $('#c1B').checked;
    st = M.thrift({ C0: 10, I0: b ? 5 : 10, b: b ? 0.05 : 0, c0: 0.8, c1: 1 - s / 100, n: 24 });
    put('c1So', t('ch1.u.per100', { v: fmt(s, 0) }));
    put('c1Y', '100 → ' + fmt(st.y1, 1)); put('c1Sp', fmt(st.S[1], 2)); put('c1Sf', fmt(st.s0, 2) + ' → ' + fmt(st.s1, 2));
    putHTML('c1Say', t(b ? 'ch1.say.ind' : 'ch1.say.fix', { y: fmt(st.y1, 1), sp: fmt(st.S[1], 2), s: fmt(st.s1, 2) }));
    sim.dirty = true;
  };
  bind(['c1S', 'c1B'], upd);
}

/* ch2: accelerator */
{
  let st = null; const cv = $('#c2Cv');
  const sim = reg(cv, () => st && chart(cv, [
    { ys: st.sales.slice(1).map((s, i) => (s / st.sales[i] - 1) * 100), color: C.cyan },
    { ys: st.inv.map((x, i) => i ? (x / st.inv[i - 1] - 1) * 100 : 0), color: C.gold }
  ], { ylab: t('ch2.cv.y'), xlab: t('ch2.cv.x') }));
  const upd = () => {
    const g2 = num('c2G'), v = num('c2V');
    st = M.accelerator({ v, delta: 0.1, g1: 10, g2 });
    put('c2Go', pct(g2, 0)); put('c2Vo', fmt(v, 1));
    put('c2Sg', '10% → ' + pct(g2, 0)); put('c2Ib', fmt(st.before, 1)); put('c2Ia', fmt(st.after, 1)); put('c2Ch', pct(st.change, 1));
    putHTML('c2Say', t(st.change < 0 && g2 > 0 ? 'ch2.say.paradox' : 'ch2.say.plain', { g: fmt(g2, 0), ch: fmt(st.change, 1) }));
    sim.dirty = true;
  };
  bind(['c2G', 'c2V'], upd);
}

/* ch3: Samuelson multiplier–accelerator */
{
  let st = null; const pl = $('#c3Pl'), cv = $('#c3Cv');
  const regCol = { mono: C.green, damped: C.cyan, explosive: C.red, runaway: C.violet };
  const simP = reg(pl, () => {
    if (!st) return;
    const { c, w, h } = fit(pl);
    const L = 34, R = w - 10, T = 10, B = h - 22, X = v => L + (R - L) * v / 4, Y = q => B - (B - T) * q;
    const step = 4;
    for (let x = L; x < R; x += step) for (let y = T; y < B; y += step) {
      const v = (x - L) / (R - L) * 4, q = (B - y) / (B - T);
      if (q <= 0.01) continue;
      c.fillStyle = regCol[M.samuelsonRegion(q, Math.max(v, 1e-6))]; c.globalAlpha = 0.22; c.fillRect(x, y, step, step);
    }
    c.globalAlpha = 1; c.strokeStyle = C.axis; c.strokeRect(L, T, R - L, B - T);
    c.fillStyle = C.gold; c.beginPath(); c.arc(X(st.v), Y(st.c), 6, 0, 7); c.fill();
    c.fillStyle = C.mute; c.textAlign = 'center'; c.textBaseline = 'top';
    [0, 1, 2, 3, 4].forEach(v => c.fillText(String(v), X(v), B + 4));
    c.textAlign = 'right'; c.textBaseline = 'middle'; c.fillText('1', L - 6, Y(1)); c.fillText('0', L - 6, Y(0));
    c.textAlign = 'right'; c.textBaseline = 'bottom'; c.fillText('v', R, h - 2); c.textBaseline = 'middle';
  });
  const simC = reg(cv, () => st && chart(cv, [
    { ys: st.path.Y, color: C.gold }, { ys: st.path.Y.map(() => st.path.yNew), color: C.mute, dash: [6, 4], w: 1.4 }
  ], { ylab: t('ch3.cv.y'), xlab: t('ch3.cv.x') }));
  const upd = () => {
    const c = num('c3C'), v = num('c3V'), noise = $('#c3N').checked;
    const R = M.samuelsonRoots(c, v), region = M.samuelsonRegion(c, v);
    const path = M.samuelsonPath({ c, v, sigma: noise ? 1 : 0, seed: 11, n: 60 });
    st = { c, v, R, region, path };
    put('c3Co', fmt(c, 2)); put('c3Vo', fmt(v, 2));
    put('c3Reg', t('ch3.lg.' + region)); put('c3Mod', fmt(R.mod, 2));
    put('c3Per', R.period ? t('ch3.u.q', { v: fmt(R.period, 1) }) : '—');
    put('c3Pk', isFinite(path.peak) && path.peak < 1e4 ? fmt(path.peak, 1) : '—');
    putHTML('c3Say', t('ch3.say.' + region, { mod: fmt(R.mod, 2), per: R.period ? fmt(R.period, 1) : '' }));
    simP.dirty = true; simC.dirty = true;
  };
  bind(['c3C', 'c3V', 'c3N'], upd);
  pl.addEventListener('pointerdown', e => {
    const r = pl.getBoundingClientRect(), L = 34, R = r.width - 10, T = 10, B = r.height - 22;
    const v = Math.max(0, Math.min(4, (e.clientX - r.left - L) / (R - L) * 4));
    const q = Math.max(0.3, Math.min(0.95, (B - (e.clientY - r.top)) / (B - T)));
    $('#c3C').value = q.toFixed(2); $('#c3V').value = v.toFixed(2); upd();
  });
}

/* ch4: bullwhip */
{
  let st = null; const cv = $('#c4Cv');
  const sim = reg(cv, () => st && chart(cv, [
    { ys: st.orders[0], color: C.mute }, { ys: st.orders[1], color: C.cyan }, { ys: st.orders[2], color: C.violet }, { ys: st.orders[3], color: C.gold, w: 2.6 }
  ], { y0: 0, y1: 140, ylab: t('ch4.cv.y'), xlab: t('ch4.cv.x') }));
  const upd = () => {
    const o = { L: 2, T: num('c4T'), cover: num('c4K'), alpha: num('c4A'), drop: num('c4D'), w: $('#c4W').checked ? 1 : 0, n: 60 };
    st = M.bullwhip(o);
    put('c4Do', pct(o.drop, 0)); put('c4Ko', t('ch4.u.wk', { v: fmt(o.cover, 1) })); put('c4Ao', fmt(o.alpha, 1)); put('c4To', t('ch4.u.wk', { v: fmt(o.T, 0) }));
    put('c4R', '−' + pct(st.dropPct[1], 1)); put('c4Wd', '−' + pct(st.dropPct[2], 1)); put('c4F', '−' + pct(st.dropPct[3], 1));
    put('c4O', fmt(st.highs[3] - (100 - o.drop), 1));
    putHTML('c4Say', t('ch4.say', { d: fmt(o.drop, 0), f: fmt(st.dropPct[3], 1), x: fmt(st.dropPct[3] / o.drop, 1) }));
    sim.dirty = true;
  };
  bind(['c4D', 'c4K', 'c4A', 'c4T', 'c4W'], upd);
}

/* ch6: deleveraging */
{
  let st = null; const cv = $('#c6Cv');
  const sim = reg(cv, () => st && chart(cv, [
    { ys: st.Y, color: C.gold }, { ys: st.debt, color: C.red, dash: [5, 4], w: 1.6 }
  ], { y0: 60, y1: 104, ylab: t('ch6.cv.y'), xlab: t('ch6.cv.x') }));
  const upd = () => {
    const o = { c: 0.8, C0: 5, I: 7.5, G0: 7.5, D0: 80, m: 0.8, priceDrop: num('c6D'), phi: num('c6P'), gamma: num('c6G'), n: 60 };
    st = M.deleverage(o);
    put('c6Do', pct(o.priceDrop, 0)); put('c6Po', pct(o.phi * 100, 0)); put('c6Go', pct(o.gamma * 100, 0));
    put('c6Ex', fmt(st.excess, 1)); put('c6Tr', fmt(st.trough, 1)); put('c6Bl', t('ch6.u.q', { v: st.below }));
    put('c6Cu', pct(st.cumLossExact, 0));
    putHTML('c6Say', t(st.excess > 0 ? 'ch6.say.cut' : 'ch6.say.none', { ex: fmt(st.excess, 1), cum: fmt(st.cumLossExact, 0), tr: fmt(st.trough, 1) }));
    sim.dirty = true;
  };
  bind(['c6D', 'c6P', 'c6G'], upd);
}

/* ch7: automatic stabilisers and lagged policy */
{
  let st = null, base = null; const cv = $('#c7Cv');
  const sim = reg(cv, () => st && chart(cv, [
    { ys: base.Y, color: C.mute, dash: [5, 4], w: 1.5 }, { ys: st.Y, color: C.gold }
  ], { ylab: t('ch7.cv.y'), xlab: t('ch7.cv.x') }));
  const upd = () => {
    const tau = num('c7Tau'), k = num('c7K'), lag = num('c7L');
    const P = { c: 0.8, v: 0.5, shock: 2, dur: 8, n: 40 };
    base = M.stabiliser(Object.assign({}, P, { tau: 0, k: 0 }));
    st = M.stabiliser(Object.assign({}, P, { tau, k, lag }));
    put('c7Tauo', pct(tau * 100, 0)); put('c7Ko', fmt(k, 2)); put('c7Lo', t('ch7.u.q', { v: lag }));
    put('c7M', fmt(st.mult, 2)); put('c7Dp', pct(st.depth, 1)); put('c7Ov', pct(st.over, 1)); put('c7Rm', fmt(st.rms, 2));
    const cls = k > 0 && st.rms > base.rms ? 'worse' : (k > 0 || tau > 0) ? 'better' : 'none';
    putHTML('c7Say', t('ch7.say.' + cls, { d: fmt(st.depth, 1), d0: fmt(base.depth, 1), r: fmt(st.rms, 2), r0: fmt(base.rms, 2) }));
    sim.dirty = true;
  };
  bind(['c7Tau', 'c7K', 'c7L'], upd);
}

/* ch8: indicator as classifier */
{
  let st = null; const cv = $('#c8Cv');
  const sim = reg(cv, () => {
    if (!st) return;
    const { c, w, h } = fit(cv);
    const cnt = st.perCentury, tp = Math.round(cnt.hits), fp = Math.round(cnt.falses), fn = Math.round(cnt.misses);
    const cols = [];
    for (let i = 0; i < 100; i++) cols.push(i < tp ? C.gold : i < tp + fn ? C.violet : i < tp + fn + fp ? C.red : C.dim);
    const n = 20, s = Math.min((w - 20) / n, (h - 20) / 5), x0 = (w - s * n) / 2, y0 = (h - s * 5) / 2;
    cols.forEach((col, i) => { c.fillStyle = col; c.fillRect(x0 + (i % n) * s + 1, y0 + Math.floor(i / n) * s + 1, s - 2, s - 2); });
  });
  const presets = { sahm: () => { const r = M.sahmRates(); return [r.p * 100, r.h * 100, r.f * 100]; }, lead: () => [M.sahmRates().p * 100, 80, 15] };
  const upd = () => {
    const p = num('c8P') / 100, hh = num('c8H') / 100, f = num('c8F') / 100;
    st = M.classifier(p, hh, f);
    put('c8Po', pct(p * 100, 1)); put('c8Ho', pct(hh * 100, 0)); put('c8Fo', pct(f * 100, 1));
    put('c8Pv', pct(st.ppv * 100, 0)); put('c8Tp', fmt(st.perCentury.hits, 1)); put('c8Fp', fmt(st.perCentury.falses, 1)); put('c8Fn', fmt(st.perCentury.misses, 1));
    putHTML('c8Say', t('ch8.say', { ppv: fmt(st.ppv * 100, 0), fp: fmt(st.perCentury.falses, 1), tp: fmt(st.perCentury.hits, 1) }));
    sim.dirty = true;
  };
  $$('input[name=c8Pre]').forEach(e => e.addEventListener('change', () => {
    const v = presets[e.value]();
    $('#c8P').value = v[0].toFixed(1); $('#c8H').value = v[1].toFixed(0); $('#c8F').value = v[2].toFixed(1); upd();
  }));
  bind(['c8P', 'c8H', 'c8F'], upd);
}

/* ch9: NBER contractions and expansions since 1945 (data, not a model) */
{
  const cv = $('#c9Cv');
  reg(cv, () => {
    const { c, w, h } = fit(cv);
    const rows = M.FACTS.nber, ex = M.FACTS.nberExpansionBefore;
    const L = 46, R = w - 10, T = 14, B = h - 26, n = rows.length, bw = (R - L) / n;
    const Y = v => B - (B - T) * v / 130;
    c.strokeStyle = C.grid; c.fillStyle = C.mute; c.textAlign = 'right';
    [0, 40, 80, 120].forEach(v => { c.beginPath(); c.moveTo(L, Y(v)); c.lineTo(R, Y(v)); c.stroke(); c.fillText(String(v), L - 6, Y(v)); });
    rows.forEach((r, i) => {
      const x = L + i * bw;
      c.fillStyle = C.cyan; c.fillRect(x + bw * 0.1, Y(ex[i]), bw * 0.38, B - Y(ex[i]));
      c.fillStyle = C.red; c.fillRect(x + bw * 0.52, Y(r[2]), bw * 0.38, B - Y(r[2]));
    });
    c.fillStyle = C.mute; c.textAlign = 'center'; c.textBaseline = 'top';
    rows.forEach((r, i) => { if (w > 600 || i % 2 === 0 || i === n - 1) c.fillText(r[0].slice(0, 4), L + (i + 0.5) * bw, B + 4); });
    c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(t('ch9.cv.y'), L, 6);
  });
}

applyLang();
requestAnimationFrame(loop);
window.__essayReady = true;
})();
