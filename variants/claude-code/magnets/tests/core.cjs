'use strict';
// Magnets (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b}`);

// ---- the field model: inverse-square poles, N = +1 and S = −1 per face ----
{
  const P = M.poles({ x: 0, y: 0, ang: 0, len: 6 });
  near(P.filter(p => p.q > 0).reduce((a, p) => a + p.q, 0), 1, 1e-12, 'N face carries +1');
  near(P.filter(p => p.q < 0).reduce((a, p) => a + p.q, 0), -1, 1e-12, 'S face carries −1');
  // far away a single face looks like a point pole: B ≈ 1/r² (the S face is 6 cm further and partly cancels, so use a lone N face)
  const N = P.filter(p => p.q > 0);
  for (const r of [20, 40]) near(M.field(N, 3 + r, 0).b * r * r, 1, 0.01, 'inverse square at r = ' + r);
  // field outside points away from N and into S on the axis
  ok(M.field(M.allPoles(M.ONE), 5, 0).bx > 0 && M.field(M.allPoles(M.ONE), -5, 0).bx > 0, 'axis field runs from N (right) round to S (left)');
  // above the middle of the magnet the field runs from the N end towards the S end (−x)
  ok(M.field(M.allPoles(M.ONE), 0, 2).bx < 0, 'above the magnet the field points N → S');
}

// ---- step 0: what sticks ----
{
  const all = M.itemStats(M.ITEMS.map(it => it.id));
  ok(all.total === 9 && all.metals === 6 && all.stuck === 3 && all.metalsNotStuck === 3 && all.nonMetalStuck === 0, 'nine objects, six metals, three held, three metals not held');
  const st = M.itemStats(['nail', 'clip']); ok(st.metals === 2 && st.metalsNotStuck === 0, 'iron and steel alone: verdict "all metals stuck so far"');
  for (const id of ['nail', 'clip', 'nickel']) ok(M.ITEMS.find(i => i.id === id).magnetic, id + ' is magnetic');
  for (const id of ['foil', 'copper', 'gold', 'ruler', 'wood', 'glass']) ok(!M.ITEMS.find(i => i.id === id).magnetic, id + ' is not magnetic');
  for (const l of ['zh', 'en']) for (const it of M.ITEMS) ok(STRINGS[l]['item_' + it.id], 'item name ' + it.id);
}

// ---- step 1: the pull is strongest at the ends ----
{
  near(M.pullPct(3), 100, 1e-9, 'strongest pull at the N end'); near(M.pullPct(-3), 100, 1e-9, 'and at the S end');
  for (let x = 0; x <= 3; x += 0.25) near(M.pullPct(x), M.pullPct(-x), 1e-6, 'symmetric at ' + x);
  for (let x = 0.25; x <= 3; x += 0.25) ok(M.pullPct(x) > M.pullPct(x - 0.25), 'pull rises towards the end at ' + x);
  ok(M.pullPct(0) < 1, 'middle pull under 1 % of the ends (s1readout, s6fin "almost nothing")');
  ok(M.clips(3) === 8 && M.clips(0) === 0 && M.clips(-3) === 8, 'clip chain: 8 at the ends, 0 in the middle');
  for (let x = -3; x <= 3; x += 0.25) ok(M.clips(x) === Math.min(8, Math.floor(M.pullPct(x) / M.CLIP_PCT + 1e-9)), 'clips = pull / 12');
  for (const l of ['zh', 'en']) ok(STRINGS[l].s1hint.includes('12'), 's1hint states the 12-point scale');
}

// ---- step 2: two magnets ----
{
  near(M.forcePct(1, 'S'), -100, 1e-9, 'unlike poles at 1 cm = −100 (pull)');
  for (let g = 1; g <= 8; g += 0.5) {
    near(M.forcePct(g, 'N'), -M.forcePct(g, 'S'), 1e-9, 'like and unlike: same size, opposite sign at ' + g);
    ok(M.forcePct(g, 'N') > 0 && M.forcePct(g, 'S') < 0, 'like pushes, unlike pulls at ' + g);
    if (g > 1) ok(Math.abs(M.forcePct(g, 'S')) < Math.abs(M.forcePct(g - 0.5, 'S')), 'force falls with distance at ' + g);
    if (2 * g <= 8) ok(M.pairForce(2 * g, 'S') / M.pairForce(g, 'S') < 1 / 3, 'doubling the gap leaves under a third at ' + g);
  }
  // Newton's third law: the force on the left magnet is equal and opposite (sum over the same pole pairs)
  for (const g of [1, 3, 6]) {
    const [A, B] = M.pair(g, 'S').map(M.poles); let fA = 0, fB = 0;
    for (const p of B) for (const q of A) { const dx = p.x - q.x, dy = p.y - q.y, r = Math.hypot(dx, dy); fB += p.q * q.q * dx / r ** 3; fA -= p.q * q.q * dx / r ** 3; }
    near(fA + fB, 0, 1e-12, 'equal and opposite at ' + g);
  }
  near(100 * M.FRICTION / M.F_REF, 5, 1e-12, 'friction = 5 % of the 1 cm pull (s2hint)');
  for (let g = 1; g <= 8; g += 0.5) for (const fc of ['S', 'N']) {
    const R = M.release(g, fc), weak = Math.abs(M.pairForce(g, fc)) <= M.FRICTION;
    ok(R.moved === !weak, `release moves iff force > friction (g=${g}, ${fc})`);
    if (!weak && fc === 'S') ok(R.snapped, 'unlike poles snap together from ' + g);
    if (!weak && fc === 'N') { ok(!R.snapped && R.end > g, 'like poles are pushed further away from ' + g); ok(R.stopped || Math.abs(M.pairForce(R.end, fc)) <= M.FRICTION + 1e-9, 'stops where friction wins or at the track end'); }
    if (R.moved) for (let i = 1; i < R.path.length; i++) ok(fc === 'S' ? R.path[i].g <= R.path[i - 1].g + 1e-12 : R.path[i].g >= R.path[i - 1].g - 1e-12, 'slides one way only');
  }
  ok(!M.release(4.5, 'S').moved && M.release(4, 'S').snapped, 'the magnets stop pulling each other across the table between 4 and 4.5 cm');
}

