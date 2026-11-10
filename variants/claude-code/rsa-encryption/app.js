'use strict';
// RSA lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every dot, curve and readout comes from window.RSA_MODEL (model.js). Canvas text is limited to
// panel titles, axis ticks and residue numbers round the clock; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.RSA_MODEL;
const t = (...a) => window.RSA_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', blue: '#8aa8ff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', xs: '#9fb4cc', ghost: '#8696aa' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros only after a decimal point; show −0 as 0.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; };
const SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
const pow10 = v => (v === 0 ? '1' : v === 1 ? '10' : v === 2 ? '100' : '10' + String(v).split('').map(c => SUP[c]).join(''));

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) { canvas.dataset.h = canvas.getAttribute('height') || 300; canvas.style.height = canvas.dataset.h + 'px'; }
  const height = Number(canvas.dataset.h);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}

// Panel title: shrinks the font until it fits (never overflows).
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
// 1-2-5 tick step so that labels of the given pixel width never touch.
function autoStep(span, px, labelPx) {
  const raw = span * labelPx / Math.max(1, px);
  const e = Math.pow(10, Math.floor(Math.log10(Math.max(raw, 1e-9))));
  for (const m of [1, 2, 5, 10]) if (m * e >= raw) return m * e;
  return 10 * e;
}

// A plot panel: title in its own row above the plot; tick labels left of / below the plot.
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  const yl = o.yLabel || (v => fmt(v));
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks) {
    ctx.strokeStyle = v === o.yMin ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(yl(v), P.l - 6, y(v) + 4);
  }
  if (o.xTicks) {
    const maxLabel = String(Math.round(Math.max(Math.abs(o.xMin), Math.abs(o.xMax)))).length;
    const step = o.xStep || Math.max(o.minStep || 1, autoStep(o.xMax - o.xMin, P.r - P.l, maxLabel * 7 + 18));
    const first = Math.ceil((o.xMin - 1e-9) / step) * step;
    ctx.textAlign = 'center';
    ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.b); ctx.lineTo(P.r, P.b); ctx.stroke();
    for (let v = first; v <= o.xMax + 1e-9; v += step) {
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
      ctx.fillText(fmt(v, 0), x(v), P.b + 15);
    }
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, o.titleY || P.t - 9, W - 16);
  return { x, y, P };
}
function dot(ctx, X, Y, r, fill, stroke) {
  ctx.beginPath(); ctx.arc(X, Y, r, 0, 7);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.6; ctx.stroke(); }
}
function guide(ctx, x0, y0, x1, y1, color = C.orange, alpha = 0.55) {
  ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.restore();
}
function polyline(ctx, pts, color, lw = 2) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.beginPath();
  pts.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y))); ctx.stroke(); ctx.restore();
}

/* ---------- shared animation runner (respects reduced motion and hidden pages) ---------- */
const anims = {};
function animate(name, ms, frame, done) {
  stopAnim(name);
  if (reduceMotion()) { frame(1); if (done) done(); return; }
  const start = performance.now();
  const tick = now => {
    const p = Math.min(1, (now - start) / ms);
    frame(p);
    if (p < 1) anims[name] = { id: requestAnimationFrame(tick), frame, done };
    else { delete anims[name]; if (done) done(); }
  };
  anims[name] = { id: requestAnimationFrame(tick), frame, done };
}
function stopAnim(name) { if (anims[name]) { cancelAnimationFrame(anims[name].id); delete anims[name]; } }
function finishAll() { Object.keys(anims).forEach(k => { const a = anims[k]; cancelAnimationFrame(a.id); delete anims[k]; a.frame(1); if (a.done) a.done(); }); }

