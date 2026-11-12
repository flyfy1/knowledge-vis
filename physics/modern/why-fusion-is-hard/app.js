/* Why is fusion always thirty years away? — wiring, drawing, i18n and on-screen gating.
   All visible words come from copy.*.js; all numbers come from models.js (FusionModels). */
(() => {
'use strict';
const M = window.FusionModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const C = { bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', dimfill: '#3a4254', bar: '#5b6478' };
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
const L = key => (COPY[lang] && COPY[lang][key] != null) ? COPY[lang][key] : (COPY.zh && COPY.zh[key] != null ? COPY.zh[key] : key);
const PV = M.prose();
const t = (key, vars) => M.fill(L(key), vars || PV, L);
const F = spec => M.format(spec, L);
const effLang = () => (COPY[lang] ? lang : 'zh');
function applyLang() {
  document.documentElement.lang = effLang() === 'zh' ? 'zh-CN' : 'en';
  document.title = t('doc.title');
  const md = document.querySelector('meta[name=description]'); if (md) md.content = t('doc.desc');
  document.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(e => { e.innerHTML = t(e.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-aria]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.i18nAria)); });
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
const putRead = (map, read) => { for (const k in map) put(map[k], F(read[k])); };
const watch = (els, fn) => els.forEach(e => e.addEventListener(e.type === 'radio' || e.type === 'checkbox' ? 'change' : 'input', fn));

function frame(w, h, m, x0, x1, y0, y1) {
  const L0 = m[3], R = w - m[1], T = m[0], B = h - m[2];
  return { L: L0, R, T, B, x0, x1, y0, y1, X: x => L0 + (R - L0) * (x - x0) / (x1 - x0), Y: y => B - (B - T) * (y - y0) / (y1 - y0) };
}
function axes(c, f, xLab, yLab) {
  c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.T); c.lineTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
  c.fillStyle = C.mute; c.font = FONT;
  if (yLab) { c.textAlign = 'left'; c.fillText(yLab, f.L + 6, f.T - 12); }
  if (xLab) { c.textAlign = 'right'; c.fillText(xLab, f.R, f.B + 26); }
}
function xTicks(c, f, vals, fmtv) {
  c.fillStyle = C.mute; c.textAlign = 'center';
  vals.forEach(v => { const x = f.X(v); c.fillText(fmtv(v), x, f.B + 11); c.strokeStyle = C.line; c.beginPath(); c.moveTo(x, f.B); c.lineTo(x, f.B + 3); c.stroke(); });
}
function yTicks(c, f, vals, fmtv) {
  c.fillStyle = C.mute; c.textAlign = 'right';
  vals.forEach(v => { const y = f.Y(v); c.fillText(fmtv(v), f.L - 6, y); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, y); c.lineTo(f.R, y); c.stroke(); });
}
function hline(c, f, y, col, dash = [5, 4]) { c.strokeStyle = col; c.lineWidth = 1.3; c.setLineDash(dash); c.beginPath(); c.moveTo(f.L, f.Y(y)); c.lineTo(f.R, f.Y(y)); c.stroke(); c.setLineDash([]); }
function vline(c, f, x, col, dash = [5, 4]) { c.strokeStyle = col; c.lineWidth = 1.3; c.setLineDash(dash); c.beginPath(); c.moveTo(f.X(x), f.T); c.lineTo(f.X(x), f.B); c.stroke(); c.setLineDash([]); }
function path(c, pts, X, Y, col, lw = 2.2, dash) { c.strokeStyle = col; c.lineWidth = lw; c.lineJoin = 'round'; if (dash) c.setLineDash(dash); c.beginPath(); let pen = false; pts.forEach(p => { if (p == null || p[1] == null || !isFinite(p[1])) { pen = false; return; } /* isFinite(null) is true: test null first */ c[pen ? 'lineTo' : 'moveTo'](X(p[0]), Y(p[1])); pen = true; }); c.stroke(); c.setLineDash([]); }
function dot(c, x, y, col, r = 4.5, hollow) { c.beginPath(); c.arc(x, y, r, 0, 6.283); if (hollow) { c.strokeStyle = col; c.lineWidth = 1.6; c.stroke(); } else { c.fillStyle = col; c.fill(); } }
// a label with a dark backing so it stays readable over lines; keeps inside [x0,x1]
function label(c, s, x, y, col, align = 'left', x0 = 0, x1 = 1e9) {
  c.font = FONT; const w = c.measureText(s).width;
  let lx = align === 'left' ? x : align === 'right' ? x - w : x - w / 2; lx = clamp(lx, x0 + 2, x1 - w - 2);
  c.fillStyle = 'rgba(15,18,25,.82)'; c.fillRect(lx - 2, y - 8, w + 4, 16);
  c.fillStyle = col; c.textAlign = 'left'; c.fillText(s, lx, y);
}
const pow10 = e => F({ sci: Math.pow(10, e), d: 0 });
function clock(until, speed) { return { t: reduce ? until : 0, until, speed, restart() { this.t = reduce ? this.until : 0; }, tick(dt) { const was = this.t; this.t = Math.min(this.until, this.t + dt * this.speed); return this.t !== was; } }; }
const N = (v, d = 0) => ({ v, d });

