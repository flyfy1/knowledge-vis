// Numbers in the prose, computed from models.js at build time ({=name} in content.*.md).
// Language-neutral: the same string goes into both languages. tests/models.cjs pins the key ones; tools/crosscheck.cjs
// checks the models behind them against three@0.187.0.
module.exports = M => {
  const b = {};
  const f = (x, d) => M.fmt(x, d, 'en');
  const pct = (x, d) => f(x * 100, d) + '%';

  /* ch2: the orrery, one frame */
  const fr = M.orreryFrame(0.29, 0.3);
  b['ch2.nodes'] = String(fr.tree.all.length);
  b['ch2.compose'] = String(fr.stats.compose);
  b['ch2.world'] = String(fr.stats.world);
  b['ch2.orbit'] = f(fr.moonOrbitR, 1);

  /* ch3: geometry */
  const bc = M.boxCounts(1, 1, 1), sc = M.sphereCounts(32, 16), sb = M.geomBytes(sc.vertices, sc.triangles);
  b['ch3.boxV'] = String(bc.vertices); b['ch3.boxT'] = String(bc.triangles);
  b['ch3.sphV'] = String(sc.vertices); b['ch3.sphT'] = String(sc.triangles);
  b['ch3.sphBytes'] = `${f(sb.vertexBytes, 0)} + ${f(sb.indexBytes, 0)} = ${f(sb.total, 0)} B`;

  /* ch4: the point through the chain; depth precision */
  const c = M.chain({ fov: 50, aspect: 16 / 9, near: 0.1, far: 2000, point: [1, 0.5, -10], width: 1280, height: 720 });
  b['ch4.clip'] = c.clip.map(v => f(v, 4)).join(', ');
  b['ch4.ndc'] = c.ndc.map(v => f(v, 4)).join(', ');
  b['ch4.px'] = `(${f(c.win[0], 1)}, ${f(c.win[1], 1)})`;
  b['ch4.win'] = f(c.win[2], 5);
  b['ch4.int'] = f(c.depthInt, 0);
  b['ch4.first1'] = pct(M.depthStd(1, 0.1, 2000), 0);
  b['ch4.zf'] = f(M.zFightFrom(0.01, 0.1, 2000, 'standard', 24), 0);
  b['ch4.zf1'] = f(M.zFightFrom(0.01, 1, 2000, 'standard', 24), 0);
  b['ch4.zf001'] = f(M.zFightFrom(0.01, 0.01, 2000, 'standard', 24), 0);

  /* ch6: measured compile times (models.js MEASURED: machine and date there and in the prose) */
  b['ch6.first'] = f(M.MEASURED.compileFirst, 0);
  b['ch6.ten'] = f(M.MEASURED.compileTen, 0);
  b['ch6.each'] = f(M.MEASURED.compileTen / 10, 1);

  /* ch7: single-scattering energy lost, from the DFG table (white furnace, viewed head-on) */
  b['ch7.lost05'] = pct(M.energyLost(0.5, 1), 0);
  b['ch7.lost10'] = pct(M.energyLost(1, 1), 0);

  /* ch8: two triangles of a square, every pixel centre covered once */
  b['ch8.sq'] = String(M.sharedEdgeCoverage(16, 16, [[2, 2], [14, 2], [14, 14], [2, 14]]).once);

  /* ch9: memory and colour */
  b['ch9.base'] = M.bytesStr(M.textureBytes(1024, 4, false));
  b['ch9.mip'] = M.bytesStr(M.textureBytes(1024, 4, true));
  b['ch9.lin'] = f(M.sRGBToLinear(0.5), 3);
  b['ch9.srgb'] = f(M.linearToSRGB(0.5), 3);
  b['ch9.srgb8'] = String(Math.round(M.linearToSRGB(0.5) * 255));

  /* ch11: measured draw-call cost (one machine, models.js MEASURED) and fable-flight */
  const Me = M.MEASURED;
  b['ch11.k1'] = f(Me.separate[1000], 2);
  b['ch11.per'] = f(Me.separate[1000] / 1000 * 1000, 2);
  b['ch11.perOwn'] = f(Me.own[1000] / 1000 * 1000, 2);
  b['ch11.cap'] = f(M.callsPerFrame(1), 0);
  const fs = M.fableStats();
  b['ch11.fv'] = String(fs.vertsPerPage); b['ch11.ft'] = String(fs.trisPerPage);
  b['ch11.fb'] = M.bytesStr(fs.instanceBytes);
  b['ch11.ftot'] = f(fs.triangles, 0);
  // fable-flight's pages as separate meshes: 24,000 calls at the measured shared-material cost and at the lab's default
  const perShared = Me.separate[1000] / 1000;   // ms per call
  b['ch11.fpages'] = f(M.FABLE.pages, 0);
  b['ch11.flo'] = f(M.FABLE.pages * perShared, 1);
  b['ch11.fhi'] = f(M.FABLE.pages * M.CALL_DEFAULTS.usPerCall / 1000, 0);
  return b;
};
