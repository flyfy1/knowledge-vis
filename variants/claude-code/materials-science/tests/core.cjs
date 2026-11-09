'use strict';
// Materials science (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const both = (key, text) => { for (const l of ['zh', 'en']) ok(STRINGS[l][key].includes(text), `${l}.${key} quotes ${text}`); };
const METALS = ['steel', 'al', 'cu'];

// ---- the curve itself ----
for (const k of METALS) {
  const nk = M.necking(k), ef = M.breakStrain(k);
  // Considère crossing = maximum of the engineering curve (scan the uniform + necked range)
  let best = { s: 0, e: 0 };
  for (let e = 0; e <= ef; e += 1e-5) { const s = M.response(k, e).s; if (s > best.s) best = { s, e }; }
  near(best.e, nk.eu, 2e-5, `${k}: max of σ(ε) at the Considère strain`);
  near(best.s, nk.uts, 1e-6 * nk.uts, `${k}: peak = UTS`);
  near(M.theta(M.MATS[k], nk.ep), nk.st, 1e-6 * nk.st, `${k}: θ = σt at necking`);
  // before necking θ > σt, after it θ < σt (the crossing is unique)
  ok(M.theta(M.MATS[k], nk.ep * 0.5) > M.sigT(M.MATS[k], nk.ep * 0.5) && M.theta(M.MATS[k], nk.ep * 1.5) < M.sigT(M.MATS[k], nk.ep * 1.5), `${k}: single crossing`);
  // true stress = σ(1 + ε) on the uniform branch
  for (let e = 0.005; e < nk.eu; e += 0.01) near(M.trueUniform(k, e).st, M.response(k, e).s * (1 + e), 1e-6, `${k}: σt = σ(1+ε)`);
  // continuous at necking and at fracture the curve stops
  near(M.response(k, nk.eu + 1e-7).s, nk.uts, 1e-3, `${k}: continuous at e_u`);
  ok(M.response(k, ef + 1e-6).broken, `${k}: broken past e_f`);
  near(ef, M.MATS[k].Astd, 1e-12, `${k}: standard bar elongation`);
}
// elongation figures quoted in s2hint: Al ≈ 8 %, Cu ≈ 38 %
ok(Math.round(M.necking('al').eu * 100) === 8 && Math.round(M.necking('cu').eu * 100) === 38, 'necking strains ~8 % and ~38 %');
both('s2hint', '8'); both('s2hint', '38');

// ---- step 0: dividing by size ----
{
  const ratios = [];
  for (let d = M.SPEC.dMin; d <= M.SPEC.dMax; d += 2) for (let L = M.SPEC.LMin; L <= M.SPEC.LMax; L += 10) ratios.push(M.specimen(d, L));
  const nk = M.necking('steel');
  // identical σ–ε up to necking for every specimen size
  for (let e = 0; e <= nk.eu; e += 0.002) { const ref = M.response('steel', e, ratios[0].ratio).s; ratios.forEach(q => near(M.response('steel', e, q.ratio).s, ref, 1e-9, 'collapse before necking')); }
  ok(new Set(ratios.map(q => q.ef.toFixed(4))).size > 5, 'elongation at break differs between sizes');
  // shorter gauge → larger elongation at break (same diameter); larger diameter → larger (same gauge)
  ok(M.specimen(10, 30).ef > M.specimen(10, 80).ef && M.specimen(16, 50).ef > M.specimen(8, 50).ef, 'Barba trends in s0hint');
  // max force scales with area; max stress does not
  near(M.specimen(20, 50).Fmax / M.specimen(10, 50).Fmax, 4, 1e-9, 'F ∝ A0');
  // the "standard bar" button: L0 = 5.65√A0 = 5.007 d lands on the 10 mm grid for every d on the 2 mm grid
  for (let d = M.SPEC.dMin; d <= M.SPEC.dMax; d += 2) {
    const L = Math.round(5.65 * Math.sqrt(Math.PI * d * d / 4) / 10) * 10, q = M.specimen(d, L);
    ok(L >= M.SPEC.LMin && L <= M.SPEC.LMax && q.isStd, 'standard bar on the grid for d=' + d);
    near(q.ef, M.MATS.steel.Astd, 0.003, 'standard bar elongation ≈ Astd for d=' + d);
  }
  ok(M.specimen(10, 50).isStd, 'the default specimen is the standard bar');
}

