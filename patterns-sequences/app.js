/* patterns-sequences: geometry -> counted segments (pure) -> render. Totals are counted from segments, never hard-coded. */
const SQ3 = Math.sqrt(3);
const COL = { cyan: '#67d7f9', orange: '#f6a45b', green: '#74dfaa', grey: '#8aa0ad', ink: '#eaf4f8', muted: '#a8bac4', grid: '#294052', head: '#e0644e' };

/* Vertices (unit coordinates) of shape i in a chain; consecutive vertices form its sides. */
function shapeVerts(kind, i) {
  if (kind === 'sq') return [[i, 0], [i, 1], [i + 1, 1], [i + 1, 0]];
  if (kind === 'tri') { const v = j => [j * 0.5, j % 2 === 0 ? 0 : SQ3 / 2]; return [v(i), v(i + 1), v(i + 2)]; }
  const cx = i * SQ3, pts = [150, 210, 270, 330, 30, 90].map(a => [cx + Math.cos(a * Math.PI / 180), Math.sin(a * Math.PI / 180)]);
  return pts;
}
const keyOf = (a, b) => { const f = p => p[0].toFixed(4) + ',' + p[1].toFixed(4); const ka = f(a), kb = f(b); return ka < kb ? ka + '|' + kb : kb + '|' + ka; };
/* Chain of n shapes; a side shared by two neighbours is one stick. */
function buildPattern(kind, n) {
  const segs = [], seen = new Set();
  for (let i = 0; i < n; i++) {
    const v = shapeVerts(kind, i);
    for (let j = 0; j < v.length; j++) {
      const a = v[j], b = v[(j + 1) % v.length], k = keyOf(a, b);
      if (!seen.has(k)) { seen.add(k); segs.push({ a, b, shape: i }); }
    }
  }
  return segs;
}
const countSticks = (kind, n) => buildPattern(kind, n).length;
const stepOf = kind => countSticks(kind, 2) - countSticks(kind, 1);
/* Group label per stick: 'base' = the starter, otherwise the index of the shape that added it. */
function decompose(kind, n) {
  const segs = buildPattern(kind, n), baseN = countSticks(kind, 1) - stepOf(kind);
  return segs.map((s, idx) => ({ ...s, group: idx < baseN ? 'base' : s.shape }));
}
const stairRows = n => Array.from({ length: n }, (_, i) => i + 1);
const stairTotal = n => stairRows(n).reduce((s, r) => s + r, 0);
const stepsList = n => stairRows(n).slice(1);
const solveSquares = S => { const q = (S - 1) / 3; return { n: q, whole: Number.isInteger(q) && q >= 1 }; };

