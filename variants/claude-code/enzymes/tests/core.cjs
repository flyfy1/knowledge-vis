'use strict';
// Enzymes (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b}`);

// ---- step 0: barrier and speed-up ----
near(M.speedUp(40), 5.46e6, 0.02e6, 'ΔEa 40 → ~5.5 × 10⁶ (readout default)');
for (let e0 = 80; e0 <= 130; e0++) for (let d = 0; d <= 60; d++) {
  near(M.halfLife(e0) / M.halfLife(e0 - d), M.speedUp(d), M.speedUp(d) * 1e-9, 'half-life ratio = speed-up');
}
const d10 = M.R * M.BODY_K * Math.LN10 / 1000; near(d10, 5.9, 0.05, '≈5.9 kJ/mol per ×10');
ok(M.speedUp(40) > 1e6 && M.speedUp(40) < 1e7, '"millions of times" at 40');
let u = M.timeUnit(M.halfLife(110)); ok(u.unit === 'd' && Math.abs(u.v - 2.7) < 0.05, 'default no-enzyme ≈ 2.7 days');
u = M.timeUnit(M.halfLife(70)); ok(u.unit === 'ms' && Math.abs(u.v - 43) < 0.5, 'default enzyme ≈ 43 ms');
// every half-life on the slider grid fits the log axis [1e−10, 1e10] s
for (let e = 20; e <= 130; e++) { const L = Math.log10(M.halfLife(e)); ok(L > -10 && L < 10, 'half-life on axis ' + e); }
// profile: endpoints fixed, peak height = Ea (enzyme does not change ΔG)
for (const Ea of [20, 70, 110, 130]) { near(M.profile(0, Ea, -30), 0, 0.05, 'start'); near(M.profile(1, Ea, -30), -30, 0.05, 'end'); near(M.profile(0.5, Ea, -30), Ea, 1e-9, 'peak = Ea'); }
for (const s of [1e-10, 1e-5, 0.5, 30, 600, 1e4, 1e6, 1e8]) { const q = M.timeUnit(s); ok(q.v >= 1 - 1e-9 || q.unit === 'ns', 'unit value ≥ 1 ' + s); }

// ---- step 1: specificity and reuse ----
for (let n = 0; n <= 50; n++) {
  const sq = M.encounters('square', n), ci = M.encounters('circle', n), tr = M.encounters('triangle', n);
  ok(sq.products === 2 * n && sq.converted === n && sq.enzymes === 1, 'square converts every one, enzyme not used up');
  ok(ci.products === 0 && tr.products === 0 && ci.enzymes === 1, 'wrong shapes bounce');
}
ok(M.CARBONIC_ANHYDRASE_KCAT === 6e5, 'kcat quoted as 600,000 / 60 万');

// ---- step 2: saturation ----
for (let Km = 0.5; Km <= 5; Km += 0.5) for (let E = 1; E <= 3; E += 0.5) {
  const V = M.VMAX_PER_E * E;
  near(M.mm(Km, Km, V), V / 2, 1e-9, 'v(Km) = Vmax/2');
  for (let S = 0; S <= 20; S += 0.1) {
    ok(M.mm(S, Km, V) < V, 'below Vmax'); near(M.mm(S, Km, V) / V, M.occupied(S, Km), 1e-12, 'v/Vmax = occupied fraction');
    ok(M.mm(S, Km, V) <= 330 * 0.95, 'curve stays inside the 0–330 axis');
  }
  near(M.mm(5, Km, 2 * V) / M.mm(5, Km, V), 2, 1e-12, 'doubling enzyme doubles v');
}
// "about 10 × Km, doubling buys only a few percent" (gain = (S+Km)/(2S+Km)·2 − 1 = 1/(2·10+1)·... )
near(M.mm(20, 2, 100) / M.mm(10, 2, 100) - 1, 0.0909, 0.0005, '10Km→20Km: +9.1%');
ok(M.mm(4, 2, 100) / M.mm(2, 2, 100) - 1 > 0.33, 'at Km doubling gives +33%');
// quiz: 50 Km → 100 Km
const p50 = M.occupied(50, 1), p100 = M.occupied(100, 1);
near(p50 * 100, 98.04, 0.01, 'quiz 50Km'); near(p100 * 100, 99.01, 0.01, 'quiz 100Km'); ok(Math.round((p100 / p50 - 1) * 100) === 1, 'quiz +1%');

// ---- step 3: temperature ----
const opt = M.optimum();
near(opt.T, 42.7, 0.05, 'optimum ≈ 42.7 °C (hint rounds to 43)');
near(M.activity(opt.T), 1, 1e-12, 'optimum = 100%');
for (let T = 0; T <= 80; T++) { ok(M.activity(T) <= 1 + 1e-12 && M.activity(T) >= 0, 'activity in [0,1]'); ok(T > opt.T || M.activity(T) <= M.activity(Math.min(T + 1, opt.T)) + 1e-12, 'rises up to the optimum'); if (T > opt.T + 1) ok(M.activity(T) < M.activity(T - 1), 'falls after'); }
near(M.q10(20), 1.97, 0.01, 'Q10 ≈ 2 (20→30 °C)');
near(M.activity(37), 0.816, 0.001, '37 °C ≈ 81.6% of optimum');
near(M.folded(37), 0.982, 0.001, '98.2% folded at 37 °C');
ok(M.afterCooling(60) < 0.05 * M.activity(37), 'heated to 60 then cooled: far below fresh');
for (let T = 37; T <= 80; T++) ok(M.afterCooling(T) <= M.activity(37) + 1e-12 && M.afterCooling(T + 1) <= M.afterCooling(T) + 1e-12, 'cooling never restores; hotter is worse');
near(M.afterCooling(30), M.activity(37), 1e-12, 'below 37 °C nothing extra is lost');

