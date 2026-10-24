'use strict';
const assert=require('assert'),fs=require('fs'),path=require('path');
const out=process.env.EVIDENCE_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const core=require('../core.js'),cases=JSON.parse(fs.readFileSync(path.join(out,'oracle-cases.json')));
let rounds=0,prefixes=0;
function minGroups(a,B){ // DP by last cut, independent from greedy.
 const dp=[0];for(let end=1;end<=a.length;end++){let sum=0;dp[end]=Infinity;for(let cut=end-1;cut>=0;cut--){sum+=a[cut];if(sum<=B)dp[end]=Math.min(dp[end],dp[cut]+1);}}return dp.at(-1);
}
for(const [a,k,expected] of cases){
 const frames=core.search(a,k);assert.equal(frames.at(-1).lo,expected);
 for(const f of frames){assert(f.lo<=expected&&expected<=f.hi);if(f.event){rounds++;const e=f.event;assert.equal(e.groups.flat().join(),a.join());assert(e.groups.every(g=>g.length&&g.reduce((a,b)=>a+b,0)<=e.mid));assert.equal(e.pass,expected<=e.mid);assert(f.hi-f.lo<e.oldHi-e.oldLo);}}
 // Bound independent DP cost for max-size fixtures; fully test small cases.
 if(a.length>23)continue;
 for(const B of new Set([Math.max(...a),expected,a.reduce((a,b)=>a+b,0)])){
  const scan=core.scan(a,B);for(let i=1;i<scan.length;i++){const f=scan[i];assert.deepEqual(f.groups.flat(),a.slice(0,i));assert(f.groups.every(g=>g.length&&g.reduce((a,b)=>a+b,0)<=B));assert.equal(f.groups.length,minGroups(a.slice(0,i),B));assert.equal(f.sum,f.groups.at(-1).reduce((a,b)=>a+b,0));prefixes++;}
  const saved=JSON.stringify(scan),prior=JSON.stringify(scan.slice(0,-1));scan.at(-1).groups[0][0]=-999;assert.equal(JSON.stringify(scan.slice(0,-1)),prior);assert.equal(JSON.stringify(core.scan(a,B)),saved); // detached snapshots
 }
}
const result={cases:cases.length,rounds,prefixes,intervalInvariant:true,greedyPrefixOptimality:true};fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify(result,null,2));console.log(result);
