/* What a frontier model takes: wiring, drawing, i18n and on-screen gating. All visible text comes from copy.*.js. */
(() => {
'use strict';
const M = window.FrontierModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const C = { bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb' };
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const MONO = '12px ui-monospace,Menlo,Consolas,monospace';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ───────── language ───────── */
const LS = 'knowledge-lang';
let memLang = null;
function readLang() { try { return localStorage.getItem(LS); } catch (e) { return memLang; } }
function writeLang(v) { memLang = v; try { localStorage.setItem(LS, v); } catch (e) { /* in-memory fallback */ } }
let lang = readLang();
if (lang !== 'zh' && lang !== 'en') lang = /^zh/i.test(navigator.language || '') ? 'zh' : 'en';
function t(key, vars) {
  let s = (COPY[lang] && COPY[lang][key] != null) ? COPY[lang][key] : (COPY.zh && COPY.zh[key] != null ? COPY.zh[key] : key);
  if (vars) { s = s.replace(/\{(\w+)\}/g, (m, k) => vars[k] != null ? vars[k] : m); const sq = COPY[effLang()] && COPY[effLang()]['num.squeeze']; if (sq) s = s.replace(new RegExp(sq, 'g'), '$1'); }
  return s;
}
const effLang = () => (COPY[lang] ? lang : 'zh');

/* ───────── number formatting (language-aware via copy) ───────── */
function fmt(x, d = 0) {
  if (!isFinite(x)) return '—';
  const v = Math.abs(x) < 0.5 * Math.pow(10, -d) ? 0 : x;
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}
// significant-figure fixed formatting
function fmtSig(x, sig = 3) { if (!isFinite(x)) return '—'; if (x === 0) return '0'; const d = Math.max(0, sig - 1 - Math.floor(Math.log10(Math.abs(x)))); return fmt(x, Math.min(d, 6)); }
// large counts with the copy's scale words (e.g. "1e12: trillion|1e9: billion|1e6: million"; Chinese uses 10^12, 10^8, 10^4)
function fmtCount(x, sig = 3) {
  if (!isFinite(x)) return '—';
  const units = t('num.units').split('|').map(u => { const i = u.indexOf(':'); return [+u.slice(0, i), u.slice(i + 1)]; });
  for (const [v, w] of units) if (Math.abs(x) >= v) { const s = fmtSig(x / v, sig); return s + (/^\s/.test(w) ? w : t('num.sep') + w); }
  return fmtSig(x, sig);
}
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
function fmtSci(x, d = 1) {
  if (!isFinite(x) || x === 0) return fmt(x);
  let e = Math.floor(Math.log10(Math.abs(x))), m = x / Math.pow(10, e);
  if (+m.toFixed(d) >= 10) { m /= 10; e++; }
  if (e >= -2 && e <= 2) return fmtSig(x, d + 1);
  return t('u.sci', { m: m.toFixed(d), e: String(e).split('').map(c => SUP[c]).join('') });
}
const pct = (x, d = 1) => t('u.pct', { v: fmt(x * 100, d) });
function fmtBytes(b) { return b >= 1e12 ? t('u.tb', { v: fmtSig(b / 1e12, 3) }) : b >= 1e9 ? t('u.gb', { v: fmtSig(b / 1e9, 3) }) : b >= 1e6 ? t('u.gb', { v: fmtSig(b / 1e9, 2) }) : t('u.bytes', { v: fmt(b) }); }
const letter = k => String.fromCharCode(97 + k);

function applyLang() {
  document.documentElement.lang = effLang() === 'zh' ? 'zh-CN' : 'en';
  document.title = t('doc.title');
  const md = document.querySelector('meta[name=description]');
  if (md) md.content = t('doc.desc');
  document.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(e => { e.innerHTML = t(e.dataset.i18nHtml, FACTS); });
  document.querySelectorAll('[data-i18n-aria]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.i18nAria)); });
  document.querySelectorAll('#langToggle button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  sims.forEach(s => { s.dirty = true; if (s.text) s.text(); });
}
document.querySelectorAll('#langToggle button').forEach(b => b.addEventListener('click', () => { lang = b.dataset.lang; writeLang(lang); applyLang(); }));
// values substituted into static prose (frontier data block)
const FACTS = { over25: String(M.FRONTIER.epochOver1e25), over26: String(M.FRONTIER.epochOver1e26) };

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
function reg(cvs, o) { o.cvs = [].concat(cvs).filter(Boolean); o.vis = false; o.dirty = true; sims.push(o); o.cvs.forEach(cv => io.observe(cv)); return o; }
window.addEventListener('resize', () => sims.forEach(s => { s.dirty = true; }));
const on = (sel, ev, fn) => { const el = $(sel); el.addEventListener(ev, fn); return el; };
const radios = name => [...document.querySelectorAll(`input[name=${name}]`)];
const radioVal = name => radios(name).find(r => r.checked).value;
const onRadio = (name, fn) => radios(name).forEach(r => r.addEventListener('change', fn));
const put = (sel, s) => { const e = $(sel); if (e.textContent !== s) e.textContent = s; };
const putHTML = (sel, s) => { const e = $(sel); if (e.__h !== s) { e.innerHTML = s; e.__h = s; } };

function frame(w, h, m, x0, x1, y0, y1) {
  const L = m[3], R = w - m[1], T = m[0], B = h - m[2];
  return { L, R, T, B, X: x => L + (R - L) * (x - x0) / (x1 - x0), Y: y => B - (B - T) * (y - y0) / (y1 - y0) };
}
function axes(c, f, xLab, yLab) {
  c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.T); c.lineTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
  c.fillStyle = C.mute; c.font = FONT;
  if (yLab) { c.textAlign = 'left'; c.fillText(yLab, f.L + 6, f.T - 12); }
  if (xLab) { c.textAlign = 'right'; c.fillText(xLab, f.R, f.B + 26); }
}
function xTicks(c, f, vals, fmtv, skipLast) {
  c.fillStyle = C.mute; c.textAlign = 'center'; c.font = FONT;
  vals.forEach((v, i) => { if (skipLast && i === vals.length - 1) return; const x = f.X(v); c.fillText(fmtv(v), x, f.B + 11); c.strokeStyle = C.line; c.beginPath(); c.moveTo(x, f.B); c.lineTo(x, f.B + 3); c.stroke(); });
}
function yTicks(c, f, vals, fmtv) {
  c.fillStyle = C.mute; c.textAlign = 'right'; c.font = FONT;
  vals.forEach(v => { const y = f.Y(v); c.fillText(fmtv(v), f.L - 6, y); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, y); c.lineTo(f.R, y); c.stroke(); });
}
function hline(c, f, y, col, dash = [5, 4]) { c.strokeStyle = col; c.lineWidth = 1.3; c.setLineDash(dash); c.beginPath(); c.moveTo(f.L, f.Y(y)); c.lineTo(f.R, f.Y(y)); c.stroke(); c.setLineDash([]); }
function path(c, pts, X, Y, col, lw = 2.2, dash) { c.strokeStyle = col; c.lineWidth = lw; c.lineJoin = 'round'; if (dash) c.setLineDash(dash); c.beginPath(); pts.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](X(p[0]), Y(p[1]))); c.stroke(); c.setLineDash([]); }
function dot(c, x, y, col, r = 5) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); }
function clipTo(c, f) { c.save(); c.beginPath(); c.rect(f.L, f.T - 2, f.R - f.L, f.B - f.T + 4); c.clip(); }
const exp10 = e => t('u.sci', { m: '1', e: String(e).split('').map(ch => SUP[ch]).join('') }).replace(/^1×/, '');
const heat = (v, rgb) => `rgba(${rgb},${(0.06 + 0.94 * Math.min(1, v)).toFixed(3)})`;

