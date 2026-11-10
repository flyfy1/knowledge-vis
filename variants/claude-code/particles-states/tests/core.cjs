'use strict';
// Particles & states (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes against the simulation in model.js; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b}`);
// seeds 1–5 are the "several random starts" of the text; 11–15 are the ones the page itself uses
const SEEDS = [1, 2, 3, 4, 5, 11, 12, 13, 14, 15];
const settle = (seed, heater, n = 5000) => { const s = M.createSim({ seed, heater: 0.1 }); M.run(s, 1500); s.heater = heater; M.run(s, n); return s; };

// ---- conservation and set-up ----
for (const seed of SEEDS) {
  const s = M.createSim({ seed, heater: 0.1 });
  ok(s.N === 96 && M.aliveCount(s) === 96, '96 particles');
  ok(s.lid === true, 'lid closed by default');
}

// ---- steps 1, 2, 5: which state each heater setting gives, at every sample of a long run after settling ----
// (s1hint: ≤ 20 still solid; s2hint: 20 solid, 35 liquid, 25 flickers; s5hint: ≤ 70 liquid, ≥ 180 gas, 80–150 flickers)
const STATE_AT = [[0.05, 'solid'], [0.1, 'solid'], [0.15, 'solid'], [0.2, 'solid'], [0.35, 'liquid'], [0.5, 'liquid'], [0.6, 'liquid'], [0.7, 'liquid'], [1.8, 'gas'], [2.2, 'gas'], [2.5, 'gas']];
const byHeater = {};
for (const seed of SEEDS) for (const [h, want] of STATE_AT) {
  const s = settle(seed, h, h >= 1.5 ? 12000 : 6000); let sumT = 0;
  for (let k = 0; k < 24; k++) {
    M.run(s, 500);
    assert.equal(M.stateOf(s), want, `seed ${seed} heater ${h} sample ${k}`); checks++;
    // the temperature reading is computed from velocities; it wobbles around the setting (s1e "approaches the setting")
    near(M.tempReading(s), 100 * h, 0.12 * 100 * h, `reading near setting, seed ${seed} h ${h}`); sumT += M.tempReading(s);
  }
  near(sumT / 24, 100 * h, 0.03 * 100 * h, `mean reading ≈ setting, seed ${seed} h ${h}`);
  ok(M.aliveCount(s) === 96 && s.escaped === 0, 'closed lid keeps all 96');
  (byHeater[h] = byHeater[h] || []).push({ j: M.jiggle(s), psi: s.psiEma, top: M.height90(s) });
}
// the transition band 80–150 really is mixed: across the seeds both names occur at 100
{ const seen = new Set(); for (const seed of SEEDS) { const s = settle(seed, 1.0, 6000); for (let k = 0; k < 24; k++) { M.run(s, 500); seen.add(M.stateOf(s)); } } ok(seen.has('liquid') && seen.has('gas'), 'heater 100 flickers between liquid and gas'); }
const avg = (h, k) => byHeater[h].reduce((a, q) => a + q[k], 0) / byHeater[h].length;
// s1: hotter → jiggles further from its seat (5 → 25 in the slider range)
for (const [a, b] of [[0.05, 0.1], [0.1, 0.15], [0.15, 0.2]]) ok(avg(b, 'j') > avg(a, 'j'), `mean jiggle grows ${a} → ${b}`);
// s2: orderliness falls below the 0.68 solid line once melted
ok(avg(0.2, 'psi') >= M.PSI_SOLID && avg(0.35, 'psi') < M.PSI_SOLID, 'ψ6 crosses 0.68 between 20 and 35');
{ const seen = new Set(); for (const seed of SEEDS) { const s = settle(seed, 0.25, 6000); for (let k = 0; k < 24; k++) { M.run(s, 500); seen.add(M.stateOf(s)); } } ok(seen.has('solid') && seen.has('liquid'), 'heater 25 flickers between solid and liquid'); }
ok(/max="20"/.test(require('node:fs').readFileSync(require('node:path').join(dir, 'index.html'), 'utf8').match(/id="h1"[^>]*/)[0]), 'step-1 slider stops at 20');
ok(M.PSI_SOLID === 0.68 && M.GAS_CLUSTER === 0.5, 'thresholds quoted in s2e');
// s5: gas fills the upper box (90 % height) while liquid stays near the bottom; box height 22
ok(M.P.BH === 22, 'box height 22 (s5readout)');
ok(avg(2.2, 'top') > avg(0.6, 'top') + 6, 'gas spreads upward: ' + avg(2.2, 'top').toFixed(1) + ' vs ' + avg(0.6, 'top').toFixed(1));