// ---- step 3: field lines and filings ----
{
  const boxes = [{ x0: -11, x1: 11, y0: -6, y1: 6 }, { x0: -8.5, x1: 8.5, y0: -8, y1: 8 }, { x0: -12, x1: 12, y0: -5.3, y1: 5.3 }];
  for (const box of boxes) {
    const like = M.traceLines(M.LAYOUTS.like(), box), unlike = M.traceLines(M.LAYOUTS.unlike(), box), one = M.traceLines(M.LAYOUTS.single(), box);
    ok(like.every(l => !(l.end === 'mag' && l.hit !== l.from)), 'like poles: no line joins one magnet to the other (note3)');
    ok(unlike.filter(l => l.from === 0 && l.end === 'mag' && l.hit === 1).length >= 3, 'unlike poles: lines from the left N face run into the right magnet (note2)');
    ok(one.filter(l => l.end === 'mag').length >= 6, 'one magnet: lines loop back into the magnet (note1)');
    // every line point runs along the field (a field line is tangent to B)
    for (const l of unlike.slice(0, 4)) for (let i = 2; i < l.pts.length - 1; i += 7) {
      const f = M.field(M.allPoles(M.LAYOUTS.unlike()), l.pts[i][0], l.pts[i][1]), dx = l.pts[i + 1][0] - l.pts[i][0], dy = l.pts[i + 1][1] - l.pts[i][1];
      ok((f.bx * dx + f.by * dy) / (f.b * Math.hypot(dx, dy)) > 0.99, 'line follows the field');
    }
  }
  near(M.field(M.allPoles(M.LAYOUTS.like()), 0, 0).b, 0, 1e-12, 'like poles: the field at the exact middle is zero (note3)');
  // filings crowd where the field is strong: more filings near the poles than in an equal area far away
  const box = { x0: -11, x1: 11, y0: -6, y1: 6 }, fil = M.filings(M.LAYOUTS.single(), box, 1400, 11);
  ok(fil.length === 1400, 'all filings placed');
  const nearP = fil.filter(f => Math.hypot(Math.abs(f.x) - 3, f.y) < 2).length, far = fil.filter(f => Math.hypot(f.x, f.y - 5) < 2 || Math.hypot(f.x, f.y + 5) < 2).length / 2;
  ok(nearP > 2 * far, `filings crowd near the poles (${nearP} vs ${far})`);
  fil.forEach(f => { const g = M.field(M.allPoles(M.LAYOUTS.single()), f.x, f.y); ok(Math.abs(Math.atan2(g.by, g.bx) - f.ang) < 1e-12, 'tapped filing lies along the field'); });
}

