'use strict';
const fs=require('fs'),assert=require('assert'),vm=require('vm'),path=require('path');
const C=require('../core.js');
const {cases,expected}=JSON.parse(fs.readFileSync(0,'utf8'));
let framesChecked=0,appends=0,pops=0,keeps=0;
for(let k=0;k<cases.length;k++){
 const input=cases[k],frames=C.trace(input),done=frames.at(-1);
 assert.deepStrictEqual(done.result,expected[k]);
 let processed={lower:[],upper:[]};
 for(let i=0;i<frames.length;i++){
  const f=frames[i],chain=f[f.pass];framesChecked++;
  if(f.kind==='pop'||f.kind==='keep'){
   const v=(f.b[0]-f.a[0])*(f.point[1]-f.a[1])-(f.b[1]-f.a[1])*(f.point[0]-f.a[0]);
   assert.equal(f.value,v);assert.equal(f.kind==='pop',v<0);
   if(f.kind==='pop'){
    pops++;assert.deepStrictEqual(frames[i-1][f.pass].slice(0,-1),chain);
    assert.deepStrictEqual(frames[i-1][f.pass].at(-1),f.b);
   }else {keeps++;assert.deepStrictEqual(chain,frames[i-1][f.pass]);}
  }
  if(f.kind==='append'){
   appends++;processed[f.pass].push(f.point);
   assert.deepStrictEqual(chain.at(-1),f.point);
   // Each directed chain edge supports every processed point on its left.
   for(let j=0;j+1<chain.length;j++)for(const p of processed[f.pass])assert(C.cross(chain[j],chain[j+1],p)>=0);
   for(let j=0;j+2<chain.length;j++)assert(C.cross(chain[j],chain[j+1],chain[j+2])>=0);
   // Any processed tree lying on a retained edge must still occur in the chain.
   for(const p of processed[f.pass])for(let j=0;j+1<chain.length;j++){
    const a=chain[j],b=chain[j+1];
    const between=p[0]>=Math.min(a[0],b[0])&&p[0]<=Math.max(a[0],b[0])&&p[1]>=Math.min(a[1],b[1])&&p[1]<=Math.max(a[1],b[1]);
    if(between&&C.cross(a,b,p)===0)assert(chain.some(q=>q[0]===p[0]&&q[1]===p[1]));
   }
  }
  // Snapshots must be reproducible and independent of future snapshots.
  assert.deepStrictEqual(C.trace(input)[i],f);
 }
}
const root=path.resolve(__dirname,'..'),src=fs.readFileSync(path.join(root,'solution.py'),'utf8'),ctx={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'python-code.js'),'utf8'),ctx);
assert.equal(ctx.window.PYTHON_SOURCE,src);
const copy=fs.readFileSync(path.join(root,'copy.js'),'utf8');
// Lexical key scan before JS parsing can silently overwrite a key.
const keys=[...copy.matchAll(/(?:^|[,\n])\s*([A-Za-z][A-Za-z0-9]*)\s*:\s*\[/g)].map(m=>m[1]);
assert.equal(keys.length,new Set(keys).size);
vm.runInNewContext(copy,ctx);assert.equal(keys.length,Object.keys(ctx.window.LESSON_COPY).length);
for(const pair of Object.values(ctx.window.LESSON_COPY))assert(pair.length===2&&pair.every(x=>typeof x==='string'&&x.length>0));
assert.equal(C.cross([0,0],[1,1],[2,3]),1); // Fresh prompt begins in a valid invariant state.
assert.equal(C.cross([1,1],[2,3],[3,0]),-5);
assert.equal(C.cross([0,0],[1,1],[3,0]),-3);
console.log(JSON.stringify({cases:cases.length,framesChecked,appends,pops,keeps,sourceParity:true,uniqueBilingualKeys:keys.length}));
