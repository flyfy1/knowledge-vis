'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert'),vm=require('vm');
const root=path.resolve(__dirname,'..'),out=process.env.LESSON_OUTPUT_DIR||path.join(__dirname,'evidence');
const {trace}=require('../core.js');const cases=JSON.parse(fs.readFileSync(path.join(out,'oracle-cases.json')));let frames=0;
for(const {input,expected} of cases){const saved=JSON.stringify(input),m=trace(input);assert.equal(m.frames.at(-1).answer,expected);assert.equal(JSON.stringify(input),saved);
 for(let k=0;k<m.frames.length;k++){const f=m.frames[k];frames++;if(f.kind==='impossible')continue;assert.equal(f.rows.length,k);const balance=input.slice(0,k).reduce((s,x)=>s+x,0)-k*m.target;assert.equal(f.balance,balance);
 let lower=0;for(let j=0;j<k;j++){const prefix=input.slice(0,j+1).reduce((s,x)=>s+x,0)-(j+1)*m.target;lower=Math.max(lower,Math.abs(prefix),input[j]-m.target);const r=f.rows[j];assert.deepEqual(r,{i:j,count:input[j],d:input[j]-m.target,old:prefix-(input[j]-m.target),balance:prefix,answer:lower});}assert.equal(f.answer,lower);}
}
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'python-code.js'),'utf8'),ctx);assert.equal(ctx.window.PYTHON_SOURCE,fs.readFileSync(path.join(root,'solution.py'),'utf8'));
// Detect duplicate definitions BEFORE a JavaScript parser could discard one.
const copy=fs.readFileSync(path.join(root,'copy.js'),'utf8');const keys=[...copy.matchAll(/^  "([^"]+)":/gm)].map(x=>x[1]);assert.equal(keys.length,new Set(keys).size);vm.runInNewContext(copy,ctx);for(const [k,v] of Object.entries(ctx.window.COPY)){assert(Array.isArray(v)&&v.length===2&&v.every(x=>typeof x==='string'&&x.length),k);}
const css=fs.statSync(path.join(root,'style.css')).size+fs.statSync(path.join(root,'../style.css')).size;assert(css<25000);
fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify({cases:cases.length,frames,sourceParity:true,bilingualPairs:keys.length,shippedCssBytes:css},null,2));console.log(`PASS: ${cases.length} core/oracle cases, ${frames} frame invariants, exact source, copy keys, CSS ${css} bytes`);
