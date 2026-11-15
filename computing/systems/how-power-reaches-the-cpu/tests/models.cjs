'use strict';
// Pins the page's models: the sourced figures typed again from their sources (80 PLUS table, Intel ATX 3 design guide,
// Intel ark and datasheet limits, the FIVR paper, schedutil, intel_idle's Skylake table, DGX B200); the dated frontier
// facts; the model chip (alpha-power V/f curve, C·V²·f plus leakage); the 80 PLUS loss fit through its three points; the
// buck ripple formula and TI SLVA882B eq. 2 against a brute-force sum of phase-shifted triangles; the wall-to-die chain
// balance; the PDN step (static drop = R·ΔI, load line) and |Z(f)|; race to idle; the menu-style idle governor; the
// thermal RC chain with PL1 / PL2 / Tau and its closed-form boost time; the rack arithmetic; every number the prose
// quotes (placeholders filled from prose(), literals checked against models.js); the sensitivity claims in the TUNED
// notes; every live sentence branch; copy keys, language hygiene, the registry, links to live siblings and aliases.
// Run: node computing/systems/how-power-reaches-the-cpu/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const ROOT = path.join(DIR, '..', '..', '..');
const SLUG = 'how-power-reaches-the-cpu';
const M = require(path.join(DIR, 'models.js'));
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;
const html = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(DIR, 'app.js'), 'utf8');
const { SRC, FRONTIER } = M;

let n = 0, fails = 0;
function check(name, got, want) { n++; if (got !== want) { fails++; console.error(`FAIL ${name}: model gives ${got}, expected ${want}`); } }
function within(name, got, lo, hi) { n++; if (!(got >= lo && got <= hi)) { fails++; console.error(`FAIL ${name}: ${got} not in [${lo}, ${hi}]`); } }
function says(key, phrase) { n++; if (!Z[key] || !Z[key].includes(phrase)) { fails++; console.error(`FAIL prose ${key} should contain "${phrase}"`); } }
const f = (x, d) => x.toFixed(d);
const P = M.prose();

/* ── sourced figures, typed again from the sources (BRIEF.md lists URL and date) ── */
{
  const T = SRC.plus80, row = k => Object.keys(T[k]).filter(x => x !== 'pfc').map(x => x + ':' + T[k][x]).join(' ');
  check('80 PLUS 115 V internal: bronze', row('bronze'), '20:82 50:85 100:82');
  check('80 PLUS: silver', row('silver'), '20:85 50:88 100:85');
  check('80 PLUS: gold', row('gold'), '20:87 50:90 100:87');
  check('80 PLUS: platinum', row('platinum'), '20:90 50:92 100:89');
  check('80 PLUS: titanium', row('titanium'), '10:90 20:92 50:94 100:90');
  check('80 PLUS: ruby', row('ruby'), '5:85 10:91 20:93 50:95 100:91');
  check('80 PLUS: base level 80 / 80 / 80', row('std'), '20:80 50:80 100:80');
  for (const [k, s] of [['bronze', '铜牌 82/85/82%'], ['gold', '金牌 87/90/87%'], ['platinum', '白金 90/92/89%'], ['titanium', '钛金 90/92/94/90%'], ['ruby', '91/93/95/91%']]) says('ch3.p2', s);
  says('ch3.p2', '5% 负载点 85%'); says('ch3.p2', '20%、50%、100% 负载只要求 ' + [20, 50, 100].map(k => SRC.atx.req[k]).join('/') + '%'); check('ATX Table 4-14: full 70, typical 72, light 65', [100, 50, 20].map(k => SRC.atx.req[k]).join(), '70,72,65'); says('ch3.tuned', '10% 负载有自己的门槛 90%');
  says('ch11.e1', '10% 负载 91%，50% 负载 95%');
  const A = SRC.atx;
  check('ATX 3 Table 3-3 excursions 200 % 100 µs, 180 % 1 ms, 160 % 10 ms, 120 % 100 ms', A.exc.map(e => e[0] + '@' + e[1]).join(), '200@0.0001,180@0.001,160@0.01,120@0.1');
  check('ATX 3 12V-2x6: 9.2 A per pin, 6 pins, 16 AWG, 600 W; +12 V 11.20–12.60', [A.pinA, A.pins, A.awg, A.conn, A.v12lo, A.v12hi].join(), '9.2,6,16,600,11.2,12.6');
  check('ATX 3 Table 2-1: 125 W CPU 26 / 39 A; 150 W 33 / 60 A', [A.cpu125.cont, A.cpu125.peak, A.cpu150.cont, A.cpu150.peak].join(), '26,39,33,60');
  check('ATX 3 required efficiency 70 / 72 / 65', [A.req[100], A.req[50], A.req[20]].join(), '70,72,65');
  check('+12 V is +5 % / −7 %', [f(12 * 0.93, 2), f(12 * 1.05, 2)].join(), '11.16,12.60'); // the guide rounds −7 % to 11.20 (it states 11.20)
  says('ch3.p4', '修订 2.1a，2023 年 11 月'); says('ch3.p4', '450 瓦以上'); says('ch11.e1', '600 瓦的 12V-2x6');
  check('i9-14900K: 125 / 253 W, Tj 100 °C, 6.0 GHz, 8P + 16E', Object.values(SRC.i9).join(), '125,253,100,6,8,16');
  says('ch9.p2', '基础功率 125 瓦、最大睿频功率 253 瓦'); says('ch9.p1', 'i9-14900K');
  check('i9-10900K datasheet PL1 125, PL2 250, Tau 56', Object.values(SRC.tau10).join(), '125,250,56');
  check('Ryzen 7000: TDP 170, PPT 230', Object.values(SRC.amd).join(), '170,230'); says('ch9.p2', '170 瓦的型号，PPT 是 230 瓦');
  check('FIVR (APEC 2014): 140 MHz, 16 phases, 8–31, 1.8 V, 90 %, 31 A/mm², Haswell 2013', Object.values(SRC.fivr).join(), '140,16,8,31,1.8,90,31,2013');
  says('ch6.p3', '2013 年的第 4 代酷睿（Haswell）'); says('ch6.p3', 'APEC 2014'); says('ch6.p3', '12 到 20 伏');
  check('schedutil 1.25, PELT 32 ms', Object.values(SRC.sched).join(), '1.25,32');
  check('intel_idle skl_cstates', SRC.skl.map(s => s.join(':')).join(' '), 'C1:2:2 C1E:10:20 C3:70:100 C6:85:200 C7s:124:800 C8:200:800 C9:480:5000 C10:890:5000');
  for (const [nm, k] of [['C1', 'n1'], ['C1E', 'n1e'], ['C3', 'n3'], ['C6', 'n6'], ['C8', 'n8'], ['C10', 'n10']]) { const s = SRC.skl.find(x => x[0] === nm); check('diagram ' + nm, Z['dg.cst.' + k], s[1] + ' / ' + s[2]); }
  for (const s of ['C1 退出 2 微秒、驻留 2 微秒', 'C1E 10 和 20', 'C3 70 和 100', 'C6 85 和 200', 'C8 200 和 800', 'C10 890 和 5000']) says('ch8.p2', s);
  check('DGX B200: 8 GPUs, 14.3 kW, six 3.3 kW PSUs, 1000 W per GPU', Object.values(SRC.dgx).join(), '8,14.3,6,3.3,1000');
  says('ch10.p1', '六个 3.3 千瓦的电源（5+1 冗余）');
  check('AWG 18 copper 20.95 mΩ/m', SRC.awg18, 0.02095); says('ch1.tuned', '每米 20.95 毫欧'); says('ch1.tuned', '18 AWG');
  const F = FRONTIER;
  check('as of 2026-11', F.asOf, '2026-11'); says('ch11.title', '2026 年 11 月'); says('toc.ch11', '2026 年 11 月');
  check('PowerVia 2023-06-05, Blue Sky Creek, >90 %, >5 %', Object.values(F.powervia).join(), '2023-06-05,Blue Sky Creek,90,5');
  says('ch11.d1', '2023 年 6 月 5 日'); says('ch11.d1', 'Blue Sky Creek'); says('ch11.d1', '2024 年投产');
  check('20A dropped 2024-09; Panther Lake broad availability 2026-01', Object.values(F.pantherlake).join(), '2024-09,2026-01');
  says('ch11.e2', '2024 年 9 月放弃 20A'); says('ch11.e2', '2026 年 1 月'); says('ch11.e2', '18A');
  check('A16: 2024-04, 8–10 %, H2 2026', [F.a16.date, F.a16.spd.join('-'), F.a16.prod].join(), '2024-04,8-10,2026-H2');
  says('ch11.c1', '2024 年 4 月宣布'); says('ch11.c1', '2026 年下半年量产'); check('A16 volume production planned H2 2026', F.a16.prod, '2026-H2'); says('ch11.c1', '2024 年 4 月 25 日');
  check('Google 48 V 2016-03-09, at least 30 %', Object.values(F.google48).join(), '2016-03-09,30'); says('ch10.p1', '2016 年');
  check('Open Rack V3 46–52 V', Object.values(F.orv3).join(), '46,52'); says('ch10.p1', '46 到 52 伏'); says('ch11.e3', '46 到 52 伏');
  check('NVIDIA 800 V blog 2025-05-20: 200 kg, 54 / 800 V, 1 MW, 2027, 85 %, 5 %', Object.values(F.nv800).join(), '2025-05-20,200,54,800,1,2027,85,5');
  says('ch10.p2', '2025 年 5 月 20 日'); says('ch10.p2', '1 兆瓦的机架如果用 54 伏'); says('ch11.c2', '2025 年 5 月 20 日'); says('ch11.c2', 'Kyber');
  check('Infineon TDM2454xx 2025-03-10: 2 A/mm², 280 A, 4 phases', Object.values(F.infineon).join(), '2025-03-10,2,280,4');
  says('ch11.d2', '2025 年 3 月 10 日'); says('ch11.d2', 'TDM2454xx'); says('ch11.d2', '四相');
  // the model count in the description is the number of model sections on the page
  const nModels = Object.keys(Z).filter(k => /^ch\d+\.model\.title$/.test(k)).length;
  check('eight model sections', nModels, 8); says('doc.desc', '八个可以动手的模型');
}

