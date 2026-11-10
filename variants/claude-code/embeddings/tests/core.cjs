'use strict';
// Word embeddings (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const ID = M.ID, N = M.NOUNS;

// ---- corpus as described ----
ok(M.V === 29 && M.VOCAB.length === 29, '29-word vocabulary (s0e)');
ok(M.CORPUS.length === 28 && M.CORPUS.every(s => s.length === 3), '28 three-word sentences (s1e)');
ok(M.CORPUS.every(s => s.every(i => Number.isInteger(i) && i >= 0 && i < 29)), 'all corpus words in vocabulary');
ok(M.VOCAB.every(([e, z]) => e && z && e !== z), 'every word has zh and en labels');
ok(new Set(M.VOCAB.map(v => v[1])).size === 29, 'zh labels distinct');
for (let i = 0; i < 29; i++) ok(M.CORPUS.some(s => s.includes(i)), 'every vocabulary word occurs: ' + M.VOCAB[i][0]);

// ---- step 0: one-hot ----
for (let a = 0; a < 29; a++) for (let b = 0; b < 29; b++) {
  const A = M.oneHot(a), B = M.oneHot(b);
  if (a === b) ok(M.dot(A, B) === 1 && M.dist(A, B) === 0, 'same word');
  else { ok(M.dot(A, B) === 0 && M.cosine(A, B) === 0, 'different words: dot 0'); near(M.dist(A, B), 1.414, 5e-4, 'distance 1.414 (s0diff)'); }
}

// ---- step 1: counting ----
const C2 = M.counts(28, 2), C1 = M.counts(28, 1), P2 = M.ppmi(C2);
ok(M.counts(0, 2).every(r => r.every(v => v === 0)), 'nothing read → all zero');
for (let k = 0; k < 28; k++) { const A = M.counts(k, 2), B = M.counts(k + 1, 2); ok(A.every((r, i) => r.every((v, j) => B[i][j] >= v)), 'counts never fall while reading'); }
ok(C2.every((r, i) => r.every((v, j) => v === C2[j][i])), 'window counts symmetric');
ok(Math.max(...C2.flat()) === 3, 'largest count 3 (bar axes 0..3)');
ok(C2[ID.king][ID.he] === 1 && C1[ID.king][ID.he] === 0, 'window 1: king stops counting he (s1hint)');
ok(C1.every((r, i) => r.every((v, j) => v <= C2[i][j])), 'window 1 counts ⊆ window 2');
ok(M.CORPUS[0].includes(ID.king), 'king is in sentence 1 (s1hint)');
for (let s = 0; s < 28; s++) ok(M.pairsIn(s, 2).length === 6 && M.pairsIn(s, 1).length === 4, 'pairs per sentence');
// king row: he1 is2 wears1 crown1 rules1 land1 rich1; "is" the tallest (s3hint)
const kingRow = { he: 1, is: 2, wears: 1, crown: 1, rules: 1, land: 1, rich: 1 };
M.VOCAB.forEach(([w], j) => ok(C2[ID.king][j] === (kingRow[w] || 0), 'king count ' + w));

// ---- step 2: cosine on raw counts ----
near(M.cosine(C2[ID.cat], C2[ID.dog]), 0.83, 0.005, 'cat–dog raw 0.83 (s2hint)');
near(M.cosine(C2[ID.king], C2[ID.queen]), 0.85, 0.005, 'king–queen raw 0.85');
near(M.cosine(C2[ID.man], C2[ID.woman]), 0.82, 0.005, 'man–woman raw 0.82');
ok(M.neighbours(C2, ID.king)[0].j === ID.queen, 'king raw nearest is queen (s2hint)');
ok(M.cosine(C2[ID.cat], C2[ID.crown]) < 0.3, 'cat–crown only scattered overlap');
// "is" row overlaps for nearly every noun pair (s2hint)
ok(N.every(i => C2[i][ID.is] > 0), 'every noun co-occurs with is');
// cosine ignores scale
ok(Math.abs(M.cosine(C2[ID.cat], C2[ID.dog]) - M.cosine(C2[ID.cat].map(v => 5 * v), C2[ID.dog])) < 1e-12, 'cosine scale-free (s2e)');

