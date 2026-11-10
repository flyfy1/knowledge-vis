'use strict';
// Ethical-decisions (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
const grid = (lo, hi, st) => { const out = []; for (let v = lo; v <= hi + 1e-9; v += st) out.push(+v.toFixed(6)); return out; };
const P_GRID = grid(0.02, 0.30, 0.005), L_GRID = grid(0, 1, 0.01), Q_GRID = grid(0, 1, 0.05);

// ---- the stated set-up (s0e) matches the model constants ----
ok(M.GROUPS.map(g => g.n).join() === '500,100,400' && M.N === 1000, 'homes 500/100/400 = 1000');
ok(M.GROUPS[1].m === 2 && M.DEFAULTS.mR === 2 && M.GROUPS[2].m === 0.3, 'riverside 2×, hillside 0.3×');
ok(M.LOSS === 100 && M.COST.A === 2000 && M.COST.B === 2500 && M.COST.C === 5000, 'loss 100k; costs 2000/2500/5000');
ok(M.DEFAULTS.eA === 0.9 && M.B_CUT === 0.4 && M.C_PARK === 0.3 && M.DEFAULTS.hm === 8 && M.DEFAULTS.p === 0.1, 'cuts 90/40/30 %, hardship 8, p 10 %');
for (const l of ['zh', 'en']) for (const s of ['500', '100', '400', '2000', '2500', '5000', '90%', '40%', '30%', '8', '1000', '10%', '0.3']) ok(STRINGS[l].s0e.includes(s), `s0e (${l}) states ${s}`);
// slider ranges in the HTML = model ranges quoted in hints (2 %–30 %)
ok(/id="p1"[^>]*min="0.02" max="0.30"/.test(html) && /id="p4"[^>]*min="0.02" max="0.30"/.test(html), 'p sliders 2 %–30 %');
ok(M.RANGES.p[0] === 0.02 && M.RANGES.p[1] === 0.30, 'p range');
for (const [id, k] of [['eA5', 'eA'], ['mR5', 'mR'], ['hm5', 'hm']]) { const m = html.match(new RegExp(`id="${id}"[^>]*min="([^"]+)" max="([^"]+)"`)); ok(m && +m[1] === M.RANGES[k][0] && +m[2] === M.RANGES[k][1], 'slider range ' + id); }

// ---- step 0: burden = flood + tax + hardship; totals and averages ----
for (const rule of [false, true]) for (const q of Q_GRID) for (const p of [0.02, 0.1, 0.3]) for (const id of M.PLANS) {
  const a = { p, q, rule }, sm = M.summary(id, a), sp = M.spec(id, a);
  let n = 0, tot = 0;
  sm.rows.forEach(r => { near(r.b, r.flood + r.tax + r.hard, 1e-12, 'burden sum'); near(r.tax, sp.cost / 1000, 1e-12, 'even cost split'); n += r.n; tot += r.n * r.b; });
  near(n, 1000, 1e-9, 'rows cover every home'); near(sm.total, tot, 1e-9, 'total = Σ n·b'); near(sm.mean, tot / 1000, 1e-12, 'mean');
  near(sm.worst, Math.max(...sm.rows.filter(r => r.n > 0).map(r => r.b)), 1e-12, 'worst');
}
// do nothing at p = 10 %: 10 / 20 / 3 per home (expected loss = chance × 100)
{ const r = M.summary('none', {}).rows; near(r[0].b, 10, 1e-12, 'downtown 10'); near(r[1].b, 20, 1e-12, 'riverside 20'); near(r[2].b, 3, 1e-12, 'hillside 3'); }

// ---- step 1: straight lines in p; do nothing vs A crossing ----
for (const id of M.PLANS) { const L = M.meanLine(id, {}); for (const p of P_GRID) near(M.summary(id, { p }).mean, L.c0 + L.c1 * p, 1e-9, 'line in p ' + id); near(L.c0, M.COST[id] / 1000 + (id === 'C' ? 0.8 : 0), 1e-9, 'intercept = cost share (+ hardship for C)'); }
const cross = M.crossP('none', 'A', {});
near(cross, 2 / 45, 1e-12, 'cross at 4.44 %');
for (const p of P_GRID) {
  const n = M.summary('none', { p }).mean, a = M.summary('A', { p }).mean;
  ok(p < cross ? n < a : n > a, 'below the crossing doing nothing is cheaper, above it A');
}
// s1hint: C never has the lowest average, whatever p, rule or q
for (const rule of [false, true]) for (const q of Q_GRID) for (const p of P_GRID) ok(M.bestMean({ p, q, rule }) !== 'C', 'C never leads on averages');
// s1readout default: A best at 10 %
ok(M.bestMean({}) === 'A', 'A best on totals at 10 %');

