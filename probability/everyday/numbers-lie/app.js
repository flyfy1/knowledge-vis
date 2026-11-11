/* Wiring, drawing and i18n for "numbers-lie". All visible text comes from copy.*.js via t(); models from models.js (window.NL). */
(() => {
'use strict';
const M = window.NL, COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const C = { bg: '#0f1219', line: '#2c3342', grid: 'rgba(44,51,66,.7)', ink: '#ebe8e0', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', faint: '#3a4252' };
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));

/* ───── language ───── */
let memLang = null;
function storedLang() { try { return localStorage.getItem('knowledge-lang'); } catch (e) { return memLang; } }
function storeLang(l) { memLang = l; try { localStorage.setItem('knowledge-lang', l); } catch (e) { /* in-memory fallback */ } }
let lang = storedLang();
if (lang !== 'zh' && lang !== 'en') lang = /^zh/i.test(navigator.language || '') ? 'zh' : 'en';
if (lang === 'en' && !COPY.en) lang = 'zh'; // no English copy yet: stay readable
function t(key, vars) {
  let s = COPY[lang] && COPY[lang][key] != null ? COPY[lang][key] : (COPY.zh && COPY.zh[key] != null ? COPY.zh[key] : key);
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
  return s;
}
const loc = () => (lang === 'zh' ? 'zh-CN' : 'en-US');
const fmt = (x, d = 0) => Number(x).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const pct = (x, d = 1) => t('unit.pct', { v: fmt(x * 100, d) });
const signed = (x, d = 1) => (x > 0.05 ? '+' : x < -0.05 ? '−' : '') + fmt(Math.abs(x), d);
const updaters = [];

function applyLang() {
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-attr]').forEach(el => el.dataset.i18nAttr.split(';').forEach(pair => { const [a, k] = pair.split(':'); el.setAttribute(a.trim(), t(k.trim())); }));
  document.title = t('doc.title');
  const md = document.querySelector('meta[name=description]'); if (md) md.setAttribute('content', t('doc.desc'));
  document.querySelectorAll('#langToggle [data-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  updaters.forEach(f => f());
  sims.forEach(s => { s.dirty = true; });
}
document.querySelectorAll('#langToggle [data-lang]').forEach(b => b.addEventListener('click', () => {
  if (b.dataset.lang === lang) return; lang = b.dataset.lang; storeLang(lang); applyLang();
}));

/* ───── canvas + sims registry: a model steps only while on screen ───── */
function fit(cv) {
  const r = cv.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
  const W = Math.max(1, Math.round(r.width * d)), H = Math.max(1, Math.round(r.height * d));
  if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
  const c = cv.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0); c.font = FONT; c.textBaseline = 'middle';
  return { c, w: r.width, h: r.height };
}
const sims = [];
const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { const s = sims.find(x => x.cv === e.target); if (s) { s.vis = e.isIntersecting; s.dirty = true; if (s.vis && s.onShow) s.onShow(); } }), { rootMargin: '60px' }) : null;
function reg(cv, o) { o.cv = cv; o.vis = !io; o.dirty = true; sims.push(o); if (io) io.observe(cv); return o; }
window.addEventListener('resize', () => sims.forEach(s => { s.dirty = true; }));
const on = (id, ev, fn) => { const el = $(id); el.addEventListener(ev, fn); return el; };
function axisText(c, s, x, y, align = 'left', col = C.mute) { c.fillStyle = col; c.textAlign = align; c.fillText(s, x, y); }

