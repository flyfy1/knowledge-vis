'use strict';
// Pins every number the essay's prose states to the page's own models, and checks that the prose
// (copy.zh.js) still says exactly that number. Run: node tech/semiconductors/why-chips-are-hard/tests/models.cjs
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
const g = x => Math.round(x).toLocaleString('en-US');
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const sci = (x, d) => { const e = Math.floor(Math.log10(x)); return (x / 10 ** e).toFixed(d) + '×10' + String(e).split('').map(c => SUP[c]).join(''); };

/* ── ch1 carriers ── */
{
  const C = M.carriers, ni = C.ni(300);
  check('ch1 ni(300)', sci(ni, 1), '9.8×10⁹'); says('ch1.p3', '本征浓度 9.8×10⁹ 每立方厘米');
  check('ch1 ni in literature range', ni >= 9.65e9 && ni <= 1.0e10, true); says('ch1.p3', '9.65×10⁹ 到 1.0×10¹⁰');
  const r0 = C.resistivity(300, 0, 'n'), r16 = C.resistivity(300, 1e16, 'n');
  check('ch1 intrinsic resistivity', sci(r0, 1), '3.5×10⁵'); says('ch1.p3', '电阻率约 3.5×10⁵ Ω·cm');
  check('ch1 1e16 P resistivity', f(r16, 2), '0.56'); says('ch1.p3', '电阻率降到 0.56 Ω·cm');
  check('ch1 ratio ~60 万', Math.round(r0 / r16 / 1e5), 6); says('ch1.p3', '差了约 60 万倍');
  check('ch1 atoms per dopant', f(C.atomsPerDopant(1e16) / 1e6, 0), '5'); says('ch1.p3', '每 500 万个硅原子换掉一个');
  const Ti = C.intrinsicT(1e16);
  check('ch1 intrinsic temperature', f(Ti, 0), '649'); says('ch1.p4', '649 K 左右');
  check('ch1 intrinsic temperature °C', f(Ti - 273.15, 0), '376'); says('ch1.p4', '约 376 °C');
  const dbl = M.bisect(T => C.ni(T) - 2 * ni, 300, 330) - 300;
  check('ch1 ni doubles every ~9 K', Math.round(dbl), 9); says('ch1.p4', '每升高约 9 K，本征浓度就翻一倍');
  check('ch1 Eg(300)', f(C.Eg(300), 2), '1.12'); says('ch1.p1', '1.12 电子伏特');
  check('ch1 kT at 300 K', f(M.vth(300), 3), '0.026'); says('ch1.p2', 'kT 只有 0.026 电子伏特');
  check('ch1 half gap in kT', f(C.Eg(300) / 2 / M.vth(300), 0), '22'); says('ch1.p2', '约 22 个 kT');
}

/* ── ch2 pn junction ── */
{
  const J = M.junction;
  check('ch2 Vbi', f(J.vbi(1e17, 1e16), 3), '0.775'); says('ch2.p3', '内建电势是 0.775 V');
  check('ch2 W at 0 V', f(J.width(1e17, 1e16, 0).W * 1e7, 0), '332'); says('ch2.p3', '耗尽区宽 332 纳米');
  check('ch2 W at −2 V', f(J.width(1e17, 1e16, -2).W * 1e7, 0), '628'); says('ch2.p3', '拉宽到 628 纳米');
  check('ch2 per decade 300 K', f(J.perDecade(300) * 1000, 1), '59.5'); says('ch2.p3', '59.5 毫伏');
  check('ch2 per decade 350 K', f(J.perDecade(350) * 1000, 1), '69.4'); says('ch2.p3', '350 K 时变成 69.4 毫伏');
  // the stepped I–V curve gains a decade per 59.5 mV in forward bias
  const r = J.current(1e17, 1e16, 0.6 + J.perDecade(300)) / J.current(1e17, 1e16, 0.6);
  check('ch2 decade per 59.5 mV', f(r, 3), '10.000');
}

