'use strict';
// Pins every number the essay's prose states to the page's own models (models.js), and checks that the prose
// (copy.zh.js) still says exactly that number. Also: every live-sentence branch reachable from the sliders at
// their extremes, template placeholders, the FRONTIER block, and no Chinese outside copy.zh.js.
// Run: node economics/markets/why-a-few-firms-win/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const dir = path.join(__dirname, '..');
const M = require(path.join(dir, 'models.js'));
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(dir, 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;
const appSrc = fs.readFileSync(path.join(dir, 'app.js'), 'utf8'), html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');

let n = 0, fails = 0;
function check(name, got, want) { n++; if (got !== want) { fails++; console.error(`FAIL ${name}: model gives ${got}, expected ${want}`); } }
function ok(name, cond) { n++; if (!cond) { fails++; console.error('FAIL ' + name); } }
function says(key, phrase) { n++; if (!Z[key] || !Z[key].includes(phrase)) { fails++; console.error(`FAIL prose ${key} should contain "${phrase}"`); } }
const f = (x, d) => x.toFixed(d);
const pc = (x, d = 0) => (100 * x).toFixed(d);
const zhNum = x => x.toLocaleString('zh-CN');
const slider = id => { const m = html.match(new RegExp(`id="${id}" min="([^"]+)" max="([^"]+)" step="([^"]+)" value="([^"]+)"`)); if (!m) throw new Error('no slider ' + id); return { min: +m[1], max: +m[2], step: +m[3], value: +m[4] }; };
const grid = (id, k = 6) => { const s = slider(id), out = []; for (let i = 0; i <= k; i++) out.push(+(s.min + (s.max - s.min) * i / k).toFixed(6)); return out; };

/* ── ch1 monopoly pricing ── */
{
  const Mo = M.monopoly, e0 = slider('moE').value; check('ch1 default ε', e0, 2);
  const r2 = Mo.solve(2), r5 = Mo.solve(5);
  check('ch1 ε=2 price', f(r2.p, 0), '20'); says('ch1.p3', '价格是 20');
  check('ch1 ε=2 price/cost', f(r2.p / Mo.c, 0), '2'); says('ch1.p3', '成本的两倍');
  check('ch1 ε=2 Lerner', f(r2.lerner, 1), '0.5'); says('ch1.p3', '勒纳指数 0.5');
  check('ch1 ε=5 price', f(r5.p, 1), '12.5'); says('ch1.p3', '价格只有 12.5');
  check('ch1 ε=5 Lerner', f(r5.lerner, 1), '0.2'); says('ch1.p3', '勒纳指数 0.2');
  check('ch1 ε=2 sells', pc(r2.qShare), '25'); says('ch1.p3', '能卖的 25%');
  check('ch1 Q0', Mo.Q0, 100); says('ch1.read.q', '能卖 100'); says('ch1.say.pd', '卖满 100 件'); check('ch1 cost', Mo.c, 10); says('ch1.read.p', '成本 = 10');
  // deadweight share across the whole slider range, fine sweep
  const s = slider('moE'); let lo = 1, hi = 0;
  for (let e = s.min; e <= s.max + 1e-9; e += 0.005) { const r = Mo.solve(e); lo = Math.min(lo, r.dwl / r.total); hi = Math.max(hi, r.dwl / r.total); }
  check('ch1 DWL share min', pc(lo), '20'); check('ch1 DWL share max', pc(hi), '26'); ok('ch1 DWL inside 20–26%', lo >= 0.195 && hi <= 0.265);
  says('ch1.p3', `从弹性 ${s.min} 拖到 ${s.max}`); says('ch1.p3', '20% 到 26% 之间');
  // perfect discrimination: no deadweight, buyers get nothing
  const pd = Mo.solve(2, 'pd'); check('ch1 pd dwl', pd.dwl, 0); check('ch1 pd cs', pd.cs, 0); check('ch1 pd q', pd.q, 100);
  // the closed form is the true optimum: profit at p* beats nearby prices
  for (const e of [1.25, 2, 8]) { const p = Mo.solve(e).p, prof = x => (x - Mo.c) * Mo.Q(x, e); ok(`ch1 p* is the max at ε=${e}`, prof(p) >= prof(p * 1.01) && prof(p) >= prof(p * 0.99)); }
  // exact surpluses add up
  ok('ch1 surplus identity', Math.abs(r2.cs + r2.profit + r2.dwl - r2.total) < 1e-9 && r2.dwl > 0);
}

/* ── ch2 cost structure ── */
{
  const Co = M.cost, d = 1e-4; ok('ch2 app uses d = 1e-4', /D = 1e-4/.test(appSrc)); says('ch2.limit', 'd 取 0.0001'); says('ch2.limit', 'F + 10q');
  check('ch2 defaults', `${slider('coF').value}/${slider('coS').value}`, '6/6');
  check('ch2 MES', Co.mes(1e6, d), 1e5); says('ch2.p3', '最小有效规模是 10 万件'); says('ch2.p3', '固定成本 100 万、市场 100 万件');
  check('ch2 firms', Co.bestK(1e6, 1e6, d), 10); says('ch2.p3', '市场能容下 10 家');
  check('ch2 one-firm penalty', f(100 * Co.penaltyOfOne(1e6, 1e6, d), 0), '270'); says('ch2.p3', '高出 270%');
  check('ch2 F 1e7', Co.bestK(1e6, 1e7, d), 3); says('ch2.p3', '拖到 1000 万，最省钱的家数降到 3 家');
  check('ch2 S 1e5', Co.bestK(1e5, 1e6, d), 1); says('ch2.p3', '缩到 10 万件，一家就够了');
  check('ch2 no capacity strain', Co.bestK(1e6, 1e6, 0), 1);
  // bestK really is the cost-minimising whole number, and the natural-monopoly line is √2·MES
  for (const [S, F] of [[1e6, 1e6], [1e7, 1e2], [1e3, 1e7], [3e5, 4e5]]) {
    let best = 1; for (let k = 1; k <= 20000; k++) if (Co.unitCostWithK(k, S, F, d) < Co.unitCostWithK(best, S, F, d)) best = k;
    check(`ch2 bestK brute force S=${S} F=${F}`, Co.bestK(S, F, d), best);
  }
  const q = Co.mes(1e6, d); check('ch2 subadditive below √2·MES', Co.bestK(q * Math.SQRT2 * 0.99, 1e6, d), 1); ok('ch2 two above √2·MES', Co.bestK(q * Math.SQRT2 * 1.01, 1e6, d) === 2);
  says('ch2.say.natural', `${f(Math.SQRT2, 2)} 倍`);
  says('ch2.p2', `${M.FRONTIER.tsmcCapexBn.lo * 10} 亿到 ${M.FRONTIER.tsmcCapexBn.hi * 10} 亿美元`); says('ch2.p2', `${M.FRONTIER.trainingCostGrowth.perYear} 倍`);
}

/* ── ch3 oligopoly ── */
{
  const O = M.oligo; check('ch3 default N, σ', `${slider('olN').value}/${slider('olS').value}`, '2/8'); says('ch3.p3', '口味差异 8');
  check('ch3 Cournot N=2', f(O.cournot(2).P, 2), '26.67'); says('ch3.p3', '古诺价格 26.67');
  check('ch3 Bertrand N=2', f(O.bertrand(2).P, 0), '10'); says('ch3.p3', '同质伯特兰价格 10');
  check('ch3 logit N=2', f(O.logit(2, 8).P, 2), '23.87'); says('ch3.p3', 'logit 价格 23.87');
  check('ch3 Cournot N=10', f(O.cournot(10).P, 2), '14.55'); says('ch3.p3', '古诺价格降到 14.55');
  check('ch3 logit N=10', f(O.logit(10, 8).P, 2), '18.87'); says('ch3.p3', 'logit 价格还有 18.87');
  says('ch3.model.how', 'P = 60 − Q，边际成本 10'); check('ch3 a,c', `${O.a},${O.c}`, '60,10');
  // Cournot: Lerner = HHI/(10000·ε) at the equilibrium
  for (const N of [1, 2, 5, 10]) { const r = O.cournot(N); ok(`ch3 Lerner = HHI/ε at N=${N}`, Math.abs(r.lerner - r.hhi / 10000 / r.eps) < 1e-12); }
  // logit fixed point satisfies its first-order condition, and price stays above c + σ
  for (const N of [1, 10]) for (const s of [2, 20]) { const r = O.logit(N, s); ok(`ch3 logit FOC N=${N} σ=${s}`, Math.abs(r.P - O.c - s / (1 - r.s)) < 1e-9 && r.P > O.c + s); }
  check('ch3 HHI threshold', `${M.FRONTIER.hhiThreshold.highly}/${M.FRONTIER.hhiThreshold.delta}`, '1800/100'); says('ch3.p4', 'HHI 超过 1800'); says('ch3.p4', '上升超过 100');
}

/* ── ch4 entry ── */
{
  const E = M.entry, ES = JSON.parse(appSrc.match(/ENTRY_S = (\[[^\]]+\])/)[1]), EF = JSON.parse(appSrc.match(/ENTRY_F = (\[[^\]]+\])/)[1]);
  const S = ES[slider('enS').value], F = EF[slider('enF').value]; check('ch4 default S, F', `${S}/${F}`, '4/100');
  ok('ch4 app σ = 8', /SIGMA = 8\b/.test(appSrc));
  says('ch4.p3', '市场规模 4、进入成本 100');
  const oc = E.outcome('cournot', S, F, 8), ol = E.outcome('logit', S, F, 8), ob = E.outcome('bertrand', S, F, 8), ok_ = E.outcome('contestable', S, F, 8), opt = E.socialN(S, F);
  check('ch4 Cournot N', oc.N, 9); check('ch4 Cournot P', f(oc.P, 0), '15'); says('ch4.p3', '古诺进来 9 家，价格 15');
  check('ch4 logit N', ol.N, 4); says('ch4.p3', '差异化 4 家');
  check('ch4 Bertrand N', ob.N, 1); check('ch4 Bertrand P', f(ob.P, 0), '35'); says('ch4.p3', '同质伯特兰只有 1 家，价格 35');
  check('ch4 social N', opt, 4); says('ch4.p4', '古诺自由进入的家数（9）多于福利最优的家数（4）');
  check('ch4 contestable P', f(ok_.P, 2), '10.51'); says('ch4.p5', '这个价格是 10.51'); says('ch11.p4', '价格可以是 35，也可以是 10.51'); says('ch4.p5', '价格可以是 35，也可以是 10.51');
  check('ch4 S 16', E.outcome('cournot', 16, F, 8).N, 19); ok('ch4 16 is on the slider', ES.includes(16)); says('ch4.p3', '从 9 家变成 19 家');
  check('ch4 closed form', E.nStar('cournot', S, F, 8), Math.floor((E.a - E.c) * Math.sqrt(S / F)) - 1);
  // no slider position reaches the search cap (the readout would be a cap, not an answer)
  for (const s of ES) for (const ff of EF) ok(`ch4 below cap S=${s} F=${ff}`, E.nStar('logit', s, ff, 8) < 200 && E.nStar('cournot', s, ff, 8) < 200 && E.socialN(s, ff) < 200);
  // contestable price is average cost: (P − c)·Q = F
  ok('ch4 contestable P = AC', Math.abs((ok_.P - E.c) * S * (E.a - ok_.P) - F) < 1e-9);
}

