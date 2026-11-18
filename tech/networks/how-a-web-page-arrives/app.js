/* How a web page arrives: wiring, drawing, i18n and on-screen gating. All visible text comes from copy.*.js. */
(() => {
'use strict';
const M = window.NetModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const C = { bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', dimfill: '#3a4254' };
const FONTF = '-apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const FONT = '12px ' + FONTF;
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
  let s = (COPY[lang] && COPY[lang][key] != null) ? COPY[lang][key] : (COPY.zh && COPY.zh[key] != null ? COPY.zh[key] : key);
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => vars[k] != null ? vars[k] : m);
  return s;
}
function fmt(x, d = 0) {
  if (!isFinite(x)) return '—';
  const v = Math.abs(x) < 0.5 * Math.pow(10, -d) ? 0 : x;
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}
const pct = (x, d = 1) => fmt(x * 100, d) + '%';
const msFmt = x => fmt(x, x < 10 ? 1 : 0);
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
const on = (sel, ev, fn) => { const el = $(sel); el.addEventListener(ev, fn); return el; };
const radios = name => [...document.querySelectorAll(`input[name=${name}]`)];
const radioVal = name => radios(name).find(r => r.checked).value;
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
function xTicks(c, f, vals, fmtv, X) {
  X = X || f.X; c.fillStyle = C.mute; c.textAlign = 'center';
  const cw = c.canvas.getBoundingClientRect().width;
  vals.forEach(v => { const x = X(v), s = fmtv(v), hw = c.measureText(s).width / 2; c.fillText(s, Math.max(hw + 2, Math.min(cw - hw - 2, x)), f.B + 11); c.strokeStyle = C.line; c.beginPath(); c.moveTo(x, f.B); c.lineTo(x, f.B + 3); c.stroke(); });
}
function yTicks(c, f, vals, fmtv) {
  c.fillStyle = C.mute; c.textAlign = 'right';
  vals.forEach(v => { const y = f.Y(v); c.fillText(fmtv(v), f.L - 6, y); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, y); c.lineTo(f.R, y); c.stroke(); });
}
function path(c, pts, X, Y, col, lw = 2.2) { if (!pts.length) return; c.strokeStyle = col; c.lineWidth = lw; c.lineJoin = 'round'; c.beginPath(); pts.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](X(p[0]), Y(p[1]))); c.stroke(); }
function dot(c, x, y, col, r = 4.5) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); }
function cross(c, x, y, col, s = 4) { c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); c.moveTo(x - s, y - s); c.lineTo(x + s, y + s); c.moveTo(x + s, y - s); c.lineTo(x - s, y + s); c.stroke(); }
function dashed(c, x0, y0, x1, y1, col) { c.strokeStyle = col; c.lineWidth = 1.3; c.setLineDash([5, 4]); c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); c.setLineDash([]); }
// shrink a label's font until it fits maxW
function fitText(c, s, maxW, size = 12) { let z = size; c.font = z + 'px ' + FONTF; while (z > 8 && c.measureText(s).width > maxW) { z -= 0.5; c.font = z + 'px ' + FONTF; } return z; }
// a replay clock on real dt; jumps to the end under reduced motion
function clock(until, speed) { return { t: reduce ? until : 0, until, speed, restart(u) { if (u != null) this.until = u; this.t = reduce ? this.until : 0; }, done() { return this.t >= this.until - 1e-9; }, tick(dt) { const was = this.t; this.t = Math.min(this.until, this.t + dt * this.speed); return this.t !== was; } }; }
function niceStep(range, n) { const raw = range / n, p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p; }
function ticks(max, n) { const s = niceStep(max, n), out = []; for (let v = 0; v <= max + 1e-9; v += s) out.push(+v.toFixed(10)); return out; }
function dur(sec) {
  if (sec < 60) return t('ch1.unit.sec', { v: fmt(sec) });
  if (sec < 3600) return t('ch1.unit.min', { v: fmt(sec / 60) });
  if (sec < 86400) return t('ch1.unit.hour', { v: fmt(sec / 3600, sec % 3600 ? 1 : 0) });
  return t('ch1.unit.day', { v: fmt(sec / 86400, sec % 86400 ? 1 : 0) });
}

