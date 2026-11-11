/* Where does a mortgage payment go: wiring, drawing, i18n and on-screen gating.
   All visible text comes from copy.*.js; number formats switch by language here (Chinese counts large sums in
   万 = 10,000 using the copy template "u.wan"; other languages print full amounts with digit grouping, and chart
   axes in thousands). */
(() => {
'use strict';
const M = window.MortgageModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const C = { bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a7adbb', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb' };
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
  const L = effLang();
  let s = (COPY[L] && COPY[L][key] != null) ? COPY[L][key] : (COPY.zh && COPY.zh[key] != null ? COPY.zh[key] : key);
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => vars[k] != null ? vars[k] : m);
  return s;
}

/* ───────── number formats ───────── */
const zh = () => effLang() === 'zh';
// plain number: grouping in English, none in Chinese (Chinese sums ≥ 10,000 go through 万 instead)
function num(x, d = 0) {
  if (!isFinite(x)) return '—';
  let v = Math.abs(x) < 0.5 * Math.pow(10, -d) ? 0 : x;
  const s = Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d, useGrouping: !zh() });
  return (v < 0 ? '−' : '') + s;
}
// money: zh → "71.9 万元" (wd decimals, trailing zeros dropped) from 10,000 up, else "4774 元"; en → full amount
function money(x, wd = 1, small = 0, from = 1e4) {
  if (!isFinite(x)) return '—';
  // the sign goes in front of the whole amount ("−¥29,825", "−3 万元"), never between the currency sign and the digits
  if (x < 0 && Math.abs(+x.toFixed(small)) > 0) return '−' + money(-x, wd, small, from);
  if (zh() && Math.abs(+x.toFixed(small)) >= from) {
    let s = num(x / 1e4, wd); if (wd > 0) s = s.replace(/\.?0+$/, '');
    return t('u.wan', { v: s });
  }
  return t('u.yuan', { v: num(x, small) });
}
// a monthly amount: whole yuan up to 100,000 ("12133 元" rather than "1.2 万元")
const mon = (x, small = 0) => money(x, 1, small, 1e5);
const pct = (x, d = 2) => t('u.pct', { v: num(x * 100, d) });
// a rate as set on a slider: no trailing zeros (4%, 4.25%)
const rz = (x, d = 2) => num(x * 100, d).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
const prz = (x, d = 2) => t('u.pct', { v: rz(x, d) });
const pnum = (x, d = 2) => num(x * 100, d); // percentage number without the sign, for sentences that carry their own %
// years and months, with singular forms from copy ("1 year", "1 month") so English never reads "1 years"
function dur(m) {
  const y = Math.floor(m / 12), r = m % 12;
  const Y = t(y === 1 ? 'u.dur.y1' : 'u.dur.y', { y: num(y) }), Mo = t(r === 1 ? 'u.dur.m1' : 'u.dur.m', { m: num(r) });
  if (y === 0) return Mo;
  if (r === 0) return Y;
  return t('u.dur.ym', { Y, M: Mo });
}
const AXU = () => (zh() ? 1e4 : 1e3); // chart unit for money axes: 万 in Chinese, thousands otherwise

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

/* ───────── canvas + registry (draw only while on screen) ───────── */
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
const radioVal = name => radios(name).find(r => r.checked).value;
const put = (sel, s) => { const e = $(sel); if (e.textContent !== s) e.textContent = s; };
const putHTML = (sel, s) => { const e = $(sel); if (e.__h !== s) { e.innerHTML = s; e.__h = s; } };

