'use strict';
// Pins every number the essay's prose states to the page's own models (no literal is repeated here: each number
// is computed from models.js and then looked up in copy.zh.js), checks the models against the published results
// they implement, and evaluates every live-sentence branch at the control extremes.
// Run: node chemistry/reactions/why-batteries-hold-so-little/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const M = require(path.join(__dirname, '..', 'models.js'));
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;

let n = 0, fails = 0;
const fail = m => { fails++; console.error('FAIL ' + m); };
function check(name, cond, detail = '') { n++; if (!cond) fail(`${name} ${detail}`); }
function says(key, phrase) { n++; if (!Z[key] || !Z[key].includes(phrase)) fail(`prose ${key} should contain "${phrase}"`); }
const f = (x, d) => x.toFixed(d);
const near = (a, b, tol) => Math.abs(a - b) <= tol;

/* ── ch1 electrochemical series ── */
{
  const zc = M.cell('zn', 'cu'), pb = M.cell('pb', 'pbo2'), lco = M.cell('li', 'lco');
  check('ch1 Daniell cell = 1.10 V (OpenStax E° values)', f(zc.E, 2) === '1.10');
  says('ch1.p3', f(zc.E, 2) + ' V'); says('ch1.p3', f(-zc.dG, 0) + ' kJ');
  says('ch1.p3', f(pb.E, 2) + ' V'); says('ch1.p3', f(lco.E, 2) + ' V'); says('ch1.p3', f(-lco.dG, 0) + ' kJ');
  check('ch1 ΔG = −nFE per mole of electrons', near(zc.dG, -96.48533212 * zc.E, 1e-9));
  check('ch1 lead–acid sits outside the water window', pb.oxidisesWater && pb.E > M.WATER.o2 - M.WATER.h2);
  says('ch1.p4', f(M.ocv.avgGraphite(), 2) + ' V');
  check('ch1 water window is 1.23 V', f(M.WATER.o2 - M.WATER.h2, 2) === '1.23'); says('ch1.say.both', '1.23 V');
  // every pair maps to a sentence that exists; each branch is reached
  const seen = new Set();
  for (const a of M.electrodes) for (const k of M.electrodes) { const key = M.say.ch1(a.id, k.id); seen.add(key); check('ch1 key ' + key, !!Z[key]); }
  for (const k of ['same', 'rev', 'inside', 'low', 'high', 'both']) check('ch1 branch reached: ' + k, seen.has('ch1.say.' + k));
  check('ch1 default pair is "both"', M.say.ch1('graphite', 'nmc') === 'ch1.say.both');
}

/* ── ch2 capacity ladder ── */
{
  says('ch2.p2', f(M.capacity(1, M.molar.Li), 0) + ' mAh/g');
  for (const [n_, m] of [[1, 'C6'], [3.75, 'Si'], [1, 'LiCoO2'], [1, 'NMC811'], [1, 'LiFePO4']]) says('ch2.p2', f(M.capacity(n_, M.molar[m]), 0));
  check('ch2 graphite 372 mAh/g (textbook)', f(M.capacity(1, M.molar.C6), 0) === '372');
  check('ch2 LFP 170 mAh/g (textbook)', f(M.capacity(1, M.molar.LiFePO4), 0) === '170');
  const S = M.ladder('nmc', 'graphite'), last = S[S.length - 1].whkg, lfp = M.ladder('lfp', 'graphite');
  says('ch2.p3', f(S[0].whkg, 0) + ' Wh/kg'); says('ch2.p3', f(last, 0) + ' Wh/kg'); says('ch2.p3', f(last / S[0].whkg * 100, 0) + '%');
  says('ch2.p3', f(S[1].m / S[S.length - 1].m * 100, 0) + '%'); says('ch2.p3', f(lfp[0].whkg, 0)); says('ch2.p3', f(lfp[lfp.length - 1].whkg, 0) + ' Wh/kg');
  check('ch2 NMC/graphite lands in Frith 2023 range 245–270', last >= 245 && last <= 270.5, f(last, 1));
  check('ch2 every step loses energy', S.every((s, i) => i === 0 || s.whkg <= S[i - 1].whkg));
  says('ch2.p4', f(M.finalWhkg('nmc', 'graphite', 1), 0)); says('ch2.p4', f(M.finalWhkg('nmc', 'graphite', 8), 0) + ' Wh/kg');
  says('ch2.p4', f(M.finalWhkg('nmc', 'li', 5), 0) + ' Wh/kg');
  check('ch2 thicker electrodes always help', [1, 2, 3, 5, 8].every((q, i, a) => i === 0 || M.finalWhkg('nmc', 'graphite', q) > M.finalWhkg('nmc', 'graphite', a[i - 1])));
  says('ch2.limit', '232.5 Wh/kg'); check('ch2 4680 value is the FRONTIER one', M.FRONTIER.find(e => e.id === 'tesla4680').whkg === 232.5);
  const seen = new Set();
  for (const c of ['lco', 'nmc', 'lfp']) for (const a of ['graphite', 'blend', 'silicon', 'li']) for (const q of [1, 2, 2.5, 8]) {
    const key = M.say.ch2(c, a, q); seen.add(key); check('ch2 key ' + key, !!Z[key]);
    if (key === 'ch2.say.newanode') check('ch2 new anode gains over graphite ' + c + a, M.finalWhkg(c, a, q) > M.finalWhkg(c, 'graphite', q));
  }
  check('ch2 three branches', seen.size === 3);
  check('ch2 biggest loss for default is the usable-capacity step', S[M.say.ch2big(S)].key === 'usable');
}

