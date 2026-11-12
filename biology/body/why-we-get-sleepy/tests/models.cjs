'use strict';
// Pins every number the essay's prose states to the page's own models, checks the prose (copy.zh.js) still says
// exactly that number, and drives every live-sentence branch at the control extremes.
// Run: node biology/body/why-we-get-sleepy/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const M = require(path.join(__dirname, '..', 'models.js'));
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;
const app = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

let n = 0, fails = 0;
function check(name, got, want) { n++; if (got !== want) { fails++; console.error(`FAIL ${name}: model gives ${got}, expected ${want}`); } }
function ok(name, cond) { check(name, !!cond, true); }
function says(key, phrase) { n++; if (!Z[key] || !Z[key].includes(phrase)) { fails++; console.error(`FAIL prose ${key} should contain "${phrase}"`); } }
const f = (x, d) => (+x).toFixed(d);
const hm = x => { x = M.mod24(x); let H = Math.floor(x), m = Math.round((x - H) * 60); if (m === 60) { H = (H + 1) % 24; m = 0; } return H + ':' + String(m).padStart(2, '0'); };
// a phrase built from a model value must appear in the prose
const sayNum = (key, tmpl, ...vals) => says(key, vals.reduce((s, v, i) => s.replace('$' + (i + 1), v), tmpl));
const range = (a, b, s) => { const o = []; for (let v = a; v <= b + 1e-9; v += s) o.push(+v.toFixed(4)); return o; };
const reached = {};
const hit = k => { reached[k] = true; n++; if (Z[k] == null) { fails++; console.error('FAIL branch key missing ' + k); } };

/* ── 01 Process S ── */
{
  check('ch1 τw', M.S.TW, 18.2); check('ch1 τs', M.S.TS, 4.2);
  says('ch1.p2', '时间常数 18.2 小时'); says('ch1.p2', '时间常数 4.2 小时');
  sayNum('ch1.p3', '每过 <strong>$1 小时</strong>减半', f(M.S.halfRise(), 1));
  sayNum('ch1.p3', '每过 <strong>$1 小时</strong>减半', f(M.S.halfFall(), 1));
  const p8 = M.S.periodic(16, 8), p6 = M.S.periodic(18, 6), p4 = M.S.periodic(20, 4);
  sayNum('ch1.p3', '在 $1 和 $2 之间来回', f(p8.wake, 2), f(p8.bed, 2));
  sayNum('ch1.p3', '从 $1 抬到 $2', f(p8.wake, 2), f(p6.wake, 2));
  sayNum('ch1.p3', '醒来时就是 $1', f(p4.wake, 2));
  // "two nights": with 6 h from night 3, the waking value is within 0.005 of its limit on the second changed night
  const r = M.S.routine({ Z: 6, days: 7, pre: 2 });
  ok('ch1 not settled after 1 night', Math.abs(r.nights[2].wake - p6.wake) >= 0.005);
  ok('ch1 settled after 2 nights', Math.abs(r.nights[3].wake - p6.wake) < 0.005); says('ch1.p3', '两晚就稳定下来');
  says('ch1.p2', '差了四倍多'); ok('ch1 ratio 4-5', M.S.TW / M.S.TS > 4 && M.S.TW / M.S.TS < 5);
  // branches over the slider (4–10 step 0.5)
  for (const z of range(4, 10, 0.5)) hit(z === 8 ? 'ch1.say.same' : z < 8 ? 'ch1.say.less' : 'ch1.say.more');
  ok('ch1 slider range in html', /id="sZ" min="4" max="10" step="0.5" value="6"/.test(html));
}

