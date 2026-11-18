'use strict';
// Pins every number the essay's prose states to the page's own models, checks that the prose (copy.zh.js) still
// says exactly that number, and walks every live-sentence branch over each control's full range.
// Run: node arts/music/why-notes-sound-good-together/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const M = require(path.join(__dirname, '..', 'models.js'));
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;

let n = 0, fails = 0;
function check(name, got, want) { n++; if (got !== want) { fails++; console.error(`FAIL ${name}: model gives ${got}, expected ${want}`); } }
function says(key, phrase) { n++; if (!Z[key] || !Z[key].includes(phrase)) { fails++; console.error(`FAIL prose ${key} should contain "${phrase}"`); } }
const f = (x, d) => x.toFixed(d);
const R = M.rough, E = M.edo, T = M.tune, Y = M.pyth;
// "−1.96" with a true minus sign, as the prose writes it
const sgn = (x, d) => (x < 0 ? '−' : '+') + Math.abs(x).toFixed(d);

/* ── ch1 plucked string ── */
{
  check('ch1 C3', f(M.C3, 2), '130.81'); says('ch1.p2', 'C3，130.81 Hz');
  check('ch1 period', f(1000 / M.C3, 2), '7.64'); says('ch1.p3', '7.64 毫秒');
  // the period is the same with and without the fundamental, and with any number of harmonics ≥ 2
  for (const N of [2, 8, 16]) for (const drop of [false, true]) {
    const act = M.pluck.active(N, 4 / 24, drop);
    if (act.length) check(`ch1 repeat rate N=${N} drop=${drop}`, f(M.pluck.repeatRate(M.C3, act), 2), N === 2 && drop ? f(2 * M.C3, 2) : '130.81');
  }
  check('ch1 1/6 silences', M.pluck.silenced(16, 4 / 24).join(','), '6,12'); says('ch1.p3', '拨在 1/6 处，第 6、12 个泛音没了');
  check('ch1 1/2 silences evens', M.pluck.silenced(16, 12 / 24).join(','), '2,4,6,8,10,12,14,16'); says('ch1.p3', '拨在正中间，所有偶数号的泛音都没了');
  check('ch1 default pluck slider is 1/6', 4 / 24, 1 / 6);
}

/* ── ch2 combs ── */
{
  const want = [[2, 1, 5], [3, 2, 3], [4, 3, 2], [5, 4, 2], [6, 5, 1], [16, 15, 0], [45, 32, 0]];
  for (const [p, q, k] of want) {
    check(`ch2 shared ${p}:${q}`, M.combs.sharedExact(p, q, 10), k);
    // and the brute-force pair count agrees with floor(H / max(p, q))
    check(`ch2 brute ${p}:${q}`, M.combs.pairs(M.C4, p / q, 10, 0.05).length, k);
  }
  says('ch2.p3', '八度重合 5 对，五度 3 对，四度和大三度各 2 对，小三度 1 对，小二度和三全音一对也没有');
  says('ch2.p2', '一个八度是 1200 音分'); check('ch2 octave cents', M.cents(2), 1200);
}