/* ───────── the tiny model: lazy-loaded weights ───────── */
let TINY = null, PACK = null;
const waiting = [];
function whenTiny(fn) { if (TINY) fn(); else waiting.push(fn); }
function loadTiny() {
  if (loadTiny.started) return; loadTiny.started = true;
  const s = document.createElement('script'); s.src = 'weights.js';
  s.onload = () => { PACK = window.TINY_TF; TINY = M.TF.decode(PACK); waiting.splice(0).forEach(fn => fn()); };
  document.head.appendChild(s);
}
{ const near = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { loadTiny(); near.disconnect(); } }, { rootMargin: '400px' });
  ['#ch1', '#ch4', '#ch8', '#ch9', '#ch11'].forEach(sel => near.observe($(sel))); }
const EVAL = M.evalSet(99, 150);
const EXAMPLE = 'tokenstokenstokenstokens';
function cleanText(s) { return (s || '').toLowerCase().replace(/[^a-z]/g, '').slice(0, 24); }
const toIds = s => s.split('').map(ch => ch.charCodeAt(0) - 97);
const evalCache = new Map();
function evalOn(model, key, opts) { if (!evalCache.has(key)) evalCache.set(key, M.TF.evaluate(model, EVAL, opts)); return evalCache.get(key); }

/* ───────── 01 the block ───────── */
const ch1 = (() => {
  const cv = $('#tfCv'), inp = $('#tfIn'), sP = $('#tfPos');
  let str = EXAMPLE, run = null;
  function compute() {
    str = cleanText(inp.value);
    if (!TINY || !str.length) { run = null; return; }
    sP.max = String(str.length - 1); if (+sP.value > str.length - 1) sP.value = String(str.length - 1);
    const ops = new M.TF.Ops(), r = M.TF.forward(TINY, toIds(str), { record: true, ops });
    run = { logits: r.logits, attn: r.rec.attn, mac: ops.mac, n: str.length };
  }
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv);
      if (!run) { c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(TINY ? '' : t('common.loading'), 12, 20); return; }
      const i = +sP.value, n = run.n, Lm = 58, cw = Math.min(30, (w - Lm - 8) / 24), rh = Math.min(30, Math.max(20, (h - 200) / 4));
      c.font = MONO; c.textAlign = 'center';
      for (let j = 0; j < n; j++) { c.fillStyle = j === i ? C.gold : j > i ? '#5b6272' : C.ink; c.fillText(str[j], Lm + cw * (j + 0.5), 14); }
      c.font = FONT; c.textAlign = 'left'; c.fillStyle = C.mute; c.fillText(t('ch1.cv.heads'), 4, 14);
      const heads = [[0, 0], [0, 1], [1, 0], [1, 1]];
      heads.forEach(([l, hd], r) => {
        const y = 30 + r * (rh + 6), A = run.attn[l][hd];
        c.fillStyle = C.mute; c.textAlign = 'left'; c.font = FONT; c.fillText(t('head.' + l + hd), 4, y + rh / 2);
        for (let j = 0; j < n; j++) {
          const x = Lm + cw * j;
          c.fillStyle = j > i ? '#151922' : heat(A[i * n + j], '99,199,230');
          c.fillRect(x + 1, y, cw - 2, rh);
        }
      });
      c.strokeStyle = C.gold; c.lineWidth = 1.5; c.strokeRect(Lm + cw * i + 0.5, 22, cw - 1, 4 * (rh + 6) + 4);
      // next-letter probabilities: top 5
      const p = M.TF.softmaxRow(run.logits, i * 26, 26), top = [...p].map((v, k) => [v, k]).sort((a, b) => b[0] - a[0]).slice(0, 5);
      const y0 = 30 + 4 * (rh + 6) + 18, bh = Math.max(12, Math.min(20, (h - y0 - 24) / 5 - 6));
      c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(t('ch1.cv.next'), 4, y0);
      const bx = Lm, bw = w - Lm - 70;
      top.forEach(([v, k], r) => {
        const y = y0 + 14 + r * (bh + 6);
        c.font = MONO; c.fillStyle = C.ink; c.textAlign = 'right'; c.fillText(letter(k), bx - 10, y + bh / 2);
        c.fillStyle = r === 0 ? C.gold : 'rgba(233,185,73,.45)'; c.fillRect(bx, y, Math.max(1, bw * v), bh);
        c.font = FONT; c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(t('u.pct', { v: fmt(v * 100, 1) }), bx + Math.max(1, bw * v) + 6, y + bh / 2);
      });
    }
  });
  function text() {
    put('#tfParams', fmt(TINY ? TINY.flat.length : 27930));
    if (!run) { put('#tfPoso', '—'); put('#tfPred', '—'); put('#tfShape', '—'); put('#tfMac', '—'); putHTML('#tfSay', TINY ? t('ch1.say.empty') : t('common.loading')); return; }
    const i = +sP.value, n = run.n, cur = str[i];
    put('#tfPoso', t('u.pos', { i, l: cur }));
    const p = M.TF.softmaxRow(run.logits, i * 26, 26); let top = 0; for (let k = 1; k < 26; k++) if (p[k] > p[top]) top = k;
    put('#tfPred', t('u.letter', { l: letter(top), p: fmt(p[top] * 100, 1) }));
    put('#tfShape', t('ch1.shape', { n })); put('#tfMac', fmt(run.mac));
    const A = run.attn[1][1]; let best = -1, wsum = 0;
    for (let j = 1; j <= i; j++) if (str[j - 1] === cur) { wsum += A[i * n + j]; if (best < 0 || A[i * n + j] > A[i * n + best]) best = j; }
    const v = { i, cur, top: letter(top), p: fmt(p[top] * 100, 1) };
    let key;
    if (i === 0) key = 'ch1.say.first';
    else if (best > 0) { Object.assign(v, { j: best - 1, j1: best, nx: str[best], w: fmt(A[i * n + best] * 100, 0), ws: fmt(wsum * 100, 0) }); key = letter(top) === str[best] ? 'ch1.say.copy' : 'ch1.say.copyother'; }
    else key = 'ch1.say.new';
    putHTML('#tfSay', t(key, v));
  }
  sim.text = text;
  const redo = () => { compute(); sim.dirty = true; text(); ch8.refresh(); ch11.refresh(); };
  inp.addEventListener('input', redo);
  sP.addEventListener('input', () => { sim.dirty = true; text(); });
  whenTiny(redo);
  text();
  return { str: () => str };
})();

/* ───────── 02 depth ───────── */
(() => {
  const cv = $('#dpCv'), sL = $('#dpL'), sG = $('#dpG');
  let r = null;
  const redo = () => { r = M.depthRun({ L: +sL.value, g: +sG.value }); sim.dirty = true; text(); };
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), L = +sL.value, half = (h - 10) / 2;
      const panels = [['act', 'ch2.cv.act', 0], ['grad', 'ch2.cv.grad', half + 10]];
      for (const [key, lab, top] of panels) {
        const f = frame(w, top + half, [top + 22, 12, 30, 52], 0, L, -6, 6);
        yTicks(c, f, [-6, -3, 0, 3, 6], v => v === 0 ? '1' : exp10(v));
        axes(c, f, key === 'grad' ? t('ch2.cv.layer') : '', t(lab));
        xTicks(c, f, [0, L], v => fmt(v));
        clipTo(c, f);
        [['plain', C.red], ['res', C.violet], ['preln', C.cyan]].forEach(([k, col]) => {
          const ys = r[k][key], pts = ys.map((v, l) => [l, Math.max(-9, Math.min(9, Math.log10(Math.max(v, 1e-30))))]);
          path(c, pts, f.X, f.Y, col, 2);
        });
        c.restore();
      }
    }
  });
  function text() {
    const L = +sL.value, g = +sG.value;
    put('#dpLo', fmt(L)); put('#dpGo', fmt(g, 2));
    const s = k => `${fmtSci(r[k].act[L])} / ${fmtSci(r[k].grad[0])}`;
    put('#dpPlain', s('plain')); put('#dpRes', s('res')); put('#dpPre', s('preln'));
    const key = g < 0.95 ? 'ch2.say.vanish' : g > 1.05 ? 'ch2.say.explode' : 'ch2.say.critical';
    putHTML('#dpSay', t(key, { g: fmt(g, 2), L, plain: fmtSci(r.plain.act[L]), plainG: fmtSci(r.plain.grad[0]), res: fmtSci(r.res.act[L]), pre: fmtSci(r.preln.act[L]), preG: fmtSci(r.preln.grad[0]) }));
  }
  sim.text = text;
  [sL, sG].forEach(e => e.addEventListener('input', redo));
  redo();
})();

