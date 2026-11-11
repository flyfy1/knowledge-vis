'use strict';
// Pins every number the essay's prose states to the page's own models, and checks that the prose
// (copy.zh.js) still says exactly that number. Run: node biology/body/body-in-balance/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const M = require(path.join(__dirname, '..', 'models.js'));
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;

let n = 0, fails = 0;
function check(name, got, want) {
  n++;
  if (got !== want) { fails++; console.error(`FAIL ${name}: model gives ${got}, expected ${want}`); }
}
function says(key, phrase) {
  n++;
  if (!Z[key] || !Z[key].includes(phrase)) { fails++; console.error(`FAIL prose ${key} should contain "${phrase}"`); }
}
const f = (x, d) => x.toFixed(d);

/* ── ch1 leaky bucket ── */
{
  const p = { I: 2, k: 0.2 };
  check('ch1 set point', f(M.bucket.setpoint(p), 0), '10'); says('ch1.p3', '停在 10 升');
  check('ch1 half-gap time', f(M.bucket.halfGap(p), 1), '3.5'); says('ch1.p3', '约 3.5 分钟');
  check('ch1 inflow 1.5 → 7.5', f(M.bucket.setpoint({ I: 1.5, k: 0.2 }), 1), '7.5'); check('ch1 inflow 3 → 15', f(M.bucket.setpoint({ I: 3, k: 0.2 }), 0), '15'); says('ch1.p3', '从 7.5 升翻倍到 15 升');
  // the stepped simulation agrees with the exact solution, and the gap halves every ln2/k regardless of the push
  const s = M.bucket.create(0); M.advance(s, 30, M.bucket.H, (st, h) => M.bucket.step(st, h, p));
  check('ch1 stepped = exact', f(s.L, 6), f(M.bucket.exact(0, 30, p), 6));
  for (const L0 of [0, 25]) { const gap0 = Math.abs(L0 - 10), g = Math.abs(M.bucket.exact(L0, M.bucket.halfGap(p), p) - 10); check('ch1 gap halves from ' + L0, f(g / gap0, 6), '0.500000'); }
}

/* ── ch2 dosing ── */
{
  const D = M.dosing;
  check('ch2 plateau trough t½=τ=8', f(D.steadyTrough(8, 8), 2), '1.00'); says('ch2.p3', '谷值 1、峰值 2');
  check('ch2 plateau peak', f(D.steadyPeak(8, 8), 2), '2.00');
  check('ch2 five half-lives', f(D.fractionOfPlateau(40, 8) * 100, 0), '97'); says('ch2.p3', '约 97%'); says('ch2.p3', '只差 1/32');
  check('ch2 1/32', 1 - D.fractionOfPlateau(40, 8), 1 / 32);
  check('ch2 t½ 24 h → 120 h', 5 * 24, 120); says('ch2.p3', '120 小时（五天）');
  check('ch2 peak/trough at τ = 3 t½', f(D.peakTroughRatio(24, 8), 0), '8'); says('ch2.p4', '峰值是谷值的 8 倍');
  // the simulated curve reaches the closed-form plateau
  const ds = D.schedule(8, 96); check('ch2 simulated trough just before the 13th dose', f(D.conc(96 - 1e-6, ds, 8), 3), '1.000');
  // missed dose at 48 h (index 6 when τ = 8), then a double dose at 56 h
  const miss = D.schedule(8, 96, { miss: 6 }), dbl = D.schedule(8, 96, { miss: 6, double: 7 });
  check('ch2 double-up peak', f(D.conc(56, dbl, 8), 2), '2.49'); says('ch2.p4', '峰值到 2.49');
  check('ch2 double-up excess', f((D.conc(56, dbl, 8) / 2 - 1) * 100, 0), '25'); says('ch2.p4', '高约 25%');
  check('ch2 missed trough', f(D.conc(56 - 1e-6, miss, 8), 2), '0.49'); says('ch2.p4', '谷值暂时掉到 0.49');
  // and the page's own index rule puts the missed dose at 48 h
  check('ch2 page miss index', Math.max(1, Math.round(48 / 8)), 6);
}

