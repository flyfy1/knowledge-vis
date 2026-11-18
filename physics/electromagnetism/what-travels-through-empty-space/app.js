/* What travels through empty space: i18n runtime, wiring and drawing. All visible text comes from copy.*.js (generated
   from content.<lang>.md by scripts/build-pages.cjs); the static diagrams are inline SVG partials (figures/dg-*.html).
   The runtime head follows computing/systems/how-a-cpu-does-math/app.js. Numbers and SI unit symbols are
   language-neutral and come from models.js. */
(() => {
'use strict';
const M = window.EmWaveModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const C = { bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', dimfill: '#3a4254', card2: '#1a1f2b', slate: '#8fa3c8' };
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ───────── language ─────────
   content.en.md is a structural stub while the translation is pending: page.json declares "languages": {"en": "stub"},
   the build writes data-lang-en="stub" on <html>, and the page treats English as absent (specs/site-template.md §9a). */
const LS = 'knowledge-lang';
let memLang = null;
function readLang() { try { return localStorage.getItem(LS); } catch (e) { return memLang; } }
function writeLang(v) { memLang = v; try { localStorage.setItem(LS, v); } catch (e) { /* in-memory fallback */ } }
let lang = readLang();
if (lang !== 'zh' && lang !== 'en') lang = /^zh/i.test(navigator.language || '') ? 'zh' : 'en';
const enStub = !COPY.en || document.documentElement.dataset.langEn === 'stub';
const hasLang = l => !!COPY[l] && !(l === 'en' && enStub);
const effLang = () => (hasLang(lang) ? lang : 'zh');
function t(key, vars) {
  const L = effLang();
  let s = (COPY[L] && COPY[L][key] != null) ? COPY[L][key] : (COPY.zh && COPY.zh[key] != null ? COPY.zh[key] : key);
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => vars[k] != null ? vars[k] : m);
  return s;
}
const fmt = M.fmt, sig = M.sig, sci = M.sci;
const U = (q, n) => M.withUnit(q, n);
const pct = (x, d) => t('u.pct', { v: fmt(x * 100, d == null ? 0 : d) });
// a fraction that may be tiny: percent while it reads as one, scientific notation below
const frac = x => x >= 0.0995 ? pct(x, 0) : x >= 0.00095 ? pct(x, x >= 0.0095 ? 1 : 2) : sci(x, 1);
const num = (x, n) => (x !== 0 && (Math.abs(x) < 0.001 || Math.abs(x) >= 1e6)) ? sci(x, 1) : sig(x, n || 3);
const deg = (x, d) => fmt(x, d == null ? 1 : d) + '°';
const langHooks = [];
function applyLang() {
  document.documentElement.lang = effLang() === 'zh' ? 'zh-CN' : 'en';
  document.title = t('doc.title');
  const md = document.querySelector('meta[name=description]');
  if (md) md.content = t('doc.desc');
  $$('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
  $$('[data-i18n-html]').forEach(e => { e.innerHTML = t(e.dataset.i18nHtml); });
  $$('[data-i18n-aria]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.i18nAria)); });
  $$('#langToggle button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  langHooks.forEach(f => f());
  sims.forEach(s => { s.dirty = true; if (s.text) s.text(); });
}
$$('#langToggle button').forEach(b => b.addEventListener('click', () => { lang = b.dataset.lang; writeLang(lang); applyLang(); }));

/* ───────── canvas + on-screen registry ───────── */
function fit(cv) {
  const r = cv.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
  const W = Math.max(1, Math.round(r.width * d)), H = Math.max(1, Math.round(r.height * d));
  if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
  const c = cv.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0); c.font = FONT; c.textBaseline = 'middle';
  c.clearRect(0, 0, r.width, r.height);
  return { c, w: r.width, h: r.height };
}
const sims = [];
const io = new IntersectionObserver(es => es.forEach(e => { for (const s of sims) if (s.cvs.includes(e.target)) { e.target.__vis = e.isIntersecting; s.vis = s.cvs.some(cv => cv.__vis); s.dirty = true; } }), { rootMargin: '60px' });
function reg(cvs, o) { o.cvs = [].concat(cvs); o.vis = false; o.dirty = true; sims.push(o); o.cvs.forEach(cv => io.observe(cv)); return o; }
window.addEventListener('resize', () => sims.forEach(s => { s.dirty = true; }));
let last = 0;
function loop(now) {
  const dt = Math.min(0.05, last ? (now - last) / 1000 : 0); last = now;
  for (const s of sims) if (s.vis) { if (s.tick) s.tick(dt); if (s.dirty) { s.dirty = false; s.draw(); } }
  requestAnimationFrame(loop);
}
const radioVal = name => { const r = document.querySelector(`input[name=${name}]:checked`); return r ? r.value : null; };
const put = (sel, s) => { const e = $(sel); if (e && e.textContent !== s) e.textContent = s; };
const putHTML = (sel, s) => { const e = $(sel); if (e && e.__h !== s) { e.innerHTML = s; e.__h = s; } };
const on = (sel, ev, fn) => $$(sel).forEach(e => e.addEventListener(ev, fn));
const val = id => parseFloat(document.getElementById(id).value);

/* chart helpers */
function frame(w, h, m, x0, x1, y0, y1) {
  const L = m[3], R = w - m[1], T = m[0], B = h - m[2];
  return { L, R, T, B, x0, x1, y0, y1, X: x => L + (R - L) * (x - x0) / (x1 - x0), Y: y => B - (B - T) * (y - y0) / (y1 - y0) };
}
function axes(c, f, xLab, yLab) {
  c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.T); c.lineTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
  c.fillStyle = C.mute; c.font = FONT;
  if (yLab) { c.textAlign = 'left'; c.fillText(yLab, f.L + 2, f.T - 11); }
  if (xLab) { c.textAlign = 'right'; c.fillText(xLab, f.R, f.B + 30); }
}
function xTicks(c, f, items) { // items: [x, label]; labels that would collide are skipped
  c.fillStyle = C.mute; c.font = FONT; c.textAlign = 'center'; let lastR = -Infinity;
  for (const [x, s] of items) { const px = f.X(x), w = c.measureText(s).width, cx = Math.min(Math.max(px, f.L + w / 2), f.R - w / 2); c.strokeStyle = C.line; c.beginPath(); c.moveTo(px, f.B); c.lineTo(px, f.B + 4); c.stroke(); if (cx - w / 2 < lastR + 8) continue; c.fillText(s, cx, f.B + 13); lastR = cx + w / 2; }
}
function yTicks(c, f, items) {
  c.fillStyle = C.mute; c.font = FONT; c.textAlign = 'right'; let lastY = Infinity;
  for (const [y, s] of items) { const py = f.Y(y); if (py > lastY - 14 || py < f.T - 1 || py > f.B + 1) continue; c.fillText(s, f.L - 6, py); lastY = py; c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, py); c.lineTo(f.R, py); c.stroke(); }
}
function line(c, pts, f, col, lw, dash) {
  c.save(); c.beginPath(); c.rect(f.L, f.T - 2, f.R - f.L, f.B - f.T + 4); c.clip();
  c.strokeStyle = col; c.lineWidth = lw || 2; c.lineJoin = 'round'; c.setLineDash(dash || []); c.beginPath(); let first = true;
  for (const [x, y] of pts) { if (!isFinite(y)) { first = true; continue; } const px = f.X(x), py = f.Y(y); if (first) c.moveTo(px, py); else c.lineTo(px, py); first = false; }
  c.stroke(); c.restore();
}
function dot(c, x, y, col, r) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r || 4.5, 0, 6.283); c.fill(); c.strokeStyle = C.bg; c.lineWidth = 1.5; c.stroke(); }
function label(c, s, x, y, col, align, maxW) { // a label kept inside [0, maxW] horizontally
  c.font = FONT; const w = c.measureText(s).width; c.fillStyle = col || C.mute;
  let lx = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x;
  if (maxW != null) lx = Math.min(Math.max(lx, 2), maxW - w - 2);
  c.textAlign = 'left'; c.fillText(s, lx, y);
}
const pow10 = k => k >= -2 && k <= 3 ? String(Math.pow(10, k)) : '10' + M.supStr(k);

