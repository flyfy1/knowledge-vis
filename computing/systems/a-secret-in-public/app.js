/* A secret in public: wiring, drawing, i18n and on-screen gating. All visible text comes from copy.*.js. */
(() => {
'use strict';
const M = window.SecretModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const C = { bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8', dot: '#5d6577', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb' };
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ───────── language ───────── */
const LS = 'knowledge-lang';
let memLang = null;
function readLang() { try { return localStorage.getItem(LS); } catch (e) { return memLang; } }
function writeLang(v) { memLang = v; try { localStorage.setItem(LS, v); } catch (e) { /* in-memory fallback */ } }
let lang = readLang();
if (lang !== 'zh' && lang !== 'en') lang = /^zh/i.test(navigator.language || '') ? 'zh' : 'en';
const effLang = () => (COPY[lang] ? lang : 'zh');
function t(key, vars) {
  let s = (COPY[lang] && COPY[lang][key] != null) ? COPY[lang][key] : (COPY.zh && COPY.zh[key] != null ? COPY.zh[key] : key);
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => vars[k] != null ? vars[k] : m);
  return s;
}
function fmt(x, d = 0) {
  if (typeof x === 'bigint') return x.toLocaleString('en-US');
  if (!isFinite(x)) return '—';
  const v = Math.abs(x) < 0.5 * Math.pow(10, -d) ? 0 : x;
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}
const pow2 = (e, d = 0) => '2<sup>' + fmt(e, d) + '</sup>';
const pow10 = (e, d = 0) => '10<sup>' + fmt(e, d) + '</sup>';
// a long integer shown as its first digits and its length
function longInt(x, keep = 12) { const s = x.toString(); return s.length <= keep + 2 ? s : t('u.long', { head: s.slice(0, keep), n: fmt(s.length) }); }
function ym(date) { const [y, m] = date.split('-').map(Number); const mon = new Date(Date.UTC(y, m - 1, 15)).toLocaleString(effLang() === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', timeZone: 'UTC' }); return t('u.ym', { y, m, mon }); }
function applyLang() {
  document.documentElement.lang = effLang() === 'zh' ? 'zh-CN' : 'en';
  document.title = t('doc.title');
  const md = document.querySelector('meta[name=description]'); if (md) md.content = t('doc.desc');
  document.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(e => { e.innerHTML = t(e.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-aria]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.i18nAria)); });
  document.querySelectorAll('#langToggle button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  statics.forEach(f => f());
  sims.forEach(s => { s.dirty = true; if (s.text) s.text(); });
}
document.querySelectorAll('#langToggle button').forEach(b => b.addEventListener('click', () => { lang = b.dataset.lang; writeLang(lang); applyLang(); }));

/* ───────── canvas + sim registry ───────── */
function fit(cv) {
  const r = cv.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
  const W = Math.max(1, Math.round(r.width * d)), H = Math.max(1, Math.round(r.height * d));
  if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
  const c = cv.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0); c.font = FONT; c.textBaseline = 'middle';
  c.clearRect(0, 0, r.width, r.height);
  return { c, w: r.width, h: r.height };
}
const sims = [], statics = [];
const io = new IntersectionObserver(es => es.forEach(e => { for (const s of sims) if (s.cvs.includes(e.target)) { s.vis = s.cvs.some(cv => cv.__vis = (cv === e.target ? e.isIntersecting : cv.__vis)); s.dirty = true; } }), { rootMargin: '60px' });
function reg(cvs, o) { o.cvs = [].concat(cvs); o.vis = false; o.dirty = true; sims.push(o); o.cvs.forEach(cv => io.observe(cv)); return o; }
window.addEventListener('resize', () => sims.forEach(s => { s.dirty = true; }));
const on = (sel, ev, fn) => { const el = $(sel); el.addEventListener(ev, fn); return el; };
const radios = name => [...document.querySelectorAll(`input[name=${name}]`)];
const radioVal = name => radios(name).find(r => r.checked).value;
const put = (sel, s) => { const e = $(sel); if (e.textContent !== s) e.textContent = s; };
const putHTML = (sel, s) => { const e = $(sel); if (e.__h !== s) { e.innerHTML = s; e.__h = s; } };
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

function frame(w, h, m, x0, x1, y0, y1) {
  const L = m[3], R = w - m[1], T = m[0], B = h - m[2];
  return { L, R, T, B, X: x => L + (R - L) * (x - x0) / (x1 - x0), Y: y => B - (B - T) * (y - y0) / (y1 - y0) };
}
function axes(c, f, xLab, yLab) {
  c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.T); c.lineTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
  c.fillStyle = C.mute; c.font = FONT;
  if (yLab) { c.textAlign = 'left'; c.fillText(yLab, f.L + 6, f.T - 12); }
  if (xLab) { c.textAlign = 'right'; c.fillText(xLab, f.R, f.B + 26); }
}
function xTicks(c, f, vals, fmtv, skipLast) {
  c.fillStyle = C.mute; c.textAlign = 'center';
  vals.forEach((v, i) => { if (skipLast && i === vals.length - 1) return; const x = f.X(v); c.fillText(fmtv(v), x, f.B + 11); c.strokeStyle = C.line; c.beginPath(); c.moveTo(x, f.B); c.lineTo(x, f.B + 3); c.stroke(); });
}
function yTicks(c, f, vals, fmtv) {
  c.fillStyle = C.mute; c.textAlign = 'right';
  vals.forEach(v => { const y = f.Y(v); c.fillText(fmtv(v), f.L - 6, y); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, y); c.lineTo(f.R, y); c.stroke(); });
}
function path(c, pts, X, Y, col, lw = 2.2, dash) { c.strokeStyle = col; c.lineWidth = lw; c.lineJoin = 'round'; if (dash) c.setLineDash(dash); c.beginPath(); pts.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](X(p[0]), Y(p[1]))); c.stroke(); c.setLineDash([]); }
function dot(c, x, y, col, r = 4.5, ring) { c.beginPath(); c.arc(x, y, r, 0, 6.283); if (ring) { c.strokeStyle = col; c.lineWidth = 2; c.stroke(); } else { c.fillStyle = col; c.fill(); } }

