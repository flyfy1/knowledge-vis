'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const context={};vm.createContext(context);vm.runInContext(fs.readFileSync('leetcode/hard-first-ten/core.js','utf8'),context);
const model=context.HardModels[4],arrays=[[]];
function extend(a,n){if(!n)return;for(const v of [-3,-1,0,2])if(!a.length||v>=a.at(-1)){const b=[...a,v];arrays.push(b);extend(b,n-1)}}extend([],4);
let cases=0,frames=0,directions=new Set();
for(const a of arrays)for(const b of arrays){if(!a.length&&!b.length)continue;
 const input=[a.slice(),b.slice()],before=JSON.stringify(input),merged=[...a,...b].sort((x,y)=>x-y),expected=(merged[(merged.length-1)>>1]+merged[merged.length>>1])/2;
 const trace=model(input);assert.equal(trace.result,expected);assert.equal(JSON.stringify(input),before);
 const [short,long]=a.length<=b.length?[a,b]:[b,a],half=Math.ceil(merged.length/2);
 const bounds=i=>[i?short[i-1]:-Infinity,i<short.length?short[i]:Infinity,half-i?long[half-i-1]:-Infinity,half-i<long.length?long[half-i]:Infinity];
 const valid=[];for(let i=0;i<=short.length;i++){const [al,ar,bl,br]=bounds(i);if(al<=br&&bl<=ar)valid.push(i)}
 let previous=trace.frames[0].state;
 for(const f of trace.frames.slice(1)){const {i,j,lo,hi}=f.state;assert.equal(i+j,half);assert(j>=0&&j<=long.length);assert(i>=previous.lo&&i<=previous.hi);assert(valid.some(x=>x>=lo&&x<=hi));
  const [al,ar,bl,br]=bounds(i);
  if(al>br){assert.equal(hi,i-1);assert.equal(lo,previous.lo);directions.add('decrease')}
  else if(bl>ar){assert.equal(lo,i+1);assert.equal(hi,previous.hi);directions.add('increase')}
  else assert.equal(f.result,expected);
  previous=f.state;frames++;
 }
 cases++;
}
assert.equal(directions.size,2);
const result={cases,frames,directions:[...directions],checks:'independent sorted-rank oracle, legal cuts, retained valid cut, both interval updates, immutable inputs'};
fs.writeFileSync('leetcode/4/evidence/model-results.json',JSON.stringify(result,null,2)+'\n');console.log(result);
