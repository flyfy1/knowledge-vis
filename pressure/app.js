'use strict';
/* ---------- pure model ---------- */
const G = 9.8, G0 = 9.80665, P0 = 101.325, HSCALE = 8400, LOAD_N = 100 * G0;
const LIQS = { water: 1000, salt: 1030, oil: 920 };
const LIQ_KEY = { water: 'liqWater', salt: 'liqSalt', oil: 'liqOil' };
const HOLES = [0.2, 0.6, 1.0, 1.4];
function pKpa(f, aCm2) { return 10 * f / aCm2; }
function snowDepth(p) { return Math.min(25, 0.35 * p); }
function areaFromLog(x) { return Math.pow(10, x); }
function holePressure(rho, depth) { return rho * G * depth / 1000; }
function activeHoles(H) { return HOLES.filter(y => y < H - 1e-9); }
function baroPressure(z) { return P0 * Math.exp(-z / HSCALE); }
function columnHeightM(pKpaV, rho) { return pKpaV * 1000 / (rho * G0); }
function hydraulicF2(f1, a1, a2) { return f1 * a2 / a1; }
function pistonDisp(a1, a2, d1) { return d1 * a1 / a2; }
/*KIT-BEGIN*/
const $ = id => document.getElementById(id);
const C = { cyan: '#6ee7ff', orange: '#ffb454', pink: '#ff7a93', green: '#7ee2a8', muted: '#9aa7b8', text: '#e8edf4', line: '#2b3547', panel: '#1c2330' };
const reduced = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
function fit(id) {
  const cv = $(id), dpr = Math.min(window.devicePixelRatio || 1, 3);
  if (cv.dataset.h === undefined) cv.dataset.h = cv.getAttribute('height') || '280';
  cv.style.height = cv.dataset.h + 'px';
  const w = cv.clientWidth, h = Number(cv.dataset.h);
  const bw = Math.max(2, Math.round(w * dpr)), bh = Math.max(2, Math.round(h * dpr));
  if (cv.width !== bw) cv.width = bw;
  if (cv.height !== bh) cv.height = bh;
  const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h); ctx.W = w; ctx.H = h; return ctx;
}
function ln(c, x1, y1, x2, y2, col, w, dash) { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.strokeStyle = col; c.lineWidth = w || 2; c.setLineDash(dash || []); c.stroke(); c.setLineDash([]); }
function dt(c, x, y, r, col) { c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.fillStyle = col; c.fill(); }
function tx(c, s, x, y, col, size, al) { c.font = (size || 13) + 'px system-ui,sans-serif'; c.fillStyle = col || C.muted; c.textAlign = al || 'center'; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function rect(c, x, y, w, h, fill, stroke) { c.beginPath(); c.rect(x, y, w, h); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = 1.5; c.stroke(); } }
function fmt(x, n) { return Number(x).toFixed(n === undefined ? 1 : n); }
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
function arrow(c, x1, y1, x2, y2, col, w) { ln(c, x1, y1, x2, y2, col, w); const a = Math.atan2(y2 - y1, x2 - x1), s = 9; c.beginPath(); c.moveTo(x2, y2); c.lineTo(x2 - s * Math.cos(a - 0.45), y2 - s * Math.sin(a - 0.45)); c.lineTo(x2 - s * Math.cos(a + 0.45), y2 - s * Math.sin(a + 0.45)); c.closePath(); c.fillStyle = col; c.fill(); }
function bindLang() {
  document.querySelectorAll('#langToggle button').forEach(b => b.addEventListener('click', () => applyLang(b.dataset.lang)));
}
function bindSpy() {
  const links = document.querySelectorAll('.nav-step');
  const mark = i => links.forEach(a => a.classList.toggle('active', a.dataset.nav === String(i)));
  mark(0);
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(es => { es.forEach(e => { if (e.isIntersecting) mark(e.target.dataset.step); }); }, { rootMargin: '-35% 0px -55% 0px' });
  document.querySelectorAll('.step').forEach(s => io.observe(s));
}
/* eased values: name -> {cur, tgt}; a single rAF loop runs only while something is moving */
const Anim = { v: {}, on: false, redraw: null,
  get(n, d) { return this.v[n] ? this.v[n].cur : d; },
  set(n, tgt, snap) { const o = this.v[n] || (this.v[n] = { cur: tgt, tgt }); o.tgt = tgt; if (snap || reduced()) o.cur = tgt; this.kick(); },
  kick() { if (this.on) return; this.on = true; requestAnimationFrame(() => this.tick()); },
  tick() {
    let moving = false;
    for (const n in this.v) { const o = this.v[n], d = o.tgt - o.cur; if (Math.abs(d) > 0.004 * (1 + Math.abs(o.tgt))) { o.cur += d * 0.16; moving = true; } else o.cur = o.tgt; }
    if (this.redraw) this.redraw();
    if (moving && !document.hidden) requestAnimationFrame(() => this.tick()); else this.on = false;
  } };
