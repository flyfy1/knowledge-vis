'use strict';
// Model tests for what-makes-prices-rise. Re-derives the numbers the prose binds ({=name} via bindings.cjs) with
// independent code where possible, checks closed forms against the simulations, the slider defaults the prose
// assumes, every live-sentence branch, the diagram that is drawn to scale, and that no Chinese sits outside the copy.
// Run: node economics/macro/what-makes-prices-rise/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const dir = path.join(__dirname, '..');
const M = require(path.join(dir, 'models.js'));
const D = require(path.join(dir, 'data.js'));
const B = require(path.join(dir, 'bindings.cjs'))(M);
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(dir, 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;
const { unprefill } = require(path.join(dir, '../../../scripts/lib/prefill.cjs'));
const html = unprefill(fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), Z);
const page = JSON.parse(fs.readFileSync(path.join(dir, 'page.json'), 'utf8'));

let n = 0, fails = 0;
const ok = (name, c) => { n++; if (!c) { fails++; console.error('FAIL ' + name); } };
const eq = (name, got, want) => { n++; if (got !== want) { fails++; console.error(`FAIL ${name}: got ${got}, want ${want}`); } };
const near = (name, a, b, tol = 1e-9) => { n++; if (!(Math.abs(a - b) <= tol)) { fails++; console.error(`FAIL ${name}: ${a} vs ${b}`); } };
const slider = id => { const m = html.match(new RegExp(`id="${id}" min="([^"]+)" max="([^"]+)" step="([^"]+)" value="([^"]+)"`)); if (!m) throw new Error('no slider ' + id); return { min: +m[1], max: +m[2], step: +m[3], value: +m[4] }; };
const says = (key, phrase) => { n++; if (!Z[key] || !Z[key].includes(phrase)) { fails++; console.error(`FAIL ${key} should contain "${phrase}"`); } };

/* ── ch1: quantity equation, recomputed straight from the data arrays ── */
{
  const us = D.us, i = y => y - us.y0, ann = (x, k) => Math.pow(x, 1 / k) - 1;
  const raw = (a, b) => {
    const M2 = us.m2[i(b)] / us.m2[i(a)], N = us.ngdp[i(b)] / us.ngdp[i(a)], R = us.rgdp[i(b)] / us.rgdp[i(a)];
    return { M: ann(M2, b - a), V: ann(N / M2, b - a), Y: ann(R, b - a), P: ann(N / R, b - a), cf: ann(M2 / R, b - a) };
  };
  for (const [k, [a, b]] of Object.entries(M.QTY_PRESETS)) {
    const q = M.qty(a, b), r = raw(a, b);
    near(`ch1 identity ${k}`, q.identity, 1, 1e-12);
    near(`ch1 product form ${k}`, (1 + q.g.M) * (1 + q.g.V), (1 + q.g.P) * (1 + q.g.Y), 1e-12);
    for (const s of ['M', 'V', 'Y', 'P']) near(`ch1 ${k} ${s}`, q.g[s], r[s], 1e-12);
    near(`ch1 ${k} cf`, q.cf.pi, r.cf, 1e-12);
  }
  const r = raw(2008, 2014);
  eq('ch1 qe M', B['ch1.qeM'], (100 * r.M).toFixed(1)); eq('ch1 qe V', B['ch1.qeV'], (-100 * r.V).toFixed(1)); eq('ch1 qe cf', B['ch1.qeCf'], (100 * r.cf).toFixed(1));
  eq('ch1 qe numbers', [B['ch1.qeM'], B['ch1.qeV'], B['ch1.qeY'], B['ch1.qeP'], B['ch1.qeCf']].join('/'), '6.5/3.4/1.4/1.5/5.1');
  eq('ch1 surge/rebound', [B['ch1.svM'], B['ch1.svV'], B['ch1.svP'], B['ch1.rbM'], B['ch1.rbV'], B['ch1.rbP']].join('/'), '17.6/10.7/2.9/0.7/7.5/5.4');
  ok('ch1 velocity fell 2008–14 and rose 2021–23', M.qty(2008, 2014).g.V < 0 && M.qty(2021, 2023).g.V > 0);
  ok('ch1 rebound: money alone says prices fall', M.qty(2021, 2023).cf.pi < 0);
  eq('ch1 base money 2007→2014', B['hero.base'], (us.base[i(2014)] / us.base[i(2007)]).toFixed(1));
  eq('ch1 default window', `${slider('qY0').value}-${slider('qY1').value}`, '2008-2014');
  ok('ch1 data ends 2025 (2026 incomplete)', us.y1 === 2025 && slider('qY1').max === 2025);
}

