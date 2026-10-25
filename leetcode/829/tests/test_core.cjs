'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm'),acorn=require('acorn');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const C=require('../core.js');
function oracle(n){const sequences=[];for(let a=1;a<=n;a++){let sum=0;for(let b=a;sum<n;b++){sum+=b;if(sum===n)sequences.push({a,k:b-a+1});}}return sequences;}
for(let n=1;n<=1000;n++){
 const want=oracle(n),frames=C.trace(n);let previous=0;
 assert.equal(frames[0].phase,'initial');assert.equal(frames.at(-1).phase,'stop');
 for(const [i,f] of frames.entries()){
  const tested=f.done.length;
  assert.equal(f.count,want.filter(x=>x.k<=tested).length);
  assert.equal(tested,i===frames.length-1?i-1:i);
  if(f.phase==='tested'){
   const c=f.current;assert(c.minimum<=n);assert(c.remaining>=c.k);
   assert.equal(c.accepted,want.some(x=>x.k===c.k));
   if(c.accepted){assert.deepEqual(want.find(x=>x.k===c.k),{a:c.a,k:c.k});assert.equal(Array.from({length:c.k},(_,j)=>c.a+j).reduce((a,b)=>a+b,0),n);}
   assert.equal(f.count,previous+Number(c.accepted));previous=f.count;
  }
  if(f.phase==='stop'){assert(f.current.minimum>n);assert.equal(f.count,want.length);}
 }
 const first=JSON.stringify(frames[1]);frames.at(-1).done.push({bad:true});assert.equal(JSON.stringify(frames[1]),first); // snapshots must not share mutable ledger data
}
// Copy structure checks: duplicate keys must be caught before evaluation overwrites them.
const code=fs.readFileSync(path.join(root,'copy.js'),'utf8'),tree=acorn.parse(code,{ecmaVersion:'latest'});
let objects=0;function walk(n){if(!n||typeof n!=='object')return;if(n.type==='ObjectExpression'){objects++;const keys=n.properties.map(p=>p.key.name??p.key.value);assert.equal(new Set(keys).size,keys.length,'duplicate localization key');}for(const v of Object.values(n))if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')walk(v);}walk(tree);
const context={window:{}};vm.runInNewContext(code,context);for(const [k,pair] of Object.entries(context.window.COPY)){assert(Array.isArray(pair)&&pair.length===2&&pair.every(s=>typeof s==='string'&&s.length),k);assert.deepEqual((pair[0].match(/\{\w+\}/g)||[]).sort(),(pair[1].match(/\{\w+\}/g)||[]).sort(),k);}
vm.runInNewContext(fs.readFileSync(path.join(root,'python-code.js'),'utf8'),context);assert.equal(context.window.PYTHON_SOURCE,fs.readFileSync(path.join(root,'solution.py'),'utf8'));
fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify({kind:'author core self-check',result:'pass',exhaustive:'n=1..1000',oracle:'grow sums by starting integer; no production length formula',intermediateFrames:true,duplicateKeyAstObjects:objects,localeKeys:Object.keys(context.window.COPY).length,sourceMirrorExact:true},null,2));console.log('core: n=1..1000, all intermediate frames, locale AST and mirror pass');
