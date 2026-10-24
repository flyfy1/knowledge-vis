'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),C=require('../core.js'),rows=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
let checked=0;
for(const {x,pair,contacts} of rows){
 const frames=C.trace(x),end=frames.at(-1);
 assert.equal(!!end.hit,!!pair);
 assert.equal(end.k,pair?pair[0]+1:x.length);
 if(pair)assert(contacts.includes(end.hit.old));
 for(let k=0;k<frames.length;k++){
  const f=frames[k];assert.equal(f.k,k);assert.equal(f.points.length,k+1);
  if(k){const a=f.points[k-1],b=f.points[k];assert.equal(Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1]),x[k-1]);}
  for(let j=0;j<=k;j++){const prefix=x.slice(0,j),east=prefix.reduce((s,v,r)=>s+(r%2===1?(r%4===1?-v:v):0),0),north=prefix.reduce((s,v,r)=>s+(r%2===0?(r%4===0?v:-v):0),0);assert.deepEqual(f.points[j],[east,north]);}
  assert.equal(!!f.hit,!!pair&&k===pair[0]+1);
  if(k<frames.length-1){const snapshot=JSON.stringify(f);frames[k+1].points[0][0]+=1;assert.equal(JSON.stringify(f),snapshot);frames[k+1].points[0][0]-=1;}
 }
 checked++;
}
// Independent dictionaries must have no duplicate keys; every value has two strings.
const copy=fs.readFileSync(path.join(root,'copy.js'),'utf8'),keys=[...copy.matchAll(/^\s*(\w+):/gm)].map(m=>m[1]);
// Include same-line keys too; the format has only root-level key: [ pairs.
const all=[...copy.matchAll(/\b(\w+):\s*\[/g)].map(m=>m[1]);assert.equal(new Set(all).size,all.length);
const context={window:{}};vm.runInNewContext(copy,context);
for(const value of Object.values(context.window.LESSON_COPY)){assert.equal(value.length,2);assert(value.every(s=>typeof s==='string'&&s.length));}
const sourceContext={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'python-code.js'),'utf8'),sourceContext);
assert.equal(sourceContext.window.PYTHON_SOURCE,fs.readFileSync(path.join(root,'solution.py'),'utf8'));
process.stdout.write(JSON.stringify({traces:checked,coordinateLengths:'pass',simplePrefixInvariant:'pass',sourceParity:'pass',duplicateLocalizationKeys:0}));