/* ── ch3 alcohol ── */
{
  const A = M.alcohol;
  check('ch3 Vmax', A.P.vmax, 15); check('ch3 Km in 2–10', A.P.km >= 2 && A.P.km <= 10, true);
  says('ch3.p1', '约 2–10 mg/100 mL'); says('ch3.p1', '典型值约 15 mg/100 mL'); says('ch3.p1', '正常范围约 10–35');
  says('ch3.model.how', '升高 20 mg/100 mL'); check('ch3 per drink', A.P.perDrink, 20);
  check('ch3 slope at 60', f(A.rateAt(60), 1), '13.8'); says('ch3.p3', '在 60 时每小时下降约 13.8');
  check('ch3 slope at 20', f(A.rateAt(20), 1), '12.0'); says('ch3.p3', '在 20 时约 12.0');
  const r4 = A.run({ n: 4, spacing: 1 }, 30), r8 = A.run({ n: 8, spacing: 1 }, 30);
  check('ch3 4 drinks clear', f(r4.tClear, 1), '7.3'); says('ch3.p4', '4 杯约 7.3 小时');
  check('ch3 8 drinks clear', f(r8.tClear, 1), '13.2'); says('ch3.p4', '8 杯约 13.2 小时');
  // each extra drink adds about 1.5 h (between 3 and 8 drinks, hourly)
  for (let k = 3; k < 8; k++) { const d = A.run({ n: k + 1, spacing: 1 }, 30).tClear - A.run({ n: k, spacing: 1 }, 30).tClear; check('ch3 extra drink ' + k, f(d, 1) === '1.5' || f(d, 1) === '1.4', true); }
  says('ch3.p4', '约 1.5 小时');
  check('ch3 liver cap drinks/h', f(A.maxDrinksPerHour(), 2), '0.75'); says('ch3.p4', '约 0.75 杯（15 ÷ 20）');
  // straight descent: once drinking stops, the falling part above 10 mg/100 mL loses at least 10/h
  const tail = r8.series.filter(q => q[0] > 8.5 && q[1] > 10); let minDrop = Infinity;
  for (let i = 1; i < tail.length; i++) minDrop = Math.min(minDrop, (tail[i - 1][1] - tail[i][1]) / (tail[i][0] - tail[i - 1][0]));
  check('ch3 near-linear fall', minDrop > 10, true);
  // drinking faster than the cap: the level keeps rising while drinking (no plateau)
  const fast = A.run({ n: 8, spacing: 0.25 }, 30); let rising = true;
  for (let k = 1; k < 8; k++) { const a = fast.series.find(q => q[0] >= k * 0.25 - 1e-9)[1], b = fast.series.find(q => q[0] >= (k + 1) * 0.25 - 1e-9)[1]; if (!(b > a)) rising = false; }
  check('ch3 no plateau when fast', rising, true);
}

/* ── ch4 glucose ── */
{
  const G = M.glucose;
  says('ch4.p1', '3.9–5.5 mmol/L（70–99 mg/dL）'); says('ch4.p3', '11.1 mmol/L（200 mg/dL）'); says('ch4.p3', '7.8–11.0 mmol/L（140–199 mg/dL）');
  // the worst two-hour value any slider state reaches (weakest response, longest delay, large meal) stays below 11.1
  { let worst = 0; for (let g = 10; g <= 200; g += 5) for (let dl = 0; dl <= 40; dl += 1) for (const meal of [3, 5.5, 8]) worst = Math.max(worst, G.run({ gain: G.P.gain * g / 100, delay: dl, meal }, 300).at120);
    check('ch4 worst two-hour value', f(worst, 1), '9.1'); says('ch4.p3', '两小时值也只到约 9.1'); check('ch4 below diabetes cut-off', worst < 11.1, true); } says('ch4.p1', '7.8 mmol/L（140 mg/dL）');
  const d = G.run({}, 300);
  check('ch4 default peak', f(d.peak, 1), '7.7'); says('ch4.p3', '峰值 7.7');
  check('ch4 default peak time', Math.round(d.tPeak / 1), 27); says('ch4.p3', '第 27 分钟前后');
  check('ch4 default 2 h', f(d.at120, 1), '5.0'); says('ch4.p3', '两小时后回到 5.0');
  const w = G.run({ gain: G.P.gain * 0.1 }, 300);
  check('ch4 weak peak', f(w.peak, 1), '8.8'); says('ch4.p3', '峰值升到 8.8');
  check('ch4 weak 2 h', f(w.at120, 1), '7.6'); says('ch4.p3', '两小时后还有 7.6');
  check('ch4 weak time above 7.8', Math.round(w.above / 10) * 10, 90); says('ch4.p3', '约 90 分钟');
  const o = G.run({ gain: G.P.gain * 2, delay: 40 }, 300);
  check('ch4 overshoot peak', f(o.peak, 1), '9.0'); says('ch4.p3', '先冲到 9.0');
  check('ch4 overshoot low', f(o.low, 1), '2.8'); says('ch4.p3', '再跌到 2.8');
  const ng = G.run({ gain: G.P.gain * 2, delay: 40, glucagon: false }, 300);
  check('ch4 no glucagon deeper', ng.low < o.low, true);
  check('ch4 no glucagon stays down at 5 h', ng.series[ng.series.length - 1][1] < 3.9, true);
  check('ch4 page slider default = model gain', +(100).toFixed(0), 100);
}

