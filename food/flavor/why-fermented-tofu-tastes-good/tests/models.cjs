'use strict';
// Pins every number the essay's prose states to the page's own models (or to the measured values in models.js
// that the prose quotes), checks that copy.zh.js still says exactly that number, and evaluates every live
// sentence branch at the extremes of its controls. Run: node food/flavor/why-fermented-tofu-tastes-good/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const M = require(path.join(DIR, 'models.js'));
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;
const { fmt, pct } = M;

let n = 0, fails = 0;
function check(name, got, want) { n++; if (got !== want) { fails++; console.error(`FAIL ${name}: model gives ${got}, expected ${want}`); } }
function says(key, phrase) { n++; if (!Z[key] || !Z[key].includes(phrase)) { fails++; console.error(`FAIL prose ${key} should contain "${phrase}"`); } }
const f = (x, d) => x.toFixed(d);
const P = x => f(x * 100, 0) + '%';

/* ── ch1 random scission ── */
{
  const S = M.scission, D = M.data;
  says('ch1.p1', '约 ' + D.tofuTotal + ' 毫克'); says('ch1.p1', '只有 ' + D.tofuFree + ' 毫克'); says('ch1.p1', '约 ' + f(D.tofuFree / D.tofuTotal * 100, 2) + '%');
  check('ch1 half cut → quarter free (long chain)', f(S.freeFraction(0.5, 1e7), 3), '0.250'); says('ch1.p3', '切开一半的键，只有大约四分之一');
  check('ch1 exact formula at N=2', S.freeFraction(0.3, 2), 0.3); check('ch1 N=1 is free', S.freeFraction(0, 1), 1);
  // the sampled chains converge on the formula
  const sm = S.sample(3, 400, 40, 0.5); check('ch1 Monte Carlo ≈ formula', Math.abs(sm.free - S.freeFraction(0.5, 40)) < 0.01, true);
  const r8 = D.red8.d80 / D.saltedTotal;
  says('ch1.p4', '从 ' + D.red8.d0 + ' 毫克升到 ' + D.red8.d80 + ' 毫克'); says('ch1.p4', '约 ' + D.saltedTotal + ' 毫克');
  check('ch1 red sufu free share', P(r8), '25%'); says('ch1.p4', '游离的约占 25%');
  check('ch1 red sufu bonds cut', P(S.pForFree(r8)), '50%'); says('ch1.p4', '切开约 50% 的肽键');
  const lo = D.faa[0] / Math.max(...D.taa), hi = D.faa[1] / Math.min(...D.taa);
  check('ch1 commercial free share', f(lo * 100, 0) + '%–' + f(hi * 100, 1) + '%', '6%–8.5%'); says('ch1.p4', '约 6%–8.5%');
  check('ch1 commercial bonds cut', P(S.pForFree(lo)) + '–' + P(S.pForFree(hi)), '25%–29%'); says('ch1.p4', '约 25%–29%');
  says('ch1.p4', '约 18–24 克/千克'); check('ch1 faa range', Math.floor(D.faa[0]) + '–' + Math.round(D.faa[1]), '18–24');
  says('ch1.p4', '约 281–294 克/千克'); check('ch1 taa range', Math.floor(Math.min(...D.taa)) + '–' + Math.ceil(Math.max(...D.taa)), '281–294');
  check('ch1 tens to a hundred times', Math.round(lo / (D.tofuFree / D.tofuTotal)) >= 20 && Math.round(r8 / (D.tofuFree / D.tofuTotal)) <= 110, true); says('ch1.p4', '几十到一百倍');
  check('ch1 need for a quarter', pct(S.pForFree(0.25)), '50%');
}