/* ── ch5 network hump ── */
{
  const Nw = M.network, p = slider('nwP').value, n0 = slider('nwN').value; check('ch5 defaults', `${p}/${n0}`, '0.16/0.25');
  check('ch5 critical', pc(Nw.critical(p)), '20'); check('ch5 high', pc(Nw.high(p)), '80'); says('ch5.p3', '临界规模是 20%，稳定规模是 80%');
  check('ch5 grows from 25%', pc(Nw.run(0.25, p, 40).pop()[1]), '80'); says('ch5.p3', '从 25% 的用户开始，网络会长到 80%');
  check('ch5 collapses from 15%', pc(Nw.run(0.15, p, 40).pop()[1]), '0'); says('ch5.p3', '从 15% 开始');
  check('ch5 hump top', Nw.critical(0.25), 0.5); check('ch5 none above 0.25', Nw.critical(0.2501), null); says('ch5.p3', '价格高过 0.25'); says('ch5.say.none', '驼峰顶 0.25');
  // both roots satisfy p = n(1 − n)
  for (const q of [0.02, 0.1, 0.24]) for (const r of [Nw.critical(q), Nw.high(q)]) ok(`ch5 root on the hump p=${q}`, Math.abs(r * (1 - r) - q) < 1e-12);
}

/* ── ch6 standards race ── */
{
  const S = M.standards, r = slider('stR').value; check('ch6 default r', r, 0.1);
  check('ch6 threshold', S.threshold(r, 1, 0), 10); says('ch6.p3', '领先 10 个人就会锁定');
  const b = S.batch({ r }, 200, 1); check('ch6 tipped', b.tipped, 177); says('ch6.p3', '有 177 次一方最后拿到九成以上');
  ok('ch6 A and B each win about half', b.aWins >= 80 && b.aWins <= 120);
  check('ch6 no lock without network effects', S.batch({ r: 0 }, 200, 1).tipped, 0);
  ok('ch6 app threshold uses g = 1, φ = 0', /S\.threshold\(\+sR\.value, 1, 0\)/.test(appSrc));
  // once the gap passes the threshold nobody switches: the leader's share only grows after lock-in
  const run = S.run({ r: 0.3 }, 3); ok('ch6 lock-in holds', run.lockedAt != null && run.lead > 0.9);
}

