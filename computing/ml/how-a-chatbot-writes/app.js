/* How a chatbot writes: wiring, drawing, i18n and on-screen gating. All visible text comes from copy.*.js,
 * all training data from corpus.*.js; the models are trained here, in the browser, from that data. */
(() => {
'use strict';
const M = window.ChatModels;
const COPY = window.ESSAY_COPY || {};
const CORPUS = window.ESSAY_CORPUS || {};
const $ = s => document.querySelector(s);
const C = { bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', dimfill: '#3a4254' };
const GROUP_COL = [C.cyan, C.gold, C.green, C.violet, C.red];
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ───────── language ───────── */
const LS = 'knowledge-lang';
let memLang = null;
function readLang() { try { return localStorage.getItem(LS); } catch (e) { return memLang; } }
function writeLang(v) { memLang = v; try { localStorage.setItem(LS, v); } catch (e) { /* in-memory fallback */ } }
let lang = readLang();
if (lang !== 'zh' && lang !== 'en') lang = /^zh/i.test(navigator.language || '') ? 'zh' : 'en';
// the text actually shown (English copy may be missing) decides which corpus the models train on
const effLang = () => (COPY[lang] ? lang : 'zh');
function t(key, vars) {
  const L = effLang();
  let s = (COPY[L] && COPY[L][key] != null) ? COPY[L][key] : (COPY.zh && COPY.zh[key] != null ? COPY.zh[key] : key);
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => vars[k] != null ? vars[k] : m);
  return s;
}
function fmt(x, d = 0) {
  if (!isFinite(x)) return '∞';
  const v = Math.abs(x) < 0.5 * Math.pow(10, -d) ? 0 : x;
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const vis = tok => tok === M.BOS ? '' : tok.replace(/^ /, '␣');   // a token with its leading space made visible
const word = tok => tok.trim();                                         // a token as a word inside a sentence
const joinText = toks => toks.filter(x => x !== M.BOS).join('').trim();

/* ───────── the models for the current language ───────── */
const builds = {};
let B = null, F = null, FV = null;
function useCorpus() {
  const L = CORPUS[effLang()] ? effLang() : 'zh';
  if (!builds[L]) { const b = M.build(CORPUS[L]); builds[L] = { b, f: M.facts(b) }; }
  B = builds[L].b; F = builds[L].f;
  // prose placeholders: numbers formatted, tokens as words
  FV = {};
  for (const [k, v] of Object.entries(F)) FV[k] = typeof v === 'number' ? fmt(v) : esc(v);
  FV.prompt = esc(CORPUS[L].probes.prompt);
}

/* ───────── canvas + sim registry ───────── */
function fit(cv) {
  const r = cv.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
  const W = Math.max(1, Math.round(r.width * d)), H = Math.max(1, Math.round(r.height * d));
  if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
  const c = cv.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0); c.font = FONT; c.textBaseline = 'middle';
  c.clearRect(0, 0, r.width, r.height);
  return { c, w: r.width, h: r.height };
}
const sims = [];
const io = new IntersectionObserver(es => es.forEach(e => { for (const s of sims) if (s.cvs.includes(e.target)) { s.vis = e.isIntersecting; s.dirty = true; } }), { rootMargin: '60px' });
function reg(cvs, o) { o.cvs = [].concat(cvs); o.vis = false; o.dirty = true; sims.push(o); o.cvs.forEach(cv => io.observe(cv)); return o; }
window.addEventListener('resize', () => sims.forEach(s => { s.dirty = true; }));
const on = (sel, ev, fn) => { const el = $(sel); el.addEventListener(ev, fn); return el; };
const put = (sel, s) => { const e = $(sel); if (e.textContent !== s) e.textContent = s; };
const putHTML = (sel, s) => { const e = $(sel); if (e.__h !== s) { e.innerHTML = s; e.__h = s; } };
function frame(w, h, m, x0, x1, y0, y1) {
  const L = m[3], R = w - m[1], T = m[0], Bt = h - m[2];
  return { L, R, T, B: Bt, X: x => L + (R - L) * (x - x0) / (x1 - x0), Y: y => Bt - (Bt - T) * (y - y0) / (y1 - y0) };
}
function axes(c, f, xLab, yLab) {
  c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.T); c.lineTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
  c.fillStyle = C.mute; c.font = FONT;
  if (yLab) { c.textAlign = 'left'; c.fillText(yLab, f.L + 6, f.T - 12); }
  if (xLab) { c.textAlign = 'right'; c.fillText(xLab, f.R, f.B + 26); }
}
function xTicks(c, f, vals, fv) {
  c.fillStyle = C.mute; c.textAlign = 'center';
  vals.forEach(v => { const x = f.X(v); c.fillText(fv(v), x, f.B + 11); c.strokeStyle = C.line; c.beginPath(); c.moveTo(x, f.B); c.lineTo(x, f.B + 3); c.stroke(); });
}
function yTicks(c, f, vals, fv) {
  c.fillStyle = C.mute; c.textAlign = 'right';
  vals.forEach(v => { const y = f.Y(v); c.fillText(fv(v), f.L - 6, y); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, y); c.lineTo(f.R, y); c.stroke(); });
}
function niceStep(range, n) { const raw = range / n, p = Math.pow(10, Math.floor(Math.log10(raw))); for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= raw) return m * p; return 10 * p; }
const ticks = (a, b, n) => { const s = niceStep(b - a, n), out = []; for (let v = Math.ceil(a / s) * s; v <= b + 1e-9; v += s) out.push(+v.toFixed(6)); return out; };
function chips(sel, toks, cls = () => '') {
  putHTML(sel, toks.map((x, i) => `<span class="t ${cls(x, i)}">${esc(vis(x))}</span>`).join(''));
}
// DOM probability bars. rows: [{label, a (0..1, main), b (0..1, second bar, optional), val, cls}]
function bars(sel, rows, opt = {}) {
  const mx = opt.max || 1;
  let h = rows.map(r => `<div class="row ${r.cls || ''}"><span class="lab2">${esc(r.label)}</span><span class="track">` +
    (opt.outline ? `<span class="fill alt" style="width:${(100 * r.b / mx).toFixed(1)}%"></span>` : '') +
    `<span class="fill${opt.pair ? ' one' : ''}" style="width:${(100 * r.a / mx).toFixed(1)}%"></span>` +
    (opt.pair ? `<span class="fill two" style="width:${(100 * r.b / mx).toFixed(1)}%"></span>` : '') +
    `</span><span class="pv">${esc(r.val)}</span></div>`).join('');
  if (opt.more) h += `<div class="more">${esc(opt.more)}</div>`;
  putHTML(sel, h);
}
const pct = (x, d = 0) => fmt(100 * x, d) + '%';
const texts = []; // every chapter's text() function, re-run on language change