/* ───────── 03 counting ───────── */
const CTX = [2048, 8192, 32768, 131072];
(() => {
  const cv = $('#ctCv'), sT = $('#ctT');
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), id = radioVal('ctM'), cfg = M.PRESETS[id], T = id === 'tiny' ? 24 : CTX[+sT.value];
      const p = M.countParams(cfg), fl = M.flopsPerToken(cfg, T);
      const L = 12, R = w - 12, bh = Math.min(46, (h - 80) / 2);
      const emb = p.embed + p.unembed, attn = cfg.L * p.attn, mlp = cfg.L * p.mlp, other = p.total - emb - attn - mlp;
      const bars = [
        [t('ch3.cv.params'), [[emb, C.violet], [attn, C.cyan], [mlp, C.gold], [other, C.mute]], p.total, 26],
        [t('ch3.cv.flops'), [[2 * cfg.L * p.attn, C.cyan], [2 * cfg.L * p.mlp, C.gold], [2 * cfg.V * cfg.d, C.violet], [fl.attn, C.red]], null, 26 + bh + 50],
      ];
      for (const [lab, segs, tot0, y] of bars) {
        const tot = tot0 || segs.reduce((s, q) => s + q[0], 0);
        c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(lab, L, y - 12);
        let x = L;
        for (const [v, col] of segs) { const ww = (R - L) * Math.max(0, v) / tot; c.fillStyle = col; c.fillRect(x, y, Math.max(0, ww - 1), bh); x += ww; }
      }
    }
  });
  function text() {
    const id = radioVal('ctM'), cfg = M.PRESETS[id], T = id === 'tiny' ? 24 : CTX[+sT.value];
    sT.disabled = id === 'tiny';
    const p = M.countParams(cfg), fl = M.flopsPerToken(cfg, T);
    put('#ctTo', t('u.ctx', { v: fmt(T) }));
    put('#ctN', id === 'tiny' || p.total < 1e10 ? fmt(p.total) : fmtCount(p.total, 4)); put('#ctLayer', fmtCount(p.layer, 3));
    put('#ctF', id === 'tiny' ? t('u.flop', { v: fmt(fl.total) }) : t('u.gflop', { v: fmt(fl.total / 1e9, 1) }));
    put('#ctShare', pct(fl.attnShare));
    const v = { name: t('model.' + id), N: fmtCount(p.total, 4), T: fmt(T), F: fmt(fl.total / 1e9, 1), share: fmt(fl.attnShare * 100, 1), x: fmt(fl.total / fl.dense, 1), L: cfg.L, d: cfg.d, embPct: fmt((p.embed + p.unembed) / p.total * 100, 0) };
    if (id === 'tiny') { v.N = fmt(p.total); v.F = fmt(fl.total); }
    putHTML('#ctSay', t(id === 'tiny' ? 'ch3.say.tiny' : fl.attnShare < 0.25 ? 'ch3.say.short' : 'ch3.say.long', v));
  }
  sim.text = text;
  const redo = () => { sim.dirty = true; text(); };
  onRadio('ctM', redo); sT.addEventListener('input', redo);
  text();
})();

/* ───────── 04 training record ───────── */
(() => {
  const cv = $('#trCv'), cv2 = $('#trCv2'), sS = $('#trS'), bPlay = $('#trPlay');
  let playing = false, snaps = null, pos = 0;
  const sim = reg([cv, cv2], {
    step(dt) {
      if (playing) {
        pos = Math.min(3000, pos + dt * 600);
        sS.value = String(Math.floor(pos / 50) * 50); const v = pos;
        if (v >= 3000) { playing = false; bPlay.textContent = t('ch4.btn.play'); }
        this.dirty = true; text();
      }
    },
    draw() {
      { const { c, w, h } = fit(cv);
        if (!PACK) { c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(t('common.loading'), 12, 20); return; }
        const R = PACK.train, f = frame(w, h, [26, 14, 36, 40], 0, 3000, 0, 4);
        yTicks(c, f, [0, 1, 2, 3, 4], v => fmt(v)); axes(c, f, t('ch4.cv.x'), t('ch4.cv.y'));
        xTicks(c, f, [0, 1000, 2000, 3000], v => fmt(v), true);
        hline(c, f, Math.log(26), C.mute); hline(c, f, M.bayesLoss().mean, C.green);
        const s = +sS.value, upto = R.step.findIndex(x => x > s), n = upto < 0 ? R.step.length : upto;
        const ser = k => R.step.slice(0, n).map((x, i) => [x, Math.min(4, R[k][i])]);
        path(c, ser('lossNew'), f.X, f.Y, C.violet, 1.8); path(c, ser('lossRep'), f.X, f.Y, C.cyan, 1.8); path(c, ser('loss'), f.X, f.Y, C.ink, 2.2);
        c.strokeStyle = C.gold; c.lineWidth = 1; c.beginPath(); c.moveTo(f.X(s), f.T); c.lineTo(f.X(s), f.B); c.stroke(); }
      { const { c, w, h } = fit(cv2);
        if (!PACK) return;
        if (!snaps) snaps = M.TF.b64ToU8(PACK.snaps.b64);
        const si = Math.min(PACK.snaps.step.length - 1, Math.round(+sS.value / 100)), per = 4 * 300, T = 24;
        const size = Math.min((w - 36) / 2, h - 28), cell = size / T;
        [[1, 'ch4.cv.h01'], [3, 'ch4.cv.h11']].forEach(([hi, lab], k) => {
          const x0 = 12 + k * (size + 12), y0 = 22;
          c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(t(lab), x0, 10);
          let o = si * per + hi * 300;
          for (let i = 0; i < T; i++) for (let j = 0; j <= i; j++) { c.fillStyle = heat(snaps[o++] / 255, '122,214,160'); c.fillRect(x0 + j * cell, y0 + i * cell, Math.ceil(cell), Math.ceil(cell)); }
        }); }
    }
  });
  function text() {
    const s = +sS.value; put('#trSo', t('u.step', { v: fmt(s) }));
    if (!PACK) { ['#trLoss', '#trPpl', '#trAcc', '#trInd'].forEach(id => put(id, '—')); putHTML('#trSay', t('common.loading')); return; }
    const R = PACK.train, i = Math.min(R.step.length - 1, Math.round(s / 50)), floor = M.bayesLoss().mean;
    put('#trLoss', fmt(R.loss[i], 3)); put('#trPpl', fmt(Math.exp(R.loss[i]), 2)); put('#trAcc', pct(R.accRep[i])); put('#trInd', fmt(R.heads[i][3][1], 2));
    const key = R.accRep[i] < 0.3 ? 'ch4.say.plateau' : R.accRep[i] < 0.95 ? 'ch4.say.jump' : 'ch4.say.done';
    putHTML('#trSay', t(key, { s: fmt(R.step[i]), loss: fmt(R.loss[i], 3), acc: fmt(R.accRep[i] * 100, 1), ind: fmt(R.heads[i][3][1], 2), rep: fmt(R.lossRep[i], 4), floor: fmt(floor, 3), gap: fmt(R.loss[i] - floor, 3) }));
  }
  sim.text = text;
  sS.addEventListener('input', () => { playing = false; bPlay.textContent = t('ch4.btn.play'); sim.dirty = true; text(); });
  bPlay.addEventListener('click', () => {
    if (reduce) { sS.value = '3000'; sim.dirty = true; text(); return; }
    if (+sS.value >= 3000) sS.value = '0';
    pos = +sS.value; playing = !playing; bPlay.textContent = t(playing ? 'ch4.btn.pause' : 'ch4.btn.play');
  });
  whenTiny(() => { sim.dirty = true; text(); });
  text();
})();

