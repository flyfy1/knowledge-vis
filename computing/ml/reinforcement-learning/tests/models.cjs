'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'models.js'));

let checks = 0;
function ok(cond, msg) {
  checks += 1;
  assert.ok(cond, msg);
}

// ---------------------------------------------------------------------------
// 1. Load copy.zh.js, copy.en.js, index.html, app.js, REGISTRY.json
// ---------------------------------------------------------------------------
function loadCopy(file, prop) {
  const code = fs.readFileSync(path.join(dir, file), 'utf8');
  const sandbox = { window: { ESSAY_COPY: {} } };
  vm.runInNewContext(code, sandbox);
  return sandbox.window.ESSAY_COPY[prop];
}

const zh = loadCopy('copy.zh.js', 'zh');
const en = loadCopy('copy.en.js', 'en');
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const appCode = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
const modelsCode = fs.readFileSync(path.join(dir, 'models.js'), 'utf8');
const reg = JSON.parse(fs.readFileSync(path.join(dir, 'REGISTRY.json'), 'utf8'));

// ---------------------------------------------------------------------------
// 2. Flatten copy keys and verify 100% parity + placeholders + HTML tags + hrefs
// ---------------------------------------------------------------------------
function flatten(obj, prefix = '') {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, flatten(v, key));
    } else {
      out[key] = String(v);
    }
  }
  return out;
}

const zhFlat = flatten(zh);
const enFlat = flatten(en);
const zhKeys = Object.keys(zhFlat).sort();
const enKeys = Object.keys(enFlat).sort();

ok(zhKeys.length === enKeys.length, `Key count mismatch: zh=${zhKeys.length}, en=${enKeys.length}`);
for (const k of zhKeys) {
  ok(enFlat[k] !== undefined, `Missing key in copy.en.js: ${k}`);
  ok(enFlat[k].trim().length > 0, `Empty value in copy.en.js: ${k}`);
}
for (const k of enKeys) {
  ok(zhFlat[k] !== undefined, `Extra key in copy.en.js: ${k}`);
}

function extractVars(str) {
  return [...str.matchAll(/\{([a-zA-Z0-9_]+)\}/g)].map((m) => m[1]).sort();
}
function extractHrefs(str) {
  return [...str.matchAll(/href="([^"]+)"/g)].map((m) => m[1]).sort();
}
function extractTags(str) {
  return [...str.matchAll(/<\/?([a-zA-Z0-9]+)(?:\s|>)/g)].map((m) => m[1]).sort();
}

for (const k of zhKeys) {
  const zv = extractVars(zhFlat[k]);
  const ev = extractVars(enFlat[k]);
  ok(JSON.stringify(zv) === JSON.stringify(ev), `Placeholder mismatch on ${k}: ${zv} vs ${ev}`);

  const zhHrefs = extractHrefs(zhFlat[k]);
  const enHrefs = extractHrefs(enFlat[k]);
  ok(JSON.stringify(zhHrefs) === JSON.stringify(enHrefs), `Href mismatch on ${k}: ${zhHrefs} vs ${enHrefs}`);

  const zt = extractTags(zhFlat[k]);
  const et = extractTags(enFlat[k]);
  ok(JSON.stringify(zt) === JSON.stringify(et), `HTML tag mismatch on ${k}: ${zt} vs ${et}`);
}

// ---------------------------------------------------------------------------
// 3. CJK hygiene checks (ZERO CJK outside copy.zh.js except index.html static meta & #langZh)
// ---------------------------------------------------------------------------
const CJK_RE = /[\u4e00-\u9fff]/;
const enRaw = fs.readFileSync(path.join(dir, 'copy.en.js'), 'utf8');
ok(!CJK_RE.test(enRaw), 'Found CJK character in copy.en.js');
ok(!CJK_RE.test(appCode), 'Found CJK character in app.js');
ok(!CJK_RE.test(modelsCode), 'Found CJK character in models.js');

const strippedHtml = html
  .replace(/<title>[\s\S]*?<\/title>/, '')
  .replace(/<meta name="description" content="[^"]*"\s*\/?>/, '')
  .replace(/<button[^>]*id="langZh"[^>]*>中<\/button>/, '');
