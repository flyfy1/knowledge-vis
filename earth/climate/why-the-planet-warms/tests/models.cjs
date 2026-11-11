'use strict';
// Pins every number the essay's prose states. Model outputs are recomputed from models.js; assessed or observed
// values are checked against the SOURCED / EARTH tables in models.js (each cited in BRIEF.md). The prose string must
// contain the number as written, and every number that appears in a prose key must be covered by some pin.
// Run: node earth/climate/why-the-planet-warms/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const M = require(path.join(__dirname, '..', 'models.js'));
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;
const E = M.EARTH, S = M.SOURCED;

let n = 0, fails = 0;
const pinned = {}; // key → [phrases]
function check(name, got, want) { n++; if (got !== want) { fails++; console.error(`FAIL ${name}: got ${got}, expected ${want}`); } }
function ok(name, cond) { check(name, !!cond, true); }
function says(key, phrase) {
  n++; (pinned[key] = pinned[key] || []).push(phrase);
  if (Z[key] == null || !Z[key].includes(phrase)) { fails++; console.error(`FAIL prose ${key} should contain "${phrase}"`); }
}
// model value, rounded as the prose writes it, must equal `want`, and the prose must say `phrase` (which contains it)
function pin(key, name, value, d, want, phrase) { check(name, value.toFixed(d), want); says(key, phrase || want); }
const f = (x, d) => x.toFixed(d);
const range = (a, d) => f(a[0], d) + '–' + f(a[1], d);
const minus = s => s.replace('-', '−');

const Te = M.balance.Te(E.S, E.albedo), A = M.balance.absorbed(E.S, E.albedo);

/* ── hero ── */
check('hero: CO₂ per 10 000 molecules', Math.floor(E.Cnow / 100), 4); ok('hero: "four and a bit"', E.Cnow / 100 > 4.05); says('hero.sub', '每一万个分子只有四个多');
check('hero: 2 to 5 degrees = AR6 very likely ECS', range(S.ecsVeryLikely, 0), '2–5'); says('hero.lead', '从 2 度到 5 度');
says('hero.note', '2021'); // AR6 WG1 publication year

/* ── ch1 ── */
check('ch1 TSI', E.S, 1361); says('ch1.p2', '每平方米 1361 瓦'); says('footer', '1361 W/m²');
check('ch1 albedo', E.albedo, 0.29); says('ch1.p2', '约 29%'); says('ch1.p4', '从 0.29 调到 0.30'); says('footer', '反照率 0.29');
check('ch1 disc/sphere = 1/4', (Math.PI) / (4 * Math.PI), 0.25); says('ch1.p2', '除以 4'); says('ch1.p2', 'πR²'); says('ch1.p2', '4πR²');
says('ch1.p2', '四次方');
check('ch1 observed', E.Tobs, 288); says('ch1.model.how', '288 K'); says('ch1.model.how', '288 K。'); says('ch1.leg.obs', '288 K'); says('footer', '地表平均 288 K');
pin('ch1.p3', 'ch1 absorbed', A, 0, '242', '每平方米吸收 242 W');
pin('ch1.p3', 'ch1 Te', Te, 0, '255', '255 K');
pin('ch1.p3', 'ch1 Te in °C', M.K2C(Te), 0, '-18', '−18 ℃');
pin('ch1.p3', 'ch1 observed in °C', M.K2C(E.Tobs), 0, '15', '15 ℃'); says('ch1.p3', '288 K');
pin('ch1.p3', 'ch1 gap', E.Tobs - Te, 0, '33', '高了 33 K'); says('ch1.p3', '这 33 K');
pin('ch1.p4', 'ch1 albedo +0.01', M.balance.Te(E.S, 0.29) - M.balance.Te(E.S, 0.30), 1, '0.9', '降 0.9 K');
check('ch1 solar cycle', S.tsiCycle, 1); says('ch1.p4', '11 年'); says('ch1.p4', '约 1 W/m²');
pin('ch1.p4', 'ch1 solar cycle ΔT', M.balance.Te(E.S + S.tsiCycle, E.albedo) - Te, 2, '0.05', '变 0.05 K');
says('ch1.p4', '33 K');
// the slow simulation reaches the closed form
{ const s = M.balance.create(288); M.advance(s, 40, M.balance.H, (x, h) => M.balance.step(x, h, { S: E.S, albedo: E.albedo })); check('ch1 sim → Te', f(s.T, 3), f(Te, 3)); }