/* ───────── 05 scaling laws ───────── */
const ch5 = (() => {
  const cv = $('#slCv'), sC = $('#slC'), sN = $('#slN');
  const st = () => { const f = M.FITS[radioVal('slFit')], Cc = Math.pow(10, +sC.value), N = Math.pow(10, +sN.value); return { f, C: Cc, N, D: Cc / 6 / N, opt: M.chinOpt(Cc, f) }; };
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), s = st();
      const y0 = Math.floor((M.chinOpt(s.C * 10, s.f).loss - 0.03) * 10) / 10, y1 = y0 + 0.8;
      const f = frame(w, h, [26, 14, 36, 44], 8, 13, y0, y1);
      yTicks(c, f, [y0, y0 + 0.2, y0 + 0.4, y0 + 0.6, y0 + 0.8], v => fmt(v, 1)); axes(c, f, t('ch5.cv.x'), t('ch5.cv.y'));
      xTicks(c, f, [8, 9, 10, 11, 12, 13], v => exp10(v), true);
      clipTo(c, f);
      const curve = Cc => { const pts = []; for (let x = 8; x <= 13.0001; x += 0.025) { const N = Math.pow(10, x), D = Cc / 6 / N; pts.push([x, M.chinLoss(N, D, s.f)]); } return pts; };
      path(c, curve(s.C / 10), f.X, f.Y, C.mute, 1.3, [5, 4]); path(c, curve(s.C * 10), f.X, f.Y, C.mute, 1.3, [5, 4]);
      path(c, curve(s.C), f.X, f.Y, C.cyan, 2.4);
      c.restore();
      dot(c, f.X(Math.log10(s.opt.N)), f.Y(s.opt.loss), C.green, 6);
      const yl = M.chinLoss(s.N, s.D, s.f); if (yl <= y1) dot(c, f.X(Math.log10(s.N)), f.Y(yl), C.gold, 5);
    }
  });
  function text() {
    const s = st(), L = M.chinLoss(s.N, s.D, s.f), gap = L - s.opt.loss;
    put('#slCo', t('u.flop', { v: fmtSci(s.C) })); put('#slNo', fmtCount(s.N, 3));
    put('#slNopt', fmtCount(s.opt.N, 3)); put('#slDopt', fmtCount(s.opt.D, 3)); put('#slRatio', fmt(s.opt.ratio, 1)); put('#slGap', fmt(gap, 3));
    const v = { N: fmtCount(s.N, 3), D: fmtCount(s.D, 3), r: fmtSig(s.D / s.N, 3), gap: fmt(gap, 3), Nopt: fmtCount(s.opt.N, 3), Dopt: fmtCount(s.opt.D, 3) };
    putHTML('#slSay', t(gap < 0.005 ? 'ch5.say.near' : s.N > s.opt.N ? 'ch5.say.big' : 'ch5.say.small', v));
    ch6.refresh();
  }
  sim.text = text;
  const redo = () => { sim.dirty = true; text(); };
  [sC, sN].forEach(e => e.addEventListener('input', redo)); onRadio('slFit', redo);
  on('#slGpt3', 'click', () => { sN.value = String(Math.round(Math.log10(st().opt.N) * 20) / 20); redo(); });
  return { opt: () => st().opt, init: text };
})();

/* ───────── 06 the training bill ───────── */
const ch6 = (() => {
  const cv = $('#blCv'), sM = $('#blMfu'), sG = $('#blG'), sP = $('#blP'), sW = $('#blW');
  const RUNS = { gpt3: { N: 174.6e9, D: 300e9 }, llama405: { N: 405e9, D: 15.6e12 }, dsv3: { N: 37e9, D: 14.8e12 } };
  const run = () => { const id = radioVal('blRun'); if (id === 'ch5') { const o = ch5.opt(); return { id, N: o.N, D: o.D }; } return Object.assign({ id }, RUNS[id]); };
  const st = () => { const r = run(), gpus = Math.round(Math.pow(2, +sG.value)); return { r, gpus, b: M.bill({ N: r.N, D: r.D, hw: radioVal('blHw'), mfu: +sM.value, price: +sP.value, gpus, watt: +sW.value }) }; };
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), s = st(), f = frame(w, h, [30, 16, 36, 16], 21, 28, 0, 1);
      c.strokeStyle = C.line; c.beginPath(); c.moveTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
      xTicks(c, f, [21, 22, 23, 24, 25, 26, 27, 28], v => exp10(v));
      c.strokeStyle = C.mute; c.lineWidth = 1.2;
      for (const p of M.FRONTIER.compute) { const x = f.X(Math.log10(p.flop)); c.beginPath(); c.moveTo(x, f.B - 4); c.lineTo(x, f.B - 16); c.stroke(); }
      [[25, 'ch6.cv.eu'], [26, 'ch6.cv.ca']].forEach(([e, k]) => { const x = f.X(e); c.strokeStyle = C.mute; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(x, f.T); c.lineTo(x, f.B); c.stroke(); c.setLineDash([]); c.fillStyle = C.mute; c.textAlign = e === 25 ? 'right' : 'left'; c.fillText(t(k), x + (e === 25 ? -4 : 4), f.T + 2); });
      const lx = Math.log10(s.b.flops), x = f.X(Math.max(21, Math.min(28, lx)));
      dot(c, x, f.B - 28, C.gold, 6); c.fillStyle = C.gold; c.textAlign = x > w - 60 ? 'right' : x < 60 ? 'left' : 'center'; c.fillText(t('ch6.cv.you'), x, f.B - 44 > f.T + 14 ? f.B - 44 : f.T + 18);
    }
  });
  function text() {
    const s = st(), hw = radioVal('blHw');
    put('#blMfuo', pct(+sM.value, 0)); put('#blGo', fmt(s.gpus)); put('#blPo', t('u.usdh', { v: fmt(+sP.value, 2) })); put('#blWo', t('u.watt', { v: fmt(+sW.value) }));
    put('#blF', t('u.flop', { v: fmtSci(s.b.flops, 2) })); put('#blH', fmtCount(s.b.gpuHours, 4)); put('#blD', t('u.days', { v: fmt(s.b.days, s.b.days < 10 ? 1 : 0) }));
    put('#blE', t('u.mwh', { v: fmt(s.b.mwh, 0) })); put('#blM', t('u.usd', { v: fmtCount(s.b.cost, 3) }));
    const v = { mfu: fmt(+sM.value * 100), N: fmtCount(s.r.N, 4), D: fmtCount(s.r.D, 3), H: fmtCount(s.b.gpuHours, 4), F: fmtSci(s.b.flops, 2), hw: t('hw.' + hw), gpus: t('u.gpus', { v: fmt(s.gpus) }), days: t('u.days', { v: fmt(s.b.days, s.b.days < 10 ? 1 : 0) }), M: t('u.usd', { v: fmtCount(s.b.cost, 3) }) };
    putHTML('#blSay', t(s.b.days > 365 ? 'ch6.say.slow' : 'ch6.say.' + s.r.id, v));
  }
  const refresh = () => { sim.dirty = true; text(); };
  sim.text = text;
  [sM, sG, sP, sW].forEach(e => e.addEventListener('input', refresh)); onRadio('blRun', refresh);
  onRadio('blHw', () => { sW.value = String(M.HW[radioVal('blHw')].watt); refresh(); });
  return { refresh };
})();
ch5.init();

