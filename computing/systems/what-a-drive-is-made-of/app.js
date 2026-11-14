/* What a drive is made of: wiring, drawing, i18n and on-screen gating. All visible text comes from copy.*.js. */
(() => {
'use strict';
const M = window.DriveModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const C = { bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', dimfill: '#3a4254' };
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const fmt = M.fmt;

/* ───────── language ───────── */
const LS = 'knowledge-lang';
let memLang = null;
function readLang() { try { return localStorage.getItem(LS); } catch (e) { return memLang; } }
function writeLang(v) { memLang = v; try { localStorage.setItem(LS, v); } catch (e) { /* in-memory fallback */ } }
let lang = readLang();
if (lang !== 'zh' && lang !== 'en') lang = /^zh/i.test(navigator.language || '') ? 'zh' : 'en';
function t(key, vars) {
  let s = (COPY[lang] && COPY[lang][key] != null) ? COPY[lang][key] : (COPY.zh && COPY.zh[key] != null ? COPY.zh[key] : key);
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => vars[k] != null ? vars[k] : m);
  return s;
}
function sayText(o) {
  const v = {};
  for (const [k, x] of Object.entries(o.v)) v[k] = x && x.k ? t(x.k) : x;
  return t(o.key, v);
}
const effLang = () => (COPY[lang] ? lang : 'zh');
const sims = [];
const texts = [];
function applyLang() {
  document.documentElement.lang = effLang() === 'zh' ? 'zh-CN' : 'en';
  document.title = t('doc.title');
  const md = document.querySelector('meta[name=description]');
  if (md) md.content = t('doc.desc');
  document.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(e => { e.innerHTML = t(e.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-aria]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.i18nAria)); });
  document.querySelectorAll('#langToggle button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  sims.forEach(s => { s.dirty = true; });
  texts.forEach(f => f());
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
const io = new IntersectionObserver(es => es.forEach(e => { for (const s of sims) if (s.cvs.includes(e.target)) { s.vis = s.cvs.some(cv => cv.__vis = (cv === e.target ? e.isIntersecting : cv.__vis)); s.dirty = true; } }), { rootMargin: '60px' });
function reg(cvs, o) { o.cvs = [].concat(cvs); o.vis = false; o.dirty = true; sims.push(o); o.cvs.forEach(cv => io.observe(cv)); return o; }
window.addEventListener('resize', () => sims.forEach(s => { s.dirty = true; }));
const radios = name => [...document.querySelectorAll(`input[name=${name}]`)];
const radioVal = name => radios(name).find(r => r.checked).value;
const put = (sel, s) => { const e = $(sel); if (e.textContent !== s) e.textContent = s; };
const putHTML = (sel, s) => { const e = $(sel); if (e.__h !== s) { e.innerHTML = s; e.__h = s; } };
const bind = (sim, text, inputs, radioNames) => {
  const go = () => { sim.dirty = true; text(); };
  inputs.forEach(e => e.addEventListener('input', go));
  (radioNames || []).forEach(n => radios(n).forEach(r => r.addEventListener('change', go)));
  texts.push(text); text();
};

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
// tick labels left to right, skipping any that would collide with the one before
function spaced(c, items, y) { let lastR = -Infinity; c.textAlign = 'center'; c.fillStyle = C.mute; for (const [x, s] of items) { const w = c.measureText(s).width; if (x - w / 2 < lastR + 6) continue; c.fillText(s, x, y); lastR = x + w / 2; } }
function yTicks(c, f, vals, fv, right, col) {
  c.fillStyle = col || C.mute; c.textAlign = right ? 'left' : 'right';
  vals.forEach(v => { const y = f.Y(v); c.fillText(fv(v), right ? f.R + 6 : f.L - 6, y); if (!right) { c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, y); c.lineTo(f.R, y); c.stroke(); } });
}
function path(c, pts, X, Y, col, lw = 2.2, dash) { c.strokeStyle = col; c.lineWidth = lw; c.lineJoin = 'round'; if (dash) c.setLineDash(dash); c.beginPath(); pts.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](X(p[0]), Y(p[1]))); c.stroke(); c.setLineDash([]); }
function tag(c, s, x, y, col, align) { c.font = FONT; const w = c.measureText(s).width; const x0 = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x; c.fillStyle = C.bg; c.fillRect(x0 - 3, y - 8, w + 6, 16); c.fillStyle = col; c.textAlign = 'left'; c.fillText(s, x0, y); }
function dot(c, x, y, col) { c.fillStyle = col; c.beginPath(); c.arc(x, y, 4.5, 0, 6.283); c.fill(); }
// a power-of-ten tick: 10^e seconds written with a whole number and its unit
const tickT = e => { const u = e < -3 ? ['us', 6] : e < 0 ? ['ms', 3] : ['s', 0]; return t('ch8.unit.t', { v: fmt(Math.pow(10, e + u[1])), u: t('unit.' + u[0]) }); };
const durT = s => { const [v, u] = M.dur(s); return t('ch8.unit.t', { v, u: t('unit.' + u) }); };