/* ───────── 01 the key problem ───────── */
(() => {
  const cv = $('#knCv'), sN = $('#knN');
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), n = +sN.value, mode = radioVal('knMode');
      const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.4;
      const pts = Array.from({ length: n }, (_, i) => [cx + R * Math.cos(-Math.PI / 2 + 2 * Math.PI * i / n), cy + R * Math.sin(-Math.PI / 2 + 2 * Math.PI * i / n)]);
      if (mode === 'sym') {
        c.strokeStyle = n > 20 ? 'rgba(233,185,73,.28)' : 'rgba(233,185,73,.6)'; c.lineWidth = 1;
        c.beginPath(); for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { c.moveTo(...pts[i]); c.lineTo(...pts[j]); } c.stroke();
      } else {
        c.strokeStyle = 'rgba(99,199,230,.45)'; c.lineWidth = 1;
        c.beginPath(); for (const p of pts) { c.moveTo(...p); c.lineTo(cx, cy); } c.stroke();
        c.fillStyle = C.card2 || '#1a1f2b'; c.strokeStyle = C.cyan; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, 14, 0, 6.283); c.fill(); c.stroke();
      }
      for (const p of pts) dot(c, p[0], p[1], C.cyan, n > 25 ? 4 : 6);
    }
  });
  function text() {
    const n = +sN.value, K = M.keys, mode = radioVal('knMode');
    put('#knNo', t('ch1.unit.people', { v: fmt(n) }));
    put('#knPairs', fmt(K.pairs(n))); put('#knPub', fmt(K.publicPairs(n))); put('#knJoin', fmt(K.joinCost(n))); put('#knBig', fmt(K.pairs(100000)));
    putHTML('#knSay', t(mode === 'sym' ? 'ch1.say.sym' : 'ch1.say.pub', { n: fmt(n), pairs: fmt(K.pairs(n)), join: fmt(K.joinCost(n)) }));
  }
  sim.text = text;
  const redo = () => { sim.dirty = true; text(); };
  sN.addEventListener('input', redo); radios('knMode').forEach(r => r.addEventListener('change', redo));
  text();
})();

/* ───────── 02a square-and-multiply ───────── */
(() => {
  const sX = $('#smX'), G = M.safePrimeBelow(M.DH_BITS);
  function text() {
    const x = +sX.value, tr = M.powTrace(G.g, x, G.p);
    put('#smXo', fmt(x));
    putHTML('#smBits', t('ch2.bits', { x: fmt(x), b: x.toString(2) }));
    putHTML('#smTrace', tr.rows.map(r => `<div class="${r.op === 'mul' ? 'mul' : ''}">${esc(t('ch2.op.' + r.op, { bit: r.bit }))} → <b>${fmt(r.v)}</b></div>`).join(''));
    put('#smSq', fmt(tr.squarings)); put('#smMul', fmt(tr.mults)); put('#smVal', fmt(tr.value)); put('#smNaive', fmt(x - 1));
    putHTML('#smSay', t(x === 1 ? 'ch2.say.one' : 'ch2.say.trace', { x: fmt(x), L: fmt(x.toString(2).length), sq: fmt(tr.squarings), mul: fmt(tr.mults), tot: fmt(tr.total), naive: fmt(x - 1), v: fmt(tr.value), p: fmt(G.p) }));
  }
  statics.push(text);
  sX.addEventListener('input', text);
})();

/* ───────── 02b the race: forward vs brute force vs baby-step giant-step ───────── */
(() => {
  const cv = $('#rcCv'), sB = $('#rcBits'), XMAX = 40, BRUTE_MS = 8;
  let seed = 1, cur = null;
  const history = new Map(); // bits → { fwd, bsgs, brute(done count) } for dots that stay on the chart
  function setup() {
    const bits = +sB.value, I = M.dlogInstance(bits, seed);
    const fw = M.powTrace(I.g, I.x, I.p);
    const t0 = performance.now(), bg = M.bsgs(I), ms = performance.now() - t0;
    cur = { bits, I, fwd: fw.total, bsgs: bg.steps, bsgsOk: bg.x === I.x, bsgsMs: ms, brute: M.bruteStart(I), rate: 0, spent: 0 };
    const hrec = history.get(bits + ':' + seed) || {};
    history.set(bits + ':' + seed, Object.assign(hrec, { bits, fwd: cur.fwd, bsgs: cur.bsgs }));
    if (reduce) runBrute(400); // under reduced motion: one block of work, then a measured estimate
  }
  function runBrute(msBudget) {
    const s = cur.brute; if (s.done) return;
    const t0 = performance.now(); let n = 0;
    while (!s.done && performance.now() - t0 < msBudget) { M.bruteRun(s, 20000); n++; }
    const dt = performance.now() - t0; cur.spent += dt;
    cur.rate = s.steps / Math.max(1, cur.spent) * 1000;
    if (s.done) history.get(cur.bits + ':' + seed).brute = s.steps;
  }
  const sim = reg(cv, {
    step(dt) { if (!cur.brute.done && !reduce) { runBrute(BRUTE_MS); this.dirty = true; text(); } if (this.dirty) { this.draw(); this.dirty = false; } },
    draw() {
      const { c, w, h } = fit(cv), f = frame(w, h, [30, 14, 40, 44], 8, XMAX, 0, 40);
      yTicks(c, f, [0, 10, 20, 30, 40], v => fmt(v));
      axes(c, f, t('ch2.cv.x'), t('ch2.cv.y'));
      xTicks(c, f, [8, 12, 16, 20, 24, 28, 32, 36, 40], v => fmt(v));
      const xs = []; for (let b = 8; b <= XMAX; b += 0.5) xs.push(b);
      path(c, xs.map(b => [b, Math.log2(M.race.forwardMax(b))]), f.X, f.Y, C.cyan, 2);
      path(c, xs.map(b => [b, M.race.bsgsLog2(b)]), f.X, f.Y, C.gold, 2);
      path(c, xs.map(b => [b, Math.min(40, M.race.bruteExpectedLog2(b))]), f.X, f.Y, C.red, 2);
      // measured points for every size tried with the current secret seed
      for (const r of history.values()) {
        dot(c, f.X(r.bits), f.Y(Math.log2(r.fwd)), C.ink, 4);
        dot(c, f.X(r.bits), f.Y(Math.log2(r.bsgs)), C.ink, 4);
        if (r.brute) dot(c, f.X(r.bits), f.Y(Math.log2(r.brute)), C.ink, 4);
      }
      // live brute-force progress: a red bar climbing at the current size
      const s = cur.brute, x = f.X(cur.bits);
      c.strokeStyle = C.red; c.lineWidth = 4; c.beginPath(); c.moveTo(x, f.B); c.lineTo(x, f.Y(Math.min(40, Math.log2(Math.max(1, s.steps))))); c.stroke();
      dot(c, x, f.Y(Math.min(40, Math.log2(Math.max(1, s.steps)))), C.red, 5, !s.done);
    }
  });
  function text() {
    const s = cur.brute, worst = Number(cur.I.q - 1n);
    put('#rcBitso', t('ch2.unit.bits', { v: fmt(cur.bits) }));
    put('#rcFwd', fmt(cur.fwd)); put('#rcBsgs', fmt(cur.bsgs));
    put('#rcBrute', s.done ? fmt(s.steps) : t('ch2.unit.sofar', { v: fmt(s.steps) }));
    const etaS = cur.rate > 0 ? (worst - s.steps) / cur.rate : NaN;
    put('#rcEta', s.done ? t('ch2.unit.found') : !isFinite(etaS) ? '…' : etaS < 120 ? t('ch2.unit.sec', { v: fmt(etaS) }) : etaS < 7200 ? t('ch2.unit.min', { v: fmt(etaS / 60) }) : etaS < 3 * 86400 ? t('ch2.unit.hr', { v: fmt(etaS / 3600, 1) }) : t('ch2.unit.day', { v: fmt(etaS / 86400) }));
    const v = { bits: fmt(cur.bits), p: fmt(cur.I.p), q: fmt(cur.I.q), fwd: fmt(cur.fwd), bsgs: fmt(cur.bsgs), ms: fmt(cur.bsgsMs, cur.bsgsMs < 10 ? 1 : 0), brute: fmt(s.steps), ratio: fmt(s.steps / cur.fwd), ratioB: fmt(cur.bsgs / cur.fwd), rate: fmt(cur.rate / 1e6, 1) };
    putHTML('#rcSay', t(s.done ? 'ch2.say.done' : reduce ? 'ch2.say.reduce' : 'ch2.say.running', v));
  }
  sim.text = text;
  setup();
  const redo = () => { setup(); sim.dirty = true; text(); };
  sB.addEventListener('input', redo);
  on('#rcNew', 'click', () => { seed++; history.clear(); redo(); });
  text();
})();