/* ── ch2 ── */
pin('ch2.p2', 'ch2 N₂ + O₂', S.nitrogenOxygenPct, 0, '99', '约占 99%'); says('ch2.law', '255 K');
says('ch2.model.how', '255 K');
{ const eps = M.layers.epsFor(E.Tobs, Te); check('ch2 eps for 288 K', f(eps, 2), '0.76'); says('ch2.p3', '0.76'); says('ch2.limit', '0.76');
  pin('ch2.p3', 'ch2 Ts at 0.76', M.layers.oneLayer(0.76, Te).Ts, 0, '288', '停在 288 K'); }
pin('ch2.p3', 'ch2 Ts at 1', M.layers.oneLayer(1, Te).Ts, 0, '304', '只到 304 K'); says('ch2.p3', '拖到 1');
pin('ch2.p3', 'ch2 OLR = absorbed', A, 0, '242', '242 W/m²');
{ // simulated steady state: outgoing equals absorbed sunlight, surface emission = sunlight + back radiation
  const s = M.layers.create(1, Te, Te); M.advance(s, 40, M.layers.H, (x, h) => M.layers.step(x, h, { S: E.S, albedo: E.albedo, eps: 0.76 }));
  const fl = M.layers.fluxes(s, 0.76);
  check('ch2 sim OLR = absorbed', f(fl.up, 2), f(A, 2)); check('ch2 sim surface balance', f(M.SIGMA * Math.pow(s.Ts, 4), 2), f(A + fl.down, 2));
  check('ch2 sim Ts', f(s.Ts, 2), f(M.layers.oneLayer(0.76, Te).Ts, 2)); }

/* ── ch3 ── */
says('ch3.law', '255 K'); says('ch3.leg.te', '255 K'); says('ch3.model.how', '255 K');
says('ch3.p2', '吸收比例为 1'); says('ch3.p1', '三件衣服');
{ for (const nn of [1, 2, 4, 8]) { const st = M.layers.stack(nn, Te); check('ch3 top layer = Te, n=' + nn, f(st.T[nn - 1], 6), f(Te, 6)); }
  pin('ch3.p3', 'ch3 top', Te, 0, '255', '最后总是 255 K');
  pin('ch3.p3', 'ch3 n=1', M.layers.stack(1, Te).Ts, 0, '304', '一层时地面 304 K');
  pin('ch3.p3', 'ch3 n=2', M.layers.stack(2, Te).Ts, 0, '336', '两层 336 K');
  pin('ch3.p3', 'ch3 n=4', M.layers.stack(4, Te).Ts, 0, '382', '四层 382 K');
  // the time-stepped stack converges to the closed form
  const s = M.layers.create(4, Te, Te); M.advance(s, 120, M.layers.H, (x, h) => M.layers.step(x, h, { S: E.S, albedo: E.albedo, eps: 1 }), 1e7);
  check('ch3 sim n=4', f(s.Ts, 1), f(M.layers.stack(4, Te).Ts, 1)); }
pin('ch3.p4', 'ch3 standard surface', S.surfaceC, 0, '15', '地面约 15 ℃');
pin('ch3.p4', 'ch3 lapse', S.lapse, 1, '6.5', '约降 6.5 ℃');
pin('ch3.p4', 'ch3 height of 255 K', (S.surfaceC + 273.15 - Te) / S.lapse, 0, '5', '大约在 5 千米'); says('ch3.p4', '255 K');

