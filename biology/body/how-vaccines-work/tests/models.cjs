'use strict';
// Pins every number the essay's prose states to the page's own models, and checks that the prose
// (copy.zh.js) says exactly that number. Every expected string below is computed from models.js and
// formatted the way the page formats it; literals appear only for sourced real-world figures.
// Run: node biology/body/how-vaccines-work/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const M = require(path.join(__dirname, '..', 'models.js'));
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');

let n = 0, fails = 0;
function check(name, got, want) { n++; if (got !== want) { fails++; console.error(`FAIL ${name}: got ${got}, expected ${want}`); } }
function says(key, phrase) { n++; if (!Z[key] || !Z[key].includes(phrase)) { fails++; console.error(`FAIL prose ${key} should contain "${phrase}"`); } }
// formatting as on the page (zh)
const fmt = (x, d = 0) => (Math.abs(x) < 0.5 * Math.pow(10, -d) ? 0 : x).toLocaleString('zh-CN', { minimumFractionDigits: d, maximumFractionDigits: d });
const pct = (x, d = 0) => fmt(x * 100, d) + '%';
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹', sup = k => String(k).split('').map(c => SUP[+c]).join('');
function big(x) { if (x < 1e4) return fmt(x, 0); let e = Math.floor(Math.log10(x)), m = +(x / Math.pow(10, e)).toFixed(1); if (m >= 10) { m = 1; e++; } return fmt(m, 1) + ' × 10' + sup(e); }
const val = id => { const m = html.match(new RegExp('id="' + id + '"[^>]*value="([^"]+)"')); return m && m[1]; };
const RATES = JSON.parse(app.match(/const RATES = (\[[^\]]+\])/)[1]);
const dbl = r => 24 * Math.LN2 / r;
const I = M.immune;

/* ── ch1 the race ── */
{
  const r = RATES[+val('raceR')];
  check('ch1 default rate', r, 3);
  says('ch1.p3', `每 ${fmt(dbl(r), 1)} 小时翻一倍`);
  const x = I.infection({ infectAt: 0, until: 28, P: { r } });
  says('ch1.p3', `最高点 ${big(x.peak)}`);
  says('ch1.p3', `翻了大约 ${fmt(Math.log2(x.peak))} 次`);
  says('ch1.p3', `第 ${fmt(x.tPeak, 1)} 天到顶`);
  says('ch1.p3', `抗体到第 ${fmt(x.detect, 1)} 天才能测到`);
  says('ch1.p3', `有症状约 ${fmt(x.sickDays, 1)} 天，其中约 ${fmt(x.severeDays, 1)} 天`);
  check('ch1 default: severe at all', x.severeDays > 0, true);
  const s = I.infection({ infectAt: 0, until: 28, P: { r: RATES[0] } });
  says('ch1.p3', `每 ${fmt(dbl(RATES[0]), 1)} 小时翻一倍`);
  says('ch1.p3', `最高只到 ${big(s.peak)}，第 ${fmt(s.tPeak, 1)} 天才到顶，有症状约 ${fmt(s.sickDays, 1)} 天`);
  check('ch1 slow virus never severe', s.severeDays, 0);
  check('ch1 slow virus still sick', s.sickDays > 0, true);
  // the virus is cleared within the 28-day window at every slider position (so the chart shows the whole course)
  for (const rr of RATES) check('ch1 cleared by day 28 at r=' + rr, I.infection({ infectAt: 0, until: 28, P: { r: rr } }).cleared != null, true);
  says('ch1.p4', '大约有 10 天在血里测不到抗体'); says('ch1.p4', '大约三周才到最高'); // OpenStax Microbiology 18.4
}

