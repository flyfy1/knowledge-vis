/* eye-vision: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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

/* Model: reduced eye as a thin lens plus a retina at distance L. Powers in diopters (D = 1/m), distances in m or mm as named. Pure functions. */
const PR = 1000 / 17;                                     // relaxed lens power of the reduced eye, about 58.8 D (focal length 17 mm)
const imageDist = (P, u) => 1000 / (P - 1 / u);           // mm; negative means no real image (rays still diverge)
const blurDiameter = (P, u, L, pupil) => { const v = imageDist(P, u); return v > 0 ? pupil * Math.abs(L - v) / v : pupil * 4; }; // mm on the retina; capped when no image
const spherEq = L => 1000 / L - PR;                       // D: negative = myopic (eye too long), positive = hyperopic
const requiredAccom = (L, u, P) => spherEq(L) - P + 1 / u;
const sharpRange = (SE, A, P) => { const lo = P - SE, hi = P - SE + A; return { far: lo > 0 ? 1 / lo : Infinity, near: hi > 0 ? 1 / hi : NaN, hi: hi }; };
const UPOS = [0.25, 0.3, 0.4, 0.6, 1, 2, 5, 20, Infinity];
const THRESH = 0.01;                                       // visible-blur threshold on the retina in mm (about 2 arcminutes)
function dofRange(focusU, pupil) { const L = 17, P = PR + 1 / focusU; let near = focusU, far = focusU; for (let u = focusU, i = 0; u > 0.1 && i < 3000; u *= 0.995, i++) { if (blurDiameter(P, u, L, pupil) < THRESH) near = u; else break; } for (let u = focusU, i = 0; u < 1e5 && i < 6000; u *= 1.005, i++) { if (blurDiameter(P, u, L, pupil) < THRESH) far = u; else break; } if (far > 5e4) far = Infinity; return { near: near, far: far }; }
const PEOPLE = [{ id: 'pNormal', L: 17.0, A: 10 }, { id: 'pMyope', L: 17.6, A: 8 }, { id: 'pHyper', L: 16.6, A: 6 }, { id: 'pPresb', L: 17.0, A: 1 }];
const fm = v => Number.isFinite(v) ? (v < 1 ? (v * 100).toFixed(0) + ' cm' : v.toFixed(2).replace(/\.?0+$/, '') + ' m') : null;
const f1 = v => (Math.round(v * 10) / 10).toFixed(1), f2 = v => (Math.round(v * 100) / 100).toFixed(2), um = v => Math.round(v * 1000) + ' µm';
const S = { u0: 0, u1: 0, A1: 8, L2: 17.0, L3: 17.5, P3: 0, pupil4: 4, foc4: 1, person: 1 };
const uLabel = u => Number.isFinite(u) ? fm(u) : null;
const showU = u => uLabel(u) || t('far');
function rayDiagram(ctx, w, h, o) { const x0 = 16, lx = w * 0.3, s = Math.min(8, (w * 0.62) / Math.max(20, o.L)), rx = lx + o.L * s, cy = h * 0.46, ph = Math.min(30, o.pupil * 4);
  ctx.fillStyle = '#16303f'; ctx.fillRect(lx - 3, cy - 46, 6, 46 - ph / 2); ctx.fillRect(lx - 3, cy + ph / 2, 6, 46 - ph / 2); line(ctx, lx, cy - ph / 2, lx, cy + ph / 2, COL.cyan, 4);
  line(ctx, rx, cy - 52, rx, cy + 52, COL.red, 4); text(ctx, t('lblRetina'), rx, cy + 70, { align: 'center', size: 11, color: COL.red }); text(ctx, t('lblLens'), lx, cy - 54, { align: 'center', size: 11, color: COL.cyan }); line(ctx, x0, cy, rx + 20, cy, '#25384a', 1, [4, 4]);
  const near = Number.isFinite(o.u) ? 0.6 / o.u : 0, v = imageDist(o.P, o.u), vx = lx + v * s, n = 5;
  for (let i = 0; i < n; i++) { const f = (i / (n - 1) - 0.5) * 2, yl = cy + f * ph / 2, y0 = cy + f * (ph / 2) * (1 + near), yAt = x => yl + (cy - yl) * (x - lx) / (vx - lx);
    line(ctx, x0, y0, lx, yl, COL.orange, 1.4); line(ctx, lx, yl, rx, yAt(rx), COL.orange, 1.4); if (vx > rx) { const xe = Math.min(vx, rx + 70); line(ctx, rx, yAt(rx), xe, yAt(xe), '#7a5a35', 1.2, [3, 3]); } }
  if (vx < rx + 70) { dot(ctx, vx, cy, 4, COL.ink); text(ctx, t('lblFocusPt'), vx, cy - 10, { align: 'center', size: 10, color: COL.ink }); }
  const b = blurDiameter(o.P, o.u, o.L, o.pupil), br = Math.min(34, Math.max(1.5, b * 60)); ctx.fillStyle = b < THRESH ? 'rgba(116,223,170,.65)' : 'rgba(224,100,78,.45)'; ctx.beginPath(); ctx.arc(rx + 26, cy, br, 0, 6.2832); ctx.fill(); text(ctx, t(b < THRESH ? 'lblSharp' : 'lblBlur'), rx + 26, cy + 52, { align: 'center', size: 10, color: b < THRESH ? COL.green : COL.red });
  return { b: b, v: v }; }