/* ───────── 01 DNS ───────── */
(() => {
  const cv = $('#dnsCv'), D = M.dns, ARROW = 0.32; // seconds per arrow
  let st = D.create(), last = null, event = null;
  const ck = clock(0, 1 / ARROW);
  const box = $('#dnsNames');
  D.NAMES.forEach(n => { const b = document.createElement('button'); b.type = 'button'; b.className = 'b mono'; b.textContent = n; b.dataset.name = n; box.appendChild(b); });
  const ttl = () => +radioVal('dnsTtl');
  function arrowsOf(res) { const a = [['phone', 'resolver']]; for (const s of res.steps) a.push(['resolver', s], [s, 'resolver']); a.push(['resolver', 'phone']); return a; }
  function lookup(name) { last = D.resolve(st, name, ttl()); event = { type: 'lookup', res: last, before: null }; ck.restart(arrowsOf(last).length); sim.dirty = true; text(); }
  const COLS = ['phone', 'resolver', 'root', 'tld', 'auth'];
  const sim = reg(cv, {
    step(dt) { if (ck.tick(dt)) this.dirty = true; },
    draw() {
      const { c, w, h } = fit(cv), colW = (w - 16) / 5, X = i => 8 + colW * (i + 0.5), top = 52;
      COLS.forEach((k, i) => {
        const lab = t('ch1.cv.' + k);
        fitText(c, lab, colW - 6); c.fillStyle = (k === 'phone' || k === 'resolver') ? C.ink : C.mute; c.textAlign = 'center'; c.fillText(lab, X(i), 16);
        if (k === 'tld' && last) { c.font = '12px ' + 'ui-monospace,Menlo,Consolas,monospace'; c.fillText('.' + D.tldOf(last.name), X(i), 32); }
        c.font = FONT; c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(X(i), 42); c.lineTo(X(i), h - 10); c.stroke();
      });
      if (!last) return;
      const arrows = arrowsOf(last), rowH = Math.min(34, (h - top - 16) / arrows.length);
      const shown = ck.t;
      arrows.forEach((a, i) => {
        const frac = Math.max(0, Math.min(1, shown - i)); if (frac <= 0) return;
        const x0 = X(COLS.indexOf(a[0])), x1 = X(COLS.indexOf(a[1])), y0 = top + i * rowH, y1 = y0 + rowH * 0.7;
        const xe = x0 + (x1 - x0) * frac, ye = y0 + (y1 - y0) * frac;
        const col = a[0] === 'phone' || a[1] === 'phone' ? C.cyan : C.gold;
        c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); c.moveTo(x0, y0); c.lineTo(xe, ye); c.stroke();
        if (frac >= 1) { const dir = Math.sign(x1 - x0), ang = Math.atan2(y1 - y0, x1 - x0); c.fillStyle = col; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x1 - 8 * Math.cos(ang - 0.4), y1 - 8 * Math.sin(ang - 0.4)); c.lineTo(x1 - 8 * Math.cos(ang + 0.4), y1 - 8 * Math.sin(ang + 0.4)); c.fill(); void dir; }
      });
      if (!last.steps.length && shown >= 1) {
        const lab = t('ch1.cv.cached'); fitText(c, lab, colW * 2.6); c.fillStyle = C.green; c.textAlign = 'left';
        c.fillText(lab, X(1) + 10, top + rowH * 1.0); c.font = FONT;
      }
    }
  });
  function text() {
    const n = D.liveEntries(st);
    put('#dnsCache', t('ch1.unit.entries', { v: fmt(n) }));
    if (last) {
      put('#dnsRemote', t('ch1.unit.n', { v: fmt(last.steps.length) })); put('#dnsTrips', t('ch1.unit.trips', { v: fmt(last.trips) })); put('#dnsMs', t('ch1.unit.ms', { v: fmt(last.ms) }));
    } else { put('#dnsRemote', '—'); put('#dnsTrips', '—'); put('#dnsMs', '—'); }
    let s = '';
    if (event && event.type === 'lookup') {
      const r = event.res, v = { name: r.name, trips: fmt(r.trips), ms: fmt(r.ms), zone: D.zoneOf(r.name), tld: D.tldOf(r.name) };
      const k = r.steps.length;
      if (k === 3) s = t('ch1.say.cold', v);
      else if (k === 2) s = t('ch1.say.tld', v);
      else if (k === 1) s = t('ch1.say.zone', v);
      else { v.left = dur(Math.max(0, st.cache['a:' + r.name] - r.t)); s = t('ch1.say.cached', v); }
    } else if (event && event.type === 'wait') s = t('ch1.say.waited', { dt: dur(event.dt), n: fmt(n) });
    else if (event && event.type === 'reset') s = t('ch1.say.empty');
    putHTML('#dnsSay', s);
  }
  sim.text = text;
  box.addEventListener('click', e => { const b = e.target.closest('button'); if (b) lookup(b.dataset.name); });
  const wait = s => { D.wait(st, s); event = { type: 'wait', dt: s }; text(); };
  on('#dnsWait', 'click', () => wait(600));
  on('#dnsWait3', 'click', () => wait(3 * 86400));
  on('#dnsReset', 'click', () => { st = D.create(); last = null; event = { type: 'reset' }; sim.dirty = true; text(); });
  lookup('www.example.com');
})();

/* ───────── 02 packets ───────── */
(() => {
  const cv = $('#pkCv'), Pk = M.packets, L = 1e6;
  const SIZES = [20, 40, 60, 100, 150, 200, 300, 500, 700, 1000, 1460, 2000, 3200, 5000, 10000, 20000, 50000, 100000, 200000, 500000, 1000000];
  const sP = $('#pkP'), sK = $('#pkK');
  const P = () => SIZES[+sP.value], K = () => +sK.value;
  const lg = Math.log10;
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), k = K();
      const pts = []; for (let i = 0; i <= 160; i++) { const p = 20 * Math.pow(L / 20, i / 160); pts.push([lg(p), Pk.time(L, p, k)]); }
      const yMax = Math.max(1, Math.ceil(Math.max(...pts.map(q => q[1])) * 1.1));
      const f = frame(w, h, [32, 16, 40, 44], lg(20), lg(L), 0, yMax);
      yTicks(c, f, ticks(yMax, 4), v => fmt(v, v % 1 ? 1 : 0));
      axes(c, f, t('ch2.cv.x'), t('ch2.cv.y'));
      const xt = w < 420 ? [100, 10000, 1000000] : [100, 1000, 10000, 100000, 1000000];
      xTicks(c, f, xt, v => v >= 1e6 ? '1M' : v >= 1000 ? fmt(v / 1000) + 'k' : fmt(v), v => f.X(lg(v)));
      // Ethernet limit
      const xm = f.X(lg(Pk.P.MTU_PAYLOAD)); dashed(c, xm, f.T, xm, f.B, C.cyan);
      c.fillStyle = C.cyan; c.textAlign = 'right'; c.font = FONT; c.fillText(t('ch2.cv.mtu'), xm - 5, f.T + 8);
      path(c, pts, f.X, f.Y, C.gold);
      dot(c, f.X(lg(P())), f.Y(Pk.time(L, P(), k)), C.ink, 5);
    }
  });
  function text() {
    const p = P(), k = K(), T = Pk.time(L, p, k), W = Pk.whole(L, k), n = Pk.count(L, p), oh = Pk.overhead(L, p);
    put('#pkPo', t('ch2.unit.bytes', { v: fmt(p) })); put('#pkKo', t('ch2.unit.hops', { v: fmt(k) }));
    put('#pkT', t('ch2.unit.s', { v: fmt(T, 2) })); put('#pkW', t('ch2.unit.s', { v: fmt(W, 2) })); put('#pkN', t('ch2.unit.n', { v: fmt(n) })); put('#pkOh', pct(oh, oh < 0.001 ? 2 : 1));
    const v = { P: fmt(p), k: fmt(k), T: fmt(T, 2), W: fmt(W, 2), n: fmt(n), oh: pct(oh, 0), pct: pct(T / W, 0) };
    const key = k === 1 ? 'ch2.say.onehop' : oh > 0.2 ? 'ch2.say.tiny' : n <= 2 ? 'ch2.say.huge' : 'ch2.say.good';
    putHTML('#pkSay', t(key, v));
  }
  sim.text = text;
  [sP, sK].forEach(e => e.addEventListener('input', () => { sim.dirty = true; text(); }));
  text();
})();

