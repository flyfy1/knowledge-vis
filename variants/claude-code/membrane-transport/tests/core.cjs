'use strict';
// Membrane transport (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const both = (key, s) => { for (const l of ['zh', 'en']) ok(STRINGS[l][key].includes(s), `${l}.${key} quotes ${s}`); };

// ---- step 0: random walkers ----
// conservation, determinism, net flow from crowded to sparse, crossings continue at equilibrium
const eqGap = [], winNet = [];
for (const seed of [1, 2, 3, 4, 5]) {
  const s = M.makeDiffusion(160, 40, seed), s2 = M.makeDiffusion(160, 40, seed);
  s.step(800); s2.step(800);
  assert.deepEqual(s.count(), s2.count(), 'seeded runs repeat'); checks++;
  const c = s.count(); ok(c.in + c.out === 200, 'molecules conserved');
  ok(s.inward > s.outward, 'early net flow goes inward (160 out vs 40 in)');
  // the crowded side sends more across: net inflow in the next 1000-step window while outside is still ahead
  const i1 = s.inward, o1 = s.outward, c1 = s.count(); s.step(1000);
  if (c1.out - c1.in > 40) { winNet.push(s.inward - i1 - (s.outward - o1)); }
  s.step(8000);
  const e = s.count(); ok(Math.abs(e.in - e.out) <= 50, 'near equal after 9,800 steps, within 3.5σ of binomial noise (' + e.in + '/' + e.out + ')'); eqGap.push(Math.abs(e.in - e.out));
  const i0 = s.inward, o0 = s.outward; s.step(1000);
  ok(s.inward - i0 > 15 && s.outward - o0 > 15, 'crossings continue both ways at equilibrium (quiz)');
}
ok(eqGap.reduce((x, y) => x + y, 0) / eqGap.length <= 25, 'average gap at equilibrium within binomial noise');
ok(winNet.length >= 3 && winNet.reduce((x, y) => x + y, 0) > 0, 'net inflow while the outside is more crowded (' + winNet.join(',') + ')');
// equal start: no systematic net flow; reversed start: net flow reverses
{ let net = 0; for (let seed = 1; seed <= 8; seed++) { const s = M.makeDiffusion(100, 100, seed); s.step(2000); net += s.inward - s.outward; } ok(Math.abs(net) < 8 * 40, 'equal sides: net flow ≈ 0 on average (' + net + ')'); }
{ const s = M.makeDiffusion(40, 160, 9); s.step(800); ok(s.outward > s.inward, 'more inside: net flow outward'); }
// pores: the membrane is passable only at the gaps
ok(M.inPore(0.2) && M.inPore(0.8) && !M.inPore(0.3) && !M.inPore(0.5), 'pore geometry');

// ---- step 1: carrier saturation ----
near(M.occupancy(5), 0.5, 1e-12, 'half the carriers busy at Km = 5 mM'); both('s1e', '5 mM');
near(M.jCarrier(1e6), 10, 1e-4, 'ceiling Jmax = 10');
for (const mult of [0.5, 1, 1.5, 2]) for (let c = 1; c <= 50; c++) {
  near(M.jCarrier(c, 0, mult), mult * M.jCarrier(c), 1e-12, 'curve scales with carrier number');
  ok(M.jCarrier(c + 1, 0, mult) > M.jCarrier(c, 0, mult), 'monotone');
  const r = M.jCarrier(2 * c, 0, mult) / M.jCarrier(c, 0, mult); ok(r > 1 && r < 2, 'doubling never doubles the carrier flux');
  near(M.jSimple(2 * c) / M.jSimple(c), 2, 1e-12, 'lipid flux doubles');
  ok(M.jCarrier(c, 0, 1) > M.jSimple(c), 'carrier above lipid line on the whole slider range');
}
near(M.jCarrier(2) / M.jCarrier(1), 1.714, 0.001, 'Co = 1 → factor ≈ 1.71'); near(M.jCarrier(80) / M.jCarrier(40), 1.059, 0.001, 'Co = 40 → factor ≈ 1.06');
for (const l of ['zh', 'en']) ok(STRINGS[l].s1hint.includes('1.71') && STRINGS[l].s1hint.includes('1.06'), 's1hint quotes 1.71 and 1.06');
ok(M.jCarrier(50, 0, 2) < 22, 'carrier curve fits the 0–22 axis');

// ---- step 2: size and time ----
for (let R = 1; R <= 50; R++) {
  near(M.cInside(M.tHalf(R), R), 0.5, 1e-12, 't½ gives half'); near(M.cInside(M.t90(R), R), 0.9, 1e-12, 't90 gives 90%');
  near(M.tHalf(2 * R) / M.tHalf(R), 2, 1e-12, 'doubling R doubles t½');
  // the ODE dCi/dt = P(A/V)(Co − Ci) with A/V = 3/R matches the closed form
  let c = 0; const dt = 0.001; for (let tt = 0; tt < 3 - 1e-9; tt += dt) c += dt * M.P2 * (3 / R) * (1 - c);
  near(c, M.cInside(3, R), 2e-3, 'Euler vs closed form');
}
near(M.tHalf(10), 2.31, 0.005, 'R = 10 → t½ ≈ 2.31 s'); ok(M.t90(50) < 60, 'largest cell reaches 90% inside the 60-s chart');
// sphere geometry: A/V = 3/R
for (const R of [1, 7, 50]) near((4 * Math.PI * R * R) / (4 / 3 * Math.PI * R ** 3), 3 / R, 1e-12, 'A/V = 3/R');

