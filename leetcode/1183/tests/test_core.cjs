'use strict';
// Browser model vs oracle fixtures [w, h, s, k, expected] from test_solution.py.
const fs=require('fs'),path=require('path'),assert=require('assert');
const C=require('../core.js');
const OUT=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');
const input=fs.fstatSync(0).isFIFO()||fs.fstatSync(0).isFile()?fs.readFileSync(0,'utf8'):'';
const fixtures=JSON.parse(input.trim()?input:fs.readFileSync(path.join(OUT,'oracle-fixtures.json'),'utf8'));
let frames=0,greedyChecked=0,greedyWorse=0;
for(const [w,h,s,k,want] of fixtures){
 assert.equal(C.answer(w,h,s,k),want);
 if(w>C.LIMIT*3||h>C.LIMIT*3)continue;// full traces for the sizes the page can show (and a margin)
 const tr=C.trace(w,h,s,k),last=tr[tr.length-1];
 assert.equal(tr.length,1+s*s+1+k+1);assert(last.final);assert.equal(last.total,want);
 // Every class size equals a direct count of its cells; sizes add up to the grid area.
 const sizes=last.counted;assert.equal(sizes.reduce((t,c)=>t+c.size,0),w*h);
 for(const c of sizes){let n=0;for(let r=0;r<h;r++)for(let x=0;x<w;x++)if(r%s===c.a&&x%s===c.b)n++;assert.equal(c.size,n);}
 // Cumulative total: before + this class = after, and the chosen sizes are the largest ones.
 tr.filter(f=>f.event.type==='pick').forEach(f=>assert.equal(f.event.before+f.event.size,f.event.total));
 const g=C.gridFrom(w,h,s,last.chosen);assert.equal(g.flat().reduce((a,b)=>a+b,0),want);
 const worst=C.worstWindow(g,s);assert(worst.max<=k);
 // Every window holds exactly one cell of every class.
 if(w*h<=400)for(let r=0;r+s<=h;r++)for(let c=0;c+s<=w;c++){const seen=new Set();for(let i=0;i<s;i++)for(let j=0;j<s;j++)seen.add(C.letter((r+i)%s,(c+j)%s,s));assert.equal(seen.size,s*s);}
 if(w*h<=30){const gg=C.greedy(w,h,s,k),ones=gg.flat().reduce((a,b)=>a+b,0);assert(C.worstWindow(gg,s).max<=k);assert(ones<=want);greedyChecked++;if(ones<want)greedyWorse++;}
 if(tr.length>2){const before=JSON.stringify(tr[2]);tr[1].counted.push({});tr[1].chosen.push(9);assert.equal(JSON.stringify(tr[2]),before);}
 frames+=tr.length;
}
// Advertised claims.
assert.deepStrictEqual(C.presets.map(p=>C.answer(p.w,p.h,p.s,p.k)),[12,6,4,12,16,0,1,63]);
assert.equal(C.greedy(5,4,2,2).flat().reduce((a,b)=>a+b,0),10);
assert.equal(C.greedy(3,2,2,2).flat().reduce((a,b)=>a+b,0),3);
assert.deepStrictEqual(C.startWeights(5,2).map(x=>+x.toFixed(6)),[0.333333,0.166667,0.166667,0.333333]);
assert.deepStrictEqual(C.startWeights(4,2),[0.5,0,0.5]);
assert.deepStrictEqual(C.classes(5,4,2).map(c=>c.size),[6,4,6,4]);
console.log(JSON.stringify({fixtures:fixtures.length,frames,greedyChecked,greedyWorse}));
