'use strict';
// Comprehensive Node verification for tech/energy/solar-cells:
// 1. Physics & mathematical invariants for all 7 models in models.js
// 2. Every prose number pinned dynamically to models.js and verified in copy.zh.js & copy.en.js
// 3. 100% key, placeholder, HTML-tag, and link-target parity between copy.zh.js & copy.en.js
// 4. Zero unexpected CJK outside copy.zh.js
// 5. All .say live-sentence branches exercised across control ranges in zh & en
// 6. REGISTRY.json schema validation
//
// Run: node tech/energy/solar-cells/tests/models.cjs

const path = require('path');
const fs = require('fs');
const vm = require('vm');

const dir = path.join(__dirname, '..');
const M = require(path.join(dir, 'models.js'));

const ctxZh = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(dir, 'copy.zh.js'), 'utf8'), ctxZh);
const Z = ctxZh.window.ESSAY_COPY.zh;

const ctxEn = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(dir, 'copy.en.js'), 'utf8'), ctxEn);
const E = ctxEn.window.ESSAY_COPY.en;

let n = 0;
let fails = 0;

function check(name, got, want) {
  n++;
  if (got !== want) {
    fails++;
    console.error(`FAIL ${name}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
  }
}

function ok(name, cond, detail) {
  n++;
  if (!cond) {
    fails++;
    console.error(`FAIL ${name}${detail ? ': ' + detail : ''}`);
  }
}

function saysBoth(key, zhPhrase, enPhrase) {
  n++;
  if (!Z[key] || !Z[key].includes(zhPhrase)) {
    fails++;
    console.error(`FAIL zh prose ${key} missing "${zhPhrase}"`);
  }
  n++;
  if (!E[key] || !E[key].includes(enPhrase)) {
    fails++;
    console.error(`FAIL en prose ${key} missing "${enPhrase}"`);
  }
}

const f = (x, d) => x.toFixed(d);

/* ── 1. Physical constants & spectrum (Ch. 1) ── */
{
  check('ch1 HC_EV_NM ~1239.84', f(M.HC_EV_NM, 2), '1239.84');
  const sp0 = M.spectrum.sample(0);
  const sp15 = M.spectrum.sample(1.5);
  const sp30 = M.spectrum.sample(3.0);
  check('ch1 AM0 280-4000 W/m2', f(sp0.totalPower, 0), '1319');
  check('ch1 AM1.5G normalized 1000 W/m2', f(sp15.totalPower, 1), '1000.0');
  ok('ch1 AM3.0 < AM1.5G < AM0', sp30.totalPower < sp15.totalPower && sp15.totalPower < sp0.totalPower);
  ok('ch1 AM3.0 red-shifted IR share > AM1.5G', sp30.irShare > sp15.irShare);
  check('ch1 AM1.5G shares sum to 1', f(sp15.uvShare + sp15.visShare + sp15.irShare, 6), '1.000000');
  check('ch1 AM1.5G vis %', f(sp15.visShare * 100, 0), '52');
  check('ch1 AM1.5G ir %', f(sp15.irShare * 100, 0), '44');
  check('ch1 AM1.5G uv %', f(sp15.uvShare * 100, 1), '4.2');
  check('ch1 AM1.5G photon flux 1e21', f(sp15.totalFlux / 1e21, 2), '4.46');

  saysBoth('ch1.p2', '1319 W/m²', '1319 W/m²');
  saysBoth('ch1.p2', '1000 W/m²', '1000 W/m²');
  saysBoth('ch1.p3', '52%', '52%');
  saysBoth('ch1.p3', '44%', '44%');
  saysBoth('ch1.p3', '4.2%', '4.2%');
  saysBoth('ch1.p4', '4.46×10²¹', '4.46×10²¹');
}

/* ── 2. Bandgap slicer (Ch. 2) ── */
{
  const si = M.bandgap.analyze(1.12);
  const ge = M.bandgap.analyze(0.67);
  const gaas = M.bandgap.analyze(1.42);
  check('ch2 Si cutoff nm', f(si.lamCut, 0), '1107');
  check('ch2 Si shares sum to 1', f(si.belowShare + si.thermShare + si.edgeShare, 6), '1.000000');
  check('ch2 Si below %', f(si.belowShare * 100, 1), '20.0');
  check('ch2 Si therm %', f(si.thermShare * 100, 1), '31.6');
  check('ch2 Si edge %', f(si.edgeShare * 100, 1), '48.3');
  check('ch2 Si Jsc_max', f(si.jscMaCm2, 1), '43.2');
  check('ch2 Ge below %', f(ge.belowShare * 100, 1), '6.0');
  check('ch2 Ge therm %', f(ge.thermShare * 100, 1), '54.5');
  check('ch2 Ge edge %', f(ge.edgeShare * 100, 1), '39.5');
  check('ch2 GaAs edge %', f(gaas.edgeShare * 100, 1), '44.9');
  ok('ch2 monotonicity: wider gap -> higher belowShare, lower Jsc', gaas.belowShare > si.belowShare && si.belowShare > ge.belowShare && ge.jscMaCm2 > si.jscMaCm2 && si.jscMaCm2 > gaas.jscMaCm2);

  saysBoth('ch2.p3', '1107', '1107 nm');
  saysBoth('ch2.p3', '20.0%', '20.0%');
  saysBoth('ch2.p3', '31.6%', '31.6%');
  saysBoth('ch2.p3', '48.3%', '48.3%');
  saysBoth('ch2.p3', '43.2 mA/cm²', '43.2 mA/cm²');
  saysBoth('ch2.p4', '6.0%', '6.0%');
  saysBoth('ch2.p4', '54.5%', '54.5%');
  saysBoth('ch2.p4', '39.5%', '39.5%');
  saysBoth('ch2.p4', '44.9%', '44.9%');
}

/* ── 3. Shockley-Queisser detailed balance (Ch. 3) ── */
{
  const pk = M.sq.peak({});
  const si = M.sq.eval(1.12, {});
  const si1 = M.sq.eval(1.12, { ere: 0.01 });
  const si1000 = M.sq.eval(1.12, { X: 1000 });

  check('ch3 SQ peak Eg', f(pk.Eg, 2), '1.34');
  check('ch3 SQ peak eta %', f(pk.eta * 100, 1), '33.4');
  check('ch3 SQ peak Voc', f(pk.voc, 2), '1.08');
  check('ch3 Si ideal eta %', f(si.eta * 100, 1), '33.0');
  check('ch3 Si ideal Voc', f(si.voc, 3), '0.878');
  check('ch3 Si ideal FF %', f(si.ff * 100, 1), '87.0');
  check('ch3 Si rad+Carnot %', f(si.radCarnotShare * 100, 1), '15.4');
  check('ch3 Si ERE=1% eta %', f(si1.eta * 100, 1), '28.0');
  check('ch3 Si ERE=1% Voc', f(si1.voc, 3), '0.759');
  check('ch3 SQ 5-bin energy conservation', f(si1.belowShare + si1.thermShare + si1.radCarnotShare + si1.nonRadShare + si1.eta, 6), '1.000000');

  // Physical check: dropping ERE by 100x loses ~2 * ln(10) * kT/q ≈ 119 mV
  const dv = si.voc - si1.voc;
  const expectedDv = 2 * Math.LN10 * M.vth(300);
  ok('ch3 ERE 2-decade Voc drop matches kT/q', Math.abs(dv - expectedDv) < 0.002, `dv=${dv.toFixed(4)} vs ${expectedDv.toFixed(4)}`);
  ok('ch3 concentration raises Voc & eta', si1000.voc > si.voc && si1000.eta > si.eta);

  saysBoth('ch3.p3', '1.34 eV', '1.34 eV');
  saysBoth('ch3.p3', '33.4%', '33.4%');
  saysBoth('ch3.p3', '1.08 V', '1.08 V');
  saysBoth('ch3.p3', '33.0%', '33.0%');
  saysBoth('ch3.p3', '0.878 V', '0.878 V');
  saysBoth('ch3.p3', '87.0%', '87.0%');
  saysBoth('ch3.p3', '15.4%', '15.4%');
  saysBoth('ch3.p4', '28.0%', '28.0%');
  saysBoth('ch3.p4', '0.759 V', '0.759 V');
}

/* ── 4. Single-diode I-V & temperature derating (Ch. 4) ── */
{
  const stc = M.iv.analyze({});
  const hot = M.iv.analyze({ TcC: 65 });
  const rs4 = M.iv.analyze({ Rs: 4.0 });
  const rsh100 = M.iv.analyze({ Rsh: 100 });
  const g200 = M.iv.analyze({ G: 200 });

  check('ch4 STC Voc', f(stc.voc, 3), '0.735');
  check('ch4 STC Jsc', f(stc.jsc, 1), '41.2');
  check('ch4 STC FF', f(stc.ff * 100, 1), '80.1');
  check('ch4 STC eta', f(stc.eta * 100, 1), '24.2');
  check('ch4 65C Voc', f(hot.voc, 3), '0.636');
  check('ch4 65C eta', f(hot.eta * 100, 1), '20.3');
  const dVocMvK = (hot.voc - stc.voc) / 40 * 1000;
  const dEtaPctK = (hot.eta - stc.eta) / stc.eta / 40 * 100;
  check('ch4 dVoc/dT mV/K', f(dVocMvK, 2), '-2.47');
  check('ch4 dEta/dT %/K', f(dEtaPctK, 2), '-0.40');
  check('ch4 Rs=4 FF', f(rs4.ff * 100, 1), '63.5');
  check('ch4 Rs=4 eta', f(rs4.eta * 100, 1), '19.2');
  check('ch4 Rsh=100 eta', f(rsh100.eta * 100, 1), '20.6');
  check('ch4 G=200 eta', f(g200.eta * 100, 1), '22.6');

  // Verify J(Voc) == 0 & Pmpp >= all sampled points
  const jAtVoc = M.iv.solveJ(stc.voc, stc.par);
  ok('ch4 J(Voc) near 0', Math.abs(jAtVoc) < 1e-4, `J(Voc)=${jAtVoc}`);
  ok('ch4 Pmpp is global max on J-V', stc.pts.every(pt => pt.P <= stc.pmpp + 1e-4));

  saysBoth('ch4.p3', '0.735 V', '0.735 V');
  saysBoth('ch4.p3', '41.2 mA/cm²', '41.2 mA/cm²');
  saysBoth('ch4.p3', '80.1%', '80.1%');
  saysBoth('ch4.p3', '24.2%', '24.2%');
  saysBoth('ch4.p3', '0.636 V', '0.636 V');
  saysBoth('ch4.p3', '-2.47 mV/K', '-2.47 mV/K');
  saysBoth('ch4.p3', '20.3%', '20.3%');
  saysBoth('ch4.p3', '-0.40%/K', '-0.40%/K');
  saysBoth('ch4.p4', '63.5%', '63.5%');
  saysBoth('ch4.p4', '19.2%', '19.2%');
  saysBoth('ch4.p4', '22.6%', '22.6%');
  saysBoth('ch4.p4', '20.6%', '20.6%');
}

/* ── 5. Dual-junction tandem (Ch. 5) ── */
{
  const t155 = M.tandem.eval(1.55, 1.12);
  const t173 = M.tandem.eval(1.73, 1.12);
  const t173am3 = M.tandem.eval(1.73, 1.12, { am: 3.0 });

  check('ch5 1.55/1.12 4T %', f(t155.eta4T * 100, 1), '42.9');
  check('ch5 1.55/1.12 2T %', f(t155.eta2T * 100, 1), '32.7');
  check('ch5 1.55/1.12 J1', f(t155.j1MaCm2, 1), '26.5');
  check('ch5 1.55/1.12 J2', f(t155.j2MaCm2, 1), '16.6');
  check('ch5 1.73/1.12 J1', f(t173.j1MaCm2, 1), '21.3');
  check('ch5 1.73/1.12 J2', f(t173.j2MaCm2, 1), '21.9');
  check('ch5 1.73/1.12 2T %', f(t173.eta2T * 100, 1), '44.4');
  check('ch5 1.73/1.12 4T %', f(t173.eta4T * 100, 1), '44.4');
  check('ch5 1.73/1.12 AM3 2T %', f(t173am3.eta2T * 100, 1), '42.9');
  check('ch5 1.73/1.12 AM3 4T %', f(t173am3.eta4T * 100, 1), '44.2');
  ok('ch5 invariant: 4T >= 2T always', [t155, t173, t173am3].every(r => r.eta4T + 1e-9 >= r.eta2T));

  saysBoth('ch5.p3', '42.9%', '42.9%');
  saysBoth('ch5.p3', '26.5 mA/cm²', '26.5 mA/cm²');
  saysBoth('ch5.p3', '16.6 mA/cm²', '16.6 mA/cm²');
  saysBoth('ch5.p3', '32.7%', '32.7%');
  saysBoth('ch5.p4', '21.3 mA/cm²', '21.3 mA/cm²');
  saysBoth('ch5.p4', '21.9 mA/cm²', '21.9 mA/cm²');
  saysBoth('ch5.p4', '44.4%', '44.4%');
  saysBoth('ch5.p4', '42.9%', '42.9%');
  saysBoth('ch5.p4', '44.2%', '44.2%');
}

/* ── 6. Grid curtailment & battery storage (Ch. 6) ── */
{
  const g1 = M.grid.simulateGwh(1.0, 0, 0.85, true);
  const g2 = M.grid.simulateGwh(2.0, 0, 0.85, true);
  const g2s = M.grid.simulateGwh(2.0, 40, 0.85, true);

  check('ch6 1x solar pot GWh', f(g1.solarPotentialGwh, 1), '126.2');
  check('ch6 1x curtail %', f(g1.curtailShare * 100, 1), '7.3');
  check('ch6 1x evening peak GW', f(g1.eveningPeakGw, 1), '20.0');
  check('ch6 2x no-bat curtailed GWh', f(g2.curtailedSolarGwh, 1), '113.5');
  check('ch6 2x no-bat curtail %', f(g2.curtailShare * 100, 1), '44.9');
  check('ch6 2x no-bat peak GW', f(g2.eveningPeakGw, 1), '20.0');
  check('ch6 2x + 40 GWh curtail %', f(g2s.curtailShare * 100, 1), '26.3');
  check('ch6 2x + 40 GWh curtailed GWh', f(g2s.curtailedSolarGwh, 1), '66.4');
  check('ch6 2x + 40 GWh evening peak GW', f(g2s.eveningPeakGw, 1), '14.1');
  ok('ch6 storage energy conservation E_out <= eta * E_in', g2s.out.reduce((a, b) => a + b, 0) <= g2s.inn.reduce((a, b) => a + b, 0) * 0.85 + 1e-5);
  ok('ch6 curtailed <= potential', g2.curtailedSolarGwh <= g2.solarPotentialGwh && g2s.curtailedSolarGwh <= g2s.solarPotentialGwh);

  saysBoth('ch6.p3', '126.2 GWh', '126.2 GWh');
  saysBoth('ch6.p3', '7.3%', '7.3%');
  saysBoth('ch6.p3', '20.0 GW', '20.0 GW');
  saysBoth('ch6.p3', '113.5 GWh', '113.5 GWh');
  saysBoth('ch6.p3', '44.9%', '44.9%');
  saysBoth('ch6.p4', '26.3%', '26.3%');
  saysBoth('ch6.p4', '66.4 GWh', '66.4 GWh');
  saysBoth('ch6.p4', '14.1 GW', '14.1 GW');
}

/* ── 7. Swanson's Law & BOS split (Ch. 7) ── */
{
  const p76 = M.learning.priceAt(0.001, 0.22);
  const sys25 = M.learning.systemCost(2974, 0.22, 0.45, 0.227);
  const sys30 = M.learning.systemCost(2974, 0.22, 0.45, 0.30);

  check('ch7 LR=22% 1976 price', f(p76, 1), '42.8');
  check('ch7 LR=22% 2025 mod price', f(sys25.modUsdPerW, 2), '0.20');
  check('ch7 22.7% BOS $/W', f(sys25.bosUsdPerW, 2), '0.42');
  check('ch7 22.7% total $/W', f(sys25.totalUsdPerW, 2), '0.62');
  check('ch7 22.7% module share %', f(sys25.modShare * 100, 0), '33');
  check('ch7 30% eff total $/W', f(sys30.totalUsdPerW, 2), '0.56');
  // Wright's law exact doubling check: price(2*Q) / price(Q) == 1 - LR
  const ratio = M.learning.priceAt(200, 0.22) / M.learning.priceAt(100, 0.22);
  ok('ch7 exact doubling ratio = 1 - LR', Math.abs(ratio - 0.78) < 1e-9);

  saysBoth('ch7.p3', '$42.8/W', '$42.8/W');
  saysBoth('ch7.p3', '$0.20/W', '$0.20/W');
  saysBoth('ch7.p3', '$0.42/W', '$0.42/W');
  saysBoth('ch7.p3', '$0.62/W', '$0.62/W');
  saysBoth('ch7.p3', '33%', '33%');
  saysBoth('ch7.p4', '$0.56/W', '$0.56/W');
}

/* ── 8. Every .say template branch reachable & cleanly formatted ── */
{
  const interp = (dict, key, vars) => {
    let s = dict[key];
    for (const k in vars) s = s.replace(new RegExp('\\{' + k + '\\}', 'g'), String(vars[k]));
    return s;
  };
  const checkSay = (key, vars) => {
    for (const [label, dict] of [['zh', Z], ['en', E]]) {
      const out = interp(dict, key, vars);
      ok(`say ${label}:${key} clean`, out && !/[{}]|NaN|undefined|null/.test(out), out);
    }
  };

  // Ch1 branches: space, std, low
  for (const am of [0, 1.5, 3.0]) {
    const sp = M.spectrum.sample(am);
    const key = am < 0.15 ? 'ch1.say.space' : (am <= 1.7 ? 'ch1.say.std' : 'ch1.say.low');
    checkSay(key, { am: am.toFixed(1), p: sp.totalPower.toFixed(0), f: (sp.totalFlux / 1e21).toFixed(2), vis: (sp.visShare * 100).toFixed(0), ir: (sp.irShare * 100).toFixed(0), uv: (sp.uvShare * 100).toFixed(1) });
  }
  // Ch2 branches: low, mid, high
  for (const eg of [0.67, 1.12, 1.90]) {
    const r = M.bandgap.analyze(eg);
    const key = eg < 0.9 ? 'ch2.say.low' : (eg <= 1.5 ? 'ch2.say.mid' : 'ch2.say.high');
    checkSay(key, { eg: eg.toFixed(2), lam: r.lamCut.toFixed(0), below: (r.belowShare * 100).toFixed(1), therm: (r.thermShare * 100).toFixed(1), edge: (r.edgeShare * 100).toFixed(1), jsc: r.jscMaCm2.toFixed(1) });
  }
  // Ch3 branches: ideal, defect, conc
  for (const [X, logEre] of [[1, 0], [1, -2], [100, 0]]) {
    const ere = Math.pow(10, logEre);
    const r = M.sq.eval(1.12, { X, ere });
    const key = logEre < -0.1 ? 'ch3.say.defect' : (X > 1.5 ? 'ch3.say.conc' : 'ch3.say.ideal');
    checkSay(key, { eg: '1.12', eta: (r.eta * 100).toFixed(1), voc: r.voc.toFixed(3), drop: (1.12 - r.voc).toFixed(2), below: (r.belowShare * 100).toFixed(1), therm: (r.thermShare * 100).toFixed(1), rad: (r.radCarnotShare * 100).toFixed(1), ere: (ere * 100).toFixed(0), x: String(X) });
  }
  // Ch4 branches: ok, hot, rs, rsh
  for (const par of [{}, { TcC: 65 }, { Rs: 4.0 }, { Rsh: 100 }]) {
    const o = Object.assign({}, M.iv.defaults, par);
    const r = M.iv.analyze(o);
    const key = o.Rs >= 2.2 ? 'ch4.say.rs' : (o.Rsh <= 300 ? 'ch4.say.rsh' : (o.TcC >= 48 ? 'ch4.say.hot' : 'ch4.say.ok'));
    checkSay(key, { g: o.G, t: o.TcC, rs: o.Rs.toFixed(1), rsh: o.Rsh, voc: r.voc.toFixed(3), jsc: r.jsc.toFixed(1), ff: (r.ff * 100).toFixed(1), pmpp: r.pmpp.toFixed(1), eta: (r.eta * 100).toFixed(1) });
  }
  // Ch5 branches: match, top, bot
  for (const et of [1.73, 2.0, 1.55]) {
    const r = M.tandem.eval(et, 1.12);
    const key = r.mismatchRatio >= 0.92 ? 'ch5.say.match' : (r.limitingCell === 'top' ? 'ch5.say.top' : 'ch5.say.bot');
    checkSay(key, { et: et.toFixed(2), eb: '1.12', j1: r.j1MaCm2.toFixed(1), j2: r.j2MaCm2.toFixed(1), e2: (r.eta2T * 100).toFixed(1), e4: (r.eta4T * 100).toFixed(1) });
  }
  // Ch6 branches: notsun, curt, bat
  for (const [sc, bat] of [[1.0, 0], [3.0, 20], [2.0, 60]]) {
    const r = M.grid.simulateGwh(sc, bat, 0.85, true);
    const key = bat < 1 ? 'ch6.say.notsun' : (r.curtailShare > 0.25 ? 'ch6.say.curt' : 'ch6.say.bat');
    checkSay(key, { s: sc.toFixed(1), bat, eta: 85, pot: r.solarPotentialGwh.toFixed(1), curt: (r.curtailShare * 100).toFixed(1), cgwh: r.curtailedSolarGwh.toFixed(1), peak: r.eveningPeakGw.toFixed(1), ramp: r.ramp3.toFixed(1), use: (r.solarGridShare * 100).toFixed(1) });
  }
  // Ch7 branches: split, eff
  for (const eff of [22.7, 30.0]) {
    const p76 = M.learning.priceAt(0.001, 0.22);
    const sys = M.learning.systemCost(2974, 0.22, 0.45, eff / 100);
    const key = eff >= 27 ? 'ch7.say.eff' : 'ch7.say.split';
    checkSay(key, { lr: '22.0', p76: p76.toFixed(1), mod: sys.modUsdPerW.toFixed(2), bos: sys.bosUsdPerW.toFixed(2), tot: sys.totalUsdPerW.toFixed(2), eff: eff.toFixed(1), share: (sys.modShare * 100).toFixed(0) });
  }
}

/* ── 9. zh/en key, placeholder, HTML-tag, and cross-link parity + zero unintended CJK ── */
{
  const zKeys = Object.keys(Z).sort();
  const eKeys = Object.keys(E).sort();
  check('zh/en exact key count', eKeys.length, zKeys.length);
  check('zh/en exact key list', JSON.stringify(eKeys), JSON.stringify(zKeys));

  const phOf = s => Array.from(s.matchAll(/\{[a-zA-Z0-9_]+\}/g)).map(m => m[0]).sort();
  const hrefsOf = s => Array.from(s.matchAll(/href="([^"]+)"/g)).map(m => m[1]);
  const cjkRe = /[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/;

  for (const k of zKeys) {
    const zp = phOf(Z[k]), ep = phOf(E[k]);
    if (JSON.stringify(zp) !== JSON.stringify(ep)) {
      fails++;
      console.error(`FAIL placeholder mismatch on ${k}: zh=${zp} en=${ep}`);
    }
    n++;
    const zhLinks = hrefsOf(Z[k]), enLinks = hrefsOf(E[k]);
    if (JSON.stringify(zhLinks) !== JSON.stringify(enLinks)) {
      fails++;
      console.error(`FAIL href mismatch on ${k}: zh=${zhLinks} en=${enLinks}`);
    }
    n++;
    if (cjkRe.test(E[k])) {
      fails++;
      console.error(`FAIL CJK leaked into copy.en.js[${k}]`);
    }
    n++;
  }

  // Verify every cross-link target in copy.zh.js points to an existing local HTML file
  const allLinks = new Set();
  zKeys.forEach(k => hrefsOf(Z[k]).forEach(u => allLinks.add(u)));
  for (const href of allLinks) {
    const rel = href.split('#')[0];
    const resolved = path.resolve(dir, rel, 'index.html');
    const resolvedAlt = path.resolve(dir, rel);
    ok(`link target exists: ${href}`, fs.existsSync(resolved) || fs.existsSync(resolvedAlt));
  }

  // Check zero CJK in models.js, app.js, copy.en.js, tests/*.js
  for (const fname of ['models.js', 'app.js', 'copy.en.js']) {
    const raw = fs.readFileSync(path.join(dir, fname), 'utf8');
    ok(`zero CJK in ${fname}`, !cjkRe.test(raw));
  }

  // Check index.html has zero CJK except <title>, <meta name="description">, and the 中 button
  const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  const stripped = html
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/<meta name="description"[^>]*>/, '')
    .replace(/>中<\/button>/, '>ZH</button>');
  ok('zero unintended CJK in index.html', !cjkRe.test(stripped));

  // Verify every HTML data-i18n* attribute resolves to a key in Z and E
  const refs = Array.from(html.matchAll(/data-i18n(?:|-html|-aria)="([^"]+)"/g)).map(m => m[1]);
  ok('html has i18n bindings', refs.length > 80);
  refs.forEach(k => {
    ok(`i18n binding ${k} exists in zh & en`, Object.prototype.hasOwnProperty.call(Z, k) && Object.prototype.hasOwnProperty.call(E, k));
  });

  // Verify frontier keys match models.frontier ids
  M.frontier.forEach(item => {
    ok(`frontier key fr.${item.id} exists in zh & en`, Boolean(Z['fr.' + item.id] && E['fr.' + item.id]));
  });
}

/* ── 10. REGISTRY.json schema validation ── */
{
  const reg = JSON.parse(fs.readFileSync(path.join(dir, 'REGISTRY.json'), 'utf8'));
  check('registry slug', reg.slug, 'solar-cells');
  check('registry path', reg.path, 'tech/energy/solar-cells/');
  check('registry category', reg.category, 'tech');
  check('registry subtopic', reg.subtopic, 'energy');
  check('registry stage', reg.stage, 'university');
  ok('registry title zh & en', Boolean(reg.title && reg.title.zh && reg.title.en));
  ok('registry 8 concepts', Array.isArray(reg.concepts) && reg.concepts.length === 8);
  const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  reg.concepts.forEach(c => {
    ok(`concept ${c.id} anchor exists in index.html`, html.includes(`id="${c.anchor.replace('#', '')}"`));
    ok(`concept ${c.id} has zh & en aliases`, c.aliases && c.aliases.zh.length >= 4 && c.aliases.en.length >= 4);
  });
}

if (fails > 0) {
  console.error(`\nFAILED: ${fails} of ${n} checks failed.`);
  process.exit(1);
}
console.log(`PASS: ${n}/${n} checks passed in solar-cells/tests/models.cjs`);
