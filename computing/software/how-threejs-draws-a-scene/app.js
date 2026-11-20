/* How three.js draws a scene: i18n runtime, wiring and drawing. All visible text comes from copy.*.js (generated from
   content.<lang>.md by scripts/build-pages.cjs); the static diagrams are inline SVG partials (figures/dg-*.html, written
   by tools/diagrams.cjs). Every number shown is computed by models.js, which reimplements the three.js r187 code
   paths at small scale. The runtime head follows computing/systems/how-a-cpu-does-math/app.js. Nothing animates on
   its own: every canvas redraws when a control changes, so prefers-reduced-motion needs no special case. */
(() => {
'use strict';
const M = window.ThreeSceneModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const C = { bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', dimfill: '#3a4254', card2: '#1a1f2b' };
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';

/* ───────── language ─────────
   content.en.md may be a structural stub while the translation is pending. page.json then declares
   "languages": {"en": "stub"}, the build writes data-lang-en="stub" on <html>, and the page treats English as absent
   (falls back to Chinese and says so in <html lang>). specs/site-template.md §3a, §9a. */
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
const fmt = (x, d) => M.fmt(x, d);
const pct = (x, d) => t('u.pct', { v: fmt(x * 100, d == null ? 0 : d) });
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
  sims.forEach(s => { s.dirty = true; });
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
function loop() { for (const s of sims) if (s.vis && s.dirty) { s.dirty = false; s.draw(); } requestAnimationFrame(loop); }
const radioVal = name => { const r = document.querySelector(`input[name=${name}]:checked`); return r ? r.value : null; };
const put = (sel, s) => { const e = $(sel); if (e && e.textContent !== s) e.textContent = s; };
const putHTML = (sel, s) => { const e = $(sel); if (e && e.__h !== s) { e.innerHTML = s; e.__h = s; } };
const onAll = (els, ev, fn) => els.forEach(e => e.addEventListener(ev, fn));
const sliderOut = (id, s) => put('#' + id + 'o', s);
function rangeLab(sel, fn) { const e = $(sel); e.addEventListener('input', fn); e.addEventListener('change', fn); return e; }
const chkLab = (sel, fn) => $(sel).addEventListener('change', fn);

/* chart helpers */
function frame(w, h, m, x0, x1, y0, y1, logx, logy) {
  const L = m[3], R = w - m[1], T = m[0], B = h - m[2];
  const fx = v => (logx ? Math.log10(v) : v), fy = v => (logy ? Math.log10(v) : v);
  return { L, R, T, B, X: x => L + (R - L) * (fx(x) - fx(x0)) / (fx(x1) - fx(x0)), Y: y => B - (B - T) * (fy(y) - fy(y0)) / (fy(y1) - fy(y0)) };
}
function axes(c, f, xLab, yLab) {
  c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.T); c.lineTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
  c.fillStyle = C.mute; c.font = FONT;
  if (yLab) { c.textAlign = 'left'; fitText(c, yLab, f.R - f.L - 8); c.fillText(yLab, f.L + 6, f.T - 10); c.font = FONT; }
  if (xLab) { c.textAlign = 'right'; fitText(c, xLab, f.R - f.L - 8); c.fillText(xLab, f.R, f.B + 30); c.font = FONT; }
}
function xTicks(c, f, items) {
  c.fillStyle = C.mute; c.font = FONT; c.textAlign = 'center'; let lastR = -Infinity;
  for (const [x, s] of items) { const px = f.X(x), w = c.measureText(s).width, cx = Math.min(Math.max(px, f.L + w / 2), f.R - w / 2); if (cx - w / 2 < lastR + 8) continue; c.fillText(s, cx, f.B + 13); lastR = cx + w / 2; c.strokeStyle = C.line; c.beginPath(); c.moveTo(px, f.B); c.lineTo(px, f.B + 4); c.stroke(); }
}
function yTicks(c, f, items) {
  c.fillStyle = C.mute; c.font = FONT; c.textAlign = 'right'; let lastY = Infinity;
  for (const [y, s] of items) { const py = f.Y(y); if (py > lastY - 14 || py < f.T - 2) continue; c.fillText(s, f.L - 6, py); lastY = py; c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, py); c.lineTo(f.R, py); c.stroke(); }
}
function poly(c, pts, col, lw, dash) { c.strokeStyle = col; c.lineWidth = lw || 2; c.lineJoin = 'round'; c.setLineDash(dash || []); c.beginPath(); let first = true; for (const [x, y] of pts) { if (!isFinite(x) || !isFinite(y)) { first = true; continue; } if (first) c.moveTo(x, y); else c.lineTo(x, y); first = false; } c.stroke(); c.setLineDash([]); }
function dot(c, x, y, col, r) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r || 4.5, 0, 6.283); c.fill(); }
function ring(c, x, y, col, r, lw) { c.strokeStyle = col; c.lineWidth = lw || 1.5; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.stroke(); }
function fitText(c, s, maxW, base) { base = base || 12; let fs = base; c.font = FONT.replace('12px', fs + 'px'); while (c.measureText(s).width > maxW && fs > 10) { fs -= 0.5; c.font = FONT.replace('12px', fs + 'px'); } }
// a label kept inside [x0, x1] horizontally
function label(c, s, x, y, col, align, x0, x1) {
  c.font = FONT; c.fillStyle = col; const w = c.measureText(s).width;
  let left = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  left = Math.max(x0 == null ? 2 : x0, Math.min(left, (x1 == null ? c.canvas.clientWidth - 2 : x1) - w));
  c.textAlign = 'left'; c.fillText(s, left, y); return { l: left, r: left + w };
}
const sig = (x, n) => M.sig(x, n);
const distStr = x => (!isFinite(x) ? '∞' : x >= 100 ? fmt(x, 0) : x >= 1 ? fmt(x, 1) : sig(x, 2));
// pixel image (array of [r,g,b] in 0…1 or grey) drawn upscaled without smoothing
function blit(c, w, h, fill, x, y, dw, dh) {
  const off = document.createElement('canvas'); off.width = w; off.height = h;
  const oc = off.getContext('2d'), img = oc.createImageData(w, h);
  for (let i = 0; i < w * h; i++) { const v = fill(i); img.data[i * 4] = v[0]; img.data[i * 4 + 1] = v[1]; img.data[i * 4 + 2] = v[2]; img.data[i * 4 + 3] = 255; }
  oc.putImageData(img, 0, 0);
  c.imageSmoothingEnabled = false; c.drawImage(off, x, y, dw, dh); c.imageSmoothingEnabled = true;
}
const to8 = v => Math.max(0, Math.min(255, Math.round(M.linearToSRGB(Math.max(0, Math.min(1, v))) * 255)));

