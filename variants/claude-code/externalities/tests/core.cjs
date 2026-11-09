'use strict';
// Externalities (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const range = (a, b, s) => { const out = []; for (let v = a; v <= b + 1e-9; v += s) out.push(+v.toFixed(6)); return out; };
const integrate = (f, a, b, n = 4000) => { let s = 0; const h = (b - a) / n; for (let i = 0; i < n; i++) s += f(a + (i + 0.5) * h); return s * h; };

// ---- step 0: market quantity, surpluses, maximum total surplus ----
ok(M.marketQ() === 40 && M.marketP() === 60, 'Q_m = 40, P = 60');
ok(M.consumerSurplus() === 800 && M.producerSurplus() === 800 && M.privateSurplus(40) === 1600, 'CS = PS = 800, total 1600');
for (const q of range(0, 80, 1)) {
  near(M.privateSurplus(q), integrate(x => M.MB(x) - M.MPC(x), 0, q), 1e-6, 'surplus = area between curves');
  ok(M.privateSurplus(q) <= 1600 + 1e-9, 'max at Q_m');
  if (q >= 1) near(M.unitGain(q), M.MB(q - 0.5) - M.MPC(q - 0.5), 1e-9, 'unit gain = midpoint gap');
  if (q >= 1) ok((M.unitGain(q) > 0) === (q <= 40), 'tonnes 1..40 gain, beyond 40 lose');
}

// ---- step 1: social optimum, damages; pink bars sum = welfare gap (e on its even-step slider) ----
for (const e of range(0, 40, 2)) {
  near(M.socialQ(e), (80 - e) / 2, 1e-12, 'Q* = (a − c − e)/(b + d)');
  near(M.MB(M.socialQ(e)), M.MSC(M.socialQ(e), e), 1e-9, 'MB = MSC at Q*');
  let red = 0; for (let q = 1; q <= 40; q++) { const g = M.unitGain(q, e); if (g < 0) red -= g; }
  near(red, M.welfare(M.socialQ(e), e) - M.welfare(M.marketQ(), e), 1e-9, 'pink bars = welfare gap');
  near(red, M.deadweight(e), 1e-9, 'pink bars = deadweight loss');
  ok(M.marketQ() === 40, 'market quantity ignores e');
}
ok(M.socialQ(20) === 30 && M.damage(40, 20) === 800 && M.damage(30, 20) === 600, 'default e = 20 numbers');

// ---- step 2: deadweight loss closed form; quadratic; steeper supply → smaller ----
for (const d of range(0.3, 3, 0.1)) for (const e of range(0, 40, 1)) {
  const p = { ...M.BASE, d };
  near(M.deadweight(e, p), M.deadweightFormula(e, p), 1e-9, 'DWL closed form');
  near(M.deadweight(e, p), 0.5 * e * (M.marketQ(p) - M.socialQ(e, p)), 1e-9, 'DWL = ½ · e · gap');
  near(M.marketQ(p) - M.socialQ(e, p), e / (1 + d), 1e-9, 'gap = e/(b + d)');
  near(M.deadweightFormula(e / 2, p) * 4, M.deadweightFormula(e, p), 1e-9, 'halving e quarters the loss');
  if (d > 0.35) ok(M.deadweightFormula(e, p) <= M.deadweightFormula(e, { ...M.BASE, d: d - 0.1 }) + 1e-12, 'steeper supply, smaller loss');
  ok(M.deadweightFormula(e, p) <= 650, 'fits the 0–650 axis');
}
ok(M.deadweightFormula(20) === 100 && M.deadweightFormula(40) === 400, 'hint: 100 at e = 20, 400 at e = 40 (d = 1)');

// ---- step 3: Pigouvian tax ----
for (const e of range(0, 40, 1)) {
  let bestT = 0, bestW = -Infinity;
  for (const t of range(0, 60, 1)) {
    const W = M.taxWelfare(t, e);
    near(W, M.privateSurplus(M.taxedQ(t)) - e * M.taxedQ(t), 1e-9, 'W = surplus + revenue − damage (revenue is a transfer)');
    if (W > bestW + 1e-12) { bestW = W; bestT = t; }
    ok(W >= 0 && W <= 1700, 'fits the 0–1700 axis');
    near(M.taxRevenue(t), t * M.taxedQ(t), 1e-12, 'revenue');
    if (t < e) ok(M.taxedQ(t) > M.socialQ(e), 'low tax: too much'); if (t > e) ok(M.taxedQ(t) < M.socialQ(e), 'high tax: too little');
  }
  ok(bestT === M.bestTax(e) && bestT === e, 'best tax t = e');
  near(M.taxedQ(e), M.socialQ(e), 1e-12, 'Q(t = e) = Q*');
}

