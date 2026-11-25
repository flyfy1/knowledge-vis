'use strict';
// Pins the page's models against independent derivations and the prose against the models.
//   elasticity: closed form; incidence: equilibrium residual, the exact log share, small-country limit, DWL by numerical
//   integration; ledger: areas against a brute-force surplus integral, net = ToT − DWL, optimal tariff against a grid
//   search and against the linear closed form; Ricardo: market clearing and the equal-cost case; S − I = CA identity and
//   the IMF coefficient; CES diversion: shares and price index by direct computation; retaliation payoffs; chokepoint:
//   market clearing residual; pass-through: estimators on the seeded panel. Then every {=binding} the prose uses, the
//   literal numbers in the prose, the frontier figures, diagram literals, dynamic keys and language hygiene.
// Run: node economics/trade/who-pays-a-tariff/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const M = require(path.join(DIR, 'models.js'));
const Bd = require(path.join(DIR, 'bindings.cjs'))(M);
const load = l => { const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, `copy.${l}.js`), 'utf8'), ctx); return ctx.window.ESSAY_COPY[l]; };
const Z = load('zh');
const md = fs.readFileSync(path.join(DIR, 'content.zh.md'), 'utf8');
const app = fs.readFileSync(path.join(DIR, 'app.js'), 'utf8');
const models = fs.readFileSync(path.join(DIR, 'models.js'), 'utf8');
const f = (x, d) => M.fmt(x, d, 'en');
let n = 0, fails = 0;
function check(name, got, want) { n++; if (got !== want) { fails++; console.error(`FAIL ${name}: got ${got}, expected ${want}`); } }
function ok(name, cond, info) { n++; if (!cond) { fails++; console.error(`FAIL ${name}${info != null ? ': ' + info : ''}`); } }
const near = (name, got, want, tol) => ok(name, Math.abs(got - want) <= tol, `got ${got}, expected ${want} ± ${tol}`);
const integ = (fn, a, b, m = 20000) => { let s = 0; const h = (b - a) / m; for (let i = 0; i <= m; i++) s += (i === 0 || i === m ? 1 : i % 2 ? 4 : 2) * fn(a + i * h); return s * h / 3; };

/* ── elasticity ── */
for (const [e, dp] of [[0.4, 0.2], [1.5, 0.2], [1, 0.5], [0.2, -0.3]]) {
  const r = M.elastic(e, dp);
  near(`Q = (1+dp)^-e (${e},${dp})`, r.q, Math.exp(-e * Math.log(1 + dp)), 1e-12);
  ok(`spending rises iff e < 1 (${e},${dp})`, e === 1 ? Math.abs(r.dspend) < 1e-12 : (r.dspend > 0) === ((e < 1) === (dp > 0)));
}
near('arc elasticity ≈ e for a small change', M.elastic(0.7, 0.01).arc, 0.7, 0.01);

/* ── incidence ── */
for (const [ed, es, tau] of [[1.5, 3, 0.25], [1.5, 0.5, 0.25], [0.3, 2, 0.6], [2, 2, 0.1]]) {
  const r = M.incidence(ed, es, tau);
  near(`demand = supply (${ed},${es},${tau})`, Math.pow(r.Pb, -ed), Math.pow(r.Ps, es), 1e-12);
  near(`wedge = 1 + τ`, r.Pb / r.Ps, 1 + tau, 1e-12);
  near('log share = es/(es+ed)', Math.log(r.Pb) / Math.log(1 + tau), es / (es + ed), 1e-12);
  const cs = integ(p => Math.pow(p, -ed), 1, r.Pb), ps = integ(p => Math.pow(p, es), r.Ps, 1);
  near('DWL = ∫demand + ∫supply − revenue', r.dwl, cs + ps - r.rev, 1e-9);
  near('buyers + sellers pay the revenue', r.buyerPay + r.sellerPay, r.rev, 1e-12);
}
{ const r = M.incidence(1.5, Infinity, 0.25); near('small country: buyer price rises by the full tariff', r.Pb, 1.25, 1e-12); check('small country: seller price unchanged', r.Ps, 1); }
{ const d10 = M.incidence(1.5, 3, 0.1).dwl, d20 = M.incidence(1.5, 3, 0.2).dwl; ok('DWL roughly quadruples from 10% to 20% (between 3 and 4.2)', d20 / d10 > 3 && d20 / d10 < 4.2, d20 / d10); }

