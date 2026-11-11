const assert=require('assert');global.window={};require('../core.js');const C=window.ArrayIncreasingCore;
for(const p of C.presets){const tr=C.trace(p.a,p.b);assert.strictEqual(tr.answer,C.brute(p.a,p.b));assert.strictEqual(tr.frames.length,p.a.length+1);for(let i=0;i<tr.frames.length;i++)for(const s of tr.frames[i].states)assert(Number.isFinite(s.c));}
console.log('1187 core trace checks passed');
