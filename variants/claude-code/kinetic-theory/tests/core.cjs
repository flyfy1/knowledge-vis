'use strict';
// Kinetic theory (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0;
const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b}`);
const both = (key, text) => ['zh', 'en'].forEach(l => ok(STRINGS[l][key].includes(text), `${l}.${key} quotes ${text}`));

// ---- reflecting motion and hit counting agree with a brute-force event simulation ----
function bruteHits(x0, v, L, tEnd) {
  let x = x0, vel = v, t = 0, hits = 0;
  for (;;) {
    const dt = vel > 0 ? (L - x) / vel : vel < 0 ? -x / vel : Infinity;
    if (t + dt > tEnd + 1e-12) return { hits, x: x + vel * (tEnd - t) };
    t += dt; x = vel > 0 ? L : 0; if (vel > 0) hits++; vel = -vel;
  }
}
{
  const r = M.rng(5);
  for (let i = 0; i < 400; i++) {
    const L = 0.4 + 1.6 * r(), x0 = L * r(), v = (r() - 0.5) * 6, tEnd = 40 * r();
    const b = bruteHits(x0, v, L, tEnd);
    ok(M.hitsBy(x0, v, L, tEnd) === b.hits, 'hit count = event simulation');
    near(M.bounce(x0, v, L, tEnd), b.x, 1e-9, 'position = event simulation');
  }
}

// ---- step 0: one molecule ----
for (let v = 0.5; v <= 3; v += 0.25) for (let L = 0.5; L <= 2; L += 0.25) {
  const th = v * v / L;
  near(M.single(v, L, 1e5).mean, th, th * 2 * L / v / 1e5 * 2 + 1e-9, 'long-run force = mv²/L');
  ok(M.single(v, L, 0.999 * L / v).hits === 0 && M.single(v, L, 1.001 * L / v).hits === 1, 'first hit at t = L/v');
  // the running mean never exceeds 2·mv²/L (it peaks at the first hit), so the 2.25× axis never clips
  for (let tt = 0.01; tt <= 12; tt += 0.01) ok(M.single(v, L, tt).mean <= 2 * th + 1e-9, 'running mean ≤ 2 mv²/L');
  near(M.single(v, L, L / v + 1e-12).mean, 2 * th, 1e-6, 'peak 2·mv²/L at the first hit');
  // s0hint: doubling v quadruples the force; doubling L halves it; impulse 2mv, gap 2L/v
  if (2 * v <= 3) near(M.single(2 * v, L, 1).theory, 4 * th, 1e-12, 'v ×2 → force ×4');
  if (2 * L <= 2) near(M.single(v, 2 * L, 1).theory, th / 2, 1e-12, 'L ×2 → force ÷2');
  near(M.single(v, L, 1).impulse, 2 * v, 1e-12, 'impulse 2mv'); near(M.single(v, L, 1).gap, 2 * L / v, 1e-12, 'gap 2L/v');
}
// default v = 1, L = 1, t = 12: exactly 6 hits and the mean has landed on mv²/L
{ const s = M.single(1, 1, 12); ok(s.hits === 6 && Math.abs(s.mean - 1) < 1e-12, 'default readout lands on the long-run value'); }
// impulse axis 0..6.6 holds 2v for v ≤ 3
ok(2 * 3 <= 6.6, 'impulse axis');

// ---- step 1: many molecules ----
let maxDev300 = 0, maxDev20 = 0;
for (let N = 5; N <= 300; N += 5) {
  const g = M.gas(N, 1), th = M.pressureTheory(g, 1).exact;
  // the measured pressure tends to Σ m vx² / V (and is exactly the hit ledger)
  near(M.wallLedger(g, 1, 4000).P, th, th * 0.01, 'long-run measured P = Σ m vx²/V, N=' + N);
  const led = M.wallLedger(g, 1, 40);
  let imp = 0, hits = 0; g.forEach(p => { const k = M.hitsBy(p.x, p.vx, 1, 40); hits += k; imp += 2 * Math.abs(p.vx) * k; });
  ok(led.hits === hits && Math.abs(led.impulse - imp) < 1e-9, 'ledger = sum over molecules');
  if (N === 20 || N === 300) {
    let m = 0; for (let tt = 10; tt <= 40; tt += 0.2) m = Math.max(m, Math.abs(M.wallLedger(g, 1, tt).P / th - 1));
    if (N === 20) maxDev20 = m; else maxDev300 = m;
  }
}
// s1hint: with 300 molecules the curve hugs the line much sooner than with 20
ok(maxDev300 < maxDev20 / 3, `N=300 settles sooner (${maxDev300} vs ${maxDev20})`);
// pressure grows with N (s1hint "pressure is proportional to the number of molecules"): per-molecule value ~ ⟨vx²⟩ = 1
for (const N of [100, 200, 300]) { const th = M.pressureTheory(M.gas(N, 1), 1).exact; ok(th / N > 0.8 && th / N < 1.2, 'P/N ≈ m⟨vx²⟩'); }

// ---- step 2: the 1/3 ----
for (const N of [10, 30, 100, 300, 1000, 3000]) {
  const R = N >= 1000 ? 150 : 600; let s = 0, s2 = 0, inside = 0;
  for (let k = 1; k <= R; k++) { const x = M.shares(M.gas(N, 5000 + k)).x; s += x; s2 += x * x; if (Math.abs(x - 1 / 3) <= 2 * M.shareSD(N)) inside++; }
  const m = s / R, sd = Math.sqrt(s2 / R - m * m);
  near(m, 1 / 3, 4 * M.shareSD(N) / Math.sqrt(R), 'mean share = 1/3, N=' + N);
  near(sd / M.shareSD(N), 1, 0.15, 'Beta(N/2, N) standard deviation, N=' + N);
  ok(inside / R > 0.9 && inside / R < 0.99, `about 95% inside the band (N=${N}: ${inside / R})`);
  near(M.shareSD(N) * Math.sqrt(N), 0.385, N >= 100 ? 0.002 : 0.03, 'sd ≈ 0.385/√N');
}
ok(1 / 3 + 2 * M.shareSD(Math.pow(10, 0.85)) > 0.6 && 1 / 3 + 2 * M.shareSD(10) < 0.8, 'band fits the 0..0.8 axis');
// beam: same speeds, all along ±x → share 1, pressure 3 × isotropic estimate
{ const g = M.gas(300, 4), b = M.beam(g), th = M.pressureTheory(b, 1); near(M.shares(b).x, 1, 1e-12, 'beam share 1'); near(th.exact / th.iso, 3, 1e-12, 'beam pressure ×3');
  g.forEach((p, i) => near(Math.hypot(p.vx, p.vy, p.vz), Math.abs(b[i].vx), 1e-12, 'beam keeps speeds')); }
// a litre of air holds about 2.5 × 10²² molecules (s2hint)
near(M.airCheck().perLitre / 1e22, 2.5, 0.05, 'molecules per litre'); both('s2hint', '2.5 × 10²²');
near(M.airCheck().pBack, 101325, 1e-6, 'P = (1/3) n m v_rms² reproduces 1 atm');

// ---- step 3: temperature ----
const he = M.realGas('He', 300), xe = M.realGas('Xe', 300), n2 = M.realGas('N2', 293.15);
near(xe.u / he.u, 32.8, 0.05, 'Xe/He mass ratio ≈ 33'); near(he.vrms / xe.vrms, 5.73, 0.01, 'v_rms ratio ≈ 5.7');
both('correct', '33'); both('correct', '5.7');
ok(n2.vrms > 490 && n2.vrms < 520 && n2.vrms > 343, 'room-temperature N2 v_rms ≈ 500 m/s, faster than sound');
for (const g of M.GASES) {
  near(M.realGas(g.id, 1200).vrms / M.realGas(g.id, 300).vrms, 2, 1e-12, '4×T → 2×v_rms');
  near(M.realGas(g.id, 300).ke, M.realGas('He', 300).ke, 1e-30, 'same mean KE for every gas');
  near(M.realGas(g.id, 500).vrms, Math.sqrt(3 * M.KB * 500 / (g.u * M.U)), 1e-9, 'v_rms = √(3kT/m)');
}
ok(M.realGas('He', 1550).vrms < 3300 && M.realGas('He', 1500).keMeV < 210, 'step 3 axes hold every value');
near(M.realGas('N2', 300).ke / M.KB / 300, 1.5, 1e-12, '(3/2)kT');

// ---- step 4: the piston ----
{
  const base = M.gas(120, 2); let mx = 0;
  for (const f of [1, 2]) {
    const g = base.map(p => ({ ...p, vx: p.vx * Math.sqrt(f), vy: p.vy * Math.sqrt(f), vz: p.vz * Math.sqrt(f) }));
    for (let L = 0.4; L <= 2.0001; L += 0.1) {
      const P = M.wallLedger(g, L, 40).P, th = M.pressureTheory(g, L).exact; mx = Math.max(mx, Math.abs(P / th - 1));
      near(th * L, M.sums(g).sx, 1e-9, 'P·V constant along the curve');
      ok(P < 650, 'measured point fits the 650 axis');
    }
    near(M.pressureTheory(g, 0.5).exact / M.pressureTheory(g, 1).exact, 2, 1e-12, 'V ÷2 → P ×2');
  }
  ok(mx < 0.01, `40-unit measurements wobble by under 1% (max ${mx})`); both('s4hint', '1%');
  near(M.sums(base.map(p => ({ ...p, vx: p.vx * Math.SQRT2 }))).sx / M.sums(base).sx, 2, 1e-12, 'temperature ×2 doubles P');
}

// ---- step 5: collisions → Maxwell ----
{
  // the density integrates to 1 and the closed-form tail matches numerical integration
  let s = 0, d = 1e-4; for (let v = d / 2; v < 12; v += d) s += M.maxwell(v) * d; near(s, 1, 1e-6, 'Maxwell normalised');
  for (const a of [0.5, 1, Math.SQRT2, Math.sqrt(3), 2, 2 * Math.SQRT2, 4]) { let q = 0; for (let v = a + d / 2; v < 12; v += d) q += M.maxwell(v) * d; near(M.tail(a), q, 2e-6, 'tail(' + a + ')'); }
  near(M.tail(2 * Math.SQRT2), 0.046, 0.0005, '4.6% beyond twice the most probable speed');
  ok(M.maxwell(Math.SQRT2) < 0.8, 'curve peak under the 0.8 axis');
  const st = M.relaxStart(M.RELAX.N, M.RELAX.seed), p0 = M.momentumOf(st), tv = [M.tvDistance(M.histogram(M.speedsOf(st)))];
  near(M.energyOf(st), 3, 1e-12, 'start ⟨v²⟩ = 3');
  for (let k = 0; k < M.RELAX.rounds; k++) {
    M.relaxRound(st); tv.push(M.tvDistance(M.histogram(M.speedsOf(st))));
    near(M.energyOf(st), 3, 1e-9, 'energy conserved'); M.momentumOf(st).forEach((v, i) => near(v, p0[i], 1e-8, 'momentum conserved'));
  }
  const floors = []; for (let sd = 11; sd < 31; sd++) { const g = M.gas(M.RELAX.N, sd); floors.push(M.tvDistance(M.histogram(g.map(p => Math.hypot(p.vx, p.vy, p.vz))))); }
  const floor = M.tvDistance(M.histogram(M.gas(M.RELAX.N, 11).map(p => Math.hypot(p.vx, p.vy, p.vz))));
  ok(tv[0] > 0.85, 'round 0 is far from Maxwell');
  ok(tv[1] < tv[0] / 2, 'one round already spreads the spike');
  for (let k = 5; k <= 12; k++) ok(tv[k] < 1.6 * Math.max(...floors), `round ${k} at the sampling-noise level (${tv[k]})`);
  ok(Math.min(...floors) > 0.015 && Math.max(...floors) < 0.05 && floor > 0.02 && floor < 0.045, 'noise floor ≈ 0.03');
  const sp = M.speedsOf(st), frac = sp.filter(v => v > 2 * Math.SQRT2).length / sp.length; near(frac, M.tail(2 * Math.SQRT2), 0.01, 'simulated tail fraction');
  const n = M.realGas('N2', 300);
  near(n.sigma, 298, 0.6, 'σ for N2 at 300 K'); near(n.vmp, 422, 0.6, 'v_mp'); near(n.vmean, 476, 0.6, '⟨v⟩'); near(n.vrms, 517, 0.6, 'v_rms');
}

// ---- charts are named by title, never by side (twin canvases stack on narrow screens) ----
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/左图|右图|left chart|right chart|on the left|on the right(?! wall)/.test(v), `${l}.${k} names a chart by side`);

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['formula', 's2lgThird']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');

// ---- every key referenced in HTML/app exists; controls present ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'\s*[,)]/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const g of M.GASES) ok(STRINGS.zh['gas' + g.id] && STRINGS.en['gas' + g.id], 'gas name ' + g.id);
for (const id of ['v0', 'L0', 't0', 'play0', 'N1', 't1', 'play1', 'N2', 'resample2', 'burst2', 'beam2', 'clear2', 'T3', 'checkQuiz', 'L4', 'tf1', 'tf2', 'measure4', 'clear4', 'play5', 'one5', 'reset5']) ok(html.includes(`id="${id}"`), 'control ' + id);
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
ok(fs.existsSync(path.join(dir, '../../../physics/thermal/kinetic-theory/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS kinetic-theory core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
