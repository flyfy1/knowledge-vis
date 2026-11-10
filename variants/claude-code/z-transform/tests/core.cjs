'use strict';
// Z-transform (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => { assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`); checks++; };
const cnear = (z, w, tol, msg) => { near(z[0], w[0], tol, msg + ' re'); near(z[1], w[1], tol, msg + ' im'); };
const both = (key, frag) => { for (const l of ['zh', 'en']) ok(STRINGS[l][key].includes(frag), `${l}.${key} quotes ${frag}`); };
const NAME = 'z-transform', ORIGINAL = '../../../signal/transforms/z-transform/index.html';
const NEUTRAL = new Set(['s0lgPt', 'nav2']); // symbol only
const CONTROLS = ['r0', 'th0', 'a1', 'rho1', 'sg2', 'w2', 'p2', 'rocOut', 'rocRing', 'rocIn', 'checkQuiz', 'w4', 'r4', 'walk4', 'w05', 'rho5'];

// ---- step 0: powers of z0 ----
for (let r = 0.5; r <= 1.15 + 1e-9; r += 0.05) for (let th = 0; th <= 180; th += 15) {
  const z0 = M.polar(r, th * Math.PI / 180);
  for (let n = 0; n <= 30; n++) { const p = M.cpow(z0, n); near(M.seq0(r, th * Math.PI / 180, n), p[0], 1e-9 * Math.max(1, Math.pow(r, n)), 'x[n] = Re z0ⁿ'); near(M.cabs(p), Math.pow(r, n), 1e-9 * Math.max(1, Math.pow(r, n)), '|z0ⁿ| = rⁿ'); }
}
near(Math.pow(0.9, 10), 0.349, 5e-4, 'default r¹⁰'); near(360 / 30, 12, 0, 'default period 12 samples');

// ---- step 1: geometric series and ROC ----
for (let a = -1.2; a <= 1.2001; a += 0.1) for (let rho = 0.2; rho <= 2.0001; rho += 0.05) {
  const z = M.polar(rho, Math.PI / 4), q = Math.abs(a) / rho, S = M.partialSums(a, z, 40);
  if (q < 1 - 1e-9) { const err = M.cabs(M.csub(S[40], M.closed1(a, z))); ok(err <= Math.pow(q, 41) / (1 - q) + 1e-9, `S40 within the geometric tail bound a=${a.toFixed(1)} ρ=${rho.toFixed(2)}`); }
  else if (Math.abs(q - 1) < 1e-9) { const T = M.partialSums(a, z, 400); ok(M.cabs(M.csub(T[400], T[399])) > 0.99, 'on the circle the terms never shrink'); }
  else if (Math.abs(a) > 1e-9) { const d = M.cabs(M.csub(S[40], S[39])); ok(d > 1 && isFinite(M.cabs(S[40])), 'diverges when |z| < |a|: the 40th term exceeds 1'); }
}
both('s1hint', '0.8');

// ---- step 2: z = e^{sT} ----
for (let sg = -1.5; sg <= 0.5001; sg += 0.05) for (let w = -7; w <= 7.0001; w += 0.1) {
  const m = M.s2z(sg, w); near(m.r, Math.exp(sg), 1e-12, '|z| = e^σ'); near(M.cabs(m.z), m.r, 1e-12, 'modulus');
  ok(m.ang > -Math.PI - 1e-12 && m.ang <= Math.PI + 1e-12, 'angle wrapped');
  cnear(M.s2z(sg, w + 2 * Math.PI).z, m.z, 1e-9, 'twins s ± j2π land on the same z');
  ok((M.cabs(m.z) < 1) === (sg < -1e-12) || Math.abs(sg) < 1e-9, 'inside the circle ⇔ σ < 0');
}
near(Math.exp(-0.3), 0.741, 1e-3, 'e^(−0.3)'); both('s2hint', '3.14');

