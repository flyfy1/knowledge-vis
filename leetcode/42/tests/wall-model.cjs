'use strict';
const assert = require('node:assert/strict');
const {inspect} = require('../wall-model.js');
// Independent physical oracle: a unit cell holds water iff a bar reaches
// its level on both sides. Do not reuse the min/max formula under test.
let arrays = 0, columns = 0;
for (let n = 1; n <= 6; n++) for (let v = 0; v < 5 ** n; v++) {
  let remaining = v;
  const a = Array.from({length: n}, () => {const h = remaining % 5; remaining = Math.floor(remaining / 5); return h;});
  const original = [...a];
  for (let i = 0; i < n; i++) {
    let expected = 0;
    for (let y = a[i] + 1; y <= 4; y++) {
      if (a.some((h,j) => j < i && h >= y) && a.some((h,j) => j > i && h >= y)) expected++;
    }
    const state = inspect(a, i);
    assert.equal(state.depth, expected, JSON.stringify({a,i}));
    assert.equal(a[state.leftIndex], state.left);
    assert.equal(a[state.rightIndex], state.right);
    assert.ok(state.leftIndex <= i && state.rightIndex >= i);
    assert.deepEqual(a, original);
    state.height[0] = -1; assert.deepEqual(a, original);
    columns++;
  }
  arrays++;
}
assert.equal(inspect([3,0,2,0,1],2).right,2);
assert.equal(inspect([3,0,2,0,1],2).depth,0);
assert.equal(inspect([3,0,2,0,6],2).depth,1);
assert.throws(() => inspect([],0), RangeError);
assert.throws(() => inspect([1,-1],0), RangeError);
console.log(JSON.stringify({arrays,columns,physicalUnitCellOracle:'passed',nonmutation:'passed'}));
