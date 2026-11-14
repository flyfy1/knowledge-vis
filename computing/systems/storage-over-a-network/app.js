/* Storage over a network: wiring, drawing, i18n and on-screen gating. All visible text comes from copy.*.js. */
(() => {
'use strict';
const M = window.NetStoreModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const C = { bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', dimfill: '#3a4254' };
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const D = M.DEFAULTS;

/* ───────── language ─────────
   copy.en.js may be a same-keys stub copied from zh while the translation is pending; it then sets
   window.ESSAY_COPY.enStub = true and the page treats English as absent (falls back to zh). */
const LS = 'knowledge-lang';
let memLang = null;
function readLang() { try { return localStorage.getItem(LS); } catch (e) { return memLang; } }
function writeLang(v) { memLang = v; try { localStorage.setItem(LS, v); } catch (e) { /* in-memory fallback */ } }
let lang = readLang();
if (lang !== 'zh' && lang !== 'en') lang = /^zh/i.test(navigator.language || '') ? 'zh' : 'en';
const hasLang = l => !!COPY[l] && !(l === 'en' && COPY.enStub);
const effLang = () => (hasLang(lang) ? lang : 'zh');
function t(key, vars) {
  const L = effLang();
  let s = (COPY[L] && COPY[L][key] != null) ? COPY[L][key] : (COPY.zh && COPY.zh[key] != null ? COPY.zh[key] : key);
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => vars[k] != null ? vars[k] : m);
  return s;
}
const fmt = (x, d) => M.fmt(x, d, effLang());
const auto = v => (Math.abs(v) >= 100 ? 0 : Math.abs(v) >= 10 ? 1 : 2);
const pct = (x, d) => t('u.pct', { v: fmt(x * 100, d == null ? (x === 0 ? 0 : x < 0.01 ? 2 : x < 0.1 || (x > 0.99 && x < 1) ? 1 : 0) : d) });
function dur(sec, d) { if (sec === 0) return t('u.us', { v: fmt(0, 0) }); const u = M.tunit(sec); return t('u.' + u.u, { v: fmt(u.v, d == null ? auto(u.v) : d) }); }
function bytes(b) { const u = M.bunit(b); return t('u.' + u.u, { v: fmt(u.v, u.u === 'B' || Number.isInteger(u.v) ? 0 : auto(u.v)) }); }
const times = x => t('u.x', { v: fmt(x, x >= 10 ? 0 : 1) });
const mbs = x => t('u.MBps', { v: fmt(x, x >= 100 ? 0 : x >= 1 ? 1 : x >= 0.01 ? 2 : 3) });
// numbers quoted in the prose, computed from the models and formatted for the current language
let PROSE = null;
function proseVars() { PROSE = PROSE || M.prose(); const o = {}; for (const [k, [v, d, kind]] of Object.entries(PROSE)) o[k] = kind === 'pct' ? pct(v, d) : fmt(v, d); return o; }
function applyLang() {
  const PV = proseVars();
  document.documentElement.lang = effLang() === 'zh' ? 'zh-CN' : 'en';
  document.title = t('doc.title');
  const md = document.querySelector('meta[name=description]');
  if (md) md.content = t('doc.desc');
  document.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(e => { e.innerHTML = t(e.dataset.i18nHtml, PV); });
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
const io = new IntersectionObserver(es => es.forEach(e => { for (const s of sims) if (s.cvs.includes(e.target)) { e.target.__vis = e.isIntersecting; s.vis = s.cvs.some(cv => cv.__vis); s.dirty = true; } }), { rootMargin: '60px' });
function reg(cvs, o) { o.cvs = [].concat(cvs); o.vis = false; o.dirty = true; sims.push(o); o.cvs.forEach(cv => io.observe(cv)); return o; }
window.addEventListener('resize', () => sims.forEach(s => { s.dirty = true; }));
const radios = name => [...document.querySelectorAll(`input[name=${name}]`)];
const radioVal = name => radios(name).find(r => r.checked).value;
const put = (sel, s) => { const e = $(sel); if (e.textContent !== s) e.textContent = s; };
const putHTML = (sel, s) => { const e = $(sel); if (e.__h !== s) { e.innerHTML = s; e.__h = s; } };
const onAll = (els, ev, fn) => els.forEach(e => e.addEventListener(ev, fn));
function wire(sim, text, ranges, radioNames, checks) {
  sim.text = text;
  const go = () => { sim.dirty = true; if (sim.reset) sim.reset(); text(); };
  (ranges || []).forEach(r => $(r).addEventListener('input', go));
  (radioNames || []).forEach(n => onAll(radios(n), 'change', go));
  (checks || []).forEach(c => $(c).addEventListener('change', go));
  text();
}

function axes(c, L, R, T, B, xLab, yLab) {
  c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(L, T); c.lineTo(L, B); c.lineTo(R, B); c.stroke();
  c.fillStyle = C.mute; c.font = FONT;
  if (yLab) { c.textAlign = 'left'; c.fillText(yLab, L + 6, T - 10); }
  if (xLab) { c.textAlign = 'right'; c.fillText(xLab, R, B + 28); }
}
function spacedTicks(c, items, y) { let lastR = -Infinity; const cw = c.canvas.clientWidth; c.textAlign = 'center'; c.fillStyle = C.mute; for (const [x0, s] of items) { const w = c.measureText(s).width, x = Math.max(w / 2 + 2, Math.min(cw - w / 2 - 2, x0)); if (x - w / 2 < lastR + 6) continue; c.fillText(s, x, y); lastR = x + w / 2; } }
function yTicks(c, L, R, Y, vals, fmtv) {
  c.fillStyle = C.mute; c.textAlign = 'right';
  let lastY = Infinity;
  vals.forEach(v => { const y = Y(v); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(L + 1, y); c.lineTo(R, y); c.stroke(); if (Math.abs(lastY - y) >= 14) { c.fillText(fmtv(v), L - 6, y); lastY = y; } });
}
function path(c, pts, col, lw, dash) { c.strokeStyle = col; c.lineWidth = lw || 2.2; c.lineJoin = 'round'; if (dash) c.setLineDash(dash); c.beginPath(); let on = false; for (const p of pts) { if (p == null) { on = false; continue; } c[on ? 'lineTo' : 'moveTo'](p[0], p[1]); on = true; } c.stroke(); c.setLineDash([]); }
function tag(c, s, x, y, col, align) { c.font = FONT; const w = c.measureText(s).width; const x0 = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x; c.fillStyle = C.bg; c.fillRect(x0 - 3, y - 8, w + 6, 16); c.fillStyle = col; c.textAlign = 'left'; c.fillText(s, x0, y); return [x0 - 3, x0 + w + 3]; }
function dot(c, x, y, col, r) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r || 4.5, 0, 6.283); c.fill(); }
function labelFont(c, labels, cap) { c.font = FONT; let lw = 0; for (const s of labels) lw = Math.max(lw, c.measureText(s).width); const k = lw + 14 > cap ? Math.max(0.7, (cap - 14) / lw) : 1; return { font: FONT.replace('12px', (12 * k).toFixed(1) + 'px'), w: Math.min(lw * k + 14, cap) }; }
const log10 = Math.log10;
// sliders that step through a fixed list of values (so the page's defaults are exact)
const LIST = {
  nsR: [0.05, 0.1, 0.2, 0.3, 0.5, 1, 2, 5, 10, 20, 30, 50, 100],            // ms
  isR: [0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50],                    // ms
  fcD: [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 150, 200],                  // km
  fcC: [2, 4, 8, 16, 24, 40, 64, 100, 160, 250, 400, 640, 1000, 1600, 2000], // credits
  lsR: [2, 5, 10, 20, 50, 100, 200, 500],                                   // µs
  ecM: [1, 2, 4, 8, 12, 24, 48, 72, 168, 336]                               // hours
};
const lv = id => LIST[id][+$('#' + id).value];
// integer powers of ten for axis ticks (10⁻⁷ … 10⁻¹); never a fractional exponent
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const sup = e => '10' + String(e).split('').map(ch => SUP[ch]).join('');
// a small probability as a percentage with enough decimals to show two significant digits
const lossPct = q => pct(q, Math.max(0, Math.min(6, 1 - Math.floor(log10(q * 100)))));

/* ───────── 01 block / file / object ───────── */
(() => {
  const cv = $('#lvCv'), sK = $('#lvK'), cb = $('#lvC');
  const k = () => Math.pow(2, +sK.value), S = () => +radioVal('lvS'), cached = () => cb.checked;
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), r = M.LEVEL.cost(Math.min(k(), S()), S(), cached());
      const labs = ['ch1.lv.block', 'ch1.lv.file', 'ch1.lv.object'].map(x => t(x)), lf = labelFont(c, labs, Math.min(110, w * 0.28));
      const L = lf.w, R = w - 14, T = 10, B = h - 34, X = b => L + (R - L) * Math.log2(Math.max(1, b)) / 31, rh = (B - T) / 3;
      const ticks = [[1, '1 B'], [1024, '1 KiB'], [1048576, '1 MiB'], [1073741824, '1 GiB']].map(([b, s]) => [X(b), s]);
      c.strokeStyle = C.grid; ticks.forEach(([x]) => { c.beginPath(); c.moveTo(x, T); c.lineTo(x, B); c.stroke(); });
      spacedTicks(c, ticks, B + 11); c.textAlign = 'right'; c.fillStyle = C.mute; c.fillText(t('ch1.cv.x'), R, B + 26);
      [[r.block, C.cyan], [r.file, C.green], [r.object, C.gold]].forEach(([o, col], i) => {
        const y = T + i * rh + rh * 0.2, bh = rh * 0.6;
        c.font = lf.font; c.fillStyle = C.ink; c.textAlign = 'right'; c.fillText(labs[i], L - 8, y + bh / 2); c.font = FONT;
        c.fillStyle = col; c.fillRect(L, y, Math.max(2, X(o.bytes) - L), bh);
      });
      const xk = X(Math.min(k(), S())); c.strokeStyle = C.ink; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(xk, T); c.lineTo(xk, B); c.stroke(); c.setLineDash([]);
    }
  });
  function text() {
    const kk = Math.min(k(), S()), z = M.say.level(kk, S(), cached()), v = z.v;
    put('#lvKo', bytes(kk));
    put('#lvB', bytes(v.b)); put('#lvF', bytes(v.f)); put('#lvO', bytes(v.o));
    putHTML('#lvSay', t(z.key, { k: bytes(v.k), b: bytes(v.b), f: bytes(v.f), o: bytes(v.o), ab: times(v.ab), ao: times(v.ao) }));
  }
  wire(sim, text, ['#lvK'], ['lvS'], ['#lvC']);
})();