/* ── ch2: AD/AS closed forms ── */
{
  const al = slider('aA').value, a0 = slider('aP').value; eq('ch2 defaults', `${al}/${a0}`, '0.5/0');
  ok('ch2 default shock is energy', /name="aK" value="supply" checked/.test(html));
  // year 1, no policy: π1 = 2 + (αD + U)/(1+α), y1 = (D − U)/(1+α)
  for (const k of ['demand', 'supply', 'both']) {
    const s = M.ADAS_SHOCKS[k], r = M.adas(k, 0.5, 0);
    near(`ch2 ${k} π1`, r.pi1, 2 + (0.5 * s.D + s.U) / 1.5, 1e-12); near(`ch2 ${k} y1`, r.y1, (s.D - s.U) / 1.5, 1e-12);
  }
  // full policy keeps output at zero; supply shock then ratchets the price level by ΣU = U(1−ρ^10)/(1−ρ)
  const f = M.adas('supply', 0.5, 1); ok('ch2 full policy y = 0', f.path.every(p => Math.abs(p.y) < 1e-9));
  near('ch2 accommodated price level', f.pT, 6 * (1 - Math.pow(0.5, 10)) / 0.5, 1e-9);
  ok('ch2 full policy offsets a demand shock', M.adas('demand', 0.5, 1).path.every(p => Math.abs(p.pi - 2) < 1e-9));
  // demand shock: long run price level +6, output back to 0
  const d = M.adas('demand', 0.5, 0, 60); near('ch2 demand long run p', d.pT, 6, 1e-6); near('ch2 demand long run y', d.yT, 0, 1e-6);
  eq('ch2 prose numbers', [B['ch2.sPi1'], B['ch2.sY1'], B['ch2.sLowT'], B['ch2.sLow'], B['ch2.sYs'], B['ch2.fPi1'], B['ch2.fPT'], B['ch2.dPi1'], B['ch2.dY1'], B['ch2.bPi1'], B['ch2.bY1']].join('/'),
    '6.0/-4.0/4/1.1/-23.2/8.0/12.0/4.0/4.0/8.0/0.0');
  const c = M.adas('china', 0.5, 0); near('ch2 china π1 = 1', c.pi1, 1, 1e-12); ok('ch2 china stays below 2%', c.path.slice(1).every(p => p.pi < 2));
  eq('ch2/ch8 china', `${B['ch8.chPi1']}/${B['ch8.chPT']}/${B['ch8.chFull']}`, '1.0/9.0/6.5');
}

