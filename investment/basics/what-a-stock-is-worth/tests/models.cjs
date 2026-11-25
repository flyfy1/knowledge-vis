'use strict';
// Pins the page's models against brute force and closed forms, then every number the prose binds ({=…}), the literal
// numbers in the prose, copy keys used by app.js, and language hygiene.
// Seeded simulations: when a statistical check is tight, raise the number of paths, never the tolerance.
// Run: node investment/basics/what-a-stock-is-worth/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const M = require(path.join(DIR, 'models.js'));
const Bd = require(path.join(DIR, 'bindings.cjs'))(M);
const { unprefill } = require(path.join(DIR, '../../../scripts/lib/prefill.cjs'));
const load = l => { const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, `copy.${l}.js`), 'utf8'), ctx); return ctx.window.ESSAY_COPY[l]; };
const Z = load('zh');
const html = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(DIR, 'app.js'), 'utf8');
const mjs = fs.readFileSync(path.join(DIR, 'models.js'), 'utf8');
const md = fs.readFileSync(path.join(DIR, 'content.zh.md'), 'utf8');
const X = M.FRONTIER;

let n = 0, fails = 0;
function check(name, got, want) { n++; if (got !== want) { fails++; console.error(`FAIL ${name}: got ${got}, expected ${want}`); } }
function ok(name, cond, info) { n++; if (!cond) { fails++; console.error(`FAIL ${name}${info != null ? ': ' + info : ''}`); } }
const near = (name, got, want, tol) => ok(name, Math.abs(got - want) <= tol, `got ${got}, expected ${want} ± ${tol}`);
const P = (x, d) => M.fmt(x * 100, d || 0) + '%';

/* ── normal CDF ── */
{
  const simpson = (a, b, m) => { let s = 0; const h = (b - a) / m; for (let i = 0; i <= m; i++) { const x = a + i * h; s += (i === 0 || i === m ? 1 : i % 2 ? 4 : 2) * Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI); } return s * h / 3; };
  for (const x of [-3, -1.2, 0, 0.2, 0.8165, 1.96, 3]) near('cdf(' + x + ')', M.cdf(x), simpson(-12, x, 20000), 2e-7);
}

/* ── ch2: strip, by brute force ── */
{
  let s = 0, term = 4 / 1.08; for (let k = 1; k <= 20000; k++) { s += term; term *= 1.04 / 1.08; }
  near('sum of the strip = D1/(r−g)', s, 100, 1e-6);
  const rows = M.strip(4, 0.08, 0.04, 10);
  near('first 10 years by sum', rows[9].cum / 100, M.shareFirst(0.08, 0.04, 10), 1e-12);
  let cum = 0, k = 0; while (cum < 50) { k++; cum += 4 * Math.pow(1.04, k - 1) / Math.pow(1.08, k); }
  check('half the value is in by year (rounded)', k, Math.ceil(M.halfYear(0.08, 0.04)));
  check('ch2.P', Bd['ch2.P'], '100'); check('ch2.s10', Bd['ch2.s10'], '31%'); check('ch2.s30', Bd['ch2.s30'], '68%'); check('ch2.half', Bd['ch2.half'], '18');
  ok('r ≤ g has no price', M.gordon(4, 0.05, 0.05) === Infinity && M.shareFirst(0.04, 0.05, 10) === 0);
  near('100 ÷ 1.08² (prose)', 100 / 1.08 / 1.08, 85.7, 0.05); ok('prose: 85.7', md.includes('≈ 85.7'));
}

/* ── ch3: Gordon and its sensitivity ── */
{
  check('ch3.P', Bd['ch3.P'], '100'); check('ch3.p1', Bd['ch3.p1'], '80'); check('ch3.chg', Bd['ch3.chg'], '20%');
  check('ch3.P6', Bd['ch3.P6'], '200'); check('ch3.chg6', Bd['ch3.chg6'], '33%'); check('ch3.P7', Bd['ch3.P7'], '400'); check('ch3.chg7', Bd['ch3.chg7'], '50%');
  check('ch3.chg2', Bd['ch3.chg2'], '14%'); check('ch3.dur', Bd['ch3.dur'], '25');
  // duration = −d ln P / dr, numerically
  const h = 1e-6, d = -(Math.log(M.gordon(4, 0.08 + h, 0.04)) - Math.log(M.gordon(4, 0.08 - h, 0.04))) / (2 * h);
  near('duration = 1/(r−g)', d, 25, 1e-4);
}