/* ── ch2 primary and secondary response ── */
{
  check('ch2 IgG half-life parameter', I.P.halfAb, 21); says('ch2.p2', '半衰期约 21 天'); // Vidarsson 2014
  const gap = +val('doseGap') * 7; check('ch2 default gap 4 weeks', gap, 28);
  const d = I.doses([0, gap], gap + 150), [a, b] = d.res;
  says('ch2.p3', `抗体第 ${fmt(a.detect, 1)} 天才能测到，第 ${fmt(a.tPeak, 1)} 天到顶，最高约 ${big(a.peak)}`);
  const reach = (s, from) => { const q = s.find(x => x.t >= from - 1e-9 && x.E >= 100); return q.t - from; };
  says('ch2.p3', `扩增到 100 只要 ${fmt(reach(d.series, gap), 1)} 天，第一针要 ${fmt(reach(d.series, 0), 1)} 天`);
  says('ch2.p3', `抗体最高到 ${big(b.peak)}，是第一针的 ${fmt(b.peak / a.peak, 1)} 倍`);
  says('ch2.p3', `第一针留下了 ${fmt(a.memAfter)} 个单位的记忆细胞`);
  check('ch2 memory starts at N0 = 1', I.P.N0, 1);
  check('ch2 second dose detectable at once', b.abAtDose >= I.DETECT, true);
  const max = +html.match(/id="doseGap"[^>]*max="(\d+)"/)[1]; check('ch2 slider max 26 weeks', max, 26);
  const late = I.doses([0, max * 7], max * 7 + 150);
  says('ch2.p4', `抗体只剩约 ${big(late.res[1].abAtDose)}，已经测不到了`); check('ch2 26 weeks: undetectable at the dose', late.res[1].abAtDose < I.DETECT, true);
  says('ch2.p4', `抗体照样冲到 ${big(late.res[1].peak)}`);
  check('ch2 26 weeks boost within 10% of 4 weeks', Math.abs(late.res[1].peak / b.peak - 1) < 0.1, true);
  const one = I.doses([0], 210), lost = one.series.find(q => q.t > a.tPeak && q.Ab < I.DETECT);
  says('ch2.p4', `约 ${fmt(lost.t / 30.4, 1)} 个月后就测不到`);
  // the page's one-dose window (210 days) is long enough to show the loss
  check('ch2 page one-dose window', /ONE = 210/.test(app), true);
  // memory does not decay in the model (what the prose claims)
  check('ch2 memory kept', fmt(one.series[one.series.length - 1].M, 3), fmt(one.series.find(q => q.t >= 60).M, 3));
}

/* ── ch3 the race after vaccination ── */
{
  const r = RATES[+val('reR')], m = +val('reM'), at = 28 + m * 30.4;
  check('ch3 default rate = ch1', r, 3); check('ch3 default months', m, 12);
  const v = I.infection({ doses: [0, 28], infectAt: at, until: at + 28, P: { r } }), z = I.infection({ infectAt: 0, until: 28, P: { r } });
  const door = I.doorLevel(Object.assign({}, I.P, { r }));
  says('ch3.p3', `抗体只剩 ${big(v.abAtInfection)}，低于门槛 ${big(door)}`);
  says('ch3.p3', `有约 ${fmt(v.sickDays, 1)} 天的症状`);
  says('ch3.p3', `病毒最高只到 ${big(v.peak)}，是没打过疫苗的人（${big(z.peak)}）的 1/${fmt(z.peak / v.peak)}`);
  check('ch3 default never severe', v.severeDays, 0);
  says('ch3.p3', `有约 ${fmt(z.severeDays, 1)} 天在线上`);
  const m2 = I.infection({ doses: [0, 28], infectAt: 28 + 2 * 30.4, until: 28 + 2 * 30.4 + 28, P: { r } });
  check('ch3 month 2 blocked at the door', m2.peak <= 1.0001, true); says('ch3.p3', '第 2 个月时，病毒被拦在门口');
  const m3 = I.infection({ doses: [0, 28], infectAt: 28 + 3 * 30.4, until: 28 + 3 * 30.4 + 28, P: { r } });
  says('ch3.p3', `到第 3 个月，抗体降到 ${big(m3.abAtInfection)}，刚跌破门槛`);
  check('ch3 month 3 grows but silent', m3.abAtInfection < door && m3.peak > 1 && m3.sickDays === 0, true);
  // faster virus: breakthrough severe disease
  const rf = RATES[RATES.length - 1];
  says('ch3.p4', `每 ${fmt(dbl(rf), 1)} 小时翻一倍`);
  const vf = I.infection({ doses: [0, 28], infectAt: at, until: at + 28, P: { r: rf } }), zf = I.infection({ infectAt: 0, until: 28, P: { r: rf } });
  says('ch3.p4', `“病得很重”约 ${fmt(vf.severeDays, 1)} 天（没打过的人是 ${fmt(zf.severeDays, 1)} 天）`);
  // across all months, the vaccinated person is never worse off than the unvaccinated one
  for (let mm = 1; mm <= 24; mm++) for (const rr of [RATES[0], 3, rf]) { const a2 = 28 + mm * 30.4, vv = I.infection({ doses: [0, 28], infectAt: a2, until: a2 + 28, P: { r: rr } }), zz = I.infection({ infectAt: 0, until: 28, P: { r: rr } });
    if (!(vv.peak <= zz.peak && vv.sickDays <= zz.sickDays + 1e-9)) { n++; fails++; console.error(`FAIL ch3 vaccinated worse than unvaccinated at month ${mm}, r ${rr}`); } }
  // Feikin et al. 2022 (Lancet), sourced figures
  says('ch3.p4', '汇总了 18 项研究'); says('ch3.p4', '平均下降约 21 个百分点'); says('ch3.p4', '只下降约 10 个百分点'); says('ch3.p4', '一直高于 70%');
}

