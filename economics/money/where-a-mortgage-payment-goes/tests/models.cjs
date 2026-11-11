'use strict';
// Pins every number the essay's prose states to the page's own models, and checks that the Chinese copy
// still says exactly that number (the phrase is built from the model output, not typed in).
// Also checks the annuity formula against an independent month-by-month simulation, the IRR solver against
// cases with known answers, and every live-sentence branch at the controls' extremes.
// Run: node economics/money/where-a-mortgage-payment-goes/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const M = require(path.join(__dirname, '..', 'models.js'));
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;
const enPath = path.join(__dirname, '..', 'copy.en.js');
if (fs.existsSync(enPath)) vm.runInNewContext(fs.readFileSync(enPath, 'utf8'), ctx);
const E = ctx.window.ESSAY_COPY.en || null;

let n = 0, fails = 0;
function check(name, got, want) { n++; if (got !== want) { fails++; console.error(`FAIL ${name}: got ${got}, expected ${want}`); } }
function near(name, got, want, tol) { n++; if (!(Math.abs(got - want) <= tol)) { fails++; console.error(`FAIL ${name}: got ${got}, expected ${want} ± ${tol}`); } }
function says(key, phrase) { n++; if (!Z[key] || !Z[key].includes(phrase)) { fails++; console.error(`FAIL prose ${key} should contain "${phrase}"`); } }
// the page's Chinese formats
const strip = s => s.replace(/\.?0+$/, '');
const wan = (x, d = 1) => strip((x / 1e4).toFixed(d)) + ' 万元';
const yuan = x => Math.round(x) + ' 元';
const pc = (x, d) => (x * 100).toFixed(d);
const dur = m => { const y = Math.floor(m / 12), r = m % 12; return y === 0 ? `${r} 个月` : r === 0 ? `${y} 年` : `${y} 年 ${r} 个月`; };

const P = 1e6, r = 0.04, N = 360, i = r / 12;
const A = M.amortise(P, r, N), Mx = A.M0;

/* ── hero ── */
says('hero.lead', `每月还 ${yuan(Mx)}`);
says('hero.lead', `${yuan(A.rows[0].int)}付了利息`); says('hero.lead', `只有 ${yuan(A.rows[0].prin)}`);
says('hero.lead', `约 ${wan(A.totPay)}`);
check('totPay = P + totInt', Math.round(A.totPay), Math.round(P + A.totInt));

/* ── ch1 three names ── */
{
  says('ch1.p1', `约 ${pc(M.periodic(r, 12), 3)}%`); says('ch1.p3', `月利率约 ${pc(M.periodic(r, 12), 3)}%`);
  says('ch1.p3', `滚满一年是约 ${pc(M.effective(r, 12), 2)}%`);
  says('ch1.p3', `变成约 ${wan(P * (1 + M.effective(r, 12)), 2)}`);
  says('ch1.p3', `${pc(M.effective(r, 12), 2)}% 叫<strong>实际年利率`);
  says('ch1.p3', `只差约 ${pc(M.effective(r, 12) - r, 2)} 个百分点`);
  says('ch1.p3', `实际利率是 ${pc(M.effective(0.24, 12), 2)}%`);
  check('ch1 24% gap is "nearly 3 points"', (M.effective(0.24, 12) - 0.24) * 100 > 2.5 && (M.effective(0.24, 12) - 0.24) * 100 < 3, true);
  says('ch1.p3', `4% 只变成 ${pc(M.effective(r, 365), 2)}%`);
  // the staircase ends where the effective rate says it does, and the limit e^r bounds it
  const st = M.staircase(P, r, 12); near('ch1 staircase end', st[12][1], P * (1 + M.effective(r, 12)), 1e-6);
  check('ch1 effective < e^r − 1', M.effective(r, 365) < Math.exp(r) - 1, true);
  near('ch1 nominal from effective round-trip', M.nominalFromEffective(M.effective(0.07, 12), 12), 0.07, 1e-12);
  near('ch1 m=1 effective = nominal', M.effective(0.05, 1), 0.05, 1e-15);
}

