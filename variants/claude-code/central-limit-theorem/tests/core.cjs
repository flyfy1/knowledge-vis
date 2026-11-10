'use strict';
// Central limit theorem (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
const both = (key, ...subs) => { for (const l of ['zh', 'en']) for (const s of subs) ok(STRINGS[l][key].includes(s), `${key} (${l}) quotes ${s}`); };

// ---- number formatter keeps integer zeros ----
const fmt = new Function(app.match(/const fmt = [^\n]+/)[0].replace('const fmt =', 'return'))();
ok(fmt(90, 0) === '90' && fmt(300, 0) === '300' && fmt(3.5, 3) === '3.5' && fmt(1.70783, 3) === '1.708', 'fmt trims only after a decimal point');

// ---- sources are proper distributions; moments ----
for (const k of M.ORDER) { const S = M.SOURCES[k]; near(S.p.reduce((a, b) => a + b, 0), 1, 1e-12, 'probabilities sum to 1: ' + k); ok(S.p.every(v => v >= 0), 'non-negative'); }
near(M.moments('die').mu, 3.5, 1e-12, 'die μ'); near(M.moments('die').sigma, Math.sqrt(35 / 12), 1e-12, 'die σ');
near(M.moments('rare').mu, 0.1, 1e-12, 'rare μ'); near(M.moments('rare').sigma, 0.3, 1e-12, 'rare σ');
ok(Math.abs(M.moments('die').skew) < 1e-9 && Math.abs(M.moments('ushape').skew) < 1e-9 && M.moments('skew').skew > 1 && M.moments('rare').skew > 2, 'die and U symmetric; parcels and defects skewed');
both('s3hint', '1.71'); near(M.moments('die').sigma, 1.71, 0.005, 'σ ≈ 1.71');

// ---- exact distribution of the sum = n-fold convolution; matches brute force ----
for (const k of M.ORDER) for (const n of [1, 2, 3]) {
  const S = M.SOURCES[k], pm = M.sumDist(k, n), brute = new Array(pm.length).fill(0);
  const rec = (i, s, p) => { if (i === n) { brute[s] += p; return; } S.vals.forEach((v, j) => rec(i + 1, s + v, p * S.p[j])); };
  rec(0, 0, 1);
  pm.forEach((v, i) => near(v, brute[i], 1e-12, `sum dist ${k} n=${n}`));
}
for (const k of M.ORDER) for (const n of [1, 4, 25, 100, 300]) {
  const pm = M.sumDist(k, n); near(pm.reduce((a, b) => a + b, 0), 1, 1e-9, 'total probability');
  const { mean, sd } = M.sdOfMean(k, n), mo = M.moments(k);
  near(mean, mo.mu, 1e-9, 'mean of the average = μ'); near(sd, mo.sigma / Math.sqrt(n), 1e-9, 'sd of the average = σ/√n');
}

// ---- step 0 quiz: 100 dice, share of averages in [3.2, 3.8] ----
{ const pm = M.sumDist('die', 100); let c = 0; pm.forEach((p, s) => { if (s >= 320 && s <= 380) c += p; });
  ok((c * 100).toFixed(0) === '93', 'quiz: about 93% between 3.2 and 3.8'); ok(app.includes("s >= 320 && s <= 380"), 'page uses the same window'); }
ok(app.includes("choice.value === 'b'") && html.includes('value="b"'), 'quiz key b');

// ---- step 1: simulated experiments agree with σ/√n (law of the histogram, not a page claim of exactness) ----
{ const r = M.mulberry32(77); for (const k of M.ORDER) for (const n of [1, 10]) {
  const ms = Array.from({ length: 4000 }, () => M.experiment(k, n, r).mean), mm = ms.reduce((a, b) => a + b, 0) / ms.length;
  const sd = Math.sqrt(ms.reduce((a, b) => a + (b - mm) * (b - mm), 0) / ms.length), mo = M.moments(k);
  near(mm, mo.mu, 4 * mo.sigma / Math.sqrt(n * 4000), 'simulated mean ' + k); near(sd / (mo.sigma / Math.sqrt(n)), 1, 0.06, 'simulated sd ' + k);
} }

// ---- step 2: KS distance thresholds quoted in s2hint ----
const first = (k, th) => { for (let n = 1; n <= 300; n++) if (M.ksGap(k, n) < th) return n; return null; };
const F = { die: first('die', 0.05), ushape: first('ushape', 0.05), skew: first('skew', 0.05), rare: first('rare', 0.05) };
assert.deepEqual(F, { die: 6, ushape: 6, skew: 18, rare: 284 }); checks++;
both('s2hint', '6', '18', '284');
ok(M.ksGap('rare', 1) > 0.5 && M.ksGap('die', 1) > 0.1, 'n = 1 is far from normal');
for (const k of M.ORDER) ok(M.ksGap(k, 300) < M.ksGap(k, 30) && M.ksGap(k, 30) < M.ksGap(k, 3), 'KS falls with n: ' + k);
ok(M.ksGap('rare', 1) < 0.56, 'KS stays inside the drawn y range 0..0.56');
// the KS gap of a symmetric source vs a continuous check: normal CDF accuracy
near(M.Phi(1.959963984540054), 0.975, 2e-7, 'Φ(1.96)'); near(M.Phi(0), 0.5, 1e-9, 'Φ(0)');

