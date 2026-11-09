/* stocks-bonds: pure model -> state -> render. Numbers shown are computed from the model at runtime. */

const COL = { cyan: '#67d7f9', orange: '#f6a45b', green: '#74dfaa', red: '#e0644e', violet: '#b79cff', ink: '#eaf4f8', muted: '#a8bac4', grid: '#294052', dim: '#1b2d3c' };
const $ = id => document.getElementById(id);
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
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); c._dpr = dpr; c._labels = [];
  ctx.clearRect(0, 0, w, h);
  return { ctx, w, h, wide: w >= 560 };
}
// Canvas labels (2026-11-09 canvas text survey): within one drawing pass a label that would overlap one already
// drawn on the same canvas moves a line down or up, and every label is kept inside the canvas. o.mw caps the width
// (fillText maxWidth); o.free draws exactly at (x, y). Rotated or scaled text is drawn as given.
let labelTurn = 0, labelTick = false;
function text(ctx, s, x, y, o) {
  o = o || {}; ctx.fillStyle = o.color || COL.muted; ctx.font = (o.bold ? '600 ' : '') + (o.size || 13) + 'px system-ui,sans-serif'; ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.base || 'alphabetic';
  const c = ctx.canvas, T = ctx.getTransform(), d = c._dpr || 1;
  if (!o.free && String(s).trim() && T.b === 0 && T.c === 0 && Math.abs(T.a - d) < 1e-6 && Math.abs(T.d - d) < 1e-6) {
    if (!labelTick) { labelTick = true; queueMicrotask(() => { labelTurn++; labelTick = false; }); }
    if (c._labelTurn !== labelTurn) { c._labelTurn = labelTurn; c._labels = []; }
    const m = ctx.measureText(s), sq = o.mw && m.width > o.mw ? o.mw / m.width : 1, W = c.width / d, H = c.height / d, ox = T.e / d, oy = T.f / d;
    const b = { l: x - m.actualBoundingBoxLeft * sq + ox, r: x + m.actualBoundingBoxRight * sq + ox, t: y - m.actualBoundingBoxAscent + oy, b: y + m.actualBoundingBoxDescent + oy };
    const dx = b.l < 2 ? 2 - b.l : b.r > W - 2 ? Math.max(2 - b.l, W - 2 - b.r) : 0, dy = b.t < 2 ? 2 - b.t : b.b > H - 2 ? Math.max(2 - b.t, H - 2 - b.b) : 0;
    x += dx; y += dy; b.l += dx; b.r += dx; b.t += dy; b.b += dy;
    const lh = b.b - b.t + 3, hit = (q, e) => q.s !== s || Math.abs(q.l - b.l) > 1 || Math.abs(q.t - b.t) > 1 ? Math.min(q.r, b.r) - Math.max(q.l, b.l) > 2 && Math.min(q.b, b.b + e) - Math.max(q.t, b.t + e) > 2 : false;
    const e = [0, lh, -lh, 2 * lh, -2 * lh, 3 * lh, -3 * lh].find(e => b.t + e >= 2 && b.b + e <= H - 2 && !c._labels.some(q => hit(q, e))) || 0;
    y += e; c._labels.push({ s, l: b.l, r: b.r, t: b.t + e, b: b.b + e });
  }
  if (o.mw) ctx.fillText(s, x, y, o.mw); else ctx.fillText(s, x, y);
}
function line(ctx, x1, y1, x2, y2, col, lw, dash) { ctx.strokeStyle = col; ctx.lineWidth = lw || 1; ctx.setLineDash(dash || []); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.setLineDash([]); }
function dot(ctx, x, y, r, col) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill(); }
function slider(id, fn) { const e = $(id); e.addEventListener('input', () => { fn(+e.value); const o = $(id + 'v'); if (o) o.textContent = e.value; }); }
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function arrow(ctx, x1, y1, x2, y2, col, lw) { line(ctx, x1, y1, x2, y2, col, lw || 2); const a = Math.atan2(y2 - y1, x2 - x1), s = 6 + (lw || 2) * 1.6; ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - s * Math.cos(a - 0.4), y2 - s * Math.sin(a - 0.4)); ctx.lineTo(x2 - s * Math.cos(a + 0.4), y2 - s * Math.sin(a + 0.4)); ctx.closePath(); ctx.fill(); }
function curve(ctx, pts, col, lw) { if (!pts.length) return; ctx.strokeStyle = col; ctx.lineWidth = lw || 2; ctx.beginPath(); pts.forEach((p, i) => { i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.stroke(); }
function axes(ctx, L, col) { line(ctx, L.x, L.y, L.x + L.h, col || COL.grid, 1); line(ctx, L.x, L.y + L.h, L.x + L.w, L.y + L.h, col || COL.grid, 1); }
function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let x = s; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
const TICKERS = [];
function ticker(fn) { let id = 0, last = 0, on = false; const o = { get running() { return on; }, start() { if (on) return; on = true; last = 0; const loop = ts => { if (!on) return; const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0.016; last = ts; if (fn(dt) === false) { on = false; return; } id = requestAnimationFrame(loop); }; id = requestAnimationFrame(loop); }, stop() { on = false; if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(id); } }; TICKERS.push(o); return o; }
function onHide() { TICKERS.forEach(x => x.stop()); }
const money = v => Math.round(v).toLocaleString('en-US');

/* Model: toy shop, toy currency units. Pure functions exported for tests. */
const bondCoupon = (P, cp) => P * cp / 100;
const waterfall = a => ({ lenders: Math.min(a, 1000), holders: Math.max(0, a - 1000) });
const toyPrice = (buyers, sellers) => Math.max(10, Math.round(100 * (1 + (buyers - sellers) / 200)));
const S = { mode: 'stock', sh1: 10, pr1: 10, cp2: 5, yr2: 5, as3: 1200, by4: 60, se4: 40 };
// Split s into lines no wider than maxW (words for Latin text, characters for CJK).
function wrapLines(ctx, s, maxW) {
  const tokens = s.match(/[\u3000-\u9fff\uff00-\uffef][，。、：；）]?|[^\s\u3000-\u9fff\uff00-\uffef]+\s*|\s+/g) || [s], out = [];
  let cur = '';
  tokens.forEach(tk => { if (cur && ctx.measureText(cur + tk).width > maxW) { out.push(cur.trimEnd()); cur = tk.trimStart(); } else cur += tk; });
  if (cur.trim()) out.push(cur.trimEnd());
  return out;
}
function card(ctx, x, y, w, h, title, rows, active, col) {
  ctx.strokeStyle = active ? col : COL.grid; ctx.lineWidth = active ? 3 : 1.5;
  ctx.strokeRect(x, y, w, h);
  text(ctx, title, x + 12, y + 24, { bold: true, size: 14, color: active ? col : COL.muted });
  // Rows wrap inside the card: unwrapped they ran into the neighbouring card on phones.
  ctx.font = '12px system-ui,sans-serif'; let yy = y + 46;
  rows.forEach(r => { wrapLines(ctx, r, w - 24).forEach(l => { text(ctx, l, x + 12, yy, { size: 12 }); yy += 16; }); yy += 4; });
}
// Two cards side by side on wide canvases, stacked on narrow ones.
function twoCards(ctx, w, h, m, a, b) {
  if (w >= 520) { const bw = (w - 48) / 2; card(ctx, 16, m, bw, h - 2 * m, ...a); card(ctx, 32 + bw, m, bw, h - 2 * m, ...b); }
  else { const bh = (h - 2 * m - 12) / 2; card(ctx, 16, m, w - 32, bh, ...a); card(ctx, 16, m + bh + 12, w - 32, bh, ...b); }
}
function render0() {
  const { ctx, w, h } = setup($('cv0'));
  twoCards(ctx, w, h, 20, [t('lblStockId'), [t('btnStock'), '100 ' + t('lblShares') + ' x 10 = 1000'], S.mode === 'stock', COL.cyan], [t('lblBondId'), [t('btnBond'), '1000 + ' + t('lblCoupon')], S.mode === 'bond', COL.orange]);
  $('b0stock').classList.toggle('active', S.mode === 'stock');
  $('b0bond').classList.toggle('active', S.mode === 'bond');
  $('ro0').textContent = S.mode === 'stock' ? t('s0roStock') : t('s0roBond');
}
function render1() {
  const { ctx, w, h } = setup($('cv1'));
  const L = { x: 16, y: 40, w: w - 32, h: h - 80 };
  const sw = L.w * S.sh1 / 100;
  ctx.fillStyle = COL.cyan; ctx.fillRect(L.x, L.y, sw, 56);
  ctx.fillStyle = '#2b6a85'; ctx.fillRect(L.x + sw, L.y, L.w - sw, 56);
  text(ctx, t('lblYourSlice') + ' ' + S.sh1 + '%', L.x + 6, L.y + 76, { size: 12, color: COL.cyan });
  // "Other shareholders" sits at the right end of its part; it moves above the bar when the two names would meet.
  ctx.font = '12px system-ui,sans-serif'; const restUp = L.x + 6 + ctx.measureText(t('lblYourSlice') + ' ' + S.sh1 + '%').width + 12 > L.x + L.w - 6 - ctx.measureText(t('lblRest')).width;
  text(ctx, t('lblRest'), L.x + L.w - 6, restUp ? L.y - 8 : L.y + 76, { size: 12, align: 'right' });
  $('ro1').textContent = t('s1ro', { sh: S.sh1, pct: S.sh1, div: money(S.sh1 * 5), pr: S.pr1, val: money(S.sh1 * S.pr1) });
}
function render2() {
  const { ctx, w, h } = setup($('cv2'));
  const y = S.yr2, c = bondCoupon(1000, S.cp2);
  const L = { x: 56, y: 30, w: w - 72, h: h - 70 };
  axes(ctx, L);
  const X = k => L.x + k / y * L.w, Y = v => L.y + L.h - (v + 1000) / 2200 * L.h;
  line(ctx, L.x, Y(0), L.x + L.w, Y(0), COL.muted, 1, [4, 4]);
  const pts = [[X(0), Y(-1000)]];
  for (let k = 1; k <= y; k++) pts.push([X(k), Y(k === y ? c + 1000 : c)]);
  curve(ctx, pts, COL.orange, 2.5);
  dot(ctx, X(0), Y(-1000), 5, COL.red); text(ctx, t('lblLend') + ' 1000', X(0) + 4, Y(-1000) - 8, { size: 11, color: COL.red });
  for (let k = 1; k <= y; k++) { dot(ctx, X(k), Y(k === y ? c + 1000 : c), 4, COL.orange); text(ctx, k + '', X(k), L.y + L.h + 14, { align: 'center', size: 10 }); }
  text(ctx, t('lblCoupon') + ' ' + money(c), X(y) - 4, Y(c + 1000) - 10, { align: 'right', size: 11, color: COL.orange });
  text(ctx, t('lblPrincipal') + ' 1000', X(y) - 4, Y(c + 1000) + 20, { align: 'right', size: 11, color: COL.cyan });
  $('ro2').textContent = t('s2ro', { cp: S.cp2, c: money(c), y: y, tot: money(c * y), all: money(c * y + 1000) });
}
function render3() {
  const { ctx, w, h } = setup($('cv3'));
  const a = S.as3, f = waterfall(a);
  const L = { x: 16, y: 40, w: w - 32, h: 64 };
  const X = v => L.x + v / 2000 * L.w;
  ctx.fillStyle = COL.cyan; ctx.fillRect(L.x, L.y, X(f.lenders) - L.x, L.h);
  ctx.fillStyle = COL.orange; ctx.fillRect(X(f.lenders), L.y, X(a) - X(f.lenders), L.h);
  line(ctx, X(1000), L.y - 10, X(1000), L.y + L.h + 10, COL.ink, 1.5, [4, 3]);
  text(ctx, t('lblClaim'), X(1000), L.y - 14, { align: 'center', size: 11, color: COL.ink });
  text(ctx, t('lblLenders') + ' ' + money(f.lenders), L.x + 6, L.y + L.h + 20, { size: 12, color: COL.cyan });
  // Shareholders' amount starts where their part starts, but never on top of the lenders' amount.
  ctx.font = '12px system-ui,sans-serif'; const hx = Math.max(X(f.lenders) + 6, L.x + 6 + ctx.measureText(t('lblLenders') + ' ' + money(f.lenders)).width + 14);
  text(ctx, t('lblHolders') + ' ' + money(f.holders), Math.min(hx, L.x + L.w - ctx.measureText(t('lblHolders') + ' ' + money(f.holders)).width), L.y + L.h + 20, { size: 12, color: COL.orange });
  const msg = a === 0 ? t('s3msgZero') : (a >= 1000 ? t('s3msgFull') : t('s3msgPart'));
  $('ro3').textContent = t('s3ro', { a: money(a), b: money(f.lenders), s: money(f.holders), msg: msg });
}
function render4() {
  const { ctx, w, h } = setup($('cv4'));
  const p = toyPrice(S.by4, S.se4), d = S.by4 - S.se4;
  const L = { x: 16, y: 30, w: w - 32 };
  const bw = L.w / 2 - 8;
  ctx.fillStyle = COL.cyan; ctx.fillRect(L.x, L.y, bw * S.by4 / 100, 44);
  ctx.fillStyle = COL.orange; ctx.fillRect(L.x + bw + 16, L.y, bw * S.se4 / 100, 44);
  text(ctx, t('lblBuyers') + ' ' + S.by4, L.x, L.y + 62, { size: 12, color: COL.cyan });
  text(ctx, t('lblSellers') + ' ' + S.se4, L.x + bw + 16, L.y + 62, { size: 12, color: COL.orange });
  const dir = d > 0 ? 1 : (d < 0 ? -1 : 0);
  if (dir !== 0) arrow(ctx, w / 2, L.y + 110, w / 2, L.y + 110 + (dir > 0 ? -36 : 36), dir > 0 ? COL.green : COL.red, 3);
  text(ctx, t('lblToyPrice') + ' ' + p, w / 2, L.y + 150, { align: 'center', size: 15, bold: true, color: COL.ink });
  const dirT = d > 0 ? t('s4dirUp') : (d < 0 ? t('s4dirDown') : t('s4dirFlat'));
  $('ro4').textContent = t('s4ro', { b: S.by4, s: S.se4, d: Math.abs(d), p: p, dir: dirT });
}
function render5() {
  const { ctx, w, h } = setup($('cv5'));
  twoCards(ctx, w, h, 16, [t('lblStockId'), [t('lblIdentity') + ': ' + t('lblStockId'), t('lblOrder') + ': ' + t('lblStockOrder'), t('lblReturn') + ': ' + t('lblStockRet')], true, COL.cyan], [t('lblBondId'), [t('lblIdentity') + ': ' + t('lblBondId'), t('lblOrder') + ': ' + t('lblBondOrder'), t('lblReturn') + ': ' + t('lblBondRet')], true, COL.orange]);
}
function wire() {
  $('b0stock').addEventListener('click', () => { S.mode = 'stock'; render0(); });
  $('b0bond').addEventListener('click', () => { S.mode = 'bond'; render0(); });
  slider('sh1', v => { S.sh1 = v; render1(); }); slider('pr1', v => { S.pr1 = v; render1(); });
  slider('cp2', v => { S.cp2 = v; render2(); }); slider('yr2', v => { S.yr2 = v; render2(); });
  slider('as3', v => { S.as3 = v; render3(); });
  slider('by4', v => { S.by4 = v; render4(); }); slider('se4', v => { S.se4 = v; render4(); });
}
const RENDERS = [render0, render1, render2, render3, render4, render5];
function renderAll() { RENDERS.forEach(f => f()); }
function boot() {
  initLang();
  document.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
  wire();
  window.addEventListener('langchange', renderAll);
  let raf = 0; window.addEventListener('resize', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(renderAll); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) onHide(); });
  const links = [...document.querySelectorAll('.step-nav a')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) { const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id)); }), { rootMargin: '-30% 0px -60%' }); steps.forEach(s => io.observe(s)); }
  renderAll();
}
if (typeof document !== 'undefined' && document.getElementById('ro0')) boot();
if (typeof module !== 'undefined') module.exports = { bondCoupon, waterfall, toyPrice };
