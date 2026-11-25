'use strict';
// Re-derives every model on the page independently, pins the numbers the prose states (bindings.cjs) and checks the
// built copy still says them; checks slider defaults against the prose, the Big Mac data against The Economist's own
// published valuations, live-sentence keys, and that no Chinese sits outside the copy.
// Run: node economics/money/what-sets-an-exchange-rate/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const dir = path.join(__dirname, '..');
const M = require(path.join(dir, 'models.js'));
const B = require(path.join(dir, 'bindings.cjs'))(M);
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(dir, 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;
const { unprefill } = require(path.join(dir, '../../../scripts/lib/prefill.cjs'));
const html = unprefill(fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), Z);
const appSrc = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');

let n = 0, fails = 0;
function check(name, got, want) { n++; if (got !== want) { fails++; console.error(`FAIL ${name}: got ${got}, expected ${want}`); } }
function ok(name, cond) { n++; if (!cond) { fails++; console.error('FAIL ' + name); } }
function near(name, a, b, tol = 1e-9) { ok(`${name} (${a} vs ${b})`, Math.abs(a - b) <= tol); }
function says(key, phrase) { n++; if (!Z[key] || !Z[key].includes(phrase)) { fails++; console.error(`FAIL prose ${key} should contain "${phrase}"`); } }
const slider = id => { const m = html.match(new RegExp(`id="${id}" min="([^"]+)" max="([^"]+)" step="([^"]+)" value="([^"]+)"`)); if (!m) throw new Error('no slider ' + id); return { min: +m[1], max: +m[2], step: +m[3], value: +m[4] }; };
const checked = name => (html.match(new RegExp(`name="${name}" value="([^"]+)" checked`)) || [])[1];

/* every binding is used in the copy, and its value shows up in some zh string */
{
  const all = Object.values(Z).join('\n');
  for (const [k, v] of Object.entries(B)) ok(`binding ${k}=${v} appears in the copy`, all.includes(v));
}

/* ch1 market: clearing price really equates supply and demand; BoP identity */
{
  const K = M.market;
  check('ch1 defaults', `${slider('mkK').value}/${slider('mkF').value}/${slider('mkG').value}`, '80/60/0');
  for (const [k, F, G] of [[0.8, 60, 0], [1, 60, 0], [0.6, 60, 0], [1, 60, 60], [0.4, 150, -100]]) {
    const r = K.solve(k, F, G), sup = k * K.X + K.Fin + K.beta * (r.S - K.S0), dem = K.M + F + G - K.beta * (r.S - K.S0);
    near(`ch1 clears k=${k} F=${F} G=${G}`, sup, dem, 1e-9); near('ch1 BoP identity', r.ca, r.privOut + r.dRes);
  }
  check('ch1 base', B['ch1.sBase'], '7.10'); check('ch1 all', B['ch1.sAll'], '6.50'); check('ch1 low', B['ch1.sLow'], '7.70'); check('ch1 buy', B['ch1.sBuy'], '7.10');
  says('ch1.p4', '每月买入 600 亿美元'); says('ch1.p4', '80% 的货款'); says('ch1.model.how', '出口 300、进口 220');
}

