'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.resolve(__dirname,'..'),core=require('../core.js'),cases=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
let framesChecked=0;
for(const [s,want] of cases){
 const frames=core.trace(s);assert.equal(frames.at(-1).result,want,s);
 for(let k=0;k<frames.length;k++){
  const f=frames[k];framesChecked++;
  assert.ok(f.i>=0&&f.i<=s.length);assert.ok(f.a<=f.b&&f.b<=s.length);assert.equal(f.token,s.slice(f.a,f.b));
  assert.ok(f.stack.every(name=>/^[A-Z]{1,9}$/.test(name)));
  if(!k){assert.deepEqual(f.stack,[]);continue;}
  const old=frames[k-1];assert.deepEqual(f.before,old.stack);assert.ok(f.i>=old.i);
  if(f.kind==='open'){assert.equal(f.i,f.b);assert.deepEqual(f.stack,[...old.stack,f.name]);}
  else if(f.kind==='close'){assert.equal(old.stack.at(-1),f.name);assert.deepEqual(f.stack,old.stack.slice(0,-1));}
  else assert.deepEqual(f.stack,old.stack);
  if(f.kind==='cdata'){assert.ok(old.stack.length);assert.equal(f.b,s.indexOf(']]>',f.a+9)+3);}
  if(f.kind==='text'){assert.ok(old.stack.length);assert.ok(!f.token.includes('<'));}
  if(f.result===false&&f.kind!=='unfinished')assert.equal(f.i,old.i);
  if(f.result===true){assert.equal(f.i,s.length);assert.deepEqual(f.stack,[]);}
  if(f.result===null&&f.i<s.length&&!f.stack.length){assert.equal(f.kind,'close');assert.equal(frames[k+1].kind,'outside');}
 }
}
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(base,'python-code.js'),'utf8'),ctx);assert.equal(ctx.window.PYTHON_SOURCE,fs.readFileSync(path.join(base,'solution.py'),'utf8'));
// Validate dictionary before JS object parsing can discard duplicate properties.
const copy=fs.readFileSync(path.join(base,'copy.js'),'utf8'),keys=[...copy.matchAll(/(?:^|,)\s*(\w+)\s*:\s*\[/gm)].map(m=>m[1]);assert.equal(keys.length,new Set(keys).size);vm.runInNewContext(copy,ctx);
for(const pair of Object.values(ctx.window.LESSON_COPY)){assert.equal(pair.length,2);pair.forEach(x=>assert.equal(typeof x,'string'));}
const expected=[true,false,true,false,false,false,true,false,true,false];assert.deepEqual(core.presets.map(s=>core.trace(s).at(-1).result),expected);
console.log(JSON.stringify({cases:cases.length,framesChecked,presets:expected.length,sourceMirror:'exact',copyPairs:Object.keys(ctx.window.LESSON_COPY).length}));
