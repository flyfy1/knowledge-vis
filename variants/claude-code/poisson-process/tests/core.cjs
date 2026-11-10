'use strict';
// Poisson process (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const both = (needleZh, needleEn, key) => { ok(STRINGS.zh[key].includes(needleZh), `zh ${key} quotes ${needleZh}`); ok(STRINGS.en[key].includes(needleEn), `en ${key} quotes ${needleEn}`); };
const SEEDS = [1, 2, 3, 4, 5];
const grid = (a, b, s) => { const out = []; for (let v = a; v <= b + 1e-9; v += s) out.push(Number(v.toFixed(4))); return out; };

// ---- exact distributions ----
for (const mu of [0.5, 1, 4, 8, 20, 45]) { let s = 0, m = 0, v = 0; for (let k = 0; k < 400; k++) { const p = M.poissonPmf(k, mu); s += p; m += k * p; v += k * k * p; } near(s, 1, 1e-10, 'Poisson sums to 1'); near(m, mu, 1e-8, 'Poisson mean μ'); near(v - m * m, mu, 1e-7, 'Poisson variance μ'); }
for (const n of M.SLICES) { let s = 0; for (let k = 0; k <= n; k++) s += M.binomPmf(k, n, 0.3 * 10 / n); near(s, 1, 1e-9, 'binomial sums to 1'); }

// ---- step 0: binomial → Poisson as the slices shrink ----
for (const lam of grid(0.1, 0.8, 0.1)) {
  const mu = lam * M.T0, tv = M.SLICES.map(n => M.tvBinomPoisson(n, mu));
  for (let i = 1; i < tv.length; i++) ok(tv[i] < tv[i - 1], `TV falls with n (λ=${lam})`);
  ok(M.SLICES[0] * 1 >= mu / 0.8 - 1e-9 && lam * M.T0 / M.SLICES[0] <= 0.8 + 1e-9, 'p = λΔt stays a probability at n = 10');
  // "once n is not tiny, ten times more slices ≈ ten times less distance": 50 → 500 and 200-fold 10 → 2000 scaled
  const r = tv[2] / tv[4]; ok(r > 8 && r < 12, `TV(50)/TV(500) = ${r} at λ=${lam}`);
  const r2 = tv[3] / tv[5]; ok(r2 > 16 && r2 < 24, `TV(100)/TV(2000) ≈ 20 = 2000/100 at λ=${lam}`);
}
// coarse slicing makes the gap bigger when λ is larger (s0hint)
ok(M.tvBinomPoisson(10, 8) > M.tvBinomPoisson(10, 4) && M.tvBinomPoisson(10, 4) > M.tvBinomPoisson(10, 1), 'TV grows with λ at n = 10');
// the slice draw is unbiased: averaged over seeds, the count ≈ μ
for (const n of M.SLICES) { let s = 0; for (let seed = 1; seed <= 400; seed++) s += M.sliceDraw(n, 0.4, seed).hits.length; near(s / 400, 4, 0.35, `slice draw mean n=${n}`); }

// ---- step 1: counts in windows (log built from 0.001-minute slices) ----
let lo1 = 9, hi1 = 0;
for (const seed of SEEDS) for (const lam of grid(0.5, 4, 0.5)) {
  const times = M.stream(lam, seed);
  near(times.length / M.T1, lam, 0.1 * lam, 'recorded rate ≈ λ');
  for (const w of grid(0.5, 5, 0.5)) {
    const st = M.countStats(M.windowCounts(times, w));
    ok(Math.abs(st.mean - lam * w) <= 0.15 * lam * w + 0.05, `window mean ≈ λw (λ=${lam}, w=${w}, seed=${seed}): ${st.mean}`);
    lo1 = Math.min(lo1, st.ratio); hi1 = Math.max(hi1, st.ratio);
  }
  ok(times.length * 1 >= M.NGAP + 1, 'enough calls for 1000 gaps');
  ok(times[times.length - 1] <= M.T1 && times.every((v, i) => !i || v > times[i - 1]), 'times increasing inside the log');
}
ok(lo1.toFixed(2) === '0.81' && hi1.toFixed(2) === '1.19', `dispersion range 0.81–1.19 (got ${lo1}–${hi1})`);
both('0.81–1.19', '0.81 and 1.19', 's1hint');
// windows always fit inside the 2400-minute log (400 × 5 = 2000)
ok(M.NWIN * 5 <= M.T1, 'windows inside the log');
// same λw → same predicted shape
for (let k = 0; k < 20; k++) near(M.poissonPmf(k, 1 * 4), M.poissonPmf(k, 2 * 2), 1e-15, 'shape depends on λw only');