/* ───────── 01 sectors ───────── */
(() => {
  const cv = $('#secCv'), sO = $('#secO'), S = M.sector;
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), off = +sO.value, wr = S.write(off, 4);
      // show 3 physical sectors around the write
      const p0 = Math.max(0, wr.p0 - (wr.p1 === wr.p0 ? 1 : 0)), nP = 3, n = nP * 8, first = p0 * 8;
      const L = 10, R = w - 10, cw = (R - L) / n, yl = 30, hl = Math.min(34, h * 0.24), yp = yl + hl + 14, hp = Math.min(34, h * 0.24);
      c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(t('ch1.cv.log'), L, 12); c.fillText(t('ch1.cv.phys'), L, yp + hp + 14);
      for (let i = 0; i < n; i++) {
        const lba = first + i, inW = lba >= off && lba < off + 8, x = L + i * cw;
        c.fillStyle = inW ? 'rgba(233,185,73,.55)' : '#1a1f2b'; c.fillRect(x + 1, yl, cw - 2, hl);
      }
      for (let p = 0; p < nP; p++) {
        const pp = p0 + p, hit = pp >= wr.p0 && pp <= wr.p1, x = L + p * 8 * cw;
        const lo = Math.max(off, pp * 8), hi = Math.min(off + 7, pp * 8 + 7), part = hit && hi - lo + 1 < 8;
        c.fillStyle = !hit ? '#1a1f2b' : part ? 'rgba(240,122,109,.45)' : 'rgba(122,214,160,.4)'; c.fillRect(x + 2, yp, 8 * cw - 4, hp);
        c.strokeStyle = C.line; c.strokeRect(x + 2, yp, 8 * cw - 4, hp);
      }
    }
  });
  function text() {
    const off = +sO.value, wr = S.write(off, 4);
    put('#secOo', fmt(off)); put('#secT', t('ch1.unit.n', { v: fmt(wr.touched) })); put('#secR', t('ch1.unit.kib', { v: fmt(wr.read / 1024) }));
    put('#secW', t('ch1.unit.kib', { v: fmt(wr.written / 1024) })); put('#secA', t(wr.rmw ? 'ch1.st.bad' : 'ch1.st.ok'));
    putHTML('#secSay', sayText(M.say.sector(off)));
  }
  bind(sim, text, [sO]);
})();

