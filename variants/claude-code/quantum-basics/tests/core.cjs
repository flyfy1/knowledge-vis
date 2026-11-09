'use strict';
// Quantum basics (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const range = (a, b, s) => { const out = []; for (let v = a; v <= b + 1e-9; v += s) out.push(Math.round(v * 1e6) / 1e6); return out; };
const D = M.DEG;

// ---- step 0: Born rule with real amplitudes ----
for (const psi of range(0, 360, 5)) {
  const s = M.realState(psi);
  near(s.p0 + s.p1, 1, 1e-12, 'probabilities sum to 1'); ok(s.p0 >= 0 && s.p1 >= 0, 'never negative');
  near(s.p0, M.abs2(s.a), 1e-12, 'P(0) = |α|²');
}
{ const a = M.realState(45), b = M.realState(135); near(a.p0, b.p0, 1e-12, '45° and 135° same P'); ok(Math.sign(a.a.re) !== Math.sign(b.a.re), 'opposite sign of α'); }
near(M.realState(30).p0, 0.75, 1e-12, 'default ψ = 30° gives P(0) = 0.75 (step 1 title)');
for (const l of ['zh', 'en']) ok(STRINGS[l].s1t.includes('0.75'), 's1t quotes 0.75');
near((-0.8) ** 2, 0.64, 1e-12, 'quiz q0'); near(0.6 ** 2 + 0.64, 1, 1e-12, 'quiz q0 normalised');

// ---- step 1: frequencies converge; the ±2σ band holds about 95% of runs ----
{
  for (const p of [0.75, 0.5, 0.1]) for (const N of [100, 400]) {
    let inside = 0; const R = 2000;
    for (let seed = 1; seed <= R; seed++) {
      const r = M.rng(seed), x = M.shots(p, N, r), f = x.filter(v => v === 0).length / N, sd = Math.sqrt(p * (1 - p) / N);
      if (Math.abs(f - p) <= 2 * sd + 1e-12) inside++;
    }
    ok(inside / R > 0.9 && inside / R < 0.995, `band coverage ≈ 95% (p=${p}, N=${N}): ${inside / R}`);
  }
  const r = M.rng(2026), big = M.shots(0.75, 5000, r); near(big.filter(v => v === 0).length / 5000, 0.75, 0.025, 'long-run frequency');
  // bias check of the generator: mean of many uniforms ≈ ½
  const u = M.rng(99); let s = 0; for (let i = 0; i < 100000; i++) s += u(); near(s / 100000, 0.5, 0.005, 'rng mean');
}

// ---- step 2: phase leaves Z alone, changes X ----
for (const th of range(0, 180, 5)) for (const ph of range(0, 360, 5)) {
  const s = M.bloch(th, ph);
  near(M.abs2(s.a) + M.abs2(s.b), 1, 1e-12, 'normalised');
  near(s.pZ, M.bloch(th, 0).pZ, 1e-12, 'Z probability independent of φ');
  near(M.abs2(s.b), Math.sin(th * D / 2) ** 2, 1e-12, '|β| unchanged by phase');
  const h = M.hadamard(s.a, s.b);
  near(M.abs2(h.a), s.pX, 1e-12, 'H then measure = (1 + x)/2'); near(M.abs2(h.a), M.abs2(M.add(s.a, s.b)) / 2, 1e-12, '|α + β|²/2');
  // Y basis: |⟨+i|ψ⟩|² = |α − iβ|²/2
  near(M.abs2(M.sub(s.a, M.mul(M.cx(0, 1), s.b))) / 2, s.pY, 1e-12, 'Y basis probability');
  near(s.pZ, (1 + s.v.z) / 2, 1e-12, 'Z = (1 + z)/2');
  near(s.v.x ** 2 + s.v.y ** 2 + s.v.z ** 2, 1, 1e-12, 'Bloch vector on the sphere');
}
near(M.bloch(90, 0).pX, 1, 1e-12, 'θ 90, φ 0: P(+) = 1'); near(M.bloch(90, 180).pX, 0, 1e-12, 'φ 180: P(+) = 0'); near(M.bloch(90, 77).pZ, 0.5, 1e-12, 'flat 0.5');
for (const th of range(10, 80, 10)) ok(M.bloch(th, 0).pX - M.bloch(th, 180).pX < M.bloch(th + 10, 0).pX - M.bloch(th + 10, 180).pX, 'smaller θ, smaller X swing');

