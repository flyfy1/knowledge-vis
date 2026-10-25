const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const core=require('../core.js'),root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
function oracle(a){let best=0;for(let mask=0;mask<2**(a.length-1);mask++){let joined=[],start=0,count=0;for(let i=0;i<a.length;i++)if(i===a.length-1||(mask>>i&1)){joined.push(...a.slice(start,i+1).sort((a,b)=>a-b));start=i+1;count++;}if(joined.every((v,i)=>!i||joined[i-1]<=v))best=Math.max(best,count);}return best;}
let tested=0,framesChecked=0;
function check(a){
 const frames=core.trace(a);const frozen=JSON.stringify(frames);
 for(let k=0;k<frames.length;k++){
  const f=frames[k];assert.equal(f.cuts.length,Math.max(0,k-a.length));
  f.suffix.forEach((v,i)=>{if(v!==null)assert.equal(v,Math.min(...a.slice(i)));});
  for(const c of f.cuts){assert.equal(c.left,Math.max(...a.slice(0,c.i+1)));assert.equal(c.right,Math.min(...a.slice(c.i+1)));assert.equal(c.safe,[...a.slice(0,c.i+1)].every(x=>a.slice(c.i+1).every(y=>x<=y)));}
  assert.equal(f.safe,f.cuts.filter(c=>c.safe).length);if(f.op==='cut')assert.equal(f.left,Math.max(...a.slice(0,f.i+1)));framesChecked++;
 }
 assert.equal(frames.at(-1).safe+1,oracle(a));assert.equal(JSON.stringify(core.trace(a)),frozen);
 if(frames.length>2){const old=frames[0].suffix[0];frames.at(-1).suffix[0]=-999;assert.equal(frames[0].suffix[0],old);}
 tested++;
}
for(let n=1;n<=7;n++)for(let code=0;code<3**n;code++){let x=code,a=[];for(let i=0;i<n;i++){a.push(x%3);x=Math.floor(x/3);}check(a);}
for(const a of core.presets)check(a);
let seed=768;for(let r=0;r<300;r++){seed=(1664525*seed+1013904223)>>>0;const n=1+seed%8,a=[];for(let i=0;i<n;i++){seed=(1664525*seed+1013904223)>>>0;a.push(seed%12);}check(a);}
const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'copy.js'),'utf8'),context);const copy=context.window.COPY;
for(const [key,pair] of Object.entries(copy)){assert.ok(Array.isArray(pair)&&pair.length===2&&pair.every(s=>typeof s==='string'&&s.length),key);const placeholders=s=>[...s.matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort();assert.deepEqual(placeholders(pair[0]),placeholders(pair[1]),key);}
assert.equal(oracle([1,3,2,2,4]),3);assert.equal(oracle([2,3,1,4]),2);
fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify({tested,framesChecked,localePairs:Object.keys(copy).length,oracle:'independent all partition-and-sort enumerator',snapshotIndependence:true},null,2)+'\n');console.log({tested,framesChecked});