/* ── ledger ── */
for (const [t, eX] of [[20, 10], [20, Infinity], [10, 4], [35, 2], [5, 20]]) {
  const L = M.ledger(t, eX), b = 1, d = 0.4, fx = eX === Infinity ? Infinity : eX * 0.6;
  // brute force: home price P solves D − S = X(P − t)
  let lo = 100, hi = 160; const ex = P => (100 - b * (P - 100)) - (40 + d * (P - 100)) - (fx === Infinity ? (P - t >= 100 ? Infinity : -Infinity) : 60 + fx * (P - t - 100));
  for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (ex(m) > 0) lo = m; else hi = m; }
  if (!L.prohibitive) near(`home price (${t},${eX})`, L.P, (lo + hi) / 2, 1e-6);
  const cs = integ(p => 100 - b * (p - 100), 100, L.P), ps = integ(p => 40 + d * (p - 100), 100, L.P);
  near(`consumer loss = ∫D (${t},${eX})`, L.csLoss, cs, 1e-6); near(`producer gain = ∫S (${t},${eX})`, L.psGain, ps, 1e-6);
  near(`net = ToT − DWL (${t},${eX})`, L.net, L.tot - L.dwl, 1e-9);
  ok(`world always loses (${t},${eX})`, L.world < 0);
}
for (const eX of [2, 4, 10]) {
  const o = M.optimalTariff(eX); let bt = 0, bn = -Infinity; for (let t = 0; t <= 80; t += 0.01) { const v = M.ledger(t, eX).net; if (v > bn) { bn = v; bt = t; } }
  near(`optimal tariff vs grid (eX=${eX})`, o.t, bt, 0.02);
  // linear closed form: net(t) = (t − x)M − (k/2)x², x = f t/(k+f), M = M0 − kx → t* = M0 (k+f) / (k f + f² ... ) checked numerically:
  const k = 1.4, fx = eX * 0.6, a = fx / (k + fx); // x = a t
  // net = (1−a) t (M0 − k a t) − (k/2) a² t²; d/dt = 0 → t* = (1−a) M0 / (2 k a (1−a) + k a²)
  near(`optimal tariff closed form (eX=${eX})`, o.t, (1 - a) * 60 / (2 * k * a * (1 - a) + k * a * a), 1e-4);
}
check('small country: optimal tariff 0', M.optimalTariff(Infinity).t, 0);
{ const L = M.ledger(60, 10); ok('a 60 yuan tariff with eX 10 is prohibitive', L.prohibitive && L.M === 0 && L.rev === 0); }

/* ── retaliation ── */
for (const eX of [2, 4, 10]) {
  const o = M.optimalTariff(eX), m = M.retalMatrix(eX, o.t);
  ok(`dominant strategy to tax (eX=${eX})`, m.tf.a > m.ff.a && m.tt.a > m.ft.a);
  ok(`mutual tariffs worse than free trade (eX=${eX})`, m.tt.a < 0 && m.tt.b < 0);
  near(`symmetric (eX=${eX})`, m.ft.a, m.tf.b, 1e-9);
}

