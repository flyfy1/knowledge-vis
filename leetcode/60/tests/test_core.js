'use strict';
// Run: node leetcode/60/tests/test_core.js. Optional OUTPUT_DIR.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {trace}=require('../core.js');
function* permutations(a){if(!a.length){yield '';return;}for(let i=0;i<a.length;i++)for(const rest of permutations(a.filter((_,j)=>i!==j)))yield a[i]+rest;}
function fact(n){let r=1;while(n)r*=n--;return r;}
function rank(s){return [...s].reduce((r,a,i)=>r+[...s.slice(i+1)].filter(b=>b<a).length*fact(s.length-i-1),0);}
let cases=0,frames=0;
function check(n,k,expected){
 const run=trace(n,k);assert.equal(run.frames.length,n+1);
 if(expected)assert.equal(run.frames.at(-1).prefix,expected);
 assert.equal(rank(run.frames.at(-1).prefix),k-1);
 run.frames.forEach((f,i)=>{
  frames++;assert.equal(f.prefix.length,i);assert.equal(f.unused.length,n-i);
  assert.deepEqual([...f.prefix,...f.unused].sort(),Array.from({length:n},(_,i)=>String(i+1)));
  assert.deepEqual(f.unused,[...f.unused].sort());assert(f.r>=0&&f.r<fact(n-i));
  if(expected)assert(expected.startsWith(f.prefix));
  if(i){const o=f.operation,old=run.frames[i-1];assert.deepEqual(o.before,{unused:old.unused,prefix:old.prefix,r:old.r});
   assert.equal(old.r,o.q*o.block+f.r);assert.equal(o.block,fact(old.unused.length-1));assert.equal(o.digit,old.unused[o.q]);
   assert.equal(f.prefix,old.prefix+o.digit);assert.deepEqual(f.unused,old.unused.filter((_,j)=>j!==o.q));
  }
 });
 const saved=JSON.stringify(run.frames);assert.equal(JSON.stringify(trace(n,k).frames),saved);cases++;
}
for(let n=1;n<=7;n++){let k=1;for(const p of permutations(Array.from({length:n},(_,i)=>String(i+1))))check(n,k++,p);}
let seed=6018;function rng(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;}
for(const n of [8,9]){for(let i=0;i<500;i++)check(n,1+Math.floor(rng()*fact(n)));check(n,1);check(n,fact(n));}
for(let n=2;n<=9;n++)for(let q=1;q<n;q++)for(const k of [q*fact(n-1),q*fact(n-1)+1])check(n,k);
for(const [n,k] of [[0,1],[10,1],[4,0],[4,25],[2.5,1],[3,1.5],[NaN,1]])assert.throws(()=>trace(n,k),RangeError);
const report={type:'author self-check',cases,frames,oracle:'recursive enumeration and independent inversion ranking',result:'pass'};console.log(JSON.stringify(report,null,2));
if(process.env.OUTPUT_DIR){fs.mkdirSync(process.env.OUTPUT_DIR,{recursive:true});fs.writeFileSync(path.join(process.env.OUTPUT_DIR,'core-results.json'),JSON.stringify(report,null,2)+'\n');}
