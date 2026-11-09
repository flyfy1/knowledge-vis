'use strict';
// Frozen-bubble (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => { assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`); checks++; };
const K = M.K;

// ---- step 0: film vs air ----
const b0 = M.bubble(8, 1);
near(b0.filmMass, Math.PI * 64 * 1e-4, 1e-12, 'film mass = πD²h'); near(b0.airMass, Math.PI * 512 / 6 * 0.00129, 1e-12, 'air mass = πD³/6 · ρ');
near(b0.ratio, 17.2, 1e-9, 'default ratio 17.2 (= ρair·D / (6·h·ρfilm))');
let prevRatio = 0;
for (let D = 4; D <= 12; D++) {
  const r = M.bubble(D, 1).ratio; ok(r > prevRatio, 'bigger bubble → film is a smaller share'); prevRatio = r;
  for (let h = 0.5; h <= 5; h += 0.5) {
    const b = M.bubble(D, h);
    ok(b.ratio > 1, `air outweighs film at every slider setting (D=${D}, h=${h})`);
    near(b.ratio, K.rhoAir * D / (6 * h * 1e-4 * K.rhoFilm), 1e-9, 'ratio formula');
    near(b.hairRatio, 70 / h, 1e-12, 'hair ratio');
  }
}
ok(K.N2 < -200 && K.O2 < -200, 'air components freeze only near −210 °C');

// ---- steps 1–2: growth sketch ----
near(M.undercool(-20), 13.5, 1e-12, 'ΔT at −20 °C'); ok(M.tipSpeed(M.undercool(-5)) === 0 && M.tipSpeed(M.undercool(-6.5)) === 0, 'no growth at or above Tm');
const one = [M.makeSeed(0, 0)];
for (const T of [-25, -20, -12, -8, -6.5, -5, 0]) {
  const dT = M.undercool(T); let prev = -1;
  for (let tt = 0; tt <= 30; tt += 1.5) { const c = M.coverage(one, tt, dT); ok(c >= prev - 1e-12, 'coverage never shrinks'); prev = c; if (dT <= 0) ok(c === 0, 'no ice above Tm'); }
}
ok(M.coverage([], 30, 13.5) === 0, 'no seed → no ice');
near(M.coverage(one, 30, 13.5), 1, 1e-12, 'one seed at −20 °C reaches the whole patch by 30 s');
// two seeds: arms never longer than unclipped length; a later seed's arm toward the earlier one stops short
const two = [M.makeSeed(0, 0), M.makeSeed(1, 6)];
for (let k = 0; k < 6; k++) for (const i of [0, 1]) { const a = two[i].th + k * Math.PI / 3; ok(M.armReach(i, a, two, 25, 13.5) <= M.armLen(two[i], 25, 13.5) + 1e-9, 'reach ≤ arm length'); }
// arrival time agrees with the union-of-hexagons picture
for (let i = 0; i < 200; i++) { const x = Math.cos(i) * 0.7, y = Math.sin(i * 1.3) * 0.7, tt = 10; const inside = two.some(s => s.born <= tt && M.hexDist(x, y, s) <= M.armLen(s, tt, 13.5)); ok(inside === (M.arrival(x, y, two, 13.5) <= tt), 'arrival ⇔ inside a hexagon'); }
// step 2: same time, arm length ratio = undercooling ratio (s2cmp)
for (let TA = -25; TA <= -7; TA += 0.5) for (const TB of [-25, -15, -8]) {
  const dA = M.undercool(TA), dB = M.undercool(TB), la = M.armLen(one[0], 14, dA), lb = M.armLen(one[0], 14, dB);
  near(la / lb, dA / dB, 1e-12, 'arm ratio = ΔT ratio');
}
ok(M.branchGap(18.5) < M.branchGap(1), 'branches crowd as undercooling grows');
// slider ranges: patch A/B sliders top out at −6 °C (ΔT = −0.5, s2zero shown), bottom at −25 °C
ok(M.undercool(-6) < 0 && M.undercool(-25) === 18.5, 'step 2 slider ends');

// ---- step 3: latent-heat budget ----
near(M.fStall(13.5), 4.18 * 13.5 / 334, 1e-15, 'f* = cΔT/L');
near(M.fStall(18.5) * 100, 23.15, 0.01, 'f* at −25 °C ≈ 23% (s3hint)');
ok(Math.round(M.fStall(18.5) * 100) === 23, 'fsCold rounds to 23');
for (let T = -25; T <= 0; T += 0.5) {
  const dT = M.undercool(T), fsr = M.fStall(dT);
  ok(fsr < 0.4, 'stall point always inside the 0–40% axis');
  if (dT > 0) {
    near(M.filmTemp(T, fsr), K.Tm, 1e-9, 'film reaches Tm exactly at f*');
    near(M.filmTemp(T, 0), T, 0, 'film starts at the air temperature');
    for (let f = 0; f <= 0.4; f += 0.01) ok(M.filmTemp(T, f) <= K.Tm + 1e-12, 'never above Tm while freezing');
    near(M.filmTemp(T, 0.39), K.Tm, 1e-12, 'plateau beyond f*');
    const hb = M.heatBudget(8, 1, T); near(hb.qFree + hb.qRest, hb.qAll, 1e-12, 'heat budget adds up'); ok(hb.qRest > 0, 'cannot finish alone');
  } else ok(fsr === 0, 'f* = 0 at or above Tm (s3warm)');
}
near(M.heatBudget(8, 1, -20).qAll, b0.filmMass * 334, 1e-12, 'whole film latent heat');