/* ch2 Big Mac: data entry matches The Economist's published raw/adjusted values; my own OLS by brute force */
{
  const G = M.bigmac;
  check('ch2 rows', M.BIGMAC.rows.length, 54); check('ch2 count ex-US', G.count, 53); says('ch2.model.title', '53 个经济体');
  // USD_raw column of big-mac-full-index.csv, 2026-07-01
  for (const [iso, raw] of [['CHN', -0.37076], ['JPN', -0.5042], ['CHE', 0.45369], ['IND', -0.60543], ['EUZ', 0.13814], ['GBR', 0.18975], ['ARG', -0.05042], ['URY', 0.437]]) near(`ch2 raw ${iso} matches The Economist`, G.get(iso).raw, raw, 6e-5);
  const g = G.pts.filter(p => p.gdp != null); check('ch2 regression sample', g.length, 52);
  // the OLS line minimises squared error: nudging either coefficient raises it
  const sse = (a, b) => g.reduce((s, p) => s + (p.usd - a - b * p.gdp) ** 2, 0), s0 = sse(G.icpt, G.slope);
  ok('ch2 OLS is a minimum', s0 < sse(G.icpt + 0.01, G.slope) && s0 < sse(G.icpt - 0.01, G.slope) && s0 < sse(G.icpt, G.slope * 1.01) && s0 < sse(G.icpt, G.slope * 0.99));
  check('ch2 China implied PPP', B['ch2.cnPpp'], '4.26'); check('ch2 China raw', B['ch2.cnRaw'], '37.1'); check('ch2 China adj', B['ch2.cnAdj'], '25.9');
  check('ch2 log slope', B['ch2.logSlope'], '1.01'); check('ch2 log R2', B['ch2.logR2'], '0.99'); check('ch2 R2', B['ch2.r2'], '0.05');
  check('ch2 under', B['ch2.under'], '41'); check('ch2 slope per 10k', B['ch2.slope10k'], '0.13'); check('ch2 Japan adj', B['ch2.jpnAdj'], '47.7');
  says('ch2.p1', '26.5 ÷ 6.22'); says('ch2.p4', '23.8%'); // The Economist's own CNY adjusted valuation, 2026-07: −23.784%
  check('ch2 default view/country', `${checked('bmView')}/${checked('bmC')}`, 'ppp/CHN');
}

/* ch3 real exchange rate */
{
  check('ch3 defaults', `${slider('reA').value}/${slider('reCn').value}/${slider('reUs').value}/${slider('reN').value}`, '0/0/3/3');
  near('ch3 ratio', M.real.ratio(0, 0, 0.03, 3), 1 / 1.03 ** 3); near('ch3 break-even restores 1', M.real.ratio(M.real.breakEven(0.01, 0.04, 5), 0.01, 0.04, 5), 1, 1e-12);
  check('ch3 q', B['ch3.qDef'], '8.5'); check('ch3 be', B['ch3.beDef'], '9.3');
}

/* ch4 CIP: no-arbitrage by construction; hedged return equals the yuan rate */
{
  check('ch4 defaults', `${slider('cpS').value}/${slider('cpU').value}/${slider('cpC').value}/${checked('cpT')}`, '6.66/3.875/1.4/12');
  for (const [S, iu, ic, tau] of [[6.66, 0.03875, 0.014, 1], [7, 0.01, 0.03, 0.25], [6.2, 0.05, 0.05, 0.5]]) {
    const F = M.cip.forward(S, iu, ic, tau); near('ch4 two paths equal', (1 / S) * (1 + iu * tau) * F, 1 + ic * tau, 1e-12); near('ch4 hedged = yuan rate', M.cip.hedged(S, iu, ic, tau), ic, 1e-12);
  }
  check('ch4 F12', B['ch4.f12'], '6.5013'); check('ch4 pts', B['ch4.pts12'], '1587'); check('ch4 hedged', B['ch4.hedged'], '1.40');
  near('ch4 USD rate = Fed midpoint', 0.03875, (M.FRONTIER.fed.lo + M.FRONTIER.fed.hi) / 200, 1e-12); near('ch4 CNY rate = PBOC 7-day', 0.014, M.FRONTIER.pboc7d.rate / 100, 1e-12);
}

/* ch5 overshooting: impact jump satisfies money market + UIP; path converges */
{
  check('ch5 defaults', `${slider('ovM').value}/${slider('ovL').value}/${slider('ovT').value}`, '5/2/0.5');
  for (const [dm, l, th] of [[5, 2, 0.5], [3, 1, 2], [10, 4, 0.2]]) {
    const r = M.over.solve(dm, l, th), di = -dm / l;   // money market with prices fixed: Δm = −λ·Δi
    const ds = (M.over.s(1e-6, dm, l, th) - M.over.s(0, dm, l, th)) / 1e-6;  // expected change in s per year
    near(`ch5 UIP at impact dm=${dm}`, ds, di, 1e-4);  // depreciation rate = i − i* = Δi (negative: appreciation)
    near('ch5 jump', M.over.s(0, dm, l, th), r.jump, 1e-12); near('ch5 long run', M.over.s(200, dm, l, th), dm, 1e-9); near('ch5 prices', M.over.p(200, dm, l, th), dm, 1e-9);
  }
  check('ch5 jump', B['ch5.jumpDef'], '10'); check('ch5 i', B['ch5.iDef'], '2.5'); check('ch5 half', B['ch5.halfDef'], '1.39'); check('ch5 fast', B['ch5.jumpFast'], '5.5');
  says('ch5.p3', '把 θ 拖到每年 5'); ok('ch5 slider reaches 5', slider('ovT').max === 5);
}