/* an animated grid model (ch3, ch4): steps on elapsed time, pauses, single-steps, honours reduced motion */
function runner(o) {
  const st = { g: null, running: !reduce, acc: 0 };
  st.reset = () => { st.g = o.make(); st.acc = 0; if (reduce) st.g.step(o.settle()); st.running = !reduce; o.sim.dirty = true; o.sim.text(); };
  o.sim.tick = dt => {
    if (!st.running || !st.g || st.g.blown || (o.done && o.done(st.g))) return;
    st.acc += dt * o.rate; const n = Math.min(24, Math.floor(st.acc)); if (n < 1) return; st.acc -= n;
    st.g.step(n); o.sim.dirty = true; o.sim.text();
  };
  const pb = $(o.pause);
  if (reduce) pb.hidden = true;
  st.label = () => { pb.textContent = t(st.running ? o.kPause : o.kPlay); pb.setAttribute('aria-pressed', String(!st.running)); };
  pb.addEventListener('click', () => { st.running = !st.running; st.label(); });
  $(o.go).addEventListener('click', () => { st.reset(); st.label(); });
  $(o.stepBtn).addEventListener('click', () => { if (!st.g.blown) { st.running = false; st.g.step(40); o.sim.dirty = true; o.sim.text(); st.label(); } });
  return st;
}

/* ═════════ ch2: displacement current ═════════ */
(function ch2() {
  const cap = M.capacitor(M.LAB.cap);
  const sim = reg($('#c2Cv'), {
    draw() {
      const { c, w, h } = fit($('#c2Cv')), f = frame(w, h, [26, 14, 38, 16], 0, 5, 0, 1.08), tt = val('c2T');
      axes(c, f, t('ch2.cv.t'));
      xTicks(c, f, [0, 1, 2, 3, 4, 5].map(x => [x, String(x)]));
      const I = [], E = []; for (let i = 0; i <= 200; i++) { const x = 5 * i / 200; I.push([x, Math.exp(-x)]); E.push([x, 1 - Math.exp(-x)]); }
      line(c, I, f, C.gold, 2.2); line(c, E, f, C.cyan, 2.2);
      c.strokeStyle = C.mute; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(f.X(tt), f.T); c.lineTo(f.X(tt), f.B); c.stroke(); c.setLineDash([]);
      dot(c, f.X(tt), f.Y(Math.exp(-tt)), C.gold); dot(c, f.X(tt), f.Y(1 - Math.exp(-tt)), C.cyan);
      label(c, t('ch2.cv.e'), f.R - 4, f.Y(0.86), C.cyan, 'right'); label(c, t('ch2.cv.i'), f.R - 4, f.Y(0.14), C.gold, 'right');
    },
    text() {
      const tt = val('c2T') * cap.tau, rr = val('c2R'), r = rr * cap.a, mx = $('#c2Mx').checked;
      const i = cap.I(tt), id = cap.Id(tt), bg = cap.Bgap(tt, r, mx), bw = cap.Bwire(tt, r);
      const mA = x => sig(x * 1e3, 3) + ' mA', nT = x => (x === 0 ? '0' : sig(x * 1e9, 3)) + ' nT';
      put('#c2To', fmt(val('c2T'), 2)); put('#c2Ro', fmt(rr, 2));
      put('#c2I', mA(i)); put('#c2Id', mx ? mA(id) : '—'); put('#c2Bg', nT(bg)); put('#c2Bw', nT(bw));
      const v = { i: mA(i), id: mA(id), bg: nT(bg), bw: nT(bw), frac: pct(Math.min(1, rr * rr), 0) };
      putHTML('#c2Say', !mx ? t('ch2.say.off', v) : rr < 1 ? t('ch2.say.in', v) : t('ch2.say.out', v));
    }
  });
  on('#c2T, #c2R, #c2Mx', 'input', () => { sim.dirty = true; sim.text(); });
})();

