/* place-value: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
const COL = { cyan: '#67d7f9', orange: '#f6a45b', green: '#74dfaa', red: '#e0644e', violet: '#b79cff', ink: '#eaf4f8', muted: '#a8bac4', grid: '#294052', dim: '#1b2d3c' };
const $ = id => document.getElementById(id);
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
  return { ctx, w, h, wide: w >= 560 };
}
function text(ctx, s, x, y, o) { o = o || {}; ctx.fillStyle = o.color || COL.muted; ctx.font = (o.bold ? '600 ' : '') + (o.size || 13) + 'px system-ui,sans-serif'; ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.base || 'alphabetic'; ctx.fillText(s, x, y); }
function line(ctx, x1, y1, x2, y2, col, lw, dash) { ctx.strokeStyle = col; ctx.lineWidth = lw || 1; ctx.setLineDash(dash || []); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.setLineDash([]); }
function dot(ctx, x, y, r, col) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill(); }
function slider(id, fn) { const e = $(id); e.addEventListener('input', () => { fn(+e.value); const o = $(id + 'v'); if (o) o.textContent = e.value; }); }
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* digits are least-significant first: d[0] = ones */
const toDigits = (n, len) => Array.from({ length: len || 4 }, (_, i) => Math.floor(n / Math.pow(10, i)) % 10);
const value = d => d.reduce((s, v, i) => s + v * Math.pow(10, i), 0);
function addAt(d, col) { const r = d.slice(), carries = []; r[col]++; for (let c = col; c < r.length; c++) if (r[c] === 10) { if (c + 1 >= r.length) return null; r[c] = 0; r[c + 1]++; carries.push(c); } return { d: r, carries }; }
const expand = d => { const parts = []; for (let i = d.length - 1; i >= 0; i--) if (d[i] > 0 || i === 0 && !parts.length) parts.push(d[i] + ' × ' + Math.pow(10, i)); return parts.join(' + '); };
/* First place (from the left) where two equal-length digit arrays differ; -1 if equal. */
const firstDiff = (a, b) => { for (let i = a.length - 1; i >= 0; i--) if (a[i] !== b[i]) return i; return -1; };
const shiftTimes10 = n => n * 10;
const S = { d1: [0, 0, 0, 0], carried: [], timer: null, drop: false };
const COLS = ['col0', 'col1', 'col2', 'col3'], BEAD = [COL.cyan, COL.green, COL.orange, COL.violet];
function abacus(ctx, box, d, hi, opts) { opts = opts || {}; const n = d.length, cw = box.w / n, rodH = box.h - 40, bead = Math.min(cw * 0.3, rodH / 11);
  for (let i = n - 1; i >= 0; i--) { const col = n - 1 - i, cx = box.x + (col + 0.5) * cw; line(ctx, cx, box.y + 6, cx, box.y + 6 + rodH, hi && hi.includes(i) ? COL.orange : COL.grid, hi && hi.includes(i) ? 4 : 3);
    for (let b = 0; b < d[i]; b++) { const y = box.y + 6 + rodH - bead * 0.6 - b * bead * 1.05; ctx.fillStyle = opts.zeroGhost && d[i] === 0 ? COL.dim : BEAD[i]; ctx.beginPath(); ctx.ellipse(cx, y, bead * 0.95, bead * 0.5, 0, 0, 6.2832); ctx.fill(); }
    text(ctx, t(COLS[i]), cx, box.y + box.h - 22, { align: 'center', size: 11 }); text(ctx, String(Math.pow(10, i)), cx, box.y + box.h - 6, { align: 'center', size: 11, color: COL.ink, bold: true });
    if (opts.digits !== false) text(ctx, String(d[i]), cx, box.y + 4, { align: 'center', size: 13, color: BEAD[i], bold: true }); } }
function render0() { const { ctx, w, h } = setup($('cv0')), d = [3, 2, 1, 0].map(i => +$('d' + i).value); [0, 1, 2, 3].forEach(i => $('d' + i + 'v').textContent = $('d' + i).value);
  abacus(ctx, { x: 4, y: 12, w: w - 8, h: h - 16 }, d, null); const n = value(d); $('ro0').textContent = t('s0ro', { n, expr: expand(d) }); }