/* ── ch3 lattice gas and OCV ── */
{
  says('ch3.p3', f(-M.latticeSlopeMid(0) * 100, 1) + ' mV');
  const b3 = M.binodal(3); says('ch3.p3', f(b3[0], 3)); says('ch3.p3', f(b3[1], 3));
  check('ch3 binodal satisfies the common-tangent condition E(xb) = E0', near(M.latticeE(b3[0], 3), 0, 1e-9));
  check('ch3 no phase split at w ≤ 2', M.binodal(2) === null && M.binodal(1.9) === null);
  check('ch3 slope vanishes at w = 2', near(M.latticeSlopeMid(2), 0, 1e-12));
  says('ch3.p4', f(M.ocv.slope('nmcCell', .5) * 10, 1) + ' mV'); says('ch3.p4', f(M.ocv.slope('lfpCell', .5) * 10, 2) + ' mV');
  says('ch3.p4', '±' + f(M.socError('nmcCell', .5, .005) * 100, 1) + '%'); says('ch3.p4', '±' + f(M.socError('lfpCell', .5, .005) * 100, 1) + '%');
  check('ch3 NMC cell OCV spans 2.5–4.2 V (Chen 2020 window)', near(M.ocv.nmcCell(0), 2.5, 0.01) && near(M.ocv.nmcCell(1), 4.19, 0.01));
  check('ch3 LFP is flatter mid-range', M.ocv.slope('lfpCell', .5) < M.ocv.slope('nmcCell', .5) / 10);
  const seen = new Set();
  for (let w = 0; w <= 5.0001; w += 0.1) { const k = M.say.ch3a(+w.toFixed(1)); seen.add(k); check('ch3a key ' + k, !!Z[k]); }
  check('ch3a three branches', seen.size === 3);
  const seen2 = new Set();
  for (const s of [0.05, 0.2, 0.5, 0.8, 0.95]) for (const e of [1, 20]) { const k = M.say.ch3b(s, e); seen2.add(k); check('ch3b key ' + k, !!Z[k]); }
  check('ch3b both branches', seen2.size === 2);
}

/* ── ch4 diffusion ── */
{
  const P = M.PARTICLES, pc = (k, c, R) => Math.min(100, M.particleCharge(P[k], R || P[k].R, c).filled * 100);
  says('ch4.p3', 'τ = ' + f(P.graphite.R ** 2 / P.graphite.D / 60, 0) + ' 分钟'); says('ch4.p3', f(pc('graphite', 10), 0) + '%');
  says('ch4.p3', f(P.nmc.R ** 2 / P.nmc.D / 3600, 1) + ' 小时'); says('ch4.p3', '2C 时装进 ' + f(pc('nmc', 2), 0) + '%'); says('ch4.p3', '4C 时只有 ' + f(pc('nmc', 4), 0) + '%');
  says('ch4.p3', 'τ 只有 ' + f(P.lfp.R ** 2 / P.lfp.D / 60, 0) + ' 分钟');
  check('ch4 D ratio graphite/NMC ≈ 8', f(P.graphite.D / P.nmc.D, 0) === '8'); says('ch4.p3', '小八倍');
  // the solver conserves lithium: with no surface flux the mean stays put; with flux the mean rises at the set rate
  const sp = M.makeSphere(30); let c = new Float64Array(30).map((_, i) => i / 30); const m0 = M.sphereMean(sp, c);
  for (let i = 0; i < 50; i++) c = M.sphereStep(sp, c, 1e-14, 5e-6, 10, 0);
  check('ch4 finite volume conserves mass', near(M.sphereMean(sp, c), m0, 1e-12));
  const st = M.particleSim(P.graphite, P.graphite.R, 1); st.advance(600);
  check('ch4 mean rises linearly with constant current', near(st.filled(), 600 / 3600, 0.002), f(st.filled(), 4));
  check('ch4 τ scales with R²', near(M.particleSim(P.nmc, 2 * P.nmc.R, 1).tau / M.particleSim(P.nmc, P.nmc.R, 1).tau, 4, 1e-9));
  const seen = new Set(['ch4.say.run']);
  for (const k of ['graphite', 'nmc', 'lfp']) for (const r of [-2, 0, 2]) for (const ci of [0.5, 1, 20]) {
    const s = M.particleSim(P[k], P[k].R * 2 ** r, ci); s.advance(Infinity); const key = M.say.ch4(s); seen.add(key); check('ch4 key ' + key, !!Z[key]);
    if (key === 'ch4.say.cut') check('ch4 cut means partly filled', s.filled() < 1);
  }
  check('ch4 all branches', ['ch4.say.full', 'ch4.say.fullslow', 'ch4.say.cut'].every(k => seen.has(k)));
}

