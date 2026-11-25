'use strict';
// Re-derives the essay's numbers independently of models.js where possible (closed forms, raw data), checks that the
// models agree, and that the built copy (copy.zh.js) states exactly the bound values. Also: no Chinese outside the copy,
// every lab slider default matches the prose's "default" numbers, every placeholder a script fills exists.
// Run: node economics/growth/why-some-countries-got-rich/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const dir = path.join(__dirname, '..');
const M = require(path.join(dir, 'models.js'));
const D = require(path.join(dir, 'data.js'));
const B = require(path.join(dir, 'bindings.cjs'))(M);
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(dir, 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;
const { unprefill } = require(path.join(dir, '../../../scripts/lib/prefill.cjs'));
const html = unprefill(fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), Z);
const appSrc = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');

let n = 0, fails = 0;
const near = (a, b, tol) => Math.abs(a - b) <= tol;
function ok(name, cond) { n++; if (!cond) { fails++; console.error('FAIL ' + name); } }
function eq(name, got, want) { n++; if (got !== want) { fails++; console.error(`FAIL ${name}: got ${got}, want ${want}`); } }
function says(key, phrase) { n++; if (!Z[key] || !Z[key].includes(phrase)) { fails++; console.error(`FAIL prose ${key} should contain "${phrase}"`); } }
const slider = id => { const m = html.match(new RegExp(`id="${id}" min="([^"]+)" max="([^"]+)" step="([^"]+)" value="([^"]+)"`)); if (!m) throw new Error('no slider ' + id); return { min: +m[1], max: +m[2], step: +m[3], value: +m[4] }; };

/* ── data integrity ── */
eq('maddison years', D.maddison.us.length, 2022 - 1950 + 1);
eq('solar rows', D.solar.length, 51);
ok('solar years 1975–2025 consecutive', D.solar.every((r, i) => r[0] === 1975 + i));
ok('solar capacity increasing', D.solar.every((r, i) => i === 0 || r[2] > D.solar[i - 1][2]));
eq('kr 1950 raw', D.maddison.kr[0], 998); eq('ar 1950 raw', D.maddison.ar[0], 7949);

/* ── ch1 ── */
ok('rule70 vs ln2', near(M.doublingExact(1), Math.log(2) / Math.log(1.01), 1e-12));
eq('ch1 x7', B['ch1.x7'], String(Math.round(Math.pow(1.07, 70))));
eq('ch1 e10', B['ch1.e10'], (Math.log(2) / Math.log(1.1)).toFixed(1));
ok('ch1 kr50 independent', B['ch1.kr50'] === (100 * 998 / 15240).toFixed(1));
ok('ch1 kr cagr independent', B['ch1.krG'] === (100 * (Math.pow(41321 / 998, 1 / 72) - 1)).toFixed(1));
says('hero.sub', '八分之一'); ok('hero 1/8 is right', Math.round(7949 / 998) === 8);
ok('ch1 KR passes AR by 2022', M.mad('kr', 2022) > M.mad('ar', 2022));
eq('ch1 default g slider', slider('c1R').value, 2);

/* ── ch2 ── */
eq('ch2 double gain 1/3', B['ch2.dbl3'], (100 * (Math.cbrt(2) - 1)).toFixed(0));
ok('ch2 mpk numeric derivative', near(M.mpk(4, 1, 0.33), (M.output(4.0001, 1, 0.33) - M.output(3.9999, 1, 0.33)) / 0.0002, 1e-6));

/* ── ch3: closed form vs simulation ── */
{
  const o = { s: 25, n: 1, d: 5, a: 1 / 3, A: 1, g: 0 };
  ['c3S', 'c3N', 'c3D', 'c3T'].forEach((id, i) => eq('ch3 slider default ' + id, slider(id).value, [25, 1, 5, 1][i]));
  ok('ch3 alpha default ≈ 1/3', near(slider('c3A').value, 1 / 3, 0.005));
  const st = M.steady(o);
  // discrete map fixed point: s·k^α = ((1+n) − 1 + δ)k with n=1%, δ=5%
  ok('ch3 k* closed form', near(st.k, Math.pow(0.25 / 0.06, 1.5), 1e-9));
  const p = M.solowPath(o, 2000, 1);
  ok('ch3 path converges to k*', near(p[2000].k, st.k, 1e-6));
  eq('ch3 k* prose', B['ch3.k'], '8.5'); says('ch3.p3', '稳态人均资本是 8.5');
  ok('ch3 golden rule: c* max at s = α', (() => { const c = s => M.steady(Object.assign({}, o, { s })).c; return c(33.3) > c(30) && c(33.3) > c(37); })());
  eq('ch3 half-life', B['ch3.hl'], (Math.log(2) / ((2 / 3) * 0.06)).toFixed(0));
}

