'use strict';
// Pins every number the essay's prose states to the page's own models (or to the source values in models.js that
// the prose quotes), checks that copy.zh.js still says exactly that number, pins how far each conclusion moves when
// a tuned parameter is halved or doubled, and evaluates every live sentence branch at the extremes of its controls.
// Run: node food/flavor/how-soy-sauce-gets-its-flavor/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const M = require(path.join(DIR, 'models.js'));
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;
const html = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');

let n = 0, fails = 0;
function check(name, got, want) { n++; if (got !== want) { fails++; console.error(`FAIL ${name}: model gives ${got}, expected ${want}`); } }
function says(key, phrase) { n++; if (!Z[key] || !Z[key].includes(phrase)) { fails++; console.error(`FAIL prose ${key} should contain "${phrase}"`); } }
const f = (x, d) => x.toFixed(d);
const range = xs => [Math.min(...xs), Math.max(...xs)];

/* ── shared laws ── */
{
  check('CTMI is 1 at optimum', f(M.ctmi(34, 8, 34, 46), 6), '1.000000'); check('CTMI 0 at Tmax', M.ctmi(46, 8, 34, 46), 0);
  check('CPM is 1 at optimum', f(M.cpm(7, 5, 7, 9.5), 6), '1.000000'); check('CPM 0 at pHmin', M.cpm(5, 5, 7, 9.5), 0);
  // the Pitzer copy reproduces the tofu essay's pinned values
  check('aw 8%', f(M.water.aw(8), 3), '0.950'); check('aw 14%', f(M.water.aw(14), 3), '0.902');
}

/* ── ch1 timeline (numbers come from ch2 and ch4 models) ── */
{
  const k = M.koji.run(4, 30, 0), r = M.relay.run(17, 30, 1);
  check('ch1 koji 90% hour', f(k.t90, 0), '31'); check('ch1 pH5 day', f(r.d5, 0), '13'); check('ch1 yeast day', f(r.dY, 0), '30');
  says('ch1.p1', '盐水约 22–23%，放上 6–8 个月'); says('ch1.p1', '约 30 °C 下培养两三天');
  says('ch1.say', '{dY}'); says('ch1.model.how', 'Devanthi');
}

/* ── ch2 koji ── */
{
  const K = M.koji;
  check('ch2 cardinal T', [K.T.min, K.T.opt, K.T.max].join('/'), '8/34/46'); says('ch2.model.how', '最适 34 °C，最高 46 °C'); says('ch2.p2', '约 32–36 °C，超过 45–47 °C');
  const tray = K.run(4, 30, 0), bed = K.run(10, 30, 0), bed4 = K.run(10, 30, 4);
  check('ch2 4 cm tray peak', f(tray.peak, 1), '39.5'); says('ch2.p3', '4 厘米的盘不翻也只到 39.5 °C');
  check('ch2 10 cm peak', f(bed.peak, 1), '44.9'); says('ch2.p3', '升到约 44.9 °C');
  check('ch2 10 cm hours over 40', f(bed.over40, 0), '39'); says('ch2.p3', '有约 39 小时在 40 °C 以上');
  check('ch2 10 cm t90', f(bed.t90, 0), '54'); says('ch2.p3', '第 54 小时才长到九成'); says('ch2.p3', '4 厘米的盘是第 31 小时'); check('ch2 tray t90', f(tray.t90, 0), '31');
  check('ch2 10 cm turned every 4 h', f(bed4.over40, 1), '3.9'); says('ch2.p3', '40 °C 以上只剩约 3.9 小时');
  check('ch2 max depth', f(K.maxDepth(30, 40), 1), '4.2'); says('ch2.p3', '最厚的床约 4.2 厘米'); says('ch2.p3', '3–5 厘米的浅盘');
  // tuned parameters halved / doubled
  const md = []; for (const k of ['mu', 'Q', 'k4']) for (const x of [0.5, 2]) md.push(K.maxDepth(30, 40, { [k]: K[k] * x }));
  const [a, b] = range(md); check('ch2 max depth under ×½/×2', f(a, 1) + '–' + f(b, 1), '2.9–6.5'); says('ch2.p4', '在约 2.9–6.5 厘米之间变');
  // the qualitative claim survives every one of those changes: a 15 cm unturned bed passes 40 °C
  for (const k of ['mu', 'Q', 'k4']) for (const x of [0.5, 2]) check('ch2 15 cm still passes 40 with ' + k + '×' + x, K.run(15, 30, 0, { [k]: K[k] * x }).peak > 40, true);
  check('ch2 calibration: tray finishes in about a day and a half', tray.t90 > 24 && tray.t90 < 48, true);
  // sentence branches
  const keys = new Set();
  for (const d of [2, 4, 10, 30]) for (const a2 of [20, 30, 35]) for (const e of [0, 8, 4, 2]) { const s = M.say.koji(d, a2, e); keys.add(s.key); check(`ch2 say ${d}/${a2}/${e}`, Z[s.key] != null && !Object.values(s.v).some(v => v === '—' && s.key !== 'ch2.say.stall'), true); }
  check('ch2 all branches', [...keys].sort().join(','), 'ch2.say.cool,ch2.say.hot,ch2.say.hotTurn,ch2.say.stall');
}

