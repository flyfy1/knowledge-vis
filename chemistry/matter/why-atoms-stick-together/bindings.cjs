// Numbers in the prose and on the diagrams, computed from models.js at build time ({=name} in content.*.md).
// Language-neutral: the same string goes into both languages. tests/models.cjs re-derives each one independently.
module.exports = M => {
  const b = {};
  const f = (x, d) => M.fmt(x, d, 'en');
  const pct = (x, d) => f(x * 100, d) + '%';
  const ev = M.K.hartreeEv;

  /* ch1 */
  const L = 0.2, bx = M.boxMerge(L);
  b['ch1.L'] = f(L, 1); b['ch1.e1'] = f(bx.narrow, 1); b['ch1.e2'] = f(bx.wide, 2); b['ch1.drop'] = f(bx.drop, 2); b['ch1.kj'] = f(bx.dropKj, 0);

  /* ch2 */
  const z1 = M.h2plusMin(false), op = M.h2plusMin(true), ex = M.H2P_EXACT;
  b['ch2.z1R'] = f(z1.R, 2); b['ch2.z1pm'] = f(z1.RA * 100, 0); b['ch2.z1De'] = f(z1.DeEv, 2);
  b['ch2.exR'] = f(ex.R, 2); b['ch2.expm'] = f(ex.R * M.K.bohrA * 100, 0); b['ch2.exDe'] = f(ex.De * ev, 2);
  b['ch2.z1dT'] = f(Math.abs(z1.d.bond.T - 0.5) * ev, 2); b['ch2.z1dV'] = f((z1.d.bond.V + 1) * ev, 2);
  b['ch2.optR'] = f(op.R, 2); b['ch2.optZ'] = f(op.zeta, 2); b['ch2.optDe'] = f(op.DeEv, 2); b['ch2.optGap'] = f(ex.De * ev - op.DeEv, 2);
  b['ch2.optdT'] = f((op.d.bond.T - 0.5) * ev, 2); b['ch2.optdV'] = f(Math.abs(op.d.bond.V + 1) * ev, 2);

  /* ch3 */
  const h2 = M.MO_FILL.find(m => m.id === 'h2');
  b['ch3.h2ev'] = f(h2.d0, 2); b['ch3.h2kj'] = f(h2.d0 * M.K.evKj, 0);
  b['ch3.butDel'] = f(M.huckel(4, false).deloc, 2); b['ch3.benDel'] = f(M.huckel(6, true).deloc, 2); b['ch3.benBo'] = f(M.huckel(6, true).bonds[0], 2);
  b['ch3.beta'] = f(M.huckelBetaEv(), 2);
  const lm = N => M.POLYENE_LMAX.find(q => q.N === N).nm;
  for (const N of [2, 4, 6, 22]) b[`ch3.l${N}exp`] = f(lm(N), 0);
  for (const N of [2, 6, 22]) b[`ch3.l${N}`] = f(M.huckelLambda(N, false), 0);

  /* ch4 */
  const dip = k => pct(M.DIPOLES.find(m => m.f === k).ionic, 0);
  b['ch4.hcl'] = dip('HCl'); b['ch4.hf'] = dip('HF'); b['ch4.nacl'] = dip('NaCl');
  b['ch4.chain'] = f(2 * Math.log(2), 3);
  for (let n = 1; n <= 4; n++) b['ch4.sph' + n] = f(M.madelungNaCl(n).sphere, 2);
  b['ch4.ev3'] = f(M.madelungNaCl(3).evjen, 3);
  b['ch4.r0'] = f(M.NACL.r0 * 100, 0); b['ch4.bn'] = String(M.NACL.bornN);
  const bl = M.bornLande(), bh = M.bornHaber();
  b['ch4.bl'] = f(bl, 0); b['ch4.bh'] = f(bh, 0); b['ch4.blErr'] = pct(Math.abs(bl - bh) / Math.abs(bh), 0);
  b['ch4.ie'] = f(M.BORN_HABER.ie, 0); b['ch4.ea'] = f(Math.abs(M.BORN_HABER.ea), 0);

  /* ch5 */
  b['ch5.kt'] = f(M.K.kBev * 300, 3); b['ch5.b'] = String(M.TB_BETA_EV);
  b['ch5.si'] = f(M.GAPS.si, 2); b['ch5.dia'] = f(M.GAPS.diamond, 2);
  b['ch5.siF'] = M.sci(M.carrierFactor(M.GAPS.si, 300), 0); b['ch5.diaF'] = M.sci(M.carrierFactor(M.GAPS.diamond, 300), 0);

  /* ch6 */
  const ang = k => M.ANGLES.find(a => a.f === k).deg, hy = k => M.hybridFromAngle(ang(k));
  b['ch6.tet'] = f(M.hybridAngle(3), 1);
  b['ch6.h2o'] = f(ang('H₂O'), 1); b['ch6.h2oN'] = f(hy('H₂O').n, 1);
  b['ch6.h2s'] = f(ang('H₂S'), 1); b['ch6.h2sN'] = f(hy('H₂S').n, 0); b['ch6.h2sS'] = pct(hy('H₂S').s, 1);
  b['ch6.ph3'] = f(ang('PH₃'), 1);

  /* ch7 */
  const w = M.waterWithoutHBonds();
  b['ch7.kt'] = f(M.kT(298.15), 1);
  b['ch7.arEps'] = f(M.LJ.argonEpsKj, 1); b['ch7.arSig'] = f(M.LJ.argonSigmaA * 100, 0); b['ch7.rmin'] = f(M.LJ.rmin, 2);
  b['ch7.extK'] = f(w.T, 0); b['ch7.extC'] = f(w.C, 0); b['ch7.extGap'] = f(w.gap, 0);
  b['ch7.ice'] = pct(M.iceExpansion(), 0);

  /* ch8 */
  const c = M.CARBON;
  b['ch8.dB'] = String(c.diamondBond); b['ch8.gB'] = String(c.graphiteBond); b['ch8.gL'] = String(c.graphiteLayer);
  b['ch8.cc'] = String(c.ccBondKj); b['ch8.layer'] = String(c.layerKj); b['ch8.ratio'] = f(Math.round(c.ccBondKj / c.layerKj / 10) * 10, 0);
  b['ch8.N1'] = f(M.CHAIN_EX[0], 0); b['ch8.N2'] = f(M.CHAIN_EX[1], 0);
  b['ch8.r1'] = f(M.chainRms(M.CHAIN_EX[0], 2000, 11), 0); b['ch8.r2'] = f(M.chainRms(M.CHAIN_EX[1], 2000, 11), 0);

  /* ch9 */
  const lv = M.levinthal(M.LEVINTHAL.residues, M.LEVINTHAL.states, M.LEVINTHAL.perSecond);
  b['ch9.n'] = String(M.LEVINTHAL.residues); b['ch9.s'] = String(M.LEVINTHAL.states);
  b['ch9.conf'] = M.sci(lv.n, 0); b['ch9.years'] = M.sci(lv.years, 0); b['ch9.age'] = M.sci(lv.ageRatio, 0);
  const h12 = M.hpBest(M.HP_SEQS.s12), h14 = M.hpBest(M.HP_SEQS.s14);
  b['ch9.c12'] = f(h12.count, 0); b['ch9.e12'] = String(-h12.energy); b['ch9.c14'] = f(h14.count, 0);

  /* ch10 */
  b['ch10.dft2'] = f(M.costFactor('dft', 2), 0); b['ch10.cc2'] = f(M.costFactor('ccsdt', 2), 0); b['ch10.g'] = f(M.sizeForBudget('ccsdt', 1000), 1);

  /* ch11 */
  b['ch11.hb'] = f(M.HBOND_WATER / M.kT(298.15), 0);
  return b;
};
