'use strict';
// Float & sink (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const both = (key, ...subs) => { for (const l of ['zh', 'en']) for (const s of subs) ok(STRINGS[l][key].includes(s), `${l}.${key} quotes ${s}`); };
// same formatter as app.js
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d); return d > 0 ? s.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') : s; };
ok(fmt(90, 0) === '90' && fmt(100, 0) === '100' && fmt(5.2174, 2) === '5.22' && fmt(6, 2) === '6' && fmt(7.9, 1) === '7.9', 'formatter keeps integer zeros');

// ---- settle(): floating objects displace their own weight; sinking ones their full volume ----
for (let m = 1; m <= 200; m += 7) for (let v = 1; v <= 200; v += 11) for (const rho of [1, 1.025, 1.15]) {
  const s = M.settle(m, v, rho);
  near(s.same, v * rho, 1e-12, 'same-size liquid weight');
  if (m < v * rho) { ok(s.state === 'float', 'lighter floats'); near(s.displaced, m, 1e-12, 'floating: displaced = own weight'); near(s.fraction, m / (v * rho), 1e-12, 'fraction'); near(s.displacedVol, s.fraction * v, 1e-9, 'displaced volume = fraction × size'); }
  else if (m > v * rho) { ok(s.state === 'sink' && s.fraction === 1, 'heavier sinks'); near(s.displaced, v * rho, 1e-12, 'sunk: displaced = full size'); }
}

// ---- step 0: six objects ----
const O = Object.fromEntries(M.OBJECTS.map(o => [o.id, o]));
const st = id => M.settle(O[id].mass, O[id].vol);
ok(M.OBJECTS.length === 6, 'six objects');
ok(st('log').state === 'float' && st('apple').state === 'float' && st('ice').state === 'float', 'log, apple, ice float');
ok(st('nail').state === 'sink' && st('eraser').state === 'sink' && st('stone').state === 'sink', 'nail, eraser, stone sink');
// the hint's contrast: the log is the heaviest object yet floats; the nail is the lightest yet sinks
ok(M.OBJECTS.every(o => o.mass <= O.log.mass) && M.OBJECTS.every(o => o.mass >= O.nail.mass), 'log heaviest, nail lightest');
both('s0hint', '7.9'); ok(STRINGS.zh.s0hint.includes('10000') && STRINGS.en.s0hint.includes('10,000'), 's0hint quotes the log mass');
ok(Math.round(st('log').fraction * 100) === 50 && Math.round(st('apple').fraction * 100) === 80 && Math.round(st('ice').fraction * 100) === 92, 'floating fractions 50/80/92 %');
ok(M.OBJECTS.every(o => Math.abs(o.mass - o.vol) > 1e-9), 'no object hovers (balance always tips)');

// ---- step 1: pushing the block ----
near(M.floatDepth(), 3, 1e-12, 'block floats 3 cm deep');
both('s1hint', '3 cm', '300 cm³');
const d1 = { min: 0, max: 5, step: 0.25 };
ok(d1.max === M.BLOCK.height, 'slider ends where the block is fully under');
for (let d = d1.min; d <= d1.max + 1e-9; d += d1.step) {
  const P = M.push(d);
  near(P.vol, 100 * d, 1e-9, 'vol = base × depth'); near(P.up, P.vol, 1e-9, 'push = displaced grams'); near(P.rise, P.vol / 400, 1e-12, 'rise = vol / tank area');
  if (d < 3 - 1e-9) ok(P.hand < 0, 'shallower than 3 cm: hand holds it up');
  else if (d > 3 + 1e-9) ok(P.hand > 0, 'deeper than 3 cm: hand pushes down');
  else near(P.hand, 0, 1e-9, 'at 3 cm no hand');
}
near(M.push(5).up, 500, 1e-9, 'fully under: 500 g'); near(M.push(5).rise, 1.25, 1e-12, 'max rise 1.25 cm');
// the slider's initial value (1 cm) is in the "hold it up" regime
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
ok(/id="d1"[^>]*min="0" max="5" step="0.25" value="1"/.test(html), 'step 1 slider range');

