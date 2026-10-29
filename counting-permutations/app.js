/* counting-permutations: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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
function arrow(ctx, x1, y1, x2, y2, col, lw) { line(ctx, x1, y1, x2, y2, col, lw || 2); const a = Math.atan2(y2 - y1, x2 - x1), s = 6 + (lw || 2) * 1.6; ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - s * Math.cos(a - 0.4), y2 - s * Math.sin(a - 0.4)); ctx.lineTo(x2 - s * Math.cos(a + 0.4), y2 - s * Math.sin(a + 0.4)); ctx.closePath(); ctx.fill(); }
function curve(ctx, pts, col, lw) { if (!pts.length) return; ctx.strokeStyle = col; ctx.lineWidth = lw || 2; ctx.beginPath(); pts.forEach((p, i) => { i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.stroke(); }
function axes(ctx, L, col) { line(ctx, L.x, L.y, L.x, L.y + L.h, col || COL.grid, 1); line(ctx, L.x, L.y + L.h, L.x + L.w, L.y + L.h, col || COL.grid, 1); }
/* deterministic RNG so every run of a demo is repeatable */
function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let x = s; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
const TICKERS = [];
/* ticker(fn): fn(dtSeconds) returns false to stop. Stops when the tab is hidden. */
function ticker(fn) { let id = 0, last = 0, on = false; const o = { get running() { return on; }, start() { if (on) return; on = true; last = 0; const loop = ts => { if (!on) return; const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0.016; last = ts; if (fn(dt) === false) { on = false; return; } id = requestAnimationFrame(loop); }; id = requestAnimationFrame(loop); }, stop() { on = false; if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(id); } }; TICKERS.push(o); return o; }
function onHide() { TICKERS.forEach(x => x.stop()); }
function pointerXY(c, ev) { const r = c.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; }
function slider10(id, fn) { const e = $(id); e.addEventListener('input', () => { fn(+e.value / 10); const o = $(id + 'v'); if (o) o.textContent = (e.value / 10).toFixed(1); }); }