/* ───────── 01 tokenizer ───────── */
(() => {
  const cv = $('#tkCv'), sM = $('#tkM'), inp = $('#tkIn');
  let edited = false;
  const setup = () => { sM.max = B.bpe.merges.length; sM.value = B.bpe.stop; if (!edited) inp.value = B.corpus.probes.sentence; };
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), bp = B.bpe, n = bp.merges.length, m = +sM.value, yMax = bp.chars * 1.08;
      const f = frame(w, h, [26, 16, 40, 52], 0, n, 0, yMax);
      yTicks(c, f, ticks(0, yMax, 3), v => fmt(v));
      xTicks(c, f, ticks(0, n, w < 420 ? 3 : 5), v => fmt(v));
      axes(c, f, t('ch1.cv.x'), t('ch1.cv.y'));
      c.strokeStyle = C.mute; c.setLineDash([5, 4]); c.lineWidth = 1.2; c.beginPath(); c.moveTo(f.X(bp.stop), f.T); c.lineTo(f.X(bp.stop), f.B); c.stroke(); c.setLineDash([]);
      c.strokeStyle = C.cyan; c.lineWidth = 2.2; c.beginPath(); bp.tokensAfter.forEach((y, i) => c[i ? 'lineTo' : 'moveTo'](f.X(i), f.Y(y))); c.stroke();
      c.strokeStyle = C.gold; c.lineWidth = 2; c.beginPath(); c.moveTo(f.X(m), f.T); c.lineTo(f.X(m), f.B); c.stroke();
      c.fillStyle = C.gold; c.beginPath(); c.arc(f.X(m), f.Y(bp.tokensAfter[m]), 4.5, 0, 6.283); c.fill();
    }
  });
  function text() {
    const bp = B.bpe, m = +sM.value, toks = M.encode(inp.value, bp, m);
    const unk = toks.filter(x => [...x].length === 1 && !bp.base.has(x) && x.trim());
    put('#tkMo', fmt(m));
    chips('#tkToks', toks, x => unk.includes(x) ? 'unk' : '');
    const recent = bp.merges.slice(Math.max(0, m - 5), m).reverse();
    putHTML('#tkRecent', recent.length ? recent.map(r => `<li>${esc(vis(r.a))} + ${esc(vis(r.b))} → <b>${esc(vis(r.ab))}</b> × ${fmt(r.count)}</li>`).join('') : `<li>${esc(t('ch1.recent.none'))}</li>`);
    put('#tkVocab', fmt(bp.baseSize + m)); put('#tkLen', fmt(bp.tokensAfter[m])); put('#tkRatio', fmt(bp.chars / bp.tokensAfter[m], 2)); put('#tkMine', fmt(toks.length));
    let key, v = { base: fmt(bp.baseSize), m: fmt(m), stop: fmt(bp.stop) };
    if (unk.length) { key = 'ch1.say.unk'; v.x = esc(unk.slice(0, 3).join('」「')); }
    else if (m === 0) key = 'ch1.say.zero';
    else { const r = bp.merges[m - 1]; Object.assign(v, { a: esc(vis(r.a)), b: esc(vis(r.b)), ab: esc(vis(r.ab)), c: fmt(r.count) }); key = m <= bp.stop ? 'ch1.say.early' : 'ch1.say.late'; }
    putHTML('#tkSay', t(key, v));
  }
  sim.text = text; sim.setup = setup;
  sM.addEventListener('input', () => { sim.dirty = true; text(); });
  inp.addEventListener('input', () => { edited = true; text(); });
  texts.push(sim);
})();