/* ── ch4 trial ── */
{
  const T = M.trial, R = { nV: 18198, nP: 18325, cV: 8, cP: 162 };
  // the page's preset is the trial's counts (Polack 2020, Table 2)
  check('ch4 preset counts in app', /REAL = \{ nV: 18198, nP: 18325, cV: 8, cP: 162 \}/.test(app), true);
  says('ch4.p2', '疫苗组 18,198 人，安慰剂组 18,325 人'); says('ch4.p2', '疫苗组有 8 人'); says('ch4.p2', '安慰剂组有 162 人'); says('ch4.p2', '95.0%');
  const a = T.analyze(R);
  says('ch4.p3', `每 1 万人 ${fmt(a.riskV * 1e4, 1)} 人`); says('ch4.p3', `每 1 万人 ${fmt(a.riskP * 1e4, 1)} 人`);
  says('ch4.p3', `前者是后者的 ${pct(a.rr, 1)}，效力就是 1 − ${pct(a.rr, 1)} = ${pct(a.ve, 1)}`);
  check('ch4 model reproduces the paper', pct(a.ve, 1), '95.0%');
  says('ch4.p3', `95% 区间是 ${pct(a.lo, 1)} 到 ${pct(a.hi, 1)}`); says('ch4.p3', '90.3% 到 97.6%');
  says('ch4.p3', `只有约 ${pct(a.riskV, 2)}`);
  says('ch4.p4', `约 ${pct(a.riskP, 2)} 的人生病`);
  says('ch4.p4', `少了约 ${fmt(a.arr * 1e4)} 个病例`); says('ch4.p4', `大约每 ${fmt(a.nnv)} 人打针`);
  const SIZES = JSON.parse(app.match(/SIZES = (\[[^\]]+\])/)[1]);
  check('ch4 smallest arm', SIZES[0], 500); says('ch4.p4', '每组人数拖到 500');
  const s = T.analyze({ nV: 500, nP: 500, cV: 1, cP: 10 });
  says('ch4.p4', `估计的效力是 ${pct(s.ve, 1)}，可 95% 区间宽到 ${pct(s.lo, 1)} 到 ${pct(s.hi, 1)}`);
  says('ch4.p4', `一个背后有 ${R.cV + R.cP} 个病例，一个只有 ${1 + 10} 个`);
  // the default slider positions are the trial's counts
  check('ch4 default sliders', val('trCP') + '/' + val('trCV'), '162/8');
  // zero cells: the Haldane-corrected interval is finite
  const z = T.analyze({ nV: 1000, nP: 1000, cV: 0, cP: 30 }); check('ch4 zero vaccine cases finite interval', isFinite(z.lo) && z.hi < 1 && z.lo > 0, true);
  // the live sentence for a zero cell reports the corrected estimate, which lies inside the corrected interval
  check('ch4 zero cell: corrected estimate inside its interval', z.lo < z.veC && z.veC < z.hi && z.ve === 1, true);
  check('ch4 corrected estimate equals the plain one without a zero cell', Math.abs(a.veC - a.ve) < 1e-12, true);
  // the page names its method and the paper's interval (Polack 2020, Table 2: beta-binomial, surveillance time)
  says('ch4.p3', 'Katz 法'); says('ch4.p3', '贝叶斯的 beta-二项模型'); says('ch4.model.how', 'Katz 法');
  // mean follow-up: 2.214 thousand person-years over 17,411 at risk (Polack 2020, Table 2) = about 1.5 months
  check('ch4 mean follow-up months', fmt(2214 / 17411 * 12, 1), '1.5'); says('ch4.p4', '约一个半月'); says('ch4.p4', '不是这种疫苗的固定属性');
}