/* ── ch3 roughness of two pure tones ── */
{
  const P = R.P;
  check('Sethares constants', [P.dstar, P.s1, P.s2, P.b1, P.b2].join(','), '0.24,0.0207,18.96,3.51,5.75');
  says('ch3.p4', 'e<sup>−3.51·s·Δ</sup> − e<sup>−5.75·s·Δ</sup>'); says('ch3.p4', 's = 0.24 / (0.0207·f + 18.96)');
  // the closed-form peak matches a fine numerical scan
  for (const fr of [110, 440, 880]) {
    let best = 0, bd = 0; for (let d = 0; d <= 120; d += 0.001) { const v = R.pair(fr, fr + d); if (v > best) { best = v; bd = d; } }
    check(`ch3 peak by scan at ${fr}`, f(bd, 2), f(R.peakDelta(fr), 2));
  }
  const pk = fr => [f(R.peakDelta(fr), 1), f(M.cents((fr + R.peakDelta(fr)) / fr), 0)];
  check('ch3 peak 440', pk(440).join('/'), '25.8/99'); says('ch3.p3', '440 Hz 时，最粗糙的差距是 25.8 Hz，约 99 音分');
  check('ch3 peak 110', pk(110).join('/'), '19.5/283'); says('ch3.p3', '110 Hz，最粗糙处变成 19.5 Hz，却已是 283 音分');
  check('ch3 peak 880', pk(880).join('/'), '34.1/66'); says('ch3.p3', '880 Hz，是 34.1 Hz、66 音分');
  // the slider's base frequencies: 110·2^(i/12), i = 0..36 hits exactly 110, 440, 880
  check('ch3 slider 440', 110 * Math.pow(2, 24 / 12), 440); check('ch3 slider 880', 110 * Math.pow(2, 36 / 12), 880);
}

/* ── ch4 dissonance curve ── */
{
  const dipsOf = N => R.dips(R.spectrum('harmonic', N), M.C4, 0, 1250).filter(d => d.cents > 0);
  const label = d => { const s = R.nearestSimple(d.ratio); return Math.abs(s.d) < 1 ? s.p + '/' + s.q : f(d.cents, 0); };
  check('ch4 six partials', dipsOf(6).map(label).join(' '), '6/5 5/4 4/3 3/2 5/3 967 2/1');
  says('ch4.p3', '低谷落在 6/5、5/4、4/3、3/2、5/3 和 2/1');
  { const d = dipsOf(6).find(x => label(x) === '967'); check('ch4 967 is 1.4 cents from 7/4', f(Math.abs(d.cents - M.cents(7 / 4)), 1), '1.4'); says('ch4.p3', '967 音分处还有一个浅谷，离 7/4（所谓“自然七度”）差 1.4 音分'); }
  // the two deepest (most prominent) are the octave and the fifth
  check('ch4 deepest two', dipsOf(6).sort((a, b) => b.prom - a.prom).slice(0, 2).map(label).sort().join(' '), '2/1 3/2'); says('ch4.p3', '最深的是八度和五度');
  check('ch4 one partial: no dips', dipsOf(1).length, 0); says('ch4.p3', '只有 1 个泛音时，除了同度，曲线上一个低谷都没有');
  { const c = R.curve(R.spectrum('harmonic', 1), M.C4, 0, 1250, 1); const mx = c.reduce((b, q) => (q[1] > b[1] ? q : b)); const flat = c.find(q => q[0] > mx[0] && q[1] < 0.05 * mx[1]);
    check('ch4 one partial flat (<5% of peak) from', flat[0], 720); says('ch4.p3', '过了约 720 音分就几乎平了'); }
  check('ch4 two partials', dipsOf(2).map(label).join(' '), '688 2/1'); says('ch4.p3', '还停在 688 音分，没对准 3/2');
  check('ch4 9:8 absent at 8', dipsOf(8).some(d => label(d) === '9/8'), false);
  check('ch4 9:8 present at 9', dipsOf(9).some(d => label(d) === '9/8'), true); says('ch4.p4', '大二度 9:8 要到 9 个泛音才有一个很浅的谷');
  check('ch4 no 16:15 even at 10', dipsOf(10).some(d => label(d) === '16/15'), false); says('ch4.p4', '小二度 16:15 在这个范围里根本没有谷');
  const D = c => R.dissonance(R.spectrum('harmonic', 6), M.C4, M.fromCents(c));
  check('ch4 at the fifth', f(D(702), 2), '0.60'); check('ch4 12 cents off', f(D(690), 2), '1.11'); says('ch4.p4', '五度偏开 12 音分，总粗糙度就从 0.60 升到 1.11');
  check('ch4 falloff', R.spectrum('harmonic', 2)[1].a, 0.88); says('ch4.limit', '0.88'); check('C4', f(M.C4, 2), '261.63'); says('ch4.limit', 'C4（261.63 Hz）');
}

