/* simple-circuits: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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

const PRATED = 2.5, RB = 6, RWIRE = 0.05, CELL_V = 1.5, CELL_R = 0.5;
const CONDUCTORS = [{ id: 'mCopper', c: true, col: '#d98b54' }, { id: 'mIron', c: true, col: '#8b98a6' }, { id: 'mFoil', c: true, col: '#cfd8e0' }, { id: 'mGraphite', c: true, col: '#4a4f57' }, { id: 'mSalt', c: true, col: '#67b5d9' }, { id: 'mRubber', c: false, col: '#c05a5a' }, { id: 'mPlastic', c: false, col: '#a9d3e8' }, { id: 'mWood', c: false, col: '#b78a52' }, { id: 'mGlass', c: false, col: '#d6ece8' }];
/* A single loop carries current only if every part of it conducts. */
const isClosed = (sw, cuts, gapOK) => !!sw && !cuts.some(Boolean) && gapOK !== false;
/* Series cells, one bulb; optional shorting wire across the bulb. Returns amps / watts. */
function circuitState(cells, short) { const V = cells * CELL_V, r = cells * CELL_R; if (short) { const I = V / (r + RWIRE); return { V, I, pb: 0, pr: I * I * r, burned: false }; } const I0 = V / (r + RB), p0 = I0 * I0 * RB; if (p0 > PRATED) return { V, I: 0, pb: 0, pr: 0, burned: true, I0, p0 }; return { V, I: I0, pb: p0, pr: I0 * I0 * r, burned: false, I0, p0 }; }
const SCENARIOS = [{ sw: true, cuts: [0, 0, 0, 0], short: false, dg: 0 }, { sw: false, cuts: [0, 0, 0, 0], short: false, dg: 1 }, { sw: true, cuts: [0, 0, 1, 0], short: false, dg: 2 }, { sw: true, cuts: [0, 0, 0, 0], short: true, dg: 3 }, { sw: true, cuts: [1, 0, 0, 0], short: false, dg: 2 }, { sw: false, cuts: [0, 0, 0, 0], short: false, dg: 1 }];
const S = { sw0: false, cuts: [0, 0, 0, 0], mat: 0, short: false, phase: 0, paused: false, vis: new Set(), raf: 0, last: 0, c5: 0, pick: -1, checked: false };
const fmt = v => String(Math.round(v * 1000) / 1000), f2 = v => String(Math.round(v * 100) / 100);
/* Draw the loop. o: {sw, cuts[4], gap:{col,c}|null, lit 0..1, flow, short, thick, burned} */
function drawLoop(ctx, w, h, o) { const L = w * 0.14, R = w * 0.86, T = h * 0.2, B = h * 0.8, mx = (L + R) / 2, my = (T + B) / 2, col = o.flow ? COL.cyan : COL.muted, lw = 3 + (o.thick || 0);
  const seg = (x1, y1, x2, y2, cut) => { if (cut) { const dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l; line(ctx, x1, y1, x1 + ux * l * 0.4, y1 + uy * l * 0.4, col, lw); line(ctx, x2, y2, x2 - ux * l * 0.4, y2 - uy * l * 0.4, col, lw); text(ctx, '✕', (x1 + x2) / 2, (y1 + y2) / 2 + 5, { align: 'center', size: 16, color: COL.red, bold: true }); } else line(ctx, x1, y1, x2, y2, col, lw); };
  const cuts = o.cuts || [0, 0, 0, 0]; seg(L, my - 24, L, T, 0); seg(L, T, L + (mx - L) * 0.55, T, cuts[0]); seg(mx + (R - mx) * 0.45, T, R, T, cuts[1]); seg(L + (mx - L) * 0.55, T, mx - 28, T, 0); seg(mx + 28, T, mx + (R - mx) * 0.45, T, 0); seg(R, T, R, my - 26, 0); seg(R, my + 26, R, B, cuts[2] ? 1 : 0); seg(R, B, mx + 32, B, cuts[2] ? 0 : 0); seg(mx - 32, B, L, B, cuts[3]); seg(L, B, L, my + 24, 0);
  line(ctx, L - 16, my - 24, L + 16, my - 24, COL.ink, 3); line(ctx, L - 9, my - 14, L + 9, my - 14, COL.ink, 5); line(ctx, L - 16, my + 4, L + 16, my + 4, COL.ink, 3); line(ctx, L - 9, my + 14, L + 9, my + 14, COL.ink, 5); text(ctx, '+', L + 24, my - 22, { size: 14, color: COL.orange, bold: true }); text(ctx, '−', L + 24, my + 20, { size: 16, color: COL.cyan, bold: true });
  dot(ctx, mx - 28, T, 4, COL.ink); dot(ctx, mx + 28, T, 4, COL.ink); if (o.sw) line(ctx, mx - 28, T, mx + 28, T, COL.ink, 4); else line(ctx, mx - 28, T, mx + 20, T - 22, COL.ink, 4);
  const gl = o.lit || 0; if (gl > 0) { const gr = ctx.createRadialGradient(R, my, 4, R, my, 18 + 40 * gl); gr.addColorStop(0, 'rgba(255,230,120,' + (0.35 + 0.5 * gl) + ')'); gr.addColorStop(1, 'rgba(255,230,120,0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(R, my, 18 + 40 * gl, 0, 6.2832); ctx.fill(); }
  ctx.strokeStyle = o.burned ? COL.red : gl > 0 ? '#ffe678' : COL.muted; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(R, my, 22, 0, 6.2832); ctx.stroke(); line(ctx, R - 12, my + 4, R - 4, my - 6, ctx.strokeStyle, 2); line(ctx, R - 4, my - 6, R + 4, my + 4, ctx.strokeStyle, 2); line(ctx, R + 4, my + 4, R + 12, my - 6, o.burned ? 'rgba(0,0,0,0)' : ctx.strokeStyle, 2);
  if (o.gap) { ctx.fillStyle = o.gap.col; ctx.fillRect(mx - 30, B - 7, 60, 14); ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.5; ctx.strokeRect(mx - 30, B - 7, 60, 14); }
  if (o.short) { const y2 = my + 52, x1 = R - 36; line(ctx, R, my + 26, R, y2, COL.orange, lw + 1); line(ctx, R, my - 26, R + 28, my - 26, COL.orange, lw + 1); line(ctx, R + 28, my - 26, R + 28, y2, COL.orange, lw + 1); line(ctx, R + 28, y2, R, y2, COL.orange, lw + 1); }
  if (o.flow) { const pts = [[L, my - 24], [L, T], [R, T], [R, my - 26], [R, B], [L, B], [L, my + 24]], per = []; let tot = 0; for (let i = 0; i < pts.length - 1; i++) { const l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); per.push(l); tot += l; }
    const n = Math.floor(tot / 26); for (let k = 0; k < n; k++) { let d = ((k * tot / n) + S.phase * 60) % tot, i = 0; while (d > per[i]) { d -= per[i]; i = (i + 1) % per.length; if (i === 0 && d > tot) break; } const a = pts[i], b = pts[i + 1], f = d / per[i]; dot(ctx, a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, 3.6, COL.orange); } } }
function loopState(sw, cuts, gapOK) { return isClosed(sw, cuts, gapOK); }
function render0() { const { ctx, w, h } = setup($('cv0')), cl = loopState(S.sw0, [0, 0, 0, 0], true), st = circuitState(2, false); drawLoop(ctx, w, h, { sw: S.sw0, flow: cl, lit: cl ? 0.8 : 0 }); $('sw0').textContent = t(S.sw0 ? 'swOff' : 'swOn'); $('pause0').textContent = t(S.paused ? 'resume' : 'pause'); $('sw0').setAttribute('aria-pressed', S.sw0 ? 'true' : 'false');
  $('ro0').textContent = t('s0ro', { sw: t(S.sw0 ? 'swClosed' : 'swOpen'), loop: t(cl ? 'loopYes' : 'loopNo'), bulb: t(cl ? 'bulbOn' : 'bulbOff'), i: cl ? fmt(st.I) : 0 }); }
function render1() { const { ctx, w, h } = setup($('cv1')), cuts = S.cuts, cl = loopState(true, cuts, true); drawLoop(ctx, w, h, { sw: true, cuts, flow: cl, lit: cl ? 0.8 : 0 }); ['A', 'B', 'C', 'D'].forEach((x, i) => { const b = $('c' + x); b.classList.toggle('active', !!cuts[i]); b.setAttribute('aria-pressed', cuts[i] ? 'true' : 'false'); });
  const list = ['A', 'B', 'C', 'D'].filter((x, i) => cuts[i]).join(', ') || t('none'); $('ro1').textContent = t('s1ro', { list, loop: t(cl ? 'loopYes' : 'loopNo'), bulb: t(cl ? 'bulbOn' : 'bulbOff') }); }
function render2() { const { ctx, w, h } = setup($('cv2')), m = CONDUCTORS[S.mat], cl = loopState(true, [0, 0, 0, 0], m.c); drawLoop(ctx, w, h, { sw: true, gap: m, flow: cl, lit: cl ? 0.8 : 0 }); CONDUCTORS.forEach((c, i) => { const b = $('mat' + i); b.classList.toggle('active', i === S.mat); b.setAttribute('aria-pressed', i === S.mat ? 'true' : 'false'); });
  $('ro2').textContent = t('s2ro', { mat: t(m.id), kind: t(m.c ? 'kindCond' : 'kindIns'), bulb: t(cl ? 'bulbOn' : 'bulbOff') }); }
function render3() { const { ctx, w, h } = setup($('cv3')), st = circuitState(2, S.short), nm = circuitState(2, false); drawLoop(ctx, w, h, { sw: true, short: S.short, flow: true, lit: S.short ? 0 : 0.8, thick: S.short ? 4 : 0 }); $('short3').textContent = t(S.short ? 'shortOff' : 'shortOn'); $('short3').setAttribute('aria-pressed', S.short ? 'true' : 'false');
  $('ro3').textContent = t('s3ro', { state: t(S.short ? 'stShort' : 'stNormal'), i: f2(st.I), pb: f2(st.pb), pr: f2(st.pr) }) + (S.short ? ' ' + t('s3roCmp', { x: f2(st.I / nm.I), h: f2(st.pr / nm.pr) }) : ''); }
function render4() { const { ctx, w, h } = setup($('cv4')), n = +$('n4').value; $('n4v').textContent = n; const st = circuitState(n, false), br = st.burned, pw = br ? st.p0 : st.pb;
  drawLoop(ctx, w, h, { sw: true, flow: !br, lit: br ? 0 : Math.min(1, st.pb / PRATED), burned: br, thick: br ? 0 : st.I * 3 }); for (let k = 0; k < n; k++) dot(ctx, w * 0.14 - 26 - 0, h * 0.5 + (k - (n - 1) / 2) * 0, 0, COL.ink);
  $('ro4').textContent = t('s4ro', { n, v: f2(st.V), i: f2(br ? st.I0 : st.I), p: f2(pw), pr: PRATED, res: br ? t('resBurn') : t('resOk', { pct: Math.round(Math.min(1, st.pb / PRATED) * 100) }) }); }
function render5() { const { ctx, w, h } = setup($('cv5')), sc = SCENARIOS[S.c5 % SCENARIOS.length], cl = loopState(sc.sw, sc.cuts, true) && !sc.short; drawLoop(ctx, w, h, { sw: sc.sw, cuts: sc.cuts, short: sc.short, flow: cl || sc.short, lit: cl ? 0.8 : 0, thick: sc.short ? 4 : 0 });
  for (let i = 0; i < 4; i++) { const b = $('dg' + i); b.classList.toggle('active', S.pick === i); b.setAttribute('aria-pressed', S.pick === i ? 'true' : 'false'); }
  const whys = ['whyNormal', 'whySwitch', 'whyCut', 'whyShort']; if (!S.checked || S.pick < 0) { $('ro5').textContent = t('s5ro'); return; } $('ro5').textContent = S.pick === sc.dg ? t('s5roOk', { why: t(whys[sc.dg]) }) : t('s5roNo', { why: t(whys[sc.dg]) }); }
const DRAWERS = [render0, render1, render2, render3, render4, render5];
function animating() { return !S.paused && !reduceMotion() && !document.hidden && S.vis.size > 0; }
function frame(ts) { S.raf = 0; if (!animating()) return; S.phase += Math.min(0.05, (ts - S.last) / 1000) * 0.5; S.last = ts; S.vis.forEach(i => DRAWERS[i]()); S.raf = requestAnimationFrame(frame); }
function kick() { if (!S.raf && animating()) { S.last = performance.now(); S.raf = requestAnimationFrame(frame); } }
const onHide = () => { cancelAnimationFrame(S.raf); S.raf = 0; };
function wire() {
  const mats = $('mats'); CONDUCTORS.forEach((c, i) => { const b = document.createElement('button'); b.id = 'mat' + i; b.dataset.step = '2'; b.dataset.i18n = c.id; b.textContent = t(c.id); b.addEventListener('click', () => { S.mat = i; render2(); }); mats.appendChild(b); });
  $('sw0').addEventListener('click', () => { S.sw0 = !S.sw0; render0(); kick(); }); $('pause0').addEventListener('click', () => { S.paused = !S.paused; renderAll(); kick(); });
  ['A', 'B', 'C', 'D'].forEach((x, i) => $('c' + x).addEventListener('click', () => { S.cuts[i] = S.cuts[i] ? 0 : 1; render1(); })); $('cR').addEventListener('click', () => { S.cuts = [0, 0, 0, 0]; render1(); });
  $('short3').addEventListener('click', () => { S.short = !S.short; render3(); }); slider('n4', render4);
  for (let i = 0; i < 4; i++) $('dg' + i).addEventListener('click', () => { S.pick = i; S.checked = false; render5(); }); $('chk5').addEventListener('click', () => { S.checked = true; render5(); }); $('nx5').addEventListener('click', () => { S.c5++; S.pick = -1; S.checked = false; render5(); });
  if ('IntersectionObserver' in window) { const io = new IntersectionObserver(es => { es.forEach(e => { const i = +e.target.dataset.step; if (e.isIntersecting) S.vis.add(i); else S.vis.delete(i); }); kick(); }, { threshold: 0.1 }); document.querySelectorAll('.step').forEach(s => io.observe(s)); }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(); }); window.addEventListener('langchange', () => { const mats = document.querySelectorAll('#mats button'); mats.forEach(b => b.textContent = t(b.dataset.i18n)); });
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
if (typeof module !== 'undefined') module.exports = { isClosed,circuitState,CONDUCTORS,SCENARIOS,PRATED };
