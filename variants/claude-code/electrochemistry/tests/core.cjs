'use strict';
// Electrochemistry (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const both = (key, frag) => { for (const l of ['zh', 'en']) ok(STRINGS[l][key].includes(frag), `${l}.${key} quotes ${frag}`); };

// ---- constants ----
near(M.SLOPE, 0.0592, 5e-5, '2.303RT/F at 25 °C'); near(M.SLOPE_D, 0.0296, 5e-5, 'slope for n = 2');
near(M.VM, 24.47, 0.01, 'molar gas volume at 25 °C, 1 atm');

// ---- step 1: every pair of half-cells ----
for (const a of M.ORDER) for (const b of M.ORDER) {
  const c = M.cell(a, b);
  if (a === b) { ok(c.same && c.E0 === 0, 'same metal: no voltage'); continue; }
  ok(M.METALS[c.anode].E < M.METALS[c.cathode].E, 'anode has the smaller E°');
  ok(c.E0 > 0 && c.dG < 0, 'spontaneous: E° > 0, ΔG° < 0');
  // electrons lost = electrons gained = n
  ok(c.pA * M.METALS[c.anode].n === c.n && c.pC * M.METALS[c.cathode].n === c.n, 'electron balance');
  // charge balance of the overall equation
  ok(c.pC * M.METALS[c.cathode].n === c.pA * M.METALS[c.anode].n, 'charge balance');
  near(c.dG, -c.n * M.F * c.E0 / 1000, 1e-9, 'ΔG° = −nFE°');
  // E° does not depend on which order the pair is chosen
  near(M.cell(b, a).E0, c.E0, 1e-12, 'order of choice irrelevant');
}
near(M.DANIELL.E0, 1.10, 1e-12, 'Daniell 1.10 V'); assert.equal(M.DANIELL.anode, 'Zn'); assert.equal(M.DANIELL.n, 2); checks += 2;
near(M.DANIELL.dG, -212.3, 0.05, 'Daniell ΔG°');
near(M.DANIELL.logK, 37.2, 0.05, 'Daniell log K');
const feCu = M.cell('Fe', 'Cu'); assert.equal(feCu.anode, 'Fe'); near(feCu.E0, 0.78, 1e-12, 'Fe–Cu 0.78 V'); checks++;
both('fb1ok', '0.78'); both('q1a', '−0.44');
const cuAg = M.cell('Cu', 'Ag'); assert.equal(cuAg.overall, 'Cu + 2Ag⁺ → Cu²⁺ + 2Ag'); near(cuAg.E0, 0.46, 1e-12, 'Cu–Ag'); ok(cuAg.pC === 2, 'Ag half-reaction doubled'); checks++;
ok(M.cell('Mg', 'Zn').anode === 'Mg', 'Mg is the anode against Zn (s1hint)');
// ladder labels are at least 18 px apart on the 300-px axis: closest pair Zn/Fe 0.32 V of 3.7 V
{ const E = M.ORDER.map(m => M.METALS[m].E).sort((p, q) => p - q); let gap = 9; for (let i = 1; i < E.length; i++) gap = Math.min(gap, E[i] - E[i - 1]); ok(gap / 3.7 * 330 >= 18, 'ladder labels do not collide'); }

// ---- step 0 ----
const s0 = M.setup('bridge');
near(s0.I, 0.110, 1e-12, 'I = 1.10/(9 + 1)'); near(s0.perSecond / 1e17, 6.9, 0.05, '≈ 6.9×10¹⁷ electrons per second');
ok(M.setup('beaker').I === 0 && M.setup('nobridge').I === 0, 'no current without the closed loop');

// ---- step 2: Nernst ----
near(M.nernst(1, 1).E, 1.10, 1e-12, 'standard state');
near(M.nernst(1, 1).E - M.nernst(1, 1e-3).E, 0.0887, 5e-4, 'Cu²⁺ diluted 1000-fold: E falls 0.089 V');
both('s2hint', '0.089'); both('s2hint', '0.0296'); both('s2e', '0.0296'); both('s2e', '0.0592');
for (let lz = -3; lz <= 0.001; lz += 0.1) for (let lc = -3; lc <= 0.001; lc += 0.1) {
  const r = M.nernst(10 ** lz, 10 ** lc);
  ok(r.logQ >= -3.0001 && r.logQ <= 3.0001 && r.E > 0.95 && r.E < 1.25, 'every slider point is on the chart');
  near(r.E, 1.10 - 0.0295797 * (lz - lc), 1e-6, 'straight line in log Q');
}
near(M.nernst(0.1, 0.1).E, M.nernst(1, 1).E, 1e-12, 'same dilution: Q unchanged');
// E = 0 exactly at Q = K
near(M.nernst(10 ** M.DANIELL.logK, 1).E, 0, 1e-9, 'E = 0 at Q = K');