/* ── 02 the model chip ── */
{
  const C = M.CHIP;
  check('fmax(Vmax) = fTop', f(M.fAt(C.vmax), 6), f(C.fTop, 6));
  check('V/f inverse: vFor(fAt(1.2 V)) = 1.2 V', f(M.vFor(M.fAt(1.2)), 6), '1.200000');
  check('below the knee the voltage stays at Vmin', [M.vFor(1.0), M.vFor(2.0)].join(), [C.vmin, C.vmin].join());
  check('knee = fAt(Vmin)', f(M.fKnee, 6), f(M.fAt(C.vmin), 6));
  const p = M.power(4.8, 80, 8);
  check('dynamic = cores · C · V² · f', f(p.dyn, 6), f(8 * C.c * p.V * p.V * 4.8e9, 6));
  check('I = P / V', f(p.I, 6), f(p.P / p.V, 6));
  check('leakage doubles every tD', f(M.power(4.8, 80 + C.tD, 8).leak / p.leak, 6), '2.000000');
  check('power rises faster than f above the knee: P(5.6)/P(4.8) > (5.6/4.8)', P.r5648p[0] > P.r5648f[0] * 1.3, true);
  check('below the knee power is about linear in f: P(2.4)/P(1.2) < 2', P.r2412p[0] < 2, true);
  check('P-states on the V/f curve', M.PSTATES.join(), '0.8,1.6,2.4,3.2,4,4.8,5.6');
  for (const [k, s] of [['ch2.p3', '2.4'], ['ch2.p3', '4.8'], ['ch2.p3', '5.6'], ['ch2.limit', '2.4'], ['ch2.limit', '5.6']]) says(k, s);
  check('TUNED chip: 8 cores, Vt 0.30, α 1.4, C 3 nF, I0 1 A at 1 V 50 °C, ×e per 0.5 V, ×2 per 30 °C', [C.cores, C.vt, C.alpha, C.c * 1e9, C.i0, C.vS, C.tD].join(), '8,0.3,1.4,3,1,0.5,30');
  says('ch2.tuned', '8 核芯片'); says('ch2.tuned', 'Vt = 0.30 伏，α = 1.4'); says('ch2.tuned', '每核电容 3 nF'); says('ch2.tuned', '1 伏、50 °C 时每核 1 安'); says('ch2.tuned', '每高 0.5 伏乘 e'); says('ch2.tuned', '每高 30 °C 翻一倍');
  // TUNED claim: doubling C doubles dynamic power
  { const c0 = C.c; C.c *= 2; const q = M.power(4.8, 80, 8); C.c = c0; check('C doubled: dynamic doubles', f(q.dyn / p.dyn, 6), '2.000000'); }
}

