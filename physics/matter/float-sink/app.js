/* float-sink: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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

const OBJECTS = [{ k: 'oCork', rho: 0.25 }, { k: 'oWood', rho: 0.6 }, { k: 'oIce', rho: 0.92 }, { k: 'oClay', rho: 1.6 }, { k: 'oIron', rho: 7.8 }];
const V0 = 40, TANK_A = 100, H0 = 12;
const buoyancy = (vSub, rw) => (rw || 1) * vSub;
/* Rest state of a solid object of volume v and density rho in a liquid of density rw. */
function restState(rho, v, rw) { rw = rw || 1; const floats = rho < rw, vSub = floats ? rho * v / rw : v; return { floats, vSub, weight: rho * v, b: buoyancy(vSub, rw) }; }
function boatState(m, env, rw) { rw = rw || 1; const floats = env * rw >= m; const vSub = floats ? m / rw : env; return { floats, vSub, bmax: env * rw, frac: floats ? m / (env * rw) : 1 }; }
function cargoState(n, base, per, env) { const mass = base + per * n, cap = env, floats = mass <= cap; return { mass, cap, floats, pct: Math.min(1, mass / cap), left: Math.max(0, Math.floor((cap - mass) / per)) }; }
const eggState = rw => ({ floats: 1.08 < rw, frac: 1.08 < rw ? 1.08 / rw : 1 });
const requiredVolume = (m, rw) => m / (rw || 1);
const fmt = v => String(Math.round(v * 100) / 100);
const S = { obj: 1, n3: 0 };
function tank(ctx, box, waterH) { const px = box.h / 24, x0 = box.x + box.w * 0.1, tw = box.w * 0.8, yb = box.y + box.h - 4, wy = yb - waterH * px;
  ctx.fillStyle = 'rgba(103,215,249,0.28)'; ctx.fillRect(x0, wy, tw, yb - wy); line(ctx, x0, yb - 22 * px, x0, yb, COL.muted, 3); line(ctx, x0, yb, x0 + tw, yb, COL.muted, 3); line(ctx, x0 + tw, yb - 22 * px, x0 + tw, yb, COL.muted, 3); line(ctx, x0, wy, x0 + tw, wy, COL.cyan, 2);
  for (let k = 10; k <= 20; k += 5) { line(ctx, x0 + tw - 10, yb - k * px, x0 + tw, yb - k * px, COL.muted, 1); text(ctx, String(k), x0 + tw - 14, yb - k * px + 4, { align: 'right', size: 10 }); } return { x0, tw, yb, wy, px }; }
function arrow(ctx, x, y, len, col, label) { if (Math.abs(len) < 2) return; line(ctx, x, y, x, y + len, col, 3); const d = len > 0 ? 1 : -1; ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x, y + len + 8 * d); ctx.lineTo(x - 5, y + len); ctx.lineTo(x + 5, y + len); ctx.fill(); text(ctx, label, x + 8, y + len / 2, { size: 11, color: col, bold: true }); }
function renderObj(ctx, box, o) { const rest = restState(o.rho, V0), side = 90 * Math.sqrt(1), wh = H0 + rest.vSub / TANK_A, g = tank(ctx, box, wh), s = Math.min(box.w * 0.2, box.h * 0.3), cx = g.x0 + g.tw * 0.45;
  const top = rest.floats ? g.wy - s * (1 - rest.vSub / V0) : g.yb - s; ctx.fillStyle = o.rho >= 1 ? '#8a98a6' : '#b78a52'; ctx.fillRect(cx - s / 2, top, s, s); ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.5; ctx.strokeRect(cx - s / 2, top, s, s);
  const sc = 60 / Math.max(rest.weight, rest.b); arrow(ctx, cx - s * 0.2, top + s / 2, rest.weight * sc, COL.orange, rest.weight + ''); arrow(ctx, cx + s * 0.2, top + s / 2, -rest.b * sc, COL.green, fmt(rest.b)); return rest; }