/* ── ch5 base rates ── */
{
  const B = M.base, c = +val('brC') / 100, e = +val('brE') / 100, s = B.split({ c, e, a: 0.1, N: 100000 });
  says('ch5.model.how', '没打疫苗的人有 10% 生病'); check('ch5 page attack rate', /A = 0\.1, N = 100000/.test(app), true);
  says('ch5.p3', `默认接种率 ${pct(c)}、效力 ${pct(e)}`);
  says('ch5.p3', `打过疫苗的 ${fmt(s.popV)} 人中有 ${fmt(s.casesV)} 人生病，没打的 ${fmt(s.popU)} 人中有 ${fmt(s.casesU)} 人生病`);
  says('ch5.p3', `病例里约 ${pct(s.shareV)} 是打过疫苗的人`);
  says('ch5.p3', `打过疫苗的是 ${pct(s.rateV, 1)}，没打的是 ${pct(s.rateU, 1)}，差了 ${fmt(s.rateU / s.rateV)} 倍`);
  says('ch5.p3', `风险降了 ${pct(e)}`);
  says('ch5.p4', `效力 ${pct(e)} 时是 ${pct(B.crossing(e), 1)}`);
  check('ch5 crossing formula', Math.abs(B.shareV(B.crossing(e), e) - 0.5) < 1e-12, true);
  check('ch5 all vaccinated → all cases vaccinated', B.shareV(1, 0.9), 1);
}

/* ── ch6 herd protection ── */
{
  const H = M.herd, R0 = +val('hdR'), E = +val('hdE') / 100, c = +val('hdC') / 100;
  says('ch6.p3', `默认 R₀ 为 ${fmt(R0)}、效力 ${pct(E)}、接种率 ${pct(c)}`);
  says('ch6.p3', `实际传给 ${fmt(H.re(R0, c, E), 2)} 人`);
  says('ch6.p3', `有约 ${pct(H.attack(R0, c, E))} 的概率被感染`);
  says('ch6.p3', `推到 80%，他自己什么也没做，风险降到约 ${pct(H.attack(R0, 0.8, E))}`);
  says('ch6.p3', `推过 ${pct(H.coverageNeeded(R0, E), 1)}，在模型里降到 0`);
  check('ch6 above the threshold no outbreak', H.attack(R0, 0.84, E), 0);
  check('ch6 SIR model D = 7', H.D, 7); says('ch6.model.how', '每个病人平均传染 7 天');
  // the simulated epidemic agrees with the final-size equation
  const sim = H.runTo(R0, c, E, 2000); check('ch6 SIR final size = equation', Math.abs((1 - sim.S / sim.s0) - H.attack(R0, c, E)) < 0.01, true);
  // measles: R0 12–18 (Guerra 2017), one dose 93 %, two doses 97 % (CDC)
  says('ch6.p4', '12–18'); says('ch6.p4', '一剂约 93%，两剂约 97%');
  says('ch6.p4', `在 ${pct(H.coverageNeeded(12, 0.97), 1)}（R₀ = 12）到 ${pct(H.coverageNeeded(18, 0.97), 1)}（R₀ = 18）之间`);
  says('ch6.p4', `R₀ = 12 就需要 ${pct(H.coverageNeeded(12, 0.93), 1)}`);
  says('ch6.p4', '说的是防麻疹发病'); says('ch6.p2', '挡住感染、因而挡住传播');
  // unreachable case: vaccination still lowers the attack among both groups below the no-vaccine level
  for (const [r0, e, cc] of [[20, 0.5, 1], [20, 0.5, 0.5], [16, 0.9, 0.9]]) check(`ch6 unreachable still protects R0 ${r0} E ${e} c ${cc}`, H.coverageNeeded(r0, e) > 1 && H.attack(r0, cc, e) < H.attack(r0, 0, e), true);
  says('ch6.p4', `R₀ 只要超过 ${fmt(H.maxR0(0.93), 1)}`); check('ch6 one dose at R0 18 unreachable', H.coverageNeeded(18, 0.93) > 1, true);
}

/* ── ch7 waning ── */
{
  const W = M.wane, R0 = +app.match(/R0 = (\d+), E = ([\d.]+), SPAN = 48/)[1], E = +app.match(/R0 = (\d+), E = ([\d.]+), SPAN = 48/)[2];
  check('ch7 fixed R0/E', R0 + '/' + E, '3/0.95'); says('ch7.model.how', 'R₀ 为 3 的病'); says('ch7.model.how', '效力 95%');
  const Hh = +val('wnH'), c = +val('wnC') / 100;
  says('ch7.p3', `半衰期是 ${fmt(Hh)} 个月、接种率 ${pct(c)}`);
  says('ch7.p3', `只传给 ${fmt(R0 * (1 - c * E), 2)} 人`);
  const T = W.timeAbove(R0, c, E, Hh);
  says('ch7.p3', `第 ${fmt(T, 1)} 个月`); says('ch7.p3', `约 ${pct(W.shareAbove(R0, c, E, Hh, 0, 48))} 的时间`);
  says('ch7.p3', `每年约 ${fmt(12 - T, 1)} 个月（${pct(W.shareAbove(R0, c, E, Hh, 12, 48))} 的时间）`);
  check('ch7 six-monthly boosters keep Re below 1', W.shareAbove(R0, c, E, Hh, 6, 48), 0);
  says('ch7.p4', `从 ${fmt(T, 1)} 个月延长到 ${fmt(W.timeAbove(R0, 1, E, Hh), 1)} 个月`);
  // closed form = sampled Re crossing
  let tc = null; for (let m = 0; m <= 48; m += 0.001) if (W.re(m, R0, c, E, Hh, 0) > 1) { tc = m; break; }
  check('ch7 crossing closed form', Math.abs(tc - T) < 0.01, true);
}