/* ── ch3 MOSFET ── */
{
  const F = M.mosfet, p = { vt: 0.3, n: 1.2, T: 300 };
  check('ch3 swing n=1.2', f(F.swing(p), 0), '71'); says('ch3.p3', '摆幅 71 mV/十倍');
  check('ch3 swing n=1', f(F.swing({ ...p, n: 1 }), 1), '59.5'); says('ch3.p2', '59.5 毫伏');
  check('ch3 Ioff', f(F.ioff(p) * 1e9, 1), '1.0'); says('ch3.p3', '关态电流约 1.0 nA/µm');
  check('ch3 Ion', f(F.ion(p, 0.75) * 1e6, 0), '844'); says('ch3.p3', '开态 844 µA/µm');
  check('ch3 ratio', sci(F.ratio(p, 0.75), 1), '8.4×10⁵'); says('ch3.p3', '开关比 8.4×10⁵');
  check('ch3 Ion at 0.45 V', f(F.ion(p, 0.45) * 1e6, 0), '100'); says('ch3.p3', '开态电流掉到 100 µA/µm');
  check('ch3 slower 8×+', Math.floor(F.ion(p, 0.75) / F.ion(p, 0.45)), 8); says('ch3.p3', '慢了 8 倍多');
  check('ch3 Vt 0.3→0.2 leak', f(F.ioff({ ...p, vt: 0.2 }) / F.ioff(p), 0), '24'); says('ch3.p3', '关态漏电就大 24 倍');
  check('ch3 Vt for 1 nA, n=1.2', f(F.vtForIoff(p, 1e-9), 2), '0.30'); says('ch3.p4', '不能低于约 0.30 V');
  check('ch3 Vt for 1 nA, n=1', f(F.vtForIoff({ ...p, n: 1 }, 1e-9), 2), '0.25'); says('ch3.p4', '也不能低于约 0.25 V');
  check('ch3 350 K leak', f(F.ioff({ ...p, T: 350 }) / F.ioff(p), 1), '5.4'); says('ch3.p4', '漏电变成 5.4 倍');
}

/* ── ch4 Dennard ── */
{
  const D = M.dennard;
  check('ch4 κ per generation', f(D.kappa(1), 2), '1.41'); check('ch4 scale per generation', f(1 / D.kappa(1), 2), '0.71'); says('ch4.model.how', '每一代所有尺寸乘 0.71');
  check('ch4 first three generations flat', D.rel(3, 'dennard', true).tot < 1.05, true); says('ch4.p3', '前三代功率密度纹丝不动');
  const g5 = D.rel(5, 'dennard', true);
  check('ch4 gen 5 length', f(g5.L, 0), '177'); says('ch4.p3', '第 5 代（约 180 纳米）');
  check('ch4 gen 5 leak share', f(g5.leakShare * 100, 0), '63'); says('ch4.p3', '漏电占了总功耗的 63%');
  check('ch4 gen 5 total', f(g5.tot, 1), '2.7'); says('ch4.p3', '功率密度变成 2.7 倍');
  check('ch4 gen 6 total', f(D.rel(6, 'dennard', true).tot, 1), '10.9'); says('ch4.p3', '第 6 代变成 10.9 倍');
  check('ch4 fixed gen 8', f(D.rel(8, 'fixed', true).tot, 0), '256'); says('ch4.p3', '第 8 代是 256 倍');
  check('ch4 real gen 8', f(D.rel(8, 'real', true).tot, 1), '10.7'); says('ch4.p4', '第 8 代功率密度是 10.7 倍');
  check('ch4 data max before 2000', D.freqMax(0, 2000) < 540, true); says('ch4.p4', '还不到 540 MHz');
  check('ch4 data max 2000–2005', f(D.freqMax(2000, 2005) / 1000, 2), '3.65'); says('ch4.p4', '冲到 3.65 GHz');
  check('ch4 data max after 2005', f(D.freqMax(2005, 2100) / 1000, 1), '4.7'); says('ch4.p4', '最高也只有 4.7 GHz');
  check('ch4 data last year', Math.max(...D.FREQ.map(x => Math.floor(x[0]))), 2021); says('ch4.p4', '此后到 2021 年');
  says('ch4.limit', '1 微米、5 V、阈值 0.75 V、25 MHz');
  check('ch4 G0', [D.G0.L, D.G0.V, D.G0.vt, D.G0.f].join(','), '1000,5,0.75,25000000');
}