/* ───────── 02 many small files ───────── */
(() => {
  const cv = $('#nsCv'), N = D.nas.N;
  const s = () => Math.pow(2, +$('#nsS').value), rtt = () => lv('nsR'), k = () => +radioVal('nsK'), P = () => +radioVal('nsP'), g = () => +radioVal('nsG');
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), L = 58, R = w - 14, T = 26, B = h - 40;
      const xs = []; for (let e = 2; e <= 14.0001; e += 0.1) xs.push(Math.pow(2, e));
      const many = xs.map(x => M.NAS.run(N, x, rtt(), k(), P(), g()).T), big = xs.map(x => M.NAS.run(N, x, rtt(), k(), P(), g()).big);
      const lo = Math.floor(log10(Math.min(...big))), hi = Math.ceil(log10(Math.max(...many)));
      const X = x => L + (R - L) * (Math.log2(x) - 2) / 12, Y = y => B - (B - T) * (log10(y) - lo) / Math.max(1, hi - lo);
      const yv = []; for (let e = lo; e <= hi; e++) yv.push(Math.pow(10, e));
      yTicks(c, L, R, Y, yv, v => dur(v, 0));
      axes(c, L, R, T, B, t('ch2.cv.x'), t('ch2.cv.y'));
      spacedTicks(c, [4, 64, 1024, 16384].map(v => [X(v), bytes(v * 1024)]), B + 12);
      path(c, xs.map((x, i) => [X(x), Y(big[i])]), C.cyan, 2);
      path(c, xs.map((x, i) => [X(x), Y(many[i])]), C.gold, 2.4);
      const r = M.NAS.run(N, s(), rtt(), k(), P(), g());
      dot(c, X(s()), Y(r.T), C.gold); dot(c, X(s()), Y(r.big), C.cyan);
    }
  });
  function text() {
    const r = M.NAS.run(N, s(), rtt(), k(), P(), g()), z = M.say.nas(N, s(), rtt(), k(), P(), g()), v = z.v;
    put('#nsSo', bytes(s() * 1024)); put('#nsRo', dur(rtt() / 1000));
    put('#nsT', dur(r.T)); put('#nsB', dur(r.big)); put('#nsX', times(r.ratio)); put('#nsU', pct(r.util));
    putHTML('#nsSay', t(z.key, { k: k(), T: dur(v.T), big: dur(v.big), ratio: times(v.ratio), util: pct(v.util), sStar: bytes(v.sStar * 1024) }));
  }
  wire(sim, text, ['#nsS', '#nsR'], ['nsK', 'nsP', 'nsG']);
})();

