'use strict';
// Pins the page's models against closed forms and hand derivations, and the prose numbers ({=…} bindings) against
// independent recomputation. Also: copy parity, no Chinese in index.html outside pre-fill, English free of CJK.
// Run: node economics/markets/when-buyers-cant-see-quality/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const ROOT = path.join(DIR, '..', '..', '..');
const M = require(path.join(DIR, 'models.js'));
const B = require(path.join(DIR, 'bindings.cjs'))(M);
const load = l => { const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, `copy.${l}.js`), 'utf8'), ctx); return ctx.window.ESSAY_COPY[l]; };
const Z = load('zh'), E = load('en');
let n = 0, fails = 0;
const ok = (name, cond, info) => { n++; if (!cond) { fails++; console.error(`FAIL ${name}${info != null ? ': ' + info : ''}`); } };
const near = (name, got, want, tol) => ok(name, Math.abs(got - want) <= tol, `got ${got}, expected ${want} ± ${tol}`);

/* ch1: CRRA certainty equivalents by hand */
{
  // g = 2: u = −1/w, EU = −(0.98/20 + 0.02/10) → CE = 1/0.051
  const r = M.insure(M.CH1);
  near('ch1 CE g=2', r.ce, 1 / (0.98 / 20 + 0.02 / 10), 1e-9);
  near('ch1 max premium g=2 (yuan)', r.maxPrem * 1e4, (20 - 1 / 0.051) * 1e4, 1e-6);
  // g = 1: CE = 20^0.98 · 10^0.02
  near('ch1 CE g=1', M.insure(Object.assign({}, M.CH1, { g: 1 })).ce, Math.pow(20, 0.98) * Math.pow(10, 0.02), 1e-9);
  near('ch1 risk neutral pays exactly the expected loss', M.insure(Object.assign({}, M.CH1, { g: 0 })).riskPrem, 0, 1e-9);
  ok('ch1 ratio falls as p rises (rare losses carry the larger mark-up)', M.insure(Object.assign({}, M.CH1, { p: 0.2 })).ratio < M.insure(M.CH1).ratio);
  ok('ch1 binding max', B['ch1.max'] === '3,922', B['ch1.max']);
}

/* ch3: lemons */
{
  for (const [b, lo] of [[1.5, 2], [1.3, 2], [1.3, 4]]) {
    const fx = M.lemonsFixed(b, lo, 10), sim = M.lemons({ b, lo });
    near(`ch3 fixed point b=${b} lo=${lo} = b·lo/(2−b)`, fx.p, b * lo / (2 - b), 1e-12);
    near(`ch3 simulation stops near the continuum fixed point b=${b} lo=${lo}`, sim.final.p, fx.p, 0.15);
  }
  ok('ch3 lo=0 unravels', M.lemons({ b: 1.5, lo: 0 }).final.k <= 2);
  ok('ch3 b·mean ≥ hi: everyone trades', M.lemons({ b: 1.8, lo: 2 }).final.k === 200);
  const L = M.lemons({ b: 1.5, lo: 2 });
  ok('ch3 offer falls every round', L.hist.every((h, i) => i === 0 || h.p <= L.hist[i - 1].p + 1e-12));
  ok('ch3 default partial: 30–70% of cars trade', L.final.share > 0.3 && L.final.share < 0.7, L.final.share);
  ok('ch3 bindings', B['ch3.pf'] === '6.03' && B['ch3.kf'] === '101' && B['ch3.fix'] === '6', [B['ch3.pf'], B['ch3.kf']].join());
}

/* ch4: pool */
{
  const P = M.pool({});
  ok('ch4 default spirals below 10%', P.final.share < 0.1, P.final.share);
  ok('ch4 premium rises every round', P.hist.every((h, i) => i === 0 || h.prem[0] >= P.hist[i - 1].prem[0] - 1e-9));
  // each person's bid is ch1's max premium at their own p
  const p = P.ps[123]; near('ch4 bid = ch1 maximum premium', P.wtp[123], M.insure({ W: 20, L: 10, p, g: 2 }).maxPrem * 1e4, 1e-6);
  // round 0 premium = 1.15 × mean expected loss
  near('ch4 round-0 premium', P.hist[0].prem[0], 1.15 * P.meanCost, 1e-6);
  // a fixed point: the final premium equals 1.15 × mean cost of those who stay
  const stay = P.ps.map((q, i) => i).filter(i => P.wtp[i] >= P.final.prem[0] - 1e-9);
  near('ch4 final premium is self-consistent', P.final.prem[0], 1.15 * stay.reduce((s, i) => s + P.cost[i], 0) / stay.length, 1e-6);
  const s10 = M.pool({ inc: 1000 }).final.share, s15 = M.pool({ inc: 1500 }).final.share;
  ok('ch4 tipping between ¥1,000 and ¥1,500', s10 < 0.35 && s15 > 0.8, [s10, s15].join());
  const cov = [1, 2, 3, 4, 5].map(K => M.pool({ K }).final.share);
  ok('ch4 more underwriting classes, more coverage', cov.every((c, i) => i === 0 || c >= cov[i - 1]), cov.join());
  const P5 = M.pool({ K: 5 });
  ok('ch4 top class still spirals with 5 classes', P5.final.inClass[4] < 0.5 * 200, P5.final.inClass.join());
  ok('ch4 more risk aversion, more coverage', M.pool({ g: 3 }).final.share > P.final.share);
}

