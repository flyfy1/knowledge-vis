'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const core=require('../core.js');let count=0;
for(let n=1;n<=160;n++){
 const ordered=Array.from({length:n},(_,i)=>i+1).sort((a,b)=>String(a)<String(b)?-1:1);
 for(let k=1;k<=n;k++){
  const frames=core.trace(n,k);assert.equal(frames.at(-1).p,ordered[k-1]);
  frames.forEach((f,i)=>{
   assert.equal(ordered.indexOf(f.p)+f.r,k-1);
   const members=ordered.filter(x=>String(x).startsWith(String(f.p)));
   assert.equal(f.size,members.length);assert.equal(f.size,f.rows.reduce((s,x)=>s+x.count,0));
   const included=[];for(const r of f.rows){assert.equal(r.clipped,Math.min(n+1,r.stop));for(let x=r.first;x<r.clipped;x++)included.push(x);}
   assert.deepEqual(included.sort((a,b)=>a-b),members.sort((a,b)=>a-b));
   if(i){const prev=frames[i-1],m=f.move;assert.equal(m.beforeP,prev.p);assert.equal(m.beforeR,prev.r);assert.equal(m.size,prev.size);assert.equal(m.kind,prev.size<=prev.r?'skip':'descend');assert.equal(f.r,prev.r-(m.kind==='skip'?m.size:1));}
   count++;
  });
 }
}
const fixtures=JSON.parse(fs.readFileSync(path.join(out,'oracle-fixtures.json')));
for(const f of fixtures)assert.equal(core.trace(f.n,f.k).at(-1).p,f.answer);
const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'python-code.js'),'utf8'),sandbox);assert.equal(sandbox.window.PYTHON_SOURCE,fs.readFileSync(path.join(root,'solution.py'),'utf8'));
for(const [n,k] of [[0,1],[1,0],[1,2],[1e9+1,1],[2,1.5]])assert.throws(()=>core.trace(n,k),RangeError);
const result={status:'pass',checked_frames:count,independent_python_fixtures:fixtures.length,source_mirror:'exact'};

const copyText=fs.readFileSync(path.join(root,'copy.js'),'utf8'),dictionary={window:{}};vm.runInNewContext(copyText,dictionary);const keys=[...copyText.matchAll(/\b(\w+):\s*\[/g)].map(x=>x[1]);assert.equal(keys.length,new Set(keys).size);for(const pair of Object.values(dictionary.window.LESSON_COPY)){assert.equal(pair.length,2);assert(pair.every(x=>typeof x==='string'&&x.length));const ph=x=>[...x.matchAll(/\{(\w+)\}/g)].map(a=>a[1]).sort();assert.deepEqual(ph(pair[0]),ph(pair[1]));}

result.bilingualKeys=keys.length;fs.writeFileSync(path.join(out,'core.json'),JSON.stringify(result,null,2));console.log(result);
