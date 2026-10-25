'use strict';
const fs=require('fs'), path=require('path'), assert=require('assert/strict'), vm=require('vm');
const root=path.resolve(__dirname,'..'), out=process.env.LESSON_OUTPUT_DIR||path.join(__dirname,'evidence');
fs.mkdirSync(out,{recursive:true});
const C=require('../core.js');let cases=0,states=0;
function check(n,B) {
  const allowed=Array.from({length:n},(_,i)=>i).filter(i=>!B.includes(i));
  const frames=C.trace(n,B), m=allowed.length;
  for(let j=0;j<frames.length;j++) {
    const f=frames[j];states++;
    assert.equal(f.m,m);assert.ok(f.high>=m && f.high<=n);
    const entries=Object.entries(f.remap);
    assert.equal(new Set(entries.map(e=>e[1])).size,entries.length);
    for(const [k,v] of entries){assert.ok(B.includes(+k)&&+k<m);assert.ok(v>=m&&!B.includes(v));assert.ok(v<f.high);}
    const completed=Array.from({length:m},(_,k)=>k).filter(k=>!B.includes(k)||Object.hasOwn(f.remap,k));
    const outputs=completed.map(k=>C.output(f,k));
    assert.equal(new Set(outputs).size,outputs.length);
    assert.ok(outputs.every(v=>allowed.includes(v)));
    if(j){const prev=frames[j-1];assert.ok(f.high>=prev.high);assert.deepEqual(f.log.slice(0,-1),prev.log);
      const e=f.event;
      if(e.kind==='skip'){assert.ok(B.includes(e.old));assert.equal(f.high,prev.high+1);assert.deepEqual(f.remap,prev.remap);}
      if(e.kind==='assign'){assert.equal(e.target,prev.high);assert.equal(f.remap[e.b],e.target);assert.equal(f.high,prev.high+1);}
      if(e.kind==='upper') assert.ok(e.b>=m);
    }
  }
  assert.deepEqual(Array.from({length:m},(_,k)=>C.output(frames.at(-1),k)).sort((a,b)=>a-b),allowed);
  const stable=JSON.stringify(frames);C.trace(n,B);assert.equal(JSON.stringify(frames),stable);
  cases++;
}
for(let n=1;n<=9;n++)for(let mask=0;mask<(1<<n)-1;mask++){
  const B=Array.from({length:n},(_,i)=>i).filter(i=>mask>>i&1);check(n,B);check(n,B.reverse());
}
C.presets.forEach(p=>check(p.n,p.blacklist));
// Exact mirror only, plus dictionary AST duplicate-key detection before evaluation.
const mirror=fs.readFileSync(path.join(root,'python-code.js'),'utf8'), source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
assert.match(mirror,/^window\.PYTHON_SOURCE = "(?:[^"\\]|\\.)*";\n$/);
const ctx={window:{}};vm.runInNewContext(mirror,ctx);assert.equal(ctx.window.PYTHON_SOURCE,source);
const acorn=require('acorn');const copy=fs.readFileSync(path.join(root,'copy.js'),'utf8');
const ast=acorn.parse(copy,{ecmaVersion:'latest'});const props=ast.body[0].expression.right.properties;
const keys=props.map(p=>p.key.name||p.key.value);assert.equal(new Set(keys).size,keys.length);
vm.runInNewContext(copy,ctx);for(const pair of Object.values(ctx.window.LESSON_COPY)){assert.equal(pair.length,2);assert.ok(pair.every(v=>typeof v==='string'&&v));}
const report={status:'pass',cases,intermediateStates:states,copyKeys:keys.length,mirrorExact:true};
fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify(report,null,2)+'\n');console.log(report);