/* ── ch2 endo + exo ── */
{
  const E = M.enzymes;
  says('ch2.p1', '从 1.3 毫克升到 15.6 毫克'); check('ch2 pehtze', M.data.pehtzeFree, 15.6);
  // endo-only population balance equals Montroll–Simha with p = 1 − e^(−kE t)
  const en = E.run('endo', 80, 0.25, 80), ex = E.run('exo', 80, 0.25, 80), bo = E.run('both', 80, 0.25, 80);
  check('ch2 endo ODE = Montroll–Simha', f(en[1].free, 8), f(M.scission.freeFraction(1 - Math.exp(-E.kE * 80), E.N), 8));
  check('ch2 residue mass conserved', f(bo[1].hist.reduce((s, x, L) => s + x * L, 0), 6), f(E.N, 6));
  check('ch2 endo day 80', pct(en[1].free, 1), '2.3%'); says('ch2.p3', '只用内切酶时游离的约 2.3%');
  check('ch2 exo day 80', pct(ex[1].free, 1), '1.8%'); says('ch2.p3', '只用外切酶约 1.8%');
  check('ch2 sum under 5%', en[1].free + ex[1].free < 0.05, true); says('ch2.p3', '加起来不到 5%');
  check('ch2 both day 80', P(bo[1].free), '25%'); says('ch2.p3', '两种一起是 25%');
  check('ch2 synergy ×', f(bo[1].free / (en[1].free + ex[1].free), 0), '6'); says('ch2.p3', '约为两者之和的 6 倍');
  // reviewer: the multiple depends on the tuned rates; halve or double each and report the range the prose states
  { const k0 = E.kE, x0 = E.kX, ratios = [];
    for (const [a, b] of [[k0 / 2, x0], [k0 * 2, x0], [k0, x0 / 2], [k0, x0 * 2]]) { E.kE = a; E.kX = b; const fr = m => E.run(m, 80, 0.25, 80)[1].free; ratios.push(fr('both') / (fr('endo') + fr('exo'))); }
    E.kE = k0; E.kX = x0;
    check('ch2 synergy range under ×½/×2 rates', f(Math.min(...ratios), 0) + '–' + f(Math.max(...ratios), 0), '4–7'); says('ch2.p3', '在约 4–7 倍之间变');
    const rt = [10, 30, 80].map(d => { const fr = m => E.run(m, d, 0.25, d)[1].free; return fr('both') / (fr('endo') + fr('exo')); });
    check('ch2 together always more than the sum, growing with time', rt[0] > 1 && rt[1] > rt[0] && rt[2] > rt[1], true); says('ch2.p3', '切得越久差得越多'); }
  const d10 = E.run('both', 10, 0.25, 10)[1]; check('ch2 mean peptide day 10', f(d10.mean, 0), '41'); says('ch2.p4', '从 200 降到约 41 个氨基酸');
  check('ch2 chain length', E.N, 200); says('ch2.model.how', '一条 200 个氨基酸的链在汤料里放 90 天');
  // all sentence branches, at the start and at day 90
  for (const m of ['endo', 'exo', 'both']) {
    const r = E.run(m, 90, 0.25, 90);
    for (const [row, done] of [[r[0], false], [r[1], true]]) { const s = M.say.enzymes(m, row, done); check('ch2 say key ' + m + done, Z[s.key] != null, true); }
  }
  says('ch2.say.exo', '{mean}');
}

/* ── ch3 umami ── */
{
  const U = M.umami, F = U.FOOD, D = M.data;
  says('ch3.p2', '每千克 1.29–1.76 克'); says('ch3.p2', '每 100 克 129–176 毫克'); check('ch3 sufu glu mid', F.sufu.glu, (D.gluFree[0] + D.gluFree[1]) / 2 * 100);
  check('ch3 TAV range', f(129 / U.TH.glu, 1) + '–' + f(176 / U.TH.glu, 1), '4.3–5.9'); says('ch3.p2', '约为阈值的 4.3–5.9 倍'); says('ch3.p2', '约为每 100 克 30 毫克');
  const share = D.gluTotal.map((g, i) => g / D.taa[i] * 100);
  check('ch3 Glu share of total', f(Math.min(...share), 0) + '–' + f(Math.max(...share), 0), '14–22'); says('ch3.p2', '占 14–22%');
  check('ch3 sufu EUC', f(U.euc(F.sufu), 2), '0.16'); says('ch3.p3', '腐乳自己算出来约 0.16 克');
  check('ch3 pork EUC', f(U.euc(F.pork), 2), '2.81'); says('ch3.p3', '猪肉约 2.81 克');
  check('ch3 20% mix', f(U.euc(U.mix(F.sufu, F.pork, 0.2)), 2), '8.92'); says('ch3.p3', '是 8.92 克');
  const add = 0.2 * U.euc(F.sufu) + 0.8 * U.euc(F.pork); check('ch3 additive', f(add, 2), '2.28'); says('ch3.p3', '只有 2.28 克');
  check('ch3 best mix', P(U.bestMix(F.sufu, F.pork).w), '47%'); says('ch3.p3', '腐乳约占 47% 时');
  says('ch3.p3', '天冬氨酸 0.077'); check('ch3 Asp', U.AA.asp, 0.077); says('ch3.p3', '乘上 1218'); check('ch3 K', U.K, 1218);
  check('ch3 default slider is the 1:4 mix', /id="umW"[^>]*value="20"/.test(fs.readFileSync(path.join(DIR, 'index.html'), 'utf8')), true);
  for (const w of [0, 0.01, 0.2, 0.99, 1]) { const s = M.say.umami(w); check('ch3 say ' + w, Z[s.key] != null, true); }
  check('ch3 say zero', M.say.umami(0).key, 'ch3.say.zero'); check('ch3 say one', M.say.umami(1).key, 'ch3.say.one');
  check('ch3 say 20% numbers', M.say.umami(0.2).v.euc + '/' + M.say.umami(0.2).v.add + '/' + M.say.umami(0.2).v.x, '8.92/2.28/3.9');
}