/* ---------- canvas helpers ---------- */
function setup(c) {
  const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
  const w = Math.max(200, Math.round(c.getBoundingClientRect().width || 300));
  const ratio = (w >= 560 && c.dataset.wide) ? +c.dataset.wide : +c.dataset.ratio;
  const h = Math.round(w * ratio);
  c.style.height = h + 'px';
  const bw = Math.round(w * dpr), bh = Math.round(h * dpr);
  if (c.width !== bw) c.width = bw;
  if (c.height !== bh) c.height = bh;
  const ctx = c.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  return { ctx, w, h };
}
const extentCache = {};
function extent(kind, nMax) {
  const k = kind + nMax;
  if (!extentCache[k]) {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    buildPattern(kind, nMax).forEach(s => [s.a, s.b].forEach(p => { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }));
    extentCache[k] = { x0, y0, w: x1 - x0, h: y1 - y0 };
  }
  return extentCache[k];
}
/* Draw sticks as matches (body + red head), scaled to the chain of nMax shapes so growth is visible. */
function drawSticks(ctx, segs, box, kind, nMax, colorOf, labelOf) {
  const e = extent(kind, nMax), sc = Math.min(box.w / e.w, box.h / e.h), lw = Math.max(3, Math.min(7, sc * 0.09));
  const ox = box.x + (box.w - e.w * sc) / 2 - e.x0 * sc, oy = box.y + (box.h + e.h * sc) / 2 + e.y0 * sc;
  const P = p => [ox + p[0] * sc, oy - p[1] * sc];
  segs.forEach((s, idx) => {
    const a = P(s.a), b = P(s.b), col = colorOf(s, idx);
    ctx.lineCap = 'round'; ctx.strokeStyle = col; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    ctx.fillStyle = COL.head; ctx.beginPath(); ctx.arc(a[0], a[1], lw * 0.9, 0, 6.2832); ctx.fill();
    const lab = labelOf && labelOf(s, idx);
    if (lab) { ctx.fillStyle = COL.ink; ctx.font = '600 ' + Math.max(10, Math.min(13, sc * 0.2)) + 'px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(lab, (a[0] + b[0]) / 2 + (b[1] === a[1] ? 0 : 10), (a[1] + b[1]) / 2 + (b[1] === a[1] ? -10 : 0)); }
  });
}
function panels(w, h) { return w >= 560 ? [{ x: 8, y: 8, w: w / 2 - 14, h: h - 16 }, { x: w / 2 + 6, y: 8, w: w / 2 - 14, h: h - 16 }] : [{ x: 8, y: 6, w: w - 16, h: h * 0.44 }, { x: 8, y: h * 0.5, w: w - 16, h: h * 0.48 }]; }
function text(ctx, s, x, y, o) { o = o || {}; ctx.fillStyle = o.color || COL.muted; ctx.font = (o.bold ? '600 ' : '') + (o.size || 13) + 'px system-ui,sans-serif'; ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.base || 'alphabetic'; ctx.fillText(s, x, y); }

/* ---------- state ---------- */
const S = { n0: 3, k0: -1, timer0: null, n1: 1, n2: 4, big2: 100, kind3: 'sq', n3: 4, n4: 4, s5: 301 };
const $ = id => document.getElementById(id);
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const stop0 = () => { if (S.timer0) { clearInterval(S.timer0); S.timer0 = null; } };

/* ---------- step 0 ---------- */
function render0() {
  const { ctx, w, h } = setup($('cv0')), segs = buildPattern('sq', S.n0), total = segs.length;
  drawSticks(ctx, segs, { x: 12, y: 12, w: w - 24, h: h - 24 }, 'sq', 8, (s, i) => i < S.k0 ? COL.orange : COL.cyan, (s, i) => i < S.k0 ? String(i + 1) : '');
  $('n0v').textContent = S.n0;
  $('ro0').textContent = S.k0 < 0 ? t('s0ro', { n: S.n0, total }) : S.k0 >= total ? t('s0roDone', { total }) : t('s0roCount', { k: S.k0, total });
}
function count0() {
  stop0(); const total = countSticks('sq', S.n0); S.k0 = 0;
  if (reduceMotion()) { S.k0 = total; render0(); return; }
  S.timer0 = setInterval(() => { S.k0++; if (S.k0 >= total) stop0(); render0(); }, 160); render0();
}
function reset0() { stop0(); S.k0 = -1; render0(); }

/* ---------- step 1 ---------- */
function render1() {
  const { ctx, w, h } = setup($('cv1')), n = S.n1, segs = buildPattern('sq', n), total = segs.length;
  drawSticks(ctx, segs, { x: 12, y: 8, w: w - 24, h: h * 0.5 }, 'sq', 9, s => (n > 1 && s.shape === n - 1) ? COL.orange : COL.cyan);
  const cw = (w - 24) / 9;
  for (let k = 1; k <= n; k++) {
    const x = 12 + (k - 0.5) * cw, c = countSticks('sq', k);
    text(ctx, String(c), x, h * 0.74, { align: 'center', size: 15, bold: true, color: k === n ? COL.orange : COL.ink });
    text(ctx, String(k), x, h * 0.84, { align: 'center', size: 11 });
    if (k > 1) {
      const d = c - countSticks('sq', k - 1), xm = x - cw / 2;
      ctx.strokeStyle = COL.green; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(xm, h * 0.74 - 6, cw * 0.38, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
      text(ctx, '+' + d, xm, h * 0.74 - cw * 0.38 - 10, { align: 'center', size: 12, color: COL.green, bold: true });
    }
  }
  text(ctx, 'n', 6, h * 0.84, { size: 11 });
  const d = n > 1 ? total - countSticks('sq', n - 1) : 0;
  $('ro1').textContent = n === 1 ? t('s1ro1') : t('s1ro', { n, total, d, prev: total - d }) + (n >= 3 ? ' ' + t('s1roSame', { d }) : '');
  $('add1').disabled = n >= 9;
}

/* ---------- step 2 ---------- */
function render2() {
  const { ctx, w, h } = setup($('cv2')), n = S.n2, segs = decompose('sq', n), total = segs.length;
  const pal = [COL.cyan, COL.orange, COL.green];
  drawSticks(ctx, segs, { x: 12, y: 8, w: w - 24, h: h * 0.62 }, 'sq', 10, s => s.group === 'base' ? COL.grey : pal[s.group % 3]);
  text(ctx, '1 + 3 × ' + n + ' = ' + total, w / 2, h * 0.9, { align: 'center', size: Math.max(15, Math.min(22, w / 22)), bold: true, color: COL.ink });
  $('n2v').textContent = n;
  const N = Math.max(1, Math.min(2000, Math.round(+$('big2').value) || 1));
  $('ro2').textContent = t('s2ro', { n, total }) + ' ' + t('s2roBig', { n: N, total: 1 + 3 * N, check: countSticks('sq', N) });
}

/* ---------- step 3 ---------- */
const KINDS = ['sq', 'tri', 'hex'], KIND_KEY = { sq: 'kSq', tri: 'kTri', hex: 'kHex' }, KIND_COL = { sq: COL.cyan, tri: COL.green, hex: COL.orange };
function render3() {
  const { ctx, w, h } = setup($('cv3')), kind = S.kind3, n = S.n3, [pf, pp] = panels(w, h), segs = buildPattern(kind, n);
  drawSticks(ctx, segs, pf, kind, 10, () => KIND_COL[kind]);
  const L = { x: pp.x + 38, y: pp.y + 8, w: pp.w - 50, h: pp.h - 44 }, ymax = 52, X = v => L.x + v / 10 * L.w, Y = v => L.y + L.h - v / ymax * L.h;
  ctx.strokeStyle = COL.grid; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(L.x, L.y); ctx.lineTo(L.x, L.y + L.h); ctx.lineTo(L.x + L.w, L.y + L.h); ctx.stroke();
  [0, 10, 20, 30, 40, 50].forEach(v => { text(ctx, String(v), L.x - 6, Y(v) + 4, { align: 'right', size: 11 }); if (v) { ctx.beginPath(); ctx.moveTo(L.x, Y(v)); ctx.lineTo(L.x + L.w, Y(v)); ctx.strokeStyle = '#1b2d3c'; ctx.stroke(); } });
  [1, 5, 10].forEach(v => text(ctx, String(v), X(v), L.y + L.h + 15, { align: 'center', size: 11 }));
  text(ctx, t('axisN'), L.x + L.w, L.y + L.h + 31, { align: 'right', size: 11 });
  text(ctx, t('axisSticks'), L.x - 30, L.y - 1, { size: 11 });
  KINDS.forEach(k => {
    const pts = Array.from({ length: 10 }, (_, i) => [i + 1, countSticks(k, i + 1)]);
    ctx.globalAlpha = k === kind ? 1 : 0.3; ctx.strokeStyle = KIND_COL[k]; ctx.lineWidth = k === kind ? 2 : 1.2; ctx.beginPath();
    pts.forEach((p, i) => i ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1]))); ctx.stroke();
    pts.forEach(p => { ctx.fillStyle = KIND_COL[k]; ctx.beginPath(); ctx.arc(X(p[0]), Y(p[1]), p[0] === n && k === kind ? 6 : 3, 0, 6.2832); ctx.fill(); });
    ctx.globalAlpha = 1;
  });
  const total = segs.length;
  ctx.setLineDash([4, 4]); ctx.strokeStyle = COL.muted; ctx.beginPath(); ctx.moveTo(X(n), Y(total)); ctx.lineTo(X(n), L.y + L.h); ctx.stroke(); ctx.setLineDash([]);
  text(ctx, String(total), X(n), Y(total) - 10, { align: 'center', bold: true, color: COL.ink });
  $('n3v').textContent = n;
  KINDS.forEach(k => { const b = $('k3' + k); b.classList.toggle('active', k === kind); b.setAttribute('aria-pressed', k === kind ? 'true' : 'false'); });
  $('ro3').textContent = t('s3ro', { kind: t(KIND_KEY[kind]), n, total, d: stepOf(kind) });
}

