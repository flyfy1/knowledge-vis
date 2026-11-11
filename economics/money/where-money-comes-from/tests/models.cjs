'use strict';
// Pins every number the essay states to the page's own model code, and checks that the number appears in
// the prose key that states it. Run: node economics/money/where-money-comes-from/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm'), assert = require('assert');
const dir = path.join(__dirname, '..');
const M = require(path.join(dir, 'models.js'));
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(dir, 'copy.zh.js'), 'utf8'), ctx);
const ZH = ctx.window.ESSAY_COPY.zh;

let n = 0;
const near = (got, want, tol, what) => { n++; assert(Math.abs(got - want) <= tol, `${what}: model gives ${got}, prose says ${want}`); };
const eq = (got, want, what) => { n++; assert.deepStrictEqual(got, want, `${what}: model gives ${JSON.stringify(got)}, prose says ${JSON.stringify(want)}`); };
const says = (key, ...frags) => { for (const f of frags) { n++; assert(ZH[key] && ZH[key].includes(f), `copy key ${key} should state "${f}"`); } };
const fx = (x, d) => x.toFixed(d);

/* ch1 · 48 people, 8 goods, trust 50% */
{
  const N = 8, s = M.tradeRun(N, 0.5);
  eq(M.TRADE_P, 48, 'ch1 population'); says('ch1.lab.title', '四十八', '八种');
  eq(M.tradeStuck(N), 18, 'ch1 people barter can never serve (N=8)');
  near(M.tradeExpectedRounds(N, 1), 7.8, 0.05, 'ch1 expected rounds with a bank IOU');
  near(M.tradeExpectedRounds(N, 0.5), 15.7, 0.05, 'ch1 expected rounds with a personal IOU at 50% trust');
  // trust 100%: a personal IOU behaves exactly like the bank's
  const full = M.tradeRun(N, 1); eq(full.hist.personal, full.hist.bank, 'ch1 trust 100% = bank IOU');
  // trust 10%: for the first 30 rounds it is no better than barter
  const low = M.tradeRun(N, 0.1); for (let r = 1; r <= 30; r++) { n++; assert(low.hist.personal[r] <= low.hist.barter[r] + 1e-9, `ch1 trust 10% round ${r}`); }
  says('ch1.p4', '100%', '10%', '30 轮');
  // N = 2: barter is as good as it gets (double coincidence guaranteed between the two kinds)
  near(M.tradeBarterChance(2), 24 / 47, 1e-9, 'ch1 N=2 barter chance');
  // the default run: barter stalls well below the IOU economies
  n++; assert(s.hist.barter[60] < 0.5 && s.hist.bank[60] === 1, 'ch1 default run after 60 rounds');
}

/* ch2 · balance sheet, defaults k = 8%, rr = 10% */
{
  const p = { k: 0.08, rr: 0.1, mode: 'textbook' };
  let s = M.bankInit(); eq([s.R, s.L, s.D, s.E], [10, 90, 90, 10], 'ch2 start (one loan already made)');
  eq(M.bankLendToLimit(s, p), 1, 'ch2 textbook: one more loan'); eq(s.stop, 'reserves', 'ch2 textbook stops on reserves'); eq(s.D, 100, 'ch2 textbook max deposits');
  eq(M.textbookMaxDeposits(s, 0.1), 100, 'ch2 multiplier R/rr'); says('ch2.p3', '一笔', '10 元准备金', '10%', '100');
  s = M.bankInit(); eq(M.bankLendToLimit(s, { ...p, mode: 'today' }), 3, 'ch2 today: three more loans'); eq(s.stop, 'capital', 'ch2 today stops on capital');
  eq(s.B, 2, 'ch2 today borrows 2 reserves'); says('ch2.p4', '三笔', '资本');
  // a loan grows both sides by the same amount; a repayment shrinks both
  s = M.bankInit(); const before = [s.L, s.D]; M.bankLoan(s, { ...p, rr: 0 }); eq([s.L - before[0], s.D - before[1]], [10, 10], 'ch2 loan adds to loans and deposits');
  M.bankRepay(s, p); M.bankRepay(s, p); eq([s.L, s.D], [80, 80], 'ch2 repayment deletes deposits');
  // QE: reserves +10 → textbook says deposits can reach 200; capital stops lending at 130
  s = M.bankInit(); M.bankQE(s); eq(M.textbookMaxDeposits(s, 0.1), 200, 'ch2 QE textbook max'); M.bankLendToLimit(s, p); eq([s.D, s.stop], [130, 'capital'], 'ch2 QE then capital binds');
  // rr = 0: reserves never bind (the US since 26 March 2020)
  s = M.bankInit(); M.bankLendToLimit(s, { ...p, rr: 0 }); eq(s.stop, 'capital', 'ch2 rr=0');
  says('ch2.p2', '10 万', '八成', '3%'); says('ch2.p5', '2020 年 3 月 26 日', '4.8 倍', '1.47 倍', '6.2%');
}