/* ── ch3 mix ── */
{
  const X = M.mix;
  says('ch3.model.how', '蛋白质 36.5 克、可利用碳水化合物（碳水化合物减去膳食纤维）20.9 克'); check('ch3 soy avail carb', f(X.SOY.carb - X.SOY.fibre, 1), '20.9');
  says('ch3.model.how', '12.6 克和 59.0 克'); check('ch3 wheat avail carb', f(X.WHEAT.carb - X.WHEAT.fibre, 1), '59.0');
  check('ch3 all soy sugar', f(X.sugar(1), 2), '0.52'); says('ch3.p2', '只用黄豆时糖只有浓口的 0.52 倍');
  check('ch3 80:20', f(X.sugar(0.8), 2), '0.71'); says('ch3.p2', '80:20 是 0.71 倍');
  check('ch3 70:30', f(X.sugar(0.7), 2), '0.81'); says('ch3.p2', '70:30 是 0.81 倍');
  check('ch3 50:50 protein', f(X.at(0.5).prot, 1), '24.6'); says('ch3.p2', '各半时 24.6 克');
  says('ch3.p2', '至少 1.60 克，浓口 1.50 克'); says('ch3.p2', '0.40–0.80 克'); says('ch3.p1', '160–180 °C'); says('ch3.p1', '80:20 或 70:30');
  for (const s of [0, 0.05, 0.5, 0.95, 1]) { const o = M.say.mix(s); check('ch3 say ' + s, Z[o.key] != null, true); }
  check('ch3 say ends', M.say.mix(1).key + '|' + M.say.mix(0).key, 'ch3.say.allsoy|ch3.say.allwheat');
}