ok(!CJK_RE.test(strippedHtml), 'Found unexpected CJK in index.html outside static title/meta/langZh');
ok(!html.includes('page-provenance'), 'index.html draft must not include page-provenance pre-commit');
ok(!html.includes('canvas-label-guard'), 'index.html must not use canvas-label-guard.js');

// ---------------------------------------------------------------------------
// 4. Verify all data-t, data-key, say(), and t() keys exist
// ---------------------------------------------------------------------------
for (const m of html.matchAll(/data-t="([^"]+)"/g)) {
  const k = m[1];
  ok(zhFlat[k] !== undefined && enFlat[k] !== undefined, `Missing data-t key: ${k}`);
}
for (const m of html.matchAll(/data-key="([^"]+)"/g)) {
  const k = m[1];
  ok(zhFlat[k] !== undefined && enFlat[k] !== undefined, `Missing data-key: ${k}`);
}
for (const m of appCode.matchAll(/say\(\s*'[^']+'\s*,\s*'([^']+)'/g)) {
  const k = m[1];
  ok(zhFlat[k] !== undefined && enFlat[k] !== undefined, `Missing say() key: ${k}`);
}
for (const m of appCode.matchAll(/\bt\(\s*'([^']+)'\s*[,)]/g)) {
  const k = m[1];
  ok(zhFlat[k] !== undefined && enFlat[k] !== undefined, `Missing t() key: ${k}`);
}
for (const regItem of Object.values(M.FRONTIER.regimes)) {
  for (const prefix of [`c9.ver_${regItem.verifier}`, `c9.cost_${regItem.sampleCost}`, `c9.risk_${regItem.failureRisk}`]) {
    ok(zhFlat[prefix] !== undefined && enFlat[prefix] !== undefined, `Missing frontier regime key: ${prefix}`);
  }
}

// ---------------------------------------------------------------------------
// 5. Verify cross-links resolve to real files + REGISTRY anchors & titles match
// ---------------------------------------------------------------------------
const allHrefs = new Set();
for (const m of html.matchAll(/href="([^"]+)"/g)) allHrefs.add(m[1]);
for (const k of zhKeys) {
  for (const h of extractHrefs(zhFlat[k])) allHrefs.add(h);
}
for (const href of allHrefs) {
  if (href.startsWith('#')) {
    ok(html.includes(`id="${href.slice(1)}"`), `Missing local anchor ${href}`);
  } else {
    const clean = href.split('#')[0];
    const target = path.resolve(dir, clean, 'index.html');
    ok(fs.existsSync(target), `Cross-link target missing: ${href} -> ${target}`);
    if (href.includes('#')) {
      const frag = href.split('#')[1];
      const targetHtml = fs.readFileSync(target, 'utf8');
      ok(targetHtml.includes(`id="${frag}"`) || targetHtml.includes(`id='${frag}'`), `Target fragment #${frag} missing in ${href}`);
    }
  }
}

ok(reg.title.zh === zh.doc.title && reg.title.en === en.doc.title, 'REGISTRY title must match doc.title');
ok(reg.desc.zh === zh.doc.desc && reg.desc.en === en.doc.desc, 'REGISTRY desc must match doc.desc');
for (const c of reg.concepts) {
  ok(c.anchor.startsWith('#'), `Concept anchor invalid: ${c.anchor}`);
  ok(html.includes(`id="${c.anchor.slice(1)}"`), `REGISTRY anchor missing in HTML: ${c.anchor}`);
}

// ---------------------------------------------------------------------------
// 6. Mathematical invariants + exact derivation of EVERY prose number
// ---------------------------------------------------------------------------
const f = M.facts();

function assertHasNumber(key, val, fmtFn) {
  const s = fmtFn ? fmtFn(val) : String(val);
  ok(zhFlat[key].includes(s), `Prose zh[${key}] missing model number "${s}"`);
  ok(enFlat[key].includes(s), `Prose en[${key}] missing model number "${s}"`);
}

// Ch1 Bandits
assertHasNumber('c1.p2', f.banditArms);
assertHasNumber('c1.p2', f.banditHorizon);
assertHasNumber('c1.p2', f.banditBestMean.toFixed(2));
assertHasNumber('c1.p2', f.banditGreedyRegret.toFixed(1));
assertHasNumber('c1.p2', f.banditGreedyOptPct + '%');
assertHasNumber('c1.p2', f.banditEpsRegret.toFixed(1));
assertHasNumber('c1.p2', f.banditUcbRegret.toFixed(1));
assertHasNumber('c1.p2', f.banditUcbOptPct + '%');
ok(f.banditUcbRegret < f.banditEpsRegret && f.banditEpsRegret < f.banditGreedyRegret, 'UCB1 < eps-greedy < pure greedy regret');

// Ch2 MDP & Bellman
assertHasNumber('c2.p3', f.optStartV.toFixed(2));
assertHasNumber('c2.p3', f.naiveStartV.toFixed(2));
assertHasNumber('c2.p3', f.noSlipEightStepV.toFixed(2));
assertHasNumber('c2.p3', f.lowGammaStartV.toFixed(2));
ok(f.optStartV > f.naiveStartV + 5, 'Optimal policy strongly beats naive Manhattan policy');
ok(f.lowGammaStartV < 0, 'Myopic gamma=0.5 makes start value negative');

// Ch3 Dynamic Programming
assertHasNumber('c3.p2', f.viIters);
assertHasNumber('c3.p2', f.piIters);
const dp = M.dpIterate({ gamma: 0.9, slip: 0.15, stepCost: -0.1, maxIters: 45 });
const viFinal = dp.viFrames[dp.viFrames.length - 1];
const piFinal = dp.piFrames[dp.piFrames.length - 1];
for (let r = 0; r < 5; r++) {
  for (let c = 0; c < 5; c++) {
    ok(Math.abs(viFinal.V[r][c] - dp.Vstar[r][c]) < 1e-3, `VI converged to V* at (${r},${c})`);
    ok(Math.abs(piFinal.V[r][c] - dp.Vstar[r][c]) < 1e-6, `PI converged to exact V* at (${r},${c})`);
  }
}

// Ch4 Cliff Walking
assertHasNumber('c4.p3', f.cwEpisodes);
assertHasNumber('c4.p3', f.cwQGreedyRet);
assertHasNumber('c4.p3', f.cwSarsaGreedyRet);
assertHasNumber('c4.p3', f.cwQOnlineLast50.toFixed(1));
assertHasNumber('c4.p3', f.cwSarsaOnlineLast50.toFixed(1));
ok(f.cwQGreedyRet === -13 && f.cwSarsaGreedyRet === -17, 'Cliff walking exact greedy path lengths (-13 vs -17)');
ok(f.cwSarsaOnlineLast50 > f.cwQOnlineLast50, 'SARSA beats Q-Learning online under epsilon exploration');

// Ch5 Policy Gradient & Baselines
assertHasNumber('c5.p2', f.pgNoBaseStd.toFixed(2));
assertHasNumber('c5.p2', f.pgWithBaseStd.toFixed(2));
assertHasNumber('c5.p2', f.pgVarReduction.toFixed(1));
ok(f.pgVarReduction > 20, 'Mean baseline shrinks variance substantially');
const pgCheck = M.policyGradientLab({ batchSize: 10, steps: 40, lr: 0.14, seed: 314 });
for (let k = 0; k < 4; k++) {
  ok(Math.abs(pgCheck.statsWithBase.exactGrad[k] - pgCheck.statsNoBase.exactGrad[k]) < 1e-12, 'Exact gradient independent of baseline');
}

// Ch6 PPO & GRPO
assertHasNumber('c6.p1', f.ppoClipLow.toFixed(2));
assertHasNumber('c6.p1', f.ppoClipHigh.toFixed(2));
assertHasNumber('c6.p2', f.ppo7BMemoryGB);
assertHasNumber('c6.p2', f.grpo7BMemoryGB);
assertHasNumber('c6.p2', f.grpoMemorySavingPct + '%');
const ppoPos = M.ppoObjectiveLab({ epsClip: 0.2, klBeta: 0.05, advantage: 1.0 });
ok(ppoPos.points[ppoPos.points.length - 1].ppoClip <= 1.2 + 1e-9, 'PPO positive clip caps upside at 1+eps');
const ppoNeg = M.ppoObjectiveLab({ epsClip: 0.2, klBeta: 0.05, advantage: -1.0 });
ok(ppoNeg.points[0].ppoClip <= -0.8 + 1e-9, 'PPO negative clip caps upside ratio-shrinkage at 1-eps');

// Ch7 MCTS vs Minimax
assertHasNumber('c7.p2', f.mctsLowNodes);
assertHasNumber('c7.p2', '#' + (f.mctsLowBestMove + 1));
assertHasNumber('c7.p2', f.mctsHighNodes);
assertHasNumber('c7.p2', '#' + (f.mctsHighBestMove + 1));
ok(f.mctsHighOptimal === true, 'MCTS at budget=250 finds exact Minimax move');
ok(!f.mctsOracleMoves.includes(f.mctsLowBestMove), 'MCTS at low budget=15 makes a suboptimal move');

// Ch8 Reward Hacking & Goodhart
assertHasNumber('c8.p2', f.rhCritNoKl.toFixed(2));
assertHasNumber('c8.p2', f.rhHackCoins);
assertHasNumber('c8.p2', f.rhHackProxyRet.toFixed(1));
assertHasNumber('c8.p2', f.rhCleanTrueRet.toFixed(1));
assertHasNumber('c8.p2', f.rhHackTrueRet.toFixed(1));
assertHasNumber('c8.p2', f.rhKlSavedTrueRet.toFixed(1));
const rhBelow = M.rewardHackingGrid({ coinReward: 0.80, goalReward: 10, klReg: 0, gamma: 0.92 });
const rhAbove = M.rewardHackingGrid({ coinReward: 0.86, goalReward: 10, klReg: 0, gamma: 0.92 });
ok(rhBelow.isHacking === false && rhBelow.reachedGoal === true, 'Below critical threshold finishes race');
ok(rhAbove.isHacking === true && rhAbove.reachedGoal === false, 'Above critical threshold hacks coins forever');

// Ch9 Frontier date check
ok(M.FRONTIER.asOf === '2026-11-11', 'Frontier snapshot date matches 2026-11-11');
ok(zhFlat['c9.p1'].includes('2026 年 11 月 11 日') && enFlat['c9.p1'].includes('2026-11-11'), 'Ch9 date present in both languages');
for (const tr of M.FRONTIER.tracks) {
  ok(
    Object.values(zhFlat).some((s) => s.includes(tr.arxiv)) && Object.values(enFlat).some((s) => s.includes(tr.arxiv)),
    `Missing citation ${tr.arxiv} in prose`
  );
}

// ---------------------------------------------------------------------------
// 7. Live-sentence branch reachability checks across real control states
// ---------------------------------------------------------------------------
const bZero = M.banditSim({ eps: 0, ucbC: 0.75 });
ok(bZero.eps === 0, 'c1.sayNoEps reachable');
const bHigh = M.banditSim({ eps: 0.35, ucbC: 0.75 });
ok(bHigh.eps >= 0.28, 'c1.sayHighEps reachable');

const mNaive = M.mdpEvaluate({ policyMode: 'alwaysGoal', gamma: 0.9, slip: 0.15 });
ok(mNaive.startValue < 0, 'c2.sayNaive reachable');
const mMyopic = M.mdpEvaluate({ policyMode: 'optimal', gamma: 0.45, slip: 0.15 });
ok(mMyopic.optStartValue < 0, 'c2.sayMyopic reachable');

const cwLow = M.cliffWalkCompare({ alpha: 0.4, eps: 0.02, episodes: 120, runs: 6 });
ok(cwLow.eps <= 0.04, 'c4.sayLowEps reachable');

const rhKl = M.rewardHackingGrid({ coinReward: 1.2, klReg: 0.6, gamma: 0.92 });
ok(!rhKl.isHacking && 1.2 > rhKl.critNoKl, 'c8.sayKlSaved reachable');

console.log(`PASS: ${checks} checks verified (all prose numbers pinned to models.js, 100% zh/en parity, zero unintended CJK, all cross-links & branches verified).`);