/* ═════════ 1 regression to the mean ═════════ */
const heroGain = (() => { const s = M.regressSample({ luck: 0.5, q: 0.1, seed: 1 }); return s.B.m2 - s.B.m1; })();
(() => {
  const cv = $('#c1cv'), sl = $('#c1luck'), sq = $('#c1q'), ctrl = $('#c1ctrl');
  let retest = 0, S, u = reduce ? 1 : 0, shown = false;
  const resample = () => { S = M.regressSample({ luck: +sl.value / 100, q: +sq.value / 100, seed: 1, retest }); };
  const o = reg(cv, {
    onShow() { if (!shown) { shown = true; u = reduce ? 1 : 0; } },
    active: () => shown && u < 1,
    step(dt) { u = Math.min(1, u + dt / 1.4); },
    draw() {
      const { c, w, h } = fit(cv), T = 18, B = 34, x0 = Math.max(70, w * 0.2), x1 = w - Math.max(40, w * 0.12);
      const Y = v => T + (h - T - B) * (1 - (clamp(v, 25, 115) - 25) / 90);
      c.clearRect(0, 0, w, h);
      c.strokeStyle = C.grid; c.lineWidth = 1;
      [40, 60, 80, 100].forEach(v => { c.beginPath(); c.moveTo(x0 - 8, Y(v)); c.lineTo(x1 + 8, Y(v)); c.stroke(); axisText(c, String(v), x0 - 14, Y(v), 'right'); });
      c.strokeStyle = C.line; c.beginPath(); c.moveTo(x0, T - 6); c.lineTo(x0, h - B + 4); c.moveTo(x1, T - 6); c.lineTo(x1, h - B + 4); c.stroke();
      const e = u < 1 ? (1 - Math.pow(1 - u, 3)) : 1, xe = x0 + (x1 - x0) * e;
      const bottom = new Set(S.bottom), top = new Set(S.top), spared = new Set(ctrl.checked ? S.spared : []);
      const line = (i, col, a, lw) => { const y0 = Y(S.t1[i]), y1 = Y(S.t1[i] + (S.t2[i] - S.t1[i]) * e); c.globalAlpha = a; c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(x0, y0); c.lineTo(xe, y1); c.stroke(); };
      for (let i = 0; i < S.t1.length; i++) if (!bottom.has(i) && !top.has(i)) line(i, C.mute, 0.09, 1);
      S.top.forEach(i => line(i, C.gold, 0.4, 1));
      S.bottom.forEach(i => line(i, spared.has(i) ? C.green : C.cyan, 0.45, 1));
      c.globalAlpha = 1;
      const mark = (g, col) => { const y0 = Y(g.m1), y1 = Y(g.m1 + (g.m2 - g.m1) * e); c.strokeStyle = col; c.lineWidth = 3.5; c.beginPath(); c.moveTo(x0, y0); c.lineTo(xe, y1); c.stroke(); c.fillStyle = col; [[x0, y0], [xe, y1]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 6, 0, 6.283); c.fill(); }); };
      if (ctrl.checked) { mark(S.S, C.cyan); mark(S.U, C.green); } else mark(S.B, C.cyan);
      mark(S.T, C.gold);
      axisText(c, t('c1.ax.t1'), x0, h - 14, 'center', C.ink); axisText(c, t('c1.ax.t2'), x1, h - 14, 'center', C.ink);
    }
  });
  function upd() {
    resample();
    const k = S.B.n, luck = +sl.value;
    $('#c1luckO').textContent = t('c1.out.luck', { v: luck }); $('#c1qO').textContent = t('c1.out.q', { k });
    sl.setAttribute('aria-valuetext', t('c1.out.luck', { v: luck })); sq.setAttribute('aria-valuetext', t('c1.out.q', { k }));
    $('#c1b1').textContent = t('unit.pt', { v: fmt(S.B.m1, 1) }); $('#c1b2').textContent = t('unit.pt', { v: fmt(S.B.m2, 1) });
    $('#c1bd').textContent = t('unit.pt', { v: signed(S.B.m2 - S.B.m1) }); $('#c1td').textContent = t('unit.pt', { v: signed(S.T.m2 - S.T.m1) });
    $('#c1sdBox').hidden = $('#c1udBox').hidden = !ctrl.checked;
    $('#c1sd').textContent = t('unit.pt', { v: signed(S.S.m2 - S.S.m1) }); $('#c1ud').textContent = t('unit.pt', { v: signed(S.U.m2 - S.U.m1) });
    let say = luck === 0 ? t('c1.say.zero') : t('c1.say.main', { k, b: fmt(S.B.m2 - S.B.m1, 1), t: fmt(S.T.m1 - S.T.m2, 1), e: fmt(M.regressExpected(luck / 100, k / M.REG.n), 1) });
    if (ctrl.checked && luck > 0) say += ' ' + t('c1.say.control', { s: fmt(S.S.m2 - S.S.m1, 1), u: fmt(S.U.m2 - S.U.m1, 1), h: S.U.n });
    $('#c1say').innerHTML = say;
    o.dirty = true;
  }
  sl.addEventListener('input', upd); sq.addEventListener('input', upd); ctrl.addEventListener('change', upd);
  on('#c1retest', 'click', () => { retest++; shown = true; u = reduce ? 1 : 0; upd(); });
  updaters.push(upd);
})();
updaters.push(() => {
  $('#heroCase').innerHTML = t('hero.case', { gain: fmt(heroGain, 1) });
  $('#c10end').innerHTML = t('c10.end', { gain: fmt(heroGain, 1) });
});

/* ═════════ 2 small samples ═════════ */
(() => {
  const cv = $('#c2cv'), sp = $('#c2spread'), setup = M.schoolsSetup();
  let year = 0, Y, P = null, from = null, u = 1;
  const compute = () => { Y = M.schoolsYear(setup, +sp.value, year); P = year > 0 ? M.schoolsYear(setup, +sp.value, year - 1) : null; };
  const o = reg(cv, {
    active: () => u < 1,
    step(dt) { u = Math.min(1, u + dt / 0.9); },
    draw() {
      const { c, w, h } = fit(cv), L = 44, R = 14, T = 24, B = 34;
      const X = n => L + (w - L - R) * (Math.log10(n) - 1) / 2, Yv = v => T + (h - T - B) * (1 - (clamp(v, 50, 90) - 50) / 40);
      c.clearRect(0, 0, w, h);
      c.strokeStyle = C.grid; c.lineWidth = 1;
      [60, 70, 80].forEach(v => { c.beginPath(); c.moveTo(L, Yv(v)); c.lineTo(w - R, Yv(v)); c.stroke(); axisText(c, String(v), L - 8, Yv(v), 'right'); });
      [10, 100, 1000].forEach(n => axisText(c, fmt(n), X(n), h - 22, n === 10 ? 'left' : n === 1000 ? 'right' : 'center'));
      c.beginPath(); for (let l = 1; l <= 3.0001; l += 0.02) { const n = Math.pow(10, l); c.lineTo(X(n), Yv(70 + 2 * M.schoolSE(n))); }
      for (let l = 3; l >= 0.9999; l -= 0.02) { const n = Math.pow(10, l); c.lineTo(X(n), Yv(70 - 2 * M.schoolSE(n))); }
      c.closePath(); c.fillStyle = 'rgba(163,170,184,.12)'; c.fill();
      const e = u < 1 ? 1 - Math.pow(1 - u, 3) : 1, top = new Set(Y.top), bot = new Set(Y.bottom), prevTop = new Set(P ? P.top : []);
      const pos = i => from ? from[i] + (Y.avg[i] - from[i]) * e : Y.avg[i];
      const dot = (i, col, r) => { c.fillStyle = col; c.beginPath(); c.arc(X(setup.sizes[i]), Yv(pos(i)), r, 0, 6.283); c.fill(); };
      c.globalAlpha = 0.6; for (let i = 0; i < setup.sizes.length; i++) if (!top.has(i) && !bot.has(i)) dot(i, C.mute, 2.4);
      c.globalAlpha = 1; Y.top.forEach(i => dot(i, C.gold, 4.5)); Y.bottom.forEach(i => dot(i, C.cyan, 4.5));
      c.strokeStyle = C.gold; c.lineWidth = 1.5; prevTop.forEach(i => { c.beginPath(); c.arc(X(setup.sizes[i]), Yv(pos(i)), 8, 0, 6.283); c.stroke(); });
      axisText(c, t('c2.ax.y'), L + 6, T - 12); axisText(c, t('c2.ax.x'), w - R, h - 8, 'right');
    }
  });
  function upd(animate) {
    const prevAvg = Y ? Y.avg.slice() : null;
    compute();
    if (animate && prevAvg && !reduce) { from = prevAvg; u = 0; } else { from = null; u = 1; }
    const s = M.schoolsSummary(setup, Y), spread = +sp.value;
    $('#c2spreadO').textContent = t('c2.out.spread', { v: fmt(spread, 2) }); sp.setAttribute('aria-valuetext', t('c2.out.spread', { v: fmt(spread, 2) }));
    $('#c2top').textContent = t('unit.people', { v: fmt(s.topMedianSize, 1) }); $('#c2bot').textContent = t('unit.people', { v: fmt(s.bottomMedianSize, 1) });
    $('#c2all').textContent = t('unit.people', { v: fmt(s.allMedianSize, 0) });
    const prevRank = P ? M.mean(P.top.map(i => Y.rank[i])) : null;
    $('#c2prev').textContent = P ? fmt(prevRank, 0) : t('c2.r.prev0');
    let say = year === 0 ? t('c2.say.year0', { y: year + 1, tq: s.topSmallQuarter, bq: s.bottomSmallQuarter, q1: s.q1 })
      : t('c2.say.later', { y: year + 1, r: fmt(prevRank, 0) }) + ' ' + t(spread === 0 ? 'c2.say.flat' : spread < 1.5 ? 'c2.say.small' : 'c2.say.real');
    $('#c2say').innerHTML = say;
    $('#c2reset').disabled = year === 0;
    o.dirty = true;
  }
  sp.addEventListener('input', () => upd(false));
  on('#c2next', 'click', () => { year++; upd(true); });
  on('#c2reset', 'click', () => { year = 0; upd(false); });
  updaters.push(() => upd(false));
})();