/* ---------- step 4 ---------- */
function render4() {
  const { ctx, w, h } = setup($('cv4')), n = S.n4, [ps, pb] = panels(w, h), rows = stairRows(n), total = stairTotal(n);
  const r = Math.min(ps.w / 11, ps.h / 10.5, 13);
  rows.forEach((len, i) => { for (let j = 0; j < len; j++) { ctx.fillStyle = i === n - 1 ? COL.orange : COL.cyan; ctx.beginPath(); ctx.arc(ps.x + 14 + j * r * 2.2, ps.y + 12 + i * r * 2.2, r * 0.8, 0, 6.2832); ctx.fill(); } });
  const B = { x: pb.x + 6, y: pb.y + 22, w: pb.w - 12, h: pb.h - 52 }, cw = B.w / 9, tmax = stairTotal(9);
  for (let k = 1; k <= 9; k++) {
    const T = stairTotal(k), bh = T / tmax * B.h, x = B.x + (k - 0.5) * cw;
    ctx.fillStyle = k <= n ? (k === n ? COL.orange : COL.cyan) : '#1b2d3c'; ctx.fillRect(x - cw * 0.34, B.y + B.h - bh, cw * 0.68, bh);
    if (k <= n) { text(ctx, String(T), x, B.y + B.h - bh - 4, { align: 'center', size: 11, color: COL.ink, bold: true }); if (k > 1) text(ctx, '+' + k, x, B.y + B.h + 14, { align: 'center', size: 11, color: COL.green, bold: true }); }
    text(ctx, String(k), x, B.y + B.h + 28, { align: 'center', size: 10 });
  }
  text(ctx, 'n', B.x - 2, B.y + B.h + 28, { size: 10 });
  $('n4v').textContent = n;
  $('ro4').textContent = t('s4ro', { n, total, d: n, list: stepsList(n).map(d => '+' + d).join(', ') });
  $('note4').textContent = t('s4roLine');
}

