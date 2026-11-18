#!/usr/bin/env node
/* Model + prose test for “what magnitude means”.
 * Every number in the Chinese prose is derived here from models.js (no literal is repeated from the copy),
 * and every live-sentence branch is filled at the control extremes.
 * Run: node earth/geo/what-magnitude-means/tests/models.cjs */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
const dir = path.join(__dirname, '..');
const Q = require(path.join(dir, 'models.js'));
const win = {}; vm.runInNewContext(fs.readFileSync(path.join(dir, 'copy.zh.js'), 'utf8'), { window: win });
const Z = win.ESSAY_COPY.zh;
const appSrc = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');

let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) pass++; else { fail++; console.log('FAIL', msg); } }
// the prose writes numbers without thousands separators and with a true minus sign
const fmt = (x, d = 0) => (Math.abs(x) < 0.5 * Math.pow(10, -d) ? 0 : x).toLocaleString('zh-CN', { minimumFractionDigits: d, maximumFractionDigits: d, useGrouping: false }).replace('-', '−');
const r0 = x => fmt(x, 0), r1 = x => fmt(x, 1), r2 = x => fmt(x, 2);
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const sci = (x, d = 1) => { let e = Math.floor(Math.log10(x)), m = +(x / Math.pow(10, e)).toFixed(d); if (m >= 10) { m = 1; e++; } return fmt(m, d) + ' × 10' + String(e).split('').map(c => SUP[+c]).join(''); };
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
function says(key, phrase) { ok(Z[key] != null && Z[key].includes(phrase), `${key} should contain “${phrase}”`); }

/* ───── 1 · block ───── */
const B = Q.block, P0 = { v: 3, drop: 1 };
const T0 = B.recurrence(P0);
says('ch1.p3', `每 ${r0(T0)} 年滑一次，每次只用 ${r0(B.DUR)} 秒`);
says('ch1.p3', `约 ${r1(B.ratio(P0) / 1e8)} 亿倍`);
says('ch1.p3', `每次滑 ${r0(B.slip(P0))} 米`);
says('ch1.p3', `每年 ${r0(15)} 厘米，间隔缩到约 ${r0(B.recurrence({ v: 15, drop: 1 }))} 年`);
says('ch1.p3', `每年 ${r0(1)} 厘米，就是 ${r0(B.recurrence({ v: 1, drop: 1 }))} 年`);
says('ch1.p4', `加 ${r0(T0)}`);
says('ch1.p4', `滑这 ${r0(B.slip(P0))} 米`);
says('ch1.say.slip', `在 ${r0(B.DUR)} 秒里`);
says('ch1.limit', `这里的 ${r0(B.DUR)} 秒`);
says('ch5.p4', `每 ${r0(T0)} 年准时`);
// slip lands back exactly on the sawtooth: simulate one cycle
{ const s = B.create(P0); let left = B.load(s, 1000, P0); ok(s.phase === 'slip', 'block reaches slip within 1000 years'); B.slide(s, B.DUR + 0.01, P0); ok(s.phase !== 'slip' && s.events.length === 1, 'block slip ends after DUR'); }

/* ───── 2 · magnitude ───── */
const G = Q.mag, mw = (L, W, D) => G.mw(G.moment(L, W, D)), M7 = mw(40, 20, 1.5);
says('ch2.p3', `约 <strong>${r1(M7)} 级</strong>`);
says('ch2.p3', `只加 ${r1(mw(40, 20, 3) - M7)} 级`);
says('ch2.p3', `加 ${r2(mw(400, 20, 1.5) - M7)} 级`);
ok(Math.round(mw(400, 200, 15)) === 9 && Math.abs(mw(400, 200, 15) - 9) < 0.05, '400×200 km × 15 m ≈ Mw 9');
says('ch2.p3', `平均错开 ${r0(15)} 米的断层`);
says('ch2.p3', `约 ${r1(mw(40, 20, B.slip(P0)))} 级`);
says('ch2.p2', `约 ${r1(Math.pow(10, 1.5))} 倍`);
says('ch2.p2', `就是 ${r0(Math.pow(10, 3))} 倍`);
says('ch2.p4', `算出来是 ${r2(M7)} 级，显示为 ${r1(M7)}`);
says('ch2.p4', `约 ${sci(G.energy(M7))} 焦耳`);
says('ch2.p4', `约等于 ${r0(G.energy(M7) / G.REF.hiroshima)} 颗广岛`);
says('ch2.p4', `6 级约等于 ${r0(G.energy(6) / G.REF.hiroshima)} 颗`);
says('ch2.p4', `${r1(G.energy(9) / G.REF.world * 100)}%`);
{ const d = Math.abs(G.energyUSGS(7) / G.energy(7) - 1); ok(d < 0.05, `USGS vs GR energy at 7 differ < 5% (${d})`); says('ch2.p4', '相差不到 5%'); }
says('ch2.p4', `每颗约 ${r1(G.REF.hiroshima / G.REF.tnt / 1e4)} 万吨`);
says('ch2.p1', `${r0(G.MU / 1e9)} 吉帕`);
says('ch9.q1', `${r0(40)} × ${r0(20)} 千米的一块岩石错开了 ${r1(1.5)} 米`);
ok(Math.abs(M7 - 7) < 0.05, 'default fault is Mw 7.0');
says('ch9.q1', `能量乘约 ${r0(G.perUnit ? G.perUnit() : Math.pow(10, 1.5))}`);
says('ch6.p4', `能量却大 ${r1(Math.pow(10, 1.5))} 倍`);
says('ch6.p4', `约 ${r1(G.energy(8) / G.energy(5) / 1e4)} 万次 5 级`);

