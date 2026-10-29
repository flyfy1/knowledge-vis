'use strict';
/* ---------- pure model ---------- */
const G = 9.8, RHO_W = 1000, STEEL_KG = 800;
const OBJS = { al: { rho: 2700, v: 200, k: 'objAl' }, fe: { rho: 7900, v: 100, k: 'objFe' } };
const BLOCKS = { small: { v: 100, k: 'objSmall' }, mid: { v: 200, k: 'objMid' }, big: { v: 400, k: 'objBig' } };
const LIQS = { water: 1000, salt: 1030, oil: 920 };
const LIQ_KEY = { water: 'liqWater', salt: 'liqSalt', oil: 'liqOil' };
const side = v => Math.cbrt(v);
function weightN(rho, vCm3) { return rho * vCm3 * 1e-6 * G; }
function subVol(vCm3, z) { return vCm3 * Math.max(0, Math.min(1, z / side(vCm3))); }
function buoyN(rhoL, vSubCm3) { return rhoL * vSubCm3 * 1e-6 * G; }
function scaleDrop(fb, z) { return fb * (1 + 0.01 * Math.sin(7.7 * z + 1)); }
function floatFrac(rhoO, rhoL) { return Math.min(1, rhoO / rhoL); }
function shipState(vM3, cargo) {
  const m = STEEL_KG + cargo, cap = RHO_W * vM3, f = m / cap;
  return { m, cap, rho: m / vM3, f, floats: m <= cap, left: cap - m };
}
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

const S = { o0: 'al', z0: 0, o1: 'al', z1: 0, o2: 'mid', l2: 'water', z2: 2, l3: 'water', r3: 600, dropped: false, v4: 1, c4: 0 };
const V3 = 200, H3 = 60;
function fillSel(id, keys, kmap, cur) {
  const el = $(id); el.innerHTML = '';
  keys.forEach(k => { const o = document.createElement('option'); o.value = k; o.textContent = t(kmap[k]); if (k === cur) o.selected = true; el.appendChild(o); });
}
function tint(c, x, y, w, h, ys) { const top = Math.max(y, ys), b = y + h; if (b > top) rect(c, x, top, w, b - top, 'rgba(90,167,232,0.3)'); }