/* ── ch4 ── */
const Bd = M.band;
pin('ch4.p2', 'ch4 15 µm in cm⁻¹', 1e4 / 15, 0, '667', '约 667 cm⁻¹'); check('ch4 band centre', Bd.nu0, 667); says('ch4.p2', '15 微米'); says('ch4.p2', '每厘米 667 个波');
says('ch4.p2', '2022'); says('footer', '2022'); says('footer', '第 35 卷');
check('ch4 profile surface', f(Bd.Ts, 0), '288'); says('ch4.p2', '地面 288 K'); says('ch4.model.how', '288 K'); says('ch4.leg.hot', '288 K');
pin('ch4.p2', 'ch4 lapse', S.lapse, 1, '6.5', '每千米降 6.5 K');
pin('ch4.p2', 'ch4 stratosphere', Bd.Tstrat, 0, '217', '降到 217 K'); says('ch4.model.how', '217 K'); says('ch4.leg.cold', '217 K');
says('ch4.model.how', '280 ppm'); says('ch4.leg.ref', '280 ppm');
pin('ch4.p3', 'ch4 today', E.Cnow, 0, '426', '约 426 ppm');
{ const tau = Bd.tauSurf(667, E.Cnow, 'exp'), e2 = Math.floor(Math.log10(tau)) - 1, sig = Math.round(tau / Math.pow(10, e2)) * Math.pow(10, e2);
  check('ch4 centre optical depth (2 s.f.)', sig, 1200); says('ch4.p3', '光学厚度约 1200'); says('ch4.p3', '叠了 1200 张'); }
pin('ch4.p3', 'ch4 one optical depth transmits', Math.exp(-1) * 100, 0, '37', '只透过 37%');
pin('ch4.p3', 'ch4 280→560', Bd.forcing(560, 280) - Bd.forcing(280, 280), 2, '4.70', '强迫增加 4.70 W/m²'); says('ch4.p3', '从 280 加倍到 560 ppm');
pin('ch4.p3', 'ch4 560→1120', Bd.forcing(1120, 280) - Bd.forcing(560, 280), 2, '4.68', '增加 4.68 W/m²'); says('ch4.p3', '从 560 再加倍到 1120 ppm');
pin('ch4.p3', 'ch4 width per doubling', 2 * (Bd.halfWidth(560) - Bd.halfWidth(280)), 0, '17', '约 17 cm⁻¹');
check('ch4 width per doubling = 2 l ln2', f(Bd.widthPerDoubling, 2), f(2 * (Bd.halfWidth(560) - Bd.halfWidth(280)), 2));
// logarithmic: per-doubling forcing within 5 % from 4 to 2048 ppm (the slider range), for the exponential band
{ const ref = Bd.forcing(560, 280) - Bd.forcing(280, 280), per = []; for (let q = 8; q <= 2048; q *= 2) per.push(Bd.forcing(2 * q, 280) - Bd.forcing(q, 280));
  ok('ch4 log: each doubling from 8 to 4096 ppm within 5 % of the 280→560 value', per.every(x => Math.abs(x / ref - 1) < 0.05)); }
pin('ch4.p4', 'ch4 box 280→560', Bd.forcing(560, 280, 'box') - Bd.forcing(280, 280, 'box'), 3, '0.005', '只多挡住 0.005 W/m²'); says('ch4.p4', '在 280 ppm');
ok('ch4 box is not saturated at 10 ppm', Bd.forcing(20, 280, 'box') - Bd.forcing(10, 280, 'box') > 1);
pin('ch4.p5', 'ch4 model per doubling', Bd.forcing(560, 280) - Bd.forcing(280, 280), 1, '4.7', '每倍 4.7 W/m²');
ok('ch4 model per doubling lies in Romps et al.\'s 4–5 W/m² for the simple CO₂-only model', range(S.rompsF2x, 0) === '4–5' && Bd.forcing(560, 280) - Bd.forcing(280, 280) > S.rompsF2x[0] && Bd.forcing(560, 280) - Bd.forcing(280, 280) < S.rompsF2x[1]); says('ch4.p5', '每倍 4–5 W/m²');
ok('ch4 model per doubling is above the AR6 value (the prose says so)', Bd.forcing(560, 280) - Bd.forcing(280, 280) > S.F2xRange[1]); says('ch4.p5', '比评估值高');
// logarithmic over 180–1120 ppm: forcing against ln C is a straight line to within 0.05 W/m²
{ const xs = [], ys = []; for (let c = 180; c <= 1120 * 1.0001; c *= 1.05) { xs.push(Math.log(c)); ys.push(Bd.forcing(c, 280)); }
  const mx = xs.reduce((a, b) => a + b) / xs.length, my = ys.reduce((a, b) => a + b) / ys.length; let sxy = 0, sxx = 0; xs.forEach((x, i) => { sxy += (x - mx) * (ys[i] - my); sxx += (x - mx) ** 2; });
  const b = sxy / sxx; ok('ch4 log-linear 180–1120 ppm (max residual < 0.05 W/m²)', xs.every((x, i) => Math.abs(ys[i] - my - b * (x - mx)) < 0.05)); }
