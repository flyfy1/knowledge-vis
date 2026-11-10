'use strict';
// LLM sampling (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b}`);
const both = (key, s) => { for (const l of ['zh', 'en']) ok(STRINGS[l][key].includes(s), `${l}.${key} quotes ${s}`); };

// ---- vocabulary and toy scores ----
ok(M.VOCAB === 1000 && M.NAMED === 10 && M.logits('capital').length === 1000 && M.logits('weekend').length === 1000, '1000 words, 10 named + 990 tail');
for (const n of ['capital', 'weekend']) { const z = M.logits(n); for (let i = 1; i < z.length; i++) ok(z[i] <= z[i - 1], 'scores fall with rank ' + n); }
both('s0e', '1000'); both('s0e', '990');

// ---- step 0: softmax sums to 1, shift invariance, odds = e^(difference) ----
for (const zL of [-2, 0, 3.7, 9]) for (const c of [-3, -0.5, 0, 3]) {
  const z = M.logits('capital').slice(); z[1] = zL;
  const p = M.softmax(z), pc = M.softmax(z.map(v => v + c));
  near(M.sum(p), 1, 1e-12, 'probabilities sum to 1');
  p.forEach((v, i) => near(pc[i], v, 1e-12, 'adding c changes nothing'));
  near(p[0] / p[1], Math.exp(z[0] - zL), 1e-9 * Math.exp(Math.abs(z[0] - zL)), 'odds = e^(z_Paris − z_Lyon)');
  ok(p.every(v => v > 0), 'every probability positive');
}
{ // raising Lyon lowers every other word (s0hint)
  const z = M.logits('capital').slice(), a = M.softmax(z); z[1] += 1; const b = M.softmax(z);
  ok(b[1] > a[1] && b.every((v, i) => i === 1 || v < a[i]), 'raising one score lowers all others');
}

// ---- step 1: temperature ----
{
  const cap = T => M.softmax(M.logits('capital'), T), wk = T => M.softmax(M.logits('weekend'), T);
  ok(cap(0.3)[0] > 0.99, 'T = 0.3: Paris almost everything');
  near(cap(2)[0], 0.26, 0.006, 'T = 2: top share about 26%'); both('s1hint', '26%');
  ok(M.tailShare(cap(2)) > 0.5, 'T = 2: tail passes one half');
  near(M.tailShare(wk(1)), 0.15, 0.006, 'weekend tail about 15% at T = 1'); both('s1hint', '15%'); both('s2e', '15%');
  // the weekend curves cross close to T = 1
  let cross = null; for (let T = 0.5; T <= 1.5; T += 0.001) { const q = wk(T); if (M.tailShare(q) >= Math.max(...q)) { cross = T; break; } }
  ok(cross > 0.97 && cross < 1.08, 'weekend curves cross near T = 1: ' + cross);
  // odds between two words follow e^((zi − zj)/T)
  for (const T of [0.3, 1, 2.7]) { const q = cap(T), z = M.logits('capital'); near(q[0] / q[1], Math.exp((z[0] - z[1]) / T), 1e-6 * q[0] / q[1], 'odds scale with 1/T'); }
  // monotone: higher T → lower top share, higher tail share (both prompts)
  for (const n of ['capital', 'weekend']) { let pt = 2, pl = -1; for (let T = 0.1; T <= 3; T += 0.05) { const q = M.softmax(M.logits(n), T); ok(Math.max(...q) <= pt + 1e-12 && M.tailShare(q) >= pl - 1e-12, 'monotone in T ' + n); pt = Math.max(...q); pl = M.tailShare(q); } }
}