/* ───────── 03 Diffie–Hellman, Eve and Mallory ───────── */
(() => {
  const sA = $('#dhA'), sB = $('#dhB'), cM = $('#dhMal');
  let eveRes = null;
  const MAL = [101, 202]; // Mallory's own two secrets
  function text() {
    const x = M.dh(+sA.value, +sB.value), mal = cM.checked, mm = M.mitm(x, MAL[0], MAL[1]);
    put('#dhAo', fmt(+sA.value)); put('#dhBo', fmt(+sB.value));
    const dl = (rows) => '<dl>' + rows.map(([k, v, cls]) => `<dt>${k}</dt><dd class="${cls || ''}">${v}</dd>`).join('') + '</dl>';
    const kA = mal ? mm.kAlice : x.sA, kB = mal ? mm.kBob : x.sB;
    let html = `<div class="col alice"><h4>${t('ch3.who.alice')}</h4>${dl([[t('ch3.row.secret'), 'a = ' + fmt(x.a)], [t('ch3.row.sends'), 'A = ' + fmt(x.A)], [t('ch3.row.gets'), fmt(mal ? mm.M2 : x.B)], [t('ch3.row.key'), fmt(kA), 'key']])}</div>`;
    html += `<div class="col wire"><h4>${t('ch3.who.wire')}</h4>${dl([['p', fmt(x.p)], ['g', fmt(x.g)], [t('ch3.row.fromA'), fmt(x.A) + (mal ? ' → ' + fmt(mm.M1) : ''), mal ? 'bad' : ''], [t('ch3.row.fromB'), fmt(x.B) + (mal ? ' → ' + fmt(mm.M2) : ''), mal ? 'bad' : '']])}</div>`;
    html += `<div class="col bob"><h4>${t('ch3.who.bob')}</h4>${dl([[t('ch3.row.secret'), 'b = ' + fmt(x.b)], [t('ch3.row.sends'), 'B = ' + fmt(x.B)], [t('ch3.row.gets'), fmt(mal ? mm.M1 : x.A)], [t('ch3.row.key'), fmt(kB), 'key']])}</div>`;
    if (mal) html += `<div class="col mallory"><h4>${t('ch3.who.mal')}</h4>${dl([[t('ch3.row.malsecrets'), fmt(MAL[0]) + ', ' + fmt(MAL[1])], [t('ch3.row.malA'), fmt(mm.kMalA), 'bad'], [t('ch3.row.malB'), fmt(mm.kMalB), 'bad']])}</div>`;
    const board = $('#dhBoard'); board.classList.toggle('mal', mal); putHTML('#dhBoard', html);
    put('#dhKA', fmt(kA)); put('#dhKB', fmt(kB));
    put('#dhEveK', eveRes ? fmt(eveRes.s) : '—'); put('#dhEveSteps', eveRes ? fmt(eveRes.steps) : '—');
    const v = { s: fmt(x.sA), A: fmt(x.A), B: fmt(x.B), a: fmt(x.a), ka: fmt(kA), kb: fmt(kB), q: fmt(x.q), p: fmt(x.p), steps: eveRes ? fmt(eveRes.steps) : '', ea: eveRes ? fmt(eveRes.a) : '' };
    const key = mal ? (eveRes ? 'ch3.say.maleve' : 'ch3.say.mal') : eveRes ? 'ch3.say.eve' : 'ch3.say.ok';
    putHTML('#dhSay', t(key, v));
  }
  statics.push(text);
  [sA, sB].forEach(e => e.addEventListener('input', () => { eveRes = null; text(); }));
  cM.addEventListener('change', text);
  on('#dhEve', 'click', () => { eveRes = M.eve(M.dh(+sA.value, +sB.value)); text(); });
})();

/* ───────── 04a textbook RSA ───────── */
(() => {
  const sP = $('#rsP'), sQ = $('#rsQ'), sM = $('#rsM'), bT = $('#rsTamper'), bF = $('#rsFactor');
  const P = M.RSA_PRIMES; let tamper = false, factor = false;
  function key() { let ip = +sP.value, iq = +sQ.value; const same = ip === iq; if (same) iq = iq === P.length - 1 ? iq - 1 : iq + 1; return { k: M.rsaKey(P[ip], P[iq]), same }; }
  function text() {
    const { k, same } = key(), n = Number(k.n);
    if (+sM.max !== n - 1) { sM.max = String(n - 1); if (+sM.value > n - 1) sM.value = String(n - 1); }
    const m = BigInt(sM.value), c = M.rsaEnc(k, m), cT = M.rsaScale(k, c, 2), cc = tamper ? cT : c, dec = M.rsaDec(k, cc);
    const sig = M.rsaSign(k, m), sigOk = M.rsaVerify(k, m, sig), td = M.trialDivide(k.n);
    put('#rsPo', fmt(P[+sP.value])); put('#rsQo', fmt(Number(k.q))); put('#rsMo', fmt(m));
    bT.setAttribute('aria-pressed', String(tamper)); bF.setAttribute('aria-pressed', String(factor));
    put('#rsPub', t('ch4.unit.pub', { n: fmt(k.n), e: fmt(k.e) })); put('#rsPriv', 'd = ' + fmt(k.d));
    put('#rsC', fmt(cc)); put('#rsDec', fmt(dec)); put('#rsSig', t(sigOk ? 'ch4.unit.sigok' : 'ch4.unit.sigbad', { s: fmt(sig) }));
    put('#rsAtk', factor ? t('ch4.unit.factored', { p: fmt(td.f), q: fmt(k.n / td.f), tries: fmt(td.tries) }) : '—');
    const v = { p: fmt(k.p), q: fmt(k.q), n: fmt(k.n), phi: fmt(k.phi), e: fmt(k.e), d: fmt(k.d), m: fmt(m), c: fmt(c), ct: fmt(cT), dec: fmt(dec), m2: fmt(2n * m % k.n), tries: fmt(td.tries), digits: fmt(k.n.toString().length) };
    let keyName = tamper ? (2n * m < k.n ? 'ch4.say.tamper' : 'ch4.say.tamperwrap') : 'ch4.say.ok';
    if (factor) keyName = tamper ? 'ch4.say.both' : 'ch4.say.factor';
    putHTML('#rsSay', (same ? t('ch4.say.same') + ' ' : '') + t(keyName, v));
  }
  statics.push(text);
  [sP, sQ, sM].forEach(e => e.addEventListener('input', text));
  bT.addEventListener('click', () => { tamper = !tamper; text(); });
  bF.addEventListener('click', () => { factor = !factor; text(); });
})();