check('ch4 Myhre coefficient', f(M.myhre(2, 1) / Math.log(2), 2), '5.35'); says('ch4.p5', '5.35 × ln(C/C₀)');
pin('ch4.p5', 'ch4 Myhre 2×', M.myhre(2, 1), 2, '3.71', '加倍时给出 3.71 W/m²'); check('ch4 Myhre 2× = AR5 value', f(M.myhre(2, 1), 2), f(S.myhre2x, 2));
check('ch4 AR6 2×', E.F2x, 3.93); says('ch4.p5', '有效辐射强迫是 3.93 W/m²'); says('footer', '加倍强迫 3.93 W/m²');
check('ch4 AR6 2× range', range([E.F2x - 0.47, E.F2x + 0.47], 2), range(S.F2xRange, 2)); says('ch4.p5', '5%–95% 范围 3.46–4.40');
check('ch4 1750', f(E.C0, 0), '278'); says('ch4.p5', '1750 年的二氧化碳约 278 ppm');
check('ch4 2019', f(E.C2019, 0), '410'); says('ch4.p5', '2019 年 410 ppm');
check('ch4 2025', f(E.Cnow, 1), '425.6'); says('ch4.p5', '2025 年全球年平均 425.6 ppm'); says('footer', '2025 年全球年平均二氧化碳 425.6 ppm');
pin('ch4.p5', 'ch4 Myhre 1750→2025', M.myhre(E.Cnow, E.C0), 2, '2.27', '约 2.27 W/m²'); says('ch4.p5', '从 1750 年到 2025 年');
check('ch4 AR6 CO₂ ERF 2019', S.co2Erf2019 + ' ' + range(S.co2Erf2019Range, 2), '2.16 1.90–2.41'); says('ch4.p5', '1750–2019 年的评估是 2.16 W/m²（1.90–2.41）');
check('ch4 Romps range', range(S.rompsRange, 0), '4–4096'); says('ch4.limit', '4 到 4096 ppm'); says('ch4.limit', '15 微米');
says('footer', '15 微米'); says('ch4.p4', '1 ppm'); says('ch4.law', '每多一倍');

