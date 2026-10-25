'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const acorn = require('acorn');
const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'copy.js'), 'utf8');
const ast = acorn.parse(source, {ecmaVersion: 'latest'});
const properties = ast.body.find(n => n.type === 'VariableDeclaration').declarations[0].init.properties;
const keys = properties.map(p => p.key.name);
assert.equal(new Set(keys).size, keys.length, 'duplicate COPY key');
const context = {window: {}};
vm.createContext(context);
vm.runInContext(source + ';this.copy = COPY;', context);
vm.runInContext(fs.readFileSync(path.join(root, 'core.js'), 'utf8'), context);
const copy = context.copy;
// Independently remove each possible FIRST balloon; no interval recurrence.
function firstBurst(nums) {
  if (!nums.length) return 0;
  return Math.max(...nums.map((value, i) =>
    (nums[i - 1] ?? 1) * value * (nums[i + 1] ?? 1) +
    firstBurst(nums.filter((_, j) => j !== i))));
}
for (const pair of Object.values(copy)) {
  assert.equal(pair.length, 2);
  assert(pair.every(s => typeof s === 'string'));
}
for (let preset = 0; preset < 4; preset++) {
  for (const [locale, label] of copy['p' + preset].entries()) {
    const [array, advertised] = label.split(' · ');
    const nums = JSON.parse(array);
    const expected = firstBurst(nums);
    assert.equal(Number(advertised), expected, `R312-PRESET-001: locale ${locale}, ${array}`);
    const run = context.window.Burst312.trace(nums);
    assert.equal(run.dp[0][run.n], expected);
    for (let index = 1; index < run.frames.length; index++) {
      const before = run.frames[index - 1], f = run.frames[index], c = f.current;
      assert.equal(f.done, before.done + 1);
      assert.equal(f.total, nums.length * (nums.length + 1) / 2);
      for (const p of c.parts) {
        assert.equal(p.val, before.dp[c.l][p.k] + before.dp[p.k][c.r] + run.v[c.l] * run.v[p.k] * run.v[c.r]);
      }
      assert.equal(c.parts.find(p => p.k === c.bestK).val, c.best);
      assert.equal(f.dp[c.l][c.r], c.best);
      for (let l = 0; l < run.v.length; l++) for (let r = 0; r < run.v.length; r++) {
        if (l !== c.l || r !== c.r) assert.equal(f.dp[l][r], before.dp[l][r]);
      }
    }
  }
}
// Compute the proof example from evolving neighbors, using original identities.
function orderScore(nums, order) {
  const alive = nums.map((value, id) => ({value, id}));
  let score = 0;
  for (const id of order) {
    const i = alive.findIndex(balloon => balloon.id === id);
    assert(i >= 0);
    score += (alive[i - 1]?.value ?? 1) * alive[i].value * (alive[i + 1]?.value ?? 1);
    alive.splice(i, 1);
  }
  return score;
}
assert.equal(orderScore([3,1,5], [0,1]), 8);
assert.equal(orderScore([3,1,5], [0,1,2]), 13);
assert.equal(orderScore([3,1,5], [1,0]), 30);
assert.equal(orderScore([3,1,5], [1,0,2]), 35);
assert.equal(orderScore([0,4,2], [0,2,1]), 12);
// These checks protect the two proof directions and its concrete replacement example.
assert.match(copy.proof[1], /at most/);
assert.match(copy.proof[1], /attain/);
assert.match(copy.proof[0], /不超过/);
assert.match(copy.proof[0], /达到/);
for (const text of copy.proofExample) {
  for (const arithmetic of ['3+5=8', 'dp[0][3]=30', '8+5=13', '30+5=35']) assert(text.includes(arithmetic));
}
console.log('PASS: R312-PRESET-001 all advertised presets vs first-burst oracle, all frame operands/counts; R312-PROOF-001 bilingual proof directions and example; COPY unique pair keys.');