/* ── ch5 lithography ── */
{
  const L = M.litho, T = L.TOOLS;
  const arfi = L.printLimit(T.arfi.lam, T.arfi.na, 'dipole');
  check('ch5 ArFi dipole hp', f(arfi / 2, 1), '38.0'); says('ch5.p3', '半周期 38.0 纳米');
  check('ch5 ArFi dipole k1', f(L.k1(arfi / 2, T.arfi.lam, T.arfi.na), 3), '0.266'); says('ch5.p3', 'k₁ = 0.266');
  check('ch5 ArFi vs ASML spec', Math.round(arfi / 2) <= T.arfi.spec, true); says('ch5.p3', '“≤ 38 nm”');
  check('ch5 ArFi conventional hp', f(L.printLimit(T.arfi.lam, T.arfi.na, 'conv') / 2, 0), '50'); says('ch5.p3', '正入射照明只能到半周期约 50 纳米');
  check('ch5 floor', f(L.minPitch(T.arfi.lam, T.arfi.na) / 2, 1), '35.7'); says('ch5.p3', '35.7 纳米');
  check('ch5 ArFi single pitch', f(arfi, 0), '76'); says('ch5.p4', '单次只能印 76 纳米的周期');
  check('ch5 split 2 fails', L.printable(T.arfi.lam, T.arfi.na, L.exposurePitch(24, 2), 'dipole'), false); says('ch5.p4', '拆成两次是每次 48 纳米，仍然不够');
  check('ch5 split 4 prints', L.printable(T.arfi.lam, T.arfi.na, L.exposurePitch(24, 4), 'dipole'), true); says('ch5.p4', '拆成四次，每次 96 纳米');
  check('ch5 EUV single pitch', f(L.printLimit(T.euv.lam, T.euv.na, 'dipole'), 1), '21.7'); says('ch5.p4', '21.7 纳米左右的周期');
  check('ch5 high-NA hp', f(L.printLimit(T.hna.lam, T.hna.na, 'dipole') / 2, 1), '6.5'); says('ch5.p4', '半周期 6.5 纳米');
  check('ch5 DOF ratio', f(L.dofRatio(0.33, 0.55) * 100, 0), '36'); says('ch5.p4', '只剩原来的 36%');
  check('ch5 threshold', L.CMIN, 0.3); says('ch5.limit', '对比度 0.3 的门槛');
}

/* ── ch6 EUV light budget ── */
{
  const E = M.euv;
  check('ch6 EUV photon', f(E.photonEV(13.5), 1), '91.8'); says('ch6.p1', '91.8 电子伏特');
  check('ch6 ArF photon', f(E.photonEV(193), 2), '6.42'); says('ch6.p1', '6.42 电子伏特');
  check('ch6 photon ratio', f(E.photonEV(13.5) / E.photonEV(193), 1), '14.3'); says('ch6.p1', '14.3 倍');
  check('ch6 transmission', f(E.transmission(0.7, 11) * 100, 1), '2.0'); says('ch6.p3', '<strong>2.0%</strong>');
  check('ch6 watts at wafer', f(250 * E.transmission(0.7, 11), 1), '4.9'); says('ch6.p3', '只剩约 4.9 瓦');
  check('ch6 seconds per wafer', f(E.secondsPerWafer(250, 0.7, 11, 20), 1), '2.9'); says('ch6.p3', '每片要 2.9 秒');
  check('ch6 wph bound', g(E.wphBound(250, 0.7, 11, 20)), '1,259'); says('ch6.p3', '每小时上限约 1,259 片');
  check('ch6 photons 13 nm at 30 mJ', g(E.photons(30, 13, 13.5)), '3,446'); says('ch6.p4', '约 3,446 个 EUV 光子');
  check('ch6 noise', f(E.shotNoise(30, 13, 13.5) * 100, 1), '1.7'); says('ch6.p4', '泊松涨落约 1.7%');
  check('ch6 ArF photons 38 nm', Math.round(E.photons(30, 38, 193) / 1e4), 42); says('ch6.p4', '约 42 万个光子');
  says('ch6.p3', '11 次反射、每面 70%、250 瓦、20 mJ/cm²');
}

