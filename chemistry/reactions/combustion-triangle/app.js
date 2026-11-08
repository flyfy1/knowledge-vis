'use strict';
/* ---------- pure model ---------- */
const IGN = { p: 40, paper: 233, gas: 280, wood: 300, ch4: 537 };
const MAT_KEY = { p: 'matP', paper: 'matPaper', gas: 'matGas', wood: 'matWood', ch4: 'matCH4' };
const R_O2 = 1.0, O2_START = 0.21, O2_OUT = 0.16, T_MAX1 = 100, T_BURN0 = 60, SIM_X = 6;
const LEG_OF = ['leg_water', 'leg_cover', 'leg_fuel', 'leg_co2'];
// outcome per scenario x method: ['out'] | ['still', reasonKey] | ['unsafe', reasonKey]
const OUTC = [
  [['out'], ['out'], ['out'], ['out']],
  [['unsafe', 's3whyOilWater'], ['out'], ['still', 's3whyOilFuel'], ['out']],
  [['still', 's3whyGasWater'], ['still', 's3whyGasCover'], ['out'], ['still', 's3whyGasCo2']],
  [['out'], ['still', 's3whyForestCover'], ['out'], ['still', 's3whyForestCo2']]
];
function burns(fuel, air, heat) { return !!(fuel && air && heat); }
function missingLegs(fuel, air, heat) { const m = []; if (!fuel) m.push('legFuel'); if (!air) m.push('legAir'); if (!heat) m.push('legHeat'); return m; }
function o2frac(v, tt) { return Math.max(0, O2_START - R_O2 * tt / v); }
function flameOutTime(v) { return (O2_START - O2_OUT) * v / R_O2; }
function flameSize(frac) { return Math.max(0, Math.min(1, (frac - O2_OUT) / (O2_START - O2_OUT))); }
function ignites(mat, T, air) { return !!air && T >= IGN[mat]; }
function burnTime(k, a) { return T_BURN0 / (k * a); }
function massLeft(tt, k, a) { return Math.max(0, 1 - tt / burnTime(k, a)); }
function surfaceRatio(k) { return k; }
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