/* ── ch4 water activity ── */
{
  const W = M.water;
  // Pitzer against Hamer & Wu reference osmotic coefficients (via Staples & Nuttall 1977, Table 2)
  const HW = [[0.1255, 0.9294], [0.3034, 0.9207], [0.5617, 0.9223], [0.9232, 0.9327], [1.325, 0.9492], [1.963, 0.9816], [2.988, 1.0444], [3.937, 1.1109], [4.865, 1.181], [6.008, 1.2706]];
  const dmax = Math.max(...HW.map(([m, p]) => Math.abs(W.phi(m) - p)));
  check('ch4 Pitzer within 0.005 of Hamer & Wu', dmax < 0.005, true); says('ch4.p2', '误差不到 0.005');
  check('ch4 aw 8%', f(W.aw(8), 3), '0.950'); says('ch4.p2', '8% 的盐水 a<sub>w</sub> 是 0.950');
  check('ch4 aw 14%', f(W.aw(14), 3), '0.902'); says('ch4.p2', '14% 是 0.902');
  check('ch4 at 14% only S. aureus', W.growers(W.aw(14)).join(','), 'saurT,saur');
  check('ch4 at 14% growth not toxin', W.aw(14) < 0.92 && W.aw(14) >= 0.88, true);
  says('ch4.p2', '沙门氏菌最低要 0.94'); says('ch4.p2', 'A/B 型要 0.94'); says('ch4.p2', '李斯特菌要 0.92'); says('ch4.p2', '需要 0.88');
  check('ch4 limits', ['salm', 'botAB', 'list', 'saurT'].map(id => W.LIMITS.find(l => l.id === id).aw).join(','), '0.94,0.94,0.92,0.88');
  check('ch4 brine for 0.88', f(W.wForAw(0.88), 1), '16.3'); says('ch4.p2', '约 16.3% 的盐水');
  const r = W.HAN.map(h => W.rate(h));
  check('ch4 Han rates', r.map(x => f(x, 2)).join('/'), '0.75/0.44/0.20'); says('ch4.p3', '每天分别涨 0.75（8% 盐）、0.44（11%）和 0.20（14%）');
  check('ch4 fit zero', f(W.fit().zero, 0), '16'); says('ch4.p3', '涨速到约 16% 盐时降为零');
  check('ch4 days', [8, 11, 14].map(s => f(W.daysTo(s, 32), 0)).join('/'), '43/69/171'); says('ch4.p3', '8% 盐要约 43 天，11% 要约 69 天，14% 要约 171 天');
  says('ch4.p3', '多涨 32 毫克/克'); says('ch4.read.days', '32 毫克/克');
  check('ch4 saturation aw', f(W.aw(30), 3), f(W.aw(26.4), 3));
  for (const w of [0, 0.5, 8, 14, 20, 26, 26.4]) { const s = M.say.water(w); check('ch4 say ' + w, Z[s.key] != null, true); }
  check('ch4 say at 26 lists none', M.say.water(26).v.list.k, 'ch4.say.none');
  check('ch4 say at 26.4 saturated', M.say.water(26.4).key, 'ch4.say.sat'); says('ch4.say.sat', '26.4%');
  check('ch9 below 8% aw above 0.95', W.aw(7.9) > 0.95 && W.aw(8) >= 0.95 - 5e-4, true); says('ch9.na', 'a<sub>w</sub> 升到 0.95 以上');
  // reviewer: at 8% brine six of the nine organisms in the table can already grow (the first version implied none)
  check('ch9 growers at 8%', W.growers(W.aw(8)).length + '/' + W.LIMITS.length, '6/9'); says('ch9.na', '表里九种致病菌有六种'); says('ch9.na', '8% 的盐水，a<sub>w</sub> 也有 0.950');
  check('ch9 more grow below 8%', W.growers(W.aw(7)).length > 6, true);
  // soy sauce brine through the same model
  check('ch7 soy brine aw', f(W.aw(M.data.soyBrine[0]), 2) + '–' + f(W.aw(M.data.soyBrine[1]), 2), '0.87–0.84'); says('ch7.p4', '约在 0.87–0.84 之间'); says('ch7.r.soy.guard', '17–20%');
}

