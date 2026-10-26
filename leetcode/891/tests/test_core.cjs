const assert=require('assert'),fs=require('fs'),path=require('path'),core=require('../core.js');
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
let traces=0,frames=0,groups=0;
function check(a){
 const got=core.trace(a),sorted=[...a].sort((x,y)=>x-y),n=a.length;
 const max=Array(n).fill(0),min=Array(n).fill(0),maxValue=Array(n).fill(0),minValue=Array(n).fill(0);let sum=0;
 for(let mask=1;mask<2**n;mask++){
  const indices=sorted.map((_,j)=>j).filter(j=>mask&(1<<j)),values=indices.map(j=>sorted[j]);
  const lo=indices[0],hi=indices.at(-1);max[hi]++;min[lo]++;maxValue[hi]+=Math.max(...values);minValue[lo]+=Math.min(...values);sum+=Math.max(...values)-Math.min(...values);
 }
 assert.equal(got.result,sum);assert.deepEqual(got.a,sorted);let acc=0;
 got.rows.forEach((r,i)=>{
  assert.equal(r.maxCount,max[i]);assert.equal(r.minCount,min[i]);assert.equal(r.delta,maxValue[i]-minValue[i]);assert.equal(r.before,acc);acc+=r.delta;assert.equal(r.after,acc);frames++;
  for(const isMax of [true,false]){
   const sets=core.groups(sorted,i,isMax),expected=isMax?max[i]:min[i];assert.equal(sets.length,expected);assert.equal(new Set(sets.map(s=>s.join(','))).size,expected);
   for(const s of sets){assert(s.includes(i));assert.equal(isMax?Math.max(...s):Math.min(...s),i);groups++;}
  }
 });traces++;
}
function enumerate(a,n){if(!n){check(a);return;}for(let v=1;v<=3;v++)enumerate([...a,v],n-1);}
for(let n=1;n<=7;n++)enumerate([],n);
core.presets.forEach(check);
let seed=891;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};
for(let k=0;k<100;k++)check(Array.from({length:1+Math.floor(random()*9)},()=>1+Math.floor(random()*100000)));
const report={result:'pass',traces,frames,expandedGroups:groups,independent:'enumerated subset owners and actual extrema, exhaustive n<=7 values1..3, seeded random and presets'};
fs.writeFileSync(path.join(out,'core-result.json'),JSON.stringify(report,null,2));console.log(report);
