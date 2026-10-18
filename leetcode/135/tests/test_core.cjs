const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),{presets,trace}=require('../core.js');
const out=process.env.LESSON_TEST_OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
function ordered(r){const c=r.map(()=>1);[...r.keys()].sort((a,b)=>r[a]-r[b]).forEach(i=>{for(const j of [i-1,i+1])if(j>=0&&j<r.length&&r[j]<r[i])c[i]=Math.max(c[i],c[j]+1);});return c;}
let count=0,frameCount=0;
function check(r){
 const original=r.slice(),frames=trace(r),n=r.length;
 assert.equal(frames.length,3*n-1);
 const last=frames.at(-1);assert.deepEqual(last.C,ordered(r));assert.deepEqual(r,original);
 // Independently count contiguous rising/falling edges at each position.
 const L=r.map((_,i)=>{let k=i;while(k>0&&r[k]>r[k-1])k--;return i-k+1;});
 const R=r.map((_,i)=>{let k=i;while(k+1<n&&r[k]>r[k+1])k++;return k-i+1;});
 frames.forEach((f,k)=>{
  frameCount++;
  if(f.phase==='left'){for(let i=0;i<=f.i;i++)assert.equal(f.L[i],L[i]);for(let i=f.i+1;i<n;i++)assert.equal(f.L[i],1);assert.deepEqual(f.R,r.map(()=>1));}
  if(f.phase==='right'){assert.deepEqual(f.L,L);for(let i=f.i;i<n;i++)assert.equal(f.R[i],R[i]);for(let i=0;i<f.i;i++)assert.equal(f.R[i],1);}
  if(f.phase==='merge'){assert.deepEqual(f.L,L);assert.deepEqual(f.R,R);for(let i=0;i<n;i++)assert.equal(f.C[i],i<=f.i?Math.max(L[i],R[i]):null);}
  if(k){assert.notEqual(f.L,frames[k-1].L);assert.notEqual(f.R,frames[k-1].R);assert.notEqual(f.C,frames[k-1].C);}
 });
 count++;
}
for(let n=1;n<=6;n++)for(let bits=0;bits<3**n;bits++){let x=bits;check(Array.from({length:n},()=>{const v=x%3;x=Math.floor(x/3);return v;}));}
presets.forEach(check);
assert.throws(()=>trace([]));assert.throws(()=>trace(Array(7).fill(1)));
const report={status:'pass',cases:count,frames:frameCount,checks:'independent rating-order oracle, contiguous-chain intermediate invariants, deep snapshots, unchanged input, all presets'};
fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify(report,null,2));console.log(report);