/* ───────── 02 seek + rotation + zoned rate ───────── */
(() => {
  const cv = $('#skCv'), cv2 = $('#sqCv'), sS = $('#skS'), D = M.disk;
  const curve = []; for (let i = 0; i <= 200; i++) { const x = i / 200; curve.push([x, D.seek(x)]); }
  const sim = reg([cv, cv2], {
    draw() {
      const rpm = +radioVal('skR'), span = +sS.value / 100;
      { const { c, w, h } = fit(cv), f = frame(w, h, [30, 14, 40, 40], 0, 1, 0, 20);
        c.fillStyle = 'rgba(99,199,230,.08)'; c.fillRect(f.L, f.T, f.X(span) - f.L, f.B - f.T);
        yTicks(c, f, [0, 5, 10, 15, 20], v => fmt(v)); axes(c, f, t('ch2.cv.x'), t('ch2.cv.y'));
        spaced(c, [0, 0.25, 0.5, 0.75, 1].map(v => [f.X(v), fmt(v * 100) + '%']), f.B + 11);
        path(c, curve, f.X, f.Y, C.gold);
        const a = D.avgSeek(span); c.strokeStyle = C.cyan; c.setLineDash([5, 4]); c.beginPath(); c.moveTo(f.L, f.Y(a)); c.lineTo(f.R, f.Y(a)); c.stroke(); c.setLineDash([]);
        const lab = t('ch2.cv.span'), lw = c.measureText(lab).width, lx = Math.min(Math.max(f.L + 4, f.X(span) - lw - 8), f.R - lw - 4);
        tag(c, lab, lx, f.Y(a) - 12 < f.T + 8 ? f.Y(a) + 12 : f.Y(a) - 12, C.cyan, 'left'); }
      { const { c, w, h } = fit(cv2), max = Math.ceil(D.odRate(15000) / 100) * 100, f = frame(w, h, [26, 14, 36, 44], 0, 1, 0, max);
        const step = max > 400 ? 200 : 100, ys = []; for (let v = 0; v <= max; v += step) ys.push(v);
        yTicks(c, f, ys, v => fmt(v)); axes(c, f, t('ch2.cv2.x'), t('ch2.cv2.y'));
        spaced(c, [0, 0.25, 0.5, 0.75, 1].map(v => [f.X(v), fmt(v * 100) + '%']), f.B + 11);
        const pts = []; for (let i = 0; i <= 100; i++) pts.push([i / 100, D.rateAt(i / 100, rpm)]);
        path(c, pts, f.X, f.Y, C.green); }
    }
  });
  function text() {
    const rpm = +radioVal('skR'), span = +sS.value / 100, r = D.random(rpm, span);
    put('#skSo', fmt(span * 100) + '%'); put('#skSeek', t('ch2.unit.ms', { v: fmt(r.seek, 1) })); put('#skRot', t('ch2.unit.ms', { v: fmt(r.rot, 2) }));
    put('#skT', t('ch2.unit.ms', { v: fmt(r.t, 1) })); put('#skI', fmt(r.iops));
    put('#skOd', t('ch2.unit.mbs', { v: fmt(D.odRate(rpm)) })); put('#skId', t('ch2.unit.mbs', { v: fmt(D.idRate(rpm)) }));
    putHTML('#skSay', sayText(M.say.disk(rpm, span)));
  }
  bind(sim, text, [sS], ['skR']);
})();

/* ───────── 03 shingles ───────── */
(() => {
  const cv = $('#smCv'), sB = $('#smB'), sQ = $('#smQ'), S = M.smr;
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), B = +sB.value, q = +sQ.value, f = frame(w, h, [30, 46, 40, 44], 1, 100, 0, 1);
      const gMax = 100, cMax = 60;
      const Yg = g => f.B - (f.B - f.T) * g / gMax, Yc = v => f.B - (f.B - f.T) * v / cMax;
      [0, 25, 50, 75, 100].forEach(v => { const y = Yg(v); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, y); c.lineTo(f.R, y); c.stroke(); c.fillStyle = C.gold; c.textAlign = 'right'; c.fillText(fmt(v) + '%', f.L - 6, y); });
      [0, 20, 40, 60].forEach(v => { c.fillStyle = C.red; c.textAlign = 'left'; c.fillText(fmt(v), f.R + 6, Yc(v)); });
      axes(c, f, t('ch3.cv.x'), '');
      spaced(c, [1, 25, 50, 75, 100].map(v => [f.X(v), fmt(v)]), f.B + 11);
      const g = [], k = []; for (let b = 1; b <= 100; b++) { g.push([b, (S.gain(b, q) - 1) * 100]); k.push([b, S.meanRewrite(b)]); }
      path(c, g, f.X, Yg, C.gold); path(c, k, f.X, Yc, C.red);
      c.strokeStyle = C.gold; c.setLineDash([3, 4]); c.beginPath(); c.moveTo(f.L, Yg((S.maxGain(q) - 1) * 100)); c.lineTo(f.R, Yg((S.maxGain(q) - 1) * 100)); c.stroke(); c.setLineDash([]);
      c.strokeStyle = C.line; c.beginPath(); c.moveTo(f.X(B), f.T); c.lineTo(f.X(B), f.B); c.stroke();
      dot(c, f.X(B), Yg((S.gain(B, q) - 1) * 100), C.gold); dot(c, f.X(B), Yc(S.meanRewrite(B)), C.red);
    }
  });
  function text() {
    const B = +sB.value, q = +sQ.value, u = S.update(B, q, 7200);
    put('#smBo', fmt(B)); put('#smQo', fmt(q, 2)); put('#smG', t('ch3.unit.pct', { v: fmt((u.gain - 1) * 100) }));
    put('#smTr', t('ch3.unit.tr', { v: fmt(u.tracks, 1) })); put('#smMs', t('ch3.unit.ms', { v: fmt(u.ms) })); put('#smX', t('ch3.unit.x', { v: fmt(u.slow) }));
    putHTML('#smSay', sayText(M.say.smr(B, q)));
  }
  bind(sim, text, [sB, sQ]);
})();