// ---- step 2: gaps ----
for (const seed of SEEDS) for (const lam of grid(0.5, 4, 0.5)) {
  const g = M.gaps(M.stream(lam, seed));
  assert.equal(g.length, 1000); checks++;
  const m = M.mean(g) * lam; ok(m > 0.9 && m < 1.1, `mean gap ≈ 1/λ (λ=${lam}, seed=${seed}): ${m}`);
  near(M.survival(g, 1 / lam), Math.exp(-1), 0.05, 'share longer than 1/λ ≈ e^(−1)');
  ok(M.survival(g, 1 / lam) < 0.5, 'most gaps are shorter than average');
  // the tallest histogram bin (width 5/λ/25) is one of the first two
  const bw = 5 / lam / 25, h = new Array(25).fill(0); g.forEach(v => { const i = Math.floor(v / bw); if (i < 25) h[i]++; });
  ok(h.indexOf(Math.max(...h)) <= 1, `tallest bin among the first two (λ=${lam}, seed=${seed})`);
}
ok(Math.round(100 * Math.exp(-1)) === 37, 'e^(−1) ≈ 37%');
both('e^(−1) ≈ 37%', 'e^(−1) ≈ 37%', 's2hint');

// ---- step 3: memorylessness ----
const ex = M.waitSample('exp', 1), un = M.waitSample('unif', 1);
near(M.mean(ex), 1, 0.03, 'exponential sample mean 1'); near(M.mean(un), 1, 0.03, 'uniform sample mean 1'); ok(Math.max(...un) <= 2, 'uniform never above 2');
for (const s of grid(0, 1.9, 0.1)) {
  const re = M.remaining(ex, s), ru = M.remaining(un, s);
  ok(re.length > 2000 && ru.length > 500, 'enough survivors at s=' + s);
  near(M.mean(re), M.remainingTheory('exp', s), 0.06, `exp remaining mean at s=${s}`);
  near(M.mean(ru), M.remainingTheory('unif', s), 0.02, `uniform remaining mean at s=${s}`);
  ok(re.length < (s === 0 ? Infinity : M.remaining(ex, s - 0.1).length + 1), 'fewer survivors as s grows');
}

// ---- step 4: bus-stop paradox ----
assert.deepEqual(M.busTheory('regular'), { wait: 5, gap: 10 }); assert.deepEqual(M.busTheory('poisson'), { wait: 10, gap: 20 }); checks += 2;
let lo4 = 9, hi4 = 0;
for (const seed of SEEDS) {
  const br = M.buses('regular', seed), sr = M.busStats(br, M.passengers(br, seed));
  near(sr.meanHead, 10, 1e-9, 'regular headway 10'); near(sr.meanGap, 10, 1e-9, 'regular landed gap 10'); near(sr.meanWait, 5, 0.4, 'regular wait ≈ 5');
  ok(M.passengers(br, seed).every(p => p.wait >= 0 && p.wait <= 10), 'regular waits within 0–10');
  const bp = M.buses('poisson', seed), pax = M.passengers(bp, seed), sp = M.busStats(bp, pax);
  ok(pax.length === 400 && pax.every(p => p.wait >= 0 && p.wait <= p.gap), 'waits are inside the landed gap');
  near(sp.meanWait / sp.meanHead, 1, 0.15, 'random timetable: wait ≈ one mean headway');
  near(sp.meanWait, 10, 2, 'random timetable: wait ≈ 10 min');
  ok(sp.meanGap > 16 && sp.meanGap < 22, 'landed gap ≈ 20 min');
  ok(sp.long > sp.headLong, 'long headways hold more passengers than their share of buses');
  const r = sp.meanGap / sp.meanHead; lo4 = Math.min(lo4, r); hi4 = Math.max(hi4, r);
}
ok(lo4.toFixed(2) === '1.76' && hi4.toFixed(2) === '2.05', `landed/mean headway 1.76–2.05 (got ${lo4}–${hi4})`);
both('1.76–2.05', '1.76–2.05', 's4hint');
both('约 10 分钟', 'About 10 minutes', 'quizB');