/* ═════════ 3 survivorship ═════════ */
(() => {
  const cv = $('#c3cv'), bar = $('#c3bar'), dead = $('#c3dead'), F = M.FUND;
  let seed = 5, run, T = reduce ? F.years : 0, target = F.years, shown = false;
  const rerun = () => { run = M.fundsRun({ bar: +bar.value / 100, seed }); };
  const o = reg(cv, {
    onShow() { if (!shown) { shown = true; } },
    active: () => shown && T < target,
    step(dt) { const was = Math.floor(T); T = Math.min(target, T + dt * 1.6); if (Math.floor(T) !== was || T === target) upd(); },
    draw() {
      const { c, w, h } = fit(cv), L = 44, R = 14, Tp = 24, B = 34, lo = Math.log(0.25), hi = Math.log(8);
      const X = y => L + (w - L - R) * y / (F.years + F.extra), Yv = v => Tp + (h - Tp - B) * (1 - (clamp(v, lo, hi) - lo) / (hi - lo));
      c.clearRect(0, 0, w, h);
      c.strokeStyle = C.grid; c.lineWidth = 1;
      [0.5, 1, 2, 4].forEach(v => { c.beginPath(); c.moveTo(L, Yv(Math.log(v))); c.lineTo(w - R, Yv(Math.log(v))); c.stroke(); axisText(c, String(v), L - 8, Yv(Math.log(v)), 'right'); });
      [0, 5, 10, 15].forEach(y => axisText(c, String(y), X(y), h - 22, y === 0 ? 'left' : 'center'));
      c.strokeStyle = C.line; c.beginPath(); c.moveTo(X(F.years), Tp); c.lineTo(X(F.years), h - B); c.stroke();
      const tt = T, full = Math.floor(tt), frac = tt - full;
      const path = (p, end, col, a) => {
        c.globalAlpha = a; c.strokeStyle = col; c.beginPath(); c.moveTo(X(0), Yv(0));
        for (let y = 1; y <= Math.min(full, end); y++) c.lineTo(X(y), Yv(p[y]));
        if (end > full && full < p.length - 1 && frac > 0) c.lineTo(X(full + frac), Yv(p[full] + (p[full + 1] - p[full]) * frac));
        c.stroke();
      };
      c.lineWidth = 1;
      run.paths.forEach((p, i) => {
        const d = run.death[i];
        if (d && d <= tt) { if (dead.checked) path(p, d, C.red, 0.16); }
        else path(p, 99, C.gold, 0.085);
      });
      c.globalAlpha = 1;
      if (+bar.value > 0) {
        c.setLineDash([6, 5]); c.strokeStyle = C.red; c.lineWidth = 1.5; const yb = Yv(Math.log(+bar.value / 100));
        c.beginPath(); c.moveTo(X(0), yb); c.lineTo(X(F.years), yb); c.stroke(); c.setLineDash([]);
        // label below the line, or above it when a low threshold would push it into the year ticks
        axisText(c, t('c3.ax.bar'), X(F.years) - 6, yb + 12 > h - B - 6 ? yb - 12 : yb + 12, 'right', C.red);
      }
      // brochure average (survivors at the current year) vs. what every fund-year really earned
      const cur = Math.max(1, Math.min(full, F.years + F.extra));
      if (tt >= 1) {
        const alive = run.paths.map((p, i) => i).filter(i => !run.death[i] || run.death[i] > Math.min(cur, F.years));
        c.strokeStyle = C.gold; c.lineWidth = 3; c.beginPath(); c.moveTo(X(0), Yv(0));
        for (let y = 1; y <= cur; y++) c.lineTo(X(y), Yv(M.mean(alive.map(i => run.paths[i][y])))); c.stroke();
        c.strokeStyle = C.cyan; c.lineWidth = 2.5; c.setLineDash([7, 5]); c.beginPath(); c.moveTo(X(0), Yv(0)); c.lineTo(X(cur), Yv(F.mu * cur)); c.stroke(); c.setLineDash([]);
      }
      axisText(c, t('c3.ax.y'), L + 6, Tp - 12); axisText(c, t('c3.ax.x'), w - R, h - 8, 'right');
    }
  });
  function upd() {
    const b = +bar.value, yr = Math.floor(T);
    $('#c3barO').textContent = b === 0 ? t('c3.out.never') : t('c3.out.bar', { v: b }); bar.setAttribute('aria-valuetext', $('#c3barO').textContent);
    const s = yr >= 1 ? M.fundsAt(run, yr) : null;
    $('#c3alive').textContent = s ? fmt(s.alive) : fmt(F.n);
    $('#c3surv').textContent = s ? pct(s.survivorAnnual) : t('c3.r.na');
    $('#c3all').textContent = s ? pct(s.allAnnual) : t('c3.r.na');
    $('#c3after').textContent = s && s.afterAnnual != null ? pct(s.afterAnnual) : t('c3.r.na');
    let say;
    if (yr < F.years || (yr > F.years && yr < F.years + F.extra)) say = t('c3.say.run', { y: yr, a: fmt(s ? s.alive : F.n) });
    else if (yr === F.years) say = b === 0 ? t('c3.say.none', { s: pct(s.survivorAnnual) }) : t('c3.say.ten', { a: fmt(s.alive), s: pct(s.survivorAnnual), all: pct(s.allAnnual) });
    else say = t('c3.say.after', { x: pct(s.afterAnnual) });
    $('#c3say').innerHTML = say;
    $('#c3more').disabled = !(T >= F.years && target < F.years + F.extra);
    o.dirty = true;
  }
  bar.addEventListener('input', () => { rerun(); upd(); });
  dead.addEventListener('change', () => { o.dirty = true; });
  on('#c3rerun', 'click', () => { seed++; rerun(); target = F.years; T = reduce ? F.years : 0; shown = true; upd(); });
  on('#c3more', 'click', () => { target = F.years + F.extra; if (reduce) T = target; upd(); });
  rerun(); updaters.push(upd);
})();