/* ───────── 02 bigram table ───────── */
(() => {
  let seed = 1;
  const box = $('#bgCtx');
  function setup() {
    box.querySelectorAll('label').forEach(l => l.remove());
    B.corpus.probes.contexts.forEach((x, i) => { const l = document.createElement('label'); l.innerHTML = `<input type="radio" name="bgCtx" value="${i}"${i ? '' : ' checked'}><span>${esc(vis(x))}</span>`; box.appendChild(l); l.querySelector('input').addEventListener('change', text); });
    put('#bgOut', '');
  }
  const ctx = () => B.corpus.probes.contexts[+(box.querySelector('input:checked') || { value: 0 }).value];
  function text() {
    const x = ctx(), d = M.ngramDist(B.ng, [x], 2), top = d.items.slice(0, 8), rest = d.items.slice(8);
    const mx = d.items[0].p;
    bars('#bgBars', top.map(it => ({ label: vis(it.tok), a: it.p, val: t('ch2.unit.c', { c: fmt(it.c) }) })), {
      max: mx, more: rest.length ? (rest.every(r => r.c === 1) ? t('ch2.bars.more', { n: fmt(rest.length) }) : t('ch2.bars.moreMixed', { n: fmt(rest.length) })) : '' });
    put('#bgN', fmt(d.total)); put('#bgK', fmt(d.items.length)); put('#bgTop', word(d.items[0].tok) || vis(d.items[0].tok)); put('#bgPairs', fmt(B.ng.pairs));
    const v = { ctx: esc(word(x)), n: fmt(d.total), k: fmt(d.items.length), top: esc(word(d.items[0].tok)), c: fmt(d.items[0].c), p: fmt(100 * d.items[0].p) };
    putHTML('#bgSay', t(d.items.length === 1 ? 'ch2.say.one' : 'ch2.say.many', v));
  }
  on('#bgGen', 'click', () => { const s = M.generate(B.ng, 2, M.rng(seed++), {}); chips('#bgOut', s); });
  texts.push({ text, setup });
})();

/* ───────── 03 longer context ───────── */
(() => {
  const cv = $('#ngCv'), sO = $('#ngO');
  let seed = 100;
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), f = frame(w, h, [26, 12, 40, 46], -0.5, 3.5, 0, 100), cur = +sO.value;
      c.fillStyle = 'rgba(233,185,73,.08)'; c.fillRect(f.X(cur - 0.5), f.T, f.X(cur + 0.5) - f.X(cur - 0.5), f.B - f.T);
      yTicks(c, f, [0, 50, 100], v => fmt(v) + '%');
      xTicks(c, f, [0, 1, 2, 3], v => fmt(v));
      axes(c, f, t('ch3.cv.x'), '');
      const bw = Math.min(26, (f.X(1) - f.X(0)) * 0.24);
      for (let v = 0; v < 4; v++) {
        const o = v + 1, vals = [100 * F['copy' + o] / F.runs, F['unseen' + o], F['zero' + o]], cols = [C.gold, C.violet, C.red];
        vals.forEach((val, j) => { const x = f.X(v) + (j - 1) * (bw + 3) - bw / 2; c.fillStyle = cols[j]; c.fillRect(x, f.Y(val), bw, Math.max(1, f.B - f.Y(val))); });
      }
    }
  });
  function gen() {
    const o = +sO.value + 1, r = M.rng(seed++), out = [];
    for (let i = 0; i < 3; i++) { const s = M.generate(B.ng, o, r, {}); out.push(`<li>${esc(joinText(s))}${B.ng.lines.has(s.join(M.SEP)) ? `<span class="copied">${esc(t('ch3.copied'))}</span>` : ''}</li>`); }
    putHTML('#ngOut', out.join(''));
  }
  function text() {
    const v = +sO.value, o = v + 1;
    put('#ngOo', t('ch3.unit.order', { v: fmt(v) }));
    put('#ngCopy', t('ch3.unit.sent', { v: fmt(F['copy' + o]) })); put('#ngUnseen', fmt(F['unseen' + o]) + '%'); put('#ngZero', fmt(F['zero' + o]) + '%');
    const key = v === 0 ? 'ch3.say.zero' : F['copy' + o] / F.runs > 0.5 ? 'ch3.say.far' : 'ch3.say.mid';
    putHTML('#ngSay', t(key, { v: fmt(v), runs: fmt(F.runs), copy: fmt(F['copy' + o]), unseen: fmt(F['unseen' + o]), zero: fmt(F['zero' + o]) }));
  }
  sim.text = text; sim.setup = gen;
  sO.addEventListener('input', () => { sim.dirty = true; text(); gen(); });
  on('#ngGen', 'click', gen);
  texts.push(sim);
})();

