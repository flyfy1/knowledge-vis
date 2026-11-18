'use strict';
// Pins every number the essay's prose states to the page's own models, and checks that the prose
// (copy.zh.js) still says exactly that number. Also checks that every live-sentence branch is reachable
// and true at the extremes of its controls. Run: node tech/energy/how-electricity-reaches-you/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const dir = path.join(__dirname, '..');
const M = require(path.join(dir, 'models.js'));
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(dir, 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
const attr = (id, a) => { const m = html.match(new RegExp(`id="${id}"[^>]*\\s${a}="([^"]+)"`)); if (!m) throw new Error('no ' + a + ' on #' + id); return +m[1]; };
const val = id => attr(id, 'value');

let n = 0, fails = 0;
function check(name, got, want) { n++; if (got !== want) { fails++; console.error(`FAIL ${name}: model gives ${got}, expected ${want}`); } }
function ok(name, cond) { n++; if (!cond) { fails++; console.error('FAIL ' + name); } }
function says(key, phrase) { n++; if (!Z[key] || !Z[key].includes(phrase)) { fails++; console.error(`FAIL prose ${key} should contain "${phrase}"`); } }
const f = (x, d) => (Math.abs(x) < 0.5 * Math.pow(10, -d) ? 0 : x).toFixed(d);
const S = M.swing, O = M.operator, L = M.line, T3 = M.three, G = M.merit, Dk = M.duck, St = M.storage, N = M.net6, CA = M.caiso;
const cross = (series, lvl) => { const p = series.find(q => q[1] < lvl); return p ? p[0] : null; };

/* ── ch1 swing equation ── */
{
  check('ch1 default gap = 1000 MW', val('s1P'), 1000); check('ch1 default H = 4', val('s1H'), 4);
  check('ch1 model S', S.defaults.S, 30000); check('ch1 model H', S.defaults.H, 4); check('ch1 model D', S.defaults.D, 1);
  says('ch1.model.how', '1000 兆瓦'); says('ch1.p3', 'H = 4 秒、全网 30 吉瓦'); says('ch1.limit', 'D 取 1');
  says('ch1.p3', 'H 在 2 到 7 秒之间'); ok('ch1 slider H covers 2–7', attr('s1H', 'min') <= 2 && attr('s1H', 'max') >= 7);
  const p = { dP: 1000, H: 4 };
  check('ch1 stored energy', f(S.stored(p), 0), '120000'); says('ch1.p3', '4 × 30000 = 120000 兆焦');
  check('ch1 RoCoF', f(-S.rocof(p), 2), '0.21'); says('ch1.p3', '每秒掉约 0.21 赫兹');
  const r = S.run(p, 20, 0.05);
  check('ch1 cross 48.8 at H 4', f(cross(r.series, 48.8), 1), '10.2'); says('ch1.p3', '约 10.2 秒后碰到 48.8 赫兹');
  check('ch1 cross 48.8 at H 2', f(cross(S.run({ dP: 1000, H: 2 }, 20, 0.05).series, 48.8), 1), '5.1'); says('ch1.p3', '只要约 5.1 秒');
  check('ch1 f at 1 s', f(r.f1, 2), '49.80');
  check('ch1 settle without governor', f(S.settle(p), 2), '48.33'); says('ch2.p3', '48.33 赫兹');
  // closed form: with no governor the gap decays with τ = 2H/D: f(t) = 50 − 50·ΔP/(D·S)·(1 − e^{−t/τ})
  const exact = 50 - 50 * (1000 / 30000) * (1 - Math.exp(-10 / S.tau(p)));
  check('ch1 RK4 = exact at 10 s', f(r.series.find(q => Math.abs(q[0] - 10) < 1e-6)[1], 6), f(exact, 6));
  // kettle
  const k = -S.rocof({ dP: 0.002 }); check('ch1 kettle RoCoF ≈ 4e-7', f(k * 1e7, 0), '4'); says('ch1.p4', '约 4 × 10⁻⁷ 赫兹');
  says('ch1.p4', '2 千瓦');
  // live sentence branches: smallest gap never crosses, largest does
  ok('ch1 safe branch at 100 MW', cross(S.run({ dP: 100, H: 8 }, 20, 0.05).series, 48.8) == null && S.settle({ dP: 100 }) > 48.8);
  ok('ch1 cross branch at 3000 MW', cross(S.run({ dP: 3000, H: 1 }, 20, 0.05).series, 48.8) != null);
  check('ch1 safe sentence share at 100 MW', f(100 * 100 / S.defaults.S, 1), '0.3');
}

/* ── ch2 governors ── */
{
  check('ch2 default droop', val('s2R'), 5); check('ch2 default reserve', val('s2Res'), 1500); check('ch2 default gap', val('s2P'), 1000);
  says('ch2.p3', '缺口 1000 兆瓦，下垂 5%，备用 1500 兆瓦'); says('ch2.p2', '推荐的常用设定是 5%');
  const d = { governor: true, reserve: 1500 }, r = S.run(d, 120, 0.1);
  check('ch2 nadir', f(r.nadir, 2), '49.75'); says('ch2.p3', '最低点 49.75 赫兹');
  check('ch2 nadir time', f(r.tNadir, 1), '3.9'); says('ch2.p3', '约 3.9 秒时');
  check('ch2 settles', f(r.fEnd, 2), '49.92'); says('ch2.p3', '停在 49.92 赫兹');
  check('ch2 closed-form settle = simulated', f(S.settle(d), 3), f(r.fEnd, 3));
  check('ch2 governors add', f(r.pm, 0), '952'); says('ch2.p3', '约 952 兆瓦');
  check('ch2 remaining deviation', f(50 - r.fEnd, 2), '0.08'); says('ch2.p3', '最后那 0.08 赫兹');
  check('ch2 droop 10%', f(S.run({ ...d, R: 0.1 }, 120).fEnd, 2), '49.85'); says('ch2.p3', '最后停在 49.85 赫兹');
  const a = S.run({ ...d, agc: true }, 120, 0.1), tt = a.series.find(q => q[0] > 10 && q[1] >= 49.99);
  check('ch2 AGC back to 49.99', f(tt[0], 0), '85'); says('ch2.p3', '约 85 秒回到 49.99 赫兹');
  check('ch2 reserve 250', f(S.run({ ...d, reserve: 250 }, 120).fEnd, 2), '48.75'); says('ch2.p4', '停在 48.75 赫兹'); says('ch2.p4', '备用拖到 250 兆瓦');
  check('ch2 turbine Tg', S.defaults.Tg, 0.2); check('ch2 Trh', S.defaults.Trh, 7); check('ch2 Fhp', S.defaults.Fhp, 0.3); says('ch2.limit', '调速器 0.2 秒、再热 7 秒，高压缸占 30%');
  ok('ch2 slider reserve min is 250', attr('s2Res', 'min') === 250);
  // short-of-reserve branch: 3000 MW against 250 MW settles far below 48.8; with AGC too
  const need = (dp, R) => dp * (1 / R) / (1 + 1 / R);
  ok('ch2 short branch at extremes', need(3000, 0.03) > 250 && S.run({ governor: true, reserve: 250, dP: 3000 }, 120).fEnd < 48.8 && S.run({ governor: true, agc: true, reserve: 250, dP: 3000 }, 120).fEnd < 48.8);
  ok('ch2 "above" variant reachable (short, but above 48.8)', need(1600, 0.05) > 1500 && S.run({ governor: true, reserve: 1500, dP: 1600 }, 120).fEnd > 48.8);
  ok('ch2 ok branch at smallest gap', need(100, 0.1) < 250);
  ok('ch2 AGC restores at the largest gap the reserve covers', S.run({ governor: true, agc: true, reserve: 3000, dP: 2800, R: 0.1 }, 120).fEnd > 49.9);
}

/* ── ch3 operator ── */
{
  check('ch3 July min', f(Math.min(...CA.julyDemand), 1), '24.8'); check('ch3 July max', f(Math.max(...CA.julyDemand), 1), '36.9');
  check('ch3 July peak hour', CA.julyDemand.indexOf(Math.max(...CA.julyDemand)), 19);
  says('ch3.p2', '从凌晨的 24.8 吉瓦到晚上七点的 36.9 吉瓦');
  ok('ch3 a day in 96 s', /SPEED = 0\.25;/.test(app) && 24 / 0.25 === 96); says('ch3.model.how', '约 96 秒');
  check('ch3 reserve', O.P.reserve, 1); check('ch3 governor limit', f(O.P.reserve * (O.P.D + 1 / O.P.R) * O.P.R, 2), '1.05'); says('ch3.model.how', '偏差超过约 1 吉瓦');
  check('ch3 band', O.P.band, 0.2); check('ch3 S', O.P.S, 35); says('ch3.limit', '全网规模 35 吉瓦、备用 1 吉瓦');
  check('ch3 July steepest', f(O.maxRamp('july').rate, 1), '1.9'); says('ch3.p3', '每小时涨约 1.9 吉瓦');
  check('ch3 auto 2 GW/h out', f(O.runDay('july', 2).out * 60, 0), '0'); says('ch3.p3', '只要机组每小时能爬 2 吉瓦');
  check('ch3 auto 1.5 GW/h out', f(O.runDay('july', 1.5).out * 60, 0), '66'); says('ch3.p3', '就有 66 分钟出界');
  check('ch3 net auto 4 GW/h out', f(O.runDay('net', 4).out * 60, 0), '150'); says('ch3.p4', '自动跟踪也会出界 150 分钟');
  check('ch3 net steepest', f(O.maxRamp('net').rate, 1), '6.9'); says('ch3.p4', '每小时要涨约 6.9 吉瓦');
  check('ch3 net auto 6 GW/h out', f(O.runDay('net', 6).out * 60, 0), '0'); says('ch3.p4', '要每小时能爬 6 吉瓦');
  check('ch3 default ramp', val('opR'), 4);
  // the frequency formula: within the governor limit Δf = 50 m/(S(D+1/R)); beyond, only damping
  check('ch3 Δf at 1 GW', f(O.df(1), 3), '0.068'); check('ch3 Δf at −1.5 GW', f(O.df(-1.5), 3), '-0.714');
  ok('ch3 df continuous at the limit', Math.abs(O.df(1.05 - 1e-9) - O.df(1.05 + 1e-9)) < 1e-6);
  ok('ch3 extremes: ramp 1 fails July, ramp 10 passes net', O.runDay('july', 1).out > 0 && O.runDay('net', 10).out === 0);
}

/* ── ch4 line loss ── */
{
  check('ch4 r', L.r, 0.08); says('ch4.model.how', '每公里约 0.08 欧姆');
  check('ch4 default V index → 220', L.levels[val('lnV')], 220); check('ch4 default P', val('lnP'), 500); check('ch4 default L', val('lnL'), 100);
  says('ch4.model.title', '送 500 兆瓦走 100 公里');
  const sh = (V, Lk = 100, P = 500) => 100 * L.share(P, V, Lk);
  check('ch4 220 kV', f(sh(220), 1), '8.3'); says('ch4.p3', '220 千伏时线损约 8.3%');
  check('ch4 500 kV', f(sh(500), 1), '1.6'); says('ch4.p3', '只剩约 1.6%');
  check('ch4 110 kV', f(sh(110), 0), '33'); says('ch4.p3', '要丢掉约 33%');
  check('ch4 500 kV 1000 km', f(sh(500, 1000), 0), '16'); says('ch4.p3', '500 千伏也要丢约 16%');
  check('ch4 1000 kV 1000 km', f(sh(1000, 1000), 0), '4'); says('ch4.p3', '1000 千伏只丢约 4%');
  check('ch4 doubling V quarters the loss', f(L.loss(500, 440, 100) / L.loss(500, 220, 100), 4), '0.2500'); says('ch4.law', '只剩四分之一');
  // loss = 3 I² R with I = P/(√3 V)
  check('ch4 3I²R = P²R/V²', f(3 * Math.pow(L.current(500, 220), 2) * 8 / 1e6, 6), f(L.loss(500, 220, 100), 6));
  ok('ch4 absurd branch at 0.4 kV', L.share(2000, 0.4, 1500) > 1 && L.share(100, 1000, 10) < 0.05);
}

/* ── ch5 transformer ── */
{
  check('ch5 default ratio index (26:1)', val('txN'), 2); check('ch5 default load', val('txP'), 100);
  const r = M.xfmr.out(10000, 1 / 26, 100);
  check('ch5 V2', f(r.V2, 0), '385'); says('ch5.p3', '降到约 385 伏');
  check('ch5 I1', f(r.I1, 0), '10'); says('ch5.p3', '原边只有约 10 安');
  check('ch5 I2', f(r.I2, 0), '260'); says('ch5.p3', '副边要约 260 安');
  check('ch5 P in = P out', f(r.P1, 6), f(r.P2, 6));
  check('ch5 DC secondary', M.xfmr.v2(10000, 1 / 26, 0.01, true), 0);
}

/* ── ch6 three phases ── */
{
  const D2R = Math.PI / 180, s120 = T3.stats(120 * D2R), s60 = T3.stats(60 * D2R), s0 = T3.stats(0, 3), s1 = T3.stats(0, 1), s90 = T3.stats(90 * D2R);
  check('ch6 120 mean 3/2', f(s120.mean, 6), '1.500000'); check('ch6 120 ripple', f(s120.ripple * 100, 6), '0.000000'); check('ch6 120 neutral', f(s120.neutral, 6), '0.000000');
  says('ch6.p3', '= 3/2'); check('ch6 single-phase ripple', f(s1.ripple * 100, 0), '200'); says('ch6.p3', '起伏 200%');
  check('ch6 60 ripple 0', f(s60.ripple * 100, 6), '0.000000'); check('ch6 60 neutral 2', f(s60.neutral, 2), '2.00');
  check('ch6 0 ripple', f(s0.ripple * 100, 0), '200'); check('ch6 90 ripple', f(s90.ripple * 100, 0), '67');
  check('ch6 √3', f(T3.lineRatio(120 * D2R), 3), '1.732'); says('ch6.p4', '√3 ≈ 1.732');
  check('ch6 220·√3', f(220 * T3.lineRatio(120 * D2R), 0), '381'); says('ch6.p4', '220 × 1.732 ≈ 381');
  check('ch6 default spacing', val('tpPhi'), 120);
}

/* ── ch7 merit order ── */
{
  check('ch7 default gas', val('moG'), 3); check('ch7 default hour', val('moH'), 19);
  const d3 = G.day(3), d6 = G.day(6);
  ok('ch7 gas 3: night set by coal at 35', [0, 1, 2, 3, 4, 5, 6].every(h => d3[h].marginal === 'coal' && d3[h].price === 35)); says('ch7.p3', '由煤电定（35 美元/兆瓦时）');
  ok('ch7 gas 3: midday 24 by CCGT', [10, 11, 12, 13, 14].every(h => d3[h].marginal === 'ccgt' && d3[h].price === 24)); says('ch7.p3', '降到 24（燃气联合循环）');
  ok('ch7 gas 3: 19–22 h peaker 36.5', [19, 20, 21, 22].every(h => d3[h].marginal === 'peak' && d3[h].price === 36.5)); says('ch7.p3', '晚上七点到十点要叫上燃气调峰机组，涨到 36.5');
  ok('ch7 gas 6: evening 68', [19, 20, 21, 22].every(h => d6[h].price === 68)); says('ch7.p3', '晚高峰涨到 68');
  ok('ch7 gas 6: daytime coal 35', [8, 9, 10, 11, 12, 13, 14, 15].every(h => d6[h].marginal === 'coal' && d6[h].price === 35)); says('ch7.p3', '白天的价格停在煤电的 35');
  check('ch7 CCGT = coal at', f((35 - 3) / 7, 1), '4.6'); says('ch7.p3', '超过约 4.6 美元');
  check('ch7 peaker = coal at', f((35 - 5) / 10.5, 1), '2.9'); says('ch7.p3', '低于约 2.9 美元');
  check('ch7 heat rates', G.plants.find(p => p.id === 'ccgt').cost(1) - 3 + ',' + (G.plants.find(p => p.id === 'peak').cost(1) - 5), '7,10.5'); says('ch7.limit', '热耗率取 7 和 10.5');
  // branches at extremes: no hour in July is short or curtailed; in April at ×1 midday is curtailed (price 0)
  ok('ch7 July never short or curtailed', [1.5, 12].every(g => G.day(g).every(x => x.unserved === 0 && x.curtailed === 0)));
}

/* ── ch8 net load ── */
{
  check('ch8 default k', val('dkK'), 1);
  const s1 = Dk.stats(Dk.net(1)), s0 = Dk.stats(Dk.net(0)), s2 = Dk.stats(Dk.net(2));
  check('ch8 min', f(s1.min, 2), '0.63'); check('ch8 min hour', s1.tMin, 14); says('ch8.p3', '中午最低约 0.63 吉瓦，出现在下午两点前后');
  check('ch8 peak', f(s1.max, 1), '20.0'); check('ch8 peak hour', s1.tMax, 20); says('ch8.p3', '晚上八点的高峰约 20.0 吉瓦');
  check('ch8 ramp', f(s1.ramp3, 1), '16.1'); check('ch8 ramp from', s1.tRamp, 16); says('ch8.p3', '从下午四点到七点，三小时要爬约 16.1 吉瓦');
  check('ch8 no solar ramp', f(s0.ramp3, 1), '4.8'); says('ch8.p3', '三小时最多只爬约 4.8 吉瓦');
  check('ch8 ×2 min', f(s2.min, 1), '-12.4'); says('ch8.p3', '−12.4 吉瓦');
  check('ch8 ×2 ramp', f(s2.ramp3, 1), '27.4'); says('ch8.p3', '爬坡涨到约 27.4 吉瓦');
  ok('ch8 evening peak unchanged at every k', [0, 0.5, 1, 1.5, 2, 2.5].every(k => f(Dk.stats(Dk.net(k)).max, 1) === '20.0')); says('ch8.p3', '晚高峰一直是 20.0');
  check('ch8 curtailment ×1', f(s1.curtail, 1), '9.2'); says('ch9.p3', '要弃掉的 9.2 吉瓦时');
  check('ch8 floor = nuclear', Dk.floor, G.plants.find(p => p.id === 'nuc').cap); says('ch8.limit', '出力底线 3 吉瓦');
  ok('ch8 midday price 0 when curtailing', G.dispatch(CA.aprDemand[14], CA.aprSolar[14] + CA.aprWind[14], 3).price === 0);
  ok('ch8 dip branch reachable (k>0 without curtailment)', Dk.stats(Dk.net(0.5)).curtail === 0);
}

/* ── ch9 storage ── */
{
  check('ch9 defaults', [val('stP'), val('stE'), val('stEta')].join(','), '5,20,80');
  const net = Dk.net(1), r = St.plan(net, 5, 20, 0.8), a = Dk.stats(r.after);
  check('ch9 peak after', f(a.max, 1), '15.8'); says('ch9.p3', '晚高峰从 20.0 降到约 15.8 吉瓦');
  check('ch9 ramp after', f(a.ramp3, 1), '12.6'); says('ch9.p3', '三小时爬坡从 16.1 降到约 12.6');
  check('ch9 curtailment absorbed', f(r.curtAfter, 2), '0.00');
  check('ch9 in', f(r.Ein, 1), '25.0'); check('ch9 out', f(r.Eout, 1), '20.0'); check('ch9 lost', f(r.lost, 1), '5.0'); says('ch9.p3', '要充进 25 吉瓦时，路上丢 5 吉瓦时');
  const r6 = St.plan(net, 5, 20, 0.6);
  check('ch9 η 60 in', f(r6.Ein, 1), '33.3'); check('ch9 η 60 lost', f(r6.lost, 1), '13.3'); says('ch9.p3', '要充进约 33.3 吉瓦时，丢掉 13.3');
  check('ch9 η 60 same peak', f(Dk.stats(r6.after).max, 2), f(a.max, 2));
  check('ch9 round trip in model', f(r.Eout / r.Ein, 2), '0.80');
  ok('ch9 SOC never negative or above E', r.socs.every(x => x >= -1e-6 && x <= 20 + 1e-6));
  // branches: none / energy / power / flat
  const flat = St.plan(net, 15, 80, 0.95), pw = St.plan(net, 1, 80, 0.8);
  ok('ch9 flat branch at max', flat.V >= flat.T - 0.05);
  ok('ch9 power branch: 1 GW / 80 GWh', pw.Eout < 80 - 1e-3 && pw.V < pw.T - 0.05);
  ok('ch9 energy branch: default', r.Eout >= 20 - 1e-3 && r.V < r.T - 0.05);
  says('ch9.model.how', '早八点到下午四点之间充电');
}

/* ── ch10 cascade ── */
{
  check('ch10 base load', N.buses.reduce((s, b) => s + (b.load || 0), 0), 1800); says('ch10.p3', '默认负荷（1800 兆瓦）');
  const a = N.run(1, 'genA');
  check('ch10 genA nadir', f(a.minF, 2), '48.80'); check('ch10 genA shed', f(a.st.shed, 0), '90'); says('ch10.p3', '频率最低到 48.80 赫兹，刚好碰到第一级，切掉 90 兆瓦（5%）');
  ok('ch10 N−1 secure at ×1.0', ['genA', 0, 1, 2, 3, 4, 5, 6].every(e => { const r = N.run(1, e); return r.st.lost === 0 && r.linesOut <= 1; }));
  ok('ch10 N−1 secure at ×1.05 (limits)', [0, 1, 2, 3, 4, 5, 6].every(e => N.run(1.05, e).linesOut === 1));
  const b = N.run(1.1, 2);
  check('ch10 ×1.1 load', f(b.total, 0), '1980'); says('ch10.p3', '×1.1（1980 兆瓦）');
  ok('ch10 ×1.1 B–X: B–Y and X–Y trip together at 4 s', b.st.events.filter(e => e.k === 'line' && e.i !== 2).map(e => e.i + '@' + e.t.toFixed(1)).join(',') === '3@4.0,6@4.0');
  check('ch10 ×1.1 B–X shed', f(b.st.shed, 0), '495'); says('ch10.p3', '共 495 兆瓦');
  check('ch10 ×1.1 B–X served', f(b.served, 0), '0'); ok('ch10 ×1.1 A and C trip', !b.st.gen[0].on && !b.st.gen[2].on);
  says('ch10.p3', '1980 兆瓦的用户全部停电');
  const c = N.run(1.2, 'genA'), d = N.run(1.2, 'genA', 40, false);
  check('ch10 ×1.2 genA shed', f(c.st.shed, 0), '216'); check('ch10 ×1.2 genA kept', c.st.lost, 0); says('ch10.p3', '切掉 216 兆瓦');
  check('ch10 ×1.2 genA without UFLS', f(d.served, 0), '0');
  check('ch10 trip delay', N.P.tripAfter, 4); says('ch10.model.how', '持续 4 秒就会跳开'); says('ch10.limit', '线路过载后 4 秒跳开');
  check('ch10 first stage', N.P.uf[0], 48.8); check('ch10 stage size', N.P.shedStep, 0.05); check('ch10 gen trip', N.P.genTrip, 47.5); says('ch10.limit', '47.5 赫兹机组保护');
  ok('ch10 stages every 0.2 Hz', N.P.uf.every((u, i) => i === 0 || Math.abs(N.P.uf[i - 1] - u - 0.2) < 1e-9)); says('ch10.limit', '每降 0.2 赫兹再切 5%'); check('ch10 governor lag', N.P.Tg, 6); says('ch10.limit', '反应时间取 6 秒');
  // every branch is reachable: calm (gen and line), shed, partial, black with and without shedding
  ok('ch10 calm (gen) at ×0.8', (r => r.st.shed === 0 && r.st.lost === 0)(N.run(0.8, 'genA')));
  ok('ch10 calm (line) at ×1.0', (r => r.st.shed === 0 && r.st.lost === 0)(N.run(1, 6)));
  ok('ch10 partial at ×1.1 C–Z', (r => r.st.lost > 0 && r.served > 0)(N.run(1.1, 5)));
  ok('ch10 black0 (no shedding) at ×1.2 genA without UFLS', d.st.shed === 0 && d.served === 0);
}

/* ── the copy has every key the page asks for, and only whole-sentence templates ── */
{
  const keys = new Set([...html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)].map(m => m[1]).concat([...app.matchAll(/\bt\('([\w.]*\w)'/g)].map(m => m[1])));
  for (const p of M.merit.plants) keys.add('plant.' + p.id);
  for (const b of M.net6.buses) keys.add('bus.' + b.id);
  for (const k of keys) ok('copy has ' + k, Z[k] != null);
  ok('no CJK in app.js', !/[一-鿿]/.test(app));
  ok('no CJK in models.js', !/[一-鿿]/.test(fs.readFileSync(path.join(dir, 'models.js'), 'utf8')));
  ok('no CJK in index.html outside title/meta and the 中 toggle', !/[一-鿿]/.test(html.replace(/<title>[^<]*<\/title>/, '').replace(/<meta name="description"[^>]*>/, '').replace('>中<', '><')));
}

console.log(`${n - fails}/${n} checks passed`);
if (fails) process.exit(1);