// ---- step 1: elastic vs plastic ----
for (const k of METALS) {
  const m = M.MATS[k], ey = Math.exp(m.sp / m.E) - 1;
  for (let e = 0; e < ey; e += ey / 20) near(M.response(k, e).eres, 0, 0, `${k}: no permanent strain below the elastic limit`);
  ok(M.response(k, ey * 1.5).eres > 0, `${k}: permanent strain past the elastic limit`);
  // permanent strain grows with the strain reached (bottom plot of step 1)
  let prev = -1; for (let e = 0; e <= 0.02; e += 0.0001) { const r = M.response(k, e).eres; ok(r >= prev - 1e-15, `${k}: monotone permanent strain`); prev = r; }
  // Rp0.2: offset definition, and the unloading model agrees that it leaves 0.2 % behind
  const rp = M.rp02(k);
  near(rp.s, m.E * (rp.e - M.OFFSET), 1e-6, `${k}: Rp0.2 on the offset line`);
  near(M.response(k, rp.e).eres, M.OFFSET, 6e-5, `${k}: Rp0.2 leaves ≈ 0.2 % permanent strain`);
  ok(rp.s > m.sp, `${k}: Rp0.2 above the proportional limit`);
  ok(rp.e < 0.02, `${k}: Rp0.2 inside the 2 % window`);
}
// s1hint: copper leaves the line first; aluminium has the smallest E
ok(METALS.every(k => M.MATS.cu.sp <= M.MATS[k].sp) && M.ORDER.every(k => M.MATS.al.E <= M.MATS[k].E), 'Cu lowest limit, Al lowest E');
ok(M.breakStrain('ceramic') < 0.022 && M.response('ceramic', 0.0005).eres === 0, 'ceramic breaks inside the step-1 window with no permanent strain');

// ---- step 3: toughness ----
const T = Object.fromEntries(M.ORDER.map(k => [k, M.toughness(k)]));
ok(Math.round(T.steel) === 115 && Math.round(T.cu) === 99 && Math.round(T.al) === 41 && Math.abs(T.ceramic - 0.09) < 0.005, `toughness values ${JSON.stringify(T)}`);
for (const [k, v] of [['s3hint', '5'], ['s3hint', '6'], ['s3hint', '115'], ['s3hint', '99'], ['s3hint', '41'], ['s3hint', '0.09'], ['s3hint', '260']]) both(k, v);
for (const k of M.ORDER) {
  // Simpson vs fine trapezoid
  const ef = M.breakStrain(k); let s = 0, prev = 0; const N = 200000;
  for (let i = 1; i <= N; i++) { const e = ef * i / N, v = M.response(k, Math.min(e, ef - 1e-12)).s; s += (v + prev) / 2 * ef / N; prev = v; }
  near(T[k], s, 2e-3 * Math.max(1, T[k]), `${k}: toughness integral`);
  ok(T[k] < 450 * ef, `${k}: area below the bounding box`);
  // the recoverable triangle is small once plastic (s3hint): < 6 % of the absorbed work from ε = 5 %
  if (k !== 'ceramic') for (let e = 0.05; e < ef; e += 0.005) ok(M.recoverable(k, e) / M.energyTo(k, e) < 0.06, `${k}: small recoverable share at ${e}`);
  ok(T[k] >= M.resilience(k) - 1e-12, `${k}: toughness ≥ resilience`);
}
near(T.ceramic, M.resilience('ceramic'), 1e-6, 'brittle: toughness = resilience');
ok(M.MATS.ceramic.sf / M.rp02('al').s > 0.85 && M.MATS.ceramic.sf < M.rp02('al').s, 'ceramic 260 MPa not far below Al Rp0.2');