/* ───────── 03 iSCSI write ───────── */
(() => {
  const cv = $('#isCv');
  const W = () => Math.pow(2, +$('#isW').value), rtt = () => lv('isR'), prof = () => radioVal('isP'), g = () => +radioVal('isG');
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), r = M.ISCSI.write(W(), rtt(), g(), prof());
      const L = 14, R = w - 14, y = h * 0.42, bh = 34, rt = rtt() / 1000, X = s => L + (R - L) * s / r.T;
      let x = 0; const marks = [];
      r.bursts.forEach((b, i) => {
        const dw = r.tWire * b / W();
        if (b > 0) { c.fillStyle = C.gold; c.fillRect(X(x), y - bh / 2, Math.max(1, X(x + dw) - X(x)), bh); x += dw; }
        c.fillStyle = C.red; c.fillRect(X(x), y - bh / 2, Math.max(1, X(x + rt) - X(x) - 1), bh); marks.push([X(x + rt / 2), i + 1]); x += rt;
      });
      c.strokeStyle = C.line; c.strokeRect(L, y - bh / 2, R - L, bh);
      const items = marks.map(([mx, i]) => [mx, t('ch3.cv.rt', { n: i })]);
      c.font = FONT; spacedTicks(c, items, y + bh / 2 + 16);
      c.textAlign = 'left'; c.fillStyle = C.mute; c.fillText('0', L, y - bh / 2 - 12); c.textAlign = 'right'; c.fillText(dur(r.T), R, y - bh / 2 - 12);
    }
  });
  function text() {
    const r = M.ISCSI.write(W(), rtt(), g(), prof()), z = M.say.iscsi(W(), rtt(), g(), prof()), v = z.v;
    put('#isWo', bytes(W())); put('#isRo', dur(rtt() / 1000));
    put('#isRt', fmt(r.rounds, 0)); put('#isPdu', fmt(r.pdus, 0)); put('#isT', dur(r.T)); put('#isMB', mbs(r.MBps));
    putHTML('#isSay', t(z.key, { rt: fmt(v.rt, 0), r2t: fmt(v.r2t, 0), wait: pct(v.wait), T: dur(v.T), MBps: mbs(v.MBps) }));
  }
  wire(sim, text, ['#isW', '#isR'], ['isP', 'isG']);
})();

