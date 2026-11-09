'use strict';
// Supply & demand (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => { assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`); checks++; };
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const B = M.BASE, E = M.equilibrium(B);
const both = (key, ...subs) => ['zh', 'en'].forEach(l => subs.forEach(s => ok(STRINGS[l][key].includes(s), `${l}.${key} quotes ${s}`)));

// ---- step 0: the market and its crossing (s0e, s0hint) ----
near(E.P, 12, 1e-12, 'P* = 12'); near(E.Q, 52, 1e-12, 'Q* = 52');
near(M.floorP(B), 10 / 3, 1e-12, 'no supply below 3.33'); near(M.choke(B), 25, 1e-12, 'choke price 25');
both('s0e', 'Qd = 100 − 4P', 'Qs = −20 + 6P', '3.33'); both('s0hint', '100 − 4P = −20 + 6P', 'P = 12', 'Q = 52');
// gap sign flips exactly at P* across the slider grid (0..25 step 0.5); zero only there
for (let P = 0; P <= 25; P += 0.5) { const g = M.gap(B, P); ok(P < 12 ? g > 0 : P > 12 ? g < 0 : g === 0, 'gap sign at ' + P); }
// the trail segments shrink towards P*: |gap| strictly decreasing in |P − P*| over the linear range
for (let P = 3.5; P < 12; P += 0.5) ok(Math.abs(M.gap(B, P)) > Math.abs(M.gap(B, P + 0.5)), 'shrinks from below ' + P);
for (let P = 12; P < 25; P += 0.5) ok(Math.abs(M.gap(B, P + 0.5)) > Math.abs(M.gap(B, P)), 'grows above ' + P);
// default slider P = 18: surplus 60 (28 wanted, 88 offered)
near(M.qd(B, 18), 28, 1e-12, 'qd(18)'); near(M.qs(B, 18), 88, 1e-12, 'qs(18)');

// ---- step 1: adjustment rule ----
for (let k = 0.02; k <= 0.2201; k += 0.01) {
  const r = M.adjustFactor(B, k);
  near(r, 1 - 10 * k, 1e-12, 'r = 1 − k(b + d)');
  // inside the linear range the deviation is multiplied by r every round
  const path = M.adjustPath(B, 20, k, 12);
  for (let i = 0; i + 1 < path.length; i++) {
    const P = path[i], lin = P >= M.floorP(B) && P <= M.choke(B);
    if (lin && Math.abs(P - 12) > 1e-4) near((path[i + 1] - 12) / (P - 12), r, 1e-6, `factor k=${k} round ${i}`);
  }
}
// s1hint: 0.05 monotone, 0.15 oscillating but converging, 0.22 growing; converge iff 0 < k < 0.2
{
  const p05 = M.adjustPath(B, 20, 0.05, 12); ok(p05.every((v, i) => !i || (v < p05[i - 1] && v > 12)), 'k = 0.05 creeps down to 12');
  near(p05[12], 12, 0.005, 'k = 0.05 arrives within 0.005 after 12 rounds');
  const p15 = M.adjustPath(B, 20, 0.15, 12); ok(p15[1] < 12 && p15[2] > 12 && Math.abs(p15[12] - 12) < 0.01, 'k = 0.15 overshoots and settles');
  const p22 = M.adjustPath(B, 20, 0.22, 12); ok(Math.abs(p22[2] - 12) > Math.abs(p22[1] - 12) && p22.length < 13 && (p22[p22.length - 1] < 0 || p22[p22.length - 1] > 28), 'k = 0.22 swings out and leaves the chart');
  ok(M.adjustFactor(B, 0.2) === -1 + 0 || Math.abs(M.adjustFactor(B, 0.2) + 1) < 1e-12, 'k = 0.2 is the edge');
  both('s1hint', '0.05', '0.15', '0.22', '0 < k < 0.2'); both('s1e', '4 + 6');
}

// ---- step 2: shifts (s2hint); superposition of the two shifts ----
for (let dA = -30; dA <= 30; dA += 5) for (let dC = -30; dC <= 30; dC += 5) {
  const e = M.equilibrium(M.shifted(B, dA, dC)), ea = M.equilibrium(M.shifted(B, dA, 0)), ec = M.equilibrium(M.shifted(B, 0, dC));
  near(e.P - E.P, (ea.P - E.P) + (ec.P - E.P), 1e-9, 'price changes add'); near(e.Q - E.Q, (ea.Q - E.Q) + (ec.Q - E.Q), 1e-9, 'quantity changes add');
  near(M.qd(M.shifted(B, dA, dC), e.P), M.qs(M.shifted(B, dA, dC), e.P), 1e-9, 'crossing clears');
  ok(e.P > 0 && e.P < M.AX.pMax && e.Q > 0 && e.Q < M.AX.qMax, 'crossing on the chart');
}
{ const a = M.equilibrium(M.shifted(B, 20, 0)), c = M.equilibrium(M.shifted(B, 0, -20)); ok(a.P > 12 && a.Q > 52 && c.P > 12 && c.Q < 52, 'demand up: P,Q up; supply down: P up, Q down'); }
// quiz: after the supply cut, the new crossing lies on the unchanged demand curve
{ const e = M.equilibrium(M.shifted(B, 0, -20)); near(M.qd(B, e.P), e.Q, 1e-9, 'movement along demand'); }

