/* Scarcity moves: models, drawing, i18n and on-screen gating. All visible text comes from copy.*.js. */
(() => {
'use strict';
const $ = s => document.querySelector(s);
const COPY = window.ESSAY_COPY || {};
const C = { bg:'#0f1219', line:'#272d3b', ink:'#ebe8e0', mute:'#9aa1b0', dim:'#6b7283', gold:'#e9b949', cyan:'#63c7e6', red:'#ef6f61', green:'#7ad6a0', violet:'#a78bfa' };
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
function rng(seed) { let a = seed >>> 0; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ───────── language ─────────
   ╔══════════════════════════════════════════════════════════════════════════════╗
   ║ LANG_TOGGLE_ON: set to true once copy.en.js holds the real English text.     ║
   ║ While false the 中 | EN toggle stays hidden and the page always renders in   ║
   ║ Chinese, whatever knowledge-lang says, so no visitor sees a toggle that does ║
   ║ nothing. (Tests may force it on with window.__langToggleForTest = true.)     ║
   ╚══════════════════════════════════════════════════════════════════════════════╝ */
const LANG_TOGGLE_ON = true;
const toggleOn = (LANG_TOGGLE_ON || window.__langToggleForTest === true) && !!COPY.en;
const LS = 'knowledge-lang';
let memLang = null;
function readLang() { try { return localStorage.getItem(LS); } catch (e) { return memLang; } }
function writeLang(v) { memLang = v; try { localStorage.setItem(LS, v); } catch (e) { /* in-memory fallback */ } }
let lang = 'zh';
if (toggleOn) { lang = readLang(); if (lang !== 'zh' && lang !== 'en') lang = /^zh/i.test(navigator.language || '') ? 'zh' : 'en'; }
const effLang = () => (COPY[lang] ? lang : 'zh');
const isZh = () => effLang() === 'zh';
function t(key, vars) {
  let s = (COPY[lang] && COPY[lang][key] != null) ? COPY[lang][key] : (COPY.zh && COPY.zh[key] != null ? COPY.zh[key] : key);
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => vars[k] != null ? vars[k] : m);
  return s;
}

/* ───────── numbers ─────────
   Digits always use en-US grouping (1,234.5). What changes with the language is how big numbers are grouped
   into words: Chinese counts in 万 (10⁴), English in k / M. Unit words themselves come from the copy. */
const fmt = (x, d = 0) => x.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const trim0 = s => s.replace(/\.0+$/, '');
// English compact form: 15k, 15.8k, 158k, 1M, 2.5M
const compactEn = x => x >= 1e6 ? trim0(fmt(x / 1e6, 1)) + 'M' : x >= 1e3 ? trim0(fmt(x / 1e3, x < 1e5 ? 1 : 0)) + 'k' : fmt(x);
const pct = v => t('unit.pct', { v });
const timesNum = x => x >= 100 ? fmt(x) : x >= 10 ? fmt(x, 1) : fmt(x, 2);
const times = x => t('unit.times', { v: timesNum(x) });
// a speed-up factor that can reach a million: 1.5 万倍 in Chinese, 15k× in English
const bigTimes = m => m >= 1e4 ? (isZh() ? t('unit.wanTimes', { v: fmt(m / 1e4, m < 1e5 ? 1 : 0) }) : t('unit.times', { v: compactEn(m) })) : t('unit.times', { v: fmt(m, m < 10 ? 1 : 0) });
// axis label for 10^i, i = 0..6: 1, 10, 100, 1千, 1万, 10万, 100万 / 1, 10, 100, 1k, 10k, 100k, 1M
const pow10Label = i => i < 3 ? String(Math.pow(10, i)) : isZh() ? (i === 3 ? t('num.thousand', { v: 1 }) : t('num.wan', { v: fmt(Math.pow(10, i - 4)) })) : compactEn(Math.pow(10, i));

const relabel = []; // functions that rewrite JS-built text when the language changes
function applyStatic() {
  document.documentElement.lang = isZh() ? 'zh-CN' : 'en';
  document.title = t('doc.title');
  const md = document.querySelector('meta[name=description]'); if (md) md.content = t('doc.desc');
  const tagVars = { tagH: `<span class="tag h">${t('tag.h')}</span>`, tagM: `<span class="tag m">${t('tag.m')}</span>`, tagL: `<span class="tag l">${t('tag.l')}</span>` };
  document.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(e => { e.innerHTML = t(e.dataset.i18nHtml, tagVars); });
  document.querySelectorAll('[data-i18n-aria]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.i18nAria)); });
  const tg = $('#langToggle'); tg.hidden = !toggleOn;
  tg.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
}
function applyLang() { applyStatic(); relabel.forEach(f => f()); sims.forEach(touch); }
// the buttons live in a <template> and only enter the page when the toggle is on
if (toggleOn) $('#langToggle').appendChild($('#langToggleButtons').content.cloneNode(true));
document.querySelectorAll('#langToggle button').forEach(b => b.addEventListener('click', () => { lang = b.dataset.lang; writeLang(lang); applyLang(); }));

function fit(cv) {
  const r = cv.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
  const W = Math.max(1, Math.round(r.width * d)), H = Math.max(1, Math.round(r.height * d));
  if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
  const c = cv.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0); c.font = FONT; c.textBaseline = 'middle';
  return { c, w: r.width, h: r.height };
}
// every model registers here; it only runs while it is on screen
const sims = [];
const io = new IntersectionObserver(es => es.forEach(e => { const s = sims.find(s => s.cv === e.target); if (s) { s.vis = e.isIntersecting; s.dirty = true; } }), { rootMargin: '80px' });
function reg(cv, o) { o.cv = cv; o.vis = false; o.dirty = true; sims.push(o); io.observe(cv); return o; }
const touch = o => { o.dirty = true; };
window.addEventListener('resize', () => sims.forEach(touch));
function bind(id, fn) { const el = $(id); el.addEventListener('input', fn); return el; }

applyStatic();

/* ───────── hero: strangers meeting, trading, both better off ───────── */
(() => {
  const cv = $('#heroCv'), cols = [C.gold, C.cyan, C.green, C.violet], R = rng(11);
  let A = [], links = [], n = 0, val = 0, lastW = 0;
  const stat = () => { $('#heroStat').innerHTML = t('hero.stat', { n: `<b id="hsN">${fmt(n)}</b>`, v: `<b id="hsV">${fmt(val)}</b>` }); };
  stat(); relabel.push(stat);
  const init = (w, h) => { const N = Math.round(clamp(w * h / 9500, 36, 150)); A = Array.from({ length: N }, () => ({ x: R() * w, y: R() * h, vx: (R() - .5) * 26, vy: (R() - .5) * 26, k: (R() * 4) | 0, cd: R() * 2, g: 0 })); links = []; };
  reg(cv, {
    step(dt) {
      const { w, h } = fit(cv); if (Math.abs(w - lastW) > 40) { init(w, h); lastW = w; }
      if (reduce) dt = 0;
      for (const a of A) { a.x += a.vx * dt; a.y += a.vy * dt; if (a.x < 0 || a.x > w) a.vx *= -1; if (a.y < 0 || a.y > h) a.vy *= -1; a.x = clamp(a.x, 0, w); a.y = clamp(a.y, 0, h); a.cd -= dt; a.g = Math.max(0, a.g - dt * 1.4); }
      for (let i = 0; i < A.length; i++) for (let j = i + 1; j < A.length; j++) { const a = A[i], b = A[j]; if (a.cd > 0 || b.cd > 0 || a.k === b.k) continue;
        const dx = a.x - b.x, dy = a.y - b.y; if (dx * dx + dy * dy < 2300) { a.cd = b.cd = 1.6 + R() * 2; a.g = b.g = 1; const t = a.k; a.k = b.k; b.k = t; links.push({ a, b, l: 1 }); n++; val += 3 + R() * 9; } }
      links = links.filter(l => (l.l -= dt * 1.2) > 0);
    },
    draw() {
      const { c, w, h } = fit(cv); c.clearRect(0, 0, w, h);
      for (const l of links) { c.strokeStyle = `rgba(233,185,73,${l.l * 0.7})`; c.lineWidth = 1.2; c.beginPath(); c.moveTo(l.a.x, l.a.y); c.lineTo(l.b.x, l.b.y); c.stroke(); }
      for (const a of A) { c.globalAlpha = 0.55 + a.g * 0.45; c.fillStyle = cols[a.k]; c.beginPath(); c.arc(a.x, a.y, 2.4 + a.g * 3.2, 0, 6.283); c.fill(); }
      c.globalAlpha = 1; $('#hsN').textContent = fmt(n); $('#hsV').textContent = fmt(val);
    }
  });
})();

/* ───────── 01 production possibility frontier ───────── */
(() => {
  const cv = $('#ppfCv'), K = s => 25 * Math.sqrt(s), M = h => 100 * Math.sqrt(h);
  const o = reg(cv, { draw() {
    const { c, w, h } = fit(cv), s = +sl.value, L = 44, Rr = 16, T = 18, B = 34;
    const X = m => L + (w - L - Rr) * m / 420, Y = k => h - B - (h - T - B) * k / 108;
    c.clearRect(0, 0, w, h);
    c.beginPath(); c.moveTo(X(0), Y(0)); for (let t = 0; t <= 16; t += 0.25) c.lineTo(X(M(16 - t)), Y(K(t))); c.closePath();
    c.fillStyle = 'rgba(99,199,230,.09)'; c.fill();
    c.beginPath(); for (let t = 0; t <= 16; t += 0.25) c[t ? 'lineTo' : 'moveTo'](X(M(16 - t)), Y(K(t))); c.strokeStyle = C.cyan; c.lineWidth = 2.5; c.stroke();
    c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(X(0), T - 6); c.lineTo(X(0), Y(0)); c.lineTo(w - Rr + 6, Y(0)); c.stroke();
    const px = X(M(16 - s)), py = Y(K(s));
    c.setLineDash([4, 4]); c.strokeStyle = C.dim; c.beginPath(); c.moveTo(px, py); c.lineTo(px, Y(0)); c.moveTo(px, py); c.lineTo(X(0), py); c.stroke(); c.setLineDash([]);
    c.fillStyle = C.gold; c.shadowColor = C.gold; c.shadowBlur = 16; c.beginPath(); c.arc(px, py, 7, 0, 6.283); c.fill(); c.shadowBlur = 0;
    c.fillStyle = C.mute; c.textAlign = 'right'; c.fillText(t('ch1.cv.money'), w - Rr, h - 14); c.textAlign = 'left'; c.fillText(t('ch1.cv.learn'), X(0) + 8, T - 4);
    c.fillStyle = C.dim; c.textAlign = 'center'; c.fillText(t('ch1.cv.out'), X(350), Y(88)); c.fillText(t('ch1.cv.waste'), X(110), Y(26));
  } });
  const sl = bind('#ppfS', upd);
  function upd() {
    const s = +sl.value, h = 16 - s;
    $('#ppfO').textContent = t('ch1.unit.hours', { v: s }); $('#ppfK').textContent = fmt(K(s), 1); $('#ppfM').textContent = fmt(M(h));
    const dK = s < 16 ? K(Math.min(16, s + 1)) - K(s) : 0, dM = s < 16 ? M(h) - M(Math.max(0, h - 1)) : 0;
    $('#ppfdK').textContent = s < 16 ? t('ch1.unit.points', { v: fmt(dK, 1) }) : '—'; $('#ppfdM').textContent = s < 16 ? t('ch1.unit.yuan', { v: fmt(dM) }) : '—';
    $('#ppfSay').innerHTML = s >= 16 ? t('ch1.say.all') : s <= 0 ? t('ch1.say.none') : t('ch1.say.mid', { dm: fmt(dM) });
    touch(o);
  }
  upd(); relabel.push(upd);
})();

/* ───────── 03 comparative advantage ───────── */
(() => {
  const ids = ['#tA1', '#tA2', '#tB1', '#tB2'], H = 8;
  const bar = (name, h1) => `<div class="row"><span>${name}</span><div class="hbar"><i class="t1" style="width:${h1 / H * 100}%"></i><i class="t2" style="width:${(H - h1) / H * 100}%"></i></div></div>`;
  const tot = (label, v, max, cls) => `<div class="row"><span>${label}</span><div class="hbar"><i class="${cls}" style="width:${v / max * 100}%"></i></div><b>${fmt(v, v % 1 ? 1 : 0)}</b></div>`;
  function upd() {
    const [a1, a2, b1, b2] = ids.map(i => +$(i).value);
    ids.forEach(i => { $(i + 'o').textContent = $(i).value; });
    const g1 = H / 2 * (a1 + b1), g2 = H / 2 * (a2 + b2), ocA = a2 / a1, ocB = b2 / b1, Afirst = ocA <= ocB;
    const p = Afirst ? [a1, a2] : [b1, b2], q = Afirst ? [b1, b2] : [a1, a2];
    let hp, hq; if (H * p[0] >= g1) { hp = g1 / p[0]; hq = 0; } else { hp = H; hq = (g1 - H * p[0]) / q[0]; }
    const n2 = (H - hp) * p[1] + (H - hq) * q[1], hA = Afirst ? hp : hq, hB = Afirst ? hq : hp, max = Math.max(g1, g2, n2), gain = n2 - g2;
    const nA = t('ch3.nameA'), nB = t('ch3.nameB'), tq = t('ch3.tot.q'), tp = t('ch3.tot.p');
    $('#planA').innerHTML = `<h5>${t('ch3.plan.alone')}</h5>${bar(nA, H / 2)}${bar(nB, H / 2)}<div class="tot">${tot(tq, g1, max, 't1')}${tot(tp, g2, max, 't2')}</div>`;
    $('#planB').innerHTML = `<h5>${t('ch3.plan.split')}</h5>${bar(nA, hA)}${bar(nB, hB)}<div class="tot">${tot(tq, g1, max, 't1')}${tot(tp, n2, max, 't2')}</div>`;
    // one whole sentence per case: who is faster at both (if anyone) × who should write more
    const strong = a1 > b1 && a2 > b2 ? 'aFaster' : b1 > a1 && b2 > a2 ? 'bFaster' : 'mixed';
    $('#tSay').innerHTML = gain < 0.05 ? t('ch3.say.same')
      : t(`ch3.say.${strong}.${Afirst ? 'A' : 'B'}`, { ocA: fmt(ocA, 2), ocB: fmt(ocB, 2), gain: fmt(gain, 1) });
  }
  ids.forEach(i => bind(i, upd)); upd(); relabel.push(upd);
})();

/* ───────── 04 a market finding its price ───────── */
(() => {
  const cv = $('#mkCv'), N = 80, R = rng(4);
  const v0 = Array.from({ length: N }, () => 15 + R() * 95).sort((a, b) => b - a), c0 = Array.from({ length: N }, () => 10 + R() * 95).sort((a, b) => a - b);
  let dS = 0, sS = 0, dT = 0, sT = 0, p = 20;
  const cap = $('#mkCap'), capOn = $('#mkCapOn');
  reg(cv, {
    step(dt) {
      dS += (dT - dS) * Math.min(1, dt * 4); sS += (sT - sS) * Math.min(1, dt * 4);
      const D = v0.filter(v => v + dS >= p).length, S = c0.filter(c => c + sS <= p).length;
      p = clamp(p + (D - S) * 2.4 * dt, 2, 135); if (capOn.checked) p = Math.min(p, +cap.value);
    },
    draw() {
      const { c, w, h } = fit(cv), L = 40, Rr = 14, T = 14, B = 30, X = q => L + (w - L - Rr) * q / N, Y = v => h - B - (h - T - B) * v / 140;
      c.clearRect(0, 0, w, h);
      const D = v0.filter(v => v + dS >= p).length, S = c0.filter(x => x + sS <= p).length, Q = Math.min(D, S);
      c.beginPath(); for (let i = 0; i < Q; i++) { c.lineTo(X(i), Y(v0[i] + dS)); c.lineTo(X(i + 1), Y(v0[i] + dS)); } for (let i = Q - 1; i >= 0; i--) { c.lineTo(X(i + 1), Y(c0[i] + sS)); c.lineTo(X(i), Y(c0[i] + sS)); }
      c.closePath(); c.fillStyle = 'rgba(122,214,160,.13)'; c.fill();
      const step = (arr, sh, col) => { c.beginPath(); arr.forEach((v, i) => { c.lineTo(X(i), Y(v + sh)); c.lineTo(X(i + 1), Y(v + sh)); }); c.strokeStyle = col; c.lineWidth = 2; c.stroke(); };
      step(v0, dS, C.cyan); step(c0, sS, C.gold);
      c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(L, T - 4); c.lineTo(L, Y(0)); c.lineTo(w - Rr, Y(0)); c.stroke();
      const py = Y(p); c.strokeStyle = C.ink; c.lineWidth = 1.5; c.shadowColor = C.ink; c.shadowBlur = 8; c.beginPath(); c.moveTo(L, py); c.lineTo(w - Rr, py); c.stroke(); c.shadowBlur = 0;
      if (capOn.checked && p >= +cap.value - 0.01 && D > S) { c.strokeStyle = C.red; c.lineWidth = 5; c.beginPath(); c.moveTo(X(S), py); c.lineTo(X(D), py); c.stroke(); c.fillStyle = C.red; c.textAlign = 'center'; c.fillText(t('ch4.cv.shortage'), (X(S) + X(D)) / 2, py - 13); }
      c.fillStyle = C.mute; c.textAlign = 'right'; c.fillText(t('ch4.cv.qty'), w - Rr, h - 12); c.textAlign = 'left'; c.fillText(t('ch4.cv.price'), L + 8, T);
      c.fillStyle = C.cyan; c.fillText(t('ch4.cv.buyers'), X(2), Y(v0[0] + dS) + 14 > Y(0) - 10 ? T + 16 : Math.max(T + 16, Y(v0[0] + dS) - 10));
      c.fillStyle = C.gold; c.textAlign = 'right'; c.fillText(t('ch4.cv.sellers'), X(N) - 2, Math.max(T + 16, Y(c0[N - 1] + sS) - 10));
      $('#mkP').textContent = fmt(p); $('#mkQ').textContent = t('ch4.unit.items', { v: Q }); $('#mkX').textContent = t('ch4.unit.people', { v: Math.max(0, D - S) });
    }
  });
  $('#mkD').onclick = e => { dT = dT ? 0 : 28; e.target.classList.toggle('on', !!dT); };
  $('#mkS').onclick = e => { sT = sT ? 0 : 28; e.target.classList.toggle('on', !!sT); };
  const cu = () => { $('#mkCapO').textContent = cap.value; }; cap.addEventListener('input', () => { capOn.checked = true; cu(); }); cu();
})();

/* ───────── 06 the commons ───────── */
(() => {
  const cv = $('#cmCv'), cv2 = $('#cmCv2'), Kc = 1000, r = 0.6, q = 0.024, R = rng(9);
  let N = 700; const bS = $('#cmB'), qt = $('#cmQ');
  const fish = Array.from({ length: 130 }, () => ({ x: R(), y: 0.2 + R() * 0.74, v: (0.02 + R() * 0.05) * (R() < .5 ? -1 : 1), ph: R() * 6.28, s: 0.7 + R() * 0.7 }));
  const eff = () => qt.checked ? Math.min(+bS.value, 12) : +bS.value;
  let t0 = 0;
  reg(cv, {
    step(dt) { t0 += dt; const yr = dt / 1.3, b = eff(); N = clamp(N + (r * N * (1 - N / Kc) - q * b * N) * yr, 0, Kc); if (N < 0.5) N = 0; for (const f of fish) { f.x += f.v * dt; if (f.x < -0.05) f.x = 1.05; if (f.x > 1.05) f.x = -0.05; } },
    draw() {
      const { c, w, h } = fit(cv); const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#12324a'); g.addColorStop(1, '#0a1622'); c.fillStyle = g; c.fillRect(0, 0, w, h);
      const n = Math.round(N / 8);
      for (let i = 0; i < n && i < fish.length; i++) { const f = fish[i], x = f.x * w, y = f.y * h + Math.sin(t0 * 1.5 + f.ph) * 5, d = f.v > 0 ? 1 : -1, s = f.s * 6;
        c.fillStyle = 'rgba(160,220,240,.85)'; c.beginPath(); c.ellipse(x, y, s, s * 0.45, 0, 0, 6.283); c.fill(); c.beginPath(); c.moveTo(x - d * s, y); c.lineTo(x - d * s * 1.9, y - s * 0.55); c.lineTo(x - d * s * 1.9, y + s * 0.55); c.fill(); }
      const b = +bS.value, e = eff();
      for (let i = 0; i < b; i++) { const x = w * (i + 0.5) / Math.max(b, 10), y = 22 + Math.sin(t0 * 1.2 + i) * 2, on = i < e; c.globalAlpha = on ? 1 : 0.25;
        c.fillStyle = C.gold; c.beginPath(); c.moveTo(x - 11, y); c.lineTo(x + 11, y); c.lineTo(x + 7, y + 7); c.lineTo(x - 7, y + 7); c.closePath(); c.fill(); c.fillRect(x - 1, y - 11, 2, 11);
        if (on) { c.strokeStyle = 'rgba(233,185,73,.3)'; c.beginPath(); c.moveTo(x, y + 7); c.lineTo(x, y + 30); c.stroke(); } }
      c.globalAlpha = 1; if (N === 0) { c.fillStyle = C.red; c.textAlign = 'center'; c.font = '15px ' + FONT.slice(5); c.fillText(t('ch6.cv.empty'), w / 2, h / 2); }
      $('#cmN').textContent = fmt(N); $('#cmE').textContent = fmt(q * N, 1); $('#cmT').textContent = fmt(q * e * N); $('#cmBo').textContent = e < b ? t('ch6.unit.boatsOut', { b, e }) : t('ch6.unit.boats', { b });
      touch(o2);
    }
  });
  const o2 = reg(cv2, { draw() {
    const { c, w, h } = fit(cv2), L = 40, T = 22, B = 26, ym = q * 12.5 * Kc * 0.5, Y = v => h - B - (h - T - B) * v / (ym * 1.1);
    // the axis name sits at the bottom right; where it would run into the "25" tick (narrow screens, longer
    // words), the plot ends earlier so the name stands past the end of the axis instead
    const lw = c.measureText(t('ch6.cv.boats')).width, tw = c.measureText('25').width;
    const Rr = L + (w - L - 14) * 25 / 30 + tw / 2 + 8 > w - 14 - lw ? Math.ceil(lw) + 22 : 14, ax = Rr > 14 ? w - 8 : w - Rr;
    const X = b => L + (w - L - Rr) * b / 30;
    c.clearRect(0, 0, w, h); c.strokeStyle = C.line; c.beginPath(); c.moveTo(L, T - 8); c.lineTo(L, Y(0)); c.lineTo(w - Rr, Y(0)); c.stroke();
    const f = b => Math.max(0, q * b * Kc * (1 - q * b / r));
    c.beginPath(); for (let b = 0; b <= 30; b += 0.25) c[b ? 'lineTo' : 'moveTo'](X(b), Y(f(b))); c.strokeStyle = C.gold; c.lineWidth = 2; c.stroke();
    const e = eff(); c.fillStyle = C.ink; c.beginPath(); c.arc(X(e), Y(f(e)), 5.5, 0, 6.283); c.fill();
    c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(t('ch6.cv.yield'), L + 8, T - 8); c.textAlign = 'right'; c.fillText(t('ch6.cv.boats'), ax, h - 10);
    c.fillStyle = C.dim; c.textAlign = 'center'; [0, 12, 25].forEach(b => c.fillText(b, X(b), h - 10));
  } });
  bS.addEventListener('input', () => touch(o2)); qt.addEventListener('change', () => touch(o2)); $('#cmR').onclick = () => { N = 700; };
})();

/* ───────── 07 compounding ───────── */
(() => {
  const cv = $('#grCv'), sl = $('#grG');
  const o = reg(cv, { draw() {
    const { c, w, h } = fit(cv), g = +sl.value / 100, L = 44, Rr = 16, T = 16, B = 30, ym = Math.max(4.4, Math.pow(1 + g, 70) * 1.08);
    const X = t => L + (w - L - Rr) * t / 70, Y = v => h - B - (h - T - B) * v / ym;
    c.clearRect(0, 0, w, h); c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(L, T - 4); c.lineTo(L, Y(0)); c.lineTo(w - Rr, Y(0)); c.stroke();
    c.fillStyle = C.dim; c.textAlign = 'right'; const stepv = ym > 150 ? 50 : ym > 60 ? 20 : ym > 24 ? 10 : ym > 10 ? 4 : 1;
    for (let v = stepv; v < ym; v += stepv) { c.fillText('×' + v, L - 6, Y(v)); c.strokeStyle = 'rgba(39,45,59,.6)'; c.beginPath(); c.moveTo(L, Y(v)); c.lineTo(w - Rr, Y(v)); c.stroke(); }
    c.textAlign = 'center'; [0, 10, 20, 30, 40, 50, 60, 70].forEach(t => c.fillText(t, X(t), h - 12));
    const line = (r, col, lw) => { c.beginPath(); for (let t = 0; t <= 70; t++) c[t ? 'lineTo' : 'moveTo'](X(t), Y(Math.pow(1 + r, t))); c.strokeStyle = col; c.lineWidth = lw; c.stroke(); };
    line(0.01, C.dim, 1); line(0.02, C.mute, 1); line(g, C.gold, 3);
    c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(t('ch7.cv.years'), L + 8, T);
  } });
  function upd() { const g = +sl.value; $('#grGo').textContent = pct(g.toFixed(1)); $('#grX').textContent = times(Math.pow(1 + g / 100, 70)); $('#grD').textContent = g > 0 ? t('ch7.unit.years', { v: fmt(Math.log(2) / Math.log(1 + g / 100), 0) }) : t('ch7.unit.never'); touch(o); }
  sl.addEventListener('input', upd); upd(); relabel.push(upd);
})();

/* ───────── 08 circular flow & the paradox of thrift ───────── */
(() => {
  const cv = $('#flCv'), sl = $('#flS'), A = 20, NN = 14, R = rng(3);
  let Y = 100, acc = 0, P = [];
  reg(cv, {
    step(dt) { const s = +sl.value / 100; Y += ((1 - s) * Y + A - Y) * Math.min(1, dt * 0.9); acc += Y * 0.3 * dt;
      while (acc > 1 && P.length < 260) { acc -= 1; const a = (R() * NN) | 0; let b = (R() * NN) | 0; if (b === a) b = (b + 1 + ((R() * (NN - 2)) | 0)) % NN; P.push({ a, b, t: 0, v: 0.7 + R() * 0.6 }); }
      if (acc > 3) acc = 3; P = P.filter(p => (p.t += dt * p.v) < 1); },
    draw() {
      const { c, w, h } = fit(cv), cx = w / 2, cy = h / 2, rad = Math.min(w * 0.42, h * 0.38), s = +sl.value / 100;
      c.clearRect(0, 0, w, h); const pt = i => [cx + Math.cos(i / NN * 6.283 - 1.57) * rad * (w > h * 1.6 ? 1.5 : 1), cy + Math.sin(i / NN * 6.283 - 1.57) * rad];
      for (const p of P) { const [x0, y0] = pt(p.a), [x1, y1] = pt(p.b), t = p.t, u = 1 - t, x = u * u * x0 + 2 * u * t * cx + t * t * x1, y = u * u * y0 + 2 * u * t * cy + t * t * y1;
        c.fillStyle = `rgba(233,185,73,${0.25 + 0.75 * Math.sin(t * 3.14)})`; c.beginPath(); c.arc(x, y, 2.6, 0, 6.283); c.fill(); }
      const nr = 5 + Math.sqrt(Y) * 0.9; for (let i = 0; i < NN; i++) { const [x, y] = pt(i); c.fillStyle = '#1d2433'; c.strokeStyle = C.cyan; c.lineWidth = 1.5; c.beginPath(); c.arc(x, y, nr, 0, 6.283); c.fill(); c.stroke(); }
      c.textAlign = 'center'; c.fillStyle = C.mute; c.fillText(t('ch8.cv.income'), cx, cy - 20); c.fillStyle = C.ink; c.font = '600 30px ' + FONT.slice(5); c.fillText(fmt(Y), cx, cy + 8);
      $('#flSo').textContent = t('ch8.unit.yuan', { v: sl.value }); $('#flY').textContent = fmt(Y); $('#flC').textContent = fmt((1 - s) * Y); $('#flSv').textContent = fmt(s * Y, 1);
      $('#flSay').innerHTML = t('ch8.say', { s: s.toFixed(2), y: fmt(A / s) });
    }
  });
})();

/* ───────── 09 the yard-sale model ───────── */
(() => {
  const cv = $('#ysCv'), sl = $('#ysT'), N = 160, R = rng(21);
  let W, top = 100; const reset = () => { W = new Float64Array(N).fill(100); top = 100; }; reset();
  reg(cv, {
    step() { for (let k = 0; k < 40; k++) { const i = (R() * N) | 0; let j = (R() * N) | 0; if (i === j) continue; const st = 0.15 * Math.min(W[i], W[j]); if (R() < 0.5) { W[i] += st; W[j] -= st; } else { W[i] -= st; W[j] += st; } }
      const x = +sl.value / 100 * 0.5; /* each person is in about half a trade per frame */ if (x > 0) for (let i = 0; i < N; i++) W[i] += x * (100 - W[i]); },
    draw() {
      const { c, w, h } = fit(cv), S = Array.from(W).sort((a, b) => a - b), L = 12, B = 22, T = 16;
      top += (Math.max(S[N - 1], 250) - top) * 0.08; c.clearRect(0, 0, w, h);
      const bw = (w - L * 2) / N, yl = h - B - (h - T - B) * 100 / top;
      for (let i = 0; i < N; i++) { const bh = (h - T - B) * S[i] / top; c.fillStyle = S[i] >= 100 ? C.gold : C.cyan; c.globalAlpha = 0.9; c.fillRect(L + i * bw, h - B - bh, Math.max(1, bw - 1), bh); }
      c.globalAlpha = 1; c.setLineDash([4, 4]); c.strokeStyle = C.mute; c.beginPath(); c.moveTo(L, yl); c.lineTo(w - L, yl); c.stroke(); c.setLineDash([]);
      c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(t('ch9.cv.start'), L + 4, yl - 10); c.fillText(t('ch9.cv.poorest'), L, h - 9); c.textAlign = 'right'; c.fillText(t('ch9.cv.richest'), w - L, h - 9);
      let cum = 0, g = 0; const tot = N * 100; for (let i = 0; i < N; i++) { cum += S[i]; g += cum; } const gini = 1 - 2 * (g / tot) / N + 1 / N;
      let t10 = 0; for (let i = N - N / 10; i < N; i++) t10 += S[i]; let b50 = 0; for (let i = 0; i < N / 2; i++) b50 += S[i];
      $('#ysG').textContent = gini.toFixed(2); $('#ysTop').textContent = pct(fmt(t10 / tot * 100)); $('#ysBot').textContent = pct(fmt(b50 / tot * 100)); $('#ysTo').textContent = pct((+sl.value).toFixed(2));
    }
  });
  $('#ysR').onclick = reset;
})();

/* ───────── 11 the bottleneck (Amdahl) ───────── */
(() => {
  const cv = $('#bnCv'), F = $('#bnF'), Ms = $('#bnM'), out = (f, m) => 1 / ((1 - f) + f / m);
  const o = reg(cv, { draw() {
    const { c, w, h } = fit(cv), f = +F.value / 100, lm = +Ms.value, L = 44, Rr = 16, T = 22, B = 30, lim = 1 / (1 - f), ym = Math.max(2.2, lim * 1.18);
    const X = l => L + (w - L - Rr) * l / 6, Y = v => h - B - (h - T - B) * (v - 1) / (ym - 1);
    c.clearRect(0, 0, w, h); c.strokeStyle = C.line; c.beginPath(); c.moveTo(L, T - 8); c.lineTo(L, Y(1)); c.lineTo(w - Rr, Y(1)); c.stroke();
    c.fillStyle = C.dim; c.textAlign = 'center'; for (let i = 0; i <= 6; i++) c.fillText(pow10Label(i), X(i), h - 12);
    c.textAlign = 'right'; c.fillText('×1', L - 6, Y(1));
    c.setLineDash([5, 5]); c.strokeStyle = C.red; c.beginPath(); c.moveTo(L, Y(lim)); c.lineTo(w - Rr, Y(lim)); c.stroke(); c.setLineDash([]);
    c.fillStyle = C.red; c.textAlign = 'right'; c.fillText(t('ch11.cv.cap', { v: lim >= 10 ? fmt(lim, 0) : fmt(lim, 2) }), w - Rr, Y(lim) - 11);
    c.beginPath(); for (let l = 0; l <= 6.001; l += 0.05) c[l ? 'lineTo' : 'moveTo'](X(l), Y(out(f, Math.pow(10, l)))); c.strokeStyle = C.gold; c.lineWidth = 3; c.stroke();
    const y = out(f, Math.pow(10, lm)); c.fillStyle = C.ink; c.shadowColor = C.gold; c.shadowBlur = 14; c.beginPath(); c.arc(X(lm), Y(y), 6.5, 0, 6.283); c.fill(); c.shadowBlur = 0;
    c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(t('ch11.cv.output'), L + 8, T - 8);
  } });
  function upd() {
    const f = +F.value / 100, m = Math.pow(10, +Ms.value), y = out(f, m), a = (f / m) * y, b = (1 - f) * y;
    $('#bnFo').textContent = pct(F.value); $('#bnMo').textContent = bigTimes(m);
    $('#bnY').textContent = times(y); $('#bnL').textContent = times(1 / (1 - f)); $('#bnS').textContent = pct(fmt(b * 100));
    $('#bnA').style.width = a * 100 + '%'; $('#bnB').style.width = b * 100 + '%'; touch(o);
  }
  F.addEventListener('input', upd); Ms.addEventListener('input', upd); upd(); relabel.push(upd);
})();

/* ───────── 12 wages when compute grows ─────────
   Y = (sqrt(X1 X2))^(1-beta);  X1 = humans_on_A + K_on_A;  X2 = humans_on_B + rho * K_on_B;  one unit of humans. */
(() => {
  const cv = $('#wgCv'), Ks = $('#wgK'), Rs = $('#wgR'), Bc = $('#wgB');
  function solve(K, rho, beta) {
    let X1, X2, ph;
    if (K < 1) { X1 = X2 = (1 + K) / 2; ph = 1; } else if (rho * K <= 1) { X1 = K; X2 = 1; ph = 2; } else { X2 = (1 + rho * K) / 2; X1 = (1 + rho * K) / (2 * rho); ph = 3; }
    const Y = Math.pow(Math.sqrt(X1 * X2), 1 - beta), w = 0.5 * (1 - beta) * Y / X2, Y0 = Math.pow(0.5, 1 - beta), w0 = (1 - beta) * Y0;
    return { Y: Y / Y0, w: w / w0, share: w / Y, ph };
  }
  const o = reg(cv, { draw() {
    const { c, w, h } = fit(cv), rho = Math.pow(10, +Rs.value), beta = Bc.checked ? 0.3 : 0, lk = +Ks.value;
    const L = 40, Rr = 14, T = 26, B = 28, gap = 16, h2 = Math.round((h - T - B) * 0.27), h1 = h - T - B - h2 - gap;
    const X = l => L + (w - L - Rr) * (l + 2) / 6, Y = v => T + h1 - h1 * (Math.log10(v) + 1) / 5, Ys = s => h - B - h2 * s;
    c.clearRect(0, 0, w, h);
    const b1 = 0, b2 = -Math.log10(rho);
    [[-2, b1, 'rgba(99,199,230,.05)'], [b1, Math.min(4, b2), 'rgba(233,185,73,.07)'], [Math.min(4, b2), 4, 'rgba(239,111,97,.06)']].forEach(([a, b, col], i) => { if (b <= a) return; c.fillStyle = col; c.fillRect(X(a), T, X(b) - X(a), h - T - B);
      if (X(b) - X(a) > 22) { c.fillStyle = C.ink; c.textAlign = 'center'; c.font = '15px ' + FONT.slice(5); c.fillText(['①', '②', '③'][i], (X(a) + X(b)) / 2, T - 12); c.font = FONT; } });
    c.strokeStyle = 'rgba(39,45,59,.8)'; c.lineWidth = 1; c.fillStyle = C.dim; c.textAlign = 'right';
    for (let e = -1; e <= 4; e++) { c.beginPath(); c.moveTo(L, Y(Math.pow(10, e))); c.lineTo(w - Rr, Y(Math.pow(10, e))); c.stroke(); }
    c.fillText('1', L - 6, Y(1)); c.fillText('100', L - 6, Y(100)); c.fillText(pct(0), L - 6, Ys(0)); c.fillText(pct(100), L - 6, Ys(1));
    c.strokeStyle = C.mute; c.setLineDash([3, 4]); c.beginPath(); c.moveTo(L, Y(1)); c.lineTo(w - Rr, Y(1)); c.stroke(); c.setLineDash([]);
    c.strokeStyle = C.line; c.strokeRect(L, h - B - h2, w - L - Rr, h2);
    const curve = (fn, map, col, lw) => { c.beginPath(); for (let l = -2; l <= 4.001; l += 0.04) { const s = solve(Math.pow(10, l), rho, beta); c[l > -2 ? 'lineTo' : 'moveTo'](X(l), map(fn(s))); } c.strokeStyle = col; c.lineWidth = lw; c.stroke(); };
    curve(s => s.Y, v => Y(Math.min(v, 1e4)), C.cyan, 2); curve(s => s.w, v => Y(Math.max(v, 0.1)), C.gold, 3); curve(s => s.share, Ys, C.violet, 2.5);
    const s = solve(Math.pow(10, lk), rho, beta); c.strokeStyle = C.ink; c.lineWidth = 1; c.beginPath(); c.moveTo(X(lk), T); c.lineTo(X(lk), h - B); c.stroke();
    [[Y(Math.min(s.Y, 1e4)), C.cyan], [Y(Math.max(s.w, 0.1)), C.gold], [Ys(s.share), C.violet]].forEach(([y, col]) => { c.fillStyle = col; c.beginPath(); c.arc(X(lk), y, 5, 0, 6.283); c.fill(); });
    c.fillStyle = C.mute; c.textAlign = 'right'; c.fillText(t('ch12.cv.compute'), w - Rr, h - 10);
  } });
  function upd() {
    const rho = Math.pow(10, +Rs.value), K = Math.pow(10, +Ks.value), beta = Bc.checked ? 0.3 : 0, s = solve(K, rho, beta);
    $('#wgKo').textContent = K >= 100 ? fmt(K) : K >= 1 ? fmt(K, 1) : fmt(K, 2); $('#wgRo').textContent = t('ch12.unit.rho', { v: fmt(rho * 100, rho < 0.1 ? 1 : 0) });
    $('#wgY').textContent = timesNum(s.Y); $('#wgW').textContent = fmt(s.w, 2); $('#wgS').textContent = pct(fmt(s.share * 100, s.share < 0.1 ? 1 : 0));
    // one whole sentence per case: phase × fixed land (× wage above/below today in phase ③)
    const key = s.ph === 1 ? (beta ? 'ch12.say.p1land' : 'ch12.say.p1')
      : s.ph === 2 ? 'ch12.say.p2'
      : !beta ? 'ch12.say.p3' : s.w < 1 ? 'ch12.say.p3landBelow' : 'ch12.say.p3landAbove';
    $('#wgSay').innerHTML = t(key, { w: fmt(s.w, 2), own: fmt((1 - s.share) * 100) });
    touch(o);
  }
  [Ks, Rs].forEach(e => e.addEventListener('input', upd)); Bc.addEventListener('change', upd); upd(); relabel.push(upd);
})();

/* ───────── 13 what gets cheap, what gets dear ───────── */
(() => {
  // [copy key, direction and size]: negative = cheaper, positive = dearer
  const items = [['ch13.item1', -1], ['ch13.item2', -0.95], ['ch13.item3', -0.85], ['ch13.item4', -0.8], ['ch13.item5', -0.7], ['ch13.item6', -0.6], ['ch13.item7', -0.55],
    ['ch13.item8', 0.4], ['ch13.item9', 0.5], ['ch13.item10', 0.6], ['ch13.item11', 0.62], ['ch13.item12', 0.72], ['ch13.item13', 0.8], ['ch13.item14', 0.9], ['ch13.item15', 0.95]];
  const map = $('#scMap'), sl = $('#scA');
  map.innerHTML = items.map(([n]) => `<div class="mrow"><span></span><div class="track"><i></i></div></div>`).join('');
  const bars = map.querySelectorAll('i'), names = map.querySelectorAll('.mrow > span');
  const labels = () => items.forEach(([k], i) => { names[i].textContent = t(k); });
  function upd() { const a = +sl.value / 100; $('#scAo').textContent = pct(sl.value);
    items.forEach(([, k], i) => { const len = Math.abs(k) * a * 50, b = bars[i]; b.style.width = len + '%'; b.style.left = k < 0 ? (50 - len) + '%' : '50%'; b.style.background = k < 0 ? C.cyan : C.gold; }); }
  labels(); sl.addEventListener('input', upd); upd(); relabel.push(labels, upd);
})();

/* ───────── 14 scenario pad ───────── */
(() => {
  const pad = $('#pad'), dot = $('#dot'), mine = { x: 0.64, y: 0.4 }; let x = mine.x, y = mine.y;
  // quadrants: index = (shared ? 0 : 2) + (fast ? 1 : 0)
  const T = ['ch14.sc.slowShared', 'ch14.sc.fastShared', 'ch14.sc.slowConc', 'ch14.sc.fastConc'];
  function place(el, px, py) { el.style.left = px * 100 + '%'; el.style.top = (1 - py) * 100 + '%'; }
  function upd() {
    place(dot, x, y); const i = (y >= 0.5 ? 0 : 2) + (x >= 0.5 ? 1 : 0), name = t(T[i] + '.name'); $('#scName').textContent = name; $('#scText').textContent = t(T[i] + '.text');
    const D = 0.2 + 0.75 * x; $('#mG').style.width = (25 + 70 * x) + '%'; $('#mD').style.width = D * 100 + '%';
    $('#mI').style.width = clamp(0.12 + 0.5 * (1 - y) + 0.36 * x * (1 - y)) * 100 + '%'; $('#mS').style.width = clamp(0.28 + 0.64 * y - 0.34 * x * (1 - y)) * 100 + '%';
    dot.setAttribute('aria-valuetext', t('ch14.pad.valuetext', { name, x: Math.round(x * 100), y: Math.round(y * 100) }));
  }
  function at(e) { const r = pad.getBoundingClientRect(); x = clamp((e.clientX - r.left) / r.width, 0.04, 0.96); y = clamp(1 - (e.clientY - r.top) / r.height, 0.04, 0.96); upd(); }
  pad.addEventListener('pointerdown', e => { pad.setPointerCapture(e.pointerId); at(e); pad.onpointermove = at; });
  pad.addEventListener('pointerup', () => { pad.onpointermove = null; }); pad.addEventListener('pointercancel', () => { pad.onpointermove = null; });
  dot.addEventListener('keydown', e => { const d = { ArrowLeft: [-.04, 0], ArrowRight: [.04, 0], ArrowUp: [0, .04], ArrowDown: [0, -.04] }[e.key]; if (!d) return; e.preventDefault(); x = clamp(x + d[0], 0.04, 0.96); y = clamp(y + d[1], 0.04, 0.96); upd(); });
  $('#scMine').onclick = () => { x = mine.x; y = mine.y; upd(); };
  place($('#mine'), mine.x, mine.y); upd(); relabel.push(upd);
})();

/* ───────── loop ───────── */
const bar = $('#bar');
window.addEventListener('scroll', () => { const d = document.documentElement; bar.style.width = (d.scrollTop / Math.max(1, d.scrollHeight - d.clientHeight) * 100) + '%'; }, { passive: true });
let last = performance.now();
function tick(now) {
  const dt = Math.min((now - last) / 1000, 0.05); last = now;
  for (const s of sims) { if (!s.vis) continue; if (s.step) { s.step(dt); s.draw(); } else if (s.dirty) { s.draw(); s.dirty = false; } }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
window.__ready = true;
})();