/* ---------- step 0: multiplying vs splitting ---------- */
const TABLE = M.splitTable();
const rowFor = b => TABLE.find(r => r.b === b);
const s0 = { visited: new Set([8, 10, 12, 14, 16]), scan: 1, running: false };
function draw0() {
  const b = num('b0'), r = rowFor(b);
  $('b0v').textContent = String(b);
  const { ctx, W, H } = fitCanvas($('c0'));
  const A = panel(ctx, W, { top: 36, titleY: 18, bottom: 250, xMin: 7, xMax: 41, yMin: 0, yMax: 6.4, yTicks: [0, 2, 4, 6], yLabel: pow10, left: 42, xTicks: true, xStep: W < 420 ? 4 : 2, title: t('c0a') });
  const vis = TABLE.filter(q => s0.visited.has(q.b));
  polyline(ctx, vis.map(q => [A.x(q.b), A.y(Math.log10(q.divisions))]), C.orange, 1.6);
  polyline(ctx, vis.map(q => [A.x(q.b), A.y(Math.log10(q.digitMults))]), C.cyan, 1.6);
  vis.forEach(q => { dot(ctx, A.x(q.b), A.y(Math.log10(q.divisions)), 4, C.orange); dot(ctx, A.x(q.b), A.y(Math.log10(q.digitMults)), 4, C.cyan); });
  guide(ctx, A.x(b), A.P.t, A.x(b), A.P.b, C.text, 0.4);
  dot(ctx, A.x(b), A.y(Math.log10(r.divisions)), 7, null, C.text); dot(ctx, A.x(b), A.y(Math.log10(r.digitMults)), 7, null, C.text);

  // lower panel: the divisors scanned so far on a number line 0 … ~1.1·√n
  const xMax = Math.ceil(r.root * 1.12);
  const B = panel(ctx, W, { top: 300, bottom: H - 30, xMin: 0, xMax, yMin: 0, yMax: 1, yTicks: [], left: 18, right: 18, xTicks: true, title: t('c0b') });
  const reach = 2 + (r.found - 2) * s0.scan;
  ctx.fillStyle = 'rgba(255,180,84,0.18)'; ctx.fillRect(B.x(0), B.P.t + 6, B.x(xMax) - B.x(0), B.P.b - B.P.t - 12);
  ctx.fillStyle = 'rgba(255,180,84,0.55)'; ctx.fillRect(B.x(2), B.P.t + 6, Math.max(1.5, B.x(reach) - B.x(2)), B.P.b - B.P.t - 12);
  guide(ctx, B.x(r.root), B.P.t, B.x(r.root), B.P.b, C.ghost, 0.9);
  if (s0.scan >= 1) { ctx.fillStyle = C.orange; ctx.fillRect(B.x(r.found) - 1.5, B.P.t, 3, B.P.b - B.P.t); }
  const tried = Math.max(1, Math.round(r.divisions * s0.scan));
  const prog = s0.visited.size < TABLE.length ? t('s0prog', { c: s0.visited.size, N: TABLE.length }) : '';
  $('r0').textContent = s0.scan < 1 ? t('s0run', { c: tried }) : t('s0readout', { prog, b, p: r.p, q: r.q, n: r.n, nb: r.nBits, dm: r.digitMults, div: r.divisions, f: r.found, root: r.root });
  if (vis.length >= 2) {
    const a = vis[0], z = vis[vis.length - 1];
    const ratio = Math.pow(z.divisions / a.divisions, 1 / ((z.b - a.b) / 2));
    $('r0b').textContent = t('s0trend', { r: fmt(ratio, 1), m0: a.digitMults, m1: z.digitMults });
  } else $('r0b').textContent = '';
}

