'use strict';
// Bayes (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');

// ---- the page's number formatter keeps integer zeros (90 stays 90) ----
const fmtSrc = app.match(/const fmt = [^\n]+/)[0];
const fmt = new Function(fmtSrc.replace('const fmt =', 'return'))();
ok(fmt(90, 0) === '90' && fmt(100, 0) === '100' && fmt(8.3333, 1) === '8.3' && fmt(0.5, 2) === '0.5' && fmt(2.0, 1) === '2', 'fmt trims only after a decimal point');
const pctSrc = app.match(/function pct\(v\) \{[\s\S]*?\n\}/)[0];
const pct = new Function('fmt', pctSrc + '; return pct;')(fmt);
ok(pct(0.08333) === '8.3%' && pct(0.9) === '90%' && pct(0.001) === '0.1%' && pct(0.99999) === '99.999%', 'percent formatting');

// ---- step 0: counts are whole emails for every slider position; counting = Bayes' rule ----
for (let p = 1; p <= 50; p++) {
  const c = M.counts(p);
  ok([c.S, c.H, c.Fs, c.Fh].every(Number.isInteger), 'integer counts at ' + p + '%');
  ok(Math.abs(c.S * 0.9 - c.Fs) < 1e-9 && Math.abs(c.H * 0.1 - c.Fh) < 1e-9, 'counts are exact, not rounded, at ' + p + '%');
  near(c.post, c.exact, 1e-12, 'count ratio = Bayes formula');
}
const c1 = M.counts(1);
assert.deepEqual([c1.S, c1.Fs, c1.H, c1.Fh, c1.F], [10, 9, 990, 99, 108]); checks++;
ok(pct(c1.post) === '8.3%', 'default posterior 8.3%');
for (const l of ['zh', 'en']) ok(['10', '9', '990', '99', '108', '8.3%'].every(s => STRINGS[l].correct.includes(s)), 'quiz answer text matches counts (' + l + ')');
ok(M.counts(10).post === 0.5, 's0hint: 50% at a 10% base rate');
ok(html.includes('value="c"') && app.includes("choice.value === 'c'"), 'quiz key is the 8% option');

// ---- step 1: the two directions; default π = 10%, a = 90%, b = 10% gives 50% ----
near(M.posterior(0.1, 0.9, 0.1), 0.5, 1e-12, 'step 1 default posterior');
for (let pi = 0.01; pi <= 0.5; pi += 0.01) for (let a = 0.5; a <= 0.99; a += 0.07) for (let b = 0.01; b <= 0.3; b += 0.03) {
  const J = M.joint(pi, a, b);
  near(J.A + J.B, J.E, 1e-12, 'pool area'); near(J.post, M.posterior(pi, a, b), 1e-12, 'mosaic = formula');
  // odds form is the same rule
  near(M.posterior(pi, a, b), M.prob(M.odds(pi) * a / b), 1e-12, 'odds form');
  // s1hint: lowering b (π, a fixed) raises the posterior
  ok(M.posterior(pi, a, b) >= M.posterior(pi, a, b + 0.01) - 1e-12, 'posterior falls as b rises');
}

