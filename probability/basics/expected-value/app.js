/* expected-value: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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

/* Model: discrete games with payoffs and probabilities; expectation E = sum p*x. Pure functions only. */
const GAMES = [
  { id: 'gDie', out: [1, 2, 3, 4, 5, 6].map(v => ({ v: v, p: 1 / 6 })), price: 4 },
  { id: 'gCoin', out: [{ v: 2, p: 0.5 }, { v: 0, p: 0.5 }], price: 1.5 },
  { id: 'gRoulette', out: [{ v: 2, p: 18 / 38 }, { v: 0, p: 20 / 38 }], price: 1 },
  { id: 'gLotto', out: [{ v: 1000000, p: 1 / 13983816 }, { v: 0, p: 1 - 1 / 13983816 }], price: 2 }
];
const expect = out => out.reduce((s, o) => s + o.p * o.v, 0);
const variance = out => { const m = expect(out); return out.reduce((s, o) => s + o.p * (o.v - m) ** 2, 0); };
const netExpect = (out, price) => expect(out) - price;
function sampleGame(out, R) { const u = R(); let c = 0; for (const o of out) { c += o.p; if (u < c) return o.v; } return out[out.length - 1].v; }
function runAverages(out, n, seed) { const R = rng(seed), a = []; let s = 0; for (let i = 1; i <= n; i++) { s += sampleGame(out, R); a.push(s / i); } return a; }
function diceSumPmf(n) { let pm = [1]; for (let i = 0; i < n; i++) { const nx = new Array(pm.length + 6).fill(0); pm.forEach((p, k) => { for (let f = 1; f <= 6; f++) nx[k + f] += p / 6; }); pm = nx; } return pm.map((p, k) => ({ v: k, p: p })).filter(o => o.p > 0); }
const insured = (loss, p, premium) => [{ v: -premium, p: 1 }];
const uninsured = (loss, p) => [{ v: -loss, p: p }, { v: 0, p: 1 - p }];
const insurerProfit = (loss, p, premium) => premium - p * loss;
const stCapped = M => M + 1;
function stPlay(R, M) { let k = 1; while (R() >= 0.5 && k < 60) k++; return Math.min(Math.pow(2, k), Math.pow(2, M)); }
const stSim = (n, M, seed) => { const R = rng(seed), a = []; for (let i = 0; i < n; i++) a.push(stPlay(R, M)); return a; };
const f2 = v => (Math.round(v * 100) / 100).toFixed(2), f4 = v => (Math.round(v * 10000) / 10000).toFixed(4), money = v => Math.round(v).toLocaleString('en-US');
const S = { g: 0, price1: 4, trials: 0, seed2: 1, avg2: [], n3: 2, b3: 0, loss4: 200000, p4: 2, prem4: 1000, M5: 10, plays5: [] };
const g = () => GAMES[S.g];
function genAvg(n) { S.avg2 = runAverages(g().out, n, 5 + S.g); }
function render0() {
  const { ctx, w, h } = setup($('cv0')), G = g(), E = expect(G.out), out = G.out;
  text(ctx, t('lblTable'), 10, 18, { size: 11 }); out.slice(0, 6).forEach((o, i) => { const y = 38 + i * 20; text(ctx, money(o.v) + ' × ' + (o.p < 0.001 ? o.p.toExponential(2) : f4(o.p)) + ' = ' + (o.v * o.p < 0.001 && o.v * o.p > 0 ? (o.v * o.p).toExponential(2) : f4(o.v * o.p)), 10, y, { size: 12, color: COL.ink }); });
  const L = { x: 12, y: 38 + 6 * 20 + 12, w: w - 24, h: 30 }; ctx.fillStyle = '#101d2a'; ctx.fillRect(L.x, L.y, L.w, L.h); let x = L.x; const sc = L.w / Math.max(E * 1.15, 1e-9), pal = [COL.cyan, COL.orange, COL.green, COL.violet, COL.red, '#f2d46b'];
  out.forEach((o, i) => { const ww = o.p * o.v * sc; ctx.fillStyle = pal[i % 6]; ctx.fillRect(x, L.y, ww, L.h); x += ww; }); line(ctx, x, L.y - 4, x, L.y + L.h + 4, COL.ink, 2); text(ctx, 'E = ' + (E < 0.1 ? E.toFixed(4) : f2(E)), x - 4, L.y - 8, { align: 'right', size: 12, color: COL.ink, bold: true });
  text(ctx, t('lblStack'), L.x, L.y + L.h + 22, { size: 10 }); GAMES.forEach((q, i) => { const b = $('g' + i); b.classList.toggle('active', i === S.g); b.setAttribute('aria-pressed', i === S.g ? 'true' : 'false'); });
  $('ro0').textContent = t('s0ro', { game: t(G.id), E: E < 0.1 ? E.toFixed(4) : f2(E), expl: t(G.id + 'N') });
}
function render1() {
  $('price1v').textContent = S.price1.toFixed(1);
  const { ctx, w, h } = setup($('cv1')), G = g(), E = expect(G.out), price = S.price1 * (S.g === 3 ? 1 : 1), L = { x: 40, y: 14, w: w - 56, h: h - 46 }, pmax = Math.max(6, Math.ceil(E * 2)), X = c => L.x + c / pmax * L.w, net = c => E - c, nmin = -pmax, nmax = Math.max(E, 0.5) + 0.2, Y = v => L.y + L.h - (v - nmin) / (nmax - nmin) * L.h;
  axes(ctx, L); line(ctx, L.x, Y(0), L.x + L.w, Y(0), COL.muted, 1.5); curve(ctx, [[X(0), Y(net(0))], [X(pmax), Y(net(pmax))]], COL.orange, 3); const cc = Math.min(price, pmax); dot(ctx, X(cc), Y(net(cc)), 6, net(cc) >= 0 ? COL.green : COL.red);
  line(ctx, X(E), L.y, X(E), L.y + L.h, COL.cyan, 1.5, [4, 3]); text(ctx, t('lblFair', { E: E < 0.1 ? E.toFixed(3) : f2(E) }), Math.min(X(E) + 4, L.x + L.w - 90), L.y + 12, { size: 11, color: COL.cyan });
  [0, pmax / 2, pmax].forEach(c => text(ctx, f2(c).replace(/\.00$/, ''), X(c), L.y + L.h + 14, { align: 'center', size: 10 })); text(ctx, t('axPrice'), L.x + L.w, L.y + L.h + 28, { align: 'right', size: 11 }); text(ctx, t('axNet'), L.x + 4, L.y + 10, { size: 11 });
  const edge = E < price ? (price - E) / price * 100 : 0; $('ro1').textContent = t('s1ro', { game: t(G.id), price: f2(price), E: E < 0.1 ? E.toFixed(4) : f2(E), net: net(price).toFixed(Math.abs(net(price)) < 0.1 ? 4 : 2), verdict: net(price) > 1e-9 ? t('vGood') : net(price) < -1e-9 ? t('vBad') : t('vFair'), edge: f2(edge) });
}
function render2() {
  const { ctx, w, h } = setup($('cv2')), G = g(), E = expect(G.out), a = S.avg2, n = S.trials, L = { x: 44, y: 14, w: w - 60, h: h - 46 }, N = Math.max(50, n), sd = Math.sqrt(variance(G.out)), span = Math.max(sd * 2, 0.5), lo = E - span, hi = E + span, X = i => L.x + i / N * L.w, Y = v => L.y + L.h - (Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo) * L.h;
  axes(ctx, L); line(ctx, L.x, Y(E), L.x + L.w, Y(E), COL.cyan, 1.5, [5, 4]); text(ctx, 'E', L.x + L.w + 0, Y(E) + 4, { size: 11, color: COL.cyan });
  const pts = []; for (let i = 1; i <= n; i++) pts.push([X(i), Y(a[i - 1])]); curve(ctx, pts, COL.orange, 2); if (n > 1) { const band = []; for (let i = 5; i <= N; i += Math.max(1, Math.round(N / 80))) band.push([X(i), Y(E + 2 * sd / Math.sqrt(i))]); curve(ctx, band, '#35566b', 1.2); const b2 = []; for (let i = 5; i <= N; i += Math.max(1, Math.round(N / 80))) b2.push([X(i), Y(E - 2 * sd / Math.sqrt(i))]); curve(ctx, b2, '#35566b', 1.2); }
  text(ctx, t('axTrials'), L.x + L.w, L.y + L.h + 28, { align: 'right', size: 11 }); [0, N / 2, N].forEach(i => text(ctx, String(Math.round(i)), X(i), L.y + L.h + 14, { align: 'center', size: 10 })); [lo, E, hi].forEach(v => text(ctx, v.toFixed(Math.abs(v) < 10 ? 2 : 0), L.x - 4, Y(v) + 3, { align: 'right', size: 10 }));
  $('ro2').textContent = n ? t('s2ro', { n: n, avg: f4(a[n - 1]), E: E < 0.1 ? E.toFixed(4) : f2(E), err: f4(Math.abs(a[n - 1] - E)), se: f4(sd / Math.sqrt(n)) }) : t('s2ro0', { game: t(G.id) });
}
function render3() {
  const { ctx, w, h } = setup($('cv3')), n = S.n3, b = S.b3, pm = diceSumPmf(n), E = expect(pm), L = { x: 14, y: 20, w: w - 28, h: h - 52 }, vmax = 6 * n + Math.max(0, b), vmin = n + Math.min(0, b), span = vmax - vmin + 1, bw = L.w / span, pmx = Math.max.apply(null, pm.map(o => o.p)), X = v => L.x + (v - vmin + 0.5) * bw;
  pm.forEach(o => { const hh = o.p / pmx * L.h * 0.92; ctx.fillStyle = COL.cyan; ctx.fillRect(X(o.v + b) - bw / 2 + 1, L.y + L.h - hh, Math.max(1, bw - 2), hh); }); line(ctx, X(E + b), L.y, X(E + b), L.y + L.h, COL.orange, 2.5); text(ctx, 'E = ' + f2(E + b), X(E + b), L.y - 6, { align: 'center', size: 12, color: COL.orange, bold: true });
  [vmin, Math.round((vmin + vmax) / 2), vmax].forEach(v => text(ctx, String(v), X(v), L.y + L.h + 14, { align: 'center', size: 10 }));
  $('ro3').textContent = t('s3ro', { n: n, b: b, E: f2(E + b), each: f2(3.5), sum: f2(3.5 * n + b) });
}
function render4() {
  $('loss4v').textContent = Math.round(S.loss4 / 1000) + 'k'; $('p4v').textContent = (S.p4 / 10).toFixed(1) + '%';
  const { ctx, w, h } = setup($('cv4')), loss = S.loss4, p = S.p4 / 1000, prem = S.prem4, un = uninsured(loss, p), inn = insured(loss, p, prem), L = { x: 14, y: 20, w: w - 28, h: h - 52 };
  const xs = v => L.x + (v + loss) / loss * (L.w - 20) + 10; [['lblNoIns', un, COL.orange, 0], ['lblIns', inn, COL.cyan, 1]].forEach(([lab, d, col, row]) => { const y = L.y + row * (L.h / 2); text(ctx, t(lab), L.x, y + 12, { size: 11, color: col }); d.forEach(o => { const bh = Math.max(3, o.p * (L.h / 2 - 34)); ctx.fillStyle = col; ctx.fillRect(xs(o.v) - 5, y + L.h / 2 - 18 - bh, 10, bh); text(ctx, money(o.v), xs(o.v), y + L.h / 2 - 4, { align: 'center', size: 10 }); }); });
  const eu = expect(un), ei = expect(inn); $('ro4').textContent = t('s4ro', { loss: money(loss), p: S.p4 / 10, prem: money(prem), eu: money(eu), ei: money(ei), su: money(Math.sqrt(variance(un))), si: money(Math.sqrt(variance(inn))), prof: money(insurerProfit(loss, p, prem)) });
}
function render5() {
  const { ctx, w, h } = setup($('cv5')), M = S.M5, L = { x: 44, y: 14, w: w - 60, h: h - 46 }, X = m => L.x + (m - 1) / 39 * L.w, Y = v => L.y + L.h - v / 42 * L.h; axes(ctx, L);
  curve(ctx, [[X(1), Y(2)], [X(40), Y(41)]], COL.orange, 3); line(ctx, X(M), L.y, X(M), L.y + L.h, COL.cyan, 1.5, [4, 3]); dot(ctx, X(M), Y(stCapped(M)), 6, COL.orange);
  [1, 10, 20, 30, 40].forEach(m => text(ctx, String(m), X(m), L.y + L.h + 14, { align: 'center', size: 10 })); [0, 20, 40].forEach(v => text(ctx, String(v), L.x - 4, Y(v) + 3, { align: 'right', size: 10 })); text(ctx, t('axBank'), L.x + L.w, L.y + L.h + 28, { align: 'right', size: 11 }); text(ctx, t('axFair'), L.x + 4, L.y + 10, { size: 11 });
  const pl = S.plays5; if (pl.length) { const sorted = pl.slice().sort((a, b) => a - b), med = sorted[Math.floor(pl.length / 2)], avg = pl.reduce((s, v) => s + v, 0) / pl.length; $('ro5').textContent = t('s5ro1', { M: M, bank: money(Math.pow(2, M)), E: stCapped(M), n: pl.length, avg: f2(avg), med: money(med), mx: money(Math.max.apply(null, pl)) }); }
  else $('ro5').textContent = t('s5ro0', { M: M, bank: money(Math.pow(2, M)), E: stCapped(M) });
}
function wire() {
  GAMES.forEach((q, i) => $('g' + i).addEventListener('click', () => { S.g = i; S.price1 = q.price; $('price1').value = q.price * 10; S.trials = 0; S.avg2 = []; render0(); render1(); render2(); }));
  $('price1').addEventListener('input', e => { S.price1 = +e.target.value / 10; $('price1v').textContent = S.price1.toFixed(1); render1(); });
  [1, 100, 1000].forEach(k => $('pl' + k).addEventListener('click', () => { const nn = Math.min(5000, S.trials + k); S.trials = nn; genAvg(5000); render2(); })); $('rs2').addEventListener('click', () => { S.trials = 0; S.avg2 = []; render2(); });
  slider('n3', v => { S.n3 = v; render3(); }); slider('b3', v => { S.b3 = v; render3(); });
  $('loss4').addEventListener('input', e => { S.loss4 = +e.target.value * 1000; render4(); }); $('p4').addEventListener('input', e => { S.p4 = +e.target.value; render4(); }); slider('prem4', v => { S.prem4 = v; render4(); });
  slider('M5', v => { S.M5 = v; S.plays5 = []; render5(); }); $('st100').addEventListener('click', () => { S.plays5 = S.plays5.concat(stSim(100, S.M5, 11 + S.plays5.length)); render5(); }); $('st1000').addEventListener('click', () => { S.plays5 = S.plays5.concat(stSim(1000, S.M5, 17 + S.plays5.length)); render5(); }); $('rs5').addEventListener('click', () => { S.plays5 = []; render5(); });
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

if (typeof module !== 'undefined') module.exports = { GAMES, expect, variance, netExpect, runAverages, diceSumPmf, uninsured, insured, insurerProfit, stCapped, stSim };
