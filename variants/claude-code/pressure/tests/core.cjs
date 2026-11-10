'use strict';
// Pressure (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0;
const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);

// ---- step 0: brick, three faces (s0e, s0readout, s0hint) ----
ok(M.G === 10, 'g = 10 N/kg everywhere');
near(M.brick('flat', 1).F, 20, 1e-12, 'F = mg = 20 N');
near(M.brick('flat', 1).p, 1000, 1e-9, 'flat 1000 Pa'); near(M.brick('side', 1).p, 2000, 1e-9, 'side 2000 Pa'); near(M.brick('end', 1).p, 4000, 1e-9, 'end 4000 Pa');
near(M.brick('flat', 1).perCm2, 0.1, 1e-12, '0.1 N per cm²'); near(M.brick('end', 1).perCm2, 0.4, 1e-12, '0.4 N per cm²');
for (const f of ['flat', 'side', 'end']) {
  const b = M.brick(f, 1);
  near(b.S * 1e4, b.Scm2, 1e-9, '1 m² = 10000 cm²');
  near(b.p, b.perCm2 * 1e4, 1e-9, 'p in Pa = N per cm² × 10000');
  for (let n = 1; n <= 3; n++) near(M.brick(f, n).p, n * b.p, 1e-9, 'n bricks → n × pressure, same area');
  near(b.dentMM, b.p / 400, 1e-12, 'dent: 1 mm per 400 Pa');
}
near(M.brick('side', 1).p / M.brick('flat', 1).p, 2, 1e-12, 'half the area → twice the pressure');
// the sponge is drawn 50 mm thick; the deepest dent (3 bricks on end) must stay inside it
ok(M.brick('end', 3).dentMM <= 30 && M.brick('end', 3).dentMM < 50, 'dent fits in the sponge');
// face dimensions match the brick
ok(JSON.stringify(Object.values(M.FACES).map(f => f[0] * f[1])) === '[200,100,50]', 'face areas 200/100/50 cm²');

// ---- step 1: ladder (s1readout, s1hint, quiz1, s5fin) ----
const p = id => M.caseById(id).p;
for (let i = 1; i < M.CASES.length; i++) ok(M.CASES[i].p > M.CASES[i - 1].p, 'ladder rows go up in pressure');
for (const c of M.CASES) ok(c.p >= 1e3 && c.p <= 1e9, 'every case on the 10³–10⁹ axis: ' + c.id);
near(M.caseById('ski').S / M.caseById('stand').S, 8, 1e-9, 'skis have 8 × the area');
near(p('ski'), p('stand') / 8, 1e-9, 'ski pressure is 1/8');
ok(Math.log10(8) > 0.85 && Math.log10(8) < 1, '“almost one step” on the log axis');
assert.equal(Math.round(M.caseById('tank').F / M.caseById('stand').F), 667); checks++;
near(M.ratio('tank', 'stand'), 6.67, 0.01, 'tank pressure ≈ 6.7 × person');
near(M.ratio('tip', 'thumb'), 2000, 1e-6, 'quiz1: tip / thumb = 2000');
near(100 / 0.05, M.ratio('tip', 'thumb'), 1e-6, '100 mm² ÷ 0.05 mm²');
near(Math.log10(M.ratio('tip', 'thumb')), 3.3, 0.05, '“3.3 steps apart”');
ok(M.ratio('tip', 'ski') > 2e5 && M.ratio('tip', 'ski') < 3e5, '“more than two hundred thousand” (二十多万倍)');
near(p('stand'), 15000, 1e-9, 'standing person 15000 Pa'); near(p('tip'), 4e8, 1e-3, 'tack point 4 × 10⁸ Pa');

// ---- step 2: liquids (s2e, s2readout, s2hint) ----
for (const rho of Object.values(M.LIQUIDS)) for (let h = 0; h <= 30; h++) {
  near(M.liquidP(rho, h / 100), rho * 10 * h / 100, 1e-9, 'p = ρgh');
  for (const S of [1e-4, 0.01, 2]) near(M.columnP(rho, h / 100, S), M.liquidP(rho, h / 100), 1e-9, 'column argument: S cancels');
  if (h > 0) near(M.liquidP(rho, 2 * h / 100), 2 * M.liquidP(rho, h / 100), 1e-9, 'twice the depth, twice the pressure');
}
for (let h = 0; h <= 30; h++) near(M.gaugeRise(M.liquidP(M.LIQUIDS.water, h / 100)) * 100, h, 1e-9, 'water: gauge gap = depth');
const pMax = M.liquidP(M.LIQUIDS.brine, 0.3);
near(pMax, 3600, 1e-9, 'max 3600 Pa'); ok(pMax <= 4000, 'fits the 0–4000 Pa axis');
ok(M.gaugeRise(pMax) * 100 / 2 <= 22, 'largest gauge gap fits the 44 cm U-tube drawing');
ok(M.LIQUIDS.alcohol < M.LIQUIDS.water && M.LIQUIDS.water < M.LIQUIDS.brine, 'liquid order');

