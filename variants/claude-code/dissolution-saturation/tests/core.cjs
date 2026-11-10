'use strict';
// Dissolution & saturation (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const both = (key, s) => { for (const l of ['zh', 'en']) ok(STRINGS[l][key].includes(s), `${l}.${key} quotes ${s}`); };
const range = (a, b, d) => { const o = []; for (let v = a; v <= b + 1e-9; v += d) o.push(Math.round(v * 1e6) / 1e6); return o; };
const fmt = (v, d = 1) => M.trim(M.fix(v, d));
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
const slider = id => { const m = html.match(new RegExp(`id="${id}"[^>]*min="([^"]+)" max="([^"]+)" step="([^"]+)" value="([^"]+)"`)); return { min: +m[1], max: +m[2], step: +m[3], value: +m[4] }; };
const SUBS = ['NaCl', 'KNO3', 'CaOH2'];

// ---- number formatting: only trailing zeros after a decimal point are trimmed ----
ok(fmt(90, 0) === '90' && fmt(36.0, 1) === '36' && fmt(31.6, 1) === '31.6' && fmt(0, 2) === '0' && fmt(100, 1) === '100', 'trim keeps integer zeros');

// ---- solubility table ----
near(M.S('NaCl', 20), 36, 1e-12, 'NaCl 20 °C'); near(M.S('KNO3', 20), 31.6, 1e-12, 'KNO3 20 °C');
for (const sub of SUBS) for (let i = 0; i <= 10; i++) near(M.S(sub, i * 10), M.TABLE[sub][i], 1e-12, 'table node ' + sub);
for (const sub of ['NaCl', 'KNO3']) for (let T = 0; T < 100; T++) ok(M.S(sub, T + 1) >= M.S(sub, T), sub + ' rises with T');
for (let T = 0; T < 100; T++) ok(M.S('CaOH2', T + 1) <= M.S('CaOH2', T), 'Ca(OH)2 falls with T');

// ---- step 0: add until it stops ----
both('s0hint', '36 g'); both('s0hint', '31.6 g'); both('s0hint', '200 g');
{ const sm = slider('m0'), sw = slider('w0'); ok(sm.value === 40 && sw.value === 100, 'defaults 40 g in 100 g');
  for (const sub of ['NaCl', 'KNO3']) for (const w of range(sw.min, sw.max, sw.step)) for (const m of range(sm.min, sm.max, sm.step)) {
    const r = M.mix(sub, 20, m, w);
    near(r.cap, M.S(sub, 20) * w / 100, 1e-12, 'cap ∝ water');
    near(r.dissolved + r.solid, m, 1e-12, 'mass conserved');
    ok(r.saturated === (m >= r.cap - 1e-12) && (r.solid > 1e-9) === (m > r.cap + 1e-9), 'saturated iff m ≥ cap');
    ok(r.cap <= 100, 'capacity fits the 0–100 g mass scale');
  }
  ok(!M.mix('NaCl', 20, 35, 100).saturated && M.mix('NaCl', 20, 36, 100).saturated && M.mix('NaCl', 20, 36, 100).solid === 0, 'NaCl: solid first appears after 36 g (36 is exactly saturated)');
  ok(M.mix('NaCl', 20, 40, 100).solid > 0 && M.mix('NaCl', 20, 40, 200).solid === 0, 'doubling the water dissolves the default 40 g');
  near(M.mix('NaCl', 20, 0, 200).cap, 2 * M.mix('NaCl', 20, 0, 100).cap, 1e-12, 'limit doubles with the water');
}

