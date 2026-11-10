'use strict';
// Electric fields (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const nC = M.nC, cm = M.cm;
const grid = (a, b, s) => { const o = []; for (let v = a; v <= b + 1e-9; v += s) o.push(Math.round(v * 1e6) / 1e6); return o; };

// ---- Coulomb field: point formula, superposition and potential agree ----
near(M.K, 8.9875517923e9, 1, 'k ≈ 8.99e9');
for (const q of [-3, 1, 2.5]) for (const r of [0.02, 0.05, 0.1]) {
  const e = M.field([{ q: q * nC, x: 0, y: 0 }], r, 0);
  near(Math.abs(e.Ex), M.pointE(q * nC, r), 1e-9, 'field = kQ/r²'); ok(Math.sign(e.Ex) === Math.sign(q), 'outward for +, inward for −');
  near(M.potential([{ q: q * nC, x: 0, y: 0 }], r, 0), M.K * q * nC / r, 1e-9, 'V = kQ/r');
}

// ---- step 0: F ∝ q, F/q independent of q; graph range ±50 μN ----
for (const r of grid(2, 10, 0.5)) {
  const E = M.pointE(2 * nC, r * cm);
  for (const q of grid(-1, 1, 0.1)) {
    if (Math.abs(q) < 1e-9) continue;
    const F = q * nC * E; near(F / (q * nC), E, 1e-9 * E, 'F/q = E for every q');
    ok(Math.abs(F) * 1e6 <= 50, 'force inside the ±50 μN plot');
  }
}

// ---- step 1: inverse square; curve inside the 0–115 kN/C plot ----
for (const Q of grid(-5, 5, 0.5)) for (const r of grid(2, 5, 0.5)) {
  if (!Q) continue;
  near(M.pointE(Q * nC, r * cm) / M.pointE(Q * nC, 2 * r * cm), 4, 1e-9, 'E(r)/E(2r) = 4');
}
ok(M.pointE(5 * nC, 0.02) / 1000 < 115, 'largest E on the plot fits');

// ---- step 2: superposition examples from the hint ----
{
  const q1 = { q: 2 * nC, x: -0.03, y: 0 };
  const same = M.field([q1, { q: 2 * nC, x: 0.03, y: 0 }], 0, 0); near(same.E, 0, 1e-6, 'equal like charges: midpoint E = 0');
  const opp = M.field([q1, { q: -2 * nC, x: 0.03, y: 0 }], 0, 0);
  near(opp.Ex, 2 * M.pointE(2 * nC, 0.03), 1e-6, 'opposite charges: midpoint E = 2 × single'); ok(opp.Ex > 0, 'pointing right');
  for (const Q2 of grid(-4, 4, 0.5)) for (const px of grid(-8, 8, 0.5)) for (const py of grid(-5, 5, 0.5)) {
    if (Math.hypot(px + 3, py) < 0.6 || Math.hypot(px - 3, py) < 0.6) continue;
    const e1 = M.field([q1], px * cm, py * cm), e2 = M.field([{ q: Q2 * nC, x: 0.03, y: 0 }], px * cm, py * cm), e = M.field([q1, { q: Q2 * nC, x: 0.03, y: 0 }], px * cm, py * cm);
    near(e.Ex, e1.Ex + e2.Ex, 1e-9 * (e1.E + e2.E + 1), 'superposition x'); near(e.Ey, e1.Ey + e2.Ey, 1e-9 * (e1.E + e2.E + 1), 'superposition y');
    ok(e.E <= e1.E + e2.E + 1e-9, '|E| ≤ |E₁| + |E₂|');
  }
}

// ---- step 3: line counts (8 per nC) for every slider pair ----
for (const q1 of grid(-4, 4, 0.5)) for (const q2 of grid(-4, 4, 0.5)) {
  if (!q1 && !q2) continue;
  const res = M.fieldLines([{ q: q1 * nC, x: -0.03, y: 0 }, { q: q2 * nC, x: 0.03, y: 0 }]);
  ok(res.lines.every(L => L.end !== -2), 'every traced line finishes');
  const total = res.lines.length;
  if (q1 * q2 < 0) {
    near(res.landed, 8 * Math.min(Math.abs(q1), Math.abs(q2)), 0, `landed = 8 × smaller charge (${q1}, ${q2})`);
    near(total, 8 * Math.max(Math.abs(q1), Math.abs(q2)), 0, 'traced from the larger charge, 8 per nC');
  } else { near(res.landed, 0, 0, 'same sign: no line connects'); near(total, 8 * (Math.abs(q1) + Math.abs(q2)), 0, 'all lines drawn'); }
}
{ const a = M.fieldLines([{ q: 3 * nC, x: -0.03, y: 0 }, { q: -1 * nC, x: 0.03, y: 0 }]), b = M.fieldLines([{ q: 3 * nC, x: -0.03, y: 0 }, { q: -3 * nC, x: 0.03, y: 0 }]);
  ok(a.landed === 8 && b.landed === 24, 's3hint: 8 → 24 lines'); }
// start angles carry equal flux shares: 1 − cos φ evenly spaced
{ const A = M.startAngles(8); for (let j = 1; j < 8; j++) near((1 - Math.cos(A[j])) - (1 - Math.cos(A[j - 1])), 2 / 8, 1e-12, 'equal flux shares'); }