// ---- step 3: halving with 4n; required n for a target ----
for (const k of M.ORDER) for (let n = 1; n <= 100; n += 7) near(M.sdOfMean(k, 4 * n).sd / M.sdOfMean(k, n).sd, 0.5, 1e-9, 'ratio 0.5');
ok(M.nNeeded(M.moments('die').sigma, 0.1) === 292, 's3hint: die needs n ≥ 292 for 0.1');
both('s3hint', '292');
for (const k of M.ORDER) for (let e = 0.02; e <= 0.5; e += 0.01) {
  const need = M.nNeeded(M.moments(k).sigma, e);
  ok(M.moments(k).sigma / Math.sqrt(need) <= e + 1e-12 && (need === 1 || M.moments(k).sigma / Math.sqrt(need - 1) > e), 'smallest n meeting the target');
  ok(need <= 20000, 'needed n inside the drawn axis (≤ 20000)');
  // halving the target quadruples the required n (up to rounding)
  { const h = M.nNeeded(M.moments(k).sigma, e / 2); ok(h <= 4 * need && h > 4 * (need - 1), 'halving the target quadruples n (up to rounding)'); }
}

// ---- step 4: polls ----
ok(fmt(M.margin(0.5, 1000) * 100, 1) === '3.1', 's4hint: ±3.1% at n = 1000');
ok(M.nNeeded(0.5, 0.03 / M.Z95) === 1068, 's4hint: 1068 for exactly ±3.0%');
ok(fmt(M.exactCoverage(0.05, 100) * 100, 1) === '87.7', 's4hint: 87.7% at p = 5%, n = 100');
near(M.exactCoverage(0.5, 1000), 0.946, 0.001, 'default exact coverage ≈ 94.6%');
both('s4hint', '3.1%', '1068', '87.7%');
{ const r = M.mulberry32(9); let c = 0; const T = 3000; for (let i = 0; i < T; i++) if (M.poll(0.5, 1000, r).covers) c++; near(c / T, M.exactCoverage(0.5, 1000), 0.015, 'simulated coverage ≈ exact'); }
// brute-force check of exactCoverage on a small case
{ const p = 0.3, n = 20; let c = 0; for (let k = 0; k <= n; k++) { let b = 1; for (let i = 0; i < k; i++) b *= (n - i) / (i + 1); const pr = b * Math.pow(p, k) * Math.pow(1 - p, n - k); if (Math.abs(k / n - p) <= M.margin(k / n, n)) c += pr; } near(M.exactCoverage(p, n), c, 1e-12, 'exact coverage = brute force'); }
// slider grid: displayed axis covers every interval centre for typical polls (R ≥ 4.2 SE)
ok(html.includes('id="p4" data-step="4" type="range" min="2" max="98"') && html.includes('id="n4" data-step="4" type="range" min="100" max="3000" step="100" value="1000"'), 'step 4 sliders');

// ---- step 5: running averages ----
let worst = 0;
for (let s = 1; s <= 200; s++) { const v = [0, 1, 2, 3].map(j => M.runningMeans('die', s * 10 + j, 5000)[4999]); worst = Math.max(worst, Math.max(...v) - Math.min(...v)); }
ok(worst < 0.15, `s5hint: die lines within 0.15 at n = 5000 for sets 1–200 (${worst.toFixed(3)})`);
both('s5hint', '0.15');
{ const r = M.mulberry32(5); for (const n of [1, 10, 100]) { let out = 0; const T = 6000; for (let t = 0; t < T; t++) { let s = 0; for (let i = 0; i < n; i++) s += M.cauchy(r); if (Math.abs(s / n) > 1) out++; } near(out / T, 0.5, 0.03, 'Cauchy average outside [−1, 1] half the time, n = ' + n); } }
{ let wide = 0; for (let s = 1; s <= 20; s++) { const v = [0, 1, 2, 3].map(j => M.runningMeans('cauchy', s * 10 + j, 5000)[4999]); if (Math.max(...v) - Math.min(...v) > 1) wide++; } ok(wide >= 15, 'Cauchy lines usually still more than 1 apart at n = 5000 (' + wide + '/20)'); }

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['lg0Sd', 'lg3N', 'lg3N4']); // symbols only
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const k of zk) ok(!/左图|右图|left chart|right chart|left panel|right panel/i.test(STRINGS[l][k]), 'no left/right figure references: ' + k);
for (const k of M.ORDER) ok(STRINGS.zh['src_' + k] && STRINGS.zh['srcD_' + k], 'source strings ' + k);

// ---- every key referenced in HTML/app exists ----
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) if (!/_$/.test(m[1])) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['checkQuiz', 'n1', 'run1', 'run100', 'run1000', 'clear1', 'n2', 'play2', 'n3', 'e3', 'p4', 'n4', 'poll100', 'clear4', 'reseed5']) ok(html.includes(`id="${id}"`), 'control ' + id);

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../probability/statistics/central-limit-theorem/index.html')), 'comparison link target exists');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css') && !html.includes('canvas-label-guard'), 'provenance placeholder, no label guard');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS central-limit-theorem core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · KS<0.05 at n=${F.die}/${F.ushape}/${F.skew}/${F.rare} · die spread ${worst.toFixed(3)}`);
