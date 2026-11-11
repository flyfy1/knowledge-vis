'use strict';
// Pins every number the essay's prose states to the page's own model code, plus copy/key hygiene.
// Run: node probability/everyday/numbers-lie/tests/models.cjs
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
const dir = path.join(__dirname, '..');
const M = require(path.join(dir, 'models.js'));
const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(dir, 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;
let n = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); n++; };
const has = (key, s) => ok(Z[key] && Z[key].includes(s), `copy "${key}" should contain "${s}"`);
const f = (x, d) => x.toFixed(d);
const fmtK = x => Math.round(x).toLocaleString('en-US');

/* 1 regression to the mean */
const s0 = M.regressSample({ luck: 0.5, q: 0.1, seed: 1 });
ok(s0.B.n === 50 && s0.T.n === 50, '50 students in each extreme group (hero, ch1)');
has('hero.case', '50 个学生'); has('hero.case', '{gain}');
ok(f(s0.B.m2 - s0.B.m1, 1) === '8.9', 'hero gain is 8.9 at the default: ' + (s0.B.m2 - s0.B.m1));
ok(s0.B.m2 > s0.B.m1 && s0.T.m2 < s0.T.m1, 'bottom group rises, top group falls');
has('c1.a1', f(M.regressExpected(0.5, 0.1), 1) + ' 分');
ok(Math.abs(M.regressExpected(0.5, 0.1) - 8.775) < 0.01, 'closed form 0.5*10*phi(z)/q');
const sz = M.regressSample({ luck: 0, q: 0.1, seed: 1 });
ok(Math.abs(sz.B.m2 - sz.B.m1) < 1e-9 && Math.abs(sz.T.m2 - sz.T.m1) < 1e-9, 'luck 0: no regression at all');
ok(M.regressExpected(0.5, 0.05) > M.regressExpected(0.5, 0.1) && M.regressExpected(0.75, 0.1) > M.regressExpected(0.5, 0.1), 'more extreme / more luck -> more regression');
ok(Math.abs((s0.S.m2 - s0.S.m1) - (s0.U.m2 - s0.U.m1)) < 1, 'control halves improve about equally at the default: ' + f(s0.S.m2 - s0.S.m1, 2) + ' vs ' + f(s0.U.m2 - s0.U.m1, 2));
// sample mean agrees with the closed form across settings (500 draws; averaged over 40 retests)
for (const [luck, q] of [[0.25, 0.1], [0.5, 0.1], [0.75, 0.2]]) {
  let acc = 0; for (let r = 0; r < 40; r++) { const s = M.regressSample({ luck, q, seed: 1 + r, retest: r }); acc += s.B.m2 - s.B.m1; }
  ok(Math.abs(acc / 40 - M.regressExpected(luck, q)) < 0.5, `sim vs closed form luck=${luck} q=${q}: ${f(acc / 40, 2)} vs ${f(M.regressExpected(luck, q), 2)}`);
}

/* 2 small samples */
const st = M.schoolsSetup(), y0 = M.schoolsYear(st, 0, 0), y1 = M.schoolsYear(st, 0, 1), sm = M.schoolsSummary(st, y0);
has('c2.a1', '中位数是 ' + f(sm.topMedianSize, 1) + ' 人'); has('c2.a1', '后 10 名是 ' + f(sm.bottomMedianSize, 1) + ' 人'); has('c2.a1', '400 所是 ' + sm.allMedianSize + ' 人');
const rank1 = M.mean(y0.top.map(i => y1.rank[i]));
has('c2.a1', '第 ' + f(rank1, 0) + ' 名');
ok(sm.topMedianSize < sm.allMedianSize / 4 && sm.bottomMedianSize < sm.allMedianSize / 4, 'both ends are small schools');
ok(Math.abs(M.schoolSE(16) / M.schoolSE(1600) - 10) < 1e-12, '16 vs 1,600 students: ten times the wobble'); has('c2.a2', '十倍');
for (const sp of [1.5, 2, 2.5, 3]) { const a = M.schoolsYear(st, sp, 0), b = M.schoolsYear(st, sp, 1); const r = M.mean(a.top.map(i => b.rank[i])); ok(r < 100, `spread ${sp}: last year's top 10 stay near the top (${f(r, 0)})`); }
for (const sp of [0.25, 0.5, 0.75, 1, 1.25]) { const a = M.schoolsYear(st, sp, 0), s = M.schoolsSummary(st, a); ok(s.topMedianSize < s.allMedianSize / 2, `spread ${sp}: top 10 still mostly small (median ${s.topMedianSize})`); }

