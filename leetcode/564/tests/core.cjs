const fs=require('fs'),path=require('path'),assert=require('assert'),vm=require('vm');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const oracle=JSON.parse(fs.readFileSync(path.join(out,'oracle-cases.json'))),core=require('../core.js');
let frames=0;
for(const [n,expected] of Object.entries(oracle)){
 const a=core.trace(n),x=BigInt(n);let eligible=[];
 assert(a.rows.length<=5);
 for(let k=0;k<a.frames.length;k++){
  if(k){const r=a.rows[k-1];assert.equal(String(r.value),String(r.value).split('').reverse().join(''));assert.equal(r.distance,r.value>x?r.value-x:x-r.value);if(r.value!==x)eligible.push(r.value);}
  eligible.sort((a,b)=>{const da=a>x?a-x:x-a,db=b>x?b-x:x-b;return da<db?-1:da>db?1:a<b?-1:a>b?1:0;});
  assert.equal(a.frames[k].best,eligible[0]??null);frames++;
 }
 assert.equal(String(a.frames.at(-1).best),expected,n);
}
const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'python-code.js'),'utf8'),sandbox);assert.equal(sandbox.window.PYTHON_SOURCE,fs.readFileSync(path.join(root,'solution.py'),'utf8'));
// Detect duplicate translation keys before JS can silently overwrite them.
const copy=fs.readFileSync(path.join(root,'copy.js'),'utf8'),keys=[...copy.matchAll(/(?:^|[,{])\s*(\w+)\s*:\s*\[/g)].map(m=>m[1]);assert.equal(keys.length,new Set(keys).size);
vm.runInNewContext(copy,sandbox);for(const [key,v] of Object.entries(sandbox.window.LESSON_COPY))assert(Array.isArray(v)&&v.length===2&&v.every(x=>typeof x==='string'&&x.length),key);
fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify({result:'PASS',cases:Object.keys(oracle).length,frames,sourceMirror:'exact',translationKeys:keys.length},null,2));console.log('PASS JS trace',frames,'frames');
