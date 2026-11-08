'use strict';
/* ---------- pure model ---------- */
const PTS = [[0.58, 0.58], [0.80, 0.55], [0.90, 0.80], [0.72, 0.93], [0.38, 0.93], [0.22, 0.70], [0.34, 0.56], [0.38, 0.38], [0.28, 0.14], [0.52, 0.09], [0.64, 0.40]];
const SAT = [[0.98, 0.98], [0.98, 0.98], [0.98, 0.70], [0.70, 0.70], [0.70, 0.70], [0.70, 0.70], [0.70, 0.70], [0.70, 0.70], [0.70, 0.98], [0.98, 0.98], [0.98, 0.98]];
const SEGLEN = PTS.map((p, i) => { const q = PTS[(i + 1) % PTS.length]; return Math.hypot(q[0] - p[0], q[1] - p[1]); });
const TOTAL = SEGLEN.reduce((a, b) => a + b, 0);
const VESSELS = [['vAorta', 3], ['vArt', 20], ['vArtl', 40], ['vCap', 4500], ['vVenl', 250], ['vVein', 80], ['vVc', 8]];
const ORGANS = [['organBrain', 0.75, 0.75], ['organHeart', 0.25, 1.0], ['organMuscle', 1.2, 16.0], ['organGut', 1.4, 0.6], ['organKidney', 1.1, 0.5], ['organSkin', 0.3, 1.15]];
const SV_REST = 70, COMPL = 1.5;
function loopPos(ph) {
  let d = ((ph % 1) + 1) % 1 * TOTAL, i = 0; while (i < SEGLEN.length - 1 && d > SEGLEN[i]) { d -= SEGLEN[i]; i++; }
  const f = d / SEGLEN[i], p = PTS[i], q = PTS[(i + 1) % PTS.length];
  return { seg: i, f, sat: SAT[i][0] + (SAT[i][1] - SAT[i][0]) * f, x: p[0] + (q[0] - p[0]) * f, y: p[1] + (q[1] - p[1]) * f };
}
function segStart(i) { let d = 0; for (let k = 0; k < i; k++) d += SEGLEN[k]; return d / TOTAL; }
const loopPeriod = hr => 6 * 75 / hr;
function heartState(p) { return p < 1 / 8 ? 0 : p < 0.5 ? 1 : 2; }
const bump = (p, a, b) => (p >= a && p <= b ? Math.sin(Math.PI * (p - a) / (b - a)) : 0);
const cardiacOutput = (sv, hr) => sv * hr / 1000;
const mapPressure = (co, r) => co * r;
const pulsePressure = sv => sv / COMPL;
const sysP = (co, r, sv) => mapPressure(co, r) + 2 / 3 * pulsePressure(sv);
const diaP = (co, r, sv) => mapPressure(co, r) - 1 / 3 * pulsePressure(sv);
function bpWave(phi, sys, dia) {
  phi = ((phi % 1) + 1) % 1; const rise = 0.15, k = 3;
  if (phi < rise) { const x = phi / rise; return dia + (sys - dia) * (x * x * (3 - 2 * x)); }
  const e = (Math.exp(-k * (phi - rise)) - Math.exp(-k * (1 - rise))) / (1 - Math.exp(-k * (1 - rise)));
  return dia + (sys - dia) * e;
}
const velocity = (qLmin, a) => qLmin * 1000 / 60 / a;
const organFlow = (i, e) => ORGANS[i][1] + e * (ORGANS[i][2] - ORGANS[i][1]);
const exCO = e => ORGANS.reduce((a, o, i) => a + organFlow(i, e), 0);
const exHR = e => 70 + 120 * e;
const exSV = e => exCO(e) * 1000 / exHR(e);
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