/* ═════════ ch3: 1-D FDTD between metal walls ═════════ */
(function ch3() {
  const P = M.LAB.fdtd; let speed = null;
  const sim = reg($('#c3Cv'), {
    draw() {
      const { c, w, h } = fit($('#c3Cv')), g = run.g; if (!g) return;
      const L = 12, R = w - 12, mid = h / 2, amp = h / 4 - 16, X = i => L + (R - L) * i / g.N, cl = v => Math.max(-1.6, Math.min(1.6, v));
      c.strokeStyle = C.grid; c.lineWidth = 1; c.beginPath(); c.moveTo(L, mid / 2 + 6); c.lineTo(R, mid / 2 + 6); c.moveTo(L, mid * 1.5 + 2); c.lineTo(R, mid * 1.5 + 2); c.stroke();
      c.strokeStyle = C.mute; c.lineWidth = 4; c.beginPath(); c.moveTo(L, 8); c.lineTo(L, h - 8); c.moveTo(R, 8); c.lineTo(R, h - 8); c.stroke();
      c.lineWidth = 2.2; c.lineJoin = 'round';
      c.strokeStyle = C.gold; c.beginPath(); for (let i = 0; i <= g.N; i++) { const y = mid / 2 + 6 - amp * cl(g.E[i]); if (i) c.lineTo(X(i), y); else c.moveTo(X(i), y); } c.stroke();
      c.strokeStyle = C.cyan; c.beginPath(); for (let i = 0; i < g.N; i++) { const y = mid * 1.5 + 2 - amp * cl(g.B[i] * M.C0); if (i) c.lineTo(X(i + 0.5), y); else c.moveTo(X(i + 0.5), y); } c.stroke();
      label(c, t('ch3.cv.e'), L + 10, 14, C.gold); label(c, t('ch3.cv.b'), L + 10, mid + 12, C.cyan); label(c, t('ch3.cv.wall'), R - 10, h - 14, C.mute, 'right');
    },
    text() {
      const g = run.g; if (!g) return; const S = val('c3S');
      put('#c3So', fmt(S, 2));
      put('#c3V', speed.blown ? '—' : fmt(speed.v, 0) + ' m/s'); put('#c3C', fmt(M.cFromFields(), 0) + ' m/s');
      const u = g.U0 ? g.U / g.U0 : 1;
      put('#c3U', g.blown || u > 10 ? sci(u, 1) : pct(u, 4)); put('#c3N', fmt(g.steps, 0));
      const v = { s: fmt(S, 2), v: fmt(speed.v, 0), u: pct(Math.min(u, 9.99), 4), err: pct(Math.abs(1 - speed.v / M.cFromFields()), 3), n: fmt(g.steps, 0) };
      putHTML('#c3Say', S > 1.0001 ? (g.blown ? t('ch3.say.blown', v) : t('ch3.say.growing', v)) : Math.abs(S - 1) < 1e-9 ? t('ch3.say.magic', v) : t('ch3.say.ok', v));
      run.label();
    }
  });
  const make = () => { const g = M.fdtd({ N: P.N, dx: P.dx, S: val('c3S'), bc: 'pec' }); g.launch(P.N / 2, P.width, 1); g.step(1); return g; };
  const run = runner({ sim, make, settle: () => Math.round(120 / val('c3S')), rate: 150, pause: '#c3Pause', go: '#c3Go', stepBtn: '#c3Step', kPause: 'ch3.btn.pause', kPlay: 'ch3.btn.play' });
  const restart = () => { speed = M.measureSpeed(val('c3S')); run.reset(); };
  on('#c3S', 'input', restart);
  restart();
})();

/* ═════════ ch4: an index step ═════════ */
(function ch4() {
  const P = M.LAB.iface; let res = null;
  const sim = reg($('#c4Cv'), {
    draw() {
      const { c, w, h } = fit($('#c4Cv')), g = run.g; if (!g) return;
      const L = 12, R = w - 12, base = h * 0.56, amp = h * 0.32, X = i => L + (R - L) * i / g.N, xm = X(g.mid);
      c.fillStyle = 'rgba(99,199,230,' + Math.min(0.3, 0.07 * (g.n1 - 1) * 2 + 0.0001) + ')'; c.fillRect(L, 8, xm - L, h - 16);
      c.fillStyle = 'rgba(99,199,230,' + Math.min(0.3, 0.07 * (g.n2 - 1) * 2 + 0.0001) + ')'; c.fillRect(xm, 8, R - xm, h - 16);
      c.strokeStyle = C.cyan; c.lineWidth = 1; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(xm, 8); c.lineTo(xm, h - 8); c.stroke(); c.setLineDash([]);
      c.strokeStyle = C.grid; c.beginPath(); c.moveTo(L, base); c.lineTo(R, base); c.stroke();
      c.strokeStyle = C.gold; c.lineWidth = 2.2; c.lineJoin = 'round'; c.beginPath();
      for (let i = 0; i <= g.N; i++) { const y = base - amp * Math.max(-1.5, Math.min(1.5, g.E[i])); if (i) c.lineTo(X(i), y); else c.moveTo(X(i), y); } c.stroke();
      label(c, t('ch4.cv.n1', { v: fmt(g.n1, 2) }), L + 8, 20, C.mute); label(c, t('ch4.cv.n2', { v: fmt(g.n2, 2) }), R - 8, 20, C.cyan, 'right');
    },
    text() {
      const n1 = val('c4N1'), n2 = val('c4N2'), fr = M.fresnel(n1, n2);
      put('#c4N1o', fmt(n1, 2)); put('#c4N2o', fmt(n2, 2));
      put('#c4R', pct(res.R, 2)); put('#c4RF', pct(fr.R, 2)); put('#c4T', pct(res.T, 2)); put('#c4V', fmt(1 / n2, 3) + ' c');
      const v = { n1: fmt(n1, 2), n2: fmt(n2, 2), R: pct(fr.R, 1), v: pct(1 / n2, 0) };
      putHTML('#c4Say', Math.abs(n1 - n2) < 1e-9 ? t('ch4.say.same', v) : n2 > n1 ? t('ch4.say.denser', v) : t('ch4.say.rarer', v));
      if (run) run.label();
    }
  });
  const make = () => M.interfaceGrid(val('c4N1'), val('c4N2'), { N: P.N, width: P.width });
  let run = null;
  run = runner({ sim, make, settle: () => res.steps, done: g => g.steps >= res.steps, rate: 170, pause: '#c4Pause', go: '#c4Go', stepBtn: '#c4Step', kPause: 'ch4.btn.pause', kPlay: 'ch4.btn.play' });
  const restart = () => { res = M.fresnelRun(val('c4N1'), val('c4N2'), { N: P.N, width: P.width }); run.reset(); };
  on('#c4N1, #c4N2', 'input', restart);
  restart();
})();

