'use strict';
// Bar Charts · Numbers Standing in a Row (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every bar, line and readout is computed by window.BAR_MODEL (model.js). Canvas text is limited to axis ticks,
// day names, bar values and line tags in reserved rows/margins; label() keeps them apart and on-canvas.
(function () {

const $ = id => document.getElementById(id);
const M = window.BAR_MODEL;
const t = (...a) => window.BAR_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', dark: '#07131a' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; return v.toFixed(d).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') || '0'; };
const day = i => t(`d${i}`);
const days = list => list.map(day).join(t('joinDays'));
const lerp = (a, b, p) => a + (b - a) * p;
const ease = p => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);

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
  return { ctx, W: width, H: height, boxes: [] };
}

// Places one label inside the canvas; if it would touch a label already placed in this drawing it tries the
// rows in `alt`, and is left out when none is free (every number on a canvas is also in the DOM readout).
function label(cv, text, x, y, o = {}) {
  const { ctx, W, H, boxes } = cv, size = o.size || 12;
  ctx.save(); ctx.font = `${o.bold ? 700 : 500} ${size}px system-ui,sans-serif`;
  const w = ctx.measureText(text).width, asc = size * 0.78, desc = size * 0.24;
  const align = o.align || 'center';
  let x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  x0 = Math.max(2, Math.min(W - 2 - w, x0));
  for (const dy of [0].concat(o.alt || [])) {
    const yy = Math.max(asc + 2, Math.min(H - desc - 2, y + dy));
    const b = { x0: x0 - 2, x1: x0 + w + 2, y0: yy - asc - 1, y1: yy + desc + 1 };
    if (boxes.some(q => b.x0 < q.x1 && q.x0 < b.x1 && b.y0 < q.y1 && q.y0 < b.y1)) continue;
    boxes.push(b);
    if (o.bg) { ctx.fillStyle = C.bg; ctx.fillRect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0); }
    ctx.fillStyle = o.color || C.muted; ctx.textAlign = 'left'; ctx.fillText(text, x0, yy); ctx.restore(); return true;
  }
  ctx.restore(); return false;
}

// Vertical-bar frame: n slots across [L, W − R], values base..top mapped to B..T.
function frame(W, n, o) {
  const L = o.L || 36, R = o.R == null ? 16 : o.R, slot = (W - L - R) / n, base = o.base || 0;
  const bw = Math.min(o.maxW || 54, slot * (o.fill || 0.6));
  return { L, R, T: o.T, B: o.B, slot, bw, base, top: o.top, x: i => L + slot * (i + 0.5), y: v => o.B - (v - base) / (o.top - base) * (o.B - o.T) };
}
function axis(cv, F, ticks, fmtTick = String) {
  const { ctx, W } = cv;
  ctx.save(); ctx.lineWidth = 1;
  ticks.forEach(v => { ctx.strokeStyle = v === F.base ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(F.L - 4, F.y(v)); ctx.lineTo(W - F.R, F.y(v)); ctx.stroke(); });
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(F.L, F.T - 6); ctx.lineTo(F.L, F.B); ctx.stroke();
  ctx.restore();
  ticks.forEach(v => label(cv, fmtTick(v), F.L - 7, F.y(v) + 4, { align: 'right', size: 11 }));
}
function dayLabels(cv, F, n, posOf = i => i) { for (let i = 0; i < n; i++) label(cv, day(i), F.x(posOf(i)), F.B + 18, { size: 12, color: C.muted }); }
function rect(ctx, x, y0, y1, w, color, alpha = 1) { ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.fillRect(x - w / 2, Math.min(y0, y1), w, Math.abs(y1 - y0)); ctx.restore(); }
function dashBox(ctx, x, y0, y1, w, color) { ctx.save(); ctx.strokeStyle = color; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.5; ctx.strokeRect(x - w / 2 + 1, Math.min(y0, y1), w - 2, Math.abs(y1 - y0)); ctx.restore(); }

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

