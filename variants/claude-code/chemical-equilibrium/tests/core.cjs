'use strict';
// Chemical equilibrium (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b}`);
const fmt = (v, d = 2) => { const s = v.toFixed(d); return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s; };

// ---- parameters quoted in the text ----
const p300 = M.probs(300);
near(p300.f, 0.02, 1e-15, 'pf = 2% at 300 K'); near(p300.r, 0.03, 1e-15, 'pr = 3% at 300 K');
ok(fmt(M.K()) === '0.67', 'K ≈ 0.67'); near(M.xEq(), 0.4, 1e-12, 'B share 40% → 80 of 200, A 120');
ok(M.EA.f === 30000 && M.EA.r === 20000 && M.dH === 10000 && M.CAT_DROP === 3500, 'barriers 30/20 kJ/mol, ΔH +10, catalyst −3.5');
for (const l of ['zh', 'en']) { const s = STRINGS[l]; ok(s.s3e.includes('30 kJ/mol') && s.s3e.includes('20 kJ/mol') && s.s3e.includes('+10 kJ/mol') && s.s4e.includes('3.5 kJ/mol') && s.s0e.includes('2%') && s.s0e.includes('3%') && s.s1e.includes('0.67'), 'quoted parameters ' + l); }
// probabilities stay valid on the whole slider range, with and without catalyst
for (let T = 260; T <= 340; T += 5) for (const cat of [false, true]) { const p = M.probs(T, cat); ok(p.f > 0 && p.r > 0 && p.f + p.r < 1, 'valid probabilities'); }

// ---- step 1: expected curve, settle time, rates equal at balance ----
const settle = M.settleTicks(p300); ok(settle === 59, 'settle 59 steps');
near(Math.abs(M.expectedB(200, 0, p300, settle) - 80), 0.05 * 80, 1e-9 + 0.05 * 80, 'gap ≤ 5% at settle');
ok(Math.abs(M.expectedB(200, 0, p300, settle - 1) - 80) > 0.05 * 80, 'gap > 5% one step earlier');
// expectation = mean of many seeded runs
for (const t of [10, 30, 60, 150]) { let s = 0; for (let seed = 1; seed <= 300; seed++) s += new M.Sim(200, 0, seed).run(p300, t).nB(); near(s / 300, M.expectedB(200, 0, p300, t), 1.2, 'expected B at t=' + t); }
// the page's runs: from all A (seed 202) and all B (seed 402) end at the same balance; measured rates match there
for (const [b0, seed] of [[0, 202], [200, 402]]) {
  const sim = new M.Sim(200, b0, seed).run(p300, 300);
  near(sim.meanB(100, 300), 80, 6, `mean B after settling from ${b0}`);
  let f = 0, r = 0; for (let i = 101; i <= 300; i++) { f += sim.hist.f[i]; r += sim.hist.r[i]; }
  ok(Math.abs(f - r) / ((f + r) / 2) < 0.1, `forward and reverse event counts within 10% after settling (from ${b0})`);
  ok(sim.total.f - sim.total.r === sim.nB() - b0, 'event ledger: forward − reverse = change in B');
}
// before balance the forward rate wins (from all A)
{ const sim = new M.Sim(200, 0, 202).run(p300, 20); ok(sim.total.f > 3 * sim.total.r, 'early: forward dominates'); }

// ---- step 0: at balance counts stay flat while both totals climb ----
{
  const sim = new M.Sim(200, 80, 101); let lo = 200, hi = 0;
  for (let i = 0; i < 600; i++) { sim.step(p300); lo = Math.min(lo, sim.nB()); hi = Math.max(hi, sim.nB()); }
  ok(lo >= 55 && hi <= 105, `B stays near 80 (${lo}–${hi})`);
  ok(sim.total.f > 1000 && sim.total.r > 1000 && Math.abs(sim.total.f - sim.total.r) <= 30, 'both totals climb at the same pace');
  ok(sim.parts.filter(p => p.flips > 0).length > 190, 'almost every particle has switched');
}