/* ---------- step 5 ---------- */
function render5() {
  const Sv = Math.max(1, Math.min(100000, Math.round(+$('s5').value) || 1)), r = solveSquares(Sv);
  $('ro5').textContent = Sv < 4 ? t('s5roLow', { s: Sv }) : r.whole ? t('s5roOk', { s: Sv, n: r.n }) : t('s5roNo', { s: Sv, q: (Math.round(r.n * 100) / 100).toString() });
}

function renderAll() { render0(); render1(); render2(); render3(); render4(); render5(); }
function boot() {
  initLang();
  document.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
  $('n0').addEventListener('input', e => { stop0(); S.k0 = -1; S.n0 = +e.target.value; render0(); });
  $('count0').addEventListener('click', count0); $('reset0').addEventListener('click', reset0);
  $('add1').addEventListener('click', () => { if (S.n1 < 9) S.n1++; render1(); });
  $('reset1').addEventListener('click', () => { S.n1 = 1; render1(); });
  $('n2').addEventListener('input', e => { S.n2 = +e.target.value; render2(); });
  $('big2').addEventListener('input', render2);
  KINDS.forEach(k => $('k3' + k).addEventListener('click', () => { S.kind3 = k; render3(); }));
  $('n3').addEventListener('input', e => { S.n3 = +e.target.value; render3(); });
  $('n4').addEventListener('input', e => { S.n4 = +e.target.value; render4(); });
  $('s5').addEventListener('input', render5);
  window.addEventListener('langchange', renderAll);
  let raf = 0; window.addEventListener('resize', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(renderAll); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop0(); });
  const links = [...document.querySelectorAll('.step-nav a')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) { const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id)); }), { rootMargin: '-30% 0px -60%' }); steps.forEach(s => io.observe(s)); }
  renderAll();
}
if (typeof document !== 'undefined' && document.getElementById('cv0')) boot();
if (typeof module !== 'undefined') module.exports = { buildPattern, countSticks, stepOf, decompose, stairTotal, stairRows, stepsList, solveSquares };
