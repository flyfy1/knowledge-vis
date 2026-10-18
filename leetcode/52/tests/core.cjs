const assert=require('assert'),fs=require('fs'),path=require('path'),{trace}=require('../core.js');
function valid(p){return p.every((c,r)=>p.slice(0,r).every((d,s)=>c!==d&&Math.abs(c-d)!==r-s))}
function oracle(n,p=[]){if(p.length===n)return[p];return Array.from({length:n},(_,c)=>c).flatMap(c=>valid([...p,c])?oracle(n,[...p,c]):[])}
const sorted=a=>[...a].sort((a,b)=>a-b);let events=0;
for(let n=1;n<=4;n++){
 const run=trace(n),expected=oracle(n),leaves=[];
 for(let i=0;i<run.frames.length;i++){
  const f=run.frames[i],p=f.placement;
  assert(valid(p));assert.deepStrictEqual(f.cols,sorted(p));assert.deepStrictEqual(f.down,sorted(p.map((c,r)=>r-c)));assert.deepStrictEqual(f.up,sorted(p.map((c,r)=>r+c)));
  if(f.kind==='solution'){assert.equal(p.length,n);leaves.push([...p]);}
  assert.equal(f.count,leaves.length);assert.deepStrictEqual(f.leaves,leaves);
  if(i){const prev=run.frames[i-1];assert.equal(f.count-prev.count,f.kind==='solution'?1:0);
   if(f.kind==='reject'){assert.deepStrictEqual(p,prev.placement);assert(f.conflicts.length);assert(!valid([...p,f.c]));}
   if(f.kind==='place')assert.deepStrictEqual(p,[...prev.placement,f.c]);
   if(f.kind==='undo'){assert.deepStrictEqual(p,prev.placement.slice(0,-1));assert.equal(prev.placement.at(-1),f.c);}
  }
  events++;
 }
 assert.deepStrictEqual(leaves,expected);assert.equal(run.count,expected.length);assert.deepStrictEqual(run.frames.at(-1).placement,[]);
 // Snapshots must not alias either past states or receipts.
 const clone=trace(n);clone.frames.at(-1).leaves.push([99]);assert.equal(clone.frames[0].leaves.length,0);assert.notDeepStrictEqual(clone.frames.at(-2).leaves,clone.frames.at(-1).leaves);
}
for(const n of [0,5,1.1,NaN])assert.throws(()=>trace(n),RangeError);
const out=process.env.LESSON_TEST_OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify({events,n:'1..4',oracle:'pairwise distances and exhaustive complete descendants',passed:true},null,2)+'\n');console.log({events,passed:true});
