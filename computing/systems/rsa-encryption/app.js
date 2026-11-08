/* rsa-encryption: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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

const gcd = (a, b) => { while (b) { [a, b] = [b, a % b]; } return a; };
/* Extended Euclid: returns {g, x, y} with a*x + b*y = g, plus the table of steps. */
function egcd(a, b) { let r0 = a, r1 = b, s0 = 1, s1 = 0, u0 = 0, u1 = 1; const rows = [[r0, r1, 0, s0, u0]]; while (r1 !== 0) { const q = Math.floor(r0 / r1); [r0, r1] = [r1, r0 - q * r1]; [s0, s1] = [s1, s0 - q * s1]; [u0, u1] = [u1, u0 - q * u1]; rows.push([r0, r1, q, s0, u0]); } return { g: r0, x: s0, y: u0, rows }; }
const modInv = (e, phi) => { const r = egcd(e, phi); return r.g === 1 ? ((r.x % phi) + phi) % phi : null; };
/* Square-and-multiply modular exponentiation with BigInt so intermediate products never overflow. */
function modPow(b, e, n) { let r = 1n, x = BigInt(b) % BigInt(n), k = BigInt(e); const N = BigInt(n); while (k > 0n) { if (k & 1n) r = r * x % N; x = x * x % N; k >>= 1n; } return Number(r); }
function modPowSteps(e) { let k = e, sq = 0, mul = 0; while (k > 0) { sq++; if (k & 1) mul++; k = Math.floor(k / 2); } return sq + mul; }
const isPrime = n => { if (n < 2) return false; if (n % 2 === 0) return n === 2; for (let i = 3; i * i <= n; i += 2) if (n % i === 0) return false; return true; };
const nextPrime = x => { let n = Math.max(2, Math.ceil(x)); while (!isPrime(n)) n++; return n; };
const phiOf = n => { let r = n, m = n; for (let p = 2; p * p <= m; p++) if (m % p === 0) { while (m % p === 0) m /= p; r -= r / p; } if (m > 1) r -= r / m; return r; };
const orderSeq = (a, n) => { const seq = [1]; let x = a % n; while (!seq.includes(x) && seq.length < 200) { seq.push(x); x = x * a % n; } return { seq, back: x }; };
/* Trial division: how many odd candidates are tried before the smallest factor is found. */
function trialSteps(n) { if (n % 2 === 0) return { f: 2, steps: 1 }; let steps = 0; for (let d = 3; d * d <= n; d += 2) { steps++; if (n % d === 0) return { f: d, steps }; } return { f: n, steps }; }
const SMALL = [5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43];
const SEMI = (() => { const out = []; for (let k = 1; k <= 7; k++) { const p = nextPrime(Math.pow(10, k)), q = nextPrime(Math.pow(10, k) * 3 + 7); out.push({ k, p, q, n: p * q }); } return out; })();
/* General number field sieve work estimate in natural-log units: exp((64/9)^(1/3) (ln n)^(1/3) (ln ln n)^(2/3)); constants and lower-order terms ignored. */
const gnfsLog10 = bits => { const ln = bits * Math.LN2, v = Math.pow(64 / 9, 1 / 3) * Math.pow(ln, 1 / 3) * Math.pow(Math.log(ln), 2 / 3); return v / Math.LN10; };
const f1 = v => String(Math.round(v * 10) / 10), sciN = v => v < 1e6 ? String(Math.round(v)) : v.toExponential(1).replace('e+', '×10^');
const S = { k0: 4, a1: 3, n1: 14, ip: 5, iq: 7, ie: 0, m3: 42, k4: 5, run4: 0, tried4: 0, found4: null, raf4: 0, bits5: 2048 };
const RATE = 1e18;
function keyset() { const p = SMALL[S.ip], q = SMALL[S.iq === S.ip ? (S.iq + 1) % SMALL.length : S.iq]; const n = p * q, phi = (p - 1) * (q - 1), es = []; for (let e = 3; e < phi && es.length < 8; e += 2) if (gcd(e, phi) === 1) es.push(e); const e = es[Math.min(S.ie, es.length - 1)], d = modInv(e, phi); return { p, q, n, phi, es, e, d }; }
function axes(ctx, R, xl, yl) { ctx.strokeStyle = COL.grid; ctx.lineWidth = 1; ctx.strokeRect(R.x, R.y, R.w, R.h); if (xl) text(ctx, xl, R.x + R.w, R.y + R.h + 27, { align: 'right', size: 11 }); if (yl) text(ctx, yl, R.x, R.y - 5, { size: 11 }); }
function render0() { const { ctx, w, h } = setup($('cv0')), R = { x: 52, y: 22, w: w - 68, h: h - 76 }, kk = S.k0, Y = lg => R.y + R.h - lg / 16 * R.h; axes(ctx, R, t('digitsAxis'), t('opsAxis')); [0, 4, 8, 12, 16].forEach(v => { line(ctx, R.x, Y(v), R.x + R.w, Y(v), COL.grid, 1); text(ctx, '10^' + v, R.x - 4, Y(v) + 4, { align: 'right', size: 10 }); });
  const X = k => R.x + (k - 1) / 29 * R.w; const pts = []; for (let k = 1; k <= 30; k++) pts.push(k); ctx.strokeStyle = COL.red; ctx.lineWidth = 2.5; ctx.beginPath(); pts.forEach((k, i) => { const lg = Math.log10(Math.pow(10, k) / 2) * 1; i ? ctx.lineTo(X(k), Y(Math.min(16, lg))) : ctx.moveTo(X(k), Y(Math.min(16, lg))); }); ctx.stroke(); line(ctx, X(1), Y(Math.log10(2)), X(30), Y(Math.log10(2)), COL.green, 2.5);
  SEMI.forEach(s => dot(ctx, X(s.k), Y(Math.log10(Math.max(1, trialSteps(s.n).steps))), 4.5, COL.orange)); [5, 10, 15, 20, 25, 30].forEach(k => text(ctx, String(k), X(k), R.y + R.h + 13, { align: 'center', size: 10 })); text(ctx, t('legMul'), R.x + 8, R.y + 14, { size: 12, color: COL.green }); text(ctx, t('legFac'), R.x + 8, R.y + 30, { size: 12, color: COL.red }); text(ctx, t('legMeasured'), R.x + 8, R.y + 46, { size: 12, color: COL.orange }); line(ctx, X(kk), R.y, X(kk), R.y + R.h, COL.ink, 1.5, [4, 3]);
  const nd = 2 * kk, steps = kk <= 7 ? trialSteps(SEMI[kk - 1].n).steps : Math.pow(10, kk) / 2; $('k0v').textContent = kk; $('ro0').textContent = t('s0ro', { k: kk, nd, mul: 1, fac: sciN(steps), how: t(kk <= 7 ? 'measured' : 'extrap'), sec: sciN(steps / 1e9) }); }
