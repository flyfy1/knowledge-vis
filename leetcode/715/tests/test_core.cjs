const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const C=require('../core.js'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
let checks=0;
// Compressed elementary intervals: independent oracle without endpoint parity.
function verify(ops){const coords=[...new Set(ops.flatMap(o=>o.slice(1)))].sort((a,b)=>a-b),covered=Array(coords.length-1).fill(false),frames=C.trace(ops);assert.deepEqual(frames[0].after,[]);
 ops.forEach(([kind,l,r],n)=>{let want=null;const indices=covered.map((_,i)=>i).filter(i=>coords[i]>=l&&coords[i+1]<=r);
 if(kind==='query')want=indices.every(i=>covered[i]);else indices.forEach(i=>covered[i]=kind==='add');
 const endpoints=[];let previous=false;coords.forEach((x,i)=>{const current=covered[i]||false;if(current!==previous)endpoints.push(x);previous=current;});
 const f=frames[n+1];assert.deepEqual(f.after,endpoints);assert.equal(f.result,want);assert.deepEqual(f.before,frames[n].after);assert.equal(f.history.length,n+1);assert.deepEqual(f.history[n].after,endpoints);checks++;
 });return frames;
}
const examples=C.presets.map(verify);
assert.deepEqual(examples[0].filter(f=>f.op?.[0]==='query').map(f=>f.result),[true,false,true]);
assert.deepEqual(examples[1][4].after,[2,8]);assert.deepEqual(examples[4][2].after,[999999995,999999997,999999999,1000000000]);
let seed=715;const rand=()=>((seed=(Math.imul(1664525,seed)+1013904223)>>>0)/2**32);
for(let k=0;k<100;k++){const ops=[];for(let n=0;n<100;n++){let l=1+Math.floor(rand()*12),r=1+Math.floor(rand()*12);if(l===r)r++;if(l>r)[l,r]=[r,l];ops.push([['add','remove','query'][Math.floor(rand()*3)],l,r]);}verify(ops);}
const report={status:'pass',framesChecked:checks,presets:5,seed:715,oracle:'independent compressed elementary-segment coverage',scope:'author self-check'};
fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify(report,null,2)+'\n');console.log(report);