/* plot helpers */
function frame(w, h, m, x0, x1, y0, y1) {
  const L = m[3], R = w - m[1], T = m[0], B = h - m[2];
  return { L, R, T, B, x0, x1, y0, y1, X: x => L + (R - L) * (x - x0) / (x1 - x0), Y: y => B - (B - T) * (y - y0) / (y1 - y0) };
}
function axes(c, f, xLab, yLab) {
  c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.T); c.lineTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
  c.fillStyle = C.mute; c.font = FONT;
  if (yLab) { c.textAlign = 'left'; c.fillText(yLab, f.L + 6, f.T - 12); }
  if (xLab) { c.textAlign = 'right'; c.fillText(xLab, f.R, f.B + 26); }
}
function xTicks(c, f, vals, fmtv, skipLast) {
  c.fillStyle = C.mute; c.textAlign = 'center';
  vals.forEach((v, i) => { if (skipLast && i === vals.length - 1) return; const x = f.X(v); c.fillText(fmtv(v), x, f.B + 11); c.strokeStyle = C.line; c.beginPath(); c.moveTo(x, f.B); c.lineTo(x, f.B + 3); c.stroke(); });
}
function yTicks(c, f, vals, fmtv) {
  c.fillStyle = C.mute; c.textAlign = 'right';
  vals.forEach(v => { const y = f.Y(v); c.fillText(fmtv(v), f.L - 6, y); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, y); c.lineTo(f.R, y); c.stroke(); });
}
function niceStep(range, target = 4) {
  const raw = range / target, p = Math.pow(10, Math.floor(Math.log10(raw))), n = raw / p;
  return (n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10) * p;
}
function ticks(lo, hi, target = 4) { const s = niceStep(hi - lo, target), out = []; for (let v = Math.ceil(lo / s - 1e-9) * s; v <= hi + 1e-9; v += s) out.push(+v.toFixed(10)); return { vals: out, step: s }; }
const niceTop = (x, target = 4) => { const s = niceStep(x, target); return Math.ceil(x / s - 1e-9) * s; };
function path(c, pts, X, Y, col, lw = 2.2, dash) { c.strokeStyle = col; c.lineWidth = lw; c.lineJoin = 'round'; if (dash) c.setLineDash(dash); c.beginPath(); pts.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](X(p[0]), Y(p[1]))); c.stroke(); c.setLineDash([]); }
function vline(c, f, x, col, dash = [5, 4], lw = 1.4) { c.strokeStyle = col; c.lineWidth = lw; c.setLineDash(dash); c.beginPath(); c.moveTo(f.X(x), f.T); c.lineTo(f.X(x), f.B); c.stroke(); c.setLineDash([]); }
function hline(c, f, y, col, dash = [5, 4], lw = 1.2) { c.strokeStyle = col; c.lineWidth = lw; c.setLineDash(dash); c.beginPath(); c.moveTo(f.L, f.Y(y)); c.lineTo(f.R, f.Y(y)); c.stroke(); c.setLineDash([]); }
function dot(c, x, y, col, r = 4.5) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); }
// clip a series to the plotted y-range so lines leaving the chart stop at its edge
// a series that leaves the top of the chart stops at the edge (no flat line drawn along the frame)
function cutY(pts, hi) {
  const out = [];
  for (let k = 0; k < pts.length; k++) {
    const p = pts[k];
    if (p[1] <= hi) { out.push(p); continue; }
    if (k) { const q = pts[k - 1], s = (hi - q[1]) / (p[1] - q[1]); out.push([q[0] + s * (p[0] - q[0]), hi]); }
    break;
  }
  return out;
}
const moneyTick = v => num(v / AXU(), 0);
const yearTicks = (n, f) => { const yrs = n / 12, st = yrs > 40 ? 10 : 5, out = []; for (let y = 0; y <= yrs + 1e-9; y += st) out.push(y * 12); return out; };

// the base loan used from chapter 2 on
const P = 1e6, R0 = 0.04, N = 360, I0 = R0 / 12;

/* ───────── 01 three names for one rate ───────── */
(() => {
  const cv = $('#rtCv'), sR = $('#rtR');
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), r = +sR.value / 100, m = +radioVal('rtM');
      const top = P * Math.max(1 + M.effective(r, m), 1 + r), u = AXU();
      const tk = ticks(P / u, top / u * 1.002, 4), y1 = tk.vals[tk.vals.length - 1] < top / u ? tk.vals[tk.vals.length - 1] + tk.step : tk.vals[tk.vals.length - 1];
      const f = frame(w, h, [30, 16, 40, 54], 0, 12, P / u, y1);
      yTicks(c, f, tk.vals.concat(y1 > tk.vals[tk.vals.length - 1] ? [y1] : []), v => num(v, tk.step < 1 ? (tk.step < 0.1 ? 2 : 1) : 0));
      axes(c, f, t('ch1.ax.x'), t('ch1.ax.y'));
      xTicks(c, f, [0, 3, 6, 9, 12], v => num(v));
      path(c, [[0, P / u], [12, P * (1 + r) / u]], f.X, f.Y, C.mute, 1.3, [5, 4]);
      const st = M.staircase(P, r, m), pts = [];
      st.forEach((q, k) => { const x = q[0] * 12; if (k) pts.push([x, st[k - 1][1] / u]); pts.push([x, q[1] / u]); });
      path(c, pts, f.X, f.Y, C.gold, 2.2);
      dot(c, f.X(12), f.Y(st[st.length - 1][1] / u), C.gold);
    }
  });
  function text() {
    const r = +sR.value / 100, m = +radioVal('rtM'), p = M.periodic(r, m), e = M.effective(r, m);
    put('#rtRo', prz(r, 1));
    put('#rtPer', pct(p, p < 0.001 ? 4 : 3)); put('#rtEff', pct(e, 2)); put('#rtOwe', money(P * (1 + e), 2));
    put('#rtGap', t('u.pp', { v: num((e - r) * 100, 2) }));
    putHTML('#rtSay', m === 1 ? t('ch1.say.once', { r: rz(r, 1) }) : t('ch1.say.multi', { m: num(m), p: num(p * 100, p < 0.001 ? 4 : 3), e: num(e * 100, 2), r: rz(r, 1), d: num((e - r) * 100, 2) }));
  }
  sim.text = text;
  const redo = () => { sim.dirty = true; text(); };
  sR.addEventListener('input', redo); radios('rtM').forEach(x => x.addEventListener('change', redo));
  text();
})();

