/* three-views: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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

/* H[y][x]: y = 0 front row ... 2 back row; x = 0 left ... 2 right. Heights 0..3. */
const PRESETS = { pStairs: [[1, 2, 3], [1, 2, 3], [1, 2, 3]], pL: [[2, 2, 2], [0, 0, 2], [0, 0, 2]], pPyr: [[1, 1, 1], [1, 3, 1], [1, 1, 1]], pCorner: [[0, 0, 0], [0, 0, 0], [0, 0, 3]], pClear: [[0, 0, 0], [0, 0, 0], [0, 0, 0]] };
const copy = H => H.map(r => r.slice());
const countBlocks = H => H.reduce((s, r) => s + r.reduce((a, b) => a + b, 0), 0);
function views(H) { const f = [0, 1, 2].map(x => Math.max(H[0][x], H[1][x], H[2][x])), lf = [0, 1, 2].map(y => Math.max(H[y][0], H[y][1], H[y][2])); return { front: f, left: [lf[2], lf[1], lf[0]], leftByY: lf, top: H.map(r => r.map(v => v > 0 ? 1 : 0)) }; }
const topNumbers = H => [H[2], H[1], H[0]];
const viewsKey = H => { const v = views(H); return { f: v.front.join(','), l: v.left.join(','), t: v.top.map(r => r.join('')).join('/') }; };
/* Largest stack consistent with the front and left views; and with the top-view footprint as well. */
function maxFill(H) { const v = views(H); const M = [0, 1, 2].map(y => [0, 1, 2].map(x => Math.min(v.front[x], v.leftByY[y]))); const MT = M.map((r, y) => r.map((m, x) => v.top[y][x] ? m : 0)); return { max: M, maxTop: MT, n: countBlocks(M), nTop: countBlocks(MT) }; }
function surface(H) { const N = countBlocks(H); let sh = 0; for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) { sh += Math.max(0, H[y][x] - 1); if (x < 2) sh += Math.min(H[y][x], H[y][x + 1]); if (y < 2) sh += Math.min(H[y][x], H[y + 1][x]); } const foot = H.reduce((s, r) => s + r.filter(v => v > 0).length, 0); return { n: N, shared: sh, faces: 6 * N - 2 * sh, bottom: foot, paint: 6 * N - 2 * sh - foot }; }
const QUIZ = [{ target: 'pPyr', cands: ['pPyr', 'pStairs', 'pL'] }, { target: 'pL', cands: ['pCorner', 'pL', 'pPyr'] }, { target: 'pStairs', cands: ['pStairs', 'pL', 'pCorner'] }, { target: 'pCorner', cands: ['pPyr', 'pStairs', 'pCorner'] }];
const S = { H: copy(PRESETS.pL), showMax: false, q: 0, pick: -1, checked: false };
const fmt = v => String(v);
function proj(cx, cy, s, x, y, z) { return [cx + (x - y) * 0.87 * s, cy - (x + y) * 0.5 * s - z * s]; }
function polyP(ctx, pts, fill) { ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = '#0a0e14'; ctx.lineWidth = 1; ctx.stroke(); }
/* Draw the stack in isometric view; extra(x,y,z) marks cubes drawn in orange. */
function iso(ctx, box, H, extra) { const s = Math.min(box.w / (3 * 1.74 + 0.2), box.h / (3 + 3 + 0.5)), cx = box.x + box.w / 2, cy = box.y + box.h - s * 0.4 - 0;
  const list = []; for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) for (let z = 0; z < H[y][x]; z++) list.push({ x, y, z }); list.sort((a, b) => (b.x + b.y) - (a.x + a.y) || a.z - b.z);
  list.forEach(c => { const ex = extra && extra(c.x, c.y, c.z), col = ex ? ['#ffd2a0', '#e0a060', '#b87c3c'] : ['#8fe3ff', '#4fa9c7', '#2f7e99']; const P = (a, b, d) => proj(cx, cy, s, c.x + a, c.y + b, c.z + d);
    polyP(ctx, [P(0, 0, 1), P(1, 0, 1), P(1, 1, 1), P(0, 1, 1)], col[0]); polyP(ctx, [P(0, 0, 0), P(0, 1, 0), P(0, 1, 1), P(0, 0, 1)], col[1]); polyP(ctx, [P(0, 0, 0), P(1, 0, 0), P(1, 0, 1), P(0, 0, 1)], col[2]); }); }