// ---- s2hint: dragging back to 10 re-forms a solid ----
for (const seed of SEEDS) { const s = settle(seed, 0.4); assert.equal(M.stateOf(s), 'liquid'); s.heater = 0.1; M.run(s, 6000); assert.equal(M.stateOf(s), 'solid', 'refreeze seed ' + seed); checks += 2; }

// ---- step 5 cycle: 10 → 220 → 10 visits solid → liquid → gas → liquid → solid, nothing lost ----
ok(M.cycleHeater(0) === 0.1 && Math.abs(Math.max(...Array.from({ length: 151 }, (_, i) => M.cycleHeater(i))) - 2.2) < 1e-12 && M.cycleHeater(M.CYCLE_END) === 0.1, 'cycle runs 10 → 220 → 10');
for (const seed of SEEDS) {
  const s = M.createSim({ seed, heater: 0.1 }); M.run(s, 1500); const t0 = s.t, seq = [];
  while (s.t - t0 < M.CYCLE_END) { s.heater = M.cycleHeater(s.t - t0); M.step(s); if (s.sub % 25 === 0) { const st = M.stateOf(s); if (seq[seq.length - 1] !== st) seq.push(st); } }
  assert.deepEqual(seq, ['solid', 'liquid', 'gas', 'liquid', 'solid'], 'cycle sequence seed ' + seed); checks++;
  ok(M.aliveCount(s) === 96, 'cycle keeps 96');
}

// ---- step 4: evaporation ----
for (const seed of SEEDS) {
  // lid closed at 60: a few in the air, never growing, nothing escapes
  const c = settle(seed, 0.6, 4000); let airMax = 0;
  for (let k = 0; k < 40; k++) { M.run(c, 250); airMax = Math.max(airMax, c.measured.air); const m = c.measured; ok(m.liquid + m.air + m.escaped === 96, 'three parts sum to 96'); }
  ok(airMax <= 15 && c.escaped === 0, `closed lid: air ≤ 15 (${airMax}), no escape`);
}
// lid open (s4hint): the liquid keeps its name while it shrinks, and escapes rise with the heater 40 → 70 (slider range)
const ESC = { 0.4: 0, 0.5: 0, 0.6: 0, 0.7: 0 };
for (const seed of SEEDS) {
  const e = {};
  for (const h of [0.4, 0.5, 0.6, 0.7]) {
    const s = settle(seed, h, 4000); s.lid = false;
    for (let k = 0; k < 60; k++) {
      M.run(s, 250); const m = s.measured;
      ok(m.liquid + m.air + m.escaped === 96 && M.aliveCount(s) + s.escaped === 96, 'open lid conserves 96');
      ok(M.stateOf(s) === 'liquid', `evaporating, not boiling: seed ${seed} h ${h}`);
    }
    e[h] = s.escaped; ESC[h] += s.escaped;
  }
  ok(e[0.7] > e[0.4], `seed ${seed}: 70 loses more than 40 (${e[0.4]} → ${e[0.7]})`);
}
ok(ESC[0.4] < ESC[0.5] && ESC[0.5] < ESC[0.6] && ESC[0.6] < ESC[0.7] && ESC[0.7] > 3 * ESC[0.6] / 2, 'escapes rise with temperature: ' + JSON.stringify(ESC));
ok(ESC[0.4] <= SEEDS.length / 2, 'at 40 escapes are rare: ' + ESC[0.4]);
ok(/max="70"/.test(fs.readFileSync(path.join(dir, 'index.html'), 'utf8').match(/id="h4"[^>]*/)[0]), 'step-4 slider stops at 70');

// ---- step 3: the water heating curve from textbook constants ----
const W = M.WATER, segs = M.heatingSegments();
ok(W.m === 100 && W.T0 === -20 && W.P === 1000 && W.cIce === 2.1 && W.cWater === 4.18 && W.cSteam === 2.0 && W.Lf === 334 && W.Lv === 2257, 'constants quoted in s3e');
assert.deepEqual(segs.map(g => g.kind), ['ice', 'melt', 'water', 'boil', 'steam']); checks++;
segs.forEach(g => ok(('k3' + g.kind) in STRINGS.zh && ('k3' + g.kind) in STRINGS.en, 'segment label k3' + g.kind));
const len = k => { const g = segs.find(q => q.kind === k); return (g.E1 - g.E0) / W.P; };
near(len('melt'), 33.4, 1e-9, 'melt plateau 33.4 s'); near(len('boil'), 225.7, 1e-9, 'boil plateau 225.7 s');
ok(len('boil') > 6 * len('melt'), 'boiling plateau much longer');
const total = segs[segs.length - 1].E1;
near(total, 309100, 1e-6, 'total energy'); ok(total / W.P <= 310, 'slider max 310 covers the whole curve');
for (let time = 0; time <= 310; time++) {
  const h = M.heatingAt(time);
  near(h.warm + h.apart, h.E, 1e-6, 'energy split');
  if (h.kind === 'melt') near(h.T, 0, 1e-9, 'melt at 0 °C'); if (h.kind === 'boil') near(h.T, 100, 1e-9, 'boil at 100 °C');
  if (time > 0) ok(h.T >= M.heatingAt(time - 1).T - 1e-9, 'temperature never falls');
}
// during a plateau only the "apart" energy grows (s3hint)
{ const a = M.heatingAt(10), b = M.heatingAt(30); ok(a.kind === 'melt' && b.kind === 'melt' && Math.abs(a.warm - b.warm) < 1e-9 && b.apart > a.apart, 'plateau: only apart grows'); }