// ---- step 4: design ----
const F4 = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
for (const F of F4) {
  ok(M.design(F, 0.1, 0, 'mass').best === 'ceramic' && M.design(F, 0.1, 0, 'thin').best === 'ceramic', 'tight δ: ceramic lightest and thinnest, F=' + F);
  ok(M.design(F, 3, 0, 'mass').best === 'al', 'loose δ: aluminium lightest, F=' + F);
  ok(M.design(F, 3, 0, 'thin').best === 'steel', 'loose δ: steel thinnest, F=' + F);
  for (let U = 50; U <= 2000; U += 50) ok(M.design(F, 3, U, 'thin').best === 'steel', 'energy demanded: steel thinnest');
  ok(M.design(F, 3, 0, 'mass').rows.every(r => r.binds === 'strength'), 'loose δ: governed by strength');
  ok(M.design(F, 0.1, 0, 'mass').rows.find(r => r.key === 'ceramic').binds === 'stiffness', 'tight δ: governed by stiffness');
}
// the winner really changes inside the slider ranges (no fixed winner is claimed)
{
  const winners = new Set();
  for (const g of ['mass', 'thin']) for (const F of F4) for (let d = 0.1; d <= 3.0001; d += 0.1) for (let U = 0; U <= 2000; U += 50) winners.add(M.design(F, +d.toFixed(1), U, g).best);
  ok(winners.has('ceramic') && winners.has('al') && winners.has('steel'), 'three different winners: ' + [...winners]);
}
near(M.MATS.al.rho / M.MATS.steel.rho, 1 / 3, 0.03, 'Al density about a third of steel');
ok(Math.abs(M.rp02('al').s / M.rp02('steel').s - 1) < 0.05, 'Al yield close to steel');
{ const perJ = 1 / (T.ceramic * 1e6 * M.DESIGN.L) * 1e6; ok(Math.round(perJ) === 11, 'ceramic: ~11 mm² per joule (' + perJ + ')'); both('s4noteCeramic', '11'); both('s4noteCeramic', '0.09'); }

// ---- step 5: cracks ----
const at = Object.fromEntries(M.ORDER.map(k => [k, M.transitionCrack(k) * 1000]));
ok(at.ceramic.toFixed(3) === '0.075' && at.al.toFixed(1) === '3.2' && Math.round(at.steel) === 9 && Math.round(at.cu / 5) * 5 === 165, 'a* values ' + JSON.stringify(at));
for (const v of ['0.075', '3.2', '9', '165', '1/2']) both('s5hint', v);
for (const k of M.ORDER) {
  near(M.fractureStress(k, at[k] / 1000), M.strength(k), 1e-9, `${k}: lines meet at a*`);
  near(Math.log10(M.fractureStress(k, 1e-3)) - Math.log10(M.fractureStress(k, 1e-1)), 1, 1e-12, `${k}: 100× crack → 1/10 stress`);
  if (k !== 'ceramic') {
    ok(M.failure(k, at[k] / 1000 * 0.9).mode === 'yield' && M.failure(k, at[k] / 1000 * 1.1).mode === 'fracture', `${k}: mode switches at a*`);
  }
  ok(at[k] > 0.01 && at[k] < 1000, `${k}: a* inside the plotted range`);
}

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set([]);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5') && STRINGS[l].foot.includes(l === 'zh' ? '材料科学 · 应力如何变成断裂' : 'Materials Science · When Stress Becomes Fracture'), 'footer names the model and the original');

// ---- every key referenced in HTML/app exists; text-only keys carry no markup ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of html.matchAll(/data-i18n="([^"]+)"/g)) for (const l of ['zh', 'en']) ok(!/<[a-z]/.test(STRINGS[l][m[1]]), `plain-text key ${m[1]} has no HTML`);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'\s*[,)]/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const k of ['Steel', 'Al', 'Cu', 'Ceramic']) ok(STRINGS.zh['mat' + k] && STRINGS.zh['sh' + k], 'material names ' + k);
for (const id of ['d0', 'L0', 'std0', 'clear0', 'e1', 'sweep1', 'clear1', 'e2', 'sweep2', 'e3', 'sweep3', 'clear3', 'F4', 'd4', 'U4', 'goalMass', 'goalThin', 'a5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css') && !html.includes('canvas-label-guard'), 'provenance placeholder, css, no label guard');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../physics/matter/materials-science/index.html')) && html.includes('href="../../../physics/matter/materials-science/"'), 'comparison link');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS materials-science core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · toughness ${Object.values(T).map(v => v.toFixed(2)).join('/')} MJ/m³`);
