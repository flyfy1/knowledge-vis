'use strict';
// Fire triangle (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const both = (key, s) => { for (const l of ['zh', 'en']) ok(STRINGS[l][key].includes(s), `${l}.${key} quotes ${s}`); };
const range = (a, b, d) => { const o = []; for (let v = a; v <= b + 1e-9; v += d) o.push(Math.round(v * 1e6) / 1e6); return o; };
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
const slider = id => { const m = html.match(new RegExp(`id="${id}"[^>]*min="([^"]+)" max="([^"]+)" step="([^"]+)" value="([^"]+)"`)); return { min: +m[1], max: +m[2], step: +m[3], value: +m[4] }; };

// ---- step 0: the copper-plate experiment ----
{ const sl = slider('tw0');
  for (const T of range(sl.min, sl.max, sl.step)) for (const o2 of [false, true]) {
    const w = M.plate('whiteP', T, o2), r = M.plate('redP', T, o2), u = M.plate('whitePWater', T, o2), c = M.plate('copper', T, o2);
    ok(w.burns === (T >= 40), 'white P on the plate burns iff T ≥ 40 °C');
    ok(!r.burns && r.missing[0] === 'heat', 'red P never reaches 240 °C in hot water');
    ok(u.burns === (o2 && T >= 40), 'white P under water needs oxygen bubbled in');
    if (!o2) ok(u.missing.includes('oxygen'), 'water keeps oxygen away');
    ok(!c.burns && c.missing[0] === 'fuel', 'copper is not a fuel');
  }
  const d = slider('tw0'); ok(d.value === 80, 'default 80 °C');
  // hint pairs differ in exactly one condition at 80 °C, no oxygen
  const w = M.plate('whiteP', 80, false), r = M.plate('redP', 80, false), u = M.plate('whitePWater', 80, false);
  ok(w.burns && !r.burns && !u.burns && M.plate('whitePWater', 80, true).burns, 'the 80 °C comparisons');
  ok(r.missing.length === 1 && u.missing.length === 1, 'each comparison differs in one condition');
  ok(!M.plate('whiteP', 35, false).burns, 'below 40 °C even white P stays unlit');
  both('lblWhite', '40'); both('lblRed', '240'); both('s0e', '40 °C'); both('s0e', '240 °C');
}

// ---- step 1: lighting and the heat budget ----
const steady = M.steadyT(M.PHI_AIR);
near(steady, 387.5, 1e-9, 'steady burning temperature'); ok(steady > M.TIGN, 'burning alone holds T above the ignition point');
near(M.steadyT(M.PHI_MIN), M.TIGN, 1e-9, 'at 16% the steady temperature equals the ignition point');
const hold = M.minHold();
near(hold, 3.284, 1e-3, 'shortest hold'); ok(M.fix(hold, 1) === '3.3', 'hint quotes 3.3 s');
{ const sl = slider('hold1'); ok(sl.value === 2 && !M.ignite(2).tIgn, 'default 2 s fails');
  for (const h of range(sl.min, sl.max, sl.step)) {
    const r = M.ignite(h);
    ok((r.tIgn !== null) === (h >= hold), 'ignites iff hold ≥ minimum, hold ' + h);
    ok(r.Tmax < 650, 'plot ceiling 650 °C');
    if (r.tIgn !== null) {
      near(r.tIgn, hold, 0.01, 'ignition moment = analytic crossing');
      ok(r.pts.filter(p => p.t > r.tIgn).every(p => p.burning && p.T >= M.TIGN), 'once lit, it never drops below the ignition point');
      ok(Math.abs(r.Tend - steady) < 8, 'settles toward the steady temperature');
    } else {
      ok(r.Tmax < M.TIGN && r.Tend < 25, 'falls back toward room temperature');
      ok(r.pts.every(p => !p.burning), 'never burns');
    }
  }
  // the heat-budget bars stay within their 220 °C/s full scale
  ok(M.MATCH <= 220 && M.G <= 220 && (650 - 20) / M.TAU <= 220, 'bar scale');
}
// the simulator agrees with the closed form for the match alone
{ const r = M.simulate({ heater: () => M.MATCH, tEnd: 3 }); near(r.Tend, 20 + 500 * (1 - Math.exp(-3 / M.TAU)), 1, 'Euler vs closed form'); }

