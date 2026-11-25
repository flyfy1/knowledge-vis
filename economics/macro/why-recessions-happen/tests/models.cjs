// Pins every model number stated in content.zh.md. Run: node economics/macro/why-recessions-happen/tests/models.cjs
'use strict';
const path = require('path');
const fs = require('fs');
const M = require(path.join(__dirname, '..', 'models.js'));
let fails = 0, n = 0;
function eq(name, got, want, tol) {
  n++;
  const ok = Math.abs(got - want) <= (tol == null ? 0.05 : tol);
  if (!ok) { fails++; console.log('FAIL', name, 'got', got, 'want', want); }
}
const zh = fs.readFileSync(path.join(__dirname, '..', 'content.zh.md'), 'utf8');
function inProse(s) { n++; if (!zh.includes(s)) { fails++; console.log('FAIL prose missing', JSON.stringify(s)); } }

/* ch1 */
let r = M.thrift({ C0: 10, I0: 10, b: 0, c0: 0.8, c1: 0.75 });
eq('ch1 y0', r.y0, 100); eq('ch1 y1', r.y1, 80); eq('ch1 s0', r.s0, 10); eq('ch1 s1', r.s1, 10); eq('ch1 first-period saving', r.S[1], 15);
eq('ch1 path ends near y1', r.Y[24], 80, 0.5);
r = M.thrift({ C0: 10, I0: 5, b: 0.05, c0: 0.8, c1: 0.75 });
eq('ch1 induced y0', r.y0, 100); eq('ch1 induced y1', r.y1, 75); eq('ch1 induced s1', r.s1, 8.75, 0.001);
inProse('收入从 100 一路降到 80'); inProse('储蓄最后只有 8.75');

/* ch2 */
const acc = g2 => M.accelerator({ v: 2, delta: 0.1, g1: 10, g2 }).change;
eq('ch2 g2=5', acc(5), -17.5); eq('ch2 g2=2', acc(2), -34.0); eq('ch2 g2=0', acc(0), -45.0);
inProse('机器订单却少了 17.5%'); inProse('订单少 34%'); inProse('订单少 45%');

/* ch3 */
const R = M.samuelsonRoots(0.8, 1.1);
eq('ch3 modulus', R.mod, 0.94, 0.005); eq('ch3 period', R.period, 13.6, 0.05);
const p = M.samuelsonPath({ c: 0.8, v: 1.1 });
eq('ch3 peak', p.peak, 116.6, 0.05); eq('ch3 new level', p.yNew, 110, 1e-9);
n++; if (M.samuelsonRegion(0.8, 1.1) !== 'damped') { fails++; console.log('FAIL ch3 default region'); }
// regions: stability iff cv < 1; complex iff c < 4v/(1+v)^2
for (const [c, v, want] of [[0.8, 0.2, 'mono'], [0.8, 1.5, 'explosive'], [0.9, 3, 'runaway'], [0.5, 1, 'damped']]) {
  n++; if (M.samuelsonRegion(c, v) !== want) { fails++; console.log('FAIL region', c, v); }
}
inProse('根的模约 0.94'); inProse('约 13.6 个季度'); inProse('先冲到 116.6');

/* ch4 */
const bw = w => M.bullwhip({ L: 2, T: 4, cover: 2, alpha: 0.2, drop: 10, w });
const b0 = bw(0), b1 = bw(1);
eq('ch4 retailer', b0.dropPct[1], 15.2); eq('ch4 wholesaler', b0.dropPct[2], 22.4); eq('ch4 factory', b0.dropPct[3], 32.5);
eq('ch4 pipeline factory', b1.dropPct[3], 26.5);
n++; if (!(b0.highs[3] > 90)) { fails++; console.log('FAIL ch4 overshoot above new demand'); }
inProse('零售商订单最多降 15.2%'); inProse('批发商 22.4%'); inProse('工厂产量 32.5%'); inProse('缩小到 26.5%');

