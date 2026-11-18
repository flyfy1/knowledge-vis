'use strict';
// Pins every number the essay's prose states to the page's own models, and checks that the prose
// (copy.zh.js) still says exactly that number. Run: node tech/semiconductors/why-chips-are-hard/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const M = require(path.join(__dirname, '..', 'models.js'));
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'copy.en.js'), 'utf8'), ctx);
const E_ = ctx.window.ESSAY_COPY.en;

let n = 0, fails = 0;
function check(name, got, want) {
  n++;
  if (got !== want) { fails++; console.error(`FAIL ${name}: model gives ${got}, expected ${want}`); }
}
function saysEn(key, phrase) {
  n++;
  if (!E_[key] || !E_[key].includes(phrase)) { fails++; console.error(`FAIL English prose ${key} should contain "${phrase}"`); }
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
  check('ch1 ni(300)', sci(ni, 1), '9.9×10⁹'); says('ch1.p3', '本征浓度 9.9×10⁹ 每立方厘米'); saysEn('ch1.p3', 'intrinsic density of 9.9×10⁹');
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
  // the limits paragraph: the page's Nc, Nv pair (Sze & Lee, 3rd ed.), how far the formula lands from that book's tabulated
  // ni (9.65e9), and what the Ioffe database's pair (3.2e19, 1.8e19) gives in the same formula
  check('ch1 Nc Nv', [C.NC300, C.NV300].map(v => sci(v, 2)).join(','), '2.86×10¹⁹,2.66×10¹⁹'); says('ch1.limit', '2.86×10¹⁹ 和 2.66×10¹⁹'); saysEn('ch1.limit', '2.86×10¹⁹ and 2.66×10¹⁹');
  says('ch1.limit', '列的本征浓度是 9.65×10⁹，本页的公式算出来是 9.9×10⁹，高约 2%'); saysEn('ch1.limit', '9.65×10⁹; the formula on this page gives 9.9×10⁹, about 2% higher');
  check('ch1 ni above the tabulated 9.65e9 by about 2%', Math.round((ni / 9.65e9 - 1) * 100), 2);
  check('ch1 ni with the Ioffe pair', sci(Math.sqrt(3.2e19 * 1.8e19) * Math.exp(-C.Eg(300) / (2 * M.K_B * 300)), 1), '8.6×10⁹'); says('ch1.limit', '3.2×10¹⁹ 和 1.8×10¹⁹，代进同一个公式得到 8.6×10⁹');
  // Caughey–Thomas (1967) parameters: μmin, μmax, Nref, α
  check('ch1 CT electrons', [C.muN(1e30).toFixed(1), C.muN(0).toFixed(0), C.muN(8.5e16).toFixed(1)].join(','), '65.0,1330,697.5');
  check('ch1 CT holes', [C.muP(1e30).toFixed(1), C.muP(0).toFixed(0), C.muP(6.3e16).toFixed(2)].join(','), '47.7,495,271.35');
  for (const k of ['intrinsic', 'extrinsic.n', 'extrinsic.p', 'near', 'hot']) check('ch1 sentence ' + k, typeof Z['ch1.say.' + k], 'string');
}