/* ── ch5 timbre ── */
{
  check('ch5 bar ratios', [2, 3, 4].map(k => f(M.bar.ratio(k), 2)).join(' : '), '2.76 : 5.40 : 8.93'); says('ch5.p2', '1 : 2.76 : 5.40 : 8.93');
  // check one root against cos x cosh x = 1 directly
  check('ch5 bar root', Math.abs(Math.cos(M.bar.root(1)) * Math.cosh(M.bar.root(1)) - 1) < 1e-9, true);
  const s = R.spectrum('stretched', 6, 0.88, 2.1), dips = R.dips(s, M.C4, 0, 1400).filter(d => d.cents > 0);
  const oct = R.octaveDip(dips, M.cents(2.1));
  check('ch5 dip = cents(2.1)', f(oct.cents, 1), f(M.cents(2.1), 1)); check('ch5 dip 1284', Math.floor(oct.cents), 1284); says('ch5.p3', '低谷搬到 1284 音分，正是 2.1 倍');
  check('ch5 ratio', f(R.dissonance(s, M.C4, 2) / oct.value, 1), '36.6'); says('ch5.p3', '新低谷的 36.6 倍');
  // over the whole stretch slider (1.85–2.15) the octave dip sits exactly at the stretched octave
  for (let a = 185; a <= 215; a++) { const A = a / 100, sp = R.spectrum('stretched', 6, 0.88, A), o = R.octaveDip(R.dips(sp, M.C4, 0, 1400).filter(d => d.cents > 0), M.cents(A)); check('ch5 dip tracks stretch ' + A, Math.abs(o.cents - M.cents(A)) < 0.05, true); }
  // the harmonic case at stretch 2 is identical to the harmonic spectrum
  check('ch5 stretch 2 = harmonic', f(R.dissonance(R.spectrum('stretched', 6, 0.88, 2), M.C4, 1.5), 9), f(R.dissonance(R.spectrum('harmonic', 6), M.C4, 1.5), 9));
}

/* ── ch6 stacking fifths ── */
{
  check('ch6 comma', f(Y.comma(), 2), '23.46'); says('ch6.law', '23.46 音分'); says('ch6.p4', '23.46 音分');
  check('ch6 comma ratio', f(Math.pow(1.5, 12) / Math.pow(2, 7), 5), '1.01364'); says('ch6.p4', '531441 ÷ 524288 ≈ 1.01364');
  check('ch6 3^12', Math.pow(3, 12), 531441); check('ch6 2^19', Math.pow(2, 19), 524288);
  check('ch6 fifth', f(M.cents(1.5), 0), '702'); says('ch6.p2', '702 音分');
  const sz = k => Y.sizes(k).map(x => f(x, 2)).join('/');
  check('ch6 five notes', sz(4), '294.13/203.91'); says('ch6.p3', '五声音阶是 294.13 和 203.91 音分');
  check('ch6 seven notes', sz(6), '203.91/90.22'); says('ch6.p3', '七声音阶是 203.91 和 90.22 音分');
  check('ch6 twelve notes', sz(11), '113.69/90.22'); says('ch6.p3', '113.69 和 90.22 两种');
  // three-gap theorem: never more than three sizes; two sizes exactly at 2, 3, 5, 7, 12 notes (k = 1..11)
  const two = []; for (let k = 1; k <= 11; k++) { check('ch6 ≤ 3 sizes at ' + k, Y.sizes(k).length <= 3, true); if (Y.sizes(k).length === 2) two.push(k + 1); }
  check('ch6 two-size note counts', two.join(','), '2,3,5,7,12'); says('ch6.p3', '其他时候大多是三种');
}