/*KIT-END*/

const S = { f0: 600, a0: 400, f1: 30, x1: -2, liq2: 'water', h2: 1.6, liq3: 'water', z: 0, f4: 60, a4: 5, b4: 200, pushed: false };
const RHO3 = { hg: 13595, water: 1000 };
const KEY3 = { hg: 'liqHg', water: 'liqWater' };
let liq3 = 'hg';

function fillSel(id, keys, kmap, cur) {
  const el = $(id); el.innerHTML = '';
  keys.forEach(k => { const o = document.createElement('option'); o.value = k; o.textContent = t(kmap[k]); if (k === cur) o.selected = true; el.appendChild(o); });
}
function fmtP(p) { return p >= 1000 ? { v: fmt(p / 1000, 1), u: t('unitMpa') } : { v: fmt(p, 1), u: t('unitKpa') }; }

/* ---- step 0 ---- */
function drawS0() {
  const c = fit('s0-cv'), W = c.W, H = c.H, p = pKpa(S.f0, S.a0), d = Anim.get('dent', snowDepth(p));
  const sy = 150, bw = 24 + S.a0 * 0.07, cx = W / 2, dpx = d * 4, bh = 54;
  c.beginPath(); c.moveTo(0, sy); c.lineTo(cx - bw / 2, sy); c.lineTo(cx - bw / 2, sy + dpx); c.lineTo(cx + bw / 2, sy + dpx); c.lineTo(cx + bw / 2, sy); c.lineTo(W, sy); c.lineTo(W, H); c.lineTo(0, H); c.closePath();
  c.fillStyle = '#dbe8f2'; c.fill();
  const hot = clamp(p / 80, 0, 1); c.fillStyle = 'rgba(255,122,147,' + (0.15 + 0.6 * hot).toFixed(2) + ')'; c.fillRect(cx - bw / 2, sy + dpx, bw, Math.min(14, H - sy - dpx));
  rect(c, cx - bw / 2, sy + dpx - bh, bw, bh, '#7c8794', '#0a0e14');
  const al = 16 + S.f0 * 0.05, bt = sy + dpx - bh; arrow(c, cx, bt - al - 4, cx, bt - 3, C.orange, 3);
  tx(c, 'F = ' + S.f0 + ' ' + t('unitN'), 10, 16, C.orange, 13, 'left'); tx(c, 'S = ' + S.a0 + ' ' + t('unitCm2'), 10, 36, C.cyan, 13, 'left');
  tx(c, fmt(d, 1) + ' ' + t('unitCm'), W - 10, H - 12, '#33506b', 13, 'right');
}
function roS0() {
  const p = pKpa(S.f0, S.a0);
  $('s0-f-o').textContent = S.f0 + ' ' + t('unitN'); $('s0-a-o').textContent = S.a0 + ' ' + t('unitCm2');
  $('s0-ro').textContent = t('s0ro', { f: S.f0, a: S.a0, p: fmt(p, 1), d: fmt(snowDepth(p), 1) });
}
/* ---- step 1 ---- */
function drawS1() {
  const c = fit('s1-cv'), W = c.W, H = c.H, ml = 52, mb = 34, mt = 12, mr = 14;
  const X = x => ml + (W - ml - mr) * (x + 2) / 3, Y = l => H - mb - (H - mb - mt) * l / 5.2;
  for (let x = -2; x <= 1; x++) { ln(c, X(x), mt, X(x), H - mb, '#22304a', 1); tx(c, fmt(Math.pow(10, x), x < 0 ? 2 : 0), X(x), H - mb + 14, C.muted, 11); }
  for (let l = 0; l <= 5; l++) { ln(c, ml, Y(l), W - mr, Y(l), '#22304a', 1); tx(c, l < 3 ? String(Math.pow(10, l)) : l === 3 ? '1 MPa' : l === 4 ? '10 MPa' : '100 MPa', ml - 5, Y(l), C.muted, 10, 'right'); }
  ln(c, ml, H - mb, W - mr, H - mb, C.muted, 1.5); ln(c, ml, mt, ml, H - mb, C.muted, 1.5);
  tx(c, 'S (' + t('unitCm2') + ')', W - mr, H - 8, C.muted, 12, 'right'); tx(c, 'p (' + t('unitKpa') + ')', ml + 4, mt + 4, C.muted, 12, 'left');
  const lg = x => Math.log10(10 * S.f1) - x;
  ln(c, X(-2), Y(lg(-2)), X(1), Y(lg(1)), C.cyan, 2.5);
  const x = Anim.get('x1', S.x1);
  ln(c, X(x), Y(lg(x)), X(x), H - mb, C.orange, 1, [3, 3]); ln(c, ml, Y(lg(x)), X(x), Y(lg(x)), C.orange, 1, [3, 3]);
  dt(c, X(x), Y(lg(x)), 8, C.orange);
  tx(c, '1 ' + t('unitCm2'), X(0), mt + 10, C.green, 11);
}
function roS1() {
  const a = areaFromLog(S.x1), p = pKpa(S.f1, a), f = fmtP(p);
  $('s1-f-o').textContent = S.f1 + ' ' + t('unitN'); $('s1-a-o').textContent = fmt(S.x1, 2);
  $('s1-ro').textContent = t('s1ro', { a: a < 1 ? fmt(a, 3) : fmt(a, 1), p: f.v, u: f.u, r: fmt(a / 1, a < 1 ? 2 : 1) });
}
/* ---- step 2 ---- */
function drawS2() {
  const c = fit('s2-cv'), W = c.W, H = c.H, sc = 110, fl = H - 24, x0 = 16, x1 = Math.min(W * 0.46, 190);
  const rho = LIQS[S.liq2], Hh = Anim.get('h2', S.h2), top = fl - Hh * sc;
  rect(c, x0, top, x1 - x0, fl - top, 'rgba(90,167,232,' + (0.25 + 0.3 * rho / 1030).toFixed(2) + ')');
  ln(c, x0, fl - 2.2 * sc, x0, fl, C.muted, 3); ln(c, x1, fl - 2.2 * sc, x1, fl, C.muted, 3); ln(c, x0, fl, W - 6, fl, C.muted, 3);
  ln(c, x0, top, x1, top, C.cyan, 1.5, [6, 4]);
  HOLES.forEach(y => {
    const d = Hh - y, yy = fl - y * sc;
    if (d <= 1e-9) { dt(c, x1, yy, 3, '#55637a'); return; }
    const p = holePressure(rho, d); arrow(c, x1 - 4 - 2.6 * p, yy, x1 - 4, yy, C.orange, 2);
    const v = Math.sqrt(2 * G * d); let px = x1, py = yy; c.beginPath(); c.moveTo(px, py);
    for (let tt = 0; ; tt += 0.01) { const X = x1 + v * tt * sc, Y = yy + 0.5 * G * tt * tt * sc; if (Y > fl) { c.lineTo(X, fl); break; } c.lineTo(X, Y); if (tt > 2) break; }
    c.strokeStyle = '#5aa7e8'; c.lineWidth = 2.5; c.stroke();
    tx(c, fmt(p, 1) + ' ' + t('unitKpa'), x1 - 10 - 2.6 * p, yy - 9, C.orange, 11, 'right');
  });
}
function roS2() {
  const rho = LIQS[S.liq2], act = activeHoles(S.h2), dLow = S.h2 - HOLES[0];
  const dHi = S.h2 - act[act.length - 1], r = act.length > 1 ? dLow / dHi : 1;
  $('s2-h-o').textContent = fmt(S.h2, 1) + ' ' + t('unitM');
  $('s2-ro').textContent = t('s2ro', { d: fmt(dLow, 1), rho, p: fmt(holePressure(rho, dLow), 1), r: fmt(r, 1) });
}
/* ---- step 3 ---- */
function drawS3() {
  const c = fit('s3-cv'), W = c.W, H = c.H, z = Anim.get('z', S.z), p = baroPressure(z), rho = RHO3[liq3];
  const h0 = columnHeightM(P0, rho), full = h0 * 1.15, top = 24, bot = H - 48, tcx = Math.min(W * 0.3, 130);
  const px = m => (m / full) * (bot - top), h = columnHeightM(p, rho);
  rect(c, tcx - 20, bot, 40 + 60, 18, 'rgba(90,167,232,.35)');
  rect(c, tcx - 9, top, 18, bot - top, 'rgba(255,255,255,.05)', C.muted);
  rect(c, tcx - 9, bot - px(h), 18, px(h), liq3 === 'hg' ? '#b9c3cf' : 'rgba(90,167,232,.7)');
  ln(c, tcx - 30, bot - px(h0), tcx + 30, bot - px(h0), C.green, 1, [4, 3]);
  tx(c, fmt(liq3 === 'hg' ? h * 1000 : h, liq3 === 'hg' ? 0 : 2) + ' ' + t(liq3 === 'hg' ? 'unitMm' : 'unitM'), tcx + 16, bot - px(h) - 10, C.orange, 13, 'left');
  const mx = W * 0.58, mw = W * 0.38, mh = H - 40;
  c.beginPath(); c.moveTo(mx, H - 24); c.lineTo(mx + mw * 0.55, 40); c.lineTo(mx + mw, H - 24); c.closePath(); c.fillStyle = '#243247'; c.fill();
  const N = Math.round(70 * p / P0);
  for (let i = 0; i < N; i++) dt(c, mx - 10 + ((i * 97.3) % 1) * (mw + 20), 20 + ((i * 61.7) % 1) * (H - 70), 1.8, 'rgba(110,231,255,.55)');
  const fz = z / 8800, ax = mx + mw * 0.55 * fz * 1.0 + mw * 0.0, ay = H - 24 - (H - 64) * fz;
  dt(c, mx + (mw * 0.55) * fz + (mw * 0.45 * (1 - fz)) * 0 + (0), ay, 6, C.orange);
  tx(c, fmt(p, 1) + ' ' + t('unitKpa'), W - 8, 12, C.orange, 12, 'right');
}
function roS3() {
  const p = baroPressure(S.z), rho = RHO3[liq3], h = columnHeightM(p, rho);
  $('s3-z-o').textContent = S.z + ' ' + t('unitM');
  $('s3-ro').textContent = t('s3ro', { z: S.z, p: fmt(p, 1), r: fmt(100 * p / P0, 0), liq: t(KEY3[liq3]), h: liq3 === 'hg' ? fmt(h * 1000, 0) : fmt(h, 2), u: t(liq3 === 'hg' ? 'unitMm' : 'unitM') });
}
/* ---- step 4 ---- */
function drawS4() {
  const c = fit('s4-cv'), W = c.W, H = c.H, pr = Anim.get('push', 0), f2 = hydraulicF2(S.f4, S.a4, S.b4), lifts = f2 >= LOAD_N;
  const w1 = 5.6 * Math.sqrt(S.a4), w2 = 5.6 * Math.sqrt(S.b4), sc = 9, base = H - 40, cx1 = W * 0.22, cx2 = Math.min(W * 0.68, W - w2 / 2 - 14);
  const d1 = 10 * pr, d2 = lifts ? pistonDisp(S.a4, S.b4, 10) * pr : 0, y0 = 110;
  rect(c, cx1 - w1 / 2 - 4, y0, w1 + 8, base - y0 + 6, 'rgba(90,167,232,.25)'); rect(c, cx2 - w2 / 2 - 4, y0, w2 + 8, base - y0 + 6, 'rgba(90,167,232,.25)');
  rect(c, cx1 - w1 / 2 - 4, base, cx2 - cx1 + w2 / 2 + w1 / 2 + 8, 10, 'rgba(90,167,232,.25)');
  rect(c, cx1 - w1 / 2, y0 + d1 * sc - 10, w1, 10, C.cyan); ln(c, cx1, y0 + d1 * sc - 10, cx1, y0 + d1 * sc - 40, C.cyan, 3);
  rect(c, cx2 - w2 / 2, y0 - d2 * sc - 10, w2, 10, C.cyan);
  rect(c, cx2 - 22, y0 - d2 * sc - 50, 44, 40, '#7c8794', '#0a0e14'); tx(c, '100 kg', cx2, y0 - d2 * sc - 30, '#0a0e14', 11);
  arrow(c, cx1, y0 - 72 + d1 * sc, cx1, y0 - 44 + d1 * sc, C.orange, 3); tx(c, 'F₁ = ' + S.f4 + ' ' + t('unitN'), cx1 + 10, y0 - 66 + d1 * sc, C.orange, 12, 'left');
  tx(c, 'F₂ = ' + fmt(f2, 0) + ' ' + t('unitN'), cx2, base + 26, lifts ? C.green : C.pink, 13);
  ln(c, cx1 - w1 / 2 - 22, y0, cx1 - w1 / 2 - 10, y0, C.muted, 1.2); tx(c, '0', cx1 - w1 / 2 - 28, y0, C.muted, 10, 'right');
  ln(c, cx1 - w1 / 2 - 22, y0 + 10 * sc, cx1 - w1 / 2 - 10, y0 + 10 * sc, C.muted, 1.2); tx(c, '10 ' + t('unitCm'), cx1 - w1 / 2 - 26, y0 + 10 * sc, C.muted, 10, 'right');
}
function roS4() {
  const p = pKpa(S.f4, S.a4), f2 = hydraulicF2(S.f4, S.a4, S.b4), lifts = f2 >= LOAD_N;
  $('s4-f1-o').textContent = S.f4 + ' ' + t('unitN'); $('s4-a1-o').textContent = S.a4 + ' ' + t('unitCm2'); $('s4-a2-o').textContent = S.b4 + ' ' + t('unitCm2');
  let move = t('s4idle');
  if (S.pushed) { if (lifts) { const d2 = pistonDisp(S.a4, S.b4, 10); move = t('s4moved', { d2: fmt(d2, 2), w1: fmt(S.f4 * 0.1, 1), w2: fmt(f2 * d2 / 100, 1) }); } else move = t('s4stuck'); }
  $('s4-ro').textContent = t('s4ro', { p: fmt(p, 1), f2: fmt(f2, 0), cmp: t(lifts ? 's4lift' : 's4nolift'), move });
}