/* ── ch5 single particle model CC-CV ── */
{
  const cc = (c, T, rs) => M.ccCv(c, T, { rScale: rs || 1 });
  const c1 = cc(1, 25), c2 = cc(2, 25), c6 = cc(6, 25), c0 = cc(2, 0), cs = cc(2, 25, 0.25), c4 = cc(4, 25);
  says('ch5.p3', '在 ' + f(c1.socSwitch * 100, 0) + '% 时'); says('ch5.p3', f(c1.t80 / 60, 0) + ' 分钟到 80%'); says('ch5.p3', f(c1.tEnd / 60, 0) + ' 分钟充满');
  says('ch5.p3', '缩短到 ' + f(c2.t80 / 60, 0) + ' 分钟'); says('ch5.p3', '只充到 ' + f(c6.socSwitch * 100, 0) + '%'); says('ch5.p3', '仍要 ' + f(c6.t80 / 60, 0) + ' 分钟');
  says('ch5.p3', '只要 ' + f(cs.t80 / 60, 0) + ' 分钟');
  says('ch5.p4', f(c0.t80 / 60, 0) + ' 分钟'); says('ch5.p4', f(c1.peakHeat, 1) + ' W'); says('ch5.p4', f(c4.peakHeat, 1) + ' W'); says('ch5.p4', '是 ' + f(c4.peakHeat / c1.peakHeat, 0) + ' 倍');
  check('ch5 CV ends at C/20 near full', c1.socEnd > 0.97 && c1.socEnd < 1.01, f(c1.socEnd, 3));
  check('ch5 voltage never exceeds 4.2 V', c2.V.every(v => v <= M.SPM.Vmax + 1e-6));
  check('ch5 −10 °C flags plating, 25 °C does not', cc(2, -10).plating && !c2.plating);
  check('ch5 both electrodes hold the same charge over their windows', near(M.SPM.ep * M.SPM.cpMax * (M.SPM.y0 - M.SPM.y1) * M.SPM.Lp, M.SPM.en * M.SPM.cnMax * (M.SPM.x1 - M.SPM.x0) * M.SPM.Ln, 1e-9));
  check('ch5 the LG M50 window holds ~5 Ah', near(M.SPM.Qwin / 3600, 5.09, 0.02), f(M.SPM.Qwin / 3600, 3));
  const seen = new Set();
  for (const c of [0.5, 6]) for (const T of [-10, 0, 25, 45]) for (const rs of [0.25, 1, 1.5]) { const r = cc(c, T, rs), k = M.say.ch5(r); seen.add(k); check('ch5 key ' + k, !!Z[k]); }
  check('ch5 run key', !!Z[M.say.ch5(c1, false)]);
  for (const k of ['normal', 'cvmost', 'plating', 'instant']) check('ch5 branch reached: ' + k, seen.has('ch5.say.' + k));
  check('ch5 noeighty unreachable in the slider range (sentence kept as a guard)', !seen.has('ch5.say.noeighty') && !!Z['ch5.say.noeighty']);
}

