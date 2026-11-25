'use strict';
// Pins every number the essay's prose states to the page's own models (models.js), checks that the built prose
// (copy.zh.js) says exactly that, that slider defaults match the defaults the prose describes, that every
// live-sentence branch is reachable, that the SVB diagram is drawn to scale, and that the models behave as the
// prose claims (two equilibria, insurance and LOLR remove the bad one, insolvency defeats LOLR).
// Run: node economics/money/why-banks-run/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const dir = path.join(__dirname, '..');
const M = require(path.join(dir, 'models.js'));
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(dir, 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;
const { unprefill } = require(path.join(dir, '../../../scripts/lib/prefill.cjs'));
const html = unprefill(fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), Z);
const appSrc = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');

let n = 0, fails = 0;
function check(name, got, want) { n++; if (got !== want) { fails++; console.error(`FAIL ${name}: got ${got}, expected ${want}`); } }
function ok(name, cond) { n++; if (!cond) { fails++; console.error('FAIL ' + name); } }
function says(key, phrase) { n++; if (!Z[key] || !Z[key].includes(phrase)) { fails++; console.error(`FAIL prose ${key} should contain "${phrase}"`); } }
const f = (x, d) => M.fmt(x, d, 'en');
const slider = id => { const m = html.match(new RegExp(`id="${id}" min="([^"]+)" max="([^"]+)" step="([^"]+)" value="([^"]+)"`)); if (!m) throw new Error('no slider ' + id); return { min: +m[1], max: +m[2], step: +m[3], value: +m[4] }; };

/* ── facts block: the numbers as read from the sources ── */
{
  const S = M.FACTS.svb;
  check('SVB HTM loss', f(S.htmCost - S.htmFair, 1), '15.2'); says('ch5.p4', '低了 15.2 十亿美元'); says('dg.svb.cap', '低 15.2');
  check('SVB equity', f(S.equity, 1), '16.0'); says('dg.svb.cap', '股本 16.0');
  check('SVB securities share of assets ≈ Fed table', Math.round((S.afs + S.htmCost) / S.assets * 100), M.FACTS.svbSecuritiesPct);
  says('ch5.p2', '证券占总资产的 55%'); says('ch5.p2', '平均只有 25%'); says('ch5.p2', '占 94%'); says('ch5.p2', '平均是 41%'); says('ch5.p2', '久期是 6.2 年');
  check('Lehman lev = assets / equity', f(M.FACTS.lehman.assets / M.FACTS.lehman.equity, 1), '30.7');
  says('ch2.p4', '总资产 6,911 亿美元'); says('ch2.p4', '股东权益 225 亿美元'); says('ch2.p4', '30.7 倍'); says('ch2.p4', '跌大约 3.3%');
  says('ch5.p3', '从 1.52% 升到 3.88%'); says('ch5.p3', '从 0.73% 升到 4.41%');
  says('ch5.p5', '超过 40 十亿美元'); says('ch5.p5', '超过 100 十亿'); says('ch5.p5', '约为存款的 85%'); says('ch5.p5', '16 天流出 19 十亿美元');
  says('ch5.p5', '21 十亿美元可供出售债券'); says('ch5.p5', '税后亏损 1.8 十亿'); says('ch5.p5', '募资 2.25 十亿');
  says('ch7.p2', '最高偿付 50 万元'); says('ch7.p2', '2,912 家投保机构'); says('ch7.p2', '250,000 美元');
  says('ch7.p5', '低于风险加权资产的 4.5%'); says('ch7.p5', '2.5% 的资本留存缓冲'); says('ch7.p5', '不得低于 3%'); says('ch7.p5', 'LCR ≥ 100%');
  says('ch7.p5', '稳定零售存款 5%'); says('ch7.p5', '至少 10%'); says('ch7.p5', '经营性存款 25%'); says('ch7.p5', '其他存款 40%');
  check('leverage ratio 3% ≈ 33x', Math.round(100 / M.FACTS.basel.lev), 33); says('ch7.p5', '约 33 倍');
  says('ch7.p6', '大约差 9%');
  says('ch8.e1', '约 16 十亿瑞郎'); says('ch8.e2', '有 6 家'); says('ch8.e2', '是 2 家'); says('ch8.e2', '约 7.36 亿美元');
  ok('Nano Banc < 4/1000 of SVB', M.FACTS.nanoAssets / 1000 / S.assets < 0.004); says('ch8.e2', '不到硅谷银行的千分之四');
  says('ch8.e3', '合计 28.2 万亿美元'); says('ch8.e3', 'GDP 的 87%'); says('ch8.e3', '未保险存款 8.0 万亿美元'); says('ch8.e3', '回购 6.8 万亿'); says('ch8.e3', '货币市场基金 7.9 万亿'); says('ch8.e3', '要求的 120%');
  says('ch8.e4', '2.6 万亿美元以上'); says('ch8.e4', '约 3,500 亿美元'); check('FSR 2012 private credit', M.FACTS.fsr.pc2012, 350); says('ch8.e4', '约 1.5 万亿美元'); says('ch8.e4', '企业债务的 6%');
  says('ch8.e5', '3,100 亿美元'); says('ch8.d2', '3.3 十亿美元'); says('ch8.d2', '约 0.87 美元');
  says('ch8.d1', '超过 40 十亿美元'); says('ch8.d1', '16 天流出 19 十亿');
}