// ---- step 3: PPMI ----
const kind = i => Math.floor(N.indexOf(i) / 2);
function stats(X) { const rel = [], un = []; for (let a = 0; a < 6; a++) for (let b = a + 1; b < 6; b++) (kind(N[a]) === kind(N[b]) ? rel : un).push(M.cosine(X[N[a]], X[N[b]])); const m = v => v.reduce((p, q) => p + q, 0) / v.length; return { rel: m(rel), un: m(un), minRel: Math.min(...rel), maxUn: Math.max(...un), nr: rel.length, nu: un.length }; }
const SR = stats(C2), SP = stats(P2);
ok(SR.nr === 3 && SR.nu === 12, '3 same-kind pairs, 12 mixed (s3readout)');
near(SR.rel, 0.833, 0.005, 'raw same-kind 0.83'); near(SR.un, 0.411, 0.005, 'raw mixed 0.41');
near(SP.rel, 0.686, 0.005, 'PPMI same-kind 0.69'); near(SP.un, 0.072, 0.005, 'PPMI mixed 0.07');
ok(SP.rel < SR.rel, 'same-kind pairs lose a little (s3hint)');
ok(SP.rel - SP.un > SR.rel - SR.un, 'gap widens (s3hint, s6fin)');
ok(SP.minRel - SP.maxUn > SR.minRel - SR.maxUn && SP.minRel - SP.maxUn > 0.4, 'PPMI separates kinds by a wider margin');
near(SP.minRel, 0.661, 0.005, 'PPMI min same-kind'); near(SP.maxUn, 0.215, 0.005, 'PPMI max mixed'); near(SR.maxUn, 0.548, 0.005, 'raw max mixed');
const W1 = stats(M.ppmi(C1)), W1r = stats(C1);
ok(W1.rel - W1.un > W1r.rel - W1r.un, 'gap also widens at window 1');
ok(P2.every(r => r.every(v => v >= 0)), 'PPMI floored at 0');
ok(P2.every((r, i) => r.every((v, j) => (v > 0) <= (C2[i][j] > 0))), 'PPMI non-zero only where counts are');
// the step-3 chart only shows nouns' contexts; their PPMI fits the 0..3.5 axis
N.forEach(i => ok(Math.max(...P2[i]) <= 3.5, 'noun PPMI within 0..3.5 axis'));
near(P2[ID.king][ID.is], 0.81, 0.005, 'king–is PPMI 0.81');
near(P2[ID.king][ID.crown], 2.39, 0.005, 'king–crown PPMI 2.39');
ok(N.every(i => C2[i][ID.is] >= 1), 'is present for every noun');
// "is" is the shortest non-zero PPMI bar of king, crown and rules grow (s3hint)
{ const nz = M.VOCAB.map((_, j) => j).filter(j => C2[ID.king][j] > 0); ok(nz.every(j => P2[ID.king][ID.is] <= P2[ID.king][j]), 'is shortest PPMI for king'); ok(nz.every(j => C2[ID.king][ID.is] >= C2[ID.king][j]), 'is tallest raw for king'); ok(P2[ID.king][ID.crown] > C2[ID.king][ID.crown] && P2[ID.king][ID.rules] > C2[ID.king][ID.rules], 'crown, rules grow'); }
near(M.cosine(P2[ID.king], P2[ID.queen]), 0.69, 0.005, 'king–queen PPMI 0.69');
ok(M.cosine(P2[ID.king], P2[ID.cat]) < 0.05 && M.cosine(P2[ID.king], P2[ID.dog]) < 0.05, 'king–cat/dog almost 0 (s3hint)');
ok(M.cosine(C2[ID.king], C2[ID.cat]) > 0.3, 'but not almost 0 on raw counts');
// "is" is damped for every noun (s3e)
N.forEach(i => ok(P2[i][ID.is] < 1 && P2[i][ID.is] < Math.min(...M.VOCAB.map((_, j) => j).filter(j => P2[i][j] > 0 && j !== ID.is && ![ID.he, ID.she, ID.it].includes(j)).map(j => P2[i][j])), 'is damped below content neighbours'));

// ---- step 4: SVD map ----
const NV = N.map(i => P2[i]), Z = M.compress(NV);
const shares = [1, 2, 3, 4, 5, 6].map(k => Z.share(k));
[0.330, 0.625, 0.851, 0.924, 0.972, 1].forEach((s, k) => near(shares[k], s, 0.0015, 'share k=' + (k + 1)));
const inc = [shares[0], ...shares.slice(1).map((s, k) => s - shares[k])];
ok(inc.every(v => v <= 0.4), 'per-direction share fits the 0..40% axis');
ok(inc.every((v, k) => k === 0 || v <= inc[k - 1] + 1e-12), 'shares decrease');
function errAgree(k) { const X = M.truncate(Z.coords, k); let e = 0, ag = 0; for (let a = 0; a < 6; a++) { for (let b = 0; b < 6; b++) if (a !== b) e = Math.max(e, Math.abs(M.cosine(X[a], X[b]) - M.cosine(NV[a], NV[b]))); if (M.neighbours(NV, a)[0].j === M.neighbours(X, a)[0].j) ag++; } return { e, ag }; }
const EA = [1, 2, 3, 4, 5, 6].map(errAgree);
[0.994, 0.889, 0.337, 0.260, 0.077, 0].forEach((e, k) => near(EA[k].e, e, 0.0015, 'cos error k=' + (k + 1)));
[2, 6, 6, 6, 6, 6].forEach((a, k) => ok(EA[k].ag === a, 'NN agreement k=' + (k + 1)));
ok(fs.readFileSync(path.join(dir, 'i18n.js'), 'utf8').includes('0.89'), 's4hint quotes 0.89');
// full reconstruction: coords reproduce the Gram matrix
for (let a = 0; a < 6; a++) for (let b = 0; b < 6; b++) near(M.dot(Z.coords[a], Z.coords[b]), M.dot(NV[a], NV[b]), 1e-8, 'Gram');
// map: direction 1 × 2 puts cat/dog on one side, people on the other (s4hint)
const c = Z.coords;
ok([4, 5].every(a => c[a][1] < 0) && [0, 1, 2, 3].every(a => c[a][1] > 0), 'dir 2 splits animals from people');
// direction 2 × 3: three clusters — each word's nearest map point is its partner
for (let a = 0; a < 6; a++) { let best = -1, bd = Infinity; for (let b = 0; b < 6; b++) if (b !== a) { const d = Math.hypot(c[a][1] - c[b][1], c[a][2] - c[b][2]); if (d < bd) { bd = d; best = b; } } ok(best === (a ^ 1), 'dir 2×3 clusters: ' + M.VOCAB[N[a]][0]); }
{ const within = [0, 2, 4].map(a => Math.hypot(c[a][1] - c[a + 1][1], c[a][2] - c[a + 1][2])), between = []; for (let a = 0; a < 6; a++) for (let b = a + 1; b < 6; b++) if ((a >> 1) !== (b >> 1)) between.push(Math.hypot(c[a][1] - c[b][1], c[a][2] - c[b][2])); ok(Math.max(...within) * 2.5 < Math.min(...between), 'clusters well apart'); }