// ---- step 3: Mach–Zehnder ----
for (const ph of range(0, 360, 5)) {
  const q = M.mz(ph, false), w = M.mz(ph, true);
  near(q.p0, Math.cos(ph * D / 2) ** 2, 1e-12, 'P(D0) = cos²(φ/2)'); near(q.p0 + q.p1, 1, 1e-12, 'D0 + D1 = 1');
  near(w.p0, 0.5, 0, 'marked path: ½'); near(w.pQuantum, q.p0, 0, 'unmarked value quoted');
  // same thing built from the gates: BS1 = H on |0⟩, phase on the upper arm, BS2 = H
  const arm = M.hadamard(M.cx(1), M.cx(0)), out = M.hadamard(arm.a, M.mul(arm.b, M.expi(ph * D)));
  near(M.abs2(out.a), q.p0, 1e-12, 'MZ = H · phase · H');
  near(M.abs2(arm.a), 0.5, 1e-12, 'each arm ½'); near(Math.sqrt(M.abs2(arm.a)), q.armAmp, 1e-12, 'arm amplitude 1/√2');
  // which-path: probabilities add, ½·½ + ½·½
  near(0.5 * 0.5 + 0.5 * 0.5, w.p0, 1e-12, '½·½ + ½·½');
}
near(M.mz(0, false).p0, 1, 1e-12, 'φ = 0: all to D0'); near(M.mz(180, false).p0, 0, 1e-12, 'φ = 180: none to D0');
// batches of 100 simulated photons land near the curve (within 3σ for ≥ 99% of batches)
{ let inside = 0, R = 0; const r = M.rng(7);
  for (const ph of range(0, 360, 15)) for (let k = 0; k < 60; k++) { const p = M.mz(ph, false).p0, f = M.shots(p, 100, r).filter(v => v === 0).length / 100; R++; if (Math.abs(f - p) <= 3 * Math.sqrt(p * (1 - p) / 100) + 1e-9) inside++; }
  ok(inside / R >= 0.99, 'photon batches near the curve ' + inside / R); }

// ---- step 4: probability = projection onto the axis ----
for (const th of range(0, 180, 15)) for (const ph of range(0, 360, 15)) {
  const s = M.bloch(th, ph);
  near(M.pAlong(s.v, 0), s.pZ, 1e-12, 'pAlong(0) = Z'); near(M.pAlong(s.v, 90), s.pX, 1e-12, 'pAlong(90) = X');
}
near(M.bloch(90, 123).pZ, 0.5, 1e-12, 'equator: Z bar at 0.5');

// ---- step 5: a middle measurement disturbs ----
for (const chi of range(0, 180, 15)) {
  const c = Math.cos(chi * D), exact = ((1 + c) / 2) ** 2 + ((1 - c) / 2) ** 2;
  near(M.pFinalZero(chi, true), exact, 1e-12, '(1 + cos²χ)/2 from the two branches');
  near(M.pFinalZero(chi, false), 1, 0, 'without middle: always 0');
  near((1 + c) / 2, M.pAlong({ x: 0, y: 0, z: 1 }, chi), 1e-12, 'P(+) for |0⟩ along χ');
  const run = M.chain(chi, true, 40000, M.rng(1000 + chi));
  near(run.last[0] / 40000, exact, 0.01, 'simulated chain matches χ=' + chi); near(run.mid[0] / 40000, (1 + c) / 2, 0.01, 'middle split');
  ok(run.first[0] === 40000 && run.first[1] === 0, 'first Z always 0');
  const off = M.chain(chi, false, 500, M.rng(5)); ok(off.last[0] === 500 && off.mid[0] + off.mid[1] === 0, 'no middle: last always 0');
}
near(M.pFinalZero(90, true), 0.5, 1e-12, 'χ = 90°: ½'); near(M.pFinalZero(0, true), 1, 1e-12, 'χ = 0'); near(M.pFinalZero(180, true), 1, 1e-12, 'χ = 180');
for (const chi of range(0, 75, 15)) ok(M.pFinalZero(chi, true) > M.pFinalZero(chi + 15, true), 'more disturbance towards 90°');
for (const chi of range(90, 165, 15)) ok(M.pFinalZero(chi, true) < M.pFinalZero(chi + 15, true), 'less disturbance past 90°');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['formula', 'q0A', 'q0B', 'q0C']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const k of ['s3which', 's3open', 'pick']) ok(STRINGS.zh[k] !== undefined, 'dynamic key ' + k);
for (const m of html.matchAll(/data-quiz="(q\d)"/g)) ok(STRINGS.zh[m[1] + 'Right'] && STRINGS.zh[m[1] + 'Wrong'], 'quiz feedback ' + m[1]);
for (const id of ['psi0', 'm1', 'm10', 'm100', 'again1', 'reset1', 'th2', 'ph2', 'ph3', 'whichOff', 'whichOn', 'fire3', 'clear3', 'th4', 'ph4', 'clear4', 'chi5', 'midOff', 'midOn', 'run5', 'clear5', 'check0', 'check3']) ok(html.includes(`id="${id}"`), 'control ' + id);
{ const ids = [...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]); ok(new Set(ids).size === ids.length, 'element ids are unique'); }
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder + css');
ok(!html.includes('canvas-label-guard'), 'no label guard');

// ---- deep links ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../physics/modern/quantum-basics/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS quantum-basics core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