/* ───────── 04b the cube-root attack on e = 3 ───────── */
(() => {
  const MSGS = ['MEET AT NOON', 'PIN 4096', 'YES'], cPad = $('#cbPad');
  function text() {
    const k = M.rsaBig3(), msg = MSGS[+radioVal('cbMsg')], m = M.textToInt(msg), pad = cPad.checked;
    const mm = pad ? M.padRandom(m, k, 7) : m, c = M.modPow(mm, 3n, k.n), atk = M.cubeRootAttack(k, c);
    const got = atk.exact ? M.intToText(atk.m) : null;
    put('#cbN', longInt(k.n)); put('#cbM', longInt(mm)); put('#cbC', longInt(c));
    put('#cbOut', got != null ? '“' + got + '”' : t('ch4.unit.noroot'));
    const v = { bits: fmt(M.bitLength(k.n)), digits: fmt(k.n.toString().length), mbits: fmt(M.bitLength(m)), msg: esc(msg), cubebits: fmt(M.bitLength(m ** 3n)), pbits: fmt(M.bitLength(mm)) };
    putHTML('#cbSay', t(pad ? 'ch4.say.pad' : 'ch4.say.cube', v));
  }
  statics.push(text);
  radios('cbMsg').forEach(r => r.addEventListener('change', text)); cPad.addEventListener('change', text);
})();

/* ───────── 05a the group law over the real numbers ───────── */
(() => {
  const cv = $('#erCv'), sP = $('#erP'), sQ = $('#erQ'), cN = $('#erQneg'), A = -2, Bc = 2, X0 = -2.6, X1 = 3.4;
  const root = M.ecR.root(A, Bc);
  const pt = (x, neg) => { const xx = Math.max(root, x); const y = Math.sqrt(Math.max(0, M.ecR.rhs(xx, A, Bc))); return { x: xx, y: neg ? -y : y }; };
  const state = () => { const P = pt(+sP.value, false), Q = pt(+sQ.value, cN.checked); return { P, Q, R: M.ecR.add(P, Q, A) }; };
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), Y1 = Math.max(4, (X1 - X0) * (h - 40) / (w - 40) / 2);
      const f = frame(w, h, [20, 20, 20, 20], X0, X1, -Y1, Y1);
      c.strokeStyle = C.grid; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.Y(0)); c.lineTo(f.R, f.Y(0)); c.moveTo(f.X(0), f.T); c.lineTo(f.X(0), f.B); c.stroke();
      const up = [], dn = []; for (let x = root; x <= X1; x += 0.005) { const y = Math.sqrt(Math.max(0, M.ecR.rhs(x, A, Bc))); up.push([x, y]); dn.push([x, -y]); }
      const curve = [...dn.reverse(), ...up];
      c.save(); c.beginPath(); c.rect(f.L, f.T, f.R - f.L, f.B - f.T); c.clip();
      path(c, curve, f.X, f.Y, C.violet, 2);
      const { P, Q, R } = state();
      if (R) {
        // the line through P and Q (or the tangent), extended across the chart; the third point; its reflection
        const s = R.s, ln = x => P.y + s * (x - P.x);
        path(c, [[X0, ln(X0)], [X1, ln(X1)]], f.X, f.Y, 'rgba(235,232,224,.55)', 1.4);
        c.setLineDash([4, 4]); c.strokeStyle = C.gold; c.lineWidth = 1.4; c.beginPath(); c.moveTo(f.X(R.x), f.Y(-R.y)); c.lineTo(f.X(R.x), f.Y(R.y)); c.stroke(); c.setLineDash([]);
        dot(c, f.X(R.x), f.Y(-R.y), C.mute, 5);
        dot(c, f.X(R.x), f.Y(R.y), C.gold, 6);
      } else {
        c.setLineDash([4, 4]); c.strokeStyle = 'rgba(235,232,224,.55)'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(f.X(P.x), f.T); c.lineTo(f.X(P.x), f.B); c.stroke(); c.setLineDash([]);
      }
      dot(c, f.X(P.x), f.Y(P.y), C.cyan, 6); dot(c, f.X(Q.x), f.Y(Q.y), C.green, 6);
      c.restore();
    }
  });
  function text() {
    const { P, Q, R } = state(), p2 = v => '(' + fmt(v.x, 2) + ', ' + fmt(v.y, 2) + ')';
    put('#erPo', fmt(P.x, 2)); put('#erQo', fmt(Q.x, 2));
    put('#erPv', p2(P)); put('#erQv', p2(Q)); put('#erRv', R ? p2(R) : t('ch5.unit.inf')); put('#erSv', R ? fmt(R.s, 2) : '∞');
    const same = Math.abs(P.x - Q.x) < 1e-9 && Math.abs(P.y - Q.y) < 1e-9;
    const key = !R ? 'ch5.say.inf' : same ? 'ch5.say.double' : 'ch5.say.add';
    const off = R && (Math.abs(R.y) > 6 || R.x > X1) ? t('ch5.say.off') : '';
    putHTML('#erSay', t(key, { R: R ? p2(R) : '', s: R ? fmt(R.s, 2) : '' }) + (off ? ' ' + off : ''));
  }
  sim.text = text;
  const redo = () => { sim.dirty = true; text(); };
  [sP, sQ].forEach(e => e.addEventListener('input', redo)); cN.addEventListener('change', redo);
  text();
})();