const S = { fuel: true, air: true, heat: true, v1: 500, t1: 0, run1: false, mat2: 'wood', T2: 20, air2: false, sc3: 0, res3: null, k4: 1, a4: 1, t4: 0, run4: false };
let tNow = 0;
function fillSel(id, items, cur) { const el = $(id); el.innerHTML = ''; items.forEach(([k, l]) => { const o = document.createElement('option'); o.value = k; o.textContent = l; if (String(k) === String(cur)) o.selected = true; el.appendChild(o); }); }
function flame(c, x, y, h, col1, col2, ph) {
  if (h < 2) return; const w = h * 0.34, fl = Math.sin(tNow * 9 + (ph || 0)) * h * 0.05, fl2 = Math.sin(tNow * 13 + 1 + (ph || 0)) * h * 0.04;
  [[1, col1], [0.6, col2]].forEach(([s, col]) => { const hh = h * s, ww = w * s; c.beginPath(); c.moveTo(x, y); c.bezierCurveTo(x - ww, y - hh * 0.2, x - ww * 0.5, y - hh * 0.65 + fl, x + fl2, y - hh); c.bezierCurveTo(x + ww * 0.5, y - hh * 0.65 - fl, x + ww, y - hh * 0.2, x, y); c.fillStyle = col; c.fill(); });
}
function tri(c, cx, cy, size, legs, burning, big) {
  const top = [cx, cy - size * 0.75], bl = [cx - size * 0.85, cy + size * 0.55], br = [cx + size * 0.85, cy + size * 0.55];
  const side = (a, b, on, col, label) => { ln(c, a[0], a[1], b[0], b[1], on ? col : '#3a4658', on ? 6 : 3); tx(c, label, (a[0] + b[0]) / 2 + (a[0] + b[0] < 2 * cx - 1 ? -10 : a[0] + b[0] > 2 * cx + 1 ? 10 : 0), (a[1] + b[1]) / 2 + (a[1] === b[1] ? 18 : -10), on ? col : '#5d6d8a', 12, a[0] + b[0] < 2 * cx - 1 ? 'right' : a[0] + b[0] > 2 * cx + 1 ? 'left' : 'center'); };
  side(bl, br, legs.fuel, C.orange, t('legFuel')); side(top, bl, legs.air, C.cyan, t('legAir')); side(top, br, legs.heat, C.pink, t('legHeat'));
  if (burning) { flame(c, cx, cy + size * 0.35, size * (big ? 1.2 : 0.8), big ? '#ff4d2e' : '#ff8a2b', '#ffd84a'); }
}
/* ---- step 0 ---- */
function drawS0() { const c = fit('s0-cv'), W = c.W, H = c.H; tri(c, W / 2, H / 2 - 4, Math.min(120, W * 0.3), { fuel: S.fuel, air: S.air, heat: S.heat }, burns(S.fuel, S.air, S.heat)); }
function roS0() {
  const have = [S.fuel && 'legFuel', S.air && 'legAir', S.heat && 'legHeat'].filter(Boolean).map(k => t(k)).join(' / ') || t('s0none'), miss = missingLegs(S.fuel, S.air, S.heat).map(k => t(k)).join(' / ') || t('s0none');
  $('s0-ro').textContent = t('s0ro', { legs: t('s0legs', { have, miss }), verdict: burns(S.fuel, S.air, S.heat) ? t('s0burn') : t('s0out') });
}
/* ---- step 1 ---- */
function drawS1() {
  const c = fit('s1-cv'), W = c.W, H = c.H, v = S.v1, te = flameOutTime(v), fr = o2frac(v, S.t1), fs = S.run1 || S.t1 > 0 ? flameSize(fr) : 1;
  const cx = W / 2, jarW = 70 + 60 * (v / 2000), jarH = 74 + 40 * (v / 2000), base = 128;
  rect(c, cx - 50, base, 100, 8, '#5d6d8a'); rect(c, cx - 4, base - 34, 8, 34, '#e8d9b0');
  flame(c, cx, base - 34, 34 * fs, '#ff8a2b', '#ffd84a');
  if (S.run1 || S.t1 > 0) { rect(c, cx - jarW / 2, base - jarH, jarW, jarH, 'rgba(150,200,255,0.12)', C.cyan); tx(c, v + ' ' + t('unitMl'), cx, base - jarH - 10, C.cyan, 12); }
  const ml = 44, mr = 14, y0 = 168, h2 = 112, X = tt => ml + (W - ml - mr) * tt / T_MAX1, Y = f => y0 + h2 - h2 * f / 0.25;
  ln(c, ml, y0 + h2, W - mr, y0 + h2, C.muted, 1.2); ln(c, ml, y0, ml, y0 + h2, C.muted, 1.2);
  for (let f = 0; f <= 0.2; f += 0.05) { tx(c, fmt(f * 100, 0), ml - 5, Y(f), C.muted, 10, 'right'); ln(c, ml, Y(f), W - mr, Y(f), '#22304a', 1); }
  for (let tt = 0; tt <= T_MAX1; tt += 20) tx(c, String(tt), X(tt), y0 + h2 + 12, C.muted, 10);
  tx(c, t('unitS'), W - mr, y0 + h2 + 26, C.muted, 10, 'right'); tx(c, 'O₂ ' + t('unitPct'), ml + 4, y0 - 8, C.muted, 11, 'left');
  ln(c, ml, Y(O2_OUT), W - mr, Y(O2_OUT), C.pink, 1.3, [5, 4]); tx(c, '16%', W - mr, Y(O2_OUT) - 8, C.pink, 11, 'right');
  const curve = (t1, dash) => { c.beginPath(); for (let tt = 0; tt <= t1 + 1e-9; tt += 0.5) { const yy = Y(o2frac(v, tt)); tt ? c.lineTo(X(tt), yy) : c.moveTo(X(tt), yy); } c.strokeStyle = C.cyan; c.lineWidth = dash ? 1.5 : 3; c.setLineDash(dash ? [4, 4] : []); c.stroke(); c.setLineDash([]); };
  curve(Math.min(T_MAX1, v * O2_START / R_O2), true); if (S.t1 > 0) curve(S.t1, false); dt(c, X(S.t1), Y(fr), 5, C.orange);
}
function roS1() {
  const v = S.v1, te = flameOutTime(v), fr = o2frac(v, S.t1); $('s1-v-o').textContent = v + ' ' + t('unitMl');
  const st = S.t1 === 0 && !S.run1 ? t('s1idle', { te: fmt(te, 0) }) : fr <= O2_OUT + 1e-9 ? t('s1out', { te: fmt(te, 0) }) : t('s1on');
  $('s1-ro').textContent = t('s1ro', { v, t: fmt(S.t1, 0), frac: fmt(fr * 100, 1), state: st });
}
/* ---- step 2 ---- */
function drawS2() {
  const c = fit('s2-cv'), W = c.W, H = c.H, T = S.T2, keys = Object.keys(IGN), ml = 100, mr = 40, X = v => ml + (W - ml - mr) * v / 600;
  const glow = clamp((T - 20) / 580, 0, 1);
  rect(c, 14, 22, 120, 12, mix2('#2a3140', '#ff4d2e', glow)); rect(c, 56, 8, 34, 14, '#b07d4f');
  if (ignites(S.mat2, T, S.air2)) flame(c, 73, 10, 40, '#ff8a2b', '#ffd84a');
  tx(c, t(MAT_KEY[S.mat2]), 74, 46, C.text, 12);
  tx(c, fmt(T, 0) + ' ' + t('unitC'), W - 14, 18, C.orange, 14, 'right');
  const y0 = 64, bh = 26, gap = 14;
  keys.forEach((k, i) => { const y = y0 + i * (bh + gap), on = T >= IGN[k], sel = k === S.mat2; tx(c, t(MAT_KEY[k]), ml - 8, y + bh / 2, sel ? C.text : C.muted, 12, 'right'); rect(c, ml, y, X(IGN[k]) - ml, bh, on ? '#ff8a2b' : '#33425c', sel ? C.text : null); tx(c, String(IGN[k]), X(IGN[k]) + 4, y + bh / 2, C.muted, 11, 'left'); });
  ln(c, X(T), y0 - 8, X(T), y0 + 5 * (bh + gap), C.orange, 2);
}
function mix2(a, b, x) { const p = [1, 3, 5].map(i => parseInt(a.substr(i, 2), 16)), q = [1, 3, 5].map(i => parseInt(b.substr(i, 2), 16)); return 'rgb(' + p.map((v, i) => Math.round(v + (q[i] - v) * x)).join(',') + ')'; }
function roS2() {
  const T = S.T2, ig = ignites(S.mat2, T, S.air2); $('s2-T-o').textContent = T + ' ' + t('unitC');
  const st = ig ? t('s2go') : T < IGN[S.mat2] ? t('s2noT') : t('s2noAir');
  const others = Object.keys(IGN).filter(k => k !== S.mat2 && T >= IGN[k]).map(k => t(MAT_KEY[k])).join(', ') || t('s0none');
  $('s2-ro').textContent = t('s2ro', { mat: t(MAT_KEY[S.mat2]), ign: IGN[S.mat2], T, state: st }) + ' ' + t('s2others', { list: others });
}
/* ---- step 3 ---- */
function drawS3() {
  const c = fit('s3-cv'), W = c.W, H = c.H, r = S.res3, o = r === null ? null : OUTC[S.sc3][r], out = o && o[0] === 'out', unsafe = o && o[0] === 'unsafe';
  const legs = { fuel: true, air: true, heat: true }; if (out) { const l = ['heat', 'air', 'fuel', 'air'][r]; legs[l] = false; }
  tri(c, W / 2, H / 2 - 4, Math.min(110, W * 0.28), legs, !out, unsafe);
  tx(c, t('sc' + ['Wood', 'Oil', 'Gas', 'Forest'][S.sc3]), W / 2, H - 14, C.muted, 13);
  if (out) tx(c, '✓', W - 30, 30, C.green, 28); else if (o) tx(c, unsafe ? '!' : '✗', W - 30, 30, C.pink, 28);
}
function roS3() {
  const r = S.res3; if (r === null) { $('s3-ro').textContent = t('s3ro0'); return; }
  const o = OUTC[S.sc3][r], m = t('s3m' + r);
  $('s3-ro').textContent = o[0] === 'out' ? t('s3roOut', { m, leg: t(LEG_OF[r]) }) : o[0] === 'unsafe' ? t('s3roUnsafe', { m, why: t(o[1]) }) : t('s3roStill', { m, why: t(o[1]) });
}
/* ---- step 4 ---- */
function drawS4() {
  const c = fit('s4-cv'), W = c.W, H = c.H, k = S.k4, a = S.a4, rem = massLeft(S.t4, k, a), cell = Math.min(110 / k, 40), bx = W / 2 - cell * k / 2, by = 56;
  for (let i = 0; i < k; i++) for (let j = 0; j < k; j++) {
    const x = bx + i * cell, y = by + j * cell; rect(c, x + 0.5, y + 0.5, cell - 1, cell - 1, mix2('#2a2a2a', '#b9824f', rem), '#0a0e14');
    if (S.run4 && rem > 0) { c.fillStyle = 'rgba(255,120,40,' + (0.35 * (1 - rem) + 0.1).toFixed(2) + ')'; c.fillRect(x + 0.5, y + 0.5, cell - 1, cell - 1); }
  }
  if ((S.run4 || S.t4 > 0) && rem > 0) for (let i = 0; i < k; i++) flame(c, bx + (i + 0.5) * cell, by + 2, Math.min(34, cell * 0.9) * (0.4 + 0.6 * rem), '#ff8a2b', '#ffd84a', i);
  const ml = 44, mr = 14, y0 = 176, h2 = 100, X = tt => ml + (W - ml - mr) * tt / 60, Y = m => y0 + h2 - h2 * m;
  ln(c, ml, y0 + h2, W - mr, y0 + h2, C.muted, 1.2); ln(c, ml, y0, ml, y0 + h2, C.muted, 1.2);
  [0, 0.5, 1].forEach(m => tx(c, fmt(m * 100, 0), ml - 5, Y(m), C.muted, 10, 'right')); for (let tt = 0; tt <= 60; tt += 20) tx(c, String(tt), X(tt), y0 + h2 + 12, C.muted, 10);
  tx(c, t('unitS'), W - mr, y0 + h2 + 26, C.muted, 10, 'right'); tx(c, t('unitPct'), ml + 4, y0 - 8, C.muted, 11, 'left');
  const line = (kk, aa, t1, col, w, dash) => { c.beginPath(); for (let tt = 0; tt <= t1 + 1e-9; tt += 0.5) { tt ? c.lineTo(X(tt), Y(massLeft(tt, kk, aa))) : c.moveTo(X(tt), Y(massLeft(tt, kk, aa))); } c.strokeStyle = col; c.lineWidth = w; c.setLineDash(dash || []); c.stroke(); c.setLineDash([]); };
  line(1, 1, 60, '#5d6d8a', 1.5); line(k, a, 60, C.cyan, 1.5, [4, 4]); if (S.t4 > 0) line(k, a, S.t4, C.cyan, 3); dt(c, X(Math.min(60, S.t4)), Y(rem), 5, C.orange);
}
function roS4() {
  $('s4-k-o').textContent = '× ' + S.k4; $('s4-a-o').textContent = '× ' + fmt(S.a4, 2);
  $('s4-ro').textContent = t('s4ro', { k: surfaceRatio(S.k4), a: fmt(S.a4, 2), T: fmt(burnTime(S.k4, S.a4), 1), t: fmt(Math.min(S.t4, burnTime(S.k4, S.a4)), 0), rem: fmt(massLeft(S.t4, S.k4, S.a4) * 100, 0) });
}
/* ---- loop ---- */
const visSet = new Set(); let loopOn = false, last = 0;
function frame(ts) {
  tNow = ts / 1000; const dts = Math.min(0.1, (ts - last) / 1000) * SIM_X; last = ts;
  if (S.run1) { S.t1 = Math.min(S.t1 + dts, flameOutTime(S.v1)); if (S.t1 >= flameOutTime(S.v1)) S.run1 = false; }
  if (S.run4) { S.t4 = Math.min(S.t4 + dts, burnTime(S.k4, S.a4)); if (S.t4 >= burnTime(S.k4, S.a4)) S.run4 = false; }
  redraw();
  if (visSet.size && !document.hidden && !reduced()) requestAnimationFrame(frame); else loopOn = false;
}
function kick() { if (reduced()) { if (S.run1) { S.t1 = flameOutTime(S.v1); S.run1 = false; } if (S.run4) { S.t4 = burnTime(S.k4, S.a4); S.run4 = false; } tNow = 0; redraw(); return; } if (!loopOn && visSet.size) { loopOn = true; last = performance.now(); requestAnimationFrame(frame); } }
function redraw() { drawS0(); drawS1(); drawS2(); drawS3(); drawS4(); roS0(); roS1(); roS2(); roS3(); roS4(); }
function fillAll() {
  fillSel('s2-mat', Object.keys(IGN).map(k => [k, t(MAT_KEY[k])]), S.mat2); fillSel('s3-sc', [0, 1, 2, 3].map(i => [i, t('sc' + ['Wood', 'Oil', 'Gas', 'Forest'][i])]), S.sc3);
}
function boot() {
  Anim.redraw = redraw; window.onLang = () => { fillAll(); redraw(); };
  bindLang(); bindSpy();
  const on = (id, ev, fn) => $(id).addEventListener(ev, fn);
  [['s0-fuel', 'fuel'], ['s0-air', 'air'], ['s0-heat', 'heat']].forEach(([id, k]) => { $(id).checked = true; on(id, 'change', e => { S[k] = e.target.checked; redraw(); }); });
  on('s1-v', 'input', e => { S.v1 = Number(e.target.value); S.t1 = 0; S.run1 = false; redraw(); });
  on('s1-cover', 'click', () => { if (S.t1 >= flameOutTime(S.v1)) S.t1 = 0; S.run1 = true; kick(); redraw(); });
  on('s1-lift', 'click', () => { S.t1 = 0; S.run1 = false; redraw(); });
  on('s2-mat', 'change', e => { S.mat2 = e.target.value; redraw(); });
  on('s2-T', 'input', e => { S.T2 = Number(e.target.value); redraw(); });
  on('s2-air', 'change', e => { S.air2 = e.target.checked; redraw(); });
  on('s3-sc', 'change', e => { S.sc3 = Number(e.target.value); S.res3 = null; redraw(); });
  [0, 1, 2, 3].forEach(i => on('s3-m' + i, 'click', () => { S.res3 = i; redraw(); }));
  on('s3-reset', 'click', () => { S.res3 = null; redraw(); });
  on('s4-k', 'input', e => { S.k4 = Number(e.target.value); S.t4 = 0; S.run4 = false; redraw(); });
  on('s4-a', 'input', e => { S.a4 = Number(e.target.value); S.t4 = 0; S.run4 = false; redraw(); });
  on('s4-go', 'click', () => { if (S.t4 >= burnTime(S.k4, S.a4)) S.t4 = 0; S.run4 = true; kick(); redraw(); });
  on('s4-reset', 'click', () => { S.t4 = 0; S.run4 = false; redraw(); });
  if ('IntersectionObserver' in window) { const io = new IntersectionObserver(es => { es.forEach(e => { if (e.isIntersecting) visSet.add(e.target.id); else visSet.delete(e.target.id); }); kick(); }, { threshold: 0.05 }); document.querySelectorAll('.step').forEach(s => io.observe(s)); }
  document.addEventListener('visibilitychange', kick);
  let rt = 0; window.addEventListener('resize', () => { cancelAnimationFrame(rt); rt = requestAnimationFrame(redraw); });
  applyLang(getLang());
}
if (typeof document !== 'undefined' && document.getElementById('langToggle')) boot();
if (typeof module !== 'undefined') module.exports = { burns, missingLegs, o2frac, flameOutTime, flameSize, ignites, burnTime, massLeft, surfaceRatio, OUTC, IGN };