function render0() { const { ctx, w, h } = setup($('cv0')), o = OBJECTS[S.obj]; OBJECTS.forEach((_, i) => { const b = $('o' + i); b.classList.toggle('active', i === S.obj); b.setAttribute('aria-pressed', i === S.obj ? 'true' : 'false'); });
  const r = renderObj(ctx, { x: 0, y: 0, w, h }, o); $('ro0').textContent = t('s0ro', { name: t(o.k), rho: o.rho, w: fmt(r.weight), state: t(r.floats ? 'floats' : 'sinks'), v: fmt(r.vSub), b: fmt(r.b) }); }
function render1() { const { ctx, w, h, wide } = setup($('cv1')), s = +$('s1').value; $('s1v').textContent = s; const A = wide ? { x: 0, y: 0, w: w * 0.45, h } : { x: 0, y: 0, w, h: h * 0.58 }, B = wide ? { x: w * 0.47, y: 0, w: w * 0.53, h } : { x: 0, y: h * 0.58, w, h: h * 0.42 };
  const rho = 0.6, W = rho * V0, vSub = s * V0, b = buoyancy(vSub), g = tank(ctx, A, H0 + vSub / TANK_A), sz = Math.min(A.w * 0.2, A.h * 0.3), cx = g.x0 + g.tw * 0.45; const top = g.wy - sz * (1 - s); ctx.fillStyle = '#b78a52'; ctx.fillRect(cx - sz / 2, top, sz, sz);
  const L = { x: B.x + 34, y: B.y + 12, w: B.w - 48, h: B.h - 40 }, X = v => L.x + v * L.w, Y = v => L.y + L.h - v / 44 * L.h; line(ctx, L.x, L.y, L.x, L.y + L.h, COL.grid, 1); line(ctx, L.x, L.y + L.h, L.x + L.w, L.y + L.h, COL.grid, 1);
  [0, 24, 40].forEach(v => text(ctx, String(v), L.x - 4, Y(v) + 4, { align: 'right', size: 10 })); [0, 1].forEach(v => text(ctx, String(v), X(v), L.y + L.h + 14, { align: 'center', size: 10 })); line(ctx, L.x, Y(W), L.x + L.w, Y(W), COL.orange, 2, [5, 4]); text(ctx, String(W), L.x + L.w, Y(W) - 4, { align: 'right', size: 11, color: COL.orange, bold: true });
  line(ctx, X(0), Y(0), X(1), Y(buoyancy(V0)), COL.green, 2.5); dot(ctx, X(s), Y(b), 6, COL.ink);
  const cmp = Math.abs(b - W) < 0.5 ? 'cmpEq' : b > W ? 'cmpUp' : 'cmpDown'; $('ro1').textContent = t('s1ro', { pct: Math.round(s * 100), v: fmt(vSub), b: fmt(b), w: fmt(W), cmp: t(cmp) }); }
function boat(ctx, cx, y, wd, ht, col) { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(cx - wd / 2, y - ht); ctx.lineTo(cx - wd * 0.35, y); ctx.lineTo(cx + wd * 0.35, y); ctx.lineTo(cx + wd / 2, y - ht); ctx.closePath(); ctx.fill(); }
function render2() { const { ctx, w, h } = setup($('cv2')), env = +$('e2').value; $('e2v').textContent = env; const st = boatState(50, env), g = tank(ctx, { x: 0, y: 0, w, h }, H0 + st.vSub / TANK_A), wd = Math.min(w * 0.55, 40 + env * 1.3), ht = Math.min(h * 0.4, 10 + env * 0.35), cx = g.x0 + g.tw * 0.45;
  const bottom = st.floats ? g.wy + ht * st.frac : g.yb; boat(ctx, cx, bottom, wd, ht, '#b78a52'); line(ctx, cx - wd / 2 - 6, g.wy, cx + wd / 2 + 6, g.wy, COL.cyan, 2);
  $('ro2').textContent = t('s2ro', { env: fmt(env), bmax: fmt(st.bmax), w: 50, res: st.floats ? t('s2roFloat', { frac: Math.round(st.frac * 100) }) : t('s2roSink'), v: fmt(st.vSub) }); }
