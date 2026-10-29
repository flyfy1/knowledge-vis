'use strict';
/* ---------- pure model ---------- */
const ITEMS = [0.5, 2.2, 2.9, 5.0, 7.0, 8.3, 10.0, 11.5, 12.5];
const UNIV = [[0, '#ff3030'], [2, '#ff6a2a'], [4, '#ffb12a'], [5.5, '#f2e23a'], [7, '#4fd36b'], [8.5, '#2fc3b0'], [10, '#3b7bff'], [12, '#6a4bd6'], [14, '#7a2fbf']];
const INDS = { u: { k: 'ind0' }, litmus: { k: 'ind1', lo: 4.5, hi: 8.3, a: '#e0463c', b: '#3d6ee0' }, phph: { k: 'ind2', lo: 8.2, hi: 10, a: '#e6edf3', b: '#ff4fa3' }, mo: { k: 'ind3', lo: 3.1, hi: 4.4, a: '#ff4030', b: '#f4c430' } };
const NA = 2.0, V_ACID = 20, C0 = 1e-2, KW_H = 1e-7;
const hex2 = h => [1, 3, 5].map(i => parseInt(h.substr(i, 2), 16));
const toHex = a => '#' + a.map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
function mix(a, b, x) { const p = hex2(a), q = hex2(b); return toHex(p.map((v, i) => v + (q[i] - v) * x)); }
function univColor(ph) { ph = Math.max(0, Math.min(14, ph)); for (let i = 0; i < UNIV.length - 1; i++) if (ph <= UNIV[i + 1][0]) return mix(UNIV[i][1], UNIV[i + 1][1], (ph - UNIV[i][0]) / (UNIV[i + 1][0] - UNIV[i][0])); return UNIV[UNIV.length - 1][1]; }
function colorOf(ind, ph) { if (ind === 'u') return univColor(ph); const d = INDS[ind]; return mix(d.a, d.b, Math.max(0, Math.min(1, (ph - d.lo) / (d.hi - d.lo)))); }
function regionOf(ind, ph) { if (ind === 'u') return 1; const d = INDS[ind]; return ph < d.lo ? 0 : ph > d.hi ? 2 : 1; }
const hConc = ph => Math.pow(10, -ph);
function kindOf(ph) { return Math.abs(ph - 7) < 0.05 ? 'kindNeutral' : ph < 7 ? 'kindAcid' : 'kindBase'; }
function titrationPH(v) {
  const nb = 0.1 * v, vt = V_ACID + v;
  if (Math.abs(nb - NA) < 1e-9) return 7;
  return nb < NA ? -Math.log10((NA - nb) / vt) : 14 + Math.log10((nb - NA) / vt);
}
function dilutionH(e) { return C0 / Math.pow(10, e) + KW_H; }
function dilutionPH(e) { return -Math.log10(dilutionH(e)); }
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
function sci(x) {
  let e = Math.floor(Math.log10(x)), m = x / Math.pow(10, e); if (m.toFixed(1) === '10.0') { m = 1; e++; }
  return m.toFixed(1) + '×10' + String(e).split('').map(ch => SUP[ch]).join('');
}
function ratioStr(d) { const r = Math.pow(10, d); return r < 10 ? r.toFixed(2) : r < 1000 ? r.toFixed(1) : sci(r); }
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