/* ───────── 05b the same rule over F_p ───────── */
(() => {
  const cv = $('#efCv'), sP = $('#efP'), sK = $('#efK');
  let grp = null;
  const pp = () => M.EC_PRIMES[+sP.value];
  function model() { grp = M.ecGroup(pp()); if (+sK.max !== grp.order) { sK.max = String(grp.order); if (+sK.value > grp.order) sK.value = String(Math.max(1, Math.floor(grp.order / 2))); } }
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), p = grp.p, side = Math.min(w, h) - 24, ox = (w - side) / 2, oy = (h - side) / 2;
      const X = x => ox + side * (x + 0.5) / p, Y = y => oy + side - side * (y + 0.5) / p;
      c.strokeStyle = C.grid; c.lineWidth = 1; c.strokeRect(ox, oy, side, side);
      const r = Math.max(1.6, Math.min(4, side / p * 0.35));
      for (const q of grp.pts) dot(c, X(q.x), Y(q.y), C.dot, r);
      const k = +sK.value, mult = M.ecMultiples(grp.G, k, p);
      c.strokeStyle = 'rgba(233,185,73,.45)'; c.lineWidth = 1.2; c.beginPath();
      let prev = null; for (const q of mult) { if (q && prev) { c.moveTo(X(prev.x), Y(prev.y)); c.lineTo(X(q.x), Y(q.y)); } prev = q; } c.stroke();
      dot(c, X(grp.G.x), Y(grp.G.y), C.cyan, r + 2.5);
      const kG = mult[mult.length - 1]; if (kG) dot(c, X(kG.x), Y(kG.y), C.gold, r + 3);
    }
  });
  function text() {
    const k = +sK.value, mul = M.ecMul(k, grp.G, grp.p), kG = mul.R;
    put('#efPo', 'p = ' + fmt(grp.p)); put('#efKo', fmt(k));
    put('#efN', fmt(grp.N)); put('#efHasse', fmt(Math.ceil(grp.p + 1 - grp.hasse)) + '–' + fmt(Math.floor(grp.p + 1 + grp.hasse)));
    put('#efKG', kG ? '(' + kG.x + ', ' + kG.y + ')' : t('ch5.unit.inf'));
    put('#efOps', t('ch5.unit.ops', { a: fmt(mul.ops), b: fmt(k) }));
    const v = { p: fmt(grp.p), N: fmt(grp.N), ord: fmt(grp.order), Gx: grp.G.x, Gy: grp.G.y, k: fmt(k), ops: fmt(mul.ops), lo: fmt(Math.ceil(grp.p + 1 - grp.hasse)), hi: fmt(Math.floor(grp.p + 1 + grp.hasse)), x: kG ? kG.x : '', y: kG ? kG.y : '' };
    putHTML('#efSay', t(!kG ? 'ch5.say.ord' : grp.order === grp.N ? 'ch5.say.cyclic' : 'ch5.say.sub', v));
  }
  sim.text = text;
  model();
  sP.addEventListener('input', () => { model(); sim.dirty = true; text(); });
  sK.addEventListener('input', () => { sim.dirty = true; text(); });
  text();
})();

/* NIST table (static, rebuilt on language change) */
statics.push(() => {
  const rows = M.NIST_TABLE.map(r => `<tr><td class="num">${fmt(r.s)}</td><td class="num">${fmt(r.rsa)}</td><td class="num">${fmt(r.ecc)}</td></tr>`).join('');
  $('#nistTable').innerHTML = `<thead><tr><th class="num">${t('ch5.th.s')}</th><th class="num">${t('ch5.th.rsa')}</th><th class="num">${t('ch5.th.ecc')}</th></tr></thead><tbody>${rows}</tbody>`;
});

/* ───────── 06 certificate chain ───────── */
(() => {
  const cache = {};
  function text() {
    const tp = radioVal('ctT'), ch = cache[tp] || (cache[tp] = M.chain(tp));
    const html = ch.certs.map((c, i) => {
      const l = ch.links[i], rootRow = i === 0 ? `<div class="st ${ch.rootTrusted ? 'n' : 'r'}">${t(ch.rootTrusted ? 'ch6.c.trusted' : 'ch6.c.untrusted')}</div>` : '';
      const ok = l.sigOk && (i > 0 || ch.rootTrusted);
      return `<div class="cert ${ok ? 'ok' : 'bad'}"><h4>${t('ch6.c.' + c.id)}</h4>` +
        `<div>${t('ch6.c.subject')} <span class="v">${esc(c.subject)}</span></div>` +
        `<div>${t('ch6.c.issuer')} <span class="v">${esc(c.issuer)}</span></div>` +
        `<div>${t('ch6.c.key')} <span class="v">${c.n.toString(16).slice(0, 12)}…</span></div>` +
        `<div>${t('ch6.c.hash')} <span class="v">${l.hash.slice(0, 16)}…</span></div>` +
        `<div class="st ${l.sigOk ? 'n' : 'r'}">${t(l.sigOk ? 'ch6.c.sigok' : 'ch6.c.sigbad', { by: esc(i === 0 ? c.subject : ch.certs[i - 1].subject) })}</div>${rootRow}</div>`;
    }).join('');
    putHTML('#ctCerts', html);
    putHTML('#ctVerdict', `<span class="${ch.ok ? 'n' : 'r'}">${t(ch.ok ? 'ch6.verdict.ok' : 'ch6.verdict.bad')}</span>`);
    putHTML('#ctSay', t('ch6.say.' + tp));
  }
  statics.push(text);
  radios('ctT').forEach(r => r.addEventListener('change', text));
})();