/* ═════════ 4 many comparisons ═════════ */
(() => {
  const cv = $('#c4cv'), ks = $('#c4k'), bonf = $('#c4bonf');
  let roundNo = 0, S, rep = null, minPs = [], pending = 0, u = 1;
  const seedOf = r => 500 + r;
  const thr = () => (bonf.checked ? 0.05 / +ks.value : 0.05);
  // first round shown: the first seed whose round has a "significant" study at k = 20, so the default shows the effect
  while (!M.studies(20, seedOf(roundNo)).p.some(p => p < 0.05)) roundNo++;
  const firstRound = roundNo;
  function doRound(record = true) { S = M.studies(+ks.value, seedOf(roundNo)); rep = null; if (record) minPs.push(Math.min(...S.p)); }
  const o = reg(cv, {
    active: () => pending > 0 || u < 1,
    step(dt) {
      if (pending > 0) { const n = Math.min(pending, Math.max(1, Math.round(dt * 60))); for (let i = 0; i < n; i++) { roundNo++; doRound(); } pending -= n; upd(); }
      else u = Math.min(1, u + dt / 0.5);
    },
    draw() {
      const { c, w, h } = fit(cv), L = 52, R = 14, T = 24, B = 34, k = S.p.length, top = 4;
      const X = i => L + (w - L - R) * (i + 0.5) / k, Yv = q => T + (h - T - B) * (1 - clamp(-Math.log10(q), 0, top) / top);
      c.clearRect(0, 0, w, h);
      c.strokeStyle = C.grid; c.lineWidth = 1;
      [1, 0.1, 0.01, 0.001].forEach(q => { c.beginPath(); c.moveTo(L, Yv(q)); c.lineTo(w - R, Yv(q)); c.stroke(); axisText(c, String(q), L - 8, Yv(q), 'right'); });
      const th = thr(), yt = Yv(th); c.setLineDash([6, 5]); c.strokeStyle = C.gold; c.lineWidth = 1.5; c.beginPath(); c.moveTo(L, yt); c.lineTo(w - R, yt); c.stroke(); c.setLineDash([]);
      const e = u < 1 ? 1 - Math.pow(1 - u, 3) : 1, r = Math.max(2.5, Math.min(6, (w - L - R) / k / 3));
      S.p.forEach((p, i) => {
        const y = Yv(1) + (Yv(p) - Yv(1)) * e, sig = p < th;
        c.strokeStyle = sig ? C.gold : C.faint; c.lineWidth = 1.5; c.beginPath(); c.moveTo(X(i), Yv(1)); c.lineTo(X(i), y); c.stroke();
        c.fillStyle = sig ? C.gold : C.mute; c.beginPath(); c.arc(X(i), y, sig ? r + 1.5 : r, 0, 6.283); c.fill();
      });
      if (rep) rep.forEach(({ i, p2 }) => {
        const y1 = Yv(p2); c.strokeStyle = C.cyan; c.lineWidth = 2; c.beginPath(); c.arc(X(i), y1, r + 2, 0, 6.283); c.stroke();
        c.setLineDash([3, 3]); c.beginPath(); c.moveTo(X(i), Yv(S.p[i]) + r + 2); c.lineTo(X(i), y1 - r - 2); c.stroke(); c.setLineDash([]);
      });
      axisText(c, t('c4.ax.y'), L - 44, T - 12); axisText(c, t('c4.ax.x'), w - R, h - 10, 'right');
    }
  });
  function upd() {
    const k = +ks.value, th = thr(), sig = S.p.filter(p => p < th).length;
    $('#c4kO').textContent = t('c4.out.k', { v: k }); ks.setAttribute('aria-valuetext', t('c4.out.k', { v: k }));
    $('#c4sig').textContent = fmt(sig);
    const share = minPs.length ? minPs.filter(p => p < th).length / minPs.length : 0;
    $('#c4share').textContent = pct(share, 0); $('#c4shareN').textContent = t('c4.r.shareN', { n: fmt(minPs.length) });
    $('#c4theory').textContent = pct(M.familyRate(k, th), 0);
    let say;
    if (rep) say = t('c4.say.rep', { n: rep.length, m: rep.filter(r => r.p2 < th).length });
    else if (minPs.length >= 30) say = t('c4.say.many', { n: fmt(minPs.length), s: pct(share, 0), t: pct(M.familyRate(k, th), 0) });
    else say = sig ? t('c4.say.some', { n: sig }) : t('c4.say.none');
    $('#c4say').innerHTML = say;
    $('#c4rep').disabled = !sig || !!rep || pending > 0;
    o.dirty = true;
  }
  ks.addEventListener('input', () => { minPs = []; roundNo = firstRound; doRound(); u = 1; upd(); });
  bonf.addEventListener('change', () => { rep = null; upd(); });
  on('#c4round', 'click', () => { roundNo++; doRound(); u = reduce ? 1 : 0; upd(); });
  on('#c4many', 'click', () => {
    if (reduce) { for (let i = 0; i < 200; i++) { roundNo++; doRound(); } upd(); } else { pending += 200; upd(); }
  });
  on('#c4rep', 'click', () => {
    const th = thr(), R = M.rng(seedOf(roundNo) * 13 + 77);
    rep = []; S.p.forEach((p, i) => { const z = M.normal(R); if (p < th) rep.push({ i, p2: M.pTwo(z) }); }); upd();
  });
  doRound(); updaters.push(upd);
})();