/* ── ch4 ── */
{
  const o = { s: 25, n: 1, d: 5, a: 1 / 3, A: 1, g: 1.5 };
  const cv = M.convergence(o, 0.1, 60);
  ok('ch4 rich stays at g', cv.rich.slice(1).every(r => near(r.gy, 1.5, 1e-9)));
  ok('ch4 poor growth falls monotonically', cv.poor.slice(2).every((r, i) => r.gy < cv.poor[i + 1].gy));
  ok('ch4 poor → g', near(M.convergence(o, 0.1, 400).poor[400].gy, 1.5, 1e-3));
  const sh = M.savingsShock({ s: 20, n: 1, d: 5, a: 1 / 3, A: 1, g: 1.5 }, 30, 10, 80);
  ok('ch4 level gain = (30/20)^(α/(1−α)) − 1', near(sh.levelGain, Math.pow(1.5, 0.5) - 1, 1e-12));
  eq('ch4 lvl prose', B['ch4.lvl'], '22');
  ok('ch4 long-run growth back to g', near(M.savingsShock({ s: 20, n: 1, d: 5, a: 1 / 3, A: 1, g: 1.5 }, 30, 10, 400).p[400].gy, 1.5, 1e-3));
  eq('ch4 defaults', `${slider('c4F').value}/${slider('c4G').value}/${slider('c4S').value}`, '10/1.5/30');
}

/* ── ch5: residual identity, China numbers ── */
{
  for (const c of ['CN', 'KR', 'JP']) for (const r of D.pwt[c]) {
    const d = M.decompose(r, null, true);
    ok(`ch5 identity ${c} ${r.p}`, near(d.cap + d.lab + d.hc + d.tfp, r.gy, 1e-12));
    ok(`ch5 residual matches script ${c} ${r.p}`, near(d.tfp, r.tfp, 0.011));
  }
  const cn3 = D.pwt.CN[2]; eq('ch5 cn 2000–2010 period', cn3.p.join('-'), '2000-2010');
  eq('ch5 cn3 tfp', B['ch5.cn3tfp'], '4.4'); eq('ch5 cn5 tfp', B['ch5.cn5tfp'], '1.4');
  ok('ch5 cn labour negative after 2010', M.decompose(D.pwt.CN[3], null, true).lab < 0 && M.decompose(D.pwt.CN[4], null, true).lab < 0);
  ok('ch5 KR 2010–23 sign differs from PWT (prose says so)', M.decompose(D.pwt.KR[3], null, true).tfp < 0 && D.pwt.KR[3].pwtTfp > 0);
}

/* ── ch6 ── */
{
  const o = { nR: 0, lam: 0.75, phi: 0.5 };
  eq('ch6 nR default 0', slider('c6N').value, 0);
  const p = M.ideasPath(o, 200);
  ok('ch6 starts at 2%', near(p[0].gA, 2, 1e-12));
  ok('ch6 decays with constant R', p[200].gA < p[100].gA && p[100].gA < p[0].gA);
  // with nR > 0 growth converges to λ nR /(1 − φ)
  ok('ch6 converges to long run', near(M.ideasPath({ nR: 1, lam: 0.75, phi: 0.5 }, 5000)[5000].gA, 1.5, 0.02));
  eq('ch6 lr3', B['ch6.lr3'], '4.5'); eq('ch6 R3', B['ch6.R3'], Math.pow(1.03, 100).toFixed(0));
}

/* ── ch7: independent least squares on the raw data ── */
{
  function fit(y0, y1) {
    const pts = D.solar.filter(r => r[0] >= y0 && r[0] <= y1);
    const X = pts.map(r => Math.log(r[2])), Y = pts.map(r => Math.log(r[1])), k = X.length;
    const mx = X.reduce((a, b) => a + b) / k, my = Y.reduce((a, b) => a + b) / k;
    let sxy = 0, sxx = 0; for (let i = 0; i < k; i++) { sxy += (X[i] - mx) * (Y[i] - my); sxx += (X[i] - mx) ** 2; }
    return 1 - Math.pow(2, sxy / sxx);  // slope is base-independent
  }
  eq('ch7 LR 1975–2025', B['ch7.lrAll'], (100 * fit(1975, 2025)).toFixed(0));
  eq('ch7 LR 1975–2003', B['ch7.lr1'], (100 * fit(1975, 2003)).toFixed(0));
  eq('ch7 LR 2010–2025', B['ch7.lr3'], (100 * fit(2010, 2025)).toFixed(0));
  eq('ch7 values', `${B['ch7.lrAll']}/${B['ch7.lr1']}/${B['ch7.lr3']}`, '24/23/38');
  ok('ch7 price drop ~1100', near(132.3757 / 0.12021687, 1101, 1));
  eq('ch7 defaults', `${slider('c7A').value}/${slider('c7B').value}`, '1975/2025');
  says('ch7.p3', '51 年'); eq('ch7 51 points', M.wrightFit(1975, 2025).n, 51);
}

