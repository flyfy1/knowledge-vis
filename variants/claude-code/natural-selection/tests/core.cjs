'use strict';
// Natural-selection (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const Z = STRINGS.zh, E = STRINGS.en;

// ---- step 0: survival ----
ok(M.TONE.light === 0.2 && M.TONE.dark === 0.85 && M.K0 === 0.6, 'tones and 0.6 as stated in s0e');
ok(Z.s0e.includes('0.6 × 色调差') && E.s0e.includes('0.6 × tone difference'), 'formula in text');
near(M.EQUAL_BARK, 0.525, 1e-12, 'equal-survival bark');
near(M.wL(M.EQUAL_BARK), M.wD(M.EQUAL_BARK), 1e-12, 'equal at 0.525');
ok(M.wL(0.15) > M.wD(0.15) && M.wD(0.85) > M.wL(0.85), 's0hint: lichen favours pale, soot favours black');
for (let b = 0; b <= 1.0001; b += 0.05) ok(M.wL(b) > 0 && M.wD(b) > 0 && M.wL(b) <= 1 && M.wD(b) <= 1, 'survival in (0,1]');
{ // hunting matches the model on average
  let al = 0, ad = 0, n = 0;
  for (let s = 1; s <= 400; s++) { const h = M.hunt(M.makeMoths(30, 11), 0.15, s); al += h.filter(m => m.kind === 'light' && m.alive).length; ad += h.filter(m => m.kind === 'dark' && m.alive).length; n += 30; }
  near(al / n, M.wL(0.15), 0.015, 'hunt light'); near(ad / n, M.wD(0.15), 0.015, 'hunt dark');
  ok(M.makeMoths(30, 11).filter(m => m.kind === 'dark').length === 30, '30 of each (s0hunted)');
}

// ---- step 1: three conditions ----
const all = { variation: true, heredity: true, selection: true };
const r1 = M.run(0.05, 0.85, all, 40);
ok(r1[40] > 0.9 && r1.every((v, i) => !i || v > r1[i - 1]), 'all on: climbs from 5%');
ok(M.run(0.05, 0.85, { ...all, variation: false }, 40).every(v => v === 0), 'no variation: flat at 0');
ok(M.run(0.05, 0.85, { ...all, heredity: false }, 40).every(v => v === 0.05), 'no heredity: flat at p0');
ok(M.run(0.05, 0.85, { ...all, selection: false }, 40).every(v => Math.abs(v - 0.05) < 1e-15), 'no selection: flat');
const down = M.run(0.5, 0.25, all, 40); ok(down[40] < down[0], 's1hint: bark below 0.3 → down');
for (let b = 0.3; b <= 1.0001; b += 0.05) { const r = M.run(0.2, b, all, 1); ok((r[1] > r[0]) === (b > M.EQUAL_BARK), 'direction set by bark ' + b.toFixed(2)); }
// near-equal message threshold covers only barks next to 0.525
ok(Math.abs(M.wD(0.5) - M.wL(0.5)) < 0.035 && Math.abs(M.wD(0.55) - M.wL(0.55)) < 0.035 && Math.abs(M.wD(0.6) - M.wL(0.6)) > 0.035, 'equal message band');

// ---- step 2: how fast ----
near(M.logit(0.99) - M.logit(0.01), 9.19, 0.005, '9.19 total');
near(M.logit(0.01), -4.6, 0.01, '−4.6');
for (let b = 0.6; b <= 1.0001; b += 0.05) {
  const r = M.advantage(b), seq = [0.01];
  for (let g = 0; g < 200; g++) seq.push(M.nextP(seq[g], b, all, 0.01));
  seq.slice(1).forEach((p, g) => { if (p < 0.9999) near(M.logit(p) - M.logit(seq[g]), Math.log(r), 1e-9, 'log-odds rise by ln r'); });
  const G = M.gensBetween(0.01, 0.99, r), first = seq.findIndex(p => p >= 0.99);
  ok(first === Math.ceil(G - 1e-9), `generations to 99% at bark ${b.toFixed(2)}: ${first} vs ${G}`);
  ok(G <= 100, 'fits the 100-generation axis');
}
ok(M.gensBetween(0.01, 0.99, M.advantage(0.6)) > 80 && M.gensBetween(0.01, 0.99, M.advantage(1)) < 20, 's2hint: from 80+ to the teens');
near(M.rNeeded(0.01, 0.98, 1895 - 1848), 1.198, 0.001, 'history r ≈ 1.20');
ok(Math.round(100 * (M.rNeeded(0.01, 0.98, 47) - 1)) === 20, 'about 20% more');