/* ── ch4 relay ── */
{
  const R = M.relay, r = R.run(17, 30, 1);
  // the fit to Zhou et al. 2019 Table 1
  let e = 0; for (const [d, p] of R.ZHOU30) e += (r.pts[d].pH - p) ** 2; const q = R.run(17, 15, 1); for (const [d, p] of R.ZHOU15) e += (q.pts[d].pH - p) ** 2;
  check('ch4 RMS vs Zhou', f(Math.sqrt(e / (R.ZHOU30.length + R.ZHOU15.length)), 2), '0.08'); says('ch4.model.how', '均方根误差 0.08 个 pH 单位');
  check('ch4 Zhou plateau', R.ZHOU30.slice(3).map(x => x[1]).join('/'), '4.7/4.65/4.65'); says('ch4.p2', '4.70（第 45 天）和 4.65（第 60、90 天）');
  check('ch4 defaults in html', [/id="rlW"[^>]*value="17"/, /id="rlT"[^>]*value="30"/, /id="rlS"[^>]*value="50"/].every(x => x.test(html)), true);
  check('ch4 pH 5.5 day', f(r.d55, 0), '6'); says('ch4.p2', 'pH 约在第 6 天降到 5.5');
  check('ch4 pH 5.0 day', f(r.d5, 0), '13'); says('ch4.p2', '约第 13 天降到 5.0');
  check('ch4 plateau', f(r.end.pH, 1), '4.7'); says('ch4.p2', '之后停在约 4.7');
  check('ch4 yeast half day', f(r.dY, 0), '30'); says('ch4.p2', '酵母约在第 30 天长到一半'); says('ch6.p2', '约第 30 天才真正开始');
  check('ch4 ethanol day 180', f(r.end.E, 1), '3.2'); says('ch4.p2', '180 天时酒精约 3.2%'); says('ch6.p2', '浓口约 3.2%');
  check('ch4 ethanol within literature 2–4%', r.end.E >= 2 && r.end.E <= 4, true); says('ch4.model.how', '文献说 2–4%');
  check('ch4 fail salt', f(R.failSalt(30, 1), 1), '20.6'); says('ch4.p2', '把盐推到约 20.6% 以上');
  check('ch4 aw 0.83 salt', f(M.water.wForAw(0.83), 1), '20.8'); says('ch4.p2', '水分活度 0.83 对应的约 20.8%');
  check('ch4 LAB aw min', R.L.awMin, 0.83); says('ch4.model.how', '在水分活度 0.83 时为零');
  check('ch4 fail temp', f(R.failTemp(17, 1), 1), '11.6'); says('ch4.p2', '把温度降到约 11.6 °C 以下');
  check('ch4 15 °C yeast', f(R.run(17, 15, 1).dY, 0), '82'); says('ch4.p2', '15 °C 时酵母要到约第 82 天才长到一半');
  const allSoy = R.run(17, 30, M.mix.sugar(1)).end.E;
  check('ch4 all-soy ethanol', f(allSoy, 1), '1.3'); says('ch4.p2', '最后的酒精只有约 1.3%'); says('ch6.p2', '模型里最后的酒精约 1.3%');
  check('ch4 all-soy / koikuchi', f(allSoy / r.end.E, 2), '0.41'); says('ch4.p3', '全黄豆的酒精约是浓口的 0.41 倍');
  // sensitivity to tuned parameters
  const K0 = R.K, d5s = [], dYs = [], fs_ = [];
  for (const k of ['muL', 'bNG', 'muY']) for (const x of [0.5, 2]) { const o = { K: { [k]: K0[k] * x } }, rr = R.run(17, 30, 1, o); d5s.push(rr.d5); dYs.push(rr.dY); fs_.push(R.failSalt(30, 1, o)); }
  let [a, b] = range(d5s.filter((x, i) => i < 4)); check('ch4 d5 under ×½/×2 (muL, bNG)', f(a, 0) + '–' + f(b, 0), '8–25'); says('ch4.p3', '“pH 降到 5.0”在约第 8–25 天之间变');
  check('ch4 d5 unchanged by muY', d5s[4] === r.d5 && d5s[5] === r.d5, true);
  [a, b] = range(dYs); check('ch4 dY under ×½/×2', f(a, 0) + '–' + f(b, 0), '19–52'); says('ch4.p3', '“酵母长到一半”在约第 19–52 天之间变');
  [a, b] = range(fs_); check('ch4 fail salt under ×½/×2', f(a, 1) + '–' + f(b, 1), '20.4–20.7'); says('ch4.p3', '失败的盐度只在约 20.4–20.7% 之间变');
  const ft = [3, 12].map(tm => R.failTemp(17, 1, { T: { min: tm } }));
  check('ch4 fail temp under Tmin ×½/×2', f(ft[0], 1) + '–' + f(ft[1], 1), '9.8–15.1'); says('ch4.p3', '在约 9.8–15.1 °C 之间变');
  check('ch4 Tmin is 6', R.T.min, 6);
  const ratio = (k, x) => { const o = { K: { [k]: K0[k] * x } }; return R.run(17, 30, M.mix.sugar(1), o).end.E / R.run(17, 30, 1, o).end.E; };
  let rs = [0.5, 2].map(x => ratio('yES', x)); [a, b] = range(rs); check('ch4 ratio under yES', f(a, 2) + '–' + f(b, 2), '0.41–0.43'); says('ch4.p3', '这个比例在 0.41–0.43 之间');
  rs = [0.5, 2].map(x => ratio('yLS', x)); [a, b] = range(rs); check('ch4 ratio under yLS', f(a, 2) + '–' + f(b, 2), '0.25–0.47'); says('ch4.p3', '在 0.25–0.47 之间');
  // source constants quoted in prose
  says('ch4.p1', '在 5–10% 的盐里长得最好，盐超过 15% 就慢很多'); says('ch4.p1', '到 pH 5.0 就不长了'); check('ch4 LAB pHmin', R.L.pmin, 5);
  says('ch4.p1', 'pH 4.0–5.0'); says('ch4.p1', 'pH 高于 5.5'); check('ch4 yeast pHmax at 18%', R.pmaxY(18), 5.5); check('ch4 yeast pHmax no salt', R.pmaxY(0), 10.4);
  says('ch4.model.how', '乳酸菌 5.0 / 7.0 / 9.5，酵母在 18% 以上的盐里 3.5 / 4.5 / 5.5');
  // every sentence branch
  const keys = new Set();
  for (const w of [10, 12, 17, 20, 20.5, 21, 24]) for (const T of [5, 10, 15, 30, 40]) for (const s of [0.52, 1]) for (const d of [0, 90, 180]) {
    const o = M.say.relay(w, T, s, d); keys.add(o.key); check(`ch4 say ${w}/${T}/${s}/${d}`, Z[o.key] != null, true);
  }
  check('ch4 all branches', [...keys].sort().join(','), 'ch4.say.late,ch4.say.lowSalt,ch4.say.noLab,ch4.say.ok,ch4.say.run,ch4.say.slow');
  check('ch4 default ends ok', M.say.relay(17, 30, 1, 180).key, 'ch4.say.ok');
  check('ch4 21% fails at the first hand', M.say.relay(21, 30, 1, 180).key, 'ch4.say.noLab');
  check('ch9 17% aw', f(M.water.aw(17), 3), '0.873'); says('ch9.p1', '17% 的盐水水分活度约 0.873');
}

