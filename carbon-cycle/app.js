/* carbon-cycle: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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

/* Model: five-box carbon budget (GtC). Fluxes are first-order toy rules tuned to a pre-industrial balance. All functions are pure. */
const P = { A0: 590, L0: 2300, S0: 900, D0: 37000, F0: 4000, phot: 120, resp: 120, ocUp: 90, ocOut: 90, sd: 60, ds: 60, beta: 0.15, revelle: 10, ppm: 2.12 };
const toPpm = A => A / P.ppm;
function fluxes(s) { return { phot: P.phot * (1 + P.beta * (s.A / P.A0 - 1)), resp: P.resp * (s.L / P.L0), up: P.ocUp * (s.A / P.A0), outg: P.ocOut * (1 + P.revelle * (s.S / P.S0 - 1)), sd: P.sd * (s.S / P.S0), ds: P.ds * (s.D / P.D0) }; }
/* E(t): emissions in GtC/yr as a function of year. Returns one state per year, state includes cumulative emissions. */
function simulate(E, years) { const dt = 0.25; let s = { A: P.A0, L: P.L0, S: P.S0, D: P.D0, cum: 0 }; const out = [Object.assign({ t: 0 }, s)];
  for (let step = 0; step < years / dt; step++) { const t = step * dt, f = fluxes(s), e = E(t);
    s = { A: s.A + dt * (e + f.resp + f.outg - f.phot - f.up), L: s.L + dt * (f.phot - f.resp), S: s.S + dt * (f.up - f.outg - f.sd + f.ds), D: s.D + dt * (f.sd - f.ds), cum: s.cum + dt * e };
    if ((step + 1) % 4 === 0) out.push(Object.assign({ t: (step + 1) * dt }, s)); }
  return out; }
const constE = e => () => e;
const stopAt = (e, y) => t => (t < y ? e : 0);
const SCEN = [t => 10, t => (t < 30 ? 10 : 5), t => Math.max(0, 10 * (1 - t / 50)), t => 0];
const scenName = ['scKeep', 'scHalve', 'scNetZero', 'scStop'];
const airborne = st => st.cum > 0 ? (st.A - P.A0) / st.cum : 0;
function boxInfo(id) { const f = fluxes({ A: P.A0, L: P.L0, S: P.S0, D: P.D0 });
  const B = { A: { stock: P.A0, inn: f.resp + f.outg, out: f.phot + f.up }, L: { stock: P.L0, inn: f.phot, out: f.resp }, S: { stock: P.S0, inn: f.up + f.ds, out: f.outg + f.sd }, D: { stock: P.D0, inn: f.sd, out: f.ds }, F: { stock: P.F0, inn: 0, out: 10 } }[id];
  return Object.assign({ turn: B.stock / B.out }, B); }