function redraw() { drawS0(); drawS1(); drawS2(); drawS3(); drawS4(); roS0(); roS1(); roS2(); roS3(); roS4(); }
function fillAll() { fillSel('s2-liq', Object.keys(LIQS), LIQ_KEY, S.liq2); fillSel('s3-liq', ['hg', 'water'], KEY3, liq3); }
function s4target() { return S.pushed && hydraulicF2(S.f4, S.a4, S.b4) >= LOAD_N ? 1 : (S.pushed ? 0 : 0); }
function boot() {
  Anim.redraw = redraw; window.onLang = () => { fillAll(); redraw(); };
  bindLang(); bindSpy();
  const on = (id, ev, fn) => $(id).addEventListener(ev, fn);
  on('s0-f', 'input', e => { S.f0 = Number(e.target.value); Anim.set('dent', snowDepth(pKpa(S.f0, S.a0))); redraw(); });
  on('s0-a', 'input', e => { S.a0 = Number(e.target.value); Anim.set('dent', snowDepth(pKpa(S.f0, S.a0))); redraw(); });
  on('s1-f', 'input', e => { S.f1 = Number(e.target.value); redraw(); });
  on('s1-a', 'input', e => { S.x1 = Number(e.target.value); Anim.set('x1', S.x1); redraw(); });
  on('s2-liq', 'change', e => { S.liq2 = e.target.value; redraw(); });
  on('s2-h', 'input', e => { S.h2 = Number(e.target.value); Anim.set('h2', S.h2); redraw(); });
  on('s3-liq', 'change', e => { liq3 = e.target.value; redraw(); });
  on('s3-z', 'input', e => { S.z = Number(e.target.value); Anim.set('z', S.z); redraw(); });
  ['s4-f1', 's4-a1', 's4-a2'].forEach(id => on(id, 'input', e => { S[{ 's4-f1': 'f4', 's4-a1': 'a4', 's4-a2': 'b4' }[id]] = Number(e.target.value); Anim.set('push', s4target(), true); redraw(); }));
  on('s4-push', 'click', () => { S.pushed = true; Anim.set('push', s4target()); redraw(); });
  on('s4-reset', 'click', () => { S.pushed = false; Anim.set('push', 0); redraw(); });
  ['dent', 'x1', 'h2', 'z', 'push'].forEach(k => 0);
  Anim.set('dent', snowDepth(pKpa(S.f0, S.a0)), true); Anim.set('x1', S.x1, true); Anim.set('h2', S.h2, true); Anim.set('z', S.z, true); Anim.set('push', 0, true);
  let rt = 0; window.addEventListener('resize', () => { cancelAnimationFrame(rt); rt = requestAnimationFrame(redraw); });
  applyLang(getLang());
}
if (typeof document !== 'undefined' && document.getElementById('langToggle')) boot();
if (typeof module !== 'undefined') module.exports = { pKpa, snowDepth, areaFromLog, holePressure, activeHoles, baroPressure, columnHeightM, hydraulicF2, pistonDisp, LOAD_N };