/* ch6 carry: deterministic, break-even arithmetic, no-crash/no-noise limit, the 2024 shock */
{
  check('ch6 defaults', `${slider('caD').value}/${slider('caL').value}/${slider('caP').value}/${slider('caC').value}`, '4/3/10/15');
  const a = M.carry.run(0.04, 3, 0.1, 0.15), b = M.carry.run(0.04, 3, 0.1, 0.15);
  check('ch6 repeatable', a.median, b.median); near('ch6 break-even', a.breakEven, 0.015, 1e-12);
  const s = M.carry.sigma; M.carry.sigma = 0; const q = M.carry.run(0.04, 2, 0, 0.15); M.carry.sigma = s;
  near('ch6 no noise, no crash = compounding carry', q.median, Math.pow(1 + 0.08 / 12, 120), 1e-9);
  check('ch6 mean', B['ch6.meanDef'], '7.5'); check('ch6 med', B['ch6.medDef'], '3.7'); check('ch6 lose', B['ch6.loseDef'], '37');
  check('ch6 mean5', B['ch6.mean5'], '12.7'); check('ch6 med5', B['ch6.med5'], '−1.0'); check('ch6 lose5', B['ch6.lose5'], '52'); check('ch6 wipe5', B['ch6.wipe5'], '1.2');
  check('ch6 yen move', B['ch6.ykMove'], '12'); check('ch6 yen loss', B['ch6.ykLoss5'], '62'); check('ch6 yen years', B['ch6.ykYears'], '2.4');
  says('ch6.p3', '10% × 15%');
}

/* ch7 trilemma */
{
  check('ch7 defaults', `${checked('trR')}/${slider('trD').value}/${slider('trH').value}`, 'float/2/2');
  const T = M.tri; check('ch7 float', T.shock('float', 2, 2).dFx, 4); check('ch7 peg', T.shock('peg', 2, 2).dRate, 2); check('ch7 ctrl', T.shock('ctrl', 2, 2).gap, 2);
  for (const r of T.regimes) ok(`ch7 lost key ${r}`, Z['ch7.lost.' + T.lost[r]] != null && Z['ch7.say.' + r] != null);
}

/* ch8 attack: shadow rate meets the peg exactly at T; the jump in reserves is αμ */
{
  check('ch8 defaults', `${slider('pgMu').value}/${slider('pgA').value}/${slider('pgR').value}`, '2/5/40');
  for (const [mu, al, R] of [[2, 5, 40], [4, 5, 40], [1.5, 3, 70]]) {
    const s = M.peg.solve(mu, al, R); near(`ch8 shadow = peg at T (${mu},${al},${R})`, M.peg.shadowAt(s.T, mu, al, R), M.peg.Sbar, 1e-9);
    near('ch8 reserves just before T', M.peg.reservesAt(s.T - 1e-9, mu, al, R), s.run, 1e-6); check('ch8 reserves after T', M.peg.reservesAt(s.T + 1e-9, mu, al, R), 0);
    near('ch8 no jump in the rate at T', M.peg.rateAt(s.T + 1e-9, mu, al, R), M.peg.Sbar, 1e-6);
  }
  check('ch8 T', B['ch8.tDef'], '15'); check('ch8 naive', B['ch8.naiveDef'], '20'); check('ch8 share', B['ch8.shareDef'], '25'); check('ch8 t4', B['ch8.t4'], '5'); check('ch8 share4', B['ch8.share4'], '50');
}