/* ── ch7 why twelve ── */
{
  check('ch7 log2(3/2)', f(M.FIFTH, 5), '0.58496'); says('ch7.p1', '0.58496');
  check('ch7 cf', M.cf.terms(M.FIFTH, 10).join(', '), '0, 1, 1, 2, 2, 3, 1, 5, 2, 23'); says('ch7.p2', '[0; 1, 1, 2, 2, 3, 1, 5, 2, 23, …]');
  const conv = M.cf.convergents(M.cf.terms(M.FIFTH, 7)).map(x => x.join('/'));
  check('ch7 convergents', conv.slice(2).join('、'), '1/2、3/5、7/12、24/41、31/53'); says('ch7.p2', '1/2、3/5、7/12、24/41、31/53');
  const recs = E.records(1.5, 60);
  check('ch7 records', recs.join('、'), '1、2、3、5、7、12、29、41、53'); says('ch7.p3', '1、2、3、5、7、12、29、41、53');
  const dens = M.cf.convergents(M.cf.terms(M.FIFTH, 7)).map(x => x[1]).filter(x => x >= 1);
  check('ch7 convergent denominators among records', recs.filter(x => dens.includes(x)).join('、'), '1、2、5、12、41、53'); says('ch7.p3', '1、2、5、12、41、53 是连分数截断得到的分母');
  check('ch7 intermediates', recs.filter(x => !dens.includes(x)).join('、'), '3、7、29'); says('ch7.p3', '3、7、29 是夹在它们中间');
  // 4/7 and 17/29 are mediants of neighbouring convergents
  check('ch7 4/7 mediant', [E.best(7, 1.5).k, 7].join('/'), '4/7'); check('ch7 17/29', [E.best(29, 1.5).k, 29].join('/'), '17/29');
  const err = (N, r) => E.best(N, r).err;
  check('ch7 12 fifth', sgn(err(12, 1.5), 2), '−1.96'); says('ch7.p3', '12 等分的五度只差 −1.96 音分');
  check('ch7 53 fifth', sgn(err(53, 1.5), 2), '−0.07'); check('ch7 53 third', sgn(err(53, 1.25), 2), '−1.41'); says('ch7.p3', '53 等分的五度只差 −0.07 音分，大三度差 −1.41 音分');
  check('ch7 12 fifth 3dp', f(-err(12, 1.5), 3), '1.955'); says('ch7.p3', '少 1.955 音分');
  check('ch7 12 × fifth error = −comma', f(12 * err(12, 1.5), 2), f(-Y.comma(), 2)); says('ch7.p3', '12 个加起来是 −23.46 音分');
  check('ch7 12 third', sgn(err(12, 1.25), 2), '+13.69'); says('ch7.p4', '12 等分的大三度偏高 13.69 音分');
  check('ch7 19', sgn(err(19, 1.25), 2) + ' ' + sgn(err(19, 1.5), 2), '−7.37 −7.22'); says('ch7.p4', '19 等分的三度好一些（−7.37），五度却差到 −7.22');
  check('ch7 31', sgn(err(31, 1.25), 2) + ' ' + sgn(err(31, 1.5), 2), '+0.78 −5.18'); says('ch7.p4', '31 等分的三度几乎是纯的（+0.78），五度 −5.18');
  // no N ≤ 30 has both |fifth| < 5 and |third| < 5 cents
  let both = null; for (let N = 1; N <= 30 && both == null; N++) if (Math.abs(err(N, 1.5)) < 5 && Math.abs(err(N, 1.25)) < 5) both = N;
  check('ch7 no small N does both well', both, null);
}