/* ── ch7 cell density ── */
{
  const C = M.cells, N = C.NODES;
  check('ch7 Intel 10', f(C.density(N.intel10), 1), '90.8'); says('ch7.p3', '与非门密度 90.8 MTr/mm²');
  check('ch7 Intel 10 vs published', Math.abs(C.density(N.intel10) - 90.78) < 0.1, true); says('ch7.p3', 'Intel 公布的与非门数字是 90.78');
  check('ch7 Intel 10 tracks', f(N.intel10.tracks, 2), '7.56'); says('ch7.p3', '7.56 条轨道');
  check('ch7 Intel 10 CPP/name', f(N.intel10.cpp / N.intel10.name, 1), '5.4'); says('ch7.p3', '名字的 5.4 倍');
  check('ch7 G48M24', f(C.density(N.g48m24), 1), '192.9'); says('ch7.p3', '192.9 MTr/mm²');
  check('ch7 G48M24 CPP/name', f(N.g48m24.cpp / N.g48m24.name, 0), '16'); says('ch7.p3', '名字的 16 倍');
  check('ch7 G48M24 side', f(C.sideNm(N.g48m24), 0), '72'); says('ch7.p3', '边长约 72 纳米');
  check('ch7 G40M16T2', f(C.density(N.g40m16t2), 0), '833'); says('ch7.p4', '833 MTr/mm²');
  check('ch7 pitch ladder', [N.intel10, N.g48m24, N.g45m20, N.g42m16].map(x => x.cpp).join(','), '54,48,45,42'); says('ch7.p4', '从 54 缩到 48、45、42 纳米');
  check('ch7 IRDS tracks', [N.g48m24, N.g45m20, N.g42m16, N.g40m16t2].map(x => x.tracks).join(','), '6,6,5,5'); says('ch7.limit', '（6、6、5、5）');
}

/* ── ch8 natural length ── */
{
  const E = M.electro;
  const pl = E.device('planar', 20, 10, 1.0);
  check('ch8 planar swing', f(pl.swing, 0), '135'); says('ch8.p3', '摆幅是 135 mV/十倍');
  check('ch8 planar DIBL', f(pl.dibl, 0), '213'); says('ch8.p3', 'DIBL 213 mV/V');
  check('ch8 planar leak ~690', Math.round(E.leakFactor(pl, 0.3, 0.75) / 10) * 10, 690); says('ch8.p3', '约 690 倍');
  check('ch8 planar λ', f(pl.lam, 1), '5.5'); says('ch8.p3', 'λ 从 5.5 纳米');
  const fin = E.device('finfet', 16, 6, 0.9);
  check('ch8 fin λ', f(fin.lam, 1), '2.3'); says('ch8.p3', '降到 2.3 纳米');
  check('ch8 fin swing', f(fin.swing, 0), '64'); says('ch8.p3', '摆幅 64 mV/十倍');
  check('ch8 fin DIBL', f(fin.dibl, 0), '34'); says('ch8.p3', 'DIBL 34 mV/V');
  check('ch8 GAA swing', f(E.device('gaa', 12, 5, 0.9).swing, 0), '65'); says('ch8.p3', '12 纳米沟道时还有 65 mV/十倍');
  // the law: control holds when L is five to six natural lengths
  check('ch8 fin L/λ', f(fin.ratio, 1), '6.9');
}