/* ── ch3–4: Phillips curve ── */
{
  eq('ch3 defaults', `${slider('pT').value}/${slider('pG').value}`, '0/1'); ok('ch3 default mode hot', /name="pM" value="hot" checked/.test(html));
  // adaptive: inflation climbs β·gap a year; anchored steady state π* + β·gap/θ
  const h = M.phillips({ mode: 'hot', theta: 0, gap: 1 }); for (let t = 1; t <= 20; t++) near(`ch3 accel t${t}`, h.path[t].pi, 2 + 0.5 * t, 1e-12);
  for (const th of [0.3, 0.6, 1]) near(`ch3 steady θ=${th}`, M.phillips({ mode: 'hot', theta: th, gap: 1, years: 200 }).piT, 2 + 0.5 / th, 1e-6);
  eq('ch3 prose', [B['ch3.hot10'], B['ch3.hot20'], B['ch3.hot06'], B['ch3.hot1'], B['ch3.oil0'], B['ch3.oil8']].join('/'), '7.0/12.0/2.83/2.5/18.0/2.6');
  // adaptive disinflation: point-years = (10 − 3)/β whatever the gap (when the gap divides the drop evenly)
  for (const g of [1, 2]) near(`ch4 sacrifice gap ${g}`, M.phillips({ mode: 'cool', theta: 0, gap: g }).pointYears, 7 / 0.5, 1e-9);
  eq('ch4 prose', [B['ch4.c0n'], B['ch4.c0py'], B['ch4.c2py'], B['ch4.c6n'], B['ch4.c6py']].join('/'), '14/14/14/2/2');
  // era slopes: independent OLS from the raw arrays
  const us = D.us, pts = [];
  for (let y = 1960; y <= 2025; y++) { const a = us.cpi[y - us.y0], b = us.cpi[y - 1 - us.y0], u = us.u[y - us.y0]; if (a && b && u != null) pts.push([y, u, 100 * (a / b - 1)]); }
  const ols = (y0, y1) => { const p = pts.filter(r => r[0] >= y0 && r[0] <= y1), mx = p.reduce((s, r) => s + r[1], 0) / p.length, my = p.reduce((s, r) => s + r[2], 0) / p.length; let a = 0, b = 0; p.forEach(r => { a += (r[1] - mx) * (r[2] - my); b += (r[1] - mx) ** 2; }); return a / b; };
  eq('ch3 slopes', [ols(1960, 1969), ols(1970, 1983), ols(1984, 2019), ols(2020, 2025)].map(x => x.toFixed(2)).join('/'), [B['ch3.s60'], B['ch3.s70'], B['ch3.s84'], B['ch3.s20']].join('/'));
  eq('ch3 slopes literal', [B['ch3.s60'], B['ch3.s70'], B['ch3.s84'], B['ch3.s20']].join('/'), '-1.15/-0.15/-0.09/-0.80');
  ok('ch3 data: 2025 CPI present (11-month average)', pts.some(r => r[0] === 2025));
  says('ch3.d.say.e20', '2022 年失业率 3.6%、通胀 8%');
  const p22 = pts.find(r => r[0] === 2022); eq('ch3 2022 point', `${p22[1].toFixed(1)}/${p22[2].toFixed(0)}`, '3.6/8');
  says('ch3.model.how', '自然失业率（5%）'); eq('ch3 u*', M.PC.ustar, 5); eq('ch3 β', M.PC.beta, 0.5);
}

/* ── ch5: wage–price spiral ── */
{
  eq('ch5 defaults', ['wA', 'wT', 'wR', 'wS'].map(id => slider(id).value).join('/'), '0.5/0.6/0.7/0.1');
  says('ch5.model.how', '涨 50%');
  // the real wage does not depend on the workers' catch-up share a
  for (const a of [0, 0.5, 1]) near(`ch5 ω1 a=${a}`, M.spiral({ s: 0.1, X: 50, rho: 1, a, theta: 0.6 }).omega8, -50 * 0.1 / 0.9, 1e-12);
  // permanent shock, θ > 0: π → π* + χ·a·c·X/θ
  near('ch5 steady state', M.spiral({ s: 0.1, X: 50, rho: 1, a: 1, theta: 0.6, years: 300 }).piT, 2 + 0.5 * 50 / 9 / 0.6, 1e-6);
  const sp = M.spiral({ s: 0.1, X: 50, rho: 1, a: 1, theta: 0 }); ok('ch5 θ = 0 accelerates', sp.path.slice(2).every((p, i) => p.pi > sp.path[i + 1].pi));
  eq('ch5 prose', [B['ch5.p1'], B['ch5.p8'], B['ch5.spiral8'], B['ch5.stuck8'], B['ch5.om1']].join('/'), '7.6/1.9/27.0/6.6/-5.6');
}