/* ═════════ ch2: the scene graph ═════════ */
(function ch2() {
  const cv = $('#c2Cv'), day = $('#c2Day'), sc = $('#c2Scale'), st = $('#c2Stale');
  let S = null;
  function update() {
    const d = +day.value, es = +sc.value;
    S = M.orreryFrame(d - 0.01, d, { earthScale: es });   // one frame = 0.01 rad of the earth's orbit (TUNED)
    sliderOut('c2Day', t('u.deg', { v: fmt(d * 180 / Math.PI, 0) }));
    sliderOut('c2Scale', fmt(es, 2));
    const p = S.fresh, q = S.stale;
    put('#c2Pos', `(${fmt(p[0], 2)}, ${fmt(p[2], 2)})`);
    put('#c2Orb', fmt(S.moonOrbitR, 2));
    put('#c2Work', `${S.stats.compose} / ${S.stats.world}`);
    put('#c2Lag', st.checked ? fmt(S.lag, 3) : '—');
    putHTML('#c2Say', st.checked ? t('ch2.say.stale', { x0: fmt(q[0], 2), z0: fmt(q[2], 2), d: fmt(S.lag, 3) })
      : t('ch2.say.fresh', { x: fmt(p[0], 2), z: fmt(p[2], 2), s: fmt(es, 2), r: fmt(S.moonOrbitR, 2) }));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), s = Math.min(w, h) / 2 / (M.ORRERY.earthR + S.moonOrbitR + 1.1), cx = w / 2, cy = h / 2;
    const P = v => [cx + v[0] * s, cy + v[2] * s];
    const T = S.tree, earth = M.worldPos(T.earth), moon = S.fresh;
    ring(c, cx, cy, C.line, M.ORRERY.earthR * s, 1);
    const E = P(earth), Mo = P(moon), R = S.moonOrbitR * s;
    c.setLineDash([3, 4]); ring(c, E[0], E[1], C.line, R, 1); c.setLineDash([]);
    dot(c, cx, cy, C.gold, 0.9 * s);
    dot(c, E[0], E[1], C.cyan, Math.max(3, 0.6 * +sc.value * s));
    dot(c, Mo[0], Mo[1], C.ink, Math.max(2.5, 0.27 * +sc.value * s));
    if (st.checked) { const Q = P(S.stale); ring(c, Q[0], Q[1], C.red, Math.max(4, 0.27 * +sc.value * s) + 2, 1.5); }
    // labels: sun above or below the sun, whichever side the moon is not on (a big earth scale brings the moon close to
    // the sun); earth on the side away from the moon; moon outward from the earth
    const dx = Mo[0] - E[0], dy = Mo[1] - E[1], dl = Math.hypot(dx, dy) || 1;
    label(c, t('ch2.cv.sun'), cx, Mo[1] > cy ? cy - 0.9 * s - 6 : cy + 0.9 * s + 14, C.gold, 'center');
    const ex = E[0] - dx / dl * 20, ey = E[1] - dy / dl * 20;
    label(c, t('ch2.cv.earth'), ex, ey, C.cyan, dx > 0 ? 'right' : 'left');
    const mx = Mo[0] + dx / dl * 14, my = Mo[1] + dy / dl * 14;
    label(c, t('ch2.cv.moon'), mx, my, C.ink, dx > 0 ? 'left' : 'right');
  } });
  rangeLab('#c2Day', update); rangeLab('#c2Scale', update); chkLab('#c2Stale', update);
  langHooks.push(update); update();
})();

/* ═════════ ch3: geometry ═════════ */
(function ch3() {
  const cv = $('#c3Cv'), seg = $('#c3Seg');
  let G = null, kind = 'box';
  function dims() { const v = +seg.value; return kind === 'box' ? { s: v } : { ws: 4 * v, hs: 2 * v }; }
  function update() {
    kind = radioVal('c3Kind');
    const d = dims();
    let n;
    if (kind === 'box') { G = M.boxGeometry(1, 1, 1, d.s, d.s, d.s); n = M.boxCounts(d.s, d.s, d.s); sliderOut('c3Seg', String(d.s)); }
    else { G = M.sphereGeometry(0.62, d.ws, d.hs); n = M.sphereCounts(d.ws, d.hs); sliderOut('c3Seg', `${d.ws} × ${d.hs}`); }
    const B = M.geomBytes(n.vertices, n.triangles);
    put('#c3V', fmt(n.vertices, 0)); put('#c3T', fmt(n.triangles, 0));
    put('#c3VB', M.bytesStr(B.vertexBytes)); put('#c3IB', `${M.bytesStr(B.indexBytes)} · ${B.indexType}`);
    putHTML('#c3Say', kind === 'box' ? t('ch3.say.box', { s: d.s, fv: (d.s + 1) * (d.s + 1), v: fmt(n.vertices, 0), t: fmt(n.triangles, 0), it: B.indexType })
      : t('ch3.say.sphere', { ws: d.ws, hs: d.hs, v: fmt(n.vertices, 0), t: fmt(n.triangles, 0), it: B.indexType }));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), s = Math.min(w, h) * 0.52, cx = w / 2, cy = h / 2;
    const ya = 0.62, pa = 0.42, cyw = Math.cos(ya), syw = Math.sin(ya), cp = Math.cos(pa), sp = Math.sin(pa);
    const P = G.position, I = G.index, nV = P.length / 3, pr = new Float32Array(nV * 3);
    for (let i = 0; i < nV; i++) {
      const x = P[i * 3], y = P[i * 3 + 1], z = P[i * 3 + 2];
      const x1 = cyw * x + syw * z, z1 = -syw * x + cyw * z, y2 = cp * y - sp * z1, z2 = sp * y + cp * z1;
      pr[i * 3] = cx + x1 * s; pr[i * 3 + 1] = cy - y2 * s; pr[i * 3 + 2] = z2;
    }
    const back = [], front = [];
    for (let j = 0; j < I.length; j += 3) {
      const a = I[j] * 3, b = I[j + 1] * 3, d = I[j + 2] * 3;
      const cr = (pr[b] - pr[a]) * (pr[d + 1] - pr[a + 1]) - (pr[b + 1] - pr[a + 1]) * (pr[d] - pr[a]);
      (cr < 0 ? front : back).push([a, b, d]);   // screen y points down: counter-clockwise in 3D is negative here
    }
    const stroke = (L, col, lw) => { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); for (const [a, b, d] of L) { c.moveTo(pr[a], pr[a + 1]); c.lineTo(pr[b], pr[b + 1]); c.lineTo(pr[d], pr[d + 1]); c.closePath(); } c.stroke(); };
    stroke(back, 'rgba(99,199,230,.16)', 1);
    stroke(front, 'rgba(99,199,230,.7)', 1);
    const r = nV > 600 ? 1.2 : 2.4;
    for (let i = 0; i < nV; i++) dot(c, pr[i * 3], pr[i * 3 + 1], C.gold, r);
  } });
  onAll($$('input[name=c3Kind]'), 'change', () => { seg.value = radioVal('c3Kind') === 'box' ? 1 : 8; update(); });
  rangeLab('#c3Seg', update); langHooks.push(update); update();
})();

