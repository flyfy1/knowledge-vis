'use strict';
// Food-web (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const Z = STRINGS.zh, E = STRINGS.en;

// ---- step 0: the web and its chains ----
const chains = M.chains();
ok(chains.length === 10, '10 food chains');
ok(chains.every(c => M.byId(c[0]).producer && M.eatersOf(c[c.length - 1]).length === 0), 'chains run producer → top');
ok(chains.every(c => c.slice(1).every((id, i) => M.foodsOf(id).includes(c[i]))), 'each link is a real feeding link');
const covered = new Set(chains.flatMap(c => c.slice(1).map((id, i) => c[i] + '>' + id)));
ok(covered.size === M.edges().length && M.edges().length === 13, 'chains cover all 13 arrows');
ok(Math.min(...chains.map(c => c.length)) === 4 && Math.max(...chains.map(c => c.length)) === 6, 'chain lengths 4..6');
ok(M.eatersOf('heron').length === 0, 'nothing eats herons (s0hint)');
ok(M.SPECIES.filter(s => s.producer).length === 2 && M.SPECIES.length === 9, '2 producers, 7 consumers (tagline)');
ok(Z.tagline.includes('9 种') && E.tagline.includes('9 kinds'), 'tagline count');
ok(chains.filter(c => c.includes('algae')).length === 8, 'algae in 8 chains');
// the quiz arrow exists: snails → frogs
ok(M.foodsOf('frog').includes('snail') && !M.foodsOf('snail').includes('frog'), 'quiz: frogs eat snails');

// ---- step 1: trophic levels ----
ok(M.levels('zoo').distinct.join() === '2', 'zooplankton always level 2 (s1hint)');
ok(M.levels('heron').distinct.join() === '4,5,6', 'herons on levels 4, 5, 6');
ok(M.levels('heron').chains.length === 10, 'herons in all 10 chains');
ok(M.levels('frog').distinct.length > 1 && M.levels('pike').distinct.length > 1, 'frogs and pike multi-level');
ok(M.foodsOf('heron').includes('fish') && M.foodsOf('pike').includes('fish') && M.foodsOf('heron').includes('pike'), 's1e: herons eat small fish and pike that eat small fish');
for (const id of M.IDS) { const l = M.levels(id); ok(l.chains.length <= 10, 'at most 10 rows for ' + id); }

// ---- step 2: energy ----
ok(M.longestChain().join() === 'algae,zoo,larva,fish,pike,heron', 'longest chain as named in s2e');
near(M.energyAt(0.1, 6), 0.1, 1e-12, '10%: level 6 gets 0.1 kJ');
near(M.algaePerTop(0.1, 6), 100000, 1e-6, '10%: 100 000 kJ algae per kJ heron');
near(M.energyAt(0.05, 6), 0.003125, 1e-12, '5%: level 6');
near(M.energyAt(0.2, 6), 3.2, 1e-12, '20%: level 6');
for (let e = 5; e <= 20; e++) for (let k = 2; k <= 6; k++) near(M.energyAt(e / 100, k) / M.energyAt(e / 100, k - 1), e / 100, 1e-12, 'same ratio each level');
// at 20%, levels ≥ 4 are < 1% of the plain-scale axis (s2hint: they hug the floor)
ok(M.energyAt(0.2, 4) / (M.E1 * 1.18) < 0.01, 'level 4 bar hugs the floor at 20%');

// ---- step 3: biomagnification ----
near(M.toxFactor(0.9, 0.1), 9, 1e-12, 'default factor 9');
near(M.toxAt(0.9, 0.1, 5), 0.002 * 6561, 1e-12, 'heron 13.1 mg/kg');
ok(M.toxAt(0.9, 0.1, 5) > M.LIMIT && M.toxAt(0.9, 0.1, 3) < M.LIMIT && M.toxAt(0.9, 0.1, 4) > M.LIMIT, 'default: pike and herons over the line');
near(M.toxFactor(0.1, 0.1), 1, 1e-12, 's3hint: retention = efficiency → equal bars');
ok(M.toxFactor(0.05, 0.1) < 1, 'below efficiency → thins out');
ok(M.toxFactor(0.9, 0.05) > M.toxFactor(0.9, 0.1), 'lower efficiency → faster build-up');
// ratio of 1/eff kg food per kg body (s3e: 10 kg at 10%)
near(1 / 0.1, 10, 1e-12, '10 kg food per kg body at 10%');