/* ═════════ ch5: dipole pattern ═════════ */
(function ch5() {
  const sim = reg($('#c5Cv'), {
    draw() {
      const { c, w, h } = fit($('#c5Cv')), L = val('c5L'), d = M.dipole(L), cx = w / 2, cy = h / 2, Rm = Math.min(w / 2 - 14, h / 2 - 14);
      c.strokeStyle = C.grid; c.lineWidth = 1; for (const k of [0.5, 1]) { c.beginPath(); c.arc(cx, cy, Rm * k, 0, 6.283); c.stroke(); }
      c.beginPath(); c.moveTo(cx - Rm, cy); c.lineTo(cx + Rm, cy); c.stroke();
      c.beginPath();
      for (let i = 0; i <= 720; i++) { const th = Math.PI * i / 360, r = Rm * Math.pow(M.dipoleF(L, th), 2) / d.fmax, x = cx + r * Math.sin(th), y = cy - r * Math.cos(th); if (i) c.lineTo(x, y); else c.moveTo(x, y); }
      c.closePath(); c.fillStyle = 'rgba(233,185,73,.14)'; c.fill(); c.strokeStyle = C.gold; c.lineWidth = 2.2; c.stroke();
      const al = Math.min(Rm * 0.9, Math.max(10, Rm * 0.36 * L / 0.5)); c.strokeStyle = C.ink; c.lineWidth = 3.5; c.beginPath(); c.moveTo(cx, cy - al / 2); c.lineTo(cx, cy + al / 2); c.stroke();
      label(c, t('ch5.cv.axis'), 10, 14, C.mute);
    },
    text() {
      const L = val('c5L'), d = M.dipole(L);
      put('#c5Lo', fmt(L, 2) + ' λ');
      const Rs = isFinite(d.Rin) ? sig(d.Rin, 3) + ' Ω' : t('u.inf');
      put('#c5D', fmt(d.D, 2) + ' (' + fmt(d.dBi, 2) + ' dBi)'); put('#c5R', Rs); put('#c5W', deg(d.hpbw, 1)); put('#c5Lobes', String(d.lobes));
      const v = { L: fmt(L, 2), D: fmt(d.D, 2), dBi: fmt(d.dBi, 2), R: Rs, w: deg(d.hpbw, 0), lobes: d.lobes, th: deg(Math.min(d.thMax, 180 - d.thMax), 0) };
      putHTML('#c5Say', !isFinite(d.Rin) ? t('ch5.say.full', v) : L <= 0.2501 ? t('ch5.say.short', v) : Math.abs(L - 0.5) < 0.001 ? t('ch5.say.half', v) : d.lobes > 1 ? t('ch5.say.long', v) : t('ch5.say.mid', v));
    }
  });
  on('#c5L', 'input', () => { sim.dirty = true; sim.text(); });
})();

/* ═════════ ch6: sunlight ═════════ */
(function ch6() {
  const sim = reg($('#c6Cv'), {
    draw() {
      const { c, w, h } = fit($('#c6Cv')), f = frame(w, h, [28, 16, 40, 44], -0.5, 2.3, -2, 4.6), ld = val('c6D');
      axes(c, f, t('ch6.cv.x'), t('ch6.cv.y'));
      xTicks(c, f, [[-0.301, '0.5'], [0, '1'], [1, '10'], [2, '100']]);
      yTicks(c, f, [-2, 0, 2, 4].map(k => [k, pow10(k)]));
      const I = x => Math.log10(M.sunlight(Math.pow(10, x)).I);
      line(c, [[-0.5, I(-0.5)], [2.3, I(2.3)]], f, C.gold, 2.2);
      const marks = [['earth', 1, 1], ['jupiter', M.PLANETS.jupiter, 1], ['neptune', M.PLANETS.neptune, 1], ['voyager', M.FRONTIER.voyager.au, -1]];
      for (const [k, a, side] of marks) { const x = Math.log10(a), px = f.X(x), py = f.Y(I(x)); c.strokeStyle = C.mute; c.lineWidth = 1; c.beginPath(); c.moveTo(px, py - 5); c.lineTo(px, py + 5); c.stroke(); const s = k === 'earth' ? t('ch6.cv.earth') : k === 'jupiter' ? t('ch6.cv.jupiter') : k === 'neptune' ? t('ch6.cv.neptune') : t('ch6.cv.voyager'); if (side > 0) label(c, s, px + 6, py - 12, C.mute); else label(c, s, px - 6, py + 16, C.mute, 'right'); }
      dot(c, f.X(ld), f.Y(I(ld)), C.gold, 6);
    },
    text() {
      const d = Math.pow(10, val('c6D')), s = M.sunlight(d), k = s.I / M.sunlight(1).I;
      put('#c6Do', sig(d, 3) + ' au');
      const I = num(s.I, 4) + ' W/m²', E = num(s.Erms, 3) + ' V/m', B = U(pickT(s.Bpk));
      put('#c6I', I); put('#c6E', E); put('#c6B', B); put('#c6P', U(pickPa(s.pAbs))); put('#c6F', num(s.pRef * 1e6, 3) + ' N');
      const v = { d: sig(d, 3), I, E, B, k: k >= 1 ? sig(k, 3) : frac(k) };
      putHTML('#c6Say', Math.abs(d - 1) < 0.012 ? t('ch6.say.earth', v) : d < 1 ? t('ch6.say.near', v) : t('ch6.say.far', v));
    }
  });
  const pickT = x => x >= 1e-6 ? { v: x * 1e6, u: 'µT' } : x >= 1e-9 ? { v: x * 1e9, u: 'nT' } : { v: x * 1e12, u: 'pT' };
  const pickPa = x => x >= 1e-6 ? { v: x * 1e6, u: 'µPa' } : x >= 1e-9 ? { v: x * 1e9, u: 'nPa' } : { v: x * 1e12, u: 'pPa' };
  on('#c6D', 'input', () => { sim.dirty = true; sim.text(); });

  /* three polarisers */
  const pol = reg($('#c6pCv'), {
    draw() {
      const { c, w, h } = fit($('#c6pCv')), k = +radioVal('c6K'), st = M.crossedStack(k, val('c6Th')), n = st.I.length, L = 14, R = w - 14, base = h - 34, hm = h - 64;
      const slot = (R - L) / (2 * n - 1), bw = Math.min(34, slot * 0.8);
      c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(L, base); c.lineTo(R, base); c.stroke();
      st.I.forEach((v, i) => { const x = L + slot * (2 * i + 0.5); c.fillStyle = 'rgba(233,185,73,.8)'; c.fillRect(x - bw / 2, base - hm * v, bw, Math.max(1, hm * v)); });
      st.angles.forEach((a, i) => {
        const x = L + slot * (2 * i + 1.5), cy = base - hm / 2, r = Math.min(16, slot * 0.45), an = (90 - a) * Math.PI / 180;
        c.strokeStyle = C.violet; c.lineWidth = 1.2; c.strokeRect(x - Math.min(8, slot * 0.3), base - hm, 2 * Math.min(8, slot * 0.3), hm);
        c.strokeStyle = C.ink; c.lineWidth = 2.2; c.beginPath(); c.moveTo(x - r * Math.cos(an), cy + r * Math.sin(an)); c.lineTo(x + r * Math.cos(an), cy - r * Math.sin(an)); c.stroke();
      });
      label(c, t('ch6.pol.cv.in'), L, base + 16, C.mute);
    },
    text() {
      const k = +radioVal('c6K'), th = val('c6Th'), st = M.crossedStack(k, th);
      $('#c6Th').disabled = k !== 1;
      put('#c6Tho', deg(th, 0)); put('#c6Out', frac0(st.out));
      put('#c6Steps', st.I.slice(1).map(v => fmt(v * 100, Math.abs(v * 100 - Math.round(v * 100)) > 0.04 ? 1 : 0)).join(' → ') + ' %');
      const v = { th: deg(th, 0), out: frac0(st.out), max: pct(M.crossedStack(1, 45).out, 1), k, step: deg(90 / (k + 1), 1) };
      putHTML('#c6pSay', k === 0 ? t('ch6.pol.say.zero', v) : k === 1 ? (st.out < 1e-9 ? t('ch6.pol.say.oneBlock', v) : t('ch6.pol.say.one', v)) : t('ch6.pol.say.many', v));
    }
  });
  const frac0 = x => x < 1e-9 ? pct(0, 0) : pct(x, 1);
  on('input[name=c6K], #c6Th', 'input', () => { pol.dirty = true; pol.text(); });
  on('input[name=c6K]', 'change', () => { pol.dirty = true; pol.text(); });
})();