/* ── ch2 the payment: formula against an independent month-by-month simulation ── */
{
  // find the payment that zeroes the balance after N months by bisection on the raw loop (no formula used)
  for (const [PP, rr, nn] of [[1e6, 0.04, 360], [5e5, 0.03, 240], [2e5, 0.08, 120], [1e6, 0.065, 300], [3e4, 0.15, 36]]) {
    const ii = rr / 12; let lo = 0, hi = PP;
    for (let k = 0; k < 200; k++) { const mid = (lo + hi) / 2; if (M.simulateFixed(PP, ii, mid, nn).end > 0) lo = mid; else hi = mid; }
    near(`ch2 formula = simulation ${PP}/${rr}/${nn}`, M.payment(PP, ii, nn), (lo + hi) / 2, 1e-6);
    // closed-form balance equals the loop at every month
    const sim = M.simulateFixed(PP, ii, M.payment(PP, ii, nn), nn).path;
    for (const k of [1, 12, Math.floor(nn / 2), nn]) near(`ch2 balanceAfter k=${k}`, M.balanceAfter(PP, ii, M.payment(PP, ii, nn), k), sim[k], 1e-5);
    // present-value reading: the payments discounted at i are worth P
    let pv = 0; for (let k = 1; k <= nn; k++) pv += M.payment(PP, ii, nn) / Math.pow(1 + ii, k); near('ch2 PV of payments = P', pv, PP, 1e-6);
  }
  near('ch2 zero rate', M.payment(1200, 0, 12), 100, 1e-12);
  check('ch2 M', Mx.toFixed(2), '4774.15'); says('ch2.p3', `是约 ${yuan(Mx)}`);
  says('ch2.p3', `约 ${yuan(P * i)}`);
  says('ch2.p3', `100 万元 × ${pc(i, 3)}%`);
  const g4 = M.simulateFixed(P, i, 4000, N).end; says('ch2.p3', `猜 4000 元，30 年后还欠约 ${wan(g4)}`);
  says('ch2.p3', `要还 ${dur(M.payoffMonth(P, i, 4000))}才还清`);
  says('ch2.p3', `猜 ${Math.floor(P * i)} 元以下`);
  check('ch2 below interest never ends', M.payoffMonth(P, i, 3330), null);
  check('ch2 3330 balance grows', M.simulateFixed(P, i, 3330, N).end > P, true);
  // every live-sentence branch, at the slider's extremes and around the answer (the page's own rules)
  const branch = g => g <= P * i ? 'below' : M.payoffMonth(P, i, g, 1200) == null ? 'slow' : M.payoffMonth(P, i, g) > N ? 'low' : M.payoffMonth(P, i, g) === N ? 'near' : 'high';
  check('ch2 branch 3000', branch(3000), 'below'); check('ch2 branch 3340', branch(3340), 'slow'); check('ch2 branch 4000', branch(4000), 'low');
  check('ch2 branch 4770', branch(4770), 'low'); check('ch2 branch 4780', branch(4780), 'near'); check('ch2 branch 4800', branch(4800), 'high'); check('ch2 branch 7000', branch(7000), 'high');
  check('ch2 4770 pays off in month 361', M.payoffMonth(P, i, 4770), 361);
  check('ch2 4774.16 pays in month 360 (near)', branch(4774.16), 'near');
  for (const k of ['ch2.say.below', 'ch2.say.slow', 'ch2.say.low', 'ch2.say.near', 'ch2.say.exact', 'ch2.say.high']) check('ch2 key ' + k, typeof Z[k], 'string');
}

