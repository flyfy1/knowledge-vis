'use strict';
/* ---------- pure model ---------- */
const MAP_M = 1000, HMAX = 130, GN = 72;
const g2 = (x, y, cx, cy, s) => Math.exp(-((x - cx) * (x - cx) + (y - cy) * (y - cy)) / (2 * s * s));
const TERS = {
  hill: (x, y) => 100 * g2(x, y, 0.45, 0.5, 0.2) + 22 * g2(x, y, 0.78, 0.72, 0.05),
  ridge: (x, y) => { const ax = 0.1, ay = 0.85, bx = 0.9, by = 0.25, dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy, tt = ((x - ax) * dx + (y - ay) * dy) / L2, px = ax + tt * dx, py = ay + tt * dy, d2 = (x - px) * (x - px) + (y - py) * (y - py); return 90 * Math.exp(-d2 / (2 * 0.1 * 0.1)) * (0.55 + 0.45 * Math.exp(-(tt - 0.5) * (tt - 0.5) / (2 * 0.25 * 0.25))); },
  saddle: (x, y) => 90 * g2(x, y, 0.3, 0.3, 0.15) + 70 * g2(x, y, 0.7, 0.7, 0.15),
  basin: (x, y) => 110 * (1 - g2(x, y, 0.5, 0.5, 0.2)) * g2(x, y, 0.5, 0.5, 0.5)
};
const TER_KEY = { hill: 'terHill', ridge: 'terRidge', saddle: 'terSaddle', basin: 'terBasin' };
const hOf = (n, x, y) => TERS[n](x, y);
function grad(n, x, y) { const e = 1e-3; return [(hOf(n, x + e, y) - hOf(n, x - e, y)) / (2 * e), (hOf(n, x, y + e) - hOf(n, x, y - e)) / (2 * e)]; }
const MEMO = {};
function contour(n, level) {
  const key = n + '|' + level.toFixed(2); if (MEMO[key]) return MEMO[key];
  const f = []; for (let j = 0; j <= GN; j++) { f.push([]); for (let i = 0; i <= GN; i++) f[j].push(hOf(n, i / GN, j / GN) - level); }
  const segs = [], lerp = (a, b) => a / (a - b);
  for (let j = 0; j < GN; j++) for (let i = 0; i < GN; i++) {
    const v = [f[j][i], f[j][i + 1], f[j + 1][i + 1], f[j + 1][i]], pts = [];
    for (let k = 0; k < 4; k++) { const a = v[k], b = v[(k + 1) % 4]; if ((a < 0) !== (b < 0)) { const s = lerp(a, b); const px = [i + s, i + 1, i + 1 - s, i][k], py = [j, j + s, j + 1, j + 1 - s][k]; pts.push([px / GN, py / GN]); } }
    if (pts.length === 2) segs.push([pts[0][0], pts[0][1], pts[1][0], pts[1][1]]); else if (pts.length === 4) { segs.push([pts[0][0], pts[0][1], pts[1][0], pts[1][1]]); segs.push([pts[2][0], pts[2][1], pts[3][0], pts[3][1]]); }
  }
  return (MEMO[key] = segs);
}
function maxH(n) { let m = 0; for (let j = 0; j <= 40; j++) for (let i = 0; i <= 40; i++) m = Math.max(m, hOf(n, i / 40, j / 40)); return m; }
function levels(n, iv) { const out = [], m = maxH(n); for (let l = iv; l < m; l += iv) if (contour(n, l).length) out.push(l); return out; }
function slopeInfo(n, x, y, iv) { const g = grad(n, x, y), m = Math.hypot(g[0], g[1]) / MAP_M, ang = Math.atan(m) * 180 / Math.PI; return { gx: g[0], gy: g[1], slope: m, ang, gap: m > 1e-5 ? iv / m : Infinity }; }
function slopeKind(ang) { return ang < 5 ? 'gentle' : ang < 12 ? 'mid' : 'steep'; }
function peakNear(n, cx, cy, r) { let b = -1, bx = cx, by = cy; for (let j = -20; j <= 20; j++) for (let i = -20; i <= 20; i++) { const x = cx + r * i / 20, y = cy + r * j / 20, v = hOf(n, x, y); if (v > b) { b = v; bx = x; by = y; } } return { v: b, x: bx, y: by }; }
function minAlong(n, a, b) { let m = 1e9; for (let k = 0; k <= 200; k++) m = Math.min(m, hOf(n, a.x + (b.x - a.x) * k / 200, a.y + (b.y - a.y) * k / 200)); return m; }
function featureRelief(n) {
  if (n === 'hill') { const k = peakNear(n, 0.78, 0.72, 0.06), m = peakNear(n, 0.45, 0.5, 0.06); return { lo: minAlong(n, k, m), hi: k.v }; }
  if (n === 'saddle') { const a = peakNear(n, 0.3, 0.3, 0.06), b = peakNear(n, 0.7, 0.7, 0.06); return { lo: minAlong(n, a, b), hi: Math.min(a.v, b.v) }; }
  return null;
}
function featureVisible(n, iv) { const f = featureRelief(n); if (!f) return true; for (let l = iv; l <= f.hi + 1e-9; l += iv) if (l > f.lo) return true; return false; }
function flowPath(n, x0, y0) {
  const pts = [[x0, y0]]; let x = x0, y = y0, end = 'edge';
  for (let k = 0; k < 2500; k++) { const g = grad(n, x, y), m = Math.hypot(g[0], g[1]); if (m < 0.6) { end = 'pit'; break; } const nx = x - 0.004 * g[0] / m, ny = y - 0.004 * g[1] / m; if (nx < 0 || nx > 1 || ny < 0 || ny > 1) { end = 'edge'; break; } if (hOf(n, nx, ny) >= hOf(n, x, y) - 1e-9) { end = 'pit'; break; } x = nx; y = ny; pts.push([x, y]); }
  let len = 0; for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]) * MAP_M;
  return { pts, end, len, z0: hOf(n, x0, y0), z1: hOf(n, pts[pts.length - 1][0], pts[pts.length - 1][1]) };
}
function route(n, thDeg, L) {
  const ax = 0.1, ay = 0.5, c = Math.cos(thDeg * Math.PI / 180), s = Math.sin(thDeg * Math.PI / 180); let len = L;
  for (let k = 0; k <= 100; k++) { const tt = L * k / 100, x = ax + tt * c, y = ay + tt * s; if (x > 0.98 || x < 0.02 || y > 0.98 || y < 0.02) { len = L * (k - 1) / 100; break; } }
  const N = 160, pts = []; for (let k = 0; k <= N; k++) { const tt = len * k / N; pts.push({ x: ax + tt * c, y: ay + tt * s, z: hOf(n, ax + tt * c, ay + tt * s), d: tt * MAP_M }); }
  return { pts, len: len * MAP_M };
}
function routeStats(n, th, L, p, iv) {
  const r = route(n, th, L), k = Math.round(p / 100 * (r.pts.length - 1)); let up = 0, down = 0, mx = 0, cross = 0;
  for (let i = 1; i < r.pts.length; i++) { const dz = r.pts[i].z - r.pts[i - 1].z; if (i <= k) { if (dz > 0) up += dz; else down -= dz; } mx = Math.max(mx, r.pts[i].z); const a = Math.floor(r.pts[i - 1].z / iv + 1e-9), b = Math.floor(r.pts[i].z / iv + 1e-9); cross += Math.abs(b - a); }
  return { len: r.len, z: r.pts[k].z, up, down, max: Math.max(mx, r.pts[0].z), cross, k, pts: r.pts };
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

const S = { h0: 0, x1: 0.45, y1: 0.62, ter2: 'hill', iv2: 10, ter3: 'saddle', x3: 0.32, y3: 0.42, went3: false, th4: 0, len4: 0.7, p4: 0 };
const IV0 = 10;
function fillTer(id, cur) { const el = $(id); el.innerHTML = ''; Object.keys(TERS).forEach(k => { const o = document.createElement('option'); o.value = k; o.textContent = t(TER_KEY[k]); if (k === cur) o.selected = true; el.appendChild(o); }); }
function mapBox(W, y0, size) { const s = Math.min(W - 24, size); return { x: (W - s) / 2, y: y0, s }; }
function drawContours(c, n, box, iv, opt) {
  rect(c, box.x, box.y, box.s, box.s, '#0f1722', C.line);
  const P = (x, y) => [box.x + x * box.s, box.y + y * box.s], lv = levels(n, iv), upto = opt && opt.upto !== undefined ? opt.upto : 1e9;
  lv.forEach((l, i) => { if (l > upto + 1e-9) return; const idx = Math.round(l / iv) % 5 === 0; c.strokeStyle = idx ? '#bcdcff' : '#6f9ccc'; c.lineWidth = idx ? 2 : 1.2; c.beginPath(); contour(n, l).forEach(s => { const a = P(s[0], s[1]), b = P(s[2], s[3]); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); }); c.stroke(); });
  if (opt && opt.labels) lv.forEach(l => { if (Math.round(l / iv) % 5 !== 0) return; const sg = contour(n, l); if (!sg.length) return; const s = sg[Math.floor(sg.length / 2)], p = P((s[0] + s[2]) / 2, (s[1] + s[3]) / 2); c.fillStyle = '#0f1722'; c.fillRect(p[0] - 11, p[1] - 7, 22, 14); tx(c, String(l), p[0], p[1], C.text, 10); });
  if (opt && opt.cur !== undefined && opt.cur > 0) { c.strokeStyle = C.orange; c.lineWidth = 2.5; c.beginPath(); contour(n, opt.cur).forEach(s => { const a = P(s[0], s[1]), b = P(s[2], s[3]); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); }); c.stroke(); }
  return P;
}
/* ---- step 0 ---- */
function drawS0() {
  const c = fit('s0-cv'), W = c.W, H = Anim.get('h0', S.h0), px0 = 12, pw = W - 24, py = 10, ph = 140, base = py + ph;
  const X = x => px0 + pw * x, Y = z => base - ph * z / HMAX;
  c.beginPath(); c.moveTo(X(0), base); for (let i = 0; i <= 100; i++) c.lineTo(X(i / 100), Y(hOf('hill', i / 100, 0.5))); c.lineTo(X(1), base); c.closePath(); c.fillStyle = '#26402f'; c.fill(); c.strokeStyle = C.green; c.lineWidth = 2; c.stroke();
  for (let l = IV0; l <= H; l += IV0) ln(c, px0, Y(l), px0 + pw, Y(l), 'rgba(110,231,255,0.25)', 1);
  if (H > 0) { ln(c, px0, Y(H), px0 + pw, Y(H), C.orange, 2, [6, 4]); for (let i = 0; i < 100; i++) { const a = hOf('hill', i / 100, 0.5) - H, b = hOf('hill', (i + 1) / 100, 0.5) - H; if ((a < 0) !== (b < 0)) dt(c, X((i + a / (a - b)) / 100), Y(H), 5, C.orange); } }
  tx(c, fmt(H, 0) + ' ' + t('unitM'), W - 14, 20, C.orange, 12, 'right');
  const box = mapBox(W, 164, 230); drawContours(c, 'hill', box, IV0, { upto: H, cur: H });
}
function roS0() {
  const H = S.h0, n = levels('hill', IV0).filter(l => l <= H + 1e-9).length; $('s0-h-o').textContent = H + ' ' + t('unitM');
  $('s0-ro').textContent = t('s0ro', { h: H, n, iv: IV0, top: n ? Math.floor(H / IV0) * IV0 : 0 });
}
/* ---- step 1 ---- */
function drawS1() {
  const c = fit('s1-cv'), W = c.W, box = mapBox(W, 14, 300), P = drawContours(c, 'hill', box, IV0, { labels: true }), si = slopeInfo('hill', S.x1, S.y1, IV0), p = P(S.x1, S.y1);
  const m = Math.hypot(si.gx, si.gy) || 1, ux = si.gx / m, uy = si.gy / m;
  if (isFinite(si.gap)) { const half = Math.min(60, (si.gap / MAP_M) * box.s / 2); arrow(c, p[0] - ux * half, p[1] - uy * half, p[0] + ux * half, p[1] + uy * half, C.cyan, 3); arrow(c, p[0] + ux * half, p[1] + uy * half, p[0] - ux * half, p[1] - uy * half, C.cyan, 3); }
  arrow(c, p[0], p[1], p[0] + ux * 26, p[1] + uy * 26, C.pink, 3); dt(c, p[0], p[1], 6, C.orange);
}
function roS1() {
  const si = slopeInfo('hill', S.x1, S.y1, IV0); $('s1-x-o').textContent = fmt(S.x1, 2); $('s1-y-o').textContent = fmt(S.y1, 2);
  const kind = !isFinite(si.gap) || si.slope < 0.003 ? t('s1flat') : t('s1' + slopeKind(si.ang));
  $('s1-ro').textContent = t('s1ro', { z: fmt(hOf('hill', S.x1, S.y1), 1), iv: IV0, d: isFinite(si.gap) ? fmt(Math.min(si.gap, 9999), 0) : '∞', a: fmt(si.ang, 1), kind });
}
/* ---- step 2 ---- */
function drawS2() { const c = fit('s2-cv'), box = mapBox(c.W, 14, 310); drawContours(c, S.ter2, box, S.iv2, { labels: true }); }
function roS2() {
  $('s2-iv-o').textContent = S.iv2 + ' ' + t('unitM'); const lv = levels(S.ter2, S.iv2);
  $('s2-ro').textContent = t('s2ro', { ter: t(TER_KEY[S.ter2]), top: fmt(maxH(S.ter2), 0), iv: S.iv2, n: lv.length, note: featureVisible(S.ter2, S.iv2) ? t('s2ok') : t('s2lost') });
}
/* ---- step 3 ---- */
function drawS3() {
  const c = fit('s3-cv'), W = c.W, box = mapBox(W, 14, 310), P = drawContours(c, S.ter3, box, 10, { labels: false });
  const fp = S.went3 ? flowPath(S.ter3, S.x3, S.y3) : null, pr = Anim.get('p3', 0);
  if (fp) { const k = Math.max(1, Math.floor(pr * (fp.pts.length - 1))); c.beginPath(); fp.pts.slice(0, k + 1).forEach((q, i) => { const p = P(q[0], q[1]); i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); }); c.strokeStyle = C.cyan; c.lineWidth = 3; c.stroke(); const e = P(fp.pts[k][0], fp.pts[k][1]); dt(c, e[0], e[1], 4, C.cyan); }
  const s = P(S.x3, S.y3); dt(c, s[0], s[1], 6, '#5aa7e8'); c.beginPath(); c.arc(s[0], s[1], 9, 0, 6.2832); c.strokeStyle = C.text; c.lineWidth = 1.5; c.stroke();
}
function roS3() {
  $('s3-x-o').textContent = fmt(S.x3, 2); $('s3-y-o').textContent = fmt(S.y3, 2);
  if (!S.went3) { $('s3-ro').textContent = t('s3ro0'); return; }
  const fp = flowPath(S.ter3, S.x3, S.y3); $('s3-ro').textContent = t(fp.end === 'pit' ? 's3roPit' : 's3roEdge', { z0: fmt(fp.z0, 0), z1: fmt(fp.z1, 0), len: fmt(fp.len, 0) });
}
/* ---- step 4 ---- */
function drawS4() {
  const c = fit('s4-cv'), W = c.W, box = mapBox(W, 8, 190), P = drawContours(c, 'hill', box, IV0, {}), st = routeStats('hill', S.th4, S.len4, S.p4, IV0), r = st.pts;
  c.beginPath(); r.forEach((q, i) => { const p = P(q.x, q.y); i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); }); c.strokeStyle = C.orange; c.lineWidth = 2.5; c.stroke(); const cur = P(r[st.k].x, r[st.k].y); dt(c, cur[0], cur[1], 6, C.text);
  const ml = 40, mr = 12, y0 = 226, h = 150, Xp = i => ml + (W - ml - mr) * i / (r.length - 1), Yp = z => y0 + h - h * z / HMAX;
  for (let z = 0; z <= 120; z += 40) { ln(c, ml, Yp(z), W - mr, Yp(z), '#22304a', 1); tx(c, String(z), ml - 5, Yp(z), C.muted, 10, 'right'); }
  ln(c, ml, y0 + h, W - mr, y0 + h, C.muted, 1.5); ln(c, ml, y0, ml, y0 + h, C.muted, 1.5); tx(c, t('unitM'), ml + 4, y0 - 6, C.muted, 11, 'left');
  c.beginPath(); r.forEach((q, i) => { i ? c.lineTo(Xp(i), Yp(q.z)) : c.moveTo(Xp(i), Yp(q.z)); }); c.strokeStyle = '#4a5d80'; c.lineWidth = 1.5; c.setLineDash([4, 4]); c.stroke(); c.setLineDash([]);
  c.beginPath(); r.slice(0, st.k + 1).forEach((q, i) => { i ? c.lineTo(Xp(i), Yp(q.z)) : c.moveTo(Xp(i), Yp(q.z)); }); c.strokeStyle = C.cyan; c.lineWidth = 3; c.stroke();
  for (let i = 1; i < r.length; i++) { const a = Math.floor(r[i - 1].z / IV0 + 1e-9), b = Math.floor(r[i].z / IV0 + 1e-9); if (a !== b && i <= st.k) dt(c, Xp(i), Yp(Math.max(a, b) * IV0), 3, '#ffd97a'); }
  dt(c, Xp(st.k), Yp(r[st.k].z), 5, C.orange);
}
function roS4() {
  const st = routeStats('hill', S.th4, S.len4, S.p4, IV0); $('s4-th-o').textContent = S.th4 + '°'; $('s4-len-o').textContent = fmt(S.len4 * MAP_M, 0) + ' ' + t('unitM'); $('s4-p-o').textContent = S.p4 + '%';
  $('s4-ro').textContent = t('s4ro', { len: fmt(st.len, 0), p: S.p4, z: fmt(st.z, 1), up: fmt(st.up, 0), down: fmt(st.down, 0), max: fmt(st.max, 0), n: st.cross });
}
function redraw() { drawS0(); drawS1(); drawS2(); drawS3(); drawS4(); roS0(); roS1(); roS2(); roS3(); roS4(); }
function fillAll() { fillTer('s2-ter', S.ter2); fillTer('s3-ter', S.ter3); }
function boot() {
  Anim.redraw = redraw; window.onLang = () => { fillAll(); redraw(); };
  bindLang(); bindSpy();
  const on = (id, ev, fn) => $(id).addEventListener(ev, fn);
  on('s0-h', 'input', e => { S.h0 = Number(e.target.value); Anim.set('h0', S.h0); redraw(); });
  on('s0-reset', 'click', () => { S.h0 = 0; $('s0-h').value = 0; Anim.set('h0', 0); redraw(); });
  on('s1-x', 'input', e => { S.x1 = Number(e.target.value); redraw(); }); on('s1-y', 'input', e => { S.y1 = Number(e.target.value); redraw(); });
  on('s2-ter', 'change', e => { S.ter2 = e.target.value; redraw(); }); on('s2-iv', 'input', e => { S.iv2 = Number(e.target.value); redraw(); });
  on('s3-ter', 'change', e => { S.ter3 = e.target.value; S.went3 = false; Anim.set('p3', 0, true); redraw(); });
  on('s3-x', 'input', e => { S.x3 = Number(e.target.value); S.went3 = false; Anim.set('p3', 0, true); redraw(); }); on('s3-y', 'input', e => { S.y3 = Number(e.target.value); S.went3 = false; Anim.set('p3', 0, true); redraw(); });
  on('s3-go', 'click', () => { S.went3 = true; Anim.set('p3', 0, true); Anim.set('p3', 1); redraw(); });
  on('s3-reset', 'click', () => { S.went3 = false; Anim.set('p3', 0, true); redraw(); });
  on('s4-th', 'input', e => { S.th4 = Number(e.target.value); redraw(); }); on('s4-len', 'input', e => { S.len4 = Number(e.target.value); redraw(); }); on('s4-p', 'input', e => { S.p4 = Number(e.target.value); redraw(); });
  Anim.set('h0', 0, true); Anim.set('p3', 0, true);
  let rt = 0; window.addEventListener('resize', () => { cancelAnimationFrame(rt); rt = requestAnimationFrame(redraw); });
  applyLang(getLang());
}
if (typeof document !== 'undefined' && document.getElementById('langToggle')) boot();
if (typeof module !== 'undefined') module.exports = { hOf, grad, contour, levels, slopeInfo, slopeKind, featureRelief, featureVisible, flowPath, route, routeStats, maxH };
