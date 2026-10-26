// Run: node leetcode/1074/tests/test_core.cjs. OUTPUT_DIR optional.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const core=require('../core.js');
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
let framesChecked=0, cases=0;
function rectSum(a,t,b,l,r){let s=0;for(let i=t;i<=b;i++)for(let j=l;j<=r;j++)s+=a[i][j];return s;}
function oracle(a,target){let total=0;for(let t=0;t<a.length;t++)for(let b=t;b<a.length;b++)for(let l=0;l<a[0].length;l++)for(let r=l;r<a[0].length;r++)total+=+(rectSum(a,t,b,l,r)===target);return total;}
function test(a,target) {
 const trace=core.trace(a,target);let running=0;
 for(const f of trace){
  framesChecked++;
  assert.deepEqual(f.cols,a[0].map((_,c)=>rectSum(a,f.top,f.bottom,c,c)));
  const pref=[0];for(const x of f.cols)pref.push(pref.at(-1)+x);
  if(f.kind==='band'){assert.equal(f.c,-1);assert.deepEqual(f.seen,{'0':1});assert.equal(f.bandTotal,0);}
  else {
   const before={},after={};for(let p=0;p<=f.c;p++)before[pref[p]]=(before[pref[p]]||0)+1;
   for(let p=0;p<=f.c+1;p++)after[pref[p]]=(after[pref[p]]||0)+1;
   assert.deepEqual(f.before,before);assert.deepEqual(f.seen,after);
   assert.equal(f.s,pref[f.c+1]);assert.equal(f.need,f.s-target);
   const lefts=[];for(let l=0;l<=f.c;l++)if(rectSum(a,f.top,f.bottom,l,f.c)===target)lefts.push(l);
   assert.deepEqual(f.matches,lefts);assert.equal(f.hits,lefts.length);
   running+=lefts.length;
   assert.equal(f.bandTotal,f.ledger.filter(r=>r.top===f.top&&r.bottom===f.bottom).reduce((s,r)=>s+r.hits,0));
  }
  assert.equal(f.total,running);
  assert.equal(f.ledger.reduce((s,r)=>s+r.hits,0),running);
 }
 assert.equal(trace.at(-1).total,oracle(a,target));
 if(trace.length>1){const frozen=JSON.stringify(trace[1]);trace[0].cols[0]=999;assert.equal(JSON.stringify(trace[1]),frozen);}
 cases++;
}
for(const p of core.presets)test(p.matrix,p.target);
// Exhaustive all 2x3 ternary matrices, all targets -2..2.
for(let code=0;code<729;code++) {let k=code;const v=[];for(let i=0;i<6;i++){v.push(k%3-1);k=Math.floor(k/3);}for(let t=-2;t<=2;t++)test([v.slice(0,3),v.slice(3)],t);}
let seed=1074;const rand=n=>{seed=(1664525*seed+1013904223)>>>0;return seed%n;};
for(let i=0;i<250;i++){const m=1+rand(4),n=1+rand(4);test(Array.from({length:m},()=>Array.from({length:n},()=>rand(11)-5)),rand(19)-9);}
assert.equal(oracle([[2,-2,2,-2]],0),4);
let last=0;for(let l=0;l<4;l++)last+=+(rectSum([[2,-2,2,-2]],0,0,l,3)===0);assert.equal(last,2);
assert.equal(oracle(core.presets[0].matrix,0),core.hand.length);
const report={kind:'author self-check',cases,framesChecked,allFrameInvariants:true,independentDirectCellOracle:true,predictionEndpoint:2,predictionFullTotal:4};fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify(report,null,2)+'\n');console.log(report);
