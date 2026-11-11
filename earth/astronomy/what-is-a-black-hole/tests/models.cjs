'use strict';
// Pins every number the essay's prose states to the page's own models: each number is computed here from
// models.js, formatted, and the prose (copy.zh.js) must contain exactly that string. Literals appear only for
// sourced inputs (masses, distances, observed sizes), and the test checks the model uses those same inputs.
// Run: node earth/astronomy/what-is-a-black-hole/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const dir = path.join(__dirname, '..');
const M = require(path.join(dir, 'models.js'));
const { K, OBJ } = M;
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(dir, 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;

let n = 0, fails = 0;
function check(name, cond, info = '') { n++; if (!cond) { fails++; console.error(`FAIL ${name} ${info}`); } }
function says(key, phrase) { n++; if (!Z[key] || !Z[key].includes(phrase)) { fails++; console.error(`FAIL prose ${key} should contain "${phrase}"`); } }
const fx = (x, d) => x.toFixed(d);
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
// "m × 10ⁿ" with s significant figures, as the prose writes it
function sci(x, s = 2) { let e = Math.floor(Math.log10(Math.abs(x))), m = +(x / Math.pow(10, e)).toFixed(s - 1); if (Math.abs(m) >= 10) { m /= 10; e++; } return m.toFixed(s - 1) + ' × 10' + String(e).split('').map(c => SUP[c]).join(''); }
const deg = r => r * 180 / Math.PI;
const rsOf = GM => M.escape.rs(GM);

/* ── sourced inputs are the ones the models use ── */
check('G CODATA 2022', K.G === 6.67430e-11); check('GM sun IAU', K.GMsun === 1.3271244e20); check('GM earth IAU', K.GMearth === 3.986004e14);
check('R sun IAU', K.Rsun === 6.957e8); check('R earth IAU', K.Rearth === 6.3781e6);
check('Sgr A* 4.297e6 Msun at 8277 pc', OBJ.sgra.GM === 4.297e6 * K.GMsun && OBJ.sgra.D === 8277 * K.pc);
check('S2 GRAVITY 2020', OBJ.s2.aMas === 125.058 && OBJ.s2.e === 0.884649 && OBJ.s2.Pyr === 16.0455 && OBJ.s2.Dpc === 8246.7);

/* ── ch1 escape speed ── */
{
  const vE = M.escape.vesc(K.GMearth, K.Rearth) / 1000; says('ch1.p1', `每秒 ${fx(vE, 1)} 千米`);
  const rsE = rsOf(K.GMearth), rsS = rsOf(K.GMsun), rsG = rsOf(OBJ.sgra.GM);
  says('ch1.p3', `地球的是 ${fx(rsE * 1000, 2)} 毫米`);
  says('ch1.p3', `现在的 ${fx(K.Rearth / rsE / 1e8, 1)} 亿分之一`);
  says('ch1.p3', `太阳的是 ${fx(rsS / 1000, 2)} 千米`);
  says('ch1.p3', `约 ${fx(K.Rsun / rsS / 1e4, 0)} 万分之一`);
  says('ch1.p3', `它的是 ${sci(rsG / 1000, 3)} 千米`);
  says('ch1.p3', `约为太阳半径的 ${fx(rsG / K.Rsun, 0)} 倍`);
  says('ch1.p3', `有 ${sci(OBJ.sgra.GM / K.GMsun, 4)} 个太阳质量`);
  // v ∝ R^(-1/2): radius ÷100 → speed ×10
  check('ch1 radius/100 → v×10', Math.abs(M.escape.vesc(1, 0.01) / M.escape.vesc(1, 1) - 10) < 1e-12); says('ch1.p3', '缩小到 1/100，逃逸速度就涨 10 倍');
  // at r_s the Newtonian escape speed is exactly c
  check('ch1 vesc(rs) = c', Math.abs(M.escape.vesc(K.GMsun, rsS) / K.c - 1) < 1e-12);
  says('ch1.p2', '1784 年'); // St Andrews MacTutor: Michell, Phil. Trans. 1784
}

/* ── ch2 scale ── */
{
  says('ch2.p1', `就多 ${fx(M.scale.rs(1) / 1000, 2)} 千米`);
  says('ch2.p1', `有 ${OBJ.gw150914.mf} 个太阳质量，视界半径 ${fx(M.scale.rs(OBJ.gw150914.mf) / 1000, 0)} 千米`);
  const mg = OBJ.sgra.GM / K.GMsun; check('ch2 "四百多万"', mg >= 4e6 && mg < 5e6); says('ch2.p1', '四百多万');
  says('ch2.p1', `有 ${sci(OBJ.m87.GM / K.GMsun, 2)} 个`);
  says('ch2.p2', `是 ${sci(M.scale.density(1), 2)} 千克/立方米`);
  says('ch2.p2', `约 ${sci(M.scale.density(mg), 2)} 千克/立方米`);
  check('ch2 Sgr A* ≈ 1000× water', Math.round(M.scale.density(mg) / 1000 / 100) * 100 === 1000); says('ch2.p2', '是水的约 1000 倍');
  says('ch2.p2', `约 ${fx(M.scale.massForDensity(1000) / 1e8, 1)} 亿个太阳质量`);
  says('ch2.p2', `约 ${fx(M.scale.rs(OBJ.m87.GM / K.GMsun) / K.AU, 0)} 个日地距离`);
  says('ch2.p2', `只有 ${fx(M.scale.density(OBJ.m87.GM / K.GMsun), 2)} 千克/立方米`);
  // density ∝ M⁻²
  check('ch2 density ∝ 1/M²', Math.abs(M.scale.density(10) / M.scale.density(1) - 0.01) < 1e-12);
}

/* ── ch3 orbit ── */
{
  says('ch3.p2', `${fx(K.Rsun / 1e7, 1)} 万千米`); says('ch3.p2', `${fx(rsOf(K.GMsun) / 1000, 2)} 千米`);
  const e1 = M.orbit.elements(1), e2 = M.orbit.elements(2), eh = M.orbit.elements(0.5);
  says('ch3.p3', `一年仍是 ${fx(e1.periodYr * K.year / K.day, 1)} 天`);
  // the stepped simulation reproduces the exact period
  const s = M.orbit.create(1); while (s.laps < 1) M.orbit.step(s, M.orbit.H);
  check('ch3 simulated lap = Kepler', Math.abs(s.tLap - e1.periodYr) * K.year / K.day < 0.05, `${s.tLap * 365.25}`);
  // swapping the Sun for a black hole changes nothing in the model: the pull depends only on GM and r
  check('ch3 same pull', M.orbit.gAt(K.GMsun, K.AU) === M.orbit.gAt(1 * K.GMsun, K.AU));
  says('ch3.p3', `最近只有 ${fx(e2.peri, 2)} 个日地距离、一圈 ${fx(e2.periodYr * K.year / K.day, 1)} 天`);
  check('ch3 half mass is exactly parabolic', !eh.bound && eh.parabolic); says('ch3.p3', '恰好以逃逸速度离开');
  // the simulation agrees: at f = 2 the closest approach is a third of an AU
  const s2 = M.orbit.create(2); let rmin = 9; for (let i = 0; i < 2000; i++) { M.orbit.step(s2, M.orbit.H); rmin = Math.min(rmin, M.orbit.r(s2)); }
  check('ch3 simulated perihelion at f=2', Math.abs(rmin - e2.peri) < 2e-3, String(rmin));
}

/* ── ch4 relativistic orbits ── */
{
  const G = M.gr;
  const a = G.fate(10, 0.9, true), b = G.fate(10, 0.9, false), p = G.precession(10, 0.9, true);
  says('ch4.p3', `最近到 ${fx(b.other, 2)} r<sub>s</sub> 的闭合椭圆`);
  says('ch4.p3', `会落到 ${fx(a.other, 2)} r<sub>s</sub>，每圈最近点往前转 ${fx(deg(p), 1)}°`);
  check('ch4 Newton does not precess', Math.abs(deg(G.precession(10, 0.9, false))) < 1e-6);
  const c = G.fate(10, 0.8, true), d = G.fate(10, 0.8, false);
  check('ch4 k=0.8 plunges in GR', c.kind === 'plunge'); says('ch4.p3', `牛顿的椭圆最近到 ${fx(d.other, 2)} r<sub>s</sub>，相对论里它直接落进视界`);
  // the time-stepped simulation shows the same pericentre and precession as the orbit-shape equation
  const s = G.create(10, 0.9, true); while (s.peris.length < 3 && s.t < 1e5) G.step(s, G.H);
  check('ch4 simulated pericentre', Math.abs(s.rMin - a.other) < 1e-3, String(s.rMin));
  check('ch4 simulated precession', Math.abs(deg(s.peris[2] - s.peris[1] - 2 * Math.PI) - deg(p)) < 0.1);
  const sp = G.create(10, 0.8, true); while (!sp.inside && sp.t < 1e5) G.step(sp, G.H); check('ch4 simulated plunge', sp.inside);
  // ISCO: the smallest stable circular orbit is at 3 r_s; scanning h finds no stable circular orbit below it
  let minStable = Infinity; for (let h = 1.6; h < 20; h += 0.001) { const o = G.circular(h); if (o) minStable = Math.min(minStable, o.stable); }
  check('ch4 stable circular orbits only above 3 r_s', minStable > 3 && G.circular(G.hMinStable() - 1e-6) === null && Math.abs(G.circular(G.hMinStable()).stable - 3) < 1e-9 && G.isco() === 3, String(minStable));
  // and no stable circular orbit below 3: for every h the stable root is ≥ 3
  check('ch4 ISCO scan', minStable >= 3); says('ch4.p3', `${fx(G.isco(), 0)} r<sub>s</sub> 以内找不到稳定的圆轨道`);
  // photon sphere: the unstable circular orbit tends to 1.5 r_s as h → ∞
  check('ch4 photon sphere 1.5', Math.abs(G.circular(1e4).unstable - 1.5) < 1e-6 && G.photonSphere() === 1.5); says('ch4.p3', `到 ${fx(G.photonSphere(), 1)} r<sub>s</sub>`);
  // weak field: the numerical precession approaches 6πGM/(c²a(1−e²)) for wide orbits
  const r0 = 2000, k = 0.7, f = G.fate(r0, k), aa = (r0 + f.other) / 2, ee = Math.abs(r0 - f.other) / (r0 + f.other);
  check('ch4 weak-field limit', Math.abs(G.precession(r0, k) / (6 * Math.PI * 0.5 / (aa * (1 - ee * ee))) - 1) < 0.01);
}

/* ── ch5 tides ── */
{
  const T = M.tide;
  says('ch5.p1', `只有 ${sci(T.dg(K.GMearth, K.Rearth) / K.g0, 2)} g`);
  says('ch5.p2', '距离减半，差变成 8 倍'); check('ch5 1/r³', T.dg(1, 0.5) / T.dg(1, 1) === 8);
  const GM10 = 10 * K.GMsun;
  says('ch5.p3', `拉力差是 ${sci(T.atHorizon(GM10) / K.g0, 2)} g`);
  const r1 = T.radiusFor(GM10, K.g0) / 1000; says('ch5.p3', `离中心 ${Math.round(r1 / 10) * 10} 千米、也就是 ${fx(T.radiusFor(GM10, K.g0) / rsOf(GM10), 0)} 个 r<sub>s</sub>`);
  says('ch5.p3', `只有 ${sci(T.atHorizon(OBJ.sgra.GM) / K.g0, 2)} g`);
  says('ch5.p3', `约 ${fx(T.massFor(K.g0) / 1e4, 1)} 万个太阳质量`);
  // radial stretch = 2 × transverse squeeze (MTW §31.2); in the model the stretch formula is 2GML/r³
  check('ch5 horizon stretch ∝ 1/M²', Math.abs(T.atHorizon(2 * K.GMsun) / T.atHorizon(K.GMsun) - 0.25) < 1e-12);
}

/* ── ch6 clocks ── */
{
  const Ck = M.clock;
  says('ch6.p2', `钟的快慢是 ${fx(Ck.rate(1.5), 3)}`);
  says('ch6.p2', `变成 ${fx(Ck.rate(1.01), 4)}`);
  says('ch6.p2', `远处过去约 ${fx(1 / Ck.rate(1.01), 0)} 小时`);
  says('ch6.p2', `要 ${sci(Ck.hoverAcc(OBJ.sgra.GM, 1.01 * rsOf(OBJ.sgra.GM)) / K.g0, 2)} g`);
  says('ch6.p3', `慢 ${sci(1 - Ck.rateAt(K.GMearth, K.Rearth), 2)}`);
  says('ch6.p3', `约 ${fx(OBJ.gpsA / 1e7, 2)} 万千米`);
  const gain = Ck.gainPerDay(K.GMearth, K.Rearth, OBJ.gpsA) * 1e6, loss = Ck.speedLossPerDay(Math.sqrt(K.GMearth / OBJ.gpsA)) * 1e6;
  says('ch6.p3', `每天比地面快 ${fx(gain, 1)} 微秒`); says('ch6.p3', `每天慢 ${fx(loss, 1)} 微秒`); says('ch6.p3', `每天快约 ${fx(gain - loss, 0)} 微秒`);
  // the default slider position is 1.5 r_s
  const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  const v = +html.match(/id="ckX"[^>]*value="([-\d.]+)"/)[1]; check('ch6 default slider = 1.5 r_s', Math.abs(1 + Math.pow(10, v) - 1.5) < 2e-3);
}

/* ── ch7 light ── */
{
  const L = M.light, bc = L.bCrit();
  check('ch7 b_c = √27/2', Math.abs(bc - Math.sqrt(27) / 2) < 1e-12);
  // the traced rays switch from escaping to captured at b_c
  check('ch7 b just above b_c escapes', !L.trace(bc + 0.01).captured); check('ch7 b just below b_c is captured', L.trace(bc - 0.01).captured);
  says('ch7.p2', `过了 ${fx(bc, 2)} r<sub>s</sub>`); says('ch7.p2', `√27/2 ≈ ${fx(bc, 2)} 个`);
  says('ch7.law', `不到 ${fx(bc, 1)} rₛ`); says('ch7.law', `约是视界的 ${fx(bc, 1)} 倍`);
  says('ch7.p2', `光偏转约 ${fx(deg(L.trace(3).deflection), 1)}°`);
  const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  check('ch7 default b = 3', +html.match(/id="ltB"[^>]*value="([\d.]+)"/)[1] === 3);
  // weak field: far rays approach 2 r_s / b
  check('ch7 weak-field limit', Math.abs(L.trace(200).deflection / L.weakDeflection(200) - 1) < 0.02);
  const th = deg(L.shadowAngle(OBJ.sgra.GM, OBJ.sgra.D)) * 3600e6; says('ch7.p3', `预言的影子直径是 ${fx(th, 0)} 微角秒`);
  check('ch7 prediction within the EHT shadow range 48.7 ± 7.0', Math.abs(th - 48.7) <= 7.0);
  says('ch7.p3', `1 度是 ${sci(3600e6, 2)} 微角秒`);
  says('ch7.p3', '51.8 ± 2.3'); says('ch7.p3', '48.7 ± 7.0'); says('ch7.p3', '42 ± 3'); // EHT 2022 / 2019, sourced
}

/* ── ch8 S2 ── */
{
  const S = M.s2, P = OBJ.s2, aM = S.aMeters(P.aMas, P.Dpc), ms = S.mass(P.aMas, P.Dpc, P.Pyr), GM = ms * K.GMsun;
  says('ch8.p1', `绕一圈 ${fx(P.Pyr, 1)} 年`); says('ch8.p1', `偏心率 ${fx(P.e, 2)}`);
  says('ch8.p2', `半长轴是 ${fx(aM / K.AU, 0)} 个日地距离`);
  says('ch8.p2', `中心有 ${sci(ms, 3)} 个太阳质量`);
  check('ch8 Kepler mass = GRAVITY fit 4.261', fx(ms / 1e6, 3) === '4.261');
  const peri = aM * (1 - P.e);
  says('ch8.p2', `只有 ${fx(peri / K.AU, 0)} 个日地距离`);
  says('ch8.p2', `r<sub>s</sub> 的 ${fx(peri / rsOf(GM), 0)} 倍`);
  const vp = S.periSpeed(GM, aM, P.e);
  says('ch8.p2', `速度约 ${Math.round(vp / 1e4) * 10} 千米/秒`); says('ch8.p2', `光速的 ${fx(vp / K.c * 100, 1)}%`);
  // the Kepler-equation animation reaches the same pericentre speed
  check('ch8 animation speed at pericentre', Math.abs(S.at(0, P.e, P.Pyr, aM, GM).v / vp - 1) < 1e-9);
  says('ch8.p2', `距离多 10%，算出的质量就多 ${fx((S.mass(P.aMas, P.Dpc * 1.1, P.Pyr) / ms - 1) * 100, 0)}%`);
  says('ch8.p3', `每圈应前移 ${fx(deg(M.gr.precessionPerOrbit(GM, aM, P.e)) * 60, 1)} 角分`);
  says('ch8.model.how', `${P.aMas} 毫角秒`);
}

/* ── ch9 chirp ── */
{
  const Ch = M.chirp, { m1, m2, mf } = OBJ.gw150914, Mc = Ch.chirpMass(m1, m2), fi = Ch.fIsco(m1 + m2);
  says('ch9.p1', `${m1} 个和 ${m2} 个太阳质量`); says('ch9.p1', `${mf} 个太阳质量的黑洞`);
  says('ch9.p1', `约 ${fx(410e6 * K.pc / (K.c * K.year) / 1e8, 0)} 亿光年`); // 410 Mpc (LIGO 2016)
  says('ch9.p2', `啁啾质量是 ${fx(Mc, 1)}`); says('ch9.p2', `到 ${fx(fi, 0)} 赫兹`);
  says('ch9.p2', `用 ${fx(Ch.tau(Mc, 35) - Ch.tau(Mc, fi), 2)} 秒、${fx(Ch.cycles(Mc, 35, fi), 1)} 个周期`);
  says('ch9.p2', `相距约 ${fx(3 * rsOf((m1 + m2) * K.GMsun) / 1000, 0)} 千米`);
  says('ch9.p2', `太阳的半径是 ${fx(K.Rsun / 1e7, 1)} 万千米`);
  says('ch9.p2', `视界半径 ${fx(rsOf(mf * K.GMsun) / 1000, 0)} 千米`);
  // the ISCO frequency is twice the orbital frequency of a circular orbit at 3 r_s (Kepler, as in ch4)
  const r = 3 * rsOf((m1 + m2) * K.GMsun), forb = Math.sqrt((m1 + m2) * K.GMsun / r ** 3) / (2 * Math.PI);
  check('ch9 f_ISCO = 2 × orbital frequency at 3 r_s', Math.abs(2 * forb / fi - 1) < 1e-12);
  // the waveform's frequency track ends at f_ISCO
  const w = Ch.wave(m1, m2, 0.1, 200); check('ch9 waveform ends at f_ISCO', Math.abs(w[w.length - 1][2] / fi - 1) < 1e-9);
  says('ch9.p3', '几百千米');
}

/* ── ch10 Hawking ── */
{
  const H = M.hawking;
  says('ch10.c3', `是 ${sci(H.T(1), 2)} K`); says('ch10.c3', `人马座 A* 是 ${sci(H.T(OBJ.sgra.GM / K.GMsun), 2)} K`);
  const mk = H.massForT(K.Tcmb); says('ch10.c3', `比 ${sci(mk, 2)} 千克`); says('ch10.c3', `地球质量的 ${fx(mk / K.Mearth * 100, 2)}%`);
  says('ch10.c3', `${fx(K.Tcmb, 1)} K`);
}

/* ── review 2026-11-11: limits added to ch3 and ch8 ── */
{
  // "does not suck" carries its limit: no stable circular orbit inside the ISCO
  says('ch3.p4', `${fx(M.gr.isco(), 0)} r<sub>s</sub> 以内，再也没有稳定的圆轨道`);
  // ch8.limit reconciles the two Sgr A* masses on the page
  const P = OBJ.s2, ms = M.s2.mass(P.aMas, P.Dpc, P.Pyr), mg = OBJ.sgra.GM / K.GMsun;
  says('ch8.limit', `${sci(mg, 4)} 个太阳质量来自 GRAVITY 2022`); says('ch8.limit', `距离 ${Math.round(OBJ.sgra.D / K.pc)} 秒差距`);
  says('ch8.limit', `这里的 ${sci(ms, 3)} 相差不到 1%`); check('ch8 masses differ by < 1%', Math.abs(mg / ms - 1) < 0.01, String(mg / ms));
}

/* ── English copy: same keys and placeholders as zh; the numbers it states are the model's, in English format ── */
{
  const ctxE = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(dir, 'copy.en.js'), 'utf8'), ctxE);
  const E = ctxE.window.ESSAY_COPY.en;
  const kz = Object.keys(Z).sort(), ke = Object.keys(E).sort();
  check('en keys = zh keys', JSON.stringify(kz) === JSON.stringify(ke), kz.filter(k => !(k in E)).concat(ke.filter(k => !(k in Z))).join(','));
  const ph = s => (s.match(/\{\w+\}/g) || []).sort().join(',');
  for (const k of kz) if (k in E) check('en placeholders ' + k, ph(Z[k]) === ph(E[k]), `${ph(Z[k])} vs ${ph(E[k])}`);
  check('no CJK in copy.en.js', !Object.values(E).some(s => /[一-鿿，。：；（）]/.test(s)));
  const en = (x, d = 0) => x.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  const saysE = (key, phrase) => { n++; if (!E[key] || !E[key].includes(phrase)) { fails++; console.error(`FAIL en prose ${key} should contain "${phrase}"`); } };
  const rsE = rsOf(K.GMearth), rsS = rsOf(K.GMsun);
  saysE('ch1.p3', `factor of about ${en(+fx(K.Rearth / rsE / 1e8, 1) * 100)} million`);
  saysE('ch1.p3', `factor of about ${en(Math.round(K.Rsun / rsS / 1e4) * 1e4)} smaller`);
  saysE('ch2.p2', `above about ${en(+fx(M.scale.massForDensity(1000) / 1e8, 1) * 100)} million solar masses`);
  const sunR = `${en(Math.round(K.Rsun / 1e6) * 1000)} km`; saysE('ch3.p2', sunR); saysE('ch9.p2', sunR);
  saysE('ch3.p4', `within ${fx(M.gr.isco(), 0)} r<sub>s</sub> of the hole there are no stable circular orbits`);
  saysE('ch5.p3', `${en(Math.round(M.tide.radiusFor(10 * K.GMsun, K.g0) / 1e4) * 10)} km from the center`);
  saysE('ch5.p3', `about ${en(Math.round(M.tide.massFor(K.g0) / 1e3) * 1e3)} solar masses`);
  saysE('ch6.p3', `about ${en(Math.round(OBJ.gpsA / 1e5) * 100)} km`);
  const P = OBJ.s2, aM = M.s2.aMeters(P.aMas, P.Dpc), ms = M.s2.mass(P.aMas, P.Dpc, P.Pyr), peri = aM * (1 - P.e);
  saysE('ch8.p2', `${en(P.Dpc, 1)} parsecs`); saysE('ch8.p2', `${en(aM / K.AU)} Earth–Sun distances`);
  saysE('ch8.p2', `${en(peri / rsOf(ms * K.GMsun))} times`); saysE('ch8.p2', `about ${en(Math.round(M.s2.periSpeed(ms * K.GMsun, aM, P.e) / 1e4) * 10)} km/s`);
  saysE('ch9.p1', `about ${fx(410e6 * K.pc / (K.c * K.year) / 1e9, 1)} billion light-years`);
  saysE('ch7.p3', `${en(Math.round(OBJ.sgra.D / K.pc))} parsecs`); saysE('ch2.p1', 'more than four million');
}

