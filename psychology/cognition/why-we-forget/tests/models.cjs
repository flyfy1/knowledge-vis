// Model and prose test for "Why we forget".
// 1. Every number in the Chinese prose is recomputed from models.js (model output) or read from the transcribed
//    data in models.js (measured), and the prose is checked to contain it. Each block names the table, figure or
//    passage the data came from.
// 2. Every live-sentence branch the page can show is reached by sweeping the controls over their whole range,
//    every placeholder is filled, and what each branch claims is checked against the numbers it is shown with.
// 3. No Chinese in app.js / models.js / index.html outside the allowed spots.
// Run: node psychology/cognition/why-we-forget/tests/models.cjs
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..');
const M = require(path.join(DIR, 'models.js'));
global.window = {};
require(path.join(DIR, 'copy.zh.js'));
const Z = global.window.ESSAY_COPY.zh;
const DAY = M.DAY;

let fails = 0, checks = 0;
function ok(cond, msg) { checks++; if (!cond) { fails++; console.error('FAIL ' + msg); } }
const strip = s => s.replace(/<sup>/g, '').replace(/<\/sup>/g, '').replace(/<[^>]+>/g, '');
function has(key, ...needles) {
  ok(Z[key] != null, `copy key ${key} exists`);
  if (Z[key] == null) return;
  const s = strip(Z[key]);
  for (const n of needles) ok(s.includes(n), `${key} contains "${n}"`);
}
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b} (±${tol})`);
// the page's number formatting (zh-CN)
const fmt = (x, d = 0) => (Math.abs(x) < 0.5 * Math.pow(10, -d) ? 0 : x).toLocaleString('zh-CN', { minimumFractionDigits: d, maximumFractionDigits: d });
const pct = x => { const v = x * 100; return v >= 10 ? fmt(v, 0) : v >= 0.1 ? fmt(v, 1) : v > 0 ? '<' + fmt(0.1, 1) : '0'; };
const roundNice = x => (x >= 100 ? Math.round(x / 10) * 10 : Math.round(x));
function fill(key, vars) {
  ok(Z[key] != null, `template ${key} exists`);
  const s = (Z[key] || '').replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m));
  ok(!/\{\w+\}/.test(s), `${key}: every placeholder filled (${s.match(/\{\w+\}/g)})`);
  ok(!/NaN|undefined|Infinity/.test(s), `${key}: no NaN/undefined`);
  return s;
}
const reached = new Set();
const use = (k, vars) => { reached.add(k); return fill(k, vars); };

/* ───────── ch1: Murre & Dros 2015, Table 3 (savings) and Table 5 (power fits) ───────── */
{
  const F = M.forgetting, E = F.DATA.ebb;
  // measured, Table 3 (Ebbinghaus 1885 column)
  ok(E.t[0] === 19 * 60 && E.t[6] === 31 * DAY, 'Ebbinghaus intervals 19 min … 31 days');
  has('ch1.p2', '19 分钟', '31 天', fmt(E.q[0] * 100, 1) + '%', fmt(E.q[3] * 100, 1) + '%', fmt(E.q[6] * 100, 1) + '%', '约 70 小时');
  ok(E.q[0] === 0.582 && E.q[3] === 0.337 && E.q[6] === 0.211, 'Table 3 Ebbinghaus 58.2 / 33.7 / 21.1');
  // model fits (ours) against Table 5
  const fits = {};
  for (const k of ['ebb', 'mack', 'seitz', 'dros']) {
    const p = F.fit(k, 'pow'), e = F.fit(k, 'exp');
    fits[k] = { p, e, ratio: e.ssd / p.ssd };
    const pub = F.PUBLISHED_POWER[k];
    near(p.p, pub.a, 0.005, `${k} power exponent matches Table 5`);
    near(p.mu, pub.mu, pub.mu * 0.02, `${k} power μ matches Table 5`);
    if (pub.ssd) near(p.ssd, pub.ssd, pub.ssd * 0.03, `${k} power SSD matches Table 5`);
    ok(p.ssd < e.ssd, `${k}: power beats single exponential`);
  }
  const fe = fits.ebb;
  has('ch1.p3', fmt(fe.p.mu, 2) + ' × t−' + fmt(fe.p.p, 3), '1.4 和 0.13', fmt(fe.e.ssd, 3), fmt(fe.p.ssd, 4), '约 ' + fmt(fe.ratio) + ' 倍',
    '只给 ' + fmt(fe.e.at(E.t[0]), 2), '实测是 ' + fmt(E.q[0], 2));
  ok(Math.round(fe.ratio) === 24, 'Ebbinghaus exp/pow SSD ratio ≈ 24');
  // AIC passage: transcribed from the Discussion ("difference with the power function is 1.5", "a difference of 2 is considered meaningful")
  has('ch1.p5', '1.5', '差 2 以上', '四个参数');
  // robustness row: range of exp/pow ratios over the four data sets
  const rs = Object.values(fits).map(f => f.ratio);
  has('ch9.r2.s', fmt(Math.min(...rs), 1) + '–' + fmt(Math.max(...rs)) + ' 倍');
  ok(fmt(Math.min(...rs), 1) === '1.2' && Math.round(Math.max(...rs)) === 24, 'ratio range 1.2–24');

  // live sentence: sweep every data set × family × slider position, plus "best fit"
  const toP = (fam, v) => { const [lo, hi] = F.RANGE[fam]; return Math.exp(Math.log(lo) + (Math.log(hi) - Math.log(lo)) * v / 1000); };
  for (const k of ['ebb', 'mack', 'seitz', 'dros']) for (const fam of ['exp', 'pow']) {
    const b = F.fit(k, fam), bE = fits[k].e, bP = fits[k].p, d = F.DATA[k], ratio = bE.ssd / bP.ssd;
    ok(b.p >= F.RANGE[fam][0] && b.p <= F.RANGE[fam][1], `${k}/${fam}: best fit inside slider range`);
    const cases = [b.p]; for (let v = 0; v <= 1000; v += 50) cases.push(toP(fam, v));
    for (const p of cases) {
      const e = F.evaluate(k, fam, p), x = e.ssd / b.ssd, atBest = Math.round(x * 10) <= 10;
      let key;
      if (!atBest) key = 'ch1.say.off'; else if (fam === 'pow') key = 'ch1.say.powbest'; else key = ratio < 2 ? 'ch1.say.expclose' : 'ch1.say.expbest';
      ok(e.ssd >= b.ssd * 0.9999, `${k}/${fam}: no slider position beats the best fit`);
      if (key === 'ch1.say.off') ok(fmt(x, 1) !== '1.0', 'off-fit multiple never shows 1.0');
      if (key === 'ch1.say.expbest') ok(e.at(d.t[0]) < d.q[0], `${k}: best exponential undershoots the first point`);
      if (key === 'ch1.say.expclose') ok(d.q[6] === Math.min(...F.DATA.ebb.q.concat(F.DATA.mack.q, F.DATA.seitz.q, F.DATA.dros.q)), `${k}: "last point especially low" holds`);
      use(key, { ssd: fmt(e.ssd, 4), best: fmt(b.ssd, 4), x: fmt(x, 1), pbest: fmt(bP.ssd, 4), ratio: fmt(ratio, ratio < 10 ? 1 : 0), f1: pct(e.at(d.t[0])) + '%', d1: pct(d.q[0]) + '%', dlast: pct(d.q[6]) + '%', mu: fmt(e.mu, 2), a: fmt(e.p, 3) });
    }
  }
}

/* ───────── ch2: gamma mixture of exponentials (Laplace transform: exact) ───────── */
{
  const X = M.mixture;
  near(X.single(30, 1) / Math.pow(2, -30), 1, 1e-9, 'single exponential, half-life 1 day, 30 days = 2^-30');
  has('ch2.p3', '2−30', '差异系数为 1 时剩 ' + pct(X.mean(30, 1, 1)) + '%', '差异系数为 2 时剩 ' + pct(X.mean(30, 1, 2)) + '%');
  ok(pct(X.mean(30, 1, 1)) === '4.6' && pct(X.mean(30, 1, 2)) === '33', 'mixture 30-day values 4.6 % and 33 %');
  // exactness: the closed form equals the average of many sampled exponentials
  { const ks = X.sampleRates(40000, 1, 1.5, 11); let s = 0; for (const k of ks) s += Math.exp(-k * 7); near(s / ks.length, X.mean(7, 1, 1.5), 0.01, 'closed form = Monte Carlo mean (CV 1.5, day 7)'); }
  // FSRS decay 0.1542 read as a gamma shape α = 1/CV²
  ok(M.fsrs.DECAY === 0.1542, 'FSRS-6 default decay w20 = 0.1542');
  has('ch2.p4', '−0.1542', '差异系数约 ' + fmt(1 / Math.sqrt(M.fsrs.DECAY), 1));
  has('ch2.say.wide', '0.1542', '约 ' + fmt(1 / Math.sqrt(M.fsrs.DECAY), 1));
  for (let h = 0.25; h <= 7.0001; h += 0.25) for (let i = 0; i <= 30; i++) {
    const cv = i / 10, m30 = X.mean(30, h, cv), s30 = X.single(30, h);
    ok(m30 >= s30 - 1e-12, 'mixture mean never below the single exponential (Jensen)');
    const key = cv < 0.05 ? 'ch2.say.none' : cv >= 2.5 ? 'ch2.say.wide' : 'ch2.say.some';
    if (key === 'ch2.say.none') near(m30, s30, 1e-9, 'CV 0: mean equals the single exponential');
    use(key, { h: fmt(h, 2), m30: pct(m30) + '%', s30: pct(s30) + '%', alpha: fmt(1 / (cv * cv || 1), 2) });
  }
}

/* ───────── ch3: ACT-R spacing model, Pavlik & Anderson 2003 (Eq. 1–4, Table 1 parameters) ───────── */
{
  const A = M.actr, P = A.P;
  ok(P.a === 0.167 && P.c === 0.232 && P.s === 0.252 && P.tau === -0.669 && P.h === 0.031, 'ACT-R parameters as published');
  has('ch3.limit', 'a = 0.167', 'c = 0.232', 's = 0.252', 'τ = −0.669', 'h = 0.031', '40 人');
  const p = A.recall(4, DAY, 7 * DAY), m = A.recall(4, 30, 7 * DAY), now = A.recall(4, DAY, 300), mnow = A.recall(4, 30, 300);
  const dS = A.schedule(4, DAY).d, dM = A.schedule(4, 30).d;
  has('ch3.p3', '是 ' + fmt(p, 2), '只有 ' + fmt(m, 2), fmt(mnow, 2) + ' 比 ' + fmt(now, 2), '衰减率是 ' + fmt(dM[3], 3), '只有 ' + fmt(dS[3], 3));
  ok(fmt(p, 2) === '0.31' && fmt(m, 2) === '0.10' && fmt(mnow, 2) === '0.82' && fmt(now, 2) === '0.76', 'default case 0.31 / 0.10 / 0.82 / 0.76');
  ok(dS[0] === P.a && dM[0] === P.a, 'first practice decays at a');
  const b1 = A.bestGap(4, DAY).gap, b7 = A.bestGap(4, 7 * DAY).gap, b30 = A.bestGap(4, 30 * DAY).gap;
  ok(b1 === 600 && b7 === 2 * DAY && b30 === 14 * DAY, 'best gap 10 min / 2 days / 14 days for RI 1 / 7 / 30 days');
  has('ch3.p4', '最好的是 10 分钟', '最好的是 2 天', '最好的变成 14 天');
  // Cepeda et al. 2006 review: transcribed from the abstract
  has('ch3.p5', '184 篇文章', '317 个实验', '839 次比较');
  // live sentence over the whole control space
  const r2 = x => Math.round(x * 100);
  for (let n = 2; n <= 6; n++) for (let gi = 0; gi < 8; gi++) for (let ri = 1; ri <= 60; ri++) {
    const g = A.GAPS[gi], P1 = A.recall(n, g, ri * DAY), M1 = A.recall(n, A.GAPS[0], ri * DAY), N1 = A.recall(n, g, 300), MN = A.recall(n, A.GAPS[0], 300);
    const bg = A.bestGap(n, ri * DAY), bi = A.GAPS.indexOf(bg.gap);
    let key;
    if (gi === 0) key = 'ch3.say.massed';
    else if (r2(P1) === r2(M1)) key = 'ch3.say.tie';
    else if (r2(P1) < r2(M1)) key = 'ch3.say.worse';
    else if (r2(N1) < r2(MN)) key = bi === gi ? 'ch3.say.crossbest' : 'ch3.say.cross';
    else if (r2(N1) === r2(MN)) key = 'ch3.say.same5';
    else key = 'ch3.say.both';
    if (key === 'ch3.say.massed') ok(bi !== 0, 'massed is never the best gap (the sentence names a better one)');
    if (key === 'ch3.say.worse') ok(g > ri * DAY, `"gap too long" holds when spaced loses (n ${n}, gap ${gi}, RI ${ri})`);
    use(key, { p: fmt(P1, 2), m: fmt(M1, 2), now: fmt(N1, 2), mnow: fmt(MN, 2), ri: fmt(ri), best: 'x', bp: fmt(bg.p, 2), gap: 'x' });
  }
  // the gap names used by the sentences exist for every gap
  for (const k of ['30', '600', '1d', '2d', '4d', '7d', '14d', '30d']) ok(Z['ch3.gap.' + k], 'gap name ' + k);
  for (let i = 0; i < 8; i++) ok(Z['ch3.gapS.' + i], 'short gap name ' + i);
}

/* ───────── ch4: Cepeda, Vul, Rohrer, Wixted & Pashler 2008 ───────── */
{
  const Cp = M.cepeda, A = M.actr;
  // text of the paper (Method, Results, Discussion)
  ok(Cp.N === 1354, 'N = 1,354');
  has('ch4.p1', '1,354 个人', '32 条', '0 到 105 天', '7、35、70 或 350 天');
  has('ch4.p2', Cp.RI.map(r => Cp.TESTED_BEST[r]).join('、') + ' 天', Cp.RI.map(r => Cp.SPLINE[r]).join('、') + ' 天',
    Cp.RI.map(r => Cp.SPLINE_PCT[r] + '%').join('、'), Cp.RI.map(r => Cp.GAIN[r] + '%').join('、'));
  for (const ri of Cp.RI) {
    near(Cp.SPLINE[ri] / ri * 100, Cp.SPLINE_PCT[ri], 0.6, `spline optimum / RI = published % at RI ${ri}`);
    // digitized Fig. 3a points: best point is the published tested best, and the gain over gap 0 matches the text
    ok(Cp.bestPoint(ri)[0] === Cp.TESTED_BEST[ri], `Fig 3a points: best tested gap at RI ${ri}`);
    near(Cp.gainFromPoints(ri), Cp.GAIN[ri], 5, `Fig 3a points reproduce the published gain at RI ${ri}`);
  }
  // fitted surface from the Discussion: its 350-day optimum is the paper's "23 days, 7 %"
  const s350 = Cp.surfaceOptimum(350), s7 = Cp.surfaceOptimum(7);
  has('ch4.p4', fmt(s350, 1) + ' 天', '约占 ' + fmt(s350 / 350 * 100) + '%', '最优约 ' + fmt(s7) + ' 天', '插值结果的 ' + Cp.SPLINE[7] + ' 天', '四成到五成左右');
  ok(fmt(s350, 1) === '23.6' && fmt(s350 / 350 * 100) === '7', 'surface optimum at 350 d = 23.6 d ≈ 7 %');
  // ACT-R applied to the same design: share of RI stays 40–55 %, never under 10 %
  for (const ri of Cp.RI) { const a = A.cepedaOptimum(ri) / ri; ok(a > 0.38 && a < 0.55, `ACT-R optimum share ${a.toFixed(2)} at RI ${ri} is "four to five tenths"`); }
  ok(A.cepedaOptimum(7) < A.cepedaOptimum(35) && A.cepedaOptimum(35) < A.cepedaOptimum(70) && A.cepedaOptimum(70) < A.cepedaOptimum(350), 'ACT-R optimum grows with RI');
  has('ch4.limit', '23 到 79 人');
  // "too long costs less than too short" (ch10). The paper (Discussion): "costs [of a gap longer than optimal] are much
  // smaller than the costs of using too short a gap, as evidenced by the fact that as the gap increases, accuracy
  // increases steeply and then declines much more gradually (see Fig. 3)". Check it on the fitted surface: missing the
  // optimum by the same number of days costs less on the long side, for every retention interval.
  for (const ri of Cp.RI) { const o = Cp.surfaceOptimum(ri); for (const f of [0.5, 1]) ok(Cp.surface(o + f * o, ri) > Cp.surface(o - f * o, ri), `surface: optimum + ${f}·opt beats optimum − ${f}·opt at RI ${ri}`); }
  // and on the digitized Fig. 3a points: the rise from gap 0 to the peak is steeper (per day) than the fall after it
  for (const ri of Cp.RI) { const pts = Cp.POINTS[ri], b = Cp.bestPoint(ri), last = pts[pts.length - 1]; ok((b[1] - pts[0][1]) / b[0] > (b[1] - last[1]) / (last[0] - b[0]), `Fig 3a: steep rise, gradual decline at RI ${ri}`); }
  has('ch10.q1', '一到三天', '三到四周', '先陡升、后缓降', '太短的代价比太长大得多');
  ok(Cp.TESTED_BEST[7] === 1 && Cp.SPLINE[7] === 3 && Cp.TESTED_BEST[350] === 21 && Cp.SPLINE[350] === 27, 'ch10.q1 ranges from the paper');
  for (const ri of Cp.RI) {
    const a = A.cepedaOptimum(ri);
    use('ch4.say.ri', { ri: fmt(ri), tested: fmt(Cp.TESTED_BEST[ri]), spline: fmt(Cp.SPLINE[ri]), pct: fmt(Cp.SPLINE_PCT[ri]), gain: fmt(Cp.GAIN[ri]), actr: fmt(a, a < 10 ? 1 : 0), apct: fmt(a / ri * 100) });
  }
}

/* ───────── ch5: FSRS-6 (py-fsrs defaults; awesome-fsrs "The Algorithm") ───────── */
{
  const S = M.fsrs;
  ok(S.W.length === 21, '21 default parameters');
  has('ch5.limit', '21 个');
  near(S.F, Math.pow(0.9, -1 / S.DECAY) - 1, 1e-12, 'F = 0.9^(−1/w20) − 1');
  near(S.R(10, 10), 0.9, 1e-12, 'R(t = S) = 90 %');
  const days = r => S.path(r, 365).slice(1).map(q => q.t);
  const d90 = days(0.90), d97 = days(0.97);
  ok(d90.join() === '2,13,59,222', 'target 90 %: reviews on days 2, 13, 59, 222');
  ok(d97.join() === '1,3,7,14,27,49,85,143,233', 'target 97 %: nine reviews');
  has('ch5.p3', '第 ' + d90.join('、') + ' 天', '一年里 ' + d90.length + ' 次', '第 ' + d97.join('、') + ' 天', '一年里 ' + d97.length + ' 次');
  // ch5.p2: a successful review multiplies S by more than 1, and by more when R is lower
  for (const D of [1, 5, 10]) for (const s0 of [1, 10, 100]) {
    const hi = S.recallS(D, s0, 0.95) / s0, lo = S.recallS(D, s0, 0.7) / s0;
    ok(hi > 1 && lo > hi, `stability gain > 1 and larger at lower R (D ${D}, S ${s0})`);
  }
  // ch5.p4: a lapse shrinks S
  ok(S.forgetS(5, 50, 0.9) < 50, 'a lapse lowers stability');
  // live sentence over the slider: ≥ 2 reviews, intervals only grow
  for (let k = 70; k <= 99; k++) {
    const r = k / 100, p = S.path(r, 365), n = p.length - 1, iv = p.slice(1).map(q => q.ivl);
    ok(n >= 2, `target ${k} %: at least two reviews in a year`);
    ok(iv.every((v, i) => i === 0 || v >= iv[i - 1]) && iv[n - 1] > iv[0], `target ${k} %: intervals never shrink and end longer than they start`);
    use('ch5.say.some', { r: fmt(r * 100), days: p.slice(1).map(q => fmt(q.t)).join(Z['common.listsep']), n: fmt(n), first: fmt(p[1].ivl), last: fmt(p[n].ivl) });
  }
}

/* ───────── ch6: FSRS-6 workload simulation (model output) ───────── */
{
  const S = M.fsrs;
  const avg = (a, end, w) => { let x = 0; for (let i = end - w; i < end; i++) x += a[i]; return x / w; };
  const run = (n, r) => { const s = S.simulate({ perDay: n, r, days: 1095 }); let tot1 = 0; for (let i = 0; i < 365; i++) tot1 += s.reviews[i]; return { y1: avg(s.reviews, 365, 30), y3: avg(s.reviews, 1095, 30), tot1, known: s.known / s.cards }; };
  const b = run(20, 0.9), h = run(20, 0.97), dbl = run(40, 0.9);
  has('ch6.p2', '约 ' + roundNice(b.y1) + ' 次', '约 ' + roundNice(b.y3) + ' 次', '多了一半左右');
  ok(roundNice(b.y1) === 150 && roundNice(b.y3) === 220, 'default 20/day, 90 %: ~150 then ~220 a day');
  near(b.y3 / b.y1, 1.5, 0.1, 'year-3 load is about 1.5× year-1 load');
  near(dbl.y1 / b.y1, 2, 0.2, 'doubling new cards roughly doubles the load');
  has('ch6.p3', '约 ' + roundNice(b.y1) + ' 次涨到约 ' + roundNice(h.y1) + ' 次', fmt(h.tot1 / b.tot1, 1) + ' 倍', '从 ' + fmt(b.known * 100) + '% 升到 ' + fmt(h.known * 100) + '%', '从 4 次涨到 9 次');
  ok(roundNice(h.y1) === 310 && fmt(h.tot1 / b.tot1, 1) === '2.3', '97 %: ~310 a day, 2.3× first-year total');
  has('ch10.q3', '两倍多');
  // live sentence over the whole grid of both sliders
  for (let n = 5; n <= 60; n += 5) {
    const base = run(n, 0.9);
    for (let k = 75; k <= 98; k++) {
      const r = k / 100, now = k === 90 ? base : run(n, r), x1 = Math.round(now.y1 / base.y1 * 10) / 10;
      const K = Math.round(now.known * 100), KB = Math.round(base.known * 100);
      const key = k === 90 ? 'ch6.say.base' : (x1 >= 0.9 && x1 <= 1.1) ? 'ch6.say.near' : k > 90 ? 'ch6.say.up' : 'ch6.say.down';
      if (key === 'ch6.say.up') ok(x1 > 1 && K > KB, `up at ${n}/${k}: more reviews and more remembered`);
      if (key === 'ch6.say.down') ok(x1 < 1 && K < KB, `down at ${n}/${k}: fewer reviews and less remembered`);
      if (key === 'ch6.say.base') ok(now.y3 > now.y1, 'base: load still growing in year 3');
      use(key, { n: fmt(n), r: fmt(r * 100), y1: fmt(roundNice(now.y1)), y3: fmt(roundNice(now.y3)), x: fmt(x1, 1), yb: fmt(roundNice(base.y1)), known: fmt(now.known * 100), kb: fmt(base.known * 100) });
    }
  }
}

/* ───────── ch7: Roediger & Karpicke 2006 (Fig. 1 and Fig. 2 means, text) ───────── */
{
  const R = M.rk, e1 = R.exp1, e2 = R.exp2, P = x => fmt(x * 100) + '%';
  has('ch7.p3', P(e1.SS[0]) + '，考过的组 ' + P(e1.ST[0]), P(e1.SS[1]) + ' 对 ' + P(e1.ST[1]), P(e1.SS[2]) + ' 对 ' + P(e1.ST[2]),
    '（' + P(e1.ST[2]) + ' 和 ' + P(e1.SS[1]) + '）', '记住 ' + P(e2.w1[2]), '只有 ' + P(e2.w1[0]), fmt(e2.reads[0], 1) + ' 遍', fmt(e2.reads[2], 1) + ' 遍');
  const forgot = e2.m5.map((v, i) => Math.round((v - e2.w1[i]) / v * 100));
  ok(forgot.join() === e2.forgot.join(), 'forgetting % from 5-min and 1-week means equals the paper (52/28/14)');
  has('ch7.p3', '忘了 ' + forgot[0] + '%', '忘了 ' + forgot[1] + '%', '只忘了 ' + forgot[2] + '%');
  has('ch7.p2', '30 个', '7 分钟', '5 分钟、2 天、1 周');
  has('ch7.p4', '七成');
  ok(R.initialRecall === 0.70, 'initial test recall ≈ .70 (Exp. 1 text)');
  has('hero.lead', '四成');
  ok(Math.round(e2.w1[0] * 10) === 4, 'hero: reading four times → four tenths after a week');
  // Rowland 2014 (full text) and Yang 2021 (abstract)
  has('ch7.p5', '61 项研究', '159 个效应量', 'g = 0.50', '0.42–0.58', 'g = 0.69', 'g = 0.41', '222 项研究', '48,478 名学生');
  has('ch9.r5.s', '0.41', '0.69', '0.50');
  has('ch9.r6.s', P(e1.SS[0]) + ' 对 ' + P(e1.ST[0]), 'd = ' + fmt(e1.d[0], 2));
  // live sentences: both experiments × every delay offered
  for (const sel of [0, 1, 2]) {
    const diff = Math.abs(e1.ST[sel] - e1.SS[sel]) * 100;
    const k = ['ch7.say.e1.5min', 'ch7.say.e1.2d', 'ch7.say.e1.1w'][sel];
    if (sel === 0) ok(e1.SS[0] > e1.ST[0], '5 min: rereading ahead'); else ok(e1.ST[sel] > e1.SS[sel], 'later: testing ahead');
    if (sel === 2) ok(Math.abs(e1.ST[2] - e1.SS[1]) <= 0.03, '"tested at 1 week ≈ reread at 2 days"');
    use(k, { ss: fmt(e1.SS[sel] * 100), st: fmt(e1.ST[sel] * 100), diff: fmt(diff), ss2: fmt(e1.SS[1] * 100) });
  }
  ok(e2.m5[0] > e2.m5[1] && e2.m5[1] > e2.m5[2], 'Exp 2, 5 min: more reading, higher');
  ok(e2.w1[2] > e2.w1[1] && e2.w1[1] > e2.w1[0], 'Exp 2, 1 week: order reversed');
  for (const [k, arr] of [['ch7.say.e2.5min', e2.m5], ['ch7.say.e2.1w', e2.w1]]) use(k, { a: fmt(arr[0] * 100), b: fmt(arr[1] * 100), c: fmt(arr[2] * 100), ra: fmt(e2.reads[0], 1), rc: fmt(e2.reads[2], 1) });
}

/* ───────── ch8: judgments vs outcomes (R&K 2006 Exp. 2; Kornell & Bjork 2008 Exp. 1a/1b/2) ───────── */
{
  const R = M.rk.exp2, K = M.kb;
  has('ch8.p2', fmt(R.jol[0], 1) + ' 分', fmt(R.jol[1], 1) + ' 分', fmt(R.jol[2], 1) + ' 分', R.w1.map(v => fmt(v * 100) + '%').join('、'));
  ok(R.jol[0] > R.jol[1] && R.jol[1] > R.jol[2] && R.w1[0] < R.w1[1] && R.w1[1] < R.w1[2], 'confidence order is the reverse of outcome order');
  has('ch8.p3', K.exp1a.n + ' 名', fmt(K.exp1a.spaced, 2), fmt(K.exp1a.massed, 2), K.exp1a.betterSpaced + '% 的人', '同样有 ' + K.exp1a.judgedMassedOK + '% 的人', K.combined.atLeastAsWellSpaced + '% 的人', K.combined.judgedMassedOK + '% 的人');
  has('ch8.limit', '177 名');
  has('ch9.r7.s', '约八成');
  ok(K.exp1a.judgedMassedOK >= 75 && K.combined.judgedMassedOK >= 75, '"about eight in ten" judged wrongly');
  use('ch8.say.rk', { j1: fmt(R.jol[0], 1), j3: fmt(R.jol[2], 1), a1: fmt(R.w1[0] * 100), a3: fmt(R.w1[2] * 100) });
  use('ch8.say.kb', { s: fmt(K.exp1a.spaced, 2), m: fmt(K.exp1a.massed, 2), bs: fmt(K.exp1a.betterSpaced), jm: fmt(K.exp1a.judgedMassedOK) });
}

/* ───────── ch9: effect-size table (transcribed) ───────── */
has('ch9.r3.e', '317 个实验', '839 次比较');
has('ch9.r3.s', 'd ≈ 0.85', 'd ≈ 1.1');
has('ch9.r4.s', M.cepeda.SPLINE_PCT[7] + '%', M.cepeda.SPLINE_PCT[350] + '%');
has('ch9.p2', 'd ≈ 0.47', '0.85', '0.74');

/* ───────── every sentence template the page can show was reached ───────── */
for (const k of Object.keys(Z).filter(k => /\.say\./.test(k))) ok(reached.has(k), `sentence ${k} is reached by a control setting`);

/* ───────── no Chinese outside copy files ───────── */
{
  const CJK = /[㐀-鿿＀-￯　-〿]/;
  for (const f of ['app.js', 'models.js']) {
    const lines = fs.readFileSync(path.join(DIR, f), 'utf8').split('\n');
    lines.forEach((l, i) => ok(!CJK.test(l), `${f}:${i + 1} has no Chinese`));
  }
  const html = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8')
    .replace(/<title>[^<]*<\/title>/, '').replace(/<meta name="description"[^>]*>/, '').replace(/<button[^>]*data-lang="zh"[^>]*>中<\/button>/, '');
  html.split('\n').forEach((l, i) => ok(!CJK.test(l), `index.html:${i + 1} has no Chinese outside title, description and the 中 button`));
}

console.log(`${checks - fails}/${checks} checks passed; ${reached.size} sentence templates reached`);
if (fails) process.exit(1);
console.log('PASS: why-we-forget models and prose');