/* ── 03 the PSU fit ── */
{
  for (const k of M.TIERS) for (const x of [20, 50, 100]) check(`fit passes ${k} ${x} %`, f(M.psuEff(k, x / 100) * 100, 6), f(SRC.plus80[k][x], 6));
  check('the base 80 PLUS level has no curve (no point fixes its idle loss)', M.TIERS.includes('std'), false);
  check('gold peaks between 20 % and 100 %', M.psuEff('gold', 0.5) > M.psuEff('gold', 0.2) && M.psuEff('gold', 0.5) > M.psuEff('gold', 1), true);
  check('titanium fit at 10 % is below its 90 % requirement (the prose says so)', P.ti10fit[0] < 0.90, true);
  says('ch3.tuned', '115 伏，非冗余'); says('ch3.p3', '850');
}

/* ── 04 the multiphase buck ── */
{
  const V = M.VRM;
  check('ripple ΔI = (Vin − Vo)·D/(L·f): 12 → 1.2 V, 220 nH, 500 kHz', f(M.phaseRipple(1.2, 220, 500), 4), f((12 - 1.2) * 0.1 / (220e-9 * 500e3), 4));
  check('SLVA882B eq. 2: n = 1 gives 1', M.rippleNorm(1, 0.1), 1);
  for (const nn of [2, 4, 6, 12]) for (let k = 1; k < nn; k++) check(`eq. 2 zero at D = ${k}/${nn}`, f(M.rippleNorm(nn, k / nn), 9), '0.000000000');
  for (const [nn, D] of [[2, 0.1], [4, 0.1], [4, 0.3], [12, 0.1], [6, 0.45]]) {
    const w = M.vrmWave(nn, D * 12, 220, 500, 100, { steps: 6000, periods: 2 });
    within(`brute-force sum matches eq. 2 (n ${nn}, D ${D})`, w.ripple / w.dI, M.rippleNorm(nn, D) - 0.004, M.rippleNorm(nn, D) + 0.004);
  }
  check('defaults 12 phases, 500 kHz, 220 nH, 200 A in the html', [/name="vrN" value="12" checked/.test(html), /id="vrF" min="0" max="5" step="1" value="2"/.test(html), /id="vrL" min="0" max="4" step="1" value="2"/.test(html), /id="vrI" min="0" max="6" step="1" value="5"/.test(html), V.fs[2], V.ls[2]].join(), 'true,true,true,true,500,220');
  says('ch4.p2', '220 nH、500 kHz'); says('ch4.p3', '默认 12 相、500 kHz、200 安'); says('ch4.p3', '1 MHz'); says('ch4.p3', '30 安'); says('ch4.p1', '1.2');
  check('TUNED: 1.5 mΩ, 3 ns, 0.8 µJ, 0.5 W', [V.rPh * 1e3, V.tsw * 1e9, f(V.e0 * 1e6, 1), V.ctrl].join(), '1.5,3,0.8,0.5');
  says('ch4.tuned', '1.5 毫欧'); says('ch4.tuned', '3 纳秒'); says('ch4.tuned', '0.8 微焦'); says('ch4.tuned', '0.5 瓦'); says('ch4.tuned', 'SLVA882B（2017 年，2021 年修订）');
  { const r0 = V.rPh, a = M.vrm(12, 500, 220, 200).loss; V.rPh *= 2; const b = M.vrm(12, 500, 220, 200).loss; V.rPh = r0;
    within('rPh doubled: about 5 W more at 200 A', b - a, 4.5, 5.5); says('ch4.tuned', '增加约 5 瓦'); }
  check('more phases, cooler: 1 < 6 < 12 phase efficiency', P.v1eff[0] < P.v6eff[0] && P.v6eff[0] < P.v12eff[0], true);
  check('1 MHz costs efficiency, light load costs more', P.v12feff[0] < P.v12eff[0] && P.v12leff[0] < P.v12feff[0], true);
}

/* ── 01 the chain ── */
{
  const r = M.chain(253, 'gold', 850);
  check('chain balance: wall = CPU + PSU + cable + VRM + package + rest', f(r.wall, 6), f(253 + r.psuLoss + r.cable + r.vrmLoss + r.pkg + M.CHAIN.rest, 6));
  check('heat on the path = PSU + cable + VRM + package', f(r.heatPath, 6), f(r.psuLoss + r.cable + r.vrmLoss + r.pkg, 6));
  check('cable resistance = 2 × 20.95 mΩ/m × 0.6 m / 4', f(M.CHAIN.rCable * 1e3, 4), f(2 * 20.95 * 0.6 / 4, 4));
  check('currents grow as voltage falls: wall < 12 V < core', r.iWall < r.i12 && r.i12 < r.I, true);
  check('PSU loss is the largest stage at 253 W gold', r.psuLoss > Math.max(r.cable, r.vrmLoss, r.pkg), true);
  check('mains 220 V', M.CHAIN.mains, 220); for (const k of ['ch1.law', 'ch1.p1', 'ch1.p2', 'dg.chain.wallv', 'dg.psu.ac', 'dg.chain.aria']) says(k, '220 伏');
  says('ch1.p1', '50 赫兹'); says('ch1.law', '约 400 伏直流'); says('dg.psu.bus', '400');
  check('default 253 W CPU, 850 W gold, in the html', [/name="chP" value="253" checked/.test(html), /name="chT" value="gold" checked/.test(html), /id="chR" min="0" max="5" step="1" value="2"/.test(html), M.CHAIN.rated[2]].join(), 'true,true,true,850');
  says('ch1.p2', '253 瓦'); says('ch1.p3', '253 瓦的 CPU 配一个 850 瓦的金牌电源'); says('dg.chain.cap', 'CPU 253 瓦，850 瓦金牌电源'); check('253 W is the 14900K turbo power', SRC.i9.turbo, 253);
  says('ch1.p3', '125 瓦'); says('ch1.p3', '65 瓦'); says('ch1.tuned', '12 相、500 kHz'); check('chain VRM 12 phases 500 kHz', [M.CHAIN.nPh, M.CHAIN.fsw].join(), '12,500');
  { const r0 = M.CHAIN.rPkg; M.CHAIN.rPkg *= 2; const b = M.chain(253, 'gold', 850); M.CHAIN.rPkg = r0;
    within('rPkg doubled: package loss doubles (±2 %)', b.pkg / r.pkg, 1.98, 2.02); within('…and the total changes by under 3 %', b.wall / r.wall - 1, 0, 0.03); says('ch1.tuned', '总账变化不到 3%'); }
}