/* ---------- step 1: powers on a clock ---------- */
const s1 = { shown: Infinity };
function orbitInfo() {
  const n = num('n1'), a = num('a1'), o = M.orbit(a, n), ph = M.phi(n), g = M.gcd(a, n);
  const K = Math.max(ph, o.seq.length - 1) + 2;
  const vals = [1 % n]; for (let k = 1; k <= K; k++) vals.push((vals[k - 1] * a) % n);
  return { n, a, o, ph, g, K, vals };
}
function draw1() {
  const I = orbitInfo(), { n, a, o, ph, g, K, vals } = I;
  $('n1v').textContent = String(n); $('a1v').textContent = String(a);
  const shown = Math.min(K, s1.shown);
  let { ctx, W, H } = fitCanvas($('c1'));
  title(ctx, t('c1a'), 8, 17, W - 16);
  const cx = W / 2, cy = (H + 24) / 2, R = Math.min(W - 60, H - 74) / 2;
  const pos = k => { const th = -Math.PI / 2 + 2 * Math.PI * k / n; return [cx + R * Math.cos(th), cy + R * Math.sin(th)]; };
  ctx.save(); ctx.strokeStyle = C.grid; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke(); ctx.restore();
  // path: move k goes from a^(k-1) to a^k
  ctx.save(); ctx.lineWidth = 2;
  for (let k = 1; k <= shown; k++) {
    const [x0, y0] = pos(vals[k - 1]), [x1, y1] = pos(vals[k]);
    ctx.strokeStyle = C.orange; ctx.globalAlpha = 0.35 + 0.65 * k / Math.max(1, shown);
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    const ang = Math.atan2(y1 - y0, x1 - x0), ax = x1 - 7 * Math.cos(ang), ay = y1 - 7 * Math.sin(ang);
    ctx.fillStyle = C.orange; ctx.beginPath(); ctx.moveTo(ax, ay);
    ctx.lineTo(ax - 7 * Math.cos(ang - 0.45), ay - 7 * Math.sin(ang - 0.45)); ctx.lineTo(ax - 7 * Math.cos(ang + 0.45), ay - 7 * Math.sin(ang + 0.45)); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  const fs = n > 28 ? 10 : 11;
  ctx.save(); ctx.font = `${fs}px system-ui,sans-serif`; ctx.textAlign = 'center';
  for (let k = 0; k < n; k++) {
    const [X, Y] = pos(k), co = M.gcd(k, n) === 1;
    if (co) dot(ctx, X, Y, 4.2, k === 1 % n ? C.green : C.text); else dot(ctx, X, Y, 3.6, C.bg, C.ghost);
    const th = -Math.PI / 2 + 2 * Math.PI * k / n;
    ctx.fillStyle = k === 1 % n ? C.green : C.muted; ctx.fillText(String(k), cx + (R + 15) * Math.cos(th), cy + (R + 15) * Math.sin(th) + 4);
  }
  ctx.restore();
  const [ex, ey] = pos(vals[shown]); dot(ctx, ex, ey, 8, null, C.orange);

  ({ ctx, W, H } = fitCanvas($('c1b')));
  const mid = Math.round((n - 1) / 2);
  const B = panel(ctx, W, { top: 26, bottom: H - 30, xMin: -0.5, xMax: K + 0.5, yMin: 0, yMax: n - 1 + 0.5, yTicks: [0, mid, n - 1].filter((v, i, arr) => arr.indexOf(v) === i), left: 30, xTicks: true, title: t('c1b') });
  guide(ctx, B.x(ph), B.P.t, B.x(ph), B.P.b, C.ghost, 0.95);
  ctx.save(); ctx.strokeStyle = C.orange; ctx.globalAlpha = 0.45; ctx.lineWidth = 1.2; ctx.beginPath();
  for (let k = 0; k <= shown; k++) { const X = B.x(k), Y = B.y(vals[k]); if (k) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); }
  ctx.stroke(); ctx.restore();
  const rr = W < 360 ? 3 : 4;
  for (let k = 0; k <= K; k++) {
    if (k > shown) { dot(ctx, B.x(k), B.y(vals[k]), rr - 1, null, C.grid); continue; }
    dot(ctx, B.x(k), B.y(vals[k]), rr, vals[k] === 1 % n ? C.green : C.orange);
  }
  const prog = shown < K ? t('s1prog', { c: shown, N: K }) : '';
  const pw = M.modpow(a, ph, n).value;
  if (g === 1) $('r1').textContent = t('s1co', { a, n, prog, seq: o.seq.slice(1, o.ret + 1).join(', '), ret: o.ret, phi: ph, pw });
  else $('r1').textContent = t('s1not', { a, n, g, prog, seq: o.seq.slice(1).join(', ') + ', …', len: o.cycleLen, phi: ph, pw });
}