// ---- step 2: same LR = same log-odds shift, whatever the prior ----
for (const p of M.PRIORS) for (const lr of M.LRS) {
  const q = M.prob(M.odds(p) * lr);
  near(M.lo10(q) - M.lo10(p), Math.log10(lr), 1e-9, `shift for p=${p} lr=${lr}`);
  ok(Math.abs(M.lo10(q)) <= 5.4, 'arrow stays inside the drawn axis ±5.4');
}
ok(M.PRIORS[3] === 0.01 && M.LRS[8] === 9, 'step 2 defaults: prior 1%, LR 9');
ok(html.includes('id="p2" data-step="2" type="range" min="0" max="16" step="1" value="3"') && html.includes('id="l2" data-step="2" type="range" min="0" max="11" step="1" value="8"'), 'step 2 slider ranges match lists');
ok(M.PRIORS.length === 17 && M.LRS.length === 12, 'list lengths');
near(M.prob(M.odds(0.01) * 9), 0.0833, 5e-4, 's2hint: 1% → 8%'); near(M.prob(M.odds(0.5) * 9), 0.9, 1e-12, 's2hint: 50% → 90%');
ok(M.LRS.includes(1) && M.lo10(M.prob(M.odds(0.3) * 1)) === M.lo10(0.3), 'LR = 1 changes nothing');
// the filter of step 0 has LR 9
near(M.FILTER.hit / M.FILTER.fa, 9, 1e-12, 'filter LR = 9');
// s2hint: for LR = 9 the push q − p is largest at p = 1/(1+√9) = 25%, reaching 75%
{ let best = 0, at = 0; for (let i = 1; i < 10000; i++) { const p = i / 10000, d = M.posterior(p, 9, 1) - p; if (d > best) { best = d; at = p; } }
  near(at, 0.25, 1e-3, 'max push at 25%'); near(M.posterior(0.25, 9, 1), 0.75, 1e-12, '25% → 75%');
  ok(M.posterior(0.001, 9, 1) - 0.001 < 0.01 && M.posterior(0.999, 9, 1) - 0.999 < 0.001, 'small push near the ends'); }

// ---- step 3: chaining under conditional independence; order does not matter ----
const ids = M.WORDS.map(w => w.id);
ok(M.wordById('free').lr > 1 && M.wordById('prize').lr > 1 && M.wordById('meeting').lr < 1, 's3hint: up, up, down');
assert.deepEqual(M.WORDS.map(w => +w.lr.toFixed(6)), [15, 20, 5, 3, 0.5, 0.2]); checks++;
for (const p of M.PRIORS) for (let s = 1; s < 40; s++) {
  const order = M.shuffled(ids, s).slice(0, 2 + (s % 5)), other = M.shuffled(order, s + 99);
  const a = M.chain(p, order), b = M.chain(p, other);
  near(Math.log10(a[a.length - 1].odds), Math.log10(b[b.length - 1].odds), 1e-9, 'end point independent of order');
  const prod = order.reduce((o, id) => o * M.wordById(id).lr, M.odds(p));
  near(Math.log10(a[a.length - 1].odds), Math.log10(prod), 1e-9, 'chain = prior odds × product of LRs');
  // the step heights depend only on each LR: changing the prior shifts the staircase rigidly
  const c = M.chain(0.5, order);
  a.forEach((st, i) => near(Math.log10(st.odds) - Math.log10(a[0].odds), Math.log10(c[i].odds) - Math.log10(c[0].odds), 1e-9, 'rigid shift'));
}
// every reachable log-odds sits inside the tick list range used for labels
const all = M.chain(0.999, ['free', 'prize', 'link', 'invoice']), low = M.chain(0.001, ['attach', 'meeting']);
ok(Math.log10(all[all.length - 1].odds) < M.lo10(0.9999999) && Math.log10(low[low.length - 1].odds) > M.lo10(0.0001) - 1, 'tick list covers the reachable range');