/* ── ch5 odour activity ── */
{
  const A = M.aroma;
  const row = (id, d) => A.table(d).find(r => r.id === id);
  check('ch5 day-7 top by concentration', A.byConc(7)[0].id, 'butanoic');
  check('ch5 butanoic day 7', f(row('butanoic', 7).conc, 2) + '/' + f(row('butanoic', 7).oav, 0), '4.17/20'); says('ch5.p3', '每千克 4.17 毫克，阈值 0.204，气味活度值约 20');
  check('ch5 decadienal day 7', f(row('decadienal', 7).conc, 3) + '/' + fmt(row('decadienal', 7).oav), '0.298/11,037'); says('ch5.p3', '每千克 0.298 毫克，阈值却只有 0.000027，气味活度值约 11,037');
  check('ch5 hexyl acetate day 13', f(row('hexylacetate', 13).conc, 3) + '/' + f(row('hexylacetate', 13).oav, 0), '1.862/931'); says('ch5.p3', '乙酸己酯每千克 1.862 毫克，气味活度值约 931');
  for (const d of A.DAYS) { const s = M.say.aroma(d); check('ch5 say day ' + d, Z[s.key] != null && Z[s.v.topc.k] != null && Z[s.v.topo.k] != null, true); }
  check('ch5 default day is 7', /name="odDay" value="7" checked/.test(fs.readFileSync(path.join(DIR, 'index.html'), 'utf8')), true);
  for (const x of A.C) check('ch5 name ' + x.id, Z['ch5.cmp.' + x.id] != null, true);
  // reviewer: every compound in the paper with both a concentration and a threshold is in the model
  check('ch5 compounds', String(A.C.length), '28'); says('ch5.p2', '两样都有的 28 种'); says('ch5.read.n', '28');
  check('ch5 day-7 top by OAV is still decadienal', A.byOav(7)[0].id, 'decadienal');
  for (const d of A.DAYS) check('ch5 top OAV day ' + d, A.byOav(d)[0].id, 'decadienal');
}