function render0() {
  const { ctx, w, h } = setup($('cv0')), u = UPOS[S.u0], o = rayDiagram(ctx, w, h, { u, P: PR, L: 17, pupil: 4 }); $('u0v').textContent = showU(u);
  $('ro0').textContent = t('s0ro', { u: showU(u), v: o.v > 0 ? f2(o.v) : '–', blur: um(o.b), verdict: o.b < THRESH ? t('vSharp') : t('vBlurred') });
}
function render1() {
  const { ctx, w, h } = setup($('cv1')), u = UPOS[S.u1], A = S.A1, need = requiredAccom(17, u, 0), P = PR + Math.min(Math.max(need, 0), A), o = rayDiagram(ctx, w, h, { u, P, L: 17, pupil: 4 }), nearPt = sharpRange(0, A, 0).near;
  $('u1v').textContent = showU(u); $('A1v').textContent = A.toFixed(1) + ' D'; $('ro1').textContent = t('s1ro', { u: showU(u), need: f2(need), A: A.toFixed(1), P: f1(P), near: fm(nearPt) || '–', verdict: need <= A + 1e-9 ? t('vSharp') : t('vBlurred') });
}
function render2() {
  const { ctx, w, h } = setup($('cv2')), L = S.L2, SE = spherEq(L), o = rayDiagram(ctx, w, h, { u: Infinity, P: PR, L, pupil: 4 }), far = SE < -0.01 ? 1 / -SE : Infinity; $('L2v').textContent = L.toFixed(1) + ' mm';
  $('ro2').textContent = t('s2ro', { L: L.toFixed(1), se: f2(SE), kind: SE < -0.1 ? t('kMyopia') : SE > 0.1 ? t('kHyper') : t('kNormal'), v: f2(o.v), far: SE < -0.01 ? fm(far) : t('far') });
}
function render3() {
  const { ctx, w, h } = setup($('cv3')), L = S.L3, P = PR + S.P3, SE = spherEq(L), o = rayDiagram(ctx, w, h, { u: Infinity, P, L, pupil: 4 }); $('L3v').textContent = L.toFixed(1) + ' mm'; $('P3v').textContent = (S.P3 > 0 ? '+' : '') + S.P3.toFixed(1) + ' D';
  $('ro3').textContent = t('s3ro', { L: L.toFixed(1), se: f2(SE), p: (S.P3 > 0 ? '+' : '') + S.P3.toFixed(1), best: (SE > 0 ? '+' : '') + f2(SE), blur: um(o.b), verdict: o.b < THRESH ? t('vSharp') : t('vBlurred') });
}
function render4() {
  const { ctx, w, h } = setup($('cv4')), p = S.pupil4, fu = UPOS[S.foc4], L = { x: 44, y: 14, w: w - 60, h: h - 46 }, P = PR + 1 / fu, ymax = 0.06, lmin = Math.log10(0.2), lmax = Math.log10(50), X = u => L.x + (Math.log10(u) - lmin) / (lmax - lmin) * L.w, Y = b => L.y + L.h - Math.min(b, ymax) / ymax * L.h; axes(ctx, L);
  line(ctx, L.x, Y(THRESH), L.x + L.w, Y(THRESH), COL.muted, 1, [4, 4]); text(ctx, t('lblThresh'), L.x + L.w, Y(THRESH) - 4, { align: 'right', size: 10 }); const pts = []; for (let i = 0; i <= 200; i++) { const u = Math.pow(10, lmin + (lmax - lmin) * i / 200); pts.push([X(u), Y(blurDiameter(P, u, 17, p))]); } curve(ctx, pts, COL.orange, 3);
  const d = dofRange(fu, p), lo = X(Math.max(0.2, d.near)), hi = X(Math.min(50, d.far)); ctx.fillStyle = 'rgba(116,223,170,.18)'; ctx.fillRect(lo, L.y, hi - lo, L.h); line(ctx, X(fu), L.y, X(fu), L.y + L.h, COL.cyan, 1.5, [4, 3]);
  [0.25, 0.5, 1, 2, 5, 10, 50].forEach(u => text(ctx, u + '', X(u), L.y + L.h + 14, { align: 'center', size: 10 })); text(ctx, t('axDist'), L.x + L.w, L.y + L.h + 28, { align: 'right', size: 11 }); text(ctx, t('axBlur'), L.x + 4, L.y + 10, { size: 11 });
  $('pupil4v').textContent = p.toFixed(1) + ' mm'; $('foc4v').textContent = showU(fu); $('ro4').textContent = t('s4ro', { p: p.toFixed(1), fu: showU(fu), near: fm(d.near) || '–', far: Number.isFinite(d.far) ? fm(d.far) : t('far') });
}
function render5() {
  const { ctx, w, h } = setup($('cv5')), pe = PEOPLE[S.person], SE = spherEq(pe.L), A = pe.A, un = sharpRange(SE, A, 0), Pc = SE, co = sharpRange(SE, A, Pc), L = { x: 16, y: 20, w: w - 32, h: h - 70 }, lmin = Math.log10(0.1), lmax = Math.log10(100), X = u => L.x + (Math.log10(Math.min(100, Math.max(0.1, u))) - lmin) / (lmax - lmin) * L.w;
  [[un, 'lblUncorr', COL.orange], [co, 'lblCorr', COL.green]].forEach(([r, k, col], i) => { const y = L.y + i * (L.h / 2) + 6; text(ctx, t(k), L.x, y + 10, { size: 11, color: col }); ctx.fillStyle = '#101d2a'; ctx.fillRect(L.x, y + 18, L.w, 22); if (r.hi > 0 && !(Number.isNaN(r.near))) { const a = X(r.near), b = Number.isFinite(r.far) ? X(r.far) : L.x + L.w; ctx.fillStyle = col; ctx.fillRect(a, y + 18, Math.max(2, b - a), 22); } });
  [0.1, 0.25, 1, 5, 100].forEach(u => text(ctx, u + '', X(u), L.y + L.h + 14, { align: 'center', size: 10 })); text(ctx, t('axDist'), L.x + L.w, L.y + L.h + 30, { align: 'right', size: 11 });
  PEOPLE.forEach((q, i) => { const b = $('pp' + i); b.classList.toggle('active', i === S.person); b.setAttribute('aria-pressed', i === S.person ? 'true' : 'false'); });
  const add = A < 3 ? f1(3 - A) : '0.0'; $('ro5').textContent = t('s5ro', { name: t(pe.id), se: (SE > 0 ? '+' : '') + f2(SE), A: A, nearU: fm(un.near) || '–', farU: Number.isFinite(un.far) ? fm(un.far) : t('far'), nearC: fm(co.near) || '–', rx: (Pc > 0 ? '+' : '') + f2(Pc), add: add });
}
function wire() {
  slider('u0', v => { S.u0 = v; render0(); }); slider('u1', v => { S.u1 = v; render1(); }); $('A1').addEventListener('input', e => { S.A1 = +e.target.value / 2; render1(); });
  slider10('L2', v => { S.L2 = v; render2(); }); slider10('L3', v => { S.L3 = v; render3(); }); $('P3').addEventListener('input', e => { S.P3 = +e.target.value / 10; render3(); });
  $('pupil4').addEventListener('input', e => { S.pupil4 = +e.target.value / 10; render4(); }); slider('foc4', v => { S.foc4 = v; render4(); }); PEOPLE.forEach((q, i) => $('pp' + i).addEventListener('click', () => { S.person = i; render5(); }));
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

if (typeof module !== 'undefined') module.exports = { PR, imageDist, blurDiameter, spherEq, requiredAccom, sharpRange, UPOS, THRESH, dofRange, PEOPLE };