/* ── ch6, ch9: seigniorage ── */
{
  eq('ch6 defaults', ['sD', 'sK', 'sA'].map(id => slider(id).value).join('/'), '4/10/5');
  // the ceiling found by brute force equals the closed form k·12/(αe) at π = 1/α
  let best = 0, at = 0; for (let x = 0; x < 2; x += 1e-5) { const s = M.seignSteady(x, 0.1, 5); if (s > best) { best = s; at = x; } }
  near('ch6 max (brute force)', best, M.seignMax(0.1, 5).d, 1e-9); near('ch6 argmax', at, 0.2, 1e-4);
  // the simulation converges to the low root below the ceiling
  const r = M.seignorage({ d: 0.04, k: 0.1, alpha: 5, months: 2000 }); near('ch6 converges to low root', r.last.pi, r.roots.low, 1e-8);
  near('ch6 low root solves the equation', M.seignSteady(r.roots.low, 0.1, 5), 0.04, 1e-12);
  ok('ch6 above the ceiling: no root, hyperinflation', M.seignorage({ d: 0.1, k: 0.1, alpha: 5 }).roots === null && M.seignorage({ d: 0.1, k: 0.1, alpha: 5 }).hyperAt > 0);
  ok('ch6 Cagan stability αβ < 1 on the whole slider', slider('sA').max * M.SG.beta < 1);
  eq('ch6 prose', [B['ch6.max'], B['ch6.mo4'], B['ch6.ss4'], B['ch6.ss2'], B['ch6.h10'], B['ch6.h15']].join('/'), '8.8/4.1/63/24/40/9');
  near('ch9 Cagan 50%/month ≈ 130× a year', Math.pow(1.5, 12), 129.746, 1e-3); says('ch9.p1', '一年涨 130 倍');
}

/* ── ch7: debt deflation, recomputed with a plain loop ── */
{
  eq('ch7 defaults', ['fP', 'fI', 'fB', 'fS'].map(id => slider(id).value).join('/'), '-6.8/5/100/10');
  const loop = (pi, phi) => { let Dn = 1, Y = 1, b = 1; const bs = [1]; for (let t = 1; t <= 10; t++) { const p = pi - phi * Math.max(0, b - 1); Dn = Dn * 1.05 - 0.1 * Y; Y = Y * (1 + p); b = Dn / Y; bs.push(b); } return bs; };
  const a = loop(-0.068, 0), c = loop(0.02, 0), f = loop(-0.068, 0.1);
  eq('ch7 prose', [B['ch7.b4'], B['ch7.b10'], B['ch7.ref'], B['ch7.f10'], B['ch7.rr']].join('/'), [(100 * a[4]).toFixed(0), (100 * a[10]).toFixed(0), (100 * c[10]).toFixed(0), (100 * f[10]).toFixed(0), (100 * (1.05 / 0.932 - 1)).toFixed(1)].join('/'));
  eq('ch7 literal', [B['ch7.b4'], B['ch7.b10'], B['ch7.ref'], B['ch7.f10'], B['ch7.rr']].join('/'), '109/135/22/171/12.7');
  const dep = D.dep; eq('ch7 1929–33', [B['ch7.cpi'], B['ch7.pa'], B['ch7.ngdp'], B['ch7.rgdp'], B['ch7.burden'], B['ch7.dti']].join('/'),
    [(100 * (1 - dep.cpi[4] / dep.cpi[0])).toFixed(1), (100 * (Math.pow(dep.cpi[4] / dep.cpi[0], 0.25) - 1)).toFixed(1), (100 * (1 - dep.ngdp[4] / dep.ngdp[0])).toFixed(1), (100 * (1 - dep.rgdp[4] / dep.rgdp[0])).toFixed(1), (dep.cpi[0] / dep.cpi[4]).toFixed(2), (dep.ngdp[0] / dep.ngdp[4]).toFixed(2)].join('/'));
  eq('ch7 default π = 1929–33 pace', slider('fP').value.toFixed(1), B['ch7.pa']);
}