/* ch3 · bank run, defaults lam 30%, s 0.5, rumour 25% */
{
  const p = { lam: 0.3, s: 0.5 };
  near(M.runThreshold(p), 0.475, 1e-12, 'ch3 threshold'); says('ch3.p3', '47.5%', '30%', '1.44', '80 人', '16 个', '65 人');
  near(M.runV(0.2, p), 1.4375, 1e-12, 'ch3 payout if nobody panics');
  near(M.runCriticalRumour(p) * 80, 16, 1e-9, 'ch3 smallest rumour that sets off a run (people)');
  // the cascade starts below the threshold: 20 who need cash + 16 = 36% < 47.5%, because the most nervous act up to eta early
  near((M.RUN.pi * M.RUN.N + M.runCriticalRumour(p) * 80), 36, 1e-9, 'ch3 queue when the cascade starts'); n++; assert(0.36 < M.runThreshold(p) && 0.36 + M.RUN.eta > M.runThreshold(p), 'ch3 cascade begins short of the tipping point');
  says('ch3.p3', '36%', '20 人');
  const run = M.runSim({ ...p, rho: 0.25 }); eq([run.rumour, run.cascade, run.withdrawn, run.paid, run.unpaid, run.failed], [20, 60, 100, 65, 35, true], 'ch3 default run');
  const calm = M.runSim({ ...p, rho: 15 / 80 }); eq([calm.failed, calm.cascade], [false, 0], 'ch3 rumour of 15 dies out');
  eq(M.RUN.R, 1.5, 'ch3 loan return'); says('ch3.lab.how', '1.5 倍', '20 个人');
  eq(Math.round(M.RUN.pi * M.RUN.N), 20, 'ch3 impatient depositors');
  // fire-sale value 1: no threshold, no run
  near(M.runThreshold({ lam: 0.3, s: 1 }), 1, 1e-12, 'ch3 s = 1 removes the threshold'); eq(M.runCriticalRumour({ lam: 0.3, s: 1 }), null, 'ch3 s = 1: no run'); says('ch3.p5', '10 成', '25 万美元', '50 万元', '2015 年 5 月 1 日');
  const ins = M.runSim({ ...p, rho: 0.25, insured: true }); eq([ins.failed, ins.insurerCost, ins.withdrawn], [false, 0, 40], 'ch3 insured: no cascade, insurer pays nothing');
  says('ch3.p4', '420 亿美元', '1000 亿美元', '2023 年 3 月 9 日', '1983');
}

