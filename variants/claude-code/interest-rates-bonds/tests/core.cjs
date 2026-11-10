'use strict';
// Interest rates & bonds (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const range = (a, b, s) => { const out = []; for (let i = 0; a + i * s <= b + 1e-9; i++) out.push(Math.round((a + i * s) * 1e6) / 1e6); return out; };

// The page's number formatter: trims zeros only after a decimal point.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d); return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s; };
ok(fmt(90, 0) === '90' && fmt(100, 2) === '100' && fmt(4.5, 2) === '4.5' && fmt(-0.001, 2) === '0', 'fmt keeps integer zeros');
const app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
ok(app.includes("s.includes('.') ? s.replace(/0+$/, '')"), 'app uses the same safe formatter');

// ---- step 0: the contract's cash ----
for (const c of range(0, 0.08, 0.005)) for (let n = 1; n <= 10; n++) {
  const cf = M.cashflows(c, n);
  ok(cf.length === n && cf[n - 1].principal === 100 && cf.slice(0, -1).every(q => q.principal === 0), 'principal only in the last year');
  near(cf.reduce((s, q) => s + q.amount, 0), M.totalCash(c, n), 1e-9, 'total = n × coupon + 100');
  near(M.totalCash(c, n), n * c * 100 + 100, 1e-9, 'total formula');
  ok(cf.every(q => Math.abs(q.coupon - c * 100) < 1e-12), 'coupon = rate × face');
}

// ---- step 1: discounting ----
for (const r of range(0, 0.12, 0.005)) for (let t = 0; t <= 30; t++) {
  const v = M.pv(100, r, t);
  near(M.grow(v, r, t), 100, 1e-9, 'round trip back to 100');
  near(M.df(r, t) * 100, v, 1e-12, 'pv = 100 × discount factor');
  ok(M.grow(v, r, t).toFixed(2) === '100.00', 'readout check shows 100.00');
  if (t > 0) ok(r === 0 ? Math.abs(M.pv(100, r, t) - 100) < 1e-12 : M.pv(100, r, t) < M.pv(100, r, t - 1), 'longer wait → less today (flat at r = 0)');
}
// "in proportion, the far years sink the most" (relative cut grows with t), and the 5% → 6% example
for (const r of range(0, 0.115, 0.005)) for (let t = 1; t < 30; t++) ok(1 - M.pv(100, r + 0.005, t) / M.pv(100, r, t) < 1 - M.pv(100, r + 0.005, t + 1) / M.pv(100, r, t + 1), 'relative cut grows with t');
{ const cut = t => (1 - M.pv(100, 0.06, t) / M.pv(100, 0.05, t)) * 100; ok(Math.round(cut(1)) === 1 && Math.round(cut(30)) === 25, `cut ${cut(1)} / ${cut(30)}`); }

// ---- step 2: price = sum of present values ----
for (const c of range(0, 0.08, 0.005)) for (let n = 1; n <= 10; n++) for (const r of range(0, 0.12, 0.0025)) {
  const P = M.price(c, n, r), rows = M.pvFlows(c, n, r);
  near(rows.reduce((s, q) => s + q.pv, 0), P, 1e-9, 'price = Σ present values');
  if (Math.abs(r - c) < 1e-12) near(P, 100, 1e-9, 'r = coupon rate → par');
  else if (r > c) ok(P < 100, 'r above coupon → discount'); else ok(P > 100, 'r below coupon → premium');
  // the right-most payment shrinks the most (absolute) whenever r > 0
  if (r > 0) { const cut = rows.map(q => q.amount - q.pv); ok(cut[n - 1] >= Math.max(...cut) - 1e-12, 'last payment shrinks most'); }
  // the readout's par test uses |P − 100| < 0.005; on the slider grid that happens only when r = c
  ok((Math.abs(P - 100) < 0.005) === (Math.abs(r - c) < 1e-12), 'par verdict only at r = c');
  // price strictly falls as r rises
  if (r > 0) ok(M.price(c, n, r - 0.0025) > P, 'price falls as r rises');
}
// the drawn axis covers the curve: price at 0% = total cash
near(M.price(0.04, 6, 0), M.totalCash(0.04, 6), 1e-9, 'price at r = 0 is total cash');
// curve bends upward (convex): midpoint below chord
for (const c of [0, 0.04, 0.08]) for (const n of [1, 5, 10]) for (const r of range(0.005, 0.115, 0.005)) ok((M.price(c, n, r - 0.005) + M.price(c, n, r + 0.005)) / 2 >= M.price(c, n, r) - 1e-12, 'price curve convex');

