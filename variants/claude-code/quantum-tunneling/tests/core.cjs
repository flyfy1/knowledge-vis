'use strict';
// Quantum tunnelling (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const V = M.V0;
const range = (a, b, d) => { const out = []; for (let v = a; v <= b + 1e-9; v += d) out.push(Number(v.toFixed(6))); return out; };
const slider = id => { const m = html.match(new RegExp(`id="${id}"[^>]*min="([^"]+)" max="([^"]+)" step="([^"]+)" value="([^"]+)"`)); assert.ok(m, 'slider ' + id); return { min: +m[1], max: +m[2], step: +m[3], value: +m[4] }; };
const grid = id => { const s = slider(id); return range(s.min, s.max, s.step); };

// ---- defaults quoted in the tagline: E = 0.5 eV, wall 1 eV ----
ok(V === 1 && slider('e0').value === 0.5, 'tagline numbers are the step 0 defaults');
for (const l of ['zh', 'en']) ok(STRINGS[l].tagline.includes('0.5 eV') && STRINGS[l].tagline.includes('1 eV'), 'tagline quotes 0.5 eV and 1 eV');

// ---- step 0: semi-infinite wall ----
for (const E of grid('e0')) {
  const st = M.step(E, V);
  near(st.R, 1, 1e-12, 'R = 1 for an infinitely thick wall');
  near(st.edge, 4 * E / V, 1e-9, 'density at the face = 4E/V');
  const dlt = M.densityDepth(V, E);
  near(st.density(dlt) / st.edge, Math.exp(-1), 1e-9, 'density falls by e over δ = 1/(2κ)');
  for (const d of grid('d0')) near(st.density(d), st.edge * Math.exp(-2 * st.kappa * d), 1e-9, 'exponential tail');
  // ψ and ψ′ continuous at the face
  const e = 1e-7, p = st.psi;
  near(p(-e)[0], p(e)[0], 1e-5, 'ψ continuous'); near(p(-e)[1], p(e)[1], 1e-5, 'ψ continuous (im)');
  ok(Math.abs((p(e)[0] - p(-e)[0]) / (2 * e) - (p(2 * e)[0] - p(e)[0]) / e) < 1e-2 * (1 + st.kappa * st.edge), 'ψ′ continuous');
  // incoming fringes swing between 0 and 4 (|r| = 1)
  ok(Math.max(...range(-2, -0.01, 0.002).map(st.density)) <= 4 + 1e-9, 'fringes ≤ 4 (the y-axis tops at 4.3)');
}
// tail is longer when E is closer to the top (s0hint)
ok(M.densityDepth(V, 0.95) > M.densityDepth(V, 0.5) && M.densityDepth(V, 0.5) > M.densityDepth(V, 0.05), 'tail lengthens as E → V');

// ---- steps 1–3: rectangular barrier ----
let maxErr = 0;
for (const E of range(0.02, 4, 0.02)) for (const a of range(0.1, 2, 0.05)) {
  const b = M.barrier(E, V, a);
  maxErr = Math.max(maxErr, Math.abs(b.T - M.Tformula(E, V, a)), Math.abs(b.T + b.R - 1));
  // flat transmitted density = T (s1 readout)
  for (const x of [a + 0.3, a + 1, a + 2.4]) near(b.density(x), b.T, 1e-9, 'flat line behind the wall = T');
  // continuity at both faces
  const e = 1e-8;
  for (const x0 of [0, a]) { near(b.psi(x0 - e)[0], b.psi(x0 + e)[0], 1e-5, 'ψ continuous at face'); near(b.psi(x0 - e)[1], b.psi(x0 + e)[1], 1e-5, 'ψ continuous at face (im)'); }
}
ok(maxErr < 1e-7, 'matching solution = closed form, T + R = 1 (max err ' + maxErr + ')'); checks++;
// step 1: T falls with a but never reaches 0 within the slider range
{ const Ts = grid('a1').map(a => M.Tformula(0.5, V, a)); ok(Ts.every((v, i) => i === 0 || v < Ts[i - 1]) && Ts[Ts.length - 1] > 0, 'T decreases with a, stays > 0'); }