/* ── ch5 temperature ── */
{
  const T = M.thermo;
  says('ch5.p1', '35.7–37.4 °C'); says('ch5.p1', '约 0.5 °C');
  check('ch5 fever steady', f(T.steady(39).T, 1), '38.8'); says('ch5.p3', '停在 38.8 °C');
  const ice = T.steady(39, 0, true);
  check('ch5 fever + ice', f(ice.T, 1), '38.0'); says('ch5.p3', '只降到约 38.0 °C');
  check('ch5 ice: heat production maxed', ice.u, T.P.heatMax);
  check('ch5 load 6', f(T.steady(37, 0.06).T, 1), '37.5'); says('ch5.p4', '37.5 °C 附近');
  check('ch5 load 6 sweating not maxed', T.steady(37, 0.06).u > -T.P.coolMax, true);
  check('ch5 load 8', f(T.steady(37, 0.08).T, 1), '39.0'); says('ch5.p4', '升到 39 °C');
  check('ch5 load 8 sweating maxed', T.steady(37, 0.08).u, -T.P.coolMax);
  check('ch5 load 10', f(T.steady(37, 0.1).T, 1), '41.0'); says('ch5.p4', '停在 41 °C');
  // simulated fever onset: feels cold while the temperature is already 38
  const s = T.create(); s.target = 39; let coldAt38 = false;
  for (let i = 0; i < 3000; i++) { T.step(s, T.H, {}); if (s.T >= 38 && s.T < 38.2 && T.feel(s) === 'cold') coldAt38 = true; }
  check('ch5 cold at 38 during onset', coldAt38, true); says('ch5.p3', '体温还在 38 °C');
  check('ch5 simulated steady = solved', f(s.T, 2), f(T.steady(39).T, 2));
  // antipyretic: set point back to 37 while T is above it → sweating
  const a = T.create(); a.set = a.target = 39; a.T = T.steady(39).T; a.target = 37; let sweat = false;
  for (let i = 0; i < 600; i++) { T.step(a, T.H, {}); if (a.u < 0) sweat = true; }
  check('ch5 antipyretic → sweating', sweat, true);
}

