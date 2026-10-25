'use strict';
const assert=require('node:assert/strict'),C=require('../core.js');
assert.equal(typeof C.searchTrace,'function','818-SEARCH-R1: complete A* teaching trace is missing');
for(const target of [3,5,6]){
 const frames=C.searchTrace(target),last=frames.at(-1);
 assert.equal(last.kind,'goal');assert.equal(last.current.g,{3:2,5:7,6:5}[target]);
 const best=new Map([['0,1',0]]);let generated=1,expanded=0;
 for(const f of frames){
  assert.deepEqual(f.frontier,[...f.frontier].sort(C.order));
  for(const x of f.frontier)assert.equal(x.f,x.g+C.bound(target,x.p,x.s));
  if(f.kind==='expand'){
   expanded++;assert.equal(f.children.length,2);
   for(const [i,x] of f.children.entries()){
    assert.deepEqual([x.p,x.s],C.move(f.current.p,f.current.s,i===0?'A':'R'));
    assert.equal(x.g,f.current.g+1);assert.equal(x.h,C.bound(target,x.p,x.s));
    const key=x.p+','+x.s,old=best.get(key);
    assert.equal(x.status,old===undefined?'new':x.g<old?'improved':'notBetter');
    if(old===undefined||x.g<old){best.set(key,x.g);generated++;}
   }
  }else assert.equal(f.children.length,0);
  assert.equal(f.generated,generated);assert.equal(f.expanded,expanded);assert.equal(f.discovered,best.size);
 }
}
assert.equal(C.bound(6,0,1),3);assert.equal(C.bound(6,3,4),1);assert.equal(C.bound(6,7,8),2);assert.equal(C.bound(6,6,-2),0);
console.log('818-SEARCH-R1 JS trace, tuple order, both edges, counts and lower-bound operands passed');