/* ───────── 01 binding energy ───────── */
(() => {
  const cv = $('#bdCv');
  const NAME = { H1: '¹H', H2: '²H', H3: '³H', He3: '³He', He4: '⁴He', Li6: '⁶Li', Li7: '⁷Li', B11: '¹¹B', C12: '¹²C', O16: '¹⁶O', Fe56: '⁵⁶Fe', Ni62: '⁶²Ni', Kr92: '⁹²Kr', Ba141: '¹⁴¹Ba', U235: '²³⁵U', U238: '²³⁸U' };
  const ids = Object.keys(NAME).sort((a, b) => M.NUC[a].A - M.NUC[b].A || M.bindingPerA(a) - M.bindingPerA(b));
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), rx = radioVal('bdRx'), R = M.REACTIONS[rx];
      const f = frame(w, h, [30, 14, 40, 40], 0, Math.log10(260), 0, 9.5);
      yTicks(c, f, [0, 2, 4, 6, 8], v => F(N(v))); axes(c, f, t('ch1.cv.x'), t('ch1.cv.y'));
      xTicks(c, f, [1, 10, 100].map(Math.log10), v => F(N(Math.pow(10, v))));
      path(c, ids.map(id => [Math.log10(M.NUC[id].A), M.bindingPerA(id)]), f.X, f.Y, C.line, 1.2);
      const before = new Set(R.lhs.filter(x => x !== 'n')), after = new Set(R.rhs.filter(x => x !== 'n'));
      for (const id of ids) { const x = f.X(Math.log10(M.NUC[id].A)), y = f.Y(M.bindingPerA(id)); dot(c, x, y, before.has(id) ? C.cyan : after.has(id) ? C.gold : C.dimfill, before.has(id) || after.has(id) ? 5.5 : 3.5); }
      const show = new Set([...before, ...after, 'Fe56']); if (rx !== 'u235') show.add('U238');
      for (const id of show) {
        const x = f.X(Math.log10(M.NUC[id].A)), y = f.Y(M.bindingPerA(id)), col = before.has(id) ? C.cyan : after.has(id) ? C.gold : C.mute;
        const left = id === 'H3' || id === 'U238' || id === 'Fe56';
        // the fission fragments and ²³⁵U sit close together on narrow screens: Kr above its dot, Ba and U below theirs, Fe to the left
        const below = id === 'Ba141' || (id === 'U235'), above = id === 'Kr92';
        if (below || above) { label(c, NAME[id], x, y + (above ? -14 : 15), col, 'center', f.L, f.R); continue; }
        label(c, NAME[id], left ? x - 8 : x + 8, y + (id === 'H1' ? -12 : id === 'He3' ? 10 : 0), col, left ? 'right' : 'left', f.L, f.R);
      }
      label(c, '● ' + t('ch1.cv.before'), f.R - 4, f.B - 32, C.cyan, 'right', f.L, f.R);
      label(c, '● ' + t('ch1.cv.after'), f.R - 4, f.B - 14, C.gold, 'right', f.L, f.R);
    }
  });
  function text() { const v = M.V.bind({ rx: radioVal('bdRx') }); putRead({ q: '#bdQ', kg: '#bdKg', coal: '#bdCoal', neu: '#bdNeu' }, v.read); putHTML('#bdSay', F(v.say)); }
  sim.text = text;
  watch(radios('bdRx'), () => { sim.dirty = true; text(); });
  text();
})();

/* ───────── 02 Coulomb barrier vs the Maxwellian tail ───────── */
(() => {
  const cv = $('#cbCv'), sT = $('#cbT'), YMIN = -40;
  const st = () => ({ rx: radioVal('cbRx'), T: +sT.value });
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), s = st(), v = M.V.coulomb(s), xmax = Math.ceil(v.barrier * 1.3 / 100) * 100;
      const f = frame(w, h, [30, 14, 40, 52], 0, xmax, YMIN, 0);
      yTicks(c, f, [0, -10, -20, -30, -40], e => pow10(e)); axes(c, f, t('ch2.cv.x'), t('ch2.cv.y'));
      const step = xmax > 1000 ? 500 : xmax > 400 ? 200 : 100, xs = []; for (let x = 0; x <= xmax; x += step) xs.push(x);
      xTicks(c, f, xs, x => F(N(x)));
      const pts = []; for (let i = 1; i <= 300; i++) { const E = xmax * i / 300, lg = M.log10Tail(E, s.T); pts.push([E, lg < YMIN ? null : lg]); }
      path(c, [[0, 0], ...pts.filter(p => p[1] != null)], f.X, f.Y, C.cyan);
      vline(c, f, v.barrier, C.red); if (s.T < xmax) vline(c, f, s.T, C.mute, [2, 3]);
      label(c, t('ch2.cv.bar'), f.X(v.barrier) + 6, f.T + 8, C.red, 'left', f.L, f.R);
      if (s.T < xmax) label(c, t('ch2.cv.kT'), f.X(s.T) + 4, f.T + 28, C.mute, 'left', f.L, f.R);
      if (v.lg >= YMIN) dot(c, f.X(v.barrier), f.Y(v.lg), C.gold);
      else label(c, '↓ ' + F({ lg: v.lg, d: 1 }), f.X(v.barrier) - 6, f.B - 10, C.gold, 'right', f.L, f.R);
    }
  });
  function text() { const v = M.V.coulomb(st()); put('#cbTo', t('u.kev', { v: N(+sT.value) })); putRead({ bar: '#cbBar', kT: '#cbKT', frac: '#cbFrac', need: '#cbNeed' }, v.read); putHTML('#cbSay', F(v.say)); }
  sim.text = text;
  watch([sT, ...radios('cbRx')], () => { sim.dirty = true; text(); });
  text();
})();