/* ═════════ ch4: one point through the chain ═════════ */
(function ch4() {
  const cv = $('#c4Cv'), dS = $('#c4D'), fS = $('#c4Fov');
  const NEAR = 0.1, FAR = 2000;
  let R = null, D = 10;
  function update() {
    D = Math.pow(10, +dS.value); const fov = +fS.value;
    R = M.chain({ fov, aspect: 16 / 9, near: NEAR, far: FAR, point: [0.1 * D, 0.05 * D, -D], width: 1280, height: 720 });
    sliderOut('c4D', distStr(D)); sliderOut('c4Fov', t('u.deg', { v: fov }));
    put('#c4Clip', R.clip.map(v => sig(v, 3)).join(', '));
    put('#c4Ndc', R.ndc.map(v => sig(v, 3)).join(', '));
    const inZ = D >= NEAR && D <= FAR;
    put('#c4Win', R.inside ? `(${fmt(R.win[0], 1)}, ${fmt(R.win[1], 1)})` : '—');
    put('#c4Dep', R.inside ? fmt(R.depthInt, 0) : '—');
    if (R.inside) putHTML('#c4Say', t('ch4.say.in', { z: fmt(R.win[2], 5), p: pct(R.win[2], 1) }));
    else putHTML('#c4Say', t('ch4.say.out', { why: t(D < NEAR ? 'ch4.why.near' : !inZ ? 'ch4.why.far' : 'ch4.why.side') }));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), L = 20, Rr = w - 20;
    // top: the depth range 0…1 (linear); bottom: distance on a log axis; lines join a distance to its depth
    const yTop = 46, yBot = h - 52;
    const dx = d => L + (Rr - L) * (Math.log10(d) - Math.log10(0.05)) / (Math.log10(4000) - Math.log10(0.05));
    const zx = z => L + (Rr - L) * z;
    c.fillStyle = C.card2; c.fillRect(L, yTop - 8, Rr - L, 16);
    c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(L, yBot); c.lineTo(Rr, yBot); c.stroke();
    const marks = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000];
    for (const d of marks) {
      const z = M.depthStd(d, NEAR, FAR);
      const major = [0.1, 1, 10, 100, 1000].includes(d);
      c.strokeStyle = major ? 'rgba(99,199,230,.55)' : 'rgba(99,199,230,.2)'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(dx(d), yBot); c.lineTo(zx(z), yTop + 8); c.stroke();
      c.strokeStyle = C.mute; c.beginPath(); c.moveTo(dx(d), yBot); c.lineTo(dx(d), yBot + 4); c.stroke();
    }
    // distance tick labels (decades), skipping collisions
    let lastR = -Infinity; c.fillStyle = C.mute; c.textAlign = 'center';
    for (const d of [0.1, 1, 10, 100, 1000]) { const s = d < 1 ? '0.1' : fmt(d, 0), tw = c.measureText(s).width, x = Math.min(Math.max(dx(d), L + tw / 2), Rr - tw / 2); if (x - tw / 2 < lastR + 6) continue; c.fillText(s, x, yBot + 15); lastR = x + tw / 2; }
    label(c, t('ch4.cv.dist'), Rr, yBot + 34, C.mute, 'right', L, Rr);
    label(c, '0', L, yTop - 22, C.mute, 'left', L, Rr); label(c, '1', Rr, yTop - 22, C.mute, 'right', L, Rr);
    label(c, t('ch4.cv.depth'), (L + Rr) / 2, yTop - 22, C.mute, 'center', L + 24, Rr - 24);
    // near and far
    c.strokeStyle = C.gold; c.lineWidth = 2; c.beginPath(); c.moveTo(dx(NEAR), yBot - 6); c.lineTo(dx(NEAR), yBot + 6); c.stroke();
    c.strokeStyle = C.violet; c.beginPath(); c.moveTo(dx(FAR), yBot - 6); c.lineTo(dx(FAR), yBot + 6); c.stroke();
    // the point
    const px = dx(Math.max(0.05, Math.min(4000, D)));
    dot(c, px, yBot, R.inside ? C.red : C.mute, 5);
    if (R.inside) { c.strokeStyle = C.red; c.lineWidth = 1.5; c.beginPath(); c.moveTo(px, yBot - 5); c.lineTo(zx(R.win[2]), yTop + 8); c.stroke(); dot(c, zx(R.win[2]), yTop, C.red, 5); }
  } });
  rangeLab('#c4D', update); rangeLab('#c4Fov', update); langHooks.push(update); update();
})();

/* ═════════ ch4: depth precision ═════════ */
(function ch4d() {
  const cv = $('#c4dCv'), nS = $('#c4dN'), fS = $('#c4dF'), sS = $('#c4dS');
  let n, f, sep, A, B, Cc;
  function update() {
    n = Math.pow(10, +nS.value); f = Math.pow(10, +fS.value); sep = Math.pow(10, +sS.value);
    sliderOut('c4dN', distStr(n)); sliderOut('c4dF', fmt(f, 0)); sliderOut('c4dS', sig(sep, 2));
    A = M.zFightFrom(sep, n, f, 'standard', 24); B = M.zFightFrom(sep, n, f, 'log', 24); Cc = M.zFightFrom(sep, n, f, 'reversed');
    const s = x => (isFinite(x) ? distStr(x) : t('ch4.d.never'));
    put('#c4dA', s(A)); put('#c4dB', s(B)); put('#c4dC', s(Cc));
    // in the sentence each scheme reads as a whole clause ("flickers from 130 on" / "does not flicker before the far plane")
    const cl = (x, em) => (isFinite(x) ? t('ch4.d.from', { d: em ? '<em>' + distStr(x) + '</em>' : distStr(x) }) : t('ch4.d.nofl'));
    putHTML('#c4dSay', t('ch4.d.say', { sep: sig(sep, 2), n: distStr(n), f: fmt(f, 0), a: cl(A, true), b: cl(B), c: cl(Cc) }));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), y0 = 1e-7, y1 = 1e3;
    const F = frame(w, h, [28, 14, 42, 46], n, f, y0, y1, true, true);
    const yt = []; for (let e = -7; e <= 3; e += 2) yt.push([Math.pow(10, e), e === 0 ? '1' : '10' + String(e).replace('-', '⁻').replace(/\d/g, d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d])]);
    yTicks(c, F, yt);
    const xt = []; for (let e = Math.ceil(Math.log10(n)); e <= Math.floor(Math.log10(f)); e++) xt.push([Math.pow(10, e), e < 0 ? String(Math.pow(10, e)) : fmt(Math.pow(10, e), 0)]);
    xTicks(c, F, xt);
    axes(c, F, t('ch4.d.cv.x'), t('ch4.d.cv.y'));
    const curve = scheme => { const pts = []; for (let i = 0; i <= 120; i++) { const D = n * Math.pow(f / n, i / 120), v = M.depthStep(D, n, f, scheme, 24); pts.push([F.X(D), F.Y(Math.max(y0, Math.min(y1, v)))]); } return pts; };
    poly(c, curve('standard'), C.red, 2); poly(c, curve('log'), C.cyan, 2); poly(c, curve('reversed'), C.gold, 2);
    const ys = F.Y(sep); c.strokeStyle = C.ink; c.setLineDash([5, 4]); c.lineWidth = 1.2; c.beginPath(); c.moveTo(F.L, ys); c.lineTo(F.R, ys); c.stroke(); c.setLineDash([]);
    if (isFinite(A)) dot(c, F.X(A), ys, C.red, 5);
    if (isFinite(B)) dot(c, F.X(B), ys, C.cyan, 5);
    if (isFinite(Cc)) dot(c, F.X(Cc), ys, C.gold, 5);
  } });
  rangeLab('#c4dN', update); rangeLab('#c4dF', update); rangeLab('#c4dS', update); langHooks.push(update); update();
})();

