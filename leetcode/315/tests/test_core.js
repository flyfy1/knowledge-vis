const assert=require('assert'); global.window={}; require('../core.js'); const c=window.CountSmallerCore;
for(const a of [[5,2,6,1],[-1],[-1,-1],[2,2],[1,3,2,4,1],[]]) { const tr=c.trace(a); assert.deepStrictEqual(tr.length?tr.at(-1).out:[],c.brute(a)); const bt=c.bitTrace(a); if(a.length) assert.deepStrictEqual(bt.frames.at(-1).answer,c.brute(a)); }
console.log('core ok');