/* ── ch6 century egg ── */
{
  const E = M.egg;
  check('ch6 70 g radius', f(E.radius(70) * 100, 1), '2.5');
  check('ch6 white reaches 80% in ~6 d', f(E.dayWhen('white', 0.8), 0), '6'); says('ch6.p3', '蛋清平均值在约 6 天');
  check('ch6 yolk reaches 80% in ~18 d', Math.round(E.dayWhen('yolk', 0.8)) >= 18 && Math.round(E.dayWhen('yolk', 0.8)) <= 19, true); says('ch6.p3', '蛋黄在约 18 天');
  says('ch6.p2', '头 6 天'); says('ch6.p2', '在 18 天里');
  check('ch6 D', E.D, 7e-11); says('ch6.p3', '约 7×10⁻¹¹ m²/s');
  check('ch6 Nernst–Hartley', f(E.DWATER * 1e9, 2), '2.12'); says('ch6.p3', '约 2.12×10⁻⁹ m²/s');
  check('ch6 ratio', f(E.DWATER / E.D, 0), '30'); says('ch6.p3', '快约 30 倍');
  // Crank series sanity: the analytic total uptake 1 − 6/π² Σ e^(−Dn²π²t/a²)/n² equals the volume mean of u
  { const a = E.radius(70), t = 5 * 86400; let s = 0; for (let k = 1; k < 400; k++) s += Math.exp(-E.D * k * k * Math.PI * Math.PI * t / (a * a)) / (k * k);
    check('ch6 Crank mean = total uptake', f(E.mean(0, 1, a, t, null, 400), 3), f(1 - 6 / (Math.PI * Math.PI) * s, 3)); }
  check('ch6 4% plateau', f(E.KAPPA * 4, 1), '0.8'); says('ch6.p4', '4% 的料把蛋清停在 0.8%'); says('ch6.p4', '0.8% 最好');
  check('ch6 6% crosses 1.0%', f(E.dayOver(6, 70), 1), '7.3'); says('ch6.p4', '6% 的料在第 7.3 天就越过 1.0%');
  says('ch6.p4', '低于 0.5% 不成胶，高于 1.0%'); check('ch6 window', E.GEL.join('–'), '0.5–1');
  check('ch6 kappa is a fifth', E.KAPPA, 1 / 5); says('ch6.p4', '料里的五分之一');
  // reviewer: the 7.3-day figure scales as 1/D; the prose says what halving the tuned D does
  check('ch6 6% crossing with D/2', f(E.dayWhen('white', E.GEL[1] / (E.KAPPA * 6), 70, E.D / 2), 1), '14.6'); says('ch6.p4', '翻倍到约 14.6 天');
  check('ch6 bigger egg takes longer', E.dayWhen('white', 0.8, 90) > E.dayWhen('white', 0.8, 50), true);
  // every sentence branch at the slider extremes
  const keys = new Set();
  for (const b of [2, 2.5, 4, 5, 5.5, 8]) for (const g of [50, 90]) for (const d of [0, 10, 42]) { const s = M.say.egg(b, g, d, 42); keys.add(s.key); check(`ch6 say ${b}/${g}/${d}`, Z[s.key] != null && !Object.values(s.v).some(x => x === '—'), true); }
  check('ch6 all branches reached', [...keys].sort().join(','), 'ch6.say.gel,ch6.say.low,ch6.say.over,ch6.say.wait');
  check('ch6 default bath 4', /id="egB"[^>]*value="4"/.test(fs.readFileSync(path.join(DIR, 'index.html'), 'utf8')), true);
}

/* ── ch7 taste activity ── */
{
  const U = M.umami, F = U.FOOD;
  says('ch7.p1', '17.45 毫克降到 13.14 毫克'); check('ch7 yolk glu', F.yolkFresh.glu + '/' + F.yolkPreserved.glu, '17.45/13.14');
  check('ch7 yolk TAVs', f(U.tav(F.yolkFresh.glu, 'glu'), 2) + '/' + f(U.tav(F.yolkPreserved.glu, 'glu'), 2), '0.58/0.44');
  check('ch7 IMP fell', F.yolkPreserved.imp < F.yolkFresh.imp, true);
  check('ch7 yolk total FAA fell', F.yolkFresh.faa + '/' + F.yolkPreserved.faa, '140.72/106.92'); says('ch7.p1', '140.72 毫克降到 106.92 毫克');
  check('ch7 succinic TAVs', f(U.tav(F.yolkFresh.succinic, 'succinic'), 1) + '/' + f(U.tav(F.yolkPreserved.succinic, 'succinic'), 1), '26.3/26.5');
  for (const w of ['glu', 'succ']) { const s = M.say.tav(w); check('ch7 say ' + w, Z[s.key] != null, true); }
  check('ch7 say glu', JSON.stringify(M.say.tav('glu').v), JSON.stringify({ s: '4.3–5.9', f: '0.582', p: '0.438' }));
}