/* ---------- step 2: key pair ---------- */
let key = null, eList = [];
function computeKey() {
  const p = M.P_LIST[num('p2')], q = M.Q_LIST[num('q2')], ph = (p - 1) * (q - 1);
  eList = M.validE(ph, 8);
  const ei = $('e2'); ei.max = String(eList.length - 1); if (num('e2') > eList.length - 1) ei.value = String(eList.length - 1);
  key = M.makeKey(p, q, eList[num('e2')]);
  const m3 = $('m3'); m3.max = String(key.n - 1); if (num('m3') > key.n - 1) m3.value = String(key.n - 1);
}
function draw2() {
  const K = key;
  $('p2v').textContent = String(K.p); $('q2v').textContent = String(K.q); $('e2v').textContent = String(K.e);
  const { ctx, W, H } = fitCanvas($('c2'));
  const half = Math.round(K.phi / 2);
  const A = panel(ctx, W, { top: 26, bottom: H - 30, xMin: 0, xMax: K.phi, yMin: 0, yMax: K.phi * 1.04, yTicks: [0, half, K.phi], left: 44, xTicks: true, title: t('c2a') });
  ctx.save(); ctx.fillStyle = C.xs; ctx.globalAlpha = 0.6;
  const r = K.phi > 600 ? 1.3 : 1.7;
  for (let d = 1; d < K.phi; d++) { ctx.beginPath(); ctx.arc(A.x(d), A.y((K.e * d) % K.phi), r, 0, 7); ctx.fill(); }
  ctx.restore();
  guide(ctx, A.x(K.d), A.P.b, A.x(K.d), A.y(1), C.green, 0.9); guide(ctx, A.P.l, A.y(1), A.x(K.d), A.y(1), C.green, 0.9);
  dot(ctx, A.x(K.d), A.y(1), 6.5, C.green, C.bg);
  $('r2').textContent = t('s2readout', { p: K.p, q: K.q, n: K.n, pm: K.p - 1, qm: K.q - 1, phi: K.phi, e: K.e, d: K.d, ed: K.e * K.d, k: K.k });
  const rows = K.euclid.rows;
  let html = `<tr><th>${t('euR')}</th><th>${t('euQ')}</th><th>${t('euS')}</th><th>${t('euT')}</th></tr>`;
  rows.forEach(row => { const cls = row.r === 1 ? ' class="hit"' : row.r === 0 ? ' class="pending"' : ''; html += `<tr${cls}><td>${row.r}</td><td>${row.q === null ? '' : row.q}</td><td>${row.s}</td><td>${row.t}</td></tr>`; });
  $('euTable').innerHTML = html;
  $('euNote').textContent = t('euNote', { t: K.euclid.t, d: K.d });
}

/* ---------- step 3: encrypt and decrypt everything ---------- */
const s3 = { checked: null, count: 0 };
function reset3() { s3.checked = new Uint8Array(key.n); s3.count = 0; }
function mark3(m) { if (!s3.checked[m]) { s3.checked[m] = 1; s3.count++; } }
function draw3() {
  const K = key, m = num('m3');
  $('m3v').textContent = String(m);
  const { ctx, W, H } = fitCanvas($('c3'));
  const yT = [0, Math.round((K.n - 1) / 2), K.n - 1];
  const A = panel(ctx, W, { top: 26, bottom: 214, xMin: 0, xMax: K.n, yMin: 0, yMax: K.n, yTicks: yT, left: 44, xTicks: true, title: t('c3a') });
  const r = K.n > 600 ? 1.4 : 1.8;
  const enc = mm => M.modpow(mm, K.e, K.n).value;
  ctx.save(); ctx.fillStyle = C.xs; ctx.globalAlpha = 0.55;
  for (let mm = 0; mm < K.n; mm++) { ctx.beginPath(); ctx.arc(A.x(mm), A.y(enc(mm)), r, 0, 7); ctx.fill(); }
  ctx.restore();
  const c = enc(m), back = M.modpow(c, K.d, K.n).value;
  guide(ctx, A.x(m), A.P.b, A.x(m), A.y(c)); guide(ctx, A.P.l, A.y(c), A.x(m), A.y(c));
  dot(ctx, A.x(m), A.y(c), 6, C.orange, C.bg);
  const B = panel(ctx, W, { top: 266, bottom: H - 30, xMin: 0, xMax: K.n, yMin: 0, yMax: K.n, yTicks: yT, left: 44, xTicks: true, title: t('c3b') });
  guide(ctx, B.x(0), B.y(0), B.x(K.n), B.y(K.n), C.ghost, 0.5);
  ctx.save(); ctx.fillStyle = C.green;
  for (let mm = 0; mm < K.n; mm++) if (s3.checked[mm]) { ctx.beginPath(); ctx.arc(B.x(mm), B.y(M.modpow(enc(mm), K.d, K.n).value), r + 0.4, 0, 7); ctx.fill(); }
  ctx.restore();
  dot(ctx, B.x(m), B.y(back), 6, C.orange, C.bg);
  const prog = s3.count < K.n ? t('s3prog', { c: s3.count, N: K.n }) : '';
  let txt = t('s3readout', { prog, m, e: K.e, d: K.d, n: K.n, c, back, same: back === m ? t('s3same') : '' });
  if (s3.count === K.n) {
    let F = 0; for (let mm = 0; mm < K.n; mm++) if (enc(mm) === mm) F++;
    txt += ' ' + t('s3all', { N: K.n, F });
  }
  $('r3').textContent = txt;
}