/* ── ch8 equal temperament ── */
{
  check('ch8 semitone', f(Math.pow(2, 1 / 12), 5), '1.05946'); says('ch8.p1', '1.05946');
  const tab = Object.fromEntries(T.etVsJust().map(r => [r.semis, r.err]));
  check('ch8 fifth/fourth', [f(-tab[7], 2), f(tab[5], 2)].join(' '), '1.96 1.96'); says('ch8.p4', '五度和四度只差 1.96 音分');
  const thirdsSixths = [3, 4, 8, 9].map(s => Math.abs(tab[s]));
  check('ch8 thirds/sixths in 13–16', thirdsSixths.every(x => x >= 13 && x <= 16), true); says('ch8.p4', '大三度、小三度、大六度、小六度差 13 到 16 音分');
  const b4 = T.beats('et', 0, M.C4), b3 = T.beats('et', 0, M.C3);
  check('ch8 C4 third beat', f(b4.third, 1), '10.4'); says('ch8.p4', '每秒拍约 10.4 次');
  check('ch8 C3 third beat', f(b3.third, 1), '5.2'); says('ch8.p4', '每秒 5.2 次'); says('ch10.t2', '每秒 5.2 次和 0.44 次');
  check('ch8 C4 fifth beat', f(b4.fifth, 2), '0.89'); says('ch8.p4', '每秒只拍 0.89 次');
  check('ch10 C3 fifth beat', f(b3.fifth, 2), '0.44');
  check('ch8 13.69', f(T.triad('et', 0).thirdErr, 2), '13.69'); says('ch8.p4', '这 13.69 音分');
  // every key in equal temperament has the same errors
  for (let k = 0; k < 12; k++) { const tr = T.triad('et', k); check('ch8 et key ' + k, f(tr.thirdErr, 6) + f(tr.fifthErr, 6), f(T.triad('et', 0).thirdErr, 6) + f(T.triad('et', 0).fifthErr, 6)); }
  check('ch8 just B♭ = 9:5', T.JUST[10], 9 / 5); says('ch8.limit', 'B♭ 取 9:5');
  check('ch8 just D wolf', f(T.triad('just', 2).fifthErr, 2), '-21.51');
  check('ch8 pyth C third 81:64', f(M.cents(T.triad('pyth', 0).third) - M.cents(81 / 64), 9), f(0, 9));
  check('ch8 pyth wolf = −comma', f(T.triad('pyth', 1).fifthErr, 2), f(-Y.comma(), 2));
  check('ch8 pyth E third near', f(T.triad('pyth', 4).thirdErr, 2), '-1.95');
}

