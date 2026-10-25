const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const C=require('../core.js'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const score=(a,b)=>[0,1,2,3,4,5].filter(i=>a[i]===b[i]).length;
const budgetResults=JSON.parse(fs.readFileSync(fs.existsSync(path.join(out,'green.json'))?path.join(out,'green.json'):path.join(__dirname,'evidence/budget-r2/green.json'),'utf8'));
for(const family of budgetResults.cases){
 const words=family.rows[0].trace[0].before;
 for(const row of family.rows){
  const trace=C.trace(words,row.secret,family.budget);
  assert.equal(trace.length,row.calls+1);assert.equal(trace.at(-1).done,true);
  for(let i=1;i<trace.length;i++){
   const f=trace[i],actual=row.trace[i-1];
   assert.deepEqual(f.candidates.map(j=>words[j]),actual.after);
   assert.equal(f.history.at(-1).guess,actual.guess);assert.equal(f.history.at(-1).reply,actual.reply);
   assert.equal(f.history.length,i);assert.equal(f.done,actual.reply===6);
  }
 }
}
const impossible=C.presets[8],stopped=C.trace(impossible.words,impossible.secret,impossible.budget).at(-1);
assert.equal(stopped.done,false);assert.equal(stopped.exhausted,true);
assert.equal(stopped.history.length,10);assert.deepEqual(stopped.candidates.map(i=>impossible.words[i]),['bmmmmm']);
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
