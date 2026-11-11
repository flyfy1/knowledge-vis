/* Wiring, drawing and i18n for "switches that compute". All visible text comes from copy.*.js via t(). */
(() => {
'use strict';
const M = window.SwitchModels, COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s), $$ = s => Array.from(document.querySelectorAll(s));
const C = { bg:'#0f1219', line:'#2c3344', grid:'#1f2532', ink:'#ebe8e0', mute:'#a7aebb', dim:'#949cad', off:'#3a4254',
  gold:'#e9b949', cyan:'#63c7e6', red:'#f27a6c', green:'#7ad6a0', violet:'#b39dfb' };
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const MONO = '12px ui-monospace,Menlo,Consolas,monospace';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmt = (x, d = 0) => Number(x).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const bin8 = n => { const s = (n & 255).toString(2).padStart(8, '0'); return s.slice(0, 4) + ' ' + s.slice(4); };
const signedStr = n => (n < 0 ? '−' + Math.abs(n) : String(n));

/* ───────── language ───────── */
let memLang = null;
function storeGet() { try { return localStorage.getItem('knowledge-lang'); } catch (e) { return memLang; } }
function storeSet(v) { memLang = v; try { localStorage.setItem('knowledge-lang', v); } catch (e) { /* in-memory fallback */ } }
let lang = storeGet();
if (lang !== 'zh' && lang !== 'en') lang = /^zh/i.test(navigator.language || '') ? 'zh' : 'en';
function t(key, vars) {
  const d = COPY[lang] || {}, z = COPY.zh || {};
  // singular form: a key "<key>.one" is used when the count {n} is exactly 1 ("1 NAND gate", not "1 NAND gates")
  if (vars && String(vars.n) === '1' && ((key + '.one') in d || (key + '.one') in z)) key += '.one';
  let s = key in d ? d[key] : key in z ? z[key] : key;
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
  return s;
}
const refreshers = [];
function applyLang() {
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('doc.title');
  $$('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  $$('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
  $$('[data-i18n-attr]').forEach(el => el.dataset.i18nAttr.split(';').forEach(pair => { const [a, k] = pair.split(':'); el.setAttribute(a.trim(), t(k.trim())); }));
  $$('#langToggle button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  refreshers.forEach(f => f());
  sims.forEach(s => { s.dirty = true; });
}
$$('#langToggle button').forEach(b => b.addEventListener('click', () => { if (b.dataset.lang === lang) return; lang = b.dataset.lang; storeSet(lang); applyLang(); }));

/* ───────── visibility-gated loop ───────── */
const sims = [];
const io = new IntersectionObserver(es => es.forEach(e => { const s = sims.find(x => x.el === e.target); if (s) { s.vis = e.isIntersecting; s.dirty = true; } }), { rootMargin: '60px' });
function reg(el, o) { o.el = el; o.vis = false; o.dirty = true; sims.push(o); io.observe(el); return o; }
let lastT = performance.now();
function loop(now) {
  const dt = Math.min(0.05, Math.max(0, (now - lastT) / 1000)); lastT = now;
  for (const s of sims) {
    if (!s.vis) continue;
    if (s.step) s.step(dt);
    if (s.dirty && s.draw) { s.dirty = false; s.draw(); }
  }
  requestAnimationFrame(loop);
}
window.addEventListener('resize', () => sims.forEach(s => { s.dirty = true; }));

function fit(cv) {
  const r = cv.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
  const W = Math.max(1, Math.round(r.width * d)), H = Math.max(1, Math.round(r.height * d));
  if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
  const c = cv.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0); c.font = FONT; c.textBaseline = 'middle';
  c.clearRect(0, 0, r.width, r.height);
  return { c, w: r.width, h: r.height };
}
function setPressed(el, on) { el.setAttribute('aria-pressed', String(!!on)); }
const svgNS = 'http://www.w3.org/2000/svg';
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

/* ───────── hero: the chapter-7 counter, gate by gate ───────── */
(() => {
  const box = $('#heroLamps'), lamps = [];
  for (let i = 7; i >= 0; i--) { const el = document.createElement('i'); el.dataset.bit = i; box.appendChild(el); lamps.push(el); }
  const val = document.createElement('span'); box.appendChild(val);
  const sim = M.counterSim(40); let acc = 0;
  const cap = $('.heroCap');
  const show = () => { const v = sim.value(); lamps.forEach(el => el.classList.toggle('on', !!((v >> +el.dataset.bit) & 1))); val.textContent = '= ' + v; };
  refreshers.push(() => { cap.textContent = t(reduce ? 'hero.lampsCapStill' : 'hero.lampsCap'); });
  reg(box, { step(dt) { if (reduce) return; acc += dt * 80; let n = Math.floor(acc); acc -= n; while (n-- > 0) sim.tick(); this.dirty = true; }, draw: show });
  show();
})();

/* ───────── ch1: two switches and a lamp ───────── */
(() => {
  const st = { wiring: 'series', t1: 'no', t2: 'no', a: 0, b: 0, seen: new Set() };
  const svg = $('#c1Svg'), table = $('#c1Table');
  const bA = $('#c1A'), bB = $('#c1B'), bT1 = $('#c1T1'), bT2 = $('#c1T2');
  function sw(x, y, label, type, pressed, conducting, live) {
    const closed = conducting, col = live ? C.gold : C.dim;
    const lever = closed ? `<line x1="${x - 24}" y1="${y}" x2="${x + 24}" y2="${y}" stroke="${col}" stroke-width="4" stroke-linecap="round"/>`
      : `<line x1="${x - 24}" y1="${y}" x2="${x + 18}" y2="${y - 20}" stroke="${C.mute}" stroke-width="4" stroke-linecap="round"/>`;
    return `<circle cx="${x - 24}" cy="${y}" r="5" fill="${C.ink}"/><circle cx="${x + 24}" cy="${y}" r="5" fill="${C.ink}"/>${lever}
      <text x="${x}" y="${y - 48}" text-anchor="middle" font-size="16" fill="${pressed ? C.gold : C.mute}">${esc(label)}</text>
      <text x="${x}" y="${y - 30}" text-anchor="middle" font-size="13" fill="${pressed ? C.gold : C.mute}">${esc(t(type === 'no' ? 'ch1.svg.no' : 'ch1.svg.nc'))}</text>
      <rect x="${x - 14}" y="${y + 12}" width="28" height="14" rx="3" fill="${pressed ? C.gold : 'none'}" stroke="${pressed ? C.gold : C.dim}"/>`;
  }
  function render() {
    const lamp = M.relayLamp(st, st.a, st.b);
    const s1 = M.switchConducts(st.t1, st.a), s2 = M.switchConducts(st.t2, st.b);
    const wire = (d, on) => `<path d="${d}" fill="none" stroke="${on ? C.gold : C.line}" stroke-width="${on ? 3 : 2}"/>`;
    let g = '';
    // power source and return
    g += `<rect x="14" y="108" width="62" height="44" rx="8" fill="#1a1f2b" stroke="${C.line}"/><text x="45" y="131" text-anchor="middle" font-size="16" fill="${C.mute}">${esc(t('ch1.svg.power'))}</text>`;
    g += wire('M45 152 V236 H370 V158', lamp);
    if (st.wiring === 'series') {
      g += wire('M76 130 H126', lamp) + wire('M174 130 H246', lamp) + wire('M294 130 H346', lamp);
      g += sw(150, 130, 'A', st.t1, st.a, s1, lamp) + sw(270, 130, 'B', st.t2, st.b, s2, lamp);
    } else {
      g += wire('M76 130 H110', lamp) + wire('M110 130 V80 H186', lamp && s1) + wire('M110 130 V190 H186', lamp && s2);
      g += wire('M234 80 H310 V130', lamp && s1) + wire('M234 190 H310 V130', lamp && s2) + wire('M310 130 H346', lamp);
      g += sw(210, 80, 'A', st.t1, st.a, s1, lamp && s1) + sw(210, 190, 'B', st.t2, st.b, s2, lamp && s2);
    }
    g += `<circle cx="370" cy="130" r="${lamp ? 30 : 24}" fill="${lamp ? 'rgba(233,185,73,.25)' : 'none'}"/><circle cx="370" cy="130" r="22" fill="${lamp ? C.gold : '#1a1f2b'}" stroke="${lamp ? C.gold : C.dim}" stroke-width="2"/>`;
    g += `<text x="370" y="131" text-anchor="middle" dominant-baseline="middle" font-size="${t('ch1.svg.lamp').length > 2 ? 12 : 16}" fill="${lamp ? '#14100a' : C.mute}">${esc(t('ch1.svg.lamp'))}</text>`;
    svg.innerHTML = g;
    st.seen.add(st.a * 2 + st.b);
    const tab = M.relayTable(st);
    let h = `<thead><tr><th>${esc(t('ch1.th.a'))}</th><th>${esc(t('ch1.th.b'))}</th><th>${esc(t('ch1.th.lamp'))}</th></tr></thead><tbody>`;
    for (let r = 0; r < 4; r++) {
      const a = r >> 1, b = r & 1, seen = st.seen.has(r);
      h += `<tr class="${r === st.a * 2 + st.b ? 'cur' : ''}"><td class="${a ? 'one' : 'zero'}">${a}</td><td class="${b ? 'one' : 'zero'}">${b}</td><td class="${seen ? (tab[r] ? 'one' : 'zero') : 'unk'}">${seen ? esc(t(tab[r] ? 'ch1.lampOn' : 'ch1.lampOff')) : '?'}</td></tr>`;
    }
    table.innerHTML = h + '</tbody>';
    $('#c1Lamp').textContent = t(lamp ? 'ch1.lampOn' : 'ch1.lampOff');
    $('#c1Seen').textContent = t('ch1.seen', { n: st.seen.size });
    const done = st.seen.size === 4, name = M.nameOfTable(tab);
    $('#c1Name').textContent = done ? t('gate.' + name) : t('ch1.unnamed');
    $('#c1Say').innerHTML = done ? t('ch1.say.done', { name: t('gate.' + name), desc: t('gate.desc.' + name) }) : t('ch1.say.partial', { n: st.seen.size });
    setPressed(bA, st.a); setPressed(bB, st.b);
    $$('[data-c1wire]').forEach(b => setPressed(b, b.dataset.c1wire === st.wiring));
    bT1.textContent = t(st.t1 === 'no' ? 'ch1.t1.no' : 'ch1.t1.nc'); bT2.textContent = t(st.t2 === 'no' ? 'ch1.t2.no' : 'ch1.t2.nc');
  }
  const rewire = () => { st.seen = new Set(); render(); };
  $$('[data-c1wire]').forEach(b => b.addEventListener('click', () => { st.wiring = b.dataset.c1wire; rewire(); }));
  bT1.addEventListener('click', () => { st.t1 = st.t1 === 'no' ? 'nc' : 'no'; rewire(); });
  bT2.addEventListener('click', () => { st.t2 = st.t2 === 'no' ? 'nc' : 'no'; rewire(); });
  bA.addEventListener('click', () => { st.a ^= 1; render(); });
  bB.addEventListener('click', () => { st.b ^= 1; render(); });
  refreshers.push(render);
})();

/* ───────── ch2: build gates from NAND only ───────── */
(() => {
  const N = 4, st = { target: 'AND', gates: [{ a: 'A', b: 'B' }, { a: '', b: '' }, { a: '', b: '' }, { a: '', b: '' }], A: 1, B: 1 };
  const svg = $('#c2Svg'), slots = $('#c2Slots'), table = $('#c2Table'), tg = $('#c2Targets');
  ['NOT', 'AND', 'OR', 'XOR'].forEach(k => { const b = document.createElement('button'); b.type = 'button'; b.dataset.tgt = k; tg.appendChild(b); b.addEventListener('click', () => { st.target = k; render(); }); });
  function buildSlots() {
    slots.innerHTML = '';
    for (let i = 0; i < N; i++) {
      const d = document.createElement('div'); d.className = 'slot';
      const opts = () => { let o = `<option value="">${esc(t('ch2.unused'))}</option><option value="A">A</option><option value="B">B</option>`; for (let j = 0; j < i; j++) o += `<option value="g${j}">${esc(t('ch2.optGate', { n: j + 1 }))}</option>`; return o; };
      d.innerHTML = `<div><b>${esc(t('ch2.slot', { n: i + 1 }))}</b></div><div class="grp"><select data-g="${i}" data-k="a" aria-label="${esc(t('ch2.in1', { n: i + 1 }))}">${opts()}</select><select data-g="${i}" data-k="b" aria-label="${esc(t('ch2.in2', { n: i + 1 }))}">${opts()}</select></div>`;
      slots.appendChild(d);
    }
    slots.querySelectorAll('select').forEach(s => s.addEventListener('change', () => { st.gates[+s.dataset.g][s.dataset.k] = s.value; render(); }));
  }
  function gx(i) { return 120 + i * 82; }
  function render() {
    slots.querySelectorAll('select').forEach(s => { s.value = st.gates[+s.dataset.g][s.dataset.k]; });
    $$('#c2Targets button').forEach(b => { b.textContent = t('ch2.tgt.' + b.dataset.tgt); setPressed(b, b.dataset.tgt === st.target); });
    const ev = M.evalNandNet(st.gates, st.A, st.B), v = ev.values;
    const srcPt = s => s === 'A' ? [44, 50] : s === 'B' ? [44, 180] : [gx(+s.slice(1)) + 50, 115];
    const col = x => x === 1 ? C.gold : x === 0 ? C.dim : C.line;
    let g = '';
    const wires = [];
    st.gates.forEach((gt, i) => {
      ['a', 'b'].forEach((k, n) => {
        const s = gt[k]; if (!s) return;
        const [x0, y0] = srcPt(s), x1 = gx(i), y1 = 115 + (n ? 12 : -12);
        const far = s[0] === 'g' && i - +s.slice(1) > 1;
        const cy = far ? (n ? 222 : 10) : null;
        const d = far ? `M${x0} ${y0} C${x0 + 30} ${cy},${x1 - 40} ${cy},${x1} ${y1}` : `M${x0} ${y0} C${(x0 + x1) / 2} ${y0},${(x0 + x1) / 2} ${y1},${x1} ${y1}`;
        wires.push(`<path d="${d}" fill="none" stroke="${col(v[s])}" stroke-width="2.5"/>`);
      });
    });
    g += wires.join('');
    g += `<text x="14" y="50" font-size="26" fill="${col(st.A)}" dominant-baseline="middle">A</text><text x="14" y="180" font-size="26" fill="${col(st.B)}" dominant-baseline="middle">B</text>`;
    st.gates.forEach((gt, i) => {
      const x = gx(i), on = v['g' + i], used = on !== undefined;
      g += `<path d="M${x} 93 H${x + 22} A22 22 0 0 1 ${x + 22} 137 H${x} Z" fill="${used ? '#1a1f2b' : 'none'}" stroke="${used ? C.ink : C.line}" stroke-width="2"/>`;
      g += `<circle cx="${x + 48}" cy="115" r="4" fill="none" stroke="${used ? C.ink : C.line}" stroke-width="2"/>`;
      g += `<text x="${x + 18}" y="78" text-anchor="middle" font-size="21" fill="${used ? (on ? C.gold : C.mute) : C.dim}">G${i + 1}</text>`;
    });
    if (ev.out !== null) { const i = +ev.out.slice(1), x = gx(i) + 52; g += `<path d="M${x} 115 H${Math.min(430, x + 16)}" stroke="${col(ev.value)}" stroke-width="3"/><text x="${Math.min(x + 2, 340)}" y="166" font-size="21" fill="${col(ev.value)}">${esc(t('ch2.svg.out'))} ${ev.value}</text>`; }
    svg.innerHTML = g;
    $('#c2A').textContent = t('ch2.inA', { v: st.A }); $('#c2B').textContent = t('ch2.inB', { v: st.B }); setPressed($('#c2A'), st.A); setPressed($('#c2B'), st.B);
    const mine = M.nandNetTable(st.gates), want = M.TARGETS[st.target], name = t('ch2.tgt.' + st.target);
    let k = 0, h = `<thead><tr><th>A</th><th>B</th><th>${esc(t('ch2.th.target', { name }))}</th><th>${esc(t('ch2.th.mine'))}</th></tr></thead><tbody>`;
    for (let r = 0; r < 4; r++) {
      const a = r >> 1, b = r & 1, m = mine.table[r], ok = m === want[r]; if (ok) k++;
      h += `<tr class="${a === st.A && b === st.B ? 'cur' : ''}"><td>${a}</td><td>${b}</td><td class="${want[r] ? 'one' : 'zero'}">${want[r]}</td><td class="${m === null ? 'unk' : ok ? (m ? 'one' : 'zero') : 'bad'}">${m === null ? '—' : m}</td></tr>`;
    }
    table.innerHTML = h + '</tbody>';
    $('#c2Used').textContent = t('ch2.used', { n: mine.used }); $('#c2Match').textContent = t('ch2.match', { k });
    const min = { NOT: 1, AND: 2, OR: 3, XOR: 4 }[st.target];
    $('#c2Say').innerHTML = mine.used === 0 ? t('ch2.say.empty') : k < 4 ? t('ch2.say.mismatch', { k: 4 - k })
      : t('ch2.say.match', { name, n: mine.used, extra: mine.used <= min ? t('ch2.say.min') : t('ch2.say.notmin', { m: min }) });
  }
  $('#c2A').addEventListener('click', () => { st.A ^= 1; render(); });
  $('#c2B').addEventListener('click', () => { st.B ^= 1; render(); });
  $('#c2Clear').addEventListener('click', () => { st.gates = st.gates.map(() => ({ a: '', b: '' })); render(); });
  $('#c2Solve').addEventListener('click', () => { const s = M.SOLUTIONS[st.target]; st.gates = st.gates.map((g, i) => s[i] ? { ...s[i] } : { a: '', b: '' }); render(); });
  refreshers.push(() => { buildSlots(); render(); });
})();

/* ───────── ch3: eight switches ───────── */
(() => {
  const st = { n: 0, flips: null, last: 'start', w: 0, k: 0 };
  const box = $('#c3Bits'), btns = [];
  for (let i = 7; i >= 0; i--) {
    const d = document.createElement('div'); d.className = 'bit';
    const b = document.createElement('button'); b.type = 'button'; b.dataset.i = i;
    const w = document.createElement('span'); w.className = 'w'; w.textContent = 2 ** i;
    d.appendChild(b); d.appendChild(w); box.appendChild(d); btns.push(b);
    b.addEventListener('click', () => { st.n ^= (1 << i); st.flips = 1; st.last = 'toggle'; st.w = 2 ** i; render(); });
  }
  function render() {
    btns.forEach(b => { const on = (st.n >> +b.dataset.i) & 1; b.textContent = on; b.classList.toggle('lit', !!on); setPressed(b, on); b.setAttribute('aria-label', t('ch3.bitAria', { w: 2 ** +b.dataset.i })); });
    $('#c3Val').textContent = st.n; $('#c3Seen').textContent = bin8(st.n);
    $('#c3Flips').textContent = st.flips === null ? '—' : t('ch3.flips', { n: st.flips });
    $('#c3Say').innerHTML = st.last === 'start' ? t('ch3.say.start') : st.last === 'wrap' ? t('ch3.say.wrap') : st.last === 'inc' ? (st.k ? t('ch3.say.inc', { k: st.k }) : t('ch3.say.inc0'))
      : st.last === 'dec' ? t('ch3.say.dec') : t('ch3.say.toggle', { w: st.w });
  }
  $('#c3Inc').addEventListener('click', () => { const n = st.n; st.flips = M.flipsOnIncrement(n, 8); let k = 0; while (k < 8 && ((n >> k) & 1)) k++; st.k = k; st.n = (n + 1) & 255; st.last = n === 255 ? 'wrap' : 'inc'; render(); });
  $('#c3Dec').addEventListener('click', () => { const n = st.n, nn = (n + 255) & 255; st.flips = M.flipsOnIncrement(nn, 8); st.n = nn; st.last = 'dec'; render(); });
  $('#c3Clr').addEventListener('click', () => { st.n = 0; st.flips = null; st.last = 'start'; render(); });
  refreshers.push(render);
})();

/* ───────── ch4: the ripple-carry adder in time ───────── */
const ch4 = { a: 127, b: 1 };
(() => {
  const cv = $('#c4Time'), sA = $('#c4A'), sB = $('#c4B');
  let res = null, cursor = reduce ? 1e9 : 0;
  function compute() { res = M.timedAdd(ch4.a, ch4.b); cursor = reduce ? 1e9 : 0; o.dirty = true; text(); sweep.dirty = true; }
  function text() {
    $('#c4Ao').textContent = ch4.a; $('#c4Bo').textContent = ch4.b;
    const k = M.carryChain(ch4.a, ch4.b);
    $('#c4Sum').textContent = t(res.cout ? 'ch4.sumOver' : 'ch4.sum', { dec: res.sum });
    $('#c4Chain').textContent = t('ch4.chain', { k }); $('#c4Settle').textContent = t('ch4.settle', { t: res.settle });
    $('#c4Say').innerHTML = k === 0 ? t('ch4.say.chain0', { a: ch4.a, b: ch4.b, t: res.settle }) : t('ch4.say.chain', { a: ch4.a, b: ch4.b, k, t: res.settle });
  }
  const o = reg(cv, {
    step(dt) { if (cursor < 40) { cursor += dt * 10; this.dirty = true; } },
    draw() {
      const { c, w, h } = fit(cv), R = 12, T = 30, B = 26, rows = 9, T_MAX = 34;
      c.font = MONO; const L = Math.max(54, Math.ceil(c.measureText(t('ch4.cv.cout')).width) + 16); // room for the longer English label
      const X = tt => L + (w - L - R) * tt / T_MAX, rh = (h - T - B) / rows;
      const H = res.hist, upto = Math.min(cursor, T_MAX);
      for (let r = 0; r < rows; r++) {
        const y = T + r * rh;
        c.fillStyle = C.mute; c.textAlign = 'right'; c.font = MONO; c.fillText(r < 8 ? 's' + r : t('ch4.cv.cout'), L - 8, y + rh / 2);
        for (let tt = 0; tt < T_MAX; tt++) {
          if (tt > upto) break;
          const val = H[Math.min(tt, H.length - 1)][r];
          c.fillStyle = val ? C.gold : C.off; c.globalAlpha = val ? 0.9 : 0.6;
          c.fillRect(X(tt) + 0.5, y + 3, Math.max(1, X(tt + 1) - X(tt) - 1), rh - 6);
        }
        c.globalAlpha = 1;
        const lc = res.lastChange[r];
        if (lc > 0 && lc <= upto) { c.fillStyle = C.red; c.beginPath(); c.arc(X(lc) + 1, y + rh / 2, Math.min(5, rh / 3), 0, 6.283); c.fill(); }
      }
      if (res.settle <= upto) { c.strokeStyle = C.red; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(X(res.settle), T - 4); c.lineTo(X(res.settle), h - B + 2); c.stroke(); c.setLineDash([]); }
      c.font = FONT; c.fillStyle = C.mute; c.textAlign = 'right'; c.fillText(t('ch4.cv.t'), w - R, 12);
      c.textAlign = 'center'; c.fillStyle = C.dim; [0, 8, 16, 24, 32].forEach(v => c.fillText(v, X(v), h - 10));
    }
  });
  const sweep = { dirty: false };
  ch4.onPair = null;
  const upd = () => { ch4.a = +sA.value; ch4.b = +sB.value; compute(); if (ch4.onPair) ch4.onPair(); };
  sA.addEventListener('input', upd); sB.addEventListener('input', upd);
  $$('#c4Presets button[data-a]').forEach(b => b.addEventListener('click', () => { sA.value = b.dataset.a; sB.value = b.dataset.b; upd(); }));
  $('#c4Replay').addEventListener('click', () => { cursor = reduce ? 1e9 : 0; o.dirty = true; });
  res = M.timedAdd(ch4.a, ch4.b);
  refreshers.push(() => { if (res) text(); });
})();
(() => {
  // every one of the 65,536 sums, computed a slice per frame while the chart is on screen
  const cv = $('#c4Scatter'), counts = []; for (let k = 0; k <= 8; k++) counts.push(new Map());
  let idx = 0, worst = 0, worstN = 0;
  function text() {
    $('#c4Swept').textContent = t('ch4.swept', { n: fmt(idx) });
    $('#c4Worst').textContent = idx ? t('ch4.worst', { t: worst }) : '—'; $('#c4WorstN').textContent = idx ? t('ch4.worstN', { n: worstN }) : '—';
    $('#c4SaySweep').innerHTML = idx < 65536 ? t('ch4.say.sweeping', { n: fmt(idx) }) : t('ch4.say.swept', { t: worst, n: worstN });
  }
  const o = reg(cv, {
    step() {
      if (idx >= 65536) return;
      const t0 = performance.now(), budget = reduce ? 1e9 : 7;
      while (idx < 65536 && performance.now() - t0 < budget) {
        for (let k = 0; k < 64 && idx < 65536; k++, idx++) {
          const a = idx >> 8, b = idx & 255, s = M.settleTime(a, b).settle, ch = M.carryChain(a, b), m = counts[ch];
          m.set(s, (m.get(s) || 0) + 1);
          if (s > worst) { worst = s; worstN = 1; } else if (s === worst) worstN++;
        }
      }
      this.dirty = true; text();
    },
    draw() {
      const { c, w, h } = fit(cv), L = 34, R = 14, T = 34, B = 40, YM = 34;
      const X = k => L + 10 + (w - L - R - 20) * k / 8, Y = s => h - B - (h - T - B) * s / YM;
      c.strokeStyle = C.line; c.beginPath(); c.moveTo(L, T - 6); c.lineTo(L, h - B); c.lineTo(w - R, h - B); c.stroke();
      c.fillStyle = C.dim; c.textAlign = 'right'; [0, 8, 16, 24, 32].forEach(s => { c.fillText(s, L - 6, Y(s)); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(L + 1, Y(s)); c.lineTo(w - R, Y(s)); c.stroke(); });
      c.textAlign = 'center'; for (let k = 0; k <= 8; k++) c.fillText(k, X(k), h - B + 14);
      for (let k = 0; k <= 8; k++) counts[k].forEach((n, s) => { c.fillStyle = 'rgba(99,199,230,.75)'; c.beginPath(); c.arc(X(k), Y(s), Math.min(9, 1.6 + Math.sqrt(n) / 9), 0, 6.283); c.fill(); });
      const k0 = M.carryChain(ch4.a, ch4.b), s0 = M.settleTime(ch4.a, ch4.b).settle;
      c.strokeStyle = C.gold; c.lineWidth = 2; c.beginPath(); c.arc(X(k0), Y(s0), 11, 0, 6.283); c.stroke(); c.lineWidth = 1;
      c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(t('ch4.sw.y'), L + 4, 12); c.textAlign = 'right'; c.fillText(t('ch4.sw.x'), w - R, h - 10);
    }
  });
  ch4.onPair = () => { o.dirty = true; };
  refreshers.push(text);
})();

/* ───────── ch5: subtraction on a 256-step circle ───────── */
(() => {
  const st = { a: 5, b: 7, sub: 1 }, cv = $('#c5Wheel'), sA = $('#c5A'), sB = $('#c5B');
  let r = null;
  function cellsRow(label, n, cls) { let s = `<span class="hd">${esc(label)}</span>`; for (let i = 7; i >= 0; i--) s += `<span class="${(n >> i) & 1 ? 'on' : ''}">${(n >> i) & 1}</span>`; return s; }
  function render() {
    r = M.addSub(st.a, st.b, st.sub);
    $('#c5Ao').textContent = st.a; $('#c5Bo').textContent = st.b;
    $$('[data-c5sub]').forEach(b => setPressed(b, +b.dataset.c5sub === st.sub));
    $('#c5Cells').innerHTML = cellsRow(t('ch5.row.a'), st.a) + cellsRow(t('ch5.row.bx'), r.bInverted) + cellsRow(t('ch5.row.r'), r.result);
    $('#c5U').textContent = r.result; $('#c5S').textContent = signedStr(r.signed); $('#c5V').textContent = t(r.overflow ? 'ui.yes' : 'ui.no');
    const tail = t(r.overflow ? 'ch5.tail.over' : 'ch5.tail.ok');
    $('#c5Say').innerHTML = st.sub ? t('ch5.say.sub', { a: st.a, b: st.b, bx: bin8(r.bInverted), u: r.result, s: signedStr(r.signed), tail }) : t('ch5.say.add', { a: st.a, b: st.b, u: r.result, s: signedStr(r.signed), tail });
    o.dirty = true;
  }
  const o = reg(cv, { draw() {
    const { c, w, h } = fit(cv), cx = w / 2, cy = h / 2 + 4, R = Math.min(w, h) / 2 - 34;
    const ang = n => -Math.PI / 2 + n / 256 * Math.PI * 2, P = (n, rr) => [cx + Math.cos(ang(n)) * rr, cy + Math.sin(ang(n)) * rr];
    c.strokeStyle = C.line; c.lineWidth = 6; c.beginPath(); c.arc(cx, cy, R, 0, 6.283); c.stroke(); c.lineWidth = 1;
    for (let n = 0; n < 256; n += 16) { const [x0, y0] = P(n, R - 7), [x1, y1] = P(n, R + 7); c.strokeStyle = C.dim; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); }
    // the seam between 127 and 128, where the signed reading jumps from +127 to −128
    { const [x0, y0] = P(127.5, R - 14), [x1, y1] = P(127.5, R + 14); c.strokeStyle = C.red; c.lineWidth = 2; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); c.lineWidth = 1; }
    // the step taken: forward by B when adding, backward when subtracting
    const a0 = ang(st.a), steps = st.sub ? -st.b : st.b;
    c.strokeStyle = C.gold; c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, R - 16, a0, a0 + steps / 256 * Math.PI * 2, steps < 0); c.stroke(); c.lineWidth = 1;
    const dot = (n, col) => { const [x, y] = P(n, R); c.fillStyle = col; c.beginPath(); c.arc(x, y, 7, 0, 6.283); c.fill(); };
    dot(st.a, C.cyan); dot(r.result, C.gold);
    c.fillStyle = C.mute; c.textAlign = 'center';
    c.fillText('0', cx, cy - R - 18); c.fillText('128 / −128', cx, cy + R + 20);
    c.textAlign = 'left'; c.fillText('64', cx + R + 12, cy); c.textAlign = 'right'; c.fillText('192', cx - R - 12, cy - 8); c.fillText('−64', cx - R - 12, cy + 8);
  } });
  const upd = () => { st.a = +sA.value; st.b = +sB.value; render(); };
  sA.addEventListener('input', upd); sB.addEventListener('input', upd);
  $$('[data-c5sub]').forEach(b => b.addEventListener('click', () => { st.sub = +b.dataset.c5sub; render(); }));
  $$('[data-c5p]').forEach(b => b.addEventListener('click', () => { const [a, bb, s] = b.dataset.c5p.split(',').map(Number); sA.value = a; sB.value = bb; st.sub = s; upd(); }));
  refreshers.push(render);
})();

