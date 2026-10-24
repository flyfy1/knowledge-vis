const assert=require('assert'); global.window={}; require('../core.js'); const c=window.CountSmallerCore;
for(const a of [[5,2,6,1],[-1],[-1,-1],[2,2],[1,3,2,4,1],[]]) { const tr=c.trace(a); assert.deepStrictEqual(tr.length?tr.at(-1).out:[],c.brute(a)); const bt=c.bitTrace(a); if(a.length) assert.deepStrictEqual(bt.frames.at(-1).answer,c.brute(a)); }
console.log('core ok');
// Check each trace frame against a suffix oracle, including excluded equals.
for(let n=0;n<=6;n++) {
  for(let mask=0;mask<3**n;mask++) {
    let v=mask; const a=Array.from({length:n},()=>{const x=v%3-1;v=Math.floor(v/3);return x;});
    const expected=a.map((x,i)=>a.filter((y,j)=>j>i&&y<x).length);
    for(const f of c.trace(a)) {
      assert.deepStrictEqual(f.before,a.slice(f.i+1).sort((x,y)=>x-y));
      assert.deepStrictEqual(f.after,a.slice(f.i).sort((x,y)=>x-y));
      assert.equal(f.smaller,expected[f.i]);
      assert.deepStrictEqual(f.out.slice(f.i),expected.slice(f.i));
    }
    for(const f of c.bitTrace(a).frames) {
      assert.equal(f.q,expected[f.i]);
      assert.deepStrictEqual(f.answer.slice(f.i),expected.slice(f.i));
    }
  }
}
console.log('exhaustive intermediate suffix/Fenwick invariants ok');