/* ── ch4: P/E ── */
{
  for (const [pe, r, roe] of [[20, 0.08, 0.15], [40, 0.08, 0.15], [15, 0.1, 0.2], [30, 0.07, 0.12]]) {
    const g = M.impliedG(pe, r, roe);
    near(`impliedG round trip (${pe}, ${r}, ${roe})`, M.peFrom(r, g, roe), pe, 1e-9);
  }
  near('ROE = r → P/E = 1/r for any g', M.peFrom(0.08, 0.05, 0.08), 12.5, 1e-9);
  near('ROE = r → P/E = 1/r (g = 0)', M.peFrom(0.08, 0, 0.08), 12.5, 1e-9);
  // two stages by explicit discounting: no payout for N years, then price = pm × E_{N+1}
  const pm = M.peFrom(0.08, 0.03, 0.15), N = M.yearsOfGrowth(40, 0.08, 0.2, pm);
  near('two-stage price recovers P/E 40', pm * Math.pow(1.2, N) / Math.pow(1.08, N), 40, 1e-9);
  near('mature P/E = (1−3/15)/(8−3)%', pm, 16, 1e-12);
  check('ch4.ey40', Bd['ch4.ey40'], '2.5%'); check('ch4.g20', Bd['ch4.g20'], '4.5%'); check('ch4.g40', Bd['ch4.g40'], '6.6%');
  check('ch4.pm', Bd['ch4.pm'], '16'); check('ch4.N', Bd['ch4.N'], '8.7'); check('ch4.N15', Bd['ch4.N15'], '14.6');
  ok('prose: "九年左右" fits N', Math.round(N) === 9 && md.includes('九年左右'));
  check('P/E at or below mature needs no fast growth', M.yearsOfGrowth(15, 0.08, 0.2, pm), 0);
  check('growth not above r never catches up', M.yearsOfGrowth(40, 0.08, 0.08, pm), Infinity);
}

/* ── ch5: CAPE ── */
{
  const c0 = M.capeCycle(0);
  near('no recessions: trailing P/E = pe0', c0.trailR.hi, 17, 1e-9); ok('prose: 17 倍', md.includes('在 17 倍到'));
  // CAPE without recessions: P / mean of last 10 trend earnings = 17·1.015^9 / mean(1.015^0..9)
  let s = 0; for (let k = 0; k < 10; k++) s += Math.pow(1.015, k);
  near('no recessions: CAPE', c0.capeR.lo, 17 * Math.pow(1.015, 9) / (s / 10), 1e-9);
  const c = M.capeCycle(0.5);
  near('trough trailing P/E = 17(1−0.2)/(1−0.5)', c.trailR.hi, 27.2, 1e-9);
  check('ch5.trHi', Bd['ch5.trHi'], '27.2'); check('ch5.capeLo', Bd['ch5.capeLo'], '15.3'); check('ch5.capeHi', Bd['ch5.capeHi'], '20.2');
  ok('CAPE range narrower than trailing', c.capeR.hi - c.capeR.lo < c.trailR.hi - c.trailR.lo);
  near('prose: 1/40 = 2.5%', 1 / 40, 0.025, 1e-12); ok('prose: 2.5%', md.includes('这个数是 2.5%'));
}

/* ── ch6: implied ERP ── */
{
  // brute force: discount explicitly for 400 years
  const brute = (r, y, g1, g2) => { let v = 0, c = y; for (let k = 1; k <= 3000; k++) { v += c / Math.pow(1 + r, k); c *= k < 5 ? 1 + g1 : 1 + g2; } return v; };
  near('erpValue = brute force', M.erpValue(0.09, 0.035, 0.08, 0.0494), brute(0.09, 0.035, 0.08, 0.0494), 1e-6);
  const o = M.impliedERP(1, 0.035, 0.08, 0.0494);
  near('implied r reprices the index', M.erpValue(o.r, 0.035, 0.08, 0.0494), 1, 1e-9);
  check('ch6.erp', Bd['ch6.erp'], '3.89%'); check('ch6.erpDown', Bd['ch6.erpDown'], '4.85%'); check('ch6.erpUp', Bd['ch6.erpUp'], '3.25%');
  ok('higher price, lower premium', M.impliedERP(1.2, 0.035, 0.08, 0.0494).erp < o.erp);
  ok('prose states the default inputs', md.includes('现金收益率 3.5%、未来 5 年增长 8%、无风险利率 4.94%'));
}

