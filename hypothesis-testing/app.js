/* hypothesis-testing: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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

/* Model: exact binomial test of "the coin is fair" (H0: q = 0.5), two-sided p-value by the small-probability rule. Pure functions. */
const LF = [0]; for (let i = 1; i <= 500; i++) LF.push(LF[i - 1] + Math.log(i));
const pmf = (n, q, k) => { if (k < 0 || k > n) return 0; if (q <= 0) return k === 0 ? 1 : 0; if (q >= 1) return k === n ? 1 : 0; return Math.exp(LF[n] - LF[k] - LF[n - k] + k * Math.log(q) + (n - k) * Math.log(1 - q)); };
const pTwoSided = (n, k) => { const pk = pmf(n, 0.5, k); let s = 0; for (let j = 0; j <= n; j++) { const pj = pmf(n, 0.5, j); if (pj <= pk * (1 + 1e-9)) s += pj; } return Math.min(1, s); };
const rejectSet = (n, alpha) => { const out = []; for (let k = 0; k <= n; k++) if (pTwoSided(n, k) <= alpha + 1e-12) out.push(k); return out; };
const actualAlpha = (n, alpha) => rejectSet(n, alpha).reduce((s, k) => s + pmf(n, 0.5, k), 0);
const power = (n, q, alpha) => rejectSet(n, alpha).reduce((s, k) => s + pmf(n, q, k), 0);
const nForPower = (q, alpha, target) => { for (let n = 5; n <= 400; n++) if (power(n, q, alpha) >= target) return n; return null; };
function flips(n, q, R) { let k = 0; for (let i = 0; i < n; i++) if (R() < q) k++; return k; }
function pValues(runs, n, q, seed) { const R = rng(seed), p = []; for (let i = 0; i < runs; i++) p.push(pTwoSided(n, flips(n, q, R))); return p; }
const familywise = (m, a) => 1 - Math.pow(1 - a, m);
const f1 = v => (Math.round(v * 10) / 10).toFixed(1), f3 = v => (Math.round(v * 1000) / 1000).toFixed(3), pct = v => f1(v * 100);
const S = { ymax: 0.2, k0: 15, n0: 20, q1: 50, n1: 30, ps1: [], runs1: 0, seed1: 1, alpha2: 5, n2: 20, q3: 70, n3: 20, alpha3: 5, q4: 65, alpha4: 5, n4: 40, m5: 20, bonf5: false, seed5: 1, res5: null };
function pmfBars(ctx, L, n, q, hi, col) { const bw = L.w / (n + 1), pm = []; for (let k = 0; k <= n; k++) pm.push(pmf(n, q, k)); const mx = Math.max.apply(null, pm); pm.forEach((p, k) => { const hh = p / S.ymax * L.h; ctx.fillStyle = hi(k) ? COL.orange : col; ctx.fillRect(L.x + k * bw + 1, L.y + L.h - hh, Math.max(1, bw - 2), hh); }); return bw; }
function frameBars(ctx, w, h, n) { const L = { x: 14, y: 16, w: w - 28, h: h - 46 }; axes(ctx, L); const bw = L.w / (n + 1); [0, Math.round(n / 2), n].forEach(k => text(ctx, String(k), L.x + (k + 0.5) * bw, L.y + L.h + 14, { align: 'center', size: 10 })); text(ctx, t('axHeads'), L.x + L.w, L.y + L.h + 28, { align: 'right', size: 11 }); return L; }
function render0() {
  const { ctx, w, h } = setup($('cv0')), n = S.n0, k = S.k0, L = frameBars(ctx, w, h, n), p = pTwoSided(n, k); S.ymax = pmf(n, 0.5, Math.round(n / 2)) * 1.15; $('k0').max = n;
  const pk = pmf(n, 0.5, k); pmfBars(ctx, L, n, 0.5, j => pmf(n, 0.5, j) <= pk * (1 + 1e-9), '#2b6a85'); const bw = L.w / (n + 1); line(ctx, L.x + (k + 0.5) * bw, L.y, L.x + (k + 0.5) * bw, L.y + L.h, COL.cyan, 2, [4, 3]); text(ctx, t('lblObserved', { k: k }), L.x + (k + 0.5) * bw, L.y + 8, { align: k > n / 2 ? 'right' : 'left', size: 11, color: COL.cyan });
  $('ro0').textContent = t('s0ro', { n: n, k: k, p: f3(p), verdict: p <= 0.05 ? t('vReject') : t('vKeep') });
}
function runExps(k) { const n = S.n1, q = S.q1 / 100; S.ps1 = S.ps1.concat(pValues(k, n, q, S.seed1 * 1000 + S.runs1)); S.runs1 += k; }
function render1() {
  const { ctx, w, h } = setup($('cv1')), L = { x: 40, y: 14, w: w - 56, h: h - 46 }, ps = S.ps1, nb = 10, bins = new Array(nb).fill(0); ps.forEach(p => { bins[Math.min(nb - 1, Math.floor(p * nb))]++; }); const mx = Math.max(5, Math.max.apply(null, bins)) * 1.1, bw = L.w / nb; axes(ctx, L);
  bins.forEach((c, i) => { const hh = c / mx * L.h; ctx.fillStyle = i === 0 ? COL.orange : '#2b6a85'; ctx.fillRect(L.x + i * bw + 2, L.y + L.h - hh, bw - 4, hh); text(ctx, String(c), L.x + i * bw + bw / 2, L.y + L.h - hh - 4, { align: 'center', size: 10 }); text(ctx, (i / nb).toFixed(1), L.x + i * bw, L.y + L.h + 14, { size: 10 }); });
  if (ps.length) { const yl = L.y + L.h - ps.length / nb / mx * L.h; line(ctx, L.x, yl, L.x + L.w, yl, COL.cyan, 1.2, [4, 4]); text(ctx, t('lblUniform'), L.x + L.w, yl - 4, { align: 'right', size: 10, color: COL.cyan }); }
  text(ctx, t('axP'), L.x + L.w, L.y + L.h + 28, { align: 'right', size: 11 }); text(ctx, t('axCount'), L.x + 4, L.y + 10, { size: 11 });
  $('q1v').textContent = (S.q1 / 100).toFixed(2); const sig = ps.filter(p => p <= 0.05).length;
  $('ro1').textContent = ps.length ? t('s1ro', { runs: ps.length, n: S.n1, q: (S.q1 / 100).toFixed(2), sig: sig, pc: pct(sig / ps.length), kind: S.q1 === 50 ? t('kNull') : t('kAlt') }) : t('s1ro0', { n: S.n1, q: (S.q1 / 100).toFixed(2) });
}
function render2() {
  const { ctx, w, h } = setup($('cv2')), n = S.n2, a = S.alpha2 / 100, reg = new Set(rejectSet(n, a)), L = frameBars(ctx, w, h, n); S.ymax = pmf(n, 0.5, Math.round(n / 2)) * 1.15; pmfBars(ctx, L, n, 0.5, k => reg.has(k), '#2b6a85'); text(ctx, t('lblRegion'), L.x + 4, L.y + 10, { size: 11, color: COL.orange });
  const lowK = Array.from(reg).filter(k => k <= n / 2), edge = lowK.length ? Math.max.apply(null, lowK) : -1, act = actualAlpha(n, a); $('alpha2v').textContent = S.alpha2 + '%'; $('ro2').textContent = t('s2ro', { a: S.alpha2, n: n, reg: edge >= 0 ? t('regTxt', { lo: edge, hi: n - edge }) : t('none'), act: pct(act) });
}
function render3() {
  const { ctx, w, h } = setup($('cv3')), n = S.n3, q = S.q3 / 100, a = S.alpha3 / 100, reg = new Set(rejectSet(n, a)), L = frameBars(ctx, w, h, n); S.ymax = Math.max(pmf(n, 0.5, Math.round(n / 2)), pmf(n, q, Math.round(n * q))) * 1.15; const bw = L.w / (n + 1);
  for (let k = 0; k <= n; k++) { const p0 = pmf(n, 0.5, k), p1 = pmf(n, q, k); ctx.fillStyle = '#2b6a85'; ctx.fillRect(L.x + k * bw + 1, L.y + L.h - p0 / S.ymax * L.h, Math.max(1, bw / 2 - 1), p0 / S.ymax * L.h); ctx.fillStyle = reg.has(k) ? COL.green : COL.red; ctx.fillRect(L.x + k * bw + bw / 2, L.y + L.h - p1 / S.ymax * L.h, Math.max(1, bw / 2 - 1), p1 / S.ymax * L.h); }
  text(ctx, t('lblNullBar'), L.x + 4, L.y + 10, { size: 10, color: '#6fb0cf' }); text(ctx, t('lblAltBar'), L.x + 4, L.y + 24, { size: 10, color: COL.muted }); const pw = power(n, q, a);
  $('q3v').textContent = q.toFixed(2); $('alpha3v').textContent = S.alpha3 + '%'; $('ro3').textContent = t('s3ro', { q: q.toFixed(2), n: n, a: S.alpha3, beta: pct(1 - pw), pw: pct(pw), act: pct(actualAlpha(n, a)) });
}
function render4() {
  const { ctx, w, h } = setup($('cv4')), q = S.q4 / 100, a = S.alpha4 / 100, nmax = 200, L = { x: 40, y: 14, w: w - 56, h: h - 46 }, X = n => L.x + n / nmax * L.w, Y = p => L.y + L.h - p * L.h; axes(ctx, L);
  line(ctx, L.x, Y(0.8), L.x + L.w, Y(0.8), COL.muted, 1, [4, 4]); text(ctx, '80%', L.x - 4, Y(0.8) + 3, { align: 'right', size: 10 }); const pts = []; for (let n = 5; n <= nmax; n++) pts.push([X(n), Y(power(n, q, a))]); curve(ctx, pts, COL.orange, 2.2);
  line(ctx, X(S.n4), L.y, X(S.n4), L.y + L.h, COL.cyan, 1.5, [4, 3]); dot(ctx, X(S.n4), Y(power(S.n4, q, a)), 6, COL.cyan); [0, 50, 100, 150, 200].forEach(n => text(ctx, String(n), X(n), L.y + L.h + 14, { align: 'center', size: 10 })); [0, 0.5, 1].forEach(p => text(ctx, pct(p) + '%', L.x - 4, Y(p) + 3, { align: 'right', size: 10 }));
  text(ctx, t('axN'), L.x + L.w, L.y + L.h + 28, { align: 'right', size: 11 }); text(ctx, t('axPower'), L.x + 4, L.y + 10, { size: 11 }); const need = nForPower(q, a, 0.8);
  $('q4v').textContent = q.toFixed(2); $('alpha4v').textContent = S.alpha4 + '%'; $('ro4').textContent = t('s4ro', { q: q.toFixed(2), a: S.alpha4, n: S.n4, pw: pct(power(S.n4, q, a)), need: need === null ? '> 400' : need });
}
function run5() { const R = rng(S.seed5 * 7 + 3), m = S.m5, n = 20, a = S.bonf5 ? 0.05 / m : 0.05, hits = []; for (let i = 0; i < m; i++) { const p = pTwoSided(n, flips(n, 0.5, R)); if (p <= a + 1e-12) hits.push(i + 1); } S.res5 = { hits: hits, a: a, m: m }; S.seed5++; }
function render5() {
  const { ctx, w, h } = setup($('cv5')), m = S.m5, a0 = actualAlpha(20, 0.05), L = { x: 40, y: 14, w: w - 56, h: h * 0.4 }, X = q => L.x + (q - 1) / 99 * L.w, Y = p => L.y + L.h - p * L.h; axes(ctx, L);
  const pts = []; for (let q = 1; q <= 100; q++) pts.push([X(q), Y(familywise(q, a0))]); curve(ctx, pts, COL.orange, 2.5); const pts2 = []; for (let q = 1; q <= 100; q++) pts2.push([X(q), Y(familywise(q, Math.min(a0, actualAlpha(20, 0.05 / q))))]); curve(ctx, pts2, COL.green, 1.5);
  line(ctx, X(m), L.y, X(m), L.y + L.h, COL.cyan, 1.5, [4, 3]); dot(ctx, X(m), Y(familywise(m, a0)), 6, COL.cyan); [1, 25, 50, 75, 100].forEach(q => text(ctx, String(q), X(q), L.y + L.h + 14, { align: 'center', size: 10 })); text(ctx, t('axTests'), L.x + L.w, L.y + L.h + 28, { align: 'right', size: 11 }); text(ctx, t('axFam'), L.x + 4, L.y + 10, { size: 11 }); text(ctx, t('lblNoCorr'), L.x + L.w - 4, L.y + 24, { align: 'right', size: 10, color: COL.orange }); text(ctx, t('lblWithCorr'), L.x + L.w - 4, Y(0.05) - 6, { align: 'right', size: 10, color: COL.green });
  const gy = L.y + L.h + 48, cols = Math.min(m, 25), cw = (w - 28) / Math.min(m, 25); const res = S.res5; for (let i = 0; i < m; i++) { const x = 14 + (i % 25) * cw + cw / 2, y = gy + Math.floor(i / 25) * (cw + 2) + 8; const hit = res && res.m === m && res.hits.includes(i + 1); ctx.fillStyle = hit ? COL.red : '#2b6a85'; ctx.beginPath(); ctx.arc(x, y, Math.max(2, cw / 2 - 1.5), 0, 6.2832); ctx.fill(); }
  $('m5v').textContent = m; $('bonf5').classList.toggle('active', S.bonf5); $('bonf5').setAttribute('aria-pressed', S.bonf5 ? 'true' : 'false'); $('bonf5').textContent = t(S.bonf5 ? 'bonfOn' : 'bonfOff');
  $('ro5').textContent = res && res.m === m ? t('s5roRun', { m: m, hits: res.hits.length, a: f3(res.a), fam: pct(familywise(m, a0)) }) : t('s5ro', { m: m, a0: pct(a0), fam: pct(familywise(m, a0)) });
}
function wire() {
  slider('n0', v => { S.n0 = v; if (S.k0 > v) { S.k0 = v; $('k0').value = v; } render0(); }); slider('k0', v => { S.k0 = v; render0(); });
  $('q1').addEventListener('input', e => { S.q1 = +e.target.value; S.ps1 = []; S.runs1 = 0; render1(); }); slider('n1', v => { S.n1 = v; S.ps1 = []; S.runs1 = 0; render1(); });
  [10, 100, 1000].forEach(k => $('ex' + k).addEventListener('click', () => { runExps(k); render1(); })); $('rs1').addEventListener('click', () => { S.ps1 = []; S.runs1 = 0; render1(); });
  slider('alpha2', v => { S.alpha2 = v; render2(); }); slider('n2', v => { S.n2 = v; render2(); });
  slider('q3', v => { S.q3 = v; render3(); }); slider('n3', v => { S.n3 = v; render3(); }); slider('alpha3', v => { S.alpha3 = v; render3(); });
  slider('q4', v => { S.q4 = v; render4(); }); slider('alpha4', v => { S.alpha4 = v; render4(); }); slider('n4', v => { S.n4 = v; render4(); });
  slider('m5', v => { S.m5 = v; S.res5 = null; render5(); }); $('bonf5').addEventListener('click', () => { S.bonf5 = !S.bonf5; S.res5 = null; render5(); }); $('run5').addEventListener('click', () => { run5(); render5(); }); $('rs5').addEventListener('click', () => { S.res5 = null; S.seed5 = 1; render5(); });
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

if (typeof module !== 'undefined') module.exports = { pmf, pTwoSided, rejectSet, actualAlpha, power, nForPower, flips, pValues, familywise };