/* ── ch3 the schedule ── */
{
  says('ch3.p2', `利息约 ${yuan(A.rows[0].int)}`); says('ch3.p2', `只有约 ${yuan(A.rows[0].prin)}减了本金`);
  says('ch3.p2', `少了约 ${Math.round(A.rows[0].int - A.rows[1].int)} 元`);
  near('ch3 principal grows by (1+i) a month', A.rows[1].prin / A.rows[0].prin, 1 + i, 1e-12);
  says('ch3.p2', `多 ${pc(i, 3)}%`);
  const c = M.crossover(A.rows); check('ch3 crossover', c, 153); says('ch3.p3', `第 ${c} 个月`); says('ch3.p3', `第 ${Math.ceil(c / 12)} 年`);
  const paid10 = A.rows.slice(0, 120).reduce((s, q) => s + q.pay, 0), prin10 = P - A.rows[119].bal;
  says('ch3.p3', `约 ${wan(paid10)}`); says('ch3.p3', `只有约 ${wan(prin10)}减了本金`);
  says('ch3.p3', `利息一共约 ${wan(A.totInt)}`);
  check('ch3 3% crossover', M.crossover(M.amortise(P, 0.03, N).rows), 84); says('ch3.p4', `提前到第 ${M.crossover(M.amortise(P, 0.03, N).rows)} 个月`);
  check('ch3 2% crossover in month 1', M.crossover(M.amortise(P, 0.02, N).rows), 1);
  const a20 = M.amortise(P, r, 240); says('ch3.p4', `月供变成约 ${yuan(a20.M0)}`); says('ch3.p4', `转折点在第 ${M.crossover(a20.rows)} 个月`); says('ch3.p4', `总利息约 ${wan(a20.totInt)}`);
  // interest = i × the sum of opening balances, month by month (the rule the whole essay rests on)
  near('ch3 totInt = i × balance-months', A.totInt, i * M.balanceMonths(A.rows), 1e-6);
  check('ch3 ends at zero', Math.abs(A.rows[N - 1].bal) < 1e-6, true);
  // live sentence branches: start (low rate), before, after
  const br = (rr, years, k) => { const a = M.amortise(P, rr, years * 12), cc = M.crossover(a.rows); return cc === 1 ? 'start' : k < cc ? 'before' : 'after'; };
  check('ch3 branch 1%/10y', br(0.01, 10, 1), 'start'); check('ch3 branch 8%/30y k1', br(0.08, 30, 1), 'before'); check('ch3 branch 8%/30y k360', br(0.08, 30, 360), 'after');
  check('ch3 8%/30y crossover exists', M.crossover(M.amortise(P, 0.08, 360).rows) > 1, true);
}

/* ── ch4 equal principal ── */
{
  const E = M.equalPrincipal(P, r, N);
  near('ch4 closed form total interest', E.totInt, M.equalPrincipalInterest(P, r, N), 1e-6);
  says('ch4.p1', `约 ${yuan(P / N)}`);
  says('ch4.p3', `约 ${yuan(E.rows[0].pay)}`); says('ch4.p3', `多约 ${yuan(E.rows[0].pay - Mx)}`);
  const below = E.rows.find(q => q.pay < Mx).m; check('ch4 EP below annuity from', below, 146); says('ch4.p3', `要到第 ${below} 个月`);
  says('ch4.p3', `只还约 ${yuan(E.rows[N - 1].pay)}`);
  says('ch4.p3', `总利息约 ${wan(E.totInt)}`); says('ch4.p3', `少约 ${wan(A.totInt - E.totInt)}`);
  says('ch4.p3', `等额本息欠着约 ${wan(M.balanceMonths(A.rows) / N)}`); says('ch4.p3', `只欠着约 ${wan(M.balanceMonths(E.rows) / N)}`);
  near('ch4 EP interest = i × balance-months', E.totInt, i * M.balanceMonths(E.rows), 1e-6);
  // the honest comparison: at the loan rate both repay exactly P
  near('ch4 PV annuity', M.pvPayments(A.rows, i), P, 1e-5); near('ch4 PV equal principal', M.pvPayments(E.rows, i), P, 1e-5);
  // and the interest ratio equals the balance ratio at every rate and term the sliders allow
  for (const rr of [0.01, 0.04, 0.08]) for (const yy of [10, 30]) {
    const a = M.amortise(P, rr, yy * 12), e = M.equalPrincipal(P, rr, yy * 12);
    near(`ch4 ratio ${rr}/${yy}`, a.totInt / e.totInt, M.balanceMonths(a.rows) / M.balanceMonths(e.rows), 1e-9);
    check(`ch4 annuity costs more ${rr}/${yy}`, a.totInt > e.totInt, true);
  }
}