/* ch4 · the quantity machine, money growth 2% → 8% */
{
  const r = M.qtmPath({ gM: 0.08, gV: 0 });
  const gapMax = r.reduce((a, x) => x.gap > a.gap ? x : a), inflMax = r.reduce((a, x) => x.infl > a.infl ? x : a);
  eq(gapMax.t, 2, 'ch4 output boom peaks in year 2'); near(gapMax.gap * 100, 4.9, 0.05, 'ch4 boom size');
  eq(inflMax.t, 4, 'ch4 inflation peaks in year 4'); near(inflMax.infl * 100, 8.0, 0.05, 'ch4 inflation peak');
  near(r[r.length - 1].infl * 100, 5.9, 0.05, 'ch4 inflation after 30 years'); near(M.qtmLongRun(0.08, 0) * 100, 5.88, 0.005, 'ch4 long run 1.08/1.02−1');
  n++; assert(r.filter(x => x.t >= 5 && x.t <= 9).every(x => x.gap < 0), 'ch4 output below normal in years 5–9 (overshoot)');
  says('ch4.p3', '2%', '8%', '第 2 年', '4.9%', '第 4 年', '8.0%', '5.9%', '1.08 ÷ 1.02 − 1');
  near(M.qtmLongRun(0.08, -0.03) * 100, 2.7, 0.05, 'ch4 velocity −3%'); says('ch4.p4', '−3%', '2.7%', '4.8 倍', '1.8%', '2.17', '1.13');
  const flat = M.qtmPath({ gM: 0.02, gV: 0 }); n++; assert(flat.every(x => Math.abs(x.infl) < 1e-12), 'ch4 history: 2% money growth leaves prices still');
  const sh = M.qtmPath({ gM: 0.02, gV: 0, shockYear: 10 }).find(x => x.t === 10); n++; assert(sh.infl > 0.07 && sh.gap < -0.05, 'ch4 supply shock: prices up, output down');
  const shp = M.qtmPath({ gM: 0.02, gV: 0, shockYear: 10 }); near(shp[shp.length - 1].Prel, 1, 0.02, 'ch4 supply shock: with money unchanged the price level drifts back');
  // prose: with money unchanged, the slump makes prices actually fall back (deflation in the model), and output later swings above normal
  { const after = shp.filter(x => x.t > 10 && x.t <= 20); n++; assert(Math.min(...after.map(x => x.infl)) < -0.03, 'ch4 after the shock prices fall');
    n++; assert(Math.max(...after.map(x => x.gap)) > 0.03, 'ch4 after the slump output swings above normal'); says('ch4.p5', '物价真的往下走', '来回摆'); }
  eq(M.QTM.shock, 0.08, 'ch4 shock size'); says('ch4.lab.how', '8%'); says('ch4.p5', '40%', '9.1%');
}

/* ch5 · winners and losers, expected 2%, actual 8% for four years */
{
  const w = M.winPath({ a: 0.08, e: 0.02, lag: 1 });
  near(w.i * 100, 4.04, 0.005, 'ch5 contract rate'); near(w.planEnd, 121.9, 0.05, 'ch5 plan'); near(w.saverEnd, 97.0, 0.05, 'ch5 saver'); near(w.transfer, 24.9, 0.05, 'ch5 transfer');
  near((1 - w.rows[1].wage) * 100, 5.6, 0.05, 'ch5 real wage dip'); near(w.wageLost * 12, 2.7, 0.05, 'ch5 months lost, lag 1');
  near(M.winPath({ a: 0.08, e: 0.02, lag: 2 }).wageLost * 12, 5.2, 0.05, 'ch5 months lost, lag 2');
  says('ch5.p2', '2%', '8%', '121.9', '97.0', '24.9', '5.6%', '2.7 个月', '5.2 个月');
  const ant = M.winPath({ a: 0.08, e: 0.08, lag: 1 }); near(ant.i * 100, 10.16, 0.005, 'ch5 anticipated rate'); near(ant.saverEnd, 121.9, 0.05, 'ch5 anticipated saver'); near(ant.transfer, 0, 1e-9, 'ch5 no transfer');
  says('ch5.p3', '8%', '10.16%', '121.9'); says('ch5.lab.how', '4.04%');
  near(M.winPath({ a: 0.08, e: 0.02, lag: 0 }).wageLost, 0, 1e-12, 'ch5 no lag, no loss');
  eq(M.WIN.burst, 4, 'ch5 four surprise years');
}

/* ch6 · present value */
{
  near(M.pv(104, 0.04, 1), 100, 1e-9, 'ch6 104 in a year'); near(M.pv(100, 0.04, 10), 67.6, 0.05, 'ch6 100 in ten years');
  says('ch6.p2', '4%', '104 元', '100 元', '67.6 元'); says('ch6.p1', '4.04%', '2%');
}