/* ── ch8 dilution ── */
{
  const A = M.aroma;
  check('ch8 day 7 at 100×', A.smelled(7, 100).map(r => r.id).sort().join(','), ['cresol', 'decadienal', 'decenal', 'octenol'].sort().join(','));
  says('ch8.p2', '冲淡 100 倍，还闻得到的只剩 2,4-癸二烯醛、2-癸烯醛、1-辛烯-3-醇和对甲酚这四种');
  check('ch8 day 7 at 1000×', A.smelled(7, 1000).map(r => r.id).join(','), 'decadienal'); says('ch8.p2', '冲淡 1000 倍，只剩癸二烯醛');
  for (const d of A.DAYS) for (const l of [0, 2, 4]) { const s = M.say.dilution(l, d); check(`ch8 say ${d}/${l}`, Z[s.key] != null, true); }
  check('ch8 at 10⁴ day 1 nothing left', M.say.dilution(4, 1).key, 'ch8.say.none');
  check('ch8 at 10⁴ day 7 one left', M.say.dilution(4, 7).v.n, '1');
}

/* ── ch9 standards (pinned to the constants the BRIEF lists) ── */
{
  const S = M.facts;
  says('ch9.na', '中位数是每 100 克 ' + S.sodium.median + ' 毫克'); says('ch9.na', '四分位范围 ' + S.sodium.q1 + '–' + S.sodium.q3); says('ch9.na', '最低 ' + S.sodium.min + '、最高 ' + S.sodium.max);
  says('ch9.na', S.sodium.n + ' 种'); says('ch9.na', '少于 ' + S.sodium.who + ' 毫克');
  says('ch9.amine', '每千克 ' + f(S.amines.total, 2) + ' 毫克'); says('ch9.amine', '酪胺 ' + f(S.amines.tyramine, 2) + ' 毫克');
  check('ch9 tyramine over three quarters', S.amines.tyramine / S.amines.total > 0.75, true); says('ch9.amine', '占四分之三以上');
  says('ch9.amine', '每千克 ' + S.amines.guide + ' 毫克'); says('ch9.amine', '组胺 ' + S.amines.efsaHis + ' 毫克、酪胺 ' + S.amines.efsaTyr + ' 毫克');
  says('ch9.lead', '每千克 ' + S.lead.egg2017 + ' 毫克'); says('ch9.lead', '放宽到 ' + S.lead.pidan2017); says('ch9.lead', '从 ' + S.lead.bean2017 + ' 收紧到 ' + S.lead.bean2022); says('ch9.lead', '2026 年 9 月 2 日起取代'); says('ch9.lead', '不是检测为零');
}

/* ── the page's default controls are the states the prose describes ── */
{
  const html = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
  const val = id => { const m = html.match(new RegExp('id="' + id + '"[^>]*value="([^"]+)"')); return m && m[1]; };
  const want = { scP: '50', umW: '20', awW: '8', egB: '4', egG: '70', fdF: '2' };
  for (const [id, v] of Object.entries(want)) check('default ' + id, val(id), v);
  check('default enMode both', /name="enMode" value="both" checked/.test(html), true);
  check('default fdDay 7', /name="fdDay" value="7" checked/.test(html), true);
  for (const p of [0, 0.01, 0.5, 1]) check('ch1 say ' + p, Z[M.say.scission(p).key] != null, true);
}