/* ───────── 04 threshold voltage ───────── */
(() => {
  const cv = $('#vtCv'), sW = $('#vtW'), Cl = M.cell;
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), n = +radioVal('vtN'), N = +sW.value, s = Cl.sigma(N, M.W0), L = Cl.levels(n), d = Cl.delta(n);
      const v0 = -0.5, v1 = Cl.WIN + 0.5, f = frame(w, h, [16, 14, 40, 14], v0, v1, 0, 1);
      // scale each peak to the same height
      const peak = 1 / (s * Math.sqrt(2 * Math.PI)), one = (v, i) => Math.exp(-Math.pow((v - i * d) / s, 2) / 2);
      const nx = Math.max(200, Math.round(f.R - f.L));
      // misread area: for state i, the parts beyond its two reference voltages
      for (let i = 0; i < L; i++) {
        const lo = i ? (i - 0.5) * d : -Infinity, hi = i < L - 1 ? (i + 0.5) * d : Infinity;
        c.fillStyle = 'rgba(240,122,109,.55)'; c.beginPath(); c.moveTo(f.X(v0), f.B);
        for (let k = 0; k <= nx; k++) { const v = v0 + (v1 - v0) * k / nx, out = v < lo || v > hi; c.lineTo(f.X(v), out ? f.Y(one(v, i) * 0.92) : f.B); }
        c.lineTo(f.X(v1), f.B); c.closePath(); c.fill();
      }
      c.strokeStyle = C.line; c.beginPath(); c.moveTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
      for (let i = 0; i < L; i++) { const pts = []; for (let k = 0; k <= nx; k++) { const v = v0 + (v1 - v0) * k / nx; pts.push([v, one(v, i) * 0.92]); } path(c, pts, f.X, f.Y, i ? C.gold : C.cyan, L > 16 ? 1.2 : 1.8); }
      c.strokeStyle = 'rgba(235,232,224,.45)'; c.lineWidth = 1;
      for (let i = 0; i < L - 1; i++) { const x = f.X((i + 0.5) * d); c.beginPath(); c.moveTo(x, f.T); c.lineTo(x, f.B); c.stroke(); }
      c.fillStyle = C.mute; c.textAlign = 'right'; c.fillText(t('ch4.cv.x'), f.R, f.B + 14);
      void peak;
    }
  });
  function text() {
    const n = +radioVal('vtN'), N = +sW.value, s = Cl.sigma(N, M.W0), r = Cl.rber(n, s);
    put('#vtWo', fmt(N)); put('#vtL', t('ch4.unit.n', { v: fmt(Cl.levels(n)) })); put('#vtD', t('ch4.unit.mv', { v: fmt(Cl.delta(n) * 1000) }));
    put('#vtS', t('ch4.unit.mv', { v: fmt(s * 1000) })); put('#vtR', M.sci(r));
    putHTML('#vtSay', sayText(M.say.cell(n, N)));
  }
  bind(sim, text, [sW], ['vtN']);
})();

