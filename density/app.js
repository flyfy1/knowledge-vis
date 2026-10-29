'use strict';
/* ---------- pure model (single source of truth for every number on the page) ---------- */
const MATS = { cork: 0.24, wood: 0.5, ice: 0.92, water: 1.0, al: 2.7, fe: 7.9, au: 19.3 };
const MAT_KEY = { cork: 'matCork', wood: 'matWood', ice: 'matIce', water: 'matWater', al: 'matAl', fe: 'matFe', au: 'matAu' };
const MAT_COL = { cork: '#c9a27a', wood: '#b07d4f', ice: '#bfe9ff', water: '#5aa7e8', al: '#c3ccd6', fe: '#7c8794', au: '#f2c94c' };
const LIQ = { water: 1.0, salt: 1.03, oil: 0.92 };
const LIQ_KEY = { water: 'matWater', salt: 'matSalt', oil: 'matOil' };
const STONES = [{ m: 13.5, v: 5 }, { m: 39.5, v: 5 }, { m: 96.5, v: 5 }];
const V0 = 50, DOT_G = 0.25, NOISE = 0.02;
function massOf(rho, v) { return rho * v; }
function beamAngle(ml, mr) { const mx = Math.max(ml, mr, 1e-9); return 18 * (ml - mr) / mx; } // degrees, + = left side down
function jitter(v, idx) { return Math.sin(v * 12.9898 + idx * 78.233); }
function reading(rho, v, idx) { return rho * v * (1 + NOISE * jitter(v, idx)); }
function fitSlope(pts) { let a = 0, b = 0; for (const p of pts) { a += p.v * p.m; b += p.v * p.v; } return b > 0 ? a / b : 0; }
function dotsPerCell(rho) { return Math.max(1, Math.round(rho / DOT_G)); }
function floatState(ro, rl) { return Math.abs(ro - rl) < 0.0125 ? 'neutral' : ro < rl ? 'float' : 'sink'; }
function submergedFrac(ro, rl) { return Math.min(1, ro / rl); }
function nearestMat(rho) { let best = null, bd = Infinity; for (const k in MATS) { const d = Math.abs(MATS[k] - rho); if (d < bd) { bd = d; best = k; } } return best; }
function fmt(x, n) { return Number(x).toFixed(n === undefined ? 1 : n); }

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

/* ---------- page state ---------- */
const S = { l: 'fe', r: 'wood', v0: 10, m1: 'fe', v1: 8, pts: [], m2: 'fe', c2: 3, liq: 'water', ro: 0.5, dropped: false, obj: 0, inWater: false };

function fillSel(id, map, keyMap, cur) {
  const el = $(id); el.innerHTML = '';
  for (const k in map) { const o = document.createElement('option'); o.value = k; o.textContent = t(keyMap[k]) + ' (' + map[k] + ' g/cm³)'; if (k === cur) o.selected = true; el.appendChild(o); }
}
function fillObjSel() {
  const el = $('s4-obj'); el.innerHTML = '';
  ['s4o0', 's4o1', 's4o2'].forEach((k, i) => { const o = document.createElement('option'); o.value = String(i); o.textContent = t(k); if (i === S.obj) o.selected = true; el.appendChild(o); });
}

/* ---------- step 0: balance ---------- */
function drawS0() {
  const c = fit('s0-cv'), W = c.W, H = c.H;
  const ml = massOf(MATS[S.l], S.v0), mr = massOf(MATS[S.r], S.v0);
  const ang = Anim.get('beam', beamAngle(ml, mr)) * Math.PI / 180;
  const cx = W / 2, py = H - 30, pivotY = 100, L = Math.min(W * 0.36, 190);
  ln(c, cx, pivotY, cx, py, C.line, 6); rect(c, cx - 40, py, 80, 8, C.line);
  const lx = cx - L * Math.cos(ang), ly = pivotY + L * Math.sin(ang), rx = cx + L * Math.cos(ang), ry = pivotY - L * Math.sin(ang);
  ln(c, lx, ly, rx, ry, C.cyan, 5); dt(c, cx, pivotY, 7, C.orange);
  const side = 14 + 8 * Math.cbrt(S.v0);
  [[lx, ly, S.l, ml], [rx, ry, S.r, mr]].forEach(a => {
    const x = a[0], y = a[1];
    ln(c, x, y, x - 38, y + 52, C.muted, 1.2); ln(c, x, y, x + 38, y + 52, C.muted, 1.2); ln(c, x - 40, y + 52, x + 40, y + 52, C.muted, 3);
    rect(c, x - side / 2, y + 52 - side, side, side, MAT_COL[a[2]], '#0a0e14');
    tx(c, t(MAT_KEY[a[2]]), x, y + 70, C.text, 12);
    tx(c, fmt(a[3], 1) + ' ' + t('unitG'), x, y - 14, C.orange, 13);
  });
}
function roS0() {
  const ml = massOf(MATS[S.l], S.v0), mr = massOf(MATS[S.r], S.v0);
  let verdict;
  if (Math.abs(ml - mr) < 1e-9) verdict = t('s0eq');
  else if (ml > mr) verdict = t('s0heavL', { r: fmt(ml / mr, 2) });
  else verdict = t('s0heavR', { r: fmt(mr / ml, 2) });
  $('s0-ro').innerHTML = t('s0ro', { ml: fmt(ml, 1), mr: fmt(mr, 1), verdict });
  $('s0-vol-o').textContent = S.v0 + ' ' + t('unitCm3');
}