/* ───────── ch6: the SR latch ───────── */
(() => {
  const svg = $('#c6Svg'), cv = $('#c6Wave'), RATE = 8, HIST = 48;
  let L = M.srSim({ jitter: 0.2, seed: 11 }), mode = 'real', playing = !reduce, acc = 0, tick = 0;
  let hist = [], lastChange = 0, releaseT = null, flips = 0, script = null;
  const snap = () => ({ s: L.S(), r: L.R(), q: L.q(), qn: L.qn() });
  for (let i = 0; i < HIST; i++) hist.push(snap());
  function oneTick() {
    if (script) { script.n--; if (script.n <= 0) { L.set(0, 0); script = null; releaseT = tick + 1; flips = 0; } }
    const q0 = L.q(), qn0 = L.qn(); L.tick(); tick++;
    if (L.q() !== q0 || L.qn() !== qn0) { lastChange = tick; if (releaseT !== null && L.q() !== q0) flips++; }
    hist.push(snap()); if (hist.length > HIST) hist.shift();
  }
  function status() {
    const s = L.S(), r = L.R();
    if (script || (s && r)) return { k: 'both' };
    if (s) return { k: 'set' }; if (r) return { k: 'reset' };
    if (releaseT !== null) {
      const pending = L.st.cnt[L.m.q] || L.st.cnt[L.m.qn];
      if (L.q() === L.qn() || pending || tick - lastChange < 3) return { k: 'osc' };
      return { k: 'resolved', t: lastChange - releaseT + 1 };
    }
    return { k: 'hold' };
  }
  function render() {
    const v = L.st.v, m = L.m, col = x => (x ? C.gold : C.dim);
    let g = '';
    const line = (d, x) => `<path d="${d}" fill="none" stroke="${col(x)}" stroke-width="2.5"/>`;
    const nand = (x, y, on) => `<path d="M${x} ${y - 24} H${x + 24} A24 24 0 0 1 ${x + 24} ${y + 24} H${x} Z" fill="#1a1f2b" stroke="${C.ink}" stroke-width="2"/><circle cx="${x + 53}" cy="${y}" r="4" fill="none" stroke="${C.ink}" stroke-width="2"/>`;
    const not = (x, y) => `<path d="M${x} ${y - 14} L${x + 26} ${y} L${x} ${y + 14} Z" fill="#1a1f2b" stroke="${C.ink}" stroke-width="2"/><circle cx="${x + 31}" cy="${y}" r="4" fill="none" stroke="${C.ink}" stroke-width="2"/>`;
    g += line('M40 58 H80', v[m.S]) + line('M115 58 H190', v[m.sb]) + line('M40 172 H80', v[m.R]) + line('M115 172 H190', v[m.rb]);
    g += line('M247 70 H320', v[m.q]) + line('M247 160 H320', v[m.qn]);
    // cross-coupling: Q back into the lower gate, Q̄ back into the upper gate
    g += line('M280 70 V96 L170 134 H190', v[m.q]) + line('M280 160 V134 L170 96 H190', v[m.qn]);
    g += not(80, 58) + not(80, 172) + nand(190, 70) + nand(190, 160);
    g += `<text x="14" y="58" font-size="18" dominant-baseline="middle" fill="${col(v[m.S])}">S</text><text x="14" y="172" font-size="18" dominant-baseline="middle" fill="${col(v[m.R])}">R</text>`;
    g += `<text x="328" y="70" font-size="18" dominant-baseline="middle" fill="${col(v[m.q])}">Q = ${v[m.q]}</text><text x="328" y="160" font-size="18" dominant-baseline="middle" fill="${col(v[m.qn])}"><tspan text-decoration="overline">Q</tspan> = ${v[m.qn]}</text>`;
    svg.innerHTML = g;
    $('#c6Q').textContent = v[m.q]; $('#c6Qn').textContent = v[m.qn]; $('#c6Since').textContent = t('ch6.since', { n: tick - lastChange });
    setPressed($('#c6S'), L.S() && !script); setPressed($('#c6R'), L.R() && !script);
    $$('[data-c6mode]').forEach(b => setPressed(b, b.dataset.c6mode === mode));
    $('#c6Play').textContent = t(playing ? 'ui.pause' : 'ui.play');
    const s = status();
    $('#c6Say').innerHTML = s.k === 'hold' ? t('ch6.say.hold', { q: v[m.q] }) : s.k === 'osc' ? t('ch6.say.osc', { n: flips }) : s.k === 'resolved' ? t('ch6.say.resolved', { t: s.t, q: v[m.q] }) : t('ch6.say.' + s.k);
    o.dirty = true;
  }
  const o = reg(cv, {
    step(dt) { if (!playing) return; acc += dt * RATE; let n = Math.floor(acc); acc -= n; if (n > 0) { while (n--) oneTick(); render(); } },
    draw() {
      const { c, w, h } = fit(cv), Lx = 34, R = 8, T = 22, B = 10, rows = [['S', 's'], ['R', 'r'], ['Q', 'q'], ['Q', 'qn']], rh = (h - T - B) / 4;
      const X = i => Lx + (w - Lx - R) * i / (HIST - 1);
      rows.forEach(([lab, k], r) => {
        const y0 = T + r * rh, hi = y0 + 5, lo = y0 + rh - 6;
        c.fillStyle = C.mute; c.textAlign = 'left'; c.font = MONO; c.fillText(lab, 6, (hi + lo) / 2);
        if (k === 'qn') { const wq = c.measureText('Q').width; c.strokeStyle = C.mute; c.beginPath(); c.moveTo(6, (hi + lo) / 2 - 8); c.lineTo(6 + wq, (hi + lo) / 2 - 8); c.stroke(); }
        c.strokeStyle = k === 'q' || k === 'qn' ? C.gold : C.cyan; c.lineWidth = 2; c.beginPath();
        hist.forEach((p, i) => { const y = p[k] ? hi : lo; if (i === 0) c.moveTo(X(i), y); else { c.lineTo(X(i), hist[i - 1][k] ? hi : lo); c.lineTo(X(i), y); } });
        c.stroke(); c.lineWidth = 1;
      });
      c.font = FONT; c.fillStyle = C.mute; c.textAlign = 'right'; c.fillText(t('ch6.cv.t'), w - R, 10);
    }
  });
  const hold = (s, r) => { script = null; releaseT = null; L.set(s, r); render(); };
  $('#c6S').addEventListener('click', () => hold(L.S() && !script ? 0 : 1, 0));
  $('#c6R').addEventListener('click', () => hold(0, L.R() && !script ? 0 : 1));
  $('#c6Both').addEventListener('click', () => { L.set(1, 1); releaseT = null; script = { n: 8 }; render(); });
  $$('[data-c6mode]').forEach(b => b.addEventListener('click', () => { mode = b.dataset.c6mode; L.setJitter(mode === 'real' ? 0.2 : 0); render(); }));
  $('#c6Play').addEventListener('click', () => { playing = !playing; render(); });
  $('#c6Step').addEventListener('click', () => { oneTick(); render(); });
  refreshers.push(render);
})();

