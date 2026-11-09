'use strict';
// ODE phase portraits (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const both = (key, s) => { for (const l of ['zh', 'en']) ok(STRINGS[l][key].includes(s), `${l}.${key} quotes ${s}`); };

// ---- model basics: equilibrium (4, 2), nullclines, terms ----
const E = M.eq(); near(E.x, 4, 0, 'x* = c/d = 4'); near(E.y, 2, 0, 'y* = a/b = 2');
{ const [u, v] = M.rates(4, 2); near(u, 0, 1e-15, 'x′ = 0 at eq'); near(v, 0, 1e-15, 'y′ = 0 at eq'); }
for (let x = 0.5; x <= 10; x += 0.25) for (let y = 0.25; y <= 5; y += 0.25) {
  const [u, v] = M.rates(x, y), q = M.terms(x, y);
  near(q.birth - q.eaten, u, 1e-12, 'x′ = birth − eaten'); near(q.gain - q.die, v, 1e-12, 'y′ = gain − die');
  ok(Math.sign(u) === Math.sign(2 - y) || Math.abs(u) < 1e-12, 'rabbits fall above y = 2, rise below');
  ok(Math.sign(v) === Math.sign(x - 4) || Math.abs(v) < 1e-12, 'foxes rise right of x = 4, fall left');
}
// step 0 default (6, 1): x′ = 6 − 3 = 3, y′ = −1 + 1.5 = 0.5 ; step 0 hint thresholds y > 2, x > 4
{ const q = M.terms(6, 1); near(q.dx, 3, 1e-12, 'default x′'); near(q.dy, 0.5, 1e-12, 'default y′'); }
// quiz: (6, 3) → rabbits fall, foxes rise (option b)
{ const [u, v] = M.rates(6, 3); ok(u < 0 && v > 0, 'quiz answer b'); }
// region glyph order: anticlockwise RU→LU→LD→RD (upper-right heads left-up, etc.)
{ const s = (x, y) => M.rates(x, y).map(Math.sign).join(); ok(s(7, 4) === '-1,1' && s(2, 4) === '-1,-1' && s(2, 1) === '1,-1' && s(7, 1) === '1,1', 'four region signs'); }

// ---- step 1/2: every slider start ----
for (let x0 = 1; x0 <= 8; x0 += 0.5) for (let y0 = 0.5; y0 <= 5; y0 += 0.5) {
  if (x0 === 4 && y0 === 2) {
    const r = M.integrate(4, 2, { T: 30 }); ok(r.x.every(v => Math.abs(v - 4) < 1e-12) && r.y.every(v => Math.abs(v - 2) < 1e-12), 'equilibrium start stays put (s1eq)');
    continue;
  }
  const S = M.story(x0, y0);
  ok(S.lag > 0 && S.lag < S.period / 2, `fox peak after rabbit peak, within half a period (${x0},${y0})`);
  ok(S.period > 6.28 && S.period < 9, 'period range');
  ok(S.tRabbit < 30 && S.tFox < 30, 'both peaks inside the 30-yr window');
  // closes: back to the start after one period (s2readout gap)
  const r = S.run;
  ok(M.returnGap(x0, y0) < 0.01, `returns within 0.01 after one period (${x0},${y0})`);
  // axis room: phase plot uses niceCeil(max × 1.08) — values stay positive
  ok(S.xMin > 0 && S.yMin > 0, 'counts stay positive');
  // anticlockwise: at the rabbit peak foxes are rising, at the fox peak rabbits are falling (s2hint)
  const iR = Math.round(S.tRabbit / r.dt), iF = Math.round(S.tFox / r.dt);
  ok(M.rates(r.x[iR], r.y[iR])[1] > 0 && M.rates(r.x[iF], r.y[iF])[0] < 0, 'anticlockwise turn');
}
// smaller starting foxes → bigger swings and longer repeat (s1hint)
{ const a = M.story(2, 2), b = M.story(2, 0.5); ok(b.xMax > a.xMax && b.period > a.period, 'lower y₀ → bigger, slower'); }

