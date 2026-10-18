'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {trace}=require('../core.js');
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const cache=new Map();function outputs(s){if(cache.has(s))return cache.get(s);const result=new Set();if(s.length===1)result.add(s);else for(let k=1;k<s.length;k++)for(const a of outputs(s.slice(0,k)))for(const b of outputs(s.slice(k))){result.add(a+b);result.add(b+a);}cache.set(s,result);return result;}
let cases=0,cells=0,events=0;
function check(a,b){const r=trace(a,b);assert.equal(r.result,outputs(a).has(b));let previous=r.frames[0];for(const f of r.frames){
 for(let l=1;l<=a.length;l++)for(let i=0;i<=a.length-l;i++)for(let j=0;j<=a.length-l;j++){
 const v=f.dp[l][i][j];if(v!==null){assert.equal(v,outputs(a.slice(i,i+l)).has(b.slice(j,j+l)));cells++;}
 if(previous.dp[l][i][j]!==null)assert.equal(v,previous.dp[l][i][j]);
 }
 if(f.event==='cut'){
  for(const p of [...f.keep,...f.swap]){assert.ok(p.length<f.length);assert.notEqual(p.value,null);assert.equal(p.a,a.slice(p.i,p.i+p.length));assert.equal(p.b,b.slice(p.j,p.j+p.length));assert.equal(p.value,outputs(p.a).has(p.b));}
  assert.equal(f.kept,f.keep.every(p=>p.value));assert.equal(f.swapped,f.swap.every(p=>p.value));
  assert.equal(f.dp[f.length][f.i][f.j],f.kept||f.swapped?true:f.k===f.length-1?false:null);
 }
 assert.deepEqual(f.ledger.slice(0,previous.ledger.length),previous.ledger);
 previous=f;events++;
 }
 // snapshots may not alias earlier tables or ledgers
 if(r.frames.length>1){const before=JSON.stringify(r.frames[0]);r.frames[1].dp[1][0][0]='mutated';r.frames[1].ledger.push({});assert.equal(JSON.stringify(r.frames[0]),before);}cases++;
}
for(let n=1;n<=4;n++){const words=Array.from({length:2**n},(_,x)=>x.toString(2).padStart(n,'0').replaceAll('0','a').replaceAll('1','b'));for(const a of words)for(const b of words)check(a,b);}
for(const [a,b] of [['great','rgeat'],['abcde','caebd'],['aab','aba'],['abcd','badc'],['abcd','bdac'],['abcba','bacab']])check(a,b);
for(const [a,b] of [['',''],['ab','a'],['abcdef','abcdef'],['A','a'],['a','1']])assert.throws(()=>trace(a,b));
const report={type:'author self-check',cases,cells,events,unknownDistinctFromFalse:true,snapshotIsolation:true};fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify(report,null,2));console.log(report);