const netLand = pct => P.phot * pct / 100;                       // GtC/yr drawn out of the air when photosynthesis exceeds respiration by pct %
const f1 = v => (Math.round(v * 10) / 10).toFixed(1), f0 = v => String(Math.round(v)), f2 = v => (Math.round(v * 100) / 100).toFixed(2);
const S = { box: 'A', imb: 3, E2: 10, yr2: 100, E3: 10, t3: 100, stop4: 50, sc: 0 };
const BOXES = ['A', 'L', 'S', 'D', 'F'], BCOL = { A: '#67d7f9', L: '#74dfaa', S: '#4e83aa', D: '#2b5a85', F: '#b6644e' };
function boxPos(w, h) { return { F: [w * 0.5, h * 0.15], A: [w * 0.5, h * 0.44], L: [w * 0.16, h * 0.6], S: [w * 0.84, h * 0.52], D: [w * 0.84, h * 0.86] }; }
function render0() {
  const { ctx, w, h } = setup($('cv0')), pos = boxPos(w, h), info = boxInfo(S.box), f = fluxes({ A: P.A0, L: P.L0, S: P.S0, D: P.D0 });
  const arr = (a, b, fl, off, col) => { const A = pos[a], B = pos[b], dx = B[0] - A[0], dy = B[1] - A[1], d = Math.hypot(dx, dy), nx = -dy / d, ny = dx / d, r1 = 34, r2 = 38; arrow(ctx, A[0] + dx / d * r1 + nx * off, A[1] + dy / d * r1 + ny * off, B[0] - dx / d * r2 + nx * off, B[1] - dy / d * r2 + ny * off, col || '#6f93a8', 1 + Math.sqrt(fl) * 0.28); };
  arr('A', 'L', f.phot, 8); arr('L', 'A', f.resp, 8); arr('A', 'S', f.up, 8); arr('S', 'A', f.outg, 8); arr('S', 'D', f.sd, 8); arr('D', 'S', f.ds, 8); arr('F', 'A', 10, 0, COL.red);
  BOXES.forEach(id => { const [x, y] = pos[id], side = 26 + 13 * Math.log10(boxInfo(id).stock) * 1.0, on = id === S.box; ctx.fillStyle = BCOL[id]; ctx.globalAlpha = on ? 1 : 0.55; ctx.fillRect(x - side / 2, y - side / 2, side, side * 0.8); ctx.globalAlpha = 1; if (on) { ctx.strokeStyle = COL.orange; ctx.lineWidth = 3; ctx.strokeRect(x - side / 2, y - side / 2, side, side * 0.8); }
    text(ctx, t('box_' + id), x, y - side * 0.5 + 16, { align: 'center', size: 11, color: '#0a0e14', bold: true }); text(ctx, f0(boxInfo(id).stock), x, y + side * 0.3 - 7, { align: 'center', size: 11, color: '#0a0e14' }); });
  text(ctx, t('lblSize'), 8, h - 6, { size: 10 });
  BOXES.forEach(id => { const b = $('bx' + id); if (b) { b.classList.toggle('active', id === S.box); b.setAttribute('aria-pressed', id === S.box ? 'true' : 'false'); } });
  $('ro0').textContent = t('s0ro', { name: t('box_' + S.box), stock: f0(info.stock), inn: f0(info.inn), out: f0(info.out), turn: info.turn >= 100 ? f0(info.turn) : f1(info.turn), note: t('note_' + S.box) });
}
function render1() {
  const { ctx, w, h } = setup($('cv1')), L = { x: 44, y: 14, w: w - 60, h: h - 46 }, net = netLand(S.imb), years = 50, lo = 250, hi = 350, X = yy => L.x + yy / years * L.w, Y = pp => L.y + L.h - (pp - lo) / (hi - lo) * L.h;
  axes(ctx, L); const base = toPpm(P.A0), human = 10 / P.ppm;
  line(ctx, L.x, Y(base), L.x + L.w, Y(base), COL.muted, 1, [4, 4]);
  curve(ctx, [[X(0), Y(base)], [X(years), Y(base + human * years)]], COL.red, 2); text(ctx, t('lblHuman'), X(years) - 4, Y(base + human * years) + 14, { align: 'right', size: 11, color: COL.red });
  curve(ctx, [[X(0), Y(base)], [X(years), Y(base - net / P.ppm * years)]], COL.orange, 3); text(ctx, t('lblImb'), X(years) - 4, Y(base - net / P.ppm * years) - 6, { align: 'right', size: 11, color: COL.orange });
  [0, 25, 50].forEach(yy => text(ctx, yy + '', X(yy), L.y + L.h + 14, { align: 'center', size: 10 })); [250, 300, 350].forEach(pp => text(ctx, pp + '', L.x - 4, Y(pp) + 3, { align: 'right', size: 10 }));
  text(ctx, t('axYear'), L.x + L.w, L.y + L.h + 28, { align: 'right', size: 11 }); text(ctx, t('axPpm'), L.x + 4, L.y + 10, { size: 11 });
  $('ro1').textContent = t('s1ro', { p: S.imb, net: f1(net), ppm: f1(net / P.ppm), share: f0(Math.abs(net) / 10 * 100), dir: net > 0 ? t('dirDown') : net < 0 ? t('dirUp') : t('dirFlat') });
}
function curvePlot(ctx, L, series, years, lo, hi) { const X = yy => L.x + yy / years * L.w, Y = v => L.y + L.h - (v - lo) / (hi - lo) * L.h; axes(ctx, L); line(ctx, L.x, Y(toPpm(P.A0)), L.x + L.w, Y(toPpm(P.A0)), COL.muted, 1, [4, 4]);
  series.forEach(s => curve(ctx, s.data.map(st => [X(st.t), Y(toPpm(st.A))]), s.col, s.lw)); return { X, Y }; }