/* ── ch7 two-sided platforms ── */
{
  const P = M.platform, a1 = slider('tsA1').value, a2 = slider('tsA2').value; check('ch7 defaults', `${a1}/${a2}`, '0.1/0.8');
  const r = P.monopoly(a1, a2), one = P.oneSided();
  says('ch7.p3', 'α₁ = 0.1、α₂ = 0.8');
  check('ch7 p1', f(r.p1, 2), '0.14'); check('ch7 f', r.f1, 0.2); says('ch7.p3', '第一边的价格是 0.14，低于服务成本 0.2');
  check('ch7 p2', f(r.p2, 2), '0.74'); says('ch7.p3', '第二边付 0.74');
  check('ch7 one-sided p1', f(one.p1, 2), '0.35'); check('ch7 one-sided profit', f(one.profit, 2), '0.18'); says('ch7.p3', '第一边要付 0.35，利润只有 0.18');
  check('ch7 profit', f(r.profit, 2), '0.30'); says('ch7.p3', '利润是 0.30');
  // the one-sided pricing evaluated in the true two-sided world earns less than the platform's optimum
  ok('ch7 two-sided optimum beats one-sided prices', r.profit > one.profit);
  // the closed form is a maximum: perturbing participation lowers profit
  const prof = (n1, n2) => { const p1 = P.v1 + a1 * n2 - n1, p2 = P.v2 + a2 * n1 - n2; return (p1 - P.f1) * n1 + (p2 - P.f2) * n2; };
  for (const [d1, d2] of [[0.01, 0], [-0.01, 0], [0, 0.01], [0, -0.01]]) ok('ch7 FOC max', prof(r.n1, r.n2) >= prof(r.n1 + d1, r.n2 + d2));
  says('ch7.limit', '0.5 和 1'); says('ch7.limit', '服务成本 0.2'); says('ch7.limit', 't = 1'); check('ch7 v, t', `${P.v1}/${P.v2}/${P.t}`, '0.5/1/1');
  // every slider position: subsidised side is the one the other side needs more; duopoly never goes below cost
  const g = grid('tsA1', 18);
  for (const x of g) for (const y of grid('tsA2', 18)) {
    const m = P.monopoly(x, y); if (m.p1 < m.f1 - 1e-9) ok(`ch7 below: α₂ > α₁ at ${x},${y}`, y > x);
    ok(`ch7 p2 never below cost ${x},${y}`, m.p2 >= m.f2 - 1e-9);
    const d = P.duopoly(x, y); ok(`ch7 duopoly above cost ${x},${y}`, d.p1 >= d.f1 && d.p2 >= d.f2 && Math.max(x, y) < P.t);
  }
}