/* ───────── 04 word vectors ───────── */
(() => {
  const cv = $('#vcCv'), sK = $('#vcK'), sel = $('#vcWord');
  let pts = [], placed = [];
  const map = () => B.corpus.probes.map;
  function setup() {
    sel.innerHTML = map().map((w, i) => `<option value="${i}">${esc(word(w))}</option>`).join('');
    sel.value = String(Math.max(0, map().indexOf(B.corpus.probes.word)));
    putHTML('#vcLegend', [0, 1, 2, 3, 4].map(g => `<span><i style="background:${GROUP_COL[g]}"></i>${esc(t('ch4.group.' + g))}</span>`).join(''));
  }
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), k = +sK.value, words = map(), cur = +sel.value;
      const raw = M.map2d(B.vectors, words, k);
      const xs = raw.map(p => p[0]), ys = raw.map(p => p[1]);
      const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
      const pad = 22, sx = (x1 - x0) || 1, sy = (y1 - y0) || 1;
      pts = raw.map(p => [pad + (w - 2 * pad) * (p[0] - x0) / sx, h - pad - (h - 2 * pad) * (y1 - y0 ? (p[1] - y0) / sy : 0.5)]);
      // neighbours of the chosen word get their links drawn first
      const nbs = M.neighbours(B.vectors, words[cur], k, 3, words).map(n => words.indexOf(n.tok));
      c.strokeStyle = 'rgba(233,185,73,.45)'; c.lineWidth = 1.2;
      for (const j of nbs) { c.beginPath(); c.moveTo(pts[cur][0], pts[cur][1]); c.lineTo(pts[j][0], pts[j][1]); c.stroke(); }
      words.forEach((wd, i) => { c.fillStyle = GROUP_COL[M.groupOf(i)]; c.beginPath(); c.arc(pts[i][0], pts[i][1], i === cur ? 7 : 5, 0, 6.283); c.fill(); });
      c.strokeStyle = C.ink; c.lineWidth = 2; c.beginPath(); c.arc(pts[cur][0], pts[cur][1], 9, 0, 6.283); c.stroke();
      // labels: chosen word first, then its neighbours, then the rest; a label that would overlap is skipped
      c.font = '13px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
      placed = [];
      const dots = pts.map(p => ({ x: p[0] - 7, y: p[1] - 7, w: 14, h: 14 }));
      const hit = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
      const order = [cur, ...nbs, ...words.map((_, i) => i).filter(i => i !== cur && !nbs.includes(i))];
      for (const i of order) {
        const s = word(words[i]), tw = c.measureText(s).width, th = 15, [px, py] = pts[i];
        const g = i === cur ? 13 : 9, cands = [[px + g, py - th / 2], [px - g - tw, py - th / 2], [px - tw / 2, py - g - th], [px - tw / 2, py + g]];
        for (const [x, y] of cands) {
          const box = { x: x - 2, y: y - 1, w: tw + 4, h: th + 2 };
          if (box.x < 2 || box.y < 2 || box.x + box.w > w - 2 || box.y + box.h > h - 2) continue;
          if (placed.some(b => hit(b, box)) || dots.some((d, j) => j !== i && hit(d, box))) continue;
          placed.push(box);
          c.fillStyle = i === cur ? C.ink : C.mute; c.textAlign = 'left'; c.textBaseline = 'top'; c.fillText(s, x, y);
          break;
        }
      }
      c.textBaseline = 'middle';
    }
  });
  function text() {
    const k = +sK.value, words = map(), w0 = words[+sel.value];
    put('#vcKo', fmt(k));
    const nb = M.neighbours(B.vectors, w0, k, 5);
    bars('#vcList', nb.map(n => ({ label: word(n.tok), a: Math.max(0, n.cos), val: fmt(n.cos, 2) })), { max: 1 });
    const good = M.sameKind(B.vectors, words, k);
    put('#vcNb', word(nb[0].tok)); put('#vcCos', fmt(nb[0].cos, 2)); put('#vcGood', t('ch4.unit.good', { v: fmt(good), n: fmt(words.length) }));
    putHTML('#vcSay', t(good / words.length >= 0.6 ? 'ch4.say.good' : 'ch4.say.poor', { k: fmt(k), w: esc(word(w0)), nb: esc(word(nb[0].tok)), cos: fmt(nb[0].cos, 2), n: fmt(words.length), good: fmt(good) }));
  }
  sim.text = text; sim.setup = setup;
  sK.addEventListener('input', () => { sim.dirty = true; text(); });
  sel.addEventListener('change', () => { sim.dirty = true; text(); });
  cv.addEventListener('click', e => {
    const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    let best = -1, bd = 24 * 24; pts.forEach((p, i) => { const d = (p[0] - x) ** 2 + (p[1] - y) ** 2; if (d < bd) { bd = d; best = i; } });
    if (best >= 0) { sel.value = String(best); sim.dirty = true; text(); }
  });
  texts.push(sim);
})();