/* ───────── 02 guess the payment ───────── */
(() => {
  const cv = $('#pyCv'), sG = $('#pyG'), bE = $('#pyExact'), SPAN = 600, Mx = M.payment(P, I0, N);
  let exact = false, shown = reduce ? SPAN : 0, started = false;
  const g = () => exact ? Mx : +sG.value;
  const sim = reg(cv, {
    step(dt) {
      if (!started) { started = true; }
      if (shown < SPAN) { shown = Math.min(SPAN, shown + dt * 120); this.dirty = true; }
    },
    draw() {
      const { c, w, h } = fit(cv), u = AXU(), G = g();
      const pg = M.simulateFixed(P, I0, G, SPAN).path, px = M.simulateFixed(P, I0, Mx, N).path;
      const hi = Math.min(2 * P, Math.max(P, ...pg)) / u, top = niceTop(hi * 1.02);
      const f = frame(w, h, [30, 16, 40, 54], 0, SPAN, 0, top);
      yTicks(c, f, ticks(0, top, 4).vals, v => num(v));
      axes(c, f, t('ch2.ax.x'), t('ch2.ax.y'));
      xTicks(c, f, [0, 120, 240, 360, 480, 600], v => num(v / 12));
      vline(c, f, N, C.line, [2, 3], 1);
      path(c, px.map((b, m) => [m, Math.max(0, b) / u]), f.X, f.Y, C.cyan, 1.6, [6, 4]);
      const pts = []; for (let m = 0; m <= Math.floor(shown); m++) { const b = pg[m]; pts.push([m, Math.max(0, b) / u]); if (b <= 0) break; }
      path(c, cutY(pts, top), f.X, f.Y, C.gold, 2.4);
      const cut = cutY(pts, top), q = cut[cut.length - 1]; if (cut.length === pts.length) dot(c, f.X(q[0]), f.Y(q[1]), C.gold);
    }
  });
  function text() {
    const G = g(), int = P * I0, left = M.balanceAfter(P, I0, G, N), pay = M.payoffMonth(P, I0, G, 1200);
    put('#pyGo', mon(G, exact ? 2 : 0));
    put('#pyPay', mon(G, exact ? 2 : 0)); put('#pyInt', mon(int));
    put('#pyLeft', exact || left <= 0 ? money(0) : money(left));
    put('#pyEnd', exact ? dur(N) : pay == null ? t('u.never') : dur(pay));
    const v = { g: mon(G, exact ? 2 : 0), int: mon(int), left: money(left), end: pay == null ? '' : dur(pay), early: pay == null ? '' : dur(N - pay), M: mon(Mx, 2) };
    let key;
    if (exact) key = 'ch2.say.exact';
    else if (G <= int) key = 'ch2.say.below';
    else if (pay == null) key = 'ch2.say.slow';
    else if (pay > N) key = 'ch2.say.low';
    else if (pay === N) key = 'ch2.say.near';
    else key = 'ch2.say.high';
    putHTML('#pySay', t(key, v));
  }
  sim.text = text;
  sG.addEventListener('input', () => { exact = false; shown = SPAN; sim.dirty = true; text(); });
  bE.addEventListener('click', () => { exact = true; sG.value = String(Math.round(Mx / 10) * 10); shown = reduce ? SPAN : 0; sim.dirty = true; text(); });
  text();
})();