function render1() { const { ctx, w, h } = setup($('cv1')), d = S.d1; abacus(ctx, { x: 4, y: 12, w: w - 8, h: h - 16 }, d, S.carried.concat(S.carried.map(c => c + 1))); const n = value(d);
  $('ro1').textContent = n >= 9999 ? t('s1roFull') : S.carried.length ? t('s1roCarry', { c: S.carried.length, n, digits: expand(d) }) : t('s1ro', { n, digits: expand(d) }); }
function add1(col) { const r = addAt(S.d1, col); if (r) { S.d1 = r.d; S.carried = r.carries; } render1(); return !!r; }
const stop1 = () => { if (S.timer) { clearInterval(S.timer); S.timer = null; } }; const onHide = stop1;
function cubes(ctx, x, y, s, pos) { const c = s; if (pos === 0) { ctx.fillStyle = COL.cyan; ctx.fillRect(x, y, c, c); return c; } if (pos === 1) { for (let i = 0; i < 10; i++) { ctx.fillStyle = COL.green; ctx.fillRect(x, y + i * c, c - 0.6, c - 0.6); } return c; } for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) { ctx.fillStyle = COL.orange; ctx.fillRect(x + j * c, y + i * c, c - 0.5, c - 0.5); } return c * 10; }
function render2() { const { ctx, w, h } = setup($('cv2')), d = +$('dg2').value, p = +$('ps2').value; $('dg2v').textContent = d; $('ps2v').textContent = p; const pv = Math.pow(10, p);
  const wid = [1, 1, 10][p], hei = [1, 10, 10][p], gap = 8, cell = Math.max(2, Math.min((w - 16 - gap * (d - 1)) / (d * wid), (h - 20) / hei, 18)); let x = (w - (d * wid * cell + (d - 1) * gap)) / 2; const y = (h - hei * cell) / 2;
  for (let i = 0; i < d; i++) { cubes(ctx, x, y, cell, p); x += wid * cell + gap; }
  $('ro2').textContent = t('s2ro', { d, col: t(COLS[p]), pv, v: d * pv }); }
function render3() { const { ctx, w, h } = setup($('cv3')), hh = +$('h3').value, te = +$('te3').value, o = +$('o3').value; ['h3', 'te3', 'o3'].forEach(id => $(id + 'v').textContent = $(id).value);
  const d = [o, te, hh, 0], n = value(d), canDrop = te === 0; $('drop3').disabled = !canDrop || S.drop; $('keep3').disabled = !S.drop; if (!canDrop) S.drop = false;
  const half = w / 2; abacus(ctx, { x: 4, y: 12, w: S.drop ? half - 8 : w - 8, h: h - 16 }, [o, te, hh], null, { digits: true });
  if (S.drop) { abacus(ctx, { x: half + 4, y: 12, w: half - 8, h: h - 16 }, [o, hh], null); const n2 = hh * 10 + o; $('ro3').textContent = t('s3roDrop', { n, n2, diff: n - n2 }); }
  else $('ro3').textContent = canDrop ? t('s3ro', { n, expr: expand(d), tens: te }) : t('s3ro', { n, expr: expand(d), tens: te }) + ' ' + t('s3roNoZero'); }
function render4() { const { ctx, w, h } = setup($('cv4')), A = +$('A4').value, B = +$('B4').value; $('A4v').textContent = A; $('B4v').textContent = B; const da = toDigits(A), db = toDigits(B), fd = firstDiff(da, db), cw = (w - 40) / 4;
  [[da, 0, 'A'], [db, 1, 'B']].forEach(([d, row, nm]) => { text(ctx, nm, 8, h * 0.45 + row * h * 0.3, { size: 16, color: COL.ink, bold: true });
    for (let i = 3; i >= 0; i--) { const col = 3 - i, x = 32 + col * cw, y = h * 0.28 + row * h * 0.3, hl = i === fd, same = fd === -1 || i > fd; ctx.fillStyle = hl ? COL.orange : same ? '#3a4b58' : COL.dim; ctx.fillRect(x + 3, y, cw - 6, h * 0.24); text(ctx, String(d[i]), x + cw / 2, y + h * 0.17, { align: 'center', size: Math.min(26, h * 0.14), bold: true, color: hl ? '#0a0e14' : COL.ink }); if (!row) text(ctx, t(COLS[i]), x + cw / 2, h * 0.2, { align: 'center', size: 11 }); } });
  $('ro4').textContent = fd === -1 ? t('s4roEq') : t('s4ro', { col: t(COLS[fd]), a: da[fd], b: db[fd], rel: t(da[fd] > db[fd] ? 'relA' : 'relB') }); }