/* ───────── 05 attention ───────── */
(() => {
  const A = M.attention, sS = $('#atSlope'), box = $('#atSlots');
  let cur = 6;
  function setup() {
    box.innerHTML = B.corpus.toy.map((x, i) => `<button type="button" data-i="${i}" aria-pressed="${i === cur}"><span class="w">${esc(x)}</span><span class="wbar"><i></i><em></em></span></button>`).join('');
    box.querySelectorAll('button').forEach(b => b.addEventListener('click', () => { cur = +b.dataset.i; text(); }));
  }
  const values = () => B.corpus.toyVocab.map(x => x && B.vectors.idx.has(x) ? B.vectors.vec[B.vectors.idx.get(x)] : null);
  function text() {
    const slope = +sS.value, toy = B.corpus.toy, row = A.row(cur, slope);
    put('#atSlopeo', fmt(slope, 1));
    box.querySelectorAll('button').forEach((b, i) => {
      b.setAttribute('aria-pressed', String(i === cur));
      const r = row.find(q => q.j === i);
      b.querySelector('i').style.height = r ? (36 * r.w).toFixed(1) + 'px' : '0';
      b.querySelector('em').textContent = r ? fmt(100 * r.w) + '%' : '';
      b.setAttribute('aria-label', toy[i] + (r ? ' · ' + fmt(100 * r.w) + '%' : ''));
    });
    putHTML('#atQ', t('ch5.q', { t: esc(toy[cur]), q: '(' + A.queries[cur].map(x => fmt(x)).join(', ') + ')' }));
    const topW = Math.max(...row.map(r => r.w));
    putHTML('#atTable', `<thead><tr><th>${t('ch5.th.tok')}</th><th>${t('ch5.th.key')}</th><th>${t('ch5.th.dot')}</th><th>${t('ch5.th.scaled')}</th><th>${t('ch5.th.bias')}</th><th>${t('ch5.th.w')}</th></tr></thead><tbody>` +
      row.map(r => `<tr class="${r.w === topW ? 'top' : ''}"><td>${esc(toy[r.j])}</td><td>${A.keys[r.j].map(x => fmt(x)).join(' ')}</td><td>${fmt(r.dot)}</td><td>${fmt(r.scaled, 1)}</td><td>${fmt(r.bias, 1)}</td><td>${fmt(100 * r.w)}%</td></tr>`).join('') + '</tbody>');
    const top = row.reduce((a, b) => b.w > a.w ? b : a);
    const out = A.mix(row, values(), B.vectors.dims), norm = Math.hypot(...out);
    const near = norm > 1e-9 ? word(M.nearestTo(B.vectors, out, B.vectors.dims, 1)[0].tok) : '—';
    put('#atTop', toy[top.j]); put('#atW', fmt(100 * top.w) + '%'); put('#atNear', near);
    const flat = A.queries[cur].every(x => x === 0) && slope === 0;
    const key = cur === 0 ? 'ch5.say.first' : flat ? 'ch5.say.flat' : top.j === cur ? 'ch5.say.self' : 'ch5.say.focus';
    putHTML('#atSay', t(key, { t: esc(toy[cur]), w: fmt(100 * top.w), top: esc(toy[top.j]), near: esc(near), n: fmt(cur + 1) }));
  }
  sS.addEventListener('input', text);
  texts.push({ text, setup });
})();