/* ───── 3 · intensity ───── */
const I = Q.ipe, lvl = (M, r, h, F = 1) => ROMAN[I.level(I.mmi(M, r, h, F))];
says('ch3.p3', `正上方平均约 ${lvl(7, 0, 15)} 度`);
says('ch3.p3', `离震中 100 千米降到约 ${lvl(7, 100, 15)} 度`);
says('ch3.p3', `平均约 ${lvl(5.5, 5, 5)} 度，比 100 千米外感受到的那次 7 级还猛`);
ok(I.mmi(5.5, 5, 5) > I.mmi(7, 100, 15), 'shallow 5.5 at 5 km beats 7 at 100 km');
says('ch3.p3', `震源深 5 千米时正上方约 ${lvl(7, 0, 5)} 度，深 40 千米时只有约 ${lvl(7, 0, 40)} 度`);
says('ch3.p4', `烈度约高 ${r1(I.SITE)} 度`);
says('ch3.p4', `放大 2 倍，烈度约高 ${r1(I.SITE * Math.log10(2))} 度`);
says('ch3.p4', `放大 4 倍，约高 ${r1(I.SITE * Math.log10(4))} 度`);
ok(Math.abs(I.mmi(7, 30, 10, 2) - I.mmi(7, 30, 10) - I.SITE * Math.log10(2)) < 1e-9, 'site term is additive');
// OpenQuake coefficient check (AllenEtAl2012Rhypo): hand-evaluated point M6, Rhypo 80
{ const C = { c0: 2.085, c1: 1.428, c2: -1.402, c4: 0.078, m1: -0.209, m2: 2.042 }, R = 80, M = 6;
  const rm = C.m1 + C.m2 * Math.exp(M - 5), ref = C.c0 + C.c1 * M + C.c2 * Math.log(Math.sqrt(R * R + rm * rm)) + C.c4 * Math.log(R / 50);
  ok(Math.abs(I.mmi(M, Math.sqrt(R * R - 100), 10) - ref) < 1e-9, 'IPE matches OpenQuake AllenEtAl2012Rhypo'); }
ok(Math.abs(I.sigma(0) - 1.19) < 1e-9 && I.sigma(1e6) - 0.82 < 1e-6, 'sigma from 1.19 near to 0.82 far');
// reach is monotone and consistent with mmi
{ const re = I.reach(7, 15, 1, 5.5); ok(Math.abs(I.mmi(7, re, 15) - 5.5) < 0.01, 'reach solves mmi = 5.5'); }

/* ───── 4 · locating and warning ───── */
const Lc = Q.loc;
says('ch4.p1', `每秒 ${r1(Lc.VP)} 千米`); says('ch4.p1', `每秒 ${r2(Lc.VS)} 千米`);
says('ch4.p1', `距离就约多 ${r0(Lc.kmPerSecond())} 千米`);
{ const ta = Lc.alertTime(10, 10, 4);
  says('ch4.p4', `约 ${r1(ta)} 秒发出`);
  says('ch4.p4', `约 ${r0(Lc.blindRadius(10, ta))} 千米以内是盲区`);
  says('ch4.p4', `50 千米的城市能提前约 ${r0(Lc.warning(50, 10, ta))} 秒`);
  says('ch4.p4', `100 千米约 ${r0(Lc.warning(100, 10, ta))} 秒`);
  says('ch4.p4', `200 千米约 ${r0(Lc.warning(200, 10, ta))} 秒`);
  ok(Math.abs(Lc.warning(Lc.blindRadius(10, ta), 10, ta)) < 1e-9, 'warning is zero at the blind radius'); }