/* ── 05 the PDN ── */
{
  const s = M.pdnStep({ ll: 1e-3 }), R = 1e-3 + M.PDN.rPlane + M.PDN.rSock + M.PDN.rBump;
  check('static drop = (R_LL + path R) · ΔI', f(s.static, 6), f(R * 100, 6));
  check('the trace settles at the static value (60 µs)', Math.abs(s.vEnd - s.vFinal) < 0.004, true);
  check('the undershoot goes below the final value', s.over > 0, true);
  check('no load line: tiny static drop', P.sLL0s[0] < 30, true);
  check('target impedance = 1.25 × 5 % / 100 A', f(M.zTarget(1.25, 0.05, 100) * 1000, 4), '0.6250'); says('ch5.p2', '1.25 伏允许 5% 波动、电流跳 100 安');
  check('|Z| at low frequency tends to the DC resistance', Math.abs(M.pdnZ(10, { ll: 1e-3 }) - R) / R < 0.02, true);
  check('removing package caps raises the peak', P.zNoP[0] > P.zPk[0] && P.sNoP[0] > P.sDroop[0], true);
  check('removing MLCC deepens the droop', P.sNoM[0] > P.sDroop[0], true);
  check('TUNED: VID 1.25, 0.8 nH, 10×560 µF, 30×22 µF, 20 µF, 2 µF, 10 ns', [M.PDN.vid, M.PDN.lVrm * 1e9, f(M.PDN.bulk.c * 1e6 / 10, 0), f(M.PDN.mlcc.c * 1e6 / 30, 0), f(M.PDN.pkgc.c * 1e6, 0), f(M.PDN.die.c * 1e6, 0), f(M.PDN.rise * 1e9, 0)].join(), '1.25,0.8,560,22,20,2,10');
  for (const s2 of ['VID 1.25 伏', '0.8 nH', '十个 560 µF', '三十个 22 µF', '封装电容 20 µF', '晶粒电容 2 µF', '10 纳秒']) says('ch5.tuned', s2);
  within('0.8 nH with 1 mΩ ≈ 200 kHz bandwidth', 1e-3 / (2 * Math.PI * M.PDN.lVrm), 190e3, 210e3); says('ch5.tuned', '约 200 kHz');
  { const r0 = M.PDN.rise; M.PDN.rise *= 2; const b = M.pdnStep({ ll: 1e-3 }); M.PDN.rise = r0; check('rise doubled: the first dip is shallower', b.droop < s.droop, true); says('ch5.tuned', '最初那一沉变浅'); }
  check('10 ns ramp: the prose says 十来纳秒 / about ten nanoseconds', M.PDN.rise, 10e-9); for (const k of ['hero.sub', 'doc.desc', 'ch5.law', 'ch5.p1']) says(k, '十来纳秒');
  check('a steeper ramp sinks deeper', P.sFast[0] > P.sDroop[0], true); check('with or without a load line the first sink is the same', f(P.sLL0[0], 0), f(P.sDroop[0], 0));
  check('defaults 1 mΩ, 100 A, both cap banks in', [/name="pdL" value="2" checked/.test(html), /name="pdI" value="1" checked/.test(html), /id="pdM" checked/.test(html), /id="pdP" checked/.test(html), /id="pdD" checked/.test(html)].join(), 'true,true,true,true,false');
  says('ch5.ctl.die', '1/4'); says('ch5.limit', '10');
}

/* ── 07 race to idle ── */
{
  const r = M.raceEnergy(2.0, 1, 'c6', 0);
  check('energy = (P + plat)·t + idle·(1 − t)', f(r.E, 9), f(M.power(2.0, 60, 1).P * 0.5 + M.RACE.pC6 * 0.5, 9));
  check('C6: best near the knee', Math.abs(P.rC6best[0] - Math.round(M.fKnee * 10) / 10) <= 0.11, true);
  check('C1: idling is expensive, so slow is best', M.raceSweep(1, 'c1', 0).best.f, 1);
  check('a platform cost pushes the best point up', P.rC6pbest[0] >= P.rC6best[0], true);
  { const p0 = M.RACE.pC6; M.RACE.pC6 *= 2; const b = M.raceSweep(1, 'c6', 0).best.f; M.RACE.pC6 = p0; check('pC6 doubled: same best frequency', b, P.rC6best[0]); says('ch7.tuned', '深睡的功率变一倍，结论不变'); }
  check('TUNED 60 °C, 0.02 W', [M.RACE.T, M.RACE.pC6].join(), '60,0.02'); says('ch7.tuned', '60 °C'); says('ch7.tuned', '0.02 瓦');
  check('schedutil: 1.25 × 40 % × 5.6 GHz', f(M.schedutil(0.4, 5.6), 6), f(1.25 * 0.4 * 5.6, 6));
}

/* ── 08 C-states ── */
{
  const c = M.cstate(300, 'menu', 0);
  check('menu saves less than the oracle', P.cMenuSave[0] < P.cOrSave[0], true);
  check('very short idles: menu costs more than C1', P.cMenu20Save[0] < 0, true);
  check('a 100 µs latency limit removes the deep states', Object.keys(M.cstate(3000, 'menu', 100).hist).join(), 'C1,C1E,C3,C6');
  check('histogram counts every idle', Object.values(c.hist).reduce((a, b) => a + b, 0), c.n);
  check('TUNED per-state power', ['C1', 'C1E', 'C3', 'C6', 'C10'].map(k => M.CST.pw[k]).join() + ',' + M.CST.pWake, '1.2,0.8,0.35,0.08,0.02,2.5');
  for (const s of ['C1 1.2 瓦', 'C1E 0.8', 'C3 0.35', 'C6 0.08', 'C10 0.02 瓦', '2.5 瓦']) says('ch8.tuned', s);
  { const pw0 = { ...M.CST.pw }, w0 = M.CST.pWake; for (const k in M.CST.pw) M.CST.pw[k] *= 2; M.CST.pWake *= 2; const b = M.cstate(300, 'menu', 0); Object.assign(M.CST.pw, pw0); M.CST.pWake = w0;
    check('all powers doubled: the same saving', f(b.saved, 9), f(c.saved, 9)); says('ch8.tuned', '省电的比例不变'); }
  check('default mean 300 µs, menu, no limit', [/id="csM" min="0" max="6" step="1" value="3"/.test(html), M.CST.means[3], /name="csP" value="menu" checked/.test(html), /name="csL" value="0" checked/.test(html)].join(), 'true,300,true,true');
}