/* ───────── ch7: register + adder + clock ───────── */
(() => {
  const cv = $('#c7Wave'), sP = $('#c7P'), sSp = $('#c7Sp'), WIN = 160;
  let sim, hist, prev, wrong, lastWrong, playing = !reduce, acc = 0, recent = 0;
  function reset() { sim = M.counterSim(+sP.value); hist = []; prev = 0; wrong = 0; lastWrong = null; recent = 0; for (let i = 0; i < WIN; i++) record(); }
  function record() { hist.push([sim.clk()].concat(sim.bits())); if (hist.length > WIN) hist.shift(); }
  function oneTick() {
    const end = sim.tick(); record();
    if (end) { const v = sim.value(); if (v !== ((prev + 1) & 255)) { wrong++; lastWrong = { from: prev, to: v }; recent = 3; } else if (recent > 0) recent--; prev = v; }
    return end;
  }
  function render() {
    const P = +sP.value, sp = Math.round(10 ** +sSp.value);
    $('#c7Po').textContent = t('ch7.periodOut', { p: P }); $('#c7Spo').textContent = t('ch7.speedOut', { v: sp });
    const v = sim.value();
    $('#c7Val').textContent = t('ch7.val', { dec: v, bin: bin8(v) }); $('#c7Edges').textContent = sim.edges; $('#c7Wrong').textContent = wrong;
    $('#c7Play').textContent = t(playing ? 'ui.pause' : 'ui.play');
    $('#c7Say').innerHTML = lastWrong ? t('ch7.say.wrong', { p: P, from: lastWrong.from, to: lastWrong.to, next: (lastWrong.from + 1) & 255 })
      : P >= 42 ? t('ch7.say.ok', { p: P }) : P > 32 ? t('ch7.say.okFast', { p: P }) : t('ch7.say.risky', { p: P });
    o.dirty = true;
  }
  const o = reg(cv, {
    step(dt) { if (!playing) return; acc += dt * 10 ** +sSp.value; let n = Math.min(4000, Math.floor(acc)); acc -= Math.floor(acc); if (n > 0) { while (n--) oneTick(); render(); } },
    draw() {
      const { c, w, h } = fit(cv), Lx = 40, R = 8, T = 24, B = 8, rows = 9, rh = (h - T - B) / rows;
      const X = i => Lx + (w - Lx - R) * i / (WIN - 1);
      for (let r = 0; r < rows; r++) {
        const y0 = T + r * rh, hi = y0 + 4, lo = y0 + rh - 5;
        c.fillStyle = C.mute; c.textAlign = 'left'; c.font = MONO; c.fillText(r === 0 ? 'CLK' : 'b' + (r - 1), 4, (hi + lo) / 2);
        c.strokeStyle = r === 0 ? C.cyan : C.gold; c.lineWidth = r === 0 ? 1.5 : 2; c.beginPath();
        hist.forEach((p, i) => { const y = p[r] ? hi : lo; if (i === 0) c.moveTo(X(i), y); else { c.lineTo(X(i), hist[i - 1][r] ? hi : lo); c.lineTo(X(i), y); } });
        c.stroke(); c.lineWidth = 1;
      }
      c.font = FONT; c.fillStyle = C.mute; c.textAlign = 'right'; c.fillText(t('ch7.cv.t'), w - R, 11);
    }
  });
  sP.addEventListener('input', () => { sim.setPeriod(+sP.value); lastWrong = null; render(); });
  sSp.addEventListener('input', render);
  $('#c7Play').addEventListener('click', () => { playing = !playing; render(); });
  $('#c7Step').addEventListener('click', () => { let guard = 500; while (!oneTick() && guard--) { /* one full period */ } render(); });
  $('#c7Load').addEventListener('click', () => { sim.load(120); prev = 120; lastWrong = null; render(); });
  $('#c7Reset').addEventListener('click', () => { reset(); render(); });
  reset();
  refreshers.push(render);
})();