function render5() { const { ctx, w, h } = setup($('cv5')), n = +$('N5').value; $('N5v').textContent = n; const rows = [n, n * 10, n * 100], cw = (w - 70) / 5; for (let c = 0; c < 5; c++) text(ctx, t(['col4', 'col3', 'col2', 'col1', 'col0'][c]), 60 + (c + 0.5) * cw, 16, { align: 'center', size: 10 });
  rows.forEach((v, r) => { const ds = String(v).padStart(5, ' '); text(ctx, ['N', '×10', '×100'][r], 6, 48 + r * h * 0.27, { size: 13, color: COL.ink }); for (let c = 0; c < 5; c++) { const ch = ds[c]; if (ch === ' ') continue; const zero = c >= 5 - r && ch === '0' && r > 0; ctx.fillStyle = zero ? COL.dim : '#243846'; ctx.fillRect(60 + c * cw + 2, 28 + r * h * 0.27, cw - 4, h * 0.2); text(ctx, ch, 60 + (c + 0.5) * cw, 28 + r * h * 0.27 + h * 0.14, { align: 'center', size: Math.min(24, h * 0.12), bold: true, color: zero ? COL.orange : COL.ink }); } });
  $('ro5').textContent = t('s5ro', { n, n10: n * 10, n100: n * 100 }); }
function wire() {
  [0, 1, 2, 3].forEach(i => slider('d' + i, render0));
  $('add1').addEventListener('click', () => { stop1(); add1(0); }); $('add10').addEventListener('click', () => { stop1(); add1(1); }); $('add100').addEventListener('click', () => { stop1(); add1(2); });
  $('auto1').addEventListener('click', () => { stop1(); let k = 0; if (reduceMotion()) { for (; k < 10; k++) if (!add1(0)) break; return; } S.timer = setInterval(() => { if (k++ >= 10 || !add1(0)) stop1(); }, 380); });
  $('reset1').addEventListener('click', () => { stop1(); S.d1 = [0, 0, 0, 0]; S.carried = []; render1(); });
  slider('dg2', render2); slider('ps2', render2); ['h3', 'te3', 'o3'].forEach(id => slider(id, () => { S.drop = false; render3(); }));
  $('drop3').addEventListener('click', () => { S.drop = true; render3(); }); $('keep3').addEventListener('click', () => { S.drop = false; render3(); });
  slider('A4', render4); slider('B4', render4); slider('N5', render5);
}

const RENDERS = [typeof render0 === 'function' && render0, typeof render1 === 'function' && render1, typeof render2 === 'function' && render2, typeof render3 === 'function' && render3, typeof render4 === 'function' && render4, typeof render5 === 'function' && render5].filter(Boolean);
function renderAll() { RENDERS.forEach(f => f()); }
function boot() {
  initLang();
  document.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
  wire();
  window.addEventListener('langchange', renderAll);
  let raf = 0; window.addEventListener('resize', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(renderAll); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && typeof onHide === 'function') onHide(); });
  const links = [...document.querySelectorAll('.step-nav a')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) { const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id)); }), { rootMargin: '-30% 0px -60%' }); steps.forEach(s => io.observe(s)); }
  renderAll();
}
if (typeof document !== 'undefined' && document.getElementById('ro0')) boot();
if (typeof module !== 'undefined') module.exports = { toDigits,value,addAt,expand,firstDiff,shiftTimes10 };
