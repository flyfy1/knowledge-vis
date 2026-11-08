/* mean-median-mode: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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

const SALARY = [3, 3, 3, 4, 4, 5, 5, 6, 40];
const mean = a => a.reduce((s, v) => s + v, 0) / a.length;
const sortAsc = a => a.slice().sort((x, y) => x - y);
const median = a => { const s = sortAsc(a), n = s.length, m = Math.floor(n / 2); return n % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
/* All modes (values with the highest count); empty if every value occurs once. */
function modes(a) { const c = {}; a.forEach(v => { c[v] = (c[v] || 0) + 1; }); const mx = Math.max.apply(null, Object.values(c)); if (mx === 1) return []; return Object.keys(c).filter(k => c[k] === mx).map(Number).sort((x, y) => x - y); }
function parseList(s) { const v = String(s).split(/[\s,\uFF0C;]+/).filter(Boolean).map(Number); return (v.length >= 3 && v.length <= 15 && v.every(x => isFinite(x))) ? v : null; }
const SCENARIOS = [{ id: 'scSal', data: SALARY, best: 'bSal', why: 'wSal', bi: 1 }, { id: 'scShoe', data: [37, 38, 38, 39, 39, 39, 40, 40, 41, 42, 42, 43], best: 'bShoe', why: 'wShoe', bi: 2 }, { id: 'scScore', data: [72, 75, 78, 80, 81, 83, 85, 88, 90], best: 'bScore', why: 'wScore', bi: 0 }];
const SETS = [[2, 4, 4, 7, 9], [1, 3, 4, 6, 8, 20], [1, 1, 2, 2, 3, 4, 30]];
const fmt = v => String(Math.round(v * 100) / 100);
const modeText = a => { const m = modes(a); return m.length ? m.join(', ') : t('noMode'); };
const INIT2 = [4, 4, 6, 7, 7, 7, 9];
const S = { data2: INIT2.slice(), set3: 0, sc: 0, pick: -1, rev: false };
function dotPlot(ctx, box, data, lo, hi, marks, rowStep) { const X = v => box.x + (v - lo) / (hi - lo) * box.w, y0 = box.y + box.h * 0.62; line(ctx, box.x, y0, box.x + box.w, y0, COL.muted, 2); const step = Math.max(1, Math.round((hi - lo) / 10)); for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) { line(ctx, X(v), y0 - 4, X(v), y0 + 4, COL.muted, 1); text(ctx, String(v), X(v), y0 + 17, { align: 'center', size: 10 }); }
  const stack = {}; data.forEach(v => { const k = String(v), n = (stack[k] = (stack[k] || 0) + 1); dot(ctx, X(v), y0 - 8 - (n - 1) * (rowStep || 13), 5.5, COL.cyan); });
  marks.forEach(m => { const x = X(m.v); line(ctx, x, box.y + 6, x, y0 + 4, m.col, 2.5, m.dash); text(ctx, m.label, x, box.y + 4 + (m.row || 0) * 13, { align: 'center', size: 11, color: m.col, bold: true }); }); return X; }
function render0() { const { ctx, w, h } = setup($('cv0')), d = SALARY, m = mean(d), md = median(d), mo = modes(d); dotPlot(ctx, { x: 20, y: 10, w: w - 40, h: h - 10 }, d, 0, 45, [{ v: m, col: COL.green, label: t('mMean'), row: 0 }, { v: md, col: COL.orange, label: t('mMed'), row: 1 }].concat(mo.map(v => ({ v, col: COL.violet, label: t('mMode'), row: 2 }))), 12);
  $('ro0').textContent = t('s0ro', { sum: d.reduce((s, v) => s + v, 0), n: d.length, mean: fmt(m), k: (d.length + 1) / 2, med: md, mode: modeText(d) }); }