/* ── ch5 browning ── */
{
  const B = M.brown;
  check('ch5 default Ea', B.EA, 109); check('ch5 Ea slider default', /id="brEa"[^>]*value="109"/.test(html), true);
  check('ch5 Ea range', B.EA_RANGE.join('–'), '20–145'); says('ch5.model.how', '文献值 20–145 kJ/mol');
  says('ch5.p1', '约 109 kJ/mol'); says('ch5.p1', '约 125'); says('ch5.p1', '约 145'); says('ch5.p1', '只有约 20');
  const heat = Ea => B.eqDays(80, 30 / 1440, Ea);
  check('ch5 heat at 109', f(heat(109), 1), '19.6'); says('ch5.p2', '在 25 °C 下放约 19.6 天'); says('ch6.p3', '在室温下放约 19.6 天');
  check('ch5 heat at 20 (hours)', f(heat(20) * 24, 1), '1.8'); says('ch5.p2', '取 20 时只相当于约 1.8 小时');
  check('ch5 heat at 145', f(heat(145), 0), '188'); says('ch5.p2', '取 145 时约 188 天');
  check('ch5 fridge range', f(B.ratio(25, 20, 5), 1) + '–' + f(B.ratio(25, 145, 5), 0), '1.8–67'); says('ch5.p2', '从约 1.8 倍到约 67 倍');
  check('ch5 fridge at 109', f(B.ratio(25, 109, 5), 1), '23.6'); says('ch5.p2', '109 时约 23.6 倍');
  check('ch5 heating conditions', B.CASES.find(c => c.id === 'heat').T, 80); says('ch1.read.heat', '70–80 °C'); says('ch6.p3', '70–80 °C、30 分钟');
  for (const Ea of [20, 60, 109, 145]) { const o = M.say.brown(Ea); check('ch5 say ' + Ea, Z[o.key] != null && Z[o.v.u.k] != null, true); }
  check('ch5 say at 20 is in hours', M.say.brown(20).v.u.k + ' ' + M.say.brown(20).v.heat, 'unit.h 1.8');
  check('ch5 say at 109', M.say.brown(109).v.heat + '/' + M.say.brown(109).v.f, '19.6/23.6');
}

