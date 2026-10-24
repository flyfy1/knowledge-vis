const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {trace,presets}=require('../core.js');
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
// Independent word-first recursive oracle. No prefix DP or end/cut loop.
function canBuild(target,words,minPieces=1){
 function visit(s,k){if(!s)return k>=minPieces;return words.some(w=>s.startsWith(w)&&visit(s.slice(w.length),k+1));}
 return visit(target,0);
}
let framesChecked=0,cases=0;
function check(p){
 const frames=trace(p),last=frames.at(-1);let oldCompleted=0;
 assert.equal(last.dp.at(-1),canBuild(p.word,p.words.filter(w=>w!==p.word),2));
 for(let z=0;z<frames.length;z++){
  const f=frames[z];assert.equal(f.log.length,z);assert.equal(f.dp[0],true);assert.ok(f.completed>=oldCompleted);oldCompleted=f.completed;
  for(let i=1;i<=f.completed;i++)assert.equal(f.dp[i],canBuild(p.word.slice(0,i),i===p.word.length?p.words.filter(w=>w!==p.word):p.words));
  for(let i=(f.event?f.event.i:0)+1;i<f.dp.length;i++)assert.equal(f.dp[i],false);
  if(z){const e=f.event,prev=frames[z-1];assert.equal(e.before,prev.dp[e.i]);assert.equal(e.after,f.dp[e.i]);assert.equal(e.source,prev.dp[e.j]);assert.equal(e.piece,p.word.slice(e.j,e.i));
   const expected=e.j===0&&e.i===p.word.length?'self':!prev.dp[e.j]?'unreachable':!p.words.includes(e.piece)?'absent':'witness';assert.equal(e.reason,expected);
   for(let i=0;i<f.dp.length;i++)if(i!==e.i)assert.equal(f.dp[i],prev.dp[i]);
  }
  framesChecked++;
 }
 assert.equal(JSON.stringify(trace(p)),JSON.stringify(frames));
 if(frames.length>2){const before=frames[0].dp[0];frames[1].dp[0]=!before;assert.equal(frames[0].dp[0],before);}
 cases++;
}
presets.forEach(check);
const pool=['a','b','aa','ab','ba','bb'];
for(let mask=1;mask<64;mask++){const words=pool.filter((_,i)=>mask>>i&1);words.forEach(word=>check({word,words}));}
let seed=472;function rand(n){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;}
for(let k=0;k<500;k++){const words=[...new Set(Array.from({length:1+rand(10)},()=>Array.from({length:1+rand(7)},()=>rand(2)?'a':'b').join('')))];check({word:words[rand(words.length)],words});}
const report={kind:'author self-check',cases,framesChecked,independentWordFirstOracle:true,intermediatePrefixInvariants:true,deepSnapshots:true};fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify(report,null,2));console.log(report);
