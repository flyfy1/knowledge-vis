'use strict';
// Pins every number the essay's prose states to the page's own models, checks that the prose (copy.zh.js) says exactly
// that number, and drives every control through its range to check that each live sentence's claim holds where it is shown.
// Run: node physics/optics/why-the-sky-is-blue/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const M = require(path.join(__dirname, '..', 'models.js'));
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'copy.en.js'), 'utf8'), ctx);
const EN = ctx.window.ESSAY_COPY.en;

let n = 0, fails = 0;
function check(name, got, want) { n++; if (got !== want) { fails++; console.error(`FAIL ${name}: model gives ${got}, expected ${want}`); } }
function ok(name, cond) { n++; if (!cond) { fails++; console.error(`FAIL ${name}`); } }
// the prose must contain this phrase, built from the model's own number
function says(key, phrase) { n++; if (!Z[key] || !Z[key].includes(phrase)) { fails++; console.error(`FAIL prose ${key} should contain "${phrase}"`); } }
// the English prose must say the same number
function saysEn(key, phrase) { n++; if (!EN[key] || !EN[key].includes(phrase)) { fails++; console.error(`FAIL English prose ${key} should contain "${phrase}"`); } }
const f = (x, d) => x.toFixed(d);
const range = (a, b, s) => { const o = []; for (let v = a; v <= b + 1e-9; v += s) o.push(+v.toFixed(6)); return o; };

/* ── sources reproduced ── */
check('Bodhaine τ(550) = Table 3 value 0.097069', f(M.rayleighTau(550), 4), '0.0971');
check('IAU nominal solar temperature', M.T_SUN, 5772);
check('Kasten–Young horizon air mass ≈ 38', f(M.airMass(0), 0), '38');
check('Mars Rayleigh τ(440) = 0.01 (Lemmon et al. 2024)', f(M.rayleighTau(440) * M.MARS_AIR, 4), '0.0100');
check('Mie: Bohren–Huffman test case m = 1.55, x = 5.213 → Qext 3.105', f(M.mie(5.213, M.cx(1.55, 0)).qext, 3), '3.105');
{ const q = M.mie(3, M.cx(1.33, 0.01)); let s = 0; for (let a = 0; a < 180; a += 0.1) { const t = (a + 0.05) * Math.PI / 180; s += M.miePhase(q, Math.cos(t)) * Math.sin(t) * 0.1 * Math.PI / 180; } check('Mie phase function averages to 1', f(s / 2, 4), '1.0000'); }
check('dominant wavelength of a pure 410 nm light is 410', f(M.dominant((c => ({ X: c.x, Y: c.y, Z: c.z }))(M.cmf(410))).l, 0), '410');

/* ── ch1 photons ── */
{
  const s = M.ch1State(1);
  check('ch1 τ 450', f(M.rayleighTau(450), 2), '0.22'); says('ch1.p4', '约 0.22');
  check('ch1 τ 650', f(M.rayleighTau(650), 3), '0.049'); says('ch1.p4', '约 0.049');
  check('ch1 blue scattered ~20%', f(s.b, 0), '20'); says('ch1.p3', '约有 20%');
  check('ch1 red scattered ~5%', f(s.r, 0), '5'); says('ch1.p3', '只有约 5%');
  check('ch1 ratio', f(s.ratio, 1), '4.1'); says('ch1.p3', '差 4.1 倍'); saysEn('ch1.p3', '4.1 times as likely');
  const t4 = M.ch1State(4);
  check('ch1 air 4 blue', f(t4.b, 0), '59'); says('ch1.p4', '蓝光被拐走 59%');
  check('ch1 air 4 red', f(t4.r, 0), '18'); says('ch1.p4', '红光 18%');
  check('ch1 air 4 ratio', f(t4.ratio, 1), '3.3'); says('ch1.p4', '只剩 3.3 倍');
  // the Monte Carlo agrees with the exact share scattered on the way down
  for (const air of [0.5, 1, 2, 4]) for (const l of [450, 650]) {
    const st = M.photonStats(l, air, 90, 20000, 3), exact = M.scatteredOnce(l, air);
    ok(`ch1 MC first-pass agrees with 1 − e^−τ (λ ${l}, air ${air})`, Math.abs((1 - st.direct / st.n) - exact) < 0.01);
  }
  // live sentences: "about half goes back to space" while the "some" sentence shows; ratio shrinks as air thickens
  for (const air of range(0.1, 4, 0.1)) {
    const key = M.say.ch1(air);
    if (key === 'ch1.say.some') for (const l of [450, 550, 650]) { const st = M.photonStats(l, air, 90, 8000, 11), up = st.space / (st.space + st.sky); ok(`ch1 about half goes up (λ ${l}, air ${air}): ${f(up, 2)}`, up > 0.4 && up < 0.6); }
    if (key === 'ch1.say.thick') { const a = M.ch1State(air), b = M.ch1State(air - 0.1); ok(`ch1 thick: ratio falls with more air (${air})`, a.ratio < b.ratio); ok('ch1 thick: zenith fades', M.skyPoint(60, 90, 0, { air }).purity < M.skyPoint(60, 90, 0, { air: 1 }).purity); }
  }
  check('ch1 air 0 sentence', M.say.ch1(0), 'ch1.say.none');
  { const st = M.photonStats(450, 0, 90, 1000, 1); check('ch1 no air: every photon lands directly', st.direct, 1000); }
}

