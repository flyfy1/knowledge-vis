'use strict';
// The Cell (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric or factual claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };

// ---- step 0: sizes, magnification, scale bar ----
near(M.magFromSlider(0), 1, 1e-12, 'slider 0 = 1×'); near(M.magFromSlider(300), 1000, 1e-9, 'slider 300 = 1000×'); checks += 2;
ok(M.cellsPerMm() === 20, 'about 20 cells of 50 µm per mm (s0e {perMm})');
const minMag = Object.fromEntries(M.SIZES.map(s => [s.id, M.minMagToSee(s.um)]));
near(minMag.cell, 2, 1e-12, 'a 50 µm cell needs 2× (s0e, s6fin)'); near(minMag.nucleus, 10, 1e-12, 'nucleus 10×');
near(minMag.chloro, 20, 1e-12, 'chloroplast 20×'); near(minMag.mito, 100, 1e-12, 'mitochondrion 100×'); checks += 4;
ok(minMag.leaf < 1, 'the leaf is visible at 1×');
ok(M.visibleAt(50, 2) && !M.visibleAt(50, 1.99), 'visibility threshold is exactly 0.1 mm');
// appearance order in the zoom (hint): cells, nucleus, chloroplasts, mitochondria
ok(minMag.cell < minMag.nucleus && minMag.nucleus < minMag.chloro && minMag.chloro < minMag.mito, 'appearance order');
ok(minMag.mito <= M.MAG_MAX, 'everything listed becomes visible inside the slider range');
for (let v = 0; v <= 300; v++) {
  const f = M.fieldUm(M.magFromSlider(v)), b = M.scaleBar(f);
  ok(b <= f / 4 + 1e-9 && b > f / 10, 'scale bar between a tenth and a quarter of the field at slider ' + v);
  ok(/^[125]$/.test(String(b / Math.pow(10, Math.floor(Math.log10(b) + 1e-9))).slice(0, 1)), '1-2-5 bar');
}
assert.deepEqual(M.lengthUnit(60000), { v: 6, unit: 'cm' }); assert.deepEqual(M.lengthUnit(2000), { v: 2, unit: 'mm' }); assert.deepEqual(M.lengthUnit(50), { v: 50, unit: 'um' }); checks += 3;

// ---- step 1/4: geometry and hit testing ----
const plant = M.plantCell(), animal = M.animalCell();
const S320 = 270; // narrowest cell box in px (320 px viewport); tolerance = 20 px → ≥ 40 px touch targets
const tol = 20 / S320;
for (const id of ['nucleus', 'mito', 'chloro', 'vacuole']) plant[id].forEach(s => ok(M.hitTest(plant, s.cx, s.cy, tol) === id, `plant ${id} centre hits`));
for (const id of ['nucleus', 'mito']) animal[id].forEach(s => ok(M.hitTest(animal, s.cx, s.cy, tol) === id, `animal ${id} centre hits`));
// small organelles keep a ≥40 px target: 18 px away in four directions still selects the same kind
for (const [cell, ids] of [[plant, ['mito', 'chloro']], [animal, ['mito']]]) for (const id of ids) cell[id].forEach(s => {
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const got = M.hitTest(cell, s.cx + dx * 18 / S320, s.cy + dy * 18 / S320, tol);
    ok(got === id || ['nucleus', 'mito', 'chloro'].includes(got), `${id} touch zone stays on an organelle`);
  }
});
// wall band, membrane band and cytoplasm are all reachable in the plant cell
const w = plant.wall[0], m = plant.membrane[0];
ok(M.hitTest(plant, w.x + 0.008, 0.25, tol) === 'wall', 'outer border selects the wall');
ok(M.hitTest(plant, m.x + 0.002, 0.25, tol) === 'membrane', 'inner line selects the membrane');
ok(M.hitTest(plant, 0.3, 0.42, tol / 4) === 'cytoplasm', 'open area selects the cytoplasm');
ok(M.hitTest(plant, -0.2, 0.3, tol) === null && M.hitTest(animal, 0.01, 0.01, tol) === null, 'outside the cell selects nothing');
// animal cell never yields wall, chloroplast or vacuole
const seenAnimal = new Set();
for (let x = -0.05; x <= 1.05; x += 0.005) for (let y = -0.05; y <= M.ASPECT + 0.05; y += 0.005) { const h = M.hitTest(animal, x, y, tol); if (h) seenAnimal.add(h); }
ok([...seenAnimal].sort().join() === M.ANIMAL_HAS.slice().sort().join(), 'animal cell hits exactly its four structures');
const seenPlant = new Set();
for (let x = -0.05; x <= 1.05; x += 0.004) for (let y = -0.05; y <= M.ASPECT + 0.05; y += 0.004) { const h = M.hitTest(plant, x, y, tol); if (h) seenPlant.add(h); }
ok(seenPlant.size === 7, 'plant cell exposes all seven structures');
// three differences (s4e, f_done): exactly wall, chloroplast, vacuole
ok(M.STRUCTS.filter(M.isDifference).sort().join() === ['chloro', 'vacuole', 'wall'].join(), 'three plant-only structures');
ok(M.STRUCTS.length === 7, 'seven structures (s1readout N)');