/* ───────── 04 Fibre Channel credits (animated link + utilisation curve) ───────── */
(() => {
  const cv = $('#fcCv'), cv2 = $('#fc2Cv');
  const g = () => +radioVal('fcG'), km = () => lv('fcD'), cr = () => lv('fcC'), pl = () => +radioVal('fcF');
  let S = null;
  function reset() {
    const r = M.FC.run(g(), km(), cr(), pl());
    S = { r, t: 0, next: 0, credits: cr(), frames: [], back: [] };
    if (reduce) advance(5 * (r.rtt + r.tf) + 0.5 * r.tp); // still frame: the burst halfway down the fibre
  }
  function advance(to) {
    const { r } = S;
    for (let guard = 0; guard < 200000; guard++) {
      const tb = S.back.length ? S.back[0] : Infinity, tl = S.credits > 0 ? S.next : Infinity, te = Math.min(tb, tl);
      if (te > to) break;
      if (tb <= tl) { S.back.shift(); S.credits++; if (S.next < tb) S.next = tb; }
      else { S.frames.push(S.next); S.back.push(S.next + r.tf + r.rtt); S.credits--; S.next += r.tf; }
    }
    S.t = to;
    const tp = r.tp; while (S.frames.length && S.frames[0] + r.tf + tp < S.t) S.frames.shift();
  }
  const sim = reg([cv, cv2], {
    step(dt) {
      if (!S) reset();
      if (reduce) { if (this.dirty) { this.draw(); this.dirty = false; } return; }
      advance(S.t + dt * Math.max(S.r.rtt, 3 * S.r.tf) / 3);
      this.draw();
    },
    draw() {
      if (!S) reset();
      { const { c, w, h } = fit(cv), r = S.r, L = 70, R = w - 70, y = h * 0.5;
        c.fillStyle = C.mute; c.textAlign = 'center'; c.fillText(t('ch4.cv.tx'), 34, y); c.fillText(t('ch4.cv.rx'), w - 34, y);
        c.strokeStyle = C.line; c.lineWidth = 2; c.beginPath(); c.moveTo(L, y - 8); c.lineTo(R, y - 8); c.moveTo(L, y + 10); c.lineTo(R, y + 10); c.stroke();
        const len = R - L, fw = Math.max(1.5, len * r.tf / Math.max(r.tp, 1e-9));
        c.fillStyle = C.gold;
        for (const f of S.frames) { const head = (S.t - f) / r.tp; if (head < 0) continue; const x1 = L + len * Math.min(1, head), x0 = Math.max(L, x1 - fw); if (x1 > x0) c.fillRect(x0, y - 14, x1 - x0, 12); }
        c.fillStyle = C.cyan;
        for (const b of S.back) { const start = b - r.tp; if (S.t < start) continue; const x = R - len * (S.t - start) / r.tp; dot(c, x, y + 10, C.cyan, 3); }
        c.textAlign = 'center'; c.fillStyle = C.ink; c.fillText(t('ch4.cv.credit', { n: fmt(S.credits, 0) }), (L + R) / 2, h - 14);
      }
      { const { c, w, h } = fit(cv2), L = 50, R = w - 14, T = 26, B = h - 40;
        const X = k => L + (R - L) * (log10(k) + 1) / 3.3, Y = u => B - (B - T) * u;
        yTicks(c, L, R, Y, [0, 0.25, 0.5, 0.75, 1], v => pct(v, 0));
        axes(c, L, R, T, B, t('ch4.cv.x'), t('ch4.cv.y'));
        spacedTicks(c, [0.1, 1, 10, 100].map(v => [X(v), fmt(v, v < 1 ? 1 : 0)]), B + 12);
        const pts = []; for (let e = -1; e <= 2.3001; e += 0.02) { const kk = Math.pow(10, e); pts.push([X(kk), Y(M.FC.run(g(), kk, cr(), pl()).util)]); }
        path(c, pts, C.gold, 2.4);
        dot(c, X(km()), Y(S.r.util), C.gold, 5);
      }
    }
  });
  function text() {
    const r = M.FC.run(g(), km(), cr(), pl()), z = M.say.fc(g(), km(), cr(), pl()), v = z.v;
    put('#fcDo', t('u.km', { v: fmt(km(), km() < 1 ? 2 : km() < 10 ? 1 : 0) })); put('#fcCo', fmt(cr(), 0));
    put('#fcN', fmt(r.need, 0)); put('#fcU', pct(r.util)); put('#fcGd', mbs(r.goodMBps)); put('#fcRc', t('u.km', { v: fmt(r.reachKm, r.reachKm < 10 ? 1 : 0) }));
    putHTML('#fcSay', t(z.key, { need: fmt(v.need, 0), util: pct(v.util), good: mbs(v.good), reach: t('u.km', { v: fmt(v.reach, v.reach < 10 ? 1 : 0) }), cr: fmt(v.cr, 0) }));
  }
  sim.reset = reset;
  wire(sim, text, ['#fcD', '#fcC'], ['fcG', 'fcF']);
})();

