'use strict';
// Unit tests: models, every bound prose number, literal numbers in the copy, copy parity, language hygiene.
// Run: node economics/public-finance/can-a-country-go-bankrupt/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const M = require(path.join(DIR, 'models.js'));
const B = require(path.join(DIR, 'bindings.cjs'))(M);
const load = l => { const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, `copy.${l}.js`), 'utf8'), ctx); return ctx.window.ESSAY_COPY[l]; };
const Z = load('zh'), E = load('en');
let n = 0, fails = 0;
const check = (name, got, want) => { n++; if (got !== want) { fails++; console.error(`FAIL ${name}: got ${got}, expected ${want}`); } };
const ok = (name, cond, info) => { n++; if (!cond) { fails++; console.error(`FAIL ${name}${info ? ': ' + info : ''}`); } };
const near = (name, got, want, tol) => { n++; if (!(Math.abs(got - want) <= tol)) { fails++; console.error(`FAIL ${name}: got ${got}, expected ${want} ± ${tol}`); } };

/* ch3: debt dynamics, re-derived by hand */
{
  // r = g: d grows by the primary deficit each year: 100 + 3·30 = 190 (same as why-one-rate-moves-everything#ch11)
  near('r=g d30', M.debtPath({ d0: 100, r: 4, g: 4, pb: -3, years: 30 })[30], 190, 1e-9);
  // closed form for constant r, g: d_t = a^t d0 − pb (1 − a^t)/(1 − a), a = (1+r)/(1+g)
  const a = 1.02 / 1.04, cf = t => Math.pow(a, t) * 100 + 3 * (1 - Math.pow(a, t)) / (1 - a);
  near('default d30 closed form', M.debtPath(M.CH3_DEFAULT)[30], cf(30), 1e-9);
  near('steady state 3·1.04/0.02', M.steadyState(2, 4, -3), 156, 1e-9);
  near('pb* = d(r−g)/(1+g)', M.stabilizingPb(100, 2, 4), -200 / 104, 1e-12);
  check('steady state none when r>g', M.steadyState(5, 4, -3), null);
  check('cls conv/explode', [M.debtSummary(M.CH3_DEFAULT).cls, M.debtSummary({ d0: 100, r: 5, g: 4, pb: -3 }).cls].join(), 'conv,explode');
  // fixed point really is fixed
  near('fixed point', M.debtStep(156, 2, 4, -3), 156, 1e-9);
}
/* ch4: currency toy */
{
  const c0 = M.currencyToy({ d0: 80, fxShare: 0, stop: 30, buffer: 15 });
  check('own currency: no default', c0.defaultYear, null);
  // money base 15 + 4.8 per year for 10 years = 63 → P = 63/15 = 4.2
  near('own currency P10 = 4.2', c0.last.P, 4.2, 1e-9);
  near('own currency ratio = 80/4.2', c0.last.ratio, 80 / 4.2, 1e-9);
  // all FX: 4.8 per year from a buffer of 15 → year 4
  check('all FX default year', M.currencyToy({ d0: 80, fxShare: 100, stop: 30, buffer: 15 }).defaultYear, 4);
  // half: 2.4 per year → year 7
  check('half FX default year', M.currencyToy({ d0: 80, fxShare: 50, stop: 30, buffer: 15 }).defaultYear, 7);
  check('no backstop behaves like FX', M.currencyToy({ d0: 80, fxShare: 0, stop: 30, buffer: 15, backstop: false }).defaultYear, 4);
}
/* ch5: haircut */
{
  const h = M.haircut(M.CH5_DEFAULT);
  near('new face 31.5', h.newFace, 31.5, 1e-9);
  const pv = 0.945 * (1 - Math.pow(1.15, -20)) / 0.15 + 31.5 * Math.pow(1.15, -20);
  near('new bond PV', h.vNew, pv, 1e-9);
  near('value per 100', h.value, 15 + pv, 1e-9);
  ok('market loss within 5 pts of RBA ~75%', Math.abs(h.market * 100 - 75) < 5);
  ok('SZ haircut inside ZTG 58–65%', h.sz * 100 >= 58 && h.sz * 100 <= 65, h.sz);
}
/* ch6–7: PAYG */
{
  const p = M.paygAt({ year: 2025, ret: 60, repl: 45 });
  near('tau = repl × dep', p.tau, 45 * p.dep, 1e-9);
  ok('later retirement lowers tau', M.paygAt({ year: 2050, ret: 63, repl: 45 }).tau < M.paygAt({ year: 2050, ret: 60, repl: 45 }).tau);
  check('gradual age 2025/2030/2040', [M.gradualAge(2025), M.gradualAge(2030), M.gradualAge(2040)].join(), '60,61,63');
}
/* ch8: multiplier */
{
  const k = M.multiplier(M.CH8_DEFAULT);
  near('a = 0.8·0.7 − 0.1', k.a, 0.46, 1e-12);
  near('k = 1/(1−a)', k.closed, 1 / 0.54, 1e-12);
  near('rounds converge to closed form', M.multiplier(Object.assign({}, M.CH8_DEFAULT, { rounds: 80 })).rounds[79].cum, 1 / 0.54, 1e-9);
  near('break-even k = 1/(t+d)', M.breakEvenK(0.3, 100), 1 / 1.3, 1e-12);
  // at the break-even multiplier the ratio is unchanged
  near('ratio unchanged at break-even', (100 + 1 - 0.3 / 1.3) / (100 + 1 / 1.3) * 100, 100, 1e-9);
}
/* every bound number, as it reads on the page */
const want = {
  'f.usTotal': '40.73', 'f.usPublic': '32.90', 'f.rec': '5.40', 'f.out': '7.40', 'f.def': '1.99', 'f.int': '1.05', 'f.prim': '0.94', 'f.intPer100': '19',
  'f.def2': '0.97', 'f.int25': '0.97', 'f.def25': '0.92', 'f.usAvg': '3.57', 'f.usForeign': '9.24', 'f.usForeignPct': '29', 'f.usJapan': '1.06', 'f.usUK': '0.99', 'f.usChina': '0.56',
  'f.jgbTotal': '1,006.5', 'f.jgbBojPct': '46.7', 'f.jgbForeignPct': '7.9', 'f.jgbTbForeignPct': '13.1',
  'f.grCut': '53.5', 'f.grEfsf': '15', 'f.grNew': '31.5', 'f.grNpv': '75', 'f.grZtgLow': '58', 'f.grZtgHigh': '65',
  'f.cnEmp': '16', 'f.cnInd': '8', 'f.cn60': '23.0', 'f.cn65': '15.9', 'f.rameyLow': '0.6', 'f.rameyHigh': '1',
  'f.jpGross': '207', 'f.jpPeak': '229', 'f.jpNetN': '186', 'f.jpNetB': '137', 'f.jpR': '0.7', 'f.jpG': '4.5',
  'f.cnH23': '14.3', 'f.cnSwap': '6', 'f.cnSpecial': '4', 'f.cnTotal': '102.5', 'f.cnCentral': '41.2', 'f.cnLocal': '54.8', 'f.cnHidden': '6.5', 'f.cnRatio': '73.2',
  'f.cnImf25': '126.6', 'f.cnImf30': '153.7', 'f.usD': '97.4', 'f.usR': '4.04', 'f.usG': '6.31', 'f.cboPd': '2.6', 'f.cbo26': '101', 'f.cbo36': '120',
  'ch3.d30': '125', 'ch3.ss': '156', 'ch3.d30r5': '237', 'ch3.d30eq': '190', 'ch3.stab': '−1.92', 'ch3.stabAbs': '1.92',
  'ch4.infl0': '320', 'ch4.avg0': '15', 'ch4.ratio0': '19', 'ch4.def100': '4', 'ch4.def50': '7', 'ch4.defEuro': '4',
  'ch5.value': '22.8', 'ch5.market': '77', 'ch5.sz': '62', 'ch5.m5': '61',
  'ch6.t2025': '20.7', 'ch6.t2050': '36.3', 'ch6.t2050r63': '27.6', 'ch6.t2050r65': '23.0', 'ch6.le': '74',
  'ch7.n2025': '20.7', 'ch7.n2050': '36.3', 'ch7.g2050': '27.6', 'ch7.share': '56',
  'ch8.a': '0.46', 'ch8.k': '1.85', 'ch8.tax': '0.56', 'ch8.debt': '0.44', 'ch8.ratio': '98.6', 'ch8.be': '0.77', 'ch8.k50': '0.93', 'ch8.dr50': '−0.2',
  'ch9.usStab': '−2.1', 'ch9.usStabAbs': '2.1', 'ch9.usD30': '109', 'ch9.usPer1': '0.92', 'ch9.jpStab': '−7.5', 'ch9.jpStabAbs': '7.5', 'ch9.jpStabPlus1': '2.0'
};
for (const k in want) check('binding ' + k, B[k], want[k]);
for (const k in B) ok('binding pinned: ' + k, k in want);
/* facts against the dated FRONTIER block (sources in BRIEF.md) */
{
  const F = M.FRONTIER, U = F.usFY2026;
  ok('US interest > defence FY2026', U.netInterest > U.defense);
  near('US deficit', U.outlays - U.receipts, 1992.5, 0.1);
  near('JGB other domestic 45.4%', 100 - F.jgbBojPct - F.jgbForeignPct, 45.4, 1e-9);
  near('China legal = central + local', F.cnCentral2025 + F.cnLocal2025, 96.0, 1e-9);
}
/* literal numbers in the copy that are not bindings */
{
  ok('Greek totals literal', /3,560 亿欧元/.test(Z['ch5.p2']) && /2,060 亿欧元/.test(Z['ch5.p2']));
  const a = 0.46; let v = 100, s = 0; for (let i = 0; i < 60; i++) { s += v; v *= a; }
  ok('dg.rounds sum 185', Z['dg.rounds.sum'].includes(String(Math.round(s))), s);
  ok('dg.rounds caption 46', Z['dg.rounds.cap'].includes('46'));
}
/* copy parity and hygiene */
{
  const kz = Object.keys(Z).sort(), ke = Object.keys(E).sort();
  check('same key set', kz.join('|'), ke.join('|'));
  for (const f of ['app.js', 'models.js', 'bindings.cjs']) ok(f + ' has no CJK', !/[㐀-鿿]/.test(fs.readFileSync(path.join(DIR, f), 'utf8')));
  const R = JSON.parse(fs.readFileSync(path.join(DIR, 'REGISTRY.json'), 'utf8'));
  check('registry title', R.title.zh, Z['hero.title']);
  ok('no ch3 concept (owned by why-one-rate-moves-everything#ch11)', !R.concepts.some(c => c.anchor === '#ch3'));
}
console.log(`${n - fails}/${n} checks passed`);
if (fails) process.exit(1);