// three circles meet at one point: S−P distances reproduce the true epicentre distances
{ const e = { x: 100, y: 70 }; for (const st of Lc.STATIONS) { const R = Math.hypot(Lc.dist(st, e), 10); ok(Math.abs(Lc.distFromSp(Lc.sp(R)) - R) < 1e-9, 'S−P inverts'); } }
ok(/240/.test(appSrc) && /160/.test(appSrc) && Z['ch4.model.aria'].includes(`${r0(240)} × ${r0(160)}`), 'map size in aria matches app');

/* ───── 5 · sheet ───── */
const S = Q.sheet, cat = S.catalogue(7, 20000), MS = [5, 5.5, 6, 6.5, 7], rates = S.rates(cat, MS);
says('ch5.p2', `${r0(S.L)} × ${r0(S.L)} = ${r0(S.L * S.L)} 块`);
says('ch5.p2', `${r0(S.PATCH_KM)} × ${r0(S.PATCH_KM)} 千米`);
says('ch5.p2', `${r0(S.DSIG / 1e6)} 兆帕`);
says('ch5.p3', `每 ${r0(S.YEARS)} 模型年`);
says('ch5.p3', `约 ${r1(S.mw(1))} 级`);
says('ch5.p3', `α = ${r1(S.ALPHA)}`);
says('ch5.p3', `平均每千年 ${r0(rates[0])} 次，5.5 级以上 ${r0(rates[1])} 次，6 级以上 ${r0(rates[2])} 次`);
{ const q1 = Math.round(rates[1] / rates[0] * 100), q2 = Math.round(rates[2] / rates[1] * 100); ok(q1 === q2, `half-unit ratio steady (${q1}, ${q2})`); says('ch5.p3', `大约只剩 ${q1}%`); }
{ const c1 = S.catalogue(7, 3000, 0.1), mx = c1.reduce((m, e) => Math.max(m, e.M), 0); ok(mx < 6.5, `α=0.1 three thousand years stays below 6.5 (max ${mx.toFixed(2)})`); says('ch5.p3', 'α 调到 0.1'); says('ch5.p3', '跑三千年都没有一次到 6.5 级'); }
{ const mx = cat.reduce((m, e) => Math.max(m, e.M), 0); says('ch5.limit', `最大的一次是 ${r1(mx)} 级`); says('ch5.limit', `就算 ${r0(S.L * S.L)} 块一起滑，也只到 ${r1(S.mw(S.L * S.L))} 级`); }
says('ch5.model.title', `${r0(S.L * S.L)} 块木头`);
says('ch6.say.model.none', `${r0(S.L * S.PATCH_KM)} × ${r0(S.L * S.PATCH_KM)} 千米`);
// determinism: same seed, same catalogue
{ const a = S.catalogue(3, 300), b = S.catalogue(3, 300); ok(a.length === b.length && a.every((e, i) => e.M === b[i].M && e.t === b[i].t), 'sheet is deterministic'); }

/* ───── 6 · Gutenberg–Richter ───── */
const GR = Q.gr, fit = GR.fit();
[[5, 'ch6.p1', '5 级（5–5.9）约'], [6, 'ch6.p1', '6 级约'], [7, 'ch6.p1', '7 级约']].forEach(([m, k, pre]) => {
  const [lo, hi] = GR.binRange(m); says(k, `${pre} ${r0(GR.binMean(m))} 次`); says(k, m === 5 ? `最少的一年 ${r0(lo)} 次、最多 ${r0(hi)} 次` : `（${r0(lo)}–${r0(hi)}）`);
});
{ const [lo, hi] = GR.binRange(8); says('ch6.p1', `8 级以上约 ${r1(GR.binMean(8))} 次（${r0(lo)}–${r0(hi)}）`); }
says('ch6.p2', `b 约为 ${r2(fit.b)}`);
says('ch6.p3', `7 级以上（含 8 级）的地震约 ${r0(GR.cumMean(7))} 次`);
{ const d = 365.25 / GR.cumMean(7); ok(d > 21 && d < 28, `M7+ gap is three-plus weeks (${d.toFixed(1)} d)`); says('ch6.p3', '三个多星期'); }
ok(Math.round(GR.cumMean(8)) === 1, 'M8+ about once a year'); says('ch6.p3', '8 级以上大约一年一次');
{ const b = GR.slope([5, 5.5, 6], rates.slice(0, 3)); says('ch6.p3', `b 约 ${r1(b)}`);
  const ys = [0, 1, 2].map(i => Math.log10(rates[i])), a = ys.reduce((x, y) => x + y) / 3 + b * 5.5;
  const k65 = rates[3] / Math.pow(10, a - b * 6.5), k7 = rates[4] / Math.pow(10, a - b * 7);
  ok(k65 < 0.9 && k65 > 0.5, `sheet starts to fall below the line at 6.5 (${k65.toFixed(2)})`); says('ch6.p3', '到 6.5 级开始掉到直线下面');
  ok(k7 > 0.2 && k7 < 0.3, `sheet at 7 is about a quarter of the line (${k7.toFixed(2)})`); says('ch6.p3', '到 7 级只剩直线预期的约四分之一'); }
