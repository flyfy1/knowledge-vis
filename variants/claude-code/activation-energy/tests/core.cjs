'use strict';
// Activation energy (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const both = (key, s) => { for (const l of ['zh', 'en']) ok(STRINGS[l][key].includes(s), `${l}.${key} quotes ${s}`); };
const range = (a, b, d) => { const o = []; for (let v = a; v <= b + 1e-9; v += d) o.push(Math.round(v * 1e6) / 1e6); return o; };

// ---- step 0: the energy profile ----
for (const Ea of range(40, 160, 5)) for (const dH of range(-80, 30, 5)) {
  ok(Ea - dH >= 10, 'reverse climb Eₐ′ ≥ 10 on the slider grid');
  near(M.profile(0, Ea, dH), 0, 1e-12, 'reactants at 0'); near(M.profile(1, Ea, dH), dH, 1e-12, 'products at ΔH');
  near(M.profile(-0.3, Ea, dH), 0, 0, 'flat left plateau'); near(M.profile(1.3, Ea, dH), dH, 0, 'flat right plateau');
  let mx = -Infinity, arg = 0;
  for (let i = 0; i <= 1000; i++) { const xi = i / 1000, E = M.profile(xi, Ea, dH); if (E > mx) { mx = E; arg = xi; } }
  near(mx, Ea, 1e-9, 'summit is exactly Eₐ'); near(arg, 0.5, 1e-9, 'summit at ξ = 0.5');
  // the drawn arrows: Eₐ′ arrow at ξ = 0.86 spans ΔH..Eₐ, and the profile there lies between them
  const e86 = M.profile(0.86, Ea, dH); ok(e86 >= dH - 1e-9 && e86 <= Ea + 1e-9, 'Eₐ′ arrow crosses the profile inside its span');
}
// step 0 slider range of the plot (−90..175) holds every level
ok(-80 > -90 && 160 < 175, 'levels inside the plot range');
// atoms: B–C intact at the start, A–B at the end, both half-formed at the transition state
{ const a0 = M.atoms(0), a1 = M.atoms(1), a5 = M.atoms(0.5);
  ok(a0.bondBC === 1 && a0.bondAB === 0, 'start: B–C bonded, A free');
  ok(a1.bondAB === 1 && a1.bondBC === 0, 'end: A–B bonded, C free');
  ok(a5.bondAB > 0 && a5.bondAB < 1 && Math.abs(a5.bondAB - a5.bondBC) < 1e-9, 'transition state: both half bonds');
  for (let i = 0; i <= 100; i++) { const a = M.atoms(i / 100); ok(a.dAB >= 1 - 1e-9 && a.dBC >= 1 - 1e-9 && a.dAB + a.dBC <= 4 + 1e-9, 'atom spacing within the drawn span'); }
}

// ---- step 1: the collision lottery ----
near(M.RT(300), 2.4942, 1e-4, 'RT at 300 K');
for (const l of ['zh', 'en']) ok(STRINGS[l].s1e.includes('2.49') && STRINGS[l].s1hint.includes('2.49'), 'RT ≈ 2.49 quoted');
// the density integrates to 1 and its mean is RT (step 3 relies on this)
{ let area = 0, mean = 0; const d = 0.001; for (let E = d / 2; E < 60; E += d) { area += M.density(E, 300) * d; mean += E * M.density(E, 300) * d; }
  near(area, 1, 1e-6, 'density normalised'); near(mean, M.RT(300), 1e-4, 'mean collision energy = RT');
  // tail of the density = e^(−Eₐ/RT): the share quoted on the page
  for (const Ea of [1, 5, 15, 50]) { let tail = 0; for (let E = Ea + d / 2; E < Ea + 80; E += d) tail += M.density(E, 300) * d; near(tail / M.fraction(Ea, 300), 1, 1e-5, 'tail integral = e^(−Eₐ/RT)'); }
}
// one RT more threshold → share divided by e
for (const Ea of range(1, 15, 0.5)) near(M.fraction(Ea + M.RT(300), 300) / M.fraction(Ea, 300), 1 / Math.E, 1e-12, '1/e per RT');
// the sampler is the stated distribution: many draws reproduce the share at every slider value (within 4σ)
{ const Es = M.sample(40000, 300, 20261109);
  near(Es.reduce((s, v) => s + v, 0) / Es.length, M.RT(300), 0.05, 'sample mean ≈ RT');
  for (const Ea of range(1, 15, 0.5)) { const p = M.fraction(Ea, 300), sd = Math.sqrt(p * (1 - p) / Es.length); near(M.successes(Es, Ea) / Es.length, p, 4 * sd, 'measured share ≈ theory at Eₐ=' + Ea); }
  const { h, over } = M.histogram(Es, 0.5, 40); ok(h.reduce((s, v) => s + v, 0) + over === Es.length, 'histogram keeps every collision');
  ok(over / Es.length < 1e-3, 'almost no collision beyond the 20 kJ/mol axis');
}
// the page's seed gives a deterministic record
assert.deepEqual(M.sample(5, 300, 20261109), M.sample(5, 300, 20261109)); checks++;
// slider range 1–15 kJ/mol gives visible winners: from ~67% down to ~0.24%
ok(M.fraction(1, 300) > 0.6 && M.fraction(15, 300) > 0.002 && M.fraction(15, 300) < 0.003, 'teaching thresholds keep winners visible');