/* ═════════ ch7: the spectrum, and water ═════════ */
(function ch7() {
  const EX = { am: 1e6, fm: 1e8, oven: M.SRC.oven, mm: 28e9, body: M.C0 / M.wienPeak(310), green: M.C0 / 550e-9, uvc: M.C0 / 254e-9, xray: 30e3 * M.QE / M.H, gamma: 1e6 * M.QE / M.H };
  const COL = { radio: C.slate, micro: C.cyan, ir: C.red, vis: C.gold, uv: C.violet, xray: C.green, gamma: C.ink };
  const eV = x => x >= 1e6 ? sig(x / 1e6, 3) + ' MeV' : x >= 1e3 ? sig(x / 1e3, 3) + ' keV' : x >= 0.01 ? sig(x, 3) + ' eV' : sci(x, 1) + ' eV';
  const sim = reg($('#c7Cv'), {
    draw() {
      const { c, w, h } = fit($('#c7Cv')), f = frame(w, h, [56, 14, 40, 14], 4, 22, 0, 1), lf = val('c7F');
      const y0 = f.T, y1 = f.B - 6;
      M.BANDS.forEach(([k, lo], i) => {
        const a = Math.max(4, lo ? Math.log10(lo) : 4), b = i + 1 < M.BANDS.length ? Math.log10(M.BANDS[i + 1][1]) : 22, xa = f.X(a), xb = f.X(b);
        c.globalAlpha = 0.3; c.fillStyle = COL[k]; c.fillRect(xa, y0, xb - xa, y1 - y0); c.globalAlpha = 1;
        c.fillStyle = COL[k]; c.fillRect(xa, y1 - 4, xb - xa, 4);
        const s = t('ch7.cv.' + k); c.font = FONT; if (c.measureText(s).width + 8 < xb - xa) { c.fillStyle = C.ink; c.textAlign = 'center'; c.fillText(s, (xa + xb) / 2, (y0 + y1) / 2 - 2); }
      });
      xTicks(c, f, [[6, '1 MHz'], [9, '1 GHz'], [12, '1 THz'], [15, '10¹⁵ Hz'], [18, '10¹⁸ Hz'], [21, '10²¹ Hz']]);
      const x = f.X(lf); c.strokeStyle = C.ink; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y0 - 22); c.lineTo(x, y1); c.stroke();
      c.fillStyle = C.ink; c.beginPath(); c.moveTo(x, y0 - 4); c.lineTo(x - 7, y0 - 18); c.lineTo(x + 7, y0 - 18); c.closePath(); c.fill();
      label(c, U(M.siFreq(Math.pow(10, lf))), x, y0 - 32, C.ink, 'center', w);
    },
    text() {
      const p = M.photon(Math.pow(10, val('c7F')));
      put('#c7Fo', U(M.siFreq(p.f)));
      put('#c7Lam', U(M.siLen(p.lam))); put('#c7Size', t('ch7.size.' + M.sizeKey(p.lam))); put('#c7E', eV(p.eV)); put('#c7KT', num(p.kT, 3));
      const key = p.band === 'uv' && p.ionising ? 'uvIon' : p.band;
      putHTML('#c7Say', t('ch7.say.' + key, { kt: num(p.kT, 2), ev: eV(p.eV) }));
    }
  });
  on('#c7F', 'input', () => { sim.dirty = true; sim.text(); });
  on('#lab7 [data-ex]', 'click', e => { $('#c7F').value = Math.log10(EX[e.currentTarget.dataset.ex]).toFixed(2); sim.dirty = true; sim.text(); });

  const wat = reg($('#c7wCv'), {
    draw() {
      const { c, w, h } = fit($('#c7wCv')), f = frame(w, h, [20, 16, 40, 34], -1, 2, 0, 86), lf = val('c7W');
      axes(c, f, t('ch7.w.cv.x'));
      xTicks(c, f, [[-1, '0.1'], [0, '1'], [1, '10'], [2, '100']]); yTicks(c, f, [0, 20, 40, 60, 80].map(v => [v, String(v)]));
      const a = [], b = []; for (let i = 0; i <= 240; i++) { const x = -1 + 3 * i / 240, wv = M.water(Math.pow(10, x) * 1e9); a.push([x, wv.e1]); b.push([x, wv.e2]); }
      const xo = Math.log10(M.SRC.oven / 1e9); c.strokeStyle = C.mute; c.lineWidth = 1; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(f.X(xo), f.T); c.lineTo(f.X(xo), f.B); c.stroke(); c.setLineDash([]);
      line(c, a, f, C.gold, 2.2); line(c, b, f, C.cyan, 2.2);
      const cur = M.water(Math.pow(10, lf) * 1e9); dot(c, f.X(lf), f.Y(cur.e1), C.gold); dot(c, f.X(lf), f.Y(cur.e2), C.cyan);
      label(c, t('ch7.w.cv.e1'), f.L + 8, f.Y(64), C.gold); label(c, t('ch7.w.cv.e2'), f.X(Math.log10(M.water(1e9).fPeak / 1e9)), f.Y(16), C.cyan, 'center', w);
      label(c, t('ch7.w.cv.oven'), f.X(xo) - 5, f.T + 6, C.mute, 'right');
    },
    text() {
      const fq = Math.pow(10, val('c7W')) * 1e9, wv = M.water(fq), ref = M.water(M.SRC.oven);
      put('#c7Wo', U(M.siFreq(fq)));
      put('#c7E1', fmt(wv.e1, 1)); put('#c7E2', fmt(wv.e2, 1)); put('#c7Dp', U(M.siLen(wv.depth), 2)); put('#c7H', t('u.x', { v: sig(wv.heat / ref.heat, 2) }));
      const v = { f: U(M.siFreq(fq)), dp: U(M.siLen(wv.depth), 2), e1: fmt(wv.e1, 0), e2: fmt(wv.e2, 1), h: sig(wv.heat / ref.heat, 2) };
      putHTML('#c7wSay', fq < 1e9 ? t('ch7.w.say.low', v) : fq <= 5e9 ? t('ch7.w.say.oven', v) : fq <= 40e9 ? t('ch7.w.say.peak', v) : t('ch7.w.say.high', v));
    }
  });
  on('#c7W', 'input', () => { wat.dirty = true; wat.text(); });
})();

