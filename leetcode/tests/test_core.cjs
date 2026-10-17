'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const core = require('../2916/core.js');
let cases = 0;
function check(nums) {
  const frames = core.rangeFrames(nums).filter(f => f.applied);
  const tree = new core.SegmentTree(nums.length);
  const last = new Map();
  let answer = 0;
  for (const f of frames) {
    const p = last.has(nums[f.r]) ? last.get(nums[f.r]) : -1;
    tree.add(p+1,f.r);
    const expected = nums.map((_,l) => l<=f.r ? new Set(nums.slice(l,f.r+1)).size : 0);
    assert.deepEqual(f.after, expected);
    assert.deepEqual(tree.values(), expected);
    assert.equal(tree.nodes[1].s, expected.reduce((a,b)=>a+b,0));
    assert.equal(tree.nodes[1].q, expected.reduce((a,b)=>a+b*b,0));
    assert.equal(tree.nodes[1].q, f.q);
    answer += f.q;
    assert.equal(f.answer, answer);
    last.set(nums[f.r],f.r);
  }
  assert.equal(answer,core.brute(nums));cases++;
}
function enumerate(prefix,n) {
  if(prefix.length===n){check(prefix);return;}
  for(let value=1;value<=3;value++)enumerate([...prefix,value],n);
}
for(let n=1;n<=7;n++)enumerate([],n);
let seed = 2916;
function random(n) {seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;}
for(let trial=0;trial<300;trial++)check(Array.from({length:random(40)+1},()=>random(10)+1));
// Overlapping intervals exercise nonzero tags and stale descendant summaries.
for(let n=1;n<=32;n++) {
  const tree=new core.SegmentTree(n),values=Array(n).fill(0);
  for(let operation=0;operation<100;operation++) {
    const ends=[random(n),random(n)].sort((a,b)=>a-b),[l,r]=ends;
    tree.add(l,r);for(let i=l;i<=r;i++)values[i]++;
    assert.deepEqual(tree.values(),values);
    assert.equal(tree.nodes[1].q,values.reduce((s,x)=>s+x*x,0));
  }
}
const trace=core.treeFrames();
const zeroNodes=new core.SegmentTree(5).nodes;
assert.deepEqual(core.partitionRange(zeroNodes,0,3),{covered:[2,6],partial:[1,3],visited:[1,2,3,6]});
assert.deepEqual(core.partitionRange(zeroNodes,2,4),{covered:[5,3],partial:[1,2],visited:[1,2,5,3]});
assert.deepEqual(core.partitionRange(zeroNodes,0,4).covered,[1]);
assert.ok(Object.values(zeroNodes).every(node=>node.s===0&&node.q===0&&node.t===0));
assert.equal(trace.length,10);
assert.equal(trace[4].nodes[1].q,23);
assert.deepEqual(trace[4].values,[3,3,2,1,0]);
assert.equal(trace[5].kind,'push');
assert.equal(trace[5].nodes[2].t,0);
assert.deepEqual(trace[5].values,trace[4].values);
assert.equal(trace[9].nodes[1].q,32);
assert.deepEqual(trace[9].values,[3,3,3,2,1]);
const context={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../2916/python-code.js'),'utf8'),context);
assert.equal(context.window.LEETCODE_PYTHON,fs.readFileSync(path.join(__dirname,'../2916/solution.py'),'utf8'));
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../2916/copy.js'),'utf8'),context);
for(const [key,pair] of Object.entries(context.window.LEETCODE_COPY)) {
  assert.equal(pair.length,2,key);
  assert.ok(pair[0]&&pair[1],key);
  const placeholders=s=>(s.match(/\{\w+\}/g)||[]).sort();
  assert.deepEqual(placeholders(pair[0]),placeholders(pair[1]),key);
}
console.log(`${cases} complete-input cases, 3,200 overlapping-range updates, lazy trace, source parity and bilingual placeholders passed.`);
