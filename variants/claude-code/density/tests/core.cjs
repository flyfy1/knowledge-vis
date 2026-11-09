'use strict';
// Density (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const both = (key, text) => { for (const l of ['zh', 'en']) ok(STRINGS[l][key].includes(text), `${l}.${key} quotes ${text}`); };

// ---- step 0 ----
for (let m = 50; m <= 500; m += 10) {
  const r = M.equalMass(m);
  r.forEach(q => near(q.V * M.RHO[q.key], m, 1e-9, 'V = m/ρ'));
  near(r[0].V / r[3].V, 15.8, 1e-9, 'pine/iron = 15.8');
  ok(r.every(q => q.V <= 1000), 'bars within 0–1000 cm³');
}
both('s0hint', '16');
near(M.equalMass(100)[0].V * 2, M.equalMass(200)[0].V, 1e-9, 'double the mass, double the volume');
// ---- step 1 ----
for (const k of M.CUT) {
  const pts = M.PIECES.map((_, i) => M.piece(k, i));
  pts.forEach(p => { near(p.m, Math.round(M.RHO[k] * p.V * 10) / 10, 1e-12, 'balance reads to 0.1 g'); near(p.ratio, M.RHO[k], 0.05 / p.V + 1e-12, 'm/V = ρ within the balance resolution'); ok(p.V <= 130 && p.m <= 1000, 'inside plot'); });
  near(M.slope(pts), M.RHO[k], 0.005, 'slope = ρ');
  ok(fs.readFileSync(path.join(dir, 'i18n.js'), 'utf8').includes(String(M.RHO[k])), 'ρ quoted');
}
for (const v of ['2.7', '7.9', '0.5']) both('s1hint', v);
// ---- step 2 ----
{
  const q = M.room(8, 6, 3); near(q.m, 172.8, 1e-9, '8×6×3 room'); ok(Math.round(q.m) === 173 && q.students > 3, '≈173 kg, more than 3 students'); both('s2hint', '173');
  near(M.room(12, 6, 3).m, 1.5 * q.m, 1e-9, '8 → 12 m gives 1.5× mass'); both('s2hint', '1.5');
  near(q.gcm3, 0.0012, 1e-12, '1.2 kg/m³ = 0.0012 g/cm³'); both('s2e', '0.0012'); both('s2e', '1 000 000');
  ok(M.room(12, 10, 4).students <= 12, 'people row fits 12 icons');
}
// ---- step 3 ----
{
  const fits = Object.fromEntries(Object.keys(M.OBJECTS).map(id => [id, M.measure(id).fits]));
  assert.deepEqual(fits, { A: ['al'], B: ['iron', 'copper'], C: ['lead'], D: ['copper'] }); checks++;
  for (const id of Object.keys(M.OBJECTS)) {
    const q = M.measure(id); near(q.rho, M.RHO[M.OBJECTS[id].key], 1e-9, 'ideal reading gives ρ');
    ok(q.lo < q.rho && q.rho < q.hi && q.after <= 80 && q.after >= 50, 'range brackets the value; level on the drawn scale');
  }
  ok(M.OBJECTS.A.V === 20 && M.OBJECTS.B.V === 5, 'A 20 cm³, B 5 cm³'); both('s3hint', '20 cm³'); both('s3hint', '5 cm³');
  ok(M.measure('B').hi - M.measure('B').lo > 3 * (M.measure('A').hi - M.measure('A').lo), 'B range much wider');
  ok(M.REF.every(k => M.RHO[k] <= 14), 'refs on the 0–14 axis');
}
// ---- step 4 ----
{
  near(M.crown(0).V, 51.8, 0.05, 'pure gold 51.8 cm³'); both('s4hint', '51.8');
  ok(Math.round(M.crown(0.3).extra) === 13, '30 % silver: about 13 mL more'); both('s4hint', '13');
  const c = M.crown(0.3), share = (300 / 10.5) / c.V; ok(Math.round(share * 100) === 44, 'silver 44 % of the volume'); both('s4hint', '44');
  for (let p = 0; p <= 50; p += 5) { const q = M.crown(p / 100); near(q.rho * q.V, 1000, 1e-9, 'ρ = m/V'); ok(p === 0 ? Math.abs(q.naive - q.rho) < 1e-9 : q.rho < q.naive, 'true average below the naive one'); ok(q.rho >= 12 && q.rho <= 20 && 100 + q.V <= 180, 'inside axes'); }
}
// ---- step 5 ----
{
  const L = M.LAYERS.map(l => l.rho); ok(L.every((v, i) => i === 0 || v > L[i - 1]), 'layers denser downward');
  for (const v of ['0.92', '1.00', '1.06', '1.42']) both('s5hint', v);
  let prev = Infinity;
  for (let i = 0; i <= 110; i++) {
    const r = +(0.5 + i / 100).toFixed(2), q = M.settle(r);
    ok(q.bottom <= prev + 1e-9, 'denser cube never rests higher'); prev = q.bottom;
    ok(q.bottom >= 0 && q.bottom + M.CUBE <= M.TOWER + M.CUBE, 'inside glass');
    if (q.where === 'interface') { const up = M.LAYERS.find(l => l.key === q.above).rho, low = M.LAYERS.find(l => l.key === q.below).rho; ok(up <= r && r < low, 'between the two layers'); near(q.frac * low + (1 - q.frac) * up, r, 1e-9, 'balance at the interface'); }
    if (q.where === 'surface') ok(r < 0.92, 'floats on oil only below 0.92');
    if (q.where === 'floor') ok(r >= 1.42, 'floor only from 1.42');
  }
  // the staircase: a jump right after each layer density
  for (const d of [0.92, 1.0, 1.06]) ok(M.settle(d - 0.01).bottom - M.settle(d + 0.01).bottom > 1.5, 'step at ' + d);
}

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['s0item']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5') && STRINGS[l].foot.includes(l === 'zh' ? '《密度》' : '“Density”'), 'footer');

const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of html.matchAll(/data-i18n="([^"]+)"/g)) for (const l of ['zh', 'en']) ok(!/<[a-z]/.test(STRINGS[l][m[1]]), `plain-text key ${m[1]} has no HTML`);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'\s*[,)]/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const k of ['Oil', 'Water', 'Soap', 'Honey']) ok(STRINGS.zh['l' + k] && STRINGS.zh['n' + k], 'layer names ' + k);
for (const id of ['m0', 'cut1', 'clear1', 'L2', 'W2', 'H2', 'drop3', 'f4', 'r5', 'clear5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css') && !html.includes('canvas-label-guard'), 'provenance placeholder, css, no label guard');

const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../physics/matter/density/index.html')) && html.includes('href="../../../physics/matter/density/"'), 'comparison link');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS density core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