/* ───────── 03 routing ───────── */
(() => {
  const cv = $('#rtCv'), R = M.routing, SRC = 'Y', DST = 'S';
  let broken = new Set();
  const base = R.path(SRC, DST);
  const nm = id => (id === 'Y' || id === 'S') ? t('ch3.node.' + id) : id;
  const box = $('#rtLinks'), btns = {};
  R.LINKS.forEach(l => { const b = document.createElement('button'); b.type = 'button'; b.className = 'b mono'; b.dataset.k = R.key(l); box.appendChild(b); btns[R.key(l)] = b; });
  let pos = {}, phase = 0;
  function layout(w, h) { const px = 34, py = 30; pos = {}; R.NODES.forEach(n => { pos[n.id] = { x: px + n.x * (w - 2 * px), y: py + n.y * (h - 2 * py) }; }); }
  const sim = reg(cv, {
    step(dt) { if (!reduce) { phase = (phase + dt * 0.35) % 1; this.dirty = true; } },
    draw() {
      const { c, w, h } = fit(cv); layout(w, h);
      const cur = R.path(SRC, DST, broken), onPath = new Set();
      if (cur.reach) for (let i = 0; i + 1 < cur.nodes.length; i++) { onPath.add(cur.nodes[i] + '-' + cur.nodes[i + 1]); onPath.add(cur.nodes[i + 1] + '-' + cur.nodes[i]); }
      // links
      for (const l of R.LINKS) {
        const a = pos[l[0]], b = pos[l[1]], k = R.key(l), cut = broken.has(k), hot = onPath.has(k);
        c.strokeStyle = cut ? C.red : hot ? C.gold : '#4a5266'; c.lineWidth = hot ? 4 : 2; if (cut) c.setLineDash([4, 5]);
        c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke(); c.setLineDash([]);
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        if (cut) cross(c, mx, my, C.red, 6);
        else {
          const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy), ox = -dy / len * 11, oy = dx / len * 11;
          c.fillStyle = C.mute; c.textAlign = 'center'; c.font = '11px ' + FONTF; c.fillText(fmt(l[2]), mx + ox, my + oy); c.font = FONT;
        }
      }
      // next-hop arrows
      const tree = cur.tree;
      for (const n of R.NODES) {
        const nx = tree.next[n.id]; if (!nx) continue;
        const a = pos[n.id], b = pos[nx], dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len;
        const sx = a.x + ux * 15, sy = a.y + uy * 15, ex = a.x + ux * 30, ey = a.y + uy * 30;
        c.strokeStyle = C.cyan; c.lineWidth = 2; c.beginPath(); c.moveTo(sx, sy); c.lineTo(ex, ey); c.stroke();
        c.fillStyle = C.cyan; c.beginPath(); c.moveTo(ex + ux * 4, ey + uy * 4); c.lineTo(ex - uy * 4 - ux * 3, ey + ux * 4 - uy * 3); c.lineTo(ex + uy * 4 - ux * 3, ey - ux * 4 - uy * 3); c.fill();
      }
      // packets moving along the path
      if (cur.reach && !reduce) {
        const segs = []; let tot = 0;
        for (let i = 0; i + 1 < cur.nodes.length; i++) { const a = pos[cur.nodes[i]], b = pos[cur.nodes[i + 1]], d = Math.hypot(b.x - a.x, b.y - a.y); segs.push([a, b, d]); tot += d; }
        for (const off of [0, 0.33, 0.66]) {
          let s = ((phase + off) % 1) * tot;
          for (const [a, b, d] of segs) { if (s <= d) { dot(c, a.x + (b.x - a.x) * s / d, a.y + (b.y - a.y) * s / d, C.ink, 3.5); break; } s -= d; }
        }
      }
      // nodes
      for (const n of R.NODES) {
        const p = pos[n.id], end = n.id === SRC || n.id === DST;
        c.fillStyle = end ? '#2a2414' : C.card || '#1a1f2b'; c.strokeStyle = end ? C.gold : C.mute; c.lineWidth = 1.5;
        c.beginPath(); c.arc(p.x, p.y, 12, 0, 6.283); c.fill(); c.stroke();
        c.fillStyle = C.ink; c.textAlign = 'center';
        if (end) { const lab = nm(n.id); fitText(c, lab, 70); const hw = c.measureText(lab).width / 2; c.fillText(lab, Math.max(hw + 2, Math.min(w - hw - 2, p.x)), p.y - 24); c.font = FONT; dot(c, p.x, p.y, C.gold, 4); }
        else { c.font = '600 12px ' + FONTF; c.fillText(n.id, p.x, p.y + 0.5); c.font = FONT; }
      }
    }
  });
  function toggle(k) { if (broken.has(k)) broken.delete(k); else broken.add(k); sim.dirty = true; text(); }
  function text() {
    for (const l of R.LINKS) {
      const k = R.key(l), b = btns[k], cut = broken.has(k);
      const s = nm(l[0]) + '–' + nm(l[1]); if (b.textContent !== s) b.textContent = s;
      b.classList.toggle('cut', cut); b.setAttribute('aria-pressed', String(cut));
      b.setAttribute('aria-label', t(cut ? 'ch3.link.aria.off' : 'ch3.link.aria.on', { a: nm(l[0]), b: nm(l[1]) }));
    }
    const cur = R.path(SRC, DST, broken), changed = R.changedNextHops(DST, new Set(), broken);
    const ps = cur.nodes.map(nm).join(' → ');
    put('#rtPath', cur.reach ? ps : t('ch3.unit.none'));
    put('#rtMs', cur.reach ? t('ch3.unit.ms', { v: fmt(cur.ms) }) : '—'); put('#rtHops', cur.reach ? t('ch3.unit.hops', { v: fmt(cur.hops) }) : '—');
    put('#rtChanged', t('ch3.unit.n', { v: fmt(changed) }));
    const fh = R.fewestHops(SRC, DST, broken);
    const v = { path: ps, ms: fmt(cur.ms), hops: fmt(cur.hops), fh: fh ? fmt(fh.hops) : '—', fms: fh ? fmt(fh.ms) : '—', changed: fmt(changed), rest: fmt(R.NODES.length - 1 - changed), extra: fmt(cur.ms - base.ms) };
    let key;
    if (!cur.reach) key = 'ch3.say.cut';
    else if (!broken.size) key = 'ch3.say.base';
    else if (cur.ms > base.ms) key = 'ch3.say.detour';
    else key = changed > 0 ? 'ch3.say.same' : 'ch3.say.same0';
    putHTML('#rtSay', t(key, v));
  }
  sim.text = text;
  box.addEventListener('click', e => { const b = e.target.closest('button'); if (b) toggle(b.dataset.k); });
  on('#rtReset', 'click', () => { broken = new Set(); sim.dirty = true; text(); });
  cv.addEventListener('click', e => {
    const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; let best = null, bd = 16;
    for (const l of R.LINKS) {
      const a = pos[l[0]], b = pos[l[1]]; if (!a) continue;
      const dx = b.x - a.x, dy = b.y - a.y, u = Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / (dx * dx + dy * dy)));
      const d = Math.hypot(a.x + u * dx - x, a.y + u * dy - y); if (d < bd && u > 0.12 && u < 0.88) { bd = d; best = R.key(l); }
    }
    if (best) toggle(best);
  });
  text();
})();