/* 3 survivorship */
const run = M.fundsRun({ bar: 0.8, seed: 5 }), at10 = M.fundsAt(run, 10), at15 = M.fundsAt(run, 15);
has('c3.a1', '还剩 ' + at10.alive + ' 只'); has('c3.a1', '平均年化收益是 ' + f(at10.survivorAnnual * 100, 1) + '%');
has('c3.a1', '实际平均是 ' + f(at10.allAnnual * 100, 1) + '%'); has('c3.a1', '平均年化是 ' + f(at15.afterAnnual * 100, 1) + '%');
has('c3.how', '4%'); ok(Math.abs(Math.exp(M.FUND.mu) - 1 - 0.0408) < 0.001, 'model mean ~4% a year (log 0.04)');
const r0 = M.fundsAt(M.fundsRun({ bar: 0, seed: 5 }), 10);
ok(r0.alive === 1000 && Math.abs(r0.survivorAnnual - r0.allAnnual) < 0.003, 'bar 0: brochure equals the real average');
const bars = [0.5, 0.8, 0.9, 1].map(b => M.fundsAt(M.fundsRun({ bar: b, seed: 5 }), 10).survivorAnnual);
ok(bars.every((v, i) => !i || v > bars[i - 1]), 'higher bar -> prettier brochure');

/* 4 many comparisons */
ok(f(M.familyRate(20) * 100, 0) === '64', '1-0.95^20 = 64%'); has('c4.p2', '约 64%'); has('c4.a1', '二十样是 64%');
ok(M.familyRate(60) > 0.95, '60 tests > 95%'); has('c4.a1', '六十样超过 95%');
ok(Math.abs(M.familyRate(1) - 0.05) < 1e-12, 'one test: 5%'); has('c4.a1', '机会是 5%');
ok(Math.abs(M.familySim(20, 4000) - M.familyRate(20)) < 0.03, 'simulated rounds agree with 1-0.95^k: ' + M.familySim(20, 4000));
let pu = 0; for (let s = 0; s < 200; s++) pu += M.studies(50, s).p.filter(p => p < 0.05).length; ok(Math.abs(pu / 10000 - 0.05) < 0.01, 'null p-values are uniform: ' + pu / 10000);

/* 5 Simpson */
const SP = M.SIMP, real = M.simpson(SP.aLarge, SP.bLarge);
has('c5.p1', '83% 对 78%'); ok(f(real.B.rate * 100, 0) === '83' && f(real.A.rate * 100, 0) === '78', 'pooled 83 vs 78');
has('c5.p1', 'A 是 93%，B 是 87%'); has('c5.p1', 'A 是 73%，B 是 69%');
ok([SP.A.small, SP.B.small, SP.A.large, SP.B.large].map(v => f(v * 100, 0)).join() === '93,87,73,69', 'within-group rates');
has('c5.p2', '263 个'); has('c5.p2', '只有 80 个'); ok(SP.aLarge * 350 === 263 && SP.bLarge * 350 === 80, 'group sizes');
has('c5.a2', f(SP.bLarge * 100, 0) + '%'); has('c5.a2', '超过 ' + f(M.simpsonFlipAt(SP.bLarge) * 100, 0) + '%');
const mix = (263 + 80) / 700, rnd = M.simpson(mix, mix);
has('c5.a2', f(mix * 100, 0) + '% 的大结石'); has('c5.a2', 'A 的合计是 ' + f(rnd.A.rate * 100, 0) + '%'); has('c5.a2', 'B 是 ' + f(rnd.B.rate * 100, 0) + '%');
ok(!rnd.flipped && real.flipped, 'randomised: pooled agrees with strata; 1986 mix: flipped');
for (let b = 0; b <= 1.0001; b += 0.05) { const x = M.simpsonFlipAt(b); if (x > 0 && x < 1) { ok(Math.abs(M.simpson(x, b).A.rate - M.simpson(x, b).B.rate) < 1e-9, 'flip point is exact'); } }

