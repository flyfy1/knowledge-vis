'use strict';
const fs=require('fs'),assert=require('assert'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..'),C=require(root+'/core.js');
const fixtures=JSON.parse(fs.readFileSync(0,'utf8'));
let framesChecked=0;
for(const [input,expected] of fixtures){
 const frames=C.trace(input),[sx,sy]=input;
 assert.strictEqual(frames.at(-1).result,expected,JSON.stringify(input));
 assert.deepStrictEqual(frames,C.trace(input));
 for(let i=1;i<frames.length;i++){
  const f=frames[i],prev=frames[i-1];framesChecked++;
  assert.deepStrictEqual(f.history.slice(0,-1),prev.history);
  if(f.kind==='mod'){
   const r=f.row;assert(prev.x>sx&&prev.y>sy);
   assert.strictEqual(r.a,r.q*r.b+r.r);assert(r.r>=0&&r.r<r.b);
   assert(f.x+f.y<prev.x+prev.y);
   if(r.axis==='x'){assert.equal(f.y,prev.y);assert.equal(f.x,prev.x%prev.y);}
   else{assert.equal(f.x,prev.x);assert.equal(f.y,prev.y%prev.x);}
   // Independently check reachability of each arithmetic state with forward BFS.
   if(f.x<=50&&f.y<=50){
    const seen=new Set(),queue=[[sx,sy]];let reachable=false;
    while(queue.length){const [x,y]=queue.pop();if(x>f.x||y>f.y)continue;const key=x+','+y;if(seen.has(key))continue;seen.add(key);if(x===f.x&&y===f.y){reachable=true;break;}queue.push([x+y,y],[x,x+y]);}
    assert.strictEqual(reachable,expected);
   }
  }else{assert.equal(f.x,prev.x);assert.equal(f.y,prev.y);}
 }
 const snapshot=JSON.stringify(frames.slice(0,-1));if(frames.at(-1).history[0]?.before)frames.at(-1).history[0].before[0]=-999;frames.at(-1).history.push({test:true});assert.equal(JSON.stringify(frames.slice(0,-1)),snapshot);
}
const source=fs.readFileSync(root+'/solution.py','utf8'),context={window:{}};vm.runInNewContext(fs.readFileSync(root+'/python-code.js','utf8'),context);assert.strictEqual(context.window.PYTHON_SOURCE,source);
// Parse JSON portion before evaluation: duplicate detection happens in Python below.
const copySource=fs.readFileSync(root+'/copy.js','utf8');const copy=JSON.parse(copySource.slice(copySource.indexOf('{'),copySource.lastIndexOf('}')+1));
for(const [key,pair] of Object.entries(copy))assert(pair.length===2&&pair.every(v=>typeof v==='string'&&v.length),key);
process.stdout.write(JSON.stringify({cases:fixtures.length,intermediateFrames:framesChecked,mirrorExact:true,copyPairs:Object.keys(copy).length}));