// ---- step 3: containers (s3readout, s3hint, table) ----
for (let h = 0; h <= M.H_MAX; h++) {
  const rows = ['straight', 'flared', 'narrow'].map(k => M.container(k, h));
  const exact = { straight: 100 * h, flared: 10 * (10 * h + h * h / 2), narrow: 10 * (10 * h - 0.2 * h * h) };
  rows.forEach(r => near(r.V, exact[r.shape], 1e-9, 'volume integral ' + r.shape));
  rows.forEach(r => near(r.Fb, rows[0].Fb, 1e-12, 'same force on every base'));
  near(rows[0].wall, 0, 1e-9, 'straight walls carry nothing');
  if (h > 0) { ok(rows[1].wall > 0, 'flared walls hold water up'); ok(rows[2].wall < 0, 'narrow walls push down'); }
  rows.forEach(r => ok(r.weight <= 40 + 1e-9 && r.Fb <= 40, 'bars fit the 0–40 N axis'));
}
const full = ['straight', 'flared', 'narrow'].map(k => M.container(k, 20));
near(full[0].p, 2000, 1e-9, '2000 Pa at 20 cm'); near(full[0].Fb, 20, 1e-9, '20 N on each base');
near(full[1].weight, 40, 1e-9, 'B water weighs 40 N'); near(full[2].weight, 12, 1e-9, 'C water weighs 12 N'); near(full[0].weight, 20, 1e-9, 'A water weighs 20 N');
near(M.SHAPES.flared.width(20), 30, 1e-12, 'B top 30 cm'); near(M.SHAPES.narrow.width(20), 2, 1e-12, 'C top 2 cm');
for (const k of Object.keys(M.SHAPES)) near(M.SHAPES[k].width(20), M.SHAPES[k].top, 1e-12, 'top width ' + k);

// ---- step 4: air (s4e, s4readout, s4hint, s4col) ----
near(M.P0 * 1e-4, 10.13, 1e-9, 'about 10 N per cm²');
for (let D = 10; D <= 40; D += 5) near(M.hemispheres(D, 0).F, 0, 1e-9, '0% pumped → no force');
for (let f = 0; f <= 0.95; f += 0.05) near(M.hemispheres(40, f).F / M.hemispheres(10, f).F || 16, 16, 1e-9, '4 × diameter → 16 × force');
const h90 = M.hemispheres(30, 0.9);
near(h90.pin, 0.1 * M.P0, 1e-6, '90% pumped leaves 10% pressure'); near(h90.F, 0.9 * M.P0 * Math.PI * 0.15 * 0.15, 1e-6, 'F = Δp·πr²');
near(h90.kg, h90.F / 10, 1e-9, 'equivalent mass F/g');
ok(M.hemispheres(40, 0.95).F >= M.hemispheres(10, 0.05).F, 'pull arrows scale to the largest case');
near(M.waterColumn(10), 10.13, 1e-9, 'water column 10.1 m with g = 10');
near(M.waterColumn(9.8), 10.34, 0.01, 'water column 10.3 m with g = 9.8');

// ---- step 5: quiz2 ----
near(M.diverP, 1e5, 1e-9, '10 m of water = 1 × 10⁵ Pa');
near(M.diverP / M.P0, 1, 0.02, '≈ one atmosphere');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['dimLabel', 'forceLabel', 'th0F', 'th0S', 'th0P', 'quiz2a', 'quiz2b', 'hLabel']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'[,)]/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const c of M.CASES) ok(STRINGS.zh['case_' + c.id] && STRINGS.zh['det_' + c.id], 'case strings ' + c.id);
for (const id of ['n0', 'faceFlat', 'faceSide', 'faceEnd', 'h2', 'lqAlcohol', 'lqWater', 'lqBrine', 'dirUp', 'dirSide', 'dirDown', 'clear2', 'h3', 'f4', 'd4', 'check1', 'check2']) ok(html.includes(`id="${id}"`), 'control ' + id);
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
ok(fs.existsSync(path.join(dir, '../../../physics/matter/pressure/index.html')), 'comparison link target exists');
for (let i = 0; i <= 5; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

// ---- layout wording and markup hygiene (added 2026-11-10) ----
{
  const htmlX = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/[左右]图|上半张图|下半张图|left chart|right chart|lower half of the picture/i.test(v), 'no position-based chart wording in ' + k);
  const ids = [...htmlX.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  ok(new Set(ids).size === ids.length, 'element ids are unique');
  ok(!htmlX.includes('canvas-label-guard'), 'no canvas-label-guard');
  ok(htmlX.includes('<!-- page-provenance -->') && htmlX.includes('../../../page-provenance.css'), 'provenance placeholder');
}
console.log(`PASS pressure core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