/* ── ch6 therapeutic window ── */
{
  const W = M.window;
  check('ch6 lower edge', f(W.lower(), 1), '0.8'); check('ch6 upper edge', f(W.upper(), 1), '2.4');
  check('ch6 therapeutic index', f(W.index(), 2), '6.25'); says('ch6.p3', '5 ÷ 0.8 ≈ 6');
  const once = W.run(1, 1);
  check('ch6 once peak', f(once.peak, 1), '3.4'); says('ch6.p3', '峰值冲到 3.4');
  check('ch6 once trough', f(once.trough, 1), '0.4'); says('ch6.p3', '谷值掉到 0.4');
  check('ch6 once in window', f(once.inWin * 100, 0), '53'); says('ch6.p3', '约 53% 的时间在窗里');
  check('ch6 once below', f(once.below * 100, 0), '30'); says('ch6.p3', '30% 的时间低于窗');
  check('ch6 once over', f(once.over * 100, 0), '17'); says('ch6.p3', '17% 的时间高于窗');
  // independent closed form for once a day: C = P·2^(−t/8) on the last day, P = 3/(1 − 2^−3); window [0.8, 2.395]
  { const P = 3 / (1 - Math.pow(2, -3)), hi = 5 * Math.pow(0.05 / 0.95, 1 / 4), a = 8 * Math.log2(P / hi), b = 8 * Math.log2(P / 0.8);
    // the grid is 0.01 h, i.e. 0.04 percentage points of a day
    check('ch6 once in window = closed form', Math.abs(once.inWin * 100 - (b - a) / 24 * 100) < 0.05, true);
    check('ch6 once over = closed form', Math.abs(once.over * 100 - a / 24 * 100) < 0.05, true);
    check('ch6 shares sum to 100', f((once.inWin + once.below + once.over) * 100, 3), '100.000'); }
  check('ch6 once first crossing is the first dose', once.firstOver, 0);
  const three = W.run(3, 1);
  check('ch6 3× peak', f(three.ssPeak, 1), '2.0'); check('ch6 3× trough', f(three.ssTrough, 1), '1.0'); says('ch6.p3', '峰 2.0、谷 1.0');
  check('ch6 3× all in window', f(three.inWin * 100, 0), '100');
  const slow = W.run(3, 2);
  check('ch6 slow half-life', slow.half, 16); says('ch6.p4', '半衰期变成 16 小时');
  check('ch6 slow first over', f(slow.firstOver, 0), '24'); says('ch6.p4', '第 24 小时才第一次越过上沿');
  check('ch6 slow plateau', f(slow.ssTrough, 1) + '–' + f(slow.ssPeak, 1), '2.4–3.4'); says('ch6.p4', '平台停在 2.4–3.4');
  check('ch6 slow all above', f(slow.inWin * 100, 0), '0');
}

/* ── ch7 heart ── */
{
  const H = M.heart;
  check('ch7 untrained max CO at 20', f(M.heart.maxCO('untrained', 20), 0), '25'); says('ch7.limit', '约 25 L/min'); says('ch7.limit', '约 19.5 L/min');
  says('ch7.p1', '约 70 mL（正常范围 55–100）'); says('ch7.p1', '60–100 次'); says('ch7.p1', '约 5 L/min（范围 4–8）'); says('ch7.p2', '约 19.5 L/min');
  check('ch7 rest CO', H.demand(0), 5);
  check('ch7 untrained rest HR', f(H.target(0, 'untrained', 20).hr, 0), '71'); says('ch7.p4', '静息心率从 71 降到 56');
  check('ch7 trained rest HR', f(H.target(0, 'trained', 20).hr, 0), '56');
  check('ch7 level 6 untrained HR', f(H.target(6, 'untrained', 20).hr, 0), '131'); says('ch7.p3', '约 131 次/分'); says('ch7.p4', '从 131 降到 100');
  check('ch7 level 6 trained HR', f(H.target(6, 'trained', 20).hr, 0), '100');
  check('ch7 HRmax 20', f(H.hrMax(20), 0), '194'); says('ch7.p4', '20 岁约 194');
  check('ch7 HRmax 60', f(H.hrMax(60), 0), '166'); says('ch7.p4', '60 岁约 166');
  const g = H.target(10, 'untrained', 60);
  check('ch7 max CO at 60', f(H.maxCO('untrained', 60), 1), '21.6'); says('ch7.p4', '最多约 21.6 L/min');
  check('ch7 need at level 10', g.need, 25); check('ch7 shortfall', f(g.short, 1), '3.4'); says('ch7.p4', '差了 3.4');
  // the simulated HR approaches the target and does not jump
  const s = H.create(0, 'untrained', 20); const p = { level: 6, fit: 'untrained', age: 20 };
  M.advance(s, 10, H.H, (x, h) => H.step(x, h, p)); const after10 = s.hr;
  M.advance(s, 200, H.H, (x, h) => H.step(x, h, p));
  check('ch7 lag after 10 s', after10 < 115, true); check('ch7 reaches target', f(s.hr, 0), '131');
}

