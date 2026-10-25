'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),vm=require('vm');
const root=path.resolve(__dirname,'..'),out=process.env.LESSON_OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const core=require('../core.js'),cases=JSON.parse(fs.readFileSync(path.join(out,'oracle-cases.json')));
let frameCount=0;
for(const c of cases){
 const f=core.trace(c.positions);assert.deepEqual(f.at(-1).answer,c.answer);
 for(const s of f){frameCount++;assert.deepEqual(s.answer,c.answer.slice(0,s.landed.length));
   s.landed.forEach((v,i)=>{assert.equal(v.base,c.bases[i]);assert.equal(v.top,c.tops[i]);assert.equal(v.top-v.base,c.positions[i][1]);});
   assert.equal(s.highest,Math.max(0,...s.answer));
   let base=0;
   s.checks.forEach((v,j)=>{const [l,side]=c.positions[j],overlap=Math.min(s.right,l+side)>Math.max(s.left,l);assert.equal(v.j,j);assert.equal(v.top,c.tops[j]);assert.equal(v.overlap,overlap);assert.equal(v.before,base);if(overlap)base=Math.max(base,c.tops[j]);assert.equal(v.after,base);});
   assert.equal(s.base,base);
   if(s.phase==='land'){assert.equal(s.base,c.bases[s.i]);assert.equal(s.top,c.tops[s.i]);}
 }
 // No snapshot aliases, including nested history.
 if(f.length>2){const old=f.at(-1).landed[0].top;f[1].landed[0].top=-99;assert.equal(f.at(-1).landed[0].top,old);}
}
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'python-code.js'),'utf8'),ctx);assert.equal(ctx.window.PYTHON_SOURCE,fs.readFileSync(path.join(root,'solution.py'),'utf8'));
const copy=fs.readFileSync(path.join(root,'copy.js'),'utf8'),matches=[...copy.matchAll(/^  (\w+):/gm)].map(x=>x[1]);
// Also detect inline paired entries; parse the object with Acorn before evaluation.
const acorn=require('acorn'),ast=acorn.parse(copy,{ecmaVersion:'latest'}),obj=ast.body[1].expression.right;
const names=obj.properties.map(p=>p.key.name);assert.equal(new Set(names).size,names.length,'duplicate localization key');
const cp={window:{}};vm.runInNewContext(copy,cp);for(const [k,v]of Object.entries(cp.window.COPY)){assert.equal(v.length,2,k);assert(v.every(x=>typeof x==='string'&&x.length));}
const cssBytes=fs.statSync(path.join(root,'../style.css')).size+fs.statSync(path.join(root,'style.css')).size;assert(cssBytes<25000);
const result={cases:cases.length,intermediateFrames:frameCount,sourceMirrorExact:true,copyKeys:names.length,duplicateKeys:0,cssBytes};fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify(result,null,2));console.log(result);
