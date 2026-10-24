'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {CollectionLesson:{presets,trace}}=require('../core.js');
let checks=0;
const counts=a=>JSON.stringify([...a.reduce((m,v)=>m.set(v,(m.get(v)||0)+1),new Map())].sort((a,b)=>a[0]-b[0]));
function verify(ops){
 const frames=trace(ops),baseline=[];
 assert.equal(frames.length,ops.length+1);
 frames.forEach((f,k)=>{
  if(k){const [op,v]=ops[k-1];if(op==='insert'){assert.equal(f.result,!baseline.includes(v));baseline.push(v);}else if(op==='remove'){const i=baseline.indexOf(v);assert.equal(f.result,i!==-1);if(i!==-1)baseline.splice(i,1);}else{assert(baseline.includes(f.result));assert.equal(f.result,f.before.nums[v]);assert.equal(f.count,baseline.filter(x=>x===f.result).length);assert.deepEqual(f.before,f.after);}}
  assert.equal(counts(f.after.nums),counts(baseline));
  const expected=new Map();f.after.nums.forEach((v,i)=>{if(!expected.has(v))expected.set(v,[]);expected.get(v).push(i);});
  assert.deepEqual(f.after.pos,[...expected].sort((a,b)=>a[0]-b[0]));
  if(k)assert.deepEqual(f.before,frames[k-1].after);
  checks++;
 });
 const frozen=JSON.stringify(frames);trace(ops);assert.equal(JSON.stringify(frames),frozen);
}
presets.forEach(verify);
const alphabet=[['insert',0],['insert',1],['remove',0],['remove',1]];
function enumerate(seq,n){verify(seq);if(n)for(const op of alphabet)enumerate([...seq,op],n-1);}
enumerate([],6);
let seed=381;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;};
for(let k=0;k<150;k++)verify(Array.from({length:100},()=>[rnd()%3?'insert':'remove',(rnd()%7)-3]));
// Catch duplicate translation keys before JavaScript silently overwrites one.
const copy=fs.readFileSync(path.join(__dirname,'../copy.js'),'utf8');
const ast=require('acorn').parse(copy,{ecmaVersion:'latest'});
const names=ast.body.find(n=>n.type==='ExpressionStatement'&&n.expression.type==='AssignmentExpression').expression.right.properties.map(p=>p.key.name||p.key.value);assert.equal(new Set(names).size,names.length);
const context={window:{}};vm.runInNewContext(copy,context);assert.equal(Object.keys(context.window.COPY).length,names.length);for(const pair of Object.values(context.window.COPY))assert(pair.length===2&&pair.every(x=>typeof x==='string'&&x.length));
const css=fs.statSync(path.join(__dirname,'../../style.css')).size+fs.statSync(path.join(__dirname,'../local.css')).size;assert(css<25000);
const report={status:'pass',checks,exhaustive:'all update streams through length 6 over values 0,1',seed:381,seededStreams:150,copyKeys:names.length,cssBytes:css};
console.log(JSON.stringify(report));if(process.env.OUTPUT_DIR){fs.mkdirSync(process.env.OUTPUT_DIR,{recursive:true});fs.writeFileSync(path.join(process.env.OUTPUT_DIR,'core-results.json'),JSON.stringify(report,null,2));}