/* ── every placeholder used in copy is filled; every key exists; no Chinese outside copy ── */
{
  const app = fs.readFileSync(path.join(DIR, 'app.js'), 'utf8'), mod = fs.readFileSync(path.join(DIR, 'models.js'), 'utf8');
  for (const [k, v] of Object.entries(Z)) for (const m of v.matchAll(/\{(\w+)\}/g)) {
    n++; if (!new RegExp('(\\b' + m[1] + '\\s*:|\\.' + m[1] + '\\s*=)').test(app + mod)) { fails++; console.error(`FAIL placeholder {${m[1]}} in ${k} is never supplied`); }
  }
  const html = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
  const keys = new Set([...html.matchAll(/data-(?:i18n(?:-html|-aria)?|hk)="([^"]+)"/g)].map(m => m[1]));
  for (const m of app.matchAll(/\bt\('([\w.]+)'/g)) if (/^[\w]+\.[\w.]*\w$/.test(m[1])) keys.add(m[1]);
  for (const id of M.water.LIMITS.map(l => l.id)) keys.add('ch4.org.' + id);
  for (const g of ['fat', 'green', 'stink', 'fruit']) keys.add('ch5.leg.' + g);
  for (const p of ['liquid', 'gel', 'over']) keys.add('ch6.phase.' + p);
  for (const m of ['endo', 'exo', 'both']) { keys.add('ch2.mode.' + m); keys.add('ch2.say.' + m); }
  for (const k of keys) { n++; if (Z[k] == null) { fails++; console.error('FAIL missing zh key ' + k); } }
  for (const file of ['index.html', 'app.js', 'models.js']) {
    // the static Chinese <title> and meta description are required for crawlers (BRIEF-BATCH3); they must equal the copy
    let src = fs.readFileSync(path.join(DIR, file), 'utf8');
    if (file === 'index.html') {
      const tt = src.match(/<title>([^<]*)<\/title>/)[1], md = src.match(/<meta name="description" content="([^"]*)">/)[1];
      check('static title = doc.title', tt, Z['doc.title']); check('static meta = doc.desc', md, Z['doc.desc']);
      src = src.replace(/<title>[^<]*<\/title>/, '').replace(/<meta name="description" content="[^"]*">/, '');
      // The site's static provenance label (specs/visual-page-provenance.md) is bilingual by contract, not essay copy;
      // it is removed before the // comment rule, which would otherwise cut its commit URL.
      src = src.replace(/<details class="page-provenance"[\s\S]*?<\/details>/, '');
    }
    src = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '').replace(/<!--[\s\S]*?-->/g, '');
    n++;
    const others = (src.match(/[一-鿿]+/g) || []).filter(x => !(file === 'index.html' && x === '中'));
    if (others.length) { fails++; console.error(`FAIL Chinese text in ${file}: ${others.slice(0, 3).join(' ')}`); }
  }
  // REGISTRY title/desc equal the copy, anchors exist
  const R = JSON.parse(fs.readFileSync(path.join(DIR, 'REGISTRY.json'), 'utf8'));
  check('registry title', R.title.zh, Z['doc.title'].split(' · ')[0]); check('registry desc', R.desc.zh, Z['doc.desc']);
  for (const c of R.concepts) check('anchor ' + c.anchor, html.includes('id="' + c.anchor.slice(1) + '"'), true);

  /* reviewer: the English copy. Same keys; the same placeholders per key; the same numbers per key as the Chinese
     (thousands separators ignored), so a number fixed in zh cannot silently stay stale in en; registry = copy. */
  const ectx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.en.js'), 'utf8'), ectx);
  const EN = ectx.window.ESSAY_COPY.en;
  check('en keys = zh keys', Object.keys(EN).sort().join('|'), Object.keys(Z).sort().join('|'));
  const ph = s => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');
  // chapter cross-references (第三章 / Chapter 3) and month numbers in dates (9 月 / September) are written differently
  const norm = (s, zh) => zh ? s.replace(/\d+ 月/g, ' ') : s.replace(/Chapters? \d+(?:(?:–|-| and |, )\d+)*/g, ' ');
  const nums = (s, zh) => (norm(s.replace(/<[^>]*>/g, ' '), zh).match(/\d+(?:[.,]\d+)*/g) || []).map(x => x.replace(/,(?=\d{3}\b)/g, '')).sort().join(' ');
  for (const k of Object.keys(Z)) {
    if (EN[k] == null) continue;
    check('en placeholders ' + k, ph(EN[k]), ph(Z[k]));
    if (k === 'footer' || k === 'ch5.unit.d') continue; // footer lists sources by year in different order; checked by eye
    if (k.startsWith('ch5.cmp.')) continue; // compound names: English uses common names (isovaleric acid) without locant digits
    check('en numbers ' + k, nums(EN[k], false), nums(Z[k], true));
  }
  check('registry title en', R.title.en, EN['doc.title'].split(' · ')[0]); check('registry desc en', R.desc.en, EN['doc.desc']);
}

if (fails) { console.error(`\n${fails} of ${n} checks failed`); process.exit(1); }
console.log(`PASS: ${n} checks (every number in the prose matches the models)`);