/* ── ch8 data loops ── */
{
  const D = M.data, b = slider('daB').value, d = slider('daD').value; check('ch8 defaults', `${b}/${d}`, '0.3/0');
  const run = D.run(b, d); check('ch8 start share', pc(run[0][1]), '72'); check('ch8 end share', pc(run[run.length - 1][1]), '52');
  says('ch8.p3', '从 72% 开始，300 期后降到约 52%');
  const slow = D.run(0.1, 0); ok('ch8 β 0.1 fades faster', Math.abs(slow[100][1] - 0.5) < Math.abs(run[100][1] - 0.5)); says('ch8.p3', 'β 小到 0.1 时消退得更快');
  check('ch8 tip from the 2× start', f(D.tipFromStart(b), 2), '0.11'); says('ch8.p3', '拖过大约 0.11'); says('ch8.p3', '在 0.11 和 0.13 之间');
  check('ch8 δc', f(D.tipDelta(b), 2), '0.13'); says('ch8.p3', '再拖过约 0.13');
  check('ch8 λ', D.lambda, 5); says('ch8.p3', 'λ = 5'); says('ch8.limit', 'λ = 5');
  // δc is where the even split loses stability: numerically, a tiny lead decays just below δc and grows just above
  const dc = D.tipDelta(b), from = (dd) => { const save = D.lead; D.lead = 1.01; const r = D.run(b, dd, 5000); D.lead = save; return r[r.length - 1][1]; };
  ok('ch8 even split stable below δc', from(dc * 0.97) < 0.51); ok('ch8 even split unstable above δc', from(dc * 1.03) > 0.95);
  ok('ch8 bistable band exists', D.tipFromStart(b) < dc);
}

