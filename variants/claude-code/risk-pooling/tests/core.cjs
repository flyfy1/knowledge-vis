'use strict';
// Risk pooling (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const both = (zh, en, key) => { ok(STRINGS.zh[key].includes(zh), `zh ${key} quotes ${zh}`); ok(STRINGS.en[key].includes(en), `en ${key} quotes ${en}`); };

// ---- exact binomial machinery ----
for (const n of [1, 10, 100, 1000, 100000]) {
  let s = 0; for (let k = 0; k <= Math.min(n, 2000); k++) s += M.binomPmf(k, n, 0.01);
  near(s, 1, 1e-8, `pmf sums to 1 at n=${n}`);
  near(M.binomTail(-1, n, 0.01), 1, 1e-8, 'P(K > −1) = 1');
}
near(M.binomTail(0, 10, 0.01), 1 - Math.pow(0.99, 10), 1e-12, 'P(K > 0), n = 10');

// ---- step 0: sharing ----
both('100 元', '$100', 's0e'); near(0.01 * M.L, 100, 0, 'expected loss at p = 1%');
{
  const d1 = M.shareYears(1, 0.01, 7);
  ok(d1.k.filter(k => k > 0).length === 2 && Math.max(...d1.cost) === 10000, 'N = 1, default history: two $10,000 years, the rest 0');
  for (let seed = 7; seed <= 30; seed++) {
    for (const p of [0.005, 0.01, 0.02, 0.05]) for (const n of M.SHARE_N) {
      const d = M.shareYears(n, p, seed);
      assert.equal(d.cost.length, M.YEARS); checks++;
      ok(d.cost.every((c, i) => Math.abs(c - d.k[i] * M.L / n) < 1e-9), 'share = claims × L ÷ N');
    }
    const a = M.shareYears(100, 0.01, seed), b = M.shareYears(10000, 0.01, seed);
    ok(Math.max(...a.cost) <= 600, `N = 100: a few hundred at most (seed ${seed})`);
    ok(Math.min(...b.cost) >= 60 && Math.max(...b.cost) <= 140, `N = 10000: narrow band around 100 (seed ${seed})`);
    ok(M.shareYears(1, 0.01, seed).cost.every(c => c === 0 || c === 10000), 'N = 1: 0 or 10000');
  }
}
for (const n of M.SHARE_N) near(M.theorySd(n, 0.01), 10000 * Math.sqrt(0.0099 / n), 1e-9, 'theory SD formula');

// ---- step 1: square-root law ----
ok(Math.abs(M.lawRun(100).sd - 100) < 15 && Math.abs(M.lawRun(10000).sd - 10) < 1.5, 'N = 100 → about $100, N = 10000 → about $10');
both('约 100 元降到约 10 元', 'about $100 to about $10', 's1hint');
for (const n of M.LAW_N) {
  const r = M.lawRun(n), th = M.theorySd(n, M.P1);
  near(r.sd, th, 4 * th / Math.sqrt(2 * M.LAW_YEARS) + (n < 10 ? 0.15 * th : 0), `simulated SD near theory at N=${n}`);
  near(r.mean, 100, 4 * th / Math.sqrt(M.LAW_YEARS), `simulated mean near 100 at N=${n}`);
  ok(r.sd >= 5 && r.sd <= 2000, 'SD dot inside the log axis');
}
{
  const bad = M.LAW_N.map(n => M.badYear(n, M.P1));
  for (let i = M.LAW_N.indexOf(100); i < bad.length - 1; i++) ok(bad[i + 1] < bad[i], 'bad-year chance falls once N ≥ 100');
  ok(bad[M.LAW_N.indexOf(30)] > bad[M.LAW_N.indexOf(10)] && bad[M.LAW_N.indexOf(100)] < bad[M.LAW_N.indexOf(30)], 'bad-year chance jumps around for small N');
  near(M.badYear(1, 0.01), 0.01, 1e-12, 'N = 1: bad year = any loss');
}
both('√(p(1 − p)/N)', '√(p(1 − p)/N)', 's1e');

