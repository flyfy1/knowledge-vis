'use strict';
// Model test for the noise-into-pictures essay.
// Usage (from the repo root):  node computing/ml/noise-into-pictures/tests/models.cjs [--retrain]
// Recomputes every number the prose states from models.js and the shipped weights.js, and checks that copy.zh.js
// says exactly that. Also: the hand-written backprop against finite differences, Tweedie = posterior mean, the
// sampler at η = 1 / 0, copy keys and placeholders, and no Chinese outside copy.zh.js (apart from the static
// <title> and meta description in index.html). --retrain re-runs train.cjs into a scratch file and compares it
// with weights.js byte for byte (takes about 8 minutes).
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
const DIR = path.join(__dirname, '..');
const M = require(path.join(DIR, 'models.js'));
const W8 = require(path.join(DIR, 'weights.js'));
global.window = {}; require(path.join(DIR, 'copy.zh.js')); const ZH = global.window.ESSAY_COPY.zh;
const S = M.SPIRAL;
let fails = 0, passes = 0;
const ok = (c, msg) => { if (c) passes++; else { fails++; console.log('FAIL', msg); } };
const fmt = (x, d = 0) => (Math.abs(x) < 0.5 * Math.pow(10, -d) ? 0 : x).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const pct = (x, d = 0) => fmt(100 * x, d) + '%';
const plain = s => String(s).replace(/<[^>]+>/g, '');
function says(key, str, what) { const txt = plain(ZH[key] || ''); ok(txt.includes(str), `${key} should say "${str}" (${what})`); }
const log = (...a) => console.log('  ', ...a);