/* ───────── 07 attack cost against key size ───────── */
(() => {
  const cv = $('#scCv'), sB = $('#scB'), cQ = $('#scQ');
  const SIZES = [64, 80, 96, 112, 128, 160, 192, 224, 256, 384, 512, 1024, 2048, 3072, 4096, 7680, 15360];
  const RATE = 1e18;
  const lx = Math.log2;
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), f = frame(w, h, [30, 24, 40, 44], lx(64), lx(16384), 0, 300);
      yTicks(c, f, [0, 64, 128, 192, 256], v => fmt(v));
      axes(c, f, t('ch7.cv.x'), t('ch7.cv.y'));
      const narrow = w < 520, ticks = narrow ? [64, 256, 1024, 4096, 16384] : [64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384];
      xTicks(c, f, ticks.map(lx), v => fmt(Math.round(Math.pow(2, v))), narrow); // the last label would run off a phone-width canvas
      c.strokeStyle = 'rgba(233,185,73,.25)'; c.setLineDash([3, 4]); c.beginPath(); c.moveTo(f.L, f.Y(128)); c.lineTo(f.R, f.Y(128)); c.stroke(); c.setLineDash([]);
      const sym = [], ecc = [], rsa = [];
      for (let e = lx(64); e <= lx(16384) + 1e-9; e += 0.02) { const k = Math.pow(2, e); if (k <= 256) sym.push([e, k]); if (k >= 128 && k <= 600) ecc.push([e, M.rhoLog2(k)]); if (k >= 512) rsa.push([e, M.gnfsLog2(k)]); }
      path(c, sym, f.X, f.Y, C.cyan); path(c, ecc, f.X, f.Y, C.green); path(c, rsa, f.X, f.Y, C.gold);
      if (cQ.checked) {
        path(c, sym.map(([e, k]) => [e, M.groverLog2(Math.pow(2, e))]), f.X, f.Y, C.violet, 1.6, [5, 4]);
        // Shor: polynomial; drawn as the shape of schoolbook n³ growth only (constants not modelled)
        path(c, rsa.map(([e]) => [e, 3 * e]), f.X, f.Y, C.violet, 1.6, [5, 4]);
        path(c, ecc.map(([e]) => [e, 3 * e]), f.X, f.Y, C.violet, 1.6, [5, 4]);
      }
      for (const r of M.NIST_TABLE) { dot(c, f.X(lx(r.rsa)), f.Y(r.s), C.ink, 3.5); dot(c, f.X(lx(r.ecc)), f.Y(r.s), C.ink, 3.5); if (r.s >= 128) dot(c, f.X(lx(r.s)), f.Y(r.s), C.ink, 3.5); }
      for (const r of M.RECORDS) dot(c, f.X(lx(r.bits)), f.Y(M.gnfsLog2(r.bits)), C.red, 4);
      const k = SIZES[+sB.value]; c.strokeStyle = 'rgba(235,232,224,.4)'; c.lineWidth = 1; c.beginPath(); c.moveTo(f.X(lx(k)), f.T); c.lineTo(f.X(lx(k)), f.B); c.stroke();
    }
  });
  function text() {
    const k = SIZES[+sB.value], q = cQ.checked;
    put('#scBo', t('ch2.unit.bits', { v: fmt(k) }));
    const symOk = k <= 256, eccOk = k >= 128 && k <= 600, rsaOk = k >= 512;
    putHTML('#scSym', symOk ? pow2(k) : '—'); putHTML('#scEcc', eccOk ? pow2(M.rhoLog2(k), 1) : '—'); putHTML('#scRsa', rsaOk ? pow2(M.gnfsLog2(k), 1) : '—');
    const ly = rsaOk ? M.yearsLog10(M.gnfsLog2(k), RATE) : NaN, secs = Math.pow(10, ly) * 365.25 * 86400;
    // under a year: plain seconds / minutes / hours / days; otherwise a power of ten in years
    putHTML('#scYears', !rsaOk ? '—' : ly >= 0 ? t('ch7.unit.years', { v: pow10(ly, 1) }) : secs < 120 ? t('ch2.unit.sec', { v: fmt(secs) }) : secs < 7200 ? t('ch2.unit.min', { v: fmt(secs / 60) }) : secs < 3 * 86400 ? t('ch2.unit.hr', { v: fmt(secs / 3600, 1) }) : t('ch2.unit.day', { v: fmt(secs / 86400) }));
    const v = { k: fmt(k), sym: fmt(k), ecc: fmt(M.rhoLog2(k), 1), rsa: fmt(M.gnfsLog2(k), 1), gro: fmt(M.groverLog2(k), 1), shor: fmt(3 * lx(k), 0) };
    const key = rsaOk ? (eccOk ? 'ch7.say.both' : 'ch7.say.rsa') : eccOk ? (symOk ? 'ch7.say.symecc' : 'ch7.say.ecc') : 'ch7.say.sym';
    let s = t(key, v);
    if (q) s += ' ' + t(rsaOk || eccOk ? 'ch7.say.qpk' : 'ch7.say.qsym', v);
    putHTML('#scSay', s);
  }
  sim.text = text;
  const redo = () => { sim.dirty = true; text(); };
  sB.addEventListener('input', redo); cQ.addEventListener('change', redo);
  text();
})();

/* records table */
statics.push(() => {
  const rows = M.RECORDS.map(r => `<tr><td>${t('ch7.rec.' + r.id)}</td><td class="num">${fmt(r.bits)}</td><td class="num">${r.year}</td><td class="num">${pow2(M.gnfsLog2(r.bits), 0)}</td></tr>`).join('');
  $('#recTable').innerHTML = `<thead><tr><th>${t('ch7.th.what')}</th><th class="num">${t('ch7.th.bits')}</th><th class="num">${t('ch7.th.year')}</th><th class="num">${t('ch7.th.formula')}</th></tr></thead><tbody>${rows}</tbody>`;
});

/* ───────── 08a Shor's reduction ───────── */
(() => {
  const cv = $('#shCv'), sN = $('#shN'), sA = $('#shA');
  const statsCache = {};
  const N = () => M.SHOR_NS[+sN.value];
  function clampA() { const n = N(); if (+sA.max !== n - 2) { sA.max = String(n - 2); if (+sA.value > n - 2) sA.value = '2'; } }
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), n = N(), a = +sA.value, res = M.shorTry(a, n), r = res.r;
      const X = Math.min(n, r ? Math.min(120, Math.max(3 * r + 1, 24)) : 48);
      const f = frame(w, h, [26, 14, 40, 48], 0, X, 0, n);
      yTicks(c, f, [0, n], v => fmt(v)); axes(c, f, t('ch8.cv.x'), t('ch8.cv.y'));
      const st = X <= 30 ? 5 : X <= 60 ? 10 : 20, ticks = []; for (let x = 0; x <= X; x += st) ticks.push(x);
      xTicks(c, f, ticks, v => fmt(v));
      if (r) { c.strokeStyle = 'rgba(233,185,73,.35)'; c.lineWidth = 1; c.setLineDash([3, 4]); c.beginPath(); for (let x = r; x <= X; x += r) { c.moveTo(f.X(x), f.T); c.lineTo(f.X(x), f.B); } c.stroke(); c.setLineDash([]); }
      let v = 1n; const A = BigInt(a), NN = BigInt(n), rad = X > 60 ? 2.4 : 3.5;
      for (let x = 0; x <= X; x++) { dot(c, f.X(x), f.Y(Number(v)), x % (r || 1e9) === 0 ? C.gold : C.cyan, rad); v = v * A % NN; }
    }
  });
  function text() {
    clampA();
    const n = N(), a = +sA.value, res = M.shorTry(a, n), st = statsCache[n] || (statsCache[n] = M.shorStats(n));
    put('#shNo', fmt(n)); put('#shAo', fmt(a));
    put('#shR', res.r ? fmt(res.r) : '—'); put('#shY', res.y != null ? fmt(res.y) : '—');
    put('#shF', res.kind === 'ok' || res.kind === 'lucky' ? fmt(res.f1) + ' × ' + fmt(res.f2) : '—');
    put('#shShare', fmt(st.share * 100) + '%');
    const v = { a: fmt(a), n: fmt(n), r: res.r ? fmt(res.r) : '', h: res.r ? fmt(res.r / 2) : '', y: res.y != null ? fmt(res.y) : '', f1: res.f1 != null ? fmt(res.f1) : '', f2: res.f2 != null ? fmt(res.f2) : '', share: fmt(st.share * 100), ok: fmt(st.ok), tot: fmt(st.tot) };
    putHTML('#shSay', t('ch8.say.' + res.kind, v));
  }
  sim.text = text;
  const redo = () => { sim.dirty = true; text(); };
  sN.addEventListener('input', () => { clampA(); redo(); }); sA.addEventListener('input', redo);
  clampA(); text();
})();