/* ── ch5 ── */
const FB = M.feedback, ON = { wvlr: true, albedo: true, cloud: true, cloudVal: FB.AR6.cloud };
pin('ch5.law', 'ch5 no-feedback (law)', FB.dT0(), 1, '1.2', '约 1.2 度'); says('ch5.law', '3 度上下'); ok('ch5 "about 3"', Math.abs(FB.ecs(ON) - 3) < 0.5);
pin('ch5.p2', 'ch5 blackbody Planck 4σTe³', 4 * M.SIGMA * Math.pow(Te, 3), 1, '3.8', '是 3.8 W/m²');
check('ch5 AR6 Planck', E.lambdaP, 3.22); says('ch5.p2', '评估的是 3.22 W/m²'); check('ch5 Planck very likely', range(S.planckVeryLikely, 1), '3.0–3.4'); says('ch5.p2', '3.0–3.4');
says('ch5.p2', '加倍强迫 3.93 W/m² 除以 3.22');
pin('ch5.p2', 'ch5 ΔT0', FB.dT0(), 2, '1.22', '得到 1.22 K'); says('ch5.model.how', '1.22 K'); says('ch6.p2', '1.22 ÷ (1 − f)'); check('ch6 uses the same ΔT0', f(M.spread.dT0(), 2), '1.22');
pin('ch5.p2', 'ch5 ΔT0 with 3.71', FB.dT0(3.71), 2, '1.15', '用 3.71 W/m² 则是 1.15 K');
says('ch5.p2', '星球暖 1 K');
check('ch5 WV+LR', f(FB.AR6.wvlr, 2), '1.30'); says('ch5.ctl.wv', '+1.30');
check('ch5 albedo', f(FB.AR6.albedo, 2), '0.35'); says('ch5.ctl.al', '+0.35');
pin('ch5.p3', 'ch5 f', FB.f(ON), 2, '0.64', 'f = 0.64');
pin('ch5.p3', 'ch5 ECS', FB.ecs(ON), 2, '3.39', '最后停在 3.39 K');
check('ch5 = AR6 process median', f(FB.ecs(ON), 1), f(S.ecsProcessMedian, 1)); says('ch5.p3', '中值 3.4 ℃');
check('ch5 net feedback = AR6', f(FB.net(ON), 2), f(-S.netFeedback, 2));
check('ch5 other feedback', FB.AR6.other, -0.01); says('ch5.p3', '−0.01 W/m²/K'); says('ch5.p3', '净反馈 −1.16');
check('ch5 sum of Table 7.10 terms', f(-E.lambdaP + FB.AR6.wvlr + FB.AR6.albedo + FB.AR6.cloud + FB.AR6.other, 2), f(S.netFeedback, 2));
says('ch5.p3', '最可能 3 ℃，可能范围 2.5–4 ℃'); check('ch5 AR6 assessed ECS', S.ecsBest + ' ' + range(S.ecsLikely, 1), '3 2.5–4.0');
pin('ch5.p3', 'ch5 first round', FB.rounds(FB.f(ON), 1) - FB.rounds(FB.f(ON), 0), 2, '0.78', '就加了 0.78 K');
check('ch5 rounds to 95 %', FB.roundsTo(FB.f(ON), 0.95), 6); says('ch5.p3', '到第 6 轮已过 95%');
ok('ch5 round 6 ≥ 95 %, round 5 < 95 %', FB.rounds(FB.f(ON), 6) / FB.ecs(ON) >= 0.95 && FB.rounds(FB.f(ON), 5) / FB.ecs(ON) < 0.95);
pin('ch5.p3', 'ch5 no water vapour', FB.ecs({ ...ON, wvlr: false }), 2, '1.60', '只剩 1.60 K');
check('ch5 cloud likely', range(FB.AR6.cloudLikely, 2), '0.12–0.72'); says('ch5.p4', '0.12–0.72 W/m²/K');
pin('ch5.p4', 'ch5 cloud low', FB.ecs({ ...ON, cloudVal: 0.12 }), 2, '2.69', '从 2.69 K');
pin('ch5.p4', 'ch5 cloud high', FB.ecs({ ...ON, cloudVal: 0.72 }), 2, '4.57', '变到 4.57 K');
check('ch5 cloud very likely', range(FB.AR6.cloudVeryLikely, 2), '-0.10–0.94'); says('ch5.p4', '−0.10–0.94');
pin('ch5.p4', 'ch5 cloud very low', FB.ecs({ ...ON, cloudVal: -0.10 }), 2, '2.34', '从 2.34 K');
pin('ch5.p4', 'ch5 cloud very high', FB.ecs({ ...ON, cloudVal: 0.94 }), 2, '6.14', '变到 6.14 K');
says('ch5.p4', '三分之二'); says('ch5.p4', '九成'); says('ch5.p1', '100%');
// the slider's range is the AR6 very likely range, so the model never reaches f ≥ 1
ok('ch5 f < 1 at the strongest setting', FB.f({ ...ON, cloudVal: 0.94 }) < 1);