/* ───────── 06 temperature and truncation ───────── */
(() => {
  const box = $('#smCtx'), sT = $('#smT'), sK = $('#smK'), sP = $('#smP');
  let seed = 500;
  function setup() {
    box.querySelectorAll('label').forEach(l => l.remove());
    B.corpus.probes.sampleContexts.forEach((x, i) => { const l = document.createElement('label'); l.innerHTML = `<input type="radio" name="smCtx" value="${i}"${i ? '' : ' checked'}><span>${esc(vis(x))}</span>`; box.appendChild(l); l.querySelector('input').addEventListener('change', text); });
    put('#smOut', '');
  }
  const ctx = () => B.corpus.probes.sampleContexts[+(box.querySelector('input:checked') || { value: 0 }).value];
  const opts = () => ({ T: +sT.value, k: +sK.value, topP: +sP.value });
  let distKey = '', distVal = 0;
  function text() {
    const o = opts(), d = M.ngramDist(B.ng, [ctx()], 2), sh = M.shape(d.items, o.T, o.k, o.topP);
    put('#smTo', o.T === 0 ? t('ch6.unit.T0') : fmt(o.T, 2)); put('#smKo', o.k === 0 ? t('ch6.unit.koff') : fmt(o.k)); put('#smPo', fmt(o.topP, 2));
    const shown = sh.slice(0, 10), mx = Math.max(...sh.map(s => Math.max(s.p0, s.r)));
    bars('#smBars', shown.map(s => ({ label: vis(s.tok), a: s.r, b: s.p0, val: pct(s.r), cls: s.keep ? '' : 'cut' })), { max: mx, outline: true, more: sh.length > 10 ? t('ch2.bars.moreMixed', { n: fmt(sh.length - 10) }) : '' });
    const kept = sh.filter(s => s.keep).length, H = M.entropyBits(sh.map(s => s.r));
    const dk = [o.T, o.k, o.topP, effLang()].join('|');
    if (dk !== distKey) { distKey = dk; distVal = M.distinctSentences(B.ng, 2, o.T, o.k, o.topP, 100, 3); }
    put('#smTop', pct(sh[0].r)); put('#smKept', t('ch6.unit.kept', { v: fmt(kept), n: fmt(sh.length) })); put('#smH', fmt(H, 2)); put('#smDist', t('ch6.unit.sent', { v: fmt(distVal) }));
    const v = { T: fmt(o.T, 2), top: esc(word(sh[0].tok)), p0: fmt(100 * sh[0].p0), p: fmt(100 * sh[0].r), dist: fmt(distVal), kept: fmt(kept), cut: fmt(sh.length - kept) };
    const key = o.T === 0 ? 'ch6.say.greedy' : kept < sh.length ? 'ch6.say.cut' : o.T === 1 ? 'ch6.say.plain' : o.T < 1 ? 'ch6.say.sharp' : 'ch6.say.flat';
    putHTML('#smSay', t(key, v));
  }
  [sT, sK, sP].forEach(e => e.addEventListener('input', text));
  on('#smGen', 'click', () => { const r = M.rng(seed++), o = opts(); putHTML('#smOut', Array.from({ length: 5 }, () => `<li>${esc(joinText(M.generate(B.ng, 2, r, o)))}</li>`).join('')); });
  texts.push({ text, setup });
})();