/* ───────── ch8: multiplexers and the ALU ───────── */
(() => {
  const st = { a: 42, b: 42, op: 1 }, sA = $('#c8A'), sB = $('#c8B'), ops = $('#c8Ops');
  [0, 1, 2, 3].forEach(k => { const b = document.createElement('button'); b.type = 'button'; b.dataset.op = k; ops.appendChild(b); b.addEventListener('click', () => { st.op = k; render(); }); });
  function row(label, n, cls) { let s = `<tr class="${cls || ''}"><th scope="row">${esc(label)}</th>`; for (let i = 7; i >= 0; i--) s += `<td class="${(n >> i) & 1 ? 'on' : ''}">${(n >> i) & 1}</td>`; return s + `<td class="dec">${n}</td></tr>`; }
  function render() {
    const r = M.alu(st.a, st.b, st.op);
    $('#c8Ao').textContent = st.a; $('#c8Bo').textContent = st.b;
    $$('#c8Ops button').forEach(b => { b.textContent = t('ch8.op.' + b.dataset.op); setPressed(b, +b.dataset.op === st.op); });
    const pick = st.op < 2 ? 'arith' : st.op === 2 ? 'and' : 'or';
    $('#c8Tab').innerHTML = row(t('ch8.row.a'), st.a) + row(t('ch8.row.b'), st.b) + row(t('ch8.row.arith'), r.arith, pick === 'arith' ? 'pick' : '')
      + row(t('ch8.row.and'), r.and, pick === 'and' ? 'pick' : '') + row(t('ch8.row.or'), r.or, pick === 'or' ? 'pick' : '') + row(t('ch8.row.res'), r.result, 'res');
    $('#c8Res').textContent = r.result; $('#c8Z').textContent = r.z; $('#c8C').textContent = r.c;
    $('#c8Say').innerHTML = st.op === 1 ? t('ch8.say.sub', { cmp: t(st.a === st.b ? 'ch8.cmp.eq' : st.a > st.b ? 'ch8.cmp.gt' : 'ch8.cmp.lt') })
      : st.op === 0 ? t('ch8.say.add', { c: t(r.c ? 'ch8.add.c1' : 'ch8.add.c0') }) : t('ch8.say.logic', { op: t('ch8.op.' + st.op) });
  }
  const upd = () => { st.a = +sA.value; st.b = +sB.value; render(); };
  sA.addEventListener('input', upd); sB.addEventListener('input', upd);
  refreshers.push(render);
})();