// ---- step 2: distribution lens ----
// s2hint: under A riverside is worse off than with no plan at all (it pays for a levee that does not protect it)
for (const p of P_GRID) for (const eA of grid(0.5, 1, 0.05)) for (const mR of grid(1, 4, 0.1)) {
  const rA = M.summary('A', { p, eA, mR }).rows.find(r => r.key === 'R'), r0 = M.summary('none', { p, mR }).rows.find(r => r.key === 'R');
  near(rA.b - r0.b, 2, 1e-9, 'A adds its cost share to riverside and nothing else');
}
// "raise λ a little and A loses the lead": wherever A wins at λ = 0, it has lost the lead by λ = 0.4
for (const p of P_GRID) {
  if (M.winner({ p, lam: 0 }) !== 'A') continue;
  const f = M.sweep({ p }, 'lam').flips; ok(f.length && f[0].from === 'A' && f[0].at < 0.4, 'A loses the lead at small λ, p = ' + p);
}
// score formula: λ = 0 is the average, λ = 1 is the worst-off burden
for (const id of M.PLANS) { const sm = M.summary(id, {}); near(M.score(sm, 0), sm.mean, 1e-12, 'λ=0'); near(M.score(sm, 1), sm.worst, 1e-12, 'λ=1'); }
// the default sequence A → B → C at p = 10 % (books only)
assert.deepEqual(M.sweep({}, 'lam').segs.map(s => s.id), ['A', 'B', 'C']); checks++;

// ---- step 3: consent ----
const man = M.summary('C', { rule: false, q: 0.6 });
for (const q of Q_GRID) {
  const sm = M.summary('C', { rule: false, q });
  near(sm.mean, man.mean, 1e-12, 'books-only average does not depend on q'); near(sm.worst, man.worst, 1e-12, 'books-only worst does not depend on q');
  near(sm.forced, 100 * (1 - q), 1e-9, 'forced homes = 100(1 − q)');
  near(M.summary('C', { rule: true, q }).forced, 0, 0, 'rule on: nobody forced');
}
// rule on: while anyone stays, the stayers are the worst-off group and their burden rises with q
// (claimed at the default p = 10 %; it holds for every p ≥ 5 % on the slider grid)
for (const p of P_GRID) {
  let prev = -Infinity;
  for (const q of Q_GRID.filter(v => v < 1)) {
    const sm = M.summary('C', { rule: true, q, p });
    if (p >= 0.05) ok(sm.worstKey === (q > 0 ? 'Rstay' : 'R'), 'stayers are worst-off, q = ' + q);
    ok(sm.worst > prev, 'worst rises with q'); prev = sm.worst;
  }
  // q = 100 %: identical numbers in both versions
  const v1 = M.summary('C', { rule: true, q: 1, p }), m1 = M.summary('C', { rule: false, q: 1, p });
  near(v1.mean, m1.mean, 1e-12, 'q = 1 same average'); near(v1.worst, m1.worst, 1e-12, 'q = 1 same worst');
}