// ---- step 4: compass ----
{
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * 2 * Math.PI, x = 5.2 * Math.cos(a), y = 2.9 * Math.sin(a), c = M.compass(x, y, false), f = M.field(M.allPoles(M.ONE), x, y);
    near(c.ang, Math.atan2(f.by, f.bx), 1e-12, 'needle follows the field');
  }
  near(M.bearing(Math.PI / 2), 0, 1e-12, 'up = 0°'); near(M.bearing(0), 90, 1e-12, 'right = 90°'); near(M.bearing(-Math.PI / 2), 180, 1e-12, 'down = 180°');
  ok(M.compass8(0) === 0 && M.compass8(90) === 2 && M.compass8(180) === 4 && M.compass8(270) === 6 && M.compass8(359) === 0, '8-way direction words');
  ok(M.EARTH > 0, "Earth's field points up (north)");
  // with the Earth's field on, once the compass is 6 cm out, moving further away turns the needle towards north
  // wherever the magnet was turning it away (deviation > 30° at 6 cm); in the far corners it is within 35° of north
  for (let i = 0; i < 24; i++) {
    const dx = Math.cos(i / 24 * 2 * Math.PI), dy = Math.sin(i / 24 * 2 * Math.PI);
    const dev = r => { const c = M.compass(r * dx, r * dy, true); return Math.abs(((M.bearing(c.ang) + 180) % 360) - 180); };
    if (dev(6) <= 30) continue;
    let prev = dev(6);
    for (let r = 6.5; Math.abs(r * dx) <= 11 && Math.abs(r * dy) <= 6.5; r += 0.5) { const d = dev(r); ok(d < prev + 1e-9, `needle turns towards north going out at ${i * 15}°`); prev = d; }
  }
  for (const [x, y] of [[11, 6.5], [-11, 6.5], [11, -6.5], [-11, -6.5]]) { const c = M.compass(x, y, true); ok(Math.abs(((M.bearing(c.ang) + 180) % 360) - 180) < 35, 'corner needle near north'); }
  ok(M.compass(0, 1.6, true).ratio > 3 && M.compass(11, 6.5, true).ratio < 1, 'near the magnet it rules, in the corner the Earth is comparable or stronger');
}

// ---- step 5: breaking ----
for (let n = 1; n <= 4; n++) {
  const pc = M.poleCount(n); ok(pc.N === n && pc.S === n, 'N = S = number of pieces: ' + n);
  const A = M.allPoles(M.pieces(n, 0)), B = M.allPoles(M.ONE); let d = 0;
  for (let x = -8; x <= 8; x += 0.5) for (const y of [1.2, 2, 3.5]) { const a = M.field(A, x, y), b = M.field(B, x, y); d = Math.max(d, Math.hypot(a.bx - b.bx, a.by - b.by) / b.b); }
  ok(d < 1e-9, 'pressed together = the whole magnet, n = ' + n);
  if (n > 1) { const C = M.allPoles(M.pieces(n, 1)); ok(Math.abs(M.field(C, 0, 0).bx) > 0.01 || n % 2 === 0, 'a gap shows a field between pieces'); }
}

// ---- step 6: hidden magnet quiz ----
for (let k = 0; k < 60; k++) {
  const Q = M.quiz(k), Nx = Q.nRight ? 3 : -3, Sx = -Nx;
  for (const nd of Q.needles) {
    const ux = Math.cos(nd.ang), uy = Math.sin(nd.ang);
    const nearN = Math.hypot(nd.x - Nx, nd.y) < Math.hypot(nd.x - Sx, nd.y);
    if (nearN) ok(ux * (nd.x - Nx) + uy * nd.y > 0, 'near the N end the red tip points away from it (quizRight)');
    else ok(ux * (Sx - nd.x) + uy * (0 - nd.y) > 0, 'near the S end the red tip points towards it');
  }
  ok(Q.needles.some(nd => Math.hypot(nd.x - Nx, nd.y) < Math.hypot(nd.x - Sx, nd.y)) && Q.needles.some(nd => Math.hypot(nd.x - Nx, nd.y) > Math.hypot(nd.x - Sx, nd.y)), 'one compass at each end');
}
{ const seen = new Set(); for (let k = 0; k < 20; k++) seen.add(M.quiz(k).nRight); ok(seen.size === 2, 'both answers occur'); }

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
// panels are named by title or by their fixed place inside one canvas, never as side-by-side charts
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/左图|右图|left chart|right chart|left panel|right panel/i.test(v), `no left/right chart wording in ${l}.${k}`);
// integer formatting keeps its zeros (toFixed(0) of 90 stays 90)
{ const app0 = fs.readFileSync(path.join(dir, 'app.js'), 'utf8'), m = app0.match(/const fmt = [^\n]+/)[0]; const fmt = eval(m.replace('const fmt = ', '(').replace(/;\s*$/, '') + ')'); ok(fmt(90, 0) === '90' && fmt(100, 1) === '100' && fmt(28.70, 1) === '28.7' && fmt(0.004, 1) === '0', 'fmt keeps integer zeros'); }
for (const l of ['zh', 'en']) ok(/(磁铁 · 铁屑显出看不见的线|Magnets · Iron Filings Reveal Unseen Lines)/.test(STRINGS[l].compare) && /(磁铁 · 铁屑显出看不见的线|Magnets · Iron Filings Reveal Unseen Lines)/.test(STRINGS[l].foot), 'original title named');

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'\s*[,)]/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (let i = 0; i < 8; i++) ok(STRINGS.zh['dir' + i] && STRINGS.en['dir' + i], 'direction word ' + i);
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('../../../page-provenance.css') && html.includes('<!-- page-provenance -->'), 'provenance stylesheet and placeholder');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../physics/electromagnetism/magnets/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS magnets core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · middle pull ${M.pullPct(0).toFixed(2)}% of the ends`);