/* ───────── 04 queue ───────── */
(() => {
  const cv1 = $('#quCv1'), cv2 = $('#quCv2'), Q = M.queue, SPEED = 40; // service times per real second
  const sR = $('#quR'), sK = $('#quK');
  const rho = () => +sR.value, K = () => +sK.value;
  let seed = 5, s = null, flashes = [];
  const fresh = () => { s = Q.create(seed++); flashes = []; if (reduce) Q.step(s, 20000, rho(), K()); };
  fresh();
  const sim = reg([cv1, cv2], {
    step(dt) {
      if (reduce) return;
      const d0 = s.dropped; Q.step(s, dt * SPEED, rho(), K());
      for (let i = d0; i < s.dropped; i++) flashes.push(0.6);
      flashes = flashes.map(x => x - dt).filter(x => x > 0);
      this.dirty = true; text();
    },
    draw() {
      { // the queue
        const { c, w, h } = fit(cv1), k = K(), x0 = 46, x1 = w - 70, cell = Math.min(26, (x1 - x0) / k), qw = cell * k, qx = x1 - qw, y = h / 2 - 12, hh = 24;
        c.fillStyle = C.mute; c.textAlign = 'right'; const lab = t('ch4.cv.queue'); fitText(c, lab, 80); c.fillText(lab, x1, y - 16); c.font = FONT;
        for (let i = 0; i < k; i++) { const x = x1 - (i + 1) * cell; c.strokeStyle = C.line; c.lineWidth = 1; c.strokeRect(x + 1, y, cell - 2, hh); if (i < s.n) { c.fillStyle = i === 0 ? C.cyan : '#7d8597'; c.fillRect(x + 2, y + 1, cell - 4, hh - 2); } }
        c.fillStyle = C.mute; c.textAlign = 'left'; fitText(c, t('ch4.cv.out'), 64); c.fillText(t('ch4.cv.out'), x1 + 6, y + hh / 2); c.font = FONT;
        // arrivals and drops at the entrance
        c.strokeStyle = C.mute; c.lineWidth = 1.5; c.beginPath(); c.moveTo(8, y + hh / 2); c.lineTo(qx - 6, y + hh / 2); c.stroke();
        flashes.forEach((a, i) => dot(c, qx - 14 - (i % 6) * 9, y + hh + 12 + (0.6 - a) * 20, `rgba(240,122,109,${Math.min(1, a / 0.3)})`, 4));
      }
      { // loss vs load, closed form
        const { c, w, h } = fit(cv2), k = K(), f = frame(w, h, [30, 16, 40, 48], 0, 1.5, 0, 0.7);
        yTicks(c, f, [0, 0.2, 0.4, 0.6], v => fmt(v * 100) + '%'); axes(c, f, t('ch4.cv.x'), t('ch4.cv.y'));
        xTicks(c, f, [0, 0.5, 1, 1.5], v => fmt(v, 1));
        const pts = []; for (let r = 0.02; r <= 1.5001; r += 0.01) pts.push([r, Q.loss(r, k)]);
        path(c, pts, f.X, f.Y, C.cyan);
        dot(c, f.X(rho()), f.Y(Q.loss(rho(), k)), C.cyan, 5);
        if (s.arrived >= 200) dot(c, f.X(rho()), f.Y(Math.min(0.7, s.dropped / s.arrived)), C.red, 4);
      }
    }
  });
  const lossTxt = x => x < 5e-4 ? t('ch4.unit.zero') : pct(x, 1);
  function text() {
    const r = rho(), k = K(), loss = Q.loss(r, k), wait = Q.delay(r, k) * Q.SERVICE_MS;
    put('#quRo', fmt(r, 2)); put('#quKo', t('ch4.unit.k', { v: fmt(k) }));
    put('#quSim', s.arrived >= 200 ? pct(s.dropped / s.arrived) : '…'); put('#quLoss', lossTxt(loss));
    put('#quWait', t('ch4.unit.ms', { v: fmt(wait, 1) })); put('#quN', fmt(Q.meanN(r, k), 1));
    const v = { rho: fmt(r, 2), loss: lossTxt(loss), ms: fmt(wait, 1), floor: pct(1 - 1 / r), k: fmt(k) };
    const key = Math.abs(r - 1) < 0.01 ? 'ch4.say.at1' : r > 1 ? 'ch4.say.over' : k <= 3 ? 'ch4.say.tiny' : r < 0.7 ? 'ch4.say.low' : 'ch4.say.near';
    putHTML('#quSay', t(key, v));
  }
  sim.text = text;
  [sR, sK].forEach(e => e.addEventListener('input', () => { fresh(); sim.dirty = true; text(); }));
  text();
})();

