'use strict';
/* ---------- pure model ---------- */
const ALPHA = 30, PA = 1.5, EA = { a: 4, b: 2.4, c: 3.2 };
const eOfPhi = phi => Math.cos(phi * Math.PI / 180) / Math.cos(ALPHA * Math.PI / 180);
function kindOfE(e) { return e < 1e-6 ? 'kCircle' : Math.abs(e - 1) < 1e-6 ? 'kParabola' : e > 1 ? 'kHyperbola' : 'kEllipse'; }
function conicPolylines(e, ell, n) {
  const out = []; let cur = [], lastSign = 0;
  const lo = e >= 1 ? -Math.PI + 0.02 : -Math.PI, hi = e >= 1 ? Math.PI - 0.02 : Math.PI;
  for (let i = 0; i <= n; i++) {
    const th = lo + (hi - lo) * i / n, den = 1 + e * Math.cos(th); if (Math.abs(den) < 0.03) { if (cur.length) out.push(cur); cur = []; lastSign = 0; continue; }
    const r = ell / den, sg = Math.sign(r); if (Math.abs(r) > 80) { if (cur.length) out.push(cur); cur = []; lastSign = 0; continue; }
    if (lastSign && sg !== lastSign) { out.push(cur); cur = []; } lastSign = sg; cur.push([r * Math.cos(th), r * Math.sin(th)]);
  }
  if (cur.length) out.push(cur); return out;
}
function thetaMax(e) { return e < 1 ? Math.PI * 0.98 : e === 1 ? Math.PI - 0.25 : Math.acos(-1 / e) - 0.05; }
function focusPoint(e, p) { const th = p * thetaMax(e), r = 1 / (1 + e * Math.cos(th)), x = r * Math.cos(th), y = r * Math.sin(th); const pf = Math.hypot(x, y), pd = e > 0 ? 1 / e - x : Infinity; return { x, y, pf, pd, ratio: e > 0 ? pf / pd : 0 }; }
function twoFoci(a, c, t) {
  if (c < a - 1e-9) { const b = Math.sqrt(a * a - c * c), ang = t * Math.PI, x = a * Math.cos(ang), y = b * Math.sin(ang), d1 = Math.hypot(x + c, y), d2 = Math.hypot(x - c, y); return { kind: 'ellipse', b, x, y, d1, d2, val: d1 + d2 }; }
  const b = Math.sqrt(Math.max(c * c - a * a, 0)), u = t * 2.2, x = a * Math.cosh(u), y = b * Math.sinh(u), d1 = Math.hypot(x + c, y), d2 = Math.hypot(x - c, y); return { kind: 'hyperbola', b, x, y, d1, d2, val: Math.abs(d1 - d2) };
}
function missDist(P, d, F) { const dx = d[0], dy = d[1], L = Math.hypot(dx, dy); return Math.abs((F[0] - P[0]) * dy - (F[1] - P[1]) * dx) / L; }
const reflect = (d, n) => { const L = Math.hypot(n[0], n[1]), nx = n[0] / L, ny = n[1] / L, k = d[0] * nx + d[1] * ny; return [d[0] - 2 * k * nx, d[1] - 2 * k * ny]; };
function parabolaRay(h) { const P = [h * h / (4 * PA), h], d = [-1, 0], r = reflect(d, [-4 * PA, 2 * h]); return { P, d, r, miss: missDist(P, r, [PA, 0]), start: [6, h] }; }
function ellipseRay(al) {
  const F1 = [-EA.c, 0], F2 = [EA.c, 0], d = [Math.cos(al), Math.sin(al)], ox = F1[0], A = d[0] * d[0] / (EA.a * EA.a) + d[1] * d[1] / (EA.b * EA.b), B = 2 * ox * d[0] / (EA.a * EA.a), Cc = ox * ox / (EA.a * EA.a) - 1, s = (-B + Math.sqrt(B * B - 4 * A * Cc)) / (2 * A);
  const P = [ox + s * d[0], s * d[1]], r = reflect(d, [P[0] / (EA.a * EA.a), P[1] / (EA.b * EA.b)]); return { P, d, r, miss: missDist(P, r, F2), s, sum: s + Math.hypot(P[0] - F2[0], P[1] - F2[1]) };
}
function classifyQuad(A, B, C, E) {
  const D = B * B - 4 * A * C, tol = 1e-6;
  if (D < -tol) return { D, kind: Math.abs(B) < 1e-9 && Math.abs(A - C) < 1e-9 ? 'kCircle' : 'kEllipse' };
  if (D > tol) return { D, kind: 'kHyperbola' };
  return { D, kind: (Math.abs(A) > 1e-9 || Math.abs(B) > 1e-9) && Math.abs(E) > 1e-9 ? 'kParabola' : 'kDegenerate' };
}
function implicitSegs(f, lo, hi, n) {
  const v = []; for (let j = 0; j <= n; j++) { v.push([]); for (let i = 0; i <= n; i++) v[j].push(f(lo + (hi - lo) * i / n, lo + (hi - lo) * j / n)); }
  const segs = [], z = (a, b) => a / (a - b);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const c4 = [v[j][i], v[j][i + 1], v[j + 1][i + 1], v[j + 1][i]], pts = [];
    for (let k = 0; k < 4; k++) { const a = c4[k], b = c4[(k + 1) % 4]; if ((a < 0) !== (b < 0)) { const s = z(a, b); const px = [i + s, i + 1, i + 1 - s, i][k], py = [j, j + s, j + 1, j + 1 - s][k]; pts.push([lo + (hi - lo) * px / n, lo + (hi - lo) * py / n]); } }
    if (pts.length === 2) segs.push([pts[0], pts[1]]); else if (pts.length === 4) { segs.push([pts[0], pts[1]]); segs.push([pts[2], pts[3]]); }
  }
  return segs;
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

