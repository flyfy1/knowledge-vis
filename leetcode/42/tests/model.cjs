'use strict';
const assert = require('node:assert/strict');
const model = require('../../hard-first-ten/core.js')[42];
let inputs=0, frames=0;
function check(a) {
  const before=JSON.stringify(a), depths=a.map((h,i)=>Math.min(Math.max(...a.slice(0,i+1)),Math.max(...a.slice(i)))-h);
  const trace=model(a); assert.equal(trace.result,depths.reduce((x,y)=>x+y,0));
  trace.frames.forEach((f,index)=>{
    frames++;
    assert.equal(f.state.water,f.settled.reduce((x,y)=>x+(y??0),0));
    f.settled.forEach((v,i)=>{if(v!==null)assert.equal(v,depths[i]);if(i<f.state.left||i>f.state.right)assert.notEqual(v,null);});
    if(index>0 && index<trace.frames.length-1) {
      const old=trace.frames[index-1];
      assert.equal(Math.abs(f.state.left-old.state.left)+Math.abs(f.state.right-old.state.right),1);
      assert.equal(f.settled.filter(v=>v!==null).length,old.settled.filter(v=>v!==null).length+1);
    }
  });
  assert.equal(JSON.stringify(a),before); inputs++;
}
for(let n=1;n<=7;n++)for(let k=0;k<3**n;k++){let v=k;const a=Array.from({length:n},()=>{const h=v%3;v=Math.floor(v/3);return h;});check(a);}
[[3,0,2,0,4],[4,2,0,3,2,5],[2,0,1,0,3],[3,0,1],[4,1,3]].forEach(check);
console.log(JSON.stringify({inputs,frames,settledDepths:'passed',pointerMoves:'passed',nonmutation:'passed'}));