/* ── ch6 thermal runaway ── */
{
  const crit = M.trCritical();
  check('ch6 critical oven temperature matches Chen et al. 2021 (127–128 °C)', crit >= 127 && crit <= 128, f(crit, 2));
  says('ch6.p3', f(crit, 0) + ' °C'); says('ch6.p2', '127–128 °C');
  const r127 = M.trRun(127), r128 = M.trRun(128);
  check('ch6 127 safe, 128 runaway', !r127.runaway && r128.runaway);
  says('ch6.p3', '最高只到 ' + f(r127.Tpeak, 0) + ' °C'); says('ch6.p3', '在 ' + f(r128.tRun / 60, 0) + ' 分钟后失控'); says('ch6.p3', '最高 ' + f(r128.Tpeak, 0) + ' °C');
  says('ch6.p3', f(M.trCritical({ cool: 4 }), 1) + ' °C'); says('ch6.p3', '降到 ' + f(M.trCritical({ Pext: 2 }), 0) + ' °C');
  const ls = M.FRONTIER.find(e => e.id === 'lfpSafety');
  for (const k of ['lfpOnset', 'nmcOnset', 'lfpTR', 'nmcTR']) says('ch6.p4', f(ls[k], 1) + ' °C');
  const seen = new Set();
  for (const [a, cool, P] of [[100, 0.5, 0], [100, 4, 0], [125, 1, 0], [127, 1, 0], [128, 1, 0], [160, 0.5, 0], [160, 4, 0], [100, 1, 10], [160, 4, 10]]) {
    const r = M.trRun(a, { cool, Pext: P }), cr = M.trCritical({ cool, Pext: P }), k = M.say.ch6(r, cr, a); seen.add(k); check('ch6 key ' + k, !!Z[k]);
    if (cr != null && cr > 80) check(`ch6 runaway iff above critical (${a}, ${cool}, ${P})`, r.runaway === (a > cr));
  }
  for (const k of ['safe', 'close', 'runaway']) check('ch6 branch reached: ' + k, seen.has('ch6.say.' + k));
  check('ch6 run key', !!Z[M.say.ch6(r127, crit, 127, false)]);
}

/* ── ch7 ageing ── */
{
  const P0 = { meanSoc: .5, dod: .5, cyclesPerDay: 1, Tc: 25 };
  const age = o => M.ageCapacity(3650, { ...P0, ...o }), a0 = age({});
  says('ch7.p3', '剩 ' + f(a0.q * 100, 0) + '%'); says('ch7.p3', '日历老化 ' + f(a0.cal * 100, 0) + '%'); says('ch7.p3', '循环老化 ' + f(a0.cyc * 100, 0) + '%');
  says('ch7.p3', f(M.ageDaysTo(.8, P0) / 365, 1) + ' 年'); says('ch7.p3', '只剩 ' + f(age({ Tc: 35 }).q * 100, 0) + '%');
  says('ch7.p3', '日历损失 ' + f(age({ meanSoc: .1, dod: 0, cyclesPerDay: 0 }).cal * 100, 1) + '%'); says('ch7.p3', f(age({ meanSoc: 1, dod: 0, cyclesPerDay: 0 }).cal * 100, 1) + '%');
  says('ch7.p3', f(M.ageDaysTo(.8, { ...P0, dod: 0, cyclesPerDay: 0 }) / 365, 0) + ' 年');
  // BLAST-Lite form: calendar ∝ t^0.75, cycle ∝ √Ah
  check('ch7 calendar term scales as t^0.75', near(M.ageCapacity(7300, P0).cal / a0.cal, Math.pow(2, 0.75), 1e-9));
  check('ch7 cycle term scales as √(Ah)', near(M.ageCapacity(7300, P0).cyc / a0.cyc, Math.SQRT2, 1e-9));
  check('ch7 hotter ages faster', age({ Tc: 45 }).q < age({ Tc: 25 }).q);
  check('ch7 capacity never below 0', M.ageCapacity(3650, { ...P0, Tc: 50, meanSoc: 1 }).q >= 0);
  const seen = new Set();
  for (const Tc of [20, 35, 50]) for (const s of [0.1, 0.5, 1]) for (const d of [0, 1]) for (const c of [0, 3]) {
    const P = { Tc, meanSoc: s, dod: Math.min(d, 2 * Math.min(s, 1 - s)), cyclesPerDay: c };
    for (const k of M.say.ch7(P)) { seen.add(k); check('ch7 key ' + k, !!Z[k]); }
  }
  check('ch7 never-reaches-80 is a guard outside the slider range', !seen.has('ch7.say.never') && !!Z['ch7.say.never'] && M.ageDaysTo(.8, { Tc: 20, meanSoc: .1, dod: 0, cyclesPerDay: 0 }) != null);
  for (const k of ['ch7.say.cal', 'ch7.say.cyc', 'ch7.say.storage', 'ch7.note.temp', 'ch7.note.floor']) check('ch7 branch reached: ' + k, seen.has(k));
}