/* ───────── 05 latency budget ───────── */
(() => {
  const cv = $('#bdCv');
  const med = () => M.BUDGET.media[radioVal('bdM')], tr = () => radioVal('bdT'), km = () => +$('#bdD').value, hops = () => +$('#bdH').value;
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), r = M.BUDGET.run(med(), tr(), km(), hops());
      const L = 14, R = w - 14, y = h * 0.4, bh = 30, X = v => L + (R - L) * v / r.total;
      let x = 0;
      [[r.media, C.gold], [r.fabric, C.red], [r.prop, C.violet], [r.sw, C.cyan]].forEach(([v, col]) => { if (v <= 0) return; c.fillStyle = col; c.fillRect(X(x), y - bh / 2, Math.max(1.5, X(x + v) - X(x)), bh); x += v; });
      c.strokeStyle = C.line; c.strokeRect(L, y - bh / 2, R - L, bh);
      c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText('0', L, y + bh / 2 + 14); c.textAlign = 'right'; c.fillText(dur(r.total / 1e6), R, y + bh / 2 + 14);
      c.textAlign = 'left'; c.fillText(t('ch5.cv.x'), L, y - bh / 2 - 12);
      if (r.net > 0) tag(c, t('ch5.cv.net', { v: pct(r.share) }), R, y + bh / 2 + 34, C.red, 'right');
    }
  });
  function text() {
    const r = M.BUDGET.run(med(), tr(), km(), hops()), z = M.say.budget(med(), tr(), km(), hops()), v = z.v;
    put('#bdDo', t('u.km', { v: fmt(km(), 0) })); put('#bdHo', fmt(hops(), 0));
    put('#bdTot', dur(r.total / 1e6)); put('#bdNet', dur(r.net / 1e6)); put('#bdSh', pct(r.share)); put('#bdIo', t('u.iops', { v: fmt(r.iops, 0) }));
    putHTML('#bdSay', t(z.key, { share: pct(v.share), net: dur(v.net / 1e6), total: dur(v.total / 1e6), iops: t('u.iops', { v: fmt(v.iops, 0) }) }));
  }
  wire(sim, text, ['#bdD', '#bdH'], ['bdM', 'bdT']);
})();

