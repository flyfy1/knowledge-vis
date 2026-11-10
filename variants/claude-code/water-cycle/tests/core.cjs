'use strict';
// Water cycle (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const both = (key, test, msg) => ['zh', 'en'].forEach(l => ok(test(STRINGS[l][key]), `${msg} (${l}.${key})`));

// ---- step 0: where the water is ----
near(M.TOTAL, 1377027.7, 1e-6, 'total of the published stocks');
const frac = id => M.STOCKS.find(s => s.id === id).v / M.TOTAL;
ok(frac('ocean') > 0.965 && frac('ocean') < 0.975, 'ocean ≈ 97% (s6fin)');
ok(frac('air') < 1e-5, 'air vapour < one part in 100,000 (s6fin)');
const rows = M.zoomRows();
near(rows[2].rest, 0, 1e-9, 'third zoom row is fully split');
near(rows[0].restFrac * rows[0].pool, rows[1].pool, 1e-6, 'zoom row 2 is the rest of row 1');
near(M.shares(1).reduce((s, b) => s + b.ml, 0), 1000, 1e-9, 'shares add up to the container');
for (const L of [1, 10, 150]) { const sh = M.shares(L); near(sh.find(s => s.id === 'air').ml, 12.7 / M.TOTAL * L * 1000, 1e-12, 'air share'); }
ok(M.shares(1).find(s => s.id === 'air').ml / M.DROP_ML < 1, 'in a 1 L bottle the air holds less than one drop');

// ---- step 1: evaporation responds the way the text says ----
for (let T = 0; T < 40; T++) ok(M.evapRate(T + 1, 0.5, 0) > M.evapRate(T, 0.5, 0), 'warmer evaporates faster');
for (let h = 20; h < 100; h += 5) ok(M.evapRate(25, h / 100, 0) > M.evapRate(25, (h + 5) / 100, 0), 'drier evaporates faster');
for (let u = 0; u < 5; u += 0.5) ok(M.evapRate(25, 0.5, u + 0.5) > M.evapRate(25, 0.5, u), 'windier evaporates faster');
for (let T = 0; T <= 40; T++) ok(M.evapRate(T, 1, 3) === 0 && M.dryHours(T, 1, 3) === Infinity, '100% humidity: no net evaporation (s1never)');
near(M.dryHours(25, 0.5, 0), M.PUDDLE_MM / M.evapRate(25, 0.5, 0) * 24, 1e-9, 'dry time = depth ÷ rate');
ok(M.PUDDLE_MM === 10, 'the puddle is 10 mm (1 cm) deep as the title says');

// ---- step 2: lifting air ----
for (const T0 of [10, 20, 25, 35]) for (const rh of [0.3, 0.6, 0.9, 1]) {
  const p = M.parcel(T0, rh);
  const td = M.dewPoint(T0, rh);
  near(M.es(td), rh * M.es(T0), 1e-9, 'dew point inverts Tetens');
  // below the base the parcel cools at 9.8 °C per km and carries constant vapour; above it vapour = saturation
  p.pts.forEach((q, i) => {
    if (p.base === null || q.z < p.base) { near(q.T, T0 - 9.81 / 1005 * q.z, 1e-6, 'dry lapse'); near(q.vap, p.w0, 1e-12, 'vapour constant below base'); near(q.cloud, 0, 0, 'no cloud below base'); }
    else { near(q.vap, q.ws, 1e-12, 'saturated above base'); near(q.vap + q.cloud, p.w0, 1e-9, 'water conserved'); }
    if (i && p.base !== null && q.z > p.base + 10) { const lapse = (p.pts[i - 1].T - q.T) / 10 * 1000; ok(lapse < 9.8 && lapse > 3, 'cloudy air cools more slowly'); }
  });
  if (rh === 1) ok(p.base === 0, 'saturated at the foot: cloud (fog) at the ground');
}
// the cloud base rises as the air gets drier; ≈ 125 m per degree of dew-point depression
let prev = -1;
for (let h = 100; h >= 10; h -= 5) { const b = M.parcel(25, h / 100).base; if (b === null) break; ok(b >= prev, 'drier air → higher base'); prev = b; near(b, 125 * (25 - M.dewPoint(25, h / 100)), 120, 'base ≈ 125 m × (T − Td)'); }
ok(M.parcel(25, 0.1).base === null && M.parcel(10, 0.1).base !== null, 'at 25 °C and 10% the air reaches 4000 m without clouding (s2nobase reachable)');
ok(M.parcel(25, 0.6).base > 900 && M.parcel(25, 0.6).base < 1200, 'default cloud base ≈ 1 km');

