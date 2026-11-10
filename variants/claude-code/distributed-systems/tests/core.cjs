'use strict';
// Replication (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b}`);

// ---- step 0: writes only change reached replicas; stale share ----
{
  let reps = M.cluster0(); ok(reps.every(r => r.v === 1 && r.val === 100), 'start v1 = 100');
  for (let mask = 0; mask < 32; mask++) {
    const reach = [0, 1, 2, 3, 4].map(i => !!(mask >> i & 1)), r = M.write0(M.cluster0(), reach, 0);
    ok(r.v === 2 && r.val === 120, 'first write is v2 = 120');
    r.reps.forEach((x, i) => ok(reach[i] ? x.v === 2 && x.val === 120 : x.v === 1 && x.val === 100, 'only reached replicas change'));
    const fresh = reach.filter(Boolean).length;
    if (fresh > 0) near(M.staleShare(r.reps), (5 - fresh) / 5, 1e-12, 'stale share = unreached / 5');
  }
  const d = M.write0(M.cluster0(), [true, true, false, false, false], 0); ok(M.staleShare(d.reps) === 0.6, 'default: 3/5 stale');
}

// ---- step 1: stale probability vs brute-force enumeration of read sets ----
function subsets(n, k) { const out = []; (function rec(s, a) { if (a.length === k) { out.push(a.slice()); return; } for (let i = s; i < n; i++) { a.push(i); rec(i + 1, a); a.pop(); } })(0, []); return out; }
for (let N = 3; N <= 9; N++) for (let W = 1; W <= N; W++) for (let R = 1; R <= N; R++) {
  const all = subsets(N, R), miss = all.filter(s => s.every(i => i >= W)).length; // write set = first W
  near(M.staleProb(N, W, R), miss / all.length, 1e-12, `stale prob N${N} W${W} R${R}`);
  ok((M.staleProb(N, W, R) === 0) === (W + R > N), 'zero exactly when W + R > N');
  if (W + R > N) ok(Math.min(...all.map(s => s.filter(i => i < W).length)) === W + R - N, 'minimum overlap = W + R − N');
}
ok(M.staleProb(5, 2, 2) === 0.3 && M.choose(3, 2) === 3 && M.choose(5, 2) === 10, 'default 3/10 = 30%');
near(M.staleProb(9, 1, 1), 8 / 9, 1e-12, 'heatmap max 89%');

// ---- step 2: simulation converges to the formula ----
for (let N = 3; N <= 9; N++) for (let W = 1; W <= N; W++) for (let R = 1; R <= N; R++) {
  const th = M.staleProb(N, W, R), log = M.simulate(N, W, R, 200, 1);
  log.forEach(e => {
    ok(e.ws.length === W && e.rs.length === R && new Set(e.rs).size === R, 'set sizes');
    ok(e.stale === !e.rs.some(i => e.ws.includes(i)), 'stale iff the read set misses the write set');
    ok(e.vers.filter(v => v === e.latest).length === W, 'newest version on exactly W replicas');
  });
  if (th === 0) ok(log.every(e => !e.stale), 'W + R > N: never stale');
  // long run: 20 000 pairs within 4 standard errors
  const big = M.simulate(N, W, R, 20000, 7), rate = big[big.length - 1].rate, se = Math.sqrt(th * (1 - th) / 20000);
  near(rate, th, 4 * se + 1e-9, `long-run rate N${N} W${W} R${R}`);
}
{ const r = M.simulate(5, 2, 2, 200, 1); near(r[r.length - 1].rate, 0.3, 0.07, 'default 200-pair run lands near 30%'); }

// ---- step 3: availability = brute force; trade-off; majority is best ----
for (let N = 3; N <= 9; N++) for (let pc = 1; pc <= 30; pc++) {
  const p = pc / 100; let best = -1, bestW = [];
  for (let W = 1; W <= N; W++) {
    const a = M.availability(N, W, p), b = N <= 9 ? M.availabilityBrute(N, W, p) : null;
    ok(a.R === N - W + 1, 'R = N − W + 1'); near(a.write, b.write, 1e-12, 'write availability'); near(a.read, b.read, 1e-12, 'read availability');
    if (W > 1) { const prev = M.availability(N, W - 1, p); ok(a.write < prev.write && a.read > prev.read, 'write falls, read rises with W'); }
    const m = Math.min(a.write, a.read); if (m > best + 1e-12) { best = m; bestW = [W]; } else if (Math.abs(m - best) <= 1e-12) bestW.push(W);
  }
  const exp = N % 2 ? [(N + 1) / 2] : [N / 2, N / 2 + 1];
  assert.deepEqual(bestW, exp, `majority best N${N} p${pc}`); checks++;
}
{ const a = M.availability(5, 3, 0.1); near(a.write, 0.99144, 5e-6, 'default 99.144%'); near((1 - a.write) * 8760, 74.95, 0.1, 'about 75 hours a year'); }

// ---- step 4: partitions ----
for (let k = 1; k <= 4; k++) {
  const cp = M.partition(k, 'cp'), ap = M.partition(k, 'ap');
  ok(cp.stages.length === 5 && cp.stages.map(s => s.stage).join() === M.STAGES.join(), 'five stages');
  // CP: exactly one side (the one with ≥ 3) works; no accepted write is lost; reads never disagree
  ok(cp.wl === (k >= 3) && cp.wr === (5 - k >= 3) && cp.wl !== cp.wr, 'CP: exactly one side accepts');
  ok(cp.lost.length === 0 && cp.consistentReads, 'CP: nothing lost, reads agree');
  ok((cp.rl === null) === (k < 3) && (cp.rr === null) === (5 - k < 3), 'CP: minority refuses reads');
  ok(cp.final === (k >= 3 ? 200 : 50), 'CP final value from the majority');
  // AP: both sides accept, reads disagree, healing keeps the later write and loses the other
  ok(ap.wl && ap.wr && ap.rl === 200 && ap.rr === 50 && !ap.consistentReads, 'AP: both accept, reads differ');
  ok(ap.final === 50 && ap.lost.length === 1 && ap.lost[0] === 200, 'AP: last writer wins, 200 lost');
  ok(ap.stages[4].reps.every(r => r.val === ap.final) && cp.stages[4].reps.every(r => r.val === cp.final), 'healed replicas agree');
}

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const k of zk) ok(!/左图|右图|left (chart|panel|plot)|right (chart|panel|plot)/i.test(STRINGS[l][k]), 'no left/right figure references: ' + k);

// ---- keys, controls, links ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const k of ['st_writeL_ok', 'st_writeL_no', 'st_writeR_ok', 'st_writeR_no', 'st_heal_cp', 'st_heal_ap', 'reachOn', 'reachOff', 'tagNew', 'tagOld']) ok(STRINGS.zh[k] && STRINGS.en[k], 'dynamic key ' + k);
for (const id of ['write0', 'read0', 'reset0', 'reach0', 'n1', 'w1', 'r1s', 'n2', 'w2', 'r2s', 'play2', 'reroll2', 'reset2', 'n3', 'w3', 'p3', 'k4', 'cp4', 'ap4', 'next4', 'play4', 'reset4']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css') && !html.includes('canvas-label-guard'), 'provenance placeholder, no guard');
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../computing/systems/distributed-systems/index.html')), 'comparison link target exists');
for (let i = 0; i <= 5; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS distributed-systems core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