/* ───────── 05 ARQ ───────── */
(() => {
  const cv = $('#aqCv'), A = M.arq, N = A.P.N;
  const sP = $('#aqP'), sW = $('#aqW');
  let seed = 1, res = null;
  const ck = clock(1, 3);
  const model = () => { res = A.run({ p: +sP.value / 100, W: +sW.value, seed }); ck.restart(res.finish + 0.3); };
  model();
  const sim = reg(cv, {
    step(dt) { if (ck.tick(dt)) { this.dirty = true; text(); } },
    draw() {
      const { c, w, h } = fit(cv), xMax = Math.max(5, Math.ceil(res.finish + 0.5)), f = frame(w, h, [30, 14, 40, 40], 0, xMax, N + 0.5, 0.5);
      // rows
      c.fillStyle = C.mute; c.textAlign = 'right';
      for (let i = 1; i <= N; i++) { if (i === 1 || i % 5 === 0) c.fillText(fmt(i), f.L - 6, f.Y(i)); c.strokeStyle = C.grid; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L + 1, f.Y(i)); c.lineTo(f.R, f.Y(i)); c.stroke(); }
      axes(c, f, t('ch5.cv.x'), t('ch5.cv.y'));
      xTicks(c, f, ticks(xMax, w < 420 ? 4 : 8).filter(v => v <= xMax), v => fmt(v));
      const now = ck.t, rowH = Math.abs(f.Y(2) - f.Y(1));
      res.segs.forEach((s, i) => {
        const y = f.Y(i + 1);
        for (const tr of s.tries) {
          if (tr.t > now) continue;
          const xa = f.X(tr.t);
          if (!tr.dataOk) { const e = Math.min(now, tr.t + 0.25); c.strokeStyle = C.gold; c.lineWidth = 2.5; c.beginPath(); c.moveTo(xa, y); c.lineTo(f.X(e), y); c.stroke(); if (now >= tr.t + 0.25) cross(c, f.X(tr.t + 0.25), y, C.red, Math.min(4, rowH * 0.35)); continue; }
          const e = Math.min(now, tr.t + 0.5); c.strokeStyle = C.gold; c.lineWidth = 2.5; c.beginPath(); c.moveTo(xa, y); c.lineTo(f.X(e), y); c.stroke();
          if (now > tr.t + 0.5) {
            if (tr.ackOk) { const e2 = Math.min(now, tr.t + 1); c.strokeStyle = C.cyan; c.lineWidth = 1.2; c.beginPath(); c.moveTo(f.X(tr.t + 0.5), y); c.lineTo(f.X(e2), y); c.stroke(); }
            else if (now >= tr.t + 0.75) cross(c, f.X(tr.t + 0.75), y, C.violet, Math.min(4, rowH * 0.35));
          }
        }
        // waiting in the receiver for an earlier packet, then handed to the browser
        if (s.arrive != null && s.arrive <= now && s.deliver > s.arrive + 1e-9) { c.strokeStyle = 'rgba(122,214,160,.45)'; c.lineWidth = 1.5; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(f.X(s.arrive), y); c.lineTo(f.X(Math.min(now, s.deliver)), y); c.stroke(); c.setLineDash([]); }
        if (s.deliver <= now) dot(c, f.X(s.deliver), y, C.green, Math.min(4, rowH * 0.32));
      });
    }
  });
  function text() {
    const p = +sP.value / 100, W = +sW.value, done = ck.done();
    put('#aqPo', fmt(+sP.value) + '%'); put('#aqWo', t('ch5.unit.w', { v: fmt(W) }));
    put('#aqT', done ? t('ch5.unit.rtt', { v: fmt(res.finish, 1) }) : '…'); put('#aqSends', done ? t('ch5.unit.n', { v: fmt(res.sends) }) : '…');
    put('#aqPer', done ? t('ch5.unit.per', { v: fmt(res.perSeg, 2), e: fmt(A.expected(p), 2) }) : '…');
    put('#aqWait', done ? t('ch5.unit.rtt', { v: fmt(res.maxWait, 1) }) : '…');
    const v = { W: fmt(W), T: fmt(res.finish, 1), sends: fmt(res.sends), wait: fmt(res.maxWait, 1), done: fmt(res.segs.filter(s => s.deliver <= ck.t).length) };
    const key = !done ? 'ch5.say.running' : res.sends === N ? 'ch5.say.clean' : W === 1 ? 'ch5.say.lossyW1' : res.maxWait > 0.05 ? 'ch5.say.lossy' : 'ch5.say.lossyNoWait';
    putHTML('#aqSay', t(key, v));
  }
  sim.text = text;
  const redo = () => { model(); sim.dirty = true; text(); };
  [sP, sW].forEach(e => e.addEventListener('input', redo));
  on('#aqSeed', 'click', () => { seed++; redo(); });
  on('#aqReplay', 'click', () => { ck.restart(); sim.dirty = true; text(); });
  text();
})();