/* ---- step 0 ---- */
function drawS0() {
  const c = fit('s0-cv'), W = c.W, o = OBJS[S.o0], s = side(o.v), z = Anim.get('z0', S.z0);
  const ys = 215, floor = 300, px = 12, bx = W / 2 - 40, bs = s * px, by = ys + z * px - bs;
  const wN = weightN(o.rho, o.v), fb = buoyN(RHO_W, subVol(o.v, z)), rd = wN - fb;
  rect(c, W / 2 - 110, ys, 220, floor - ys, 'rgba(90,167,232,0.3)');
  ln(c, W / 2 - 110, ys - 30, W / 2 - 110, floor, C.muted, 3); ln(c, W / 2 + 110, ys - 30, W / 2 + 110, floor, C.muted, 3); ln(c, W / 2 - 110, floor, W / 2 + 110, floor, C.muted, 3);
  ln(c, W / 2 - 110, ys, W / 2 + 110, ys, C.cyan, 1.5, [6, 4]);
  rect(c, bx, by, bs, bs, o.rho > 5000 ? '#7c8794' : '#c3ccd6', '#0a0e14'); tint(c, bx, by, bs, bs, ys);
  const len = 26 + 8 * rd, top = by - 12 - len;
  rect(c, W / 2 - 22, top - 34, 44, 34, '#243247', C.muted); tx(c, fmt(rd, 2) + ' N', W / 2, top - 17, C.orange, 12);
  ln(c, W / 2, top, W / 2, by - 12, C.muted, 1.5);
  c.beginPath(); const n = 10; for (let i = 0; i <= n; i++) { const yy = top + (len * i) / n, xx = W / 2 + (i % 2 ? 7 : -7); i ? c.lineTo(xx, yy) : c.moveTo(W / 2, yy); } c.strokeStyle = C.cyan; c.lineWidth = 2; c.stroke();
  ln(c, W / 2, by - 12, W / 2, by, C.muted, 1.5);
  if (fb > 0) arrow(c, bx + bs + 22, by + bs, bx + bs + 22, by + bs - 4 - 6 * fb, C.cyan, 3);
  tx(c, t('lblFb') + ' ' + fmt(fb, 2) + ' N', bx + bs + 30, by + bs - 14 - 6 * fb, C.cyan, 12, 'left');
}
function roS0() {
  const o = OBJS[S.o0], vs = subVol(o.v, S.z0), fb = buoyN(RHO_W, vs), w = weightN(o.rho, o.v);
  $('s0-z-o').textContent = fmt(S.z0, 1) + ' ' + t('unitCm');
  $('s0-ro').textContent = t('s0ro', { w: fmt(w, 2), vs: fmt(vs, 0), v: o.v, fb: fmt(fb, 2), r: fmt(w - fb, 2) });
}
/* ---- step 1 ---- */
function drawS1() {
  const c = fit('s1-cv'), W = c.W, o = OBJS[S.o1], s = side(o.v), z = Anim.get('z1', S.z1), px = 10;
  const ys = 120, floor = 280, cx = Math.min(W * 0.24, 100), cw = 120, bs = s * px, by = ys + z * px - bs;
  const vs = subVol(o.v, z), fb = buoyN(RHO_W, vs), ww = fb, d = scaleDrop(fb, z);
  rect(c, cx - cw / 2, ys, cw, floor - ys, 'rgba(90,167,232,0.3)');
  ln(c, cx - cw / 2, ys - 20, cx - cw / 2, floor, C.muted, 3); ln(c, cx + cw / 2, ys, cx + cw / 2, floor, C.muted, 3); ln(c, cx - cw / 2, floor, cx + cw / 2, floor, C.muted, 3);
  ln(c, cx + cw / 2, ys, cx + cw / 2 + 34, ys + 10, C.muted, 3);
  rect(c, cx - bs / 2, by, bs, bs, o.rho > 5000 ? '#7c8794' : '#c3ccd6', '#0a0e14'); tint(c, cx - bs / 2, by, bs, bs, ys);
  ln(c, cx, by - 30, cx, by, C.muted, 1.5);
  const bk = cx + cw / 2 + 28, bw = 64, bh = 80, bb = floor, fill = (vs / 400) * bh * 1.6;
  ln(c, bk, bb - bh, bk, bb, C.muted, 3); ln(c, bk + bw, bb - bh, bk + bw, bb, C.muted, 3); ln(c, bk, bb, bk + bw, bb, C.muted, 3);
  rect(c, bk + 1.5, bb - Math.min(bh, fill), bw - 3, Math.min(bh, fill), 'rgba(90,167,232,0.5)');
  const bx0 = Math.max(bk + bw + 20, W * 0.6), sc = 28, base = floor;
  rect(c, bx0, base - d * sc, 36, d * sc, C.orange); rect(c, bx0 + 76, base - ww * sc, 36, ww * sc, C.cyan);
  tx(c, fmt(d, 2) + ' N', bx0 + 18, base - d * sc - 10, C.orange, 12); tx(c, fmt(ww, 2) + ' N', bx0 + 94, base - ww * sc - 10, C.cyan, 12);
  tx(c, t('lblDrop'), bx0 + 18, base + 14, C.orange, 11); tx(c, t('lblBucket'), bx0 + 94, base + 14, C.cyan, 11);
}
function roS1() {
  const o = OBJS[S.o1], vs = subVol(o.v, S.z1), fb = buoyN(RHO_W, vs), d = scaleDrop(fb, S.z1);
  $('s1-z-o').textContent = fmt(S.z1, 1) + ' ' + t('unitCm');
  $('s1-ro').textContent = t('s1ro', { d: fmt(d, 2), vs: fmt(vs, 0), ww: fmt(fb, 2), diff: fmt(Math.abs(d - fb), 3) });
}
/* ---- step 2 ---- */
function drawS2() {
  const c = fit('s2-cv'), W = c.W, H = c.H, ml = 46, mb = 34, mt = 14, mr = 14, rho = LIQS[S.l2];
  const X = z => ml + (W - ml - mr) * z / 20, Y = f => H - mb - (H - mb - mt) * f / 4.5;
  for (let z = 0; z <= 20; z += 5) { ln(c, X(z), mt, X(z), H - mb, '#22304a', 1); tx(c, String(z), X(z), H - mb + 14, C.muted, 11); }
  for (let f = 0; f <= 4; f++) { ln(c, ml, Y(f), W - mr, Y(f), '#22304a', 1); tx(c, String(f), ml - 6, Y(f), C.muted, 11, 'right'); }
  ln(c, ml, H - mb, W - mr, H - mb, C.muted, 1.5); ln(c, ml, mt, ml, H - mb, C.muted, 1.5);
  tx(c, 'z (' + t('unitCm') + ')', W - mr, H - 8, C.muted, 12, 'right'); tx(c, 'F (N)', ml + 6, mt + 2, C.muted, 12, 'left');
  for (const k in BLOCKS) {
    const v = BLOCKS[k].v, sel = k === S.o2; c.beginPath();
    for (let z = 0; z <= 20.01; z += 0.25) { const f = buoyN(rho, subVol(v, z)); z ? c.lineTo(X(z), Y(f)) : c.moveTo(X(z), Y(f)); }
    c.strokeStyle = sel ? C.cyan : '#3a4a66'; c.lineWidth = sel ? 3 : 1.5; c.stroke();
  }
  const v = BLOCKS[S.o2].v, z = Anim.get('z2', S.z2), f = buoyN(rho, subVol(v, z));
  ln(c, X(side(v)), Y(0), X(side(v)), Y(buoyN(rho, v)), C.green, 1, [3, 3]);
  ln(c, X(z), Y(f), X(z), H - mb, C.orange, 1, [3, 3]); dt(c, X(z), Y(f), 8, C.orange);
}
function roS2() {
  const v = BLOCKS[S.o2].v, vs = subVol(v, S.z2), full = S.z2 >= side(v) - 1e-9;
  $('s2-z-o').textContent = fmt(S.z2, 1) + ' ' + t('unitCm');
  $('s2-ro').textContent = t('s2ro', { s: fmt(side(v), 2), liq: t(LIQ_KEY[S.l2]), z: fmt(S.z2, 1), vs: fmt(vs, 0), fb: fmt(buoyN(LIQS[S.l2], vs), 2), state: t(full ? 's2full' : 's2part') });
}
/* ---- step 3 ---- */
const T3 = { ys: 110, floor: 290 };
function s3Target() {
  const rl = LIQS[S.l3];
  if (!S.dropped) return T3.ys - H3 - 40;
  return S.r3 > rl + 1e-9 ? T3.floor - H3 : T3.ys - H3 + floatFrac(S.r3, rl) * H3;
}
function drawS3() {
  const c = fit('s3-cv'), W = c.W, rl = LIQS[S.l3], y = Anim.get('y3', s3Target()), x0 = W * 0.12, x1 = W * 0.62, ox = (x0 + x1) / 2 - 30;
  rect(c, x0, T3.ys, x1 - x0, T3.floor - T3.ys, 'rgba(90,167,232,' + (0.2 + 0.25 * rl / 1030).toFixed(2) + ')');
  ln(c, x0, 24, x0, T3.floor, C.muted, 3); ln(c, x1, 24, x1, T3.floor, C.muted, 3); ln(c, x0, T3.floor, x1, T3.floor, C.muted, 3); ln(c, x0, T3.ys, x1, T3.ys, C.cyan, 1.5, [6, 4]);
  rect(c, ox, y, 60, H3, '#7c8794', '#0a0e14'); tint(c, ox, y, 60, H3, T3.ys);
  const phi = clamp((y + H3 - T3.ys) / H3, 0, 1), w = weightN(S.r3, V3), fb = buoyN(rl, V3 * phi), k = 24;
  const settled = Math.abs(y - s3Target()) < 0.6, fbShow = S.dropped && settled && S.r3 <= rl ? w : fb;
  const ax = x1 + 36;
  arrow(c, ax, y + H3 / 2, ax, y + H3 / 2 + k * w, C.pink, 3); tx(c, 'W ' + fmt(w, 2) + ' N', ax + 10, y + H3 / 2 + k * w / 2, C.pink, 12, 'left');
  if (fbShow > 0.005) { arrow(c, ax + 62, y + H3 / 2, ax + 62, y + H3 / 2 - k * fbShow, C.cyan, 3); tx(c, t('lblFb') + ' ' + fmt(fbShow, 2) + ' N', ax + 62 - 4, y + H3 / 2 - k * fbShow - 12, C.cyan, 12, 'center'); }
}
function roS3() {
  $('s3-rho-o').textContent = S.r3 + ' ' + t('unitDens');
  if (!S.dropped) { $('s3-ro').textContent = t('s3ready'); return; }
  const rl = LIQS[S.l3], w = weightN(S.r3, V3), fm = buoyN(rl, V3);
  let res;
  if (Math.abs(S.r3 - rl) < 25) res = t('s3resNeutral');
  else if (S.r3 < rl) res = t('s3resFloat', { w: fmt(w, 2), p: Math.round(100 * floatFrac(S.r3, rl)) });
  else res = t('s3resSink', { fm: fmt(fm, 2), n: fmt(w - fm, 2) });
  $('s3-ro').textContent = t('s3ro', { w: fmt(w, 2), fm: fmt(fm, 2), res });
}
/* ---- step 4 ---- */
function drawS4() {
  const c = fit('s4-cv'), W = c.W, ys = 150, floor = 300, st = shipState(S.v4, S.c4), hw = 60 + 80 * S.v4, hh = 70;
  rect(c, 0, ys, W, floor - ys, 'rgba(90,167,232,0.28)'); ln(c, 0, ys, W, ys, C.cyan, 1.5, [6, 4]); ln(c, 0, floor, W, floor, C.muted, 3);
  const bottom = Anim.get('boat', st.floats ? ys + Math.min(1, st.f) * hh - 0 : floor), cx = Math.min(W * 0.4, 170);
  const top = bottom - hh;
  rect(c, cx - hw / 2, top, hw, hh, '#6c7a8d', '#0a0e14'); tint(c, cx - hw / 2, top, hw, hh, ys);
  if (S.c4 > 0) rect(c, cx - hw / 2 + 6, top - 4 - Math.min(30, S.c4 / 60), hw - 12, Math.min(30, S.c4 / 60), C.orange);
  tx(c, fmt(st.m, 0) + ' ' + t('unitKg'), cx, top + 22, '#0a0e14', 13);
  const bx = W - 70;   const scale = 90 / 3000; rect(c, bx - 40, 30, 36, st.m * scale, C.orange); rect(c, bx + 6, 30, 36, st.cap * scale, C.cyan);
  tx(c, fmt(st.m, 0), bx - 22, 30 + st.m * scale + 12, C.orange, 11); tx(c, fmt(st.cap, 0), bx + 24, 30 + st.cap * scale + 12, C.cyan, 11);
  tx(c, t('lblTotal'), bx - 22, 30 + st.m * scale + 26, C.orange, 10); tx(c, t('lblCap'), bx + 24, 30 + st.cap * scale + 26, C.cyan, 10);
}
function roS4() {
  const st = shipState(S.v4, S.c4);
  $('s4-v-o').textContent = fmt(S.v4, 1) + ' ' + t('unitM3'); $('s4-c-o').textContent = S.c4 + ' ' + t('unitKg');
  const res = st.floats ? t('s4resFloat', { p: Math.round(100 * st.f), left: fmt(st.left, 0) }) : t('s4resSink');
  $('s4-ro').textContent = t('s4ro', { m: fmt(st.m, 0), rho: fmt(st.rho, 0), cap: fmt(st.cap, 0), res });
}
function s4Target() { const st = shipState(S.v4, S.c4); return st.floats ? 150 + Math.min(1, st.f) * 70 : 300; }

