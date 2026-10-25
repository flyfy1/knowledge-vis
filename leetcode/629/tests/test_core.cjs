'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert'),vm=require('vm'),acorn=require('acorn');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const core=require('../core.js'),hist=JSON.parse(fs.readFileSync(path.join(out,'oracle-cases.json'))).histograms;
const expected=(n,j)=>(hist[n][j]||0),presets=[[3,1],[3,3],[4,5],[4,0],[3,4],[1,0],[5,6]];
let frames=0,transitions=0;
for(let n=1;n<=5;n++)for(let k=0;k<=6;k++){
 const trace=core.trace(n,k);assert.equal(trace.frames.length,1+n*(k+1));assert.equal(trace.result,expected(n,k));
 trace.frames.forEach((f,at)=>{
  frames++;
  for(let row=0;row<=n;row++)for(let col=0;col<=k;col++){
   const done=row===0||row<f.i||(row===f.i&&f.j!==null&&col<=f.j);
   assert.equal(f.table[row][col],done?expected(row,col):null,JSON.stringify({n,k,at,row,col}));
  }
  if(at){
   const prev=f.table[f.i-1],before=trace.frames[at-1];
   assert.equal(f.before,f.j?before.window:0);
   assert.equal(f.add,expected(f.i-1,f.j));assert.equal(f.remove,f.j>=f.i?expected(f.i-1,f.j-f.i):0);
   assert.equal(f.window,prev.slice(f.lo,f.hi+1).reduce((a,b)=>a+b,0));
   assert.equal(f.window,f.before+f.add-f.remove);transitions++;
  }
 });
 // Stored rows must not share mutable backing arrays with other snapshots.
 if(trace.frames.length>2){const before=trace.frames[1].table[0][0];trace.frames[2].table[0][0]=999;assert.equal(trace.frames[1].table[0][0],before);}
}
for(let x=0;x<=2;x++){const v=core.insert(x);assert.equal(v.pairs.length,1+x);assert.equal(v.pairs.filter(p=>p.a===3).length,x);assert(v.pairs.some(p=>p.a===2&&p.b===1));}
assert.equal(core.pairs([3,1,2]).length,2);assert.throws(()=>core.trace(6,0),RangeError);assert.throws(()=>core.insert(3),RangeError);
// Parse before evaluation to detect duplicate keys before silent overwrites.
const copy=fs.readFileSync(path.join(root,'copy.js'),'utf8'),ast=acorn.parse(copy,{ecmaVersion:2022});let pairCount=0;
function walk(node){if(!node||typeof node!=='object')return;if(node.type==='ObjectExpression'){const seen=new Set();for(const prop of node.properties){const key=prop.key.name??prop.key.value;assert(!seen.has(key),'duplicate localization key '+key);seen.add(key);assert.equal(prop.value.type,'ArrayExpression');assert.equal(prop.value.elements.length,2);assert(prop.value.elements.every(x=>x.type==='Literal'&&typeof x.value==='string'&&x.value.length));pairCount++;}}for(const value of Object.values(node)){if(Array.isArray(value))value.forEach(walk);else if(value&&typeof value==='object')walk(value);}}
walk(ast);const sandbox={window:{}};vm.runInNewContext(copy,sandbox);const keys=Object.keys(sandbox.window.LESSON_COPY);assert(pairCount===keys.length);
for(const [key,pair] of Object.entries(sandbox.window.LESSON_COPY)){const params=s=>Array.from(s.matchAll(/\{(\w+)\}/g),m=>m[1]).sort();assert.deepEqual(params(pair[0]),params(pair[1]),key);}
vm.runInNewContext(fs.readFileSync(path.join(root,'python-code.js'),'utf8'),sandbox);assert.equal(sandbox.window.PYTHON_SOURCE,fs.readFileSync(path.join(root,'solution.py'),'utf8'));
const report={status:'PASS',kind:'author bounded simulation and copy checks',frames,transitions,presets,localizationKeys:keys.length,duplicateKeys:0,mirror:'exact'};fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify(report,null,2)+'\n');console.log(report);
