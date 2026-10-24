const fs=require('fs'),path=require('path'),assert=require('assert'),core=require('../core.js');
const out=path.resolve(process.env.OUTPUT_DIR||path.join(__dirname,'evidence'));fs.mkdirSync(out,{recursive:true});
const cases=JSON.parse(fs.readFileSync(path.join(out,'oracle-cases.json'),'utf8'));let snapshots=0;
for(const [s,answer] of cases){const trace=core.trace(s);assert.equal(trace.answer,answer,s);const original=core.inspect(s).runs;for(const f of trace.frames){let dp=Array(f.spent+1).fill(Infinity);dp[0]=0;for(const r of original){let next=Array(dp.length).fill(Infinity);for(let b=0;b<dp.length;b++)for(let d=0;d<=r.original&&b+d<dp.length;d++)next[b+d]=Math.min(next[b+d],dp[b]+Math.floor((r.original-d)/3));dp=next;}assert.equal(f.R,dp[f.spent],s);assert.equal(f.spent+f.left,f.D);assert.equal(f.R,f.runs.reduce((x,r)=>x+Math.floor(r.length/3),0));snapshots++;}
 const before=JSON.stringify(trace.frames);core.trace('aaaBBBB'+'aB0'.repeat(10));assert.equal(JSON.stringify(trace.frames),before);
}
const result={kind:'author core self-check',cases:cases.length,snapshots,method:'answers compared with edit-distance oracle fixtures; each snapshot compared with exhaustive deletion allocation DP; budget and snapshot isolation checked'};fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify(result,null,2));console.log(result);
