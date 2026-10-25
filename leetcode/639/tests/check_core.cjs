'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const cases=JSON.parse(fs.readFileSync(path.join(out,'oracle-cases.json'),'utf8'));
const core=require('../core.js');let frames=0;
for(const [s,expected] of Object.entries(cases)){
 const run=core.trace(s);assert.equal(run.frames.at(-1).value,expected,s);
 run.frames.forEach((f,i)=>{frames++;assert.equal(f.i,i);assert.equal(f.value,cases[s.slice(0,i)]);if(i)assert.equal(f.value,(f.one+f.two)%core.MOD);});
 if(s.length>1){const before=JSON.stringify(run.frames[1]);run.frames.at(-1).value=99;assert.equal(JSON.stringify(run.frames[1]),before);}
}
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'copy.js'),'utf8'),ctx);
for(const [key,pair] of Object.entries(ctx.window.LESSON_COPY)){assert(Array.isArray(pair)&&pair.length===2&&pair.every(v=>typeof v==='string'&&v.length),key);assert.deepEqual([...pair[0].matchAll(/\{\w+\}/g)].map(v=>v[0]).sort(),[...pair[1].matchAll(/\{\w+\}/g)].map(v=>v[0]).sort(),key);}
const result={status:'passed',cases:Object.keys(cases).length,frames,copyKeys:Object.keys(ctx.window.LESSON_COPY).length};fs.writeFileSync(path.join(out,'core.json'),JSON.stringify(result,null,2)+'\n');console.log(result);