/* ───────── 03 the schedule ───────── */
(() => {
  const cv = $('#amCv'), sR = $('#amR'), sN = $('#amN'), sK = $('#amK');
  let a = null;
  const model = () => { const n = +sN.value * 12; sK.max = String(n); if (+sK.value > n) sK.value = String(n); a = M.amortise(P, +sR.value / 100, n); };
  model();
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), n = a.rows.length, top = niceTop(a.M0 * 1.08);
      const f = frame(w, h, [30, 16, 40, 54], 0, n, 0, top);
      yTicks(c, f, ticks(0, top, 4).vals, v => num(v));
      axes(c, f, t('ax.month'), t('ch3.ax.y'));
      xTicks(c, f, yearTicks(n), v => num(v / 12));
      // stacked: interest from 0, principal on top of it
      c.fillStyle = 'rgba(240,122,109,.75)'; c.beginPath(); c.moveTo(f.X(0), f.Y(0));
      a.rows.forEach(q => { c.lineTo(f.X(q.m - 1), f.Y(q.int)); c.lineTo(f.X(q.m), f.Y(q.int)); }); c.lineTo(f.X(n), f.Y(0)); c.closePath(); c.fill();
      c.fillStyle = 'rgba(99,199,230,.7)'; c.beginPath(); c.moveTo(f.X(0), f.Y(a.rows[0].int));
      a.rows.forEach(q => { c.lineTo(f.X(q.m - 1), f.Y(q.pay)); c.lineTo(f.X(q.m), f.Y(q.pay)); });
      for (let k = a.rows.length - 1; k >= 0; k--) { const q = a.rows[k]; c.lineTo(f.X(q.m), f.Y(q.int)); c.lineTo(f.X(q.m - 1), f.Y(q.int)); }
      c.closePath(); c.fill();
      const cr = M.crossover(a.rows); if (cr && cr > 1) vline(c, f, cr - 0.5, C.gold, [5, 4], 1.6);
      const k = +sK.value; c.strokeStyle = C.ink; c.lineWidth = 1.5; c.beginPath(); c.moveTo(f.X(k - 0.5), f.T); c.lineTo(f.X(k - 0.5), f.B); c.stroke();
      dot(c, f.X(k - 0.5), f.Y(a.rows[k - 1].int), C.ink, 4);
    }
  });
  function text() {
    const k = +sK.value, q = a.rows[k - 1], cr = M.crossover(a.rows);
    put('#amRo', prz(+sR.value / 100, 2)); put('#amNo', t('u.dur.y', { y: num(+sN.value) })); put('#amKo', t('u.month', { v: num(k) }));
    put('#amI', mon(q.int)); put('#amP', mon(q.prin)); put('#amB', money(q.bal)); put('#amX', t('u.month', { v: num(cr) })); put('#amT', money(a.totInt));
    const v = { k: t('u.month', { v: num(k) }), pay: mon(q.pay), int: mon(q.int), prin: mon(q.prin), c: t('u.month', { v: num(cr) }) };
    putHTML('#amSay', t(cr === 1 ? 'ch3.say.start' : k < cr ? 'ch3.say.before' : 'ch3.say.after', v));
  }
  sim.text = text;
  const redo = () => { model(); sim.dirty = true; text(); };
  [sR, sN].forEach(e => e.addEventListener('input', redo));
  sK.addEventListener('input', () => { sim.dirty = true; text(); });
  text();
})();

/* ───────── 04 two ways to repay ───────── */
(() => {
  const cv1 = $('#cmCv1'), cv2 = $('#cmCv2'), sR = $('#cmR'), sN = $('#cmN');
  let A = null, E = null;
  const model = () => { const n = +sN.value * 12, r = +sR.value / 100; A = M.amortise(P, r, n); E = M.equalPrincipal(P, r, n); };
  model();
  const sim = reg([cv1, cv2], {
    draw() {
      const n = E.months;
      { const { c, w, h } = fit(cv1), top = niceTop(E.rows[0].pay * 1.05);
        const f = frame(w, h, [28, 16, 38, 54], 0, n, 0, top);
        yTicks(c, f, ticks(0, top, 3).vals, v => num(v)); axes(c, f, '', t('ch4.ax.y1'));
        xTicks(c, f, yearTicks(n), v => num(v / 12));
        path(c, A.rows.map(q => [q.m, q.pay]), f.X, f.Y, C.cyan, 2.2);
        path(c, E.rows.map(q => [q.m, q.pay]), f.X, f.Y, C.gold, 2.2); }
      { const { c, w, h } = fit(cv2), u = AXU(), top = niceTop(P / u);
        const f = frame(w, h, [30, 16, 40, 54], 0, n, 0, top);
        yTicks(c, f, ticks(0, top, 4).vals, v => num(v)); axes(c, f, t('ax.month'), t('ch4.ax.y2'));
        xTicks(c, f, yearTicks(n), v => num(v / 12));
        const ba = [[0, P / u]].concat(A.rows.map(q => [q.m, q.bal / u])), be = [[0, P / u]].concat(E.rows.map(q => [q.m, q.bal / u]));
        c.fillStyle = 'rgba(240,122,109,.32)'; c.beginPath(); ba.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](f.X(p[0]), f.Y(p[1])));
        for (let i = be.length - 1; i >= 0; i--) c.lineTo(f.X(be[i][0]), f.Y(be[i][1])); c.closePath(); c.fill();
        path(c, ba, f.X, f.Y, C.cyan, 2.2); path(c, be, f.X, f.Y, C.gold, 2.2); }
    }
  });
  function text() {
    const r = +sR.value / 100, n = E.months, i = r / 12;
    put('#cmRo', prz(r, 2)); put('#cmNo', t('u.dur.y', { y: num(+sN.value) }));
    put('#cmA1', mon(A.rows[0].pay)); put('#cmE1', mon(E.rows[0].pay)); put('#cmAI', money(A.totInt)); put('#cmEI', money(E.totInt));
    put('#cmPVl', t('ch4.read.pv', { r: rz(r, 2) }));
    put('#cmPV', t('ch4.read.pvv', { a: money(M.pvPayments(A.rows, i)), b: money(M.pvPayments(E.rows, i)) }));
    const ba = M.balanceMonths(A.rows), be = M.balanceMonths(E.rows);
    putHTML('#cmSay', t('ch4.say', { d: money(A.totInt - E.totInt), y: num(+sN.value), aa: money(ba / n), ae: money(be / n), ri: num(A.totInt / E.totInt, 3), rb: num(ba / be, 3) }));
  }
  sim.text = text;
  const redo = () => { model(); sim.dirty = true; text(); };
  [sR, sN].forEach(e => e.addEventListener('input', redo));
  text();
})();

