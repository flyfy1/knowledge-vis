const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {trace,presets}=require('../core.js');
function oracle(s){
 if(!s.length)return 0;
 let best=s.length-1;
 for(let mask=0;mask<2**(s.length-1);mask++){
  let begin=0,parts=[];
  for(let e=1;e<=s.length;e++)if(e===s.length||(mask&(1<<(e-1)))){parts.push(s.slice(begin,e));begin=e;}
  if(parts.every(p=>p===[...p].reverse().join('')))best=Math.min(best,parts.length-1);
 }
 return best;
}
let cases=0,framesChecked=0;
function check(s){
 const frames=trace(s),n=s.length;
 assert.equal(frames.length,1+n*(n+1)/2);
 for(let i=0;i<frames.length;i++){
  const f=frames[i];framesChecked++;
  assert.equal(f.log.length,i);
  for(let l=0;l<n;l++)for(let r=l;r<n;r++)if(f.p[l][r]!==null){const sub=s.slice(l,r+1);assert.equal(f.p[l][r],sub===[...sub].reverse().join(''));}
  for(let k=1;k<=f.done;k++)assert.equal(f.dp[k],oracle(s.slice(0,k))+1);
  assert.equal(f.dp[0],0);
  if(i){
   const candidates=[];
   for(let l=0;l<=f.l;l++){const sub=s.slice(l,f.r+1);if(sub===[...sub].reverse().join(''))candidates.push(l===0?1:oracle(s.slice(0,l))+2);}
   assert.equal(f.after,Math.min(n+1,...candidates));
   assert.equal(f.done,f.l===f.r?f.r+1:f.r);
  }
 }
 assert.equal(frames.at(-1).dp[n]-1,oracle(s));
 assert.deepEqual(trace(s),frames);cases++;
}
for(let n=1;n<=6;n++)for(let bits=0;bits<2**n;bits++)check(Array.from({length:n},(_,i)=>(bits>>i)&1?'a':'b').join(''));
let seed=132;for(let i=0;i<250;i++){seed=(seed*1664525+1013904223)>>>0;let n=1+seed%6,s='';for(let j=0;j<n;j++){seed=(seed*1664525+1013904223)>>>0;s+='abc'[seed%3];}check(s);}
presets.forEach(check);check('abca');
assert.throws(()=>trace(''));assert.throws(()=>trace('abcdefg'));
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const result={status:'pass',cases,framesChecked,seed:132,checks:'independent cut masks, every tested P cell, every completed prefix, provisional minima, deterministic snapshots'};
fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify(result,null,2));console.log(result);