// ---- step 2: loading ----
const LD = (n, e) => M.loading(n, M.P2, e);
for (const e of M.EPS) for (const n of M.LOAD_N) {
  const l = LD(n, e);
  ok(l.ruin <= e && M.binomTail(l.k - 1, n, M.P2) > e, `k* is the smallest count with ruin ≤ ε (n=${n}, ε=${e})`);
  near(l.theta, l.k / (n * M.P2) - 1, 1e-12, 'θ = k*/(Np) − 1'); near(l.premium, (1 + l.theta) * 100, 1e-9, 'premium = (1 + θ) × 100');
  ok(l.theta > 0.02 && l.theta < 40, 'θ inside the log axis (2% … 4000%)');
}
for (const e of M.EPS) for (let i = 0; i < M.LOAD_N.length - 1; i++) ok(LD(M.LOAD_N[i + 1], e).theta <= LD(M.LOAD_N[i], e).theta, 'loading falls with N');
for (const n of M.LOAD_N) ok(LD(n, 0.001).theta >= LD(n, 0.01).theta && LD(n, 0.01).theta >= LD(n, 0.05).theta, 'stricter ε, higher curve');
near(LD(10, 0.01).theta, 9, 1e-12, 'N = 10: 900%'); assert.equal(LD(10, 0.01).k, 1); checks++;
both('900%', '900%', 's2hint'); both('900%', '900%', 's5fin');
near(LD(100, 0.01).theta, 3, 1e-12, 'N = 100, ε = 1%: 300%'); ok((100 * M.loadingNormal(100, 0.01, 0.01)).toFixed(0) === '231', 'normal approx ≈ 231%');
both('精确值 300%、近似值约 231%', 'about 231% against the exact 300%', 's2hint');
{ const r = LD(1000, 0.01).theta / LD(100000, 0.01).theta; ok(r > 8 && r < 13, `×100 in N cuts loading to about a tenth (ratio ${r})`); }
ok((100 * LD(100000, 0.01).theta).toFixed(1) === '7.4', 'N = 100000, ε = 1%: 7.4%'); both('7.4%', '7.4%', 's5fin');
for (const e of [0.01, 0.001]) for (const n of M.LOAD_N.filter(q => q <= 300)) ok(M.loadingNormal(n, M.P2, e) < LD(n, e).theta - 0.1, `normal approx clearly low at small N (n=${n}, ε=${e})`);
ok(M.LOAD_N.every(n => M.loadingNormal(n, M.P2, 0.001) > 0.02 && M.loadingNormal(n, M.P2, 0.05) < 40), 'normal curves inside the axis');

// ---- step 3: common shock ----
{
  const p1 = 0.05, q = 0.1, fl = M.stormFloor(p1, q);
  near(fl, 120, 1e-9, 'default floor $120');
  ok(M.stormSd(1000, p1, q) / fl < 1.06 && M.stormSd(100, p1, q) / fl > 1.3, 'solid line lies on the floor from about N = 1000');
  both('N 约 1000', 'N = 1000', 's3hint');
  ok(M.indepSd(10000, p1, q) < 12 && M.stormSd(10000, p1, q) > 120, 'independent ≈ $12 vs ≈ $120 at N = 10000');
  for (let n = 10; n <= 100000; n *= 10) ok(M.stormSd(n, p1, q) > fl && M.indepSd(n, p1, q) < M.stormSd(n, p1, q), 'storm SD above floor and above independent');
  const ys = M.stormYears(p1, q, 2), calm = ys.filter(o => !o.storm).map(o => o.cost), storm = ys.filter(o => o.storm).map(o => o.cost);
  assert.equal(storm.length, 5); checks++;
  ok(Math.min(...storm) > 3 * Math.max(...calm), 'storm years several times taller than ordinary years');
  ok(Math.max(...calm) - Math.min(...calm) < 0.6 * M.mean(calm), 'ordinary years roughly equal');
  for (let a = 2; a <= 20; a++) for (let b = 0; b <= 6; b++) {
    const P1 = a / 200, Q = b / 20;
    near(M.stormSd(1e12, P1, Q), M.stormFloor(P1, Q), 2e-3, 'SD → floor as N → ∞');
    near(M.pBar(P1, Q), M.P0 + Q * (P1 - M.P0), 1e-15, 'average chance');
    if (P1 === M.P0 || Q === 0) near(M.stormSd(500, P1, Q), M.indepSd(500, P1, Q), 1e-9, 'no shock: curves coincide');
    const top = Math.max(...M.stormYears(P1, Q, 2).map(o => o.cost));
    ok(top <= 1500 / 1.08, 'storm chart y axis (≤ 1500) holds every bar');
    ok(M.stormSd(10, P1, Q) < 2000 && M.indepSd(100000, P1, Q) > 1, 'SD curves inside the log axis');
  }
}

