'use strict';
const C=require('../core.js'),fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict'),acorn=require('acorn');
const ROOT=path.resolve(__dirname,'..'),OUT=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(OUT,{recursive:true});
let cases=0,frames=0;
function count(a){const m=new Map();for(const v of a)m.set(v,(m.get(v)||0)+1);return m;}
function check(p){
 const model=C.trace(p),f=model.frames.at(-1),m=count(p.arr.slice(p.left,p.right+1));
 const expected=[...m].find(([v,n])=>n>=p.threshold)?.[0]??-1;assert.equal(f.result,expected);
 let seen=[];
 for(const fr of model.frames){
  if(fr.kind==='block'){
   const [l,r]=model.bounds[fr.id];assert(l>=p.left&&r<=p.right);
   for(let i=l;i<=r;i++){assert(!seen.includes(i));seen.push(i);}
  }
  const votes=seen.map(i=>p.arr[i]),cm=count(votes),[c,b]=fr.summary;
  assert(b>=0&&b<=votes.length);assert.equal((votes.length-b)%2,0);assert(b<=(cm.get(c)||0));
  for(const [v,n]of cm)if(2*n>votes.length){assert.equal(c,v);assert(b>0);}
  if(fr.kind==='verify')assert.equal(fr.count,m.get(c)||0);
  frames++;
 }
 assert.deepEqual(seen.sort((a,b)=>a-b),Array.from({length:p.right-p.left+1},(_,i)=>p.left+i));cases++;
 const hs=C.hand(p.arr);
 for(let k=0;k<hs.length;k++){
  const h=hs[k],all=[...h.survivors,...h.pairs.flat()];assert.equal(all.length,k);assert.equal(new Set(all).size,k);
  assert.deepEqual([...all].sort((a,b)=>a-b),Array.from({length:k},(_,i)=>i));
  for(const [a,b]of h.pairs)assert.notEqual(p.arr[a],p.arr[b]);
  if(h.survivors.length)assert(h.survivors.every(i=>p.arr[i]===p.arr[h.survivors[0]]));
 }
}
for(let n=1;n<=6;n++)for(let code=0;code<3**n;code++){
 let x=code;const arr=Array.from({length:n},()=>{const v=x%3+1;x=Math.floor(x/3);return v;});
 for(let l=0;l<n;l++)for(let r=l;r<n;r++)for(let t=Math.floor((r-l+1)/2)+1;t<=r-l+1;t++)check({arr,left:l,right:r,threshold:t});
}
C.presets.forEach(check);
// Deterministic LCG, separate from production algorithm and Python random suite.
let seed=1157;const rand=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
for(let i=0;i<1000;i++){const arr=Array.from({length:1+rand(100)},()=>1+rand(10)),left=rand(arr.length),right=left+rand(arr.length-left),min=Math.floor((right-left+1)/2)+1;check({arr,left,right,threshold:min+rand(right-left+2-min)});}
const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(path.join(ROOT,'python-code.js'),'utf8'),sandbox);assert.equal(sandbox.window.PYTHON_SOURCE,fs.readFileSync(path.join(ROOT,'solution.py'),'utf8'));
const copy=fs.readFileSync(path.join(ROOT,'copy.js'),'utf8'),ast=acorn.parse(copy,{ecmaVersion:'latest'});
function walk(n){if(!n||typeof n!=='object')return;if(n.type==='ObjectExpression'){const keys=n.properties.map(p=>p.key.name??p.key.value);assert.equal(new Set(keys).size,keys.length,'duplicate copy keys');}for(const value of Object.values(n))if(Array.isArray(value))value.forEach(walk);else if(value&&typeof value==='object')walk(value);}
walk(ast);vm.runInNewContext(copy,sandbox);for(const [key,pair]of Object.entries(sandbox.window.LESSON_COPY))assert(pair.length===2&&pair.every(v=>typeof v==='string'&&v.length),key);
const result={kind:'author self-check',status:'pass',cases,frames,sourceMirror:'exact',copyKeys:Object.keys(sandbox.window.LESSON_COPY).length,duplicateKeys:'AST checked',coverage:'ternary arrays n<=6 all legal ranges/thresholds; 1000 seeded cases; actual position/pair witnesses; disjoint cover; intermediate majority preservation'};
fs.writeFileSync(path.join(OUT,'core-results.json'),JSON.stringify(result,null,2)+'\n');console.log(result);