// ---- step 2: real hills ----
const dec = M.decadeStep(300);
near(dec, 5.743, 5e-4, 'RT·ln10 at 300 K');
both('s2e', '{dec}'); both('s6fin', '{dec}');
for (const Ea of range(10, 195, 5)) near(M.wait(Ea + dec) / M.wait(Ea), 10, 1e-9, 'one decade per RT·ln10');
near(M.wait(50), 0.1017, 2e-4, 'Eₐ = 50: about 0.1 s');
near(M.wait(100) / M.YEAR, 1.64, 0.01, 'Eₐ = 100: about 1.6 years');
ok(M.humanTime(M.wait(50)).unit === 'ms' && M.humanTime(M.wait(100)).unit === 'yr', 'hint units');
// the wait axis (10^−10 .. 10^27 s) holds the whole slider range and the 0 kJ/mol end of the curve
ok(Math.log10(M.wait(0)) > -10 && Math.log10(M.wait(200)) < 27, 'curve inside the wait axis');
// note categories: fast / mid / slow / never all occur on the slider and in order
{ const cat = Ea => { const w = M.wait(Ea); return w < 1 ? 0 : w < M.YEAR ? 1 : w < M.UNIVERSE ? 2 : 3; };
  const seq = range(10, 200, 5).map(cat); for (let i = 1; i < seq.length; i++) ok(seq[i] >= seq[i - 1], 'categories ordered');
  ok([0, 1, 2, 3].every(c => seq.includes(c)), 'all four notes reachable');
  ok(cat(50) === 0 && cat(75) === 1 && cat(100) === 2 && cat(160) === 3, 'notes at 50/75/100/160'); }
for (const u of ['ns', 'us', 'ms', 's', 'min', 'h', 'd', 'yr', 'kyr', 'Myr', 'Gyr']) ok(STRINGS.zh['unit_' + u] && STRINGS.en['unit_' + u], 'unit key ' + u);
for (const Ea of range(10, 200, 5)) ok(STRINGS.zh['unit_' + M.humanTime(M.wait(Ea)).unit] !== undefined, 'unit exists for Eₐ=' + Ea);

// ---- step 3: heating ----
near(M.meanRatio(300, 10), 1.0333, 1e-4, 'mean energy +3.3%');
for (const l of ['zh', 'en']) ok(STRINGS[l].s3t.includes('3%') && STRINGS[l].s3e.includes('3.3%'), '3.3% quoted');
near(Math.sqrt(310 / 300) - 1, 0.0165, 2e-4, 'collision frequency +1.7%'); for (const l of ['zh', 'en']) ok(STRINGS[l].s3e.includes('1.7%'), '1.7% quoted');
const ea2 = M.doublingEa(300, 10);
near(ea2, 53.59, 0.01, 'doubling Eₐ'); near(M.heatRatio(ea2, 300, 10), 2, 1e-12, 'doubling exact');
ok(Math.round(ea2) === 54, 'quiz option B (about 54)'); for (const l of ['zh', 'en']) ok(STRINGS[l].quizB.includes('54'), 'quiz B text');
ok(ea2 >= 20 && ea2 <= 150, 'doubling Eₐ reachable on the slider');
ok(M.heatRatio(50, 450, 10) < M.heatRatio(50, 300, 10) && M.heatRatio(50, 450, 10) < 1.5, '450 K: same 10 K buys less');
for (const T of range(250, 500, 5)) for (const dT of range(5, 50, 5)) {
  let prev = 0; for (const Ea of range(20, 150, 1)) { const r = M.heatRatio(Ea, T, dT); ok(r > prev, 'factor grows with Eₐ'); prev = r; }
  // log-axis top: max(log10 4, 1.06·log10 r(150)) keeps the curve and the ×2 line inside
  ok(Math.log10(M.heatRatio(150, T, dT)) <= Math.max(Math.log10(4), Math.log10(M.heatRatio(150, T, dT)) * 1.06), 'factor axis');
  ok(Math.log10(M.heatRatio(150, T, dT)) <= 6, 'factor ≤ 10⁶ (tick candidates)');
}