/* ── ch5 prepayment ── */
{
  const T = M.prepay(P, r, N, 1e5, 60, 'term'), Q = M.prepay(P, r, N, 1e5, 60, 'payment');
  says('ch5.p3', `早 ${dur(T.monthsSooner)}还完`); says('ch5.p3', `利息少付约 ${wan(T.saved)}；`);
  says('ch5.p3', `降到约 ${yuan(Q.newPay)}`); says('ch5.p3', `利息少付约 ${wan(Q.saved)}。`);
  check('ch5 "more than two times"', T.saved / Q.saved > 2 && T.saved / Q.saved < 3, true);
  // both modes remove exactly X of present value at the loan rate
  near('ch5 PV drop term', M.pvFrom(T.base.rows, 60, i) - M.pvFrom(T.alt.rows, 60, i), 1e5, 1e-5);
  near('ch5 PV drop payment', M.pvFrom(Q.base.rows, 60, i) - M.pvFrom(Q.alt.rows, 60, i), 1e5, 1e-5);
  near('ch5 PV of everything still P (term)', M.pvPayments(T.alt.rows, i), P, 1e-5);
  const s1 = M.prepay(P, r, N, 1e5, 12, 'term').saved, s20 = M.prepay(P, r, N, 1e5, 240, 'term').saved;
  says('ch5.p5', `第 1 年末还能省约 ${wan(s1)}`); says('ch5.p5', `第 20 年末还只省约 ${wan(s20)}`);
  // saving falls with the month of prepayment, in both modes
  for (const mode of ['term', 'payment']) { const cv = M.savingCurve(P, r, N, 1e5, mode, 12); check('ch5 curve falls ' + mode, cv.every((p, k) => k === 0 || p[1] < cv[k - 1][1]), true); }
  // live sentence branches: payoff when X ≥ balance (50万 at year 29), otherwise term/payment
  const balAt = y => A.rows[y * 12 - 1].bal;
  check('ch5 payoff branch reachable', 5e5 >= balAt(29), true); check('ch5 no payoff at year 1 with 50万', 5e5 < balAt(1), true);
  const po = M.prepay(P, r, N, 5e5, 348, 'term'); check('ch5 payoff ends at that month', po.alt.months, 348);
  check('ch5 1万 at year 29 is not a payoff', 1e4 < balAt(29), true);
}