/* ───────── 07a LoRA ───────── */
(() => {
  const sR = $('#loR');
  function text() {
    const id = radioVal('loM'), r = Math.pow(2, +sR.value), o = M.lora(M.PRESETS[id], r, radioVal('loT'));
    put('#loRo', fmt(r)); put('#loTrain', fmtCount(o.train, 4)); put('#loRatio', t('u.oneover', { v: fmt(o.ratio) }));
    put('#loFull', fmtBytes(o.memFull)); put('#loLora', fmtBytes(o.memLora));
    putHTML('#loSay', t('ch7.say', { r, train: fmtCount(o.train, 4), ratio: t('u.oneover', { v: fmt(o.ratio) }), full: fmtBytes(o.memFull), lora: fmtBytes(o.memLora), x: fmt(o.memFull / o.memLora, 1) }));
  }
  sR.addEventListener('input', text); onRadio('loM', text); onRadio('loT', text);
  sims.push({ cvs: [], text, vis: false });
  text();
})();

/* ───────── 07b benchmark noise ───────── */
const BN_N = [100, 200, 500, 1000, 2000, 5000, 14042];
(() => {
  const cv = $('#bnCv'), sN = $('#bnN'), sGap = $('#bnGap'), sC = $('#bnC'), sE = $('#bnE');
  let seed = 11, sim0 = null;
  const par = () => ({ n: BN_N[+sN.value], pA: 0.8, pB: 0.8 - +sGap.value / 100, cB: +sC.value / 100, err: +sE.value / 100, trials: 400, seed });
  const redo = () => { sim0 = M.benchSim(par()); sim.dirty = true; text(); };
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), all = sim0.sa.concat(sim0.sb);
      const lo = Math.floor(Math.min(...all) * 100) / 100 - 0.01, hi = Math.ceil(Math.max(...all) * 100) / 100 + 0.01;
      const nb = 40, bw = (hi - lo) / nb, hist = a => { const hh = new Array(nb).fill(0); for (const v of a) hh[Math.min(nb - 1, Math.floor((v - lo) / bw))]++; return hh; };
      const ha = hist(sim0.sa), hb = hist(sim0.sb), mx = Math.max(...ha, ...hb);
      const f = frame(w, h, [16, 14, 36, 14], lo, hi, 0, mx * 1.1);
      axes(c, f, t('ch7.cv.x'), '');
      const step = (hi - lo) > 0.2 ? 0.05 : (hi - lo) > 0.08 ? 0.02 : 0.01, ticks = []; for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) ticks.push(v);
      xTicks(c, f, ticks, v => fmt(v * 100, step < 0.02 ? 0 : 0) + '%');
      [[ha, 'rgba(99,199,230,.55)'], [hb, 'rgba(233,185,73,.55)']].forEach(([hh, col]) => { c.fillStyle = col; hh.forEach((v, i) => { if (!v) return; const x0 = f.X(lo + i * bw), x1 = f.X(lo + (i + 1) * bw); c.fillRect(x0, f.Y(v), Math.max(1, x1 - x0 - 1), f.B - f.Y(v)); }); });
    }
  });
  function text() {
    const p = par(), r = M.benchReversal(p);
    put('#bnNo', fmt(p.n)); put('#bnGapo', t('u.pp', { v: fmt(+sGap.value, 1) })); put('#bnCo', pct(p.cB, 0)); put('#bnEo', pct(p.err, 1));
    put('#bnCi', t('u.pts', { v: fmt(r.se1 * 100, 1) })); put('#bnRev', pct(r.p, 0));
    put('#bnMeas', t('ch7.meas', { a: fmt(r.ea * 100, 1), b: fmt(r.eb * 100, 1) })); put('#bnCeil', pct(1 - p.err, 1));
    const v = { n: fmt(p.n), ci: fmt(r.se1 * 100, 1), gap: fmt(+sGap.value, 1), rev: fmt(r.p * 100, 0), sim: fmt(sim0.reversal * 100, 0), c: fmt(p.cB * 100), a: fmt(r.ea * 100, 1), b: fmt(r.eb * 100, 1) };
    const key = p.cB > 0 && r.eb > r.ea ? 'ch7.say.contam' : +sGap.value === 0 && p.cB === 0 ? 'ch7.say.zero' : r.p > 0.1 ? 'ch7.say.noise' : 'ch7.say.clear';
    putHTML('#bnSay', t(key, v));
  }
  sim.text = text;
  [sN, sGap, sC, sE].forEach(e => e.addEventListener('input', redo));
  on('#bnGo', 'click', () => { seed++; redo(); });
  redo();
})();

/* ───────── 08a KV cache on the tiny model ───────── */
const ch8 = (() => {
  const cv = $('#kvCv'), sP = $('#kvP');
  let g = null;
  function compute() {
    if (!TINY) return;
    let s = cleanText(ch1.str()); if (s.length < 13) s = EXAMPLE;
    const k = +sP.value, prompt = toIds(s.slice(0, k));
    const a = M.TF.generate(TINY, prompt, 24 - k + 1, false), b = M.TF.generate(TINY, prompt, 24 - k + 1, true);
    const steps = a.perTok.length, yes = [b.prefill].concat(b.perTok.slice(0, steps - 1));
    g = { k, prompt: s.slice(0, k), gen: b.out.slice(k).map(letter).join(''), same: a.out.join() === b.out.join(), no: a.perTok, yes, noT: a.perTok.reduce((x, y) => x + y, 0), yesT: yes.reduce((x, y) => x + y, 0), mem: b.cacheNumbers };
  }
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv);
      if (!g) { c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(t('common.loading'), 12, 20); return; }
      const n = g.no.length, mx = Math.max(...g.no, ...g.yes), f = frame(w, h, [26, 12, 36, 56], 0, n, 0, mx * 1.05);
      const ys = [0, mx / 2, mx].map(v => v); yTicks(c, f, ys, v => fmtCount(v, 2)); axes(c, f, t('ch8.cv.x'), t('ch8.cv.y'));
      const bw = (f.R - f.L) / n;
      for (let i = 0; i < n; i++) {
        const x = f.L + i * bw;
        c.fillStyle = 'rgba(240,122,109,.75)'; c.fillRect(x + 1, f.Y(g.no[i]), Math.max(1, bw / 2 - 1), f.B - f.Y(g.no[i]));
        c.fillStyle = C.cyan; c.fillRect(x + bw / 2, f.Y(g.yes[i]), Math.max(1, bw / 2 - 1), f.B - f.Y(g.yes[i]));
      }
      xTicks(c, f, [0.5, n - 0.5], v => fmt(Math.round(v + 0.5)));
    }
  });
  function text() {
    put('#kvPo', fmt(+sP.value));
    if (!g) { ['#kvOut', '#kvNo', '#kvYes', '#kvMem'].forEach(id => put(id, '—')); putHTML('#kvSay', t('common.loading')); return; }
    put('#kvOut', g.gen); put('#kvNo', t('u.mac', { v: fmt(g.noT) })); put('#kvYes', t('u.mac', { v: fmt(g.yesT) })); put('#kvMem', fmt(g.mem));
    putHTML('#kvSay', g.same ? t('ch8.say', { p: g.prompt, gen: g.gen, no: fmt(g.noT), yes: fmt(g.yesT), x: fmt(g.noT / g.yesT, 1), mem: fmt(g.mem) }) : t('ch8.say.same'));
  }
  sim.text = text;
  const refresh = () => { compute(); sim.dirty = true; text(); };
  sP.addEventListener('input', refresh);
  whenTiny(refresh);
  text();
  return { refresh };
})();