/* Model: counting with BigInt so factorials stay exact. All functions are pure. */
const fact = n => { let r = 1n; for (let i = 2n; i <= BigInt(n); i++) r *= i; return r; };
const perm = (n, k) => (k < 0 || k > n) ? 0n : fact(n) / fact(n - k);
const comb = (n, k) => (k < 0 || k > n) ? 0n : fact(n) / (fact(k) * fact(n - k));
const mulPrinciple = arr => arr.reduce((a, b) => a * b, 1);
const permutations = n => { if (n <= 1) return [[0].slice(0, n)]; const out = []; const rec = (cur, rest) => { if (!rest.length) { out.push(cur); return; } rest.forEach((x, i) => rec(cur.concat(x), rest.slice(0, i).concat(rest.slice(i + 1)))); }; rec([], Array.from({ length: n }, (_, i) => i)); return out; };
const birthdayNoMatch = n => { let p = 1; for (let i = 0; i < n; i++) p *= (365 - i) / 365; return p; };
const birthdayMatch = n => 1 - birthdayNoMatch(n);
const fmt = b => b.toLocaleString('en-US');
const f1 = v => (Math.round(v * 10) / 10).toFixed(1), f1p = v => (Math.round(v * 1000) / 10).toFixed(1);
const S = { a: 3, b: 2, c: 2, n1: 3, n2: 6, k2: 3, n3: 6, k3: 3, pre4: 0, n5: 23 };
const PAL = ['#67d7f9', '#f6a45b', '#74dfaa', '#b79cff', '#e0644e', '#f2d46b', '#8fb3c9', '#d98cc7'];
const PRESETS = [[49, 6, 'preLotto'], [52, 5, 'prePoker'], [10, 3, 'preCommittee']];
function render0() {
  const { ctx, w, h } = setup($('cv0')), a = S.a, b = S.b, c = S.c, n = mulPrinciple([a, b, c]), L = { x: 40, y: 12, w: w - 80, h: h - 40 }, cols = [L.x, L.x + L.w * 0.33, L.x + L.w * 0.66, L.x + L.w], lh = L.h / n;
  const yLeaf = i => L.y + lh * (i + 0.5), pos = { 0: [], 1: [], 2: [] };
  for (let i = 0; i < a; i++) for (let j = 0; j < b; j++) for (let k = 0; k < c; k++) { const idx = (i * b + j) * c + k; line(ctx, cols[2], yLeaf(((i * b + j) * c + (c - 1) / 2)), cols[3], yLeaf(idx), PAL[k % 8], 1.4); dot(ctx, cols[3], yLeaf(idx), Math.max(1.6, Math.min(4, lh * 0.35)), PAL[k % 8]); }
  for (let i = 0; i < a; i++) for (let j = 0; j < b; j++) { const y = yLeaf((i * b + j) * c + (c - 1) / 2), py = yLeaf(i * b * c + (b * c - 1) / 2); line(ctx, cols[1], py, cols[2], y, PAL[j % 8], 1.6); dot(ctx, cols[2], y, 3.5, PAL[j % 8]); }
  for (let i = 0; i < a; i++) { const y = yLeaf(i * b * c + (b * c - 1) / 2), ry = L.y + L.h / 2; line(ctx, cols[0], ry, cols[1], y, PAL[i % 8], 2); dot(ctx, cols[1], y, 4.5, PAL[i % 8]); } dot(ctx, cols[0], L.y + L.h / 2, 5, COL.ink);
  ['lblShirt', 'lblPants', 'lblShoes'].forEach((k, i) => text(ctx, t(k) + ' ×' + [a, b, c][i], (cols[i] + cols[i + 1]) / 2, h - 8, { align: 'center', size: 11 })); text(ctx, t('lblOutfits', { n: n }), cols[3], L.y - 1, { align: 'right', size: 12, color: COL.orange, bold: true });
  $('ro0').textContent = t('s0ro', { a: a, b: b, c: c, n: n });
}
function render1() {
  const { ctx, w, h } = setup($('cv1')), n = S.n1, total = fact(n);
  if (n <= 4) { const ps = permutations(n), cols = n === 4 ? 6 : 3, rows = Math.ceil(ps.length / cols), cw = (w - 16) / cols, ch = (h - 16) / rows, sz = Math.min(cw / (n + 1), ch * 0.7, 20);
    ps.forEach((p, i) => { const x0 = 8 + (i % cols) * cw + (cw - n * sz) / 2, y0 = 8 + Math.floor(i / cols) * ch + (ch - sz) / 2; p.forEach((v, q) => { ctx.fillStyle = PAL[v]; ctx.fillRect(x0 + q * sz, y0, sz - 2, sz - 2); }); }); }
  else { const L = { x: 40, y: 14, w: w - 56, h: h - 46 }; axes(ctx, L); const mx = 8, Y = v => L.y + L.h - Math.log10(v) / Math.log10(40320) * L.h, X = q => L.x + (q - 1 + 0.5) / mx * L.w;
    for (let q = 1; q <= mx; q++) { const v = Number(fact(q)), hh = L.y + L.h - Y(v); ctx.fillStyle = q === n ? COL.orange : '#2b6a85'; ctx.fillRect(X(q) - L.w / mx * 0.35, Y(v), L.w / mx * 0.7, hh); text(ctx, String(q), X(q), L.y + L.h + 14, { align: 'center', size: 10 }); text(ctx, fmt(fact(q)), X(q), Y(v) - 4, { align: 'center', size: 9, color: COL.ink }); } text(ctx, t('axLogCount'), L.x + 4, L.y + 10, { size: 11 }); }
  const steps = Array.from({ length: n }, (_, i) => n - i).join(' × '); $('ro1').textContent = t('s1ro', { n: n, steps: steps, total: fmt(total) });
}
function slotsPlot(ctx, w, h, n, k, withDiv) { const slots = k, bw = Math.min(60, (w - 24) / Math.max(1, slots) - 6), y0 = 30, total = perm(n, k);
  for (let i = 0; i < slots; i++) { const x = 12 + i * (bw + 6); ctx.fillStyle = PAL[i % 8]; ctx.globalAlpha = 0.85; ctx.fillRect(x, y0, bw, 46); ctx.globalAlpha = 1; text(ctx, String(n - i), x + bw / 2, y0 + 30, { align: 'center', size: 20, color: '#0a0e14', bold: true }); text(ctx, t('lblSlot', { i: i + 1 }), x + bw / 2, y0 - 6, { align: 'center', size: 10 }); if (i < slots - 1) text(ctx, '×', x + bw + 3, y0 + 30, { align: 'center', size: 14 }); }
  return { y0, total }; }