function sq(ctx, x, y, u, fill, txt, strokeCol) { ctx.fillStyle = fill; ctx.fillRect(x, y, u - 1.5, u - 1.5); if (strokeCol) { ctx.strokeStyle = strokeCol; ctx.lineWidth = 2; ctx.strokeRect(x, y, u - 1.5, u - 1.5); } if (txt !== undefined) text(ctx, String(txt), x + u / 2, y + u / 2 + 5, { align: 'center', size: Math.max(11, u * 0.4), color: '#0a0e14', bold: true }); }
function drawFront(ctx, x0, y0, u, f, hl) { for (let c = 0; c < 3; c++) for (let z = 0; z < f[c]; z++) sq(ctx, x0 + c * u, y0 + (2 - z) * u, u, c === hl ? '#ffd2a0' : 'rgba(103,215,249,0.6)'); }
function drawLeft(ctx, x0, y0, u, l, hl) { for (let c = 0; c < 3; c++) for (let z = 0; z < l[c]; z++) sq(ctx, x0 + c * u, y0 + (2 - z) * u, u, 'rgba(116,223,170,0.6)'); }
function drawTop(ctx, x0, y0, u, H, hl, nums) { const T = topNumbers(H); for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { const v = T[r][c]; if (v > 0) sq(ctx, x0 + c * u, y0 + r * u, u, c === hl ? '#ffd2a0' : 'rgba(246,164,91,0.6)', nums ? v : undefined); else { ctx.strokeStyle = '#243846'; ctx.lineWidth = 1; ctx.strokeRect(x0 + c * u, y0 + r * u, u - 1.5, u - 1.5); } } }
const rowsText = H => [2, 1, 0].map(y => '[' + H[y].join(' ') + ']').join(' ');
function renderGrid() { const g = $('grid0'); for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { const y = 2 - r, b = $('g' + y + c); if (b) { b.textContent = S.H[y][c]; b.setAttribute('aria-label', t('gridLabel') + ': ' + (r + 1) + ',' + (c + 1) + ' = ' + S.H[y][c]); } } }
function render0() { const { ctx, w, h } = setup($('cv0')); iso(ctx, { x: 0, y: 0, w, h }, S.H); renderGrid(); $('ro0').textContent = t('s0ro', { n: countBlocks(S.H), rows: rowsText(S.H) }); }
function render1() { const { ctx, w, h, wide } = setup($('cv1')), v = views(S.H), H = S.H, u = Math.min(wide ? w / 11 : w / 10, h / 8, 34), gap = u * 1.2; const x1 = (w - (9 * u + 2 * gap)) / 2, y0 = (h - 3 * u - 22) / 2 + 14;
  [[t('front'), x1], [t('left'), x1 + 3 * u + gap], [t('top'), x1 + 6 * u + 2 * gap]].forEach(([nm, x]) => text(ctx, nm, x + 1.5 * u, y0 - 8, { align: 'center', size: 11, color: COL.ink }));
  drawFront(ctx, x1, y0, u, v.front, -1); drawLeft(ctx, x1 + 3 * u + gap, y0, u, v.left, -1); drawTop(ctx, x1 + 6 * u + 2 * gap, y0, u, H, -1, true);
  const cnt = a => a.reduce((s, q) => s + q, 0); $('ro1').textContent = t('s1ro', { fv: cnt(v.front), lv: cnt(v.left), tv: v.top.reduce((s, r) => s + cnt(r), 0), n: countBlocks(H) }); }
function render2() { const { ctx, w, h, wide } = setup($('cv2')), v = views(S.H), c = +$('c2').value - 1; $('c2v').textContent = c + 1; const u = Math.min(w / 8.5, h / 7.5, 36), gap = u * 0.8, x0 = (w - (6 * u + gap)) / 2, yTop = 18, yBot = yTop + 3 * u + gap;
  text(ctx, t('front'), x0 + 1.5 * u, 11, { align: 'center', size: 10 }); text(ctx, t('left'), x0 + 3 * u + gap + 1.5 * u, 11, { align: 'center', size: 10 }); text(ctx, t('top'), x0 + 1.5 * u, yBot - 4, { align: 'center', size: 10 });
  drawFront(ctx, x0, yTop, u, v.front, c); drawLeft(ctx, x0 + 3 * u + gap, yTop, u, v.left, -1); drawTop(ctx, x0, yBot, u, S.H, c, true);
  const fx = x0 + c * u + u / 2; line(ctx, fx, yTop, fx, yBot + 3 * u, COL.orange, 1.2, [4, 4]); const hy = yTop + (3 - v.front[c]) * u; line(ctx, x0, hy, x0 + 6 * u + gap, hy, COL.green, 1.2, [4, 4]); const by = yBot, bx2 = x0 + 3 * u + gap; line(ctx, x0 + 3 * u + 4, by, bx2 + 3 * u, by, COL.violet, 1, [3, 4]);
  const tn = topNumbers(S.H).reduce((s, r) => s + (r[c] > 0 ? 1 : 0), 0); $('ro2').textContent = t('s2ro', { c: c + 1, fh: v.front[c], tn, lh: Math.max.apply(null, v.left), fm: Math.max.apply(null, v.front), lm: Math.max.apply(null, v.left) }); }