says('ch6.p4', `一年的 5 级地震才约 ${r0(GR.binMean(5))} 次`);
{ const [lo, hi] = GR.binRange(7); says('ch6.p4', `“平均 ${r0(GR.binMean(7))} 次”的 7 级地震，有的年份只有 ${r0(lo)} 次，有的年份 ${r0(hi)} 次`); }

/* ───── 7 · aftershocks ───── */
const A = Q.after;
says('ch7.p2', `a = ${r2(A.P.a)}`); says('ch7.p2', `b = ${r2(A.P.b)}`); says('ch7.p2', `p = ${r2(A.P.p)}`); says('ch7.p2', `c = ${r2(A.P.c)} 天`);
says('ch7.p3', `震后 1 天开始的 7 天里出现 5 级以上余震的概率约 ${r0(A.prob(6.5, 5, 1, 7) * 100)}%`);
says('ch7.p3', `震后第一天就约 ${r0(A.prob(6.5, 5, 0, 1) * 100)}%`);
says('ch7.p3', `第 10 天那一天只剩约 ${r0(A.prob(6.5, 5, 9, 1) * 100)}%`);
says('ch7.p3', `本页的模型给出 ${fmt(A.prob(6, 5, 7, 30), 3)}`);
ok(Math.abs(A.prob(6, 5, 7, 30) - 0.206) < 0.0015, 'Reasenberg–Jones table cell (M6, day 7–37, M≥5) = 0.206');
ok(Math.abs(A.prob(6, 5, 0.01, 30) - 0.656) < 0.0015 || Math.abs(A.prob(6, 5, 0.01, 30) - 0.66) < 0.01, 'table cell (M6, 0.01–30 d) ≈ 0.66');
{ let tot = 0; for (let s = 1; s <= 200; s++) tot += A.simulate(6.5, 5, 30, s).length; const exp = A.expected(6.5, 5, 0, 30) * 200; ok(Math.abs(tot - exp) < 4 * Math.sqrt(exp), `simulate matches expected count (${tot} vs ${exp.toFixed(0)})`); }

/* ───── 8 · prediction ───── */
{ const iv = S.intervals(cat, 7), hr = Q.call.hitRates(cat, 7, 30, 2);
  says('ch8.p3', `7 级以上平均每 ${r0(S.mean(iv))} 年一次`);
  says('ch8.p3', `约 ${r1(S.cv(iv))}`); ok(S.cv(iv) > 1, 'sheet M7 intervals clustered (CV > 1)');
  says('ch8.p3', `30 年内至少来一次 7 级的概率约 ${r0(hr.now * 100)}%`);
  says('ch8.p3', `命中率约 ${r0(hr.periodic * 100)}%`);
  ok(hr.periodic <= hr.now + 0.02, 'periodic rule no better than chance'); }
// periodic rule on the single block: always a hit
{ const T = B.recurrence(P0), W = 30, events = []; for (let k = 1; k < 40; k++) events.push(k * T); let hits = 0, n = 0;
  for (let now = T + 0.5; now < 38 * T; now += 1) { const last = events.filter(e => e <= now).pop(), c = Math.max(now, last + T - W / 2); n++; if (events.some(e => e >= c && e <= c + W)) hits++; }
  ok(hits === n, 'periodic rule is perfect on the single block'); says('ch8.p3', '周期规则百发百中'); }