/* ── ch8, ch10: dated facts and the bar chart drawn to scale ── */
{
  const W = D.wb, jp = []; for (let y = 1995; y <= 2012; y++) jp.push(W.jpn[y - W.y0]);
  eq('ch8 Japan 1995–2012', `${(jp.reduce((s, x) => s + x, 0) / jp.length).toFixed(2)}/${jp.filter(x => x < 0).length}`, `${B['ch8.jpAvg']}/${B['ch8.jpNeg']}`);
  // PPI negative Oct 2022 – Feb 2026 inclusive
  eq('ch8 41 months', (2026 - 2022) * 12 + (2 - 10) + 1, M.FACTS.china.negMonths);
  const svg = fs.readFileSync(path.join(dir, 'figures/dg-cn.html'), 'utf8'), rects = [...svg.matchAll(/<rect x="([\d.]+)" y="\d+" width="([\d.]+)"[^>]*data-v="([-\d.]+)"/g)];
  eq('ch8 bars', rects.length, 6);
  for (const m of rects) { const v = +m[3]; near(`ch8 bar ${v} width`, +m[2], Math.abs(v) * 5.5, 0.06); near(`ch8 bar ${v} zero`, v >= 0 ? +m[1] : +m[1] + +m[2], 150, 0.06); }
  const F = M.FACTS.china2610; eq('ch8 bar values', rects.map(m => m[3]).join(','), [F.mining, F.raw, F.processing, F.consumer, F.cpi, F.core].join(','));
  says('dg.cn.cap', '每个百分点 5.5 个单位');
}

/* ── copy, branches, markup ── */
{
  for (const [pre, vals] of Object.entries(page.dynamicKeys)) for (const v of vals) ok(`dynamic key ${pre}.${v}`, Z[`${pre}.${v}`] != null);
  for (const k of ['ch2.pol.none', 'ch2.pol.part', 'ch2.pol.full', 'ch3.say.accel', 'ch3.say.accelOil', 'ch3.say.settle', 'ch3.say.settleOil', 'ch3.say.coolAdaptive', 'ch3.say.coolCredible', 'ch3.say.never', 'ch4.d.say.early', 'ch4.d.say.all', 'ch8.d.say']) ok('say key ' + k, Z[k] != null);
  // every ch6 branch is reachable from the sliders
  const br = new Set();
  for (let d = 0; d <= 15; d += 0.5) for (const k of [5, 10, 20]) for (const al of [2, 5, 8]) { const r = M.seignorage({ d: d / 100, k: k / 100, alpha: al }); br.add(d <= 0 ? 'zero' : r.roots ? (d / 100 > 0.75 * r.max.d ? 'near' : 'low') : (r.hyperAt ? 'hyper' : 'slow')); }
  eq('ch6 branches reachable', [...br].sort().join(','), 'hyper,low,near,slow,zero');
  const cjk = /[㐀-鿿]/;
  ok('no Chinese in app.js', !cjk.test(fs.readFileSync(path.join(dir, 'app.js'), 'utf8')));
  ok('no Chinese in models.js', !cjk.test(fs.readFileSync(path.join(dir, 'models.js'), 'utf8')));
  ok('no Chinese in figures', fs.readdirSync(path.join(dir, 'figures')).every(f => !cjk.test(fs.readFileSync(path.join(dir, 'figures', f), 'utf8'))));
  // the layout writes doc.title and doc.desc into <title> and the meta description; everything else must come from copy
  const body = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<title>[\s\S]*?<\/title>/, '').replace(/<meta name="description"[^>]*>/, '');
  const left = body.match(/[㐀-鿿][^<]{0,20}/g) || [];
  ok('no hand-typed Chinese in index.html (except the toggle and provenance)', left.every(s => /^中/.test(s)));
  ok('diagrams: at least six', (html.match(/<figure class="dia"/g) || []).length >= 6);
}

console.log(`${n - fails}/${n} checks passed`);
if (fails) process.exit(1);