/* ── ch2 leverage ── */
{
  check('ch2 default L', slider('lvL').value, 30); check('ch2 default loss', slider('lvLoss').value, 2);
  const r = M.leverage(30, 2), r10 = M.leverage(10, 2);
  check('ch2 E', f(r.E, 1), '3.3'); check('ch2 D', f(r.D, 1), '96.7'); check('ch2 E1', f(r.E1, 1), '1.3');
  says('ch2.p2', '只有 3.3 块是股东的'); says('ch2.p2', '其余 96.7 块'); says('ch2.p2', '剩下 1.3 块'); says('ch2.p2', '少了 60%'); says('ch2.p2', '只要跌 3.3%');
  check('ch2 equity loss', f(r.eqLossPct, 0), '60');
  check('ch2 lev1', f(r.lev1, 1), '73.5'); says('ch2.p3', '升到 73.5 倍');
  check('ch2 sell', f(r.sell, 0), '58'); says('ch2.p3', '卖掉 58 块'); check('ch2 sellPct', f(r.sellPct, 0), '59'); says('ch2.p3', '占剩下资产的 59%');
  check('ch2 keep', f(r.keep, 0), '40'); says('ch2.p3', '只撑得起 40 块资产');
  check('ch2 L10 eq', f(r10.eqLossPct, 0), '20'); says('ch2.p3', '只少了 20%'); check('ch2 L10 sell', f(r10.sell, 0), '18'); says('ch2.p3', '卖掉 18 块');
  says('ch2.law', '资产跌 1%，股本就跌 L%');
  // identity: equity loss % = L × loss % while solvent
  for (const [L, l] of [[5, 1], [12, 3], [40, 2]]) { const x = M.leverage(L, l); ok(`ch2 eqLoss = L·loss (${L},${l})`, x.insolvent || Math.abs(x.eqLossPct - L * l) < 1e-9); }
  ok('ch2 wipe-out at 1/L', M.leverage(30, 100 / 30 + 1e-6).insolvent && !M.leverage(30, 100 / 30 - 1e-3).insolvent);
  ok('ch2 say.dead reachable', M.leverage(50, 10).insolvent); ok('ch2 say.ok reachable', !M.leverage(2, 0).insolvent);
  // diagram 3 to scale: 10x -> 10, 30x -> 3.3
  says('dg.cushion.cap', '10 倍时股本是 10，30 倍时只有 3.3'); says('dg.cushion.e30', '3.3');
}