/* ── 02 two-process ── */
{
  check('ch2 H⁺', M.TP.HU, 0.60); check('ch2 H⁻', M.TP.HL, 0.17); check('ch2 a', M.TP.A, 0.10);
  says('ch2.p2', '入睡线 0.60 + 0.10·C'); says('ch2.p2', '醒来线 0.17 + 0.10·C');
  const s = M.TP.settled({ cbt: 3.5 });
  sayNum('ch2.p3', '<strong>$1</strong> 睡着，<strong>$2</strong> 醒来，一觉 $3 小时', hm(s.onset), hm(s.wake), f(s.dur, 1));
  // wake 3.5 h after CBTmin (the tuned alignment), inside the measured 3–4.5 h
  check('ch2 wake − CBTmin', f(M.mod24(s.wake - 3.5), 1), '3.5'); says('ch2.p2', '体温最低点后 3.5 小时'); says('ch2.p2', '3 到 4.5 小时');
  const s7 = M.TP.settled({ cbt: 7 });
  sayNum('ch2.p3', '推后到 $1 和 $2，一觉还是 $3 小时', hm(s7.onset), hm(s7.wake), f(s7.dur, 1));
  sayNum('ch2.p4', '一个循环只有 <strong>$1 小时</strong>', f(M.TP.cycle({ a: 0 }), 1));
  check('ch2 locks at 0.065', f(M.TP.cycle({ a: 0.065 }), 2), '24.00'); ok('ch2 drifts at 0.06', Math.abs(M.TP.cycle({ a: 0.06 }) - 24) > 0.05);
  says('ch2.p4', 'a 在 0.065 以上'); says('ch2.p4', '降到 0.06，就锁不住了');
  for (const a of range(0, 0.1, 0.005)) { const c = M.TP.cycle({ cbt: 3.5, a }), locked = Math.abs(c - 24) < 0.05; hit(a === 0 ? 'ch2.say.none' : !locked ? 'ch2.say.drift' : 'ch2.say.locked'); if (a >= 0.065) ok('ch2 locked a=' + a, locked); }
}

/* ── 03 staying up ── */
{
  const base = M.TP.scenario({});
  const r4 = M.TP.scenario({ extra: 4 });
  sayNum('ch3.p3', '$1 睡下，$2 就醒了，只睡 $3 小时，比平常的 $4 小时还少', hm(r4.rec.onset), hm(r4.rec.wake), f(r4.rec.dur, 1), f(base.natural.dur, 1));
  const r12 = M.TP.scenario({ extra: 12 });
  sayNum('ch3.p3', '清晨 <strong>$1</strong> 前后', hm(r12.worst.t));
  ok('ch3 worst sleepiness at +12 is in the early morning, not the end', r12.worst.t < base.natural.onset + 12 - 1 && M.mod24(r12.worst.t) > 5 && M.mod24(r12.worst.t) < 9);
  const r24 = M.TP.scenario({ extra: 24 });
  sayNum('ch3.p4', '平常的点 $1 再睡', hm(r24.rec.onset));
  sayNum('ch3.p4', '补觉也只有 $1 小时，比平常只多 $2 小时', f(r24.rec.dur, 1), f(r24.rec.dur - base.natural.dur, 1));
  const awake = r24.rec.onset - (7 - 24 * 0); // woke at 07:00 on day 5 (time 7 relative to day-5 midnight)
  ok('ch3 nearly 40 h awake', awake > 38 && awake < 40); says('ch3.p4', '将近 40 小时');
  const nap = M.TP.scenario({ nap: true });
  sayNum('ch3.p4', '推迟到 $1', hm(nap.rec.onset));
  // branches over the slider 0–24 with and without the nap
  for (const nap of [false, true]) for (const x of range(0, 24, 1)) {
    const r = M.TP.scenario({ extra: x, nap }), nat = r.natural;
    const sleepy = r.worst && r.worst.gap > 0;
    const k = x === 0 ? (nap ? 'ch3.say.nap' : 'ch3.say.base') : !sleepy ? 'ch3.say.easy' : r.rec.dur > nat.dur ? 'ch3.say.long' : 'ch3.say.short';
    hit(k); ok(`ch3 recovery exists x=${x} nap=${nap}`, r.rec);
    if (x > 0 && !nap) ok(`ch3 sleepy while kept awake x=${x}`, sleepy);
    if (r.rec && x > 0) ok(`ch3 long/short is never a near-tie x=${x}`, Math.abs(r.rec.dur - nat.dur) > 0.2);
    if (r.rec) ok(`ch3 recovery within the drawn window x=${x}`, r.rec.wake < 7 + 53 && r.rec.onset >= 0 && r.rec.wake < 72);
  }
}