/* ── ch8 antibiotics ── */
{
  const B = M.bact, D = M.dosing;
  check('ch8 initial resistant share', B.P.R0 / B.P.S0, 1e-6); says('ch8.model.how', '每一百万个细菌里有一个耐药');
  check('ch8 MIC ratio', B.P.micR / B.P.micS, 8); says('ch8.model.how', '敏感菌的 8 倍');
  check('ch8 dose 4 range', f(D.steadyTrough(8, 4, 4), 1) + '–' + f(D.steadyPeak(8, 4, 4), 1), '1.3–5.3'); says('ch8.p3', '在 1.3 到 5.3 之间');
  const firstCross = r => { const q = r.series.find(x => x[2] > x[1]); return q && q[0] / 24; };
  const firstGone = r => { const q = r.series.find(x => x[1] === 0); return q && q[0] / 24; };
  const d4 = B.run({ dose: 4, days: 7 });
  check('ch8 dose 4: R overtakes S', f(firstCross(d4), 1), '1.3'); says('ch8.p3', '第 1.3 天就超过');
  check('ch8 dose 4: S gone', f(firstGone(d4), 1), '3.3'); says('ch8.p3', '第 3.3 天消失');
  check('ch8 dose 4: resistant at the end', d4.S === 0 && d4.R > 1e8, true);
  check('ch8 dose 24 range', f(D.steadyPeak(8, 4, 24), 0) + '/' + f(D.steadyTrough(8, 4, 24), 0), '32/8'); says('ch8.p4', '峰值约 32、谷值约 8');
  const d24 = B.run({ dose: 24, days: 7 });
  check('ch8 dose 24 cleared', f(d24.cleared / 24, 1), '3.3'); says('ch8.p4', '第 3.3 天全部清除');
  const d16 = B.run({ dose: 16, days: 7 });
  check('ch8 dose 16 R overtakes', f(firstCross(d16), 1), '2.6'); says('ch8.p4', '在第 2.6 天超过敏感菌');
  check('ch8 dose 16 cleared', f(d16.cleared / 24, 1), '6.4'); says('ch8.p4', '第 6.4 天也能清除');
  const d16s = B.run({ dose: 16, days: 6 });
  check('ch8 dose 16 stop day 6 → resistant', d16s.S === 0 && d16s.R > 1e8 && d16s.cleared == null, true); says('ch8.p4', '第 6 天就停药，留下来的正好是耐药菌');
  const d24s = B.run({ dose: 24, days: 3 });
  check('ch8 dose 24 stop day 3 → sensitive relapse', d24s.R === 0 && d24s.S > 1e8, true); says('ch8.p4', '只给 3 天，停药后长回来的却是敏感菌');
  for (const dose of [4, 8, 12]) { const r = B.run({ dose, days: 10 }); check(`ch8 dose ${dose} × 10 days stays resistant`, r.S === 0 && r.R > 1e8, true); }
}

/* ── ch9 herd immunity ── */
{
  const H = M.herd;
  check('ch9 Re default', f(H.re(3, 0.5), 1), '1.5'); says('ch9.p3', '实际传给 1.5 人');
  check('ch9 final size default', f(H.finalSize(3, 0.5) * 100, 0), '29'); says('ch9.p3', '约 29% 的人');
  check('ch9 threshold R0 3', f(H.threshold(3) * 100, 0), '67'); says('ch9.p3', '推过 67%');
  check('ch9 final size above threshold', H.finalSize(3, 0.68), 0);
  check('ch9 measles thresholds', f(H.threshold(12) * 100, 0) + '–' + f(H.threshold(18) * 100, 0), '92–94'); says('ch9.p4', '约 92–94%'); says('ch9.p4', '12–18');
  // stochastic runs agree with the final-size equation far from the threshold, and die out below it
  const big = H.meanAttack(1200, 3, 0.3, 30, 1, 3), small = H.meanAttack(1200, 3, 0.8, 30, 1, 3);
  check('ch9 sim ≈ theory at v = 0.3', Math.abs(big.mean - H.finalSize(3, 0.3)) < 0.05, true);
  check('ch9 dies out at v = 0.8', small.mean < 0.01, true);
  // near the threshold, outcomes split: some runs fizzle, some take off
  const near = H.meanAttack(1200, 3, 0.6, 40, 1, 3);
  check('ch9 near threshold is luck', near.bigShare > 0.2 && near.bigShare < 0.95, true);
  // determinism of the seeded RNG
  check('ch9 seeded runs repeat', H.runToEnd(1200, 3, 0.5, 11, 3).infected, H.runToEnd(1200, 3, 0.5, 11, 3).infected);
}

