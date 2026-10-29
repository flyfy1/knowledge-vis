'use strict';
/* ---------- pure model ---------- */
const TAB = { nacl: [[0, 35.7], [20, 35.9], [40, 36.4], [60, 37.1], [80, 38.0]], kno3: [[0, 13.3], [20, 31.6], [40, 63.9], [60, 110], [80, 169]] };
const SOL_KEY = { nacl: 'solNaCl', kno3: 'solKNO3' };
const SOL_SYM = { nacl: 'NaCl', kno3: 'KNO₃' };
const SOL_COL = { nacl: '#6ee7ff', kno3: '#ffb454' };
const SPOON = 5, KC = 0.08, SIM_X = 4, TMAX = 60;
function solub(sol, T) {
  const a = TAB[sol]; T = Math.max(0, Math.min(80, T));
  for (let i = 0; i < a.length - 1; i++) if (T <= a[i + 1][0]) return a[i][1] + (a[i + 1][1] - a[i][1]) * (T - a[i][0]) / (a[i + 1][0] - a[i][0]);
  return a[a.length - 1][1];
}
function dissolved(sol, T, mSolute, water) { return Math.min(mSolute, solub(sol, T) * water / 100); }
function massFrac(d, water) { return d / (d + water); }
function satFrac(S) { return S / (100 + S); }
function crystals(sol, T, water) { const d0 = solub(sol, 80); return Math.max(0, d0 - solub(sol, T) * water / 100); }
function simStep(st, dt, S, m0) {
  const kd = KC * S, hasSolid = st.m > 1e-9, rd = hasSolid ? kd : 0, rp = hasSolid ? KC * st.c : 0;
  let net = (rd - rp) * dt; if (net > st.m) net = st.m;
  return { t: st.t + dt, c: st.c + net, m: st.m - net, rd, rp };
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

const S = { n0: 0, sol1: 'kno3', T1: 20, m2: 60, run2: false, sim: null, hist: [], sol3: 'nacl', T3: 20, m3: 30, w3: 100, sol4: 'kno3', T4: 80, water4: 100 };
function simReset() { S.sim = { t: 0, c: 0, m: S.m2, rd: 0, rp: 0 }; S.hist = []; S.run2 = false; }
simReset();
function fillSel(id, cur) { const el = $(id); el.innerHTML = ''; Object.keys(TAB).forEach(k => { const o = document.createElement('option'); o.value = k; o.textContent = t(SOL_KEY[k]); if (k === cur) o.selected = true; el.appendChild(o); }); }
const hs = i => { const x = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return x - Math.floor(x); };
function beaker(c, x, y, w, h, water, dis, und, tint) {
  rect(c, x, y + h * (1 - water), w, h * water, tint || 'rgba(90,167,232,0.3)');
  ln(c, x, y, x, y + h, C.muted, 3); ln(c, x + w, y, x + w, y + h, C.muted, 3); ln(c, x, y + h, x + w, y + h, C.muted, 3);
  const nd = Math.min(90, Math.round(dis / 0.5)); for (let i = 0; i < nd; i++) dt(c, x + 8 + hs(i) * (w - 16), y + h * (1 - water) + 8 + hs(i + 300) * (h * water - 16), 2.2, 'rgba(255,255,255,0.8)');
  const nu = Math.min(160, Math.round(und * 1.2)); for (let i = 0; i < nu; i++) dt(c, x + 6 + hs(i + 700) * (w - 12), y + h - 4 - Math.floor(i / 10) * 4.5 - ((i * 7) % 3), 2.6, '#f4f6f9');
}
function bars(c, x, y, h, dis, und, cap) {
  const sc = h / cap; rect(c, x, y + h - dis * sc, 18, dis * sc, C.cyan); rect(c, x + 26, y + h - und * sc, 18, und * sc, '#f4f6f9');
  tx(c, fmt(dis, 1), x + 9, y + h - dis * sc - 8, C.cyan, 11); tx(c, fmt(und, 1), x + 35, y + h - und * sc - 8, C.text, 11);
}
/* ---- step 0 ---- */
function drawS0() {
  const c = fit('s0-cv'), W = c.W, H = c.H, S20 = solub('nacl', 20), added = S.n0 * SPOON, d = Math.min(added, S20), u = added - d;
  const bw = Math.min(180, W * 0.45), x = W * 0.12;
  beaker(c, x, 24, bw, H - 54, 0.8, d, u);
  tx(c, 'NaCl ' + t('unitG'), x + bw / 2, H - 12, C.muted, 12);
  const gx = x + bw + 40; tx(c, t('lblDis'), gx + 9, 18, C.cyan, 11, 'left'); tx(c, t('lblUnd'), gx + 9, 34, C.text, 11, 'left');
  bars(c, gx, 60, H - 120, d, u, 60);
  ln(c, gx - 6, 60 + (H - 120) * (1 - S20 / 60), gx + 50, 60 + (H - 120) * (1 - S20 / 60), C.green, 1.5, [4, 3]); tx(c, 'S', gx + 56, 60 + (H - 120) * (1 - S20 / 60), C.green, 12, 'left');
}
function roS0() {
  const S20 = solub('nacl', 20), added = S.n0 * SPOON, d = Math.min(added, S20), u = added - d;
  const st = u > 1e-9 ? t('s0sat', { S: fmt(S20, 1) }) : t('s0unsat', { room: fmt(S20 - d, 1) });
  $('s0-ro').textContent = t('s0ro', { n: S.n0, added, dis: fmt(d, 1), und: fmt(u, 1), state: st });
}
/* ---- step 1 ---- */
function drawS1() {
  const c = fit('s1-cv'), W = c.W, H = c.H, wide = W >= 520;
  const cx0 = 44, cw = wide ? W * 0.58 - 54 : W - 60, ch = wide ? H - 60 : 150, cy0 = 14;
  const X = T => cx0 + cw * T / 80, Y = s => cy0 + ch - ch * s / 180;
  for (let T = 0; T <= 80; T += 20) { ln(c, X(T), cy0, X(T), cy0 + ch, '#22304a', 1); tx(c, String(T), X(T), cy0 + ch + 12, C.muted, 11); }
  for (let s = 0; s <= 180; s += 60) { ln(c, cx0, Y(s), cx0 + cw, Y(s), '#22304a', 1); tx(c, String(s), cx0 - 6, Y(s), C.muted, 11, 'right'); }
  ln(c, cx0, cy0 + ch, cx0 + cw, cy0 + ch, C.muted, 1.5); ln(c, cx0, cy0, cx0, cy0 + ch, C.muted, 1.5);
  tx(c, t('unitC'), cx0 + cw, cy0 + ch + 26, C.muted, 11, 'right'); tx(c, 'S', cx0 + 6, cy0 + 4, C.muted, 12, 'left');
  Object.keys(TAB).forEach(k => { c.beginPath(); for (let T = 0; T <= 80; T += 2) { T ? c.lineTo(X(T), Y(solub(k, T))) : c.moveTo(X(T), Y(solub(k, T))); } c.strokeStyle = k === S.sol1 ? SOL_COL[k] : '#3a4a66'; c.lineWidth = k === S.sol1 ? 3 : 1.5; c.stroke(); tx(c, SOL_SYM[k], X(80) - 2, Y(solub(k, 80)) - 9, k === S.sol1 ? SOL_COL[k] : '#5d6d8a', 11, 'right'); });
  const Tn = Anim.get('T1', S.T1), Sv = solub(S.sol1, Tn), d = dissolved(S.sol1, Tn, 60, 100);
  ln(c, X(Tn), Y(Sv), X(Tn), cy0 + ch, C.orange, 1, [3, 3]); dt(c, X(Tn), Y(Sv), 7, C.orange);
  const bx = wide ? W * 0.58 + 20 : W * 0.5 - 70, by = wide ? 24 : cy0 + ch + 34, bh = wide ? H - 54 : H - (cy0 + ch + 34) - 18, bw = wide ? Math.min(140, W * 0.36) : 140;
  beaker(c, bx, by, bw, bh, 0.8, d, 60 - d);
  tx(c, '60 g / 100 g', bx + bw / 2, by + bh + 12, C.muted, 11);
}
function roS1() {
  const Sv = solub(S.sol1, S.T1), d = dissolved(S.sol1, S.T1, 60, 100);
  $('s1-T-o').textContent = S.T1 + ' ' + t('unitC');
  $('s1-ro').textContent = t('s1ro', { sol: t(SOL_KEY[S.sol1]), T: S.T1, S: fmt(Sv, 1), dis: fmt(d, 1), und: fmt(60 - d, 1) });
}
/* ---- step 2 (simulation, animated; paused when off-screen) ---- */
function drawS2() {
  const c = fit('s2-cv'), W = c.W, H = c.H, ml = 44, mr = 12, h1 = (H - 80) / 2, y1 = 16, y2 = y1 + h1 + 44, S20 = solub('nacl', 20), kd = KC * S20;
  const X = tt => ml + (W - ml - mr) * tt / TMAX, Y1 = r => y1 + h1 - h1 * r / (kd * 1.15), Y2 = g => y2 + h1 - h1 * g / 80;
  ln(c, ml, y1 + h1, W - mr, y1 + h1, C.muted, 1.2); ln(c, ml, y1, ml, y1 + h1, C.muted, 1.2); ln(c, ml, y2 + h1, W - mr, y2 + h1, C.muted, 1.2); ln(c, ml, y2, ml, y2 + h1, C.muted, 1.2);
  tx(c, t('lblRate'), ml + 4, y1 - 4, C.muted, 11, 'left'); tx(c, t('lblAmt'), ml + 4, y2 - 4, C.muted, 11, 'left'); tx(c, 't (' + t('unitS') + ')', W - mr, y2 + h1 + 14, C.muted, 11, 'right');
  ln(c, ml, Y2(S20), W - mr, Y2(S20), C.green, 1, [4, 3]); tx(c, 'S', W - mr, Y2(S20) - 8, C.green, 11, 'right');
  const line = (arr, f, col) => { if (arr.length < 2) return; c.beginPath(); arr.forEach((p, i) => { i ? c.lineTo(X(p.t), f(p)) : c.moveTo(X(p.t), f(p)); }); c.strokeStyle = col; c.lineWidth = 2.5; c.stroke(); };
  line(S.hist, p => Y1(p.rd), C.orange); line(S.hist, p => Y1(p.rp), C.cyan);
  line(S.hist, p => Y2(p.c), C.cyan); line(S.hist, p => Y2(p.m), '#f4f6f9');
  const s = S.sim; dt(c, X(s.t), Y1(s.rd), 4, C.orange); dt(c, X(s.t), Y1(s.rp), 4, C.cyan);
  tx(c, t('lblRd'), W - mr, y1 + 10, C.orange, 11, 'right'); tx(c, t('lblRp'), W - mr, y1 + 26, C.cyan, 11, 'right');
  tx(c, t('lblDis'), W - mr - 90, y2 + 10, C.cyan, 11, 'right'); tx(c, t('lblUnd'), W - mr, y2 + 26, C.text, 11, 'right');
}
function roS2() {
  const s = S.sim, S20 = solub('nacl', 20); $('s2-m-o').textContent = S.m2 + ' ' + t('unitG');
  $('s2-run').textContent = t(S.run2 ? 's2pause' : 's2run');
  let state;
  if (s.m <= 1e-9) state = t('s2none'); else if (s.t > 0 && Math.abs(s.rd - s.rp) < 0.03 * s.rd) state = t('s2eq'); else state = t('s2net');
  $('s2-ro').textContent = t('s2ro', { t: fmt(s.t, 0), rd: fmt(s.rd, 2), rp: fmt(s.rp, 2), c: fmt(s.c, 1), m: fmt(s.m, 1), state: s.t === 0 ? t('s2net') : state });
}
let simOn = false, vis2 = false, last = 0;
function simFrame(ts) {
  if (!S.run2 || document.hidden || !vis2) { simOn = false; return; }
  const dts = Math.min(0.1, (ts - last) / 1000) * SIM_X; last = ts;
  const S20 = solub('nacl', 20); let rem = dts;
  while (rem > 1e-9 && S.sim.t < TMAX) { const h = Math.min(0.05, rem); S.sim = simStep(S.sim, h, S20, S.m2); rem -= h; }
  if (S.hist.length === 0 || S.sim.t - S.hist[S.hist.length - 1].t >= 0.2) S.hist.push({ t: S.sim.t, c: S.sim.c, m: S.sim.m, rd: S.sim.rd, rp: S.sim.rp });
  if (S.sim.t >= TMAX) S.run2 = false;
  drawS2(); roS2();
  if (S.run2) requestAnimationFrame(simFrame); else simOn = false;
}
function startSim() { if (S.run2 && !simOn) { simOn = true; last = performance.now(); requestAnimationFrame(simFrame); } }
/* ---- step 3 ---- */
function drawS3() {
  const c = fit('s3-cv'), W = c.W, H = c.H, S3 = solub(S.sol3, S.T3), d = dissolved(S.sol3, S.T3, S.m3, S.w3), w = massFrac(d, S.w3), ws = satFrac(S3);
  const bw = Math.min(170, W * 0.42), x = W * 0.1, wf = 0.35 + 0.5 * (S.w3 / 300), a = Math.min(0.75, 0.1 + w * 1.6);
  beaker(c, x, 24, bw, H - 54, wf, d, S.m3 - d, 'rgba(110,200,255,' + a.toFixed(2) + ')');
  const gx = x + bw + 50, gh = H - 90, gy = 36, Y = f => gy + gh - gh * f / 0.55;
  ln(c, gx, gy, gx, gy + gh, C.muted, 1.5); ln(c, gx, gy + gh, gx + 70, gy + gh, C.muted, 1.5);
  rect(c, gx + 8, Y(w), 30, gy + gh - Y(w), C.cyan); ln(c, gx - 6, Y(ws), gx + 56, Y(ws), C.green, 1.5, [4, 3]);
  tx(c, fmt(w * 100, 1) + '%', gx + 23, Y(w) - 9, C.cyan, 12); tx(c, fmt(ws * 100, 1) + '%', gx + 60, Y(ws), C.green, 11, 'left');
}
function roS3() {
  const S3 = solub(S.sol3, S.T3), cap = S3 * S.w3 / 100, d = dissolved(S.sol3, S.T3, S.m3, S.w3), und = S.m3 - d;
  $('s3-T-o').textContent = S.T3 + ' ' + t('unitC'); $('s3-m-o').textContent = S.m3 + ' ' + t('unitG'); $('s3-w-o').textContent = S.w3 + ' ' + t('unitG');
  const st = und > 0.05 ? t('s3over', { und: fmt(und, 1) }) : Math.abs(S.m3 - cap) <= 0.05 ? t('s3sat') : t('s3unsat', { room: fmt(cap - S.m3, 1) });
  $('s3-ro').textContent = t('s3ro', { dis: fmt(d, 1), und: fmt(Math.max(0, und), 1), w: fmt(100 * massFrac(d, S.w3), 1), ws: fmt(100 * satFrac(S3), 1), state: st });
}
/* ---- step 4 ---- */
function drawS4() {
  const c = fit('s4-cv'), W = c.W, H = c.H, Tn = Anim.get('T4', S.T4), cr = crystals(S.sol4, Tn, S.water4), wf = 0.25 + 0.55 * S.water4 / 100;
  const bw = Math.min(190, W * 0.5), x = W * 0.1;
  beaker(c, x, 20, bw, H - 50, wf, Math.min(solub(S.sol4, 80), solub(S.sol4, Tn) * S.water4 / 100), cr * 0.5);
  const gx = x + bw + 30, gh = H - 90, Y = g => 40 + gh - gh * g / 120;
  tx(c, t('lblCr'), gx + 20, 22, C.muted, 11); rect(c, gx + 4, Y(cr), 32, 40 + gh - Y(cr), '#f4f6f9'); tx(c, fmt(cr, 1) + ' g', gx + 20, Y(cr) - 9, C.text, 12);
  ln(c, gx, 40, gx, 40 + gh, C.muted, 1.5); ln(c, gx, 40 + gh, gx + 40, 40 + gh, C.muted, 1.5);
  tx(c, fmt(Tn, 0) + ' ' + t('unitC') + ' · ' + S.water4 + ' ' + t('unitG'), x + bw / 2, H - 10, C.orange, 12);
}
function roS4() {
  const d0 = solub(S.sol4, 80), Sv = solub(S.sol4, S.T4), cap = Sv * S.water4 / 100;
  $('s4-T-o').textContent = S.T4 + ' ' + t('unitC');
  $('s4-ro').textContent = t('s4ro', { sol: t(SOL_KEY[S.sol4]), d0: fmt(d0, 1), T: S.T4, w: S.water4, S: fmt(Sv, 1), cap: fmt(cap, 1), cr: fmt(crystals(S.sol4, S.T4, S.water4), 1) }) + ' ' + t('s4hint');
}
function redraw() { drawS0(); drawS1(); drawS2(); drawS3(); drawS4(); roS0(); roS1(); roS2(); roS3(); roS4(); }
function fillAll() { fillSel('s1-sol', S.sol1); fillSel('s3-sol', S.sol3); fillSel('s4-sol', S.sol4); }
function boot() {
  Anim.redraw = redraw; window.onLang = () => { fillAll(); redraw(); };
  bindLang(); bindSpy();
  const on = (id, ev, fn) => $(id).addEventListener(ev, fn);
  on('s0-add', 'click', () => { S.n0++; redraw(); }); on('s0-reset', 'click', () => { S.n0 = 0; redraw(); });
  on('s1-sol', 'change', e => { S.sol1 = e.target.value; redraw(); });
  on('s1-T', 'input', e => { S.T1 = Number(e.target.value); Anim.set('T1', S.T1); redraw(); });
  on('s2-m', 'input', e => { S.m2 = Number(e.target.value); simReset(); redraw(); });
  on('s2-run', 'click', () => { if (S.sim.t >= TMAX) simReset(); S.run2 = !S.run2; startSim(); redraw(); });
  on('s2-reset', 'click', () => { simReset(); redraw(); });
  on('s3-sol', 'change', e => { S.sol3 = e.target.value; redraw(); });
  ['T', 'm', 'w'].forEach(k => on('s3-' + k, 'input', e => { S[k + '3'] = Number(e.target.value); redraw(); }));
  on('s4-sol', 'change', e => { S.sol4 = e.target.value; redraw(); });
  on('s4-T', 'input', e => { S.T4 = Number(e.target.value); Anim.set('T4', S.T4); redraw(); });
  on('s4-evap', 'click', () => { S.water4 = Math.max(10, S.water4 - 10); redraw(); });
  on('s4-reset', 'click', () => { S.T4 = 80; S.water4 = 100; $('s4-T').value = 80; Anim.set('T4', 80, true); redraw(); });
  Anim.set('T1', S.T1, true); Anim.set('T4', S.T4, true);
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { vis2 = es[0].isIntersecting; if (vis2) startSim(); }, { threshold: 0.05 }).observe($('step2')); else vis2 = true;
  document.addEventListener('visibilitychange', startSim);
  let rt = 0; window.addEventListener('resize', () => { cancelAnimationFrame(rt); rt = requestAnimationFrame(redraw); });
  applyLang(getLang());
}
if (typeof document !== 'undefined' && document.getElementById('langToggle')) boot();
if (typeof module !== 'undefined') module.exports = { solub, dissolved, massFrac, satFrac, crystals, simStep, KC };