/* ch5: Rothschild–Stiglitz menu */
{
  const S = M.CH5, Ds = M.minSeparatingD(S);
  near('ch5 at D*, a high risk is indifferent between A and B', M.planEU(S.pH, S.L - Ds, S.pL, S), M.planEU(S.pH, S.L, S.pH, S), 1e-9);
  const a = M.screen(Object.assign({}, S, { D: Ds + 0.05 })), b = M.screen(Object.assign({}, S, { D: Ds - 0.05 }));
  ok('ch5 just above D*: separated, insurer breaks even', a.separated && Math.abs(a.profit) < 1e-9, [a.cH, a.cL, a.profit].join());
  ok('ch5 just below D*: high risks leak into B, insurer loses', b.cH === 'B' && b.profit < 0);
  const d3 = M.screen(Object.assign({}, S, { D: 3 }));
  near('ch5 loss at D=3: 0.3 × (0.2 − 0.05) × 7 (10k yuan)', -d3.profit, 0.3 * 0.15 * 7, 1e-12);
  ok('ch5 low risk is worse off than with full information', a.ceLsep < a.ceLfull);
  const lb = M.lamBreak(S);
  ok('ch5 menu breaks for few high risks, holds for many', M.screen(Object.assign({}, S, { lam: lb / 2, D: 0 })).breaks && !M.screen(Object.assign({}, S, { lam: Math.min(0.9, lb * 2), D: 0 })).breaks, lb);
  ok('ch5 bindings', B['ch5.ds'] === '6.70' && B['ch5.loss3'] === '3,150' && B['ch5.lb'] === '13', [B['ch5.ds'], B['ch5.loss3'], B['ch5.lb']].join());
}

/* ch6: Spence */
{
  const s = M.spence(M.CH6);
  ok('ch6 separating range = [(wH−wL)/cL, (wH−wL)/cH]', s.range[0] === 1.5 && s.range[1] === 3);
  ok('ch6 states', M.spence(Object.assign({}, M.CH6, { eStar: 1 })).state === 'all' && s.state === 'sep' && M.spence(Object.assign({}, M.CH6, { eStar: 3.5 })).state === 'none');
  ok('ch6 at the cheapest separating threshold the able just match the pooled average', M.spence(Object.assign({}, M.CH6, { eStar: 1.5 })).highNet === s.avg);
}

/* ch7: moral hazard */
{
  const h0 = M.hazard(0), best = M.hazardBest(), fb = M.firstBest();
  ok('ch7 full cover: no care', h0.e < 1e-6 && Math.abs(h0.p - 0.1) < 1e-9);
  ok('ch7 interior optimum co-pay', best.s > 0.1 && best.s < 0.9, best.s);
  ok('ch7 first best beats the best co-pay', fb.ce > best.ce);
  // premium is priced at the care actually taken
  near('ch7 premium fixed point', best.prem, (1 - best.s) * 10 * best.p, 1e-8);
  const care = [0, 0.2, 0.4, 0.6, 0.8, 1].map(s => M.hazard(s).e);
  ok('ch7 care rises with the co-pay', care.every((e, i) => i === 0 || e >= care[i - 1] - 1e-9), care.join());
  // first best by calculus: maximise −p0(1−a e)L − k e² → e = p0 a L / (2k)
  near('ch7 first-best care', fb.e, 0.1 * 0.7 * 10 / (2 * 0.6), 1e-3);
}

