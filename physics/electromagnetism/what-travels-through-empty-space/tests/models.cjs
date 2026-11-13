'use strict';
// Pins every quantitative claim in copy.zh.js prose to models.js, validates the 1-D Yee FDTD solver
// (speed, energy conservation, normal-incidence Fresnel R/T, Courant instability), and checks REGISTRY.json anchors.
// Run: node physics/electromagnetism/what-travels-through-empty-space/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const dir = path.join(__dirname, '..');
const M = require(path.join(dir, 'models.js'));
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(dir, 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const reg = JSON.parse(fs.readFileSync(path.join(dir, 'REGISTRY.json'), 'utf8'));

let n = 0, fails = 0;
function check(name, got, want) {
  n++;
  if (got !== want) { fails++; console.error(`FAIL ${name}: got "${got}", expected "${want}"`); }
}
function checkTrue(name, cond, msg = '') {
  n++;
  if (!cond) { fails++; console.error(`FAIL ${name}: ${msg}`); }
}
function says(key, phrase) {
  n++;
  if (!Z[key] || !Z[key].includes(phrase)) {
    fails++;
    console.error(`FAIL prose ${key} should contain "${phrase}"`);
  }
}
const f = (x, d) => x.toFixed(d);

/* ── 0. Constants & Hero ── */
checkTrue('Maxwell c = 1/sqrt(mu0*eps0)', Math.abs(M.CONST.cFromMaxwell - M.CONST.c) / M.CONST.c < 1e-9);
says('hero.lead', '299,792,458 米');

/* ── 1. Delayed field kink ── */
{
  const r = M.ch1.fieldsAt(10, 0.20, 1.0, Math.PI / 2);
  check('ch1 ratio at r=10 beta=0.20', f(r.ratio, 1), '2.0');
  says('ch1.p3', '2.0 倍');
  const f1 = M.ch1.fieldsAt(1, 0.20, 1.0, Math.PI / 2);
  const f2 = M.ch1.fieldsAt(2, 0.20, 1.0, Math.PI / 2);
  check('ch1 Er falls 1/r^2', f(f2.Er / f1.Er, 3), '0.250');
  check('ch1 Eperp falls 1/r', f(f2.Eperp / f1.Eperp, 3), '0.500');
}

/* ── 2. Displacement current & Faraday feedback ── */
{
  const m10 = M.ch2.compute(10, 5, 1);
  check('ch2 C = 13.9 pF', f(m10.C_pF, 1), '13.9'); says('ch2.p3', '13.9 pF');
  check('ch2 10 MHz I_c = I_d = 0.087 A', f(m10.IcondPeak, 3), '0.087');
  check('ch2 I_c === I_d exact', m10.IcondPeak, m10.IdispPeak);
  says('ch2.p3', '0.087 A');
  check('ch2 10 MHz faradayPct = 0.003%', f(m10.faradayPct, 3), '0.003'); says('ch2.p3', '0.003%');

  const m1000 = M.ch2.compute(1000, 5, 1);
  check('ch2 1000 MHz lambda = 0.30 m', f(m1000.lambdaM, 2), '0.30'); says('ch2.p3', '0.30 m');
  check('ch2 1000 MHz I = 8.74 A', f(m1000.IcondPeak, 2), '8.74'); says('ch2.p3', '8.74 A');
  check('ch2 1000 MHz faradayPct = 27.5%', f(m1000.faradayPct, 1), '27.5'); says('ch2.p3', '27.5%');
}

/* ── 3. 1-D Yee FDTD validation (speed, energy conservation, Fresnel, Courant) ── */
{
  // (a) Vacuum speed at magic time step S = 1.00
  const vac = M.ch3.create({ n: 1.0, S: 1.0, mode: 'pulse', i0: 50 });
  M.ch3.step(vac, 100);
  let pkI = 0, pkE = 0;
  for (let i = 0; i < vac.N; i++) if (vac.E[i] > pkE) { pkE = vac.E[i]; pkI = i; }
  check('FDTD vacuum peak advances 100 cells in 100 steps', pkI, 150);
  check('FDTD vacuum dispersionless amplitude at S=1', f(pkE, 5), '1.00000');
  check('FDTD vacuum energy conserved', f(M.ch3.energy(vac) / vac.initEnergy, 6), '1.000000');

  // (b) Dielectric slab n = 1.5 normal-incidence Fresnel R, T & energy conservation
  const fr = M.ch3.fresnel(1.5);
  check('ch3 Fresnel R n=1.5', f(fr.R * 100, 1), '4.0'); says('ch3.p3', '4.0%');
  check('ch3 Fresnel T n=1.5', f(fr.T * 100, 1), '96.0'); says('ch3.p3', '96.0%');
  check('ch3 speed in n=1.5', f(fr.speedFrac, 3), '0.667'); says('ch3.p3', '0.667 c');

  const sl = M.ch3.create({ n: 1.5, S: 0.98, mode: 'pulse', i0: 55 });
  M.ch3.step(sl, 130);
  const meas = M.ch3.measureSplit(sl);
  checkTrue('FDTD energy conservation across interface (<0.01% err)', Math.abs(meas.energyRatio - 1) < 1e-4, `got ${meas.energyRatio}`);
  checkTrue('FDTD measured R matches Fresnel (<0.5% abs)', Math.abs(meas.R_meas - fr.R) < 0.005, `meas=${meas.R_meas}, fr=${fr.R}`);
  checkTrue('FDTD measured T matches Fresnel (<0.5% abs)', Math.abs(meas.T_meas - fr.T) < 0.005, `meas=${meas.T_meas}, fr=${fr.T}`);

  // (c) Dielectric slab n = 2.0 speed & Fresnel check
  const fr2 = M.ch3.fresnel(2.0);
  const sl2 = M.ch3.create({ n: 2.0, S: 0.95, mode: 'pulse', i0: 55 });
  M.ch3.step(sl2, 130);
  const meas2 = M.ch3.measureSplit(sl2);
  checkTrue('FDTD n=2.0 energy conservation (<0.01% err)', Math.abs(meas2.energyRatio - 1) < 1e-4);
  checkTrue('FDTD n=2.0 R matches Fresnel 11.1% (<0.6% abs)', Math.abs(meas2.R_meas - fr2.R) < 0.006, `meas=${meas2.R_meas}, fr=${fr2.R}`);

  // (d) Courant stability check: S = 1.00 stable vs S = 1.04 unstable blow-up
  const stab = M.ch3.create({ n: 1.0, S: 1.00, mode: 'pulse', i0: 55 });
  M.ch3.step(stab, 80);
  checkTrue('FDTD S=1.00 bounded', M.ch3.peakAbsE(stab) <= 1.01);

  const bad = M.ch3.create({ n: 1.0, S: 1.04, mode: 'pulse', i0: 55 });
  M.ch3.step(bad, 120);
  checkTrue('FDTD S=1.04 blows up exponentially', M.ch3.peakAbsE(bad) > 1e6, `got ${M.ch3.peakAbsE(bad)}`);
}

/* ── 4. Dipole radiation ── */
{
  const d01 = M.ch4.dipoleMetrics(0.10);
  check('ch4 0.1 lambda R_rad_max = 0.19', f(d01.RradMax, 2), '0.19'); says('ch4.p3', '0.19 Ω');
  const d05 = M.ch4.dipoleMetrics(0.50);
  check('ch4 0.5 lambda R_rad = 73.1', f(d05.RradMax, 1), '73.1'); says('ch4.p3', '73.1 Ω');
  check('ch4 0.5 lambda D = 1.64', f(d05.D, 2), '1.64'); says('ch4.p3', '1.64');
  check('ch4 0.5 lambda dBi = 2.15', f(d05.dBi, 2), '2.15'); says('ch4.p3', '2.15 dBi');
  check('ch4 0.5 lambda HPBW = 78.5', f(d05.hpbwDeg, 1), '78.5'); says('ch4.p3', '78.5°');
  const d10 = M.ch4.dipoleMetrics(1.00);
  check('ch4 1.0 lambda HPBW = 48.0', f(d10.hpbwDeg, 0), '48'); says('ch4.note.full', '48°');
  check('ch4 Rayleigh f^4 ratio 450 vs 700 nm > 5.8', M.ch4.rayleighRatio(450, 700) > 5.8, true);
}

/* ── 5. Poynting flux, solar sail, 3-polariser Malus ── */
{
  const sAbs = M.ch5.poyntingSail(1.0, 0.0);
  check('ch5 1 AU S = 1361', f(sAbs.S, 0), '1361'); says('ch5.p1', '1361 W/m²');
  check('ch5 1 AU Erms = 716', f(sAbs.Erms, 0), '716'); says('ch5.p1', '716 V/m');
  check('ch5 1 AU black pressure = 4.54 uPa', f(sAbs.pressure_uPa, 2), '4.54'); says('ch5.p3', '4.54 μPa');
  const sRef = M.ch5.poyntingSail(1.0, 1.0);
  check('ch5 1 AU mirror pressure = 9.08 uPa', f(sRef.pressure_uPa, 2), '9.08'); says('ch5.p3', '9.08 μPa');
  check('ch5 1 AU force = 0.091 N', f(sRef.forceN, 3), '0.091'); says('ch5.p3', '0.091 N');
  check('ch5 1 AU dv/day = 156.9 m/s', f(sRef.dvPerDayMs, 1), '156.9'); says('ch5.p3', '156.9 m/s');

  const mOff = M.ch5.malusThree(45, false);
  check('ch5 no middle polariser = 0%', mOff.pctOut, 0);
  const m45 = M.ch5.malusThree(45, true);
  check('ch5 3 polarisers 45 deg = 12.5%', f(m45.pctOut, 1), '12.5'); says('ch5.p4', '12.5%');
}

/* ── 6. Spectrum, classical-to-photon boundary, water Debye ── */
{
  const th = M.ch6.inspect(Math.log10(M.CONST.kB * 300 / M.CONST.h));
  check('ch6 k_B T (300 K) = 0.0259 eV', f(th.kBT_eV, 4), '0.0259'); says('ch6.p2', '0.0259 eV');
  check('ch6 crossover freq = 6.25 THz', f(th.f / 1e12, 2), '6.25'); says('ch6.p2', '6.25 THz');

  const euv = M.ch6.inspect(Math.log10(M.ch6.PRESETS.euv));
  check('ch6 EUV 13.5 nm = 91.8 eV', f(euv.E_eV, 1), '91.8'); says('ch6.p4', '91.8 eV');
  checkTrue('ch6 EUV is ionising', euv.ionising);

  const ph = M.ch6.inspect(Math.log10(M.ch6.PRESETS.phone));
  check('ch6 1.8 GHz = 7.4 ueV', f(ph.E_eV * 1e6, 1), '7.4'); says('ch6.p4', '7.4 μeV');
  checkTrue('ch6 1.8 GHz non-ionising', !ph.ionising);

  const wOven = M.ch6.waterDebye(2.45);
  const wPeak = M.ch6.waterDebye(19.6);
  check('ch6 2.45 GHz water depth = 1.9 cm', f(wOven.depthCm, 1), '1.9'); says('ch6.p3', '1.9 cm');
  check('ch6 19.6 GHz peak depth = 0.46 mm', f(wPeak.depthCm * 10, 2), '0.46'); says('ch6.p3', '0.46 mm');
  checkTrue('ch6 19.6 GHz loss > 2.45 GHz loss', wPeak.epsDoublePrime > wOven.epsDoublePrime * 3);
  says('ch6.p5', '2.0 W/kg');
}

/* ── 7. Atmospheric windows ── */
{
  const t10 = M.ch7.zenithTransmission(Math.log10(10e9), 7.5, 7);
  checkTrue('ch7 10 GHz open window > 99%', t10 > 0.99, `got ${t10}`);
  says('ch7.p2', '超过 <strong>99%');
  const t60 = M.ch7.zenithTransmission(Math.log10(60e9), 7.5, 7);
  check('ch7 60 GHz O2 wall ~ 4%', f(t60 * 100, 0), '4'); says('ch7.p2', '约 <strong>4%');
  const tUV = M.ch7.zenithTransmission(Math.log10(M.CONST.c / 250e-9), 7.5, 7);
  checkTrue('ch7 250 nm blocked by ozone (< 0.01%)', tUV < 1e-4, `got ${tUV}`);
  const tIono = M.ch7.zenithTransmission(Math.log10(5e6), 7.5, 7);
  checkTrue('ch7 5 MHz reflected below 7 MHz foF2 (< 5%)', tIono < 0.05);
}

/* ── 8. Friis link budget ── */
{
  const gps = M.ch8.friis(M.ch8.PRESETS.gps);
  check('ch8 GPS Prx = -127.2 dBm', f(gps.prxDbm, 1), '-127.2'); says('ch8.p3', '−127.2 dBm');
  check('ch8 GPS SNR = -18.3 dB', f(-gps.snrDb, 1), '18.3'); says('ch8.p3', '18.3 dB');

  const voy = M.ch8.friis(M.ch8.PRESETS.voyager);
  check('ch8 Voyager FSPL = 319.2 dB', f(voy.fsplDb, 1), '319.2'); says('ch8.p3', '319.2 dB');
  check('ch8 Voyager SNR = +8.4 dB', f(voy.snrDb, 1), '8.4'); says('ch8.p3', '+8.4 dB');
  check('ch8 Voyager 22.4 W = 43.5 dBm', f(M.ch8.PRESETS.voyager.txPowerDbm, 1), '43.5'); says('ch8.p3', '43.5 dBm');
  checkTrue('ch8 Voyager light time ~ 24 h (1 light-day)', Math.abs(voy.lightTimeS / 3600 - 24) < 0.5);
}

/* ── 9. Optical fibre, diffraction & phased array ── */
{
  check('ch9 critical angle = 85.13 deg', f(M.ch9.criticalAngleDeg(), 2), '85.13'); says('ch9.p1', '85.13°');
  check('ch9 NA = 0.125', f(M.ch9.numericalAperture(), 3), '0.125'); says('ch9.p1', '0.125');
  const loss1550 = M.ch9.fibreLossDbKm(1550);
  checkTrue('ch9 1550 nm loss near 0.18-0.19 dB/km', loss1550 > 0.17 && loss1550 < 0.20, `got ${loss1550}`);
  checkTrue('ch9 1550 nm < 1310 nm < 850 nm', M.ch9.fibreLossDbKm(1550) < M.ch9.fibreLossDbKm(1310) && M.ch9.fibreLossDbKm(1310) < M.ch9.fibreLossDbKm(850));

  const dDsn = M.ch9.diffractionLimit(M.CONST.c / 8.415e9, 70);
  check('ch9 DSN 70m beam = 0.036 deg', f(dDsn.thetaDeg, 3), '0.036'); says('ch9.p2', '0.036°');
  const dJwst = M.ch9.diffractionLimit(2e-6, 6.5);
  check('ch9 JWST 2um = 0.077 arcsec', f(dJwst.thetaArcsec, 3), '0.077'); says('ch9.p2', '0.077 角秒');

  const safeArr = M.ch9.phasedArrayStats(8, 0.50, 25);
  checkTrue('ch9 d=0.50 lambda has no grating lobe', !safeArr.hasGratingLobe);
  const grateArr = M.ch9.phasedArrayStats(8, 0.70, 45);
  checkTrue('ch9 d=0.70 lambda @ 45 deg produces grating lobe', grateArr.hasGratingLobe);
}

/* ── 10. Frontier block & REGISTRY anchors ── */
{
  const sp = M.ch10.fibreSpeedVsGlass();
  check('ch10 hollow-core speed saving ~32%', f(sp.savingPct, 0), '32'); says('ch10.say.fibre', '32%');
  check('ch10 hollow-core 0.091 dB/km', f(M.FRONTIER.fibre.hollowCoreRecordDbKm, 3), '0.091'); says('ch10.say.fibre', '0.091 dB/km');
  check('ch10 NICT 450 Tbps', M.FRONTIER.fibre.nictLegacyFieldTbps, 450); says('ch10.say.fibre', '450 Tbps');
  check('ch10 NICT 1.02 Pbps', f(M.FRONTIER.fibre.nictMultiCorePbps, 2), '1.02'); says('ch10.say.fibre', '1.02 Pbps');
  check('ch10 DSOC 267 Mbps', M.FRONTIER.fso.dsocPeakMbps, 267); says('ch10.say.space', '267 Mbps');
  check('ch10 EUV 8 nm', M.FRONTIER.shortWave.euvHalfPitchNm, 8); says('ch10.say.short', '8 nm');

  // Verify every REGISTRY.json anchor exists in index.html & matches doc.title/desc
  check('REGISTRY title matches doc.title', reg.title.zh, Z['doc.title'].replace(/ · 一篇可以动手的长文$/, ''));
  for (const c of reg.concepts) {
    const id = c.anchor.replace(/^#/, '');
    checkTrue(`REGISTRY anchor ${c.anchor} exists in index.html`, html.includes(`id="${id}"`), `missing id="${id}"`);
  }
}

/* ── 11. Live sentence templates evaluated at control extremes ── */
{
  const fill = (k, vars) => {
    let s = Z[k] || '';
    for (const [vk, vv] of Object.entries(vars)) s = s.replace(new RegExp(`\\{${vk}\\}`, 'g'), String(vv));
    checkTrue(`sentence ${k} has no leftover placeholders`, !/\{\w+\}/.test(s), s);
    checkTrue(`sentence ${k} is non-empty`, s.length > 10, s);
  };
  fill('ch1.say.causal', { r: '10.0', ratio: '2.00' });
  fill('ch1.say.instant', { r: '10.0', ratio: '0.00' });
  fill('ch2.say.quasi', { c: '13.9', ic: '0.087', b: '0.35', kr: '0.010', far: '0.003', f: '10' });
  fill('ch2.say.wave', { c: '13.9', ic: '8.739', b: '34.95', kr: '1.048', far: '27.5', f: '1000' });
  fill('ch3.say.unstable', { s: '1.04', pk: '1.2e6' });
  fill('ch3.say.cw', { n: '1.5', v: '0.667', rth: '4.0' });
  fill('ch3.say.pulse', { n: '1.5', rth: '4.0', tth: '96.0', rm: '4.0', tm: '96.0', v: '0.667', u: '1.0000' });
  fill('ch4.say.main', { l: '0.50', r: '73.1', d: '1.64', dbi: '2.15', bw: '78.5', ang: '90', rel: '100.0', note: Z['ch4.note.half'] });
  fill('ch5.say.all', { au: '1.0', r: '1.00', s: '1361', p: '9.08', dv: '156.9', polmsg: Z['ch5.pol.off'] });
  fill('ch5.pol.on', { ang: '45', i2: '25.0', i3: '12.5' });
  fill('ch6.say.body', { f: '2.45 GHz', lam: '12.2 cm', band: Z['ch6.band.mw'], e: '10.1 μeV', kt: '3.9e-4', regime: Z['ch6.reg.class'] });
  fill('ch7.say.body', { f: '10.0 GHz', lam: '3.00 cm', rho: '7.5', t: '99.6', db: '0.02', why: Z['ch7.why.open'] });
  fill('ch8.say.body', { name: Z['ch8.pre.voy'], f: '8.42 GHz', d: '173.0 AU', lt: '24.0 h', fspl: '319.2', prx: '-155.1', pw: '3.1e-19', snr: '8.4', note: Z['ch8.note.voyager'] });
  fill('ch9.say.body', { n: '8', th: '25', bw: '14.0', gmsg: Z['ch9.say.gsafe'].replace('{d}', '0.50'), lam: '1550', loss: '0.188', rem: '64.9' });
  fill('ch9.say.gwarn', { d: '0.80' });
  for (const k of ['ch10.say.fibre', 'ch10.say.space', 'ch10.say.short']) checkTrue(`ch10 ${k} present`, Z[k] && Z[k].length > 50);
}

console.log(`Checked ${n} assertions across models, FDTD, prose, and REGISTRY; ${fails} failed.`);
if (fails) process.exit(1);