const S = { ph0: 7, item: 4, a: 2, b: 5, ind: 'u', ph2: 7, rec: [], v3: 0, e4: 0 };
function fillSel(id, items, cur) { const el = $(id); el.innerHTML = ''; items.forEach(([k, l]) => { const o = document.createElement('option'); o.value = k; o.textContent = l; if (String(k) === String(cur)) o.selected = true; el.appendChild(o); }); }
function band(c, x0, y0, w, h, ind) { const n = 140; for (let i = 0; i < n; i++) rect(c, x0 + w * i / n, y0, w / n + 1, h, colorOf(ind, 14 * (i + 0.5) / n)); }
function beakerC(c, x, y, w, h, col) { rect(c, x + 1.5, y + h * 0.25, w - 3, h * 0.75, col); ln(c, x, y, x, y + h, C.muted, 3); ln(c, x + w, y, x + w, y + h, C.muted, 3); ln(c, x, y + h, x + w, y + h, C.muted, 3); }
/* ---- step 0 ---- */
function drawS0() {
  const c = fit('s0-cv'), W = c.W, x0 = 22, w = W - 44, y0 = 100, h = 40, X = p => x0 + w * p / 14, ph = Anim.get('ph0', S.ph0);
  band(c, x0, y0, w, h, 'u');
  for (let p = 0; p <= 14; p++) { ln(c, X(p), y0 + h, X(p), y0 + h + 6, C.muted, 1.2); tx(c, String(p), X(p), y0 + h + 17, C.muted, 11); }
  ITEMS.forEach((p, i) => { dt(c, X(p), y0 + h + 36, i === S.item ? 0 : 4, C.text); });
  tx(c, t('kindAcid'), x0, y0 - 18, C.pink, 13, 'left'); tx(c, t('kindNeutral'), X(7), y0 - 18, C.green, 13); tx(c, t('kindBase'), x0 + w, y0 - 18, C.cyan, 13, 'right');
  c.beginPath(); c.moveTo(X(ph), y0 - 2); c.lineTo(X(ph) - 8, y0 - 14); c.lineTo(X(ph) + 8, y0 - 14); c.closePath(); c.fillStyle = C.orange; c.fill();
  ln(c, X(ph), y0, X(ph), y0 + h, '#0a0e14', 2);
  tx(c, 'pH ' + fmt(ph, 1), clamp(X(ph), 40, W - 40), y0 - 46, C.orange, 14);
  if (S.item >= 0) tx(c, t('it' + S.item), clamp(X(ph), 50, W - 50), y0 + h + 54, C.text, 13);
}
function roS0() {
  const ph = S.ph0; $('s0-ph-o').textContent = fmt(ph, 1);
  $('s0-ro').textContent = t('s0ro', { name: S.item >= 0 ? t('it' + S.item) : t('s0custom'), ph: fmt(ph, 1), kind: t(kindOf(ph)), h: sci(hConc(ph)) });
}
/* ---- step 1 ---- */
function drawS1() {
  const c = fit('s1-cv'), W = c.W, H = c.H, half = W * 0.5 - 14, x0 = 14;
  [['A', S.a, 60], ['B', S.b, 150]].forEach(([n, p, y]) => {
    tx(c, n, x0, y - 14, C.text, 14, 'left'); rect(c, x0, y, half * (14 - p) / 14, 30, univColor(p)); tx(c, 'pH ' + fmt(p, 1), x0 + half * (14 - p) / 14 + 6, y + 15, C.text, 12, 'left');
  });
  tx(c, 'pH (' + t('s1len') + ')', x0, 24, C.muted, 11, 'left');
  const rx = W * 0.5 + 10, rw = W - rx - 14, hA = hConc(S.a), hB = hConc(S.b), mx = Math.max(hA, hB);
  tx(c, '[H⁺] (' + t('s1lin') + ')', rx, 24, C.muted, 11, 'left');
  [['A', hA, 60], ['B', hB, 150]].forEach(([n, hh, y]) => { rect(c, rx, y, Math.max(1.5, rw * hh / mx), 30, univColor(-Math.log10(hh))); tx(c, n, rx, y - 14, C.text, 14, 'left'); tx(c, sci(hh), rx, y + 46, C.muted, 11, 'left'); });
  tx(c, '× ' + ratioStr(Math.abs(S.a - S.b)), W / 2, H - 38, C.orange, 22);
  tx(c, '10^' + fmt(Math.abs(S.a - S.b), 1), W / 2, H - 14, C.muted, 12);
}
function roS1() {
  $('s1-a-o').textContent = fmt(S.a, 1); $('s1-b-o').textContent = fmt(S.b, 1); const d = Math.abs(S.a - S.b);
  $('s1-ro').textContent = t('s1ro', { a: fmt(S.a, 1), ha: sci(hConc(S.a)), b: fmt(S.b, 1), hb: sci(hConc(S.b)), d: fmt(d, 1), ratio: ratioStr(d), who: t(d < 1e-9 ? 's1whoEq' : S.a < S.b ? 's1whoA' : 's1whoB') });
}
/* ---- step 2 ---- */
function drawS2() {
  const c = fit('s2-cv'), W = c.W, H = c.H, bw = 100, bx = W / 2 - bw / 2;
  beakerC(c, bx, 12, bw, 110, colorOf(S.ind, S.ph2)); tx(c, 'pH ' + fmt(S.ph2, 1), W / 2, 136, C.orange, 13);
  const x0 = 22, w = W - 44; band(c, x0, 158, w, 26, S.ind);
  for (let p = 0; p <= 14; p += 2) tx(c, String(p), x0 + w * p / 14, 198, C.muted, 11);
  const X = x0 + w * S.ph2 / 14; c.beginPath(); c.moveTo(X, 186); c.lineTo(X - 6, 197 - 3); c.lineTo(X + 6, 197 - 3); c.closePath(); c.fillStyle = C.orange; c.fill();
  tx(c, t('lblChart'), x0, 224, C.muted, 11, 'left');
  const per = Math.max(1, Math.floor(w / 34));
  S.rec.slice(-per * 2).forEach((r, i) => { const x = x0 + 14 + (i % per) * 34, y = 246 + Math.floor(i / per) * 38; dt(c, x, y, 12, colorOf(r.ind, r.ph)); tx(c, fmt(r.ph, 1), x, y + 22, C.muted, 10); });
}
function roS2() {
  $('s2-ph-o').textContent = fmt(S.ph2, 1);
  $('s2-ro').textContent = t('s2ro', { ind: t(INDS[S.ind].k), ph: fmt(S.ph2, 1), desc: t('s2d' + regionOf(S.ind, S.ph2)), n: S.rec.length });
}
/* ---- curve helper ---- */
function curve(c, W, H, xmax, ymin, ymax, f, ticksX, xlabel, cur, hline) {
  const ml = 38, mb = 36, mt = 12, mr = W - 140, cw = mr - ml, ch = H - mb - mt, X = x => ml + cw * x / xmax, Y = y => mt + ch - ch * (y - ymin) / (ymax - ymin);
  for (let y = Math.ceil(ymin); y <= ymax; y += (ymax - ymin > 8 ? 2 : 1)) { ln(c, ml, Y(y), ml + cw, Y(y), '#22304a', 1); tx(c, String(y), ml - 6, Y(y), C.muted, 11, 'right'); }
  ticksX.forEach(x => { ln(c, X(x), mt, X(x), mt + ch, '#22304a', 1); tx(c, String(x), X(x), mt + ch + 13, C.muted, 11); });
  ln(c, ml, mt + ch, ml + cw, mt + ch, C.muted, 1.5); ln(c, ml, mt, ml, mt + ch, C.muted, 1.5); tx(c, xlabel, ml + cw, mt + ch + 26, C.muted, 11, 'right'); tx(c, 'pH', ml + 4, mt + 2, C.muted, 12, 'left');
  if (hline !== undefined) ln(c, ml, Y(hline), ml + cw, Y(hline), C.green, 1.2, [5, 4]);
  c.beginPath(); for (let i = 0; i <= 160; i++) { const x = xmax * i / 160, y = Math.max(ymin, Math.min(ymax, f(x))); i ? c.lineTo(X(x), Y(y)) : c.moveTo(X(x), Y(y)); } c.strokeStyle = C.cyan; c.lineWidth = 2.5; c.stroke();
  const py = Math.max(ymin, Math.min(ymax, f(cur))); ln(c, X(cur), Y(py), X(cur), mt + ch, C.orange, 1, [3, 3]); dt(c, X(cur), Y(py), 7, C.orange);
  return py;
}
/* ---- step 3 ---- */
function drawS3() {
  const c = fit('s3-cv'), W = c.W, H = c.H, v = Anim.get('v3', S.v3);
  curve(c, W, H, 40, 0, 14, titrationPH, [0, 10, 20, 30, 40], t('unitMl'), v, 7);
  beakerC(c, W - 124, 40, 100, 150, univColor(titrationPH(v))); tx(c, 'pH ' + fmt(titrationPH(v), 1), W - 74, 214, C.orange, 13);
}
function roS3() {
  const v = S.v3, nb = 0.1 * v, ph = titrationPH(v); $('s3-v-o').textContent = fmt(v, 1) + ' ' + t('unitMl');
  const st = Math.abs(nb - NA) < 1e-9 ? t('s3eq') : nb < NA ? t('s3before', { x: fmt(NA - nb, 2) }) : t('s3after', { x: fmt(nb - NA, 2) });
  $('s3-ro').textContent = t('s3ro', { v: fmt(v, 1), state: st, ph: fmt(ph, 2) });
}
/* ---- step 4 ---- */
function drawS4() {
  const c = fit('s4-cv'), W = c.W, H = c.H, e = Anim.get('e4', S.e4);
  curve(c, W, H, 8, 1, 8, dilutionPH, [0, 2, 4, 6, 8], 'e', e, 7);
  beakerC(c, W - 124, 40, 100, 150, univColor(dilutionPH(e))); tx(c, 'pH ' + fmt(dilutionPH(e), 2), W - 74, 214, C.orange, 13);
}
function roS4() {
  const ph = dilutionPH(S.e4); $('s4-e-o').textContent = '10^' + fmt(S.e4, 1);
  $('s4-ro').textContent = t('s4ro', { e: fmt(S.e4, 1), h: sci(dilutionH(S.e4)), ph: fmt(ph, 2), kind: t(kindOf(ph)) });
}
function redraw() { drawS0(); drawS1(); drawS2(); drawS3(); drawS4(); roS0(); roS1(); roS2(); roS3(); roS4(); }
function fillAll() {
  fillSel('s0-item', ITEMS.map((_, i) => [i, t('it' + i)]), S.item); fillSel('s2-ind', Object.keys(INDS).map(k => [k, t(INDS[k].k)]), S.ind);
}
function boot() {
  Anim.redraw = redraw; window.onLang = () => { fillAll(); redraw(); };
  bindLang(); bindSpy();
  const on = (id, ev, fn) => $(id).addEventListener(ev, fn);
  on('s0-item', 'change', e => { S.item = Number(e.target.value); S.ph0 = ITEMS[S.item]; $('s0-ph').value = S.ph0; Anim.set('ph0', S.ph0); redraw(); });
  on('s0-ph', 'input', e => { S.ph0 = Number(e.target.value); S.item = -1; Anim.set('ph0', S.ph0); fillAll(); redraw(); });
  on('s1-a', 'input', e => { S.a = Number(e.target.value); redraw(); }); on('s1-b', 'input', e => { S.b = Number(e.target.value); redraw(); });
  on('s2-ind', 'change', e => { S.ind = e.target.value; redraw(); });
  on('s2-ph', 'input', e => { S.ph2 = Number(e.target.value); redraw(); });
  on('s2-rec', 'click', () => { S.rec.push({ ind: S.ind, ph: S.ph2 }); if (S.rec.length > 40) S.rec.shift(); redraw(); });
  on('s2-clear', 'click', () => { S.rec = []; redraw(); });
  on('s3-v', 'input', e => { S.v3 = Number(e.target.value); Anim.set('v3', S.v3); redraw(); });
  on('s3-reset', 'click', () => { S.v3 = 0; $('s3-v').value = 0; Anim.set('v3', 0); redraw(); });
  on('s4-e', 'input', e => { S.e4 = Number(e.target.value); Anim.set('e4', S.e4); redraw(); });
  on('s4-reset', 'click', () => { S.e4 = 0; $('s4-e').value = 0; Anim.set('e4', 0); redraw(); });
  Anim.set('ph0', S.ph0, true); Anim.set('v3', 0, true); Anim.set('e4', 0, true);
  let rt = 0; window.addEventListener('resize', () => { cancelAnimationFrame(rt); rt = requestAnimationFrame(redraw); });
  applyLang(getLang());
}
if (typeof document !== 'undefined' && document.getElementById('langToggle')) boot();
if (typeof module !== 'undefined') module.exports = { univColor, colorOf, regionOf, hConc, titrationPH, dilutionPH, dilutionH, sci, ratioStr, ITEMS, kindOf };
