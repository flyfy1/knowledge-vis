'use strict';
/* ---------- pure model ---------- */
const MOLS = { H2: { H: 2 }, O2: { O: 2 }, H2O: { H: 2, O: 1 }, CO2: { C: 1, O: 2 }, CH4: { C: 1, H: 4 }, NH3: { N: 1, H: 3 } };
const FORM = { H2: 'H₂', O2: 'O₂', H2O: 'H₂O', CO2: 'CO₂', CH4: 'CH₄', NH3: 'NH₃' };
const ELS = ['C', 'H', 'N', 'O'];
const EL_COL = { H: '#e8edf4', O: '#ff7a93', C: '#7f8c9c', N: '#6ea8ff' }, EL_R = { H: 0.28, O: 0.42, C: 0.4, N: 0.4 };
const GEO = {
  H2: { a: [['H', -0.5, 0], ['H', 0.5, 0]], b: [[0, 1]] },
  O2: { a: [['O', -0.6, 0], ['O', 0.6, 0]], b: [[0, 1], [0, 1]] },
  H2O: { a: [['O', 0, 0], ['H', -0.77, 0.6], ['H', 0.77, 0.6]], b: [[0, 1], [0, 2]] },
  CO2: { a: [['O', -1.2, 0], ['C', 0, 0], ['O', 1.2, 0]], b: [[0, 1], [1, 2]] },
  CH4: { a: [['C', 0, 0], ['H', -0.8, -0.8], ['H', 0.8, -0.8], ['H', -0.8, 0.8], ['H', 0.8, 0.8]], b: [[0, 1], [0, 2], [0, 3], [0, 4]] },
  NH3: { a: [['N', 0, 0.1], ['H', -0.9, -0.6], ['H', 0.9, -0.6], ['H', 0, 0.9]], b: [[0, 1], [0, 2], [0, 3]] }
};
const SCEN = [
  { b: { H2O: 6 }, a: { H2O: 6 } }, { b: { H2O: 6 }, a: { H2O: 6 } },
  { b: { H2O: 4 }, a: { H2: 4, O2: 2 } }, { b: { H2: 4, O2: 2 }, a: { H2O: 4 } },
  { b: { CH4: 2, O2: 4 }, a: { CO2: 2, H2O: 4 } }, { b: { H2: 2, O2: 1 }, a: { H2: 2, O2: 1 } }
];
function atomTotal(counts) { const r = {}; for (const m in counts) for (const el in MOLS[m]) r[el] = (r[el] || 0) + MOLS[m][el] * counts[m]; return r; }
function fmtAtoms(o) { return ELS.filter(e => o[e] > 0).map(e => e + '×' + o[e]).join(' · '); }
function electro(n, e) { return { H2O: n - 2 * e, H2: 2 * e, O2: e }; }
function burn(n, e) { return { CH4: n - e, O2: 2 * n - 2 * e, CO2: e, H2O: 2 * e }; }
function kinds(o) { return Object.keys(o).filter(k => o[k] > 0).sort().join(','); }
function isChemical(sc) { return kinds(sc.b) !== kinds(sc.a); }
function stateOfT(T) { return T < 92 ? 'liq' : T < 108 ? 'boil' : 'gas'; }
function spreadOfT(T) { const x = Math.max(0, Math.min(1, (T - 92) / 16)); return x * x * (3 - 2 * x); }
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

const S = { mol: 'H2O', n0: 3, T: 20, n2: 8, run2: false, sc: 0, guess: null, e4: 0 };
const MK = { H2: 'mH2', O2: 'mO2', H2O: 'mH2O', CO2: 'mCO2', CH4: 'mCH4', NH3: 'mNH3' };
function fillSel(id, items, cur) {
  const el = $(id); el.innerHTML = '';
  items.forEach(([k, label]) => { const o = document.createElement('option'); o.value = k; o.textContent = label; if (String(k) === String(cur)) o.selected = true; el.appendChild(o); });
}
function drawMol(c, key, cx, cy, sc, rot) {
  const g = GEO[key], cs = Math.cos(rot || 0), sn = Math.sin(rot || 0);
  const P = g.a.map(a => [cx + sc * (a[1] * cs - a[2] * sn), cy - sc * (a[1] * sn + a[2] * cs)]);
  g.b.forEach((b, i) => { const dup = g.b.slice(0, i).some(q => q[0] === b[0] && q[1] === b[1]); ln(c, P[b[0]][0], P[b[0]][1] + (dup ? 2.5 : 0), P[b[1]][0], P[b[1]][1] + (dup ? 2.5 : 0), '#8896ab', Math.max(1.5, sc * 0.1)); });
  g.a.forEach((a, i) => dt(c, P[i][0], P[i][1], EL_R[a[0]] * sc, EL_COL[a[0]]));
}
const hash = i => { const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };

