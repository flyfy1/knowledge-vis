const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
require('../core.js');
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
function count(s,t){let answer=0;function search(start,word){if(word.length===t.length){if(word===t)answer++;return;}for(let i=start;i<s.length;i++)search(i+1,word+s[i]);}search(0,'');return answer;}
const words=[''];for(let n=1;n<=5;n++)for(let bits=0;bits<2**n;bits++)words.push(Array.from({length:n},(_,i)=>(bits>>i)&1?'a':'b').join(''));
let cases=0,frames=0;
for(const s of words)for(const t of words){
 const run=Subseq115.trace(s,t);assert.equal(run.result,count(s,t));
 for(const f of run.frames){
  for(let j=0;j<f.dp.length;j++){
   const row=f.type==='update'&&j>0&&j<f.j?f.i-1:f.i;
   assert.equal(f.dp[j],count(s.slice(0,row),t.slice(0,j)),JSON.stringify({s,t,f,j}));
  }
  for(let i=0;i<f.rows.length;i++)for(let j=0;j<f.rows[i].length;j++)if(f.rows[i][j]!==null)assert.equal(f.rows[i][j],count(s.slice(0,i),t.slice(0,j)));
  if(f.type==='update'){assert.equal(f.value,f.skip+f.use);assert.equal(f.match,s[f.i-1]===t[f.j-1]);}
  frames++;
 }
 // Check deep snapshots: modifying final state cannot mutate initial state.
 const first=JSON.stringify(run.frames[0]);run.frames.at(-1).dp[0]=99;run.frames.at(-1).rows[0][0]=99;assert.equal(JSON.stringify(run.frames[0]),first);
 cases++;
}
for(const [s,t,v] of [['rabbbit','rabbit',3],['babgbag','bag',5],['ababa','aba',4],['aA','A',1]])assert.equal(Subseq115.trace(s,t).result,v);
for(const [s,t] of [['a!','a'],['a'.repeat(11),'a'],['é','a']])assert.throws(()=>Subseq115.trace(s,t));
const report={status:'passed',cases,frames,checks:'independent position enumeration; every mixed-array invariant and completed table cell; snapshot isolation; examples; input limits'};fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify(report,null,2));console.log(report);
