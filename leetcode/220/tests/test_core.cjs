'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),api=require('../core.js');
const out=process.env.TEST_OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
function oracle(a,k,t){for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)if(j-i<=k&&Math.abs(a[i]-a[j])<=t)return true;return false;}
let cases=0,framesChecked=0;
function check(p){
 const frames=api.trace(p),last=frames.at(-1);
 assert.equal(last.result,oracle(p.nums,p.k,p.t));assert(last.done);
 for(const [z,f] of frames.entries()){
   framesChecked++;
   if(f.phase==='start')assert.deepEqual(f.entries,[]);
   if(['expire','probe','insert'].includes(f.phase)){
    const lo=Math.max(0,f.i-p.k),hi=f.phase==='insert'?f.i:f.i-1;
    const expected=Array.from({length:Math.max(0,hi-lo+1)},(_,i)=>lo+i);
    assert.deepEqual(f.entries.map(e=>e.j).sort((a,b)=>a-b),expected);
    assert.equal(new Set(f.entries.map(e=>e.b)).size,f.entries.length);
    f.entries.forEach(e=>{assert.equal(e.x,p.nums[e.j]);assert.equal(e.b,Math.floor(e.x/f.width));});
   }
   if(f.phase==='probe'){
    let qualifying=false;
    for(let j=Math.max(0,f.i-p.k);j<f.i;j++)if(Math.abs(p.nums[j]-p.nums[f.i])<=p.t)qualifying=true;
    assert.equal(!!f.pair,qualifying);
    assert(f.probes.length<=3);
    f.probes.forEach(e=>{
     assert.equal(e.hit,e.j!==null&&Math.abs(e.x-p.nums[f.i])<=p.t);
     if(e.j!==null)assert.equal(e.diff,Math.abs(e.x-p.nums[f.i]));
    });
   }
   assert.equal(f.history.length,z);
 }
 // Independent snapshots, including nested maps/history.
 if(frames.length>2){
  const old=JSON.stringify(frames[1]);frames[2].entries.push({b:999,j:999,x:999});
  assert.equal(JSON.stringify(frames[1]),old);
 }
 cases++;
}
for(let n=2;n<=5;n++){
 const size=3**n;
 for(let mask=0;mask<size;mask++){
  let q=mask;const a=Array.from({length:n},()=>{let v=q%3-1;q=Math.floor(q/3);return v;});
  for(let k=1;k<=n;k++)for(let t=0;t<=2;t++)check({nums:a,k,t});
 }
}
api.presets.forEach(check);
let seed=220;
function random(){seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;}
for(let n=0;n<500;n++){
 const len=2+Math.floor(random()*10);
 check({nums:Array.from({length:len},()=>Math.floor(random()*50)-25),k:1+Math.floor(random()*len),t:Math.floor(random()*8)});
}
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'python-code.js'),'utf8'),ctx);
assert.equal(ctx.window.PYTHON_SOURCE,fs.readFileSync(path.join(root,'solution.py'),'utf8'));
const pairs={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'copy.js'),'utf8'),pairs);
Object.entries(pairs.window.LESSON_COPY).forEach(([k,v])=>{
 assert.equal(v.length,2);v.forEach(s=>assert(s.trim(),k));
 assert.deepEqual([...v[0].matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort(),[...v[1].matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort(),k);
});
const report={kind:'author self-check',modelCases:cases,framesChecked,sourceMirrorParity:true,bilingualKeys:Object.keys(pairs.window.LESSON_COPY).length};
fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify(report,null,2)+'\n');console.log(report);