/* ───────── 08b KV memory of real models ───────── */
(() => {
  const cv = $('#kmCv'), sT = $('#kmT'), sB = $('#kmB'), cG = $('#kmGqa');
  const st = () => { const id = radioVal('kmM'), cfg0 = M.PRESETS[id], cfg = cG.checked ? cfg0 : Object.assign({}, cfg0, { kv: cfg0.heads }); const T = Math.pow(2, +sT.value), n = Math.pow(2, +sB.value); const tok = M.kvBytesPerToken(cfg, 2), tokG = M.kvBytesPerToken(cfg0, 2), kv = tok * T * n, wB = M.countParams(cfg0).total * 2; return { id, T, n, tok, tokG, kv, wB }; };
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), s = st(), tot = s.wB + s.kv, L = 12, R = w - 12, y = 30, bh = Math.min(40, h - 80);
      const X = v => L + (R - L) * v / tot;
      c.fillStyle = C.violet; c.fillRect(L, y, X(s.wB) - L - 1, bh); c.fillStyle = C.cyan; c.fillRect(X(s.wB), y, X(tot) - X(s.wB), bh);
      const nG = Math.floor(tot / 80e9);
      if (nG <= 24) { c.strokeStyle = C.gold; c.setLineDash([4, 4]); for (let k = 1; k <= nG; k++) { const x = X(k * 80e9); c.beginPath(); c.moveTo(x, y - 6); c.lineTo(x, y + bh + 6); c.stroke(); } c.setLineDash([]); }
      c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText('0', L, y + bh + 18); c.textAlign = 'right'; c.fillText(fmtBytes(tot), R, y + bh + 18);
    }
  });
  function text() {
    const s = st();
    put('#kmTo', t('u.ctx', { v: fmt(s.T) })); put('#kmBo', fmt(s.n));
    put('#kmTok', fmtBytes(s.tok)); put('#kmAll', fmtBytes(s.kv)); put('#kmW', fmtBytes(s.wB)); put('#kmGpu', fmt(Math.ceil((s.wB + s.kv) / 80e9)));
    const v = { name: t('model.' + s.id), n: fmt(s.n), T: fmt(s.T), kv: fmtBytes(s.kv), w: fmtBytes(s.wB), tok: fmtBytes(s.tok), x: fmt(s.tok / s.tokG, 0) };
    putHTML('#kmSay', t(!cG.checked ? 'ch8.say.nogqa' : s.kv > s.wB ? 'ch8.say.big' : 'ch8.say.small', v));
  }
  sim.text = text;
  const redo = () => { sim.dirty = true; text(); };
  [sT, sB].forEach(e => e.addEventListener('input', redo)); cG.addEventListener('change', redo); onRadio('kmM', redo);
  text();
})();

/* ───────── 09a serving roofline ───────── */
(() => {
  const cv = $('#svCv'), sB = $('#svB'), sT = $('#svT'), sG = $('#svG'), sP = $('#svP');
  const base = () => ({ model: radioVal('svM'), hw: radioVal('svHw'), bits: +radioVal('svBits'), ctx: Math.pow(2, +sT.value), gpus: Math.pow(2, +sG.value), price: +sP.value });
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), b = base(), pts = [];
      for (let e = 0; e <= 9.0001; e += 0.125) { const r = M.serveStep(Object.assign({ batch: Math.pow(2, e) }, b)); pts.push([e, r]); }
      const vals = pts.flatMap(([, r]) => [r.tps, r.perUser]);
      const y0 = Math.floor(Math.log10(Math.min(...vals))), y1 = Math.ceil(Math.log10(Math.max(...vals)));
      const f = frame(w, h, [26, 14, 36, 50], 0, 9, y0, Math.max(y1, y0 + 1));
      const yt = []; for (let e = y0; e <= Math.max(y1, y0 + 1); e++) yt.push(e);
      yTicks(c, f, yt, e => fmt(Math.pow(10, e))); axes(c, f, t('ch9.cv.x'), t('ch9.cv.y'));
      xTicks(c, f, [0, 3, 6, 9], e => fmt(Math.pow(2, e)));
      // shade where weights + cache do not fit
      c.fillStyle = 'rgba(240,122,109,.18)';
      for (let i = 0; i < pts.length - 1; i++) if (!pts[i][1].fits) c.fillRect(f.X(pts[i][0]), f.T, f.X(pts[i + 1][0]) - f.X(pts[i][0]) + 0.5, f.B - f.T);
      path(c, pts.map(([e, r]) => [e, Math.log10(r.tps)]), f.X, f.Y, C.cyan, 2.4);
      path(c, pts.map(([e, r]) => [e, Math.log10(r.perUser)]), f.X, f.Y, C.gold, 2.2);
      const e = +sB.value, r = M.serveStep(Object.assign({ batch: Math.pow(2, e) }, b));
      dot(c, f.X(e), f.Y(Math.log10(r.tps)), C.cyan); dot(c, f.X(e), f.Y(Math.log10(r.perUser)), C.gold);
    }
  });
  function text() {
    const b = base(), batch = Math.pow(2, +sB.value), r = M.serveStep(Object.assign({ batch }, b));
    put('#svBo', fmt(batch)); put('#svTo', t('u.ctx', { v: fmt(b.ctx) })); put('#svGo', fmt(b.gpus)); put('#svPo', t('u.usdh', { v: fmt(b.price, 2) }));
    put('#svUser', t('u.tps', { v: fmt(r.perUser, 1) })); put('#svTot', t('u.tps', { v: fmt(r.tps, 0) })); put('#svCost', r.fits ? t('u.usdm', { v: fmtSig(r.costPerM, 3) }) : '—');
    put('#svBound', r.fits ? t('ch9.bound.' + r.bound) : '—');
    const v = { w: fmtBytes(r.wBytes), kv: fmtBytes(r.kv), gpus: t('u.gpus', { v: fmt(b.gpus) }), user: fmt(r.perUser, 1), tot: fmt(r.tps, 0), cost: fmtSig(r.costPerM, 3), b: fmt(batch), hint: t(r.kv > r.wBytes ? 'ch9.hint.cache' : 'ch9.hint.batch') };
    putHTML('#svSay', t(!r.fits ? 'ch9.say.nofit' : r.bound === 'memory' ? 'ch9.say.memory' : 'ch9.say.compute', v));
  }
  sim.text = text;
  const redo = () => { sim.dirty = true; text(); };
  [sB, sT, sG, sP].forEach(e => e.addEventListener('input', redo)); ['svM', 'svHw', 'svBits'].forEach(n => onRadio(n, redo));
  text();
})();