/* ───────── 08b Mosca's inequality ───────── */
(() => {
  const sX = $('#moX'), sY = $('#moY'), sZ = $('#moZ');
  function text() {
    const x = +sX.value, y = +sY.value, z = +sZ.value, span = Math.max(40, x + y, z) * 1.05, pc = v => (100 * v / span).toFixed(2) + '%';
    put('#moXo', t('ch8.unit.yr', { v: fmt(x) })); put('#moYo', t('ch8.unit.yr', { v: fmt(y) })); put('#moZo', t('ch8.unit.yr', { v: fmt(z) }));
    const bar = (lab, from, to, col) => `<div class="bar"><span>${lab}</span><div class="track"><div class="fill" style="left:${pc(from)};width:${pc(to - from)};background:${col}"></div><div class="tick" style="left:${pc(z)}"></div></div></div>`;
    putHTML('#moBars', bar(t('ch8.bar.mig'), 0, y, 'rgba(99,199,230,.55)') + bar(t('ch8.bar.data'), y, y + x, 'rgba(233,185,73,.55)') + bar(t('ch8.bar.q'), z, z, 'transparent'));
    const ex = M.mosca.exposed(x, y, z), slack = z - x - y;
    put('#moExp', t('ch8.unit.yr', { v: fmt(ex) }));
    put('#moStart', slack >= 0 ? t('ch8.unit.slack', { v: fmt(slack) }) : t('ch8.unit.late', { v: fmt(-slack) }));
    putHTML('#moSay', t(slack > 0 ? 'ch8.say.safe' : slack === 0 ? 'ch8.say.edge' : 'ch8.say.exposed', { x: fmt(x), y: fmt(y), z: fmt(z), ex: fmt(ex), sl: fmt(Math.abs(slack)) }));
  }
  statics.push(text);
  [sX, sY, sZ].forEach(e => e.addEventListener('input', text));
})();

/* ───────── 09a closest vector with a good and a bad basis ───────── */
(() => {
  const cv = $('#ltCv'), sK = $('#ltK'); let seed = 1;
  const rateCache = {};
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), k = +sK.value, bad = M.latBasis(k), T = M.latTarget(seed);
      const span = 26, sc = Math.min(w, h) / (2 * span) * (w > h ? 1 : 1), cx = w / 2, cy = h / 2;
      const X = x => cx + x * sc, Y = y => cy - y * sc, inView = v => Math.abs(v[0]) < (w / 2) / sc + 2 && Math.abs(v[1]) < (h / 2) / sc + 2;
      // the fundamental parallelogram of each basis around the target's rounding
      const para = (basis, col) => { const b = M.babai(basis, T), [b1, b2] = basis; const k1 = Math.floor((T[0] * b2[1] - T[1] * b2[0]) / M.det2(basis)), k2 = Math.floor((b1[0] * T[1] - b1[1] * T[0]) / M.det2(basis)); const o = [k1 * b1[0] + k2 * b2[0], k1 * b1[1] + k2 * b2[1]]; c.fillStyle = col; c.beginPath(); c.moveTo(X(o[0]), Y(o[1])); c.lineTo(X(o[0] + b1[0]), Y(o[1] + b1[1])); c.lineTo(X(o[0] + b1[0] + b2[0]), Y(o[1] + b1[1] + b2[1])); c.lineTo(X(o[0] + b2[0]), Y(o[1] + b2[1])); c.closePath(); c.fill(); return b; };
      c.save(); c.beginPath(); c.rect(0, 0, w, h); c.clip();
      para(bad, 'rgba(240,122,109,.10)'); para(M.LAT_GOOD, 'rgba(122,214,160,.12)');
      const [g1, g2] = M.LAT_GOOD;
      for (let i = -12; i <= 12; i++) for (let j = -12; j <= 12; j++) { const v = [i * g1[0] + j * g2[0], i * g1[1] + j * g2[1]]; if (inView(v)) dot(c, X(v[0]), Y(v[1]), C.dot, 2.6); }
      const arrow = (v, col) => { c.strokeStyle = col; c.lineWidth = 2.2; c.beginPath(); c.moveTo(X(0), Y(0)); c.lineTo(X(v[0]), Y(v[1])); c.stroke(); };
      arrow(bad[0], C.red); arrow(bad[1], C.red); arrow(g1, C.green); arrow(g2, C.green);
      const ex = M.cvpExact(T), gb = M.babai(M.LAT_GOOD, T), bb = M.babai(bad, T);
      c.strokeStyle = 'rgba(179,157,251,.5)'; c.lineWidth = 1; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(X(T[0]), Y(T[1])); c.lineTo(X(bb.v[0]), Y(bb.v[1])); c.stroke(); c.setLineDash([]);
      dot(c, X(ex.v[0]), Y(ex.v[1]), C.ink, 9, true);
      dot(c, X(bb.v[0]), Y(bb.v[1]), C.red, 6); dot(c, X(gb.v[0]), Y(gb.v[1]), C.green, 5);
      dot(c, X(T[0]), Y(T[1]), C.violet, 5);
      c.restore();
    }
  });
  function text() {
    const k = +sK.value, bad = M.latBasis(k), T = M.latTarget(seed), ex = M.cvpExact(T);
    const dg = M.dist(M.babai(M.LAT_GOOD, T).v, T), db = M.dist(M.babai(bad, T).v, T);
    if (rateCache[k] == null) rateCache[k] = M.babaiSuccess(k, 2000, 9);
    if (rateCache.g == null) rateCache.g = M.babaiSuccess(0, 2000, 9);
    put('#ltKo', fmt(k)); put('#ltGood', fmt(dg, 2)); put('#ltBad', fmt(db, 2)); put('#ltHad', fmt(M.hadamard(bad), 2)); put('#ltRate', fmt(rateCache[k] * 100) + '%');
    const v = { dg: fmt(dg, 2), db: fmt(db, 2), d: fmt(ex.d, 2), x: fmt(db / ex.d, 1), rb: fmt(rateCache[k] * 100), rg: fmt(rateCache.g * 100), had: fmt(M.hadamard(bad), 2), hg: fmt(M.hadamard(M.LAT_GOOD), 2) };
    const goodHit = Math.abs(dg - ex.d) < 1e-9, badHit = Math.abs(db - ex.d) < 1e-9;
    putHTML('#ltSay', t(goodHit && !badHit ? 'ch9.say.split' : goodHit && badHit ? 'ch9.say.both' : !goodHit && !badHit ? 'ch9.say.neither' : 'ch9.say.badonly', v));
  }
  sim.text = text;
  const redo = () => { sim.dirty = true; text(); };
  sK.addEventListener('input', redo);
  on('#ltNew', 'click', () => { seed++; redo(); });
  text();
})();