function render2() {
  const { ctx, w, h } = setup($('cv2')), L = { x: 44, y: 14, w: w - 60, h: h - 46 }, tr = simulate(constE(S.E2), 100), st = tr[S.yr2];
  const hi = Math.max(560, Math.ceil(toPpm(tr[100].A) / 20) * 20 + 20), P2 = curvePlot(ctx, L, [{ data: tr, col: COL.orange, lw: 3 }], 100, 260, hi);
  line(ctx, P2.X(S.yr2), L.y, P2.X(S.yr2), L.y + L.h, COL.cyan, 1.5, [4, 3]); dot(ctx, P2.X(S.yr2), P2.Y(toPpm(st.A)), 6, COL.cyan);
  [0, 25, 50, 75, 100].forEach(yy => text(ctx, yy + '', P2.X(yy), L.y + L.h + 14, { align: 'center', size: 10 })); [300, 400, 500].filter(v => v < hi).forEach(pp => text(ctx, pp + '', L.x - 4, P2.Y(pp) + 3, { align: 'right', size: 10 }));
  text(ctx, t('axYear'), L.x + L.w, L.y + L.h + 28, { align: 'right', size: 11 }); text(ctx, t('axPpm'), L.x + 4, L.y + 10, { size: 11 });
  $('ro2').textContent = S.E2 === 0 ? t('s2ro0', { yr: S.yr2, ppm: f0(toPpm(st.A)) }) : t('s2ro', { E: S.E2, yr: S.yr2, ppm: f0(toPpm(st.A)), cum: f0(st.cum), af: f0(airborne(st) * 100) });
}
function render3() {
  const { ctx, w, h } = setup($('cv3')), st = simulate(constE(S.E3), S.t3)[S.t3], cum = st.cum, dA = st.A - P.A0, dL = st.L - P.L0, dO = (st.S - P.S0) + (st.D - P.D0), L = { x: 14, y: h * 0.28, w: w - 28, h: h * 0.28 };
  axes(ctx, { x: L.x, y: L.y, w: L.w, h: L.h });
  if (cum > 0) { let x = L.x; [[dA, COL.cyan, 'lblAtm'], [dL, COL.green, 'lblLand'], [dO, '#4e83aa', 'lblOcean']].forEach(([v, c, k]) => { const ww = v / cum * L.w; ctx.fillStyle = c; ctx.fillRect(x, L.y, Math.max(0, ww), L.h); if (ww > 40) text(ctx, t(k) + ' ' + f0(v / cum * 100) + '%', x + ww / 2, L.y + L.h / 2 + 4, { align: 'center', size: 11, color: '#0a0e14', bold: true }); x += ww; }); }
  text(ctx, t('lblEmitted', { c: f0(cum) }), L.x, L.y - 10, { size: 12, color: COL.red, bold: true });
  text(ctx, t('lblWhere'), L.x, L.y + L.h + 22, { size: 11 });
  $('ro3').textContent = cum > 0 ? t('s3ro', { E: S.E3, yr: S.t3, cum: f0(cum), a: f0(dA), l: f0(dL), o: f0(dO), sum: f0(dA + dL + dO) }) : t('s3ro0');
}
function render4() {
  const { ctx, w, h } = setup($('cv4')), L = { x: 44, y: 14, w: w - 60, h: h - 46 }, ys = S.stop4, tr = simulate(stopAt(10, ys), 300), hi = Math.max(400, Math.ceil(toPpm(Math.max.apply(null, tr.map(s => s.A))) / 20) * 20 + 20);
  const P4 = curvePlot(ctx, L, [{ data: tr, col: COL.orange, lw: 3 }], 300, 260, hi); line(ctx, P4.X(ys), L.y, P4.X(ys), L.y + L.h, COL.red, 1.5, [4, 3]); text(ctx, t('lblStop'), P4.X(ys) + 4, L.y + 12, { size: 11, color: COL.red });
  [0, 100, 200, 300].forEach(yy => text(ctx, yy + '', P4.X(yy), L.y + L.h + 14, { align: 'center', size: 10 })); text(ctx, t('axYear'), L.x + L.w, L.y + L.h + 28, { align: 'right', size: 11 }); text(ctx, t('axPpm'), L.x + 4, L.y + 10, { size: 11 });
  const pk = tr[ys].A - P.A0, later = tr[Math.min(300, ys + 100)].A - P.A0; dot(ctx, P4.X(Math.min(300, ys + 100)), P4.Y(toPpm(tr[Math.min(300, ys + 100)].A)), 5, COL.cyan);
  $('ro4').textContent = t('s4ro', { ys: ys, pk: f0(toPpm(pk + P.A0)), later: f0(toPpm(later + P.A0)), rem: f0(later / pk * 100), end: f0(toPpm(tr[300].A)) });
}
function render5() {
  const { ctx, w, h } = setup($('cv5')), L = { x: 44, y: 14, w: w - 60, h: h - 46 }, cols = [COL.red, COL.orange, COL.green, COL.cyan], trs = SCEN.map(f => simulate(f, 150));
  const P5 = curvePlot(ctx, L, trs.map((d, i) => ({ data: d, col: cols[i], lw: i === S.sc ? 3.5 : 1.2 })), 150, 260, 620);
  [0, 50, 100, 150].forEach(yy => text(ctx, yy + '', P5.X(yy), L.y + L.h + 14, { align: 'center', size: 10 })); text(ctx, t('axYear'), L.x + L.w, L.y + L.h + 28, { align: 'right', size: 11 }); text(ctx, t('axPpm'), L.x + 4, L.y + 10, { size: 11 });
  scenName.forEach((k, i) => { const b = $('sc' + i); b.classList.toggle('active', i === S.sc); b.setAttribute('aria-pressed', i === S.sc ? 'true' : 'false'); });
  const tr = trs[S.sc], pk = Math.max.apply(null, tr.map(s => s.A));
  $('ro5').textContent = t('s5ro', { name: t(scenName[S.sc]), pk: f0(toPpm(pk)), end: f0(toPpm(tr[150].A)), cum: f0(tr[150].cum) });
}
function wire() {
  BOXES.forEach(id => $('bx' + id).addEventListener('click', () => { S.box = id; render0(); }));
  slider('imb1', v => { S.imb = v; render1(); }); slider('E2', v => { S.E2 = v; render2(); }); slider('yr2', v => { S.yr2 = v; render2(); });
  slider('E3', v => { S.E3 = v; render3(); }); slider('t3', v => { S.t3 = v; render3(); }); slider('stop4', v => { S.stop4 = v; render4(); });
  scenName.forEach((k, i) => $('sc' + i).addEventListener('click', () => { S.sc = i; render5(); }));
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

if (typeof module !== 'undefined') module.exports = { P, toPpm, fluxes, simulate, constE, stopAt, SCEN, airborne, boxInfo, netLand };