// ---- step 2: the long tail ----
{
  const q1 = M.softmax(M.logits('weekend'), 1);
  ok(Math.max(...q1.slice(10)) < 0.02, 'every tail word below 2% at T = 1'); both('s2e', '2%');
  near(M.atLeastOne(M.tailShare(q1), 30), 0.99, 0.005, 'L = 30 → about 99%'); both('s2hint', '99%');
  for (const q of [0.01, 0.146, 0.5]) for (const L of [1, 7, 100]) { // closed form = simulation of independent positions
    let s = M.rng(5), hit = 0; const R = 20000; for (let r = 0; r < R; r++) { let any = false; for (let i = 0; i < L; i++) if (s() < q) { any = true; break; } if (any) hit++; }
    near(hit / R, M.atLeastOne(q, L), 0.012, `1 − (1 − q)^L q=${q} L=${L}`);
  }
}

// ---- step 3: top-k vs top-p ----
{
  const capK = M.shape(M.logits('capital'), { k: 5 }), wkK = M.shape(M.logits('weekend'), { k: 5 });
  near(1 - capK.out[0], 0.06, 0.005, 'k = 5: words other than Paris ≈ 6%'); both('s3hint', '6%');
  near(wkK.mass, 0.59, 0.005, 'k = 5: weekend keeps ≈ 59%'); both('s3hint', '59%');
  ok(!wkK.kept.has(5) && !wkK.kept.has(7), 'fishing and swimming are cut at k = 5');
  const capP = M.shape(M.logits('capital'), { p: 0.9 }), wkP = M.shape(M.logits('weekend'), { p: 0.9 });
  ok(capP.count === 1 && capP.kept.has(0), 'p = 0.9: capital keeps Paris only');
  ok(wkP.count === 16, 'p = 0.9: weekend keeps 16 words'); both('s3hint', '16');
  // definition: fewest words reaching p; renormalised output sums to 1
  for (const n of ['capital', 'weekend']) for (let p = 0.05; p <= 1.0001; p += 0.05) for (const T of [0.5, 1, 2]) {
    const s = M.shape(M.logits(n), { p, T }); near(M.sum(s.out), 1, 1e-9, 'renormalised');
    ok(s.mass >= p - 1e-9 && (s.count === 1 || s.mass - s.q[s.keep[s.count - 1]] < p - 1e-12), 'fewest words reaching p');
  }
  for (let k = 1; k <= 50; k++) { const s = M.shape(M.logits('weekend'), { k }); ok(s.count === k, 'top-k keeps k'); }
}

// ---- step 4: frequencies → probabilities; TV shrinks like 1/√N ----
{
  const dist = M.softmax(M.logits('weekend'), 1), P = M.lump(dist);
  const meanTv = (N, R) => { let acc = 0; for (let r = 0; r < R; r++) { const u = M.rng(1000 + r), c = new Array(11).fill(0); for (let i = 0; i < N; i++) c[Math.min(M.draw(dist, u()), 10)]++; acc += M.tv(c.map(v => v / N), P); } return acc / R; };
  const t100 = meanTv(100, 300), t10k = meanTv(10000, 60);
  near(t10k / t100, 0.1, 0.02, 'N × 100 → TV × about 1/10');
  const expTv = N => 0.5 * P.reduce((s, p) => s + Math.sqrt(2 * p * (1 - p) / (Math.PI * N)), 0);
  near(meanTv(1000, 200) / expTv(1000), 1, 0.1, 'dashed curve = expected TV within 10% at N = 1000');
  near(M.sum(P), 1, 1e-12, 'lumped columns sum to 1');
  // the page's own seed 2024 run ends close to the expectation
  const u = M.rng(2024), c = new Array(11).fill(0); for (let i = 0; i < 10000; i++) c[Math.min(M.draw(dist, u()), 10)]++;
  ok(M.tv(c.map(v => v / 10000), P) < 0.03, 'seed 2024 at 10,000 draws: TV small');
}

