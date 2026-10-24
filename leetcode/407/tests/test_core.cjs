'use strict';
const fs=require('fs'),assert=require('assert/strict'),vm=require('vm'),acorn=require('acorn');
const path=require('path'),root=path.resolve(__dirname,'..'),{trace,presets}=require('../core.js');
let frames=0;
for(const test of JSON.parse(fs.readFileSync(0,'utf8'))){
  const {h,water,levels}=test,saved=JSON.stringify(h),model=trace(h),m=h.length,n=h[0].length;
  assert.equal(model.result,water);assert.equal(JSON.stringify(h),saved);assert.equal(model.frames.length,m*n+1);
  let last=-1;
  const seenPops=new Set();
  for(let i=0;i<model.frames.length;i++){
    const f=model.frames[i];let sum=0,known=0,popped=0;
    assert.equal(new Set(f.heap.map(v=>v.slice(1).join(','))).size,f.heap.length);
    for(let r=0;r<m;r++)for(let c=0;c<n;c++){
      const l=f.levels[r][c];if(l!==null){assert.equal(l,levels[r][c]);sum+=l-h[r][c];known++;}
      if(f.popped[r][c])popped++;
      if(r===0||r===m-1||c===0||c===n-1)assert.equal(l,h[r][c]);
    }
    assert.equal(sum,f.water);assert.equal(popped,i);assert.equal(known,popped+f.heap.length);
    for(const [l,r,c] of f.heap){assert.equal(f.levels[r][c],l);assert.equal(f.popped[r][c],false);}
    if(f.event){const e=f.event,key=e.r+','+e.c;assert(!seenPops.has(key));seenPops.add(key);assert(e.level>=last);last=e.level;
      assert.equal(f.popped[e.r][e.c],true);
      assert.deepEqual(model.frames[i-1].heap[0],[e.level,e.r,e.c]);
      for(const a of e.added){assert.equal(a.level,Math.max(e.level,a.ground));assert.equal(a.depth,a.level-a.ground);assert.equal(model.frames[i-1].levels[a.r][a.c],null);assert.equal(Math.abs(a.r-e.r)+Math.abs(a.c-e.c),1);}
      assert.equal(f.water,model.frames[i-1].water+e.added.reduce((s,a)=>s+a.depth,0));
    }
    frames++;
  }
  assert.deepEqual(model.frames.at(-1).levels,levels);
}
// Verify snapshot independence, deterministic replay and exact source embedding.
const a=trace(presets[0]),b=trace(presets[0]);assert.deepEqual(a,b);a.frames[0].levels[0][0]=999;assert.equal(a.frames[1].levels[0][0],3);
const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'python-code.js'),'utf8'),context);assert.equal(context.window.PYTHON_SOURCE,fs.readFileSync(path.join(root,'solution.py'),'utf8'));
const tree=acorn.parse(fs.readFileSync(path.join(root,'copy.js'),'utf8'),{ecmaVersion:'latest'});
const copyObject=tree.body[1].expression.right,keys=copyObject.properties.map(p=>p.key.name||p.key.value);assert.equal(new Set(keys).size,keys.length,'duplicate localization key');
const copyContext={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'copy.js'),'utf8'),copyContext);for(const pair of Object.values(copyContext.window.COPY)){assert.equal(pair.length,2);assert(pair.every(v=>typeof v==='string'&&v.length));const fields=v=>[...v.matchAll(/\{(\w+)\}/g)].map(x=>x[1]).sort();assert.deepEqual(fields(pair[0]),fields(pair[1]));}
console.log(JSON.stringify({frames_checked:frames,duplicate_keys:'PASS',placeholder_parity:'PASS',snapshots:'PASS'}));