/* ── structure: keys, placeholders, no Chinese outside copy ── */
{
  const html = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(DIR, 'app.js'), 'utf8');
  const keys = new Set();
  for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) keys.add(m[1]);
  for (const m of app.matchAll(/\bt\('([\w.]+)'/g)) keys.add(m[1]);
  for (const m of app.matchAll(/'(ch\d+\.(?:say|kind|unit|btn|cv|tier|pub)\.[\w]+)'/g)) keys.add(m[1]);
  for (const it of ZH.frontier || []) keys.add('ch10.tier.' + it.tier);
  for (const k of keys) if (!k.endsWith('.')) ok(ZH[k] != null, `copy.zh.js lacks key ${k}`);
  // dynamic say keys: ch6.say.<kind>
  for (const k of ['sde', 'ode', 'fm', 'reflow']) ok(ZH['ch6.say.' + k] != null, 'copy lacks ch6.say.' + k);
  // every {placeholder} in a template is a name app.js supplies somewhere as an object key
  const supplied = new Set([...app.matchAll(/[{,]\s*(\w+)\s*:/g)].map(m => m[1]));
  for (const [k, v] of Object.entries(ZH)) if (typeof v === 'string') for (const m of v.matchAll(/\{(\w+)\}/g)) ok(supplied.has(m[1]), `${k}: placeholder {${m[1]}} is never supplied`);
  ok(Array.isArray(ZH.frontier) && ZH.frontier.length >= 10 && ZH.frontier.every(i => i.group && i.tier && i.when && i.text), 'frontier data block well formed');
  ok(Array.isArray(ZH.records) && ZH.records.length >= 4, 'records table present');
  const CJK = /[　-〿㐀-鿿＀-￯]/;
  for (const f of ['app.js', 'models.js', 'train.cjs', 'weights.js']) ok(!CJK.test(fs.readFileSync(path.join(DIR, f), 'utf8')), `${f} contains Chinese`);
  const htmlRest = html.replace(/<title>[^<]*<\/title>/, '').replace(/<meta name="description"[^>]*>/, '').replace(/>中<\/button>/, '></button>');
  const leak = htmlRest.match(new RegExp('.{0,30}' + CJK.source + '.{0,10}'));
  ok(!leak, 'index.html has Chinese outside <title>/meta description: ' + (leak && leak[0]));
  ok(html.includes('<title>' + ZH['doc.title'] + '</title>'), 'static <title> equals doc.title');
  ok(html.includes('content="' + ZH['doc.desc'] + '"'), 'static meta description equals doc.desc');
  ok(/copy\.en\.js/.test(html), 'page tries copy.en.js');
}

/* ── mechanics ── */
{
  // backprop against central differences
  const p = M.netCreate(3), r = M.rng(4), n = 5, X = new Float64Array(n * 10), Y = new Float64Array(n * 2);
  for (let i = 0; i < X.length; i++) X[i] = r.n(); for (let i = 0; i < Y.length; i++) Y[i] = r.n();
  const H = M.NET.hid, cache = { z1: new Float64Array(n * H), h1: new Float64Array(n * H), z2: new Float64Array(n * H), h2: new Float64Array(n * H) };
  const g = {}; for (const k of ['W1', 'b1', 'W2', 'b2', 'W3', 'b3']) g[k] = new Float64Array(p[k].length);
  M.netGrad(p, X, Y, n, cache, g);
  let worst = 0;
  for (const k of ['W1', 'b1', 'W2', 'b2', 'W3', 'b3']) for (const i of new Set([0, Math.min(7, p[k].length - 1), p[k].length - 1])) {
    const o = p[k][i], h = 1e-6, L = () => { const out = new Float64Array(n * 2); M.netForward(p, X, n, out); let s = 0; for (let j = 0; j < out.length; j++) s += (out[j] - Y[j]) ** 2; return s / n; };
    p[k][i] = o + h; const a = L(); p[k][i] = o - h; const b = L(); p[k][i] = o;
    const num = (a - b) / (2 * h); worst = Math.max(worst, Math.abs(num - g[k][i]) / Math.max(1e-6, Math.abs(num) + Math.abs(g[k][i])));
  }
  ok(worst < 1e-5, 'backprop matches finite differences, worst relative error ' + worst);
  // Tweedie = posterior mean
  let tw = 0; for (const t of [10, 300, 900]) for (const xy of [[0.3, 0.5], [-1, 1.2], [2, -2]]) { const a = M.vp.posteriorMean(S, xy[0], xy[1], M.alphabar[t]), b = M.vp.tweedie(S, xy[0], xy[1], M.alphabar[t]); tw = Math.max(tw, Math.hypot(a[0] - b[0], a[1] - b[1])); }
  ok(tw < 1e-9, 'Tweedie formula equals the posterior mean, max gap ' + tw);
  // ε* = −√(1−ᾱ)·score, checked against a numerical gradient of log p_t
  { const t = 400, ab = M.alphabar[t], x = 0.4, y = -0.2, h = 1e-5, lp = (u, v) => M.logpMix(S, u, v, Math.sqrt(ab), 1 - ab);
    const s = M.vp.score(S, x, y, ab), nx = (lp(x + h, y) - lp(x - h, y)) / (2 * h), ny = (lp(x, y + h) - lp(x, y - h)) / (2 * h);
    ok(Math.hypot(s[0] - nx, s[1] - ny) < 1e-6, 'score = gradient of log p_t'); }
  // sequential noising reaches the closed form's variance
  { const x = M.sampleMix(S, 4000, M.rng(1)); const r = M.rng(2); for (let t = 1; t <= M.T; t++) M.vp.noiseStep(x, t, r); ok(Math.abs(M.totalVar(x) / 2 - 1) < 0.06, 'step-by-step noising ends at unit variance'); }
  // η = 0 is deterministic in the seed of the start only; η = 1 differs from it
  { const a = M.sample(M.vp.epsFn(S), 50, 20, 0, 9).xs, b = M.sample(M.vp.epsFn(S), 50, 20, 1, 9).xs; let d = 0; for (let i = 0; i < a.length; i++) d += Math.abs(a[i] - b[i]); ok(d > 1, 'DDPM (η=1) and DDIM (η=0) differ'); }
  // weights load and have the right size
  for (const k of ['eps', 'fm', 'reflow', 'memo16', 'memo128', 'memo1024']) ok(W8[k] && M.loadNet(W8[k]).W1.length === 480, 'weights.js has net ' + k);
}

/* ── chapter 1: rejection sampling ── */
{
  const a2 = M.rejection.acceptance2d(S), b2 = Math.pow(10, M.rejection.log10AcceptanceBlob(2)), b1 = Math.pow(10, M.rejection.log10AcceptanceBlob(1));
  const l784 = M.rejection.log10AcceptanceBlob(784), lbig = M.rejection.log10AcceptanceBlob(786432);
  log('ch1 acceptance spiral', a2.toFixed(4), 'blob 2-D', b2.toFixed(4), 'per dim', b1.toFixed(3), 'log10 784', l784.toFixed(2), 'log10 786432', lbig.toFixed(2));
  says('ch1.p3', pct(a2, 1), 'spiral acceptance'); says('ch1.p3', pct(b2, 1), 'blob acceptance in 2-D'); says('ch1.p3', '约 ' + fmt(b1, 2), 'factor per dimension');
  says('ch1.p3', '10⁻' + String(Math.round(-l784)).split('').map(c => '⁰¹²³⁴⁵⁶⁷⁸⁹'[c]).join(''), '784 dimensions');
  says('ch1.p3', '10⁻' + String(Math.round(-lbig)).split('').map(c => '⁰¹²³⁴⁵⁶⁷⁸⁹'[c]).join(''), '786,432 dimensions');
  // the measured rate converges to the exact one
  const j = M.rejection.job(S, 1).run(200000); ok(Math.abs(j.kept / j.tried - a2) < 0.003, 'rejection measured rate ≈ exact ' + (j.kept / j.tried));
  ok(512 * 512 * 3 === 786432, '512×512×3');
}

/* ── chapter 2: forward process ── */
{
  const A = M.alphabar;
  says('ch2.p3', '≈ ' + fmt(A[100], 2), 'ᾱ₁₀₀'); says('ch2.p3', '√ᾱ ≈ ' + fmt(Math.sqrt(A[250]), 2), '√ᾱ at 250'); says('ch2.p3', '只剩 ' + fmt(Math.sqrt(A[500]), 2), '√ᾱ at 500');
  const e = A[1000].toExponential(1).split('e-'); says('ch2.p3', e[0] + '×10⁻' + e[1].split('').map(c => '⁰¹²³⁴⁵⁶⁷⁸⁹'[c]).join(''), 'ᾱ₁₀₀₀');
  // first slider position (step 10) where the cloud's distance to N(0, I) is within 1.1× that of the pure noise itself
  const N = 1000, x0 = M.sampleMix(S, N, M.rng(21)), eps = new Float64Array(2 * N); { const r = M.rng(22); for (let i = 0; i < eps.length; i++) eps[i] = r.n(); }
  const G = M.mixture([0, 0], null, 1), GREF = M.swTruth(G, eps), p = new Float64Array(2 * N);
  let first = null;
  for (let t = 0; t <= 1000 && first == null; t += 10) { const a = Math.sqrt(A[t]), b = Math.sqrt(1 - A[t]); for (let i = 0; i < p.length; i++) p[i] = a * x0[i] + b * eps[i]; if (M.swTruth(G, p) <= 1.1 * GREF) first = t; }
  log('ch2 first t indistinguishable from noise', first, 'GREF', GREF.toFixed(3));
  says('ch2.p3', '到第 ' + first + ' 步左右', 'indistinguishable step');
}

/* ── chapter 3: Langevin ── */
{
  const plainShare = M.shareBelow(M.langevinJob(M.SE, 600, false, 77).run().xs), annShare = M.shareBelow(M.langevinJob(M.SE, 600, true, 77).run().xs);
  log('ch3 share lower-left: plain', plainShare, 'annealed', annShare);
  says('ch3.p3', pct(plainShare), 'plain Langevin share'); says('ch3.p3', pct(annShare), 'annealed share');
  const L = M.LANGEVIN; says('ch3.p3', `σ 从 ${L.sigMax} 分十级降到 ${L.sigMin}，每级 ${L.perLevel} 步`, 'ladder'); ok(L.levels === 10, 'ten levels');
  ok(Math.abs(annShare - 0.2) < 0.06 && Math.abs(plainShare - 0.2) > 0.15, 'annealing fixes the weights, plain does not');
}

/* ── chapter 4: loss floor, in-page training, shipped net ── */
const epsNet = M.netFn(M.loadNet(W8.eps), 'eps');
{
  const floor = M.epsLossFloor(S, 20000);
  says('ch4.p5', fmt(floor, 3), 'loss floor');
  const tr = M.trainer('eps', { steps: 3000, batch: 128, seed: 5, lr: 3e-3, lrEnd: 1e-4, data: (r, pt) => { const s = M.sampleMix(S, 1, r); pt[0] = s[0]; pt[1] = s[1]; } });
  while (!tr.done) tr.run(500);
  log('ch4 floor', floor.toFixed(4), 'live EMA after 3000', tr.ema.toFixed(4));
  says('ch4.p5', '损失停在约 ' + fmt(tr.ema, 2), 'live training loss');
  const p = M.loadNet(W8.eps), f = M.netFn(p, 'eps'), o2 = new Float64Array(2);
  const shipped = M.epsLoss(S, (x, t, o) => { f(x, t, o2); o[0] = o2[0]; o[1] = o2[1]; }, 20000);
  log('ch4 shipped loss', shipped.toFixed(4));
  says('ch4.p5', fmt(shipped, 3), 'shipped loss'); ok(shipped > floor && shipped - floor < 0.02, 'shipped net is close to the floor');
  says('ch4.p5', '60,000 步（每步 256 个样本）', 'training length');
  const trainSrc = fs.readFileSync(path.join(DIR, 'train.cjs'), 'utf8'); ok(/STEPS = \+opt\('--steps', 60000\)/.test(trainSrc) && /batch: 256/.test(trainSrc), 'train.cjs uses 60,000 × 256');
  ok(/pairs: 20000/.test(trainSrc), 'train.cjs uses 20,000 reflow pairs'); says('ch6.p4', '20,000 对', 'reflow pairs');
}

/* ── chapters 5–6: steps against quality (figure of merit) ── */
const FLOOR = M.swFloor(S);
const run = (fn, eta, n) => M.swTruth(S, M.sample(fn, M.N_EVAL, n, eta, M.SEED_GEN).xs);
const runFm = (fn, n) => M.swTruth(S, M.fmSample(fn, M.N_EVAL, n, M.SEED_GEN).xs);
const need = (list, f) => { for (const n of list) if (f(n) <= 1.5 * FLOOR) return n; return null; };
{
  says('ch5.p3', fmt(FLOOR, 3), 'floor');
  const memo = new Map(), get = (k, f) => { if (!memo.has(k)) memo.set(k, f()); return memo.get(k); };
  const ddpm = n => get('p' + n, () => run(epsNet, 1, n)), ddim = n => get('i' + n, () => run(epsNet, 0, n));
  const exD = n => get('e' + n, () => run(M.vp.epsFn(S), 0, n));
  const fmNet = M.netFn(M.loadNet(W8.fm), 'fm'), reNet = M.netFn(M.loadNet(W8.reflow), 'fm');
  const fmD = n => get('f' + n, () => runFm(fmNet, n)), reD = n => get('r' + n, () => runFm(reNet, n));
  const nP = need(M.NFE_LIST, ddpm), nI = need(M.NFE_LIST, ddim), nE = need(M.NFE_LIST, exD), nF = need(M.FM_NFE_LIST, fmD), nR = need(M.FM_NFE_LIST, reD);
  log('floor', FLOOR.toFixed(4), '| steps needed: DDPM', nP, 'DDIM', nI, 'exact DDIM', nE, 'FM', nF, 'reflow', nR);
  log('net NFE→SW  DDPM', M.NFE_LIST.map(n => n + ':' + ddpm(n).toFixed(3)).join(' '));
  log('net NFE→SW  DDIM', M.NFE_LIST.map(n => n + ':' + ddim(n).toFixed(3)).join(' '));
  log('net NFE→SW  FM  ', M.FM_NFE_LIST.slice(0, 5).map(n => n + ':' + fmD(n).toFixed(3)).join(' '), '| reflow 1:', reD(1).toFixed(3));
  says('ch5.p4', `DDPM 要 ${nP} 步`, 'DDPM steps needed'); says('ch5.p4', `DDIM 只要 ${nI} 步`, 'DDIM steps needed');
  says('ch5.p4', `DDIM 的距离是 ${fmt(ddim(10), 3)}，DDPM 是 ${fmt(ddpm(10), 3)}`, '10-step distances');
  says('ch5.p4', `DDIM ${nE} 步就够了`, 'exact DDIM steps'); says('ch5.p4', '约 ' + fmt(ddim(1000), 3), 'net DDIM at 1000');
  ok(ddim(1000) > 1.05 * FLOOR, 'net DDIM at 1000 stays above the floor (model error)');
  says('ch6.p5', `DDPM ${nP}，DDIM ${nI}，流匹配 ${nF}，再拉直后 ${nR}`, 'steps needed, all four');
  const amp = 1 / Math.sqrt(M.alphabar[M.T]); says('ch5.say.one', '约 ' + fmt(amp), '1/√ᾱ_T'); says('ch6.say.ode', '约 ' + fmt(amp), '1/√ᾱ_T');
  says('ch8.p3', `50 步 ${fmt(ddim(50), 3)}`, 'infinite-data net at 50 steps');
  // flow matching with the exact field in one Euler step lands every point on the data mean
  const one = M.fmSample(M.fm.velFn(S), 20, 1, 3).xs; let mx = 0, my = 0; for (let k = 0; k < S.K; k++) { mx += S.w[k] * S.mu[2 * k]; my += S.w[k] * S.mu[2 * k + 1]; }
  let dev = 0; for (let i = 0; i < one.length; i += 2) dev = Math.max(dev, Math.hypot(one[i] - mx, one[i + 1] - my)); ok(dev < 1e-9, 'one exact FM step = data mean');
  ok(reD(1) <= 1.5 * FLOOR && fmD(1) > 10 * FLOOR, 'reflow is good in one step, plain FM is not');
}

/* ── chapter 7: guidance ── */
{
  const tf = M.trueFidelity(), g0 = M.guidance(0), g1 = M.guidance(1), g3 = M.guidance(3), g8 = M.guidance(8);
  log('ch7 true fidelity', tf.toFixed(4), '| w=0', g0.fidelity.toFixed(4), g0.spread.toFixed(3), g0.sw.toFixed(3), '| w=1', g1.fidelity.toFixed(4), g1.spread.toFixed(3), '| w=3', g3.fidelity.toFixed(4), g3.spread.toFixed(3), g3.sw.toFixed(3), '| w=8', g8.fidelity.toFixed(4), g8.spread.toFixed(3));
  says('ch7.p3', pct(tf, 1), 'true fidelity'); says('ch7.p3', '升到约 ' + pct(g1.fidelity), 'fidelity at w=1'); says('ch7.p3', '约 ' + pct(g3.fidelity, 1), 'fidelity at w=3');
  says('ch7.p3', `从 ${fmt(g0.spread, 2)} 倍降到 ${fmt(g3.spread, 2)} 倍`, 'spread 0 → 3');
  ok(g0.sw < g1.sw && g1.sw < g3.sw && g3.sw < g8.sw, 'distance grows with w');
  ok(g0.fidelity < g1.fidelity && g1.fidelity < g3.fidelity && g3.fidelity < g8.fidelity, 'fidelity grows with w');
}

/* ── chapter 8: memorisation ── */
{
  const sets = {}; for (const n of M.MEMO.sizes) sets[n] = M.trainingSet(n, M.MEMO.seed);
  const tru = M.sampleMix(S, M.N_EVAL, M.rng(M.MEMO.seed + 1));
  const base = n => M.copyShare(tru, sets[n], M.MEMO.delta), baseMed = n => M.nnMedian(tru, sets[n]);
  const gen = (n, m) => M.sample(m === 'exact' ? M.vp.epsFn(M.empirical(sets[n])) : M.netFn(M.loadNet(W8['memo' + n]), 'eps'), M.N_EVAL, M.MEMO.steps, 0, M.SEED_GEN).xs;
  const R = {}; for (const n of M.MEMO.sizes) for (const m of ['exact', 'net']) { const xs = gen(n, m); R[n + m] = { copy: M.copyShare(xs, sets[n], M.MEMO.delta), med: M.nnMedian(xs, sets[n]), sw: M.swTruth(S, xs) }; }
  for (const n of M.MEMO.sizes) log(`ch8 N=${n} base ${base(n).toFixed(3)}/${baseMed(n).toFixed(4)} exact ${R[n + 'exact'].copy.toFixed(3)}/${R[n + 'exact'].med.toFixed(4)}/${R[n + 'exact'].sw.toFixed(3)} net ${R[n + 'net'].copy.toFixed(3)}/${R[n + 'net'].med.toFixed(4)}/${R[n + 'net'].sw.toFixed(3)}`);
  says('ch8.p3', pct(R['16exact'].copy), 'exact copy share at 16'); says('ch8.p3', `真样本是 ${fmt(baseMed(16), 3)}`, 'true median at 16');
  ok(R['16exact'].med < 0.0005, 'exact median at 16 is ~0');
  says('ch8.p3', `这个比例是 ${pct(R['128exact'].copy)}（真样本 ${pct(base(128), 1)}）`, 'exact copy at 128 vs base');
  says('ch8.p3', `中位数 ${fmt(R['1024exact'].med, 3)} 对 ${fmt(baseMed(1024), 3)}`, 'exact median at 1024');
  says('ch8.p3', `中位数是 ${fmt(R['128net'].med, 3)}，和真样本的 ${fmt(baseMed(128), 3)}`, 'net median at 128');
  says('ch8.p3', `距离是 ${fmt(R['1024net'].sw, 3)}`, 'net distance at 1024');
  ok(R['16net'].med < 0.5 * baseMed(16), 'net at 16 points hugs the training set');
}

/* ── chapter 9: latent arithmetic ── */
{
  const q = M.latentCost(512, 8, 4, 2);
  says('ch9.p3', fmt(q.pixels), 'pixels'); says('ch9.p3', fmt(q.latent) + ' 个', 'latent'); says('ch9.p3', `少了 ${fmt(q.ratio)} 倍`, 'ratio');
  says('ch9.p3', fmt(q.tokens) + ' 个记号', 'tokens'); says('ch9.p3', fmt(q.pixelTokens) + ' 个记号', 'pixel tokens'); says('ch9.p3', fmt(q.pixelPairs / q.pairs) + ' 倍', 'pair ratio');
}

/* ── optional: retrain and compare byte for byte ── */
if (process.argv.includes('--retrain')) {
  const out = path.join(os.tmpdir(), 'noise-into-pictures-retrain-weights.js');
  if (fs.existsSync(out)) fs.writeFileSync(out, ''); // start from an empty file, not a previous run's weights
  console.log('retraining into', out, '(several minutes)…');
  cp.execFileSync(process.execPath, [path.join(DIR, 'train.cjs'), '--out', out], { stdio: 'inherit' });
  ok(Buffer.compare(fs.readFileSync(out), fs.readFileSync(path.join(DIR, 'weights.js'))) === 0, 'retrained weights equal the shipped weights.js byte for byte');
}

console.log(fails ? `${fails} FAILED, ${passes} passed` : `all ${passes} checks passed`);
process.exit(fails ? 1 : 0);