/* ch7 · a 1,000,000 loan at 4% over 30 years */
{
  const p = { P: 1e6, rate: 0.04, years: 30 }, a = M.amortise(p), b = M.amortise({ ...p, extra: 1000 });
  near(a.M, 4774, 0.5, 'ch7 monthly payment'); near(a.firstInterestShare * 100, 69.8, 0.05, 'ch7 first month interest share');
  near(M.amortiseEarlyInterestShare(p, 60) * 100, 66.7, 0.05, 'ch7 first five years interest share');
  near(a.totInt / 1e4, 71.9, 0.05, 'ch7 total interest');
  near(b.months / 12, 21.6, 0.05, 'ch7 paid off with extra'); near((360 - b.months) / 12, 8.4, 0.05, 'ch7 years saved'); near((a.totInt - b.totInt) / 1e4, 22.5, 0.05, 'ch7 interest saved');
  near(M.amortise({ ...p, infl: 0.02 }).lastReal, 2640, 0.5, 'ch7 last payment in today’s money');
  says('ch7.p2', '100 万元', '4%', '30 年', '4774 元', '69.8%', '66.7%', '71.9 万元', '1000 元', '21.6 年', '8.4 年', '22.5 万元');
  says('ch7.p3', '2%', '4774 元', '2640 元');
}

/* ch8 · transmission, rise 2 points, 30% variable, fixed for 5 years, held 18 months */
{
  const t = M.transmit({ d: 2, v: 0.3, F: 5 });
  eq(t.peakSpendMonth, 19, 'ch8 spending trough'); eq(t.peakInflMonth, 25, 'ch8 inflation trough'); near(t.peakInfl, -0.43, 0.005, 'ch8 inflation trough depth');
  const all = M.transmit({ d: 2, v: 1, F: 5 }), none = M.transmit({ d: 2, v: 0, F: 5 });
  near(all.peakInfl, -0.60, 0.005, 'ch8 all variable'); n++; assert(all.peakInflMonth < t.peakInflMonth, 'ch8 all variable comes earlier');
  near(none.peakInfl, -0.35, 0.005, 'ch8 all fixed');
  eq(M.TR.hold, 18, 'ch8 hold'); says('ch8.lab.how', '18 个月');
  says('ch8.p2', '2 个百分点', '30%', '5 年', '第 19 个月', '第 25 个月', '0.43'); says('ch8.p3', '100%', '0.60', '0%', '0.35', '两到三年');
  // ordering: market before new-loan rate before spending before inflation
  const half = (key, sign) => t.rows.find(r => sign * r[key] >= 0.5 * Math.abs(key === 'spend' ? Math.min(...t.rows.map(x => x.spend)) : key === 'infl' ? t.peakInfl : 2)).t;
  const order = [half('market', 1), half('newRate', 1), half('spend', -1), half('infl', -1)]; n++; assert(order.every((x, i) => !i || x > order[i - 1]), 'ch8 chain order ' + order);
}

/* ch9 · burger and exchange rate */
{
  const p = { piH: 0.05, H: 4 }, s0 = M.fxAt(0, p), s20 = M.fxAt(20, p);
  eq([M.FX.home0, M.FX.abroad0], [20, 4], 'ch9 burger prices'); near(s0.ppp, 5, 1e-12, 'ch9 PPP at start'); near(s0.dear, 0.3, 1e-12, 'ch9 starts 30% dear');
  near(s20.ppp, 8.93, 0.005, 'ch9 PPP after 20 years'); near(M.fxYearsToWithin(p, 0.05), 9.75, 0.01, 'ch9 years to within 5%');
  says('ch9.p1', '20 元', '4 个外币', '5 元'); says('ch9.p3', '5%', '2%', '8.93', '30%', '5%', '9.75 年'); says('ch9.p4', '3 到 5 年', '4 年', '1986');
  eq(M.FX.piF, 0.02, 'ch9 foreign inflation');
}

console.log(`PASS: ${n} checks — every number in the prose matches models.js`);