/* ═════════ ch8: the atmosphere ═════════ */
(function ch8() {
  const NP = 600, cache = {};
  function curve(rho, zen) {
    const k = rho + (zen ? 'z' : 'g'); if (cache[k]) return cache[k];
    const tot = [], o2 = [];
    for (let i = 0; i <= NP; i++) { const x = 3 * i / NP, f = Math.pow(10, x), g = zen ? M.zenithParts(f, rho) : M.seaLevel(f, rho); tot.push([x, Math.log10(g.total)]); o2.push([x, Math.log10(g.o2)]); }
    return (cache[k] = { tot, o2 });
  }
  const at = (f, rho, zen) => zen ? M.zenithParts(f, rho) : M.seaLevel(f, rho);
  const sim = reg($('#c8Cv'), {
    draw() {
      const { c, w, h } = fit($('#c8Cv')), zen = radioVal('c8Path') === 'zenith', rho = val('c8H'), lf = val('c8F');
      const f = frame(w, h, [28, 16, 40, 44], 0, 3, zen ? -2 : -3, zen ? 4.5 : 3.5), cv = curve(rho, zen);
      axes(c, f, t('ch8.cv.x'), zen ? t('ch8.cv.yz') : t('ch8.cv.yg'));
      xTicks(c, f, [[0, '1'], [1, '10'], [2, '100'], [3, '1000']]); yTicks(c, f, [-3, -2, -1, 0, 1, 2, 3, 4].map(k => [k, pow10(k)]));
      line(c, cv.o2, f, C.cyan, 1.6); line(c, cv.tot, f, C.gold, 2.2);
      const g = at(Math.pow(10, lf), rho, zen); dot(c, f.X(lf), Math.max(f.T, Math.min(f.B, f.Y(Math.log10(g.total)))), C.gold, 6);
    },
    text() {
      const zen = radioVal('c8Path') === 'zenith', rho = val('c8H'), fq = Math.pow(10, val('c8F')), g = at(fq, rho, zen), tr = M.undB(-g.total);
      put('#c8Fo', sig(fq, 3) + ' GHz'); put('#c8Ho', fmt(rho, 1) + ' g/m³');
      const a = num(g.total, 3) + (zen ? ' dB' : ' dB/km'), wsh = pct(g.h2o / g.total, 0);
      put('#c8A', a); put('#c8Tr', frac(tr)); put('#c8Wv', wsh); put('#c8Half', zen ? '—' : U(M.siLen(M.dB(2) / g.total * 1e3), 2));
      const v = { f: sig(fq, 3) + ' GHz', a: num(g.total, 3) + ' dB', tr: frac(tr), w: wsh };
      const key = g.total < 1 ? 'clear' : g.o2 > g.h2o ? 'o2' : 'h2o';
      putHTML('#c8Say', t('ch8.say.' + key + (zen ? 'Z' : 'G'), v));
    }
  });
  on('#c8F, #c8H', 'input', () => { sim.dirty = true; sim.text(); });
  on('input[name=c8Path]', 'change', () => { sim.dirty = true; sim.text(); });
})();