/* ───────── 07 training ───────── */
(() => {
  const cv = $('#trCv'), sLr = $('#trLr'), bGo = $('#trGo'), LRS = [0.5, 1, 2, 5, 10, 20, 50], RATE = 90; // steps per second of real time
  let net = null, cur = 0, playing = false, acc = 0, diverged = false;
  const d = () => +document.querySelector('input[name=trD]:checked').value;
  const lr = () => LRS[+sLr.value];
  // net.history[i] is the loss after i steps (netStep records the loss before each step); `cur` is the loss now
  function fresh() { net = M.netCreate(B.bigram, d(), 1); cur = M.netLoss(net); diverged = false; acc = 0; setPlaying(false); }
  function setPlaying(p) { playing = p && !reduce; bGo.setAttribute('aria-pressed', String(playing)); bGo.textContent = reduce ? t('ch7.btn.step') : t(playing ? 'ch7.btn.pause' : 'ch7.btn.go'); }
  function train(n) {
    for (let i = 0; i < n && !diverged; i++) if (!isFinite(M.netStep(net, lr()))) diverged = true;
    cur = M.netLoss(net); if (!isFinite(cur)) diverged = true;
    if (diverged) setPlaying(false);
  }
  const sim = reg(cv, {
    step(dt) {
      if (playing && !diverged) { acc += dt * RATE; const n = Math.min(8, Math.floor(acc)); if (n > 0) { acc -= n; train(n); this.dirty = true; text(); } }
      if (this.dirty) { this.draw(); this.dirty = false; }
    },
    draw() {
      const { c, w, h } = fit(cv), hist = net.history, lnV = Math.log(B.bigram.V), yMax = Math.ceil(lnV + 0.5);
      const xMax = Math.max(500, Math.ceil(net.step / 500) * 500);
      const f = frame(w, h, [28, 14, 40, 40], 0, xMax, 0, yMax);
      yTicks(c, f, ticks(0, yMax, 3), v => fmt(v)); xTicks(c, f, ticks(0, xMax, w < 420 ? 2 : 4), v => fmt(v));
      axes(c, f, t('ch7.cv.x'), t('ch7.cv.y'));
      c.setLineDash([5, 4]); c.lineWidth = 1.3;
      c.strokeStyle = C.mute; c.beginPath(); c.moveTo(f.L, f.Y(lnV)); c.lineTo(f.R, f.Y(lnV)); c.stroke();
      c.strokeStyle = C.gold; c.beginPath(); c.moveTo(f.L, f.Y(B.bigram.floor)); c.lineTo(f.R, f.Y(B.bigram.floor)); c.stroke(); c.setLineDash([]);
      c.strokeStyle = C.cyan; c.lineWidth = 2; c.beginPath();
      hist.concat([cur]).forEach((L, i) => { const y = f.Y(Math.min(isFinite(L) ? L : yMax, yMax)); c[i ? 'lineTo' : 'moveTo'](f.X(i), y); });
      c.stroke();
      c.fillStyle = C.cyan; c.beginPath(); c.arc(f.X(net.step), f.Y(Math.min(isFinite(cur) ? cur : yMax, yMax)), 4, 0, 6.283); c.fill();
    }
  });
  function text() {
    const L = cur, floor = B.bigram.floor, gap = L - floor;
    put('#trLro', fmt(lr(), lr() < 1 ? 1 : 0));
    put('#trStep', fmt(net.step)); put('#trLoss', isFinite(L) ? fmt(L, 3) : '∞'); put('#trFloor', fmt(floor, 3)); put('#trPpl', isFinite(L) && L < 50 ? fmt(Math.exp(L), 1) : '∞');
    const ctxTok = B.corpus.probes.contexts[0], dd = M.ngramDist(B.ng, [ctxTok], 2), p = diverged ? null : M.netProbs(net, B.bigram.idx.get(ctxTok));
    putHTML('#trBarsCap', esc(t('ch7.bars.cap', { ctx: word(ctxTok) })));
    bars('#trBars', dd.items.slice(0, 6).map(it => { const q = p ? p[B.bigram.idx.get(it.tok)] : 0; return { label: vis(it.tok), a: q, b: it.p, val: p ? pct(q) : '—' }; }), { pair: true, max: 1 });
    const v = { step: fmt(net.step), loss: fmt(L, 2), floor: fmt(floor, 2), gap: fmt(gap, 2), lnV: fmt(Math.log(B.bigram.V), 2), V: fmt(B.bigram.V), d: fmt(d()), lr: fmt(lr(), lr() < 1 ? 1 : 0) };
    const back = net.step >= 200 ? net.history[net.step - 200] : null;
    let key;
    if (diverged) key = 'ch7.say.diverge';
    else if (net.step === 0) key = 'ch7.say.start';
    else if (gap < 0.05) key = 'ch7.say.near';
    else if (net.step >= 500 && back != null && back - L < 0.02 && gap > 0.1) key = 'ch7.say.stuck';
    else key = 'ch7.say.going';
    putHTML('#trSay', t(key, v));
  }
  function setup() { fresh(); sim.dirty = true; }
  bGo.addEventListener('click', () => {
    if (diverged) return;
    if (reduce) { train(200); sim.dirty = true; text(); return; }
    setPlaying(!playing); text();
  });
  on('#trReset', 'click', () => { fresh(); sim.dirty = true; text(); });
  document.querySelectorAll('input[name=trD]').forEach(r => r.addEventListener('change', () => { fresh(); sim.dirty = true; text(); }));
  sLr.addEventListener('input', () => { text(); });
  sim.text = () => { setPlaying(playing); text(); }; sim.setup = setup;
  texts.push(sim);
})();