// ---- step 2: ball or boat ----
ok(/id="v2"[^>]*min="60" max="180" step="10" value="60"/.test(html), 'step 2 slider range');
ok(M.CLAY.vol === 60 && M.CLAY.mass === 90, 'clay 90 g, 60 cm³');
both('s2e', '90', '60 cm³');
for (let v = 60; v <= 180; v += 10) {
  const B = M.boat(v);
  near(B.maxUp, v, 1e-12, 'most it can hold up = outer size in grams');
  if (v < 90) ok(B.state === 'sink', `outer ${v} sinks`); else if (v === 90) ok(B.state === 'hover' && B.fraction === 1, '90: rim at the water');
  else { ok(B.state === 'float', `outer ${v} floats`); near(B.displaced, 90, 1e-12, 'floating boat displaces 90 g'); near(B.fraction, 90 / v, 1e-12, 'height fraction = 90 / outer'); }
}
ok(M.boat(60).state === 'sink', 'solid ball sinks');
ok(STRINGS.zh.s2hint.includes('拖到 90') && STRINGS.en.s2hint.includes('at 90'), 's2hint names 90');

// ---- step 3: submarine ----
ok(/id="w3"[^>]*min="0" max="40" step="2" value="0"/.test(html), 'step 3 slider range');
ok(M.SUB.outer === 100 && M.SUB.empty === 80 && M.SUB.tankMax === 40, 'sub 100 cm³, 80 g, tank 0–40 g');
for (let w = 0; w <= 40; w += 2) {
  const S = M.sub(w); near(S.total, 80 + w, 1e-12, 'total weight'); near(S.maxUp, 100, 1e-12, 'max up 100 g');
  ok(S.state === (w < 20 ? 'float' : w === 20 ? 'hover' : 'sink'), `tank ${w} g state`);
}
ok(M.sub(18).state === 'float' && M.sub(20).state === 'hover' && M.sub(22).state === 'sink', '18 floats, 20 hovers, 22 sinks');
both('s3hint', '20', '18', '2');
// the exposed part shrinks with every 2 g (s3hint): fraction increases strictly while floating
for (let w = 2; w < 20; w += 2) ok(M.sub(w).fraction > M.sub(w - 2).fraction, 'more water → deeper');

// ---- step 4: fresh / sea / very salty water ----
const L = M.LIQUIDS;
ok(fmt(M.cupWeight(L.fresh), 1) === '100' && fmt(M.cupWeight(L.sea), 1) === '102.5' && fmt(M.cupWeight(L.brine), 1) === '115', 'cup weights 100/102.5/115');
both('s4e', '102.5', '115', '600', '56', '60');
const drafts = [L.fresh, L.sea, L.brine].map(r => fmt(M.shipDraft(r), 2));
assert.deepEqual(drafts, ['6', '5.85', '5.22']); checks++;
both('s4hint', '6 cm', '5.85 cm', '5.22 cm');
ok(M.shipDraft(L.brine) < M.SHIP.height, 'ship never swamps');
const egg = r => M.settle(M.EGG.mass, M.EGG.vol, r);
ok(egg(L.fresh).state === 'sink' && egg(L.sea).state === 'sink' && egg(L.brine).state === 'float', 'egg sinks in fresh and sea water, floats in brine');
ok(egg(L.brine).fraction > 0.9 && egg(L.brine).fraction < 1, 'egg in brine shows only a little bit');

// ---- quiz ----
const q = M.settle(M.QUIZ.mass, M.QUIZ.vol);
ok(q.state === 'float' && fmt(q.displaced, 0) === '30' && Math.round(q.fraction * 100) === 60, 'quiz: floats, 30 g, 60 %');
ok(app.includes("choice.value === 'c'"), 'answer c is the one marked right');
both('quizC', '30'); both('quizB', '50');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['noGuess']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/左图|右图|左边|右边|left chart|right chart|left panel|right panel|on the left|on the right/i.test(v), `no left/right chart wording in ${l}.${k}`);

// ---- every key referenced in HTML/app exists ----
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'(?!\s*\+)/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const o of M.OBJECTS) ok(STRINGS.zh['obj_' + o.id] !== undefined, 'object name ' + o.id);
for (const id of ['objButtons', 'guessFloat', 'guessSink', 'drop0', 'd1', 'let1', 'v2', 'w3', 'lqFresh', 'lqSea', 'lqBrine', 'checkQuiz']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('../../../page-provenance.css') && html.includes('<!-- page-provenance -->'), 'provenance hooks');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(html.includes('href="../../../physics/matter/float-sink/"') && fs.existsSync(path.join(dir, '../../../physics/matter/float-sink/index.html')), 'comparison link target exists');
for (let i = 0; i <= 5; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS float-sink core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