/* ch8: Stiglitz–Weiss */
{
  const W = M.sw(M.CH8), G = W.G;
  near('ch8 safest limit = (μ−u0)/π − 1', G[0].rMax, (1.25 - 0.05) / 0.97 - 1, 1e-12);
  ok('ch8 default: interior peak at the safest group limit', W.interior && Math.abs(W.best.r - Math.floor(G[0].rMax * 1000) / 1000) < 1e-9, W.best.r);
  near('ch8 return at the peak = (1 + r)·Σwπ', W.best.ret, (1 + W.best.r) * (0.4 * 0.97 + 0.3 * 0.88 + 0.2 * 0.75 + 0.1 * 0.6), 1e-12);
  near('ch8 rationed share = 1 − F/D', W.rationed, 0.5, 1e-12);
  const W0 = M.sw(Object.assign({}, M.CH8, { gap: 0 }));
  ok('ch8 equal means: peak moves to the riskiest group alone', !W0.interior && Math.abs(W0.best.demand - 0.1) < 1e-9);
  near('ch8 equal means: return at the top = μ − u0', W0.best.ret, 1.2, 1e-9);
  ok('ch8 with scores the riskiest group is not served', W.priced.slice(0, 3).every(p => p.served) && !W.priced[3].served);
  // the expected return falls just above the safest limit
  ok('ch8 return drops past the first limit', M.swAt(G[0].rMax + 0.001, G).ret < W.best.ret);
}

/* ch9: scorecard */
{
  near('ch9 600 points at odds 50:1', M.score(1 / 51), 600, 1e-9);
  near('ch9 +20 points per doubling of odds', M.score(1 / 101) - M.score(1 / 51), 20, 1e-9);
  const cs = [500, 550, 600, 650].map(c => M.cutoff(c));
  ok('ch9 higher cutoff: fewer approved, lower bad rate', cs.every((c, i) => i === 0 || (c.approve <= cs[i - 1].approve && c.badApproved <= cs[i - 1].badApproved + 1e-12)));
  ok('ch9 most declined borrowers at 580 would have repaid (prose ch9)', 1 - M.cutoff(580).badRejectedShare > 0.5, M.cutoff(580).badRejectedShare);
  ok('ch9 a thin file scores lower than a long record', M.score(M.pd(0, 0.3, 0)) < M.score(M.pd(0, 0.3, 5)));
  ok('ch9 bindings', B['ch9.s0'] === '608' && B['ch9.ap'] === '62', [B['ch9.s0'], B['ch9.ap']].join());
}

/* copy and markup hygiene */
{
  const kz = Object.keys(Z).sort(), ke = Object.keys(E).sort();
  ok('copy keys zh = en', kz.join() === ke.join());
  const cjk = /[㐀-鿿＀-￯]/;
  const bad = ke.filter(k => cjk.test(E[k]));
  ok('no CJK in English copy', bad.length === 0, bad.slice(0, 5).join());
  const { unprefill } = require(path.join(ROOT, 'scripts', 'lib', 'prefill.cjs'));
  const html = unprefill(fs.readFileSync(path.join(DIR, 'index.html'), 'utf8'), Z);
  // <title> and <meta description> carry doc.title / doc.desc, which app.js replaces on load
  // registered 2026-11-25: the provenance label rendered from page-provenance.json is bilingual by design
  const pjReg = JSON.parse(fs.readFileSync(path.join(DIR, 'page.json'), 'utf8'));
  ok('page.json registry fields', ['category', 'subtopic', 'stage', 'status', 'path'].map(k => pjReg[k]).join() === 'economics,markets,university,live,economics/markets/when-buyers-cant-see-quality/');
  ok('exactly one provenance label', (html.match(/<details class="page-provenance"/g) || []).length === 1);
  const leftover = (html.replace(/<!--[\s\S]*?-->/g, '').replace(/<details class="page-provenance"[\s\S]*?<\/details>/, '').replace(/<title>[\s\S]*?<\/title>/, '').replace(/<meta[^>]*>/g, '').match(/[一-鿿]+/g) || []).filter(s => s !== '中');
  ok('no hand-typed Chinese in index.html', leftover.length === 0, leftover.slice(0, 5).join(' '));
  const app = fs.readFileSync(path.join(DIR, 'app.js'), 'utf8');
  const used = [...app.matchAll(/t\('([a-z0-9.]+)'[,)]/gi)].map(m => m[1]).filter(k => k.includes('.') && !k.endsWith('.'));
  const missing = [...new Set(used)].filter(k => Z[k] == null);
  ok('every literal key app.js uses exists', missing.length === 0, missing.join());
  const reg = JSON.parse(fs.readFileSync(path.join(DIR, 'REGISTRY.json'), 'utf8'));
  ok('every registry anchor is a chapter', reg.concepts.every(c => /^#ch\d+$/.test(c.anchor) && fs.readFileSync(path.join(DIR, 'index.html'), 'utf8').includes(`id="${c.anchor.slice(1)}"`)));
}

console.log(`${n - fails}/${n} checks passed`);
if (fails) process.exit(1);