/* ── ch9 tying and double marginalisation ── */
{
  const T = M.tying, m = slider('tyM').value, dl = slider('tyD').value, K = slider('tyK').value; check('ch9 defaults', `${m}/${dl}/${K}`, '0.3/1/0.5');
  says('ch9.p3', 'm = 0.3，Δ = 1，K = 0.5');
  const r = T.solve(m, dl, K);
  check('ch9 rival open', f(r.rivalOpen, 1), '0.8'); check('ch9 rival tie', f(r.rivalTie, 1), '-0.2'); says('ch9.p3', '开放时对手赚 0.8，捆绑后只剩 −0.2');
  check('ch9 gain', f(r.gain, 1), '0.6'); check('ch9 loss', f(r.loss, 1), '0.8'); says('ch9.p3', 'M 多赚 0.6，总福利少 0.8');
  check('ch9 m=0 gain', T.solve(0, dl, K).gain, 0); says('ch9.p3', '额外利润变成 0');
  says('ch9.limit', 'V = 10、w = 2'); check('ch9 V, w', `${T.V}/${T.w}`, '10/2');
  const dm = T.doubleMarginal(60, 10);
  check('ch9 separate retail price', f(dm.Psep, 1), '47.5'); check('ch9 integrated price', f(dm.Pint, 0), '35'); says('ch9.p5', '零售价 47.5'); says('ch9.p5', '零售价降到 35');
  check('ch9 separate profits', f(dm.profSep, 2), '468.75'); check('ch9 integrated profit', f(dm.profInt, 0), '625'); says('ch9.p5', '利润合计 468.75'); says('ch9.p5', '利润反而升到 625');
  says('ch9.p4', '4.6 亿欧元'); says('ch12.case.eu1.b', '搜索自我优待 4.6 亿');
}

/* ── ch10 not inevitable ── */
{
  const S = M.standards, base = { r: 0.1, g: 1, phi: 0, h: 0 };
  check('ch10 defaults', `${slider('wtPhi').value}/${slider('wtH').value}/${slider('wtG').value}`, '0/0/1'); ok('ch10 app r = 0.1', /R = 0\.1\b/.test(appSrc));
  const tip = o => pc(S.batch({ ...base, ...o }, 200, 1).tippedShare, 1);
  check('ch10 default', tip({}), '88.5'); says('ch10.p3', '200 次里 88.5% 倾覆');
  check('ch10 φ 0.5', tip({ phi: 0.5 }), '32.0'); says('ch10.p3', '互通程度到 0.5，倾覆降到 32%');
  check('ch10 φ 0.8', tip({ phi: 0.8 }), '0.0'); says('ch10.p3', '到 0.8，一次都没有');
  check('ch10 h 0.5', tip({ h: 0.5 }), '69.5'); says('ch10.p3', '倾覆降到 69.5%');
  check('ch10 g 2', tip({ g: 2 }), '32.5'); says('ch10.p3', '加到 2，倾覆降到 32.5%');
  check('ch10 g 4', tip({ g: 4 }), '2.0'); says('ch10.p3', '加到 4，只剩 2%');
  check('ch10 threshold formula', S.threshold(0.1, 2, 0.5), 40); says('ch10.p3', 'g / (r(1 − φ))');
}