// ---- step 3: elasticity ----
for (let b = 1; b <= 16; b++) {
  const m = M.pivotDemand(B, b), e0 = M.equilibrium(m);
  near(e0.P, 12, 1e-9, 'pivot keeps P*'); near(e0.Q, 52, 1e-9, 'pivot keeps Q*');
  const e2 = M.equilibrium(M.shifted(m, 0, -20)), dP = e2.P - 12, dQ = 52 - e2.Q;
  near(dP, 20 / (b + 6), 1e-9, 'ΔP = 20/(b + d)'); near(dQ, 20 * b / (b + 6), 1e-9, 'ΔQ = 20b/(b + d)');
  const eps = Math.abs(M.elasticityD(m, 12, 52));
  near((dQ / 52) / (dP / 12), eps, 1e-9, '%ΔQ / %ΔP = |εd| (s3hint)');
  ok((dQ / 52 > dP / 12) === (eps > 1), 'quantity % wins exactly when elastic');
  ok(e2.P < M.AX.pMax && e2.Q > 0, 'shocked crossing on chart');
  ok(eps <= 4, 'side panel range |εd| ≤ 4');
}
both('s3hint', '|εd| = 1');
near(M.elasticityS(B, 12, 52), 72 / 52, 1e-12, 'εs');

// ---- step 4: tax wedge ----
for (let b = 1; b <= 16; b++) for (let tt = 0.5; tt <= 10; tt += 0.5) {
  const m = M.pivotDemand(B, b), r = M.policy(m, tt);
  near(r.Pb - r.Ps, tt, 1e-9, 'wedge = t');
  near(M.qd(m, r.Pb), r.Q, 1e-9, 'buyers want Q at Pb'); near(M.qs(m, r.Ps), r.Q, 1e-9, 'cafés sell Q at Ps');
  const share = (r.Pb - 12) / tt, es = M.elasticityS(B, 12, 52), ed = Math.abs(M.elasticityD(m, 12, 52));
  near(share, M.buyerShare(m), 1e-9, 'share = d/(b + d)'); near(share, es / (es + ed), 1e-9, 'share = εs/(εs + |εd|)');
  ok(r.Q > 0 && r.Pb < M.AX.pMax && r.Ps > M.floorP(m), 'interior');
}
near(M.buyerShare(B), 0.6, 1e-12, 'b = 4: buyers bear 60% (s4hint)'); both('s4hint', '60%');

// ---- step 5: surplus and deadweight loss ----
for (let tt = -6; tt <= 10; tt += 0.5) {
  const S = M.surplus(B, tt), N = M.surplusNumeric(B, tt);
  near(S.CS, N.CS, 1e-6, 'CS area = integral ' + tt); near(S.PS, N.PS, 1e-6, 'PS area = integral ' + tt);
  near(S.DWL, M.dwlFormula(B, tt), 1e-9, 'DWL closed form ' + tt);
  near(S.DWL, 0.5 * Math.abs(tt) * Math.abs(S.Q - E.Q), 1e-9, 'DWL = triangle ½·|t|·|ΔQ|');
  ok(S.DWL >= -1e-12, 'never a gain');
  ok(S.Q > 0 && S.Pb > 0 && S.Ps < M.AX.pMax, 'on chart');
}
near(M.surplus(B, 0).W, 563.3333333333334, 1e-9, 'W0'); near(M.surplus(B, 5).W, 533.3333333333334, 1e-9, 'W(5)');
near(M.surplus(B, 5).DWL, 30, 1e-9, 'DWL(5) = 30'); near(M.surplus(B, 10).DWL, 120, 1e-9, 'DWL(10) = 120'); near(M.surplus(B, -5).DWL, 30, 1e-9, 'DWL(−5) = 30');
both('s5hint', '563.33', '533.33', '30', '120', '−5');
ok(M.surplus(B, -5).Q > E.Q, 'subsidy: more cups');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const k of ['kindMono', 'kindOsc', 'kindDiv', 'kindEdge', 'elastic', 'inelastic', 'unit', 's0eq', 's0short', 's0sur', 'correct', 'wrong']) ok(STRINGS.zh[k] !== undefined, 'indirect key ' + k);
for (const id of ['p0', 'clear0', 'p1', 'k1', 'run1', 'clear1', 'dA2', 'dC2', 'checkQuiz', 'b3', 'clear3', 't4', 'b4', 't5', 'clear5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css') && !html.includes('canvas-label-guard'), 'provenance placeholder, no label guard');

// ---- deep links ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h); ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../math/applied/supply-demand/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS supply-demand core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
