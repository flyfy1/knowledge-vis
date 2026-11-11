'use strict';
// Checks the browser core (core.js) against oracle fixtures produced by test_solution.py.
const fs = require('fs'), assert = require('assert'), path = require('path');
const C = require(path.join(__dirname, '..', 'core.js'));
const fixtures = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
let frames = 0, slots = 0;
for (const x of fixtures) {
  const run = C.trace(x.s1, x.s2);
  assert.strictEqual(run.answer, x.answer, JSON.stringify(x));
  assert.strictEqual(C.solve(x.s1, x.s2), x.answer);
  assert.deepStrictEqual(C.brute(x.s1, x.s2).rows.map(r => r.read), x.reads);
  assert.strictEqual(run.frames.length, x.s1.length + 2);
  assert.strictEqual(run.frames[0].type, 'init');
  assert(run.frames[0].latest.every(v => v === -1));
  for (let j = 0; j < x.s1.length; j++) {
    const f = run.frames[j + 1], prev = run.frames[j];
    frames++;
    assert.strictEqual(f.j, j); assert.strictEqual(f.ch, x.s1[j]);
    assert.deepStrictEqual(f.latest, x.slots[j], `${x.s1}/${x.s2} j=${j}`);
    slots += f.latest.length;
    // A slot's start never moves left (dominance: only later starts replace it).
    f.latest.forEach((v, k) => assert(v >= prev.latest[k]));
    // Changes list equals the actual differences.
    const diff = f.latest.map((v, k) => [k + 1, prev.latest[k], v]).filter(([, a, b]) => a !== b);
    assert.deepStrictEqual(f.changes.map(c => [c.k, c.from, c.to]).sort((a, b) => a[0] - b[0]), diff);
    // Best so far equals the oracle on the prefix s1[0..j].
    const best = f.best ? x.s1.slice(f.best.start, f.best.end + 1) : '';
    let brute = '';
    for (let len = 1; len <= j + 1 && !brute; len++) for (let st = 0; st + len <= j + 1 && !brute; st++) {
      const w = x.s1.slice(st, st + len); let p = 0; for (const ch of w) if (ch === x.s2[p]) p++;
      if (p === x.s2.length) brute = w;
    }
    assert.strictEqual(best, brute, `${x.s1}/${x.s2} prefix ${j}`);
    // History grows by at most one entry per frame and keeps earlier entries.
    assert.deepStrictEqual(f.history.slice(0, prev.history.length), prev.history);
    assert(f.history.length - prev.history.length <= 1);
  }
  // Deep snapshots: mutating a later frame cannot change an earlier one.
  const before = JSON.stringify(run.frames[1]);
  run.frames.at(-1).latest[0] = 999; run.frames.at(-1).history.push({x: 1});
  assert.strictEqual(JSON.stringify(run.frames[1]), before);
}
for (const [s1, s2] of C.presets) assert.strictEqual(C.validate(s1, s2), null);
for (const [s1, s2, err] of [['', 'a', 'invalidLetters'], ['A', 'a', 'invalidLetters'], ['a b', 'a', 'invalidLetters'], ['a'.repeat(21), 'a', 'invalidLength'], ['a', 'a'.repeat(7), 'invalidLength']])
  assert.strictEqual(C.validate(s1, s2), err);
assert.throws(() => C.trace('', 'a'));
process.stdout.write(JSON.stringify({fixtures: fixtures.length, framesChecked: frames, slotValuesChecked: slots}));