/* ── ch2 pn junction ── */
{
  const J = M.junction;
  check('ch2 Vbi', f(J.vbi(1e17, 1e16), 3), '0.774'); says('ch2.p3', '内建电势是 0.774 V'); saysEn('ch2.p3', 'built-in potential is 0.774 V');
  check('ch2 W at 0 V', f(J.width(1e17, 1e16, 0).W * 1e7, 0), '332'); says('ch2.p3', '不加电压时耗尽区宽 332 纳米'); saysEn('ch2.p3', 'depletion width at zero bias is 332 nm');
  check('ch2 W at −2 V', f(J.width(1e17, 1e16, -2).W * 1e7, 0), '628'); says('ch2.p3', '拉宽到 628 纳米');
  check('ch2 per decade 300 K', f(J.perDecade(300) * 1000, 1), '59.5'); says('ch2.p3', '59.5 毫伏');
  check('ch2 per decade 350 K', f(J.perDecade(350) * 1000, 1), '69.4'); says('ch2.p3', '350 K 时变成 69.4 毫伏');
  // the stepped I–V curve gains a decade per 59.5 mV in forward bias
  const r = J.current(1e17, 1e16, 0.6 + J.perDecade(300)) / J.current(1e17, 1e16, 0.6);
  check('ch2 decade per 59.5 mV', f(r, 3), '10.000');
  // the diagram draws the two sides of the depletion region in this ratio and labels them
  const w0 = J.width(1e17, 1e16, 0);
  check('ch2 diagram xp', f(w0.xp * 1e7, 0), '30'); check('ch2 diagram xn', f(w0.xn * 1e7, 0), '302'); says('dg.junction.aria', 'p 侧宽约 30 纳米，n 侧宽约 302 纳米');
  check('ch2 xp + xn = W', f((w0.xp + w0.xn) * 1e7, 0), '332'); check('ch2 charge balance', f(w0.xp * 1e17 / (w0.xn * 1e16), 6), '1.000000');
  for (const k of ['fwd', 'flat', 'zero', 'rev']) check('ch2 sentence ' + k, typeof Z['ch2.say.' + k], 'string');
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
  check('ch3 Ion falls to under an eighth', F.ion(p, 0.75) / F.ion(p, 0.45) > 8, true); says('ch3.p3', '不到原来的八分之一');
  // gate delay ∝ C·V/I: the ratio of V/Ion at the two supplies
  check('ch3 delay ratio', f((0.45 / F.ion(p, 0.45)) / (0.75 / F.ion(p, 0.75)), 0), '5'); says('ch3.p3', '慢到原来的约 5 倍');
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
  const r8 = D.rel(8, 'real', false).tot; check('ch4 real gen 8 without frequency scaling stays near 1', r8 > 0.9 && r8 < 1.2, true); says('ch4.p4', '大致守在原来的水平');
  check('ch4 diagram ratio', f(1 / D.kappa(1), 2), '0.71'); says('dg.scaling.cap', '1/κ ≈ 0.71'); says('dg.scaling.aria', '约 0.71 倍');
  // every live sentence: each state maps to a key that exists, uses only the variables the page supplies, and all eight are reached
  const seen = new Set(), vars = ['g', 'L', 'x', 'V', 'vt', 'share'];
  for (const mode of ['dennard', 'fixed', 'real']) for (const fs of [true, false]) for (let gen = 0; gen <= 10; gen++) {
    const k = D.sayKey(gen, mode, fs), str = Z['ch4.say.' + k]; seen.add(k);
    check(`ch4 sentence ${mode}/${fs}/${gen}`, typeof str === 'string' && (str.match(/\{(\w+)\}/g) || []).every(v => vars.includes(v.slice(1, -1))), true);
    const r = D.rel(gen, mode, fs);
    if (k === 'flat') check(`ch4 flat is flat ${mode}/${gen}`, r.tot < 1.2 && r.tot > 0.95, true);
    if (k === 'leak') check(`ch4 leak is leaky ${mode}/${gen}`, r.leakShare > 0.2, true);
    if (k === 'hot' || k === 'stall' || k === 'fixedcool') check(`ch4 ${k} rises ${mode}/${gen}`, r.tot > 1.15, true);
    if (k === 'realleak') check(`ch4 realleak ${gen}`, r.leakShare > 0.5, true);
  }
  check('ch4 all sentences reached', [...seen].sort().join(','), 'cool,fixedcool,flat,hot,leak,realleak,stall,start');
  check('ch4 G0', [D.G0.L, D.G0.V, D.G0.vt, D.G0.f].join(','), '1000,5,0.75,25000000');
}