/* ───────── 06 loss ───────── */
(() => {
  const cv = $('#lsCv');
  const p = () => Math.pow(10, +$('#lsP').value), rtt = () => lv('lsR'), g = () => +radioVal('lsG');
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), L = 50, R = w - 14, T = 26, B = h - 40;
      const X = q => L + (R - L) * (log10(q) + 7) / 6, Y = u => B - (B - T) * u;
      yTicks(c, L, R, Y, [0, 0.25, 0.5, 0.75, 1], v => pct(v, 0));
      axes(c, L, R, T, B, t('ch6.cv.x'), t('ch6.cv.y'));
      spacedTicks(c, [-7, -5, -3, -1].map(e => [X(Math.pow(10, e)), sup(e)]), B + 12);
      const a = [], b = [], d = [];
      for (let e = -7; e <= -0.999; e += 0.03) { const q = Math.pow(10, e), r = M.LOSS.run(q, g(), rtt()); a.push([X(q), Y(r.gbn)]); b.push([X(q), Y(r.sr)]); d.push([X(q), Y(r.tcp)]); }
      path(c, b, C.cyan, 2); path(c, d, C.violet, 2); path(c, a, C.red, 2.4);
      const x = X(p()); c.strokeStyle = C.ink; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(x, T); c.lineTo(x, B); c.stroke(); c.setLineDash([]);
      const r = M.LOSS.run(p(), g(), rtt()); dot(c, x, Y(r.gbn), C.red); dot(c, x, Y(r.tcp), C.violet);
    }
  });
  function text() {
    const r = M.LOSS.run(p(), g(), rtt()), z = M.say.loss(p(), g(), rtt()), v = z.v;
    put('#lsPo', lossPct(p())); put('#lsRo', dur(rtt() / 1e6));
    put('#lsW', fmt(r.W, 0)); put('#lsGbn', pct(r.gbn)); put('#lsSr', pct(r.sr)); put('#lsTcp', pct(r.tcp));
    putHTML('#lsSay', t(z.key, { W: fmt(v.W, 0), gbn: pct(v.gbn), sr: pct(v.sr), tcp: pct(v.tcp) }));
  }
  wire(sim, text, ['#lsP', '#lsR'], ['lsG']);
})();

