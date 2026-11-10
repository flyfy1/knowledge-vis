'use strict';
// Carnot cycle (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const rel = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol * Math.abs(b), `${msg}: ${a} vs ${b}`);
const range = (a, b, s) => { const o = []; for (let v = a; v <= b + 1e-9; v += s) o.push(Math.round(v * 1e6) / 1e6); return o; };
const TH = range(450, 900, 10), TC = range(250, 400, 10);

// ---- units: 1 kPa·L = 1 J, so p in kPa with V in L ----
near(M.pressure(10, 300), 8.314462618 * 300 / 10, 1e-9, 'p = nRT/V in kPa');

// ---- step 0: isothermal work = area = nRT ln(V2/V1); strips converge; ln-scaling claim ----
for (const T of range(300, 900, 10)) for (const r of range(1.2, 4, 0.1)) {
  const Wx = M.isoWork(T, 10, 10 * r), p = V => M.pressure(V, T);
  rel(M.stripSum(p, 10, 10 * r, 20000), Wx, 1e-8, 'fine strips = nRT ln r');
  // midpoint strips under a convex curve always undershoot, and the error shrinks with N
  let prev = Infinity;
  for (const N of [1, 2, 4, 10, 20, 40]) { const e = Math.abs(M.stripSum(p, 10, 10 * r, N) - Wx) / Wx; ok(e <= prev + 1e-15, 'error shrinks with N'); prev = e; }
  ok(prev < 0.0005, 'N = 40 error under 0.05% (shown as ~0.0x%)');
  ok(10 * r <= 45 && p(10) <= 800, 'step 0 axis holds the curve endpoints');
}
rel(M.isoWork(500, 10, 20), M.isoWork(500, 20, 40), 1e-12, '10→20 L gives the same work as 20→40 L');
rel(M.isoWork(600, 10, 30) / M.isoWork(300, 10, 30), 2, 1e-12, 'area proportional to T');

// ---- the cycle itself: states, legs, first law, entropy ----
for (const Th of TH) for (const Tc of TC) for (const r of range(1.5, 3, 0.1)) {
  const cy = M.cycle(Th, Tc, r);
  // adiabats close the loop: T V^(γ−1) constant on 2→3 and 4→1
  rel(Th * Math.pow(cy.V[1], 2 / 3), Tc * Math.pow(cy.V[2], 2 / 3), 1e-12, 'adiabat 2→3');
  rel(Th * Math.pow(cy.V[0], 2 / 3), Tc * Math.pow(cy.V[3], 2 / 3), 1e-12, 'adiabat 4→1');
  rel(cy.V[2] / cy.V[3], r, 1e-12, 'cold isotherm has the same volume ratio');
  // first law per leg; isotherms ΔU = 0; adiabats Q = 0
  cy.legs.forEach(l => near(l.Q, l.dU + l.W, 1e-9, 'Q = ΔU + W'));
  near(cy.legs[0].dU, 0, 0, 'isothermal ΔU = 0'); near(cy.legs[2].dU, 0, 0, 'isothermal ΔU = 0');
  near(cy.legs[1].Q, 0, 0, 'adiabatic Q = 0'); near(cy.legs[3].Q, 0, 0, 'adiabatic Q = 0');
  near(cy.legs.reduce((s, l) => s + l.dU, 0), 0, 1e-9, 'ΔU over a cycle = 0');
  near(cy.legs[1].W + cy.legs[3].W, 0, 1e-9, 'adiabatic works cancel');
  near(cy.W, cy.Qh - cy.Qc, 1e-9, 'W = Qh − Qc');
  // T–S rectangle: adiabats are isentropic; area (Th − Tc)ΔS = W
  near(cy.S[1], cy.S[2], 1e-9, 'adiabat 2→3 isentropic'); near(cy.S[3], cy.S[0], 1e-9, 'adiabat 4→1 isentropic');
  rel((Th - Tc) * (cy.S[1] - cy.S[0]), cy.W, 1e-9, 'T–S area = W');
  ok(cy.S[1] - cy.S[0] <= 10, 'ΔS fits the T–S axis (0..10 J/K)');
  // step 3: η = W/Qh = 1 − Tc/Th regardless of r
  rel(cy.eta, 1 - Tc / Th, 1e-12, 'η = 1 − Tc/Th');
  ok(cy.Qh <= 9000, 'Qh fits the step 3 bar axis');
  // axes: the loop fits the fixed axis for this Th and r (worst case Tc = 250)
  const ax = M.axisFor(Th, r);
  ok(Math.max(...cy.V) <= ax.Vmax + 1e-9 && M.pressure(cy.V[0], Th) <= ax.pmax + 1e-9, 'loop inside fixed axis');
}
// step 1 and step 2 shoelace area equals the leg formulas
for (const [Th, Tc, r] of [[600, 300, 2], [900, 250, 3], [450, 400, 1.5], [700, 330, 2]]) rel(M.loopArea(M.cycle(Th, Tc, r)), M.cycle(Th, Tc, r).W, 2e-5, 'enclosed area = net work');
rel(M.loopArea(M.cycle(600, 300, 2), 1500), M.cycle(600, 300, 2).W, 2e-4, 'readout area (1500 per leg) agrees to 0.02%');

