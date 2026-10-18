'use strict';
const assert = require('node:assert/strict');
const reverse = require('../../hard-first-ten/core.js')[25];
let cases=0, transitions=0;
for(let n=1;n<=24;n++)for(let k=1;k<=n;k++){
 const values=Array.from({length:n},(_,i)=>i%3), input=[values,k], trace=reverse(input);
 const expected=[];for(let i=0;i<n;i+=k){const chunk=Array.from({length:Math.min(k,n-i)},(_,j)=>i+j);expected.push(...(chunk.length===k?chunk.reverse():chunk));}
 const end=trace.frames.at(-1), actual=[],seen=new Set();let p=end.head;
 while(p!==null){assert(!seen.has(p));seen.add(p);actual.push(p);p=end.links[p];}
 assert.deepEqual(actual,expected);assert.deepEqual(end.values,values);
 for(let i=1;i<trace.frames.length;i++){
  const before=trace.frames[i-1],after=trace.frames[i],s=after.state;
  if(s.changed!==undefined){
   assert.equal(s.nxt,before.links[s.changed]);assert.equal(after.links[s.changed],before.state.prev);
   assert.equal(s.prev,s.changed);assert.equal(s.curr,s.nxt);assert.equal(after.head,before.head);
   assert.deepEqual(after.links.filter((_,j)=>j!==s.changed),before.links.filter((_,j)=>j!==s.changed));
  }
  if(i===trace.frames.length-1){assert.deepEqual(after.links,before.links);assert.equal(after.head,before.head);}
  transitions++;
 }
 cases++;
}
// The new prose is a concrete calculation of these exact post-operation states.
const f=reverse([[1,2,3],2]).frames;
assert.deepEqual(f[1].state,{group_prev:-1,kth:1,group_next:2,prev:2,curr:0});
assert.deepEqual(f[2].links,[2,2,null]);assert.equal(f[2].head,0);assert.equal(f[2].state.nxt,1);
assert.deepEqual(f[3].links,[2,0,null]);assert.equal(f[3].head,0);assert.equal(f[3].state.curr,2);
assert.equal(f[4].head,1);assert.equal(f[4].state.group_prev,0);
assert.deepEqual(f[5].links,f[4].links);assert.deepEqual(f[5].result,[2,1,3]);
console.log(JSON.stringify({modelCases:cases,transitions,concreteWalkthrough:'matched every state'},null,2));
