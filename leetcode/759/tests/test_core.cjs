'use strict';
// Checks core.js frames against oracle fixtures from test_solution.py.
const fs = require('fs'), assert = require('assert'), path = require('path');
const C = require(path.join(__dirname, '..', 'core.js'));
const fixtures = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
let frames = 0;
const unionOf = ivs => { const s = ivs.map(x => x.slice()).sort((a, b) => a[0] - b[0] || a[1] - b[1]); const out = []; for (const [a, b] of s) { if (out.length && a <= out.at(-1)[1]) out.at(-1)[1] = Math.max(out.at(-1)[1], b); else out.push([a, b]); } return out; };
for (const x of fixtures) {
  const run = C.trace(x.schedule);
  assert.deepStrictEqual(run.answer, x.answer, JSON.stringify(x));
  assert.deepStrictEqual(C.solve(x.schedule), x.answer);
  assert.strictEqual(C.validate(x.schedule), null);
  assert.deepStrictEqual(C.parse(C.format(x.schedule)).schedule, x.schedule);
  const pooled = run.pooled;
  for (let i = 1; i < pooled.length; i++) assert(pooled[i - 1].s <= pooled[i].s);
  for (let i = 0; i < pooled.length; i++) {
    const f = run.frames[i + 1], seen = pooled.slice(0, i + 1).map(p => [p.s, p.e]);
    frames++;
    assert.strictEqual(f.i, i);
    // reach is the furthest end of the processed intervals and never decreases.
    assert.strictEqual(f.reach, Math.max(...seen.map(p => p[1])));
    if (i) assert(f.reach >= run.frames[i].reach);
    // covered equals the union of processed intervals (computed independently, touching merged).
    assert.deepStrictEqual(f.covered, unionOf(seen));
    // free so far equals the holes of that union, and is a prefix of the final answer.
    const u = f.covered, holes = [];
    for (let k = 1; k < u.length; k++) holes.push([u[k - 1][1], u[k][0]]);
    assert.deepStrictEqual(f.free, holes);
    assert.deepStrictEqual(x.answer.slice(0, f.free.length), f.free);
    // The classified case matches the comparison with the previous reach.
    if (i) {
      const r = run.frames[i].reach, s = pooled[i].s, e = pooled[i].e;
      const kind = s > r ? 'gap' : s === r ? 'touch' : e <= r ? 'inside' : 'extend';
      assert.strictEqual(f.kind, kind);
      if (kind === 'gap') assert.deepStrictEqual(f.gap, [r, s]); else assert.strictEqual(f.gap, null);
    } else assert.strictEqual(f.kind, 'first');
    assert.strictEqual(f.history.length, i + 1);
  }
  const before = JSON.stringify(run.frames[1]);
  run.frames.at(-1).free.push([99, 100]); run.frames.at(-1).history.length = 0;
  assert.strictEqual(JSON.stringify(run.frames[1]), before);
}
for (const p of C.presets) assert.strictEqual(C.validate(p), null);
const bad = {'': 'invalidEmpty', '1-3 x': 'invalidFormat', '3-1': 'invalidOrder', '1-31': 'invalidRange', '1-4 3-5': 'invalidOverlap', '1-2;2-3;3-4;4-5;5-6;6-7': 'invalidCount', '1-2 3-4 5-6 7-8 9-10 11-12': 'invalidCount'};
for (const [text, err] of Object.entries(bad)) assert.strictEqual(C.parse(text).error, err, text);
assert.deepStrictEqual(C.parse('1-2 2-3').schedule, [[[1, 2], [2, 3]]]);
assert.throws(() => C.trace([]));
const b = C.brute(C.presets[0]);
assert.deepStrictEqual([b.points.length, b.pieces.length, b.worstChecks], [11, 10, 60]);
process.stdout.write(JSON.stringify({fixtures: fixtures.length, framesChecked: frames}));