/* ── ch6 ── */
const SP = M.spread, a6 = SP.fromAR6();
check('ch6 net feedback', S.netFeedback + ' ' + range(S.netFeedbackVeryLikely, 2), '-1.16 -1.81–-0.51'); says('ch6.p3', '−1.16 W/m²/K'); says('ch6.p3', '−1.81 到 −0.51');
pin('ch6.p3', 'ch6 f mean', a6.mu, 2, '0.64', '换算成 f 是 0.64'); pin('ch6.p3', 'ch6 f sd', a6.sd, 2, '0.12', '标准差 0.12');
{ const mu = 0.64, sd = 0.123; // the slider defaults (AR6 values on the slider grid)
  check('ch6 slider defaults = AR6 rounded', f(a6.mu, 2) + '/' + f(a6.sd, 3), '0.64/0.123');
  const med = SP.ecsOf(mu), lo = SP.quantile(0.05, mu, sd), hi = SP.quantile(0.95, mu, sd);
  pin('ch6.p3', 'ch6 median', med, 2, '3.39', '中位数 3.39 K');
  pin('ch6.p3', 'ch6 5 %', lo, 2, '2.17', '2.17 到 7.74 K'); check('ch6 95 %', f(hi, 2), '7.74');
  // the exact AR6-derived values round the same way to one decimal
  check('ch6 exact AR6 5–95 %', f(SP.quantile(0.05, a6.mu, a6.sd), 1) + '–' + f(SP.quantile(0.95, a6.mu, a6.sd), 1), '2.2–7.7');
  pin('ch6.p3', 'ch6 down', med - lo, 2, '1.22', '低 1.22 K'); pin('ch6.p3', 'ch6 up', hi - med, 2, '4.35', '高出 4.35 K');
  check('ch6 AR6 process', f(S.ecsProcessMedian, 1) + ' ' + range(S.ecsProcessVeryLikely, 1), '3.4 2.1–7.7'); says('ch6.p3', '中位数 3.4 ℃，很可能范围 2.1–7.7 ℃');
  const sd2 = 0.062; check('ch6 half sd', f(sd / 2, 3).slice(0, 4), '0.06'); says('ch6.p4', '一半（0.062）');
  const lo2 = SP.quantile(0.05, mu, sd2), hi2 = SP.quantile(0.95, mu, sd2);
  check('ch6 half range', f(lo2, 2) + '–' + f(hi2, 2), '2.64–4.73'); says('ch6.p4', '缩到 2.64–4.73 K');
  pin('ch6.p4', 'ch6 upper drop', hi - hi2, 0, '3', '上沿降了 3 K'); pin('ch6.p4', 'ch6 lower rise', lo2 - lo, 1, '0.5', '下沿只升了 0.5 K');
  // the seeded Monte Carlo agrees with the exact median
  const r = SP.rng(7), xs = []; for (let i = 0; i < 20000; i++) xs.push(SP.ecsOf(SP.draw(r, mu, sd))); xs.sort((p, q) => p - q);
  ok('ch6 Monte Carlo median ≈ exact', Math.abs(xs[10000] - med) < 0.05);
  ok('ch6 skewed', hi - med > 3 * (med - lo)); }
check('ch6 AR6 combined', S.ecsBest + ' ' + range(S.ecsLikely, 1) + ' ' + range(S.ecsVeryLikely, 0), '3 2.5–4.0 2–5');
says('ch6.p4', '最可能 3 ℃，可能范围 2.5–4 ℃，很可能范围 2–5 ℃'); says('ch6.model.how', '2.5–4 ℃'); says('ch6.leg.ar6', '2.5–4 ℃');
says('ch6.p4', '2007'); says('ch6.p4', '1 ÷ (1 − f)'); says('ch6.p3', '标准差 0.12”'); says('footer', '2007'); says('footer', '第 318 卷'); says('ch6.model.how', '5%–95%'); says('ch6.leg.band', '5%–95%');
says('ch6.p1', '1 ÷ (1 − f)'); says('ch6.p1', '越接近 1'); says('ch6.limit', '达到 1');

/* ── ch7 ── */
const O = M.ocean, P0 = { scen: 'ramp', h: 100, ecs: 3.4 };
check('ch7 ocean fraction', E.oceanFrac, 0.7); says('ch7.p1', '七成以上');
check('ch7 ocean heat share', S.oceanHeatShare, 91); says('ch7.p1', '有 91% 进了海洋');
pin('ch7.p2', 'ch7 1 − 1/e', (1 - Math.exp(-1)) * 100, 0, '63', '差距的 63%');
check('ch7 time constant = 63 %', f(O.stepExact(O.tau(100, 3.4), 100, 3.4) / 3.4, 4), f(1 - Math.exp(-1), 4));
check('ch7 ramp doubles at year 70', f(O.tDouble, 0), '70'); says('ch7.model.how', '每年增加 1%，第 70 年加倍'); says('ch7.p4', '每年 +1% 到第 70 年');
check('ch7 default ECS = ch5 rounded', f(FB.ecs(ON), 1), '3.4'); says('ch7.model.how', '默认 3.4 K'); says('ch7.p3', '敏感度 3.4 K');
says('ch7.p3', '默认 100 米深');
pin('ch7.p3', 'ch7 tau', O.tau(100, 3.4), 1, '7.8', '约 7.8 年');
{ const T70 = O.at(P0, 70);
  pin('ch7.p3', 'ch7 T70', T70, 2, '3.03', '升温 3.03 K'); says('ch7.p3', '到第 70 年');
  pin('ch7.p3', 'ch7 gap at 70', 3.4 - T70, 1, '0.4', '还差 0.4 K');
  pin('ch7.p3', 'ch7 imbalance at 70', E.F2x - O.lambda(3.4) * T70, 2, '0.42', '还在吸收 0.42 W');
  ok('ch7 still warming after the forcing stops rising', O.at(P0, 150) - T70 > 0.3); }