// ---- step 1: dynamic equilibrium (seeded particle model) ----
both('s1e', '0.1 g'); both('c1a', '0.1 g'); near(M.P.GRAM, 0.1, 0, 'each dot 0.1 g'); both('s1e', '36 g'); both('s1e', '4'); both('s1lgCap', '36 g'); both('s1hint', '36 g'); both('s1hint', '30 g'); both('tag1', '3 g');
near(M.P.CAP * M.P.GRAM, 36, 1e-12, 'model limit 36 g'); near(M.P.CAP * M.P.GRAM, M.S('NaCl', 20), 1e-12, 'limit = step 0 solubility');
near(M.P.KD * M.P.GRAM, 3.6, 1e-12, 'dissolving rate while solid is present: 3.6 g/s');
{ const sl = slider('m1'); ok(sl.value === 48, 'default 48 g');
  for (const g of range(sl.min, sl.max, sl.step)) {
    ok(Math.abs(g / M.P.GRAM - Math.round(g / M.P.GRAM)) < 1e-9, 'slider grams are whole particles');
    const s = M.makeSim(g).run(90), cap = 36;
    ok(Math.max(...s.hist.map(h => h.dissolved)) < 60, 'dissolved stays under the 60 g axis');
    const r = M.smoothRates(s).filter(q => q.t >= 1);
    ok(Math.max(...r.map(q => Math.max(q.d, q.c))) < 6, 'rates under the 6 g/s axis');
    near((s.dis.length + s.solid.length) * M.P.GRAM, g, 1e-9, 'particles conserved');
    if (g <= cap) {
      ok(s.solid.length === 0 && s.dis.length * M.P.GRAM === g, g + ' g: all dissolves');
      const last = r[r.length - 1]; ok(last.d === 0 && last.c === 0, 'rates fall to zero once the solid is gone');
    } else {
      ok(s.solid.length > 0, g + ' g: solid remains at 90 s');
      const tail = s.hist.filter(h => h.t >= 40), mean = tail.reduce((a, h) => a + h.dissolved, 0) / tail.length;
      near(mean, cap, 2.5, 'dissolved settles around 36 g');
      ok(s.hist.some(h => h.t < 40 && h.dissolved >= cap), 'reaches the limit well inside the run');
      const rt = r.filter(q => q.t >= 40), md = rt.reduce((a, q) => a + q.d, 0) / rt.length, mc = rt.reduce((a, q) => a + q.c, 0) / rt.length;
      ok(Math.abs(md - mc) / md < 0.1, 'dissolving and crystallising rates match at equilibrium');
      ok(md > 3, 'dissolving has not stopped');
      ok(r.filter(q => q.t <= 3).every(q => q.c < q.d), 'early on dissolving outpaces crystallising');
    }
  }
  // tagged crystal: solid grows by 3 g, dissolved mass is unchanged on average, tags appear in the water
  const s = M.makeSim(48).run(45), before = s.solid.length; s.addTagged(3);
  near((s.solid.length - before) * M.P.GRAM, 3, 1e-9, 'tag adds 3 g of solid');
  s.run(90);
  const tags = s.dis.filter(p => p.tag).length + s.solid.filter(p => p.tag).length;
  ok(tags === 30 && s.dis.filter(p => p.tag).length >= 15, 'tagged particles turn up in the water');
  const tail = s.hist.filter(h => h.t >= 50), mean = tail.reduce((a, h) => a + h.dissolved, 0) / tail.length;
  near(mean, 36, 2.5, 'dissolved mass unchanged after the tag');
  // long run: the dissolved mass averages the 36 g limit
  { const L = M.makeSim(60).run(600), lt = L.hist.filter(h => h.t >= 100), lm = lt.reduce((a, h) => a + h.dissolved, 0) / lt.length;
    near(lm, 36, 0.5, 'long-run mean dissolved mass'); }
  // determinism (fixed seed)
  ok(JSON.stringify(M.makeSim(48).run(20).hist) === JSON.stringify(M.makeSim(48).run(20).hist), 'seeded runs repeat');
}

// ---- step 2: heating ----
{ const Tall = M.dissolveAllT('KNO3', 60); near(Tall, 37.85, 0.01, 'KNO3 60 g all dissolves at 37.85 °C');
  ok(fmt(Tall, 0) === '38', 'text quotes about 38 °C');
  ok(M.mix('KNO3', Tall - 0.5, 60, 100).solid > 0 && M.mix('KNO3', Tall + 0.5, 60, 100).solid === 0, 'crossing the 60 g line');
  const cr = M.crossing('KNO3', 'NaCl'); near(cr, 23.17, 0.01, 'curves cross'); ok(fmt(cr, 0) === '23', 'text quotes about 23 °C');
  for (let T = 0; T < cr - 0.01; T += 0.5) ok(M.S('NaCl', T) > M.S('KNO3', T), 'below the crossing NaCl dissolves more');
  for (let T = Math.ceil(cr); T <= 100; T += 0.5) ok(M.S('KNO3', T) > M.S('NaCl', T), 'above it KNO3 dissolves more');
  for (let T = 0; T <= 100; T++) ok(M.S('NaCl', T) < 40 && M.mix('NaCl', T, 60, 100).solid > 0, 'NaCl stays under 40 g; 60 g never all dissolves');
  ok(M.S('KNO3', 100) < 260, 'y axis 260 g holds the curve');
  ok(slider('t2').value === 20 && M.mix('KNO3', 20, 60, 100).solid > 0, 'default 20 °C leaves solid');
  both('s2e', '60 g'); both('s2extraN', '40 g'); both('s2hint', '{Tall}'); both('s2hint', '{cross}');
}