const S = { hr0: 75, run0: false, ph0: 0, hr1: 75, p1: 0, run1: false, seg2: 3, q2: 5, hr3: 75, sv3: 70, r3: 18, e4: 0 };
let tNow = 0;
const redOf = sat => { const x = clamp((sat - 0.70) / 0.28, 0, 1), a = [91, 110, 232], b = [239, 59, 59]; return 'rgb(' + a.map((v, i) => Math.round(v + (b[i] - v) * x)).join(',') + ')'; };
function fillSeg() { const el = $('s2-seg'); el.innerHTML = ''; VESSELS.forEach(([k], i) => { const o = document.createElement('option'); o.value = i; o.textContent = t(k); if (i === S.seg2) o.selected = true; el.appendChild(o); }); }
/* ---- step 0 ---- */
function drawS0() {
  const c = fit('s0-cv'), W = c.W, H = c.H, P = i => [PTS[i % PTS.length][0] * W, PTS[i % PTS.length][1] * H];
  c.fillStyle = 'rgba(224,70,60,0.10)'; [[0.46, 0.55, 0.20, 0.17], [0.40, 0.11, 0.26, 0.10], [0.81, 0.86, 0.17, 0.10]].forEach(e => { c.beginPath(); c.ellipse(e[0] * W, e[1] * H, e[2] * W, e[3] * H, 0, 0, 6.2832); c.fill(); });
  tx(c, t('lblHeart'), 0.46 * W, 0.55 * H - 4, C.muted, 12); tx(c, t('lblLungs'), 0.40 * W, 0.04 * H, C.muted, 12); tx(c, t('lblBody'), 0.81 * W, 0.97 * H, C.muted, 12);
  PTS.forEach((_, i) => {
    const a = P(i), b = P(i + 1), g = c.createLinearGradient(a[0], a[1], b[0], b[1]); g.addColorStop(0, redOf(SAT[i][0])); g.addColorStop(1, redOf(SAT[i][1]));
    c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.strokeStyle = g; c.lineWidth = SAT[i][0] !== SAT[i][1] ? 12 : 6; c.stroke();
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, ang = Math.atan2(b[1] - a[1], b[0] - a[0]); c.save(); c.translate(mx, my); c.rotate(ang); c.fillStyle = '#e8edf4'; c.beginPath(); c.moveTo(6, 0); c.lineTo(-4, -5); c.lineTo(-4, 5); c.closePath(); c.fill(); c.restore();
  });
  const lp = loopPos(S.ph0); dt(c, lp.x * W, lp.y * H, 10, '#0a0e14'); dt(c, lp.x * W, lp.y * H, 8, redOf(lp.sat)); c.strokeStyle = C.text; c.lineWidth = 2; c.beginPath(); c.arc(lp.x * W, lp.y * H, 9, 0, 6.2832); c.stroke();
}
function roS0() {
  const lp = loopPos(S.ph0), mid = SAT[lp.seg][0] !== SAT[lp.seg][1];
  $('s0-hr-o').textContent = S.hr0 + ' ' + t('unitBpm'); $('s0-play').textContent = t(S.run0 ? 's0pause' : 's0play');
  $('s0-ro').textContent = t('s0ro', { seg: t('seg' + lp.seg), sat: fmt(lp.sat * 100, 0), col: t(mid ? 's0mid' : lp.sat > 0.9 ? 's0red' : 's0blue'), loops: Math.floor(S.ph0) });
}
/* ---- step 1 ---- */
function drawS1() {
  const c = fit('s1-cv'), W = c.W, H = c.H, p = S.p1, st = heartState(p), at = bump(p, 0, 1 / 8), vt = bump(p, 1 / 8, 0.5), cx = W / 2, cy = H / 2 + 6;
  const ch = (x, y, rx, ry, sc, col, key) => { c.beginPath(); c.ellipse(x, y, rx * (1 - 0.3 * sc), ry * (1 - 0.3 * sc), 0, 0, 6.2832); c.fillStyle = col; c.fill(); c.strokeStyle = '#0a0e14'; c.lineWidth = 2; c.stroke(); tx(c, t(key), x, y, '#f4f6f9', 11); };
  const rx = Math.min(64, W * 0.17), ry = 38, dx = rx + 6;
  ch(cx - dx, cy - 52, rx, ry * 0.9, at, '#5b6ee8', 'chRA'); ch(cx + dx, cy - 52, rx, ry * 0.9, at, '#ef3b3b', 'chLA');
  ch(cx - dx, cy + 34, rx, ry * 1.2, vt, '#5b6ee8', 'chRV'); ch(cx + dx, cy + 34, rx, ry * 1.2, vt, '#ef3b3b', 'chLV');
  const valve = (x, y, open, vertical) => { const col = open ? C.green : C.pink; if (vertical) ln(c, x - 14, y, x + 14, y + (open ? 0 : 0), col, open ? 2 : 6); else ln(c, x, y - 14, x, y + 14, col, open ? 2 : 6); };
  const av = st !== 1, sl = st === 1;
  valve(cx - dx, cy - 14, av, true); valve(cx + dx, cy - 14, av, true);
  ln(c, cx - dx - 20, cy + 74, cx - dx - 20, cy + 98, '#5b6ee8', 6); ln(c, cx + dx + 20, cy + 74, cx + dx + 20, cy + 98, '#ef3b3b', 6);
  valve(cx - dx + 22, cy + 74, sl, true); valve(cx + dx - 22, cy + 74, sl, true);
  tx(c, t('lblArt'), cx - dx - 20, cy + 112, C.muted, 11); tx(c, t('lblArt'), cx + dx + 20, cy + 112, C.muted, 11); tx(c, t('lblVeinIn'), cx - dx, cy - 108, C.muted, 11); tx(c, t('lblVeinIn'), cx + dx, cy - 108, C.muted, 11);
  const arrow1 = (x, y, dy) => arrow(c, x, y, x, y + dy, C.text, 3);
  if (st === 0) { arrow1(cx - dx, cy - 22, 26); arrow1(cx + dx, cy - 22, 26); }
  if (st === 1) { arrow1(cx - dx - 20, cy + 70, 26); arrow1(cx + dx + 20, cy + 70, 26); }
  if (st === 2) { arrow1(cx - dx, cy - 90, 20); arrow1(cx + dx, cy - 90, 20); }
  tx(c, fmt(p * 100, 0) + '%', W - 12, 14, C.orange, 13, 'right');
}
function roS1() {
  const T = 60 / S.hr1, co = cardiacOutput(SV_REST, S.hr1);
  $('s1-hr-o').textContent = S.hr1 + ' ' + t('unitBpm'); $('s1-ph-o').textContent = fmt(S.p1 * 100, 0) + '%'; $('s1-play').textContent = t(S.run1 ? 's1pause' : 's1play');
  $('s1-ro').textContent = t('s1ro', { ph: fmt(S.p1 * 100, 0), state: t('s1st' + heartState(S.p1)), hr: S.hr1, T: fmt(T, 2), sv: SV_REST, co: fmt(co, 1) });
}
/* ---- step 2 ---- */
function drawS2() {
  const c = fit('s2-cv'), W = c.W, H = c.H, n = VESSELS.length, bw = (W - 24) / n, top = 28, h = (H - 120) / 2;
  const panel = (y0, f, label, fmtv) => {
    tx(c, label, 12, y0 - 14, C.muted, 11, 'left');
    VESSELS.forEach(([k, a], i) => { const x = 12 + i * bw + 4, v = f(a), hh = h * clamp(v, 0.02, 1), sel = i === S.seg2; rect(c, x, y0 + h - hh, bw - 8, hh, sel ? C.orange : '#4a5d80'); tx(c, fmtv(a), x + (bw - 8) / 2, y0 + h - hh - 8, sel ? C.orange : C.muted, 10); });
    ln(c, 12, y0 + h, W - 12, y0 + h, C.muted, 1.2);
  };
  panel(top, a => Math.log10(a) / 4, t('s2areaLbl'), a => String(a));
  const y2 = top + h + 56; panel(y2, a => (Math.log10(velocity(S.q2, a)) + 2.2) / 4.3, t('s2velLbl'), a => fmt(velocity(S.q2, a), velocity(S.q2, a) < 1 ? 3 : 1));
  VESSELS.forEach(([k], i) => tx(c, t(k), 12 + i * bw + bw / 2, y2 + h + 14, i === S.seg2 ? C.orange : C.muted, 10));
}
function roS2() {
  const [k, a] = VESSELS[S.seg2], v = velocity(S.q2, a); $('s2-q-o').textContent = fmt(S.q2, 1) + ' ' + t('unitLmin');
  $('s2-ro').textContent = t('s2ro', { name: t(k), a, q: fmt(S.q2, 1), qs: fmt(S.q2 * 1000 / 60, 1), v: fmt(v, v < 1 ? 3 : 1) });
}
/* ---- step 3 ---- */
function drawS3() {
  const c = fit('s3-cv'), W = c.W, H = c.H, co = cardiacOutput(S.sv3, S.hr3), sys = sysP(co, S.r3, S.sv3), dia = diaP(co, S.r3, S.sv3), mp = mapPressure(co, S.r3);
  const ml = 44, mr = 12, mt = 14, mb = 30, X = tt => ml + (W - ml - mr) * tt / 2, Y = p => mt + (H - mt - mb) * (1 - (p - 40) / 160);
  for (let p = 40; p <= 200; p += 40) { ln(c, ml, Y(p), W - mr, Y(p), '#22304a', 1); tx(c, String(p), ml - 6, Y(p), C.muted, 11, 'right'); }
  ln(c, ml, H - mb, W - mr, H - mb, C.muted, 1.5); ln(c, ml, mt, ml, H - mb, C.muted, 1.5);
  [0, 0.5, 1, 1.5, 2].forEach(tt => tx(c, String(tt), X(tt), H - mb + 13, C.muted, 10)); tx(c, t('unitS'), W - mr, H - 6, C.muted, 11, 'right'); tx(c, t('unitMmHg'), ml + 4, mt + 4, C.muted, 11, 'left');
  ln(c, ml, Y(mp), W - mr, Y(mp), C.green, 1.2, [5, 4]); tx(c, 'MAP ' + fmt(mp, 0), W - mr, Y(mp) - 8, C.green, 11, 'right');
  c.beginPath(); for (let i = 0; i <= 300; i++) { const tt = 2 * i / 300, p = clamp(bpWave(tt * S.hr3 / 60, sys, dia), 40, 200); i ? c.lineTo(X(tt), Y(p)) : c.moveTo(X(tt), Y(p)); } c.strokeStyle = C.cyan; c.lineWidth = 2.5; c.stroke();
  const tt = reduced() ? 0 : tNow % 2; dt(c, X(tt), Y(clamp(bpWave(tt * S.hr3 / 60, sys, dia), 40, 200)), 5, C.orange);
  tx(c, fmt(sys, 0), ml + 6, Y(sys) - 8, C.pink, 11, 'left'); tx(c, fmt(dia, 0), ml + 6, Y(dia) + 10, C.pink, 11, 'left');
}
function roS3() {
  const co = cardiacOutput(S.sv3, S.hr3); $('s3-hr-o').textContent = S.hr3 + ' ' + t('unitBpm'); $('s3-sv-o').textContent = S.sv3 + ' ' + t('unitMl'); $('s3-r-o').textContent = String(S.r3);
  $('s3-ro').textContent = t('s3ro', { sv: S.sv3, hr: S.hr3, co: fmt(co, 2), r: S.r3, map: fmt(mapPressure(co, S.r3), 0), sys: fmt(sysP(co, S.r3, S.sv3), 0), dia: fmt(diaP(co, S.r3, S.sv3), 0) });
}
/* ---- step 4 ---- */
function drawS4() {
  const c = fit('s4-cv'), W = c.W, H = c.H, e = Anim.get('e4', S.e4 / 100), ml = 112, mr = 44, X = f => ml + (W - ml - mr) * f / 16, rowH = (H - 40) / ORGANS.length;
  ORGANS.forEach(([k], i) => {
    const y = 20 + i * rowH, f = organFlow(i, e), f0 = organFlow(i, 0);
    tx(c, t(k), ml - 8, y + rowH / 2, C.text, 12, 'right'); rect(c, ml, y + 6, X(f) - ml, rowH - 12, i === 2 ? C.orange : C.cyan); ln(c, X(f0), y + 2, X(f0), y + rowH - 2, '#f4f6f9', 2);
    tx(c, fmt(f, 2), X(f) + 5, y + rowH / 2, C.muted, 11, 'left');
  });
  tx(c, t('unitLmin'), W - 8, H - 8, C.muted, 11, 'right');
}
function roS4() {
  const e = S.e4 / 100; $('s4-e-o').textContent = S.e4 + '%'; const co = exCO(e), mu = organFlow(2, e);
  $('s4-ro').textContent = t('s4ro', { e: S.e4, hr: fmt(exHR(e), 0), co: fmt(co, 1), sv: fmt(exSV(e), 0), mu: fmt(mu, 1), pct: fmt(100 * mu / co, 0), mu0: fmt(organFlow(2, 0), 1) });
}
/* ---- loop ---- */
const visSet = new Set(); let loopOn = false, last = 0;
function frame(ts) {
  tNow = ts / 1000; const dt0 = Math.min(0.1, (ts - last) / 1000); last = ts;
  if (S.run0) S.ph0 += dt0 / loopPeriod(S.hr0);
  if (S.run1) { S.p1 += dt0 / (60 / S.hr1 * 4); if (S.p1 >= 1) S.p1 -= 1; }
  redraw(); if (visSet.size && !document.hidden && !reduced()) requestAnimationFrame(frame); else loopOn = false;
}
function kick() { if (reduced()) { S.run0 = false; S.run1 = false; tNow = 0; redraw(); return; } if (!loopOn && visSet.size) { loopOn = true; last = performance.now(); requestAnimationFrame(frame); } }
function redraw() { drawS0(); drawS1(); drawS2(); drawS3(); drawS4(); roS0(); roS1(); roS2(); roS3(); roS4(); }
function boot() {
  Anim.redraw = redraw; window.onLang = () => { fillSeg(); redraw(); };
  bindLang(); bindSpy();
  const on = (id, ev, fn) => $(id).addEventListener(ev, fn);
  on('s0-hr', 'input', e => { S.hr0 = Number(e.target.value); redraw(); });
  on('s0-play', 'click', () => { S.run0 = !S.run0; kick(); redraw(); });
  on('s0-next', 'click', () => { S.run0 = false; const lp = loopPos(S.ph0), base = Math.floor(S.ph0), ni = (lp.seg + 1) % PTS.length; S.ph0 = base + segStart(ni) + (ni === 0 ? 1 : 0) + 1e-6; redraw(); });
  on('s0-reset', 'click', () => { S.run0 = false; S.ph0 = 0; redraw(); });
  on('s1-hr', 'input', e => { S.hr1 = Number(e.target.value); redraw(); });
  on('s1-ph', 'input', e => { S.p1 = Number(e.target.value) / 100; S.run1 = false; redraw(); });
  on('s1-play', 'click', () => { S.run1 = !S.run1; kick(); redraw(); });
  on('s2-seg', 'change', e => { S.seg2 = Number(e.target.value); redraw(); });
  on('s2-q', 'input', e => { S.q2 = Number(e.target.value); redraw(); });
  on('s3-hr', 'input', e => { S.hr3 = Number(e.target.value); redraw(); }); on('s3-sv', 'input', e => { S.sv3 = Number(e.target.value); redraw(); }); on('s3-r', 'input', e => { S.r3 = Number(e.target.value); redraw(); });
  on('s4-e', 'input', e => { S.e4 = Number(e.target.value); Anim.set('e4', S.e4 / 100); redraw(); });
  Anim.set('e4', 0, true);
  if ('IntersectionObserver' in window) { const io = new IntersectionObserver(es => { es.forEach(e => { if (e.isIntersecting) visSet.add(e.target.id); else visSet.delete(e.target.id); }); kick(); }, { threshold: 0.05 }); document.querySelectorAll('.step').forEach(s => io.observe(s)); }
  document.addEventListener('visibilitychange', kick);
  let rt = 0; window.addEventListener('resize', () => { cancelAnimationFrame(rt); rt = requestAnimationFrame(redraw); });
  applyLang(getLang());
}
if (typeof document !== 'undefined' && document.getElementById('langToggle')) boot();
if (typeof module !== 'undefined') module.exports = { loopPos, segStart, TOTAL, SEGLEN, heartState, cardiacOutput, mapPressure, pulsePressure, sysP, diaP, bpWave, velocity, organFlow, exCO, exHR, exSV, VESSELS, loopPeriod };