// ---- step 5: the bigram toy model ----
{
  ok(M.TOKENS.length === 12, '12 tokens'); both('s5e', '12'); both('s5e', '24');
  ok(M.SENT_LEN === 24, '24 words per passage');
  let lo = Infinity, hi = -Infinity; for (const a in M.GOOD) for (const b in M.GOOD[a]) { lo = Math.min(lo, M.GOOD[a][b]); hi = Math.max(hi, M.GOOD[a][b]); }
  ok(lo === 0.4 && hi === 3.0 && M.ODD === -2, 'grammatical scores 0.4–3.0, broken −2'); both('s5e', '0.4'); both('s5e', '3.0'); both('s5e', '−2');
  ok(M.isOdd(M.TOKENS.indexOf('moon'), M.TOKENS.indexOf('cat')) && !M.isOdd(M.TOKENS.indexOf('cat'), M.TOKENS.indexOf('chases')), 'examples in s5e');
  const sw1 = M.sweep(1), sw8 = M.sweep(0.8), at = (sw, T) => sw.find(r => Math.abs(r.T - T) < 1e-9);
  ok(at(sw1, 0.2).repeat > 0.6 && at(sw1, 0.2).odd < 0.005, 'T = 0.2: high repeat, no broken transitions');
  ok(at(sw1, 2.5).odd > 0.3 && at(sw1, 2.5).repeat < 0.05, 'T = 2.5: many broken transitions, no loops');
  ok(at(sw8, 1.5).odd < 0.02 && at(sw1, 1.5).odd > 0.1, 'T = 1.5: p 1 → 0.8 drops broken rate to almost 0');
  ok(at(sw8, 1.5).repeat > at(sw1, 1.5).repeat && at(sw8, 1.5).repeat - at(sw1, 1.5).repeat < 0.1, 'and repeat rises only a little');
  // T = 0.2 loops "the cat chases a ball ." — the most common 4-gram in low-T passages
  const cnt = {}; for (let s = 1; s <= 50; s++) { const g = M.generate({ T: 0.2, seed: s }); for (let i = 0; i + 3 < g.toks.length; i++) { const k = g.toks.slice(i, i + 4).map(x => M.TOKENS[x]).join(' '); cnt[k] = (cnt[k] || 0) + 1; } }
  const top = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a])[0];
  ok(['cat chases ball stop', 'chases ball stop cat', 'ball stop cat chases', 'stop cat chases ball'].includes(top), 'T = 0.2 loop is cat chases ball stop: ' + top);
  // stats definitions
  const g = M.generate({ T: 1, seed: 3 }); ok(g.toks.length === 24 && g.odd.length === 24, 'passage length');
  near(g.stats.oddShare, g.odd.filter(Boolean).length / 24, 1e-12, 'broken rate over 24 transitions');
  const rep = M.stats([1, 4, 7, 0, 1, 4, 7, 0], new Array(8).fill(false)); near(rep.repeat, 3 / 7, 1e-12, "repeat rate definition (windows include the opening full stop)");
  // sampling follows the shaped distribution (draw frequencies)
  const s = M.shape(M.BIG[0], { T: 1 }), u = M.rng(9), c = new Array(12).fill(0); for (let i = 0; i < 40000; i++) c[M.draw(s.out, u())]++;
  c.forEach((v, i) => near(v / 40000, s.out[i], 0.01, 'draw follows distribution'));
}

// ---- bilingual strings ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join(',');
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['methodK', 'methodP', 'w_paris', 'w_lyon', 'w_marseille', 'w_nice', 'w_europe', 'w_rome']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const id of [...M.PROMPTS.capital.ids, ...M.PROMPTS.weekend.ids]) ok(STRINGS.zh['w_' + id] !== undefined, 'word label ' + id);
for (const tk of M.TOKENS) ok(STRINGS.zh['tk_' + tk] !== undefined, 'token label ' + tk);

// ---- keys used by HTML/app exist; controls present ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'[,)]/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['z0', 'c0', 't1', 'p1cap', 'p1wk', 't2', 'l2', 'reroll2', 'clear2', 'm3k', 'm3p', 'k3', 'p3', 'd1', 'd10', 'd100', 'dAuto', 'reset4', 't5', 'p5', 'write5', 'seed5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder + css');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../computing/ml/llm-sampling/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS llm-sampling core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