/* ── 09 heat ── */
{
  const H = M.TH;
  check('closed-form boost time = Tau·ln((PL2 − idle)/(PL2 − PL1))', f(M.boostTime(125, 253, 56, 20), 6), f(56 * Math.log(233 / 128), 6));
  within('simulated time at PL2 is the closed form within the 1 % change in leakage-driven power', P.th15pl2[0], P.boost[0] - 1, P.boost[0] + 3);
  check('Intel defaults PL1 125, PL2 253, Tau 56', H.presets.intel.join(), '125,253,56'); says('ch9.p4', 'PL1 125、PL2 253、Tau 56 秒'); says('ch9.pr.intel', '125'); says('ch9.pr.intel', '253'); says('ch9.pr.intel', '56');
  check('low preset 65 / 125 / 28', H.presets.low.join(), '65,125,28'); says('ch9.pr.low', '65'); says('ch9.pr.low', '28');
  check('unlimited preset at 253', H.presets.unlim.join(), '253,253,56'); says('ch9.say.hotU', '253 瓦'); says('ch9.pr.unlim', '253');
  check('Tj max 100 °C', H.tj, 100); says('ch9.p4', '结温碰到 100 °C'); says('ch9.p4', '100 度');
  check('power-limited: bigger cooler, same frequency', P.th08f[0], P.th15f[0]);
  check('unlimited, 0.20 K/W: hits Tj max', M.thermal({ pl1: 253, pl2: 253, ra: 0.20 }).thermalLimited, true);
  check('steady Tj = amb + P·ΣR', f(P.dT253[0], 6), f(253 * (H.rjc + H.rch + 0.15), 6));
  check('TUNED: 4 / 40 / 300 J/K, 25 °C, 20 W, start 5 s, 0.05 s, 100 MHz steps', [H.cj, H.cc, H.ch, H.amb, H.idle, H.tStart, H.dt].join(), '4,40,300,25,20,5,0.05');
  for (const s of ['4、40、300 焦每开尔文', '环境 25 °C', '空闲 20 瓦', '第 5 秒', '0.05 秒', '100 MHz']) says('ch9.tuned', s);
  { const c0 = H.ch, a = M.thermal({ pl1: 253, pl2: 253, ra: 0.20 }); H.ch *= 2; const b = M.thermal({ pl1: 253, pl2: 253, ra: 0.20 }); H.ch = c0;
    within('cooler heat capacity doubled: time to Tj max roughly doubles', b.firstHot / a.firstHot, 1.6, 2.4); within('…final frequency almost unchanged', Math.abs(b.fEnd - a.fEnd), 0, 0.1 + 1e-9); says('ch9.tuned', '大约推迟一倍，最后的频率几乎不变'); }
  check('thermal default 0.15 K/W in the html', [/id="thR" min="0" max="6" step="1" value="3"/.test(html), H.ras[3], /name="thS" value="intel" checked/.test(html)].join(), 'true,0.15,true');
  says('dg.therm.q', '253'); says('dg.pl.pl2', '253'); says('dg.pl.pl1', '125'); says('dg.therm.cap', '253 瓦');
}

/* ── 10 racks ── */
{
  check('1 kW: 83 A at 12 V, 20.8 A at 48 V; loss ratio 16', [f(M.amps(1000, 12), 0), f(M.amps(1000, 48), 1), M.lossRatio(12, 48)].join(), '83,20.8,16');
  says('ch10.p1', '电压高 4 倍，电流小 4 倍'); says('ch10.law', '48 伏'); says('ch10.law', '800 伏');
  check('1 MW at 54 V = 18.5 kA; at 800 V = 1250 A', [f(M.amps(1e6, 54) / 1000, 1), f(M.amps(1e6, 800), 0)].join(), '18.5,1250');
  check('two 5 % losses leave 90.25 %, about 10 % gone', f(P.uv[0] * 100, 2), '9.75');
}