/* ───────── 07 one I/O across three transports ───────── */
(() => {
  const cv = $('#cpCv'), cb = $('#cpI');
  const tr = () => radioVal('cpT'), op = () => radioVal('cpO'), sz = () => +radioVal('cpS');
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), r = M.CAPS.run(tr(), op(), sz(), { icd: cb.checked });
      const L = 40, R = w - 40, T = 40, B = h - 20, max = 10, show = r.m.length > max ? r.m.slice(0, max - 1) : r.m;
      c.fillStyle = C.ink; c.textAlign = 'center'; c.fillText(t('ch7.cv.host'), L, 16); c.fillText(t('ch7.cv.target'), R, 16);
      c.strokeStyle = C.mute; c.lineWidth = 1.5; c.beginPath(); c.moveTo(L, T - 10); c.lineTo(L, B); c.moveTo(R, T - 10); c.lineTo(R, B); c.stroke();
      const rows = r.m.length > max ? max : r.m.length, rh = (B - T) / rows;
      show.forEach((m, i) => {
        const y0 = T + i * rh + rh * 0.15, y1 = y0 + rh * 0.55, a = m.dir > 0 ? L : R, b = m.dir > 0 ? R : L;
        const col = m.data > 64 ? C.gold : m.key.includes('r2t') || m.key.includes('readreq') ? C.red : C.cyan;
        c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); c.moveTo(a, y0); c.lineTo(b, y1); c.stroke();
        const ang = Math.atan2(y1 - y0, b - a); c.fillStyle = col; c.beginPath(); c.moveTo(b, y1); c.lineTo(b - 9 * Math.cos(ang - 0.4), y1 - 9 * Math.sin(ang - 0.4)); c.lineTo(b - 9 * Math.cos(ang + 0.4), y1 - 9 * Math.sin(ang + 0.4)); c.fill();
        const s = t('ch7.cv.lab', { m: t('ch7.m.' + m.key), b: bytes(m.hdr + m.data) }), cap = R - L - 16;
        c.font = FONT; let f = FONT; const tw = c.measureText(s).width; if (tw > cap) f = FONT.replace('12px', Math.max(8.5, 12 * cap / tw).toFixed(1) + 'px');
        c.font = f; const ww = c.measureText(s).width, ym = (y0 + y1) / 2 - 9; c.fillStyle = C.bg; c.fillRect((L + R) / 2 - ww / 2 - 3, ym - 8, ww + 6, 16); c.fillStyle = C.ink; c.textAlign = 'center'; c.fillText(s, (L + R) / 2, ym); c.font = FONT;
      });
      if (r.m.length > max) { c.fillStyle = C.mute; c.textAlign = 'center'; c.fillText(t('ch7.cv.more', { n: r.m.length - (max - 1) }), (L + R) / 2, T + (max - 1) * rh + rh * 0.45); }
    }
  });
  function text() {
    const r = M.CAPS.run(tr(), op(), sz(), { icd: cb.checked }), z = M.say.caps(tr(), op(), cb.checked, sz()), v = z.v;
    put('#cpM', fmt(r.msgs, 0)); put('#cpRt', fmt(r.rt, 0)); put('#cpH', bytes(r.hdr)); put('#cpE', pct(r.eff, 1));
    putHTML('#cpSay', t(z.key, { rt: fmt(v.rt, 0), msgs: fmt(v.msgs, 0), eff: pct(v.eff, 1) }));
  }
  wire(sim, text, [], ['cpT', 'cpO', 'cpS'], ['#cpI']);
})();

/* ───────── 08 two paths ───────── */
(() => {
  const cv = $('#mpCv'), mu1 = D.mp.mu1;
  const lam = () => +$('#mpL').value, q = () => +$('#mpQ').value;
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), L = 50, R = w - 14, T = 26, B = h - 40, ymax = 200, xmax = 150;
      const X = l => L + (R - L) * l / xmax, Y = u => B - (B - T) * Math.min(u, ymax) / ymax;
      yTicks(c, L, R, Y, [0, 50, 100, 150, 200], v => fmt(v, 0));
      axes(c, L, R, T, B, t('ch8.cv.x'), t('ch8.cv.y'));
      spacedTicks(c, [0, 50, 100, 150].map(v => [X(v), fmt(v, 0)]), B + 12);
      const curves = { opt: [], rr: [], prop: [], best: [], fail: [] };
      for (let l = 0.5; l <= xmax; l += 0.5) {
        const r = M.MP.run(l, mu1, q());
        for (const k of ['opt', 'rr', 'prop', 'best']) curves[k].push(isFinite(r.T[k]) && r.T[k] * 1000 <= ymax ? [X(l), Y(r.T[k] * 1000)] : null);
        curves.fail.push(isFinite(r.fail1) && r.fail1 * 1000 <= ymax ? [X(l), Y(r.fail1 * 1000)] : null);
      }
      path(c, curves.fail, C.red, 2, [6, 4]); path(c, curves.rr, C.violet, 2); path(c, curves.prop, C.cyan, 2); path(c, curves.opt, C.gold, 2.2); path(c, curves.best, C.green, 2.6);
      const x = X(lam()); c.strokeStyle = C.ink; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(x, T); c.lineTo(x, B); c.stroke(); c.setLineDash([]);
    }
  });
  function text() {
    const r = M.MP.run(lam(), mu1, q()), z = M.say.mp(lam(), mu1, q()), v = z.v, us = x => isFinite(x) ? dur(x / 1000, x >= 0.01 ? 0 : 1) : '∞';
    put('#mpLo', t('u.iops', { v: fmt(lam() * 1000, 0) })); put('#mpQo', t('ch8.unit.q', { v: pct(q(), 0) }));
    put('#mpO', us(r.T.opt)); put('#mpB', us(r.T.best)); put('#mpS', isFinite(r.T.best) ? pct(r.pol.best, 0) : '—'); put('#mpF', us(r.fail1));
    putHTML('#mpSay', t(z.key, { opt: us(v.opt), best: us(v.best), pb: pct(v.pb, 0), fail1: us(v.fail1), rr: us(v.rr) }));
  }
  wire(sim, text, ['#mpL', '#mpQ'], []);
})();