/* ───────── 06 congestion window ───────── */
(() => {
  const cv = $('#cwCv'), Rn = M.reno, ROUNDS = 160, JOIN = 19;
  const sC = $('#cwC'), sB = $('#cwB'), cTwo = $('#cwTwo');
  let res = null, stats = null;
  const ck = clock(ROUNDS, 12);
  const utilTxt = u => pct(u, u >= 0.995 && u < 1 - 1e-9 ? 1 : 0);
  function model() {
    const C0 = +sC.value, B0 = +sB.value, flows = cTwo.checked ? [{ start: 0 }, { start: JOIN }] : [{ start: 0 }];
    res = Rn.run({ C: C0, B: B0, flows, rounds: ROUNDS });
    const L = res.losses, from = L.length > 1 ? L[1] : ROUNDS;
    const after = res.rounds.slice(from).map(q => q.W);
    stats = { C: C0, B: B0, util: Rn.steadyUtil(res), lo: after.length ? Math.min(...after) : null, hi: after.length ? Math.max(...after) : null, q: Rn.maxQueue(res, from) };
    const jl = L.find(l => l >= JOIN); stats.join = jl != null ? res.rounds[jl].cw : null;
  }
  model();
  const sim = reg(cv, {
    step(dt) { if (ck.tick(dt)) { this.dirty = true; text(); } },
    draw() {
      const { c, w, h } = fit(cv), split = h * 0.7, Cc = +sC.value, Bb = +sB.value;
      const yMax = Math.max(Cc + Bb, ...res.rounds.map(q => Math.max(...q.cw))) * 1.08;
      const f = frame(w, split, [28, 16, 18, 48], 1, ROUNDS, 0, yMax);
      yTicks(c, f, ticks(yMax, 4), v => fmt(v)); axes(c, f, '', t('ch6.cv.y'));
      dashed(c, f.L, f.Y(Cc), f.R, f.Y(Cc), C.cyan); dashed(c, f.L, f.Y(Cc + Bb), f.R, f.Y(Cc + Bb), C.red);
      const shown = res.rounds.filter(q => q.r <= ck.t + 1e-9);
      path(c, shown.map(q => [q.r + 1, q.cw[0]]), f.X, f.Y, C.gold);
      if (res.rounds[0].cw.length > 1) path(c, shown.filter(q => q.r >= JOIN).map(q => [q.r + 1, q.cw[1]]), f.X, f.Y, C.violet);
      for (const q of shown) if (q.loss) cross(c, f.X(q.r + 1), f.Y(Math.min(q.W, yMax)) , C.red, 3);
      const f2 = frame(w, h, [split + 24, 16, 40, 48], 1, ROUNDS, 0, Math.max(1, Bb));
      yTicks(c, f2, Bb > 0 ? [0, Bb] : [0], v => fmt(v)); axes(c, f2, t('ch6.cv.x'), t('ch6.cv.q'));
      xTicks(c, f2, w < 420 ? [1, 80, 160] : [1, 40, 80, 120, 160], v => fmt(v));
      if (shown.length) { c.fillStyle = 'rgba(240,122,109,.45)'; c.beginPath(); c.moveTo(f2.X(1), f2.B); for (const q of shown) c.lineTo(f2.X(q.r + 1), f2.Y(q.queue)); c.lineTo(f2.X(shown[shown.length - 1].r + 1), f2.B); c.closePath(); c.fill(); }
    }
  });
  function text() {
    const two = cTwo.checked, idx = Math.max(0, Math.min(ROUNDS - 1, Math.floor(ck.t))), q = res.rounds[idx], done = ck.done();
    put('#cwCo', t('ch6.unit.pkrtt', { v: fmt(+sC.value) })); put('#cwBo', t('ch6.unit.pk', { v: fmt(+sB.value) }));
    put('#cwW', two ? fmt(q.cw[0]) + ' + ' + fmt(q.cw[1]) : t('ch6.unit.pk', { v: fmt(q.cw[0]) }));
    put('#cwU', done && stats.util != null ? utilTxt(stats.util) : '…');
    put('#cwQ', done ? t('ch6.unit.pk', { v: fmt(stats.q) }) : '…');
    const lossesSoFar = res.losses.filter(l => l <= idx).length;
    put('#cwSl', t(two ? 'ch6.read.share' : 'ch6.read.losses'));
    put('#cwS', two ? fmt(q.cw[0]) + ' : ' + fmt(q.cw[1]) : t('ch6.unit.n', { v: fmt(lossesSoFar) }));
    let key; const v = { w: fmt(q.cw[0]), C: fmt(stats.C), lo: fmt(stats.lo), hi: fmt(stats.hi), u: stats.util != null ? utilTxt(stats.util) : '…', q: fmt(stats.q), extra: fmt(stats.q / stats.C, 1) };
    if (two && idx >= JOIN && stats.join) { key = 'ch6.say.two'; Object.assign(v, { w1: fmt(stats.join[0]), w2: fmt(stats.join[1]), a: fmt(q.cw[0]), b: fmt(q.cw[1]) }); }
    else if (!res.losses.length || idx < res.losses[0] || stats.util == null) key = 'ch6.say.ss';
    else if (stats.lo >= stats.C) key = 'ch6.say.full';
    else key = 'ch6.say.saw';
    putHTML('#cwSay', t(key, v));
  }
  sim.text = text;
  const redo = () => { model(); ck.restart(); sim.dirty = true; text(); };
  [sC, sB].forEach(e => e.addEventListener('input', redo));
  cTwo.addEventListener('change', redo);
  on('#cwReplay', 'click', () => { ck.restart(); sim.dirty = true; text(); });
  text();
})();

