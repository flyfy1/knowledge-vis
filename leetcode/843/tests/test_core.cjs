const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const C=require('../core.js'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const score=(a,b)=>[0,1,2,3,4,5].filter(i=>a[i]===b[i]).length;
let frames=0;
const pool=Array.from({length:8},(_,i)=>i.toString(2).padStart(3,'0').replaceAll('0','a').replaceAll('1','b')+'aaa');
for(let mask=1;mask<256;mask++){
 const words=pool.filter((_,i)=>mask>>i&1);
 for(const secret of words){
  const trace=C.trace(words,secret);assert(trace.at(-1).done);
  for(const f of trace){
   frames++;assert.deepEqual(f.candidates,words.flatMap((w,i)=>f.history.every(h=>score(w,h.guess)===h.reply)?[i]:[]));
   if(!f.done){
    const p=C.plan(words,f.candidates,f.used);
    for(const r of p.rows){assert.deepEqual(r.buckets,Array.from({length:7},(_,s)=>f.candidates.filter(i=>score(words[i],r.word)===s).length));assert.equal(r.worst,Math.max(...r.buckets.slice(0,6)));}
   }
  }
 }
}
const source=fs.readFileSync(path.join(__dirname,'../solution.py'),'utf8'),sandbox={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../python-code.js'),'utf8'),sandbox);assert.equal(sandbox.window.PYTHON_SOURCE,source);
const copy=fs.readFileSync(path.join(__dirname,'../copy.js'),'utf8');
const keys=[...copy.matchAll(/^  "([^"]+)":/gm)].map(x=>x[1]);assert.equal(new Set(keys).size,keys.length);
vm.runInNewContext(copy,sandbox);for(const v of Object.values(sandbox.window.COPY)){assert.equal(v.length,2);assert(v.every(s=>typeof s==='string'&&s.length));}
fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify({result:'pass',frames,copyPairs:keys.length,sourceParity:true,checks:'independent positional oracle, every intermediate candidate, each bucket, mirror bytes, duplicate localization keys'},null,2));console.log({frames,copyPairs:keys.length,result:'pass'});