/* ── every placeholder used in copy is filled by the app; every key used exists ── */
{
  for (const [k, v] of Object.entries(Z)) for (const m of v.matchAll(/\{(\w+)\}/g)) {
    n++; if (!new RegExp('(\\b' + m[1] + '\\s*:|\\.' + m[1] + '\\s*=)').test(app)) { fails++; console.error(`FAIL placeholder {${m[1]}} in ${k} is never supplied by app.js`); }
  }
  const keys = new Set([...html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)].map(m => m[1]));
  for (const m of app.matchAll(/\bt\('([\w.]+)'/g)) if (/^[\w]+\.[\w.]*\w$/.test(m[1])) keys.add(m[1]);
  for (const m of app.matchAll(/'(ch\d\.say\.\w+)'/g)) keys.add(m[1]);
  for (const k of keys) { n++; if (Z[k] == null) { fails++; console.error('FAIL missing zh key ' + k); } }
  for (const k of Object.keys(Z)) { n++; if (!keys.has(k) && !['doc.title', 'doc.desc'].includes(k)) { fails++; console.error('FAIL unused zh key ' + k); } }
  // no Chinese outside copy.zh.js except comments and the 中 toggle
  for (const file of ['index.html', 'app.js', 'models.js']) {
    // The site's static provenance label (specs/visual-page-provenance.md) is bilingual by contract and not essay copy.
    let src = fs.readFileSync(path.join(__dirname, '..', file), 'utf8').replace(/<details class="page-provenance"[\s\S]*?<\/details>/, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '').replace(/<!--[\s\S]*?-->/g, '');
    // the static zh <title> and meta description (for crawlers and link previews) must equal the copy, and are exempt
    if (file === 'index.html') {
      check('static title = doc.title', (src.match(/<title>([^<]*)<\/title>/) || [])[1], Z['doc.title']);
      check('static description = doc.desc', (src.match(/<meta name="description" content="([^"]*)">/) || [])[1], Z['doc.desc']);
      src = src.replace(/<title>[^<]*<\/title>/, '').replace(/<meta name="description" content="[^"]*">/, '');
    }
    const others = (src.match(/[一-鿿]+/g) || []).filter(x => !(file === 'index.html' && x === '中'));
    n++; if (others.length) { fails++; console.error(`FAIL Chinese text in ${file}: ${others.slice(0, 3).join(' ')}`); }
  }
  // no language-specific number words generated in code
  n++; if (/万|亿|成/.test(app.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, ''))) { fails++; console.error('FAIL app.js hard-wires a Chinese number word'); }
}

/* ── English copy, when it exists: same keys, placeholders and numbers ── */
if (fs.existsSync(path.join(__dirname, '..', 'copy.en.js'))) {
  const ce = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'copy.en.js'), 'utf8'), ce);
  const E = ce.window.ESSAY_COPY.en;
  n++; if (JSON.stringify(Object.keys(Z).sort()) !== JSON.stringify(Object.keys(E).sort())) { fails++; console.error('FAIL copy.en.js keys differ from copy.zh.js'); }
  // numbers compared by value: digit grouping removed, and a Chinese "N 万" read as N × 10,000
  const nums = s => (s.replace(/<[^>]+>/g, '').replace(/(\d),(?=\d{3})/g, '$1').replace(/(\d+(?:\.\d+)?)\s*万/g, (m, x) => String(Math.round(+x * 10000)))
    .match(/\d+(\.\d+)?/g) || []);
  for (const k of Object.keys(Z)) {
    if (E[k] == null) continue;
    for (const x of nums(Z[k])) { n++; if (!nums(E[k]).includes(x)) { fails++; console.error(`FAIL en ${k} lacks the number ${x}`); } }
    const ph = s => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');
    n++; if (ph(Z[k]) !== ph(E[k])) { fails++; console.error(`FAIL en ${k} placeholders differ`); }
  }
}

if (fails) { console.error(`\n${fails} of ${n} checks failed`); process.exit(1); }
console.log(`PASS: ${n} checks (every number in the prose is derived from the models)`);
