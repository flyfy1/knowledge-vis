'use strict';
/* ---------- pure model ---------- */
const SP = { H2: ['H₂', { H: 2 }], O2: ['O₂', { O: 2 }], H2O: ['H₂O', { H: 2, O: 1 }], CH4: ['CH₄', { C: 1, H: 4 }], CO2: ['CO₂', { C: 1, O: 2 }], Fe: ['Fe', { Fe: 1 }], Fe2O3: ['Fe₂O₃', { Fe: 2, O: 3 }],
  N2: ['N₂', { N: 2 }], NH3: ['NH₃', { N: 1, H: 3 }], C3H8: ['C₃H₈', { C: 3, H: 8 }], KClO3: ['KClO₃', { K: 1, Cl: 1, O: 3 }], KCl: ['KCl', { K: 1, Cl: 1 }],
  Al: ['Al', { Al: 1 }], HCl: ['HCl', { H: 1, Cl: 1 }], AlCl3: ['AlCl₃', { Al: 1, Cl: 3 }], Mg: ['Mg', { Mg: 1 }], MgO: ['MgO', { Mg: 1, O: 1 }] };
const RX = {
  r0: { l: ['H2', 'O2'], r: ['H2O'] }, r1: { l: ['CH4', 'O2'], r: ['CO2', 'H2O'] }, r2: { l: ['Fe', 'O2'], r: ['Fe2O3'] },
  r3: { l: ['N2', 'H2'], r: ['NH3'] }, r4: { l: ['C3H8', 'O2'], r: ['CO2', 'H2O'] }, r5: { l: ['KClO3'], r: ['KCl', 'O2'] },
  r6: { l: ['Al', 'HCl'], r: ['AlCl3', 'H2'] }, r7: { l: ['Mg', 'O2'], r: ['MgO'] }
};
const EL_ORDER = ['C', 'H', 'N', 'O', 'K', 'Cl', 'Al', 'Fe', 'Mg'];
const STAGES = [[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 2], [1, 2, 1, 2]];
const PRACTICE = ['r3', 'r4', 'r5', 'r6', 'r7'];
const species = rx => RX[rx].l.concat(RX[rx].r);
function tally(rx, co) {
  const r = RX[rx], out = {};
  r.l.forEach((s, i) => { for (const el in SP[s][1]) (out[el] = out[el] || { l: 0, r: 0 }).l += co[i] * SP[s][1][el]; });
  r.r.forEach((s, j) => { for (const el in SP[s][1]) (out[el] = out[el] || { l: 0, r: 0 }).r += co[r.l.length + j] * SP[s][1][el]; });
  return EL_ORDER.filter(e => out[e]).map(e => ({ el: e, l: out[e].l, r: out[e].r }));
}
const isBalanced = (rx, co) => tally(rx, co).every(x => x.l === x.r);
const gcd2 = (a, b) => b ? gcd2(b, a % b) : a;
const gcdAll = co => co.reduce(gcd2, 0);
function solve(rx) {
  const n = species(rx).length; let best = null;
  const rec = (i, co) => { if (i === n) { if (isBalanced(rx, co) && (!best || co.reduce((a, b) => a + b, 0) < best.reduce((a, b) => a + b, 0))) best = co.slice(); return; } for (let v = 1; v <= 12; v++) { co.push(v); rec(i + 1, co); co.pop(); } };
  rec(0, []); return best;
}
function eqString(rx, co) {
  const r = RX[rx], f = (s, i) => (co[i] === 1 ? '' : co[i] + ' ') + SP[s][0];
  return r.l.map((s, i) => f(s, i)).join(' + ') + ' → ' + r.r.map((s, j) => f(s, r.l.length + j)).join(' + ');
}
const tallyString = (rx, co) => tally(rx, co).map(x => x.el + ' ' + x.l + (x.l === x.r ? '=' : '≠') + x.r).join(' · ');
const hintFor = (rx, co) => { const sol = solve(rx); for (let i = 0; i < sol.length; i++) if (co[i] !== sol[i]) return { i: i + 1, v: sol[i] }; return null; };
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