/* ── Ricardo ── */
{
  const R = M.ricardo();
  near('autarky price England 100/120', R.autE, 100 / 120, 1e-12); near('autarky price Portugal 90/80', R.autP, 90 / 80, 1e-12);
  // market clearing at pe: England makes 2.2 cloth; world cloth demand = half of world income in wine / p
  near('cloth market clears', (2.2 * R.pe + 170 / 80) / 2 / R.pe, 2.2, 1e-12);
  check('England specialises in cloth', R.specE, 'cloth'); check('Portugal in wine', R.specP, 'wine');
  ok('both gain at the clearing price', R.gE > 0 && R.gP > 0);
  const lo = M.ricardo({ p: 100 / 120 }), hi = M.ricardo({ p: 90 / 80 });
  near('at England\'s autarky price England gains nothing', lo.gE, 0, 0.005); near('at Portugal\'s, Portugal gains nothing', hi.gP, 0, 0.005);
  const same = M.ricardo({ pC: 80 * 100 / 120 }); near('equal relative costs: no gain (E)', same.gE, 0, 1e-9); near('equal relative costs: no gain (P)', same.gP, 0, 1e-9);
  ok('prose: 66.7 man-years equalises the ratios', Math.abs(80 * 100 / 120 - 66.7) < 0.05 && Z['ch4.p3'].includes('66.7'));
  ok('prose: 0.83 and 1.13', Z['ch4.p2'].includes('0.83') && Z['ch4.p2'].includes('1.13') && f(100 / 120, 2) === '0.83' && f(90 / 80, 2) === '1.13');
}

/* ── S − I = CA ── */
{
  const B = M.balance(); near('default CA = −3.6 (BEA 2025)', B.ca, -M.FRONTIER.bea.caGdp2025, 1e-9);
  near('twin deficits: +1 deficit → CA −1', M.balance({ deficit: 3.6 }).ca - B.ca, -1, 1e-9);
  near('full appreciation = m / 1.2 × 10', M.tariffShock(1, 50).apprFull, 1 / 1.2 * 10, 1e-12);
  near('NX returns to S − I', M.tariffShock(1, 30).nx, B.ca, 1e-9); near('NX starts at S − I + m', M.tariffShock(1, 0).nx, B.ca + 1, 1e-12);
  check('IMF coefficient', M.FRONTIER.imf.per10, M.BAL.nxPer10);
}

/* ── diversion ── */
{
  const D = M.divert(), sg = 4, pV = 1.1;
  // direct: weights so the base share is 0.7, then C's price ×1.25
  const wC0 = 0.7, wV0 = 0.3, aV = wV0 / Math.pow(pV, 1 - sg), wC1 = 0.7 * Math.pow(1.25, 1 - sg), wV1 = aV * Math.pow(pV, 1 - sg);
  near('C share after the tariff', D.sC, wC1 / (wC1 + wV1), 1e-12);
  near('price index change', D.dP, Math.pow((wC1 + wV1) / (wC0 + wV0), 1 / (1 - sg)) - 1, 1e-12);
  near('total duty-exclusive imports fall by exactly the revenue (η = 1)', D.total0 - D.total1, D.rev, 1e-12);
  const P = M.divert({ psi: 1 }); near('full currency offset: buyers pay nothing extra', P.dP, 0, 1e-12);
  ok('σ larger → more diversion', M.divert({ sigma: 8 }).sC < D.sC);
}

/* ── chokepoint ── */
for (const yr of [1 / 12, 2, 8]) {
  const c = M.chokeAt(yr), o = M.CHOKE, w = 1 - Math.exp(-yr / o.T), ed = o.ed0 + (o.ed1 - o.ed0) * w, es = o.es0 + (o.es1 - o.es0) * w;
  near(`market clears at year ${f(yr, 2)}`, Math.pow(c.P, -ed), o.s * (1 - o.cut) + (1 - o.s) * Math.pow(c.P, es), 1e-9);
}
ok('price falls over time', M.chokeAt(1 / 12).P > M.chokeAt(2).P && M.chokeAt(2).P > M.chokeAt(8).P);
ok('revenue above 1 early, below 1 late', M.chokeAt(1 / 12).ctrlRev > 1 && M.chokeAt(8).ctrlRev < 1);
ok('slower substitution → higher early price', M.chokeAt(1 / 12, { T: 6 }).P > M.chokeAt(1 / 12, { T: 1 }).P);
check('no cut, no price change', M.chokeAt(1, { cut: 0 }).P, 1);