// ---- step 3: fall speeds ----
for (let lr = -2.3; lr < 0.3; lr += 0.01) ok(M.fallSpeed(Math.pow(10, lr + 0.01)) > M.fallSpeed(Math.pow(10, lr)), 'bigger falls faster');
for (const r of [M.R12, M.R23].map(c => c * 10)) near(M.fallSpeed(r * (1 - 1e-9)), M.fallSpeed(r * (1 + 1e-9)), 1e-6, 'regimes join continuously');
ok(M.fallSpeed(0.01) < 0.02, 'a 10 µm cloud droplet falls about 1 cm/s');
ok(M.fallSpeed(0.01) < 0.5 && M.fallSpeed(0.1) > 0.5, 'with a 0.5 m/s updraught a droplet rises and a 0.1 mm drop falls (s3hint)');
ok(1000 / M.fallSpeed(0.01) / 3600 > 20, 'a cloud droplet would need ~a day to fall 1 km');
near(M.dropletsPerDrop(0.1), 1000, 1e-6, '0.1 mm drop = 1000 droplets'); near(M.dropletsPerDrop(1), 1e6, 1e-3, '1 mm drop = a million droplets (s6fin)');
ok(M.fallSpeed(2) < 10.5, 'slider stops at 2 mm with a plausible top speed');

// ---- step 4: storms on four kinds of ground ----
for (const s of Object.keys(M.SURFACES)) for (let I = 5; I <= 60; I += 5) {
  const o = M.storm(s, I);
  near(o.runoff + o.soil + o.ground, o.total, 1e-9, 'rain budget closes');
  near(o.toRiver + o.stillGround + o.stillQuick + o.soil, o.total, 1e-9, 'every millimetre is accounted for after 48 h');
  near(o.runoff, Math.max(0, I - M.SURFACES[s].f) * M.STORM_H, 1e-9, 'runoff = what cannot soak in');
  ok(o.flow.length === M.HOURS / M.FLOW_STEP + 1, 'flow sampled across 48 h');
}
for (let I = 5; I <= 60; I += 5) {
  const f = M.storm('forest', I), c = M.storm('city', I);
  ok(c.peak > f.peak, 'city peaks higher than forest'); ok(c.runoff > f.runoff, 'city sheds more runoff');
  if (I >= 20) ok(f.stillGround > c.stillGround, 'forest keeps more water underground after 48 h (long tail, default rain and up)');
  if (f.peak === 0) ok(f.soil === f.total, 'no river rise only when the topsoil kept everything (s4readout0)');
}
ok(M.storm('forest', 20).runoff === 0 && M.storm('forest', 60).runoff > 0, 'heavier rain makes even the forest shed runoff (s4hint)');

// ---- step 5: residence times and the random journey ----
for (const b of M.BOXES) near(M.inFlow(b), M.outFlow(b), 1e-9, 'inflow = outflow for ' + b);
near(M.outFlow('air'), 486, 1e-9, 'air loses 486 thousand km³ a year (quiz)'); near(M.BOX_STOCK.air, 12.7, 0, 'air holds 12.7 (quiz)');
const airDays = M.residenceYears('air') * 365.25;
ok(airDays > 9 && airDays < 10, 'air water replaced every ≈ 9.5 days (quiz answer a, s0hint “about ten days”)');
ok(M.residenceYears('ocean') > 3000 && M.residenceYears('ocean') < 3500, 'ocean ≈ 3200 years (quiz option c is the ocean, not the air)');
ok(M.residenceYears('ice') > M.residenceYears('ocean') && M.residenceYears('ground') > 100, 'ice and groundwater are slow');
near(M.FLOWS.filter(f => f[1] === 'ocean' && f[0] !== 'air').reduce((s, f) => s + f[2], 0), 40, 1e-9, 'runoff to the sea = 40 (Trenberth)');
near(M.FLOWS.filter(f => f[0] === 'air' && f[1] !== 'ocean').reduce((s, f) => s + f[2], 0), 113, 1e-9, 'precipitation on land = 113');
// many simulated stays average out to stock ÷ outflow
const tallies = {}; M.BOXES.forEach(b => { tallies[b] = { n: 0, s: 0 }; });
for (let d = 1; d <= 4000; d++) M.journey(d, 10).forEach(l => { tallies[l.box].n++; tallies[l.box].s += l.years; });
for (const b of ['ocean', 'air', 'land']) { const m = tallies[b].s / tallies[b].n; near(m / M.residenceYears(b), 1, 0.06, 'simulated mean stay → residence time for ' + b); }
ok(M.journey(5, 10).length === 10, 'ten legs per drop');
for (let d = 1; d < 200; d++) M.journey(d, 10).forEach(l => ok(M.FLOWS.some(f => f[0] === l.box && f[1] === l.next), 'journeys only follow real flows'));

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
both('foot', s => s.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/左图|右图|left chart|right chart|left panel|right panel/i.test(v), 'no left/right figure references: ' + k);

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['cBottle', 'cBucket', 'cTub', 'T1', 'H1', 'U1', 'sun1', 'clear1', 'T2', 'H2', 'Z2', 'climb2', 'R3', 'W3', 'grow3', 'sForest', 'sGrass', 'sFarm', 'sCity', 'I4', 'drop5', 'many5', 'clear5', 'checkQuiz']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder and stylesheet');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../earth/climate/water-cycle/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS water-cycle core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · air ${airDays.toFixed(1)} d · ocean ${M.residenceYears('ocean').toFixed(0)} yr`);