function render1() { const { ctx, w, h } = setup($('cv1')), n = S.n1, a = Math.min(S.a1, n - 1), o = orderSeq(a, n), cx = w * 0.5, cy = h * 0.5, rad = Math.min(w, h) * 0.38, pos = i => [cx + rad * Math.sin(6.2832 * i / n), cy - rad * Math.cos(6.2832 * i / n)];
  for (let i = 0; i < n; i++) { const p = pos(i); dot(ctx, p[0], p[1], 3, COL.grid); text(ctx, String(i), cx + (rad + 14) * Math.sin(6.2832 * i / n), cy - (rad + 14) * Math.cos(6.2832 * i / n) + 4, { align: 'center', size: 10 }); }
  o.seq.forEach((v, i) => { const p = pos(v), q = pos(i + 1 < o.seq.length ? o.seq[i + 1] : o.back); line(ctx, p[0], p[1], q[0], q[1], i === 0 ? COL.green : COL.cyan, 2); dot(ctx, p[0], p[1], 6, i === 0 ? COL.green : COL.cyan); text(ctx, String(i), p[0] + 6, p[1] - 6, { size: 10, color: COL.orange }); });
  const g = gcd(a, n), ph = phiOf(n), full = g === 1 && modPow(a, ph, n) === 1; $('a1v').textContent = a; $('n1v').textContent = n; $('ro1').textContent = t('s1ro', { a, n, len: o.seq.length - o.seq.indexOf(o.back), seq: o.seq.slice(0, 10).join(', ') + (o.seq.length > 10 ? ' …' : ''), g, phi: ph, chk: t(g === 1 ? (full ? 'chkYes' : 'chkNo') : 'chkNA', { a, phi: ph }), r: modPow(a, ph, n) }); }
