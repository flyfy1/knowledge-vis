'use strict';
// Browser model vs oracle fixtures [str1, str2, alphabet, expected] from test_solution.py.
// For every true case the model's conversions are replayed independently here: each must be
// legal (rewrite a present letter to a different alphabet letter) and they must end at str2.
const fs=require('fs'),path=require('path'),assert=require('assert');
const C=require('../core.js');
const OUT=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');
const input=fs.fstatSync(0).isFIFO()||fs.fstatSync(0).isFile()?fs.readFileSync(0,'utf8'):'';
const fixtures=JSON.parse(input.trim()?input:fs.readFileSync(path.join(OUT,'oracle-fixtures.json'),'utf8'));
let frames=0,conversions=0,spares=0;
for(const [s,t,alphabet,want] of fixtures){
 assert.equal(C.verdict(s,t,alphabet.length),want,JSON.stringify([s,t,alphabet]));
 const tr=C.trace(s,t,alphabet),last=tr[tr.length-1];
 assert(last.final);assert.equal(last.result,want,JSON.stringify([s,t,alphabet]));
 // The verdict is pending while scanning and fixed from the decision frame on.
 const decided=tr.findIndex(f=>f.result!==null);
 tr.forEach((f,i)=>{if(i<tr.length-1)assert(!f.final);assert.equal(f.result,i<decided?null:want);if(i>=decided&&want&&s!==t)assert(['spareOk','merge','chain','spare'].includes(f.event.type));frames++;});
 if(want&&s!==t){
  let cur=s;
  for(const h of last.history){
   assert(cur.includes(h.from)&&h.from!==h.to&&alphabet.includes(h.to),JSON.stringify(h));
   assert.equal(h.before,cur);cur=cur.split(h.from).join(h.to);assert.equal(h.after,cur);
   if(h.kind==='spare'){spares++;assert(!h.before.includes(h.to));}
   conversions++;
  }
  assert.equal(cur,t);
  // Never more than one conversion per letter of str1 plus one per spare use.
  assert(last.history.length<=new Set(s).size+last.history.filter(h=>h.kind==='spare').length);
 }
 // Deep snapshots.
 if(tr.length>2){const before=JSON.stringify(tr[2]);tr[1].map.zz='q';tr[1].history.push(1);assert.equal(JSON.stringify(tr[2]),before);}
}
// Advertised preset outcomes.
assert.deepStrictEqual(C.presets.map(p=>C.trace(p.s,p.t,p.alphabet).pop().result),[true,true,false,false,true,false,true,false,true]);
const cyc=C.trace('abab','baba').pop().history.map(h=>h.from+'>'+h.to+':'+h.kind);
assert.deepStrictEqual(cyc,['a>c:spare','b>a:chain','c>b:chain']);
const chain=C.trace('abbc','bccd').pop().history.map(h=>h.from+'>'+h.to);
assert.deepStrictEqual(chain,['c>d','b>c','a>b']);
console.log(JSON.stringify({fixtures:fixtures.length,frames,conversionsReplayed:conversions,spareUses:spares}));