/* ch6 */
const dl = o => M.deleverage(Object.assign({ c: 0.8, C0: 5, I: 7.5, G0: 7.5, D0: 80, m: 0.8, priceDrop: 20, phi: 0.25, gamma: 0, n: 80 }, o));
let d = dl({});
eq('ch6 excess', d.excess, 16, 1e-9); eq('ch6 trough', d.trough, 92.5, 0.05); eq('ch6 cum exact', d.cumLossExact, 80, 1e-9);
eq('ch6 cum simulated', d.cumLoss, 80, 0.1);
eq('ch6 phi=1 trough', dl({ phi: 1 }).trough, 84.0); eq('ch6 phi=1 cum', dl({ phi: 1 }).cumLoss, 80, 0.1);
eq('ch6 gamma=0.5 cum', dl({ gamma: 0.5 }).cumLossExact, 40, 1e-9);
inProse('最低跌到 92.5'); inProse('最低跌到 84.0'); inProse('一个季度产出的 80%'); inProse('为 40%');

/* ch7 */
const sb = o => M.stabiliser(Object.assign({ c: 0.8, v: 0.5, shock: 2, dur: 8, n: 40, tau: 0, k: 0, lag: 1 }, o));
const s0 = sb({});
eq('ch7 base depth', s0.depth, 10.1, 0.05); eq('ch7 base rms', s0.rms, 3.89, 0.005); eq('ch7 mult', s0.mult, 5, 1e-9);
const s4 = sb({ tau: 0.4 });
eq('ch7 tau mult', s4.mult, 1.92, 0.005); eq('ch7 tau depth', s4.depth, 4.05, 0.005);
const k1 = sb({ k: 0.2, lag: 1 }), k8 = sb({ k: 0.2, lag: 8 });
eq('ch7 lag1 depth', k1.depth, 6.66, 0.005); eq('ch7 lag1 rms', k1.rms, 2.39, 0.005);
eq('ch7 lag8 depth', k8.depth, 10.1, 0.05); eq('ch7 lag8 over', k8.over, 9.36, 0.005); eq('ch7 lag8 rms', k8.rms, 6.48, 0.005);
inProse('最多降 10.1%'); inProse('乘数降到 1.92'); inProse('最深只降 4.05%'); inProse('最深降 6.66%'); inProse('从 3.89 降到 2.39');
inProse('冲过头 9.36%'); inProse('波动升到 6.48');

/* ch8 */
const sr = M.sahmRates(), c8 = M.classifier(sr.p, sr.h, sr.f);
eq('ch8 base rate', sr.p * 100, 13.6, 0.05); eq('ch8 false alarm', sr.f * 100, 3.5, 0.05); eq('ch8 ppv', c8.ppv * 100, 82, 0.5);
eq('ch8 lead ppv', M.classifier(sr.p, 0.8, 0.15).ppv * 100, 46, 0.5);
inProse('约 13.6%'); inProse('约 3.5%'); inProse('约 82%'); inProse('约 46%');

/* ch9 facts */
const F = M.FACTS;
const avg = a => a.reduce((x, y) => x + y, 0) / a.length;
eq('NBER avg contraction 1945–2020 (12 cycles)', avg(F.nber.slice(1).map(r => r[2])), 10.3, 0.05);
eq('NBER avg expansion 1945–2020 (12 cycles)', avg(F.nberExpansionBefore.slice(1)), 64.2, 0.05);
eq('2020 contraction months', F.nber[F.nber.length - 1][2], 2, 0);
inProse('平均 10.3 个月'); inProse('扩张平均 64.2 个月'); inProse('概率为 11.5%'); inProse('为 17.4%');

/* models.js has no CJK (copy lives in content) */
n++; if (/[一-鿿]/.test(fs.readFileSync(path.join(__dirname, '..', 'models.js'), 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, ''))) { fails++; console.log('FAIL CJK in models.js code'); }

console.log(fails ? `${fails} of ${n} checks FAILED` : `all ${n} checks passed`);
process.exit(fails ? 1 : 0);