// ---- step 2: add 50 A at balance (Le Chatelier) ----
{
  const sim = new M.Sim(200, 80, 303).run(p300, 200); sim.inject(50, 0);
  ok(sim.N === 250 && sim.marks.length === 1, 'injected');
  const b = sim.nB(), a = sim.N - b; ok(b / a < M.K(), 'Q < K right after adding A');
  sim.run(p300, 400);
  const mb = sim.meanB(sim.t - 250, sim.t), ma = 250 - mb;
  near(mb, 100, 8, 'new balance B ≈ 100'); near(ma, 150, 8, 'new balance A ≈ 150');
  ok(ma > 120 + 15, 'A stays above its old level (reduced, not undone)');
  ok(Math.round(250 * 0.6) === 150 && Math.round(250 * 0.4) === 100, 'planned numbers 150 / 100; 20 of the 50 turn into B, A is 30 higher');
  const s2 = new M.Sim(200, 80, 303).run(p300, 200); s2.inject(50, 1); ok(s2.nB() / (s2.N - s2.nB()) > M.K(), 'Q > K after adding B');
}

// ---- step 3: temperature ----
let prev = 0;
for (let T = 260; T <= 340; T += 5) {
  const x = M.xEq(T); ok(x > prev, 'B share rises with T'); prev = x;
  near(x, M.K(T) / (1 + M.K(T)), 1e-12, 'share = K/(1+K)');
  const m = M.measureShare(T); near(m.share, x, 0.02, 'measured share within 2 points at ' + T);
}
ok(fmt(M.xEq(260) * 100, 1) === '26.5' && fmt(M.xEq(340) * 100, 1) === '51.7', 'share 26.5% at 260 K, 51.7% at 340 K');
{ const a = M.probs(300), b = M.probs(340); ok(b.f > a.f && b.r > a.r && b.f / a.f > b.r / a.r, 'heating raises both, forward more'); }

// ---- step 4: catalyst ----
for (let T = 260; T <= 340; T += 5) { const a = M.probs(T), b = M.probs(T, true); near(b.f / b.r, a.f / a.r, 1e-12, 'catalyst leaves K unchanged'); near(b.f / a.f, b.r / a.r, 1e-12, 'same factor both ways'); }
const fac = M.probs(300, true).f / p300.f; ok(fmt(fac, 1) === '4.1', 'catalyst factor ≈ 4.1 at 300 K');
const cr = M.catalystRun();
ok(cr.plain.settle === 59 && cr.cat.settle === 14, 'settle 59 vs 14'); ok(fmt(59 / 14, 1) === '4.2', 'about 4.2 times faster');
near(cr.plain.share, 0.4, 0.02, 'no catalyst ends at 40%'); near(cr.cat.share, 0.4, 0.02, 'catalyst ends at 40%'); near(cr.plain.share, cr.cat.share, 0.02, 'same endpoint');
for (const r of [cr.plain, cr.cat]) ok(Math.max(...r.sim.hist.b) <= 120, 'plot range 0–120 covers B');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/左图|右图|left chart|right chart|left panel|right panel/i.test(v), 'no left/right figure references: ' + k);

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'\s*[,)]/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['play0', 'ff0', 'track0', 'play1', 'fromA1', 'fromB1', 'play2', 'addA2', 'addB2', 'restart2', 'T3', 'play3', 'measure3', 'clear3', 'play4', 'restart4']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css') && !html.includes('canvas-label-guard'), 'provenance placeholder, no label guard');

// ---- deep links ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h); ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../chemistry/reactions/chemical-equilibrium/index.html')), 'comparison link target exists');
for (let i = 0; i <= 5; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS chemical-equilibrium core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · settle 59 vs 14 · catalyst shares ${cr.plain.share.toFixed(3)} / ${cr.cat.share.toFixed(3)}`);
