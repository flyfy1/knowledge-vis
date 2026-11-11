'use strict';
// Checks core.js frames against oracle fixtures produced by test_solution.py.
const fs = require('fs'), assert = require('assert'), path = require('path');
const C = require(path.join(__dirname, '..', 'core.js'));
const fixtures = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
let frames = 0, prefixChecks = 0;
for (const x of fixtures) {
  assert.strictEqual(C.validate(x.s), null, x.s);
  const run = C.trace(x.s);
  assert.strictEqual(run.answer, x.answer, x.s);
  assert.strictEqual(C.solve(x.s), x.answer);
  assert.strictEqual(run.frames.length, run.tokens.length + 2);
  const byToken = new Map(x.prefix.map(([k, v, parked]) => [k, [v, parked]]));
  for (let k = 0; k < run.tokens.length; k++) {
    const f = run.frames[k + 1], prev = run.frames[k];
    frames++;
    assert.strictEqual(f.k, k);
    if (byToken.has(k)) {
      const [v, parked] = byToken.get(k);
      assert.strictEqual(f.state.total + f.state.term, v, `${x.s} token ${k}`);
      assert.strictEqual(f.stack.length, parked.length);
      f.stack.forEach((s, d) => assert.strictEqual(s.total + s.term, parked[d], `${x.s} token ${k} parked ${d}`));
      prefixChecks++;
    }
    if (f.type === 'op') { assert.strictEqual(f.state.total, prev.state.total); assert.strictEqual(f.state.term, prev.state.term); }
    if (f.type === 'open') { assert.deepStrictEqual(f.state, {total: 0, term: 0, op: '+'}); assert.deepStrictEqual(f.stack.at(-1), prev.state); }
    if (f.type === 'close') assert.strictEqual(f.stack.length, prev.stack.length - 1);
    if (f.type === 'num' && '*/'.includes(f.step.op)) assert.strictEqual(f.state.total, prev.state.total);
  }
  assert.strictEqual(run.frames.at(-1).stack.length, 0);
  const before = JSON.stringify(run.frames[1]);
  run.frames.at(-1).state.total = 999; run.frames.at(-1).history.push({x: 1});
  assert.strictEqual(JSON.stringify(run.frames[1]), before);
}
for (const p of C.presets) assert.strictEqual(C.validate(p), null);
const bad = {'': 'invalidEmpty', '1+': 'invalidSyntax', '(1+2': 'invalidSyntax', '1)': 'invalidSyntax', '1++2': 'invalidSyntax', '-1+2': 'invalidUnary', '2*(-3)': 'invalidUnary', '1/0': 'invalidDivZero', '1/(2-2)': 'invalidDivZero', '12345': 'invalidNumber', 'a+1': 'invalidChar', '1+(((((((1)))))))': 'invalidDepth', '1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1': 'invalidLength'};
for (const [s, err] of Object.entries(bad)) assert.strictEqual(C.validate(s), err, s);
for (const [a, b, q] of [[7, 2, 3], [-7, 2, -3], [7, -2, -3], [-7, -2, 3], [0, -5, 0]]) assert.strictEqual(C.truncDiv(a, b) + 0, q);
process.stdout.write(JSON.stringify({fixtures: fixtures.length, framesChecked: frames, prefixChecks}));