/* ───────── 07 Diffie–Hellman ───────── */
(() => {
  const cv = $('#dhCv'), H = M.dh;
  const sA = $('#dhA'), sB = $('#dhB'), cM = $('#dhMitm'), box = $('#dhPrimes');
  H.PRIMES.forEach((p, i) => { const l = document.createElement('label'); l.innerHTML = `<input type="radio" name="dhP" value="${p}"${i === 0 ? ' checked' : ''}><span>${fmt(p)}</span>`; box.appendChild(l); });
  let stepN = 1, eve = null, cache = null, pts = null;
  const P = () => +radioVal('dhP');
  function model() {
    const p = P(), a = +sA.value, b = +sB.value, ex = H.exchange(p, a, b);
    // Mallory's own secrets: fixed, derived from p so they are repeatable
    const m1 = Math.max(1, Math.floor((p - 2) * 0.37)), m2 = Math.max(1, Math.floor((p - 2) * 0.71));
    cache = Object.assign(ex, { mitm: H.mitm(p, a, b, m1, m2) });
    if (!pts || pts.p !== p) { const arr = new Uint32Array(p); let v = 1; for (let x = 1; x < p; x++) { v = (v * ex.g) % p; arr[x] = v; } pts = { p, arr }; }
  }
  model();
  const sim = reg(cv, {
    step(dt) {
      if (eve && !eve.found) {
        eve.acc += dt * Math.max(4, cache.p / 3);
        const target = eve.target;
        eve.n = Math.min(target, Math.floor(eve.acc));
        if (eve.n >= target) { eve.found = true; eve.x = target; }
        this.dirty = true; text();
      }
    },
    draw() {
      const { c, w, h } = fit(cv), p = cache.p, f = frame(w, h, [30, 18, 40, 56], 0, p, 0, p);
      yTicks(c, f, [0, p - 1], v => fmt(v)); axes(c, f, t('ch7.cv.x'), t('ch7.cv.y'));
      xTicks(c, f, [0, p - 1], v => fmt(v));
      const r = p < 200 ? 2.5 : p < 2000 ? 1.4 : 0.8, tried = eve ? eve.n : 0;
      c.fillStyle = '#5b6375';
      for (let x = 1; x < p - 1 + 1 && x < p; x++) { if (x <= tried) continue; const X = f.X(x), Y = f.Y(pts.arr[x]); if (r > 1) { c.beginPath(); c.arc(X, Y, r, 0, 6.283); c.fill(); } else c.fillRect(X, Y, 1, 1); }
      c.fillStyle = C.red; for (let x = 1; x <= tried; x++) { const X = f.X(x), Y = f.Y(pts.arr[x]); if (r > 1) { c.beginPath(); c.arc(X, Y, r, 0, 6.283); c.fill(); } else c.fillRect(X, Y, 1, 1); }
      if (stepN >= 3) { dashed(c, f.L, f.Y(cache.A), f.R, f.Y(cache.A), C.gold); }
      if (eve) { c.strokeStyle = C.red; c.lineWidth = 1; c.beginPath(); c.moveTo(f.X(tried), f.T); c.lineTo(f.X(tried), f.B); c.stroke(); }
      if (eve && eve.found) dot(c, f.X(eve.x), f.Y(cache.A), C.gold, 6);
    }
  });
  function text() {
    const k = cache, m = k.mitm, mitm = cM.checked;
    put('#dhAo', fmt(+sA.value)); put('#dhBo', fmt(+sB.value));
    const hid = '<span class="h">' + t('ch7.cell.hidden') + '</span>';
    putHTML('#dhW1', stepN >= 1 ? t('ch7.cell.pg', { p: fmt(k.p), g: fmt(k.g) }) : hid);
    putHTML('#dhYou1', stepN >= 2 ? '<span class="s">' + t('ch7.cell.secret', { v: fmt(k.a) }) + '</span>' : hid);
    putHTML('#dhSite1', stepN >= 2 ? '<span class="s">' + t('ch7.cell.secret', { v: fmt(k.b) }) + '</span>' : hid);
    putHTML('#dhW2', stepN >= 3 ? t('ch7.cell.A', { v: fmt(k.A) }) + ' · ' + t('ch7.cell.B', { v: fmt(k.B) }) : '');
    putHTML('#dhW3', stepN >= 3 && mitm ? '<span class="x">' + t('ch7.cell.mitm', { M1: fmt(m.M1), M2: fmt(m.M2) }) + '</span>' : '');
    const kyou = mitm ? m.sAlice : k.sA, ksite = mitm ? m.sBob : k.sB;
    putHTML('#dhYou2', stepN >= 4 ? '<span class="k">' + t('ch7.cell.key', { v: fmt(kyou) }) + '</span>' : '');
    putHTML('#dhSite2', stepN >= 4 ? '<span class="k">' + t('ch7.cell.key', { v: fmt(ksite) }) + '</span>' : '');
    putHTML('#dhEve', eve ? (eve.found ? '<span class="x">' + t('ch7.cell.found', { v: fmt(eve.x) }) + '</span> · ' + t('ch7.cell.key', { v: fmt(k.sA) }) : t('ch7.cell.tries', { v: fmt(eve.n) })) : hid);
    const v = { p: fmt(k.p), g: fmt(k.g), a: fmt(k.a), b: fmt(k.b), A: fmt(k.A), B: fmt(k.B), s: fmt(k.sA), n: fmt(eve ? eve.n : 0), x: eve && eve.x != null ? fmt(eve.x) : '—', d: fmt(String(k.p).length), M1: fmt(m.M1), M2: fmt(m.M2), sA: fmt(m.sAlice), sB: fmt(m.sBob) };
    let key;
    if (mitm && stepN >= 3) key = 'ch7.say.mitm';
    else if (eve) key = eve.found ? 'ch7.say.eveFound' : 'ch7.say.eveRun';
    else key = 'ch7.say.step' + stepN;
    putHTML('#dhSay', t(key, v));
    $('#dhNext').disabled = stepN >= 4;
  }
  sim.text = text;
  const redo = () => { model(); eve = null; sim.dirty = true; text(); };
  [sA, sB].forEach(e => e.addEventListener('input', redo));
  box.addEventListener('change', () => { const p = P(); [sA, sB].forEach(s => { s.max = String(p - 2); if (+s.value > p - 2) s.value = String(p - 2); }); redo(); });
  cM.addEventListener('change', () => { if (cM.checked && stepN < 3) stepN = 3; eve = null; sim.dirty = true; text(); });
  on('#dhNext', 'click', () => { stepN = Math.min(4, stepN + 1); eve = null; sim.dirty = true; text(); });
  on('#dhRestart', 'click', () => { stepN = 1; eve = null; sim.dirty = true; text(); });
  on('#dhEveBtn', 'click', () => {
    if (stepN < 3) stepN = 3;
    eve = { n: 0, acc: 0, found: false, x: null, target: H.bruteForce(cache.p, cache.g, cache.A) };
    if (reduce) { eve.x = eve.n = H.bruteForce(cache.p, cache.g, cache.A); eve.found = true; }
    sim.dirty = true; text();
  });
  text();
})();