/* ---------- step 1: m-V graph ---------- */
function drawS1() {
  const c = fit('s1-cv'), W = c.W, H = c.H, ml = 46, mb = 34, mt = 14, mr = 14;
  const X = v => ml + (W - ml - mr) * v / 20, Y = m => H - mb - (H - mb - mt) * m / 400;
  for (let v = 0; v <= 20; v += 5) { ln(c, X(v), mt, X(v), H - mb, '#22304a', 1); tx(c, String(v), X(v), H - mb + 14, C.muted, 11); }
  for (let m = 0; m <= 400; m += 100) { ln(c, ml, Y(m), W - mr, Y(m), '#22304a', 1); tx(c, String(m), ml - 6, Y(m), C.muted, 11, 'right'); }
  ln(c, ml, H - mb, W - mr, H - mb, C.muted, 1.5); ln(c, ml, mt, ml, H - mb, C.muted, 1.5);
  tx(c, 'V (' + t('unitCm3') + ')', W - mr, H - 8, C.muted, 12, 'right'); tx(c, 'm (' + t('unitG') + ')', ml + 6, mt + 2, C.muted, 12, 'left');
  for (const k in MATS) {
    const sel = k === S.m1;
    ln(c, X(0), Y(0), X(20), Y(MATS[k] * 20), sel ? MAT_COL[k] : '#33425e', sel ? 2.5 : 1, sel ? null : [4, 4]);
    if (MATS[k] >= 2 || sel) tx(c, t(MAT_KEY[k]), X(20) - 4, Y(MATS[k] * 20) - 9, sel ? MAT_COL[k] : '#5d6d8a', 11, 'right');
  }
  S.pts.forEach(p => dt(c, X(p.v), Y(p.m), 4.5, MAT_COL[p.k]));
  const idx = S.pts.length, rm = reading(MATS[S.m1], S.v1, idx);
  c.beginPath(); c.arc(X(S.v1), Y(rm), 8, 0, 6.2832); c.strokeStyle = C.orange; c.lineWidth = 2; c.stroke();
  ln(c, X(S.v1), Y(rm), X(S.v1), H - mb, C.orange, 1, [3, 3]);
}
function roS1() {
  const rho = MATS[S.m1], idx = S.pts.length, m = reading(rho, S.v1, idx);
  $('s1-vol-o').textContent = S.v1 + ' ' + t('unitCm3');
  $('s1-now').innerHTML = t('s1now', { v: S.v1, m: fmt(m, 1), r: fmt(m / S.v1, 2) });
  const mine = S.pts.filter(p => p.k === S.m1);
  $('s1-ro').innerHTML = mine.length ? t('s1fit', { n: mine.length, k: fmt(fitSlope(mine), 2), rho: fmt(rho, 2) }) : t('s1none');
}

/* ---------- step 2: cells ---------- */
function drawS2() {
  const c = fit('s2-cv'), W = c.W, H = c.H, n = S.c2, per = dotsPerCell(MATS[S.m2]);
  const perRow = W < 520 ? 4 : 8, cell = Math.min(78, (W - 24) / perRow - 8), cols = Math.ceil(Math.sqrt(per));
  const rows = Math.ceil(n / perRow), gridH = rows * (cell + 8);
  const y0 = Math.max(10, (H - gridH) / 2);
  for (let i = 0; i < n; i++) {
    const cx = 12 + (i % perRow) * (cell + 8), cy = y0 + Math.floor(i / perRow) * (cell + 8);
    rect(c, cx, cy, cell, cell, '#101a28', C.cyan);
    const step = cell / (cols + 0.5), r = Math.max(1.2, Math.min(5, step * 0.36));
    for (let j = 0; j < per; j++) dt(c, cx + step * 0.75 + (j % cols) * step - step * 0.25 + 0, cy + step * 0.75 + Math.floor(j / cols) * step - step * 0.25, r, MAT_COL[S.m2]);
  }
  tx(c, per + ' × ' + n + ' = ' + (per * n), W - 12, H - 12, C.orange, 13, 'right');
}
function roS2() {
  const rho = MATS[S.m2], v = S.c2;
  $('s2-cells-o').textContent = v + ' ' + t('unitCm3');
  $('s2-ro').innerHTML = t('s2ro', { rho: fmt(rho, 2), rhoSi: Math.round(rho * 1000), v, m: fmt(massOf(rho, v), 2), dots: dotsPerCell(rho) * v });
}