/* ── ch6 rate change ── */
{
  const up = M.rateChange(P, r, N, 36, 0.05, 'repay'), keep = M.rateChange(P, r, N, 36, 0.05, 'keep');
  says('ch6.p3', `还欠约 ${wan(up.balK)}`); says('ch6.p3', `涨到约 ${yuan(up.payAfter)}`); says('ch6.p3', `总利息多付约 ${wan(up.extraInterest)}。`);
  says('ch6.p3', `剩下的 ${dur(N - 36)}重算`);
  says('ch6.p3', `要多还 ${dur(keep.months - N)}`); says('ch6.p3', `总利息多付约 ${wan(keep.extraInterest)}。`);
  const thr = 12 * Mx / up.balK; says('ch6.p4', `超过约 ${pc(thr, 2)}%`); says('ch6.p4', `涨约 ${pc(thr - r, 2)} 个百分点`);
  check('ch6 just below threshold the payment covers interest', M.keepCovers(up.balK, thr - 1e-4, Mx), true); check('ch6 just above it does not', M.keepCovers(up.balK, thr + 1e-4, Mx), false);
  check('ch6 +2 points (below threshold) still ends', M.rateChange(P, r, N, 36, 0.06, 'keep').neverEnds, false);
  check('ch6 just above threshold never ends', M.rateChange(P, r, N, 36, thr + 1e-4, 'keep').neverEnds, true);
  // repricing over the remaining term still ends at month N with zero balance; extremes of the sliders
  for (const [y, d] of [[1, 0.03], [1, -0.03], [29, 0.03], [29, -0.03]]) {
    const q = M.rateChange(P, r, N, y * 12, r + d, 'repay'); check(`ch6 repay ends at N y${y} d${d}`, q.months, N);
    near(`ch6 repay PV at new rate y${y}`, M.pvFrom(q.alt.rows, y * 12, (r + d) / 12), q.balK, 1e-5);
  }
  // branch table for the live sentence (the page's own rule)
  const br = (y, d, mode) => { const q = M.rateChange(P, r, N, y * 12, r + d, mode); return Math.abs(d) < 1e-12 ? 'same' : mode === 'repay' ? (d > 0 ? 'repayUp' : 'repayDown') : (q.neverEnds || !M.keepCovers(q.balK, r + d, Mx)) ? 'never' : d > 0 ? 'keepUp' : 'keepDown'; };
  check('ch6 br same', br(3, 0, 'keep'), 'same'); check('ch6 br repayUp', br(3, 0.03, 'repay'), 'repayUp'); check('ch6 br repayDown', br(29, -0.03, 'repay'), 'repayDown');
  check('ch6 br keepUp', br(3, 0.01, 'keep'), 'keepUp'); check('ch6 br keepDown', br(1, -0.03, 'keep'), 'keepDown'); check('ch6 br never', br(1, 0.03, 'keep'), 'never');
  // late in the loan even +3 points is covered by the old payment
  check('ch6 +3 at year 29 keep still ends', br(29, 0.03, 'keep'), 'keepUp');
  check('ch6 no change = base', M.rateChange(P, r, N, 36, r, 'keep').extraInterest, 0);
}

/* ── ch7 IRR ── */
{
  // known answers
  near('irr: borrow 100, repay 110', M.irr([100, -110]), 0.10, 1e-12);
  // 100 = 60/x + 60/x², x = 1 + j  →  100x² − 60x − 60 = 0
  near('irr: borrow 100, repay 60 + 60', M.irr([100, -60, -60]), (60 + Math.sqrt(3600 + 24000)) / 200 - 1, 1e-12);
  near('irr: zero-interest plan', M.irr([1200].concat(Array(12).fill(-100))), 0, 1e-12);
  for (const [PP, rr, nn] of [[1e6, 0.04, 360], [5e4, 0.12, 24], [2e5, 0.065, 180]]) near(`irr recovers the loan rate ${rr}`, M.irr(M.loanFlows(PP, rr, nn)) * 12, rr, 1e-10);
  // independent solver (Newton from a different start) agrees
  const newton = fl => { let j = 0.05; for (let k = 0; k < 100; k++) { let f = 0, d = 0; fl.forEach((c, t) => { f += c / Math.pow(1 + j, t); d += -t * c / Math.pow(1 + j, t + 1); }); j -= f / d; } return j; };
  const F = M.flatPlan(12000, 0.006, 12, 0);
  near('ch7 bisection = Newton', F.j, newton(F.flows), 1e-12);
  check('ch7 payment', F.pay, 1072); says('ch7.p1', `一共 ${F.pay} 元`); says('ch7.p1', `一年手续费 ${Math.round(F.totalFee)} 元`);
  says('ch7.p1', `12000 × 0.6% = ${Math.round(12000 * 0.006)} 元`); says('ch7.p1', `= ${pc(F.quoted, 1)}%`);
  check('ch7 avg owed', F.avgOwed, 6500); says('ch7.p2', `只欠着 ${F.avgOwed} 元`);
  says('ch7.p3', `每月付出 ${F.pay} 元`);
  says('ch7.p3', `月利率约 ${pc(F.j, 3)}%`); says('ch7.p3', `乘 12 约 ${pc(F.apr, 1)}%`); says('ch7.p3', `滚一年约 ${pc(F.ear, 1)}%`);
  says('ch7.p3', `约 ${F.ratio.toFixed(2)} 倍`);
  const f3 = M.flatPlan(12000, 0.006, 3), f24 = M.flatPlan(12000, 0.006, 24), f36 = M.flatPlan(12000, 0.006, 36);
  says('ch7.p3', `3 期时约 ${f3.ratio.toFixed(2)} 倍`); says('ch7.p3', `24 期时约 ${f24.ratio.toFixed(2)} 倍`);
  check('ch7 36 periods falls back', f36.ratio < f24.ratio, true);
  says('ch7.p5', `${pc(F.apr, 1)}% 和 ${pc(F.ear, 1)}%`);
  // the mortgage through the same solver
  near('ch7 mortgage IRR = 4%', M.irr(M.loanFlows(P, r, N)) * 12, r, 1e-12);
  says('ch7.p4', `月利率 ${pc(i, 3)}%`);
  const fee30 = M.irr(M.loanFlows(P, r, N, 0.01)) * 12, fee5 = M.irr(M.loanFlows(P, r, N, 0.01, 60)) * 12;
  says('ch7.p4', `变成约 ${pc(fee30, 2)}%`); says('ch7.p4', `真实年利率约 ${pc(fee5, 2)}%`);
  check('ch7 a fee weighs more over a shorter time', fee5 > fee30, true);
  // NPV is increasing in the trial rate for borrower flows (one inflow, then outflows) → one root
  let mono = true, prev = -Infinity; for (let k = 0; k <= 100; k++) { const v = M.npv(k / 100 / 12, F.flows); if (v < prev) mono = false; prev = v; } check('ch7 NPV monotone', mono, true);
  // the slider extremes all solve
  for (const f of [0.002, 0.015]) for (const nn of [3, 36]) for (const u of [0, 0.05]) { const q = M.flatPlan(12000, f, nn, u); check(`ch7 solves f${f} n${nn} u${u}`, isFinite(q.j) && q.apr > q.quoted, true); }
  for (const k of ['ch7.say.plain', 'ch7.say.fee']) check('ch7 key ' + k, typeof Z[k], 'string');
}