/* ═════════ ch5: culling and the render lists ═════════ */
(function ch5() {
  const cv = $('#c5Cv'), yS = $('#c5Yaw'), fS = $('#c5Fov'), rS = $('#c5Far'), so = $('#c5Sort');
  const MATCOL = [C.mute, '#c98b52', C.gold, C.cyan];
  let F = null;
  function update() {
    const yaw = +yS.value, fov = +fS.value, far = +rS.value;
    F = M.cullFrame({ yaw, fov, far, sort: so.checked });
    sliderOut('c5Yaw', t('u.deg', { v: fmt(-yaw * 180 / Math.PI, 0) })); sliderOut('c5Fov', t('u.deg', { v: fov })); sliderOut('c5Far', String(far));
    put('#c5Vis', String(F.visible)); put('#c5Cull', String(F.culled.length)); put('#c5Fp', String(F.falsePos.length)); put('#c5Sw', String(F.switches));
    const ord = new Map(); F.opaque.concat(F.transparent).forEach((it, i) => ord.set(it.id, i + 1));
    const fp = F.falsePos.length ? t('ch5.say.fp', { ids: F.falsePos.map(o => ord.get(o.id)).join(t('u.sep')) }) : t('ch5.say.nofp');
    putHTML('#c5Say', so.checked ? t('ch5.say.sorted', { n: F.visible, c: F.culled.length, sw: F.switches, t: F.transparent.length, fp })
      : t('ch5.say.unsorted', { sw: F.switches, fp }));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), x0 = -14.5, x1 = 14.5, z0 = -21, z1 = 8;
    const s = Math.min(w / (x1 - x0), h / (z1 - z0)), ox = (w - s * (x1 - x0)) / 2, oz = (h - s * (z1 - z0)) / 2;
    const P = (x, z) => [ox + (x - x0) * s, oz + (z - z0) * s];
    c.strokeStyle = C.grid; c.lineWidth = 1;
    for (let x = -14; x <= 14; x += 2) { const a = P(x, z0), b = P(x, z1); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }
    for (let z = -20; z <= 8; z += 2) { const a = P(x0, z), b = P(x1, z); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }
    c.fillStyle = 'rgba(233,185,73,.08)'; c.strokeStyle = 'rgba(233,185,73,.6)'; c.lineWidth = 1.2; c.beginPath();
    F.poly.forEach(([x, z], i) => { const p = P(x, z); if (i) c.lineTo(p[0], p[1]); else c.moveTo(p[0], p[1]); }); c.closePath(); c.fill(); c.stroke();
    // camera
    const e = P(F.eye[0], F.eye[2]), fw = [F.fwd[0], F.fwd[2]];
    c.fillStyle = C.ink; c.beginPath(); c.moveTo(e[0] + fw[0] * 10, e[1] + fw[1] * 10); c.lineTo(e[0] - fw[1] * 6 - fw[0] * 4, e[1] + fw[0] * 6 - fw[1] * 4); c.lineTo(e[0] + fw[1] * 6 - fw[0] * 4, e[1] - fw[0] * 6 - fw[1] * 4); c.closePath(); c.fill();
    const order = new Map(); F.opaque.concat(F.transparent).forEach((it, i) => order.set(it.id, i + 1));
    const fpIds = new Set(F.falsePos.map(o => o.id));
    c.font = '11px -apple-system,"PingFang SC",system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    for (const ob of M.CULL_SCENE) {
      const p = P(ob.x, ob.z), r = Math.max(5, ob.r * s), col = MATCOL[ob.mat], k = order.get(ob.id);
      if (k) { c.fillStyle = ob.transparent ? 'rgba(99,199,230,.35)' : col; c.beginPath(); c.arc(p[0], p[1], r, 0, 6.283); c.fill(); if (ob.transparent) ring(c, p[0], p[1], C.cyan, r, 1.5); }
      else ring(c, p[0], p[1], 'rgba(163,170,184,.45)', r, 1);
      if (fpIds.has(ob.id)) ring(c, p[0], p[1], C.red, r + 3, 2);
      if (k) { c.fillStyle = ob.transparent ? C.ink : '#0c0e13'; c.fillText(String(k), p[0], p[1] + 0.5); }
    }
    c.font = FONT; c.textBaseline = 'middle';
  } });
  rangeLab('#c5Yaw', update); rangeLab('#c5Fov', update); rangeLab('#c5Far', update); chkLab('#c5Sort', update);
  langHooks.push(update); update();
})();

/* ═════════ ch6: program cache keys ═════════ */
(function ch6() {
  const cv = $('#c6Cv'), tb = $('#c6Tbl tbody');
  const BASE = { dir: 1, point: 0, shadows: false, fog: false, toneMapping: false };
  let P = null, base = null;
  const state = () => ({ dir: 1, point: $('#c6Point').checked ? 1 : 0, shadows: $('#c6Shadow').checked, fog: $('#c6Fog').checked, toneMapping: $('#c6Tone').checked });
  // the parts of a key the lab changes, in the order they appear in the key
  function brief(m, st) {
    const p = M.programParameters(m, st), K = M.programCacheKey(p, 'srgb').split(',');
    const at = name => K[(p.defines ? Object.keys(p.defines).length * 2 : 0) + 1 + M.KEY_PARAMS.indexOf(name)];
    const n = K.length;
    return [p.shaderID + (p.defines ? ',' + Object.keys(p.defines).join(',') : ''), 'mapUv=' + at('mapUv'), 'dir=' + at('numDirLights'), 'point=' + at('numPointLights'), 'dirShadows=' + at('numDirLightShadows'), 'toneMapping=' + at('toneMapping'), 'mask1=' + K[n - 4], 'mask2=' + K[n - 3]].join(' · ');
  }
  function update() {
    // the scene was drawn once in BASE, then the switches changed: only the materials WebGLRenderer re-keys get a new
    // program (models.js programsAfter); the others keep the key they had
    const st = state(); P = M.programsAfter(BASE, st); base = new Set(M.programs(BASE).keys);
    const ids = [...new Set(P.keys)];
    tb.innerHTML = M.LAB_MATERIALS.map((m, i) => `<tr${base.has(P.keys[i]) ? '' : ' class="new"'}><td>${t('ch6.mat.' + m.name)}</td><td>P${ids.indexOf(P.keys[i]) + 1}</td><td>${brief(m, P.refetched[i] ? st : BASE)}</td></tr>`).join('');
    const k = P.fresh;
    put('#c6N', String(P.distinct)); put('#c6New', String(k)); put('#c6Len', t('ch6.u.chars', { v: P.keys[2].length }));
    const changed = st.point || st.shadows || st.fog || st.toneMapping;
    const why = st.toneMapping ? t('ch6.why.tone') : (st.point || st.shadows) ? t('ch6.why.light') : t('ch6.why.fog');
    putHTML('#c6Say', !changed ? t('ch6.say.base', { n: P.distinct }) : t('ch6.say.changed', { k, n: P.distinct, why }));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), ids = [...new Set(P.keys)], n = M.LAB_MATERIALS.length;
    const xl = Math.max(30, w * 0.18), xr = w - Math.max(40, w * 0.18), ym = i => 18 + (h - 36) * (i + 0.5) / n, yp = j => 18 + (h - 36) * (j + 0.5) / ids.length;
    M.LAB_MATERIALS.forEach((m, i) => {
      const j = ids.indexOf(P.keys[i]), fresh = !base.has(P.keys[i]);
      c.strokeStyle = fresh ? 'rgba(240,122,109,.7)' : 'rgba(99,199,230,.6)'; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(xl + 8, ym(i)); c.bezierCurveTo((xl + xr) / 2, ym(i), (xl + xr) / 2, yp(j), xr - 18, yp(j)); c.stroke();
      dot(c, xl, ym(i), C.gold, 6); label(c, String(i + 1), xl - 12, ym(i), C.mute, 'right', 2, xl - 8);
    });
    ids.forEach((k, j) => { const fresh = !base.has(k); c.fillStyle = fresh ? 'rgba(240,122,109,.25)' : 'rgba(99,199,230,.18)'; c.fillRect(xr - 18, yp(j) - 9, 36, 18); label(c, 'P' + (j + 1), xr, yp(j), fresh ? C.red : C.cyan, 'center', xr - 18, xr + 18); });
  } });
  ['#c6Point', '#c6Shadow', '#c6Fog', '#c6Tone'].forEach(s => chkLab(s, update));
  langHooks.push(update); update();
})();