/* ---------- step 0: from table to bars; upright or lying down ---------- */
const s0 = { data: M.W1.slice(), horiz: false, p: 0 };
function table0(sel) {
  const head = `<tr><th scope="row">${t('rowDay')}</th>${s0.data.map((_, i) => `<th scope="col">${day(i)}</th>`).join('')}</tr>`;
  const row = `<tr><th scope="row">${t('rowBooks')}</th>${s0.data.map((v, i) => `<td class="${i === sel ? 'on' : ''}">${v}</td>`).join('')}</tr>`;
  $('table0').innerHTML = head + row;
}
function draw0() {
  const sel = num('d0'), data = s0.data, n = data.length;
  $('d0v').textContent = day(sel); $('v0v').textContent = String(data[sel]);
  $('flip0').setAttribute('aria-pressed', String(s0.horiz));
  table0(sel);
  const cv = fitCanvas($('c0')), { ctx, W, H } = cv, top = M.S0.vMax, ticks = [0, 5, 10, 15, 20];
  // upright geometry
  const V = frame(W, n, { T: 26, B: H - 36, top, maxW: 52 });
  // lying-down geometry: rows from T to B, values along x from L to W − R
  const hz = { L: 46, R: 34, T: 14, B: H - 34 }, row = (hz.B - hz.T) / n, th = Math.min(30, row * 0.62), hx = v => hz.L + v / top * (W - hz.L - hz.R);
  const p = ease(s0.p);
  const settled = p === 0 || p === 1;
  if (settled && !s0.horiz) axis(cv, V, ticks);
  if (settled && s0.horiz) {
    ctx.save(); ctx.strokeStyle = C.grid; ticks.forEach(v => { ctx.beginPath(); ctx.moveTo(hx(v), hz.T); ctx.lineTo(hx(v), hz.B + 4); ctx.stroke(); });
    ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(hz.L, hz.B); ctx.lineTo(W - hz.R, hz.B); ctx.stroke(); ctx.restore();
    ticks.forEach(v => label(cv, String(v), hx(v), hz.B + 17, { size: 11 }));
  }
  data.forEach((v, i) => {
    // rectangles in both layouts, blended by p
    const a = { x0: V.x(i) - V.bw / 2, x1: V.x(i) + V.bw / 2, y0: V.y(v), y1: V.B };
    const yc = hz.T + row * (i + 0.5), b = { x0: hz.L, x1: hx(v), y0: yc - th / 2, y1: yc + th / 2 };
    const r = { x0: lerp(a.x0, b.x0, p), x1: lerp(a.x1, b.x1, p), y0: lerp(a.y0, b.y0, p), y1: lerp(a.y1, b.y1, p) };
    ctx.fillStyle = i === sel ? C.orange : C.cyan; ctx.fillRect(r.x0, r.y0, r.x1 - r.x0, r.y1 - r.y0);
    if (!settled) return;
    if (!s0.horiz) { label(cv, String(v), V.x(i), V.y(v) - 6, { size: 12, bold: true, color: C.text }); label(cv, day(i), V.x(i), V.B + 18, { size: 12 }); }
    else { label(cv, day(i), hz.L - 8, yc + 4, { align: 'right', size: 12 }); label(cv, String(v), hx(v) + 6, yc + 4, { align: 'left', size: 12, bold: true, color: C.text }); }
  });
  const max = Math.max(...data), min = Math.min(...data);
  $('r0').textContent = t('s0readout', { day: day(sel), v: data[sel], maxDays: days(M.maxDays(data)), max, minDays: days(data.map((x, i) => (x === min ? i : -1)).filter(i => i >= 0)), min });
}

