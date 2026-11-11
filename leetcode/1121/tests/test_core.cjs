'use strict';
// Checks the browser simulation (core.js) against fixtures from the exhaustive search in test_solution.py.
const fs=require('fs'),path=require('path'),assert=require('assert');
const R=path.resolve(__dirname,'..'),C=require(path.join(R,'core.js'));
const O=process.env.EVIDENCE_DIR||path.join(__dirname,'evidence','run');
const fixtures=JSON.parse(fs.readFileSync(path.join(O,'oracle-fixtures.json'),'utf8'));
let frames=0,cases=0;
for(const fx of fixtures){
 const {nums,k}=fx,n=nums.length,tr=C.trace(nums,k),last=tr.at(-1);cases++;
 assert.equal(last.answer,fx.answer,JSON.stringify(fx));assert.equal(C.solve(nums,k),fx.answer);
 const counts={};for(const v of nums)counts[v]=(counts[v]||0)+1;const f=Math.max(...Object.values(counts));
 const types=tr.map(x=>x.event.type);
 assert.deepEqual(types,['start',...Array(n).fill('count'),'bound',...Array(n).fill('deal'),'final']);
 for(let i=1;i<tr.length;i++){
  const a=tr[i-1],b=tr[i],e=b.event;frames++;
  if(e.type==='count'){
   let run=1;while(e.i-run>=0&&nums[e.i-run]===nums[e.i])run++;assert.equal(b.run,run);
   assert.equal(b.most,Math.max(a.most,run));assert.equal(e.grew,run>a.most);
  }
  if(e.type==='bound'){assert.equal(e.f,f);assert.equal(e.need,f*k);assert.equal(e.ok,f*k<=n);}
  if(e.type==='deal'){assert.equal(e.pile,e.i%f);assert.equal(b.piles.flat().length,e.i+1);assert.deepEqual(b.piles[e.pile].at(-1),nums[e.i]);}
 }
 // Construction evidence: piles always strictly increasing; shortest pile is floor(n/f).
 assert(last.event.increasing);assert.equal(last.event.shortest,Math.floor(n/f));
 assert.equal(last.event.shortest>=k,fx.answer);
 assert.deepEqual(last.piles.flat().sort((x,y)=>x-y),nums);
 // Greedy wrong turn partitions the input into increasing chains.
 const g=C.greedyLongest(nums,k);assert.deepEqual(g.chains.flat().sort((x,y)=>x-y),nums);for(const c of g.chains)for(let j=1;j<c.length;j++)assert(c[j]>c[j-1]);
 const saved=JSON.stringify(tr.slice(0,-1));last.piles[0].push(-1);last.nums[0]=-9;assert.equal(JSON.stringify(tr.slice(0,-1)),saved);
}
// The lesson's greedy counterexample: greedy says false where the answer is true.
const g=C.greedyLongest([1,1,2,2,3,4],3);assert.deepEqual(g.chains,[[1,2,3,4],[1,2]]);assert.equal(g.ok,false);assert.equal(C.solve([1,1,2,2,3,4],3),true);
assert.deepEqual(C.trace([1,2,2,2,3,3,4,5,6],3).at(-1).piles,[[1,2,4],[2,3,5],[2,3,6]]);
assert.deepEqual(C.trace([1,2,2,3,3,3,4,5,6,7],3).at(-1).piles,[[1,3,4,7],[2,3,5],[2,3,6]]);
// Input checks used by the page.
assert.equal(C.check([],1),'length');assert.equal(C.check([2,1],1),'sorted');assert.equal(C.check([1,100],1),'value');assert.equal(C.check([1,2],3),'k');assert.equal(C.check(Array(25).fill(1),1),'length');assert.equal(C.check([1,2],2),null);
for(const p of C.presets)assert.equal(C.check(p.nums,p.k),null);
const report={kind:'author simulation check against exhaustive-search fixtures',cases,framesChecked:frames};
fs.writeFileSync(path.join(O,'core.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