function render1() { const { ctx, w, h, wide } = setup($('cv1')), o = +$('o1').value; $('o1v').textContent = o; const d = [3, 3, 3, 4, 4, 5, 5, 6, o], m = mean(d), md = median(d);
  const L = { x: 38, y: 14, w: w - 54, h: h - 44 }, X = v => L.x + (v - 6) / 94 * L.w, ymax = 40, Y = v => L.y + L.h - v / ymax * L.h; line(ctx, L.x, L.y, L.x, L.y + L.h, COL.grid, 1); line(ctx, L.x, L.y + L.h, L.x + L.w, L.y + L.h, COL.grid, 1); [0, 10, 20, 30, 40].forEach(v => text(ctx, String(v), L.x - 4, Y(v) + 4, { align: 'right', size: 10 })); [6, 50, 100].forEach(v => text(ctx, String(v), X(v), L.y + L.h + 14, { align: 'center', size: 10 }));
  ctx.strokeStyle = COL.green; ctx.lineWidth = 2.5; ctx.beginPath(); for (let v = 6; v <= 100; v += 2) { const y = Y(mean([3, 3, 3, 4, 4, 5, 5, 6, v])); v > 6 ? ctx.lineTo(X(v), y) : ctx.moveTo(X(v), y); } ctx.stroke(); line(ctx, L.x, Y(4), L.x + L.w, Y(4), COL.orange, 2.5); line(ctx, L.x, Y(3), L.x + L.w, Y(3), COL.violet, 2, [5, 4]);
  text(ctx, t('mMean'), L.x + L.w - 2, Y(mean([3, 3, 3, 4, 4, 5, 5, 6, 100])) + 14, { align: 'right', size: 11, color: COL.green, bold: true }); text(ctx, t('mMed'), L.x + L.w - 2, Y(4) - 6, { align: 'right', size: 11, color: COL.orange, bold: true }); text(ctx, t('mMode'), L.x + L.w - 2, Y(3) + 14, { align: 'right', size: 11, color: COL.violet, bold: true }); line(ctx, X(o), L.y, X(o), L.y + L.h, COL.muted, 1, [3, 4]); dot(ctx, X(o), Y(m), 6, COL.green);
  $('ro1').textContent = t('s1ro', { o, mean: fmt(m), med: md, mode: modeText(d), diff: fmt(m - md) }); }
function render2() { const { ctx, w, h } = setup($('cv2')), d = S.data2, v = +$('v2').value; $('v2v').textContent = v; const L = { x: 30, y: 14, w: w - 44, h: h - 40 }, cnt = {}; d.forEach(x => { cnt[x] = (cnt[x] || 0) + 1; }); const mx = Math.max(3, Math.max.apply(null, Object.values(cnt).concat([0]))), md = modes(d), bw = L.w / 10;
  line(ctx, L.x, L.y + L.h, L.x + L.w, L.y + L.h, COL.grid, 1); for (let k = 1; k <= 10; k++) { const c = cnt[k] || 0, hh = c / mx * L.h; ctx.fillStyle = md.includes(k) ? COL.violet : COL.cyan; ctx.fillRect(L.x + (k - 1) * bw + 4, L.y + L.h - hh, bw - 8, hh); if (c) text(ctx, String(c), L.x + (k - 0.5) * bw, L.y + L.h - hh - 4, { align: 'center', size: 11, color: COL.ink, bold: true }); text(ctx, String(k), L.x + (k - 0.5) * bw, L.y + L.h + 14, { align: 'center', size: 11, color: k === v ? COL.orange : COL.muted, bold: k === v }); }
  $('rem2').disabled = d.length === 0; $('ro2').textContent = d.length ? t('s2ro', { n: d.length, list: sortAsc(d).join(', '), c: Math.max.apply(null, Object.values(cnt)), mode: modeText(d) }) : t('s2roEmpty'); }
function render3() { const { ctx, w, h } = setup($('cv3')), d = SETS[S.set3], s = sortAsc(d), n = s.length, md = median(d); ['sA', 'sB', 'sC'].forEach((id, i) => { const b = $(id); b.classList.toggle('active', i === S.set3); b.setAttribute('aria-pressed', i === S.set3 ? 'true' : 'false'); });
  const L = { x: 20, y: 14, w: w - 40, h: h - 40 }, bw = L.w / n, mx = Math.max.apply(null, s), mid = Math.floor(n / 2), mids = n % 2 ? [mid] : [mid - 1, mid]; s.forEach((v, i) => { const hh = v / mx * L.h; ctx.fillStyle = mids.includes(i) ? COL.orange : COL.cyan; ctx.fillRect(L.x + i * bw + 5, L.y + L.h - hh, bw - 10, hh); text(ctx, String(v), L.x + (i + 0.5) * bw, L.y + L.h - hh - 4, { align: 'center', size: 11, color: COL.ink, bold: true }); text(ctx, String(i + 1), L.x + (i + 0.5) * bw, L.y + L.h + 14, { align: 'center', size: 10 }); });
  const mY = L.y + L.h - mean(d) / mx * L.h; line(ctx, L.x, mY, L.x + L.w, mY, COL.green, 2, [5, 4]); $('ro3').textContent = t('s3ro', { sorted: s.join(', '), n, where: n % 2 ? t('whereOdd', { k: mid + 1 }) : t('whereEven', { k: mid, k2: mid + 1 }), med: fmt(md), mean: fmt(mean(d)) }); }