/* ── pass-through ── */
{
  const P = M.passthru();
  near('DiD recovers β = 1 within 3 se', P.border.b, 1, 3 * P.border.se);
  ok('naive estimate is biased up by the common shock', P.naive > P.border.b + 0.1);
  near('retail slope ≈ θ·β', P.retail.b, 0.3, 3 * P.retail.se);
  const A = M.passthru({ absorb: 0.5 }); near('absorption halves the retail slope', A.retail.b, 0.15, 3 * A.retail.se);
  const big = M.passthru({ n: 2000, beta: 0.6 }); near('β = 0.6 recovered', big.border.b, 0.6, 3 * big.border.se);
  near('g = 0: naive ≈ DiD', M.passthru({ g: 0, n: 2000 }).naive, M.passthru({ g: 0, n: 2000 }).border.b, 0.05);
}

/* ── bindings, re-derived ── */
{
  const B = (k, v) => check('binding ' + k, Bd[k], v);
  B('e1.dq04', f((1 - Math.pow(1.2, -0.4)) * 100, 1) + '%'); B('e1.sp04', f((1.2 * Math.pow(1.2, -0.4) - 1) * 100, 1) + '%');
  B('e1.dq15', f((1 - Math.pow(1.2, -1.5)) * 100, 1) + '%'); B('e1.sp15', f((1 - 1.2 * Math.pow(1.2, -1.5)) * 100, 1) + '%');
  B('i2.pb', f((Math.pow(1.25, 2 / 3) - 1) * 100, 1) + '%'); B('i2.ps', f((1 - Math.pow(1.25, -1 / 3)) * 100, 1) + '%'); B('i2.swap', '25%');
  B('l3.P', f(100 + 6 * 20 / 7.4, 1)); B('l3.opt', f(M.optimalTariff(10).t, 1)); B('r4.pe', f((170 / 80) / 2.2, 3));
  B('b5.appr', '8.3%'); B('p8.ex', '28.8%'); B('d6.dT', f(M.divert().rev * 100, 1) + '%');
  B('k7.p1', f(M.chokeAt(1 / 12).P, 1));
  const used = new Set([...md.matchAll(/\{=([\w.]+)\}/g)].map(m => m[1]));
  ok('every binding used', Object.keys(Bd).every(k => used.has(k)), Object.keys(Bd).filter(k => !used.has(k)).join());
  ok('every {=…} bound', [...used].every(k => k in Bd), [...used].filter(k => !(k in Bd)).join());
}