// ---- step 4: E = ΔV/Δs, field ⟂ equipotential ----
for (const q2 of grid(-4, 4, 0.5)) for (const px of grid(-8, 8, 0.5)) for (const py of grid(-5, 5, 0.5)) {
  if (Math.hypot(px + 3, py) < 0.6 || (q2 && Math.hypot(px - 3, py) < 0.6)) continue;
  const ch = [{ q: 2 * nC, x: -0.03, y: 0 }, { q: q2 * nC, x: 0.03, y: 0 }], x = px * cm, y = py * cm, e = M.field(ch, x, y);
  if (e.E < 1e-6) continue;
  const ux = e.Ex / e.E, uy = e.Ey / e.E, h = 0.001;
  const dv = M.potential(ch, x - ux * h / 2, y - uy * h / 2) - M.potential(ch, x + ux * h / 2, y + uy * h / 2);
  ok(Math.abs(dv / h - e.E) / e.E < 0.01, `centred ΔV/Δs within 1% of E at (${px}, ${py}) q2=${q2}`);
  const dvt = Math.abs(M.potential(ch, x - uy * h / 2, y + ux * h / 2) - M.potential(ch, x + uy * h / 2, y - ux * h / 2));
  ok(dvt < 0.02 * Math.abs(dv) + 1e-6, 'along the equipotential V barely changes');
}

// ---- step 5: plates from point charges ----
const st = {}; for (let N = 1; N <= 15; N++) st[N] = M.plateStats(N, 10 * nC, 0.06, 0.04);
ok(st[1].dev > 1, 'N = 1: over 100% uneven');
ok(st[15].dev < 0.1, 'N = 15: a few % uneven');
ok(Math.abs(st[15].dev - st[10].dev) < 0.02, 'beyond N = 10 it hardly changes');
for (let N = 2; N <= 15; N++) { ok(st[N].outside < 0.5 * st[N].E0, 'outside weaker than inside'); ok(st[N].Ey0 < 0, 'centre field points down'); ok(st[N].ratio < 1, 'finite plates < σ/ε₀'); }
// the leftover unevenness is an edge effect: much wider plates (same σ) are far more even
{ const wide = M.plateStats(40, 10 * nC * 16, 0.24, 0.04); ok(wide.dev < st[15].dev / 2, 'wider plates (same σ, fine grid) are more even'); near(wide.ratio, 1, 0.1, 'and approach σ/ε₀'); }
ok(st[3].dev > st[2].dev, 'odd/even bump at small N (mentioned in s5hint)');
near(st[1].ideal, 10 * nC / (0.12 * 0.12) / M.EPS0, 1e-6, 'σ/ε₀');

// ---- step 6: deflection ----
const d = 0.01, L = 0.04, D = 0.08;
const def = M.deflect(100, 2.5e7, d, L, D); ok(!def.hit, 'default does not hit');
ok(!M.deflect(200, 2.5e7, d, L, D).hit, 'hint: 200 V at 2.5 does not hit');
near(M.deflect(200, 2.5e7, d, L, D).Y / def.Y, 2, 1e-9, 'double U → double spot');
ok(!M.deflect(100, 2e7, d, L, D).hit, 'hint: 100 V at 2.0 does not hit');
near(M.deflect(100, 4e7, d, L, D).Y / M.deflect(100, 2e7, d, L, D).Y, 0.25, 1e-9, 'double v₀ → quarter');
near(M.deflect(100, 4e7, d, L, D).y1 / M.deflect(100, 2e7, d, L, D).y1, 0.25, 1e-9, 'quiz: y₁/4');
for (const U of grid(0, 300, 10)) for (const v of grid(1.5, 4, 0.1)) {
  const r = M.deflect(U, v * 1e7, d, L, D);
  ok(r.hit === (r.y1 > d / 2), 'hit ⇔ y₁ > d/2');
  if (!r.hit) { ok(r.Y <= 0.03, 'spot on the ±3 cm screen'); near(r.Y, r.y1 + D * r.tanPhi, 1e-12, 'straight after the plates'); near(r.Y, (L / 2 + D) * r.tanPhi, 1e-12, 'spot = (L/2 + D) tanφ'); }
  else ok(r.xHit < L && r.xHit > 0, 'hit point inside the plates');
  const p = M.deflectPath(U, v * 1e7, d, L, D); ok(p.pts.every(q => Math.abs(q[1]) <= d / 2 + 1e-12 || q[0] >= L), 'path stays between plates inside');
}
{ const weight = M.M_E * 9.8, force = M.E_CHARGE * 100 / d; ok(weight > 5e-30 && weight < 2e-29, 'weight ≈ 10⁻²⁹ N'); ok(Math.log10(force / weight) > 13, 'more than ten orders smaller'); }

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');

// ---- keys, controls, links ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const m of app.matchAll(/t\(([a-z]+) [>?<]/g)) void m;
for (const id of ['q0', 'r0', 'Q1', 'r1', 'Q2', 'px2', 'py2', 'Q31', 'Q32', 'Q4', 'dV4', 'px4', 'py4', 'N5', 'U6', 'v6', 'clear6', 'checkQuiz']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder and stylesheet');
ok(!html.includes('canvas-label-guard'), 'no label guard');
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../physics/electromagnetism/electric-fields/index.html')), 'comparison link target exists');
for (let i = 0; i <= 7; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS electric-fields core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · plate unevenness N=1 ${(100 * st[1].dev).toFixed(0)}% → N=15 ${(100 * st[15].dev).toFixed(1)}%`);