/* ───────── 08 latency budget ───────── */
(() => {
  const cv1 = $('#bgCv1'), cv2 = $('#bgCv2'), Bg = M.budget;
  const KMS = [10, 50, 100, 200, 500, 1000, 2000, 3000, 5000, 8000, 10000, 12000, 15000, 20000];
  const KB = [14, 50, 100, 250, 500, 1000, 2000, 5000];
  const sKm = $('#bgKm'), sAcc = $('#bgAcc'), sSize = $('#bgSize');
  const PART_COL = { dns: C.violet, tcp: C.cyan, tls: C.green, req: C.gold, rest: C.red };
  const opt = () => ({ km: KMS[+sKm.value], access: +sAcc.value, proto: radioVal('bgProto'), dnsState: radioVal('bgDns'), bytes: KB[+sSize.value] * 1000, cdn: radioVal('bgCdn') });
  const sim = reg([cv1, cv2], {
    draw() {
      const o = opt(), r = Bg.run(o);
      { // stacked bar
        const { c, w, h } = fit(cv1), xMax = Math.max(100, r.total * 1.1), f = frame(w, h, [20, 18, 40, 16], 0, xMax, 0, 1);
        const tk = ticks(xMax, w < 420 ? 3 : 6); xTicks(c, f, tk, v => fmt(v));
        c.strokeStyle = C.line; c.beginPath(); c.moveTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
        c.fillStyle = C.mute; c.textAlign = 'right'; c.fillText(t('ch8.cv.ms'), f.R, f.B + 26);
        let x = 0; const y0 = f.T + 8, bh = f.B - f.T - 16;
        for (const p of r.parts) { if (p.ms <= 0) continue; c.fillStyle = PART_COL[p.key]; c.fillRect(f.X(x), y0, Math.max(1, f.X(x + p.ms) - f.X(x) - 1), bh); x += p.ms; }
        const x20 = f.X(20); dashed(c, x20, f.T - 4, x20, f.B, C.gold);
        c.fillStyle = C.gold; c.textAlign = 'left'; c.fillText(t('ch8.cv.20'), x20 + 4, f.T - 6);
      }
      { // total vs distance
        const { c, w, h } = fit(cv2), pts = [];
        for (let km = 0; km <= 20000; km += 100) pts.push([km, Bg.run(Object.assign({}, o, { km })).total]);
        const yMax = Math.max(50, ...pts.map(q => q[1])) * 1.1, f = frame(w, h, [30, 16, 40, 52], 0, 20000, 0, yMax);
        yTicks(c, f, ticks(yMax, 4), v => fmt(v)); axes(c, f, t('ch8.cv.x'), t('ch8.cv.y'));
        xTicks(c, f, w < 420 ? [0, 10000, 20000] : [0, 5000, 10000, 15000, 20000], v => fmt(v));
        dashed(c, f.L, f.Y(20), f.R, f.Y(20), C.gold);
        path(c, pts, f.X, f.Y, C.cyan);
        dot(c, f.X(o.km), f.Y(r.total), C.gold, 5);
      }
    }
  });
  function text() {
    const o = opt(), r = Bg.run(o), prop = Bg.prop(o.km);
    put('#bgKmo', t('ch8.unit.km', { v: fmt(o.km) })); put('#bgAcco', t('ch8.unit.ms', { v: fmt(o.access) }));
    const kb = KB[+sSize.value]; put('#bgSizeo', kb >= 1000 ? t('ch8.unit.mb', { v: fmt(kb / 1000) }) : t('ch8.unit.kb', { v: fmt(kb) }));
    put('#bgRtt', t('ch8.unit.ms', { v: fmt(r.rtt, r.rtt < 20 ? 1 : 0) })); put('#bgTrips', t('ch8.unit.trips', { v: fmt(r.serverTrips) }));
    put('#bgTotal', t('ch8.unit.ms', { v: msFmt(r.total) }));
    const reach = Bg.reach(20, o); put('#bgReach', reach == null ? t('ch8.unit.never') : t('ch8.unit.reach', { v: fmt(reach < 100 ? reach : Math.round(reach / 10) * 10) }));
    const big = r.parts.reduce((a, b) => (b.ms > a.ms ? b : a));
    const v = { km: fmt(o.km), prop: msFmt(prop), acc: fmt(o.access), rtt: msFmt(r.rtt), n: fmt(r.serverTrips), dns: fmt(r.parts[0].ms), total: msFmt(r.total), share: pct(r.serverTrips * prop / r.total, 0), big: t('ch8.part.' + big.key), edge: fmt(Bg.EDGE_KM) };
    const key = o.cdn === 'hit' ? 'ch8.say.cdnhit' : o.cdn === 'miss' ? 'ch8.say.cdnmiss' : o.km < 300 ? 'ch8.say.near' : 'ch8.say.far';
    putHTML('#bgSay', t(key, v));
  }
  sim.text = text;
  const redo = () => { sim.dirty = true; text(); };
  [sKm, sAcc, sSize].forEach(e => e.addEventListener('input', redo));
  ['bgProto', 'bgDns', 'bgCdn'].forEach(n => radios(n).forEach(r => r.addEventListener('change', redo)));
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
    if (s.dirty && s.draw) { s.draw(); s.dirty = false; }
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
window.__essayReady = true;
})();
