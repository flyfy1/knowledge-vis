'use strict';
// Electromagnetic induction (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-10.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0;
const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b}`);
const both = (key, text) => ['zh', 'en'].forEach(l => ok(STRINGS[l][key].includes(text), `${l}.${key} quotes ${text}`));
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
const range = id => { const m = html.match(new RegExp(`id="${id}"[^>]*min="([^"]+)" max="([^"]+)" step="([^"]+)" value="([^"]+)"`)); assert.ok(m, 'slider ' + id); return { min: +m[1], max: +m[2], step: +m[3], value: +m[4] }; };
const grid = r => { const out = []; for (let v = r.min; v <= r.max + 1e-9; v += r.step) out.push(+v.toFixed(6)); return out; };

// ---- step 0: flux ----
{
  const rB = range('B0'), ra = range('a0'), rt = range('th0');
  for (const B of grid(rB)) for (const a of grid(ra)) {
    const S = a * a / 1e4;
    near(M.flux(B, S, 0), B * S, 1e-15, 'θ = 0 gives the largest flux B·S');
    near(M.flux(B, S, 90), 0, 1e-15, 'edge-on: Φ = 0');
    near(M.flux(B, S, 180), -B * S, 1e-15, 'other face: Φ negative');
    ok(Math.abs(M.flux(B, S, 0)) * 1000 <= 20, 'Φ fits the ±20 mWb axis');
    if (2 * a <= ra.max) near(M.flux(B, 4 * S, 30), 4 * M.flux(B, S, 30), 1e-15, 'a ×2 → Φ ×4');
    let prevN = Infinity, prevW = Infinity;
    for (const th of grid(rt)) {
      const sl = M.slice(B, a, th);
      near(sl.w, a * Math.abs(Math.cos(th * Math.PI / 180)), 1e-12, 'projected width a·|cosθ|');
      // n counts exactly the lines (k + ½)·spacing strictly inside the band, both sides
      let n = 0; for (let k = 0; (k + 0.5) * sl.spacing < a; k++) if ((k + 0.5) * sl.spacing < sl.w / 2 - 1e-9) n += 2;
      ok(n === sl.n, `line count B=${B} a=${a} θ=${th}`);
      if (th <= 90) { ok(sl.n <= prevN && sl.w <= prevW + 1e-12, 'fewer lines as the coil tilts to 90°'); prevN = sl.n; prevW = sl.w; }
    }
    ok(M.slice(B, a, 90).n === 0, 'none at 90°');
  }
  // default readout: B = 0.6 T, a = 10 cm, θ = 0 → 6.00 mWb, 4 lines; band width doubles from 6 to 12 cm (s0hint)
  near(M.flux(rB.value, ra.value ** 2 / 1e4, rt.value) * 1000, 6, 1e-12, 'default Φ');
  ok(M.slice(rB.value, ra.value, 0).n === 4, 'default line count');
  near(M.slice(0.6, 12, 40).w / M.slice(0.6, 6, 40).w, 2, 1e-12, 'band width doubles'); both('s0hint', '6 cm'); both('s0hint', '12 cm');
  ok(grid(ra).includes(6) && grid(ra).includes(12), 'slider reaches 6 and 12 cm');
}

// ---- step 1: Faraday ----
{
  const N = 100, S = 0.01, rB = range('Bm1'), rt = range('tau1');
  for (const Bm of grid(rB)) for (const tau of grid(rt)) {
    const { t1, t2, T } = M.RAMP;
    ok(t1 + tau < t2 && t2 + tau <= T, 'both ramps fit the 4 s window');
    near(M.emfRamp(N, S, Bm, tau, t1 + tau / 2), -N * S * Bm / tau, 1e-12, 'ε = −N·S·Bmax/τ on the rise');
    near(M.emfRamp(N, S, Bm, tau, (t1 + tau + t2) / 2), 0, 0, 'steady B → ε = 0');
    ok(M.Bramp(Bm, tau, (t1 + tau + t2) / 2) === Bm, 'B holds at Bmax');
    ok(Math.abs(M.emfRamp(N, S, Bm, tau, t1 + tau / 2)) <= 10 + 1e-9, 'ε fits the ±10.5 V axis');
    // Faraday by numerical derivative of the flux: ε = −N dΦ/dt
    for (const q of [t1 + tau * 0.3, t2 + tau * 0.6, 0.1, T - 0.05]) { const h = 1e-6; near(M.emfRamp(N, S, Bm, tau, q), -N * S * (M.Bramp(Bm, tau, q + h) - M.Bramp(Bm, tau, q - h)) / (2 * h), 1e-4, 'ε = −N dΦ/dt'); }
    const area = M.emfArea(N, S, Bm, tau, t1, t1 + tau);
    near(area, -N * S * Bm, 1e-9, '∫ε dt over the rise = −N·S·Bmax, whatever τ');
    near(M.emfArea(N, S, Bm, tau, 0, T), 0, 1e-9, 'rise and fall cancel');
  }
  // quiz: halve τ → ε doubles, area unchanged
  near(M.emfRamp(N, S, 0.5, 0.25, 0.4) / M.emfRamp(N, S, 0.5, 0.5, 0.4), 2, 1e-12, 'quiz: ε doubles');
  near(M.emfArea(N, S, 0.5, 0.25, 0.3, 0.55), M.emfArea(N, S, 0.5, 0.5, 0.3, 0.8), 1e-9, 'quiz: area unchanged');
  ok(grid(rt)[0] === 0.1 && rt.max === 1.2, 's1hint range 1.2 → 0.1 s'); both('s1hint', '1.2 s'); both('s1hint', '0.1 s');
  // S = 0.01 m² is a 10 cm square
  near(0.1 * 0.1, S, 1e-15, '10 cm × 10 cm');
}

// ---- step 2: Lenz ----
{
  const rz = range('z2'), rv = range('v2');
  near(M.MAG.N * M.dipoleFlux(0) * 1000, Math.PI, 1e-9, 'NΦ at the centre = π mWb (fits ±3.6)');
  let maxE = 0;
  for (const pole of [1, -1]) for (const zc of grid(rz)) for (const v of grid(rv)) {
    const z = zc / 100, L = M.lenz(z, v, pole);
    // ε = −N dΦ/dt, with dΦ/dt = (dΦ/dz)·v checked by a numerical derivative
    const h = 1e-7, dphi = (M.dipoleFlux(z + h, pole) - M.dipoleFlux(z - h, pole)) / (2 * h) * v;
    near(M.magnetEmf(z, v, pole), -M.MAG.N * dphi, 1e-9, 'ε = −N dΦ/dt');
    maxE = Math.max(maxE, Math.abs(L.emf));
    if (Math.abs(L.emf) < 1e-12) { ok(v === 0 || Math.abs(zc) < 1e-9, 'ε = 0 only when still or centred'); continue; }
    ok(L.opposes, 'Lenz: the induced effect opposes the motion');
    ok(L.force === -Math.sign(v), 'force arrow always against the motion (s2hint)');
    // the induced field opposes the change of flux: inducedB has the sign of −dΦ/dt
    ok(Math.sign(L.inducedB) === -Math.sign(L.dphi), 'induced field opposes ΔΦ');
    ok((L.dphi * pole > 0) === (z * v < 0), 'the magnet’s flux grows in size while it approaches');
    near(M.magnetEmf(z, v, -pole), -L.emf, 1e-15, 'turning the magnet round flips ε');
    near(M.magnetEmf(z, -v, pole), -L.emf, 1e-15, 'reversing v flips ε');
    near(M.magnetEmf(-z, v, pole), -L.emf, 1e-15, 'entry and exit peaks have opposite signs');
    if (v !== 0) near(M.magnetEmf(z, 2 * v, pole), 2 * L.emf, 1e-15, 'peak ∝ speed');
  }
  ok(maxE <= 0.3, `ε fits the ±0.3 V axis (max ${maxE})`);
  // example readout at the default: approaching N pole → coil face N, repel
  const d = M.lenz(-0.04, 1, 1); ok(d.nearFace === 'N' && d.magnetFacing === 'N' && d.repel && d.approaching, 'default: like poles repel');
  // slow motion statement: 16 cm in 4 s on screen vs 0.16 s at 1 m/s
  near((rz.max - rz.min) / 100 / 1, 0.16, 1e-12, 'real transit 0.16 s'); ok(app.includes("animate('s2', 4000"), 'animation lasts 4 s');
  both('s2e', '0.16'); both('s2e', '16 cm'); both('s2e', '4');
}

// ---- step 3: rod on rails ----
{
  const rv = range('v03'), rR = range('R3'), rt = range('t3');
  const { B, L, m } = M.ROD;
  for (const v0 of grid(rv)) for (const R of grid(rR)) {
    const tau = m * R / (B * B * L * L), r0 = M.rod(v0, R, 0);
    near(r0.tau, tau, 1e-12, 'τ = mR/(B²L²)'); near(r0.emf, B * L * v0, 1e-12, 'ε = BLv'); near(r0.I, B * L * v0 / R, 1e-12, 'I = ε/R'); near(r0.F, B * r0.I * L, 1e-12, 'F = BIL');
    near(M.rod(v0, R, tau).v / v0, Math.exp(-1), 1e-12, 'v(τ) = 37% of v₀');
    ok(r0.xMax <= 6.4, 'slide distance fits the drawing'); ok(v0 <= 3.2 && r0.I <= 3 + 1e-12 && r0.F <= 1.5 + 1e-12, 'axes and arrow scales');
    for (const tt of [0.3, 1, rt.max]) {
      const a = M.rod(v0, R, tt), n = M.rodNumeric(v0, R, tt, 40000);
      near(a.v, n.v, 2e-3 * v0, 'v(t) = numerical integration'); near(a.x, n.x, 2e-3 * a.xMax + 1e-6, 'x(t) = numerical integration');
      near(a.heat, n.heat, 3e-3 * 0.5 * m * v0 * v0, 'Joule heat ∫I²R dt = numerical');
      near(a.heat, 0.5 * m * (v0 * v0 - a.v * a.v), 1e-12, 'heat = lost kinetic energy');
    }
    if (R + rR.step <= rR.max) ok(M.rod(v0, R + rR.step, 0).xMax > r0.xMax && M.rod(v0, R + rR.step, 1).v > M.rod(v0, R, 1).v, 'larger R → glides further, decays slower');
    if (2 * v0 <= rv.max) near(M.rod(2 * v0, R, 0).xMax, 2 * r0.xMax, 1e-12, 'v₀ ×2 → distance ×2');
  }
  both('s3hint', '37%');
  // the current runs clockwise on screen (down the rod): q v × B with v = +x, B = +z gives −y
  const vxB = [0 * 1 - 0 * 0, 0 * 0 - 1 * 1, 0]; ok(vxB[1] < 0, 'v × B points down the rod');
}

// ---- step 4: generator ----
{
  const rf = range('f4'), rB = range('B4'), rN = range('N4'), S = 0.01;
  for (const f of grid(rf)) for (const B of grid(rB)) for (const N of grid(rN)) {
    const g0 = M.generator(N, B, S, f, 0), w = 2 * Math.PI * f;
    near(g0.peak, N * B * S * w, 1e-12, 'ε₀ = NBSω'); near(g0.rms, g0.peak / Math.SQRT2, 1e-12, 'rms = ε₀/√2');
    near(M.rmsNumeric(N, B, S, f, 20000), g0.peak / Math.SQRT2, 1e-6 * g0.peak, 'numerical rms over a period');
    near(g0.emf, 0, 1e-12, 'θ = 0: Φ largest, ε = 0'); near(g0.phi, B * S, 1e-15, 'Φ = BS at θ = 0');
    const g90 = M.generator(N, B, S, f, 0.25 / f); near(g90.emf, g0.peak, 1e-9, 'θ = 90°: ε at its peak'); near(g90.phi, 0, 1e-15, 'θ = 90°: Φ = 0');
    ok(B * S * 1000 <= 10, 'Φ fits the ±11 mWb axis');
    for (let q = 0; q < 1; q += 0.01) { const tt = q / f, h = 1e-7; near(M.generator(N, B, S, f, tt).emf, -N * (M.generator(N, B, S, f, tt + h).phi - M.generator(N, B, S, f, tt - h).phi) / (2 * h), 1e-5 * g0.peak + 1e-9, 'ε = −N dΦ/dt'); }
    if (2 * f <= rf.max) near(M.generator(N, B, S, 2 * f, 0).peak, 2 * g0.peak, 1e-12, 'f ×2 → peak ×2');
    if (2 * N <= rN.max) near(M.generator(2 * N, B, S, f, 0).peak, 2 * g0.peak, 1e-12, 'N ×2 → peak ×2');
  }
  ok(50 > rf.max, 'mains 50 Hz is far faster than the slider');
  both('s4hint', '50 Hz');
}

// ---- charts named by title, never by side ----
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/左图|右图|left (chart|plot|picture)|right (chart|plot|picture)|on the right|on the left/.test(v), `${l}.${k} names a chart by side`);

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['s0lgCurve', 's1lgB', 's3lgV', 's4lgPhi', 's4lgE', 's1now']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');

// ---- every key referenced in HTML/app exists; controls present ----
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'\s*[,)]/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const k of ['movRight', 'movLeft', 'trendUp', 'trendDown', 'dirRight', 'dirLeft', 'relRepel', 'relAttract', 'effApproach', 'effLeave', 'spin', 'pause']) ok(STRINGS.zh[k] && STRINGS.en[k], 'dynamic key ' + k);
for (const id of ['B0', 'a0', 'th0', 'Bm1', 'tau1', 'run1', 'z2', 'v2', 'pass2', 'flip2', 'v03', 'R3', 't3', 'push3', 'f4', 'B4', 'N4', 'th4', 'spin4', 'checkQuiz']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder');
ok(!html.includes('canvas-label-guard'), 'no label guard');

// ---- number formatting: trailing zeros are only trimmed after a decimal point ----
{
  const src = app.match(/const fmt = [^\n]+/)[0];
  const fmt = new Function(src + '; return fmt;')();
  ok(fmt(90, 0) === '90' && fmt(100, 0) === '100' && fmt(1.5, 2) === '1.5' && fmt(2, 2) === '2' && fmt(-0.0001, 2) === '0' && fmt(0.075, 3) === '0.075', 'fmt keeps integer zeros');
}

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../physics/electromagnetism/electromagnetic-induction/index.html')), 'comparison link target exists');
for (let i = 0; i <= 5; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS electromagnetic-induction core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