/* ── copy hygiene: every key used by the page exists; no Chinese outside copy.zh.js ── */
{
  const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8'), mod = fs.readFileSync(path.join(dir, 'models.js'), 'utf8');
  const keys = new Set([...html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)].map(m => m[1]));
  for (const m of app.matchAll(/\bt\('([\w.]+\w)'/g)) keys.add(m[1]);
  for (const k of keys) check('key ' + k, Z[k] != null);
  for (const pre of ['ch1.say.', 'ch2.say.', 'ch3.say.', 'ch4.say.', 'ch5.say.', 'ch6.say.', 'ch7.say.', 'ch8.say.', 'ch9.say.']) check('say keys for ' + pre, Object.keys(Z).some(k => k.startsWith(pre)));
  const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  check('no Chinese in app.js', !/[一-鿿]/.test(strip(app)));
  check('no Chinese in models.js', !/[一-鿿]/.test(strip(mod)));
  // The site's static provenance label (specs/visual-page-provenance.md) is bilingual by contract and not essay copy.
  check('no Chinese in index.html except the 中 button and the site provenance label', !/[一-鿿]/.test(html.replace(/<details class="page-provenance"[\s\S]*?<\/details>/, '').replace('>中<', '><')));
}

if (fails) { console.error(`${fails} of ${n} checks failed`); process.exit(1); }
console.log(`PASS: ${n} checks (every prose number derived from models.js and found in copy.zh.js)`);