const S = { phi: 90, e1: 0.6, p1: 0.4, a2: 4, c2: 2.5, t2: 0, trail: [], mode3: 'parabola', r3: 0.4, many3: false, A: 1, B: 0, C: 1, E: 0 };
function fillMode() { const el = $('s3-mode'); el.innerHTML = ''; [['parabola', 'mParabola'], ['ellipse', 'mEllipse']].forEach(([k, l]) => { const o = document.createElement('option'); o.value = k; o.textContent = t(l); if (k === S.mode3) o.selected = true; el.appendChild(o); }); }
function polyline(c, pts, X, Y, col, w) { c.beginPath(); pts.forEach((p, i) => { i ? c.lineTo(X(p[0]), Y(p[1])) : c.moveTo(X(p[0]), Y(p[1])); }); c.strokeStyle = col; c.lineWidth = w; c.stroke(); }
/* ---- step 0 ---- */
function drawS0() {
  const c = fit('s0-cv'), W = c.W, H = c.H, cx = W * 0.25, ay = H / 2, tn = Math.tan(ALPHA * Math.PI / 180), ph = Anim.get('phi', S.phi) * Math.PI / 180;
  c.save(); c.beginPath(); c.rect(0, 0, W / 2, H); c.clip();
  [-1, 1].forEach(sd => { ln(c, cx, ay, cx + sd * tn * (H / 2), ay + H / 2, '#6f9ccc', 2); ln(c, cx, ay, cx + sd * tn * (H / 2), ay - H / 2, '#6f9ccc', 2); });
  ln(c, cx, 0, cx, H, '#4a5d80', 1, [5, 4]);
  const Q = [cx + 28, ay + 60], d = [Math.sin(ph), Math.cos(ph)];
  ln(c, Q[0] - d[0] * 300, Q[1] - d[1] * 300, Q[0] + d[0] * 300, Q[1] + d[1] * 300, 'rgba(255,180,84,0.45)', 1.5);
  c.beginPath(); let on = false; for (let s = -300; s <= 300; s += 2) { const x = Q[0] + d[0] * s, y = Q[1] + d[1] * s, inside = Math.abs(x - cx) <= tn * Math.abs(y - ay); if (inside) { on ? c.lineTo(x, y) : c.moveTo(x, y); on = true; } else on = false; } c.strokeStyle = C.orange; c.lineWidth = 4; c.stroke();
  c.restore(); ln(c, W / 2, 0, W / 2, H, '#22304a', 1);
  const e = eOfPhi(Anim.get('phi', S.phi)), pl = conicPolylines(e, 1, 400), px0 = W * 0.75, py0 = H / 2;
  let s, xc; if (e < 1) { const a = e < 1e-6 ? 1 : 1 / (1 - e * e); s = Math.min(36, 80 / a); xc = -a * e; } else if (e === 1) { s = 26; xc = 0.6; } else { const a = 1 / (e * e - 1); s = Math.min(26, 85 / (a + 1)); xc = a * e; }
  c.save(); c.beginPath(); c.rect(W / 2 + 4, 0, W / 2 - 8, H); c.clip();
  pl.forEach(line => polyline(c, line, x => px0 + (x - xc) * s, y => py0 - y * s, C.cyan, 3));
  c.restore(); tx(c, 'e = ' + fmt(e, 2), W * 0.75, 18, C.orange, 14);
}
function roS0() { const e = eOfPhi(S.phi); $('s0-phi-o').textContent = S.phi + '°'; $('s0-ro').textContent = t('s0ro', { phi: S.phi, kind: t(kindOfE(e)), e: fmt(e, 3) }); }
/* ---- step 1 ---- */
function drawS1() {
  const c = fit('s1-cv'), W = c.W, H = c.H, e = S.e1, s = Math.min(W / 13, 32), ox = W * 0.32, oy = H / 2, X = x => ox + x * s, Y = y => oy - y * s;
  c.save(); c.beginPath(); c.rect(4, 4, W - 8, H - 8); c.clip();
  conicPolylines(e, 1, 600).forEach(line => polyline(c, line, X, Y, C.cyan, 3));
  if (e > 0.04) ln(c, X(1 / e), 0, X(1 / e), H, '#8896ab', 1.5, [6, 4]);
  const P = focusPoint(e, S.p1); dt(c, X(0), Y(0), 5, C.pink);
  ln(c, X(0), Y(0), X(P.x), Y(P.y), C.cyan, 2.5); if (e > 0.04) ln(c, X(P.x), Y(P.y), X(1 / e), Y(P.y), C.pink, 2.5); dt(c, X(P.x), Y(P.y), 6, C.orange);
  c.restore(); tx(c, 'F', X(0) - 12, Y(0) + 14, C.pink, 12);
}
function roS1() {
  const P = focusPoint(S.e1, S.p1); $('s1-e-o').textContent = fmt(S.e1, 2); $('s1-p-o').textContent = S.p1 + '%'.replace('%', '');
  $('s1-ro').textContent = t('s1ro', { e: fmt(S.e1, 2), kind: t(kindOfE(S.e1)), pf: fmt(P.pf, 3), pd: isFinite(P.pd) ? fmt(P.pd, 3) : '∞', ratio: fmt(P.ratio, 3) });
}
/* ---- step 2 ---- */
function drawS2() {
  const c = fit('s2-cv'), W = c.W, H = c.H, a = S.a2, cc = S.c2, s = Math.min((W - 20) / 16, 30), ox = W / 2, oy = H / 2, X = x => ox + x * s, Y = y => oy - y * s;
  const full = []; for (let i = -100; i <= 100; i++) { const q = twoFoci(a, cc, i / 100); full.push([q.x, q.y]); }
  c.save(); c.beginPath(); c.rect(4, 4, W - 8, H - 8); c.clip(); polyline(c, full, X, Y, 'rgba(110,231,255,0.35)', 1.5);
  if (cc < a - 1e-9) polyline(c, full.map(p => [p[0], -p[1]]), X, Y, 'rgba(110,231,255,0.35)', 1.5);
  S.trail.forEach(tt => { const q = twoFoci(a, cc, tt); dt(c, X(q.x), Y(q.y), 2.5, '#ffd97a'); });
  const q = twoFoci(a, cc, S.t2); dt(c, X(-cc), Y(0), 5, C.pink); dt(c, X(cc), Y(0), 5, C.pink); ln(c, X(-cc), Y(0), X(q.x), Y(q.y), C.cyan, 2.5); ln(c, X(cc), Y(0), X(q.x), Y(q.y), C.pink, 2.5); dt(c, X(q.x), Y(q.y), 6, C.orange);
  c.restore(); tx(c, 'F₁', X(-cc), Y(0) + 16, C.pink, 12); tx(c, 'F₂', X(cc), Y(0) + 16, C.pink, 12);
}
function roS2() {
  const q = twoFoci(S.a2, S.c2, S.t2), deg = Math.abs(S.c2 - S.a2) < 0.05; $('s2-a-o').textContent = fmt(S.a2, 1); $('s2-c-o').textContent = fmt(S.c2, 1); $('s2-t-o').textContent = String(Math.round(S.t2 * 100));
  $('s2-ro').textContent = deg ? t('s2deg') : t('s2ro', { kind: t(S.c2 < 1e-9 ? 'kCircle' : q.kind === 'ellipse' ? 'kEllipse' : 'kHyperbola'), a: fmt(S.a2, 1), c: fmt(S.c2, 1), b: fmt(q.b, 2), d1: fmt(q.d1, 3), d2: fmt(q.d2, 3), op: t(q.kind === 'ellipse' ? 's2sum' : 's2diff'), val: fmt(q.val, 3), a2: fmt(2 * S.a2, 3) });
}
/* ---- step 3 ---- */
function drawS3() {
  const c = fit('s3-cv'), W = c.W, H = c.H, s = Math.min(W / 14, 30), par = S.mode3 === 'parabola', ox = par ? W * 0.3 : W / 2, oy = H / 2, X = x => ox + x * s, Y = y => oy - y * s;
  c.save(); c.beginPath(); c.rect(4, 4, W - 8, H - 8); c.clip();
  const mir = []; if (par) { for (let y = -4.2; y <= 4.2; y += 0.1) mir.push([y * y / (4 * PA), y]); } else { for (let i = 0; i <= 200; i++) { const an = i / 200 * 2 * Math.PI; mir.push([EA.a * Math.cos(an), EA.b * Math.sin(an)]); } }
  polyline(c, mir, X, Y, '#bcdcff', 4);
  const rays = [], cur = par ? S.r3 * 3 : S.r3 * Math.PI; if (par) { if (S.many3) [-3, -2, -1, 0, 1, 2, 3].forEach(h => rays.push(parabolaRay(h))); rays.push(parabolaRay(cur)); } else { if (S.many3) [-150, -120, -90, -60, -30, 30, 60, 90, 120, 150].forEach(a => rays.push(ellipseRay(a * Math.PI / 180))); rays.push(ellipseRay(cur)); }
  rays.forEach((r, i) => { const main = i === rays.length - 1, F0 = par ? r.start : [-EA.c, 0], R = par ? [r.P[0] + r.r[0] * 9, r.P[1] + r.r[1] * 9] : [r.P[0] + r.r[0] * 9, r.P[1] + r.r[1] * 9], al = main ? 1 : 0.5;
    ln(c, X(F0[0]), Y(F0[1]), X(r.P[0]), Y(r.P[1]), 'rgba(126,226,168,' + al + ')', main ? 2.5 : 1.2); ln(c, X(r.P[0]), Y(r.P[1]), X(par ? r.P[0] + r.r[0] * 9 : r.P[0] + r.r[0] * 9), Y(par ? r.P[1] + r.r[1] * 9 : r.P[1] + r.r[1] * 9), 'rgba(255,180,84,' + al + ')', main ? 2.5 : 1.2); });
  if (par) dt(c, X(PA), Y(0), 5, C.pink); else { dt(c, X(-EA.c), Y(0), 5, C.pink); dt(c, X(EA.c), Y(0), 5, C.pink); }
  c.restore();
}
function roS3() {
  const par = S.mode3 === 'parabola', cur = par ? S.r3 * 3 : S.r3 * Math.PI, r = par ? parabolaRay(cur) : ellipseRay(cur);
  const n = reflect([1, 0], [1, 0]); const L = Math.hypot(...(par ? [-4 * PA, 2 * cur] : [r.P[0] / (EA.a * EA.a), r.P[1] / (EA.b * EA.b)])); void n; void L;
  $('s3-r-o').textContent = par ? fmt(cur, 2) : fmt(cur * 180 / Math.PI, 0) + '°';
  const nv = par ? [-4 * PA, 2 * cur] : [r.P[0] / (EA.a * EA.a), r.P[1] / (EA.b * EA.b)], nl = Math.hypot(nv[0], nv[1]), nh = [nv[0] / nl, nv[1] / nl], din = r.d, flip = (din[0] * nh[0] + din[1] * nh[1]) > 0 ? -1 : 1;
  const ti = Math.acos(Math.max(-1, Math.min(1, -(din[0] * nh[0] + din[1] * nh[1]) * flip))), tr = Math.acos(Math.max(-1, Math.min(1, (r.r[0] * nh[0] + r.r[1] * nh[1]) * flip)));
  $('s3-ro').textContent = t('s3ro', { mode: t(par ? 'mParabola' : 'mEllipse'), x: fmt(r.P[0], 2), y: fmt(r.P[1], 2), miss: fmt(r.miss, 6), dang: fmt(Math.abs(ti - tr) * 180 / Math.PI, 3) });
}
/* ---- step 4 ---- */
function drawS4() {
  const c = fit('s4-cv'), W = c.W, H = c.H, s = Math.min(W - 24, H - 20, 300), x0 = (W - s) / 2, y0 = (H - s) / 2, X = x => x0 + (x + 4) / 8 * s, Y = y => y0 + s - (y + 4) / 8 * s;
  rect(c, x0, y0, s, s, '#0f1722', C.line); ln(c, X(-4), Y(0), X(4), Y(0), '#33425c', 1); ln(c, X(0), Y(-4), X(0), Y(4), '#33425c', 1);
  const segs = implicitSegs((x, y) => S.A * x * x + S.B * x * y + S.C * y * y + S.E * y - 1, -4, 4, 100);
  c.beginPath(); segs.forEach(sg => { c.moveTo(X(sg[0][0]), Y(sg[0][1])); c.lineTo(X(sg[1][0]), Y(sg[1][1])); }); c.strokeStyle = C.cyan; c.lineWidth = 2.5; c.stroke(); S.nseg = segs.length;
}
function roS4() {
  const cl = classifyQuad(S.A, S.B, S.C, S.E); ['a', 'b', 'c', 'e'].forEach((k, i) => { $('s4-' + k + '-o').textContent = fmt([S.A, S.B, S.C, S.E][i], 1); });
  const note = S.nseg === 0 ? t('s4noReal') : Math.abs(S.B) > 1e-9 ? t('s4rot') : '';
  $('s4-ro').textContent = t('s4ro', { a: fmt(S.A, 1), b: fmt(S.B, 1), c: fmt(S.C, 1), e: fmt(S.E, 1), d: fmt(cl.D, 2), kind: t(cl.kind), note });
}
function redraw() { drawS0(); drawS1(); drawS2(); drawS3(); drawS4(); roS0(); roS1(); roS2(); roS3(); roS4(); }
function boot() {
  Anim.redraw = redraw; window.onLang = () => { fillMode(); redraw(); };
  bindLang(); bindSpy();
  const on = (id, ev, fn) => $(id).addEventListener(ev, fn);
  on('s0-phi', 'input', e => { S.phi = Number(e.target.value); Anim.set('phi', S.phi); redraw(); });
  on('s1-e', 'input', e => { S.e1 = Number(e.target.value); redraw(); }); on('s1-p', 'input', e => { S.p1 = Number(e.target.value) / 100; redraw(); });
  on('s2-a', 'input', e => { S.a2 = Number(e.target.value); S.trail = []; redraw(); }); on('s2-c', 'input', e => { S.c2 = Number(e.target.value); S.trail = []; redraw(); });
  on('s2-t', 'input', e => { S.t2 = Number(e.target.value) / 100; if (!S.trail.length || Math.abs(S.trail[S.trail.length - 1] - S.t2) > 0.004) S.trail.push(S.t2); if (S.trail.length > 400) S.trail.shift(); redraw(); });
  on('s2-clear', 'click', () => { S.trail = []; redraw(); });
  on('s3-mode', 'change', e => { S.mode3 = e.target.value; redraw(); }); on('s3-r', 'input', e => { S.r3 = Number(e.target.value) / 100; redraw(); }); on('s3-many', 'change', e => { S.many3 = e.target.checked; redraw(); });
  [['a', 'A'], ['b', 'B'], ['c', 'C'], ['e', 'E']].forEach(([k, K]) => on('s4-' + k, 'input', e => { S[K] = Number(e.target.value); redraw(); }));
  on('s4-reset', 'click', () => { S.A = 1; S.B = 0; S.C = 1; S.E = 0; [['a', 1], ['b', 0], ['c', 1], ['e', 0]].forEach(([k, v]) => { $('s4-' + k).value = v; }); redraw(); });
  Anim.set('phi', S.phi, true);
  let rt = 0; window.addEventListener('resize', () => { cancelAnimationFrame(rt); rt = requestAnimationFrame(redraw); });
  applyLang(getLang());
}
if (typeof document !== 'undefined' && document.getElementById('langToggle')) boot();
if (typeof module !== 'undefined') module.exports = { eOfPhi, kindOfE, conicPolylines, focusPoint, twoFoci, parabolaRay, ellipseRay, classifyQuad, implicitSegs, PA, EA };
