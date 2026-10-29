/* magnets: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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

/* Model in centimetres, y up. Each magnet: length 4 cm, N pole (+1) at one end and S pole (-1) at the other. */
const LEN = 4;
function polesOf(cx, cy, flip) { const s = flip ? -1 : 1; return [{ x: cx + s * LEN / 2, y: cy, q: 1 }, { x: cx - s * LEN / 2, y: cy, q: -1 }]; }
function fieldAt(x, y, poles) { let bx = 0, by = 0; poles.forEach(p => { const dx = x - p.x, dy = y - p.y, r2 = dx * dx + dy * dy + 1e-6, r = Math.sqrt(r2); bx += p.q * dx / (r2 * r); by += p.q * dy / (r2 * r); }); return [bx, by]; }
/* Net x-force on poles B from poles A: like charges repel, unlike attract, inverse-square. */
function forceBetween(A, B) { let fx = 0; B.forEach(b => A.forEach(a => { const dx = b.x - a.x, dy = b.y - a.y, r2 = dx * dx + dy * dy, r = Math.sqrt(r2); fx += b.q * a.q * dx / (r2 * r); })); return fx; }
/* Trace a field line from (x,y) in model units; stops at an S pole, outside the box, or after n steps. */
function traceLine(x, y, poles, box, dir) { const pts = [[x, y]]; for (let i = 0; i < 900; i++) { const [bx, by] = fieldAt(x, y, poles), m = Math.hypot(bx, by) || 1e-9; x += dir * 0.06 * bx / m; y += dir * 0.06 * by / m; pts.push([x, y]); if (x < box.x0 || x > box.x1 || y < box.y0 || y > box.y1) break; if (poles.some(p => (dir > 0 ? p.q < 0 : p.q > 0) && Math.hypot(x - p.x, y - p.y) < 0.12)) break; } return pts; }
const sideProfile = (x, h) => { const [bx, by] = fieldAt(x, h, polesOf(0, 0, false)); return Math.hypot(bx, by); };
function piecePoles(n, gap) { const total = LEN, plen = (total - 0) / n, poles = []; for (let i = 0; i < n; i++) { const left = -total / 2 + i * plen + (i - (n - 1) / 2) * gap, right = left + plen; poles.push({ x: right, y: 0, q: 1 }, { x: left, y: 0, q: -1 }); }
  const merged = []; poles.forEach(p => { const m = merged.find(o => Math.abs(o.x - p.x) < 1e-6); if (m) m.q += p.q; else merged.push({ ...p }); }); return merged.filter(p => Math.abs(p.q) > 1e-9); }
const needleAngle = (x, y, poles) => { const [bx, by] = fieldAt(x, y, poles); return ((Math.atan2(by, bx) * 180 / Math.PI) + 360) % 360; };
const f2 = v => String(Math.round(v * 100) / 100);
const S = { face: 'NS', cfg: 'S', mode: 'F', ring: false, c5: 0, pick: -1, checked: false };
const CFG = { S: [[0, 0, false]], A: [[-3.2, 0, false], [3.2, 0, false]], R: [[-3.2, 0, false], [3.2, 0, true]] };
const polesFor = cfg => CFG[cfg].reduce((a, m) => a.concat(polesOf(m[0], m[1], m[2])), []);
function frame(w, h, wcm) { const pc = w / wcm; return { pc, X: x => w / 2 + x * pc, Y: y => h / 2 - y * pc, box: { x0: -wcm / 2, x1: wcm / 2, y0: -h / 2 / pc, y1: h / 2 / pc } }; }
function drawMagnet(ctx, f, cx, cy, flip, labels) { const s = flip ? -1 : 1, pc = f.pc, th = 0.9 * pc, x0 = f.X(cx - LEN / 2), x1 = f.X(cx + LEN / 2), y = f.Y(cy) - th / 2, mid = (x0 + x1) / 2; const nCol = '#d9645a', sCol = '#5a8fd9'; const leftN = flip;
  ctx.fillStyle = labels ? (leftN ? nCol : sCol) : '#6b7a88'; ctx.fillRect(x0, y, mid - x0, th); ctx.fillStyle = labels ? (leftN ? sCol : nCol) : '#6b7a88'; ctx.fillRect(mid, y, x1 - mid, th); ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.5; ctx.strokeRect(x0, y, x1 - x0, th);
  if (labels) { text(ctx, t(leftN ? 'north' : 'south'), (x0 + mid) / 2, y + th * 0.68, { align: 'center', size: Math.max(11, th * 0.5), color: '#fff', bold: true }); text(ctx, t(leftN ? 'south' : 'north'), (mid + x1) / 2, y + th * 0.68, { align: 'center', size: Math.max(11, th * 0.5), color: '#fff', bold: true }); } }