// ---- step 5: merging and thinning ----
const rates5 = grid(0.2, 3, 0.4);
let lo5 = 9, hi5 = 0;
for (const seed of SEEDS) for (const l1 of rates5) for (const l2 of rates5) for (const p of [0, 0.05, 0.3, 0.6, 1]) {
  const r = M.mergeThin(l1, l2, p, seed), sum = l1 + l2;
  // tolerances are 4 standard errors of the simulated quantity (1000 minutes of data)
  const nM = sum * M.T5, se = q => 4 * Math.sqrt(q * (1 - q) / nM) + 0.005;
  ok(Math.abs(r.mergedRate - sum) <= 4 * Math.sqrt(nM) / M.T5, 'merged rate ≈ λ₁ + λ₂');
  ok(Math.abs(r.shareA - l1 / sum) <= se(l1 / sum), 'share from A ≈ λ₁/(λ₁+λ₂)');
  ok(Math.abs(r.meanGap * sum - 1) <= 4 / Math.sqrt(nM), 'merged mean gap ≈ 1/(λ₁+λ₂)');
  ok(Math.abs(r.keptRate - p * sum) <= 4 * Math.sqrt(p * nM) / M.T5 + 0.005, 'kept rate ≈ p(λ₁+λ₂)');
  if (p === 0) ok(Number.isNaN(r.keptRatio), 'p = 0: index undefined');
  else if (p * sum >= 0.1) { lo5 = Math.min(lo5, r.keptRatio); hi5 = Math.max(hi5, r.keptRatio); }
  if (p === 1) assert.equal(r.kept.length, r.merged.length);
}
ok(lo5 > 0.8 && hi5 < 1.25, `thinned dispersion near 1 (${lo5}–${hi5})`);

// ---- step 6: changing rate ----
near(M.Lambda(0, 12), 100, 1e-9, 'whole-day area');
for (let a = 0; a <= 11.5; a += 0.5) for (let w = 0.5; w <= 3; w += 0.5) {
  const b = Math.min(12, a + w); let s = 0; const n = 4000; for (let i = 0; i < n; i++) s += M.rate(a + (b - a) * (i + 0.5) / n) * (b - a) / n;
  near(M.Lambda(a, b), s, 1e-6, 'Λ = area under λ(t)');
}
ok(Math.max(...M.RATE_KNOTS) <= M.RMAX, 'thinning bound holds');
let lo6 = 9, hi6 = 0;
for (const seed of SEEDS) {
  const dd = M.days(seed); assert.equal(dd.length, 500); checks++;
  for (let a = 0; a <= 11.5; a += 0.5) for (let w = 0.5; w <= 3; w += 0.5) {
    const b = Math.min(12, a + w), st = M.countStats(M.windowAcrossDays(dd, a, b)), L = M.Lambda(a, b);
    ok(Math.abs(st.mean - L) <= 0.12 * L + 0.1, `mean ≈ Λ at ${a}+${w}`);
    lo6 = Math.min(lo6, st.ratio); hi6 = Math.max(hi6, st.ratio);
  }
  const pool = M.pooledHourly(dd);
  near(pool.ratio, pool.theoryRatio, 0.1, 'pooled ratio matches 1 + var(Λ)/mean(Λ)');
  ok(pool.ratio > 2, 'pooled index well above 1');
}
ok(lo6.toFixed(2) === '0.81' && hi6.toFixed(2) === '1.21', `window dispersion 0.81–1.21 (got ${lo6}–${hi6})`);
both('0.81–1.21', '0.81 and 1.21', 's6hint');

// ---- number formatting: trailing zeros are trimmed only after a decimal point ----
const app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
const fmtSrc = app.match(/const fmt = ([^\n]+);\n/)[1];
const fmt = eval(fmtSrc);
assert.equal(fmt(90, 0), '90'); assert.equal(fmt(10, 2), '10'); assert.equal(fmt(0.5, 2), '0.5'); assert.equal(fmt(2.0, 1), '2'); checks += 4;

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['rowA', 'rowB']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) { ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model'); ok(!/左图|右图|left chart|right chart|left-hand|right-hand/i.test(Object.values(STRINGS[l]).join('')), 'no left/right chart references'); }

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['n0', 'l0', 'redraw0', 'l1', 'w1', 'count1', 'reroll1', 't2', 's3', 'kindExp', 'kindUnif', 'clear3', 'checkQuiz', 'modeReg', 'modePoi', 'pax4', 'reroll4', 'a5', 'b5', 'p5', 'reroll5', 'a6', 'w6', 'reroll6']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css') && !html.includes('canvas-label-guard'), 'provenance placeholder, css, no label guard');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../probability/stochastic/poisson-process/index.html')), 'comparison link target exists');
for (let i = 0; i <= 7; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS poisson-process core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · window dispersion ${lo1.toFixed(2)}–${hi1.toFixed(2)} · bus ratio ${lo4.toFixed(2)}–${hi4.toFixed(2)}`);