/* ───────── 09b learning with errors (Regev) ───────── */
(() => {
  const cv = $('#lwCv'), sN = $('#lwN'), sE = $('#lwE'), cZ = $('#lwZero'), TRIALS = 2000, SEED = 3;
  let res = null, eveRes = null;
  const params = () => ({ n: +sN.value, m: 4 * +sN.value, q: +radioVal('lwQ'), eta: +sE.value, zero: cZ.checked });
  function model() {
    const P = params();
    res = M.lweTrial(P.n, P.m, P.q, P.zero ? 0 : P.eta, TRIALS, SEED);
    eveRes = null;
  }
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), P = params(), half = P.q / 2;
      const nb = 61, bw = P.q / nb, counts = new Array(nb).fill(0);
      for (const e of res.noise) { const ec = ((e % P.q) + P.q + half) % P.q - half; const i = Math.min(nb - 1, Math.max(0, Math.floor((ec + half) / bw))); counts[i]++; }
      const mx = Math.max(1, ...counts), f = frame(w, h, [26, 14, 40, 44], -half, half, 0, mx * 1.1);
      axes(c, f, t('ch9.cv.x'), t('ch9.cv.y'));
      xTicks(c, f, [-Math.floor(half), -Math.floor(P.q / 4), 0, Math.floor(P.q / 4), Math.floor(half)], v => fmt(v));
      c.fillStyle = C.cyan; for (let i = 0; i < nb; i++) if (counts[i]) { const x0 = f.X(-half + i * bw), x1 = f.X(-half + (i + 1) * bw), y = f.Y(counts[i]); c.fillRect(x0 + 0.5, y, Math.max(1, x1 - x0 - 1), f.B - y); }
      c.strokeStyle = C.red; c.lineWidth = 1.5; c.setLineDash([5, 4]); c.beginPath(); for (const s of [-1, 1]) { c.moveTo(f.X(s * P.q / 4), f.T); c.lineTo(f.X(s * P.q / 4), f.B); } c.stroke(); c.setLineDash([]);
    }
  });
  function text() {
    const P = params();
    put('#lwNo', t('ch9.unit.nm', { n: fmt(P.n), m: fmt(P.m) })); put('#lwEo', 'η = ' + fmt(P.eta));
    put('#lwFail', fmt(res.fail) + ' / ' + fmt(TRIALS));
    const pred = M.lwePredictKey(res.K), sh = M.lweKeyShift(res.K);
    put('#lwPred', pred < 1e-4 ? t('ch9.unit.tiny') : fmt(pred * 100, 2) + '%');
    putHTML('#lwBrute', pow10(M.lweBruteLog10(P.n, P.q), 0));
    put('#lwLin', eveRes ? (eveRes.right ? t('ch9.unit.linok') : t('ch9.unit.linbad', { w: fmt(eveRes.wrongCoords), n: fmt(P.n) })) : '—');
    const v = { fail: fmt(res.fail), tr: fmt(TRIALS), pct: fmt(res.rate * 100, 1), pred: fmt(pred * 100, 2), sd: fmt(sh.sd, 1), mu: fmt(sh.mu, 1), q4: fmt(P.q / 4, 1), n: fmt(P.n), m: fmt(P.m), q: fmt(P.q), brute: fmt(M.lweBruteLog10(P.n, P.q), 0), w: eveRes ? fmt(eveRes.wrongCoords) : '' };
    let key = P.zero ? 'ch9.say.zero' : res.fail === 0 ? 'ch9.say.clean' : res.rate < 0.05 ? 'ch9.say.some' : 'ch9.say.many';
    let s = t(key, v);
    if (eveRes) s += ' ' + t(eveRes.right ? 'ch9.say.eveok' : 'ch9.say.evebad', v);
    putHTML('#lwSay', s);
  }
  sim.text = text;
  model();
  const redo = () => { model(); sim.dirty = true; text(); };
  [sN, sE].forEach(e => e.addEventListener('input', redo)); radios('lwQ').forEach(r => r.addEventListener('change', redo)); cZ.addEventListener('change', redo);
  on('#lwEve', 'click', () => { eveRes = M.eveLinear(res.K); text(); });
  text();
})();

/* ML-KEM table */
statics.push(() => {
  const rows = M.MLKEM.map(P => { const s = M.mlkemSizes(P); return `<tr><td>${P.name}</td><td class="num">${fmt(s.dim)}</td><td class="num">${fmt(P.eta1)}</td><td class="num">${fmt(s.ek)}</td><td class="num">${fmt(s.ct)}</td><td class="num">${fmt(P.cat)}</td></tr>`; }).join('');
  $('#kemTable').innerHTML = `<thead><tr><th>${t('ch9.th.name')}</th><th class="num">${t('ch9.th.dim')}</th><th class="num">η₁</th><th class="num">${t('ch9.th.ek')}</th><th class="num">${t('ch9.th.ct')}</th><th class="num">${t('ch9.th.cat')}</th></tr></thead><tbody>${rows}</tbody>`;
});

/* ───────── 10 frontier lists and figures of merit ───────── */
statics.push(() => {
  const groups = { std: '#fxStd', deploy: '#fxDeploy', attack: '#fxAttack', claim: '#fxClaim' };
  for (const g in groups) $(groups[g]).innerHTML = M.FRONTIER.filter(x => x.group === g).map(x => `<li><span class="when">${t('u.asof', { d: ym(x.date) })}</span>${t('fx.' + x.id)}</li>`).join('');
  const rows = M.MERIT.map(M.meritRow).map(r => `<tr><td>${t('merit.' + r.id)}${r.pq ? ' <span class="tag c">PQ</span>' : ''}</td><td class="num">${fmt(r.pk)}</td><td class="num">${fmt(r.kind === 'kem' ? r.ct : r.sig)}</td><td class="num">${r.kind === 'kem' ? t('merit.ops', { v: fmt(r.ops) }) : t('merit.rel', { s: fmt(r.sign, r.sign < 10 && r.sign % 1 ? 1 : 0), v: fmt(r.verify, r.verify % 1 ? 1 : 0) })}</td></tr>`).join('');
  $('#meritTable').innerHTML = `<thead><tr><th>${t('merit.th.alg')}</th><th class="num">${t('merit.th.pk')}</th><th class="num">${t('merit.th.out')}</th><th class="num">${t('merit.th.speed')}</th></tr></thead><tbody>${rows}</tbody>`;
});

/* ───────── loop ───────── */
applyLang();
let last = performance.now();
function tick(now) {
  const dt = Math.min((now - last) / 1000, 0.1); last = now;
  for (const s of sims) {
    if (!s.vis) continue;
    if (s.step) s.step(dt); else if (s.dirty) { s.draw(); s.dirty = false; }
    if (s.dirty && s.draw) { s.draw(); s.dirty = false; }
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
window.__essayReady = true;
})();