/* ═════════ ch7: the colour of one pixel ═════════ */
(function ch7() {
  const cv = $('#c7Cv'), rS = $('#c7R'), mS = $('#c7M'), ms = $('#c7MS');
  const COL = [0.95, 0.64, 0.3], Ld = M.norm([-0.55, 0.6, 0.75]), V = [0, 0, 1], LIGHT = 3;   // TUNED: colour, light direction and intensity
  const LOST = []; for (let i = 0; i <= 20; i++) LOST.push(M.energyLost(Math.max(0.045, i / 20), 1));
  let img = null, r, m, peak;
  function update() {
    r = +rS.value; m = +mS.value;
    sliderOut('c7R', fmt(r, 2)); sliderOut('c7M', fmt(m, 2));
    const N = 72; img = new Array(N * N);
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const x = (i + 0.5) / N * 2 - 1, y = 1 - (j + 0.5) / N * 2, q = 1 - x * x - y * y;
      if (q <= 0) { img[j * N + i] = null; continue; }
      const s = M.shade({ N: [x, y, Math.sqrt(q)], V, L: Ld, roughness: r, metalness: m, color: COL, light: LIGHT, noMS: !ms.checked });
      img[j * N + i] = s.out.map(to8);
    }
    const H = M.norm(M.add(Ld, V));
    peak = M.shade({ N: H, V, L: Ld, roughness: r, metalness: m, color: COL, light: LIGHT, noMS: !ms.checked });
    const lost = M.energyLost(Math.max(r, 0.045), 1);
    put('#c7D', sig(peak.D, 3)); put('#c7V', sig(peak.V, 3)); put('#c7F', sig(peak.F[0], 3)); put('#c7Lost', pct(lost, 1));
    putHTML('#c7Say', t('ch7.say', { r: fmt(r, 2), m: fmt(m, 2), d: sig(peak.D, 3), lost: pct(lost, 1), ms: ms.checked ? t('ch7.say.on', { c: fmt(peak.msc, 2) }) : t('ch7.say.off') }));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), narrow = w < 460;
    const S = narrow ? Math.min(w * 0.5, h - 20) : Math.min(h - 24, w * 0.42), sx = narrow ? 10 : 16, sy = (h - S) / 2;
    const N = 72;
    blit(c, N, N, k => img[k] || [15, 18, 25], sx, sy, S, S);
    c.imageSmoothingEnabled = true;
    // right: energy lost against roughness (white furnace, N·V = 1, three's DFG table)
    const x0 = sx + S + (narrow ? 34 : 50);
    const F = frame(w - x0 + 0, h, [28, 12, 40, 0], 0, 1, 0, 0.8);
    const G = { L: x0, R: w - 12, T: F.T, B: F.B, X: v => x0 + (w - 12 - x0) * v, Y: F.Y };
    yTicks(c, G, [[0, '0'], [0.4, '40%'], [0.8, '80%']]);
    xTicks(c, G, [[0, '0'], [0.5, '0.5'], [1, '1']]);
    axes(c, G, t('ch7.cv.x'), null);
    { c.font = FONT; const yl = t('ch7.cv.y'), tw = c.measureText(yl).width; label(c, yl, Math.max(4, Math.min(G.L + 6, w - 4 - tw)), G.T - 12, C.mute, 'left', 4, w - 4); }
    poly(c, LOST.map((v, i) => [G.X(i / 20), G.Y(v)]), C.red, 2);
    dot(c, G.X(r), G.Y(M.energyLost(Math.max(r, 0.045), 1)), C.gold, 5);
  } });
  rangeLab('#c7R', update); rangeLab('#c7M', update); chkLab('#c7MS', update); langHooks.push(update); update();
})();