/* ── ch7 label ── */
{
  const L = M.label;
  check('ch7 N in MSG', f(L.N_MSG * 100, 2), '7.49'); says('ch7.model.how', '14.007/187.13 ≈ 0.0749 克可滴定的氮（7.49%）');
  check('ch7 grades hs', L.GRADES.hs.map(x => f(x, 2)).join('/'), '0.80/0.70/0.55/0.40'); says('ch7.p2', '特级每 100 毫升不少于 0.80 克，一级 0.70，二级 0.55，三级 0.40');
  check('ch7 grades ls', L.GRADES.ls.map(x => f(x, 2)).join('/'), '0.80/0.70/0.60/0.40'); says('ch7.p2', '低盐固态是 0.80、0.70、0.60、0.40');
  check('ch7 NH4 caps', L.NH4_MAX.e2025 + '/' + L.NH4_MAX.e2000, '0.28/0.3'); says('ch7.p2', '不得超过氨基酸态氮的 28%，旧版据报道是 30%');
  check('ch7 GB 2717 min', L.MIN, 0.4); says('ch7.p2', '不少于 0.4 克');
  says('ch7.p2', '2025 年 5 月 30 日发布'); says('ch7.p2', '2026 年 12 月 1 日起实施'); says('ch7.p2', '现行的是 2000 年版');
  check('ch7 3rd → special', f(L.msgFor(0.40, 0.80), 2), '5.34'); says('ch7.p3', '每 100 毫升要加约 5.34 克谷氨酸钠');
  check('ch7 1st → special', f(L.msgFor(0.70, 0.80), 2), '1.34'); says('ch7.p3', '从一级（0.70）到特级只要约 1.34 克');
  says('ch7.p1', 'pH 8.2'); says('ch7.p1', 'pH 9.2');
  says('ch7.p4', '1.50、1.35、1.20 克'); says('ch7.p4', '溜酱油 1.60、1.40、1.20'); says('ch7.p4', '淡口 1.15、1.05、0.95'); says('ch7.p4', '约 0.91'); says('ch7.p4', '约 0.48 g/100 mL');
  check('ch7 defaults', [/id="lbB"[^>]*value="0.6"/, /id="lbM"[^>]*value="0"/, /id="lbN"[^>]*value="0.05"/].every(x => x.test(html)), true);
  const keys = new Set();
  for (const b of [0.3, 0.6, 0.75, 1]) for (const m of [0, 1, 3, 6]) for (const nh of [0, 0.05, 0.3]) { const o = M.say.label(b, m, nh); keys.add(o.key); check(`ch7 say ${b}/${m}/${nh}`, Z[o.key] != null && Z[o.v.g.k] != null && Z[o.v.g0.k] != null, true); }
  check('ch7 all branches', [...keys].sort().join(','), 'ch7.say,ch7.say.low,ch7.say.msg,ch7.say.nh4');
  check('ch7 0.3 + 0.05 below the minimum', M.say.label(0.3, 0, 0.05).key, 'ch7.say.low');
}