/* ═════════ 5 Simpson's paradox ═════════ */
(() => {
  const cv = $('#c5cv'), sa = $('#c5a'), sb = $('#c5b'), SP = M.SIMP;
  let aL = SP.aLarge, bL = SP.bLarge;
  const o = reg(cv, { draw() {
    const { c, w, h } = fit(cv), L = 46, R = 10, T = 28, B = 30, gap = Math.max(18, w * 0.06), half = (w - L - R - gap) / 2, r = M.simpson(aL, bL);
    const Yv = p => T + (h - T - B) * (1 - p);
    c.clearRect(0, 0, w, h);
    c.strokeStyle = C.grid; c.lineWidth = 1;
    [0, 0.5, 1].forEach(p => { c.beginPath(); c.moveTo(L, Yv(p)); c.lineTo(w - R, Yv(p)); c.stroke(); axisText(c, fmt(p * 100) + '%', L - 6, Yv(p), 'right'); });
    const side = (x0, rates, s, label, col) => {
      const ws = half * s.ns / SP.n, wl = half * s.nl / SP.n;
      [[x0, ws, rates.small, 'c5.ax.small'], [x0 + ws, wl, rates.large, 'c5.ax.large']].forEach(([x, bw, p, k]) => {
        if (bw < 0.5) return;
        c.fillStyle = 'rgba(163,170,184,.10)'; c.fillRect(x + 1, Yv(1), bw - 2, Yv(0) - Yv(1));
        c.fillStyle = col; c.globalAlpha = 0.75; c.fillRect(x + 1, Yv(p), bw - 2, Yv(0) - Yv(p)); c.globalAlpha = 1;
        const lab = t(k); if (c.measureText(lab).width + 8 < bw) axisText(c, lab, x + bw / 2, h - 14, 'center');
      });
      c.strokeStyle = C.ink; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x0, Yv(s.rate)); c.lineTo(x0 + half, Yv(s.rate)); c.stroke();
      // on narrow canvases the full name ("B: minimally invasive") is wider than the column: fall back to the letter
      let name = t(label); if (c.measureText(name).width > half - 4) name = name.split(/[:\s]/)[0];
      axisText(c, name, x0 + half / 2, T - 14, 'center', col);
    };
    side(L, SP.A, r.A, 'c5.ax.A', C.cyan); side(L + half + gap, SP.B, r.B, 'c5.ax.B', C.gold);
  } });
  function upd() {
    const r = M.simpson(aL, bL), cell = (p, n) => t('c5.t.cell', { p: fmt(p * 100, 0), n: fmt(n, 0) });
    $('#c5aO').textContent = t('c5.out.share', { v: fmt(aL * 100, 0) }); $('#c5bO').textContent = t('c5.out.share', { v: fmt(bL * 100, 0) });
    sa.setAttribute('aria-valuetext', $('#c5aO').textContent); sb.setAttribute('aria-valuetext', $('#c5bO').textContent);
    $('#c5As').innerHTML = cell(SP.A.small, r.A.ns); $('#c5Al').innerHTML = cell(SP.A.large, r.A.nl); $('#c5At').textContent = t('unit.pct', { v: fmt(r.A.rate * 100, 1) });
    $('#c5Bs').innerHTML = cell(SP.B.small, r.B.ns); $('#c5Bl').innerHTML = cell(SP.B.large, r.B.nl); $('#c5Bt').textContent = t('unit.pct', { v: fmt(r.B.rate * 100, 1) });
    $('#c5At').classList.toggle('win', r.A.rate > r.B.rate); $('#c5Bt').classList.toggle('win', r.B.rate > r.A.rate);
    $('#c5say').innerHTML = Math.abs(aL - bL) < 0.005 ? t('c5.say.rand') : r.flipped ? t('c5.say.flip', { x: t('unit.pct', { v: fmt(M.simpsonFlipAt(bL) * 100, 0) }) }) : t('c5.say.ok');
    o.dirty = true;
  }
  sa.addEventListener('input', () => { aL = +sa.value / 100; upd(); }); sb.addEventListener('input', () => { bL = +sb.value / 100; upd(); });
  on('#c5rand', 'click', () => { aL = bL = (263 + 80) / 700; sa.value = sb.value = Math.round(aL * 100); upd(); });
  on('#c5real', 'click', () => { aL = SP.aLarge; bL = SP.bLarge; sa.value = Math.round(aL * 100); sb.value = Math.round(bL * 100); upd(); });
  updaters.push(upd);
})();