/* ── ch2 oscillator ── */
{
  const s = M.ch2State(450, M.LAMBDA_R);
  check('ch2 resonance 83 nm (Edlén pole 1/√146 µm)', f(M.LAMBDA_R, 0), '83'); says('ch2.p3', '83 纳米左右');
  check('ch2 450 vs 700', f(s.rel, 1), '6.1'); says('ch2.p3', '6.1 倍');
  check('ch2 pure λ⁻⁴', f(Math.pow(700 / 450, 4), 1), '5.9'); says('ch2.p3', '≈ 5.9 倍');
  check('ch2 oscillator exponent', f(s.exp, 2), '4.09'); says('ch2.p3', '有效指数是 4.09');
  check('ch2 Bodhaine exponent', f(M.effExponent(450, 700), 2), '4.08'); says('ch2.p3', '给出 4.08');
  check('ch2 halving the wavelength, far from resonance', f(M.oscRel(400, 800, 1e-3), 2), '16.00'); says('ch2.law', '散射多十六倍');
  check('ch2 default slider', /id="osL"[^>]*value="450"/.test(fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8')), true);
  // live sentence: "far" only where the curve is close to λ⁻⁴; "near" only where it is steeper
  for (const lr of range(60, 300, 10)) for (const l of range(380, 780, 20)) {
    const st = M.ch2State(l, lr), key = M.say.ch2(l, st);
    if (key === 'ch2.say.far') ok(`ch2 far: exponent within 0.25 of 4 (λr ${lr})`, Math.abs(st.exp - 4) < 0.25);
    if (key === 'ch2.say.near') ok(`ch2 near: steeper than λ⁻⁴ (λr ${lr})`, st.exp > 4.25);
  }
}

/* ── ch3 spectra ── */
{
  const s = M.ch3State(5772);
  check('ch3 Wien peak', f(s.sunPeak, 0), '502'); says('ch3.p1', '500 纳米左右');
  check('ch3 sky peak', f(s.skyPeak, 0), '277'); says('ch3.p3', '277 纳米'); saysEn('ch3.p3', '277 nm');
  check('ch3 violet share', f(s.violet, 0), '44'); says('ch3.p3', '有 44% 落在紫光段');
  check('ch3 blue share', f(s.blue, 0), '18'); says('ch3.p3', '只有 18%');
  check('ch3 sunlight violet share', f(s.sunViolet, 0), '18'); says('ch3.p3', '紫光段只占 18%');
  says('ch3.p1', '5772 K');
  for (const T of range(2500, 12000, 250)) { const st = M.ch3State(T), key = M.say.ch3(st); ok(`ch3 sentence matches peak position at ${T} K`, key === 'ch3.say.uv' ? st.skyPeak < 380 : st.skyPeak >= 380 && st.skyPeak <= 780); }
}

/* ── ch4 the eye ── */
{
  const s = M.ch4State(4, 380);
  check('ch4 dominant', f(s.dom, 0), '476'); says('ch4.p3', '主波长是 476 纳米'); says('ch4.p4', '476 纳米那条线');
  check('ch4 purity', f(s.purity, 0), '41'); says('ch4.p3', '饱和度 41%');
  check('ch4 purity under one half', s.purity < 50, true); says('ch4.p4', '离白点不到一半远');
  check('ch4 violet energy', f(s.violetEnergy, 0), '44'); says('ch4.p3', '紫光段占了 44%'); saysEn('ch4.p3', 'the violet band holds 44%');
  check('ch4 violet brightness', f(s.violetBright, 1), '1.3'); says('ch4.p3', '只贡献 1.3% 的亮度'); saysEn('ch4.p3', 'only 1.3% of the brightness');
  const c420 = M.ch4State(4, 420), c440 = M.ch4State(4, 440), n8 = M.ch4State(8, 380);
  check('ch4 cut 420', f(c420.dom, 0), '477'); says('ch4.p3', '从 476 挪到 477 纳米');
  check('ch4 cut 440', f(c440.dom, 0), '484'); says('ch4.p3', '（484 纳米）');
  check('ch4 n = 8', f(n8.dom, 0), '470'); says('ch4.p4', '只移到 470 纳米');
  // live sentences
  for (const nn of range(0, 8, 0.5)) for (const cut of range(380, 470, 5)) {
    const st = M.ch4State(nn, cut), key = M.say.ch4(st, cut);
    if (key === 'ch4.say.full') ok(`ch4 full: blue, not violet (n ${nn}): ${f(st.dom, 0)}`, st.dom > 465 && st.dom < 495 && !st.purple);
    if (key === 'ch4.say.white') ok(`ch4 white only when scattering barely prefers short waves (n ${nn})`, nn <= 1 && st.purity < 2);
    if (key === 'ch4.say.cutsmall') { const all = M.scattered(M.T_SUN, nn, 380), Yof = (a, b) => M.integrate(l => all(l) * M.cmf(l).y, a, b); ok(`ch4 cutsmall: the removed light is dim (n ${nn}, cut ${cut})`, Yof(380, cut) / Yof(380, 780) < 0.05); }
  }
}

/* ── ch5 sunset ── */
{
  check('ch5 overhead blue kept', f(M.ch5State(90).b, 0), '80'); says('ch5.p3', '蓝光剩 80%');
  check('ch5 overhead red kept', f(M.ch5State(90).r, 0), '95'); says('ch5.p3', '红光剩 95%');
  check('ch5 m(30)', f(M.airMass(30), 1), '2.0'); says('ch5.p3', '30° 时路长 2.0 倍');
  check('ch5 m(10)', f(M.airMass(10), 1), '5.6'); says('ch5.p3', '10° 时 5.6 倍');
  check('ch5 m(5)', f(M.airMass(5), 1), '10.3'); says('ch5.p3', '5° 时 10.3 倍');
  check('ch5 m(0)', f(M.airMass(0), 0), '38'); says('ch5.p3', '约 38 倍');
  check('ch5 blue half at', f(M.elevForShare(450, 0.5), 0), '18'); says('ch5.p3', '降到 18° 时');
  check('ch5 red half at', f(M.elevForShare(650, 0.5), 1), '3.3'); says('ch5.p3', '要到 3.3°');
  const h = M.ch5State(0);
  check('ch5 horizon blue', f(h.b, 2), '0.02'); says('ch5.p3', '蓝光只剩 0.02%');
  check('ch5 horizon red', f(h.r, 0), '15'); says('ch5.p3', '红光还有 15%');
  check('ch5 horizon colour', f(h.dom, 0), '594'); says('ch5.p3', '594 纳米'); saysEn('ch5.p3', '594 nm');
  check('ch5 default elevation', /id="snE"[^>]*value="5"/.test(fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8')), true);
  says('ch5.p1', '长几十倍'); check('ch5 "tens of times"', M.airMass(0) >= 20 && M.airMass(0) < 100, true);
  for (const e of range(0, 90, 0.5)) {
    const st = M.ch5State(e), key = M.say.ch5(st);
    if (key === 'ch5.say.deep') ok(`ch5 deep only at the horizon (${e}°)`, e <= 2 && st.dom > 585);
    if (key === 'ch5.say.orange') ok(`ch5 orange-yellow is past 579 nm (${e}°)`, st.dom >= 579);
    if (key === 'ch5.say.yellow') ok(`ch5 yellow is 570–590 nm (${e}°)`, st.dom > 570 && st.dom < 590);
    ok(`ch5 blue always loses more than red (${e}°)`, st.b < st.r);
  }
}

/* ── ch6 the whole sky ── */
{
  const s = M.ch6State(30);
  check('ch6 zenith dominant', f(s.zen.dom, 0), '478'); says('ch6.p3', '天顶主波长 478 纳米');
  check('ch6 zenith purity', f(s.zen.purity, 0), '35'); says('ch6.p3', '饱和度 35%');
  check('ch6 horizon purity', f(s.hor.purity, 0), '3'); says('ch6.p3', '饱和度只有 3%');
  check('ch6 horizon brighter', f(s.k, 0), '12'); says('ch6.p3', '天顶的 12 倍');
  const z0 = M.ch6State(0);
  check('ch6 noon purity', f(z0.noonPurity, 0), '37'); says('ch6.p4', '太阳 60° 时的 37%');
  check('ch6 sunset zenith purity', f(z0.zen.purity, 0), '4'); says('ch6.p4', '掉到 4%');
  for (const se of range(0, 90, 1)) {
    const st = M.ch6State(se), key = M.say.ch6(st);
    ok(`ch6 horizon brighter than zenith (${se}°)`, st.k > 1);
    if (key === 'ch6.say.day') {
      const sun = M.xy(M.ch5State(se).xyz), hor = M.xy(st.hor.xyz);
      const zen = M.xy(st.zen.xyz); ok(`ch6 day: horizon colour nearer the sunlight than the zenith is (${se}°)`, Math.hypot(sun.x - hor.x, sun.y - hor.y) < 0.5 * Math.hypot(sun.x - zen.x, sun.y - zen.y));
    }
    if (key === 'ch6.say.low') ok(`ch6 low: horizon tinted yellow-orange and zenith paler than noon (${se}°)`, st.hor.dom > 565 && !st.hor.purple && st.zen.purity < st.noonPurity);
  }
  // ch10's mountain: half the air above you
  const sea = M.skyPoint(60, 90, 0, { air: 1 }), half = M.skyPoint(60, 90, 0, { air: 0.5 });
  check('ch10 mountain brightness', f(half.Y / sea.Y * 100, 0), '53'); says('ch10.c1', '降到原来的 53%');
  check('ch10 mountain purity', f(sea.purity, 0) + '→' + f(half.purity, 0), '37→39'); says('ch10.c1', '从 37% 升到 39%');
}

/* ── ch7 Mie ── */
{
  const tiny = M.ch7State(0.01), blue = M.ch7State(M.radiusOf(36)), big = M.ch7State(10);
  check('ch7 tiny ratio', f(tiny.ratio, 2), '4.35'); says('ch7.p3', '红光的 4.35 倍'); says('ch7.say.mid', '4.35 倍');
  check('ch7 (650/450)^4', f(Math.pow(650 / 450, 4), 2), '4.35');
  check('ch7 slider 36 ≈ 0.6 µm', f(M.radiusOf(36), 1), '0.6'); says('ch7.p3', '0.6 微米左右');
  check('ch7 blue-sun ratio', f(blue.ratio, 2), '0.69'); says('ch7.p3', '红光的 0.69 倍'); saysEn('ch7.p3', '0.69 times red');
  check('ch7 blue sun really blue', blue.sunDom < 495 && !blue.sunPurple, true);
  check('ch7 10 µm ratio', f(big.ratio, 2), '1.00'); says('ch7.p3', '（1.00 倍）');
  check('ch7 10 µm Qext', f(big.q550, 2), '2.07'); says('ch7.p3', '（2.07）');
  check('ch7 slider default 10 µm', f(M.radiusOf(60), 2), '10.00');
  check('ch7 slider ends', f(M.radiusOf(0), 2) + '…' + f(M.radiusOf(66), 0), '0.01…20'); says('ch7.model.how', '0.01 到 20 微米');
  says('ch7.p3', '4 到 17 微米'); check('ch7 cloud droplets 4–17 µm are white', [4, 17].every(r => { const st = M.ch7State(r); return M.say.ch7(st) === 'ch7.say.white'; }), true);
  for (let v = 0; v <= 66; v++) {
    const st = M.ch7State(M.radiusOf(v)), key = M.say.ch7(st);
    if (key === 'ch7.say.tiny') ok(`ch7 tiny follows λ⁻⁴ within 3% (v ${v})`, Math.abs(st.ratio / 4.3491 - 1) < 0.03);
    if (key === 'ch7.say.mid') ok(`ch7 mid: still blue, weaker than λ⁻⁴, paler (v ${v})`, st.ratio > 1 && st.ratio < 4.35 && st.scatPurity < tiny.scatPurity);
    if (key === 'ch7.say.bluesun') ok(`ch7 bluesun: red scattered more and the sun bluish (v ${v})`, st.ratio < 1 && st.sunDom < 500 && !st.sunPurple);
    if (key === 'ch7.say.white') ok(`ch7 white: flat and colourless (v ${v})`, Math.abs(st.ratio - 1) < 0.15 && st.scatPurity < 3);
    if (key === 'ch7.say.wobble') ok(`ch7 wobble: pale (v ${v})`, st.scatPurity < 20);
  }
}

/* ── ch8 Mars ── */
{
  check('ch8 Earth τ(440)', f(M.rayleighTau(440), 2), '0.24'); says('ch8.p1', '地球是 0.24');
  says('ch8.p1', '约 0.01');
  const d = M.ch8State('mars', 0.5, true, 30);
  check('ch8 default zenith', f(d.zen.dom, 0), '576'); says('ch8.p3', '天顶主波长 576 纳米');
  check('ch8 default purity', f(d.zen.purity, 0), '14'); says('ch8.p3', '饱和度 14%'); saysEn('ch8.p3', 'saturation of 14%');
  check('ch8 near sun bluish', f(d.near.dom, 0) + '/' + f(d.near.purity, 0), '483/5'); says('ch8.p3', '主波长 483 纳米，饱和度 5%');
  check('ch8 clear Mars brightness', f(M.ch8State('mars', 0, true, 30).yRel, 1), '4.8'); says('ch8.p3', '亮度的 4.8%');
  check('ch8 grey dust', f(M.ch8State('mars', 0.5, false, 30).zen.purity, 0), '6'); says('ch8.p3', '近白（饱和度 6%）');
  const ss = M.ch8State('mars', 0.5, true, 2);
  check('ch8 sunset near sun', f(ss.near.dom, 0) + '/' + f(ss.near.purity, 0), '484/9'); says('ch8.p4', '主波长 484 纳米，饱和度 9%'); says('ch8.p4', '拖到 2°'); check('ch8 sunset near-sun bluer than at 30°', ss.near.purity > d.near.purity, true); check('ch8 sunset shows the near-blue sentence', M.say.ch8('mars', 0.5, true, ss).near, true);
  check('ch8 Earth with absorbing dust', M.ch8State('earth', 0.5, true, 30).zen.purity < 2, true); says('ch8.p4', '饱和度不到 2%');
  check('ch8 Mars/Earth sunlight 0.431 (NASA)', f(586.2 / 1361, 2), '0.43'); says('ch8.limit', '地球的 43%');
  check('ch8 default controls', ['id="maDust" min="0" max="2" step="0.05" value="0.5"', 'id="maE" min="0" max="60" step="1" value="30"', 'name="maP" value="mars" checked', 'id="maAbs" checked'].every(s => fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8').includes(s)), true);
  // every combination at the slider's ends and middles: each sentence's claim holds
  for (const planet of ['mars', 'earth']) for (const abs of [true, false]) for (const dust of [0, 0.05, 0.1, 0.25, 0.5, 1, 2]) for (const se of [0, 2, 5, 15, 30, 60]) {
    const st = M.ch8State(planet, dust, abs, se), pick = M.say.ch8(planet, dust, abs, st), tag = `${planet} dust ${dust} abs ${abs} sun ${se}`;
    const rayTau = M.rayleighTau(550) * (planet === 'mars' ? M.MARS_AIR : 1);
    if (pick.key === 'ch8.say.marsclear') ok(`ch8 marsclear: blue and several times dimmer (${tag})`, st.zen.dom < 495 && st.yRel < 20);
    if (pick.key === 'ch8.say.blue') ok(`ch8 blue: zenith really blue (${tag})`, st.zen.dom < 495 && !st.zen.purple);
    if (pick.key === 'ch8.say.tan' || pick.key === 'ch8.say.white') ok(`ch8 ${pick.key}: dust outweighs the gas (${tag})`, dust > rayTau);
    if (pick.key === 'ch8.say.tan') ok(`ch8 tan only with absorbing dust (${tag})`, abs);
    if (pick.near) ok(`ch8 near-sun blue is bluer than the zenith (${tag})`, st.near.dom < 495 && (st.zen.purple || st.zen.dom > st.near.dom));
  }
}

/* ── ch9 multiple scattering (the page's own photon count and seed) ── */
{
  const a = M.ch9State(90, 1), b = M.ch9State(10, 1);
  check('ch9 blue multi overhead', f(a.b, 0), '25'); says('ch9.p2', '约有 25% 被拐过不止一次'); saysEn('ch9.p2', 'about 25% of the blue');
  check('ch9 red multi overhead', f(a.r, 0), '8'); says('ch9.p2', '红光只有约 8%'); saysEn('ch9.p2', 'only about 8% of the red');
  check('ch9 blue multi at 10°', f(b.b, 0), '30'); says('ch9.p2', '升到约 30%'); saysEn('ch9.p2', 'climbs to about 30%');
  check('ch9 photons per colour', M.MS_N, 200000); says('ch9.model.how', '每种颜色发二十万个光子'); saysEn('ch9.model.how', '200,000 photons of each colour');
  // the "less than one point" noise claim: the page's seeded readouts against a run with 10x the photons and other seeds
  { const m = s => 100 * (s.byK[2] + s.byK[3]) / s.sky;
    for (const [e, l, got] of [[90, 450, a.b], [90, 650, a.r], [10, 450, b.b]]) {
      const ref = m(M.photonStats(l, 1, e, 10 * M.MS_N, 101));
      ok(`ch9 seeded readout within one point of a 10x run (${e}°, ${l} nm): ${f(got, 2)} vs ${f(ref, 2)}`, Math.abs(got - ref) < 1);
      ok(`ch9 prose rounding survives the noise (${e}°, ${l} nm)`, f(ref, 0) === f(got, 0) || Math.abs(ref - got) < 1);
    }
    const x = M.photonStats(450, 1, 90, M.MS_N, 7), y = M.photonStats(450, 1, 90, M.MS_N, 8); ok('ch9 seed noise under one point', Math.abs(m(x) - m(y)) < 1);
    ok('ch9 blue/red skylight ratio near the converged 4.1', Math.abs(a.br - 4.1) < 0.15); }
  for (const e of [5, 30, 90]) for (const air of [0.5, 1, 4]) { const s = M.ch9State(e, air); ok(`ch9 blue always more multiply scattered than red (${e}°, ${air})`, s.b > s.r); }
  says('ch9.p3', '66%'); says('ch9.p3', '约 3%'); says('ch4.limit', '约 3%'); saysEn('ch9.p3', '66%'); says('ch9.p3', '转述'); saysEn('ch9.p3', 'As reported by Lange');
  // the invented dust absorption is flagged beside the model, in both languages
  says('ch8.model.how', '不是测量值'); saysEn('ch8.model.how', 'invented for illustration, not measured');
  // the UV peak is not presented as what reaches the eye
  says('ch3.p3', '只存在于模型里'); saysEn('ch3.p3', 'exists only in the model');
}

/* ── every placeholder used in copy is filled by the app; every key the page asks for exists ── */
{
  const app = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8'), models = fs.readFileSync(path.join(__dirname, '..', 'models.js'), 'utf8');
  for (const [k, v] of Object.entries(Z)) for (const m of v.matchAll(/\{(\w+)\}/g)) {
    n++; if (!new RegExp('(\\b' + m[1] + '\\s*:|\\.' + m[1] + '\\s*=)').test(app)) { fails++; console.error(`FAIL placeholder {${m[1]}} in ${k} is never supplied by app.js`); }
  }
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const keys = new Set([...html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)].map(m => m[1]));
  for (const src of [app, models]) for (const m of src.matchAll(/'((?:ch\d+|unit|pano|doc|say)\.[\w.]+)'/g)) keys.add(m[1]);
  for (const k of keys) { n++; if (Z[k] == null) { fails++; console.error('FAIL missing zh key ' + k); } }
  // no Chinese text outside copy.zh.js except comments and the 中 button
  for (const file of ['index.html', 'app.js', 'models.js']) {
    const src = fs.readFileSync(path.join(__dirname, '..', file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '').replace(/<!--[\s\S]*?-->/g, '');
    const hits = (src.match(/[㐀-鿿]+/g) || []).filter(x => x !== '中'); n++;
    if (hits.length) { fails++; console.error(`FAIL Chinese text in ${file}: ${hits.slice(0, 3).join(' ')}`); }
  }
  // no 万/亿 style number formatting anywhere in code
  n++; if (/toLocaleString\(\s*['"]zh/.test(app)) { fails++; console.error('FAIL number formatting must not depend on zh locale'); }
}

if (fails) { console.error(`\n${fails} of ${n} checks failed`); process.exit(1); }
console.log(`PASS: ${n} checks (every number in the prose matches the models; every live sentence holds across its controls)`);
