'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'models.js'));

// Load copy.zh.js and copy.en.js cleanly in VM
function loadCopy(file, varName) {
  const code = fs.readFileSync(path.join(dir, file), 'utf8');
  const ctx = { window: {} };
  vm.runInNewContext(code, ctx);
  return ctx.window[varName];
}

const zh = loadCopy('copy.zh.js', 'COPY_ZH');
const en = loadCopy('copy.en.js', 'COPY_EN');

let passed = 0;
function check(name, fn) {
  fn();
  passed++;
  console.log('ok - ' + name);
}

function keysOf(obj, prefix = '') {
  const out = [];
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) out.push(...keysOf(v, p));
    else out.push(p);
  }
  return out.sort();
}

check('copy.zh.js and copy.en.js have identical key structure', () => {
  assert.deepStrictEqual(keysOf(zh), keysOf(en));
});

check('no CJK in copy.en.js, app.js, models.js, or index.html (except 中 toggle)', () => {
  const CJK = /[\u3000-\u303f\u3400-\u9fff\uff00-\uffef]/;
  for (const f of ['copy.en.js', 'app.js', 'models.js']) {
    const txt = fs.readFileSync(path.join(dir, f), 'utf8');
    assert.ok(!CJK.test(txt), `${f} must contain no CJK characters`);
  }
  const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8')
    .replace('<button type="button" data-lang="zh">中</button>', '')
    .replace(/<details class="page-provenance"[\s\S]*?<\/details>/, '');
  assert.ok(!CJK.test(html), 'index.html must contain no CJK outside #langToggle and static .page-provenance label');
});

check('Ch1 kvBudget matches calibrated 64K and 256K footprints', () => {
  const f64 = M.kvBudget({ arch: 'full', contextLen: 65536, precision: 'q8_0', slots: 1 });
  const h64 = M.kvBudget({ arch: 'hybrid31', contextLen: 65536, precision: 'q8_0', slots: 1 });
  assert.strictEqual(Math.round(f64.totalKvMiB), 4352);
  assert.strictEqual(Math.round(h64.totalKvMiB), 1088);
  assert.strictEqual(Number(h64.totalRecMiB.toFixed(2)), 50.25);
  assert.strictEqual(Math.round(h64.kvSavingsPct), 75);
  const f256 = M.kvBudget({ arch: 'full', contextLen: 262144, precision: 'q8_0', slots: 1 });
  assert.ok(f256.exceedsRam, 'Full 256K Q8_0 exceeds 24 GB RAM');
});

check('Ch2 linearAttentionTrace satisfies (QK^T)V == Q(K^T V) within machine precision', () => {
  const tr = M.linearAttentionTrace({ seqLen: 16, dim: 4, flopSeqLen: 16384, headDim: 128 });
  assert.ok(tr.maxDiff < 1e-12, 'maxDiff = ' + tr.maxDiff);
  assert.strictEqual(Math.round(tr.flopRatio), 128);
});

check('Ch3 associativeRecallSim degrades when M > d or on key overwrite', () => {
  const s8 = M.associativeRecallSim({ dim: 8, writes: 8, overwrite: false });
  const s24 = M.associativeRecallSim({ dim: 8, writes: 24, overwrite: false });
  assert.ok(s8.finalAvgCos > s24.finalAvgCos, 'overload lowers cosine');
  const ov = M.associativeRecallSim({ dim: 8, writes: 8, overwrite: true });
  assert.ok(ov.finalFirstKeyCos < 0.9, 'additive overwrite blurs key 0');
});

check('Ch4 deltaRuleComparison beats pure addition on key updates', () => {
  const res = M.deltaRuleComparison({ dim: 8, beta: 1.0, mode: 'update', writes: 16 });
  assert.ok(res.finalDeltaCos > res.finalAddCos + 0.25);
  assert.ok(res.finalDeltaMse < res.finalAddMse / 10);
});

check('Ch5 gatedDeltaSim lowers stale energy vs Pure Delta and beats Pure Decay on active recall', () => {
  const res = M.gatedDeltaSim({ dim: 8, alpha: 0.96, beta: 0.9, shiftDip: true });
  assert.ok(res.finalStaleGDelta < res.finalStaleDelta);
  assert.ok(res.finalActiveCosGDelta > res.finalActiveCosDecay + 0.2);
});

check('Ch6 chunkwiseSim matches serial recurrence across all chunk sizes', () => {
  for (const c of [1, 2, 4, 8, 16]) {
    const res = M.chunkwiseSim({ chunkSize: c, decay: 0.92, scaleSeqLen: 65536 });
    assert.ok(res.maxDiff < 1e-12, `C=${c} maxDiff=${res.maxDiff}`);
    assert.strictEqual(res.serialSteps, 65536 / c);
  }
});

check('Ch7 needleHybridSim recovers exact recall with 3:1 hybrid while saving 75% KV', () => {
  const pure = M.needleHybridSim({ dim: 8, facts: 32, ratio: '0:1' });
  const hyb = M.needleHybridSim({ dim: 8, facts: 32, ratio: '3:1' });
  assert.ok(pure.linearExactPct < 30);
  assert.strictEqual(Math.round(hyb.hybridExactPct), 100);
  assert.strictEqual(Math.round(hyb.kvSavedPct), 75);
});

check('Ch8 decodeSpeedModel shows 3:1 hybrid speedup grows with context length', () => {
  const d4 = M.decodeSpeedModel({ contextLen: 4096, memBW_GBs: 150 });
  const d64 = M.decodeSpeedModel({ contextLen: 65536, memBW_GBs: 150 });
  const d128 = M.decodeSpeedModel({ contextLen: 131072, memBW_GBs: 150 });
  assert.ok(d64.speedup > d4.speedup);
  assert.ok(d128.speedup > d64.speedup);
});

check('Every fact placeholder in prose exists in M.facts() and REGISTRY anchors exist in HTML', () => {
  const facts = M.facts();
  const proseKeys = ['p1', 'p2', 'p3', 'law', 'limit'];
  for (let ch = 1; ch <= 9; ch++) {
    for (const pk of proseKeys) {
      for (const dict of [zh, en]) {
        const s = dict['ch' + ch][pk];
        if (!s) continue;
        const matches = [...s.matchAll(/\{(\w+)\}/g)];
        for (const m of matches) {
          assert.ok(facts[m[1]] !== undefined, `missing fact ${m[1]} in ch${ch}.${pk}`);
        }
      }
    }
  }
  const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  const reg = JSON.parse(fs.readFileSync(path.join(dir, 'REGISTRY.json'), 'utf8'));
  assert.strictEqual(reg.title.zh, zh.meta.title);
  assert.strictEqual(reg.title.en, en.meta.title);
  for (const c of reg.concepts) {
    const id = c.anchor.replace(/^#/, '');
    assert.ok(html.includes(`id="${id}"`), `missing anchor ${c.anchor}`);
  }
});

console.log(`ALL ${passed} CHECKS PASSED`);