/* ---- step 0 ---- */
function drawS0() {
  const c = fit('s0-cv'), W = c.W, H = c.H, n = S.n0, cols = Math.min(n, W < 500 ? 3 : 6), rows = Math.ceil(n / cols);
  const sc = Math.min(36, (W - 20) / (cols * 3.2), (H - 20) / (rows * 3.2));
  for (let i = 0; i < n; i++) drawMol(c, S.mol, W / 2 + ((i % cols) - (cols - 1) / 2) * sc * 3.2, H / 2 + (Math.floor(i / cols) - (rows - 1) / 2) * sc * 3.2, sc, 0);
}
function roS0() {
  $('s0-n-o').textContent = String(S.n0);
  const per = MOLS[S.mol], tot = atomTotal({ [S.mol]: S.n0 });
  $('s0-ro').textContent = t('s0ro', { n: S.n0, name: t(MK[S.mol]), per: fmtAtoms(per), tot: fmtAtoms(tot) });
}
/* ---- step 1 (continuous loop only while on screen) ---- */
let tNow = 0;
function drawS1() {
  const c = fit('s1-cv'), W = c.W, H = c.H, T = S.T, g = Anim.get('spread', spreadOfT(S.T));
  const a = 1.5 + (T - 20) * 0.04 + g * 14, cols = 4, gx = 36, gy = 34;
  for (let i = 0; i < 12; i++) {
    const hx = W / 2 + ((i % cols) - 1.5) * gx, hy = H / 2 + (Math.floor(i / cols) - 1) * gy;
    const fx = 24 + hash(i + 1) * (W - 48), fy = 24 + hash(i + 40) * (H - 48);
    const w1 = tNow * (0.9 + hash(i) * 0.8) * (1 + (T - 20) / 60), w2 = tNow * (1.1 + hash(i + 7) * 0.7) * (1 + (T - 20) / 60);
    const x = hx + (fx - hx) * g + a * Math.sin(w1 + i), y = hy + (fy - hy) * g + a * Math.cos(w2 + i * 2);
    drawMol(c, 'H2O', clamp(x, 14, W - 14), clamp(y, 14, H - 14), 10, g > 0.05 ? w1 * 0.7 : Math.sin(w1) * 0.3);
  }
  tx(c, fmt(T, 0) + ' ' + t('unitC'), W - 10, 14, C.orange, 14, 'right');
}
function roS1() {
  $('s1-t-o').textContent = S.T + ' ' + t('unitC');
  const st = stateOfT(S.T);
  $('s1-ro').textContent = t('s1ro', { T: S.T, state: t(st === 'liq' ? 's1liq' : st === 'boil' ? 's1boil' : 's1gas'), n: 12, atoms: fmtAtoms(atomTotal({ H2O: 12 })) });
}
let loopOn = false, vis1 = false;
function frame(ts) { tNow = ts / 1000; drawS1(); if (vis1 && !document.hidden && !reduced()) requestAnimationFrame(frame); else loopOn = false; }
function kickLoop() { if (!loopOn && vis1 && !reduced()) { loopOn = true; requestAnimationFrame(frame); } }
/* ---- step 2 ---- */
function drawS2() {
  const c = fit('s2-cv'), W = c.W, H = c.H, n = S.n2, e = Math.floor(Anim.get('ev', 0) + 1e-9), q = electro(n, e);
  const tankTop = H - 110, tx0 = 20, tx1 = W - 20;
  rect(c, tx0, tankTop, tx1 - tx0, 100, 'rgba(90,167,232,0.28)', C.muted);
  const cols = 8;
  for (let i = 0; i < q.H2O; i++) drawMol(c, 'H2O', tx0 + 30 + (i % cols) * Math.min(40, (tx1 - tx0 - 60) / cols), tankTop + 28 + Math.floor(i / cols) * 40, 9, 0);
  const tubes = [{ x: W * 0.28, k: 'H2', cnt: q.H2, col: EL_COL.H }, { x: W * 0.72, k: 'O2', cnt: q.O2, col: EL_COL.O }];
  tubes.forEach(tb => {
    rect(c, tb.x - 36, 24, 72, tankTop - 24, 'rgba(255,255,255,0.04)', C.muted);
    for (let i = 0; i < tb.cnt; i++) drawMol(c, tb.k, tb.x - 18 + (i % 2) * 36, tankTop - 18 - Math.floor(i / 2) * 26, 8, 0);
    tx(c, FORM[tb.k] + ' × ' + tb.cnt, tb.x, 14, tb.col === EL_COL.H ? C.text : C.pink, 13);
  });
  tx(c, FORM.H2O + ' × ' + q.H2O, W / 2, H - 8, C.cyan, 13);
}
function roS2() {
  const n = S.n2, max = n / 2, e = Math.floor(Anim.get('ev', 0) + 1e-9), q = electro(n, e), tot = atomTotal(q);
  $('s2-n-o').textContent = String(n);
  $('s2-ro').textContent = e === 0 && !S.run2 ? t('s2zero', { w: n }) : t('s2ro', { e, max, w: q.H2O, h: q.H2, o: q.O2, ratio: q.O2 ? fmt(q.H2 / q.O2, 1) : '—', ah: tot.H, ao: tot.O });
}
/* ---- step 3 ---- */
function drawS3() {
  const c = fit('s3-cv'), W = c.W, H = c.H, sc = SCEN[S.sc], mid = W / 2;
  const col = (o, x0, title) => {
    tx(c, title, x0 + 70, 18, C.muted, 13); let y = 48;
    const ks = Object.keys(o); if (!ks.length) tx(c, t('s3none'), x0 + 70, y, C.muted, 13);
    ks.forEach(k => { drawMol(c, k, x0 + 30, y, 12, 0); tx(c, FORM[k] + ' × ' + o[k], x0 + 62, y, C.text, 15, 'left'); y += 58; });
  };
  col(sc.b, 14, t('s3before')); col(sc.a, mid + 20, t('s3after'));
  arrow(c, mid - 26, H / 2, mid + 12, H / 2, C.orange, 3);
  if (S.guess) tx(c, t(isChemical(sc) ? 's3chmV' : 's3phyV'), mid, H - 16, isChemical(sc) ? C.pink : C.green, 15);
}
function fmtSp(o) { const ks = Object.keys(o); return ks.length ? ks.map(k => o[k] + ' ' + FORM[k]).join(' + ') : t('s3none'); }
function roS3() {
  const sc = SCEN[S.sc], chem = isChemical(sc);
  if (!S.guess) { $('s3-ro').textContent = t('s3g0'); return; }
  const ok = (S.guess === 'chem') === chem;
  $('s3-ro').textContent = t('s3ro', { name: t('sc' + S.sc), b: fmtSp(sc.b), a: fmtSp(sc.a), diff: t(chem ? 's3diff' : 's3same'), verdict: t(chem ? 's3chmV' : 's3phyV'), guess: t(ok ? 's3gOk' : 's3gNo') });
}
/* ---- step 4 ---- */
function drawS4() {
  const c = fit('s4-cv'), W = c.W, H = c.H, e = S.e4, q = burn(4, e), at = atomTotal(q), ks = ['CH4', 'O2', 'CO2', 'H2O'];
  const colr = { CH4: EL_COL.C, O2: EL_COL.O, CO2: '#b9c3cf', H2O: '#5aa7e8' };
  const bw = Math.min(46, (W - 40) / 9), top0 = 40, hTop = 88, base1 = top0 + hTop;
  ks.forEach((k, i) => { const x = 20 + i * (bw + 22), h = q[k] / 8 * hTop; rect(c, x, base1 - h, bw, h, colr[k]); tx(c, String(q[k]), x + bw / 2, base1 - h - 9, C.text, 12); tx(c, FORM[k], x + bw / 2, base1 + 13, C.muted, 12); });
  tx(c, t('lblMol'), 20, 14, C.muted, 12, 'left');
  const base2 = H - 30, hB = 100;
  tx(c, t('lblAtom'), 20, base2 - hB - 26, C.muted, 12, 'left');
  ['C', 'H', 'O'].forEach((el, i) => { const x = 20 + i * (bw + 22), h = at[el] / 16 * hB; rect(c, x, base2 - h, bw, h, EL_COL[el]); tx(c, String(at[el]), x + bw / 2, base2 - h - 9, C.text, 12); tx(c, el, x + bw / 2, base2 + 13, C.muted, 12); });
  const mx = 20 + 4 * (bw + 22) + 10; if (W - mx > 80) { drawMol(c, 'CH4', mx + 40, 60, 14, 0); tx(c, '+ 2 O₂ → CO₂ + 2 H₂O', mx + 40, 112, C.muted, 11); }
}
function roS4() {
  const e = S.e4, q = burn(4, e), at = atomTotal(q), a0 = atomTotal(burn(4, 0));
  $('s4-e-o').textContent = e + ' ' + t('unitEv');
  $('s4-ro').textContent = t('s4ro', { e, a: q.CH4, b: q.O2, c: q.CO2, d: q.H2O, tc: at.C, th: at.H, to: at.O, c0: a0.C, h0: a0.H, o0: a0.O });
}