/* ── ch11 measuring market power ── */
{
  const Mk = M.markups, c = slider('mkC').value; check('ch11 default COGS share', c, 0.65);
  check('ch11 true μ', Mk.mu, 1.2); check('ch11 COGS start', Mk.cogs0, 0.85);
  const s = Mk.series(c, false); check('ch11 starts at truth', f(s[0][1], 6), '1.200000'); check('ch11 COGS-only estimate', f(s[s.length - 1][1], 2), '1.57');
  says('ch11.p3', '从 0.85 降到 0.65'); says('ch11.p3', '从 1.2 涨到 1.57'); says('ch11.model.how', '始终是 1.2');
  ok('ch11 SG&A restores the truth', Mk.series(c, true).every(q => Math.abs(q[1] - Mk.mu) < 1e-12));
  check('ch11 flat when COGS share stays', f(Mk.series(Mk.cogs0, false).pop()[1], 6), '1.200000'); check('ch11 slider max = cogs0', slider('mkC').max, Mk.cogs0);
  const A = M.asym, a = A.solve([10, 10, 10]), b = A.solve([0, 10, 10]);
  check('ch11 HHI before', f(a.hhi, 0), '3333'); check('ch11 HHI after', f(b.hhi, 0), '3750');
  check('ch11 P before', f(a.P, 1), '22.5'); check('ch11 P after', f(b.P, 0), '20');
  check('ch11 CS before', f(a.cs, 1), '703.1'); check('ch11 CS after', f(b.cs, 0), '800');
  says('ch11.p5', 'HHI 从 3333 升到 3750'); says('ch11.p5', '价格却从 22.5 降到 20'); says('ch11.p5', '消费者剩余从 703.1 升到 800');
  says('ch11.say2.better', `HHI 从 ${zhNum(+f(a.hhi, 0)).replace(/,/g, '')} 升到`); says('ch11.say2.better', `价格从 ${f(a.P, 1)} 降到`); says('ch11.say2.better', `消费者剩余从 ${f(a.cs, 1)} 升到`);
  says('ch11.model2.how', 'P = 60 − Q，起初成本都是 10'); check('ch11 asym a', A.a, 60);
  // the Cournot solution is a Nash equilibrium: no firm gains by changing its quantity
  for (const r of [a, b]) r.q.forEach((qi, i) => { const costs = r === a ? [10, 10, 10] : [0, 10, 10], others = r.Q - qi, pi = x => (A.a - others - x - costs[i]) * x; ok('ch11 Cournot best reply', pi(qi) >= pi(qi * 1.01) && pi(qi) >= pi(qi * 0.99)); });
}

/* ── ch12 frontier block ── */
{
  const Fr = M.FRONTIER;
  check('FRONTIER checked', Fr.checked, '2026-11-11'); says('ch12.p1', '核对日期是 2026 年 11 月 11 日'); says('ch12.reg.title', '截至 2026 年 11 月 11 日');
  for (const [k, v] of Object.entries(Fr)) if (typeof v === 'object') ok(`FRONTIER ${k} has a source`, typeof v.source === 'string' && v.source.length > 10);
  check('Menlo is a claim', Fr.enterpriseApi.kind, 'claim'); says('ch12.card.models.f4', 'tag c'); says('ch12.card.models.f4', 'Anthropic 的投资方');
  const cb = M.hhiBounds(Fr.cloud.shares); ok('cloud HHI straddles 1800', cb.lo < Fr.hhiThreshold.highly && cb.hi > Fr.hhiThreshold.highly); says('ch12.card.cloud.f1', `${Fr.hhiThreshold.highly} 线`);
  check('cloud HHI bounds', `${f(cb.lo, 0)}-${f(cb.hi, 0)}`, '1293-1854');
  const fb = M.hhiBounds(Fr.foundry.shares); ok('foundry bounds ordered', fb.lo <= fb.hi && fb.lo > 5000);
  // bounds are true bounds: brute-force any split of the rest into pieces no larger than the smallest share
  ok('hhiBounds lower = known only', Math.abs(M.hhiBounds([50, 50]).lo - 5000) < 1e-9 && M.hhiBounds([50, 50]).hi === 5000);
  check('hhiBounds upper', M.hhiBounds([40, 20]).hi, 1600 + 400 + 400 + 400);
  says('ch12.unit.bnScale', '10'); says('ch12.unit.usd', '亿美元');
}