/* ───────── 03 Gamow peak and reactivity ───────── */
(() => {
  const cv = $('#gmCv'), cv2 = $('#svCv'), sT = $('#gmT');
  const GAM = { dt: 'dt', dd: 'ddp', dhe3: 'dhe3' };
  const st = () => ({ rx: radioVal('gmRx'), T: +sT.value });
  const sim = reg([cv, cv2], {
    draw() {
      const s = st(), v = M.V.gamow(s), g = GAM[s.rx];
      { const { c, w, h } = fit(cv), xmax = Math.max(v.peak.E0 + 2.5 * v.peak.width, 4 * s.T);
        const f = frame(w, h, [28, 14, 40, 40], 0, xmax, 0, 1.08);
        yTicks(c, f, [0, 0.5, 1], y => F(N(y, 1))); axes(c, f, t('ch3.cv.x'), t('ch3.cv.y'));
        const raw = xmax / 4, p10 = Math.pow(10, Math.floor(Math.log10(raw))), step = [1, 2, 5, 10].map(m => m * p10).find(q => q >= raw - 1e-9), xs = [];
        for (let x = 0; x <= xmax + 1e-9; x += step) xs.push(+x.toFixed(6));
        xTicks(c, f, xs, x => F(N(x)));
        const n = 300, mb = [], tu = [], pr = []; let pmax = 0;
        const tmax = M.tunnel(g, xmax);
        for (let i = 1; i <= n; i++) { const E = xmax * i / n, p = M.gamowIntegrand(g, E, s.T); pmax = Math.max(pmax, p); mb.push([E, Math.exp(-E / s.T)]); tu.push([E, M.tunnel(g, E) / tmax]); pr.push([E, p]); }
        path(c, mb, f.X, f.Y, C.cyan, 1.6); path(c, tu, f.X, f.Y, C.violet, 1.6);
        path(c, pr.map(p => [p[0], p[1] / pmax]), f.X, f.Y, C.gold, 2.6);
        vline(c, f, v.peak.E0, C.gold, [2, 3]);
        label(c, 'E₀', f.X(v.peak.E0) + 5, f.T + 6, C.gold, 'left', f.L, f.R); }
      { const { c, w, h } = fit(cv2), f = frame(w, h, [28, 14, 40, 52], 0, 2, -26, -15);
        yTicks(c, f, [-26, -23, -20, -17, -15], e => pow10(e)); axes(c, f, t('ch3.cv2.x'), t('ch3.cv2.y'));
        xTicks(c, f, [0, 1, 2], e => F(N(Math.pow(10, e))));
        const col = { dt: C.gold, dd: C.cyan, dhe3: C.violet };
        for (const r of ['dhe3', 'dd', 'dt']) { const pts = []; for (let e = 0; e <= 2.0001; e += 0.01) { const lg = Math.log10(M.sigmaV(r, Math.pow(10, e))); pts.push([e, lg < -26 ? null : lg]); } path(c, pts, f.X, f.Y, col[r], r === s.rx ? 2.8 : 1.4); }
        const e = Math.log10(s.T); vline(c, f, e, C.mute, [2, 3]); const lg = Math.log10(M.sigmaV(s.rx, s.T)); if (lg >= -26) dot(c, f.X(e), f.Y(lg), col[s.rx]); }
    }
  });
  function text() { const v = M.V.gamow(st()); put('#gmTo', t('u.kev', { v: N(+sT.value) })); putRead({ e0: '#gmE0', e0T: '#gmE0T', sv: '#gmSv', ratio: '#gmRatio' }, v.read); putHTML('#gmSay', F(v.say)); }
  sim.text = text;
  watch([sT, ...radios('gmRx')], () => { sim.dirty = true; text(); });
  text();
})();