function render3() { const { ctx, w, h } = setup($('cv3')), n = S.n3, c = cargoState(n, 50, 5, 100), st = boatState(c.mass, 100), g = tank(ctx, { x: 0, y: 0, w, h }, H0 + st.vSub / TANK_A), wd = Math.min(w * 0.5, 160), ht = Math.min(h * 0.34, 60), cx = g.x0 + g.tw * 0.45;
  const bottom = c.floats ? g.wy + ht * c.pct : g.yb; boat(ctx, cx, bottom, wd, ht, '#b78a52'); for (let k = 0; k < n; k++) dot(ctx, cx - wd * 0.28 + (k % 8) * wd * 0.08, bottom - 6 - Math.floor(k / 8) * 8, 3.5, COL.violet);
  line(ctx, cx - wd / 2 - 8, g.wy, cx + wd / 2 + 8, g.wy, COL.cyan, 2); $('add3').disabled = n >= 30; $('rem3').disabled = n <= 0;
  const res = !c.floats ? t('s3roSunk') : c.mass === c.cap ? t('s3roFull') : t('s3roOk', { pct: Math.round(c.pct * 100), left: c.left }); $('ro3').textContent = t('s3ro', { n, mass: c.mass, cap: c.cap, res }); }
function render4() { const { ctx, w, h } = setup($('cv4')), rw = +$('rw4').value; $('rw4v').textContent = rw; const e = eggState(rw), v = 55, g = tank(ctx, { x: 0, y: 0, w, h }, H0 + 1), s = Math.min(w * 0.16, h * 0.28), cx = g.x0 + g.tw * 0.45;
  ctx.fillStyle = 'rgba(246,164,91,' + (0.15 + (rw - 1) * 1.6) + ')'; ctx.fillRect(g.x0, g.wy, g.tw, g.yb - g.wy); const top = e.floats ? g.wy - s * 1.25 * (1 - e.frac) : g.yb - s * 1.25;
  ctx.fillStyle = '#f3ecd0'; ctx.beginPath(); ctx.ellipse(cx, top + s * 0.62, s * 0.5, s * 0.63, 0, 0, 6.2832); ctx.fill();
  $('ro4').textContent = t('s4ro', { rw, res: e.floats ? t('s4roFloat', { frac: Math.round(e.frac * 100) }) : t('s4roSink') }); }
function render5() { const { ctx, w, h } = setup($('cv5')), m = +$('m5').value, env = +$('v5').value; $('m5v').textContent = m; $('v5v').textContent = env; const st = boatState(m, env), g = tank(ctx, { x: 0, y: 0, w, h }, H0 + Math.min(st.vSub, 150) / TANK_A), wd = Math.min(w * 0.6, 30 + env * 0.9), ht = Math.min(h * 0.4, 8 + env * 0.25), cx = g.x0 + g.tw * 0.45;
  boat(ctx, cx, st.floats ? g.wy + ht * st.frac : g.yb, wd, ht, '#b78a52'); line(ctx, cx - wd / 2 - 6, g.wy, cx + wd / 2 + 6, g.wy, COL.cyan, 2);
  const need = requiredVolume(m); $('ro5').textContent = t('s5ro', { m, need: fmt(need), env, res: st.floats ? t('s5roYes') : t('s5roNo', { gap: fmt(need - env) }) }); }
function wire() {
  OBJECTS.forEach((_, i) => $('o' + i).addEventListener('click', () => { S.obj = i; render0(); })); slider('s1', render1); slider('e2', render2);
  $('add3').addEventListener('click', () => { if (S.n3 < 30) S.n3++; render3(); }); $('rem3').addEventListener('click', () => { if (S.n3 > 0) S.n3--; render3(); }); $('reset3').addEventListener('click', () => { S.n3 = 0; render3(); });
  slider('rw4', render4); slider('m5', render5); slider('v5', render5);
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
if (typeof module !== 'undefined') module.exports = { restState,buoyancy,boatState,cargoState,OBJECTS,eggState,requiredVolume };