// ---- step 4: map ----
const PEOPLE = app.match(/const PEOPLE = (\[[^\]]+\])/)[1].replace(/(\w+):/g, '"$1":');
const people = JSON.parse(PEOPLE);
ok(people[0].p === people[1].p && people[0].lam !== people[1].lam, 'Ana and Ben share p, differ in λ');
ok(people[0].lam === people[2].lam && people[0].p !== people[2].p, 'Ana and Cal share λ, differ in p');
for (const rule of [false, true]) for (const q of Q_GRID) {
  ok(M.winner(Object.assign({ rule, q }, people[0])) === 'A', 'quiz: Ana picks A');
  ok(M.winner(Object.assign({ rule, q }, people[1])) === 'B', 'quiz: Ben picks B');
}
// s4hint: with the consent rule on, C's region disappears (for any willing share below 100 %)
let cOff = 0;
for (const p of P_GRID) for (const lam of L_GRID) {
  if (M.winner({ p, lam }) === 'C') cOff++;
  for (const q of Q_GRID.filter(v => v < 1)) ok(M.winner({ p, lam, rule: true, q }) !== 'C', 'no C region with the rule on');
}
ok(cOff > 1000, 'C has a sizeable region with books only');
// margins: just past each reported flip the winner really changes, just inside it does not
for (const pt of [{}, people[0], people[1], people[2], { p: 0.2, lam: 0.5 }, { p: 0.05, lam: 0.8, rule: true }])
  for (const key of ['p', 'lam', 'eA', 'mR', 'hm', 'q']) {
    const a = Object.assign({}, M.DEFAULTS, pt), mg = M.margins(a, key), w = M.winner(a);
    for (const side of ['below', 'above']) {
      const f = mg[side]; if (!f) continue;
      const out = side === 'below' ? f.at - 1e-6 : f.at + 1e-6, inn = side === 'below' ? f.at + 1e-6 : f.at - 1e-6;
      ok(M.winner(Object.assign({}, a, { [key]: out })) === (side === 'below' ? f.from : f.to), `flip ${key} ${side}`);
    }
    // no flip reported ⇒ the winner is the same across the whole range
    if (!mg.below) for (const v of grid(M.RANGES[key][0], a[key], (a[key] - M.RANGES[key][0]) / 20 || 1)) ok(M.winner(Object.assign({}, a, { [key]: v })) === w, `no flip below ${key}`);
    if (!mg.above) for (const v of grid(a[key], M.RANGES[key][1], (M.RANGES[key][1] - a[key]) / 20 || 1)) ok(M.winner(Object.assign({}, a, { [key]: v })) === w, `no flip above ${key}`);
  }
// default flips quoted nowhere as text, but the readout values come from here: p 5.3 % / 18.5 %, λ 0.19 / 0.67
{ const mg = M.margins(M.DEFAULTS, 'p'); near(mg.below.at, 0.0532, 5e-4, 'p flip below'); near(mg.above.at, 0.185, 5e-4, 'p flip above'); }

// ---- step 5: every row is drawn with the others held; moving the riverside multiple moves the p boundaries ----
{
  const f2 = M.sweep({ mR: 2 }, 'p').flips.map(f => f.at), f3 = M.sweep({ mR: 3 }, 'p').flips.map(f => f.at);
  ok(f2.join() !== f3.join(), 'riverside multiple moves the p boundaries');
  const g2 = M.sweep({ mR: 2 }, 'lam').flips.map(f => f.at), g3 = M.sweep({ mR: 3 }, 'lam').flips.map(f => f.at);
  ok(g2.join() !== g3.join(), 'riverside multiple moves the λ boundaries');
  // segments tile the range and agree with point evaluations
  for (const key of ['p', 'lam', 'eA', 'mR', 'hm', 'q']) {
    const { segs } = M.sweep({}, key), [lo, hi] = M.RANGES[key];
    near(segs[0].lo, lo, 0, 'first segment starts at min'); near(segs[segs.length - 1].hi, hi, 0, 'last ends at max');
    segs.forEach(s => { const mid = (s.lo + s.hi) / 2; ok(M.winner(Object.assign({}, M.DEFAULTS, { [key]: mid })) === s.id, 'segment colour ' + key); });
  }
}

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['nmP', 'nmLam', 'nmQ', 's5item']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const k of zk) ok(!/左图|右图|left panel|right panel|left chart|right chart/i.test(STRINGS[l][k]), 'no left/right figure references: ' + k);

// ---- every key referenced in HTML/app exists ----
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const k of ['grpD', 'grpR', 'grpRmove', 'grpRvol', 'grpRstay', 'grpH', 'rowP', 'rowLam', 'rowEA', 'rowMR', 'rowHM', 'rowQ', 'nmP', 'nmLam', 'nmEA', 'nmMR', 'nmHM', 'nmQ', 'tag0', 'tag1', 'tag2']) ok(STRINGS.zh[k] !== undefined, 'dynamic key ' + k);
for (const id of ['p1', 'l2', 'q3', 'p4', 'l4', 'eA5', 'mR5', 'hm5', 'ruleOff3', 'ruleOn3', 'ruleOff4', 'ruleOn4', 'reset5', 'checkQuiz']) ok(html.includes(`id="${id}"`), 'control ' + id);
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
ok(fs.existsSync(path.join(dir, '../../../psychology/ethics/ethics-decisions/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS ethics-decisions core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · none/A cross ${(cross * 100).toFixed(2)}%`);