/* ───────── 04 Lawson diagram ───────── */
(() => {
  const cv = $('#lwCv'), sT = $('#lwT'), sN = $('#lwN');
  const curves = [[1, 'ch4.cv.q1', C.cyan], [10, 'ch4.cv.q10', C.green], [Infinity, 'ch4.cv.ign', C.red]].map(([Q, k, col]) => {
    const pts = []; for (let e = 0; e <= 2.0001; e += 0.01) { const v = M.tripleFor(Math.pow(10, e), Q); pts.push([e, isFinite(v) && Math.log10(v) <= 23 ? Math.log10(v) : null]); }
    return { Q, k, col, pts };
  });
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), f = frame(w, h, [30, 14, 40, 52], 0, 2, 19, 23);
      yTicks(c, f, [19, 20, 21, 22, 23], pow10); axes(c, f, t('ch4.cv.x'), t('ch4.cv.y'));
      xTicks(c, f, [0, 1, 2], e => F(N(Math.pow(10, e))));
      for (const cu of curves) path(c, cu.pts, f.X, f.Y, cu.col, 2);
      // legend in the empty lower-right corner (hot and poorly confined: no curve goes there), top-to-bottom in the curves' order
      [...curves].reverse().forEach((cu, i) => label(c, '— ' + t(cu.k), f.R - 6, f.B - 50 + i * 18, cu.col, 'right', f.L, f.R));
      dot(c, f.X(Math.log10(+sT.value)), f.Y(+sN.value), C.gold, 6);
    }
  });
  function text() { const v = M.V.lawson({ T: +sT.value, lg: +sN.value }); put('#lwTo', t('u.kev', { v: N(+sT.value, 1) })); put('#lwNo', F({ sci: Math.pow(10, +sN.value), d: 1 })); putRead({ q: '#lwQ', need: '#lwNeed', min: '#lwMin', self: '#lwSelf' }, v.read); putHTML('#lwSay', F(v.say)); }
  sim.text = text;
  watch([sT, sN], () => { sim.dirty = true; text(); });
  text();
})();

/* ───────── 05 guiding-centre orbits ───────── */
(() => {
  const cv = $('#orCv'), sP = $('#orPitch'), sQ = $('#orQ'), cT = $('#orTwist'), MA = M.MACH, SHOW = 2.5;
  const st = () => ({ sp: radioVal('orSp'), pitch: +sP.value, q: +sQ.value, twist: cT.checked });
  let cache = null, key = '';
  const ck = clock(SHOW, 1);
  function model() { const s = st(), k = JSON.stringify(s); if (k !== key) { key = k; const o = s.twist ? M.orbit(s.sp, s.pitch, s.q) : null; cache = { s, o, v: M.V.drift(s, o) }; ck.restart(); } return cache; }
  const sim = reg(cv, {
    step(dt) { if (ck.tick(dt)) this.dirty = true; if (this.dirty) { this.draw(); this.dirty = false; } },
    draw() {
      const { c, w, h } = fit(cv), m = model(), pad = 0.25, span = MA.a + pad;
      const sc = Math.min((w - 20) / (2 * span), (h - 40) / (2 * span)), cx = w / 2, cy = (h - 18) / 2;
      const X = R => cx + (R - MA.R0) * sc, Y = Z => cy - Z * sc;
      c.strokeStyle = C.mute; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, MA.a * sc, 0, 6.283); c.stroke();
      c.strokeStyle = C.line; c.setLineDash([4, 4]); c.lineWidth = 1.2; c.beginPath(); c.arc(cx, cy, MA.r0 * sc, 0, 6.283); c.stroke(); c.setLineDash([]);
      dot(c, cx, cy, C.dimfill, 3);
      const frac = ck.t / SHOW;
      let pts;
      if (!m.s.twist) { const zEnd = Math.sqrt(MA.a * MA.a - MA.r0 * MA.r0) * (M.SPECIES[m.s.sp].q > 0 ? 1 : -1); pts = [[MA.R0 + MA.r0, 0], [MA.R0 + MA.r0, zEnd * frac]]; }
      else { const all = m.o.pts; pts = all.slice(0, Math.max(2, Math.ceil(all.length * frac))); }
      path(c, pts, X, Y, m.s.twist && m.o.lost ? C.red : C.gold, 1.8);
      dot(c, X(MA.R0 + MA.r0), Y(0), C.cyan, 4);
      const last = pts[pts.length - 1]; dot(c, X(last[0]), Y(last[1]), C.gold, 4.5);
      c.textBaseline = 'middle';
      label(c, t('ch5.cv.in'), 6, h - 10, C.mute, 'left', 0, w);
      label(c, t('ch5.cv.out'), w - 6, h - 10, C.mute, 'right', 0, w);
      label(c, t('ch5.cv.wall'), cx + MA.a * sc * 0.72 + 6, cy - MA.a * sc * 0.72 - 6, C.mute, 'left', 0, w);
    }
  });
  function text() {
    const m = model();
    put('#orPitcho', F(N(+sP.value, 2))); put('#orQo', F(N(+sQ.value, 1)));
    sQ.disabled = false;
    putRead({ rho: '#orRho', vd: '#orVd', out: '#orOut', kind: '#orKind' }, m.v.read); putHTML('#orSay', F(m.v.say));
  }
  sim.text = text;
  watch([sP, sQ, cT, ...radios('orSp')], () => { sim.dirty = true; text(); });
  on('#orReplay', 'click', () => { ck.restart(); sim.dirty = true; });
  text();
})();