const S = { c0: [1, 1, 1], st: 0, c2: [1, 1, 1], hint: null, k: 1, rx4: 'r3', c4: [1, 1, 1, 1], done: [] };
const SOL0 = solve('r0');
function fillRx() {
  const el = $('s4-rx'); el.innerHTML = '';
  PRACTICE.forEach(k => { const o = document.createElement('option'); o.value = k; o.textContent = t('rx' + k.slice(1)); if (k === S.rx4) o.selected = true; el.appendChild(o); });
}
function tilt(key, target) { const o = Anim.v[key] || (Anim.v[key] = { cur: target, tgt: target }); o.tgt = target; if (reduced()) o.cur = target; if (Math.abs(o.cur - o.tgt) > 0.003) Anim.kick(); return o.cur; }
function drawRx(id, rx, co, tag) {
  const c = fit(id), W = c.W, H = c.H, tl = tally(rx, co), n = tl.length;
  let fs = 17, s = eqString(rx, co); c.font = fs + 'px system-ui'; while (c.measureText(s).width > W - 16 && fs > 10) { fs--; c.font = fs + 'px system-ui'; }
  tx(c, s, W / 2, 22, C.text, fs);
  const cell = (W - 16) / n, py = 140, len = Math.min(cell * 0.28, 62);
  tl.forEach((x, i) => {
    const cx = 8 + cell * (i + 0.5), a = tilt(tag + i, clamp((x.l - x.r) / Math.max(x.l, x.r, 1), -1, 1) * 0.3), ok = x.l === x.r, col = ok ? C.green : C.pink;
    ln(c, cx, py, cx, py + 70, C.line, 5); ln(c, cx - 22, py + 72, cx + 22, py + 72, C.line, 6);
    const lx = cx - len * Math.cos(a), ly = py + len * Math.sin(a), rx2 = cx + len * Math.cos(a), ry = py - len * Math.sin(a);
    ln(c, lx, ly, rx2, ry, col, 4); dt(c, cx, py, 5, C.orange);
    [[lx, ly, x.l], [rx2, ry, x.r]].forEach(p => {
      ln(c, p[0], p[1], p[0] - 16, p[1] + 26, C.muted, 1); ln(c, p[0], p[1], p[0] + 16, p[1] + 26, C.muted, 1); ln(c, p[0] - 18, p[1] + 26, p[0] + 18, p[1] + 26, C.muted, 3);
      const m = Math.min(p[2], 12); for (let d = 0; d < m; d++) dt(c, p[0] - 12 + (d % 4) * 8, p[1] + 20 - Math.floor(d / 4) * 8, 3.2, col);
      tx(c, String(p[2]), p[0], p[1] - 12 - 0, C.text, 13);
    });
    tx(c, x.el + (ok ? ' · ' + t('lblBal') : ' · ' + t('lblOff')), cx, py + 92, col, 14);
  });
  tx(c, t('lblL'), 10, H - 10, C.muted, 11, 'left'); tx(c, t('lblR'), W - 10, H - 10, C.muted, 11, 'right');
}
const verdictBasic = (rx, co) => isBalanced(rx, co) ? t('s0ok') : t('s0no');
function ro(rx, co, verdict) { return { eq: eqString(rx, co), tally: tallyString(rx, co), verdict }; }
function roS0() { ['s0-c0', 's0-c1', 's0-c2'].forEach((id, i) => { $(id + '-o').textContent = SP[species('r0')[i]][0] + ' × ' + S.c0[i]; }); $('s0-ro').textContent = t('s0ro', ro('r0', S.c0, verdictBasic('r0', S.c0))); }
function roS1() {
  const co = STAGES[S.st]; $('s1-st-o').textContent = String(S.st);
  $('s1-ro').textContent = t('s1ro', { st: S.st, note: t('st' + S.st), eq: eqString('r1', co), tally: tallyString('r1', co) });
}
function roS2() {
  const co = S.c2, g = gcdAll(co); ['s2-c0', 's2-c1', 's2-c2'].forEach((id, i) => { $(id + '-o').textContent = SP[species('r2')[i]][0] + ' × ' + co[i]; });
  const bal = isBalanced('r2', co);
  let v = bal ? (g === 1 ? t('s2solved') : t('s2solvedBig', { g })) : t('s0no');
  if (S.hint && !bal) { const h = hintFor('r2', co); if (h) v += ' ' + t('s2hintMsg', { i: h.i, v: h.v }); }
  $('s2-ro').textContent = t('s2ro', ro('r2', co, v));
}
function roS3() {
  const co = SOL0.map(x => x * S.k), g = gcdAll(co); $('s3-k-o').textContent = '× ' + S.k;
  $('s3-ro').textContent = t('s3ro', ro('r0', co, g === 1 ? t('s3simple') : t('s3notSimple', { g })));
}
function checkDone() { const co = S.c4.slice(0, species(S.rx4).length); if (isBalanced(S.rx4, co) && gcdAll(co) === 1 && !S.done.includes(S.rx4)) S.done.push(S.rx4); }
function roS4() {
  const sp = species(S.rx4), co = S.c4.slice(0, sp.length), g = gcdAll(co); checkDone();
  for (let i = 0; i < 4; i++) { const el = $('s4-c' + i); el.parentElement.hidden = i >= sp.length; if (i < sp.length) $('s4-c' + i + '-o').textContent = SP[sp[i]][0] + ' × ' + S.c4[i]; }
  const bal = isBalanced(S.rx4, co), v = bal ? (g === 1 ? t('s4done') + '.' : t('s3notSimple', { g })) : t('s0no');
  const list = S.done.length ? S.done.map(k => t('rx' + k.slice(1))).join(', ') : t('s4list0');
  $('s4-ro').textContent = t('s4ro', { eq: eqString(S.rx4, co), tally: tallyString(S.rx4, co), verdict: v, n: S.done.length, tot: PRACTICE.length, list });
}
function redraw() {
  drawRx('s0-cv', 'r0', S.c0, 'a'); drawRx('s1-cv', 'r1', STAGES[S.st], 'b'); drawRx('s2-cv', 'r2', S.c2, 'c');
  drawRx('s3-cv', 'r0', SOL0.map(x => x * S.k), 'd'); drawRx('s4-cv', S.rx4, S.c4.slice(0, species(S.rx4).length), 'e');
  roS0(); roS1(); roS2(); roS3(); roS4();
}
function boot() {
  Anim.redraw = redraw; window.onLang = () => { fillRx(); redraw(); };
  bindLang(); bindSpy();
  const on = (id, ev, fn) => $(id).addEventListener(ev, fn);
  [0, 1, 2].forEach(i => { on('s0-c' + i, 'input', e => { S.c0[i] = Number(e.target.value); redraw(); }); on('s2-c' + i, 'input', e => { S.c2[i] = Number(e.target.value); S.hint = null; redraw(); }); });
  [0, 1, 2, 3].forEach(i => on('s4-c' + i, 'input', e => { S.c4[i] = Number(e.target.value); redraw(); }));
  on('s1-st', 'input', e => { S.st = Number(e.target.value); redraw(); });
  on('s2-hint', 'click', () => { S.hint = true; redraw(); });
  on('s2-reset', 'click', () => { S.c2 = [1, 1, 1]; S.hint = null; [0, 1, 2].forEach(i => { $('s2-c' + i).value = 1; }); redraw(); });
  on('s3-k', 'input', e => { S.k = Number(e.target.value); redraw(); });
  on('s4-rx', 'change', e => { S.rx4 = e.target.value; S.c4 = [1, 1, 1, 1]; [0, 1, 2, 3].forEach(i => { $('s4-c' + i).value = 1; }); redraw(); });
  on('s4-reset', 'click', () => { S.c4 = [1, 1, 1, 1]; [0, 1, 2, 3].forEach(i => { $('s4-c' + i).value = 1; }); redraw(); });
  let rt = 0; window.addEventListener('resize', () => { cancelAnimationFrame(rt); rt = requestAnimationFrame(redraw); });
  applyLang(getLang());
}
if (typeof document !== 'undefined' && document.getElementById('langToggle')) boot();
if (typeof module !== 'undefined') module.exports = { RX, SP, tally, isBalanced, gcdAll, solve, eqString, tallyString, hintFor, species };