/* ───────── 05 one extra payment ───────── */
(() => {
  const cv1 = $('#ppCv1'), cv2 = $('#ppCv2'), sX = $('#ppX'), sY = $('#ppY');
  let res = null, curves = null, lastX = null;
  function model() {
    const X = +sX.value * 1e4, k = +sY.value * 12, mode = radioVal('ppMode');
    res = M.prepay(P, R0, N, X, k, mode); res.k = k; res.X = X; res.mode = mode;
    res.balK = res.base.rows[k - 1].bal;
    if (lastX !== X) { lastX = X; curves = { term: M.savingCurve(P, R0, N, X, 'term', 12), payment: M.savingCurve(P, R0, N, X, 'payment', 12) }; }
  }
  model();
  const sim = reg([cv1, cv2], {
    draw() {
      const u = AXU();
      { const { c, w, h } = fit(cv1), top = niceTop(P / u);
        const f = frame(w, h, [30, 16, 40, 54], 0, N, 0, top);
        yTicks(c, f, ticks(0, top, 4).vals, v => num(v)); axes(c, f, t('ax.month'), t('ch5.ax.y1'));
        xTicks(c, f, yearTicks(N), v => num(v / 12));
        path(c, [[0, P / u]].concat(res.base.rows.map(q => [q.m, q.bal / u])), f.X, f.Y, C.mute, 1.4, [5, 4]);
        const col = res.mode === 'term' ? C.gold : C.violet;
        const pts = [[0, P / u]]; res.alt.rows.forEach(q => { if (q.extra) pts.push([q.m, (q.bal + q.extra) / u]); pts.push([q.m, q.bal / u]); });
        path(c, pts, f.X, f.Y, col, 2.4);
        vline(c, f, res.k, C.line, [2, 3], 1); }
      { const { c, w, h } = fit(cv2), mx = Math.max(...curves.term.map(p => p[1]), 1) / u, top = niceTop(mx * 1.05, 3);
        const f = frame(w, h, [28, 16, 40, 54], 0, N, 0, top);
        yTicks(c, f, ticks(0, top, 3).vals, v => num(v, top < 3 ? 1 : 0)); axes(c, f, t('ch5.ax.x2'), t('ch5.ax.y2'));
        xTicks(c, f, yearTicks(N), v => num(v / 12));
        const sel = res.mode;
        path(c, curves.payment.map(p => [p[0], p[1] / u]), f.X, f.Y, C.violet, sel === 'payment' ? 2.4 : 1.3);
        path(c, curves.term.map(p => [p[0], p[1] / u]), f.X, f.Y, C.gold, sel === 'term' ? 2.4 : 1.3);
        dot(c, f.X(res.k), f.Y(res.saved / u), sel === 'term' ? C.gold : C.violet, 5); }
    }
  });
  function text() {
    const r = res, X = r.X;
    put('#ppXo', money(X)); put('#ppYo', t('u.yearOut', { v: num(+sY.value) }));
    put('#ppSaved', money(r.saved)); put('#ppEnd', dur(r.alt.months));
    const payoff = X >= r.balK - 0.005;
    put('#ppPay', payoff ? '—' : mon(r.newPay));
    put('#ppPV', money(M.pvFrom(r.base.rows, r.k, I0) - M.pvFrom(r.alt.rows, r.k, I0)));
    const v = { k: t('u.year', { v: num(+sY.value) }), x: money(X), s: dur(r.monthsSooner), saved: money(r.saved), m0: mon(r.base.M0), m1: mon(r.newPay), bal: money(r.balK) };
    putHTML('#ppSay', t(payoff ? 'ch5.say.payoff' : r.mode === 'term' ? 'ch5.say.term' : 'ch5.say.payment', v));
  }
  sim.text = text;
  const redo = () => { model(); sim.dirty = true; text(); };
  [sX, sY].forEach(e => e.addEventListener('input', redo)); radios('ppMode').forEach(x => x.addEventListener('change', redo));
  text();
})();