/* ── ch4 Diamond–Dybvig ── */
{
  const D = M.DD_DEFAULT;
  check('ch4 default belief', slider('ddB').value / 100, D.b0); check('ch4 default s', slider('ddS').value / 100, D.s);
  check('ch4 default loss', slider('ddLoss').value, 0); check('ch4 default q', slider('ddQ').value, 0);
  ok('ch4 lolr off by default', !/id="ddLolr" checked/.test(html));
  says('ch4.model.how', '默认是 30%'); says('ch4.model.how', '拖到 20%');
  check('ch4 pi', M.DD.pi, 0.2); says('ch4.p3', '这里设 20%');
  check('ch4 R (diagram)', M.DD.R, 1.3); says('dg.dd.r1w', '1.3 元');
  // two equilibria: no one runs at w = pi, everyone runs at w = 1
  const p0 = M.ddPayoffs(M.DD.pi, D), p1 = M.ddPayoffs(0.999999, D);
  ok('ch4 good equilibrium: waiting beats running when only the impatient withdraw', p0.wait > p0.run);
  ok('ch4 bad equilibrium: running beats waiting when all withdraw', p1.wait < p1.run);
  const g30 = M.ddGame(D), g20 = M.ddGame(Object.assign({}, D, { b0: 0.2 }));
  ok('ch4 default runs', g30.ran && g30.w > 0.99); ok('ch4 20% calms', !g20.ran && Math.abs(g20.w - M.DD.pi) < 0.01);
  const tb = M.ddTipBelief(D); check('ch4 tip belief', f(tb * 100, 0), '25'); says('ch4.r1', '约 25%');
  ok('ch4 default belief above the tip, 20% below', D.b0 > tb && 0.2 < tb);
  check('ch4 tip w', f(M.ddTip(D) * 100, 0), '41');
  check('ch4 s=0.8', f(M.ddTipBelief(Object.assign({}, D, { s: 0.8 })) * 100, 0), '48'); says('ch4.r2', '约 48%'); says('ch4.r2', '0.8 元');
  check('ch4 s=0.4', f(M.ddTipBelief(Object.assign({}, D, { s: 0.4 })) * 100, 0), '12'); says('ch4.r2', '约 12%'); says('ch4.r2', '0.4 元');
  const qt = M.ddInsuredThreshold(D); check('ch4 insured threshold', f(qt * 100, 0), '74'); says('ch4.r3', '约 74%');
  ok('ch4 above threshold no run even at full fear', !M.ddGame(Object.assign({}, D, { q: 0.75, b0: 1 })).ran);
  ok('ch4 below threshold a full scare still runs', M.ddGame(Object.assign({}, D, { q: 0.72, b0: 1 })).ran);
  ok('ch4 LOLR removes the run on a sound bank', M.ddTipBelief(Object.assign({}, D, { lolr: true })) === null && !M.ddGame(Object.assign({}, D, { lolr: true, b0: 1 })).ran);
  const lt = M.ddLossThreshold(D); check('ch4 insolvency loss', f(lt * 100, 0), '23'); says('ch4.r4', '亏损超过 23%');
  check('ch4 LOLR break', f((1 - M.DD.p / M.DD.R) * 100, 0), '15'); says('ch4.r4', '约 15%');
  ok('ch4 LOLR holds below 15% loss', M.ddTipBelief(Object.assign({}, D, { lolr: true, loss: 0.14 })) === null);
  ok('ch4 LOLR breaks above 15% loss', M.ddTipBelief(Object.assign({}, D, { lolr: true, loss: 0.17 })) !== null);
  check('ch4 insolvency = 1 − 1/R', f((1 - 1 / M.DD.R) * 100, 0), '23');
  ok('ch4 insolvent bank runs even with LOLR and no fear', M.ddGame(Object.assign({}, D, { loss: 0.25, b0: 0, lolr: true })).ran && M.ddGame(Object.assign({}, D, { loss: 0.25, b0: 0, lolr: true })).fundamental);
  // every live sentence reachable
  ok('ch4 say.fund', M.ddGame(Object.assign({}, D, { loss: 0.3 })).fundamental);
  ok('ch4 say.safe', M.ddTipBelief(Object.assign({}, D, { q: 0.9 })) === null);
  ok('ch4 out.lolrok', !M.ddGame(Object.assign({}, D, { lolr: true, b0: 0.6 })).ran && M.ddGame(Object.assign({}, D, { lolr: true, b0: 0.6 })).path[0].w > M.DD.lam);
  // path shows several rounds, not a jump
  ok('ch4 default path has several rounds', g30.path.length >= 6);
}

/* ── ch5 SVB ── */
{
  const D = M.SVB_DEFAULT;
  check('ch5 slider dy', slider('svDy').value, D.dy); check('ch5 slider T', slider('svT').value, D.T); check('ch5 slider bond', slider('svBond').value, D.bondPct); check('ch5 slider run', slider('svRun').value, D.runPct);
  check('ch5 T = Fed duration', D.T, M.FACTS.svbHtmDuration); check('ch5 equity = 10-K', D.equity, +M.FACTS.svb.equity.toFixed(1)); check('ch5 deposits = 10-K', D.deposits, +M.FACTS.svb.deposits.toFixed(1)); check('ch5 cash = 10-K', D.cash, +M.FACTS.svb.cash.toFixed(1)); check('ch5 assets = 10-K', D.assets, +M.FACTS.svb.assets.toFixed(1));
  says('ch5.p4', '利率上升 2.5 个百分点'); says('ch5.p4', '久期 6.2 年'); says('ch5.p3', '按 1.5% 买入'); check('ch5 y0', M.SVB_DEFAULT.y0, 1.5); says('ch5.p1', '1.5%');
  const v = M.svb({});
  check('ch5 loss%', f(v.lossPct, 1), '14.0'); says('ch5.p4', '跌 14.0%');
  check('ch5 mtm loss', f(v.mtmLoss, 1), '16.3'); says('ch5.p4', '未实现亏损 16.3 十亿美元');
  check('ch5 mtm equity', f(v.mtmEq, 1), '−0.3'); says('ch5.p4', '已经是 −0.3 十亿');
  check('ch5 dy*', f(v.dyStar, 2), '2.45'); says('ch5.p4', '加息 2.45 个百分点');
  ok('ch5 dy* between the 2022 10y and 2y rises', v.dyStar > M.FACTS.y10_2022 - M.FACTS.y10_2021 && v.dyStar < M.FACTS.y2_2022 - M.FACTS.y2_2021);
  ok('ch5 mtm equity at dy* is zero', Math.abs(M.svb({ dy: v.dyStar }).mtmEq) < 1e-6);
  const v25 = M.svb({ bondPct: 25 }); check('ch5 25% mtm', f(v25.mtmEq, 1), '8.6'); says('ch5.p4', '还有 8.6 十亿'); check('ch5 25% dy*', f(v25.dyStar, 1), '6.1'); says('ch5.p4', '约 6.1 个百分点'); says('ch5.p4', '25%');
  // D·Δy·A approximation stated in ch5.p1 is close to the exact repricing for 1 pp
  const exact1 = 1 - M.priceFactor(6.2, 1.5, 1), approx1 = 6.2 / 1.015 * 0.01; ok('ch5 D·Δy approximation within 10% at 1 pp', Math.abs(exact1 - approx1) / exact1 < 0.1);
  says('ch5.p1', 'D × Δy × A');
  // default run size ≈ day-one outflow
  ok('ch5 default withdrawal ≈ $40bn+', v.W > 40 && v.W < 42);
  ok('ch5 say.ok', M.svb({ dy: 1 }).mtmEq > 0 && M.svb({ dy: 1 }).canPay); ok('ch5 say.under', v.mtmEq < 0 && v.canPay); ok('ch5 say.fail', !M.svb({ runPct: 100, dy: 5 }).canPay);
}