// ---- step 4: conserved H, nested loops, period growth, 2π limit ----
let prevPer = 0;
for (let k = 19; k >= 2; k--) {
  const y0 = k / 10, per = M.period(4, y0), r = M.integrate(4, y0, { dt: 0.01, T: per });
  const hs = r.x.map((x, i) => M.H(x, r.y[i]));
  ok(Math.max(...hs) - Math.min(...hs) < 1e-7, 'H constant along RK4 loop y0=' + y0);
  ok(per > prevPer, 'period grows as y₀ falls'); prevPer = per;
  ok(M.H(4, y0) > M.H(4, 2), 'H above its equilibrium minimum');
  ok(Math.max(...r.x) < 16 && Math.max(...r.y) < 8, 'loop fits the 16 × 8 axes');
  ok(per < 8, 'period inside the 6–8 axis');
}
near(M.period(4, 1.9), 2 * Math.PI, 0.01, 'small-loop period ≈ 2π/√(ac)');
near(M.period(4, 1.999), 2 * Math.PI, 2e-4, 'limit 2π');
both('s4lgLim', '6.283');
// dH/dt = 0 analytically: gradient · field = 0 on a grid
for (let x = 0.5; x <= 10; x += 0.5) for (let y = 0.5; y <= 5; y += 0.5) {
  const [u, v] = M.rates(x, y), P = M.P; near((P.d - P.c / x) * u + (P.b - P.a / y) * v, 0, 1e-12, 'dH/dt = 0');
}

// ---- step 5: Euler always raises H (H convex); RK4 drift tiny; escape at Δt ≥ 0.2; halving ratios ----
for (const dt of M.DTS) {
  const e = M.drift('euler', dt);
  ok(e.hs.every((h, i) => i === 0 || h > e.hs[i - 1]), 'Euler H strictly increases every step, dt=' + dt);
  ok(e.escaped === (dt >= 0.2), 'Euler escapes exactly for Δt ≥ 0.2, dt=' + dt);
  const r = M.drift('rk4', dt); ok(!r.escaped && Math.abs(r.end) < 2e-4, 'RK4 drift < 2×10⁻⁴ dt=' + dt);
}
both('s5hint', '2×10⁻⁴'); both('s5hint', '0.2');
for (const dt of [0.005, 0.01, 0.02]) {
  const ratio = M.drift('euler', dt).end / M.drift('euler', dt / 2).end; ok(ratio > 2 && ratio < 2.4, 'Euler halving ratio ≈ 2: ' + ratio);
  const rr = M.drift('rk4', dt).end / M.drift('rk4', dt / 2).end; ok(rr > 18.5 && rr < 23, 'RK4 halving ratio 19–23: ' + rr);
}
both('s5hint', '1/19'); both('s5hint', '1/23');

// ---- step 6: crowding ----
near(M.K_SPIRAL, 2 + 2 * Math.SQRT2, 1e-12, 'node/spiral boundary'); both('s6hint', '4.83');
for (let k = 30; k <= 400; k++) {
  const K = k / 10, c = M.crowdRun(K), e = c.eq;
  if (K <= 4) ok(e.kind === 'extinct' && e.y === 0 && e.x === K, 'K ≤ 4: foxes die out');
  else if (K < M.K_SPIRAL) ok(e.kind === 'node' && e.l1.re < 0 && e.l2.re < 0, 'node for 4 < K < 4.83, K=' + K);
  else ok(e.kind === 'spiral' && e.l1.re < 0 && e.l1.im > 0, 'spiral for K > 4.83, K=' + K);
  if (K > 4) { near(e.y, 2 * (1 - 4 / K), 1e-12, 'y* = 2(1 − 4/K)'); const [u, v] = M.rates(e.x, e.y, M.P, K); near(u, 0, 1e-12, 'eq x′'); near(v, 0, 1e-12, 'eq y′'); }
  // V never increases along the run (sampled every 1 yr; tolerance for RK4 error)
  for (let i = 100; i < c.vs.length; i += 100) ok(c.vs[i] <= c.vs[i - 100] + 1e-9, 'V non-increasing K=' + K);
  ok(c.vRatio < 1, 'V shrinks K=' + K);
  ok(Math.max(...c.run.x) < 10 && Math.max(...c.run.y) < 5, 'crowded run fits 10 × 5 axes');
}
{ const c = M.crowdRun(Infinity); ok(c.eq.kind === 'center', 'K = ∞ is a centre'); near(c.vRatio, 1, 1e-6, 'K = ∞: V constant (= H − H*)'); ok(Math.max(...c.run.x) < 10 && Math.max(...c.run.y) < 5, 'K = ∞ run fits axes'); }

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['mRK4', 'Klabel', 'KlabelInf']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');

// ---- keys referenced in HTML/app exist; controls present ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const k of ['qRU', 'qLU', 'qLD', 'qRD', 'kSpiral', 'kNode', 'kCenter', 'kExtinct']) ok(STRINGS.zh[k] !== undefined, 'dynamic key ' + k);
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder');

// ---- deep links ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h); ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../math/calculus/ode-phase-portraits/index.html')), 'comparison link target exists');
for (let i = 0; i <= 7; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS ode-phase-portraits core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