function filings(ctx, f, poles, w, h, hide) { const g = Math.max(11, w / 30); for (let px = g / 2; px < w; px += g) for (let py = g / 2; py < h; py += g) { const x = (px - w / 2) / f.pc, y = (h / 2 - py) / f.pc; if (hide && hide(x, y)) continue; const [bx, by] = fieldAt(x, y, poles), b = Math.hypot(bx, by), a = Math.max(0.12, Math.min(1, Math.sqrt(b / 0.9))), ang = Math.atan2(-by, bx), l = g * 0.38;
  ctx.strokeStyle = 'rgba(205,215,225,' + a + ')'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(px - Math.cos(ang) * l, py - Math.sin(ang) * l); ctx.lineTo(px + Math.cos(ang) * l, py + Math.sin(ang) * l); ctx.stroke(); } }
function fieldLines(ctx, f, poles, n) { poles.filter(p => p.q > 0).forEach(p => { for (let k = 0; k < n; k++) { const a = 2 * Math.PI * (k + 0.5) / n, pts = traceLine(p.x + 0.1 * Math.cos(a), p.y + 0.1 * Math.sin(a), poles, f.box, 1); ctx.strokeStyle = COL.cyan; ctx.lineWidth = 1.6; ctx.beginPath(); pts.forEach((q, i) => i ? ctx.lineTo(f.X(q[0]), f.Y(q[1])) : ctx.moveTo(f.X(q[0]), f.Y(q[1]))); ctx.stroke(); const m = pts[Math.floor(pts.length / 2)], m2 = pts[Math.floor(pts.length / 2) + 2] || m; if (pts.length > 6) { const an = Math.atan2(-(m2[1] - m[1]), m2[0] - m[0]); ctx.fillStyle = COL.cyan; ctx.beginPath(); ctx.moveTo(f.X(m[0]) + Math.cos(an) * 5, f.Y(m[1]) + Math.sin(an) * 5); ctx.lineTo(f.X(m[0]) - Math.cos(an) * 4 + Math.sin(an) * 3.5, f.Y(m[1]) - Math.sin(an) * 4 - Math.cos(an) * 3.5); ctx.lineTo(f.X(m[0]) - Math.cos(an) * 4 - Math.sin(an) * 3.5, f.Y(m[1]) - Math.sin(an) * 4 + Math.cos(an) * 3.5); ctx.fill(); } } }); }
const inMagnets = (cfg, pad) => (x, y) => CFG[cfg].some(m => Math.abs(x - m[0]) < LEN / 2 + pad && Math.abs(y - m[1]) < 0.45 + pad);
function render0() { const { ctx, w, h } = setup($('cv0')), x = +$('p0').value; $('p0v').textContent = x; const top = h * 0.55, f = frame(w, top, 16), poles = polesOf(0, 0, false); filings(ctx, f, poles, w, top, inMagnets('S', 0.05)); drawMagnet(ctx, f, 0, 0, false, true);
  const xm = (x - 0.5) * LEN; dot(ctx, f.X(xm), f.Y(0) - 0.9 * f.pc / 2 - 0.5 * f.pc, 6, COL.orange);
  const L = { x: 36, y: top + 14, w: w - 52, h: h - top - 38 }, X = v => L.x + (v / LEN + 0.5) * L.w, hs = 0.5, bmax = sideProfile(LEN / 2, hs), Y = v => L.y + L.h - v / (bmax * 1.1) * L.h;
  line(ctx, L.x, L.y, L.x, L.y + L.h, COL.grid, 1); line(ctx, L.x, L.y + L.h, L.x + L.w, L.y + L.h, COL.grid, 1); text(ctx, 'B', L.x - 8, L.y + 8, { align: 'right', size: 11 }); ctx.strokeStyle = COL.cyan; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i <= 80; i++) { const xx = -LEN / 2 + LEN * i / 80, y = Y(sideProfile(xx, hs)); i ? ctx.lineTo(X(xx), y) : ctx.moveTo(X(xx), y); } ctx.stroke();
  dot(ctx, X(xm), Y(sideProfile(xm, hs)), 6, COL.orange); text(ctx, t('south'), X(-LEN / 2), L.y + L.h + 14, { align: 'center', size: 11 }); text(ctx, t('north'), X(LEN / 2), L.y + L.h + 14, { align: 'center', size: 11 });
  $('ro0').textContent = t('s0ro', { x: f2(x), b: f2(sideProfile(xm, hs)), bmax: f2(bmax), bmid: f2(sideProfile(0, hs)) }); }