// ---- step 4: catalyst ----
for (const drop of range(0, 40, 2)) {
  const k = M.catKnots(100, -8, drop);
  let mx = -Infinity; for (let i = 0; i <= 2000; i++) mx = Math.max(mx, M.catProfile(i / 2000, 100, -8, drop));
  near(mx, 100 - drop, 1e-9, 'catalysed summit = Eₐ − ΔEₐ');
  near(M.catProfile(0, 100, -8, drop), 0, 1e-12, 'same start'); near(M.catProfile(1, 100, -8, drop), -8, 1e-12, 'same end (ΔH unchanged)');
  ok(k[2][1] < Math.min(k[1][1], k[3][1]) && k[2][1] > -25, 'intermediate is a valley inside the plot');
  const r0 = M.relax(100, -8, 300, 0), r1 = M.relax(100, -8, 300, drop), f = M.speedUp(drop);
  near(r1.kf / r0.kf, f, 1e-9 * f, 'forward × e^(ΔEₐ/RT)'); near(r1.kr / r0.kr, f, 1e-9 * f, 'reverse × the same factor');
  near(r1.xeq, r0.xeq, 1e-12, 'same equilibrium share'); near(r1.K, r0.K, 1e-9 * r0.K, 'same K');
  near(r0.half / r1.half, f, 1e-9 * f, 'half-time shrinks by the factor');
  for (const lt of range(-4, 8, 0.5)) { const tt = Math.pow(10, lt); near(r1.x(tt), r0.x(tt * f), 1e-12, 'pure left shift on a log time axis'); }
  // the time axis 10^−4..10^8 s shows both rises: start near 0, finish at the plateau
  ok(r1.x(1e-4) < 0.06 * r1.xeq && r0.x(1e8) > 0.999 * r0.xeq, 'axis covers both curves');
}
near(M.relax(100, -8, 300).xeq, 0.9611, 1e-4, 'equilibrium share 96.1%');
near(M.relax(100, -8, 300).K, Math.exp(8 / M.RT(300)), 1e-9, 'K = e^(−ΔH/RT)');
{ const k0 = M.catKnots(100, -8, 0); ok(k0[1][1] === 100 && k0[3][1] <= 100, 'ΔEₐ = 0: same summit height'); }

// ---- step 5: both directions ----
for (const Ea of range(60, 140, 5)) for (const dH of range(-50, 50, 5)) for (const T of range(300, 500, 25)) {
  const q = M.twoWay(Ea, dH, T);
  ok(q.EaRev >= 10, 'reverse climb ≥ 10');
  near(Math.log(q.K), -dH / M.RT(T), 1e-9, 'K = e^(−ΔH/RT), independent of Eₐ');
  if (T > 300) {
    if (dH > 0) ok(q.gainF > q.gainR, 'endothermic forward gains more');
    else if (dH < 0) ok(q.gainR > q.gainF, 'endothermic reverse gains more');
    else near(q.gainF, q.gainR, 1e-9 * q.gainF, 'ΔH = 0: equal gains');
  }
}
// slope of ln k vs 1/T is −Eₐ/R (the steeper line climbs the bigger hill)
near((Math.log(M.rate(80, 400)) - Math.log(M.rate(80, 300))) / (1 / 400 - 1 / 300), -80 / M.R, 1e-6, 'Arrhenius slope');

// ---- formatting helpers ----
assert.equal(M.trim('90'), '90'); assert.equal(M.trim('90.0'), '90'); assert.equal(M.trim('0.50'), '0.5'); checks += 3;
assert.equal(M.sci(2.06e-9, 1), '2.1×10⁻⁹'); assert.equal(M.sci(9.96e-5, 1), '1.0×10⁻⁴'); assert.equal(M.sci(120, 1), '120'); assert.equal(M.sci(5.2e7, 1), '5.2×10⁷'); checks += 4;

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) ok(!/左图|右图|left (panel|chart|plot)|right (panel|chart|plot)/i.test(Object.values(STRINGS[l]).join(' ')), 'no left/right figure references');

// ---- every key referenced in HTML/app exists; controls present ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'[,)]/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['xi0', 'ea0', 'dh0', 'play0', 'ea1', 'run1', 'bulk1', 'clear1', 'ea2', 't3', 'dt3', 'ea3', 'checkQuiz', 'drop4', 'run4', 'ea5', 'dh5', 't5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder + css');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../chemistry/reactions/activation-energy/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);
ok(STRINGS.zh.tagline.includes('七步') && STRINGS.en.tagline.includes('seven steps'), 'tagline step count');

console.log(`PASS activation-energy core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · doubling Eₐ ${ea2.toFixed(2)} kJ/mol · decade ${dec.toFixed(3)} kJ/mol`);