/* ---------- step 1: books per square ---------- */
function draw1() {
  const u = M.UNITS[num('u1')], sc = M.scale(M.W1, u), data = M.W1;
  $('u1v').textContent = String(u);
  const cv = fitCanvas($('c1')), { ctx, W, H } = cv;
  const F = frame(W, data.length, { T: 26, B: H - 36, top: sc.top, maxW: 52 });
  axis(cv, F, Array.from({ length: M.CELLS + 1 }, (_, k) => k * u));
  data.forEach((v, i) => {
    const over = v > sc.top, yTop = over ? F.T - 2 : F.y(v);
    rect(ctx, F.x(i), yTop, F.B, F.bw, C.cyan);
    if (over) {
      // zigzag cut across the top of a bar that does not fit
      ctx.save(); ctx.fillStyle = C.bg; ctx.beginPath(); const x0 = F.x(i) - F.bw / 2 - 1, x1 = F.x(i) + F.bw / 2 + 1, zz = 6;
      ctx.moveTo(x0, F.T - 4); for (let k = 0; k <= 6; k++) ctx.lineTo(lerp(x0, x1, k / 6), F.T + 6 + (k % 2 ? zz : 0)); ctx.lineTo(x1, F.T - 4); ctx.closePath(); ctx.fill(); ctx.restore();
      label(cv, String(v), F.x(i), F.T + 28, { size: 12, bold: true, color: C.dark });
    } else label(cv, String(v), F.x(i), F.y(v) - 6, { size: 12, bold: true, color: C.text });
  });
  dayLabels(cv, F, data.length);
  const iA = 1, iB = 3;
  $('r1').textContent = t('s1readout', { u, top: sc.top, hiDay: day(M.argmax(data)), hi: Math.max(...data), tc: fmt(sc.tallestCells), dA: day(iA), vA: data[iA], dB: day(iB), vB: data[iB], dv: Math.abs(data[iA] - data[iB]), dc: fmt(Math.abs(data[iA] - data[iB]) / u),
    over: sc.overflow.length ? t('s1over', { n: sc.overflow.length, top: sc.top }) : t('s1fit') });
}

/* ---------- step 2: how many more; re-order ---------- */
const s2 = { sorted: false, from: [0, 1, 2, 3, 4], pos: [0, 1, 2, 3, 4], p: 1 };
function targetPos() { const r = M.rank(M.W1); return M.W1.map((_, i) => (s2.sorted ? r.indexOf(i) : i)); }
function draw2() {
  const a = num('a2'), b = num('b2'), data = M.W1, q = M.diff(data, a, b), pe = ease(s2.p);
  $('a2v').textContent = day(a); $('b2v').textContent = day(b);
  $('sort2').setAttribute('aria-pressed', String(s2.sorted));
  const cv = fitCanvas($('c2')), { ctx, W, H } = cv;
  const F = frame(W, data.length, { T: 26, B: H - 36, top: 20, maxW: 52 });
  axis(cv, F, [0, 5, 10, 15, 20]);
  const px = i => F.L + F.slot * (lerp(s2.from[i], s2.pos[i], pe) + 0.5);
  data.forEach((v, i) => rect(ctx, px(i), F.y(v), F.B, F.bw, C.cyan, (i === a || i === b) ? 1 : 0.45));
  if (q.taller >= 0 && a !== b) {
    const ys = F.y(q.b < q.a ? q.b : q.a), yt = F.y(Math.max(q.a, q.b)), xs = px(q.shorter), xt = px(q.taller);
    rect(ctx, xt, yt, ys, F.bw, C.orange);
    ctx.save(); ctx.strokeStyle = C.text; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.6; ctx.beginPath();
    ctx.moveTo(xs - (xt > xs ? F.bw / 2 : -F.bw / 2), ys); ctx.lineTo(xt + (xt > xs ? F.bw / 2 : -F.bw / 2), ys); ctx.stroke(); ctx.restore();
    if (ys - yt >= 13) label(cv, String(q.d), xt, (yt + ys) / 2 + 4.5, { size: 12, bold: true, color: C.dark });
  }
  data.forEach((v, i) => label(cv, String(v), px(i), F.y(v) - 6, { size: 12, bold: true, color: C.text, bg: true }));
  if (s2.p >= 1) for (let i = 0; i < data.length; i++) label(cv, day(i), px(i), F.B + 18, { size: 12 });
  let res;
  if (a === b) res = t('s2self');
  else if (q.d === 0) res = t('s2same');
  else res = t('s2more', { dT: day(q.taller), dS: day(q.shorter), d: q.d, big: Math.max(q.a, q.b), small: Math.min(q.a, q.b) });
  const order = s2.sorted ? t('s2order', { list: M.rank(data).map(i => `${day(i)} ${data[i]}`).join(t('joinDays')) }) : '';
  $('r2').textContent = t('s2readout', { dA: day(a), a: q.a, dB: day(b), b: q.b, res, order });
}