/* ── 04 free run ── */
{
  says('ch4.p2', '24.18 小时'); says('ch4.p2', '24.15 ± 0.2 小时'); says('ch4.p2', '女性平均 24.09 小时，男性 24.19 小时'); says('ch4.p2', '女性中占 35%，男性中占 14%');
  check('ch4 τ default', M.jfk.P.tau, 24.2);
  const c = M.coupled.isolation({ tau: 24.2, dark: true }), k = c.length, per = (c[k - 1] - c[0]) / (k - 1) - 24;
  sayNum('ch4.p3', '每天后移 <strong>$1 小时</strong>', f(per, 2)); sayNum('ch4.p3', '也就是 $1 分钟', f(per * 60, 0));
  sayNum('ch4.p3', '第 1 天在 $1，第 $2 天到了 $3，一共推后 $4 小时', hm(c[0]), String(k), hm(c[k - 1]), f(c[k - 1] - c[0] - 24 * (k - 1), 1));
  const c6 = M.coupled.isolation({ tau: 24.6, dark: true }), p6 = (c6[c6.length - 1] - c6[0]) / (c6.length - 1) - 24;
  sayNum('ch4.p3', '每天就要后移 $1 小时', f(p6, 2));
  const cd = M.coupled.isolation({ tau: 24.2, dark: false }); ok('ch4 ordinary day holds', Math.abs(cd[cd.length - 1] - cd[0] - 24 * (cd.length - 1)) < 0.2);
  says('ch4.p4', '41 位'); says('ch4.p4', '39%'); says('ch4.p4', '24%'); says('ch4.p4', '37%');
  for (const tau of range(23.8, 24.6, 0.05)) for (const dark of [true, false]) {
    const cc = M.coupled.isolation({ tau, dark }), m = cc.length, pp = (cc[m - 1] - cc[0]) / (m - 1) - 24;
    hit(!dark ? 'ch4.say.day' : Math.abs(pp) < 0.02 ? 'ch4.say.flat' : pp > 0 ? 'ch4.say.later' : 'ch4.say.earlier');
    check(`ch4 20 cycles τ=${tau} dark=${dark}`, m, 20);
    if (!dark) ok(`ch4 held τ=${tau}`, Math.abs(pp) < 0.02);
  }
}