/* ── ch8 ── */
eq('ch8 cn22', B['ch8.cn22'], (100 * 19238 / 58487).toFixed(0));
ok('ch8 BR flat', B['ch8.br78'] === B['ch8.br22']);

/* ── ch9: Acemoglu's own arithmetic ── */
{
  const h = M.hulten(M.ACEMOGLU);
  ok('ch9 0.20×0.23 = 4.6%', near(h.impacted, 4.6, 1e-9));
  ok('ch9 0.27×0.535 = 14.4%', near(h.save, 14.445, 1e-9));
  eq('ch9 TFP 0.66', B['ch9.tfp'], '0.66');
  // paper: 0.033×0.144 + (0.046 − 0.033)×0.037 ≈ 0.0053
  ok('ch9 hard-task 0.53', near(M.hulten(Object.assign({}, M.ACEMOGLU, { hard: true })).tfp, 0.53, 0.005) && near(0.033 * 0.144 + 0.013 * 0.037, 0.0053, 0.0001));
  ok('ch9 annual ≈ 0.064–0.066', near(h.perYear, 0.0662, 0.001));
  ok('ch9 Solow GDP inside Acemoglu range', h.gdp >= 0.93 && h.gdp <= 1.16);
  eq('ch9 slider defaults = paper', `${slider('c9E').value}/${slider('c9P').value}/${slider('c9L').value}/${slider('c9S').value}`, '20/23/27/0.535');
}

/* ── ch10 ── */
{
  const j = M.jcurve({ i: 6, pay: 15, ramp: 5 }, 30);
  ok('ch10 dips below 100', j.low < 100); ok('ch10 recovers', j.cross != null && j.cross > j.lowT);
  ok('ch10 long-run measured = (1 − i)(1 + pay)', near(M.jcurve({ i: 6, pay: 15, ramp: 5 }, 400).endMeasured, 100 * 0.94 * 1.15, 0.01));
  eq('ch10 defaults', `${slider('c10I').value}/${slider('c10P').value}/${slider('c10R').value}`, '6/15/5');
  ok('ch10 no investment, no dip', M.jcurve({ i: 0, pay: 15, ramp: 5 }, 30).low === 100);
}

/* ── ch11 ── */
{
  const E = M.estimatesOnBasis(1 / 3, true), g = id => E.find(e => e.id === id);
  ok('ch11 Acemoglu per year ≈ 0.066 TFP → ≈0.099 LP', near(g('acemoglu').hi, 100 * (Math.pow(1.0066, 0.1) - 1) * 1.5, 1e-9));
  ok('ch11 Anthropic/Acemoglu ≈ 18', Math.round(g('anthropic').lo / g('acemoglu').hi) === 18);
  const R = M.estimatesOnBasis(1 / 3, false);
  ok('ch11 unconverted Aghion is as reported', R.find(e => e.id === 'aghion').hi === 1.24);
}

/* ── copy hygiene ── */
ok('no CJK in models.js', !/[㐀-鿿]/.test(fs.readFileSync(path.join(dir, 'models.js'), 'utf8')));
ok('no CJK in app.js', !/[㐀-鿿]/.test(appSrc));
ok('no CJK in data.js', !/[㐀-鿿]/.test(fs.readFileSync(path.join(dir, 'data.js'), 'utf8')));
ok('no CJK in index.html after unprefill (except toggle)', !/[㐀-鿿]/.test(html.replace(/<head>[\s\S]*?<\/head>/, '').replace(/>中</g, '><')));
for (const m of appSrc.matchAll(/[^\w.]t\('([a-z0-9.]+)'/gi)) if (!m[1].endsWith('.')) ok('key exists ' + m[1], Z[m[1]] != null);
const DK = JSON.parse(fs.readFileSync(path.join(dir, 'page.json'), 'utf8')).dynamicKeys;
for (const [pre, vals] of Object.entries(DK)) for (const v of vals) ok(`dynamic key ${pre}.${v}`, Z[`${pre}.${v}`] != null);
for (const f of fs.readdirSync(path.join(dir, 'figures'))) {
  const s = fs.readFileSync(path.join(dir, 'figures', f), 'utf8');
  for (const m of s.matchAll(/id="(c\d+[A-Za-z0-9]*)"/g)) ok(`app wires #${m[1]}`, appSrc.includes(`'${m[1]}'`) || appSrc.includes(`#${m[1]}`) || appSrc.includes(`'${m[1].replace(/o$/, '')}'`) || /Say$|Leg$|^c5P$/.test(m[1]) || /Cv\d?$/.test(m[1]));
}

console.log(`${n - fails}/${n} checks passed`);
if (fails) process.exit(1);