/* ---------- step 3: where the axis starts ---------- */
function bars3(canvasId, base, titleKey) {
  const data = M.W1, tr = M.truncated(data, base), top = M.S3.axisTop;
  const cv = fitCanvas($(canvasId)), { ctx, W, H } = cv;
  label(cv, t(titleKey, { b: base }), 8, 15, { align: 'left', size: 12, bold: true, color: C.text });
  const F = frame(W, data.length, { T: 40, B: H - 36, top, base, maxW: 40, L: 34, R: 10 });
  const ticks = [base].concat([4, 8, 12, 16].filter(v => v - base >= 2.5));
  axis(cv, F, ticks);
  if (base > 0) { // ≈ mark: a piece of the axis is left out
    ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 2; ctx.fillStyle = C.bg; ctx.fillRect(F.L - 6, F.B - 16, 12, 9);
    [F.B - 14, F.B - 9].forEach(y => { ctx.beginPath(); ctx.moveTo(F.L - 6, y + 2); ctx.lineTo(F.L - 2, y - 1); ctx.lineTo(F.L + 2, y + 2); ctx.lineTo(F.L + 6, y - 1); ctx.stroke(); }); ctx.restore();
  }
  data.forEach((v, i) => {
    const col = i === tr.iHi ? C.orange : i === tr.iLo ? C.violet : C.cyan;
    if (v > base) rect(ctx, F.x(i), F.y(v), F.B, F.bw, col, i === tr.iHi || i === tr.iLo ? 1 : 0.55);
    label(cv, String(v), F.x(i), (v > base ? F.y(v) : F.B) - 6, { size: 12, bold: true, color: v > base ? C.text : C.muted, bg: true });
  });
  dayLabels(cv, F, data.length);
  return tr;
}
function draw3() {
  const b = num('b3');
  $('b3v').textContent = String(b);
  bars3('c3', 0, 'c3left');
  const tr = bars3('c3b', b, 'c3right');
  let txt = t('s3readout', { dHi: day(tr.iHi), hi: tr.hi, dLo: day(tr.iLo), lo: tr.lo, tr: fmt(tr.trueRatio), b, lh: tr.hi - b, ll: Math.max(0, tr.lo - b),
    sr: Number.isFinite(tr.seenRatio) ? t('s3times', { v: fmt(tr.seenRatio) }) : t('s3inf', { dLo: day(tr.iLo) }) });
  if (tr.vanished.length) txt += t('s3vanish', { b, days: days(tr.vanished) });
  $('r3').textContent = txt;
}

/* ---------- step 4: double bar chart ---------- */
const s4 = { marks: false };
function draw4() {
  const sel = num('d4'), w1 = M.W1, w2 = M.W2, cmp = M.compare(w1, w2);
  $('d4v').textContent = day(sel); $('marks4').setAttribute('aria-pressed', String(s4.marks));
  const cv = fitCanvas($('c4')), { ctx, W, H } = cv;
  const F = frame(W, w1.length, { T: 26, B: H - 36, top: 20, maxW: 120, fill: 0.84 });
  axis(cv, F, [0, 5, 10, 15, 20]);
  const bw = Math.min(26, F.slot * 0.34), off = bw / 2 + 1;
  ctx.save(); ctx.fillStyle = 'rgba(255,180,84,0.10)'; ctx.fillRect(F.x(sel) - F.slot / 2 + 2, F.T - 4, F.slot - 4, F.B - F.T + 4); ctx.restore();
  w1.forEach((v, i) => {
    rect(ctx, F.x(i) - off, F.y(v), F.B, bw, C.cyan);
    rect(ctx, F.x(i) + off, F.y(w2[i]), F.B, bw, C.violet);
    if (s4.marks) {
      const d = cmp.delta[i], x = F.x(i) + off;
      if (d > 0) rect(ctx, x, F.y(w2[i]), F.y(v), bw, C.green);
      if (d < 0) dashBox(ctx, x, F.y(v), F.y(w2[i]), bw, C.pink);
      ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x - bw / 2 - 2, F.y(v)); ctx.lineTo(x + bw / 2 + 2, F.y(v)); ctx.stroke(); ctx.restore();
    }
  });
  w1.forEach((v, i) => {
    const hi2 = Math.max(w2[i], s4.marks ? v : 0);
    label(cv, String(v), F.x(i) - off, F.y(v) - 6, { size: 11, bold: true, color: C.text, bg: true, alt: [-13] });
    label(cv, String(w2[i]), F.x(i) + off, F.y(hi2) - 6, { size: 11, bold: true, color: C.violet, bg: true, alt: [-13] });
  });
  dayLabels(cv, F, w1.length);
  const d = cmp.delta[sel], chg = d > 0 ? t('s4up', { d }) : d < 0 ? t('s4down', { d: -d }) : t('s4same');
  $('r4').textContent = t('s4readout', { day: day(sel), a: w1[sel], b: w2[sel], chg, t1: cmp.t1, t2: cmp.t2, up: cmp.up, down: cmp.down });
}