/* ───────── 08 the whole loop ───────── */
(() => {
  const sO = $('#lpO'), sT = $('#lpT');
  let out = [], nPrompt = 0, last = null, done = null, r = null, seed = 900;
  const MAX = 30;
  function reset() { out = M.encode(B.corpus.probes.prompt, B.tok); nPrompt = out.length; last = null; done = null; r = M.rng(seed++); }
  function step() {
    if (done) return;
    const order = +sO.value + 1, d = M.ngramDist(B.ng, out, order);
    const sh = M.shape(d.items, +sT.value, 0, 1), tok = M.pick(sh, r()), s = sh.find(x => x.tok === tok);
    out.push(tok);
    last = { d, sh, tok, p: s.r };
    if (M.isEnd(tok)) done = 'end'; else if (out.length - nPrompt >= MAX) done = 'max';
  }
  const ctxText = toks => toks.length ? toks.map(x => x === M.BOS ? t('ch8.bos') : x).join('') .trim() : t('ch8.ctx.none');
  function text() {
    put('#lpOo', t('ch3.unit.order', { v: fmt(+sO.value) })); put('#lpTo', +sT.value === 0 ? t('ch6.unit.T0') : fmt(+sT.value, 2));
    const L = last ? last.d.L : 0, ctxN = last ? last.d.ctx.filter(x => x !== M.BOS).length : 0;
    chips('#lpOut', out, (x, i) => (i < nPrompt ? 'prompt ' : '') + (last && i === out.length - 1 ? 'new ' : '') + (last && i >= out.length - 1 - ctxN && i < out.length - 1 ? 'ctx' : ''));
    if (last) bars('#lpBars', last.sh.slice(0, 8).map(s => ({ label: vis(s.tok), a: s.r, val: pct(s.r), cls: s.tok === last.tok ? 'pick' : '' })), { max: Math.max(...last.sh.map(s => s.r)), more: last.sh.length > 8 ? t('ch2.bars.moreMixed', { n: fmt(last.sh.length - 8) }) : '' });
    else putHTML('#lpBars', '');
    put('#lpLen', fmt(out.length - nPrompt)); put('#lpCtx', last ? ctxText(last.d.ctx) : '—'); put('#lpP', last ? pct(last.p) : '—');
    let key, v = {};
    if (!last) key = 'ch8.say.start';
    else if (done === 'end') { key = 'ch8.say.end'; v.n = fmt(out.length); }
    else if (done === 'max') { key = 'ch8.say.max'; v.n = fmt(out.length - nPrompt); }
    else {
      const d = last.d, before = out.slice(0, -1), full = [M.BOS, ...before].slice(-d.wanted);
      Object.assign(v, { L: fmt(L), want: fmt(d.wanted), ctx: esc(ctxText(d.ctx)), full: esc(ctxText(full)), k: fmt(d.items.length), tok: esc(word(last.tok) || vis(last.tok)), p: fmt(100 * last.p) });
      key = L < d.wanted ? (L === 0 ? 'ch8.say.backoff0' : 'ch8.say.backoff') : (d.wanted === 0 ? 'ch8.say.step0' : 'ch8.say.step');
    }
    putHTML('#lpSay', t(key, v));
  }
  on('#lpStep', 'click', () => { step(); text(); });
  on('#lpFinish', 'click', () => { while (!done) step(); text(); });
  on('#lpReset', 'click', () => { reset(); text(); });
  [sO, sT].forEach(e => e.addEventListener('input', text));
  texts.push({ text, setup: reset });
})();

/* ───────── language switch and loop ───────── */
function applyLang() {
  useCorpus();
  document.documentElement.lang = effLang() === 'zh' ? 'zh-CN' : 'en';
  document.title = t('doc.title');
  const md = document.querySelector('meta[name=description]'); if (md) md.content = t('doc.desc');
  document.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n, F); });
  document.querySelectorAll('[data-i18n-html]').forEach(e => { e.innerHTML = t(e.dataset.i18nHtml, FV); });
  document.querySelectorAll('[data-i18n-aria]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.i18nAria, F)); });
  document.querySelectorAll('#langToggle button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  // the corpus may have changed: every chapter rebuilds its controls from the new models
  if (applyLang.corpus !== B) { applyLang.corpus = B; texts.forEach(s => { if (s.setup) s.setup(); }); }
  texts.forEach(s => { s.dirty = true; s.text(); });
}
document.querySelectorAll('#langToggle button').forEach(b => b.addEventListener('click', () => { lang = b.dataset.lang; writeLang(lang); applyLang(); }));
applyLang();
let lastT = performance.now();
function tick(now) {
  const dt = Math.min((now - lastT) / 1000, 0.1); lastT = now;
  for (const s of sims) {
    if (!s.vis) continue;
    if (s.step) s.step(dt);
    if (s.dirty && s.draw) { s.draw(); s.dirty = false; }
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
window.__essayReady = true;
})();