function render1() { const { ctx, w, h } = setup($('cv1')), gap = +$('g1').value; $('g1v').textContent = gap; ['NS', 'NN'].forEach(x => { const b = $('f' + x); b.classList.toggle('active', x === S.face); b.setAttribute('aria-pressed', x === S.face ? 'true' : 'false'); });
  const f = frame(w, h, 20), c2 = LEN + gap, A = polesOf(-c2 / 2 - 0, 0, false).map(p => ({ ...p, x: p.x - 0 })), flip = S.face === 'NN', cx1 = -(c2 / 2), cx2 = c2 / 2; const pa = polesOf(cx1, 0, false), pb = polesOf(cx2, 0, flip), F = forceBetween(pa, pb);
  drawMagnet(ctx, f, cx1, 0, false, true); drawMagnet(ctx, f, cx2, 0, flip, true); const len = Math.max(-h * 0.45, Math.min(h * 0.45, F * 60)), x0 = f.X(cx2 + LEN / 2) + 8; const sgn = F >= 0 ? 1 : -1, y = f.Y(0) + h * 0.28;
  line(ctx, f.X(cx2), y, f.X(cx2) + len * 2, y, COL.green, 5); ctx.fillStyle = COL.green; ctx.beginPath(); ctx.moveTo(f.X(cx2) + len * 2 + sgn * 10, y); ctx.lineTo(f.X(cx2) + len * 2, y - 7); ctx.lineTo(f.X(cx2) + len * 2, y + 7); ctx.fill();
  $('ro1').textContent = t('s1ro', { face: t(S.face === 'NS' ? 'faceNS' : 'faceNN'), gap, f: f2(Math.abs(F)), dir: t(F < 0 ? 'attract' : 'repel') }); }
function render2() { const { ctx, w, h } = setup($('cv2')), f = frame(w, h, 16), poles = polesFor(S.cfg), n = +$('nl2').value; $('nl2v').textContent = n;
  [['S', 'cS'], ['A', 'cA'], ['R', 'cR']].forEach(([c, id]) => { const b = $(id); b.classList.toggle('active', c === S.cfg); b.setAttribute('aria-pressed', c === S.cfg ? 'true' : 'false'); }); [['F', 'mF'], ['L', 'mL']].forEach(([c, id]) => { const b = $(id); b.classList.toggle('active', c === S.mode); b.setAttribute('aria-pressed', c === S.mode ? 'true' : 'false'); });
  if (S.mode === 'F') filings(ctx, f, poles, w, h, inMagnets(S.cfg, 0.05)); else fieldLines(ctx, f, poles, n); CFG[S.cfg].forEach(m => drawMagnet(ctx, f, m[0], m[1], m[2], true));
  $('ro2').textContent = t('s2ro', { cfg: t({ S: 'cfgSingle', A: 'cfgAttract', R: 'cfgRepel' }[S.cfg]), mode: t(S.mode === 'F' ? 'showFil' : 'showLines'), note: t({ S: 'noteSingle', A: 'noteAttract', R: 'noteRepel' }[S.cfg]) }); }
function compass(ctx, px, py, r, ang) { ctx.fillStyle = '#0f1c29'; ctx.beginPath(); ctx.arc(px, py, r, 0, 6.2832); ctx.fill(); ctx.strokeStyle = COL.muted; ctx.lineWidth = 1.5; ctx.stroke(); const a = -ang * Math.PI / 180, dx = Math.cos(a), dy = Math.sin(a);
  line(ctx, px, py, px + dx * r * 0.85, py + dy * r * 0.85, '#d9645a', 3.5); line(ctx, px, py, px - dx * r * 0.85, py - dy * r * 0.85, '#5a8fd9', 3.5); dot(ctx, px, py, 2, COL.ink); }
function render3() { const { ctx, w, h } = setup($('cv3')), f = frame(w, h, 16), poles = polesOf(0, 0, false), x = +$('x3').value, y = +$('y3').value; $('x3v').textContent = x; $('y3v').textContent = y; $('ring3').textContent = t(S.ring ? 'noring' : 'ring'); $('ring3').setAttribute('aria-pressed', S.ring ? 'true' : 'false');
  filings(ctx, f, poles, w, h, inMagnets('S', 0.05)); ctx.fillStyle = 'rgba(10,14,20,0.55)'; ctx.fillRect(0, 0, w, h); drawMagnet(ctx, f, 0, 0, false, true);
  if (S.ring) for (let k = 0; k < 16; k++) { const a = 2 * Math.PI * k / 16, cx = 5.2 * Math.cos(a), cy = 3 * Math.sin(a); compass(ctx, f.X(cx), f.Y(cy), Math.max(9, f.pc * 0.5), needleAngle(cx, cy, poles)); }
  compass(ctx, f.X(x), f.Y(y), Math.max(12, f.pc * 0.65), needleAngle(x, y, poles)); ctx.strokeStyle = COL.orange; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(f.X(x), f.Y(y), Math.max(12, f.pc * 0.65) + 3, 0, 6.2832); ctx.stroke();
  const b = fieldAt(x, y, poles); $('ro3').textContent = t('s3ro', { x, y, a: Math.round(needleAngle(x, y, poles)), b: f2(Math.hypot(b[0], b[1])) }); }