/* ---------- step 5: the mean line ---------- */
function draw5() {
  const h = num('h5'), data = M.W1, r = M.balance(data, h);
  $('h5v').textContent = fmt(h);
  const cv = fitCanvas($('c5')), { ctx, W, H } = cv;
  const F = frame(W, data.length, { T: 26, B: H - 36, top: 20, maxW: 52, R: 40 });
  axis(cv, F, [0, 5, 10, 15, 20]);
  data.forEach((v, i) => {
    rect(ctx, F.x(i), F.y(Math.min(v, h)), F.B, F.bw, C.cyan);
    if (v > h) rect(ctx, F.x(i), F.y(v), F.y(h), F.bw, C.orange);
    if (v < h) dashBox(ctx, F.x(i), F.y(h), F.y(v), F.bw, C.muted);
  });
  ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(F.L, F.y(h)); ctx.lineTo(W - F.R + 2, F.y(h)); ctx.stroke(); ctx.restore();
  label(cv, fmt(h), W - F.R + 6, F.y(h) + 4, { align: 'left', size: 13, bold: true, color: C.text });
  data.forEach((v, i) => label(cv, String(v), F.x(i), F.y(Math.max(v, h)) - 6, { size: 12, bold: true, color: C.text, bg: true }));
  dayLabels(cv, F, data.length);
  const verdict = Math.abs(r.excess - r.shortfall) < 1e-9 ? t('s5eq', { total: M.sum(data), mean: fmt(r.mean) }) : r.excess > r.shortfall ? t('s5up') : t('s5down');
  $('r5').textContent = t('s5readout', { h: fmt(h), ex: fmt(r.excess), sh: fmt(r.shortfall), verdict });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  $('d0').addEventListener('input', () => { $('v0').value = String(s0.data[num('d0')]); draw0(); });
  $('v0').addEventListener('input', () => { s0.data[num('d0')] = num('v0'); draw0(); });
  $('flip0').addEventListener('click', () => {
    s0.horiz = !s0.horiz; const from = s0.p, to = s0.horiz ? 1 : 0;
    animate('s0', 700, p => { s0.p = lerp(from, to, p); draw0(); });
  });
  $('reset0').addEventListener('click', () => { s0.data = M.W1.slice(); $('v0').value = String(s0.data[num('d0')]); draw0(); });
  $('u1').addEventListener('input', draw1);
  ['a2', 'b2'].forEach(id => $(id).addEventListener('input', draw2));
  $('sort2').addEventListener('click', () => {
    const cur = s2.pos.map((q, i) => lerp(s2.from[i], q, ease(s2.p)));
    s2.sorted = !s2.sorted; s2.from = cur; s2.pos = targetPos(); s2.p = 0;
    animate('s2', 800, p => { s2.p = p; draw2(); });
  });
  $('b3').addEventListener('input', draw3);
  $('d4').addEventListener('input', draw4);
  $('marks4').addEventListener('click', () => { s4.marks = !s4.marks; draw4(); });
  $('h5').addEventListener('input', draw5);

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
  window.refreshBars = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