function redraw() { drawS0(); drawS1(); drawS2(); drawS3(); drawS4(); roS0(); roS1(); roS2(); roS3(); roS4(); }
function fillAll() {
  fillSel('s0-mol', Object.keys(MOLS).map(k => [k, t(MK[k])]), S.mol);
  fillSel('s3-sc', SCEN.map((_, i) => [i, t('sc' + i)]), S.sc);
}
function boot() {
  Anim.redraw = redraw; window.onLang = () => { fillAll(); redraw(); };
  bindLang(); bindSpy();
  const on = (id, ev, fn) => $(id).addEventListener(ev, fn);
  on('s0-mol', 'change', e => { S.mol = e.target.value; redraw(); });
  on('s0-n', 'input', e => { S.n0 = Number(e.target.value); redraw(); });
  on('s1-t', 'input', e => { S.T = Number(e.target.value); Anim.set('spread', spreadOfT(S.T)); redraw(); kickLoop(); });
  on('s2-n', 'input', e => { S.n2 = Number(e.target.value); S.run2 = false; Anim.set('ev', 0, true); redraw(); });
  on('s2-run', 'click', () => { S.run2 = true; Anim.set('ev', S.n2 / 2); redraw(); });
  on('s2-reset', 'click', () => { S.run2 = false; Anim.set('ev', 0, true); redraw(); });
  on('s3-sc', 'change', e => { S.sc = Number(e.target.value); S.guess = null; redraw(); });
  on('s3-phys', 'click', () => { S.guess = 'phys'; redraw(); });
  on('s3-chem', 'click', () => { S.guess = 'chem'; redraw(); });
  on('s4-e', 'input', e => { S.e4 = Number(e.target.value); redraw(); });
  on('s4-reset', 'click', () => { S.e4 = 0; $('s4-e').value = 0; redraw(); });
  Anim.set('spread', spreadOfT(S.T), true); Anim.set('ev', 0, true);
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { vis1 = es[0].isIntersecting; if (vis1) kickLoop(); }, { threshold: 0.05 }).observe($('step1'));
  document.addEventListener('visibilitychange', kickLoop);
  let rt = 0; window.addEventListener('resize', () => { cancelAnimationFrame(rt); rt = requestAnimationFrame(redraw); });
  applyLang(getLang());
}
if (typeof document !== 'undefined' && document.getElementById('langToggle')) boot();
if (typeof module !== 'undefined') module.exports = { atomTotal, fmtAtoms, electro, burn, isChemical, SCEN, stateOfT, spreadOfT, MOLS };