/* ───────── 06 the rate changes ───────── */
(() => {
  const cv1 = $('#rcCv1'), cv2 = $('#rcCv2'), sY = $('#rcY'), sD = $('#rcD');
  let res = null;
  function model() {
    const k = +sY.value * 12, d = +sD.value / 100, mode = radioVal('rcMode');
    res = M.rateChange(P, R0, N, k, R0 + d, mode); res.k = k; res.d = d; res.mode = mode; res.r1 = R0 + d;
  }
  model();
  const sim = reg([cv1, cv2], {
    draw() {
      const u = AXU(), span = res.neverEnds ? 720 : Math.min(720, Math.max(N, Math.ceil(res.months / 60) * 60));
      const rows = res.alt.rows.filter(q => q.m <= span);
      { const { c, w, h } = fit(cv1), mx = Math.min(2.5 * res.base.M0, Math.max(res.base.M0, ...rows.map(q => Math.max(q.pay, q.int)))), top = niceTop(mx * 1.08, 3);
        const f = frame(w, h, [28, 16, 38, 54], 0, span, 0, top);
        yTicks(c, f, ticks(0, top, 3).vals, v => num(v)); axes(c, f, '', t('ch6.ax.y1'));
        xTicks(c, f, yearTicks(span), v => num(v / 12));
        path(c, res.base.rows.map(q => [q.m, q.pay]), f.X, f.Y, C.mute, 1.4, [5, 4]);
        path(c, cutY(rows.map(q => [q.m, q.int]), top), f.X, f.Y, C.red, 1.6);
        path(c, rows.map(q => [q.m, q.pay]), f.X, f.Y, C.gold, 2.4);
        vline(c, f, res.k, C.line, [2, 3], 1); }
      { const { c, w, h } = fit(cv2), mx = Math.max(P, ...rows.map(q => q.bal)), top = niceTop(Math.min(mx, 2 * P) / u * 1.02);
        const f = frame(w, h, [30, 16, 40, 54], 0, span, 0, top);
        yTicks(c, f, ticks(0, top, 4).vals, v => num(v)); axes(c, f, t('ax.month'), t('ch6.ax.y2'));
        xTicks(c, f, yearTicks(span), v => num(v / 12));
        path(c, [[0, P / u]].concat(res.base.rows.map(q => [q.m, q.bal / u])), f.X, f.Y, C.mute, 1.4, [5, 4]);
        path(c, cutY([[0, P / u]].concat(rows.map(q => [q.m, q.bal / u])), top), f.X, f.Y, C.gold, 2.4);
        vline(c, f, res.k, C.line, [2, 3], 1); }
    }
  });
  function text() {
    const r = res, d = r.d, sign = d > 0 ? '+' : d < 0 ? '−' : '±';
    put('#rcYo', t('u.yearOut', { v: num(+sY.value) })); put('#rcDo', t(Math.abs(Math.abs(d) - 0.01) < 1e-12 ? 'u.pp1' : 'u.pp', { v: sign + rz(Math.abs(d), 2) }));
    put('#rcM0', mon(r.payBefore)); put('#rcM1', mon(r.payAfter)); put('#rcI1', mon(r.intAfter));
    put('#rcEnd', r.neverEnds ? t('u.never') : dur(r.months));
    const dI = r.extraInterest;
    put('#rcTot', r.neverEnds ? '—' : Math.abs(dI) < 0.5 ? t('ch6.out.same') : t(dI > 0 ? 'ch6.out.more' : 'ch6.out.less', { v: money(Math.abs(dI)) }));
    const v = { y: t('u.year', { v: num(+sY.value) }), r0: rz(R0, 2), r1: rz(r.r1, 2), bal: money(r.balK), left: dur(N - r.k), m0: mon(r.payBefore), m1: mon(r.payAfter),
      d: money(Math.abs(dI)), int: mon(r.intAfter), end: dur(r.months), thr: num(12 * r.base.M0 / r.balK * 100, 2) };
    let key;
    if (Math.abs(d) < 1e-12) key = 'ch6.say.same';
    else if (r.mode === 'repay') key = d > 0 ? 'ch6.say.repayUp' : 'ch6.say.repayDown';
    else if (r.neverEnds || !M.keepCovers(r.balK, r.r1, r.base.M0)) key = 'ch6.say.never';
    else key = d > 0 ? 'ch6.say.keepUp' : 'ch6.say.keepDown';
    putHTML('#rcSay', t(key, v));
  }
  sim.text = text;
  const redo = () => { model(); sim.dirty = true; text(); };
  [sY, sD].forEach(e => e.addEventListener('input', redo)); radios('rcMode').forEach(x => x.addEventListener('change', redo));
  text();
})();