// step 2: thick-wall estimate within 4% once κa ≥ 2 (fine sweep below); per-slice factor; muon and proton ratios
for (const E of grid('e2')) for (const a of range(0.05, 2, 0.05)) {
  const ka = M.kappa(V, E) * a, ratio = M.Tthick(E, V, a) / M.Tformula(E, V, a);
  if (ka >= 2) ok(Math.abs(ratio - 1) < 0.04, `thick-wall estimate within 4% for κa ≥ 2 (E=${E}, a=${a}: ${ratio})`);
  if (ka >= 2) near(M.Tformula(E, V, a + 0.1) / M.Tformula(E, V, a), M.perSlice(V, E), 0.02 * M.perSlice(V, E), 'each extra 0.1 nm multiplies T by about e^(−0.2κ) (within 2% once κa ≥ 2)');
  // log10T agrees with the closed form where the closed form does not underflow
  const lgT = M.log10T(E, V, a); near(lgT, Math.log10(M.Tformula(E, V, a)), 1e-9, 'log10T');
}
{ let w = 0; for (let E = 0.05; E < 0.951; E += 0.005) for (let a = 0.005; a < 3; a += 0.0025) if (M.kappa(V, E) * a >= 2) w = Math.max(w, Math.abs(M.Tthick(E, V, a) / M.Tformula(E, V, a) - 1)); ok(w < 0.04, 's2e: under 4% for κa ≥ 2 (fine sweep, worst ' + w + ')');
  for (const l of ['zh', 'en']) ok(STRINGS[l].s2e.includes('4%') && STRINGS[l].s2e.includes('κa'), 's2e quotes the tested bound'); }
{ // "the thin-wall estimate peels away": at the thinnest walls it is off by more than 20% for every E
  for (const E of grid('e2')) { near(M.Tformula(E, V, 1e-6), 1, 1e-6, 'exact T → 1 as a → 0'); near(M.Tthick(E, V, 1e-6), 16 * E / V * (1 - E / V), 1e-4, 'estimate → 16(E/V)(1 − E/V)'); }
  ok(M.Tthick(0.5, V, 0.05) / M.Tformula(0.5, V, 0.05) > 2, 'at the default E the mismatch is plain for thin walls');
}
near(Math.sqrt(M.MMU_ME), 14.4, 0.05, 'muon κ ratio √207'); near(Math.sqrt(M.MP_ME), 42.9, 0.05, 'proton κ ratio √1836');
for (const E of grid('e2')) {
  near(M.kappa(V, E, M.MP_ME) / M.kappa(V, E), Math.sqrt(M.MP_ME), 1e-9, 'κ ∝ √m');
  // "the proton soon drops off the bottom" (below 10⁻³⁰) inside the slider range, for every E
  ok(grid('a2').some(a => M.log10T(E, V, a, M.MP_ME) < -30), 'proton leaves the chart, E=' + E);
  // lower E → steeper (s2hint)
}
ok(M.perSlice(V, 0.05) < M.perSlice(V, 0.5) && M.perSlice(V, 0.5) < M.perSlice(V, 0.95), 'lower E → steeper line');
// quiz: E = 0.5, a 0.5 → 1 nm; answer b = about 1/36
{
  const r = M.Tformula(0.5, V, 0.5) / M.Tformula(0.5, V, 1);
  ok(Math.round(r) === 36, 'quiz ratio ≈ 36: ' + r);
  ok(/value === 'b'/.test(app), 'quiz answer is option b');
}

// step 3: resonances (T = 1), classical step, below-the-top statement at a = 1 nm
for (const a of grid('a3')) {
  const res = M.resonances(V, a, 4);
  res.forEach((E, n) => { near(M.Tformula(E, V, a), 1, 1e-9, 'T = 1 at resonance'); near(a / (M.lambdaIn(E, V) / 2), n + 1, 1e-9, 'whole number of half-wavelengths'); });
  // T < 1 between resonances above the top
  for (const E of range(1.05, 4, 0.05)) if (res.every(er => Math.abs(er - E) > 0.02)) ok(M.Tformula(E, V, a) < 1 - 1e-6, 'partial reflection above the top');
}
ok(M.Tformula(V, V, 1) < 0.2 && M.Tformula(V + 0.01, V, 1) < 0.2, 's3hint: just over the top T is still far below 1 at a = 1 nm');
{ // thicker wall → resonances crowd together
  const gap = a => { const r = M.resonances(V, a, 40); return r[1] - r[0]; };
  ok(gap(2) < gap(1) && gap(1) < gap(0.5), 'resonance spacing shrinks with a');
}
// the default readout (E = 2, a = 1) lists 1.38 and 2.50 eV
assert.deepEqual(M.resonances(V, 1, 4).map(e => e.toFixed(2)), ['1.38', '2.50']); checks++;