/* ───────── 09 replication vs erasure coding ───────── */
(() => {
  const cv = $('#ecCv'), SCH = M.EC.SCHEMES, keys = ['mirror', 'rep3', 'rs63', 'rs104'];
  const afr = () => +$('#ecA').value / 100, mttr = () => lv('ecM'), sel = () => radioVal('ecS');
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), labs = keys.map(k => t('ch9.s.' + k)), lf = labelFont(c, labs, Math.min(100, w * 0.24));
      const L = lf.w, mid = L + (w - L) * 0.42, R = w - 12, T = 34, B = h - 30, rh = (B - T) / keys.length;
      const X1 = v => L + 4 + (mid - L - 14) * v / 3.5, X2 = v => mid + 6 + (R - mid - 6) * Math.min(v, 20) / 20;
      c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(t('ch9.cv.o'), L + 4, 14); c.fillText(t('ch9.cv.n'), mid + 6, 14);
      spacedTicks(c, [1, 2, 3].map(v => [X1(v), fmt(v, 0) + '×']), B + 14); spacedTicks(c, [0, 5, 10, 15, 20].map(v => [X2(v), fmt(v, 0)]), B + 14);
      c.strokeStyle = C.grid; [1, 2, 3].forEach(v => { c.beginPath(); c.moveTo(X1(v), T - 6); c.lineTo(X1(v), B); c.stroke(); }); [5, 10, 15, 20].forEach(v => { c.beginPath(); c.moveTo(X2(v), T - 6); c.lineTo(X2(v), B); c.stroke(); });
      keys.forEach((k, i) => {
        const s = SCH[k], r = M.EC.run(s.n, s.k, afr(), mttr()), y = T + i * rh + rh * 0.22, bh = rh * 0.56, on = k === sel();
        c.font = lf.font; c.fillStyle = on ? C.gold : C.ink; c.textAlign = 'right'; c.fillText(labs[i], L - 8, y + bh / 2); c.font = FONT;
        c.globalAlpha = on ? 1 : 0.5;
        c.fillStyle = C.gold; c.fillRect(X1(0), y, X1(r.overhead) - X1(0), bh);
        c.fillStyle = C.green; c.fillRect(X2(0), y, Math.max(2, X2(r.nines) - X2(0)), bh);
        c.globalAlpha = 1;
      });
    }
  });
  function text() {
    const s = SCH[sel()], r = M.EC.run(s.n, s.k, afr(), mttr()), z = M.say.ec(s.n, s.k, afr(), mttr()), v = z.v;
    put('#ecAo', pct(afr(), 2)); put('#ecMo', t('u.h', { v: fmt(mttr(), mttr() < 10 ? 1 : 0) }));
    put('#ecO', times(r.overhead)); put('#ecT', fmt(r.m, 0)); put('#ecN', t('u.nines', { v: fmt(r.nines, 1) })); put('#ecR', fmt(r.repairReads, 0));
    putHTML('#ecSay', t(z.key, { o: times(v.o), nines: t('u.nines', { v: fmt(v.nines, 1) }), m: fmt(v.m, 0), reads: fmt(v.reads, 0) }));
  }
  wire(sim, text, ['#ecA', '#ecM'], ['ecS']);
})();

/* ───────── loop ───────── */
applyLang();
let last = performance.now();
function tick(now) {
  const dt = Math.min((now - last) / 1000, 0.1); last = now;
  for (const s of sims) {
    if (!s.vis) continue;
    if (s.step) s.step(dt);
    else if (s.dirty) { s.draw(); s.dirty = false; }
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
window.__essayReady = true;
})();