// ---- step 3: osmosis ----
near(M.vEq(300), 1, 1e-12, 'isotonic keeps volume'); near(M.vEq(500), 0.76, 1e-12, 'hypertonic 500 → 0.76'); near(M.vEq(200), 1.3, 1e-12, 'hypotonic 200 → 1.3');
for (const l of ['zh', 'en']) ok(STRINGS[l].s3hint.includes('0.76') && STRINGS[l].s3hint.includes('1.3') && STRINGS[l].s3hint.includes('140') && STRINGS[l].s3hint.includes('150'), 's3hint numbers');
near(M.burstCout(), 150, 1e-9, 'burst threshold reached at 150 mOsm/L'); both('s3e', '150');
for (let c = 100; c <= 600; c += 10) {
  const s = M.simVolume(c), ve = M.vEq(c);
  near(M.cInsideOsm(ve), c, 1e-9, 'at equilibrium inside = outside');
  if (c < 150) ok(s.burstAt !== null && s.burstAt < M.OSMO.T, 'bursts below 150 (c=' + c + ')');
  else { ok(s.burstAt === null, 'no burst at ≥ 150 (c=' + c + ')'); if (c !== 150) near(s.vs.at(-1), ve, 0.01, 'reaches equilibrium within 10 s (c=' + c + ')'); }
  ok((s.vs[1] > 1) === (c < 300) || c === 300, 'water direction: in when hypotonic');
  ok(ve >= 0.6 && (ve <= 1.7 || s.burstAt !== null), 'curve inside the 0.6–1.7 axis');
}
ok(M.tonicity(200) === 'hypo' && M.tonicity(300) === 'iso' && M.tonicity(500) === 'hyper', 'tonicity names');

// ---- step 4: pump and leak ----
const P = M.PUMP;
near(M.steadyNa(1, 1), 12, 0.05, 'default steady state ≈ 12 mM'); both('s4e', '12 mM'); both('s4e', '145');
for (let s = 0.1; s <= 1.5 + 1e-9; s += 0.1) for (const l of [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]) {
  const ss = M.steadyNa(s, l);
  near(M.leak(ss, l), M.pumpFlux(ss, s), 1e-9, 'steady state: leak = pump');
  ok(ss > 0 && ss < P.Co, 'steady state between 0 and 145');
  const tr = M.simNa(P.Co, s, l, { ...P, T: 3000 }); near(tr.cs.at(-1), ss, 0.05, 'simulation settles to the steady state');
  near(ss, M.steadyNa(s / l, 1), 1e-9, 'only the ratio pump/leak matters');
  ok(M.leak(0, l) <= 4 && M.pumpFlux(150, s) <= 4, 'curves fit the 0–4 axis');
}
near(M.steadyNa(0.5, 1), 45.1, 0.1, 'ATP 50% → ≈ 45 mM'); near(M.steadyNa(1, 2), 45.1, 0.1, 'leak ×2 → same ≈ 45 mM');
for (const l of ['zh', 'en']) ok(STRINGS[l].s4hint.includes('45') && STRINGS[l].s4hint.includes('50%'), 's4hint numbers');
ok(M.steadyNa(0, 1) === P.Co, 'no pump → no gradient');
{ const tr = M.simNa(M.steadyNa(1, 1), 0, 1); ok(tr.cs.every((c, i) => i === 0 || c >= tr.cs[i - 1]), 'ATP cut: inside Na⁺ only rises'); ok(tr.cs.at(-1) > 130 && tr.cs.at(-1) < 145, 'approaches 145 within 300 min'); }
ok(M.NA_PER_ATP === 3 && M.K_PER_ATP === 2, '3 Na⁺ out, 2 K⁺ in per ATP'); both('s4e', '3'); both('formula', '3 Na⁺');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(k === 'foot' || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const k of zk) ok(!/左图|右图|left chart|right chart|left panel|right panel/i.test(STRINGS[l][k]), 'no left/right figure references in ' + k);

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['no0', 'ni0', 'run0', 'reset0', 'co1', 'car1', 'R2', 'play2', 'cout3', 'hypo3', 'iso3', 'hyper3', 's4', 'l4', 'cut4', 'restore4', 'checkQuiz']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../biology/cells/membrane-transport/index.html')), 'comparison link target exists');
for (let i = 0; i <= 5; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS membrane-transport core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · equilibrium gap ${eqGap.join('/')}`);