/* ═════════ 6 base rates ═════════ */
const PREV = [0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.3, 0.5];
(() => {
  const cv = $('#c6cv'), sp = $('#c6prev'), sf = $('#c6fpr'), SENS = 0.9;
  const o = reg(cv, { draw() {
    const { c, w, h } = fit(cv), cols = w / h > 2 ? 200 : 100, rows = 10000 / cols, cell = Math.min(w / cols, h / rows), ox = (w - cell * cols) / 2, oy = (h - cell * rows) / 2;
    const s = M.screen(PREV[+sp.value], SENS, +sf.value / 100), tp = Math.round(s.tp), fp = Math.round(s.fp), fn = Math.round(s.sick) - tp;
    c.clearRect(0, 0, w, h);
    const g = cell >= 3 ? 0.6 : 0;
    const paint = (from, to, col) => { c.fillStyle = col; for (let i = from; i < to; i++) { const x = i % cols, y = (i / cols) | 0; c.fillRect(ox + x * cell, oy + y * cell, cell - g, cell - g); } };
    paint(0, 10000, '#262d3c'); paint(0, tp, C.gold); paint(tp, tp + fp, C.red); paint(tp + fp, tp + fp + fn, '#7a6430');
  } });
  function upd() {
    const prev = PREV[+sp.value], fpr = +sf.value / 100, s = M.screen(prev, SENS, fpr);
    $('#c6prevO').textContent = t('c6.out.prev', { v: fmt(prev * 100, prev < 0.01 ? 1 : 0) }); $('#c6fprO').textContent = t('c6.out.fpr', { v: fmt(fpr * 100) });
    sp.setAttribute('aria-valuetext', $('#c6prevO').textContent); sf.setAttribute('aria-valuetext', $('#c6fprO').textContent);
    // expected counts; shown as whole people (the grid paints rounded counts too)
    $('#c6tp').textContent = fmt(Math.round(s.tp)); $('#c6fp').textContent = fmt(Math.round(s.fp));
    $('#c6ppv').textContent = pct(s.ppv); $('#c6sens').textContent = pct(s.sens, 0);
    $('#c6say').innerHTML = t('c6.say', { pos: fmt(Math.round(s.tp) + Math.round(s.fp)), tp: fmt(Math.round(s.tp)), ppv: pct(s.ppv) });
    o.dirty = true;
  }
  sp.addEventListener('input', upd); sf.addEventListener('input', upd);
  on('#c6all', 'click', () => { sp.value = 3; sf.value = 5; upd(); });
  on('#c6clinic', 'click', () => { sp.value = 8; sf.value = 5; upd(); });
  updaters.push(upd);
})();