/* ── 05 PRC ── */
{
  const long = M.jfk.prcCurve({ dur: 6.7, lux: 9500, step: 0.5 }), v = long.map(q => q[1]);
  const mx = long.reduce((a, b) => b[1] > a[1] ? b : a), mn = long.reduce((a, b) => b[1] < a[1] ? b : a);
  sayNum('ch5.p3', '最大提前 $1 小时，出现在体温最低点后 $2 小时', f(mx[1], 1), String(mx[0]));
  sayNum('ch5.p3', '最大推后 $1 小时，出现在体温最低点前 $2 小时', f(-mn[1], 1), String(-mn[0]));
  sayNum('ch5.p3', '峰谷差 <strong>$1 小时</strong>', f(Math.max(...v) - Math.min(...v), 1)); says('ch5.p3', '实测是 5.02 小时'); says('ch5.p2', '5.02 小时');
  // delays before CBTmin, advances after (Khalsa 2003): sign pattern of the model curve
  ok('ch5 delays at −6..−1', long.filter(q => q[0] >= -6 && q[0] <= -1).every(q => q[1] < 0));
  ok('ch5 advances at +1..+6', long.filter(q => q[0] >= 1 && q[0] <= 6).every(q => q[1] > 0));
  const sh = M.jfk.prcCurve({ dur: 1, lux: 8000, step: 0.5 }).map(q => q[1]);
  sayNum('ch5.p3', '模型的峰谷差是 $1 小时，实测 2.20 小时', f(Math.max(...sh) - Math.min(...sh), 1)); says('ch5.p2', '峰谷差 2.20 小时');
  const rm = M.jfk.prcCurve({ dur: 6.7, lux: 300, step: 0.5 }).map(q => q[1]), ptr = Math.max(...rm) - Math.min(...rm), ptl = Math.max(...v) - Math.min(...v);
  sayNum('ch5.p4', '峰谷差还有 $1 小时', f(ptr, 1)); ok('ch5 room ≈ 六成多 of bright', ptr / ptl > 0.6 && ptr / ptl < 0.7); says('ch5.p4', '六成多');
  check('ch5 app pulses', /long: \{ dur: 6\.7, lux: 9500, meas: 5\.02 \}, short: \{ dur: 1, lux: 8000, meas: 2\.20 \}, room: \{ dur: 6\.7, lux: 300/.test(app), true);
  for (const [d, l] of [[6.7, 9500], [1, 8000], [6.7, 300]]) for (const q of M.jfk.prcCurve({ dur: d, lux: l, step: 0.5 })) hit(Math.abs(q[1]) < 0.05 ? 'ch5.say.none' : q[1] > 0 ? 'ch5.say.adv' : 'ch5.say.del');
}

/* ── 06 chronotype ── */
const DAYLUX = [100, 300, 1000, 3000, 10000], EVELUX = [10, 50, 150, 300, 500];
{
  ok('ch6 app light lists', app.includes('const DAYLUX = [100, 300, 1000, 3000, 10000], EVELUX = [10, 50, 150, 300, 500];'));
  const d = M.coupled.chronotype({});
  ok('ch6 default held', d.held);
  sayNum('ch6.p3', '每天 <strong>$1</strong> 入睡，$2 醒来，体温最低点在 $3', hm(d.onset), hm(d.wake), hm(d.cbt));
  check('ch6 default CBT = ch2 default 3:30', hm(d.cbt), hm(3.5)); says('ch6.p4', '默认放在 3:30');
  sayNum('ch6.p3', '24.0 小时，作息提前到 $1 入睡', hm(M.coupled.chronotype({ tau: 24 }).onset));
  sayNum('ch6.p3', '10 000 勒克斯，提前到 $1', hm(M.coupled.chronotype({ day: 10000 }).onset));
  sayNum('ch6.p3', '50 勒克斯，提前到 $1', hm(M.coupled.chronotype({ eve: 50 }).onset));
  const e3 = M.coupled.chronotype({ eve: 300 }); ok('ch6 eve 300 not held', !e3.held); sayNum('ch6.p3', '每天往后漂 $1 分钟', f(e3.drift * 60, 0));
  for (const tau of [23.8, 24.2, 24.6]) for (const dl of DAYLUX) for (const el of EVELUX) {
    const r = M.coupled.chronotype({ tau, day: dl, eve: el });
    hit(!r.held ? 'ch6.say.drift' : (r.onset > 6 && r.onset < 18) ? 'ch6.say.flipped' : 'ch6.say.held');
  }
}

/* ── 07 jet lag ── */
{
  says('ch7.p2', '约 <strong>92 分钟</strong>'); says('ch7.p2', '约 <strong>57 分钟</strong>');
  sayNum('ch7.p2', '向西约要 $1 天，向东约要 $2 天', f(8 * 60 / 92, 1), f(8 * 60 / 57, 1));
  says('ch7.p4', '57 到 92 分钟');
  const L = M.light.simple(1000, 150);
  const e8 = M.coupled.jet({ N: 8, lux: L }), w8 = M.coupled.jet({ N: -8, lux: L });
  sayNum('ch7.p3', '向东用 <strong>$1 天</strong>，向西用 <strong>$2 天</strong>', f(e8.settle, 1), f(w8.settle, 1));
  ok('ch7 τ 24.2: east faster here (stated as a mismatch)', e8.settle < w8.settle);
  const e8l = M.coupled.jet({ N: 8, tau: 24.6, lux: L }), w8l = M.coupled.jet({ N: -8, tau: 24.6, lux: L });
  sayNum('ch7.p3', '向东 $1 天、向西 $2 天', f(e8l.settle, 1), f(w8l.settle, 1)); ok('ch7 τ 24.6: east slower', e8l.settle > w8l.settle);
  says('ch7.p3', '0.2 小时（第四章）');
  const a9 = M.coupled.jet({ N: 9, lux: M.light.simple(300, 150) }); ok('ch7 300 lux, 9 east is antidromic', a9.antidromic);
  const e6 = M.coupled.jet({ N: 6, lux: L }), w6 = M.coupled.jet({ N: -6, lux: L });
  sayNum('ch7.p5', '第一晚 8 小时里只睡着 $1 小时', f(e6.nights[0], 1));
  sayNum('ch7.p5', '有 $1 小时 S 已经过了入睡线', f(w6.doze[0], 1));
  ok('ch7 app default 8 zones', /id="jlN" min="1" max="12" step="1" value="8"/.test(html) && /name="jlL" value="1000" checked/.test(html));
  // branches at slider extremes and middles, all three light levels, τ extremes
  for (const lux of [300, 1000, 5000]) for (const tau of [23.8, 24.2, 24.6]) for (const N of [1, 3, 6, 8, 9, 11, 12]) {
    const E = M.coupled.jet({ N, tau, lux: M.light.simple(lux, 150) }), W = M.coupled.jet({ N: -N, tau, lux: M.light.simple(lux, 150) });
    const es = E.settle == null ? 99 : E.settle, ws = W.settle == null ? 99 : W.settle;
    hit(N === 12 ? 'ch7.say.twelve' : (E.settle == null || W.settle == null) ? 'ch7.say.unsettled' : E.antidromic ? 'ch7.say.anti' : es > ws + 0.9 ? 'ch7.say.eastslow' : ws > es + 0.9 ? 'ch7.say.westslow' : 'ch7.say.same');
    ok(`ch7 mis series present N=${N}`, E.mis.length > 10 && W.mis.length > 10);
    ok(`ch7 first point is the full jump N=${N}`, Math.abs(Math.abs(E.mis[0].d) - N) < 3 || N >= 9);
  }
}

/* ── 08 week ── */
const WORKLUX = [30, 100, 300, 1000], COMMUTE = [100, 1000, 10000];
{
  ok('ch8 app lists', app.includes('const WORKLUX = [30, 100, 300, 1000], COMMUTE = [100, 1000, 10000];') && app.includes('const OFFICE_DAY = 300, NIGHT_DAY = 1000;'));
  says('ch8.model.how', '算 300 勒克斯'); says('ch8.model.how', '算 1000 勒克斯');
  ok('ch8 defaults', /id="wkE" min="0" max="4" step="1" value="3"/.test(html) && /id="wkW" min="0" max="3" step="1" value="1"/.test(html) && /id="wkC" min="0" max="2" step="1" value="1"/.test(html));
  const o = M.coupled.week({ kind: 'office', day: 300, eve: EVELUX[3] });
  sayNum('ch8.p3', '社会时差约 <strong>$1 小时</strong>', f(o.sjl, 1));
  sayNum('ch8.p3', '工作日睡 $1 小时，周末睡 $2 小时，周日晚上要到 $3 才困，周一那一觉只有 $4 小时', f(o.durWork, 1), f(o.durFree, 1), hm(o.sundayOnset), f(o.mondayDur, 1));
  check('ch8 eve 50 → no social jet lag', f(Math.max(0, M.coupled.week({ kind: 'office', day: 300, eve: 50 }).sjl), 1), '0.0');
  says('ch8.p3', '晚上 300 勒克斯'); says('ch8.p3', '降到 50 勒克斯');
  const nd = M.coupled.week({ kind: 'night', day: 1000, work: 100, commute: 1000 });
  ok('ch8 default night: clock stays at night', nd.cbtSat < 9 && Math.abs(nd.weekShift) <= 0.5);
  sayNum('ch8.p4', '白天只能睡 $1 小时左右', f(nd.daySleep, 1)); says('ch8.p4', '体温最低点在早上 4 点多'); ok('ch8 4-something', Math.floor(nd.cbtSat) === 4 && Math.floor(nd.cbtMon) === 4);
  const n3 = M.coupled.week({ kind: 'night', day: 1000, work: 300, commute: 1000 }); ok('ch8 work 300 flips', n3.cbtSat >= 9 && n3.cbtSat < 21);
  says('ch8.p2', '不到 3%'); says('ch8.p2', '不到四分之一');
  for (const e of EVELUX) { const r = M.coupled.week({ kind: 'office', day: 300, eve: e }); hit(Math.max(0, r.sjl) < 0.1 ? 'ch8.say.none' : 'ch8.say.sjl'); ok('ch8 sunday onset e=' + e, r.sundayOnset != null && r.mondayDur != null); }
  for (const w of WORKLUX) for (const c of COMMUTE) { const r = M.coupled.week({ kind: 'night', day: 1000, work: w, commute: c }); hit(Math.abs(r.weekShift) > 0.5 ? 'ch8.say.torn' : (r.cbtSat >= 9 && r.cbtSat < 21) ? 'ch8.say.flipped' : 'ch8.say.daylocked'); ok(`ch8 night values w=${w} c=${c}`, r.cbtMon != null && r.cbtSat != null && r.weekShift != null); }
}

/* ── 09 caffeine ── */
{
  says('ch9.p2', '30 到 120 分钟'); says('ch9.p2', '平均 4 到 6 小时'); says('ch9.p2', '1.5 到 10 小时'); says('ch9.p3', '113 到 247 毫克'); says('ch9.p4', '400 毫克');
  check('ch9 KA', M.caffeine.KA, 4); says('ch9.model.how', '每小时 4');
  const tm = [3, 7].map(h => M.caffeine.tmax(h) * 60); ok('ch9 tmax 40–60 min for t½ 3–7', tm[0] >= 40 && tm[1] <= 60); says('ch9.model.how', '40 到 60 分钟');
  ok('ch9 tmax inside 30–120 min across the slider', range(1.5, 10, 0.5).every(h => M.caffeine.tmax(h) * 60 >= 30 && M.caffeine.tmax(h) * 60 <= 120));
  const bed = M.mod24(M.TP.settled({ cbt: 3.5 }).onset); says('ch9.model.how', '入睡点 ' + hm(bed));
  const a = h => M.caffeine.amount(bed, [{ t: 15, mg: 200 }], h);
  sayNum('ch9.p3', '体内还剩约 <strong>$1 毫克</strong>，是喝下去的 $2%', f(a(5), 0), f(a(5) / 2, 0));
  sayNum('ch9.p3', '半衰期 3 小时的人只剩 $1 毫克，7 小时的人还剩 $2 毫克', f(a(3), 0), f(a(7), 0));
  sayNum('ch9.p3', '上床时剩 $1 毫克', f(M.caffeine.amount(bed, [{ t: 12, mg: 200 }], 5), 0));
  // bed falls on the evening of the coffee day
  ok('ch9 bed in the evening', bed > 18 && bed < 24);
  for (const T of range(6, 22, 0.5)) for (const H of [1.5, 5, 10]) for (const D of [100, 200]) { const sh = M.caffeine.amount(bed, [{ t: T, mg: D }], H) / D; hit(sh >= 0.5 ? 'ch9.say.most' : sh >= 0.25 ? 'ch9.say.half' : 'ch9.say.little'); }
}

/* ── 10 consensus ranges ── */
{ says('ch10.p3', '7 到 9 小时'); says('ch10.p3', '65 岁以上 7 到 8 小时'); says('ch10.p3', '8 到 10 小时'); }

/* ── every branch key the app can choose is reached at least once by the sweeps above ── */
for (const m of app.matchAll(/'(ch\d\.say\.\w+)'/g)) { n++; if (!reached[m[1]]) { fails++; console.error('FAIL branch never reached in sweeps: ' + m[1]); } }

/* ── every placeholder used in copy is filled by the app ── */
{
  for (const [k, v] of Object.entries(Z)) for (const m of v.matchAll(/\{(\w+)\}/g)) {
    n++; if (!new RegExp('(\\b' + m[1] + '\\s*:)').test(app)) { fails++; console.error(`FAIL placeholder {${m[1]}} in ${k} is never supplied by app.js`); }
  }
  const keys = new Set([...html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)].map(m => m[1]));
  for (const m of app.matchAll(/\bt\('([\w.]+)'/g)) if (/^[\w]+\.[\w.]*\w$/.test(m[1])) keys.add(m[1]);
  for (const m of app.matchAll(/'(ch\d\.say\.\w+)'/g)) keys.add(m[1]);
  for (let i = 0; i < 7; i++) keys.add('ch8.dow.' + i);
  for (let i = 0; i < 3; i++) keys.add('ch3.day.' + i);
  for (const k of ['long', 'short', 'room']) keys.add('ch5.pulse.' + k);
  for (const k of keys) { n++; if (Z[k] == null) { fails++; console.error('FAIL missing zh key ' + k); } }
  // no "left/right figure" wording
  for (const [k, v] of Object.entries(Z)) { n++; if (/左图|右图|左边的图|右边的图|左侧|右侧/.test(v)) { fails++; console.error('FAIL left/right wording in ' + k); } }
  // no Chinese outside copy.zh.js, except the 中 toggle and the static <title>/meta description
  for (const file of ['index.html', 'app.js', 'models.js']) {
    const src = fs.readFileSync(path.join(__dirname, '..', file), 'utf8').replace(/<title>[\s\S]*?<\/title>/, '').replace(/<meta name="description"[^>]*>/, '')
      .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '').replace(/<!--[\s\S]*?-->/g, '');
    n++;
    const others = (src.match(/[一-鿿]+/g) || []).filter(x => !(file === 'index.html' && x === '中'));
    if (others.length) { fails++; console.error(`FAIL Chinese text in ${file}: ${others.slice(0, 3).join(' ')}`); }
  }
}

if (fails) { console.error(`\n${fails} of ${n} checks failed`); process.exit(1); }
console.log(`PASS: ${n} checks (every number in the prose matches the models; every live-sentence branch reached)`);