// ---- step 4: wave packet ----
let worst = 0;
const cases = [];
for (const E0 of grid('e4')) cases.push([E0, 0.4]);
for (const a of grid('a4')) cases.push([0.5, a], [1.2, a]);
for (const [E0, a] of cases) {
  const pk = M.packet(E0, V, a);
  let minTotal = 1, maxTotal = 1;
  for (let i = 0; i < pk.steps; i++) { pk.stepOnce(); if (i % 50 === 0) { const q = pk.parts(); minTotal = Math.min(minTotal, q.total); maxTotal = Math.max(maxTotal, q.total); } }
  const q = pk.parts();
  ok(Math.abs(minTotal - 1) < 1e-6 && Math.abs(maxTotal - 1) < 1e-6, 'total probability conserved');
  ok(q.inside < 1e-4, 'nothing left inside the wall at the end');
  // run stops before anything reaches the hard ends of the box
  const edge = Math.max(...[0, 1, 2, pk.N - 3, pk.N - 2, pk.N - 1].map(j => pk.re[j] ** 2 + pk.im[j] ** 2));
  ok(edge < 1e-8, 'packet never touches the box ends');
  const diff = Math.abs(q.right - M.averagedT(E0, V, a)); worst = Math.max(worst, diff);
  ok(diff < 0.01, `run vs energy-averaged T (E0=${E0}, a=${a}): ${diff}`);
}
{ const d = M.packet(slider('e4').value, V, slider('a4').value); ok(d.tEnd > 50 && d.tEnd < 200, 's4hint: the default run lasts about a hundred femtoseconds (' + d.tEnd + ')'); }
// detections are Bernoulli trials with the run's probability
{ const rng = M.mulberry32(7); let k = 0; const n = 20000; for (let i = 0; i < n; i++) if (rng() < 0.3) k++; near(k / n, 0.3, 0.01, 'seeded detections follow p'); }

// ---- step 5: alpha decay ----
const G = M.ISOTOPES.map(i => ({ i, g: M.gamow(i.Zd, i.Ad, i.Q), lm: Math.log10(i.half) }));
const diffs = G.map(o => Math.abs(o.g.log10Half - o.lm));
ok(Math.max(...diffs) < 2, 'model within 2 orders of magnitude for every nucleus');
ok(G[diffs.indexOf(Math.max(...diffs))].i.id === 'Po210', '²¹⁰Po is the worst case');
const lms = G.map(o => o.lm), span = Math.max(...lms) - Math.min(...lms);
ok(Math.round(span) === 24 && span > 20 && span < 30, 'half-lives span 24 orders ("more than twenty")');
const qs = M.ISOTOPES.map(i => i.Q), qr = Math.max(...qs) / Math.min(...qs);
ok(qr > 1.8 && qr < 2.2, 'Q differs by about a factor of two (' + qr + ')');
{ const th = o => o.g.b - o.g.R, thin = G.find(o => o.i.id === 'Po212'), thick = G.find(o => o.i.id === 'Th232'); ok(th(thick) / th(thin) > 2, 'wall more than twice as thick'); }
ok(M.ISOTOPES.find(i => i.id === 'Po212').half < 1e-6, 'polonium-212 under a microsecond');
ok(M.ISOTOPES.find(i => i.id === 'U238').half / M.YEAR > 1e9, 'uranium-238 billions of years');
G.forEach(o => { ok(o.g.Vtop > o.i.Q * 2.5 && o.g.b > o.g.R, 'Coulomb wall far above Q'); });
ok(G.every(o => o.g.Vtop >= 25.5 && o.g.Vtop <= 28.5), 'wall tops 26–28 MeV');
// half-life falls as Q rises (b moves in): monotone over the slider
for (const o of G) { const hs = grid('q5').map(q => M.gamow(o.i.Zd, o.i.Ad, q)); ok(hs.every((h, k) => k === 0 || (h.log10Half < hs[k - 1].log10Half && h.b < hs[k - 1].b)), 'monotone in Q for ' + o.i.id); }
// slider spans every isotope's Q
ok(qs.every(q => q >= slider('q5').min && q <= slider('q5').max), 'Q slider covers every isotope');
ok(slider('q5').value === M.ISOTOPES.find(i => i.id === 'U238').Q, 'default isotope U-238');

// ---- finale: STM factors ----
near(M.stmFactor(4.5, 0.1), 8.8, 0.05, 'STM ×8.8 per 0.1 nm'); near(M.stmFactor(4.5, 0.02), 1.5, 0.05, 'STM ×1.5 per 0.02 nm');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['formula', 'thQ']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5') && STRINGS[l].foot.includes(l === 'zh' ? '量子隧穿 · 穿墙的是概率，不是子弹' : 'Quantum Tunnelling · What Passes Through the Wall Is a Probability'), 'footer names the model and the original');
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/左图|右图|left plot|right plot|left-hand|right-hand/i.test(v), 'no left/right plot wording in ' + k);

// ---- every key referenced in HTML/app exists ----
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['e0', 'd0', 'a1', 'e1', 'a2', 'e2', 'e3', 'a3', 'e4', 'a4', 'q5', 'run4', 'reset4', 'det1', 'det100', 'checkQuiz', 'isoRow', 'isoTable']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no canvas-label-guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder + stylesheet');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../physics/modern/quantum-tunneling/index.html')) && html.includes('href="../../../physics/modern/quantum-tunneling/"'), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS quantum-tunneling core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · packet vs averaged T worst ${worst.toExponential(1)} · Gamow worst ${Math.max(...diffs).toFixed(2)} decades`);