/* ───────── ch9: the tiny machine ───────── */
(() => {
  const memBox = $('#c9Mem'), sX = $('#c9X'), sY = $('#c9Y'), sSp = $('#c9Sp');
  let preset = 'mul', image = M.multiplyProgram(+sX.value, +sY.value), Mm = M.machine(image), last = null, sel = 12, touched = -1, playing = false, acc = 0, limitHit = false;
  const cells = [];
  for (let i = 0; i < 16; i++) { const b = document.createElement('button'); b.type = 'button'; memBox.appendChild(b); cells.push(b); b.addEventListener('click', () => { sel = i; render(); }); }
  const opSel = $('#c9EdOp'), adSel = $('#c9EdAddr');
  M.OPS.forEach((op, i) => { const o = document.createElement('option'); o.value = i; o.textContent = op; opSel.appendChild(o); });
  for (let i = 0; i < 16; i++) { const o = document.createElement('option'); o.value = i; o.textContent = i; adSel.appendChild(o); }
  const mnem = byte => { const d = M.decode(byte); return d.name ? (d.name === 'HALT' ? 'HALT' : d.name + ' ' + d.addr) : '?'; };
  function loadImage() { Mm = M.machine(image); last = null; touched = -1; limitHit = false; }
  function render() {
    $('#c9Xo').textContent = sX.value; $('#c9Yo').textContent = sY.value; $('#c9Spo').textContent = t('ch9.speedOut', { v: fmt(10 ** +sSp.value, 10 ** +sSp.value < 10 ? 1 : 0) });
    cells.forEach((b, i) => {
      const byte = Mm.mem[i], text = mnem(byte);
      b.innerHTML = `<span class="ad"><span>${String(i).padStart(2, '0')}</span><i>${byte}</i></span><span class="op">${esc(text)}</span><span class="by">${bin8(byte)}</span>`;
      b.classList.toggle('pc', i === Mm.pc && !Mm.halted); b.classList.toggle('sel', i === sel); b.classList.toggle('touched', i === touched);
      b.setAttribute('aria-label', t('ch9.cellAria', { a: i, text: text + ', ' + byte }));
      setPressed(b, i === sel);
    });
    $('#c9EdTitle').textContent = t('ch9.ed.title', { a: sel, byte: Mm.mem[sel] });
    const d = M.decode(Mm.mem[sel]); opSel.value = d.name ? d.op : 0; adSel.value = d.addr;
    $('#c9PC').textContent = String(Mm.pc) + '  (' + Mm.pc.toString(2).padStart(4, '0') + ')';
    $('#c9IR').textContent = Mm.steps ? bin8(Mm.ir) + ' · ' + mnem(Mm.ir) : '—';
    $('#c9Acc').textContent = Mm.a + '  (' + bin8(Mm.a) + ')'; $('#c9Z').textContent = Mm.z; $('#c9Steps').textContent = Mm.steps; $('#c9Out').textContent = Mm.mem[14];
    $('#c9Run').textContent = t(playing ? 'ui.pause' : 'ui.play');
    $('#c9Step').disabled = Mm.halted; $('#c9Run').disabled = Mm.halted;
    $('#c9Say').innerHTML = limitHit ? t('ch9.say.limit', { n: Mm.steps }) : !last ? t('ch9.say.start') : describe(last);
  }
  function describe(L) {
    const z = t(Mm.z ? 'ch9.z1' : 'ch9.z0'), base = { at: L.at, addr: L.addr, x: L.x, acc: L.acc, n: Mm.steps, byte: bin8(L.byte), z };
    if (!L.op) return t('ch9.say.unknown', base);
    if (L.op === 'JZ') return t(L.jumped ? 'ch9.say.JZ1' : 'ch9.say.JZ0', base);
    return t('ch9.say.' + L.op, base);
  }
  function doStep() {
    if (Mm.halted) return;
    const x = Mm.mem[Mm.mem[Mm.pc] & 15];
    const info = M.step(Mm); info.x = x; info.acc = Mm.a; last = info;
    touched = info.op === 'STORE' ? info.addr : -1;
    if (Mm.halted) playing = false;
    if (!Mm.halted && Mm.steps >= 2000) { playing = false; limitHit = true; }
  }
  reg(memBox, { step(dt) { if (!playing) return; acc += dt * 10 ** +sSp.value; let n = Math.floor(acc); acc -= n; if (n > 0) { while (n-- && playing) doStep(); render(); } } });
  const reload = () => { image = preset === 'mul' ? M.multiplyProgram(+sX.value, +sY.value) : M.countdownProgram(+sY.value); playing = false; loadImage(); render(); };
  sX.addEventListener('input', () => { image[12] = +sX.value; playing = false; loadImage(); render(); });
  sY.addEventListener('input', () => { image[13] = +sY.value; if (preset === 'mul') image[14] = 0; playing = false; loadImage(); render(); });
  sSp.addEventListener('input', render);
  $('#c9Step').addEventListener('click', () => { limitHit = false; doStep(); render(); });
  $('#c9Run').addEventListener('click', () => { limitHit = false; playing = !playing; render(); });
  $('#c9Reset').addEventListener('click', () => { playing = false; loadImage(); render(); });
  $('#c9Mul').addEventListener('click', () => { preset = 'mul'; reload(); });
  $('#c9Cd').addEventListener('click', () => { preset = 'cd'; reload(); });
  const write = v => { v = v & 255; image[sel] = v; Mm.mem[sel] = v; touched = sel; render(); };
  $('#c9EdWrite').addEventListener('click', () => write((+opSel.value << 4) | +adSel.value));
  $('#c9EdRawWrite').addEventListener('click', () => { const v = parseInt($('#c9EdRaw').value, 10); if (v >= 0 && v <= 255) write(v); });
  refreshers.push(render);
})();