function render4() { const { ctx, w, h } = setup($('cv4')), n = +$('n4').value, g = +$('g4').value; $('n4v').textContent = n; $('g4v').textContent = g; const f = frame(w, h, 16), poles = piecePoles(n, g), plen = LEN / n;
  filings(ctx, f, poles, w, h, (x, y) => { for (let i = 0; i < n; i++) { const c = -LEN / 2 + (i + 0.5) * plen + (i - (n - 1) / 2) * g; if (Math.abs(x - c) < plen / 2 + 0.05 && Math.abs(y) < 0.5) return true; } return false; });
  for (let i = 0; i < n; i++) { const c = -LEN / 2 + (i + 0.5) * plen + (i - (n - 1) / 2) * g, x0 = f.X(c - plen / 2), x1 = f.X(c + plen / 2), th = 0.9 * f.pc, y = f.Y(0) - th / 2, mid = (x0 + x1) / 2; ctx.fillStyle = '#5a8fd9'; ctx.fillRect(x0, y, mid - x0, th); ctx.fillStyle = '#d9645a'; ctx.fillRect(mid, y, x1 - mid, th); ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.2; ctx.strokeRect(x0, y, x1 - x0, th);
    if (g > 0.01 || n === 1) { text(ctx, t('south'), (x0 + mid) / 2, y + th * 0.68, { align: 'center', size: 11, color: '#fff', bold: true }); text(ctx, t('north'), (mid + x1) / 2, y + th * 0.68, { align: 'center', size: 11, color: '#fff', bold: true }); } }
  $('ro4').textContent = t('s4ro', { n, g, what: g < 0.05 && n > 1 ? t('whatTouch') : t('whatApart') }); }
const QUIZ = ['A', 'R', 'S', 'R', 'A', 'S'], QKEY = { S: 'noteSingle', A: 'noteAttract', R: 'noteRepel' };
function render5() { const { ctx, w, h } = setup($('cv5')), c = QUIZ[S.c5 % QUIZ.length], f = frame(w, h, 16), poles = polesFor(c); filings(ctx, f, poles, w, h, inMagnets(c, 0.05));
  CFG[c].forEach(m => drawMagnet(ctx, f, m[0], m[1], m[2], S.checked)); if (!S.checked) { ctx.fillStyle = 'rgba(138,160,173,0.0)'; }
  ['S', 'A', 'R'].forEach((x, i) => { const b = $('q' + i); b.classList.toggle('active', S.pick === x); b.setAttribute('aria-pressed', S.pick === x ? 'true' : 'false'); });
  if (!S.checked || !S.pick) { $('ro5').textContent = t('s5ro'); return; } $('ro5').textContent = S.pick === c ? t('s5roOk', { note: t(QKEY[c]) }) : t('s5roNo', { note: t(QKEY[c]) }); }
function wire() {
  slider('p0', render0); $('fNS').addEventListener('click', () => { S.face = 'NS'; render1(); }); $('fNN').addEventListener('click', () => { S.face = 'NN'; render1(); }); slider('g1', render1);
  [['cS', 'S'], ['cA', 'A'], ['cR', 'R']].forEach(([id, c]) => $(id).addEventListener('click', () => { S.cfg = c; render2(); })); $('mF').addEventListener('click', () => { S.mode = 'F'; render2(); }); $('mL').addEventListener('click', () => { S.mode = 'L'; render2(); }); slider('nl2', render2);
  slider('x3', render3); slider('y3', render3); $('ring3').addEventListener('click', () => { S.ring = !S.ring; render3(); }); slider('n4', render4); slider('g4', render4);
  ['S', 'A', 'R'].forEach((c, i) => $('q' + i).addEventListener('click', () => { S.pick = c; S.checked = false; render5(); })); $('chk5').addEventListener('click', () => { S.checked = true; render5(); }); $('nx5').addEventListener('click', () => { S.c5++; S.pick = -1; S.checked = false; render5(); });
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
if (typeof module !== 'undefined') module.exports = { fieldAt,polesOf,forceBetween,traceLine,sideProfile,piecePoles,needleAngle };