/* ── ch7: CAPM ── */
{
  check('ch7.power', Bd['ch7.power'], '7.06%'); check('ch7.semi', Bd['ch7.semi'], '11.64%');
  check('ch7.se', Bd['ch7.se'], '0.23'); check('ch7.lo', Bd['ch7.lo'], '0.83'); check('ch7.hi', Bd['ch7.hi'], '1.73');
  // the slope's spread across seeds matches the theoretical standard error
  const bs = []; for (let s = 1; s <= 3000; s++) bs.push(M.betaFit(1.28, 0.08, 60, s).b);
  const m = bs.reduce((a, b) => a + b, 0) / bs.length, sd = Math.sqrt(bs.reduce((a, b) => a + (b - m) * (b - m), 0) / (bs.length - 1));
  near('β estimates centred on the truth', m, 1.28, 0.015); near('β spread ≈ σε/(σm√n)', sd, 0.2295, 0.015);
  const betas = { power: 0.48, food: 0.61, drugs: 0.98, software: 1.28, auto: 1.46, semi: 1.52 };
  for (const i of M.INDUSTRIES) check('Damodaran β ' + i.id, i.beta, betas[i.id]);
  ok('prose quotes the betas', md.includes('β 0.48') && md.includes('β 1.52') && md.includes('真实的 β 是 1.28'));
}

/* ── ch8: excess volatility ── */
{
  const r = M.excessVol(M.EXV.rho);
  ok('rational belief: price less volatile than P*', r.ratio < 1);
  // the rational price equals the expected P*, checked by Monte Carlo from one state
  const o = M.EXV, q = (1 + o.g) / (1 + o.r), x0 = 0.1;
  const rat = q / (1 - q) + x0 * q * o.rho / (1 - q * o.rho);
  const z = M.gaussian(M.rng(5)); let s = 0; const NP = 4000;
  for (let p = 0; p < NP; p++) { let x = x0, v = 0, disc = 1; for (let k = 1; k <= 400; k++) { x = o.rho * x + o.sigma * z(); disc *= q; v += disc * (1 + x); } s += v; }
  near('rational price = E[P*]', s / NP, rat, 0.05);
  check('ch8.ratioR', Bd['ch8.ratioR'], '0.19'); check('ch8.ratio95', Bd['ch8.ratio95'], '1.33'); check('ch8.cross', Bd['ch8.cross'], '0.92');
  ok('ratio rises with believed persistence', M.excessVol(0.8).ratio < M.excessVol(0.9).ratio && M.excessVol(0.9).ratio < M.excessVol(0.99).ratio);
}

/* ── ch9: funds ── */
{
  // closed form against the seeded simulation without closures
  const D = { fee: 0.01, skill: 0.005, te: 0.05 }, sim = M.funds(Object.assign({ T: 20, n: 20000, seed: 9, close: false, cut: 0.05 }, D));
  for (const T of [1, 5, 10, 20]) near(`trail share at ${T} y: simulation = closed form`, sim.trailAt[T - 1], M.trailShare(D.fee, D.skill, D.te, T), 0.012);
  near('no fee: half trail', M.trailShare(0, 0.005, 0.05, 20), 0.5, 1e-7);
  const mean = sim.a.reduce((a, b) => a + b, 0) / sim.a.length; near('skill is mean-zero before costs (Sharpe)', mean, 0, 0.0002);
  check('ch9.cf1', Bd['ch9.cf1'], '58%'); check('ch9.cf20', Bd['ch9.cf20'], '79%'); check('ch9.cf20b', Bd['ch9.cf20b'], '89%');
  check('ch9.alive', Bd['ch9.alive'], '34%'); check('ch9.sim20', Bd['ch9.sim20'], '87%'); check('ch9.surv', Bd['ch9.surv'], '61%');
  const c = M.funds(Object.assign({ T: 20, n: 2000, seed: 7, close: true, cut: 0.05 }, D));
  ok('closures raise the share counted as trailing', c.trailAt[19] > M.funds(Object.assign({ T: 20, n: 2000, seed: 7, close: false, cut: 0.05 }, D)).trailAt[19]);
  ok('survivors look better', c.trailSurv[19] < c.trailAt[19]);
  ok('prose states the defaults', md.includes('每年费用和交易成本 1%、本事的标准差 0.5 个点、每年运气 5 个点'));
  ok('model below SPIVA at 20 years (prose says so)', c.trailAt[19] < X.spiva.large[5] / 100);
}