/* ---------- step 3: float or sink ---------- */
const TANK = { top: 90, bot: 270, h: 56 };
function s3Target() {
  const rl = LIQ[S.liq], st = floatState(S.ro, rl), f = submergedFrac(S.ro, rl);
  if (!S.dropped) return TANK.top - TANK.h - 40;
  if (st === 'sink') return TANK.bot - TANK.h;
  return TANK.top - TANK.h + f * TANK.h;
}
function drawS3() {
  const c = fit('s3-cv'), W = c.W, H = c.H, x0 = W * 0.2, x1 = W * 0.8;
  const rl = LIQ[S.liq], shade = Math.min(1, 0.25 + 0.22 * rl);
  rect(c, x0, TANK.top, x1 - x0, TANK.bot - TANK.top, 'rgba(90,167,232,' + shade.toFixed(2) + ')');
  ln(c, x0, 20, x0, TANK.bot, C.muted, 3); ln(c, x1, 20, x1, TANK.bot, C.muted, 3); ln(c, x0, TANK.bot, x1, TANK.bot, C.muted, 3);
  ln(c, x0, TANK.top, x1, TANK.top, C.cyan, 1.5, [6, 4]);
  const y = Anim.get('s3y', s3Target()), ox = W / 2 - 40, g = Math.round(60 + 140 * Math.min(1, S.ro / 3));
  c.save(); c.beginPath(); c.rect(0, 0, W, H); c.clip();
  rect(c, ox, y, 80, TANK.h, 'rgb(' + g + ',' + g + ',' + (g + 10) + ')', '#0a0e14');
  c.restore();
  // re-tint the submerged part so the waterline reads on the object
  const sub = Math.max(0, Math.min(TANK.h, y + TANK.h - TANK.top));
  if (sub > 0) rect(c, ox, y + TANK.h - sub, 80, sub, 'rgba(90,167,232,0.28)');
  tx(c, fmt(S.ro, 2) + ' ' + t('unitDens'), ox + 40, y + TANK.h / 2, '#0a0e14', 13);
  tx(c, t(LIQ_KEY[S.liq]) + ' ' + fmt(rl, 2) + ' ' + t('unitDens'), x1 - 6, TANK.bot - 12, C.text, 12, 'right');
}
function roS3() {
  $('s3-obj-o').textContent = fmt(S.ro, 2) + ' ' + t('unitDens');
  if (!S.dropped) { $('s3-ro').textContent = t('s3ready'); return; }
  const rl = LIQ[S.liq], st = floatState(S.ro, rl);
  const verdict = st === 'sink' ? t('s3sink') : st === 'neutral' ? t('s3neutral') : t('s3float', { p: Math.round(100 * submergedFrac(S.ro, rl)) });
  $('s3-ro').textContent = t('s3ro', { ro: fmt(S.ro, 2), rl: fmt(rl, 2), verdict });
}

/* ---------- step 4: displacement ---------- */
function drawS4() {
  const c = fit('s4-cv'), W = c.W, H = c.H, cx = W / 2, cw = 90, top = 20, bot = H - 30, st = STONES[S.obj];
  const Y = ml => bot - (bot - top) * ml / 100;
  const lvl = Anim.get('lvl', V0);
  rect(c, cx - cw / 2, Y(lvl), cw, bot - Y(lvl), 'rgba(90,167,232,0.45)');
  ln(c, cx - cw / 2, top, cx - cw / 2, bot, C.muted, 3); ln(c, cx + cw / 2, top, cx + cw / 2, bot, C.muted, 3); ln(c, cx - cw / 2, bot, cx + cw / 2, bot, C.muted, 3);
  for (let v = 0; v <= 100; v += 10) { ln(c, cx + cw / 2 - 12, Y(v), cx + cw / 2, Y(v), C.muted, 1.2); tx(c, String(v), cx + cw / 2 + 8, Y(v), C.muted, 11, 'left'); }
  ln(c, cx - cw / 2 - 30, Y(lvl), cx + cw / 2 + 30, Y(lvl), C.orange, 1.5, [5, 3]);
  tx(c, fmt(lvl, 1) + ' mL', cx - cw / 2 - 36, Y(lvl), C.orange, 13, 'right');
  const oy = S.inWater ? bot - 16 : top + 6, size = 12 + 3 * Math.cbrt(st.v);
  dt(c, cx, oy, size, MAT_COL[nearestMat(st.m / st.v)]);
  tx(c, fmt(st.m, 1) + ' ' + t('unitG'), cx + cw / 2 + 60, top + 14, C.text, 13, 'left');
}
function roS4() {
  const st = STONES[S.obj];
  if (!S.inWater) { $('s4-ro').textContent = t('s4ro0', { m: fmt(st.m, 1), v0: V0 }); return; }
  const v1 = V0 + st.v, dv = v1 - V0, rho = st.m / dv;
  $('s4-ro').textContent = t('s4ro1', { m: fmt(st.m, 1), v0: V0, v1, dv, rho: fmt(rho, 2), name: t(MAT_KEY[nearestMat(rho)]) });
}