// ---- step 3: three ROCs ----
for (let p2 = -1.6; p2 <= -0.6 + 1e-9; p2 += 0.05) for (const roc of M.ROCS) {
  const zm = roc === 'out' ? Math.abs(p2) + 0.3 : roc === 'ring' ? Math.sqrt(Math.abs(0.5 * p2)) : 0.3, z = M.polar(zm, 0.7);
  const [lo, hi] = M.rocRange(0.5, p2, roc);
  if (zm > lo && zm < hi) cnear(M.series3(0.5, p2, roc, z), M.X3(0.5, p2, z), 1e-6, `series = closed form in the ROC p2=${p2.toFixed(2)} ${roc}`);
  let L1 = 0; for (let n = -600; n <= 600; n++) L1 += Math.abs(M.seq3(0.5, p2, roc, n));
  const st = M.stable3(0.5, p2, roc);
  if (Math.abs(Math.abs(p2) - 1) < 1e-9) { ok(!st && (roc === 'in' || L1 > 300), 'pole on the circle: not stable, Σ|x| grows with the number of terms'); continue; }
  ok(st ? L1 < 1e3 : L1 > 1e6 || !isFinite(L1), `Σ|x| finite ⇔ unit circle in ROC p2=${p2.toFixed(2)} ${roc}`);
  ok(st === (roc === 'ring' ? Math.abs(p2) > 1 : roc === 'out' ? Math.abs(p2) < 1 : false), 'stability rule');
  // causality of the pieces
  if (roc === 'out') for (let n = -12; n < 0; n++) near(M.seq3(0.5, p2, roc, n), 0, 0, 'out: causal');
  if (roc === 'in') for (let n = 0; n <= 12; n++) near(M.seq3(0.5, p2, roc, n), 0, 0, 'in: anti-causal');
}
ok(!M.stable3(0.5, -1.25, 'out') && M.stable3(0.5, -1.25, 'ring') && M.stable3(0.5, -0.8, 'out'), 's3hint and quiz cases');
{ const { A, B } = M.twoPole(0.5, -1.25); near(A + B, 1, 1e-12, 'x[0] = 1 for the causal sequence'); }

// ---- step 4: resonator ----
for (let r = 0.5; r <= 0.98 + 1e-9; r += 0.04) {
  const F = M.res(r);
  for (let W = 0; W <= 3.14; W += 0.1) {
    const g = M.resGeometry(r, W).gain;
    near(g, M.cabs(M.Hw(F.b, F.a, W)), 1e-9, '1/(d1 d2) = |H(e^{jΩ})|');
    near(M.measureGain(F.b, F.a, W), g, 1e-6 * Math.max(1, g), `measured by filtering r=${r.toFixed(2)} Ω=${W.toFixed(1)}`);
  }
}
near(M.peakInfo(0.9).at, Math.PI / 3, 0.01, 'peak near π/3 ≈ 1.05');
for (const r of [0.9, 0.94, 0.98]) near(M.peakInfo(r).width / (2 * (1 - r)), 1, 0.1, 'half-power width ≈ 2(1 − r) for r ≥ 0.9');
ok(M.peakInfo(0.98).peak > M.peakInfo(0.9).peak && M.peakInfo(0.98).width < M.peakInfo(0.9).width, 'r → 1: taller, narrower');
ok(M.peakInfo(0.5).peak < 1.6, 'r = 0.5: peak only about 1.5'); both('s4hint', '1.5');

// ---- step 5: notch ----
for (let w0 = 0.2; w0 <= 2.5 + 1e-9; w0 += 0.05) for (let rho = 0.5; rho <= 0.98 + 1e-9; rho += 0.06) {
  const F = M.notch(w0, rho);
  near(M.cabs(M.Hw(F.b, F.a, w0)), 0, 1e-9, 'zero on the circle deletes Ω0');
  for (const W of [M.S5.want, M.S5.hum]) near(M.measureGain(F.b, F.a, W), M.cabs(M.Hw(F.b, F.a, W)), 1e-6, 'measured = |H|');
}
{ const F = M.notch(1.2, 0.9), x = Array.from({ length: 1200 }, (_, n) => M.input5(n)), y = M.filter(F.b, F.a, x);
  for (let n = 700; n < 1200; n++) near(y[n], M.cabs(M.Hw(F.b, F.a, 0.3)) * Math.cos(0.3 * n + Math.atan2(M.Hw(F.b, F.a, 0.3)[1], M.Hw(F.b, F.a, 0.3)[0])), 1e-6, 'only the 0.3 tone remains'); }
near(M.settle(0.9), 44, 0, 'transient 44 samples'); ok(M.settle(0.98) > 100 && M.settle(0.5) < 10, 's5hint: hundreds vs quick');
ok(Math.abs(M.cabs(M.Hw(...Object.values(M.notch(1.2, 0.98)), 0.3)) - 1) < 0.03, 'ρ near 1: 0.3 tone barely touched');
ok(Math.abs(M.cabs(M.Hw(...Object.values(M.notch(1.2, 0.5)), 0.3)) - 1) > 0.2, 'ρ = 0.5: 0.3 tone changed');
for (let rho = 0.5; rho <= 0.98; rho += 0.01) near(Math.pow(rho, M.settle(rho)), 0.01, 0.01, 'settle definition') && ok(Math.pow(rho, M.settle(rho) - 1) > 0.01, 'first below 1%');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) if (!NEUTRAL.has(k)) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/左图|右图|left-hand|right-hand|left chart|right chart/i.test(v) || k === '__', `${l}.${k} avoids left/right figure wording`);

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of CONTROLS) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
const pending = [];
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  if (!fs.existsSync(target) && rel.startsWith('../') && !rel.startsWith('../../')) { pending.push(h); continue; } // sibling Claude edition written in the same batch
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, ORIGINAL)), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS ${NAME} core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links${pending.length ? ' (pending sibling: ' + pending.join(', ') + ')' : ''}`);
