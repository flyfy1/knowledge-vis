const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),{trace}=require('../core.js');
const cases=JSON.parse(fs.readFileSync(0,'utf8'));let steps=0;
for(const nums of cases){
 const original=JSON.stringify(nums),target=Math.min(...nums),frames=trace(nums);
 assert.deepEqual(frames[0],{l:0,r:nums.length-1,event:null});
 for(let i=0;i<frames.length;i++){
  const f=frames[i];assert.ok(f.l<=f.r);assert.ok(nums.slice(f.l,f.r+1).includes(target));
  if(i){const prev=frames[i-1],e=f.event;assert.equal(e.a,prev.l);assert.equal(e.b,prev.r);assert.equal(e.m,Math.floor((prev.l+prev.r)/2));assert.equal(e.x,nums[e.m]);assert.equal(e.y,nums[e.b]);assert.ok(f.r-f.l<prev.r-prev.l);
   if(e.x>e.y){assert.equal(f.l,e.m+1);assert.equal(f.r,prev.r);}else if(e.x<e.y){assert.equal(f.r,e.m);assert.equal(f.l,prev.l);}else{assert.equal(f.r,prev.r-1);assert.equal(f.l,prev.l);}steps++;
  }
 }
 const last=frames.at(-1);assert.equal(last.l,last.r);assert.equal(nums[last.l],target);assert.equal(JSON.stringify(nums),original);
 const serialized=JSON.stringify(frames);frames[0].l=-1;if(frames.length>1)assert.notEqual(frames[1].l,-1);assert.equal(serialized,JSON.stringify(trace(nums)));
}
const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'python-code.js'),'utf8'),context);assert.equal(context.window.PYTHON_SOURCE,fs.readFileSync(path.join(root,'solution.py'),'utf8'));
const copy={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'copy.js'),'utf8'),copy);for(const [key,pair]of Object.entries(copy.window.LESSON_COPY)){assert.equal(pair.length,2,key);assert.ok(pair.every(v=>v.length>0),key);assert.deepEqual((pair[0].match(/\{\w+\}/g)||[]).sort(),(pair[1].match(/\{\w+\}/g)||[]).sort(),key);}
console.log(JSON.stringify({cases:cases.length,intermediateTransitions:steps,sourceMirror:'exact',translations:'paired placeholders'}));
