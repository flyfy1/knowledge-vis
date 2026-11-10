'use strict';
// Regression & correlation (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const both = (zh, en, key) => { ok(STRINGS.zh[key].includes(zh), `zh ${key} quotes ${zh}`); ok(STRINGS.en[key].includes(en), `en ${key} quotes ${en}`); };

// ---- step 0: r as the average rectangle ----
for (const p of ['ice', 'soup', 'pens']) {
  let prev = null;
  for (let s = 0; s <= 40; s += 5) {
    const d = M.shop(p, s), f = M.fit(d.x, d.y);
    assert.equal(d.x.length, 30); checks++;
    ok(d.x.every(v => v >= 18 && v <= 36), 'temperatures within 18–36 °C');
    if (p === 'pens' && s === 0) { ok(Number.isNaN(f.r), 'constant sales: r undefined'); continue; }
    const rp = M.rFromProducts(d.x, d.y);
    near(rp.r, f.r, 1e-12, 'rectangle average = r'); near((rp.pos + rp.neg) / 30, f.r, 1e-12, 'r = (pos + neg) / n');
    ok(f.r >= -1 - 1e-12 && f.r <= 1 + 1e-12, 'r within [−1, 1]');
    near(M.fit(d.x.map(M.toF), d.y).r, f.r, 1e-12, 'r unchanged by °C → °F');
    if (s === 0 && p === 'ice') near(f.r, 1, 1e-12, 'no wobble: r = 1');
    if (s === 0 && p === 'soup') near(f.r, -1, 1e-12, 'no wobble: r = −1');
    if (p === 'pens') ok(f.r.toFixed(2) === '-0.21', 'stationery r = −0.21 for any wobble');
    if (prev !== null && p !== 'pens') ok(Math.abs(f.r) < Math.abs(prev), `|r| falls as wobble grows (${p}, ${s})`);
    if (p === 'ice' && s > 0) ok(rp.nNeg > 0, 'some red rectangles once there is wobble');
    if (p === 'soup') ok(f.r < 0, 'hot soup: r negative');
    prev = f.r;
  }
}
both('r = −0.21', 'r = −0.21', 's0hint');

// ---- step 1: least squares ----
const D = M.fixedShop(), F = M.fit(D.x, D.y);
ok(F.r.toFixed(2) === '0.75', 'fixed data r ≈ 0.75'); both('r ≈ 0.75', 'r ≈ 0.75', 's1e');
near(F.b, F.r * F.sy / F.sx, 1e-12, 'b = r·s_y/s_x'); near(F.a, F.my - F.b * F.mx, 1e-12, 'a = ȳ − b·x̄');
const sseAt = (b, d) => M.sseLine(D.x, D.y, F.my + d - b * F.mx, b);
near(sseAt(F.b, 0), F.sse, 1e-6, 'fit SSE');
for (let b = 0; b <= 9.0001; b += 0.1) for (let d = -30; d <= 30; d += 2) {
  near(sseAt(b, d), sseAt(b, 0) + 30 * d * d, 1e-6 * sseAt(b, d), `SSE(b,d) = SSE(b,0) + 30·d² at b=${b.toFixed(1)}, d=${d}`);
  ok(sseAt(b, d) >= F.sse - 1e-9, 'nothing beats least squares');
}
for (const db of [-1, -0.1, 0.1, 1]) ok(sseAt(F.b + db, 0) > F.sse, 'perturbing the slope raises SSE');
ok(Math.round(F.b * 10) / 10 >= 0 && Math.round(F.b * 10) / 10 <= 9, 'best-slope button lands on the slider');
both('30 × d²', '30 × d²', 's1hint');

// ---- step 2: prediction ----
const inBand = D.x.filter((x, i) => Math.abs(D.y[i] - (F.a + F.b * x)) <= F.rmse).length;
assert.equal(inBand, 17); checks++; both('17 天', '17 of the 30 days', 's2hint');
near(F.r2, F.r * F.r, 1e-12, 'R² = r²'); near(F.rmse, F.sy * Math.sqrt(1 - F.r * F.r), 1e-9, 'RMSE = s_y·√(1 − r²)');
ok(Math.min(...D.x) >= 18 && Math.max(...D.x) <= 33, 'data range inside 18–33 °C (extrapolation hint)');
{ const zx = D.x.map(x => (x - F.mx) / F.sx), zy = D.y.map(y => (y - F.my) / F.sy), fz = M.fit(zx, zy); near(fz.b, F.r, 1e-12, 'standardised slope = r'); near(fz.a, 0, 1e-12, 'standardised line through origin'); }
both('r ≈ 0.75', 'r ≈ 0.75', 's2hint');

// ---- step 3: shapes ----
const blocks = res => [0, 1, 2, 3, 4].map(j => M.mean(res.slice(j * 8, j * 8 + 8)));
{
  const L = M.shape('line'), fl = M.fit(L.x, L.y), rl = blocks(M.residuals(L));
  ok(fl.r > 0.9, 'line: strong r'); ok(rl.every(v => Math.abs(v) < 0.2 * fl.rmse), 'line: residuals without a pattern');
  const U = M.shape('ushape'), fu = M.fit(U.x, U.y), ru = blocks(M.residuals(U));
  ok(Math.abs(fu.r) < 0.015 && fu.r.toFixed(2) === '0.01', 'U: r ≈ 0.01'); ok(ru[0] > 0 && ru[4] > 0 && ru[2] < 0, 'U: residuals + − +');
  const S = M.shape('saturate'), fs_ = M.fit(S.x, S.y), rs = blocks(M.residuals(S));
  ok(fs_.r.toFixed(2) === '0.77', 'saturating: r ≈ 0.77'); ok(rs[0] < 0 && rs[4] < 0 && rs[2] > 0, 'saturating: residuals − + −');
  // U data really is a deterministic function of speed plus small noise: fuel spread far exceeds noise
  ok(M.sd(U.y) > 3 * 0.25, 'U: strong (curved) dependence');
}
both('r ≈ 0.01', 'r ≈ 0.01', 's3hint'); both('r ≈ 0.77', 'r ≈ 0.77', 's3hint');