// ---- step 4: commons ----
ok(M.commonsOpt() === 40 && M.totalProfit(40) === 1600, 'N* = 40, profit 1600');
for (let N = 0; N <= 80; N++) ok(M.totalProfit(N) <= 1600, 'max total profit at 40');
for (let m = 1; m <= 20; m++) {
  const eq = M.commonsEq(m), n = eq / m;
  near(M.bestResponse(eq - n), n, 1e-9, 'symmetric equilibrium is a best response');
  near(M.totalProfit(eq) / 1600, 4 * m / ((m + 1) * (m + 1)), 1e-12, 'equilibrium share 4m/(m+1)²');
  const P = M.commonsPath(m);
  ok(P.length === M.commonsRounds(m) * m + 1, 'rounds of m adjustments');
  near(P[0].N, 40, 1e-12, 'starts at the cooperative level');
  near(P[P.length - 1].N, eq, 0.1, `ends within 0.1 of equilibrium (m = ${m})`);
  ok(P.every(s => s.N <= 80 && s.N >= 30 && s.n.every(v => v >= 0 && v <= 45)), 'fits the axes');
  P.forEach(s => near(s.N, s.n.reduce((a, v) => a + v, 0), 1e-9, 'N is the sum'));
  if (m > 1) { const x = M.extraCow(P[0].n[0], 40); ok(x.own > 0 && x.all < 0, 'at the start one more cow pays the herder but costs the village'); }
}
near(M.commonsEq(5), 66.6667, 1e-3, 'hint: 66.7 for m = 5'); ok(M.commonsEq(1) === 40, 'm = 1 stays at 40');
{ const x = M.extraCow(8, 40); ok(x.own === 80 - 40 - 1 - 8 && x.all === 79 - 80 && x.othersLoss === 32, 'extraCow arithmetic'); }

// ---- step 5: Coase ----
for (const T of range(0, 50, 1)) for (const G of range(0, 100, 1)) for (const D of range(0, 100, 1)) {
  const a = M.coase(G, D, T, 'factory'), b = M.coase(G, D, T, 'fishery');
  if (Math.abs(G - D) > T && G !== D) { ok(a.pollute === b.pollute && a.pollute === (G > D), 'clear rights + gains > T: same efficient outcome'); }
  if (T === 0 && G !== D) { ok(a.matchesEfficient && b.matchesEfficient, 'T = 0: always efficient'); near(a.total, b.total, 1e-9, 'T = 0: same total'); }
  if (G < D && D - G <= T) ok(a.pollute && !a.deal, 'stuck above the diagonal: factory right keeps pollution');
  if (G > D && G - D <= T) ok(!b.pollute && !b.deal, 'stuck below the diagonal: fishery right keeps it clean');
  if (a.deal) { ok(a.payer === 'fishery' && a.pay > G && a.pay < D, 'fishery pays inside the range'); ok(a.factory > G - 1e-9 - T / 2 && a.fishery > -D, 'both gain from the deal'); }
  if (b.deal) { ok(b.payer === 'factory' && b.pay > D && b.pay < G, 'factory pays inside the range'); }
  near(a.total, (a.pollute ? G - D : 0) - (a.deal ? T : 0), 1e-9, 'total = net gain − transaction cost');
}
{ const a = M.coase(60, 80, 5, 'factory'), b = M.coase(60, 80, 5, 'fishery'); ok(a.deal && !a.pollute && a.pay === 70 && !b.deal && !b.pollute, 'default G = 60, D = 80, T = 5'); }

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');

// ---- every key referenced in HTML/app exists; controls exist ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const m of app.matchAll(/t\(o\.\w+ \? '(\w+)' : '(\w+)'/g)) ok(STRINGS.zh[m[1]] && STRINGS.zh[m[2]], 'ternary keys');
for (const k of ['s3low', 's3high', 'rFactory', 'rFishery', 'outPol', 'outClean', 'dealFishPays', 'dealFactPays']) ok(app.includes(`'${k}'`), 'used ' + k);
for (const id of ['q0', 'clear0', 'e1', 'e2', 'd2', 'clear2', 'e3', 't3', 'clear3', 'm4', 'play4', 'step4b', 'reset4', 'g5', 'dm5', 'tc5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(/id="e1"[^>]*step="2"/.test(html), 'step-1 e slider moves in steps of 2 (keeps Q* whole)');
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
ok(fs.existsSync(path.join(dir, '../../../math/applied/externalities/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS externalities core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