/* ═════════ ch9: modulation, link budget ═════════ */
(function ch9() {
  let m = null;
  const type = () => radioVal('c9Type');
  const calc = () => { m = M.modulate(type(), val('c9Fm'), val('c9Idx')); };
  const sim = reg([$('#c9wCv'), $('#c9sCv')], {
    draw() {
      if (!m) calc();
      { const { c, w, h } = fit($('#c9wCv')), n = Math.round(m.N / m.fm), sc = m.type === 'am' ? 1 + Math.max(m.idx, 0.2) : 1.25;
        const f = frame(w, h, [10, 12, 26, 12], 0, n, -sc, sc), pts = [], env = [];
        for (let k = 0; k <= n; k++) { pts.push([k, m.s[k % m.N]]); env.push([k, 1 + m.idx * m.msg[k % m.N]]); }
        c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L, f.Y(0)); c.lineTo(f.R, f.Y(0)); c.stroke();
        line(c, pts, f, C.gold, 1.4); if (m.type === 'am') line(c, env, f, C.cyan, 1.6, [5, 4]);
        label(c, t('ch9.cv.t'), f.R, f.B + 13, C.mute, 'right'); }
      { const { c, w, h } = fit($('#c9sCv')), f = frame(w, h, [12, 12, 30, 12], -160, 160, 0, 1.08);
        c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
        c.lineWidth = Math.max(1.5, Math.min(4, (f.R - f.L) / 200));
        for (const b of m.bins) { if (b.a < 0.004) continue; c.strokeStyle = b.k === 0 ? C.gold : C.cyan; c.beginPath(); c.moveTo(f.X(b.k), f.B); c.lineTo(f.X(b.k), f.Y(Math.min(1.05, b.a))); c.stroke(); }
        xTicks(c, f, [[-100, '−100 kHz'], [0, t('ch9.cv.fc')], [100, '+100 kHz']]);
        label(c, t('ch9.cv.f'), f.R - 2, f.T + 4, C.mute, 'right'); }
    },
    text() {
      calc(); const am = m.type === 'am', khz = x => fmt(x, x % 1 ? 1 : 0) + ' kHz';
      put('#c9IdxL', am ? t('ch9.ctl.idxAm') : t('ch9.ctl.idxFm'));
      put('#c9Fmo', khz(m.fm)); put('#c9Idxo', fmt(m.idx, 2));
      put('#c9Car', fmt(m.carrier, 3)); put('#c9Bw', khz(m.obw)); put('#c9Rule', khz(m.rule)); put('#c9Side', pct(m.sideFrac, 1));
      const v = { m: fmt(m.idx, 2), beta: fmt(m.idx, 2), fm: khz(m.fm), bw: khz(m.obw), rule: khz(m.rule), car: am ? pct(1 - m.sideFrac, 1) : fmt(m.carrier, 3), side: pct(m.sideFrac, 1) };
      putHTML('#c9Say', am ? (m.idx > 1.0001 ? t('ch9.say.amOver', v) : t('ch9.say.am', v)) : m.idx < 0.5 ? t('ch9.say.fmNarrow', v) : m.carrier < 0.03 ? t('ch9.say.fmNull', v) : t('ch9.say.fm', v));
    }
  });
  on('#c9Fm, #c9Idx', 'input', () => { sim.dirty = true; sim.text(); });
  on('input[name=c9Type]', 'change', () => { const s = $('#c9Idx'); if (type() === 'am') { s.max = 1.5; s.value = 0.5; } else { s.max = 8; s.value = 5; } sim.dirty = true; sim.text(); });

  const lk = reg($('#c9lCv'), {
    draw() {
      const { c, w, h } = fit($('#c9lCv')), l = M.link(radioVal('c9L'), Math.pow(2, val('c9Dx'))), p = l.p;
      const dbm = x => M.dB(x / 1e-3), bars = [dbm(p.Pt), dbm(p.Pt * p.Gt), dbm(p.Pt * p.Gt) - l.fsplDb, l.PrDbm], lo = Math.floor((Math.min(...bars, l.NDbm) - 15) / 20) * 20, hi = Math.ceil((Math.max(...bars) + 8) / 20) * 20;
      const names = [t('ch9.link.cv.pt'), t('ch9.link.cv.eirp'), t('ch9.link.cv.path'), t('ch9.link.cv.pr')], cols = [C.gold, C.gold, C.cyan, C.green];
      c.font = FONT; const slot0 = (w - 60) / 4, two = names.some(s => c.measureText(s).width > slot0 - 8); // names too wide for one row: stagger on two
      const f = frame(w, h, [26, 14, two ? 44 : 30, 46], 0, 4, lo, hi), slot = (f.R - f.L) / 4;
      axes(c, f, null, 'dBm');
      const tk = []; for (let v = lo; v <= hi; v += (hi - lo) > 160 ? 40 : 20) tk.push([v, String(v).replace('-', '−')]); yTicks(c, f, tk);
      bars.forEach((v, i) => { const x = f.X(i + 0.5), bw = Math.min(54, slot * 0.5); c.fillStyle = cols[i]; c.globalAlpha = 0.8; c.fillRect(x - bw / 2, f.Y(v), bw, f.B - f.Y(v)); c.globalAlpha = 1;
        label(c, names[i], x, f.B + 14 + (two && i % 2 ? 16 : 0), C.mute, 'center', w); });
      c.strokeStyle = C.red; c.lineWidth = 1.6; c.setLineDash([6, 4]); c.beginPath(); c.moveTo(f.L, f.Y(l.NDbm)); c.lineTo(f.R, f.Y(l.NDbm)); c.stroke();
      // the noise line is named in the header row, clear of the bars
      const ns = t('ch9.link.cv.noise'), nw = c.measureText(ns).width; c.beginPath(); c.moveTo(f.R - nw - 30, f.T - 11); c.lineTo(f.R - nw - 6, f.T - 11); c.stroke(); c.setLineDash([]);
      label(c, ns, f.R, f.T - 11, C.red, 'right');
    },
    text() {
      const key = radioVal('c9L'), sc = Math.pow(2, val('c9Dx')), l = M.link(key, sc), dbs = (x, d) => fmt(x, d == null ? 1 : d) + ' dB';
      put('#c9Dxo', t('u.x', { v: sig(sc, 3) }));
      put('#c9Dist', U(M.siLen(l.d))); put('#c9Fs', dbs(l.fsplDb)); put('#c9Pr', U(M.siPow(l.Pr))); put('#c9Sn', dbs(l.snrDb)); put('#c9Cap', U(M.siRate(l.shannon)));
      const v = { d: U(M.siLen(l.d)), pr: U(M.siPow(l.Pr)), dbm: fmt(l.PrDbm, 0) + ' dBm', fs: dbs(l.fsplDb), snr: dbs(l.snrDb), pt: String(l.p.Pt), ebn0: l.ebn0Db == null ? '' : dbs(l.ebn0Db) };
      putHTML('#c9lSay', t('ch9.link.say.' + key, v));
    }
  });
  on('#c9Dx', 'input', () => { lk.dirty = true; lk.text(); });
  on('input[name=c9L]', 'change', () => { lk.dirty = true; lk.text(); });
})();