/* ── every number the prose quotes ── */
{
  const want = { c253V: '1.27', c253I: '199', c253f: '5.4', c253i12: '23.1', c253wall: '401', c253iw: '2.02', c253share: '63', c253heat: '68', c253vrm: '14.5',
    c253psu: '39.9', c253pkg: '9.9', c253cab: '3.4', c253vrmEff: '94.8', c125I: '126', c125V: '0.99', c65I: '81', c253tWall: '383', restW: '80',
    rPkg: '0.25', cableM: '0.6', atx125c: '26', atx125p: '39', fKnee: '2.8', vmin: '0.70', vmax: '1.45', fTop: '6.0', p56: '278', p48: '164', p40: '95',
    p24: '34', v56: '1.33', v48: '1.11', r5648f: '1.17', r5648p: '1.69', leak56: '15', leak24: '18', r2412p: '1.70', gold5: '66', gold10: '79',
    gold50: '90', goldIdle: '73', c253x: '42', ti10fit: '84.7', excA: '200', excT: '100', exc2: '180', exc3: '160', exc4: '120', pinA: '9.2', pins: '6',
    connW: '600', pinW: '662', awg: '16', v12lo: '11.20', v12hi: '12.60', v1dI: '9.8', v1D: '0.10', v12ph: '16.7', v12sum: '1.45', v12k: '0.148',
    v12eff: '94.5', v6eff: '93.5', v12feff: '91.5', v12leff: '85.5', v1eff: '78.8', v12loss: '14.0', v1loss: '65', sV0: '1.225', sDroop: '152',
    sStatic: '123', sOver: '29', sNoM: '230', sLL0: '152', sLL0s: '23', sNoP: '436', sFast: '183', riseFast: '2', zT: '0.625', zPk: '4.86', zPkF: '44', zNoP: '42.36', zNoPF: '17',
    dIdef: '100', llDef: '1.0', fvMhz: '140', fvPh: '16', fvLo: '8', fvHi: '31', fvVin: '1.8', fvEff: '90', fvAmm: '31', rC6best: '2.8', rC6slow: '1.95',
    rC6fast: '7.07', rC6E: '1.66', rC1slow: '1.95', rC1fast: '7.46', rC6pbest: '2.9', rC1knee: '1.95', shU: '40', shF: '2.8', shMax: '5.6', shHead: '1.25',
    pelt: '32', cMenuSave: '41', cOrSave: '44', cMenuLat: '82', cMenuMiss: '44', cMenu20Save: '-16', cLatSave: '88', cDeepSave: '81', cDeepLat: '228',
    tau10: '56', boost: '34', tjMax: '100', th15pl2: '36', th15f: '4.4', th15tj: '66', th15peak: '5.6', thUhot: '77', thUf: '5.0', thU08f: '5.4',
    th08f: '4.4', ra15: '0.15', ra20: '0.20', ra08: '0.08', rTot15: '0.32', dT253: '81', rjc: '0.12', rch: '0.05', idleW: '20', thAmb: '25', thD1: '30',
    thD2: '13', thD3: '38', dgxKw: '14.3', dgxN: '8', gpuW: '1000', a12: '83', a48: '20.8', lr: '16', mwA: '18.5', mw800: '1250', cu: '200', g48: '30',
    nv85: '85', nv5: '5', nvYear: '2027', pvUtil: '90', pvFreq: '5', ifAmm: '2', ifAmp: '280', a16lo: '8', a16hi: '10', uv: '10' };
  for (const [k, [v, d, kind]] of Object.entries(P)) check('prose ' + k, kind === 'pct' ? f(v * 100, d) : typeof d === 'number' ? f(v, d) : M.fmtKind(v, d), want[k]);
  check('every prose value pinned', Object.keys(P).sort().join(','), Object.keys(want).sort().join(','));
  const used = new Set();
  const scan = key => { const v = Z[key] || ''; for (const p of v.matchAll(/\{(\w+)\}/g)) { used.add(p[1]); n++; if (!(p[1] in P)) { fails++; console.error(`FAIL {${p[1]}} in ${key} is not filled on the page`); } } };
  for (const m of html.matchAll(/data-i18n-html="([^"]+)"/g)) scan(m[1]);
  for (const k of Object.keys(Z).filter(k => /^dg\./.test(k))) { for (const p of Z[k].matchAll(/\{(\w+)\}/g)) { used.add(p[1]); n++; if (!(p[1] in P)) { fails++; console.error(`FAIL {${p[1]}} in ${k} has no source`); } } }
  for (const k of Object.keys(P)) { n++; if (!used.has(k)) { fails++; console.error('FAIL prose() value ' + k + ' is never quoted'); } }
  // the claims the prose makes about the numbers
  check('ch1: CPU gets under two thirds of the wall power at 253 W', P.c253share[0] < 2 / 3, true);
  check('ch2: leakage is a larger share at low clocks than at high', P.leak24[0] > P.leak56[0], true);
  check('ch3: gold at 5 % is far below its 50 % value', P.gold5[0] < P.gold50[0] - 0.2, true);
  check('ch3: 6 pins × 9.2 A × 12 V is only about 10 % over 600 W', P.pinW[0] / P.connW[0] < 1.15, true);
  check('ch4: 12 phases cancel most of the ripple', P.v12k[0] < 0.2, true);
  check('ch5: the peak is above the 1 mΩ load line', P.zPk[0] > P.llDef[0], true);
  check('ch7: running flat out costs several times the best', P.rC6fast[0] / P.rC6E[0] > 3, true);
  check('ch9: Tau 56 s, but the boost lasts under 56 s', P.boost[0] < P.tau10[0], true);
}

/* ── sentence branches ── */
{
  const has = k => { n++; if (Z[k] == null) { fails++; console.error('FAIL missing say key ' + k); } };
  const seen = new Set(), add = s => { has(s.key); seen.add(s.key); };
  for (const p of M.CHAIN.cpu) for (const t of ['bronze', 'gold', 'platinum', 'titanium']) for (const r of M.CHAIN.rated) add(M.say.chain(M.chain(p, t, r)));
  for (let i = 0; i <= 52; i++) add(M.say.power(Math.round((0.8 + 0.1 * i) * 10) / 10));
  for (const x of [0.02, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.05, 1.1]) add(M.say.psu(x));
  for (const nn of M.VRM.ns) for (const fs of M.VRM.fs) for (const L of M.VRM.ls) for (const I of [10, 30, 60, 100, 150, 200, 300]) add(M.say.vrm(M.vrm(nn, fs, L, I)));
  for (const ll of [0, 0.5e-3, 1e-3, 1.5e-3]) for (const dI of [50, 100, 150, 200]) for (const mlcc of [true, false]) for (const pkgc of [true, false]) {
    const o = { ll, dI, mlcc, pkgc, dieScale: 1, tEnd: 20e-6 }; add(M.say.pdn(M.pdnStep(o), o)); }
  for (const w of M.RACE.works) for (const pl of M.RACE.plats) for (const k of ['c1', 'c6']) add(M.say.race(M.raceSweep(w, k, pl), k));
  for (const m of M.CST.means) for (const p of ['c1', 'menu', 'oracle']) for (const l of [0, 200, 100, 20]) add(M.say.cstate(M.cstate(m, p, l)));
  for (const s of ['intel', 'unlim', 'low']) for (const ra of M.TH.ras) { const [pl1, pl2, tau] = M.TH.presets[s], o = { pl1, pl2, tau, ra }; add(M.say.thermal(M.thermal(o), o)); }
  const all = Object.keys(Z).filter(k => /\.say\./.test(k));
  for (const k of all) check('branch reached ' + k, seen.has(k), true);
  for (const k of seen) check('branch has copy ' + k, Z[k] != null, true);
}