/* ---------- wiring ---------- */
function redraw() { drawS0(); drawS1(); drawS2(); drawS3(); drawS4(); roS0(); roS1(); roS2(); roS3(); roS4(); }
function refillSelects() {
  fillSel('s0-left', MATS, MAT_KEY, S.l); fillSel('s0-right', MATS, MAT_KEY, S.r);
  fillSel('s1-mat', MATS, MAT_KEY, S.m1); fillSel('s2-mat', MATS, MAT_KEY, S.m2);
  fillSel('s3-liq', LIQ, LIQ_KEY, S.liq); fillObjSel();
}
function boot() {
  Anim.redraw = redraw;
  window.onLang = () => { refillSelects(); redraw(); };
  bindLang(); bindSpy();
  $('s0-left').addEventListener('change', e => { S.l = e.target.value; Anim.set('beam', beamAngle(massOf(MATS[S.l], S.v0), massOf(MATS[S.r], S.v0))); redraw(); });
  $('s0-right').addEventListener('change', e => { S.r = e.target.value; Anim.set('beam', beamAngle(massOf(MATS[S.l], S.v0), massOf(MATS[S.r], S.v0))); redraw(); });
  $('s0-vol').addEventListener('input', e => { S.v0 = Number(e.target.value); Anim.set('beam', beamAngle(massOf(MATS[S.l], S.v0), massOf(MATS[S.r], S.v0))); redraw(); });
  $('s1-mat').addEventListener('change', e => { S.m1 = e.target.value; redraw(); });
  $('s1-vol').addEventListener('input', e => { S.v1 = Number(e.target.value); redraw(); });
  $('s1-rec').addEventListener('click', () => { S.pts.push({ k: S.m1, v: S.v1, m: reading(MATS[S.m1], S.v1, S.pts.length) }); redraw(); });
  $('s1-clear').addEventListener('click', () => { S.pts = []; redraw(); });
  $('s2-mat').addEventListener('change', e => { S.m2 = e.target.value; redraw(); });
  $('s2-cells').addEventListener('input', e => { S.c2 = Number(e.target.value); redraw(); });
  $('s3-liq').addEventListener('change', e => { S.liq = e.target.value; Anim.set('s3y', s3Target()); redraw(); });
  $('s3-obj').addEventListener('input', e => { S.ro = Number(e.target.value); Anim.set('s3y', s3Target()); redraw(); });
  $('s3-drop').addEventListener('click', () => { S.dropped = true; Anim.set('s3y', s3Target()); redraw(); });
  $('s3-lift').addEventListener('click', () => { S.dropped = false; Anim.set('s3y', s3Target()); redraw(); });
  $('s4-obj').addEventListener('change', e => { S.obj = Number(e.target.value); S.inWater = false; Anim.set('lvl', V0); redraw(); });
  $('s4-go').addEventListener('click', () => { S.inWater = true; Anim.set('lvl', V0 + STONES[S.obj].v); redraw(); });
  $('s4-out').addEventListener('click', () => { S.inWater = false; Anim.set('lvl', V0); redraw(); });
  Anim.set('beam', beamAngle(massOf(MATS[S.l], S.v0), massOf(MATS[S.r], S.v0)), true);
  Anim.set('s3y', s3Target(), true); Anim.set('lvl', V0, true);
  let rt = 0; window.addEventListener('resize', () => { cancelAnimationFrame(rt); rt = requestAnimationFrame(redraw); });
  applyLang(getLang());
}
if (typeof document !== 'undefined' && document.getElementById('langToggle')) boot();
if (typeof module !== 'undefined') module.exports = { MATS, LIQ, STONES, massOf, beamAngle, reading, fitSlope, dotsPerCell, floatState, submergedFrac, nearestMat };