/* ── ch8 cut short ── */
{
  const r = M.relay.run(17, 30, 1);
  check('ch8 default day', /id="ctD"[^>]*value="20"/.test(html), true);
  const keys = new Set(); for (const d of [5, 10, 20, 29, 31, 60, 180]) { const o = M.say.cut(d); keys.add(o.key); check('ch8 say ' + d, Z[o.key] != null, true); }
  check('ch8 all branches', [...keys].sort().join(','), 'ch8.say.early,ch8.say.late,ch8.say.mid');
  check('ch8 cut at day 10: no ethanol yet', f(r.pts[10].E, 1), '0.0');
  says('ch8.r.hvp.time', '4–9 mol/L 盐酸，20–35 小时'); says('ch8.r.hs.time', '3–6 个月');
  says('ch8.p3', '2026 年 9 月 2 日起实施'); says('ch8.p3', '每千克 0.4 毫克，固态 1.0 毫克');
  says('ch8.p4', '2019 年 12 月 21 日实施'); says('ch8.p4', '5.1.8');
  says('ch6.p3', '83.5%');
}

/* ── ch9 sodium ── */
{
  const S = M.salt;
  check('ch9 MEXT', S.MEXT.map(r => r.na).join('/'), '5700/6300/5100/3300'); says('ch9.p2', '浓口 5700 毫克，淡口 6300，溜 5100，减盐浓口 3300');
  check('ch9 15 g koikuchi', f(S.per('koiku', 15).na, 0), '855'); says('ch9.p2', '15 克浓口约含钠 855 毫克');
  check('ch9 15 g usukuchi', f(S.per('usu', 15).na, 0), '945'); says('ch9.p2', '淡口约 945 毫克');
  check('ch9 salt eq', S.MEXT.find(r => r.id === 'usu').salt + '/' + S.MEXT.find(r => r.id === 'koiku').salt, '16/14.5'); says('ch9.p2', '16.0 克，比浓口的 14.5 克');
  says('ch9.p2', '5490 毫克'); check('ch9 Na range', f(Math.min(...S.MEXT.filter(r => r.id !== 'gen').map(r => r.na)) / 1000, 1) + '–' + f(Math.max(...S.MEXT.map(r => r.na)) / 1000, 1), '5.1–6.3'); says('ch9.law', '约 5.1–6.3 克（减盐的约 3.3 克）'); says('ch9.p1', '22–23%'); says('ch9.p1', '17–18%');
  check('ch9 default 15 g koikuchi', /id="naG"[^>]*value="15"/.test(html) && /name="naS" value="koiku" checked/.test(html), true);
  for (const r of S.MEXT) for (const g of [5, 15, 30]) { const o = M.say.salt(r.id, g); check('ch9 say ' + r.id + g, Z[o.key] != null && Z[o.v.s.k] != null, true); }
}