/* ---------- step 4: square-and-multiply ---------- */
const s4 = { mode: 'd', shown: Infinity };
function ladderInfo() {
  const K = key, m = num('m3'), c = M.modpow(m, K.e, K.n).value;
  const base = s4.mode === 'e' ? m : c, E = s4.mode === 'e' ? K.e : K.d;
  return { K, base, E, run: M.modpow(base, E, K.n) };
}
function draw4() {
  const { K, base, E, run } = ladderInfo();
  $('useE').setAttribute('aria-pressed', s4.mode === 'e'); $('useD').setAttribute('aria-pressed', s4.mode === 'd');
  const L = run.bits.length, N = run.ops.length, shown = Math.min(N, s4.shown);
  const { ctx, W, H } = fitCanvas($('c4'));
  const A = panel(ctx, W, { top: 36, titleY: 18, bottom: H - 30, xMin: 1, xMax: 24, yMin: 0, yMax: 8, yTicks: [0, 2, 4, 6, 8], yLabel: pow10, left: 42, xTicks: true, xStep: W < 420 ? 4 : 2, title: t('c4a') });
  const band = (lo, hi, color) => {
    ctx.save(); ctx.fillStyle = color; ctx.globalAlpha = 0.28; ctx.beginPath();
    for (let l = 2; l <= 24; l++) ctx.lineTo(A.x(l), A.y(Math.min(8, Math.log10(Math.max(1, hi(l))))));
    for (let l = 24; l >= 2; l--) ctx.lineTo(A.x(l), A.y(Math.min(8, Math.log10(Math.max(1, lo(l))))));
    ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1; ctx.strokeStyle = color; ctx.lineWidth = 1.8; ctx.beginPath();
    for (let l = 2; l <= 24; l++) ctx.lineTo(A.x(l), A.y(Math.min(8, Math.log10(Math.max(1, hi(l)))))); ctx.stroke(); ctx.restore();
  };
  band(l => Math.pow(2, l - 1) - 1, l => Math.pow(2, l) - 2, C.blue);
  band(l => l - 1, l => 2 * (l - 1), C.orange);
  guide(ctx, A.x(L), A.P.t, A.x(L), A.P.b, C.text, 0.35);
  dot(ctx, A.x(L), A.y(Math.log10(Math.max(1, E - 1))), 5.5, C.text, C.blue);
  dot(ctx, A.x(L), A.y(Math.log10(Math.max(1, M.fastCount(E)))), 5.5, C.text, C.orange);
  // ladder table
  let html = `<tr><th>${t('lad0')}</th><th>${t('lad1')}</th><th class="l">${t('lad2')}</th><th>${t('lad3')}</th><th>${t('lad4')}</th></tr>`;
  run.ops.forEach((op, i) => {
    const cls = i >= shown ? ' class="pending"' : op.exp === E ? ' class="hit"' : '';
    const name = op.kind === 'start' ? t('opStart') : op.kind === 'sq' ? t('opSq') : t('opMul');
    html += `<tr${cls}><td>${i}</td><td>${op.kind === 'mul' ? '' : op.bit}</td><td class="l">${name}</td><td>${i < shown ? op.exp : ''}</td><td>${i < shown ? op.value : ''}</td></tr>`;
  });
  $('ladder').innerHTML = html;
  const prog = shown < N ? t('s4prog', { c: shown, N }) : '';
  $('r4').textContent = t('s4readout', { prog, base, E, n: K.n, bits: run.bits, L, sq: run.squares, mu: run.mults, fast: M.fastCount(E), v: run.value, naive: E - 1, f2048: 2 * 2047, n2048: Math.floor(2047 * Math.log10(2)) });
}

