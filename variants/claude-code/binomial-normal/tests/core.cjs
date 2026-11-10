'use strict';
// Binomial-to-normal (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const both = (key, text) => ['zh', 'en'].forEach(l => ok(STRINGS[l][key].includes(text), `${l}.${key} quotes "${text}"`));

// ---- number formatting ----
const trim = eval(app.match(/const trim = ([^\n]+);/)[1]);
ok(trim('90') === '90' && trim('100') === '100' && trim('0.50') === '0.5' && trim('40.00') === '40', 'trim keeps integer zeros');

// ---- step 0: Pascal's triangle = path counts = C(n, k) ----
const P = M.pascal(12);
for (let n = 1; n <= 12; n++) {
  ok(P[n].reduce((a, b) => a + b, 0) === Math.pow(2, n), 'row sums to 2^n');
  for (let k = 0; k <= n; k++) {
    ok(P[n][k] === M.choose(n, k), `C(${n},${k})`);
    if (k > 0 && k < n) ok(P[n][k] === P[n - 1][k - 1] + P[n - 1][k], 'up-left + up-right');
    if (n <= 10) {
      const ps = M.paths(n, k);
      ok(ps.length === P[n][k] && new Set(ps).size === ps.length, `paths enumerate C(${n},${k})`);
      ps.forEach(s => ok(s.length === n && [...s].filter(c => c === 'R').length === k, 'path has k rights'));
      near(M.pmf(n, k, 0.5), P[n][k] / Math.pow(2, n), 1e-14, 'fair board P = C/2^n');
    }
  }
}
ok(M.paths(6, 2)[0] === 'LLLLRR', 'first path in lexicographic order');
ok(html.includes('id="n0" data-step="0" type="range" min="1" max="10" step="1" value="6"') && html.includes('id="k0" data-step="0" type="range" min="0" max="6" step="1" value="2"'), 'step 0 defaults n = 6, k = 2');

// ---- step 1: binomial pmf and the simulated board ----
ok(M.P_STEPS.length === 17 && M.P_STEPS[0] === 0.1 && M.P_STEPS[8] === 0.5 && M.P_STEPS[16] === 0.9, 'p grid 0.10..0.90');
for (let n = 1; n <= 100; n++) for (const p of M.P_STEPS) {
  const v = M.pmfAll(n, p); near(v.reduce((a, b) => a + b, 0), 1, 1e-10, 'pmf sums to 1');
  if (n <= 12) for (let k = 0; k <= n; k++) near(v[k], P[n][k] * Math.pow(p, k) * Math.pow(1 - p, n - k), 1e-12, 'pmf = C p^k (1−p)^(n−k)');
}
{ // the simulated board converges to the formula
  const rng = M.mulberry32(77), n = 8, p = 0.5, cnt = new Array(n + 1).fill(0), N = 20000;
  for (let i = 0; i < N; i++) { const d = M.drop(n, p, rng); ok(d.steps.length === n && d.steps.reduce((a, b) => a + b, 0) === d.k, 'drop path'); cnt[d.k]++; }
  cnt.forEach((c, k) => near(c / N, M.pmf(n, k, p), 0.012, 'simulated share ≈ pmf'));
}