/* ── ch7 deposit insurance and LCR ── */
{
  const c = M.covered([60, 20], 50); check('ch7 covered', c.cov, 70); check('ch7 uncovered', c.unc, 10);
  says('ch7.p2', '存 60 万'); says('ch7.p2', '存 20 万'); says('ch7.p2', '拿回 70 万'); says('ch7.p2', '超出的 10 万');
  const D = M.LCR_DEFAULT;
  check('ch7 slider ins', slider('lcIns').value, D.insured); check('ch7 slider corp', slider('lcCorp').value, D.corp); check('ch7 slider h', slider('lcH').value, D.hqla); check('ch7 slider speed', slider('lcSpeed').value, D.speed);
  check('ch7 insured = 100 − SVB uninsured', D.insured, 100 - M.FACTS.svbUninsuredPct);
  const r = M.lcr({}); check('ch7 out30', f(r.out30, 1), '37.9'); says('ch7.p6', '30 天流出是 37.9'); says('ch7.p6', '持有 40 的流动资产');
  check('ch7 lcr', f(r.ratio, 0), '106'); says('ch7.p6', '覆盖率 106%'); check('ch7 days', f(r.days, 1), '1.7'); says('ch7.p6', '1.7 天'); says('ch7.p6', '每天 25%'); says('ch8.d1', '1.7 天'); says('ch8.d1', '每天 25%');
  ok('ch7 say.fail', !M.lcr({ hqla: 20 }).pass); ok('ch7 say.cover', M.lcr({ hqla: 80, insured: 40, corp: 30 }).unins <= 80);
}

/* ── wiring: dynamic keys exist, no Chinese outside the copy ── */
{
  const pj = JSON.parse(fs.readFileSync(path.join(dir, 'page.json'), 'utf8'));
  for (const [pre, vals] of Object.entries(pj.dynamicKeys)) for (const v of vals) ok(`key ${pre}.${v}`, Z[pre + '.' + v] != null);
  ok('no CJK in app.js outside comments', !/[一-鿿]/.test(appSrc.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')));
  ok('no CJK in models.js outside comments', !/[一-鿿]/.test(fs.readFileSync(path.join(dir, 'models.js'), 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')));
}

/* ── diagram 6 drawn to scale from FACTS ── */
{
  const part = fs.readFileSync(path.join(dir, 'figures/dg-svb.html'), 'utf8');
  const S = M.FACTS.svb, sc = 330 / S.assets;
  const want = [S.assets, S.afs + S.htmCost, S.deposits, S.deposits * M.FACTS.svbUninsuredPct / 100, S.equity, S.htmCost - S.htmFair];
  const widths = [...part.matchAll(/<rect x="15" y="[^"]+" width="([^"]+)"/g)].map(m => +m[1]);
  check('dg-svb rect count', widths.length, 6);
  want.forEach((v, i) => ok(`dg-svb bar ${i} to scale`, Math.abs(widths[i] - v * sc) < 0.06));
  const labels = [...part.matchAll(/class="mono m">([^<]+)</g)].map(m => m[1]);
  check('dg-svb numbers', labels.join(' '), want.map(v => v.toFixed(1)).join(' '));
}

console.log(`${n - fails}/${n} checks passed`);
if (fails) process.exit(1);