/* ───────── 09b quantising the tiny model ───────── */
(() => {
  const cv = $('#qzCv');
  let res = null;
  function compute() {
    if (!TINY) return;
    const bits = +radioVal('qzB'), q = M.TF.quantize(TINY, bits);
    res = { bits, q, e: evalOn(q.model, 'q' + bits), base: evalOn(TINY, 'base'), b32: M.TF.quantize(TINY, 32).bytes };
  }
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv);
      if (!res) { c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(t('common.loading'), 12, 20); return; }
      const Wm = TINY.W['l1.qkv.W'], cols = 96, rows = 32;
      let mx = 0, worst = 0; for (let k = 0; k < Wm.length; k++) mx = Math.max(mx, Math.abs(Wm[k]));
      // the column with the widest range sets the drawn grid
      let colMax = 0; for (let j = 0; j < cols; j++) { let m = 0; for (let i = 0; i < rows; i++) m = Math.max(m, Math.abs(Wm[i * cols + j])); if (m > colMax) { colMax = m; worst = j; } }
      const nb = 80, hist = new Array(nb).fill(0); for (let k = 0; k < Wm.length; k++) hist[Math.min(nb - 1, Math.floor((Wm[k] + mx) / (2 * mx) * nb))]++;
      const f = frame(w, h, [12, 24, 28, 24], -mx, mx, 0, Math.max(...hist) * 1.1);
      axes(c, f, '', ''); xTicks(c, f, [-mx, 0, mx], v => fmt(v, 2));
      c.fillStyle = 'rgba(179,157,251,.7)'; hist.forEach((v, i) => { const x0 = f.X(-mx + i * 2 * mx / nb), x1 = f.X(-mx + (i + 1) * 2 * mx / nb); c.fillRect(x0, f.Y(v), Math.max(1, x1 - x0 - 1), f.B - f.Y(v)); });
      if (res.bits < 32) { const lev = Math.pow(2, res.bits - 1) - 1, s = colMax / lev; c.strokeStyle = 'rgba(233,185,73,.8)'; c.lineWidth = 1; for (let k = -lev; k <= lev; k++) { const x = f.X(k * s); c.beginPath(); c.moveTo(x, f.T); c.lineTo(x, f.B); c.stroke(); } }
    }
  });
  function text() {
    if (!res) { ['#qzBytes', '#qzLoss', '#qzAcc'].forEach(id => put(id, '—')); putHTML('#qzSay', t('common.loading')); return; }
    const { bits, q, e, base, b32 } = res;
    put('#qzBytes', t('u.bytes', { v: fmt(q.bytes) })); put('#qzLoss', fmt(e.loss, 3)); put('#qzAcc', pct(e.accRep));
    const lab = document.querySelector('[data-i18n="ch9.read.loss"]'); if (lab) lab.textContent = t('ch9.read.loss', { base: fmt(base.loss, 3) });
    const v = { bits, bytes: t('u.bytes', { v: fmt(q.bytes) }), b32: t('u.bytes', { v: fmt(b32) }), base: fmt(base.loss, 3), loss: fmt(e.loss, 3), acc: fmt(e.accRep * 100, 1), levels: Math.pow(2, bits) - 1 };
    putHTML('#qzSay', t(bits === 32 ? 'ch9.say.q32' : e.accRep >= 0.99 ? 'ch9.say.qok' : e.accRep >= 0.5 ? 'ch9.say.qhurt' : 'ch9.say.qbroken', v));
  }
  sim.text = text;
  const redo = () => { compute(); sim.dirty = true; text(); };
  onRadio('qzB', redo); whenTiny(redo);
  text();
})();

/* ───────── 10a mixture of experts ───────── */
(() => {
  const cv = $('#moCv'), sK = $('#moK'), sCf = $('#moCf'), sSk = $('#moSk'), bGo = $('#moGo');
  let st = M.moeNew({ E: +radioVal('moE') }), running = false, acc = 0, r = null;
  const opts = () => ({ k: +sK.value, cf: +sCf.value, skew: +sSk.value });
  const route = () => { r = M.moeRoute(st, opts()); };
  const setRun = v => { running = v; bGo.setAttribute('aria-pressed', String(v)); bGo.textContent = t(v ? 'ch10.btn.stop' : 'ch10.btn.balance'); };
  const sim = reg(cv, {
    step(dt) {
      if (!running) return;
      acc += dt * 40; let n = Math.floor(acc); acc -= n;
      while (n-- > 0 && st.steps < 2000) M.moeBalanceStep(st, opts(), 0.01);
      if (st.steps >= 2000) setRun(false);
      route(); this.dirty = true; text();
    },
    draw() {
      const { c, w, h } = fit(cv), E = st.E, mx = Math.max(r.cap, ...r.load) * 1.1, f = frame(w, h, [16, 12, 30, 44], 0, E, 0, mx);
      yTicks(c, f, [0, Math.round(mx / 2), Math.round(mx)], v => fmt(v)); axes(c, f, t('ch10.cv.x'), '');
      const bw = (f.R - f.L) / E;
      for (let e = 0; e < E; e++) {
        const x = f.L + e * bw, kept = r.kept[e], drop = r.load[e] - kept;
        c.fillStyle = C.cyan; c.fillRect(x + 1, f.Y(kept), Math.max(1, bw - 2), f.B - f.Y(kept));
        if (drop > 0) { c.fillStyle = C.red; c.fillRect(x + 1, f.Y(r.load[e]), Math.max(1, bw - 2), f.Y(kept) - f.Y(r.load[e])); }
      }
      hline(c, f, r.cap, C.gold);
    }
  });
  function text() {
    put('#moKo', fmt(+sK.value)); put('#moCfo', fmt(+sCf.value, 2)); put('#moSko', fmt(+sSk.value, 1));
    put('#moDrop', pct(r.dropShare)); put('#moMax', fmt(r.maxOverMean, 2)); put('#moAux', fmt(r.aux, 2)); put('#moSteps', fmt(st.steps));
    const v = { max: fmt(r.maxOverMean, 1), drop: fmt(r.dropShare * 100, 1), aux: fmt(r.aux, 2), steps: st.steps ? t('ch10.say.steps', { n: fmt(st.steps) }) : t('ch10.say.nosteps') };
    putHTML('#moSay', t(r.dropShare > 0.02 || r.maxOverMean > 1.5 ? 'ch10.say.bad' : 'ch10.say.ok', v));
  }
  sim.text = () => { setRun(running); text(); };
  const redo = () => { route(); sim.dirty = true; text(); };
  [sK, sCf, sSk].forEach(e => e.addEventListener('input', redo));
  onRadio('moE', () => { st = M.moeNew({ E: +radioVal('moE') }); setRun(false); redo(); });
  bGo.addEventListener('click', () => {
    if (reduce) { for (let i = 0; i < 300 && st.steps < 2000; i++) M.moeBalanceStep(st, opts(), 0.01); redo(); return; }
    setRun(!running);
  });
  on('#moReset', 'click', () => { st = M.moeNew({ E: +radioVal('moE') }); setRun(false); redo(); });
  route(); setRun(false); text();
})();

/* ───────── 10b speculative decoding ───────── */
(() => {
  const cv = $('#spCv'), sA = $('#spA'), sG = $('#spG'), sC = $('#spC');
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), a = +sA.value, cc = +sC.value, g = +sG.value, pts = [];
      for (let k = 1; k <= 12; k++) pts.push([k, M.specSpeedup(a, k, cc)]);
      const mx = Math.max(2, Math.ceil(Math.max(...pts.map(p => p[1])) + 0.5)), f = frame(w, h, [20, 14, 34, 36], 1, 12, 0, mx);
      const yt = []; for (let v = 0; v <= mx; v++) yt.push(v);
      yTicks(c, f, yt, v => fmt(v)); axes(c, f, t('ch10.scv.x'), t('ch10.scv.y')); xTicks(c, f, [1, 4, 8, 12], v => fmt(v));
      hline(c, f, 1, C.mute); path(c, pts, f.X, f.Y, C.cyan, 2.2);
      const best = M.specBest(a, cc); if (best.gamma <= 12) dot(c, f.X(best.gamma), f.Y(best.speedup), C.green, 6);
      dot(c, f.X(g), f.Y(M.specSpeedup(a, g, cc)), C.gold, 5);
    }
  });
  function text() {
    const a = +sA.value, g = +sG.value, cc = +sC.value, sp = M.specSpeedup(a, g, cc), best = M.specBest(a, cc), simv = M.specSim(a, g, 20000).mean;
    put('#spAo', fmt(a, 2)); put('#spGo', fmt(g)); put('#spCo', fmt(cc, 2));
    put('#spTok', fmt(M.specTokens(a, g), 2)); put('#spSim', fmt(simv, 2)); put('#spSpeed', t('u.times', { v: fmt(sp, 2) })); put('#spBest', fmt(best.gamma));
    const v = { a: fmt(a, 2), g, c: fmt(cc, 2), tok: fmt(M.specTokens(a, g), 2), sim: fmt(simv, 2), sp: fmt(sp, 2), best: best.gamma, bsp: fmt(best.speedup, 2), slow: t(sp < 1 ? 'ch10.sp.slower' : 'ch10.sp.notslower') };
    putHTML('#spSay', t(sp > 1 && sp >= 0.9 * best.speedup ? 'ch10.sp.good' : 'ch10.sp.bad', v));
  }
  sim.text = text;
  const redo = () => { sim.dirty = true; text(); };
  [sA, sG, sC].forEach(e => e.addEventListener('input', redo));
  text();
})();

