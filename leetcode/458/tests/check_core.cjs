'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const C=require('../core.js'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
// Independent baseline enumerates possible outcomes. No power/log count rule.
function oracle(b,r){let tuples=[[]],p=0;while(tuples.length<b){tuples=tuples.flatMap(a=>Array.from({length:r+1},(_,x)=>a.concat(x)));p++;}return p;}
// Actually process planned feedings, observing deaths only after complete waits.
function simulate(m,poison){let deaths=Array(m.pigs).fill(0),frames=[];
 for(let elapsed=0;elapsed<=m.rounds;elapsed++){
  if(elapsed){for(let p=0;p<m.pigs;p++)if(!deaths[p]&&m.plan[elapsed-1][p].includes(poison))deaths[p]=elapsed;}
  frames.push(deaths.slice());
 }return frames;
}
let cases=0,frames=0;
for(let r=1;r<=5;r++)for(let b=1;b<=45;b++){
 const count=C.count(b,3,r*3+2);assert.equal(count.pigs,oracle(b,r));assert.equal(count.rounds,r);
 count.ledger.forEach((e,p)=>{assert.equal(e.pigs,p);assert.equal(e.capacity,(r+1)**p);});
 for(let poison=1;poison<=b;poison++){
  const m=C.experiment(b,3,r*3+2,poison);const observations=simulate(m,poison);
  const all=Array.from({length:b},(_,i)=>simulate(m,i+1));
  assert.equal(new Set(m.codes.map(c=>c.join(','))).size,b);
  m.frames.forEach((f,i)=>{
   assert.deepEqual(f.observed,observations[i]);
   const expected=all.flatMap((hypothesis,j)=>JSON.stringify(hypothesis[i])===JSON.stringify(observations[i])?[j+1]:[]);
   assert.deepEqual(f.candidates,expected);assert(f.candidates.includes(poison));assert.equal(f.history.length,i);
   f.history.forEach((h,j)=>{assert.deepEqual(h.observed,observations[j+1]);h.feeds.forEach((feed,p)=>{assert.equal(feed.skipped,observations[j][p]!==0);assert.deepEqual(feed.buckets,m.plan[j][p]);});});
   if(i)assert(f.candidates.every(x=>m.frames[i-1].candidates.includes(x)));
   frames++;
  });
  assert.deepEqual(m.frames.at(-1).candidates,[poison]);
  const before=JSON.stringify(m);m.frames.slice().reverse().forEach(()=>{});assert.equal(JSON.stringify(C.experiment(b,3,r*3+2,poison)),before);
  cases++;
 }
}
C.presets.forEach(({b,d,t})=>{for(let poison=1;poison<=b;poison++)assert.deepEqual(C.experiment(b,d,t,poison).frames.at(-1).candidates,[poison]);});
assert.equal(C.count(1000,15,60).pigs,5);assert.equal(C.count(1000,100,100).pigs,10);
const result={status:'pass',cases,frames,oracle:'enumerated outcome vectors for count; actual live-pig feeding simulator for every candidate and history frame',presets:C.presets.length};
fs.writeFileSync(path.join(out,'core.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