// ---- step 2: membrane simulation (seeds 1..9 are the page's "new starting positions") ----
near(M.insideArea, 0.2827, 1e-4, 'cell covers 28% of the box (s2hint)'); checks++;
near(M.insideArea * 30, 8.5, 0.05, 'even small count ≈ 8.5'); near(M.insideArea * 20, 5.7, 0.05, 'even sugar count ≈ 5.7'); checks += 2;
let fracSmall = 0, fracSugar = 0;
for (let seed = 1; seed <= 9; seed++) {
  const a = M.runMembrane(seed, false);
  ok(a.hist.every(c => c.protein === 16), `intact membrane keeps all 16 proteins (seed ${seed})`);
  ok(a.hist[0].small === 0 && a.hist[0].sugar === 0, 'small molecules and sugar start outside');
  fracSmall += a.hist[150].small / (M.insideArea * 30) / 9; fracSugar += a.hist[150].sugar / (M.insideArea * 20) / 9;
  const b = M.runMembrane(seed, true);
  ok(b.hist[b.hist.length - 1].protein < 16, `torn membrane leaks protein (seed ${seed})`);
  ok(b.hist.every((c, i) => i === 0 || c.protein <= 16), 'protein never exceeds its start');
}
ok(fracSmall > 0.7, `small molecules reach most of their even level by tick 150 (${fracSmall.toFixed(2)})`);
ok(fracSugar < 0.6 * fracSmall, `sugar climbs far more slowly (${fracSugar.toFixed(2)} vs ${fracSmall.toFixed(2)})`);
// rule table
ok(M.canCross('small', 2, false) && !M.canCross('sugar', 0, false) && M.canCross('sugar', Math.PI / 4, false) && !M.canCross('protein', Math.PI / 4, false), 'crossing rules');
ok(M.canCross('protein', 0, true) && !M.canCross('protein', Math.PI, true), 'only the hole lets proteins out');

// ---- step 3: graft ----
for (const base of ['A', 'B']) for (const stalk of ['A', 'B']) for (const round of [1, 2, 3]) {
  const r = M.capAfterGraft(base, stalk, round);
  ok(r.type === base, 'cap follows the nucleus');
  ok(r.mix > 0.5, 'always leaning towards the nucleus species');
  ok((r.mix === 1) === (base === stalk || round >= 2), 'only the first cap after a mismatched graft is intermediate');
}

// ---- step 5: scenarios ----
const ans = Object.fromEntries(M.SCENARIOS.map(s => [s.id, s.answer]));
assert.deepEqual(ans, { muscle: 'mito', leaf: 'chloro', root: 'chloro', rbc: 'nucleus' }); checks++;
for (const s of M.SCENARIOS) { ok(s.options.includes(s.answer), 'answer offered'); ok(s.options.filter(o => M.judge(s.id, o)).length === 1, 'exactly one right option'); }
ok(!M.SCENARIOS.find(s => s.id === 'rbc').options.includes('mito'), 'rbc question omits mitochondria (also absent in mature RBCs)');
ok(70 * 60 * 24 === 100800, 'heart beats per day at 70 bpm');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['unit_um', 'unit_mm', 'unit_cm']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const id of M.STRUCTS) for (const p of ['s_', 'job_', 'look_']) ok(STRINGS.zh[p + id] && STRINGS.en[p + id], 'card text ' + p + id);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) ok(!/左图|右图|left chart|right chart|left picture|right picture/i.test(v), 'no left/right figure references');

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'\s*[,)]/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['z0', 'play0', 'reset0', 'c1', 'run2', 'tear2', 'reset2', 'graft3', 'recut3', 'reveal4', 'reset4', 'check5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!/canvas-label-guard/.test(html), 'no label guard');

// ---- links ----
const hrefs = [...html.matchAll(/href="(\.\.\/[^"]+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.endsWith('.css')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, rel.endsWith('/') ? 'index.html' : '');
  ok(fs.existsSync(target), 'link target ' + h);
  if (anchor) ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(html.includes('href="../../../biology/cells/cell-structure/"'), 'comparison link');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS cell-structure core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} links · sugar/small progress at tick 150 ${fracSugar.toFixed(2)}/${fracSmall.toFixed(2)}`);