/* 6 base rates */
const sc = M.screen(0.01, 0.9, 0.05);
['100 个病人里 90 个', '9,900 个', '误报 495 个', '一共 585 人', '约 ' + f(sc.ppv * 100, 0) + '%'].forEach(s => has('c6.p2', s));
ok(sc.sick === 100 && sc.tp === 90 && Math.abs(sc.fp - 495) < 1e-9 && Math.abs(sc.tp + sc.fp - 585) < 1e-9, 'counts per 10,000');
has('c6.a1', '约 ' + f(M.screen(0.3, 0.9, 0.05).ppv * 100, 0) + '% 是真病人'); has('c6.a1', '只有约 ' + f(sc.ppv * 100, 0) + '%');

/* 7 relative vs absolute risk */
const ra = M.risk(1, 2), rb = M.risk(1000, 2);
ok(ra.diff === 1 && ra.nn === 10000 && rb.diff === 1000 && rb.nn === 10, 'doubling 1 vs 1000 per 10,000');
has('c7.a1', '多出一千例'); has('c7.a1', '每十个人'); has('c7.a1', '一万个人接触才多出一个');
ok(Math.abs(10000 / (200 - 100) - 100) < 1e-9 && M.risk(2, 0.5).nn === 10000, '2%->1%: 100 people; 2->1 per 10,000: 10,000 people');
has('c7.a2', '每 100 人'); has('c7.a2', '要一万人');
// 1995 pill: BNF reference rates (Drife 2001, BMJ 323:119) of 15 vs 25 per 100,000 a year -> 1.5 vs 2.5 per 10,000, one extra case
const pill = M.risk(15 / 10, 25 / 15);
ok(Math.abs(pill.exposed - 2.5) < 1e-9 && Math.abs(pill.diff - 1) < 1e-9 && Math.abs(pill.nn - 10000) < 1e-6, 'pill: 1.5 -> 2.5 per 10,000, one extra case');
['约 5 例', '约 15 例', '约 25 例', '从 1.5 例到 2.5 例', '多出大约一例'].forEach(s => has('c7.p2', s));

/* 8 mean vs median */
const te = M.tailExact(1), ts = M.tailSample(1), tr = M.tailSample(1, { rich: 5e6 });
has('c8.a1', f(te.ratio, 2) + ' 倍'); has('c8.a1', f(te.belowMean * 100, 0) + '% 的人');
has('c8.a1', '平均数约 ' + fmtK(Math.round(ts.mean / 100) * 100)); has('c8.a1', '中位数约 ' + fmtK(Math.round(ts.median / 100) * 100));
has('c8.a1', '是 ' + f(ts.mean / ts.median, 2) + ' 倍'); has('c8.a1', '跳到约 ' + fmtK(Math.round(tr.mean / 100) * 100)); has('c8.a1', '变成 ' + f(tr.belowMean * 100, 0) + '%');
ok(Math.abs(tr.median - ts.median) < 20, 'median barely moves with the rich arrival');
ok(Math.abs(ts.mean / ts.median - te.ratio) < 0.1 && Math.abs(ts.belowMean - te.belowMean) < 0.03, 'sample agrees with closed form');
has('c8.ctl.rich', '500 万');

/* 9 Goodhart */
const H = M.ghRun(100, { pressure: 0.2, ease: 1.8 }).hist, W = (a, b, k) => M.ghWindow(H, a, b, k);
const mR = W(90, 100, 'm') / W(0, 10, 'm'), qR = W(90, 100, 'q') / W(0, 10, 'q');
has('c9.a1', f(mR, 2) + ' 倍'); has('c9.a1', '只剩开始时的 ' + f(qR, 2)); has('c9.a1', '从 ' + f(W(0, 10, 'r'), 2) + ' 掉到 ' + f(W(90, 100, 'r'), 2));
ok(mR > 1.35 && mR < 1.45, 'metric up about four tenths'); has('c9.a1', '涨了约四成');
for (const ease of [0, 0.3, 0.6]) for (const p of [0.05, 0.2, 0.5]) { const h = M.ghRun(400, { pressure: p, ease }).hist; ok(M.ghWindow(h, 390, 400, 'q') / M.ghWindow(h, 0, 10, 'q') > 0.95, `ease ${ease} pressure ${p}: quality holds (honest text)`); }
const h0 = M.ghRun(100, { pressure: 0, ease: 2.5 }).hist; ok(Math.abs(M.ghWindow(h0, 90, 100, 'q') / M.ghWindow(h0, 0, 10, 'q') - 1) < 1e-9, 'pressure 0: nothing changes');