function render2() {
  const { ctx, w, h } = setup($('cv2')), n = S.n2, k = Math.min(S.k2, n); $('k2').max = n; const o = slotsPlot(ctx, w, h, n, k);
  text(ctx, k === 0 ? t('lblEmpty') : t('lblOrdered', { v: fmt(o.total) }), 12, o.y0 + 82, { size: 14, color: COL.orange, bold: true });
  const L = { x: 12, y: o.y0 + 100, w: w - 24, h: h - o.y0 - 116 }; const mx = Number(perm(n, Math.min(n, 8))) || 1; for (let q = 0; q <= n; q++) { const v = Number(perm(n, q)), ww = Math.max(2, Math.log10(v + 1) / Math.log10(mx + 1) * L.w), y = L.y + q * (L.h / (n + 1)); ctx.fillStyle = q === k ? COL.orange : '#2b6a85'; ctx.fillRect(L.x, y + 1, ww, L.h / (n + 1) - 3); }
  text(ctx, t('axLogPerm'), L.x, h - 4, { size: 10 }); $('ro2').textContent = t('s2ro', { n: n, k: k, f: Array.from({ length: k }, (_, i) => n - i).join(' × ') || '1', v: fmt(o.total), e: fmt(fact(n)) + ' / ' + fmt(fact(n - k)) });
}
function render3() {
  const { ctx, w, h } = setup($('cv3')), n = S.n3, k = Math.min(S.k3, n); $('k3').max = n; const pn = perm(n, k), c = comb(n, k), kf = fact(k), L = { x: 14, y: 40, w: w - 28, h: h - 80 };
  text(ctx, t('lblGridR', { rows: fmt(c) }), L.x, 14, { size: 12, color: COL.orange, bold: true }); text(ctx, t('lblGridC', { cols: fmt(kf) }), L.x, 30, { size: 12, color: COL.orange, bold: true });
  const rows = Number(c), cols = Number(kf), cw = L.w / cols, ch = Math.min(L.h / rows, 40); for (let r = 0; r < rows; r++) { for (let q = 0; q < cols; q++) { ctx.fillStyle = PAL[r % 8]; ctx.globalAlpha = 0.35 + 0.55 * ((q % 2) ? 0.7 : 1); ctx.fillRect(L.x + q * cw + 0.3, L.y + r * ch + 0.3, Math.max(0.6, cw - 0.6), Math.max(0.6, ch - 0.6)); } } ctx.globalAlpha = 1;
  text(ctx, t('lblRowNote'), L.x, h - 12, { size: 10 }); $('ro3').textContent = t('s3ro', { n: n, k: k, pn: fmt(pn), kf: fmt(kf), c: fmt(c), formula: fmt(pn) + ' / ' + fmt(kf) });
}
function render4() {
  const { ctx, w, h } = setup($('cv4')), [n, k, key] = PRESETS[S.pre4], c = comb(n, k), L = { x: 14, y: 20, w: w - 28, h: h - 56 }, pts = [[1, 'bm1'], [Number(comb(10, 3)), 'bm10'], [2598960, 'bm52'], [13983816, 'bm49'], [175223510, 'bmEuro']];
  const lg = v => Math.log10(v) / 9; pts.forEach(([v, k2], i) => { const y = L.y + i * (L.h / 5); ctx.fillStyle = '#2b6a85'; ctx.fillRect(L.x, y + 3, Math.max(2, lg(v) * L.w), L.h / 5 - 10); text(ctx, t(k2), L.x + 4, y + L.h / 10 + 3, { size: 11, color: COL.ink }); });
  const y = L.y + 5 * (L.h / 5) + 2; ctx.fillStyle = COL.orange; ctx.fillRect(L.x, y - 4, Math.max(2, lg(Number(c)) * L.w), 8); text(ctx, t('lblChosen', { n: n, k: k }), L.x, y + 18, { size: 11, color: COL.orange, bold: true });
  PRESETS.forEach((p, i) => { const b = $('pre' + i); b.classList.toggle('active', i === S.pre4); b.setAttribute('aria-pressed', i === S.pre4 ? 'true' : 'false'); });
  $('ro4').textContent = t('s4ro', { name: t(key), n: n, k: k, c: fmt(c), p: (1 / Number(c)).toExponential(2) });
}
function render5() {
  const { ctx, w, h } = setup($('cv5')), n = S.n5, L = { x: 40, y: 14, w: w - 56, h: h - 46 }, X = q => L.x + q / 60 * L.w, Y = p => L.y + L.h - p * L.h; axes(ctx, L);
  const pts = []; for (let q = 0; q <= 60; q++) pts.push([X(q), Y(birthdayMatch(q))]); curve(ctx, pts, COL.orange, 3); line(ctx, L.x, Y(0.5), L.x + L.w, Y(0.5), COL.muted, 1, [4, 4]);
  line(ctx, X(n), L.y, X(n), L.y + L.h, COL.cyan, 1.5, [4, 3]); dot(ctx, X(n), Y(birthdayMatch(n)), 6, COL.cyan); [0, 15, 30, 45, 60].forEach(q => text(ctx, q + '', X(q), L.y + L.h + 14, { align: 'center', size: 10 })); [0, 0.5, 1].forEach(p => text(ctx, f1p(p) + '%', L.x - 4, Y(p) + 3, { align: 'right', size: 10 }));
  text(ctx, t('axPeople'), L.x + L.w, L.y + L.h + 28, { align: 'right', size: 11 }); text(ctx, t('axPMatch'), L.x + 4, L.y + 10, { size: 11 });
  $('ro5').textContent = t('s5ro', { n: n, no: f1p(birthdayNoMatch(n)), yes: f1p(birthdayMatch(n)), pairs: n * (n - 1) / 2 });
}
function wire() {
  slider('a0', v => { S.a = v; render0(); }); slider('b0', v => { S.b = v; render0(); }); slider('c0', v => { S.c = v; render0(); }); slider('n1', v => { S.n1 = v; render1(); });
  slider('n2', v => { S.n2 = v; if (S.k2 > v) { S.k2 = v; $('k2').value = v; } render2(); }); slider('k2', v => { S.k2 = v; render2(); });
  slider('n3', v => { S.n3 = v; if (S.k3 > v) { S.k3 = v; $('k3').value = v; } render3(); }); slider('k3', v => { S.k3 = v; render3(); });
  PRESETS.forEach((p, i) => $('pre' + i).addEventListener('click', () => { S.pre4 = i; render4(); })); slider('n5', v => { S.n5 = v; render5(); });
}

/* boot */
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

if (typeof module !== 'undefined') module.exports = { fact, perm, comb, mulPrinciple, permutations, birthdayNoMatch, birthdayMatch };