// ---- step 2: candle in a jar ----
both('s2e', '21%'); both('s2e', '16%'); both('s2e', '4 mL'); both('s2hint', '16%');
ok(M.PHI_MIN === 0.16 && M.O2_RATE === 4, 'stated teaching values');
{ const sl = slider('vol2');
  for (const V of range(sl.min, sl.max, sl.step)) {
    const tout = M.jarOut(V);
    near(M.jarPhi(V, tout), M.PHI_MIN, 1e-12, 'flame dies at 16%');
    near(M.jarPhi(V, tout + 5), M.PHI_MIN, 1e-12, 'no oxygen used after the flame dies');
    ok(M.sustains(M.jarPhi(V, tout * 0.99)) && !M.sustains(M.jarPhi(V, tout) - 1e-6), 'sustains until the line');
    near(M.jarUsed(V), V * 0.05, 1e-9, 'oxygen used = 5% of the jar');
    ok(tout + 2 <= 32, 'run fits the 32 s axis');
    near(M.jarOut(2 * V) / tout, 2, 1e-12, 'double the jar, double the time');
  }
  near(M.jarOut(1000), 14.28, 0.01, '1000 mL jar: about 14.3 s');
  ok(Math.round(M.PHI_MIN / M.PHI_AIR * 100) === 76, 'oxygen left = 76% of the start');
  // the derivative at t = 0 is the stated 4 mL/s of oxygen
  const V = 1000, dt = 1e-4; near((M.jarPhi(V, 0) - M.jarPhi(V, dt)) * V / dt, 4, 1e-3, 'consumption 4 mL/s in fresh air');
}

// ---- step 3: putting it out ----
{ const none = M.extinguish('none'); ok(none.burningAtEnd && Math.abs(none.Tend - steady) < 1e-6, 'doing nothing: burns steadily');
  const f = M.extinguish('fuel'); ok(!f.burningAtEnd && Math.abs(f.tOut - M.ACT_AT) < 0.01, 'fuel removed: out at once');
  const l = M.extinguish('lid'); ok(!l.burningAtEnd && l.tOut > M.ACT_AT && l.tOut < M.ACT_AT + 2.5, 'lid: out within a couple of seconds'); near(l.tOut, 5.6, 0.05, 'lid out time');
  const wmin = M.minWater(); near(wmin, 0.76, 0.01, 'least water');
  const sl = slider('w3'); ok(sl.value === 0.5 && M.extinguish('water', 0.5).burningAtEnd, 'default 0.5 g fails (dip and recover)');
  ok(M.fix(Math.ceil(wmin * 10) / 10, 1) === '0.8', 'readout quotes 0.8 g');
  for (const w of range(sl.min, sl.max, sl.step)) {
    const r = M.extinguish('water', w), after = r.pts.filter(p => p.t >= M.ACT_AT);
    ok(r.burningAtEnd === (w < wmin), 'water outcome on the slider grid, w=' + w);
    if (!r.burningAtEnd) ok(after.filter(p => p.t >= r.tOut).every(p => p.T < M.TIGN && !p.burning), 'once out, never relights');
    else ok(Math.min(...after.map(p => p.T)) >= M.TIGN, 'not out: never fell below the ignition point');
    ok(Math.max(...r.pts.map(p => p.T)) < 450, 'plot ceiling 450 °C');
  }
  for (const a of ['fuel', 'lid']) { const r = M.extinguish(a); ok(r.pts.filter(p => p.t >= r.tOut).every(p => !p.burning), a + ': stays out'); }
  both('s3e', '{wk}'); ok(M.WATER === 130, 'water cooling teaching value');
}

// ---- step 4: chopping ----
for (let k = 0; k <= 12; k++) {
  const n = Math.pow(2, k), a = M.chop(n), p = M.chop(n, 1);
  near(a.area, 96 * n, 1e-9, 'area grows n times'); ok(a.pieces === n * n * n, 'n³ pieces');
  near(a.time * a.powerRatio, M.T_WHOLE, 1e-9, 'same total heat');
  if (k) near(M.chop(n / 2).time / a.time, 2, 1e-12, 'one notch halves the time');
  near(a.time / p.time, 1 / 0.21, 1e-9, 'pure oxygen factor');
  ok(Math.log10(p.time) >= -2 && Math.log10(a.time) <= 3.2, 'times inside the log axis');
}
ok(M.fix(1 / 0.21, 1) === '4.8', 'hint quotes 4.8× faster');
ok(M.chop(1024).time < 1 && M.chop(512).time >= 1, 'the dust note starts at n = 1024 in air');
both('s4e', '600'); both('s4e', '4 cm');

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
for (const id of ['tw0', 'o2btn', 'hold1', 'tc1', 'light1', 'clear1', 'vol2', 'cover2', 'clear2', 'actFuel', 'actLid', 'actWater', 'w3', 'checkQuiz', 'k4', 'gasAir', 'gasPure']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder + css');
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../chemistry/reactions/combustion-triangle/index.html')), 'comparison link target exists');
for (let i = 0; i <= 5; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);
ok(!html.includes('id="step6"'), 'six steps');
ok(STRINGS.zh.tagline.includes('六步') && STRINGS.en.tagline.includes('six steps'), 'tagline step count');

console.log(`PASS combustion-triangle core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · min hold ${hold.toFixed(3)} s · min water ${M.minWater().toFixed(3)} g`);