/* ───────── 05 ECC → endurance; lifetime ───────── */
(() => {
  const cv = $('#ecCv'), sT = $('#ecT'), E = M.ecc, names = ['slc', 'mlc', 'tlc', 'qlc', 'plc'], cols = [C.cyan, C.green, C.gold, C.violet, C.red];
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), tb = E.table(+sT.value, E.UBER[radioVal('ecC')]);
      const f = frame(w, h, [30, 14, 34, 52], 0, 5, 1, 5);
      const Y = v => f.Y(Math.log10(Math.max(v, 10)));
      [1, 2, 3, 4, 5].forEach(e => { const y = f.Y(e); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, y); c.lineTo(f.R, y); c.stroke(); c.fillStyle = C.mute; c.textAlign = 'right'; c.fillText(fmt(Math.pow(10, e)), f.L - 6, y); });
      axes(c, f, '', t('ch5.cv.y'));
      const bw = Math.min(70, (f.R - f.L) / 5 * 0.6);
      tb.forEach((r, i) => {
        const x = f.X(i + 0.5), top = Y(r.pe);
        c.textAlign = 'center'; c.fillStyle = C.ink; c.fillText(t('cell.short.' + names[i]), x, f.B + 12);
        if (r.pe < 10) { const z = t('ch5.cv.zero'), room = (f.R - f.L) / 5 - 6; c.fillStyle = C.red; if (c.measureText(z).width <= room) c.fillText(z, x, f.B - 12); else c.fillText('0', x, f.B - 12); return; }
        c.fillStyle = cols[i]; c.globalAlpha = 0.75; c.fillRect(x - bw / 2, top, bw, f.B - top); c.globalAlpha = 1;
      });
    }
  });
  function text() {
    const tt = +sT.value, cls = radioVal('ecC'), target = E.UBER[cls], tb = E.table(tt, target);
    put('#ecTo', fmt(tt)); put('#ecL', M.sci(E.limit(tt, target))); put('#ecR', t('ch5.unit.pct', { v: fmt(E.rate(tt) * 100, 1) }));
    put('#ecTl', t('ch5.unit.pe', { v: fmt(tb[2].pe) })); put('#ecQl', t('ch5.unit.pe', { v: fmt(tb[3].pe) }));
    putHTML('#ecSay', sayText(M.say.ecc(tt, cls)));
  }
  bind(sim, text, [sT], ['ecC']);
})();
(() => {
  const sD = $('#lfD'), sW = $('#lfW'), sE = $('#lfE'), E = M.ecc;
  function text() {
    const n = +radioVal('lfN'), d = +sD.value, wa = +sW.value, ea = +sE.value, pe = M.cell.endurance(n, E.P0, M.W0), y = E.years(pe, E.OP, d, wa);
    put('#lfDo', fmt(d, 2)); put('#lfWo', fmt(wa, 1)); put('#lfEo', fmt(ea, 2));
    put('#lfPe', t('ch5.unit.pe', { v: fmt(pe) })); put('#lfY', t('ch5.unit.y', { v: y >= 10 ? fmt(y) : fmt(y, 1) }));
    put('#lfA40', t('ch5.unit.x', { v: fmt(E.af(ea, 30, 40), 1) })); put('#lfA55', t('ch5.unit.x', { v: fmt(E.af(ea, 30, 55), 1) }));
    putHTML('#lfSay', sayText(M.say.life(n, d, wa)));
  }
  [sD, sW, sE].forEach(e => e.addEventListener('input', text)); radios('lfN').forEach(r => r.addEventListener('change', text));
  texts.push(text); text();
})();

/* ───────── 06 FTL ───────── */
(() => {
  const grid = $('#ftlGrid'), mapEl = $('#ftlMap'), sL = $('#ftlL');
  let f = M.ftl.start(), rnd = M.ftl.rng(11);
  function render() {
    const hot = f.last, out = [];
    for (let b = 0; b < f.B; b++) {
      const open = b === f.open, cells = f.pg[b].map((x, p) => {
        const isHot = x.s === 'valid' && x.lba === hot && f.map[hot] && f.map[hot].b === b && f.map[hot].p === p;
        return `<div class="pg ${x.s}${isHot ? ' hot' : ''}">${x.lba >= 0 ? x.lba : ''}</div>`;
      }).join('');
      out.push(`<div class="blk${open ? ' open' : ''}"><h4>${t(open ? 'ch6.blk.open' : 'ch6.blk', { b })}</h4><div class="pgs">${cells}</div><div class="er">${t('ch6.erases', { v: fmt(f.erases[b]) })}</div></div>`);
    }
    grid.innerHTML = out.join('');
    mapEl.innerHTML = f.map.map((m, i) => `<div class="${i === hot ? 'hot' : ''}"><b>${i}</b> → ${m ? m.b + '.' + m.p : '—'}</div>`).join('');
  }
  function text() {
    const dh = f.host - f.host0, dn = f.nand - f.nand0;
    put('#ftlLo', fmt(+sL.value)); put('#ftlH', fmt(dh)); put('#ftlN', fmt(dn)); put('#ftlRa', dh ? fmt(dn / dh, 2) : '—'); put('#ftlG', fmt(f.gcRuns));
    putHTML('#ftlSay', sayText(M.say.ftl(f)));
    render();
  }
  const w = lba => f.write(lba);
  sL.addEventListener('input', text);
  $('#ftlW').addEventListener('click', () => { w(+sL.value); text(); });
  $('#ftlR1').addEventListener('click', () => { w(Math.floor(rnd() * f.N)); text(); });
  $('#ftlR20').addEventListener('click', () => { for (let i = 0; i < 20; i++) w(Math.floor(rnd() * f.N)); text(); });
  $('#ftlSeq').addEventListener('click', () => { for (let i = 0; i < f.N; i++) w(i); text(); });
  $('#ftlX').addEventListener('click', () => { f = M.ftl.start(); rnd = M.ftl.rng(11); text(); });
  texts.push(text); text();
})();