// ---- step 4: adverse selection ----
{
  near(M.mean(M.RISKS), 0.0211, 0.0005, 'average risk about 2.1%'); both('2.1%', '2.1%', 's4e');
  ok(Math.min(...M.RISKS) > 0.002 && Math.max(...M.RISKS) < 0.08, 'risks within 0.2%–8%');
  const r0 = M.spiral(0); ok(r0.length === 5 && r0[4].share === 0, 'm = 0: empty at round 4'); both('第 4 轮', 'by round 4', 's4hint');
  const r1 = M.spiral(1), s1 = r1[r1.length - 1].share; ok(s1 > 0.27 && s1 < 0.33, 'm = 100%: about three in ten stay'); both('约三成', 'about three in ten', 's4hint');
  const r3 = M.spiral(3), s3 = r3[r3.length - 1].share; ok(1 - s3 > 0.37 && 1 - s3 < 0.43, 'm = 300%: about four in ten leave'); both('约四成', 'four in ten', 's4hint');
  for (let i = 0; i <= 30; i++) {
    const m = i / 10, R = M.spiral(m), last = R[R.length - 1];
    ok(R.length >= 2 && R.length <= 30, 'spiral ends within the chart');
    for (let k = 1; k < R.length; k++) { ok(R[k].share <= R[k - 1].share, 'pool only shrinks'); if (Number.isFinite(R[k].premium)) ok(R[k].premium >= R[k - 1].premium - 1e-9, 'premium only rises'); }
    if (last.share > 0) { const kept = M.RISKS.filter(p => M.stays(p, last.premium, m)).length / M.NPEOPLE; near(kept, last.share, 1e-12, 'stable: nobody else leaves'); }
    ok(R.every(o => !Number.isFinite(o.premium) || (o.premium >= 10 && o.premium <= 10000)), 'premium inside the log axis');
    ok((1 + m) * M.PMIN * M.L >= 10 && (1 + m) * M.PMAX * M.L <= 10000, 'limits inside the log axis');
    near(M.ratedShare(m), m >= 0.1 - 1e-9 ? 1 : 0, 0, 'risk-rated: everyone stays once m ≥ 10%');
    ok(R[0].share === 1 && Math.abs(R[0].premium - 1.1 * M.mean(M.RISKS) * M.L) < 1e-9, 'round 0 = whole pool at 1.1 × mean');
  }
}

// ---- number formatting ----
const app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
const fmt = eval(app.match(/const fmt = ([^\n]+);\n/)[1]);
assert.equal(fmt(90, 0), '90'); assert.equal(fmt(10, 1), '10'); assert.equal(fmt(0.5, 2), '0.5'); assert.equal(fmt(1000, 1), '1000'); assert.equal(fmt(7.4, 1), '7.4'); checks += 5;

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) { ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model'); ok(!/左图|右图|左边的图|右边的图|left chart|right chart|left-hand|right-hand/i.test(Object.values(STRINGS[l]).join('')), 'no left/right chart references'); }

// ---- keys, controls, links ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'(?! \+)/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const m of app.matchAll(/\['(c\d[a-z]?|ax[A-Za-z]+)', '(ax[A-Za-z]+)', '(ax[A-Za-z]+)'\]/g)) for (const k of m.slice(1)) ok(STRINGS.zh[k] !== undefined, 'axes key ' + k);
for (const i of [0, 1, 2]) ok(STRINGS.zh['epsName' + i] && STRINGS.en['epsName' + i], 'ε names');
for (const id of ['n0', 'p0', 'reroll0', 'n1', 'n2', 'e2', 'p3', 'q3', 'reroll3', 'm4', 'next4', 'run4', 'reset4']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css') && !html.includes('canvas-label-guard'), 'provenance placeholder, css, no label guard');
ok(html.includes('name="stage" content="university"'), 'stage university');
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../probability/stochastic/risk-pooling/index.html')), 'comparison link target exists');
for (let i = 0; i <= 5; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS risk-pooling core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
