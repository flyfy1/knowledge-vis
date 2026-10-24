'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const C=require('../core.js');
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
function raw(nums,lo,hi){let n=0;for(let i=0;i<nums.length;i++)for(let j=i+1;j<=nums.length;j++){const s=nums.slice(i,j).reduce((a,b)=>a+b,0);if(lo<=s&&s<=hi)n++;}return n;}
let framesChecked=0,cases=0;
function test(nums,lo,hi){
 const f=C.trace(nums,lo,hi),p=C.prefix(nums);let acc=0;
 assert.equal(f.at(-1).total,raw(nums,lo,hi));
 for(const s of f){framesChecked++;
  assert.equal(s.total,s.ledger.reduce((a,b)=>a+b.add,0));
  if(s.kind==='count'){
   assert.deepEqual(s.left,[...p.slice(s.lo,s.mid)].sort((a,b)=>a-b));assert.deepEqual(s.right,[...p.slice(s.mid,s.hi)].sort((a,b)=>a-b));
   assert(s.beforeK<=s.k&&s.beforeL<=s.l&&s.k<=s.l);
   assert.equal(s.k,s.right.filter(y=>y-s.x<lo).length);assert.equal(s.l,s.right.filter(y=>y-s.x<=hi).length);
   assert.equal(s.add,s.right.filter(y=>lo<=y-s.x&&y-s.x<=hi).length);
   acc+=s.add;assert.equal(s.total,acc);
  }
  if(s.kind==='merge'){
   assert.deepEqual(s.merged,[...p.slice(s.lo,s.hi)].sort((a,b)=>a-b));
   let local=0;for(let i=s.lo;i<s.hi;i++)for(let j=i+1;j<s.hi;j++)if(lo<=p[j]-p[i]&&p[j]-p[i]<=hi)local++;
   const ledgerCount=s.ledger.filter(r=>s.lo<=r.lo&&r.hi<=s.hi).reduce((a,r)=>a+r.add,0);assert.equal(ledgerCount,local);
  }
 }
 // Deep snapshots retain separate nested state.
 if(f.length>2){const original=JSON.stringify(f[1]);f.at(-1).ledger[0].add=999;assert.equal(JSON.stringify(f[1]),original);}
 cases++;
}
for(let n=1;n<=5;n++){for(let code=0;code<3**n;code++){let c=code;const nums=Array.from({length:n},()=>{const v=c%3-1;c=Math.floor(c/3);return v;});for(let lo=-2;lo<=2;lo++)for(let hi=lo;hi<=2;hi++)test(nums,lo,hi);}}
for(const p of C.presets)test(p.nums,p.lower,p.upper);
let seed=327;function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;}
for(let i=0;i<500;i++){const nums=Array.from({length:1+rand()%14},()=>rand()%31-15);const lo=-(rand()%20),hi=rand()%20;test(nums,lo,hi);}
const report={cases,framesChecked,status:'PASS (author self-check)'};fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify(report,null,2));console.log(report);