// ---- step 2: centre and spread ----
near(M.sd(20, 0.5), 2.236, 5e-4, 'σ(20, 0.5)'); near(M.sd(80, 0.5), 4.472, 5e-4, 'σ(80, 0.5)'); near(M.sd(80, 0.5) / M.sd(20, 0.5), 2, 1e-12, '×4 n → ×2 σ');
both('s2hint', '2.236'); both('s2hint', '4.472');
for (const n of [5, 30, 100]) for (const p of M.P_STEPS) {
  const v = M.pmfAll(n, p); let m = 0, s2 = 0; v.forEach((q, k) => { m += k * q; }); v.forEach((q, k) => { s2 += (k - m) * (k - m) * q; });
  near(m, M.mean(n, p), 1e-9, 'mean = np'); near(s2, M.variance(n, p), 1e-8, 'variance = np(1−p)');
}
let wLo = 1, wHi = 0; for (let n = 30; n <= 100; n++) for (const p of M.P_STEPS) { const w = M.within1sd(n, p); wLo = Math.min(wLo, w); wHi = Math.max(wHi, w); }
ok((100 * wLo).toFixed(1) === '57.1' && (100 * wHi).toFixed(1) === '78.0', `μ ± σ mass ${wLo}..${wHi}`);
both('s2hint', '57.1%'); both('s2hint', '78.0%'); both('s2hint', '68.3%');
near(M.Phi(1) - M.Phi(-1), 0.683, 5e-4, 'normal ±1σ = 68.3%');

// ---- the normal functions themselves ----
{
  let mx = 0;
  for (let x = -8; x <= 8; x += 0.37) { let s = 0; const N = 4000, a = -12, h = (x - a) / N; for (let i = 0; i <= N; i++) s += ((i === 0 || i === N) ? 1 : (i % 2 ? 4 : 2)) * M.phi(a + i * h); s *= h / 3; mx = Math.max(mx, Math.abs(s - M.Phi(x))); }
  ok(mx < 1e-10, 'Φ matches the integral of φ: ' + mx);
  near(M.phi(0), 0.399, 5e-4, 'bell peak 0.399'); both('s4e', '0.399');
  for (const [n, p] of [[10, 0.2], [50, 0.5], [100, 0.9]]) { let s = 0; const a = -40, b = n + 40, N = 20000, h = (b - a) / N; for (let i = 0; i <= N; i++) s += ((i === 0 || i === N) ? 1 : (i % 2 ? 4 : 2)) * M.normalDensity(n, p, a + i * h); near(s * h / 3, 1, 1e-8, 'density integrates to 1'); }
}

// ---- step 3: the fit and the rule of thumb ----
ok(M.fit(50, 0.2).rule && !M.fit(49, 0.2).rule, 'p = 0.2: rule first met at n = 50 (s3hint)');
both('s3hint', '50');
{ const f = M.fit(10, 0.2); ok(f.at === 1, 'default biggest gap at k = 1'); ok(M.normalDensity(10, 0.2, -0.5) > 0.02, 'bell spills below 0 at n = 10, p = 0.2'); }
ok(M.fit(10, 0.2).gap > M.fit(100, 0.2).gap * 5, 'gap shrinks a lot from n = 10 to 100');

// ---- step 4: standardised gap and its decay ----
ok(M.N4.length === 10 && M.N4[0] === 4 && M.N4[9] === 400 && M.N4.every(n => Number.isInteger(Math.sqrt(n))), 'n ladder 4..400');
const ratio = (p, a, b) => M.fit(b, p).zGap / M.fit(a, p).zGap;
for (const [a, b] of [[64, 256], [100, 400]]) {
  const r5 = ratio(0.5, a, b); ok(r5 > 0.24 && r5 < 0.26, `p = 0.5 shrinks to ~1/4: ${r5}`);
  for (const p of M.P_STEPS) {
    if (Math.abs(p - 0.5) < 1e-9) continue;
    const r = ratio(p, a, b);
    if (Math.abs(p - 0.5) > 0.06) ok(r > 0.47 && r < 0.51, `p = ${p} shrinks to ~1/2: ${r}`);
    else ok(r > r5 && r < 0.47, `p = ${p} in between: ${r}`);
  }
}
both('s4hint', '64'); both('s4hint', '256'); both('s4hint', '400'); both('s4hint', '0.45'); both('s4hint', '0.55');
let ruleMax = 0; for (let n = 1; n <= 400; n++) for (const p of M.P_STEPS) { const f = M.fit(n, p); if (f.rule) ruleMax = Math.max(ruleMax, f.zGap); }
ok(ruleMax <= 0.026 && ruleMax > 0.025, 'rule-of-thumb max standardised gap ≤ 0.026: ' + ruleMax);
both('s4hint', '0.026');
for (const n of M.N4) for (const p of M.P_STEPS) { const f = M.fit(n, p); near(f.zGap, f.gap * M.sd(n, p), 1e-15, 'zGap = σ·gap'); near(f.skew, (1 - 2 * p) / M.sd(n, p), 1e-15, 'skew'); }
near(M.fit(400, 0.3).skew / M.fit(100, 0.3).skew, 0.5, 1e-12, 'skewness shrinks like 1/√n');