// game history: the chosen seed has a recent M7 inside the plotted past
{ const m = appSrc.match(/GAME_SEED = (\d+), GAME_START = (\d+)/); ok(!!m, 'game seed in app');
  const s = S.create(+m[1]); const big = []; while (s.t < +m[2]) { const e = S.next(s); if (e.M >= 7) big.push(e.t); }
  ok(big.length >= 2 && s.t - big[big.length - 1] < 400, 'game history shows M7s in the last 400 years'); }

/* ───── live sentences at the extremes ───── */
const used = new Set();
function fill(key, vars) {
  ok(Z[key] != null, 'copy key ' + key); used.add(key);
  const s = Z[key].replace(/\{(\w+)\}/g, (m, k) => { ok(vars[k] != null && vars[k] !== '', `${key}: placeholder {${k}} supplied`); return vars[k]; });
  ok(!/NaN|undefined|Infinity|—|\{/.test(s), `${key} reads cleanly: ${s}`);
  return s;
}
// ch1
for (const v of [1, 15]) for (const D of [0.5, 6]) {
  const p = { v, drop: D / 2 }, T = B.recurrence(p);
  fill('ch1.say.first', { left: r0(T) }); fill('ch1.say.stick', { since: r0(0), left: r0(T), T: r0(T) }); fill('ch1.say.slip', { d: r1(B.slip(p)), T: r1(T) });
}
// ch2
const arr = name => JSON.parse(appSrc.match(new RegExp('const ' + name + ' = (\\[[^\\]]+\\])'))[1]);
const LV = arr('LV'), WV = arr('WV'), DV = arr('DV');
ok(LV[16] === 40 && WV[13] === 20 && DV[17] === 1.5, 'ch2 slider defaults map to 40 × 20 km × 1.5 m');
for (const L of [LV[0], LV[LV.length - 1], 40]) for (const W of [WV[0], WV[WV.length - 1], 20]) for (const D of [DV[0], DV[DV.length - 1], 1.5]) {
  const M = mw(L, W, D), dM = Math.round(M * 10) / 10 - Math.round(M7 * 10) / 10, ratio = Math.pow(10, 1.5 * Math.abs(M - M7));
  const key = Math.abs(dM) < 0.05 ? 'ch2.say.same' : dM > 0 ? 'ch2.say.bigger' : 'ch2.say.smaller';
  fill(key, { M: r1(M), dM: r1(Math.abs(dM)), ratio: ratio < 1e4 ? r1(ratio) : sci(ratio) });
}
// ch3
for (const M of [4, 9]) for (const h of [2, 60]) for (const r of [0, 300]) for (const F of [1, 4]) {
  const v = I.mmi(M, r, h, F), lv = I.level(v), lc = I.level(I.mmi(5.5, r, 5, F));
  ok(lv >= 1 && lv <= 12, 'level in 1..12');
  fill(r === 0 ? 'ch3.say0' : 'ch3.say', { r: r0(r), rh: r0(I.hypo(r, h)), roman: ROMAN[lv], desc: Z['ch3.mmi.' + lv] });
  fill(lc > lv ? 'ch3.say.cmpwins' : lc === lv ? 'ch3.say.cmpsame' : 'ch3.say.cmploses', { croman: ROMAN[lc] });
}
fill('ch3.say.cmpsame', { croman: 'V' }); // reached in the browser at M5.5-ish settings; make sure it reads
// ch4
for (const e of [{ x: 5, y: 5 }, { x: 235, y: 155 }, { x: 100, y: 70 }]) {
  const sp = Lc.STATIONS.map(st => Lc.sp(Math.hypot(Lc.dist(st, e), 10)));
  fill('ch4.say.loc', { a: r1(sp[0]), b: r1(sp[1]), c: r1(sp[2]), da: r0(Lc.distFromSp(sp[0])), db: r0(Lc.distFromSp(sp[1])), dc: r0(Lc.distFromSp(sp[2])) });
  fill('ch4.say.run', { t: r0(3), np: r0(1), ns: r0(0) });
}
for (const near of [2, 40]) for (const proc of [1, 10]) for (const h of [5, 40]) for (const d of [0, 300]) {
  const ta = Lc.alertTime(near, h, proc), br = Lc.blindRadius(h, ta), wv = Math.hypot(d, h) / Lc.VS - ta;
  const key = Math.abs(wv) < 0.5 ? 'ch4.say.edge' : wv > 0 ? (br > 0 ? 'ch4.say.ok' : 'ch4.say.noblind') : 'ch4.say.late';
  if (key === 'ch4.say.late') ok(br > 0, 'late implies a blind zone');
  fill(key, { d: r0(d), w: r0(wv), late: r0(-wv), blind: r0(br) });
}
{ const ta = Lc.alertTime(10, 10, 4), d = Lc.blindRadius(10, ta); fill('ch4.say.edge', { d: r0(d) }); }
// ch5
for (const a of [0.10, 0.24, 0.2]) {
  const c = S.catalogue(7, 500, a), n6 = c.filter(e => e.M >= 6).length, n7 = c.filter(e => e.M >= 7).length;
  fill(a <= 0.12 ? 'ch5.say.loose' : a >= 0.24 ? 'ch5.say.tight' : 'ch5.say.mid', { y: r0(500), n: r0(c.length), n6: r0(n6), n7: r0(n7) });
}
// ch6
for (const M of [5, 7, 8, 9]) {
  const n = GR.perYear(M, fit), days = 365.25 / n;
  fill(days < 730 ? 'ch6.say.world.days' : 'ch6.say.world.years', { M: r1(M), n: r1(n), gap: days < 730 ? r0(days) : r0(days / 365.25) });
}
fill('ch6.say.extrap', {});
for (const M of [5, 7, 9]) {
  const cnt = cat.filter(e => e.M >= M - 1e-9).length, n = cnt / (cat[cat.length - 1].t - cat[0].t) * 1000;
  if (cnt) fill('ch6.say.model', { M: r1(M), n: r1(n), gap: r0(1000 / n), b: r1(GR.slope([5, 5.5, 6], rates.slice(0, 3))) }); else fill('ch6.say.model.none', { M: r1(M) });
}
// ch7
const pct = x => x >= 0.995 ? Z['ch7.unit.over99'] : x < 0.001 ? Z['ch7.unit.under01'] : fmt(x * 100, x < 0.1 ? 1 : 0) + '%';
for (const Mm of [5, 8]) for (const M of [3, 7]) for (const S0 of [0, 29]) for (const T of [1, 30]) {
  const N = A.expected(Mm, M, S0, T), pr = A.prob(Mm, M, S0, T), v = { t: r0(T), s1: r0(S0), s2: r0(S0 + T), M: r1(M), n: r2(N), p: pct(pr), k: r0(0) };
  ok(pr >= 0 && pr <= 1, 'probability in [0,1]');
  fill(M > Mm ? 'ch7.say.bigger' : S0 === 0 ? 'ch7.say.start0' : 'ch7.say.later', v);
}
ok(pct(0.9999) === Z['ch7.unit.over99'] && pct(1e-5) === Z['ch7.unit.under01'], 'percent caps');
// ch8
{ const iv = S.intervals(cat, 7), hr = Q.call.hitRates(cat, 7, 30, 2);
  for (const [a, w] of [[0, 10], [200, 100]]) {
    fill('ch8.say.ready', { since: r0(78), mean: r0(S.mean(iv)), a: r0(a), b: r0(a + w) });
    fill('ch8.say.readynone', { mean: r0(S.mean(iv)), a: r0(a), b: r0(a + w) });
  }
  fill('ch8.say.running', {}); fill('ch8.say.hit', { when: r0(12), M: r1(7.1), p: r0(hr.now * 100) }); fill('ch8.say.missbefore', { when: r0(3), M: r1(7.0) }); fill('ch8.say.missnone', {}); }

// every say key in the copy is exercised, and every say key app.js uses exists
const sayKeys = Object.keys(Z).filter(k => /\.say(\.|0|$)/.test(k));
for (const k of sayKeys) ok(used.has(k), 'branch exercised: ' + k);
for (const m of appSrc.matchAll(/'(ch\d\.say[\w.]*)'/g)) ok(Z[m[1]] != null, 'app key exists: ' + m[1]);
for (const m of appSrc.matchAll(/\bt\('([a-z]\w*\.[\w.]*\w)'/g)) ok(Z[m[1]] != null, 'copy key exists: ' + m[1]);

/* ───── language hygiene ───── */
ok(!/[一-鿿]/.test(appSrc), 'no Chinese in app.js');
ok(!/[一-鿿]/.test(fs.readFileSync(path.join(dir, 'models.js'), 'utf8')), 'no Chinese in models.js');
ok(!/左图|右图|左边的图|右边的图/.test(Object.values(Z).join('')), 'no left/right figure');

console.log(`models.cjs: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