function redraw() { drawS0(); drawS1(); drawS2(); drawS3(); drawS4(); roS0(); roS1(); roS2(); roS3(); roS4(); }
function fillAll() {
  fillSel('s0-obj', Object.keys(OBJS), { al: 'objAl', fe: 'objFe' }, S.o0); fillSel('s1-obj', Object.keys(OBJS), { al: 'objAl', fe: 'objFe' }, S.o1);
  fillSel('s2-obj', Object.keys(BLOCKS), { small: 'objSmall', mid: 'objMid', big: 'objBig' }, S.o2); fillSel('s2-liq', Object.keys(LIQS), LIQ_KEY, S.l2); fillSel('s3-liq', Object.keys(LIQS), LIQ_KEY, S.l3);
}
function boot() {
  Anim.redraw = redraw; window.onLang = () => { fillAll(); redraw(); };
  bindLang(); bindSpy();
  const on = (id, ev, fn) => $(id).addEventListener(ev, fn);
  on('s0-obj', 'change', e => { S.o0 = e.target.value; redraw(); });
  on('s0-z', 'input', e => { S.z0 = Number(e.target.value); Anim.set('z0', S.z0); redraw(); });
  on('s0-reset', 'click', () => { S.z0 = 0; $('s0-z').value = 0; Anim.set('z0', 0); redraw(); });
  on('s1-obj', 'change', e => { S.o1 = e.target.value; redraw(); });
  on('s1-z', 'input', e => { S.z1 = Number(e.target.value); Anim.set('z1', S.z1); redraw(); });
  on('s1-reset', 'click', () => { S.z1 = 0; $('s1-z').value = 0; Anim.set('z1', 0); redraw(); });
  on('s2-obj', 'change', e => { S.o2 = e.target.value; redraw(); });
  on('s2-liq', 'change', e => { S.l2 = e.target.value; redraw(); });
  on('s2-z', 'input', e => { S.z2 = Number(e.target.value); Anim.set('z2', S.z2); redraw(); });
  on('s3-liq', 'change', e => { S.l3 = e.target.value; Anim.set('y3', s3Target()); redraw(); });
  on('s3-rho', 'input', e => { S.r3 = Number(e.target.value); Anim.set('y3', s3Target()); redraw(); });
  on('s3-drop', 'click', () => { S.dropped = true; Anim.set('y3', s3Target()); redraw(); });
  on('s3-lift', 'click', () => { S.dropped = false; Anim.set('y3', s3Target()); redraw(); });
  on('s4-v', 'input', e => { S.v4 = Number(e.target.value); Anim.set('boat', s4Target()); redraw(); });
  on('s4-c', 'input', e => { S.c4 = Number(e.target.value); Anim.set('boat', s4Target()); redraw(); });
  on('s4-reset', 'click', () => { S.v4 = 1; S.c4 = 0; $('s4-v').value = 1; $('s4-c').value = 0; Anim.set('boat', s4Target()); redraw(); });
  Anim.set('z0', 0, true); Anim.set('z1', 0, true); Anim.set('z2', S.z2, true); Anim.set('y3', s3Target(), true); Anim.set('boat', s4Target(), true);
  let rt = 0; window.addEventListener('resize', () => { cancelAnimationFrame(rt); rt = requestAnimationFrame(redraw); });
  applyLang(getLang());
}
if (typeof document !== 'undefined' && document.getElementById('langToggle')) boot();
if (typeof module !== 'undefined') module.exports = { weightN, subVol, buoyN, scaleDrop, floatFrac, shipState, side };