/* hygiene: keys used by the page exist; no Chinese outside copy */
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
const keys = new Set([...html.matchAll(/data-i18n(?:-html)?="([^"]+)"/g)].map(m => m[1]));
[...html.matchAll(/data-i18n-attr="([^"]+)"/g)].forEach(m => m[1].split(';').forEach(p => keys.add(p.split(':')[1])));
[...app.matchAll(/\bt\('([a-z0-9.]+)'/gi)].forEach(m => keys.add(m[1]));
[...app.matchAll(/'(c\d+\.(?:say|ax|ctl)\.[a-z0-9.]+)'/gi)].forEach(m => keys.add(m[1]));
for (const k of keys) ok(k in Z, 'missing copy key ' + k);
const cjk = /[㐀-鿿＀-￯]/;
ok(!cjk.test(html.replace(/<!--[\s\S]*?-->/g, '').replace('>中</button>', '')), 'no Chinese text in index.html (besides the 中 toggle label)');
ok(!cjk.test(app.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')), 'no Chinese text in app.js');
ok(!cjk.test(fs.readFileSync(path.join(dir, 'models.js'), 'utf8')), 'no Chinese text in models.js');
for (const [k, v] of Object.entries(Z)) { const opens = (v.match(/<(strong|em|a|b)\b/g) || []).length, closes = (v.match(/<\/(strong|em|a|b)>/g) || []).length; ok(opens === closes, 'balanced tags in ' + k); }
/* English copy: same keys and placeholders as zh, no CJK, the prose numbers carried over */
if (fs.existsSync(path.join(dir, 'copy.en.js'))) {
  vm.runInContext(fs.readFileSync(path.join(dir, 'copy.en.js'), 'utf8'), ctx);
  const E = ctx.window.ESSAY_COPY.en, ph = s => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join();
  ok(Object.keys(E).join() === Object.keys(Z).join(), 'copy.en.js has the same keys in the same order as copy.zh.js');
  for (const k of Object.keys(Z)) { ok(ph(E[k]) === ph(Z[k]), 'same placeholders in ' + k); ok(!cjk.test(E[k]), 'no CJK in en ' + k + ': ' + E[k]); }
  const hasE = (key, s) => ok(E[key].includes(s), `en "${key}" should contain "${s}"`);
  hasE('c1.a1', f(M.regressExpected(0.5, 0.1), 1) + ' points'); hasE('c2.a1', 'is ' + f(sm.topMedianSize, 1) + ' students'); hasE('c2.a1', f(rank1, 0) + 'th place');
  hasE('c3.a1', at10.alive + ' funds remain'); hasE('c3.a1', f(at10.survivorAnnual * 100, 1) + '%'); hasE('c3.a1', f(at10.allAnnual * 100, 1) + '%'); hasE('c3.a1', f(at15.afterAnnual * 100, 1) + '%');
  hasE('c4.p2', 'about 64%'); hasE('c5.a2', 'above ' + f(M.simpsonFlipAt(SP.bLarge) * 100, 0) + '%'); hasE('c6.a1', 'about ' + f(M.screen(0.3, 0.9, 0.05).ppv * 100, 0) + '%');
  hasE('c7.p2', 'from 1.5 to 2.5 cases'); hasE('c8.a1', f(te.ratio, 2) + ' times'); hasE('c8.a1', 'ratio of ' + f(ts.mean / ts.median, 2)); hasE('c8.a1', 'becomes ' + f(tr.belowMean * 100, 0) + '%');
  hasE('c9.a1', 'to ' + f(mR, 2) + ' times'); hasE('c9.a1', 'only ' + f(qR, 2)); hasE('c9.a1', 'from ' + f(W(0, 10, 'r'), 2) + ' to ' + f(W(90, 100, 'r'), 2));
}
console.log(`PASS: ${n} checks (models, prose numbers, copy keys)`);