/* ── every live-sentence branch, over each control's range ── */
{
  const seen = new Set(), need = k => { n++; if (Z[k] == null) { fails++; console.error('FAIL missing copy key ' + k); } seen.add(k); };
  // ch1: N 1..16, pluck 1..12 /24, drop on/off
  for (let N = 1; N <= 16; N++) for (let p = 1; p <= 12; p++) for (const drop of [false, true]) need(M.say.ch1(M.pluck.active(N, p / 24, drop), drop, M.pluck.silenced(N, p / 24)));
  // ch2: every interval × detune −30..30
  for (const [p, q] of [[2, 1], [3, 2], [4, 3], [5, 4], [6, 5], [9, 8], [16, 15], [45, 32]]) for (let d = -30; d <= 30; d++) need(M.say.ch2(M.combs.sharedExact(p, q, 10), d));
  // ch3: base 0..36, delta 0..100 step 0.5
  for (let i = 0; i <= 36; i++) { const fr = 110 * Math.pow(2, i / 12); for (let d = 0; d <= 100; d += 0.5) need(M.say.ch3(d, R.peakDelta(fr), R.pair(fr, fr + d) / R.peakValue())); }
  // ch4: N 1..10, cursor 0..1250 (every 5 cents plus every dip)
  for (let N = 1; N <= 10; N++) { const dips = R.dips(R.spectrum('harmonic', N), M.C4, 0, 1250); const cs = []; for (let c = 0; c <= 1250; c += 5) cs.push(c); dips.forEach(d => cs.push(Math.round(d.cents))); for (const c of cs) need(M.say.ch4(N, c, dips)[0]); }
  // ch5: kinds × stretch 1.85..2.15
  for (const k of ['harmonic', 'stretched', 'bar']) for (let a = 185; a <= 215; a++) need(M.say.ch5(k, a / 100));
  // ch6: k 1..12
  for (let k = 1; k <= 12; k++) need(M.say.ch6(k, Y.sizes(k).length));
  // ch7: N 5..60
  const recs = E.records(1.5, 60); for (let N = 5; N <= 60; N++) need(M.say.ch7(N, recs));
  // ch8: systems × keys
  for (const sys of ['et', 'just', 'pyth']) for (let k = 0; k < 12; k++) { const tr = T.triad(sys, k); need(M.say.ch8(sys, tr.thirdErr, tr.fifthErr)); }
  // every sentence key in the copy is reachable (except the two safety nets that no state of this tuning reaches)
  const unreachable = new Set(['ch8.say.just.near', 'ch8.say.pyth.pure']);
  for (const k of Object.keys(Z).filter(k => /\.say\./.test(k))) { n++; if (!seen.has(k) && !unreachable.has(k)) { fails++; console.error('FAIL sentence never reached: ' + k); } }
  for (const k of unreachable) check('unreachable stays unreachable: ' + k, seen.has(k), false);
  // placeholders in the copy are all filled by the page: each say-template only uses names the page passes
  const passed = {
    ch1: 'g rate per f0 frac list n', ch2: 'p q n H k d a b beat', ch3: 'd f r ds dc', ch4: 'n v p q c dip x', ch5: 'c A r8 rd x',
    ch6: 'n a b c comma', ch7: 'n k fe j te prev pe', ch8: 'key te fe tb fb f'
  };
  for (const k of Object.keys(Z).filter(k => /^ch\d\.say\./.test(k))) {
    const ch = k.split('.')[0], ok = passed[ch].split(' ');
    for (const m of Z[k].match(/\{(\w+)\}/g) || []) { n++; if (!ok.includes(m.slice(1, -1))) { fails++; console.error(`FAIL ${k} uses {${m.slice(1, -1)}} which the page does not pass`); } }
  }
}

/* ── prose numbers that are not the model's: none may slip in unpinned (spot list of digits sequences in ch prose) ── */
{
  // every number in a chapter's p/law text must appear in this allow-list of model-pinned or definitional values
  const allowed = new Set(['0', '967', '1.4', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '12', '13', '16', '19', '20', '23', '24', '29', '30', '31', '41', '53', '66', '99', '100', '702', '720', '688', '1200', '1284', '1584', '1965', '2010', '2016', '2020',
    '130.81', '7.64', '25.8', '19.5', '283', '34.1', '440', '110', '880', '3.51', '5.75', '0.24', '0.0207', '18.96', '0.60', '1.11', '0.88', '261.63', '2.76', '5.40', '8.93', '2.1', '36.6',
    '23.46', '531441', '524288', '1.01364', '294.13', '203.91', '90.22', '113.69', '0.58496', '1.96', '0.07', '1.41', '1.955', '13.69', '7.37', '7.22', '0.78', '5.18', '1.05946', '10.4', '5.2', '0.89', '0.44', '11', '15', '45', '32', '81', '64']);
  for (const k of Object.keys(Z).filter(k => /^ch\d+\.(p\d|law|limit|c\d|t\d|q\d)$/.test(k))) {
    const txt = Z[k].replace(/<[^>]+>/g, ' ').replace(/#step\d/g, '');
    for (const m of txt.match(/\d+(?:\.\d+)?/g) || []) { n++; if (!allowed.has(m)) { fails++; console.error(`FAIL ${k}: number ${m} is not pinned`); } }
  }
}

if (fails) { console.error(`${fails} of ${n} checks failed`); process.exit(1); }
console.log(`PASS: ${n} checks (every prose number recomputed from models.js; every live-sentence branch walked over the full control ranges)`);