// ---- step 3: the market price is where the yield equals the new rate ----
const O = M.OLD, S = M.SEARCH;
near(M.price(O.c, O.n, O.r0), 100, 1e-9, 'bought at 100 when the market rate was 4%');
for (const rn of range(0.01, 0.08, 0.0025)) {
  const fair = M.price(O.c, O.n, rn);
  ok(fair > S.lo + 5 && fair < S.hi - 5, 'fair price inside the asking-price slider');
  near(M.ytm(O.c, O.n, fair), rn, 1e-10, 'yield at the market price = r_new');
  // the discount equals the present value of the coupon gap, discounted at the new rate
  const sf = M.shortfall(O.c, O.n, rn);
  near(100 - sf.total, fair, 1e-9, 'price = 100 − PV(coupon gap)');
  ok(rn > O.c ? fair < 100 && sf.total > 0 : rn < O.c ? fair > 100 && sf.total < 0 : Math.abs(fair - 100) < 1e-9, 'direction of the gap');
  // the halving search: each round halves the bracket and the bracket always holds the market price
  const tr = M.marketSearch(O.c, O.n, rn, S.lo, S.hi, S.rounds);
  ok(tr.length === S.rounds, '12 rounds');
  tr.forEach((q, i) => { ok(q.lo <= fair && fair <= q.hi, 'bracket holds the market price'); near(q.hi - q.lo, (S.hi - S.lo) / Math.pow(2, i), 1e-9, 'bracket halves'); ok((q.move === 'up') === (q.price < fair), 'raise when too cheap, cut when too dear'); });
  const last = tr[tr.length - 1];
  ok(Math.abs(last.price - fair) <= (S.hi - S.lo) / Math.pow(2, S.rounds) + 1e-9, 'last trial within 0.02 of the market price');
  // the final trial reads as "fair" (|yield − r_new| < 0.005 percentage points) and shows the same 2-decimal yield
  ok(Math.abs(M.ytm(O.c, O.n, last.price) - rn) < 5e-5, 'final round lands on the market price');
}
// yield falls as the asking price rises; the y axis (0–11%) holds the whole curve
for (const p of range(S.lo, S.hi, 0.5)) { const y = M.ytm(O.c, O.n, p); ok(y > 0 && y < 0.11, 'yield inside axis'); if (p > S.lo) ok(M.ytm(O.c, O.n, p - 0.5) > y, 'yield falls as price rises'); near(M.price(O.c, O.n, y), p, 1e-8, 'ytm reprices to the asking price'); }
// shortfall bars fit the 0–4.5 axis
ok(Math.abs(0.08 - O.c) * 100 <= 4.5 && Math.abs(0.01 - O.c) * 100 <= 4.5, 'gap bars inside axis');
// the hint's example: at 5% the gap is 1 a year
near(Math.abs(M.shortfall(O.c, O.n, 0.05).rows[0].gap), 1, 1e-12, 'gap of 1 at 5%');

