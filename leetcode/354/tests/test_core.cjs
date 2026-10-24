const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {trace,presets}=require('../core.js');const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
let count=0,frames=0;
function minima(items,strictWidth){
 const best=[];
 // Enumerate subsequences directly, independent of lower bound / tails updates.
 for(let mask=1;mask<2**items.length;mask++){
  const seq=items.filter((_,i)=>mask&(2**i));
  if(seq.every((e,i)=>!i||(e[1]>seq[i-1][1]&&(!strictWidth||e[0]>seq[i-1][0]))))best[seq.length-1]=Math.min(best[seq.length-1]??Infinity,seq.at(-1)[1]);
 }
 return best;
}
function check(input,wrong=false){
 const original=JSON.stringify(input),data=trace(input,wrong);assert.equal(JSON.stringify(input),original);
 data.frames.forEach((f,i)=>{frames++;assert.deepEqual(f.tails,minima(data.ordered.slice(0,i),!wrong));assert.equal(f.history.length,i);
  if(i){const h=f.history.at(-1);assert.deepEqual(h.before,data.frames[i-1].tails);assert.deepEqual(h.after,f.tails);
   assert.equal(h.pos,h.before.findIndex(x=>x>=h.pair[1])<0?h.before.length:h.before.findIndex(x=>x>=h.pair[1]));
   for(const p of h.probes){assert(p.lo<=p.mid&&p.mid<p.hi);assert.equal(p.value,h.before[p.mid]);}
  }
 });
 if(data.frames.length>1){const final=JSON.stringify(data.frames.at(-1));data.frames[0].tails.push(-1);assert.equal(JSON.stringify(data.frames.at(-1)),final);}
 count++;
}
for(const p of presets){check(p);check(p,true);}
const vals=[[1,1],[1,2],[2,1],[2,2]];
function exhaustive(a,n){check(a);if(n)for(const x of vals)exhaustive([...a,x],n-1);}
exhaustive([],5);
let seed=354;function random(n){seed=(seed*1664525+1013904223)>>>0;return seed%n;}
for(let i=0;i<500;i++)check(Array.from({length:1+random(10)},()=>[1+random(8),1+random(8)]));
assert.equal(trace([[2,2],[2,3]],true).frames.at(-1).tails.length,2);assert.equal(trace([[2,2],[2,3]]).frames.at(-1).tails.length,1);
fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify({kind:'author self-check',cases:count,frames,oracle:'enumeration of every subsequence; exact minimum ending by length'},null,2));console.log({count,frames});