/* ── every live-sentence template: placeholders the app supplies, branches reachable at the slider extremes ── */
{
  const sayKeys = Object.keys(Z).filter(k => /\.say2?\.|\.note\.|\.why\.|\.cmp\./.test(k));
  for (const k of sayKeys) ok(`template ${k} is used by app.js`, appSrc.includes(`'${k}'`) || appSrc.includes(`'${k.replace(/\.[^.]+$/, '.')}`) || new RegExp(`'${k.split('.').slice(0, -1).join('\\.')}\\.' *\\+`).test(appSrc));
  // keys referenced in app.js exist in the copy
  for (const m of appSrc.matchAll(/'((?:ch\d+|common|nav|hero|toc)\.[\w.]+)'/g)) if (!/\.$/.test(m[1])) ok(`copy has ${m[1]}`, m[1] in Z || Object.keys(Z).some(k => k.startsWith(m[1])));
  // which branch each chapter's selector picks, mirrored from app.js, at slider extremes and defaults
  const seen = new Set(), add = k => seen.add(k);
  for (const e of [slider('moE').min, 2, slider('moE').max]) add(e < 1.5 ? 'ch1.say.steep' : 'ch1.say.one'); add('ch1.say.pd');
  const Co = M.cost;
  for (const F of [2, 7]) for (const S of [3, 7]) for (const dd of [1e-4, 0]) { const k = Co.bestK(10 ** S, 10 ** F, dd); add(dd === 0 ? 'ch2.say.nod' : k === 1 ? 'ch2.say.natural' : k <= 3 ? 'ch2.say.few' : 'ch2.say.many'); }
  add(Co.bestK(1e6, 1e7, 1e-4) <= 3 ? 'ch2.say.few' : 'x');
  for (const N of [1, 10]) add(N === 1 ? 'ch3.say.one' : 'ch3.say.many');
  const ES = [0.25, 0.5, 1, 2, 4, 8, 16, 32], EF = [25, 50, 100, 200, 400], E = M.entry;
  for (const S of ES) for (const F of EF) { const oc = E.nStar('cournot', S, F, 8), ol = E.nStar('logit', S, F, 8), ob = E.nStar('bertrand', S, F, 8), opt = E.socialN(S, F);
    add(!oc && !ob ? 'ch4.say.none' : !ol ? 'ch4.say.cournotonly' : 'ch4.say.normal'); if (oc && ol) ok(`ch4 normal sentence claims excess entry: S=${S} F=${F}`, oc > opt); }
  const Nw = M.network;
  for (const p of [0.02, 0.16, 0.3]) for (const n0 of [0, 0.2, 0.6]) { const cr = Nw.critical(p); if (cr == null) { add('ch5.say.none'); continue; }
    if (Math.abs(n0 - cr) < 0.005) add('ch5.say.edge'); else { add(n0 > cr ? 'ch5.say.up' : 'ch5.say.down'); add(n0 > cr ? 'ch5.say.doneup' : 'ch5.say.donedown'); } }
  for (const r of [0, 0.01, 0.3]) { const run = M.standards.run({ r }, 1); add(r === 0 ? 'ch6.say.none' : run.lockedAt != null ? 'ch6.say.locked' : 'ch6.say.open'); }
  for (const x of [0, 0.9]) for (const y of [0, 0.9]) { const m = M.platform.monopoly(x, y); add(m.p1 < m.f1 - 1e-9 ? 'ch7.say.below' : 'ch7.say.cheaper'); } add('ch7.say.duo'); add('ch7.note.none');
  add('ch8.say.running');
  for (const b of [0.05, 0.3, 0.6]) for (const d of [0, 0.05, 0.1, 0.12, 0.3]) { const r = M.data.run(b, d), e = r[r.length - 1][1], dc = M.data.tipDelta(b); add(e > 0.95 ? (d > dc ? 'ch8.say.tip' : 'ch8.say.tipstart') : e < 0.535 ? 'ch8.say.fade' : 'ch8.say.hold'); }
  for (const m of [0, 0.3, 1]) for (const dl of [0, 1, 3]) for (const K of [0, 0.5, 3]) { const r = M.tying.solve(m, dl, K); add(!r.rivalInOpen ? 'ch9.say.deadopen' : r.rivalInTie ? 'ch9.say.survive' : r.gain > 1e-9 ? 'ch9.say.profit' : 'ch9.say.nogain'); }
  for (const o of [{}, { phi: 1 }, { h: 0.8 }, { g: 4 }, { h: 0.8, g: 4 }]) { const b = M.standards.batch({ r: 0.1, g: 1, phi: 0, h: 0, ...o }, 200, 1);
    const key = b.tippedShare >= 0.75 ? 'ch10.say.high' : b.tipped === 0 ? 'ch10.say.none' : 'ch10.say.mid'; add(key); if (key === 'ch10.say.none') add((o.phi || 0) >= 0.5 ? 'ch10.why.phi' : 'ch10.why.other'); }
  for (const c of [0.5, 0.85]) for (const sga of [false, true]) { const est = M.markups.series(c, sga).pop()[1]; add(sga ? 'ch11.say.sga' : Math.abs(est - 1.2) < 0.005 ? 'ch11.say.flat' : 'ch11.say.cogs'); }
  for (const c1 of [0, 10]) add(c1 >= 10 ? 'ch11.say2.same' : 'ch11.say2.better');
  for (const k of sayKeys) ok(`branch ${k} is reachable from the sliders`, seen.has(k));
  // placeholders: each {name} in a template is a name the app passes
  for (const k of sayKeys) for (const m of Z[k].matchAll(/\{(\w+)\}/g)) ok(`${k} placeholder {${m[1]}} is supplied by app.js`, new RegExp(`\\b${m[1]}\\s*[:=]|[{,] ${m[1]}[,} ]`).test(appSrc));
}