/* ───────── 11 ablation ───────── */
const ch11 = (() => {
  const cv = $('#abCv'), boxes = ['00', '01', '10', '11'].map(k => $('#ab' + k));
  let res = null, scores = null;
  const mask = () => boxes.map((b, i) => b.checked ? ['0.0', '0.1', '1.0', '1.1'][i] : null).filter(Boolean);
  function compute() {
    if (!TINY) return;
    const m = mask(), key = 'abl' + m.join('+');
    if (!scores) scores = M.TF.headScores(TINY, EVAL.slice(0, 100));
    let s = cleanText(ch1.str()); if (s.length < 2) s = EXAMPLE;
    res = { m, e: evalOn(TINY, key, { ablate: new Set(m) }), e0: evalOn(TINY, 'base'), str: s, rec: M.TF.forward(TINY, toIds(s), { ablate: new Set(m), record: true }).rec };
  }
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv);
      if (!res) { c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(t('common.loading'), 12, 20); return; }
      const [l, hd] = radioVal('abShow').split('.').map(Number), A = res.rec.attn[l][hd], n = res.str.length;
      const size = Math.min(w - 40, h - 30), cell = size / n, x0 = (w - size) / 2 + 8, y0 = 22;
      c.font = MONO; c.fillStyle = C.mute; c.textAlign = 'center';
      if (cell >= 9) for (let j = 0; j < n; j++) c.fillText(res.str[j], x0 + (j + 0.5) * cell, 10);
      const off = res.m.includes(l + '.' + hd);
      for (let i = 0; i < n; i++) for (let j = 0; j <= i; j++) { c.fillStyle = off ? '#1a1f2b' : heat(A[i * n + j], '99,199,230'); c.fillRect(x0 + j * cell, y0 + i * cell, Math.ceil(cell), Math.ceil(cell)); }
    }
  });
  function text() {
    if (!res) { ['#abAcc', '#abRep', '#abNew', '#abScore'].forEach(id => put(id, '—')); putHTML('#abSay', t('common.loading')); return; }
    const { m, e, e0 } = res, sh = radioVal('abShow'), sc = scores[['0.0', '0.1', '1.0', '1.1'].indexOf(sh)];
    put('#abAcc', pct(e.accRep)); put('#abRep', t('u.nats', { v: fmt(e.lossRep, 3) })); put('#abNew', t('u.nats', { v: fmt(e.lossNew, 3) })); put('#abScore', t('ch11.score', { p: fmt(sc.prev, 2), i: fmt(sc.ind, 2) }));
    const heads = m.map(k => t('head.' + k.replace('.', ''))).join(t('ch11.join'));
    const v = { heads, acc: fmt(e.accRep * 100, 1), rep: fmt(e.lossRep, 3), new: fmt(e.lossNew, 3), new0: fmt(e0.lossNew, 3), chance: fmt(100 / 26, 1) };
    putHTML('#abSay', t(!m.length ? 'ch11.say.none' : m.includes('1.1') ? 'ch11.say.ind' : m.includes('0.1') ? 'ch11.say.prev' : 'ch11.say.harmless', v));
  }
  sim.text = text;
  const refresh = () => { compute(); sim.dirty = true; text(); };
  boxes.forEach(b => b.addEventListener('change', refresh)); onRadio('abShow', () => { sim.dirty = true; text(); });
  whenTiny(refresh);
  text();
  return { refresh };
})();

/* ───────── 12 frontier compute ───────── */
(() => {
  const cv = $('#frCv'), sP = $('#frPick');
  const ALL = M.FRONTIER.compute.slice().sort((a, b) => a.date - b.date);
  const shown = () => { const s = radioVal('frSet'); return s === 'records' ? M.records(ALL) : s === 'known' ? ALL.filter(p => p.kind !== 'estimate') : ALL; };
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), pts = shown(), f = frame(w, h, [24, 16, 36, 48], 2020, 2027, 23, 28);
      yTicks(c, f, [23, 24, 25, 26, 27, 28], e => exp10(e)); axes(c, f, '', t('ch12.cv.y'));
      xTicks(c, f, [2020, 2022, 2024, 2026], v => String(v));
      [[25, 'ch12.cv.eu'], [26, 'ch12.cv.ca']].forEach(([e, k]) => { hline(c, f, e, C.mute, [4, 4]); c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(t(k), f.L + 6, f.Y(e) - 9); });
      const tr = M.computeTrend(pts); c.strokeStyle = 'rgba(122,214,160,.6)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(f.X(2020), f.Y(tr.icpt + tr.slope * 2020)); c.lineTo(f.X(2027), f.Y(tr.icpt + tr.slope * 2027)); c.save(); clipTo(c, f); c.stroke(); c.restore(); c.restore();
      const sel = pts[Math.min(+sP.value, pts.length - 1)];
      for (const p of pts) {
        const x = f.X(p.date), y = f.Y(Math.log10(p.flop));
        c.lineWidth = 2;
        if (p.kind === 'disclosed') dot(c, x, y, C.green, 5);
        else { c.strokeStyle = p.kind === 'derived' ? C.cyan : C.gold; if (p.kind === 'estimate') c.setLineDash([3, 2]); c.beginPath(); c.arc(x, y, 5, 0, 6.283); c.stroke(); c.setLineDash([]); }
        if (p === sel) { c.strokeStyle = C.ink; c.lineWidth = 1.5; c.beginPath(); c.arc(x, y, 10, 0, 6.283); c.stroke(); }
      }
    }
  });
  function text() {
    const pts = shown(); sP.max = String(pts.length - 1); if (+sP.value > pts.length - 1) sP.value = String(pts.length - 1);
    const p = pts[+sP.value], tr = M.computeTrend(pts);
    put('#frPicko', fmt(+sP.value + 1) + ' / ' + fmt(pts.length));
    put('#frName', t('ch12.name.' + p.id)); put('#frFlop', t('u.flop', { v: fmtSci(p.flop, 2) }));
    put('#frKind', p.kind === 'estimate' ? t('ch12.kind.estimate', { conf: t('ch12.conf.' + p.conf) }) : t('ch12.kind.' + p.kind));
    put('#frTrend', t('u.times', { v: fmt(tr.perYear, 1) }));
    putHTML('#frSay', t('ch12.say.' + radioVal('frSet'), { n: pts.length, x: fmt(tr.perYear, 1) }));
  }
  sim.text = text;
  const redo = () => { sim.dirty = true; text(); };
  sP.addEventListener('input', redo); onRadio('frSet', () => { sP.value = '99'; redo(); });
  text();
})();

/* ───────── loop ───────── */
applyLang();
let last = performance.now();
function tick(now) {
  const dt = Math.min((now - last) / 1000, 0.1); last = now;
  for (const s of sims) {
    if (!s.vis || !s.draw) continue;
    if (s.step) s.step(reduce ? 0 : dt);
    if (s.dirty) { s.draw(); s.dirty = false; }
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
window.__essayReady = true;
window.__essay = { whenTiny, loadTiny };
})();
