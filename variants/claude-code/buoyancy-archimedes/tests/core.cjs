'use strict';
// Buoyancy (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const both = (key, text) => { for (const l of ['zh', 'en']) ok(STRINGS[l][key].includes(text), `${l}.${key} quotes ${text}`); };

// ---- step 0: the block ----
ok(M.BLOCK.V === 200 && M.BLOCK.m === 540, 'block 200 cm³, 540 g');
near(M.BLOCK.W, 5.29, 0.005, 'W ≈ 5.29 N'); both('s0e', '5.29'); both('s0e', '540'); both('s0e', '200');
for (let k = 0; k <= 60; k++) {
  const z = k / 5, q = M.lowered(z);
  near(q.reading + q.Fb, M.BLOCK.W, 1e-12, 'reading + Fb = W');
  if (z >= 8) near(q.Fb, 1.96, 1e-9, 'full Fb 1.96 N beyond 8 cm');
  else near(q.Fb, M.N(25 * z), 1e-12, 'Fb grows linearly before 8 cm');
  ok(q.full === (z >= 8), 'fully under exactly from 8 cm');
}
// ---- step 1: pressure difference = buoyant force ----
for (let k = 0; k <= 40; k++) {
  const z = k / 2, f = M.faces(z);
  near(f.net, M.lowered(z).Fb, 1e-12, 'Fbottom − Ftop = scale-measured Fb at z=' + z);
  if (z <= 8) near(f.Ftop, 0, 1e-12, 'top face dry until fully under');
  if (z > 8) { const g = M.faces(z + 0.5); near(g.Ftop - f.Ftop, g.Fbot - f.Fbot, 1e-12, 'both faces gain equally'); }
}
near(M.faces(20).Fbot, 4.9, 1e-9, 'bottom force at 20 cm within the 0–5 N axis');
// ---- step 2: overflow can, Archimedes ----
for (const k of Object.keys(M.MATS)) for (let V = 50; V <= 400; V += 50) {
  const q = M.overflow(k, V);
  near(q.Fb, q.spilledWeight, 1e-12, 'buoyant force = weight of displaced water');
  near(q.Fb, M.N(V), 1e-12, 'independent of material');
  ok(q.reading > 0, 'all materials sink (scale still reads)');
  ok(M.MATS[k] > 1, k + ' denser than water');
}
near(M.MATS.iron / M.MATS.al, 2.93, 0.01, 'iron ≈ 3× aluminium'); ok(STRINGS.zh.s2hint.includes('3 倍') && STRINGS.en.s2hint.includes('three times'), 'nearly three times quoted');
ok(M.N(450) <= 4.5, 'plot axis holds the line');
// ---- step 3: float / hover / sink ----
for (const [lk, rl] of Object.entries(M.LIQ)) for (let i = 0; i <= 56; i++) {
  const ro = +(0.2 + 0.05 * i).toFixed(2), q = M.settle(ro, rl);
  if (ro < rl) { ok(q.state === 'float', 'float'); near(q.frac, ro / rl, 1e-12, 'fraction = ρo/ρl'); near(q.Fb, q.W, 1e-12, 'floating: Fb = W'); }
  else if (ro > rl) { ok(q.state === 'sink', 'sink'); near(q.support, q.W - q.FbMax, 1e-12, 'support makes up the difference'); ok(q.support > 0, 'positive support'); }
  else ok(q.state === 'hover', 'hover at equal density');
}
ok(M.settle(1.0, M.LIQ.water).state === 'hover', 'slider hits 1.00 exactly');
ok(M.settle(1.05, 1.0).state === 'sink' && M.settle(1.05, 1.1).state === 'float', '1.05 sinks in water, floats in brine');
ok(M.LIQ.oil === 0.92 && M.LIQ.brine === 1.1, 'liquid densities quoted in buttons and hint');
for (const v of ['1.05', '1.10', '0.92']) both('s3hint', v);
// ---- step 4: steel boat ----
{
  const b = M.boat(5, 0);
  near(b.lumpV, 76, 0.1, 'lump ≈ 76 cm³'); both('s4e', '76'); both('s4e', '600');
  ok(b.lumpFb < b.lumpW, 'lump sinks');
  ok(M.boat(5, 0).maxCargo === 400 && M.boat(8, 0).maxCargo === 1000 && M.boat(3, 0).maxCargo === 0, 'max cargo 400 / 1000 / 0');
  for (const v of ['400', '1000', '3 cm', '8 cm']) both('s4hint', v);
  near(7.9, M.BOAT.rhoSteel, 0, 'steel 7.9'); both('s4t', '7.9');
  for (let H = 2; H <= 8; H += 0.5) for (let c = 0; c <= 1500; c += 50) {
    const q = M.boat(H, c);
    ok(q.sinks === (q.avg > 1 + 1e-12), 'sinks exactly when average density > water');
    ok(q.sinks === (c > q.maxCargo), 'sinks exactly past max cargo');
    near(q.draft, (600 + c) / 200, 1e-12, 'draft = mass / (ρ·A)');
  }
  ok(M.boat(8, 1500).draft <= 11, 'draft axis 0–11 covers the slider');
}
// ---- step 5: hydrometer ----
near(M.hydLevel(0.8) - M.hydLevel(0.9), 5.0, 1e-9, '0.8–0.9 gap 5.0 cm');
near(M.hydLevel(1.1) - M.hydLevel(1.2), 2.727, 1e-3, '1.1–1.2 gap 2.7 cm');
for (let i = 0; i <= 40; i++) { const r = 0.8 + i / 100, h = M.hydLevel(r); ok(h >= 0 && h <= 20, 'surface on the 20 cm stem'); near(M.HYD.m / r, M.HYD.bulb + h * M.HYD.stem, 1e-9, 'displaced volume'); }
ok(M.hydLevel(0.9) - M.hydLevel(1.0) > M.hydLevel(1.0) - M.hydLevel(1.1), 'marks crowd at high density');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['barW', 'barN']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5') && STRINGS[l].foot.includes(l === 'zh' ? '浮力与阿基米德' : 'Buoyancy & Archimedes'), 'footer');

const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of html.matchAll(/data-i18n="([^"]+)"/g)) for (const l of ['zh', 'en']) ok(!/<[a-z]/.test(STRINGS[l][m[1]]), `plain-text key ${m[1]} has no HTML`);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'\s*[,)]/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['z0', 'sweep0', 'clear0', 'z1', 'V2', 'clear2', 'r3', 'clear3', 'H4', 'm4', 'clear4', 'r5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css') && !html.includes('canvas-label-guard'), 'provenance placeholder, css, no label guard');

const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../physics/matter/buoyancy-archimedes/index.html')) && html.includes('href="../../../physics/matter/buoyancy-archimedes/"'), 'comparison link');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS buoyancy-archimedes core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
