'use strict';
// Energy pyramid (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b}`);

// ---- step 0: one level's ledger ----
const d0 = M.budget(0.5, 0.5, 0.4);
near(d0.eaten, 500, 1e-9, 'eaten'); near(d0.absorbed, 250, 1e-9, 'absorbed'); near(d0.growth, 100, 1e-9, 'growth'); near(d0.transfer, 0.1, 1e-12, 'default 10%');
near(d0.respiration, 150, 1e-9, 'heat 150'); near(d0.notEaten + d0.feces, 750, 1e-9, 'decomposers 750');
for (let e = 10; e <= 90; e += 5) for (let a = 20; a <= 90; a += 5) for (let g = 2; g <= 50; g++) {
  const b = M.budget(e / 100, a / 100, g / 100);
  near(b.notEaten + b.feces + b.respiration + b.growth, 1000, 1e-9, 'energy conserved: every kJ accounted for');
  near(b.transfer, e * a * g / 1e6, 1e-12, 'transfer = product of the three gates');
  ok(b.transfer <= 0.405 + 1e-12, 'never above ~two fifths');
}
near(M.budget(0.9, 0.9, 0.5).transfer, 0.405, 1e-12, 'max ≈ 40% ("约四成")');
near(M.budget(0.5, 0.5, 0.2).transfer, 0.05, 1e-12, '50/50/20 → 5%');

// ---- step 1: level after level ----
const L10 = M.levels(0.1);
[10000, 1000, 100, 10].forEach((v, i) => near(L10[i], v, 1e-9, 'level ' + (i + 1)));
near(L10[3] / L10[0], 0.001, 1e-12, 'top gets 0.1% (quiz answer c)');
const L5 = M.levels(0.05); near(L5[3], 1.25, 1e-9, '5% → 1.25 kJ'); near(L5[3] / L10[3], 1 / 8, 1e-12, 'an eighth');
for (let e = 5; e <= 20; e++) { const L = M.levels(e / 100); for (let k = 1; k < 4; k++) near(L[k] / L[k - 1], e / 100, 1e-12, 'constant ratio'); ok(L[3] >= 1, 'log drawing keeps every level above the 0.1 kJ floor'); }

// ---- step 2: territory ----
for (let e = 5; e <= 20; e++) {
  const T = [1, 2, 3].map(k => M.territory(k, e / 100));
  near(T[1].area / T[0].area, 100 / e, 1e-9, 'each step up ×1/eff in area');
  near(T[0].area, 70, 1e-9, 'plant-eater 70 m² at any efficiency');
  T.forEach(x => near(x.area * x.perKm2, 1e6, 1e-6, 'per km² = 10⁶ / area'));
}
const t10 = [1, 2, 3].map(k => M.territory(k, 0.1));
near(t10[1].area, 700, 1e-9, '700 m²'); near(t10[2].area, 7000, 1e-6, '7000 m²'); near(t10[1].perKm2, 1428.57, 0.01, '1,429 per km²');
near(Math.sqrt(10), 3.16, 0.01, '"边长约 3.2 倍"');
near(M.territory(3, 0.05).area / M.territory(3, 0.1).area, 4, 1e-9, '5% → 4×');
near(M.FIELD, 7140, 0, 'pitch 105 × 68');
near(M.NEED / 365, 1918, 1, '≈1900 kJ a day');

// ---- step 3: inverted biomass ----
near(M.flipTurnover(), 30, 1e-9, 'flips above 30 turnovers');
for (let n = 1; n <= 200; n++) {
  const s = M.sea(n);
  ok(s.invertedBiomass === (n > 30), 'biomass inverted iff turnover > 30');
  ok(!s.invertedProduction && s.P2 < s.P1, 'energy pyramid never inverts');
  near(s.B1 * n, s.P1, 1e-9, 'biomass × turnover = production');
}
const s150 = M.sea(150); near(s150.B1, 4, 1e-9, 'sea B1 = 4'); near(s150.B2, 20, 1e-9, 'B2 = 20'); ok(!M.sea(1).invertedBiomass, 'grass upright');

// ---- step 4: diet ----
const veg = M.diet(0, 0.1), d30 = M.diet(0.3, 0.1), d30b = M.diet(0.3, 0.03);
near(veg.perHa, 10.53, 0.01, 'all-plant ≈ 10.5 per ha');
near(d30.perHa, 2.84, 0.01, '30%, 10% ≈ 2.8'); near(d30b.perHa, 0.98, 0.01, '30%, 3% ≈ 1');
near(d30.animalLand / d30.land, 0.81, 0.01, '"三成的食物占掉八成的地"');
near(M.PERSON / 365, 10411, 1, '≈10400 kJ a day'); near(M.PERSON / 365 / 4.184, 2488, 1, '≈2500 kcal');
for (let m = 0; m <= 100; m += 5) for (let c = 3; c <= 20; c++) {
  const d = M.diet(m / 100, c / 100);
  ok(d.land <= 3.2 && d.land > 0, 'bar axis 0–3.2 ha holds every case');
  ok(d.perHa <= 12 + 1e-9, 'at most 12 dots fit the 4×3 grid');
  if (m > 0) ok(d.perHa < veg.perHa, 'any meat feeds fewer people');
}

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['quizA', 'quizB', 'quizC']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const k of zk) ok(!/左图|右图|left (chart|plot|panel)|right (chart|plot|panel)/i.test(STRINGS[l][k]), 'no left/right figure references ' + k);

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'(?!\s*\+)/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const k of ['row0', 'row1', 'row2', 'row3', 'lvl1', 'lvl2', 'lvl3', 'lvl4', 'eats1', 'eats2', 'eats3']) ok(STRINGS.zh[k] && STRINGS.en[k], 'key ' + k);
for (const id of ['eat0', 'abs0', 'gro0', 'lin1', 'log1', 'eff1', 'eats1', 'eats2', 'eats3', 'eff2', 'presetSea', 'presetGrass', 'turn3', 'meat4', 'conv4', 'checkQuiz']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('id="turn3" data-step="3" type="range" min="1" max="200"'), 'turnover slider spans the flip at 30');
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder + css');
ok(app.includes("choice.value === 'c'"), 'quiz key is 0.1%');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../biology/ecology/energy-pyramid/index.html')), 'comparison link target exists');
for (let i = 0; i <= 5; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS energy-pyramid core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