// ---- step 4: pH ----
for (const n of Object.keys(M.PH_ENZ)) {
  near(M.phActivity(M.phOptimum(n), n), 1, 1e-12, 'peak 100% ' + n);
  let best = -1, at = 0; for (let p = 0; p <= 140; p++) { const a = M.phActivity(p / 10, n); if (a > best) { best = a; at = p / 10; } } near(at, M.phOptimum(n), 0.051, 'scan optimum ' + n);
}
const eq3 = (a, b) => Math.abs(a - b) < 1e-9;
ok(eq3(M.phOptimum('pepsin'), 2) && eq3(M.phOptimum('amylase'), 6.8) && eq3(M.phOptimum('trypsin'), 8), 'optima at stomach / mouth / intestine');
ok(M.PLACES.stomach === 2 && M.PLACES.mouth === 6.8 && M.PLACES.intestine === 8, 'places');
// at each place the matching enzyme is the highest of the three
for (const [pl, n] of [['stomach', 'pepsin'], ['mouth', 'amylase'], ['intestine', 'trypsin']]) for (const o of Object.keys(M.PH_ENZ)) if (o !== n) ok(M.phActivity(M.PLACES[pl], n) > M.phActivity(M.PLACES[pl], o), pl);
ok(M.phActivity(8, 'pepsin') < 0.001, 'pepsin in the intestine almost dead');
ok(M.phActivity(2, 'amylase') < 0.001, 'amylase in the stomach almost dead');

// ---- step 5: inhibitors ----
const rc = s => M.inhibited('comp', s, 4).v / M.uninhibited(s);
near(rc(5) * 100, 46.7, 0.05, 'competitive [S]=5: 46.7%'); ok(Math.round(rc(5) * 100) === 47 && Math.round(rc(50) * 100) === 87, 'hint 47% → 87%');
for (let S = 0.5; S <= 50; S += 0.5) near(M.inhibited('non', S, 4).v / M.uninhibited(S), 0.2, 1e-12, 'non-competitive stuck at 20%');
for (let I = 0; I <= 10; I += 0.5) {
  for (let S = 0; S <= 50; S += 0.5) {
    for (const ty of ['comp', 'non']) {
      const r = M.inhibited(ty, S, I), st = M.states(ty, S, I);
      near(st.E + st.ES + st.EI + st.ESI, 1, 1e-12, 'states sum');
      near(r.v, M.INH.Vmax * st.ES, 1e-9, 'rate = Vmax × share in ES (icons match the curve)');
      const c = M.iconCounts(st); ok(c.E + c.ES + c.EI + c.ESI === 20, '20 icons');
      ok(r.v <= M.uninhibited(S) + 1e-12, 'inhibitor never speeds up');
    }
  }
  const s90 = M.rescueS('comp', I, 0.9);
  if (I > 0) near(rc0(I, s90), 0.9, 1e-9, '90% rescue point');
  ok(M.inhibited('comp', 1e9, I).v / M.uninhibited(1e9) > 0.999, 'competitive fully rescued at huge [S]');
  near(M.inhibited('non', 3, I).Vapp, 100 / (1 + I), 1e-12, 'non-comp Vmax cut'); near(M.inhibited('comp', 3, I).Kapp, 2 * (1 + I), 1e-12, 'comp Km raised');
}
function rc0(I, S) { return M.inhibited('comp', S, I).v / M.uninhibited(S); }
near(M.rescueS('comp', 4, 0.9), 70, 1e-9, 'default readout 70 mM');
ok(M.rescueS('non', 4, 0.9) === Infinity, 'non-comp never reaches 90%');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['s4pH', 's2lgCurve', 'gainUp', 'nav4']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const k of zk) ok(!/左图|右图|left (chart|plot|panel)|right (chart|plot|panel)/i.test(STRINGS[l][k]), 'no left/right figure references ' + k);
for (const u of ['ns', 'us', 'ms', 's', 'min', 'h', 'd', 'y']) ok(STRINGS.zh['u_' + u] && STRINGS.en['u_' + u], 'unit ' + u);
for (const s of M.SHAPES) ok(STRINGS.zh['shape_' + s], 'shape ' + s);

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'(?!\s*\+)/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['ea0', 'dea0', 'shapeSquare', 'shapeCircle', 'shapeTriangle', 'feed1', 'clear1', 'S2', 'Km2', 'E2', 'T3', 'heat3', 'fresh3', 'pH4', 'comp5', 'non5', 'I5', 'S5', 'checkQuiz']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder + css');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../biology/cells/enzymes/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS enzymes core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · optimum ${opt.T.toFixed(2)} °C`);