// ---- step 3: discharge ----
const def = M.discharge(1, 1, 9);
near(def.Qmax / 1000, 193.0, 0.05, 'capacity 2F = 193 kC'); both('s3e', '193 kC');
near(M.cliffAt(def, 1.0) * 100, 99.93, 0.01, 'E < 1.00 V only after 99.9% of the capacity'); both('s3hint', '99.9%');
for (const c0 of [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]) for (let R = 2; R <= 20; R++) {
  const run = M.discharge(c0, 1, R);
  let prevE = Infinity, prevT = -1;
  run.pts.forEach(p => {
    ok(p.E <= prevE + 1e-12 && p.t >= prevT, 'E falls and time runs forward'); prevE = p.E; prevT = p.t;
    ok(p.U < p.E && p.U > 0.5 && p.E < 1.2 && p.E > 0.5, 'curves stay inside the 0.5–1.2 V panel');
    near(p.I, p.E / (R + M.R_INT), 1e-12, 'I = E/(R + r)');
  });
  ok(run.Qmax / 1000 <= 200, 'x axis to 200 kC holds the curve');
  // the E curve does not depend on R
  const other = M.discharge(c0, 1, 5); run.pts.forEach((p, i) => near(p.E, other.pts[i].E, 1e-12, 'E independent of R'));
}
// smaller c0: shorter curve, starting lower
ok(M.discharge(0.2, 1, 9).pts[0].E < def.pts[0].E && M.discharge(0.2, 1, 9).Qmax < def.Qmax, 'smaller c0');
// mass bookkeeping: 1 mol Cu²⁺ → 63.5 g Cu, 65.4 g Zn dissolved
near(def.pts.at(-1).mCu, 63.546, 1e-3, 'Cu plated'); near(def.pts.at(-1).mZn, 65.38, 1e-3, 'Zn dissolved');

// ---- step 4: push back ----
near(M.pushBack(M.E0D).I, 0, 1e-12, 'I = 0 at V = E'); assert.equal(M.pushBack(1.1).mode, 'balance'); checks++;
for (let v = 0; v <= 2.0001; v += 0.05) {
  const r = M.pushBack(+v.toFixed(2));
  ok(Math.abs(r.I) <= 0.6, 'I within the ±0.6 A panel');
  ok((r.mode === 'galvanic') === (r.V < 1.1 - 1e-9) && (r.mode === 'electrolytic') === (r.V > 1.1 + 1e-9), 'mode switches at E');
  // energy balance: chemical power = power into the source + heat (signs follow the current)
  near(r.Pcell, r.Psrc + r.heat, 1e-12, 'E·I = V·I + I²R');
}
near(M.pushBack(1.5).I, -0.2, 1e-12, 'quiz case V = 1.5 V: reversed current');

// ---- step 5: Faraday ----
for (let I = 0.1; I <= 2.0001; I += 0.1) for (const tm of [1, 10, 30, 60]) {
  const cu = M.faraday('Cu', I, tm), ag = M.faraday('Ag', I, tm), w = M.faraday('H2O', I, tm);
  near(ag.items[0].mol, 2 * cu.items[0].mol, 1e-15, 'twice as many moles of Ag');
  near(w.items[0].mL / w.items[1].mL, 2, 1e-12, 'H₂ : O₂ = 2 : 1');
  near(cu.Q, I * tm * 60, 1e-9, 'Q = It');
  ok(ag.items[0].mol * 1000 <= 80, 'all lines fit the 0–80 mmol axis');
}
near(M.faraday('Cu', 1, 60).items[0].mass, 1.186, 1e-3, '1 A for an hour plates 1.19 g Cu');
both('s5hint', '2 : 1'); both('s5e', '96485');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => [...new Set(s.match(/\{[a-zA-Z0-9]+\}/g) || [])].sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['axisE', 'srcLabel', 'lgRun']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5') && STRINGS[l].foot.includes(l === 'zh' ? '电化学 · 电子沿导线跑，还是被电推着跑' : 'Electrochemistry · Electrons Running Down the Wire, or Pushed Along'), 'footer names model and original');
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/左图|右图|left panel|right panel|left chart|right chart/i.test(v), 'no left/right figure references: ' + k);

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const m of app.matchAll(/'(r4[gbe]|cmp(?:Up|Down|Same)|fb[14](?:ok|no))'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder');
ok(!html.includes('canvas-label-guard'), 'no label guard');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../chemistry/reactions/electrochemistry/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS electrochemistry core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