/* ───────── 06 sizing a tokamak ───────── */
(() => {
  const cv = $('#tkCv'), sB = $('#tkB'), sR = $('#tkR'), sT = $('#tkT'), sF = $('#tkF');
  const st = () => ({ preset: radioVal('tkP'), B: +sB.value, R: +sR.value, T: +sT.value, fG: +sF.value });
  const lgQ = Q => isFinite(Q) ? clamp(Math.log10(Math.max(Q, 1e-3)), -1, 2) : 2.2;
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), s = st(), f = frame(w, h, [30, 14, 40, 44], 1.5, 9, -1, 2.3);
      yTicks(c, f, [-1, 0, 1, 2], e => F(N(Math.pow(10, e), e < 0 ? 1 : 0))); axes(c, f, t('ch6.cv.x'), t('ch6.cv.y'));
      xTicks(c, f, [2, 4, 6, 8], x => F(N(x)));
      c.fillStyle = 'rgba(240,122,109,.10)'; c.fillRect(f.L + 1, f.T, f.R - f.L - 1, f.Y(2.1) - f.T);
      label(c, t('ch6.cv.ign'), f.L + 6, f.Y(2.2), C.red, 'left', f.L, f.R);
      const curve = B => { const pts = []; for (let R = 1.5; R <= 9.0001; R += 0.05) pts.push([R, lgQ(M.tokamak({ ...s, B, R }).Q)]); return pts; };
      path(c, curve(M.PRESETS.iter.B), f.X, f.Y, C.cyan, 1.4, [5, 4]);
      path(c, curve(M.PRESETS.sparc.B), f.X, f.Y, C.violet, 1.4, [5, 4]);
      path(c, curve(s.B), f.X, f.Y, C.gold, 2.4);
      hline(c, f, 0, C.line, [2, 3]);
      dot(c, f.X(s.R), f.Y(lgQ(M.tokamak(s).Q)), C.gold, 6);
    }
  });
  function text() {
    const s = st(), v = M.V.tokamak(s);
    put('#tkBo', t('u.tesla', { v: N(s.B, 1) })); put('#tkRo', t('u.m', { v: N(s.R, 2) })); put('#tkTo', t('u.kev', { v: N(s.T, 1) })); put('#tkFo', t('u.pct', { v: N(s.fG * 100) }));
    putRead({ I: '#tkI', n: '#tkN', tau: '#tkTau', pf: '#tkPf', q: '#tkQ', bn: '#tkBn' }, v.read);
    putHTML('#tkSay', F(v.say) + ' ' + F(v.say2));
  }
  sim.text = text;
  const redo = () => { sim.dirty = true; text(); };
  watch([sB, sR, sT, sF], redo);
  watch(radios('tkP'), () => { const P = M.PRESETS[radioVal('tkP')]; sB.value = P.B; sR.value = P.R; sT.value = P.T; sF.value = P.fG; redo(); });
  text();
})();

/* ───────── 07 inertial confinement ───────── */
(() => {
  const cv = $('#icCv'), sRho = $('#icRho'), sM = $('#icM'), sE = $('#icEta');
  const st = () => ({ rho: Math.pow(10, +sRho.value), m: +sM.value, eta: +sE.value / 100 });
  const best = M.nifShots().reduce((b, s) => (s.G || 0) > (b.G || 0) ? s : b), plantG = M.FRONTIER.facts.plantGE / (M.FRONTIER.facts.etaDriver / 100);
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), s = st(), f = frame(w, h, [30, 14, 40, 44], 1.7, 3.5, -3, 3);
      yTicks(c, f, [-3, -2, -1, 0, 1, 2, 3], pow10); axes(c, f, t('ch7.cv.x'), t('ch7.cv.y'));
      xTicks(c, f, [2, 2.5, 3, 3.5].filter(x => x <= 3.5), e => F(N(Math.pow(10, e), 0)));
      hline(c, f, 0, C.mute); hline(c, f, Math.log10(best.G), C.violet); hline(c, f, Math.log10(plantG), C.green);
      label(c, t('ch7.cv.g1'), f.L + 6, f.Y(0) - 10, C.mute, 'left', f.L, f.R);
      label(c, t('ch7.cv.nif') + ' ' + F(N(best.G, 2)), f.L + 6, f.Y(Math.log10(best.G)) - 10, C.violet, 'left', f.L, f.R);
      label(c, t('ch7.cv.plant'), f.L + 6, f.Y(Math.log10(plantG)) - 10, C.green, 'left', f.L, f.R);
      const fit1 = [], nofit = [];
      for (let e = 1.7; e <= 3.5001; e += 0.01) { const x = M.icf(Math.pow(10, e), s.m, s.eta), lg = Math.log10(x.G); const p = [e, lg < -3 || lg > 3 ? null : lg]; (x.hsFits ? fit1 : nofit).push(p); if (x.hsFits) nofit.push(null); else fit1.push(null); }
      path(c, nofit, f.X, f.Y, C.dimfill, 2, [4, 4]); path(c, fit1, f.X, f.Y, C.gold, 2.4);
      const x = M.icf(s.rho, s.m, s.eta), lg = Math.log10(x.G);
      if (lg >= -3 && lg <= 3) dot(c, f.X(Math.log10(s.rho)), f.Y(lg), x.hsFits ? C.gold : C.mute, 6);
    }
  });
  function text() {
    const s = st(), v = M.V.icf(s);
    put('#icRhoo', t('u.density', { v: N(s.rho) })); put('#icMo', t('u.mg', { v: N(s.m, 2) })); put('#icEtao', t('u.pct', { v: N(s.eta * 100, 1) }));
    putRead({ rhoR: '#icRhoR', f: '#icF', Y: '#icY', E: '#icE', G: '#icG', sym: '#icSym' }, v.read); putHTML('#icSay', F(v.say));
  }
  sim.text = text;
  watch([sRho, sM, sE], () => { sim.dirty = true; text(); });
  text();
})();