/* ch9 mismatch */
{
  check('ch9 defaults', `${slider('mmPhi').value}/${slider('mmPsi').value}/${slider('mmD').value}`, '50/10/30');
  const r = M.mismatch.solve(0.5, 0.1, 0.3); near('ch9 A', r.A, 103, 1e-9); near('ch9 L', r.L, 69, 1e-9);
  near('ch9 zero net worth at d*', M.mismatch.solve(0.5, 0.1, r.star).nw, 0, 1e-9);
  check('ch9 nw', B['ch9.nwDef'], '15'); check('ch9 lev', B['ch9.levDef'], '67'); check('ch9 star', B['ch9.starDef'], '200'); check('ch9 nw100', B['ch9.nw100'], '50');
  ok('ch9 slider reaches 100%', slider('mmD').max >= 100);
}

/* ch10 fixing: band holds; steady-state lag ≈ τκ/(1−κ) sets when the band binds */
{
  check('ch10 defaults', `${slider('fxT').value}/${slider('fxK').value}`, '-0.2/0.8');
  for (const [tau, k] of [[-0.002, 0.95], [0.003, 0.9], [-0.002, 0.8]]) {
    const r = M.fixing.run(tau, k); ok(`ch10 within band ${tau},${k}`, r.close.every((c, i) => c >= r.fix[i] * 0.98 - 1e-12 && c <= r.fix[i] * 1.02 + 1e-12));
  }
  check('ch10 0.8 free', M.fixing.run(-0.002, 0.8).edgeDays, 0); check('ch10 0.95 days', B['ch10.edge95'], '47'); check('ch10 gap', B['ch10.gap95'], '4.5');
  ok('ch10 lag rule: 0.9 just free, 0.92 binds', M.fixing.run(-0.002, 0.9).edgeDays === 0 && M.fixing.run(-0.002, 0.92).edgeDays > 0);
  check('ch10 2015', B['ch10.dev2015'], '1.9');
}

/* ch11 coordination */
{
  check('ch11 defaults', `${slider('coA').value}/${slider('coB').value}/${slider('coS').value}`, '0/4/0.9');
  for (const e of M.coord.equilibria(0, 4)) near('ch11 equilibrium is a fixed point', M.coord.next(e.s, 0, 4), e.s, 1e-9);
  const tp = M.coord.tipping(4); ok('ch11 tipping brackets', M.coord.equilibria(tp + 0.01, 4).length === 3 && M.coord.equilibria(tp - 0.01, 4).length === 1);
  check('ch11 tip', B['ch11.tip'], '−1.07'); check('ch11 def', B['ch11.finDef'], '98'); check('ch11 -0.8', B['ch11.finM08'], '94'); check('ch11 -1.1', B['ch11.finM11'], '0.6');
  ok('ch11 b ≤ 2 unique', M.coord.equilibria(0.3, 2).length === 1);
}

/* frontier block: shapes and a few derived values */
{
  const F = M.FRONTIER;
  for (const [k, v] of Object.entries(F)) ok(`FRONTIER.${k} has source and kind`, typeof v.source === 'string' && /measured|claim/.test(v.kind));
  check('fix pct', B['f.fixPct'], '0.8'); check('fix pips', Math.round((F.cnyFix.fix - F.cnyFix.est) * 10000), F.cnyFix.pips);
}

/* live-sentence keys referenced by app.js exist; no Chinese outside the copy */
{
  const pj = JSON.parse(fs.readFileSync(path.join(dir, 'page.json'), 'utf8'));
  for (const [p, vals] of Object.entries(pj.dynamicKeys)) for (const v of vals) ok(`dynamic key ${p}.${v}`, Z[`${p}.${v}`] != null);
  const cjk = /[㐀-鿿]/;
  ok('no CJK in app.js', !cjk.test(appSrc)); ok('no CJK in models.js', !cjk.test(fs.readFileSync(path.join(dir, 'models.js'), 'utf8')));
  for (const f of fs.readdirSync(path.join(dir, 'figures'))) ok(`no CJK in figures/${f}`, !cjk.test(fs.readFileSync(path.join(dir, 'figures', f), 'utf8')));
  const stripped = html.replace(/<title>[\s\S]*?<\/title>/, '').replace(/<meta name="description"[^>]*>/, '').replace(/>中</g, '><'); // title/description are the pre-filled doc.title/doc.desc
  ok('no CJK in index.html outside pre-fill', !cjk.test(stripped.replace(/<script[\s\S]*?<\/script>/g, '')));
}

console.log(`${n - fails}/${n} checks passed`);
process.exit(fails ? 1 : 0);