check('ch7 EEI', S.eei2006_2018 + ' ' + range(S.eeiRange, 2), '0.79 0.52–1.06'); says('ch7.p3', '2006–2018 年'); says('ch7.p3', '0.79 W（0.52–1.06）');
check('ch7 TCR', S.tcrBest + ' ' + range(S.tcrLikely, 1), '1.8 1.4–2.2'); says('ch7.p4', '最可能 1.8 ℃，可能范围 1.4–2.2 ℃');
ok('ch7 shallow box overshoots TCR', O.at(P0, 70) > S.tcrLikely[1]);
{ const P5 = { scen: 'ramp', h: 500, ecs: 3.4 };
  pin('ch7.p4', 'ch7 500 m T70', O.at(P5, 70), 2, '1.82', '第 70 年是 1.82 K'); says('ch7.p4', '500 米深');
  ok('ch7 500 m T70 within AR6 TCR likely range', O.at(P5, 70) >= S.tcrLikely[0] && O.at(P5, 70) <= S.tcrLikely[1]);
  pin('ch7.p4', 'ch7 500 m tau', O.tau(500, 3.4), 0, '39', '变成 39 年');
  const t95 = 3 * O.tau(500, 3.4); ok('ch7 "more than a hundred years" (3τ, 95 %)', t95 > 100 && t95 < 200); says('ch7.p4', '一百多年'); }
check('ch7 total ERF', S.totalErf2019 + ' ' + range(S.totalErf2019Range, 2), '2.72 1.96–3.48'); says('ch7.limit', '2.72 W/m²（1.96–3.48）'); says('ch7.limit', '2019 年');
check('ch7 warming', S.warming2011_2020 + ' ' + range(S.warmingRange, 2), '1.09 0.95–1.20'); says('ch7.limit', '2011–2020 年'); says('ch7.limit', '1850–1900 年'); says('ch7.limit', '1.09 ℃（0.95–1.20）');

/* ── ch8 ── */
says('ch8.p1', '万分之四'); check('ch8 "four in ten thousand"', Math.round(E.Cnow / 100), 4);
says('ch8.c2', '从 280 到 560 ppm'); says('ch8.c2', '从 560 到 1120 ppm');
says('ch8.c3', '从 2 ℃ 到 5 ℃'); says('ch8.q2', '每多 1 ppm');
check('ch8 "only 1 degree" = no-feedback warming', f(FB.dT0(), 0), '1'); says('ch8.q3', '只会暖 1 度'); ok('ch8 AR6 net feedback negative ⇒ f < 1', S.netFeedbackVeryLikely[1] < 0); says('ch8.q3', 'f 到 1');
pin('ch8.sum', 'ch8 amplification', FB.ecs(ON) / FB.dT0(), 1, '2.8', '约 2.8 倍');
for (const [k, w] of [['ch8.p1', '第二章'], ['ch8.q1', '第一、四章']]) says(k, w);

/* ── footer & note: years and other figures ── */
says('ch1.btn.reset', '288 K'); says('ch2.leg.obs', '288 K'); says('ch3.model.how', '第 1 层'); says('ch3.btn.reset', '255 K');
says('ch4.model.aria1', '15 微米'); says('ch4.read.f', '280 ppm'); says('ch4.p3', '217 K'); says('ch5.model.how', '第 0 轮'); says('ch5.leg.r0', '第 0 轮');
says('ch6.read.range', '5%–95%'); says('ch6.read.high', '5 K'); says('ch6.p3', '5%–95%'); says('ch7.scen.ramp', '+1%'); says('ch7.read.t70', '第 70 年');
says('footer', '1750 年与 2019 年');
says('footer', '0.29'); says('footer', 'AR6'); says('hero.note', 'AR6');
says('ch2.limit', '0.76');