// ---- step 3: soot and clean air ----
near(M.barkAt(1800), 0.15, 1e-12, 'pale 1800'); near(M.barkAt(1920), 0.85, 1e-12, 'dark 1920'); near(M.barkAt(2010), 0.15, 1e-12, 'pale again 2010');
const c6 = M.crossings(0.6);
ok(c6.barkUp < c6.pUp && c6.barkDown < c6.pDown, 'population lags the bark both ways');
ok(c6.barkDown >= 1956, 'bark turns back after 1956');
const c2 = M.crossings(0.2);
ok(c2.pUp - c2.barkUp > c6.pUp - c6.barkUp && c2.pDown === null, 's3hint: weaker predation → longer lag (no fall below half by 2020 at 0.2)');
for (let K = 0.3; K <= 1.0001; K += 0.1) { const c = M.crossings(K); ok(c.pUp && c.pDown && c.pUp > c.barkUp && c.pDown > c.barkDown, 'both crossings at K=' + K.toFixed(1)); }
ok(M.history(0.6).every(q => q.p > 0 && q.p < 1), 'mutation keeps both colours present');

// ---- step 4: drift ----
near(M.fixProb(100, 0, 0.1), 0.1, 1e-12, 's = 0 → p0');
ok(M.fixProb(1000, 0.02, 0.1) > 0.97, 's4hint: N·s = 20 → nearly always fixed');
ok(M.fixProb(10, 0.02, 0.1) < 0.13, 's4hint: N·s = 0.2 → like neutral');
for (const [N, s, tol] of [[100, 0.02, 0.025], [300, 0.01, 0.025], [100, 0, 0.02], [1000, 0.005, 0.025], [30, 0.05, 0.03]]) {
  const B = M.wfBatch(N, s, 0.1, 3000, N * 7 + Math.round(s * 1e4)), dec = B.filter(b => b.fate !== 'open');
  near(dec.filter(b => b.fate === 'fixed').length / dec.length, M.fixProb(N, s, 0.1), tol, `WF vs formula N=${N} s=${s}`);
}
ok(M.N_STEPS.join() === '10,30,100,300,1000', 'N steps');

// ---- bilingual parity ----
const zk = Object.keys(Z).sort(), ek = Object.keys(E).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(Z[k]), ph(E[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(Z[k] !== E[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) ok(!/左图|右图|left (chart|panel|picture)|right (chart|panel|picture)/i.test(v), 'no left/right figure references');

// ---- keys, controls, links ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) { ok(Z[m[1]] !== undefined, 'missing key ' + m[1]); ok(!/\{[a-zA-Z0-9]+\}/.test(Z[m[1]]), 'static key without placeholders ' + m[1]); }
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'[,)]/g)) ok(Z[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['b0', 'hunt0', 'reset0', 'condVar', 'condHer', 'condSel', 'p1', 'b1', 'play1', 'b2', 'y3', 'k3', 'play3', 'n4', 's4', 'run4', 'clear4', 'checkQuiz']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../biology/ecology/natural-selection/index.html')), 'comparison link target exists');
for (let i = 0; i <= 5; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS natural-selection core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · lag K=0.6 ${c6.pUp - c6.barkUp}/${c6.pDown - c6.barkDown} yr`);