/* ───────── ch10: fractions in finite switches ───────── */
(() => {
  const ia = $('#c10a'), ib = $('#c10b'), sM = $('#c10M'), rows = $('#c10Rows'), cv = $('#c10Chart'), E = 11;
  let series = [], cur = null;
  function bitsHtml(f) { const b = M.fieldBits(f); return `<span class="s">${b.sign}</span> <span class="e">${b.exp}</span> <span class="m">${b.frac}</span>`; }
  function frow(label, f) { return `<div class="frow"><div>${esc(label)}</div><div class="fb">${bitsHtml(f)}</div><div class="fv">${esc(t('ch10.exact'))} ${f.inf ? '∞' : M.exactDecimal(f.m, f.s)}</div></div>`; }
  function render() {
    const m = +sM.value, a = ia.value.trim(), b = ib.value.trim();
    $('#c10Mo').textContent = t('ch10.mOut', { m });
    cur = M.floatSum(a, b, E, m);
    if (!cur) { rows.innerHTML = ''; series = []; $('#c10Eq').textContent = '—'; $('#c10Count').textContent = '—'; $('#c10Say').innerHTML = t('ch10.bad'); o.dirty = true; return; }
    series = []; for (let k = 2; k <= 52; k++) { const r = M.floatSum(a, b, E, k); series.push({ k, eq: r.equal, u: r.ulps }); }
    const nEq = series.filter(s => s.eq).length;
    rows.innerHTML = `<div class="frow" style="background:transparent;padding:0 2px">${esc(t('ch10.bitsCap'))}</div>` + frow(t('ch10.row.a', { v: a }), cur.fa) + frow(t('ch10.row.b', { v: b }), cur.fb) + frow(t('ch10.row.sum'), cur.sum) + frow(t('ch10.row.c', { c: cur.exactSum }), cur.fc);
    $('#c10Eq').textContent = t(cur.equal ? 'ui.yes' : 'ui.no'); $('#c10Count').textContent = t('ch10.count', { n: nEq });
    const special = m === 52 && /^0?\.10*$/.test(a) && /^0?\.20*$/.test(b);
    $('#c10Say').innerHTML = cur.equal ? t('ch10.say.eq', { m, c: cur.exactSum }) : special ? t('ch10.say.ne52')
      : t('ch10.say.ne', { m, c: cur.exactSum, k: Math.abs(cur.ulps), dir: t(cur.ulps > 0 ? 'ch10.dir.up' : 'ch10.dir.down') });
    o.dirty = true;
  }
  const o = reg(cv, { draw() {
    const { c, w, h } = fit(cv), L = 30, R = 12, T = 30, B = 26;
    const X = k => L + 6 + (w - L - R - 12) * (k - 2) / 50, maxU = Math.max(1, ...series.map(s => Math.abs(s.u))), Y = u => h - B - (h - T - B) * u / maxU;
    c.strokeStyle = C.line; c.beginPath(); c.moveTo(L, T - 4); c.lineTo(L, h - B); c.lineTo(w - R, h - B); c.stroke();
    c.fillStyle = C.dim; c.textAlign = 'right'; c.fillText('0', L - 6, h - B); c.fillText(String(maxU), L - 6, Y(maxU));
    const bw = Math.max(2, (w - L - R) / 60);
    series.forEach(s => {
      const x = X(s.k);
      if (s.eq) { c.fillStyle = C.green; c.beginPath(); c.arc(x, h - B - 4, Math.min(3, bw / 1.5), 0, 6.283); c.fill(); }
      else { c.fillStyle = C.red; const y = Y(Math.abs(s.u)); c.fillRect(x - bw / 2, y, bw, h - B - y); }
    });
    if (series.length) { const x = X(+sM.value); c.strokeStyle = C.gold; c.lineWidth = 2; c.beginPath(); c.moveTo(x, T - 4); c.lineTo(x, h - B); c.stroke(); c.lineWidth = 1; }
    c.fillStyle = C.dim; c.textAlign = 'center'; [2, 10, 23, 52].forEach(k => c.fillText(k, X(k), h - 10));
    c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(t('ch10.cv.y'), L + 4, 12); c.textAlign = 'right'; c.fillText(t('ch10.cv.x'), w - R, 12);
  } });
  ia.addEventListener('input', render); ib.addEventListener('input', render); sM.addEventListener('input', render);
  refreshers.push(render);
})();

