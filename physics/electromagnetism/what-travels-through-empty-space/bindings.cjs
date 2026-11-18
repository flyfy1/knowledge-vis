// Numbers in the prose and on the diagrams, computed from models.js at build time ({=name} in content.*.md).
// Language-neutral: digits and SI symbols only, so the same string goes into both languages.
// tests/models.cjs re-derives the key ones independently.
module.exports = M => {
  const b = {};
  const f = M.fmt, sig = M.sig, pct = (x, d) => f(x * 100, d) + '%';

  /* ch1 */
  b['ch1.eps0'] = M.sci(M.EPS0, 3);
  b['ch1.mu0'] = M.sci(M.MU0, 3);

  /* ch2 */
  const cap = M.capacitor(M.LAB.cap);
  b['ch2.V'] = f(M.LAB.cap.V, 0); b['ch2.R'] = f(M.LAB.cap.R, 0);
  b['ch2.C'] = f(cap.C * 1e12, 1); b['ch2.tau'] = f(cap.tau * 1e9, 1);
  b['ch2.I0'] = f(cap.I(0) * 1e3, 0); b['ch2.B0'] = f(cap.Bgap(0, M.LAB.cap.a) * 1e9, 0);

  /* ch3 */
  b['ch3.c'] = f(M.C0, 0); b['ch3.cCalc'] = f(M.cFromFields(), 0);
  const v05 = M.measureSpeed(0.5).v;
  b['ch3.v05'] = f(v05, 0); b['ch3.err05'] = pct(1 - v05 / M.cFromFields(), 2);
  b['ch3.blow'] = f(M.stabilityRun(1.05, 2000, { N: M.LAB.fdtd.N, width: M.LAB.fdtd.width }).blownAt, 0);
  b['ch3.cells'] = f(M.LAB.fdtd.N, 0); b['ch3.width'] = f(2 * M.LAB.fdtd.width * M.LAB.fdtd.dx * 1e3, 0);

  /* ch4 */
  b['ch4.Rglass'] = pct(M.fresnel(1, 1.5).R, 0); b['ch4.RglassSim'] = pct(M.fresnelRun(1, 1.5).R, 2);
  b['ch4.Rwater'] = pct(M.fresnel(1, 1.33).R, 1); b['ch4.Rdiamond'] = pct(M.fresnel(1, 2.42).R, 0);
  const fr = M.fresnel(1, 1.5);
  b['dg.if.r'] = f(fr.r, 1); b['dg.if.rabs'] = f(-fr.r, 1); b['dg.if.t'] = f(fr.t, 1); b['dg.if.R'] = pct(fr.R, 0); b['dg.if.T'] = pct(fr.T, 0);

  /* ch5 */
  const half = M.dipole(0.5);
  b['ch5.atom'] = M.sci(M.classicalAtomLifetime(), 1);
  b['ch5.Dhalf'] = f(half.D, 2); b['ch5.dBi'] = f(half.dBi, 2); b['ch5.R'] = f(half.Rin, 1);
  b['ch5.fmHalf'] = f(M.C0 / 100e6 / 2, 2); b['ch5.wifiHalf'] = f(M.C0 / M.SRC.oven / 2 * 100, 1);

  /* ch6 */
  const sun = M.sunlight(1);
  b['ch6.I'] = f(sun.I, 0); b['ch6.Erms'] = f(sun.Erms, 0); b['ch6.Bpk'] = f(sun.Bpk * 1e6, 2);
  b['ch6.p'] = f(sun.pAbs * 1e6, 2); b['ch6.sail'] = f(sun.pRef * 1e6, 2);
  b['ch6.mars'] = f(M.sunlight(M.PLANETS.mars).I, 0); b['ch6.jup'] = f(M.sunlight(M.PLANETS.jupiter).I, 1);
  b['ch6.voy'] = f(M.sunlight(M.FRONTIER.voyager.au).I, 3);
  b['ch6.p3'] = pct(M.crossedStack(3).out, 1); b['ch6.p9'] = pct(M.crossedStack(9).out, 1);
  const st = M.crossedStack(1, 45).I;
  st.forEach((v, i) => { b['dg.pol.i' + i] = +(v * 100).toFixed(1) + '%'; });

  /* ch7 */
  const oven = M.photon(M.SRC.oven), w = M.water(M.SRC.oven), wp = M.water(w.fPeak);
  b['ch7.ionLam'] = f(M.H * M.C0 / (M.ION_EV * M.QE) * 1e9, 0);
  b['ch7.ovenEv'] = M.sci(oven.eV, 1); b['ch7.ionRatio'] = sig(M.ION_EV / oven.eV, 2);
  b['ch7.body'] = f(M.wienPeak(310) * 1e6, 1);
  b['ch7.fPeak'] = f(w.fPeak / 1e9, 1); b['ch7.depth'] = f(w.depth * 100, 1); b['ch7.depthPeak'] = f(wp.depth * 1e3, 2);
  b['ch7.e2oven'] = f(w.e2, 1); b['ch7.e2peak'] = f(wp.e2, 1);
  b['ch7.sarW'] = String(M.SRC.icnirp.wholeBody); b['ch7.sarI'] = String(M.SRC.icnirp.headTorso); b['ch7.sarF'] = String(M.SRC.fcc.local);

  /* ch8 */
  const g = x => M.seaLevel(x).total;
  b['ch8.g2'] = f(g(2.45), 3); b['ch8.g28'] = f(g(28), 2); b['ch8.g60'] = f(g(60), 1); b['ch8.t60'] = pct(M.undB(-g(60)), 1);
  b['ch8.g94'] = f(g(94), 1); b['ch8.g140'] = f(g(140), 1); b['ch8.g300'] = f(g(300), 1);
  b['ch8.z60'] = f(M.zenith(60), 0); b['ch8.z10'] = f(M.zenith(10), 2); b['ch8.z10pct'] = pct(M.undB(-M.zenith(10)), 1);

  /* ch9 */
  const wifi = M.link('wifi'), gps = M.link('gps'), voy = M.link('voyager');
  b['ch9.bits4096'] = f(Math.log2(M.FRONTIER.wifi7.qam), 0);
  b['ch9.fmBw'] = f(2 * (75 + 15), 0);
  b['ch9.dbl'] = f(M.dB(4), 0);
  b['ch9.wifiFs'] = f(wifi.fsplDb, 0); b['ch9.gpsFs'] = f(gps.fsplDb, 0); b['ch9.voyFs'] = f(voy.fsplDb, 0);
  b['ch9.voyMinusWifi'] = f(voy.fsplDb - wifi.fsplDb, 0);
  b['ch9.voyGt'] = f(M.dB(M.LINKS.voyager.Gt), 0); b['ch9.voyGr'] = f(M.dB(M.LINKS.voyager.Gr), 0);
  b['ch9.voyGain'] = f(M.dB(M.LINKS.voyager.Gt * M.LINKS.voyager.Gr), 0);
  b['ch9.voyPr'] = M.sci(voy.Pr, 1); b['ch9.voyPt'] = String(M.SRC.voyager.Pt);

  /* ch10 */
  const fg = M.fibreGuide(), fm = M.fibreMin(), s80 = M.fibreSpan(1.55, 80);
  b['dg.fib.n1'] = f(fg.n1, 3); b['dg.fib.n2'] = f(fg.n2, 3); b['dg.fib.crit'] = f(fg.crit, 1); b['dg.fib.acc'] = f(fg.accept, 1);
  b['ch10.crit'] = f(fg.crit, 1); b['ch10.acc'] = f(fg.accept, 1); b['ch10.vfrac'] = pct(fg.vFrac, 0); b['ch10.us'] = f(fg.usPerKm, 1);
  b['ch10.minLam'] = String(Math.round(fm.lam * 100) * 10);
  b['ch10.a850'] = f(M.fibreLoss(0.85).total, 1); b['ch10.a1310'] = f(M.fibreLoss(1.31).total, 2); b['ch10.a1550'] = f(M.fibreLoss(1.55).total, 2);
  b['ch10.half'] = f(s80.halfKm, 0); b['ch10.fr80'] = pct(s80.frac, 0); b['ch10.db80'] = f(s80.dB, 0);
  b['ch10.hollow'] = pct(fg.n1 - 1, 0);

  /* ch11 */
  b['ch11.k'] = f(M.J1ZERO / Math.PI, 2);
  b['ch11.eye'] = f(M.aperture('eye').th * 206264.806, 0); b['ch11.hubble'] = f(M.aperture('hubble').th * 206264.806, 3);
  b['ch11.eht'] = f(M.aperture('eht').th * 206264.806e6, 0);
  b['ch11.euvR'] = f(0.61 * M.FRONTIER.euv.lamNm / M.FRONTIER.euv.na, 0);
  b['ch11.k1'] = f(M.FRONTIER.euv.resNm * M.FRONTIER.euv.na / M.FRONTIER.euv.lamNm, 2);
  b['ch11.w0'] = f(M.array(16, 0.5, 0).hpbw, 1); b['ch11.w30'] = f(M.array(16, 0.5, 30).hpbw, 1);
  b['ch11.half28'] = f(M.C0 / 28e9 / 2 * 1e3, 1);

  /* ch12: the frontier data block (models.js FRONTIER) */
  const F = M.FRONTIER, band = ([lo, hi]) => { const a = M.siFreq(lo), c = M.siFreq(hi); return a.u === c.u ? `${+a.v.toFixed(3)}–${+c.v.toFixed(3)} ${c.u}` : `${+a.v.toFixed(3)} ${a.u} – ${+c.v.toFixed(3)} ${c.u}`; };
  b['fr.fr1'] = band(F.fr1); b['fr.fr2'] = band(F.fr2);
  b['fr.wrc1'] = band(F.wrc27[0]); b['fr.wrc2'] = band(F.wrc27[1]); b['fr.wrc3'] = band(F.wrc27[2]);
  b['fr.wifi7Bw'] = String(F.wifi7.bwMHz); b['fr.wifi7Qam'] = String(F.wifi7.qam); b['fr.wifi8Year'] = String(F.wifi8.approvalForecast);
  b['fr.smfYear'] = String(F.fibreSmf.year); b['fr.smfKm'] = String(F.fibreSmf.km); b['fr.smfTb'] = String(F.fibreSmf.tbps); b['fr.smfThz'] = String(F.fibreSmf.thz);
  b['fr.mcfYear'] = String(F.fibreMcf.year); b['fr.mcfClad'] = String(F.fibreMcf.claddingUm); b['fr.mcfCores'] = String(F.fibreMcf.cores); b['fr.mcfPb'] = String(F.fibreMcf.pbps); b['fr.mcfKm'] = f(F.fibreMcf.km, 0);
  b['fr.hollowYear'] = String(F.hollow.year); b['fr.hollowDb'] = String(F.hollow.dBkm); b['fr.hollowThz'] = String(F.hollow.thzBelow02);
  b['fr.thzYear'] = String(F.subThz.year); b['fr.thzBand1'] = String(F.subThz.bandsGHz[0]); b['fr.thzBand2'] = String(F.subThz.bandsGHz[1]); b['fr.thzM'] = String(F.subThz.metres); b['fr.thzGb'] = String(F.subThz.gbps);
  b['fr.dsocPeakKm'] = f(F.dsoc.peakMkm * 100, 0); b['fr.dsocMbps'] = String(F.dsoc.peakMbps); b['fr.dsocFarKm'] = f(F.dsoc.farMkm / 100, 2); b['fr.dsocPasses'] = String(F.dsoc.passes); b['fr.dsocTb'] = String(F.dsoc.totalTb);
  b['fr.d2cSats'] = String(F.d2c.starlinkSats);
  b['fr.euvLam'] = String(F.euv.lamNm); b['fr.euvNa'] = String(F.euv.na); b['fr.euvNaLow'] = String(F.euv.naLow); b['fr.euvRes'] = String(F.euv.resNm);
  b['fr.lclsGeV'] = String(F.lcls.heGeV); b['fr.voyAu'] = String(F.voyager.au);
  return b;
};