/* ═════════ ch8: a software rasteriser ═════════ */
(function ch8() {
  const cv = $('#c8Cv');
  let fb = null, kind;
  function update() {
    kind = radioVal('c8Scene');
    const tilt = +$('#c8Tilt').value, persp = $('#c8Persp').checked, order = $('#c8Order').checked ? 'gc' : 'cg', dw = $('#c8DW').checked, cross = $('#c8Cross').checked;
    sliderOut('c8Tilt', fmt(tilt, 2));
    const o = { tilt, perspective: persp, order, depthWrite: dw, cross };
    fb = M.rasterScene(kind, o);
    const st = fb.stats;
    put('#c8Fr', fmt(st.fragments, 0)); put('#c8Pa', fmt(st.passed, 0)); put('#c8Fa', fmt(st.failed, 0));
    let wrong = 0, say;
    if (kind === 'pair') { wrong = M.orderDiff('pair', o); say = t('ch8.say.pair', { f: st.fragments, x: st.failed }); }
    else if (kind === 'checker') {
      const ref = M.rasterScene('checker', { perspective: true });
      for (let i = 0; i < fb.w * fb.h; i++) if (Math.abs(ref.color[i * 3] - fb.color[i * 3]) > 1e-6) wrong++;
      say = persp ? t('ch8.say.checker.on') : t('ch8.say.checker.off', { d: wrong });
    } else {
      wrong = M.glassWrong(order, { depthWrite: dw, cross });
      say = t('ch8.say.glass', { w: wrong, why: t(cross ? 'ch8.why.cross' : wrong ? 'ch8.why.front' : 'ch8.why.ok') });
    }
    put('#c8Wr', fmt(wrong, 0)); putHTML('#c8Say', say);
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), narrow = w < 520, gap = 12;
    let iw, ih, ax, ay, bx, by;
    if (narrow) { ih = (h - 3 * 20 - gap) / 2; iw = Math.min(w - 20, ih * 1.6); ih = iw / 1.6; ax = (w - iw) / 2; ay = 20; bx = ax; by = ay + ih + 20 + gap; }
    else { iw = Math.min((w - 3 * gap) / 2, (h - 26) * 1.6); ih = iw / 1.6; ax = (w - 2 * iw - gap) / 2; bx = ax + iw + gap; ay = by = 22 + (h - 22 - ih) / 2; }
    blit(c, fb.w, fb.h, i => [to8(fb.color[i * 3] * fb.color[i * 3]), to8(fb.color[i * 3 + 1] * fb.color[i * 3 + 1]), to8(fb.color[i * 3 + 2] * fb.color[i * 3 + 2])], ax, ay, iw, ih);
    let zmin = 1; for (let i = 0; i < fb.w * fb.h; i++) if (fb.depth[i] < zmin) zmin = fb.depth[i];
    blit(c, fb.w, fb.h, i => { const d = fb.depth[i]; if (d >= 1) return [15, 18, 25]; const v = Math.round(60 + 195 * (1 - (d - zmin) / Math.max(1e-6, 1 - zmin))); return [v, v, v]; }, bx, by, iw, ih);
    label(c, t('ch8.cv.color'), ax, ay - 10, C.mute, 'left', ax, ax + iw);
    label(c, t('ch8.cv.depth'), bx, by - 10, C.mute, 'left', bx, bx + iw);
  } });
  onAll($$('input[name=c8Scene]'), 'change', update); rangeLab('#c8Tilt', update);
  ['#c8Persp', '#c8Order', '#c8DW', '#c8Cross'].forEach(s => chkLab(s, update));
  langHooks.push(update); update();
})();

/* ═════════ ch9: textures ═════════ */
(function ch9() {
  const cv = $('#c9Cv'), pS = $('#c9P'), lv = $('#c9L');
  let V = null;
  function update() {
    const f = radioVal('c9F'), pitch = +pS.value;
    sliderOut('c9P', t('u.deg', { v: pitch }));
    V = M.floorView({ w: 96, h: 56, filter: f, maxAniso: 8, pitch });
    let lm = 0; V.lvl.forEach(x => { if (x > lm) lm = x; });
    put('#c9Far', fmt(V.farError, 3)); put('#c9Mid', pct(V.midContrast * 2, 0)); put('#c9Lm', fmt(lm, 1));
    putHTML('#c9Say', t('ch9.say', { f: t('ch9.f.' + f), e: fmt(V.farError, 3), c: pct(V.midContrast * 2, 0), why: t('ch9.why.' + f) }));
    sim.dirty = true;
  }
  const LC = [[99, 199, 230], [122, 214, 160], [233, 185, 73], [240, 122, 109], [179, 157, 251], [235, 232, 224], [235, 232, 224]];
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), iw = Math.min(w - 20, (h - 10) * 96 / 56), ih = iw * 56 / 96;
    blit(c, V.w, V.h, i => {
      const v = V.px[i]; if (v < 0) return [20, 24, 34];
      if (lv.checked) { const L = Math.max(0, Math.min(6, Math.floor(V.lvl[i]))); const k = LC[L]; return [Math.round(k[0] * (0.45 + 0.4 * v)), Math.round(k[1] * (0.45 + 0.4 * v)), Math.round(k[2] * (0.45 + 0.4 * v))]; }
      const g = Math.round(40 + v * 200); return [g, g, g];
    }, (w - iw) / 2, (h - ih) / 2, iw, ih);
  } });
  onAll($$('input[name=c9F]'), 'change', update); rangeLab('#c9P', update); chkLab('#c9L', update); langHooks.push(update); update();
})();

/* ═════════ ch10: shadows ═════════ */
(function ch10() {
  const cv = $('#c10Cv');
  let R = null, o = null, gap;
  function update() {
    o = { theta: +$('#c10Th').value, res: Math.pow(2, +$('#c10Res').value), bias: +$('#c10B').value, normalBias: +$('#c10NB').value, pcf: $('#c10Pcf').checked, radius: 1 };
    sliderOut('c10Th', t('u.deg', { v: fmt(o.theta * 180 / Math.PI, 0) })); sliderOut('c10Res', String(o.res)); sliderOut('c10B', fmt(o.bias, 3)); sliderOut('c10NB', fmt(o.normalBias, 3));
    R = M.shadowRun(o); gap = M.contactGap(o);
    put('#c10Acne', pct(R.acne, 1)); put('#c10Leak', pct(R.leak, 1)); put('#c10Tex', fmt(R.texel, 3)); put('#c10Gap', isFinite(gap) ? fmt(gap, 3) : '—');
    const acne = R.acne > 0.005 ? t('ch10.say.acne', { a: pct(R.acne, 1) }) : t('ch10.say.noacne');
    const leak = R.leak > 0.02 ? t('ch10.say.leak', { l: pct(R.leak, 1), g: isFinite(gap) ? fmt(gap, 3) : '—' }) : t('ch10.say.noleak');
    putHTML('#c10Say', t('ch10.say', { tx: fmt(R.texel, 3), acne, leak }));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), mapH = 14, top = 8, bot = h - mapH - 30;
    const s = Math.min((w - 20) / 13, (bot - top) / 3.4), ox = w / 2, oy = bot - 0.3 * s;
    const P = (x, y) => [ox + x * s, oy - y * s];
    // light rays
    const L = R.sm.L; c.strokeStyle = 'rgba(233,185,73,.18)'; c.lineWidth = 1; c.setLineDash([3, 5]);
    for (let k = -8; k <= 8; k++) { const o0 = [k * 1.2 * L.right[0] - L.dir[0] * 6, k * 1.2 * L.right[1] - L.dir[1] * 6], o1 = [o0[0] + L.dir[0] * 12, o0[1] + L.dir[1] * 12]; const a = P(o0[0], o0[1]), b = P(o1[0], o1[1]); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }
    c.setLineDash([]);
    // surfaces
    c.strokeStyle = C.mute; c.lineWidth = 1.5;
    for (const sg of M.SHADOW_SCENE.segs) { const a = P(sg[0], sg[1]), b = P(sg[2], sg[3]); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }
    // receiver samples (every other, for speed)
    for (let i = 0; i < R.samples.length; i += 2) {
      const q = R.samples[i], p = P(q.p[0], q.p[1]), lit = q.lit >= 0.5;
      const col = q.truth && !lit ? C.red : !q.truth && lit ? C.cyan : lit ? C.gold : '#4a5163';
      c.fillStyle = col; c.fillRect(p[0] - 1.5, p[1] - 1.5, 3, 3);
    }
    // the shadow map, one cell per texel (grey = stored depth)
    const mw = Math.min(w - 24, 13 * s), mx = (w - mw) / 2, my = h - mapH - 8, res = R.sm.map.length;
    for (let i = 0; i < res; i++) { const v = Math.round(30 + 200 * (1 - R.sm.map[i])); c.fillStyle = `rgb(${v},${v},${Math.min(255, v + 10)})`; c.fillRect(mx + mw * i / res, my, Math.max(1, mw / res - (res <= 64 ? 1 : 0)), mapH); }
    label(c, t('ch10.cv.map'), mx, my - 10, C.mute, 'left', mx, mx + mw);
  } });
  ['#c10Th', '#c10Res', '#c10B', '#c10NB'].forEach(s => rangeLab(s, update)); chkLab('#c10Pcf', update);
  langHooks.push(update); update();
})();

