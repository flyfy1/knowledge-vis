'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm'),acorn=require('acorn');
const ROOT=path.resolve(__dirname,'..'),OUT=process.env.OUTPUT_DIR||__dirname+'/evidence';fs.mkdirSync(OUT,{recursive:true});
const {trace,presets}=require(ROOT+'/core.js');
let cases=0,framesTested=0;
function check(a,t){
 const p=a.indexOf(Math.max(...a)),f=trace(a,t);assert.equal(f.at(-1).result,a.indexOf(t));let calls=0;
 for(const s of f){framesTested++;assert(s.calls>=calls);assert.equal(s.calls-calls,s.reads.length);calls=s.calls;
  assert.equal(s.history.reduce((n,h)=>n+h.reads.length,0),s.calls);
  for(const r of s.reads){assert(r.i>=0&&r.i<a.length);assert.equal(r.value,a[r.i]);}
  if(s.phase==='peak')assert(s.lo<=p&&p<=s.hi);
  if(s.peak!==null)assert.equal(s.peak,p);
  if(s.phase==='up'||s.phase==='down'){
   const start=s.phase==='up'?0:p+1,end=s.phase==='up'?p:a.length-1;
   const matches=a.map((v,i)=>v===t&&i>=start&&i<=end?i:-1).filter(i=>i>=0);
   for(const i of matches)assert(i>=s.lo&&i<=s.hi);
  }
  for(const h of s.history){
   assert.equal(h.mid,Math.floor((h.oldLo+h.oldHi)/2));
   if(h.phase==='peak'){assert(h.lo<=p&&p<=h.hi);assert(h.hi-h.lo<h.oldHi-h.oldLo);}
   else if(h.rule!=='equal'){assert(h.hi-h.lo<h.oldHi-h.oldLo);for(let i=h.oldLo;i<=h.oldHi;i++)if(i<h.lo||i>h.hi)assert.notEqual(a[i],t);}
  }
 }
 assert(calls<=56);const s0=JSON.stringify(f[0]);f.at(-1).history[0]?.reads.push({i:-1});assert.equal(JSON.stringify(f[0]),s0,'snapshots independent');cases++;
}
for(const p of presets)check(p.a,p.target);
for(let peak=1;peak<=6;peak++)for(let left=1;left<(1<<peak);left++)for(let right=1;right<(1<<peak);right++){
 const a=[];for(let i=0;i<peak;i++)if(left&(1<<i))a.push(i);a.push(peak);for(let i=peak-1;i>=0;i--)if(right&(1<<i))a.push(i);
 for(let t=0;t<=7;t++)check(a,t);
}
const code=fs.readFileSync(ROOT+'/copy.js','utf8'),ast=acorn.parse(code,{ecmaVersion:2022});
function visit(n){if(!n||typeof n!=='object')return;if(n.type==='ObjectExpression'){const keys=n.properties.map(p=>p.key.name??p.key.value);assert.equal(new Set(keys).size,keys.length,'duplicate dictionary key');}for(const v of Object.values(n))if(Array.isArray(v))v.forEach(visit);else if(v&&typeof v==='object')visit(v);}
visit(ast);const sandbox={window:{}};vm.runInNewContext(code,sandbox);for(const v of Object.values(sandbox.window.LESSON_COPY)){assert(Array.isArray(v)&&v.length===2&&v.every(x=>typeof x==='string'&&x));}
vm.runInNewContext(fs.readFileSync(ROOT+'/python-code.js','utf8'),sandbox);assert.equal(sandbox.window.PYTHON_SOURCE,fs.readFileSync(ROOT+'/solution.py','utf8'));
const result={passed:true,scope:'author self-check',cases,framesTested,dictionaryKeys:Object.keys(sandbox.window.LESSON_COPY).length,duplicateKeys:false,exactMirror:true};fs.writeFileSync(OUT+'/core-results.json',JSON.stringify(result,null,2)+'\n');console.log(result);
