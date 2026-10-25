const fs=require('fs'),path=require('path'),assert=require('assert'),vm=require('vm');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const {trace,presets}=require('../core.js');const buckets=JSON.parse(fs.readFileSync(path.join(out,'oracle-buckets.json')));
for(let n=0;n<=10;n++){
 const f=trace(n);assert.equal(f.length,n+1);
 for(let i=0;i<=n;i++){
  assert.deepEqual(f[i].counts,buckets[i]);
  if(i)for(let j=0;j<6;j++){
   assert.equal(f[i].incoming[j].reduce((a,x)=>a+x.count,0),f[i].counts[j]);
   for(const x of f[i].incoming[j])assert.equal(x.count,f[i-1].counts[x.from]);
  }
 }
 const snap=JSON.stringify(f[0]);if(n)f[n].counts[0]++;assert.equal(JSON.stringify(f[0]),snap);
}
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'python-code.js'),'utf8'),ctx);assert.equal(ctx.window.PYTHON_SOURCE,fs.readFileSync(path.join(root,'solution.py'),'utf8'));
const copy=fs.readFileSync(path.join(root,'copy.js'),'utf8');
// Check key declarations before evaluating the object (no silent duplicate overwrite).
const keys=[...copy.matchAll(/^ ([A-Za-z]\w*):/gm)].map(x=>x[1]);assert.equal(new Set(keys).size,keys.length);
// Also keys can share a line; inspect every key after object start/comma.
const all=[...copy.matchAll(/(?:^ |,\s*)(\w+):\s*\[/gm)].map(x=>x[1]);assert.equal(new Set(all).size,all.length);
vm.runInNewContext(copy,ctx);for(const [key,v] of Object.entries(ctx.window.LESSON_COPY)){assert.equal(v.length,2,key);assert(v.every(s=>typeof s==='string'&&s.length),key);}
fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify({result:'PASS',oracle:'exhaustive strings, independently grouped',presets,frames:'all days through n=10',sourceParity:true,uniqueBilingualKeys:all.length},null,2));console.log('PASS: core, snapshots, intermediate counts, source mirror, bilingual copy shape/duplicates');