/* ── ch8 inflation and the alternative ── */
{
  const ear = M.effective(r, 12);
  says('ch8.p2', `只相当于今天的约 ${yuan(M.realValue(Mx, N, 0.02))}`);
  says('ch8.p2', `合计约 ${wan(A.totPay)}`); says('ch8.p2', `换成今天的钱约 ${wan(M.realTotals(A.rows, 0.02))}`);
  says('ch8.p2', `有效年利率 ${pc(ear, 2)}%`);
  // "实际" is not used for the effective rate in ch8, where it would read as "real" (after inflation)
  check('ch8 effective vs real wording', /实际年利率|实际利率是/.test(Z['ch8.p2']), false);
  near('ch8 inflation = effective rate → real total = P', M.realTotals(A.rows, ear), P, 1e-5);
  near('ch8 real rate zero then', M.realRate(ear, ear), 0, 1e-15);
  const T = M.prepay(P, r, N, 1e5, 60, 'term'); says('ch8.p3', `在第 ${dur(T.alt.months)}还完`);
  // break-even exactly at the loan rate, sign on either side, independent of inflation (a common factor)
  near('ch8 break-even at g = r', M.prepayOrInvest(P, r, N, 1e5, 60, r).diff, 0, 1e-6);
  check('ch8 g < r → prepay ahead', M.prepayOrInvest(P, r, N, 1e5, 60, 0.03).diff > 0, true);
  check('ch8 g > r → invest ahead', M.prepayOrInvest(P, r, N, 1e5, 60, 0.05).diff < 0, true);
  near('ch8 g = 0 → difference = interest saved', M.prepayOrInvest(P, r, N, 1e5, 60, 0).diff, T.saved, 1e-6);
  says('ch8.p3', `约 ${wan(T.saved)}利息`);
  says('ch8.p3', `贷款利率 ${Math.round(r * 100)}%`);
  for (const k of ['ch8.say.prepay', 'ch8.say.equal', 'ch8.say.invest', 'ch8.say.real']) check('ch8 key ' + k, typeof Z[k], 'string');
  // slider grid hits g = 4% exactly (0.25 steps) so the "equal" sentence is reachable
  check('ch8 equal reachable', [...Array(33).keys()].some(k => Math.abs(k * 0.25 / 100 - r) < 1e-12), true);
}