/* ═════════ ch10: fibre loss ═════════ */
(function ch10() {
  const sim = reg($('#c10Cv'), {
    draw() {
      const { c, w, h } = fit($('#c10Cv')), f = frame(w, h, [28, 16, 40, 40], 800, 1700, -1.5, 0.7), lam = val('c10L');
      axes(c, f, t('ch10.cv.x'), t('ch10.cv.y'));
      xTicks(c, f, [[850, '850'], [1310, '1310'], [1550, '1550']]); yTicks(c, f, [[-1, '0.1'], [0, '1']]);
      const a = [], r = [], ir = []; for (let l = 800; l <= 1700; l += 5) { const v = M.fibreLoss(l / 1000); a.push([l, Math.log10(v.total)]); r.push([l, Math.log10(v.ray)]); ir.push([l, v.ir > 0.02 ? Math.log10(v.ir) : NaN]); }
      line(c, r, f, C.cyan, 1.6); line(c, ir, f, C.red, 1.6); line(c, a, f, C.gold, 2.4);
      dot(c, f.X(lam), f.Y(Math.log10(M.fibreLoss(lam / 1000).total)), C.gold, 6);
    },
    text() {
      const lam = val('c10L'), km = M.LAB.spans[val('c10K')], s = M.fibreSpan(lam / 1000, km);
      put('#c10Lo', lam + ' nm'); put('#c10Ko', fmt(km, 0) + ' km');
      const a = fmt(s.a, s.a < 1 ? 3 : 2) + ' dB/km', tot = sig(s.dB, 3) + ' dB';
      put('#c10A', a); put('#c10Tot', tot); put('#c10Fr', frac(s.frac)); put('#c10Half', sig(s.halfKm, 3) + ' km');
      const v = { lam: lam + ' nm', a: fmt(s.a, s.a < 1 ? 3 : 2) + ' dB', km: fmt(km, 0) + ' km', fr: frac(s.frac), tot };
      putHTML('#c10Say', s.dB <= 25 ? t('ch10.say.ok', v) : s.dB <= 180 ? t('ch10.say.amp', v) : t('ch10.say.dead', v));
    }
  });
  on('#c10L, #c10K', 'input', () => { sim.dirty = true; sim.text(); });
})();

/* ═════════ ch11: apertures and arrays ═════════ */
(function ch11() {
  const SP = M.sparrow();
  const sim = reg($('#c11Cv'), {
    draw() {
      const { c, w, h } = fit($('#c11Cv')), s = val('c11S'), tp = M.twoPoints(s), f = frame(w, h, [16, 14, 36, 14], -2.6, 2.6, 0, 2.1);
      axes(c, f, t('ch11.cv.x'));
      xTicks(c, f, [[-2, '−2'], [-1, '−1'], [0, '0'], [1, '1'], [2, '2']]);
      const a = [], b = []; for (const u of tp.xs) { a.push([u, M.airy((u - s / 2) * M.J1ZERO)]); b.push([u, M.airy((u + s / 2) * M.J1ZERO)]); }
      line(c, a, f, C.cyan, 1.4); line(c, b, f, C.cyan, 1.4); line(c, tp.xs.map((u, i) => [u, tp.ys[i]]), f, C.gold, 2.4);
    },
    text() {
      const key = radioVal('c11A'), ap = M.aperture(key), s = val('c11S'), tp = M.twoPoints(s);
      put('#c11So', fmt(s, 2));
      put('#c11Th', U(M.siAngle(ap.th))); put('#c11Size', U(M.siLen(ap.size))); put('#c11Dip', pct(tp.dip, 1));
      const v = { s: fmt(s, 2), dip: pct(tp.dip, 1), sp: fmt(SP, 2) };
      putHTML('#c11Say', s < SP ? t('ch11.say.merged', v) : Math.abs(s - 1) < 1e-9 ? t('ch11.say.rayleigh', v) : s < 1 ? t('ch11.say.barely', v) : t('ch11.say.clear', v));
      const vb = M.rayleigh(ap.lam, M.SRC.voyager.D) * ap.dist;
      put('#c11Note', t('ch11.note.' + key, { th: U(M.siAngle(ap.th)), size: U(M.siLen(ap.size)), vb: U(M.siLen(vb), 2) }));
    }
  });
  on('#c11S', 'input', () => { sim.dirty = true; sim.text(); });
  on('input[name=c11A]', 'change', () => { sim.dirty = true; sim.text(); });

  const arr = reg($('#c11aCv'), {
    draw() {
      const { c, w, h } = fit($('#c11aCv')), N = val('c11N'), d = val('c11D'), t0 = val('c11T'), st = M.array(N, d, t0), f = frame(w, h, [28, 14, 40, 40], -90, 90, -40, 9);
      axes(c, f, t('ch11.arr.cv.x'), t('ch11.arr.cv.y'));
      xTicks(c, f, [[-90, '−90°'], [-45, '−45°'], [0, '0°'], [45, '45°'], [90, '90°']]); yTicks(c, f, [[0, '0'], [-10, '−10'], [-20, '−20'], [-30, '−30']]);
      const pts = []; for (let i = 0; i <= 1440; i++) { const th = -90 + i / 8; pts.push([th, Math.max(-40, M.dB(M.arrayFactor(N, d, t0, th) + 1e-12))]); }
      for (const gth of st.grating) { c.strokeStyle = C.red; c.lineWidth = 1; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(f.X(gth), f.T); c.lineTo(f.X(gth), f.B); c.stroke(); c.setLineDash([]); }
      line(c, pts, f, C.gold, 2);
      // labels along the top, skipped when they would collide
      const tags = [[t0, t('ch11.arr.cv.beam'), C.gold]].concat(st.grating.map(gth => [gth, t('ch11.arr.cv.gr'), C.red])); let used = [];
      c.font = FONT;
      for (const [th, s, col] of tags) { const tw = c.measureText(s).width, x = Math.min(Math.max(f.X(th) - tw / 2, f.L + 4), f.R - tw - 2); if (used.some(([a, b]) => x < b + 6 && x + tw > a - 6)) continue; used.push([x, x + tw]); c.fillStyle = col; c.textAlign = 'left'; c.fillText(s, x, f.T + 8); }
    },
    text() {
      const N = val('c11N'), d = val('c11D'), t0 = val('c11T'), st = M.array(N, d, t0);
      let ph = st.phaseStep * 180 / Math.PI; ph = ((ph + 180) % 360 + 360) % 360 - 180;
      const gl = st.grating.map(x => deg(x, 0)).join(' / ');
      put('#c11No', String(N)); put('#c11Do', fmt(d, 2) + ' λ'); put('#c11To', deg(t0, 0));
      put('#c11W', deg(st.hpbw, 1)); put('#c11P', deg(ph, 0)); put('#c11G', fmt(st.gainDb, 1) + ' dB'); put('#c11Gl', gl || t('u.none'));
      const v = { n: N, d: fmt(d, 2), t: deg(t0, 0), w: deg(st.hpbw, 1), len: fmt(N * d, 1), ph: deg(ph, 0), gl, dmax: fmt(st.dMax, 2) };
      putHTML('#c11aSay', st.grating.length ? t('ch11.arr.say.grating', v) : N < 4 ? t('ch11.arr.say.few', v) : t('ch11.arr.say.ok', v));
    }
  });
  on('#c11N, #c11D, #c11T', 'input', () => { arr.dirty = true; arr.text(); });
})();

applyLang();
requestAnimationFrame(loop);
window.__essayReady = true;
})();