// ---- step 4: trophic cascade ----
const base = M.equilibrium(4);
ok(base.every(v => v > 0), 'intact chain has all four');
const sims = {};
for (const cut of [-1, 1, 2, 3]) {
  const s = M.simulate(cut), last = s.samples[s.samples.length - 1].pct, pred = M.predicted(cut);
  pred.forEach((v, i) => near(last[i], v, 0.5, `sim end vs prediction cut ${cut} species ${i}`));
  sims[cut] = last; checks++;
  ok(s.samples.every(q => q.pct.every(v => v >= 0 && isFinite(v))), 'no negative numbers');
  // before the cut everything sits at 100%
  ok(s.samples.filter(q => q.t < M.SIM.T_CUT).every(q => q.pct.every(v => Math.abs(v - 100) < 1e-9)), 'flat before the cut');
}
// no fishing: equilibrium holds
sims[-1].forEach(v => near(v, 100, 1e-6, 'no fishing stays at 100%'));
// pike out: fish up, zoo down, algae up (×4), water greener
near(M.predicted(3)[0], 400, 1e-6, 'algae ×4'); near(M.predicted(3)[1], 25, 1e-6, 'zoo 25%'); near(M.predicted(3)[2], 700, 1e-6, 'fish 700%');
ok(M.predicted(3)[0] > 110, 'water greener');
// small fish out: zoo up, algae down, pike gone
ok(M.predicted(2)[1] > 102 && M.predicted(2)[0] < 90 && M.predicted(2)[3] === 0, 's4hint: zoo up, algae down, pike gone');
// zooplankton out: algae up to K
near(M.predicted(1)[0], 100 * M.LV.K / base[0], 1e-9, 'algae to ceiling');
// order of the first response after the pike go: fish rises before zoo falls before algae rises
{
  const s = M.simulate(3).samples, first = (k, test) => s.find(q => q.t > M.SIM.T_CUT && test(q.pct[k])).t;
  const tf = first(2, v => v > 110), tz = first(1, v => v < 90), ta = first(0, v => v > 110);
  ok(tf < tz && tz < ta, `cascade order fish ${tf} < zoo ${tz} < algae ${ta}`);
}
ok(Math.abs(M.SIM.T_CUT - 20) < 1e-12 && Z.s4e.includes('时刻 20') && E.s4e.includes('time 20'), 'cut time in text');

// ---- step 5: starvation ----
ok(M.starved(['zoo']).sort().join() === 'fish,larva', 'full web: zoo out → nymphs and fish starve (s5hint)');
ok(M.starved(['zoo'], 'one').length === 5, 'one food each: zoo out → 5 starve (s5hint)');
ok(M.starved(['weed']).length === 0 && M.starved(['algae']).length === 3, 'algae loss starves 3 in the full web');
const tot = w => M.singleRemovalTable(w).reduce((s, r) => s + r.lost.length, 0);
ok(tot('full') === 5 && tot('one') === 15, `single-removal totals ${tot('full')} / ${tot('one')}`);
ok(M.singleRemovalTable('one').every((r, i) => r.lost.length >= M.singleRemovalTable('full')[i].lost.length), 'one-food web never better');
ok(['frog', 'pike', 'heron'].every(id => M.foodsOf(id).length > 1), 's5hint: frogs, pike, herons have other food');
ok(M.starved(['algae', 'weed']).length === 7, 'no producers → every consumer starves');

// ---- bilingual parity ----
const zk = Object.keys(Z).sort(), ek = Object.keys(E).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(Z[k]), ph(E[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['arrow', 'sp_pike', 'ss_pike']);
for (const k of zk) ok(NEUTRAL.has(k) || Z[k] !== E[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) ok(!/左图|右图|left (chart|panel|picture)|right (chart|panel|picture)/i.test(v), 'no left/right figure references');

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(Z[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'[,)]/g)) ok(Z[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of M.IDS) ok(Z['sp_' + id] && Z['ss_' + id] && E['sp_' + id] && E['ss_' + id], 'species names ' + id);
for (const id of ['eff2', 'keep3', 'eff3', 'walk0', 'stop0', 'scaleLin', 'scaleLog', 'cutNone', 'cutPike', 'cutFish', 'cutZoo', 'replay4', 'webFull', 'webOne', 'restore5', 'checkQuiz', 'chips0', 'chips1', 'chips5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../biology/ecology/food-web/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS food-web core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · chains ${chains.length} · starvations ${tot('full')}/${tot('one')}`);