/* ── ch8 learning curve ── */
{
  const w91 = M.wright(1991), w98 = M.wright(1998);
  says('ch8.p2', f(w91.lr * 100, 1) + '%'); says('ch8.p2', f(w98.lr * 100, 1) + '%'); says('ch8.p2', 'R² = ' + f(w98.r2, 2)); says('ch8.p2', f(w98.doublings, 1) + ' 倍');
  check('ch8 full-series rate ≈ 20 % (Ziegler & Trancik 2021)', near(w91.lr, 0.20, 0.01), f(w91.lr, 3));
  check('ch8 LR = 1 − 2^b', near(w98.price(2) / w98.price(1), 1 - w98.lr, 1e-12));
  says('hero.lead', '约 ' + f(M.PRICE[2023] / M.PRICE[1991] * 100, 0) + '%'); says('ch10.sum', '约 ' + f(M.PRICE[2023] / M.PRICE[1991] * 100, 0) + '%');
  const seen = new Set();
  for (let y = 1991; y <= 2015; y++) for (const ex of [0, 3]) for (const k of M.say.ch8(y, ex)) { seen.add(k); check('ch8 key ' + k, !!Z[k]); }
  for (const k of ['all', 'normal', 'weak', 'ext']) check('ch8 branch reached: ' + k, seen.has('ch8.say.' + k));
}

/* ── ch9 frontier and lithium floor ── */
{
  const FR = id => M.FRONTIER.find(e => e.id === id);
  check('ch9 Li floor 0.070 kg/kWh at 3.7 V', f(M.liPerKwh(3.7), 3) === '0.070');
  check('ch9 TWh bound consistent', near(M.liBoundTWh(1000, 1, 3.7), 1e6 / M.liPerKwh(3.7) / 1e9, 1e-12));
  says('ch9.p2', String(FR('m50').whkg)); says('ch9.p2', String(FR('tesla4680').whkg)); says('ch9.p2', '约 ' + FR('ctpLfp').whkg + ' Wh/kg');
  says('ch9.p2', FR('pack2025').priceLfp + ' 美元'); says('ch9.p2', FR('pack2025').priceNmc + ' 便宜');
  says('ch9.p3', FR('prologium').whkg + ' Wh/kg'); says('ch9.p3', FR('amprius450').whkg + ' Wh/kg'); says('ch9.p3', f(M.finalWhkg('nmc', 'li', 5), 0) + ' Wh/kg');
  // every frontier fact has a name, a sentence, a date, and all of its placeholders are known fields or derived ones
  const derived = ['liProdKt', 'liReservesMt', 'minStr'];
  for (const e of M.FRONTIER) {
    check('ch9 fact ' + e.id + ' has text and name', !!Z['ft.' + e.id] && !!Z['ft.name.' + e.id]);
    check('ch9 fact ' + e.id + ' dated', /^(\d{4}(-\d{2})?|spec)$/.test(e.asOf));
    for (const m of (Z['ft.' + e.id] || '').matchAll(/\{(\w+)\}/g)) check(`ch9 ${e.id} placeholder ${m[1]}`, e[m[1]] != null || derived.includes(m[1]));
    check('ch9 status valid ' + e.id, ['est', 'demo', 'claim'].includes(e.status));
  }
  for (const s of ['est', 'demo', 'claim']) check('ch9 status present ' + s, M.FRONTIER.some(e => e.status === s));
}

/* ── copy hygiene: every data-i18n key in index.html exists ── */
{
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) check('key in copy: ' + m[1], Z[m[1]] != null);
  const app = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8'), mod = fs.readFileSync(path.join(__dirname, '..', 'models.js'), 'utf8');
  for (const m of app.matchAll(/\bt\('([a-z]\w*(?:\.\w+)+)'/g)) check('app key in copy: ' + m[1], Z[m[1]] != null);
  // keys the page builds from ids
  for (const e of M.electrodes) check('electrode name ' + e.id, Z['ch1.el.' + e.id] != null);
  for (const w of ['ok', 'low', 'high', 'both']) check('water tile ' + w, Z['ch1.water.' + w] != null);
  for (const st of M.ladder('nmc', 'graphite')) check('step name ' + st.key, Z['ch2.step.' + st.key] != null);
  for (const m of ['lco', 'nmc', 'lfp', 'graphite', 'blend', 'silicon', 'li']) check('material ' + m, Z['mat.' + m] != null);
  for (const r of ['est', 'demo', 'claim', 'model']) check('row ' + r, Z['ch9.row.' + r] != null);
  check('no Chinese in app.js or models.js', !/[　-〿㐀-鿿＀-￯]/.test(app + mod));
}

if (fails) { console.error(`${fails} of ${n} checks failed`); process.exit(1); }
console.log(`PASS: ${n} model and prose checks (every prose number derived from models.js; every live-sentence branch evaluated)`);
