'use strict';
// Prisoner's dilemma (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const both = (key, s) => { for (const l of ['zh', 'en']) ok(STRINGS[l][key].includes(s), `${l}.${key} quotes ${s}`); };
const P = M.PAY;

// ---- step 0: payoffs and dominance ----
ok(P.T > P.R && P.R > P.P && P.P > P.S && 2 * P.R > P.T + P.S, 'PD inequalities');
ok(M.pay(0, 1) > M.pay(1, 1) && M.pay(0, 0) > M.pay(1, 0), 'defection dominates');
ok(M.pay(0, 1) - M.pay(1, 1) === 2 && M.pay(0, 0) - M.pay(1, 0) === 1, 'gains 2 and 1');
ok(M.pay(0, 0) + M.pay(0, 0) < M.pay(1, 1) + M.pay(1, 1), 'mutual defection worse than mutual cooperation');

// ---- step 1: matches ----
for (let n = 1; n <= 30; n++) {
  const g = M.play('tft', 'alld', n);
  ok(g.totalB - g.totalA === 5, 'AllD ahead of TFT by exactly 5, n=' + n);
  ok(g.a[0] === 1 && g.a.slice(1).every(v => v === 0), 'TFT cooperates only in round 1');
  for (const b of ['grim', 'wsls', 'tft', 'allc']) { const h = M.play('tft', b, n); ok(h.a.every(v => v) && h.b.every(v => v) && h.totalA === 3 * n, 'nice pair cooperates throughout'); }
  for (const a of M.ORDER) for (const b of M.ORDER) { const h = M.play(a, b, n), r = M.play(b, a, n); ok(h.totalA === r.totalB, 'symmetric scoring'); }
}
// Grim as memory-one: once it defects it never cooperates again (deterministic opponents)
for (const b of M.ORDER) { const g = M.play('grim', b, 30), i = g.a.indexOf(0); if (i >= 0) ok(g.a.slice(i).every(v => v === 0), 'grim never forgives vs ' + b); }

// ---- step 2: round robin ----
{
  const all = M.ORDER;
  const r1 = M.tournament(all, 1); ok(r1.rank[0] === 'alld' && r1.tot.alld === 21, 'n = 1: AllD first with 21');
  let k = 0; for (let n = 1; n <= 50; n++) if (!k && M.tournament(all, n).tot.tft > M.tournament(all, n).tot.alld) k = n;
  ok(k === 6, 'TFT overtakes AllD at n = 6 (all five)');
  for (let n = 6; n <= 50; n++) ok(M.tournament(all, n).tot.tft > M.tournament(all, n).tot.alld, 'stays ahead n=' + n);
  // with only AllD, TFT, Grim the crossing moves (s2hint)
  const three = ['alld', 'tft', 'grim']; let k3 = 0; for (let n = 1; n <= 50; n++) if (!k3 && M.tournament(three, n).tot.tft > M.tournament(three, n).tot.alld) k3 = n;
  ok(k3 > 0 && k3 !== k, 'crossing moves with three strategies: ' + k3);
  // the ranking really depends on the opponents: AllD first at n = 50 if only AllC is the other player
  ok(M.tournament(['allc', 'alld'], 50).rank[0] === 'alld', 'AllD wins a field of AllC');
}

// ---- step 3: shadow of the future ----
for (let T = 3.5; T <= 9; T += 0.5) {
  const star = (T - 3) / (T - 1);
  for (let i = 0; i <= 95; i++) {
    const d = i / 100, s = M.shadow(d, T);
    near(s.coop * (1 - d) / (1 - d), s.coopTotal * (1 - d), 1e-12, 'normalised cooperate');
    near(s.defect, s.defectTotal * (1 - d), 1e-12, 'normalised defect');
    ok((s.coop > s.defect + 1e-12) === (d > star + 1e-12), 'cooperation pays iff δ > δ*');
  }
  near(M.shadow(0, T).star, star, 1e-12, 'δ* formula');
}
near(M.shadow(0.5, 5).defect, 3, 1e-12, 'T = 5 tie at δ = 0.5'); near(M.shadow(0, 9).star, 0.75, 1e-12, 'T = 9 → 0.75');
both('s3hint', '0.75'); both('s3hint', '0.5');

