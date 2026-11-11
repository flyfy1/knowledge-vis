'use strict';
// Pins every number the prose in copy.zh.js states, computed from the page's own models.js.
// Run: node society/civics/same-votes-different-winner/tests/models.cjs
const assert = require('node:assert/strict');
const path = require('node:path');
const M = require(path.join(__dirname, '..', 'models.js'));
let n = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); n++; };
const eq = (a, b, msg) => { assert.deepEqual(a, b, msg); n++; };
const near = (a, b, tol, msg) => { assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`); n++; };
const A3 = [0, 1, 2], A4 = [0, 1, 2, 3];

/* opening: 21 voters */
{
  const B = M.expand(M.OPENING), all = M.electAll(B, A3);
  eq(B.length, 21, '21 voters');
  eq(M.OPENING.map(g => g.count), [8, 7, 2, 4], 'group sizes');
  eq(all.plurality.winner, 0, 'plurality A'); eq(all.plurality.counts[0], 8, 'A has 8 firsts');
  eq(all.runoff.finalists.slice().sort(), [0, 1], 'C out in round one');
  eq([all.runoff.final[1], all.runoff.final[0]], [11, 10], 'B beats A 11:10'); eq(all.runoff.winner, 1, 'runoff B');
  eq(all.borda.winner, 2, 'Borda C'); eq([all.borda.scores[2], all.borda.scores[0], all.borda.scores[1]], [27, 18, 18], 'Borda 27/18/18');
  const m = all.condorcet.matrix; eq(all.condorcet.winner, 2, 'Condorcet C');
  eq([m[2][0], m[0][2], m[2][1], m[1][2]], [13, 8, 14, 7], 'C 13:8 over A, 14:7 over B');
  eq(new Set(['plurality', 'runoff', 'borda', 'condorcet'].map(k => all[k].winner)).size, 3, 'four rules, three winners');
}

/* ch1: the plane electorate */
const PV = M.planeVoters(), PB = M.ballotsFrom(PV, M.PLANE.cands);
{
  eq(PV.length, 99, '99 voters');
  const all = M.electAll(PB, A4), f = all.plurality.counts;
  eq([f[0], f[1], f[2], f[3]], [26, 35, 25, 13], 'first choices A26 B35 C25 D13');
  eq(all.plurality.winner, 1, 'plurality B');
  eq(all.runoff.finalists, [1, 0], 'runoff finalists B and A; C out by one vote (25 vs 26)');
  eq([all.runoff.final[0], all.runoff.final[1]], [55, 44], 'A beats B 55:44'); eq(all.runoff.winner, 0, 'runoff A');
  eq(all.irv.rounds.map(r => r.out), [3, 0, -1], 'IRV drops D, then A');
  const dSecond = PB.filter(b => b[0] === 3).map(b => b[1]); ok(dSecond.filter(x => x === 2).length > dSecond.length / 2, 'most D voters rank C second');
  eq([all.irv.rounds[2].counts[2], all.irv.rounds[2].counts[1]], [64, 35], 'C beats B 64:35'); eq(all.irv.winner, 2, 'IRV C');
  eq(all.borda.winner, 2, 'Borda C'); eq(all.borda.scores[2], 200, 'Borda 200');
  eq(all.condorcet.winner, 2, 'Condorcet C');
  eq(new Set(M.RULE_KEYS.map(k => all[k].winner)).size, 3, 'three different winners');
}

/* ch2: spoiler on a line */
const LV = M.lineVoters(), L = M.LINE.L, R = M.LINE.R;
{
  eq(LV.length, 101, '101 voters');
  const h = M.plurality(M.ballotsFrom(LV, [[L], [R]]), [0, 1]);
  eq([h.counts[0], h.counts[1]], [53, 48], 'A beats B 53:48 without C');
  const b3 = M.ballotsFrom(LV, [[L], [R], [M.LINE.T]]), p = M.plurality(b3, A3);
  eq(M.LINE.T, 0.24, 'default C at 0.24');
  eq([p.counts[0], p.counts[1], p.counts[2]], [34, 48, 19], 'first choices with C');
  eq(p.winner, 1, 'plurality B'); eq(M.irv(b3, A3).winner, 0, 'IRV A'); eq(M.condorcet(b3, A3).winner, 0, 'Condorcet A');
  const S = M.spoilerStrip(LV, L, R, 200), at = x => S[Math.round(x * 200)];
  for (let x = 0.04; x <= 0.315 + 1e-9; x += 0.005) { const s = at(x); ok(s.plurality === 1 && s.irv === 0 && s.condorcet === 0, 'spoiler band ' + x.toFixed(3)); }
  ok(at(0.03).plurality === 0, 'band starts after 0.03');
  for (let x = 0.33; x <= 0.64 + 1e-9; x += 0.005) { const s = at(x); ok(s.condorcet === 2 && s.plurality !== 2 && s.irv === 0, 'C is the Condorcet winner but loses, ' + x.toFixed(3)); ok(s.plurality === (x < 0.4725 ? 1 : 0), 'first half B, second half A at ' + x.toFixed(3)); }
  ok(at(0.325).condorcet !== 2 || at(0.325).irv === 2, 'band starts near 0.33'); ok(at(0.645).condorcet !== 2, 'band ends near 0.64');
  for (let x = 0.34; x <= 0.64 + 1e-9; x += 0.01) { const f = M.plurality(M.ballotsFrom(LV, [[L], [R], [x]]), A3).counts; ok(f[2] < f[0] && f[2] < f[1], 'C has the fewest firsts at ' + x.toFixed(2)); }
  ok(S.every(s => s.condorcet === 0 || s.condorcet === 2), 'pairwise winner is A unless C itself is the Condorcet winner');
  const run = M.desertionRun(LV, [[L], [R], [M.LINE.T]], 0.35, 11);
  eq(run.length, 12, 'twelve elections');
  eq(run[0].order[0], 1, 'election 1: B');
  eq(run.findIndex(r => r.order[0] !== 1) + 1, 5, 'A overtakes in election 5');
  ok(run.slice(9).every(r => r.shares[2] < 0.005), 'C near zero from election 10');
}

/* ch3: median voter and win sets */
{
  const med = M.median1D(LV); near(med, 0.48, 0.005, 'median 0.48');
  const sorted = LV.map(v => v[0]).sort((a, b) => a - b); eq(sorted[50], med, 'median is voter 51 of 101');
  const G1 = M.grid1D(200); let inc = [0.15], k = 0;
  for (; k < 500; k++) { const c = M.bestChallenger(LV, inc, G1); if (!c) break; inc = c.point; }
  ok(k < 500, '1D challengers stop'); near(inc[0], med, 0.005, '1D stops at the median');
  const G2 = M.grid2D(41), sizes = G2.map(p => M.winSet(PV, p, G2).filter(Boolean).length), min = Math.min(...sizes);
  ok(min > 0, 'no unbeatable grid point in 2D'); near(min / G2.length, 0.01, 0.002, 'about 1% at the hardest point');
  const at = G2[sizes.indexOf(min)]; near(at[0], 0.5, 0.06, 'hardest point near centre x'); near(at[1], 0.5, 0.06, 'hardest point near centre y');
  let p = [0.2, 0.8]; const trace = [];
  for (let i = 0; i < 120; i++) { const c = M.bestChallenger(PV, p, G2); ok(!!c, '2D never stops'); p = c.point; trace.push(p); }
  ok(trace.slice(30).every(q => Math.abs(q[0] - 0.5) < 0.1 && Math.abs(q[1] - 0.5) < 0.1), '2D trace circles near the centre');
}

/* ch4: cycles */
{
  let cyc = 0; for (const a of M.PERMS3) for (const b of M.PERMS3) for (const c of M.PERMS3) if (M.majority3([a, b, c]).cycle) cyc++;
  eq(cyc, 12, '12 of 216 three-voter profiles cycle');
  near(M.cycleProbIC(3), 1 / 18, 1e-12, 'P(cycle | 3) = 1/18');
  eq((M.cycleProbIC(3) * 100).toFixed(1), '5.6', '5.6%');
  eq((M.GUILBAUD * 100).toFixed(1), '8.8', 'limit 8.8%');
  let prev = 0; for (let k = 3; k <= 31; k += 2) { const v = M.cycleProbIC(k); ok(v > prev && v < M.GUILBAUD, 'rises toward the limit at n=' + k); prev = v; }
  const def = M.majority3([[0, 1, 2], [1, 2, 0], [2, 0, 1]]); ok(def.cycle, 'default profile is a cycle');
}

/* ch5: manipulation on the ch1 electorate */
{
  const mp = M.findManipulation(PB, A4, 'plurality');
  eq(mp.group, [2, 3, 0, 1], 'plurality: C>D>A>B group'); eq(mp.groupSize, 13, '13 voters'); eq(mp.k, 9, '9 switch');
  eq(mp.ballot[0], 0, 'they vote A first'); eq([mp.before, mp.after], [1, 0], 'B -> A'); ok(mp.betrayal, 'favourite betrayal');
  const mr = M.findManipulation(PB, A4, 'runoff');
  eq(mr.group, [1, 2, 0, 3], 'runoff: B>C>A>D group'); eq(mr.groupSize, 34, '34 voters'); eq(mr.k, 2, '2 switch');
  eq(mr.ballot[0], 2, 'they vote C first'); eq([mr.before, mr.after], [0, 2], 'A -> C');
  eq(M.findManipulation(PB, A4, 'condorcet'), null, 'no manipulation against a Condorcet winner');
  // prose: IRV and Borda find nothing by default; with C moved to (0.36, 0.36) all four rules do, IRV and Borda with 2 switchers
  eq(M.findManipulation(PB, A4, 'irv'), null, 'IRV: nothing in the default layout');
  eq(M.findManipulation(PB, A4, 'borda'), null, 'Borda: nothing in the default layout');
  const C2 = M.PLANE.cands.map(c => c.slice()); C2[2] = [0.36, 0.36];
  const PB2 = M.ballotsFrom(PV, C2);
  ['plurality', 'runoff', 'irv', 'borda'].forEach(r => { const m = M.findManipulation(PB2, A4, r); ok(!!m && m.groupSize >= m.k, r + ' manipulable with C at (0.36, 0.36)'); });
  eq(M.findManipulation(PB2, A4, 'irv').k, 2, 'IRV: 2 switchers'); eq(M.findManipulation(PB2, A4, 'borda').k, 2, 'Borda: 2 switchers');
}

/* ch6: approval */
{
  const C4 = M.PLANE.cands;
  for (let r = 0.05; r < 0.195; r += 0.01) eq(M.approval(PV, C4, A4, r).winner, 1, 'approval B at r=' + r.toFixed(2));
  for (let r = 0.20; r <= 0.6 + 1e-9; r += 0.01) eq(M.approval(PV, C4, A4, r).winner, 2, 'approval C at r=' + r.toFixed(2));
  const small = M.approval(PV, C4, A4, 0.05).scores, f = M.plurality(PB, A4).counts;
  ok(A4.every(k => small[k] === f[k]), 'tiny radius = plurality');
  eq(M.approval(PV, C4, A4, 0.12).winner, 1, 'default 0.12 gives B');
}

/* ch7: apportionment, 1880 */
{
  const pops = M.POP1880.map(x => x[1]), idx = s => M.POP1880.findIndex(x => x[0] === s);
  eq(pops.length, 38, '38 states');
  const T = pops.reduce((a, b) => a + b, 0); eq((pops[idx('AL')] / T * 100).toFixed(2), '2.56', 'Alabama 2.56%');
  const q299 = M.quotas(pops, 299), q300 = M.quotas(pops, 300);
  eq(q300[idx('AL')].toFixed(2), '7.67', '7.67 seats at 300');
  eq([q299[idx('AL')].toFixed(3), q300[idx('AL')].toFixed(3)], ['7.646', '7.671'], 'AL quotas');
  eq([q299[idx('TX')].toFixed(3), q300[idx('TX')].toFixed(3)], ['9.640', '9.672'], 'TX quotas');
  eq([q299[idx('IL')].toFixed(3), q300[idx('IL')].toFixed(2)], ['18.640', '18.70'], 'IL quotas');
  const h299 = M.hamilton(pops, 299).seats, h300 = M.hamilton(pops, 300).seats;
  eq([h299[idx('AL')], h300[idx('AL')]], [8, 7], 'Alabama 8 -> 7');
  eq([h299[idx('TX')], h300[idx('TX')]], [9, 10], 'Texas 9 -> 10');
  eq([h299[idx('IL')], h300[idx('IL')]], [18, 19], 'Illinois 18 -> 19');
  eq(h300[idx('NV')], 1, 'Nevada keeps its guaranteed seat');
  eq(T, 49371340, 'total population 49,371,340');
  eq(q300[idx('NV')].toFixed(2), '0.38', 'Nevada entitled to 0.38');
  const fr = x => x - Math.floor(x);
  eq((fr(q300[idx('TX')]) - fr(q300[idx('AL')])).toFixed(4), '0.0006', 'at 300, Alabama is 0.0006 below Texas');
  // without setting Nevada's seat aside (plain largest remainders, Nevada may get 0), Alabama keeps 8 at 300
  const plain = h => { const q = M.quotas(pops, h), s = q.map(Math.floor); let left = h - s.reduce((a, b) => a + b, 0);
    q.map((x, i) => [fr(x), i]).sort((a, b) => b[0] - a[0]).slice(0, left).forEach(e => { s[e[1]]++; }); return s; };
  eq([plain(299)[idx('AL')], plain(300)[idx('AL')]], [8, 8], 'no minimum: Alabama keeps 8 at 300');
  const par = M.paradoxes(pops, M.hamilton, 275, 350);
  eq(par.map(p => [p.from, p.to, M.POP1880[p.state][0]]), [[286, 287, 'FL'], [299, 300, 'AL'], [306, 307, 'GA'], [339, 340, 'ME']], 'four Alabama-type paradoxes');
  eq(M.paradoxes(pops, M.huntingtonHill, 275, 350).length, 0, 'Huntington-Hill: none');
  for (let h = 275; h <= 350; h++) { eq(M.hamilton(pops, h).seats.reduce((a, b) => a + b, 0), h, 'Hamilton sums to ' + h); eq(M.huntingtonHill(pops, h).seats.reduce((a, b) => a + b, 0), h, 'HH sums to ' + h); }
}

/* ch8: districts */
{
  const gold = M.PARTY.reduce((a, b) => a + b, 0); eq([gold, 81 - gold], [35, 46], '35 gold, 46 cyan');
  const seats = {}; M.MAP_KEYS.forEach(k => { const r = M.districtResult(M.PARTY, M.MAPS[k]); ok(r.valid.equal && r.valid.contiguous, k + ' valid'); seats[k] = r.seatsGold;
    const V = gold / 81, S = r.seatsGold / 9; near(r.efficiencyGap, 2 * (V - 0.5) - (S - 0.5), 1e-12, k + ': EG = 2(V-1/2) - (S-1/2)'); });
  eq(seats, { blocks: 3, rows: 3, cols: 4, crackGold: 1, crackCyan: 6 }, 'seats by map');
  eq((gold / 81 * 9).toFixed(1), '3.9', 'proportional share about 4 seats');
  const cg = M.districtResult(M.PARTY, M.MAPS.crackGold);
  ok(cg.rows.some(r => r.gold === 9), 'one all-gold district'); ok(cg.rows.filter(r => r.gold !== 9).every(r => r.gold < 5), 'gold short of 5 elsewhere');
  eq((cg.efficiencyGap * 100).toFixed(1), '25.3', 'EG crackGold 25.3%');
  eq((M.districtResult(M.PARTY, M.MAPS.crackCyan).efficiencyGap * 100).toFixed(1), '-30.2', 'EG crackCyan -30.2%');
}

/* ch9: jury theorem */
{
  eq((M.jury(11, 0.6, 0) * 100).toFixed(0), '75', 'p=.6, n=11: 75%');
  eq((M.jury(101, 0.6, 0) * 100).toFixed(0), '98', 'p=.6, n=101: 98%');
  eq((M.jury(101, 0.45, 0) * 100).toFixed(0), '16', 'p=.45, n=101: 16%');
  eq((M.jury(301, 0.45, 0) * 100).toFixed(0), '4', 'p=.45, n=301: 4%');
  const cstar = 1 - 1 / (2 * 0.6); near(cstar, 1 / 6, 1e-12, 'threshold 1/6'); eq((cstar * 100).toFixed(0), '17', '17%');
  eq(M.juryLimit(0.6, cstar + 0.001), 0.6, 'above threshold: limit = p'); eq(M.juryLimit(0.6, cstar - 0.001), 1, 'below: limit 1');
  near(M.jury(2001, 0.6, 0.3), 0.6, 1e-6, 'large n with copying tends to 0.6');
  near(M.jury(1, 0.6, 0), 0.6, 1e-12, 'one voter = p');
}

console.log(`same-votes-different-winner models: ${n} checks passed`);