// ---- bilingual strings ----
const zh = STRINGS.zh, en = STRINGS.en;
assert.deepEqual(Object.keys(zh).sort(), Object.keys(en).sort(), 'zh/en key sets'); checks++;
const ph = s => (s.match(/\{\w+\}/g) || []).sort().join();
const NEUTRAL = new Set([]);
for (const k of Object.keys(zh)) {
  ok(ph(zh[k]) === ph(en[k]), 'placeholders ' + k);
  if (!NEUTRAL.has(k)) ok(zh[k] !== en[k], 'zh differs from en: ' + k);
  ok(!/左图|右图|left-hand chart|right-hand chart|left chart|right chart/i.test(zh[k] + en[k]), 'no left/right chart wording: ' + k);
}
for (const k of ['s0readout', 's1readout', 's2readout', 's3readout', 's4readout', 's5readout', 's5seq', 's5prog', 's3hint', 'q1ok', 'q1no', 'q2ok', 'q2no', 'q3ok', 'q3no', 'lid4', 'lidClose4'])
  ok(!/&[a-z]+;|<[a-z]/i.test(zh[k] + en[k]), 'plain-text key has no HTML: ' + k);
// numbers in the text match the model
ok(zh.s3e.includes('100 克') && zh.s3e.includes('1000 瓦') && zh.s3e.includes('334') && zh.s3e.includes('2257') && en.s3e.includes('2257'), 's3e constants');
ok(zh.s2hint.includes('20 时始终是固体') && zh.s2hint.includes('35 时始终是液体') && zh.s5hint.includes('180') && zh.s5hint.includes('35 到 70') && en.s5hint.includes('180'), 'thresholds in hints');
ok(zh.s2e.includes('0.68') && en.s2e.includes('0.68'), 'solid line 0.68');
ok(zh.cycle5.includes('220') && en.cycle5.includes('220'), 'cycle peak 220');
ok(zh.s4e.includes('96') && en.s4e.includes('96') && zh.tagline.includes('96'), 'particle count 96');
ok(zh.foot.includes('claude-opus-5-5') && zh.foot.includes('粒子与物态 · 热闹程度即温度') && en.foot.includes('claude-opus-5-5'), 'footer signature');

// ---- page wiring ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(m[1] in zh, 'key exists: ' + m[1]);
for (const m of app.matchAll(/(?<![\w.])t\('([A-Za-z0-9]+)'(?!\s*\+)/g)) ok(m[1] in zh, 'app key exists: ' + m[1]);
for (const m of app.matchAll(/\$\('([A-Za-z0-9]+)'\)/g)) ok(html.includes(`id="${m[1]}"`), 'element exists: ' + m[1]);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder');
ok(html.includes('href="../../../chemistry/matter/particles-states/"'), 'compare link');
ok(!html.includes('canvas-label-guard'), 'no label guard');
let links = 0;
for (const m of html.matchAll(/href="(\.\.\/\.\.\/\.\.\/[^"#]+)#(step\d)"/g)) {
  const target = path.resolve(dir, m[1], 'index.html'); ok(fs.existsSync(target), 'link target ' + m[1]);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${m[2]}"`), `anchor ${m[1]}#${m[2]}`); links++;
}
ok(links === 4, 'four deep links');
// quiz answers
ok(/data-quiz="1" data-answer="b"/.test(html) && /data-quiz="2" data-answer="b"/.test(html) && /data-quiz="3" data-answer="a"/.test(html), 'quiz answers');

console.log(`PASS particles-states core: ${checks} checks · ${SEEDS.length} seeds × ${STATE_AT.length} heater settings · ${Object.keys(zh).length} bilingual keys · ${links} deep links`);