/* ───────── 07 the true annual rate ───────── */
(() => {
  const cv1 = $('#apCv1'), cv2 = $('#apCv2'), sF = $('#apF'), sU = $('#apU'), PR = 12000;
  let fp = null, n = 12;
  const model = () => { n = +radioVal('apN'); fp = M.flatPlan(PR, +sF.value / 100, n, +sU.value / 100); };
  model();
  const sim = reg([cv1, cv2], {
    draw() {
      { const { c, w, h } = fit(cv1), f = frame(w, h, [28, 16, 38, 54], 0, n, 0, PR * 1.1);
        yTicks(c, f, [0, 4000, 8000, 12000], v => num(v)); axes(c, f, t('ch7.ax.x1'), t('ch7.ax.y1'));
        const st = n <= 12 ? (n <= 6 ? 1 : 3) : 6, xs = []; for (let k = 0; k <= n; k += st) xs.push(k);
        xTicks(c, f, xs, v => num(v));
        c.fillStyle = 'rgba(99,199,230,.45)';
        for (let k = 0; k < n; k++) { const owed = PR * (1 - k / n); c.fillRect(f.X(k) + 0.5, f.Y(owed), Math.max(1, f.X(k + 1) - f.X(k) - 1), f.B - f.Y(owed)); }
        c.strokeStyle = C.red; c.lineWidth = 2; c.beginPath(); c.moveTo(f.X(0), f.Y(PR)); c.lineTo(f.X(n), f.Y(PR)); c.stroke(); }
      { const { c, w, h } = fit(cv2), xMax = Math.max(0.4, Math.ceil(fp.apr * 1.6 * 10) / 10);
        const pts = []; for (let k = 0; k <= 120; k++) { const R = xMax * k / 120; pts.push([R, M.npv(R / 12, fp.flows)]); }
        const lo = Math.min(...pts.map(p => p[1])), hi = Math.max(...pts.map(p => p[1]));
        const tk = ticks(lo, hi, 4), y0 = Math.min(lo, tk.vals[0]), y1 = Math.max(hi, tk.vals[tk.vals.length - 1]);
        const f = frame(w, h, [30, 16, 40, 62], 0, xMax, y0, y1);
        yTicks(c, f, tk.vals, v => num(v)); axes(c, f, t('ch7.ax.x2'), t('ch7.ax.y2'));
        const xs = []; const xs0 = ticks(0, xMax, 4); xs0.vals.forEach(v => xs.push(v));
        xTicks(c, f, xs, v => num(v * 100) + '%', true);
        hline(c, f, 0, C.mute, [2, 3], 1);
        vline(c, f, fp.quoted, C.red, [5, 4], 1.4);
        path(c, pts, f.X, f.Y, C.gold, 2.4);
        dot(c, f.X(fp.apr), f.Y(0), C.gold, 5.5);
        // label below-right of the root: the curve rises to the right, so that corner is empty
        c.fillStyle = C.gold; c.textAlign = 'left';
        c.fillText(t('ch7.ax.root'), f.X(fp.apr) + 10, f.Y(0) + 16); }
    }
  });
  function text() {
    put('#apFo', prz(+sF.value / 100, 2)); put('#apUo', prz(+sU.value / 100, 1));
    put('#apPay', mon(fp.pay, fp.pay % 1 ? 2 : 0)); put('#apQ', pct(fp.quoted, 1)); put('#apApr', pct(fp.apr, 1)); put('#apEar', pct(fp.ear, 1));
    put('#apX', t('u.times', { v: num(fp.apr / fp.quoted, 2) }));
    const v = { q: num(fp.quoted * 100, 1), j: num(fp.j * 100, 3), apr: num(fp.apr * 100, 1), ear: num(fp.ear * 100, 1), x: num(fp.apr / fp.quoted, 2), u: rz(+sU.value / 100, 1) };
    putHTML('#apSay', t(+sU.value > 0 ? 'ch7.say.fee' : 'ch7.say.plain', v));
  }
  sim.text = text;
  const redo = () => { model(); sim.dirty = true; text(); };
  [sF, sU].forEach(e => e.addEventListener('input', redo)); radios('apN').forEach(x => x.addEventListener('change', redo));
  text();
})();