// ---- step 4: maturity ----
const { c: c4, r0 } = M.CMP;
M.MATS.forEach(n => near(M.price(c4, n, r0), 100, 1e-9, 'all start at 100'));
for (const r of range(0.01, 0.08, 0.0025)) {
  const d = M.MATS.map(n => M.pctChange(c4, n, r0, r));
  if (Math.abs(r - r0) < 1e-12) d.forEach(v => near(v, 0, 1e-9, 'no move at 4%'));
  else { ok(Math.abs(d[0]) < Math.abs(d[1]) && Math.abs(d[1]) < Math.abs(d[2]), 'longer → bigger move, same order both ways'); ok(d.every(v => (v > 0) === (r < r0)), 'all move the same direction'); }
  M.MATS.forEach(n => { const p = M.price(c4, n, r); ok(p > 40 && p < 190, 'inside price axis'); ok(M.pctChange(c4, n, r0, r) > -50 && M.pctChange(c4, n, r0, r) < 80, 'inside bar axis'); });
}
// curves get steeper with maturity at the start point
const slope = n => (M.price(c4, n, r0 + 1e-6) - M.price(c4, n, r0 - 1e-6)) / 2e-6;
ok(Math.abs(slope(2)) < Math.abs(slope(10)) && Math.abs(slope(10)) < Math.abs(slope(30)), 'longer is steeper');
// quiz: the 30-year gains more on a cut than it loses on a hike (answer b), numbers shown in the quiz
const down = -M.pctChange(c4, 30, r0, r0 + 0.01), up = M.pctChange(c4, 30, r0, r0 - 0.01);
ok(up > down, 'convexity: gain on a cut > loss on a hike');
ok(fmt(down) === '15.37' && fmt(up) === '19.6', `quiz numbers ${fmt(down)} / ${fmt(up)}`);
for (const n of M.MATS) ok(M.pctChange(c4, n, r0, r0 - 0.01) > -M.pctChange(c4, n, r0, r0 + 0.01), 'asymmetry for every maturity');
// "the 2-year barely moves" at 5%
ok(Math.abs(M.pctChange(c4, 2, r0, 0.05)) < 2, '2-year moves under 2% for one point');

// ---- step 5: duration ----
let maxErrSmall = 0, maxErr = 0;
for (const c of range(0, 0.10, 0.005)) for (let n = 1; n <= 30; n++) {
  const D = M.duration(c, n, M.R5);
  if (c === 0) near(D, n, 1e-9, 'zero-coupon D = n');
  else if (n >= 2) ok(D < n, 'coupons pull D below n');
  else near(D, 1, 1e-12, 'one-year bond D = 1');
  // balance point: Σ (t − D)·pv = 0
  near(M.pvFlows(c, n, M.R5).reduce((s, q) => s + (q.t - D) * q.pv, 0), 0, 1e-8, 'balance');
  // higher coupon at the same maturity → smaller D (less sensitive)
  if (c > 0 && n >= 2) ok(D < M.duration(c - 0.005, n, M.R5), 'higher coupon → smaller D');
  if (c > 0 && n >= 2) ok(D - M.duration(c, n - 1, M.R5) < 1, 'with coupons D grows slower than n');
  for (const dr of [0.01, -0.01]) {
    const ex = M.pctChange(c, n, M.R5, M.R5 + dr), ap = M.approxPct(c, n, M.R5, dr);
    ok(ex >= ap, 'estimate understates gains and overstates losses');
    const e = Math.abs(ex - ap); maxErr = Math.max(maxErr, e); if (D < 10) maxErrSmall = Math.max(maxErrSmall, e);
  }
  // the approximation is the tangent of the price curve
  const h = 1e-6, dP = (M.price(c, n, M.R5 + h) - M.price(c, n, M.R5 - h)) / (2 * h) / M.price(c, n, M.R5);
  near(dP, -D / (1 + M.R5), 1e-5, 'modified duration = slope');
  ok(D <= 30.8 && D >= 0, 'D inside axis');
}
ok(maxErrSmall < 0.7 && maxErrSmall > 0.6, `D < 10 error ${maxErrSmall}`);
ok(maxErr > 1.5, 'error grows with D');
for (const l of ['zh', 'en']) ok(STRINGS[l].s5hint.includes('0.7'), 's5hint quotes the tested bound');
// pv bars fit the 0–110 axis
ok(M.pv(100 + 10, M.R5, 1) < 110, 'largest bar inside axis');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const k of zk) ok(!/左图|右图|left (chart|plot|panel)|right (chart|plot|panel)|on the (left|right)/i.test(STRINGS[l][k]), 'no left/right chart references: ' + k);

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['cpn', 'yrs', 'r1', 't1', 'r2', 'rn3', 'p3', 'search3', 'r4', 'sweep4', 'checkQuiz', 'c5c', 'n5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder and stylesheet');
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
ok(fs.existsSync(path.join(dir, '../../../investment/rates/interest-rates-bonds/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS interest-rates-bonds core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · duration-estimate error (D<10) ${maxErrSmall.toFixed(3)} pp`);