/* ───────── 08 power flow ───────── */
(() => {
  const cv = $('#skCv'), sQ = $('#skQ'), sE = $('#skEta');
  const st = () => ({ Q: Math.pow(10, +sQ.value), etaH: +sE.value / 100 });
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), p = M.V.plant(st()).p, L0 = 12, W = w - 24, rows = 4, rowH = (h - 20) / rows, bh = Math.min(26, rowH * 0.42);
      const scale = W / Math.max(p.Pth, p.recirc, p.gross);
      const rowsDef = [
        [['ch8.cv.plasma', M.PLANT.Ph, C.cyan], ['ch8.cv.loss', p.heaterLoss, C.dimfill]],
        [['ch8.cv.fus', p.Pblanket + p.Pa, C.red], ['ch8.cv.plasma', M.PLANT.Ph, C.cyan]],
        [['ch8.cv.gross', p.gross, C.gold], ['ch8.cv.waste', p.lossHeat, C.dimfill]],
        p.net >= 0 ? [['ch8.cv.net', p.net, C.green], ['ch8.cv.back', p.recirc, C.violet]] : [['ch8.cv.back', p.gross, C.violet]]
      ];
      // each row says what it is and how much: heating draw, heat, the part of the heat turned into electricity, the part of that sold
      const titles = [['ch8.cv.r1', p.recirc], ['ch8.cv.r2', p.Pth], ['ch8.cv.r3', p.gross], p.net >= 0 ? ['ch8.cv.r4', p.net] : ['ch8.cv.r4neg', -p.net]];
      rowsDef.forEach((segs, i) => {
        const y = 10 + i * rowH + rowH - bh - 6; let x = L0;
        label(c, t(titles[i][0], { v: N(titles[i][1]) }), L0, y - 11, C.mute, 'left', 0, w);
        for (const [k, v, col] of segs) {
          const sw = Math.max(1.5, v * scale); c.fillStyle = col; c.fillRect(x, y, sw, bh);
          c.font = FONT; const s = t(k); if (c.measureText(s).width + 8 < sw) { c.fillStyle = '#0f1219'; c.textAlign = 'left'; c.fillText(s, x + 4, y + bh / 2); }
          x += sw;
        }
        if (i === 3 && p.net < 0) { const gap = -p.net * scale; c.strokeStyle = C.red; c.setLineDash([4, 3]); c.strokeRect(x, y, gap, bh); c.setLineDash([]); }
      });
    }
  });
  function text() {
    const s = st(), v = M.V.plant(s);
    put('#skQo', F(N(s.Q, s.Q < 10 ? 1 : 0))); put('#skEtao', t('u.pct', { v: N(s.etaH * 100) }));
    putRead({ pf: '#skPf', th: '#skTh', gross: '#skGross', re: '#skRe', net: '#skNet', qe: '#skQe' }, v.read); putHTML('#skSay', F(v.say));
  }
  sim.text = text;
  watch([sQ, sE], () => { sim.dirty = true; text(); });
  text();
})();

/* ───────── 09a tritium ───────── */
(() => {
  const cv = $('#trCv'), sP = $('#trP'), sF = $('#trFb'), sT = $('#trTbr'), YEARS = 20, stock = M.FRONTIER.tritium.stock;
  const st = () => ({ P: +sP.value, fb: Math.pow(10, +sF.value), tbr: +sT.value });
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), s = st(), inv = M.inventory(s.P, s.fb, s.tbr, YEARS), tr = M.tritium(s.P, s.fb, s.tbr);
      const ymax = Math.max(40, Math.ceil(Math.max(...inv.map(p => p[1])) / 10) * 10);
      const f = frame(w, h, [30, 14, 40, 44], 0, YEARS, 0, ymax), step = ymax > 100 ? 50 : ymax > 50 ? 20 : 10, ys = [];
      for (let y = 0; y <= ymax; y += step) ys.push(y);
      yTicks(c, f, ys, y => F(N(y))); axes(c, f, t('ch9.cv.x'), t('ch9.cv.y')); xTicks(c, f, [0, 5, 10, 15, 20], x => F(N(x)));
      c.fillStyle = 'rgba(122,214,160,.14)'; c.fillRect(f.L + 1, f.Y(stock[1]), f.R - f.L - 1, f.Y(stock[0]) - f.Y(stock[1]));
      label(c, t('ch9.cv.stock'), f.R - 4, f.Y((stock[0] + stock[1]) / 2), C.green, 'right', f.L, f.R);
      hline(c, f, tr.start, C.mute, [2, 3]);
      path(c, inv, f.X, f.Y, C.gold, 2.4);
      label(c, t('ch9.cv.start'), f.L + 6, f.Y(tr.start) + (f.Y(tr.start) > f.B - 20 ? -12 : 12), C.mute, 'left', f.L, f.R);
    }
  });
  function text() {
    const s = st(), v = M.V.tritium(s);
    put('#trPo', t('u.gw', { v: N(s.P, 1) })); put('#trFbo', t('u.pct', { v: N(s.fb * 100, s.fb < 0.01 ? 2 : 1) })); put('#trTbro', F(N(s.tbr, 2)));
    putRead({ day: '#trDay', start: '#trStart', td: '#trTd', yr: '#trYr' }, v.read); putHTML('#trSay', F(v.say));
  }
  sim.text = text;
  watch([sP, sF, sT], () => { sim.dirty = true; text(); });
  text();
})();