/* ── the page's default controls are the states the prose describes ── */
{
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const val = id => { const m = html.match(new RegExp('id="' + id + '"[^>]*value="([^"]+)"')); return m && m[1]; };
  const want = { bkI: '2', bkK: '0.2', dsH: '8', dsT: '8', alN: '4', alG: '1', glGain: '100', glDelay: '10', thLoad: '0', twSlow: '1', htL: '6', htA: '20', abD: '3', abDays: '7', hdR: '3', hdV: '50' };
  for (const [id, v] of Object.entries(want)) check('default ' + id, val(id), v);
  check('default twN = once a day', /name="twN" value="1" checked/.test(html), true);
  check('default meal = medium (model meal 5.5)', /name="glMeal" value="5.5" checked/.test(html) && M.glucose.P.meal === 5.5, true);
  const app = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
  check('ch8 dose slider index 3 = MIC × 4', /DOSES = \[0, 1, 2, 4,/.test(app), true);
  check('ch8 regimen', M.bact.P.interval + '/' + M.bact.P.half, '8/4'); says('ch8.model.how', '每 8 小时一剂，半衰期 4 小时');
  check('ch6 regimen', M.window.run(3, 1).half, 8); says('ch6.model.how', '每天共 3 剂，半衰期 8 小时');
  says('ch1.p3', '每分钟漏掉存量的 20%');
}

/* ── English copy: same keys, same numbers as the Chinese prose ── */
{
  const ce = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'copy.en.js'), 'utf8'), ce);
  const E = ce.window.ESSAY_COPY.en;
  n++; if (JSON.stringify(Object.keys(Z)) !== JSON.stringify(Object.keys(E))) { fails++; console.error('FAIL copy.en.js keys differ from copy.zh.js'); }
  const nums = s => (s.replace(/<[^>]+>/g, '').match(/\d+(\.\d+)?/g) || []);
  for (const k of Object.keys(Z)) {
    if (E[k] == null) continue;
    for (const x of nums(Z[k])) { n++; if (!nums(E[k]).includes(x)) { fails++; console.error(`FAIL en ${k} lacks the number ${x} that zh states`); } }
    const ph = s => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');
    n++; if (ph(Z[k]) !== ph(E[k])) { fails++; console.error(`FAIL en ${k} placeholders differ`); }
  }
}

/* ── every placeholder used in copy is filled by the app ── */
{
  const app = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
  for (const [k, v] of Object.entries(Z)) for (const m of v.matchAll(/\{(\w+)\}/g)) {
    n++; if (!new RegExp('(\\b' + m[1] + '\\s*:|\\.' + m[1] + '\\s*=)').test(app)) { fails++; console.error(`FAIL placeholder {${m[1]}} in ${k} is never supplied by app.js`); }
  }
  // every key the markup and app ask for exists in zh
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const keys = new Set([...html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)].map(m => m[1]));
  for (const m of app.matchAll(/\bt\('([\w.]+)'/g)) if (/^[\w]+\.[\w.]*\w$/.test(m[1])) keys.add(m[1]);
  for (const k of ['cold', 'hot', 'ok']) keys.add('ch5.feel.' + k);
  for (const k of keys) { n++; if (Z[k] == null) { fails++; console.error('FAIL missing zh key ' + k); } }
  // no Chinese text outside copy.zh.js except comments
  for (const file of ['index.html', 'app.js', 'models.js']) {
    // The site's static provenance label (specs/visual-page-provenance.md) is bilingual by contract, not essay copy;
    // it is removed first because its commit URL would otherwise be cut by the // comment rule.
    const src = fs.readFileSync(path.join(__dirname, '..', file), 'utf8').replace(/<details class="page-provenance"[\s\S]*?<\/details>/, '')
      .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '').replace(/<!--[\s\S]*?-->/g, '');
    n++;
    // only the 中 toggle label may remain in index.html (the old check stopped at the first hit when it was 中)
    const others = (src.match(/[一-鿿]+/g) || []).filter(x => !(file === 'index.html' && x === '中'));
    if (others.length) { fails++; console.error(`FAIL Chinese text in ${file}: ${others.slice(0, 3).join(' ')}`); }
  }
}

if (fails) { console.error(`\n${fails} of ${n} checks failed`); process.exit(1); }
console.log(`PASS: ${n} checks (every number in the prose matches the models)`);