// ---- step 4: Marangoni sketch ----
ok(M.gamma(-3) < M.gamma(-8), 'warmer → weaker surface tension'); near(M.gamma(-3) - M.gamma(-8), -0.75, 1e-12, '0.15 mN/m per °C × 5 °C');
for (let x0 = -0.5; x0 <= 0.5001; x0 += 0.05) for (let dTw = 0; dTw <= 5; dTw += 0.5) {
  for (let x = -0.95; x <= 0.95; x += 0.05) {
    const u = M.flowU(x, x0, dTw);
    if (dTw === 0) ok(u === 0 || Object.is(u, -0), 'no warmth → no flow');
    else if (Math.abs(x - x0) > 1e-6) ok(Math.sign(u) === Math.sign(x - x0), 'surface flow points away from the warm spot (toward higher tension)');
  }
  for (const xs of M.CRYSTALS) { const xe = M.advect(xs, x0, dTw, M.FLOW_T); ok(Math.abs(xe - x0) >= Math.abs(xs - x0) - 1e-9, 'crystals never drift toward the warm spot'); ok(Math.abs(xe) <= 0.98, 'stays on the strip'); }
}
// the temperature axis Tb−0.5..Tb+5.5 holds every profile; the γ axis is the same range mapped through γ(T)
ok(M.STRIP_BASE + 5 <= M.STRIP_BASE + 5.5, 'temperature axis');

// ---- step 5: front stop ----
for (let T = -25; T <= 25; T++) {
  const z = M.frontStop(T);
  ok((z === 1) === (M.profileT(1, T) <= K.Tm), 'full freeze exactly when even the top of the film is below Tm (s5full)');
  if (T <= K.Tm) ok(z === 1, 'air below Tm → full freeze');
  if (z < 1) { near(M.profileT(z, T), K.Tm, 1e-9, 'front sits where the film is back at Tm'); ok(M.profileT(z * 0.9, T) < K.Tm && M.profileT(Math.min(1, z * 1.1 + 1e-3), T) > K.Tm, 'colder below, warmer above'); }
  if (T > -25) ok(z <= M.frontStop(T - 1) + 1e-12, 'warmer air → front stops lower');
  near(M.profileT(0, T), M.BASE_T, 1e-12, 'film at the base is at the base temperature');
}
ok(M.frontStop(-18) === 1 && M.frontStop(25) < 0.5 && M.frontStop(25) > 0, 'cold room freezes fully; warm air stops partway');

// ---- prose quotes the model's constants ----
for (const l of ['zh', 'en']) {
  const S = STRINGS[l];
  ok(S.s1e.includes('−6.5 °C') && S.s5e.includes('−6.5 °C'), 'Tm quoted');
  ok(S.s3e.includes('334') && S.s3e.includes('4.18'), 'L and c quoted');
  ok(S.s4e.includes('0.15'), 'dγ/dT quoted'); ok(S.s0e.includes('70 µm') && S.s0e.includes('0.00129'), 'hair and air density quoted');
  ok(S.coldRoom.includes('−18') && S.warmRoom.includes('+25'), 'preset labels match the buttons');
  ok(S.source.includes('10.1038/s41467-019-10021-6'), 'source DOI');
}
ok(K.Tm === -6.5 && K.Lf === 334 && K.c === 4.18 && K.dGamma === -0.15 && K.hair === 70 && K.rhoAir === 0.00129, 'constants as quoted');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');

// ---- keys, controls, provenance placeholder ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) { ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]); ok(!/\{[a-zA-Z0-9]+\}/.test(STRINGS.zh[m[1]]), 'static key without placeholders ' + m[1]); }
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['D0', 'h0', 'T1', 't1', 'seed1', 'grow1', 'reset1', 'TA', 'TB', 't2', 'grow2', 'T3', 'f3', 'x4', 'd4', 't4', 'play4', 'T5', 'cold5', 'warm5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder');

// ---- deep links ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../physics/thermal/frozen-bubble/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS frozen-bubble core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · f*(−25 °C) = ${(M.fStall(18.5) * 100).toFixed(2)}% · front at +25 °C = ${(M.frontStop(25) * 100).toFixed(1)}%`);