// ---- step 1: running work rises on expansions, falls on compressions, ends at W; return along Th gives 0 ----
for (const Th of TH) for (const Tc of TC) {
  const cy = M.cycle(Th, Tc, 2);
  let prev = 0;
  for (let i = 1; i <= 400; i++) {
    const u = 4 * i / 400, w = M.cumWork(cy, u);
    if (u <= 2) ok(w >= prev - 1e-9, 'rises during expansions'); else ok(w <= prev + 1e-9, 'falls during compressions');
    ok(w >= -1e-9, 'running work stays non-negative');
    prev = w;
  }
  near(M.cumWork(cy, 4), cy.W, 1e-9, 'running total ends at net W');
  ok(cy.W > 0, 'net work positive');
  const worst = M.cycle(Th, 250, 2);
  ok(cy.legs[0].W + cy.legs[1].W <= worst.legs[0].W + worst.legs[1].W + 1e-9, 'step 1 bottom axis covers the peak');
}
near(M.isoWork(600, 10, 20) + M.isoWork(600, 20, 10), 0, 1e-9, 'returning along the hot isotherm: net 0');
for (const Th of TH) { let prev = Infinity; for (const Tc of TC) { const w = M.cycle(Th, Tc, 2).W; ok(w < prev, 'net work falls as Tc rises'); prev = w; } }
// default numbers for step 2 (Th 600, Tc 300, r 2)
const d2 = M.cycle(600, 300, 2);
assert.equal(d2.Qh.toFixed(0), '3458'); assert.equal(d2.Qc.toFixed(0), '1729'); assert.equal(d2.W.toFixed(0), '1729'); checks += 3;
// scaling with r: Qh, Qc, W all ∝ ln r
rel(M.cycle(600, 300, 3).W / M.cycle(600, 300, 1.5).W, Math.log(3) / Math.log(1.5), 1e-12, 'W ∝ ln r');

// ---- step 4: the entropy verdict flips exactly at the Carnot efficiency ----
for (const Th of TH) for (const Tc of TC) {
  const etaC = M.carnotEta(Th, Tc);
  near(M.ledger(Th, Tc, etaC).total, 0, 1e-12, 'Carnot engine: ΔS_total = 0');
  for (const e of range(0, 95, 0.5)) {
    const L = M.ledger(Th, Tc, e / 100);
    near(L.W + L.Qc, 1000, 1e-9, 'energy balance');
    if (e / 100 < etaC - 1e-12) ok(L.total > 0, 'below Carnot: possible'); else if (e / 100 > etaC + 1e-12) ok(L.total < 0, 'above Carnot: impossible');
    ok(L.dSh >= -2.5 && L.dSc <= 4.5 && L.total >= -2.5 && L.total <= 4.5, 'entropy bars fit −2.5..4.5');
  }
}
near(M.carnotEta(800, 300), 0.625, 1e-15, 'default Carnot limit 62.5%');

// ---- step 5: reversed cycle ----
for (const tc of range(-30, 15, 1)) for (const th of range(20, 60, 1)) {
  const Tc = M.C2K(tc), Th = M.C2K(th), f = M.copFridge(Th, Tc), p = M.copPump(Th, Tc);
  near(p - f, 1, 1e-12, 'COP_pump = COP_fridge + 1');
  ok(f > 1 && p > 1 && p <= 100, 'COPs inside the 1..100 log axis');
  if (tc > -30) ok(f > M.copFridge(Th, M.C2K(tc - 1)), 'colder cold side → lower COP');
}
assert.equal(M.copFridge(M.C2K(30), M.C2K(-18)).toFixed(2), '5.32'); checks++;

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['s3lgLine']); // symbols only
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/左图|右图|left chart|right chart|left-hand|right-hand/i.test(v), 'no left/right chart wording in ' + k);

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'[,)]/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const k of ['leg0', 'leg1', 'leg2', 'leg3', 'legDone', 'vPossible', 'vLimit', 'vImpossible', 'modeFridge', 'modePump']) ok(STRINGS.zh[k], 'dynamic key ' + k);
for (const id of ['T0', 'r0', 'N0', 'Th1', 'Tc1', 'P1', 'Th2', 'Tc2', 'r2', 'play2', 'next2', 'reset2', 'Th3', 'Tc3', 'r3', 'clear3', 'Th4', 'Tc4', 'E4', 'carnot4', 'tc5', 'th5', 'fridge5', 'pump5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [relp, anchor] = h.split('#'), target = path.join(dir, relp, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../physics/thermal/carnot-cycle/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS carnot-cycle core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
