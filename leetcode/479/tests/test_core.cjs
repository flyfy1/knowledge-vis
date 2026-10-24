'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const C=require('../core.js');
const out=process.env.LESSON_OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
function brute(p,lo,hi){for(let a=lo;a<=hi;a++)for(let b=lo;b<=hi;b++)if(a*b===p)return true;return false;}
let seed=479,checks=0;
function rand(n){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;}
for(let i=0;i<1000;i++){
 const lo=1+rand(15),hi=lo+rand(40),p=1+rand(hi*hi+20),rows=C.probe(p,lo,hi);
 assert.equal(rows.at(-1).kind==='found',brute(p,lo,hi));
 rows.forEach((f,j)=>{if(f.kind==='cutoff'){assert.ok(f.x*f.x<p||f.x<lo);}else{assert.ok(f.x>=lo&&f.x*f.x>=p);assert.equal(f.q*f.x+f.r,p);assert.equal(f.r,p%f.x);if(f.kind==='found')assert.ok(f.q>=lo&&f.q<=hi);}
 if(j)assert.equal(f.x,rows[j-1].x-1);checks++;});
}
for(let length=1;length<=6;length++){
 const half=Math.ceil(length/2);let previous=-1;
 for(let prefix=10**(half-1);prefix<10**half;prefix++){
  const p=C.mirror(prefix,length);assert.equal(String(p),String(p).split('').reverse().join(''));assert.equal(String(p).length,length);assert.ok(p>previous);previous=p;
 }
}
for(let preset=0;preset<3;preset++){
 const frames=C.trace(preset),frozen=JSON.stringify(frames);assert.equal(frames[0].kind,'start');
 for(let i=1;i<frames.length;i++){let a=JSON.stringify(frames[i]);let back=frames[i-1];assert.ok(back);assert.equal(JSON.stringify(frames[i]),a);}
 assert.equal(JSON.stringify(C.trace(preset)),frozen);
}
const full=C.trace(0);assert.equal(full.at(-1).p,9009);assert.equal(full.at(-1).kind,'found');
assert.deepEqual([...new Set(full.slice(1).map(f=>f.p))],[9779,9669,9559,9449,9339,9229,9119,9009]);
assert.equal(C.probe(81,1,9)[0].kind,'found'); // equality square boundary
fs.writeFileSync(path.join(out,'core.json'),JSON.stringify({passed:true,seed:479,randomCases:1000,intermediateChecks:checks,traceEvents:full.length-1},null,2));
console.log('Core passed',checks,'intermediate checks; trace events',full.length-1);
