const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const {presets,trace}=require('../core.js');
function groups(a,k){if(!k)return [[]];return a.flatMap((v,i)=>groups(a.slice(i+1),k-1).map(s=>[v,...s]));}
function oracle(p){return Math.min(...groups(p.q.map((_,i)=>i),p.k).map(s=>Math.max(...s.map(i=>p.w[i]/p.q[i]))*s.reduce((v,i)=>v+p.q[i],0)));}
let rounds=0;const records=[];
for(const p of [...presets,...JSON.parse(fs.readFileSync(path.join(out,'oracle-fixtures.json')))]){
 const original=JSON.stringify(p),{frames,order}=trace(p);let best=Infinity;let bestIds=[];
 for(let i=1;i<frames.length;i++){
  const f=frames[i],eligible=order.slice(0,i);const sorted=eligible.map(x=>x.q).sort((a,b)=>a-b).slice(0,p.k);
  assert.deepEqual(f.kept.map(x=>x.q),sorted);assert.equal(f.sum,sorted.reduce((a,b)=>a+b,0));assert.equal(new Set(f.kept.map(x=>x.id)).size,f.kept.length);
  assert.equal(f.old+f.x.q-(f.removed?.q||0),f.sum);
  assert(f.kept.every(x=>x.rate<=f.x.rate));
  if(i>=p.k){assert.equal(f.cost,f.sum*f.x.rate);if(f.cost<best){best=f.cost;bestIds=f.kept.map(x=>x.id);}}else assert.equal(f.cost,null);
  assert.equal(f.best,Number.isFinite(best)?best:null);assert.deepEqual(f.bestIds,bestIds);rounds++;
 }
 assert(Math.abs(frames.at(-1).best-oracle(p))<1e-6);if(p.expected!==undefined)assert(Math.abs(frames.at(-1).best-p.expected)<1e-6);
 assert.equal(JSON.stringify(p),original);if(records.length<presets.length)records.push({p,frames});
}
const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'python-code.js'),'utf8'),context);assert.equal(context.window.PYTHON_SOURCE,fs.readFileSync(path.join(root,'solution.py'),'utf8'));
// Check duplicate localization keys before object evaluation can overwrite them.
const copy=fs.readFileSync(path.join(root,'copy.js'),'utf8');const keys=[...copy.matchAll(/(?:^|[,\n])\s*(\w+)\s*:\s*\[/g)].map(x=>x[1]);assert.equal(new Set(keys).size,keys.length);
vm.runInNewContext(copy,context);for(const [k,v] of Object.entries(context.window.LESSON_COPY)){assert(Array.isArray(v)&&v.length===2&&v.every(x=>typeof x==='string'&&x.length),k);assert.deepEqual([...v[0].matchAll(/\{(\w+)\}/g)].map(x=>x[1]).sort(),[...v[1].matchAll(/\{(\w+)\}/g)].map(x=>x[1]).sort());}
fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify({authorSelfCheck:true,rounds,presets:records,copyKeys:keys.length},null,2));console.log('PASS',rounds,'intermediate snapshots and exact source mirror');