// ---- step 5: tails and the continuity correction ----
{
  const t = M.tail(100, 0.5, 60);
  ok(t.exact.toFixed(4) === '0.0284' && t.raw.toFixed(4) === '0.0228' && t.cc.toFixed(4) === '0.0287', 'default n = 100, k = 60 values');
  near(t.raw / t.exact, 0.8, 0.02, 'uncorrected about a fifth too small');
  both('s5hint', '0.0284'); both('s5hint', '0.0228'); both('s5hint', '0.0287');
  let mr = 0, mc = 0, worse = 0;
  for (let n = 10; n <= 200; n += 2) for (let k = 0; k <= n; k++) {
    const q = M.tail(n, 0.5, k);
    let e = 0; for (let j = k; j <= n; j++) e += M.pmf(n, j, 0.5); near(q.exact, e, 1e-12, 'exact tail');
    mr = Math.max(mr, Math.abs(q.errRaw)); mc = Math.max(mc, Math.abs(q.errCc));
    if (q.exact >= 0.01 && q.exact <= 0.99 && Math.abs(q.errCc) > Math.abs(q.errRaw)) worse++;
  }
  ok(mr.toFixed(3) === '0.123' && mc.toFixed(4) === '0.0027', `max errors ${mr} / ${mc}`);
  ok(worse === 0, 'corrected is closer whenever 1% ≤ exact ≤ 99%');
  both('s5hint', '0.123'); both('s5hint', '0.0027'); both('s5hint', '1%'); both('s5hint', '99%');
  ok(html.includes('id="n5" data-step="5" type="range" min="10" max="200" step="2" value="100"') && html.includes('value="60"'), 'step 5 slider range and defaults');
}

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => [...new Set(s.match(/\{[a-zA-Z0-9]+\}/g) || [])].sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['formula', 'c4axis', 's2lgBand']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) { ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model'); ok(STRINGS[l].foot.includes(l === 'zh' ? '二项分布到正态 · 钉板上长出的钟形' : 'Binomial to Normal · The Bell Curve Growing on a Pegboard'), 'footer names the original'); }
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/左图|右图|left chart|right chart|left-hand|right-hand/i.test(v), 'no left/right chart wording in ' + l + '.' + k);

// ---- keys, controls, provenance ----
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const m of app.matchAll(/t\(F\.rule \? '(\w+)' : '(\w+)'/g)) ok(STRINGS.zh[m[1]] && STRINGS.zh[m[2]], 'rule keys');
for (const k of ['s3skewR', 's3skewL', 'pathL', 'pathR']) ok(STRINGS.zh[k] && app.includes(`'${k}'`), 'dynamic key ' + k);
for (const id of ['n0', 'k0', 'next0', 'all0', 'n1', 'p1', 'drop1', 'drop100', 'drop1000', 'clear1', 'n2', 'p2', 'n3', 'p3', 'n4', 'p4', 'grow4', 'n5', 'k5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder and stylesheet');

// ---- deep links ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../probability/basics/binomial-normal/index.html')) && html.includes('href="../../../probability/basics/binomial-normal/"'), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);
ok(html.includes('content="senior"') && html.includes('content="probability"'), 'stage and category');

console.log(`PASS binomial-normal core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · μ±σ ${(100 * wLo).toFixed(1)}–${(100 * wHi).toFixed(1)}% · rule max ${ruleMax.toFixed(4)}`);