// ---- step 5: analogies ----
const AN = [['king', 'man', 'woman', 'queen', true], ['queen', 'woman', 'man', 'king', true], ['man', 'king', 'queen', 'woman', true], ['king', 'he', 'she', 'queen', true], ['he', 'man', 'woman', 'she', false]];
const tops = [0.690, 0.735, 0.696, 0.542, 0.440];
AN.forEach(([a, b, cc, e, hit], n) => {
  const r = M.analogy(P2, ID[a], ID[b], ID[cc]);
  ok(r.ranked.length === 26, 'excludes the three inputs');
  ok((r.ranked[0].j === ID[e]) === hit, `${a}-${b}+${cc} → ${e}: ${hit ? 'hit' : 'miss'}`);
  near(r.ranked[0].cos, tops[n], 0.0015, 'top cosine ' + n);
  ok(r.ranked.slice(0, 5).every(o => o.cos >= 0 && o.cos <= 1), 'top 5 within 0..1 axis');
});
{ const r = M.analogy(P2, ID.he, ID.man, ID.woman); ok(r.ranked[0].j === ID.rich, 'he−man+woman gives rich (s5hint)'); ok(r.ranked.findIndex(o => o.j === ID.she) + 1 === 7, 'she ranked 7th'); }
{ const r = M.analogy(P2, ID.king, ID.man, ID.woman).r; near(r[ID.he], 0.32, 0.005, 'he fades'); near(r[ID.she], 2.39, 0.005, 'she lights'); ok(r[ID.hat] < 0, 'hat negative'); ['crown', 'rules', 'land', 'rich'].forEach(w => near(r[ID[w]], P2[ID.king][ID[w]], 1e-12, w + ' untouched')); ok(r[ID.he] < P2[ID.king][ID.he] / 2, 'most of he cancelled');
  near(M.analogy(P2, ID.king, ID.man, ID.woman).ranked[1].cos, 0.332, 0.0015, 'second (is) 0.332'); ok(M.analogy(P2, ID.king, ID.man, ID.woman).ranked[1].j === ID.is, 'second is'); }
{ const d = P2[ID.woman].map((v, j) => v - P2[ID.man][j]); ok(d[ID.she] > 0 && d[ID.hat] < 0, '−man+woman: she positive, hat negative (s5e)'); ['works', 'city', 'street', 'busy'].forEach(w => ok(Math.abs(d[ID[w]]) < 0.5, w + ' mostly cancels')); }
// grid colouring scale: |values| up to 3 used for brightness; results stay within a sensible range
ok(Math.max(...AN.map(([a, b, cc]) => Math.max(...M.analogy(P2, ID[a], ID[b], ID[cc]).r.map(Math.abs)))) < 6, 'grid values bounded');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['rowProd']);
for (const k of zk) if (!NEUTRAL.has(k)) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) ok(!/左图|右图|上图|下图|左侧|右侧|left plot|right plot|left chart|right chart|upper chart|lower chart/.test(v), 'no positional chart references');
// numbers quoted in the text match the model
const zhAll = Object.values(STRINGS.zh).join(' '), enAll = Object.values(STRINGS.en).join(' ');
for (const s of ['0.83', '1.414', '0.89', '100%']) ok(zhAll.includes(s) && enAll.includes(s), 'quoted ' + s);

// ---- HTML/app keys and controls ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['a0', 'b0', 't1', 'w1', 'one1', 'all1', 'reset1', 'a2', 'b2', 'lg2', 't3', 'p12', 'p23', 'k4', 'q5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder');

// ---- deep links ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../computing/ml/embeddings/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS embeddings core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · cat–dog raw ${M.cosine(C2[ID.cat], C2[ID.dog]).toFixed(2)} · same/mixed PPMI ${SP.rel.toFixed(3)}/${SP.un.toFixed(3)} · king−man+woman → ${M.VOCAB[M.analogy(P2, ID.king, ID.man, ID.woman).ranked[0].j][0]}`);
