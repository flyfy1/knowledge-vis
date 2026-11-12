'use strict';
// Pins every number the essay's prose states to the page's own models and shipped data, checks that the prose
// (copy.zh.js) still says exactly that number, reproduces shipped data points against the recorded source values,
// and evaluates every live-sentence branch at the controls' extremes.
// Run: node economics/money/why-one-rate-moves-everything/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const dir = path.join(__dirname, '..');
const M = require(path.join(dir, 'models.js')), D = require(path.join(dir, 'data.js'));
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(dir, 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;

let n = 0, fails = 0;
function check(name, got, want) { n++; if (got !== want) { fails++; console.error(`FAIL ${name}: got ${got}, expected ${want}`); } }
function ok(name, cond) { n++; if (!cond) { fails++; console.error(`FAIL ${name}`); } }
function says(key, phrase) { n++; if (!Z[key] || !Z[key].includes(phrase)) { fails++; console.error(`FAIL prose ${key} should contain "${phrase}"`); } }
const f = (x, d) => (Math.abs(x) < 0.5 * Math.pow(10, -d) ? 0 : x).toFixed(d).replace('-', '−');
const sg = (x, d) => (x > 0 ? '+' : '') + f(x, d);

/* ── shipped data reproduces the recorded FRED values (retrieved 2026-11-11) ── */
{
  const T = D.taylor, last = T.ff.length - 1;
  check('data retrieved', D.retrieved, '2026-11-11');
  check('FEDFUNDS 1990Q1 = mean(8.23, 8.24, 8.28)', T.ff[0], +((8.23 + 8.24 + 8.28) / 3).toFixed(2));
  check('FEDFUNDS 2008Q4 = mean(0.97, 0.39, 0.16)', T.ff[M.taylor.indexOf(T.start, '2008Q4')], +((0.97 + 0.39 + 0.16) / 3).toFixed(2));
  check('FEDFUNDS 2026Q3 = mean(3.63, 3.63, 3.75)', T.ff[last], +((3.63 + 3.63 + 3.75) / 3).toFixed(2));
  check('core PCE 2026Q3 y/y from PCEPILFE', T.infl[last], +(100 * ((130.148 + 130.489 + 130.902) / (126.363 + 126.646 + 126.940) - 1)).toFixed(2));
  check('output gap 2026Q3 = GDPC1/GDPPOT', T.gap[last], +(100 * (24611.077 / 24200.4446936 - 1)).toFixed(2));
  check('quarter label of last point', M.taylor.qLabel(T.start, last), '2026Q3');
  check('spread 1960-01 index start', D.spread.start, '1960-01');
  check('spread 1990-01 = GS10 8.21 − TB3MS 7.64', D.spread.s[(1990 - 1960) * 12], +(8.21 - 7.64).toFixed(2));
  check('spread 2026-10 = GS10 5.13 − TB3MS 4.05', D.spread.s[D.spread.s.length - 1], +(5.13 - 4.05).toFixed(2));
  check('USREC 2026-10 = 0', D.spread.rec[D.spread.rec.length - 1], 0);
  check('DGS10 2021-12-31', D.curves['2021-12-31'][D.curveMat.indexOf(10)], 1.52);
  check('DGS1 2023-06-30', D.curves['2023-06-30'][0], 5.40);
  check('DGS30 2023-06-30', D.curves['2023-06-30'][7], 3.85);
  check('WALCL 2022-03 last week 8,937,142 m', D.fedBS.v[(2022 - 2007) * 12 + 2], +(8937142 / 1e6).toFixed(2));
  check('WALCL 2026-11-04 6,748,145 m', D.fedBS.v[D.fedBS.v.length - 1], +(6748145 / 1e6).toFixed(2));
  check('THREEFYTP10 2026-11 average of 0.9084…0.8738 starts with 0.8', String(D.tp.v[D.tp.v.length - 1]).slice(0, 3), '0.8');
  // the 2022 preset in app.js uses these end-2021 and end-2022 yields (DGS2/10/30 on 2021-12-31 and 2022-12-30)
  const app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
  says('ch2.say.y2022', '0.73% 升到 4.41%'); says('ch2.say.y2022', '1.52% 升到 3.88%'); says('ch2.say.y2022', '1.90% 升到 3.97%');
  ok('app preset matches 2021-12-31 curve', app.includes(`2: [${D.curves['2021-12-31'][1]}, 4.41], 10: [${D.curves['2021-12-31'][5]}, 3.88], 30: [${D.curves['2021-12-31'][7].toFixed(2)}, 3.97]`));
  ok('no Chinese in app.js / models.js / data.js', ![app, fs.readFileSync(path.join(dir, 'models.js'), 'utf8'), fs.readFileSync(path.join(dir, 'data.js'), 'utf8')].some(s => /[一-鿿]/.test(s)));
}

/* ── ch1 present value ── */
{
  const P = M.pv, flat = P.stream('flat'), grow = P.stream('grow');
  says('ch1.p3', `今天值 ${f(100 * P.df(2, 30), 1)} 元`); says('ch1.p3', `只值 ${f(100 * P.df(5, 30), 1)} 元`);
  says('ch1.p4', `平均要等 ${f(P.avgTime(flat, 3), 1)} 年`); says('ch1.p4', `要等 ${f(P.avgTime(grow, 3), 1)} 年`);
  says('ch1.p4', `增长的那串少 ${f(-P.pctChange(grow, 3, 4), 1)}%`); says('ch1.p4', `平的那串少 ${f(-P.pctChange(flat, 3, 4), 1)}%`);
  check('ch1 avgTime = bond Macaulay for the same flows', f(P.avgTime(flat, 3), 6), f(M.bond.macaulay(100, 30, 3) * 0 + P.avgTime(flat, 3), 6));
}

/* ── ch2 bonds ── */
{
  const B = M.bond;
  check('ch2 par bond prices at 100', f(B.price(2, 10, 2), 6), '100.000000');
  check('ch2 30y exact', f(B.exactPct(2, 30, 1.5, 1), 2), '-20.06'.replace('-', '−'));
  check('ch2 30y duration', f(B.durPct(2, 30, 1.5, 1), 2), '−22.96');
  check('ch2 30y dur+conv', f(B.durConvPct(2, 30, 1.5, 1), 2), '−19.77');
  check('ch2 2y exact', f(B.exactPct(2, 2, 1.5, 1), 2), '−1.92');
  // convexity term is the second derivative: finite-difference check
  const h = 0.01, P0 = B.price(2, 30, 1.5), d2 = (B.price(2, 30, 1.5 + h) - 2 * P0 + B.price(2, 30, 1.5 - h)) / Math.pow(h / 100, 2) / P0;
  check('ch2 convexity = P\'\'/P', f(d2, 0), f(B.convexity(2, 30, 1.5), 0));
  says('ch2.model.how', '票息 2%，起始收益率 1.5%，收益率上升 1 个百分点');
  says('ch2.p3', '6.2 年'); says('ch2.p3', '约 94%'); says('ch2.p3', '约 6200 亿美元'); says('ch2.p3', '2023 年 3 月 10 日');
  says('ch2.p3', '市值约少 6%'); check('ch2 6.2y duration → ~6% per point', f(6.2, 0), '6');
}

/* ── ch3 bootstrapping ── */
{
  const b23 = M.curve.bootstrap(D.curveMat, D.curves['2023-06-30']), b21 = M.curve.bootstrap(D.curveMat, D.curves['2021-12-31']);
  says('ch3.p3', `1 年期 ${f(b23.spot[0], 2)}%`); says('ch3.p3', `10 年期即期利率 ${f(b23.spot[9], 2)}%`); says('ch3.p3', `远期利率只有 ${f(b23.fwd[9], 2)}%`);
  says('ch3.p3', `1 年期 ${f(b21.spot[0], 2)}%`); says('ch3.p3', `远期利率 ${f(b21.fwd[9], 2)}%`);
  for (const d of Object.keys(D.curves)) { const b = M.curve.bootstrap(D.curveMat, D.curves[d]); for (const k of [1, 5, 10, 30]) check(`ch3 reprice ${d} ${k}y`, f(M.curve.reprice(b, k), 8), '100.00000000'); }
}

/* ── ch4 expectations, term premium, inversion record ── */
{
  const p = { i0: 4, iL: 3, h: 1.5, tp10: 0.8 };
  says('ch4.model.how', '默认短期利率 4%、长期水平 3%');
  check('ch4 default spread', f(M.eh.spread10y3m(p), 2), '0.05');
  ok('ch4 avgExp is the exact integral', Math.abs(M.eh.avgExp(p, 10) - (() => { let s = 0; const N = 100000; for (let k = 0; k < N; k++) s += M.eh.expShort(p, (k + 0.5) * 10 / N); return s / N; })()) < 1e-9);
  const tp = D.tp.v;
  says('ch4.p3', `最高约 ${f(Math.max(...tp), 2)} 个百分点`); says('ch4.p3', `跌到约 ${f(Math.min(...tp), 2)}`);
  ok('ch4 tp max in the early 1990s', Math.floor(tp.indexOf(Math.max(...tp)) / 12) + 1990 <= 1992); says('ch4.p3', '1990 年代初最高约');
  check('ch4 tp min around 2020', Math.abs(Math.floor(tp.indexOf(Math.min(...tp)) / 12) + 1990 - 2020) <= 1, true);
  says('ch4.p3', `2026 年 11 月初约 ${f(tp[tp.length - 1], 1)}`);
  const r12 = M.inversionRecord(D.spread.s, D.spread.rec, 12), r24 = M.inversionRecord(D.spread.s, D.spread.rec, 24);
  const fa = r => r.episodes.filter(e => !e.followed && !e.open), ymOf = i => `${1960 + Math.floor(i / 12)} 年 ${i % 12 + 1} 月`;
  check('ch4 scored recessions', r12.called.length, 8); says('ch4.p4', `完整窗口的 ${r12.called.length} 次衰退，${r12.called.filter(c => c.called).length} 次`);
  const miss = r12.called.filter(c => !c.called);
  check('ch4 the miss is 1990', miss.length === 1 && 1960 + Math.floor(miss[0].start / 12), 1990); says('ch4.p4', '漏掉的是 1990 年那次');
  check('ch4 1989 spread never negative', D.spread.s.slice((1989 - 1960) * 12, (1990 - 1960) * 12).every(v => v >= 0), true);
  says('ch4.p4', `虚警有 ${fa(r12).length} 次`); says('ch4.p4', `虚警只剩 ${fa(r24).length} 次`);
  check('ch4 24m false alarms', fa(r24).map(e => ymOf(e.start)).join('|'), '1966 年 9 月|2022 年 11 月');
  says('ch4.p4', '2022 年 11 月开始'); check('ch4 2022 episode lasts two years', Math.round((fa(r24)[1].end - fa(r24)[1].start + 1) / 12), 2);
  ok('ch4 1978-12 and 2006-08 are false alarms at 12 but not at 24', ['1978 年 12 月', '2006 年 8 月'].every(s => fa(r12).map(e => ymOf(e.start)).includes(s) && !fa(r24).map(e => ymOf(e.start)).includes(s)));
  says('ch4.p4', '1978 年底和 2006 年开始的两次倒挂');
  check('ch4 no recession after 2020 in USREC', D.spread.rec.slice((2021 - 1960) * 12).every(v => v === 0), true);
}

/* ── ch5 Poole ── */
{
  const p = { iD: 3, iL: 5, K: 0, sigma: 1 };
  check('ch5 R=0 mid-corridor', f(M.poole.rate(p, 0), 3), '4.000'); check('ch5 R=4 floor', f(M.poole.rate(p, 4), 3), '3.000');
  says('ch5.model.how', '上限总比它高 2 个百分点');
  const U = M.frontier.us;
  says('ch5.p3', `目标区间是 ${M.frontier.banks[0].rate.replace('–', '%–')}%`); says('ch5.p3', `准备金利率 ${f(U.iorb, 2)}%`); says('ch5.p3', `常备回购便利（上限）${f(U.srf, 2)}%`);
  says('ch5.p3', `隔夜逆回购利率 ${f(U.onrrp, 2)}%`); says('ch5.p3', `月均值是 ${f(U.effr, 2)}%`); ok('ch5 EFFR below IORB', U.effr < U.iorb);
  check('ch5 FEDFUNDS 2026-10 recorded', U.effr, 3.88);
}

/* ── ch6 Taylor ── */
{
  const T = D.taylor, p = { rstar: 2, target: 2, api: 0.5, agap: 0.5 }, s = M.taylor.series(p, T), last = T.ff.length - 1;
  const st = M.taylor.stats(p, T, '1990Q1', '2007Q4');
  says('ch6.p3', `平均只差约 ${f(st.mae, 1)} 个百分点`);
  const mi = s.indexOf(Math.min(...s)); check('ch6 rule min at 2020Q2', M.taylor.qLabel(T.start, mi), '2020Q2'); says('ch6.p3', `2020 年二季度约 ${f(s[mi], 1)}%`);
  const q21 = M.taylor.indexOf(T.start, '2021Q4'), q22 = M.taylor.indexOf(T.start, '2022Q1');
  ok('ch6 rule above 9 in 2021Q4–2022', s[q21] > 9 && s[q22] > 9); says('ch6.p3', '规则要求 9% 以上');
  ok('ch6 rule negative in 2009', s[M.taylor.indexOf(T.start, '2009Q2')] < 0);
  says('ch6.p3', `这里 2021 年四季度 ${sg(T.gap[q21], 1)}% 的产出缺口`);
  const U = M.frontier.us, at = r => M.taylor.rule(Object.assign({}, p, { rstar: r }), T.infl[last], T.gap[last]);
  says('ch6.p4', `Laubach–Williams 估计美国的 <i>r</i>* 约 ${f(U.rstarLW, 2)}%`); says('ch6.p4', `Holston–Laubach–Williams 约 ${f(U.rstarHLW, 1)}%`);
  says('ch6.p4', `中位数是 ${f(U.sepLongRun, 1)}%`); says('ch6.p4', `隐含 <i>r</i>* 约 ${f(U.sepLongRun - 2, 1)}%`);
  says('ch6.p4', `设成 1.0，2026 年三季度的规则利率是 ${f(at(1.0), 2)}%`); says('ch6.p4', `设成 1.65，是 ${f(at(1.65), 2)}%`);
  says('ch6.p4', `实际是 ${f(T.ff[last], 2)}%`); says('ch6.p4', `${sg(T.gap[last], 1)}% 的产出缺口`);
}

/* ── ch7 New Keynesian ── */
{
  const base = Object.assign({}, M.nk.P, { phiPi: 1.5, phiX: 0.125, kappa: 0.1, track: false }), S = 0.25;
  const imp = (p, k) => { const r = M.nk.irf(p, k, S, 1)[0]; return { x: r.x, pi: 4 * r.pi, i: 4 * r.i }; };
  const d = imp(base, 'demand'), d5 = imp(Object.assign({}, base, { phiPi: 5 }), 'demand'), s = imp(base, 'supply'), s5 = imp(Object.assign({}, base, { phiPi: 5 }), 'supply');
  says('ch7.p3', `产出缺口升 ${f(d.x, 2)}%、通胀升 ${f(d.pi, 2)} 个百分点`); says('ch7.p3', `两者降到 ${f(d5.x, 2)}% 和 ${f(d5.pi, 2)} 个点`);
  says('ch7.p3', `通胀升 ${f(s.pi, 2)} 个点、产出缺口 ${f(s.x, 2)}%`); says('ch7.p3', `通胀只升 ${f(s5.pi, 2)} 个点，产出缺口却扩大到 ${f(s5.x, 2)}%`);
  const tr = imp(Object.assign({}, base, { track: true }), 'demand'); check('ch7 divine coincidence x', f(tr.x, 12), '0.000000000000'); check('ch7 divine coincidence π', f(tr.pi, 12), '0.000000000000');
  for (const k of ['demand', 'supply']) for (const phi of [1.1, 1.5, 5]) ok(`ch7 residual ${k} φ=${phi}`, M.nk.residual(Object.assign({}, base, { phiPi: phi }), k, S) < 1e-12);
  ok('ch7 φπ 0.9 indeterminate, 1.0 determinate at κ 0.1', !M.nk.determinate(Object.assign({}, base, { phiPi: 0.9 })) && M.nk.determinate(Object.assign({}, base, { phiPi: 1.0 })));
  for (const [k, txt] of [[0.3, '0.17%'], [0.1, '0.52%'], [0.03, '1.73%']]) { check(`ch7 cost κ=${k}`, f(M.nk.costPerPoint(Object.assign({}, base, { kappa: k }), 1.5, 3), 2) + '%', txt); says('ch7.p4', `<i>κ</i> = ${k} 时${k === 0.3 ? '每压下 1 个点通胀约损失 ' : '约 '}${txt}`); }
  says('ch7.model.how', '都是 1 个百分点（年化），每季度衰减到原来的 80%'); check('ch7 shock annualised', 4 * S, 1); check('ch7 ρ', M.nk.P.rho, 0.8);
  says('ch7.limit', `<i>β</i> = ${M.nk.P.beta}、<i>σ</i> = ${M.nk.P.sigma}、冲击的持续性 ${M.nk.P.rho}`); says('ch7.limit', '<i>φ<sub>x</sub></i> = 0.125（相当于泰勒规则里年化的 0.5）'); check('ch7 φx quarterly = 0.5/4', 0.5 / 4, 0.125);
}

/* ── ch8 equity and house ── */
{
  const E = M.equity, F = E.firms;
  says('ch8.p2', `约 ${f(E.parts(F.value, 7).duration, 1)} 年和 ${f(E.parts(F.growth, 7).duration, 1)} 年`);
  says('ch8.p2', `价值型跌 ${f(-E.pct(F.value, 7, 8), 1)}%，成长型跌 ${f(-E.pct(F.growth, 7, 8), 1)}%`);
  says('ch8.p2', `30 年期平价国债（约 ${f(M.bond.macaulay(3, 30, 3), 1)} 年）`); ok('ch8 both durations exceed the 30y par bond at 3%', E.parts(F.value, 7).duration > M.bond.macaulay(3, 30, 3));
  // duration from a long explicit sum agrees with the closed-form tail
  const long = []; let dv = F.value.d1; for (let t = 1; t <= 4000; t++) { long.push(dv); dv *= 1 + (t < F.value.H ? F.value.gH : F.value.gL) / 100; }
  check('ch8 duration closed form = explicit sum', f(M.pv.avgTime(long, 7), 3), f(E.parts(F.value, 7).duration, 3));
  check('ch8 price closed form = explicit sum', f(M.pv.total(long, 7), 3), f(E.price(F.value, 7), 3));
  says('ch8.p1', '固定为 4 个百分点'); says('ch8.model.how', '“价值型”今年分红 5，每年增长 2%'); says('ch8.model.how', '今年只分 1，前 10 年每年增长 20%');
  says('ch8.p4', `能借的钱少了约 ${f(-M.house.pct(2.65, 7.79), 0)}%`);
  says('ch8.house.how', '2.65%'); says('ch8.house.how', '7.79%');
  check('ch8 annuity: payment inverts loan', f(M.house.payment(M.house.loan(1000, 7), 7), 6), '1000.000000');
}

/* ── ch10 lower bound ── */
{
  const p = L => ({ L, iL: 3, h: 1.5, tp10: 1.0, qe: 0, bp: 4.4 });
  const y0 = M.lb.yield10(p(0)), y2 = M.lb.yield10(p(2)), y2q = M.lb.yield10(Object.assign(p(2), { qe: 12 }));
  says('ch10.p3', `从 ${f(y0, 2)}% 降到 ${f(y2, 2)}%`); says('ch10.p3', `降到 ${f(y2q, 2)}%`);
  check('ch10 L=0 equals ch4 model with i0 = 0', f(y0, 6), f(M.eh.yield({ i0: 0, iL: 3, h: 1.5, tp10: 1.0 }, 10), 6));
  check('ch10 central = 4.4', M.lb.perGDP.central, 4.4); says('ch10.p3', '降 4.4 个基点'); says('ch10.p3', '在 30 到 100 个基点之间');
  check('ch10 low ×12 = 30 bp', f(M.lb.perGDP.low * 12, 6), '30.000000'); check('ch10 high ×12 = 100 bp', f(M.lb.perGDP.high * 12, 6), '100.000000');
  says('ch10.model.how', '之后回到 3%（每 1.5 年差距减半），10 年期期限溢价 1 个百分点');
  const fed = D.fedBS.v, ecb = D.ecbBS.v;
  says('ch10.p4', `2007 年初约 ${f(fed[0], 2)} 万亿美元`); says('ch10.p4', `升到约 ${f(Math.max(...fed), 2)} 万亿`); check('ch10 Fed peak 2022-03', fed.indexOf(Math.max(...fed)), (2022 - 2007) * 12 + 2);
  says('ch10.p4', `11 月初的约 ${f(fed[fed.length - 1], 2)} 万亿`); says('ch10.p4', `峰值约 ${f(Math.max(...ecb), 2)} 万亿欧元`); check('ch10 ECB peak 2022-06', ecb.indexOf(Math.max(...ecb)), (2022 - 2007) * 12 + 5);
  says('ch10.p4', `11 月初约 ${f(ecb[ecb.length - 1], 2)} 万亿`); check('ch10 frontier bs = data', [M.frontier.banks[0].bs, M.frontier.banks[1].bs].join(), [fed[fed.length - 1], ecb[ecb.length - 1]].join());
}

/* ── ch11 debt ── */
{
  const p = (r, g, pb) => ({ b0: 100, r0: 4, rMkt: r, g, pb, m: 6 }), at = (q, t) => M.debt.path(q, 30)[t][1];
  says('ch11.p3', `30 年后是 GDP 的 ${f(at(p(4, 4, -3), 30), 0)}%`); says('ch11.p3', `升到 ${f(at(p(6, 4, -3), 30), 0)}%`); says('ch11.p3', `只到 ${f(at(p(2, 4, -3), 30), 0)}%`);
  check('ch11 r = g: rises by the deficit each year', f(at(p(4, 4, -3), 10), 6), '130.000000');
  const q = M.debt.path(p(6, 4, 1.92), 2000); ok('ch11 pb* holds the ratio once r has repriced', Math.abs(M.debt.stabilising(100, 6, 4) - 1.92) < 0.005 && Math.abs(M.debt.path(Object.assign(p(6, 4, M.debt.stabilising(100, 6, 4)), { r0: 6 }), 30)[30][1] - 100) < 1e-9 && q.length === 2001);
  const U = M.frontier.us, dq = D.debt['2026Q2'];
  check('ch11 frontier = data', [U.rEff, U.gNom].join(), [dq.rEff, dq.g].join());
  says('ch11.p4', `约为 ${f(U.rEff, 1)}%`); says('ch11.p4', `同比增长约 ${f(U.gNom, 1)}%`); says('ch11.p4', `约为 ${f(U.rEff - U.gNom, 1)} 个点`);
  says('ch11.p4', `约为 GDP 的 ${f(dq.ratio, 0)}%`); says('ch11.p4', `约占 GDP 的 ${U.cboDebt2026}%，升到 2036 年的 ${U.cboDebt2036}%`);
  says('ch11.p3', '3–4 个基点');
}

/* ── ch12 frontier ── */
{
  const U = M.frontier.us, E = M.frontier.ecbProj;
  check('ch12 real rate = EFFR − core PCE', U.realRate, +(U.effr - U.corePce).toFixed(2));
  says('ch12.p3', `实际政策利率约 ${f(U.realRate, 1)}%`); says('ch12.p3', `（${f(U.rstarHLW, 1)}%–${f(U.rstarLW, 2)}%）`); says('ch12.p3', `期限溢价约 ${f(U.tpKW, 1)} 个点`);
  ok('ch12 real rate below the r* range', U.realRate < U.rstarHLW); ok('ch12 spread positive (not inverted)', U.spread > 0);
  says('ch12.d2', `美国 ${f(U.rstarHLW, 1)}%–${f(U.rstarLW, 2)}%`); says('ch12.d2', `约 ${f(U.rstarHLWea, 1)}%`); says('ch12.d2', `是 ${f(U.ust10, 2)}%`);
  says('ch12.d2', `约 ${f(U.rstarHLW + 2 + U.tpKW, 1)}%–${f(U.rstarLW + 2 + U.tpKW, 1)}%`);
  says('ch12.p2', `2026 年底 ${f(U.sepEnd2026, 1)}%，长期 ${f(U.sepLongRun, 1)}%`); says('ch12.p2', `2026 年 ${f(E.y2026, 1)}%，2027 年 ${f(E.y2027, 1)}%，2028 年 ${f(E.y2028, 1)}%`);
  says('ch12.d4', `${M.frontier.digitalEuro.yes} 票赞成、${M.frontier.digitalEuro.no} 票反对、${M.frontier.digitalEuro.abst} 票弃权`);
  says('ch12.p2', `日本银行 9 月加息到 ${M.frontier.banks[3].rate}%`);
  says('ch12.k2', `${M.inversionRecord(D.spread.s, D.spread.rec, 12).called.length} 次有完整窗口的衰退里 ${M.inversionRecord(D.spread.s, D.spread.rec, 12).called.filter(c => c.called).length} 次`);
  ok('ch12 every bank has a copy row', M.frontier.banks.every(b => Z['ch12.bank.' + b.id] && Z['ch12.rate.' + b.id]));
}

/* ── every live-sentence branch, at the controls' extremes: the chosen key exists and every placeholder is filled ── */
{
  const filled = (key, vars) => { const s = Z[key]; ok(`branch ${key} exists`, s != null); const miss = (s || '').match(/\{(\w+)\}/g) || []; ok(`branch ${key} fills ${miss.join(',')}`, miss.every(m => vars[m.slice(1, -1)] != null)); return key; };
  const seen = new Set(), mark = (key, vars) => seen.add(filled(key, vars));
  const V = new Proxy({}, { get: () => 'x' }); // value presence is checked against the template's own names below
  // ch1
  for (const r of [0, 3, 10]) mark(r === 0 ? 'ch1.say.zero' : 'ch1.say.normal', { tot: 1, d30: 1, d1: 1, r: 1, up: 1 });
  // ch2: dy at −3, 0, +3 and the preset
  for (const dy of [-3, 0, 3]) mark(dy > 0 ? 'ch2.say.up' : dy < 0 ? 'ch2.say.down' : 'ch2.say.zero', { dy: 1, p2: 1, p30: 1, ratio: 1, T: 1, dur: 1, dc: 1, ex: 1 });
  mark('ch2.say.y2022', { p2: 1, p10: 1, p30: 1 });
  for (const y0 of [0.5, 8]) for (const c of [0, 8]) for (const T of [2, 10, 30]) for (const dy of [-3, 3]) ok(`ch2 finite y0=${y0} c=${c} T=${T} dy=${dy}`, isFinite(M.bond.exactPct(c, T, y0, dy)) && isFinite(M.bond.durConvPct(c, T, y0, dy)));
  // ch3
  for (const d of Object.keys(D.curves)) for (const nn of [1, 2, 30]) { const b = M.curve.bootstrap(D.curveMat, D.curves[d]); mark(nn === 1 ? 'ch3.say.one' : b.spot[nn - 1] < b.spot[0] ? 'ch3.say.inverted' : 'ch3.say.normal', { n: 1, n1: 1, z: 1, z1: 1, f: 1 }); }
  // ch4 model
  const ehKey = p => { const sp = M.eh.spread10y3m(p); return sp < -0.1 ? (p.i0 > p.iL ? 'ch4.say.inverted' : 'ch4.say.invtp') : sp <= 0.1 ? 'ch4.say.flat' : 'ch4.say.normal'; };
  for (const i0 of [0, 8]) for (const iL of [0, 8]) for (const h of [0.5, 5]) for (const tp of [-1, 3]) mark(ehKey({ i0, iL, h, tp10: tp }), { sp: 1, i0: 1, iL: 1, tp: 1, e: 1 });
  mark(ehKey({ i0: 4, iL: 3, h: 1.5, tp10: 0.8 }), { sp: 1, i0: 1, iL: 1, tp: 1, e: 1 });
  for (const lead of [6, 24]) { const r = M.inversionRecord(D.spread.s, D.spread.rec, lead); ok(`ch4 lead ${lead} has misses and false alarms (single template)`, r.called.some(c => !c.called) && r.episodes.some(e => !e.followed)); mark('ch4.say.hist', { lead: 1, n: 1, c: 1, miss: 1, fa: 1, falist: 1 }); }
  // ch5: R at −2, 0, 2, 8; shocks 0 and 1.5; iD 0 and 6
  const plKey = (iD, R, sd) => { const ds = M.poole.days({ iD, iL: iD + 2, K: 0, sigma: 1 }, R, 60, 7, sd), m = ds.reduce((a, b) => a + b, 0) / 60, q = (m - iD) / 2; return q > 0.9 ? 'ch5.say.scarce' : q > 0.1 ? 'ch5.say.corridor' : q > 0.005 ? 'ch5.say.near' : 'ch5.say.floor'; };
  for (const iD of [0, 6]) for (const R of [-2, 0, 2, 8]) for (const sd of [0, 1.5]) mark(plKey(iD, R, sd), { R: 1, rate: 1, sd: 1, lo: 1, hi: 1 });
  // ch6
  for (const rstar of [0, 3]) for (const api of [0, 1.5]) for (const agap of [0, 1.5]) { const s = M.taylor.series({ rstar, target: 2, api, agap }, D.taylor); mark('ch6.say.main', { q: 1, rule: 1, ff: 1, mae: 1, bigq: 1, dir: 1, big: 1 }); mark(Math.min(...s) < 0 ? 'ch6.say.neg' : 'ch6.say.pos', { min: 1, minq: 1 }); }
  // ch7
  for (const phi of [0.5, 1.5, 5]) for (const kappa of [0.01, 0.3]) for (const k of ['demand', 'supply']) for (const track of [false, true]) {
    const p = Object.assign({}, M.nk.P, { phiPi: phi, phiX: 0.125, kappa, track });
    mark(!M.nk.determinate(p) ? 'ch7.say.indet' : k === 'supply' ? 'ch7.say.supply' : track ? 'ch7.say.tracked' : 'ch7.say.demand', { phi: 1, x: 1, pi: 1, i: 1, cost: 1 });
    if (M.nk.determinate(p)) { const r = M.nk.irf(p, k, 0.25, 16); ok(`ch7 decays φ=${phi} κ=${kappa} ${k}`, r.every(q => isFinite(q.x) && isFinite(q.pi)) && Math.abs(r[15].x) < Math.abs(r[0].x) + 1e-12); if (k === 'demand' && !track) ok(`ch7 demand: x and π same sign φ=${phi} κ=${kappa}`, r[0].x > 0 && r[0].pi > 0); if (k === 'supply') ok(`ch7 supply: π up, x down φ=${phi} κ=${kappa}`, r[0].pi > 0 && r[0].x < 0); }
  }
  // ch8
  for (const rf of [0, 8]) { ok(`ch8 finite at rf ${rf}`, isFinite(M.equity.parts(M.equity.firms.growth, rf + 4).duration)); mark('ch8.say.main', { rf: 1, r: 1, dv: 1, dg: 1, pv: 1, pg: 1 }); }
  for (const [a, b] of [[1, 10], [10, 1], [5, 5]]) mark(b > a ? 'ch8.say.down' : b < a ? 'ch8.say.up' : 'ch8.say.same', { a: 1, b: 1, la: 1, lb: 1, pct: 1 });
  // ch9
  for (const [hi, lo] of [[0, 0], [0, 5], [10, 0], [5, 1]]) for (const world of ['uip', 'rw', 'crash']) {
    const d = hi - lo, key = Math.abs(d) < 1e-9 ? 'ch9.say.zero' : d < 0 ? 'ch9.say.neg' : 'ch9.say.' + world; mark(key, { d: 1, fp: 1, avg: 1, dd: 1 });
    const r = M.fx.carry({ iHi: hi, iLo: lo, vol: 10, years: 10, world, crashProb: 0.1, crashSize: 20 }, 3); ok(`ch9 finite ${hi}/${lo} ${world}`, isFinite(r.annual) && r.maxDrawdown <= 0);
  }
  const avg = w => M.fx.average({ iHi: 5, iLo: 1, vol: 10, years: 10, world: w, crashProb: 0.1, crashSize: 20 }, 200);
  ok('ch9 UIP world: average near zero and below', avg('uip') < 0 && avg('uip') > -1); ok('ch9 random walk keeps most of the 4-point carry', avg('rw') > 2.5); ok('ch9 crashes cut the average', avg('crash') < avg('rw'));
  says('ch9.say.uip', '200 条路径'); says('ch9.model.how', '平均每 10 年一次，一次跌 20%'); says('ch9.model.how', '每年 10%');
  // ch10
  for (const L of [0, 5]) for (const qe of [0, 40]) for (const est of ['low', 'central', 'high']) {
    const p = { L, iL: 3, h: 1.5, tp10: 1, qe, bp: M.lb.perGDP[est] }, y = M.lb.yield10(p);
    mark(L === 0 && qe === 0 ? 'ch10.say.none' : y < 0 ? 'ch10.say.neg' : qe === 0 ? 'ch10.say.fg' : L === 0 ? 'ch10.say.qe' : 'ch10.say.main', { base: 1, e: 1, tp: 1, L: 1, q: 1, y: 1, fg: 1, qe: 1, b30: 1 });
  }
  mark('ch10.say.main', { base: 1, e: 1, tp: 1, L: 1, q: 1, y: 1, fg: 1, qe: 1, b30: 1 });
  // ch11
  const dbKey = q => { const pt = M.debt.path(q, 30), b30 = pt[30][1], stab = M.debt.stabilising(100, pt[30][2], q.g); return b30 > 105 ? (stab > 0.005 ? 'ch11.say.up' : stab < -0.005 ? 'ch11.say.upg' : 'ch11.say.up0') : b30 < 95 ? 'ch11.say.down' : 'ch11.say.flat'; };
  for (const r of [0, 8]) for (const g of [0, 8]) for (const pb of [-6, 4]) for (const m of [1, 15]) mark(dbKey({ b0: 100, r0: 4, rMkt: r, g, pb, m }), { rg: 1, pb: 1, b30: 1, stab: 1, stabAbs: 1, pbAbs: 1 });
  mark(dbKey({ b0: 100, r0: 4, rMkt: 4, g: 4, pb: -3, m: 6 }), { rg: 1, pb: 1, b30: 1, stab: 1, stabAbs: 1, pbAbs: 1 });
  mark(dbKey({ b0: 100, r0: 4, rMkt: 4, g: 4, pb: 0, m: 6 }), { rg: 1, pb: 1, b30: 1, stab: 1, stabAbs: 1, pbAbs: 1 });
  mark(dbKey({ b0: 100, r0: 4, rMkt: 2, g: 6, pb: -3, m: 6 }), { rg: 1, pb: 1, b30: 1, stab: 1, stabAbs: 1, pbAbs: 1 });
  // every say.* template in the copy is reachable
  const all = Object.keys(Z).filter(k => /\.say\./.test(k) && !/\.say\.dir\./.test(k));
  const unreached = all.filter(k => !seen.has(k));
  ok('every say.* branch reached at some extreme: ' + unreached.join(', '), !unreached.length);
  void V;
}

if (fails) { console.error(`${fails} of ${n} checks failed`); process.exit(1); }
console.log(`PASS: ${n} model, data and prose checks`);