/* ── ch5 lithography ── */
{
  const L = M.litho, T = L.TOOLS;
  const arfi = L.printLimit(T.arfi.lam, T.arfi.na, 'dipole');
  check('ch5 ArFi dipole hp', f(arfi / 2, 1), '37.9'); says('ch5.p3', '半周期 37.9 纳米');
  check('ch5 ArFi dipole k1', f(L.k1(arfi / 2, T.arfi.lam, T.arfi.na), 3), '0.265'); says('ch5.p3', 'k₁ = 0.265');
  check('ch5 ArFi vs ASML spec', Math.round(arfi / 2) <= T.arfi.spec, true); says('ch5.p3', '“≤ 38 nm”');
  check('ch5 ArFi conventional hp', f(L.printLimit(T.arfi.lam, T.arfi.na, 'conv') / 2, 0), '50'); says('ch5.p3', '常规照明（圆盘光源，σ ≤ 0.6）只能到半周期约 50 纳米'); saysEn('ch5.p3', 'Conventional illumination (a disc source, σ ≤ 0.6) reaches only a half-pitch of about 50 nm');
  // the source extents the page states are the ones the model integrates over
  check('ch5 source extents', [L.SIGMA.conv, ...L.SIGMA.dipole].join(','), '0.6,0.7,0.95'); says('ch5.limit', '常规照明 σ ≤ 0.6，双极 σ 0.7 到 0.95'); saysEn('ch5.limit', 'conventional σ ≤ 0.6, dipole σ 0.7 to 0.95');
  { const sc = L.source('conv'), sd = L.source('dipole').map(Math.abs); check('ch5 sources span their stated extents', [Math.max(...sc.map(Math.abs)) <= 0.6, Math.min(...sd) >= 0.7, Math.max(...sd) <= 0.95, Math.max(...sc.map(Math.abs)) > 0.59, Math.min(...sd) < 0.71, Math.max(...sd) > 0.94].join(','), 'true,true,true,true,true,true'); }
  check('ch5 floor', f(L.minPitch(T.arfi.lam, T.arfi.na) / 2, 1), '35.7'); says('ch5.p3', '35.7 纳米');
  check('ch5 ArFi single pitch', f(arfi, 0), '76'); says('ch5.p4', '单次只能印 76 纳米的周期');
  check('ch5 split 2 fails', L.printable(T.arfi.lam, T.arfi.na, L.exposurePitch(24, 2), 'dipole'), false); says('ch5.p4', '拆成两次是每次 48 纳米，仍然不够');
  check('ch5 split 4 prints', L.printable(T.arfi.lam, T.arfi.na, L.exposurePitch(24, 4), 'dipole'), true); says('ch5.p4', '拆成四次，每次 96 纳米');
  check('ch5 EUV single pitch', f(L.printLimit(T.euv.lam, T.euv.na, 'dipole'), 1), '21.7'); says('ch5.p4', '21.7 纳米左右的周期');
  check('ch5 high-NA hp', f(L.printLimit(T.hna.lam, T.hna.na, 'dipole') / 2, 1), '6.5'); says('ch5.p4', '半周期 6.5 纳米');
  check('ch5 DOF ratio', f(L.dofRatio(0.33, 0.55) * 100, 0), '36'); says('ch5.p4', '只剩原来的 36%');
  check('ch5 threshold', L.CMIN, 0.3); says('ch5.limit', '对比度 0.3 的门槛');
  // the limit does not depend on how finely the source is sampled: the same pole integrated with five times the points
  {
    const fine = [], n = 5 * L.NSRC; for (let i = 0; i < n; i++) { const sg = 0.7 + 0.25 * (i + 0.5) / n; fine.push(sg, -sg); }
    const con = pch => { // independent of litho.intensity: two- and three-beam contrast summed over the fine source
      let lo = 0, hi = 0;
      for (const [x, acc] of [[0, v => { hi += v; }], [pch / 2, v => { lo += v; }]]) for (const sg of fine) { let re = 0, im = 0; for (const m of L.orders(193, 1.35, pch, sg * 1.35)) { const a = L.coeff(m), ph = 2 * Math.PI * m * x / pch; re += a * Math.cos(ph); im += a * Math.sin(ph); } acc(re * re + im * im); }
      return (hi - lo) / (hi + lo);
    };
    check('ch5 limit converged in source sampling', Math.abs(M.bisect(pch => con(pch) - L.CMIN, 72, 80, 40) - arfi) < 0.1, true);
  }
  check('ch5 image is an average of intensities between 0 and 1', L.intensity(0, 193, 1.35, 400, 'dipole') > 0 && L.intensity(0, 193, 1.35, 400, 'dipole') <= 1.2, true);
  // an open mask (no pattern: only the zero order, amplitude 1/2 for a 50 % grating) images to a uniform 0.25
  check('ch5 zero order only is uniform', f(L.contrast(193, 1.35, 30, 'dipole'), 6), '0.000000'); check('ch5 zero-order level', f(L.intensity(7, 193, 1.35, 30, 'dipole'), 4), '0.2500');
  for (const k of ['ok', 'weak', 'dark']) check('ch5 sentence ' + k, typeof Z['ch5.say.' + k], 'string');
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
  // the diagram's reflection count and percentages, and the model's defaults, are the same numbers
  check('ch6 path count', E.pathCount(), 11); check('ch6 defaults', [E.DEFAULTS.R, E.DEFAULTS.P, E.DEFAULTS.dose].join(','), '0.7,250,20');
  check('ch6 path split', [E.PATH.collector, E.PATH.illum, E.PATH.mask, E.PATH.proj].join(','), '1,3,1,6'); says('ch6.limit', '收集镜 1 面、照明系统 3 面、掩模 1 次、投影物镜 6 面');
  says('dg.euvpath.cap', '默认值 11'); says('dg.euvpath.cap', '每面反射 70%'); says('dg.euvpath.aria', '三面镜'); says('dg.euvpath.aria', '六面镜'); says('dg.euvpath.aria', '十一次反射');
  check('ch6 diagram percentages', [1, 4, 5].map(i => f(Math.pow(E.DEFAULTS.R, i) * 100, 0)).join(',') + ',' + f(Math.pow(E.DEFAULTS.R, 11) * 100, 1), '70,24,17,2.0'); says('dg.euvpath.aria', '最后只剩约 2%');
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
  check('ch7 diagram cell', [3 * N.g48m24.cpp, N.g48m24.tracks * N.g48m24.mmp].join(','), '144,144'); says('dg.cell.aria', '单元宽 144 纳米、高 144 纳米'); says('dg.cell.cap', '取 6 条轨道');
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
  check('ch9 Cu at 24 nm', f(W.rPerUm('cu', 24, 2), 0), '816'); says('ch9.p3', '铜线每微米电阻约 816 Ω');
  check('ch9 Ru at 24 nm', Math.round(W.rPerUm('ru', 24, 2)), 466); says('ch9.p3', '钌约 466 Ω');
  check('ch9 Cu delay 100 µm', f(W.delayPs('cu', 24, 100, 2), 0), '620'); says('ch9.p3', '延迟约 620 皮秒');
  check('ch9 longer than a 4 GHz cycle', W.delayPs('cu', 24, 100, 2) > 250, true);
  check('ch9 crossover barrier 2', f(W.crossover(2), 0), '39'); says('ch9.p4', '间距约 39 纳米以下');
  check('ch9 crossover barrier 0', f(W.crossover(0), 0), '11'); says('ch9.p4', '交叉点退到约 11 纳米');
  check('ch9 Cu mfp', M.wires.METALS.cu.mfp, 39.9); says('ch9.limit', '自由程 39.9 纳米');
  check('ch9 Ru mfp', M.wires.METALS.ru.mfp, 6.6); says('ch9.p2', '约 6.6 纳米');
  // the diagram: geometry at 24 nm pitch with the default barrier, and the conducting share of the copper line
  const gc = W.geom('cu', 24, W.METALS.cu.barrier);
  check('ch9 diagram geometry', [gc.w, gc.h, gc.wc, gc.hc, W.METALS.cu.barrier].join(','), '12,24,8,22,2'); check('ch9 diagram share', f(W.conductorShare('cu', 24, 2) * 100, 0), '61'); says('dg.wires.aria', '约 61%'); says('dg.wires.cap', '默认的 2 纳米');
  // the size-effect formula uses the conductor's own aspect ratio; with no barrier that is the nominal 2
  check('ch9 rho uses conductor AR', f(W.rho('cu', 8, 22) / W.rho('cu', 8, 16), 3), f((W.ms(39.9 / 8 * 0.4 / 0.6) + 0.375 * 1.2 * (1 + 22 / 8) / (22 / 8) * 39.9 / 8) / (W.ms(39.9 / 8 * 0.4 / 0.6) + 0.375 * 1.2 * 1.5 * 39.9 / 8), 3));
  check('ch9 parameters', [W.R, W.P, W.C, W.CAP].join(','), '0.4,0,1.2,2e-16'); says('ch9.limit', '晶界反射系数取 0.4'); says('ch9.p1', '0.2 飞法');
  check('ch9 copper cannot be made', isFinite(W.rPerUm('cu', 12, 4)), false);
  for (const k of ['cu', 'ru', 'nocu']) check('ch9 sentence ' + k, typeof Z['ch9.say.' + k], 'string');
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

/* ── the two languages carry the same keys, and no value is empty ── */
{
  const kz = Object.keys(Z), ke = Object.keys(E_);
  check('copy keys identical', kz.filter(k => !(k in E_)).concat(ke.filter(k => !(k in Z))).join(','), '');
  check('no empty copy value', kz.filter(k => !String(Z[k]).trim()).concat(ke.filter(k => !String(E_[k]).trim())).join(','), '');
  // placeholders match between the languages (ch11.date is formatted in code for English)
  const ph = s => (String(s).match(/\{\w+\}/g) || []).sort().join('');
  check('placeholders identical', kz.filter(k => k in E_ && ph(Z[k]) !== ph(E_[k])).join(','), '');
}

/* ── diagrams and language-awareness ── */
{
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8'), app = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
  const names = [...html.matchAll(/<figure class="dia" data-dg="(\w+)">/g)].map(m => m[1]);
  check('diagrams in the page', names.join(','), 'lattice,junction,mosfet,scaling,abbe,euvpath,cell,shapes,wires,package,bspdn');
  for (const nm of names) {
    check('diagram ' + nm + ' caption', typeof Z['dg.' + nm + '.cap'] === 'string' && /^图 \d+　/.test(Z['dg.' + nm + '.cap']), true);
    check('diagram ' + nm + ' aria', typeof Z['dg.' + nm + '.aria'] === 'string' && Z['dg.' + nm + '.aria'].length > 20, true);
    check('diagram ' + nm + ' drawn by app.js', app.includes('DG.' + nm + ' = '), true);
  }
  // captions are numbered in page order
  check('diagram numbering', names.map(nm => +Z['dg.' + nm + '.cap'].match(/^图 (\d+)/)[1]).join(','), names.map((_, i) => i + 1).join(','));
  // every dg.* key the code asks for exists, and no Chinese is produced in code or markup outside the static <title>/<meta>
  const asked = [...app.matchAll(/'(dg\.[a-z0-9.]+)'/g)].map(m => m[1]), all = Object.keys(Z);
  check('diagram keys exist (a key, or the stem of keys built in code)', asked.filter(k => !(k in Z) && !all.some(z => z.startsWith(k))).join(','), '');
  check('no CJK in app.js', /[\u3400-\u9fff]/.test(app), false);
  check('no CJK in models.js', /[\u3400-\u9fff]/.test(fs.readFileSync(path.join(__dirname, '..', 'models.js'), 'utf8')), false);
  check('no CJK in the page body', /[\u3400-\u9fff]/.test(html.slice(html.indexOf('<body>')).replace('>中<', '><')), false);
}

console.log(fails ? `${fails} of ${n} checks FAILED` : `PASS: ${n} model and prose checks`);
process.exit(fails ? 1 : 0);
