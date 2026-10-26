'use strict';
const fs=require('fs'),assert=require('node:assert/strict'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..'),{trace,presets}=require('../core.js');
const cases=JSON.parse(fs.readFileSync(0,'utf8'));let invariants=0,groups=0;
for(const {n,expected} of cases){
 const frames=trace(n);assert.equal(frames.at(-1).answer,expected);
 const seenGroups=new Set(),valid=[];if(n<=5000)for(let x=1;x<=n;x++)if(new Set(String(x)).size===String(x).length)valid.push(x);
 let total=0;for(let j=0;j<frames.length;j++){
  const f=frames[j];assert.equal(f.unique,f.ledger.reduce((s,e)=>s+e.amount,0));assert.equal(new Set(f.used).size,f.used.length);assert.equal(f.used.join(''),f.prefix);
  assert.equal(String(n).slice(0,f.prefix.length),f.prefix);
  if(j)assert(f.unique>=frames[j-1].unique);
  if(n<=5000){
   for(const [idx,e] of f.ledger.entries()){
    if(seenGroups.has(idx))continue;seenGroups.add(idx);const values=[];
    for(const x of valid){
     const s=String(x);
     const belongs=e.kind==='short'?s.length===e.size:e.kind==='block'?s.length===String(n).length&&s.startsWith(e.branch):x===n;
     if(belongs)values.push(x);
    }
    assert.equal(e.amount,values.length,JSON.stringify({n,e}));assert.equal(e.total,f.ledger.slice(0,idx+1).reduce((s,v)=>s+v.amount,0));groups++;
   }
  }
  invariants++;
 }
 // Snapshots are not shared references.
 if(frames.length>1){const old=JSON.stringify(frames[0]);frames.at(-1).used.push(99);assert.equal(JSON.stringify(frames[0]),old);}
}
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8'),box={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'python-code.js'),'utf8'),box);assert.equal(box.window.PYTHON_SOURCE,source);
// Detect duplicate keys in the authoring representation before JSON could overwrite.
const copyBuild=fs.readFileSync(path.join(__dirname,'build_copy.py'),'utf8');const keys=[...copyBuild.matchAll(/\('([^']+)',/g)].map(m=>m[1]);assert.equal(keys.length,new Set(keys).size);assert(keys.length>70);
const copyBox={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'copy.js'),'utf8'),copyBox);for(const pair of Object.values(copyBox.window.COPY))assert(pair.length===2&&pair.every(v=>typeof v==='string'&&v.length));
console.log(JSON.stringify({cases:cases.length,frameInvariants:invariants,enumeratedGroupChecks:groups,presets,sourceMirrorExact:true,uniqueBilingualKeys:keys.length}));