function render2() { const { ctx, w, h } = setup($('cv2')), K = keyset(), eg = egcd(K.e, K.phi), rows = eg.rows.slice(0, 9), x0 = 10, lh = 20, y0 = 26;
  text(ctx, t('euclidTitle', { e: K.e, phi: K.phi }), x0, 16, { size: 12, color: COL.orange }); const cols = [x0, x0 + w * 0.17, x0 + w * 0.34, x0 + w * 0.5, x0 + w * 0.66]; ['r₀', 'r₁', 'q', 'x', 'y'].forEach((c, i) => text(ctx, c, cols[i] + 20, y0 + 6, { size: 11, color: COL.muted, align: 'center' })); rows.forEach((r, i) => r.forEach((v, j) => text(ctx, String(v), cols[j] + 20, y0 + 6 + (i + 1) * lh, { size: 11, color: i === rows.length - 1 && j === 3 ? COL.green : COL.ink, align: 'center' })));
  const ky = y0 + 6 + (rows.length + 2) * lh, bw = Math.min(w * 0.46, 200); [[COL.cyan, t('pubKey'), '(e, n) = (' + K.e + ', ' + K.n + ')', 0], [COL.red, t('privKey'), '(d, n) = (' + K.d + ', ' + K.n + ')', 1]].forEach(([col, lab, val, i]) => { const x = x0 + i * (bw + 12); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.strokeRect(x, ky, bw, 52); text(ctx, lab, x + 8, ky + 18, { size: 12, color: col }); text(ctx, val, x + 8, ky + 40, { size: 14, color: COL.ink, bold: true }); });
  $('ipo').textContent = K.p; $('iqo').textContent = K.q; $('ie2o').textContent = K.e; const ok = (K.e * K.d) % K.phi === 1;
  $('ro2').textContent = t('s2ro', { p: K.p, q: K.q, n: K.n, phi: K.phi, e: K.e, d: K.d, prod: K.e * K.d, k: (K.e * K.d - 1) / K.phi, ok: t(ok ? 'yes' : 'no'), es: K.es.join(', ') }); }
function render3() { const { ctx, w, h } = setup($('cv3')), K = keyset(); $('m3').max = K.n - 1; const m = Math.min(S.m3, K.n - 1), c = modPow(m, K.e, K.n), back = modPow(c, K.d, K.n), R = { x: 40, y: 18, w: w - 56, h: h - 100 }, X = v => R.x + v / K.n * R.w, Y = v => R.y + R.h - v / K.n * R.h;
  axes(ctx, R, t('mAxis'), t('cAxis')); let allOk = 0; for (let v = 0; v < K.n; v++) { const cc = modPow(v, K.e, K.n); if (modPow(cc, K.d, K.n) === v) allOk++; dot(ctx, X(v), Y(cc), 1.8, 'rgba(103,215,249,0.7)'); } dot(ctx, X(m), Y(c), 6, COL.orange); line(ctx, X(m), Y(0), X(m), Y(c), COL.orange, 1, [3, 3]);
  const by = R.y + R.h + 34; [[t('plain'), m, COL.green], [t('cipher'), c, COL.orange], [t('decrypted'), back, COL.green]].forEach(([lab, v, col], i) => { const x = 10 + i * (w - 20) / 3; text(ctx, lab, x, by, { size: 11, color: COL.muted }); text(ctx, String(v), x, by + 22, { size: 18, color: col, bold: true }); if (i < 2) text(ctx, i === 0 ? '→ m^e mod n' : '→ c^d mod n', x + (w - 20) / 6, by + 22, { size: 10, color: COL.muted }); });
  $('m3v').textContent = m; $('ro3').textContent = t('s3ro', { m, e: K.e, n: K.n, c, d: K.d, back, ok: t(back === m ? 'yes' : 'no'), all: allOk, tot: K.n, sq: modPowSteps(K.e), sq2: modPowSteps(K.d) }); }
function render4() { const { ctx, w, h } = setup($('cv4')), s = SEMI[S.k4 - 1], R = { x: 14, y: 40, w: w - 28, h: 22 }, tot = trialSteps(s.n).steps, frac = Math.min(1, S.tried4 / Math.max(1, tot)), alice = modPowSteps(65537) + modPowSteps(s.n);
  text(ctx, t('eveScan', { n: s.n }), R.x, 28, { size: 12, color: COL.red }); ctx.fillStyle = COL.dim; ctx.fillRect(R.x, R.y, R.w, R.h); ctx.fillStyle = COL.red; ctx.fillRect(R.x, R.y, R.w * frac, R.h); text(ctx, t('tried', { k: sciN(S.tried4) }), R.x + 6, R.y + 15, { size: 11, color: '#0a0e14', bold: true });
  text(ctx, t('aliceWork'), R.x, R.y + R.h + 34, { size: 12, color: COL.green }); const aw = Math.max(2, R.w * Math.log10(alice + 1) / Math.log10(tot + 10)); ctx.fillStyle = COL.dim; ctx.fillRect(R.x, R.y + R.h + 42, R.w, 18); ctx.fillStyle = COL.green; ctx.fillRect(R.x, R.y + R.h + 42, aw, 18); text(ctx, t('aliceSteps', { k: alice }), R.x + 6, R.y + R.h + 55, { size: 11, color: '#0a0e14', bold: true });
  text(ctx, t('logNote'), R.x, h - 8, { size: 10 }); $('k4o').textContent = s.n; const done = S.found4 !== null; $('run4').textContent = t(S.run4 ? 'pause' : 'run');
  $('ro4').textContent = done ? t('s4roDone', { n: s.n, p: S.found4, q: s.n / S.found4, steps: sciN(tot), alice, ratio: sciN(tot / alice) }) : t('s4ro', { n: s.n, steps: sciN(tot), alice, tried: sciN(S.tried4) }); }