/* ── every placeholder used in copy is filled; every key exists; no Chinese outside copy ── */
{
  const app = fs.readFileSync(path.join(DIR, 'app.js'), 'utf8'), mod = fs.readFileSync(path.join(DIR, 'models.js'), 'utf8');
  for (const [k, v] of Object.entries(Z)) for (const m of v.matchAll(/\{(\w+)\}/g)) {
    n++; if (!new RegExp('(\\b' + m[1] + '\\s*:|\\.' + m[1] + '\\s*=)').test(app + mod)) { fails++; console.error(`FAIL placeholder {${m[1]}} in ${k} is never supplied`); }
  }
  // prose paragraphs are static: they must not carry placeholders
  for (const [k, v] of Object.entries(Z)) if (/\.(p\d|law|limit|model\.how|u\d|q\d|sum)$/.test(k)) { n++; if (/\{\w+\}/.test(v)) { fails++; console.error('FAIL static prose ' + k + ' has a placeholder'); } }
  const keys = new Set([...html.matchAll(/data-(?:i18n(?:-html|-aria)?|hk)="([^"]+)"/g)].map(m => m[1]));
  for (const m of app.matchAll(/\bt\('([\w.]+)'/g)) if (/^[\w]+\.[\w.]*\w$/.test(m[1])) keys.add(m[1]);
  for (const r of M.mix.STYLES) keys.add('ch3.style.' + r.id);
  for (const c of M.brown.CASES) keys.add('ch5.case.' + c.id);
  for (let i = 0; i <= 4; i++) keys.add('ch7.grade.' + i);
  for (const s of ['early', 'mid', 'late']) keys.add('ch8.st.' + s);
  for (const r of M.salt.MEXT) keys.add('ch9.style.' + r.id);
  for (const u of ['d', 'h', 'min']) keys.add('unit.' + u);
  for (const k of ['ch1.cv.koji', 'ch1.cv.moromi', 'ch1.cv.heat', 'ch1.cv.k90', 'ch1.cv.ph5', 'ch1.cv.y', 'ch4.cv.y55', 'ch4.cv.y50']) keys.add(k);
  for (const k of keys) { n++; if (Z[k] == null) { fails++; console.error('FAIL missing zh key ' + k); } }
  for (const file of ['index.html', 'app.js', 'models.js']) {
    let src = fs.readFileSync(path.join(DIR, file), 'utf8');
    if (file === 'index.html') {
      const tt = src.match(/<title>([^<]*)<\/title>/)[1], md = src.match(/<meta name="description" content="([^"]*)">/)[1];
      check('static title = doc.title', tt, Z['doc.title']); check('static meta = doc.desc', md, Z['doc.desc']);
      src = src.replace(/<title>[^<]*<\/title>/, '').replace(/<meta name="description" content="[^"]*">/, '');
      // the site's bilingual provenance label (added later by a registrar) is not essay copy
      src = src.replace(/<details class="page-provenance"[\s\S]*?<\/details>/, '');
    }
    src = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '').replace(/<!--[\s\S]*?-->/g, '');
    n++;
    const others = (src.match(/[一-鿿]+/g) || []).filter(x => !(file === 'index.html' && x === '中'));
    if (others.length) { fails++; console.error(`FAIL Chinese text in ${file}: ${others.slice(0, 3).join(' ')}`); }
  }
  const R = JSON.parse(fs.readFileSync(path.join(DIR, 'REGISTRY.json'), 'utf8'));
  check('registry title', R.title.zh, Z['doc.title'].split(' · ')[0]); check('registry desc', R.desc.zh, Z['doc.desc']);
  for (const c of R.concepts) check('anchor ' + c.anchor, html.includes('id="' + c.anchor.slice(1) + '"'), true);
  // one word, one owner: the fermented-tofu essay owns these
  const owned = ['鲜味', '味精', 'umami', 'MSG', '水分活度', 'water activity'];
  for (const c of R.concepts) for (const a of [...c.aliases.zh, ...c.aliases.en]) { n++; if (owned.some(o => a.toLowerCase() === o.toLowerCase())) { fails++; console.error('FAIL alias owned by the tofu essay: ' + a); } }
  says('ch4.p2', '20.6%'); check('registry relay salt', R.concepts.find(c => c.anchor === '#ch4').desc.zh.includes('约 20.6%'), true);

  // English copy, when a translator adds it: same keys, same placeholders
  const en = path.join(DIR, 'copy.en.js');
  if (fs.existsSync(en)) {
    const ectx = { window: {} }; vm.runInNewContext(fs.readFileSync(en, 'utf8'), ectx);
    const EN = ectx.window.ESSAY_COPY.en, ph = s => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');
    check('en keys = zh keys', Object.keys(EN).sort().join('|'), Object.keys(Z).sort().join('|'));
    for (const k of Object.keys(Z)) if (EN[k] != null) check('en placeholders ' + k, ph(EN[k]), ph(Z[k]));
    check('registry title en', R.title.en, EN['doc.title'].split(' · ')[0]); check('registry desc en', R.desc.en, EN['doc.desc']);
  }
}

if (fails) { console.error(`\n${fails} of ${n} checks failed`); process.exit(1); }
console.log(`PASS: ${n} checks (every number in the prose matches the models)`);