function render4() { const { ctx, w, h } = setup($('cv4')), sc = SCENARIOS[S.sc], d = sc.data, lo = Math.min.apply(null, d) - 2, hi = Math.max.apply(null, d) + 2, m = mean(d), md = median(d), mo = modes(d); ['c0', 'c1', 'c2b'].forEach((id, i) => { const b = $(id); b.classList.toggle('active', i === S.sc); b.setAttribute('aria-pressed', i === S.sc ? 'true' : 'false'); }); for (let i = 0; i < 3; i++) { const b = $('pk' + i); b.classList.toggle('active', i === S.pick); b.setAttribute('aria-pressed', i === S.pick ? 'true' : 'false'); }
  dotPlot(ctx, { x: 20, y: 8, w: w - 40, h: h - 8 }, d, lo, hi, [{ v: m, col: COL.green, label: t('mMean'), row: 0 }, { v: md, col: COL.orange, label: t('mMed'), row: 1 }].concat(mo.map(v => ({ v, col: COL.violet, label: t('mMode'), row: 2 }))), 11);
  const info = { sc: t(sc.id), list: sortAsc(d).join(', '), mean: fmt(m), med: fmt(md), mode: modeText(d) }; if (!S.rev || S.pick < 0) $('ro4').textContent = t('s4roAsk', info); else $('ro4').textContent = t('s4roReveal', { ...info, best: t(sc.best), why: t(sc.why), pick: t(['mMean', 'mMed', 'mMode'][S.pick]) }); }
function render5() { const { ctx, w, h } = setup($('cv5')), d = parseList($('own5').value); if (!d) { $('ro5').textContent = t('s5roBad'); text(ctx, '?', w / 2, h / 2 + 14, { align: 'center', size: 44, color: COL.muted }); return; } const lo = Math.floor(Math.min.apply(null, d)) - 1, hi = Math.ceil(Math.max.apply(null, d)) + 1, m = mean(d), md = median(d), mo = modes(d);
  dotPlot(ctx, { x: 20, y: 8, w: w - 40, h: h - 8 }, d, lo, hi, [{ v: m, col: COL.green, label: t('mMean'), row: 0 }, { v: md, col: COL.orange, label: t('mMed'), row: 1 }].concat(mo.map(v => ({ v, col: COL.violet, label: t('mMode'), row: 2 }))), 11); $('ro5').textContent = t('s5ro', { n: d.length, mean: fmt(m), med: fmt(md), mode: modeText(d), rel: t(Math.abs(m - md) < 1e-9 ? 'relEq' : m > md ? 'relMore' : 'relLess') }); }
function wire() {
  slider('o1', render1); slider('v2', render2); $('add2').addEventListener('click', () => { if (S.data2.length < 30) S.data2.push(+$('v2').value); render2(); }); $('rem2').addEventListener('click', () => { S.data2.pop(); render2(); }); $('clr2').addEventListener('click', () => { S.data2 = []; render2(); }); $('rst2').addEventListener('click', () => { S.data2 = INIT2.slice(); render2(); });
  ['sA', 'sB', 'sC'].forEach((id, i) => $(id).addEventListener('click', () => { S.set3 = i; render3(); })); ['c0', 'c1', 'c2b'].forEach((id, i) => $(id).addEventListener('click', () => { S.sc = i; S.rev = false; S.pick = -1; render4(); })); for (let i = 0; i < 3; i++) $('pk' + i).addEventListener('click', () => { S.pick = i; S.rev = false; render4(); }); $('chk4').addEventListener('click', () => { S.rev = true; render4(); }); $('own5').addEventListener('input', render5);
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
if (typeof module !== 'undefined') module.exports = { mean,median,modes,parseList,SALARY,SCENARIOS };