function render3() { const { ctx, w, h, wide } = setup($('cv3')), mf = maxFill(S.H), M = S.showMax ? mf.max : S.H; iso(ctx, { x: 0, y: 0, w, h }, M, (x, y, z) => S.showMax && z >= S.H[y][x]); $('max3').setAttribute('aria-pressed', S.showMax ? 'true' : 'false'); const n = countBlocks(S.H);
  $('ro3').textContent = mf.n === n ? t('s3roNone', { n, mx: mf.n }) : t('s3ro', { n, mx: mf.n, extra: mf.n - n, mt: mf.nTop }); }
function renderQ() { const q = QUIZ[S.q % QUIZ.length], tH = PRESETS[q.target], k = ['A', 'B', 'C']; return { q, tH, k }; }
function render4() { const { ctx, w, h } = setup($('cv4')), { q, tH, k } = renderQ(), v = views(tH), u = Math.min(w / 12, h / 9, 22), gap = u * 1.2, x1 = (w - (9 * u + 2 * gap)) / 2, y0 = 18;
  [[t('front'), x1], [t('left'), x1 + 3 * u + gap], [t('top'), x1 + 6 * u + 2 * gap]].forEach(([nm, x]) => text(ctx, nm, x + 1.5 * u, y0 - 6, { align: 'center', size: 10, color: COL.ink })); drawFront(ctx, x1, y0, u, v.front, -1); drawLeft(ctx, x1 + 3 * u + gap, y0, u, v.left, -1); drawTop(ctx, x1 + 6 * u + 2 * gap, y0, u, tH, -1, true);
  const bw = w / 3; q.cands.forEach((id, i) => { const bx = { x: i * bw + 4, y: y0 + 3 * u + 14, w: bw - 8, h: h - (y0 + 3 * u + 14) - 4 }; ctx.strokeStyle = S.pick === i ? COL.orange : '#243846'; ctx.lineWidth = S.pick === i ? 3 : 1; ctx.strokeRect(bx.x, bx.y, bx.w, bx.h); iso(ctx, { x: bx.x + 6, y: bx.y + 16, w: bx.w - 12, h: bx.h - 20 }, PRESETS[id]); text(ctx, k[i], bx.x + 10, bx.y + 15, { size: 14, color: S.pick === i ? COL.orange : COL.ink, bold: true }); });
  ['qa', 'qb', 'qc'].forEach((id, i) => { const b = $(id); b.classList.toggle('active', S.pick === i); b.setAttribute('aria-pressed', S.pick === i ? 'true' : 'false'); });
  if (!S.checked || S.pick < 0) { $('ro4').textContent = t('s4roAsk'); return; } const correct = q.cands.indexOf(q.target), pk = viewsKey(PRESETS[q.cands[S.pick]]), tk = viewsKey(tH);
  $('ro4').textContent = S.pick === correct ? t('s4roOk', { x: k[correct] }) : t('s4roNo', { y: k[S.pick], x: k[correct], what: t(pk.f !== tk.f ? 'whatF' : pk.l !== tk.l ? 'whatL' : 'whatT') }); }
function render5() { const { ctx, w, h } = setup($('cv5')); iso(ctx, { x: 0, y: 0, w, h }, S.H); const sf = surface(S.H); $('ro5').textContent = t('s5ro', { n: sf.n, sh: sf.shared, sf: sf.faces, bt: sf.bottom, pt: sf.paint }); }
function presetRow(id) { const row = $(id); if (row.children.length) return; Object.keys(PRESETS).forEach(k => { const b = document.createElement('button'); b.dataset.preset = k; b.dataset.i18n = k; b.textContent = t(k); b.addEventListener('click', () => { S.H = copy(PRESETS[k]); S.showMax = false; renderAll(); }); row.appendChild(b); }); }
function wire() {
  presetRow('pre0'); presetRow('pre5'); const g = $('grid0'); for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { const y = 2 - r, b = document.createElement('button'); b.id = 'g' + y + c; b.dataset.step = '0'; b.addEventListener('click', () => { S.H[y][c] = (S.H[y][c] + 1) % 4; renderAll(); }); g.appendChild(b); }
  slider('c2', render2); $('max3').addEventListener('click', () => { S.showMax = !S.showMax; render3(); }); ['qa', 'qb', 'qc'].forEach((id, i) => $(id).addEventListener('click', () => { S.pick = i; S.checked = false; render4(); })); $('chk4').addEventListener('click', () => { S.checked = true; render4(); }); $('nx4').addEventListener('click', () => { S.q++; S.pick = -1; S.checked = false; render4(); });
  window.addEventListener('langchange', () => document.querySelectorAll('[data-preset]').forEach(b => b.textContent = t(b.dataset.preset)));
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
if (typeof module !== 'undefined') module.exports = { views,topNumbers,maxFill,surface,viewsKey,PRESETS,QUIZ,countBlocks };