// ---- step 4: grid posterior = exact Beta result for a flat prior ----
const flat = M.track('flat');
for (let n = 0; n <= M.NMAX; n++) {
  near(flat[n].mean, (flat[n].k + 1) / (n + 2), 1e-4, 'grid mean = (k+1)/(n+2) at n=' + n);
  ok(flat[n].lo < flat[n].hi, 'interval ordered');
}
near(flat[0].mean, 0.5, 1e-9, 's4zero mean'); near(flat[0].lo, 0.05, 1e-9, 's4zero lo'); near(flat[0].hi, 0.95, 1e-9, 's4zero hi');
// a flat-prior Beta(1,1) after one click: density 2θ, 90% interval [√0.05, √0.95]
const one = M.summary(M.gridPosterior('flat', 1, 1)); near(one.lo, Math.sqrt(0.05), 2e-3, 'Beta(2,1) lo'); near(one.hi, Math.sqrt(0.95), 2e-3, 'Beta(2,1) hi');
let wsMin = Infinity, wsMax = 0;
for (let n = 25; n <= M.NMAX; n++) { const v = flat[n].width * Math.sqrt(n); wsMin = Math.min(wsMin, v); wsMax = Math.max(wsMax, v); }
ok(wsMin >= 1.4 && wsMax <= 1.6, `s4hint: width·√n in 1.4–1.6 for n ≥ 25 (${wsMin.toFixed(3)}–${wsMax.toFixed(3)})`);
const misses = flat.filter(s => !(s.lo <= M.TRUE_THETA && s.hi >= M.TRUE_THETA)).map(s => s.n);
assert.deepEqual(misses, [21]); checks++;
ok(M.clicksUpTo(21) === 10, 's4hint: 10 of the first 21 clicked');
ok(Math.abs(M.DATA.length - 400) === 0 && M.DATA.every(v => v === 0 || v === 1), '400 simulated visitors');
for (const n of [0, 10, 100, 400]) { const d = M.gridPosterior('flat', n, M.clicksUpTo(n)); let Z = 0; for (let i = 0; i < M.G; i++) Z += (d[i] + d[i + 1]) / 2 / M.G; near(Z, 1, 1e-9, 'density integrates to 1'); }

// ---- step 5: priors wash out (when they allow the truth); a zero prior never recovers ----
const hi = M.track('high'), lo = M.track('low'), cap = M.track('capped');
ok(Math.abs(hi[0].mean - lo[0].mean).toFixed(2) === '0.53', 's5hint: gap 0.53 at n = 0');
ok(Math.abs(hi[400].mean - lo[400].mean).toFixed(2) === '0.02', 's5hint: gap 0.02 at n = 400');
near(hi[0].mean, 0.7, 1e-3, 'high prior mean 0.7'); near(lo[0].mean, 1 / 6, 1e-3, 'low prior mean 1/6');
for (let n = 0; n <= M.NMAX; n++) ok(cap[n].mean <= 0.2 + 1e-9 && cap[n].hi <= 0.2 + 1e-9, 'capped posterior stays ≤ 0.2');
ok(cap[400].mean > 0.19, 'capped posterior presses against 0.2');
ok(Math.abs(hi[400].mean - M.TRUE_THETA) < 0.02 && Math.abs(lo[400].mean - M.TRUE_THETA) < 0.02, 'both near the truth at n = 400');
for (const l of ['zh', 'en']) ok(STRINGS[l].s5hint.includes('0.53') && STRINGS[l].s5hint.includes('0.02'), 's5hint quotes the pinned gaps');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['wlr']); // symbols only
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const k of zk) ok(!/左图|右图|left chart|right chart|left panel|right panel/i.test(STRINGS[l][k]), 'no left/right figure references: ' + k);

// ---- every key referenced in HTML/app exists ----
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) if (m[1] !== 'w_') ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const w of M.WORDS) ok(STRINGS.zh['w_' + w.id] && STRINGS.en['w_' + w.id], 'word ' + w.id);
for (const id of ['p0', 'only0', 'checkQuiz', 'p1', 'a1', 'b1', 'p2', 'l2', 'clear2', 'p3', 'undo3', 'shuffle3', 'clear3', 'add1', 'add10', 'add100', 'reset4', 'n5', 'bLow', 'bCap', 'play5']) ok(html.includes(`id="${id}"`), 'control ' + id);

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../probability/inference/bayes-updating/index.html')), 'comparison link target exists');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder and stylesheet');
ok(!html.includes('canvas-label-guard'), 'no label guard');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS bayes-updating core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · width·√n ${wsMin.toFixed(3)}–${wsMax.toFixed(3)}`);