/* ---------- step 5: the eavesdropper ---------- */
const s5 = { tried: 0, state: 'idle' };
function draw5() {
  const K = key, m = num('m3'), c = M.modpow(m, K.e, K.n).value, att = M.trialFactor(K.n);
  let { ctx, W, H } = fitCanvas($('c5'));
  const root = Math.floor(Math.sqrt(K.n)), xMax = root + 1;
  const A = panel(ctx, W, { top: 30, bottom: H - 30, xMin: 0, xMax, yMin: 0, yMax: 1, yTicks: [], left: 18, right: 18, xTicks: true, minStep: 1, title: t('c5a', { n: K.n }) });
  const cands = []; for (let d = 2; d <= root; d = d === 2 ? 3 : d + 2) cands.push(d);
  const yMid = (A.P.t + A.P.b) / 2;
  guide(ctx, A.x(root), A.P.t, A.x(root), A.P.b, C.ghost, 0.8);
  const rad = Math.max(2, Math.min(4.5, (A.x(2) - A.x(1)) * 0.4));
  cands.forEach((d, i) => {
    if (i < s5.tried) dot(ctx, A.x(d), yMid, d === att.f && s5.state === 'done' ? rad + 2.5 : rad, d === att.f && s5.state === 'done' ? C.orange : C.raw);
    else dot(ctx, A.x(d), yMid, rad - 0.8, null, C.ghost);
  });
  if (s5.state === 'idle') $('r5').textContent = t('s5idle', { n: K.n, e: K.e, c });
  else if (s5.state === 'run') $('r5').textContent = t('s5run', { c: s5.tried });
  else {
    const k2 = M.makeKey(att.f, att.g, K.e), mm = M.modpow(c, k2.d, K.n).value;
    $('r5').textContent = t('s5done', { tries: att.tries, p: att.f, q: att.g, phi: k2.phi, d: k2.d, c, n: K.n, m: mm });
  }

  const L = num('L5'); $('L5v').textContent = String(L);
  ({ ctx, W, H } = fitCanvas($('c5b')));
  const B = panel(ctx, W, { top: 36, titleY: 18, bottom: H - 30, xMin: 0, xMax: 4096, yMin: 0, yMax: 60, yTicks: [0, 20, 40, 60], yLabel: pow10, left: 42, xTicks: true, title: t('c5b') });
  const curve = (f, color) => {
    const pts = []; for (let l = 16; l <= 4096; l += 16) { const v = f(l); if (v > 60) { pts.push([B.x(l), B.y(60)]); break; } pts.push([B.x(l), B.y(Math.max(0, v))]); }
    polyline(ctx, pts, color, 2.2);
  };
  guide(ctx, B.P.l, B.y(M.yearLog10), B.P.r, B.y(M.yearLog10), C.ghost, 0.95);
  curve(M.legitLog10, C.cyan); curve(M.gnfsLog10, C.orange); curve(M.trialLog10, C.pink);
  guide(ctx, B.x(L), B.P.t, B.x(L), B.P.b, C.text, 0.35);
  dot(ctx, B.x(L), B.y(M.legitLog10(L)), 5.5, C.cyan, C.bg); dot(ctx, B.x(L), B.y(M.gnfsLog10(L)), 5.5, C.orange, C.bg);
  if (M.trialLog10(L) <= 60) dot(ctx, B.x(L), B.y(M.trialLog10(L)), 5.5, C.pink, C.bg);
  const gn = M.gnfsLog10(L), yl = M.yearsLog10(gn), sec = gn - Math.log10(M.OPS_PER_SEC);
  const yrs = yl >= 0 ? t('yrsYear', { x: fmt(yl, 1) }) : sec >= 0 ? t('yrsSec', { x: fmt(sec, 1) }) : t('yrsSmall');
  $('r5b').textContent = t('s5scale', { L, lg: fmt(M.legitLog10(L), 1), gn: fmt(gn, 1), yrs, tr: fmt(M.trialLog10(L), 1) });
}