/* ── ch9 wires ── */
{
  const W = M.wires;
  check('ch9 Cu at 24 nm', f(W.rPerUm('cu', 24, 2), 0), '845'); says('ch9.p3', '铜线每微米电阻约 845 Ω');
  check('ch9 Ru at 24 nm', Math.round(W.rPerUm('ru', 24, 2)), 466); says('ch9.p3', '钌约 466 Ω');
  check('ch9 Cu delay 100 µm', f(W.delayPs('cu', 24, 100, 2), 0), '643'); says('ch9.p3', '延迟约 643 皮秒');
  check('ch9 longer than a 4 GHz cycle', W.delayPs('cu', 24, 100, 2) > 250, true);
  check('ch9 crossover barrier 2', f(W.crossover(2), 0), '40'); says('ch9.p4', '间距约 40 纳米以下');
  check('ch9 crossover barrier 0', f(W.crossover(0), 0), '11'); says('ch9.p4', '交叉点退到约 11 纳米');
  check('ch9 Cu mfp', M.wires.METALS.cu.mfp, 39.9); says('ch9.limit', '自由程 39.9 纳米');
  check('ch9 Ru mfp', M.wires.METALS.ru.mfp, 6.6); says('ch9.p2', '约 6.6 纳米');
  check('ch9 Ru/Cu bulk > 4', Math.floor(M.wires.METALS.ru.rho0 / M.wires.METALS.cu.rho0), 4); says('ch9.p2', '铜的 4 倍多');
}

/* ── ch10 yield and cost ── */
{
  const F = M.fab, P5 = F.WAFER_PRICE.n5;
  check('ch10 n5 price', g(P5), '16,988'); says('ch10.p3', '16,988 美元一片');
  check('ch10 gross 600', f(F.gross(600), 1), '90.6'); says('ch10.p3', '一片放 90.6 颗');
  check('ch10 Poisson 600 @0.1', f(F.poisson(600, 0.1) * 100, 1), '54.9'); says('ch10.p3', '泊松良率 54.9%');
  check('ch10 cost 600 @0.1', g(F.costPerGood(600, 0.1, 'poisson', P5)), '342'); says('ch10.p3', '每颗好芯片约 342 美元');
  check('ch10 Poisson 600 @0.2', f(F.poisson(600, 0.2) * 100, 1), '30.1'); says('ch10.p3', '良率 30.1%');
  check('ch10 cost 600 @0.2', g(F.costPerGood(600, 0.2, 'poisson', P5)), '623'); says('ch10.p3', '成本涨到 623 美元');
  check('ch10 Poisson 100 @0.2', f(F.poisson(100, 0.2) * 100, 1), '81.9'); says('ch10.p3', '良率是 81.9%');
  check('ch10 reticle', F.RETICLE, 26 * 33); says('ch10.p3', '858 mm²');
  const one = F.system(800, 0.2, 'poisson', P5, 1), four = F.system(800, 0.2, 'poisson', P5, 4);
  check('ch10 piece', f(four.piece, 0), '220'); says('ch10.p4', '4 块 220 mm²');
  check('ch10 800 monolithic', g(one.cost), '1,299'); says('ch10.p4', '约 1,299 美元');
  check('ch10 800 four chiplets', g(four.cost), '397'); says('ch10.p4', '约 397 美元');
  check('ch10 overhead', F.OVERHEAD, 0.1); says('ch10.p4', '10% 的互连开销'); says('ch10.limit', '10% 面积开销');
  check('ch10 bond', F.BOND, 0.99); says('ch10.limit', '每次键合 99% 的成功率');
  // the wafer-map Monte Carlo agrees with Poisson
  const dies = F.layout(100), sc = F.scatter(dies, 0.2, 7), mc = 1 - sc.dead.filter(x => x).length / dies.length;
  check('ch10 Monte Carlo near Poisson', Math.abs(mc - F.poisson(100, 0.2)) < 0.03, true);
}

/* ── ch11 frontier data block ── */
{
  const kinds = new Set(M.FRONTIER.map(x => x.kind));
  check('ch11 three kinds', [...kinds].sort().join(','), 'claim,demo,prod');
  for (const x of M.FRONTIER) {
    check('ch11 ' + x.id + ' has copy', typeof Z['fr.' + x.id], 'string');
    check('ch11 ' + x.id + ' dated', /^\d{4}(-\d{2})?$/.test(x.asOf), true);
    check('ch11 ' + x.id + ' sourced', /^https:\/\//.test(x.url) && !!x.src, true);
  }
}

console.log(fails ? `${fails} of ${n} checks FAILED` : `PASS: ${n} model and prose checks`);
process.exit(fails ? 1 : 0);