/* ── literal numbers in the prose: every digit run outside bindings, keys and placeholders is whitelisted ── */
{
  const ALLOW = new Set(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '20', '25', '30', '40', '60', '70', '90', '100', '120', '80', '1817', '200', '240', '1999', '2011', '2016', '0.83', '1.13', '66.7', '0.85', '1.5', '0.5', '50', '2018', '2019', '2020', '2021', '2024', '2025', '2026', '2027', '2022', '2023', '12', '11', '14', '17', '18', '19', '21', '22', '23', '24', '232', '301', '122', '150', '1974', '34620', '21798', '0.4', '3.6', '1.2', '2.7', '22.9', '11.2', '0.6', '33', '135', '110', '34', '13', '9', '15', '16', '03', '08', '91', '95', '2017']);
  const prose = Object.entries(Z).filter(([k]) => !/^(site\.|dg\.|u\.)/.test(k) && !/\.(say|cv|read|ctl|model|col|row|cell|cap)\b/.test(k)).map(([, v]) => v.replace(/<[^>]+>/g, '')).join('\n');
  const bad = [...new Set((prose.match(/\d+(?:\.\d+)?/g) || []).filter(s => !ALLOW.has(s) && !Object.values(Bd).some(b => b.includes(s))))];
  ok('no unexplained literal numbers in the prose', !bad.length, bad.join(', '));
  ok('prose: 0.34% via binding', Z['ch6.p5'].includes(Bd['f.fkRetal']));
  ok('prose: Ricardo labour numbers', ['100', '120', '90', '80'].every(s => Z['ch4.p1'].includes(s)) && M.RICARDO.E.cloth === 100 && M.RICARDO.P.wine === 80);
  ok('prose: ledger set-up 100/40/60', Z['ch3.p2'].includes('100 万件') && Z['ch3.p2'].includes('40 万件') && Z['ch3.p2'].includes('60 万件') && M.LEDGER.D0 === 100 && M.LEDGER.S0 === 40);
  ok('prose: chokepoint defaults 90% and 30%', Z['ch7.p4'].includes('90%') && Z['ch7.p4'].includes('三成') && M.CHOKE.s === 0.9 && M.CHOKE.cut === 0.3);
  ok('prose: diversion 70/30, 10% premium', Z['ch6.p1'].includes('70%') && Z['ch6.p1'].includes('30%') && Z['ch6.p1'].includes('一成'));
  ok('prose: IEA 60/91/95', Z['ch7.p2'].includes('60%') && Z['ch7.p2'].includes('91%') && Z['ch7.p2'].includes('95%') && M.FRONTIER.iea.magnets === 95);
  ok('prose: ADH 2.0–2.4 million', Z['ch4.limit'].includes('200 万到 240 万'));
}

/* ── frontier dates and sources are present ── */
{
  const s = Object.values(Z).join('\n');
  for (const k of ['2026-03-25', '2026-01-14', '2026-04-08', '2019-08-21', '2026 年 2 月 20 日', '2025 年 4 月 4 日', '2027 年 1 月 10 日', 'w34620', 'DP21798']) ok('dated source: ' + k, s.includes(k));
  ok('three tags used', ['tag h', 'tag m', 'tag l'].every(c => (Z['ch9.e1'] + Z['ch9.e6'] + Z['ch9.e9']).includes(c)));
}

/* ── dynamic keys used by app.js exist ── */
{
  const keys = [...app.matchAll(/\bt\('([\w.]+)'/g)].map(m => m[1]);
  const miss = [...new Set(keys)].filter(k => !(k in Z) && !k.endsWith('.'));
  ok('app.js keys defined', !miss.length, miss.join());
  for (const pre of ['elasticity.say', 'ch2.say', 'ch3.say', 'ch4.say', 'ch5.say', 'ch6.say', 'ch7.say', 'ch8.say']) {
    const pj = JSON.parse(fs.readFileSync(path.join(DIR, 'page.json'), 'utf8')).dynamicKeys[pre] || [];
    ok('dynamic keys of ' + pre, pj.every(k => (pre + '.' + k) in Z), pre);
  }
}

/* ── language hygiene ── */
ok('no CJK in app.js outside comments', !/[一-鿿]/.test(app.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')));
ok('no CJK in models.js outside comments', !/[一-鿿]/.test(models.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')));
for (const fn of fs.readdirSync(path.join(DIR, 'figures'))) ok('no CJK in ' + fn, !/[一-鿿]/.test(fs.readFileSync(path.join(DIR, 'figures', fn), 'utf8')));
{ const R = JSON.parse(fs.readFileSync(path.join(DIR, 'REGISTRY.json'), 'utf8')); ok('registry anchors exist', R.concepts.every(c => new RegExp(`id="${c.anchor.slice(1)}"`).test(fs.readFileSync(path.join(DIR, 'index.html'), 'utf8')))); }

console.log(`${n - fails}/${n} checks passed`);
if (fails) process.exit(1);