// ---- step 4: replicator dynamics ----
for (let n = 1; n <= 20; n++) {
  const A = M.popMatrix(n);
  near(A[0][1], (5 + (n - 1)) / n, 1e-12, 'AllD vs TFT'); near(A[1][0], (n - 1) / n, 1e-12, 'TFT vs AllD');
  near(A[1][2], 3, 0, 'TFT vs AllC'); near(A[2][1], 3, 0, 'AllC vs TFT'); near(A[1][1], 3, 0, 'TFT vs TFT');
  if (n >= 2) {
    const th = M.tftThreshold(n);
    // on the AllD–TFT edge payoffs are equal exactly at the threshold
    const fD = (1 - th) * A[0][0] + th * A[0][1], fT = (1 - th) * A[1][0] + th * A[1][1]; near(fD, fT, 1e-12, 'threshold equalises payoffs n=' + n);
    if (n >= 3) {
      const up = M.replicator([1 - th - 0.02, th + 0.02, 0], n, { T: 200 }), dn = M.replicator([1 - th + 0.02, th - 0.02, 0], n, { T: 200 });
      ok(up.xs[up.xs.length - 1][1] > 0.99 && dn.xs[dn.xs.length - 1][0] > 0.99, 'edge tips at 1/(2n − 3), n=' + n);
    }
  }
}
// TFT–AllC edge is neutral: shares do not move
{ const r = M.replicator([0, 0.4, 0.6], 10); near(r.xs[r.xs.length - 1][1], 0.4, 1e-12, 'neutral bottom edge'); }
// s4hint scenario: n = 10, AllD 30 %, TFT 40 % of the rest → AllD peaks near half, then TFT wins, AllC survives
{
  const r = M.replicator([0.3, 0.28, 0.42], 10); let pk = 0; r.xs.forEach(x => { pk = Math.max(pk, x[0]); });
  const f = r.xs[r.xs.length - 1];
  ok(pk > 0.45 && pk < 0.55, 'AllD peaks at about half: ' + pk); ok(f[0] < 1e-3 && f[1] > 0.85 && f[2] > 0.05, 'TFT takes over, AllC survives');
  const r1 = M.replicator([0.3, 0.28, 0.42], 1); ok(r1.xs[r1.xs.length - 1][0] > 0.999, 'n = 1: AllD takes over');
}
// shares stay on the simplex
{ const r = M.replicator([0.2, 0.3, 0.5], 7); r.xs.forEach(x => { near(x[0] + x[1] + x[2], 1, 1e-9, 'sum 1'); ok(x.every(v => v >= 0), 'non-negative'); }); }

// ---- step 5: noise ----
for (let i = 1; i <= 40; i++) {
  const e = i * 0.005;
  near(M.longRun('tft', 'tft', e), 2.25, 1e-9, 'TFT self-play = 2.25 for every e > 0');
  for (let g = 0.05; g <= 1.0001; g += 0.05) {
    ok(M.longRun(M.gtft(g), M.gtft(g), e) > 2.25 + 1e-6, 'GTFT beats TFT under noise');
    ok(M.longRun(M.gtft(g), 'alld', e) < M.longRun(M.gtft(Math.max(0, g - 0.05)), 'alld', e) + 1e-12, 'more generosity → more exploited');
  }
  ok(M.longRun('wsls', 'wsls', e) > 2.25, 'WSLS recovers better than TFT');
}
near(M.longRun('tft', 'tft', 0), 3, 1e-12, 'no noise: 3'); near(M.longRun(M.gtft(0.3), 'alld', 0), 0.7, 1e-9, 'GTFT vs AllD at e = 0: 1 − g');
// stationary payoff agrees with a long simulation
{ let s = 0; for (let seed = 1; seed <= 4; seed++) s += M.play('wsls', 'wsls', 50000, { e: 0.05, seed }).totalA / 50000; near(s / 4, M.longRun('wsls', 'wsls', 0.05), 0.02, 'Markov vs simulation'); }
both('s5hint', '2.25');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');

// ---- keys referenced in HTML/app exist ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'[,)]/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const k of [...M.ORDER, 'gtft']) ok(STRINGS.zh['sn_' + k] !== undefined, 'strategy name ' + k);
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder');

// ---- deep links ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h); ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../math/applied/prisoners-dilemma/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS prisoners-dilemma core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