function render5() { const { ctx, w, h } = setup($('cv5')), R = { x: 52, y: 22, w: w - 68, h: h - 62 }, X = b => R.x + (b - 64) / (4096 - 64) * R.w, Y = lg => R.y + R.h - lg / 80 * R.h; axes(ctx, R, t('bitsAxis'), t('opsAxis2')); [0, 20, 40, 60, 80].forEach(v => { line(ctx, R.x, Y(v), R.x + R.w, Y(v), COL.grid, 1); text(ctx, '10^' + v, R.x - 4, Y(v) + 4, { align: 'right', size: 10 }); }); [512, 1024, 2048, 3072, 4096].forEach(b => text(ctx, String(b), X(b), R.y + R.h + 13, { align: 'center', size: 10 }));
  const lgY = lg => Y(lg); line(ctx, R.x, lgY(Math.log10(RATE * 3.15e7 * 13.8e9)), R.x + R.w, lgY(Math.log10(RATE * 3.15e7 * 13.8e9)), COL.red, 1.5, [5, 4]); text(ctx, t('ageLine'), R.x + R.w - 4, lgY(Math.log10(RATE * 3.15e7 * 13.8e9)) - 5, { align: 'right', size: 10, color: COL.red });
  ctx.strokeStyle = COL.orange; ctx.lineWidth = 2.5; ctx.beginPath(); for (let i = 0; i <= 120; i++) { const b = 64 + (4096 - 64) * i / 120, lg = gnfsLog10(b); i ? ctx.lineTo(X(b), Y(lg)) : ctx.moveTo(X(b), Y(lg)); } ctx.stroke(); const b = S.bits5, lg = gnfsLog10(b); line(ctx, X(b), R.y, X(b), R.y + R.h, COL.muted, 1, [4, 3]); dot(ctx, X(b), Y(lg), 6, COL.orange);
  const yrs = lg - Math.log10(RATE) - Math.log10(3.15e7); $('bits5v').textContent = b; $('ro5').textContent = t('s5ro', { b, lg: f1(lg), yrs: f1(yrs), verdict: t(yrs < -4 ? 'vTrivial' : yrs < 2 ? 'vFeasible' : 'vLong') }); }
function run4step() { const s = SEMI[S.k4 - 1]; const t0 = performance.now(); let d = 3 + 2 * S.tried4; while (performance.now() - t0 < 12 && S.found4 === null) { for (let i = 0; i < 4000; i++) { if (d * d > s.n) { S.found4 = s.n; break; } if (s.n % d === 0) { S.found4 = d; break; } d += 2; S.tried4++; } } }
function tick4() { if (!S.run4) return; run4step(); render4(); if (S.found4 !== null) { S.run4 = 0; render4(); return; } S.raf4 = requestAnimationFrame(tick4); }
function onHide() { S.run4 = 0; cancelAnimationFrame(S.raf4); render4(); }
function wire() {
  slider('k0', v => { S.k0 = v; render0(); }); slider('a1', v => { S.a1 = v; render1(); }); slider('n1', v => { S.n1 = v; if (S.a1 >= v) S.a1 = v - 1; $('a1').max = v - 1; if (+$('a1').value >= v) $('a1').value = v - 1; render1(); });
  slider('ip', v => { S.ip = v; S.ie = 0; render2(); render3(); }); slider('iq', v => { S.iq = v; S.ie = 0; render2(); render3(); }); slider('ie2', v => { S.ie = v; render2(); render3(); }); slider('m3', v => { S.m3 = v; render3(); });
  slider('k4', v => { S.run4 = 0; cancelAnimationFrame(S.raf4); S.k4 = v; S.tried4 = 0; S.found4 = null; render4(); }); $('run4').addEventListener('click', () => { if (S.found4 !== null) return; S.run4 = S.run4 ? 0 : 1; if (S.run4) S.raf4 = requestAnimationFrame(tick4); render4(); }); $('rs4').addEventListener('click', () => { S.run4 = 0; cancelAnimationFrame(S.raf4); S.tried4 = 0; S.found4 = null; render4(); }); slider('bits5', v => { S.bits5 = v; render5(); });
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
if (typeof module !== 'undefined') module.exports = { gcd, egcd, modInv, modPow, modPowSteps, isPrime, nextPrime, phiOf, orderSeq, trialSteps, SMALL, SEMI, gnfsLog10 };