/* ═════════ ch11: draw calls ═════════ */
(function ch11() {
  const cv = $('#c11Cv'), nS = $('#c11N'), uS = $('#c11Us'), mv = $('#c11Mov');
  const STRATS = ['separate', 'merged', 'instanced', 'batched'], COLS = [C.red, C.green, C.gold, C.violet];
  let rows = null, n;
  function update() {
    n = Math.max(1, Math.round(Math.pow(10, +nS.value))); const us = +uS.value, moving = mv.checked;
    sliderOut('c11N', fmt(n, 0)); sliderOut('c11Us', t('u.us', { v: fmt(us, 1) }));
    rows = STRATS.map(s => M.frameCost({ n, strategy: s, moving, params: { usPerCall: us } }));
    const sep = rows[0], ins = rows[2], ms = v => t('u.ms', { v: v < 0.01 ? sig(v, 2) : fmt(v, 2) });
    put('#c11Calls', fmt(sep.calls, 0)); put('#c11Sep', ms(sep.cpuMs)); put('#c11Inst', ms(ins.cpuMs)); put('#c11Up', M.bytesStr(ins.upload));
    const mvs = moving ? t('ch11.mv.moving', { up: M.bytesStr(ins.upload) }) : t('ch11.mv.static');
    putHTML('#c11Say', t(sep.fits ? 'ch11.say.fit' : 'ch11.say.over', { n: fmt(n, 0), ms: ms(sep.cpuMs), share: pct(sep.share, 0), fps: fmt(1000 / sep.cpuMs, 0), mv: mvs }));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), L = Math.min(130, w * 0.36), R = w - (w < 460 ? 48 : 70), T = 12, B = h - 44, rh = (B - T) / 4;
    const x0 = 0.001, x1 = 1000, X = v => L + (R - L) * (Math.log10(Math.max(v, x0)) - Math.log10(x0)) / (Math.log10(x1) - Math.log10(x0));
    const ticks = [[0.001, '0.001'], [0.01, '0.01'], [0.1, '0.1'], [1, '1'], [10, '10'], [100, '100'], [1000, '1000']];
    let lastR = -Infinity;
    for (const [v, s] of ticks) { const px = X(v); c.strokeStyle = C.grid; c.lineWidth = 1; c.beginPath(); c.moveTo(px, T); c.lineTo(px, B); c.stroke(); const tw = c.measureText(s).width, cx = Math.min(Math.max(px, L + tw / 2), R); if (cx - tw / 2 < lastR + 8) continue; c.fillStyle = C.mute; c.textAlign = 'center'; c.fillText(s, cx, B + 12); lastR = cx + tw / 2; }
    label(c, t('ch11.cv.x'), w - 6, B + 30, C.mute, 'right', 4, w - 4);
    const bx = X(1000 / 60); c.strokeStyle = C.red; c.setLineDash([4, 3]); c.lineWidth = 1.5; c.beginPath(); c.moveTo(bx, T); c.lineTo(bx, B); c.stroke(); c.setLineDash([]);
    rows.forEach((r, i) => {
      const y = T + rh * (i + 0.5);
      c.fillStyle = C.ink; c.textAlign = 'right'; fitText(c, t('ch11.s.' + STRATS[i]), L - 12); c.fillText(t('ch11.s.' + STRATS[i]), L - 8, y); c.font = FONT;
      if (r.na) { label(c, t('ch11.cv.na'), L + 6, y, C.mute, 'left', L, w - 4); return; }
      const bw = Math.max(2, X(r.cpuMs) - L); c.fillStyle = COLS[i]; c.fillRect(L, y - Math.min(9, rh * 0.3), bw, Math.min(18, rh * 0.6));
      const s = r.cpuMs < 0.01 ? sig(r.cpuMs, 2) : fmt(r.cpuMs, 2);
      label(c, s, L + bw + 6, y, C.ink, 'left', L, w - 4);
    });
    label(c, t('ch11.cv.budget'), bx + 4, T + 4, C.red, 'left', L, w - 4);
  } });
  rangeLab('#c11N', update); rangeLab('#c11Us', update); chkLab('#c11Mov', update); langHooks.push(update); update();
})();