/* ── English copy: same keys and placeholders; the same model numbers in English formats ── */
if (E) {
  const zk = Object.keys(Z), ek = Object.keys(E);
  check('en/zh same keys', JSON.stringify(zk.filter(k => !(k in E)).concat(ek.filter(k => !(k in Z)))), '[]');
  for (const k of zk) { const ph = s => (String(s).match(/\{\w+\}/g) || []).sort().join(); check('placeholders ' + k, ph(E[k] || ''), ph(Z[k])); }
  const CJK = /[\u3000-\u303f\u3400-\u9fff\uff00-\uffef]/;
  for (const [k, v] of Object.entries(E)) check('no CJK in en ' + k, CJK.test(v), false);
  const sayE = (key, phrase) => { n++; if (!E[key] || !E[key].includes(phrase)) { fails++; console.error(`FAIL en prose ${key} should contain "${phrase}"`); } };
  const g = x => Math.round(x).toLocaleString('en-US');
  const k1 = x => (Math.round(x / 1000) * 1000).toLocaleString('en-US');           // "about ¥149,000"
  const durE = m => { const y = Math.floor(m / 12), r = m % 12, Y = `${y} year${y === 1 ? '' : 's'}`, R = `${r} month${r === 1 ? '' : 's'}`; return y === 0 ? R : r === 0 ? Y : `${Y} ${R}`; };
  sayE('hero.lead', `¥${g(Mx)} a month`); sayE('hero.lead', `¥${g(A.rows[0].int)} pays interest`); sayE('hero.lead', `only ¥${g(A.rows[0].prin)}`); sayE('hero.lead', `about ¥${k1(A.totPay)}`);
  sayE('ch1.p3', `about ${pc(M.effective(r, 12), 2)}%`); sayE('ch1.p3', `about ¥${(Math.round(P * (1 + M.effective(r, 12)) / 100) * 100).toLocaleString('en-US')}`);
  sayE('ch1.p3', `${pc(M.effective(0.24, 12), 2)}%`); sayE('ch1.p3', `only to ${pc(M.effective(r, 365), 2)}%`);
  sayE('ch2.p3', `about ¥${k1(M.simulateFixed(P, i, 4000, N).end)} is still owed`); sayE('ch2.p3', `taking ${durE(M.payoffMonth(P, i, 4000))} to pay off`); sayE('ch2.p3', `about ¥${g(Mx)}`);
  const c = M.crossover(A.rows); sayE('ch3.p3', `month ${c}`); sayE('ch3.p3', `about ¥${k1(A.totInt)}`);
  const Eq = M.equalPrincipal(P, r, N); sayE('ch4.p3', `about ¥${g(Eq.rows[0].pay)}`); sayE('ch4.p3', `month ${Eq.rows.find(q => q.pay < Mx).m}`);
  sayE('ch4.p3', `about ¥${k1(Eq.totInt)}`); sayE('ch4.p3', `about ¥${k1(A.totInt - Eq.totInt)} less`);
  const T = M.prepay(P, r, N, 1e5, 60, 'term'), Q = M.prepay(P, r, N, 1e5, 60, 'payment');
  sayE('ch5.p3', `ends ${durE(T.monthsSooner)} earlier`); sayE('ch5.p3', `saves about ¥${k1(T.saved)}`); sayE('ch5.p3', `about ¥${g(Q.newPay)}`); sayE('ch5.p3', `saves about ¥${k1(Q.saved)}`);
  sayE('ch5.p5', `about ¥${k1(M.prepay(P, r, N, 1e5, 12, 'term').saved)}`); sayE('ch5.p5', `about ¥${k1(M.prepay(P, r, N, 1e5, 240, 'term').saved)}`);
  const up = M.rateChange(P, r, N, 36, 0.05, 'repay'), keep = M.rateChange(P, r, N, 36, 0.05, 'keep');
  sayE('ch6.p3', `about ¥${k1(up.balK)}`); sayE('ch6.p3', `about ¥${g(up.payAfter)}`); sayE('ch6.p3', `about ¥${k1(up.extraInterest)} more`);
  sayE('ch6.p3', `takes ${durE(keep.months - N)} longer`); sayE('ch6.p3', `about ¥${k1(keep.extraInterest)} more`);
  sayE('ch6.p4', `about ${pc(12 * Mx / up.balK, 2)}%`);
  const F = M.flatPlan(12000, 0.006, 12, 0); sayE('ch7.p3', `about ${pc(F.apr, 1)}%`); sayE('ch7.p3', `about ${pc(F.ear, 1)}%`); sayE('ch7.p3', `about ${F.ratio.toFixed(2)} times`);
  sayE('ch7.p4', `about ${pc(M.irr(M.loanFlows(P, r, N, 0.01)) * 12, 2)}%`); sayE('ch7.p4', `about ${pc(M.irr(M.loanFlows(P, r, N, 0.01, 60)) * 12, 2)}%`);
  sayE('ch7.p5', `${pc(F.apr, 1)}% under one definition and ${pc(F.ear, 1)}%`);
  sayE('ch8.p2', `about ¥${g(M.realValue(Mx, N, 0.02))}`); sayE('ch8.p2', `about ¥${k1(M.realTotals(A.rows, 0.02))}`); sayE('ch8.p2', `effective annual rate of ${pc(M.effective(r, 12), 2)}%`);
  sayE('ch8.p3', `about ¥${k1(T.saved)}`);
  // both prepayment treatments remove the same present value only at the loan rate: at another rate they differ (the prose says so)
  const j3 = 0.03 / 12, dT = M.pvFrom(T.base.rows, 60, j3) - M.pvFrom(T.alt.rows, 60, j3), dQ = M.pvFrom(Q.base.rows, 60, j3) - M.pvFrom(Q.alt.rows, 60, j3);
  check('ch5 PV drops differ at 3%', Math.abs(dT - dQ) > 1000, true);
  says('ch5.p4', '只在按贷款利率折现时成立'); sayE('ch5.p4', 'only when the payments are discounted at the loan rate');
  // the same for the two repayment methods in ch4
  const A3 = M.pvPayments(A.rows, j3), E3 = M.pvPayments(Eq.rows, j3); check('ch4 PVs differ at 3%', Math.abs(A3 - E3) > 1000, true);
  // ch7 convention examples quoted from the PBoC announcement: 20-year equal-payment 100万 loan at 5% → 5% simple, 5.12% by IRR
  const pb = M.irr(M.loanFlows(1e6, 0.05, 240)); check('PBoC example simple 5%', (pb * 12 * 100).toFixed(2), '5.00'); check('PBoC example IRR 5.12%', ((Math.pow(1 + pb, 12) - 1) * 100).toFixed(2), '5.12');
  check('PBoC example payment 6599.6', M.payment(1e6, 0.05 / 12, 240).toFixed(1), '6599.6');
  says('ch7.p5', '约 5.12%'); sayE('ch7.p5', 'about 5.12%');
  says('ch7.p5', '2026 年 11 月 20 日'); sayE('ch7.p5', '20 November 2026');
}

/* ── copy hygiene: placeholders used by the page exist; no key empty ── */
for (const [k, v] of Object.entries(Z)) { n++; if (typeof v !== 'string' || !v.trim()) { fails++; console.error('FAIL empty copy key ' + k); } }

if (fails) { console.error(`${fails} of ${n} checks failed`); process.exit(1); }
console.log(`PASS: ${n} checks (models, formula vs simulation, IRR known answers, prose numbers, sentence branches)`);
