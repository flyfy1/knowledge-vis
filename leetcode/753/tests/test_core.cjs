const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const C=require('../core.js'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
function words(n,k){let a=[''];for(let i=0;i<n;i++)a=a.flatMap(s=>Array.from({length:k},(_,d)=>s+d));return a;}
let total=0;
for(let n=1;n<=4;n++)for(let k=1;k<=4;k++){
 const frames=C.trace(n,k),E=k**n,V=k**(n-1);assert.equal(frames.length,2*E+2);
 frames.forEach((f,i)=>{
  total++;
  assert.equal(new Set(f.used).size,f.used.length);
  assert.equal(f.used.length,Math.max(0,f.stack.length-1)+f.finished.length);
  assert.equal(f.next.reduce((a,b)=>a+b,0),f.used.length);
  assert.ok(f.next.every(d=>d>=0&&d<=k));
  for(let v=0;v<V;v++)for(let d=0;d<k;d++)assert.equal(f.used.includes(v*k+d),d<f.next[v]);
  if(!i)return;
  const prev=frames[i-1],op=f.op;
  if(op.kind==='push'){
   assert.equal(f.used.length,prev.used.length+1);assert.equal(f.finished.length,prev.finished.length);
   assert.equal(op.edge,op.v*k+op.digit);assert.equal(op.target,op.edge%V);
   assert.deepEqual(f.stack.slice(0,-1),prev.stack);assert.equal(f.next[op.v],prev.next[op.v]+1);
  }else{
   assert.equal(prev.next[op.v],k);assert.equal(f.used.length,prev.used.length);
   assert.deepEqual(f.stack,prev.stack.slice(0,-1));assert.equal(f.finished.length,prev.finished.length+(op.digit!==null));
  }
 });
 const end=frames.at(-1),s='0'.repeat(n-1)+end.finished.slice().reverse().join('');
 assert.equal(s.length,E+n-1);assert.deepEqual(new Set(Array.from({length:E},(_,i)=>s.slice(i,i+n))),new Set(words(n,k)));
 const before=JSON.stringify(frames[0]);end.stack.push([999,0]);assert.equal(JSON.stringify(frames[0]),before);
}
const result={pairs:16,intermediateFrames:total,edgeUseConservation:true,independentWindowEnumeration:true,snapshotIsolation:true};fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify(result,null,2));console.log(result);