// ---- step 3: saturated vs concentrated ----
{ const sm = slider('m3'), st = slider('t3');
  for (const sub of SUBS) for (const T of range(st.min, st.max, st.step)) for (const m of range(sm.min, sm.max, sm.step)) {
    const r = M.mix(sub, T, m, 100);
    ok(r.fraction * 100 < 75, 'fraction under the 75% axis');
    ok(r.fraction <= r.satFraction + 1e-12, 'never above the saturated fraction');
    if (r.saturated) near(r.fraction, M.S(sub, T) / (100 + M.S(sub, T)), 1e-12, 'saturated fraction = S/(100+S)');
    if (sub === 'CaOH2') ok(r.fraction < 0.002, 'Ca(OH)2 stays under 0.2%');
    if (!r.saturated) near(r.fraction, m / (100 + m), 1e-12, 'unsaturated lines coincide: m/(100+m)');
  }
  const k = M.mix('KNO3', 60, 50, 100); ok(!k.saturated && fmt(k.fraction * 100, 0) === '33', 'KNO3 60 °C, 50 g: unsaturated, 33%');
  const q = M.mix('KNO3', 20, 25, 100); ok(!q.saturated && fmt(q.fraction * 100, 0) === '20', 'quiz: 25 g KNO3 = 20%, unsaturated');
  const c = M.mix('CaOH2', 20, 1, 100); ok(c.saturated && fmt(c.fraction * 100, 2) === '0.16', 'quiz: saturated Ca(OH)2 ≈ 0.16%');
  ok(q.fraction > c.fraction, 'quiz answer B');
  both('s3hint', '0.2%'); both('s3e', '(100 + m)'); both('s3hint', '33%'); both('s3hint', '60 °C'); both('s3hint', '50 g'); both('correct', '25 ÷ 125'); both('quizPrompt', '25 g');
  ok(/value="b"/.test(html) && /choice\.value === 'b'/.test(app), 'quiz checks option b');
}

// ---- step 4: getting the solute back ----
{ ok(fmt(M.S('KNO3', 80), 0) === '169' && fmt(M.S('NaCl', 80), 1) === '38.4', 'saturated at 80 °C: 169 g and 38.4 g');
  const k = M.crystallise('KNO3', 80, 100, 20, 0), n = M.crystallise('NaCl', 80, 100, 20, 0);
  near(k.out, 137.4, 1e-9, 'KNO3 80→20 °C'); near(n.out, 2.4, 1e-9, 'NaCl 80→20 °C');
  ok(fmt(k.share * 100, 0) === '81' && fmt(n.share * 100, 0) === '6', 'shares 81% and 6%');
  const st = slider('t4'), se = slider('e4');
  for (const T of range(st.min, st.max, st.step)) for (const e of range(se.min, se.max, se.step)) for (const sub of ['KNO3', 'NaCl']) {
    const r = M.crystallise(sub, 80, 100, T, e);
    ok(r.out >= 0 && r.share >= 0 && r.share <= 1, 'share in [0, 1]');
    near(r.keep + r.out, r.d0, 1e-9, 'kept + crystallised = original');
    if (T === 80) near(r.share, e / 100, 1e-12, 'evaporation alone: share = water removed');
  }
  ok(M.crystallise('KNO3', 80, 100, 80, 0).out === 0, 'nothing crystallises before acting');
  both('s4e', '{k0}'); both('s4e', '{n0}'); both('s4hint', '{kp20}'); both('s4hint', '{np20}'); both('s4hint', '80 °C'); both('s4hint', '20 °C');
}

// ---- static params in app.js reproduce the quoted values ----
for (const [k, expr] of [['Tall', "dissolveAllT('KNO3', 60)"], ['cross', "crossing('KNO3', 'NaCl')"], ['kp20', "crystallise('KNO3', 80, 100, 20, 0)"], ['wk', "mix('KNO3', 20, 25, 100)"], ['wc', "mix('CaOH2', 20, 1, 100)"]]) ok(app.includes(k + ':') && app.includes(expr), 'static param ' + k);

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) ok(!/左图|右图|left (panel|chart|plot)|right (panel|chart|plot)/i.test(Object.values(STRINGS[l]).join(' ')), 'no left/right figure references');

// ---- keys, controls, links ----
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'[,)]/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const sub of SUBS) ok(STRINGS.zh['nm' + sub] && STRINGS.en['nm' + sub], 'name key nm' + sub);
for (const id of ['sub0NaCl', 'sub0KNO3', 'm0', 'w0', 'm1', 'run1', 'tag1', 'reset1', 'sub2NaCl', 'sub2KNO3', 't2', 'sub3NaCl', 'sub3KNO3', 'sub3CaOH2', 'm3', 't3', 'checkQuiz', 't4', 'e4']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard') && !app.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder + css');
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../chemistry/solutions/dissolution-saturation/index.html')), 'comparison link target exists');
for (let i = 0; i <= 5; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);
ok(!html.includes('id="step6"'), 'six steps');
ok(STRINGS.zh.tagline.includes('六步') && STRINGS.en.tagline.includes('six steps'), 'tagline step count');

console.log(`PASS dissolution-saturation core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · KNO3 all dissolves at ${M.dissolveAllT('KNO3', 60).toFixed(2)} °C · curves cross at ${M.crossing('KNO3', 'NaCl').toFixed(2)} °C`);
