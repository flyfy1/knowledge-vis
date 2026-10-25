const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const C=require('../core.js'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
function oracle(a){let count=0;for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)if(a[i]>2*a[j])count++;return count;}
let count=0;
function check(a){const frames=C.trace(a);assert.equal(frames.at(-1).total,oracle(a));let total=0;
for(const [idx,f] of frames.entries()){
 assert.equal(f.total,f.ledger.reduce((s,r)=>s+r.add,0));
 if(f.kind==='count'){
 assert(f.before<=f.q);assert.equal(f.q,f.right.filter(y=>f.x>2*y).length);
 assert(f.right.slice(0,f.q).every(y=>f.x>2*y));assert(f.q===f.right.length||f.x<=2*f.right[f.q]);
 assert.equal(f.total,total+f.q);assert.equal(f.x,f.left[f.i]);
 const L=a.slice(f.lo,f.mid).sort((x,y)=>x-y),R=a.slice(f.mid,f.hi).sort((x,y)=>x-y);assert.deepEqual(f.left,L);assert.deepEqual(f.right,R);
 }else assert.equal(f.total,total);
 if(f.kind==='merge')assert.deepEqual(f.merged,a.slice(f.lo,f.hi).sort((x,y)=>x-y));
 total=f.total;
 if(idx>0){assert.notEqual(f.ledger,frames[idx-1].ledger);}
}count++;}
for(let n=0;n<=6;n++){const rec=a=>{if(a.length===n)return check(a);for(const v of [-2,0,2])rec([...a,v]);};rec([]);}
C.presets.forEach(check);fs.writeFileSync(path.join(out,'trace.json'),JSON.stringify({kind:'author self-check',cases:count,result:'pass'},null,2));console.log('trace checks:',count);