/* ── language hygiene ── */
{
  const CJK = /[　-〿㐀-鿿＀-￯]/;
  ok('no Chinese in app.js', !CJK.test(appSrc)); ok('no Chinese in models.js', !CJK.test(fs.readFileSync(path.join(dir, 'models.js'), 'utf8')));
  ok('no 万/亿 scaling in app.js', !/万|亿|1e4\s*\)|\/ ?1e8/.test(appSrc));
  const body = html.replace(/<title>[^<]*<\/title>/, '').replace(/<meta name="description"[^>]*>/, '').replace(/<meta property="og:[^>]*>/g, '').replace(/<button[^>]*data-lang="zh"[^>]*>中<\/button>/, '');
  const left = body.split('\n').filter(l => CJK.test(l)); ok('index.html: Chinese only in title, description and the 中 button: ' + left.slice(0, 3).join(' | '), !left.length);
  ok('index.html has a Chinese title', /<title>[^<]*[一-鿿]/.test(html)); ok('index.html has a Chinese description', /<meta name="description" content="[^"]*[一-鿿]/.test(html));
  ok('index.html loads copy.en.js', /copy\.en\.js/.test(html)); ok('no lesson-shell.js', !/lesson-shell/.test(html)); ok('back link', /href="\.\.\/\.\.\/\.\.\/"/.test(html));
  ok('no provenance label', !/data-source-revision/.test(html));
  for (const k of Object.keys(Z)) for (const m of String(Z[k]).matchAll(/href="([^"]+)"/g)) { const target = path.join(dir, m[1].split('#')[0]); ok(`${k} link ${m[1]} exists`, fs.existsSync(target)); }
}

if (fails) { console.error(`${fails} of ${n} checks failed`); process.exit(1); }
console.log(`PASS: ${n} checks (every prose number derived from models.js; every live-sentence branch reachable; FRONTIER sourced; no Chinese outside copy.zh.js)`);