/* ── keys, language hygiene, registry, siblings ── */
{
  const keys = new Set([...html.matchAll(/data-i18n(?:-html|-aria|)="([^"]+)"/g)].map(m => m[1]));
  for (const m of app.matchAll(/'((?:ch\d+|dg|u|doc|nav|toc|hero)\.[\w.-]*\w)'/g)) keys.add(m[1]);
  for (const m of html.matchAll(/data-dg="(\w+)"/g)) keys.add('dg.' + m[1] + '.aria');
  for (const m of app.matchAll(/U\('(\w+)'/g)) keys.add('u.' + m[1]);
  for (const k of [...keys]) if (/\.$/.test(k)) keys.delete(k);
  for (const k of keys) { n++; if (Z[k] == null) { fails++; console.error('FAIL missing zh key ' + k); } }
  const prefixes = [...app.matchAll(/'((?:ch\d+|dg)\.[\w.]*)'\s*\+/g)].map(m => m[1]);
  for (const k of Object.keys(Z)) {
    const reach = keys.has(k) || html.includes(`"${k}"`) || app.includes(`'${k}'`) || prefixes.some(p => k.startsWith(p)) || /\.say\./.test(k);
    n++; if (!reach) { fails++; console.error('FAIL zh key never used ' + k); }
  }
  for (const [k, v] of Object.entries(Z)) if (/\.say\./.test(k)) for (const m of v.matchAll(/\{(\w+)\}/g)) {
    n++; if (!new RegExp('\\b' + m[1] + '\\s*:|[{,]\\s*' + m[1] + '\\s*[,}]').test(app)) { fails++; console.error(`FAIL placeholder {${m[1]}} in ${k} is never supplied by app.js`); }
  }
  const dgs = [...html.matchAll(/class="dia" data-dg="(\w+)"/g)].map(m => m[1]);
  check('ten diagrams (six or more required)', dgs.join(), 'chain,vf,psu,vrm,pdn,die,cst,therm,pl,bspd');
  for (const d of dgs) { check('diagram spec ' + d, app.includes('DG.' + d + ' = '), true); for (const s of ['cap', 'aria']) check(`dg.${d}.${s}`, typeof Z[`dg.${d}.${s}`], 'string'); }
  // a diagram's caption says 示意 unless its numbers come from the model or a source (those are pinned above)
  for (const d of ['psu', 'vrm', 'pdn', 'die', 'bspd']) says(`dg.${d}.cap`, '示意');
  for (const [d, s] of [['chain', '模型'], ['vf', '取自模型'], ['cst', 'intel_idle'], ['therm', '第 9 章模型'], ['pl', 'Tau']]) says(`dg.${d}.cap`, s);
  for (const file of ['index.html', 'app.js', 'models.js']) {
    let src = fs.readFileSync(path.join(DIR, file), 'utf8');
    if (file === 'index.html') {
      const tt = src.match(/<title>([^<]*)<\/title>/)[1], md = src.match(/<meta name="description" content="([^"]*)">/)[1];
      check('static title = doc.title', tt, Z['doc.title']); check('static meta = doc.desc', md, Z['doc.desc']);
      src = src.replace(/<title>[^<]*<\/title>/, '').replace(/<meta name="description" content="[^"]*">/, '');
      src = src.replace(/<details class="page-provenance"[\s\S]*?<\/details>/, '');
    }
    src = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '').replace(/<!--[\s\S]*?-->/g, '');
    n++;
    const others = (src.match(/[一-鿿、，。：；（）「」《》]+/g) || []).filter(x => !(file === 'index.html' && x === '中'));
    if (others.length) { fails++; console.error(`FAIL Chinese text in ${file}: ${others.slice(0, 3).join(' ')}`); }
  }
  check('four scripts with one dated key (?v=20261115, a letter allowed)', (html.match(/src="(models|copy\.zh|copy\.en|app)\.js\?v=20261115[a-z]?"/g) || []).length, 4);
  check('site-nav included', /site-nav\.css/.test(html) && /site-nav\.js/.test(html), true);
  check('at most one provenance label', (html.match(/<details class="page-provenance"/g) || []).length <= 1, true);
  const R = JSON.parse(fs.readFileSync(path.join(DIR, 'REGISTRY.json'), 'utf8'));
  check('registry slug/path', R.slug + ' ' + R.path, SLUG + ' computing/systems/' + SLUG + '/');
  check('registry category', [R.category, R.subtopic, R.stage].join('/'), 'computing/systems/university');
  check('registry title', R.title.zh, Z['doc.title'].split(' · ')[0]); check('registry desc', R.desc.zh, Z['doc.desc']);
  check('hero title = registry title', Z['hero.title'], R.title.zh);
  for (const c of R.concepts) check('anchor ' + c.anchor, html.includes('id="' + c.anchor.slice(1) + '"'), true);
  for (const c of R.concepts) { n++; if (!c.aliases.zh.length || !c.aliases.en.length || !c.title.en || !c.desc.en || !c.title.zh || !c.desc.zh) { fails++; console.error('FAIL concept incomplete ' + c.id); } }
  check('one concept per chapter', R.concepts.map(c => c.anchor).join(), Array.from({ length: 12 }, (_, i) => '#ch' + (i + 1)).join());
  // one word, one owner: every alias anywhere else (sibling registries, atlas lessons, the alias table) is off limits,
  // plus the words reserved for siblings that are not registered yet
  const norm = s => s.toLowerCase().replace(/\s+/g, '');
  const mine = new Set(R.concepts.map(c => c.id));
  const owned = new Map(), own = (a, who) => { if (typeof a === 'string' && !owned.has(norm(a))) owned.set(norm(a), who); };
  const AL = JSON.parse(fs.readFileSync(path.join(ROOT, 'atlas', 'graph', 'aliases.json'), 'utf8'));
  for (const [id, v] of Object.entries(AL)) if (!mine.has(id)) for (const l of ['zh', 'en']) (v[l] || []).forEach(a => own(a, 'atlas aliases ' + id));
  const LD = path.join(ROOT, 'atlas', 'graph', 'lessons');
  for (const fn of fs.readdirSync(LD)) {
    if (fn === SLUG + '.json') continue;
    const d = JSON.parse(fs.readFileSync(path.join(LD, fn), 'utf8'));
    for (const nd of d.nodes || []) if (nd.aliases && !mine.has(nd.id)) for (const l of ['zh', 'en']) (nd.aliases[l] || []).forEach(a => own(a, 'lesson ' + fn));
  }
  for (const sub of fs.readdirSync(path.join(DIR, '..'))) {
    const p = path.join(DIR, '..', sub, 'REGISTRY.json');
    if (sub !== SLUG && fs.existsSync(p)) for (const c of JSON.parse(fs.readFileSync(p, 'utf8')).concepts || []) for (const a of [...c.aliases.zh, ...c.aliases.en]) own(a, sub);
  }
  for (const a of ['漏电', 'leakage current', '功率密度', 'power density', '背面供电', 'backside power delivery', '登纳德缩放', '暗硅', 'dark silicon']) own(a, 'why-chips-are-hard (draft)');
  for (const a of ['AI data center power', 'AI数据中心耗电', 'AI 数据中心耗电']) own(a, 'what-a-frontier-model-takes (draft)');
  for (const a of ['CPU 频率', '主频为什么有上限', 'why clock speed is limited']) own(a, 'switches-that-compute #ch7');
  for (const a of ['Dennard scaling', '登纳德缩放定律']) own(a, 'why-compute-waits-for-memory #ch5');
  for (const a of ['USB PD', 'USB Power Delivery', 'USB-C 供电', 'PD 快充']) own(a, 'how-thunderbolt-works');
  for (const a of ['power sequencing', '上电时序', 'PWR_OK', 'Power Good', 'S3', 'S4', 'S0ix', 'sleep vs hibernate', '睡眠和休眠']) own(a, 'how-a-computer-boots');
  for (const a of ['降压电路', 'buck converter', 'Buck', 'boost converter', '升压电路']) own(a, 'power-converters');
  for (const a of ['欧姆定律', "Ohm's law"]) own(a, 'ohms-law');
  for (const c of R.concepts) for (const a of [...c.aliases.zh, ...c.aliases.en]) { n++; if (owned.has(norm(a))) { fails++; console.error(`FAIL alias owned by ${owned.get(norm(a))}: ${a}`); } }
  const mineAll = R.concepts.flatMap(c => [...c.aliases.zh, ...c.aliases.en]).map(norm);
  check('no alias twice on this page', new Set(mineAll).size, mineAll.length);
  for (const w of ['VRM', '80 PLUS', '负载线', 'C-state', 'DVFS', 'PL1 PL2', 'CPU 降频', 'why does my CPU throttle', '电迁移', 'PowerVia']) check('this page takes ' + w, mineAll.includes(norm(w)), true);
  // links: only live pages, chapters that exist, titles quoted as in their copy
  const all = Object.values(Z).join('');
  const LIVE = ['how-a-computer-boots', 'how-thunderbolt-works', 'how-a-gpu-computes', 'how-cpu-caches-work', 'switches-that-compute', 'why-compute-waits-for-memory', 'how-a-cpu-guesses-ahead'];
  const LESSONS = { 'physics/circuits/power-converters': '升压与降压 · 能量去哪了？', 'physics/circuits/ohms-law': '欧姆定律 · 电流是调出来的' };
  const hrefs = [...all.matchAll(/href='([^']+)'/g)].map(m => m[1]);
  for (const h of hrefs) { n++; if (!new RegExp('^\\.\\./(' + LIVE.join('|') + ')/(#ch\\d+)?$').test(h) && !/^\.\.\/\.\.\/\.\.\/physics\/circuits\/(power-converters|ohms-law)\/$/.test(h)) { fails++; console.error('FAIL unexpected link ' + h); } }
  for (const sib of LIVE) {
    const sh = fs.readFileSync(path.join(DIR, '..', sib, 'index.html'), 'utf8');
    for (const m of all.matchAll(new RegExp("href='\\.\\./" + sib + "/(#ch\\d+)?'", 'g'))) if (m[1]) check(`${sib} anchor ${m[1]}`, sh.includes(`id="${m[1].slice(1)}"`), true);
    const cz = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, '..', sib, 'copy.zh.js'), 'utf8'), cz); check(sib + ' title quoted as in its copy', all.includes('《' + cz.window.ESSAY_COPY.zh['hero.title'] + '》'), true);
  }
  const cfg = fs.readFileSync(path.join(ROOT, 'pages.config.js'), 'utf8');
  for (const [p, t] of Object.entries(LESSONS)) { check(p + ' is live with that title', cfg.includes(`title: { zh: "${t}"`) && cfg.includes(`path: "${p}/"`), true); check(p + ' linked with its title', all.includes(`href='../../../${p}/'>《${t}》`), true); }
  for (const [h, why] of [['../how-a-computer-boots/#ch1', 'power sequencing'], ['../how-a-computer-boots/#ch5', 'sleep states'], ['../how-thunderbolt-works/#ch7', 'USB PD'], ['../how-a-gpu-computes/#ch11', 'GPU power'],
    ['../switches-that-compute/#ch7', 'clock and critical path'], ['../why-compute-waits-for-memory/#ch5', 'Dennard'], ['../how-a-cpu-guesses-ahead/', 'out-of-order'], ['../how-cpu-caches-work/', 'caches'],
    ['../../../physics/circuits/power-converters/', 'buck derivation'], ['../../../physics/circuits/ohms-law/', 'Ohm']]) check(`links ${h} (${why})`, hrefs.includes(h), true);
  // drafts that are not live are named in plain text only
  check('why-chips-are-hard named in plain text, not linked', [all.includes('《芯片为什么越来越难做》'), /why-chips-are-hard/.test(all)].join(), 'true,false');
  check('how-electricity-reaches-you named in plain text, not linked', [all.includes('《按下开关的那一刻，电是从哪儿来的》'), /how-electricity-reaches-you/.test(all)].join(), 'true,false');

  const ectx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.en.js'), 'utf8'), ectx);
  const EN = ectx.window.ESSAY_COPY.en, stub = ectx.window.ESSAY_COPY.enStub === true, ph = s => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');
  check('en keys = zh keys', Object.keys(EN).sort().join('|'), Object.keys(Z).sort().join('|'));
  for (const k of Object.keys(Z)) check('en placeholders ' + k, ph(EN[k]), ph(Z[k]));
  if (stub) { check('en stub mirrors zh exactly', JSON.stringify(EN), JSON.stringify(Z)); console.log('NOTE: copy.en.js is a stub (enStub); English registry match skipped until it is translated'); }
  else { check('registry title en', R.title.en, EN['doc.title'].split(' · ')[0]); check('registry desc en', R.desc.en, EN['doc.desc']); }
}

if (fails) { console.error(`\n${fails} of ${n} checks failed`); process.exit(1); }
console.log(`PASS: ${n} checks (sourced and frontier figures, model chip, 80 PLUS fit, buck ripple and SLVA882B eq. 2, wall-to-die balance, PDN step and impedance, race to idle, idle governor, thermal limits, rack arithmetic, every number in the prose, TUNED sensitivity claims, every sentence branch, keys, registry, links and aliases)`);