/* ───────── 07 layer map ───────── */
(() => {
  const P = M.map, dBox = $('#mpD'), sBox = $('#mpS');
  const mk = (box, name, ids, def, pre) => { ids.forEach(id => { const l = document.createElement('label'); l.innerHTML = `<input type="radio" name="${name}" value="${id}"${id === def ? ' checked' : ''}><span data-i18n="${pre}${id}"></span>`; box.appendChild(l); }); };
  mk(dBox, 'mpD', Object.keys(P.DRIVES), 'm2sata', 'ch7.d.');
  mk(sBox, 'mpS', Object.keys(P.SLOTS), 'm2pcie', 'ch7.s.');
  function text() {
    const d = radioVal('mpD'), s = radioVal('mpS'), r = P.check(d, s);
    $('#mpT').innerHTML = r.rows.map(row => {
      const cls = row.ok === null ? 's' : row.ok ? 'y' : 'n', okT = row.ok === null ? t('ch7.ok.skip') : row.ok ? t('ch7.ok.y') : t('ch7.ok.n');
      return `<tr class="${row.ok === false ? 'bad' : ''}"><td>${t('ch7.layer.' + row.k)}</td><td>${t('ch7.v.' + row.v)}</td><td class="${cls}">${okT}</td></tr>`;
    }).join('');
    putHTML('#mpSay', sayText(M.say.map(d, s)));
  }
  radios('mpD').concat(radios('mpS')).forEach(r => r.addEventListener('change', text));
  texts.push(text);
})();

/* ───────── 08 end to end ───────── */
(() => {
  const cv = $('#eeCv'), sS = $('#eeS'), E = M.e2e, ids = ['hdd', 'sata', 'nvme'];
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), bytes = Math.pow(2, +sS.value);
      const labs = ids.map(i => t('ch8.dev.' + i)); c.font = FONT; let lw = 0; for (const s of labs) lw = Math.max(lw, c.measureText(s).width);
      const above = lw + 14 > w * 0.36, L = above ? 10 : lw + 16, R = w - 14, T = 8, B = h - 34, rh = (B - T) / 3;
      const lo = -5, hi = 1, X = s => L + (R - L) * (Math.log10(Math.max(s, 1e-5)) - lo) / (hi - lo);
      c.strokeStyle = C.grid; const tk = [];
      for (let e = lo; e <= hi; e++) { const x = X(Math.pow(10, e)); c.beginPath(); c.moveTo(x, T); c.lineTo(x, B); c.stroke(); tk.push([x, tickT(e)]); }
      spaced(c, tk.map(([x, s]) => { const hw = c.measureText(s).width / 2; return [Math.min(Math.max(x, hw + 2), w - hw - 2), s]; }), B + 11); c.textAlign = 'right'; c.fillStyle = C.mute; c.fillText(t('ch8.cv.x'), R, B + 26);
      ids.forEach((id, i) => {
        const r = E.time(id, bytes), y = T + i * rh;
        c.fillStyle = C.ink;
        if (above) { c.textAlign = 'left'; c.fillText(labs[i], L, y + rh * 0.2); } else { c.textAlign = 'right'; c.fillText(labs[i], L - 8, y + rh / 2); }
        const y0 = above ? y + rh * 0.42 : y + rh * 0.22, bh = above ? rh * 0.44 : rh * 0.56, xl = X(r.lat), xt = X(r.t);
        c.fillStyle = C.gold; c.fillRect(L, y0, Math.max(2, xl - L), bh);
        c.fillStyle = C.cyan; c.fillRect(xl, y0, Math.max(0, xt - xl), bh);
      });
    }
  });
  function text() {
    const bytes = Math.pow(2, +sS.value), [v, u] = M.size(bytes);
    put('#eeSo', t('ch8.unit.size', { v, u: t('unit.' + u) }));
    put('#eeH', durT(E.time('hdd', bytes).t)); put('#eeA', durT(E.time('sata', bytes).t)); put('#eeN', durT(E.time('nvme', bytes).t));
    putHTML('#eeSay', sayText(M.say.e2e(bytes)));
  }
  bind(sim, text, [sS]);
})();

/* ───────── loop ───────── */
applyLang();
function tick() {
  for (const s of sims) if (s.vis && s.dirty) { s.draw(); s.dirty = false; }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
window.__essayReady = true;
})();