/* ───────── 09b wall and divertor ───────── */
(() => {
  const cv = $('#whCv'), sP = $('#whP'), sR = $('#whR'), sF = $('#whF');
  const st = () => ({ P: +sP.value, R: +sR.value, frad: +sF.value / 100 });
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), e = M.V.wall(st()).e, L0 = 14, W = w - 28, rowH = (h - 10) / 3, bh = 14, lim = M.FRONTIER.eich.target;
      const bars = [
        { k: 'ch9.cv.load', frac: e.load / 4, col: C.red, ticks: [0, 1, 2, 3, 4].map(v => [v / 4, F(N(v))]) },
        { k: 'ch9.cv.years', frac: Math.min(1, e.years / 40), col: C.cyan, ticks: [0, 10, 20, 30, 40].map(v => [v / 40, F(N(v))]) },
        { k: 'ch9.cv.qt', frac: clamp((Math.log10(Math.max(e.qt, 0.1)) + 1) / 4, 0, 1), col: e.qt > lim ? C.red : C.gold, ticks: [-1, 0, 1, 2, 3].map(v => [(v + 1) / 4, F(N(Math.pow(10, v), v < 0 ? 1 : 0))]), limit: (Math.log10(lim) + 1) / 4 }
      ];
      bars.forEach((b, i) => {
        const y = 8 + i * rowH + 22;
        label(c, t(b.k), L0, y - 12, C.mute, 'left', 0, w);
        c.fillStyle = C.grid; c.fillRect(L0, y, W, bh); c.fillStyle = b.col; c.fillRect(L0, y, Math.max(2, W * Math.min(1, b.frac)), bh);
        c.fillStyle = C.mute; c.textAlign = 'center';
        b.ticks.forEach(([fx, s]) => c.fillText(s, clamp(L0 + W * fx, L0 + 8, L0 + W - 8), y + bh + 11));
        if (b.limit != null) { const x = L0 + W * b.limit; c.strokeStyle = C.ink; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y - 4); c.lineTo(x, y + bh + 4); c.stroke(); }
      });
    }
  });
  function text() {
    const s = st(), v = M.V.wall(s);
    put('#whPo', t('u.mw', { v: N(s.P) })); put('#whRo', t('u.m', { v: N(s.R, 1) })); put('#whFo', t('u.pct', { v: N(s.frad * 100) }));
    putRead({ load: '#whLoad', yrs: '#whYrs', lq: '#whLq', qt: '#whQt', need: '#whNeed' }, v.read); putHTML('#whSay', F(v.say));
  }
  sim.text = text;
  watch([sP, sR, sF], () => { sim.dirty = true; text(); });
  text();
})();