/* ── every number in prose-like keys is covered by a pin ── */
{
  const skip = k => /\.say\.|\.unit\.|^doc\.|^common\./.test(k);
  const strip = s => s.replace(/<[^>]+>/g, '').replace(/AR[56]/g, '');
  for (const [k, v] of Object.entries(Z)) {
    if (skip(k)) continue;
    const nums = strip(v).match(/[−-]?\d+(?:[.,]\d+)*/g) || [];
    for (const x of nums) {
      n++;
      const bare = x.replace(/^[−-]/, '');
      if (!(pinned[k] || []).some(p => p.includes(bare))) { fails++; console.error(`FAIL ${k}: the number ${x} is not pinned by any check`); }
    }
  }
}

/* ── defaults in the markup are the states the prose describes ── */
{
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const val = id => { const m = html.match(new RegExp('id="' + id + '"[^>]*value="([^"]+)"')); return m && m[1]; };
  const want = { blS: '1361', blA: '0.29', olE: '0.76', nlN: '2', spC: '15', fbCv2: '0.42', dsMu: '0.64', dsSd: '0.123', ocH: '3', ocE: '3.4' };
  for (const [id, v] of Object.entries(want)) check('default ' + id, val(id), v);
  const app = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
  const ppm = app.match(/const PPM = \[([^\]]+)\]/)[1].split(',').map(s => s.trim());
  check('ch4 slider index 15 = today', ppm[15], 'E.Cnow'); check('ch4 slider covers 4–4096', ppm[0] + '–' + ppm[ppm.length - 1], '4–4096');
  const depths = app.match(/DEPTHS = \[([^\]]+)\]/)[1].split(',').map(s => +s);
  check('ch7 slider index 3 = 100 m', depths[3], 100); ok('ch7 slider has 500 m', depths.includes(500));
  check('ch5 cloud slider = AR6 very likely range', /id="fbCv2" min="-0.1" max="0.94"/.test(html), true);
  check('ch5 default all feedbacks on', (html.match(/id="fb(Wv|Al|Cl)" checked/g) || []).length, 3);
  check('ch7 default scenario ramp', /name="ocScen" value="ramp" checked/.test(html), true);
  check('ch4 default shape exp', /name="spShape" value="exp" checked/.test(html), true);
}

/* ── copy integrity: placeholders supplied, keys present, no Chinese outside copy ── */
{
  const app = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
  for (const [k, v] of Object.entries(Z)) for (const m of v.matchAll(/\{(\w+)\}/g)) {
    n++; if (!new RegExp('(\\b' + m[1] + '\\s*:|\\.' + m[1] + '\\s*=)').test(app)) { fails++; console.error(`FAIL placeholder {${m[1]}} in ${k} is never supplied by app.js`); }
  }
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const keys = new Set([...html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)].map(m => m[1]));
  for (const m of app.matchAll(/'((?:ch\d|common|nav|doc)\.[\w.]+)'/g)) keys.add(m[1]);
  for (const k of keys) { n++; if (Z[k] == null) { fails++; console.error('FAIL missing zh key ' + k); } }
  for (const file of ['index.html', 'app.js', 'models.js']) {
    // The site's static provenance label (specs/visual-page-provenance.md) is bilingual by contract and not essay copy.
    const src = fs.readFileSync(path.join(__dirname, '..', file), 'utf8').replace(/<details class="page-provenance"[\s\S]*?<\/details>/, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '').replace(/<!--[\s\S]*?-->/g, '');
    const others = (src.match(/[㐀-鿿]+/g) || []).filter(x => !(file === 'index.html' && x === '中')); n++;
    if (others.length) { fails++; console.error(`FAIL Chinese text in ${file}: ${others.slice(0, 3).join(' ')}`); }
  }
  // no language-specific number words generated in code
  n++; if (/万|亿|成/.test(app.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, ''))) { fails++; console.error('FAIL number words in app.js'); }
  const en = path.join(__dirname, '..', 'copy.en.js');
  if (fs.existsSync(en)) {
    const ce = { window: {} }; vm.runInNewContext(fs.readFileSync(en, 'utf8'), ce); const EN = ce.window.ESSAY_COPY.en;
    n++; if (JSON.stringify(Object.keys(Z).sort()) !== JSON.stringify(Object.keys(EN).sort())) { fails++; console.error('FAIL copy.en.js keys differ from copy.zh.js'); }
  }
}

if (fails) { console.error(`\n${fails} of ${n} checks failed`); process.exit(1); }
console.log(`PASS: ${n} checks (every number in the prose is pinned to the models or to the sourced tables)`);