// ---- step 4: influence ----
{
  const d = M.practice(50), full = M.fit(d.x, d.y), inf = M.influence(d);
  assert.equal(d.x.length, 16); checks++;
  ok(d.x.slice(0, 15).every(x => x >= 1 && x <= 8) && d.x[15] === 20, 'x layout');
  ok(inf.slice(0, 15).every(q => Math.abs(q.db) < 0.2), 'any of the first 15: slope change < 0.2');
  ok(full.b.toFixed(2) === '-0.11' && inf[15].b.toFixed(2) === '3.26', 'removing point 16: −0.11 → 3.26');
  const rest = M.fit(d.x.slice(0, 15), d.y.slice(0, 15)), pred = rest.a + rest.b * 20;
  ok(pred.toFixed(0) === '119', 'other 15 predict ≈ 119 at 20 h');
  both('约 119 分', 'about 119 points', 's4hint'); both('−0.11', '−0.11', 's4hint'); both('3.26', '3.26', 's4hint');
  near(Math.abs(M.influence(M.practice(pred))[15].db), 0, 1e-9, 'on-trend far point has zero influence');
  // the farther from that prediction, the larger the influence (slider 20..150)
  let last = null;
  for (let y = Math.ceil(pred); y <= 150; y++) { const v = Math.abs(M.influence(M.practice(y))[15].db); if (last !== null) ok(v > last, 'influence grows above the trend'); last = v; }
  last = null;
  for (let y = Math.floor(pred); y >= 20; y--) { const v = Math.abs(M.influence(M.practice(y))[15].db); if (last !== null) ok(v > last, 'influence grows below the trend'); last = v; }
}

// ---- step 5: confounding ----
{
  const P = M.pupils(), all = M.pupilsFit(P);
  assert.equal(P.length, 210); checks++;
  ok(all.r.toFixed(2) === '0.84', 'overall r ≈ 0.84');
  const rs = []; for (let a = 6; a <= 12; a++) { const g = P.filter(p => p.age === a); assert.equal(g.length, 30); checks++; rs.push(M.pupilsFit(g).r); }
  ok(Math.min(...rs).toFixed(2) === '-0.28' && Math.max(...rs).toFixed(2) === '0.43', 'within-age r −0.28 … 0.43');
  ok(M.mean(rs).toFixed(2) === '0.06', 'within-age mean ≈ 0.06');
  ok(P.every(p => p.foot > 13.5 && p.foot < 24.5 && p.read > 10 && p.read < 110), 'points inside the plotted axes');
}
both('r ≈ 0.84', 'r ≈ 0.84', 's5hint'); both('−0.28 到 0.43', '−0.28 to 0.43', 's5hint'); both('约 0.06', 'about 0.06', 's5hint');

// ---- step 6: regression to the mean ----
for (let i = 2; i <= 20; i++) { const rho = i / 20;
  const R = M.retest(rho), f = R.f;
  assert.equal(R.top.length, 50); checks++;
  near(f.r, rho, 0.06, `r ≈ ρ at ${rho.toFixed(2)}`); near(f.b, f.r * f.sy / f.sx, 1e-12, 'slope = r·s_y/s_x');
  near(R.all.t2 - R.all.t1, 0, 1.5, 'overall mean barely moves');
  if (rho < 0.999) { ok(R.topM.t2 < R.topM.t1, 'top 10% fall back'); ok(R.botM.t2 > R.botM.t1, 'bottom 10% rise'); ok(f.b < 1, 'regression line shallower than y = x'); }
  else { R.t1.forEach((v, i) => near(R.t2[i], v, 1e-9, 'ρ = 1: identical scores')); }
}
{ const R = M.retest(0.5); ok(Math.round(R.topM.t1) === 86 && Math.round(R.topM.t2) === 78, 'ρ = 0.5: ≈ 86 → ≈ 78'); }
both('约 86 分回落到约 78 分', 'from about 86 to about 78', 's6hint');

// ---- number formatting ----
const app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
const fmt = eval(app.match(/const fmt = ([^\n]+);\n/)[1]);
assert.equal(fmt(90, 0), '90'); assert.equal(fmt(10, 1), '10'); assert.equal(fmt(0.5, 2), '0.5'); assert.equal(fmt(-30, 0), '-30'); checks += 4;

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['axSSE', 'axTempC', 'axTempF']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) { ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model'); ok(!/左图|右图|left chart|right chart|left-hand|right-hand/i.test(Object.values(STRINGS[l]).join('')), 'no left/right chart references'); }

// ---- keys, controls, links ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['prodIce', 'prodSoup', 'prodPens', 'n0', 'unit0', 'b1', 'd1', 'best1', 'clear1', 'x2', 'std2', 'shapeLine', 'shapeU', 'shapeSat', 'k4', 'f4', 'a5', 'p6']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css') && !html.includes('canvas-label-guard'), 'provenance placeholder, css, no label guard');
ok(html.includes('name="stage" content="senior"'), 'stage senior');
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../probability/statistics/regression-correlation/index.html')), 'comparison link target exists');
for (let i = 0; i <= 7; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS regression-correlation core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · fixed r ${F.r.toFixed(3)}`);