/* ═════════ 7 relative vs absolute risk ═════════ */
const BASES = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000];
(() => {
  const cv = $('#c7cv'), sb = $('#c7base'), sr = $('#c7rr');
  const perm = (() => { const R = M.rng(77), a = Array.from({ length: 10000 }, (v, i) => i); for (let i = a.length - 1; i > 0; i--) { const j = (R() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; })();
  const o = reg(cv, { draw() {
    const { c, w, h } = fit(cv), top = 24, gap = Math.max(14, w * 0.04), stacked = h > w;
    const size = stacked ? Math.min(w - 8, (h - 2 * top - 8) / 2) : Math.min((w - gap) / 2, h - top - 4), cell = size / 100;
    const r = M.risk(BASES[+sb.value], +sr.value), nu = Math.round(r.base), ne = Math.round(r.exposed);
    const x0 = stacked ? (w - size) / 2 : (w - 2 * size - gap) / 2, x1 = stacked ? x0 : x0 + size + gap, y0 = top, y1 = stacked ? top * 2 + size + 4 : top;
    c.clearRect(0, 0, w, h);
    [[x0, y0], [x1, y1]].forEach(([x, y]) => { c.fillStyle = '#1b2130'; c.fillRect(x, y, size, size); });
    if (cell >= 2.5) { c.fillStyle = '#232a39'; for (let i = 0; i < 100; i += 2) { c.fillRect(x0, y0 + i * cell, size, cell); c.fillRect(x1, y1 + i * cell, size, cell); } }
    const rad = Math.max(2.2, cell * 0.55);
    const at = (x, y, i) => { const k = perm[i]; return [x + (k % 100 + 0.5) * cell, y + (((k / 100) | 0) + 0.5) * cell]; };
    const dot = (x, y, i, col) => { const [cx, cy] = at(x, y, i); c.fillStyle = col; c.beginPath(); c.arc(cx, cy, rad, 0, 6.283); c.fill(); };
    const halo = (x, y, i, col) => { if (nu + ne > 60) return; const [cx, cy] = at(x, y, i); c.strokeStyle = col; c.globalAlpha = 0.5; c.lineWidth = 1.2; c.beginPath(); c.arc(cx, cy, rad + 5, 0, 6.283); c.stroke(); c.globalAlpha = 1; };
    for (let i = 0; i < nu; i++) { halo(x0, y0, i, C.cyan); dot(x0, y0, i, C.cyan); }
    for (let i = 0; i < ne; i++) { const col = i < nu ? C.cyan : C.gold; halo(x1, y1, i, col); dot(x1, y1, i, col); }
    axisText(c, t('c7.ax.u'), x0, y0 - 13, 'left', C.ink); axisText(c, t('c7.ax.e'), x1, y1 - 13, 'left', C.ink);
  } });
  function upd() {
    const b = BASES[+sb.value], rr = +sr.value, r = M.risk(b, rr), d1 = v => fmt(v, v % 1 ? 1 : 0);
    $('#c7baseO').textContent = t('c7.out.base', { v: fmt(b) }); $('#c7rrO').textContent = t('c7.out.rr', { v: fmt(rr, 1) });
    sb.setAttribute('aria-valuetext', $('#c7baseO').textContent); sr.setAttribute('aria-valuetext', $('#c7rrO').textContent);
    $('#c7u').textContent = d1(r.base); $('#c7e').textContent = d1(r.exposed);
    $('#c7d').textContent = (r.diff > 0 ? '+' : r.diff < 0 ? '−' : '') + d1(Math.abs(r.diff));
    $('#c7rel').textContent = (r.relPct > 0 ? '+' : r.relPct < 0 ? '−' : '') + t('unit.pct', { v: fmt(Math.abs(r.relPct), 0) });
    $('#c7nn').textContent = isFinite(r.nn) ? fmt(r.nn, r.nn < 10 ? 1 : 0) : t('c7.r.nnInf');
    const rel = t('unit.pct', { v: fmt(Math.abs(r.relPct), 0) });
    $('#c7say').innerHTML = Math.abs(rr - 1) < 1e-9 ? t('c7.say.same') : rr > 1 ? t('c7.say.up', { rel, d: d1(r.diff) }) : t('c7.say.down', { rel, d: d1(-r.diff) });
    o.dirty = true;
  }
  sb.addEventListener('input', upd); sr.addEventListener('input', upd);
  on('#c7rare', 'click', () => { sb.value = 0; sr.value = 2; upd(); });
  on('#c7common', 'click', () => { sb.value = 9; sr.value = 2; upd(); });
  updaters.push(upd);
})();

/* ═════════ 8 mean vs median ═════════ */
(() => {
  const cv = $('#c8cv'), ss = $('#c8s'), rb = $('#c8rich'), RICH = 5e6;
  let rich = false, S;
  const o = reg(cv, { draw() {
    const { c, w, h } = fit(cv), L = 14, R = 14, T = 14, B = 30, max = 30000, nb = 60, bw = max / nb;
    const counts = new Array(nb + 1).fill(0); S.x.forEach(v => { counts[Math.min(nb, Math.floor(v / bw))]++; });
    const cmax = Math.max(...counts), plotW = w - L - R, barW = plotW / (nb + 3), X = v => L + barW * v / bw, Yv = n => T + (h - T - B) * (1 - n / cmax);
    c.clearRect(0, 0, w, h);
    for (let i = 0; i < nb; i++) { c.fillStyle = 'rgba(163,170,184,.55)'; c.fillRect(X(i * bw) + 0.5, Yv(counts[i]), Math.max(1, barW - 1), Yv(0) - Yv(counts[i])); }
    const xo = L + barW * (nb + 1.5); c.fillStyle = 'rgba(240,122,109,.75)'; c.fillRect(xo, Yv(counts[nb]), barW * 1.5, Yv(0) - Yv(counts[nb]));
    c.strokeStyle = C.line; c.beginPath(); c.moveTo(L, Yv(0)); c.lineTo(w - R, Yv(0)); c.stroke();
    [0, 10000, 20000].forEach(v => axisText(c, fmt(v), X(v), h - 14, v ? 'center' : 'left'));
    axisText(c, t('c8.ax.more'), xo + barW * 0.75, h - 14, 'right');
    const vline = (v, col) => { const x = Math.min(X(v), L + barW * nb); c.strokeStyle = col; c.lineWidth = 3; c.beginPath(); c.moveTo(x, T); c.lineTo(x, Yv(0)); c.stroke(); };
    vline(S.median, C.cyan); vline(S.mean, C.gold);
  } });
  function upd() {
    const sg = +ss.value; S = M.tailSample(sg, { rich: rich ? RICH : 0 });
    $('#c8sO').textContent = t('c8.out.s', { v: fmt(sg, 2) }); ss.setAttribute('aria-valuetext', $('#c8sO').textContent);
    $('#c8med').textContent = fmt(S.median); $('#c8mean').textContent = fmt(S.mean);
    $('#c8ratio').textContent = t('c8.r.ratioV', { v: fmt(S.mean / S.median, 2) }); $('#c8below').textContent = pct(S.belowMean, 0);
    rb.textContent = t(rich ? 'c8.ctl.richOff' : 'c8.ctl.rich'); rb.setAttribute('aria-pressed', String(rich));
    $('#c8say').innerHTML = rich ? t('c8.say.rich', { m: fmt(S.mean), b: pct(S.belowMean, 0) }) : t('c8.say', { r: fmt(S.mean / S.median, 2), b: pct(S.belowMean, 0) });
    o.dirty = true;
  }
  ss.addEventListener('input', upd);
  rb.addEventListener('click', () => { rich = !rich; upd(); });
  updaters.push(upd);
})();

/* ═════════ 9 Goodhart ═════════ */
(() => {
  const cv = $('#c9cv'), se = $('#c9ease'), sp = $('#c9p'), play = $('#c9play'), PERIOD = 0.12, MAXR = 400;
  let s = M.ghCreate(9), running = !reduce, acc = 0;
  const opt = () => ({ ease: +se.value, pressure: +sp.value / 100 });
  const o = reg(cv, {
    active: () => running,
    step(dt) { acc += dt; let n = 0; while (acc >= PERIOD) { acc -= PERIOD; M.ghStep(s, opt()); n++; } if (n) upd(); if (s.round >= MAXR) { running = false; upd(); } },
    draw() {
      const { c, w, h } = fit(cv), L = 44, R = 14, T = 22, B = 30, gap = 34, h2 = Math.round((h - T - B - gap) * 0.36), h1 = h - T - B - gap - h2;
      const H = s.hist, n = Math.max(100, H.length), X = i => L + (w - L - R) * i / n;
      const ymax = Math.max(2, ...H.map(r => r.m)) * 1.08, Y1 = v => T + h1 * (1 - v / ymax), y2t = T + h1 + gap, Y2 = r => y2t + h2 * (1 - (clamp(r, -0.2, 1) + 0.2) / 1.2);
      c.clearRect(0, 0, w, h);
      c.strokeStyle = C.grid; c.lineWidth = 1;
      [0, 1, 2].forEach(v => { if (v > ymax) return; c.beginPath(); c.moveTo(L, Y1(v)); c.lineTo(w - R, Y1(v)); c.stroke(); axisText(c, String(v), L - 8, Y1(v), 'right'); });
      [0, 0.5, 1].forEach(v => { c.beginPath(); c.moveTo(L, Y2(v)); c.lineTo(w - R, Y2(v)); c.stroke(); axisText(c, String(v), L - 8, Y2(v), 'right'); });
      const line = (f, Y, col, lw = 2.2, a = 1) => { if (H.length < 2) return; c.globalAlpha = a; c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); H.forEach((r, i) => c[i ? 'lineTo' : 'moveTo'](X(i), Y(f(r, i)))); c.stroke(); c.globalAlpha = 1; };
      line(r => r.m, Y1, C.gold); line(r => r.q, Y1, C.cyan);
      // the per-round correlation is noisy (200 people); draw it thin and its 10-round running mean thick
      line(r => r.r, Y2, C.violet, 1, 0.45); line((r, i) => M.ghWindow(H, Math.max(0, i - 9), i + 1, 'r'), Y2, C.violet, 2.4);
      axisText(c, t('c9.ax.top'), L + 6, T - 12); axisText(c, t('c9.ax.bot'), L + 6, y2t - 12);
      axisText(c, '0', X(0), h - 14, 'left'); axisText(c, String(n), X(n), h - 14, 'right');
      axisText(c, t('c9.ax.x'), (X(0) + X(n)) / 2, h - 14, 'center');
    }
  });
  function upd() {
    // readouts compare the mean of the last 10 rounds with the first 10 (the prose does the same); single rounds are noisy
    const H = s.hist, n = H.length, w = Math.min(10, n), W = k => M.ghWindow(H, n - w, n, k), F = k => M.ghWindow(H, 0, w, k);
    const last = n ? { m: W('m'), q: W('q'), r: W('r'), overlap: H[n - 1].overlap } : null, first = n ? { m: F('m'), q: F('q') } : null;
    $('#c9easeO').textContent = t('c9.out.ease', { v: fmt(+se.value, 1) }); $('#c9pO').textContent = t('c9.out.p', { v: sp.value });
    se.setAttribute('aria-valuetext', $('#c9easeO').textContent); sp.setAttribute('aria-valuetext', $('#c9pO').textContent);
    $('#c9round').textContent = fmt(s.round);
    $('#c9m').textContent = last ? fmt(last.m / first.m * 100) : '100'; $('#c9q').textContent = last ? fmt(last.q / first.q * 100) : '100';
    $('#c9r').textContent = last ? fmt(last.r, 2) : '—'; $('#c9top').textContent = last ? t('c9.r.topV', { v: last.overlap }) : '—';
    play.textContent = t(running ? 'c9.ctl.pause' : 'c9.ctl.play'); play.setAttribute('aria-pressed', String(running));
    let say;
    if (+sp.value === 0) say = t('c9.say.none');
    else if (+se.value <= 0.6) say = t('c9.say.honest');
    else if (!last || (last.m / first.m < 1.05 && last.q / first.q > 0.95)) say = t('c9.say.early', { r: fmt(s.round) });
    else say = t('c9.say.drift', { m: fmt(last.m / first.m, 2) + '×', q: fmt(last.q / first.q, 2) + '×' });
    $('#c9say').innerHTML = say;
    o.dirty = true;
  }
  se.addEventListener('input', upd); sp.addEventListener('input', upd);
  play.addEventListener('click', () => { running = !running; if (s.round >= MAXR) { s = M.ghCreate(9); } upd(); });
  on('#c9step', 'click', () => { for (let i = 0; i < 20 && s.round < MAXR; i++) M.ghStep(s, opt()); upd(); });
  on('#c9reset', 'click', () => { s = M.ghCreate(9); acc = 0; running = !reduce; upd(); });
  M.ghStep(s, opt()); updaters.push(upd);
})();

/* ───── loop ───── */
let last = performance.now();
function tick(now) {
  const dt = Math.min((now - last) / 1000, 0.05); last = now;
  for (const s of sims) {
    if (!s.vis) continue;
    if (s.active && s.active()) { s.step(dt); s.draw(); s.dirty = false; }
    else if (s.dirty) { s.draw(); s.dirty = false; }
  }
  requestAnimationFrame(tick);
}
applyLang();
requestAnimationFrame(tick);
window.__essay = { t, get lang() { return lang; }, sims };
window.__ready = true;
})();