/* ───────── 10 frontier ───────── */
(() => {
  const cv = $('#fxCv'), cv2 = $('#nfCv'), cP = $('#fxProj'), cN = $('#fxNif'), FR = M.FRONTIER;
  const ign = Math.log10(M.minTriple(Infinity).ntt), q1 = Math.log10(M.minTriple(1).ntt), rec = M.frontierRecord();
  const sim = reg([cv, cv2], {
    draw() {
      { const { c, w, h } = fit(cv), f = frame(w, h, [30, 16, 40, 52], 1965, 2042, 16, 23);
        yTicks(c, f, [16, 17, 18, 19, 20, 21, 22, 23], pow10); axes(c, f, t('ch10.cv.x'), t('ch10.cv.y'));
        xTicks(c, f, [1970, 1990, 2010, 2030], x => String(x));
        hline(c, f, ign, C.red); hline(c, f, q1, C.cyan);
        label(c, t('ch10.cv.ign'), f.L + 6, f.Y(ign) - 10, C.red, 'left', f.L, f.R);
        label(c, t('ch10.cv.q1'), f.L + 6, f.Y(q1) + 10, C.cyan, 'left', f.L, f.R);
        const col = { tok: C.gold, stel: C.cyan, icf: C.violet };
        for (const p of FR.triple) {
          if (p.proj && !cP.checked) continue; if (p.kind === 'icf' && !cN.checked) continue;
          const x = f.X(p.y), y = f.Y(Math.log10(p.v));
          if (p.kind === 'icf') { c.fillStyle = col.icf; c.beginPath(); c.moveTo(x, y - 6); c.lineTo(x + 6, y); c.lineTo(x, y + 6); c.lineTo(x - 6, y); c.fill(); }
          else dot(c, x, y, col[p.kind], p.proj ? 5 : 4, p.proj);
        }
        label(c, rec.id + ' ' + rec.y, f.X(rec.y) - 8, f.Y(Math.log10(rec.v)) - 2, C.gold, 'right', f.L, f.R);
        if (cN.checked) { const n = FR.triple.find(p => p.kind === 'icf'); label(c, n.id, f.X(n.y) - 9, f.Y(Math.log10(n.v)), C.violet, 'right', f.L, f.R); }
        if (cP.checked) for (const p of FR.triple.filter(q => q.proj)) label(c, p.id, f.X(p.y), f.Y(Math.log10(p.v)) + (p.id === 'ITER' ? -14 : 14), C.mute, 'center', f.L, f.R); }
      { const { c, w, h } = fit(cv2), shots = M.nifShots(), n = shots.length, f = frame(w, h, [24, 10, 40, 36], 0, n, 0, 10);
        yTicks(c, f, [0, 2, 4, 6, 8, 10], y => F(N(y))); axes(c, f, '', t('ch10.cv2.y'));
        const gw = (f.R - f.L) / n, bw = Math.max(3, gw * 0.34); let lastY = null, lastX = null;
        shots.forEach((s, i) => {
          const x0 = f.L + i * gw + gw / 2;
          if (s.L) { c.fillStyle = C.bar; c.fillRect(x0 - bw - 1, f.Y(s.L), bw, f.B - f.Y(s.L)); }
          c.fillStyle = C.gold; c.fillRect(x0 + 1, f.Y(s.Y), bw, f.B - f.Y(s.Y));
          // a year is written under its first shot unless the previous year's text would touch it (narrow screens)
          const yr = s.d.slice(0, 4); if (yr !== lastY) { if (lastX == null || x0 - lastX >= c.measureText(yr).width + 6) { lastX = x0; c.fillStyle = C.mute; c.textAlign = 'center'; c.fillText(yr, x0, f.B + 12); } c.strokeStyle = C.line; c.beginPath(); c.moveTo(f.L + i * gw, f.B); c.lineTo(f.L + i * gw, f.B + 18); c.stroke(); lastY = yr; }
          if (gw > 40 && s.G) { c.fillStyle = C.ink; c.textAlign = 'center'; c.fillText('×' + F(N(s.G, 1)), x0, f.Y(s.Y) - 9); }
        }); }
    }
  });
  function text() {
    const v = M.V.frontier({ proj: cP.checked, nif: cN.checked });
    putRead({ rec: '#fxRec', gap: '#fxGap', nifG: '#fxNifG', jet: '#fxJet' }, v.read);
    putHTML('#fxSay', v.says.map(F).join(' '));
  }
  sim.text = text;
  watch([cP, cN], () => { sim.dirty = true; text(); });
  text();
})();

/* ───────── 11 funding ───────── */
(() => {
  const cv = $('#fdCv'), FU = M.FUNDING, D = M.deflator();
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), sel = radioVal('fdL'), f = frame(w, h, [30, 14, 40, 52], 1975.5, 2005.5, 0, 5500);
      yTicks(c, f, [0, 1000, 2000, 3000, 4000, 5000], y => F(N(y))); axes(c, f, t('ch11.cv.x'), t('ch11.cv.y'));
      xTicks(c, f, [1980, 1990, 2000], x => String(x));
      const bw = Math.max(2, (f.R - f.L) / 30 * 0.7);
      c.fillStyle = C.dimfill; for (const y in FU.crs) { const v = FU.crs[y]; c.fillRect(f.X(+y) - bw / 2, f.Y(v), bw, f.B - f.Y(v)); }
      const col = { I: C.mute, II: C.cyan, III: C.green, V: C.red };
      for (const id of ['I', 'II', 'III', 'V']) {
        const pts = []; for (let y = FU.fy0; y <= 2005; y++) { const p = M.logicAt(id, y); pts.push(p == null ? null : [y, p * D]); }
        path(c, pts, f.X, f.Y, col[id], id === sel ? 3 : 1.3, id === 'I' ? [6, 4] : null);
        const dm = FU.logic[id].demo;
        if (id === sel && dm) { const y = M.logicAt(id, dm) * D; dot(c, f.X(dm), f.Y(y), col[id], 5.5); label(c, t('ch11.cv.demo') + ' ' + dm, f.X(dm) - 8, f.Y(y) - 14, col[id], 'right', f.L, f.R); }
      }
    }
  });
  function text() { const v = M.V.funding({ logic: radioVal('fdL') }); putRead({ demo: '#fdDemo', plan: '#fdPlan', act: '#fdAct', ratio: '#fdRatio' }, v.read); putHTML('#fdSay', F(v.say)); }
  sim.text = text;
  watch(radios('fdL'), () => { sim.dirty = true; text(); });
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
