'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const core=require('../core.js');let cases=0,frames=0;
// Different enumeration: for each possible rectangle height, find all contiguous runs.
function oracle(a){let best=0;for(const h of new Set(a)){let run=0;for(const v of a){run=v>=h?run+1:0;best=Math.max(best,run*h);}}return best;}
function check(a){
 const original=a.slice(),run=core.trace(a);assert.deepEqual(a,original);assert.equal(run.best,oracle(a));const serialized=JSON.stringify(run);
 assert.equal(run.frames.length,2*a.length+2);
 let pushed=0,popped=0;
 for(let k=0;k<run.frames.length;k++){
  const f=run.frames[k];frames++;
  for(let z=1;z<f.stack.length;z++){assert(f.stack[z]>f.stack[z-1]);assert(a[f.stack[z]]>=a[f.stack[z-1]]);}
  const processed=f.type==='push'?f.i+1:f.i;
  for(const j of f.stack){assert(j<processed);for(let v=j+1;v<processed;v++)assert(a[v]>=a[j]);}
  assert.equal(f.best,Math.max(0,...f.ledger.map(x=>x.area)));
  if(f.type==='push'){pushed++;assert.deepEqual(f.stack,[...f.before,f.i]);assert.equal(f.ledger.length,popped);}
  if(f.type==='pop'){
   popped++;const r=f.ledger.at(-1);assert.equal(r.j,f.before.at(-1));assert.deepEqual(f.stack,f.before.slice(0,-1));
   assert.equal(r.left,f.stack.at(-1)??-1);assert.equal(r.width,r.i-r.left-1);assert(r.i===a.length||a[r.i]<r.height);
   assert.equal(r.area,r.height*r.width);assert(r.j>r.left&&r.j<r.i);
   for(let v=r.left+1;v<r.i;v++)assert(a[v]>=r.height);
   if(r.left>=0)assert(a[r.left]<=r.height);
   assert.equal(f.ledger.length,popped);
  }
 }
 assert.equal(pushed,a.length);assert.equal(popped,a.length);assert.deepEqual(run.frames.at(-1).stack,[]);
 // Deep snapshots must not share state arrays or ledger objects.
 run.frames.at(-1).ledger[0].area=-999;assert.equal(run.frames[0].ledger.length,0);
 const firstPop=run.frames.find(f=>f.type==='pop');if(firstPop!==run.frames.at(-1))assert.notEqual(firstPop.ledger[0].area,-999);
 assert.equal(JSON.stringify(core.trace(a)),serialized);cases++;
}
for(let n=1;n<=6;n++){const a=Array(n).fill(0);function gen(i){if(i===n){check(a);return;}for(let x=0;x<4;x++){a[i]=x;gen(i+1);}}gen(0);}
for(const a of core.presets)check(a);
let seed=84;for(let k=0;k<400;k++){const a=[];for(let j=0;j<1+k%12;j++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;a.push(seed%10001);}check(a);}
for(const a of [[],[-1],[1.2],Array(13).fill(1)])assert.throws(()=>core.trace(a));
const report={kind:'author self-check',cases,frames,oracle:'height-threshold contiguous runs',result:'pass'};
const out=process.env.LESSON_OUTPUT_DIR||path.join(__dirname,'../evidence');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify(report,null,2)+'\n');console.log(report);