/* ───────── 08 inflation and the alternative ───────── */
(() => {
  const cv1 = $('#rlCv1'), cv2 = $('#rlCv2'), sPi = $('#rlPi'), sG = $('#rlG'), X = 1e5, K = 60;
  const base = M.amortise(P, R0, N), ear = M.effective(R0, 12);
  let diffCurve = null;
  const deflate = pi => Math.pow(1 + pi, N / 12);
  function curve() { diffCurve = []; for (let k = 0; k <= 32; k++) { const g = 0.08 * k / 32; diffCurve.push([g, M.prepayOrInvest(P, R0, N, X, K, g).diff]); } }
  curve();
  const sim = reg([cv1, cv2], {
    draw() {
      const pi = +sPi.value / 100, g = +sG.value / 100, u = AXU(), dfl = deflate(pi);
      { const { c, w, h } = fit(cv1), top = niceTop(base.M0 * 1.1, 3);
        const f = frame(w, h, [28, 16, 38, 54], 0, N, 0, top);
        yTicks(c, f, ticks(0, top, 3).vals, v => num(v)); axes(c, f, t('ax.month'), t('ch8.ax.y1'));
        xTicks(c, f, yearTicks(N), v => num(v / 12));
        path(c, [[0, base.M0], [N, base.M0]], f.X, f.Y, C.mute, 1.4, [5, 4]);
        path(c, base.rows.map(q => [q.m, M.realValue(q.pay, q.m, pi)]), f.X, f.Y, C.gold, 2.4); }
      { const { c, w, h } = fit(cv2), pts = diffCurve.map(p => [p[0], p[1] / dfl / u]);
        const lo = Math.min(0, ...pts.map(p => p[1])), hi = Math.max(0, ...pts.map(p => p[1])), tk = ticks(lo, hi, 4);
        const f = frame(w, h, [28, 16, 40, 54], 0, 0.08, Math.min(lo, tk.vals[0]), Math.max(hi, tk.vals[tk.vals.length - 1]));
        yTicks(c, f, tk.vals, v => num(v)); axes(c, f, t('ch8.ax.x2'), t('ch8.ax.y2'));
        xTicks(c, f, [0, 0.02, 0.04, 0.06, 0.08], v => num(v * 100) + '%', true);
        hline(c, f, 0, C.mute, [2, 3], 1);
        vline(c, f, R0, C.line, [2, 3], 1);
        path(c, pts, f.X, f.Y, C.violet, 2.4);
        dot(c, f.X(g), f.Y(M.prepayOrInvest(P, R0, N, X, K, g).diff / dfl / u), C.violet, 5.5); }
    }
  });
  function text() {
    const pi = +sPi.value / 100, g = +sG.value / 100, dfl = deflate(pi), d = M.prepayOrInvest(P, R0, N, X, K, g).diff / dfl;
    put('#rlPio', prz(pi, 2)); put('#rlGo', prz(g, 2));
    put('#rlLast', mon(M.realValue(base.M0, N, pi))); put('#rlSum', money(M.realTotals(base.rows, pi)));
    put('#rlReal', pct(M.realRate(ear, pi), 2)); put('#rlDiff', money(d));
    const v = { g: rz(g, 2), r: rz(R0, 2), d: money(Math.abs(d)), pi: rz(pi, 2) };
    let s = t(Math.abs(g - R0) < 1e-9 ? 'ch8.say.equal' : g < R0 ? 'ch8.say.prepay' : 'ch8.say.invest', v);
    if (pi > 0 && Math.abs(g - R0) >= 1e-9) s += (zh() ? '' : ' ') + t('ch8.say.real', v);
    putHTML('#rlSay', s);
  }
  sim.text = text;
  const redo = () => { sim.dirty = true; text(); };
  [sPi, sG].forEach(e => e.addEventListener('input', redo));
  text();
})();

/* ───────── loop ───────── */
applyLang();
let last = performance.now();
function tick(now) {
  const dt = Math.min((now - last) / 1000, 0.1); last = now;
  for (const s of sims) {
    if (!s.vis) continue;
    if (s.step) s.step(dt);
    if (s.dirty) { s.draw(); s.dirty = false; }
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
window.__essayReady = true;
})();