/* ═════════ ch12: picking ═════════ */
(function ch12() {
  const cv = $('#c12Cv'), xS = $('#c12X'), yS = $('#c12Y');
  const GEO = M.sphereGeometry(1, 16, 12), BS = M.boundingSphere(GEO.position);
  const W = M.m4compose([0, 0, 0], M.qEuler(0, 0.5, 0.25), [1.5, 0.8, 1]);   // TUNED: an ellipsoid, so the bounding sphere is loose
  const camW = M.lookAtWorld([0, 0.6, 4.2], [0, 0, 0]), view = M.m4invert(camW);
  let aspect = 16 / 9, proj = M.cameraProjection({ fov: 50, aspect, near: 0.1, far: 100 }), Rc = null, ray = null;
  function update() {
    const x = +xS.value, y = +yS.value;
    sliderOut('c12X', fmt(x, 2)); sliderOut('c12Y', fmt(y, 2));
    ray = M.rayFromCamera(x, y, camW, proj);
    Rc = M.raycastMesh(GEO, W, ray, BS);
    const hit = Rc.hits[0];
    put('#c12S', t(Rc.sphere ? 'ch12.hit.yes' : 'ch12.hit.no')); put('#c12T', String(Rc.tested));
    put('#c12H', hit ? '#' + hit.face : '—'); put('#c12D', hit ? fmt(hit.distance, 3) : '—');
    putHTML('#c12Say', !Rc.sphere ? t('ch12.say.miss') : hit ? t('ch12.say.hit', { n: Rc.tested, f: hit.face, d: fmt(hit.distance, 3) }) : t('ch12.say.near', { n: Rc.tested }));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv);
    const a = w / h; if (Math.abs(a - aspect) > 1e-3) { aspect = a; proj = M.cameraProjection({ fov: 50, aspect, near: 0.1, far: 100 }); update(); return; }
    const VP = M.m4mul(proj, view), MVP = M.m4mul(VP, W);
    const S = p => { const q = M.m4point(MVP, p); return [(q[0] + 1) / 2 * w, (1 - q[1]) / 2 * h]; };
    const P = GEO.position, I = GEO.index, hit = Rc.hits[0];
    // bounding sphere, projected: centre and a point one radius along the camera's right axis
    const wc = M.m4point(W, BS.c), wr = BS.r * M.maxScaleOnAxis(W), right = [camW[0], camW[1], camW[2]];
    const pc = M.m4point(VP, wc), pe = M.m4point(VP, M.add(wc, M.scale(right, wr)));
    const cx = (pc[0] + 1) / 2 * w, cy = (1 - pc[1]) / 2 * h, rr = Math.abs((pe[0] - pc[0]) / 2 * w);
    c.setLineDash([5, 4]); ring(c, cx, cy, Rc.sphere ? C.cyan : C.mute, rr, 1.2); c.setLineDash([]);
    for (let j = 0; j < I.length; j += 3) {
      const A = S(P.slice(I[j] * 3, I[j] * 3 + 3)), B = S(P.slice(I[j + 1] * 3, I[j + 1] * 3 + 3)), D = S(P.slice(I[j + 2] * 3, I[j + 2] * 3 + 3));
      const front = (B[0] - A[0]) * (D[1] - A[1]) - (B[1] - A[1]) * (D[0] - A[0]) < 0;
      const isHit = hit && hit.face === j / 3;
      c.beginPath(); c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]); c.lineTo(D[0], D[1]); c.closePath();
      if (isHit) { c.fillStyle = 'rgba(233,185,73,.85)'; c.fill(); }
      c.strokeStyle = front ? (Rc.sphere ? 'rgba(99,199,230,.55)' : 'rgba(163,170,184,.4)') : 'rgba(163,170,184,.1)'; c.lineWidth = 1; c.stroke();
    }
    const mx = (+xS.value + 1) / 2 * w, my = (1 - +yS.value) / 2 * h;
    c.strokeStyle = C.red; c.lineWidth = 2; c.beginPath(); c.moveTo(mx - 8, my); c.lineTo(mx + 8, my); c.moveTo(mx, my - 8); c.lineTo(mx, my + 8); c.stroke();
  } });
  cv.addEventListener('pointerdown', e => {
    const r = cv.getBoundingClientRect();
    xS.value = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1)).toFixed(2);
    yS.value = Math.max(-1, Math.min(1, 1 - ((e.clientY - r.top) / r.height) * 2)).toFixed(2);
    update();
  });
  rangeLab('#c12X', update); rangeLab('#c12Y', update); langHooks.push(update); update();
})();

/* ═════════ ch12: slerp against Euler-angle lerp ═════════ */
(function ch12s() {
  const cv = $('#c12sCv'), tS = $('#c12sT');
  const E0 = [0.3, 0.2, 0], E1 = [3.0, 0.4, 3.0], TIP = [0, 0, 1];   // TUNED: two orientations whose Euler path is long
  const q0 = M.qEuler(...E0), q1 = M.qEuler(...E1), RP = M.rotationPaths(E0, E1, 64);
  const tipS = tt => M.qRotate(M.qSlerp(q0, q1, tt), TIP), tipE = tt => M.qRotate(M.qEuler(...E0.map((v, k) => v + (E1[k] - v) * tt)), TIP);
  const deg = r => r * 180 / Math.PI;
  let tt = 0.5;
  function update() {
    tt = +tS.value; sliderOut('c12sT', fmt(tt, 2));
    const s = M.qAngle(q0, M.qSlerp(q0, q1, tt));
    put('#c12sA', t('u.deg', { v: fmt(deg(RP.total), 1) })); put('#c12sS', t('u.deg', { v: fmt(deg(RP.slerpLen), 1) })); put('#c12sE', t('u.deg', { v: fmt(deg(RP.eulerLen), 1) }));
    putHTML('#c12sSay', t('ch12.s.say', { a: t('u.deg', { v: fmt(deg(RP.total), 1) }), t: fmt(tt, 2), s: t('u.deg', { v: fmt(deg(s), 1) }), e: t('u.deg', { v: fmt(deg(RP.eulerLen), 1) }) }));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), narrow = w < 460;
    const Rr = narrow ? Math.min(w * 0.22, h * 0.4) : Math.min(h * 0.4, w * 0.2), cx = (narrow ? 12 : 24) + Rr, cy = h / 2;
    // orthographic view of the unit sphere from a fixed direction (slightly above, turned)
    const ya = 0.5, pa = 0.35, view = v => { const x1 = Math.cos(ya) * v[0] + Math.sin(ya) * v[2], z1 = -Math.sin(ya) * v[0] + Math.cos(ya) * v[2], y2 = Math.cos(pa) * v[1] - Math.sin(pa) * z1, z2 = Math.sin(pa) * v[1] + Math.cos(pa) * z1; return [cx + x1 * Rr, cy - y2 * Rr, z2]; };
    ring(c, cx, cy, C.line, Rr, 1.2);
    const path = fn => { const out = []; for (let i = 0; i <= 96; i++) out.push(view(fn(i / 96))); return out; };
    const draw = (pts, col) => { for (let i = 1; i < pts.length; i++) { c.strokeStyle = col; c.globalAlpha = pts[i][2] >= 0 ? 1 : 0.35; c.lineWidth = 2; c.beginPath(); c.moveTo(pts[i - 1][0], pts[i - 1][1]); c.lineTo(pts[i][0], pts[i][1]); c.stroke(); } c.globalAlpha = 1; };
    draw(path(tipE), C.cyan); draw(path(tipS), C.gold);
    const a = view(tipS(0)), b = view(tipS(1)); dot(c, a[0], a[1], C.ink, 4); ring(c, b[0], b[1], C.ink, 5, 1.5);
    const ps = view(tipS(tt)), pe = view(tipE(tt)); dot(c, ps[0], ps[1], C.gold, 5); dot(c, pe[0], pe[1], C.cyan, 5);
    // right: angle from the start against t
    const x0 = cx + Rr + (narrow ? 34 : 54), G = { L: x0, R: w - 12, T: 28, B: h - 40 };
    const ymax = 180; G.X = v => G.L + (G.R - G.L) * v; G.Y = v => G.B - (G.B - G.T) * v / ymax;
    yTicks(c, G, [[0, '0'], [90, '90°'], [180, '180°']]);
    xTicks(c, G, [[0, '0'], [0.5, '0.5'], [1, '1']]);
    axes(c, G, t('ch12.s.cv.x'), t('ch12.s.cv.y'));
    poly(c, RP.pts.map(p => [G.X(p.t), G.Y(deg(p.euler))]), C.cyan, 2);
    poly(c, RP.pts.map(p => [G.X(p.t), G.Y(deg(p.slerp))]), C.gold, 2);
    c.strokeStyle = C.mute; c.setLineDash([3, 3]); c.lineWidth = 1; c.beginPath(); c.moveTo(G.X(tt), G.T); c.lineTo(G.X(tt), G.B); c.stroke(); c.setLineDash([]);
  } });
  rangeLab('#c12sT', update); langHooks.push(update); update();
})();

applyLang();
requestAnimationFrame(loop);
window.__essayReady = true;
})();