/* ───────── ch11: the ledger ───────── */
(() => {
  const L = M.ledger(), MN = M.machineNands();
  function render() {
    const rows = [['ch11.l.nand', 1], ['ch11.l.xor', L.xor], ['ch11.l.fa', L.fullAdder], ['ch11.l.adder', L.adder8], ['ch11.l.addsub', L.addSub8],
      ['ch11.l.latch', L.srLatch], ['ch11.l.dff', L.dff], ['ch11.l.counter', L.counter8], ['ch11.l.alu', L.alu8], ['ch11.l.machine', MN.total]];
    $('#c11Ledger').innerHTML = '<tbody>' + rows.map(([k, n]) => `<tr><td>${t(k)}</td><td class="n">${esc(t('ch11.l.unit', { n: fmt(n) }))}</td></tr>`).join('') + '</tbody>';
    const tr = MN.total * 4, ratio = 16e9 / tr;
    const p2 = document.querySelector('[data-i18n-html="ch11.p2"]');
    p2.innerHTML = t('ch11.p2', { m: fmt(MN.total), t: fmt(tr), r: fmt(Math.round(ratio / 1e4) * 1e4) });
    const d = new Date(M.int32SecondsLimit() * 1000), p = n => String(n).padStart(2, '0');
    const date = t('ch11.date', { y: d.getUTCFullYear(), mo: d.getUTCMonth() + 1, monEn: d.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' }), d: d.getUTCDate(), hms: p(d.getUTCHours()) + ':' + p(d.getUTCMinutes()) + ':' + p(d.getUTCSeconds()) });
    document.querySelector('[data-i18n-html="ch11.use.1"]').innerHTML = t('ch11.use.1', { date });
  }
  refreshers.push(render);
})();

applyLang();
if (!reduce) document.documentElement.style.scrollBehavior = 'smooth';
requestAnimationFrame(loop);
})();
