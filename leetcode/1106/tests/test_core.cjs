'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..'),OUT=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(OUT,{recursive:true});
const {trace,presets}=require(ROOT+'/core.js'),cases=JSON.parse(fs.readFileSync(OUT+'/cases.json'));
// Independent textual substitution of completed groups in each processed prefix.
function prefixExpected(s){
 while(s.includes(')')){
  const r=s.indexOf(')'),l=s.lastIndexOf('(',r),op=s[l-1],vals=s.slice(l+1,r).split(',').map(x=>x==='t');
  const b=op==='!'?!vals[0]:op==='&'?vals.every(Boolean):vals.some(Boolean);
  s=s.slice(0,l-1)+(b?'t':'f')+s.slice(r+1);
 }
 return s.replaceAll(',','');
}
let checked=0,reductions=0;
for(const [s,expected]of cases){
 const frames=trace(s);assert.equal(frames.length,s.length+1);assert.equal(frames.at(-1).after[0]==='t',expected);
 for(let k=0;k<frames.length;k++){
  const f=frames[k];assert.equal(f.i,k-1);assert.equal(f.after.join(''),prefixExpected(s.slice(0,k)),JSON.stringify({s,k,f}));
  assert.deepEqual(f.before,k?frames[k-1].after:[]);
  assert.equal(f.reductions.length,[...s.slice(0,k)].filter(x=>x===')').length);
  if(f.kind==='reduce'){
   assert(f.detail.values.every(v=>v==='t'||v==='f'));assert(f.before.includes('('));
   assert.equal(f.detail.hasTrue,f.detail.values.includes('t'));assert.equal(f.detail.hasFalse,f.detail.values.includes('f'));reductions++;
  }
  checked++;
 }
 const baseline=JSON.stringify(frames);frames.at(-1).after.push('mutation');assert.equal(JSON.stringify(frames.slice(0,-1)),JSON.stringify(JSON.parse(baseline).slice(0,-1)));
 if(frames.at(-1).reductions.length>1){const old=frames.at(-2).reductions.map(x=>[...x.values]);frames.at(-1).reductions[0].values.push('mutation');assert.deepEqual(frames.at(-2).reductions.map(x=>x.values),old);}
}
for(const s of presets)assert(cases.some(([x])=>x===s)||prefixExpected(s)==='t'||prefixExpected(s)==='f');
const report={passed:true,scope:'author self-check',cases:cases.length,frames:checked,reductions,invariant:'Each processed prefix independently reduced by textual substitution; before/after and history checked; nested snapshots mutation checked.'};fs.writeFileSync(OUT+'/core-results.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