function keyChanged() { stopAnim('s3'); stopAnim('s4'); stopAnim('s5'); computeKey(); reset3(); mark3(num('m3')); s4.shown = Infinity; s5.tried = 0; s5.state = 'idle'; draw2(); draw3(); draw4(); draw5(); }
function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  $('b0').addEventListener('input', () => { stopAnim('s0'); s0.scan = 1; s0.visited.add(num('b0')); draw0(); });
  $('sweep0').addEventListener('click', () => {
    s0.visited.clear(); s0.scan = 1;
    animate('s0', TABLE.length * 380, p => {
      const i = Math.min(TABLE.length - 1, Math.floor(p * TABLE.length));
      for (let j = 0; j <= i; j++) s0.visited.add(TABLE[j].b);
      $('b0').value = String(TABLE[i].b); draw0();
    });
  });
  $('slow0').addEventListener('click', () => { s0.scan = 0; animate('s0', 3000, p => { s0.scan = p; draw0(); }); });

  const clampA = () => { const n = num('n1'), ai = $('a1'); ai.max = String(n - 1); if (num('a1') > n - 1) ai.value = String(n - 1); };
  $('n1').addEventListener('input', () => { stopAnim('s1'); clampA(); s1.shown = Infinity; draw1(); });
  $('a1').addEventListener('input', () => { stopAnim('s1'); s1.shown = Infinity; draw1(); });
  $('walk1').addEventListener('click', () => {
    const K = orbitInfo().K; s1.shown = 0; draw1();
    animate('s1', K * 420, p => { s1.shown = Math.min(K, Math.floor(p * (K + 1))); draw1(); });
  });
  clampA();

  ['p2', 'q2', 'e2'].forEach(id => $(id).addEventListener('input', keyChanged));

  $('m3').addEventListener('input', () => { stopAnim('s3'); mark3(num('m3')); s5.tried = 0; s5.state = 'idle'; stopAnim('s5'); draw3(); draw4(); draw5(); });
  $('check3').addEventListener('click', () => {
    const N = key.n; reset3();
    animate('s3', Math.min(4000, 600 + N * 4), p => { const upto = Math.min(N, Math.floor(p * N)); for (let mm = 0; mm < upto; mm++) mark3(mm); if (p >= 1) for (let mm = 0; mm < N; mm++) mark3(mm); draw3(); });
  });

  $('useE').addEventListener('click', () => { stopAnim('s4'); s4.mode = 'e'; s4.shown = Infinity; draw4(); });
  $('useD').addEventListener('click', () => { stopAnim('s4'); s4.mode = 'd'; s4.shown = Infinity; draw4(); });
  $('run4').addEventListener('click', () => {
    const N = ladderInfo().run.ops.length; s4.shown = 0; draw4();
    animate('s4', N * 550, p => { s4.shown = Math.min(N, Math.floor(p * (N + 1))); draw4(); });
  });

  $('attack5').addEventListener('click', () => {
    const tries = M.trialFactor(key.n).tries; s5.state = 'run'; s5.tried = 0; draw5();
    animate('s5', tries * 380 + 200, p => { s5.tried = Math.min(tries, Math.floor(p * (tries + 1))); if (p >= 1) { s5.tried = tries; s5.state = 'done'; } draw5(); });
  });
  $('L5').addEventListener('input', draw5);
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked');
    const ok = !!choice && choice.value === 'b';
    $('quizFeedback').textContent = t(ok ? 'correct' : 'wrong');
    $('quizFeedback').style.color = ok ? C.green : C.orange;
    $('quizFeedback').dataset.state = ok ? 'correct' : 'wrong';
  });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target)));
    }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  computeKey(); reset3(); mark3(num('m3'));
  window.refreshRSA = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