/* ── ch10: bubble ── */
{
  check('ch10.grow', Bd['ch10.grow'], '20%'); check('ch10.life', Bd['ch10.life'], '10');
  // expected one-year gross return of the bubble = 1 + r
  const u = M.rng(17); let s = 0; const NP = 200000; for (let i = 0; i < NP; i++) s += u() < 0.9 ? 1.08 / 0.9 : 0;
  near('bubble expected return = r', s / NP, 1.08, 0.006);
  const p = M.bubblePath({ seed: 3, F: 100, B0: 20, r: 0.08, pi: 0.9, years: 40 });
  ok('bubble path: zero after the burst', p.burst < 0 || p.path.slice(p.burst).every(q => q.B === 0));
}

/* ── frontier figures and literal amounts ── */
{
  const S = X.spiva;
  check('SPIVA large-cap row', S.large.join(','), '78.78,66.84,88.96,85.59,89.93,92.89');
  check('f.spiva20', Bd['f.spiva20'], '92.89%'); check('f.spivaSurv', Bd['f.spivaSurv'], '34.61%'); check('f.spivaN', Bd['f.spivaN'], '760');
  check('f.erpNov', Bd['f.erpNov'], '4.41%'); check('f.tbond', Bd['f.tbond'], '4.94%'); check('f.top10', Bd['f.top10'], '40.7%');
  check('f.nqDrop', Bd['f.nqDrop'], '78%'); check('f.capeEy', Bd['f.capeEy'], '2.5%');
  ok('prose: capex 7,000 亿', md.includes('7,000 亿美元') && X.capex.y26 === 700);
  ok('prose: FCF 2,000 / 2,370 亿', md.includes('2,000 亿美元，2024 年是 2,370 亿美元') && X.capex.fcf25 === 200 && X.capex.fcf24 === 237);
  ok('prose: Bain 2 万亿 / 8,000 亿', md.includes('约 2 万亿美元') && md.includes('约 8,000 亿美元') && X.bain.need === 2 && X.bain.gap === 800);
  ok('prose: 97 signals', md.includes('97 个'));
}

/* ── copy keys used by app.js exist; language hygiene ── */
{
  const keys = new Set(); for (const m of app.matchAll(/\bt\('([\w.]+)'/g)) if (!m[1].endsWith('.')) keys.add(m[1]);
  for (const m of app.matchAll(/'((?:ch\d+|ch7\.b)\.say\.\w+)'/g)) keys.add(m[1]);
  for (const k of keys) ok('copy key ' + k, Z[k] != null, 'missing');
  for (const id of M.INDUSTRIES.map(i => i.id)) ok('industry key ' + id, Z['ch7.ind.' + id] != null);
  const cjk = /[㐀-鿿＀-￯]/;
  const bare = unprefill(html, Z).replace(/<!--[\s\S]*?-->/g, '').replace(/<title>[^<]*<\/title>/, '').replace(/<meta name="description" content="[^"]*">/, '').replace(/<button type="button" data-lang="zh"[^>]*>中<\/button>/, '');
  const stripped = bare.replace(/<div class="provenance[\s\S]*?<\/div>/g, '');
  ok('no Chinese in index.html outside the copy', !cjk.test(stripped), (stripped.match(/.{30}[㐀-鿿].{30}/) || [''])[0]);
  ok('no Chinese in app.js', !cjk.test(app.replace(/\/\*[\s\S]*?\*\//g, '')));
  ok('no Chinese in models.js', !cjk.test(mjs.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')));
}

console.log(`${n - fails}/${n} checks passed`);
if (fails) process.exit(1);
